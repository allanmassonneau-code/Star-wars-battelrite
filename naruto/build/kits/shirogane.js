// ===== Clan Shirogane (c14, préfixe sg_) : marionnettistes =====
// Identité : le ninja se déplace (ZQSD) et sa marionnette suit le curseur ; les jutsu partent d'ELLE (trait « Marionnette »).
// Attaque de base au corps à corps comme tous les styles : la marionnette revient à côté du ninja et frappe depuis lui (jamais à distance).
// La marionnette a ses PV : elle encaisse les coups qui la touchent ; brisée, elle se reconstruit (le ninja frappe alors lui-même, plus faiblement).
// Kit : lames cachées, poison (senbon, brume), bouclier (Sanshôuo), capture (Kuroari), fils de chakra, Kawarimi, ultimes Mère et Père / Armée de marionnettes.
// Moteur : origine de lancement déplacée sur la marionnette (fire enveloppé dans AFTER), dessin trié en profondeur (sgList, une ligne « # clan Shirogane » dans mknaruto.py).
const SGD={
 style:'Corps à corps : ta marionnette frappe de ses lames là où elle se trouve (au bout de tes fils) ; 4e coup : tourbillon tout autour ; 5e : elle s\'élance, estoc empoisonné (2 dégâts/s pendant 3 s)',
 blades:'Lames cachées : la marionnette tournoie 0,6 s (rayon 75) ; 3 coups de 6, le dernier ralentit',
 needle:'La gueule de la marionnette crache 5 senbon en éventail (portée 380) : 4 dégâts chacun et poison 3 dégâts/s pendant 3 s',
 strings:'Fils de chakra 3 s sur l\'ennemi le plus proche de la marionnette (220) : ralenti, attiré vers elle (2 dégâts/s), +15 % de tes dégâts sur lui ; rompus au-delà de 340',
 mist:'La marionnette souffle une brume toxique qui la suit 4 s (rayon 95) : 5 dégâts/s et ralentit ; 2 s dedans : poison 3/s pendant 4 s',
 shell:'Sanshôuo : la salamandre-bouclier surgit à la place de ta marionnette 3 s (rayon 90) : arrête les tirs ennemis venus du dehors ; bouclier de 20 à toi et tes alliés dedans',
 kuroari:'Kuroari : la fourmi noire fond sur l\'ennemi le plus proche de ta marionnette (260) (6 dégâts) et l\'enferme 1 s (étourdi), puis ses lames le transpercent : 26 dégâts',
 leap:'Bond en arrière (230) ; ta marionnette lâche une bombe fumigène (rayon 100) : ennemis ralentis 1,2 s',
 swap:'Kawarimi : tu échanges ta place avec ta marionnette (intangible 0,3 s) ; marionnette brisée : petit bond vers le curseur',
 parents:'Mère et Père surgissent de part et d\'autre de ta marionnette et se referment après 0,6 s : 38 dégâts et étourdit 1 s au centre (rayon 85), 12 et repousse autour (150)',
 army:'Armée de marionnettes 5 s autour de la tienne (rayon 220) : toutes les 0,5 s, chaque ennemi dedans reçoit un coup de lame (4 dégâts) ; à la fin, toutes transpercent le centre : 22 dégâts et étourdit 0,5 s (rayon 130)'};
KIT('c14',[
 [1,'D','x.sg_blades','Lames cachées',SGD.blades,'sg_pup'],
 [1,'C','x.sg_needle','Senbon empoisonnés',SGD.needle,'sg_poison'],
 [4,'C','x.sg_strings','Fils de chakra',SGD.strings,'sg_pup'],
 [3,'B','x.sg_mist','Brume toxique',SGD.mist,'sg_poison'],
 [4,'B','x.sg_shell','Sanshôuo',SGD.shell,'sg_pup'],
 [3,'A','x.sg_kuroari','Kuroari',SGD.kuroari,'sg_pup'],
 [2,'D','x.sg_leap','Repli du marionnettiste',SGD.leap,'smoke'],
 [2,'C','x.sg_swap','Kawarimi de marionnette',SGD.swap,'sg_pup'],
 [5,'A','x.sg_parents','Mère et Père',SGD.parents,'sg_pup'],
 [5,'S','x.sg_army','Armée de marionnettes',SGD.army,'sg_pup'],
]);
// style propre : les lames de la marionnette (seul style du clan), au corps à corps : les coups partent de la marionnette
STYLES.push(['Lames de marionnette',SGD.style,'x.sg_style','steel','fist',[14],.82,.74]);

// ---------- réglages ----------
// BAL : dégâts infligés × ; TAKE : dégâts subis × (marionnette au bout de fils de 180 qui frappe au contact : 1,1/0,6, réglé par duels simulés)
const SG={BAL:1.1,TAKE:.6,L:180,HP:75,REB:7,WEAK:.75,R:16,STR:'#9fe0ff',WOOD:'#c9a273',CLOAK:'#3a2c48',POI:'#a050d0'};
const sgI=u=>units.indexOf(u);
const sgOn=u=>!!u&&u.ch&&u.ch.clan===14;
const sgOk=u=>sgOn(u)&&!u.dead&&u.sg_px!=null&&!(u.sg_dn>0); // marionnette en état
// point d'où partent les coups : la marionnette (ou le ninja si elle est brisée)
const sgPos=u=>sgOk(u)?{x:u.sg_px,y:u.sg_py}:{x:u.x,y:u.y};
// curseur du joueur (local ou ami en ligne) ; null pour un bot
function sgCur(u){if(u.ctrl==='local'){const m=unP(mouse.x,mouse.y);return m}if(u.ctrl==='remote'&&typeof peerOf==='function'){const Q=peerOf(u.rid);if(Q&&Q.in){const x=+Q.in.ax,y=+Q.in.ay;if(isFinite(x)&&isFinite(y))return{x,y}}}return null}
const sgHum=u=>u.ctrl==='local'||(u.ctrl==='remote'&&typeof peerOf==='function'&&!!peerOf(u.rid));
const sgSide=u=>({x:u.x+Math.cos(u.aim+1.6)*46,y:u.y+Math.sin(u.aim+1.6)*46});
function sgTxt(x,y,s,col){if(near(x,y))txt.push({x:x+(rnd()-.5)*16,y,z:70,s,col,t:1})}
// dégâts subis par la marionnette (tirs, coups, explosions ennemis qui la touchent)
function sgHurt(o,dmg,src){if(!sgOk(o)||!(dmg>0))return;dmg*=(src&&src.ch&&src.ch.pw)||1;o.sg_hp-=dmg;o.sg_hT=3;
 if(near(o.sg_px,o.sg_py)){sparks(o.sg_px,o.sg_py,SG.WOOD,4);sgTxt(o.sg_px,o.sg_py,'-'+Math.round(dmg),'#e8c890')}
 if(o.sg_hp<=0){o.sg_hp=0;o.sg_dn=SG.REB;jx({jfx:'sg_break',x:o.sg_px,y:o.sg_py,a:o.sg_pa||0,t:1.1,m:1.1});say(o,'MARIONNETTE BRISÉE','#e8c890');if(near(o.sg_px,o.sg_py)){S('bone',o);S('heavy',o);shake=Math.max(shake,.12)}
  for(const x of aux)if((x.type==='sg_spin'||x.type==='sg_mist')&&x.owner===o){x.fx=o.sg_px;x.fy=o.sg_py}}}
