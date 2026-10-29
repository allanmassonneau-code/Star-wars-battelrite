// ===== Fûton (vent) =====
// Identité : repousser, trancher, bloquer. Les poussées sont des glissades franches (la cible ne peut pas marcher contre) ;
// la Grande balle d'air écrase la cible contre un obstacle ou un mur. Le vent porte les tirs alliés (le feu grossit en le traversant) ; Fûton bat Raiton.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('n2',[
 [1,'D','x.fu_wall','Fûton : Mur de vent','Mur de vent 4 s : bloque et repousse les ennemis, arrête leurs tirs, accélère les tirs alliés','wind'],
 [1,'D','x.fu_bullet','Fûton : Balle d\'air','Balle d\'air rapide qui repousse un peu et interrompt les mudras','wind'],
 [1,'C','x.fu_tri','Fûton : Triple balle d\'air','3 balles d\'air en rafale qui suivent ta visée ; la 3e, plus grosse, repousse fort et interrompt','wind'],
 [1,'C','x.fu_big','Fûton : Grande balle d\'air','Grosse balle lente qui repousse loin ; projetée contre un obstacle, la cible est étourdie','wind'],
 [1,'B','x.fu_shotgun','Fûton : Rafale à bout portant','Immobile, 10 balles d\'air en éventail : ravage au contact, le recul te rejette en arrière','wind'],
 [1,'B','x.fu_stack','Fûton : Balles chargées','3 balles d\'air tournent autour de toi et interceptent les tirs ; relance pour les tirer (5 s)','wind'],
 [1,'A','x.fu_line','Fûton : Lame d\'air','Lame de vent très rapide qui transperce toute la ligne et repousse chaque ennemi touché','wind'],
 [1,'A','x.fu_breath','Fûton : Souffle','Immobile, souffle continu : blesse, ralentit, repousse et disperse les tirs ennemis','wind'],
 [2,'C','x.fu_leap','Fûton : Envol','Bond porté par le vent ; la rafale du départ repousse les ennemis proches','wind'],
 [5,'S','x.fu_corridor','Fûton : Couloir de vent','Rafale puis couloir 4 s : ennemis repoussés, ralentis, réduits au silence, dégâts croissants ; alliés plus rapides','wind'],
 [5,'S','x.fu_tornado','Fûton : Tornade','Tornade guidée par ta visée : aspire et emporte les ennemis, avale leurs tirs, puis les éjecte','wind'],
]);
// ---- outils du vent
let FU_N=0;const fuId=()=>FU_N=(FU_N+1)%100000;
// son « brut » (sans la teinte de l'élément, sinon tout devient « wind »)
const fuS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V};
const fuMuzzle=(u,a,r)=>jx({jfx:'fu_muzzle',x:u.x+Math.cos(a)*26,y:u.y+Math.sin(a)*26,a,r,t:.26,m:.26});
const fuPop=(x,y,r,blk)=>jx({jfx:'fu_pop',x,y,r,blk:blk?1:0,t:.32,m:.32});
// poussée de vent : la cible glisse (sans pouvoir marcher contre), ses mudras sont interrompus (sauf o.soft) ;
// avec o.slam, si elle est projetée contre un obstacle, un mur ou le bord de l'arène : ÉCRASÉ (étourdie o.slam s, +o.sd dégâts)
function fuPush(src,e,a,d,dur,o={}){if(!e||e.dead||(e!==src&&(e.unstop>0||e.phase>0)))return;e.dash=null;e.kx=e.ky=0;
 if(e!==src&&!o.soft&&(e.cast||e.spin||e.flame)){if(near(e.x,e.y))say(e,'INTERROMPU','#fc6');e.cast=null;e.spin=null;e.flame=null}
 for(const x of aux)if(x.type==='fu_push'&&x.tg===e)x.t=0;
 aux.push({type:'fu_push',x:e.x,y:e.y,r:0,t:dur,m:dur,team:src.team,owner:src,tg:e,ti:units.indexOf(e),a,d,q:0,slam:o.slam||0,sd:o.sd||0,vfx:'wind',k:0})}
AUXF.fu_push=(x,dt)=>{const e=x.tg;if(!e||e.dead||e.dash||(e!==x.owner&&(e.unstop>0||e.phase>0))){x.t=0;return}
 const q=1-Math.pow(Math.max(0,x.t)/x.m,2),s=(q-x.q)*x.d;x.q=q;e.x-=e.vx*dt;e.y-=e.vy*dt;if(s<=0)return;
 const tx=e.x+Math.cos(x.a)*s,ty=e.y+Math.sin(x.a)*s;e.x=tx;e.y=ty;collide(e);x.x=e.x;x.y=e.y;
 if(x.slam&&s>.6&&Math.hypot(e.x-tx,e.y-ty)>s*.55){x.t=0;fuSlam(x.owner,e,x.slam,x.sd,x.a)}};
function fuSlam(o,e,st,sd,a){VFX='wind';const ok=hit(e,o,sd,{unblockable:1});VFX=null;
 if(ok&&e.unstop<=0){e.stun=Math.max(e.stun,st);e.cast=null;e.spin=null;e.flame=null;say(e,'ÉCRASÉ','#e8fff8')}
 jx({jfx:'fu_slam',x:e.x+Math.cos(a)*14,y:e.y+Math.sin(a)*14,t:.5,m:.5});if(near(e.x,e.y)){sparks(e.x,e.y,'#e8fff8',10,'wind');shake=Math.max(shake,.22)}fuS('boom',e)}
// traînée de vent derrière la cible poussée (et derrière le lanceur pendant l'Envol)
AUXF.fu_trail=x=>{const u=x.tg;if(!u||u.dead){x.t=0;return}x.x=u.x;x.y=u.y};
AUXD.fu_push=(x,k,t)=>{const u=x.ti!=null?units[x.ti]:null;if(!u||u.dead)return;const al=Math.max(0,Math.min(1,x.t/x.m*1.6)),c=Math.cos(x.a),s=Math.sin(x.a);g.strokeStyle=rgba('#e8fff8',.8*al);g.lineWidth=1.7;g.beginPath();
 for(let i=0;i<5;i++){const l=(i-2)*7,z=12+i*9+(u.z||0),L=34+(i%2)*16,b0=P(u.x-c*14-s*l,u.y-s*14+c*l,z),b1=P(u.x-c*L-s*l,u.y-s*L+c*l,z);g.moveTo(b0.x,b0.y);g.lineTo(b1.x,b1.y)}g.stroke()};
AUXD.fu_trail=(x,k,t)=>AUXD.fu_push(x,k,t);
// dégâts continus : coups silencieux, un seul chiffre groupé par intervalle (au lieu d'une pluie de « -3 »)
function fuTick(x,e,dmg,o){const i=units.indexOf(e),h0=e.hp;VFX='wind';const ok=hit(e,x.owner,dmg,Object.assign({silent:1},o));VFX=null;(x.acc||(x.acc={}))[i]=(x.acc[i]||0)+Math.max(0,h0-e.hp);return ok}
function fuFlush(x,i){if(!x.acc)return;for(const k in x.acc){if(i!=null&&+k!==i)continue;const e=units[k];if(e&&!e.dead&&x.acc[k]>=1)say(e,'-'+Math.round(x.acc[k]),'#c8fff0');x.acc[k]=0}}
// le vent porte les tirs alliés : +30 % de vitesse, +25 % de dégâts (le feu est attisé par le moteur)
function fuCarry(p,tag){if(p[tag]||p.grenade)return false;p[tag]=1;if(ELM[p.vfx]===0){if(!p.windB)boostFire(p);return true}p.vx*=1.3;p.vy*=1.3;p.dmg*=1.25;p.r*=1.12;return true}

