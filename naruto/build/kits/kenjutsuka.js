// ===== Clan Kenjutsuka (samouraïs du Pays du Fer : Mifune) =====
// Sabre chargé de chakra, sans ninjutsu : discipline du dégainé (iai). Clan martial : pas de nature ni de familles, arbre de style Kenjutsu imposé,
// arbre de clan à 2 jutsu par rang (les 10 appris), aucun mudra. Trait « Iai » : le sabre rengainé dégaine plus fort et passe la garde.
// Les « N dégâts » des descriptions sont les dégâts de base des mécaniques (avant puissance du ninja et JBAL.d).
KIT('c21',[
 ['D','x.kj_batto','Battô : Coupe du fourreau','Dégaine en arc devant toi (150°) : 13 dégâts ; la lame rengaine aussitôt (trait Iai prêt)','steel'],
 ['D','x.kj_kamae','Kamae : Posture du roc','0,8 s : bloque tout coup au corps à corps porté de face ; chaque coup bloqué déclenche une riposte (14 dégâts)','steel'],
 ['C','x.kj_wave','Kengeki : Croissant de chakra','Onde tranchante en croissant (portée 380) qui traverse : 20 dégâts à chaque ennemi','steel'],
 ['C','x.kj_kiai','Kiai : Cri de guerre','Cri de guerre : interrompt les mudras des ennemis proches (150) et les repousse ; 3 s, tes coups de base sont 25 % plus rapides','steel'],
 ['B','x.kj_cross','Jûmonji : Coupe en croix','Deux entailles en X devant toi (la 2e 0,25 s plus tard) : 2 × 14 dégâts ; si les deux touchent : saignement (8 dégâts en 2 s) et ralenti 1 s','steel'],
 ['B','x.kj_uke','Ukenagashi : Lame qui détourne','1 s : le prochain tir qui t\'atteint repart vers son lanceur ; le prochain coup au corps à corps est détourné et l\'attaquant est désarmé 1 s','steel'],
 ['A','x.kj_pass','Iai : Passage du vent','Garde 0,3 s puis tu passes à travers l\'ennemi visé (300 max) ; la coupe tombe 0,4 s après : 36 dégâts, +50 % si le sabre était au fourreau','steel'],
 ['A','x.kj_armor','Tetsu no Yoroi : Armure du Pays du Fer','4 s : 30 % de dégâts en moins, insensible au contrôle 1,5 s ; chaque coup encaissé au corps à corps rengaine ton sabre','steel'],
 ['S','x.kj_tenzan','Iai : Tranche-ciel','Garde 0,8 s (demi-cercle d\'alerte de 260) puis coupe en demi-cercle : 60 dégâts, ignore boucliers et parades, étourdi 0,6 s ; frappé pendant la garde, tu coupes aussitôt','steel'],
 ['S','x.kj_seven','Nanabana : Sept fleurs de l\'aube','Intangible 0,9 s : tu fends jusqu\'à 7 fois les ennemis à moins de 220 (4 dégâts par coupe), puis rengaines : la coupe finale inflige 30 dégâts à chacun','steel'],
]);
Object.assign(NATHERO,{kj:'dooku'});
// ---------- aides ----------
const KJ_STEEL='#e8eef8',KJ_BLUE='#8ab0ff';
// le sabre au fourreau dégaine : renvoie 1 (le coup est un dégainé) et rengaine plus tard
function kjDraw(u){if(!u||!u.kj_sh||u.ch.clan!==KENJ)return 0;u.kj_sh=0;u.kj_t=0;jx({jfx:'kj_flash',ui:stI(u),x:u.x,y:u.y,a:u.aim,t:.35,m:.35});say(u,'IAI','#e8f0ff');return 1}
const kjSheathe=u=>{if(u&&u.ch.clan===KENJ&&!u.kj_sh){u.kj_sh=1;u.kj_t=0;jx({jfx:'kj_click',ui:stI(u),x:u.x,y:u.y,t:.4,m:.4})}};
const kjFront=(t,src,arc)=>angDiff(ang(t,src),t.aim)<(arc||1.3);
// ---------- mécaniques ----------
Object.assign(NAT,{
 kj_batto:S_('Battô : Coupe du fourreau','',4,{line:{len:120,w:200},ai:SELF(120,.7)},(u,a)=>{const m=kjDraw(u)?1.3:1;anim(u,'ken_draw',.3);S('saber',u);
  for(const e of stIn(u,a,120,2.6))if(hit(e,u,13*m,{melee:1,unblockable:m>1?1:0}))jx({jfx:'st_glint',ti:stI(e),x:e.x,y:e.y,a,t:.3,m:.3});
  kenArc(u,a,120,2.6,{d:1,c:KJ_STEEL,c2:KJ_BLUE,th:8});later(u,.28,()=>{if(!u.dead)kjSheathe(u)})}),
 kj_kamae:S_('Kamae : Posture du roc','',6,{ai:DEF},(u)=>{u.kj_kam=.8;anim(u,'kj_guard',.8);S('deflect',u);jx({jfx:'kj_kamae',ui:stI(u),x:u.x,y:u.y,t:.8,m:.8})}),
 kj_wave:S_('Kengeki : Croissant de chakra','',8,{line:{len:380,w:44},ai:RG(380,.65)},(u,a)=>{const m=kjDraw(u)?1.3:1;anim(u,'ken_draw',.3);S('saber',u);S('wind',u);
  proj(u,a,{spd:950,r:22,dmg:20*m,life:.4,pierce:1,col:'#cfe0ff',kind:'kj_wave',o:{unblockable:1}});kenArc(u,a,90,2.2,{c:KJ_STEEL,c2:KJ_BLUE})}),
 kj_kiai:S_('Kiai : Cri de guerre','',8,{ai:SELF(150,.6)},(u)=>{u.kj_kiai=3;anim(u,'roar',.5);S('roar',u);say(u,'KIAI !','#ffffff');
  for(const e of enemies(u)){if(dist(u,e)>150+e.r)continue;if(e.cast&&e.unstop<=0){e.cast=null;say(e,'INTERROMPU','#fc6')}hit(e,u,3,{kb:240,fx:u.x,fy:u.y})}
  jx({jfx:'shock',x:u.x,y:u.y,r:150,t:.45,m:.45,col:'#e8eef8'});jx({jfx:'kj_kiai',ui:stI(u),x:u.x,y:u.y,t:3,m:3});if(near(u.x,u.y))shake=Math.max(shake,.15)}),
 kj_cross:S_('Jûmonji : Coupe en croix','',10,{line:{len:125,w:150},ai:SELF(120,.65)},(u,a)=>{const m=kjDraw(u)?1.3:1,H=new Set();anim(u,'kj_cross',.5);S('saber',u);
  for(const e of stIn(u,a,125,1.7))if(hit(e,u,14*m,{melee:1,unblockable:m>1?1:0}))H.add(e);kenArc(u,a,125,1.7,{tl:.9,c:KJ_STEEL,c2:KJ_BLUE});
  later(u,.25,()=>{if(u.dead||u.stun>0)return;const b=u.aim;S('saber',u);kenArc(u,b,125,1.7,{tl:-.9,d:1,c:KJ_STEEL,c2:KJ_BLUE});
   for(const e of stIn(u,b,125,1.7)){const two=H.has(e);if(hit(e,u,14,two?{melee:1,slow:1,dot:{dps:4,dur:2}}:{melee:1})&&two){say(e,'CROIX !','#ff8a8a');jx({jfx:'kj_x',ti:stI(e),x:e.x,y:e.y,t:.6,m:.6});jx({jfx:'st_bleed',ti:stI(e),x:e.x,y:e.y,t:2,m:2})}}})}),
 kj_uke:S_('Ukenagashi : Lame qui détourne','',10,{ai:DEF},(u)=>{u.kj_uke=1;anim(u,'kj_guard',.6);S('deflect',u);aux.push({type:'kj_uke',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,ui:stI(u)})}),
 kj_pass:S_('Iai : Passage du vent','',13,{line:{len:300,w:40},ai:RG(290,.65,60)},(u,a,td)=>{const sh=u.kj_sh&&u.ch.clan===KENJ?1:0,D=tjLock(u,.42);anim(u,'ken_draw',.5);S('saber',u);
  later(u,.3,()=>{if(u.dead||u.dash!==D||u.stun>0)return;if(sh)kjDraw(u);const b=u.aim,e=pick(u,b,td||250,300);let d=300,c=b;if(e){c=ang(u,e);d=Math.min(340,dist(u,e)+e.r+u.r+36)}
   S('dash',u);const sx=u.x,sy=u.y;u.phase=Math.max(u.phase||0,.25);dash(u,c,d,.16,{});aux.push({type:'kj_pass',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,ui:stI(u),d:u.dash,hs:new Set(),sx,sy,a:c,m2:sh?1.5:1,ph:0,k:0})})}),
 kj_armor:S_('Tetsu no Yoroi : Armure du Pays du Fer','',13,{ai:SELF(220,.55)},(u)=>{u.drT=Math.max(u.drT,4);u.dr=Math.max(u.dr||0,.3);u.unstop=Math.max(u.unstop,1.5);u.kj_arm=4;anim(u,'kj_guard',.5);S('heavy',u);say(u,'ARMURE','#c8d0dc');
  jx({jfx:'kj_armor',ui:stI(u),x:u.x,y:u.y,t:4,m:4})}),
 kj_tenzan:S_('Iai : Tranche-ciel','',22,{tele:{self:1,r:260},ai:SELF(240,.7)},(u,a)=>{const D=tjLock(u,1.05);u.kj_ten=.8;anim(u,'kj_tenzan',1.1);S('saber',u);
  aux.push({type:'kj_ten',x:u.x,y:u.y,a,r:260,t:1,m:1,team:u.team,owner:u,ui:stI(u),d:D})}),
 kj_seven:S_('Nanabana : Sept fleurs de l\'aube','',22,{ai:SELF(220,.7)},(u)=>{u.phase=Math.max(u.phase||0,.95);const cx=u.x,cy=u.y,H=new Set();let n=0;anim(u,'ken_flurry',.9);S('dash',u);say(u,'SEPT FLEURS','#ffd8e8');
  jx({jfx:'kj_petals',x:cx,y:cy,r:220,t:1.2,m:1.2});
  seqs.push({owner:u,n:7,t:.02,iv:.12,vfx:'steel',f:o=>{if(o.dead)return;n++;const L=enemies(o).filter(e=>!e.dead&&Math.hypot(e.x-cx,e.y-cy)<220+e.r);if(!L.length)return;const e=L[n%L.length],b=rnd()*6.28,ox=o.x,oy=o.y;
   o.x=e.x+Math.cos(b)*(e.r+o.r+8);o.y=e.y+Math.sin(b)*(e.r+o.r+8);collide(o);o.aim=ang(o,e);jx({jfx:'ken_shade',ui:stI(o),x:ox,y:oy,x2:o.x,y2:o.y,me:1,t:.3,m:.3});S('saber',o);
   if(hit(e,o,4,{melee:1,unblockable:1}))H.add(e);kenArc(o,o.aim,70,1.8,{d:n%2?1:-1,tl:(rnd()-.5)*1.6,c:'#ffe8f0',c2:'#ff9ac8',th:5,t:.2,m:.2});
   if(n===7)later(o,.12,()=>{if(o.dead)return;for(const t of H)if(!t.dead){hit(t,o,30,{unblockable:1});jx({jfx:'tj_impact',x:t.x,y:t.y,a:0,t:.4,m:.4,big:1,col:'#ffd8e8'})}kjSheathe(o);if(H.size&&near(o.x,o.y)){S('heavy',o);shake=Math.max(shake,.3)}})}})}),
 // dash du clan (Espace) : Suriashi — glissé au ras du sol, le sabre rengaine à l'arrivée
 kj_suri:S_('Suriashi : Pas glissé','',5,{ai:{mode:'gap',min:120,max:320,p:.45}},(u,a,td)=>{const d=clamp(td||200,60,200);S('dash',u);anim(u,'kj_slide',.22);
  dash(u,a,d,.2,{end:()=>{if(!u.dead)kjSheathe(u)}});jx({jfx:'kj_slide',ui:stI(u),x:u.x,y:u.y,a,t:.32,m:.32})}),
});
DASHC[KENJ]={src:'x.kj_suri',n:'Suriashi : Pas glissé',d:'Glissé au ras du sol (200) vers le curseur ; à l\'arrivée, le sabre rengaine (trait Iai prêt)',vfx:'steel',cd:5};
// ---------- logique des objets ----------
// Passage du vent : ennemis traversés pendant la ruée, la coupe tombe 0,4 s après
AUXF.kj_pass=(x,dt)=>{const u=x.owner;if(u.dead){x.t=0;return}
 if(x.ph===0){if(u.dash===x.d){for(const e of enemies(u))if(!x.hs.has(e)&&dist(u,e)<u.r+e.r+16)x.hs.add(e);return}x.ph=1;x.k=.4;x.x=u.x;x.y=u.y;jx({jfx:'kj_trail',x:x.sx,y:x.sy,x2:u.x,y2:u.y,t:.5,m:.5});return}
 if(x.ph===1){x.k-=dt;if(x.k>0)return;x.ph=2;x.t=.05;S('saber',u);S('heavy',u);for(const e of x.hs)if(!e.dead&&hit(e,u,36*x.m2,{melee:1,unblockable:1})){jx({jfx:'kj_x',ti:stI(e),x:e.x,y:e.y,t:.6,m:.6});jx({jfx:'tj_impact',x:e.x,y:e.y,a:x.a,t:.4,m:.4,big:1,col:'#e8f0ff'})}
  jx({jfx:'kj_cut',x:x.sx,y:x.sy,x2:x.x,y2:x.y,t:.45,m:.45});if(x.hs.size&&near(x.x,x.y))shake=Math.max(shake,.3)}};
