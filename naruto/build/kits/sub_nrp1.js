// ===== Subjutsu (ninjas sans clan) : techniques de ninjas célèbres =====
// Rashômon (Orochimaru), Sôshôryû (Tenten), Multiclonage de shuriken (Hiruzen), Chiens ninja et Raikiri (Kakashi), Argile explosive (Deidara).
// Utilise les aides de kits/sub.js (subFree, subPoof, subWarn, subIdx, subKunai, SUBK), chargé juste avant.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('u',[
 [4,'B','x.sub_rasho','Rashômon','Invoque un portail géant devant toi 2 s : il arrête tous les tirs et bloque le passage, des deux côtés ; en surgissant du sol, il blesse et repousse','smoke'],
 [3,'A','x.sub_soryu','Sôshôryû','Deux parchemins s\'élèvent en dragons jumeaux : une pluie d\'armes s\'abat 1 s sur la zone visée (jusqu\'à 40 dégâts) et ralentit','kunai'],
 [1,'C','x.sub_kshu','Multiclonage de shuriken','Lance un shuriken qui se multiplie en éventail de 12 : plus l\'ennemi est proche, plus il en prend (4 au plus) ; à partir du 3e, il est ralenti','shuriken'],
 [3,'B','x.sub_dogs','Chiens ninja','La meute creuse sous l\'ennemi visé et jaillit du sol 0,6 s plus tard : morsures (16) et entravé 1,2 s ; s\'éloigner à temps permet d\'y échapper','claws'],
 [1,'S','x.sub_raiki','Raikiri','Charge la foudre au poing 0,4 s puis fonce en ligne droite : transperce le 1er ennemi (34 dégâts, étourdi 0,4 s) et blesse les suivants ; ×1,35 sur une cible trempée','lightning'],
 [3,'B','x.sub_clay','Argile explosive','Lâche 3 oiseaux d\'argile qui poursuivent les ennemis et explosent au contact ; relance : « Katsu ! », ils explosent tous aussitôt','tag'],
]);
// ---------- aides ----------
const subS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son sans la couleur sonore de l'élément
const SUB_RT=2.2,SUB_RH=118; // Rashômon : durée des blocs, hauteur du portail
const subRashoV=v=>v==='sub_rasho'||v==='sub_rashoC';
// Sôshôryû : 36 armes, lancées l'une après l'autre ; point de chute (décalage fixe par indice, identique chez l'hôte et les invités)
const SUB_SN=36,SUB_ST0=.45,SUB_SDT=.03,SUB_SFL=.32;
function subSoOff(i,r){const b=i*2.39996,d=r*.92*Math.sqrt((((i*23)%SUB_SN)+.5)/SUB_SN);return[Math.cos(b)*d,Math.sin(b)*d]}
Object.assign(NAT,{
 // --- Rashômon : 7 blocs du moteur (arrêtent les ennemis et leurs tirs) + objet qui arrête aussi les tirs alliés, les boomerangs, et bloque les alliés
 sub_rasho:S_('Rashômon','Portail géant qui bloque tirs et passage 2 s',13,{ai:DEF},(u,a)=>{const c=subFree(fwd(u,a,82),24),ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca,SPc=30;
  anim(u,'sub_rasho',.6);subS('heavy',u);subS('rock',u);say(u,'RASHÔMON !','#c8b8e0');
  // le bloc central (visage du démon) est ajouté en dernier : à profondeur égale, il est dessiné par-dessus ses voisins
  for(const i of[-3,-2,-1,1,2,3,0])walls.push({x:c.x+px*i*SPc,y:c.y+py*i*SPc,r:19,t:SUB_RT,team:u.team,owner:u,vfx:i?'sub_rasho':'sub_rashoC'});
  for(const e of units){if(e.dead||e===u)continue;const dx=e.x-c.x,dy=e.y-c.y,f=dx*px+dy*py,s=dx*ca+dy*sa;if(Math.abs(f)>SPc*3+19+e.r||Math.abs(s)>26+e.r)continue;const sg=s>=0?1:-1;
   if(e.team!==u.team)hit(e,u,12,{kb:320,fx:e.x-ca*sg*40,fy:e.y-sa*sg*40,unblockable:1});else if(e.unstop<=0){e.kx+=ca*sg*260;e.ky+=sa*sg*260}}
  aux.push({type:'sub_rasho',x:c.x,y:c.y,a:a+Math.PI/2,len:SPc*6+38,r:0,t:SUB_RT,m:SUB_RT,team:u.team,owner:u});
  jx({jfx:'sub_rashoin',x:c.x,y:c.y,a:a+Math.PI/2,r:115,t:.75,m:.75});subPoof(c.x,c.y,70,u);if(near(c.x,c.y)){subS('boom',u);shake=Math.max(shake,.3)}}),
 // --- Sôshôryû : deux rouleaux en hélice autour de Tenten, puis une pluie d'armes sur la zone (8 vagues de 5, ralentissent)
 sub_soryu:S_('Sôshôryû','Pluie d\'armes sur la zone',12,{tele:{r:130,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=subFree(atP(u,a,td,420),20),T=1.9;anim(u,'sub_soryu',1.1);subS('wind',u);subS('poof',u);
  u.root=Math.max(u.root,.4);jx({jfx:'sub_twin',ui:units.indexOf(u),x:u.x,y:u.y,x2:p.x,y2:p.y,r:130,t:T,m:T});
  aux.push({type:'sub_soryu',x:p.x,y:p.y,r:130,t:T,m:T,team:u.team,owner:u,k:SUB_ST0+SUB_SFL,n:0,danger:1,z:subWarn(u,p.x,p.y,130,SUB_ST0+SUB_SFL,'kunai')})}),
 // --- Multiclonage de shuriken : un shuriken qui éclate en éventail de 12 clones au bout de 0,2 s (ou sur le 1er ennemi touché)
 sub_kshu:S_('Multiclonage de shuriken','Shuriken qui se multiplie en éventail',8,{line:{len:420,w:110},ai:RG(380,.65)},(u,a)=>{u.thrT=.2;anim(u,'sub_kshu',.5);subS('saber',u);
  proj(u,a,{spd:720,r:11,dmg:6,life:.6,col:'#c8ccd4',kind:'sub_kbig'});aux.push({type:'sub_kshu',x:u.x,y:u.y,a,r:0,t:1.2,m:1.2,team:u.team,owner:u,p:projs[projs.length-1],G:new Map(),n:0})}),
 // --- Chiens ninja (Tsuiga) : la meute creuse vers la cible (elle la suit lentement 0,6 s), puis jaillit et l'entrave
 sub_dogs:S_('Chiens ninja','La meute jaillit du sol et entrave l\'ennemi',12,{tele:{r:44,max:440},ai:RG(430,.55,60)},(u,a,td)=>{const e=pick(u,a,td||300,460),p=e?{x:e.x,y:e.y}:subFree(atP(u,a,td,440),20);
  anim(u,'sub_dogs',.7);subS('poof',u);subS('rock',u);jx({jfx:'sub_dogcall',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.7,m:.7});
  aux.push({type:'sub_dig',x:p.x,y:p.y,r:44,t:.6,m:.6,team:u.team,owner:u,tg:e,ti:e?units.indexOf(e):undefined,danger:1,n:0})}),
 // --- Raikiri : incantation 0,4 s (foudre au poing), puis ruée qui traverse : le 1er ennemi est transpercé, les suivants blessés
 sub_raiki:S_('Raikiri','Ruée de foudre qui transperce le 1er ennemi',12,{cast:.4,line:{len:400,w:40},ai:{mode:'gap',min:80,max:360,p:.6}},(u,a,td)=>{const d=clamp((td||300)+80,180,400),e=fwd(u,a,d),dur=d/1500;
  subS('chidori',u);subS('dash',u);anim(u,'sub_raiki',.45);say(u,'RAIKIRI !','#bfe6ff');dash(u,a,d,dur,{through:1});
  aux.push({type:'sub_raiki',x:u.x,y:u.y,a,r:0,t:dur+.1,m:dur+.1,team:u.team,owner:u,ui:units.indexOf(u),hs:new Set(),n:0});
  jx({jfx:'sub_raitrail',x:u.x,y:u.y,x2:e.x,y2:e.y,d:dur,t:.6,m:.6})}),
 // --- Argile explosive (C1) : 3 oiseaux lents qui traquent ; relance (gratuite, 3,3 s) : tous explosent
 sub_clay:S_('Argile explosive','Oiseaux d\'argile qui traquent et explosent',11,{ai:RG(460,.55,80)},(u,a,td)=>{const i=subIdx(u,'sub_clay'),cd=u.ch.abil[i].cd;
  if(u.jst&&u.jst.key==='sub_clay'){const B=[];for(const o of aux)if(o.type==='sub_clay'&&o.owner===u)for(const p of o.L)if(!p.dead&&p.life>0)B.push(p);
   // bot : ne fait sauter les oiseaux que s'ils frôlent un ennemi (sinon ils continuent leur traque)
   if(!u.ctrl&&!B.some(p=>enemies(u).some(e=>Math.hypot(e.x-p.x,e.y-p.y)<85+e.r))){u.cds[i]=.3;return}
   u.jst=null;u.cds[i]=cd;for(const p of B){p.life=0;p.kat=1}say(u,'KATSU !','#ffe0a0');anim(u,'sub_katsu',.35);subS('blaster',u);return}
  anim(u,'sub_clay',.55);subS('poof',u);jx({jfx:'sub_claymouth',ui:units.indexOf(u),x:u.x,y:u.y,t:.5,m:.5});
  const c=atP(u,a,td,460),E=enemies(u).filter(e=>!(e.stealth>0&&dist(u,e)>140)).sort((p,q)=>Math.hypot(p.x-c.x,p.y-c.y)-Math.hypot(q.x-c.x,q.y-c.y)),L=[];
  for(let k=0;k<3;k++){proj(u,a+(k-1)*.6,{spd:310,r:10,dmg:0,o:{silent:1},life:3.2,col:'#f4efe4',vfx:'sub_clay',kind:'sub_cbird',noClash:1});const p=projs[projs.length-1];p.tg=E.length?E[k%Math.min(E.length,3)]:null;p.cb=.22;L.push(p)}
  aux.push({type:'sub_clay',x:u.x,y:u.y,r:0,t:3.4,m:3.4,team:u.team,owner:u,L,i,cd});if(u.jst&&u.jst.key!=='sub_clay')u.cds[u.jst.i]=u.jst.cd;u.jst={key:'sub_clay',i,n:1,t:3.3,cd,v:'tag'};u.cds[i]=.35}),
});
// ---------- logique des objets (hôte) ----------
// Rashômon : les tirs alliés (et tous les boomerangs) qui franchissent le portail s'y brisent ; les alliés ne passent pas non plus
AUXF.sub_rasho=(x,dt)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),h=x.len/2,nx=-sa,ny=ca;
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||(p.owner.team!==x.team&&!p.ret))continue;const dx=p.x-x.x,dy=p.y-x.y,f=dx*ca+dy*sa;if(Math.abs(f)>h+p.r)continue;
  const s0=dx*nx+dy*ny,s1=s0+(p.vx*nx+p.vy*ny)*dt;if(Math.abs(s0)<12+p.r||s0*s1<0){p.life=0;p.dead=1;p.boom=1;if(near(p.x,p.y)){sparks(p.x,p.y,'#c8b8e0',7);S('deflect',p)}}}
 for(const e of units){if(e.dead||e.team!==x.team)continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa;if(Math.abs(f)>h+e.r)continue;const s=dx*nx+dy*ny,m=19+e.r;
  if(Math.abs(s)<m){const sg=s>=0?1:-1;e.x+=nx*sg*(m-Math.abs(s));e.y+=ny*sg*(m-Math.abs(s));collide(e)}}};