Object.assign(NAT,{
 // ---- mur de vent : rideau qui bloque (moteur : murs), repousse qui le touche, porte les tirs alliés
 fu_wall:SP('Fûton : Mur de vent','Mur de vent 4 s : bloque et repousse les ennemis, arrête leurs tirs, accélère les tirs alliés',9,{ai:DEF},(u,a)=>{
  const c=fwd(u,a,95),px=-Math.sin(a),py=Math.cos(a),id=fuId();for(let i=-2;i<=2;i++)walls.push({x:c.x+px*i*24,y:c.y+py*i*24,r:14,t:4,team:u.team,owner:u,wind:1,vfx:'fu_wall'});
  aux.push({type:'fu_wall',x:c.x,y:c.y,a:a+Math.PI/2,len:120,r:0,t:4,m:4,team:u.team,owner:u,vfx:'wind',k:0,n:id,hitT:{}});
  jx({jfx:'fu_wallrise',x:c.x,y:c.y,a:a+Math.PI/2,len:120,t:.55,m:.55});anim(u,'fu_wall',.55);S('wind',u);fuS('deflect',u)}),
 // ---- balle d'air : tir rapide, petite poussée
 fu_bullet:SP('Fûton : Balle d\'air','Balle d\'air rapide qui repousse un peu et interrompt les mudras',4,{ai:RG(480,.7)},(u,a)=>{S('wind',u);anim(u,'fu_puff',.4);fuMuzzle(u,a,14);
  proj(u,a,{spd:900,r:7,dmg:11,life:.55,col:'#c8fff0',vfx:'wind',kind:'fu_ball',onHit:(p,t)=>{fuPush(p.owner,t,Math.atan2(p.vy,p.vx),45,.18);fuPop(p.x,p.y,18)}})}),
 // ---- triple balle : 1-2-3, la dernière cogne
 fu_tri:SP('Fûton : Triple balle d\'air','3 balles d\'air en rafale qui suivent ta visée ; la 3e, plus grosse, repousse fort et interrompt',8,{ai:RG(480,.6)},(u,a)=>{let n=0;
  const sh=(o,b)=>{const big=n===2;S('wind',o);fuMuzzle(o,b,big?18:11);proj(o,b,{spd:big?960:880,r:big?9.5:6,dmg:big?11:5,life:.55,col:big?'#e8fff8':'#c8fff0',vfx:'wind',kind:'fu_ball',
   onHit:(p,t)=>{fuPush(p.owner,t,Math.atan2(p.vy,p.vx),big?60:18,big?.22:.12,{soft:!big});fuPop(p.x,p.y,big?28:14)}});n++};
  anim(u,'fu_tri',.56);sh(u,a);seqs.push({owner:u,n:2,t:.16,iv:.16,vfx:'wind',f:o=>sh(o,o.aim)})}),
 // ---- grande balle : lente, énorme poussée, écrase contre les obstacles et les murs (combo avec le Mur de vent)
 fu_big:SP('Fûton : Grande balle d\'air','Grosse balle lente qui repousse loin ; projetée contre un obstacle, la cible est étourdie',8,{line:{len:480,w:40},ai:RG(460,.55)},(u,a)=>{S('wind',u);fuS('rasengan',u);anim(u,'fu_big',.62);fuMuzzle(u,a,28);
  proj(u,a,{spd:560,r:14,dmg:19,life:.85,col:'#c8fff0',vfx:'wind',big:1,kind:'fu_big',onHit:(p,t)=>{fuPush(p.owner,t,Math.atan2(p.vy,p.vx),140,.32,{slam:.6,sd:8});fuPop(p.x,p.y,42);fuS('boom',t)}})}),
 // ---- rafale à bout portant : éventail serré de 10 balles, recul du lanceur
 fu_shotgun:SP('Fûton : Rafale à bout portant','Immobile, 10 balles d\'air en éventail : ravage au contact, le recul te rejette en arrière',8,{ai:RG(170,.7)},(u,a)=>{u.root=Math.max(u.root,.35);S('wind',u);fuS('heavy',u);anim(u,'fu_blast',.55);
  jx({jfx:'fu_blastfx',x:u.x,y:u.y,a,t:.32,m:.32});
  // les plombs frappent en silence (un seul chiffre groupé) : l'esquive et le contre sont donc vérifiés une fois pour toute la rafale
  {const V=VFX;VFX=null;for(const e of enemies(u)){const d=dist(u,e);if((e.dodge>0||e.counter>0)&&d<300+e.r&&angDiff(ang(u,e),a)<.4+Math.atan2(e.r,Math.max(1,d))){const dg=e.dodge>0;if(!hit(e,u,0,{})&&dg)e.phase=Math.max(e.phase||0,.3)}}VFX=V}
  const h0=new Map(),hl=new Map();for(const e of enemies(u))h0.set(e,e.hp);
  for(let i=0;i<10;i++)proj(u,a+(i-4.5)/4.5*.3+(rnd()-.5)*.06,{spd:850+rnd()*150,r:5,dmg:3.8,life:.26,col:'#e8fff8',vfx:'wind',kind:'fu_pellet',o:{kb:40,silent:1},onHit:(p,t)=>{t.flash=.12;hl.set(t,t.hp);const o=p.owner;o.energy=Math.min(100,o.energy+p.dmg*(o.ch.pass==='energy'?.9:.6));if(t.hero)t.energy=Math.min(100,t.energy+p.dmg*.2)}});
  later(u,.34,()=>{let n=0;for(const [e,h] of hl){const d=(h0.get(e)??h)-h;if(d>=1){say(e,'-'+Math.round(d),'#e8fff8');fuPop(e.x,e.y,30);n++}}if(n)S('hit',u)});
  fuPush(u,u,a+Math.PI,80,.22)}),
 // ---- balles chargées : 3 sphères en orbite (boucliers) à tirer pendant 5 s
 fu_stack:SP('Fûton : Balles chargées','3 balles d\'air tournent autour de toi et interceptent les tirs ; relance pour les tirer (5 s)',9,{ai:RG(440,.7)},null),
 // ---- lame d'air : croissant tranchant, très rapide, perçant
 fu_line:SP('Fûton : Lame d\'air','Lame de vent très rapide qui transperce toute la ligne et repousse chaque ennemi touché',10,{line:{len:720,w:32},ai:RG(680,.5)},(u,a)=>{S('wind',u);fuS('saber',u);anim(u,'fu_slash',.5);
  jx({jfx:'fu_slashfx',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.3,m:.3});
  proj(u,a,{spd:1250,r:16,dmg:30,life:.58,col:'#e8fff8',vfx:'wind',pierce:1,kind:'fu_blade',onHit:(p,t)=>{fuPush(p.owner,t,Math.atan2(p.vy,p.vx),70,.22);jx({jfx:'fu_cutmark',ti:units.indexOf(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.42,m:.42})}});
  const pr=projs[projs.length-1];aux.push({type:'fu_scar',x:pr.x,y:pr.y,a,len:0,r:0,t:1.1,m:1.1,team:u.team,owner:u,p:pr,vfx:'wind',k:0})}),
 // ---- souffle : canalisation immobile ; pression continue (tient à distance), disperse les tirs ennemis (le feu passe)
 // (télégraphe en cône pendant les mudras : voir drawTelegraphs plus bas)
 fu_breath:SP('Fûton : Souffle','Immobile, souffle continu : blesse, ralentit, repousse et disperse les tirs ennemis',10,{ai:RG(230,.6)},(u,a)=>{
  // u.flame (moteur) : lanceur immobile, souffle coupé par un étourdissement ou une poussée ; k:99 = le moteur ne frappe pas lui-même
  // (ses coups « kb » annuleraient les ruées des ennemis pris dedans) : dégâts, ralentissement et poussée sont gérés par l'objet fu_breath
  u.flame={t:1.4,k:99,R:270,arc:.5,still:1,v:'wind'};S('wind',u);fuS('roar',u);anim(u,'fu_gale',1.4);jx({jfx:'fu_inhale',ui:units.indexOf(u),x:u.x,y:u.y,t:.3,m:.3});
  aux.push({type:'fu_breath',x:u.x,y:u.y,a,len:270,w:.5,r:0,t:1.45,m:1.45,team:u.team,owner:u,ui:units.indexOf(u),vfx:'wind',k:0,fl:.6,so:.3,hitI:{}})}),
 // ---- envol : bond porté par une rafale qui repousse les ennemis proches au départ
 fu_leap:SP('Fûton : Envol','Bond porté par le vent ; la rafale du départ repousse les ennemis proches',7,{ai:ESC},(u,a,td)=>{S('wind',u);fuS('dash',u);anim(u,'fu_leap',.42);
  jx({jfx:'fu_gust',x:u.x,y:u.y,r:130,t:.45,m:.45});for(const e of enemies(u))if(dist(u,e)<130+e.r&&hit(e,u,6,{}))fuPush(u,e,ang(u,e),85,.22);
  aux.push({type:'fu_trail',x:u.x,y:u.y,r:0,t:.34,m:.34,team:u.team,owner:u,tg:u,ti:units.indexOf(u),a,vfx:'wind',k:0});
  dash(u,a,clamp(td||240,110,260),.3,{jump:46,end:()=>{fuPop(u.x,u.y,34);sparks(u.x,u.y,'#c8fff0',8,'wind')}})}),
 // ---- couloir de vent : rafale d'ouverture (blesse, souffle dans l'axe), puis vent contraire (ralentit), silence et dégâts croissants
 //      pour les ennemis qui restent ; vent arrière pour les alliés
 fu_corridor:ULT('Fûton : Couloir de vent','Rafale puis couloir 4 s : ennemis repoussés, ralentis, réduits au silence, dégâts croissants ; alliés plus rapides',{line:{len:540,w:140},ai:{max:480,p:.8}},(u,a)=>{S('wind',u);fuS('heavy',u);anim(u,'fu_corr',.7);
  aux.push({type:'fu_corr',x:u.x,y:u.y,a,len:540,w:140,r:0,t:4,m:4,team:u.team,owner:u,vfx:'wind',k:0,n:fuId(),inT:{},acc:{},ent:{},gh:{}})}),
 // ---- tornade : avance vers la visée, aspire et emporte (1,5 s au plus par ennemi), avale les tirs ennemis, puis éjecte
 fu_tornado:ULT('Fûton : Tornade','Tornade guidée par ta visée : aspire et emporte les ennemis, avale leurs tirs, puis les éjecte',{line:{len:700,w:156},ai:{max:520,p:.8}},(u,a)=>{S('wind',u);fuS('rasengan',u);anim(u,'fu_spin',.75);
  const id=fuId(),p=fwd(u,a,50);aux.push({type:'fu_tornado',x:p.x,y:p.y,a,r:78,t:4,m:4,team:u.team,owner:u,vfx:'wind',k:0,n:id,spd:175,cap:{},ct:{},out:{}});
  fx.push({jfx:'fu_tornf',x:p.x,y:p.y,n:id,t:4.1,m:4.1});jx({jfx:'fu_gust',x:p.x,y:p.y,r:110,t:.5,m:.5})}),
});
Object.assign(NATHERO,{fu:'palpatine'});
// balles chargées : la préparation lance aussi l'orbite (qui intercepte les tirs ennemis)
{const base=stackAb('fu_stack',3,(u,a)=>{S('wind',u);anim(u,'fu_puff',.35);fuMuzzle(u,a,15);
  proj(u,a,{spd:1000,r:9,dmg:15,life:.55,col:'#c8fff0',vfx:'wind',kind:'fu_orb',onHit:(p,t)=>{fuPush(p.owner,t,Math.atan2(p.vy,p.vx),55,.2);fuPop(p.x,p.y,22)}})});
 NAT.fu_stack.f=(u,a,t)=>{const was=u.jst&&u.jst.key==='fu_stack';base(u,a,t);
  if(!was&&u.jst&&u.jst.key==='fu_stack'){fuS('rasengan',u);anim(u,'fu_charge',.6);jx({jfx:'fu_gust',x:u.x,y:u.y,r:64,t:.4,m:.4});aux.push({type:'fu_orbit',x:u.x,y:u.y,r:0,t:5.2,m:5.2,team:u.team,owner:u,ui:units.indexOf(u),vfx:'wind',k:0,n:3})}}}

// ---- logique des objets de vent (hôte)
// mur : porte les tirs alliés, éclat quand il arrête un tir ennemi, rafale qui repousse l'ennemi qui le touche
AUXF.fu_wall=(x,dt)=>{const c=Math.cos(x.a),s=Math.sin(x.a),seg=(px,py)=>{const dx=px-x.x,dy=py-x.y,f=clamp(dx*c+dy*s,-x.len/2,x.len/2);return{d:Math.hypot(dx-c*f,dy-s*f),n:-dx*s+dy*c}};
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner)continue;const q=seg(p.x+p.vx*dt,p.y+p.vy*dt);
  if(p.owner.team===x.team){if(q.d<p.r+16&&fuCarry(p,'fu_w'+x.n)&&near(p.x,p.y))fuPop(p.x,p.y,16)}
  else if(q.d<p.r+16&&!p.fu_wd&&!p.ret){p.fu_wd=1;if(near(p.x,p.y)){fuPop(p.x,p.y,22,1);fuS('deflect',p)}}}
 if(x.k>0)return;x.k=.1;for(const e of enemies(x.owner)){const q=seg(e.x,e.y),i=units.indexOf(e);if(q.d>e.r+17||(x.hitT[i]||0)>SIMT)continue;x.hitT[i]=SIMT+.6;
  fuPush(x.owner,e,x.a+(q.n>0?Math.PI/2:-Math.PI/2),55,.18);if(near(e.x,e.y))fuPop(e.x,e.y,20)}};