// Ukenagashi : le prochain tir qui arrive repart vers son lanceur
AUXF.kj_uke=x=>{const u=x.owner;if(u.dead||!(u.kj_uke>0)){x.t=0;return}x.x=u.x;x.y=u.y;
 for(const p of projs){if(p.dead||p.life<=0||p.owner.team===u.team||p.rocket||p.grenade)continue;if(Math.hypot(p.x-u.x,p.y-u.y)<u.r+p.r+22){reflect(p,u);u.kj_uke=0;x.t=0;say(u,'UKENAGASHI','#cfe0ff');jx({jfx:'kj_flash',ui:stI(u),x:u.x,y:u.y,a:u.aim,t:.35,m:.35});return}}};
AUXD.kj_uke=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const q=P(u.x+Math.cos(u.aim)*14,u.y+Math.sin(u.aim)*14,34),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#cfe0ff',.8);g.lineWidth=3*s;
 g.beginPath();g.moveTo(q.x-14*s,q.y+16*s);g.lineTo(q.x+14*s,q.y-20*s);g.stroke();g.strokeStyle=rgba('#ffffff',.5+.4*Math.sin(t*20));g.lineWidth=1.2*s;g.stroke();g.restore()};
// Tranche-ciel : garde (demi-cercle d'alerte), puis coupe (aussitôt si le samouraï est frappé)
AUXF.kj_ten=x=>{const u=x.owner;if(x.done)return;if(u.dead||u.stun>0||u.dash!==x.d){x.t=0;u.kj_ten=0;return}x.x=u.x;x.y=u.y;
 if(x.done)return;if(x.m-x.t<.8&&!u.kj_tenHit)return;x.done=1;x.t=0;u.kj_ten=0;u.kj_tenHit=0;if(u.dash===x.d)u.dash=null;const m=kjDraw(u)?1.3:1,a=u.aim;S('saber',u);S('heavy',u);
 for(const e of enemies(u)){if(dist(u,e)>260+e.r||angDiff(ang(u,e),a)>1.6)continue;const sh=e.shield;e.shield=0;if(hit(e,u,60*m,{melee:1,unblockable:1,stun:.6})){if(sh>0){e.shieldT=0;say(e,'BOUCLIER TRANCHÉ','#bfe6ff')}jx({jfx:'tj_impact',x:e.x,y:e.y,a:ang(u,e),t:.45,m:.45,big:1,col:'#e8f0ff'})}else if(e.shield<=0)e.shield=sh}
 jx({jfx:'kj_sky',ui:stI(u),x:u.x,y:u.y,a,t:.6,m:.6});if(near(u.x,u.y))shake=Math.max(shake,.4)};
