// ===== Clan Roran (c12, préfixe rr_) : l'éventail géant et le vent (style Temari) =====
// Identité : l'éventail tranche (Kamaitachi, Grande Kamaitachi, Tempête tranchante), repousse (Rafale, Contre-vent, Tempête de l'éventail),
// protège (Barrière : renvoie les tirs), porte (Vol sur l'éventail) et invoque Kamatari, la belette à la faux.
// Trait « Trois lunes » : chaque jutsu qui touche ouvre une lune de l'éventail ; à 3 lunes, le jutsu suivant part éventail grand ouvert.
// Combo signature : Vent ascendant (ou l'aller de Kamatari) projette en l'air → Kamaitachi frappe +30 % la cible en l'air.
// Style propre : Éventail de combat (lames de vent à moyenne portée). Apparence : l'éventail géant dans le dos.
const RRD={
 st:'Coups d\'éventail : lames de vent à moyenne portée ; tous les 3 coups, une bourrasque large qui perce et repousse',
 kama:'Une faux de vent perçante file en ligne : 14 dégâts, ralentit ; +30 % sur une cible projetée en l\'air',
 gale:'Grand coup d\'éventail devant toi : 18 dégâts, repousse loin, interrompt les mudras et balaie les tirs ennemis',
 up:'Une colonne de vent jaillit au point visé après 0,6 s : 12 dégâts, projette en l\'air (étourdit 0,5 s)',
 wall:'Plante l\'éventail ouvert devant toi 2 s : il renvoie les tirs ennemis et repousse les ennemis qui approchent (4 dégâts)',
 storm:'Tempête de lames au point visé (2,5 s) : aspire, ralentit et coupe 6 fois (3 dégâts), puis explose : 6 dégâts, repousse',
 dai:'Éventail grand ouvert (0,3 s) : une vague de faux traverse tout sur 560 : 28 dégâts, repousse, saigne (8 en 3 s), avale les tirs',
 glide:'Plane 0,8 s sur l\'éventail (dirigé à la souris) : insensible aux ralentissements, les coups au corps à corps te ratent ; l\'atterrissage repousse (6 dégâts)',
 back:'L\'éventail frappe le sol : 14 dégâts autour de toi, repousse et ralentit ; le contrecoup te projette de 260 vers le point visé',
 kamatari:'Kamatari, la belette à la faux, traverse la ligne (640) à l\'aller puis au retour : 28 dégâts et projette en l\'air, puis 14 ; avale les tirs',
 typh:'Immobile 1 s, l\'éventail bat 3 fois devant toi : 12, 12 puis 16 dégâts, repousse ; le 3e ralentit 2 s ; chaque battement balaie les tirs',
 trait:'Chaque jutsu Roran (hors déplacements) qui touche ouvre une lune de l\'éventail (3 max ; sans toucher, elles se referment une à une après 6 s). Chaque lune : +4 % de dégâts Roran. À 3 lunes, ton prochain jutsu Roran part éventail grand ouvert : +20 % de dégâts et +20 % de taille',
};
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c12',[
 [1,'D','x.rr_kama','Kamaitachi',RRD.kama,'wind'],
 [1,'C','x.rr_gale','Rafale de l\'éventail',RRD.gale,'wind'],
 [3,'C','x.rr_up','Vent ascendant',RRD.up,'wind'],
 [3,'B','x.rr_wall','Barrière de l\'éventail',RRD.wall,'wind'],
 [4,'B','x.rr_storm','Tempête tranchante',RRD.storm,'wind'],
 [4,'A','x.rr_dai','Grande Kamaitachi',RRD.dai,'wind'],
 [2,'C','x.rr_glide','Vol sur l\'éventail',RRD.glide,'wind'],
 [2,'B','x.rr_back','Contre-vent',RRD.back,'wind'],
 [5,'S','x.rr_kamatari','Invocation : Kamatari',RRD.kamatari,'wind'],
 [5,'A','x.rr_typh','Tempête de l\'éventail',RRD.typh,'wind'],
]);
// style de combat propre (toujours ajouté à la fin de STYLES)
STYLES.push(['Éventail de combat',RRD.st,'x.rr_st','wind','sand',[12],.84,.84]);

// ---- outils
// couleurs : papier de l'éventail, pli, baleines, lune, lune allumée, vent, vent moyen, or du clan
const RRC={paper:'#f4ecd8',fold:'#ddd0b0',rib:'#3a2a1e',moon:'#7a4aa8',moonL:'#d8b8ff',wind:'#e8fff8',wind2:'#a8e8d0',gold:'#e0b84a'};
const rrS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son « brut » (sans la teinte vent)
const rrI=u=>units.indexOf(u);
let RR_ID=0;
// début d'un jutsu Roran : à 3 lunes, l'éventail part grand ouvert (+20 % de dégâts, +20 % de taille) et se referme
function rrOpen(u){RR_ID=RR_ID%1e6+1;const full=(u.rr_mn|0)>=3;if(full){u.rr_mn=0;u.rr_mT=0;say(u,'ÉVENTAIL GRAND OUVERT','#e8d8ff');jx({jfx:'rr_moons',ui:rrI(u),x:u.x,y:u.y,t:.8,m:.8})}
 return {id:RR_ID,F:full?1.2:1,G:full?1.2:1,full:full?1:0}}
// geste : l'éventail ouvert dans les mains (n : 1 taille en diagonale, 2 balayage large, 3 de bas en haut, 4 au-dessus de la tête puis abattu)
const rrFan=(u,a,d,n,full)=>jx({jfx:'rr_fan',ui:rrI(u),x:u.x,y:u.y,a,n,full:full?1:0,t:d,m:d});
// le vent balaie les tirs ennemis dans un cône
function rrSweep(u,x,y,a,R,A){for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===u.team)continue;const dx=p.x-x,dy=p.y-y;if(dx*dx+dy*dy>R*R||angDiff(Math.atan2(dy,dx),a)>A/2)continue;
 p.life=0;if(p.rocket)p.boom=1;if(near(p.x,p.y))sparks(p.x,p.y,RRC.wind,5,'wind')}}
// distance d'un point à un segment
function rrSeg(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy,k=L?clamp(((x-ax)*dx+(y-ay)*dy)/L,0,1):0;return Math.hypot(x-ax-dx*k,y-ay-dy*k)}

