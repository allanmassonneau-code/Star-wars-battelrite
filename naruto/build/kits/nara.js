// ===== Clan Nara =====
// Les ombres rampent au sol (aux 'na_ten') : elles passent sous les projectiles mais s'arrêtent sur les poteaux et les murs.
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c2',[
 [1,'B','x.na_mane','Kage Mane','Ombre au sol : possédée 1 s puis ralentie, la cible imite tes pas en miroir et ne peut plus agir ; toi, jutsu seulement','shadow'],
 [2,'C','x.na_run','Course de l\'ombre','2 s très rapide, insensible aux ralentissements et entraves ; ta traînée d\'ombre ralentit les ennemis','shadow'],
 [3,'A','x.na_kubi','Kage Kubi Shibari','Étrangle la cible : entravée, réduite au silence et blessée 1 s ; instantané si ton ombre la tient déjà','shadow'],
 [1,'D','x.na_trap','Ombre explosive','Piège : parchemin caché dans une flaque d\'ombre (2 max) ; l\'ennemi est entravé, puis tout explose','shadow'],
 [5,'S','x.na_nui','Kage Nui','5 aiguilles d\'ombre en éventail transpercent tout : dégâts et entrave ; de près, plusieurs touchent','shadow'],
 [4,'C','x.na_prot','Ombre protectrice','Recule d\'un bond (à l\'opposé de la visée) avec un bouclier ; ton ombre fouette et ralentit les proches','shadow'],
 [4,'D','x.na_plan','Plan du stratège','Réfléchis 0,4 s sans bouger ni agir : ton prochain jutsu à mudras (dans les 8 s) part aussitôt et sans chakra','shadow'],
 [5,'S','x.na_lie','Ombres liées','Ton ombre s\'étend autour de toi puis saisit les ennemis dedans : ramenés vers toi et entravés 1 s','shadow'],
]);
// ---- outils communs
const naI=u=>units.indexOf(u);
const naS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son joué tel quel (sans le mappage de l'élément)
const naSay=(u,s,col)=>{if(near(u.x,u.y))txt.push({x:u.x,y:u.y,z:122,s,col,t:1})}; // au-dessus des textes d'état du moteur
// trait « Ombre tenace » : une cible déjà ralentie ou contrôlée (entrave, étourdissement, silence, peur, possession) subit des contrôles plus longs
const naCtl=e=>e.root>0||e.stun>0||e.slow>0||e.silence>0||e.fear>0||e.na_posT>SIMT;
const naLong=e=>naCtl(e)?1.25:1;
// retour visuel du trait (au plus une fois par seconde et par cible)
const naTenace=t=>{if(t.na_tT>SIMT)return;t.na_tT=SIMT+1.2;naSay(t,'OMBRE TENACE','#b8b8e0');naG({kind:'ten',x:t.x,y:t.y,ti:naI(t),t:.5})};
// cible tenue par l'ombre d'un Nara (possession, piège, aiguilles, Ombres liées) : Kubi Shibari la saisit sans délai (si elle n'est pas trop loin)
const naHold=(e,u,d)=>{const k=e.na_by===u&&e.na_hT>SIMT?e.na_hT:0;e.na_by=u;e.na_hT=Math.max(k,SIMT+d)};
function naHeld(u,a,td){const p=atP(u,a,td,640);let b=null,bd=260;for(const e of enemies(u))if(e.na_by===u&&e.na_hT>SIMT&&Math.hypot(e.x-u.x,e.y-u.y)<600){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd){bd=d;b=e}}return b}
// interrompt ce que la cible prépare (mudras, souffle, toupie, canalisation) comme un étourdissement ; vrai s'il y avait quelque chose
function naStop(e){const c=e.chan,on=!!(e.cast||e.flame||e.spin||c);e.cast=null;e.flame=null;e.spin=null;if(c){e.chan=null;e.cds[c.i]=c.cd;for(const x of aux)if(x.type==='chan'&&x.owner===e)x.t=0}return on}
// distance d'un point au segment [A,B] parcouru pendant l'image (la tête d'une ombre rapide ne saute plus par-dessus une cible) ; naSK = position sur le segment
let naSK=0;
function naSeg(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;naSK=L?clamp(((px-ax)*dx+(py-ay)*dy)/L,0,1):0;return Math.hypot(px-ax-dx*naSK,py-ay-dy*naSK)}
// effet au sol (dessiné sous les ninjas) : kind = burst, snap, ten, lash
const naG=(o)=>aux.push(Object.assign({type:'na_gfx',r:0,k:0,team:-1,vfx:'shadow'},o,{m:o.t}));
// ombre qui rampe au sol depuis le lanceur ; x.hit(x,e) → true : la tête s'accroche (lien), false : elle se dissipe, 'p' : elle traverse
function naTen(u,a,o){const x=Object.assign({type:'na_ten',x:u.x+Math.cos(a)*16,y:u.y+Math.sin(a)*16,a,ui:naI(u),ti:-1,n:0,d:0,t:9,m:9,team:u.team,owner:u,vfx:'shadow',k:0,r:10,spd:620,max:460,w:8,hs:new Set()},o);aux.push(x);return x}
const NA_LOCK=['root','silence','disarm']; // verrous de la possession (durée restante réelle, retirés si le lien casse avant la fin)
// fin de possession : rompue avant terme → on rend les verrous ; menée à terme → la cible reste ralentie (l'ombre engourdit ses jambes)
function naFree(x){const e=x.tg;x.n=2;x.ti=-1;x.tg=null;if(e&&x.kind==='mane'){e.na_posT=0;if(x.hold>.05){for(const k of NA_LOCK)if(Math.abs(e[k]-x.hold)<.06)e[k]=0}
  else if(!e.dead&&e.unstop<=0&&!(e.slowImm>0)){e.slow=Math.max(e.slow,NA_MANE.after);say(e,'RALENTI','#b8b8d0')}if(e.anim&&e.anim.k==='na_ne')e.anim=null;const o=x.owner;if(o&&o.anim&&o.anim.k==='na_ne')o.anim=null}}
