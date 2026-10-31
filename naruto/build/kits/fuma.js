// ===== Clan Fûma (c17, préfixe fm_) : assassins aux shuriken =====
// Identité : les shuriken MARQUENT (trait) ; un jutsu sur une cible marquée, ou un coup porté dans son dos, est CRITIQUE.
// Combos : Traceur / Fûma / Fil / Kage marquent → Assassinat de l'ombre ou Danse des mille ombres frappent dans le dos d'une cible marquée (critique mortel).
// Shunshin de l'ombre rend invisible : l'embuscade qui suit compte comme un critique.
// [emplacement, rang, mécanique, nom, description, élément visuel]
const FM_D={
 trace:'Shuriken rapide et précis : 10 dégâts, marque la cible 6 s et la révèle',
 fuma:'Fûma géant lancé en courbe, qui revient : 12 dégâts à l\'aller (ralentit, marque), 12 au retour (critique si marquée)',
 wire:'Shuriken relié à un fil de chakra : le 1er ennemi touché est ligoté (entravé 1 s), subit 8 dégâts et est marqué',
 kage:'Un shuriken (12, marque) en cache un 2e dans son ombre (13, critique sur la cible marquée) ; si le 1er est arrêté, l\'ombre surgit et file vers l\'ennemi proche',
 orbit:'3 s : 4 shuriken tournent autour de toi, chacun détruit un tir ennemi ; au contact, 5 dégâts toutes les 0,5 s (marque) ; à la fin, les restants filent vers l\'ennemi (6)',
 ansatsu:'Tu te fonds dans l\'ombre (intouchable 0,4 s) et surgis dans le dos de l\'ennemi visé (380) : coup de lame de 22, toujours critique, ralentit',
 maki:'Sème des chausse-trapes au curseur (zone de 75, 4 s) : les ennemis dessus sont ralentis et perdent 3 PV/s',
 shun:'Disparaît dans une fumée noire et réapparaît au curseur (260 max), invisible 1,2 s : ta prochaine attaque est critique',
 repli:'Salto arrière (190) en lançant 3 shuriken en éventail vers l\'avant (5 dégâts, marquent)',
 rain:'Une pluie de shuriken s\'abat sur la zone (140) : 5 vagues de 7 (marquent, ralentissent), puis la dernière (10, critique si marqué) étourdit 0,5 s',
 dance:'Disparaît (intouchable) et frappe 3 fois dans le dos des ennemis proches (400), les marqués d\'abord : 9 par coup, toujours critique'};
KIT('c17',[
 [1,'D','x.fm_trace','Shuriken traceur',FM_D.trace,'shuriken'],
 [1,'C','x.fm_fuma','Shuriken du croissant',FM_D.fuma,'shuriken'],
 [3,'C','x.fm_wire','Shuriken à fil',FM_D.wire,'shuriken'],
 [3,'B','x.fm_kage','Kage shuriken',FM_D.kage,'shuriken'],
 [4,'B','x.fm_orbit','Shuriken tournoyants',FM_D.orbit,'shuriken'],
 [4,'A','x.fm_ansatsu','Assassinat de l\'ombre',FM_D.ansatsu,'shuriken'],
 [4,'D','x.fm_maki','Makibishi',FM_D.maki,'shuriken'],
 [2,'C','x.fm_shun','Shunshin de l\'ombre',FM_D.shun,'shuriken'],
 [2,'D','x.fm_repli','Repli du Fûma',FM_D.repli,'shuriken'],
 [5,'A','x.fm_rain','Pluie de shuriken',FM_D.rain,'shuriken'],
 [5,'S','x.fm_dance','Danse des mille ombres',FM_D.dance,'shuriken'],
]);
// ---------- réglages ----------
// FM_BAL : facteur sur tous les dégâts d'un Fûma (équilibrage du clan, à côté de CLANBAL[17] dans nr_ninja.js)
const FM_BAL=.95,FM_CRIT=1.4,FM_CRIT2=1.6,FM_BCD=2.5,FM_MK=4,FM_BACK=2.0; // critique ×1,4 (×1,6 marque + dos) ; coup dans le dos au plus toutes les 2,5 s ; marque 4 s ; dos = arc de 130° derrière la cible
const FM_STEEL='#cfd3dd',FM_DARK='#24222c',FM_RED='#ff3048',FM_SHD='#3a2a4a';
// style de combat propre (ajouté à la fin de STYLES) ; le Taijutsu reste possible pour un Fûma au corps à corps
STYLES.push(['Lancer Fûma','Shuriken tournoyants à longue portée ; tous les 4 lancers, un 2e shuriken caché dans l\'ombre du 1er, qui marque la cible','x.fm_style','shuriken','kunai',[17],.68,.68]);
{const T=STYLES.find(s=>s[0]==='Taijutsu');if(T&&!T[5].includes(17))T[5].push(17)}
// ---------- aides ----------
const fmI=u=>units.indexOf(u);
const fmS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son « brut »
// texte au-dessus des dégâts et des états du moteur (ne se mêle pas à « -12 » ni à « ENTRAVÉ »)
const fmSay=(u,s,col,z)=>{if(near(u.x,u.y))txt.push({x:u.x,y:u.y,z:z||122,s,col,t:1})};
const fm_h=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)}; // hasard figé (dessins)
// marque de l'assassin (objet aux qui suit la cible : synchronisé chez les invités)
function fmMarkOf(e,u){for(const x of aux)if(x.type==='fm_mark'&&x.t>0&&x.tg===e&&x.owner===u)return x;return null}
function fmMark(u,e,d){if(!e||e.dead||e===u||e.team===u.team)return;const x=fmMarkOf(e,u);if(x){x.t=x.m=Math.max(x.t,d);return}
 aux.push({type:'fm_mark',x:e.x,y:e.y,r:24,t:d,m:d,team:u.team,owner:u,tg:e,ti:fmI(e),ui:fmI(u),k:0});fmSay(e,'MARQUÉ','#ff6a7a',112);jx({jfx:'fm_mkfx',x:e.x,y:e.y,ti:fmI(e),t:.45,m:.45})}
// l'attaquant est-il dans le dos de la cible (arc de 130° derrière elle, à moins de 340) ?
const fmBehind=(t,src)=>dist(t,src)<340&&angDiff(t.aim||0,ang(t,src))>FM_BACK;
function fmCrit(src,t,big){fmSay(t,big?'CRITIQUE MORTEL !':'CRITIQUE !',big?'#ffd040':FM_RED,128);jx({jfx:'fm_crit',x:t.x,y:t.y,a:ang(src,t),big:big?1:0,t:.6,m:.6});
 if(near(t.x,t.y)){fmS('saber',src);if(src===player||t===player)shake=Math.max(shake,big?.22:.14)}}
