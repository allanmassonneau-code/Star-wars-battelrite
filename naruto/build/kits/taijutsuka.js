// ===== Clan Taijutsuka (Fauves de jade : Rock Lee, Gai) =====
// Pur taijutsu, sans nature ni mudras : coups de pied tournoyants, Lotus, et les Huit Portes (trait : jauge qui s'ouvre en combat).
// Arbre de clan (format v5) : 2 jutsu par rang, tous appris ; arbre de style Taijutsu imposé (Konoha Senpû, Dynamic Entry, Lotus primaire y sont passés, kits/styles.js).
// Retirés de l'arbre (code conservé) : Bond du fauve, Vitesse du fauve (→ dash « Pas du fauve »), Première Porte, Porte de la Vie, Corps de jade (→ Portes célestes),
// Tigre de midi, Nuit de la mort (→ relance des Huit Portes). Les « N dégâts » sont les dégâts de base des mécaniques.
KIT('c10',[
 ['D','x.tj_weights','Poids retirés','Lâche ses poids (choc : 8 dégâts, ralentit autour) : très rapide 2,2 s, libéré des entraves ; ouvre 1 porte','tai'],
 ['D','x.tj_defi','Défi éternel','L\'ennemi touché est provoqué 0,4 s puis devient ton rival 5 s : +10 % de dégâts contre lui','tai'],
 ['C','x.tj_daisen','Konoha Daisenpû','3 coups de pied tournoyants en avançant vers le curseur (6, 6 puis 10 dégâts) ; le 3e projette en l\'air','leaf'],
 ['C','x.tj_esquive','Esquive du fauve','1,5 s : esquive le prochain coup, riposte d\'un coup de pied retourné (14 dégâts) et accélère','leaf'],
 ['B','x.tj_goriki','Konoha Gôriki Senpû','Coup de pied surpuissant : 26 dégâts, ignore parades et boucliers, repousse loin ; contre un obstacle, étourdit 0,8 s','tai'],
 ['B','x.tj_gates','Portes célestes','Ouvre d\'un coup jusqu\'à la 3e porte : inarrêtable 1,5 s et 20 % de dégâts en moins, puis 1,5 s de coups plus rapides et régénération ; ton prochain coup frappe double','gate'],
 ['A','x.tj_elephant','Éléphant du soir','5 coups de poing d\'air s\'abattent sur la zone visée, qui suit le curseur : 5 × 8 dégâts, le dernier étourdit 0,8 s','tai'],
 ['A','x.tj_peacock','Paon du matin','6e porte : rafale de coups enflammés 0,8 s (immobile), éventail de plumes de feu : jusqu\'à 40 dégâts ; le dernier projette','peacock'],
 ['S','x.tj_lotus2','Lotus caché','3e porte (−10 % PV) : fonce ; si tu touches, 2 assauts éclair traversent la cible puis l\'écrasent au sol : 55 dégâts, étourdi 1 s','tai'],
 ['S','x.tj_8gates','Huit Portes','Huit portes 6 s : +35 % de dégâts, très rapide, vol de vie, inarrêtable 3 s ; relance pendant la transe : Nuit de la mort (−25 % PV, fond en ligne : 60 dégâts, plus sur les blessés), qui y met fin ; ensuite épuisé','tai'],
]);
// ---------- aides ----------
// portes ouvertes (0 à 8), couleur d'une porte, noms des portes
const tjG=u=>Math.min(8,Math.floor(u.tj_g||0)),GATEC=n=>n>=8?'#ff4a3a':n>=6?'#8affd8':'#6aff7a';
const GATEN=['Kaimon · Ouverture','Kyûmon · Repos','Seimon · Vie','Shômon · Douleur','Tomon · Limite','Keimon · Vue','Kyômon · Merveille','Shimon · Mort'];
// ouvre les portes jusqu'à n (au-delà de 5 seulement par un jutsu)
function tjGate(u,n){if((u.tj_g||0)<n){u.tj_g=n;u.tj_cT=3}u.tj_n=Math.max(u.tj_n||0,tjG(u))}
// annonce au-dessus des nombres de dégâts
// ---- VFX (boîte à outils nr_fx.js) : air comprimé blanc, feuilles vertes, chakra des portes (vert → rouge), poussière ; les hitbox restent nettes
const TJ_LF='#5aa83a';
// impact de taijutsu : éclat blanc, onde, poussière, gel visuel (gros = hit-stop + traînée d'air dans la direction a)
function tjImp(u,e,s,dmg,big,a,col){const c=col||'#ffffff';fxFlare(e.x,e.y,c,{u,z:32,r:16*s,t:.16,c2:'#ffffff'});fxBurst(e.x,e.y,c,{u,n:7*s,sp:300*s,z:30,a:a??0,arc:a==null?6.3:1.8,w:1.8,len:.16,t:.3});
 fxRing(e.x,e.y,{u,r0:6,r1:30*s,col:c,w:4,t:.25});fxSmoke(e.x,e.y,{u,col:'#d8d0c0',n:2+s,r:14*s,s:9*s,t:.55,al:.2,rise:10});if(a!=null&&big)fxWind(e.x,e.y,a,{u,len:110*s,w:40*s,n:4,t:.3,col:'#ffffff'});if(dmg)fxHitStop(u,e,dmg,big)}
// feuilles soulevées (Konoha) : pétales verts non additifs
function tjLeaves(u,x,y,n,sp,o){fxBurst(x,y,TJ_LF,Object.assign({u,n,sp,z:20,up:90,gr:-20,w:2.4,sh:'petal',c2:'#8ad05a',add:0,t:.8},o||{}))}
// choc au sol (talon, poing d'air, lotus) : onde au rayon exact, fissures, éclats, poussière
function tjGround(u,x,y,r,s){fxRing(x,y,{u,r0:r*.2,r1:r,col:'#f0e8d8',c2:'#ffffff',w:6*s,t:.4});fxDecal(x,y,'crack',{u,r:r*.85,t:3.5});fxDebris(x,y,{u,n:6*s,sp:150*s,col:'#8a6a48',c2:'#5a4028',s:3.5*s});fxSmoke(x,y,{u,col:'#c8b898',n:3+2*s,r:r*.6,s:12*s,t:.8,al:.24,rise:14})}
const tjSay=(u,s,col)=>{if(near(u.x,u.y))txt.push({x:u.x,y:u.y,z:122,s,col,t:1.1})};
// rotation sur soi ramenée dans [-π, π] (pas de tour à l'envers quand l'animation finit)
const tjSp=r=>{r%=6.2832;return r>3.1416?r-6.2832:r<-3.1416?r+6.2832:r};
// point visé en continu (souris du joueur, commandes d'un ami, sinon la cible du bot)
function tjCur(u,R){let x=null,y=null;
 if(u.ctrl==='local'&&typeof mouse!=='undefined'){const m=unP(mouse.x,mouse.y);x=m.x;y=m.y}
 else if(u.ctrl==='remote'){const Q=peerOf(u.rid),r=Q&&Q.in;if(r){x=+r.ax;y=+r.ay}}
 if(x==null||!isFinite(x)||!isFinite(y)){const e=u.tgt&&!u.tgt.dead?u.tgt:nearE(u,u.x,u.y,700),p=e||fwd(u,u.aim,R*.7);x=p.x+(rnd()-.5)*44;y=p.y+(rnd()-.5)*44}
 const d=Math.hypot(x-u.x,y-u.y)||1,k=Math.min(1,R/d);return{x:clamp(u.x+(x-u.x)*k,B.x+10,B.x+B.w-10),y:clamp(u.y+(y-u.y)*k,B.y+10,B.y+B.h-10)}}
// verrouille le lanceur sur place (canalisation) : ni déplacement ni autre jutsu ; un recul ou une projection l'interrompt
const tjLock=(u,d,jump)=>u.dash={sx:u.x,sy:u.y,tx:u.x,ty:u.y,t:0,dur:d,jump:jump||0,lock:1};
// projeter (air) n'interrompt pas une incantation dans le moteur : on la coupe à la main (sauf cible inarrêtable)
const tjCut=e=>{if(!e||e.dead||e.unstop>0)return;if(e.cast||e.spin||e.flame)say(e,'INTERROMPU','#fc6');e.cast=null;e.spin=null;e.flame=null;e.dash=null};
// silhouette fantôme du ninja (images rémanentes)
function tjGhost(u,x,y,z,a){if(!u||a<=.01)return;const q=P(x,y,z||0);g.save();g.globalAlpha=a;drawChar(u,q.x,q.y,q.s*1.3*(u.giant>0?1.35:1));g.restore()}
// teinte du ninja (peau rougie des portes) : sa silhouette 2D recolorée par-dessus (charTint, nr_char.js)
function tjTint(u,p,S,col,a){charTint(u,p,S,col,a)}