// ---------- mécaniques ----------
Object.assign(NAT,{
 // style : coups de lame de la marionnette AU CORPS À CORPS, autour d'elle (melee() part de la marionnette ; du ninja si elle est brisée)
 sg_style:SP('Lames de marionnette','',.45,{hero:'palpatine',melee:1,ai:{max:SG.L+70,p:1}},(u,a)=>{
  const o=sgPos(u),ox=u.x,oy=u.y,pup=sgOk(u);
  if(!sgHum(u)&&!nearE(u,o.x,o.y,112)){u.stam=Math.min(100,u.stam+20);u.cds[0]=.15;u.cmb=u.cmbH=Math.max(0,(u.cmb||1)-1);return} // bot : personne au contact
  const c=u.cmbH||1,T=[0,[78,1.8,10,.4],[78,1.8,10,.42],[80,2.1,11,.46],[84,6.3,11,.5],[100,1.1,13,.6]][c];
  // visée depuis la marionnette : l'ennemi le plus proche d'elle (posée sur lui : elle frappe d'un peu en retrait, côté ninja), sinon le curseur
  if(pup){const e=nearE(u,o.x,o.y,140);if(e){if(Math.hypot(e.x-o.x,e.y-o.y)<e.r+12){const b=ang(u,e);o.x=e.x-Math.cos(b)*(e.r+12);o.y=e.y-Math.sin(b)*(e.r+12)}a=Math.atan2(e.y-o.y,e.x-o.x)}
   else if(Math.hypot((u.sg_ax??o.x)-o.x,(u.sg_ay??o.y)-o.y)>30)a=Math.atan2(u.sg_ay-o.y,u.sg_ax-o.x)}
  if(c===5){if(pup){u.sg_px+=Math.cos(a)*40;u.sg_py+=Math.sin(a)*40;o.x=u.sg_px;o.y=u.sg_py}else stLunge(u,a,40);S('dash',u)} // 5e coup : élan vers l'avant
  if(pup){u.x=o.x;u.y=o.y;u.sg_pa=a}let i,n;try{i=fx.length;n=melee(u,a,T[0],T[1],T[2],c===5?{dot:{dps:2,dur:3}}:{})}finally{if(pup){u.x=ox;u.y=oy}}if(fx[i]&&fx[i].swing)fx.splice(i,1);
  if(pup)anim(u,'sg_pull',.25);jx({jfx:'sg_slash',x:o.x,y:o.y,a,c,R:T[0],t:.24,m:.24});u.cds[0]=T[3]*(u.rapid>0?.45:1)*(u.ch.pass==='speed'?PASSV.speedA:1);
  if(n&&c===5)for(const e of enemies(u))if(Math.hypot(e.x-o.x,e.y-o.y)<T[0]+e.r&&angDiff(Math.atan2(e.y-o.y,e.x-o.x),a)<T[1]/2)jx({jfx:'st_poison',ti:sgI(e),x:e.x,y:e.y,t:2,m:2})}),
 // Lames cachées : tourbillon de lames autour de la marionnette, qui la suit
 sg_blades:SP('Lames cachées',SGD.blades,6,{tele:{self:1,r:75},ai:{max:SG.L+60,p:.6,pr:85}},(u)=>{S('saber',u);S('blaster',u);
  aux.push({type:'sg_spin',x:u.x,y:u.y,r:75,t:.62,m:.62,team:u.team,owner:u,ui:sgI(u),n:0,k:0});anim(u,'sg_pull',.6)}),
 // Senbon empoisonnés : éventail de 5 aiguilles depuis la gueule de la marionnette
 sg_needle:SP('Senbon empoisonnés',SGD.needle,7,{line:{len:380,w:60},ai:{max:SG.L+330,p:.6,pr:360}},(u,a)=>{S('blaster',u);
  for(let i=0;i<5;i++){const b=a+(i-2)*.12;proj(u,b,{spd:820,r:5,dmg:4,life:.46,col:'#d8b8ff',kind:'sg_needle',o:{dot:{dps:3,dur:3}},noClash:1})}
  jx({jfx:'sg_puff',x:u.x,y:u.y,a,t:.35,m:.35});anim(u,'sg_pull',.35)}),
 // Fils de chakra : relie l'ennemi le plus proche de la marionnette
 sg_strings:SP('Fils de chakra',SGD.strings,9,{tele:{self:1,r:220},ai:{max:SG.L+200,p:.55,pr:210}},(u)=>{const e=nearE(u,u.x,u.y,220);anim(u,'sg_pull',.5);
  if(!e){sgTxt(u.x,u.y,'AUCUNE CIBLE','#9fe0ff');const i=u.ch.abil.findIndex(b=>b&&b.key==='sg_strings');if(i>0){u.cds[i]=1;u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]))}return}
  for(const x of aux)if(x.type==='sg_str'&&x.owner===u)x.t=0;S('saber',u);S('deflect',u);
  aux.push({type:'sg_str',x:e.x,y:e.y,t:3,m:3,team:u.team,owner:u,ui:sgI(u),ti:sgI(e),tg:e,k:0});say(e,'FILS DE CHAKRA','#9fe0ff')}),
 // Brume toxique : nuage qui suit la marionnette (on la guide à la souris)
 sg_mist:SP('Brume toxique',SGD.mist,11,{tele:{self:1,r:95},ai:{max:SG.L+60,p:.55,pr:90}},(u)=>{S('wind',u);S('bugs',u);
  for(const x of aux)if(x.type==='sg_mist'&&x.owner===u)x.t=0;aux.push({type:'sg_mist',x:u.x,y:u.y,r:95,t:4,m:4,team:u.team,owner:u,ui:sgI(u),k:.25,in:{}});anim(u,'sg_pull',.45)}),
 // Sanshôuo : carapace fixe qui arrête les tirs ennemis
 sg_shell:SP('Sanshôuo',SGD.shell,12,{tele:{self:1,r:90},ai:DEF},(u)=>{S('poof',u);S('rock',u);const c=!sgHum(u)&&u.sg_ox!=null?{x:u.sg_ox,y:u.sg_oy}:{x:u.x,y:u.y};
  aux.push({type:'sg_shell',x:c.x,y:c.y,r:90,t:3,m:3,team:u.team,owner:u,ui:sgI(u),k:0,sh:[]});jx({jfx:'sg_poof',x:c.x,y:c.y,r:70,t:.5,m:.5});anim(u,'sg_summon',.5)}),
 // Kuroari : la fourmi noire (projectile visible, esquivable) enferme sa proie
 sg_kuroari:SP('Kuroari',SGD.kuroari,13,{line:{len:260,w:40},ai:{max:SG.L+240,p:.6,pr:250}},(u,a)=>{const e=nearE(u,u.x,u.y,260),b=e?ang(u,e):a;S('poof',u);S('dash',u);anim(u,'sg_summon',.45);
  proj(u,b,{x:u.x,y:u.y,spd:640,r:15,dmg:6,life:.55,col:'#2a2230',kind:'sg_ant',home:1,noClash:1,stun:1,onHit:(p,t)=>{if(t.dead||t.unstop>0)return;
   aux.push({type:'sg_ant',x:t.x,y:t.y,t:1,m:1,team:p.owner.team,owner:p.owner,ui:sgI(p.owner),ti:sgI(t),tg:t,n:0});say(t,'CAPTURÉ !','#c8b0e0');S('heavy',p.owner)}});
  jx({jfx:'sg_poof',x:u.x,y:u.y,r:40,t:.4,m:.4})}),
 // Repli : bond en arrière, fumée sous la marionnette
 sg_leap:SP('Repli du marionnettiste',SGD.leap,8,{ai:ESC},(u,a)=>{const b=sgHum(u)?a+Math.PI:a;S('dash',u);S('poof',u);anim(u,'backflip',.4);dash(u,b,230,.32,{jump:40});
  const o=sgPos(u);for(const e of enemies(u))if(Math.hypot(e.x-o.x,e.y-o.y)<100+e.r)hit(e,u,0,{slow:1.2,silent:1,unblockable:1});jx({jfx:'sg_smoke',x:o.x,y:o.y,r:100,t:1.4,m:1.4})}),
 // Kawarimi : échange de place avec la marionnette
 sg_swap:SP('Kawarimi de marionnette',SGD.swap,10,{ai:{mode:'esc',max:200,p:.55,sgOk:u=>{if(!sgOk(u))return true;const e=nearE(u,u.x,u.y,200);return!!e&&Math.hypot(e.x-u.sg_px,e.y-u.sg_py)>dist(u,e)+140}}},(u,a,td)=>{S('poof',u);
  if(!sgOk(u)){dash(u,a,clamp(td||150,60,150),.2,{jump:24});return}
  const ox=u.x,oy=u.y;jx({jfx:'sg_poof',x:ox,y:oy,r:44,t:.45,m:.45});jx({jfx:'sg_poof',x:u.sg_px,y:u.sg_py,r:44,t:.45,m:.45});
  u.x=u.sg_px;u.y=u.sg_py;collide(u);u.sg_px=ox;u.sg_py=oy;u.phase=Math.max(u.phase||0,.3);u.kx=u.ky=0;anim(u,'sg_pull',.35)}),
 // Mère et Père : étreinte des deux marionnettes
 sg_parents:ULT('Mère et Père',SGD.parents,{tele:{self:1,r:150},ai:{max:SG.L+120,p:.8,pr:100}},(u,a)=>{S('poof',u);S('saber',u);anim(u,'sg_summon',.7);
  aux.push({type:'sg_hug',x:u.x,y:u.y,a,r:85,t:.95,m:.95,team:u.team,owner:u,ui:sgI(u),n:0});jx({jfx:'sg_poof',x:u.x-Math.sin(a)*150,y:u.y+Math.cos(a)*150,r:50,t:.5,m:.5});jx({jfx:'sg_poof',x:u.x+Math.sin(a)*150,y:u.y-Math.cos(a)*150,r:50,t:.5,m:.5})}),
 // Armée de marionnettes : cercle de 10 marionnettes autour de la tienne
 sg_army:ULT('Armée de marionnettes',SGD.army,{tele:{self:1,r:220},ai:{max:SG.L+160,p:.8,pr:150}},(u)=>{S('poof',u);S('roar',u);anim(u,'sg_summon',.9);
  aux.push({type:'sg_army',x:u.x,y:u.y,r:220,t:5,m:5,team:u.team,owner:u,ui:sgI(u),k:.5,n:0});jx({jfx:'sg_poof',x:u.x,y:u.y,r:150,t:.7,m:.7});if(near(u.x,u.y))shake=Math.max(shake,.25)}),
});
Object.assign(NATHERO,{sg:'palpatine'});

// ---------- objets (hôte) ----------
AUXF.sg_spin=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}if(x.fx==null){const p=sgPos(o);x.x=p.x;x.y=p.y}else{x.x=x.fx;x.y=x.fy}
 const el=x.m-x.t;if(x.n<3&&el>=.2*(x.n+1)){x.n++;const last=x.n===3;VFX='steel';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)hit(e,o,6,{fx:x.x,fy:x.y,unblockable:1,slow:last?1:0});VFX=null;if(near(x.x,x.y))S('saber',o)}};
AUXF.sg_mist=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}if(x.fx==null&&sgOk(o)){const k=.18;x.x+=(o.sg_px-x.x)*k;x.y+=(o.sg_py-x.y)*k}
 if(x.k>0)return;x.k=.5;VFX='sg_poison';for(const e of enemies(o)){if(Math.hypot(e.x-x.x,e.y-x.y)>=x.r+e.r)continue;const i=sgI(e);x.in[i]=(x.in[i]||0)+.5;
  hit(e,o,2.5,{silent:1,unblockable:1,slow:.6,dot:x.in[i]>=2&&x.in[i]<2.4?{dps:3,dur:4}:null});if(x.in[i]>=2&&x.in[i]<2.4){say(e,'EMPOISONNÉ','#c080ff');jx({jfx:'st_poison',ti:i,x:e.x,y:e.y,t:4,m:4})}}VFX=null};
