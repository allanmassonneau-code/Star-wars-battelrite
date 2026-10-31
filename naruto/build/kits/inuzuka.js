// ===== Clan Inuzuka =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
// Identité : le ninken est un vrai partenaire (trait), les vrilles (Tsûga, Gatsûga, Garôga), la traque à l'odeur (Marquage, Instinct) et la bête (Shikyaku, Loup bicéphale).
// descriptions (une seule source pour le catalogue et les mécaniques)
const IN_D={
 gatsuga:'Double vrille avec ton ninken : chacune blesse ; un ennemi pris entre les deux est projeté en l\'air',
 instinct:'Bond au curseur ; une proie proche de l\'arrivée (sous 50 % de PV ou marquée) attire le bond : morsure qui saigne',
 ninken:'Ton ninken grandit et se bat seul 8 s : il plaque l\'ennemi visé (immobilisé 0,8 s), puis le traque et le mord',
 flair:'1,5 s : tu esquives le prochain coup d\'un écart, et ton ninken mord l\'attaquant, qui est révélé',
 tsuga:'Vrille éclair : au premier ennemi touché, tu le repousses et rebondis en arrière (frappe et repli)',
 beast:'À quatre pattes 5 s : rapide, ni ralenti ni entravé (3 s) ; griffes qui saignent (12 dégâts en 2 s), ninken qui mord deux fois plus',
 mark:'Le ninken bondit sur l\'ennemi visé et le marque 5 s : révélé, il subit +12 % de tes dégâts, tes vrilles le traquent',
 wolf:'Fusion en loup géant à deux têtes 7 s : rapide, vol de vie, chaque coup de base mord deux fois ; hurlement qui ralentit',
 garoga:'Double vrille géante qui fonce loin : emporte les ennemis touchés et les écrase à l\'arrivée (étourdis)'};
KIT('c5',[
 [1,'B','x.in_gatsuga','Gatsûga',IN_D.gatsuga,'tai'],
 [2,'C','x.in_instinct','Instinct bestial',IN_D.instinct,'claws'],
 [3,'S','x.in_ninken','Ninken',IN_D.ninken,'claws'],
 [4,'C','x.in_flair','Flair du chien',IN_D.flair,'claws'],
 [1,'C','x.in_tsuga','Tsûga',IN_D.tsuga,'tai'],
 [4,'D','x.in_beast','Shikyaku',IN_D.beast,'claws'],
 [1,'D','x.in_mark','Marquage',IN_D.mark,'claws'],
 [5,'S','x.in_wolf','Loup bicéphale',IN_D.wolf,'claws'],
 [5,'A','x.in_garoga','Garôga',IN_D.garoga,'tai'],
]);
// équilibrage du clan : facteur sur les dégâts infligés par un Inuzuka ; CLANBAL[5] (PV ×1,4, puissance ×1,4, dans nr_ninja.js) a été réglé
// en tenant compte de ce facteur (ambiance NRP)
const IN_BAL=.86;
// ---------- outils : le ninken partenaire ----------
const in_I=u=>units.indexOf(u);
// place du ninken au repos, à côté de son maître (comme le chien dessiné du clan)
const in_side=u=>({x:u.x+Math.cos(u.aim+1.9)*22,y:u.y+Math.sin(u.aim+1.9)*22+6});
// objets pendant lesquels le ninken est parti (morsure, vrille, fusion…) : le chien dessiné à côté du maître est alors caché
const IN_AWAY={in_dog:1,in_big:1,in_gat:1,in_garo:1,in_wolfx:1,in_hide:1};
function in_away(u){const i=in_I(u);for(const x of aux)if(IN_AWAY[x.type]&&x.ui===i)return true;return false}
// marque olfactive (Marquage) : qui est marqué, par qui
function in_marked(e,u){for(const x of aux)if(x.type==='in_mark'&&x.tg===e&&(!u||x.owner===u))return true;return false}
function in_markOn(u,e,d){if(e.dead)return;e.stealth=0;for(const x of aux)if(x.type==='in_mark'&&x.tg===e&&x.owner===u){x.t=x.m=d;return}
 aux.push({type:'in_mark',x:e.x,y:e.y,r:22,t:d,m:d,team:u.team,owner:u,tg:e,ti:in_I(e),ui:in_I(u)});say(e,'MARQUÉ','#f0b860')}
// traque : la vrille ou le bond part vers l'ennemi marqué le plus proche de la direction visée
function in_track(u,a,R){let b=null,bd=.6;for(const x of aux)if(x.type==='in_mark'&&x.owner===u&&x.tg&&!x.tg.dead){const e=x.tg;if(dist(u,e)>R)continue;const df=angDiff(ang(u,e),a);if(df<bd){bd=df;b=e}}return b?ang(u,b):a}
// le ninken bondit mordre e (trait, Flair du chien) ; n : 0 course, 1 morsure, 2 retour
function in_bite(u,e,dmg){const s=in_side(u);aux.push({type:'in_dog',x:s.x,y:s.y,a:ang(s,e),r:1,t:2.4,m:2.4,team:u.team,owner:u,tg:e,ti:in_I(e),ui:in_I(u),n:0,k:0,dmg});if(near(u.x,u.y))S('dash',u)}
// Flair du chien : le coup est esquivé, écart sur le côté, le ninken mord l'attaquant
function in_flairGo(u,src){const b=ang(src,u)+(rnd()<.5?1:-1)*1.25;u.haste=Math.max(u.haste,2);jx({jfx:'in_nose',x:u.x,y:u.y,ui:in_I(u),t:.6,m:.6,hit:1});
 if(!u.dash&&u.root<=0&&u.stun<=0)dash(u,b,95,.16,{jump:24});say(u,'FLAIR !','#f0d0a0');src.stealth=0;
 if(!src.dead&&dist(u,src)<440){for(const x of aux)if(x.type==='in_dog'&&x.owner===u)x.t=0;u.in_bcd=Math.max(u.in_bcd||0,1.5);if(!in_away(u))in_bite(u,src,10)}}