// Sôshôryû : 8 vagues (toutes les 0,15 s) après la première chute d'armes
AUXF.sub_soryu=x=>{if(x.z&&x.m-x.t>=SUB_ST0+SUB_SFL-.02){x.z.done=1;x.z=null}if(x.k>0||x.n>=8)return;x.k=.15;x.n++;const o=x.owner;
 const V=VFX;VFX='kunai';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)hit(e,o,5,{slow:.5,unblockable:1});VFX=V;if(near(x.x,x.y)&&x.n%2)S('saber',x)};
// shuriken : au bout de 0,2 s (ou sur le 1er ennemi touché) il éclate en 12 ; chaque ennemi prend 4 clones au plus (7 puis 3 chacun)
AUXF.sub_kshu=x=>{const p=x.p;if(x.n||!p)return;const alive=!p.dead&&p.life>0;
 if(alive){x.x=p.x;x.y=p.y;if(p.life0-p.life<.2)return;p.life=0;p.dead=1;p.boom=1}else if(!p.hitAny){x.t=0;return}
 x.n=1;x.t=.5;const o=x.owner,b=Math.atan2(p.vy,p.vx),X=p.x-Math.cos(b)*8,Y=p.y-Math.sin(b)*8;subPoof(X,Y,30,o);jx({jfx:'sub_kfan',x:X,y:Y,a:b,t:.3,m:.3});
 for(let i=0;i<12;i++){const c=b+(i-5.5)*(1.1/11);projs.push({x:X+Math.cos(c)*6,y:Y+Math.sin(c)*6,vx:Math.cos(c)*680,vy:Math.sin(c)*680,owner:o,src:o,rot:i,r:6,dmg:0,life:.42,life0:.42,col:'#d8dde6',vfx:'sub_kmini',kind:'sub_kmini',jn:'Multiclonage de shuriken',ex:false,basic:false,hitSet:null,o:{silent:1},
  onHit:(q,t)=>{const n=x.G.get(t)||0;if(n>=4||t.dead)return;x.G.set(t,n+1);hit(t,o,n?3:7,n>=2?{slow:.7}:{})}})}};
// Chiens ninja : le terrier suit la cible à 105 px/s ; à 0,6 s, la meute jaillit : le plus proche du centre est mordu et entravé
AUXF.sub_dig=(x,dt)=>{if(x.n)return;const e=x.tg,o=x.owner;
 if(e&&!e.dead&&x.t>0){const dx=e.x-x.x,dy=e.y-x.y,d=Math.hypot(dx,dy);if(d>1){const s=Math.min(d,105*dt);x.x+=dx/d*s;x.y+=dy/d*s}return}if(x.t>0)return;x.n=1;
 const C=[];for(const v of enemies(o)){const d=Math.hypot(v.x-x.x,v.y-x.y);if(d<x.r+v.r*.6&&!(v.phase>0))C.push([d,v])}C.sort((p,q)=>p[0]-q[0]);let m=null;
 const V=VFX;VFX='claws';if(C.length&&hit(C[0][1],o,16,{root:1.2,unblockable:1}))m=C[0][1];for(const [,v] of C.slice(1))hit(v,o,8,{slow:.8,unblockable:1});VFX=V;
 if(m)say(m,'CHIENS NINJA !','#e8c890');aux.push({type:'sub_dhole',x:x.x,y:x.y,r:44,t:1.4,m:1.4,team:x.team});
 jx({jfx:'sub_dogs',x:x.x,y:x.y,ti:m?units.indexOf(m):undefined,a:o.aim||0,t:m?1.3:.6,m:m?1.3:.6});sparks(x.x,x.y,'#8a6a48',12,'earth');
 if(near(x.x,x.y)){S('rock',o);S('hit',o);shake=Math.max(shake,.16)}};
AUXF.sub_dhole=()=>{};
// Raikiri : pendant la ruée, le 1er ennemi rencontré est transpercé, les suivants blessés (chacun une seule fois)
AUXF.sub_raiki=x=>{const u=x.owner;if(u.dead){x.t=0;return}x.x=u.x;x.y=u.y;
 for(const e of enemies(u)){if(x.hs.has(e)||e.phase>0||Math.hypot(e.x-u.x,e.y-u.y)>u.r+e.r+14)continue;x.hs.add(e);const V=VFX;VFX='lightning';
  if(!x.n){if(hit(e,u,34,{melee:1,unblockable:1,stun:.4,fx:u.x,fy:u.y})){x.n=1;say(e,'TRANSPERCÉ','#bfe6ff');jx({jfx:'sub_raihit',ti:units.indexOf(e),x:e.x,y:e.y,a:x.a,t:.55,m:.55});
   if(near(e.x,e.y)){S('boom',u);S('chidori',u);shake=Math.max(shake,.35)}if(u===player||e===player)hs=Math.max(hs,.1)}}
  else hit(e,u,14,{melee:1,unblockable:1,slow:.8});VFX=V}
 if(!u.dash)x.t=0};
