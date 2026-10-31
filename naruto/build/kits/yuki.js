// ===== Clan Yuki (c20, préfixe yu_) : Hyôton, la glace (Haku) =====
// Identité : le contrôleur qui gèle. Chaque coup de glace pose du GIVRE (trait) ; à 4 givres, l'ennemi est GELÉ (entravé, fragile).
// Senbon, hirondelles de neige, aiguilles d'eau gelée, lances et pics de glace ; miroirs qui renvoient les tirs et qu'on traverse ;
// ultimes : Blizzard (zone qui suit le lanceur) et Makyô Hyôshô (dôme de miroirs : on saute de miroir en miroir et on crible de senbon).
// Combo signature : Hirondelles / Dragon posent le givre → la Lance cloue une cible déjà givrée → le gel la rend fragile (+20 %).
const YU_D={
 swallow:'5 hirondelles de neige en éventail se rejoignent au point visé : 4 dégâts chacune et 1 givre (2 max par cible)',
 needles:'Des aiguilles d\'eau gelée encerclent la zone et se referment après 0,65 s : 18 dégâts, 2 givres, ralentit 1 s',
 lance:'Lance de glace perçante : 24 dégâts, 1 givre, ralentit 1 s ; une cible qui avait déjà 2 givres est clouée 0,5 s',
 spikes:'Des pics de glace jaillissent du sol en ligne : 20 dégâts, 1 givre, ralentit 1,2 s ; les pics restent 1,5 s et ralentissent',
 mirror:'Un miroir de glace se dresse devant toi 2,5 s : il renvoie les projectiles ennemis vers leur lanceur, puis éclate (10 dégâts et 1 givre devant lui)',
 dragon:'Dragon de glace en ligne : 30 dégâts et 2 givres au premier touché, puis il éclate (12 dégâts, 1 givre et ralentit autour)',
 slide:'Tu glisses vers le curseur à travers les ennemis (8 dégâts, ralentit) ; ta piste de glace (3 s) ralentit les ennemis (1 givre au premier passage) et t\'accélère',
 step:'Tu traverses un miroir jusqu\'au curseur (260 max), ou jusqu\'à ton Miroir de glace (560 max) s\'il est près du curseur ; intangible 0,2 s ; un petit miroir (1,5 s) reste derrière toi',
 bliz:'Un blizzard t\'entoure 4 s et te porte (plus rapide) : ennemis ralentis, 8 dégâts et 1 givre toutes les 0,8 s ; à la fin, tout gèle (18 dégâts, 1 givre)',
 makyo:'Dôme de 8 miroirs (3,6 s) qui enferme les ennemis (un déplacement en sort) : tu sautes de miroir en miroir et cribles de senbon (2 × 3 dégâts par saut, 1 givre), −40 % de dégâts subis ; à la fin, les miroirs éclatent (10)'};
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c20',[
 [1,'D','x.yu_swallow','Hyôton : Tsubame Fubuki',YU_D.swallow,'yu_ice'],
 [2,'C','x.yu_slide','Glissade de glace',YU_D.slide,'yu_ice'],
 [3,'C','x.yu_needles','Hyôton : Sensatsu Suishô',YU_D.needles,'yu_ice'],
 [4,'B','x.yu_mirror','Miroir de glace',YU_D.mirror,'yu_ice'],
 [5,'S','x.yu_makyo','Makyô Hyôshô',YU_D.makyo,'yu_ice'],
 [1,'B','x.yu_lance','Hyôton : Lance de glace',YU_D.lance,'yu_ice'],
 [3,'B','x.yu_spikes','Hyôton : Pics de glace',YU_D.spikes,'yu_ice'],
 [4,'A','x.yu_dragon','Hyôton : Dragon de glace',YU_D.dragon,'yu_ice'],
 [2,'B','x.yu_step','Pas du miroir',YU_D.step,'yu_ice'],
 [5,'A','x.yu_blizzard','Hyôton : Blizzard',YU_D.bliz,'yu_ice'],
]);
// style de combat propre : les senbon de Haku (seul style du clan : un Yuki se bat à distance)
STYLES.push(['Frappes de glace','Paumes et lames de glace ; 3e coup : taille gelée qui ralentit ; 5e : la glace éclate devant toi et pose 1 givre (en plus du givre du trait, 1 tous les 3 coups)','x.yu_style','senbon','ice',[20],1.12,1.07]);

// ---- aides
const YUC={ice:'#bfe6ff',lt:'#e8f8ff',md:'#7fc8f0',dk:'#3a78a8',deep:'#1a3a5a',ol:'#16324a',wh:'#ffffff'};
const YU_GMAX=4,YU_FRZ=.8,YU_FRG=1.5,YU_IMM=4,YU_DEC=4; // givres pour geler, gel (entravé), fragile, insensible ensuite, fonte du givre
const yu_i=u=>units.indexOf(u);
function yu_S(k,u){const V=VFX;VFX=null;S(k,u);VFX=V} // son brut
function yu_hit(e,u,d,o,v){const V=VFX;VFX=v||'yu_ice';const r=hit(e,u,d,o||{});VFX=V;return r} // coup de glace (éclats bleus)
// état de givre d'un ninja : un objet aux de l'hôte par cible (le compte, la fonte, le gel, l'insensibilité)
function yu_gx(t){for(const x of aux)if(x.type==='yu_gx'&&x.tg===t&&!x.done)return x;return null}
// pose n givres sur t ; à 4 : gel (entravé 0,8 s, fragile 1,5 s), puis insensible 4 s. Renvoie 1 si le givre a pris
function yu_frost(src,t,n){if(!src||!t||t.dead||t.team===src.team||!(n>0))return 0;
 let x=yu_gx(t);if(!x){x={type:'yu_gx',x:t.x,y:t.y,r:0,t:1,m:1,team:src.team,owner:src,tg:t,ti:yu_i(t),gv:0,dec:0,fz:0,fg:0,im:0};aux.push(x)}
 if(x.im>0||t.phase>0)return 0;x.owner=src;x.gv=Math.min(YU_GMAX,x.gv+n);x.dec=YU_DEC;t.yu_gv=x.gv;
 if(x.gv>=YU_GMAX){x.gv=0;x.fz=YU_FRZ;x.fg=YU_FRG;x.im=YU_IMM+YU_FRZ;t.yu_gv=0;t.yu_frz=YU_FRZ;
  if(t.unstop<=0){t.root=Math.max(t.root,YU_FRZ);t.rootV=null;if(t.dash&&!t.dash.jump)t.dash=null}
  say(t,'GELÉ !','#bfe6ff');jx({jfx:'yu_freeze',ti:yu_i(t),x:t.x,y:t.y,t:.6,m:.6});if(near(t.x,t.y)){yu_S('rock',t);yu_S('deflect',t);sparks(t.x,t.y,YUC.ice,14,'yu_ice')}}
 return 1}
AUXF.yu_gx=(x,dt)=>{const t=x.tg;if(x.done)return;if(!t||t.dead||units.indexOf(t)<0){x.done=1;x.t=0;if(t){t.yu_gv=0;t.yu_frz=0;t.yu_fg=0}return}
 x.x=t.x;x.y=t.y;if(x.dec>0){x.dec-=dt;if(x.dec<=0)x.gv=0}
 if(x.fz>0)x.fz=Math.max(0,x.fz-dt);if(x.fg>0)x.fg=Math.max(0,x.fg-dt);if(x.im>0)x.im=Math.max(0,x.im-dt);
 t.yu_gv=x.gv;t.yu_frz=x.fz;t.yu_fg=x.fg;if(x.gv>=2&&t.unstop<=0&&!(t.slowImm>0))t.slow=Math.max(t.slow,.12); // engourdi par le givre
 if(!x.gv&&!x.fz&&!x.fg&&!x.im){x.done=1;x.t=0}else x.t=1};
AUXD.yu_gx=()=>{};
// pilote d'un projectile : f(x,p,dt,fin) à chaque image tant qu'il vole, puis une fois à sa disparition
function yu_pilot(u,f){const p=projs[projs.length-1];aux.push({type:'yu_pc',x:p.x,y:p.y,r:0,t:p.life+1,m:p.life+1,team:u.team,owner:u,p,f});return p}
AUXF.yu_pc=(x,dt)=>{const p=x.p;if(!p||x.done){x.t=0;return}x.x=p.x;x.y=p.y;if(p.dead||!projs.includes(p)){x.done=1;x.t=0;x.f(x,p,dt,1)}else{x.t=Math.max(x.t,.5);x.f(x,p,dt,0)}};
AUXD.yu_pc=()=>{};
// éclatement de glace : dégâts, givre et ralentissement autour (sauf la cible déjà frappée)
function yu_burst(o,x,y,skip,R,d){if(!o)return;for(const e of enemies(o))if(e!==skip&&Math.hypot(e.x-x,e.y-y)<R+e.r&&yu_hit(e,o,d,{slow:.8,fx:x,fy:y,unblockable:1}))yu_frost(o,e,1);
 jx({jfx:'yu_shatter',x,y,r:R,t:.6,m:.6});if(near(x,y)){yu_S('rock',o);sparks(x,y,YUC.ice,16,'yu_ice');shake=Math.max(shake,.15)}}
