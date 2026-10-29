// ===== Raiton (foudre) =====
// Identité : vitesse, perforation, paralysie. Tirs fulgurants et lignes instantanées, contrôles courts mais variés
// (ralentir, paralyser les mains, clouer au sol, étourdir, projeter). La foudre punit les cibles trempées (×1,35 et arc vers
// un autre ennemi trempé) : l'Orage les trempe lui-même. Raiton bat Doton, Fûton bat Raiton.
// Couleurs : foudre jaune et blanche (Kumo), bleu-blanc pour la famille Chidori et Kirin, noir et or pour la Panthère.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('n3',[
 [1,'D','x.ra_bolt','Raiton : Éclair','Trait de foudre fulgurant : transperce les ennemis sur sa ligne et les ralentit','lightning'],
 [1,'D','x.ra_senbon','Raiton : Chidori Senbon','Éventail de 5 aiguilles qui ralentissent ; touché par 3, l\'ennemi est paralysé : ni mudras ni jutsu 1 s','lightning'],
 [1,'C','x.ra_chain','Raiton : Chaîne d\'éclairs','Rebondit sur 3 ennemis proches ; sur une cible seule, la foudre s\'accumule et la frappe 3 fois de plus','lightning'],
 [1,'C','x.ra_nagashi','Raiton : Chidori Nagashi','Te libère des entraves, blesse et étourdit autour de toi, puis 2 s de riposte contre le corps à corps','lightning'],
 [1,'C','x.ra_clone','Raiton : Kage Bunshin','Bondis en arrière en laissant un clone de foudre : il explose au contact d\'un ennemi ou d\'un tir et étourdit','lightning'],
 [1,'B','x.ra_spear','Raiton : Chidori Eisô','Lance de foudre instantanée qui transperce la ligne, se ramifie au bout et étourdit brièvement','lightning'],
 [1,'B','x.ra_panther','Raiton : Panthère noire','Panthère de foudre qui traque l\'ennemi le plus proche et le cloue au sol 1,2 s','lightning'],
 [1,'A','x.ra_chidori','Chidori','Fonce, la foudre au poing : le premier ennemi touché subit un coup imparable, est projeté et étourdi','chidori'],
 [1,'A','x.ra_storm','Raiton : Orage','Nuage d\'orage : sa pluie trempe les ennemis (foudre +35 %) et 3 éclairs frappent ceux restés dessous','lightning'],
 [2,'C','x.ra_step','Raiton : Pas de l\'éclair','Fonce en éclair à travers les ennemis (blesse, ralentit) en laissant une traînée électrique qui ralentit','lightning'],
 [5,'S','x.ra_kirin','Raiton : Kirin','Un orage couvre la zone ; peu après, Kirin foudroie l\'ennemi le plus au centre : énormes dégâts, étourdit','kirin'],
 [5,'S','x.ra_armor','Raiton : Armure de foudre','Étourdit autour de toi, puis 7 s : très rapide, +35 % de dégâts, ni ralenti ni entravé, esquive un coup toutes les 2 s','lightning'],
]);
// ---- outils de la foudre
// son « brut » : sous l'élément foudre, le moteur change tous les sons en « chidori »
const raS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V};
// coup / zone de foudre lancés depuis un objet (l'élément compte : trempé ×1,35, Raiton bat Doton)
const raHit=(e,o,dmg,op,v)=>{const V=VFX;VFX=v||'lightning';const r=hit(e,o,dmg,op||{});VFX=V;return r};
const raAoe=(o,x,y,r,dmg,op,col,v)=>{const V=VFX;VFX=v||'lightning';aoe(o,x,y,r,dmg,op,col);VFX=V};
const raPop=(x,y,r,c)=>jx({jfx:'ra_pop',x,y,r,c,t:.24,m:.24});
const raUi=u=>units.indexOf(u);
// tracé d'un éclair : zigzag perpendiculaire à sa direction ; les mêmes points servent au halo et au cœur blanc
const RAP=[];
function raPath(x0,y0,x1,y1,j,n){RAP.length=0;RAP.push(x0,y0);const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;for(let i=1;i<n;i++){const k=i/n,o=(rnd()-.5)*j;RAP.push(x0+dx*k+nx*o,y0+dy*k+ny*o)}RAP.push(x1,y1)}
function raStroke(c,w){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(RAP[0],RAP[1]);for(let i=2;i<RAP.length;i+=2)g.lineTo(RAP[i],RAP[i+1]);g.stroke()}
// éclair lumineux (à dessiner en mode « lighter ») : halo large, trait coloré, cœur blanc
function raBolt(x0,y0,x1,y1,j,n,c,w,a=1){if(a<=0)return;raPath(x0,y0,x1,y1,j,n);g.lineCap='round';g.lineJoin='round';raStroke(rgba(c,.28*a),w*2.8);raStroke(rgba(c,.9*a),w);raStroke(rgba('#ffffff',a),Math.max(.8,w*.38))}
// longueur libre d'une ligne de visée : jusqu'au premier obstacle, mur ennemi ou bord de l'arène
function raRay(u,a,len){const c=Math.cos(a),s=Math.sin(a);for(let d=24;d<len;d+=12){const x=u.x+c*d,y=u.y+s*d;if(x<B.x||x>B.x+B.w||y<B.y||y>B.y+B.h)return d;
 for(const o of OBST)if(Math.abs(o.x-x)<o.r&&Math.hypot(o.x-x,o.y-y)<o.r)return d;for(const w of walls)if(w.team!==u.team&&Math.abs(w.x-x)<w.r&&Math.hypot(w.x-x,w.y-y)<w.r)return d}return len}
// paralysie (Chidori Senbon) : mudras coupés et plus de jutsu
function raParalyze(o,t,d){if(t.dead||t.unstop>0)return;t.silence=Math.max(t.silence,d);if(t.cast||t.flame||t.spin){t.cast=null;t.flame=null;t.spin=null;say(t,'INTERROMPU','#fc6')}
 say(t,'PARALYSÉ','#bfe6ff');jx({jfx:'ra_para',ti:raUi(t),x:t.x,y:t.y,t:d,m:d});raPop(t.x,t.y,26,'#bfe6ff');raS('deflect',t)}
// chaîne d'éclairs : saute vers l'ennemi le plus proche pas encore touché ; cible seule → la foudre s'y accumule
function raChain(o,from,n,dmg,hs,j){let nb=null,bd=290;for(const e of enemies(o))if(!hs.includes(e)){const d=Math.hypot(e.x-from.x,e.y-from.y);if(d<bd){bd=d;nb=e}}
 if(!nb){if(!j)raStack(o,from);return}hs.push(nb);const x0=from.x,y0=from.y;
 later(o,.09,()=>{if(nb.dead)return;jx({jfx:'ra_arc',x:x0,y:y0,x2:nb.x,y2:nb.y,t:.3,m:.3});raHit(nb,o,dmg,{slow:.5});raPop(nb.x,nb.y,18);raS('zap',nb);if(n>1)raChain(o,nb,n-1,dmg*.85,hs,j+1)})}
function raStack(o,t){jx({jfx:'ra_charge',ti:raUi(t),x:t.x,y:t.y,t:.95,m:.95});for(let i=1;i<=3;i++)later(o,i*.3,()=>{if(t.dead)return;raHit(t,o,3,{slow:.35});jx({jfx:'ra_zap',ti:raUi(t),x:t.x,y:t.y,t:.22,m:.22});raS('zap',t)})}
// IA : les bots fuient aussi les objets « aux » marqués danger (nuage de Kirin, éclairs de l'Orage)
AFTER.push(()=>{if(typeof dangers!=='function'||dangers.raW)return;const D0=dangers,sel=auxSel(x=>x.danger);dangers=function(u){const L=D0(u);for(const x of sel())if(x.team!==u.team)L.push({x:x.x,y:x.y,r:x.r});return L};dangers.raW=1});