// Argile explosive : les oiseaux tournent vers leur proie (2,8 rad/s) ; chaque explosion (contact, relance, fin de vol) a son nuage
function subClayBoom(p){const o=p.owner,V=VFX;VFX='sub_clay';aoe(o,p.x,p.y,62,9,{kb:180,unblockable:1,quiet:1},'#ffe0b0');VFX=V;jx({jfx:'sub_cboom',x:p.x,y:p.y,r:62,t:.65,m:.65});
 if(near(p.x,p.y)){sparks(p.x,p.y,'#f4efe4',14);S('boom',o);shake=Math.max(shake,.18)}}
AUXF.sub_clay=(x,dt)=>{const u=x.owner;let alive=0;
 for(const p of x.L){if(p.dead||p.life<=0){if(!p.cbD){p.cbD=1;subClayBoom(p)}continue}alive++;
  if((p.cb-=dt)>0)continue;let e=p.tg;if(!e||e.dead){e=null;let bd=520;for(const v of enemies(u)){const d=Math.hypot(v.x-p.x,v.y-p.y);if(d<bd&&!(v.stealth>0&&d>140)){bd=d;e=v}}p.tg=e}
  if(e){const cur=Math.atan2(p.vy,p.vx);let df=Math.atan2(e.y-p.y,e.x-p.x)-cur;df=Math.atan2(Math.sin(df),Math.cos(df));const na=cur+clamp(df,-2.8*dt,2.8*dt),sp=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp}}
 if(alive)return;const el=x.m-x.t;x.t=0;if(u.jst&&u.jst.key==='sub_clay'){u.cds[u.jst.i]=u.jst.cd;u.jst=null}else if(u.ch.abil[x.i]&&u.ch.abil[x.i].key==='sub_clay')u.cds[x.i]=Math.max(u.cds[x.i],x.cd-el)};
// Raikiri : pendant l'incantation, le ninja garde la pose (l'animation est synchronisée : les invités voient la foudre au poing)
AFTER.push(()=>{const T=TRAITS[-1];if(!T)return;const U0=T.update;T.update=function(u,dt){if(U0)U0.call(this,u,dt);const ab=u.cast&&castAb(u,u.cast);
 if(ab&&ab.key==='sub_raiki'){if(!u.cast.sbS){u.cast.sbS=1;S('chidori',u)}if(!u.anim||u.anim.k!=='sub_raiw')u.anim={k:'sub_raiw',t:.5,m:.5}}else if(u.anim&&u.anim.k==='sub_raiw')u.anim=null}});
// Rashômon : dessin des blocs du portail (chaque bloc dessine sa part : tri en profondeur correct, même en biais)
AFTER.push(()=>{const D0=drawWallN;drawWallN=w=>subRashoV(w.vfx)?subRashoSeg(w):D0(w)});
// les 12 clones de shuriken et les oiseaux d'argile n'éclairent pas le sol (12 halos superposés éblouiraient) ; pas de traînée générique
AFTER.push(()=>{DARKV.sub_kmini=DARKV.sub_clay=1;NOTRAIL.sub_kmini=NOTRAIL.sub_clay=1});
// ---------- visuels ----------
// --- Rashômon
function subRashoSeg(w){const age=SUB_RT-w.t,rise=ezo(Math.min(1,age/.22)),end=Math.min(1,w.t/.3),H=SUB_RH*rise*end,t=performance.now()/1000;if(H<2)return true;
 let n1=null,n2=null,C=null,cd=1e9;for(const q of walls){if(q.team!==w.team||!subRashoV(q.vfx))continue;const ddx=q.x-w.x,ddy=q.y-w.y;if(Math.abs(ddx)>110||Math.abs(ddy)>110)continue;const d=Math.hypot(ddx,ddy);
  if(q.vfx==='sub_rashoC'&&d<cd){cd=d;C=q}if(q!==w&&d<40){if(!n1)n1=q;else if(!n2)n2=q}}
 let dx=1,dy=0;if(n1&&n2){dx=n2.x-n1.x;dy=n2.y-n1.y}else if(n1){dx=n1.x-w.x;dy=n1.y-w.y}const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;if(dy<0||(dy===0&&dx<0)){dx=-dx;dy=-dy}let nx=-dy,ny=dx;if(ny<0||(ny===0&&nx<0)){nx=-nx;ny=-ny}
 // vue de 3/4 : un portail orienté nord-sud ne montre que son dessus et son bout sud ; on l'épaissit pour qu'il reste massif et lisible
 const ady=Math.abs(dy),hl=15,hw=10+14*ady,c=(a,b,z)=>P(w.x+dx*a+nx*b,w.y+dy*a+ny*b,z),O=SUBK[0],open=!n1?2:!n2?((n1.x-w.x)*dx+(n1.y-w.y)*dy>0?-1:1):0;
 // le joueur local caché derrière le portail le voit en transparence
 let al=1;if(player&&!player.dead&&Math.abs(player.x-w.x)<hl+hw+16&&player.y<w.y&&w.y-player.y<170)al=.45;
 g.save();g.globalAlpha*=al;g.lineJoin='round';
 poly([c(-hl,-hw-4,0),c(hl,-hw-4,0),c(hl,hw+16,0),c(-hl,hw+16,0)],'rgba(0,0,0,.24)');
 const F=(a0,a1,z0,z1,col,b=hw)=>poly([c(a0,b,z0),c(a1,b,z0),c(a1,b,z1),c(a0,b,z1)],col),E=(a,b0,b1,z0,z1,col)=>poly([c(a,b0,z0),c(a,b1,z0),c(a,b1,z1),c(a,b0,z1)],col);
 const line=(pts,col,w0)=>{g.strokeStyle=col;g.lineWidth=w0;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke()};
 // tranche sud du bloc (visible quand le portail est de biais ou nord-sud ; le bloc suivant la recouvre, sauf au bout)
 if(ady>.03){E(hl,-hw,hw,0,H,'#4e4262');E(hl,-hw,hw,0,Math.min(H,13),'#3a3248');for(const zb of[.24,.62])E(hl,-hw-.5,hw+.5,H*zb,H*zb+6,'#2a2234');
  if(open===1||open===2){line([c(hl,-hw,0),c(hl,-hw,H),c(hl,hw,H),c(hl,hw,0)],O,1.6);
   // bout sud d'un portail nord-sud : c'est la face qu'on voit, elle porte le visage du démon
   if(ady>=.85){const Oq=c(hl,0,H*.5),E1=c(hl,1,H*.5),k=hw/40;g.save();g.translate(Oq.x,Oq.y);g.transform(E1.x-Oq.x,E1.y-Oq.y,0,Oq.s*H/SUB_RH,0,0);g.scale(k,k*.95);subOni(t,Math.min(1,age/.35));g.restore()}}}
 const q0=c(-hl,hw,0),q1=c(hl,hw,0),q2=c(hl,hw,H),q3=c(-hl,hw,H);
 // battants de bois sombre, socle de pierre, ferrures et clous dorés
 F(-hl,hl,0,H,'#5e5072');F(-hl,hl,0,Math.min(H,13),'#463c58');
 g.save();g.beginPath();g.moveTo(q0.x,q0.y);g.lineTo(q1.x,q1.y);g.lineTo(q2.x,q2.y);g.lineTo(q3.x,q3.y);g.closePath();g.clip();
 g.strokeStyle='rgba(30,20,40,.45)';g.lineWidth=1.2;for(const a of[-hl+7.5,hl-7.5]){const A=c(a,hw,14),Bq=c(a,hw,H);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke()}
 for(const zb of[.24,.62]){const z=H*zb;F(-hl-1,hl+1,z,z+6,'#2a2234');for(const a of[-7.5,7.5]){const s=c(a,hw,z+3);circ(s.x,s.y,2*s.s,'#e0b84a');circ(s.x-.5*s.s,s.y-.6*s.s,.8*s.s,'#fff0b0')}}
 // visage du démon gravé au centre (dessiné par morceaux : chaque bloc ne peint que sa face)
 if(C&&ady<.85){const ac=(C.x-w.x)*dx+(C.y-w.y)*dy,zc=H*.5,Oq=c(ac,hw,zc),E1=c(ac+1,hw,zc);g.translate(Oq.x,Oq.y);g.transform(E1.x-Oq.x,E1.y-Oq.y,0,Oq.s*H/SUB_RH,0,0);subOni(t,Math.min(1,age/.35))}
 g.restore();line([q0,q3],O,1.6);line([q1,q2],O,1.6);
 // poutre laquée rouge et toit de tuiles à deux pans (avant-toits qui débordent)
 F(-hl,hl,H,H+7,'#b8362a',hw+2);line([c(-hl,hw+2,H+7),c(hl,hw+2,H+7)],O,1.3);
 const rb=hw+12,R=c,bk=[R(-hl,-rb,H+6),R(hl,-rb,H+6),R(hl,0,H+24),R(-hl,0,H+24)],fr=[R(-hl,rb,H+6),R(hl,rb,H+6),R(hl,0,H+24),R(-hl,0,H+24)];
 poly(bk,'#262030');poly(fr,'#2e2838');if(ady>.03)poly([R(hl,-rb,H+6),R(hl,rb,H+6),R(hl,0,H+24)],'#1e1a26');
 g.strokeStyle='#4c4460';g.lineWidth=1.2;g.beginPath();for(const a of[-10,-5,0,5,10]){const A=R(a,rb,H+6),Bq=R(a,0,H+24),Cq=R(a,-rb,H+6);g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.lineTo(Cq.x,Cq.y)}g.stroke();
 line([fr[0],fr[1]],O,1.6);line([bk[0],bk[1]],O,1.2);line([fr[3],fr[2]],'#8a7ea2',2.2);
 // bouts du portail : pilier laqué et pointe d'avant-toit relevée (de face seulement)
 if(ady<.6)for(const s of open===2?[-1,1]:open?[open]:[]){const a0=s*(hl-5),a1=s*(hl+4);F(Math.min(a0,a1),Math.max(a0,a1),0,H+6,'#a83226',hw+3);
  const p1=R(s*(hl+2),rb,H+6),p2=R(s*(hl+14),rb+3,H+20),p3=R(s*(hl+2),0,H+24);poly([p1,p2,p3],'#2e2838');line([p1,p2,p3],O,1.4)}
 // poussière quand il surgit ou s'enfonce
 const du=age<.4?1-age/.4:w.t<.35?1-w.t/.35:0;if(du>0){g.fillStyle=rgba('#c8b8a0',.55*du);for(const a of[-9,7]){const q=c(a,hw+10,6+(1-du)*22);g.beginPath();g.ellipse(q.x,q.y,(10+(1-du)*12)*q.s,(5+(1-du)*6)*q.s,0,0,7);g.fill()}}
 g.restore();return true}