Object.assign(NAT,{
 // ---- style : lames de vent ; la 3e est une bourrasque large qui perce et repousse
 rr_st:SP('Éventail de combat','',.5,{hero:'bossk',ai:{max:420,p:.85}},(u,a)=>{if(SIMT-(u.rr_sT||-9)>1.6)u.rr_sN=0;u.rr_sT=SIMT;u.rr_sN=(u.rr_sN||0)%3+1;const big=u.rr_sN===3;
  rrS(big?'heavy':'saber',u);if(big)S('wind',u);
  proj(u,a,{vfx:'wind',spd:big?760:880,r:big?16:9,dmg:big?7:6,life:big?.54:.47,col:RRC.wind,kind:'rr_gust',pierce:big?1:0,o:big?{kb:300}:{}});
  rrFan(u,a,big?.34:.26,big?2:1);anim(u,big?'rr_st3':u.rr_sN===1?'rr_st1':'rr_st2',big?.34:.26)}),
 // ---- Kamaitachi : faux de vent perçante ; +30 % sur une cible en l'air (trait)
 rr_kama:SP('Kamaitachi',RRD.kama,7,{line:{len:480,w:30},ai:RG(460,.7)},(u,a)=>{const c=rrOpen(u);anim(u,'rr_swing',.42);rrS('saber',u);S('wind',u);rrFan(u,a,.38,1,c.full);
  proj(u,a,{vfx:'wind',spd:900,r:14*c.G,dmg:14*c.F,life:.55,col:RRC.wind,pierce:1,slow:.8,kind:'rr_sickle',o:{rr:c.id,rrAir:1},onHit:(p,t)=>{if(near(t.x,t.y))jx({jfx:'rr_cut',ti:rrI(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.35,m:.35})}})}),
 // ---- Rafale : grand coup d'éventail en cône, repousse loin, interrompt, balaie les tirs
 rr_gale:SP('Rafale de l\'éventail',RRD.gale,8,{line:{len:230,w:220},ai:RG(200,.75)},(u,a)=>{const c=rrOpen(u),R=230*c.G,A=1.6;anim(u,'rr_sweep',.45);rrS('heavy',u);S('wind',u);rrFan(u,a,.42,2,c.full);
  jx({jfx:'rr_gust',x:u.x,y:u.y,a,r:R,w:A,t:.45,m:.45});rrSweep(u,u.x,u.y,a,R,A);
  for(const e of enemies(u))if(dist(u,e)<R+e.r&&angDiff(ang(u,e),a)<A/2){if(hit(e,u,18*c.F,{kb:650,rr:c.id,unblockable:1})&&near(e.x,e.y))jx({jfx:'rr_cut',ti:rrI(e),x:e.x,y:e.y,a,t:.35,m:.35})}
  if(near(u.x,u.y))shake=Math.max(shake,.12)}),
 // ---- Vent ascendant : colonne de vent retardée qui projette en l'air
 rr_up:SP('Vent ascendant',RRD.up,11,{tele:{r:80,max:440},ai:RG(420,.55)},(u,a,td)=>{const c=rrOpen(u),p=atP(u,a,td,440),R=80*c.G;anim(u,'rr_lift',.5);rrS('dash',u);rrFan(u,a,.45,3,c.full);
  jx({jfx:'rr_swirl',x:p.x,y:p.y,r:R,t:.6,m:.6});
  later(u,.6,()=>{jx({jfx:'rr_column',x:p.x,y:p.y,r:R,t:.75,m:.75});rrS('boom',u);S('wind',u);
   for(const e of units)if(!e.dead&&e.team!==u.team&&Math.hypot(e.x-p.x,e.y-p.y)<R+e.r)hit(e,u,12*c.F,{air:.5,rr:c.id,unblockable:1,fx:p.x,fy:p.y})},{x:p.x,y:p.y,r:R})}),
 // ---- Barrière : l'éventail planté renvoie les tirs et repousse (logique : AUXF.rr_wall)
 rr_wall:SP('Barrière de l\'éventail',RRD.wall,14,{ai:DEF},(u,a)=>{const c=rrOpen(u),L=150*c.G,T=2,x0=u.x+Math.cos(a)*48,y0=u.y+Math.sin(a)*48;anim(u,'rr_plant',.45);rrS('heavy',u);S('wind',u);
  aux.push({type:'rr_wall',x:x0,y:y0,a,len:L,r:L/2,t:T,m:T,team:u.team,owner:u,ui:rrI(u),vfx:'wind',k:0,id:c.id,F:c.F,hs:new Map()});
  jx({jfx:'rr_dust',x:x0,y:y0,r:L/2,t:.45,m:.45})}),
 // ---- Tempête tranchante : tourbillon de lames au point visé (logique : AUXF.rr_storm)
 rr_storm:SP('Tempête tranchante',RRD.storm,12,{tele:{r:110,max:420},ai:RG(400,.55)},(u,a,td)=>{const c=rrOpen(u),p=atP(u,a,td,420),R=110*c.G,T=2.5;anim(u,'rr_whirl',.55);S('wind',u);rrS('saber',u);rrFan(u,a,.5,2,c.full);
  aux.push({type:'rr_storm',x:p.x,y:p.y,r:R,t:T,m:T,team:u.team,owner:u,vfx:'wind',k:.36,id:c.id,F:c.F,n:0,danger:1})}),
 // ---- Grande Kamaitachi : 0,3 s pour ouvrir l'éventail, puis une vague de faux qui traverse tout
 rr_dai:SP('Grande Kamaitachi',RRD.dai,13,{line:{len:560,w:110},ai:RG(520,.6)},(u,a)=>{const c=rrOpen(u),R=44*c.G;u.root=Math.max(u.root,.4);anim(u,'rr_big',.75);rrS('heavy',u);rrFan(u,a,.7,4,c.full);
  jx({jfx:'rr_tline',x:u.x,y:u.y,a,len:560,w:2*R+36,t:.3,m:.3});
  later(u,.3,()=>{if(u.dead||u.stun>0)return;rrS('boom',u);S('wind',u);if(near(u.x,u.y))shake=Math.max(shake,.2);
   proj(u,a,{vfx:'wind',spd:760,r:R,dmg:28*c.F,life:.74,col:RRC.wind,pierce:1,noClash:1,kind:'rr_wave',o:{rr:c.id,dot:{dps:8/3,dur:3}},
    onHit:(p,t)=>{if(t.dead)return;if(t.unstop<=0){const b=Math.atan2(p.vy,p.vx);t.kx+=Math.cos(b)*650;t.ky+=Math.sin(b)*650}if(near(t.x,t.y))jx({jfx:'rr_cut',ti:rrI(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),big:1,t:.5,m:.5})}});
   aux.push({type:'rr_wavec',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,p:projs[projs.length-1]})})}),
 // ---- Vol sur l'éventail : planer, dirigé à la souris (logique : AUXF.rr_glide ; esquive au corps à corps : trait)
 rr_glide:SP('Vol sur l\'éventail',RRD.glide,12,{ai:ESC},(u,a)=>{const D=.8;u.dash=null;u.rr_gl=D;u.rr_gh=a;u.slowImm=Math.max(u.slowImm,D);anim(u,'rr_ride',D);rrS('dash',u);S('wind',u);
  for(const x of aux)if(x.type==='rr_glide'&&x.owner===u)x.t=0;
  aux.push({type:'rr_glide',x:u.x,y:u.y,r:0,t:D,m:D,team:u.team,owner:u,a,k:0});jx({jfx:'rr_ride',ui:rrI(u),x:u.x,y:u.y,a,t:D+.05,m:D+.05});sparks(u.x,u.y,RRC.wind,8,'wind')}),
 // ---- Contre-vent : l'éventail frappe le sol, rafale autour, puis le contrecoup projette le lanceur
 rr_back:SP('Contre-vent',RRD.back,12,{ai:ESC},(u,a,td)=>{anim(u,'rr_slam',.42);rrS('heavy',u);S('wind',u);jx({jfx:'rr_burst',x:u.x,y:u.y,r:120,t:.5,m:.5});
  for(const e of enemies(u))if(dist(u,e)<120+e.r)hit(e,u,14,{kb:700,slow:1,fx:u.x,fy:u.y,unblockable:1});
  dash(u,a,clamp(td||260,120,260),.28,{jump:46,end:()=>{jx({jfx:'rr_dust',x:u.x,y:u.y,r:50,t:.35,m:.35})}});if(near(u.x,u.y))shake=Math.max(shake,.12)}),
 // ---- Invocation : Kamatari (logique : AUXF.rr_weasel) ; 0,45 s d'apparition (la ligne s'affiche au sol)
 rr_kamatari:ULT('Invocation : Kamatari',RRD.kamatari,{line:{len:640,w:80},ai:{max:560,p:.85}},(u,a)=>{const c=rrOpen(u);anim(u,'rr_summon',.8);rrS('poof',u);S('wind',u);
  const sx=u.x+Math.cos(a)*30,sy=u.y+Math.sin(a)*30,e=fwd(u,a,640);
  aux.push({type:'rr_weasel',x:sx,y:sy,sx,sy,ex:e.x,ey:e.y,a,len:Math.hypot(e.x-sx,e.y-sy),w:80,t:2.6,m:2.6,team:u.team,owner:u,vfx:'wind',k:.45,n:0,hs:new Set(),id:c.id,F:c.F});
  jx({jfx:'rr_poof',x:sx,y:sy,r:46,t:.6,m:.6})}),
 // ---- Tempête de l'éventail : 3 battements en cône (suivent la visée)
 rr_typh:ULT('Tempête de l\'éventail',RRD.typh,{line:{len:380,w:240},ai:{max:340,p:.8}},(u,a)=>{const c=rrOpen(u),D=1.05,R=380*c.G;u.root=Math.max(u.root,D);anim(u,'rr_beat',D);rrS('heavy',u);
  for(let i=0;i<3;i++)later(u,.12+i*.4,()=>{if(u.dead||u.stun>0)return;const A=u.aim,last=i===2;rrFan(u,A,.36,2,c.full);jx({jfx:'rr_gust',x:u.x,y:u.y,a:A,r:R,w:1.3,t:.5,m:.5});S('wind',u);rrS(last?'boom':'heavy',u);rrSweep(u,u.x,u.y,A,R,1.3);
   for(const e of units)if(!e.dead&&e.team!==u.team&&dist(u,e)<R+e.r&&angDiff(ang(u,e),A)<.65)hit(e,u,(last?16:12)*c.F,{kb:last?800:520,slow:last?2:0,rr:c.id,unblockable:1});
   if(near(u.x,u.y))shake=Math.max(shake,last?.3:.15)})}),
});
Object.assign(NATHERO,{rr:'kylo'});

// ---- logique des objets
// barrière : les tirs ennemis qui arrivent de face repartent en miroir (ils appartiennent au lanceur) ; les ennemis ne passent pas de face et sont repoussés
AUXF.rr_wall=(x,dt)=>{const o=x.owner,ca=Math.cos(x.a),sa=Math.sin(x.a),H=x.len/2;
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team)continue;const dx=p.x-x.x,dy=p.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca,vn=p.vx*ca+p.vy*sa;
  if(vn>=0||Math.abs(s)>H+p.r||f<-8||f>18+p.r+Math.abs(vn)*dt)continue;
  if(p.hook||p.swap||p.drag||p.anchor||p.ret){p.life=0;continue}
  p.vx-=2*vn*ca;p.vy-=2*vn*sa;p.x+=ca*(20+p.r-f);p.y+=sa*(20+p.r-f);p.owner=o;p.src=o;p.hitSet=null;p.life=Math.max(p.life,.6);
  if(near(p.x,p.y)){sparks(p.x,p.y,RRC.wind,6,'wind');jx({jfx:'rr_flick',x:p.x,y:p.y,a:x.a,t:.3,m:.3})}rrS('deflect',o)}
 for(const e of units){if(e.dead||e.team===x.team||e.dash||e.unstop>0||e.phase>0)continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;if(Math.abs(s)>H+e.r||f<0||f>=34+e.r)continue;
  e.x+=ca*(34+e.r-f);e.y+=sa*(34+e.r-f);collide(e);const key=e.c+'|'+e.team;if(SIMT-(x.hs.get(key)||-9)<.8)continue;x.hs.set(key,SIMT);
  VFX='wind';hit(e,o,4*x.F,{kb:420,fx:e.x-ca*60,fy:e.y-sa*60,rr:x.id,unblockable:1});VFX=null}};