// orbite des balles chargées : chaque tir ennemi qui approche est intercepté et consomme une balle
AUXF.fu_orbit=(x,dt)=>{const u=x.owner;if(!u||u.dead||!u.jst||u.jst.key!=='fu_stack'){x.t=0;return}x.x=u.x;x.y=u.y;x.n=u.jst.n;x.t=Math.max(x.t,.2);
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||p.rocket||!p.owner||p.owner.team===u.team)continue;
  if(Math.min(Math.hypot(p.x-u.x,p.y-u.y),Math.hypot(p.x+p.vx*dt-u.x,p.y+p.vy*dt-u.y))>p.r+40)continue;
  p.life=0;p.fu_wd=1;const b=Math.atan2(p.y-u.y,p.x-u.x);if(near(u.x,u.y)){fuPop(u.x+Math.cos(b)*30,u.y+Math.sin(b)*24,20,1);S('deflect',u)}
  u.jst.n--;x.n=u.jst.n;if(u.jst.n<=0){u.cds[u.jst.i]=u.jst.cd;u.jst=null;x.t=0;return}}};
// souffle : pression continue dans le cône (forte de près, nulle au bout : les ennemis sont tenus à distance), vent de face (marcher vers le lanceur
// est deux fois plus lent ; s'écarter sur le côté ou une ruée permettent de sortir), la première bouffée interrompt les mudras,
// tirs ennemis dispersés (sauf le feu), feu allié attisé
AUXF.fu_breath=(x,dt)=>{const u=x.owner;if(!u||u.dead||!u.flame||u.flame.v!=='wind'){x.t=0;fuFlush(x);if(u&&u.anim&&u.anim.k==='fu_gale')u.anim=null;return}x.x=u.x;x.y=u.y;x.a=u.aim;u.flame.k=99;
 const inC=(px,py,m)=>{const d=Math.hypot(px-u.x,py-u.y);return d<x.len+m&&d>4&&angDiff(Math.atan2(py-u.y,px-u.x),u.aim)<x.w+Math.atan2(m,Math.max(d,1))};
 const tick=x.k<=0;if(tick)x.k=.12;x.fl=(x.fl||0)-dt;if((x.so-=dt)<=0){x.so=.3;S('wind',u)}
 for(const e of enemies(u)){if(!inC(e.x,e.y,e.r*.5))continue;const hard=e.unstop<=0&&!(e.phase>0),i=units.indexOf(e);
  if(tick){fuTick(x,e,3.4,{unblockable:1});if(hard&&!(e.slowImm>0))e.slow=Math.max(e.slow,.3)}
  if(hard&&!x.hitI[i]){x.hitI[i]=1;if(e.cast||e.spin||e.flame){if(near(e.x,e.y))say(e,'INTERROMPU','#fc6');e.cast=null;e.spin=null;e.flame=null}}
  if(!hard||e.dash)continue;const d=dist(u,e),b=ang(u,e),c=Math.cos(b),s=Math.sin(b),v=340*Math.max(0,1-d/(x.len*.85)),vr=e.vx*c+e.vy*s;
  e.x+=(c*v-(vr<0?c*vr*.5:0))*dt;e.y+=(s*v-(vr<0?s*vr*.5:0))*dt;collide(e)}
 if(x.fl<=0||x.t<=0){x.fl=.6;fuFlush(x)}
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||!inC(p.x,p.y,p.r||0))continue;const fire=ELM[p.vfx]===0;
  if(p.owner.team!==u.team){if(!fire&&!p.rocket){p.life=0;p.fu_wd=1;if(near(p.x,p.y))fuPop(p.x,p.y,16,1)}}else if(fire&&!p.windB)boostFire(p)}};
// lame d'air : l'entaille au sol suit la lame tant qu'elle vole
AUXF.fu_scar=x=>{const p=x.p;if(p&&!p.dead&&p.life>0)x.len=Math.hypot(p.x-x.x,p.y-x.y);else x.p=null};
// couloir : projectiles alliés portés, alliés rapides, ennemis ralentis, réduits au silence et rongés (dégâts croissants, chiffres groupés par seconde)
AUXF.fu_corr=(x,dt)=>{const o=x.owner,c=Math.cos(x.a),s=Math.sin(x.a),inR=(px,py,m)=>{const dx=px-x.x,dy=py-x.y,f=dx*c+dy*s;return f>-m&&f<x.len+m&&Math.abs(-dx*s+dy*c)<x.w/2+m};
 for(const p of projs)if(!p.dead&&p.owner&&p.owner.team===x.team&&inR(p.x,p.y,0))fuCarry(p,'fu_c'+x.n);
 const tick=x.k<=0,age=x.m-x.t,gf=age<.45?x.len*Math.min(1,age/.4):-1;if(tick)x.k=.25;
 for(const e of units){if(e.dead)continue;const i=units.indexOf(e),inside=inR(e.x,e.y,e.r);
  if(e.team===x.team){if(inside)e.haste=Math.max(e.haste,.3);continue}
  if(!inside){if(x.ent[i]){x.ent[i]=0;x.inT[i]=0;fuFlush(x,i)}continue}
  // rafale d'ouverture : le front balaie le couloir en 0,4 s ; chaque ennemi qu'il atteint est blessé et soufflé dans l'axe (une fois)
  if(gf>=0&&!x.gh[i]&&(e.x-x.x)*c+(e.y-x.y)*s<gf+e.r){x.gh[i]=1;VFX='wind';if(hit(e,o,18,{}))fuPush(o,e,x.a,110,.3);VFX=null}
  // le silence et le vent contraire collent encore 1 s après la sortie : traverser le couloir coûte toujours ses jutsu un moment ;
  // vent de face : marcher vers le lanceur dans le couloir est deux fois plus lent (s'écarter sur le côté reste libre)
  if(e.unstop<=0){e.silence=Math.max(e.silence,1);if(!(e.slowImm>0))e.slow=Math.max(e.slow,.5);if(!x.ent[i]&&near(e.x,e.y))say(e,'SILENCE','#9df');
   const va=e.vx*c+e.vy*s;if(va<0&&!e.dash){e.x-=c*va*.5*dt;e.y-=s*va*.5*dt}}x.ent[i]=1;
  if(tick){x.inT[i]=(x.inT[i]||0)+.25;fuTick(x,e,1.6*(1+x.inT[i]*.45));if(x.inT[i]%1<.01)fuFlush(x,i)}}
 if(x.t<=0)fuFlush(x)};
