// ===== Clan Hoshigaki (c18, préfixe hs_) : requins, Samehada et eau =====
// Identité : le tank qui affame. Samehada, le sabre vivant, arrache le chakra ; le chakra volé soigne (trait) ;
// un ennemi à sec devient une PROIE (+12 % de tes dégâts, les requins le traquent partout).
// Combo signature : Prison aqueuse ou Requins voraces vident la jauge → la proie ne peut plus rien lancer → Samehada la dévore.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
const HS_D={
 bite:'Samehada s\'abat devant toi (petit élan) : 14 dégâts et arrache 7 de chakra',
 sharks:'3 requins d\'eau en éventail traquent l\'ennemi devant eux (une proie, partout) : 7 dégâts et 2 de chakra volés chacun',
 prison:'Bulle d\'eau : le 1er ennemi touché (8) est emprisonné 0,9 s, Samehada lui arrache 9 de chakra, puis la bulle éclate (6)',
 scales:'Les écailles de Samehada te couvrent 3 s : −25 % de dégâts subis ; qui te frappe au corps à corps se blesse (6) et perd 4 de chakra',
 fuse:'Fusion avec Samehada 6 s : −20 % de dégâts subis, +15 % de dégâts, insensible aux ralentissements ; tes coups de base volent 3 de chakra',
 throw:'Samehada tournoie en ligne et revient : elle traverse les ennemis (16 dégâts et 5 de chakra volés à chaque passage)',
 swim:'Tu plonges et nages jusqu\'au curseur (intouchable 0,3 s) ; tu jaillis : 10 dégâts, ralentit et vole 4 de chakra autour',
 wave:'Tu files sur une vague vers le curseur ; le reflux part derrière toi : 8 dégâts, repousse et trempe',
 dai:'Requin géant en ligne : il avale le 1er ennemi (10 ; étourdi 0,8 s, 12 de chakra volés) puis le recrache (34, repousse ; 12 autour)',
 sea:'Une mer t\'entoure 5 s et te suit : ennemis trempés et attirés ; toutes les 0,5 s, un requin mord (proie d\'abord) : 7 dégâts et 3 de chakra'};
KIT('c18',[
 [1,'D','x.hs_bite','Samehada : Morsure',HS_D.bite,'steel'],
 [2,'C','x.hs_swim','Nage du requin',HS_D.swim,'water'],
 [3,'B','x.hs_prison','Suiton : Prison aqueuse',HS_D.prison,'water'],
 [4,'C','x.hs_scales','Écailles de Samehada',HS_D.scales,'steel'],
 [5,'A','x.hs_dai','Suiton : Daikôdan',HS_D.dai,'water'],
 [1,'C','x.hs_sharks','Suiton : Requins voraces',HS_D.sharks,'water'],
 [4,'A','x.hs_fuse','Fusion avec Samehada',HS_D.fuse,'water'],
 [1,'A','x.hs_throw','Samehada déchaînée',HS_D.throw,'steel'],
 [2,'B','x.hs_wave','Suiton : Bakusui',HS_D.wave,'water'],
 [5,'S','x.hs_sea','Suiton : Mer des requins',HS_D.sea,'water'],
]);
// style de combat propre : le sabre vivant (et le Taijutsu, comme Kisame à mains nues)
STYLES.push(['Samehada','Sabre vivant, lent et large ; chaque coup qui touche arrache 1 de chakra ; 3e coup : balayage très large ; 5e : Samehada mord (4 de chakra)','x.hs_style','steel','sword',[18],1.2,1.06]);
STYLES.find(s=>s[0]==='Taijutsu')[5].push(18);

// ---- aides
const HSC={dk:'#2e4a62',md:'#4a7a9a',lt:'#9ab8cc',belly:'#dfeaf0',ck:'#6ad0ff',foam:'#e8f6ff',ol:'#16222e',gum:'#a8304a',same:'#3a4a7a',band:'#7a8ab8'};
const HS_PREY=25; // sous ce chakra, un ennemi est une proie
const hs_i=u=>units.indexOf(u);
function hs_S(k,u){const V=VFX;VFX=null;S(k,u);VFX=V} // son brut (sans la teinte de l'élément)
// Samehada arrache n de chakra à t et le donne à u (le trait du clan soigne 1 PV pour 2 points) ; renvoie la quantité volée
function hs_drain(u,t,n,q){if(!u||!t||u.dead||t.dead||!(n>0))return 0;const d=Math.min(Math.max(0,t.energy||0),n);if(d<=0)return 0;
 t.energy-=d;u.energy=Math.min(100,(u.energy||0)+d);
 if(trait(u)===TRAITS[18]){gain(u,d*.5/HEALX,u);u.hs_eat=(u.hs_eat||0)+d}
 if(near(t.x,t.y)){jx({jfx:'hs_suck',ui:hs_i(u),ti:hs_i(t),x:t.x,y:t.y,n:Math.min(8,Math.ceil(d)),t:.6,m:.6});if(d>=3&&!q)say(t,'-'+Math.round(d)+' CHAKRA','#7fd8ff')}
 return d}
// coup d'eau (trempe) / coup d'acier (sans élément), quel que soit l'élément du jutsu en cours
function hs_hit(e,u,d,o,v){const V=VFX;VFX=v||'water';const r=hit(e,u,d,o||{});VFX=V;return r}
// pilote d'un projectile : f(x,p,dt,fin) à chaque image tant qu'il vole, puis une fois à sa disparition
function hs_pilot(u,f){const p=projs[projs.length-1];aux.push({type:'hs_pc',x:p.x,y:p.y,r:0,t:p.life+1,m:p.life+1,team:u.team,owner:u,p,f});return p}
AUXF.hs_pc=(x,dt)=>{const p=x.p;if(!p||x.done){x.t=0;return}x.x=p.x;x.y=p.y;if(p.dead||!projs.includes(p)){x.done=1;x.t=0;x.f(x,p,dt,1)}else{x.t=Math.max(x.t,.5);x.f(x,p,dt,0)}};
AUXD.hs_pc=()=>{};
const hs_wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
// requin chercheur : vire (3 rad/s) vers un ennemi devant lui ; une proie (chakra < 25) est traquée partout (4,5 rad/s), l'œil rougit
function hs_hunt(o,p,dt){const h=Math.atan2(p.vy,p.vx);let tg=null,bd=1e9,pr=0;
 for(const e of enemies(o)){const d=Math.hypot(e.x-p.x,e.y-p.y);if(e.stealth>0&&d>140)continue;
  if((e.energy||0)<HS_PREY&&d<520){if(!pr||d<bd){tg=e;bd=d;pr=1}}else if(!pr&&d<380&&d<bd&&angDiff(Math.atan2(e.y-p.y,e.x-p.x),h)<1.1){tg=e;bd=d}}
 p.col=pr?'#ff6a7a':'#4a7a9a';if(!tg)return;const tr=pr?4.5:3,na=h+clamp(hs_wrap(Math.atan2(tg.y-p.y,tg.x-p.x)-h),-tr*dt,tr*dt),sp=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp}