// tempête : aspire, ralentit ; 6 coupures ; explosion à la fin
AUXF.rr_storm=(x,dt)=>{const o=x.owner;
 for(const e of units){if(e.dead||e.team===x.team)continue;const d=Math.hypot(e.x-x.x,e.y-x.y);if(d>x.r+e.r)continue;
  if(!(e.unstop>0)&&!e.dash&&!(e.slowImm>0)){if(d>8){const v=Math.min(d,28*dt);e.x+=(x.x-e.x)/d*v;e.y+=(x.y-e.y)/d*v}e.slow=Math.max(e.slow,.3)}}
 if(x.k<=0&&x.n<6){x.k=.4;x.n++;VFX='wind';for(const e of units){if(e.dead||e.team===x.team||Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r)continue;if(hit(e,o,3*x.F,{rr:x.id,unblockable:1})&&near(e.x,e.y))jx({jfx:'rr_cut',ti:rrI(e),x:e.x,y:e.y,a:rnd()*7,t:.3,m:.3})}VFX=null;if(near(x.x,x.y))rrS('saber',o)}
 if(x.t<=0&&!x.done){x.done=1;VFX='wind';for(const e of units)if(!e.dead&&e.team!==x.team&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r+20)hit(e,o,6*x.F,{kb:520,fx:x.x,fy:x.y,rr:x.id,unblockable:1});VFX=null;
  jx({jfx:'rr_burst',x:x.x,y:x.y,r:x.r+20,t:.5,m:.5});if(near(x.x,x.y)){rrS('boom',o);shake=Math.max(shake,.18)}}};
// vague de la Grande Kamaitachi : elle avale les tirs ennemis qu'elle croise
AUXF.rr_wavec=x=>{const p=x.p;if(!p||p.dead||p.life<=0||projs.indexOf(p)<0){x.t=0;return}x.x=p.x;x.y=p.y;const sp=Math.hypot(p.vx,p.vy)||1,cx=p.vx/sp,cy=p.vy/sp;
 for(const q of projs){if(q===p||q.dead||q.life<=0||q.grenade||!q.owner||q.owner.team===x.team)continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.abs(dx*cx+dy*cy)<30+q.r&&Math.abs(-dx*cy+dy*cx)<p.r+12+q.r){q.life=0;if(q.rocket)q.boom=1;if(near(q.x,q.y))sparks(q.x,q.y,RRC.wind,6,'wind')}}};
// vol plané : le lanceur avance à vitesse fixe ; un joueur le dirige à la souris (virage limité), un bot garde son cap ; un étourdissement le fait tomber
AUXF.rr_glide=(x,dt)=>{const u=x.owner;if(!u||u.dead){x.t=0;if(u)u.rr_gl=0;return}
 if(u.stun>0||u.airT>0||!(u.rr_gl>0)){x.t=0;if(u.rr_gl>0&&!(u.airT>0))u.z=0;u.rr_gl=0;return}
 if(u.ctrl==='local'||u.ctrl==='remote'){let d=u.aim-x.a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;x.a+=clamp(d,-3.6*dt,3.6*dt)}
 u.x-=u.vx*dt;u.y-=u.vy*dt;const v=430;u.x=clamp(u.x+Math.cos(x.a)*v*dt,B.x+u.r,B.x+B.w-u.r);u.y=clamp(u.y+Math.sin(x.a)*v*dt,B.y+u.r,B.y+B.h-u.r);collide(u);x.x=u.x;x.y=u.y;
 const el=x.m-x.t;u.z=30*Math.min(1,el/.15,Math.max(0,x.t)/.15);u.moving=0;u.rr_gl=Math.max(0,x.t);u.rr_gh=x.a;
 if(x.t<=0){u.rr_gl=0;u.z=0;jx({jfx:'rr_dust',x:u.x,y:u.y,r:90,t:.4,m:.4});rrS('dash',u);VFX='wind';for(const e of units)if(!e.dead&&e.team!==u.team&&dist(u,e)<90+e.r)hit(e,u,6,{kb:420,fx:u.x,fy:u.y,unblockable:1});VFX=null}};
// Kamatari : n = 0 apparition, 1 aller, 2 demi-tour, 3 retour, 4 disparition
AUXF.rr_weasel=(x,dt)=>{const o=x.owner;
 if(x.n===0){if(x.k<=0){x.n=1;rrS('dash',o);rrS('saber',o)}return}
 if(x.n===2){if(x.k<=0){x.n=3;rrS('saber',o)}return}
 if(x.n===4)return;
 const back=x.n===3,tx=back?x.sx:x.ex,ty=back?x.sy:x.ey,dx=tx-x.x,dy=ty-x.y,d=Math.hypot(dx,dy),st=Math.min(d,1500*dt),px=x.x,py=x.y;
 if(d>.01){x.x+=dx/d*st;x.y+=dy/d*st}
 for(const e of units){if(e.dead||e.team===x.team||x.hs.has(e))continue;if(rrSeg(e.x,e.y,px,py,x.x,x.y)>x.w/2+e.r)continue;x.hs.add(e);VFX='wind';
  const ok=hit(e,o,(back?14:28)*x.F,back?{kb:300,fx:px,fy:py,rr:x.id,unblockable:1}:{air:.5,rr:x.id,unblockable:1});VFX=null;if(ok&&near(e.x,e.y))jx({jfx:'rr_cut',ti:rrI(e),x:e.x,y:e.y,a:x.a,big:1,t:.5,m:.5})}
 for(const p of projs)if(!p.dead&&p.life>0&&!p.grenade&&p.owner&&p.owner.team!==x.team&&Math.hypot(p.x-x.x,p.y-x.y)<x.w/2+p.r+8){p.life=0;if(p.rocket)p.boom=1;if(near(p.x,p.y))sparks(p.x,p.y,RRC.wind,6,'wind')}
 if(st>=d-.5){if(!back){x.n=2;x.k=.3;x.hs.clear();x.a+=Math.PI;if(near(x.x,x.y))jx({jfx:'rr_dust',x:x.x,y:x.y,r:60,t:.4,m:.4})}else{x.n=4;x.t=Math.min(x.t,.4);jx({jfx:'rr_poof',x:x.x,y:x.y,r:40,t:.5,m:.5});rrS('poof',o)}}};