// ---------- mécaniques ----------
Object.assign(NAT,{
 // Gatsûga : le lanceur et son ninken foncent côte à côte (le chien à droite) ; un ennemi touché par les deux vrilles est projeté
 in_gatsuga:S_('Gatsûga',IN_D.gatsuga,8,{hero:'rey',line:{len:300,w:84},ai:{mode:'gap',min:60,max:290,p:.6}},(u,a)=>{a=in_track(u,a,340);u.aim=a;const L=300,dur=.32,px=-Math.sin(a),py=Math.cos(a),i=in_I(u);
  S('rasengan',u);S('dash',u);anim(u,'in_drill',dur+.12);dash(u,a,L,dur,{});for(const x of aux)if(x.type==='in_dog'&&x.owner===u)x.t=0;
  const sx=u.x+px*26,sy=u.y+py*26;aux.push({type:'in_gat',x:sx,y:sy,a,len:L,t:dur,m:dur,team:u.team,owner:u,ui:i,sx,sy,hc:new Set(),hd:new Set(),r:1});
  aux.push({type:'in_scr',x:u.x,y:u.y,a,len:L,w:26,t:1.1,m:1.1,team:u.team,owner:u,n:dur,r:1});
  jx({jfx:'in_drill',ui:i,x:u.x,y:u.y,a,t:dur+.05,m:dur+.05,dog:1});jx({jfx:'in_burst',x:u.x,y:u.y,a,t:.35,m:.35})}),
 // Tsûga : vrille seule ; au premier ennemi touché, repousse et rebond en arrière
 in_tsuga:S_('Tsûga',IN_D.tsuga,7,{line:{len:280,w:50},ai:{mode:'gap',min:50,max:260,p:.6}},(u,a)=>{a=in_track(u,a,320);u.aim=a;const i=in_I(u);
  S('rasengan',u);S('dash',u);anim(u,'in_drill',.3);dash(u,a,280,.25,{});
  aux.push({type:'in_tsu',x:u.x,y:u.y,a,t:.3,m:.3,team:u.team,owner:u,ui:i,n:0});aux.push({type:'in_scr',x:u.x,y:u.y,a,len:280,w:0,t:.8,m:.8,team:u.team,owner:u,n:.25,r:0});
  jx({jfx:'in_drill',ui:i,x:u.x,y:u.y,a,t:.3,m:.3,small:1})}),
 // Instinct bestial : bond ; une proie (blessée ou marquée) près de l'arrivée attire le bond, morsure qui saigne
 in_instinct:S_('Instinct bestial',IN_D.instinct,7,{hero:'bossk',ai:{mode:'gap',min:110,max:330,p:.45}},(u,a,td)=>{const p=fwd(u,a,clamp(td||260,70,270));let prey=null,bd=150;
  for(const e of enemies(u)){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd&&dist(u,e)<380&&(e.hp<e.max*.5||in_marked(e,u))){bd=d;prey=e}}
  let tx=p.x,ty=p.y;if(prey){const b=ang(prey,u),r=prey.r+u.r+4;tx=prey.x+Math.cos(b)*r;ty=prey.y+Math.sin(b)*r;say(u,'PROIE !','#ff8a5a');jx({jfx:'in_prey',ti:in_I(prey),x:prey.x,y:prey.y,t:.55,m:.55})}
  const aa=Math.atan2(ty-u.y,tx-u.x);u.aim=aa;S('dash',u);anim(u,'in_pounce',.42);
  dash(u,aa,Math.hypot(tx-u.x,ty-u.y),.3,{jump:58,end:()=>{jx({jfx:'in_land',x:u.x,y:u.y,t:.4,m:.4,r:40});
   if(prey&&!prey.dead&&dist(u,prey)<prey.r+u.r+32){u.aim=ang(u,prey);VFX='claws';hit(prey,u,6,{melee:1,dot:{dps:2,dur:3}});VFX=null;jx({jfx:'in_claw',x:prey.x,y:prey.y,a:u.aim,t:.4,m:.4});S('bone',u)}}})}),
 // Ninken : le chien grandit, plaque la cible visée puis la traque et la mord
 in_ninken:S_('Ninken',IN_D.ninken,14,{hero:'iden',line:{len:460,w:30},ai:RG(460,.6)},(u,a,td)=>{const e=pick(u,a,td||300,480),s=in_side(u);S('poof',u);S('roar',u);anim(u,'point',.55);
  for(const x of aux)if(x.type==='in_dog'&&x.owner===u)x.t=0;const tp=e?{x:e.x,y:e.y}:fwd(u,a,Math.min(td||300,420));
  aux.push({type:'in_big',x:s.x,y:s.y,a:Math.atan2(tp.y-s.y,tp.x-s.x),r:1.75,t:8,m:8,team:u.team,owner:u,ui:in_I(u),tg:e,ti:e?in_I(e):null,n:0,k:.42,tx:tp.x,ty:tp.y});
  jx({jfx:'in_poof',x:s.x,y:s.y,r:44,t:.55,m:.55});say(u,'NINKEN !','#f0d0a0')}),
 // Flair du chien : esquive le prochain coup (voir le trait : take)
 in_flair:S_('Flair du chien',IN_D.flair,8,{hero:'ahsoka',ai:DEF},(u)=>{u.in_flair=1.5;S('deflect',u);anim(u,'in_sniff',.5);jx({jfx:'in_nose',x:u.x,y:u.y,ui:in_I(u),t:.7,m:.7})}),
 // Shikyaku : posture à quatre pattes (vitesse, saignement, morsures plus fréquentes)
 in_beast:S_('Shikyaku',IN_D.beast,8,{ai:SELF(320,.5)},(u)=>{S('roar',u);u.haste=Math.max(u.haste,5);u.slowImm=Math.max(u.slowImm,3);u.slow=0;u.root=0;u.in_four=5;anim(u,'in_four',5);jx({jfx:'in_feral',ui:in_I(u),x:u.x,y:u.y,t:.6,m:.6})}),
 // Marquage : le ninken bondit (projectile) et marque l'ennemi touché
 in_mark:S_('Marquage',IN_D.mark,7,{line:{len:440,w:24},ai:RG(440,.6)},(u,a)=>{S('dash',u);anim(u,'point',.35);for(const x of aux)if(x.type==='in_dog'&&x.owner===u)x.t=0;
  const s=in_side(u),tx=u.x+Math.cos(a)*440,ty=u.y+Math.sin(a)*440,b=Math.atan2(ty-s.y,tx-s.x);
  proj(u,a,{x:s.x,y:s.y,vx:Math.cos(b)*620,vy:Math.sin(b)*620,spd:620,r:11,dmg:6,life:.7,col:'#f4f0e8',kind:'in_dogp',noClash:1,onHit:(p,t)=>{in_markOn(p.owner,t,5)}});
  aux.push({type:'in_hide',x:u.x,y:u.y,t:.9,m:.9,team:u.team,owner:u,ui:in_I(u),p:projs[projs.length-1]})}),
 // Loup bicéphale : fusion (le dessin du ninja devient un loup géant à deux têtes)
 in_wolf:ULT('Loup bicéphale',IN_D.wolf,{tele:{self:1,r:220},ai:SELF(250,.8)},(u)=>{S('poof',u);S('roar',u);u.giant=Math.max(u.giant,7);u.haste=Math.max(u.haste,7);u.lsB=Math.max(u.lsB,7);u.in_wolf=7;anim(u,'roar',.7);
  for(const x of aux)if((x.type==='in_dog'||x.type==='in_big')&&x.owner===u)x.t=0;aux.push({type:'in_wolfx',x:u.x,y:u.y,t:7,m:7,team:u.team,owner:u,ui:in_I(u),r:1});
  for(const e of enemies(u))if(dist(u,e)<220+e.r)hit(e,u,6,{slow:1.5,unblockable:1});
  jx({jfx:'in_howl',ui:in_I(u),x:u.x,y:u.y,r:220,t:.9,m:.9});jx({jfx:'in_poof',x:u.x,y:u.y,r:70,t:.6,m:.6});if(near(u.x,u.y))shake=Math.max(shake,.3)}),
 // Garôga : double vrille géante qui emporte les ennemis et les écrase à l'arrivée
 in_garoga:ULT('Garôga',IN_D.garoga,{hero:'anakin',line:{len:430,w:110},ai:{max:360,p:.8}},(u,a,td)=>{a=in_track(u,a,460);u.aim=a;const L=clamp((td||380)+30,220,430),dur=.6,i=in_I(u);
  S('rasengan',u);S('heavy',u);anim(u,'in_drill',dur+.15);u.unstop=Math.max(u.unstop,dur+.1);dash(u,a,L,dur,{});for(const x of aux)if((x.type==='in_dog'||x.type==='in_big')&&x.owner===u)x.t=0;
  aux.push({type:'in_garo',x:u.x,y:u.y,a,len:L,t:dur+.12,m:dur+.12,team:u.team,owner:u,ui:i,c:[],n:0,r:1});aux.push({type:'in_scr',x:u.x,y:u.y,a,len:L,w:0,t:1.6,m:1.6,team:u.team,owner:u,n:dur,r:2});
  jx({jfx:'in_drill',ui:i,x:u.x,y:u.y,a,t:dur+.05,m:dur+.05,big:1});jx({jfx:'in_burst',x:u.x,y:u.y,a,t:.45,m:.45,big:1})}),
});
Object.assign(NATHERO,{in:'bossk'});
// ---------- logique des objets (hôte) ----------
// petit ninken qui court mordre une cible puis revient
AUXF.in_dog=(x,dt)=>{const o=x.owner,e=x.tg;if(!o||o.dead){x.t=0;return}
 if(x.n===0){if(!e||e.dead||x.t<.8){x.n=2;return}const d=Math.hypot(e.x-x.x,e.y-x.y);x.a=Math.atan2(e.y-x.y,e.x-x.x);
  if(d<e.r+12){x.n=1;x.k=.28;VFX='claws';hit(e,o,x.dmg,{in_d:1,slow:.3});VFX=null;jx({jfx:'in_fang',x:e.x,y:e.y,a:x.a,t:.3,m:.3});if(near(e.x,e.y))S('bone',o)}
  else{const v=Math.min(d,780*dt);x.x+=Math.cos(x.a)*v;x.y+=Math.sin(x.a)*v}}
 else if(x.n===1){if(e&&!e.dead){x.x=e.x-Math.cos(x.a)*(e.r+6);x.y=e.y-Math.sin(x.a)*(e.r+6)}if(x.k<=0)x.n=2}
 else{const s=in_side(o),d=Math.hypot(s.x-x.x,s.y-x.y);x.a=Math.atan2(s.y-x.y,s.x-x.x);if(d<16){x.t=0;return}const v=Math.min(d,680*dt);x.x+=Math.cos(x.a)*v;x.y+=Math.sin(x.a)*v}};