AUXD.kj_ten=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const q=P(u.x,u.y,0),R=x.r*q.s,e=Math.min(1,(x.m-x.t)/.8),a=u.aim;if(x.done)return;g.save();g.fillStyle=rgba('#cfe0ff',.1);g.beginPath();g.moveTo(q.x,q.y);g.ellipse(q.x,q.y,R,R*K,0,a-1.57,a+1.57);g.closePath();g.fill();
 g.fillStyle=rgba('#cfe0ff',.22);g.beginPath();g.moveTo(q.x,q.y);g.ellipse(q.x,q.y,R*e,R*e*K,0,a-1.57,a+1.57);g.closePath();g.fill();g.strokeStyle='#e8f0ff';g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,a-1.57,a+1.57);g.stroke();g.restore()};
// ---------- trait de clan : Iai, le fourreau ----------
TRAITS[KENJ]={nom:'Iai',desc:'Après 1,5 s sans frapper, ton sabre retourne au fourreau. Le coup suivant (attaque de base ou jutsu de sabre) est un dégainé : +30 % de dégâts et ignore la parade. Le 5e coup d\'un combo rengaine aussitôt.',
 init(u){u.kj_sh=1;u.kj_t=0;u.kj_kam=u.kj_uke=u.kj_arm=u.kj_ten=u.kj_kiai=0},
 update(u,dt){if(u.kj_cds!==u.cds){if(u.kj_cds){u.kj_sh=1;u.kj_t=0;u.kj_kam=u.kj_uke=u.kj_arm=u.kj_ten=u.kj_kiai=0}u.kj_cds=u.cds}
  if(u.swing>0||u.cast||u.spin)u.kj_t=0;else u.kj_t=(u.kj_t||0)+dt;if(!u.kj_sh&&u.kj_t>1.5)kjSheathe(u);
  for(const k of['kj_kam','kj_uke','kj_arm','kj_ten','kj_kiai'])if(u[k]>0)u[k]=Math.max(0,u[k]-dt)},
 deal(src,t,dmg,o){if(!o.silent)src.kj_t=0;return dmg},
 take(t,src,dmg,o){if(!src||src===t||src.team===t.team)return dmg;
  if(t.kj_ten>0)t.kj_tenHit=1; // Tranche-ciel : frappé pendant la garde, on coupe aussitôt
  if(o.melee&&!o.silent){
   if(t.kj_kam>0&&kjFront(t,src)){if(near(t.x,t.y)){say(t,'KAMAE','#cfe0ff');sparks(t.x,t.y,'#e8eef8',10);S('deflect',t)}later(t,.06,()=>{if(t.dead||src.dead||t.stun>0||dist(t,src)>170)return;t.aim=ang(t,src);anim(t,'ken_draw',.25);
     hit(src,t,14,{melee:1,unblockable:1,kb:160});kenArc(t,t.aim,100,1.6,{c:KJ_STEEL,c2:KJ_BLUE});say(t,'RIPOSTE','#cfe0ff')});return -1}
   if(t.kj_uke>0){t.kj_uke=0;src.disarm=Math.max(src.disarm||0,1);say(t,'DÉTOURNÉ','#cfe0ff');say(src,'DÉSARMÉ','#ffb03a');sparks(t.x,t.y,'#e8eef8',12);S('deflect',t);jx({jfx:'kj_flash',ui:stI(t),x:t.x,y:t.y,a:t.aim,t:.35,m:.35});return -1}
   if(t.kj_arm>0)kjSheathe(t)}
  return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000;
  // fourreau sur la hanche : lueur quand le sabre est rengainé (dégainé prêt)
  if(u.kj_sh){g.save();g.globalCompositeOperation='lighter';const x=p.x-8*S*sk,y=p.y-26*S*sk;g.strokeStyle=rgba('#cfe0ff',.45+.25*Math.sin(t*6));g.lineWidth=3*S;g.beginPath();g.moveTo(x-10*S,y+8*S);g.lineTo(x+12*S,y-6*S);g.stroke();g.restore()}
  if(u.kj_kam>0){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#e8eef8',.7);g.lineWidth=3*S;g.beginPath();g.ellipse(p.x+Math.cos(u.aim)*16*S,p.y-34*S*sk+Math.sin(u.aim)*6*S,10*S,30*S*sk,0,0,7);g.stroke();g.restore()}
  if(u.kj_kiai>0){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.25*Math.min(1,u.kj_kiai));g.lineWidth=2;for(let i=0;i<3;i++){const r=((t*1.5+i/3)%1)*30*S;g.beginPath();g.ellipse(p.x,p.y-60*S*sk,r,r*.5,0,0,7);g.stroke()}g.restore()}},
 hud(u,x,y){const X=x+368,Y=y-56,on=!!u.kj_sh;text(on?'居  IAI : SABRE AU FOURREAU':'居  IAI : '+Math.max(0,1.5-(u.kj_t||0)).toFixed(1).replace('.',',')+' s',X,Y+8,11,on?'#e8f0ff':'#8a96a8','left')},
 prev(u,p,S,front){if(!front)return;g.save();g.strokeStyle='#2a2a33';g.lineWidth=3.4*S;g.beginPath();g.moveTo(p.x-18*S,p.y-18*S);g.lineTo(p.x+4*S,p.y-32*S);g.stroke();g.strokeStyle='#c8a040';g.lineWidth=1.6*S;g.beginPath();g.moveTo(p.x+1*S,p.y-30*S);g.lineTo(p.x+5*S,p.y-36*S);g.stroke();g.restore()}};