AUXF.sg_shell=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}
 for(const p of projs){if(p.dead||p.life<=0||!p.owner||p.owner.team===x.team||p.grenade)continue;if(Math.hypot(p.x-x.x,p.y-x.y)<x.r+p.r&&Math.hypot(p.owner.x-x.x,p.owner.y-x.y)>=x.r){p.life=0;if(near(p.x,p.y)){sparks(p.x,p.y,'#c8ffd0',8);jx({jfx:'sg_block',x:p.x,y:p.y,a:Math.atan2(p.y-x.y,p.x-x.x),t:.3,m:.3})}}}
 for(const e of units)if(!e.dead&&e.team===x.team&&!x.sh.includes(e)&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){x.sh.push(e);shieldU(e,20,3)}};
AUXF.sg_str=(x,dt)=>{const o=x.owner,e=x.tg;if(!o||o.dead||!e||e.dead){x.t=0;return}x.x=e.x;x.y=e.y;const p=sgPos(o),d=Math.hypot(e.x-p.x,e.y-p.y);
 if(d>340){x.t=0;jx({jfx:'sg_snap',x:e.x,y:e.y,t:.4,m:.4});say(e,'FILS ROMPUS','#9fe0ff');return}
 if(e.unstop<=0&&d>50){const b=Math.atan2(p.y-e.y,p.x-e.x);e.kx+=Math.cos(b)*420*dt;e.ky+=Math.sin(b)*420*dt}
 if(x.k<=0){x.k=.5;hit(e,o,1,{slow:.6,silent:1,unblockable:1})}};
AUXF.sg_ant=x=>{const o=x.owner,e=x.tg;if(!e||e.dead){x.t=0;return}if(!x.n){x.n=1;x.x=e.x;x.y=e.y}
 if(x.t>0){e.x=x.x;e.y=x.y;e.kx=e.ky=0;e.stun=Math.max(e.stun,.08);e.cast=null;e.dash=null;e.chan=null;return}
 if(o&&!o.dead){VFX='steel';hit(e,o,26,{unblockable:1});VFX=null}jx({jfx:'sg_pierce',x:e.x,y:e.y,t:.5,m:.5});if(near(e.x,e.y)){S('saber',o);S('bone',o);shake=Math.max(shake,.18)}};
AUXF.sg_hug=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}if(x.n||x.m-x.t<.6)return;x.n=1;VFX='steel';
 for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<x.r+e.r)hit(e,o,38,{stun:1,unblockable:1,fx:x.x,fy:x.y});else if(d<150+e.r)hit(e,o,12,{kb:420,fx:x.x,fy:x.y,unblockable:1})}VFX=null;
 jx({jfx:'sg_clasp',x:x.x,y:x.y,a:x.a,t:.6,m:.6});if(near(x.x,x.y)){S('heavy',o);S('boom',o);shake=Math.max(shake,.35)}};
// position d'une marionnette de l'armée (même calcul chez l'hôte et l'invité)
const sgArmyP=(x,i)=>{const el=x.m-x.t,b=i*.6283+el*.55,r=x.r*(.86+.06*Math.sin(el*3+i));return{x:x.x+Math.cos(b)*r,y:x.y+Math.sin(b)*r*.9,b}};
AUXF.sg_army=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}
 if(x.t>0){if(x.k>0)return;x.k=.5;if(x.t<.45)return;let j=Math.floor(rnd()*10);VFX='steel';
  for(const e of enemies(o)){if(Math.hypot(e.x-x.x,e.y-x.y)>=x.r+e.r)continue;j=(j+3)%10;const p=sgArmyP(x,j);hit(e,o,4,{unblockable:1,silent:1});jx({jfx:'sg_lunge',x:p.x,y:p.y,ex:e.x,ey:e.y,ti:sgI(e),t:.32,m:.32})}VFX=null;if(near(x.x,x.y))S('saber',o);return}
 if(x.n)return;x.n=1;VFX='steel';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<130+e.r)hit(e,o,22,{stun:.5,unblockable:1,fx:x.x,fy:x.y});VFX=null;
 jx({jfx:'sg_finale',x:x.x,y:x.y,t:.7,m:.7});if(near(x.x,x.y)){S('heavy',o);S('boom',o);shake=Math.max(shake,.4)}};

// ---------- trait : la marionnette ----------
function sgReset(u){const s=sgSide(u);u.sg_px=s.x;u.sg_py=s.y;u.sg_hp=SG.HP;u.sg_dn=0;u.sg_hT=0;u.sg_pa=u.aim||0}
TRAITS[14]={nom:'Marionnette',desc:`Ta marionnette suit ton curseur (fils de ${SG.L}) : tes jutsu et tes attaques de base partent d'elle. Elle a ${SG.HP} PV et encaisse les attaques qui la touchent ; brisée, elle se reconstruit en ${SG.REB} s (tu frappes alors toi-même : −${Math.round(100-SG.WEAK*100)} % de dégâts).`,
 init(u){sgReset(u);u.ch.pref=200},
 // aperçus (galerie, créateur) : la marionnette flotte à côté du ninja, reliée à sa main par les fils
 prev(u,p,S,front){if(!front)return;const t=performance.now()/1000,k=S/1.42,x=p.x+42*k,y=p.y-10*k-Math.sin(t*2.2)*3*k,s=1.3*k,h={x:p.x+13*k,y:p.y-40*k};
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,p.y-2*k,12*k,4*k,0,0,7);g.fill();
  g.save();g.translate(x,y);g.scale(-s,s);sgBody(0,0,0,t,-1);g.restore();
  g.save();g.lineCap='round';for(const [ox,oy] of[[1,-46],[-17,-14],[17,-14]]){const x1=x-ox*s,y1=y+oy*s,mx=(h.x+x1)/2,my=(h.y+y1)/2+6+Math.sin(t*3+ox)*2;
   g.strokeStyle=rgba(SG.STR,.18);g.lineWidth=3;g.beginPath();g.moveTo(h.x,h.y);g.quadraticCurveTo(mx,my,x1,y1);g.stroke();g.strokeStyle=rgba('#e8faff',.7);g.lineWidth=1;g.stroke()}
  g.fillStyle=rgba(SG.STR,.8);g.beginPath();g.arc(h.x,h.y,2.2,0,7);g.fill();g.restore()},
 update(u,dt){if(u.sg_px==null)sgReset(u);if(u.sg_hT>0)u.sg_hT-=dt;if(!u.anim&&!u.dash)anim(u,'sg_hold',1.5);
  if(u.sg_dn>0){u.sg_dn-=dt;if(u.sg_dn<=0){sgReset(u);jx({jfx:'sg_poof',x:u.sg_px,y:u.sg_py,r:36,t:.45,m:.45});say(u,'MARIONNETTE PRÊTE','#e8d0a0');if(near(u.x,u.y))S('poof',u)}return}
  // but : curseur (joueur) ou cible (bot : juste devant l'ennemi, côté marionnettiste)
  let gx,gy,ax,ay;const c=sgCur(u);
  if(c){gx=ax=c.x;gy=ay=c.y}
  else{const e=u.tgt&&!u.tgt.dead&&dist(u,u.tgt)<900?u.tgt:null;if(e){const b=ang(e,u);ax=e.x;ay=e.y;gx=e.x+Math.cos(b)*50;gy=e.y+Math.sin(b)*50}else{ax=u.x+Math.cos(u.aim)*150;ay=u.y+Math.sin(u.aim)*150;const s=sgSide(u);gx=s.x;gy=s.y}}
  u.sg_ax=ax;u.sg_ay=ay;
  {const d=Math.hypot(gx-u.x,gy-u.y);if(d>SG.L){gx=u.x+(gx-u.x)/d*SG.L;gy=u.y+(gy-u.y)/d*SG.L}}gx=clamp(gx,B.x+10,B.x+B.w-10);gy=clamp(gy,B.y+10,B.y+B.h-10);
  if(u.stun<=0&&!(u.sleepT<0)){const k=1-Math.exp(-11*dt),mx=(gx-u.sg_px)*k,my=(gy-u.sg_py)*k,l=Math.hypot(mx,my),cap=1050*dt;const f=l>cap?cap/l:1;u.sg_px+=mx*f;u.sg_py+=my*f}
  {const d=Math.hypot(u.sg_px-u.x,u.sg_py-u.y),M=SG.L+30;if(d>M){u.sg_px=u.x+(u.sg_px-u.x)/d*M;u.sg_py=u.y+(u.sg_py-u.y)/d*M}}
  for(const o of OBST){const m=o.r+10;if(Math.abs(u.sg_px-o.x)>=m||Math.abs(u.sg_py-o.y)>=m)continue;const d=Math.hypot(u.sg_px-o.x,u.sg_py-o.y);if(d<m&&d>0){u.sg_px=o.x+(u.sg_px-o.x)/d*m;u.sg_py=o.y+(u.sg_py-o.y)/d*m}} // pas dans un pilier (ses tirs y mourraient)
  u.sg_pa=Math.hypot(ax-u.sg_px,ay-u.sg_py)>30?Math.atan2(ay-u.sg_py,ax-u.sg_px):u.aim;
  if(!(u.sg_hT>0)&&u.sg_hp<SG.HP)u.sg_hp=Math.min(SG.HP,u.sg_hp+5*dt);
  // tirs ennemis qui traversent la marionnette : elle encaisse (le tir continue)
  for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===u.team||p.sgh===u)continue;const rr=p.r+SG.R;if(Math.abs(p.x-u.sg_px)>rr||Math.abs(p.y-u.sg_py)>rr||Math.hypot(p.x-u.sg_px,p.y-u.sg_py)>rr)continue;p.sgh=u;sgHurt(u,p.dmg,p.owner);if(!sgOk(u))break}},
 deal(src,t,dmg,o){if(t===src||t.team===src.team)return dmg;dmg*=SG.BAL;if(src.sg_dn>0)dmg*=SG.WEAK;
  for(const x of aux)if(x.type==='sg_str'&&x.owner===src&&x.tg===t){dmg*=1.15;break}return dmg},
 take(t,src,dmg,o){return src&&src!==t?dmg*SG.TAKE:dmg},
 hud(u,x,y){const yy=y-22,w=118,dn=u.sg_dn>0,k=dn?1-u.sg_dn/SG.REB:Math.max(0,u.sg_hp||0)/SG.HP;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,yy,w+2,7);g.fillStyle=dn?'#7a6a58':k<.35?'#e07a4a':'#e8c890';g.fillRect(x+1,yy+1,w*k,5);
  g.save();g.translate(x+w+14,yy+12);g.scale(.42,.42);sgBody(0,0,0,performance.now()/1000,0,dn?.35:1);g.restore();
  text(dn?`Marionnette brisée : ${u.sg_dn.toFixed(1).replace('.',',')} s`:`Marionnette ${Math.ceil(u.sg_hp)}/${SG.HP}`,x+w+28,yy+7,11,dn?'#c8a888':'#f0e0c0','left','normal')}};