// visage d'oni (repère local du portail : x le long du portail, y vers le bas ; unité ≈ pixel)
function subOni(t,a){const O=SUBK[0],gl=.75+.25*Math.sin(t*5);g.globalAlpha*=a;g.lineJoin='round';
 const sh=(f,c,w)=>{g.fillStyle=c;g.beginPath();f();g.fill();g.strokeStyle=O;g.lineWidth=w||2;g.stroke()};
 for(const k of[-1,1])sh(()=>{g.moveTo(k*16,-22);g.quadraticCurveTo(k*32,-30,k*36,-50);g.quadraticCurveTo(k*27,-36,k*7,-26);g.closePath()},'#efe2c4',1.6);
 sh(()=>g.ellipse(0,-2,34,30,0,0,7),'#4a3c5e',2.4);
 g.strokeStyle='rgba(20,12,30,.55)';g.lineWidth=1.4;g.beginPath();g.moveTo(-20,-22);g.quadraticCurveTo(0,-30,20,-22);g.moveTo(-26,6);g.lineTo(-18,10);g.moveTo(26,6);g.lineTo(18,10);g.stroke();
 for(const k of[-1,1]){sh(()=>{g.moveTo(k*28,-16);g.lineTo(k*5,-9);g.lineTo(k*6,-5);g.lineTo(k*27,-11);g.closePath()},'#1a1020',1);
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffb020',.35*gl);g.beginPath();g.ellipse(k*15,-1,12,9,0,0,7);g.fill();g.restore();
  sh(()=>g.ellipse(k*15,-1,8.5,6,k*.2,0,7),'#ffd23a',1.4);g.fillStyle='#1a0a08';g.fillRect(k*15-1.4,-5.5,2.8,9)}
 sh(()=>{g.moveTo(-5,6);g.lineTo(0,1);g.lineTo(5,6);g.quadraticCurveTo(0,9,-5,6)},'#3a2e4a',1.2);
 sh(()=>{g.moveTo(-22,12);g.quadraticCurveTo(0,8,22,12);g.quadraticCurveTo(18,26,0,26);g.quadraticCurveTo(-18,26,-22,12)},'#5a0e14',1.8);
 g.fillStyle='#fff8ea';g.strokeStyle=O;g.lineWidth=1;for(const [x0,y0,dy] of[[-15,11.5,8],[13,11.5,8],[-7,25,-6],[7,25,-6]]){g.beginPath();g.moveTo(x0-2.6,y0);g.lineTo(x0,y0+dy);g.lineTo(x0+2.6,y0);g.closePath();g.fill();g.stroke()}}
// sol du portail : ombre, fissures et sceau d'invocation (sous les ninjas)
AUXD.sub_rasho=(x,k)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),h=x.len/2,nx=-sa,ny=ca,al=Math.min(1,x.t/.4),c=(f,s)=>P(x.x+ca*f+nx*s,x.y+sa*f+ny*s);
 poly([c(-h,-24),c(h,-24),c(h,24),c(-h,24)],rgba('#1a1024',.22*al));g.strokeStyle=rgba('#1a1008',.7*al);g.lineWidth=2;g.lineCap='round';
 for(let i=0;i<9;i++){const f=-h+h*2*i/8,s=(i%2?1:-1)*(16+(i*7)%10),A=c(f,0),B2=c(f+((i*13)%9-4)*3,s*1.8),C2=c(f+((i*5)%11-5)*4,s*2.6);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B2.x,B2.y);g.lineTo(C2.x,C2.y);g.stroke()}
 const e=Math.min(1,(x.m-x.t)/.25);g.strokeStyle=rgba('#a890d0',.6*al);g.lineWidth=1.5;gEll(x.x,x.y,70*e);g.stroke()};
// surgissement : fumée d'invocation violacée tout le long, onde au sol
JFXD.sub_rashoin=(f,k,e)=>{const ca=Math.cos(f.a),sa=Math.sin(f.a);g.strokeStyle=rgba('#d8c8f0',.7*k);g.lineWidth=5*k+1;gEll(f.x,f.y,f.r*(.6+e*.9));g.stroke();
 for(let i=0;i<9;i++){const m=(i/8-.5)*2,b=i*1.7,q=P(f.x+ca*m*f.r*.95,f.y+sa*m*f.r*.95,20+e*50+(i%3)*12),r=(16+((i*7)%4)*5)*q.s*(.6+e*.8),a=Math.min(1,k*1.5);
  g.fillStyle=rgba(i%3?'#d8d0e8':'#a898c8',.85*a);g.strokeStyle=rgba('#4a3e60',.45*a);g.lineWidth=1.4;g.beginPath();g.arc(q.x+Math.cos(b)*4*q.s,q.y,r,0,7);g.fill();g.stroke()}};