AFTER.push(()=>UK.push('kj_sh','kj_kam','kj_uke','kj_arm','kj_ten','kj_kiai'));
// apparence du clan : armure de samouraï, casque (si aucun accessoire choisi), katana dans le dos (si rien n'y est porté)
CLOOK[KENJ]=(look)=>{const h=look.head;if(!h.acc)h.acc='kabuto';if(!look.back&&!look.gourd)look.back='katana';if(!look.samurai)look.samurai='#5a6070';if(!look.armor)look.armor='#4a5262';h.eye=h.eye||'#4a5060';look.weapon.col='#cfe0ff'};
// ---------- attaques de base ----------
// Iaidô du samouraï (style propre du clan) : katana à deux mains, coups lents et précis ; 5e : grande coupe puis la lame rengaine
STYLES.push(['Iaidô du samouraï','Katana tenu à deux mains, coups lents et précis ; 3e coup : estoc ; 5e : grande coupe en arc puis la lame rengaine (le coup suivant est un dégainé)','x.kj_style','steel','sword',[KENJ],1.12,1.07,'ken']);
// Ninjatô (sans clan, arbre Kenjutsu) : lame courte tenue à l'envers, très vive ; 4e : revers qui fait saigner ; 5e : estoc, +20 % dans le dos
STYLES.push(['Ninjatô','Lame courte tenue à l\'envers, très vive ; 4e coup : revers qui fait saigner ; 5e : estoc (+20 % si la cible te tourne le dos)','x.st_nin','steel','ninjato',[-1],1.12,1.07,'ken']);
Object.assign(NAT,{
 kj_style:SP('Iaidô du samouraï','',.44,{hero:'dooku',melee:1,ai:{max:110,p:1}},(u,a)=>{const c=stC(u),T=[0,[100,1.5,11,.44],[100,1.5,11,.44],[124,.5,12,.46],[104,2.2,12,.48],[112,2.8,14,.66]][c],dr=kjDraw(u);
  if(c===5)stLunge(u,a,30);
  stMelee(u,a,T[0],T[1],T[2]*(dr?1.3:1),dr?{unblockable:1}:{},[0,{d:-1,tl:.75,z:36,th:7,c:KJ_STEEL,c2:KJ_BLUE,blade:1},{d:1,tl:-.75,z:36,th:7,c:KJ_STEEL,c2:KJ_BLUE,blade:1},{jfx:'st_thrust',z:32,c:KJ_STEEL},{d:-1,z:28,th:8,c:KJ_STEEL,c2:KJ_BLUE,blade:1},{d:-1,z:28,th:10,c:'#ffffff',c2:KJ_BLUE,blade:1,rr:.85}][c]);
  if(c===5){jx({jfx:'st_iai',ui:stI(u),x:u.x,y:u.y,a,R:T[0],t:.5,m:.5});later(u,.3,()=>{if(!u.dead)kjSheathe(u)})}
  stCd(u,T[3]*(u.kj_kiai>0?.75:1));anim(u,'st_ken'+c,c===3?.3:.3)}),
 st_nin:SP('Ninjatô','',.3,{hero:'rey',melee:1,ai:{max:96,p:1}},(u,a)=>{const c=stC(u),T=[0,[84,1.6,9,.28],[84,1.6,9,.28],[88,1.9,9,.3],[90,2.2,10,.34],[102,.7,12,.52]][c],N0='#dfe6f0';
  if(c===5){stLunge(u,a,44);S('dash',u)}
  const C=stIn(u,a,T[0],T[1]),back=c===5?C.filter(e=>angDiff(e.aim,ang(e,u))>1.9):[];
  stMelee(u,a,T[0],T[1],T[2],{},[0,{d:1,tl:-.4,z:34,th:5,c:N0,blade:1},{d:-1,tl:.4,z:34,th:5,c:N0,blade:1},{d:1,tl:1.1,z:30,th:5,c:N0,blade:1},{d:-1,z:24,th:6,c:'#ffffff',blade:1,rr:.8},{jfx:'st_thrust',z:30,c:'#ffffff',w2:3.5}][c],e=>{
   jx({jfx:'st_glint',ti:stI(e),x:e.x,y:e.y,a,t:.3,m:.3});
   if(c===4&&!(e.dotT>0)){e.dot=2.5;e.dotT=2;e.dotSrc=u;e.dotEl=-1;jx({jfx:'st_bleed',ti:stI(e),x:e.x,y:e.y,t:2,m:2})}
   if(back.includes(e)&&!e.dead){hit(e,u,T[2]*.2,{unblockable:1,silent:1});say(e,'DANS LE DOS','#ffb03a')}});
  stCd(u,T[3]);anim(u,'st_kun'+c,c===4?.34:.26)}),
});
// ---------- animations ----------
Object.assign(ANIM,{
 // garde du samouraï : sabre levé en travers, pieds ancrés
 kj_guard:(P,e)=>{const k=Math.min(1,e*6);P.root.y=-5*k;pz(P,'armR',-1.7*k,0,.5*k);pz(P,'foreR',-1.2*k);pz(P,'armL',-1.5*k,0,-.4*k);pz(P,'foreL',-1.3*k);pz(P,'chest',.1*k);pz(P,'thighL',-.6*k,0,.3);pz(P,'shinL',.8*k);pz(P,'thighR',.4*k,0,-.3);pz(P,'shinR',.7*k)},
 // deux coupes en X
 kj_cross:(P,e)=>{const h=e<.5,k=ezo(Math.min(1,(h?e:e-.5)/.3));pz(P,'armR',h?-2.6+1.8*k:-.8-1.8*k,0,h?-.6+1.2*k:.6-1.2*k);pz(P,'foreR',-.2);pz(P,'armL',-1.2,0,.3);pz(P,'chest',.2,h?.5-1*k:-.5+1*k);P.root.y=-4},
 // Tranche-ciel : main sur la poignée, très bas ; puis la coupe en demi-cercle
 kj_tenzan:(P,e)=>{if(e<.72){const k=Math.min(1,e*5);P.root.y=-11*k;pz(P,'chest',.5*k,.7*k);pz(P,'armR',-.5*k,0,.7*k);pz(P,'foreR',-1.5*k);pz(P,'armL',-.4*k,0,.4);pz(P,'thighL',-1*k,0,.3);pz(P,'shinL',1.3*k);pz(P,'thighR',.7*k,0,-.3);pz(P,'shinR',1.1*k)}
  else{const k=ezo(Math.min(1,(e-.72)/.15));P.rootR.y=tjSp(-2.6*k);P.root.y=-8;pz(P,'armR',-1.55,0,-1.2*k);pz(P,'foreR',-.1);pz(P,'chest',.3,-.6*k);pz(P,'thighL',-.9,0,.3);pz(P,'shinL',1.1);pz(P,'thighR',.6);pz(P,'shinR',.9)}},
 // glissé : buste bas, sabre en arrière
 kj_slide:(P,e)=>{const k=Math.min(1,e*5);P.root.y=-8*k;pz(P,'chest',.55*k);pz(P,'armR',.5*k,0,-.4);pz(P,'armL',-.6*k,0,.4);pz(P,'thighL',-.9*k);pz(P,'shinL',1*k);pz(P,'thighR',.7*k);pz(P,'shinR',.6*k)},
});
// ---------- visuels ----------
// éclat du dégainé : trait blanc devant le samouraï
JFXD.kj_flash=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,q=P(o.x+Math.cos(f.a)*20,o.y+Math.sin(f.a)*20,36),R=(10+e*26)*q.s;g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.9*k);g.beginPath();
 for(let i=0;i<8;i++){const b=i*.785+f.a,L=i%2?R*.2:R;g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*.7)}g.closePath();g.fill();g.restore()};