// les miroirs de glace du lanceur (pour le Pas du miroir)
const yu_mirs=u=>aux.filter(x=>x.type==='yu_mir'&&x.owner===u&&x.t>.15);

Object.assign(NAT,{
 // ---------- style (corps à corps) : Frappes de glace (3e coup : ralentit ; 5e : éclats de glace, 1 givre) ----------
 yu_style:SP('Frappes de glace','',.38,{hero:'rey',melee:1,ai:{max:100,p:1}},(u,a)=>{const c=stC(u),T=[0,[84,1.7,10,.38],[84,1.7,10,.38],[92,2.2,11,.44],[86,1.6,11,.44],[104,1.8,13,.62]][c],M=YUC.md;
  stMelee(u,a,T[0],T[1],T[2],c===3?{slow:.5}:{},[0,{jfx:'st_line',off:-6,z:36,c:M},{jfx:'st_line',off:6,z:36,c:M},{d:-1,z:26,th:11,c:YUC.lt,c2:M,fl:'ice'},{d:1,tl:1.45,z:30,th:11,c:YUC.lt,c2:M,fl:'ice',rr:.6},{d:-1,tl:.4,z:30,th:13,c:YUC.lt,c2:YUC.dk,fl:'ice',rr:.75}][c],e=>{
   if(near(e.x,e.y))sparks(e.x,e.y,YUC.ice,5,'yu_ice');if(c===5)yu_frost(u,e,1)});
  if(c===5){const p=fwd(u,a,T[0]*.7);jx({jfx:'yu_shatter',x:p.x,y:p.y,r:46,t:.6,m:.6});yu_S('rock',u)}
  stCd(u,T[3]);anim(u,'st_ice'+c,c===5?.34:.28)}),
 // ---------- Tsubame Fubuki (D) : 5 hirondelles de neige qui convergent vers le point visé ----------
 yu_swallow:SP('Hyôton : Tsubame Fubuki',YU_D.swallow,6,{ai:RG(460,.7),line:{len:460,w:90}},(u,a,td)=>{const c=atP(u,a,td,460),D=new Map(),ps=[];yu_S('wind',u);yu_S('blaster',u);anim(u,'yu_sweep',.45);
  jx({jfx:'yu_gust',ui:yu_i(u),x:u.x,y:u.y,a,t:.45,m:.45});
  for(let i=0;i<5;i++){proj(u,a+(i-2)*.3,{spd:560,r:7,dmg:4,life:1,col:YUC.ice,kind:'yu_swl',onHit:(p,t)=>{const n=(D.get(t)||0)+1;D.set(t,n);if(n<=2)yu_frost(p.owner,t,1)}});ps.push(projs[projs.length-1])}
  aux.push({type:'yu_swl',x:c.x,y:c.y,r:0,t:1.2,m:1.2,team:u.team,owner:u,ps,tx:c.x,ty:c.y})}),
 // ---------- Sensatsu Suishô (C) : les aiguilles encerclent la zone puis se referment ----------
 yu_needles:SP('Hyôton : Sensatsu Suishô',YU_D.needles,9,{tele:{r:80,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=atP(u,a,td,420),R=80,D=.65;yu_S('water',u);anim(u,'yu_seal',.55);
  jx({jfx:'yu_needles',x:p.x,y:p.y,r:R,d:D,t:D+.35,m:D+.35});
  later(u,D,()=>{let n=0;for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<R+e.r&&yu_hit(e,u,18,{slow:1,unblockable:1,fx:p.x,fy:p.y})){n++;yu_frost(u,e,2)}
   if(near(p.x,p.y)){yu_S('blaster',u);yu_S('deflect',u);sparks(p.x,p.y,YUC.lt,n?16:8,'yu_ice');if(n)shake=Math.max(shake,.1)}},{x:p.x,y:p.y,r:R})}),
 // ---------- Lance de glace (B) : perçante ; cloue une cible déjà givrée (2 givres ou plus) ----------
 yu_lance:SP('Hyôton : Lance de glace',YU_D.lance,10,{ai:RG(540,.6),line:{len:560,w:24}},(u,a)=>{yu_S('rock',u);yu_S('blaster',u);anim(u,'yu_javelin',.5);jx({jfx:'yu_forge',ui:yu_i(u),x:u.x,y:u.y,a,t:.3,m:.3});
  proj(u,a,{spd:980,r:10,dmg:24,life:.58,col:YUC.md,kind:'yu_lance',pierce:1,o:{slow:1},onHit:(p,t)=>{if(t.dead)return;const pre=t.yu_gv|0,o=p.owner;yu_frost(o,t,1);
   if(pre>=2&&!t.dead&&t.unstop<=0){t.root=Math.max(t.root,.5);t.rootV=null;say(t,'CLOUÉ','#bfe6ff');jx({jfx:'yu_pin',ti:yu_i(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.55,m:.55})}
   if(near(t.x,t.y)){sparks(t.x,t.y,YUC.ice,8,'yu_ice');yu_S('rock',t)}}})}),
 // ---------- Pics de glace (B) : les pics jaillissent du sol en ligne (logique : AUXF.yu_spk) ----------
 yu_spikes:SP('Hyôton : Pics de glace',YU_D.spikes,11,{ai:RG(400,.6),line:{len:400,w:60}},(u,a)=>{yu_S('rock',u);yu_S('heavy',u);anim(u,'yu_stomp',.55);
  aux.push({type:'yu_spk',x:u.x+Math.cos(a)*18,y:u.y+Math.sin(a)*18,a,len:400,w:60,r:0,t:1.85,m:1.85,team:u.team,owner:u,vfx:'yu_ice',k:0,hs:new Set()});if(near(u.x,u.y))shake=Math.max(shake,.12)}),
 // ---------- Miroir de glace (B) : renvoie les projectiles ennemis (logique : AUXF.yu_mir) ----------
 yu_mirror:SP('Miroir de glace',YU_D.mirror,14,{ai:DEF},(u,a)=>{const p=fwd(u,a,44);yu_S('deflect',u);yu_S('water',u);anim(u,'yu_mirror',.55);
  aux.push({type:'yu_mir',x:p.x,y:p.y,a,len:86,w:74,r:0,t:2.5,m:2.5,team:u.team,owner:u,vfx:'yu_ice',k:0,big:1});jx({jfx:'yu_flash',x:p.x,y:p.y,a,t:.4,m:.4})}),
 // ---------- Dragon de glace (A) : gros projectile, éclate au premier touché ou en bout de course ----------
 yu_dragon:SP('Hyôton : Dragon de glace',YU_D.dragon,13,{ai:RG(500,.6),line:{len:520,w:48}},(u,a)=>{yu_S('roar',u);yu_S('wind',u);anim(u,'yu_thrust',.6);jx({jfx:'yu_gust',ui:yu_i(u),x:u.x,y:u.y,a,big:1,t:.55,m:.55});
  proj(u,a,{spd:500,r:20,dmg:30,life:1.04,col:YUC.ice,kind:'yu_dragon',vfx:'yu_ice',onHit:(p,t)=>{p.yu_b=1;yu_frost(p.owner,t,2);yu_burst(p.owner,p.x,p.y,t,90,12)}});
  yu_pilot(u,(x,p,dt,end)=>{if(end&&!p.yu_b)yu_burst(p.owner,p.x,p.y,null,90,12)})}),
 // ---------- Glissade de glace (C, déplacement) : glisse et laisse une piste qui ralentit et givre ----------
 yu_slide:SP('Glissade de glace',YU_D.slide,8,{ai:ESC},(u,a,td)=>{const d=clamp(td||240,110,250),D=.3;yu_S('dash',u);yu_S('water',u);anim(u,'yu_skate',D+.12);
  const x0=u.x,y0=u.y,tx=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r),ty=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r),L=Math.hypot(tx-x0,ty-y0);
  aux.push({type:'yu_trail',x:x0,y:y0,a:Math.atan2(ty-y0,tx-x0),len:Math.max(30,L),w:52,r:0,t:3,m:3,team:u.team,owner:u,vfx:'yu_ice',k:0,hs:new Set()});
  dash(u,a,d,D,{dmg:8,through:1,end:()=>{if(!u.dead&&near(u.x,u.y))sparks(u.x,u.y,YUC.lt,10,'yu_ice')}})}),
 // ---------- Pas du miroir (B, déplacement) : on traverse un miroir ; un petit miroir reste derrière ----------
 yu_step:SP('Pas du miroir',YU_D.step,12,{ai:ESC},(u,a,td)=>{const R=260,c=fwd(u,a,Math.min(td||R,560));let p=fwd(u,a,clamp(td||R,80,R)),via=null;
  for(const x of yu_mirs(u))if(Math.hypot(x.x-c.x,x.y-c.y)<130&&Math.hypot(x.x-u.x,x.y-u.y)<560){via=x;break}
  if(via)p={x:via.x-Math.cos(via.a)*30,y:via.y-Math.sin(via.a)*30}; // on ressort du miroir, côté lanceur
  const x0=u.x,y0=u.y;yu_S('deflect',u);yu_S('poof',u);anim(u,'yu_seal',.35);
  aux.push({type:'yu_mir',x:x0-Math.cos(a)*12,y:y0-Math.sin(a)*12,a:a+Math.PI,len:56,w:60,r:0,t:1.5,m:1.5,team:u.team,owner:u,vfx:'yu_ice',k:0});
  u.dash=null;u.kx=u.ky=0;u.phase=Math.max(u.phase||0,.2);u.x=clamp(p.x,B.x+u.r,B.x+B.w-u.r);u.y=clamp(p.y,B.y+u.r,B.y+B.h-u.r);collide(u);
  jx({jfx:'yu_hop',x:x0,y:y0,x2:u.x,y2:u.y,t:.4,m:.4});jx({jfx:'yu_flash',x:u.x,y:u.y,a,t:.4,m:.4});if(near(u.x,u.y))sparks(u.x,u.y,YUC.lt,10,'yu_ice')}),
 // ---------- Blizzard (A, ultime) : la tempête suit le lanceur (logique : AUXF.yu_bliz) ----------
 yu_blizzard:ULT('Hyôton : Blizzard',YU_D.bliz,{tele:{self:1,r:170},ai:SELF(220,.8)},(u)=>{yu_S('wind',u);yu_S('heavy',u);anim(u,'yu_storm',.8);u.slowImm=Math.max(u.slowImm||0,4);u.slow=0;u.haste=Math.max(u.haste||0,4);
  aux.push({type:'yu_bliz',x:u.x,y:u.y,r:170,t:4,m:4,team:u.team,owner:u,ui:yu_i(u),vfx:'yu_ice',k:.8,n:0});jx({jfx:'shock',x:u.x,y:u.y,r:170,t:.5,m:.5,col:YUC.lt});if(near(u.x,u.y))shake=Math.max(shake,.2)}),
 // ---------- Makyô Hyôshô (S, ultime) : dôme de miroirs (logique : AUXF.yu_dome) ----------
 yu_makyo:ULT('Makyô Hyôshô',YU_D.makyo,{tele:{r:150,max:300},ai:{max:300,p:.85}},(u,a,td)=>{const c=atP(u,a,td,300),R=150,N=8,D=3.6;
  c.x=clamp(c.x,B.x+R+10,B.x+B.w-R-10);c.y=clamp(c.y,B.y+R+10,B.y+B.h-R-10);const a0=Math.atan2(u.y-c.y,u.x-c.x),tr=new Set();
  for(const e of enemies(u))if(Math.hypot(e.x-c.x,e.y-c.y)<R+e.r)tr.add(e);
  yu_S('deflect',u);yu_S('heavy',u);yu_S('water',u);anim(u,'yu_makyo',.7);u.yu_mk=D;
  const x={type:'yu_dome',x:c.x,y:c.y,r:R,t:D,m:D,team:u.team,owner:u,ui:yu_i(u),vfx:'yu_ice',k:0,n:N,a:a0,tr,hop:.42,cur:0};aux.push(x);
  jx({jfx:'yu_domeF',ui:yu_i(u),x:c.x,y:c.y,r:R,a:a0,n:N,t:D,m:D});jx({jfx:'yu_hop',x:u.x,y:u.y,x2:c.x+Math.cos(a0)*R,y2:c.y+Math.sin(a0)*R,t:.35,m:.35});
  u.dash=null;u.x=c.x+Math.cos(a0)*R;u.y=c.y+Math.sin(a0)*R;u.kx=u.ky=0;if(near(c.x,c.y))shake=Math.max(shake,.25);for(const e of tr)say(e,'ENFERMÉ','#bfe6ff')}),
});
Object.assign(NATHERO,{yu:'sister'}); // stats de référence : un ninja vif et agile (réglé par duels simulés)