// --- Sôshôryû
// arme à plat, pointe vers +x : 0 kunai, 1 shuriken, 2 katana, 3 kama
function subWpn(kd,t){const O=SUBK[0];g.lineJoin='round';
 if(kd===0)return subKunai(18);
 if(kd===1){g.rotate(t*14);g.fillStyle='#d8dde6';g.strokeStyle=O;g.lineWidth=1.1;g.beginPath();for(let i=0;i<4;i++){const b=i*Math.PI/2;g.lineTo(Math.cos(b)*9,Math.sin(b)*9);g.lineTo(Math.cos(b+.785)*3,Math.sin(b+.785)*3)}g.closePath();g.fill();g.stroke();circ(0,0,1.6,'#3a3f48');return}
 if(kd===2){g.fillStyle='#eef2f8';g.strokeStyle=O;g.lineWidth=1;g.beginPath();g.moveTo(-6,-1.6);g.lineTo(18,-1.8);g.quadraticCurveTo(24,-1,26,1);g.lineTo(-6,1.6);g.closePath();g.fill();g.stroke();
  g.fillStyle='#c8a040';g.fillRect(-8,-3.6,2.6,7.2);g.fillStyle='#2a2a40';g.fillRect(-17,-1.8,9,3.6);g.fillStyle='#e8e0d0';for(let i=0;i<3;i++)g.fillRect(-16+i*3,-1.8,1,3.6);return}
 g.fillStyle='#7a5030';g.fillRect(-12,-1.4,18,2.8);g.fillStyle='#d8dde6';g.strokeStyle=O;g.lineWidth=1;g.beginPath();g.moveTo(5,-1.5);g.quadraticCurveTo(14,-12,4,-15);g.quadraticCurveTo(10,-9,2,-1.5);g.closePath();g.fill();g.stroke()}
// deux rubans de parchemin en hélice (dragons jumeaux), puis les armes jaillissent du sommet et s'abattent sur la zone
JFXD.sub_twin=(f,k,e,t,u)=>{if(!u)return;const T=e*f.m,up=ezo(Math.min(1,T/.45)),out=Math.min(1,(f.m-T)/.35),H=165*up,O=SUBK[0];g.lineCap='round';g.lineJoin='round';
 const pt=(sd,m)=>{const b=m*Math.PI*3.1+sd*Math.PI+t*2.4,r=(26+m*18)*(.55+.45*up);return[u.x+Math.cos(b)*r,u.y+Math.sin(b)*r*.6,m*H,Math.sin(b)]};
 if(out>0)for(const back of[1,0])for(const sd of[0,1]){let A=pt(sd,0);for(let i=1;i<=24;i++){const Bp=pt(sd,i/24);if((A[3]<0)===!!back){const a=P(A[0],A[1],A[2]),b=P(Bp[0],Bp[1],Bp[2]);g.globalAlpha=out*(back?.5:1);
    g.strokeStyle=O;g.lineWidth=9*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=i%6===0?'#c0302a':'#f0e0b0';g.lineWidth=6*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
    if(i%3===1){g.strokeStyle='#2a1a10';g.lineWidth=1.2*a.s;g.beginPath();g.moveTo((a.x+b.x)/2-2*a.s,(a.y+b.y)/2-2*a.s);g.lineTo((a.x+b.x)/2+2*a.s,(a.y+b.y)/2+2*a.s);g.stroke()}}A=Bp}}
 g.globalAlpha=out;for(const sd of[0,1]){const A=pt(sd,1),q=P(A[0],A[1],A[2]);circ(q.x,q.y,7*q.s,O);circ(q.x,q.y,5.4*q.s,'#f0e0b0');circ(q.x,q.y,2.2*q.s,'#c0302a')}g.globalAlpha=1;
 if(T<.5){g.strokeStyle=rgba('#e8e0d0',.6*(1-T/.5));g.lineWidth=3;gEll(u.x,u.y,24+T*90);g.stroke()}
 for(let i=0;i<SUB_SN;i++){const t0=SUB_ST0+i*SUB_SDT,m=(T-t0)/SUB_SFL;if(m<0||m>=1)continue;const A=pt(i%2,1),[ox,oy]=subSoOff(i,f.r),ex=f.x2+ox,ey=f.y2+oy,x=lerp(A[0],ex,m),y=lerp(A[1],ey,m),z=lerp(A[2],0,m)+Math.sin(Math.PI*m)*90,q=P(x,y,z),
   q2=P(lerp(A[0],ex,m+.05),lerp(A[1],ey,m+.05),lerp(A[2],0,m+.05)+Math.sin(Math.PI*(m+.05))*90);g.save();g.translate(q.x,q.y);g.rotate(Math.atan2(q2.y-q.y,q2.x-q.x));g.scale(q.s*1.15,q.s*1.15);subWpn(i%4,t+i);g.restore()}};
// sol : cercle de la zone, armes plantées qui restent jusqu'à la fin
AUXD.sub_soryu=(x,k,t)=>{const T=x.m-x.t,al=Math.min(1,x.t/.35);g.strokeStyle=rgba('#d8dde6',.55*al);g.lineWidth=2;g.setLineDash([10,7]);g.lineDashOffset=-t*20;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 for(let i=0;i<SUB_SN;i++){const tl=SUB_ST0+i*SUB_SDT+SUB_SFL;if(T<tl)continue;const [ox,oy]=subSoOff(i,x.r),q=P(x.x+ox,x.y+oy,0),d=T-tl;
  if(d<.15){g.fillStyle=rgba('#c8b8a0',.6*(1-d/.15));g.beginPath();g.ellipse(q.x,q.y,(6+d*80)*q.s,(3+d*30)*q.s,0,0,7);g.fill()}
  g.save();g.globalAlpha=al;g.translate(q.x,q.y);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,0,5*q.s,2*q.s,0,0,7);g.fill();g.rotate(Math.PI/2+((i*7)%5-2)*.18);g.scale(q.s*1.15,q.s*1.15);g.translate(i%4===2?-22:-9,0);subWpn(i%4===1?0:i%4,0);g.restore()}};
// --- Multiclonage de shuriken
PROJD.sub_kbig=(p,R,ra,t)=>{const L=R*1.5;g.scale(1,.62);g.fillStyle='rgba(220,224,232,.18)';g.beginPath();g.arc(0,0,L*1.1,0,7);g.fill();g.rotate(t/30);
 for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle='#dfe2e8';g.beginPath();g.moveTo(-L*.18,-L*.18);g.lineTo(L,0);g.lineTo(-L*.18,L*.18);g.closePath();g.fill();g.strokeStyle='#3a3f48';g.lineWidth=1.5;g.stroke();
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1;g.beginPath();g.moveTo(L*.1,-L*.06);g.lineTo(L*.85,0);g.stroke()}circ(0,0,L*.22,'#2e3038');circ(0,0,L*.1,'#a8aeb8')};
PROJD.sub_kmini=(p,R,ra,t)=>{const L=8.5;g.save();g.globalAlpha=Math.min(1,(p.life0-p.life)/.06+.3);g.rotate(ra);g.strokeStyle='rgba(235,240,248,.4)';g.lineWidth=2;g.beginPath();g.moveTo(-16,0);g.lineTo(-6,0);g.stroke();g.restore();
 g.scale(1,.62);g.rotate(t/25+(p.rot||0));g.fillStyle='#d8dde6';g.strokeStyle='#3a3f48';g.lineWidth=1.2;g.beginPath();for(let i=0;i<4;i++){const b=i*Math.PI/2;g.lineTo(Math.cos(b)*L,Math.sin(b)*L);g.lineTo(Math.cos(b+.785)*L*.3,Math.sin(b+.785)*L*.3)}g.closePath();g.fill();g.stroke();circ(0,0,1.5,'#3a3f48')};
JFXD.sub_kfan=(f,k,e)=>{g.globalCompositeOperation='lighter';g.lineCap='round';for(let i=0;i<12;i++){const c=f.a+(i-5.5)*(1.1/11),a=P(f.x+Math.cos(c)*(10+e*60),f.y+Math.sin(c)*(10+e*60),28),b=P(f.x+Math.cos(c)*(30+e*120),f.y+Math.sin(c)*(30+e*120),28);
 g.strokeStyle=rgba('#e8eef8',.7*k);g.lineWidth=2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}};