// tornade : se dirige vers la visée du lanceur, aspire et soulève les ennemis, avale leurs tirs (le feu passe et grossit), éjecte après 1,5 s ou à la fin
AUXF.fu_tornado=(x,dt)=>{const o=x.owner;
 if(o&&!o.dead){const tx=o.x+Math.cos(o.aim)*700,ty=o.y+Math.sin(o.aim)*700;let df=Math.atan2(ty-x.y,tx-x.x)-x.a;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;x.a+=clamp(df,-1.2*dt,1.2*dt)}
 const vx=Math.cos(x.a)*x.spd,vy=Math.sin(x.a)*x.spd;x.x=clamp(x.x+vx*dt,B.x+30,B.x+B.w-30);x.y=clamp(x.y+vy*dt,B.y+30,B.y+B.h-30);
 for(const p of projs)if(!p.dead&&p.life>0&&!p.grenade&&!p.rocket&&p.owner&&p.owner.team!==x.team&&ELM[p.vfx]!==0&&Math.hypot(p.x-x.x,p.y-x.y)<x.r){p.life=0;p.fu_wd=1;if(near(p.x,p.y))sparks(p.x,p.y,'#e8fff8',5,'wind')}
 const tick=x.k<=0;if(tick)x.k=.25;x.fl=(x.fl||1)-dt;if(x.fl<=0){x.fl=1;fuFlush(x)}
 // aspiration forte, mais chaque ennemi n'est emporté que 1,5 s au plus (une ruée l'en sort plus tôt) : il est alors éjecté et la tornade ne le reprend plus
 for(const e of enemies(o)){const i=units.indexOf(e);if(x.out[i]||e.unstop>0||e.phase>0||e.dash||Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r)continue;if(!x.cap[i]){x.cap[i]=1;if(near(e.x,e.y))say(e,'EMPORTÉ','#e8fff8')}
  e.x+=vx*dt*.9+(x.x-e.x)*dt*2.3-e.vx*dt*.45;e.y+=vy*dt*.9+(x.y-e.y)*dt*2.3-e.vy*dt*.45;e.airT=Math.max(e.airT||0,.2);collide(e);
  if(tick)fuTick(x,e,5);if((x.ct[i]=(x.ct[i]||0)+dt)>=1.5)fuEject(x,e,i)}
 if(x.t<=0&&!x.done){x.done=1;fuFlush(x);for(const e of enemies(o)){const i=units.indexOf(e);if(!x.out[i]&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r+12)fuEject(x,e,i)}
  if(near(x.x,x.y)){fuPop(x.x,x.y,90);jx({jfx:'fu_gust',x:x.x,y:x.y,r:120,t:.5,m:.5});shake=Math.max(shake,.2)}fuS('boom',x)}};
// éjection : la cible est projetée hors de la tornade (court envol) et n'y retourne plus
function fuEject(x,e,i){x.out[i]=1;fuFlush(x,i);const o=x.owner,b=Math.atan2(e.y-x.y,e.x-x.x)||x.a;VFX='wind';if(hit(e,o,14,{air:.35}))fuPush(o,e,b,90,.25);VFX=null;if(near(e.x,e.y))jx({jfx:'fu_gust',x:e.x,y:e.y,r:56,t:.4,m:.4})}

// ---- dessins : projectiles
// balle d'air : bulle translucide, spirale intérieure, front de pression (la 3e de la Triple porte un 2e front)
PROJD.fu_ball=(p,R0,ra,t)=>{const s=t/60,R=R0*1.18;g.rotate(ra);g.strokeStyle=rgba('#c8fff0',.5);g.lineWidth=1.4;g.beginPath();g.moveTo(-R*1.2,-R*.55);g.lineTo(-R*3.2,-R*.4);g.moveTo(-R*1.4,0);g.lineTo(-R*4.2,0);g.moveTo(-R*1.2,R*.55);g.lineTo(-R*3,R*.4);g.stroke();
 circ(0,0,R*1.5,rgba('#c8fff0',.16));circ(0,0,R,rgba('#e8fff8',.55));g.strokeStyle=rgba('#2a7a68',.55);g.lineWidth=1.2;g.beginPath();g.arc(0,0,R,0,7);g.stroke();
 g.strokeStyle='#ffffff';g.lineWidth=1.5;g.beginPath();g.arc(0,0,R*.6,s,s+3.6);g.stroke();g.strokeStyle='#7fe0c0';g.beginPath();g.arc(0,0,R*.3,-s*1.4,-s*1.4+3.6);g.stroke();
 g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=2;g.beginPath();g.arc(-R*.25,0,R*1.3,-.9,.9);g.stroke();
 if(R>8.5){g.strokeStyle=rgba('#7fe0c0',.8);g.lineWidth=1.6;g.beginPath();g.arc(-R*.75,0,R*1.85,-.75,.75);g.stroke()}};
// grande balle : sphère de vent aux anneaux croisés, débris en orbite
PROJD.fu_big=(p,R,ra,t)=>{const s=t/80;circ(0,0,R*1.45,rgba('#c8fff0',.14));circ(0,0,R,rgba('#d8fff4',.42));g.strokeStyle=rgba('#2a7a68',.5);g.lineWidth=1.5;g.beginPath();g.arc(0,0,R,0,7);g.stroke();
 for(let i=0;i<3;i++){g.strokeStyle=i===1?rgba('#7fe0c0',.9):rgba('#ffffff',.85);g.lineWidth=2.2-i*.4;g.beginPath();g.ellipse(0,0,R*(.92-i*.22),R*(.38+i*.14),(i%2?-s:s)*1.2+i*1.1,0,4.2);g.stroke()}
 for(let i=0;i<6;i++){const b=s*2.4+i*1.05;g.fillStyle=i%2?'#7a6a4a':'#5aa83a';g.fillRect(Math.cos(b)*R*1.25-1.5,Math.sin(b)*R*.45-1.5,3,3)}
 circ(0,0,R*.22,'rgba(255,255,255,.9)');g.rotate(ra);g.strokeStyle=rgba('#ffffff',.8);g.lineWidth=2.5;g.beginPath();g.arc(-R*.35,0,R*1.42,-.85,.85);g.stroke()};
// balle chargée : noyau dense à trois bras qui tournent vite
PROJD.fu_orb=(p,R,ra,t)=>{g.save();g.rotate(ra);g.strokeStyle=rgba('#c8fff0',.45);g.lineWidth=1.4;g.beginPath();g.moveTo(-R*1.3,0);g.lineTo(-R*3.6,0);g.stroke();g.restore();
 circ(0,0,R*1.35,rgba('#c8fff0',.16));g.rotate(t/40);g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();
 for(let i=0;i<3;i++){const b=i*2.094;g.moveTo(Math.cos(b)*R*.25,Math.sin(b)*R*.25);g.quadraticCurveTo(Math.cos(b+.9)*R*.9,Math.sin(b+.9)*R*.9,Math.cos(b+1.9)*R*1.15,Math.sin(b+1.9)*R*1.15)}g.stroke();
 circ(0,0,R*.42,'#e8fff8');g.strokeStyle=rgba('#2a7a68',.6);g.lineWidth=1;g.beginPath();g.arc(0,0,R*.42,0,7);g.stroke()};
