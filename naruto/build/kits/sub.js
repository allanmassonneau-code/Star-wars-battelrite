// ===== Subjutsu (ninjas sans clan) =====
// Techniques universelles : outils ninja (kunai, parchemins, pièges, fumigènes), clones, téléportations, invocations, ninjutsu médical.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('u',[
 [1,'S','x.sub_rasen','Rasengan','Fonce avec la sphère : broie et projette la cible (étourdie contre un obstacle) ; un clone vivant l\'agrandit','rasengan'],
 [1,'C','x.sub_fuma','Fûma Shuriken','Shuriken géant perçant qui revient vers toi : touchée à l\'aller et au retour, la cible est ralentie','shuriken'],
 [1,'C','x.sub_oka','Ôkashô','Poing chargé de chakra qui fend le sol devant toi : projette les ennemis en l\'air','tai'],
 [1,'B','x.sub_lotus','Lotus primaire','Fonce sur l\'ennemi proche, l\'envoie en l\'air d\'un coup de pied puis l\'écrase au sol : étourdit','gate'],
 [1,'D','x.sub_smoke','Bombe fumigène','Lance une bombe : fumée épaisse qui ralentit les ennemis et rend tes alliés invisibles','smoke'],
 [3,'S','x.sub_clones','Multiclonage','2 clones attaquent avec ton style 5 s ; ils arrêtent les tirs ennemis et disparaissent au 1er coup','smoke'],
 [3,'B','x.sub_bomb','Clone explosif','Un clone fonce sur l\'ennemi visé et explose à son contact ; frappé en chemin, il explose aussitôt','smoke'],
 [3,'A','x.sub_tag','Parchemin explosif','Kunai à parchemin collé au 1er ennemi touché (sinon au sol) : grosse explosion 1,2 s après, étourdit','tag'],
 [3,'C','x.sub_wire','Piège ninja','Tend un fil presque invisible : l\'ennemi qui le franchit reçoit une volée de kunai et est étourdi','steel'],
 [3,'C','x.sub_feather','Genjutsu : Plumes','Pluie de plumes qui ralentit : l\'ennemi qui y reste 1,2 s s\'endort (12 dégâts le réveillent)','genjutsu'],
 [3,'C','x.sub_kexp','Kunai explosifs','Kunai planté au curseur : il explose puis projette 4 parchemins qui explosent en anneau','tag'],
 [4,'B','x.sub_shosen','Shôsen','Soigne l\'allié le plus blessé (ou toi), le régénère 1,5 s et éteint brûlures et poisons','heal'],
 [4,'C','x.sub_mesu','Scalpel de chakra','Bond et entaille les muscles devant toi : ralentit fortement et empêche d\'attaquer 0,8 s','chakra'],
 [4,'B','x.sub_counter','Contre du clone','0,7 s : le prochain coup ne frappe qu\'un clone ; tu surgis derrière l\'attaquant proche, le frappes et l\'étourdis','smoke'],
 [4,'C','x.sub_pill','Pilule du soldat','Croque une pilule : +40 chakra, soin, endurance pleine ; se libère des entraves et ralentissements','heal'],
 [4,'D','x.sub_focus','Concentration du chakra','Réduit de 3 s la recharge de tes autres jutsu (hors ultime), rend 15 chakra et te rend plus rapide 1 s','chakra'],
 [2,'C','x.sub_shunshin','Shunshin','Disparaît dans un tourbillon de feuilles et réapparaît au curseur : les feuilles tranchent autour de toi (8 dégâts) et tu cours plus vite 1,5 s','leaf'],
 [2,'C','x.sub_kawa','Kawarimi','Se substitue au curseur et laisse à sa place une bûche piégée qui explose et étourdit','smoke'],
 [2,'C','x.sub_jump','Saut ninja','Bondit au curseur ; l\'atterrissage repousse les ennemis proches','leaf'],
 [2,'D','x.sub_roll','Roulade','Roulade rapide : intouchable au début de la roulade','smoke'],
 [2,'B','x.sub_hira','Hiraishin','Lance un kunai marqué ; relance (4 s) : t\'y téléporte, ou derrière l\'ennemi marqué qui est frappé et étourdi','kunai'],
 [2,'C','x.sub_grap','Kunai à fil','Kunai à fil : te tire jusqu\'au point d\'impact ; sur un ennemi, finit par un coup de pied étourdissant','kunai'],
 [5,'A','x.sub_toad','Invocation : Crapaud','Gamabunta s\'écrase sur la zone : gros dégâts, étourdit, puis reste comme rempart sur un sol boueux','smoke'],
 [5,'C','x.sub_rain','Pluie de parchemins','Une nuée de parchemins s\'abat sur la zone et explose en vague, du centre vers le bord','tag'],
 [5,'S','x.sub_sage','Mode Ermite','Se concentre 0,6 s (interruptible) puis 4 s : +35 % de dégâts, plus rapide, chakra illimité ; soigne un peu','sage'],
 [5,'B','x.sub_katsu','Invocation : Katsuyu','Des limaces se posent sur toi et tes alliés proches : soin, régénération 2,5 s et chakra','heal'],
]);
// ---------- aides ----------
let SUBN=0;const SUBF=new Map();
// porteur : projectile immobile, sans collision, trié en profondeur avec les ninjas (sert à dessiner clones et invocations)
// (marqué « grenade » pour ignorer les collisions ; sa cible fictive tx/ty est hors de l'arène, à gauche : l'IA ne l'évite pas)
function subCarrier(u,x,y,kind,o){const p=Object.assign({x,y,vx:0,vy:0,owner:u,src:u,rot:0,r:14,dmg:0,life:99,life0:1e9+(++SUBN),col:'#000000',vfx:'sub_x',kind,grenade:1,boom:1,noClash:1,tx:-5000,ty:y,ar:1,ex:false,basic:false,hitSet:null,oy:units.indexOf(u),ox:u.aim||0,zapP:0,spear:0},o);projs.push(p);return p}
// explosion de parchemin (dégâts + visuel)
function subBoom(u,x,y,r,dmg,o){const V=VFX;VFX='tag';aoe(u,x,y,r,dmg,Object.assign({unblockable:1},o),'#ff9a3a');detoFx(x,y,r,'sub_boom');if(near(x,y)){S('boom',u);shake=Math.max(shake,r>80?.3:.16)}VFX=V}
// nuage « pouf » (clones, substitution)
function subPoof(x,y,r,u){if(!near(x,y))return;jx({jfx:'sub_poof',x,y,r:r||36,t:.5,m:.5});sparks(x,y,'#eceff4',10,'smoke');S('poof',u||{x,y})}
// alerte au sol : zone factice du moteur (même dessin que les autres alertes ; les bots l'évitent), retirée juste avant qu'elle n'explose
function subWarn(u,x,y,r,t,vfx){const z={x,y,r,t:t+.12,m:t+.12,owner:u,dmg:0,o:{},col:'#ff9a3a',vfx:vfx||'tag',jn:'sub'};zones.push(z);return z}
const subIdx=(u,k)=>u.ch.abil.findIndex(x=>x&&x.key===k);
// ennemi le plus proche que les clones peuvent voir (un ennemi invisible n'est repéré qu'à moins de 140 px, comme pour les bots)
function subNearE(u,x,y,r){let b=null,bd=r;for(const e of units){if(e.dead||e.team===u.team)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd&&!(e.stealth>0&&d>140)){bd=d;b=e}}return b}
// garde un point dans l'arène, hors des piliers
function subFree(p,r){p.x=clamp(p.x,B.x+r,B.x+B.w-r);p.y=clamp(p.y,B.y+r,B.y+B.h-r);for(const o of OBST){const m=o.r+r;if(Math.abs(p.x-o.x)>=m||Math.abs(p.y-o.y)>=m)continue;const d=Math.hypot(p.x-o.x,p.y-o.y);if(d<m&&d>0){p.x=o.x+(p.x-o.x)/d*m;p.y=o.y+(p.y-o.y)/d*m}}return p} // rejet rapide par boîte avant l'hypoténuse
Object.assign(NAT,{
 // --- Rasengan : la sphère se forme (incantation courte, interruptible), puis on fonce ; la 1re cible est broyée puis projetée
 sub_rasen:S_('Rasengan','Forme une sphère puis fonce : broie et projette la 1re cible',10,{hero:'savage',cast:.28,line:{len:300,w:40},ai:{mode:'gap',min:60,max:300,p:.6}},(u,a,td)=>{S('rasengan',u);anim(u,'sub_rasen',.55);
  // un clone vivant aide à façonner la sphère : Ôdama Rasengan (plus gros, plus fort)
  const C=aux.find(o=>o.type==='sub_clones'&&o.owner===u&&o.L.some(p=>p.life>0)),cl=C&&C.L.find(p=>p.life>0);if(cl){cl.life=0;subPoof(cl.x,cl.y,30,u);say(u,'ÔDAMA RASENGAN !','#7fc8ff');jx({jfx:'sub_bigras',ui:units.indexOf(u),x:u.x,y:u.y,t:.75,m:.75})}
  const d=clamp((td||250)+30,140,300);dash(u,a,d,d/950,{});aux.push({type:'sub_rasen',x:u.x,y:u.y,a,r:0,t:1.2,m:1.2,team:u.team,owner:u,ui:units.indexOf(u),k:0,n:0,ph:1,big:cl?1:0})}),
 // --- Fûma Shuriken : boomerang perçant ; touché à l'aller ET au retour = entaille qui ralentit
 sub_fuma:S_('Fûma Shuriken','Shuriken géant perçant qui revient',8,{hero:'vader',ai:RG(420,.6,60)},(u,a)=>{S('saber',u);anim(u,'throw2',.4);
  proj(u,a,{spd:620,r:13,dmg:12,life:2.4,col:'#c8ccd4',ret:400,pierce:1,kind:'sub_fuma',onHit:(p,t)=>{const H=p.hs2||(p.hs2=new Set());if(p.back&&H.has(t)&&!t.dead){hit(t,p.owner,5,{slow:1.4});say(t,'ENTAILLÉ','#d8dde6');jx({jfx:'sub_cut',ti:units.indexOf(t),x:t.x,y:t.y,t:.4,m:.4})}H.add(t)}})}),
 // --- Ôkashô : poing levé (incantation), puis le sol se fend en cône
 sub_oka:S_('Ôkashô','Poing de chakra qui fend le sol devant soi',8,{hero:'maul',cast:.3,line:{len:215,w:170},ai:RG(170,.6)},(u,a)=>{anim(u,'sub_oka',.55);S('rock',u);S('heavy',u);const c=fwd(u,a,42);
  for(const e of enemies(u)){if(Math.hypot(e.x-c.x,e.y-c.y)<75+e.r)hit(e,u,18,{air:.42,kb:220,fx:c.x,fy:c.y,unblockable:1});else if(dist(u,e)<215+e.r&&angDiff(ang(u,e),a)<.55)hit(e,u,12,{air:.32,unblockable:1})}
  aux.push({type:'sub_crack',x:c.x,y:c.y,a,r:210,t:1.4,m:1.4,team:u.team,n:(c.x*7+c.y*3)|0});jx({jfx:'sub_rocks',x:c.x,y:c.y,a,r:120,t:.8,m:.8});jx({jfx:'sub_flash',x:c.x,y:c.y,r:60,col:u.ch.look.weapon.col||'#ff9ac8',t:.35,m:.35});if(near(c.x,c.y))shake=Math.max(shake,.3)}),
 // --- Lotus primaire : prise au corps à corps (imparable) en deux temps : coup de pied vers le ciel, puis piqué en vrille
 sub_lotus:S_('Lotus primaire','Fonce, envoie la cible en l\'air puis l\'écrase au sol',10,{hero:'anakin',ai:{mode:'gap',min:30,max:215,p:.6}},(u,a,td)=>{const e=pick(u,a,td||200,230);S('dash',u);
  if(!e||dist(u,e)>240){anim(u,'lunge',.3);dash(u,a,140,.16,{dmg:10,kb:200});return}
  const b=ang(u,e),d=Math.max(0,dist(u,e)-(u.r+e.r+4));u.aim=b;anim(u,'lunge',.25);dash(u,b,d,Math.max(.08,d/1100),{end:()=>subLotusKick(u,e,b)})}),
 // --- Bombe fumigène : la bombe vole jusqu'au curseur puis éclate
 sub_smoke:S_('Bombe fumigène','Fumée : ralentit les ennemis, cache les alliés',10,{hero:'lando',ai:RG(380,.45)},(u,a,td)=>{const p=atP(u,a,td,360),tt=.12+dist(u,p)/1400;u.thrT=.2;S('blaster',u);
  jx({jfx:'sub_pellet',x:u.x,y:u.y,x2:p.x,y2:p.y,t:tt,m:tt});
  later(u,tt,()=>{field(u,p.x,p.y,{r:130,t:4.5,slow:1,cloak:1,col:'#a8a8b0',vfx:'smoke'});aux.push({type:'sub_smk',x:p.x,y:p.y,r:130,t:4.5,m:4.5,team:u.team,owner:u,L:[]});S('poof',u);sparks(p.x,p.y,'#c8c8d0',14,'smoke')},{x:p.x,y:p.y})}),
 // --- Multiclonage : 2 clones de l'ombre (même style de combat que le lanceur)
 sub_clones:S_('Multiclonage','Deux clones combattent à tes côtés',15,{hero:'gideon',ai:SELF(450,.6)},(u,a)=>{anim(u,'sub_seal',.45);S('poof',u);const L=[];
  for(const s of[-1,1]){const q=subFree({x:u.x+Math.cos(a+s*1.45)*50,y:u.y+Math.sin(a+s*1.45)*50},16),p=subCarrier(u,q.x,q.y,'sub_clone',{life:6});p.cl={t:5,cd:.35+rnd()*.2,tg:null,rt:0,s};L.push(p);subPoof(q.x,q.y,40,u)}
  aux.push({type:'sub_clones',x:u.x,y:u.y,r:0,t:6,m:6,team:u.team,owner:u,L})}),
 // --- Clone explosif (Bunshin Daibakuha) : un clone court sur la cible et explose ; si on le frappe, il saute tout de suite
 sub_bomb:S_('Clone explosif','Un clone fonce sur l\'ennemi et explose',13,{hero:'luke',ai:RG(480,.55,70)},(u,a,td)=>{anim(u,'sub_seal',.4);S('poof',u);const q=subFree({x:u.x+Math.cos(a)*42,y:u.y+Math.sin(a)*42},16),p=subCarrier(u,q.x,q.y,'sub_clone',{life:4.5,rock:1,ox:a});
  p.cl={t:3.2,tg:pick(u,a,td||300,600),rt:.3,fuse:-1};subPoof(q.x,q.y,36,u);aux.push({type:'sub_bomb',x:q.x,y:q.y,r:0,t:4.5,m:4.5,team:u.team,owner:u,p})}),
 // --- Parchemin explosif : se colle au 1er ennemi touché ; sinon se plante au sol et explose un peu plus vite
 sub_tag:S_('Parchemin explosif','Kunai à parchemin qui se colle puis explose',11,{hero:'han',ai:RG(420,.6,60)},(u,a)=>{u.thrT=.2;S('blaster',u);
  proj(u,a,{spd:780,r:8,dmg:4,life:.55,col:'#f0e0b0',vfx:'kunai',kind:'sub_tagk',onHit:(q,t)=>{if(t.dead)return;t.stick={src:q.owner,ex:false,t:1.2,r:100,dmg:25,stun:.45,sub:1};say(t,'PARCHEMIN !','#ff9a3a');aux.push({type:'sub_tagw',x:t.x,y:t.y,r:100,t:1.6,m:1.6,team:q.owner.team,owner:q.owner,ti:units.indexOf(t),tg:t})}});
  aux.push({type:'sub_tagp',x:u.x,y:u.y,r:0,t:.8,m:.8,team:u.team,owner:u,p:projs[projs.length-1]})}),
 // --- Piège ninja : fil tendu perpendiculaire à la visée, presque invisible pour l'ennemi
 sub_wire:S_('Piège ninja','Fil piégé : volée de kunai et étourdit',10,{hero:'wicket',ai:RG(320,.4,40)},(u,a,td)=>{const p=atP(u,a,clamp(td||200,70,320),320);anim(u,'crouch',.35);S('deflect',u);
  aux.push({type:'sub_wire',x:p.x,y:p.y,a:a+Math.PI/2,len:150,r:75,t:12,m:12,team:u.team,owner:u,arm:.6,n:0})}),
 // --- Genjutsu : Plumes (Nehan Shôja) : somnolence progressive, sommeil rompu par un coup
 sub_feather:S_('Genjutsu : Plumes','Plumes qui endorment ceux qui restent dessous',11,{hero:'cadbane',ai:RG(360,.45)},(u,a,td)=>{const p=atP(u,a,td,360);S('genjutsu',u);anim(u,'sub_seal',.4);
  aux.push({type:'sub_feather',x:p.x,y:p.y,r:120,t:4,m:4,team:u.team,owner:u,k:0,in:{},sl:[]});field(u,p.x,p.y,{r:120,t:4,slow:1,col:'#ff9ab0',vfx:'sub_feather'});jx({jfx:'sub_feathers',x:p.x,y:p.y,r:120,t:4,m:4})}),
 // --- Kunai explosifs : plantés au curseur, explosion puis anneau de 4 parchemins
 sub_kexp:S_('Kunai explosifs','Explose puis projette 4 parchemins en anneau',8,{hero:'rex',ai:RG(400,.55,80)},(u,a,td)=>{const p=atP(u,a,clamp(td||300,80,400),400),tt=.14+dist(u,p)/1300;u.thrT=.2;S('blaster',u);
  jx({jfx:'sub_kthrow',x:u.x,y:u.y,x2:p.x,y2:p.y,t:tt,m:tt});
  later(u,tt,()=>aux.push({type:'sub_planted',x:p.x,y:p.y,r:0,t:.42,m:.42,team:u.team}),{x:p.x,y:p.y});
  const z=subWarn(u,p.x,p.y,70,tt+.4);later(u,tt+.4,()=>{z.done=1;subBoom(u,p.x,p.y,70,14,{kb:220});for(let i=0;i<4;i++){const b=a+.785+i*Math.PI/2,q=subFree({x:p.x+Math.cos(b)*95,y:p.y+Math.sin(b)*95},20);
   jx({jfx:'sub_tagfly',x:p.x,y:p.y,x2:q.x,y2:q.y,t:.36,m:.36});const z2=subWarn(u,q.x,q.y,48,.38);later(u,.38,()=>{z2.done=1;subBoom(u,q.x,q.y,48,8,{})},{x:q.x,y:q.y,vfx:'tag'})}},{x:p.x,y:p.y,vfx:'tag'})}),
 // --- Shôsen : paume médicale sur l'allié le plus blessé
 sub_shosen:S_('Shôsen','Soigne l\'allié le plus blessé puis le régénère',12,{hero:'rey',ai:ALLY},(u)=>{const x=allies(u,420).sort((p,q)=>p.hp/p.max-q.hp/q.max)[0]||u;anim(u,'twohand',.5);S('orb',u);
  const r=gain(x,16,u);x.regenB=Math.max(x.regenB||0,1.5);if(x.dotT>0){x.dotT=0;x.dot=0;say(x,'PURIFIÉ','#cfffcf')}if(r>=1)say(x,'+'+Math.round(r),'#6f9');
  if(x!==u)jx({jfx:'sub_hbeam',ui:units.indexOf(u),ti:units.indexOf(x),x:u.x,y:u.y,t:.5,m:.5});jx({jfx:'sub_hands',ti:units.indexOf(x),x:x.x,y:x.y,t:1.3,m:1.3})}),
 // --- Scalpel de chakra (Chakra no Mesu) : courte ruée + entaille ; ralentit et désarme
 sub_mesu:S_('Scalpel de chakra','Entaille les muscles : ralentit et désarme',8,{hero:'yoda',ai:RG(120,.65)},(u,a)=>{anim(u,'sub_mesu',.4);S('saber',u);
  dash(u,a,70,.09,{end:()=>{VFX='chakra';const n=slash(u,u.aim,96,1.7,10,{slow:1.1,disarm:.8,unblockable:1});VFX=null;jx({jfx:'sub_scalpel',ui:units.indexOf(u),x:u.x,y:u.y,a:u.aim,col:u.ch.look.weapon.col||'#7fe8ff',t:.35,m:.35});
   if(n)for(const e of enemies(u))if(e.disarm>.7&&dist(u,e)<130)jx({jfx:'sub_cut',ti:units.indexOf(e),x:e.x,y:e.y,col:u.ch.look.weapon.col||'#7fe8ff',t:.5,m:.5})}})}),
 // --- Contre du clone : le coup reçu ne touche qu'un clone ; on surgit derrière l'attaquant (contre du moteur)
 // (contre sur mesure, géré par le trait des ninjas sans clan : portée limitée, contrairement au contre du moteur qui téléporte à n'importe quelle distance)
 sub_counter:S_('Contre du clone','Le prochain coup ne frappe qu\'un clone',13,{hero:'luke',ai:DEF},(u)=>{u.sub_ctr=.7;S('deflect',u);anim(u,'guard',.5)}),
 // --- Pilule du soldat (Hyôrôgan)
 sub_pill:S_('Pilule du soldat','Chakra, soin, endurance et se libère',13,{hero:'bossk',ai:HEALM},(u)=>{anim(u,'sub_pill',.6);S('orb',u);const r=gain(u,22,u);u.energy=Math.min(100,u.energy+40);u.stam=100;cleanse(u);u.dotT=0;
  say(u,'+40 CHAKRA','#4ab0ff');if(r>=1)say(u,'+'+Math.round(r),'#6f9');jx({jfx:'sub_pill',ui:units.indexOf(u),x:u.x,y:u.y,t:.9,m:.9})}),
 // --- Concentration du chakra : réduit les recharges des autres jutsu (hors ultime)
 sub_focus:S_('Concentration du chakra','Réduit les recharges des autres jutsu',11,{hero:'luke',ai:SELF(400,.35)},(u)=>{const me=subIdx(u,'sub_focus');for(let i=0;i<5;i++)if(i!==me)u.cds[i]=Math.max(0,u.cds[i]-3);u.energy=Math.min(100,u.energy+15);
  later(u,.01,()=>{u.haste=Math.max(u.haste,1.2)});anim(u,'pray',.55);S('ignite',u);jx({jfx:'sub_focus',ui:units.indexOf(u),x:u.x,y:u.y,col:u.ch.look.weapon.col||'#3af',t:.8,m:.8})}),
 // --- Déplacements
 sub_shunshin:S_('Shunshin','Téléportation dans un tourbillon de feuilles',8,{hero:'palpatine',ai:{mode:'gap',min:120,max:270,p:.5}},(u,a,td)=>{const p=subFree(atP(u,a,clamp(td||260,80,270),270),20);jx({jfx:'sub_leaves',x:u.x,y:u.y,t:.65,m:.65});
  blinkTo(u,p.x,p.y);u.haste=Math.max(u.haste,1.5);for(const e of enemies(u))if(dist(u,e)<80+e.r)hit(e,u,8,{});anim(u,'seal',.35);S('poof',u);jx({jfx:'sub_leaves',x:u.x,y:u.y,t:.65,m:.65,in:1})}),
 sub_kawa:S_('Kawarimi','Substitution : laisse une bûche piégée',8,{hero:'lando',ai:ESC},(u,a,td)=>{const o={x:u.x,y:u.y},p=subFree(atP(u,a,clamp(td||200,60,230),230),20);
  aux.push({type:'sub_log',x:o.x,y:o.y,a:u.aim,r:0,t:.72,m:.72,team:u.team});const z=subWarn(u,o.x,o.y,80,.7);later(u,.7,()=>{z.done=1;subBoom(u,o.x,o.y,80,18,{kb:200,stun:.5})},{x:o.x,y:o.y,vfx:'tag'});
  subPoof(o.x,o.y,44,u);blinkTo(u,p.x,p.y);anim(u,'crouch',.3);subPoof(u.x,u.y,30,u)}),
 sub_jump:S_('Saut ninja','Bondit au curseur, choc à l\'arrivée',6,{hero:'luke',ai:{mode:'gap',min:120,max:300,p:.45}},(u,a,td)=>{S('dash',u);anim(u,'sub_jump',.38);
  dash(u,a,clamp(td||200,60,280),.36,{jump:85,end:()=>{VFX='leaf';aoe(u,u.x,u.y,75,9,{kb:300,quiet:1},'#5aa83a');VFX=null;jx({jfx:'sub_land',x:u.x,y:u.y,r:75,t:.55,m:.55});if(near(u.x,u.y)){S('rock',u);shake=Math.max(shake,.12)}}})}),
 sub_roll:S_('Roulade','Roulade rapide, intouchable au début',5,{hero:'rey',ai:ESC},(u,a)=>{S('dash',u);anim(u,'sub_roll',.26);dash(u,a,175,.22,{});u.phase=Math.max(u.phase||0,.4);
  for(let i=0;i<3;i++)fx.push({x:u.x+Math.cos(a)*i*40,y:u.y+Math.sin(a)*i*40,z:4,vx:(rnd()-.5)*40,vy:(rnd()-.5)*30,t:.5,m:.5,col:'#b8b0a0',r:3+rnd()*2,vfx:'smoke'})}),
 // --- Hiraishin : 1er appui = kunai marqué ; relance (gratuite, 4 s) = téléportation au kunai, ou derrière l'ennemi marqué
 sub_hira:S_('Hiraishin','Kunai marqué ; relance pour s\'y téléporter',10,{hero:'ventress',ai:{mode:'gap',min:100,max:430,p:.5}},(u,a)=>{const i=subIdx(u,'sub_hira'),cd=u.ch.abil[i].cd;
  if(u.jst&&u.jst.key==='sub_hira'){u.jst=null;u.cds[i]=cd;subHiraTp(u);return}
  u.thrT=.2;S('blaster',u);u.sub_hk=null;proj(u,a,{spd:950,r:7,dmg:5,life:.45,col:'#ffe14a',kind:'sub_hkunai',onHit:(p,t)=>{if(!t.dead){p.owner.sub_hk={tg:t,x:t.x,y:t.y};say(t,'MARQUÉ','#ffe14a')}}});
  aux.push({type:'sub_hk',x:u.x,y:u.y,r:0,t:4.2,m:4.2,team:u.team,owner:u,ui:units.indexOf(u),p:projs[projs.length-1],n:0});
  if(u.jst&&u.jst.key!=='sub_hira')u.cds[u.jst.i]=u.jst.cd;u.jst={key:'sub_hira',i,n:1,t:4,cd,v:'hiraishin'};u.cds[i]=.3}),
 sub_grap:S_('Kunai à fil','Se tire jusqu\'au kunai',7,{hero:'padme',ai:{mode:'gap',min:150,max:420,p:.45}},(u,a)=>{u.thrT=.2;S('blaster',u);
  proj(u,a,{spd:980,r:8,dmg:5,life:.44,col:'#d8dde6',hook:3,kind:'sub_wirek',onHit:(p,t)=>{const o=p.owner;if(o.dead||t.dead||o.stun>0||o.root>0)return;const b=Math.atan2(o.y-t.y,o.x-t.x),g2=subFree({x:t.x+Math.cos(b)*(o.r+t.r+4),y:t.y+Math.sin(b)*(o.r+t.r+4)},o.r);
   aux.push({type:'sub_wireln',x:t.x,y:t.y,r:0,t:.3,m:.3,team:o.team,ui:units.indexOf(o)});
   o.dash={sx:o.x,sy:o.y,tx:g2.x,ty:g2.y,t:0,dur:.22,jump:24,hitDone:false,end:()=>{if(!t.dead&&!(o.stun>0)&&dist(o,t)<o.r+t.r+34){hit(t,o,6,{stun:.35,kb:200,unblockable:1});anim(o,'kickup',.3);sparks(t.x,t.y,'#ffffff',8)}}};o.cast=null}});
  aux.push({type:'sub_grapk',x:u.x,y:u.y,r:0,t:.8,m:.8,team:u.team,owner:u,p:projs[projs.length-1]})}),
 // --- Ultimes
 sub_toad:ULT('Invocation : Crapaud','Gamabunta s\'écrase sur la zone',{hero:'wicket',tele:{r:150,max:480},ai:{max:470,p:.8}},(u,a,td)=>{const p=subFree(atP(u,a,td,480),70);anim(u,'summon',.9);S('poof',u);sparks(u.x,u.y,'#eceff4',16,'smoke');
  aux.push({type:'sub_toadsh',x:p.x,y:p.y,r:150,t:1,m:1,team:u.team});jx({jfx:'sub_toadfall',x:p.x,y:p.y,r:150,t:1,m:1});const z=subWarn(u,p.x,p.y,150,1,'smoke');
  later(u,1,()=>{z.done=1;VFX='smoke';aoe(u,p.x,p.y,150,32,{stun:.9,kb:320,unblockable:1,quiet:1},'#c0582a');VFX=null;field(u,p.x,p.y,{r:150,t:4,slow:1,col:'#6a5038',vfx:'sub_mud'});
   const c=subCarrier(u,p.x,p.y,'sub_toad',{life:3.2,r:62});aux.push({type:'sub_toad',x:p.x,y:p.y,r:72,t:3.2,m:3.2,team:u.team,owner:u,p:c});
   jx({jfx:'sub_quake',x:p.x,y:p.y,r:170,t:.7,m:.7});sparks(p.x,p.y,'#8a6a48',18,'earth');if(near(p.x,p.y)){S('boom',u);S('heavy',u);shake=Math.max(shake,.5)}},{x:p.x,y:p.y,vfx:'smoke'})}),
 sub_rain:ULT('Pluie de parchemins','Nuée de parchemins explosifs',{hero:'rex',tele:{r:175,max:500},ai:{max:480,p:.8}},(u,a,td)=>{const p=atP(u,a,td,500);anim(u,'throw2',.5);S('blaster',u);
  jx({jfx:'sub_tags',x:p.x,y:p.y,r:175,t:1.45,m:1.45});
  [[.9,0,70,22],[1.15,60,125,18],[1.4,115,175,15]].forEach(([dl,r0,r1,dm],w)=>{const z=subWarn(u,p.x,p.y,r1,dl);later(u,dl,()=>{z.done=1;VFX='tag';ringHit(u,p.x,p.y,r0,r1,dm,{kb:140});VFX=null;const n=w?w*6+2:1;
   for(let i=0;i<n;i++){const b=i/n*Math.PI*2+w*.5,d=(r0+r1)/2;detoFx(p.x+Math.cos(b)*d,p.y+Math.sin(b)*d*.9,w?44:62,'sub_boom')}if(near(p.x,p.y)){S('boom',u);shake=Math.max(shake,.22)}},{x:p.x,y:p.y,vfx:'tag'})})}),
 // --- Mode Ermite : rassembler l'énergie naturelle demande de rester concentré (0,6 s, interrompu par un étourdissement ou un recul)
 sub_sage:ULT('Mode Ermite','Énergie naturelle : dégâts, vitesse, chakra illimité',{hero:'yoda',cast:.6,ai:{mode:'self',max:340,p:.8}},(u)=>{const d=4;u.rage=Math.max(u.rage,d);u.haste=Math.max(u.haste,d);u.sub_sage=d;u.energy=100;gain(u,12,u);anim(u,'sub_sage',.5);S('ignite',u);
  aux.push({type:'sub_sage',x:u.x,y:u.y,r:0,t:d,m:d,team:u.team,owner:u});jx({jfx:'sub_sagein',ui:units.indexOf(u),x:u.x,y:u.y,t:1,m:1})}),
 sub_katsu:ULT('Invocation : Katsuyu','Limaces de soin sur les alliés proches',{hero:'r2',ai:{mode:'ally',p:.8}},(u)=>{anim(u,'summon',.8);S('water',u);jx({jfx:'sub_katsu',ui:units.indexOf(u),x:u.x,y:u.y,a:u.aim,t:1.8,m:1.8});
  const L=allies(u,450);for(const x of L){const r=gain(x,14,u);x.regenB=Math.max(x.regenB||0,2.5);x.energy=Math.min(100,x.energy+15);x.sub_slug=2.5;if(r>=1)say(x,'+'+Math.round(r),'#6f9');jx({jfx:'sub_slugjump',ui:units.indexOf(u),ti:units.indexOf(x),x:x.x,y:x.y,t:.6,m:.6})}
  aux.push({type:'sub_slugs',x:u.x,y:u.y,r:0,t:2.5,m:2.5,team:u.team,owner:u,L})}),
});
Object.assign(NATHERO,{sub:'luke'});
AFTER.push(()=>UK.push('sub_sage','sub_slug','sub_nd','sub_ctr'));
// ---------- logique des objets (hôte) ----------
// Rasengan : 1 = ruée ; 2 = la cible est broyée (2 petits coups) puis projetée ; sans contact, la sphère éclate au bout de la ruée
AUXF.sub_rasen=(x,dt)=>{const u=x.owner;if(!u||u.dead){x.t=0;return}
 if(x.ph===1){x.x=u.x;x.y=u.y;
  for(const e of enemies(u))if(dist(u,e)<u.r+e.r+14+x.big*8&&!(e.phase>0)){x.tg=e;x.ti=units.indexOf(e);x.ph=2;x.k=0;x.n=0;u.dash=null;u.z=0;x.t=.6;jx({jfx:'sub_rasdrill',ti:x.ti,ui:x.ui,x:e.x,y:e.y,t:.45,m:.45,big:x.big});if(near(u.x,u.y))shake=Math.max(shake,.15);return}
  if(!u.dash){x.ph=3;x.t=Math.min(x.t,.3);const p=fwd(u,x.a,26);VFX='rasengan';aoe(u,p.x,p.y,70+x.big*25,9+x.big*5,{kb:260,quiet:1},'#7fc8ff');VFX=null;jx({jfx:'sub_rasboom',x:p.x,y:p.y,r:55+x.big*30,t:.45,m:.45})}return}
 if(x.ph!==2)return;const e=x.tg;if(!e||e.dead){x.t=0;return}
 // lanceur étourdi (un allié de la cible l'a frappé) ou cible inarrêtable qui s'échappe : la sphère se dissipe
 if(u.stun>0||dist(u,e)>u.r+e.r+45){x.ph=3;x.t=.05;jx({jfx:'sub_rasboom',x:u.x+Math.cos(x.a)*20,y:u.y+Math.sin(x.a)*20,r:30+x.big*15,t:.35,m:.35});say(u,'DISSIPÉ','#7fc8ff');return}
 u.root=Math.max(u.root,.1);u.kx=u.ky=0;
 if(e.unstop<=0){const b=x.a;e.x=u.x+Math.cos(b)*(u.r+e.r+3);e.y=u.y+Math.sin(b)*(u.r+e.r+3);e.kx=e.ky=0;collide(e)}
 if(x.k<=0&&x.n<2){x.k=.14;x.n++;VFX='rasengan';hit(e,u,5+x.big*2,{unblockable:1,stun:.3,fx:u.x,fy:u.y});VFX=null;return}
 if(x.n>=2&&x.k<=0){VFX='rasengan';hit(e,u,18+x.big*8,{unblockable:1,kb:900+x.big*250,air:.45,wall:.8,fx:u.x,fy:u.y});if(x.big)for(const o of enemies(u))if(o!==e&&dist(o,e)<90+o.r)hit(o,u,10,{kb:400,fx:e.x,fy:e.y});VFX=null;jx({jfx:'sub_rasboom',x:e.x,y:e.y,r:80+x.big*40,t:.55,m:.55,big:1});
  if(near(e.x,e.y)){S('boom',u);shake=Math.max(shake,.35)}x.ph=3;x.t=.05}};
