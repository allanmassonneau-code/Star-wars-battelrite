// ===== Clan Hyûga =====
// Jûken (poing souple) : chaque frappe ferme des tenketsu (points de chakra) de la cible ; 8 fermés = chakra scellé (voir le trait de clan en bas)
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c1',[
 [1,'D','x.hy_palm','Hakke : Paume','Paume à bout portant devant soi : étourdit 0,4 s et ferme 2 tenketsu','jyuken'],
 [3,'D','x.hy_byak','Byakugan','8 s : chaque frappe de Jûken ferme 1 tenketsu de plus ; tu esquives la prochaine attaque et ta riposte cogne plus fort ; révèle les invisibles','jyuken'],
 [4,'C','x.hy_kaiten','Kaiten','Tourbillon divin 1,2 s sur place : renvoie tous les tirs, repousse et blesse qui t\'approche ; agir l\'arrête','jyuken'],
 [1,'B','x.hy_kusho','Hakke Kûshô','Paume d\'air à distance qui repousse violemment ; projeté contre un obstacle, l\'ennemi est étourdi','jyuken'],
 [1,'B','x.hy_lions','Jûho Sôshiken','Bondit avec deux lions de chakra : double frappe qui ferme 4 tenketsu et vole du chakra','jyuken'],
 [1,'A','x.hy_great','Hakke Kûhekishô','Mur d\'air géant qui avance : emporte les ennemis, détruit leurs tirs, puis les projette et les étourdit','jyuken'],
 [2,'C','x.hy_step','Pas du Hakke','2 glissades rapides ; ta frappe de Jûken suivante cogne plus fort et ferme 1 tenketsu de plus','jyuken'],
 [5,'S','x.hy_128','Hakke : 128 points','Fonce sur la cible ; si tu l\'atteins, 7 salves la bloquent, puis l\'étourdissent et la réduisent au silence','jyuken'],
 [5,'C','x.hy_64','Hakke : 64 points','Champ des trigrammes autour de toi : 6 salves qui ralentissent les ennemis dedans, la dernière étourdit et rend vulnérable','jyuken'],
]);
// ---------- aides ----------
const hyI=u=>units.indexOf(u);
const hyS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son sans la teinte « jyuken »
const HYV={jyuken:1,kaiten:1,byakugan:1,hakke64:1}; // éléments visuels du Jûken (ferment les tenketsu au corps à corps)
// frappe de Jûken dans un cône devant soi ; renvoie les ennemis touchés
function hyCone(u,a,R,arc,dmg,o){const L=[],V=VFX;VFX='jyuken';for(const e of enemies(u))if(dist(u,e)<R+e.r&&angDiff(ang(u,e),a)<arc/2&&hit(e,u,dmg,Object.assign({melee:1},o)))L.push(e);VFX=V;return L}
// cible d'une ruée : ennemi à portée dans la direction visée (±0,6 rad), le plus proche du curseur — jamais derrière soi
function hyPick(u,a,td,R){const c=fwd(u,a,Math.min(td,R));let b=null,bd=1e9;for(const e of enemies(u)){const d=dist(u,e);if(d>R+e.r||(d>50&&angDiff(ang(u,e),a)>.6))continue;const s=Math.hypot(e.x-c.x,e.y-c.y);if(s<bd){bd=s;b=e}}return b}
// coupe l'animation d'un jutsu interrompu (une ANIM passe devant tout, même la pose d'étourdissement)
const hyAnimOff=(u,k)=>{if(u&&u.anim&&u.anim.k===k)u.anim=null};
// cible bloquée par une rafale de frappes (sans le texte « étourdi » à chaque coup)
const hyLock=(e,d)=>{if(e.unstop>0)return;e.stun=Math.max(e.stun,d);e.cast=null;e.dash=null;e.spin=null;e.flame=null};
// ---------- tenketsu : points de chakra fermés sur la cible (hy_tk), tenus 3,5 s puis perdus un à un ----------
const HYMAX=8;let hyF=-1;
const hyTkN=t=>{const n=t.hy_tk||0;if(!n)return 0;const o=SIMT-(t.hy_tkU||0);return o<=0?n:Math.max(0,n-1-Math.floor(o/.6))};
function hyTk(src,t,n){if(!t||t.dead||n<=0)return;const d=Math.min(t.energy||0,3*n);t.energy-=d;if(t.hy_imU>SIMT)return; // (SIMT peut être < 0 juste après le chargement : pas de « ||0 »)
 const c=Math.min(HYMAX,hyTkN(t)+n);t.hy_tk=t.hy_tkN=c;t.hy_tkU=SIMT+3.5;
 if(c>=HYMAX){t.hy_tk=t.hy_tkN=0;t.hy_imU=SIMT+5;if(t.unstop<=0){t.silence=Math.max(t.silence,1);if(t.cast){t.cast=null;say(t,'INTERROMPU','#fc6')}}
  // texte placé au-dessus des autres (dégâts, « étourdi »…) qui tombent souvent sur la même frappe
  jx({jfx:'hy_seal',ti:hyI(t),x:t.x,y:t.y,t:.9,m:.9});if(near(t.x,t.y))txt.push({x:t.x,y:t.y,z:122,s:'TENKETSU SCELLÉS',col:'#dfe8ff',t:1});hyS('genjutsu',t)}}
// frappe de salve (64 / 128) : dégâts seulement sur certaines salves, sinon tenketsu fermés directement (moins de chiffres à l'écran)
function hyVolley(o,e,dmg,n,opt){if(dmg>0)return hit(e,o,dmg,Object.assign({melee:1,unblockable:1,hy_tk:n},opt));if(e.phase>0||e.deflect>0)return false;
 if(e.dodge>0){e.dodge=0;e.haste=Math.max(e.haste,1.5);say(e,'ESQUIVE','#cf6');return false}hyTk(o,e,n+(o.hy_byak>0?1:0));e.flash=.08;return true}