// point juste dans le dos d'une cible (là où elle ne regarde pas), dans l'arène
function fmBackPos(e,u){const b=(e.aim||0)+Math.PI,d=e.r+u.r+4;return{x:clamp(e.x+Math.cos(b)*d,B.x+u.r,B.x+B.w-u.r),y:clamp(e.y+Math.sin(b)*d,B.y+u.r,B.y+B.h-u.r)}}
// surgit dans le dos de e et frappe (Assassinat, Danse)
function fmStrike(u,e,dmg,o){const p0={x:u.x,y:u.y},p=fmBackPos(e,u);jx({jfx:'fm_vanish',x:p0.x,y:p0.y,r:30,t:.45,m:.45});u.dash=null;u.kx=u.ky=0;u.x=p.x;u.y=p.y;collide(u);u.aim=ang(u,e);
 jx({jfx:'fm_streak',x:p0.x,y:p0.y,x2:u.x,y2:u.y,t:.3,m:.3});jx({jfx:'fm_vanish',x:u.x,y:u.y,r:26,t:.4,m:.4,inv:1});anim(u,'fm_stab',.34);u.swing=.16;u.swingA=u.aim;
 const V=VFX;VFX='steel';const ok=hit(e,u,dmg,Object.assign({melee:1,fm_back:1,unblockable:1},o));VFX=V;jx({jfx:'fm_slash',x:e.x,y:e.y,a:u.aim,t:.35,m:.35});if(near(u.x,u.y))fmS('saber',u);return ok}
// petit shuriken (style, Traceur, Repli, fin des Tournoyants)
const fmShu=(u,a,o)=>proj(u,a,Object.assign({spd:900,r:6,dmg:7,life:.66,col:FM_STEEL,kind:'fm_shu'},o));
// ---------- mécaniques ----------
Object.assign(NAT,{
 // style : shuriken alternés ; tous les 4 lancers, un 2e caché dans l'ombre du 1er (le 1er marque)
 fm_style:SP('Lancer Fûma','',.34,{hero:'lando',ai:{max:600,p:.85}},(u,a)=>{if(SIMT-(u.fm_kt||-9)>1.6)u.fm_kn=0;u.fm_kt=SIMT;u.fm_kn=(u.fm_kn||0)%4+1;const k4=u.fm_kn===4;S('blaster',u);
  fmShu(u,a,{dmg:7,life:.68,o:k4?{fm_sh:1}:{}});
  if(k4){const p1=projs[projs.length-1];proj(u,a,{x:p1.x-Math.cos(a)*20,y:p1.y-Math.sin(a)*20,spd:900,r:6,dmg:5,life:.7,col:FM_DARK,kind:'fm_kage',noClash:1})}
  anim(u,u.fm_kn%2?'fm_flickr':'fm_flickl',.24)}),
 fm_trace:SP('Shuriken traceur',FM_D.trace,5,{line:{len:600,w:14},ai:RG(560,.7)},(u,a)=>{S('blaster',u);anim(u,'fm_flickr',.26);
  fmShu(u,a,{spd:1150,r:6,dmg:10,life:.54,kind:'fm_trace',noClash:1,o:{fm_sh:1,fm_md:6,reveal:1}});jx({jfx:'fm_glint',x:u.x,y:u.y,a,t:.25,m:.25})}),
 // Fûma : arc de cercle (le côté alterne) dont la corde tombe sur la visée, puis retour droit vers le lanceur (moteur : ret)
 fm_fuma:SP('Shuriken du croissant',FM_D.fuma,8,{line:{len:380,w:30},ai:RG(400,.6,60)},(u,a)=>{u.fm_side=u.fm_side>0?-1:1;const cv=1.0*u.fm_side,T=380/640;anim(u,'fm_heave',.45);fmS('saber',u);S('dash',u);
  proj(u,a-cv*T/2,{spd:640,r:15,dmg:12,life:2.6,col:FM_STEEL,ret:380,pierce:1,slow:.6,kind:'fm_big',o:{fm_sh:1}});
  aux.push({type:'fm_boom',p:projs[projs.length-1],x:u.x,y:u.y,t:1,m:1,team:u.team,owner:u,cv,k:0})}),
 fm_wire:SP('Shuriken à fil',FM_D.wire,10,{line:{len:450,w:16},ai:RG(430,.55)},(u,a)=>{S('blaster',u);anim(u,'fm_flickl',.3);
  proj(u,a,{spd:940,r:7,dmg:8,life:.48,col:FM_STEEL,kind:'fm_wire',noClash:1,root:1,o:{fm_sh:1},onHit:(p,t)=>{const o=p.owner;if(t.dead)return;
   aux.push({type:'fm_bind',x:t.x,y:t.y,r:1,t:1,m:1,team:o.team,owner:o,tg:t,ti:fmI(t),ui:fmI(o),k:0});if(near(t.x,t.y))fmS('deflect',o)}});
  aux.push({type:'fm_wl',p:projs[projs.length-1],x:u.x,y:u.y,t:1,m:1,team:u.team,owner:u,ui:fmI(u),k:0})}),
 // Kage shuriken : le 2e voyage 22 px derrière le 1er, presque invisible ; il ne se montre que si le 1er disparaît
 fm_kage:SP('Kage shuriken',FM_D.kage,9,{line:{len:540,w:16},ai:RG(520,.6)},(u,a)=>{S('blaster',u);anim(u,'fm_flickr',.3);
  fmShu(u,a,{spd:860,r:7,dmg:12,life:.62,o:{fm_sh:1},onHit:p=>{p.fm_hit=1}});const p1=projs[projs.length-1];
  proj(u,a,{x:p1.x-Math.cos(a)*22,y:p1.y-Math.sin(a)*22,spd:860,r:7,dmg:13,life:.7,col:FM_DARK,kind:'fm_kage',noClash:1});
  aux.push({type:'fm_kg',p1,p2:projs[projs.length-1],x:u.x,y:u.y,t:1,m:1,team:u.team,owner:u,k:0,n:0})}),
 fm_orbit:SP('Shuriken tournoyants',FM_D.orbit,11,{ai:{mode:'def',p:.5}},(u)=>{fmS('saber',u);S('dash',u);anim(u,'fm_spin',.5);for(const x of aux)if(x.type==='fm_orb'&&x.owner===u)x.t=0;
  aux.push({type:'fm_orb',x:u.x,y:u.y,r:52,t:3,m:3,team:u.team,owner:u,ui:fmI(u),n:4,k:.5});jx({jfx:'fm_burst',x:u.x,y:u.y,r:60,t:.35,m:.35})}),
 fm_ansatsu:SP('Assassinat de l\'ombre',FM_D.ansatsu,12,{hero:'ventress',line:{len:380,w:30},ai:{mode:'gap',min:70,max:380,p:.55}},(u,a,td)=>{const e=pick(u,a,td||300,380);
  anim(u,'fm_seal',.4);fmS('poof',u);jx({jfx:'fm_vanish',x:u.x,y:u.y,r:34,t:.5,m:.5});
  if(!e||dist(u,e)>420){const p=fwd(u,a,Math.min(td||200,200));u.x=p.x;u.y=p.y;collide(u);jx({jfx:'fm_vanish',x:u.x,y:u.y,r:26,t:.4,m:.4,inv:1});return}
  u.phase=Math.max(u.phase||0,.42);u.stealth=Math.max(u.stealth,.42);u.dash=null;jx({jfx:'fm_shade',x:e.x,y:e.y,ti:fmI(e),t:.4,m:.4});say(e,'!','#ff6a7a');
  later(u,.38,()=>{u.phase=0;u.stealth=0;if(u.dead||e.dead||u.stun>0||dist(u,e)>560)return;fmStrike(u,e,22,{slow:.8})})}),
 fm_maki:SP('Makibishi',FM_D.maki,7,{tele:{r:75,max:380},ai:RG(300,.4)},(u,a,td)=>{const p=atP(u,a,td,380);anim(u,'fm_flickl',.3);fmS('saber',u);
  field(u,p.x,p.y,{r:75,t:4,dps:3,slow:1,col:'#8a8e9a',vfx:'fm_maki'});aux.push({type:'fm_maki',x:p.x,y:p.y,r:75,t:4,m:4,team:u.team,owner:u,a:Math.atan2(u.y-p.y,u.x-p.x),len:Math.hypot(u.x-p.x,u.y-p.y),k:0})}),
 fm_shun:SP('Shunshin de l\'ombre',FM_D.shun,9,{ai:{mode:'esc',max:150,p:.5}},(u,a,td)=>{const p=fwd(u,a,clamp(td||260,80,260)),p0={x:u.x,y:u.y};fmS('poof',u);anim(u,'fm_seal',.3);
  jx({jfx:'fm_vanish',x:u.x,y:u.y,r:40,t:.55,m:.55});u.dash=null;u.kx=u.ky=0;u.x=p.x;u.y=p.y;collide(u);u.stealth=Math.max(u.stealth,1.2);u.haste=Math.max(u.haste,.6);
  jx({jfx:'fm_streak',x:p0.x,y:p0.y,x2:u.x,y2:u.y,t:.3,m:.3});jx({jfx:'fm_vanish',x:u.x,y:u.y,r:30,t:.45,m:.45,inv:1})}),
 fm_repli:SP('Repli du Fûma',FM_D.repli,7,{ai:{max:170,p:.55}},(u,a)=>{S('dash',u);S('blaster',u);anim(u,'backflip',.36);dash(u,a+Math.PI,190,.32,{jump:46});
  for(const o of[-.22,0,.22])fmShu(u,a+o,{spd:880,r:5,dmg:5,life:.5,o:{fm_sh:1,fm_nc:1}});jx({jfx:'fm_glint',x:u.x,y:u.y,a,t:.25,m:.25,fan:1})}),
 // Pluie : 5 vagues (objet aux) puis la dernière = explosion de la zone (le cercle d'alerte montre quand elle tombe ; les bots la fuient)
 fm_rain:ULT('Pluie de shuriken',FM_D.rain,{tele:{r:140,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'fm_rainup',.6);fmS('saber',u);S('dash',u);
  aux.push({type:'fm_rain',x:p.x,y:p.y,r:140,t:2,m:2,team:u.team,owner:u,n:0,k:.6});zone(u,p.x,p.y,140,10,1.6,{stun:.5},'#c8ccd8');lastZ().deto='fm_rainz';
  jx({jfx:'fm_up',x:u.x,y:u.y,t:.7,m:.7})}),
 fm_dance:ULT('Danse des mille ombres',FM_D.dance,{hero:'ventress',tele:{self:1,r:400},ai:SELF(330,.8)},(u)=>{anim(u,'fm_seal',.35);fmS('poof',u);S('dash',u);
  jx({jfx:'fm_vanish',x:u.x,y:u.y,r:50,t:.6,m:.6});u.phase=Math.max(u.phase||0,.5);u.stealth=Math.max(u.stealth,.5);
  aux.push({type:'fm_dance',x:u.x,y:u.y,r:400,t:2,m:2,team:u.team,owner:u,ui:fmI(u),n:0,k:.22,tg:null,hs:[]});fmDancePick(aux[aux.length-1])}),
});
Object.assign(NATHERO,{fm:'kylo'});
// prochaine cible de la Danse (marquée par le lanceur d'abord, puis pas encore frappée, puis la plus proche)
function fmDancePick(x){const o=x.owner;let b=null,bs=-1e9;for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d>x.r+e.r)continue;
 const s=(fmMarkOf(e,o)?1000:0)+(x.hs.includes(e)?0:500)-d;if(s>bs){bs=s;b=e}}x.tg=b;if(b)jx({jfx:'fm_shade',x:b.x,y:b.y,ti:fmI(b),t:.28,m:.28});return b}