// ---- logique des objets
// hirondelles : chacune vire vers le point visé (5 rad/s) jusqu'à l'atteindre, puis file tout droit (elles se croisent)
AUXF.yu_swl=(x,dt)=>{let alive=0;for(const p of x.ps){if(p.dead||p.life<=0||!projs.includes(p))continue;alive++;if(p.yu_ok)continue;const d=Math.hypot(x.tx-p.x,x.ty-p.y);if(d<34){p.yu_ok=1;continue}
  const h=Math.atan2(p.vy,p.vx);let df=Math.atan2(x.ty-p.y,x.tx-p.x)-h;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;const na=h+clamp(df,-5*dt,5*dt),sp=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp}
 x.t=alive?1:0};
AUXD.yu_swl=()=>{};
// pics : le front avance (0,32 s pour toute la ligne) ; chaque ennemi touché une fois ; ensuite les pics ralentissent qui y reste
AUXF.yu_spk=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;const el=x.m-x.t,front=Math.min(x.len,el/.32*x.len),ca=Math.cos(x.a),sa=Math.sin(x.a),stay=x.t>.3;
 for(const e of enemies(o)){const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f<-e.r||f>front+e.r||s>x.w/2+e.r)continue;
  if(!x.hs.has(e)){x.hs.add(e);if(yu_hit(e,o,20,{slow:1.2,unblockable:1})){yu_frost(o,e,1);if(near(e.x,e.y)){sparks(e.x,e.y,YUC.ice,10,'yu_ice');yu_S('rock',e)}}}
  else if(stay&&front>=x.len&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.3)}};
// miroir : renvoie les projectiles ennemis qui le touchent (rebond sur sa face, ×1,1) ; grappins et échanges se brisent dessus
AUXF.yu_mir=(x,dt)=>{if(x.t<=0){if(x.big&&!x.done){x.done=1;const o=x.owner;if(o&&!o.dead)yu_burst(o,x.x+Math.cos(x.a)*30,x.y+Math.sin(x.a)*30,null,70,10)}return}const nx=Math.cos(x.a),ny=Math.sin(x.a),tx=-ny,ty=nx,L=x.len/2;
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team)continue;
  const dx=p.x-x.x,dy=p.y-x.y,dn=dx*nx+dy*ny,dl=dx*tx+dy*ty,vn=p.vx*nx+p.vy*ny;if(Math.abs(dl)>L+p.r||vn*dn>=0)continue; // à côté, ou s'éloigne déjà du miroir
  if(Math.abs(dn)>p.r+12&&Math.abs(dn)>Math.abs(vn)*dt+p.r)continue; // pas encore au contact (un tir rapide qui traverserait le miroir pendant cette image est renvoyé)
  if(p.hook||p.anchor||p.swap||p.drag){p.life=0;if(near(p.x,p.y))sparks(p.x,p.y,YUC.lt,8,'yu_ice');continue}
  p.vx=(p.vx-2*vn*nx)*1.1;p.vy=(p.vy-2*vn*ny)*1.1;p.owner=x.owner;p.hitSet=null;p.home=0;p.steer=0;p.life=Math.max(p.life,.6);
  const sd=dn>=0?1:-1;p.x=x.x+nx*sd*(p.r+14)+tx*dl;p.y=x.y+ny*sd*(p.r+14)+ty*dl;
  if(near(p.x,p.y)){jx({jfx:'yu_ting',x:p.x,y:p.y,a:x.a,t:.35,m:.35});sparks(p.x,p.y,YUC.lt,8,'yu_ice');yu_S('deflect',x.owner);if(!(SIMT<(x.sayT||0))){x.sayT=SIMT+.6;say(x.owner,'RENVOI !','#bfe6ff')}}}};
// piste de glace : ralentit les ennemis qui la foulent (1 givre au premier passage) et accélère le lanceur
AUXF.yu_trail=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;const ca=Math.cos(x.a),sa=Math.sin(x.a);
 {const dx=o.x-x.x,dy=o.y-x.y,f=dx*ca+dy*sa;if(!o.dead&&f>-o.r&&f<x.len+o.r&&Math.abs(-dx*sa+dy*ca)<x.w/2+o.r)o.haste=Math.max(o.haste||0,.2)} // le lanceur file sur sa glace
 for(const e of enemies(o)){if(e.dash&&e.dash.jump)continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f<-e.r*.5||f>x.len+e.r*.5||s>x.w/2+e.r*.5)continue;
  if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.3);if(!x.hs.has(e)){x.hs.add(e);if(yu_frost(o,e,1)&&near(e.x,e.y))sparks(e.x,e.y,YUC.lt,6,'yu_ice')}}};