// ---- trait de clan : Trois lunes
const RR_GA={max:250,p:.9},RR_GD={mode:'def',p:.45};
const RR_MT=6,RR_MT2=2; // délai avant que la 1re lune se referme, puis entre deux lunes
TRAITS[12]={nom:'Trois lunes',desc:RRD.trait,
 init(u){u.rr_mn=u.rr_mn|0;u.rr_mT=u.rr_mT||0},
 update(u,dt){if(u.rr_cds!==u.cds){u.rr_cds=u.cds;u.rr_mn=0;u.rr_mT=0} // nouveau ninja ou réapparition
  if(u.rr_mF>0)u.rr_mF=Math.max(0,u.rr_mF-dt);if(u.rr_mn>0){u.rr_mT-=dt;if(u.rr_mT<=0){u.rr_mn--;u.rr_mT=RR_MT2}}
  },
 // dégâts des jutsu Roran : +4 % par lune ; +30 % pour une Kamaitachi sur une cible en l'air ; le 1er coup au but d'un jutsu ouvre une lune
 deal(src,t,dmg,o){if(!o.rr)return dmg;dmg*=1+.04*(src.rr_mn|0);if(o.rrAir&&t.airT>0){dmg*=1.3;say(t,'EN L\'AIR ×1,3','#e8fff8')}
  if(src.rr_cid!==o.rr){src.rr_cid=o.rr;if((src.rr_mn|0)<3){src.rr_mn=(src.rr_mn|0)+1;src.rr_mF=.6;if(src.rr_mn===3)say(src,'TROISIÈME LUNE','#d8b8ff')}}src.rr_mT=RR_MT;return dmg},
 // en vol sur l'éventail, les coups au corps à corps passent dessous
 take(t,src,dmg,o){if(t.rr_gl>0&&o.melee&&src&&src!==t&&src.team!==t.team){if(!(SIMT<(t.rr_mss||0))){t.rr_mss=SIMT+.5;say(t,'EN VOL','#e8fff8')}return -1}return dmg},
 // lunes en croissant qui tournent au sol autour du ninja (allumées : ouvertes) ; à 3, un cercle doré annonce l'éventail grand ouvert
 draw(u,p,S,sk){const n=u.rr_mn|0;if(!n||u.dead)return;const t=performance.now()/1000,full=n>=3,R=26*S*sk,rot=t*(full?2.2:.9);g.save();
  if(full){g.strokeStyle=rgba(RRC.gold,.45+.2*Math.sin(t*7));g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,R*1.08,R*1.08*K,0,0,7);g.stroke()}
  for(let i=0;i<3;i++){const b=rot+i*2.094,x=p.x+Math.cos(b)*R,y=p.y+Math.sin(b)*R*K;rrMoon(x,y,3.4*S*(i===n-1&&u.rr_mF>0?1+u.rr_mF:1),i<n?(full?RRC.moonL:'#b088e0'):'rgba(90,70,120,.35)',b)}g.restore()},
 hud(u,x,y){const n=u.rr_mn|0,t=performance.now()/1000,X=x+10,Y=y-18;g.save();
  rrFanDraw(X,Y+7,13,-Math.PI/2,.45+n*.35,1,n,0);
  text(n>=3?'Trois lunes : éventail grand ouvert prêt':'Trois lunes '+n+'/3',X+18,Y+4,12,n>=3?rgba('#e8d0ff',.8+.2*Math.sin(t*6)):'#d8c8e8','left');g.restore()}};
AFTER.push(()=>UK.push('rr_mn','rr_gl','rr_gh','rr_mF'));
// IA de la Rafale : de près, frapper ; de loin, balayer les tirs qui arrivent (réglée juste avant l'IA de chaque ninja : les bots d'un même perso partagent leur fiche)
AFTER.push(()=>{const A0=ai;ai=function(u,dt){if(u.ch.clan===12){const L=u.ch.abil;let i=L.rr_gi;if(i==null)i=L.rr_gi=L.findIndex(a=>a&&a.key==='rr_gale');if(i>0){const e=u.tgt&&!u.tgt.dead?u.tgt:null;L[i].ai=e&&dist(u,e)<250?RR_GA:RR_GD}}return A0(u,dt)}});

// ---- apparence : l'éventail géant dans le dos
CLOOK[12]=(look,l)=>{if(!(l.d|0)&&!look.gourd)look.back='eventail'}; // éventail dans le dos, sauf si le créateur choisit un autre « Dos »
// l'éventail fermé dépasse au-dessus de l'épaule (3D et 2D) ; de dos, on le voit en entier ; il disparaît quand il est dans les mains (gestes rr_) ou sous les pieds
function rrBackFan(x0,y0,x1,y1,w,lit){const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0);g.save();g.translate(x0,y0);g.rotate(a);g.lineJoin='round';
 g.fillStyle=RRC.rib;g.strokeStyle='#1a120c';g.lineWidth=1.2;g.beginPath();g.moveTo(0,-w*.35);g.lineTo(L,-w*.55);g.quadraticCurveTo(L+w*.45,0,L,w*.55);g.lineTo(0,w*.35);g.closePath();g.fill();g.stroke();
 g.fillStyle='#5a4230';g.fillRect(L*.08,-w*.2,L*.86,w*.12);
 for(let i=0;i<3;i++){const mx=L*(.5+i*.17),mr=w*.3;circ(mx,0,mr,i<lit?RRC.moonL:RRC.moon);g.strokeStyle='#1a120c';g.lineWidth=.8;g.beginPath();g.arc(mx,0,mr,0,7);g.stroke()}
 circ(0,0,w*.32,'#9aa2ae');g.restore()}
// l'éventail planté en Barrière n'est plus dans le dos (ui synchronisé : marche aussi chez l'invité)
function rrWallUp(u){const i=units.indexOf(u);for(const x of aux)if(x.type==='rr_wall'&&x.ui===i&&x.t>0)return true;return false}
STATD.push((u,p,S,sk)=>{if(u.ch.clan!==12||u.dead||u.ch.look.back!=='eventail'||u.rr_gl>0||(u.anim&&String(u.anim.k).startsWith('rr_'))||rrWallUp(u))return;
 const k=S*(sk||1),fy=Math.sin(u.aim||0),side=Math.cos(u.aim||0)>=0?-1:1,z=(u.z||0)*S,lit=u.rr_mn|0;
 if(fy<-.3)rrBackFan(p.x-9*k,p.y-z-22*k,p.x+13*k,p.y-z-90*k,9*k,lit);else rrBackFan(p.x+side*12*k,p.y-z-46*k,p.x+side*24*k,p.y-z-94*k,9*k,lit)});