Object.assign(NAT,{
 // ---------- style : Samehada (combo de 5 coups lourds ; chaque coup qui touche arrache du chakra) ----------
 hs_style:SP('Samehada','',.5,{hero:'dooku',melee:1,ai:{max:108,p:1}},(u,a)=>{const c=stC(u),T=[0,[104,1.7,12,.5],[104,1.7,12,.5],[110,2.6,12,.56],[100,1.1,13,.52],[114,2.1,15,.72]][c];
  if(c===5)stLunge(u,a,40);
  stMelee(u,a,T[0],T[1],T[2],c===4?{kb:110}:{},[0,{d:-1,tl:.8,z:40,th:17,c:HSC.lt,c2:HSC.dk,blade:1},{d:1,tl:-.8,z:36,th:17,c:HSC.lt,c2:HSC.dk,blade:1},{d:-1,z:24,th:19,c:HSC.lt,c2:HSC.dk,blade:1,rr:.8},{jfx:'st_thrust',z:30,c:HSC.lt},{d:-1,tl:1.3,z:34,th:21,c:'#ffffff',c2:HSC.md,blade:1,rr:.75}][c],e=>{
   const n=hs_drain(u,e,c===5?4:1);if(c===5){jx({jfx:'hs_chomp',ti:hs_i(e),x:e.x,y:e.y,a,t:.42,m:.42});hs_S('bone',e)}else if(n&&near(e.x,e.y))sparks(e.x,e.y,HSC.ck,4)});
  stCd(u,T[3]);anim(u,'hs_sw'+c,c===5?.4:.32)}),
 // ---------- Samehada : Morsure (D) : élan court, le sabre s'abat et arrache le chakra ----------
 hs_bite:SP('Samehada : Morsure',HS_D.bite,6,{hero:'dooku',ai:RG(125,.75),line:{len:130,w:80}},(u,a)=>{hs_S('saber',u);hs_S('bone',u);anim(u,'hs_chop',.42);stLunge(u,a,46);
  jx({jfx:'st_arc',ui:hs_i(u),x:u.x,y:u.y,a,R:128,w:1.8,t:.3,m:.3,d:-1,tl:1.2,z:40,th:22,c:HSC.lt,c2:HSC.dk,blade:1});
  for(const e of stIn(u,a,128,1.8))if(hs_hit(e,u,14,{melee:1},'steel')){hs_drain(u,e,7);jx({jfx:'hs_chomp',ti:hs_i(e),x:e.x,y:e.y,a,t:.42,m:.42})}}),
 // ---------- Requins voraces (C) : 3 requins chercheurs en éventail ----------
 hs_sharks:SP('Suiton : Requins voraces',HS_D.sharks,8,{ai:RG(470,.65)},(u,a)=>{S('water',u);anim(u,'hs_summon',.45);jx({jfx:'hs_pool',x:u.x+Math.cos(a)*34,y:u.y+Math.sin(a)*34,r:40,t:.5,m:.5});
  for(const k of[-1,0,1]){proj(u,a+k*.34,{spd:560,r:9,dmg:7,life:.95,col:HSC.md,kind:'hs_shark',onHit:(p,t)=>{hs_drain(p.owner,t,2);jx({jfx:'hs_chomp',ti:hs_i(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),s:.6,t:.32,m:.32})}});
   hs_pilot(u,(x,p,dt,end)=>{if(!end)hs_hunt(p.owner,p,dt);else if(near(p.x,p.y)&&p.life<=0)jx({jfx:'hs_splash',x:p.x,y:p.y,r:26,t:.4,m:.4})})}}),
 // ---------- Prison aqueuse (B) : bulle lente ; la cible est noyée 0,9 s pendant que Samehada boit son chakra ----------
 hs_prison:SP('Suiton : Prison aqueuse',HS_D.prison,12,{ai:RG(380,.6),line:{len:400,w:28}},(u,a)=>{S('water',u);anim(u,'hs_grasp',.5);
  proj(u,a,{spd:620,r:13,dmg:8,life:.62,col:'#5ac8e8',kind:'hs_bubble',stun:.9,onHit:(p,t)=>{if(t.dead)return;const o=p.owner,D=t.stun>0?Math.min(.9,t.stun):0;
   if(!D){jx({jfx:'hs_splash',x:t.x,y:t.y,r:40,t:.45,m:.45});return} // insensible au contrôle : la bulle éclate tout de suite
   say(t,'PRISON AQUEUSE','#9fe0ff');aux.push({type:'hs_prison',x:t.x,y:t.y,r:34,t:D,m:D,team:o.team,owner:o,vfx:'water',k:.2,ti:hs_i(t),tg:t,n:0});jx({jfx:'hs_bubbleT',ti:hs_i(t),x:t.x,y:t.y,t:D,m:D})}})}),
 // ---------- Écailles de Samehada (C) : armure d'écailles (gérée par le trait) ----------
 hs_scales:SP('Écailles de Samehada',HS_D.scales,12,{ai:DEF},(u)=>{hs_S('saber',u);hs_S('deflect',u);u.hs_scl=3;anim(u,'hs_guard',.55);jx({jfx:'hs_scaleUp',ui:hs_i(u),x:u.x,y:u.y,t:.5,m:.5});sparks(u.x,u.y,HSC.lt,10)}),
 // ---------- Fusion avec Samehada (A) : forme d'homme-requin (gérée par le trait) ----------
 hs_fuse:SP('Fusion avec Samehada',HS_D.fuse,18,{ai:SELF(200,.7)},(u)=>{S('water',u);hs_S('roar',u);u.hs_fus=6;u.slowImm=Math.max(u.slowImm||0,6);u.slow=0;anim(u,'hs_fuse',.8);
  jx({jfx:'hs_fuseFx',ui:hs_i(u),x:u.x,y:u.y,t:.8,m:.8});if(near(u.x,u.y))shake=Math.max(shake,.15);say(u,'FUSION !','#9fe0ff')}),
 // ---------- Samehada déchaînée (A) : le sabre tournoie, traverse et revient ----------
 hs_throw:SP('Samehada déchaînée',HS_D.throw,12,{hero:'dooku',ai:RG(400,.6),line:{len:400,w:40}},(u,a)=>{hs_S('saber',u);hs_S('roar',u);anim(u,'hs_fling',.45);
  proj(u,a,{spd:640,r:18,dmg:16,life:1.7,ret:380,pierce:1,col:HSC.same,kind:'hs_same',onHit:(p,t)=>{hs_drain(p.owner,t,5);if(near(t.x,t.y)){sparks(t.x,t.y,HSC.lt,6);hs_S('bone',t)}}})}),
 // ---------- Nage du requin (C, déplacement) : plongée, aileron qui file, puis on jaillit en mordant ----------
 hs_swim:SP('Nage du requin',HS_D.swim,10,{ai:{mode:'gap',min:150,max:300,p:.55}},(u,a,td)=>{const d=clamp(td||260,110,280),D=.42;S('water',u);u.phase=Math.max(u.phase||0,.3);u.root=0;u.rootV=null;
  anim(u,'hs_dive',D+.12);jx({jfx:'hs_splash',x:u.x,y:u.y,r:34,t:.4,m:.4});jx({jfx:'hs_fin',ui:hs_i(u),x:u.x,y:u.y,a,t:D+.05,m:D+.05});
  dash(u,a,d,D,{end:()=>{if(u.dead)return;jx({jfx:'hs_burst',x:u.x,y:u.y,r:80,a,t:.6,m:.6});S('water',u);
   for(const e of enemies(u))if(Math.hypot(e.x-u.x,e.y-u.y)<80+e.r&&hs_hit(e,u,10,{slow:.8,fx:u.x,fy:u.y}))hs_drain(u,e,4)}})}),
 // ---------- Bakusui (B, déplacement) : on file sur une vague, le reflux repousse derrière soi ----------
 hs_wave:SP('Suiton : Bakusui',HS_D.wave,13,{ai:ESC},(u,a,td)=>{const d=clamp(td||230,120,240),b=a+Math.PI;S('water',u);hs_S('wind',u);anim(u,'hs_surf',.48);
  proj(u,b,{spd:640,r:36,dmg:8,life:.42,col:'#5ac8e8',kind:'hs_wave',pierce:1,noClash:1,o:{kb:240}});
  jx({jfx:'hs_ride',ui:hs_i(u),x:u.x,y:u.y,a,t:.46,m:.46});dash(u,a,d,.4,{jump:16,end:()=>{if(!u.dead)jx({jfx:'hs_splash',x:u.x,y:u.y,r:46,t:.45,m:.45})}})}),
 // ---------- Daikôdan (A, ultime) : le requin géant avale la cible, puis la recrache ----------
 hs_dai:ULT('Suiton : Daikôdan',HS_D.dai,{line:{len:520,w:56},ai:{max:470,p:.8}},(u,a)=>{S('water',u);hs_S('roar',u);anim(u,'hs_summon',.6);jx({jfx:'hs_pool',x:u.x+Math.cos(a)*40,y:u.y+Math.sin(a)*40,r:62,t:.6,m:.6});
  proj(u,a,{spd:500,r:26,dmg:10,life:1.05,col:HSC.md,kind:'hs_big',noClash:1,stun:.8,onHit:(p,t)=>{if(t.dead)return;const o=p.owner;
   aux.push({type:'hs_maw',x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),r:40,t:.8,m:.8,team:o.team,owner:o,vfx:'water',k:.2,ti:hs_i(t),tg:t,n:0});
   jx({jfx:'hs_jaws',ti:hs_i(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.8,m:.8});if(near(t.x,t.y)){hs_S('bone',t);shake=Math.max(shake,.2)}}});
  hs_pilot(u,(x,p,dt,end)=>{if(end&&p.life<=0&&near(p.x,p.y))jx({jfx:'hs_splash',x:p.x,y:p.y,r:70,t:.6,m:.6})})}),
 // ---------- Mer des requins (S, ultime) : la mer suit le lanceur, les requins mordent les ennemis dedans ----------
 hs_sea:ULT('Suiton : Mer des requins',HS_D.sea,{tele:{self:1,r:210},ai:SELF(180,.8)},(u)=>{S('water',u);hs_S('heavy',u);hs_S('roar',u);anim(u,'hs_sea',.9);
  aux.push({type:'hs_sea',x:u.x,y:u.y,r:210,t:5,m:5,team:u.team,owner:u,ui:hs_i(u),vfx:'water',k:.45,n:0});jx({jfx:'hs_rise',x:u.x,y:u.y,r:210,t:.9,m:.9});if(near(u.x,u.y))shake=Math.max(shake,.3)}),
});
Object.assign(NATHERO,{hs:'kylo'});