// ---------- mécaniques ----------
Object.assign(NAT,{
 // Konoha Senpû : coup de pied circulaire à 360°
 tj_senpu:S_('Konoha Senpû','',5,{hero:'maul',tele:{self:1,r:100},ai:SELF(105,.6)},(u,a)=>{S('wind',u);anim(u,'tj_senpu',.36);
  for(const e of enemies(u))if(dist(u,e)<100+e.r)hit(e,u,12,{melee:1,kb:280,slow:.7,fx:u.x,fy:u.y});
  jx({jfx:'tj_whirl',ui:units.indexOf(u),x:u.x,y:u.y,r:100,t:.4,m:.4});sparks(u.x,u.y,'#5aa83a',4,'leaf');fxRing(u.x,u.y,{u,r0:30,r1:100,col:'#e8fff0',w:4,t:.3});tjLeaves(u,u.x,u.y,8,220)}),
 // Konoha Daisenpû : trois tours en avançant (on peut viser entre deux tours), le dernier projette en l'air
 tj_daisen:S_('Konoha Daisenpû','',10,{hero:'savage',line:{len:190,w:210},ai:RG(150,.6)},(u,a)=>{let i=0;
  const spin=(o,n)=>{S('wind',o);dash(o,o.aim,40,.17,{});jx({jfx:'tj_whirl',ui:units.indexOf(o),x:o.x,y:o.y,r:108,t:.3,m:.3,big:1});
   // le 3e tour projette en l'air (Kage Buyô peut suivre)
   for(const e of enemies(o))if(dist(o,e)<105+e.r&&hit(e,o,n<2?6:10,n<2?{melee:1}:{melee:1,air:.3})){tjImp(o,e,n<2?.8:1.3,n<2?0:10,n===2,ang(o,e));if(n===2)tjCut(e)}
   fxWind(o.x,o.y,0,{u:o,spin:1,w:100,n:5,t:.3,col:'#e8fff0'});tjLeaves(o,o.x,o.y,4,180);
   if(n===2){sparks(o.x,o.y,'#5aa83a',6,'leaf');fxRing(o.x,o.y,{u:o,r0:30,r1:105,col:'#cfe8c0',c2:'#ffffff',w:6,t:.35});tjLeaves(o,o.x,o.y,10,260)}};
  anim(u,'tj_daisen',.64);spin(u,0);seqs.push({owner:u,n:2,t:.21,iv:.21,vfx:'leaf',f:o=>spin(o,++i)})}),
 // Konoha Gôriki Senpû : le coup de pied qui brise tout
 tj_goriki:S_('Konoha Gôriki Senpû','',11,{hero:'anakin',line:{len:130,w:150},ai:RG(120,.6)},(u,a)=>{S('heavy',u);S('wind',u);anim(u,'tj_goriki',.42);u.kx+=Math.cos(a)*240;u.ky+=Math.sin(a)*240;
  let n=0;for(const e of enemies(u))if(dist(u,e)<128+e.r&&angDiff(ang(u,e),a)<.8){const sh=e.shield,shT=e.shieldT;e.shield=0;
   if(hit(e,u,26,{melee:1,unblockable:1,kb:500,wall:.8})){n++;jx({jfx:'tj_impact',x:e.x,y:e.y,a,t:.4,m:.4,big:1});tjImp(u,e,1.6,26,1,a);fxDecal(e.x,e.y,'crack',{u,r:36,t:3});
    if(sh>0){e.shieldT=0;tjSay(e,'BOUCLIER BRISÉ','#bfe6ff');jx({jfx:'tj_shards',x:e.x,y:e.y,t:.6,m:.6})}}
   else if(e.shield<=0){e.shield=sh;e.shieldT=shT}} // esquivé : le bouclier reste
  jx({jfx:'tj_crescent',ui:units.indexOf(u),x:u.x,y:u.y,a,r:130,t:.35,m:.35});fxWind(u.x+Math.cos(a)*60,u.y+Math.sin(a)*60,a,{u,len:200,w:130,n:7,t:.4,col:'#ffffff'});fxSmoke(u.x,u.y,{u,col:'#c8b898',n:3,r:20,s:10,t:.6,al:.22})}),
 // Lotus primaire (Omote Renge) : course, saisie, envol, piqué
 tj_lotus1:S_('Lotus primaire','',13,{hero:'savage',line:{len:300,w:40},ai:{mode:'gap',min:60,max:300,p:.6}},(u,a)=>{S('dash',u);anim(u,'lunge',.3);dash(u,a,300,.27,{});jx({jfx:'tj_dash',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.3,m:.3});
  aux.push({type:'tj_lotus',x:u.x,y:u.y,r:0,t:1.5,m:1.5,team:u.team,owner:u,ui:units.indexOf(u),ph:0,d:u.dash,k:0});tjSay(u,'LOTUS !','#6aff7a');sparks(u.x,u.y,'#6aff7a',8,'gate')}),
 // Lotus caché (Ura Renge) : trois assauts éclair ; défini plus bas
 tj_lotus2:S_('Lotus caché','',20,{hero:'rey',line:{len:230,w:36},ai:{mode:'gap',min:30,max:230,p:.65}},null),
 // Poids retirés : les poids tombent, la vitesse explose (IA : sans chakra, ne le lance plus à chaque ouverture : 220-450 de distance, p 0,25)
 tj_weights:S_('Poids retirés','',6,{hero:'quigon',ai:{mode:'gap',min:220,max:450,p:.25}},(u)=>{u.root=0;u.slow=0;u.haste=Math.max(u.haste,2.2);anim(u,'tj_weights',.32);if(u.ch.clan===TAIJ){tjGate(u,Math.min(5,tjG(u)+1));u.tj_cT=3}S('dash',u);
  const x=u.x,y=u.y;jx({jfx:'tj_weights',x,y,t:.9,m:.9});later(u,.22,()=>{for(const e of enemies(u))if(Math.hypot(e.x-x,e.y-y)<85+e.r)hit(e,u,8,{slow:.8,fx:x,fy:y});
   if(near(x,y))S('rock',u);aux.push({type:'tj_crater',x,y,r:30,t:5,m:5,team:u.team,owner:u});tjGround(u,x,y,85,1)})}),
 // Bond du fauve : saut et coup de talon (Konoha Daisenkô)
 tj_leap:S_('Bond du fauve','',9,{hero:'savage',ai:{mode:'gap',min:110,max:300,p:.5}},(u,a,td)=>{const d=clamp(td||250,60,300),p=fwd(u,a,d);S('dash',u);anim(u,'tj_heel',.42);
  later(u,.4,()=>{},{x:p.x,y:p.y,r:60});
  dash(u,a,d,.4,{jump:105,end:()=>{const x=u.x,y=u.y;for(const e of enemies(u)){const dd=Math.hypot(e.x-x,e.y-y);if(dd<60+e.r)hit(e,u,7,{melee:1,stun:.4});else if(dd<150+e.r)hit(e,u,4,{kb:300,fx:x,fy:y})}
   jx({jfx:'tj_heel',x,y,r:150,t:.6,m:.6});if(near(x,y)){S('boom',u);S('rock',u)}tjGround(u,x,y,60,1.2);fxRing(x,y,{u,r0:60,r1:150,col:'#ffe08a',w:3,t:.4})}})}),
 // Vitesse du fauve (Kage Buyô) : dans le dos de la cible, et la relance si elle est en l'air
 tj_shadow:S_('Vitesse du fauve','',7,{hero:'ventress',ai:GAP},(u,a,td)=>{const e=pick(u,a,td||300,350),ox=u.x,oy=u.y;S('dash',u);
  if(!e){const p=fwd(u,a,200);u.x=p.x;u.y=p.y;collide(u)}
  else{const b=ang(u,e);u.x=e.x+Math.cos(b)*40;u.y=e.y+Math.sin(b)*40;collide(u);u.aim=ang(u,e);
   if((e.airT>0||e.z>4)&&hit(e,u,8,{melee:1,unblockable:1,air:.35})){tjCut(e);tjSay(u,'KAGE BUYÔ !','#9f6');jx({jfx:'tj_impact',x:e.x,y:e.y,a:-1.57,t:.35,m:.35,big:1});if(near(e.x,e.y))shake=Math.max(shake,.15)}}
  jx({jfx:'tj_blink',x:ox,y:oy,x2:u.x,y2:u.y,ui:units.indexOf(u),t:.45,m:.45});anim(u,'tj_stance',.35)}),
 // Défi éternel : la flamme de la jeunesse désigne un rival
 tj_defi:S_('Défi éternel','',6,{hero:'mace',line:{len:480,w:18},ai:RG(450,.55)},(u,a)=>{S('wind',u);anim(u,'point',.45);jx({jfx:'tj_ting',ui:units.indexOf(u),x:u.x,y:u.y,t:.5,m:.5});
  proj(u,a,{spd:950,r:10,dmg:3,life:.52,col:'#7dff8a',kind:'tj_defi',o:{taunt:.4},onHit:(p,t)=>{tjRival(p.owner,t);fxFlare(t.x,t.y,'#7dff8a',{u:p.owner,z:40,r:16,t:.2});fxBurst(t.x,t.y,'#ff7a3a',{u:p.owner,n:8,sp:90,z:50,up:60,gr:-80,w:2,c2:'#ffd36a',t:.6})}})}),
 // Dynamic Entry : saut de pied volant vers le curseur, le premier ennemi rencontré est éjecté
 tj_dynamic:S_('Dynamic Entry','',8,{hero:'bossk',line:{len:400,w:44},ai:{mode:'gap',min:130,max:400,p:.55}},(u,a,td)=>{S('dash',u);anim(u,'tj_flykick',.36);
  dash(u,a,clamp((td||300)+20,90,400),.26,{jump:48,end:()=>tjEntry(u,null,a)});jx({jfx:'tj_dash',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.3,m:.3});aux.push({type:'tj_entry',owner:u,d:u.dash,a,x:u.x,y:u.y,r:0,t:.45,m:.45,team:u.team})}),
 // Esquive du fauve : garde qui esquive puis riposte (voir le trait)
 tj_esquive:S_('Esquive du fauve','',9,{hero:'ahsoka',ai:DEF},(u)=>{u.tj_esq=1.5;S('deflect',u);anim(u,'tj_stance',.45);jx({jfx:'tj_leafring',ui:units.indexOf(u),x:u.x,y:u.y,t:1.5,m:1.5})}),
 // Première Porte (Kaimon)
 tj_gate1:S_('Première Porte','',11,{hero:'savage',ai:SELF(200,.5)},(u)=>{u.root=0;u.slow=0;u.unstop=Math.max(u.unstop,2.5);u.critBuf=Math.max(u.critBuf||0,1);shieldU(u,15,2.5);tjGate(u,Math.min(5,tjG(u)+1));anim(u,'tj_gate',.5);S('heavy',u);
  jx({jfx:'tj_gate',ui:units.indexOf(u),x:u.x,y:u.y,n:Math.max(1,tjG(u)),t:.8,m:.8})}),
 // Porte de la Vie (Seimon) : la peau rougit
 tj_gate3:S_('Porte de la Vie','',12,{hero:'maul',ai:SELF(150,.6)},(u)=>{u.regenB=Math.max(u.regenB,4);u.haste=Math.max(u.haste,3);u.tj_life=3;u.stam=100;u.tj_red=Math.max(u.tj_red||0,3);tjGate(u,3);anim(u,'tj_gate',.5);S('heavy',u);
  jx({jfx:'tj_gate',ui:units.indexOf(u),x:u.x,y:u.y,n:3,t:.8,m:.8})}),
 // Corps de jade : renvoie les tirs, étourdit au contact
 tj_jade:S_('Corps de jade','',12,{hero:'gideon',ai:SELF(160,.5)},(u)=>{u.deflect=Math.max(u.deflect,2.5);u.unstop=Math.max(u.unstop,2.5);u.drT=Math.max(u.drT,2.5);u.dr=.35;u.thorns=Math.max(u.thorns,2.5);anim(u,'tj_guard',.6);S('deflect',u);
  jx({jfx:'tj_jade',ui:units.indexOf(u),x:u.x,y:u.y,t:2.5,m:2.5})}),
 // Éléphant du soir (Sekizô) : cinq pattes d'air qui suivent le curseur
 tj_elephant:S_('Éléphant du soir','',13,{hero:'gideon',tele:{r:80,max:380},ai:{max:380,p:.8}},(u)=>{const D=tjLock(u,1.35);anim(u,'tj_punches',1.35);let i=0;
  const punch=o=>{if(o.dash!==D||o.dead)return;const p=tjCur(o,380),n=i;o.aim=ang(o,p);S('heavy',o);jx({jfx:'tj_foot',x:p.x,y:p.y,r:78,a:o.aim,t:.16,m:.16});
   later(o,.15,()=>{for(const e of enemies(o))if(Math.hypot(e.x-p.x,e.y-p.y)<68+e.r)hit(e,o,8,n<4?{kb:50,slow:.4,fx:p.x,fy:p.y}:{stun:.8});
    jx({jfx:'tj_stomp',x:p.x,y:p.y,r:78,last:n===4,t:.55,m:.55});if(near(p.x,p.y))S('boom',o);tjGround(o,p.x,p.y,68,n<4?.8:1.4);
    if(n===4){fxFlare(p.x,p.y,'#ffe08a',{u:o,z:20,r:30,t:.22});for(const e of enemies(o))if(Math.hypot(e.x-p.x,e.y-p.y)<68+e.r)fxHitStop(o,e,16,1)}})};
  punch(u);seqs.push({owner:u,n:4,t:.28,iv:.28,vfx:'tai',f:o=>{i++;punch(o)}})}),
 // Huit Portes : toutes les portes s'ouvrent, puis l'épuisement
 tj_8gates:S_('Huit Portes','',24,{hero:'bossk',ai:SELF(170,.8)},(u,a)=>{const i=u.ch.abil.findIndex(x=>x&&x.key==='tj_8gates');
  if(u.jst&&u.jst.key==='tj_8gates'){u.cds[u.jst.i]=u.jst.cd;u.jst=null;if(u.tj_8>0){NAT.tj_night.f(u,a);u.tj_8=Math.min(u.tj_8,.01)}return} // relance : Nuit de la mort, fin des portes
  if(i>=0){if(u.jst)u.cds[u.jst.i]=u.jst.cd;u.jst={key:'tj_8gates',i,n:1,t:6,cd:u.ch.abil[i].cd,v:'gate'};u.cds[i]=.5}
  u.tj_8=6;u.tj_g=8;u.lsB=Math.max(u.lsB,6);u.haste=Math.max(u.haste,6);u.rage=Math.max(u.rage,6);u.unstop=Math.max(u.unstop,3);gain(u,40,u);u.tj_red=6;
  anim(u,'tj_gate',.8);S('heavy',u);jx({jfx:'tj_8gates',ui:units.indexOf(u),x:u.x,y:u.y,t:1.1,m:1.1});
  // 8e porte : colonne de chakra rouge, onde, le sol se fend, vapeur de sang qui monte 6 s
  fxPillar(u.x,u.y,'#ff4a3a',{u,h:260,w:36,t:.8,al:.5});fxRing(u.x,u.y,{u,r0:20,r1:150,col:'#ff4a3a',c2:'#8affd8',w:8,t:.55});fxDecal(u.x,u.y,'crack',{u,r:90,t:5});fxDebris(u.x,u.y,{u,n:10,sp:200,col:'#8a6a48',c2:'#5a4028',s:4});
  fxEmbers(u.x,u.y,24,'#ff5a3a',{u,n:9,t:6,h:90,c2:'#8affd8'});fxLight(u.x,u.y,200,'#ff4a3a',{u,t:.8,a:.45});fxShake(.35,u.x,u.y)}),
 // Paon du matin (Asa Kujaku) : éventail de plumes de feu, on peut balayer avec la souris
 tj_peacock:S_('Paon du matin','',15,{hero:'anakin',line:{len:330,w:160},ai:{max:210,p:.8}},(u)=>{const D=tjLock(u,.9);anim(u,'tj_flurry',.9);tjGate(u,6);
  jx({jfx:'tj_tail',ui:units.indexOf(u),x:u.x,y:u.y,t:.9,m:.9});fxCharge(u,'#ff8a2a',{t:.4,n:10,r:50});fxLight(u.x,u.y,140,'#ff7a2a',{u,t:.9,a:.35});
  seqs.push({owner:u,n:13,t:.02,iv:.055,vfx:'peacock',f:o=>{if(o.dash!==D)return;const p=tjCur(o,330);o.aim=ang(o,p);const b=o.aim+(rnd()-.5)*.5;S('fire',o);
   proj(o,b,{spd:900,r:9,dmg:2.4,life:.38,col:'#ff8a2a',kind:'tj_feather',vfx:'peacock',o:{dot:BURN(2,2)},onHit:(p,t)=>fxBurst(t.x,t.y,'#ffb03a',{u:p.owner,n:4,sp:180,z:32,up:60,gr:-40,w:1.6,c2:'#fff0c0',t:.35})})}});
  later(u,.8,()=>{if(u.dash!==D||u.dead||u.stun>0)return;const p=tjCur(u,330);u.aim=ang(u,p);S('fire',u);S('boom',u);
   proj(u,u.aim,{spd:950,r:18,dmg:9,life:.36,col:'#ffb03a',kind:'tj_fist',vfx:'peacock',big:1,o:{air:.5},onHit:(p,t)=>{tjCut(t);fxImpact(t.x,t.y,'katon',1.3,{u:p.owner,r:50});fxHitStop(p.owner,t,9,1)}})})}),
 // Tigre de midi (Hirudora) : le poing comprime l'air en un tigre
 tj_tiger:ULT('Tigre de midi','',{hero:'luke',line:{len:620,w:70},ai:{max:560,p:.8}},(u)=>{const D=tjLock(u,.45);anim(u,'tj_tiger',.62);tjGate(u,7);S('wind',u);
  jx({jfx:'tj_suck',ui:units.indexOf(u),x:u.x,y:u.y,t:.3,m:.3});
  later(u,.3,()=>{if(u.dead||u.dash!==D||u.stun>0)return;const p=tjCur(u,620),a=ang(u,p);u.aim=a;S('heavy',u);S('boom',u);S('roar',u);
   const sx=u.x+Math.cos(a)*30,sy=u.y+Math.sin(a)*30;aux.push({type:'tj_tiger',x:sx,y:sy,vx:Math.cos(a)*820,vy:Math.sin(a)*820,a,r:34,t:.78,m:.78,team:u.team,owner:u,hs:new Set()});
   jx({jfx:'tj_tigerfx',x:sx,y:sy,a,spd:820,t:.78,m:.78});jx({jfx:'shock',x:u.x,y:u.y,r:90,t:.4,m:.4,col:'#e8fff4'});fxWind(sx,sy,a,{u,len:240,w:80,n:8,t:.5,col:'#e8fff4'});fxFlare(sx,sy,'#e8fff4',{u,z:34,r:30,t:.22});fxShake(.3,u.x,u.y)})}),
 // Nuit de la mort (Yagai) : le coup de pied de la 8e porte
 tj_night:ULT('Nuit de la mort','',{hero:'sister',line:{len:440,w:64},ai:{mode:'exec',max:420,p:.9}},(u,a)=>{u.hp=Math.max(1,u.hp-u.hp*.25);u.tj_red=Math.max(u.tj_red||0,2.5);tjGate(u,8);u.unstop=Math.max(u.unstop,.7);
  S('roar',u);S('dash',u);anim(u,'tj_flykick',.5);const sx=u.x,sy=u.y;dash(u,a,440,.34,{});u.dash.nt=1;fxWind(sx,sy,a+Math.PI,{u,len:160,w:80,n:7,t:.45,col:'#ff8a7a'});fxDecal(sx,sy,'crack',{u,r:40,t:3});
  aux.push({type:'tj_night',x:u.x,y:u.y,r:0,t:.5,m:.5,team:u.team,owner:u,d:u.dash,hs:new Set()});jx({jfx:'tj_dragon',x:sx,y:sy,a,len:440,dur:.34,t:.95,m:.95});
  later(u,.36,()=>{if(u.dead)return;u.slow=Math.max(u.slow,2);tjSay(u,'ÉPUISÉ','#ff9a7a')})}),
});
// descriptions affichées = celles du catalogue
for(const r of KITROWS)if(r[0]==='c10'&&r[3].startsWith('x.')){const N=NAT[r[3].slice(2)];if(N&&!N.d)N.d=r[5]}
// Lotus caché (Ura Renge) : 1er assaut au curseur ; s'il touche, la cible est projetée et deux assauts éclair la traversent de part et d'autre
NAT.tj_lotus2.f=(u,a)=>{u.hp=Math.max(1,u.hp-u.hp*.1);tjGate(u,3);jx({jfx:'tj_gate',ui:units.indexOf(u),x:u.x,y:u.y,n:3,t:.7,m:.7});tjSay(u,'LOTUS CACHÉ !','#6aff7a');fxRing(u.x,u.y,{u,r0:10,r1:60,col:'#6aff7a',w:5,t:.35});tjLeaves(u,u.x,u.y,8,200);
 tjUra(u,a,230,0,null)};