// ---------- logique des objets (hôte) ----------
AUXF.fm_mark=x=>{const e=x.tg;if(!e||e.dead||!x.owner||x.owner.dead){x.t=0;return}x.x=e.x;x.y=e.y};
AUXF.fm_boom=(x,dt)=>{const p=x.p;if(!p||p.dead||p.life<=0){x.t=0;x.p=null;return}x.x=p.x;x.y=p.y;x.t=1;
 if(!p.back){const c=Math.atan2(p.vy,p.vx)+x.cv*dt,s=Math.hypot(p.vx,p.vy);p.vx=Math.cos(c)*s;p.vy=Math.sin(c)*s}};
AUXF.fm_wl=x=>{const p=x.p;if(!p||p.dead||p.life<=0||(x.owner&&x.owner.dead)){x.t=0;x.p=null;return}x.x=p.x;x.y=p.y;x.t=1};
AUXF.fm_bind=x=>{const e=x.tg;if(!e||e.dead){x.t=0;return}x.x=e.x;x.y=e.y};
AUXF.fm_kg=(x,dt)=>{const o=x.owner,p2=x.p2;if(!p2||p2.dead||p2.life<=0){x.t=0;x.p1=x.p2=null;return}x.x=p2.x;x.y=p2.y;x.t=1;const p1=x.p1;
 // le 1er a touché : l'ombre reste cachée (x.n=2) ; il a été esquivé, détruit ou est arrivé au bout : elle surgit (x.n=1) et cherche l'ennemi proche
 if(!x.n&&(!p1||p1.dead||p1.life<=0)){x.n=p1&&p1.fm_hit?2:1;if(x.n===1){p2.kind='fm_kage2';p2.life=Math.max(p2.life,.35);jx({jfx:'fm_emerge',x:p2.x,y:p2.y,t:.35,m:.35});if(near(p2.x,p2.y))fmS('saber',o)}}
 if(x.n===1&&o){let tg=null,bd=300;for(const e of enemies(o)){const d=Math.hypot(e.x-p2.x,e.y-p2.y);if(d<bd){bd=d;tg=e}}
  if(tg){const cur=Math.atan2(p2.vy,p2.vx);let df=Math.atan2(tg.y-p2.y,tg.x-p2.x)-cur;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;const na=cur+clamp(df,-3.2*dt,3.2*dt),sp=Math.hypot(p2.vx,p2.vy);p2.vx=Math.cos(na)*sp;p2.vy=Math.sin(na)*sp}}};