// plomb de la rafale : trait court à tête blanche
PROJD.fu_pellet=(p,R,ra)=>{g.rotate(ra);g.lineCap='round';g.strokeStyle=rgba('#c8fff0',.65);g.lineWidth=R*.9;g.beginPath();g.moveTo(-R*3.4,0);g.lineTo(0,0);g.stroke();circ(R*.3,0,R*.62,'#ffffff')};
// lame d'air : croissant tranchant et ses images rémanentes
PROJD.fu_blade=(p,R,ra)=>{g.rotate(ra);const L=R*1.9;for(let i=2;i>=1;i--){g.strokeStyle=rgba('#c8fff0',.32/i);g.lineWidth=3;g.beginPath();g.arc(-R*.6-i*R*.9,0,L,-.9,.9);g.stroke()}
 g.fillStyle=rgba('#e8fff8',.88);g.beginPath();g.arc(-R*.6,0,L,-.95,.95);g.arc(-R*1.15,0,L*.98,.9,-.9,true);g.closePath();g.fill();
 g.strokeStyle='#ffffff';g.lineWidth=1.8;g.beginPath();g.arc(-R*.6,0,L,-.95,.95);g.stroke();g.strokeStyle=rgba('#2a7a68',.5);g.lineWidth=1;g.beginPath();g.arc(-R*1.15,0,L*.98,-.9,.9);g.stroke()};

// ---- dessins : objets au sol
// mur de vent : chaque segment dessine sa tranche de rideau (triée en profondeur avec les ninjas)
function fuWallDraw(w){let H=null;for(const x of aux)if(x.type==='fu_wall'&&x.team===w.team&&Math.abs(x.x-w.x)<80&&Math.abs(x.y-w.y)<80){H=x;break}
 const a=H?H.a:0,c=Math.cos(a)*12.5,s=Math.sin(a)*12.5,t=performance.now()/1000,age=H?H.m-H.t:1,al=Math.min(1,w.t/.35),Z=72*Math.min(1,age/.22),sd=Math.abs(w.x*.13+w.y*.07)%6,
  p=P(w.x,w.y,0),rx=14*p.s,h=Z*p.s,A=P(w.x-c,w.y-s,0),B2=P(w.x+c,w.y+s,0),At=P(w.x-c,w.y-s,Z),Bt=P(w.x+c,w.y+s,Z);
 g.save();
 // rideau + épaisseur (colonne translucide) : lisible quelle que soit l'orientation du mur
 g.fillStyle=rgba('#c8fff0',.13*al);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B2.x,B2.y);g.lineTo(Bt.x,Bt.y);g.lineTo(At.x,At.y);g.closePath();g.fill();
 g.fillStyle=rgba('#e8fff8',.1*al);g.beginPath();g.ellipse(p.x,p.y-h*.5,rx,h*.5,0,0,7);g.fill();
 // anneaux de vent qui montent en tournant (arcs partiels) + filets doux
 for(let j=0;j<3;j++){const z=(t*34+j*Z/3+sd*9)%Math.max(1,Z),fd=1-z/Math.max(1,Z)*.65,a0=t*5+j*2.1+sd;g.strokeStyle=rgba(j%2?'#ffffff':'#7fe0c0',.68*al*fd);g.lineWidth=2;g.beginPath();g.ellipse(p.x+Math.sin(t*3+j)*2*p.s,p.y-z*p.s,rx*(1.1-z/Math.max(1,Z)*.2),rx*.34,0,a0,a0+3.4);g.stroke()}
 g.strokeStyle=rgba('#c8fff0',.42*al);g.lineWidth=1.3;g.beginPath();for(let j=0;j<2;j++){const ph=t*2.4+sd+j*3.1,x0=p.x+Math.sin(ph)*rx*.55;g.moveTo(x0,p.y-3*p.s);g.quadraticCurveTo(x0+Math.sin(ph+1)*rx*.5,p.y-h*.5,p.x+Math.sin(ph+2)*rx*.45,p.y-h*.92)}g.stroke();
 // filets qui montent le long du rideau
 g.strokeStyle=rgba('#7fe0c0',.62*al);g.lineWidth=1.5;g.beginPath();for(let j=0;j<3;j++){const z=(t*46+j*Z/3+sd*11)%Math.max(1,Z),u0=P(w.x-c,w.y-s,z),u1=P(w.x+c,w.y+s,z+5);g.moveTo(u0.x,u0.y);g.quadraticCurveTo((u0.x+u1.x)/2,(u0.y+u1.y)/2-4*u0.s,u1.x,u1.y)}g.stroke();
 // crête ondulante et remous au pied
 const zt=Math.sin(t*6+sd)*3,T0=P(w.x-c,w.y-s,Z+zt),T1=P(w.x+c,w.y+s,Z-zt),ed=clamp(Math.abs(T1.x-T0.x)/(Math.abs(T1.y-T0.y)+1),.2,1);g.strokeStyle=rgba('#ffffff',.78*al*ed);g.lineWidth=2.2;g.beginPath();g.moveTo(T0.x,T0.y);g.lineTo(T1.x,T1.y);g.stroke();
 g.strokeStyle=rgba('#a8d8c8',.65*al);g.lineWidth=2.5;g.setLineDash([7*p.s,5*p.s]);g.lineDashOffset=-t*30;g.beginPath();g.ellipse(p.x,p.y,rx*1.15,rx*1.15*K,0,0,7);g.stroke();g.restore();return true}
AFTER.push(()=>{const base=drawWallN;drawWallN=w=>w.vfx==='fu_wall'?fuWallDraw(w):base(w)});
// souffle : télégraphe en cône (la vraie zone) pendant les mudras, à la place du rectangle du moteur
AFTER.push(()=>{const base=drawTelegraphs;drawTelegraphs=()=>{base();for(const u of units){if(!u.cast||u.dead||!near(u.x,u.y))continue;const ab=castAb(u,u.cast);if(!ab||ab.key!=='fu_breath')continue;
 const a=u.cast.aimOv??u.aim,k=Math.min(1,u.cast.t/u.cast.dur),col=u.team?'#ff5050':'#5ab8ff',pts=[P(u.x,u.y)];for(let i=0;i<=10;i++){const b=a-.5+i*.1;pts.push(P(u.x+Math.cos(b)*270,u.y+Math.sin(b)*270))}poly(pts,rgba(col,.15));
 g.strokeStyle=rgba(col,.7);g.lineWidth=2;g.beginPath();for(let i=0;i<=10;i++){const b=a-.5+i*.1,q=P(u.x+Math.cos(b)*270*k,u.y+Math.sin(b)*270*k);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()}}});
// l'IA voit les objets de vent (le moteur ne connaît que ses zones) : elle sort du couloir et du cône du Souffle, et s'écarte de la tornade
AFTER.push(()=>{const base=dangers,sel=auxSel(x=>x.type==='fu_corr'||x.type==='fu_breath'||x.type==='fu_tornado');dangers=u=>{const L=base(u);for(const x of sel()){if(x.team===u.team)continue;
 if(x.type==='fu_corr'||x.type==='fu_breath'){const br=x.type==='fu_breath',a=br&&x.owner?x.owner.aim:x.a,c=Math.cos(a),s=Math.sin(a),dx=u.x-x.x,dy=u.y-x.y,f=dx*c+dy*s;
  if(f>-20&&f<x.len+20){const hw=br?Math.max(12,f*Math.tan(x.w)):x.w/2;if(Math.abs(-dx*s+dy*c)<hw+20)L.push({x:x.x+c*f,y:x.y+s*f,r:hw})}}
 else if(x.type==='fu_tornado')L.push({x:x.x,y:x.y,r:x.r+10})}return L}});
// souffle : la lueur que le moteur pose devant tout souffle canalisé (orange, prévue pour le feu) prend la teinte du vent ;
// rafale : les 10 lueurs des plombs (additives) saturaient en tache blanche sur la cible, elles sont atténuées
AFTER.push(()=>{const g0=glow;glow=(x,y,r,col,a)=>{if(col==='#f93'&&r===120){for(const o of aux)if(o.type==='fu_breath'&&o.ui!=null){const u=units[o.ui];if(u&&Math.abs(u.x+Math.cos(u.aim)*90-x)<2&&Math.abs(u.y+Math.sin(u.aim)*90-y)<2){col='#7fe0c0';a*=.55;break}}}
 else if(r===45)for(const p of projs)if(p.kind==='fu_pellet'&&p.x===x&&p.y===y){a*=.3;break}return g0(x,y,r,col,a)}});
// balles chargées : remous autour des sphères en orbite (les sphères elles-mêmes sont dessinées par le moteur)
AUXD.fu_orbit=(x,k,t)=>{const u=x.ui!=null?units[x.ui]:null,n=x.n|0;if(!u||u.dead||!n)return;
 for(let i=0;i<n;i++){const a=t*3+i*Math.PI*2/n,q=P(u.x+Math.cos(a)*30,u.y+Math.sin(a)*22,46),r=10*q.s;
  for(let j=3;j>=1;j--){const b=a-j*.24,w=P(u.x+Math.cos(b)*30,u.y+Math.sin(b)*22,46);circ(w.x,w.y,r*(1-j*.2),rgba('#c8fff0',.3-j*.06))}
  circ(q.x,q.y,r*1.35,rgba('#c8fff0',.2));circ(q.x,q.y,r,rgba('#e8fff8',.42));g.strokeStyle=rgba('#2a7a68',.65);g.lineWidth=1.3;g.beginPath();g.arc(q.x,q.y,r,0,7);g.stroke();
  g.strokeStyle=rgba('#3a9a84',.85);g.lineWidth=1.7;g.beginPath();g.arc(q.x,q.y,r*.82,t*9+i,t*9+i+2.6);g.stroke();g.strokeStyle='#ffffff';g.beginPath();g.arc(q.x,q.y,r*1.18,-t*7+i,-t*7+i+1.8);g.stroke()}};
// souffle : cône translucide, filets de vent qui filent, chevrons qui avancent
AUXD.fu_breath=(x,k,t)=>{const u=x.ui!=null?units[x.ui]:null;if(!u||u.dead)return;const a=u.aim,L=x.len,W=x.w,al=Math.max(0,Math.min(1,x.t/.25,(x.m-x.t)/.12)),o=P(u.x+Math.cos(a)*16,u.y+Math.sin(a)*16,0);
 g.fillStyle=rgba('#c8fff0',.13*al);g.beginPath();g.moveTo(o.x,o.y);for(let i=0;i<=8;i++){const b=a-W+2*W*i/8,q=P(u.x+Math.cos(b)*L,u.y+Math.sin(b)*L,0);g.lineTo(q.x,q.y)}g.closePath();g.fill();
 g.strokeStyle=rgba('#ffffff',.6*al);g.lineWidth=1.6;g.beginPath();for(let i=0;i<16;i++){const f=(t*560+i*67)%L,b=a+(((i*37)%11)/10-.5)*W*1.7,z=8+(i%3)*9,p0=P(u.x+Math.cos(b)*f,u.y+Math.sin(b)*f,z),p1=P(u.x+Math.cos(b)*Math.min(L,f+34),u.y+Math.sin(b)*Math.min(L,f+34),z);g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y)}g.stroke();
 g.strokeStyle=rgba('#7fe0c0',.5*al);g.lineWidth=3;g.beginPath();for(let j=0;j<3;j++){const f=(t*300+j*L/3)%L,c0=P(u.x+Math.cos(a-W*.7)*(f-14),u.y+Math.sin(a-W*.7)*(f-14),2),c1=P(u.x+Math.cos(a)*f,u.y+Math.sin(a)*f,2),c2=P(u.x+Math.cos(a+W*.7)*(f-14),u.y+Math.sin(a+W*.7)*(f-14),2);g.moveTo(c0.x,c0.y);g.quadraticCurveTo(c1.x,c1.y,c2.x,c2.y)}g.stroke()};
