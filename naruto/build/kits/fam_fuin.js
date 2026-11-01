// ===== Famille de sub f1 : Fûinjutsu / Hiraishin (préfixe sub_hr_ pour les marques) =====
// Hiraishin : Kunai marqué (NOUVELLE version, 2 charges) · Kunai à parchemin explosif (fusion Parchemin explosif + Kunai explosifs) · Hiraishin : Éclair jaune (NOUVEAU) ·
// Barrière Shishienjin (sub_nrp2.js) · Hiraishin : Danse de l'éclair jaune (NOUVEAU) ; dash : Hiraishin : Saut (NOUVEAU, mécanique dédiée sub_hiraD)
// Marques (hôte) : u.sub_hm = [{x,y,t,tg,ax}] ; au sol 12 s (3 au plus), sur un ennemi 5 s (2 au plus) ; chaque marque a son objet aux 'sub_hmk' (visible des deux camps).
// Elles sont posées par le Kunai marqué, le dash (point de départ) et le 5e coup du combo de base si la famille est prise ; perdues à la mort du lanceur.
KIT('f1',[
 ['D','x.sub_hrk','Hiraishin : Kunai marqué','2 charges. Kunai (8 dégâts) qui marque l\'ennemi touché, sinon se plante au sol (marque) ; relance dans les 3 s : téléportation au kunai','hiraishin'],
 ['C','x.sub_ktag','Kunai à parchemin explosif','Collé au 1er ennemi touché : explose 1 s plus tard (20 dégâts, étourdi 0,4 s). Au sol, il saute (14 dégâts) puis 4 parchemins explosent en anneau (8 dégâts)','tag'],
 ['B','x.sub_hrb','Hiraishin : Éclair jaune','Téléportation sur la marque la plus proche du curseur (650). Ennemi marqué : tu surgis dans son dos, 26 dégâts, étourdi 0,5 s ; marque au sol : onde de 16 dégâts. La marque est consommée','hiraishin'],
 ['A','x.sub_shishi','Barrière Shishienjin','Quatre flammes violettes dressent un dôme au curseur : 3 s, les ennemis pris dedans ne peuvent plus en sortir (8 dégâts, le mur brûle et repousse)','seal'],
 ['S','x.sub_hrs','Hiraishin : Danse de l\'éclair jaune','Jusqu\'à 5 sauts en 0,9 s entre tes marques et les ennemis marqués (700), intangible : chaque trajet tranche (14 dégâts, 2 fois au plus par ennemi), le dernier touché est étourdi 0,6 s. Moins de 2 marques : frappe éclair dans le dos de l\'ennemi visé (30 dégâts)','hiraishin'],
]);
DASHF[1]={src:'x.sub_hiraD',n:'Hiraishin : Saut',d:'Téléportation sur ta marque proche du curseur (600), sinon clignement de 200 ; laisse une marque au point de départ',vfx:'hiraishin',cd:8};
const SUB_HM={gT:12,gN:3,eT:5,eN:2},SUB_HY='#ffe14a';
const subHM=u=>u.sub_hm||(u.sub_hm=[]);
function subHmDel(u,m){const L=subHM(u),i=L.indexOf(m);if(i>=0)L.splice(i,1);if(m&&m.ax)m.ax.t=0}
// pose une marque (au sol en x,y, ou sur l'ennemi tg) ; la plus ancienne du même genre saute au-delà du maximum
function subHmAdd(u,x,y,tg){const L=subHM(u);
 if(tg){const o=L.find(m=>m.tg===tg);if(o){o.t=SUB_HM.eT;if(o.ax){o.ax.t=o.ax.m=SUB_HM.eT}return o}const E=L.filter(m=>m.tg);if(E.length>=SUB_HM.eN)subHmDel(u,E[0])}
 else{const G=L.filter(m=>!m.tg);if(G.length>=SUB_HM.gN)subHmDel(u,G[0])}
 const q=tg?{x:tg.x,y:tg.y}:subFree({x,y},10),T=tg?SUB_HM.eT:SUB_HM.gT,m={x:q.x,y:q.y,t:T,tg:tg||null};L.push(m);
 m.ax={type:'sub_hmk',x:m.x,y:m.y,r:0,t:T,m:T,team:u.team,owner:u,n:tg?2:1,ti:tg?units.indexOf(tg):undefined,mk:m};aux.push(m.ax);
 if(near(m.x,m.y)){if(tg)say(tg,'MARQUÉ','#ffe14a');jx({jfx:'sub_hmpop',x:m.x,y:m.y,ti:tg?units.indexOf(tg):undefined,t:.45,m:.45})}return m}