AUXF.fm_orb=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}x.x=o.x;x.y=o.y;
 if(x.n>0)for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team)continue;if(Math.abs(p.x-x.x)>x.r+p.r||Math.hypot(p.x-x.x,p.y-x.y)>x.r+p.r)continue;
  p.life=0;p.dead=1;p.boom=1;x.n--;if(near(p.x,p.y)){sparks(p.x,p.y,FM_STEEL,7,'kunai');fmS('deflect',o)}jx({jfx:'fm_burst',x:p.x,y:p.y,r:22,t:.25,m:.25});if(x.n<=0){x.t=0;break}}
 if(x.k<=0&&x.n>0){x.k=.5;const V=VFX;VFX='shuriken';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r+6)hit(e,o,5,{fm_sh:1,fm_nc:1,unblockable:1});VFX=V}
 if(x.t<=0&&x.n>0&&!x.done){x.done=1;const L=enemies(o).filter(e=>dist(o,e)<480).sort((a,b)=>dist(o,a)-dist(o,b));
  for(let i=0;i<x.n;i++){const e=L[i%Math.max(1,L.length)],j=Math.floor(i/Math.max(1,L.length)),b=e?ang(o,e)+(j?(j%2?1:-1)*Math.ceil(j/2)*.13:0):i*Math.PI/2;fmShu(o,b,{x:o.x+Math.cos(b)*30,y:o.y+Math.sin(b)*30,spd:900,r:6,dmg:6,life:.55,vfx:'shuriken',basic:false,ex:false,o:{fm_sh:1,fm_nc:1}})}
  if(near(o.x,o.y))S('blaster',o)}};
AUXF.fm_maki=()=>{};
AUXF.fm_rain=x=>{const o=x.owner;if(!o||o.dead){x.t=Math.min(x.t,.3);return}if(x.n>=5||x.k>0)return;x.n++;x.k=.2;
 const V=VFX;VFX='shuriken';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)hit(e,o,7,{slow:.5,fm_sh:1,fm_nc:1,unblockable:1,fx:x.x,fy:x.y});VFX=V;
 if(near(x.x,x.y)){fmS(x.n%2?'saber':'hit',o);sparks(x.x+(rnd()-.5)*x.r,x.y+(rnd()-.5)*x.r*.8,FM_STEEL,6,'kunai')}};
// Danse : une frappe toutes les 0,28 s, la cible suivante est montrée par une ombre juste avant
AUXF.fm_dance=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}if(x.n>=3){x.t=0;return}o.phase=Math.max(o.phase||0,.12);o.stealth=Math.max(o.stealth,.12);
 if(x.k>0)return;const e=x.tg;if(e&&!e.dead&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+120){fmStrike(o,e,9,{slow:.4});x.hs.push(e)}x.n++;x.k=.28;
 if(x.n>=3||!fmDancePick(x)){x.n=3;x.t=0;o.phase=0;o.stealth=0;jx({jfx:'fm_vanish',x:o.x,y:o.y,r:40,t:.5,m:.5,inv:1})}};
DETO.fm_rainz=(x,y,r)=>{jx({jfx:'fm_impact',x,y,r,t:.7,m:.7})};
// ---------- dessins ----------
// shuriken à 4 branches (repère local, déjà tourné), L = rayon
function fmStar(L,fill,edge,hole){g.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;g.lineTo(Math.cos(a)*L,Math.sin(a)*L);g.lineTo(Math.cos(a+.785)*L*.3,Math.sin(a+.785)*L*.3)}g.closePath();
 g.fillStyle=fill;g.fill();g.strokeStyle=edge||OUT;g.lineWidth=Math.max(1,L*.13);g.stroke();g.fillStyle=hole||OUT;g.beginPath();g.arc(0,0,L*.17,0,7);g.fill()}
// grand Fûma à 4 lames courbes (repère local), L = rayon
function fmFuma(L,t,al){g.save();g.globalAlpha*=al==null?1:al;g.fillStyle=rgba('#e8ecf4',.16);g.beginPath();g.arc(0,0,L*1.05,0,7);g.fill();g.rotate(t);
 for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(-L*.16,-L*.12);g.quadraticCurveTo(L*.45,-L*.36,L,-L*.02);g.quadraticCurveTo(L*.62,L*.04,L*.5,L*.16);g.quadraticCurveTo(L*.3,L*.1,L*.12,L*.2);g.closePath();
  g.fillStyle='#b8bfcc';g.fill();g.strokeStyle='#22232c';g.lineWidth=Math.max(1.2,L*.07);g.stroke();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=Math.max(.8,L*.035);g.beginPath();g.moveTo(L*.12,-L*.16);g.quadraticCurveTo(L*.5,-L*.3,L*.9,-L*.05);g.stroke()}
 g.fillStyle='#8a1a2a';g.strokeStyle='#22232c';g.lineWidth=Math.max(1,L*.06);g.beginPath();g.arc(0,0,L*.26,0,7);g.fill();g.stroke();g.fillStyle='#22232c';g.beginPath();g.arc(0,0,L*.1,0,7);g.fill();g.restore()}
PROJD.fm_shu=(p,R,ra,t)=>{g.save();g.rotate(ra);g.strokeStyle=rgba(FM_RED,.55);g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(-R*1.2,0);g.quadraticCurveTo(-R*2.6,Math.sin(t/50)*R*.8,-R*4,0);g.stroke();g.restore();
 g.scale(1,.62);g.rotate(t/34);fmStar(R*1.6,FM_STEEL,'#23232c',FM_RED)};
PROJD.fm_trace=(p,R,ra,t)=>{g.save();g.rotate(ra);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(FM_RED,.7);g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(-R,0);g.lineTo(-R*7,0);g.stroke();g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;g.stroke();g.restore();
 g.scale(1,.62);g.rotate(t/26);fmStar(R*1.5,'#f2f4f8',FM_RED,FM_RED)};