Object.assign(NAT,{
 // paume à bout portant : l'onde traverse le corps de la cible
 hy_palm:S_('Hakke : Paume','Paume à bout portant devant soi : étourdit 0,4 s et ferme 2 tenketsu',8,{hero:'quigon',line:{len:125,w:84},ai:RG(125,.65)},(u,a)=>{S('jyuken',u);anim(u,'hy_palm',.45);
  jx({jfx:'hy_push',ui:hyI(u),x:u.x,y:u.y,a,r:125,t:.32,m:.32});
  for(const e of hyCone(u,a,125,1.25,8,{stun:.4,hy_tk:2}))jx({jfx:'hy_stamp',ti:hyI(e),x:e.x,y:e.y,a:ang(u,e),t:.55,m:.55})}),
 // Byakugan : vision des réseaux de chakra
 hy_byak:S_('Byakugan','8 s : chaque frappe de Jûken ferme 1 tenketsu de plus ; tu esquives la prochaine attaque et ta riposte cogne plus fort ; révèle les invisibles',9,{hero:'lando',ai:SELF(330,.6)},(u)=>{S('jyuken',u);hyS('genjutsu',u);anim(u,'hy_byak',.7);u.hy_byak=8;
  jx({jfx:'hy_vision',ui:hyI(u),x:u.x,y:u.y,r:520,t:1.1,m:1.1});jx({jfx:'hy_view',ui:hyI(u),x:u.x,y:u.y,t:.9,m:.9});
  u.dodge=Math.max(u.dodge,8);u.hy_dg=1;for(const e of enemies(u))if(dist(u,e)<520){e.stealth=0;jx({jfx:'hy_net',ti:hyI(e),x:e.x,y:e.y,t:1.6,m:1.6})}}),
 // Kaiten : dôme de chakra qui tourne
 hy_kaiten:S_('Kaiten','Tourbillon divin 1,2 s sur place : renvoie tous les tirs, repousse et blesse qui t\'approche ; agir l\'arrête',8,{hero:'obiwan',tele:{self:1,r:100},ai:DEF},(u)=>{S('jyuken',u);hyS('wind',u);anim(u,'hy_kaiten',1.2);
  u.deflect=Math.max(u.deflect,1.2);u.root=Math.max(u.root,.15);
  aux.push({type:'hy_kaiten',x:u.x,y:u.y,r:100,t:1.2,m:1.2,team:u.team,owner:u,ui:hyI(u),vfx:'jyuken',k:0,hs:new Set(),n:0});
  jx({jfx:'hy_dome',ui:hyI(u),x:u.x,y:u.y,r:100,t:1.2,m:1.2})}),
 // Kûshô : bulle de vide d'air ; contre un obstacle, la cible est écrasée (étourdie)
 hy_kusho:S_('Hakke Kûshô','Paume d\'air à distance qui repousse violemment ; projeté contre un obstacle, l\'ennemi est étourdi',8,{hero:'quigon',line:{len:430,w:30},ai:RG(430,.6)},(u,a)=>{S('jyuken',u);hyS('wind',u);anim(u,'hy_kusho',.5);
  jx({jfx:'hy_muzzle',ui:hyI(u),x:u.x,y:u.y,a,t:.3,m:.3});
  proj(u,a,{spd:980,r:13,dmg:20,life:.44,col:'#cfe0ff',kind:'hy_kusho',big:1,o:{kb:720,wall:1,hy_tk:1},onHit:(p,t)=>jx({jfx:'hy_burst',x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.45,m:.45})})}),
 // Jûho Sôshiken : deux lions de chakra sur les poings
 hy_lions:S_('Jûho Sôshiken','Bondit avec deux lions de chakra : double frappe qui ferme 4 tenketsu et vole du chakra',11,{hero:'quigon',line:{len:200,w:70},ai:{mode:'gap',min:30,max:205,p:.6}},(u,a,td)=>{S('jyuken',u);hyS('roar',u);anim(u,'hy_lion',.62);
  jx({jfx:'hy_lions',ui:hyI(u),x:u.x,y:u.y,t:.62,m:.62});
  const bite=i=>{if(u.dead||u.stun>0)return;for(const e of hyCone(u,u.aim,115,1.2,8,{hy_tk:2,slow:i?0:.8,kb:i?300:0})){const s=Math.min(e.energy,5);e.energy-=s;u.energy=Math.min(100,u.energy+s);jx({jfx:'hy_bite',ti:hyI(e),x:e.x,y:e.y,a:ang(u,e),n:i,t:.42,m:.42})}if(near(u.x,u.y))S('jyuken',u)};
  dash(u,a,clamp((td||200)-45,0,160),.16,{end:()=>{bite(0);later(u,.16,()=>bite(1))}})}),
 // Kûhekishô : un mur d'air qui avance et emporte tout
 hy_great:S_('Hakke Kûhekishô','Mur d\'air géant qui avance : emporte les ennemis, détruit leurs tirs, puis les projette et les étourdit',13,{hero:'quigon',line:{len:380,w:170},ai:RG(320,.6)},(u,a)=>{S('jyuken',u);hyS('heavy',u);hyS('wind',u);anim(u,'hy_kuheki',.65);
  const c=fwd(u,a,34);jx({jfx:'hy_twin',ui:hyI(u),x:u.x,y:u.y,a,t:.42,m:.42});
  aux.push({type:'hy_wall',x:c.x,y:c.y,a,w:170,len:0,t:.52,m:.52,team:u.team,owner:u,ui:hyI(u),vfx:'jyuken',k:0,sp:640,hs:new Set(),car:new Set()});
  if(near(u.x,u.y))shake=Math.max(shake,.15)}),
 // Pas du Hakke : glissade souple, les paumes se chargent
 hy_step:S_('Pas du Hakke','2 glissades rapides ; ta frappe de Jûken suivante cogne plus fort et ferme 1 tenketsu de plus',5,{hero:'ahsoka',charges:2,ai:GAP},(u,a,td)=>{hyS('dash',u);anim(u,'hy_glide',.24);
  jx({jfx:'hy_steps',x:u.x,y:u.y,a,t:.5,m:.5});u.hy_stepB=2.5;
  dash(u,a,clamp(td||190,70,190),.17,{jump:8,end:()=>jx({jfx:'hy_steps',x:u.x,y:u.y,a,t:.4,m:.4,b:1})})}),
 // 128 points : fond sur la cible puis l'enchaîne dans le champ des trigrammes
 hy_128:ULT('Hakke : 128 points','Fonce sur la cible ; si tu l\'atteins, 7 salves la bloquent, puis l\'étourdissent et la réduisent au silence',{line:{len:280,w:36},ai:{max:270,p:.8}},(u,a,td)=>{const e=hyPick(u,a,td||220,280),p=e||fwd(u,a,Math.min(td||250,280)),b=ang(u,p),dd=Math.max(0,dist(u,p)-36);
  hyS('dash',u);anim(u,'hy_glide',.22);u.aim=b;jx({jfx:'hy_steps',x:u.x,y:u.y,a:b,t:.5,m:.5});
  dash(u,b,dd,.2,{end:()=>{if(u.dead||u.stun>0)return;const t=nearE(u,u.x,u.y,96);if(!t){say(u,'MANQUÉ','#9fb3d9');return}u.aim=ang(u,t);
   // la 1re salve est le contact : esquive, intangibilité, Kaiten (renvoi) ou contre l'annulent
   aux.push({type:'hy_combo',x:(u.x+t.x)/2,y:(u.y+t.y)/2,r:115,t:1.4,m:1.4,team:u.team,owner:u,tg:t,ui:hyI(u),ti:hyI(t),vfx:'jyuken',k:0,n:0,kind:'128'})}})}),
 // 64 points : champ des huit trigrammes autour de soi, salves sur tous ceux qui y restent
 hy_64:ULT('Hakke : 64 points','Champ des trigrammes autour de toi : 6 salves qui ralentissent les ennemis dedans, la dernière étourdit et rend vulnérable',{hero:'mace',tele:{self:1,r:150},ai:SELF(140,.8)},(u)=>{S('jyuken',u);anim(u,'hy_stance',.5);
  aux.push({type:'hy_f64',x:u.x,y:u.y,r:150,t:1.45,m:1.45,team:u.team,owner:u,ui:hyI(u),vfx:'jyuken',k:.3,n:0,kind:'64'})}),
});
Object.assign(NATHERO,{hy:'quigon'});
// ---------- logique des objets ----------
// Kaiten : suit le lanceur, repousse ceux qui entrent, renvoie les tirs vers leur tireur
AUXF.hy_kaiten=x=>{const o=x.owner;
 // agir (mudras, autre jutsu, coup, glissade) arrête le tourbillon ; un nouveau lancement se voit au saut de relT / swing / thrT
 const act=o&&(o.cast||o.dash||(o.relT||0)>(x.rl??9)+.01||(o.swing||0)>(x.sw??9)+.01||(o.thrT||0)>(x.th??9)+.01);
 if(!o||o.dead||o.stun>0||act){x.t=0;if(o){o.deflect=0;hyAnimOff(o,'hy_kaiten')}return}x.rl=o.relT||0;x.sw=o.swing||0;x.th=o.thrT||0;
 o.root=Math.max(o.root,.1);if(!o.ctrl)o.aiT=Math.max(o.aiT||0,.1); // un bot tient son tourbillon jusqu'au bout
 x.x=o.x;x.y=o.y;const V=VFX;VFX='jyuken';
 for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y),m=x.r+e.r-12;if(d>=m)continue;
  if(!x.hs.has(e)){x.hs.add(e);if(hit(e,o,x.n?8:10,{kb:430,fx:x.x,fy:x.y,hy_tk:1})&&near(e.x,e.y))sparks(e.x,e.y,'#ffffff',8,'jyuken')}
  if(e.unstop<=0&&d>1){e.x=x.x+(e.x-x.x)/d*m;e.y=x.y+(e.y-x.y)/d*m;collide(e)}}
 VFX=V;x.n=1;
 for(const p of projs){if(p.owner.team===x.team||p.grenade||p.dead||p.life<=0||Math.hypot(p.x-x.x,p.y-x.y)>x.r)continue;
  // tirs utilitaires (grappin, ancre, échange, traîne) : arrêtés net, pas renvoyés (leur effet se retournerait contre le Hyûga)
  if(p.hook||p.anchor||p.swap||p.drag){p.life=0;if(near(p.x,p.y))sparks(p.x,p.y,'#ffffff',6,'jyuken');continue}
  const sh=p.owner,sp=Math.max(520,Math.hypot(p.vx,p.vy)*1.05),b=sh&&!sh.dead?ang(p,sh)+(rnd()-.5)*.1:Math.atan2(p.y-x.y,p.x-x.x);
  p.owner=o;p.vx=Math.cos(b)*sp;p.vy=Math.sin(b)*sp;p.life=Math.max(p.life,.8);p.hitSet=null;if(near(p.x,p.y)){sparks(p.x,p.y,'#ffffff',6,'jyuken');if(!(x.rv>SIMT)){x.rv=SIMT+.35;say(o,'RENVOI !','#cfe0ff');hyS('deflect',o)}}}};