function tjUra(u,a,L,n,tg){S('dash',u);anim(u,n===2?'tj_flykick':n?'lunge':'kickup',.22);dash(u,a,L,.13,{});aux.push({type:'tj_ura',owner:u,d:u.dash,n,tg,sx:u.x,sy:u.y,x:u.x,y:u.y,r:0,t:.6,m:.6,team:u.team,hs:new Set()})}
Object.assign(NATHERO,{tj:'kylo'});
// Portes célestes (fusion Première Porte + Porte de la Vie + Corps de jade) : 1,5 s inarrêtable (−20 % de dégâts), puis la 3e porte (coups plus rapides, régénération)
// (sans chakra depuis que les arbres martiaux sont gratuits : élan de la 3e porte ramené de 4,5 à 3 s au total, −25 → −20 % de dégâts subis, endurance remontée à 60 au lieu de 100)
NAT.tj_gates=S_('Portes célestes','',10,{hero:'savage',ai:SELF(180,.6)},(u)=>{u.root=0;u.slow=0;u.unstop=Math.max(u.unstop,1.5);u.drT=Math.max(u.drT,1.5);u.dr=Math.max(u.dr||0,.2);u.critBuf=Math.max(u.critBuf||0,1);
 tjGate(u,Math.max(3,tjG(u)));u.tj_cT=3;u.tj_life=Math.max(u.tj_life||0,3);u.regenB=Math.max(u.regenB,3);u.haste=Math.max(u.haste,3);u.stam=Math.max(u.stam,60);u.tj_red=Math.max(u.tj_red||0,3);anim(u,'tj_gate',.5);S('heavy',u);
 jx({jfx:'tj_gate',ui:units.indexOf(u),x:u.x,y:u.y,n:3,t:.8,m:.8});jx({jfx:'tj_jade',ui:units.indexOf(u),x:u.x,y:u.y,t:1.5,m:1.5});tjSay(u,'PORTES CÉLESTES !','#6aff7a');
 fxPillar(u.x,u.y,'#6aff7a',{u,h:170,w:26,t:.55,al:.4});fxRing(u.x,u.y,{u,r0:10,r1:70,col:'#6aff7a',c2:'#ffffff',w:6,t:.4});fxEmbers(u.x,u.y,26,'#8affa8',{u,n:8,t:1.5,h:80,c2:'#ffffff'});fxDecal(u.x,u.y,'crack',{u,r:40,t:3});fxSmoke(u.x,u.y,{u,col:'#c8b898',n:4,r:30,s:12,t:.7,al:.22})});
// dash du clan (Espace) : Pas du fauve — ruée de 190 ; fini près d'un ennemi (90), on réapparaît dans son dos ; le coup de base suivant (1,2 s) frappe +30 % ; ouvre une demi-porte
NAT.tj_pas=S_('Pas du fauve','',5,{hero:'ventress',ai:{mode:'gap',min:120,max:330,p:.45}},(u,a,td)=>{const d=clamp(td||190,60,190),ox=u.x,oy=u.y;S('dash',u);anim(u,'lunge',.2);tjLeaves(u,ox,oy,6,140);fxSmoke(ox,oy,{u,col:'#c8b898',n:3,r:16,s:9,t:.5,al:.22});
 dash(u,a,d,.16,{end:()=>{if(u.dead)return;const e=nearE(u,u.x,u.y,90);if(e&&e.phase<=0){const b=ang(u,e);u.x=e.x+Math.cos(b)*(e.r+u.r+6);u.y=e.y+Math.sin(b)*(e.r+u.r+6);collide(u);u.aim=ang(u,e);tjSay(u,'DANS LE DOS','#9f6')}
  u.tj_pb=1.2;if(u.ch.clan===TAIJ){u.tj_g=Math.min(5,(u.tj_g||0)+.5);u.tj_cT=3}jx({jfx:'tj_blink',x:ox,y:oy,x2:u.x,y2:u.y,ui:units.indexOf(u),t:.45,m:.45});sparks(u.x,u.y,'#5aa83a',8,'leaf')}});
 jx({jfx:'tj_dash',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.2,m:.2})});
DASHC[10]={src:'x.tj_pas',n:'Pas du fauve',d:'Ruée de 190 vers le curseur ; finie près d\'un ennemi, tu réapparais dans son dos ; ton coup suivant frappe +30 % ; ouvre une demi-porte',vfx:'leaf',cd:5};