// ce que fait l'ombre accrochée, image par image (false = le lien se rompt)
const NA_HOLD={
 // possession : la cible ne peut plus agir et fait le même pas que toi, en face (symétrie centrale) ; tes mains restent en signe
 mane:(x,dt,o,e)=>{if(e.unstop>0||o.stun>0||Math.hypot(o.x-e.x,o.y-e.y)>x.max+140){if(!e.dead)say(e,'LIBÉRÉ','#c8c8e0');return false}
  for(const k of NA_LOCK)e[k]=Math.max(e[k],x.hold);e.blockLock=Math.max(e.blockLock,.12);e.cast=null;e.slowImm=0;e.na_posT=SIMT+x.hold;o.disarm=Math.max(o.disarm,.12);
  let dx=o.x-x.px,dy=o.y-x.py;const L=Math.hypot(dx,dy),c=e.ch.spd*dt*1.15;x.px=o.x;x.py=o.y;if(L>c){dx*=c/L;dy*=c/L}
  if(L>.05){e.x-=dx;e.y-=dy;collide(e);e.moving=1;e.walk=(e.walk||0)+dt*13}else e.moving=0;
  e.aim=o.aim+Math.PI;if(e.anim&&e.anim.k==='na_ne')e.anim.t=x.hold;else e.anim={k:'na_ne',t:x.hold,m:x.h0};
  if(!o.cast&&(!o.anim||o.anim.k==='na_ne'))o.anim={k:'na_ne',t:x.hold,m:x.h0};return true},
 // étranglement : dégâts réguliers tant que l'ombre serre (k += intervalle : le rythme ne dérive pas d'une image à chaque tic)
 kubi:(x,dt,o,e)=>{if(e.unstop>0||o.stun>0||Math.hypot(o.x-e.x,o.y-e.y)>x.max+140)return false;if(x.k<=0&&x.ticks>0){x.k+=x.iv;x.ticks--;const V=VFX;VFX='shadow';hit(e,o,x.tick,{});VFX=V}return true},
 // lien visuel d'Ombres liées (la cible est entravée)
 lie:()=>true,
};
AUXF.na_ten=(x,dt)=>{const o=x.owner;if(!o||o.dead){if(x.n===1)naFree(x);x.t=0;return} // lanceur mort : la prise cesse aussitôt
 if(x.n===0){const s=x.spd*dt,ax=x.x,ay=x.y;x.x+=Math.cos(x.a)*s;x.y+=Math.sin(x.a)*s;x.d+=s;
  let end=x.d>=x.max||x.x<B.x||x.x>B.x+B.w||x.y<B.y||x.y>B.y+B.h;
  for(const p of OBST)if(!end&&Math.abs(x.x-p.x)<p.r+40&&naSeg(p.x,p.y,ax,ay,x.x,x.y)<p.r+4)end=true;
  for(const w of walls)if(!end&&w.team!==x.team&&naSeg(w.x,w.y,ax,ay,x.x,x.y)<w.r+6)end=true;
  // cibles touchées pendant ce pas, dans l'ordre du trajet
  let C=null;if(!end)for(const e of enemies(o)){if(x.hs.has(e)||Math.abs(e.x-x.x)>s+x.r+e.r+4)continue;if(naSeg(e.x,e.y,ax,ay,x.x,x.y)<=x.r+e.r)(C||(C=[])).push([naSK,e])}
  if(C){if(C.length>1)C.sort((a,b)=>a[0]-b[0]);for(const [,e] of C){x.hs.add(e);const V=VFX;VFX='shadow';const r=x.hit(x,e);VFX=V;if(r==='p')continue;if(r){x.n=1;x.tg=e;x.ti=naI(e)}else end=true;break}}
  if(end&&x.n===0)x.n=2;return}
 if(x.n===1){const e=x.tg;x.hold-=dt;if(!e||e.dead||x.hold<=0||!NA_HOLD[x.kind](x,dt,o,e)){naFree(x);return}x.x=e.x;x.y=e.y;return}
 const b=Math.atan2(o.y-x.y,o.x-x.x),s=1500*dt;x.x+=Math.cos(b)*s;x.y+=Math.sin(b)*s;if(Math.hypot(o.x-x.x,o.y-x.y)<34)x.t=0};
// Kage Mane : la tête de l'ombre touche → possession
function naManeHit(x,e){const o=x.owner,D=naLong(e);if(!hit(e,o,NA_MANE.dmg,{})||e.dead||e.unstop>0)return false;if(D>1)naTenace(e);
 x.hold=x.h0=D;x.px=o.x;x.py=o.y;e.na_posT=SIMT+D;naHold(e,o,D);for(const k of NA_LOCK)e[k]=Math.max(e[k],D);naStop(e);e.slowImm=0;e.dash=null;e.block=false;e.anim={k:'na_ne',t:D,m:D};
 say(e,'POSSÉDÉ','#d8d8f0');naS('genjutsu',o);naG({kind:'snap',x:e.x,y:e.y,t:.45});jx({jfx:'na_pos',ti:naI(e),ui:naI(o),x:e.x,y:e.y,t:D+.1,m:D+.1});return true}
// Kage Kubi Shibari : entrave + silence (allongés par le trait), interrompt les mudras, puis l'ombre serre
function naKubi(u,e,inst,x){const O={root:1};if(!hit(e,u,6,O)||e.dead)return false;const H=clamp(O.root||1,.5,1.6); // durée de CE coup (allongée par le trait), pas une entrave déjà présente
 if(e.unstop<=0){e.silence=Math.max(e.silence,H);e.dash=null;if(naStop(e))say(e,'INTERROMPU','#fc6');naSay(e,'ÉTRANGLÉ','#d8d8f0')} // silence posé ici : un seul texte au lieu de deux superposés
 if(!x){x=naTen(u,ang(u,e),{kind:'kubi',w:7,n:1,x:e.x,y:e.y});naG({kind:'snap',x:e.x,y:e.y,t:.4});naS('genjutsu',u)}
 // N tics réguliers, le dernier juste avant la fin de la prise (sinon il tombe après et se perd)
 const N=Math.max(1,Math.round(H/.25)),iv=H/N;Object.assign(x,{kind:'kubi',n:1,tg:e,ti:naI(e),hold:H,iv,k:iv-.07,ticks:N,tick:6});naHold(e,u,H);
 jx({jfx:'na_hands',ti:naI(e),ui:naI(u),x:e.x,y:e.y,t:H,m:H});return true}