Object.assign(NAT,{
 // ---- éclair : le tir le plus rapide du jeu, perce la ligne
 ra_bolt:SP('Raiton : Éclair','Trait de foudre fulgurant : transperce les ennemis sur sa ligne et les ralentit',4,{line:{len:560,w:14},ai:RG(540,.7)},(u,a)=>{
  raS('zap',u);anim(u,'ra_flick',.32);jx({jfx:'ra_muzzle',x:u.x+Math.cos(a)*24,y:u.y+Math.sin(a)*24,a,r:14,t:.2,m:.2});
  proj(u,a,{spd:1500,r:6,dmg:10,life:.38,col:'#ffe14a',slow:.5,pierce:1,kind:'ra_bolt',onHit:(p,t)=>raPop(t.x,t.y,16)})}),
 // ---- chidori senbon : éventail serré ; à bout portant, 3 aiguilles paralysent les mains
 ra_senbon:SP('Raiton : Chidori Senbon','Éventail de 5 aiguilles qui ralentissent ; touché par 3, l\'ennemi est paralysé : ni mudras ni jutsu 1 s',6,{line:{len:330,w:90},ai:RG(210,.75)},(u,a)=>{
  raS('chidori',u);raS('zap',u);anim(u,'ra_fan',.38);jx({jfx:'ra_fan',ui:raUi(u),x:u.x,y:u.y,a,t:.22,m:.22});const vol={};
  for(let i=0;i<5;i++)proj(u,a+(i-2)*.11,{spd:1150,r:4,dmg:3.5,life:.3,col:'#bfe6ff',slow:.6,noClash:1,kind:'ra_needle',onHit:(p,t)=>{const k=raUi(t);vol[k]=(vol[k]||0)+1;if(vol[k]===3)raParalyze(p.owner,t,1)}})}),
 // ---- chaîne : rebondit entre les ennemis, ou s'accumule dans une cible isolée
 ra_chain:SP('Raiton : Chaîne d\'éclairs','Rebondit sur 3 ennemis proches ; sur une cible seule, la foudre s\'accumule et la frappe 3 fois de plus',7,{line:{len:480,w:18},ai:RG(480,.6)},(u,a)=>{
  raS('zap',u);anim(u,'ra_whip',.4);jx({jfx:'ra_muzzle',x:u.x+Math.cos(a)*24,y:u.y+Math.sin(a)*24,a,r:12,t:.18,m:.18});
  proj(u,a,{spd:1050,r:7,dmg:10,life:.46,col:'#ffe14a',kind:'ra_chain',onHit:(p,t)=>{raPop(t.x,t.y,20);raChain(p.owner,t,3,9,[t],0)}})}),
 // ---- chidori nagashi : le courant jaillit du corps, brise les entraves, puis riposte
 ra_nagashi:SP('Raiton : Chidori Nagashi','Te libère des entraves, blesse et étourdit autour de toi, puis 2 s de riposte contre le corps à corps',10,{tele:{self:1,r:115},ai:SELF(135,.6)},(u)=>{
  const fr=u.root>0||u.slow>0;u.root=0;u.rootV=null;u.slow=0;if(fr)say(u,'LIBÉRÉ','#bfe6ff');
  aoe(u,u.x,u.y,115,12,{stun:.45},'#bfe6ff');u.riposte=Math.max(u.riposte,2);u.riposteS=1;
  jx({jfx:'ra_burst',ui:raUi(u),x:u.x,y:u.y,r:115,c:'#bfe6ff',t:.45,m:.45});jx({jfx:'ra_current',ui:raUi(u),x:u.x,y:u.y,t:2,m:2});
  anim(u,'ra_nagashi',.5);raS('chidori',u);raS('zap',u)}),
 // ---- clone de foudre : leurre piégé, tu bondis en arrière
 ra_clone:SP('Raiton : Kage Bunshin','Bondis en arrière en laissant un clone de foudre : il explose au contact d\'un ennemi ou d\'un tir et étourdit',11,{ai:DEF},(u,a)=>{
  aux.push({type:'ra_clone',x:u.x,y:u.y,r:26,t:2.5,m:2.5,team:u.team,owner:u,ui:raUi(u),vfx:'lightning',k:0});
  jx({jfx:'ra_burst',x:u.x,y:u.y,r:44,c:'#bfe6ff',t:.28,m:.28});dash(u,a+Math.PI,170,.24,{jump:24});anim(u,'ra_hop',.36);raS('poof',u);raS('zap',u)}),
 // ---- chidori eisô : lance instantanée, s'arrête au premier obstacle, fourche au bout
 ra_spear:SP('Raiton : Chidori Eisô','Lance de foudre instantanée qui transperce la ligne, se ramifie au bout et étourdit brièvement',9,{line:{len:540,w:30},ai:RG(520,.55)},(u,a)=>{
  const L=raRay(u,a,540),c=Math.cos(a),s=Math.sin(a),tx=u.x+c*L,ty=u.y+s*L;let n=0;
  for(const e of enemies(u)){const dx=e.x-u.x,dy=e.y-u.y,f=dx*c+dy*s,sd=Math.abs(-dx*s+dy*c);if((f>0&&f<L&&sd<15+e.r)||Math.hypot(e.x-tx,e.y-ty)<62+e.r){if(hit(e,u,19,{stun:.3,unblockable:1}))n++;raPop(e.x,e.y,24,'#bfe6ff')}}
  jx({jfx:'ra_spear',ui:raUi(u),x:u.x,y:u.y,a,len:L,t:.34,m:.34});anim(u,'ra_thrust',.45);raS('chidori',u);raS('zap',u);if(near(u.x,u.y))shake=Math.max(shake,n?.2:.08)}),
 // ---- panthère noire (Darui) : bête de foudre qui traque et plaque au sol
 ra_panther:SP('Raiton : Panthère noire','Panthère de foudre qui traque l\'ennemi le plus proche et le cloue au sol 1,2 s',11,{line:{len:560,w:30},ai:RG(560,.6)},(u,a)=>{
  raS('roar',u);raS('zap',u);anim(u,'ra_beast',.5);jx({jfx:'ra_burst',x:u.x+Math.cos(a)*30,y:u.y+Math.sin(a)*30,r:38,c:'#ffe14a',t:.3,m:.3});
  proj(u,a,{spd:520,r:13,dmg:20,life:1.4,col:'#ffe14a',home:1,root:1.2,kind:'ra_panther',onHit:(p,t)=>{jx({jfx:'ra_pounce',ti:raUi(t),x:t.x,y:t.y,t:1.2,m:1.2});raS('roar',t)}})}),
 // ---- chidori : course éclair, coup imparable au premier ennemi touché
 ra_chidori:SP('Chidori','Fonce, la foudre au poing : le premier ennemi touché subit un coup imparable, est projeté et étourdi',12,{line:{len:340,w:44},ai:{mode:'gap',min:90,max:330,p:.6}},(u,a,td)=>{
  const d=clamp((td||300)+20,120,340),e=fwd(u,a,d);dash(u,a,d,.22,{});aux.push({type:'ra_chid',x:u.x,y:u.y,r:0,t:.6,m:.6,team:u.team,owner:u,a,k:0});
  jx({jfx:'ra_trail',x:u.x,y:u.y,x2:e.x,y2:e.y,c:'#7fd0ff',t:.45,m:.45});anim(u,'ra_chidori',.42);raS('chidori',u);raS('dash',u)}),
 // ---- orage : nuage qui trempe, puis 3 éclairs ciblés (chacun annoncé au sol)
 ra_storm:SP('Raiton : Orage','Nuage d\'orage : sa pluie trempe les ennemis (foudre +35 %) et 3 éclairs frappent ceux restés dessous',12,{tele:{r:150,max:450},ai:RG(450,.6)},(u,a,td)=>{const p=atP(u,a,td,450);
  aux.push({type:'ra_storm',x:p.x,y:p.y,r:150,t:2.6,m:2.6,team:u.team,owner:u,vfx:'lightning',k:.4,n:3,danger:1});jx({jfx:'ra_cloud',x:p.x,y:p.y,r:150,rain:1,t:2.6,m:2.6});
  anim(u,'ra_call',.7);raS('water',u);raS('zap',u)}),
 // ---- pas de l'éclair : traversée foudroyante + sol électrisé
 ra_step:SP('Raiton : Pas de l\'éclair','Fonce en éclair à travers les ennemis (blesse, ralentit) en laissant une traînée électrique qui ralentit',7,{ai:{mode:'gap',min:120,max:280,p:.4}},(u,a)=>{
  const s={x:u.x,y:u.y},e=fwd(u,a,260),L=Math.hypot(e.x-s.x,e.y-s.y);dash(u,a,260,.14,{});aux.push({type:'ra_run',x:u.x,y:u.y,r:0,t:.5,m:.5,team:u.team,owner:u,k:0,hs:[]});
  aux.push({type:'ra_trail',x:s.x,y:s.y,a,len:L,w:34,r:0,t:1.2,m:1.2,team:u.team,owner:u,k:0});jx({jfx:'ra_flash',x:s.x,y:s.y,x2:e.x,y2:e.y,t:.32,m:.32});
  anim(u,'ra_dashp',.22);raS('zap',u);raS('dash',u)}),
 // ---- kirin : l'orage s'amasse, puis la foudre-dragon frappe l'ennemi le plus proche du centre
 ra_kirin:ULT('Raiton : Kirin','Un orage couvre la zone ; peu après, Kirin foudroie l\'ennemi le plus au centre : énormes dégâts, étourdit',{tele:{r:200,max:480},ai:{max:480,p:.8}},(u,a,td)=>{const p=atP(u,a,td,480);
  aux.push({type:'ra_kirin',x:p.x,y:p.y,r:200,t:.8,m:.8,team:u.team,owner:u,vfx:'kirin',k:0,danger:1});jx({jfx:'ra_cloud',x:p.x,y:p.y,r:200,kir:1,c:'#bfe6ff',t:.85,m:.85});
  anim(u,'ra_kirin',.8);raS('zap',u);raS('wind',u)}),
 // ---- armure de foudre (Raikage) : l'armure jaillit (étourdit autour), puis vitesse, force, réflexes, rien ne la retient
 ra_armor:ULT('Raiton : Armure de foudre','Étourdit autour de toi, puis 7 s : très rapide, +35 % de dégâts, ni ralenti ni entravé, esquive un coup toutes les 2 s',{ai:SELF(320,.8)},(u)=>{const D=7;
  u.haste=Math.max(u.haste,D);u.rage=Math.max(u.rage,D);u.slowImm=Math.max(u.slowImm,D);u.slow=0;u.root=0;u.dodge=Math.max(u.dodge,D);aoe(u,u.x,u.y,110,12,{stun:.5},'#bfe6ff');
  for(const x of aux)if(x.type==='ra_armor'&&x.owner===u)x.t=0;aux.push({type:'ra_armor',x:u.x,y:u.y,r:0,t:D,m:D,team:u.team,owner:u,k:2});
  jx({jfx:'ra_armor',ui:raUi(u),x:u.x,y:u.y,t:D,m:D});jx({jfx:'ra_armorburst',ui:raUi(u),x:u.x,y:u.y,t:.6,m:.6});anim(u,'ra_flex',.6);raS('chidori',u);raS('heavy',u)}),
});
Object.assign(NATHERO,{ra:'ig88'});