// grand ninken (Ninken) ; n : 0 bond, 1 traque, 2 morsure, 3 plaque au sol
AUXF.in_big=(x,dt)=>{const o=x.owner;if(!o||o.dead){x.t=0;return}
 if(x.t<=0){jx({jfx:'in_poof',x:x.x,y:x.y,r:40,t:.5,m:.5});return}
 if(x.n===0){const d=Math.hypot(x.tx-x.x,x.ty-x.y),v=920*dt;x.a=Math.atan2(x.ty-x.y,x.tx-x.x);if(d>v){x.x+=Math.cos(x.a)*v;x.y+=Math.sin(x.a)*v}else{x.x=x.tx;x.y=x.ty}
  if(d<=v||x.k<=0){const e=nearE(o,x.x,x.y,60);x.n=1;x.k=.3;jx({jfx:'in_land',x:x.x,y:x.y,r:52,t:.45,m:.45});
   if(e){x.tg=e;x.ti=in_I(e);x.n=3;x.k=.8;VFX='claws';hit(e,o,8,{root:.8,in_d:1,unblockable:1});VFX=null;say(e,'PLAQUÉ !','#f0d0a0');jx({jfx:'in_fang',x:e.x,y:e.y,a:x.a,t:.35,m:.35,big:1});if(near(e.x,e.y)){S('bone',o);S('heavy',o);shake=Math.max(shake,.15)}}}return}
 if(x.n===3){const e=x.tg;if(!e||e.dead||x.k<=0){x.n=1;x.k=.45}else{x.x=e.x-Math.cos(x.a)*6;x.y=e.y-Math.sin(x.a)*6}return}
 let e=x.tg;if(!e||e.dead||dist(e,o)>650){e=x.tg=nearE(o,x.x,x.y,520);x.ti=e?in_I(e):null}
 if(!e){const s=in_side(o),d=Math.hypot(s.x-x.x,s.y-x.y);x.a=Math.atan2(s.y-x.y,s.x-x.x);x.n=1;if(d>44){const v=Math.min(d-44,300*dt);x.x+=Math.cos(x.a)*v;x.y+=Math.sin(x.a)*v}return}
 const d=Math.hypot(e.x-x.x,e.y-x.y);x.a=Math.atan2(e.y-x.y,e.x-x.x);
 if(d>e.r+24){const v=Math.min(d-e.r-20,285*dt);x.x+=Math.cos(x.a)*v;x.y+=Math.sin(x.a)*v;if(x.k<.45)x.n=1}
 else if(x.k<=0){x.k=.85;x.n=2;VFX='claws';hit(e,o,4,{in_d:1,slow:.45});VFX=null;jx({jfx:'in_fang',x:e.x,y:e.y,a:x.a,t:.3,m:.3});if(near(e.x,e.y))S('bone',o)}
 else if(x.k<.45)x.n=1};
// Gatsûga : la vrille du chien file en parallèle ; chaque vrille touche une fois, les deux = projeté
AUXF.in_gat=x=>{const u=x.owner;if(!u||u.dead){x.t=0;return}const e1=Math.min(1,1-x.t/x.m);x.x=x.sx+Math.cos(x.a)*x.len*e1;x.y=x.sy+Math.sin(x.a)*x.len*e1;
 for(const e of enemies(u)){
  if(!x.hc.has(e)&&dist(u,e)<e.r+22){x.hc.add(e);in_gatHit(u,e,8,x.hd.has(e),u.x,u.y,0)}
  if(!x.hd.has(e)&&Math.hypot(e.x-x.x,e.y-x.y)<e.r+18){x.hd.add(e);in_gatHit(u,e,6,x.hc.has(e),x.x,x.y,1)}}};
function in_gatHit(u,e,dmg,two,fx0,fy0,dog){VFX='gatsuga';hit(e,u,dmg,two?{melee:1,in_d:dog,air:.45}:{melee:1,in_d:dog,kb:70,fx:fx0,fy:fy0});VFX=null;
 if(two){say(e,'TENAILLE !','#ffffff');jx({jfx:'in_pincer',x:e.x,y:e.y,t:.45,m:.45});if(near(e.x,e.y)){S('heavy',u);shake=Math.max(shake,.15)}}else if(near(e.x,e.y))sparks(e.x,e.y,'#ffffff',6,'tai')}
// Tsûga : au premier contact, coup + rebond en arrière
AUXF.in_tsu=x=>{const u=x.owner;if(!u||u.dead||x.n)return;if(!u.dash){x.t=0;return}x.x=u.x;x.y=u.y;
 for(const e of enemies(u))if(dist(u,e)<u.r+e.r+10){x.n=1;VFX='gatsuga';hit(e,u,11,{melee:1,kb:170});VFX=null;
  u.dash=null;dash(u,x.a+Math.PI+(rnd()-.5)*.25,150,.28,{jump:46});anim(u,'backflip',.4);jx({jfx:'in_ric',x:(u.x+e.x)/2,y:(u.y+e.y)/2,a:x.a,t:.35,m:.35});if(near(u.x,u.y)){S('hit',u);shake=Math.max(shake,.1)}break}};
// Garôga : happe les ennemis devant la vrille, les emporte, puis les écrase à l'arrivée
AUXF.in_garo=x=>{const u=x.owner;if(!u||u.dead){x.t=0;return}if(x.n)return;
 if(u.dash){x.x=u.x;x.y=u.y;const ca=Math.cos(x.a),sa=Math.sin(x.a);
  for(const e of enemies(u))if(!x.c.includes(e)&&dist(u,e)<e.r+52){x.c.push(e);VFX='gatsuga';hit(e,u,4,{unblockable:1});VFX=null;if(near(e.x,e.y))sparks(e.x,e.y,'#ffffff',8,'tai')}
  x.c.forEach((e,i)=>{if(e.dead||e.unstop>0)return;const s=(i%2?1:-1)*Math.ceil(i/2)*20;e.x=u.x+ca*(u.r+e.r+6)-sa*s;e.y=u.y+sa*(u.r+e.r+6)+ca*s;e.kx=e.ky=0;e.stun=Math.max(e.stun,.15);e.airT=Math.max(e.airT||0,.2);e.cast=null;e.dash=null;collide(e)});return}
 x.n=1;x.t=Math.min(x.t,.05);const p={x:u.x+Math.cos(x.a)*26,y:u.y+Math.sin(x.a)*26};
 for(const e of enemies(u)){const cg=x.c.includes(e);if(cg||Math.hypot(e.x-p.x,e.y-p.y)<100+e.r){VFX='gatsuga';hit(e,u,cg?12:7,{stun:cg?.4:0,kb:cg?190:150,fx:p.x,fy:p.y,unblockable:1});VFX=null}}
 jx({jfx:'in_crater',x:p.x,y:p.y,r:110,t:1,m:1});if(near(p.x,p.y)){S('boom',u);S('rock',u);shake=Math.max(shake,.4)}};