PROJD.fm_big=(p,R,ra,t)=>{g.scale(1,.6);fmFuma(R*1.9,t/40)};
// Kage shuriken caché : à peine une ombre (il voyage juste derrière le 1er)
PROJD.fm_kage=(p,R,ra,t)=>{g.save();g.globalAlpha=.22;g.scale(1,.62);g.rotate(t/34);fmStar(R*1.5,'#14121a','#14121a','#14121a');g.restore()};
// l'ombre surgit : shuriken noir et violet, volutes d'ombre
PROJD.fm_kage2=(p,R,ra,t)=>{g.save();g.rotate(ra);for(let i=0;i<3;i++){const y=(i-1)*R*.7;g.strokeStyle=rgba(i===1?'#8a5ac8':FM_SHD,.6);g.lineWidth=2;g.beginPath();g.moveTo(-R,y);g.quadraticCurveTo(-R*2.5,y+Math.sin(t/60+i)*R,-R*4.2,y*.4);g.stroke()}g.restore();
 g.scale(1,.62);g.rotate(t/30);fmStar(R*1.6,'#2c2436','#b070ff',FM_RED)};
PROJD.fm_wire=(p,R,ra,t)=>{g.scale(1,.62);g.rotate(t/30);fmStar(R*1.5,FM_STEEL,'#23232c');g.strokeStyle='#e8ecf4';g.lineWidth=1.4;g.beginPath();g.arc(0,0,R*.55,0,7);g.stroke()};
// fil de chakra entre la main du lanceur et le shuriken (légère courbe)
function fmWire(ax,ay,az,bx,by,bz,sag,al){const a=P(ax,ay,az),b=P(bx,by,bz),mx=(a.x+b.x)/2,my=(a.y+b.y)/2+sag;g.save();g.lineCap='round';
 g.strokeStyle=rgba('#1a1820',.5*al);g.lineWidth=2.6;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo(mx,my,b.x,b.y);g.stroke();g.strokeStyle=rgba('#e8f2ff',.9*al);g.lineWidth=1.1;g.stroke();g.restore()}
AUXD.fm_wl=(x,k,t)=>{const o=units[x.ui];if(!o||o.dead)return;fmWire(o.x,o.y,32,x.x,x.y,28,4,1)};
// ligoté : fil tendu jusqu'au lanceur (les spires autour de la cible sont dans STATD, par-dessus le modèle 3D)
AUXD.fm_bind=(x,k,t)=>{const e=units[x.ti],o=units[x.ui];if(!e||e.dead)return;const al=Math.min(1,x.t/.25);if(o&&!o.dead&&dist(o,e)<520)fmWire(o.x,o.y,32,e.x,e.y,30,2,al*.8)};
// spires de fil autour du corps (p = pieds à l'écran, H = hauteur de la tête)
function fmBindDraw(x,p,S,H,t){const al=Math.min(1,x.t/.25);g.save();g.lineCap='round';for(let i=0;i<4;i++){const y=p.y-H*(.13+i*.115),rx=(17-i*1.2)*S,ry=5*S,a0=t*6+i*1.7;
  g.strokeStyle=rgba('#14121a',.7*al);g.lineWidth=3.6*S;g.beginPath();g.ellipse(p.x,y,rx,ry,-.18,0,7);g.stroke();
  g.strokeStyle=rgba('#f2f8ff',al);g.lineWidth=1.6*S;g.beginPath();g.ellipse(p.x,y,rx,ry,-.18,a0,a0+4.4);g.stroke()}g.restore()}
// 4 shuriken en orbite (ceux qui restent)
AUXD.fm_orb=(x,k,t)=>{const o=units[x.ui],c=o&&!o.dead?o:x,n=x.n|0;if(n<=0)return;const al=Math.min(1,x.t/.3);g.save();
 g.strokeStyle=rgba(FM_STEEL,.25*al);g.lineWidth=1.5;g.setLineDash([4,7]);g.lineDashOffset=-t*40;gEll(c.x,c.y,x.r);g.stroke();g.setLineDash([]);
 for(let i=0;i<n;i++){const b=t*5.2+i*Math.PI*2/Math.max(1,n),q=P(c.x+Math.cos(b)*x.r,c.y+Math.sin(b)*x.r,26+Math.sin(b*2)*4);g.strokeStyle=rgba('#ffffff',.35*al);g.lineWidth=2*q.s;g.beginPath();
  const pq=P(c.x+Math.cos(b-.45)*x.r,c.y+Math.sin(b-.45)*x.r,26);g.moveTo(pq.x,pq.y);g.lineTo(q.x,q.y);g.stroke();g.save();g.translate(q.x,q.y);g.scale(q.s,q.s*.62);g.globalAlpha=al;g.rotate(t*22+i);fmStar(9,FM_STEEL,'#23232c',FM_RED);g.restore()}g.restore()};
// chausse-trapes (lancées depuis le lanceur, puis éparpillées)
AUXD.fm_maki=(x,k,t)=>{const e=Math.min(1,(x.m-x.t)/.28),al=Math.min(1,x.t/.5),ca=Math.cos(x.a||0),sa=Math.sin(x.a||0),L=(x.len||0)*(1-e);g.save();g.lineJoin='round';
 for(let i=0;i<16;i++){const b=fm_h(i+x.x)*6.283,d=x.r*(.15+.8*Math.sqrt(fm_h(i*3+x.y))),wx=x.x+Math.cos(b)*d*e+ca*L,wy=x.y+Math.sin(b)*d*e+sa*L,q=P(wx,wy,e<1?Math.sin(Math.PI*e)*40:2),s=q.s*(3.2+fm_h(i)*1.4);
  g.globalAlpha=al;g.fillStyle=i%3?'#7a7e8a':'#a8acb8';g.strokeStyle='#18181e';g.lineWidth=1;g.beginPath();g.moveTo(q.x,q.y-s*1.4);g.lineTo(q.x+s,q.y+s*.4);g.lineTo(q.x-s,q.y+s*.4);g.closePath();g.fill();g.stroke();
  if(e>=1&&((t*1.3+fm_h(i*7))%1)<.06){g.fillStyle='#ffffff';g.beginPath();g.arc(q.x,q.y-s*1.4,1.6*q.s,0,7);g.fill()}}g.restore()};