// marques encore valables (une cible morte efface sa marque)
function subHmLive(u){const L=subHM(u);for(let i=L.length-1;i>=0;i--){const m=L[i];if(m.tg&&m.tg.dead)subHmDel(u,m)}return L}
// téléportation sur une marque : derrière l'ennemi marqué (o.dmg, o.h = options de hit) ou sur la marque au sol ; renvoie l'ennemi visé
function subHrTp(u,m,o){o=o||{};const ox=u.x,oy=u.y,ui=units.indexOf(u);S('zap',u);let e=null;
 if(m.tg&&!m.tg.dead){e=m.tg;const b=ang(u,e),q=subFree({x:e.x+Math.cos(b)*(u.r+e.r+8),y:e.y+Math.sin(b)*(u.r+e.r+8)},u.r);u.x=q.x;u.y=q.y;collide(u);u.aim=ang(u,e);u.swing=.18;u.swingA=u.aim;
  if(o.dmg){const V=VFX;VFX='hiraishin';hit(e,u,o.dmg,Object.assign({unblockable:1,fx:u.x,fy:u.y},o.h));VFX=V}S('saber',u);jx({jfx:'sub_slash',ui,x:u.x,y:u.y,a:u.aim,col:SUB_HY,t:.3,m:.3})}
 else{const q=subFree({x:m.x,y:m.y},u.r);u.x=q.x;u.y=q.y;collide(u)}
 u.dash=null;u.kx=u.ky=0;u.z=0;jx({jfx:'sub_hira',x:ox,y:oy,x2:u.x,y2:u.y,t:.5,m:.5});if(near(u.x,u.y))flashS=Math.max(flashS||0,u===player?.12:0);return e}
// marque visée : celle de l'ennemi visé par un bot (ou la plus proche de lui), sinon la plus proche du curseur
function subHmPick(u,L,p){if(!u.ctrl&&u.tgt&&!u.tgt.dead){const e=u.tgt,m=L.find(q=>q.tg===e);if(m)return m;return L.slice().sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0]}
 return L.slice().sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]}