// Lotus : coup de pied qui envoie en l'air, saut avec la cible, piqué en vrille
function subLotusKick(u,e,b){if(u.dead||e.dead||dist(u,e)>u.r+e.r+34){S('dash',u);return}VFX='gate';const ok=hit(e,u,8,{air:.55,unblockable:1,fx:u.x,fy:u.y});VFX=null;
 anim(u,'sub_lotus',.62);S('heavy',u);if(!ok||e.unstop>0||u.stun>0)return; // esquive, contre, intangible : la prise rate
 aux.push({type:'sub_lotus',x:e.x,y:e.y,a:b,r:0,t:.6,m:.6,team:u.team,owner:u,tg:e,ui:units.indexOf(u),ti:units.indexOf(e)});jx({jfx:'sub_bandage',ti:units.indexOf(e),ui:units.indexOf(u),x:e.x,y:e.y,t:.5,m:.5});
 dash(u,b,0,.46,{jump:70,end:()=>{const x=aux.find(o=>o.type==='sub_lotus'&&o.owner===u);if(x)x.t=0;if(e.dead||u.stun>0||dist(u,e)>u.r+e.r+40)return;
  VFX='gate';hit(e,u,18,{stun:.45,unblockable:1});for(const o of enemies(u))if(o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<85+o.r)hit(o,u,8,{kb:180,fx:e.x,fy:e.y});VFX=null;
  aux.push({type:'sub_crack',x:e.x,y:e.y,a:b,r:110,t:1.1,m:1.1,team:u.team,n:(e.x*3+e.y*7)|0,kind:'ring'});jx({jfx:'sub_quake',x:e.x,y:e.y,r:90,t:.5,m:.5});if(near(e.x,e.y)){S('rock',u);shake=Math.max(shake,.32)}}})}