// blizzard : suit le lanceur ; ralentit ; toutes les 0,8 s : 8 dégâts et 1 givre ; à la fin, tout gèle (18 dégâts, 1 givre)
AUXF.yu_bliz=(x,dt)=>{const o=x.owner;if(x.done)return;if(!o||o.dead){x.done=1;x.t=0;return}x.x=o.x;x.y=o.y;const ins=e=>Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r;
 if(x.t<=0){x.done=1;let n=0;for(const e of enemies(o))if(ins(e)&&yu_hit(e,o,18,{slow:1,unblockable:1})){n++;yu_frost(o,e,1)}
  jx({jfx:'yu_shatter',x:x.x,y:x.y,r:x.r,big:1,t:.8,m:.8});if(near(x.x,x.y)){yu_S('rock',o);yu_S('boom',o);shake=Math.max(shake,n?.3:.15)}return}
 for(const e of enemies(o))if(ins(e)&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.3);
 if(x.k<=0){x.k+=.8;for(const e of enemies(o))if(ins(e)&&yu_hit(e,o,8,{}))yu_frost(o,e,1);if(near(x.x,x.y))yu_S('wind',o)}};
// Makyô : enferme les ennemis pris dedans (un déplacement en sort), tient le lanceur dans ses miroirs ; un saut toutes les 0,38 s
const yu_mpos=(x,i)=>{const b=x.a+i*Math.PI*2/x.n;return{x:x.x+Math.cos(b)*x.r,y:x.y+Math.sin(b)*x.r}};
AUXF.yu_dome=(x,dt)=>{const o=x.owner;if(x.done)return;
 if(x.t<=0||!o||o.dead){x.done=1;x.t=0;if(!o)return;
  o.yu_mk=0; // le maintien (entravé, silence, désarmé : 0,1 s renouvelé) s'arrête de lui-même
  for(const e of x.tr)if(!e.dead&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+30&&yu_hit(e,o,10,{unblockable:1,fx:x.x,fy:x.y}))yu_frost(o,e,1);
  for(let i=0;i<x.n;i++){const m=yu_mpos(x,i);jx({jfx:'yu_shatter',x:m.x,y:m.y,r:40,t:.6,m:.6})}if(near(x.x,x.y)){yu_S('rock',o);yu_S('boom',o);shake=Math.max(shake,.3)}return}
 // les ennemis enfermés butent contre les miroirs
 for(const e of x.tr){if(e.dead)continue;const dx=e.x-x.x,dy=e.y-x.y,d=Math.hypot(dx,dy),lim=x.r-e.r-8;
  if(d>x.r+60){x.tr.delete(e);continue}if(e.dash||e.phase>0)continue;
  if(d>lim&&d>0){e.x=x.x+dx/d*lim;e.y=x.y+dy/d*lim;const vn=(e.kx*dx+e.ky*dy)/d;if(vn>0){e.kx-=vn*dx/d;e.ky-=vn*dy/d}}}
 // le lanceur est dans un miroir (−40 % de dégâts : trait) : ni marche, ni autre jutsu
 o.root=Math.max(o.root,.1);o.rootV=null;o.silence=Math.max(o.silence,.1);o.disarm=Math.max(o.disarm,.1);o.yu_mk=Math.max(o.yu_mk||0,.1);o.kx=o.ky=0;o.dash=null;
 const m=yu_mpos(x,x.cur);o.x=m.x;o.y=m.y;
 if((x.hop-=dt)>0||o.stun>0)return;x.hop=.38;
 let tg=null,bd=1e9;for(const e of x.tr){if(e.dead)continue;const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<bd){bd=d;tg=e}}
 if(!tg)for(const e of enemies(o)){if(e.stealth>0)continue;const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<x.r+200&&d<bd){bd=d;tg=e}}
 const j=(x.cur+2+Math.floor(rnd()*(x.n-3)))%x.n,p0={x:o.x,y:o.y};x.cur=j;const q=yu_mpos(x,j);o.x=q.x;o.y=q.y;jx({jfx:'yu_hop',x:p0.x,y:p0.y,x2:q.x,y2:q.y,t:.3,m:.3});
 if(!tg)return;const a=Math.atan2(tg.y-o.y,tg.x-o.x);o.aim=a;anim(o,rnd()<.5?'st_flickr':'st_flickl',.22);if(near(o.x,o.y))yu_S('blaster',o);let g1=0;
 for(const k of[-.05,.05])proj(o,a+k,{spd:1000,r:4,dmg:3,life:.5,col:YUC.lt,kind:'yu_icen',vfx:'yu_ice',basic:false,ex:false,onHit:(p,t)=>{if(!g1){g1=1;yu_frost(p.owner,t,1)}}})};

// ---- trait de clan : Hyôton (givre → gel → fragile)
TRAITS[20]={nom:'Hyôton',desc:'Ta glace pose du givre, tes coups de base aussi (1 tous les 3 coups) ; il fond en 4 s. Dès 2 givres, l\'ennemi est ralenti ; à 4, il est gelé : entravé 0,8 s et fragile 1,5 s (+20 % de tes dégâts), puis insensible au givre 4 s',
 init(u){u.yu_mk=0},
 update(u,dt){if(u.yu_cds!==u.cds){u.yu_cds=u.cds;u.yu_mk=0} // nouveau ninja ou réapparition
  if(u.yu_mk>0)u.yu_mk=Math.max(0,u.yu_mk-dt)},
 deal(src,t,dmg,o){if(!t||t===src||t.team===src.team)return dmg;if(t.yu_fg>0)dmg*=1.2;
  if(o.basic&&dmg>0){src.yu_bh=(src.yu_bh||0)+1;if(src.yu_bh>=3){src.yu_bh=0;yu_frost(src,t,1)}} // coups de base : 1 givre tous les 3 coups qui touchent
  return dmg},
 take(t,src,dmg,o){if(t.yu_mk>0&&src&&src!==t&&dmg>0)dmg*=.6;return dmg},
 // brume froide aux pieds ; dans les miroirs : reflet bleuté
 draw(u,p,S,sk){const t=performance.now()/1000;g.save();g.fillStyle=rgba(YUC.lt,.14);g.beginPath();g.ellipse(p.x,p.y,24*S*sk,8*S*sk,0,0,7);g.fill();
  g.fillStyle=rgba('#ffffff',.75);for(let i=0;i<4;i++){const b=t*.8+i*1.57,h=((t*14+i*11)%38)*S;g.fillRect(p.x+Math.cos(b)*16*S*sk,p.y-h-Math.sin(b)*4*S,1.6*S,1.6*S)}
  if(u.yu_mk>0){g.globalCompositeOperation='lighter';g.fillStyle=rgba(YUC.md,.22+.1*Math.sin(t*12));g.beginPath();g.ellipse(p.x,p.y-30*S*sk,22*S*sk,34*S*sk,0,0,7);g.fill()}g.restore()},
 hud(u,x,y){y-=20;let tg=null,bd=1e9;for(const e of units)if(!e.dead&&e.team!==u.team){const d=dist(u,e);if(d<bd){bd=d;tg=e}}
  const n=tg?tg.yu_gv|0:0,fz=tg&&tg.yu_frz>0;text('Hyôton · givre de la cible : '+'◆'.repeat(n)+'◇'.repeat(YU_GMAX-n)+(fz?' GELÉ':''),x,y+6,11,fz?'#ffffff':n?'#bfe6ff':'#7a9ab0','left','normal')}};
AFTER.push(()=>{UK.push('yu_gv','yu_frz','yu_mk');Object.assign(VP,{yu_ice:['#bfe6ff','#ffffff','#7fc8f0']})});