// ---- logique des objets
// (auxUpdate décompte déjà x.t et x.k à chaque image)
// prison : la bulle suit la cible ; toutes les 0,3 s Samehada boit 3 de chakra ; à la fin la bulle éclate
AUXF.hs_prison=(x,dt)=>{const e=x.tg,o=x.owner;if(x.done)return;if(!e||e.dead){x.t=0;x.done=1;return}x.x=e.x;x.y=e.y;
 if(x.k<=0&&x.n<3){x.k+=.3;x.n++;x.dr=(x.dr||0)+hs_drain(o,e,3,1)}
 if(x.t<=0){x.done=1;if(o)hs_hit(e,o,6,{});if(x.dr>=1)say(e,'-'+Math.round(x.dr)+' CHAKRA','#7fd8ff');jx({jfx:'hs_splash',x:e.x,y:e.y,r:48,t:.5,m:.5});if(near(e.x,e.y))S('water',e)}};
AUXD.hs_prison=()=>{};
// Daikôdan : la cible est dans la gueule (étourdie) ; Samehada boit 4 de chakra 3 fois ; puis le requin la recrache
AUXF.hs_maw=(x,dt)=>{const e=x.tg,o=x.owner;if(x.done)return;if(!e||e.dead){x.t=0;x.done=1;return}x.x=e.x;x.y=e.y;e.kx=e.ky=0;
 if(x.k<=0&&x.n<3){x.k+=.22;x.n++;x.dr=(x.dr||0)+hs_drain(o,e,4,1)}
 if(x.t<=0){x.done=1;if(x.dr>=1)say(e,'-'+Math.round(x.dr)+' CHAKRA','#7fd8ff');const V=VFX;VFX='water';hit(e,o,34,{kb:260,fx:e.x-Math.cos(x.a)*30,fy:e.y-Math.sin(x.a)*30,unblockable:1});
  for(const f of enemies(o))if(f!==e&&Math.hypot(f.x-e.x,f.y-e.y)<90+f.r)hit(f,o,12,{fx:e.x,fy:e.y,kb:120});VFX=V;
  jx({jfx:'hs_spit',x:e.x,y:e.y,a:x.a,r:90,t:.7,m:.7});if(near(e.x,e.y)){S('water',e);hs_S('boom',e);shake=Math.max(shake,.3)}}};
AUXD.hs_maw=()=>{};
// mer des requins : suit le lanceur ; trempe et attire les ennemis ; un requin mord toutes les 0,5 s (proie d'abord, sinon le plus proche du centre)
AUXF.hs_sea=(x,dt)=>{const o=x.owner;if(!o||o.dead){x.t=Math.min(x.t,.25);return}x.x=o.x;x.y=o.y;if(x.t<=0)return;o.slowImm=Math.max(o.slowImm||0,.2);
 let tg=null,bs=1e9;for(const e of enemies(o)){const dx=x.x-e.x,dy=x.y-e.y,d=Math.hypot(dx,dy);if(d>x.r+e.r)continue;e.wet=Math.max(e.wet||0,1);
  if(d>12&&e.unstop<=0&&!e.dash){const v=Math.min(d-12,40*dt);e.x+=dx/d*v;e.y+=dy/d*v}
  const sc=d-((e.energy||0)<HS_PREY?1000:0);if(sc<bs&&!(e.stealth>0&&d>120)){bs=sc;tg=e}}
 if(x.k<=0){x.k+=.5;if(tg){const a=Math.atan2(tg.y-x.y,tg.x-x.x);jx({jfx:'hs_leap',ti:hs_i(tg),x:tg.x,y:tg.y,a,t:.42,m:.42});
  later(o,.18,()=>{if(tg.dead||o.dead||Math.hypot(tg.x-x.x,tg.y-x.y)>x.r+tg.r+30)return;if(hs_hit(tg,o,7,{}))hs_drain(o,tg,3)})}}};

// ---- trait de clan : Samehada (le chakra volé soigne ; un ennemi à sec est une proie)
// écailles et fusion : réduction de dégâts ; écailles : un coup au corps à corps blesse l'attaquant et lui arrache du chakra (une fois par 0,5 s et par attaquant)
TRAITS[18]={nom:'Samehada',desc:'Le chakra que tu voles te soigne (1 PV pour 2 points). Un ennemi sous 25 de chakra devient une proie (aileron au-dessus de lui) : tu lui infliges +12 % de dégâts et tes requins le traquent partout',
 init(u){u.hs_eat=0},
 update(u,dt){if(u.hs_cds!==u.cds){u.hs_cds=u.cds;u.hs_fus=0;u.hs_scl=0;u.hs_eat=0} // nouveau ninja ou réapparition
  if(u.hs_fus>0){u.hs_fus=Math.max(0,u.hs_fus-dt);if(!u.hs_fus&&near(u.x,u.y)){jx({jfx:'hs_splash',x:u.x,y:u.y,r:50,t:.5,m:.5});S('water',u)}}
  if(u.hs_scl>0){u.hs_scl=Math.max(0,u.hs_scl-dt);if(!u.hs_scl&&near(u.x,u.y))sparks(u.x,u.y,HSC.lt,8)}},
 deal(src,t,dmg,o){if(!t||t===src||t.team===src.team)return dmg;if((t.energy||0)<HS_PREY)dmg*=1.12;
  if(src.hs_fus>0)dmg*=1.15;return dmg},
 landed(src,t,dmg,o){if(t&&t!==src&&t.team!==src.team&&src.hs_fus>0&&o.basic&&o.melee&&!o.hs_x)later(src,0,()=>hs_drain(src,t,3))}, // vol de chakra : seulement si le coup passe
 take(t,src,dmg,o){if(!src||src===t||dmg<=0)return dmg;if(t.hs_fus>0)dmg*=.8;
  if(t.hs_scl>0){dmg*=.75;if(o.melee&&!o.thorn&&!src.dead&&!(SIMT<(src.hs_thT||0))){src.hs_thT=SIMT+.5;
   later(t,0,()=>{if(src.dead||t.dead)return;const V=VFX;VFX='steel';hit(src,t,6,{thorn:1,silent:1});VFX=V;hs_drain(t,src,4);if(near(src.x,src.y)){sparks(src.x,src.y,HSC.lt,8);say(src,'ÉCAILLES','#bcd4e4')}})}}
  return dmg},
 hud(u,x,y){y-=20;const n=Math.round(u.hs_eat||0);let pr=0;for(const e of units)if(!e.dead&&e.team!==u.team&&(e.energy||0)<HS_PREY)pr++;
  text('Samehada : '+n+' chakra dévoré'+(pr?' · '+pr+' proie'+(pr>1?'s':''):''),x,y+6,11,pr?'#ffb0b8':'#9fd0ec','left','normal')}};
AFTER.push(()=>UK.push('hs_fus','hs_scl','hs_eat'));