// ---- animations 3D
Object.assign(ANIM,{
 // Kamaitachi : éventail levé derrière l'épaule, puis taillé en diagonale
 rr_swing:(P,e)=>{const w=e<.3,k=w?ezo(e/.3):ezo(Math.min(1,(e-.3)/.3));
  if(w){pz(P,'armR',-1.2-1.6*k,0,-.3-.5*k);pz(P,'foreR',-.6*k);pz(P,'chest',-.1*k,-.5*k)}else{pz(P,'armR',-2.8+1.5*k,0,-.8+1.7*k);pz(P,'foreR',-.6+.5*k);pz(P,'chest',.25*k,-.5+1.1*k)}
  pz(P,'armL',-.8,0,.5);pz(P,'foreL',-1);pz(P,'thighL',-.4);pz(P,'shinL',.5);pz(P,'thighR',.3);P.root.y=-2},
 // Rafale : balayage horizontal des deux bras, de droite à gauche, le buste tourne
 rr_sweep:(P,e)=>{const k=e<.25?0:ezo(Math.min(1,(e-.25)/.35)),w=e<.25?ezo(e/.25):1;
  pz(P,'armR',-1.4,0,-1.2*w+2.1*k);pz(P,'foreR',-.25);pz(P,'armL',-1.3,0,-.2*w+1.6*k);pz(P,'foreL',-.5);pz(P,'chest',.15,-.7*w+1.4*k);pz(P,'head',0,.3*w-.4*k);
  pz(P,'thighL',-.5);pz(P,'shinL',.6);pz(P,'thighR',.35);P.root.y=-3},
 // Vent ascendant : l'éventail part du sol et monte d'un coup au-dessus de la tête
 rr_lift:(P,e)=>{const d=e<.3,k=d?ezo(e/.3):ezo(Math.min(1,(e-.3)/.25));
  if(d){pz(P,'armR',-.6*k,0,-.2);pz(P,'armL',-.6*k,0,.2);pz(P,'chest',.45*k);P.root.y=-5*k;pz(P,'thighL',-.7*k);pz(P,'shinL',1.1*k);pz(P,'thighR',-.3*k);pz(P,'shinR',.9*k)}
  else{pz(P,'armR',-.6-2.5*k,0,-.2);pz(P,'armL',-.6-2.3*k,0,.2);pz(P,'foreR',-.2);pz(P,'foreL',-.2);pz(P,'chest',.45-.65*k);pz(P,'head',-.3*k);P.root.y=-5+7*k}},
 // Barrière : l'éventail est planté devant, le corps se baisse
 rr_plant:(P,e)=>{const k=ezo(Math.min(1,e/.35));pz(P,'armR',-2.6+1.6*k,0,.15);pz(P,'armL',-2.5+1.5*k,0,-.15);pz(P,'foreR',-.3);pz(P,'foreL',-.3);pz(P,'chest',.45*k);pz(P,'head',-.25*k);
  pz(P,'thighL',-.8*k);pz(P,'shinL',1*k);pz(P,'thighR',.2*k);pz(P,'shinR',.8*k);P.root.y=-5*k},
 // Tempête tranchante : un tour complet, éventail tendu
 rr_whirl:(P,e)=>{const k=ezio(Math.min(1,e/.8));P.rootR.y=6.283*k;pz(P,'armR',-1.5,0,-.9);pz(P,'foreR',-.1);pz(P,'armL',-1.1,0,.9);pz(P,'foreL',-.4);pz(P,'chest',.1);P.root.y=-2-2*bump(e)},
 // Grande Kamaitachi : éventail tenu à deux mains au-dessus de la tête, puis abattu avec un grand pas
 rr_big:(P,e)=>{const w=e<.4,k=w?ezo(e/.4):ezo(Math.min(1,(e-.4)/.2));
  if(w){pz(P,'armR',-3*k,0,-.25);pz(P,'armL',-3*k,0,.25);pz(P,'foreR',-.4*k);pz(P,'foreL',-.4*k);pz(P,'chest',-.25*k);pz(P,'head',-.2*k);pz(P,'thighR',.3*k)}
  else{pz(P,'armR',-3+2*k,0,-.25);pz(P,'armL',-3+2*k,0,.25);pz(P,'foreR',-.4+.3*k);pz(P,'foreL',-.4+.3*k);pz(P,'chest',-.25+.75*k);pz(P,'head',-.2+.3*k);
   pz(P,'thighL',-.9*k);pz(P,'shinL',.7*k);pz(P,'thighR',.5*k);P.root.y=-5*k;P.root.z=4*k}},
 // Vol sur l'éventail : accroupi sur l'éventail, bras écartés pour l'équilibre
 rr_ride:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.15));pz(P,'thighL',-.6*k,0,.15);pz(P,'shinL',1*k);pz(P,'thighR',-.2*k,0,-.15);pz(P,'shinR',.8*k);pz(P,'armL',-.3,0,1.2*k);pz(P,'armR',-.4,0,-1.2*k);pz(P,'foreL',-.2);pz(P,'foreR',-.2);
  pz(P,'chest',.25*k,.2*Math.sin(t*3));pz(P,'cape',-.6*k);pz(P,'cape2',-.4*k);pz(P,'hair',-.4*k);P.root.y=-4*k+Math.sin(t*7)*.8},
 // Contre-vent : éventail levé puis abattu sur le sol
 rr_slam:(P,e)=>{const w=e<.3,k=w?ezo(e/.3):ezo(Math.min(1,(e-.3)/.18));
  if(w){pz(P,'armR',-2.9*k,0,-.2);pz(P,'armL',-2.7*k,0,.2);pz(P,'chest',-.2*k)}else{pz(P,'armR',-2.9+2.4*k,0,-.2);pz(P,'armL',-2.7+2.2*k,0,.2);pz(P,'chest',-.2+.8*k);pz(P,'thighL',-.8*k);pz(P,'shinL',1.1*k);pz(P,'thighR',-.2*k);pz(P,'shinR',.9*k);P.root.y=-6*k}},
 // Kamatari : le pouce à la bouche, puis la paume frappe l'éventail posé au sol
 rr_summon:(P,e)=>{if(e<.35){const k=ezo(e/.35);pz(P,'armR',-1.3*k,0,-.1);pz(P,'foreR',-2.1*k);pz(P,'head',.15*k);pz(P,'armL',-.4,0,.3)}
  else{const k=ezo(Math.min(1,(e-.35)/.2));pz(P,'armR',-1.3+.4*k,0,-.1);pz(P,'foreR',-2.1+1.9*k);pz(P,'armL',-.9*k,0,.3);pz(P,'foreL',-.2);pz(P,'chest',.55*k);pz(P,'head',-.2*k);
   pz(P,'thighL',-.9*k);pz(P,'shinL',1.3*k);pz(P,'thighR',.1*k);pz(P,'shinR',1.4*k);P.root.y=-8*k}},
 // Tempête de l'éventail : trois battements amples
 rr_beat:(P,e)=>{const ph=Math.min(.999,e*1.04)*3%1,k=ph<.4?ezo(ph/.4):1-ezo(Math.min(1,(ph-.4)/.6));
  pz(P,'armR',-2.6+1.4*k,0,-.9+1.6*k);pz(P,'armL',-2.2+1.2*k,0,-.2+1.1*k);pz(P,'foreR',-.3);pz(P,'foreL',-.5);pz(P,'chest',-.15+.5*k,-.5+.9*k);
  pz(P,'thighL',-.6);pz(P,'shinL',.7);pz(P,'thighR',.4);pz(P,'shinR',.2);P.root.y=-3-1.5*k},
 // style : coup droit, revers, puis grand coup à deux mains
 rr_st1:(P,e)=>{const k=ezo(Math.min(1,e/.5));pz(P,'armR',-1.5,0,-.9+1.6*k);pz(P,'foreR',-.3);pz(P,'chest',.1,-.4+.8*k);pz(P,'armL',-.6,0,.4);pz(P,'foreL',-1)},
 rr_st2:(P,e)=>{const k=ezo(Math.min(1,e/.5));pz(P,'armR',-1.4,0,.8-1.7*k);pz(P,'foreR',-.6+.4*k);pz(P,'chest',.1,.4-.8*k);pz(P,'armL',-.6,0,.4);pz(P,'foreL',-1)},
 rr_st3:(P,e)=>{const w=e<.35,k=w?ezo(e/.35):ezo(Math.min(1,(e-.35)/.3));
  if(w){pz(P,'armR',-1.2-1.4*k,0,-.6*k);pz(P,'armL',-1.1-1.3*k,0,-.3*k);pz(P,'chest',-.15*k,-.4*k)}else{pz(P,'armR',-2.6+1.3*k,0,-.6+1.5*k);pz(P,'armL',-2.4+1.2*k,0,-.3+1.3*k);pz(P,'chest',-.15+.4*k,-.4+.9*k);pz(P,'thighL',-.4*k);pz(P,'shinL',.5*k);P.root.y=-2*k}},
});

// ---- visuels
// éventail ouvert (repère écran) : pivot (cx,cy), rayon R, direction phi, ouverture span ; lit = lunes allumées ; gl = halo doré (grand ouvert)
function rrFanDraw(cx,cy,R,phi,span,al,lit,gl){const n=8,a0=phi-span/2,a1=phi+span/2,r0=R*.28;g.save();g.globalAlpha*=al;g.lineJoin='round';
 if(gl){g.globalCompositeOperation='lighter';g.fillStyle=rgba(RRC.gold,.22);g.beginPath();g.arc(cx,cy,R*1.18,a0-.12,a1+.12);g.lineTo(cx,cy);g.closePath();g.fill();g.globalCompositeOperation='source-over'}
 g.fillStyle=RRC.paper;g.beginPath();g.arc(cx,cy,R,a0,a1);g.arc(cx,cy,r0,a1,a0,true);g.closePath();g.fill();
 g.fillStyle=RRC.fold;for(let i=0;i<n;i+=2){const b0=a0+span*i/n,b1=a0+span*(i+1)/n;g.beginPath();g.arc(cx,cy,R,b0,b1);g.arc(cx,cy,r0,b1,b0,true);g.closePath();g.fill()}
 g.strokeStyle=RRC.rib;g.lineWidth=Math.max(1,R*.05);g.beginPath();g.arc(cx,cy,R,a0,a1);g.arc(cx,cy,r0,a1,a0,true);g.closePath();g.stroke();
 g.lineWidth=Math.max(.8,R*.035);g.beginPath();for(let i=0;i<=n;i++){const b=a0+span*i/n;g.moveTo(cx+Math.cos(b)*R*.1,cy+Math.sin(b)*R*.1);g.lineTo(cx+Math.cos(b)*R,cy+Math.sin(b)*R)}g.stroke();
 if(span>.5)for(let i=0;i<3;i++){const b=phi+(i-1)*span*.3,mx=cx+Math.cos(b)*R*.66,my=cy+Math.sin(b)*R*.66,mr=R*.12;circ(mx,my,mr,i<lit?RRC.moonL:RRC.moon);g.strokeStyle=RRC.rib;g.lineWidth=Math.max(.6,R*.02);g.beginPath();g.arc(mx,my,mr,0,7);g.stroke()}
 circ(cx,cy,R*.09,RRC.rib);g.restore()}