// pluie : shuriken qui tombent du ciel sur toute la zone pendant les vagues ; shuriken plantés au sol
AUXD.fm_rain=(x,k,t)=>{const el=x.m-x.t,on=el>.55,al=Math.min(1,x.t/.35);g.save();
 g.strokeStyle=rgba(FM_RED,.6*al);g.lineWidth=2;g.setLineDash([10,7]);g.lineDashOffset=t*30;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 const nPl=on?Math.min(22,Math.floor((el-.55)*18)):0;for(let i=0;i<nPl;i++){const b=fm_h(i*5+1)*6.283,d=x.r*Math.sqrt(fm_h(i*5+2)),q=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.92,1);
  g.save();g.globalAlpha=al;g.translate(q.x,q.y);g.scale(q.s,q.s);g.rotate(fm_h(i)*3);g.fillStyle='#9aa0ac';g.strokeStyle='#18181e';g.lineWidth=1;g.beginPath();g.moveTo(0,-7);g.lineTo(2,-1);g.lineTo(7,0);g.lineTo(2,1);g.lineTo(0,3);g.lineTo(-2,1);g.lineTo(-7,0);g.lineTo(-2,-1);g.closePath();g.fill();g.stroke();g.restore()}
 if(el>.25&&el<1.7)for(let i=0;i<26;i++){const ph=(t*2.6+fm_h(i*11))%1,b=fm_h(i*11+3)*6.283,d=x.r*Math.sqrt(fm_h(i*11+4)),wx=x.x+Math.cos(b)*d,wy=x.y+Math.sin(b)*d*.92,z=(1-ph)*300,q=P(wx,wy,z),qt=P(wx,wy,z+46);
  if(!on&&z<160)continue;g.strokeStyle=rgba('#ffffff',.35*al);g.lineWidth=1.5;g.beginPath();g.moveTo(qt.x,qt.y);g.lineTo(q.x,q.y);g.stroke();
  g.save();g.translate(q.x,q.y);g.scale(q.s,q.s*.62);g.rotate(t*24+i);g.globalAlpha=al;fmStar(7,FM_STEEL,'#23232c');g.restore();
  if(on&&ph>.9){const qg=P(wx,wy,0);g.strokeStyle=rgba('#ffffff',.7*al);g.lineWidth=1.2;g.beginPath();g.ellipse(qg.x,qg.y,7*qg.s,3*qg.s,0,0,7);g.stroke()}}
 g.restore()};
// marque au sol : réticule rouge qui tourne autour de la cible (clignote en fin de marque)
AUXD.fm_mark=(x,k,t)=>{const e=units[x.ti];if(!e||e.dead||x.t<=0)return;const al=Math.min(1,x.t/.4)*(x.t<1?.55+.45*Math.sin(t*22):1);g.save();
 g.strokeStyle=rgba(FM_RED,.85*al);g.lineWidth=2;g.setLineDash([9,6]);g.lineDashOffset=-t*30;gEll(e.x,e.y,30);g.stroke();g.setLineDash([]);g.fillStyle=rgba(FM_RED,.9*al);
 for(let i=0;i<4;i++){const b=t*1.4+i*1.5708,c=Math.cos(b),s=Math.sin(b),q1=P(e.x+c*44,e.y+s*44),q2=P(e.x+c*34+s*-6,e.y+s*34+c*6),q3=P(e.x+c*34-s*-6,e.y+s*34-c*6);
  g.beginPath();g.moveTo(q1.x,q1.y);g.lineTo(q2.x,q2.y);g.lineTo(q3.x,q3.y);g.closePath();g.fill()}g.restore()};
// critique : double entaille rouge en croix, gerbe d'éclats ; mortel = plus grand, doré
JFXD.fm_crit=(f,k,e)=>{const q=P(f.x,f.y,40),s=q.s*(f.big?1.4:1),L=34*s*Math.min(1,e*7),c1=f.big?'#ffd040':FM_RED;g.save();g.translate(q.x,q.y);g.globalCompositeOperation='lighter';
 g.fillStyle=rgba(c1,.35*k);g.beginPath();g.arc(0,0,(18+e*26)*s,0,7);g.fill();g.rotate(f.a||0);g.lineCap='round';
 for(const [w,c] of[[8,rgba(c1,.85*k)],[2.6,rgba('#ffffff',k)]]){g.strokeStyle=c;g.lineWidth=w*s;g.beginPath();g.moveTo(-L,-L*.55);g.lineTo(L,L*.55);g.moveTo(-L,L*.55);g.lineTo(L,-L*.55);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=1.5*s;g.beginPath();for(let i=0;i<10;i++){const b=i*.628+.3,r0=(14+e*20)*s,r1=r0+(10+(i%3)*7)*s*(1-e*.5);g.moveTo(Math.cos(b)*r0,Math.sin(b)*r0);g.lineTo(Math.cos(b)*r1,Math.sin(b)*r1)}g.stroke();
 if(f.big){g.strokeStyle=rgba(FM_RED,.8*k);g.lineWidth=3*s;g.beginPath();g.arc(0,0,(26+e*30)*s,0,7);g.stroke()}g.restore()};
// apparition de la marque : petit éclat rouge
JFXD.fm_mkfx=(f,k,e,t,u,tg)=>{const c=tg&&!tg.dead?tg:f,q=P(c.x,c.y,60),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(FM_RED,.9*k);g.lineWidth=2.5;g.beginPath();g.arc(q.x,q.y,(6+e*22)*s,0,7);g.stroke();
 g.translate(q.x,q.y);g.rotate(e*4);g.scale(s,s*.8);g.globalAlpha=k;fmStar(9*(1-e*.3),FM_RED,'#ffffff','#ffffff');g.restore()};
// fumée noire et violette (disparition / apparition), plumes d'ombre qui montent
JFXD.fm_vanish=(f,k,e)=>{const q=P(f.x,f.y,20),R=(f.r||34)*q.s;g.save();
 for(let i=0;i<9;i++){const b=i*.698+f.x*.01,d=R*(.2+e*.8)*(f.inv?1-e*.5:1),r=R*(.35+e*.3)*(i%2?.8:1);g.fillStyle=rgba(i%3?'#1c1822':'#3a2a4a',.7*k);g.beginPath();g.arc(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.55-e*18*q.s,r,0,7);g.fill()}
 g.strokeStyle=rgba('#8a5ac8',.6*k);g.lineWidth=1.6;g.lineCap='round';g.beginPath();for(let i=0;i<6;i++){const x0=q.x+(fm_h(i+f.y)-.5)*R*1.6,y0=q.y-e*40*q.s-fm_h(i)*20*q.s;g.moveTo(x0,y0);g.quadraticCurveTo(x0+6*q.s,y0-8*q.s,x0+1*q.s,y0-16*q.s)}g.stroke();g.restore()};
// traînée d'ombre entre deux points (Shunshin, frappes dans le dos)
JFXD.fm_streak=(f,k,e)=>{const a=P(f.x,f.y,28),b=P(f.x2,f.y2,28);g.save();g.lineCap='round';g.strokeStyle=rgba('#1c1822',.55*k);g.lineWidth=16*a.s*k;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
 g.strokeStyle=rgba('#8a5ac8',.6*k);g.lineWidth=3*a.s;g.stroke();g.restore()};
// ombre qui se glisse derrière la cible (alerte avant une frappe dans le dos)
JFXD.fm_shade=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const b=(tg.aim||0)+Math.PI,q=P(tg.x+Math.cos(b)*26,tg.y+Math.sin(b)*26,0),s=q.s,g1=Math.min(1,e*2.5);g.save();
 g.fillStyle=rgba('#0c0a10',.65*Math.min(1,k*3));g.beginPath();g.ellipse(q.x,q.y,22*s*g1,8*s*g1,0,0,7);g.fill();
 const ez=P(tg.x+Math.cos(b)*26,tg.y+Math.sin(b)*26,10+e*34);g.fillStyle=rgba(FM_RED,Math.min(1,k*3));for(const sx of[-1,1]){g.beginPath();g.ellipse(ez.x+sx*4*s,ez.y,3*s,1.4*s,sx*.3,0,7);g.fill()}
 g.strokeStyle=rgba(FM_RED,.8*k);g.lineWidth=2;gEll(tg.x,tg.y,(46-e*18));g.stroke();g.restore()};