// ---- apparence : peau bleu-gris (nuance selon la peau choisie), branchies, yeux de requin ; Samehada en main (style) ou dans le dos
const HS_SKIN=['#94b0c4','#86a4ba','#7898ae','#6a889e','#a0b8c8','#7c9cb4','#a8bece','#9ab6ca'];
CLOOK[18]=(look,l,S)=>{const h=look.head;h.skin=HS_SKIN[l.p|0]||'#86a4ba';if(look.arm&&T_isSkin(look,l))look.arm=h.skin;h.eyeT='req';if(!h.face)h.face='branchies';
 if(S&&S[0]==='Samehada'){look.weapon.same=1;if(look.back==='samehada')look.back=''}else if(!look.back&&!look.gourd)look.back='samehada'}; // pas de seconde Samehada dans le dos quand elle est en main
function T_isSkin(look,l){const T=TENUES[l.t];return T&&T[1].arm==='skin'}

// ---- animations 3D (le sabre est tenu à deux mains : la main gauche rejoint la poignée)
const hs_two=(P,k)=>{pz(P,'armL',-1.1*k-.4,0,-.35*k);pz(P,'foreL',-1.3*k)};
Object.assign(ANIM,{
 // coups du style : diagonale descendante, revers montant, grand balayage, estoc d'épaule, morsure sautée
 hs_sw1:(P,e,u)=>{const k=stH(e,.26,.6);pz(P,'armR',lerp(-3,-.7,k),0,lerp(-.7,.6,k));pz(P,'foreR',-.2);pz(P,'handR',1.2);hs_two(P,1-k*.6);pz(P,'chest',.25*k,lerp(-.45,.6,k));P.root.z=7*k;stLegs(P,u,k,1.2)},
 hs_sw2:(P,e,u)=>{const k=stH(e,.26,.6);pz(P,'armR',lerp(-.5,-2.7,k),0,lerp(.7,-.7,k));pz(P,'foreR',-.2);pz(P,'handR',1.2);hs_two(P,k*.6);pz(P,'chest',.12,lerp(.55,-.5,k));P.root.z=5*k;stLegs(P,u,k,1.2)},
 hs_sw3:(P,e,u)=>{const k=stH(e,.3,.62);P.rootR.y=lerp(.8,-.8,ezo(Math.min(1,e/.45)))*(e<.62?1:1-ezio((e-.62)/.38));stSweep(P,'R',k,-.6,2.3,.25);pz(P,'handR',1.45);pz(P,'armL',-.4,0,.7);pz(P,'chest',.2*k,lerp(-.5,.6,k));stLegs(P,u,1,1.5)},
 hs_sw4:(P,e,u)=>{const k=stH(e,.2,.6);pz(P,'armR',-1.57*k-.15,0,.1);pz(P,'foreR',-.05);pz(P,'handR',1.5*k);hs_two(P,k);pz(P,'chest',.45*k,.35*k);P.root.z=14*k;if(!(u&&u.moving)){P.root.y=-5*k;pz(P,'thighR',-1.1*k);pz(P,'shinR',1*k);pz(P,'thighL',.7*k);pz(P,'shinL',.4*k)}},
 hs_sw5:(P,e,u)=>{const up=e<.35,k=up?ezo(e/.35):1-ezio((e-.35)/.65)*.9;pz(P,'armR',up?-3.1*k:lerp(-.5,-3.1,k),0,-.15);pz(P,'foreR',-.3);pz(P,'handR',1.3);hs_two(P,k);pz(P,'chest',up?-.35*k:.55*(1-k)+.1);
  P.root.y=up?8*Math.sin(Math.PI*e/.35):-4*(1-k);P.root.z=12*(up?k:1);pz(P,'thighL',-.7*k);pz(P,'shinL',1.1*k);pz(P,'thighR',-.3*k);pz(P,'shinR',.8*k)},
 // Morsure : lève le sabre au-dessus de la tête et l'abat en avançant
 hs_chop:(P,e,u)=>{const up=e<.3,k=up?ezo(e/.3):ezo(Math.min(1,(e-.3)/.25));pz(P,'armR',up?-3.2*k:-3.2+2.5*k,0,-.1);pz(P,'foreR',up?-.4:-.4+.3*k);pz(P,'handR',1.3);hs_two(P,1);pz(P,'chest',up?-.3*k:-.3+.85*k,0);P.root.z=up?0:14*k;P.root.y=up?0:-6*k;
  if(!up){pz(P,'thighL',-.9*k);pz(P,'shinL',1*k);pz(P,'thighR',.5*k);pz(P,'shinR',.5*k)}},
 // invocation des requins : deux paumes jointes poussées vers l'avant
 hs_summon:(P,e)=>{const k=ezo(Math.min(1,e/.3)),o=e>.5?Math.min(1,(e-.5)/.2):0;for(const s of['L','R']){pz(P,'arm'+s,-1.2-.4*k,0,(s==='L'?-.35:.35)*(1-k*.6));pz(P,'fore'+s,-1.5*(1-k)-.1)}pz(P,'chest',.2*k-.1*o,0);pz(P,'head',.1*k);P.root.z=4*k;P.root.y=-2*k},
 // prison : main tendue, doigts écartés, puis le poing se ferme sur la bulle
 hs_grasp:(P,e)=>{const k=ezo(Math.min(1,e/.25)),c=e>.55?ezo(Math.min(1,(e-.55)/.2)):0;pz(P,'armR',-1.55*k,0,.12);pz(P,'foreR',-.1-.6*c);pz(P,'armL',-.9,0,-.5);pz(P,'foreL',-1.6);pz(P,'chest',.15*k,.3*k);pz(P,'head',.05,-.2*k);P.root.y=-1.5*k},
 // écailles : Samehada dressée devant soi en garde
 hs_guard:(P,e)=>{const k=ezo(Math.min(1,e/.25));pz(P,'armR',-1.3*k,0,-.6*k);pz(P,'foreR',-1.2*k);pz(P,'handR',-.3);pz(P,'armL',-1.2*k,0,.5*k);pz(P,'foreL',-1.4*k);pz(P,'chest',-.1*k,-.2*k);P.root.y=-3*k;pz(P,'thighL',-.4*k);pz(P,'shinL',.6*k);pz(P,'thighR',.3*k);pz(P,'shinR',.5*k)},
 // fusion : recroquevillé, puis le corps s'arque et rugit, bras écartés
 hs_fuse:(P,e)=>{const c=e<.35,k=c?ezo(e/.35):1-ezio((e-.35)/.65);if(c){pz(P,'chest',.6*k);pz(P,'head',.3*k);for(const s of['L','R']){pz(P,'arm'+s,-.6*k,0,0);pz(P,'fore'+s,-1.8*k)}P.root.y=-7*k;pz(P,'thighL',-.8*k);pz(P,'shinL',1.3*k);pz(P,'thighR',-.8*k);pz(P,'shinR',1.3*k)}
  else{pz(P,'chest',-.45*k);pz(P,'head',-.5*k);pz(P,'armL',-.5*k,0,1.2*k);pz(P,'armR',-.5*k,0,-1.2*k);pz(P,'foreL',-.5*k);pz(P,'foreR',-.5*k);P.root.y=3*k}},
 // lancer de Samehada : armé derrière l'épaule, puis jeté à plat
 hs_fling:(P,e)=>{const up=e<.35,k=up?ezo(e/.35):ezo(Math.min(1,(e-.35)/.2));pz(P,'armR',up?-.4*k:-.4-1.2*k,up?0:0,up?.9*k:.9-1.6*k);pz(P,'foreR',up?-1.2*k:-1.2+1.1*k);pz(P,'armL',-1.2,0,.5);pz(P,'foreL',-.6);pz(P,'chest',up?-.15:.25*k,up?-.7*k:-.7+1.3*k);P.root.z=up?-3:6*k},
 // plongée : le corps se couche vers l'avant, bras tendus en flèche
 hs_dive:(P,e)=>{const k=bump(Math.min(1,e*1.1));pz(P,'chest',1.1*k);pz(P,'head',-.6*k);for(const s of['L','R']){pz(P,'arm'+s,-3*k,0,(s==='L'?-.15:.15));pz(P,'fore'+s,-.05)}P.root.y=-9*k;P.root.z=10*k;pz(P,'thighL',.5*k);pz(P,'thighR',.6*k);pz(P,'shinL',.4*k);pz(P,'shinR',.3*k)},
 // surf : debout sur la vague, penché, bras écartés pour l'équilibre
 hs_surf:(P,e)=>{const k=ezo(Math.min(1,e/.2))*(e>.8?1-(e-.8)/.2:1);pz(P,'armL',-.5*k,0,1.1*k);pz(P,'armR',-.5*k,0,-1.1*k);pz(P,'chest',.3*k,.4*k);P.rootR.y=.5*k;P.root.y=-4*k;pz(P,'thighL',-.7*k);pz(P,'shinL',1*k);pz(P,'thighR',.3*k);pz(P,'shinR',.7*k)},
 // mer des requins : les bras montent, paumes ouvertes, la mer jaillit
 hs_sea:(P,e)=>{const k=ezo(Math.min(1,e/.35));pz(P,'armL',-.3-2.5*k,0,.9*k+.2);pz(P,'armR',-.3-2.5*k,0,-.9*k-.2);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'chest',-.3*k);pz(P,'head',-.4*k);P.root.y=2*k},
});