// ---- apparence : chakra bleu glacé, yeux gris-bleu ; le masque Anbu devient le masque de chasseur de déserteurs de Kiri
CLOOK[20]=(look,l,S)=>{const h=look.head;if(h.acc==='anbu')h.acc='oinin';if(!h.eye)h.eye='#4a6a8a';if((l.k|0)===0&&look.weapon)look.weapon.col='#9fe0ff'};
// masque de chasseur (appelé par nr_char.js en 2D, U=1, et nr_3d.js dans la texture du visage, U≈9,7)
function yu_mask(c,ex,hy,U,lw){c.save();c.fillStyle='#f4f6fa';c.strokeStyle='#1a1410';c.lineWidth=lw;c.beginPath();c.ellipse(ex,hy+1.8*U,10.4*U,9.8*U,0,0,7);c.fill();c.stroke();
 c.fillStyle='#14161c';for(const s of[-1,1]){c.beginPath();c.moveTo(ex+s*1.5*U,hy+1.7*U);c.quadraticCurveTo(ex+s*4.2*U,hy-.3*U,ex+s*7*U,hy+.7*U);c.quadraticCurveTo(ex+s*4.4*U,hy+2.7*U,ex+s*1.5*U,hy+1.7*U);c.fill()}
 c.strokeStyle='#5a7a9a';c.lineWidth=Math.max(.8,lw*.55);c.lineCap='round';for(let i=0;i<3;i++){const y=hy-6*U+i*1.5*U;c.beginPath();c.moveTo(ex-2.8*U,y);c.quadraticCurveTo(ex-1.4*U,y-.9*U,ex,y);c.quadraticCurveTo(ex+1.4*U,y+.9*U,ex+2.8*U,y);c.stroke()}
 c.strokeStyle='#c02a3a';c.lineWidth=Math.max(.8,lw*.6);for(const s of[-1,1]){c.beginPath();c.moveTo(ex+s*4.3*U,hy+3.7*U);c.lineTo(ex+s*4.7*U,hy+6.3*U);c.stroke()}c.restore()}

// ---- animations 3D
Object.assign(ANIM,{
 // signe d'une seule main (comme Haku) devant le visage
 yu_seal:(P,e)=>{const k=ezo(Math.min(1,e/.25))*(e>.8?1-(e-.8)/.2:1);pz(P,'armR',-1.95*k,0,.25*k);pz(P,'foreR',-1.7*k);pz(P,'handR',.3*k);pz(P,'armL',.3*k,0,.2*k);pz(P,'chest',.08*k,-.2*k);pz(P,'head',.1*k);P.root.y=-1*k},
 // bras croisés qui s'ouvrent en éventail (hirondelles)
 yu_sweep:(P,e)=>{const c=e<.35,k=c?ezo(e/.35):1-ezio(Math.min(1,(e-.35)/.65));
  if(c){pz(P,'armL',-1.3*k,0,-.6*k);pz(P,'foreL',-1.2*k);pz(P,'armR',-1.3*k,0,.6*k);pz(P,'foreR',-1.2*k);pz(P,'chest',-.1*k)}
  else{pz(P,'armL',-1.4*k,0,.9*k);pz(P,'armR',-1.4*k,0,-.9*k);pz(P,'foreL',-.2*k);pz(P,'foreR',-.2*k);pz(P,'chest',.2*k);P.root.z=3*k}},
 // lancer de javelot : armé au-dessus de l'épaule, puis jeté
 yu_javelin:(P,e)=>{const up=e<.4,k=up?ezo(e/.4):ezo(Math.min(1,(e-.4)/.2));pz(P,'armR',up?-2.6*k-.2:-2.8+1.3*k,0,up?-.2:-.2+.3*k);pz(P,'foreR',up?-.6*k:-.6+.5*k);pz(P,'armL',up?-1.2*k:-1.2+.6*k,0,-.4);
  pz(P,'chest',up?-.2*k:-.2+.55*k,up?.5*k:.5-1*k);P.root.z=up?-3*k:8*k;if(!up){pz(P,'thighL',-.6*k);pz(P,'shinL',.4*k);pz(P,'thighR',.4*k)}},
 // genou à terre, paume plaquée au sol (pics)
 yu_stomp:(P,e)=>{const k=bump(Math.min(1,e*1.2));P.root.y=-8*k;pz(P,'thighL',-.9*k);pz(P,'shinL',1.4*k);pz(P,'thighR',.3*k);pz(P,'shinR',1.1*k);pz(P,'chest',.6*k);pz(P,'armR',-1.1*k,0,.1);pz(P,'foreR',-.2*k);pz(P,'armL',-.4*k,0,-.5*k);pz(P,'head',-.2*k)},
 // deux paumes poussées en avant (dragon)
 yu_thrust:(P,e)=>{const c=e<.3,k=c?ezo(e/.3):1-ezio(Math.min(1,(e-.3)/.7))*.6;for(const s of['L','R']){const sd=s==='L'?1:-1;pz(P,'arm'+s,c?-.4*k:-1.6*k,0,c?.7*sd*k:.12*sd);pz(P,'fore'+s,c?-1.6*k:-.1)}
  pz(P,'chest',c?-.25*k:.35*k);P.root.z=c?-4*k:10*k;if(!c){pz(P,'thighL',-.7*k);pz(P,'shinL',.6*k);pz(P,'thighR',.5*k)}},
 // paume tendue, l'autre main au poignet (le miroir se dresse)
 yu_mirror:(P,e)=>{const k=ezo(Math.min(1,e/.25));pz(P,'armR',-1.55*k,0,.05);pz(P,'foreR',-.1);pz(P,'handR',-.5*k);pz(P,'armL',-1.3*k,0,-.3*k);pz(P,'foreL',-1.1*k);pz(P,'chest',.1*k,.15*k);P.root.y=-1*k},
 // patineur : accroupi, penché, bras écartés
 yu_skate:(P,e)=>{const k=ezo(Math.min(1,e/.15))*(e>.85?1-(e-.85)/.15:1);P.root.y=-6*k;pz(P,'chest',.5*k,.3*k);pz(P,'head',-.3*k);pz(P,'armL',.5*k,0,.9*k);pz(P,'armR',.7*k,0,-.6*k);
  pz(P,'thighL',-.8*k);pz(P,'shinL',1.1*k);pz(P,'thighR',.5*k);pz(P,'shinR',.3*k);P.rootR.y=.4*k},
 // bras levés, la tempête se lève
 yu_storm:(P,e)=>{const k=ezo(Math.min(1,e/.3));pz(P,'armL',-2.4*k,0,.8*k);pz(P,'armR',-2.4*k,0,-.8*k);pz(P,'foreL',-.3*k);pz(P,'foreR',-.3*k);pz(P,'chest',-.2*k);pz(P,'head',-.3*k);P.rootR.y=Math.sin(e*6)*.3*k;P.root.y=2*k},
 // signe d'une main, puis les bras s'ouvrent : les miroirs se dressent
 yu_makyo:(P,e)=>{if(e<.5){const k=ezo(e/.5);pz(P,'armR',-2*k,0,.3*k);pz(P,'foreR',-1.8*k);pz(P,'armL',-1.2*k,0,-.2);pz(P,'foreL',-1.4*k);pz(P,'head',.15*k);P.root.y=-2*k}
  else{const k=ezo(Math.min(1,(e-.5)/.2));pz(P,'armL',-1.2,0,1.3*k);pz(P,'armR',-1.2,0,-1.3*k);pz(P,'chest',-.2*k);pz(P,'head',-.2*k);P.root.y=2*k}},
});

// ---- visuels
// aiguille de glace (cristal lumineux)
PROJD.yu_icen=(p,R,ra,t)=>{g.rotate(ra);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(YUC.md,.45);g.lineWidth=6;g.beginPath();g.moveTo(-14,0);g.lineTo(10,0);g.stroke();g.restore();
 g.strokeStyle=rgba(YUC.lt,.4);g.lineWidth=1.2;g.beginPath();g.moveTo(-36,0);g.lineTo(-16,0);g.stroke();
 g.fillStyle=YUC.ice;g.strokeStyle=YUC.dk;g.lineWidth=.8;g.beginPath();g.moveTo(15,0);g.lineTo(4,-2.6);g.lineTo(-16,-1.2);g.lineTo(-16,1.2);g.lineTo(4,2.6);g.closePath();g.fill();g.stroke();g.fillStyle='#fff';g.fillRect(-10,-.6,18,1.2)};
// hirondelle de neige : ailes en flèche, queue fourchue, corps de glace translucide
PROJD.yu_swl=(p,R,ra,t)=>{g.rotate(ra);const f=Math.sin(t/45+p.x*.05)*.5+.5,w=10+f*5;g.scale(R/5.2,R/5.2);
 g.fillStyle=rgba(YUC.lt,.3);for(let i=1;i<4;i++)g.fillRect(-12-i*7,Math.sin(t/60+i)*2-1,3,2);
 g.fillStyle=rgba(YUC.ice,.9);g.strokeStyle=YUC.dk;g.lineWidth=.9;g.beginPath();g.moveTo(9,0);g.quadraticCurveTo(2,-2,-2,-w);g.lineTo(-6,-w*.95);g.quadraticCurveTo(-3,-3,-8,-1.5);g.lineTo(-15,-5);g.lineTo(-11,0);g.lineTo(-15,5);g.lineTo(-8,1.5);g.quadraticCurveTo(-3,3,-6,w*.95);g.lineTo(-2,w);g.quadraticCurveTo(2,2,9,0);g.closePath();g.fill();g.stroke();
 g.fillStyle='#fff';g.beginPath();g.ellipse(2,0,4.5,1.7,0,0,7);g.fill();g.fillStyle=YUC.deep;g.fillRect(5,-.9,1.4,1.4)};