// Kûhekishô : le front du mur avance ; ennemis touchés emportés, tirs ennemis détruits ; à la fin, projette et étourdit
AUXF.hy_wall=(x,dt)=>{const o=x.owner,ca=Math.cos(x.a),sa=Math.sin(x.a),V=VFX;
 if(x.t>0){const mv=x.sp*dt;x.x=clamp(x.x+ca*mv,B.x+10,B.x+B.w-10);x.y=clamp(x.y+sa*mv,B.y+10,B.y+B.h-10);x.len+=mv;
  if(near(x.x,x.y)&&rnd()<.7){const s=(rnd()-.5)*x.w;fx.push({x:x.x-sa*s,y:x.y+ca*s,z:4,vx:ca*260+(rnd()-.5)*90,vy:sa*260+(rnd()-.5)*90,t:.4,m:.4,col:'#eef0f4',r:1.4+rnd()*1.6,vfx:'smoke'})}}
 VFX='jyuken';
 for(const e of enemies(o)){const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;if(Math.abs(s)>x.w/2+e.r)continue;
  // contact : seuls ceux vraiment touchés (ni esquive, ni intangibles) sont emportés
  if(!x.hs.has(e)){if(f>-30&&f<e.r+16){x.hs.add(e);if(hit(e,o,18,{slow:1.2,hy_tk:1,unblockable:1})){x.car.add(e);if(near(e.x,e.y))sparks(e.x,e.y,'#ffffff',10,'jyuken')}}}
  else if(x.t>0&&x.car.has(e)&&e.unstop<=0&&f<e.r+8){const pu=e.r+8-f;e.x+=ca*pu;e.y+=sa*pu;e.kx=e.ky=0;collide(e)}}
 for(const p of projs)if(p.owner.team!==x.team&&!p.dead&&p.life>0){const dx=p.x-x.x,dy=p.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;if(f>-40&&f<p.r+12&&Math.abs(s)<x.w/2+p.r){p.life=0;if(near(p.x,p.y))sparks(p.x,p.y,'#cfe0ff',6,'jyuken')}}
 if(x.t<=0&&!x.done){x.done=1;for(const e of x.car){if(e.dead)continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa;
   if(f>-50&&f<e.r+70&&Math.abs(-dx*sa+dy*ca)<x.w/2+e.r+30)hit(e,o,5,{kb:560,stun:.4,wall:.6,fx:x.x-ca*80,fy:x.y-sa*80,unblockable:1})}
  jx({jfx:'hy_wallend',x:x.x,y:x.y,a:x.a,w:x.w,t:.45,m:.45});if(near(x.x,x.y)){shake=Math.max(shake,.18);S('jyuken',o)}}
 VFX=V};
// 128 points : 7 salves (2, 4, 8 … 128) ; la cible reste bloquée tant que le lanceur n'est pas interrompu
const HY128=[2,5,0,5,0,5,14]; // dégâts de chaque salve (la 1re = le contact)
AUXF.hy_combo=x=>{const o=x.owner,e=x.tg;if(x.end||x.n>=7)return;
 if(!e||e.dead||e.phase>0||!o||o.dead||o.stun>0||dist(o,e)>140){x.end=1;x.t=Math.min(x.t,.25);hyAnimOff(o,'hy_rapid');return}
 o.root=Math.max(o.root,.12);o.aim=ang(o,e);if(x.n)hyLock(e,.15);if(x.k>0)return;
 x.n++;const fin=x.n===7,V=VFX;x.k=x.n===6?.2:.1;VFX='jyuken';
 const ok=hyVolley(o,e,HY128[x.n-1],fin?2:1,fin?{stun:.35,kb:420}:{});VFX=V;
 if(x.n===1){if(!ok){x.end=1;x.t=.3;return}hyLock(e,.15)}
 // silence finale : déjà donnée si les tenketsu viennent d'être scellés (un seul texte à l'écran)
 if(fin&&ok&&!e.dead&&e.unstop<=0&&!(e.silence>.9)){e.silence=Math.max(e.silence,1);say(e,'SILENCE','#9df')}
 anim(o,fin?'hy_finale':'hy_rapid',fin?.5:.3);jx({jfx:'hy_hits',ui:hyI(o),ti:hyI(e),x:e.x,y:e.y,n:x.n,a:ang(o,e),t:fin?.7:.2,m:fin?.7:.2});
 jx({jfx:'hy_count',x:x.x,y:x.y,r:x.r,n:2**x.n,fin:fin?1:0,t:fin?1.1:.11,m:fin?1.1:.11});
 if(fin){x.t=.55;jx({jfx:'hy_final',x:e.x,y:e.y,t:.6,m:.6});if(near(e.x,e.y)){shake=Math.max(shake,.3);hyS('heavy',o)}}else S('jyuken',o)};
// 64 points : 6 salves sur tous les ennemis du champ (2, 4 … 64), la dernière étourdit et rend vulnérable
AUXF.hy_f64=x=>{const o=x.owner;if(x.end||x.n>=6)return;if(!o||o.dead||o.stun>0||Math.hypot(o.x-x.x,o.y-x.y)>40){x.end=1;x.t=Math.min(x.t,.25);hyAnimOff(o,'hy_rapid');return}
 o.root=Math.max(o.root,.12);if(x.k>0)return;
 x.n++;x.k=.17;const fin=x.n===6,V=VFX;VFX='jyuken';
 for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r&&hyVolley(o,e,fin?10:x.n%2?0:6,1,fin?{stun:.6,vuln:3}:{slow:.6})){if(e.unstop<=0)e.slow=Math.max(e.slow,.6);
  jx({jfx:'hy_hits',ui:hyI(o),ti:hyI(e),x:e.x,y:e.y,n:x.n,a:ang(o,e),small:1,t:fin?.5:.2,m:fin?.5:.2})}
 VFX=V;anim(o,'hy_rapid',.3);jx({jfx:'hy_count',x:x.x,y:x.y,r:x.r,n:2**x.n,fin:fin?1:0,t:fin?1:.17,m:fin?1:.17});
 if(fin){x.t=.4;if(near(x.x,x.y)){shake=Math.max(shake,.2);hyS('heavy',o)}}else S('jyuken',o)};
// ---------- dessins ----------
// empreinte de paume (doigts vers le haut), en coordonnées écran
function hyHand(x,y,s,col){g.fillStyle=col;g.beginPath();g.ellipse(x,y+s*.25,s*.62,s*.7,0,0,7);g.fill();
 for(let i=0;i<4;i++){g.beginPath();g.ellipse(x+(i-1.5)*s*.31,y-s*.6-(i===1||i===2?s*.12:0),s*.13,s*.42,(i-1.5)*.1,0,7);g.fill()}
 g.beginPath();g.ellipse(x-s*.72,y+s*.08,s*.15,s*.38,-.7,0,7);g.fill()}