// ---------- crochets moteur (AFTER : tout le jeu est chargé) ----------
AFTER.push(()=>{UK.push('sg_px','sg_py','sg_hp','sg_dn','sg_pa','sg_ax','sg_ay');
 Object.assign(VP,{sg_pup:[SG.WOOD,SG.STR,'#7a5a3a'],sg_poison:['#a050d0','#c080ff','#5a2a80']});Object.assign(VSND,{sg_poison:{'*':'bugs',blaster:'blaster'},sg_pup:{dash:'dash'}});
 // origine de lancement : marionnette (sauf attaque de base, toujours au corps à corps, et déplacements et engagements, qui déplacent le ninja)
 const sgFrom=(u,ab)=>sgOk(u)&&!!ab&&ab.style==null&&ab!==u.ch.abil[2]&&!(ab.ai&&(ab.ai.mode==='esc'||ab.ai.mode==='gap'||ab.ai.mode==='heal'||ab.ai.mode==='ally'));
 const F0=fire;fire=function(u,ab,a,td,ex){
  if(!sgFrom(u,ab))return F0(u,ab,a,td,ex);
  const ox=u.x,oy=u.y,px=u.sg_px,py=u.sg_py,d0=u.dash,an0=u.anim,ax=u.sg_ax??(ox+Math.cos(a)*(td||200)),ay=u.sg_ay??(oy+Math.sin(a)*(td||200)),dc=Math.hypot(ax-px,ay-py),a2=dc>40?Math.atan2(ay-py,ax-px):a;
  // marionnette posée SUR un ennemi (curseur sur lui) : le coup part d'un peu en retrait, pour que lames et tirs le touchent bien
  const bk=nearE(u,px,py,30)?22:0,lx=px-Math.cos(a2)*bk,ly=py-Math.sin(a2)*bk,n0=projs.length;
  u.x=lx;u.y=ly;u.sg_ox=ox;u.sg_oy=oy;let nx=lx,ny=ly;try{F0(u,ab,a2,Math.max(1,Math.hypot(ax-lx,ay-ly)),ex)}finally{nx=u.x;ny=u.y;u.x=ox;u.y=oy;u.sg_ox=u.sg_oy=null}
  for(let i=n0;i<projs.length;i++){const p=projs[i];if(p.owner===u&&Math.hypot(p.x-lx,p.y-ly)<=26){const b=Math.atan2(p.vy,p.vx);p.x=lx;p.y=ly;if(!bk){p.x-=Math.cos(b)*6;p.y-=Math.sin(b)*6}}} // les tirs naissent dans la marionnette
  if(u.dash&&u.dash!==d0){const d=u.dash;d.tx=clamp(d.tx+ox-d.sx,B.x+u.r,B.x+B.w-u.r);d.ty=clamp(d.ty+oy-d.sy,B.y+u.r,B.y+B.h-u.r);d.sx=ox;d.sy=oy}
  else if(Math.hypot(nx-lx,ny-ly)>1){u.x=nx;u.y=ny;collide(u)} // téléportation : on la garde
  if(u.anim===an0&&!u.dash)anim(u,'sg_pull',.32)};
 // les télégraphes de mudras (et l'IA qui les esquive) partent aussi de la marionnette
 // (comme fire : origine = marionnette, visée = marionnette → point visé ; angle et distance recalculés depuis elle)
 const sgIn=u=>{const c=u.cast,a=c.aimOv??u.aim,ax=u.sg_ax??(u.x+Math.cos(a)*c.td),ay=u.sg_ay??(u.y+Math.sin(a)*c.td),px=u.sg_px,py=u.sg_py,dc=Math.hypot(ax-px,ay-py),S=[u,u.x,u.y,c,c.aimOv,c.td];
  const a2=dc>40?Math.atan2(ay-py,ax-px):a,ab=castAb(u,c),tl=ab&&ab.tele&&!ab.tele.self;c.aimOv=a2;
  if(tl){const D=Math.max(40,dc);c.td=D;u.x=ax-Math.cos(a2)*D;u.y=ay-Math.sin(a2)*D} // zone au point visé (le moteur prend 40 au moins : l'origine recule d'autant)
  else{c.td=Math.max(1,dc);u.x=px;u.y=py}return S};
 const sgOut=([u,x,y,c,a0,t0])=>{u.x=x;u.y=y;c.aimOv=a0;c.td=t0};
 const swapDo=(u,f)=>{if(!u.cast||!sgFrom(u,castAb(u,u.cast)))return f();const S=sgIn(u);try{return f()}finally{sgOut(S)}};
 const TT0=teleTarget;teleTarget=u=>swapDo(u,()=>TT0(u));
 const DT0=drawTelegraphs;drawTelegraphs=function(){const L=[];for(const u of units)if(u.cast&&sgFrom(u,castAb(u,u.cast)))L.push(sgIn(u));try{DT0()}finally{for(const S of L)sgOut(S)}};
 // bots : un jutsu qui part de la marionnette attend qu'elle soit à portée de la cible (ai.pr) ; condition propre (ai.sgOk)
 const AS0=aiSave;aiSave=function(u,i,h){if(sgOn(u)&&h){if(h.sgOk&&!h.sgOk(u))return true;if(h.pr){const e=u.tgt;if(!e||e.dead)return true;const p=sgPos(u);if(Math.hypot(e.x-p.x,e.y-p.y)>h.pr+e.r)return true}}return AS0(u,i,h)};
 // la marionnette est touchée par les coups et les explosions ennemis
 const M0=melee;melee=function(u,a,range,arc,dmg,o){const n=M0(u,a,range,arc,dmg,o);if(u)for(const s of units)if(s.team!==u.team&&sgOk(s)){const d=Math.hypot(s.sg_px-u.x,s.sg_py-u.y);if(d<range+SG.R&&angDiff(Math.atan2(s.sg_py-u.y,s.sg_px-u.x),a)<arc/2)sgHurt(s,dmg,u)}return n};
 const A0=aoe;aoe=function(u,x,y,r,dmg,o,col){A0(u,x,y,r,dmg,o,col);if(u)for(const s of units)if(s.team!==u.team&&sgOk(s)&&Math.hypot(s.sg_px-x,s.sg_py-y)<r+SG.R)sgHurt(s,dmg,u)}});