// entaille du tantô
JFXD.fm_slash=(f,k,e)=>{const q=P(f.x,f.y,34),s=q.s;g.save();g.translate(q.x,q.y);g.rotate((f.a||0)+.5);g.lineCap='round';const a0=-1.2+e*.3,a1=a0+Math.min(1,e*5)*2.2;
 for(const [w,c] of[[7,rgba('#3a2a4a',.7*k)],[2.4,rgba('#ffffff',k)]]){g.strokeStyle=c;g.lineWidth=w*s;g.beginPath();g.arc(0,0,26*s,a0,a1);g.stroke()}g.restore()};
// éclat au lancer (Traceur, Repli)
JFXD.fm_glint=(f,k,e)=>{const p=fwd(f,f.a||0,26),q=P(p.x,p.y,34),s=q.s;g.save();g.translate(q.x,q.y);g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.9*k);g.beginPath();
 for(let i=0;i<8;i++){const b=i*.785,L=i%2?3*s:(10+e*10)*s*(f.fan?1.4:1);g.lineTo(Math.cos(b)*L,Math.sin(b)*L*.7)}g.closePath();g.fill();g.restore()};
// gerbe d'acier (Tournoyants, tir détruit)
JFXD.fm_burst=(f,k,e)=>{g.save();g.strokeStyle=rgba(FM_STEEL,.8*k);g.lineWidth=2.5;gEll(f.x,f.y,(f.r||40)*(.4+e*.8));g.stroke();const q=P(f.x,f.y,26);g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=1.4;g.beginPath();
 for(let i=0;i<8;i++){const b=i*.785+.2,r0=(f.r||40)*.3*q.s,r1=(f.r||40)*(.5+e*.6)*q.s;g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.6);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*.6)}g.stroke();g.restore()};
// le Kage shuriken sort de l'ombre
JFXD.fm_emerge=(f,k,e)=>{const q=P(f.x,f.y,28),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#b070ff',.9*k);g.lineWidth=2.5;g.beginPath();g.arc(q.x,q.y,(6+e*24)*s,0,7);g.stroke();
 g.fillStyle=rgba('#8a5ac8',.5*k);g.beginPath();g.arc(q.x,q.y,(10+e*10)*s,0,7);g.fill();g.restore()};
// pluie : les shuriken montent au ciel depuis le lanceur
JFXD.fm_up=(f,k,e)=>{g.save();for(let i=0;i<10;i++){const ox=(fm_h(i)-.5)*40,z=20+e*(220+fm_h(i+5)*120),q=P(f.x+ox,f.y+(fm_h(i+9)-.5)*20,z),qb=P(f.x+ox,f.y,Math.max(20,z-50));g.strokeStyle=rgba('#ffffff',.5*k);g.lineWidth=1.5;g.beginPath();g.moveTo(qb.x,qb.y);g.lineTo(q.x,q.y);g.stroke();
 g.save();g.translate(q.x,q.y);g.scale(q.s,q.s*.62);g.rotate(e*30+i);g.globalAlpha=k;fmStar(7,FM_STEEL,'#23232c');g.restore()}g.restore()};
// dernière vague de la pluie : impact au sol
JFXD.fm_impact=(f,k,e)=>{const R=f.r||140;g.save();g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=5*k+1;gEll(f.x,f.y,R*(.6+e*.5));g.stroke();g.strokeStyle=rgba(FM_RED,.6*k);g.lineWidth=2;gEll(f.x,f.y,R*(.3+e*.7));g.stroke();
 for(let i=0;i<14;i++){const b=fm_h(i*3)*6.283,d=R*Math.sqrt(fm_h(i*3+1)),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,4+e*30*fm_h(i));g.fillStyle=rgba('#e8ecf4',.8*k);g.beginPath();g.arc(q.x,q.y,(2+fm_h(i+2)*2)*q.s,0,7);g.fill()}g.restore()};