// étoile d'impact
function hyStar(x,y,R,col){g.fillStyle=col;g.beginPath();for(let i=0;i<8;i++){const b=i*Math.PI/4+.2,L=i%2?R*.38:R;g.lineTo(x+Math.cos(b)*L,y+Math.sin(b)*L*.8)}g.closePath();g.fill()}
// texte détouré
function hyTxt(s,x,y,z,col){g.font=`bold ${z}px "Trebuchet MS",system-ui,sans-serif`;g.textAlign='center';g.lineJoin='round';g.lineWidth=4;g.strokeStyle='rgba(12,16,40,.8)';g.strokeText(s,x,y);g.fillStyle=col;g.fillText(s,x,y)}
const hyLine=(L,col,w)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();L.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.stroke()};
// œil du Byakugan : amande, iris pâle sans pupille, veines aux tempes
function hyEye(x,y,s,al){g.save();g.globalAlpha*=al;g.lineJoin='round';
 g.fillStyle='#ffffff';g.strokeStyle='#1e2238';g.lineWidth=2*s;g.beginPath();g.moveTo(x-15*s,y);g.quadraticCurveTo(x,y-12*s,x+15*s,y);g.quadraticCurveTo(x,y+12*s,x-15*s,y);g.fill();g.stroke();
 g.fillStyle='#dfe3f4';g.beginPath();g.arc(x,y,6.2*s,0,7);g.fill();g.strokeStyle='#9aa6d0';g.lineWidth=1.3*s;g.stroke();circ(x-2*s,y-2.2*s,1.6*s,'#ffffff');
 g.strokeStyle='#5a68b8';g.lineWidth=1.6*s;g.lineCap='round';g.beginPath();for(const d of[-1,1])for(let i=0;i<3;i++){g.moveTo(x+d*16.5*s,y+(i-1)*2.5*s);g.quadraticCurveTo(x+d*(20+i)*s,y+(i-1)*5*s,x+d*(23+i*2.5)*s,y+(i-1)*7*s-3*s)}g.stroke();g.restore()}
// tête de lion de chakra de profil (gueule vers +x), contour sombre comme les ninjas
function hyLion(x,y,s,a,al){g.save();g.translate(x,y);if(Math.cos(a)<0){g.scale(-1,1);g.rotate(Math.PI-a)}else g.rotate(a);g.globalAlpha*=al;g.lineJoin='round';g.lineCap='round';
 g.globalCompositeOperation='lighter';g.fillStyle='rgba(170,200,255,.4)';g.beginPath();g.moveTo(-8*s,-14*s);g.quadraticCurveTo(-30*s,-12*s,-44*s,-2*s);g.quadraticCurveTo(-30*s,4*s,-34*s,12*s);g.quadraticCurveTo(-20*s,14*s,-8*s,14*s);g.fill();
 g.globalCompositeOperation='source-over';g.strokeStyle='#1a2458';g.lineWidth=1.8*s;
 g.fillStyle='#4a6ad8';g.beginPath();for(let i=0;i<9;i++){const b=i*Math.PI*2/9-.3;g.arc(-4*s+Math.cos(b)*12*s,Math.sin(b)*12*s,5.5*s,b-Math.PI/2,b+Math.PI/2)}g.closePath();g.fill();g.stroke();
 g.fillStyle='#6a8ae8';g.beginPath();g.arc(-4*s,0,10*s,0,7);g.fill();
 g.fillStyle='#8ab0ff';g.beginPath();g.ellipse(2*s,-1*s,10*s,9*s,0,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(-4*s,-7*s);g.quadraticCurveTo(-4*s,-15*s,2*s,-10*s);g.fill();g.stroke();
 g.fillStyle='#1a2458';g.beginPath();g.moveTo(8*s,3*s);g.lineTo(18*s,4.5*s);g.lineTo(14*s,10*s);g.closePath();g.fill();
 g.fillStyle='#dfe8ff';g.beginPath();g.moveTo(5*s,-4*s);g.quadraticCurveTo(13*s,-6*s,18*s,-1*s);g.quadraticCurveTo(19*s,3*s,16*s,3.5*s);g.lineTo(7*s,3*s);g.closePath();g.fill();g.stroke();
 g.beginPath();g.moveTo(8*s,6*s);g.quadraticCurveTo(11*s,11*s,14*s,10.5*s);g.lineTo(10*s,7*s);g.closePath();g.fill();g.stroke();
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(15.5*s,3.4*s);g.lineTo(14.6*s,6.4*s);g.lineTo(13.4*s,3.4*s);g.fill();g.beginPath();g.moveTo(11.5*s,3.2*s);g.lineTo(10.8*s,5.6*s);g.lineTo(9.8*s,3.1*s);g.fill();circ(17.4*s,-1.4*s,1.6*s,'#1a2458');
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(1*s,-4*s);g.lineTo(7*s,-5.5*s);g.lineTo(5.5*s,-2.5*s);g.closePath();g.fill();g.beginPath();g.moveTo(0,-6.5*s);g.lineTo(8*s,-7.5*s);g.stroke();g.restore()}
// champ des huit trigrammes au sol (lit = trigrammes allumés)
const HYTRI=[7,0,4,3,5,2,1,6];
function hyField(x,k,t,lit,spin,pulse){const q=P(x.x,x.y,0),s=q.s,R=x.r*s*Math.min(1,(x.m-x.t)/.2+.35),r2=R*.26;
 g.fillStyle=rgba('#8ab0ff',.1*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#e8ecff',.9*k);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();
 g.strokeStyle=rgba('#8ab0ff',.8*k);g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,R*.9,R*.9*K,0,0,7);g.stroke();g.beginPath();g.ellipse(q.x,q.y,R*.36,R*.36*K,0,0,7);g.stroke();
 if(pulse>0){g.strokeStyle=rgba('#ffffff',.8*k*(1-pulse));g.lineWidth=5;g.beginPath();g.ellipse(q.x,q.y,R*pulse,R*pulse*K,0,0,7);g.stroke()}
 g.save();g.translate(q.x,q.y);g.scale(1,K);
 g.save();g.rotate(spin);g.fillStyle=rgba('#1a2040',.45*k);g.beginPath();g.arc(0,0,r2,0,7);g.fill();
 g.fillStyle=rgba('#eef2ff',.8*k);g.beginPath();g.arc(0,0,r2,-Math.PI/2,Math.PI/2);g.arc(0,r2/2,r2/2,Math.PI/2,Math.PI*1.5);g.arc(0,-r2/2,r2/2,Math.PI/2,-Math.PI/2,true);g.fill();
 circ(0,r2/2,r2*.16,rgba('#1a2040',.8*k));circ(0,-r2/2,r2*.16,rgba('#eef2ff',.85*k));g.restore();
 for(let i=0;i<8;i++){const b=i*Math.PI/4+spin*.5,on=i<lit;g.save();g.rotate(b);g.translate(R*.63,0);g.rotate(Math.PI/2);g.fillStyle=on?rgba('#ffffff',k):rgba('#8ab0ff',.5*k);
  for(let l=0;l<3;l++){const yy=(l-1)*4.6*s;if((HYTRI[i]>>l)&1)g.fillRect(-9*s,yy-1.3*s,18*s,2.6*s);else{g.fillRect(-9*s,yy-1.3*s,7.5*s,2.6*s);g.fillRect(1.5*s,yy-1.3*s,7.5*s,2.6*s)}}
  if(on){g.globalCompositeOperation='lighter';g.fillStyle=rgba('#8ab0ff',.35*k);g.beginPath();g.ellipse(0,0,13*s,10*s,0,0,7);g.fill()}g.restore()}
 g.restore()}
AUXD.hy_combo=(x,k,t)=>hyField(x,k,t,x.n===7?8:Math.min(7,x.n),.3,0);
AUXD.hy_f64=(x,k,t)=>hyField(x,k,t,8,t*.7,x.n>0&&x.n<7?1-Math.max(0,x.k)/.17:0);
// Kaiten : tourbillon de poussière au sol
AUXD.hy_kaiten=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,R=x.r*s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#cfe0ff',.1*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#ffffff',.75*k);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();
 for(let i=0;i<5;i++){const a0=t*11+i*1.26,rr=R*(.42+i*.12);g.strokeStyle=rgba(i%2?'#8ab0ff':'#dfe8ff',.65*k);g.lineWidth=(3.4-i*.4)*s;g.beginPath();g.ellipse(q.x,q.y,rr,rr*K,0,a0,a0+1.7);g.stroke()}};