// marque olfactive : suit la cible, qui ne peut plus se rendre invisible
AUXF.in_mark=x=>{const e=x.tg;if(!e||e.dead){x.t=0;return}x.x=e.x;x.y=e.y;if(e.stealth>0)e.stealth=0};
// Marquage : le chien vole (projectile) ; à la fin, il revient en courant
AUXF.in_hide=x=>{const p=x.p,u=x.owner;if(!p||!u)return;if(p.dead||p.life<=0||projs.indexOf(p)<0){x.t=0;x.p=null;if(!u.dead){aux.push({type:'in_dog',x:p.x,y:p.y,a:ang(p,u),r:1,t:1.2,m:1.2,team:u.team,owner:u,tg:null,ti:null,ui:in_I(u),n:2,k:0,dmg:0})}}};
AUXF.in_wolfx=x=>{const u=x.owner;if(!u||u.dead||!(u.in_wolf>0)){x.t=0;return}x.x=u.x;x.y=u.y};
AUXF.in_scr=()=>{};
// ---------- dessins ----------
// ninken (repère : pieds en 0,0, tourné vers +x) ; st : 0 court (mv=0 : immobile), 1 mord, 2 bondit, 3 plaque, 4 assis
function in_dogBody(st,t,col,ear,mane,mv){const run=st===0&&mv!==0?Math.sin(t*20):0,wag=Math.sin(t*(st===4?9:15)),sit=st===4;g.lineCap='round';g.lineJoin='round';
 const L=st===2?[[-8,-9,-15,-5],[-4,-9,-10,-4],[5,-9,12,-6],[9,-9,16,-7]]:st===3?[[-8,-9,-10,-1],[-4,-9,-5,-1],[6,-9,11,0],[10,-9,15,0]]:sit?[[-7,-5,-3,-1],[-3,-5,1,-1],[6,-12,6,-1],[9,-12,10,-1]]:[[-7,-8,-7+run*3,-1],[-3,-8,-3-run*3,-1],[5,-8,5+run*3,-1],[9,-8,9-run*3,-1]];
 for(const w of[4.6,2.9]){g.strokeStyle=w>4?OUT:col;g.lineWidth=w;g.beginPath();for(const l of L){g.moveTo(l[0],l[1]);g.lineTo(l[2],l[3])}g.stroke()}
 if(sit){outlined(()=>{g.moveTo(-9,-6);g.quadraticCurveTo(-18,-6+wag*2,-20,-12+wag*3);g.quadraticCurveTo(-14,-9,-8,-3)},col);outlined(()=>g.ellipse(1,-12,11,7.5,-.5,0,7),col)}
 else{outlined(()=>{g.moveTo(-10,-15);g.quadraticCurveTo(-19,-16+wag*2,-17+wag*2,-25);g.quadraticCurveTo(-13,-19,-9,-9)},col);
  outlined(()=>g.ellipse(0,-11.5,12.5,6.8,st===2?-.12:0,0,7),col);g.fillStyle='rgba(120,100,80,.18)';g.beginPath();g.ellipse(-1,-8,9,2.2,0,0,7);g.fill()}
 if(mane){g.fillStyle=col;g.strokeStyle=OUT;g.lineWidth=1.2;g.beginPath();g.moveTo(3,-17);for(let i=0;i<5;i++)g.lineTo(5+i*1.6,-21+(i%2)*3.5);g.lineTo(11,-12);g.closePath();g.fill();g.stroke()}
 const bt=st===1,hx=bt?13:sit?9:11,hy=bt?-16:sit?-22:-18;outlined(()=>g.ellipse(hx,hy,6.3,5.6,0,0,7),col);
 if(bt){g.fillStyle='#6a1410';g.beginPath();g.moveTo(hx+3,hy);g.lineTo(hx+12,hy-4);g.lineTo(hx+12,hy+5);g.closePath();g.fill();
  outlined(()=>{g.moveTo(hx+1,hy-3);g.lineTo(hx+12,hy-5);g.lineTo(hx+11,hy-1.5)},col);outlined(()=>{g.moveTo(hx+1,hy+2.5);g.lineTo(hx+11,hy+6);g.lineTo(hx+10,hy+3)},col);
  g.fillStyle='#fff';g.beginPath();g.moveTo(hx+7,hy-2);g.lineTo(hx+8,hy+.5);g.lineTo(hx+9,hy-2.4);g.moveTo(hx+7,hy+3.4);g.lineTo(hx+8,hy+1.2);g.lineTo(hx+9,hy+3.9);g.fill()}
 else outlined(()=>g.ellipse(hx+4.6,hy+2,3.7,2.6,0,0,7),col);
 g.fillStyle=ear;g.strokeStyle=OUT;g.lineWidth=1.2;g.beginPath();g.moveTo(hx-3.4,hy-3.5);g.lineTo(hx-5.6,hy-10.5);g.lineTo(hx-.4,hy-5);g.closePath();g.moveTo(hx+1.6,hy-4.6);g.lineTo(hx+2,hy-11);g.lineTo(hx+5,hy-4.4);g.closePath();g.fill();g.stroke();
 g.fillStyle='#120c08';g.fillRect(hx+1.6,hy-2.6,1.9,1.9);if(!bt){g.beginPath();g.arc(hx+8.4,hy+1.2,1.4,0,7);g.fill()}}
// ninken dans le monde (ombre au sol, saut z, taille sc)
function in_dogAt(x,y,z,a,sc,st,t,mv){const q=P(x,y,0),p=P(x,y,z||0),s=p.s*1.25*sc,f=Math.cos(a)>=0?1:-1;g.save();g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(q.x,q.y,13*s,4.2*s,0,0,7);g.fill();
 g.translate(p.x,p.y);g.scale(s*f,s);in_dogBody(st,t,'#f4f0e8','#c8a080',sc>1.3,mv);g.restore()}
// chien du clan à côté de son maître (remplace le dessin d'origine : même ninken partout) : assis à l'arrêt, court, bondit quand le maître frappe
function in_dogSide(u){if(u.dead)return;const a=u.aim||0,atk=u.swing>0,b=a+(atk?0:1.9),d=atk?30:22,t=performance.now()/1000;const mv=u.moving||u.dash;in_dogAt(u.x+Math.cos(b)*d,u.y+Math.sin(b)*d+6,atk?7:0,a,1,atk?1:mv?0:4,t,mv?1:0)}
// vrille : cône de chakra gris qui tourne, pointe vers l'avant (repère écran, R rayon, L longueur)
function in_drillDraw(q,ra,R,L,t,c1,c2,al,ears){g.save();g.translate(q.x,q.y);g.rotate(ra);g.lineCap='round';g.lineJoin='round';
 g.strokeStyle=rgba('#ffffff',.5*al);g.lineWidth=1.6;g.beginPath();for(let i=0;i<4;i++){const y=(i-1.5)*R*.45,l=L*(.45+((t*6+i*.31)%1)*.6);g.moveTo(-L*.5,y);g.lineTo(-L*.5-l,y)}g.stroke();
 if(ears){g.fillStyle=ears;g.strokeStyle=OUT;g.lineWidth=1.3;g.beginPath();g.moveTo(-L*.2,-R*.78);g.lineTo(-L*.34,-R*1.5);g.lineTo(-L*.04,-R*.92);g.closePath();g.moveTo(-L*.04,-R*.9);g.lineTo(-L*.06,-R*1.55);g.lineTo(L*.12,-R*.82);g.closePath();g.fill();g.stroke()}
 const cone=()=>{g.beginPath();g.moveTo(L*.85,0);g.quadraticCurveTo(L*.2,-R*1.05,-L*.38,-R*.86);g.quadraticCurveTo(-L*.64,0,-L*.38,R*.86);g.quadraticCurveTo(L*.2,R*1.05,L*.85,0);g.closePath()};
 cone();g.fillStyle=rgba(c2,.85*al);g.fill();g.strokeStyle=rgba('#140c08',.6*al);g.lineWidth=2;g.stroke();
 g.save();cone();g.clip();for(let i=0;i<6;i++){const s=i/5,x=-L*.44+s*L*1.08,ry=R*(1.05-s*.86),rx=ry*.42,a0=t*32+i*1.1;g.strokeStyle=rgba(i%2?c1:'#ffffff',.95*al);g.lineWidth=Math.max(1.3,R*.16*(1-s*.45));g.beginPath();g.ellipse(x,0,rx,ry,0,a0,a0+3.3);g.stroke()}g.restore();
 g.strokeStyle=rgba('#ffffff',.65*al);g.lineWidth=2;g.beginPath();g.moveTo(L*.62,-R*.16);g.quadraticCurveTo(L*.12,-R*.74,-L*.3,-R*.62);g.stroke();g.restore()}