// ---- visuels
// requin vu de profil (repère : museau vers +x) ; m = ouverture de la gueule (0-1), hunt = œil rouge (proie)
function hs_sharkD(s,ra,t,m,hunt,big){const w=Math.sin(t/(big?120:85));g.rotate(ra);if(Math.cos(ra)<0)g.scale(1,-1);g.scale(s,s);
 g.strokeStyle=rgba(HSC.foam,.55);g.lineWidth=1.5;for(let i=1;i<4;i++){const x=-28-i*8;g.beginPath();g.moveTo(x-5,-(4+i*3));g.quadraticCurveTo(x+4,0,x-5,4+i*3);g.stroke()} // sillage
 g.fillStyle=HSC.dk;g.strokeStyle=HSC.ol;g.lineWidth=1.1;g.beginPath();g.moveTo(-21,0);g.lineTo(-35,-12+w*4);g.lineTo(-30,0);g.lineTo(-34,9+w*4);g.closePath();g.fill();g.stroke(); // queue
 g.beginPath();g.moveTo(-1,-7);g.quadraticCurveTo(-7,-15,-13,-20);g.lineTo(-12,-6);g.closePath();g.fill();g.stroke(); // aileron dorsal
 g.fillStyle=HSC.md;g.beginPath();g.moveTo(27,0);g.quadraticCurveTo(22,-8,8,-8.5);g.quadraticCurveTo(-12,-8,-22,-2);g.lineTo(-22,2);g.quadraticCurveTo(-10,7,8,7.5);g.quadraticCurveTo(20,6,27,0);g.closePath();g.fill();g.stroke(); // corps
 g.fillStyle=HSC.belly;g.beginPath();g.moveTo(24,1.5);g.quadraticCurveTo(14,7,0,6.5);g.quadraticCurveTo(-12,5.5,-20,2.5);g.quadraticCurveTo(-4,3,24,1.5);g.fill(); // ventre
 g.fillStyle=HSC.dk;g.beginPath();g.moveTo(4,5);g.lineTo(-6,14+w*2);g.lineTo(-3,5);g.fill(); // nageoire
 g.strokeStyle=HSC.dk;g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(6-i*2.6,-4.5);g.quadraticCurveTo(4.6-i*2.6,-.5,6-i*2.6,3);g.stroke()} // branchies
 const o=(m||0)*6;if(o>.3){g.fillStyle=HSC.gum;g.beginPath();g.moveTo(11,1);g.lineTo(27,-1.5);g.lineTo(26,1+o);g.closePath();g.fill();
  g.fillStyle='#fff';for(let i=0;i<5;i++){const x=13+i*2.6;g.beginPath();g.moveTo(x,-.5);g.lineTo(x+1.2,1.8);g.lineTo(x+2.4,-.6);g.fill();g.beginPath();g.moveTo(x,1+o*(x-11)/16);g.lineTo(x+1.2,-1+o*(x-11)/16);g.lineTo(x+2.4,1+o*(x-11)/16);g.fill()}}
 else{g.strokeStyle=HSC.ol;g.lineWidth=1;g.beginPath();g.moveTo(12,1.5);g.lineTo(25,.2);g.stroke();g.fillStyle='#fff';for(let i=0;i<4;i++){g.beginPath();g.moveTo(14+i*2.6,1.2);g.lineTo(15.2+i*2.6,3.2);g.lineTo(16.4+i*2.6,1);g.fill()}}
 if(hunt)circ(16,-3.2,3.4,rgba('#ff3a4a',.45));circ(16,-3.2,1.7,hunt?'#ff4a5a':'#10161c');circ(16.5,-3.6,.6,'#fff')}
PROJD.hs_shark=(p,R,ra,t)=>hs_sharkD(R/10.5,ra,t,.35+.35*Math.sin(t/70),p.col==='#ff6a7a',0);
// Daikôdan : requin géant qui fend l'eau (vague d'étrave), gueule béante
PROJD.hs_big=(p,R,ra,t)=>{g.save();g.rotate(ra);g.fillStyle=rgba(HSC.foam,.5);for(let i=0;i<6;i++){const b=t/120+i*1.05;g.beginPath();g.ellipse(-R*1.6-i*8,Math.sin(b)*R*.9,R*.32,R*.16,0,0,7);g.fill()}
 g.strokeStyle=rgba('#bfe8ff',.7);g.lineWidth=3;g.beginPath();g.ellipse(R*.7,0,R*.55,R*1.25,0,-1.2,1.2);g.stroke();g.restore();hs_sharkD(R/9,ra,t,.75+.25*Math.sin(t/90),0,1)};
// bulle de la prison : sphère d'eau, reflets et bulles qui montent
PROJD.hs_bubble=(p,R,ra,t)=>{const r=R*1.15;g.fillStyle=rgba('#5ac8e8',.35);g.beginPath();g.arc(0,0,r,0,7);g.fill();g.strokeStyle=rgba('#e8f6ff',.85);g.lineWidth=1.6;g.beginPath();g.arc(0,0,r,0,7);g.stroke();
 g.strokeStyle=rgba('#ffffff',.8);g.lineWidth=2;g.beginPath();g.arc(-r*.25,-r*.3,r*.55,3.6,4.6);g.stroke();g.fillStyle=rgba('#ffffff',.85);for(let i=0;i<4;i++){const b=t/200+i*1.6;g.beginPath();g.arc(Math.cos(b)*r*.5,Math.sin(b*1.3)*r*.45,1.6,0,7);g.fill()}
 g.save();g.rotate(ra);g.strokeStyle=rgba('#9fe0ff',.6);g.lineWidth=1.4;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-r-4-i*7,-3+i*3);g.lineTo(-r-12-i*7,-3+i*3);g.stroke()}g.restore()};
// Samehada qui tournoie : sabre bandé, écailles qui dépassent
function hs_sameD(s,rot,glow){g.save();g.rotate(rot);g.scale(s,s);if(glow){g.fillStyle=rgba(HSC.ck,.25);g.beginPath();g.ellipse(0,0,30,10,0,0,7);g.fill()}
 g.fillStyle='#5a4a3a';g.strokeStyle=HSC.ol;g.lineWidth=1.1;g.fillRect(-30,-2,10,4);g.strokeRect(-30,-2,10,4); // poignée
 g.fillStyle=HSC.same;g.beginPath();g.moveTo(-20,-6);g.quadraticCurveTo(10,-8.5,28,-4);g.quadraticCurveTo(31,0,28,4);g.quadraticCurveTo(10,8.5,-20,6);g.closePath();g.fill();g.stroke();
 g.strokeStyle=HSC.band;g.lineWidth=1.3;for(let i=0;i<6;i++){const x=-15+i*7.5;g.beginPath();g.moveTo(x,-6.5);g.lineTo(x+4,6.5);g.stroke()}
 g.fillStyle=HSC.lt;for(let i=0;i<5;i++){const x=-12+i*8;g.beginPath();g.moveTo(x,-7);g.lineTo(x+2,-11);g.lineTo(x+4,-7);g.fill();g.beginPath();g.moveTo(x+3,7);g.lineTo(x+5,11);g.lineTo(x+7,7);g.fill()}g.restore()}
PROJD.hs_same=(p,R,ra,t)=>{g.fillStyle=rgba(HSC.ck,.18);g.beginPath();g.arc(0,0,R*1.9,0,7);g.fill();g.strokeStyle=rgba('#cfe6f2',.5);g.lineWidth=2;for(let i=0;i<2;i++){g.beginPath();g.arc(0,0,R*1.7,t/60+i*Math.PI,t/60+i*Math.PI+1.4);g.stroke()}
 hs_sameD(R/15,t/45,1)};