// ---------- états visibles ----------
STATD.push((u,p,S,sk)=>{const i=fmI(u),t=performance.now()/1000;
 for(const x of aux)if(x.type==='fm_bind'&&x.ti===i&&x.t>0){fmBindDraw(x,p,S,92*S*sk,t);break}
 // marque : shuriken rouge qui tourne au-dessus de la tête, avec le temps restant
 for(const x of aux)if(x.type==='fm_mark'&&x.ti===i&&x.t>0){const al=Math.min(1,x.t/.4)*(x.t<1?.55+.45*Math.sin(t*22):1),y=p.y-92*S*sk;g.save();g.globalAlpha=al;
  g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=4*S;g.beginPath();g.arc(p.x,y,11*S,0,7);g.stroke();g.strokeStyle=FM_RED;g.lineWidth=2.4*S;g.beginPath();g.arc(p.x,y,11*S,-Math.PI/2,-Math.PI/2+6.283*Math.max(0,x.t/x.m));g.stroke();
  g.translate(p.x,y);g.rotate(t*3);g.scale(S,S);fmStar(8,FM_RED,'#ffffff','#ffffff');g.restore();break}
 // pour le joueur Fûma : un ennemi qui lui tourne le dos (coup critique possible) est souligné d'un croissant rouge
 const pl=player;if(pl&&pl!==u&&!pl.dead&&pl.ch&&pl.ch.clan===17&&u.team!==pl.team&&!(pl.fm_bcd>0)&&fmBehind(u,pl)){const b=ang(u,pl);g.save();g.strokeStyle=rgba(FM_RED,.55+.3*Math.sin(t*10));g.lineWidth=3;g.lineCap='round';g.beginPath();
  for(let j=0;j<=8;j++){const c=b+(j/8-.5)*1.3,q=P(u.x+Math.cos(c)*30,u.y+Math.sin(c)*30);j?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke();
  const q=P(u.x+Math.cos(b)*42,u.y+Math.sin(b)*42),qa=P(u.x+Math.cos(b)*50+Math.cos(b+1.57)*6,u.y+Math.sin(b)*50+Math.sin(b+1.57)*6),qb=P(u.x+Math.cos(b)*50-Math.cos(b+1.57)*6,u.y+Math.sin(b)*50-Math.sin(b+1.57)*6);
  g.fillStyle=rgba(FM_RED,.7);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(qa.x,qa.y);g.lineTo(qb.x,qb.y);g.closePath();g.fill();g.restore()}});
// ---------- trait de clan ----------
TRAITS[17]={nom:'Marque de l\'assassin',desc:'Tes shuriken marquent la cible 4 s. Ton prochain jutsu sur une cible marquée, ou un coup porté dans son dos (au plus toutes les 2,5 s), est critique : +40 % (+60 % si les deux). Sortir de l\'invisibilité compte aussi comme un critique.',
 init(u){u.fm_bcd=0},
 update(u,dt){if(u.fm_bcd>0)u.fm_bcd=Math.max(0,u.fm_bcd-dt)},
 deal(src,t,dmg,o){if(t===src||t.team===src.team)return dmg;dmg*=FM_BAL;if(o.silent||o.thorn)return dmg;
  const mk=o.basic||o.fm_nc?null:fmMarkOf(t,src);let c=0;if(mk){mk.t=0;c++}
  if(!o.fm_nc&&(o.fm_back||(!(src.fm_bcd>0)&&fmBehind(t,src)))){c++;src.fm_bcd=FM_BCD}
  if(src.ambush>0&&!o.fm_nc){src.ambush=0;if(!c)c=1} // l'embuscade (sortie d'invisibilité) devient un critique (pas de cumul)
  if(c){dmg*=c>1?FM_CRIT2:FM_CRIT;fmCrit(src,t,c>1)}
  if(o.fm_sh&&!mk)fmMark(src,t,o.fm_md||FM_MK);return dmg},
 hud(u,x,y){const yy=y-16,w=118,cd=Math.max(0,u.fm_bcd||0),rd=cd<=0,i=fmI(u);let n=0;for(const a of aux)if(a.type==='fm_mark'&&a.ui===i&&a.t>0)n++;
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,yy,w+2,7);g.fillStyle=rd?FM_RED:'#7a3a44';g.fillRect(x+1,yy+1,w*(rd?1:Math.max(0,1-cd/FM_BCD)),5);
  g.save();g.translate(x+w+12,yy+3.5);g.rotate(performance.now()/400);fmStar(6,n?FM_RED:FM_STEEL,'#ffffff');g.restore();
  text((rd?'Dans le dos : prêt':'Dans le dos')+(n?' · '+n+' marqué'+(n>1?'s':''):''),x+w+24,yy+7,11,'#f0c8cc','left','normal')}};
// apparence : le grand Fûma shuriken dans le dos (si aucun objet n'est choisi)
CLOOK[17]=(look,l)=>{if(!(l.d|0)&&!look.gourd)look.back='fuma'};
// ---------- poses 3D ----------
const fmH=(e,a,b)=>e<a?ezo(e/a):e<b?1:1-ezio((e-b)/(1-b))*.85;
Object.assign(ANIM,{
 // lancer de revers, bras droit puis gauche
 fm_flickr:(P,e)=>{const k=fmH(e,.22,.45);pz(P,'armR',-1.25-.35*k,0,lerp(.85,-.45,k));pz(P,'foreR',lerp(-1.7,-.1,k));pz(P,'handR',-.5*k);pz(P,'chest',.1,lerp(.45,-.35,k));pz(P,'armL',-.5,0,.35);pz(P,'foreL',-1.1)},
 fm_flickl:(P,e)=>{const k=fmH(e,.22,.45);pz(P,'armL',-1.25-.35*k,0,lerp(-.85,.45,k));pz(P,'foreL',lerp(-1.7,-.1,k));pz(P,'handL',-.5*k);pz(P,'chest',.1,lerp(-.45,.35,k));pz(P,'armR',-.5,0,-.35);pz(P,'foreR',-1.1)},
 // grand lancer du Fûma : armé derrière la tête en se tordant, puis tout le corps s'ouvre
 fm_heave:(P,e)=>{const up=e<.4,k=up?ezo(e/.4):ezo(Math.min(1,(e-.4)/.3));if(up){P.rootR.y=.6*k;pz(P,'armR',-3*k,0,-.3*k);pz(P,'foreR',-1.2*k);pz(P,'armL',-1.4*k,0,.4);pz(P,'chest',-.3*k,.4*k)}
  else{P.rootR.y=lerp(.6,-.45,k);pz(P,'armR',lerp(-3,-1.3,k),0,lerp(-.3,.2,k));pz(P,'foreR',lerp(-1.2,-.05,k));pz(P,'armL',lerp(-1.4,-.4,k),0,.5);pz(P,'chest',lerp(-.3,.45,k),lerp(.4,-.3,k));pz(P,'thighL',-.6*k);pz(P,'shinL',.4*k);pz(P,'thighR',.4*k);P.root.z=6*k}},
 // mudra de disparition : mains jointes, accroupi
 fm_seal:(P,e)=>{const k=Math.min(1,e/.25);P.root.y=-5*k;pz(P,'chest',.25*k);pz(P,'head',.15*k);pz(P,'armL',-1.15,0,-.5*k);pz(P,'foreL',-1.55);pz(P,'armR',-1.15,0,.5*k);pz(P,'foreR',-1.55);pz(P,'thighL',-.6*k);pz(P,'shinL',1*k);pz(P,'thighR',-.2*k);pz(P,'shinR',.9*k)},
 // coup de tantô en prise inversée, plongé dans le dos
 fm_stab:(P,e)=>{const k=fmH(e,.25,.55);pz(P,'armR',lerp(-2.7,-1.05,k),0,-.15);pz(P,'foreR',lerp(-.9,-.15,k));pz(P,'handR',1.6);pz(P,'armL',-.9,0,.6);pz(P,'foreL',-.6);pz(P,'chest',.5*k,-.2*k);P.root.z=8*k;P.root.y=-4*k;pz(P,'thighL',-.8*k);pz(P,'shinL',.9*k);pz(P,'thighR',.5*k);pz(P,'shinR',.6*k)},
 // pluie : petit saut, les deux bras jettent les shuriken vers le ciel
 fm_rainup:(P,e)=>{const k=fmH(e,.3,.6);P.root.y=10*bump(e);pz(P,'armL',lerp(-.6,-3.05,k),0,.35);pz(P,'armR',lerp(-.6,-3.05,k),0,-.35);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'chest',-.3*k);pz(P,'head',-.4*k);pz(P,'thighL',-.4*bump(e));pz(P,'shinL',.8*bump(e))},
 // shuriken tournoyants : bras écartés, une pirouette
 fm_spin:(P,e)=>{P.rootR.y=ezio(e)*6.283;pz(P,'armL',-1.4,0,1.1);pz(P,'armR',-1.4,0,-1.1);pz(P,'foreL',-.2);pz(P,'foreR',-.2);P.root.y=-2},
});
// ---------- champs synchronisés ----------
AFTER.push(()=>{UK.push('fm_bcd')});