const in_ra=a=>Math.atan2(Math.sin(a)*K,Math.cos(a));
// vrilles qui suivent le lanceur (et la vrille du chien pour Gatsûga)
JFXD.in_drill=(f,k,e,t,u)=>{if(!u||u.dead)return;const al=Math.min(1,k*6,e*10);
 if(f.small){const x=aux.find(a=>a.type==='in_tsu'&&a.ui===f.ui);if(!x||x.n)return}
 const z=(u.z||0)+(f.big?44:40),q=P(u.x,u.y,z),ra=in_ra(f.a);
 if(f.big){const ox=-Math.sin(ra),oy=Math.cos(ra);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.16*al);g.beginPath();g.ellipse(q.x,q.y,74*q.s,44*q.s,ra,0,7);g.fill();g.restore();
  const sw=Math.sin(t*14),ord=sw>0?[-1,1]:[1,-1];for(const sg of ord){const w=sg*sw*15*q.s,c=Math.cos(t*14)*sg;in_drillDraw({x:q.x+ox*w,y:q.y+oy*w},ra,(33+c*3)*q.s,92*q.s,t+(sg>0?.5:0),sg>0?'#b8b4ac':'#9a9aa2',sg>0?'#eeece6':'#dcdad4',al,'#a88868')}return}
 in_drillDraw(q,ra,(f.small?26:30)*q.s,(f.small?58:66)*q.s,t,'#9a9aa2','#e2e2e8',al);
 if(f.dog){const x=aux.find(a=>a.type==='in_gat'&&a.ui===f.ui);if(x){const p=P(x.x,x.y,26);in_drillDraw(p,in_ra(x.a),21*p.s,48*p.s,t+.3,'#c8a080','#f4f0e8',al,'#c8a080')}}};
// traces au sol (griffures des vrilles, sillon de Garôga) : se dessinent au rythme de la vrille puis s'effacent
AUXD.in_scr=(x,k,t)=>{const e=Math.min(1,(x.m-x.t)/Math.max(.05,x.n||.3)),L=x.len*e;if(L<16)return;const ca=Math.cos(x.a),sa=Math.sin(x.a),px=-sa,py=ca,al=Math.min(1,x.t/.5),big=x.r>1;
 const pt=(d,o)=>P(x.x+ca*d+px*o,x.y+sa*d+py*o),tr=big?[[0,15,0],[0,15,Math.PI]]:x.w?[[0,5,0],[x.w,4,1]]:[[0,5,0]];g.save();g.lineCap='round';g.lineJoin='round';
 for(const o of big?[0]:tr.map(r=>r[0])){const A=pt(8,o),B=pt(L,o);g.strokeStyle=rgba('#3a2a1a',(big?.3:.2)*al);g.lineWidth=(big?44:15)*A.s;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B.x,B.y);g.stroke();
  if(big){g.strokeStyle=rgba('#c8b898',.25*al);g.lineWidth=3;for(const sd of[-1,1]){const C=pt(8,sd*24),D=pt(L,sd*24);g.beginPath();g.moveTo(C.x,C.y);g.lineTo(D.x,D.y);g.stroke()}}}
 for(const [o,amp,ph] of tr)for(const [c,lw] of[[rgba('#1e140c',.6*al),2.8],[rgba('#f0e4c8',.42*al),1.1]]){g.strokeStyle=c;g.lineWidth=lw;g.beginPath();for(let d=8;d<=L;d+=4){const p=pt(d,o+Math.sin(d*.2+ph)*amp);d>8?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}g.stroke()}
 if(big)for(let i=0;i<8;i++){const d=L*(i+.5)/8,sd=((i*53)%44)-22,q=pt(d,sd);g.fillStyle=rgba(i%2?'#6a4a30':'#8a6a48',.85*al);g.beginPath();g.moveTo(q.x-4*q.s,q.y);g.lineTo(q.x-1*q.s,q.y-5*q.s);g.lineTo(q.x+4*q.s,q.y-1*q.s);g.closePath();g.fill()}
 g.restore()};
// marque : anneau d'odeur au sol
AUXD.in_mark=(x,k,t)=>{const tg=x.ti!=null?units[x.ti]:null;if(!tg||tg.dead)return;const al=Math.min(1,x.t/.6);g.save();g.strokeStyle=rgba('#f0b860',.7*al);g.lineWidth=2;g.setLineDash([6,5]);g.lineDashOffset=-t*20;gEll(tg.x,tg.y,26);g.stroke();g.setLineDash([]);
 for(let i=0;i<3;i++){const b=t*.8+i*2.09,q=P(tg.x+Math.cos(b)*30,tg.y+Math.sin(b)*30*.8);g.fillStyle=rgba('#c89048',.55*al);g.beginPath();g.ellipse(q.x,q.y,2.6*q.s,2*q.s,0,0,7);g.fill();for(let j=-1;j<=1;j++){g.beginPath();g.arc(q.x+j*2.4*q.s,q.y-3*q.s,1*q.s,0,7);g.fill()}}g.restore()};
// projectile : le ninken en plein bond
PROJD.in_dogp=(p,R,ra,t)=>{const f=Math.cos(ra)>=0?1:-1,tl=f>0?ra:ra-Math.PI;g.save();g.rotate(ra);g.strokeStyle=rgba('#f0c870',.65);g.lineWidth=1.6;g.lineCap='round';g.beginPath();for(let i=0;i<3;i++){const y=(i-1)*5-6;g.moveTo(-14,y);g.quadraticCurveTo(-21,y-4+Math.sin(t/60+i)*3,-29,y)}g.stroke();g.restore();
 g.rotate(clamp(tl*.6,-.5,.5));g.scale(1.3*f,1.3);g.translate(0,10);in_dogBody(2,t/1000,'#f4f0e8','#c8a080')};