// vague du reflux : crête d'écume qui roule (vue de face, perpendiculaire à sa course)
// vague : tranches de profil (rampe à l'arrière, crête qui s'enroule vers l'avant), peintes du fond vers l'avant :
// de côté on voit le rouleau, de face un mur d'eau ; écume en boules le long de la crête
// vague : une nappe d'eau (rampe à l'arrière, crête qui s'enroule vers l'avant) tendue entre 7 profils ;
// de côté on voit le rouleau, de face un mur d'eau ; crête claire et écume en boules
PROJD.hs_wave=(p,R,ra,t)=>{g.translate(0,10);const sp=Math.hypot(p.vx,p.vy)||1,cx=p.vx/sp,cy=p.vy/sp,nx=-cy,ny=cx,W=R*1.25,Q=R/36,gr=Math.min(1,(p.life0-p.life)/.12+.3),H0=40*gr*Q;
 const pt=(a,b,h)=>[a*cx+b*nx,(a*cy+b*ny)*K-h],PR=[[-50,0],[-36,.24],[-22,.58],[-10,.88],[0,1],[9,.9],[12,.68],[7,.56],[4,.34],[7,0]],N=9,M=PR.length,SL=[];
 for(let i=0;i<N;i++){const s=i/(N-1)*2-1,b=s*W,H=H0*(1-s*s*.92)+Math.sin(t/90+s*3)*2*Q*(1-s*s),sh=(1-s*s)*12*Q+Math.sin(t/120+s*4)*2*Q;SL.push({s,P:PR.map(([a,h])=>pt((a<0?a*(1-s*s*.65):a)*Q+sh*h,b,h*H))})} // milieu plus haut et en avance : front arrondi
 const CO=['#1e5a8a','#2a6a9a','#3a86b8','#4aa0d0','#7cc8ec','#a8dcf4','#5ab0dc','#2a6a9a','#245e8e'];g.lineJoin='round';g.lineCap='round';
 // nappe : du fond (rampe) vers la crête puis la lèvre, entre profils voisins
 for(let k=0;k<M-1;k++){g.fillStyle=rgba(CO[k],.9);g.strokeStyle=rgba(CO[k],.9);g.lineWidth=1;for(let i=0;i<N-1;i++){const A=SL[i].P,B=SL[i+1].P;g.beginPath();g.moveTo(...A[k]);g.lineTo(...A[k+1]);g.lineTo(...B[k+1]);g.lineTo(...B[k]);g.closePath();g.fill();g.stroke()}}
 // flancs (profils des deux bouts) et ligne de crête
 for(const S of[SL[0],SL[N-1]]){g.fillStyle=rgba('#2a6a9a',.6);g.beginPath();S.P.forEach((q,k)=>k?g.lineTo(...q):g.moveTo(...q));g.closePath();g.fill();g.strokeStyle=rgba('#bfe8ff',.7);g.lineWidth=1.6*Q;g.stroke()}
 g.strokeStyle=rgba('#e8f8ff',.9);g.lineWidth=2.6*Q;g.beginPath();SL.forEach((S,i)=>i?g.lineTo(...S.P[5]):g.moveTo(...S.P[5]));g.stroke();
 // écume : boules sur la lèvre et embruns devant
 for(const S of SL)for(let k=0;k<2;k++){const [x,y]=S.P[5+k],r=(3.4-k)*Q*(1-Math.abs(S.s)*.35);g.fillStyle=rgba(k?'#e8f8ff':'#ffffff',.92);g.beginPath();g.arc(x,y-1.5*Q+Math.sin(t/60+S.s*7+k)*1.5*Q,r,0,7);g.fill()}
 for(let i=0;i<7;i++){const s=((i*.37+t/700)%1)*2-1,f=(t/180+i*.6)%1,[x,y]=pt((14+f*18)*Q,s*W,H0*(.7-f*.6));g.fillStyle=rgba('#dff4ff',.8*(1-f));g.beginPath();g.arc(x,y,2*Q,0,7);g.fill()}};
// chakra arraché : filets bleus qui volent de la cible vers le lanceur
JFXD.hs_suck=(f,k,e,t,u,tg)=>{const a=tg&&!tg.dead?tg:f;if(!u||u.dead)return;const A=P(a.x,a.y,40),B=P(u.x,u.y,46),cx=(A.x+B.x)/2,cy=Math.min(A.y,B.y)-40*A.s,n=f.n||4;g.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const s=clamp(e*1.6-i*.09,0,1);if(s<=0||s>=1)continue;const x=(1-s)*(1-s)*A.x+2*(1-s)*s*(cx+(i%3-1)*14*A.s)+s*s*B.x,y=(1-s)*(1-s)*A.y+2*(1-s)*s*cy+s*s*B.y,r=(3.2-s*1.2)*A.s;
  g.fillStyle=rgba(HSC.ck,.5);g.beginPath();g.arc(x,y,r*2,0,7);g.fill();g.fillStyle=rgba('#e8fbff',.95);g.beginPath();g.arc(x,y,r,0,7);g.fill()}
 if(e<.3){g.strokeStyle=rgba(HSC.ck,.7*(1-e/.3));g.lineWidth=2*A.s;g.beginPath();g.ellipse(A.x,A.y,(10+e*40)*A.s,(5+e*16)*A.s,0,0,7);g.stroke()}};
// morsure : deux mâchoires de requin qui se referment sur la cible
JFXD.hs_chomp=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,34),s=q.s*(f.s||1),cl=e<.35?ezo(e/.35):1,gap=(1-cl)*22*s,al=Math.min(1,k*3);g.globalAlpha=al;
 const sd=Math.cos(f.a||0)<0?-1:1;g.save();g.translate(q.x,q.y);g.scale(sd,1);
 for(const v of[-1,1]){g.fillStyle=HSC.gum;g.strokeStyle=HSC.ol;g.lineWidth=1.4;g.beginPath();g.moveTo(-24*s,v*(gap+2*s));g.quadraticCurveTo(0,v*(gap+14*s),24*s,v*(gap+2*s));g.lineTo(24*s,v*gap);g.lineTo(-24*s,v*gap);g.closePath();g.fill();g.stroke();
  g.fillStyle='#ffffff';for(let i=0;i<7;i++){const x=-21*s+i*7*s;g.beginPath();g.moveTo(x,v*gap);g.lineTo(x+3.5*s,v*(gap-8*s));g.lineTo(x+7*s,v*gap);g.fill()}}
 g.restore();if(e>.3&&e<.6){g.fillStyle=rgba(HSC.ck,.6);for(let i=0;i<6;i++){const b=i*1.05+e*4;g.fillRect(q.x+Math.cos(b)*(14+e*30)*s,q.y+Math.sin(b)*(8+e*16)*s,2.4*s,2.4*s)}}g.globalAlpha=1};
// flaque d'où sortent les requins
JFXD.hs_pool=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s;g.fillStyle=rgba('#2a6a9a',.45*k);gEll(f.x,f.y,f.r*(.5+e*.6));g.fill();g.strokeStyle=rgba(HSC.foam,.85*k);g.lineWidth=2.5;for(let j=0;j<2;j++){gEll(f.x,f.y,f.r*(.35+e*.8)-j*8);g.stroke()}
 g.fillStyle=rgba(HSC.foam,.9*k);for(let i=0;i<8;i++){const a=i*.785+t,h=Math.sin(Math.PI*Math.min(1,e*1.5))*(14+(i%3)*8)*s;const p=P(f.x+Math.cos(a)*f.r*.7,f.y+Math.sin(a)*f.r*.7,0);g.beginPath();g.ellipse(p.x,p.y-h,2.4*s,3.4*s,0,0,7);g.fill()}};
// gerbe d'eau
JFXD.hs_splash=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,up=Math.sin(Math.PI*Math.min(1,e*1.4));g.strokeStyle=rgba('#bfe8ff',.8*k);g.lineWidth=4*k+1;gEll(f.x,f.y,f.r*(.3+e*.8));g.stroke();
 for(let i=0;i<10;i++){const a=i*.628+.3,d=f.r*(.2+e*.7),p=P(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d,0),h=up*(20+(i%4)*12)*s;g.fillStyle=i%2?rgba('#5ac8e8',.85*k):rgba(HSC.foam,.9*k);g.beginPath();g.ellipse(p.x,p.y-h,3.2*s,4.6*s,0,0,7);g.fill()}};