// petite lune en croissant
function rrMoon(x,y,r,col,b){g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.moveTo(x+Math.cos(b)*r*.55+r*.8,y+Math.sin(b)*r*.55-r*.2);g.arc(x+Math.cos(b)*r*.55,y+Math.sin(b)*r*.55-r*.2,r*.8,0,7,true);g.fill('evenodd')}
// geste de l'éventail dans les mains (suivi du lanceur)
JFXD.rr_fan=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=f.a,q=P(u.x+Math.cos(a)*14,u.y+Math.sin(a)*14,(u.z||0)+38),s=q.s,ra=Math.atan2(Math.sin(a)*K,Math.cos(a)),up=-Math.PI/2,R=(f.full?44:36)*s;let phi,span=1.45;
 switch(f.n){case 1:phi=ra-1.5+2.6*ezo(Math.min(1,e/.55));break;case 2:phi=ra-1.7+3.4*ezo(Math.min(1,e/.6));break;
  case 3:phi=lerp(ra+.5,up,ezo(Math.min(1,e/.5)));break;default:phi=e<.4?up-.5:lerp(up-.5,ra,ezo(Math.min(1,(e-.4)/.2)))}
 const sw=f.n===4?(e<.4?0:Math.min(1,(e-.4)/.2)):Math.min(1,e/.55);span*=Math.min(1,e*6+.2);const al=Math.min(1,k*5);
 // traînée du balayage
 if(sw>.05&&sw<1&&f.n!==3){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(RRC.wind,.55*al);g.lineWidth=R*.5;g.lineCap='round';g.beginPath();g.arc(q.x,q.y,R*.8,Math.min(phi,phi-(f.n===4?-1:1)*1.4*sw),Math.max(phi,phi-(f.n===4?-1:1)*1.4*sw));g.stroke();g.restore()}
 rrFanDraw(q.x,q.y,R,phi,span,al,f.full?3:u.rr_mn|0,f.full)};
// faux de vent (Kamaitachi) : croissant blanc à liseré doré et ses images rémanentes
PROJD.rr_sickle=(p,R,ra,t)=>{g.rotate(ra);const L=R*2.1;g.globalCompositeOperation='lighter';for(let i=3;i>=1;i--){g.strokeStyle=rgba(RRC.wind2,.3/i);g.lineWidth=4;g.beginPath();g.arc(-R*.5-i*R*.75,0,L,-1,1);g.stroke()}
 g.globalCompositeOperation='source-over';g.fillStyle=rgba('#f6fffc',.93);g.beginPath();g.arc(-R*.5,0,L,-1.05,1.05);g.arc(-R*1.3,0,L*.97,1,-1,true);g.closePath();g.fill();
 g.strokeStyle=rgba(RRC.gold,.95);g.lineWidth=1.8;g.beginPath();g.arc(-R*.5,0,L,-1.05,1.05);g.stroke();g.strokeStyle=rgba('#2a7a68',.45);g.lineWidth=1;g.beginPath();g.arc(-R*1.3,0,L*.97,-1,1);g.stroke();
 g.strokeStyle=rgba('#ffffff',.7);g.lineWidth=1.2;g.beginPath();for(let i=-2;i<=2;i++){const y=i*L*.3,x0=-R*1.5+Math.sin(t/50+i)*2;g.moveTo(x0,y);g.lineTo(x0-R*(1.4+(i&1)*.8),y*1.05)}g.stroke()};
// lame du style (petite) ; la bourrasque du 3e coup est double
PROJD.rr_gust=(p,R,ra,t)=>{g.rotate(ra);const big=R>12,L=R*(big?1.7:1.9);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(RRC.wind2,.45);g.lineWidth=2;g.beginPath();g.arc(-R*1.6,0,L,-.9,.9);g.stroke();
 g.fillStyle=rgba('#f2fffa',.85);g.beginPath();g.arc(-R*.4,0,L,-1,1);g.arc(-R*1.1,0,L*.96,.95,-.95,true);g.closePath();g.fill();
 if(big){g.fillStyle=rgba(RRC.wind2,.55);g.beginPath();g.arc(-R*1.2,0,L*.9,-1,1);g.arc(-R*1.8,0,L*.86,.95,-.95,true);g.closePath();g.fill();g.strokeStyle=rgba(RRC.gold,.8);g.lineWidth=1.4;g.beginPath();g.arc(-R*.4,0,L,-1,1);g.stroke()}
 g.globalCompositeOperation='source-over'};
// vague de la Grande Kamaitachi : trois croissants géants empilés, poussière soulevée
PROJD.rr_wave=(p,R,ra,t)=>{g.rotate(ra);const L=R*1.75,gr=Math.min(1,(p.life0-p.life)/.12+.4);g.scale(gr,gr);
 g.fillStyle=rgba('#c8fff0',.16);g.beginPath();g.arc(-R*1.2,0,L*1.08,-1.1,1.1);g.arc(-R*3,0,L,1.05,-1.05,true);g.closePath();g.fill();
 for(let i=2;i>=0;i--){const o=-i*R*.55,sp=1.05-i*.08;g.fillStyle=i?rgba(RRC.wind2,.45-i*.1):rgba('#f6fffc',.92);g.beginPath();g.arc(o-R*.5,0,L,-sp,sp);g.arc(o-R*1.15,0,L*.97,sp-.05,-sp+.05,true);g.closePath();g.fill()}
 g.strokeStyle=RRC.gold;g.lineWidth=2.2;g.beginPath();g.arc(-R*.5,0,L,-1.05,1.05);g.stroke();
 g.strokeStyle=rgba('#ffffff',.8);g.lineWidth=1.4;g.beginPath();for(let i=-4;i<=4;i++){const y=i*L*.2,x0=-R*1.4+Math.sin(t/40+i*1.7)*4;g.moveTo(x0,y);g.lineTo(x0-R*(1+((i+4)%3)*.5),y)}g.stroke();
 g.fillStyle=rgba('#d8c8a0',.7);for(let i=0;i<10;i++){const y=((i*37)%19-9)/9*L*.8,x=-R*(1.2+((t/180+i*.13)%1)*2.2);g.fillRect(x,y,2.4,2.4)}};
// cône de vent (Rafale, Tempête de l'éventail) : voile au sol, traits qui filent, front qui s'ouvre
JFXD.rr_gust=(f,k,e)=>{const R=f.r,A=f.w,m=Math.min(1,e*2.2);g.globalCompositeOperation='lighter';
 const q0=P(f.x,f.y,4);g.fillStyle=rgba('#c8fff0',.13*k);g.beginPath();g.moveTo(q0.x,q0.y);for(let i=0;i<=10;i++){const b=f.a-A/2+A*i/10,q=P(f.x+Math.cos(b)*R*m,f.y+Math.sin(b)*R*m,4);g.lineTo(q.x,q.y)}g.closePath();g.fill();
 g.lineCap='round';for(let i=0;i<16;i++){const b=f.a-A/2+A*((i*.618)%1),d0=R*(.12+e*.9)*(.55+((i*37)%45)/100),L=36+(i%3)*18,z=8+(i%5)*10,a1=P(f.x+Math.cos(b)*d0,f.y+Math.sin(b)*d0,z),a2=P(f.x+Math.cos(b)*Math.max(0,d0-L),f.y+Math.sin(b)*Math.max(0,d0-L),z);
  g.strokeStyle=rgba(i%3?RRC.wind:RRC.wind2,.8*k);g.lineWidth=(2.6-(i%3)*.6)*a1.s;g.beginPath();g.moveTo(a2.x,a2.y);g.lineTo(a1.x,a1.y);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.65*k);g.lineWidth=3;g.beginPath();for(let i=0;i<=12;i++){const b=f.a-A/2+A*i/12,d=R*Math.min(1,e*1.3),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,16);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke();
 g.globalCompositeOperation='source-over';g.fillStyle=rgba('#d8c8a0',.7*k);for(let i=0;i<12;i++){const b=f.a-A/2+A*((i*.37)%1),d=R*(.2+e*.8)*((i%4)/5+.2),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,6+e*30*((i%3)/3));g.fillRect(q.x,q.y,2.4*q.s,2.4*q.s)}};
// entaille : deux traits croisés sur la cible
JFXD.rr_cut=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,34),s=q.s*(f.big?1.5:1),L=22*s*Math.min(1,e*4);g.lineCap='round';
 for(const d of[-.6,.6]){const b=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a))+Math.PI/2+d,cx=Math.cos(b)*L,cy=Math.sin(b)*L;g.strokeStyle=rgba('#ffffff',.95*k);g.lineWidth=3*s;g.beginPath();g.moveTo(q.x-cx,q.y-cy);g.lineTo(q.x+cx,q.y+cy);g.stroke();g.strokeStyle=rgba('#c83040',.7*k);g.lineWidth=1.2*s;g.stroke()}};