// morsure : deux mâchoires crantées qui claquent
JFXD.in_fang=(f,k,e)=>{const q=P(f.x,f.y,32),s=q.s*(f.big?1.45:1),c=Math.min(1,e*3.2),gap=(1-c)*13*s;g.save();g.translate(q.x,q.y);g.rotate(in_ra(f.a||0)*.25);g.globalAlpha=Math.min(1,k*2.5);
 g.fillStyle='#ffffff';g.strokeStyle=OUT;g.lineWidth=1.4;for(const sg of[-1,1]){const y0=sg*gap;g.beginPath();g.moveTo(-15*s,y0);g.quadraticCurveTo(0,y0+sg*13*s,15*s,y0);for(let i=0;i<4;i++){const x0=15*s-i*7.5*s;g.lineTo(x0-3.75*s,y0-sg*6.5*s);g.lineTo(x0-7.5*s,y0)}g.closePath();g.fill();g.stroke()}
 if(c>=1){g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ff6a4a',.6*k);g.beginPath();for(let i=0;i<10;i++){const b=i*.628,L=i%2?6*s:20*s*(1.3-k);g.lineTo(Math.cos(b)*L,Math.sin(b)*L*.7)}g.closePath();g.fill()}g.restore()};
// griffures (Instinct bestial)
JFXD.in_claw=(f,k,e)=>{const q=P(f.x,f.y,34),s=q.s,L=26*s*Math.min(1,e*4);g.save();g.translate(q.x,q.y);g.rotate(in_ra(f.a)+.9);g.lineCap='round';
 for(const [w,c] of[[5.5,rgba('#a0281e',.75*k)],[2.2,rgba('#ffffff',.95*k)]]){g.strokeStyle=c;g.lineWidth=w*s;g.beginPath();for(const o of[-8,0,8]){g.moveTo(-L,o*s-L*.12);g.lineTo(L,o*s+L*.12)}g.stroke()}g.restore()};
// prise en tenaille (Gatsûga) : croix blanche
JFXD.in_pincer=(f,k,e)=>{const q=P(f.x,f.y,36),s=q.s*(1+e*.5);g.save();g.translate(q.x,q.y);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',k);g.lineCap='round';
 for(const [w,c] of[[9,rgba('#c8c4bc',.6*k)],[3.5,rgba('#ffffff',k)]]){g.strokeStyle=c;g.lineWidth=w*q.s;g.beginPath();g.moveTo(-22*s,-14*s);g.lineTo(22*s,14*s);g.moveTo(-22*s,14*s);g.lineTo(22*s,-14*s);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=2;g.beginPath();g.ellipse(0,0,30*s,20*s,0,0,7);g.stroke();g.restore()};
// rebond de Tsûga
JFXD.in_ric=(f,k,e)=>{const q=P(f.x,f.y,30),s=q.s;g.save();g.translate(q.x,q.y);g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.9*k);g.beginPath();for(let i=0;i<12;i++){const b=i*.5236,L=i%2?5*s:(14+e*16)*s;g.lineTo(Math.cos(b)*L,Math.sin(b)*L*.75)}g.closePath();g.fill();
 g.strokeStyle=rgba('#c8c4bc',.8*k);g.lineWidth=2.5;const b=in_ra(f.a)+Math.PI;g.beginPath();g.arc(0,0,(18+e*14)*s,b-.9,b+.9);g.stroke();g.restore()};
// éclat de départ des vrilles
JFXD.in_burst=(f,k,e)=>{const q=P(f.x,f.y,6),s=q.s*(f.big?1.7:1),ra=in_ra(f.a);g.save();g.translate(q.x,q.y);g.strokeStyle=rgba('#e8e0d0',.7*k);g.lineWidth=3*s;g.beginPath();g.ellipse(0,0,(20+e*40)*s,(20+e*40)*s*K,0,0,7);g.stroke();
 g.rotate(ra+Math.PI);g.fillStyle=rgba('#c8b898',.45*k);for(let i=0;i<5;i++){const b=(i-2)*.32,d=(14+e*46)*s;g.beginPath();g.ellipse(Math.cos(b)*d,Math.sin(b)*d,7*s*(1+e),4*s*(1+e),b,0,7);g.fill()}g.restore()};
// proie repérée (Instinct bestial)
JFXD.in_prey=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,r=(34-e*12)*s;g.save();g.strokeStyle=rgba('#ff5a3a',.9*k);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,r,r*K,0,0,7);g.stroke();
 g.fillStyle=rgba('#ff5a3a',.9*k);for(let i=0;i<3;i++){const b=t*2+i*2.094,x=q.x+Math.cos(b)*r*1.3,y=q.y+Math.sin(b)*r*1.3*K;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(b+Math.PI+.35)*9*s,y+Math.sin(b+Math.PI+.35)*9*s*K);g.lineTo(x+Math.cos(b+Math.PI-.35)*9*s,y+Math.sin(b+Math.PI-.35)*9*s*K);g.fill()}g.restore()};
// nuage de fumée (le ninken grandit / redevient petit, fusion)
JFXD.in_poof=(f,k,e)=>{const q=P(f.x,f.y,18),R=f.r*q.s;g.save();for(let i=0;i<8;i++){const b=i*.785+f.r,d=R*(.3+e*.7),r=R*(.35+e*.25)*(i%2?.8:1);g.fillStyle=rgba(i%3?'#f4f2ee':'#d8d8dc',.75*k);g.beginPath();g.arc(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6-e*14*q.s,r,0,7);g.fill()}g.restore()};
// poussière à l'atterrissage
JFXD.in_land=(f,k,e)=>{g.save();g.strokeStyle=rgba('#c8b898',.6*k);g.lineWidth=3;gEll(f.x,f.y,(f.r||40)*(.4+e*.8));g.stroke();for(let i=0;i<6;i++){const b=i*1.047,q=P(f.x+Math.cos(b)*(f.r||40)*(.5+e*.6),f.y+Math.sin(b)*(f.r||40)*(.5+e*.6),4+e*10);g.fillStyle=rgba('#d8c8a8',.5*k);g.beginPath();g.arc(q.x,q.y,(4+e*5)*q.s,0,7);g.fill()}g.restore()};
// cratère de Garôga
JFXD.in_crater=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*q.s,al=Math.min(1,k*2);g.save();g.lineCap='round';g.lineJoin='round';
 g.fillStyle=rgba('#2a1c10',.45*al);g.beginPath();g.ellipse(q.x,q.y,R*.6,R*.6*K,0,0,7);g.fill();g.strokeStyle=rgba('#d8c8a8',.5*al);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-2*q.s,R*.62,R*.62*K,0,Math.PI,0);g.stroke();
 g.strokeStyle=rgba('#1e140c',.7*al);g.lineWidth=2.6*q.s;g.beginPath();for(let i=0;i<7;i++){const b=i*.9+.4,r1=R*.5,r2=R*(.72+((i*37)%18)/100),m=(r1+r2)/2;g.moveTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*K);g.lineTo(q.x+Math.cos(b+.1)*m,q.y+Math.sin(b+.1)*m*K);g.lineTo(q.x+Math.cos(b-.04)*r2,q.y+Math.sin(b-.04)*r2*K)}g.stroke();
 g.strokeStyle=rgba('#e8dcc0',.8*k);g.lineWidth=8*k+1;g.beginPath();g.ellipse(q.x,q.y,R*(.45+e*.95),R*(.45+e*.95)*K,0,0,7);g.stroke();
 for(let i=0;i<10;i++){const b=i*.63,d=R*(.3+e*.85),h=Math.sin(Math.PI*Math.min(1,e*1.3))*(46+(i%3)*22)*q.s,x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*K-h,r=(4.5+(i%3)*2.2)*q.s;
  g.fillStyle=i%2?'#6a4a30':'#8a6a48';g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();g.moveTo(x-r,y);g.lineTo(x-r*.2,y-r);g.lineTo(x+r,y-r*.3);g.lineTo(x+r*.4,y+r*.7);g.closePath();g.fill();g.stroke()}g.restore()};
// hurlement (Loup bicéphale) : ondes sonores
JFXD.in_howl=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f;g.save();g.lineCap='round';for(let i=0;i<3;i++){const ee=Math.min(1,e*1.4-i*.18);if(ee<=0)continue;const r=f.r*ee;g.strokeStyle=rgba(i%2?'#c8c4bc':'#ffffff',.75*(1-ee));g.lineWidth=5*(1-ee)+1.5;g.setLineDash([22,10]);g.lineDashOffset=i*9;gEll(c.x,c.y,r);g.stroke()}g.setLineDash([]);g.restore()};
// flair : volutes d'odeur (au lancement) ou éclat « ! » (esquive, ennemi flairé)
JFXD.in_nose=(f,k,e,t,u,tg)=>{const c=tg||u||f;if(c.dead)return;const q=P(c.x,c.y,70),s=q.s;g.save();g.lineCap='round';
 if(f.hit){g.globalAlpha=Math.min(1,k*2);g.fillStyle='#f0d0a0';g.strokeStyle=OUT;g.lineWidth=2;g.font=`bold ${Math.round(22*s*(1+e*.4))}px "Trebuchet MS",sans-serif`;g.textAlign='center';g.strokeText('!',q.x,q.y-e*12*s);g.fillText('!',q.x,q.y-e*12*s)}
 g.strokeStyle=rgba('#f0c870',.75*k);g.lineWidth=2;g.beginPath();for(let i=0;i<4;i++){const b=i*1.57+t*1.5,r=(16+e*26)*s,x0=q.x+Math.cos(b)*r,y0=q.y+Math.sin(b)*r*.5+10*s;g.moveTo(x0,y0);g.bezierCurveTo(x0+6*s,y0-6*s,x0-6*s,y0-12*s,x0+2*s,y0-18*s)}g.stroke();g.restore()};