// ---------- dessin ----------
// marionnette en 2D (repère : pieds en 0,0, vers +x ; pose 1 = lames sorties) ; al = opacité
function sgBody(x,y,pose,t,f,al){g.save();g.translate(x,y);if(al!=null)g.globalAlpha*=al;g.lineCap='round';g.lineJoin='round';const sw=Math.sin(t*2.3),j=Math.sin(t*7)*.6;
 // jambes pendantes
 for(const [lx,ph] of[[-4,0],[4,1.7]]){const k=Math.sin(t*1.8+ph)*2.5;g.strokeStyle=OUT;g.lineWidth=4.2;g.beginPath();g.moveTo(lx,-14);g.lineTo(lx+k*.5,-7);g.lineTo(lx+k,-1);g.stroke();g.strokeStyle=SG.WOOD;g.lineWidth=2.6;g.stroke();circ(lx+k*.5,-7,1.7,'#7a5a3a')}
 // cape sombre à bord déchiré
 g.fillStyle=SG.CLOAK;g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(-8,-31);g.lineTo(8,-31);g.lineTo(12,-12);for(let i=0;i<5;i++)g.lineTo(12-i*6-3,-12+(i%2?4:0));g.lineTo(-12,-12);g.closePath();g.fill();g.stroke();
 g.strokeStyle='#c8a070';g.lineWidth=1.2;g.beginPath();g.moveTo(-6,-27);g.lineTo(6,-27);g.stroke();
 // bras articulés (lames cachées sorties en pose 1)
 const up=pose?-8:0;for(const s of[-1,1]){const ex=s*13,ey=-21+up+(s>0?j:-j),hx=s*17,hy=-13+up*1.6+sw*1.5;g.strokeStyle=OUT;g.lineWidth=3.8;g.beginPath();g.moveTo(s*7,-28);g.lineTo(ex,ey);g.lineTo(hx,hy);g.stroke();g.strokeStyle=SG.WOOD;g.lineWidth=2.3;g.stroke();circ(ex,ey,1.8,'#7a5a3a');
  if(pose){g.strokeStyle='#eef2f8';g.lineWidth=1.8;g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+s*9,hy-6);g.moveTo(hx,hy);g.lineTo(hx+s*7,hy+5);g.stroke()}}
 // tête de bois : visage peint, mâchoire articulée, yeux qui luisent
 const hy=-38+sw*.6;g.fillStyle='#3a2418';g.beginPath();g.moveTo(-7,hy-3);g.lineTo(-5,hy-11);g.lineTo(-1,hy-7);g.lineTo(2,hy-12);g.lineTo(4,hy-6);g.lineTo(8,hy-9);g.lineTo(7,hy-2);g.closePath();g.fill();
 g.fillStyle=SG.WOOD;g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.ellipse(1,hy,6.6,6.4,0,0,7);g.fill();g.stroke();
 g.strokeStyle='#6a4a2a';g.lineWidth=1;g.beginPath();g.moveTo(-3,hy+2.5);g.lineTo(5,hy+2.5);g.moveTo(-3,hy+2.5);g.lineTo(-3,hy+5.5);g.moveTo(5,hy+2.5);g.lineTo(5,hy+5.5);g.stroke();
 g.strokeStyle='#b8282a';g.lineWidth=1.1;g.beginPath();g.moveTo(-1,hy-4.5);g.lineTo(-1,hy+1);g.moveTo(5,hy-4.5);g.lineTo(5,hy+1);g.stroke();
 g.fillStyle='#ffd060';g.fillRect(.6,hy-2.6,2,1.8);g.fillRect(5.4,hy-2.6,2,1.8);g.restore()}
// fils de chakra : des doigts du marionnettiste à la tête et aux mains de la marionnette
function sgStrings(u,q,s,al){if(u.dead)return;const h=P(u.x+Math.cos(u.aim)*12,u.y+Math.sin(u.aim)*12,40),t=performance.now()/1000;g.save();g.lineCap='round';
 for(const [ox,oy] of[[1,-46],[-17,-14],[17,-14]]){const x1=q.x+ox*s,y1=q.y+oy*s,mx=(h.x+x1)/2,my=(h.y+y1)/2+8+Math.sin(t*3+ox)*3;
  g.strokeStyle=rgba(SG.STR,.18*al);g.lineWidth=3;g.beginPath();g.moveTo(h.x,h.y);g.quadraticCurveTo(mx,my,x1,y1);g.stroke();g.strokeStyle=rgba('#e8faff',.7*al);g.lineWidth=1;g.stroke()}
 g.fillStyle=rgba(SG.STR,.8*al);g.beginPath();g.arc(h.x,h.y,2.4,0,7);g.fill();g.restore()}
// marionnette « ninja de bois » pour le rendu 3D : modèle chibi du jeu habillé en marionnette (lames d'os aux avant-bras)
const SG_LK=new WeakMap();
function sgLook(u){const L=u.ch.look;let Q=SG_LK.get(L);if(Q)return Q;const h=L.head;
 Q=Object.assign({},L,{robe:SG.CLOAK,trim:'#c8a070',rshort:1,torso:SG.WOOD,arm:SG.WOOD,legs:SG.WOOD,belt:'#7a5a3a',boot:'#8a6a48',vest:null,armor:null,tunic:null,clouds:null,back:null,gourd:null,dog:null,jet:null,scale:1,
  head:Object.assign({},h,{skin:SG.WOOD,hair:'#3a2418',style:'gaara',eye:'#ffd060',eyeT:null,band:'#7a5a3a',bs:'',acc:'masque',face:'kankuro',kaguya:false,brows:false}),weapon:{t:'kunai',k:'bone',col:SG.STR}});
 SG_LK.set(L,Q);return Q}
function sgFake(u){let f=u._sgf;if(!f||f.c!==u.c||f.ch.look!==sgLook(u)){f=u._sgf=mkUnit(u.c,0,0,u.team);f.ch=Object.assign({},u.ch,{look:sgLook(u)});f.anim={k:'sg_dang',t:1e9,m:1e9}}return f}
// en bataille (40 ninjas), marionnettes en 2D : l'atlas 3D reste aux ninjas
const sgUse3D=()=>mode!=='battle'&&OPT.p3d!==false&&typeof N3!=='undefined'&&N3.ok&&N3.on;
// position affichée (lissée chez l'invité)
function sgDrawPos(u){if(!isGuest()){u._sgx=u.sg_px;u._sgy=u.sg_py}else{if(u._sgx==null||Math.hypot(u._sgx-u.sg_px,u._sgy-u.sg_py)>300){u._sgx=u.sg_px;u._sgy=u.sg_py}const k=Math.min(1,(performance.now()-(u._sgT||0))/1000*16);u._sgx+=(u.sg_px-u._sgx)*k;u._sgy+=(u.sg_py-u._sgy)*k}u._sgT=performance.now();return{x:u._sgx,y:u._sgy}}
function sgDrawPup(u){const t=performance.now()/1000,p=sgDrawPos(u),hidden=u.stealth>0&&player&&u.team!==player.team&&dist(u,player)>140;if(hidden)return;
 if(u.sg_dn>0){// morceaux de bois au sol, qui se rassemblent à la fin
  const q0=P(p.x,p.y),k=1-u.sg_dn/SG.REB;g.save();g.globalAlpha=.85;for(let i=0;i<6;i++){const b=i*1.05+.4,d=(26-k*18)*q0.s,x=q0.x+Math.cos(b)*d,y=q0.y+Math.sin(b)*d*K;g.save();g.translate(x,y);g.rotate(b*2);g.fillStyle=i===0?SG.WOOD:i%2?'#a07850':SG.CLOAK;g.strokeStyle=OUT;g.lineWidth=1;
   if(i===0){g.beginPath();g.ellipse(0,-3,5*q0.s,4.6*q0.s,0,0,7);g.fill();g.stroke()}else{g.fillRect(-6*q0.s,-1.4*q0.s,12*q0.s,2.8*q0.s);g.strokeRect(-6*q0.s,-1.4*q0.s,12*q0.s,2.8*q0.s)}g.restore()}
  g.strokeStyle=rgba(SG.STR,.5);g.lineWidth=1.5;g.beginPath();g.ellipse(q0.x,q0.y,24*q0.s,24*q0.s*K,0,-Math.PI/2,-Math.PI/2+k*6.283);g.stroke();g.restore();return}
 const z=14+Math.sin(t*2.2)*3,q=P(p.x,p.y,z),gq=P(p.x,p.y),s=q.s*1.45,a=u.sg_pa??u.aim,f=Math.cos(a)>=0?1:-1;
 if(u._sgH!=null&&u.sg_hp<u._sgH-.5)u._sgF=performance.now();u._sgH=u.sg_hp;const fl=Math.max(0,1-(performance.now()-(u._sgF||0))/140);
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(gq.x,gq.y,13*gq.s,4.4*gq.s,0,0,7);g.fill();
 {const al=player&&u.team===player.team;g.save();g.strokeStyle=al?'rgba(77,184,255,.6)':'rgba(255,77,77,.6)';g.lineWidth=1.5;g.setLineDash([4,4]);g.lineDashOffset=-t*12;gEll(p.x,p.y,19);g.stroke();g.restore()}
 const atk=u.swing>0||(u.anim&&u.anim.k==='sg_pull');
 if(sgUse3D()){const F=sgFake(u);F.aim=a;F.swing=u.swing;F.swingA=a;F.cmbH=u.cmbH;F.walk=t*6;F.moving=false;F.flash=fl*.12;F.spin=aux.some(x=>x.type==='sg_spin'&&x.ui===sgI(u))?1:null;
  if(!F.anim||F.anim.k!=='sg_dang')F.anim={k:'sg_dang',t:1e9,m:1e9};drawChar3(F,q.x,q.y,q.s*1.3)}
 else{g.save();g.translate(q.x,q.y);g.scale(s*f,s);const spin=aux.some(x=>x.type==='sg_spin'&&x.ui===sgI(u));if(spin)g.scale(Math.cos(t*30),1);sgBody(0,0,atk||spin?1:0,t,f);
  if(fl>0){g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.5*fl);g.beginPath();g.ellipse(0,-26,12,18,0,0,7);g.fill()}g.restore()}
 sgStrings(u,q,s,1);
 // petite jauge de PV au-dessus d'elle quand elle est entamée
 if(u.sg_hp<SG.HP-.5){const w=28*gq.s,y0=q.y-56*s;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(q.x-w/2-1,y0-1,w+2,4.5);g.fillStyle=u.sg_hp<SG.HP*.35?'#e07a4a':'#e8c890';g.fillRect(q.x-w/2,y0,w*u.sg_hp/SG.HP,2.5)}}
// tri en profondeur : la marionnette rejoint la liste des objets dessinés (crochet sgList dans draw)
function sgList(list){for(const u of units)if(sgOn(u)&&!u.dead&&u.sg_px!=null&&near(u.sg_px,u.sg_py))list.push({y:u.sg_py,d:()=>sgDrawPup(u)})}