AUXF.sub_lotus=x=>{const u=x.owner,e=x.tg;if(!u||u.dead||!e||e.dead||u.stun>0){x.t=0;return}e.x=u.x+Math.cos(x.a)*26;e.y=u.y+Math.sin(x.a)*26;e.kx=e.ky=0;collide(e);x.x=e.x;x.y=e.y};
// clones : ciblent l'ennemi le plus proche ; ils frappent au corps à corps (comme tout style) ; un tir ou un coup ennemi les dissipe
AUXF.sub_clones=(x,dt)=>{const u=x.owner;x.x=u.x;x.y=u.y;const ml=meleeU(u),sp=u.ch.spd*1.08*(u.haste>0?1.3:1);
 for(const p of x.L){if(p.life<=0)continue;const c=p.cl;c.t-=dt;
  if(u.dead||c.t<=0){p.life=0;subPoof(p.x,p.y,34,u);continue}
  let gone=false;for(const q of projs)if(q!==p&&q.life>0&&!q.grenade&&q.owner&&q.owner.team!==u.team&&Math.abs(q.x-p.x)<40&&Math.hypot(q.x-p.x,q.y-p.y)<q.r+15){if(!(q.big||q.rocket||q.pierce||q.dmg>20)){q.life=0;q.dead=1}gone=true;break}
  if(!gone)for(const e of enemies(u))if(e.swing>.1&&Math.hypot(e.x-p.x,e.y-p.y)<95&&angDiff(e.swingA,Math.atan2(p.y-e.y,p.x-e.x))<1.1){gone=true;break}
  if(gone){p.life=0;subPoof(p.x,p.y,34,u);continue}
  if((c.rt-=dt)<=0){c.rt=.3;c.tg=subNearE(u,p.x,p.y,650)}const e=c.tg&&!c.tg.dead?c.tg:null;let mx=0,my=0;
  if(e){const d=Math.hypot(e.x-p.x,e.y-p.y),b=Math.atan2(e.y-p.y,e.x-p.x);p.ox=b;
   // corps à corps : chaque clone prend un flanc de la cible (à ~110° du lanceur) et le contourne au lieu de passer devant elle
   if(ml){const bc=u.dead?b+Math.PI:Math.atan2(u.y-e.y,u.x-e.x),fa=bc+c.s*1.95,R=e.r+18,ap=Math.atan2(p.y-e.y,p.x-e.x);let tx=e.x+Math.cos(fa)*R,ty=e.y+Math.sin(fa)*R;
    if(d<R+45){const da=Math.atan2(Math.sin(fa-ap),Math.cos(fa-ap));if(Math.abs(da)>.4){const st=ap+Math.sign(da)*.65;tx=e.x+Math.cos(st)*R;ty=e.y+Math.sin(st)*R}}
    const gd=Math.hypot(tx-p.x,ty-p.y);if(gd>6){const h=Math.atan2(ty-p.y,tx-p.x),k=Math.min(1,gd/20);mx=Math.cos(h)*k;my=Math.sin(h)*k}
    if(d<e.r+34&&(c.cd-=dt)<=0){c.cd=.6;p.spear++;hit(e,u,3,{fx:p.x,fy:p.y,kb:70,unblockable:1})}}
   else{const du=Math.hypot(u.x-p.x,u.y-p.y),bu=Math.atan2(u.y-p.y,u.x-p.x);if((c.sw=(c.sw||1)-dt)<=0){c.sw=.8+rnd()*.7;c.s=-c.s}
    if(d>320){mx=Math.cos(b);my=Math.sin(b)}else if(d<200){mx=-Math.cos(b);my=-Math.sin(b)}else if(du>170){mx=Math.cos(bu);my=Math.sin(bu)}else{mx=Math.cos(b+c.s*1.57)*.55;my=Math.sin(b+c.s*1.57)*.55}
    if((c.cd-=dt)<=0&&d<460){c.cd=.85;p.spear++;S('blaster',p);projs.push({x:p.x+Math.cos(b)*18,y:p.y+Math.sin(b)*18,vx:Math.cos(b)*820,vy:Math.sin(b)*820,owner:u,src:u,rot:0,r:5,dmg:4,life:.6,life0:.6,col:'#d8dde6',vfx:'kunai',ex:false,basic:false,hitSet:null})}}}
  else{const d=Math.hypot(u.x-p.x,u.y-p.y);if(d>90){const b=Math.atan2(u.y-p.y,u.x-p.x);mx=Math.cos(b);my=Math.sin(b);p.ox=b}}
  for(const o of x.L)if(o!==p&&o.life>0){const dx=p.x-o.x,dy=p.y-o.y,dd=Math.hypot(dx,dy);if(dd<30&&dd>.1){p.x+=dx/dd*(30-dd)*.5;p.y+=dy/dd*(30-dd)*.5}}
  p.x+=mx*sp*dt;p.y+=my*sp*dt;subFree(p,16);p.zapP=Math.hypot(mx,my)>.15?1:0}
 x.L=x.L.filter(p=>p.life>0);if(!x.L.length)x.t=0};
// clone explosif : court vers la cible ; contact, coup reçu ou fin de course = mèche courte puis explosion
AUXF.sub_bomb=(x,dt)=>{const u=x.owner,p=x.p;if(!p||p.life<=0){x.t=0;return}const c=p.cl;x.x=p.x;x.y=p.y;
 if(u.dead){p.life=0;subPoof(p.x,p.y,30,u);x.t=0;return}
 if(c.fuse>=0){c.fuse-=dt;if(c.fuse<=0){p.life=0;x.t=0;subBoom(u,p.x,p.y,90,20,{kb:320,stun:.25});subPoof(p.x,p.y,46,u)}return}
 c.t-=dt;let hitBy=false;
 for(const q of projs)if(q!==p&&q.life>0&&!q.grenade&&q.owner&&q.owner.team!==u.team&&Math.abs(q.x-p.x)<40&&Math.hypot(q.x-p.x,q.y-p.y)<q.r+15){if(!(q.big||q.rocket||q.pierce||q.dmg>20)){q.life=0;q.dead=1}hitBy=true;break}
 if(!hitBy)for(const e of enemies(u))if(e.swing>.1&&Math.hypot(e.x-p.x,e.y-p.y)<95&&angDiff(e.swingA,Math.atan2(p.y-e.y,p.x-e.x))<1.1){hitBy=true;break}
 if((c.rt-=dt)<=0){c.rt=.3;if(!c.tg||c.tg.dead||(c.tg.stealth>0&&Math.hypot(c.tg.x-p.x,c.tg.y-p.y)>140))c.tg=subNearE(u,p.x,p.y,700)}const e=c.tg&&!c.tg.dead?c.tg:null;
 if(hitBy||c.t<=0||(e&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+24)){c.fuse=hitBy?.1:.22;p.zapP=2;S('blaster',p);return}
 if(e){const b=Math.atan2(e.y-p.y,e.x-p.x),sp=u.ch.spd*1.25;p.ox=b;p.x+=Math.cos(b)*sp*dt;p.y+=Math.sin(b)*sp*dt;subFree(p,16);p.zapP=1}else p.zapP=0};
// parchemin explosif : explosion visuelle quand la charge collée saute ; si le kunai rate, il se plante au sol
AUXF.sub_tagw=x=>{const t=x.tg;
 // victime tuée avant l'explosion : le parchemin saute quand même sur son corps (le moteur ne fait pas exploser les charges des morts)
 if(t&&t.dead&&t.stick&&t.stick.sub){const k=t.stick;t.stick=null;VFX='tag';aoe(k.src,t.x,t.y,k.r,k.dmg,{stun:k.stun,unblockable:1},'#ff9a3a');VFX=null;if(near(t.x,t.y))S('boom',t)}
 if(!t||t.dead||!t.stick){if(!x.done){x.done=1;detoFx(x.x,x.y,100,'sub_boom');if(near(x.x,x.y))shake=Math.max(shake,.3)}x.t=0;return}x.x=t.x;x.y=t.y};