// Shikyaku : flambée de chakra bestial
JFXD.in_feral=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const b=i*.7+t*4,x=q.x+Math.cos(b)*(14+e*10)*s,h=(30+(i%3)*14)*s*(1-e*.4),y=q.y-6*s;g.fillStyle=rgba(i%2?'#c0402a':'#ff7a4a',.55*k);g.beginPath();g.moveTo(x-5*s,y);g.quadraticCurveTo(x+Math.sin(t*20+i)*4*s,y-h,x+5*s,y);g.fill()}
 g.strokeStyle=rgba('#ff7a4a',.8*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,(20+e*40)*s,(20+e*40)*s*K,0,0,7);g.stroke();g.restore()};
// ---------- poses 3D ----------
Object.assign(ANIM,{
 // vrille : roulé en boule, tourne sur lui-même
 in_drill:(P,e,u,t)=>{P.rootR.y=t*38;P.root.y=7;pz(P,'spine',.35);pz(P,'chest',.75);pz(P,'head',.45);pz(P,'armL',-1.9,0,.3);pz(P,'foreL',-1.6);pz(P,'armR',-1.9,0,-.3);pz(P,'foreR',-1.6);pz(P,'thighL',-1.5);pz(P,'shinL',2.1);pz(P,'thighR',-1.4);pz(P,'shinR',2);pz(P,'hair',.6);pz(P,'band',1)},
 // bond de prédateur : griffes en avant
 in_pounce:(P,e)=>{const b=bump(e),k=Math.min(1,e/.2);P.rootR.x=.45*b;P.root.y=4*b;pz(P,'spine',.25*k);pz(P,'chest',.45*k);pz(P,'head',-.7*k);pz(P,'armL',-2.25,0,.7);pz(P,'foreL',-.3);pz(P,'armR',-2.25,0,-.7);pz(P,'foreR',-.3);
  pz(P,'thighL',-1.3*b);pz(P,'shinL',1.9*b);pz(P,'thighR',.35*b);pz(P,'shinR',1.5*b);pz(P,'hair',.6);pz(P,'band',1)},
 // à quatre pattes : buste à l'horizontale, les bras servent de pattes avant (garde les coups de griffes)
 in_four:(P,e,u,t)=>{const w=u.walk||0,r=u.moving?1:0,s=Math.sin(w),c=Math.cos(w);P.rootR.x=.55;P.root.y=-11+r*Math.abs(c)*2;P.root.z=-4;
  pz(P,'spine',.3);pz(P,'chest',.5,r*s*.08);pz(P,'neck',-.3);pz(P,'head',-1.05);pz(P,'thighL',-1.75+r*s*.55);pz(P,'shinL',2.1-r*Math.max(0,s)*.6);pz(P,'footL',-.6);pz(P,'thighR',-1.75-r*s*.55);pz(P,'shinR',2.1-r*Math.max(0,-s)*.6);pz(P,'footR',-.6);
  if(!(u.swing>0)){pz(P,'armL',-1.25+r*s*.6,0,.15);pz(P,'foreL',-.15);pz(P,'armR',-1.25-r*s*.6,0,-.15);pz(P,'foreR',-.15)}pz(P,'hair',.45);pz(P,'band',.8)},
 // flair : accroupi, renifle
 in_sniff:(P,e,u,t)=>{const k=Math.min(1,e/.25);P.root.y=-3*k;pz(P,'chest',.35*k);pz(P,'head',.15+Math.sin(t*30)*.1,Math.sin(t*4)*.35);pz(P,'armL',-1.2,0,.25);pz(P,'foreL',-1.4);pz(P,'armR',-.9,0,-.3);pz(P,'foreR',-1.6);pz(P,'thighL',-.4);pz(P,'shinL',.6);pz(P,'shinR',.5)},
});
// ---------- loup géant à deux têtes (Loup bicéphale) : remplace le dessin du ninja ----------
function in_wolfBody(t,run,bite){const r=run?Math.sin(t*14):0,col='#eeece6',sh='#c9c5bd',ear='#a88868';g.lineCap='round';g.lineJoin='round';
 const L=[[-15,-15,-19+r*3,-8,-15+r*6,-1],[-8,-15,-12-r*3,-8,-8-r*6,-1],[10,-15,10+r*3,-8,10+r*6,-1],[16,-15,16-r*3,-8,16-r*6,-1]];for(const w of[8.6,5.6]){g.strokeStyle=w>7?OUT:col;g.lineWidth=w;g.beginPath();for(const l of L){g.moveTo(l[0],l[1]);g.lineTo(l[2],l[3]);g.lineTo(l[4],l[5])}g.stroke()}
 {const w=Math.sin(t*9)*3;outlined(()=>{g.moveTo(-18,-28);g.bezierCurveTo(-30,-36+r*2,-38,-40+w,-45,-35+w);g.bezierCurveTo(-41,-28+w,-34,-18,-19,-15)},col);g.strokeStyle=rgba('#a09a90',.8);g.lineWidth=1.2;g.beginPath();g.moveTo(-26,-28);g.quadraticCurveTo(-34,-31+w*.5,-40,-34+w);g.stroke()}
 outlined(()=>g.ellipse(0,-23,23,12,0,0,7),col);g.fillStyle=sh;g.beginPath();g.ellipse(-3,-30,16,3.2,0,0,7);g.fill();
 outlined(()=>{g.moveTo(3,-32);for(let i=0;i<8;i++)g.lineTo(6+i*2.7,-41+(i%2)*5-i*.4);g.lineTo(29,-21);g.lineTo(20,-14);g.lineTo(8,-17)},col);
 for(const [hx,hy,ph,c] of[[18,-45,0,sh],[28,-32,1.7,col]]){const op=bite?Math.max(0,Math.sin(t*26+ph))*5:0;
  g.fillStyle=ear;g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(hx-6,hy-4);g.lineTo(hx-8.5,hy-16.5);g.lineTo(hx-1,hy-7);g.closePath();g.moveTo(hx-1,hy-7);g.lineTo(hx+1,hy-18);g.lineTo(hx+5,hy-6);g.closePath();g.fill();g.stroke();
  outlined(()=>g.ellipse(hx,hy,8.5,7.5,0,0,7),c);outlined(()=>{g.moveTo(hx+3,hy-3.5);g.lineTo(hx+19,hy-1-op*.4);g.lineTo(hx+19,hy+2.2-op*.4);g.lineTo(hx+4,hy+4)},c);
  if(op>.6){g.fillStyle='#6a1410';g.beginPath();g.moveTo(hx+5,hy+3.5);g.lineTo(hx+18,hy+2.2-op*.4);g.lineTo(hx+16,hy+3+op);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(hx+9,hy+3);g.lineTo(hx+10,hy+5.5);g.lineTo(hx+11,hy+3);g.moveTo(hx+14,hy+2.6);g.lineTo(hx+15,hy+5);g.lineTo(hx+16,hy+2.5);g.fill()}
  outlined(()=>{g.moveTo(hx+4,hy+4+op*.6);g.lineTo(hx+16,hy+3.2+op);g.lineTo(hx+6,hy+7+op*.6)},c);
  g.fillStyle='#d0201a';g.beginPath();g.moveTo(hx+1.5,hy-3.6);g.lineTo(hx+6.2,hy-2.4);g.lineTo(hx+2,hy-1);g.closePath();g.fill();g.fillStyle='#120c08';g.beginPath();g.arc(hx+19,hy+.6-op*.4,1.9,0,7);g.fill()}}