// Kûhekishô : front d'air courbe et haut qui avance, sillage au sol, ondes de pression qui montent
AUXD.hy_wall=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),hw=x.w/2,N=10,tl=Math.min(x.len||0,170),A=(s,f,z)=>P(x.x-sa*s+ca*f,x.y+ca*s+sa*f,z),
  bd=i=>Math.cos((i/N-.5)*Math.PI)*26,row=z=>{const L=[];for(let i=0;i<=N;i++)L.push(A(-hw+i*x.w/N,bd(i)-z*.15,z));return L},b0=row(0),b1=row(28),b2=row(58),b3=row(86);
 g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 poly([A(-hw*.85,-tl,0),A(hw*.85,-tl,0),b0[N],b0[0]],rgba('#8ab0ff',.1*k));
 poly(b0.concat(b1.slice().reverse()),rgba('#cfe0ff',.3*k));poly(b1.concat(b2.slice().reverse()),rgba('#8ab0ff',.2*k));poly(b2.concat(b3.slice().reverse()),rgba('#8ab0ff',.09*k));
 for(let j=0;j<3;j++){const z=(t*150+j*29)%86;hyLine(row(z),rgba('#ffffff',.45*k*(1-z/86)),2.2)}
 hyLine(b0,rgba('#ffffff',.95*k),4);hyLine(b1,rgba('#dfe8ff',.4*k),1.5);hyLine(b3,rgba('#cfe0ff',.3*k),1.5);
 g.strokeStyle=rgba('#ffffff',.4*k);g.lineWidth=1.4;g.beginPath();for(let i=0;i<9;i++){const s=-hw+((i*41+t*260)%x.w),b=Math.cos((s/x.w)*Math.PI)*26,q0=A(s,b,4),q1=A(s,b-8,40+(i%3)*16);g.moveTo(q0.x,q0.y);g.lineTo(q1.x,q1.y)}g.stroke()};
// projectile de Kûshô : bulle de vide (anneaux de pression, air aspiré vers le cœur)
PROJD.hy_kusho=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#cfe0ff',.28);g.beginPath();g.ellipse(-R*.5,0,R*1.35,R*.8,0,0,7);g.fill();
 for(let i=0;i<4;i++){const x=R*.4-i*R*.85;g.strokeStyle=rgba(i?'#8ab0ff':'#ffffff',.9-i*.18);g.lineWidth=i?2:4;g.beginPath();g.ellipse(x,0,R*(.32+i*.07),R*(1.3-i*.14),0,-1.4,1.4);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.55);g.lineWidth=1.2;g.beginPath();for(let i=0;i<6;i++){const b=i*1.05+t/70,c=Math.cos(b),d=Math.sin(b);g.moveTo(c*R*2-R*.4,d*R*1.5);g.lineTo(c*R*1.15-R*.4,d*R*.85)}g.stroke()};
// paume : arcs de pression qui partent de la main
JFXD.hy_push=(f,k,e,t,u)=>{const o=u||f,sa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),q=P(o.x+Math.cos(f.a)*20,o.y+Math.sin(f.a)*20,32),s=q.s;g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const d=(8+e*f.r*.85-i*15)*s;if(d<=0)continue;g.strokeStyle=rgba(i?'#8ab0ff':'#ffffff',(.95-i*.25)*k);g.lineWidth=(5-i)*s;g.beginPath();g.ellipse(q.x+Math.cos(sa)*d,q.y+Math.sin(sa)*d,d*.22+3*s,d*.5+8*s,sa,-1.15,1.15);g.stroke()}
 hyHand(q.x,q.y-4*s,9*s*(1+e*.6),rgba('#ffffff',.55*k))};
// empreinte de paume sur la cible + onde qui la traverse
JFXD.hy_stamp=(f,k,e,t,u,tg)=>{const T=tg||f,q=P(T.x,T.y,36),s=q.s,pop=1+.6*Math.max(0,1-e*5),sa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));g.globalCompositeOperation='lighter';
 if(e<.3)hyStar(q.x,q.y,(30-e*40)*s,rgba('#ffffff',.9*(1-e/.3)));
 hyHand(q.x,q.y,15*s*pop,rgba('#dfe8ff',.7*k));hyHand(q.x,q.y,8*s*pop,rgba('#ffffff',.65*k));
 for(let i=0;i<3;i++){const d=(12+e*50+i*10)*s,r=(14+e*30)*s;g.strokeStyle=rgba(i?'#8ab0ff':'#ffffff',(.9-i*.22)*k);g.lineWidth=(3.6-i*.9)*s;g.beginPath();g.ellipse(q.x+Math.cos(sa)*d,q.y+Math.sin(sa)*d,r*.32,r,sa,-1.2,1.2);g.stroke()}};
// Kûshô : départ (anneaux à la main) et impact (éclatement de pression)
JFXD.hy_muzzle=(f,k,e,t,u)=>{const o=u||f,sa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),q=P(o.x+Math.cos(f.a)*22,o.y+Math.sin(f.a)*22,32),s=q.s;g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const r=(6+e*30+i*7)*s;g.strokeStyle=rgba(i?'#8ab0ff':'#ffffff',(.9-i*.25)*k);g.lineWidth=2.5*s;g.beginPath();g.ellipse(q.x+Math.cos(sa)*i*9*s,q.y+Math.sin(sa)*i*9*s,r*.35,r,sa,0,7);g.stroke()}
 circ(q.x,q.y,9*s*k,rgba('#ffffff',.7*k))};
JFXD.hy_burst=(f,k,e,t)=>{const q=P(f.x,f.y,34),s=q.s,sa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),R=(14+e*46)*s;g.globalCompositeOperation='lighter';
 if(e<.25)hyStar(q.x,q.y,(34-e*60)*s,rgba('#ffffff',.85*(1-e/.25)));
 g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=3*s;g.beginPath();g.ellipse(q.x,q.y,R,R*.75,0,0,7);g.stroke();
 g.strokeStyle=rgba('#8ab0ff',.8*k);g.lineWidth=2*s;g.beginPath();for(let i=0;i<8;i++){const b=i*.785+.3,c=Math.cos(b),d=Math.sin(b);g.moveTo(q.x+c*R*.6,q.y+d*R*.45);g.lineTo(q.x+c*R*1.25,q.y+d*R*.95)}g.stroke();
 for(let i=0;i<2;i++){const d=(18+e*60+i*14)*s,r=(16+e*20)*s;g.strokeStyle=rgba('#dfe8ff',(.8-i*.3)*k);g.lineWidth=3*s;g.beginPath();g.ellipse(q.x+Math.cos(sa)*d,q.y+Math.sin(sa)*d,r*.3,r,sa,-1.1,1.1);g.stroke()}};
// Kûhekishô : deux paumes géantes au départ, bouffées d'air à la fin
JFXD.hy_twin=(f,k,e,t,u)=>{const o=u||f,ca=Math.cos(f.a),sa=Math.sin(f.a);g.globalCompositeOperation='lighter';
 for(const d of[-1,1]){const q=P(o.x+ca*(24+e*40)-sa*d*16,o.y+sa*(24+e*40)+ca*d*16,34),s=q.s;hyHand(q.x,q.y,(11+e*16)*s,rgba('#dfe8ff',.6*k))}
 const q=P(o.x+ca*30,o.y+sa*30,0),R=(40+e*110)*q.s,fa=Math.atan2(sa*K,ca);g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=4;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,fa-1,fa+1);g.stroke()};
JFXD.hy_wallend=(f,k,e,t)=>{const ca=Math.cos(f.a),sa=Math.sin(f.a);g.globalCompositeOperation='lighter';
 for(let i=0;i<6;i++){const sd=(i/5-.5)*f.w,q=P(f.x-sa*sd+ca*(10+e*30),f.y+ca*sd+sa*(10+e*30),20),r=(10+e*26)*q.s;g.strokeStyle=rgba(i%2?'#8ab0ff':'#ffffff',.8*k);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,r,r*.7,0,0,7);g.stroke()}};