// --- Chiens ninja : la meute de Kakashi (corps du ninken recoloré, gilet bleu, bandeau frontal)
const SUB_DOGC=[['#c8a070','#7a5a3a'],['#5a5048','#2a221c'],['#e8e0d0','#a89070'],['#8a6a4a','#4a3020'],['#3a3a42','#1a1a20'],['#b08860','#6a4a30']];
function subDog(x,y,z,a,sc,ci,st,t,al){const q=P(x,y,0),p=P(x,y,z),s=p.s*1.2*sc,f=Math.cos(a)>=0?1:-1,C=SUB_DOGC[ci%SUB_DOGC.length];g.save();g.globalAlpha*=al;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(q.x,q.y,12*s,4*s,0,0,7);g.fill();
 g.translate(p.x,p.y);g.scale(s*f,s);if(typeof in_dogBody==='function')in_dogBody(st,t,C[0],C[1],0,1);else{outlined(()=>g.ellipse(0,-11,12,7,0,0,7),C[0]);outlined(()=>g.ellipse(11,-18,6,5.5,0,0,7),C[0])}
 const bt=st===1,sit=st===4,hx=bt?13:sit?9:11,hy=bt?-16:sit?-22:-18;
 g.fillStyle='#2a4a8a';g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();if(sit){g.moveTo(-3,-17);g.lineTo(3,-19);g.lineTo(6,-8);g.lineTo(0,-6)}else{g.moveTo(-1,-18);g.lineTo(4,-18);g.lineTo(5,-6);g.lineTo(-2,-6)}g.closePath();g.fill();g.stroke();g.fillStyle='#ffe14a';g.fillRect(sit?1:0.5,sit?-15:-14,2.4,2.4)
 g.fillStyle='#2a3a6a';g.fillRect(hx-4.5,hy-5.4,7,2.6);g.fillStyle='#c8ccd4';g.fillRect(hx-3,hy-5.2,4,2.2);g.restore()}
// terrier qui file sous la cible (alerte au sol qui se remplit) ; trou de sortie
AUXD.sub_dig=(x,k,t)=>{const e=1-x.t/x.m,q=P(x.x,x.y,0),s=q.s;g.fillStyle=rgba('#c8a070',.12);gEll(x.x,x.y,x.r);g.fill();g.fillStyle=rgba('#b8682a',.28);gEll(x.x,x.y,x.r*e);g.fill();
 g.strokeStyle=rgba('#e8c890',.8);g.lineWidth=2;g.setLineDash([7,5]);g.lineDashOffset=-t*30;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 for(let i=0;i<3;i++){const b=t*9+i*2.1,p=P(x.x+Math.cos(b)*9,x.y+Math.sin(b)*6,0);g.fillStyle='#7a5a3a';g.strokeStyle=SUBK[0];g.lineWidth=1.2;g.beginPath();g.ellipse(p.x,p.y,(8+e*3)*s,(3.5+e*1.5)*s,0,Math.PI,0);g.fill();g.stroke()}
 for(let i=0;i<5;i++){const h=(t*3+i*.2)%1,b=i*1.3+t,p=P(x.x+Math.cos(b)*(6+h*16),x.y+Math.sin(b)*(4+h*10),Math.sin(Math.PI*h)*18);g.fillStyle=i%2?'#8a6a48':'#5a4028';g.fillRect(p.x-1.6*s,p.y-1.6*s,3.2*s,3.2*s)}};
AUXD.sub_dhole=(x,k)=>{const al=Math.min(1,x.t/.5);g.fillStyle=rgba('#2a1c10',.45*al);gEll(x.x,x.y,26);g.fill();g.strokeStyle=rgba('#7a5a3a',.8*al);g.lineWidth=3;gEll(x.x,x.y,30);g.stroke();
 for(let i=0;i<7;i++){const b=i*.9,p=P(x.x+Math.cos(b)*34,x.y+Math.sin(b)*30,0);g.fillStyle=rgba(i%2?'#8a6a48':'#6a4e34',al);g.beginPath();g.ellipse(p.x,p.y,7*p.s,3.5*p.s,b,0,7);g.fill()}};
// la meute jaillit : sur une proie, 5 chiens la mordent (côté caméra) et Pakkun s'assoit sur sa tête ; sinon ils bondissent dans le vide
const SUB_DOGA=[1.571,.62,2.52,-.2,3.34];
JFXD.sub_dogs=(f,k,e,t,u,tg)=>{const T=e*f.m;
 if(tg&&!tg.dead){const rel=T>f.m-.25||(T>.35&&!(tg.root>0)),al=rel?Math.min(1,(f.m-T)/.25):1,rr=tg.r+7;
  if(T<.3)for(let i=0;i<8;i++){const b=i*.785,h=T/.3,p=P(tg.x+Math.cos(b)*(16+h*30),tg.y+Math.sin(b)*(12+h*22),Math.sin(Math.PI*h)*30);g.fillStyle=i%2?'#8a6a48':'#5a4028';g.fillRect(p.x-1.4*p.s,p.y-1.4*p.s,2.8*p.s,2.8*p.s)}
  SUB_DOGA.forEach((b,i)=>{const h=Math.min(1,Math.max(0,(T-i*.04)/.2));if(h<=0)return;const sh=Math.sin(t*28+i)*1.4,x=tg.x+Math.cos(b)*rr+sh,y=tg.y+Math.sin(b)*rr*.85;subDog(x,y,Math.sin(Math.PI*Math.min(1,h*1.1))*22+6,b+Math.PI,1.02+(i===0?.15:0),i+1,1,t,al)});
  const h=Math.min(1,Math.max(0,(T-.25)/.2));if(h>0)subDog(tg.x,tg.y-2,(tg.z||0)+74*(tg.ch&&tg.ch.look.scale||1)+Math.sin(Math.PI*h)*24*(1-h),0,.78,0,4,t,al);return}
 for(let i=0;i<5;i++){const b=i*1.257+.3,h=Math.min(1,T/.45),x=f.x+Math.cos(b)*(10+h*34),y=f.y+Math.sin(b)*(8+h*26);subDog(x,y,Math.sin(Math.PI*h)*40,b,1,i,h>.5?3:2,t,Math.min(1,k*2.5))}};
// signe d'invocation : traits de sang qui s'étalent sous la paume
JFXD.sub_dogcall=(f,k,e,t,u)=>{if(!u)return;const cx=u.x+Math.cos(f.a)*20,cy=u.y+Math.sin(f.a)*20;g.strokeStyle=rgba('#1a1010',.8*Math.min(1,k*2));g.lineWidth=2;g.lineCap='round';
 for(let i=0;i<7;i++){const b=i*.9+.3,L=(18+(i%3)*10)*ezo(Math.min(1,e*3));g.beginPath();for(let j=0;j<=4;j++){const d=L*j/4,o=Math.sin(j*2+i)*3,p=P(cx+Math.cos(b)*d-Math.sin(b)*o,cy+Math.sin(b)*d+Math.cos(b)*o,0);j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}g.stroke()}
 g.fillStyle=rgba('#1a1010',.7*Math.min(1,k*2));for(let i=0;i<10;i++){const b=i*.63,p=P(cx+Math.cos(b)*34*ezo(Math.min(1,e*3)),cy+Math.sin(b)*30*ezo(Math.min(1,e*3)),0);g.fillRect(p.x-1.5,p.y-2,3,4)}};