function in_wolfAt(u,bx,by,s){const f=Math.cos(u.aim)>=0?1:-1,t=performance.now()/1000;g.save();if(u.stun>0)g.translate(Math.sin(t*12)*1.2,0);
 g.translate(bx,by);g.scale(s*1.05*f,s*1.05);in_wolfBody(t,u.moving||!!u.dash,u.swing>0);
 if(u.flash>0){g.globalAlpha=Math.min(1,u.flash/.12)*.6;g.globalCompositeOperation='lighter';g.fillStyle='#ffffff';g.beginPath();g.ellipse(0,-21,22,11.5,0,0,7);g.fill()}g.restore()}
// ---------- états visibles ----------
// ninken devant son ancre (le maître ou la cible, la plus proche) : dessiné juste après elle (bon ordre d'affichage)
function in_dogsOf(u,front){const i=in_I(u),t=performance.now()/1000;if(i<0)return;for(const x of aux){if(x.type!=='in_dog'&&x.type!=='in_big')continue;const o=units[x.ui],tg=x.ti!=null?units[x.ti]:null;
 const an=tg&&!tg.dead&&(!o||o.dead||Math.hypot(x.x-tg.x,x.y-tg.y)<Math.hypot(x.x-o.x,x.y-o.y))?tg:o;if(an!==u||(x.y>=u.y)!==front)continue;
 const big=x.type==='in_big',st=x.n===0?(big?2:0):x.n===1?(big?0:1):x.n===2?(big?1:0):3,z=big&&x.n===0?Math.sin(Math.PI*Math.max(0,Math.min(1,1-x.k/.42)))*40:x.n===3?12:0;
 in_dogAt(x.x,x.y,z,x.a||0,big?x.r||1.75:1,st,t)}}
STATD.push((u,p,S,sk)=>{in_dogsOf(u,true);const i=in_I(u),t=performance.now()/1000;
 // marque : volutes d'odeur au-dessus de la tête
 for(const x of aux)if(x.type==='in_mark'&&x.ti===i){const al=Math.min(1,x.t/.6);g.save();g.strokeStyle=rgba('#f0c060',.7*al);g.lineWidth=2;g.lineCap='round';g.beginPath();for(let j=0;j<3;j++){const k=(t*.9+j/3)%1,x0=p.x+(j-1)*9*S,y0=p.y-(70+k*26)*S;g.moveTo(x0,y0);g.bezierCurveTo(x0+5*S,y0-4*S,x0-5*S,y0-8*S,x0,y0-12*S)}g.stroke();g.restore();break}});
TRAITS[5]={nom:'Ninken',desc:'Ton ninken combat avec toi : toutes les 8 s (4 s sur une cible marquée), il bondit mordre l\'ennemi que tu frappes. Son flair révèle les ennemis invisibles à moins de 220.',
 init(u){u.in_bcd=1.5},
 update(u,dt){const fast=(u.in_four>0&&u.haste>0)||(u.in_wolf>0&&u.giant>0);if(u.in_bcd>0)u.in_bcd-=dt*(fast?2:1);for(const k of['in_four','in_flair','in_wolf'])if(u[k]>0)u[k]=Math.max(0,u[k]-dt);
  if(u.in_four>0&&!(u.haste>0))u.in_four=0;if(u.in_wolf>0&&!(u.giant>0))u.in_wolf=0;
  if(fast&&!u.anim)anim(u,'in_four',Math.max(u.in_four,u.in_wolf));
  for(const e of enemies(u))if(e.stealth>0&&dist(u,e)<220){e.stealth=0;say(e,'FLAIRÉ !','#f0d0a0');jx({jfx:'in_nose',x:e.x,y:e.y,ti:in_I(e),t:.7,m:.7,hit:1})}},
 deal(src,t,dmg,o){if(t===src||t.team===src.team)return dmg;dmg*=IN_BAL;const base=dmg;if(in_marked(t,src))dmg*=1.12; // Marquage : +12 % de tes dégâts
  if(o.in_d)return dmg;
  if(src.in_four>0&&o.basic&&!o.dot)o.dot={dps:6,dur:2}; // Shikyaku : griffures qui saignent
  if(src.in_wolf>0&&o.basic){const d=base*.4;later(src,.1,()=>{if(!t.dead&&!src.dead&&dist(src,t)<150){VFX='claws';hit(t,src,d,{melee:1,in_d:1});VFX=null;jx({jfx:'in_fang',x:t.x,y:t.y,a:ang(src,t),t:.3,m:.3,big:1})}})} // seconde tête
  if(!o.silent){for(const x of aux)if(x.type==='in_big'&&x.owner===src&&x.n!==3&&x.tg!==t){x.tg=t;x.ti=in_I(t)} // le grand ninken suit la cible de son maître
   if(src.in_bcd<=0&&!t.dead&&dist(src,t)<340&&!in_away(src)){src.in_bcd=in_marked(t,src)?4:8;in_bite(src,t,2)}}
  return dmg},
 take(t,src,dmg,o){if(t.in_flair>0&&src&&src!==t&&!o.silent&&src.team!==t.team){t.in_flair=0;in_flairGo(t,src);return -1}return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000;
  if(u.in_flair>0){g.save();g.strokeStyle=rgba('#f0c870',.8);g.lineWidth=1.8;g.lineCap='round';g.beginPath();for(let i=0;i<3;i++){const b=t*3+i*2.09,x0=p.x+Math.cos(b)*20*S,y0=p.y-58*S+Math.sin(b)*7*S;g.moveTo(x0,y0);g.bezierCurveTo(x0+5*S,y0-5*S,x0-5*S,y0-9*S,x0+1*S,y0-14*S)}g.stroke();
   g.setLineDash([3,4]);g.strokeStyle=rgba('#f0d0a0',.7);g.beginPath();g.ellipse(p.x,p.y,30*S,30*S*K,0,0,7);g.stroke();g.restore()}
  if(u.in_four>0&&u.haste>0&&!(u.in_wolf>0)){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const b=i*.9+t*5,x=p.x+Math.cos(b)*16*S,h=(14+((t*30+i*7)%14))*S,y=p.y-(8+(i%3)*10)*S;g.fillStyle=rgba(i%2?'#c0402a':'#ff6a3a',.32);g.beginPath();g.moveTo(x-4*S,y);g.quadraticCurveTo(x,y-h,x+4*S,y);g.fill()}g.restore()}},
 hud(u,x,y){const yy=y-16,w=118,cd=Math.max(0,u.in_bcd||0),aw=in_away(u),rd=cd<=0;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,yy,w+2,7);g.fillStyle=aw?'#f0b860':rd?'#f4f0e8':'#8a7058';g.fillRect(x+1,yy+1,w*(aw||rd?1:Math.max(0,1-cd/8)),5);
  g.save();g.translate(x+w+14,yy+7);g.scale(.7,.7);in_dogBody(aw?2:rd?4:0,performance.now()/1000,'#f4f0e8','#c8a080',0,1);g.restore();text(aw?'Ninken : à l\'attaque !':rd?'Ninken prêt':'Ninken',x+w+30,yy+7,11,'#f0d8b0','left','normal')}};
// ---------- crochets d'affichage (auto-suffisants) ----------
AFTER.push(()=>{UK.push('in_bcd','in_four','in_flair','in_wolf');
 // le chien du clan est dessiné avec le même ninken que les jutsu, et disparaît quand il est parti (morsure, vrille, fusion)
 if(typeof drawDog==='function')drawDog=u=>{if(!in_away(u))in_dogSide(u)};
 // avant chaque ninja : les ninken qui sont derrière lui (ordre d'affichage)
 if(typeof drawDust==='function'){const D1=drawDust;drawDust=u=>{D1(u);in_dogsOf(u,false)}}
 // Loup bicéphale : le ninja est dessiné en loup géant à deux têtes
 if(typeof drawChar3==='function'){const D2=drawChar3;drawChar3=(u,bx,by,s,al)=>{if(u.in_wolf>0&&u.giant>0&&!u.dead){g.save();if(al!=null)g.globalAlpha*=al;in_wolfAt(u,bx,by,s);g.restore();return}D2(u,bx,by,s,al)}}});