// Kaiten : dôme de chakra (bandes qui tournent en sens contraires)
JFXD.hy_dome=(f,k,e,t,u)=>{if(!u||u.dead)return;
 // le dôme suit l'objet Kaiten (synchronisé) : s'il s'arrête plus tôt, le dôme éclate aussitôt
 if(!f.end&&e>.08){let on=0;for(const x of aux)if(x.type==='hy_kaiten'&&x.ui===f.ui){on=1;break}if(!on){f.end=1;f.t=Math.min(f.t,.2);return}}
 const q=P(u.x,u.y,0),s=q.s,R=f.r*s*Math.min(1,.35+e*7),H=R*.9,fd=Math.min(1,k*6);g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#cfe0ff',.1*fd);g.beginPath();g.ellipse(q.x,q.y-H*.45,R,H,0,0,7);g.fill();
 for(let i=0;i<6;i++){const sp=t*(i%2?13:-16)+i*1.1,y=q.y-H*(.08+i*.15),rx=R*Math.sqrt(Math.max(.05,1-Math.pow(.08+i*.15-.45,2)/.3));g.strokeStyle=rgba(i%2?'#ffffff':'#8ab0ff',(.8-i*.07)*fd);g.lineWidth=(i%2?2.4:4)*s;g.beginPath();g.ellipse(q.x,y,Math.max(4,rx),Math.max(2,rx*.28),(i-2.5)*.06,sp,sp+3.6);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.55*fd);g.lineWidth=2*s;g.beginPath();g.ellipse(q.x,q.y-H*.45,R,H,0,Math.PI*1.08,Math.PI*1.92);g.stroke();
 if(k<.18){const b=1-k/.18;g.strokeStyle=rgba('#ffffff',.8*(1-b));g.lineWidth=5;g.beginPath();g.ellipse(q.x,q.y,R*(1+b*.6),R*(1+b*.6)*K,0,0,7);g.stroke()}};
// Byakugan : onde de vision au sol + grand œil au-dessus de la tête
JFXD.hy_vision=(f,k,e,t,u)=>{const o=u||f,R=f.r*ezo(Math.min(1,e*1.5));g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#cfe0ff',.75*k);g.lineWidth=3;gEll(o.x,o.y,R);g.stroke();g.strokeStyle=rgba('#8ab0ff',.35*k);g.lineWidth=9;gEll(o.x,o.y,R*.96);g.stroke();
 const c=P(o.x,o.y,0);g.strokeStyle=rgba('#cfe0ff',.22*k);g.lineWidth=1.5;g.beginPath();for(let i=0;i<12;i++){const b=i*.524+t*.6,p=P(o.x+Math.cos(b)*R,o.y+Math.sin(b)*R,0),p0=P(o.x+Math.cos(b)*R*.55,o.y+Math.sin(b)*R*.55,0);g.moveTo(p0.x,p0.y);g.lineTo(p.x,p.y)}g.stroke();
 g.globalCompositeOperation='source-over';const q=P(o.x,o.y,0),pop=Math.min(1,e*6),al=Math.min(1,k*3)*pop,S=q.s*1.3;hyEye(q.x,q.y-92*S,S*(.95+.5*(1-pop)),al)};
// vue du Byakugan, pour le joueur qui l'active : voile bleuté et veines qui gagnent les bords de l'écran
JFXD.hy_view=(f,k,e,t,u)=>{if(!u||u!==player||u.dead)return;g.setTransform(RS,0,0,RS,0,0);const a=Math.min(1,e*6)*Math.min(1,k*2.5);
 const gr=g.createRadialGradient(W/2,H/2,H*.28,W/2,H/2,H*.95);gr.addColorStop(0,'rgba(200,215,255,0)');gr.addColorStop(1,rgba('#8a9ad8',.55*a));g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.strokeStyle=rgba('#5a68b8',.6*a);g.lineWidth=2;g.lineCap='round';g.beginPath();for(let i=0;i<14;i++){const b=i*.449+.2,c=Math.cos(b),d=Math.sin(b),R0=Math.hypot(W,H)*.55,R1=R0*(1-.32*Math.min(1,e*2.5));let x=W/2+c*R0,y=H/2+d*R0;g.moveTo(x,y);
  for(let j=1;j<=4;j++){const r=lerp(R0,R1,j/4),w=Math.sin(i*7.3+j*2.1)*14;x=W/2+c*r-d*w;y=H/2+d*r+c*w;g.lineTo(x,y)}}g.stroke()};
// réseau de chakra (tenketsu) : points repères sur le corps (unités de l'échelle du ninja, depuis les pieds)
const HYNET=[[0,30],[-6,34],[6,34],[0,25],[-5,20],[5,20],[0,40],[0,15]],HYLINK=[[6,1],[6,2],[1,0],[2,0],[0,3],[3,4],[3,5],[4,7],[5,7]];
JFXD.hy_net=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,tg.z||0),S=q.s*1.3,a=Math.min(1,k*3)*Math.min(1,e*6),pt=HYNET.map(([x,y])=>[q.x+x*S,q.y-y*S]);g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#8ab0ff',.75*a);g.lineWidth=1.8;g.beginPath();for(const [i,j] of HYLINK){g.moveTo(pt[i][0],pt[i][1]);g.lineTo(pt[j][0],pt[j][1])}g.stroke();
 for(const [x,y] of pt){circ(x,y,3.6*S*.6,rgba('#8ab0ff',.5*a));circ(x,y,1.7*S*.6,rgba('#ffffff',a))}};
// tenketsu scellés : les points convergent, sceau circulaire
JFXD.hy_seal=(f,k,e,t,u,tg)=>{const T=tg||f,q=P(T.x,T.y,T.z||0),S=q.s*1.3,cx=q.x,cy=q.y-27*S,m=Math.min(1,e*2.5);g.globalCompositeOperation='lighter';
 for(const [x,y] of HYNET){const px=q.x+x*S,py=q.y-y*S;circ(lerp(px,cx,m),lerp(py,cy,m),2.4*S*.7,rgba('#ffffff',k))}
 const R=(30-20*e)*S*.7;g.strokeStyle=rgba('#dfe8ff',.9*k);g.lineWidth=2.2;g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();g.beginPath();for(let i=0;i<4;i++){const b=i*Math.PI/2+e*2;g.moveTo(cx+Math.cos(b)*R*.3,cy+Math.sin(b)*R*.3);g.lineTo(cx+Math.cos(b)*R*1.25,cy+Math.sin(b)*R*1.25)}g.stroke()};
// Pas du Hakke : trigramme laissé sous les pieds
JFXD.hy_steps=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=(14+e*22)*s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#cfe0ff',.8*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();
 g.save();g.translate(q.x,q.y);g.scale(1,K);g.rotate(f.a+Math.PI/2);g.fillStyle=rgba('#ffffff',.8*k);const tri=f.b?5:2;for(let l=0;l<3;l++){const yy=(l-1)*4*s;if((tri>>l)&1)g.fillRect(-8*s,yy-1.1*s,16*s,2.2*s);else{g.fillRect(-8*s,yy-1.1*s,6.5*s,2.2*s);g.fillRect(1.5*s,yy-1.1*s,6.5*s,2.2*s)}}g.restore()};
// Jûho Sôshiken : un lion de chakra sur chaque poing, qui bondissent au moment des frappes
JFXD.hy_lions=(f,k,e,t,u)=>{if(!u||u.dead||u.stun>0)return;const a=u.aim,ca=Math.cos(a),sa=Math.sin(a),fa=Math.atan2(sa*K,ca),al=Math.min(1,k*4,e*8);
 for(const d of(Math.sin(a)<0?[1,-1]:[-1,1])){const j=d<0?Math.max(0,Math.min(1,(e-.28)/.2)):Math.max(0,Math.min(1,(e-.52)/.2)),fw=24+bump(j)*30,q=P(u.x+ca*fw-sa*d*15,u.y+sa*fw+ca*d*15,30+Math.sin(t*20+d)*1.5);hyLion(q.x,q.y,q.s*(.95+.4*bump(j)),fa,al)}};