Object.assign(NAT,{
 na_mane:S_('Kage Mane','Ombre au sol : possédée 1 s puis ralentie, la cible imite tes pas en miroir et ne peut plus agir ; toi, jutsu seulement',10,{hero:'padme',line:{len:460,w:22},ai:RG(430,.55)},(u,a)=>{S('shadow',u);anim(u,'na_ne',.6);naG({kind:'burst',x:u.x,y:u.y,a,t:.35,n:3});naTen(u,a,{kind:'mane',spd:NA_MANE.spd,max:460,r:11,w:9,hit:naManeHit})}),
 na_kubi:S_('Kage Kubi Shibari','Étrangle la cible : entravée, réduite au silence et blessée 1 s ; instantané si ton ombre la tient déjà',12,{line:{len:420,w:20},ai:RG(410,.6)},(u,a,td)=>{S('shadow',u);anim(u,'na_grip',.75);const h=naHeld(u,a,td);if(h){naKubi(u,h,1);return}naTen(u,a,{kind:'kubi',spd:720,max:420,r:10,w:7,hit:(x,e)=>naKubi(x.owner,e,0,x)})}),
 na_trap:S_('Ombre explosive','Piège : parchemin caché dans une flaque d\'ombre (2 max) ; l\'ennemi est entravé, puis tout explose',9,{tele:{r:58,max:380},ai:RG(370,.45)},(u,a,td)=>{const p=atP(u,a,td,380);S('shadow',u);anim(u,'summon',.45);
  const mine=aux.filter(x=>x.type==='na_trap'&&x.owner===u&&x.n<2);if(mine.length>=2)mine[0].t=0;
  aux.push({type:'na_trap',x:p.x,y:p.y,r:58,t:16,m:16,team:u.team,owner:u,ui:naI(u),ti:-1,vfx:'shadow',k:0,n:0,arm:.5});jx({jfx:'na_toss',ui:naI(u),x:u.x,y:u.y,x2:p.x,y2:p.y,t:.3,m:.3})}),
 na_nui:ULT('Kage Nui','5 aiguilles d\'ombre en éventail transpercent tout : dégâts et entrave ; de près, plusieurs touchent',{line:{len:470,w:120},ai:{max:390,p:.8}},(u,a)=>{S('shadow',u);naS('heavy',u);anim(u,'na_nui',.65);naG({kind:'burst',x:u.x,y:u.y,a,t:.5,n:9});const grp=new Map();
  for(let i=-2;i<=2;i++)naTen(u,a+i*.17,{kind:'nui',spd:980,max:470,r:9,w:4,hit:(x,e)=>{const c=grp.get(e)||0,T=NA_NUI;if(c<T.max){grp.set(e,c+1);if(hit(e,x.owner,c?T.more:T.first,{root:T.root})){naHold(e,x.owner,e.root);jx({jfx:'na_spike',ti:naI(e),ui:naI(x.owner),x:e.x,y:e.y,a:x.a,c,t:1.2,m:1.2})}}return 'p'}})}),
 na_prot:S_('Ombre protectrice','Recule d\'un bond (à l\'opposé de la visée) avec un bouclier ; ton ombre fouette et ralentit les proches',8,{hero:'gideon',tele:{self:1,r:135},ai:SELF(170,.55)},(u,a)=>{const ox=u.x,oy=u.y;S('shadow',u);naS('dash',u);anim(u,'backflip',.42);dash(u,a+Math.PI,210,.32,{jump:38});shieldU(u,22,2.5);u.na_sh=2.5;
  naG({kind:'lash',x:ox,y:oy,a,t:.42});for(const e of enemies(u))if(Math.hypot(e.x-ox,e.y-oy)<135+e.r&&hit(e,u,6,{slow:1.5}))naG({kind:'lash',x:ox,y:oy,a,t:.42,ti:naI(e)})}),
 na_run:S_('Course de l\'ombre','2 s très rapide, insensible aux ralentissements et entraves ; ta traînée d\'ombre ralentit les ennemis',8,{hero:'grievous',ai:{mode:'esc',max:220,p:.45}},(u,a)=>{S('shadow',u);anim(u,'na_melt',.32);u.haste=Math.max(u.haste,2);u.slowImm=Math.max(u.slowImm,2);u.slow=0;u.root=0;
  aux.push({type:'na_run',x:u.x,y:u.y,a,r:0,t:2,m:2,team:u.team,owner:u,ui:naI(u),vfx:'shadow',k:0,lx:u.x,ly:u.y});aux.push({type:'na_pud',x:u.x,y:u.y,a,r:34,t:1.6,m:1.6,team:u.team,owner:u,vfx:'shadow',k:0});naG({kind:'snap',x:u.x,y:u.y,t:.35})}),
 // réflexion : un vrai temps mort (ni pas, ni jutsu, ni attaque, ni parade) ; la Course ne la contourne pas
 na_plan:S_('Plan du stratège','Réfléchis 0,4 s sans bouger ni agir : ton prochain jutsu à mudras (dans les 8 s) part aussitôt et sans chakra',10,{ai:RG(900,.35,260)},(u)=>{const R=NA_PLAN.think;S('shadow',u);anim(u,'na_think',R+.05);u.slowImm=0;for(const k of NA_SELF)u[k]=Math.max(u[k],R);
  aux.push({type:'na_plan',x:u.x,y:u.y,r:0,t:R,m:R,team:u.team,owner:u,ui:naI(u),vfx:'shadow',k:0});jx({jfx:'na_shogi',ui:naI(u),x:u.x,y:u.y,t:R+.05,m:R+.05})}),
 na_lie:ULT('Ombres liées','Ton ombre s\'étend autour de toi puis saisit les ennemis dedans : ramenés vers toi et entravés 1 s',{hero:'rey',tele:{self:1,r:225},ai:SELF(190,.8)},(u)=>{S('shadow',u);anim(u,'na_ne',.5);u.slowImm=0;u.root=Math.max(u.root,.5);
  aux.push({type:'na_lie',x:u.x,y:u.y,r:30,w:225,t:1,m:1,team:u.team,owner:u,ui:naI(u),vfx:'shadow',k:0,n:0})}),
});
Object.assign(NATHERO,{na:'padme'});
// ---- réglages : Ombres liées (dégâts, étourdissement, entrave, distance d'attraction), Kage Mane, Plan du stratège
const NA_LIE={dmg:10,stun:0,root:1,pull:62};
const NA_MANE={dmg:12,spd:660,after:1}; // after : ralentissement quand la possession va à son terme
const NA_NUI={first:34,more:10,max:3,root:1}; // 1re aiguille sur une cible, aiguilles suivantes (bout portant), aiguilles max par cible
const NA_PLAN={think:.4,ready:8};
const NA_SELF=['root','disarm','silence','blockLock']; // ce que la réflexion du Plan bloque chez le Nara (rendu si elle est rompue)
// ---- objets au sol (hôte)
// Ombre explosive : s'arme en 0,5 s ; l'ennemi qui pose le pied sur la flaque visible est entravé, la mèche brûle 0,55 s puis tout explose
AUXF.na_trap=(x,dt)=>{const o=x.owner;if(!o||o.dead){x.t=0;return}
 if(x.n<2){if((x.arm-=dt)>0)return;x.n=1;
  for(const e of enemies(o))if(!(e.phase>0)&&Math.hypot(e.x-x.x,e.y-x.y)<x.r*.62+e.r){x.n=2;x.tg=e;x.ti=naI(e);x.fuse=.55;x.t=1;const V=VFX;VFX='shadow';hit(e,o,4,{root:.55});VFX=V;naHold(e,o,.55);naSay(e,'PIÈGE !','#ffb04a');naS('deflect',o);
   jx({jfx:'na_wrap',ti:naI(e),x:e.x,y:e.y,t:.55,m:.55,legs:1});jx({jfx:'na_fuse',x:x.x,y:x.y,t:.55,m:.55});break}return}
 if((x.fuse-=dt)>0||x.done)return;x.done=1;x.t=0;const V=VFX;VFX='tag';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<85+e.r)hit(e,o,16,{fx:x.x,fy:x.y,kb:70});
 sparks(x.x,x.y,'#ff9a3a',16,'tag');VFX=V;naS('boom',o);jx({jfx:'na_boom',x:x.x,y:x.y,r:85,t:.55,m:.55});if(near(x.x,x.y))shake=Math.max(shake,.22)};