// bulle de la prison autour de la cible (passe avant : par-dessus le ninja)
JFXD.hs_bubbleT=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,form=Math.min(1,e*f.m/.12),R=34*s*form*(1+Math.sin(t*7)*.03),cy=q.y-34*s;
 const gr=g.createRadialGradient(q.x-R*.3,cy-R*.3,R*.1,q.x,cy,R);gr.addColorStop(0,'rgba(220,245,255,.35)');gr.addColorStop(.7,'rgba(90,200,232,.32)');gr.addColorStop(1,'rgba(40,120,170,.5)');g.fillStyle=gr;g.beginPath();g.ellipse(q.x,cy,R,R*1.12,0,0,7);g.fill();
 g.strokeStyle=rgba('#e8f6ff',.9);g.lineWidth=2;g.beginPath();g.ellipse(q.x,cy,R,R*1.12,0,0,7);g.stroke();g.strokeStyle=rgba('#ffffff',.8);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,cy,R*.78,R*.88,0,3.7,4.5);g.stroke();
 g.fillStyle=rgba('#ffffff',.85);for(let i=0;i<7;i++){const m=(t*.9+i/7)%1,x=q.x+Math.sin(i*2.4+t)*R*.55,y=cy+R*.9-m*R*1.8;g.beginPath();g.arc(x,y,(1.2+(i%3)*.7)*s,0,7);g.fill()}
 g.strokeStyle=rgba(HSC.ck,.55);g.lineWidth=1.5;g.setLineDash([5,5]);g.lineDashOffset=-t*20;g.beginPath();g.ellipse(q.x,cy,R*1.12,R*1.25,0,0,7);g.stroke();g.setLineDash([])};
// armure d'écailles qui se referme
JFXD.hs_scaleUp=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s;for(let i=0;i<12;i++){const a=i*.524+e*3,d=(60-e*40)*s,x=q.x+Math.cos(a)*d,y=q.y-34*s+Math.sin(a)*d*.6;hs_scale(x,y,5*s,a,Math.min(1,k*2))}};
function hs_scale(x,y,z,a,al){g.save();g.translate(x,y);g.rotate(a);g.globalAlpha=al;g.fillStyle=HSC.lt;g.strokeStyle=HSC.ol;g.lineWidth=1;g.beginPath();g.moveTo(-z,z*.4);g.quadraticCurveTo(0,-z*1.4,z,z*.4);g.quadraticCurveTo(0,z*.1,-z,z*.4);g.fill();g.stroke();g.restore()}
// fusion : colonne d'eau qui enveloppe le corps et retombe
JFXD.hs_fuseFx=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s,H=(e<.4?e/.4:1)*110*s,w=(30-e*8)*s;g.globalAlpha=Math.min(1,k*2.5);
 const gr=g.createLinearGradient(0,q.y-H,0,q.y);gr.addColorStop(0,'rgba(90,200,232,0)');gr.addColorStop(.5,'rgba(90,200,232,.45)');gr.addColorStop(1,'rgba(232,246,255,.7)');g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-H/2,w,H/2,0,0,7);g.fill();
 g.strokeStyle=rgba(HSC.foam,.85);g.lineWidth=2.5*s;for(let i=0;i<3;i++){const y=q.y-((t*120+i*36)%110)*s;g.beginPath();g.ellipse(q.x,y,w*.9,w*.3,0,0,7);g.stroke()}g.globalAlpha=1;
 if(e>.5)JFXD.hs_splash({x:f.x,y:f.y,r:70},Math.min(1,(1-e)*2.5),(e-.5)*2,t)};
// nage : aileron qui fend l'eau (suit le ninja), sillage d'écume
JFXD.hs_fin=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s,ra=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),sd=Math.cos(ra)<0?-1:1;
 for(let i=1;i<9;i++){const c=i/9,p=P(lerp(f.x,u.x,c),lerp(f.y,u.y,c),0);g.fillStyle=rgba(HSC.foam,.55*c*k);g.beginPath();g.ellipse(p.x,p.y,(4+c*8)*p.s,(2+c*3)*p.s,ra,0,7);g.fill()}
 g.fillStyle=rgba('#2a6a9a',.5);g.beginPath();g.ellipse(q.x,q.y,26*s,10*s,ra,0,7);g.fill();g.strokeStyle=rgba(HSC.foam,.9);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,26*s,10*s,ra,0,7);g.stroke();
 g.save();g.translate(q.x,q.y);g.scale(sd,1);g.fillStyle=HSC.dk;g.strokeStyle=HSC.ol;g.lineWidth=1.4;g.beginPath();g.moveTo(-12*s,0);g.quadraticCurveTo(-4*s,-10*s,6*s,-26*s);g.quadraticCurveTo(4*s,-12*s,12*s,0);g.closePath();g.fill();g.stroke();g.restore()};
// on jaillit : gerbe circulaire, requin qui claque des mâchoires
JFXD.hs_burst=(f,k,e,t)=>{JFXD.hs_splash(f,k,e,t);if(e<.5){const q=P(f.x,f.y,30+e*60);g.save();g.translate(q.x,q.y);g.scale(q.s,q.s);g.globalAlpha=Math.min(1,(.5-e)*4);hs_sharkD(1.3,-Math.PI/2+(Math.cos(f.a)<0?-.4:.4),t*1000,1-e*2,0,0);g.restore();g.globalAlpha=1}};
// Bakusui : planche d'eau sous les pieds pendant la glisse
JFXD.hs_ride=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s,ra=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));g.fillStyle=rgba('#4aa8d8',.7*k);g.beginPath();g.ellipse(q.x,q.y,30*s,11*s,ra,0,7);g.fill();
 g.strokeStyle=rgba(HSC.foam,.9*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-3*s,30*s,11*s,ra,Math.PI*.1,Math.PI*.9);g.stroke();
 for(let i=0;i<6;i++){const m=(t*3+i/6)%1,p=P(u.x-Math.cos(f.a)*m*70,u.y-Math.sin(f.a)*m*70,m*16);g.fillStyle=rgba(HSC.foam,(1-m)*k);g.beginPath();g.arc(p.x+(i%2?6:-6)*s,p.y,(3+m*4)*s,0,7);g.fill()}};
// Daikôdan : le requin géant tient la cible dans sa gueule
JFXD.hs_jaws=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,0),s=q.s,rise=Math.min(1,e*f.m/.15);
 g.fillStyle=rgba('#2a6a9a',.5);g.beginPath();g.ellipse(q.x,q.y,58*s,20*s,0,0,7);g.fill();g.strokeStyle=rgba(HSC.foam,.85);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,(50+Math.sin(t*8)*4)*s,(17+Math.sin(t*8)*2)*s,0,0,7);g.stroke();
 g.save();g.translate(q.x,q.y-30*s*rise);g.scale(s*2.6,s*2.6);g.globalAlpha=.92;hs_sharkD(1,-Math.PI/2+(Math.cos(f.a)<0?-.35:.35),t*1000,.15,0,1);g.restore();g.globalAlpha=1;
 g.fillStyle=rgba(HSC.ck,.8);for(let i=0;i<5;i++){const m=(t*1.6+i/5)%1;g.beginPath();g.arc(q.x+Math.sin(i*2.1)*20*s,q.y-(20+m*60)*s,2.2*s,0,7);g.fill()}};
// recraché : la gueule s'ouvre, gerbe et onde
JFXD.hs_spit=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s;JFXD.hs_splash(f,k,e,t);g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=5*k;gEll(f.x,f.y,f.r*(.2+e));g.stroke();
 if(e<.45){g.save();g.translate(q.x,q.y-(40+e*80)*s);g.scale(s*2.4,s*2.4);g.globalAlpha=1-e/.45;hs_sharkD(1,-Math.PI/2+(Math.cos(f.a)<0?-.6:.6),t*1000,1,0,1);g.restore();g.globalAlpha=1}};