// --- Raikiri
// éclair brisé de (x0,y0) à (x1,y1) (coordonnées écran), graine pour la forme, renouvelée ~20 fois par seconde
function subBolt(x0,y0,x1,y1,n,amp,sd){g.beginPath();g.moveTo(x0,y0);const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,px=-dy/L,py=dx/L;for(let i=1;i<n;i++){const m=i/n,o=Math.sin(sd*12.9898+i*78.233)*43758.5453;g.lineTo(x0+dx*m+px*amp*((o-Math.floor(o))*2-1),y0+dy*m+py*amp*((o-Math.floor(o))*2-1))}g.lineTo(x1,y1)}
function subBolts(x0,y0,x1,y1,n,amp,sd,w){g.strokeStyle='rgba(90,170,255,.55)';g.lineWidth=w*2.6;subBolt(x0,y0,x1,y1,n,amp,sd);g.stroke();g.strokeStyle='#ffffff';g.lineWidth=w;subBolt(x0,y0,x1,y1,n,amp,sd);g.stroke()}
STATD.push((u,p,S,sk)=>{if(u.dead||!u.anim)return;const k=u.anim.k;if(k!=='sub_raiw'&&k!=='sub_raiki')return;const t=performance.now()/1000,sd=Math.floor(t*20),a=u.aim||0,s2=sk||1;g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 if(k==='sub_raiw'){const h=P(u.x+Math.cos(a+.9)*14,u.y+Math.sin(a+.9)*14,(u.z||0)+20*s2),R=(9+Math.sin(t*40)*2)*S;g.fillStyle='rgba(40,120,255,.18)';g.beginPath();g.ellipse(p.x,p.y,34*S,13*S,0,0,7);g.fill();
  circ(h.x,h.y,R*2.2,'rgba(60,150,255,.22)');circ(h.x,h.y,R*1.1,'rgba(150,210,255,.6)');circ(h.x,h.y,R*.5,'#ffffff');
  for(let i=0;i<6;i++){const b=i*1.05+sd*.7,L=(16+((sd+i)%3)*8)*S;subBolts(h.x,h.y,h.x+Math.cos(b)*L,h.y+Math.sin(b)*L*.8,4,4*S,sd+i,1.2)}
  for(let i=0;i<2;i++){const b=a+.9+(i?.6:-.5),gp=P(u.x+Math.cos(b)*(24+((sd+i)%3)*8),u.y+Math.sin(b)*(24+((sd+i)%3)*8),0);subBolts(h.x,h.y,gp.x,gp.y,5,5*S,sd*3+i,1.1)}}
 else{const e=1-u.anim.t/u.anim.m,h=P(u.x+Math.cos(a)*22,u.y+Math.sin(a)*22,(u.z||0)+30*s2),tip=P(u.x+Math.cos(a)*58,u.y+Math.sin(a)*58,(u.z||0)+30*s2),al=Math.min(1,(1-e)*3);g.globalAlpha=al;
  circ(h.x,h.y,14*S,'rgba(80,160,255,.3)');circ(h.x,h.y,6*S,'#ffffff');for(let i=0;i<3;i++)subBolts(h.x,h.y,tip.x+(i-1)*5*S,tip.y+(i-1)*4*S,5,5*S,sd+i*7,1.4-i*.3);
  for(let i=0;i<4;i++){const b=a+Math.PI+(i-1.5)*.5,bk=P(u.x+Math.cos(b)*(30+i*6),u.y+Math.sin(b)*(30+i*6),(u.z||0)+18*s2);subBolts(h.x,h.y,bk.x,bk.y,4,6*S,sd*5+i,1)}}
 g.restore()});
// traînée de la ruée (suit le trajet calculé : identique chez les invités)
JFXD.sub_raitrail=(f,k,e,t)=>{const T=e*f.m,m=Math.min(1,T/(f.d||.2)),sd=Math.floor(t*20),x1=lerp(f.x,f.x2,m),y1=lerp(f.y,f.y2,m),a=P(f.x,f.y,28),b=P(x1,y1,28);g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 g.strokeStyle=rgba('#3a8aff',.35*k);g.lineWidth=18*a.s*k+2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=rgba('#bfe6ff',.55*k);g.lineWidth=6*a.s*k+1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
 g.globalAlpha=k;for(let i=0;i<2;i++)subBolts(a.x,a.y,b.x,b.y,12,9*a.s,sd+i*13,1.6-i*.5);
 for(let i=0;i<5;i++){const mm=((i*.23+sd*.05)%1)*m,q=P(lerp(f.x,f.x2,mm),lerp(f.y,f.y2,mm),0);subBolts(q.x,q.y-20*q.s,q.x+((i*7)%9-4)*3*q.s,q.y,3,4*q.s,sd+i,1)}};
// transpercé : éclat blanc, gerbe de foudre qui ressort derrière la cible
JFXD.sub_raihit=(f,k,e,t,u,tg)=>{const x=tg?tg.x:f.x,y=tg?tg.y:f.y,q=P(x,y,(tg&&tg.z||0)+32),s=q.s,sd=Math.floor(t*20),ca=Math.cos(f.a),sa=Math.sin(f.a);g.globalCompositeOperation='lighter';g.lineCap='round';
 if(e<.25){const a=1-e/.25,L=(30+e*160)*s;g.fillStyle=rgba('#ffffff',.9*a);g.beginPath();for(let i=0;i<12;i++){const b=i*Math.PI/6+f.a,l=i%2?L*.3:L;g.lineTo(q.x+Math.cos(b)*l,q.y+Math.sin(b)*l*.7)}g.closePath();g.fill()}
 circ(q.x,q.y,(18+e*20)*s,rgba('#5ab0ff',.35*k));circ(q.x,q.y,8*s*k,rgba('#ffffff',.9*k));g.globalAlpha=k;
 for(let i=0;i<6;i++){const b=f.a+(i-2.5)*.28,L=(50+e*70+(i%2)*20)*s,ex=q.x+Math.cos(b)*L,ey=q.y+Math.sin(b)*L*.75;subBolts(q.x,q.y,ex,ey,6,7*s,sd+i*3,1.5)}
 g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=3*s;g.beginPath();g.moveTo(q.x-ca*40*s,q.y-sa*30*s);g.lineTo(q.x+ca*(60+e*60)*s,q.y+sa*(45+e*45)*s);g.stroke()};
// --- Argile explosive : oiseau d'argile blanche vu de dessus (ailes qui battent), mèche qui clignote en fin de vol
PROJD.sub_cbird=(p,R,ra,t)=>{const O=SUBK[0],w=.4+.6*Math.abs(Math.sin(t/80+(p.life0||0))),bl=p.life<.6&&((t/60|0)%2);g.translate(0,Math.sin(t/140)*2);g.rotate(ra);g.lineJoin='round';g.lineWidth=1.5;g.strokeStyle=O;
 g.fillStyle='#ece4d4';for(const s of[-1,1]){g.beginPath();g.moveTo(3,0);g.quadraticCurveTo(-1,-15*w*s,-13,-19*w*s);g.quadraticCurveTo(-8,-9*w*s,-7,0);g.closePath();g.fill();g.stroke()}
 g.fillStyle='#f6f1e6';g.beginPath();g.moveTo(-9,0);g.lineTo(-18,-5);g.lineTo(-16,0);g.lineTo(-18,5);g.closePath();g.fill();g.stroke();
 g.beginPath();g.ellipse(0,0,11,4.6,0,0,7);g.fill();g.stroke();g.beginPath();g.arc(10,0,4.2,0,7);g.fill();g.stroke();
 g.fillStyle='#e8c890';g.beginPath();g.moveTo(13.5,-1.6);g.lineTo(19,0);g.lineTo(13.5,1.6);g.closePath();g.fill();g.stroke();circ(11,-1.6,1,'#2a1a10');circ(11,1.6,1,'#2a1a10');
 g.strokeStyle='rgba(150,130,110,.6)';g.lineWidth=.8;g.beginPath();g.moveTo(-4,-2);g.lineTo(4,-2);g.moveTo(-4,2);g.lineTo(4,2);g.stroke();
 if(bl){g.globalCompositeOperation='lighter';circ(0,0,9,'rgba(255,200,90,.5)')}};