// ---- logique des objets (hôte)
// clone de foudre : explose au contact d'un ennemi, d'un tir ennemi, ou au bout de sa durée
AUXF.ra_clone=x=>{if(x.done)return;const o=x.owner;let go=x.t<=0;
 if(!go)for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r+12){go=true;break}
 if(!go)for(const p of projs)if(p.owner.team!==x.team&&!p.grenade&&!p.dead&&p.life>0&&Math.hypot(p.x-x.x,p.y-x.y)<x.r+p.r+4){p.life=0;go=true;break}
 if(!go)return;x.done=1;x.t=0;raAoe(o,x.x,x.y,95,12,{stun:.6,unblockable:1},'#bfe6ff');jx({jfx:'ra_burst',x:x.x,y:x.y,r:95,c:'#bfe6ff',t:.5,m:.5});
 if(near(x.x,x.y)){raS('boom',o);raS('zap',o);shake=Math.max(shake,.18)}};
// chidori : la course s'arrête sur le premier ennemi touché
AUXF.ra_chid=x=>{const u=x.owner;if(x.done||u.dead){x.t=0;return}
 for(const e of enemies(u))if(Math.hypot(e.x-u.x,e.y-u.y)<u.r+e.r+14){x.done=1;x.t=0;u.dash=null;u.z=0;const a=x.a;u.x=e.x-Math.cos(a)*(u.r+e.r+2);u.y=e.y-Math.sin(a)*(u.r+e.r+2);collide(u);
  raHit(e,u,30,{melee:1,unblockable:1,air:.5,kb:160},'chidori');jx({jfx:'ra_impact',x:e.x,y:e.y,a,t:.5,m:.5});
  if(near(e.x,e.y)){raS('boom',u);raS('chidori',u);shake=Math.max(shake,.3)}if(u===player||e===player)hs=Math.max(hs,.09);return}
 if(!u.dash)x.t=0};
// orage : la pluie trempe ; toutes les 0,7 s un éclair vise l'ennemi le plus proche du centre (annoncé au sol 0,45 s)
AUXF.ra_storm=x=>{const o=x.owner;for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)e.wet=Math.max(e.wet||0,1.2);
 if(x.k>0||x.n<=0)return;x.n--;x.k=.7;let tg=null,bd=1e9;for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<x.r+e.r&&d<bd){bd=d;tg=e}}
 const b=rnd()*7,rr=x.r*(.2+rnd()*.5);aux.push({type:'ra_mark',x:tg?tg.x:x.x+Math.cos(b)*rr,y:tg?tg.y:x.y+Math.sin(b)*rr*.85,r:58,t:.45,m:.45,team:x.team,owner:o,vfx:'lightning',k:0,danger:1})};
AUXF.ra_mark=x=>{if(x.t>0||x.done)return;x.done=1;const o=x.owner;for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)raHit(e,o,11,{stun:.3,unblockable:1,fx:x.x,fy:x.y});
 jx({jfx:'ra_strike',x:x.x,y:x.y,r:x.r,t:.4,m:.4});if(near(x.x,x.y)){raS('zap',o);raS('boom',o);shake=Math.max(shake,.14)}};
// kirin : la cible est choisie au dernier moment (0,12 s avant l'impact, le temps que le dragon descende)
AUXF.ra_kirin=x=>{const o=x.owner;
 if(!x.lk&&x.t<=.12){x.lk=1;let tg=null,bd=1e9;for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<x.r+e.r&&d<bd){bd=d;tg=e}}x.tx=tg?tg.x:x.x;x.ty=tg?tg.y:x.y;
  jx({jfx:'ra_kirinfx',x:x.tx,y:x.ty,r:110,t:1.1,m:1.1});raS('roar',o)}
 if(x.t>0||x.done)return;x.done=1;raAoe(o,x.tx,x.ty,110,62,{stun:1.1,unblockable:1},'#bfe6ff','kirin');
 jx({jfx:'flashsky',x:x.tx,y:x.ty,t:.4,m:.4});aux.push({type:'ra_scorch',x:x.tx,y:x.ty,r:95,t:1.8,m:1.8,team:x.team,owner:o,k:0});
 if(near(x.tx,x.ty)){raS('boom',o);raS('chidori',o);shake=Math.max(shake,.45)}if(o===player||(player&&Math.hypot(player.x-x.tx,player.y-x.ty)<130))hs=Math.max(hs,.08)};
// pas de l'éclair : la course foudroie chaque ennemi traversé (une fois)
AUXF.ra_run=x=>{const u=x.owner;if(u.dead){x.t=0;return}for(const e of enemies(u))if(!x.hs.includes(e)&&Math.hypot(e.x-u.x,e.y-u.y)<u.r+e.r+14){x.hs.push(e);raHit(e,u,10,{melee:1,slow:1});raPop(e.x,e.y,22)}if(!u.dash)x.t=0};
// pas de l'éclair : la traînée ralentit les ennemis qui la touchent
AUXF.ra_trail=x=>{if(x.k>0)return;x.k=.2;const c=Math.cos(x.a),s=Math.sin(x.a);for(const e of enemies(x.owner)){const dx=e.x-x.x,dy=e.y-x.y,f=dx*c+dy*s,sd=Math.abs(-dx*s+dy*c);
 if(f>-e.r&&f<x.len+e.r&&sd<x.w/2+e.r&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.45)}};