Object.assign(NAT,{
 // --- Kunai marqué : 2 charges (moteur) ; relance dans les 3 s (u.sub_hrR) : téléportation au kunai (gratuite). Une relance sans charge restante « emprunte » une charge, rendue à la fin de la fenêtre.
 sub_hrk:S_('Hiraishin : Kunai marqué','Kunai marqué ; relance pour s\'y téléporter',7,{hero:'ventress',charges:2,ai:{mode:'gap',min:100,max:460,p:.55}},(u,a)=>{const i=subIdx(u,'sub_hrk'),R=u.sub_hrR;
  if(R&&SIMT<R.t){const pAlive=R.p&&!R.p.dead&&R.p.life>0,ok=R.m?subHM(u).includes(R.m):pAlive;
   if(ok){const tx=R.m?R.m.x:R.p.x,ty=R.m?R.m.y:R.p.y,e=u.tgt;
    // bot : ne se téléporte que si le kunai le rapproche vraiment de sa cible
    if(!u.ctrl&&!(e&&!e.dead&&Math.hypot(tx-e.x,ty-e.y)<dist(u,e)-80)){if(i>0){u.chg[i]=Math.min(2,u.chg[i]+1);if(u.chg[i]>=2)u.cds[i]=0;u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]))}return}
    u.sub_hrR=null;if(i>0){u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]));if(!R.bor)u.chg[i]=Math.min(2,u.chg[i]+1);if(u.chg[i]>=2)u.cds[i]=0}
    if(R.m)subHrTp(u,R.m,{dmg:6});else{R.p.life=0;R.p.dead=1;subHrTp(u,{x:R.p.x,y:R.p.y},{});subHmAdd(u,u.x,u.y,null)}return}}
  u.thrT=.2;S('blaster',u);anim(u,'throw2',.3);
  proj(u,a,{spd:950,r:7,dmg:8,life:.5,col:SUB_HY,kind:'sub_hkunai',vfx:'hiraishin',onHit:(q,t)=>{if(!t.dead&&q.owner){const m=subHmAdd(q.owner,t.x,t.y,t);if(q.hrR)q.hrR.m=m}}});
  const p=projs[projs.length-1],N={t:SIMT+3,m:null,p,bor:0,cg:u.chg};p.hrR=N;u.sub_hrR=N;if(i>0&&u.chg[i]<=0){u.chg[i]=1;N.bor=1}
  aux.push({type:'sub_hrkt',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,p,R:N})}),
 // --- Kunai à parchemin explosif : collé (charge du moteur, t.stick) ou planté au sol (explosion + anneau de 4 parchemins)
 sub_ktag:S_('Kunai à parchemin explosif','Kunai à parchemin : collé, il explose ; au sol, anneau de parchemins',9,{hero:'han',ai:RG(420,.6,60)},(u,a,td)=>{u.thrT=.2;S('blaster',u);anim(u,'throw2',.3);const L=clamp(td||350,90,420);
  proj(u,a,{spd:780,r:8,dmg:4,life:L/780,col:'#f0e0b0',vfx:'kunai',kind:'sub_tagk',onHit:(q,t)=>{if(t.dead)return;t.stick={src:q.owner,ex:false,t:1,r:90,dmg:20,stun:.4,sub:1};say(t,'PARCHEMIN !','#ff9a3a');
   aux.push({type:'sub_tagw',x:t.x,y:t.y,r:90,t:1.4,m:1.4,team:q.owner.team,owner:q.owner,ti:units.indexOf(t),tg:t})}});
  aux.push({type:'sub_ktagp',x:u.x,y:u.y,r:0,t:L/780+.3,m:L/780+.3,team:u.team,owner:u,p:projs[projs.length-1],a})}),
 // --- Éclair jaune : téléportation sur une marque (consommée)
 sub_hrb:S_('Hiraishin : Éclair jaune','Téléportation sur une marque : frappe dans le dos',10,{hero:'ventress',ai:{mode:'gap',min:150,max:650,p:.6}},(u,a,td)=>{const L=subHmLive(u).filter(m=>dist(u,m)<650);
  if(!L.length){subRefund(u,'sub_hrb',u.ctrl?.4:1.5,'AUCUNE MARQUE',SUB_HY);return}
  const m=subHmPick(u,L,fwd(u,a,Math.min(td||300,650)));anim(u,'lunge',.3);const e=subHrTp(u,m,{dmg:m.tg?26:0,h:{stun:.5}});subHmDel(u,m);
  if(!e){const V=VFX;VFX='hiraishin';aoe(u,u.x,u.y,90,16,{unblockable:1,kb:200,fx:u.x,fy:u.y},SUB_HY);VFX=V;jx({jfx:'shock',x:u.x,y:u.y,r:95,t:.4,m:.4,col:SUB_HY})}
  if(near(u.x,u.y))shake=Math.max(shake,.18)}),
 // --- Danse de l'éclair jaune : file de sauts (seqs) entre marques et ennemis marqués ; intangible pendant la danse
 sub_hrs:S_('Hiraishin : Danse de l\'éclair jaune','Cinq sauts tranchants entre tes marques',22,{hero:'ventress',ai:{mode:'gap',min:60,max:600,p:.75}},(u,a,td)=>{const L=subHmLive(u).filter(m=>dist(u,m)<700);
  if(L.length<2&&!L.some(m=>m.tg)){const e=pick(u,a,td||300,300);if(!e){subRefund(u,'sub_hrs',1,'AUCUNE CIBLE',SUB_HY);return}anim(u,'lunge',.3);subHrTp(u,{tg:e},{dmg:30,h:{stun:.4}});say(u,'ÉCLAIR JAUNE !',SUB_HY);return}
  const c=fwd(u,a,Math.min(td||300,700)),O=L.slice().sort((p,q)=>Math.hypot(p.x-c.x,p.y-c.y)-Math.hypot(q.x-c.x,q.y-c.y)),H=new Map();let k=0,last=null;
  u.phase=Math.max(u.phase||0,1.05);u.root=Math.max(u.root,.95);say(u,'DANSE DE L\'ÉCLAIR JAUNE !',SUB_HY);anim(u,'sub_seal',.3);jx({jfx:'sub_hrdance',ui:units.indexOf(u),x:u.x,y:u.y,t:1.1,m:1.1});
  seqs.push({owner:u,n:5,t:.02,iv:.18,vfx:'hiraishin',f:o=>{const m=O[k%O.length];k++;if(!m||(m.tg&&m.tg.dead))return;const x0=o.x,y0=o.y;o.phase=Math.max(o.phase||0,.3);
   const e=subHrTp(o,m,{});const dx=o.x-x0,dy=o.y-y0,D=Math.hypot(dx,dy)||1;
   for(const v of enemies(o)){const f=clamp(((v.x-x0)*dx+(v.y-y0)*dy)/(D*D),0,1),px=x0+dx*f,py=y0+dy*f;if(Math.hypot(v.x-px,v.y-py)>20+v.r&&v!==e)continue;const n=H.get(v)||0;if(n>=2)continue;
    H.set(v,n+1);if(hit(v,o,14,{unblockable:1,fx:x0,fy:y0}))last=v;sparks(v.x,v.y,SUB_HY,8)}
   if(k>=5&&last&&!last.dead){hit(last,o,0,{stun:.6,silent:1,unblockable:1});say(last,'ÉTOURDI','#b8f');jx({jfx:'shock',x:last.x,y:last.y,r:70,t:.4,m:.4,col:SUB_HY});if(near(o.x,o.y))shake=Math.max(shake,.3)}}})}),
 // --- Hiraishin : Saut (dash) : sur une marque proche du curseur, sinon clignement ; marque le point de départ
 sub_hiraD:S_('Hiraishin : Saut','Téléportation sur une marque, sinon clignement',8,{hero:'ventress',ai:{mode:'gap',min:160,max:520,p:.45}},(u,a,td)=>{const ox=u.x,oy=u.y,c=fwd(u,a,Math.min(td||200,600));
  const L=subHmLive(u).filter(m=>dist(u,m)<600&&Math.hypot(m.x-c.x,m.y-c.y)<140).sort((p,q)=>Math.hypot(p.x-c.x,p.y-c.y)-Math.hypot(q.x-c.x,q.y-c.y));anim(u,'crouch',.25);
  if(L.length){const m=L[0];subHrTp(u,m,{});if(m.tg)subHmDel(u,m)}else{const q=subFree(fwd(u,a,200),u.r);S('zap',u);u.x=q.x;u.y=q.y;collide(u);u.dash=null;jx({jfx:'sub_hira',x:ox,y:oy,x2:u.x,y2:u.y,t:.45,m:.45})}
  subHmAdd(u,ox,oy,null)}),
});
// Barrière Shishienjin : recharge 14 s (sub_nrp2.js), effet visuel du sceau
// ---------- logique (hôte) ----------
AUXF.sub_hmk=x=>{const u=x.owner,m=x.mk;if(!u||u.dead){if(u){u.sub_hm=[];u.sub_hrR=null}x.t=0;return}if(!m||!subHM(u).includes(m)){x.t=0;return}
 if(m.tg){if(m.tg.dead){subHmDel(u,m);return}m.x=m.tg.x;m.y=m.tg.y;x.ti=units.indexOf(m.tg)}m.t=x.t;x.x=m.x;x.y=m.y;if(x.t<=.02)subHmDel(u,m)};