// lance de glace : hampe de cristal, fer à facettes, traînée de givre
PROJD.yu_lance=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle=rgba(YUC.lt,.4);for(let i=0;i<5;i++)g.fillRect(-46-i*9,Math.sin(t/50+i*1.7)*3-1,3,2);
 g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(YUC.md,.35);g.lineWidth=10;g.beginPath();g.moveTo(-40,0);g.lineTo(20,0);g.stroke();g.restore();
 g.fillStyle=YUC.md;g.strokeStyle=YUC.ol;g.lineWidth=1;g.fillRect(-44,-2,46,4);g.strokeRect(-44,-2,46,4);
 g.fillStyle=YUC.ice;g.beginPath();g.moveTo(26,0);g.lineTo(6,-6.5);g.lineTo(0,-2);g.lineTo(0,2);g.lineTo(6,6.5);g.closePath();g.fill();g.stroke();
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(24,0);g.lineTo(7,-3.5);g.lineTo(7,0);g.closePath();g.fill();g.fillStyle=rgba('#ffffff',.8);g.fillRect(-40,-.8,40,1.2);
 for(const x of[-30,-14])g.beginPath(),g.moveTo(x,-2),g.lineTo(x-5,-6),g.lineTo(x+2,-2),g.fillStyle=YUC.ice,g.fill()};
// dragon de glace : tête cornue gueule ouverte, corps de segments ondulants, brume derrière
PROJD.yu_dragon=(p,R,ra,t)=>{g.rotate(ra);if(Math.cos(ra)<0)g.scale(1,-1);const s=R/20;g.scale(s,s);
 g.fillStyle=rgba(YUC.lt,.22);for(let i=0;i<5;i++){g.beginPath();g.ellipse(-78-i*14,Math.sin(t/90+i)*6,15-i*2,8-i,0,0,7);g.fill()}
 for(let i=7;i>=1;i--){const x=-i*9.5,y=Math.sin(t/85-i*.8)*5*(i/7+.3),r=12-i*1.1;
  g.fillStyle=i%2?YUC.md:YUC.ice;g.strokeStyle=YUC.ol;g.lineWidth=1.1;g.beginPath();g.ellipse(x,y,r*.9,r,0,0,7);g.fill();g.stroke();
  g.fillStyle=YUC.lt;g.beginPath();g.moveTo(x-2,y-r*.85);g.lineTo(x+1,y-r-5);g.lineTo(x+4,y-r*.8);g.closePath();g.fill()}
 g.fillStyle=YUC.ice;g.strokeStyle=YUC.ol;g.lineWidth=1.3;g.beginPath();g.moveTo(-6,-11);g.quadraticCurveTo(8,-14,18,-7);g.lineTo(30,-5);g.lineTo(27,-1);g.lineTo(14,0);g.lineTo(26,5);g.lineTo(28,8);g.lineTo(14,8);g.quadraticCurveTo(0,12,-6,9);g.closePath();g.fill();g.stroke(); // tête, mâchoires ouvertes
 g.fillStyle=YUC.deep;g.beginPath();g.moveTo(14,0);g.lineTo(27,-1);g.lineTo(26,5);g.closePath();g.fill();g.fillStyle='#fff';for(let i=0;i<3;i++){g.beginPath();g.moveTo(17+i*3.5,-1.3);g.lineTo(18.5+i*3.5,1.5);g.lineTo(20+i*3.5,-1);g.fill()}
 g.fillStyle=YUC.lt;g.beginPath();g.moveTo(0,-10);g.lineTo(-14,-22);g.lineTo(-4,-12);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(6,-11);g.lineTo(-4,-24);g.lineTo(9,-12);g.closePath();g.fill();g.stroke(); // cornes
 g.fillStyle=YUC.md;g.beginPath();g.moveTo(-4,4);g.lineTo(-12,13+Math.sin(t/70)*2);g.lineTo(0,7);g.fill(); // barbillon
 circ(9,-6,2.6,'#ffffff');circ(9.6,-6,1.3,YUC.dk);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(YUC.md,.35);g.beginPath();g.ellipse(8,0,26,15,0,0,7);g.fill();g.restore()};
// geste des hirondelles / du dragon : tourbillon de neige devant les mains
JFXD.yu_gust=(f,k,e,t,u)=>{if(!u||u.dead)return;const c=P(u.x+Math.cos(f.a)*30,u.y+Math.sin(f.a)*30,40),s=c.s*(f.big?1.5:1);g.save();g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba(YUC.lt,.7*k);g.lineWidth=2*s;for(let j=0;j<3;j++){const b=t*9+j*2.1;g.beginPath();g.ellipse(c.x,c.y,(10+e*24)*s,(5+e*10)*s,0,b,b+2.2);g.stroke()}
 g.fillStyle='#fff';for(let i=0;i<9;i++){const b=i*.7+t*5,d=(6+e*30+i*2)*s;g.fillRect(c.x+Math.cos(b)*d,c.y+Math.sin(b)*d*.5,2*s,2*s)}g.restore()};
// lance qui se forme dans la main
JFXD.yu_forge=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x-Math.cos(u.aim)*6,u.y-Math.sin(u.aim)*6,66),s=q.s,ra=Math.atan2(Math.sin(u.aim)*K,Math.cos(u.aim)),L=Math.min(1,e*2.5);g.save();g.translate(q.x,q.y);g.rotate(ra);
 g.globalCompositeOperation='lighter';g.fillStyle=rgba(YUC.md,.4*k);g.beginPath();g.ellipse(0,0,34*s*L,7*s,0,0,7);g.fill();g.globalCompositeOperation='source-over';g.fillStyle=YUC.ice;g.strokeStyle=YUC.ol;g.lineWidth=1;g.fillRect(-26*s*L,-1.8*s,40*s*L,3.6*s);g.strokeRect(-26*s*L,-1.8*s,40*s*L,3.6*s);g.restore()};
// aiguilles d'eau gelée : un anneau d'aiguilles flotte autour de la zone, pointes vers le centre, puis se referme d'un coup
JFXD.yu_needles=(f,k,e,t)=>{const el=e*f.m,D=f.d,N=18,form=Math.min(1,el/.3),conv=el>D?Math.min(1,(el-D)/.1):0,aft=el>D+.1?Math.min(1,(el-D-.1)/.25):0;g.save();
 if(conv<1){g.strokeStyle=rgba(YUC.md,.55*form);g.lineWidth=2;g.setLineDash([6,5]);g.lineDashOffset=-t*20;gEll(f.x,f.y,f.r);g.stroke();g.setLineDash([]);
  for(let i=0;i<N;i++){const b=i*Math.PI*2/N+(1-form)*.9+(i%2)*.1,rr=f.r*(1.18-conv*1.1)+(i%3)*5,z=22+(i%3)*14+Math.sin(t*3+i)*3*(1-conv),A=P(f.x+Math.cos(b)*(rr+8),f.y+Math.sin(b)*(rr+8),z+2),Bq=P(f.x+Math.cos(b)*(rr-16),f.y+Math.sin(b)*(rr-16),z);
   g.globalAlpha=form;g.strokeStyle=rgba(YUC.md,.6);g.lineWidth=4*A.s;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke();g.strokeStyle='#ffffff';g.lineWidth=1.4*A.s;g.stroke();circ(Bq.x,Bq.y,1.6*A.s,YUC.lt)}g.globalAlpha=1}
 if(conv>0){const q=P(f.x,f.y,30),s=q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.8*(1-aft));g.beginPath();g.ellipse(q.x,q.y,(10+aft*30)*s,(14+aft*20)*s,0,0,7);g.fill();g.globalCompositeOperation='source-over';
  for(let i=0;i<12;i++){const b=i*.52+.2,d=(6+aft*f.r*.9)*s,x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*.6+aft*aft*18*s;g.save();g.translate(x,y);g.rotate(b);g.globalAlpha=1-aft;g.fillStyle=i%2?YUC.ice:'#fff';g.fillRect(-5*s,-1*s,10*s,2*s);g.restore()}}
 g.restore()};