// --- objets
AUXD.sg_spin=(x,k,t)=>{const q=P(x.x,x.y,20),R=x.r*q.s;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const b=t*16+i*1.047;g.strokeStyle=rgba(i%2?'#eef2f8':SG.STR,.8*k);g.lineWidth=2.4;g.beginPath();g.ellipse(q.x,q.y,R*(.55+i%3*.15),R*(.55+i%3*.15)*K,0,b,b+.7);g.stroke()}
 g.fillStyle=rgba('#eef2f8',.95*k);for(let i=0;i<4;i++){const b=t*16+i*1.571,x0=q.x+Math.cos(b)*R*.85,y0=q.y+Math.sin(b)*R*.85*K;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+Math.cos(b+1.6)*12*q.s,y0+Math.sin(b+1.6)*12*q.s*K);g.lineTo(x0+Math.cos(b)*4*q.s,y0+Math.sin(b)*4*q.s);g.fill()}g.restore();
 g.strokeStyle=rgba('#ffffff',.25*k);g.lineWidth=1.5;g.setLineDash([5,5]);gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([])};
AUXD.sg_mist=(x,k,t)=>{const al=Math.min(1,x.t/.6,(x.m-x.t)/.3);g.save();for(let i=0;i<11;i++){const b=i*.571+t*(i%2?.5:-.4),d=x.r*(.2+((i*37)%70)/100),q=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.85,8+(i%3)*6),r=(22+(i%4)*7)*q.s*(1+Math.sin(t*2+i)*.08);
  g.fillStyle=rgba(i%3?'#7a3aa0':'#a868d0',.22*al);g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill()}
 g.fillStyle=rgba('#d8b0ff',.5*al);for(let i=0;i<6;i++){const q=P(x.x+Math.sin(t*1.3+i*2)*x.r*.6,x.y+Math.cos(t+i*1.7)*x.r*.5,10+((t*20+i*13)%30));g.beginPath();g.arc(q.x,q.y,1.8*q.s,0,7);g.fill()}
 g.strokeStyle=rgba('#a050d0',.45*al);g.lineWidth=1.5;gEll(x.x,x.y,x.r);g.stroke();g.restore()};
// Sanshôuo : grande carapace écaillée, tête de salamandre
AUXD.sg_shell=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s,al=Math.min(1,x.t/.3,(x.m-x.t)/.15),o=x.ui!=null?units[x.ui]:null,a=o?Math.atan2(x.y-o.y,x.x-o.x):0,f=Math.cos(a)>=0?1:-1;g.save();g.globalAlpha=al;
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();
 g.fillStyle=rgba('#a8f0c0',.12);g.strokeStyle=rgba('#c8ffd8',.55);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y-R*.32,R*1.02,R*.82,0,Math.PI,0);g.lineTo(q.x+R*1.02,q.y);g.ellipse(q.x,q.y,R*1.02,R*1.02*K,0,0,Math.PI);g.closePath();g.fill();g.stroke();
 // carapace
 const cy=q.y-16*q.s,sw=46*q.s,sh=34*q.s;g.fillStyle='#4a6a4a';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.ellipse(q.x,cy,sw,sh,0,Math.PI,0);g.lineTo(q.x+sw,cy+6*q.s);g.lineTo(q.x-sw,cy+6*q.s);g.closePath();g.fill();g.stroke();
 g.fillStyle='#6a8a5a';for(let i=-2;i<=2;i++){const hx=q.x+i*16*q.s,hy=cy-sh*(.45-Math.abs(i)*.12);g.beginPath();for(let j=0;j<6;j++){const b=j*1.047;g.lineTo(hx+Math.cos(b)*8*q.s,hy+Math.sin(b)*6*q.s)}g.closePath();g.fill();g.stroke()}
 g.fillStyle='#c8a070';g.fillRect(q.x-sw,cy+2*q.s,sw*2,5*q.s);
 // tête
 const hx=q.x+f*(sw+8*q.s),hy=cy-4*q.s;g.fillStyle='#5a7a52';g.beginPath();g.ellipse(hx,hy,14*q.s,9*q.s,0,0,7);g.fill();g.stroke();g.fillStyle='#ffd060';g.beginPath();g.arc(hx+f*4*q.s,hy-3*q.s,2.2*q.s,0,7);g.fill();
 g.strokeStyle='#2a3a2a';g.lineWidth=1.2;g.beginPath();g.moveTo(hx+f*2*q.s,hy+3*q.s);g.lineTo(hx+f*13*q.s,hy+2*q.s);g.stroke();
 // reflet du bouclier
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#c8ffd8',.35+.25*Math.sin(t*6));g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-R*.32,R*.95,R*.75,0,Math.PI*1.1,Math.PI*1.45);g.stroke();g.restore()};
AUXD.sg_str=(x,k,t)=>{const o=x.ui!=null?units[x.ui]:null,e=x.ti!=null?units[x.ti]:null;if(!o||!e||o.dead||e.dead)return;const p=o.sg_dn>0||o.sg_px==null?o:{x:o._sgx??o.sg_px,y:o._sgy??o.sg_py},a=P(p.x,p.y,40),b=P(e.x,e.y,36),al=Math.min(1,x.t/.3);
 g.save();g.lineCap='round';for(let i=-2;i<=2;i++){const mx=(a.x+b.x)/2+i*4,my=(a.y+b.y)/2+10+Math.sin(t*5+i)*4;g.strokeStyle=rgba(SG.STR,.25*al);g.lineWidth=3;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo(mx,my,b.x+i*3*b.s,b.y+(i%2)*6*b.s);g.stroke();g.strokeStyle=rgba('#e8faff',.8*al);g.lineWidth=1;g.stroke()}
 g.restore()};
// Kuroari : la fourmi noire referme sa carapace sur la proie
AUXD.sg_ant=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s;g.save();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(q.x,q.y,30*s,10*s,0,0,7);g.fill();
 for(const sd of[-1,1]){g.strokeStyle=OUT;g.lineWidth=3*s;for(let i=0;i<3;i++){g.beginPath();g.moveTo(q.x+sd*16*s,q.y-(18+i*8)*s);g.lineTo(q.x+sd*30*s,q.y-(12+i*7)*s);g.lineTo(q.x+sd*34*s,q.y-(i*3)*s);g.stroke()}}g.restore()};
// carapace dessinée PAR-DESSUS la proie (elle est enfermée dedans)
STATD.push((u,p,S)=>{const i=sgI(u);for(const x of aux){if(x.ti!==i||!(x.t>0))continue;if(x.type==='sg_ant')sgAntShell(x,{x:p.x,y:p.y,s:S/1.3});else if(x.type==='sg_str')sgStrWrap(x,p,S/1.3)}});
// Fils de chakra : fils lumineux enroulés autour de la cible (par-dessus elle, lisibles en 2D comme en 3D)
function sgStrWrap(x,q,s){const al=Math.min(1,x.t/.3),t=performance.now()/1000,o=x.ui!=null?units[x.ui]:null;g.save();g.lineCap='round';
 for(let k=0;k<3;k++){const y=q.y-(12+k*15)*s,w=(15-k)*s,ph=t*4+k*2;g.strokeStyle=rgba(SG.STR,.35*al);g.lineWidth=4*s;g.beginPath();g.ellipse(q.x,y,w,w*.32,Math.sin(ph)*.12,0,7);g.stroke();g.strokeStyle=rgba('#e8faff',.95*al);g.lineWidth=1.3;g.beginPath();g.ellipse(q.x,y,w,w*.32,Math.sin(ph)*.12,0,7);g.stroke()}
 if(o&&!o.dead){const src=o.sg_dn>0||o.sg_px==null?P(o.x,o.y,40):P(o._sgx??o.sg_px,o._sgy??o.sg_py,40);g.strokeStyle=rgba('#e8faff',.8*al);g.lineWidth=1.2;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(q.x+k*6*s,q.y-(27+k*8)*s);g.quadraticCurveTo((q.x+src.x)/2,(q.y-27*s+src.y)/2+8+Math.sin(t*5+k)*4,src.x,src.y);g.stroke()}}
 g.restore()}
function sgAntShell(x,q){const s=q.s,cl=Math.min(1,(x.m-x.t)/.15);g.save();
 const op=(1-cl)*14*s;g.fillStyle='#221a28';g.strokeStyle='#5a4a68';g.lineWidth=1.6;for(const sd of[-1,1]){g.beginPath();g.ellipse(q.x+sd*op,q.y-30*s,22*s,30*s,0,sd<0?Math.PI*.5:-Math.PI*.5,sd<0?Math.PI*1.5:Math.PI*.5);g.closePath();g.fill();g.stroke()}
 g.strokeStyle='#8a7a98';g.lineWidth=1.2;for(let i=1;i<4;i++){g.beginPath();g.ellipse(q.x,q.y-30*s,22*s,30*s*i/4,0,Math.PI*1.05,Math.PI*1.95);g.stroke()}
 g.fillStyle='#221a28';g.beginPath();g.ellipse(q.x,q.y-66*s,11*s,9*s,0,0,7);g.fill();g.stroke();g.fillStyle='#ff4a4a';g.fillRect(q.x-6*s,q.y-68*s,3*s,2*s);g.fillRect(q.x+3*s,q.y-68*s,3*s,2*s);
 g.strokeStyle='#221a28';g.lineWidth=2*s;g.beginPath();g.moveTo(q.x-4*s,q.y-74*s);g.quadraticCurveTo(q.x-12*s,q.y-86*s,q.x-16*s,q.y-82*s);g.moveTo(q.x+4*s,q.y-74*s);g.quadraticCurveTo(q.x+12*s,q.y-86*s,q.x+16*s,q.y-82*s);g.stroke();
 // compte à rebours des lames : petites pointes qui sortent
 const e=1-x.t/x.m;if(e>.55){g.fillStyle='#eef2f8';for(let i=0;i<6;i++){const b=i*1.047+.3,L=(e-.55)/.45*16*s;g.beginPath();g.moveTo(q.x+Math.cos(b)*20*s,q.y-30*s+Math.sin(b)*26*s);g.lineTo(q.x+Math.cos(b)*(20*s+L),q.y-30*s+Math.sin(b)*(26*s+L));g.lineTo(q.x+Math.cos(b+.15)*20*s,q.y-30*s+Math.sin(b+.15)*26*s);g.fill()}}g.restore()};