JFXD.hy_bite=(f,k,e,t,u,tg)=>{const T=tg||f,q=P(T.x,T.y,34),fa=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),s=q.s*(1.25+e*.6);g.globalCompositeOperation='lighter';
 if(e<.3)hyStar(q.x,q.y,(36-e*50)*q.s,rgba('#ffffff',.9*(1-e/.3)));
 g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=2.5;g.beginPath();for(let i=0;i<5;i++){const b=fa+(i-2)*.35,r0=(10+e*12)*q.s,r1=(22+e*30)*q.s;g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1)}g.stroke();
 hyLion(q.x-Math.cos(fa)*(26-e*20)*q.s,q.y-Math.sin(fa)*(26-e*20)*q.s+(f.n?6:-6)*q.s,s,fa,Math.min(1,k*1.6))};
// salves de 64 / 128 points : nuée de paumes autour de la cible (plus il y a de points, plus il y a de mains)
JFXD.hy_hits=(f,k,e,t,u,tg)=>{const T=tg||f,q=P(T.x,T.y,0),S=q.s*1.3,n=f.n||1,fin=n>=7&&!f.small,m=f.small?3:Math.min(9,2+n);g.globalCompositeOperation='lighter';
 const o=u&&!u.dead?P(u.x,u.y,30):null;
 for(let i=0;i<m;i++){const b=n*2.3+i*2.4,r=(12+(i%3)*6)*S,x=q.x+Math.cos(b)*r,y=q.y-28*S+Math.sin(b)*r*.75;hyHand(x,y,(f.small?5.5:6.5)*S*(1+.4*(1-k)),rgba(i%2?'#8ab0ff':'#ffffff',.85*k));
  if(o&&i<3){g.strokeStyle=rgba('#cfe0ff',.45*k);g.lineWidth=2;g.beginPath();g.moveTo(lerp(o.x,x,.35),lerp(o.y,y,.35));g.lineTo(x,y);g.stroke()}}
 if(e<.35)hyStar(q.x,q.y-28*S,(fin?40:20)*S*(1-e),rgba('#ffffff',.8*(1-e/.35)));
 if(fin){const R=(20+e*70)*S;g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=4;g.beginPath();g.ellipse(q.x,q.y-24*S,R,R*.8,0,0,7);g.stroke()}};
// décompte des salves, écrit au bord avant du champ
JFXD.hy_count=(f,k,e,t)=>{const q=P(f.x,f.y+(f.r||100)*.86,0),pop=1+.5*Math.max(0,1-e*(f.fin?3:8));g.save();g.globalAlpha=Math.min(1,k*(f.fin?2:5));
 hyTxt(f.fin?f.n+' POINTS !':f.n+' POINTS',q.x,q.y+8,Math.round((f.fin?30:22)*pop),f.fin?'#ffffff':'#cfe0ff');g.restore()};
JFXD.hy_final=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=(30+e*150)*s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();
 g.strokeStyle=rgba('#8ab0ff',.6*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,R*.7,R*.7*K,0,0,7);g.stroke();
 const h=(60+e*120)*s,w=(24*k+4)*s;g.fillStyle=rgba('#dfe8ff',.35*k);g.beginPath();g.ellipse(q.x,q.y-h/2,w,h/2,0,0,7);g.fill();
 g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=2;g.beginPath();for(let i=0;i<8;i++){const b=i*.785,r0=R*.3,r1=R*.95;g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*K);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*K)}g.stroke()};
// ---------- états visibles : tenketsu fermés sur n'importe quel ninja ----------
STATD.push((u,p,S,sk)=>{if(u.dead)return;let n;if(net.role==='guest')n=u.hy_tkN||0;else{n=hyTkN(u);if(u.hy_tk)u.hy_tkN=n} // l'hôte rafraîchit aussi la copie réseau (même sans Hyûga en vie)
 if(!n)return;const t=performance.now()/1000,al=n>=6?.7+.3*Math.sin(t*14):.95,z=S*sk;
 g.save();g.globalCompositeOperation='lighter';for(let i=0;i<HYMAX;i++){const x=p.x+HYNET[i][0]*z,y=p.y-HYNET[i][1]*z;if(i<n){circ(x,y,4*z*.6,rgba('#8ab0ff',.6*al));circ(x,y,2*z*.6,rgba('#ffffff',al))}else circ(x,y,1.3*z*.6,rgba('#8ab0ff',.45))}g.restore()});