// armure : une esquive prête ; une fois utilisée, elle revient 2 s plus tard
AUXF.ra_armor=x=>{const u=x.owner;if(u.dead){x.t=0;return}x.x=u.x;x.y=u.y;if(u.dodge>0)x.k=2;else if(x.k<=0){u.dodge=Math.max(.1,x.t);x.k=2;if(near(u.x,u.y)){say(u,'RÉFLEXES','#bfe6ff');raPop(u.x,u.y,24,'#bfe6ff')}}};
AUXF.ra_scorch=()=>{};

// ---- animations 3D
Object.assign(ANIM,{
 // deux doigts pointés, coup sec (Éclair)
 ra_flick:(P,e)=>{const k=e<.25?ezo(e/.25):1-.3*ezo((e-.25)/.75);pz(P,'armR',-1.62*k,0,.12*(1-k));pz(P,'foreR',-.15*(1-k));pz(P,'chest',.1*k,.3*k);pz(P,'armL',-.5,0,.35);pz(P,'foreL',-1.2);P.root.z=3*k},
 // revers horizontal du bras qui sème les aiguilles (Senbon)
 ra_fan:(P,e)=>{const k=ezo(Math.min(1,e/.45));pz(P,'armR',-1.45,0,.75-1.6*k);pz(P,'foreR',-.2);pz(P,'chest',.12,-.35+.7*k);pz(P,'armL',-.4,0,.4);pz(P,'foreL',-1)},
 // bras armé au-dessus de l'épaule puis fouetté vers l'avant (Chaîne)
 ra_whip:(P,e)=>{const up=e<.3,k=up?e/.3:ezo((e-.3)/.7);pz(P,'armR',up?-2.8*k:-2.8+1.3*k,0,-.2);pz(P,'foreR',up?-.6:-.1);pz(P,'chest',up?-.15:.25*k,up?.3:-.2*k);pz(P,'armL',-.6,0,.5)},
 // accroupi, bras jetés vers le bas et l'extérieur : le courant jaillit (Nagashi)
 ra_nagashi:(P,e)=>{const k=ezo(Math.min(1,e/.2));P.root.y=-5*k;pz(P,'thighL',-.7*k,0,.25*k);pz(P,'thighR',-.7*k,0,-.25*k);pz(P,'shinL',1.1*k);pz(P,'shinR',1.1*k);
  pz(P,'armL',-.5*k,0,1.25*k);pz(P,'armR',-.5*k,0,-1.25*k);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'chest',-.2*k);pz(P,'head',-.25*k)},
 // signe des mains et saut en arrière, jambes repliées (Kage Bunshin)
 ra_hop:(P,e)=>{pz(P,'armR',-1.2,0,.5);pz(P,'foreR',-1.9);pz(P,'armL',-1.2,0,-.5);pz(P,'foreL',-1.9);pz(P,'chest',-.3);pz(P,'head',.1);pz(P,'thighL',-.8);pz(P,'shinL',1.2);pz(P,'thighR',-.3);pz(P,'shinR',.9)},
 // fente, bras tendu, l'autre main tient le poignet (Eisô)
 ra_thrust:(P,e)=>{const k=ezo(Math.min(1,e/.25));P.root.z=12*k;P.root.y=-4*k;pz(P,'thighR',-1*k);pz(P,'shinR',.9*k);pz(P,'thighL',.6*k);pz(P,'shinL',.3*k);
  pz(P,'armR',-1.6*k,0,.05);pz(P,'foreR',0);pz(P,'armL',-1.3*k,0,-.45*k);pz(P,'foreL',-.9*k);pz(P,'chest',.35*k,-.25*k)},
 // accroupi, le bras lâche la bête vers l'avant (Panthère)
 ra_beast:(P,e)=>{const k=ezo(Math.min(1,e/.35));P.root.y=-6*(1-k*.5);pz(P,'thighL',-.9);pz(P,'shinL',1.4);pz(P,'thighR',.2);pz(P,'shinR',1.1);pz(P,'chest',.5-.3*k);pz(P,'armR',-.3-1.3*k,0,-.2);pz(P,'foreR',-.2);pz(P,'armL',.4,0,.5)},
 // course penchée, le poing chargé tendu devant (Chidori)
 ra_chidori:(P,e)=>{const k=ezo(Math.min(1,e/.2));P.root.y=-3*k;pz(P,'chest',.55*k,-.2*k);pz(P,'spine',.15*k);pz(P,'head',-.4*k);pz(P,'armR',-1.45*k,0,.1);pz(P,'foreR',-.1);pz(P,'armL',.9*k,0,.35);pz(P,'foreL',-.4);
  pz(P,'thighR',-1.1*k);pz(P,'shinR',.7*k);pz(P,'thighL',.7*k);pz(P,'shinL',.5*k)},
 // les deux bras levés au ciel : l'orage s'amasse (Orage)
 ra_call:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.3));pz(P,'armL',-3*k,0,.35);pz(P,'armR',-3*k,0,-.35);pz(P,'foreL',-.25);pz(P,'foreR',-.25);pz(P,'head',-.45*k);pz(P,'chest',-.18*k);P.root.y=Math.sin(t*30)*.3*k},
 // bras levé vers le ciel puis abattu vers la cible (Kirin)
 ra_kirin:(P,e)=>{const up=e<.8,k=up?ezo(Math.min(1,e/.2)):ezo((e-.8)/.2);pz(P,'armR',up?-3.05*k:-3.05+1.55*k,0,-.08);pz(P,'foreR',-.05);pz(P,'head',up?-.4*k:-.4+.55*k);pz(P,'chest',up?-.15*k:.3*k);pz(P,'armL',-.25,0,.35);P.root.z=up?0:4*k},
 // posture du Raikage : coudes écartés, poings serrés, buste bombé (Armure)
 ra_flex:(P,e)=>{const k=ezo(Math.min(1,e/.3));P.root.y=-3*k;pz(P,'thighL',-.3*k,0,.35*k);pz(P,'thighR',-.3*k,0,-.35*k);pz(P,'shinL',.6*k);pz(P,'shinR',.6*k);
  pz(P,'armL',-.6*k,0,.9*k);pz(P,'armR',-.6*k,0,-.9*k);pz(P,'foreL',-1.7*k);pz(P,'foreR',-1.7*k);pz(P,'chest',-.25*k);pz(P,'head',-.35*k)},
 // course de ninja, buste couché, bras en arrière (Pas de l'éclair)
 ra_dashp:(P,e)=>{pz(P,'chest',.65);pz(P,'spine',.2);pz(P,'head',-.5);pz(P,'armL',1.1,0,.3);pz(P,'armR',1.1,0,-.3);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'thighL',-.9);pz(P,'shinL',.9);pz(P,'thighR',.5);pz(P,'shinR',.4)},
});

// ---- dessins : projectiles
// éclair : long trait dentelé, tête blanche
PROJD.ra_bolt=(p,R,ra)=>{g.rotate(ra);g.globalCompositeOperation='lighter';raBolt(-72,0,2,0,11,8,'#ffe14a',2.8);circ(2,0,R*1.7,rgba('#ffe14a',.35));circ(2,0,R*.75,'#ffffff')};
// aiguille de chidori : fine, bleu-blanc
PROJD.ra_needle=(p,R,ra)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#7fd0ff',.45);g.lineWidth=4.5;g.beginPath();g.moveTo(-20,0);g.lineTo(6,0);g.stroke();
 g.strokeStyle='#ffffff';g.lineWidth=1.5;g.beginPath();g.moveTo(-15,0);g.lineTo(9,0);g.stroke();raPath(-24,0,4,0,5,4);raStroke(rgba('#bfe6ff',.8),1)};