// ---------- logique des objets ----------
// Lotus primaire : course (saisie au contact), puis envol ligoté et piqué au sol
AUXF.tj_lotus=x=>{const u=x.owner;if(u.dead){x.t=0;return}
 if(x.ph===0){if(u.dash!==x.d||u.stun>0){x.t=0;return}
  for(const e of enemies(u))if(dist(u,e)<u.r+e.r+14){u.dash=null;x.t=0;
   if(e.unstop>0){hit(e,u,20,{melee:1,unblockable:1});return}
   // pas de saisie si le coup est esquivé, renvoyé, contré ou traverse une cible intangible
   if(!hit(e,u,6,{melee:1,unblockable:1,air:.45})||e.dead)return;
   tjCut(e);e.kx=e.ky=0;x.t=1.5;
   x.ph=1;x.tg=e;x.ti=units.indexOf(e);x.k=.4;x.ex=e.x;x.ey=e.y;x.x=e.x;x.y=e.y;x.d=tjLock(u,.56,28);anim(u,'tj_lotus',.6);
   jx({jfx:'tj_bandage',ti:x.ti,ui:units.indexOf(u),x:e.x,y:e.y,t:.55,m:.55});S('wind',u);return}return}
 const e=x.tg;if(!e||e.dead||u.dash!==x.d||u.stun>0){if(u.dash===x.d)u.dash=null;if(u.anim&&u.anim.k==='tj_lotus')u.anim=null;x.t=0;return}
 e.x=x.ex;e.y=x.ey;e.kx=e.ky=0;e.airT=Math.max(e.airT,.3);u.aim=ang(u,e);
 if(x.k<=0){x.t=0;u.dash=null;u.z=0;e.airT=0;e.z=0;
  hit(e,u,26,{melee:1,unblockable:1,stun:.9});for(const o of enemies(u))if(o!==e&&dist(o,e)<95+o.r)hit(o,u,10,{kb:220,fx:e.x,fy:e.y});
  const b=ang(e,u);u.x=e.x+Math.cos(b)*36;u.y=e.y+Math.sin(b)*36;collide(u);anim(u,'crouch',.3);
  jx({jfx:'tj_crater',x:e.x,y:e.y,r:95,t:.9,m:.9});if(near(e.x,e.y)){S('boom',u);S('rock',u)}tjGround(u,e.x,e.y,95,1.5);fxHitStop(u,e,26,1)}};
// Dynamic Entry : le premier ennemi rencontré pendant le saut prend le coup de pied
AUXF.tj_entry=x=>{const u=x.owner;if(u.dead||u.dash!==x.d){x.t=0;return}for(const e of enemies(u))if(dist(u,e)<u.r+e.r+26){u.dash=null;u.z=0;x.t=0;tjEntry(u,e,x.a);return}};
function tjEntry(u,e,a){let hitAny=0;for(const o of enemies(u))if(o===e||(!e&&dist(u,o)<u.r+o.r+30&&angDiff(ang(u,o),a)<1.3)){if(hit(o,u,20,{melee:1,kb:260,slow:.6}))hitAny=1}
 const p=fwd(u,a,22);jx({jfx:'tj_impact',x:p.x,y:p.y,a,t:.45,m:.45,big:1});if(hitAny){tjSay(u,'DYNAMIC ENTRY !','#ffe14a');if(near(u.x,u.y))S('heavy',u);tjImp(u,p,1.5,20,1,a)}else sparks(u.x,u.y,'#d8c8a8',8,'smoke')}
// Défi éternel : marque de rival (+10 % de dégâts du lanceur contre elle)
function tjRival(u,t){if(!u||u.dead||!t||t.dead)return;for(const x of aux)if(x.type==='tj_riv'&&x.owner===u)x.t=0;
 aux.push({type:'tj_riv',x:t.x,y:t.y,r:0,t:5,m:5,team:u.team,owner:u,tg:t,ti:units.indexOf(t),ui:units.indexOf(u)});later(u,.35,()=>{if(!t.dead)tjSay(t,'RIVAL !','#ff7a3a')})}
AUXF.tj_riv=x=>{const e=x.tg;if(!e||e.dead||x.owner.dead){x.t=0;if(e)e.tj_rvT=0;return}x.x=e.x;x.y=e.y;e.tj_rvBy=x.owner;e.tj_rvT=Math.max(0,x.t)};
// cratère des poids (décor)
AUXF.tj_crater=()=>{};
// Tigre de midi : traverse tout, avale les tirs ennemis, frappe chaque ennemi une fois
AUXF.tj_tiger=(x,dt)=>{x.x+=x.vx*dt;x.y+=x.vy*dt;if(x.x<B.x||x.x>B.x+B.w||x.y<B.y||x.y>B.y+B.h){x.t=0;return}const o=x.owner;
 for(const e of enemies(o))if(!x.hs.has(e)&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){x.hs.add(e);VFX='tai';hit(e,o,30,{kb:700,stun:.6,fx:e.x-Math.cos(x.a)*60,fy:e.y-Math.sin(x.a)*60});VFX=null;jx({jfx:'tj_impact',x:e.x,y:e.y,a:x.a,t:.45,m:.45,big:1});tjImp(o,e,1.8,30,1,x.a,'#e8fff4')}
 for(const q of projs)if(q.owner.team!==x.team&&!q.dead&&Math.hypot(q.x-x.x,q.y-x.y)<x.r+q.r+10){q.life=0;q.dead=1;if(near(q.x,q.y))sparks(q.x,q.y,'#e8fff4',6)}};
AUXF.tj_ura=x=>{const u=x.owner;if(u.dead){x.t=0;return}
 if(u.dash===x.d){if(u.stun>0){u.dash=null;x.t=0;return}
  for(const e of enemies(u))if(!x.hs.has(e)&&dist(u,e)<u.r+e.r+12){x.hs.add(e);
   // l'enchaînement ne part que si le 1er assaut touche vraiment (esquive, contre, intangible : raté)
   if(hit(e,u,10,{melee:1,unblockable:1,air:x.n<2?.2:0})){if(!x.tg)x.tg=e;if(x.n<2)tjCut(e);jx({jfx:'tj_impact',x:e.x,y:e.y,a:ang(u,e),t:.3,m:.3});tjImp(u,e,1.2,10,1,ang(u,e),'#bfffc8')}}return}
 if(x.done)return;x.done=1;x.t=0;jx({jfx:'tj_streak',x:x.sx,y:x.sy,x2:u.x,y2:u.y,ui:units.indexOf(u),t:.45,m:.45});if(Math.hypot(u.x-x.d.tx,u.y-x.d.ty)>30)return; // assaut interrompu
 if(x.n===2){const p={x:u.x,y:u.y};for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<85+e.r){hit(e,u,25,{unblockable:1,stun:1,fx:p.x,fy:p.y});fxHitStop(u,e,25,1)}jx({jfx:'tj_crater',x:p.x,y:p.y,r:85,t:.8,m:.8});jx({jfx:'tj_impact',x:p.x,y:p.y,a:0,t:.4,m:.4,big:1});
  if(near(p.x,p.y))S('boom',u);tjGround(u,p.x,p.y,85,1.6);fxPillar(p.x,p.y,'#6aff7a',{u,h:180,w:26,t:.45,al:.4});fxLight(p.x,p.y,140,'#6aff7a',{u,t:.45,a:.4});fxShake(.32,p.x,p.y);return}
 const e=x.tg;if(!e||e.dead||u.stun>0)return;
 // assaut suivant : repart à travers la cible, de l'autre côté
 later(u,.06,()=>{if(u.dead||e.dead||u.stun>0||u.dash)return;const n=x.n+1,b=ang(u,e)+(n===1?.22:0),L=n===2?Math.max(40,dist(u,e)):clamp(dist(u,e)+120,150,300);tjUra(u,b,L,n,e)})};
// Nuit de la mort : chaque ennemi traversé prend le coup (exécution)
AUXF.tj_night=x=>{const u=x.owner;if(u.dead||u.dash!==x.d){x.t=0;return}
 for(const e of enemies(u))if(!x.hs.has(e)&&dist(u,e)<u.r+e.r+22){x.hs.add(e);hit(e,u,60,{melee:1,unblockable:1,exec:.1,kb:300});jx({jfx:'tj_impact',x:e.x,y:e.y,a:ang(u,e),t:.5,m:.5,big:1,col:'#ff6a4a'});
  tjSay(e,'NUIT DE LA MORT','#ff4a3a');if(near(e.x,e.y))S('boom',u);tjImp(u,e,2.2,60,1,ang(u,e),'#ff6a4a');fxPillar(e.x,e.y,'#ff4a3a',{u,h:200,w:24,t:.5,al:.45});fxDecal(e.x,e.y,'crack',{u,r:60,t:4});fxShake(.45,e.x,e.y)}
 if(near(u.x,u.y))fx.push({x:u.x+(rnd()-.5)*20,y:u.y+(rnd()-.5)*20,z:20+rnd()*30,vx:(rnd()-.5)*60,vy:(rnd()-.5)*60,t:.6,m:.6,col:rnd()<.5?'#ff4a3a':'#ffb0a0',r:3+rnd()*3,vfx:'chakra'})};
// Esquive du fauve : pas de côté, image rémanente, puis riposte si l'attaquant est proche
function tjDodge(u,src){const ox=u.x,oy=u.y,a=ang(src,u),s=rnd()<.5?1:-1;u.kx=u.ky=0;u.x+=Math.cos(a+s*1.57)*42;u.y+=Math.sin(a+s*1.57)*42;collide(u);u.haste=Math.max(u.haste,1.5);
 jx({jfx:'tj_ghost',ui:units.indexOf(u),x:ox,y:oy,t:.5,m:.5});sparks(ox,oy,'#5aa83a',4,'leaf');tjLeaves(u,ox,oy,8,160);tjSay(u,'ESQUIVE','#9f6');S('dash',u);
 if(dist(u,src)<170&&!src.dead)later(u,.08,()=>{if(u.dead||u.stun>0||src.dead||dist(u,src)>190)return;u.aim=ang(u,src);anim(u,'tj_senpu',.3);VFX='leaf';
  hit(src,u,14,{melee:1,unblockable:1,kb:240});VFX=null;tjImp(u,src,1.2,14,1,u.aim);jx({jfx:'tj_crescent',ui:units.indexOf(u),x:u.x,y:u.y,a:u.aim,r:90,t:.3,m:.3});tjSay(u,'RIPOSTE','#9f6')})}