// rengainé : « clac » de la garde
JFXD.kj_click=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x-6,u.y,24);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#cfe0ff',.8*k);g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,(4+e*12)*q.s,0,7);g.stroke();g.restore()};
// garde du roc : bouclier d'acier de face
JFXD.kj_kamae=(f,k,e,t,u)=>{if(!u||u.dead||!(u.kj_kam>0))return;const q=P(u.x+Math.cos(u.aim)*18,u.y+Math.sin(u.aim)*18,32),s=q.s;g.save();g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#cfe0ff',.14);g.beginPath();g.ellipse(q.x,q.y,14*s,34*s,0,0,7);g.fill();g.strokeStyle=rgba('#ffffff',.7);g.lineWidth=2;g.stroke();g.restore()};
// onde en croissant (projectile)
PROJD.kj_wave=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.fillStyle=rgba('#cfe0ff',.45);g.beginPath();g.arc(-R*.6,0,R*1.5,-1.25,1.25);g.arc(-R*1.3,0,R*1.25,1.1,-1.1,true);g.closePath();g.fill();
 g.fillStyle=rgba('#ffffff',.9);g.beginPath();g.arc(-R*.5,0,R*1.3,-1.1,1.1);g.arc(-R*.9,0,R*1.15,1,-1,true);g.closePath();g.fill()};