// boule de foudre crépitante (Chaîne)
PROJD.ra_chain=(p,R,ra,t)=>{g.globalCompositeOperation='lighter';g.lineCap='round';circ(0,0,R*2.6,rgba('#ffe14a',.16));circ(0,0,R*1.35,rgba('#ffe14a',.7));circ(0,0,R*.7,'#ffffff');
 g.strokeStyle=rgba('#fff6a0',.85);g.lineWidth=1.3;for(let i=0;i<3;i++){const a0=t/90+i*2.1;g.beginPath();g.ellipse(0,0,R*2,R*.8,i*1.05+t/400,a0,a0+2.2);g.stroke()}
 for(let i=0;i<4;i++){const b=rnd()*7,L=R*(1.9+rnd()*1.4);raPath(Math.cos(b)*R*.7,Math.sin(b)*R*.7,Math.cos(b+.3)*L,Math.sin(b+.3)*L,R*.8,3);raStroke(i%2?'#fff6a0':'#ffffff',1.3)}};
// panthère noire : corps d'encre bordé de foudre, galop
PROJD.ra_panther=(p,R,ra,t)=>{g.rotate(ra);const S=R/11;g.scale(S,S);const run=t/55,sw=Math.sin(run);
 g.globalCompositeOperation='lighter';circ(0,0,25,rgba('#ffe14a',.12));for(let i=0;i<3;i++){raPath(-24,(rnd()-.5)*12,-48,(rnd()-.5)*18,10,4);raStroke(i?rgba('#ffe14a',.75):'#ffffff',1.2)}
 g.globalCompositeOperation='source-over';g.fillStyle='#111118';g.strokeStyle='#111118';g.lineCap='round';g.lineWidth=3.4;
 for(const [x,ph] of[[-11,0],[-7,2.2],[8,1],[12,3.3]]){const s=Math.sin(run+ph);g.beginPath();g.moveTo(x,2);g.lineTo(x+s*6,8);g.lineTo(x+s*8.5,11);g.stroke()}
 g.beginPath();g.ellipse(0,0,17,7.2,0,0,7);g.fill();g.beginPath();g.ellipse(9,-1,7,7.5,0,0,7);g.fill();g.beginPath();g.ellipse(17,-4,6.5,5.2,-.15,0,7);g.fill();
 g.beginPath();g.moveTo(13,-8);g.lineTo(14.5,-13.5);g.lineTo(17,-8.5);g.fill();g.beginPath();g.moveTo(17,-8.5);g.lineTo(19.5,-13);g.lineTo(20.5,-7.5);g.fill();
 g.beginPath();g.moveTo(21,-3.5);g.lineTo(27,-2+sw);g.lineTo(21,.5);g.fill();g.lineWidth=2.6;g.beginPath();g.moveTo(-16,-2);g.quadraticCurveTo(-27,-11,-32,-4+sw*4);g.stroke();
 g.globalCompositeOperation='lighter';circ(19,-5,1.7,'#fff36a');circ(19,-5,4,rgba('#ffe14a',.35));g.strokeStyle=rgba('#fff6a0',.95);g.lineWidth=1.1;g.beginPath();g.moveTo(-15,-5.5);g.lineTo(-7,-8+rnd()*2);g.lineTo(0,-6.5);g.lineTo(6,-8.5+rnd()*2);g.lineTo(14,-9.5);g.lineTo(18,-12);g.stroke();
 g.strokeStyle=rgba('#ffe14a',.6);g.beginPath();g.moveTo(-14,4);g.lineTo(-4,6+rnd()*2);g.lineTo(6,5);g.stroke()};
// anciens noms gardés (d'autres kits peuvent s'en servir)
PROJD.bolt=PROJD.ra_bolt;PROJD.panther=PROJD.ra_panther;

// ---- dessins : effets
// éclat au bout des doigts (lancement)
JFXD.ra_muzzle=(f,k,e)=>{const q=P(f.x,f.y,30),R=(f.r||14)*q.s*(.6+e*.9);g.globalCompositeOperation='lighter';circ(q.x,q.y,R*1.3,rgba(f.c||'#ffe14a',.3*k));g.fillStyle=rgba('#ffffff',.95*k);g.beginPath();
 for(let i=0;i<8;i++){const b=f.a+i*Math.PI/4,L=i%2?R*.28:R*(i%4?.9:1.7);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*K)}g.closePath();g.fill()};
// impact : étoile d'arcs
JFXD.ra_pop=(f,k,e)=>{const q=P(f.x,f.y,32),s=q.s,R=f.r*s*(.55+e*.8),c=f.c||'#ffe14a';g.globalCompositeOperation='lighter';g.lineCap='round';circ(q.x,q.y,R*.9*k,rgba(c,.3));
 for(let i=0;i<5;i++){const b=i*1.257+f.r;raPath(q.x,q.y,q.x+Math.cos(b)*R,q.y+Math.sin(b)*R*.8,R*.35,3);raStroke(rgba(c,.9*k),1.8*s)}circ(q.x,q.y,R*.3*k,'#ffffff')};
// éventail lumineux des senbon
JFXD.ra_fan=(f,k,e,t,u)=>{const x=u&&!u.dead?u.x:f.x,y=u&&!u.dead?u.y:f.y,q=P(x+Math.cos(f.a)*22,y+Math.sin(f.a)*22,30),R=(26+80*e)*q.s;g.globalCompositeOperation='lighter';g.lineCap='round';
 g.fillStyle=rgba('#bfe6ff',.2*k);g.beginPath();g.moveTo(q.x,q.y);g.ellipse(q.x,q.y,R,R*K,0,f.a-.25,f.a+.25);g.closePath();g.fill();
 for(let i=-2;i<=2;i++){const b=f.a+i*.11;raPath(q.x,q.y,q.x+Math.cos(b)*R,q.y+Math.sin(b)*R*K,5*q.s,3);raStroke(rgba(i?'#bfe6ff':'#ffffff',.85*k),1.2*q.s)}circ(q.x,q.y,7*q.s*k,'#ffffff')};
// arc entre deux ennemis (Chaîne)
JFXD.ra_arc=(f,k)=>{const a=P(f.x,f.y,34),b=P(f.x2,f.y2,34);g.globalCompositeOperation='lighter';raBolt(a.x,a.y,b.x,b.y,24*a.s,8,f.c||'#ffe14a',3*a.s,k);if(k>.5)raBolt(a.x,a.y,b.x,b.y,34*a.s,6,'#ffffff',1,k*.6)};
// foudre accumulée dans une cible isolée (Chaîne)
JFXD.ra_charge=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,tg.z||0),s=q.s*1.3,cx=q.x,cy=q.y-36*s,a=Math.min(1,e*8,k*5),pu=1+.12*Math.sin(t*30);g.globalCompositeOperation='lighter';g.lineCap='round';
 g.fillStyle=rgba('#ffe14a',.1*a);g.beginPath();g.ellipse(cx,cy,24*s*pu,42*s*pu,0,0,7);g.fill();g.strokeStyle=rgba('#ffe14a',.75*a);g.lineWidth=1.8*s;g.beginPath();g.ellipse(cx,cy,24*s*pu,42*s*pu,0,t*7,t*7+4.4);g.stroke();
 for(let i=0;i<4;i++){const b=rnd()*7,b2=b+1.2+rnd()*1.5;raPath(cx+Math.cos(b)*24*s,cy+Math.sin(b)*42*s,cx+Math.cos(b2)*24*s,cy+Math.sin(b2)*42*s,14*s,5);raStroke(rgba(i%2?'#ffffff':'#ffe14a',.9*a),1.5*s)}};
JFXD.ra_zap=(f,k,e,t,u,tg)=>{const x=tg&&!tg.dead?tg.x:f.x,y=tg&&!tg.dead?tg.y:f.y,a=P(x+14,y,150),b=P(x,y,38);g.globalCompositeOperation='lighter';raBolt(a.x,a.y,b.x,b.y,22*b.s,7,'#ffe14a',(1.5+2.5*k)*b.s,k);circ(b.x,b.y,(10+14*e)*b.s,rgba('#ffffff',.5*k))};
// décharge en anneau (Nagashi, clone, sortie de la panthère)
JFXD.ra_burst=(f,k,e,t,u)=>{const cx=u&&!u.dead?u.x:f.x,cy=u&&!u.dead?u.y:f.y,q=P(cx,cy,0),c=f.c||'#bfe6ff',R=f.r*(.35+e*.75);g.globalCompositeOperation='lighter';g.lineCap='round';
 g.fillStyle=rgba(c,.16*k);gEll(cx,cy,R);g.fill();g.strokeStyle=rgba(c,.85*k);g.lineWidth=3*q.s;gEll(cx,cy,R);g.stroke();
 const h=P(cx,cy,30);for(let i=0;i<8;i++){const b=i*.785+e*1.5,o=P(cx+Math.cos(b)*R,cy+Math.sin(b)*R,4);raPath(h.x,h.y,o.x,o.y,14*q.s,5);raStroke(rgba(i%2?'#ffffff':c,.9*k),(i%2?1.2:2)*q.s)}};