// Course de l'ombre : une flaque tous les ~30 px ; chaque flaque ralentit les ennemis qui la traversent
AUXF.na_run=(x)=>{const o=x.owner;if(!o||o.dead){x.t=0;return}x.x=o.x;x.y=o.y;if(Math.hypot(o.vx||0,o.vy||0)>40)x.a=Math.atan2(o.vy,o.vx);
 const L=Math.hypot(o.x-x.lx,o.y-x.ly);if(L>30){aux.push({type:'na_pud',x:o.x,y:o.y,a:Math.atan2(o.y-x.ly,o.x-x.lx),len:Math.min(L,60),r:26,t:2.2,m:2.2,team:x.team,owner:o,vfx:'shadow',k:0});x.lx=o.x;x.ly=o.y}};
AUXF.na_pud=x=>{if(x.k>0)return;x.k=.2;for(const e of enemies(x.owner))if(e.unstop<=0&&!(e.slowImm>0)&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){if(!(e.slow>0))say(e,'RALENTI','#b8b8d0');e.slow=Math.max(e.slow,.45)}};
// Ombres liées : la nappe s'étend 0,5 s (centrée sur le Nara, même repoussé), puis saisit tout ce qui est dedans
AUXF.na_lie=(x)=>{const o=x.owner;if(!o||o.dead){x.t=0;return}const el=x.m-x.t;if(x.n){x.r=x.w*Math.max(0,x.t/.55);return}
 x.x=o.x;x.y=o.y;x.r=30+(x.w-30)*Math.min(1,el/.5);if(el<.5)return;x.n=1;x.r=x.w;anim(o,'na_pull',.55);naS('heavy',o);if(near(x.x,x.y))shake=Math.max(shake,.25);
 for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d>x.w+e.r)continue;const b=Math.atan2(e.y-x.y,e.x-x.x),V=VFX;VFX='shadow';const T=NA_LIE,ok=hit(e,o,T.dmg,{stun:T.stun,root:T.root,unblockable:1});VFX=V;if(!ok)continue;
  if(e.unstop<=0&&T.pull<d){const L=Math.min(d,T.pull);e.dash={sx:e.x,sy:e.y,tx:x.x+Math.cos(b)*L,ty:x.y+Math.sin(b)*L,t:0,dur:.26,jump:0}}
  const H=Math.max(.3,e.stun,e.root);naHold(e,o,H);const l=naTen(o,b,{kind:'lie',n:1,x:e.x,y:e.y,w:6});Object.assign(l,{tg:e,ti:naI(e),hold:H});jx({jfx:'na_wrap',ti:naI(e),x:e.x,y:e.y,t:H,m:H})}};
// Plan du stratège : la réflexion est rompue si l'on est étourdi ; ensuite le plan reste prêt 8 s
AUXF.na_plan=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}x.x=o.x;x.y=o.y;
 if(o.stun>0){for(const k of NA_SELF)if(Math.abs(o[k]-x.t)<.06)o[k]=0;x.t=0;naSay(o,'PLAN ROMPU','#c8c8e0');return} // rompue : le Nara retrouve ses moyens dès la fin de l'étourdissement
 if(x.t<=0){o.na_pl=NA_PLAN.ready;naSay(o,'PLAN PRÊT','#ffd38a');naS('genjutsu',o)}};