// ---------- trait de clan : les Huit Portes ----------
TRAITS[10]={nom:'Huit Portes',desc:'Frapper et encaisser ouvre peu à peu les portes (jusqu\'à la 5e) : +1,5 % de dégâts et de vitesse par porte ; dès la 3e, le corps se consume. Hors combat, elles se referment.',
 init(u){u.tj_g=0;u.tj_cT=0;u.tj_n=0},
 update(u,dt){// réapparition (mode bataille) : le moteur recrée le ninja sans effacer nos champs, on repart de zéro
  if(u.tj_cds!==u.cds){if(u.tj_cds){u.tj_g=u.tj_cT=u.tj_n=u.tj_8=u.tj_red=u.tj_esq=u.tj_life=0}u.tj_cds=u.cds}
  if(u.tj_cT>0)u.tj_cT-=dt;if(u.dash&&(u.dash.lock||u.dash.nt))for(let i=fx.length-1;i>=0&&i>=fx.length-30;i--){const f=fx[i];if(f.r===6&&f.vx===0&&f.vy===0&&!f.vfx&&f.x===u.x&&f.y===u.y){fx.splice(i,1);break}}
  if(u.tj_esq>0)u.tj_esq-=dt;if(u.tj_pb>0)u.tj_pb-=dt;if(u.tj_life>0){u.tj_life-=dt;u.cds[0]=Math.max(0,u.cds[0]-dt*.7);u.stam=Math.min(100,u.stam+55*dt)}if(u.tj_red>0)u.tj_red-=dt;
  // huit portes (ultime) : jauge pleine, puis épuisement
  if(u.tj_8>0){u.tj_8-=dt;u.tj_g=8;u.auraV='gate';if(u.tj_8<=0){u.tj_g=0;u.slow=Math.max(u.slow,1);tjSay(u,'ÉPUISÉ','#ff9a7a')}}
  else if(u.tj_g>5)u.tj_g=Math.max(5,u.tj_g-dt*.8);else if(u.tj_cT<=0&&u.tj_g>0)u.tj_g=Math.max(0,u.tj_g-dt*.5);
  const n=tjG(u);if(n>(u.tj_n||0)&&n>=3&&!(u.tj_8>0)&&near(u.x,u.y)){tjSay(u,n+'e PORTE','#9fffa8');jx({jfx:'tj_gate',ui:units.indexOf(u),x:u.x,y:u.y,n,t:.6,m:.6,small:1})}u.tj_n=n;
  // vitesse des portes
  if(n&&!u.dash&&u.stun<=0&&u.root<=0&&u.moving&&!u.chk){const b=n*.015;u.x+=u.vx*dt*b;u.y+=u.vy*dt*b;collide(u)}
  // le corps se consume dès la 3e porte
  if(n>=3&&!(u.tj_8>0)&&u.hp>u.max*.15)u.hp=Math.max(u.max*.15,u.hp-(n-2)*.55*dt);
  // pas de mudras pour le taijutsu : le ninja prend sa garde pendant l'incantation
  if(u.cast&&(!u.anim||u.anim.k==='tj_stance'))u.anim={k:'tj_stance',t:.08,m:.5}},
 deal(src,t,dmg,o){const n=tjG(src);if(n)dmg*=1+n*.015;if(src.tj_pb>0&&o.basic){dmg*=1.3;src.tj_pb=0}if(src.tj_life>0)dmg*=1.15;if(t.tj_rvT>0&&t.tj_rvBy===src)dmg*=1.1;
  if(!o.silent&&!o.thorn){src.tj_g=Math.min(src.tj_8>0?8:Math.max(5,src.tj_g||0),(src.tj_g||0)+(o.melee?.3:.15));src.tj_cT=3}return dmg},
 take(t,src,dmg,o){if(!src||src===t||src.team===t.team||o.silent)return dmg;
  if(t.tj_esq>0){t.tj_esq=0;tjDodge(t,src);return -1}
  t.tj_g=Math.min(Math.max(5,t.tj_g||0),(t.tj_g||0)+.12);t.tj_cT=3;return dmg},
 draw(u,p,S,sk){const n=tjG(u),t=performance.now()/1000;
  if(u.tj_red>0||u.tj_8>0)tjTint(u,p,S,'#ff2a1a',(.3+.08*Math.sin(t*9))*Math.min(1,Math.max(u.tj_red||0,u.tj_8||0)*2));
  if(!n)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=fxA(u);if(n>=3)fxGlowS(p.x,p.y,26*S*sk,GATEC(n),.12+.03*n,26*S*sk*K,0);
  // anneau des huit portes au sol
  for(let i=0;i<8;i++){const on=i<n,a=i*.785+t*.6;g.strokeStyle=rgba(GATEC(i+1),on?.8:.12);g.lineWidth=on?2.5:1.5;g.beginPath();g.ellipse(p.x,p.y,21*S*sk,21*S*sk*K,0,a+.1,a+.62);g.stroke()}
  // vapeur de chakra (rouge dès la 6e porte)
  const red=n>=6,nv=Math.max(2,fxN(n+(red?3:0),u));for(let i=0;i<nv;i++){const k=(t*1.1+i*.37)%1,a=i*2.4+t*.8,x=p.x+Math.cos(a)*11*S,y=p.y-(8+k*58)*S*sk;
   g.fillStyle=rgba(red&&i%2?'#ff5a3a':GATEC(Math.min(n,i+1)),.26*(1-k));g.beginPath();g.ellipse(x,y,(3+k*5)*S,(5+k*7)*S,0,0,7);g.fill()}
  g.restore()},
 hud(u,x,y){const n=tjG(u),X=x+368,Y=y-56;text('PORTES '+n+'/8'+(n?' · '+GATEN[n-1]:''),X,Y-4,10,n>=8?'#ff8a7a':'#9fe8a8','left');
  for(let i=0;i<8;i++){const on=i<n;g.fillStyle=on?GATEC(i+1):'rgba(0,0,0,.55)';g.fillRect(X+i*13,Y,11,15);g.strokeStyle=on?'#ffffff':'rgba(255,255,255,.25)';g.lineWidth=1;g.strokeRect(X+i*13,Y,11,15)}
  const f=(u.tj_g||0)-n;if(n<8&&f>0){g.fillStyle='rgba(255,255,255,.45)';g.fillRect(X+n*13,Y+15-15*f,11,15*f)}}};
AFTER.push(()=>{UK.push('tj_g','tj_esq','tj_red','tj_8');FXTELE.add('tj_foot')});

// ---------- animations (poses du squelette, dessinées en 2D) ----------
Object.assign(ANIM,{
 // garde du fauve : main droite tendue paume ouverte, main gauche dans le dos
 tj_stance:(P,e,u,t)=>{const k=u&&u.cast?Math.min(1,u.cast.t/.12):Math.min(1,e*4);P.root.y=-3*k+Math.sin(t*9)*.4;pz(P,'chest',.1*k,.35*k);pz(P,'head',0,-.3*k);
  pz(P,'armR',-1.4*k,0,-.08);pz(P,'foreR',-.3*k);pz(P,'armL',.55*k,0,.3*k);pz(P,'foreL',-1.7*k);pz(P,'thighL',-.5*k,0,.15);pz(P,'shinL',.55*k);pz(P,'thighR',.35*k,0,-.2);pz(P,'shinR',.45*k)},
 // coup de pied circulaire (un tour complet, jambe tendue)
 tj_senpu:(P,e)=>{const b=bump(Math.min(1,e*1.15));P.rootR.y=tjSp(-6.2832*ezo(e));P.root.y=4*b;pz(P,'thighR',-1.5*b,0,-.5*b);pz(P,'shinR',.1);pz(P,'thighL',.15);pz(P,'shinL',.4);
  pz(P,'chest',-.3*b,0,.2*b);pz(P,'armL',-.5,0,1.3);pz(P,'armR',-.3,0,-1.2)},
 // trois tours en l'air, jambes alternées
 tj_daisen:(P,e)=>{const n=e*3,i=Math.min(2,n|0),L=i===1,b=bump(n-i),s=L?'L':'R',o=L?'R':'L';P.rootR.y=tjSp(-6.2832*n);P.root.y=7+4*b;
  pz(P,'thigh'+s,-1.45*b-.2,0,(L?.5:-.5)*b);pz(P,'shin'+s,.15);pz(P,'thigh'+o,-.6);pz(P,'shin'+o,1.4);pz(P,'chest',-.3,0,L?-.2:.2);pz(P,'armL',-.6,0,1.2);pz(P,'armR',-.6,0,-1.2)},
 // armé puis coup de pied haut surpuissant
 tj_goriki:(P,e)=>{if(e<.28){const k=e/.28;P.rootR.y=.9*k;pz(P,'thighR',-.9*k);pz(P,'shinR',1.8*k);pz(P,'chest',.15*k);pz(P,'armL',-.9,0,.6);pz(P,'armR',-.5,0,-.7);P.root.y=-3*k}
  else{const k=ezo(Math.min(1,(e-.28)/.4));P.rootR.y=tjSp(.9-2.5*k);P.root.y=2;pz(P,'thighR',-2.1,0,-.6*k);pz(P,'shinR',.05);pz(P,'footR',-.3);pz(P,'thighL',.1);pz(P,'shinL',.35);
   pz(P,'chest',-.45,0,.3*k);pz(P,'armL',-1.1,0,1.2);pz(P,'armR',.5,0,-1)}},
 // coup de pied sauté : jambe droite tendue, gauche repliée
 tj_flykick:(P,e)=>{const k=Math.min(1,e/.18);pz(P,'thighR',-1.55*k);pz(P,'shinR',0);pz(P,'footR',-.5*k);pz(P,'thighL',-.8*k);pz(P,'shinL',1.9*k);pz(P,'chest',-.45*k);pz(P,'head',.3*k);
  pz(P,'armL',.9*k,0,.8);pz(P,'armR',.8*k,0,-.8);P.root.z=6*k;P.root.y=4*k;P.rootR.x=-.3*k},
 // piqué du Lotus : tête en bas, en vrille
 tj_lotus:(P,e)=>{const f=ezo(Math.min(1,e/.3));P.root.y=48*f;P.rootR.x=-3*f;P.rootR.y=tjSp(Math.PI*5*ezio(e));pz(P,'armL',-2.9,0,.3);pz(P,'armR',-2.9,0,-.3);pz(P,'foreL',-.4);pz(P,'foreR',-.4);
  pz(P,'thighL',-.1,0,.1);pz(P,'thighR',-.1,0,-.1)},
 // ouverture des portes : bras croisés, puis tout s'ouvre dans un cri
 tj_gate:(P,e)=>{if(e<.35){const k=e/.35;pz(P,'armL',-1.3*k,0,-.55*k);pz(P,'armR',-1.3*k,0,.55*k);pz(P,'foreL',-1.5*k);pz(P,'foreR',-1.5*k);pz(P,'chest',.35*k);pz(P,'head',.3*k);P.root.y=-4*k;
   pz(P,'thighL',-.3*k,0,.25);pz(P,'thighR',-.3*k,0,-.25);pz(P,'shinL',.7*k);pz(P,'shinR',.7*k)}
  else{const k=ezo(Math.min(1,(e-.35)/.25));pz(P,'armL',-1.3+1.6*k,0,-.55+1.6*k);pz(P,'armR',-1.3+1.6*k,0,.55-1.6*k);pz(P,'foreL',-1.5+1.2*k);pz(P,'foreR',-1.5+1.2*k);
   pz(P,'chest',.35-.75*k);pz(P,'head',.3-.8*k);P.root.y=-4+5*k;pz(P,'thighL',-.1,0,.4);pz(P,'thighR',-.1,0,-.4);pz(P,'shinL',.3);pz(P,'shinR',.3)}},
 // coup de talon : jambe levée au ciel puis abattue
 tj_heel:(P,e)=>{if(e<.65){const k=ezo(Math.min(1,e/.4));pz(P,'thighR',-2.7*k);pz(P,'shinR',.05);pz(P,'footR',.4*k);pz(P,'thighL',-.5*k);pz(P,'shinL',1.2*k);pz(P,'chest',-.25*k);pz(P,'armL',-2.6*k,0,.6);pz(P,'armR',-2.2*k,0,-.7)}
  else{const k=ezo(Math.min(1,(e-.65)/.15));pz(P,'thighR',-2.7+2.3*k);pz(P,'shinR',.05+.5*k);pz(P,'thighL',-.5-.5*k);pz(P,'shinL',1.2+.5*k);pz(P,'chest',-.25+.85*k);pz(P,'armL',-2.6+2*k,0,.6);pz(P,'armR',-2.2+1.6*k,0,-.7);P.root.y=-7*k}},
 // cinq directs alternés (Éléphant du soir)
 tj_punches:(P,e)=>{const n=e*5,i=n|0,ph=n-i,x=ph<.3?ph/.3:1-(ph-.3)/.7,R=i%2===0,s=R?'R':'L',o=R?'L':'R';pz(P,'arm'+s,-1.6*x-.05,0,R?.1:-.1);pz(P,'fore'+s,-.15*(1-x));
  pz(P,'arm'+o,-.95,0,R?.25:-.25);pz(P,'fore'+o,-1.75);pz(P,'chest',.18,(R?.4:-.4)*x);P.root.y=-3;P.root.z=3*x;pz(P,'thighL',-.5,0,.25);pz(P,'shinL',.65);pz(P,'thighR',.35,0,-.25);pz(P,'shinR',.55)},
 // rafale de poings (Paon du matin)
 tj_flurry:(P,e,u,t)=>{const n=t*22,i=n|0,x=Math.sin((n-i)*Math.PI),R=i%2===0,s=R?'R':'L',o=R?'L':'R';pz(P,'arm'+s,-1.55*x-.1,0,(R?.25:-.25)*(1-x));pz(P,'fore'+s,-.2);
  pz(P,'arm'+o,-1,0,R?.35:-.35);pz(P,'fore'+o,-1.6);pz(P,'chest',.25,(R?.3:-.3)*x);pz(P,'head',.1);P.root.y=-4;pz(P,'thighL',-.55,0,.3);pz(P,'shinL',.7);pz(P,'thighR',.4,0,-.3);pz(P,'shinR',.6)},
 // poing dans la paume, puis la frappe du tigre
 tj_tiger:(P,e)=>{if(e<.5){const k=Math.min(1,e/.15);pz(P,'armL',-1.1*k,0,-.45*k);pz(P,'foreL',-1.5*k);pz(P,'armR',-1*k,0,.5*k);pz(P,'foreR',-1.8*k);pz(P,'chest',.2*k,-.35*k);P.root.y=-5*k;
   pz(P,'thighL',-.6*k,0,.3);pz(P,'shinL',1*k);pz(P,'thighR',.4*k,0,-.3);pz(P,'shinR',.8*k)}
  else{const k=ezo(Math.min(1,(e-.5)/.15));pz(P,'armR',-1-.6*k,0,.5-.45*k);pz(P,'foreR',-1.8+1.75*k);pz(P,'armL',-1.1+1.6*k,0,-.45+.9*k);pz(P,'foreL',-1.5+.8*k);pz(P,'chest',.2+.25*k,-.35+.75*k);
   P.root.z=14*k;P.root.y=-5;pz(P,'thighR',-1*k,0,-.1);pz(P,'shinR',.9*k);pz(P,'thighL',.6*k,0,.2);pz(P,'shinL',.4)}},
 // retirer ses poids : se penche, puis secoue la jambe
 tj_weights:(P,e)=>{if(e<.55){const k=Math.min(1,e/.2);P.root.y=-7*k;pz(P,'chest',.9*k);pz(P,'head',-.3*k);pz(P,'armL',-.9*k,0,.3);pz(P,'armR',-.9*k,0,-.3);pz(P,'thighL',-.9*k);pz(P,'shinL',1.6*k);pz(P,'thighR',-.4*k);pz(P,'shinR',1.4*k)}
  else{const k=bump((e-.55)/.45);pz(P,'thighR',-2.2*k);pz(P,'shinR',.1);pz(P,'armL',-.4,0,.9);pz(P,'armR',-.4,0,-.9);pz(P,'chest',-.3*k);P.root.y=3*k}},
 // garde croisée (Corps de jade)
 tj_guard:(P,e)=>{const k=Math.min(1,e*5);P.root.y=-3*k;pz(P,'armL',-1.45*k,0,-.6*k);pz(P,'foreL',-1.5*k);pz(P,'armR',-1.45*k,0,.6*k);pz(P,'foreR',-1.5*k);pz(P,'chest',.2*k);pz(P,'head',.2*k);
  pz(P,'thighL',-.3*k,0,.3);pz(P,'shinL',.6*k);pz(P,'thighR',.2*k,0,-.3);pz(P,'shinR',.5*k)},
});