// explosion d'argile : éclair blanc, champignon crème et rose, éclats d'argile
JFXD.sub_cboom=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s,cy=q.y-R*.3;g.strokeStyle=rgba('#3a2a20',.4*k);g.lineWidth=5*q.s*k+1;gEll(f.x,f.y,f.r*(.4+e*.8));g.stroke();
 if(e<.2){const a=1-e/.2,L=R*(.6+e*3);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fffbe8',.95*a);g.beginPath();for(let i=0;i<14;i++){const b=i*Math.PI/7+f.y,l=i%2?L*.42:L;g.lineTo(q.x+Math.cos(b)*l,cy+Math.sin(b)*l*.75)}g.closePath();g.fill();g.restore()}
 const C=e<.3?['#fff6dc','#ffd27a','#ffb0a0']:['#f0e4d8','#d8c8d0','#b8a8b8'];g.lineWidth=1.6;
 for(let i=0;i<7;i++){const b=i*.9+f.x*.01,d=R*(.15+.25*Math.min(1,e*3)),x=q.x+Math.cos(b)*d,y=cy-e*R*.8+Math.sin(b)*d*.5-(i%2)*R*.16,r=R*(.3-.02*i)*(.55+.7*Math.min(1,e*2.5));
  g.fillStyle=rgba(C[i%3],(e>.5?.7:.95)*k);g.strokeStyle=rgba('#3a2a30',.5*k);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke()}
 g.fillStyle=rgba('#f4efe4',.95*k);for(let i=0;i<9;i++){const b=i*.7+f.y,d=R*(.3+e*1.3),x=q.x+Math.cos(b)*d,y=cy+Math.sin(b)*d*.5-Math.sin(e*2.6)*R*.5+e*e*R*.9;g.beginPath();g.arc(x,y,(i%2?3:2)*q.s,0,7);g.fill()}};
// bouches dans les paumes qui mâchent l'argile : deux boules blanches qui prennent des ailes
JFXD.sub_claymouth=(f,k,e,t,u)=>{if(!u)return;const a=u.aim||0;for(const s of[-1,1]){const b=a+s*.45,q=P(u.x+Math.cos(b)*18,u.y+Math.sin(b)*18,32),sc=q.s*(.6+.6*Math.min(1,e*2)),O=SUBK[0];
 g.fillStyle='#e8b898';g.strokeStyle=O;g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,6*q.s,4.5*q.s,0,0,7);g.fill();g.stroke();g.strokeStyle='#5a1a1a';g.beginPath();g.moveTo(q.x-3*q.s,q.y);g.quadraticCurveTo(q.x,q.y+(1+Math.sin(t*30))*1.5*q.s,q.x+3*q.s,q.y);g.stroke();
 if(e>.3){const w=Math.abs(Math.sin(t*20));g.fillStyle='#f4efe4';g.strokeStyle=O;g.beginPath();g.arc(q.x,q.y-8*sc,4*sc,0,7);g.fill();g.stroke();for(const z of[-1,1]){g.beginPath();g.moveTo(q.x,q.y-8*sc);g.lineTo(q.x+z*9*sc,q.y-(10+w*5)*sc);g.lineTo(q.x+z*4*sc,q.y-7*sc);g.closePath();g.fill();g.stroke()}}}};
// ---------- animations 3D ----------
Object.assign(ANIM,{
 // Rashômon : morsure du pouce, puis la paume s'abat sur le sol (genou à terre)
 sub_rasho:(P,e)=>{if(e<.3){const k=Math.min(1,e/.15);pz(P,'armR',-2.3*k,0,.45*k);pz(P,'foreR',-2.2*k);pz(P,'head',.15*k);return}const k=ezo(Math.min(1,(e-.3)/.2));
  P.root.y=-11*k;pz(P,'chest',.8*k);pz(P,'head',-.3*k);pz(P,'armR',-1.25*k,0,-.1);pz(P,'foreR',-.15);pz(P,'armL',-.4,0,.6*k);pz(P,'thighL',-1.3*k);pz(P,'shinL',2*k);pz(P,'thighR',.2*k);pz(P,'shinR',1.9*k)},
 // Sôshôryû : accroupie, puis bond entre les parchemins, les bras lancent tour à tour par-dessus la tête
 sub_soryu:(P,e)=>{if(e<.22){const k=e/.22;P.root.y=-8*k;pz(P,'thighL',-1*k);pz(P,'shinL',1.8*k);pz(P,'thighR',-.7*k);pz(P,'shinR',1.6*k);pz(P,'chest',.4*k);pz(P,'armL',-.4*k,0,.6*k);pz(P,'armR',-.4*k,0,-.6*k);return}
  const k=(e-.22)/.78,h=bump(k),w=Math.sin(k*Math.PI*9);P.root.y=24*h;pz(P,'armL',-2.4-.8*w,0,-.2);pz(P,'armR',-2.4+.8*w,0,.2);pz(P,'foreL',-.4-.4*Math.max(0,w));pz(P,'foreR',-.4-.4*Math.max(0,-w));
  pz(P,'chest',-.25*h);pz(P,'thighL',-.9*h);pz(P,'shinL',1.4*h);pz(P,'thighR',-.3*h);pz(P,'shinR',1.1*h)},
 // Multiclonage de shuriken : lancer de côté, puis le signe du clonage
 sub_kshu:(P,e)=>{if(e<.4){const k=e/.4,s=k<.4?k/.4:1;pz(P,'armR',-1.5,.9-2.2*ezo(s),-.3);pz(P,'foreR',-.3+.3*s);pz(P,'chest',.15,.5-1*s);pz(P,'armL',-.3,0,.5);return}
  const k=Math.min(1,(e-.4)/.15);pz(P,'armL',-1.75*k,0,-.6);pz(P,'foreL',-1.5);pz(P,'armR',-1.85*k,0,.55);pz(P,'foreR',-1.6);pz(P,'head',.1)},
 // Chiens ninja : morsure du pouce puis les deux paumes au sol, accroupi
 sub_dogs:(P,e)=>{if(e<.25){const k=Math.min(1,e/.12);pz(P,'armR',-2.3*k,0,.45*k);pz(P,'foreR',-2.2*k);return}const k=ezo(Math.min(1,(e-.25)/.18));
  P.root.y=-13*k;pz(P,'chest',1*k);pz(P,'head',-.5*k);pz(P,'armL',-1.15*k,0,.25);pz(P,'armR',-1.15*k,0,-.25);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'thighL',-1.4*k);pz(P,'shinL',2.2*k);pz(P,'thighR',-1.1*k);pz(P,'shinR',2.2*k)},
 // Raikiri : garde basse, la main gauche tient le poignet droit chargé de foudre
 sub_raiw:(P)=>{P.root.y=-5;pz(P,'chest',.35,-.35);pz(P,'head',-.2,.25);pz(P,'armR',-.7,0,.35);pz(P,'foreR',-.35);pz(P,'armL',-1.1,0,-.55);pz(P,'foreL',-1.1);pz(P,'thighL',-.75);pz(P,'shinL',1);pz(P,'thighR',.35);pz(P,'shinR',.6)},
 // ruée : le bras droit transperce vers l'avant, corps penché
 sub_raiki:(P,e)=>{const k=ezo(Math.min(1,e/.15));P.root.y=-4*k;P.root.z=10*k;pz(P,'chest',.65*k,.25*k);pz(P,'head',-.45*k);pz(P,'armR',-1.6*k,0,.05);pz(P,'foreR',-.05);pz(P,'armL',.8*k,0,.45);pz(P,'foreL',-.5);
  pz(P,'thighR',-1.2*k);pz(P,'shinR',1*k);pz(P,'thighL',.6*k);pz(P,'shinL',.5*k)},
 // Argile explosive : paumes tendues (bouches), puis les oiseaux sont jetés en l'air
 sub_clay:(P,e)=>{if(e<.5){const k=Math.min(1,e/.2);pz(P,'armL',-1.5*k,0,-.3);pz(P,'armR',-1.5*k,0,.3);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'chest',.2*k);return}
  const k=ezo((e-.5)/.5);pz(P,'armL',-1.5-1.2*k,0,-.3+.6*k);pz(P,'armR',-1.5-1.2*k,0,.3-.6*k);pz(P,'chest',.2-.4*k);pz(P,'head',-.3*k)},
 // « Katsu ! » : signe de la main levé devant le visage
 sub_katsu:(P,e)=>{const k=Math.min(1,e/.25);pz(P,'armR',-2*k,0,.35);pz(P,'foreR',-1.7*k);pz(P,'head',-.1*k);pz(P,'chest',-.1*k)},
});