AUXF.na_gfx=()=>{};
AUXF.na_dusk=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}x.x=o.x;x.y=o.y};
// ---- trait de clan
// options de coup déjà allongées par le trait → valeurs d'origine : un même objet d'options réutilisé (plusieurs cibles, plusieurs tirs) n'est jamais allongé deux fois
const NA_K=['root','stun','silence'],NA_OB=new WeakMap();
TRAITS[2]={nom:'Ombre tenace',desc:'Tes contrôles (entrave, étourdissement, silence, possession) durent 25 % de plus sur un ennemi déjà ralenti ou contrôlé',
 deal(src,t,dmg,o){const m=NA_OB.get(o);if(m)for(const k of NA_K)if(o[k]===m.x[k])o[k]=m.b[k];
  if((o.root||o.stun||o.silence)&&t.unstop<=0&&naCtl(t)){const b={},x={};for(const k of NA_K){b[k]=o[k];if(o[k])o[k]*=1.25;x[k]=o[k]}NA_OB.set(o,{b,x});naTenace(t)}return dmg},
 update(u,dt){if(u.na_sh>0)u.na_sh-=dt;if(u.auraV==='shadow')u.auraV=null;
  if(u.na_pl>0){u.na_pl-=dt;const c=u.cast;if(c&&c.i>0&&!c.na){const ab=castAb(u,c);if(ab&&ab.mud&&ab.key!=='na_plan'){c.na=1;c.dur=Math.min(c.dur,c.t+.01);u.energy=Math.min(100,u.energy+jcost(ab));u.na_pl=0;naSay(u,'COMME PRÉVU !','#ffd38a');naG({kind:'snap',x:u.x,y:u.y,t:.4})}}}
  if(!u.na_dk||aux.indexOf(u.na_dk)<0){u.na_dk={type:'na_dusk',x:u.x,y:u.y,r:0,t:1e9,m:1e9,team:u.team,owner:u,ui:naI(u),vfx:'shadow',k:0};aux.push(u.na_dk)}},
};
AFTER.push(()=>{UK.push('na_sh','na_pl');JFX.shadow=()=>{}}); // les signatures « shadow » génériques sont remplacées par celles de ce fichier
// ---- animations 3D
Object.assign(ANIM,{
 // signe du Rat (Ne), mains jointes devant la poitrine : la pose de la possession (aussi imitée par la cible)
 na_ne:(P,e,u)=>{const k=Math.min(1,e*8+.15);pz(P,'armL',-1.3*k,0,-.62*k);pz(P,'foreL',-1.85*k);pz(P,'armR',-1.3*k,0,.62*k);pz(P,'foreR',-1.85*k);pz(P,'chest',.16*k);pz(P,'head',.14*k);
  if(!u.moving){P.root.y=-2.5*k;pz(P,'thighL',-.2*k,0,.2*k);pz(P,'thighR',.15*k,0,-.2*k);pz(P,'shinL',.45*k);pz(P,'shinR',.4*k)}},
 // Kubi Shibari : bras tendus, les mains serrent par à-coups
 na_grip:(P,e,u,t)=>{const k=Math.min(1,e/.18),q=e>.2?Math.sin(t*20)*.16:0;pz(P,'armL',-1.5*k,0,-.3*k);pz(P,'armR',-1.5*k,0,.3*k);pz(P,'foreL',-.4-.6*k+q);pz(P,'foreR',-.4-.6*k-q);pz(P,'chest',.25*k);pz(P,'head',.1*k);
  P.root.y=-2.5*k;P.root.z=3*k;pz(P,'thighR',-.55*k);pz(P,'shinR',.7*k);pz(P,'thighL',.3*k);pz(P,'shinL',.3*k)},
 // Kage Nui : accroupi en signe, puis les bras jaillissent vers l'avant
 na_nui:(P,e)=>{const c=Math.min(1,e/.25),j=ezo(clamp((e-.3)/.18,0,1)),r=1-Math.max(0,(e-.78)/.22);P.root.y=(-7*c+4*j)*r;pz(P,'thighL',-.9*c*r);pz(P,'shinL',1.4*c*r);pz(P,'thighR',.25*c*r);pz(P,'shinR',1.2*c*r);pz(P,'chest',(.5*c-.25*j)*r);
  pz(P,'armL',(-1.3-.35*j)*r,0,(-.6+1*j)*r);pz(P,'armR',(-1.3-.35*j)*r,0,(.6-1*j)*r);pz(P,'foreL',(-1.85+1.7*j)*r);pz(P,'foreR',(-1.85+1.7*j)*r)},
 // Plan du stratège : accroupi, les bouts des doigts joints devant soi, tête baissée
 na_think:(P,e)=>{const k=Math.min(1,e*6);P.root.y=-8*k;pz(P,'thighL',-1.15*k,0,.3*k);pz(P,'shinL',1.9*k);pz(P,'thighR',-1.15*k,0,-.3*k);pz(P,'shinR',1.9*k);pz(P,'chest',.32*k);pz(P,'head',.38*k);
  pz(P,'armL',-1.05*k,0,-.42*k);pz(P,'foreL',-1.5*k);pz(P,'armR',-1.05*k,0,.42*k);pz(P,'foreR',-1.5*k)},
 // Course de l'ombre : plongée dans son ombre
 na_melt:(P,e)=>{const k=bump(e);P.root.y=-11*k;pz(P,'chest',.7*k);pz(P,'head',-.2*k);pz(P,'armL',1*k,0,.35*k);pz(P,'armR',1*k,0,-.35*k);pz(P,'thighL',-.8*k);pz(P,'shinL',1.3*k);pz(P,'thighR',.45*k);pz(P,'shinR',1*k)},
 // Ombres liées : bras grands ouverts, puis ramenés contre soi (on tire les ombres)
 na_pull:(P,e)=>{const o=e<.3,k=o?e/.3:1,c=o?0:ezo(Math.min(1,(e-.3)/.25));pz(P,'armL',-1.45*k,0,(1.25-1.85*c)*k);pz(P,'armR',-1.45*k,0,(-1.25+1.85*c)*k);pz(P,'foreL',-.15-1.6*c);pz(P,'foreR',-.15-1.6*c);
  pz(P,'chest',(-.2+.45*c)*k);P.root.y=-3*c;P.root.z=-4*c;pz(P,'thighL',-.3*c);pz(P,'shinL',.5*c);pz(P,'shinR',.4*c)},
});
// ---- visuels
// ruban d'ombre au sol de A à B (w = demi-largeur au départ), ondulant ; al = opacité
function naRib(ax,ay,bx,by,w,t,wv,al,tp=.6){const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy);if(L<6)return;const nx=-dy/L,ny=dx/L,N=Math.max(4,Math.min(16,L/24|0)),A=[],Z=[];
 for(let i=0;i<=N;i++){const k=i/N,o=Math.sin(k*L/34-t*9)*wv*Math.sin(Math.PI*k),h=w*(1-tp*k)+1.2,cx=ax+dx*k+nx*o,cy=ay+dy*k+ny*o;A.push(P(cx+nx*h,cy+ny*h,0));Z.push(P(cx-nx*h,cy-ny*h,0))}
 g.beginPath();g.moveTo(A[0].x,A[0].y);for(let i=1;i<=N;i++)g.lineTo(A[i].x,A[i].y);for(let i=N;i>=0;i--)g.lineTo(Z[i].x,Z[i].y);g.closePath();
 g.fillStyle=`rgba(9,9,13,${.86*al})`;g.fill();g.strokeStyle=`rgba(90,90,128,${.45*al})`;g.lineWidth=1;g.stroke()}
// flaque d'ombre aux bords lisses et ondulants (chemin seulement : remplir/tracer ensuite)
function naBlob(x,y,R,n,t,amp,ph){const p=[];for(let i=0;i<n;i++){const b=i*6.2832/n,r=R*(1+amp*Math.sin(b*3+ph+t*2)+amp*.6*Math.sin(b*5-t*3+ph));p.push(P(x+Math.cos(b)*r,y+Math.sin(b)*r,0))}
 g.beginPath();let a=p[n-1],c=p[0];g.moveTo((a.x+c.x)/2,(a.y+c.y)/2);for(let i=0;i<n;i++){const q=p[i],r=p[(i+1)%n];g.quadraticCurveTo(q.x,q.y,(q.x+r.x)/2,(q.y+r.y)/2)}g.closePath()}
// tête de l'ombre qui rampe : main pour Kage Mane, griffes pour Kubi Shibari, pointe pour Kage Nui
function naHead(kd,x,y,a,t,al){const c=Math.cos(a),s=Math.sin(a),W=(f,l)=>P(x+c*f-s*l,y+s*f+c*l,0),col=`rgba(9,9,13,${.92*al})`;g.fillStyle=col;
 if(kd==='nui'){const p=[W(28,0),W(0,-6),W(-5,0),W(0,6)];g.beginPath();g.moveTo(p[0].x,p[0].y);for(let i=1;i<4;i++)g.lineTo(p[i].x,p[i].y);g.closePath();g.fill();g.strokeStyle=`rgba(170,170,210,${.7*al})`;g.lineWidth=1;g.beginPath();g.moveTo(p[0].x,p[0].y);g.lineTo(p[1].x,p[1].y);g.stroke();return}
 const ku=kd==='kubi',n=ku?4:3;gEll(x,y,ku?8:11);g.fill();g.strokeStyle=col;g.lineCap='round';g.lineWidth=(ku?3:4)*P(x,y,0).s;g.beginPath();
 for(let i=0;i<n;i++){const l=(i-(n-1)/2)*(ku?5:7),w=Math.sin(t*14+i*1.7)*3,b=W(6,l),m=W(14,l*1.3+w),e=W(ku?23:20,ku?l*.5:l*1.1+w*1.5);g.moveTo(b.x,b.y);g.quadraticCurveTo(m.x,m.y,e.x,e.y)}g.stroke()}