AFTER.push(()=>UK.push('hy_tkN','hy_byak','hy_stepB'));
// ---------- animations 3D ----------
Object.assign(ANIM,{
 // paume à une main : frappe sèche, léger retour
 hy_palm:(P,e)=>{const k=e<.2?ezo(e/.2):1-.3*ezo((e-.2)/.8);pz(P,'armR',-1.62*k,0,.08);pz(P,'foreR',-.08);pz(P,'armL',.5*k,0,.3);pz(P,'foreL',-1.3*k);pz(P,'chest',.24*k,-.35*k);pz(P,'head',0,.2*k);P.root.y=-4*k;P.root.z=9*k;pz(P,'thighR',-.8*k);pz(P,'shinR',.75*k);pz(P,'thighL',.45*k);pz(P,'shinL',.5*k)},
 // Kûshô : poussée longue, bras tendu à hauteur d'épaule, l'autre main en garde
 hy_kusho:(P,e)=>{const k=e<.15?ezo(e/.15):1;pz(P,'armR',-1.7*k,0,.04);pz(P,'foreR',0);pz(P,'armL',-.5*k,0,.4);pz(P,'foreL',-1.7*k);pz(P,'chest',.18*k,-.45*k);pz(P,'head',.05,.3*k);P.root.y=-5*k;P.root.z=11*k;pz(P,'thighR',-.95*k);pz(P,'shinR',.9*k);pz(P,'thighL',.55*k);pz(P,'shinL',.45*k)},
 // Kûhekishô : les deux paumes poussent, posture très basse
 hy_kuheki:(P,e)=>{const k=e<.18?ezo(e/.18):1;pz(P,'armL',-1.55*k,0,-.3);pz(P,'armR',-1.55*k,0,.3);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'chest',.38*k);P.root.z=13*k;P.root.y=-8*k;pz(P,'thighR',-1.15*k);pz(P,'shinR',1.05*k);pz(P,'thighL',.75*k);pz(P,'shinL',.55*k);pz(P,'head',-.1*k)},
 // Kaiten : rotation rapide, bras écartés (l'un haut, l'autre bas)
 hy_kaiten:(P,e)=>{P.rootR.y=Math.PI*6*ezio(e);const k=Math.min(1,e*6);pz(P,'armL',-.3,0,1.85*k);pz(P,'armR',-.3,0,-1.05*k);pz(P,'foreL',-.1);pz(P,'foreR',-.15);P.root.y=-2.5*k;pz(P,'thighL',-.1,0,.28*k);pz(P,'thighR',.1,0,-.28*k);pz(P,'shinL',.3*k);pz(P,'shinR',.3*k);pz(P,'chest',.06)},
 // Byakugan : signe des mains, puis la tête se relève, main à la tempe
 hy_byak:(P,e)=>{const k=Math.min(1,e/.2);if(e<.5){pz(P,'armL',-1.25*k,0,-.45);pz(P,'foreL',-1.85);pz(P,'armR',-1.25*k,0,.45);pz(P,'foreR',-1.85);pz(P,'head',.28*k);P.root.y=-1.5*k}
  else{const j=ezo(Math.min(1,(e-.5)/.18));pz(P,'armR',-1.3-.95*j,0,.5);pz(P,'foreR',-1.9-.55*j);pz(P,'armL',-.5+.2*j,0,.35);pz(P,'foreL',-.8);pz(P,'head',.28-.55*j,.15*j);pz(P,'chest',-.12*j);P.root.y=-1.5+1.5*j}},
 // glissade : corps penché, bras en arrière
 hy_glide:(P,e)=>{const k=Math.min(1,e*5)*(1-Math.max(0,e-.7)/.3*.6);pz(P,'chest',.55*k);pz(P,'head',-.35*k);pz(P,'armL',.95*k,0,.35*k);pz(P,'armR',.95*k,0,-.35*k);pz(P,'foreL',-.2);pz(P,'foreR',-.2);P.root.y=-4*k;pz(P,'thighL',-.9*k);pz(P,'shinL',.6*k);pz(P,'thighR',.6*k);pz(P,'shinR',1*k)},
 // lions jumeaux : poing gauche puis poing droit
 hy_lion:(P,e)=>{const L=e<.5,k=ezo(Math.min(1,(L?e:e-.5)/.16));P.root.z=12;P.root.y=-5;pz(P,'chest',.4,(L?-.35:.35)*k);pz(P,'thighR',-1);pz(P,'shinR',.9);pz(P,'thighL',.6);pz(P,'shinL',.5);
  if(L){pz(P,'armL',-1.62*k,0,-.1);pz(P,'foreL',-.1);pz(P,'armR',.4,0,-.3);pz(P,'foreR',-1.4)}else{pz(P,'armR',-1.62*k,0,.1);pz(P,'foreR',-.1);pz(P,'armL',.4,0,.3);pz(P,'foreL',-1.4)}},
 // garde des huit trigrammes : paume avant basse, paume arrière haute
 hy_stance:(P,e)=>{const k=ezo(Math.min(1,e/.35));P.root.y=-7*k;pz(P,'thighL',-.7*k,0,.25);pz(P,'shinL',.9*k);pz(P,'thighR',.5*k,0,-.3);pz(P,'shinR',1.1*k);pz(P,'chest',.2*k,.5*k);pz(P,'armL',-1.35*k,0,-.15);pz(P,'foreL',-.15);pz(P,'armR',-.6*k,0,.25);pz(P,'foreR',-1.9*k)},
 // salves : les paumes alternent très vite
 hy_rapid:(P,e,u,t)=>{const ph=t*34,a=Math.max(0,Math.sin(ph)),b=Math.max(0,-Math.sin(ph));P.root.y=-6;P.root.z=4;pz(P,'thighL',-.55,0,.3);pz(P,'shinL',.9);pz(P,'thighR',.45,0,-.3);pz(P,'shinR',.9);pz(P,'chest',.25,.35*Math.sin(ph));
  pz(P,'armL',-.85-.8*a,0,-.12);pz(P,'foreL',-1.5*(1-a));pz(P,'armR',-.85-.8*b,0,.12);pz(P,'foreR',-1.5*(1-b))},
 // dernière frappe : double paume, tout le corps en avant
 hy_finale:(P,e)=>{const k=e<.2?ezo(e/.2):1;pz(P,'armL',-1.6*k,0,-.22);pz(P,'armR',-1.6*k,0,.22);pz(P,'foreL',-.05);pz(P,'foreR',-.05);pz(P,'chest',.45*k);P.root.z=15*k;P.root.y=-8*k;pz(P,'thighR',-1.15*k);pz(P,'shinR',1*k);pz(P,'thighL',.8*k);pz(P,'shinL',.5*k)},
});
// ---------- trait de clan : Byakugan et tenketsu ----------
TRAITS[1]={nom:'Byakugan : tenketsu',desc:'Chaque coup de Jûken ferme un tenketsu de la cible et lui draine 3 chakra ; à 8 tenketsu fermés, son chakra est scellé (silence 1 s). Le Byakugan révèle les ennemis invisibles proches.',
 init(u){u.hy_byak=u.hy_byak||0;u.hy_stepB=u.hy_stepB||0},
 update(u,dt){if(SIMT-(u.hy_seen??SIMT)>.5)u.hy_byak=u.hy_stepB=u.hy_dg=0;u.hy_seen=SIMT; // revenu à la vie (mode bataille) : plus d'état d'avant la mort
  if(u.hy_byak>0)u.hy_byak=Math.max(0,u.hy_byak-dt);if(u.hy_stepB>0)u.hy_stepB=Math.max(0,u.hy_stepB-dt);
  if(u.hy_dg&&!(u.dodge>0)){u.hy_dg=0;if(u.hy_byak>.05){u.hy_stepB=Math.max(u.hy_stepB||0,2.5);jx({jfx:'hy_vision',ui:hyI(u),x:u.x,y:u.y,r:110,t:.45,m:.45,small:1});hyS('deflect',u)}} // esquive vue venir : riposte renforcée
  if(hyF!==SIMT){hyF=SIMT;for(const e of units)if(e.hy_tk){if(e.dead)e.hy_tk=e.hy_tkN=0;else e.hy_tkN=hyTkN(e)}}
  const R=u.hy_byak>0?520:240;for(const e of enemies(u))if(e.stealth>0&&dist(u,e)<R){e.stealth=0;if(!(e.hy_rvU>SIMT)){e.hy_rvU=SIMT+2;say(e,'RÉVÉLÉ','#cfe0ff');jx({jfx:'hy_net',ti:hyI(e),x:e.x,y:e.y,t:.9,m:.9})}}},
 deal(src,t,dmg,o){if(o.silent||o.thorn||!t||t===src||t.team===src.team)return dmg;if(o.hy_tk==null&&!(o.melee&&HYV[VFX]))return dmg;let n=o.hy_tk??1;
  if(src.hy_stepB>0&&o.melee){src.hy_stepB=0;dmg*=1.4;n+=1;jx({jfx:'hy_stamp',ti:hyI(t),x:t.x,y:t.y,a:ang(src,t),t:.45,m:.45})}
  if(n>0&&src.hy_byak>0)n+=1;if(n>0)hyTk(src,t,n);return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000,z=S*sk;g.save();g.globalCompositeOperation='lighter';
  // Byakugan actif : veines aux tempes
  if(u.hy_byak>0){const al=Math.min(1,u.hy_byak*2);g.strokeStyle=rgba('#9ab8ff',.85*al);g.lineWidth=1.6;g.beginPath();for(const d of[-1,1])for(let i=0;i<3;i++){g.moveTo(p.x+d*9*z,p.y-(47+i*2)*z);g.lineTo(p.x+d*(14+i*2)*z,p.y-(44+i*5)*z)}g.stroke()}
  // paumes chargées après le Pas du Hakke : flammes de chakra sur les mains
  if(u.hy_stepB>0){const a=u.aim,ca=Math.cos(a),sa=Math.sin(a),al=Math.min(1,u.hy_stepB*3);for(const d of[-1,1]){const q=P(u.x+ca*13-sa*d*12,u.y+sa*13+ca*d*12,26),r=q.s*(10+Math.sin(t*16+d*2)*2);
   g.fillStyle=rgba('#8ab0ff',.55*al);g.beginPath();g.moveTo(q.x-r,q.y);g.quadraticCurveTo(q.x-r*.2,q.y-r*3.4,q.x+r*.25,q.y-r*2.2);g.quadraticCurveTo(q.x+r*.9,q.y-r*1.2,q.x+r,q.y);g.quadraticCurveTo(q.x,q.y+r*1.1,q.x-r,q.y);g.fill();circ(q.x,q.y-r*.25,r*.55,rgba('#ffffff',.85*al))}}
  g.restore()},
 hud(u,x,y){let b=null,bs=-1e9;for(const e of units)if(e.team!==u.team&&!e.dead){const sc=(e.hy_tkN||0)*1000-dist(u,e);if(sc>bs){bs=sc;b=e}}const n=b?b.hy_tkN||0:0;
  text('Tenketsu',x,y+4,12,'#cfe0ff','left');for(let i=0;i<HYMAX;i++){g.save();g.translate(x+70+i*13,y);g.rotate(.785);g.fillStyle=i<n?'#ffffff':'rgba(0,0,0,.45)';g.strokeStyle='#8ab0ff';g.lineWidth=1;g.fillRect(-3.5,-3.5,7,7);g.strokeRect(-3.5,-3.5,7,7);g.restore()}
  if(u.hy_byak>0)text('Byakugan '+Math.ceil(u.hy_byak)+' s',x+182,y+4,11,'#9ab8ff','left','normal')}};