AUXF.sub_tagp=x=>{const p=x.p;if(!p){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.t=0;if(p.hitAny)return;const u=x.owner,q=subFree({x:p.x,y:p.y},10);
 aux.push({type:'sub_planted',x:q.x,y:q.y,r:0,t:.9,m:.9,team:u.team});const z=subWarn(u,q.x,q.y,100,.9);later(u,.9,()=>{z.done=1;subBoom(u,q.x,q.y,100,21,{stun:.35,kb:200})},{x:q.x,y:q.y,vfx:'tag'})};
// fil piégé : un ennemi qui croise le segment le déclenche
AUXF.sub_wire=(x,dt)=>{if(x.n)return;x.arm-=dt;if(x.arm>0)return;const u=x.owner,ca=Math.cos(x.a),sa=Math.sin(x.a),h=x.len/2;
 for(const e of enemies(u)){const f=clamp((e.x-x.x)*ca+(e.y-x.y)*sa,-h,h),px=x.x+ca*f,py=x.y+sa*f;if(Math.hypot(e.x-px,e.y-py)<e.r+5){x.n=1;x.t=.7;x.m=.7;
  VFX='steel';hit(e,u,14,{stun:.6,unblockable:1});VFX=null;jx({jfx:'sub_volley',ti:units.indexOf(e),x:e.x,y:e.y,x1:x.x-ca*h,y1:x.y-sa*h,x2:x.x+ca*h,y2:x.y+sa*h,t:.45,m:.45});S('saber',e);S('hit',e);break}}};
// plumes : somnolence qui monte en restant dessous, sommeil, réveil si on prend un coup
// réveil : 12 dégâts subis (cumulés) le réveillent en sursaut (0,3 s d'hébétude) ; un étourdissement plus long appliqué entre-temps remplace le sommeil
function subWake(L){for(const s of L)if(!s.done){const e=s.e;if(e.dead||e.stun<=0){s.done=1;continue}
 if(s.st!=null&&e.stun>s.st+.005){s.done=1;e.sleepT=0;continue}s.st=e.stun;
 if(s.hp-e.hp>=12){s.done=1;e.stun=Math.min(e.stun,.3);e.sleepT=0;say(e,'RÉVEILLÉ','#ffd8e8')}}}
AUXF.sub_sleepw=x=>{subWake(x.sl)};
AUXF.sub_feather=x=>{const u=x.owner;subWake(x.sl);if(x.t<=0&&x.sl.some(s=>!s.done))aux.push({type:'sub_sleepw',x:x.x,y:x.y,r:0,t:1.5,m:1.5,team:x.team,sl:x.sl});
 if(x.k>0)return;x.k=.25;for(const e of enemies(u)){const key=e.c+e.team,ins=Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r;let v=x.in[key]||0;if(v<0)continue;
  if(ins&&e.unstop<=0){v+=.25;e.sleepT=Math.max(e.sleepT,v);if(v>=1.2){v=-1;e.stun=Math.max(e.stun,1.4);e.sleepT=-1.6;e.cast=null;say(e,'ENDORMI','#ffd8e8');x.sl.push({e,hp:e.hp})}}else v=Math.max(0,v-.15);x.in[key]=v}};
// Contre du clone : le coup est annulé (seul un clone est touché, il part en fumée) ; attaquant à moins de 300 px : on surgit derrière lui
// et on le frappe (14, étourdit 0,25 s) ; plus loin : simple substitution, un bond de côté. Bref état intangible pour ne pas encaisser la suite de la rafale.
function subCounter(u,e){const ox=u.x,oy=u.y,ui=units.indexOf(u),d=dist(u,e);subPoof(ox,oy,40,u);jx({jfx:'sub_cghost',ui,x:ox,y:oy,t:.45,m:.45});u.phase=Math.max(u.phase||0,.15);u.dash=null;u.cast=null;u.kx=u.ky=0;
 if(d<300){const b=ang(e,u)+Math.PI,q=subFree({x:e.x+Math.cos(b)*(e.r+u.r+6),y:e.y+Math.sin(b)*(e.r+u.r+6)},u.r);u.x=q.x;u.y=q.y;collide(u);u.aim=ang(u,e);u.swing=.18;u.swingA=u.aim;say(u,'CONTRE !','#3f3');S('deflect',u);
  hit(e,u,14,{stun:.25,unblockable:1});jx({jfx:'sub_slash',ui,x:u.x,y:u.y,a:u.aim,t:.3,m:.3})}
 else{const b=ang(e,u)+(rnd()<.5?1.57:-1.57),q=subFree({x:u.x+Math.cos(b)*90,y:u.y+Math.sin(b)*90},u.r);u.x=q.x;u.y=q.y;collide(u);say(u,'SUBSTITUTION','#3f3');S('poof',u)}
 subPoof(u.x,u.y,28,u)}
// Hiraishin : suit le kunai ; planté au sol s'il ne touche personne
AUXF.sub_hk=x=>{const u=x.owner;if(u.dead||!u.jst||u.jst.key!=='sub_hira'){if(u.sub_hk&&!u.jst)u.sub_hk=null;x.t=0;return}const p=x.p,m=u.sub_hk;
 if(m&&m.tg){if(m.tg.dead){u.sub_hk={x:m.tg.x,y:m.tg.y};x.ti=undefined;x.n=1}else{x.ti=units.indexOf(m.tg);x.n=2;x.x=m.tg.x;x.y=m.tg.y;m.x=m.tg.x;m.y=m.tg.y}return}
 if(m){x.n=1;x.x=m.x;x.y=m.y;return}if(p&&!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}if(p&&!p.hitAny){const q=subFree({x:p.x,y:p.y},10);u.sub_hk={x:q.x,y:q.y};x.x=q.x;x.y=q.y;x.n=1}};
function subHiraTp(u){let m=u.sub_hk;u.sub_hk=null;const L=aux.filter(o=>o.type==='sub_hk'&&o.owner===u);
 if(!m){const p=L.length&&L[0].p;if(p&&!p.dead&&p.life>0){m={x:p.x,y:p.y};p.life=0}}for(const o of L)o.t=0;if(!m)return;
 const o={x:u.x,y:u.y};S('zap',u);
 if(m.tg&&!m.tg.dead){const e=m.tg,b=ang(u,e),q=subFree({x:e.x+Math.cos(b)*(u.r+e.r+8),y:e.y+Math.sin(b)*(u.r+e.r+8)},u.r);u.x=q.x;u.y=q.y;collide(u);u.aim=ang(u,e);u.swing=.18;u.swingA=u.aim;
  hit(e,u,7,{stun:.2,unblockable:1});S('saber',u);jx({jfx:'sub_slash',ui:units.indexOf(u),x:u.x,y:u.y,a:u.aim,col:'#ffe14a',t:.3,m:.3})}
 else{const q=subFree({x:m.x,y:m.y},u.r);u.x=q.x;u.y=q.y;collide(u)}
 u.dash=null;u.kx=u.ky=0;jx({jfx:'sub_hira',x:o.x,y:o.y,x2:u.x,y2:u.y,t:.5,m:.5})}
// Gamabunta : rempart (repousse les ennemis, arrête leurs tirs) puis disparaît dans un nuage
AUXF.sub_toad=x=>{const c=x.p;if(!c||c.life<=0){x.t=0;return}if(c.life>x.t+.05)c.life=x.t+.05;if(c.life<.06&&!x.done){x.done=1;subPoof(x.x,x.y,110,x.owner);return}
 for(const e of enemies(x.owner)){const d=Math.hypot(e.x-x.x,e.y-x.y),m=x.r+e.r;if(d<m&&e.unstop<=0){const b=d>1?Math.atan2(e.y-x.y,e.x-x.x):rnd()*7;e.x=x.x+Math.cos(b)*m;e.y=x.y+Math.sin(b)*m;collide(e)}}
 for(const q of projs)if(q!==c&&q.life>0&&!q.grenade&&q.owner&&q.owner.team!==x.team&&Math.hypot(q.x-x.x,q.y-x.y)<x.r){q.life=0;q.dead=1;if(near(q.x,q.y))sparks(q.x,q.y,'#c0582a',5)}};
// Mode Ermite : chakra maintenu au maximum
AUXF.sub_sage=(x,dt)=>{const u=x.owner;if(u.dead){x.t=0;u.sub_sage=0;return}x.x=u.x;x.y=u.y;u.energy=100;u.sub_sage=Math.max(0,x.t)};
// kunai à fil manqué : il se plante, le fil se tend et tire le lanceur (sauf s'il est étourdi, entravé ou déjà en mouvement)
AUXF.sub_grapk=x=>{const p=x.p,o=x.owner;if(!p){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.t=0;if(p.hitAny||!o||o.dead||o!==p.owner||o.stun>0||o.root>0||o.dash)return;
 const q=subFree({x:p.x,y:p.y},o.r);aux.push({type:'sub_wireln',x:q.x,y:q.y,r:0,t:.26,m:.26,team:o.team,ui:units.indexOf(o)});o.dash={sx:o.x,sy:o.y,tx:q.x,ty:q.y,t:0,dur:.25,jump:20};o.cast=null};
// bombe fumigène : le nuage est dessiné par 4 porteurs (bandes de profondeur) triés avec les ninjas ;
// un porteur détruit avant la fin (dôme, dévoreur de projectiles…) est recréé (au plus toutes les 0,5 s) ; leur durée reste calée sur la fumée (champ qui ralentit le temps)
AUXF.sub_smk=(x,dt)=>{x.rk=(x.rk||0)-dt;let made=0;for(let b=0;b<4;b++){const c=x.L[b];if(c&&c.life>0&&!c.dead){c.life=Math.max(.001,x.t);continue}if(x.t<=.05||(c&&x.rk>0))continue;
 x.L[b]=subCarrier(x.owner,x.x,x.y+(b-1.5)*x.r*.4,'sub_smoke',{life:x.t,r:.5,ar:x.r,oy:x.y,ox:b,spear:x.m});made=1}if(made)x.rk=.5};
AUXF.sub_wireln=()=>{};AUXF.sub_planted=()=>{};AUXF.sub_log=()=>{};AUXF.sub_crack=()=>{};AUXF.sub_toadsh=()=>{};
// limaces de Katsuyu posées sur les alliés : décompte
AUXF.sub_slugs=x=>{for(const a of x.L)a.sub_slug=a.dead?0:Math.max(0,x.t)};
// ---------- trait des ninjas sans clan ----------
TRAITS[-1]={nom:'Nindô',desc:'Une fois (se recharge au-dessus de 90 % PV) : sous 30 % de PV, récupère 30 chakra et court plus vite 1,5 s',
 init(u){u.sub_nd=0},
 // Contre du clone (jutsu des ninjas sans clan) : un coup ennemi non silencieux pendant la fenêtre est annulé
 take(t,src,dmg,o){if(t.sub_ctr>0&&src&&src!==t&&!src.dead&&!o.silent&&src.team!==t.team){t.sub_ctr=0;subCounter(t,src);return -1}return dmg},
 hud(u,x,y){const r=!u.sub_nd;g.fillStyle=r?'#ff9a3a':'#5a4a3a';g.beginPath();g.moveTo(x+5,y-9);g.quadraticCurveTo(x+12,y-2,x+5,y+2);g.quadraticCurveTo(x-2,y-2,x+5,y-9);g.fill();text('Nindô'+(r?' : prêt (sous 30 % PV)':' : utilisé'),x+14,y,11,r?'#ffcf9a':'#8a7a6a','left','normal')},
 update(u,dt){if(u.sub_ctr>0)u.sub_ctr=Math.max(0,u.sub_ctr-dt);if(u.sub_nd&&u.hp>=u.max*.9)u.sub_nd=0;if(!u.sub_nd&&u.hp>0&&u.hp<u.max*.3){u.sub_nd=1;u.energy=Math.min(100,u.energy+30);u.haste=Math.max(u.haste,1.5);say(u,'NINDÔ !','#ff9a3a');jx({jfx:'sub_nindo',ui:units.indexOf(u),x:u.x,y:u.y,t:.9,m:.9});S('ignite',u)}}};
// ---------- visuels ----------
const SUBK=['#1a0e08','#140c08'];
// petite sphère de Rasengan (pendant l'incantation)
function subSphere(x,y,R,t,a){g.save();g.globalCompositeOperation='lighter';circ(x,y,R*2,rgba('#3a8aff',.16*a));circ(x,y,R*1.2,rgba('#5aa8ff',.4*a));circ(x,y,R*.5,rgba('#e8f6ff',.85*a));
 for(let i=0;i<3;i++){g.strokeStyle=rgba(i%2?'#bfe6ff':'#ffffff',.85*a);g.lineWidth=1.6;g.beginPath();g.ellipse(x,y,R*(.75+i*.2),R*(.4+i*.13),t*14+i*1.1,0,4);g.stroke()}
 g.strokeStyle=rgba('#7fc8ff',.7*a);g.lineWidth=1.2;for(let i=0;i<4;i++){const b=-t*9+i*1.57;g.beginPath();g.moveTo(x+Math.cos(b)*R*1.7,y+Math.sin(b)*R*1.1);g.quadraticCurveTo(x+Math.cos(b+.8)*R*1.2,y+Math.sin(b+.8)*R*.8,x+Math.cos(b+1.4)*R*.5,y+Math.sin(b+1.4)*R*.35);g.stroke()}g.restore()}
STATD.push((u,p,S,sk)=>{if(u.dead)return;const t=performance.now()/1000;
 if(u.cast){const ab=castAb(u,u.cast),k=Math.min(1,u.cast.t/u.cast.dur);
  if(ab&&ab.key==='sub_rasen'){if(!u.anim||u.anim.k!=='sub_rasw')u.anim={k:'sub_rasw',t:.4,m:.4};const q=P(u.x+Math.cos(u.aim)*15,u.y+Math.sin(u.aim)*15,31);subSphere(q.x,q.y,(4+10*k)*q.s,t,.55+.45*k)}
  if(ab&&ab.key==='sub_sage'){if(!u.anim||u.anim.k!=='sub_sagew')u.anim={k:'sub_sagew',t:.7,m:.7};g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#8ad05a',.35+.4*k);g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,(64-38*k)*S,(24-14*k)*S,0,0,7);g.stroke();
   for(let i=0;i<12;i++){const c=(t*1.3+i/12)%1,b=i*.52+t*1.6,r=(78-66*c)*S,x=p.x+Math.cos(b)*r,y=p.y-(6+c*34)*S*(sk||1)+Math.sin(b)*r*.35;circ(x,y,(1.6+c*2.4)*S,rgba(i%2?'#8ad05a':'#e8a020',.85*c))}g.restore()}
  if(ab&&ab.key==='sub_oka'){if(!u.anim||u.anim.k!=='sub_okaw')u.anim={k:'sub_okaw',t:.45,m:.45};const c=u.ch.look.weapon.col||'#ff9ac8',q=P(u.x+Math.cos(u.aim)*5,u.y+Math.sin(u.aim)*5,78+14*k);g.save();g.globalCompositeOperation='lighter';circ(q.x,q.y,(7+7*k)*q.s,rgba(c,.35));circ(q.x,q.y,(3+3*k)*q.s,'rgba(255,255,255,.85)');
   for(let i=0;i<5;i++){const b=t*9+i*1.26;g.strokeStyle=rgba(c,.7);g.lineWidth=1.5;g.beginPath();g.moveTo(q.x+Math.cos(b)*6*q.s,q.y+Math.sin(b)*6*q.s);g.lineTo(q.x+Math.cos(b)*(12+8*k)*q.s,q.y+Math.sin(b)*(12+8*k)*q.s);g.stroke()}g.restore()}}
 // contre préparé : deux images du clone tremblent autour du ninja
 if(u.sub_ctr>0){g.save();g.strokeStyle=rgba('#7dff8a',.75);g.lineWidth=2;g.setLineDash([4,4]);g.lineDashOffset=-t*30;g.beginPath();g.ellipse(p.x,p.y,30*S/1.3,11*S/1.3,0,0,7);g.stroke();g.setLineDash([]);
  if(N3.ok&&N3.tile.get(u)){const o=Math.sin(t*30)*5*S;g.globalAlpha=.24;drawChar3(u,p.x-7*S+o,p.y,S);drawChar3(u,p.x+7*S-o,p.y,S)}g.restore()}
 // Mode Ermite : énergie naturelle qui tourne et monte, pigments orange
 if(u.sub_sage>0){const sk2=sk||1;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const b=t*2.4+i*.9,h=((t*.7+i/7)%1),x=p.x+Math.cos(b)*20*S,y=p.y-(8+h*70)*S*sk2;circ(x,y,(3.2-h*2)*S,rgba(i%2?'#8ad05a':'#e8a020',.75*(1-h)))}
  g.strokeStyle=rgba('#e8a020',.5+.2*Math.sin(t*6));g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,24*S,9*S,0,0,7);g.stroke();g.restore()}
 // limace de Katsuyu posée sur l'épaule
 if(u.sub_slug>0){const q={x:p.x-9*S,y:p.y-62*S*(sk||1)},w=Math.sin(t*4)*1.5*S;g.fillStyle='#e8eef8';g.strokeStyle=SUBK[0];g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,7*S+w*.3,4*S,0,0,7);g.fill();g.stroke();
  g.fillStyle='#4a6aa8';g.fillRect(q.x-5*S,q.y-1.4*S,10*S,1.6*S);g.strokeStyle='#e8eef8';g.lineWidth=1;g.beginPath();g.moveTo(q.x+5*S,q.y-2*S);g.lineTo(q.x+8*S,q.y-7*S+w);g.moveTo(q.x+3*S,q.y-2*S);g.lineTo(q.x+5*S,q.y-7*S-w);g.stroke()}});