AUXD.na_ten=(x,k,t)=>{const o=units[x.ui];if(!o||o.dead)return;const tg=x.n===1&&x.ti>=0?units[x.ti]:null,hx=tg?tg.x:x.x,hy=tg?tg.y:x.y,kd=x.kind;
 if(tg&&kd!=='nui'){const R=kd==='mane'?30:kd==='kubi'?25:20;g.fillStyle=`rgba(9,9,13,${.5*k})`;gEll(hx,hy,R);g.fill();g.strokeStyle=`rgba(90,90,130,${.55*k})`;g.lineWidth=1.5;gEll(hx,hy,R+Math.sin(t*9)*2.5);g.stroke()}
 naRib(o.x,o.y,hx,hy,x.n===2?(x.w||8)*.6:x.w||8,t,x.n===2?1.5:tg?3:kd==='nui'?2:5,k*(x.n===2?.75:1),tg?.15:.6);
 if(x.n===0)naHead(kd,hx,hy,x.a,t,k);else if(x.n===2){g.fillStyle=`rgba(9,9,13,${.8*k})`;gEll(hx,hy,5);g.fill()}};
// parchemin explosif dans sa flaque (à peine visible pour l'adversaire)
AUXD.na_trap=(x,k,t)=>{const el=x.m-x.t;if(x.n===0&&el<.3)return; // le parchemin est encore en l'air : la flaque naît quand il touche le sol
 const foe=player&&x.team!==player.team,q=P(x.x,x.y,0),s=q.s,gi=x.n===0?Math.min(1,(el-.3)/.15):1;g.globalAlpha=(x.n===2?1:foe?.2:.9)*gi;
 g.fillStyle='#0b0b10';naBlob(x.x,x.y,x.r*.62*(.45+.55*gi),10,t*.4,.1,x.x);g.fill();g.strokeStyle='rgba(90,90,128,.5)';g.lineWidth=1;g.stroke();
 g.save();g.translate(q.x,q.y-2*s);g.rotate(.35);g.fillStyle='#f0e0b0';g.fillRect(-7*s,-4*s,14*s,8*s);g.fillStyle='#c0302a';g.fillRect(-1.2*s,-3.2*s,2.4*s,6.4*s);g.fillRect(-5*s,-.6*s,10*s,1.2*s);g.restore();
 if(x.n<2){if(!foe){g.strokeStyle=x.n?'rgba(30,30,44,.55)':'rgba(30,30,44,.3)';g.lineWidth=1.5;g.setLineDash([4,5]);g.lineDashOffset=-t*12;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([])}g.globalAlpha=1;return}
 const tg=x.ti>=0?units[x.ti]:null,f=clamp((1-x.t)/.55,0,1);if(tg&&!tg.dead)naRib(x.x,x.y,tg.x,tg.y,7,t,2,1);
 g.fillStyle=`rgba(255,154,58,${.12+.18*f})`;gEll(x.x,x.y,85*f);g.fill();g.strokeStyle='#ff9a3a';g.lineWidth=2;gEll(x.x,x.y,85);g.stroke();
 g.globalAlpha=1};
AUXD.na_pud=(x,k)=>{const w=x.r*(.55+.45*k);g.fillStyle=`rgba(9,9,13,${.4*k})`;gEll(x.x,x.y,w);g.fill();if(x.len){const a=P(x.x,x.y,0),b=P(x.x-Math.cos(x.a)*x.len,x.y-Math.sin(x.a)*x.len,0);g.strokeStyle=`rgba(9,9,13,${.4*k})`;g.lineCap='round';g.lineWidth=w*1.5*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}};
AUXD.na_run=(x,k,t)=>{const o=units[x.ui];if(!o||o.dead)return;const a=x.a||0;naRib(o.x,o.y,o.x-Math.cos(a)*78,o.y-Math.sin(a)*78,13,t,4,.8*k)};
// nappe d'Ombres liées : elle s'étend (contour d'alerte), saisit, puis se retire
AUXD.na_lie=(x,k,t)=>{if(!x.n){g.strokeStyle='rgba(16,16,24,.75)';g.lineWidth=2.5;g.setLineDash([10,7]);g.lineDashOffset=-t*40;gEll(x.x,x.y,x.w);g.stroke();g.setLineDash([])}
 const R=x.r;if(R<4)return;g.fillStyle=`rgba(9,9,13,${x.n?.45:.6})`;naBlob(x.x,x.y,R,18,t*2,.05,0);g.fill();
 g.strokeStyle='rgba(90,90,128,.5)';g.lineWidth=1.5;g.stroke();g.strokeStyle='rgba(70,70,105,.45)';g.lineWidth=2;for(let i=0;i<3;i++){gEll(x.x,x.y,R*(.3+i*.22),t*2+i*2.1,t*2+i*2.1+2.2);g.stroke()}};