// courant qui court sur le corps pendant la riposte (Nagashi)
JFXD.ra_current=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,u.z||0),s=q.s*1.3*(u.ch.look.scale||1),cx=q.x,cy=q.y-36*s,a=Math.min(1,k*3);g.globalCompositeOperation='lighter';g.lineCap='round';
 g.strokeStyle=rgba('#bfe6ff',.35*a);g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,24*s,40*s,0,0,7);g.stroke();
 for(let i=0;i<3;i++){const b=rnd()*7,b2=b+(rnd()-.5)*2;raPath(cx+Math.cos(b)*22*s,cy+Math.sin(b)*38*s,cx+Math.cos(b2)*27*s,cy+Math.sin(b2)*44*s,10*s,4);raStroke(rgba(i?'#bfe6ff':'#ffffff',.9*a),1.4)}};
// lance de foudre (Eisô) : trait droit et dense, trois branches au bout
JFXD.ra_spear=(f,k,e,t,u)=>{const ox=u&&!u.dead?u.x:f.x,oy=u&&!u.dead?u.y:f.y,c=Math.cos(f.a),s=Math.sin(f.a),L=f.len*Math.min(1,e*6),a=P(ox+c*18,oy+s*18,32),b=P(ox+c*L,oy+s*L,32);
 g.globalCompositeOperation='lighter';raBolt(a.x,a.y,b.x,b.y,7*a.s,Math.max(4,L/40|0),'#7fd0ff',4*a.s,k);raBolt(a.x,a.y,b.x,b.y,18*a.s,Math.max(4,L/30|0),'#bfe6ff',1.3*a.s,k*.7);
 if(e>.15)for(const d of[-.55,0,.55]){const bb=f.a+d,tp=P(ox+c*L+Math.cos(bb)*62,oy+s*L+Math.sin(bb)*62,32);raBolt(b.x,b.y,tp.x,tp.y,9*a.s,4,'#bfe6ff',2*a.s,k)}
 circ(a.x,a.y,11*a.s*k,rgba('#ffffff',.8));circ(b.x,b.y,16*a.s*k,rgba('#bfe6ff',.35))};
// panthère qui plaque : griffures puis liens de foudre aux pieds
JFXD.ra_pounce=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s;g.globalCompositeOperation='lighter';g.lineCap='round';
 if(e<.35){const b=P(tg.x,tg.y,42),kk=1-e/.35;g.strokeStyle=rgba('#fff6a0',.95*kk);g.lineWidth=2.6*s;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(b.x-16*s+i*7*s,b.y-20*s);g.quadraticCurveTo(b.x+i*7*s,b.y,b.x+14*s+i*7*s,b.y+18*s);g.stroke()}}
 if(!(tg.root>0))return;const a=Math.min(1,k*5);
 for(let i=0;i<3;i++){const sp=t*6*(i%2?-1:1)+i*2;g.strokeStyle=rgba(i===1?'#ffffff':'#ffe14a',.75*a);g.lineWidth=1.6;g.beginPath();g.ellipse(q.x,q.y,(24-i*4)*s,(9-i*1.5)*s,0,sp,sp+3.8);g.stroke()}
 for(let i=0;i<2;i++){const b=rnd()*7,o=P(tg.x+Math.cos(b)*24,tg.y+Math.sin(b)*18,0);raPath(o.x,o.y,q.x+(rnd()-.5)*12*s,q.y-(18+rnd()*34)*s,9*s,4);raStroke(rgba('#ffe14a',.85*a),1.3*s)}};
// chidori : la foudre traverse la cible
JFXD.ra_impact=(f,k,e)=>{const q=P(f.x,f.y,34),s=q.s,c=Math.cos(f.a),sn=Math.sin(f.a);g.globalCompositeOperation='lighter';g.lineCap='round';
 circ(q.x,q.y,(18+44*e)*s*k,rgba('#bfe6ff',.32));circ(q.x,q.y,13*s*k,'#ffffff');if(e<.25){g.fillStyle=rgba('#ffffff',.55*(1-e*4));g.beginPath();g.ellipse(q.x,q.y,70*s,40*s,0,0,7);g.fill()}
 const b=P(f.x+c*130*(.35+e),f.y+sn*130*(.35+e),34);raBolt(q.x,q.y,b.x,b.y,12*s,6,'#7fd0ff',3.4*s,k);
 for(let i=0;i<6;i++){const a=f.a+Math.PI+(i-2.5)*.5+(rnd()-.5)*.3,L=(30+55*e)*s;raPath(q.x,q.y,q.x+Math.cos(a)*L,q.y+Math.sin(a)*L*.8,10*s,4);raStroke(rgba(i%2?'#ffffff':'#bfe6ff',.9*k),1.6*s)}
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=3*s;gEll(f.x,f.y,30+75*e);g.stroke()};
// sillage de foudre au ras du sol (Chidori)
JFXD.ra_trail=(f,k)=>{const a=P(f.x,f.y,8),b=P(f.x2,f.y2,8);g.globalCompositeOperation='lighter';raBolt(a.x,a.y,b.x,b.y,16*a.s,10,f.c||'#7fd0ff',2*a.s,k*.9);raBolt(a.x,a.y,b.x,b.y,26*a.s,8,f.c||'#7fd0ff',1*a.s,k*.6)};
// pas de l'éclair : trait aveuglant entre le départ et l'arrivée
JFXD.ra_flash=(f,k,e)=>{const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.globalCompositeOperation='lighter';raBolt(a.x,a.y,b.x,b.y,12*a.s,9,'#ffe14a',(1+5*k)*a.s,k);for(const p of[a,b])circ(p.x,p.y,(8+26*e)*p.s,rgba('#ffe14a',.35*k))};
// éclair tombé du nuage (Orage, explosions de foudre)
JFXD.ra_strike=(f,k,e)=>{const bot=P(f.x,f.y,0),top=P(f.x+(f.ox||-30),f.y,260),s=bot.s,a=Math.min(1,k*1.7),c=f.c||'#ffe14a';g.globalCompositeOperation='lighter';
 raBolt(top.x,top.y,bot.x,bot.y,42*s,11,c,(1.5+4*k)*s,a);const b1x=RAP[6],b1y=RAP[7],b2x=RAP[12],b2y=RAP[13];
 raBolt(b1x,b1y,b1x-(26+rnd()*30)*s,b1y+(34+rnd()*30)*s,14*s,4,c,1.1*s,a*.8);raBolt(b2x,b2y,b2x+(26+rnd()*30)*s,b2y+(30+rnd()*30)*s,14*s,4,c,1.1*s,a*.8);
 g.fillStyle=rgba('#fff6c0',.45*k);g.beginPath();g.ellipse(bot.x,bot.y,(26+40*e)*s,(26+40*e)*s*K,0,0,7);g.fill();g.strokeStyle=rgba(c,.85*k);g.lineWidth=2.5;gEll(f.x,f.y,f.r*(.5+e*.8));g.stroke()};