// couloir : bande de vent, parois ondulantes, filets qui filent, chevrons au sol, front de rafale à l'ouverture
AUXD.fu_corr=(x,k,t)=>{const c=Math.cos(x.a),s=Math.sin(x.a),hw=x.w/2,al=Math.max(0,Math.min(1,x.t/.5,(x.m-x.t)/.2)),W=(f,l,z=0)=>P(x.x+c*f-s*l,x.y+s*f+c*l,z),age=x.m-x.t;
 poly([W(0,-hw),W(x.len,-hw),W(x.len,hw),W(0,hw)],rgba('#c8fff0',.12*al));
 for(const sd of[-1,1])for(let j=0;j<3;j++){g.strokeStyle=rgba(j?'#e8fff8':'#7fe0c0',(.62-j*.15)*al);g.lineWidth=2.4-j*.6;g.beginPath();for(let i=0;i<=14;i++){const f=i*x.len/14,q=W(f,sd*(hw-3+Math.sin(f*.04-t*7+j*2)*4),5+j*16);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()}
 g.strokeStyle=rgba('#ffffff',.6*al);g.lineWidth=1.5;g.beginPath();for(let i=0;i<16;i++){const f=(t*420+i*71)%x.len,l=(((i*37)%x.w)-hw)*.85,z=6+(i%4)*7,a1=W(f,l,z),a2=W(Math.min(x.len,f+46),l,z);g.moveTo(a1.x,a1.y);g.lineTo(a2.x,a2.y)}g.stroke();
 g.strokeStyle=rgba('#7fe0c0',.42*al);g.lineWidth=3;g.beginPath();for(let i=0;i<6;i++){const f=22+(i*x.len/6+t*90)%(x.len-22),a1=W(f-22,-hw*.45),a2=W(f,0),a3=W(f-22,hw*.45);g.moveTo(a1.x,a1.y);g.lineTo(a2.x,a2.y);g.lineTo(a3.x,a3.y)}g.stroke();
 // rafale d'ouverture : front bombé qui balaie le couloir (c'est elle qui blesse et souffle les ennemis) et ses traînées
 if(age<.45){const f=x.len*Math.min(1,age/.4),fa=1-age/.45;g.globalCompositeOperation='lighter';poly([W(f,-hw),W(f,hw),W(f,hw,46),W(f,-hw,46)],rgba('#e8fff8',.32*fa));
  g.strokeStyle=rgba('#ffffff',.85*fa);g.lineWidth=3;for(const z of[8,26,44]){g.beginPath();for(let i=0;i<=8;i++){const l=-hw+hw*i/4,q=W(f+Math.cos(l/hw*1.4)*18,l,z);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()}
  g.strokeStyle=rgba('#7fe0c0',.6*fa);g.lineWidth=1.6;g.beginPath();for(let i=0;i<9;i++){const l=-hw*.9+hw*.225*i,z=6+(i%3)*14,a1=W(f-8,l,z),a2=W(Math.max(0,f-70-(i%2)*30),l,z);g.moveTo(a1.x,a1.y);g.lineTo(a2.x,a2.y)}g.stroke()}};
// entaille de la lame : trait lumineux au sol qui s'efface depuis l'origine
AUXD.fu_scar=(x,k,t)=>{if(!x.len)return;const e=1-x.t/x.m,c=Math.cos(x.a),s=Math.sin(x.a),f0=x.len*Math.min(1,e*1.3),a1=P(x.x+c*f0,x.y+s*f0,1),a2=P(x.x+c*x.len,x.y+s*x.len,1);if(f0>=x.len)return;
 g.lineCap='round';g.strokeStyle=rgba('#7fe0c0',.35*(1-e));g.lineWidth=6*a2.s;g.beginPath();g.moveTo(a1.x,a1.y);g.lineTo(a2.x,a2.y);g.stroke();g.strokeStyle=rgba('#ffffff',.85*(1-e));g.lineWidth=1.6*a2.s;g.stroke()};
// tornade : entonnoir en anneaux (moitié arrière sous les ninjas, moitié avant par-dessus), poussière au sol, débris qui montent
function fuTorn(x,front,t){const q=P(x.x,x.y,0),S2=q.s*(x.r/72),al=Math.max(0,Math.min(1,x.t/.45,(x.m-x.t)/.3)),n=12,band=i=>({cx:q.x+Math.sin(t*2.6+i*.45)*(2+i*.8)*S2,cy:q.y-i*11.5*S2,rr:(11+i*4.2+i*i*.36)*S2});
 if(!front){g.fillStyle=rgba('#000000',.22*al);g.beginPath();g.ellipse(q.x,q.y,x.r*q.s,x.r*q.s*K,0,0,7);g.fill();
  g.strokeStyle=rgba('#d8efe6',.55*al);g.lineWidth=2.2;g.setLineDash([14*S2,10*S2]);g.lineDashOffset=t*60;g.beginPath();g.ellipse(q.x,q.y,x.r*q.s*1.05,x.r*q.s*1.05*K,0,0,7);g.stroke();g.setLineDash([]);
  // silhouette translucide de l'entonnoir et colonne intérieure plus dense
  g.fillStyle=rgba('#c8fff0',.15*al);g.beginPath();for(let i=0;i<n;i++){const b=band(i);g.lineTo(b.cx-b.rr,b.cy)}for(let i=n-1;i>=0;i--){const b=band(i);g.lineTo(b.cx+b.rr,b.cy)}g.closePath();g.fill();
  g.fillStyle=rgba('#e8fff8',.12*al);g.beginPath();for(let i=0;i<n;i++){const b=band(i);g.lineTo(b.cx-b.rr*.4,b.cy)}for(let i=n-1;i>=0;i--){const b=band(i);g.lineTo(b.cx+b.rr*.4,b.cy)}g.closePath();g.fill()}
 // anneaux du vortex : tirets qui défilent (sens opposés devant / derrière = rotation)
 for(let i=0;i<n;i++){const b=band(i);g.strokeStyle=front?rgba(i%2?'#ffffff':'#a8e8d4',.72*al):rgba('#8cc4b4',.5*al);g.lineWidth=(front?4:3)*S2*(1-i*.035);g.setLineDash([b.rr*1.1,b.rr*.3]);g.lineDashOffset=(front?-1:1)*t*b.rr*7;
  g.beginPath();g.ellipse(b.cx,b.cy,b.rr,b.rr*.3,0,front?0:Math.PI,front?Math.PI:Math.PI*2);g.stroke()}g.setLineDash([]);
 // poussière soulevée qui tourbillonne au pied (arcs qui tournent autour de la base)
 g.lineCap='round';for(let j=0;j<7;j++){const m=t*(2.6+(j%3)*.5)+j*1.9,R=x.r*(.5+(j%3)*.22)*q.s;if((Math.sin(m)>0)!==!!front)continue;g.strokeStyle=rgba(j%2?'#e6dcc4':'#cfdcd4',.34*al);g.lineWidth=(3.5+(j%2)*2.5)*S2;g.beginPath();g.ellipse(q.x,q.y-3*S2,R,R*K,0,m-.5,m+.5);g.stroke()}
 // débris (feuilles, terre) qui tournent et montent
 for(let j=0;j<14;j++){const th=t*(4+j%3)+j*2.1;if((Math.sin(th)>0)!==!!front)continue;const b=band(Math.floor((t*3.2+j*1.7)%11)),px=b.cx+Math.cos(th)*b.rr*.95,py=b.cy+Math.sin(th)*b.rr*.3;g.fillStyle=j%3?'#5aa83a':'#8a7a5a';g.fillRect(px-2.2*S2,py-1.3*S2,4.4*S2,2.6*S2)}}
AUXD.fu_tornado=(x,k,t)=>fuTorn(x,0,t);

// ---- effets (jx)
// éclat de tir : anneau de pression perpendiculaire à la visée + traits vers l'avant
JFXD.fu_muzzle=(f,k,e)=>{const q=P(f.x,f.y,28),R=(f.r||14)*q.s*(.6+e*.9),sa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));g.globalCompositeOperation='lighter';g.translate(q.x,q.y);g.rotate(sa);
 g.strokeStyle=rgba('#e8fff8',.85*k);g.lineWidth=2;g.beginPath();g.ellipse(e*R*.6,0,R*.32,R,0,0,7);g.stroke();
 g.strokeStyle=rgba('#7fe0c0',.7*k);g.lineWidth=1.4;g.beginPath();for(let i=-2;i<=2;i++){g.moveTo(R*.3,i*R*.3);g.lineTo(R*(.9+e*1.4),i*R*.42)}g.stroke()};