// Vent ascendant, avant l'éruption : spirale de poussière au sol
JFXD.rr_swirl=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*q.s;g.strokeStyle=rgba(RRC.wind2,.7);g.lineWidth=2;for(let j=0;j<3;j++){g.beginPath();for(let i=0;i<=10;i++){const d=(1-i/11)*(.4+.6*e),b=t*6+j*2.094+i*.55;const x=q.x+Math.cos(b)*R*d,y=q.y+Math.sin(b)*R*d*K;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 g.fillStyle=rgba('#d8c8a0',.85);for(let i=0;i<10;i++){const b=t*5+i*.63,d=R*(.3+(i%3)*.25),h=((t*1.6+i*.1)%1)*30*e*q.s;g.fillRect(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-h,2.2*q.s,2.2*q.s)}};
// colonne de vent : tornade qui monte et se dissipe
JFXD.rr_column=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,H=170*s*Math.min(1,e*3),R=f.r*s;g.globalCompositeOperation='lighter';
 for(let i=0;i<10;i++){const h=H*i/10,rr=R*(.45+i*.07)*(1+e*.3),a0=t*10+i*.8;g.strokeStyle=rgba(i%2?RRC.wind:RRC.wind2,.75*k);g.lineWidth=(5-i*.3)*s;g.beginPath();g.ellipse(q.x+Math.sin(t*4+i)*3*s,q.y-h,rr,rr*.32,0,a0,a0+4.4);g.stroke()}
 g.globalCompositeOperation='source-over';g.fillStyle=rgba('#d8c8a0',.8*k);for(let i=0;i<14;i++){const b=t*7+i*.45,d=R*(.3+(i%4)*.15),h=H*((t*.9+i*.07)%1);g.fillRect(q.x+Math.cos(b)*d,q.y-h+Math.sin(b)*d*.3,2.6*s,2.6*s)}
 g.strokeStyle=rgba(RRC.wind,.7*k);g.lineWidth=3;gEll(f.x,f.y,f.r*(.5+e*.7));g.stroke()};
// ligne d'alerte (Grande Kamaitachi qui se prépare)
JFXD.rr_tline=(f,k,e)=>{const c=Math.cos(f.a),s=Math.sin(f.a),h=f.w/2,L=f.len,pts=[[0,-h],[L,-h],[L,h],[0,h]].map(([a,b])=>P(f.x+c*a-s*b,f.y+s*a+c*b,1));poly(pts,rgba('#c8fff0',.1+.18*e));
 g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=2;g.setLineDash([10,6]);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.stroke();g.setLineDash([]);
 const m=P(f.x+c*L*e,f.y+s*L*e,1);g.strokeStyle=rgba(RRC.gold,.8);g.lineWidth=3;g.beginPath();const l0=P(f.x+c*L*e-s*h,f.y+s*L*e+c*h,1),l1=P(f.x+c*L*e+s*h,f.y+s*L*e-c*h,1);g.moveTo(l0.x,l0.y);g.lineTo(l1.x,l1.y);g.stroke()};
// souffle au sol (Contre-vent, fin de la Tempête) : anneau qui s'ouvre et traits rayonnants
JFXD.rr_burst=(f,k,e)=>{const q=P(f.x,f.y,4),ro=f.r*(.3+e*.85);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(RRC.wind,.85*k);g.lineWidth=2+5*k;gEll(f.x,f.y,ro);g.stroke();
 g.strokeStyle=rgba(RRC.wind2,.75*k);g.lineWidth=2;g.beginPath();for(let i=0;i<14;i++){const b=i*.449+.2,a=P(f.x+Math.cos(b)*ro*.55,f.y+Math.sin(b)*ro*.55,8+(i%3)*8),c=P(f.x+Math.cos(b)*ro*1.05,f.y+Math.sin(b)*ro*1.05,8+(i%3)*8);g.moveTo(a.x,a.y);g.lineTo(c.x,c.y)}g.stroke();
 g.globalCompositeOperation='source-over';g.fillStyle=rgba('#d8c8a0',.6*k);for(let i=0;i<10;i++){const b=i*.63,p=P(f.x+Math.cos(b)*ro*.8,f.y+Math.sin(b)*ro*.8,6+e*18);g.beginPath();g.ellipse(p.x,p.y,(6+e*6)*p.s,(4+e*3)*p.s,0,0,7);g.fill()}};
// poussière soulevée
JFXD.rr_dust=(f,k,e)=>{for(let i=0;i<8;i++){const b=i*.785+.4,p=P(f.x+Math.cos(b)*f.r*(.4+e*.7),f.y+Math.sin(b)*f.r*(.4+e*.7),4+e*12);g.fillStyle=rgba(i%2?'#d8c8a0':'#e8e0cc',.55*k);g.beginPath();g.ellipse(p.x,p.y,(6+e*8)*p.s,(4+e*5)*p.s,0,0,7);g.fill()}
 g.strokeStyle=rgba(RRC.wind,.6*k);g.lineWidth=2;gEll(f.x,f.y,f.r*(.3+e*.8));g.stroke()};
// tir renvoyé par la barrière
JFXD.rr_flick=(f,k,e)=>{const q=P(f.x,f.y,28),R=(10+e*18)*q.s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=2.5;g.beginPath();g.arc(q.x,q.y,R,0,7);g.stroke();circ(q.x,q.y,R*.4*k,rgba(RRC.gold,.8))};
// fumée d'invocation
JFXD.rr_poof=(f,k,e)=>{for(let i=0;i<9;i++){const b=i*.7+.3,d=f.r*(.2+e*.7)*(i%3?.9:.5),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,16+(i%4)*12+e*20),r=(12+(i%3)*5)*p.s*(.6+e*.6);g.fillStyle=rgba(i%2?'#f2f2f2':'#d8dce4',.85*k);g.beginPath();g.arc(p.x,p.y,r,0,7);g.fill()}};
// les 3 lunes montent au-dessus du ninja (éventail grand ouvert)
JFXD.rr_moons=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,q=P(o.x,o.y,80+e*40),s=q.s;g.globalAlpha=Math.min(1,k*3);for(let i=0;i<3;i++){const x=q.x+(i-1)*16*s,y=q.y-Math.sin(e*3+i)*3*s;g.globalCompositeOperation='lighter';circ(x,y,9*s,rgba(RRC.moonL,.35));g.globalCompositeOperation='source-over';circ(x,y,5.5*s,RRC.moon);g.strokeStyle=RRC.moonL;g.lineWidth=1.5;g.beginPath();g.arc(x,y,5.5*s,0,7);g.stroke()}g.globalAlpha=1};
// vol plané : l'éventail ouvert à plat sous les pieds, traînée de vent
JFXD.rr_ride=(f,k,e,t,u)=>{if(!u||u.dead||!(u.rr_gl>0))return;const h=u.rr_gh??f.a,z=Math.max(0,(u.z||0)-2),c=Math.cos(h),s=Math.sin(h),bx=u.x-c*26,by=u.y-s*26,R=58,sp=1.5,n=8;
 const pt=(b,r)=>P(bx+Math.cos(h+b)*r,by+Math.sin(h+b)*r,z);const sh=P(u.x,u.y,0);g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(sh.x,sh.y,34*sh.s,14*sh.s,0,0,7);g.fill();
 g.lineCap='round';g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const l=(i-2)*12,a0=P(bx-c*6-s*l,by-s*6+c*l,z+4),a1=P(bx-c*(40+(i%2)*22)-s*l,by-s*(40+(i%2)*22)+c*l,z+4);g.strokeStyle=rgba(RRC.wind,.6);g.lineWidth=2;g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.stroke()}g.globalCompositeOperation='source-over';
 g.fillStyle=RRC.paper;g.strokeStyle=RRC.rib;g.lineWidth=1.5;g.beginPath();for(let i=0;i<=n;i++){const p=pt(-sp/2+sp*i/n,R);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}for(let i=n;i>=0;i--){const p=pt(-sp/2+sp*i/n,R*.28);g.lineTo(p.x,p.y)}g.closePath();g.fill();g.stroke();
 g.beginPath();for(let i=0;i<=n;i++){const a=pt(-sp/2+sp*i/n,R*.1),b=pt(-sp/2+sp*i/n,R);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}g.lineWidth=1;g.stroke();
 for(let i=0;i<3;i++){const m=pt((i-1)*sp*.3,R*.66);g.fillStyle=i<(u.rr_mn|0)?RRC.moonL:RRC.moon;g.beginPath();g.ellipse(m.x,m.y,6*m.s,6*m.s*K,0,0,7);g.fill()}};