// --- projectiles
PROJD.sub_fuma=(p,R,ra,t)=>{const L=R*1.85;g.scale(1,.6);g.fillStyle='rgba(210,214,222,.2)';g.beginPath();g.arc(0,0,L*1.02,0,7);g.fill();g.rotate(t/26);
 for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle='#dfe2e8';g.beginPath();g.moveTo(0,-L*.2);g.quadraticCurveTo(L*.55,-L*.34,L,-L*.04);g.quadraticCurveTo(L*.5,L*.04,L*.16,L*.22);g.closePath();g.fill();g.strokeStyle='#3a3f48';g.lineWidth=1.6;g.stroke();
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1;g.beginPath();g.moveTo(L*.22,-L*.17);g.quadraticCurveTo(L*.55,-L*.27,L*.9,-L*.07);g.stroke()}
 circ(0,0,L*.27,'#2e3038');circ(0,0,L*.13,'#a8aeb8')};
const subKunai=(L,col)=>{g.fillStyle='#34343c';g.fillRect(-L*.62,-1.5,L*.55,3);g.strokeStyle='#34343c';g.lineWidth=1.2;g.beginPath();g.arc(-L*.72,0,2.4,0,7);g.stroke();g.fillStyle=col||'#d8dde6';g.beginPath();g.moveTo(-L*.1,-4);g.lineTo(L*.62,0);g.lineTo(-L*.1,4);g.closePath();g.fill();g.strokeStyle='rgba(20,12,8,.6)';g.lineWidth=.8;g.stroke()};
PROJD.sub_tagk=(p,R,ra,t)=>{g.rotate(ra);const w=Math.sin(t/38)*3;g.fillStyle='#f0e0b0';g.beginPath();g.moveTo(-9,-2.5);g.lineTo(-26,-6+w);g.lineTo(-27,4+w);g.lineTo(-9,3);g.closePath();g.fill();
 g.strokeStyle='#c0302a';g.lineWidth=1.4;g.beginPath();g.moveTo(-13,-1);g.lineTo(-22,w*.6);g.moveTo(-17,-3.5+w*.4);g.lineTo(-18,3+w*.6);g.stroke();subKunai(20);if((t/45|0)%2)circ(-27,w,2.6,'#ffd36a')};
PROJD.sub_hkunai=(p,R,ra,t)=>{g.rotate(ra);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe14a',.5);g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-34,0);g.lineTo(-8,0);g.stroke();g.restore();
 g.fillStyle='#f4f4f0';g.fillRect(-15,-2.2,9,4.4);g.fillStyle='#2a2a30';for(let i=0;i<3;i++)g.fillRect(-14+i*3,-1.6,1.2,3.2);subKunai(18,'#e8ecf2');g.fillStyle='#e8ecf2';g.beginPath();g.moveTo(-1,-3);g.lineTo(5,-7);g.lineTo(3,-2);g.moveTo(-1,3);g.lineTo(5,7);g.lineTo(3,2);g.fill()};
PROJD.sub_wirek=(p,R,ra,t)=>{g.rotate(ra);subKunai(19);g.fillStyle='rgba(255,255,255,.9)';g.fillRect(6+((t/20)%10)-5,-.6,3,1.2)};
// clone : un vrai ninja en 3D (même modèle que le lanceur), trié en profondeur grâce à son porteur
PROJD.sub_clone=(p,R,ra,t)=>{const z=Math.sin(Math.PI*(1-p.life/p.life0))*70+15,q0=P(p.x,p.y,z);g.scale(1/q0.s,1/q0.s);g.translate(-q0.x,-q0.y);
 const o=units[p.oy];if(!o||!o.ch)return;const id=p.life0,now=t/1000;let f=SUBF.get(id);
 if(!f||f.c!==o.c){f=mkUnit(o.c,p.x,p.y,o.team);f.cmbH=0;f._sp=p.spear||0;f._t=now;SUBF.set(id,f);if(SUBF.size>24)for(const [k,v] of SUBF)if(now-(v._seen||0)>3)SUBF.delete(k)}
 const dt=Math.min(.05,Math.max(0,now-f._t));f._t=now;f._seen=now;f.x=p.x;f.y=p.y;f.aim=p.ox||0;f.moving=p.zapP===1;if(f.moving)f.walk+=dt*13;
 if((p.spear||0)!==f._sp){f._sp=p.spear||0;if(meleeU(f)){f.swing=.18;f.swingA=f.aim;f.cmbH=f.cmbH%5+1;f.cmbT=1.1}else f.thrT=.2}
 f.swing=Math.max(0,f.swing-dt);f.thrT=Math.max(0,(f.thrT||0)-dt);f.cmbT=Math.max(0,(f.cmbT||0)-dt);
 const q=P(p.x,p.y,0),a=Math.min(1,(6-p.life)/.15+.3,p.life/.2+.2);
 if(p.rock){const fz=p.zapP===2,bl=Math.sin(t/(fz?25:90))>0;g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(fz&&bl?'#ffffff':'#ff7a2a',fz?.5:.22);g.beginPath();g.ellipse(q.x,q.y,26*q.s,10*q.s,0,0,7);g.fill();g.restore()}
 g.save();g.globalAlpha*=Math.min(1,a);drawChar3(f,q.x,q.y,q.s*1.3);g.restore();
 if(p.rock){const fz=p.zapP===2;for(const [dx,dy,r] of[[-6,46,.3],[7,40,-.25]]){g.save();g.translate(q.x+dx*q.s,q.y-dy*q.s);g.rotate(r);g.fillStyle='#f0e0b0';g.fillRect(-4*q.s,-6*q.s,8*q.s,12*q.s);g.fillStyle='#c0302a';g.fillRect(-1*q.s,-4*q.s,2*q.s,8*q.s);g.restore()}
  if((t/(fz?30:70)|0)%2){circ(q.x-6*q.s,q.y-53*q.s,(fz?3.5:2.4)*q.s,'#ffd36a');circ(q.x+7*q.s,q.y-47*q.s,(fz?3:2)*q.s,'#ff9a3a')}}};
// Gamabunta (assis ou en chute) : dessin à plat avec gros contour sombre, comme les ninjas
function subToad(x,y,s,t,fall){const br=1+Math.sin(t*3)*.02,o=SUBK[0];g.save();g.translate(x,y);g.scale(s,s*br);g.lineJoin='round';g.lineWidth=3;g.strokeStyle=o;
 const sh=(f,c)=>{g.fillStyle=c;f();g.fill();g.stroke()};
 // pattes arrière, corps, ventre
 for(const k of[-1,1])sh(()=>{g.beginPath();g.ellipse(k*62,-16,26,18,k*.3,0,7)},'#b4542a');
 sh(()=>{g.beginPath();g.ellipse(0,-52,80,54,0,0,7)},'#c4602e');
 g.strokeStyle='#7a3218';g.lineWidth=5;for(const k of[-1,0,1]){g.beginPath();g.arc(k*30,-96,26,.6,2.5);g.stroke()}g.strokeStyle=o;g.lineWidth=3;
 sh(()=>{g.beginPath();g.ellipse(0,-30,50,28,0,0,7)},'#f0c890');
 // haori bleu sur les épaules
 sh(()=>{g.beginPath();g.moveTo(-74,-70);g.quadraticCurveTo(0,-40,74,-70);g.lineTo(66,-50);g.quadraticCurveTo(0,-24,-66,-50);g.closePath()},'#2a3a6a');
 // pattes avant
 for(const k of[-1,1])sh(()=>{g.beginPath();g.ellipse(k*40,fall?-30:-8,15,fall?22:12,0,0,7)},'#c4602e');
 // tête, yeux (pupilles horizontales), cicatrice, bouche, pipe
 sh(()=>{g.beginPath();g.ellipse(0,-92,66,34,0,0,7)},'#c4602e');
 for(const k of[-1,1]){sh(()=>{g.beginPath();g.arc(k*38,-118,16,0,7)},'#c4602e');sh(()=>{g.beginPath();g.ellipse(k*38,-119,11,9,0,0,7)},'#f2d24a');g.fillStyle='#111';g.fillRect(k*38-7,-121,14,3.6)}
 g.strokeStyle='#5a2a14';g.lineWidth=3;g.beginPath();g.moveTo(-52,-136);g.lineTo(-26,-104);g.stroke();g.strokeStyle=o;
 g.beginPath();g.moveTo(-46,-84);g.quadraticCurveTo(0,fall?-62:-74,46,-84);g.stroke();
 if(!fall){g.strokeStyle='#4a2a14';g.lineWidth=4;g.beginPath();g.moveTo(30,-80);g.lineTo(84,-104);g.stroke();sh(()=>{g.beginPath();g.ellipse(86,-108,6,8,0,0,7)},'#5a3a20');
  for(let i=0;i<3;i++){const k=(t*.6+i/3)%1;circ(90+k*14,-118-k*46,(4+k*9),rgba('#e8e8f0',.5*(1-k)))}}
 g.restore()}
PROJD.sub_toad=(p,R,ra,t)=>{const z=Math.sin(Math.PI*(1-p.life/p.life0))*70+15,q0=P(p.x,p.y,z);g.scale(1/q0.s,1/q0.s);g.translate(-q0.x,-q0.y);const q=P(p.x,p.y,0),now=t/1000,a=Math.min(1,p.life/.25);
 g.save();g.globalAlpha*=a;g.fillStyle='rgba(0,0,0,.3)';gEll(p.x,p.y,92);g.fill();subToad(q.x,q.y,q.s*.85*(1+.12*Math.max(0,1-(3.2-p.life)/.18)),now,0);g.restore()};
// --- explosion de parchemin
DETO.sub_boom=(x,y,r)=>{jx({jfx:'sub_boom',x,y,r,t:.6,m:.6});sparks(x,y,'#ffb04a',6,'tag')};
JFXD.sub_boom=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s,cy=q.y-R*.32;
 g.strokeStyle=rgba('#3a2a20',.45*k);g.lineWidth=6*q.s*k+1;gEll(f.x,f.y,f.r*(.4+e*.85));g.stroke();
 if(e<.2){const a=1-e/.2,L=R*(.6+e*3);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fff4c0',.9*a);g.beginPath();for(let i=0;i<16;i++){const b=i*Math.PI/8+f.x,l=i%2?L*.38:L;g.lineTo(q.x+Math.cos(b)*l,cy+Math.sin(b)*l*.75)}g.closePath();g.fill();g.restore()}
 const C=e<.25?['#fff0a0','#ffc040','#ff8a2a']:e<.5?['#ffc040','#ff7a2a','#d8401a']:['#8a7a70','#6a5e58','#4a423e'];g.lineWidth=1.6;
 for(let i=0;i<6;i++){const b=i*1.05+f.y*.01,d=R*(.18+.22*Math.min(1,e*3)),x=q.x+Math.cos(b)*d,y=cy-e*R*.7+Math.sin(b)*d*.55-(i%2)*R*.15,r=R*(.3-.025*i)*(.55+.7*Math.min(1,e*2.5))*(e>.5?1+(e-.5):1);
  g.fillStyle=rgba(C[i%3],(e>.5?.6:.95)*k);g.strokeStyle=rgba('#2a1810',.5*k);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke()}
 g.fillStyle=rgba('#f0e0b0',.95*k);for(let i=0;i<8;i++){const b=i*.8+f.y,d=R*(.3+e*1.2),x=q.x+Math.cos(b)*d,y=cy+Math.sin(b)*d*.5-Math.sin(e*2.6)*R*.45+e*e*R*.8,w=(i%2?6:3.5)*q.s;g.fillRect(x-w/2,y-2*q.s,w,(i%2?3.5:6)*q.s)}};
// --- Rasengan : broyage (spirale) et explosion
JFXD.sub_rasdrill=(f,k,e,t,u,tg)=>{if(!tg)return;const a=u?Math.atan2(tg.y-u.y,tg.x-u.x):0,q=P(tg.x-Math.cos(a)*12,tg.y-Math.sin(a)*12,30),R=26*q.s*(f.big?1.45:1)*(.85+.35*Math.min(1,e*3));g.globalCompositeOperation='lighter';
 circ(q.x,q.y,R*1.5,rgba('#3a8aff',.16*k));circ(q.x,q.y,R*.8,rgba('#5aa8ff',.38*k));circ(q.x,q.y,R*.32,rgba('#e8f6ff',.8*k));
 for(let i=0;i<4;i++){g.strokeStyle=rgba(i%2?'#bfe6ff':'#3a8aff',.9*k);g.lineWidth=3-i*.4;g.beginPath();g.ellipse(q.x,q.y,R*(.55+i*.2),R*(.28+i*.12),-t*18+i*.8,0,3.4);g.stroke()}
 for(let i=0;i<10;i++){const b=-t*14+i*.63,m=(t*3.2+i*.13)%1,r0=R*(1.9-m*1.3);g.strokeStyle=rgba(i%2?'#ffffff':'#7fc8ff',.75*k*(1-m*.5));g.lineWidth=1.5;g.beginPath();g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.65);g.lineTo(q.x+Math.cos(b+.55)*r0*.68,q.y+Math.sin(b+.55)*r0*.45);g.stroke()}
 g.fillStyle=rgba('#d8eeff',.8*k);for(let i=0;i<6;i++){const b=a+Math.PI+(i-2.5)*.35,d=R*(.8+((t*5+i*.3)%1)*1.4);g.fillRect(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6-((t*90+i*13)%20),2.5,2.5)}};