// impact de vent : anneau qui s'ouvre + traits rayonnants (plus blanc quand un tir est bloqué)
JFXD.fu_pop=(f,k,e)=>{const q=P(f.x,f.y,26),R=(f.r||18)*q.s,ro=R*(.35+e*.9);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(f.blk?'#ffffff':'#e8fff8',.85*k);g.lineWidth=1+2.5*k;g.beginPath();g.ellipse(q.x,q.y,ro,ro*.8,0,0,7);g.stroke();
 g.strokeStyle=rgba('#7fe0c0',.75*k);g.lineWidth=1.5;g.beginPath();for(let i=0;i<8;i++){const b=i*.785+(f.x%1),r0=R*(.25+e*.8),r1=R*(.5+e*1.3);g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.8);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*.8)}g.stroke();
 if(e<.35)circ(q.x,q.y,R*.4*(1-e/.35),rgba('#ffffff',.75))};
// le mur se lève : traits de vent qui montent du sol + poussière
JFXD.fu_wallrise=(f,k,e)=>{const c=Math.cos(f.a),s=Math.sin(f.a);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#e8fff8',.75*k);g.lineWidth=1.6;g.beginPath();
 for(let i=-5;i<=5;i++){const d=i*f.len/10,q=P(f.x+c*d,f.y+s*d,0),h=(12+e*74)*q.s,w=(i%2?5:-5)*q.s;g.moveTo(q.x,q.y);g.quadraticCurveTo(q.x+w,q.y-h*.55,q.x-w*.4,q.y-h)}g.stroke();
 g.globalCompositeOperation='source-over';g.fillStyle=rgba('#d8e8e0',.4*k);for(let i=-2;i<=2;i++){const d=i*f.len/4,q=P(f.x+c*d,f.y+s*d,4);g.beginPath();g.ellipse(q.x,q.y,(10+e*16)*q.s,(5+e*7)*q.s,0,0,7);g.fill()}};
// ÉCRASÉ : onde de choc, fissures, poussière
JFXD.fu_slam=(f,k,e)=>{const q=P(f.x,f.y,24),R=40*q.s;g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=3*k+1;g.beginPath();g.ellipse(q.x,q.y,R*(.4+e),R*(.4+e)*.75,0,0,7);g.stroke();
 g.strokeStyle=rgba('#1e2a26',.75*k);g.lineWidth=1.8;g.beginPath();for(let i=0;i<6;i++){const b=i*1.05+.3,L=R*(.5+(i%3)*.25);g.moveTo(q.x,q.y);g.lineTo(q.x+Math.cos(b)*L*.6,q.y+Math.sin(b)*L*.45+3);g.lineTo(q.x+Math.cos(b+.2)*L,q.y+Math.sin(b+.2)*L*.7)}g.stroke();
 g.fillStyle=rgba('#d8e8e0',.5*k);for(let i=0;i<5;i++){const b=i*1.26,d=R*(.5+e*.8);g.beginPath();g.arc(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6-e*14*q.s,(5+e*7)*q.s,0,7);g.fill()}};
// lame d'air : arc de taille devant le lanceur
JFXD.fu_slashfx=(f,k,e,t,u)=>{const x=u?u.x:f.x,y=u?u.y:f.y,q=P(x,y,30),R=50*q.s,sa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),sw=Math.min(1,e*2.4);g.globalCompositeOperation='lighter';g.translate(q.x,q.y);g.rotate(sa);
 g.fillStyle=rgba('#e8fff8',.5*k);g.beginPath();g.arc(0,0,R,-1.3,-1.3+2.6*sw);g.arc(0,0,R*.7,-1.3+2.6*sw,-1.3,true);g.closePath();g.fill();
 g.strokeStyle=rgba('#ffffff',.95*k);g.lineWidth=2.2;g.beginPath();g.arc(0,0,R,-1.3,-1.3+2.6*sw);g.stroke()};
// entaille en croix sur la cible de la lame
JFXD.fu_cutmark=(f,k,e,t,u,tg)=>{const q=P(tg?tg.x:f.x,tg?tg.y:f.y,40),L=36*q.s*Math.min(1,e*5),sa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a))+Math.PI/2;g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#7fe0c0',.6*k);g.lineWidth=7*k+1;g.beginPath();for(const o of[-.4,.4]){const b=sa+o;g.moveTo(q.x-Math.cos(b)*L,q.y-Math.sin(b)*L);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L)}g.stroke();g.strokeStyle=rgba('#ffffff',.95*k);g.lineWidth=2.5*k+.5;g.beginPath();
 for(const o of[-.4,.4]){const b=sa+o;g.moveTo(q.x-Math.cos(b)*L,q.y-Math.sin(b)*L);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L)}g.stroke()};
// rafale : éventail de vent qui jaillit des paumes
JFXD.fu_blastfx=(f,k,e,t,u)=>{const x=u?u.x:f.x,y=u?u.y:f.y,o=P(x+Math.cos(f.a)*22,y+Math.sin(f.a)*22,28),L=60+e*170;g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#c8fff0',.2*k);g.beginPath();g.moveTo(o.x,o.y);for(let i=0;i<=6;i++){const b=f.a-.34+.68*i/6,q=P(x+Math.cos(b)*L,y+Math.sin(b)*L,28);g.lineTo(q.x,q.y)}g.closePath();g.fill();
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=1.6;g.beginPath();for(let i=0;i<7;i++){const b=f.a-.3+.6*i/6,r0=L*.35,r1=L*(.6+(i%2)*.25),a1=P(x+Math.cos(b)*r0,y+Math.sin(b)*r0,28),a2=P(x+Math.cos(b)*r1,y+Math.sin(b)*r1,28);g.moveTo(a1.x,a1.y);g.lineTo(a2.x,a2.y)}g.stroke();
 g.strokeStyle=rgba('#e8fff8',.9*k);g.lineWidth=3*k+.5;g.beginPath();g.ellipse(o.x,o.y,(8+e*20)*o.s,(14+e*30)*o.s,Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),-1.3,1.3);g.stroke()};
// souffle : le lanceur inspire (anneaux qui convergent vers sa bouche)
JFXD.fu_inhale=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x+Math.cos(u.aim)*8,u.y+Math.sin(u.aim)*8,52);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#e8fff8',.75*k);g.lineWidth=1.6;
 for(let i=0;i<3;i++){const r=(44-((e*44+i*15)%44))*q.s;g.beginPath();g.arc(q.x,q.y,r,0,7);g.stroke()}};