// effets au sol : burst (lancer), snap (l'ombre se referme), ten (Ombre tenace), lash (fouet d'Ombre protectrice)
AUXD.na_gfx=(x,k,t)=>{const e=1-x.t/x.m,f=Math.max(0,x.t/x.m);
 if(x.kind==='burst'){const n=x.n||5;g.fillStyle=`rgba(9,9,13,${.65*f})`;gEll(x.x,x.y,22+26*e);g.fill();for(let i=0;i<n;i++){const b=x.a+(i-(n-1)/2)*(n>5?.32:.5),L=26+(n>5?70:44)*e,p=P(x.x+Math.cos(b)*L,x.y+Math.sin(b)*L,0),p0=P(x.x+Math.cos(b+.22)*18,x.y+Math.sin(b+.22)*18,0),p1=P(x.x+Math.cos(b-.22)*18,x.y+Math.sin(b-.22)*18,0);g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(p.x,p.y);g.lineTo(p1.x,p1.y);g.fill()}}
 else if(x.kind==='snap'){g.strokeStyle=`rgba(10,10,14,${.9*f})`;g.lineWidth=5*f+1;gEll(x.x,x.y,58-34*e);g.stroke();g.strokeStyle=`rgba(120,120,170,${.5*f})`;g.lineWidth=1;gEll(x.x,x.y,50-30*e);g.stroke()}
 else if(x.kind==='ten'){const u=x.ti>=0?units[x.ti]:null,X=u?u.x:x.x,Y=u?u.y:x.y;g.strokeStyle=`rgba(12,12,18,${.85*f})`;g.lineWidth=3;gEll(X,Y,18+32*f);g.stroke();g.strokeStyle=`rgba(140,140,190,${.55*f})`;g.lineWidth=1;gEll(X,Y,14+28*f);g.stroke()}
 else if(x.kind==='lash'){const u=x.ti>=0?units[x.ti]:null,ex=Math.min(1,e*3.5);
  // fouets d'ombre effilés qui claquent depuis l'endroit quitté (et un plus épais vers chaque ennemi touché)
  if(u){naRib(x.x,x.y,x.x+(u.x-x.x)*ex,x.y+(u.y-x.y)*ex,7,t,7,f,.85);return}
  g.fillStyle=`rgba(9,9,13,${.5*f})`;naBlob(x.x,x.y,26,8,t,.12,x.a);g.fill();for(let i=0;i<7;i++){const b=i*.898+x.a,R=(70+(i%3)*30)*ex;naRib(x.x,x.y,x.x+Math.cos(b)*R,x.y+Math.sin(b)*R,5,t+i*.4,5,f,.9)}}};
// longue ombre du crépuscule : celle d'un Nara s'étire vers sa visée
AUXD.na_dusk=(x,k,t)=>{const o=units[x.ui];if(!o||o.dead||(o.stealth>0&&player&&o.team!==player.team))return;for(const a of aux)if(a.type==='na_ten'&&a.ui===x.ui&&a.kind!=='nui')return;const a=o.aim||0;naRib(o.x,o.y,o.x+Math.cos(a)*70,o.y+Math.sin(a)*70,10,t,1.5,.34)};
// sur les ninjas (dessinés par-dessus) : possession, mains étrangleuses, aiguilles, liens, explosion, parchemin lancé
JFXD.na_pos=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;let on=false;for(const a of aux)if(a.type==='na_ten'&&a.n===1&&a.ti===f.ti&&a.kind==='mane')on=true;if(!on)return;const q=P(tg.x,tg.y,0),s=q.s;
 g.fillStyle='rgba(9,9,13,.78)';for(let i=0;i<6;i++){const b=i*1.047+t*1.3,px=q.x+Math.cos(b)*15*s,py=q.y+Math.sin(b)*5*s+2*s,h=(10+((t*34+i*11)%22))*s;g.beginPath();g.moveTo(px-3*s,py);g.quadraticCurveTo(px+Math.sin(t*7+i)*5*s,py-h,px+2.5*s,py);g.fill()}
 g.globalAlpha=Math.min(1,e*f.m*5);g.font='bold 19px serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(8,8,12,.85)';g.strokeText('影',q.x,q.y-126*s);g.fillStyle='#e0e0f4';g.fillText('影',q.x,q.y-126*s);g.globalAlpha=1};
// Kubi Shibari : deux mains d'ombre grimpent le long du corps (côté caméra) et se referment sur le cou ; le collier serre à chaque tic
JFXD.na_hands=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const T=f.m,gr=ezo(Math.min(1,e*T/.25)),al=Math.min(1,k*T/.12),N=P(tg.x,tg.y,48),s=N.s,sq=1+Math.sin(t*22)*.07,H=[];g.lineCap='round';g.lineJoin='round';g.globalAlpha=al;g.fillStyle='#0a0a0e';
 for(let sd=-1;sd<=1;sd+=2){const a0=P(tg.x+sd*13,tg.y+9,0),m=P(tg.x+sd*16,tg.y+8,22*gr),a1=P(tg.x+sd*(12-3*gr),tg.y+6,8+38*gr);H.push(a1);
  // bras effilé (liseré clair : lisible même sur une tenue sombre) qui épouse le corps en montant
  g.beginPath();for(let side=1;side>=-1;side-=2)for(let i=0;i<=6;i++){const v=side>0?i/6:1-i/6,w=1-v,x=w*w*a0.x+2*w*v*m.x+v*v*a1.x,y=w*w*a0.y+2*w*v*m.y+v*v*a1.y,dx=2*w*(m.x-a0.x)+2*v*(a1.x-m.x),dy=2*w*(m.y-a0.y)+2*v*(a1.y-m.y),l=Math.hypot(dx,dy)||1,h=side*(3.8-1.9*v+Math.sin(v*9-t*12)*.4)*s;if(i||side<0)g.lineTo(x-dy/l*h,y+dx/l*h);else g.moveTo(x-dy/l*h,y+dx/l*h)}
  g.closePath();g.strokeStyle='rgba(175,175,230,.6)';g.lineWidth=2*s;g.stroke();g.fill()}
 // collier d'ombre qui serre le cou au rythme des dégâts
 if(gr>.85){g.strokeStyle='rgba(175,175,230,.7)';g.lineWidth=4.2*s;g.beginPath();g.ellipse(N.x,N.y,10*s*sq,4.2*s*sq,0,0,7);g.stroke();g.strokeStyle='#0a0a0e';g.lineWidth=2.6*s;g.stroke()}
 // les mains, par-dessus le collier : paume au bord du cou, trois doigts qui se referment sur la gorge
 if(gr>.55){const c=Math.min(1,(gr-.55)/.45);for(let i=0;i<2;i++){const a1=H[i],sd=i?1:-1;g.strokeStyle='rgba(175,175,230,.6)';g.lineWidth=1.2*s;g.beginPath();g.ellipse(a1.x,a1.y,4*s,3.2*s,0,0,7);g.fill();g.stroke();g.beginPath();
  for(let j=-1;j<=1;j++){const ex=lerp(a1.x,N.x-sd*1.5*s,c),ey=N.y+1.5*s+j*2.2*s;g.moveTo(a1.x,a1.y+j*1.4*s);g.quadraticCurveTo(lerp(a1.x,N.x,.5),ey+3*s*c,ex,ey)}g.lineWidth=3.4*s;g.stroke();g.strokeStyle='#0a0a0e';g.lineWidth=2*s;g.stroke()}}
 g.globalAlpha=1};