// ---------- visuels ----------
// tourbillon de coups de pied (Senpû, Daisenpû) : arcs blancs et verts, feuilles
JFXD.tj_whirl=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,q=P(c.x,c.y,0),R=f.r*q.s*(.7+e*.35),a0=e*(f.big?11:13);g.globalCompositeOperation='lighter';g.lineCap='round';
 for(let j=0;j<3;j++){g.strokeStyle=rgba(j?'#8ad05a':'#ffffff',(.8-j*.2)*k);g.lineWidth=(6-j*1.5)*q.s*k+1;g.beginPath();g.ellipse(q.x,q.y-(10+j*12)*q.s,R*(1-j*.15),R*(1-j*.15)*K,0,a0-j*.6,a0-j*.6+2.4);g.stroke()}
 g.globalCompositeOperation='source-over';for(let i=0;i<6;i++){const b=a0*1.3+i*1.05,rr=R*(.75+(i%3)*.12),x=q.x+Math.cos(b)*rr,y=q.y-(16+(i%3)*10)*q.s+Math.sin(b)*rr*K;
  g.fillStyle=i%2?'#5aa83a':'#9ad86a';g.beginPath();g.ellipse(x,y,4.5*q.s*k+1,2*q.s,b+1.2,0,7);g.fill()}};
// croissant du coup de pied surpuissant
JFXD.tj_crescent=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,q=P(c.x,c.y,24),R=f.r*q.s*(.55+e*.55),a=f.a,sw=.95;g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#ffffff',.8*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,a-sw,a+sw);g.ellipse(q.x+Math.cos(a)*R*.22,q.y+Math.sin(a)*R*.22*K,R*.8,R*.8*K,0,a+sw*.9,a-sw*.9,true);g.closePath();g.fill();
 g.strokeStyle=rgba('#8ad05a',.75*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,R*1.08,R*1.08*K,0,a-sw*1.05,a+sw*1.05);g.stroke();
 g.strokeStyle=rgba('#ffffff',.6*k);g.lineWidth=1.5;for(let i=0;i<5;i++){const b=a+(i-2)*.32,r0=R*(1.1+e*.3),r1=R*(1.45+e*.6);g.beginPath();g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*K);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*K);g.stroke()}};
// sillage de vitesse (Dynamic Entry, Lotus) : traits verts et blancs qui suivent le ninja
JFXD.tj_dash=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,(u.z||0)+30),s=q.s,dx=Math.cos(f.a),dy=Math.sin(f.a)*K,l=Math.hypot(dx,dy)||1,cx=dx/l,cy=dy/l;
 g.globalCompositeOperation='lighter';g.lineCap='round';for(let i=0;i<6;i++){const o=(i-2.5)*7*s,L=(36+(i*29+t*700)%46)*s,x0=q.x-cy*o-cx*16*s,y0=q.y+cx*o-cy*16*s;
  g.strokeStyle=rgba(i%2?'#9fffa8':'#ffffff',.65*k);g.lineWidth=(i%2?2:3)*s;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0-cx*L,y0-cy*L);g.stroke()}};
// impact en étoile
JFXD.tj_impact=(f,k,e)=>{const q=P(f.x,f.y,30),R=(f.big?50:32)*q.s*(.45+e*.9),a=f.a||0;g.globalCompositeOperation='lighter';g.fillStyle=rgba(f.col||'#ffffff',.85*k);g.beginPath();
 for(let i=0;i<10;i++){const b=a+i*.628,L=i%2?R*.32:R*(i%4?.8:1.15);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*.75)}g.closePath();g.fill();circ(q.x,q.y,R*.28*k,'#ffffff');
 g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=2;for(let i=0;i<5;i++){const b=a+(i-2)*.3;g.beginPath();g.moveTo(q.x+Math.cos(b)*R*.9,q.y+Math.sin(b)*R*.7);g.lineTo(q.x+Math.cos(b)*R*1.7,q.y+Math.sin(b)*R*1.3);g.stroke()}};
// bouclier brisé : éclats
JFXD.tj_shards=(f,k,e)=>{const q=P(f.x,f.y,40);for(let i=0;i<8;i++){const b=i*.785+.3,d=(10+e*55)*q.s,x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*.7+e*e*30*q.s;g.save();g.translate(x,y);g.rotate(b+e*8);
 g.fillStyle=rgba(i%2?'#ffd88a':'#bfe6ff',.9*k);g.beginPath();g.moveTo(0,-5*q.s);g.lineTo(4*q.s,4*q.s);g.lineTo(-4*q.s,3*q.s);g.fill();g.restore()}};
// Lotus : la cible ligotée tourne en l'air (bandes enroulées : devant claires, derrière sombres) ; le ruban la relie à la main de Lee
JFXD.tj_bandage=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,tg.z||0),s=q.s,H=58*s,sp=t*16,al=Math.min(1,k*5);g.lineCap='round';
 for(let i=0;i<7;i++){const w=(15-Math.abs(i-3)*1.5)*s,y=q.y-H*(.14+i*.12),b=sp+i*.75;g.lineWidth=4.5*s;
  g.strokeStyle=rgba('#9a8e78',.9*al);g.beginPath();g.ellipse(q.x,y,w,w*.36,-.22,b+3.3,b+5.6);g.stroke();
  g.strokeStyle=rgba('#f8f2e4',al);g.beginPath();g.ellipse(q.x,y,w,w*.36,-.22,b,b+2.6);g.stroke()}
 if(u&&!u.dead){const a=P(u.x,u.y,(u.z||0)+34),mx=(a.x+q.x)/2+Math.sin(t*19)*12*s,my=Math.min(a.y,q.y-H*.5)-26*s;
  g.strokeStyle=rgba('#d8ceb8',.9*al);g.lineWidth=5*s;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo(mx,my,q.x,q.y-H*.55);g.stroke();
  g.strokeStyle=rgba('#fffaf0',al);g.lineWidth=2.5*s;g.stroke()}
 g.globalCompositeOperation='lighter';g.lineWidth=2;for(let j=0;j<2;j++){g.strokeStyle=rgba(j?'#9fffa8':'#ffffff',.45*al);g.beginPath();g.ellipse(q.x,q.y-H*.5,(27+j*9)*s,H*.66,0,sp*1.2+j*3,sp*1.2+j*3+2.2);g.stroke()}};
// cratère : fissures, poussière et débris
JFXD.tj_crater=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s,k2=Math.min(1,k*2);g.fillStyle=rgba('#2a1c10',.45*k2);g.beginPath();g.ellipse(q.x,q.y,R*.55,R*.55*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#1a120a',.8*k2);g.lineWidth=2;g.beginPath();for(let i=0;i<9;i++){const b=i*.7+f.x*.01,L=R*(.7+(i%3)*.25);g.moveTo(q.x+Math.cos(b)*R*.3,q.y+Math.sin(b)*R*.3*K);
  g.lineTo(q.x+Math.cos(b+.15)*L*.7,q.y+Math.sin(b+.15)*L*.7*K);g.lineTo(q.x+Math.cos(b-.05)*L,q.y+Math.sin(b-.05)*L*K)}g.stroke();
 const d=R*(.5+e*.9);g.fillStyle=rgba('#d8c8a8',.35*k);for(let i=0;i<8;i++){const b=i*.785;g.beginPath();g.ellipse(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-6*q.s,(10+e*12)*q.s,(6+e*6)*q.s,0,0,7);g.fill()}
 g.fillStyle=rgba('#6a4a30',k);for(let i=0;i<6;i++){const b=i*1.05+.5,dd=R*.6*(.5+e),h=Math.sin(Math.PI*Math.min(1,e*1.6))*40*q.s*(1+(i%2)*.5);g.fillRect(q.x+Math.cos(b)*dd,q.y+Math.sin(b)*dd*K-h,4*q.s,4*q.s)}};