// envol / tornade : rafale circulaire au sol (anneaux en tirets + traits en spirale)
JFXD.fu_gust=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#e8fff8',.8*k);g.lineWidth=2;g.setLineDash([16*q.s,9*q.s]);g.lineDashOffset=-e*80;
 for(const m of[1,.7]){g.beginPath();g.ellipse(q.x,q.y,R*(.3+e*.8)*m,R*(.3+e*.8)*m*K,0,0,7);g.stroke()}g.setLineDash([]);
 g.strokeStyle=rgba('#7fe0c0',.7*k);g.lineWidth=1.5;g.beginPath();for(let i=0;i<10;i++){const b=i*.628,r0=R*(.2+e*.6),r1=R*(.45+e*.9);g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*K-10*q.s);g.lineTo(q.x+Math.cos(b+.25)*r1,q.y+Math.sin(b+.25)*r1*K-22*q.s*e)}g.stroke()};
// tornade : moitié avant de l'entonnoir, dessinée après les ninjas (ils paraissent pris dedans)
JFXD.fu_tornf=(f,k,e,t)=>{for(const x of aux)if(x.type==='fu_tornado'&&x.n===f.n){if(near(x.x,x.y))fuTorn(x,1,t);break}};

// ---- gestes 3D
Object.assign(ANIM,{
 // mur : bras croisés devant puis écartés d'un balayage (le mur se lève)
 fu_wall:(P,e)=>{const k=ezo(Math.min(1,e/.45));pz(P,'armL',-1.45,0,-.5+1.5*k);pz(P,'armR',-1.45,0,.5-1.5*k);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'chest',.12);P.root.y=-2*k;pz(P,'thighL',-.25*k,0,.25*k);pz(P,'thighR',.15*k,0,-.25*k);pz(P,'shinL',.4*k);pz(P,'shinR',.4*k)},
 // balle d'air : paume tendue d'un coup sec
 fu_puff:(P,e)=>{const k=e<.2?ezo(e/.2):1-ezo((e-.2)/.8)*.6;pz(P,'armR',-1.6*k-.1,0,.12);pz(P,'foreR',-.05);pz(P,'armL',-.5,0,.35);pz(P,'foreL',-1.1);pz(P,'chest',.15*k,.35*k);P.root.z=4*k;pz(P,'thighR',-.45*k);pz(P,'shinR',.4*k)},
 // triple balle : trois paumes alternées, la dernière avec un pas en avant
 fu_tri:(P,e)=>{const i=Math.min(2,Math.floor(e*3)),f=e*3-i,k=f<.35?ezo(f/.35):1-(f-.35)/.65*.7,L=i%2===1,s=L?'L':'R',o=L?'R':'L';pz(P,'arm'+s,-1.6*k-.1,0,L?-.12:.12);pz(P,'fore'+s,-.05);pz(P,'arm'+o,-.7,0,L?-.3:.3);pz(P,'fore'+o,-1.3);
  pz(P,'chest',.12,(L?-.3:.3)*k);P.root.z=(i===2?7:3)*k;if(i===2){pz(P,'thighR',-.55*k);pz(P,'shinR',.5*k)}},
 // grande balle : rassemble l'air sur le côté, puis pousse à deux mains en fente avant
 fu_big:(P,e)=>{if(e<.3){const k=ezo(e/.3);pz(P,'armL',-.9*k,0,.2);pz(P,'armR',-.9*k,0,-.2);pz(P,'foreL',-1.6*k);pz(P,'foreR',-1.6*k);pz(P,'chest',-.1*k,-.5*k);P.root.y=-2*k}
  else{const k=ezo(Math.min(1,(e-.3)/.25));pz(P,'armL',-.9-.65*k,0,.2-.4*k);pz(P,'armR',-.9-.65*k,0,-.2+.4*k);pz(P,'foreL',-1.6+1.5*k);pz(P,'foreR',-1.6+1.5*k);pz(P,'chest',-.1+.4*k,-.5+.5*k);P.root.z=9*k;P.root.y=-2-2*k;pz(P,'thighR',-.8*k);pz(P,'shinR',.8*k);pz(P,'thighL',.4*k);pz(P,'shinL',.5*k)}},
 // rafale : deux paumes jointes en avant, puis le recul rejette le buste en arrière
 fu_blast:(P,e)=>{const k=e<.15?ezo(e/.15):1,r=e<.15?0:bump((e-.15)/.85);pz(P,'armL',-1.55,0,-.35);pz(P,'armR',-1.55,0,.35);pz(P,'foreL',-.05);pz(P,'foreR',-.05);pz(P,'chest',.2*k-.45*r);pz(P,'head',-.25*r);P.root.z=4*k-10*r;P.root.y=-2;pz(P,'thighL',-.5*r);pz(P,'shinL',.6*r);pz(P,'thighR',.3);pz(P,'shinR',.4)},
 // balles chargées : bras levés qui font tourner l'air au-dessus de la tête
 fu_charge:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.3)),a=t*9;pz(P,'armL',-2.6*k+Math.sin(a)*.25,0,.35);pz(P,'armR',-2.6*k+Math.sin(a+Math.PI)*.25,0,-.35);pz(P,'foreL',-.6);pz(P,'foreR',-.6);pz(P,'head',-.3*k);pz(P,'chest',-.12*k)},
 // lame d'air : armé du buste puis revers horizontal de la main
 fu_slash:(P,e)=>{const w=e<.2?ezo(e/.2):1,s=e<.2?0:ezo(Math.min(1,(e-.2)/.22));pz(P,'armR',-1.5,1.3-2.6*s,0);pz(P,'foreR',-.15);pz(P,'armL',-.4,0,.5);pz(P,'foreL',-1);pz(P,'chest',.2,-.6*w+1.1*s);P.root.z=6*s;P.root.y=-2;pz(P,'thighR',-.6*s);pz(P,'shinR',.6*s)},
 // souffle : inspire, puis pousse le vent à deux mains, jambes ancrées, cheveux au vent
 fu_gale:(P,e,u,t)=>{const inh=e<.1,k=inh?e/.1:1,v=Math.sin(t*30)*.04;pz(P,'armL',inh?-.6:-1.5+v,0,inh?.4:-.25);pz(P,'armR',inh?-.6:-1.5-v,0,inh?-.4:.25);pz(P,'foreL',inh?-1.8:-.1);pz(P,'foreR',inh?-1.8:-.1);
  pz(P,'chest',inh?-.3*k:.3);pz(P,'head',inh?-.3*k:.05);P.root.y=-3;P.root.z=inh?-2:3;pz(P,'thighL',-.55,0,.2);pz(P,'shinL',.7);pz(P,'thighR',.45,0,-.2);pz(P,'shinR',.5);pz(P,'cape',-.9);pz(P,'hair',.4)},
 // couloir : grand pas en avant, bras tendus qui s'écartent pour ouvrir le couloir
 fu_corr:(P,e)=>{const k=ezo(Math.min(1,e/.25)),s=e<.25?0:ezo(Math.min(1,(e-.25)/.3));pz(P,'armL',-1.5,0,-.3+.75*s);pz(P,'armR',-1.5,0,.3-.75*s);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'chest',.3*k);P.root.z=8*k;P.root.y=-4*k;
  pz(P,'thighR',-.9*k);pz(P,'shinR',.9*k);pz(P,'thighL',.5*k);pz(P,'shinL',.4*k);pz(P,'cape',-1);pz(P,'hair',.5)},
 // tornade : tour complet bras écartés, puis la main droite envoie la tornade
 fu_spin:(P,e)=>{if(e<.55){const k=e/.55;P.rootR.y=Math.PI*2*ezio(k);pz(P,'armL',-1.3,0,1.2);pz(P,'armR',-1.3,0,-1.2);pz(P,'foreL',-.1);pz(P,'foreR',-.1);P.root.y=2*bump(k)}
  else{const k=ezo(Math.min(1,(e-.55)/.2));P.rootR.y=1e-4;pz(P,'armR',-1.62*k,0,.1);pz(P,'foreR',0);pz(P,'armL',-.4,0,.6);pz(P,'chest',.2*k,.3*k);P.root.z=6*k;pz(P,'thighR',-.5*k);pz(P,'shinR',.5*k)}},
 // envol : s'accroupit puis bondit, bras rejetés en arrière
 fu_leap:(P,e)=>{if(e<.18){const k=e/.18;P.root.y=-6*k;pz(P,'thighL',-.9*k);pz(P,'shinL',1.5*k);pz(P,'thighR',-.6*k);pz(P,'shinR',1.3*k);pz(P,'chest',.5*k);pz(P,'armL',.5*k,0,.3);pz(P,'armR',.5*k,0,-.3)}
  else{const b=bump((e-.18)/.82);P.root.y=4*b;pz(P,'thighL',-1.1*b);pz(P,'shinL',1.6*b);pz(P,'thighR',-.3*b);pz(P,'shinR',1.2*b);pz(P,'chest',.35);pz(P,'armL',.8,0,.5);pz(P,'armR',.8,0,-.5);pz(P,'cape',-1.1);pz(P,'hair',.5)}},
});