// Mère et Père : cercle d'alerte, puis deux grandes marionnettes qui accourent des deux côtés
function sgParent(x,y,s,f,fem,t,arms){g.save();g.translate(x,y);g.scale(s*f,s);g.lineCap='round';g.lineJoin='round';
 g.fillStyle=fem?'#5a2a3a':'#2a2a3a';g.strokeStyle=OUT;g.lineWidth=1.6;g.beginPath();g.moveTo(-10,-44);g.lineTo(10,-44);g.lineTo(16,-4);g.lineTo(-16,-4);g.closePath();g.fill();g.stroke();
 g.strokeStyle=OUT;g.lineWidth=4.5;g.beginPath();g.moveTo(8,-40);g.lineTo(18+arms*10,-34+arms*4);g.lineTo(30+arms*12,-30);g.stroke();g.strokeStyle='#e8d8c0';g.lineWidth=3;g.stroke();
 g.fillStyle='#e8d8c0';g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.ellipse(2,-52,8,8.5,0,0,7);g.fill();g.stroke();
 g.fillStyle=fem?'#7a2a2a':'#2a1a14';g.beginPath();if(fem){g.moveTo(-8,-56);g.quadraticCurveTo(2,-66,10,-56);g.lineTo(9,-36);g.lineTo(5,-50);g.lineTo(-6,-50);g.lineTo(-10,-36);g.closePath()}else{g.moveTo(-8,-55);g.lineTo(-4,-63);g.lineTo(1,-58);g.lineTo(5,-64);g.lineTo(9,-55);g.closePath()}g.fill();
 g.fillStyle='#1a1010';g.fillRect(3,-54,2,2);g.fillRect(7,-54,2,2);g.strokeStyle='#b8282a';g.lineWidth=1;g.beginPath();g.moveTo(2,-47);g.lineTo(8,-47);g.stroke();g.restore()}
AUXD.sg_hug=(x,k,t)=>{const el=x.m-x.t,e=Math.min(1,el/.6);g.save();
 if(el<.6){g.fillStyle=rgba('#e0a0c0',.1+.2*e);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=2;g.setLineDash([6,5]);gEll(x.x,x.y,x.r);g.stroke();gEll(x.x,x.y,150);g.stroke();g.setLineDash([]);g.fillStyle=rgba('#e0a0c0',.25);gEll(x.x,x.y,x.r*e);g.fill()}
 const d=150*(1-ezio(e))+18,px=-Math.sin(x.a),py=Math.cos(x.a);for(const sd of[-1,1]){const wx=x.x+px*d*sd,wy=x.y+py*d*sd,p=P(wx,wy,12+Math.sin(Math.PI*e)*24),f=(x.x-wx)>=0?1:-1;
  g.fillStyle='rgba(0,0,0,.25)';const gp=P(wx,wy);g.beginPath();g.ellipse(gp.x,gp.y,16*gp.s,5*gp.s,0,0,7);g.fill();sgParent(p.x,p.y,p.s*1.35,f,sd>0,t,e)}g.restore()};
// Armée de marionnettes : 10 marionnettes en cercle, qui foncent à la fin
AUXD.sg_army=(x,k,t)=>{const al=Math.min(1,(x.m-x.t)/.4),fin=x.t<.5?1-x.t/.5:0;g.save();g.strokeStyle=rgba('#c8a070',.4*al);g.lineWidth=2;g.setLineDash([8,6]);g.lineDashOffset=-t*30;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 if(x.t<.8){const e2=1-x.t/.8;g.fillStyle=rgba('#ff6a4a',.12+.18*e2);gEll(x.x,x.y,130);g.fill();g.strokeStyle=rgba('#ff8a6a',.7);g.lineWidth=2;gEll(x.x,x.y,130);g.stroke()}
 const L=[];for(let i=0;i<10;i++){const p=sgArmyP(x,i);const m=ezio(fin);L.push({x:lerp(p.x,x.x,m*.8),y:lerp(p.y,x.y,m*.8),i})}L.sort((a,b)=>a.y-b.y);
 for(const p of L){const z=10+Math.sin(t*2.4+p.i)*4,q=P(p.x,p.y,z),gq=P(p.x,p.y),f=x.x>=p.x?1:-1;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(gq.x,gq.y,10*gq.s,3.4*gq.s,0,0,7);g.fill();
  g.save();g.translate(q.x,q.y);g.scale(q.s*1.05*f,q.s*1.05);sgBody(0,0,fin>0?1:p.i%2,t+p.i*.7,f,al);g.restore();
  const top=P(p.x,p.y,160);g.strokeStyle=rgba(SG.STR,.25*al);g.lineWidth=1;g.beginPath();g.moveTo(q.x,q.y-46*q.s);g.lineTo(top.x,top.y);g.stroke()}g.restore()};
// --- projectiles
PROJD.sg_needle=(p,R,ra)=>{g.rotate(ra);g.strokeStyle='#eef2f8';g.lineWidth=1.6;g.beginPath();g.moveTo(-9,0);g.lineTo(5,0);g.stroke();g.fillStyle='#c080ff';g.beginPath();g.moveTo(5,-2);g.lineTo(10,0);g.lineTo(5,2);g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#a050d0',.45);g.lineWidth=4;g.beginPath();g.moveTo(-16,0);g.lineTo(-6,0);g.stroke()};
PROJD.sg_ant=(p,R,ra,t)=>{const f=Math.cos(ra)>=0?1:-1;g.save();g.scale(f,1);g.rotate(f>0?ra*.3:(ra-Math.PI)*.3);g.lineCap='round';
 g.strokeStyle=OUT;g.lineWidth=2.4;for(let i=0;i<3;i++){const w=Math.sin(t/40+i*2)*3;g.beginPath();g.moveTo(-4+i*6,0);g.lineTo(-8+i*6+w,10);g.moveTo(-4+i*6,0);g.lineTo(-8+i*6-w,-10);g.stroke()}
 g.fillStyle='#221a28';g.strokeStyle='#5a4a68';g.lineWidth=1.4;g.beginPath();g.ellipse(-12,0,11,8,0,0,7);g.fill();g.stroke();g.beginPath();g.ellipse(4,0,7,6,0,0,7);g.fill();g.stroke();g.beginPath();g.ellipse(15,-2,6,5,0,0,7);g.fill();g.stroke();
 g.fillStyle='#ff4a4a';g.fillRect(17,-4,2,2);g.restore()};
// --- effets
JFXD.sg_slash=(f,k,e)=>{const q=P(f.x,f.y,26),s=q.s,R=f.R*s,c=f.c||1,ra=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));g.save();g.translate(q.x,q.y);g.globalCompositeOperation='lighter';g.lineCap='round';
 if(c===4){for(let i=0;i<3;i++){g.strokeStyle=rgba(i?SG.STR:'#ffffff',.85*k);g.lineWidth=(3-i)*s+1;g.beginPath();g.ellipse(0,0,R*(.7+i*.12),R*(.7+i*.12)*K,0,e*9+i,e*9+i+4.2);g.stroke()}}
 else if(c===5){g.rotate(ra);g.strokeStyle=rgba('#ffffff',k);g.lineWidth=4*s;g.beginPath();g.moveTo(-6*s,0);g.lineTo(R*(.4+e*.6),0);g.stroke();g.strokeStyle=rgba('#c080ff',.8*k);g.lineWidth=8*s;g.beginPath();g.moveTo(R*.5,0);g.lineTo(R*(.5+e*.5),0);g.stroke()}
 else{g.rotate(ra);const sd=c===2?-1:1,w=c===3?2:1;for(let j=0;j<w;j++){const o=(j?-1:1)*sd;g.strokeStyle=rgba('#ffffff',k);g.lineWidth=3*s;g.beginPath();g.arc(0,0,R*.75,-o*(1.1-e*1.8)-.3,-o*(1.1-e*1.8)+.3);g.stroke();g.strokeStyle=rgba(SG.STR,.6*k);g.lineWidth=7*s;g.beginPath();g.arc(0,0,R*.7,-o*(1.1-e*1.8)-.5,-o*(1.1-e*1.8)+.1);g.stroke()}}
 g.restore()};