JFXD.na_spike=(f,k,e,t,u,tg)=>{if(!tg)return;const T=f.m,h=Math.min(1,e*T/.08)*Math.min(1,k*T/.18),s=P(tg.x,tg.y,0).s;
 if(u&&!u.dead&&h>.2){const a=P(u.x,u.y,26),b=P(tg.x,tg.y,30);g.strokeStyle='rgba(10,10,14,.45)';g.lineWidth=1.2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
 for(let i=0;i<3;i++){const b=(f.a||0)+Math.PI+(i-1)*.8+(f.c||0)*.45,c=Math.cos(b),sn=Math.sin(b),B0=P(tg.x+c*30,tg.y+sn*24,0),Tp=P(tg.x-c*22,tg.y-sn*16,(72+i*18)*h),dx=Tp.x-B0.x,dy=Tp.y-B0.y,L=Math.hypot(dx,dy)||1,px=-dy/L*7*s,py=dx/L*7*s;
  g.fillStyle='#0b0b10';g.beginPath();g.moveTo(B0.x+px,B0.y+py);g.lineTo(Tp.x,Tp.y);g.lineTo(B0.x-px,B0.y-py);g.closePath();g.strokeStyle='rgba(175,175,230,.65)';g.lineWidth=2.5;g.stroke();g.fill();g.strokeStyle='rgba(210,210,245,.75)';g.lineWidth=1;g.beginPath();g.moveTo(B0.x+px*.4,B0.y+py*.4);g.lineTo(Tp.x,Tp.y);g.stroke()}};
JFXD.na_wrap=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const T=f.m,c=Math.min(1,e*T/.25),q=P(tg.x,tg.y,0),s=q.s;g.globalAlpha=Math.min(1,k*T/.2);g.strokeStyle='#0a0a0e';g.lineCap='round';
 for(let i=0;i<(f.legs?2:3);i++){const y=q.y-(f.legs?4+i*9:12+i*17)*s,ph=t*4+i*2;g.beginPath();g.ellipse(q.x,y,(26-8*c)*s,(8-2*c)*s,(i-1)*.15,ph,ph+4.6);g.strokeStyle='rgba(175,175,230,.6)';g.lineWidth=(6.5-i*.6)*s;g.stroke();g.strokeStyle='#0a0a0e';g.lineWidth=(4-i*.6)*s;g.stroke()}g.globalAlpha=1};
// mèche du parchemin : étincelle qui crépite de plus en plus vite
JFXD.na_fuse=(f,k,e,t)=>{const q=P(f.x+5,f.y-3,6+e*4),s=q.s;g.globalCompositeOperation='lighter';if(Math.sin(t*(25+60*e))>-.3)circ(q.x,q.y,(4+3*e)*s,'rgba(255,211,106,.85)');circ(q.x,q.y,1.8*s,'#fff');for(let i=0;i<3;i++){const b=t*9+i*2.1;circ(q.x+Math.cos(b)*7*s*e,q.y-Math.abs(Math.sin(b))*9*s,1.2*s,'rgba(255,154,58,.9)')}};
JFXD.na_boom=(f,k,e,t)=>{const q=P(f.x,f.y,12),R=f.r*q.s;g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,154,58,${.85*k})`;g.beginPath();for(let i=0;i<12;i++){const b=i*.5236+f.x,L=(i%2?.42:1)*R*(.35+e*.75);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*.7)}g.closePath();g.fill();
 circ(q.x,q.y,R*.32*k,`rgba(255,240,200,${.9*k})`);g.globalCompositeOperation='source-over';for(let i=0;i<6;i++){const b=i*1.047+f.y,d=R*(.25+e*.6);circ(q.x+Math.cos(b)*d,q.y-e*34*q.s+Math.sin(b)*d*.45,(7+e*11)*q.s,`rgba(58,52,52,${.45*k})`)}
 g.fillStyle=`rgba(240,224,176,${k})`;for(let i=0;i<5;i++){const b=i*1.257+f.x*.1,d=R*e*.9;g.save();g.translate(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6-Math.sin(Math.PI*e)*40*q.s);g.rotate(t*8+i);g.fillRect(-3*q.s,-2*q.s,6*q.s,4*q.s);g.restore()}};
JFXD.na_toss=(f,k,e,t)=>{const p=P(lerp(f.x,f.x2,e),lerp(f.y,f.y2,e),24+Math.sin(Math.PI*e)*46),s=p.s;g.save();g.translate(p.x,p.y);g.rotate(t*14);g.fillStyle='#f0e0b0';g.fillRect(-6*s,-3.5*s,12*s,7*s);g.fillStyle='#c0302a';g.fillRect(-1*s,-3*s,2*s,6*s);g.restore()};
// pièce de shogi (Shikamaru et Asuma) : pentagone en bois et son kanji
function naShogi(x,y,z,ch,al){g.save();g.globalAlpha=al;g.translate(x,y);g.fillStyle='#e8c88a';g.strokeStyle='#5a3a1a';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-z*1.15);g.lineTo(z*.78,-z*.55);g.lineTo(z*.88,z*.9);g.lineTo(-z*.88,z*.9);g.lineTo(-z*.78,-z*.55);g.closePath();g.fill();g.stroke();
 g.fillStyle='#2a1608';g.font=`bold ${Math.round(z*1.25)}px serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(ch,0,z*.2);g.textBaseline='alphabetic';g.restore()}
// réflexion : quatre pièces tournent autour du stratège (elles disparaissent si la réflexion est rompue)
JFXD.na_shogi=(f,k,e,t,u)=>{if(!u||u.dead||u.stun>0)return;const al=Math.min(1,e*f.m/.15)*Math.min(1,k*f.m/.1);for(let i=0;i<4;i++){const b=t*2.4+i*1.571,q=P(u.x+Math.cos(b)*34,u.y+Math.sin(b)*26,46+Math.sin(t*4+i)*4);naShogi(q.x,q.y,7*q.s,'王飛角金'[i],al*(Math.sin(b)>0?1:.6))}};
// plan prêt : le roi flotte au-dessus de la tête
STATD.push((u,p,S,sk)=>{if(!(u.na_pl>0))return;const t=performance.now()/1000,y=p.y-(94*sk+Math.sin(t*3)*2.5)*S,al=Math.min(1,u.na_pl*2);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al*(.45+.2*Math.sin(t*6));circ(p.x,y,13*S/1.3,'rgba(255,211,138,.5)');g.restore();naShogi(p.x,y,9*S/1.3,'王',al)});
// bouclier de l'Ombre protectrice : volutes sombres autour du ninja
STATD.push((u,p,S)=>{if(!(u.na_sh>0)||!(u.shield>0))return;const t=performance.now()/1000;g.save();g.strokeStyle='rgba(12,12,18,.75)';g.lineWidth=2.5*S/1.3;g.lineCap='round';for(let i=0;i<3;i++){const b=t*3+i*2.094,y=p.y-(18+i*17)*S;g.beginPath();g.ellipse(p.x,y,20*S,7*S,0,b,b+2.2);g.stroke()}g.restore()});