// nuage d'orage (+ pluie) au-dessus d'une zone : dessiné devant les ninjas
JFXD.ra_cloud=(f,k,e,t)=>{const a=Math.min(1,e*f.m*4,k*f.m*3),Z=f.kir?185:170,c=f.c||'#ffe14a';
 if(f.rain){g.strokeStyle=rgba('#bfe6ff',.5*a);g.lineWidth=1.2;g.beginPath();for(let i=0;i<22;i++){const b=i*2.4,d=f.r*(.1+((i*41)%90)/100),ph=(t*2.2+i*.13)%1,x=f.x+Math.cos(b)*d,y=f.y+Math.sin(b)*d*.85,z=Z*(1-ph),p0=P(x,y,z),p1=P(x-5,y,z+24);g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y)}g.stroke()}
 for(let i=0;i<8;i++){const b=t*.5*(i%2?1:-1)+i*.8,rr=f.r*(.15+.6*((i*37)%10)/10),q=P(f.x+Math.cos(b)*rr,f.y+Math.sin(b)*rr*.75,Z+((i*13)%5)*7);
  g.fillStyle=rgba(f.kir?(i%3?'#1e2236':'#323a5a'):(i%3?'#2c2f44':'#3e4260'),(f.kir?.6+.3*e:.8)*a);g.beginPath();g.ellipse(q.x,q.y,(40+((i*29)%26))*q.s*(f.r/150),(17+((i*17)%9))*q.s*(f.r/150),0,0,7);g.fill()}
 if(rnd()<(f.kir?.3+.6*e:.35)){const p0=P(f.x+(rnd()-.5)*f.r*1.2,f.y+(rnd()-.5)*f.r*.8,Z),p1=P(f.x+(rnd()-.5)*f.r*1.2,f.y+(rnd()-.5)*f.r*.8,Z+6);g.globalCompositeOperation='lighter';
  raBolt(p0.x,p0.y,p1.x,p1.y,14*p0.s,5,c,1.5*p0.s,a*.85);circ((p0.x+p1.x)/2,(p0.y+p1.y)/2,34*p0.s,rgba('#bfe6ff',.12*a))}};
// Kirin : le dragon de foudre plonge, puis éclat et ondes au sol
JFXD.ra_kirinfx=(f,k,e,t)=>{const g0=P(f.x,f.y,0),s=g0.s,H=600,dsc=Math.min(1,e/.11),hd=P(f.x,f.y,H*(1-dsc)),top=P(f.x-70,f.y,H+60),fade=e<.11?1:Math.max(0,1-(e-.11)/.6);g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 if(fade>0)for(let j=0;j<3;j++){g.strokeStyle=j===0?rgba('#7fd0ff',.4*fade):j===1?rgba('#bfe6ff',.9*fade):rgba('#ffffff',fade);g.lineWidth=(j===0?30:j===1?12:4.5)*s;g.beginPath();
  for(let i=0;i<=18;i++){const v=i/18,x=top.x+(hd.x-top.x)*v+Math.sin(v*10+t*14)*44*s*(1-v*.75)+(j?(rnd()-.5)*6*s:0),y=top.y+(hd.y-top.y)*v;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 if(e<.34){const ha=e<.11?1:Math.max(0,1-(e-.11)/.23);g.save();g.translate(hd.x,hd.y-(e<.11?0:(e-.11)*120*s));g.scale(s*(1+(e<.11?0:(e-.11)*1.5)),s*(1+(e<.11?0:(e-.11)*1.5)));g.fillStyle=rgba('#e8f6ff',.95*ha);g.beginPath();g.moveTo(0,42);for(const [x,y] of[[-8,22],[-14,12],[-30,8],[-18,0],[-14,-12],[-32,-40],[-8,-20],[0,-28]])g.lineTo(x,y);for(const [x,y] of[[8,-20],[32,-40],[14,-12],[18,0],[30,8],[14,12],[8,22]])g.lineTo(x,y);g.closePath();g.fill();g.strokeStyle=rgba('#7fd0ff',.9*ha);g.lineWidth=1.5;g.beginPath();g.moveTo(-6,26);g.lineTo(0,20);g.lineTo(6,26);g.stroke();
  circ(-8,2,3.4,rgba('#ffe14a',ha));circ(8,2,3.4,rgba('#ffe14a',ha));g.strokeStyle=rgba('#bfe6ff',.8*ha);g.lineWidth=2;g.beginPath();g.moveTo(-14,10);g.quadraticCurveTo(-34,14,-44,30);g.moveTo(14,10);g.quadraticCurveTo(34,14,44,30);g.stroke();g.restore()}
 if(e>.09){const ee=Math.min(1,(e-.09)/.9),R=f.r;g.fillStyle=rgba('#ffffff',.55*(1-ee));g.beginPath();g.ellipse(g0.x,g0.y,R*s*(.6+ee*.8),R*s*K*(.6+ee*.8),0,0,7);g.fill();
  g.strokeStyle=rgba('#bfe6ff',.9*(1-ee));g.lineWidth=7*s*(1-ee)+1;gEll(f.x,f.y,R*(.5+ee*1.6));g.stroke();g.strokeStyle=rgba('#ffe14a',.7*(1-ee));g.lineWidth=2;gEll(f.x,f.y,R*(.3+ee*1.2));g.stroke();
  for(let i=0;i<7;i++){const b=i*.9+f.x,L=R*(.5+ee*1.1),o=P(f.x+Math.cos(b)*L,f.y+Math.sin(b)*L,0);raPath(g0.x,g0.y,o.x,o.y,18*s,5);raStroke(rgba(i%2?'#ffffff':'#ffe14a',.85*(1-ee)),2*s)}}};
// mains paralysées (Senbon) : crépitements aux poignets tant que dure la paralysie
JFXD.ra_para=(f,k,e,t,u,tg)=>{if(!tg||tg.dead||!(tg.silence>0))return;const q=P(tg.x,tg.y,tg.z||0),s=q.s*1.3,y=q.y-28*s;g.globalCompositeOperation='lighter';g.lineCap='round';
 for(const sx of[-1,1]){const hx=q.x+sx*12*s;circ(hx,y,4.5*s,rgba('#bfe6ff',.45));raPath(hx,y,hx+(rnd()-.5)*16*s,y+(rnd()-.5)*16*s,5*s,3);raStroke('#ffffff',1.1)}raPath(q.x-12*s,y,q.x+12*s,y,9*s,5);raStroke(rgba('#bfe6ff',.85),1.3)};
// armure de foudre : contour électrique et cheveux dressés (devant le ninja)
JFXD.ra_armor=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,u.z||0),s=q.s*1.3*(u.ch.look.scale||1),cx=q.x,cy=q.y-38*s,a=Math.min(1,f.t*3,(f.m-f.t)*4+.3);g.globalCompositeOperation='lighter';g.lineCap='round';
 g.strokeStyle=rgba('#bfe6ff',.5*a);g.lineWidth=2.2*s;g.beginPath();g.ellipse(cx,cy,23*s,44*s,0,0,7);g.stroke();
 for(let i=0;i<4;i++){const b=rnd()*7,b2=b+.6+rnd()*.8;raPath(cx+Math.cos(b)*20*s,cy+Math.sin(b)*40*s,cx+Math.cos(b2)*23*s,cy+Math.sin(b2)*43*s,9*s,4);raStroke(rgba(i%2?'#ffffff':'#bfe6ff',.9*a),1.4*s)}
 for(let i=0;i<2;i++){const hx=cx+(rnd()-.5)*16*s;raPath(hx,cy-36*s,hx+(rnd()-.5)*8*s,cy-(52+rnd()*10)*s,4*s,3);raStroke(rgba('#ffffff',.8*a),1.1*s)}
 if(u.moving&&rnd()<.5){const o=P(u.x+(rnd()-.5)*20,u.y+(rnd()-.5)*10,2);raPath(o.x,o.y,o.x+(rnd()-.5)*20*s,o.y-(6+rnd()*10)*s,6*s,3);raStroke(rgba('#ffe14a',.8*a),1.2)}};
// armure : jaillissement à l'activation
JFXD.ra_armorburst=(f,k,e,t,u)=>{const x=u&&!u.dead?u.x:f.x,y=u&&!u.dead?u.y:f.y,s=P(x,y,0).s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#bfe6ff',.9*k);g.lineWidth=4*s*k+1;gEll(x,y,30+95*e);g.stroke();
 for(let i=0;i<6;i++){const b=i*1.05+e*2,o=P(x+Math.cos(b)*(26+30*e),y+Math.sin(b)*(26+30*e)*.8,0),tp=P(x+Math.cos(b)*(20+20*e),y+Math.sin(b)*(20+20*e)*.8,90+70*e);raBolt(o.x,o.y,tp.x,tp.y,10*s,5,'#bfe6ff',1.8*s,k)}};