// gel : des cristaux jaillissent autour de la cible
JFXD.yu_freeze=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,0),s=q.s,up=Math.min(1,e*4);g.save();g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=3*k+1;gEll(o.x,o.y,20+e*46);g.stroke();
 for(let i=0;i<8;i++){const b=i*.785+.3,p=P(o.x+Math.cos(b)*22,o.y+Math.sin(b)*22,0),h=(26+(i%3)*12)*up*s*Math.min(1,k*2.5);g.fillStyle=i%2?YUC.ice:YUC.lt;g.strokeStyle=YUC.dk;g.lineWidth=1;g.beginPath();g.moveTo(p.x-4*s,p.y);g.lineTo(p.x+Math.cos(b)*3*s,p.y-h);g.lineTo(p.x+4*s,p.y);g.closePath();g.fill();g.stroke()}
 g.globalCompositeOperation='lighter';g.fillStyle=rgba(YUC.lt,.5*k);g.beginPath();g.ellipse(q.x,q.y-30*s,26*s*(1+e),38*s*(1+e*.3),0,0,7);g.fill();g.restore()};
// éclats de glace (éclatement, fin du blizzard, miroirs brisés)
JFXD.yu_shatter=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,n=f.big?22:12;g.save();g.strokeStyle=rgba(YUC.lt,.8*k);g.lineWidth=4*k+1;gEll(f.x,f.y,f.r*(.3+e*.8));g.stroke();
 if(f.big){g.fillStyle=rgba(YUC.ice,.25*k);gEll(f.x,f.y,f.r);g.fill()}
 for(let i=0;i<n;i++){const b=i*(6.283/n)+f.x*.01,d=f.r*(.15+e*.85)*(i%2?.7:1),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,30*Math.sin(Math.PI*Math.min(1,e*1.2))+(i%3)*8+6);
  g.save();g.translate(p.x,p.y);g.rotate(b+e*7);g.globalAlpha=Math.min(1,k*1.6);g.fillStyle=i%3?YUC.ice:'#ffffff';g.strokeStyle=YUC.dk;g.lineWidth=.8;g.beginPath();g.moveTo(-5*s,0);g.lineTo(0,-3.4*s);g.lineTo(6*s,0);g.lineTo(0,2.6*s);g.closePath();g.fill();g.stroke();g.restore()}g.restore()};
// lance plantée dans la cible clouée
JFXD.yu_pin=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,sd=Math.cos(f.a)<0?-1:1;g.save();g.globalAlpha=Math.min(1,k*4);g.fillStyle=rgba(YUC.ice,.45);g.beginPath();g.ellipse(q.x,q.y,20*s,7*s,0,0,7);g.fill();
 g.translate(q.x-sd*8*s,q.y+2*s);g.rotate(-sd*.5);g.fillStyle=YUC.md;g.strokeStyle=YUC.ol;g.lineWidth=1;g.fillRect(-1.8*s,-40*s,3.6*s,40*s);g.strokeRect(-1.8*s,-40*s,3.6*s,40*s);g.fillStyle=YUC.ice;g.beginPath();g.moveTo(0,-52*s);g.lineTo(4.5*s,-40*s);g.lineTo(-4.5*s,-40*s);g.closePath();g.fill();g.stroke();g.restore()};
// pics de glace : cristaux qui jaillissent le long de la ligne, puis fondent
AUXD.yu_spk=(x,k,t)=>{const el=x.m-x.t,front=Math.min(x.len,el/.32*x.len),ca=Math.cos(x.a),sa=Math.sin(x.a),fade=Math.min(1,x.t/.35),n=Math.floor(x.len/20);
 const L=[P(x.x-sa*x.w/2,x.y+ca*x.w/2),P(x.x+sa*x.w/2,x.y-ca*x.w/2),P(x.x+ca*front+sa*x.w/2,x.y+sa*front-ca*x.w/2),P(x.x+ca*front-sa*x.w/2,x.y+sa*front+ca*x.w/2)];
 poly(L,rgba(YUC.ice,.22*fade));
 for(let i=0;i<n;i++){const f=i*20+10;if(f>front)break;const age=Math.min(1,(el-f/x.len*.32)/.12),sd=((i*7)%5-2)/2,lat=sd*x.w*.32,h=(30+((i*13)%3)*12)*ezo(age)*fade,b=P(x.x+ca*f-sa*lat,x.y+sa*f+ca*lat,0),s=b.s,w=(6+(i%3)*2)*s,tip=P(x.x+ca*(f+4)-sa*lat*1.15,x.y+sa*(f+4)+ca*lat*1.15,h);
  g.fillStyle=YUC.md;g.strokeStyle=YUC.ol;g.lineWidth=1;g.beginPath();g.moveTo(b.x-w,b.y);g.lineTo(tip.x,tip.y);g.lineTo(b.x,b.y+2*s);g.closePath();g.fill();g.stroke();
  g.fillStyle=YUC.lt;g.beginPath();g.moveTo(b.x,b.y+2*s);g.lineTo(tip.x,tip.y);g.lineTo(b.x+w,b.y);g.closePath();g.fill();g.stroke();
  if(age<1&&age>0){g.fillStyle='#fff';g.fillRect(tip.x-1.5*s,tip.y-1.5*s,3*s,3*s)}}};
// miroir de glace (un pan vertical qui fait face à fn) ; refl : reflet bleu d'un ninja masqué dedans
function yu_pane(cx,cy,b,W,H,al,refl,glow,t){const tx=-Math.sin(b)*W/2,ty=Math.cos(b)*W/2,a0=P(cx-tx,cy-ty,0),a1=P(cx+tx,cy+ty,0),b1=P(cx+tx,cy+ty,H),b0=P(cx-tx,cy-ty,H),s=a0.s;if(H<2)return;
 g.save();g.globalAlpha=al;const gr=g.createLinearGradient(b0.x,b0.y,a1.x,a1.y);gr.addColorStop(0,'rgba(240,250,255,.9)');gr.addColorStop(.5,'rgba(150,210,245,.55)');gr.addColorStop(1,'rgba(80,150,205,.75)');
 g.fillStyle=gr;g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.lineTo(b1.x,b1.y);g.lineTo(b0.x,b0.y);g.closePath();g.fill();
 if(refl>0){const m=P(cx,cy,H*.36),hd=P(cx,cy,H*.66),w=Math.max(2,Math.abs(a1.x-a0.x)*.22);g.fillStyle=rgba(YUC.deep,.45*refl);g.beginPath();g.ellipse(m.x,m.y,w,(m.y-hd.y)*.75,0,0,7);g.fill();g.beginPath();g.arc(hd.x,hd.y,w*.85,0,7);g.fill();
  g.fillStyle=rgba('#ffffff',.85*refl);g.beginPath();g.ellipse(hd.x,hd.y+w*.15,w*.62,w*.7,0,0,7);g.fill()} // masque blanc
 g.strokeStyle=rgba('#ffffff',.55);g.lineWidth=1.5*s;for(let j=0;j<2;j++){const u0=((t*.3+j*.55)%1.5)-.25,u1=u0+.22,L=(q,r)=>({x:lerp(q.x,r.x,clamp(u0,0,1)),y:lerp(q.y,r.y,clamp(u0,0,1))}),Lb=(q,r)=>({x:lerp(q.x,r.x,clamp(u1,0,1)),y:lerp(q.y,r.y,clamp(u1,0,1))});
  const p1=L(a0,a1),p2=Lb(b0,b1);if(u0<1&&u1>0){g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.stroke()}}
 g.strokeStyle=YUC.lt;g.lineWidth=3*s;g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.lineTo(b1.x,b1.y);g.lineTo(b0.x,b0.y);g.closePath();g.stroke();g.strokeStyle=rgba(YUC.dk,.9);g.lineWidth=1;g.stroke();
 if(glow>0){g.globalCompositeOperation='lighter';g.fillStyle=rgba(YUC.md,.35*glow);g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.lineTo(b1.x,b1.y);g.lineTo(b0.x,b0.y);g.closePath();g.fill()}g.restore()}
AUXD.yu_mir=(x,k,t)=>{const el=x.m-x.t,rise=ezo(Math.min(1,el/.18)),end=Math.min(1,x.t/.25);g.fillStyle=rgba(YUC.ice,.25*end);gEll(x.x,x.y,x.len*.42);g.fill();
 // vu de face par la caméra, un miroir tourné vers la gauche ou la droite serait un simple trait : on l'incline un peu vers l'écran (dessin seulement)
 let tx=-Math.sin(x.a),ty=Math.cos(x.a);if(Math.abs(tx)<.6){tx+=(tx>=0?.6:-.6);const n=Math.hypot(tx,ty);tx/=n;ty/=n}
 yu_pane(x.x,x.y,Math.atan2(-tx,ty),x.len*(end<1?.6+.4*end:1),x.w*rise*end,.85,.6,0,t)};
// éclair du miroir (apparition, traversée)
JFXD.yu_flash=(f,k,e,t)=>{const q=P(f.x,f.y,36),s=q.s;g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.7*k);g.beginPath();g.ellipse(q.x,q.y,(8+e*30)*s,(26+e*16)*s,0,0,7);g.fill();
 g.strokeStyle=rgba(YUC.md,.9*k);g.lineWidth=2;for(let i=0;i<6;i++){const b=i*1.047+e*2;g.beginPath();g.moveTo(q.x+Math.cos(b)*10*s,q.y+Math.sin(b)*14*s);g.lineTo(q.x+Math.cos(b)*(18+e*30)*s,q.y+Math.sin(b)*(22+e*20)*s);g.stroke()}g.restore()};