// une porte s'ouvre : anneau des huit portes, colonne de lumière, éclats de roche
JFXD.tj_gate=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,q=P(c.x,c.y,0),col=GATEC(f.n),sm=f.small?.6:1,R=(30+e*50*sm)*q.s;g.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const a=i*.785-1.57,on=i<f.n;g.strokeStyle=rgba(on?GATEC(i+1):'#ffffff',(on?.85:.18)*k);g.lineWidth=(on?4:2)*q.s;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,a+.08,a+.7);g.stroke()}
 const h=150*sm*q.s*Math.min(1,e*4),w=(16+e*10)*q.s*k*sm;g.fillStyle=rgba(col,.35*k);g.beginPath();g.ellipse(q.x,q.y-h/2,w,h/2,0,0,7);g.fill();g.fillStyle=rgba('#ffffff',.5*k);g.beginPath();g.ellipse(q.x,q.y-h/2,w*.35,h/2,0,0,7);g.fill();
 g.globalCompositeOperation='source-over';g.fillStyle=rgba('#7a5a3a',k);for(let i=0;i<6;i++){const b=i*1.05+f.n,d=(26+(i%3)*10)*q.s;g.fillRect(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-e*(30+i*6)*q.s,3.5*q.s,3.5*q.s)}
};
// les huit portes : huit colonnes de lumière en cercle, onde rouge
JFXD.tj_8gates=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,q=P(c.x,c.y,0);g.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const st=i*.07;if(e<st)continue;const ee=Math.min(1,(e-st)/.3),a=i*.785+.4,x=q.x+Math.cos(a)*70*q.s,y=q.y+Math.sin(a)*70*q.s*K,h=170*q.s*ezo(ee)*(1-Math.max(0,e-.7)/.3);
  g.fillStyle=rgba(GATEC(i+1),.4);g.beginPath();g.ellipse(x,y-h/2,9*q.s,h/2+1,0,0,7);g.fill()}
 const R=(40+e*200)*q.s;g.strokeStyle=rgba('#ff4a3a',.8*k);g.lineWidth=6*k+1;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.strokeStyle=rgba('#8affd8',.6*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,R*.7,R*.7*K,0,0,7);g.stroke();
 g.fillStyle=rgba('#ff3a2a',.25*k);g.beginPath();g.ellipse(q.x,q.y-40*q.s,60*q.s,80*q.s,0,0,7);g.fill()};
// poids qui tombent et s'écrasent
const tjWeight=(x,y,s,r,al)=>{g.save();g.translate(x,y);g.rotate(r);g.globalAlpha*=al;g.fillStyle='#d0802a';g.fillRect(-11*s,-7*s,22*s,14*s);g.fillStyle='#8a4a1a';g.fillRect(-11*s,3*s,22*s,4*s);
 g.fillStyle='#4a2a12';for(let i=-1;i<=1;i++)g.fillRect((i*6-1)*s,-7*s,2*s,14*s);g.strokeStyle='#2a1808';g.lineWidth=1.2;g.strokeRect(-11*s,-7*s,22*s,14*s);g.restore()};
JFXD.tj_weights=(f,k,e)=>{const fall=Math.min(1,e/.25);for(const s of[-1,1]){const q=P(f.x+s*15,f.y+5,40*(1-fall*fall));tjWeight(q.x,q.y,q.s,fall<1?e*14*s:s*.25,1)}
 if(e>.25){const ee=(e-.25)/.75,q=P(f.x,f.y,0),R=(26+ee*80)*q.s;g.strokeStyle=rgba('#e8d8b8',.8*(1-ee));g.lineWidth=6*(1-ee)+1;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();
  g.strokeStyle=rgba('#1a120a',.7*(1-ee));g.lineWidth=2;g.beginPath();for(let i=0;i<8;i++){const b=i*.8+.2,L=(30+(i%3)*14)*q.s;g.moveTo(q.x+Math.cos(b)*10*q.s,q.y+Math.sin(b)*10*q.s*K);g.lineTo(q.x+Math.cos(b+.1)*L,q.y+Math.sin(b+.1)*L*K)}g.stroke();
  g.fillStyle=rgba('#c8b898',.5*(1-ee));for(let i=0;i<8;i++){const b=i*.785;g.beginPath();g.ellipse(q.x+Math.cos(b)*R*.75,q.y+Math.sin(b)*R*.75*K-8*q.s*ee,(10+ee*10)*q.s,(6+ee*5)*q.s,0,0,7);g.fill()}}};
AUXD.tj_crater=(x,k)=>{const q=P(x.x,x.y,0);g.fillStyle=rgba('#2a1c10',.4*k);g.beginPath();g.ellipse(q.x,q.y,x.r*q.s*1.3,x.r*q.s*K*1.3,0,0,7);g.fill();
 for(const s of[-1,1]){const p=P(x.x+s*15,x.y+5,0);tjWeight(p.x,p.y,p.s,s*.25,k)}};
// coup de talon : zone d'étourdissement dorée, onde, fissures
JFXD.tj_heel=(f,k,e)=>{const q=P(f.x,f.y,0),r1=f.r*q.s*(.4+e*.7),r0=60*q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffe08a',.35*k);g.beginPath();g.ellipse(q.x,q.y,r0,r0*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(q.x,q.y,r1,r1*K,0,0,7);g.stroke();g.globalCompositeOperation='source-over';
 g.strokeStyle=rgba('#1a120a',.75*Math.min(1,k*2));g.lineWidth=2;g.beginPath();for(let i=0;i<7;i++){const b=i*.9+.3,L=r0*(1.2+(i%2)*.4);g.moveTo(q.x,q.y);g.lineTo(q.x+Math.cos(b)*L*.6,q.y+Math.sin(b)*L*.6*K+2);g.lineTo(q.x+Math.cos(b+.12)*L,q.y+Math.sin(b+.12)*L*K)}g.stroke()};
// silhouettes rémanentes
JFXD.tj_ghost=(f,k,e,t,u)=>tjGhost(u,f.x,f.y,0,.55*k);
JFXD.tj_blink=(f,k,e,t,u)=>{const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#8ad05a',.55*k);g.lineWidth=12*k*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=3*k;g.stroke();g.strokeStyle=rgba('#cfffcf',.5*k);g.lineWidth=1;for(let i=0;i<4;i++){const o=(i-1.5)*9;g.beginPath();g.moveTo(a.x,a.y+o);g.lineTo(lerp(a.x,b.x,.75),lerp(a.y,b.y,.75)+o);g.stroke()}
 g.globalCompositeOperation='source-over';if(u)for(let i=1;i<=2;i++)tjGhost(u,lerp(f.x,f.x2,i/3),lerp(f.y,f.y2,i/3),0,.3*k*i/2)};
JFXD.tj_streak=(f,k,e,t,u)=>{const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#6aff7a',.45*k);g.lineWidth=18*k*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
 g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=4*k+1;g.stroke();g.globalCompositeOperation='source-over';if(u)for(let i=1;i<=3;i++)tjGhost(u,lerp(f.x,f.x2,i/4),lerp(f.y,f.y2,i/4),10,.32*k*i/3)};
// garde de l'esquive : feuilles en orbite
JFXD.tj_leafring=(f,k,e,t,u)=>{if(!u||u.dead||!(u.tj_esq>0))return;const q=P(u.x,u.y,0),s=q.s,pu=.6+.4*Math.sin(t*10);g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#6aff7a',.1+.06*pu);g.beginPath();g.ellipse(q.x,q.y-34*s,24*s,40*s,0,0,7);g.fill();g.strokeStyle=rgba('#9affa8',.55+.3*pu);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,30*s,30*s*K,0,0,7);g.stroke();
 g.globalCompositeOperation='source-over';for(let i=0;i<9;i++){const b=t*5+i*.7,h=(14+(i%3)*16)*s;if(Math.sin(b)<-.25)continue;const x=q.x+Math.cos(b)*30*s,y=q.y-h+Math.sin(b)*11*s;
  g.fillStyle=i%2?'#4a9a2a':'#9ad86a';g.beginPath();g.ellipse(x,y,7*s,3*s,b+.8,0,7);g.fill()}};
// « ting ! » : éclat du sourire de Gai
JFXD.tj_ting=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x+Math.cos(u.aim)*8,u.y+Math.sin(u.aim)*8,58),R=(4+bump(e)*16)*q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',k);g.beginPath();
 for(let i=0;i<8;i++){const b=i*.785+.39,L=i%2?R*.18:R;g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L)}g.fill();circ(q.x,q.y,R*.3,rgba('#ffffaa',k))};
// corps de jade : coque de cristal vert, facettes et reflet
JFXD.tj_jade=(f,k,e,t,u)=>{if(!u||u.dead||!(u.deflect>0||u.drT>0))return;const on=u.deflect>0,q=P(u.x,u.y,u.z||0),s=q.s,cx=q.x,cy=q.y-34*s,rx=27*s,ry=42*s;g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#3ad08a',on?.16:.07);g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();g.strokeStyle=rgba('#9affc8',on?.8:.3);g.lineWidth=1.5;g.stroke();
 g.strokeStyle=rgba('#9affc8',on?.45:.18);g.beginPath();for(let i=0;i<6;i++){const a=i*1.047+t*.8,c1=Math.cos(a),c2=Math.cos(a+.5);if(Math.sin(a)<0)continue;g.moveTo(cx+rx*c1*.9,cy-ry*.75);g.lineTo(cx+rx*c2*.97,cy);g.lineTo(cx+rx*c1*.9,cy+ry*.75)}g.stroke();
 const sh=(t*1.3)%2-.5;g.strokeStyle=rgba('#ffffff',on?.55:.2);g.lineWidth=3*s;g.beginPath();g.ellipse(cx,cy,rx*.82,ry*.82,0,-2.2+sh,-1.5+sh);g.stroke()};
// flamme de la jeunesse (Défi éternel) et son éclat « ting ! »
PROJD.tj_defi=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';for(let i=3;i>=1;i--)circ(-i*R*.9,Math.sin(t/40+i)*2,R*(1-i*.2),rgba('#6aff7a',.35));
 g.fillStyle=rgba('#6aff7a',.85);g.beginPath();g.moveTo(R*1.4,0);g.quadraticCurveTo(0,-R*1.3,-R*1.6,-R*.2);g.quadraticCurveTo(-R*.4,0,-R*1.6,R*.2);g.quadraticCurveTo(0,R*1.3,R*1.4,0);g.fill();circ(R*.3,0,R*.5,'#eaffea');
 g.rotate(-ra+t/150);g.fillStyle='#ffffff';g.beginPath();for(let i=0;i<8;i++){const b=i*.785,L=i%2?R*.22:R*1.2;g.lineTo(Math.cos(b)*L,Math.sin(b)*L)}g.fill()};
// rival : emblème flamme + éclair au-dessus de la cible, lien en pointillés
AUXD.tj_riv=(x,k,t)=>{const e=x.ti!=null?units[x.ti]:null,o=x.ui!=null?units[x.ui]:null;if(!e||e.dead)return;const s=P(e.x,e.y,0).s,q=P(e.x,e.y,(e.z||0)+92);q.x+=34*s;
 if(o&&!o.dead&&dist(o,e)<520){const a=P(o.x,o.y,8),b=P(e.x,e.y,8);g.strokeStyle=rgba('#ff7a3a',.35*k);g.lineWidth=2;g.setLineDash([6,8]);g.lineDashOffset=-t*40;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.setLineDash([])}
 g.fillStyle=rgba('#ff5a2a',.9*k);g.beginPath();g.moveTo(q.x-7*s,q.y);g.quadraticCurveTo(q.x-8*s,q.y-12*s,q.x,q.y-18*s-Math.sin(t*12)*2*s);g.quadraticCurveTo(q.x+8*s,q.y-12*s,q.x+7*s,q.y);g.closePath();g.fill();
 g.fillStyle=rgba('#ffe14a',k);g.beginPath();g.moveTo(q.x+s,q.y-14*s);g.lineTo(q.x-3*s,q.y-6*s);g.lineTo(q.x+.5*s,q.y-6*s);g.lineTo(q.x-1.5*s,q.y+s);g.lineTo(q.x+3.5*s,q.y-8*s);g.lineTo(q.x,q.y-8*s);g.closePath();g.fill()};