// Kiai : aura blanche 3 s (dessinée par le trait), onde
JFXD.kj_kiai=()=>{};
// croix sanglante
JFXD.kj_x=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,36),R=22*q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff6a6a',.9*k);g.lineWidth=4*q.s;g.lineCap='round';
 g.beginPath();g.moveTo(q.x-R,q.y-R);g.lineTo(q.x+R,q.y+R);g.moveTo(q.x+R,q.y-R);g.lineTo(q.x-R,q.y+R);g.stroke();g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=1.5*q.s;g.stroke();g.restore()};
// Passage du vent : traînée de la ruée, puis la coupe sur toute la ligne
JFXD.kj_trail=(f,k,e,t)=>{const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#cfe0ff',.4*k);g.lineWidth=10*a.s;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.restore()};
JFXD.kj_cut=(f,k,e)=>{const a=P(f.x,f.y,32),b=P(f.x2,f.y2,32),pr=Math.min(1,e/.15);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#9ab8ff',.6*k);g.lineWidth=14*a.s*k+2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(lerp(a.x,b.x,pr),lerp(a.y,b.y,pr));g.stroke();
 g.strokeStyle=rgba('#ffffff',k);g.lineWidth=3*a.s;g.stroke();g.restore()};
// Armure du Pays du Fer : plaques d'acier qui luisent
JFXD.kj_armor=(f,k,e,t,u)=>{if(!u||u.dead||!(u.kj_arm>0))return;const q=P(u.x,u.y,0),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#c8d0dc',.5+.2*Math.sin(t*5));g.lineWidth=2*s;
 for(let i=0;i<4;i++){const y=q.y-(18+i*12)*s;g.beginPath();g.ellipse(q.x,y,(18-i)*s,6*s,0,Math.PI*.1,Math.PI*.9);g.stroke()}if(u.unstop>0){g.strokeStyle=rgba('#ffffff',.35);g.beginPath();g.ellipse(q.x,q.y-34*s,26*s,44*s,0,0,7);g.stroke()}g.restore()};
// Tranche-ciel : immense demi-lune
JFXD.kj_sky=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,q=P(o.x,o.y,30),R=260*q.s*(.7+e*.35),a=f.a;g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#e8f0ff',.55*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,a-1.57,a+1.57);
 g.ellipse(q.x+Math.cos(a)*R*.18,q.y+Math.sin(a)*R*.18*K,R*.84,R*.84*K,0,a+1.5,a-1.5,true);g.closePath();g.fill();g.strokeStyle=rgba('#9ab8ff',.8*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,R*1.03,R*1.03*K,0,a-1.6,a+1.6);g.stroke();g.restore()};
// Sept fleurs : pétales sur la zone
JFXD.kj_petals=(f,k,e,t)=>{for(let i=0;i<18;i++){const b=i*.35+t*.8,d=f.r*(.2+((i*37)%10)/12),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,20+((i*13+t*60)%60));g.fillStyle=rgba(i%2?'#ffd8e8':'#ff9ac8',.8*Math.min(1,k*2));g.beginPath();g.ellipse(q.x,q.y,4*q.s,2*q.s,b,0,7);g.fill()}};
// Suriashi : traînée d'acier au ras du sol
JFXD.kj_slide=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,6),s=q.s,ca=Math.cos(f.a),sa=Math.sin(f.a)*K;g.save();g.globalCompositeOperation='lighter';g.lineCap='round';for(let i=0;i<4;i++){const o=(i-1.5)*6*s,L=(40+i*12)*s;
 g.strokeStyle=rgba(i%2?'#cfe0ff':'#ffffff',.6*k);g.lineWidth=2*s;g.beginPath();g.moveTo(q.x-sa*o,q.y+ca*o);g.lineTo(q.x-sa*o-ca*L,q.y+ca*o-sa*L);g.stroke()}g.restore()};