// mer des requins : la mer jaillit autour du lanceur
JFXD.hs_rise=(f,k,e,t)=>{const s=P(f.x,f.y,0).s;for(let i=0;i<14;i++){const a=i*.449,p=P(f.x+Math.cos(a)*f.r*.95,f.y+Math.sin(a)*f.r*.95,0),h=Math.sin(Math.PI*Math.min(1,e*1.3))*(50+(i%3)*25)*s;
  g.fillStyle=rgba(i%2?'#4aa8d8':HSC.foam,.8*k);g.beginPath();g.moveTo(p.x-7*s,p.y);g.quadraticCurveTo(p.x,p.y-h*1.3,p.x+7*s,p.y);g.fill()}
 g.strokeStyle=rgba('#bfe8ff',.8*k);g.lineWidth=5*k;gEll(f.x,f.y,f.r*(.2+e*.8));g.stroke()};
// requin qui bondit de l'eau sur la cible
JFXD.hs_leap=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,b=f.a+Math.PI,sx=o.x+Math.cos(b)*70,sy=o.y+Math.sin(b)*70,m=Math.min(1,e*1.4),x=lerp(sx,o.x,m),y=lerp(sy,o.y,m),z=Math.sin(Math.PI*m)*55+10,q=P(x,y,z);
 if(m<1){g.save();g.translate(q.x,q.y);g.scale(q.s*1.1,q.s*1.1);hs_sharkD(1,Math.atan2(Math.sin(f.a)*K-(1-2*m)*1.2,Math.cos(f.a)),t*1000,m>.6?1:.4,0,0);g.restore()}
 const p0=P(sx,sy,0);g.strokeStyle=rgba(HSC.foam,.8*k);g.lineWidth=2;g.beginPath();g.ellipse(p0.x,p0.y,(10+e*18)*p0.s,(4+e*6)*p0.s,0,0,7);g.stroke();
 if(e>.65)JFXD.hs_chomp({x:o.x,y:o.y,a:f.a,s:.8},Math.min(1,k*3),(e-.65)/.35,t,null,tg)};
// mer des requins (au sol) : eau sombre, vagues, ailerons qui tournent
AUXD.hs_sea=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba('#1e4a6e',.38*k);gEll(x.x,x.y,x.r);g.fill();g.fillStyle=rgba('#2a6a9a',.3*k);gEll(x.x,x.y,x.r*.7);g.fill();
 g.strokeStyle=rgba(HSC.foam,.75*k);g.lineWidth=3;gEll(x.x,x.y,x.r);g.stroke();g.strokeStyle=rgba('#9fe0ff',.45*k);g.lineWidth=1.6;for(let j=0;j<3;j++){const r=x.r*(.3+((t*.25+j/3)%1)*.65);gEll(x.x,x.y,r);g.stroke()}
 g.fillStyle=rgba(HSC.foam,.8*k);for(let i=0;i<14;i++){const a=i*.449+t*.6,p=P(x.x+Math.cos(a)*x.r,x.y+Math.sin(a)*x.r,2+Math.sin(t*4+i)*3);g.beginPath();g.ellipse(p.x,p.y,4*p.s,2*p.s,0,0,7);g.fill()}
 for(let i=0;i<3;i++){const a=t*(1.1+i*.15)*(i%2?-1:1)+i*2.1,r=x.r*(.45+i*.16),p=P(x.x+Math.cos(a)*r,x.y+Math.sin(a)*r,0),s=p.s,sd=(i%2?-1:1)*(Math.sin(a)>0?-1:1);
  g.fillStyle=rgba(HSC.foam,.6*k);g.beginPath();g.ellipse(p.x,p.y,16*s,5*s,0,0,7);g.fill();g.save();g.translate(p.x,p.y);g.scale(sd,1);g.globalAlpha=k;g.fillStyle=HSC.dk;g.strokeStyle=HSC.ol;g.lineWidth=1.2;
  g.beginPath();g.moveTo(-9*s,0);g.quadraticCurveTo(-3*s,-8*s,5*s,-19*s);g.quadraticCurveTo(3*s,-9*s,9*s,0);g.closePath();g.fill();g.stroke();g.restore();g.globalAlpha=1}};
// états visibles : écailles, fusion (aileron dorsal, branchies lumineuses, aura d'eau), proie (aileron rouge au-dessus de la tête)
let HS_HUNT={t:-1,m:[0,0]}; // équipes qui ont un Hoshigaki vivant en face (recalculé 4 fois par seconde)
STATD.push((u,p,S,sk)=>{const t=performance.now()/1000;sk=sk||1;
 if(u.hs_scl>0){const cy=p.y-30*S*sk,rx=21*S*sk,ry=31*S*sk,al=Math.min(1,u.hs_scl*2);for(let i=0;i<14;i++){const a=i*.449+t*.4;if(Math.sin(a)<-.2)continue;hs_scale(p.x+Math.cos(a)*rx,cy+((i*29)%54-27)/27*ry*.8,4.6*S,Math.cos(a)*.6,.85*al)}
  g.strokeStyle=rgba(HSC.lt,.5*al);g.lineWidth=2;g.beginPath();g.ellipse(p.x,cy,rx*1.05,ry,0,0,7);g.stroke()}
 if(u.hs_fus>0){const al=Math.min(1,u.hs_fus*2),cy=p.y-38*S*sk,bk=Math.cos(u.aim||0)>0?-1:1;g.save();g.globalAlpha=al;
  g.fillStyle=rgba('#5ac8e8',.18);g.beginPath();g.ellipse(p.x,cy,26*S*sk,40*S*sk,0,0,7);g.fill();
  g.fillStyle=HSC.dk;g.strokeStyle=HSC.ol;g.lineWidth=1.5;g.beginPath();g.moveTo(p.x+bk*4*S,cy-6*S*sk);g.quadraticCurveTo(p.x+bk*14*S,cy-22*S*sk,p.x+bk*30*S,cy-30*S*sk);g.quadraticCurveTo(p.x+bk*20*S,cy-8*S*sk,p.x+bk*18*S,cy+4*S*sk);g.closePath();g.fill();g.stroke(); // aileron dorsal
  g.beginPath();g.moveTo(p.x+bk*8*S,p.y-12*S);g.lineTo(p.x+bk*24*S,p.y-22*S+Math.sin(t*9)*3*S);g.lineTo(p.x+bk*18*S,p.y-10*S);g.lineTo(p.x+bk*26*S,p.y+Math.sin(t*9)*3*S);g.closePath();g.fill();g.stroke(); // queue
  g.strokeStyle=rgba(HSC.ck,.6+.3*Math.sin(t*6));g.lineWidth=1.6*S;for(let i=0;i<3;i++){g.beginPath();g.moveTo(p.x-bk*(6+i*3)*S,cy-26*S*sk);g.lineTo(p.x-bk*(5+i*3)*S,cy-20*S*sk);g.stroke()}
  g.fillStyle=rgba(HSC.foam,.85);for(let i=0;i<5;i++){const m=(t*1.2+i/5)%1;g.beginPath();g.arc(p.x+Math.sin(i*2.3+t)*16*S,p.y-m*70*S*sk,(1.4+m)*S,0,7);g.fill()}g.restore()}
 const now=performance.now();if(now-HS_HUNT.t>250){HS_HUNT.t=now;HS_HUNT.m[0]=HS_HUNT.m[1]=0;for(const x of units)if(!x.dead&&x.ch&&x.ch.clan===18)HS_HUNT.m[x.team?1:0]=1}
 if(!u.dead&&(u.energy||0)<HS_PREY&&HS_HUNT.m[u.team?0:1]){const y=p.y-96*S*sk+Math.sin(t*3)*2*S,x=p.x+Math.sin(t*1.7)*5*S;g.save();g.fillStyle='#c83a4a';g.strokeStyle='#2a0a10';g.lineWidth=1.4;
  g.beginPath();g.moveTo(x-8*S,y);g.quadraticCurveTo(x-2*S,y-6*S,x+2*S,y-14*S);g.quadraticCurveTo(x+3*S,y-6*S,x+8*S,y);g.closePath();g.fill();g.stroke();
  g.strokeStyle=rgba('#ff9aa8',.7);g.lineWidth=1.5;g.beginPath();g.moveTo(x-12*S,y+1*S);g.quadraticCurveTo(x-6*S,y-2*S,x,y+1*S);g.quadraticCurveTo(x+6*S,y+4*S,x+12*S,y+1*S);g.stroke();g.restore()}});