JFXD.sub_bigras=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x+Math.cos(u.aim)*20,u.y+Math.sin(u.aim)*20,34);subSphere(q.x,q.y,15*q.s,t,Math.min(1,k*3))};
JFXD.sub_rasboom=(f,k,e,t)=>{const q=P(f.x,f.y,24),R=f.r*q.s;g.globalCompositeOperation='lighter';if(e<.3)circ(q.x,q.y,R*(.4+e*2),rgba('#ffffff',.6*(1-e/.3)));
 g.strokeStyle=rgba('#7fc8ff',.9*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(q.x,q.y,R*(.4+e*1.1),R*(.3+e*.8),t*6,0,5.2);g.stroke();g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R*(.25+e*.9),R*(.2+e*.6),-t*8,0,4.4);g.stroke();
 for(let i=0;i<10;i++){const b=i*.63+f.x,r0=R*(.3+e*.9),r1=r0+R*(f.big?.6:.4)*k;g.strokeStyle=rgba(i%2?'#bfe6ff':'#3a8aff',.8*k);g.lineWidth=2;g.beginPath();g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.7);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*.7);g.stroke()}
 g.globalCompositeOperation='source-over';g.strokeStyle=rgba('#5a4a38',.4*k);g.lineWidth=3;gEll(f.x,f.y,f.r*(.6+e*.7));g.stroke()};
// --- entaille (Fûma, scalpel)
JFXD.sub_cut=(f,k,e,t,u,tg)=>{if(!tg)return;const q=P(tg.x,tg.y,36),c=f.col||'#ffffff';g.globalCompositeOperation='lighter';g.strokeStyle=rgba(c,.95*k);g.lineWidth=2.5;g.lineCap='round';const L=(10+e*14)*q.s;
 for(const s of[-1,1]){g.beginPath();g.moveTo(q.x-L,q.y-L*.6*s);g.lineTo(q.x+L,q.y+L*.6*s);g.stroke()}};
// --- Ôkashô : fissures au sol (sous les ninjas), rochers projetés, éclair de chakra
AUXD.sub_crack=(x,k)=>{const a=x.a,rg=x.kind==='ring',n=rg?8:9,R=x.r,s0=x.n||1,al=Math.min(1,x.t/.5);g.lineCap='round';g.lineJoin='round';
 g.fillStyle=rgba('#2a1c10',.32*al);gEll(x.x,x.y,rg?44:34);g.fill();g.fillStyle=rgba('#1a1008',.3*al);gEll(x.x,x.y,rg?24:18);g.fill();
 for(let i=0;i<n;i++){const b=rg?i*Math.PI*2/n+s0:a+(i-(n-1)/2)*.14+((s0*(i+3))%7-3)*.015,L=R*(rg?.55+((s0*(i+2))%4)*.1:.5+((s0*(i+1))%5)*.11),pts=[P(x.x,x.y)];
  for(let j=1;j<=5;j++){const d=L*j/5,o=((s0*(i+j))%9-4)*3;pts.push(P(x.x+Math.cos(b)*d-Math.sin(b)*o,x.y+Math.sin(b)*d+Math.cos(b)*o))}
  const line=(n2,w,c)=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let j=1;j<=n2;j++)g.lineTo(pts[j].x,pts[j].y);g.stroke()};
  line(5,2.4,rgba('#1a1008',.8*al));line(2,5,rgba('#1a1008',.75*al));g.save();g.translate(0,1.5);line(3,1,rgba('#d8b888',.5*al));g.restore()}};
JFXD.sub_rocks=(f,k,e)=>{for(let i=0;i<10;i++){const b=f.a+(i-4.5)*.17,d=f.r*(.2+((i*37)%60)/100)*(.4+e*.8),x=f.x+Math.cos(b)*d,y=f.y+Math.sin(b)*d,q=P(x,y,Math.sin(Math.PI*Math.min(1,e*1.25))*(30+(i%3)*18)),s=q.s*(3+(i%3)*1.6)*Math.min(1,k*2);
  g.fillStyle=i%2?'#7a5a3a':'#a07850';g.strokeStyle=SUBK[0];g.lineWidth=1;g.beginPath();g.moveTo(q.x-s,q.y);g.lineTo(q.x-s*.3,q.y-s);g.lineTo(q.x+s,q.y-s*.4);g.lineTo(q.x+s*.6,q.y+s*.7);g.closePath();g.fill();g.stroke()}
 g.fillStyle=rgba('#c8b8a0',.35*k);for(let i=0;i<5;i++){const b=f.a+(i-2)*.3,q=P(f.x+Math.cos(b)*f.r*.4*(.5+e),f.y+Math.sin(b)*f.r*.4*(.5+e),10+e*20);g.beginPath();g.arc(q.x,q.y,(12+e*18)*q.s,0,7);g.fill()}};
JFXD.sub_flash=(f,k,e)=>{const q=P(f.x,f.y,8),R=f.r*q.s,c=f.col||'#ffffff';g.globalCompositeOperation='lighter';circ(q.x,q.y,R*(.18+e*.25),rgba('#ffffff',.6*k));g.strokeStyle=rgba(c,.85*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(q.x,q.y+4*q.s,R*(.3+e*.9),R*(.3+e*.9)*K,0,0,7);g.stroke();
 for(let i=0;i<8;i++){const b=i*.785+.2,r0=R*(.2+e*.5),r1=r0+R*.35*k;g.strokeStyle=rgba(i%2?'#ffffff':c,.8*k);g.lineWidth=2;g.beginPath();g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.7);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*.7);g.stroke()}};
// séisme d'atterrissage (Lotus, crapaud)
JFXD.sub_quake=(f,k,e)=>{g.strokeStyle=rgba('#e8dcc8',.7*k);g.lineWidth=5*k+1;gEll(f.x,f.y,f.r*(.35+e*.75));g.stroke();g.fillStyle=rgba('#c8b8a0',.3*k);
 for(let i=0;i<9;i++){const b=i*.7,q=P(f.x+Math.cos(b)*f.r*(.5+e*.5),f.y+Math.sin(b)*f.r*(.5+e*.5)*.85,8+e*16);g.beginPath();g.arc(q.x,q.y,(10+e*16)*q.s*(f.r/120),0,7);g.fill()}};
// --- Lotus : bandages qui s'enroulent autour de la cible
JFXD.sub_bandage=(f,k,e,t,u,tg)=>{if(!tg)return;const q=P(tg.x,tg.y,(tg.z||0)+34);g.strokeStyle=rgba('#f4efe4',.95*k);g.lineWidth=2.6;g.lineCap='round';
 for(let i=0;i<3;i++){g.beginPath();g.ellipse(q.x,q.y-(i-1)*10*q.s,16*q.s,6*q.s,0,t*14+i*2,t*14+i*2+3.6);g.stroke()}
 if(u){const a=P(u.x,u.y,(u.z||0)+40);g.lineWidth=1.8;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+q.x)/2,Math.min(a.y,q.y)-18,q.x,q.y);g.stroke()}};
// --- bombe fumigène : boulette qui vole, puis nuage épais (au-dessus des ninjas : on s'y cache)
JFXD.sub_pellet=(f,k,e)=>{const x=lerp(f.x,f.x2,e),y=lerp(f.y,f.y2,e),q=P(x,y,24+Math.sin(Math.PI*e)*60);circ(q.x,q.y,5*q.s,'#2a2a30');circ(q.x-1.5*q.s,q.y-1.5*q.s,1.6*q.s,'#6a6a74');if((e*20|0)%2)circ(q.x+4*q.s,q.y-4*q.s,2.2*q.s,'#ffb04a')};
// nuage façon dessin animé : bouffées réparties en tournesol qui roulent en sens inverses ; chaque passe remplit l'union des cercles d'un seul coup
// (un seul chemin → pas de taches là où les bouffées se chevauchent) : contour sombre, corps gris, reflets clairs ; volutes qui s'échappent du bord
const SUBSM=new Float32Array(57);
function subCloud(n,dx,dy,kr,add){g.beginPath();for(let i=0;i<n;i++){const r=SUBSM[i*3+2]*kr+add,x=SUBSM[i*3]+SUBSM[i*3+2]*dx,y=SUBSM[i*3+1]+SUBSM[i*3+2]*dy;g.moveTo(x+r*1.12,y);g.ellipse(x,y,r*1.12,r*.9,0,0,6.2832)}g.fill()}
// T = temps écoulé, L = temps restant, band = 0 (fond) … 3 (devant) : seules les bouffées de la bande sont dessinées, chaque bande est triée avec les ninjas
// le nuage s'éclaircit pour le joueur local qui se tient dedans (il voit toujours son ninja), il reste opaque vu de l'extérieur
function subSmokeDraw(cx,cy,R0,T,L,band,t){const fade=Math.min(1,L/.9);let a=Math.min(1,T*9)*fade;if(player&&!player.dead){const dv=Math.hypot(player.x-cx,player.y-cy)/R0;if(dv<1.05)a*=.5+.45*clamp((dv-.65)/.4,0,1)}
 if(a<=.01)return;const gr=ezo(Math.min(1,T/.35)),N=19;let n=0;
 for(let i=0;i<N;i++){const sg=i%2?1:-1,b=i*2.39996+t*.16*sg,rf=i?Math.sqrt((i+.5)/N)*.8:0,d=R0*rf*gr*(1+.05*Math.sin(t*1.7+i)),dy=Math.sin(b)*d*.9;
  if((dy<-R0*.36?0:dy<0?1:dy<R0*.36?2:3)!==band)continue;const q=P(cx+Math.cos(b)*d,cy+dy,12+(i%3)*6+Math.sin(t*1.3+i)*3+(1-fade)*16);
  SUBSM[n*3]=q.x;SUBSM[n*3+1]=q.y;SUBSM[n*3+2]=(24+((i*53)%7)*3.6)*q.s*(.45+.55*gr)*(.7+.3*fade)*(1+.07*Math.sin(t*2.3+i*1.3));n++}
 if(n){g.fillStyle=rgba('#40404c',.9*a);subCloud(n,0,0,1,2.4);g.fillStyle=rgba('#9a9aa8',.95*a);subCloud(n,0,0,1,0);g.fillStyle=rgba('#c4c4ce',.95*a);subCloud(n,-.05,-.12,.84,0);
  g.fillStyle=rgba('#e8e8f0',.9*a);subCloud(n,-.17,-.27,.6,0);g.fillStyle=rgba('#fbfbfe',.7*a);subCloud(n,-.3,-.42,.24,0)}
 if(band===3)for(let i=0;i<7;i++){const c=(t*.5+i/7)%1,b=i*.9+1.3+t*.05,d=R0*(.8+.45*c),q=P(cx+Math.cos(b)*d,cy+Math.sin(b)*d*.9,18+c*42);g.fillStyle=rgba('#c4c4ce',.5*a*(1-c));g.beginPath();g.arc(q.x,q.y,(8+c*12)*q.s,0,7);g.fill()}}
PROJD.sub_smoke=(p,R,ra,t)=>{const z=Math.sin(Math.PI*(1-p.life/p.life0))*70+15,q0=P(p.x,p.y,z);g.scale(1/q0.s,1/q0.s);g.translate(-q0.x,-q0.y);const m=p.spear||4.5;subSmokeDraw(p.x,p.oy,p.ar||130,m-p.life,p.life,p.ox|0,t/1000)};
// ombre du nuage au sol (sous les ninjas)
AUXD.sub_smk=(x,k)=>{const T=x.m-x.t,a=Math.min(1,T*9)*Math.min(1,x.t/.9);g.fillStyle=rgba('#1c1c26',.24*a);gEll(x.x,x.y,x.r*(.45+.5*ezo(Math.min(1,T/.35))));g.fill()};
// --- pouf (clones, substitution)
JFXD.sub_poof=(f,k,e)=>{const q=P(f.x,f.y,28),R=f.r*q.s,sp=ezo(Math.min(1,e*2.5)),a=Math.min(1,k*1.6);g.lineWidth=1.6;
 for(let i=0;i<9;i++){const b=i*.7+f.x*.01,d=R*(i?(.3+(i%3)*.16)*sp+.1:0),x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*.7-e*14*q.s-(i%2)*R*.2*sp,r=R*(.32+((i*7)%4)*.07)*(.5+.5*sp)*(i?1:1.3);
  g.fillStyle=rgba(i%3?'#eef0f4':'#c4c6ce',.95*a);g.strokeStyle=rgba('#5a5a66',.45*a);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke()}
 g.fillStyle=rgba('#ffffff',.8*a);for(let i=0;i<4;i++){const b=i*1.9+f.y*.01;g.beginPath();g.arc(q.x+Math.cos(b)*R*.3*sp,q.y+Math.sin(b)*R*.2*sp-R*.3,R*.14,0,7);g.fill()}
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=2;for(let i=0;i<6;i++){const b=i*1.05+.3,r0=R*(.9+e*.9),r1=r0+R*.35*k;g.beginPath();g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.7);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*.7);g.stroke()}};
// --- fil piégé (à peine visible pour l'ennemi, sauf de près)
AUXD.sub_wire=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),h=x.len/2,mine=player&&player.team===x.team,d=player?Math.hypot(player.x-x.x,player.y-x.y):999,vis=x.n?1:mine?.75:clamp(1-(d-70)/90,0,1)*.8;if(vis<=.02)return;
 const a=P(x.x-ca*h,x.y-sa*h,0),b=P(x.x+ca*h,x.y+sa*h,0);g.globalAlpha=vis*Math.min(1,k*2);
 // armement (0,6 s) : le fil se tend du centre vers les deux kunai ; armé : reflet qui court sur le fil et parchemin au centre
 if(!x.n){const el=Math.min(1,(x.m-x.t)/.6),hh=h*ezo(el),wa=P(x.x-ca*hh,x.y-sa*hh,9),wb=P(x.x+ca*hh,x.y+sa*hh,9);
  g.strokeStyle='rgba(30,24,20,.45)';g.lineWidth=2.4;g.beginPath();g.moveTo(wa.x,wa.y+1);g.lineTo(wb.x,wb.y+1);g.stroke();g.strokeStyle=el<1?'rgba(235,240,248,.55)':'rgba(235,240,248,.95)';g.lineWidth=1.3;g.beginPath();g.moveTo(wa.x,wa.y);g.lineTo(wb.x,wb.y);g.stroke();
  if(el>=1){const m=(t*.8)%1;circ(lerp(wa.x,wb.x,m),lerp(wa.y,wb.y,m),2.2,'#ffffff');g.fillStyle='#f0e0b0';const c=P(x.x,x.y,9);g.fillRect(c.x-3,c.y-4,6,8);g.fillStyle='#c0302a';g.fillRect(c.x-1,c.y-3,2,6)}}
 for(const [p,s] of[[a,-1],[b,1]]){g.save();g.translate(p.x,p.y);g.rotate(-1.2+s*.3);g.fillStyle='#d8dde6';g.beginPath();g.moveTo(-3,0);g.lineTo(0,-12*p.s);g.lineTo(3,0);g.closePath();g.fill();g.fillStyle='#34343c';g.fillRect(-1.2,-1,2.4,6);g.restore()}};