// kunai en vol : planté au bout de sa course (marque au sol) s'il n'a touché personne
AUXF.sub_hrkt=x=>{const p=x.p,u=x.owner;if(!p||x.done){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.done=1;x.t=0;if(p.hitAny||!u||u.dead)return;
 const m=subHmAdd(u,p.x,p.y,null);if(x.R&&!x.R.m)x.R.m=m};
AUXF.sub_ktagp=x=>{const p=x.p;if(!p||x.done){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.done=1;x.t=0;if(p.hitAny)return;const u=x.owner,q=subFree({x:p.x,y:p.y},10),a=x.a||0;
 aux.push({type:'sub_planted',x:q.x,y:q.y,r:0,t:.45,m:.45,team:u.team});const z=subWarn(u,q.x,q.y,70,.4);
 later(u,.4,()=>{z.done=1;subBoom(u,q.x,q.y,70,14,{kb:220});for(let i=0;i<4;i++){const b=a+.785+i*Math.PI/2,w=subFree({x:q.x+Math.cos(b)*95,y:q.y+Math.sin(b)*95},20);
  jx({jfx:'sub_tagfly',x:q.x,y:q.y,x2:w.x,y2:w.y,t:.36,m:.36});const z2=subWarn(u,w.x,w.y,48,.38);later(u,.38,()=>{z2.done=1;subBoom(u,w.x,w.y,48,8,{})},{x:w.x,y:w.y,vfx:'tag'})}},{x:q.x,y:q.y,vfx:'tag'})};
// règles de famille : fin de la fenêtre de relance du kunai (charge empruntée rendue) ; le 5e coup du combo de base marque la cible
subTH({
 update(u){const R=u.sub_hrR;if(!R)return;const pAlive=R.p&&!R.p.dead&&R.p.life>0,ok=SIMT<R.t&&(R.m?subHM(u).includes(R.m):pAlive||!R.p.hitAny);
  u.sub_hrRT=ok?Math.max(0,R.t-SIMT):0;if(ok)return;u.sub_hrR=null;u.sub_hrRT=0;if(R.bor&&u.chg===R.cg){const i=subIdx(u,'sub_hrk');if(i>0)u.chg[i]=Math.max(0,u.chg[i]-1)}},
 landed(src,t,dmg,o){if(o.melee&&o.basic&&src.cmbH===5&&src.cmbT>0&&t.team!==src.team&&!t.dead&&subHasF(src,1))subHmAdd(src,t.x,t.y,t)}});
AFTER.push(()=>UK.push('sub_hrRT'));
// ---------- visuels ----------
// kunai à trois pointes planté (marque au sol) : manche entouré de la formule, sceau jaune au sol
function subHrKunai(x,y,s,t){g.save();g.translate(x,y);g.rotate(.18);g.fillStyle='#34343c';g.fillRect(-1.6*s,-24*s,3.2*s,10*s);g.fillStyle='#f4f4f0';g.fillRect(-2.4*s,-23*s,4.8*s,7*s);g.fillStyle='#2a2a30';for(let i=0;i<3;i++)g.fillRect(-1.8*s,(-22+i*2.2)*s,3.6*s,.8*s);
 circ(0,-26*s,2.4*s,'#34343c');g.fillStyle='#e8ecf2';g.strokeStyle='#5a5e68';g.lineWidth=.8;g.beginPath();g.moveTo(-3.8*s,-14*s);g.lineTo(0,0);g.lineTo(3.8*s,-14*s);g.closePath();g.fill();g.stroke();
 g.beginPath();g.moveTo(-3*s,-14*s);g.lineTo(-7*s,-17*s);g.lineTo(-4.5*s,-11*s);g.moveTo(3*s,-14*s);g.lineTo(7*s,-17*s);g.lineTo(4.5*s,-11*s);g.fill();g.restore()}
// sceau : anneau de la formule (8 traits qui tournent), lueur au sol
function subHrSeal(px,py,R,t,al){const q=P(px,py,0);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(SUB_HY,(.5+.25*Math.sin(t*6))*al);g.lineWidth=2;gEll(px,py,R);g.stroke();
 g.strokeStyle=rgba('#fff3a0',.35*al);g.lineWidth=1;gEll(px,py,R*.62);g.stroke();
 for(let i=0;i<8;i++){const b=i*.785+t*1.6,a0=P(px+Math.cos(b)*R*.66,py+Math.sin(b)*R*.66,0),a1=P(px+Math.cos(b)*R*.94,py+Math.sin(b)*R*.94,0);g.strokeStyle=rgba(SUB_HY,.8*al);g.lineWidth=2;g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.stroke()}
 g.fillStyle=rgba(SUB_HY,.12*al);gEll(px,py,R);g.fill();g.restore();return q}
AUXD.sub_hmk=(x,k,t)=>{const tg=x.n===2&&x.ti!=null?units[x.ti]:null;if(x.n===2&&(!tg||tg.dead))return;const px=tg?tg.x:x.x,py=tg?tg.y:x.y,al=Math.min(1,x.t/.8,(x.m-x.t)/.15+.2);
 if(tg){const q=subHrSeal(px,py,30,t,al);const h=P(px,py,64+Math.sin(t*4)*3);g.save();g.globalCompositeOperation='lighter';circ(h.x,h.y,7*h.s,rgba(SUB_HY,.3*al));g.strokeStyle=rgba(SUB_HY,.9*al);g.lineWidth=1.6;
  g.beginPath();for(let i=0;i<14;i++){const b=i*.55+t*3,r=(1+i*.38)*h.s;g.lineTo(h.x+Math.cos(b)*r,h.y+Math.sin(b)*r*.8)}g.stroke();g.restore();return}
 const q=subHrSeal(px,py,18,t,al);g.save();g.globalAlpha*=al;subHrKunai(q.x,q.y,q.s,t);g.restore()};
AUXD.sub_hrkt=AUXD.sub_ktagp=()=>{};
// marque posée : éclat du sceau
JFXD.sub_hmpop=(f,k,e,t,u,tg)=>{const x=tg&&!tg.dead?tg.x:f.x,y=tg&&!tg.dead?tg.y:f.y,q=P(x,y,0);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(SUB_HY,.9*k);g.lineWidth=3*k+1;g.beginPath();g.ellipse(q.x,q.y,(8+e*36)*q.s,(3+e*13)*q.s,0,0,7);g.stroke();
 for(let i=0;i<6;i++){const b=i*1.047,h=P(x+Math.cos(b)*e*30,y+Math.sin(b)*e*30,10+e*30);circ(h.x,h.y,2.2*h.s*k,rgba('#fff3a0',.9*k))}};
// danse : aura dorée et éclairs autour du lanceur pendant les sauts
JFXD.sub_hrdance=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,30),s=q.s;g.globalCompositeOperation='lighter';circ(q.x,q.y,34*s,rgba(SUB_HY,.18*k));
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=1.5;for(let i=0;i<4;i++){const b=t*9+i*1.57;g.beginPath();g.moveTo(q.x+Math.cos(b)*12*s,q.y+Math.sin(b)*16*s);g.lineTo(q.x+Math.cos(b+.5)*30*s,q.y+Math.sin(b+.4)*34*s);g.stroke()}};
// relance du kunai prête : anneau pointillé jaune sous ton ninja
STATD.push((u,p,S)=>{if(u!==player||!(u.sub_hrRT>0)||u.dead)return;const t=performance.now()/1000;g.save();g.strokeStyle=rgba(SUB_HY,.7);g.lineWidth=2*S;g.setLineDash([5*S,5*S]);g.lineDashOffset=-t*30;g.beginPath();g.ellipse(p.x,p.y,30*S,11*S,0,0,7);g.stroke();g.setLineDash([]);
 g.strokeStyle=SUB_HY;g.lineWidth=3*S;g.beginPath();g.ellipse(p.x,p.y,30*S,11*S,0,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,u.sub_hrRT/3));g.stroke();g.restore()});