// tir renvoyé par un miroir
JFXD.yu_ting=(f,k,e)=>{const q=P(f.x,f.y,28),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=2;g.beginPath();for(let i=0;i<8;i++){const b=i*Math.PI/4,L=(i%2?6:16)*s*(1+e);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L)}g.closePath();g.stroke();g.restore()};
// saut de miroir en miroir : traînée de reflets
JFXD.yu_hop=(f,k,e)=>{const A=P(f.x,f.y,34),Bq=P(f.x2,f.y2,34),s=A.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(YUC.md,.6*k);g.lineWidth=10*s*k;g.lineCap='round';g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke();
 g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=2*s;g.stroke();for(let i=0;i<5;i++){const c=(i+.5)/5,x=lerp(A.x,Bq.x,c),y=lerp(A.y,Bq.y,c);g.fillStyle=rgba('#ffffff',.8*k);g.fillRect(x-1.5*s,y-8*s*Math.sin(i+e*6)-1.5*s,3*s,3*s)}g.restore()};
// piste de glace : bande gelée, fissures, scintillements
AUXD.yu_trail=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),hw=x.w/2,end=Math.min(1,x.t/.5),grow=Math.min(1,(x.m-x.t)/.3),L=x.len*grow;
 const Q=(f,s)=>P(x.x+ca*f-sa*s,x.y+sa*f+ca*s);poly([Q(0,-hw*.6),Q(L,-hw),Q(L,hw),Q(0,hw*.6)],rgba(YUC.ice,.32*end));poly([Q(0,-hw*.3),Q(L,-hw*.55),Q(L,hw*.55),Q(0,hw*.3)],rgba('#ffffff',.22*end));
 g.strokeStyle=rgba(YUC.dk,.45*end);g.lineWidth=1.2;g.beginPath();for(let i=0;i<5;i++){const f=(i+.3)/5*L,s=((i*13)%7-3)/3*hw*.6,a=Q(f,s),b=Q(f+14,s+((i%2)?8:-8));g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}g.stroke();
 g.fillStyle=rgba('#ffffff',.9*end);for(let i=0;i<6;i++){const f=((i*.17+t*.2)%1)*L,s=((i*29)%11-5)/5*hw*.7,p=Q(f,s),tw=Math.max(0,Math.sin(t*6+i*2));if(tw>.3){g.fillRect(p.x-2*tw,p.y-.5,4*tw,1);g.fillRect(p.x-.5,p.y-2*tw,1,4*tw)}}};
// blizzard : disque blanc, rafales qui tournent, flocons qui tombent en spirale
AUXD.yu_bliz=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r,al=Math.min(1,x.t/.4,(x.m-x.t)/.3+.1);g.fillStyle=rgba('#e8f4ff',.16*al);gEll(x.x,x.y,R);g.fill();g.strokeStyle=rgba(YUC.lt,.55*al);g.lineWidth=2.5;gEll(x.x,x.y,R);g.stroke();
 g.lineCap='round';for(let j=0;j<5;j++){const z=12+j*11,b0=-t*(2.2+j*.25)+j*1.3,rr=R*(.45+j*.11);g.strokeStyle=rgba(j%2?'#ffffff':YUC.ice,.45*al);g.lineWidth=(3-j*.3)*q.s;g.beginPath();for(let i=0;i<=8;i++){const b=b0+i*.22,p=P(x.x+Math.cos(b)*rr,x.y+Math.sin(b)*rr,z);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}g.stroke()}
 g.fillStyle=rgba('#ffffff',.9*al);for(let i=0;i<34;i++){const b=i*2.39-t*(1.4+(i%3)*.4),d=R*(.12+((i*.137)%1)*.88),z=72-((t*34+i*17)%72),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,z),r=(i%4?1.4:2.4)*p.s;g.fillRect(p.x-r,p.y-r*.3,r*2,r*.6);g.fillRect(p.x-r*.3,p.y-r,r*.6,r*2)}};
// Makyô : sol givré et miroirs du fond (sous les ninjas) ; ceux de devant sont dessinés par-dessus (JFXD.yu_domeF)
function yu_domeDraw(x,front,t,o){const el=x.m-x.t,rise=ezo(Math.min(1,el/.35)),end=x.t<.2?x.t/.2:1,H=78*rise;let ci=-1,bd=1e9;
 if(o&&!o.dead)for(let i=0;i<x.n;i++){const m=yu_mpos(x,i),d=Math.hypot(m.x-o.x,m.y-o.y);if(d<bd){bd=d;ci=i}}if(bd>30)ci=-1;
 for(let i=0;i<x.n;i++){const b=x.a+i*Math.PI*2/x.n;if((Math.sin(b)>0)!==front)continue;const m=yu_mpos(x,i);
  yu_pane(m.x,m.y,b,54,H*end,front?.5:.92,i===ci?0:.55,i===ci?1:0,t+i*.37)}}
AUXD.yu_dome=(x,k,t)=>{const al=Math.min(1,x.t/.3);g.fillStyle=rgba(YUC.ice,.14*al);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba(YUC.lt,.7*al);g.lineWidth=3;gEll(x.x,x.y,x.r);g.stroke();
 g.strokeStyle=rgba(YUC.dk,.35*al);g.lineWidth=1.2;g.setLineDash([3,7]);gEll(x.x,x.y,x.r*.7);g.stroke();g.setLineDash([]);yu_domeDraw(x,false,t,units[x.ui])};
JFXD.yu_domeF=(f,k,e,t,u)=>{if(!u||u.dead||!(u.yu_mk>0))return; // dôme fini plus tôt (lanceur tombé) : plus de miroirs devant
 const x={x:f.x,y:f.y,r:f.r,a:f.a,n:f.n,t:f.t,m:f.m};yu_domeDraw(x,true,t,u)};
// états visibles : givre (cristaux aux pieds, un par givre) et gel (bloc de glace jusqu'à la poitrine)
STATD.push((u,p,S,sk)=>{const gv=u.yu_gv|0,fz=u.yu_frz||0;if(!gv&&!(fz>0))return;const t=performance.now()/1000;g.save();
 if(gv){g.fillStyle=rgba(YUC.ice,.18+gv*.06);g.beginPath();g.ellipse(p.x,p.y,(16+gv*3)*S*sk,(6+gv)*S*sk,0,0,7);g.fill();
  for(let i=0;i<YU_GMAX;i++){const b=t*1.2+i*Math.PI/2,x=p.x+Math.cos(b)*18*S*sk,y=p.y+Math.sin(b)*6*S*sk-4*S,z=5*S,on=i<gv;g.fillStyle=on?YUC.ice:'rgba(191,230,255,.15)';g.strokeStyle=on?YUC.dk:'rgba(58,120,168,.35)';g.lineWidth=1;
   g.beginPath();g.moveTo(x,y-z*1.6);g.lineTo(x+z*.7,y);g.lineTo(x,y+z*.5);g.lineTo(x-z*.7,y);g.closePath();g.fill();g.stroke()}}
 if(fz>0){const a=Math.min(1,fz/.15),h=44*S*sk,w=17*S*sk,cy=p.y;g.globalAlpha=a;g.fillStyle='rgba(175,225,250,.5)';g.strokeStyle='#ffffff';g.lineWidth=1.5;
  g.beginPath();g.moveTo(p.x-w,cy+2*S);g.lineTo(p.x-w*1.15,cy-h*.55);g.lineTo(p.x-w*.6,cy-h);g.lineTo(p.x-w*.1,cy-h*.86);g.lineTo(p.x+w*.4,cy-h*1.04);g.lineTo(p.x+w*1.1,cy-h*.62);g.lineTo(p.x+w,cy+2*S);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=2;g.beginPath();g.moveTo(p.x-w*.7,cy-h*.2);g.lineTo(p.x-w*.45,cy-h*.75);g.moveTo(p.x+w*.55,cy-h*.3);g.lineTo(p.x+w*.7,cy-h*.6);g.stroke();
  g.fillStyle=YUC.lt;g.strokeStyle=YUC.dk;g.lineWidth=1;for(let i=0;i<4;i++){const x=p.x+(i-1.5)*w*.55,y=cy-h*(.95+(i%2)*.1);g.beginPath();g.moveTo(x-3*S,y+6*S);g.lineTo(x,y-5*S);g.lineTo(x+3*S,y+6*S);g.closePath();g.fill();g.stroke()}}
 g.restore()});