JFXD.sub_volley=(f,k,e,t,u,tg)=>{const tx=tg?tg.x:f.x,ty=tg?tg.y:f.y;for(let i=0;i<6;i++){const sx=i%2?f.x2:f.x1,sy=i%2?f.y2:f.y1,m=Math.min(1,e*2.2+(i>>1)*.08),x=lerp(sx,tx,m)+((i*13)%9-4)*3,y=lerp(sy,ty,m)+((i*7)%9-4)*3,q=P(x,y,26+(i%3)*8),b=Math.atan2((ty-sy)*K,tx-sx);
  if(m<1){g.save();g.translate(q.x,q.y);g.rotate(b);g.scale(q.s,q.s);subKunai(16);g.restore()}}
 if(tg&&e>.4){const q=P(tg.x,tg.y,30);g.strokeStyle=rgba('#e6ecf5',.9*k);g.lineWidth=1.4;for(let i=0;i<3;i++){g.beginPath();g.ellipse(q.x,q.y-(i-1)*9*q.s,15*q.s,5*q.s,.2,0,7);g.stroke()}}};
// --- plumes du genjutsu : brume rose au sol + plumes qui tombent en se balançant
AUXD.sub_feather=(x,k,t)=>{g.strokeStyle=rgba('#ff9ab0',.45*k);g.lineWidth=1.5;g.setLineDash([8,7]);g.lineDashOffset=-t*12;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([])};
JFXD.sub_feathers=(f,k,e,t)=>{const a=Math.min(1,e*5)*Math.min(1,f.t/.5);for(let i=0;i<24;i++){const h=((t*.32+i*.137)%1),b=i*2.39,d=f.r*(.15+((i*53)%80)/100),x=f.x+Math.cos(b)*d+Math.sin(t*1.7+i)*10,y=f.y+Math.sin(b)*d*.85,q=P(x,y,(1-h)*150+4),r=Math.sin(t*2.2+i)*.7;
  g.save();g.translate(q.x,q.y);g.rotate(r);g.scale(q.s,q.s);g.globalAlpha=a*(h<.9?1:(1-h)*10);g.fillStyle=i%3?'#ffffff':'#ffd8e8';g.strokeStyle='rgba(90,40,110,.45)';g.lineWidth=.8;g.beginPath();g.moveTo(-10,0);g.quadraticCurveTo(-2,-4.5,9,-.5);g.quadraticCurveTo(-2,3.5,-10,0);g.fill();g.stroke();g.beginPath();g.moveTo(-12,.3);g.lineTo(8,-.3);g.stroke();g.restore()}};
// --- parchemin collé : cercle d'alerte de l'explosion autour de la victime (clignote de plus en plus vite)
AUXD.sub_tagw=(x,k,t)=>{const v=x.ti!=null?units[x.ti]:null;if(!v||v.dead||!v.stk)return;const e=Math.min(1,(x.m-x.t)/1.2),bl=Math.sin(t*(8+e*30))>0;
 g.fillStyle=rgba('#ff9a3a',.06+.12*e);gEll(v.x,v.y,x.r);g.fill();g.strokeStyle=rgba(bl?'#ffd36a':'#ff7a2a',.5+.4*e);g.lineWidth=2;g.setLineDash([10,6]);g.lineDashOffset=-t*40;gEll(v.x,v.y,x.r);g.stroke();g.setLineDash([]);
 g.fillStyle=rgba('#ff7a2a',.25);gEll(v.x,v.y,x.r*e);g.fill()};
// --- kunai explosifs : kunai lancé en cloche, kunai planté, parchemins projetés
JFXD.sub_kthrow=(f,k,e)=>{const x=lerp(f.x,f.x2,e),y=lerp(f.y,f.y2,e),q=P(x,y,26+Math.sin(Math.PI*e)*55),b=Math.atan2((f.y2-f.y)*K,f.x2-f.x)+(e-.5)*1.2;g.save();g.translate(q.x,q.y);g.rotate(b);g.scale(q.s,q.s);
 g.fillStyle='#f0e0b0';g.fillRect(-26,-3,14,6);g.fillStyle='#c0302a';g.fillRect(-21,-2,3,4);subKunai(20);g.restore()};
AUXD.sub_planted=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s;g.save();g.translate(q.x,q.y);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,8*s,3*s,0,0,7);g.fill();g.rotate(.25);g.fillStyle='#34343c';g.fillRect(-1.5*s,-22*s,3*s,10*s);g.strokeStyle='#34343c';g.lineWidth=1.2;g.beginPath();g.arc(0,-24*s,2.4*s,0,7);g.stroke();
 g.fillStyle='#d8dde6';g.beginPath();g.moveTo(-3.5*s,-12*s);g.lineTo(0,0);g.lineTo(3.5*s,-12*s);g.fill();g.fillStyle='#f0e0b0';g.fillRect(2*s,-22*s,9*s,13*s);g.fillStyle='#c0302a';g.fillRect(5*s,-20*s,2.4*s,9*s);
 const fz=1-x.t/x.m;circ(11*s,-22*s+fz*13*s,(2.5+Math.sin(t*40)*1)*s,'#ffd36a');g.restore()};
JFXD.sub_tagfly=(f,k,e,t)=>{const x=lerp(f.x,f.x2,e),y=lerp(f.y,f.y2,e),q=P(x,y,16+Math.sin(Math.PI*e)*40);g.save();g.translate(q.x,q.y);g.rotate(t*12);g.scale(q.s,q.s);g.fillStyle='#f0e0b0';g.fillRect(-7,-4,14,8);g.fillStyle='#c0302a';g.fillRect(-1.5,-3,3,6);g.restore();if((t*25|0)%2)circ(q.x,q.y,2.4*q.s,'#ffb04a')};
// --- Shôsen : paumes de chakra vert au-dessus de la cible, croix qui montent, rayon depuis le soigneur
JFXD.sub_hands=(f,k,e,t,u,tg)=>{if(!tg)return;const q=P(tg.x,tg.y,40),a=Math.min(1,e*5)*Math.min(1,k*3);g.globalCompositeOperation='lighter';circ(q.x,q.y,26*q.s,rgba('#7fe07f',.18*a));
 for(const s of[-1,1]){const x=q.x+s*13*q.s,y=q.y-4*q.s+Math.sin(t*5+s)*2;g.fillStyle=rgba('#9ff09f',.55*a);g.beginPath();g.ellipse(x,y,7*q.s,9*q.s,s*.3,0,7);g.fill();for(let i=0;i<4;i++){g.beginPath();g.ellipse(x+(i-1.5)*3.4*q.s,y-10*q.s,1.6*q.s,4*q.s,0,0,7);g.fill()}}
 for(let i=0;i<5;i++){const h=(t*1.2+i/5)%1,x=q.x+((i*17)%30-15)*q.s,y=q.y+10*q.s-h*50*q.s;g.fillStyle=rgba('#cfffcf',.8*a*(1-h));g.fillRect(x-1.2,y-4*q.s,2.4,8*q.s);g.fillRect(x-4*q.s,y-1.2,8*q.s,2.4)}};
JFXD.sub_hbeam=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const a=P(u.x+Math.cos(u.aim)*14,u.y+Math.sin(u.aim)*14,32),b=P(tg.x,tg.y,40);g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#7fe07f',.45*k);g.lineWidth=7;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=1.6;g.beginPath();g.moveTo(a.x,a.y);for(let i=1;i<=6;i++){const m=i/6;g.lineTo(lerp(a.x,b.x,m),lerp(a.y,b.y,m)+Math.sin(t*20+i*2)*3*(i<6))}g.stroke()};
// --- scalpel de chakra : deux arcs tranchants
JFXD.sub_scalpel=(f,k,e,t,u)=>{if(!u)return;const c=f.col;g.globalCompositeOperation='lighter';g.lineCap='round';for(const s of[-1,1]){const a0=f.a-.85*s,a1=f.a+.85*s*(-1+2*Math.min(1,e*2.5));g.strokeStyle=rgba(c,.9*k);g.lineWidth=4;gEll(u.x,u.y,92,Math.min(a0,a1),Math.max(a0,a1));g.stroke();g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=1.5;gEll(u.x,u.y,88,Math.min(a0,a1),Math.max(a0,a1));g.stroke()}
 for(const s of['L','R']){const b=u.aim+(s==='L'?-.6:.6),q=P(u.x+Math.cos(b)*18,u.y+Math.sin(b)*18,32);g.strokeStyle=rgba(c,.8*k);g.lineWidth=3;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x+Math.cos(u.aim)*14*q.s,q.y+Math.sin(u.aim)*10*q.s);g.stroke()}};
// --- contre du clone : l'image du clone frappé s'efface dans la fumée ; entaille derrière l'attaquant
JFXD.sub_cghost=(f,k,e,t,u)=>{if(!u||!N3.ok||!N3.tile.get(u))return;const q=P(f.x,f.y,0);g.globalAlpha=.6*k;drawChar3(u,q.x,q.y+e*6,q.s*1.3)};
JFXD.sub_slash=(f,k,e,t,u)=>{const c=f.col||'#ffffff',q=P(f.x,f.y,34);g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba(c,.95*k);g.lineWidth=4*k+1;const b=f.a,L=34*q.s;
 g.beginPath();g.moveTo(q.x+Math.cos(b-1)*L,q.y+Math.sin(b-1)*L*.7);g.quadraticCurveTo(q.x+Math.cos(b)*L*1.5,q.y+Math.sin(b)*L,q.x+Math.cos(b+1)*L,q.y+Math.sin(b+1)*L*.7);g.stroke()};
// --- pilule : la pilule saute à la bouche, puis bouffée d'énergie rouge orangé
JFXD.sub_pill=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,0),s=q.s;if(e<.35){const m=e/.35,x=q.x+Math.cos(u.aim)*(14-m*10)*s,y=q.y-(34+m*30)*s-Math.sin(Math.PI*m)*14*s;circ(x,y,4*s,'#6a4220');circ(x-1.2*s,y-1.2*s,1.6*s,'#d8a060');return}
 const m=(e-.35)/.65;g.globalCompositeOperation='lighter';if(m<.25)circ(q.x,q.y-40*s,(16+m*60)*s,rgba('#ffffff',.5*(1-m/.25)));
 g.strokeStyle=rgba('#ff7a3a',.8*(1-m));g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-36*s,(16+m*34)*s,(22+m*44)*s,0,0,7);g.stroke();
 for(let i=0;i<10;i++){const b=i*.63+t*2,h=((m*1.4+i*.11)%1),x=q.x+Math.cos(b)*(10+h*8)*s,y=q.y-(8+h*70)*s;g.fillStyle=rgba(i%2?'#ff9a3a':'#4ab0ff',.75*(1-h)*(1-m*.6));g.beginPath();g.moveTo(x-4*s,y);g.quadraticCurveTo(x,y-14*s,x+4*s,y);g.fill()}
 g.globalCompositeOperation='source-over';for(let i=0;i<3;i++){const h=(m*1.2+i*.3)%1;circ(q.x+(i-1)*8*s,q.y-(70+h*30)*s,(4+h*7)*s,rgba('#e8e8f0',.45*(1-h)))}};
// --- concentration : anneaux de chakra qui convergent, colonne qui monte
JFXD.sub_focus=(f,k,e,t,u)=>{if(!u)return;const c=f.col;g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const m=Math.max(0,1-e*1.6-i*.12);if(m>0){g.strokeStyle=rgba(c,.8*(1-m*.3));g.lineWidth=2.5;gEll(u.x,u.y,20+m*110);g.stroke()}}
 const q=P(u.x,u.y,0);if(e>.35){const m=(e-.35)/.65,H=(40+m*90)*q.s;for(const [w,a] of[[26,.14],[16,.2],[7,.35]]){g.fillStyle=rgba(c,a*(1-m));g.beginPath();g.ellipse(q.x,q.y-H/2,w*q.s,H/2,0,0,7);g.fill()}for(let i=0;i<6;i++){const x=q.x+((i*11)%22-11)*q.s,y=q.y-((t*120+i*31)%110)*q.s;g.strokeStyle=rgba('#ffffff',.7*(1-m));g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-10*q.s);g.stroke()}}};
// --- Shunshin : tourbillon de feuilles (qui s'ouvre au départ, se referme à l'arrivée)
JFXD.sub_leaves=(f,k,e,t)=>{const m=f.in?1-e:e;for(let i=0;i<14;i++){const b=i*.45+t*7+(i%2)*3,r=(10+m*50+(i%4)*6),h=10+i*4+m*20,q=P(f.x+Math.cos(b)*r,f.y+Math.sin(b)*r*.8,h);g.save();g.translate(q.x,q.y);g.rotate(b*1.7);g.scale(q.s,q.s);g.fillStyle=vcol('leaf','',i);g.globalAlpha=Math.min(1,k*2.5);
 g.beginPath();g.ellipse(0,0,5.5,2.4,0,0,7);g.fill();g.strokeStyle='rgba(20,40,10,.5)';g.lineWidth=.7;g.beginPath();g.moveTo(-5,0);g.lineTo(5,0);g.stroke();g.restore()}
 g.strokeStyle=rgba('#8ad05a',.45*k);g.lineWidth=2;g.beginPath();const q=P(f.x,f.y,20);g.ellipse(q.x,q.y,(20+m*40)*q.s,(12+m*24)*q.s,t*4,0,4.5);g.stroke()};
// --- Saut ninja : poussière et feuilles à l'atterrissage
JFXD.sub_land=(f,k,e)=>{g.strokeStyle=rgba('#e8dcc8',.7*k);g.lineWidth=4*k+1;gEll(f.x,f.y,f.r*(.4+e*.7));g.stroke();for(let i=0;i<8;i++){const b=i*.785+.3,q=P(f.x+Math.cos(b)*f.r*(.4+e*.6),f.y+Math.sin(b)*f.r*(.4+e*.6),6+e*14);circ(q.x,q.y,(7+e*8)*q.s*k,rgba(i%2?'#c8b8a0':'#8ad05a',.45*k))}};
// --- Hiraishin : kunai planté au sol ou marque sur l'ennemi, éclair jaune de la téléportation
AUXD.sub_hk=(x,k,t)=>{if(!x.n)return;const tg=x.n===2&&x.ti!=null?units[x.ti]:null,px=tg?tg.x:x.x,py=tg?tg.y:x.y,q=P(px,py,0),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe14a',.6+.25*Math.sin(t*8));g.lineWidth=2;gEll(px,py,tg?28:18);g.stroke();
 for(let i=0;i<6;i++){const b=i*1.047+t*2,p=P(px+Math.cos(b)*(tg?28:18),py+Math.sin(b)*(tg?28:18),0);g.fillStyle='#ffe14a';g.fillRect(p.x-1.5,p.y-1.5,3,3)}g.restore();
 if(!tg){g.save();g.translate(q.x,q.y);g.rotate(.3);g.fillStyle='#34343c';g.fillRect(-1.5*s,-20*s,3*s,9*s);g.fillStyle='#f4f4f0';g.fillRect(-2.2*s,-19*s,4.4*s,6*s);g.fillStyle='#e8ecf2';g.beginPath();g.moveTo(-3.5*s,-11*s);g.lineTo(0,0);g.lineTo(3.5*s,-11*s);g.fill();g.restore()}};