// Paon du matin : plume de feu à œil de paon, poing enflammé, éventail
PROJD.tj_feather=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ff5a1a',.55);g.beginPath();g.ellipse(-R*.8,0,R*2.6,R*.8,0,0,7);g.fill();
 g.fillStyle=rgba('#ffb03a',.9);g.beginPath();g.ellipse(-R*.3,0,R*1.8,R*.55,0,0,7);g.fill();g.globalCompositeOperation='source-over';circ(R*.7,0,R*.62,'#2ab8b0');circ(R*.7,0,R*.36,'#1a3a8a');circ(R*.78,-R*.08,R*.13,'#fff6c0')};
PROJD.tj_fist=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';for(let i=0;i<5;i++)circ(-i*R*.7,Math.sin(t/30+i)*3,R*(1.1-i*.15),rgba(i%2?'#ff5a1a':'#ffb03a',.5));
 g.fillStyle='#fff3c0';g.beginPath();g.ellipse(R*.3,0,R*.75,R*.6,0,0,7);g.fill();g.strokeStyle='rgba(255,140,40,.9)';g.lineWidth=2;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(R*.6,i*R*.3);g.lineTo(R*1,i*R*.3);g.stroke()}};
JFXD.tj_tail=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,26),s=q.s,L=(70+e*110)*s,a=u.aim,al=Math.min(1,k*3);g.globalCompositeOperation='lighter';
 for(let i=0;i<9;i++){const b=a+(i-4)*.16+Math.sin(t*20+i)*.03,cx=q.x+Math.cos(b)*L*.55,cy=q.y+Math.sin(b)*L*.55*K;g.save();g.translate(cx,cy);g.rotate(Math.atan2(Math.sin(b)*K,Math.cos(b)));
  g.fillStyle=rgba(i%2?'#ff7a2a':'#ffb03a',.3*al);g.beginPath();g.ellipse(0,0,L*.5,9*s,0,0,7);g.fill();g.fillStyle=rgba('#3ad0c0',.5*al);g.beginPath();g.arc(L*.42,0,5*s,0,7);g.fill();g.restore()}};
// Tigre de midi : l'air converge dans le poing, puis le tigre d'air
JFXD.tj_suck=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x+Math.cos(u.aim)*16,u.y+Math.sin(u.aim)*16,32),s=q.s;g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const r=(70-((e*70+i*23)%70))*s;g.strokeStyle=rgba('#e8fff4',.5*(r/(70*s)));g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,r,r*.7,0,0,7);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.5);g.lineWidth=1.5;for(let i=0;i<10;i++){const b=i*.63+t*3,r0=(60-e*30)*s,r1=r0*.35;g.beginPath();g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.7);g.lineTo(q.x+Math.cos(b+.3)*r1,q.y+Math.sin(b+.3)*r1*.7);g.stroke()}
 circ(q.x,q.y,(6+e*6)*s,rgba('#ffffff',.8))};
JFXD.tj_tigerfx=(f,k,e,t)=>{const d=f.spd*(f.m-f.t),x=f.x+Math.cos(f.a)*d,y=f.y+Math.sin(f.a)*d;if(x<B.x||x>B.x+B.w||y<B.y||y>B.y+B.h)return;const q=P(x,y,34),ra=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));
 g.save();g.translate(q.x,q.y);g.scale(q.s*1.75,q.s*1.75);g.rotate(ra);if(Math.cos(f.a)<0)g.scale(1,-1);g.globalAlpha=Math.min(1,k*5,(f.m-f.t)*10);
 g.globalCompositeOperation='lighter';g.fillStyle='rgba(200,255,230,.18)';g.beginPath();g.ellipse(-30,4,62,40,0,0,7);g.fill();
 g.strokeStyle='rgba(220,255,240,.6)';g.lineWidth=3;for(let i=0;i<5;i++){g.beginPath();g.ellipse(-38-i*20,2,24-i*3,30-i*5,0,t*9+i,t*9+i+4);g.stroke()}
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1.5;for(let i=0;i<5;i++){const y=(i-2)*12;g.beginPath();g.moveTo(-50-(i%2)*20,y);g.lineTo(-120-(i%3)*25,y*1.4);g.stroke()}
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(228,255,242,.82)';g.beginPath();g.ellipse(0,0,30,24,0,0,7);g.fill();g.beginPath();g.ellipse(24,6,17,12,.2,0,7);g.fill();
 g.beginPath();g.moveTo(-16,-15);g.quadraticCurveTo(-14,-40,6,-20);g.fill();g.fillStyle='rgba(60,130,100,.6)';g.beginPath();g.moveTo(-11,-17);g.quadraticCurveTo(-10,-31,1,-19);g.fill();
 g.fillStyle='rgba(20,50,40,.85)';g.beginPath();g.moveTo(44,0);g.lineTo(22,10);g.lineTo(40,22);g.closePath();g.fill();g.fillStyle='#ffffff';g.beginPath();g.moveTo(40,2);g.lineTo(36,9);g.lineTo(33,4);g.moveTo(36,20);g.lineTo(32,13);g.lineTo(29,18);g.fill();
 g.strokeStyle='rgba(40,110,80,.8)';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-22,-6);g.lineTo(-8,-2);g.moveTo(-24,4);g.lineTo(-10,6);g.moveTo(-20,13);g.lineTo(-8,12);g.moveTo(-4,-18);g.lineTo(0,-8);g.stroke();
 g.fillStyle='#ffe14a';g.beginPath();g.ellipse(8,-6,6,3.2,-.2,0,7);g.fill();g.fillStyle='#1a2a20';g.fillRect(7.5,-8.5,2.5,5);g.restore()};
// Éléphant du soir : la patte d'air descend, puis l'impact
JFXD.tj_foot=(f,k,e)=>{fxTele(f.x,f.y,68,e,'#e8fff0',f,.05);const h=(1-ezo(e))*190,q=P(f.x,f.y,h),g0=P(f.x,f.y,0),R=f.r*q.s;g.fillStyle=rgba('#000000',.22*e);g.beginPath();g.ellipse(g0.x,g0.y,R*e,R*e*K,0,0,7);g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#e8fff0',.45);g.lineWidth=2;g.beginPath();for(let i=0;i<7;i++){const x=q.x+(i-3)*R*.28;g.moveTo(x,q.y-R*.2-(30+(i%3)*18)*q.s);g.lineTo(x,q.y-R*.2-(80+(i%2)*30)*q.s)}g.stroke();
 // la patte d'air : colonne évasée (plus large au pied), un reflet et des plis d'air comprimé
 const top=q.y-170*q.s;g.fillStyle=rgba('#dff8ea',.08);g.beginPath();g.moveTo(q.x-R*.95,q.y);g.lineTo(q.x-R*.6,top);g.lineTo(q.x+R*.6,top);g.lineTo(q.x+R*.95,q.y);g.closePath();g.fill();
 g.fillStyle=rgba('#ffffff',.06);g.beginPath();g.moveTo(q.x-R*.55,q.y);g.lineTo(q.x-R*.35,top);g.lineTo(q.x-R*.05,top);g.lineTo(q.x+R*.05,q.y);g.closePath();g.fill();
 g.strokeStyle=rgba('#ffffff',.3);g.lineWidth=1.5;for(let i=1;i<4;i++){const w=R*(.95-.075*i);g.beginPath();g.ellipse(q.x,q.y-i*40*q.s,w,w*K*.45,0,.25,Math.PI-.25);g.stroke()}
 g.fillStyle=rgba('#dff8ea',.14);g.beginPath();g.ellipse(q.x,q.y,R*.96,R*.96*K,0,0,7);g.fill();g.strokeStyle=rgba('#ffffff',.75);g.lineWidth=3;g.stroke();
 g.strokeStyle=rgba('#ffffff',.35);g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y,R*.7,R*.7*K,0,0,7);g.stroke();g.fillStyle=rgba('#ffffff',.5);for(let i=0;i<4;i++){const b=1.57-.7+i*.47;g.beginPath();g.ellipse(q.x+Math.cos(b)*R*.82,q.y+Math.sin(b)*R*.82*K,R*.16,R*.1+1,0,0,7);g.fill()}};
JFXD.tj_stomp=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s*(.6+e*.7);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(f.last?'#ffe08a':'#e8fff0',.85*k);g.lineWidth=7*k+1;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();
 g.fillStyle=rgba(f.last?'#ffe08a':'#ffffff',.25*k);g.beginPath();g.ellipse(q.x,q.y,f.r*q.s*.8,f.r*q.s*.8*K,0,0,7);g.fill();g.globalCompositeOperation='source-over';
 g.fillStyle=rgba('#d8c8a8',.4*k);for(let i=0;i<7;i++){const b=i*.9,d=R*1.05;g.beginPath();g.ellipse(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-5*q.s,(8+e*10)*q.s,(5+e*4)*q.s,0,0,7);g.fill()}};
// Nuit de la mort : dragon de vapeur rouge sur toute la ligne
JFXD.tj_dragon=(f,k,e,t)=>{const el=f.m-f.t,pr=Math.min(1,el/f.dur),L=f.len*pr,ca=Math.cos(f.a),sa=Math.sin(f.a),N=16,pts=[];
 for(let i=0;i<=N;i++){const d=L*i/N,w=Math.sin(i*.8-t*14)*26*(i/N)*(1.2-i/N);pts.push(P(clamp(f.x+ca*d-sa*w,B.x,B.x+B.w),clamp(f.y+sa*d+ca*w,B.y,B.y+B.h),36+Math.sin(i*.5+t*6)*8))}
 g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 for(const [w,c,a] of[[44,'#ff2a1a',.3],[24,'#ff5a3a',.55],[9,'#ffd8c8',.85]]){g.strokeStyle=rgba(c,a*k);g.lineWidth=w*pts[N].s;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke()}
 // crête dorsale
 g.strokeStyle=rgba('#ffb0a0',.7*k);g.lineWidth=2;g.beginPath();for(let i=2;i<N;i+=2){const p=pts[i],q=pts[i+1],nx=-(q.y-p.y),ny=q.x-p.x,l=Math.hypot(nx,ny)||1;g.moveTo(p.x,p.y);g.lineTo(p.x+nx/l*18*p.s,p.y+ny/l*18*p.s-8*p.s)}g.stroke();
 const h=pts[N];g.save();g.translate(h.x,h.y);g.rotate(Math.atan2(sa*K,ca));if(ca<0)g.scale(1,-1);g.scale(h.s*1.6,h.s*1.6);g.globalCompositeOperation='source-over';g.globalAlpha=k;
 g.fillStyle='#c0201a';g.beginPath();g.moveTo(40,-2);g.lineTo(10,-18);g.lineTo(-14,-13);g.lineTo(-16,2);g.lineTo(8,0);g.closePath();g.fill();
 g.fillStyle='#8a120e';g.beginPath();g.moveTo(34,13);g.lineTo(8,4);g.lineTo(-14,6);g.lineTo(-12,15);g.lineTo(8,17);g.closePath();g.fill();
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(31,0);g.lineTo(28,6);g.lineTo(25,0);g.moveTo(21,1);g.lineTo(18,7);g.lineTo(15,1);g.moveTo(28,11);g.lineTo(25,5);g.lineTo(22,10);g.fill();
 g.fillStyle='#ff8a6a';g.beginPath();g.moveTo(-6,-12);g.quadraticCurveTo(-20,-30,-34,-30);g.quadraticCurveTo(-20,-22,-12,-6);g.fill();
 g.fillStyle='#ffe14a';g.beginPath();g.ellipse(12,-8,4.5,2.4,-.2,0,7);g.fill();g.fillStyle='#3a0a06';g.fillRect(11,-9.5,2,3);
 g.strokeStyle='#ffd0c0';g.lineWidth=2;g.beginPath();g.moveTo(36,-4);g.quadraticCurveTo(14,-34,-20,-26);g.moveTo(30,14);g.quadraticCurveTo(8,34,-24,30);g.stroke();g.restore()};