// barrière : l'éventail géant planté debout, le vent qui ressort devant
AUXD.rr_wall=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),H=x.len/2,R=H*1.05,n=10,sp=2.2,b0=-sp/2;const W=(s,z)=>P(x.x-sa*s,x.y+ca*s,z);
 poly([W(-H,0),W(H,0),P(x.x+ca*70-sa*H,x.y+sa*70+ca*H,0),P(x.x+ca*70+sa*H,x.y+sa*70-ca*H,0)],rgba('#c8fff0',.1*k));
 g.lineCap='round';for(let i=0;i<10;i++){const s=((i*.618)%1-.5)*x.len,d=((t*2.4+i*.13)%1),a=P(x.x+ca*(10+d*70)-sa*s,x.y+sa*(10+d*70)+ca*s,10+(i%4)*12),b=P(x.x+ca*(10+d*70+26)-sa*s,x.y+sa*(10+d*70+26)+ca*s,10+(i%4)*12);g.strokeStyle=rgba(RRC.wind,.7*k*(1-d));g.lineWidth=2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
 const rise=Math.min(1,(x.m-x.t)/.2),pt=(b,r)=>{const s=Math.sin(b)*r,l=Math.cos(b)*r*.55*rise;return P(x.x-sa*s-ca*l,x.y+ca*s-sa*l,Math.cos(b)*r*.8*rise+4)}; // l'éventail penche vers le lanceur (lisible de profil)
 g.globalAlpha=k;
 g.fillStyle=RRC.paper;g.strokeStyle=RRC.rib;g.lineWidth=2;g.beginPath();for(let i=0;i<=n;i++){const p=pt(b0+sp*i/n,R);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}for(let i=n;i>=0;i--){const p=pt(b0+sp*i/n,R*.26);g.lineTo(p.x,p.y)}g.closePath();g.fill();
 g.fillStyle=RRC.fold;for(let i=0;i<n;i+=2){g.beginPath();const a=pt(b0+sp*i/n,R),b=pt(b0+sp*(i+1)/n,R),c=pt(b0+sp*(i+1)/n,R*.26),d=pt(b0+sp*i/n,R*.26);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.lineTo(d.x,d.y);g.closePath();g.fill()}
 g.beginPath();for(let i=0;i<=n;i++){const p=pt(b0+sp*i/n,R);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}for(let i=n;i>=0;i--){const p=pt(b0+sp*i/n,R*.26);g.lineTo(p.x,p.y)}g.closePath();g.stroke();
 g.lineWidth=1.4;g.beginPath();for(let i=0;i<=n;i++){const a=pt(b0+sp*i/n,R*.08),b=pt(b0+sp*i/n,R);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}g.stroke();
 for(let i=0;i<3;i++){const m=pt((i-1)*sp*.3,R*.66);circ(m.x,m.y,H*.13*m.s,RRC.moon);g.strokeStyle=RRC.rib;g.lineWidth=1;g.beginPath();g.arc(m.x,m.y,H*.13*m.s,0,7);g.stroke()}
 const pv=pt(0,0);circ(pv.x,pv.y,5*pv.s,RRC.rib);g.globalAlpha=1;
 if(x.t<.5){g.globalCompositeOperation='lighter';g.strokeStyle=rgba(RRC.wind,.5*(1-x.t/.5));g.lineWidth=3;const a=W(-H,6),b=W(H,6);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.globalCompositeOperation='source-over'}};
// tempête tranchante : disque qui tourbillonne, lames en croissant qui tournent à plusieurs hauteurs
AUXD.rr_storm=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba('#c8fff0',.13*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba(RRC.wind,.6*k);g.lineWidth=2;g.setLineDash([8,6]);g.lineDashOffset=-t*40;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 g.strokeStyle=rgba(RRC.wind2,.6*k);g.lineWidth=2.5;for(let j=0;j<4;j++){g.beginPath();for(let i=0;i<=10;i++){const d=1-i/11,b=-t*4+j*1.571+i*.5,xx=q.x+Math.cos(b)*R*d,yy=q.y+Math.sin(b)*R*d*K;i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
 g.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const b=-t*(5+(i%3))+i*.7,d=x.r*(.35+(i%3)*.25),z=12+(i%4)*16+Math.sin(t*3+i)*4,p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,z),ra=Math.atan2(Math.cos(b)*K,-Math.sin(b));
  g.save();g.translate(p.x,p.y);g.rotate(ra);g.scale(p.s,p.s);g.fillStyle=rgba('#f6fffc',.85*k);g.beginPath();g.arc(-4,0,14,-1,1);g.arc(-8,0,13.5,.95,-.95,true);g.closePath();g.fill();g.strokeStyle=rgba(RRC.gold,.7*k);g.lineWidth=1;g.beginPath();g.arc(-4,0,14,-1,1);g.stroke();g.restore()}
 g.globalCompositeOperation='source-over';g.fillStyle=rgba('#d8c8a0',.7*k);for(let i=0;i<12;i++){const d=(t*.4+i*.083)%1,b=i*2.4-t*4-d*3,p=P(x.x+Math.cos(b)*x.r*(1-d),x.y+Math.sin(b)*x.r*(1-d),d*40);g.fillRect(p.x,p.y,2.2*p.s,2.2*p.s)}};
// Kamatari : belette blanche borgne, grande faux, portée par un tourbillon ; ligne d'alerte pendant l'apparition
AUXD.rr_weasel=(x,k,t)=>{const c=Math.cos(x.a),s0=Math.sin(x.a);
 if(x.n===0){const h=x.w/2,L=x.len||640,pts=[[0,-h],[L,-h],[L,h],[0,h]].map(([a,b])=>P(x.x+c*a-s0*b,x.y+s0*a+c*b,1));poly(pts,rgba('#c8fff0',.16));g.strokeStyle=rgba('#ffffff',.65);g.lineWidth=2;g.setLineDash([12,6]);g.lineDashOffset=-t*60;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.stroke();g.setLineDash([])}
 if(x.n>=4&&x.t<.25)return;const grow=x.n===0?Math.min(1,(.45-Math.max(0,x.k))/.3+.2):1,run=x.n===1||x.n===3,q=P(x.x,x.y,run?22:14),S=q.s*1.3*grow,f=c>=0?1:-1;
 // tourbillon sous la belette
 g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const a0=t*14+i*1.4;g.strokeStyle=rgba(i%2?RRC.wind:RRC.wind2,.7);g.lineWidth=3*S;g.beginPath();g.ellipse(q.x,q.y+(8-i*4)*S,(18-i*2)*S,(6-i)*S,0,a0,a0+4);g.stroke()}
 if(run){g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=2;g.beginPath();for(let i=0;i<5;i++){const y=q.y-(4+i*7)*S;g.moveTo(q.x-f*(14+i*3)*S,y);g.lineTo(q.x-f*(50+i*9)*S,y)}g.stroke()}g.globalCompositeOperation='source-over';
 g.save();g.translate(q.x,q.y);g.scale(S*f,S);g.rotate(run?.18:0);g.lineJoin='round';
 const O='#2a2020',W='#f2ece0',spin=x.n===2?t*20:0;
 // queue en panache
 g.fillStyle=W;g.strokeStyle=O;g.lineWidth=1.4;g.beginPath();g.moveTo(-10,-12);g.quadraticCurveTo(-26,-18,-28,-30);g.quadraticCurveTo(-18,-24,-6,-16);g.closePath();g.fill();g.stroke();
 // corps
 g.beginPath();g.ellipse(0,-14,13,7.5,-.15,0,7);g.fill();g.stroke();
 // pattes
 g.beginPath();g.moveTo(-6,-8);g.lineTo(-8,-2);g.moveTo(6,-8);g.lineTo(9,-2);g.stroke();
 // tête, oreilles, œil (l'autre est barré d'une cicatrice), museau
 g.beginPath();g.arc(13,-21,6.5,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(9,-26);g.lineTo(10,-31);g.lineTo(13,-27);g.moveTo(14,-27);g.lineTo(17,-31);g.lineTo(17,-25);g.fill();g.stroke();
 g.fillStyle=O;g.fillRect(15,-23,1.8,1.8);g.strokeStyle='#a83030';g.lineWidth=1.2;g.beginPath();g.moveTo(10,-25);g.lineTo(13,-19);g.stroke();g.fillStyle='#d88080';g.beginPath();g.arc(19.2,-20,1.3,0,7);g.fill();
 // grande faux : manche tenu au-dessus de la tête, lame recourbée vers l'avant (tourne pendant le demi-tour)
 g.save();g.translate(4,-20);g.rotate(-.5+spin+(run?.6:0));g.strokeStyle='#5a3a24';g.lineWidth=2.4;g.beginPath();g.moveTo(-6,10);g.lineTo(8,-26);g.stroke();
 g.fillStyle='#e4ecf2';g.strokeStyle='#4a5260';g.lineWidth=1;g.beginPath();g.moveTo(8,-26);g.quadraticCurveTo(26,-30,34,-12);g.quadraticCurveTo(24,-22,7,-21);g.closePath();g.fill();g.stroke();
 g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=1;g.beginPath();g.moveTo(10,-25);g.quadraticCurveTo(25,-28,32,-14);g.stroke();g.restore();g.restore();
 if(x.n===2){g.globalCompositeOperation='lighter';g.strokeStyle=rgba(RRC.wind,.8);g.lineWidth=3;g.beginPath();g.arc(q.x,q.y-24*S,38*S,t*20,t*20+4.5);g.stroke();g.globalCompositeOperation='source-over'}};
AUXD.rr_glide=()=>{};AUXD.rr_wavec=()=>{};