JFXD.sg_puff=(f,k,e)=>{const q=P(f.x,f.y,30),s=q.s;g.save();for(let i=0;i<5;i++){const b=f.a+(i-2)*.25,d=(10+e*40)*s;g.fillStyle=rgba(i%2?'#a050d0':'#d8b0ff',.5*k);g.beginPath();g.arc(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K,(4+e*6)*s,0,7);g.fill()}g.restore()};
JFXD.sg_poof=(f,k,e)=>{const q=P(f.x,f.y,18),R=f.r*q.s;g.save();for(let i=0;i<8;i++){const b=i*.785+f.r,d=R*(.3+e*.7),r=R*(.35+e*.25)*(i%2?.8:1);g.fillStyle=rgba(i%3?'#efe8dc':'#d8ccbc',.75*k);g.beginPath();g.arc(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6-e*14*q.s,r,0,7);g.fill()}
 g.strokeStyle=rgba('#c8a070',.6*k);g.lineWidth=2;gEll(f.x,f.y,f.r*(.6+e*.6));g.stroke();g.restore()};
JFXD.sg_smoke=(f,k,e,t)=>{const al=Math.min(1,k*2.2);g.save();for(let i=0;i<12;i++){const b=i*.524+t*.3,d=f.r*(.25+((i*41)%60)/100)*(.6+e*.5),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d*.8,10+(i%3)*8),r=(16+(i%4)*6)*q.s*(.8+e*.5);
 g.fillStyle=rgba(i%2?'#d8d8dc':'#b8b8c0',.45*al);g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill()}g.restore()};
JFXD.sg_break=(f,k,e)=>{const q=P(f.x,f.y,14),s=q.s;g.save();for(let i=0;i<7;i++){const b=i*.9+f.a,d=(8+e*44)*s,h=Math.sin(Math.PI*Math.min(1,e*1.4))*30*s;g.save();g.translate(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6-h);g.rotate(e*8+i);g.globalAlpha=Math.min(1,k*2);
 g.fillStyle=i===0?SG.WOOD:i%2?'#a07850':SG.CLOAK;g.strokeStyle=OUT;g.lineWidth=1;if(i===0){g.beginPath();g.ellipse(0,0,6*s,5.6*s,0,0,7);g.fill();g.stroke()}else{g.fillRect(-7*s,-1.5*s,14*s,3*s);g.strokeRect(-7*s,-1.5*s,14*s,3*s)}g.restore()}
 g.strokeStyle=rgba(SG.STR,.7*k);g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(q.x,q.y-30*s);g.lineTo(q.x+(i-1)*20*s,q.y-(60+e*30)*s);g.stroke()}g.restore()};
JFXD.sg_block=(f,k,e)=>{const q=P(f.x,f.y,24),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#c8ffd8',.9*k);g.lineWidth=3;g.beginPath();g.arc(q.x,q.y,(8+e*16)*s,f.a-1,f.a+1);g.stroke();g.fillStyle=rgba('#ffffff',.8*k);g.beginPath();g.arc(q.x,q.y,4*s*k,0,7);g.fill();g.restore()};
JFXD.sg_snap=(f,k,e)=>{const q=P(f.x,f.y,36),s=q.s;g.save();g.strokeStyle=rgba(SG.STR,.9*k);g.lineWidth=1.4;for(let i=0;i<5;i++){const b=i*1.256+.3;g.beginPath();g.moveTo(q.x+Math.cos(b)*8*s,q.y+Math.sin(b)*8*s);g.quadraticCurveTo(q.x+Math.cos(b+.5)*20*s,q.y+Math.sin(b+.5)*20*s,q.x+Math.cos(b)*(14+e*30)*s,q.y+Math.sin(b)*(14+e*30)*s+e*10*s);g.stroke()}g.restore()};
JFXD.sg_pierce=(f,k,e)=>{const q=P(f.x,f.y,30),s=q.s;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const b=i*.785,L=(10+Math.min(1,e*3)*34)*s;g.strokeStyle=rgba('#ffffff',k);g.lineWidth=2.5*s;g.beginPath();g.moveTo(q.x+Math.cos(b)*6*s,q.y+Math.sin(b)*6*s);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*.8);g.stroke()}
 g.fillStyle=rgba('#b02030',.6*k);g.beginPath();g.arc(q.x,q.y,(10+e*14)*s,0,7);g.fill();g.restore()};
JFXD.sg_clasp=(f,k,e)=>{const q=P(f.x,f.y,30),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd0e0',.9*k);g.lineWidth=6*k+1;gEll(f.x,f.y,85*(.4+e*.9));g.stroke();g.fillStyle=rgba('#ffffff',.9*k);g.beginPath();for(let i=0;i<12;i++){const b=i*.5236,L=i%2?8*s:(26+e*30)*s;g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*.7)}g.closePath();g.fill();g.restore();
 if(e<.6){const p=P(f.x,f.y,12),px=-Math.sin(f.a),py=Math.cos(f.a);for(const sd of[-1,1]){const wx=f.x+px*18*sd,wy=f.y+py*18*sd,pp=P(wx,wy,12);sgParent(pp.x,pp.y,pp.s*1.35,(f.x-wx)>=0?1:-1,sd>0,0,1)}}};
JFXD.sg_lunge=(f,k,e,t)=>{const m=e<.5?ezo(e/.5):1-ezio((e-.5)/.5),x=lerp(f.x,f.ex,m*.85),y=lerp(f.y,f.ey,m*.85),q=P(x,y,12+Math.sin(Math.PI*e)*18),dir=f.ex>=f.x?1:-1;g.save();g.translate(q.x,q.y);g.scale(q.s*1.05*dir,q.s*1.05);sgBody(0,0,1,t,dir);g.restore();
 if(e>.4&&e<.7){const p=P(f.ex,f.ey,30);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=2.5;g.beginPath();g.moveTo(p.x-12*p.s,p.y-8*p.s);g.lineTo(p.x+12*p.s,p.y+8*p.s);g.stroke();g.restore()}};
JFXD.sg_finale=(f,k,e)=>{const q=P(f.x,f.y,20),s=q.s;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const b=i*.628,L=(130-e*100)*s;g.strokeStyle=rgba('#eef2f8',.9*k);g.lineWidth=3*s;g.beginPath();g.moveTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*K);g.lineTo(q.x+Math.cos(b)*(L-30*s),q.y+Math.sin(b)*(L-30*s)*K);g.stroke()}
 g.strokeStyle=rgba('#ff8a6a',.8*k);g.lineWidth=5*k+1;gEll(f.x,f.y,130*(.3+e*.7));g.stroke();g.fillStyle=rgba('#ffffff',.8*k);g.beginPath();g.arc(q.x,q.y,(16+e*20)*s*k,0,7);g.fill();g.restore()};
DETO.sg_pup=(x,y,r)=>jx({jfx:'sg_poof',x,y,r:Math.min(80,r*.6),t:.45,m:.45});

// ---------- apparence : yeux clairs, parchemin d'invocation dans le dos (si rien n'est porté) ----------
CLOOK[14]=(look,l,S)=>{look.head.eye='#bfe8ff';if(!look.back&&!look.gourd)look.back='parchemin'};

// ---------- poses 3D ----------
Object.assign(ANIM,{
 // marionnette suspendue : tête penchée, membres qui pendent et tressautent au bout des fils
 sg_dang:(P,e,u,t)=>{const j=Math.sin(t*7.3)*.12,w=Math.sin(t*2.2);P.root.y=1.5+w*1.2;pz(P,'head',.32+Math.sin(t*1.1)*.08,Math.sin(t*.8)*.25,.22);pz(P,'chest',.12,0,Math.sin(t*1.5)*.06);
  if(!(u.swing>0)&&!u.spin){pz(P,'armL',-.45+Math.sin(t*1.7)*.18+j,0,.3);pz(P,'foreL',-.7);pz(P,'armR',-.4+Math.sin(t*1.9+1)*.18-j,0,-.3);pz(P,'foreR',-.75)}
  pz(P,'thighL',-.2+Math.sin(t*1.3)*.14);pz(P,'shinL',.5);pz(P,'footL',.55);pz(P,'thighR',.08+Math.sin(t*1.3+2)*.14);pz(P,'shinR',.6);pz(P,'footR',.55)},
 // marionnettiste qui tient ses fils (au repos ou en courant) : avant-bras levés, doigts écartés
 sg_hold:(P,e,u,t)=>{if(u.swing>0||u.thrT>0||u.relT>0||u.cast||u.chan||u.flame||u.chk||u.block||u.dash)return;const j=Math.sin(t*9)*.06;pz(P,'armL',-1.1+j,0,.3);pz(P,'foreL',-1.05);pz(P,'armR',-1.15-j,0,-.3);pz(P,'foreR',-1.0);pz(P,'handL',.5);pz(P,'handR',.5)},
 // tirer sur les fils : coup sec des deux mains
 sg_pull:(P,e,u,t)=>{const k=e<.3?ezo(e/.3):1-ezio((e-.3)/.7)*.6;pz(P,'armL',-1.2-.5*k,0,.25);pz(P,'foreL',-1.1+.9*k);pz(P,'armR',-1.25-.5*k,0,-.25);pz(P,'foreR',-1.05+.9*k);pz(P,'chest',-.12*k);pz(P,'handL',.6*k);pz(P,'handR',.6*k);P.root.z=-2*k},
 // invocation : bras écartés puis jetés en avant
 sg_summon:(P,e)=>{const up=e<.45,k=up?ezo(e/.45):ezio((e-.45)/.55);if(up){pz(P,'armL',-2.6*k,0,.8*k);pz(P,'armR',-2.6*k,0,-.8*k);pz(P,'chest',-.25*k);P.root.y=1.5*k}else{pz(P,'armL',-2.6+1.1*k,0,.8-.5*k);pz(P,'armR',-2.6+1.1*k,0,-.8+.5*k);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'chest',-.25+.45*k);P.root.z=4*k;pz(P,'thighL',-.5*k);pz(P,'shinL',.6*k)}},
});