// effets génériques de la foudre (gardés : utilisés par les explosions et d'autres kits)
JFXD.bigbolt=(f,k,e,t)=>f.dragon?JFXD.ra_kirinfx(f,k,e,t):JFXD.ra_strike(f,k,e,t);
DETO.kirin=(x,y,r)=>jx({jfx:'ra_kirinfx',x,y,r,t:1,m:1});
DETO.lightning=(x,y,r)=>jx({jfx:'ra_strike',x,y,r:r*.8,t:.4,m:.4});

// ---- dessins : objets au sol (sous les ninjas)
// clone de foudre : silhouette translucide parcourue d'arcs, cercle de déclenchement
AUXD.ra_clone=(x,k,t)=>{const u=x.ui!=null?units[x.ui]:null,q=P(x.x,x.y,0),s=q.s,fl=x.t<.6&&Math.sin(t*40)>0?.45:1;
 g.globalCompositeOperation='lighter';g.fillStyle=rgba('#bfe6ff',.16*k);g.beginPath();g.ellipse(q.x,q.y-44*s,28*s,52*s,0,0,7);g.fill();g.strokeStyle=rgba('#bfe6ff',.55*k);g.lineWidth=1.5;g.setLineDash([4,4]);gEll(x.x,x.y,x.r+18);g.stroke();g.setLineDash([]);
 g.globalCompositeOperation='source-over';if(u&&!u.dead)drawChar3(u,q.x,q.y,s*1.3,.6*k*fl);
 g.globalCompositeOperation='lighter';g.fillStyle=rgba('#7fd0ff',.22*k*fl);g.beginPath();g.ellipse(q.x,q.y-46*s,20*s,46*s,0,0,7);g.fill();
 for(let i=0;i<5;i++){const b=rnd()*7,c=P(x.x,x.y,10+rnd()*70);raPath(c.x+Math.cos(b)*16*s,c.y+Math.sin(b)*10*s,c.x+Math.cos(b+2.4)*18*s,c.y+(rnd()-.5)*34*s,10*s,4);raStroke(rgba(i%2?'#bfe6ff':'#ffffff',.9*k*fl),1.5*s)}};
// sol détrempé sous le nuage d'orage : ronds de pluie
AUXD.ra_storm=(x,k,t)=>{g.fillStyle=rgba('#1a3a6a',.2*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#9fdcff',.55*k);g.lineWidth=2;g.setLineDash([10,7]);g.lineDashOffset=t*25;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 g.strokeStyle=rgba('#bfe6ff',.6*k);g.lineWidth=1;for(let i=0;i<10;i++){const ph=(t*1.7+i*.37)%1,b=i*2.4,d=x.r*(.15+((i*37)%80)/100),c=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.85,0);g.globalAlpha=1-ph;g.beginPath();g.ellipse(c.x,c.y,(3+ph*10)*c.s,(1.5+ph*5)*c.s,0,0,7);g.stroke()}g.globalAlpha=1};
// cible d'un éclair d'orage
AUXD.ra_mark=(x,k)=>{const e=1-x.t/x.m,q=P(x.x,x.y,0),R=x.r*.55*q.s;g.fillStyle=rgba('#ffe14a',.12);gEll(x.x,x.y,x.r);g.fill();g.fillStyle=rgba('#ffe14a',.32);gEll(x.x,x.y,x.r*e);g.fill();g.strokeStyle='#ffe14a';g.lineWidth=2;gEll(x.x,x.y,x.r);g.stroke();
 g.strokeStyle=rgba('#fff6c0',.85);g.lineWidth=1.5;g.beginPath();g.moveTo(q.x-R,q.y);g.lineTo(q.x+R,q.y);g.moveTo(q.x,q.y-R*K);g.lineTo(q.x,q.y+R*K);g.stroke()};
// zone de Kirin : ombre de l'orage, cercle d'alerte qui se resserre
AUXD.ra_kirin=(x,k,t)=>{const e=1-x.t/x.m;g.fillStyle=rgba('#0a0e1c',.16+.24*e);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#bfe6ff',.55+.45*e);g.lineWidth=2.5;g.setLineDash([12,8]);g.lineDashOffset=-t*40;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=1.5;gEll(x.x,x.y,x.r*(1-e*.85));g.stroke();if(rnd()<.2+.5*e){g.globalCompositeOperation='lighter';const b=rnd()*7,d=x.r*rnd(),o=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,0);raPath(o.x,o.y,o.x+(rnd()-.5)*30*o.s,o.y+(rnd()-.5)*14*o.s,8*o.s,3);raStroke(rgba('#bfe6ff',.8),1.2)}};
// sol brûlé par Kirin : fissures lumineuses qui s'éteignent
AUXD.ra_scorch=(x,k,t)=>{const a=Math.min(1,x.t/x.m*1.4),q=P(x.x,x.y,0);g.fillStyle=rgba('#14141c',.45*a);gEll(x.x,x.y,x.r*.8);g.fill();g.globalCompositeOperation='lighter';g.lineCap='round';
 for(let i=0;i<7;i++){const b=i*.9+x.x,o=P(x.x+Math.cos(b)*x.r*.85,x.y+Math.sin(b)*x.r*.85*.9,0),m=P(x.x+Math.cos(b+.25)*x.r*.45,x.y+Math.sin(b+.25)*x.r*.4,0);g.strokeStyle=rgba(i%2?'#bfe6ff':'#ffe14a',.7*a);g.lineWidth=1.6*q.s;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(m.x,m.y);g.lineTo(o.x,o.y);g.stroke()}};
// traînée électrique (Pas de l'éclair)
AUXD.ra_trail=(x,k,t)=>{const a=P(x.x,x.y,3),b=P(x.x+Math.cos(x.a)*x.len,x.y+Math.sin(x.a)*x.len,3),al=Math.min(1,x.t/x.m*1.6);g.globalCompositeOperation='lighter';g.lineCap='round';
 g.strokeStyle=rgba('#ffe14a',.14*al);g.lineWidth=x.w*a.s*.8;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();raBolt(a.x,a.y,b.x,b.y,14*a.s,Math.max(4,x.len/26|0),'#ffe14a',1.5*a.s,al*.9)};
AUXD.ra_chid=AUXD.ra_armor=AUXD.ra_run=()=>{};
// la foudre crépite entre les mains pendant les mudras (signal lisible : un jutsu Raiton arrive) ; le Chidori y forme sa boule
const RACH={ra_chidori:[1,'#9fd8ff'],ra_spear:[.8,'#9fd8ff'],ra_senbon:[.55,'#bfe6ff'],ra_nagashi:[.6,'#bfe6ff'],ra_clone:[.45,'#bfe6ff'],ra_kirin:[.8,'#bfe6ff'],ra_armor:[.8,'#bfe6ff'],
 ra_bolt:[.45,'#ffe14a'],ra_chain:[.55,'#ffe14a'],ra_panther:[.6,'#ffe14a'],ra_storm:[.6,'#ffe14a']};
STATD.push((u,p,S)=>{const c=u.cast;if(!c||u.dead)return;const ab=u.ch.abil[c.i],Q=ab&&RACH[ab.key];if(!Q)return;const k=c.t/c.dur;if(k<.25)return;
 const e=(k-.25)/.75,a=u.aim,h=P(u.x+Math.cos(a)*12,u.y+Math.sin(a)*12,30+(u.z||0)),R=(3+6*e)*S*Q[0];g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 circ(h.x,h.y,R*2,rgba(Q[1],.2));circ(h.x,h.y,R,rgba(Q[1],.7));circ(h.x,h.y,R*.45,'#ffffff');
 for(let i=0;i<3+e*4*Q[0];i++){const b=rnd()*7,L=R*(1.6+rnd()*1.8);raPath(h.x,h.y,h.x+Math.cos(b)*L,h.y+Math.sin(b)*L*.8,L*.5,3);raStroke(i%2?'#ffffff':Q[1],1.2)}g.restore()});