JFXD.sub_hira=(f,k,e)=>{const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#ffe14a',.7*k);g.lineWidth=12*k+1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=3*k+.5;g.stroke();
 for(const [p,r] of[[a,22],[b,30]]){g.strokeStyle=rgba('#ffe14a',.85*k);g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y+22*p.s,(r+e*30)*p.s,(r+e*30)*p.s*K,0,0,7);g.stroke();circ(p.x,p.y,(10+e*14)*p.s,rgba('#fff3a0',.4*k))}
 for(let i=0;i<10;i++){const m=i/9,x=lerp(a.x,b.x,m),y=lerp(a.y,b.y,m);g.fillStyle=rgba('#ffe14a',.6*k);g.fillRect(x+Math.sin(i*7)*8,y+Math.cos(i*5)*8,2.5,2.5)}};
// --- kunai à fil : le fil reste tendu pendant la traction
AUXD.sub_wireln=(x,k)=>{const o=x.ui!=null?units[x.ui]:null;if(!o)return;const a=P(o.x,o.y,(o.z||0)+32),b=P(x.x,x.y,28);g.strokeStyle='rgba(230,236,245,.9)';g.lineWidth=1.4;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};
// --- Kawarimi : bûche piégée qui grésille
AUXD.sub_log=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,a=Math.atan2(Math.sin(x.a||0)*K,Math.cos(x.a||0));g.save();g.translate(q.x,q.y-9*s);g.rotate(a*.3);g.strokeStyle=SUBK[0];g.lineWidth=2;
 g.fillStyle='#7a4e28';g.beginPath();g.ellipse(0,0,22*s,9*s,0,0,7);g.fill();g.stroke();g.fillStyle='#c89a60';g.beginPath();g.ellipse(20*s,0,5*s,9*s,0,0,7);g.fill();g.stroke();g.strokeStyle='#8a5a30';g.lineWidth=1;g.beginPath();g.ellipse(20*s,0,2.4*s,4.5*s,0,0,7);g.stroke();
 g.strokeStyle='rgba(40,24,10,.6)';g.beginPath();g.moveTo(-14*s,-3*s);g.lineTo(6*s,-4*s);g.moveTo(-10*s,3*s);g.lineTo(10*s,4*s);g.stroke();g.fillStyle='#f0e0b0';g.fillRect(-6*s,-8*s,8*s,11*s);g.fillStyle='#c0302a';g.fillRect(-3*s,-6*s,2.2*s,7*s);
 circ(-2*s,-9*s-Math.sin(t*30)*s,2.6*s,'#ffb04a');g.restore()};
// --- crapaud : ombre qui grandit, chute, rempart
AUXD.sub_toadsh=(x,k)=>{const e=1-x.t/x.m;g.fillStyle=rgba('#000000',.12+.3*e);gEll(x.x,x.y,x.r*(.3+.7*e));g.fill()};
JFXD.sub_toadfall=(f,k,e,t)=>{const q=P(f.x,f.y,0),h=(1-e*e)*560*q.s;if(e>.98)return;subToad(q.x,q.y-h,q.s*.85,t,1);g.strokeStyle=rgba('#ffffff',.35);g.lineWidth=2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(q.x+i*30*q.s,q.y-h-150*q.s);g.lineTo(q.x+i*30*q.s,q.y-h-230*q.s);g.stroke()}};
// --- pluie de parchemins : parchemins qui tombent en voletant (les trois alertes emboîtées sont des zones du moteur)
JFXD.sub_tags=(f,k,e,t)=>{const T=e*f.m;for(let i=0;i<22;i++){const w=i?i<9?1:2:0,dl=[.9,1.15,1.4][w],r=[0,92,145][w],b=i*2.4,x=f.x+Math.cos(b)*r*(i?1:0)+Math.sin(t*2+i)*6,y=f.y+Math.sin(b)*r*.9*(i?1:0);if(T>dl)continue;
  const m=Math.min(1,T/(dl*.85)),q=P(x,y,(1-m)*260+6);g.save();g.translate(q.x,q.y);g.rotate(Math.sin(t*4+i)*.8*(1-m)+(m>=1?.2:0));g.scale(q.s,q.s);g.fillStyle='#f0e0b0';g.fillRect(-7,-4,14,8);g.fillStyle='#c0302a';g.fillRect(-1.5,-3,3,6);g.restore();if(m>=1&&(t*20+i|0)%2)circ(q.x+6*q.s,q.y-3*q.s,2*q.s,'#ffb04a')}};
// --- Mode Ermite : explosion d'énergie naturelle
JFXD.sub_sagein=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,0);g.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const b=i*.524+t,r=(16+e*80)*q.s,h=(30+Math.sin(i*3)*20)*q.s;g.strokeStyle=rgba(i%2?'#e8a020':'#8ad05a',.8*k);g.lineWidth=3;g.beginPath();g.moveTo(q.x+Math.cos(b)*r*.4,q.y-h*.3);g.quadraticCurveTo(q.x+Math.cos(b)*r,q.y-h,q.x+Math.cos(b)*r*1.1,q.y-h*1.6);g.stroke()}
 g.strokeStyle=rgba('#e8a020',.9*k);g.lineWidth=4;gEll(u.x,u.y,20+e*90);g.stroke()};
// --- Katsuyu : grande limace qui sort du sol, petites limaces qui sautent sur les alliés
JFXD.sub_katsu=(f,k,e,t,u)=>{const bx=f.x-Math.cos(f.a)*30-Math.sin(f.a)*55,by=f.y-Math.sin(f.a)*30+Math.cos(f.a)*40,q=P(bx,by,0),up=ezo(Math.min(1,e*3.5))*Math.min(1,k*4),s=q.s*1.05,o=SUBK[0],fl=Math.cos(f.a)<0?-1:1,w=Math.sin(t*3)*2;
 g.save();g.translate(q.x,q.y);g.scale(s*fl,s);g.globalAlpha*=Math.min(1,k*4);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,2,58,12,0,0,7);g.fill();g.scale(1,up);
 g.lineWidth=2.5;g.strokeStyle=o;g.fillStyle='#e8eef8';g.beginPath();g.moveTo(-58,0);g.quadraticCurveTo(-52,-20,-22,-24);g.quadraticCurveTo(8,-28,22,-40+w);g.quadraticCurveTo(32,-58+w,46,-52+w);g.quadraticCurveTo(58,-44,54,-22);g.quadraticCurveTo(52,-6,60,0);g.closePath();g.fill();g.stroke();
 g.fillStyle='#4a6aa8';for(const [x,y,r] of[[-34,-17,.18],[-12,-21,.05],[10,-27,-.35]]){g.beginPath();g.ellipse(x,y,11,3,r,0,7);g.fill()}
 g.fillStyle='#cfd8ec';g.beginPath();g.ellipse(-4,-4,46,4,0,0,7);g.fill();
 g.strokeStyle='#e8eef8';g.lineWidth=3.5;for(const [x,y] of[[40,-70],[52,-66]]){g.beginPath();g.moveTo(x-4,-52+w);g.quadraticCurveTo(x-7,(y-52)/2+w,x,y+w);g.stroke();circ(x,y+w,3.6,'#1a2a4a')}
 g.strokeStyle=o;g.lineWidth=1.6;g.beginPath();g.arc(50,-38+w,5,.3,2.4);g.stroke();g.restore()};
JFXD.sub_slugjump=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const x=lerp(u.x,tg.x,e),y=lerp(u.y,tg.y,e),q=P(x,y,30+Math.sin(Math.PI*e)*70);g.fillStyle='#e8eef8';g.strokeStyle=SUBK[0];g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,7*q.s,4*q.s,e*6,0,7);g.fill();g.stroke()};
// --- Nindô (trait) : flamme de volonté
JFXD.sub_nindo=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,0);g.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const b=i*.7+t*3,x=q.x+Math.cos(b)*(14+e*10)*q.s,y=q.y-((t*90+i*23)%80)*q.s;g.fillStyle=rgba(i%2?'#ff9a3a':'#ffd36a',.7*k);g.beginPath();g.moveTo(x-4*q.s,y);g.quadraticCurveTo(x,y-14*q.s,x+4*q.s,y);g.fill()}
 g.strokeStyle=rgba('#ff9a3a',.8*k);g.lineWidth=3;gEll(u.x,u.y,24+e*40);g.stroke()};
// ---------- animations 3D ----------
Object.assign(ANIM,{
 // Rasengan : la main droite porte la sphère, la gauche la façonne par-dessus ; puis poussée en fente avant
 sub_rasw:(P)=>{pz(P,'armR',-1.25,0,.18);pz(P,'foreR',-.55);pz(P,'armL',-1.45,0,-.62);pz(P,'foreL',-1.25);pz(P,'chest',.18,-.3);pz(P,'head',.18,-.2);P.root.y=-2.5;pz(P,'thighL',-.45);pz(P,'shinL',.6);pz(P,'thighR',.25);pz(P,'shinR',.45)},
 sub_rasen:(P,e)=>{const k=ezo(Math.min(1,e/.18));pz(P,'armR',-1.62*k-.05,0,.12);pz(P,'foreR',-.08);pz(P,'armL',.6*k,0,.55);pz(P,'foreL',-.6);pz(P,'chest',.5*k,.35*k);pz(P,'head',-.25*k);P.root.z=13*k;P.root.y=-5*k;pz(P,'thighR',-1.1*k);pz(P,'shinR',.9*k);pz(P,'thighL',.75*k);pz(P,'shinL',.5*k)},
 // Ôkashô : poing levé pendant l'incantation, puis abattu sur le sol en fente
 sub_okaw:(P,e)=>{const k=ezo(Math.min(1,e/.6));pz(P,'armR',-3*k,0,-.2);pz(P,'foreR',-.6*k);pz(P,'armL',-.6,0,.5);pz(P,'chest',-.3*k,.2);pz(P,'head',-.2*k);P.root.y=2*k;pz(P,'thighR',-.4*k);pz(P,'shinR',.6*k)},
 sub_oka:(P,e)=>{const k=e<.12?e/.12:1,r=e>.6?(e-.6)/.4:0;pz(P,'armR',-3+1.9*k+.4*r,0,.1);pz(P,'foreR',-.1);pz(P,'armL',.4,0,.6);pz(P,'chest',.85*k*(1-r*.6),.1);pz(P,'head',.3*k);P.root.y=-10*k*(1-r);P.root.z=6*k;pz(P,'thighL',-1.1*k);pz(P,'shinL',1.6*k*(1-r));pz(P,'thighR',.5*k);pz(P,'shinR',1.2*k*(1-r))},
 // Lotus : coup de pied vers le ciel puis vrille tête la première (rotation autour du centre du corps)
 sub_lotus:(P,e)=>{if(e<.28){const k=bump(e/.28*.5+.25);pz(P,'thighR',-2.3*k);pz(P,'shinR',.1);pz(P,'chest',-.45*k);pz(P,'armL',-.3,0,.8);pz(P,'armR',-.3,0,-.8);P.root.y=3*k;return}
  const k=(e-.28)/.72,th=Math.PI*2*ezio(k),c=24;P.rootR.x=th;P.root.y=c*(1-Math.cos(th));P.root.z=-c*Math.sin(th);pz(P,'armL',-1.7,0,-.25);pz(P,'armR',-1.7,0,.25);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'chest',.35);pz(P,'thighL',-.15);pz(P,'thighR',-.15)},
 // roulade avant
 sub_roll:(P,e)=>{const th=Math.PI*2*ezio(e),c=22;P.rootR.x=th;P.root.y=c*(1-Math.cos(th))*.95;P.root.z=-c*Math.sin(th);pz(P,'thighL',-1.4);pz(P,'shinL',2);pz(P,'thighR',-1.4);pz(P,'shinR',2);pz(P,'chest',.8);pz(P,'head',.5);pz(P,'armL',-1.2,0,.3);pz(P,'armR',-1.2,0,-.3);pz(P,'foreL',-1.5);pz(P,'foreR',-1.5)},
 // saut : bras levés en arrière, jambes repliées, réception accroupie
 sub_jump:(P,e)=>{const k=bump(Math.min(1,e/.9));pz(P,'armL',-2.5*k,0,.5);pz(P,'armR',-2.5*k,0,-.5);pz(P,'thighL',-1*k);pz(P,'shinL',1.6*k);pz(P,'thighR',-.5*k);pz(P,'shinR',1.4*k);pz(P,'chest',-.2*k);if(e>.85){const l=bump((e-.85)/.15);P.root.y=-6*l;pz(P,'thighL',-.8*l);pz(P,'shinL',1.4*l);pz(P,'thighR',-.6*l);pz(P,'shinR',1.2*l)}},
 // scalpel : les deux mains balaient en ciseaux
 sub_mesu:(P,e)=>{const k=e<.3?e/.3:1;pz(P,'armR',-1.5,-.9+1.8*k,-.2);pz(P,'foreR',-.1);pz(P,'armL',-1.4,.9-1.8*k,.2);pz(P,'foreL',-.1);pz(P,'chest',.3,.5-k);P.root.z=6*k},
 // pilule : main à la bouche, puis bras fléchis (regain d'énergie)
 sub_pill:(P,e)=>{if(e<.45){const k=Math.min(1,e/.2);pz(P,'armR',-2.3*k,0,.45*k);pz(P,'foreR',-2.2*k);pz(P,'head',-.25*k);return}const k=bump((e-.45)/.55);pz(P,'armL',-.5*k,0,1.2*k);pz(P,'armR',-.5*k,0,-1.2*k);pz(P,'foreL',-1.6*k);pz(P,'foreR',-1.6*k);pz(P,'chest',-.35*k);pz(P,'head',-.4*k);P.root.y=-2*k},
 // Mode Ermite : méditation en tailleur, puis libération
 sub_sagew:(P)=>{P.root.y=-14;pz(P,'thighL',-1.45,0,.55);pz(P,'thighR',-1.45,0,-.55);pz(P,'shinL',2.4);pz(P,'shinR',2.4);pz(P,'armL',-1.2,0,-.6);pz(P,'armR',-1.2,0,.6);pz(P,'foreL',-1.9);pz(P,'foreR',-1.9);pz(P,'head',.25)},
 sub_sage:(P,e)=>{const k=ezo(Math.min(1,e/.35)),r=e>.7?(e-.7)/.3:0;P.root.y=-14*(1-k)+3*k*(1-r);pz(P,'armL',-.5*k,0,1.35*k*(1-r*.5));pz(P,'armR',-.5*k,0,-1.35*k*(1-r*.5));pz(P,'chest',-.4*k*(1-r));pz(P,'head',-.5*k*(1-r));pz(P,'thighL',-1.45*(1-k),0,.55*(1-k)+.25*k);pz(P,'thighR',-1.45*(1-k),0,-.55*(1-k)-.25*k);pz(P,'shinL',2.4*(1-k));pz(P,'shinR',2.4*(1-k))},
 // signe du clonage : index et majeur croisés devant le visage
 sub_seal:(P,e)=>{const k=Math.min(1,e/.2);pz(P,'armL',-1.75*k,0,-.6);pz(P,'foreL',-1.5);pz(P,'armR',-1.85*k,0,.55);pz(P,'foreR',-1.6);pz(P,'head',.1);P.root.y=-1.5*k},
});
