// ===== Styles de combat (attaque de base, gratuite) =====
// [nom, description, mécanique (x.clé = NAT[clé]), vfx, arme, clans autorisés (-1 = sans clan), modif. PV, modif. puissance]
// Règle : une attaque de base est TOUJOURS au corps à corps (allonge max ≈ 130). Combo de 5 coups du moteur (20 d'endurance par coup, parade F+clic, le 5e étourdit) ;
//  chaque style a sa chorégraphie (ANIM.st_<style>1…5), son rythme (recharge propre à chaque coup), sa traînée aux couleurs du clan et une petite mécanique liée au clan.
// Arme (look.weapon.k) : objet tenu en main (fist bigfist palm claws bone sword kunai shadow bugs chain senbon sand puppet vine fan gold paper shuriken ice), toutes de mêlée (MELEEK).
// Les indices sont figés (sauvegardes, PRESETS) : les anciens styles à distance ont été remplacés EN PLACE par un style de mêlée du même clan.
const STYLES=[
 ['Taijutsu','Deux directs, un uppercut, un coup de pied circulaire large, puis un coup de pied sauté qui fond sur la cible','x.st_tai','tai','fist',[-1,6],1.12,1.07],
 ['Kunai au poing','Kunai tenu en main, coups très vifs ; 4e coup : taille tout autour ; 5e : estoc en fente qui fait saigner (5 en 2 s)','x.st_kunai','kunai','kunai',[-1],1.16,1.11],
 ['Kenjutsu','Sabre à longue allonge : frapper de la pointe, à distance, inflige +20 % ; 4e coup : estoc perçant','x.st_ken','steel','sword',[0,-1],1.56,1.5],
 ['Taijutsu Uchiha','Coups de pied vifs ; le Sharingan lit qui attaque (+20 %) et coupe les mudras (une fois toutes les 4 s)','x.st_uch','tai','fist',[0],1.37,1.32],
 ['Poing souple','Paumes du Jûken (sans vol de chakra) ; le 5e coup ferme les points de chakra : plus de jutsu 0,8 s','x.st_juk','jyuken','palm',[1],1.45,1.4],
 ['Frappes d\'ombre','Poings drapés d\'ombre : chaque coup ralentit ; 3e : une pique d\'ombre jaillit du sol en ligne ; 5e : des mains d\'ombre agrippent (ralenti 1 s)','x.st_nara','shadow','shadow',[2],1.12,1.07],
 ['Poing décuplé','Poings géants, lents et larges ; aux 3e et 5e coups, le poing s\'écrase sur toute la zone devant soi','x.st_aki','tai','bigfist',[3],1.5,1.45],
 ['Paumes de l\'essaim','Paumes enrobées d\'insectes ; 3e coup : l\'essaim jaillit en gerbe (+1 insecte) ; 5e : il engloutit la cible (+2 insectes, révélée)','x.st_bug','bugs','bugs',[4],1.17,1.12],
 ['Poings d\'insectes','Chaque coup pose un insecte qui ronge la cible (4 max) ; le 5e les fait dévorer : dégâts et soin par insecte','x.st_abu','bugs','fist',[4],1.2,1.17],
 ['Crocs et griffes','Griffures très rapides ; aux 2e, 4e et 5e coups qui touchent, ton chien mord aussi et ralentit ; le 5e est un bond','x.st_inu','claws','claws',[5],1.24,1.2],
 ['Chaînes au poing','Chaînes de chakra enroulées aux poings ; 3e coup : la chaîne fouette droit devant (allonge 120) ; 4e : elle balaie large ; 5e : elle harponne, ramène la cible et pose un sceau','x.st_chain','chain','chain',[6],1.08,1.03],
 ['Frappes fleuries','Senbon et paumes fleuries, très vifs ; 3 coups de suite sur une cible touchent un point vital : 5 dégâts en plus, ralentit','x.st_sen','senbon','senbon',[7],1.12,1.07],
 ['Poings de sable','Gantelets de sable lourds ; chaque coup qui touche épaissit ton armure de sable (+2, 6 max) ; 5e : un poing de sable s\'abat devant toi','x.st_sand','sand','sand',[8],1.26,1.2],
 ['Danse des os','Lames d\'os aux balayages très larges ; 3e coup : tourbillon tout autour ; 5e : estoc qui transperce','x.st_bone','bone','bone',[9],1.48,1.46],
 ['Taijutsu du fauve','Combo qui s\'accélère à chaque coup ; 4e : coup de pied qui projette en l\'air ; 5e : Konoha Senpû','x.st_lee','tai','fist',[10],1.6,1.55],
 ['Marionnette','Karasu, à ton côté, frappe au contact de ses lames (allonge 125) ; 3e et 5e coups : lames empoisonnées (le 5e ralentit)','x.st_pup','kunai','puppet',[8],1.04,.98],
];

// ---- aides communes des styles
const stC=u=>u.cmbH||1,stI=u=>units.indexOf(u); // n° du coup dans l'enchaînement (1 à 5), index d'un ninja (effets suivis)
const stCd=(u,cd)=>{u.cds[0]=cd*(u.rapid>0?.45:1)}; // rythme propre à chaque coup
// rythme réel d'un style (menu) : recharges des 5 coups lues dans sa table T=[0,[portée,arc,dégâts,recharge],…] ; null si le style n'en a pas
const stCad=ab=>{const m=/T=\[0,((?:\[[^\[\]]*\],?){5})\]/.exec(String(ab&&ab.f)),L=m&&m[1].match(/\[[^\[\]]*\]/g);if(!L||L.length!==5)return null;const v=L.map(x=>+x.slice(1,-1).split(',')[3]);return v.every(x=>x>0)?v:null};
// coup au corps à corps : melee() du moteur (combo, endurance, 5e coup, renvoi des tirs) ; l'arc générique au sol est remplacé par la traînée du style (tr),
// cb(e) est appelé pour chaque ennemi vraiment touché (ni esquivé, ni paré)
function stMelee(u,a,R,arc,dmg,o,tr,cb){const c5=stC(u)===5,L=cb||c5?stIn(u,a,R,arc):[],H=L.map(e=>e.hp+(e.shield||0)),i=fx.length,n=melee(u,a,R,arc,dmg,o||{});
 if(fx[i]&&fx[i].swing)fx.splice(i,1);if(tr)jx(Object.assign({jfx:'st_arc',ui:stI(u),x:u.x,y:u.y,a,R,w:arc,t:.26,m:.26},tr));
 let f5=null;L.forEach((e,k)=>{if(e.hp+(e.shield||0)<H[k]-.01){if(cb)cb(e);if(c5&&!f5)f5=e}});if(f5)stFx5(u,f5,a,dmg);return n}
// 5e coup qui touche : impact aux couleurs du style (palette de son vfx) et gel bref des deux ninjas
function stFx5(u,e,a,dmg){const ab=u.ch.abil[0],v=ab&&ab.vfx||'tai',C=fxPal(v),x=e.x-Math.cos(a)*e.r*.5,y=e.y-Math.sin(a)*e.r*.5;
 fxFlare(x,y,C.a,{u,z:34,r:24,t:.18,c2:C.h});fxBurst(x,y,C.b,{u,z:34,n:9,sp:300,gr:60,up:30,w:1.8,c2:C.h,a,arc:1.8,add:C.e==='blood'?0:1});fxRing(e.x,e.y,{u,r0:8,r1:42,col:C.a,w:4,t:.28});fxHitStop(u,e,dmg,1)}
// ennemis dans l'arc d'un coup
const stIn=(u,a,R,arc)=>enemies(u).filter(e=>dist(u,e)<R+e.r&&angDiff(ang(u,e),a)<arc/2);
// poing qui s'abat sur un disque devant soi (Poing décuplé) : mêmes règles qu'un coup au corps à corps (combo, parade, contre, 5e coup)
function stSlam(u,a,x,y,r,dmg,o){u.swing=.18;u.swingA=a;S('saber',u);let n=0;
 for(const e of enemies(u))if(Math.hypot(e.x-x,e.y-y)<r+e.r&&hit(e,u,dmg,Object.assign({melee:1,ex:EX,basic:BASIC},o))){n++;if(u===player||e===player)hs=.05}return n}
// élan vers l'avant, sans passer à travers la cible
function stLunge(u,a,d){if(u.root>0||u.stun>0)return;const e=nearE(u,u.x+Math.cos(a)*50,u.y+Math.sin(a)*50,80),m=e?Math.max(0,dist(u,e)-u.r-e.r-4):d,v=Math.min(d,m)*7;u.kx+=Math.cos(a)*v;u.ky+=Math.sin(a)*v}
// cible occupée (coup, mudras, souffle, ruée, lancer) : le Sharingan la lit
const stBusy=e=>e.swing>0||!!e.cast||!!e.spin||!!e.flame||!!e.chan||!!e.dash||e.thrT>0||e.relT>0;
// Frappes fleuries : 3 coups de suite (1,6 s) sur la même cible = point vital
function stVital(u,t){if(t.dead||!u)return;const v=t.st_vp&&t.st_vp.u===u&&SIMT-t.st_vp.t<1.6?t.st_vp:{n:0,u};v.n++;v.t=SIMT;t.st_vp=v;
 if(v.n<3){jx({jfx:'st_petals',x:t.x,y:t.y,n:v.n*2,t:.5,m:.5});return}
 t.st_vp=null;const V0=VFX;VFX='senbon';hit(t,u,5,{slow:.9,unblockable:1});VFX=V0;say(t,'POINT VITAL','#ff9ac8');jx({jfx:'st_petals',x:t.x,y:t.y,n:14,big:1,t:.9,m:.9})}
// Poings d'insectes : insectes posés sur la cible (objet aux qui les compte et les fait expirer)
const stBugAux=(u,e)=>aux.find(x=>x.type==='st_bugs'&&x.ti===stI(e)&&x.team===u.team&&x.t>0);
function stBugAdd(u,e){if(e.dead)return;let x=stBugAux(u,e);if(!x){x={type:'st_bugs',ti:stI(e),x:e.x,y:e.y,t:4,m:4,team:u.team,owner:u,vfx:'bugs',k:0,n:0};aux.push(x)}x.n=Math.min(4,x.n+1);x.t=x.m=4;e.st_bugN=x.n}
function stBugEat(u,e){const x=stBugAux(u,e),n=x?x.n:0;if(!n||e.dead)return;x.t=0;x.n=0;e.st_bugN=0;if(!hit(e,u,5*n,{unblockable:1}))return;gain(u,3.5*n,u);say(e,'DÉVORÉ ×'+n,'#b8d08a');jx({jfx:'st_devour',ui:stI(u),ti:stI(e),x:e.x,y:e.y,n,t:.7,m:.7})}

// mécaniques (le nom et la description affichés viennent de STYLES)
Object.assign(NAT,{
 // ---------- corps à corps : [portée, arc, dégâts, recharge] par coup ----------
 // Taijutsu : direct gauche, direct droit, uppercut, circulaire large, coup de pied sauté qui fond sur la cible
 st_tai:SP('Taijutsu','',.45,{hero:'rey',melee:1,ai:{max:90,p:1}},(u,a)=>{const c=stC(u),T=[0,[78,1.7,11,.36],[80,1.7,11,.38],[76,1.6,12,.44],[90,2.6,13,.46],[118,2,14,.62]][c];
  if(c===5){stLunge(u,a,58);S('dash',u);fxSmoke(u.x,u.y,{u,col:'#d8d0c0',n:3,r:20,s:10,t:.55,al:.22,rise:10,dx:-Math.cos(a)*30,dy:-Math.sin(a)*30})}
  stMelee(u,a,T[0],T[1],T[2],{},[0,{jfx:'st_line',off:-6,z:36},{jfx:'st_line',off:6,z:36},{d:1,tl:1.45,z:30,th:12,rr:.6},{d:-1,z:14,th:13},{jfx:'st_line',z:24,n:3,burst:1}][c]);
  stCd(u,T[3]);anim(u,'st_tai'+c,c===5?.36:.28)}),
 // Taijutsu Uchiha : coups de pied vifs ; le Sharingan lit la cible qui attaque ou fait ses mudras (+20 %) et coupe ses mudras (au plus une fois toutes les 4 s par cible)
 st_uch:SP('Taijutsu Uchiha','',.36,{hero:'ahsoka',melee:1,ai:{max:94,p:1}},(u,a)=>{const c=stC(u),T=[0,[88,1.8,10,.34],[90,1.9,11,.34],[92,2,11,.36],[92,2.2,11,.38],[96,2.2,13,.56]][c];
  const C=stIn(u,a,T[0],T[1]),L=C.filter(stBusy),all=L.length>0&&L.length===C.length;
  stMelee(u,a,T[0],T[1],all?T[2]*1.2:T[2],{},[0,{d:1,z:12,th:11,c:'#ffd0d0',c2:'#ff4a4a'},{d:-1,z:30,th:12,c:'#ffd0d0',c2:'#ff4a4a'},{d:1,tl:1.2,z:34,th:12,c:'#ffd0d0',c2:'#ff4a4a',rr:.65},{d:-1,z:22,th:10,n:2,c:'#ffd0d0',c2:'#ff4a4a'},{d:-1,tl:1.5,z:30,th:14,c:'#ffd0d0',c2:'#ff2a2a',rr:.6}][c],e=>{
   if(!L.includes(e)||e.dead)return;const mud=!!e.cast&&e.unstop<=0&&!(SIMT<(e.st_rdT||0));if(mud){e.cast=null;e.st_rdT=SIMT+4}if(!all)hit(e,u,T[2]*.2,{unblockable:1,silent:1});if(mud||!(SIMT<(e.st_luT||0))){say(e,mud?'MUDRAS LUS':'LU !','#ff3a3a');e.st_luT=SIMT+1.5}jx({jfx:'st_read',ti:stI(e),x:e.x,y:e.y,t:.6,m:.6});jx({jfx:'st_eyes',ui:stI(u),x:u.x,y:u.y,t:.35,m:.35})});
  stCd(u,T[3]);anim(u,'st_uch'+c,c===2?.32:.27)}),
 // Kenjutsu : longue allonge, la pointe de la lame (+20 % sur une cible éloignée) ; 4e : estoc ; 5e : iai (coupe large)
 st_ken:SP('Kenjutsu','',.4,{hero:'dooku',melee:1,ai:{max:104,p:1}},(u,a)=>{const c=stC(u),T=[0,[98,1.5,10,.4],[98,1.5,10,.4],[102,2,10,.42],[130,.5,11,.44],[108,2.6,12,.62]][c];
  if(c===5)stLunge(u,a,30);
  const C=stIn(u,a,T[0],T[1]),tip=C.filter(e=>dist(u,e)-e.r>T[0]*.6),all=tip.length>0&&tip.length===C.length;
  stMelee(u,a,T[0],T[1],all?T[2]*1.2:T[2],{},[0,{d:-1,tl:.75,z:36,th:6,c:'#e4eeff',blade:1},{d:1,tl:-.75,z:36,th:6,c:'#e4eeff',blade:1},{d:-1,z:30,th:6,c:'#e4eeff',blade:1},{jfx:'st_thrust',z:32,c:'#e4eeff'},{d:-1,z:28,th:8,c:'#ffffff',blade:1,rr:.8}][c],e=>{
   if(!tip.includes(e)||e.dead)return;if(!all)hit(e,u,T[2]*.2,{unblockable:1,silent:1});jx({jfx:'st_glint',ti:stI(e),x:e.x,y:e.y,a,t:.34,m:.34})});
  if(c===5)jx({jfx:'st_iai',ui:stI(u),x:u.x,y:u.y,a,R:T[0],t:.5,m:.5});stCd(u,T[3]);anim(u,'st_ken'+c,c===4?.3:.27)}),
 // Poing souple : paumes sans vol de chakra ; le 5e coup ferme les points de chakra (silence 0,8 s) et repousse
 st_juk:SP('Poing souple','',.32,{hero:'yoda',melee:1,ai:{max:86,p:1}},(u,a)=>{const c=stC(u),T=[0,[80,2,10,.3],[80,2,10,.3],[86,1.4,10,.32],[82,2.6,11,.36],[88,2,12,.52]][c];
  stMelee(u,a,T[0],T[1],T[2],c===5?{silence:.8,kb:140}:{},null,e=>{jx({jfx:'st_tenketsu',ti:stI(e),x:e.x,y:e.y,n:c,seal:c===5?1:0,t:c===5?1:.5,m:c===5?1:.5})});
  jx({jfx:'st_palm',ui:stI(u),x:u.x,y:u.y,a,off:c===1?6:c===2?-6:0,R:T[0]*.6,big:c===5?1:0,t:.32,m:.32});
  if(c===5){jx({jfx:'veins',ui:stI(u),x:u.x,y:u.y,t:.9,m:.9});S('heavy',u)}stCd(u,T[3]);anim(u,'st_juk'+c,c===4?.32:.27)}),
 // Poing décuplé : crochets géants ; 3e et 5e coups : le poing s'écrase sur un disque devant soi ([distance, rayon, dégâts, recharge]) ; 4e : charge du ventre
 st_aki:SP('Poing décuplé','',.6,{hero:'savage',melee:1,ai:{max:104,p:1}},(u,a)=>{const c=stC(u),T=[0,[94,2.2,13,.58],[94,2.2,13,.58],[62,58,15,.72],[96,2.2,12,.6],[68,66,17,.86]][c],slam=c===3||c===5;
  if(c===4){stLunge(u,a,44);S('dash',u)}
  if(slam){const p=fwd(u,a,T[0]);stSlam(u,a,p.x,p.y,T[1],T[2],c===3?{kb:120}:{});jx({jfx:'st_slam',x:p.x,y:p.y,a,r:T[1],t:.75,m:.75});S('heavy',u);
   later(u,.07,()=>{fxRing(p.x,p.y,{u,r0:T[1]*.2,r1:T[1],col:'#ead8b8',c2:'#ffffff',w:c===5?7:5,t:.34});fxDebris(p.x,p.y,{u,n:c===5?8:5,sp:160,col:'#a07850',c2:'#5a4028',s:4});fxSmoke(p.x,p.y,{u,col:'#c8b090',n:c===5?5:3,r:T[1]*.8,s:14,t:.8,al:.24,rise:16});if(c===5)fxDecal(p.x,p.y,'crack',{u,r:T[1]*.85,t:3})})}
  else stMelee(u,a,T[0],T[1],T[2],c===4?{kb:170}:{},{d:c===2?1:-1,z:c===4?22:34,th:c===4?16:24,c:'#ffd8b0',c2:'#ffffff',rr:.7});
  stCd(u,T[3]);anim(u,'st_aki'+c,slam?.42:.34)}),
 // Danse des os : balayages très larges ; 3e : tourbillon tout autour ; 4e : croix ; 5e : estoc d'os (danse du camélia) qui transperce en ligne
 st_bone:SP('Danse des os','',.45,{hero:'grievous',melee:1,ai:{max:96,p:1}},(u,a)=>{const c=stC(u),T=[0,[92,2.8,14,.42],[92,2.8,13,.42],[90,6.3,14,.5],[94,2.4,14,.44],[128,.55,17,.62]][c];
  if(c===5)stLunge(u,a,24);
  stMelee(u,a,T[0],T[1],T[2],{},[0,{d:-1,z:34,th:13,bone:1},{d:1,z:34,th:13,bone:1},{d:-1,z:26,th:11,bone:1,rr:.8},{d:-1,tl:.8,z:36,th:11,bone:1,x2:1},{jfx:'st_thrust',z:30,bone:1,w2:7}][c]);
  if(c===3){S('bone',u);fxRing(u.x,u.y,{u,r0:30,r1:T[0],col:'#f2efe6',c2:'#ffffff',w:4,t:.3})}if(c===5)S('bone',u);stCd(u,T[3]);anim(u,'st_bone'+c,c===3?.36:.28)}),
 // Crocs et griffes : griffures très rapides ; le chien mord aux 2e, 4e et 5e coups (ralentit) ; 5e : bond
 st_inu:SP('Crocs et griffes','',.3,{hero:'ventress',melee:1,ai:{max:86,p:1}},(u,a)=>{const c=stC(u),T=[0,[80,1.9,6,.28],[80,1.9,6,.28],[84,2.1,7,.3],[88,1.9,7,.32],[98,2.2,9,.5]][c];
  if(c===4)stLunge(u,a,32);if(c===5){stLunge(u,a,52);S('dash',u)}
  let bit=c!==2&&c!==4&&c!==5; // le chien ne mord qu'une cible, et seulement si la griffure l'a vraiment touchée (ni gardée, ni parée)
  stMelee(u,a,T[0],T[1],T[2],{},[0,{d:-1,tl:.6,z:34,th:5,n:3,claw:1},{d:1,tl:-.6,z:34,th:5,n:3,claw:1},{d:1,tl:1.4,z:30,th:5,n:3,claw:1,rr:.65},{d:-1,z:26,th:5,n:3,claw:1},{d:-1,tl:.9,z:32,th:6,n:3,claw:1,x2:1}][c],e=>{
   if(bit||e.dead)return;bit=true;hit(e,u,c===5?4:3,{slow:.5,unblockable:1});S('bone',u);jx({jfx:'st_bite',ui:stI(u),ti:stI(e),x:e.x,y:e.y,a,t:.42,m:.42})});
  stCd(u,T[3]);anim(u,'st_inu'+c,c===5?.36:.24)}),
 // Taijutsu du fauve : le combo s'accélère ; 2e : Konoha Reppû (fauchage) ; 4e : Konoha Shôfû (projette en l'air) ; 5e : Konoha Senpû tout autour
 st_lee:SP('Taijutsu du fauve','',.5,{hero:'kylo',melee:1,ai:{max:92,p:1}},(u,a)=>{const c=stC(u),T=[0,[84,1.8,13,.52],[90,2.4,13,.46],[86,2.1,14,.4],[86,1.8,14,.36],[96,6.3,16,.66]][c];
  stMelee(u,a,T[0],T[1],T[2],c===4?{air:.3}:{},[0,{jfx:'st_line',off:6,z:36},{d:1,z:6,th:14,c:'#eaffea',c2:'#8aff9a'},{d:-1,z:36,th:12,c:'#eaffea',c2:'#8aff9a'},{d:1,tl:1.5,z:30,th:14,c:'#d8ffdc',c2:'#4aff6a',rr:.65},{d:1,z:22,th:15,c:'#c8ffd0',c2:'#2aff5a',rr:.8}][c]);
  if(c===5){jx({jfx:'st_whirl',ui:stI(u),x:u.x,y:u.y,t:.55,m:.55});fxWind(u.x,u.y,0,{u,spin:1,w:T[0],n:9,t:.45,col:'#c8ffd0'});fxBurst(u.x,u.y,'#5aa83a',{u,z:20,n:10,sp:260,gr:40,up:60,w:2.4,sh:'petal',c2:'#8ad05a'});S('wind',u)}
  stCd(u,T[3]);anim(u,'st_lee'+c,c===5?.38:c===2?.3:.26)}),
 // Poings d'insectes : chaque coup pose un insecte (4 max, 4 s) qui ronge la cible ; le 5e coup les fait dévorer (5 dégâts et 3,5 soins par insecte)
 st_abu:SP('Poings d\'insectes','',.45,{hero:'quigon',melee:1,ai:{max:86,p:1}},(u,a)=>{const c=stC(u),T=[0,[80,1.8,11,.42],[80,1.8,11,.42],[82,2,12,.45],[82,2,12,.45],[86,2,13,.6]][c];
  stMelee(u,a,T[0],T[1],T[2],{},[0,{jfx:'st_line',off:6,z:36,c:'#4a5a3a'},{jfx:'st_line',off:-6,z:36,c:'#4a5a3a'},{d:-1,z:36,th:11,c:'#4a5a3a',c2:'#c8d8a8'},{d:1,tl:1.3,z:26,th:10,c:'#4a5a3a',c2:'#c8d8a8',rr:.6},{jfx:'st_line',n:2,z:34,c:'#4a5a3a',burst:1}][c],e=>c<5?stBugAdd(u,e):stBugEat(u,e));
  {const p=fwd(u,a,T[0]*.62);sparks(p.x,p.y,'#26302a',c===5?10:5,'bugs')}stCd(u,T[3]);anim(u,'st_abu'+c,.28)}),
 // ---------- styles de mêlée des clans (anciens styles à distance, remplacés en place : même indice, même clé) ----------
 // Kunai au poing : estoc, revers, taille, taille tout autour, fente qui fait saigner (2,5/s pendant 2 s, si la cible ne subit pas déjà un effet sur la durée)
 st_kunai:SP('Kunai au poing','',.3,{hero:'rey',melee:1,ai:{max:92,p:1}},(u,a)=>{const c=stC(u),T=[0,[84,1.6,9,.3],[86,1.9,9,.3],[86,1.8,10,.34],[86,6.3,9,.4],[104,.8,12,.56]][c],K0='#e4eaf2';
  if(c===5){stLunge(u,a,46);S('dash',u)}
  stMelee(u,a,T[0],T[1],T[2],{},[0,{jfx:'st_thrust',z:34,c:K0,w2:3.5},{d:1,tl:-.5,z:34,th:5,c:K0,blade:1},{d:-1,tl:.9,z:30,th:5,c:K0,blade:1},{d:-1,z:26,th:6,c:'#ffffff',blade:1,rr:.8},{jfx:'st_thrust',z:30,c:'#ffffff',w2:4.5}][c],e=>{
   jx({jfx:'st_glint',ti:stI(e),x:e.x,y:e.y,a,t:.3,m:.3});if(c===5&&!(e.dotT>0)){e.dot=2.5;e.dotT=2;e.dotSrc=u;e.dotEl=-1;jx({jfx:'st_bleed',ti:stI(e),x:e.x,y:e.y,t:2,m:2})}});
  if(c===4){S('saber',u);fxRing(u.x,u.y,{u,r0:30,r1:T[0],col:'#e4eaf2',c2:'#ffffff',w:3,t:.26})}stCd(u,T[3]);anim(u,'st_kun'+c,c===4?.36:.26)}),
 // Frappes d'ombre (Nara) : chaque coup ralentit 0,4 s ; 3e : pique d'ombre qui jaillit du sol en ligne (touche toute la ligne) ; 5e : mains d'ombre qui agrippent (ralenti 1 s)
 st_nara:SP('Frappes d\'ombre','',.38,{hero:'rey',melee:1,ai:{max:104,p:1}},(u,a)=>{const c=stC(u),T=[0,[80,1.7,10,.38],[80,1.7,10,.38],[118,.5,11,.46],[88,2.4,11,.44],[96,2,13,.62]][c],D='#141418';
  stMelee(u,a,T[0],T[1],T[2],{slow:c===5?1:.4},[0,{jfx:'st_line',off:-6,z:36,c:D},{jfx:'st_line',off:6,z:36,c:D},null,{d:-1,z:20,th:13,fl:'shadow',rr:.75},{d:1,tl:1.3,z:30,th:14,fl:'shadow',rr:.65}][c],e=>{
   if(c===5)jx({jfx:'st_grab',ti:stI(e),x:e.x,y:e.y,t:1,m:1})});
  if(c===3){jx({jfx:'st_sspike',ui:stI(u),x:u.x,y:u.y,a,R:T[0],t:.5,m:.5});const p=fwd(u,a,T[0]);later(u,.1,()=>fxSmoke(p.x,p.y,{u,col:'#101018',n:3,r:20,s:12,t:.6,al:.3,rise:20}))}if(c>=3)S('shadow',u);
  stCd(u,T[3]);anim(u,'st_nar'+c,c===3?.36:.28)}),
 // Paumes de l'essaim (Aburame) : 3e coup : l'essaim jaillit en gerbe (+1 insecte de la colonie) ; 5e : il engloutit la cible (+2 insectes, la révèle)
 st_bug:SP('Paumes de l\'essaim','',.4,{hero:'rey',melee:1,ai:{max:98,p:1}},(u,a)=>{const c=stC(u),T=[0,[80,1.8,10,.4],[80,1.8,10,.4],[98,1.4,10,.46],[84,2,11,.44],[100,1.6,13,.6]][c],G='#3a4a30';
  stMelee(u,a,T[0],T[1],T[2],c===5?{reveal:1}:{},[0,{jfx:'st_line',off:6,z:36,c:G},{jfx:'st_line',off:-6,z:36,c:G},null,{d:1,tl:1.3,z:28,th:11,fl:'bugs',c:G,c2:'#c8d8a8',rr:.65},null][c],e=>{
   if(c!==3&&c!==5)return;if(typeof ab_add==='function')ab_add(e,u,c===5?2:1);jx({jfx:'st_crawl',ti:stI(e),x:e.x,y:e.y,t:.9,m:.9})});
  if(c===3||c===5){jx({jfx:'st_gush',ui:stI(u),x:u.x,y:u.y,a,R:T[0],w:T[1],big:c===5?1:0,t:.55,m:.55});if(c===5){const p=fwd(u,a,T[0]*.8);fxSmoke(p.x,p.y,{u,col:'#1a2018',n:4,r:30,s:14,t:.7,al:.3,rise:14})}S('bugs',u)}
  {const p=fwd(u,a,T[0]*.6);sparks(p.x,p.y,'#26302a',c>=3?8:4,'bugs')}stCd(u,T[3]);anim(u,'st_swm'+c,c===5?.34:.28)}),
 // Chaînes au poing (Uzumaki) : 3e coup : la chaîne fouette droit devant (120) ; 4e : elle balaie large ; 5e : elle harponne, ramène la cible contre toi et pose 1 sceau (trait Fûinjutsu)
 st_chain:SP('Chaînes au poing','',.38,{hero:'rey',melee:1,ai:{max:116,p:1}},(u,a)=>{const c=stC(u),T=[0,[84,1.7,10,.38],[84,1.7,10,.38],[120,.8,11,.46],[110,2.4,11,.46],[122,.7,12,.62]][c],G='#e8c860',p0=fwd(u,a,u.r+30);
  stMelee(u,a,T[0],T[1],T[2],c===5?{pull:600,fx:p0.x,fy:p0.y}:{},c<3?[0,{jfx:'st_line',off:-6,z:36,c:G},{jfx:'st_line',off:6,z:36,c:G}][c]:null,e=>{
   if(c<3)jx({jfx:'st_wrap',ti:stI(e),x:e.x,y:e.y,t:.25,m:.25});
   if(c===5){if(typeof uzMark==='function'&&u.ch.clan===6)uzMark(u,e,1);jx({jfx:'st_wrap',ui:stI(u),ti:stI(e),x:e.x,y:e.y,t:.5,m:.5})}});
  if(c>=3){jx({jfx:'st_lash',ui:stI(u),x:u.x,y:u.y,a,R:T[0],w:c===4?T[1]:0,d:-1,kind:'chain',t:.3,m:.3});S('blaster',u)}
  stCd(u,T[3]);anim(u,'st_chn'+c,c===5?.36:.28)}),
 // Frappes fleuries (Yamanaka) : senbon tenus en main et paumes, très vifs ; 3 coups de suite sur une cible = point vital (5 dégâts, ralentit)
 st_sen:SP('Frappes fleuries','',.3,{hero:'rey',melee:1,ai:{max:88,p:1}},(u,a)=>{const c=stC(u),T=[0,[80,1.6,8,.3],[80,1.6,8,.3],[84,2,9,.34],[90,2.4,9,.38],[96,2,11,.54]][c],PK='#ff9ac8',PL='#ffe0ec';
  stMelee(u,a,T[0],T[1],T[2],{},[0,{jfx:'st_thrust',z:36,c:PL,w2:2.5},{jfx:'st_line',off:-6,z:36,c:PK},{d:-1,z:14,th:11,fl:'petal',c:PL,c2:PK},{d:1,tl:1.3,z:34,th:11,fl:'petal',c:PL,c2:PK,rr:.65},{d:-1,z:30,th:13,fl:'petal',c:PL,c2:'#ff6aa8',rr:.7}][c],e=>stVital(u,e));
  if(c===5){const p=fwd(u,a,52);jx({jfx:'st_bloom',x:p.x,y:p.y,a,t:.55,m:.55});fxBurst(p.x,p.y,'#ff9ac8',{u,z:32,n:8,sp:140,gr:20,up:40,w:3,sh:'petal',c2:'#ffe0ec'})}stCd(u,T[3]);anim(u,'st_flo'+c,c===3?.32:.26)}),
 // Poings de sable (Sabaku) : gantelets lourds ; chaque coup qui touche ajoute 2 à l'armure de sable (bouclier, 6 max, 2,5 s) ; 5e : un poing de sable s'abat sur un disque devant soi
 st_sand:SP('Poings de sable','',.5,{hero:'rey',melee:1,ai:{max:94,p:1}},(u,a)=>{const c=stC(u),T=[0,[86,2,13,.5],[86,2,13,.5],[92,2.6,14,.56],[84,1.6,14,.52],[62,56,17,.78]][c],SD='#d8b878';
  const arm=e=>{jx({jfx:'st_sandback',ui:stI(u),x:e.x,y:e.y,t:.45,m:.45});if(u.dead||(u.shield||0)>=6)return;shieldU(u,Math.min(6,(u.shield||0)+2),2.5)};
  if(c===5){const p=fwd(u,a,T[0]),L=enemies(u).filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<T[1]+e.r),H=L.map(e=>e.hp+(e.shield||0));stSlam(u,a,p.x,p.y,T[1],T[2],{});L.forEach((e,k)=>{if(e.hp+(e.shield||0)<H[k]-.01)arm(e)});
   jx({jfx:'st_sfist',x:p.x,y:p.y,a,r:T[1],t:.8,m:.8});S('heavy',u);later(u,.08,()=>{fxRing(p.x,p.y,{u,r0:10,r1:T[1],col:'#e8d0a0',w:6,t:.34});fxDecal(p.x,p.y,'sand',{u,r:T[1]*.85,t:3});fxSmoke(p.x,p.y,{u,col:'#d8b878',n:4,r:T[1]*.7,s:14,t:.8,al:.24,rise:14})})}
  else stMelee(u,a,T[0],T[1],T[2],{},[0,{jfx:'st_line',off:-6,z:36,c:SD,burst:1},{jfx:'st_line',off:6,z:36,c:SD,burst:1},{d:1,z:26,th:16,fl:'sand',c:SD,c2:'#8a6a38'},{d:1,tl:1.45,z:30,th:14,fl:'sand',c:SD,c2:'#8a6a38',rr:.6}][c],arm);
  S('sand',u);stCd(u,T[3]);anim(u,'st_snd'+c,c===5?.42:.3)}),
 // Marionnette (Kankurô, clan Sabaku) : Karasu, à ton côté, fond au contact (allonge 125) ; 3e et 5e coups : poison (2,5/s pendant 2 s, si la cible n'a pas déjà un effet sur la durée) ; 5e : ralentit
 st_pup:SP('Marionnette','',.44,{hero:'rey',melee:1,ai:{max:124,p:1}},(u,a)=>{const c=stC(u),T=[0,[110,1.1,10,.44],[110,1.1,10,.44],[116,1.6,11,.48],[104,2.6,11,.48],[124,.9,13,.64]][c],PO='#c080ff',ps=c===3||c===5;
  if(c===5)stLunge(u,a,24);
  stMelee(u,a,T[0],T[1],T[2],c===5?{slow:.5}:{},[0,{d:-1,tl:.5,z:28,th:6,c:'#e8ecf2',blade:1,rr:.85},{d:1,tl:-.5,z:28,th:6,c:'#e8ecf2',blade:1,rr:.85},{jfx:'st_thrust',z:26,c:'#e0c8ff'},{d:-1,z:22,th:8,c:'#e8ecf2',c2:PO,blade:1,rr:.85},{jfx:'st_thrust',z:28,c:'#e0c8ff',w2:6}][c],e=>{
   if(!ps||e.dead)return;if(!(e.dotT>0)){e.dot=2.5;e.dotT=2;e.dotSrc=u;e.dotEl=-1}jx({jfx:'st_poison',ti:stI(e),x:e.x,y:e.y,t:2,m:2})});
  {const p=fwd(u,a,T[0]*.78);jx({jfx:'st_puppet',ui:stI(u),x:p.x,y:p.y,t:.34,m:.34});if(ps)jx({jfx:'st_cut',x:p.x,y:p.y,a,t:.3,m:.3})}
  S('blaster',u);u.st_sh=u.st_sh?0:1;stCd(u,T[3]);anim(u,u.st_sh?'st_pupr':'st_pupl',.3)}),
});
// le compteur d'insectes est visible chez tous les joueurs
AFTER.push(()=>UK.push('st_bugN'));

// ---------- logique des objets propres aux styles (hôte) ----------
// insectes posés : suivent la cible, la rongent (0,5 par insecte toutes les 0,5 s), expirent après 4 s
AUXF.st_bugs=x=>{const e=units[x.ti];if(!e||e.dead){x.t=0;if(e)e.st_bugN=0;return}x.x=e.x;x.y=e.y;e.st_bugN=x.t>0?x.n:0;if(x.k<=0&&x.n>0&&x.t>0&&!x.owner.dead){x.k=.5;VFX='bugs';hit(e,x.owner,.5*x.n,{silent:1});VFX=null}};

// ---------- visuels ----------
// traînée d'un coup : croissant dans le plan du geste (tl = inclinaison : 0 horizontal, ±π/2 vertical), qui suit le lanceur
// d sens du geste, z hauteur, th épaisseur, rr rayon (fraction de la portée), n traits parallèles (griffes ; sp écart), x2 croix, bone/blade/claw rendus, fl décor du clan (stFlav)
JFXD.st_arc=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,pr=Math.min(1,e/.26),R=f.R*(f.rr||.72),w=Math.min(f.w,6.28),N=Math.max(12,Math.ceil(w/.18)),th=f.th||9,ca=Math.cos(f.a),sa=Math.sin(f.a),z0=f.z||30;
 g.globalAlpha=e<.26?1:Math.max(0,k/.74);g.lineJoin='round';
 const one=(d,tl,dr)=>{const tc=Math.cos(tl),ts=Math.sin(tl),pt=(ph,r)=>{const c=Math.cos(ph)*r,s=Math.sin(ph)*r;return P(o.x+ca*c-sa*s*tc,o.y+sa*c+ca*s*tc,z0+s*ts)};
  for(let j=0;j<(f.n||1);j++){const rj=R+dr+(j-((f.n||1)-1)/2)*(f.claw?7:f.sp||0),A=[],B=[];for(let i=0;i<=N;i++){const q=i/N,ph=d*(-w/2+w*pr*q),tk=th*Math.pow(q,.8);A.push(pt(ph,rj));B.push(pt(ph,rj-tk))}
   g.fillStyle=f.fl==='shadow'?'rgba(10,10,16,.86)':f.claw?'rgba(255,255,255,.85)':rgba(f.c||'#ffffff',f.bone?.92:.62);g.beginPath();A.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=N;i>=0;i--)g.lineTo(B[i].x,B[i].y);g.closePath();g.fill();
   g.strokeStyle=f.fl==='shadow'?'#4a4a66':f.claw?'rgba(230,60,60,.85)':f.bone?'#8a8070':f.c2||'#ffffff';g.lineWidth=f.bone?1.3:1.6;g.beginPath();A.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
   if(f.bone)for(let i=3;i<=N;i+=3){g.beginPath();g.moveTo(A[i].x,A[i].y);g.lineTo(B[i].x,B[i].y);g.stroke()} // segments d'os
   if(f.blade){g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=1;g.beginPath();g.moveTo(A[N].x,A[N].y);g.lineTo(B[N].x,B[N].y);g.stroke()}
   stFlav(f,A,B,N)}};
 one(f.d||1,f.tl||0,0);if(f.x2)one(-(f.d||1),-(f.tl||0),-4)};
// direct / estoc du poing : traits de vitesse et petit souffle d'impact
JFXD.st_line=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,ca=Math.cos(f.a),sa=Math.sin(f.a),pr=Math.min(1,e/.14),L=f.R*.62,z=f.z||34,n=f.n||1;
 for(let i=0;i<n;i++){const s=(f.off||0)+(i-(n-1)/2)*8,x0=o.x+ca*8-sa*s,y0=o.y+sa*8+ca*s,a0=P(x0,y0,z),a1=P(x0+ca*L*pr,y0+sa*L*pr,z),dx=a1.x-a0.x,dy=a1.y-a0.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=5.5*a0.s;
  g.fillStyle=rgba(f.c||'#ffffff',.6*k);g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x+nx*w,a1.y+ny*w);g.lineTo(a1.x-nx*w,a1.y-ny*w);g.closePath();g.fill();
  g.strokeStyle=rgba('#ffffff',.95*k);g.lineWidth=1.6*a0.s;g.beginPath();g.moveTo(lerp(a0.x,a1.x,.35),lerp(a0.y,a1.y,.35));g.lineTo(a1.x,a1.y);g.stroke()}
 if(e<.45){const s0=f.off||0,q=P(o.x+ca*(L+12)-sa*s0,o.y+sa*(L+12)+ca*s0,z),r=(f.burst?17:11)*q.s*(.55+e*1.5),al=1-e/.45;g.fillStyle=rgba('#ffffff',.95*al);g.beginPath();
  for(let j=0;j<12;j++){const b=j*Math.PI/6+f.a,rr=j%2?r*.36:r;g.lineTo(q.x+Math.cos(b)*rr,q.y+Math.sin(b)*rr*.8)}g.closePath();g.fill();if(f.c){g.strokeStyle=rgba(f.c,al);g.lineWidth=1.5;g.stroke()}}};
// estoc (sabre, os) : pointe effilée qui jaillit
JFXD.st_thrust=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,ca=Math.cos(f.a),sa=Math.sin(f.a),L=f.R*Math.min(1,e/.16),z=f.z||30,b=P(o.x+ca*12,o.y+sa*12,z),tp=P(o.x+ca*L,o.y+sa*L,z),nx=b.y-tp.y,ny=tp.x-b.x,nl=Math.hypot(nx,ny)||1,w=(f.w2||5)*b.s;
 g.globalAlpha=Math.min(1,k*1.8);g.fillStyle=f.bone?'#f2efe6':rgba(f.c||'#e4eeff',.75);g.strokeStyle=f.bone?'#8a8070':'#ffffff';g.lineWidth=f.bone?1.4:1.2;
 g.beginPath();g.moveTo(b.x+nx/nl*w,b.y+ny/nl*w);g.lineTo(tp.x,tp.y);g.lineTo(b.x-nx/nl*w,b.y-ny/nl*w);g.closePath();g.fill();g.stroke();
 if(f.bone)for(let i=1;i<5;i++){const q=i/5,x=lerp(b.x,tp.x,q),y=lerp(b.y,tp.y,q),ww=w*(1-q)*1.3;g.beginPath();g.moveTo(x+nx/nl*ww,y+ny/nl*ww);g.lineTo(x-nx/nl*ww,y-ny/nl*ww);g.stroke()}
 else{g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;for(const s of[-1,1]){g.beginPath();g.moveTo(b.x+s*nx/nl*w*2.2,b.y+s*ny/nl*w*2.2);g.lineTo(lerp(b.x,tp.x,.7)+s*nx/nl*w*1.4,lerp(b.y,tp.y,.7)+s*ny/nl*w*1.4);g.stroke()}}};
// Kenjutsu : éclat de la pointe et entaille nette sur la cible
JFXD.st_glint=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,38),s=q.s,L=(8+22*Math.min(1,e*4))*s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',k);
 g.beginPath();g.moveTo(q.x-L,q.y);g.lineTo(q.x,q.y-2*s);g.lineTo(q.x+L,q.y);g.lineTo(q.x,q.y+2*s);g.closePath();g.fill();g.beginPath();g.moveTo(q.x,q.y-L*.6);g.lineTo(q.x+2*s,q.y);g.lineTo(q.x,q.y+L*.6);g.lineTo(q.x-2*s,q.y);g.closePath();g.fill();
 const b=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a))+1.2;g.strokeStyle=rgba('#cfe8ff',.95*k);g.lineWidth=2*s;g.beginPath();g.moveTo(q.x-Math.cos(b)*20*s,q.y-Math.sin(b)*20*s);g.lineTo(q.x+Math.cos(b)*20*s,q.y+Math.sin(b)*20*s);g.stroke()};
// Kenjutsu, 5e coup : le trait de la coupe apparaît après le geste (iai)
JFXD.st_iai=(f,k,e,t,u)=>{if(e<.25)return;const o=u&&!u.dead?u:f,ca=Math.cos(f.a),sa=Math.sin(f.a),c=f.R*.7,h=f.R*.75,p1=P(o.x+ca*c-sa*h,o.y+sa*c+ca*h,30),p2=P(o.x+ca*c+sa*h,o.y+sa*c-ca*h,30),q=Math.min(1,(e-.25)/.12);
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',Math.min(1,k*1.3));g.lineWidth=3*p1.s*k;g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(lerp(p1.x,p2.x,q),lerp(p1.y,p2.y,q));g.stroke();g.strokeStyle=rgba('#9fc8ff',.6*k);g.lineWidth=8*p1.s*k;g.stroke()};
// Taijutsu Uchiha : Sharingan au-dessus de la cible lue
JFXD.st_read=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,100),R=(7+4*Math.min(1,e*6))*q.s;g.globalAlpha=Math.min(1,k*2.5);
 circ(q.x,q.y,R*1.3,'rgba(30,0,4,.55)');circ(q.x,q.y,R,'#d01a2a');g.strokeStyle='#1a0003';g.lineWidth=1.3*q.s;g.beginPath();g.arc(q.x,q.y,R*.56,0,7);g.stroke();circ(q.x,q.y,R*.22,'#1a0003');
 for(let i=0;i<3;i++){const b=t*8+i*2.094,x=q.x+Math.cos(b)*R*.56,y=q.y+Math.sin(b)*R*.56;circ(x,y,R*.15,'#1a0003');g.lineWidth=R*.1;g.beginPath();g.arc(x,y,R*.2,b+.8,b+2.4);g.stroke()}};
// Taijutsu Uchiha : éclat rouge des yeux du lanceur quand le Sharingan lit la cible
JFXD.st_eyes=(f,k,e,t,u)=>{if(!u||u.dead)return;const ca=Math.cos(u.aim),sa=Math.sin(u.aim),q=P(u.x+ca*9,u.y+sa*9,50),s=q.s;g.globalCompositeOperation='lighter';for(const sg of[-1,1]){const x=q.x-sa*sg*4*s,y=q.y;circ(x,y,(3+5*k)*s,rgba('#ff2a2a',.55*k));circ(x,y,1.6*s,rgba('#ffffff',k))}g.strokeStyle=rgba('#ff4a4a',.8*k);g.lineWidth=1.5;g.beginPath();g.moveTo(q.x-14*s*e,q.y);g.lineTo(q.x+14*s*e,q.y);g.stroke()};
// Poing souple : onde de chakra de la paume (anneaux perpendiculaires au geste)
JFXD.st_palm=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,ca=Math.cos(f.a),sa=Math.sin(f.a),s0=f.off||0,q=P(o.x+ca*f.R-sa*s0,o.y+sa*f.R+ca*s0,34),S2=q.s*(f.big?1.7:1),rot=Math.atan2(sa*K,ca);g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const r=(5+e*24+i*6)*S2;g.strokeStyle=rgba(i?'#8ab0ff':'#ffffff',.85*k*(1-i*.25));g.lineWidth=(2.4-i*.6)*S2;g.beginPath();g.ellipse(q.x+Math.cos(rot)*i*4*S2,q.y+Math.sin(rot)*i*4*S2,r*.42,r,rot,0,7);g.stroke()}
 circ(q.x,q.y,(4+4*k)*S2,rgba('#cfe0ff',.75*k));if(f.big){g.strokeStyle=rgba('#cfe0ff',.5*k);g.lineWidth=1.5;for(let i=0;i<8;i++){const b=rot+(i-3.5)*.16;g.beginPath();g.moveTo(q.x+Math.cos(b)*10*S2,q.y+Math.sin(b)*10*S2);g.lineTo(q.x+Math.cos(b)*(24+e*50)*S2,q.y+Math.sin(b)*(24+e*50)*S2);g.stroke()}}};
// Poing souple : points de chakra (tenketsu) qui s'allument sur la cible ; au 5e coup ils sont reliés et scellés
JFXD.st_tenketsu=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,0),s=q.s,pts=[[0,54],[-7,44],[7,42],[0,33],[-6,23],[6,21]],n=f.seal?6:Math.min(6,f.n+1);g.globalCompositeOperation='lighter';
 if(f.seal){g.strokeStyle=rgba('#8ab0ff',.8*k);g.lineWidth=1.4*s;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(q.x+x*s,q.y-y*s):g.moveTo(q.x+x*s,q.y-y*s));g.closePath();g.stroke();g.strokeStyle=rgba('#cfe0ff',.7*k);g.beginPath();g.ellipse(q.x,q.y-38*s,22*s*(1+e*.3),28*s*(1+e*.3),0,0,7);g.stroke()}
 for(let i=0;i<n;i++){const x=q.x+pts[i][0]*s,y=q.y-pts[i][1]*s;circ(x,y,(2.6+1.6*k)*s,rgba('#9fc0ff',.9*k));circ(x,y,1.1*s,'#ffffff')}};
// Poing décuplé : un poing géant s'écrase au sol (fissures et poussière)
JFXD.st_slam=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,fall=Math.min(1,e/.08),r=f.r;
 if(e<.32){const h=(1-ezo(fall))*70,fq=P(f.x-Math.cos(f.a)*8,f.y-Math.sin(f.a)*8,h+r*.32),R=r*.36*fq.s;g.globalAlpha=Math.min(1,(.32-e)/.1);g.fillStyle='rgba(255,214,170,.9)';g.strokeStyle='#4a2a18';g.lineWidth=2.5;
  g.beginPath();g.ellipse(fq.x,fq.y,R*1.15,R*.85,0,0,7);g.fill();g.stroke();for(let i=0;i<4;i++){const x=fq.x-R*.75+i*R*.5;g.beginPath();g.arc(x,fq.y+R*.6,R*.28,0,7);g.fill();g.stroke()}
  g.beginPath();g.ellipse(fq.x+R*1.05,fq.y-R*.05,R*.32,R*.5,.4,0,7);g.fill();g.stroke();if(fall<1){g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(fq.x+i*R*.45,fq.y-R*1.1);g.lineTo(fq.x+i*R*.45,fq.y-R*(1.9+Math.abs(i)*.2));g.stroke()}}g.globalAlpha=1}
 if(fall>=1){const ee=Math.min(1,(e-.08)/.4);g.strokeStyle=rgba('#3a2614',.85*k);g.lineWidth=2.2*s;g.lineCap='round';
  for(let i=0;i<8;i++){const b=i*.785+.3,L=r*(.55+(i%3)*.18)*ee,m=P(f.x+Math.cos(b)*L*.55,f.y+Math.sin(b+.25)*L*.5,0),en=P(f.x+Math.cos(b+.15)*L,f.y+Math.sin(b+.15)*L*.9,0);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(m.x,m.y);g.lineTo(en.x,en.y);g.stroke()}
  g.strokeStyle=rgba('#ead8b8',.75*k);g.lineWidth=5*s*k;gEll(f.x,f.y,r*(.35+ee*.75));g.stroke();
  for(let i=0;i<7;i++){const b=i*.9,d=r*(.5+ee*.55),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d*.8,8+ee*14);circ(p.x,p.y,(5+ee*7)*p.s,rgba('#c8b090',.45*k))}}};
// Crocs et griffes : la mâchoire du chien se referme sur la cible
JFXD.st_bite=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x-Math.cos(f.a)*6,o.y-Math.sin(f.a)*6,30),s=q.s*1.15,cl=Math.min(1,e/.2),gap=(1-ezo(cl))*13*s;g.globalAlpha=Math.min(1,k*2.2);g.lineJoin='round';
 g.fillStyle='#f4f0e8';g.strokeStyle='#2a1a10';g.lineWidth=1.6;
 for(const sg of[-1,1]){g.beginPath();g.moveTo(q.x-15*s,q.y+sg*(gap+7*s));g.lineTo(q.x-15*s,q.y+sg*(gap+1*s));for(let i=0;i<5;i++){const x=q.x-15*s+i*6*s;g.lineTo(x+3*s,q.y+sg*(gap-5*s));g.lineTo(x+6*s,q.y+sg*(gap+1*s))}g.lineTo(q.x+17*s,q.y+sg*(gap+9*s));g.closePath();g.fill();g.stroke()}
 if(cl>=1){g.strokeStyle=rgba('#d02a2a',.9*k);g.lineWidth=1.8*s;for(let i=0;i<3;i++){g.beginPath();g.moveTo(q.x-7*s+i*7*s,q.y+12*s);g.lineTo(q.x-9*s+i*7*s,q.y+19*s);g.stroke()}}};
// Taijutsu du fauve, 5e coup : tourbillon de vent vert et feuilles (Konoha Senpû)
JFXD.st_whirl=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,q=P(o.x,o.y,10),R=(56+e*46)*q.s;g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){g.strokeStyle=rgba(i?'#8aff9a':'#ffffff',.7*k);g.lineWidth=(4-i)*q.s;g.beginPath();g.ellipse(q.x,q.y-i*12*q.s,R*(1-i*.15),R*K*(1-i*.15),0,e*14+i*2,e*14+i*2+4);g.stroke()}};
// Poings d'insectes : les insectes posés dévorent la cible puis reviennent vers le lanceur
JFXD.st_devour=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,n=6+f.n*4;for(let i=0;i<n;i++){const b=i*2.4+e*5,r=(8+e*34)*(.6+(i%3)*.2),back=u&&!u.dead&&e>.45?(e-.45)/.55:0,cx=lerp(o.x,u?u.x:o.x,back),cy=lerp(o.y,u?u.y:o.y,back),q=P(cx+Math.cos(b)*r*(1-back),cy+Math.sin(b)*r*.7*(1-back),26+Math.sin(i+e*9)*12);
  g.fillStyle=i%2?'#1c241c':'#4a5a3a';g.fillRect(q.x-1.6*q.s,q.y-1.6*q.s,3.2*q.s,3.2*q.s)}
 if(u&&!u.dead&&e>.6){const q=P(u.x,u.y,50+(e-.6)*40);g.fillStyle=rgba('#7fe07f',Math.min(1,k*1.5));g.fillRect(q.x-1.5,q.y-6,3,12);g.fillRect(q.x-6,q.y-1.5,12,3)}};
// insectes posés sur un ninja (Poings d'insectes) : ils grouillent sur son corps
STATD.push((u,p,S)=>{if(!(u.st_bugN>0)||u.dead)return;const t=performance.now()/1000,n=u.st_bugN*5;g.fillStyle='#141a14';for(let i=0;i<n;i++){const a=t*(1.5+i%3)+i*1.7,x=p.x+Math.cos(a)*(7+(i%4)*2.5)*S,y=p.y-(12+((i*13+t*16)%38))*S;g.fillRect(x-1.3*S,y-1.3*S,2.6*S,2.6*S)}});
// armure de sable : des grains tournent autour du ninja du sable tant que son bouclier tient
STATD.push((u,p,S)=>{if(u.dead||!(u.shield>0)||u.ch.look.weapon.k!=='sand')return;const t=performance.now()/1000;for(let i=0;i<16;i++){const a=t*2.2+i*.39,y=p.y-(16+(i%4)*11)*S+Math.sin(a)*6*S;if(Math.sin(a)>-.2)circ(p.x+Math.cos(a)*(20+(i%2)*4)*S,y,1.9*S,i%3?'#d8b878':'#a88a50')}});
// pétales (impact des senbon, point vital)
JFXD.st_petals=(f,k,e)=>{const n=f.n||2,big=f.big?1:0;for(let i=0;i<n;i++){const b=i*2.4+f.x*.07,r=(big?62:26)*ezo(e),q=P(f.x+Math.cos(b)*r,f.y+Math.sin(b)*r*.7,32+(big?34:14)*Math.sin(Math.PI*Math.min(1,e*1.3))-e*14);
  g.save();g.translate(q.x,q.y);g.rotate(b+e*7);g.globalAlpha=Math.min(1,k*1.6);g.fillStyle=i%3?'#ff9ac8':'#ffe0ec';g.beginPath();g.ellipse(0,0,(big?5:4)*q.s,2.2*q.s,0,0,7);g.fill();g.restore()}
 if(big&&e<.35){const q=P(f.x,f.y,34);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff9ac8',.9*(1-e/.35));g.lineWidth=3*q.s;g.beginPath();g.arc(q.x,q.y,(8+e*90)*q.s,0,7);g.stroke()}};
// grains de sable qui reviennent vers le lanceur (armure)
JFXD.st_sandback=(f,k,e,t,u)=>{if(!u||u.dead)return;for(let i=0;i<7;i++){const q2=Math.min(1,e*1.35-i*.05);if(q2<=0)continue;const q=P(lerp(f.x,u.x,q2)+Math.sin(i*2+e*7)*10,lerp(f.y,u.y,q2)+Math.cos(i*3)*8,28+Math.sin(Math.PI*q2)*34);circ(q.x,q.y,2.2*q.s,i%2?'#d8b878':'#a88a50')}};
// insectes qui grimpent sur la cible touchée
JFXD.st_crawl=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,0),s=q.s,n=Math.round(14*k)+2;g.fillStyle='#141a14';for(let i=0;i<n;i++){const a=t*3+i*1.3,y=q.y-(8+((i*11+t*30)%44))*s,x=q.x+Math.cos(a)*(6+(i%3)*3)*s;g.fillRect(x-1.3*s,y-1.3*s,2.6*s,2.6*s)}};
// ombre qui agrippe les jambes de la cible touchée
JFXD.st_grab=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,0),s=q.s;g.fillStyle=rgba('#08080c',.75*k);g.beginPath();g.ellipse(q.x,q.y,20*s,8*s,0,0,7);g.fill();g.strokeStyle=rgba('#0c0c10',.9*k);g.lineWidth=3.2*s;g.lineCap='round';
 for(let i=0;i<3;i++){const b=i*2.1+1,h=(12+10*Math.min(1,e*4))*s;g.beginPath();g.moveTo(q.x+Math.cos(b)*14*s,q.y+Math.sin(b)*5*s);g.quadraticCurveTo(q.x+Math.cos(b)*4*s,q.y-h*.6,q.x+Math.cos(b+1)*8*s,q.y-h);g.stroke()}};
// la chaîne s'enroule autour de la cible et se rétracte vers le lanceur
JFXD.st_wrap=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,30),s=q.s;g.globalAlpha=Math.min(1,k*2);g.strokeStyle='#e8c860';g.lineWidth=2*s;
 for(let i=0;i<3;i++){g.beginPath();g.ellipse(q.x,q.y-(i*10-8)*s,17*s,5.5*s,0,0,7);g.stroke()}if(u&&!u.dead&&e<.55){const h=P(u.x,u.y,32),m=1-e/.55;drawChainLine(h.x,h.y,lerp(h.x,q.x,m),lerp(h.y,q.y,m))}};

// marionnette Karasu : cape sombre, tête de bois à trois yeux, bras armés de lames (pose 1 = lames levées pour frapper)
function stPuppet(x,y,z,a,pose){const q=P(x,y,z),f=Math.cos(a)>=0?1:-1;g.save();g.translate(q.x,q.y);g.scale(q.s*f*1.3,q.s*1.3);g.lineJoin='round';g.strokeStyle='#140c08';g.lineWidth=1.6;
 g.fillStyle='#2a2630';g.beginPath();g.moveTo(-8,-3);g.lineTo(8,-3);g.lineTo(12,17);g.lineTo(0,13);g.lineTo(-12,17);g.closePath();g.fill();g.stroke();
 const up=pose?-9:0;g.strokeStyle='#3a3440';g.lineWidth=3;g.beginPath();g.moveTo(-7,0);g.lineTo(-13,7+up);g.moveTo(7,0);g.lineTo(14,6+up);g.stroke();
 g.strokeStyle='#e8ecf2';g.lineWidth=1.8;g.beginPath();g.moveTo(-13,7+up);g.lineTo(-19,13+up*2);g.moveTo(14,6+up);g.lineTo(21,12+up*2);g.stroke();
 g.fillStyle='#5a3a22';g.strokeStyle='#140c08';g.lineWidth=1.4;g.beginPath();g.moveTo(-8,-10);g.lineTo(-6,-19);g.lineTo(-2,-13);g.lineTo(1,-21);g.lineTo(4,-13);g.lineTo(8,-18);g.lineTo(8,-9);g.closePath();g.fill();g.stroke();
 g.fillStyle='#cdb592';g.beginPath();g.ellipse(1,-8,6.5,6,0,0,7);g.fill();g.stroke();g.fillStyle='#1a0808';g.fillRect(2,-10,2,2);g.fillRect(5,-9,2,2);g.fillRect(3.5,-13,1.6,1.6);
 g.strokeStyle='#8a2a2a';g.lineWidth=1;g.beginPath();g.moveTo(1,-5);g.lineTo(7,-4);g.stroke();g.restore()}
const stPupHome=u=>({x:u.x-Math.cos(u.aim)*20-Math.sin(u.aim)*24,y:u.y-Math.sin(u.aim)*20+Math.cos(u.aim)*24});
// fils de chakra entre les doigts du marionnettiste et la marionnette
function stStrings(u,q){const h=P(u.x+Math.cos(u.aim)*12,u.y+Math.sin(u.aim)*12,38);g.strokeStyle='rgba(170,225,255,.55)';g.lineWidth=1;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(h.x+i*2,h.y);g.lineTo(q.x+i*5*q.s,q.y-14*q.s);g.stroke()}}
// la marionnette qui frappe au contact (dessinée au-dessus des ninjas) : elle fond sur le point d'impact, frappe, puis revient à ton côté
JFXD.st_puppet=(f,k,e,t,u)=>{if(!u||u.dead)return;const H=stPupHome(u);let px,py,z,pose=0;
 if(e<.4){const q=ezo(e/.4);px=lerp(H.x,f.x,q);py=lerp(H.y,f.y,q);z=28+26*Math.sin(Math.PI*q)}
 else if(e<.62){px=f.x;py=f.y;z=22;pose=1}else{const q=ezio(Math.min(1,(e-.62)/.38));px=lerp(f.x,H.x,q);py=lerp(f.y,H.y,q);z=22+14*Math.sin(Math.PI*q)}
 const q=P(px,py,z);stStrings(u,q);stPuppet(px,py,z,ang(u,f),pose)};
// la marionnette au repos flotte derrière son maître (sauf pendant une frappe)
STATD.push((u,p,S)=>{if(u.dead||!u.ch.abil[0]||u.ch.abil[0].key!=='st_pup')return;const i=stI(u);if(fx.some(x=>x.jfx==='st_puppet'&&x.ui===i&&x.t>0))return;const H=stPupHome(u),z=30+Math.sin(performance.now()/300)*3,q=P(H.x,H.y,z);stStrings(u,q);stPuppet(H.x,H.y,z,u.aim,0)});
// coup croisé des lames de la marionnette
JFXD.st_cut=(f,k,e)=>{const q=P(f.x,f.y,24),s=q.s,L=(14+e*22)*s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',k);g.lineWidth=2.5*s*k+.5;g.lineCap='round';
 for(const sg of[-1,1]){g.beginPath();g.moveTo(q.x-L,q.y-sg*L*.6);g.lineTo(q.x+L,q.y+sg*L*.6);g.stroke()}g.strokeStyle=rgba('#c080ff',.7*k);g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y+10*s,(20+e*30)*s,(8+e*12)*s,0,0,7);g.stroke()};
// poison : bulles violettes qui montent de la cible
JFXD.st_poison=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s;for(let i=0;i<5;i++){const y=q.y-(14+((t*26+i*9)%40))*s,x=q.x+Math.sin(t*3+i*2)*9*s;g.fillStyle=rgba(i%2?'#a050d0':'#c080ff',.75*Math.min(1,k*3));g.beginPath();g.arc(x,y,(1.6+(i%3)*.6)*s,0,7);g.fill()}};

// décor de la traînée selon le clan (f.fl) : grains de sable, insectes, ombre, épines, glace, papier, pétales, maillons, or, soie
function stFlav(f,A,B,N){const fl=f.fl;if(!fl)return;const out=(i,m)=>{const dx=A[i].x-B[i].x,dy=A[i].y-B[i].y;return[A[i].x+dx*m,A[i].y+dy*m]};
 for(let i=2;i<=N;i+=2){const p=A[i],q=B[i],s=p.s||1,h=(i*37%17)/17;
  if(fl==='sand')circ(lerp(p.x,q.x,h)+(h-.5)*6*s,lerp(p.y,q.y,h)-h*4*s,(1.4+h*1.4)*s,h>.5?'#f0d8a0':'#8a6a38');
  else if(fl==='bugs'){const [x,y]=out(i,h*.9);g.fillStyle=h>.6?'#4a5a3a':'#10160f';g.fillRect(x-1.4*s,y-1.4*s,2.8*s,2.8*s)}
  else if(i%4)continue;
  else if(fl==='shadow'){const [x,y]=out(i,.9+h);g.strokeStyle='rgba(10,10,16,.8)';g.lineWidth=2.4*s;g.beginPath();g.moveTo(p.x,p.y);g.quadraticCurveTo(lerp(p.x,x,.5)+3*s,lerp(p.y,y,.5),x,y);g.stroke()}
  else if(fl==='vine'){const [x,y]=out(i,.7);g.fillStyle='#e8e0b0';g.beginPath();g.moveTo(p.x-1.6*s,p.y);g.lineTo(x,y);g.lineTo(p.x+1.6*s,p.y);g.closePath();g.fill()}
  else if(fl==='ice'){const [x,y]=out(i,1+h);g.fillStyle='rgba(232,248,255,.92)';g.strokeStyle='#7fc8f0';g.lineWidth=1;g.beginPath();g.moveTo(p.x-2*s,p.y);g.lineTo(x,y);g.lineTo(p.x+2*s,p.y);g.closePath();g.fill();g.stroke()}
  else if(fl==='paper'){g.save();g.translate(lerp(p.x,q.x,.4),lerp(p.y,q.y,.4));g.rotate(Math.atan2(p.y-q.y,p.x-q.x)+h);g.fillStyle='#f6f3ea';g.strokeStyle='#7a9ae0';g.lineWidth=1;g.fillRect(-4*s,-2.5*s,8*s,5*s);g.strokeRect(-4*s,-2.5*s,8*s,5*s);g.restore()}
  else if(fl==='petal'){const [x,y]=out(i,h*.6);g.save();g.translate(x,y);g.rotate(i+h*3);g.fillStyle=h>.5?'#ff9ac8':'#ffe0ec';g.beginPath();g.ellipse(0,0,3.8*s,1.9*s,0,0,7);g.fill();g.restore()}
  else if(fl==='chain'){g.strokeStyle='#e8c860';g.lineWidth=1.4*s;g.beginPath();g.ellipse(lerp(p.x,q.x,.5),lerp(p.y,q.y,.5),3*s,1.7*s,Math.atan2(A[i].y-A[i-1].y,A[i].x-A[i-1].x),0,7);g.stroke()}
  else if(fl==='gold'){g.save();g.globalCompositeOperation='lighter';circ(p.x,p.y,2.4*s,'rgba(255,236,160,.95)');g.restore()}
  else if(fl==='silk'){const [x,y]=out(i,1.2+h);g.strokeStyle='rgba(238,240,246,.8)';g.lineWidth=.9;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(x,y);g.stroke()}}}
// Kunai au poing, 5e coup : la cible saigne
JFXD.st_bleed=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s;for(let i=0;i<4;i++){const ph=(t*1.6+i*.25)%1,x=q.x+(i-1.5)*5*s,y=q.y-(34-ph*30)*s;g.fillStyle=rgba('#c0142a',.85*Math.min(1,k*3)*(1-ph*.6));g.beginPath();g.ellipse(x,y,1.5*s,2.4*s,0,0,7);g.fill()}};
// Frappes d'ombre, 3e coup : l'ombre file au sol en ligne puis jaillit en piques à son bout
JFXD.st_sspike=(f,k,e,t,u)=>{const ca=Math.cos(f.a),sa=Math.sin(f.a),run=Math.min(1,e/.14),L=f.R*run,N=10,A=[],Bq=[];
 for(let i=0;i<=N;i++){const q=i/N,d=12+(L-12)*q,w=(7-4*q)*(1+Math.sin(q*9-t*18)*.15),cx=f.x+ca*d,cy=f.y+sa*d;A.push(P(cx-sa*w,cy+ca*w,0));Bq.push(P(cx+sa*w,cy-ca*w,0))}
 g.globalAlpha=Math.min(1,k*2);g.fillStyle='rgba(8,8,12,.88)';g.beginPath();A.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=N;i>=0;i--)g.lineTo(Bq[i].x,Bq[i].y);g.closePath();g.fill();
 if(run>=1){const h=ezo(Math.min(1,(e-.14)/.12))*(e>.7?(1-e)/.3:1),tx=f.x+ca*f.R,ty=f.y+sa*f.R;
  for(const [o2,hh] of[[0,46],[-14,28],[14,30],[-26,16],[26,18]]){const bx=tx-ca*Math.abs(o2)*.6-sa*o2*.5,by=ty-sa*Math.abs(o2)*.6+ca*o2*.5,b0=P(bx,by,0),b1=P(bx,by,hh*h);
   g.fillStyle='#0a0a10';g.strokeStyle='#3a3a52';g.lineWidth=1.2;g.beginPath();g.moveTo(b0.x-5*b0.s,b0.y);g.lineTo(b1.x,b1.y);g.lineTo(b0.x+5*b0.s,b0.y);g.closePath();g.fill();g.stroke()}}};
// Paumes de l'essaim : l'essaim jaillit des paumes en gerbe (le 5e coup engloutit la cible)
JFXD.st_gush=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,n=f.big?48:30,R=f.R*1.05,w=f.w;g.globalAlpha=Math.min(1,k*2);
 if(f.big&&e<.6){const q=P(o.x+Math.cos(f.a)*R*.8,o.y+Math.sin(f.a)*R*.8,30);g.fillStyle=rgba('#1a2018',.45*(1-e/.6));g.beginPath();g.ellipse(q.x,q.y,26*q.s*(.5+e),16*q.s*(.5+e),0,0,7);g.fill()}
 for(let i=0;i<n;i++){const h=(i*.618)%1,b=f.a+(h-.5)*w,r=R*Math.min(1,e*2.4)*(.35+.65*((i*37%23)/23)),wob=Math.sin(t*14+i)*4,x=o.x+Math.cos(b)*r-Math.sin(b)*wob,y=o.y+Math.sin(b)*r+Math.cos(b)*wob,q=P(x,y,26+Math.sin(i*1.7+e*6)*12);
  g.fillStyle=i%3?'#10160f':'#4a5a3a';g.fillRect(q.x-1.5*q.s,q.y-1.5*q.s,3*q.s,3*q.s)}g.globalAlpha=1};
// fouet tenu en main (chaîne, liane, soie, ombre) : de la main jusqu'à la pointe, qui file droit (w=0) ou balaie l'arc
JFXD.st_lash=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,pr=Math.min(1,e/.16),w=f.w||0,ph=f.a+(f.d||1)*(-w/2+w*pr),L=f.R*(w?1:pr)*.95,h=P(o.x+Math.cos(f.a)*12,o.y+Math.sin(f.a)*12,34),tp=P(o.x+Math.cos(ph)*L,o.y+Math.sin(ph)*L,26);
 const mx=(h.x+tp.x)/2+Math.sin(t*20)*3,my=(h.y+tp.y)/2-6*h.s,bz=(q,a,b,c)=>(1-q)*(1-q)*a+2*q*(1-q)*b+q*q*c;g.globalAlpha=Math.min(1,k*2.4);
 if(f.kind==='chain'){g.strokeStyle='#e8c860';g.lineWidth=1.6;const n=Math.max(4,Math.hypot(tp.x-h.x,tp.y-h.y)/6|0),an=Math.atan2(tp.y-h.y,tp.x-h.x);for(let i=0;i<n;i++){const q=i/n;g.beginPath();g.ellipse(bz(q,h.x,mx,tp.x),bz(q,h.y,my,tp.y),3*h.s,1.7*h.s,an+(i%2?1.3:0),0,7);g.stroke()}
  g.save();g.translate(tp.x,tp.y);g.rotate(Math.atan2(tp.y-my,tp.x-mx));g.scale(h.s,h.s);g.fillStyle='#f4d878';g.strokeStyle='#8a6a20';g.lineWidth=1;g.beginPath();g.moveTo(-4,-5);g.lineTo(10,0);g.lineTo(-4,5);g.lineTo(-1,0);g.closePath();g.fill();g.stroke();g.restore()}
 else{const C={vine:['#3a6a2a','#7ad04a',5],silk:['rgba(238,240,246,.9)','#ffffff',1.6],shadow:['#08080c','#3a3a52',6]}[f.kind]||['#ffffff','#ffffff',2];g.lineCap='round';g.strokeStyle=C[0];g.lineWidth=C[2]*h.s;g.beginPath();g.moveTo(h.x,h.y);g.quadraticCurveTo(mx,my,tp.x,tp.y);g.stroke();g.strokeStyle=C[1];g.lineWidth=C[2]*.35*h.s;g.stroke();
  if(f.kind==='vine')for(let i=1;i<6;i++){const q=i/6,x=bz(q,h.x,mx,tp.x),y=bz(q,h.y,my,tp.y),b=i*2.1;g.fillStyle='#e8e0b0';g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(b)*6*h.s,y+Math.sin(b)*6*h.s);g.lineTo(x+Math.cos(b+.5)*2*h.s,y+Math.sin(b+.5)*2*h.s);g.closePath();g.fill()}}
 g.globalAlpha=1};
// Poings de sable, 5e coup : un poing de sable tombe et s'écrase (anneau de poussière, grains)
JFXD.st_sfist=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,fall=Math.min(1,e/.1),r=f.r;
 if(e<.36){const h=(1-ezo(fall))*80,fq=P(f.x,f.y,h+r*.3),R=r*.42*fq.s;g.globalAlpha=Math.min(1,(.36-e)/.1);g.fillStyle='#d8b878';g.strokeStyle='#6a4a22';g.lineWidth=2.2;
  g.beginPath();g.ellipse(fq.x,fq.y,R*1.15,R*.9,0,0,7);g.fill();g.stroke();for(let i=0;i<4;i++){g.beginPath();g.arc(fq.x-R*.75+i*R*.5,fq.y+R*.62,R*.28,0,7);g.fill();g.stroke()}
  for(let i=0;i<10;i++){const b=i*.63+t*3,d=R*(1.1+(i%3)*.15);circ(fq.x+Math.cos(b)*d,fq.y+Math.sin(b)*d*.7,1.6*fq.s,i%2?'#f0d8a0':'#a88a50')}g.globalAlpha=1}
 if(fall>=1){const ee=Math.min(1,(e-.1)/.45);g.strokeStyle=rgba('#e8d0a0',.8*k);g.lineWidth=5*s*k;gEll(f.x,f.y,r*(.3+ee*.8));g.stroke();
  for(let i=0;i<14;i++){const b=i*.45,d=r*(.4+ee*.7),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d*.85,6+ee*20*Math.sin(Math.PI*ee));circ(p.x,p.y,(3+ee*4)*p.s,rgba(i%2?'#d8b878':'#a88a50',.6*k))}}};
// Frappes fleuries, 5e coup : une fleur s'ouvre à l'impact
JFXD.st_bloom=(f,k,e,t)=>{const q=P(f.x,f.y,32),s=q.s,o=ezo(Math.min(1,e*2.2)),R=(6+22*o)*s;g.save();g.translate(q.x,q.y);g.globalAlpha=Math.min(1,k*1.8);
 for(let i=0;i<6;i++){g.save();g.rotate(i*1.047+e*1.2);g.fillStyle=i%2?'#ff9ac8':'#ffd0e4';g.strokeStyle='#c8467a';g.lineWidth=1;g.beginPath();g.ellipse(R*.55,0,R*.55,R*.26,0,0,7);g.fill();g.stroke();g.restore()}
 circ(0,0,R*.22,'#ffe08a');g.restore();if(e<.4){g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff9ac8',(1-e/.4)*.9);g.lineWidth=2.5*s;g.beginPath();g.arc(q.x,q.y,(10+e*90)*s,0,7);g.stroke();g.globalCompositeOperation='source-over'}};

// ---------- poses du squelette (ANIM.st_*) ----------
// repères : bras devant armX.x = -1.57, levé -3.1 ; armR.z < 0 / armL.z > 0 écarte ; puis y ramène le bras écarté vers l'avant (R : +, L : -)
// chest.y > 0 = épaule droite en avant ; thighX.x < 0 jambe devant ; shinX.x > 0 plie le genou ; P.root.z avance le corps, P.rootR.y le fait tourner
const stH=(e,a=.2,b=.55)=>e<a?ezo(e/a):e<b?1:1-ezio((e-b)/(1-b))*.85; // élan : vite à fond, tient, puis revient
function stGuard(P,s){pz(P,'arm'+s,-1,0,s==='L'?.12:-.12);pz(P,'fore'+s,-1.9)} // bras en garde, poing au menton
function stLegs(P,u,k,deep=1){if(u&&u.moving)return;P.root.y=Math.min(P.root.y,-2.6*deep*k);pz(P,'thighL',-.5*k,0,.1);pz(P,'shinL',.65*k);pz(P,'thighR',.32*k,0,-.1);pz(P,'shinR',.55*k)} // fente avant (sauf en courant)
function stPunch(P,u,s,k,hi=0){const L=s==='L';pz(P,'arm'+s,-.3-1.32*k+hi,0,(L?-.2:.2)*k);pz(P,'fore'+s,-1.7*(1-k)-.05);stGuard(P,L?'R':'L');pz(P,'chest',.12*k,(L?-.5:.5)*k);pz(P,'hips',0,(L?.14:-.14)*k);pz(P,'head',0,(L?.28:-.28)*k);P.root.z=6*k;stLegs(P,u,k)}
// bras qui balaie à l'horizontale (crochet, lame) : du côté (y0) vers l'avant/en travers (y1)
function stSweep(P,s,k,y0,y1,lift=0){const L=s==='L';pz(P,'arm'+s,-lift,(L?-1:1)*lerp(y0,y1,k),L?1.45:-1.45);pz(P,'fore'+s,-.25)}
Object.assign(ANIM,{
 // Taijutsu
 st_tai1:(P,e,u)=>stPunch(P,u,'L',stH(e,.16,.5)),
 st_tai2:(P,e,u)=>stPunch(P,u,'R',stH(e,.16,.5)),
 st_tai3:(P,e,u)=>{const k=stH(e,.24,.55),d=Math.min(1,e/.14);pz(P,'armR',-.3-2.6*k,0,.12);pz(P,'foreR',-1.3+1*k);stGuard(P,'L');pz(P,'chest',-.3*k+.3*(1-k)*d,.4*k);pz(P,'head',-.25*k);P.root.y=-5*(1-k)*d+3*k;stLegs(P,u,1-k);pz(P,'thighR',-.25*k)},
 st_tai4:(P,e)=>{const k=stH(e,.24,.55);pz(P,'thighR',-.55*k,1.05*k,-1.3*k);pz(P,'shinR',1*(1-k)+.08);P.rootR.y=.75*k;pz(P,'chest',-.28*k,-.3*k,.15*k);pz(P,'armL',-.5,0,1.1);pz(P,'foreL',-.6);pz(P,'armR',-.3,0,-.9);pz(P,'shinL',.35*k);P.root.y=-1*k},
 st_tai5:(P,e)=>{const k=stH(e,.18,.62),j=bump(Math.min(1,e/.72));P.root.y=16*j;P.root.z=12*k;pz(P,'thighR',-1.55*k);pz(P,'shinR',.12);pz(P,'thighL',-.7);pz(P,'shinL',1.75);pz(P,'chest',-.42*k);pz(P,'armL',.75,0,.75);pz(P,'armR',.75,0,-.75);P.rootR.x=-.2*k},
 // Taijutsu Uchiha : rien que des jambes
 st_uch1:(P,e,u)=>{const c=Math.min(1,e/.1),x=stH(e,.2,.5);pz(P,'thighR',-.95*c);pz(P,'shinR',1.5*(1-x)+.05);pz(P,'footR',.4*x);pz(P,'chest',-.15*x);stGuard(P,'L');stGuard(P,'R');pz(P,'shinL',.3);P.root.z=4*x},
 st_uch2:(P,e)=>{const k=stH(e,.3,.62),sp=ezo(Math.min(1,e/.42))*(e<.62?1:1-ezio((e-.62)/.38));P.rootR.y=-2.6*sp;pz(P,'thighL',-1.35*k,0,.2*k);pz(P,'shinL',.15);pz(P,'chest',-.3*k);pz(P,'armL',-.4,0,.9);pz(P,'armR',-.4,0,-.9);pz(P,'shinR',.3)},
 st_uch3:(P,e)=>{const k=stH(e,.22,.55);P.rootR.y=.25*k;pz(P,'thighR',-2.5*k,0,-.5*k);pz(P,'shinR',.7*(1-k)+.05);pz(P,'chest',-.6*k);pz(P,'head',.25*k);pz(P,'armL',-.2,0,1.1);pz(P,'armR',.3,0,-.9);pz(P,'shinL',.25);P.root.y=-1},
 st_uch4:(P,e)=>{const s=e<.5?'L':'R',o=s==='L'?'R':'L',k=stH(e<.5?e*2:(e-.5)*2,.25,.6);pz(P,'thigh'+s,-1.5*k);pz(P,'shin'+s,1.3*(1-k)+.05);pz(P,'thigh'+o,.15);pz(P,'shin'+o,.4);pz(P,'chest',-.3*k);stGuard(P,'L');stGuard(P,'R');P.root.y=5*bump(e)},
 st_uch5:(P,e)=>{const up=e<.38,k=up?ezo(e/.38):1-ezo(Math.min(1,(e-.38)/.22));pz(P,'thighR',-2.75*k-.15,0,-.1);pz(P,'shinR',.1);pz(P,'chest',up?-.45*k:.4);pz(P,'armL',-.5,0,.95);pz(P,'armR',-.5,0,-.95);P.root.y=up?6*k:-3;pz(P,'shinL',up?.2:.65)},
 // Kenjutsu (sabre dans la main droite, dans le prolongement du bras)
 st_ken1:(P,e,u)=>{const k=stH(e,.22,.55);pz(P,'armR',lerp(-2.7,-.55,k),0,lerp(-.6,.55,k));pz(P,'foreR',-.15);pz(P,'handR',1.25);pz(P,'armL',-.5,0,.45);pz(P,'foreL',-1.1);pz(P,'chest',.2*k,lerp(-.35,.55,k));P.root.z=6*k;stLegs(P,u,k)},
 st_ken2:(P,e,u)=>{const k=stH(e,.22,.55);pz(P,'armR',lerp(-.45,-2.5,k),0,lerp(.65,-.65,k));pz(P,'foreR',-.15);pz(P,'handR',1.25);pz(P,'armL',-.5,0,.45);pz(P,'foreL',-1.1);pz(P,'chest',.1,lerp(.5,-.4,k));P.root.z=4*k;stLegs(P,u,k)},
 st_ken3:(P,e,u)=>{const k=stH(e,.22,.55);stSweep(P,'R',k,-.4,2.1,.15);pz(P,'handR',1.45);pz(P,'armL',-.5,0,.5);pz(P,'foreL',-1.1);pz(P,'chest',.1,lerp(-.45,.6,k));stLegs(P,u,k)},
 st_ken4:(P,e,u)=>{const k=stH(e,.16,.6);pz(P,'armR',-1.57*k-.1,0,.05);pz(P,'foreR',-.05);pz(P,'handR',1.5*k);pz(P,'armL',.55*k,0,.5);pz(P,'chest',.4*k,.3*k);P.root.z=15*k;if(!(u&&u.moving)){P.root.y=-5*k;pz(P,'thighR',-1.1*k);pz(P,'shinR',1*k);pz(P,'thighL',.7*k);pz(P,'shinL',.4*k)}},
 st_ken5:(P,e,u)=>{const k=stH(e,.26,.58);P.rootR.y=lerp(.7,-.9,ezo(Math.min(1,e/.4)))*(e<.58?1:1-ezio((e-.58)/.42));stSweep(P,'R',k,-.8,2.3,.1);pz(P,'handR',1.45);pz(P,'armL',-.2,0,.6);pz(P,'chest',.25*k);P.root.z=8*k;stLegs(P,u,1,1.4)},
 // Poing souple : posture basse, paumes ouvertes
 st_juk1:(P,e,u)=>{stPunch(P,u,'R',stH(e,.16,.5),-.15);pz(P,'handR',-.9);stLegs(P,u,1,1.5)},
 st_juk2:(P,e,u)=>{stPunch(P,u,'L',stH(e,.16,.5),-.15);pz(P,'handL',-.9);stLegs(P,u,1,1.5)},
 st_juk3:(P,e,u)=>{const k=stH(e,.16,.5);pz(P,'armR',-1.9*k-.2,0,.15*k);pz(P,'foreR',-.05);pz(P,'armL',.45,0,.35);pz(P,'foreL',-.4);pz(P,'chest',.15*k,.6*k);pz(P,'head',0,-.3*k);P.root.z=7*k;stLegs(P,u,1,1.5)},
 st_juk4:(P,e)=>{const k=stH(e,.3,.6);P.rootR.y=-Math.PI*ezo(Math.min(1,e/.5))*(e<.6?1:1-ezio((e-.6)/.4));pz(P,'armL',-1.5,0,.75);pz(P,'armR',-1.5,0,-.75);pz(P,'foreL',-.1);pz(P,'foreR',-.1);P.root.y=-3*k},
 st_juk5:(P,e,u)=>{const k=stH(e,.18,.6);pz(P,'armL',-1.55*k-.1,0,-.2*k);pz(P,'armR',-1.55*k-.1,0,.2*k);pz(P,'foreL',-.05);pz(P,'foreR',-.05);pz(P,'handL',-.9);pz(P,'handR',-.9);pz(P,'chest',.38*k);P.root.z=11*k;if(!(u&&u.moving)){P.root.y=-6*k;pz(P,'thighR',-1*k);pz(P,'shinR',1*k);pz(P,'thighL',.55*k);pz(P,'shinL',.6*k)}},
 // Poing décuplé : crochets amples, marteau, charge, écrasement
 st_aki1:(P,e,u)=>{const k=stH(e,.26,.55);stSweep(P,'R',k,-.3,1.7,.25);pz(P,'foreR',-.6);stGuard(P,'L');pz(P,'chest',.15,lerp(-.4,.75,k));P.root.z=5*k;stLegs(P,u,k)},
 st_aki2:(P,e,u)=>{const k=stH(e,.26,.55);stSweep(P,'L',k,-.3,1.7,.25);pz(P,'foreL',-.6);stGuard(P,'R');pz(P,'chest',.15,lerp(.4,-.75,k));P.root.z=5*k;stLegs(P,u,k)},
 st_aki3:(P,e)=>{const up=e<.32,k=up?ezo(e/.32):ezo(Math.min(1,(e-.32)/.16)),a=up?-3.05*k:-3.05+2.7*k;pz(P,'armL',a,0,-.25);pz(P,'armR',a,0,.25);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'chest',up?-.35*k:.65*k);P.root.y=up?3*k:-6*k;pz(P,'thighL',up?0:-.6*k);pz(P,'shinL',up?0:1*k);pz(P,'thighR',up?0:-.35*k);pz(P,'shinR',up?0:.9*k)},
 st_aki4:(P,e,u)=>{const k=stH(e,.2,.6);pz(P,'chest',.6*k,-.4*k);pz(P,'armL',.6*k,0,.5);pz(P,'armR',.6*k,0,-.5);pz(P,'head',-.3*k);P.root.z=13*k;stLegs(P,u,k,1.6)},
 st_aki5:(P,e)=>{const up=e<.36,k=up?ezo(e/.36):ezo(Math.min(1,(e-.36)/.14)),a=up?-3.1*k:-3.1+2.85*k;pz(P,'armL',a,0,-.3);pz(P,'armR',a,0,.3);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'chest',up?-.4*k:.8*k);P.root.y=up?9*k:-8*k;pz(P,'thighL',up?-.3*k:-.9*k);pz(P,'shinL',up?.6*k:1.3*k);pz(P,'thighR',up?-.3*k:.4*k);pz(P,'shinR',up?.6*k:1.1*k)},
 // Danse des os : bras tendus, lames d'os dans le prolongement
 st_bone1:(P,e,u)=>{const k=stH(e,.24,.55);stSweep(P,'R',k,-.3,1.9,.15);pz(P,'armL',-.4,0,.7);pz(P,'chest',.1,lerp(-.5,.7,k));stLegs(P,u,k)},
 st_bone2:(P,e,u)=>{const k=stH(e,.24,.55);stSweep(P,'L',k,-.3,1.7,.15);pz(P,'armR',-.4,0,-.7);pz(P,'chest',.1,lerp(.5,-.7,k));stLegs(P,u,k)},
 st_bone3:(P,e)=>{P.rootR.y=-Math.PI*2*ezio(Math.min(1,e/.85));pz(P,'armL',-1.45,0,1.45);pz(P,'armR',-1.45,0,-1.45);pz(P,'foreL',-.05);pz(P,'foreR',-.05);P.root.y=-2;pz(P,'thighL',-.3,0,.2);pz(P,'thighR',-.1,0,-.2);pz(P,'shinL',.4)},
 st_bone4:(P,e,u)=>{const k=stH(e,.24,.55);pz(P,'armL',lerp(-2.6,-.75,k),0,lerp(.7,-.55,k));pz(P,'armR',lerp(-2.6,-.75,k),0,lerp(-.7,.55,k));pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'chest',lerp(-.3,.35,k));stLegs(P,u,k)},
 st_bone5:(P,e,u)=>{const k=stH(e,.18,.62);P.rootR.y=0;pz(P,'armR',-1.57*k,0,.05);pz(P,'foreR',0);pz(P,'armL',.6*k,0,.45);pz(P,'chest',.45*k,.45*k);P.root.z=16*k;if(!(u&&u.moving)){P.root.y=-5*k;pz(P,'thighR',-1.15*k);pz(P,'shinR',1*k);pz(P,'thighL',.75*k);pz(P,'shinL',.4*k)}},
 // Crocs et griffes : posture de bête, griffes en avant
 st_inu1:(P,e,u)=>{const k=stH(e,.2,.5);pz(P,'armR',lerp(-2.7,-.45,k),0,lerp(-.95,.7,k));pz(P,'foreR',-.3);stGuard(P,'L');pz(P,'chest',.45,lerp(-.45,.6,k));P.root.z=6*k;stLegs(P,u,1,1.6)},
 st_inu2:(P,e,u)=>{const k=stH(e,.2,.5);pz(P,'armL',lerp(-2.7,-.45,k),0,lerp(.95,-.7,k));pz(P,'foreL',-.3);stGuard(P,'R');pz(P,'chest',.45,lerp(.45,-.6,k));P.root.z=6*k;stLegs(P,u,1,1.6)},
 st_inu3:(P,e,u)=>{const k=stH(e,.22,.55);pz(P,'armL',lerp(-2.7,-.6,k),0,.3);pz(P,'armR',lerp(-2.7,-.6,k),0,-.3);pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'chest',lerp(-.2,.6,k));stLegs(P,u,1,1.6)},
 st_inu4:(P,e)=>{const k=stH(e,.18,.6);P.root.y=-7*k;P.root.z=14*k;pz(P,'chest',.75*k);pz(P,'armR',-1.6*k,0,.1);pz(P,'foreR',-.2);pz(P,'armL',-.3,0,.6);pz(P,'thighL',-.9*k);pz(P,'shinL',1.3*k);pz(P,'thighR',.6*k);pz(P,'shinR',.9*k);pz(P,'head',-.4*k)},
 st_inu5:(P,e)=>{const k=stH(e,.2,.65),j=bump(Math.min(1,e/.75));P.root.y=15*j;P.root.z=10*k;pz(P,'chest',.55*k);pz(P,'armL',-1.95*k,0,.35);pz(P,'armR',-1.95*k,0,-.35);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'thighL',-1.1);pz(P,'shinL',1.7);pz(P,'thighR',-.6);pz(P,'shinR',1.5)},
 // Taijutsu du fauve
 st_lee1:(P,e,u)=>stPunch(P,u,'R',stH(e,.12,.45)),
 st_lee2:(P,e)=>{const k=stH(e,.2,.6);P.root.y=-9*k;pz(P,'chest',.55*k);pz(P,'thighL',-1.2*k);pz(P,'shinL',2*k);pz(P,'thighR',-.3*k,lerp(-.4,1.3,k),-1.3*k);pz(P,'shinR',.05);P.rootR.y=.6*k;pz(P,'armL',-.9,0,.5);pz(P,'armR',-.9,0,-.4);pz(P,'foreL',-.3)},
 st_lee3:(P,e)=>{const k=stH(e,.26,.6),sp=ezo(Math.min(1,e/.4))*(e<.6?1:1-ezio((e-.6)/.4));P.rootR.y=-2.2*sp;stSweep(P,'L',k,-.6,1.2,.2);pz(P,'foreL',-.15);stGuard(P,'R');pz(P,'chest',.1)},
 st_lee4:(P,e)=>{const k=stH(e,.2,.55);pz(P,'thighR',-2.75*k);pz(P,'shinR',.1);pz(P,'chest',-.55*k);pz(P,'head',.25*k);pz(P,'armL',.4,0,.8);pz(P,'armR',.4,0,-.8);P.root.y=5*k;pz(P,'shinL',.15)},
 st_lee5:(P,e)=>{const s=ezio(Math.min(1,e/.8));P.rootR.y=Math.PI*2*s;P.root.y=6*bump(e);pz(P,'thighR',-.5,1.2,-1.35);pz(P,'shinR',.05);pz(P,'thighL',-.2);pz(P,'shinL',.5);pz(P,'armL',-.8,0,1.1);pz(P,'armR',-.6,0,-.9);pz(P,'chest',-.25)},
 // Poings d'insectes : gestes raides et précis
 st_abu1:(P,e,u)=>{const k=stH(e,.18,.5);pz(P,'armR',-.3-1.3*k,0,.15*k);pz(P,'foreR',-1.6*(1-k));stGuard(P,'L');pz(P,'chest',.08,.25*k);P.root.z=4*k;stLegs(P,u,k,.7)},
 st_abu2:(P,e,u)=>{const k=stH(e,.18,.5);pz(P,'armL',-.3-1.3*k,0,-.15*k);pz(P,'foreL',-1.6*(1-k));stGuard(P,'R');pz(P,'chest',.08,-.25*k);P.root.z=4*k;stLegs(P,u,k,.7)},
 st_abu3:(P,e,u)=>{const k=stH(e,.22,.55);stSweep(P,'R',k,-.2,1.5,.2);pz(P,'foreR',-.7);stGuard(P,'L');pz(P,'chest',.1,lerp(-.3,.6,k));stLegs(P,u,k,.7)},
 st_abu4:(P,e)=>{const k=stH(e,.2,.55);pz(P,'thighR',-1.5*k);pz(P,'shinR',1.7*k);pz(P,'armL',-1.2*k,0,-.3);pz(P,'armR',-1.2*k,0,.3);pz(P,'foreL',-.6);pz(P,'foreR',-.6);pz(P,'chest',.3*k);P.root.y=2*k},
 st_abu5:(P,e,u)=>{const k=stH(e,.2,.6);pz(P,'armL',-1.45*k-.1,0,-.3*k);pz(P,'armR',-1.45*k-.1,0,.3*k);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'handL',-.8);pz(P,'handR',-.8);pz(P,'chest',.25*k);P.root.z=7*k;stLegs(P,u,k)},
 // gestes de lancer (repris par des jutsu) et de commande de la marionnette
 st_kthr:(P,e)=>{const k=e<.25?e/.25:1,f=e<.25?0:Math.min(1,(e-.25)/.2);pz(P,'armR',lerp(-2.8,-1.15,f)*Math.min(1,k*1.5),0,-.2);pz(P,'foreR',lerp(-1.5,-.1,f));pz(P,'chest',.1,lerp(-.3,.45,f));pz(P,'armL',-.6,0,.3);pz(P,'foreL',-1.2)},
 st_kthl:(P,e)=>{const k=e<.25?e/.25:1,f=e<.25?0:Math.min(1,(e-.25)/.2);pz(P,'armL',lerp(-2.8,-1.15,f)*Math.min(1,k*1.5),0,.2);pz(P,'foreL',lerp(-1.5,-.1,f));pz(P,'chest',.1,lerp(.3,-.45,f));pz(P,'armR',-.6,0,-.3);pz(P,'foreR',-1.2)},
 st_flickr:(P,e)=>{const k=stH(e,.2,.45);pz(P,'armR',-1-.55*k,0,.1);pz(P,'foreR',-1.3*(1-k)-.1);pz(P,'handR',-.6*k);pz(P,'armL',-.4,0,.35);pz(P,'chest',.08,.25*k)},
 st_flickl:(P,e)=>{const k=stH(e,.2,.45);pz(P,'armL',-1-.55*k,0,-.1);pz(P,'foreL',-1.3*(1-k)-.1);pz(P,'handL',-.6*k);pz(P,'armR',-.4,0,-.35);pz(P,'chest',.08,-.25*k)},
 st_pupr:(P,e)=>{const k=stH(e,.2,.55);pz(P,'armR',-1.95*k-.2,0,-.25*k);pz(P,'foreR',-.6*(1-k)-.2);pz(P,'handR',-.7*k);pz(P,'armL',-1.3*k,0,.45);pz(P,'foreL',-.9);pz(P,'chest',-.08,.2*k);pz(P,'head',-.1)},
 st_pupl:(P,e)=>{const k=stH(e,.2,.55);pz(P,'armL',-1.95*k-.2,0,.25*k);pz(P,'foreL',-.6*(1-k)-.2);pz(P,'handL',-.7*k);pz(P,'armR',-1.3*k,0,-.45);pz(P,'foreR',-.9);pz(P,'chest',-.08,-.2*k);pz(P,'head',-.1)},
});
// générateurs de poses pour les styles des clans (s = bras qui frappe 'R'/'L')
const stSg=s=>s==='R'?1:-1,stOp=s=>s==='R'?'L':'R';
const stAJ=(s,hi=0,hand=0,deep=1)=>(P,e,u)=>{stPunch(P,u,s,stH(e,.16,.5),hi);if(hand)pz(P,'hand'+s,hand);if(deep!==1)stLegs(P,u,1,deep)}; // direct / estoc / paume
const stAS=(s,y0,y1,lift=.15,hand=0,deep=1)=>(P,e,u)=>{const k=stH(e,.22,.55);stSweep(P,s,k,y0,y1,lift);if(hand)pz(P,'hand'+s,hand);stGuard(P,stOp(s));pz(P,'chest',.12,stSg(s)*lerp(-.5,.7,k));stLegs(P,u,k,deep)}; // taille / revers
const stASpin=(dir=-1,ax=1.45,turns=1)=>(P,e)=>{P.rootR.y=dir*Math.PI*2*turns*ezio(Math.min(1,e/.85));pz(P,'armL',-ax,0,1.45);pz(P,'armR',-ax,0,-1.45);pz(P,'foreL',-.05);pz(P,'foreR',-.05);P.root.y=-2;pz(P,'thighL',-.3,0,.2);pz(P,'thighR',-.1,0,-.2);pz(P,'shinL',.4)}; // tour complet, bras tendus
const stALunge=(s='R',hand=0,low=1)=>(P,e,u)=>{const k=stH(e,.16,.6),o=stOp(s),sg=stSg(s);pz(P,'arm'+s,-1.57*k-.1,0,.05*sg);pz(P,'fore'+s,-.05);if(hand)pz(P,'hand'+s,hand*k);pz(P,'arm'+o,.55*k,0,.5*sg);pz(P,'chest',.4*k,.3*k*sg);P.root.z=15*k;
 if(!(u&&u.moving)){P.root.y=-5*k*low;pz(P,'thigh'+s,-1.1*k);pz(P,'shin'+s,1*k);pz(P,'thigh'+o,.7*k);pz(P,'shin'+o,.4*k)}}; // fente
const stATwo=(hand=-.8,lean=.25,spread=.3)=>(P,e,u)=>{const k=stH(e,.2,.6);pz(P,'armL',-1.45*k-.1,0,-spread*k);pz(P,'armR',-1.45*k-.1,0,spread*k);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'handL',hand);pz(P,'handR',hand);pz(P,'chest',lean*k);P.root.z=8*k;stLegs(P,u,k)}; // deux mains devant
const stAOver=(both=1)=>(P,e)=>{const up=e<.32,k=up?ezo(e/.32):ezo(Math.min(1,(e-.32)/.16)),a=up?-3.05*k:-3.05+2.7*k;pz(P,'armR',a,0,.25);pz(P,'foreR',-.2);if(both){pz(P,'armL',a,0,-.25);pz(P,'foreL',-.2)}else stGuard(P,'L');
 pz(P,'chest',up?-.35*k:.65*k);P.root.y=up?3*k:-6*k;pz(P,'thighL',up?0:-.6*k);pz(P,'shinL',up?0:1*k);pz(P,'thighR',up?0:-.35*k);pz(P,'shinR',up?0:.9*k)}; // abattu d'en haut
const stAUp=(s='R')=>(P,e,u)=>{const k=stH(e,.24,.55),d=Math.min(1,e/.14),sg=stSg(s);pz(P,'arm'+s,-.3-2.6*k,0,.12*sg);pz(P,'fore'+s,-1.3+1*k);stGuard(P,stOp(s));pz(P,'chest',-.3*k+.3*(1-k)*d,.4*k*sg);pz(P,'head',-.25*k);P.root.y=-5*(1-k)*d+3*k;stLegs(P,u,1-k)}; // uppercut
const stAKick=(s='R',hi=2.4)=>(P,e)=>{const k=stH(e,.22,.55),sg=stSg(s);P.rootR.y=.25*k*sg;pz(P,'thigh'+s,-hi*k,0,-.5*k*sg);pz(P,'shin'+s,.7*(1-k)+.05);pz(P,'chest',-.55*k);pz(P,'head',.25*k);pz(P,'armL',-.2,0,1.1);pz(P,'armR',.3,0,-.9);pz(P,'shin'+stOp(s),.25);P.root.y=-1}; // coup de pied haut
const stACrouch=(s='R')=>(P,e)=>{const k=stH(e,.2,.6),sg=stSg(s);pz(P,'arm'+s,-.75*k-.1,0,.15*sg);pz(P,'fore'+s,-.1);pz(P,'hand'+s,-1*k);stGuard(P,stOp(s));pz(P,'chest',.7*k,.25*sg*k);pz(P,'head',-.3*k);P.root.y=-9*k;pz(P,'thighL',-1.1*k,0,.15);pz(P,'shinL',1.6*k);pz(P,'thighR',-.2*k,0,-.15);pz(P,'shinR',1.4*k)}; // accroupi, main au sol
const stAPull=(s='R')=>(P,e,u)=>{const out=e<.35,k=out?ezo(e/.35):1-ezo(Math.min(1,(e-.35)/.3)),sg=stSg(s);pz(P,'arm'+s,out?-1.6*k-.1:lerp(.5,-1.7,k),0,.1*sg);pz(P,'fore'+s,out?-.1:-1.4*(1-k)-.1);stGuard(P,stOp(s));pz(P,'chest',out?.3*k:-.25*(1-k),.35*sg);P.root.z=out?8*k:-4*(1-k);stLegs(P,u,1,out?1:1.3)}; // lance puis tire à soi
const stALeap=(hands=1)=>(P,e)=>{const k=stH(e,.2,.65),j=bump(Math.min(1,e/.75));P.root.y=15*j;P.root.z=10*k;pz(P,'chest',.55*k);if(hands){pz(P,'armL',-1.95*k,0,.35);pz(P,'armR',-1.95*k,0,-.35)}else{pz(P,'armR',-2.9*k+1.2*bump(e),0,-.2);pz(P,'armL',-.5,0,.6)}
 pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'thighL',-1.1);pz(P,'shinL',1.7);pz(P,'thighR',-.6);pz(P,'shinR',1.5)}; // bond qui fond sur la cible
const stACross=()=>(P,e,u)=>{const k=stH(e,.24,.55);pz(P,'armL',lerp(-2.6,-.75,k),0,lerp(.7,-.55,k));pz(P,'armR',lerp(-2.6,-.75,k),0,lerp(-.7,.55,k));pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'chest',lerp(-.3,.35,k));stLegs(P,u,k)}; // taille en croix
Object.assign(ANIM,{
 // Kunai au poing : estoc, revers, taille, tour, fente
 st_kun1:stAJ('R',0,1.2),st_kun2:stAS('R',1.9,-.5,.3,1.2),st_kun3:stAS('L',-.3,1.8,.4),st_kun4:stASpin(-1,1.45),st_kun5:stALunge('R',1.4),
 // Frappes d'ombre : directs, main au sol (la pique jaillit), revers, deux mains (les mains d'ombre)
 st_nar1:stAJ('L'),st_nar2:stAJ('R'),st_nar3:stACrouch('R'),st_nar4:stAS('L',-.3,1.7,.2),st_nar5:stATwo(-.9,.3,.15),
 // Paumes de l'essaim : paumes, bras ouverts (l'essaim jaillit), uppercut, deux paumes
 st_swm1:stAJ('R',-.15,-.9),st_swm2:stAJ('L',-.15,-.9),st_swm3:stATwo(.6,.15,.6),st_swm4:stAUp('R'),st_swm5:stATwo(-.9,.4,.1),
 // Chaînes au poing : crochets, chaîne abattue, balayage, harpon tiré à soi
 st_chn1:stAJ('L'),st_chn2:stAJ('R'),st_chn3:stAOver(0),st_chn4:stAS('R',-.6,2.2,.3),st_chn5:stAPull('R'),
 // Frappes fleuries : senbon, paume, talon tournant, coup de pied haut, deux paumes
 st_flo1:stAJ('R',.1,.9),st_flo2:stAJ('L',-.15,-.9),st_flo3:(P,e,u)=>ANIM.st_uch2(P,e,u),st_flo4:stAKick('L',2.3),st_flo5:stATwo(-.9,.3,.3),
 // Poings de sable : direct lourd, crochet, griffe, uppercut, marteau à deux mains
 st_snd1:stAJ('R',0,0,1.3),st_snd2:stAJ('L'),st_snd3:stAS('R',-.4,2,.25),st_snd4:stAUp('L'),st_snd5:stAOver(1),
 // Griffes de ronces (Hoki) : griffures d'en haut, liane abattue, croix, deux mains (épines)
 st_hok1:stAS('R',-.3,1.6,.6),st_hok2:stAS('L',-.3,1.6,.6),st_hok3:stAOver(0),st_hok4:stACross(),st_hok5:stATwo(.4,.35,.5),
 // Éventail fermé (Roran) : taille, revers, estoc, tour, éventail abattu
 st_ror1:stAS('R',-.5,1.8,.5),st_ror2:stAS('R',1.9,-.4,.2),st_ror3:stALunge('R'),st_ror4:stASpin(-1,1.3),st_ror5:stAOver(1),
 // Lames d'or (Hakumei) : tailles, croix, tour des six bras, double estoc
 st_gld1:stAS('R',-.3,1.8,.2,1.3),st_gld2:stAS('L',-.3,1.8,.2,1.3),st_gld3:stACross(),st_gld4:stASpin(1,1.45),st_gld5:stATwo(1.2,.35,.05),
 // Mains-lames de papier (Kami) : tailles, croix, coup de pied, tourbillon
 st_pap1:stAS('R',-.4,1.9,.2),st_pap2:stAS('L',-.4,1.9,.2),st_pap3:stACross(),st_pap4:stAKick('R',2.2),st_pap5:stASpin(-1,1.1),
 // Shuriken en main (Fûma) : taille, revers, coupe basse, tour, bond qui plonge
 st_fum1:stAS('R',-.3,1.8,.3,1.2),st_fum2:stAS('R',1.8,-.4,.1,1.2),st_fum3:stACrouch('R'),st_fum4:stASpin(-1,1.45),st_fum5:stALeap(0),
 // Frappes de glace (Yuki) : paumes gelées, taille, uppercut, deux paumes (éclats)
 st_ice1:stAJ('R',0,-.9),st_ice2:stAJ('L',0,-.9),st_ice3:stAS('R',-.4,2,.15),st_ice4:stAUp('L'),st_ice5:stATwo(-.9,.35,.2),
});

// ===================== ARBRES DE STYLE DE COMBAT (v5) : t0 Taijutsu · t1 Kenjutsu · t2 Bukijutsu =====================
// 1 jutsu par rang, sans mudras (garde instantanée), aucune nature (vfx tai / steel / kunai : ni bonus ni malus élémentaire).
// Les « N dégâts » des descriptions sont les dégâts de base des mécaniques (avant puissance du ninja et JBAL.d).
// Taijutsu : reprend Konoha Senpû, Dynamic Entry (ex-Taijutsuka) et le Lotus primaire (fusion) ; Ôkashô et Tsûtenkyaku sont réécrits ici.
KIT('t0',[
 ['D','x.tj_senpu','Konoha Senpû','Coup de pied tournoyant autour de soi : 12 dégâts, repousse et ralentit les ennemis proches','leaf'],
 ['C','x.tj_dynamic','Dynamic Entry','Coup de pied sauté vers le curseur (400 max) : le 1er ennemi touché subit 20 dégâts, est éjecté, interrompu et ralenti','tai'],
 ['B','x.tai_oka','Ôkashô','Poing chargé de chakra qui fend le sol devant toi : 28 dégâts au point d\'impact, projette en l\'air ; la fissure frappe en ligne (14 dégâts) et ralentit 1 s','tai'],
 ['A','x.tj_lotus1','Lotus primaire','Fonce sur l\'ennemi visé (300) ; s\'il est touché : projeté, ligoté de bandages puis fracassé au sol : 32 dégâts, étourdi 0,9 s','gate'],
 ['S','x.tai_heel','Tsûtenkyaku : Talon céleste','Bond au curseur (320 max) et talon qui s\'abat : 55 dégâts au centre et étourdi 1 s, 30 dégâts et recul autour ; le sol éclaté ralentit 2 s','tai'],
]);
KIT('t1',[
 ['D','x.ken_iai','Iai : Dégainé éclair','Coupe instantanée droit devant (ligne de 150) : 14 dégâts, +50 % si la cible est au bout de la lame','steel'],
 ['C','x.ken_ashi','Ashigiri : Coupe aux jarrets','Entaille basse en arc large devant toi : 18 dégâts, ralentit fortement 1,2 s et empêche le dash 1,5 s','steel'],
 ['B','x.ken_kaiten','Kaiten-giri : Tourbillon d\'acier','Tu tournoies 1 s, lame tendue : une coupe toutes les 0,15 s autour de toi (4 dégâts chacune, ≈ 28 en tout) ; renvoie les tirs ; tu peux avancer lentement','steel'],
 ['A','x.ken_mika','Mikazuki no Mai : Danse du croissant','Danse du croissant de lune : toi et 2 ombres frappez l\'ennemi visé de 3 côtés : 3 × 13 dégâts, le 3e étourdit 0,6 s','steel'],
 ['S','x.ken_ranbu','Ranbu : Tempête de lames','1,3 s : déluge d\'entailles dans un cône devant toi en avançant lentement : jusqu\'à 55 dégâts, renvoie les tirs ; la coupe finale repousse','steel'],
]);
KIT('t2',[
 ['D','x.buk_sweep','Ashibarai : Balayage','Balayage bas très large (200°) : 12 dégâts, fait trébucher (ralenti 0,8 s, coupe la course et le dash en cours)','kunai'],
 ['C','x.buk_hook','Kusarigama : Harpon','La faucille part au bout de sa chaîne (300) : 18 dégâts et ramène l\'ennemi touché devant toi (entravé 0,4 s)','chain'],
 ['B','x.buk_mouli','Bôjutsu : Moulinet du bâton','1,4 s : ton arme tournoie devant toi, bloque les tirs de face et frappe ce qui approche (4 dégâts / 0,3 s) ; coup final qui repousse (12 dégâts)','kunai'],
 ['A','x.buk_hyaku','Hyaku Buki : Ruée des cent armes','Fonce vers le curseur (220) en enchaînant kunai, tonfa, bâton, faucille et masse : 5 × 7 dégâts au 1er ennemi rencontré, la masse étourdit 0,8 s','kunai'],
 ['S','x.buk_nyoi','Kongô Nyoi : Bâton infini','Le bâton s\'allonge d\'un coup jusqu\'à 380 puis balaie un arc de 120° : 50 dégâts et recul ; la pointe (au-delà de 300) étourdit 1 s','kunai'],
]);
Object.assign(NATHERO,{tai:'maul',ken:'dooku',buk:'rey'});
// ---- aides des arbres de style
// coup de lame visible (traînée st_arc) : d sens, z hauteur, th épaisseur, c / c2 couleurs
const kenArc=(u,a,R,w,o={})=>jx(Object.assign({jfx:'st_arc',ui:stI(u),x:u.x,y:u.y,a,R,w,t:.32,m:.32,d:-1,z:30,th:7,c:'#e4eeff',c2:'#9ab8ff',blade:1,rr:.9},o));
// renvoie les tirs ennemis proches d'un point, devant une direction (arc) ; rend le nombre de tirs renvoyés
function kenReflect(u,x,y,r,a,arc){let n=0;for(const p of projs){if(p.dead||p.life<=0||p.owner.team===u.team||p.rocket||p.grenade)continue;if(Math.hypot(p.x-x,p.y-y)>r+p.r)continue;
 if(arc!=null&&angDiff(Math.atan2(p.y-y,p.x-x),a)>arc/2)continue;reflect(p,u);n++}return n}
// trait Iai (Kenjutsuka) : un sabre au fourreau dégaine (+30 %, ou plus selon le jutsu) ; défini dans kenjutsuka.js
const kenIai=u=>typeof kjDraw==='function'?kjDraw(u):0;
// Arsenal (Bukijutsuka) : arme plantée au sol à ramasser ; défini dans bukijutsuka.js
const bukDrop=(u,x,y,k)=>{if(typeof bkDrop==='function')bkDrop(u,x,y,k)};
Object.assign(NAT,{
 // ---------- Taijutsu ----------
 // Ôkashô : le poing s'abat devant soi ; disque d'impact puis fissure en ligne qui ralentit
 tai_oka:S_('Ôkashô','',10,{line:{len:220,w:150},ai:RG(170,.6)},(u,a)=>{anim(u,'tai_oka',.5);S('heavy',u);const D=tjLock(u,.32);
  jx({jfx:'tai_charge',ui:stI(u),x:u.x,y:u.y,a,t:.2,m:.2});fxCharge(u,'#ff9ac8',{t:.2,n:10,r:50,z:50,hd:14,c2:'#ffffff'});
  later(u,.18,()=>{if(u.dead||u.stun>0)return;const c=fwd(u,a,46);S('rock',u);S('boom',u);
   for(const e of enemies(u)){const d=Math.hypot(e.x-c.x,e.y-c.y);if(d<72+e.r)hit(e,u,28,{melee:1,air:.45,kb:240,fx:c.x,fy:c.y,unblockable:1});
    else{const dx=e.x-u.x,dy=e.y-u.y,f=dx*Math.cos(a)+dy*Math.sin(a),s=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(f>0&&f<220+e.r&&s<34+e.r)hit(e,u,14,{air:.3,slow:1,unblockable:1})}}
   jx({jfx:'tai_crack',x:c.x,y:c.y,a,len:180,t:1.4,m:1.4});jx({jfx:'tj_crater',x:c.x,y:c.y,r:72,t:.9,m:.9});jx({jfx:'shock',x:c.x,y:c.y,r:72,t:.4,m:.4,col:'#ffd0e0'});
   fxImpact(c.x,c.y,'doton',1.5,{u,r:72});fxFlare(c.x,c.y,'#ff9ac8',{u,z:20,r:30,t:.2});for(const d of[90,160])fxDebris(u.x+Math.cos(a)*d,u.y+Math.sin(a)*d,{u,n:4,sp:120,col:'#a07850',c2:'#5a4028',s:4});
   for(const e of enemies(u))if(Math.hypot(e.x-c.x,e.y-c.y)<72+e.r){fxHitStop(u,e,28,1);break}})}),
 // Tsûtenkyaku : bond et talon qui fend le sol (cercle d'alerte contrable)
 tai_heel:S_('Tsûtenkyaku : Talon céleste','',20,{tele:{r:130,max:320},ai:{mode:'gap',min:90,max:320,p:.6}},(u,a,td)=>{const d=clamp(td||250,40,320),p=fwd(u,a,d);S('dash',u);anim(u,'tj_heel',.6);
  later(u,.55,()=>{},{x:p.x,y:p.y,r:130});jx({jfx:'tai_rise',ui:stI(u),x:u.x,y:u.y,t:.55,m:.55});fxSmoke(u.x,u.y,{u,col:'#d8c8b0',n:5,r:30,s:16,t:.8,al:.26,rise:10});fxRing(u.x,u.y,{u,r0:10,r1:50,col:'#ffd0e0',w:4,t:.3});
  dash(u,a,d,.55,{jump:150,end:()=>{if(u.dead)return;const x=u.x,y=u.y;for(const e of enemies(u)){const dd=Math.hypot(e.x-x,e.y-y);if(dd<78+e.r)hit(e,u,55,{melee:1,stun:1,unblockable:1,fx:x,fy:y});else if(dd<130+e.r)hit(e,u,30,{kb:320,fx:x,fy:y,unblockable:1})}
   field(u,x,y,{r:130,t:2,slow:.45,col:'#c8a070',vfx:'tai'});jx({jfx:'tj_heel',x,y,r:130,t:.7,m:.7});jx({jfx:'tj_crater',x,y,r:130,t:2,m:2});jx({jfx:'tai_shards',x,y,t:.9,m:.9});
   fxImpact(x,y,'doton',2.6,{u,r:130,dec:0});fxRing(x,y,{u,r0:20,r1:78,col:'#ffd0e0',c2:'#ffffff',w:7,t:.3});fxDecal(x,y,'crack',{u,r:120,t:5});fxPillar(x,y,'#ffd0e0',{u,h:160,w:26,t:.35,al:.45});fxSmoke(x,y,{u,col:'#c8b090',n:8,r:120,s:26,t:1.2,al:.26,rise:24});fxShake(.4,x,y);
   for(const e of enemies(u))if(Math.hypot(e.x-x,e.y-y)<78+e.r){fxHitStop(u,e,55,1);break}
   if(near(x,y)){S('boom',u);S('rock',u)}}})}),
 // ---------- Kenjutsu ----------
 // Iai : Dégainé éclair : coupe en ligne instantanée, la pointe (au-delà de 105) inflige +50 %
 ken_iai:S_('Iai : Dégainé éclair','',5,{line:{len:150,w:34},ai:RG(150,.7)},(u,a)=>{const m=kenIai(u)?1.3:1;anim(u,'ken_draw',.32);S('saber',u);
  for(const e of enemies(u)){const dx=e.x-u.x,dy=e.y-u.y,f=dx*Math.cos(a)+dy*Math.sin(a),s=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(f<0||f>150+e.r||s>17+e.r)continue;
   const tip=f>105;if(hit(e,u,14*m*(tip?1.5:1),{melee:1,unblockable:m>1?1:0})){jx({jfx:'st_glint',ti:stI(e),x:e.x,y:e.y,a,t:.34,m:.34});fxBurst(e.x,e.y,'#e4eeff',{u,z:36,n:tip?9:5,sp:300,gr:0,up:10,w:1.3,a,arc:1.2,c2:'#ffffff'});if(tip)fxHitStop(u,e,21,1)}if(tip)say(e,'POINTE','#e4eeff')}
  fxFlare(u.x+Math.cos(a)*150,u.y+Math.sin(a)*150,'#cfe8ff',{u,z:32,r:16,t:.16});
  jx({jfx:'ken_line',ui:stI(u),x:u.x,y:u.y,a,len:150,t:.35,m:.35});jx({jfx:'st_iai',ui:stI(u),x:u.x,y:u.y,a,R:150,t:.5,m:.5})}),
 // Ashigiri : entaille basse, ralentit et empêche le dash 1,5 s (la recharge du dash de la cible est repoussée)
 ken_ashi:S_('Ashigiri : Coupe aux jarrets','',8,{line:{len:115,w:180},ai:RG(115,.65)},(u,a)=>{const m=kenIai(u)?1.3:1;anim(u,'ken_low',.34);S('saber',u);
  for(const e of stIn(u,a,115,1.9)){if(!hit(e,u,18*m,{melee:1,slow:1.2,unblockable:m>1?1:0}))continue;e.cds[DASHI]=Math.max(e.cds[DASHI]||0,1.5);aux.push({type:'ken_legs',x:e.x,y:e.y,r:0,t:1.5,m:1.5,team:u.team,owner:u,ti:stI(e)});say(e,'JAMBES TRANCHÉES','#ff8a8a');jx({jfx:'st_bleed',ti:stI(e),x:e.x,y:e.y,t:1.5,m:1.5});fxBurst(e.x,e.y,'#c0142a',{u,z:12,n:7,sp:150,up:60,gr:400,w:2,len:.05,add:0})}
  fxSmoke(u.x+Math.cos(a)*70,u.y+Math.sin(a)*70,{u,col:'#c8b8a0',n:3,r:50,s:12,t:.6,al:.22,rise:6});
  kenArc(u,a,115,1.9,{z:8,th:8,d:1,c:'#ffe0e0',c2:'#ff6a6a',tl:-.2})}),
 // Tourbillon d'acier : toupie lame tendue (u.spin du moteur : coupes toutes les 0,25 s) et renvoi des tirs
 ken_kaiten:S_('Kaiten-giri : Tourbillon d\'acier','',10,{ai:SELF(110,.6)},(u,a)=>{const m=kenIai(u)?1.3:1;S('saber',u);u.spin={t:1,k:0,r:105,dmg:4*m,ex:EX};fxRing(u.x,u.y,{u,r0:30,r1:105,col:'#cfe0ff',c2:'#ffffff',w:4,t:.3});
  aux.push({type:'ken_spin',x:u.x,y:u.y,r:105,t:1,m:1,team:u.team,owner:u,ui:stI(u)})}),
 // Mikazuki no Mai : marque en croissant sur la cible (0,25 s), puis 3 lames de 3 côtés
 ken_mika:S_('Mikazuki no Mai : Danse du croissant','',13,{line:{len:260,w:40},ai:RG(240,.65)},(u,a,td)=>{const e=pick(u,a,td||200,260),m=kenIai(u)?1.3:1;anim(u,'ken_draw',.3);S('saber',u);
  if(!e){const p=fwd(u,a,90);for(const o of stIn(u,a,110,1.6))hit(o,u,13*m,{melee:1});kenArc(u,a,110,1.6,{});jx({jfx:'ken_moon',x:p.x,y:p.y,a,t:.5,m:.5});return}
  const ex=e.x,ey=e.y;jx({jfx:'ken_moon',ti:stI(e),x:ex,y:ey,a,t:.3,m:.3});
  later(u,.25,()=>{if(u.dead||e.dead||u.stun>0||dist(u,e)>330)return;const b0=ang(e,u);
   for(let i=0;i<3;i++)later(u,i*.09,()=>{if(e.dead||u.dead)return;const b=b0+(i-1)*2.09,ox=e.x+Math.cos(b)*44,oy=e.y+Math.sin(b)*44;
    jx({jfx:'ken_shade',ui:stI(u),x:ox,y:oy,x2:e.x,y2:e.y,me:i===1?1:0,t:.4,m:.4});S('saber',u);
    if(hit(e,u,13*m,i===2?{melee:1,unblockable:1,stun:.6}:{melee:1,unblockable:1})){jx({jfx:'st_glint',ti:stI(e),x:e.x,y:e.y,a:b+3.14,t:.3,m:.3});fxBurst(e.x,e.y,'#e8f0ff',{u,z:36,n:6,sp:260,gr:0,up:10,w:1.3,a:b+3.14,arc:1.4});if(i===2){fxFlare(e.x,e.y,'#9ab8ff',{u,z:40,r:28,t:.22});fxRing(e.x,e.y,{u,r0:10,r1:50,col:'#9ab8ff',w:4,t:.3});fxHitStop(u,e,13,1)}}})})}),
 // Ranbu : 1,3 s canalisé (avance lentement), coupes en cône toutes les 0,13 s, renvoie les tirs de face ; coupe finale qui repousse
 ken_ranbu:S_('Ranbu : Tempête de lames','',21,{line:{len:170,w:200},ai:RG(150,.7)},(u,a)=>{const m=kenIai(u)?1.3:1;const D=tjLock(u,1.38);D.tx=clamp(u.x+Math.cos(a)*90,B.x+30,B.x+B.w-30);D.ty=clamp(u.y+Math.sin(a)*90,B.y+30,B.y+B.h-30);anim(u,'ken_flurry',1.3);let n=0; // avance lente : 90 en 1,38 s
  seqs.push({owner:u,n:10,t:.05,iv:.13,vfx:'steel',f:o=>{if(o.dash!==D||o.stun>0)return;n++;const b=o.aim;kenReflect(o,o.x,o.y,150,b,1.6);
   for(const e of stIn(o,b,170,1.5))hit(e,o,n<10?5*m:7*m,n<10?{melee:1,silent:n%2?1:0}:{melee:1,kb:340});
   kenArc(o,b+(rnd()-.5)*.6,150+rnd()*20,1.3,{d:n%2?1:-1,tl:(rnd()-.5)*1.4,th:5,t:.22,m:.22});if(n%2){S('saber',o);fxBurst(o.x+Math.cos(b)*100,o.y+Math.sin(b)*100,'#e4eeff',{u:o,z:30,n:5,sp:280,gr:0,up:10,w:1.2,a:b,arc:1.5,c2:'#ffffff'})}
   if(n===10){jx({jfx:'st_iai',ui:stI(o),x:o.x,y:o.y,a:b,R:170,t:.5,m:.5});fxWind(o.x+Math.cos(b)*85,o.y+Math.sin(b)*85,b,{u:o,len:170,w:150,n:9,t:.45,col:'#e4eeff'});fxFlare(o.x+Math.cos(b)*110,o.y+Math.sin(b)*110,'#cfe0ff',{u:o,z:32,r:34,t:.22});fxShake(.25,o.x,o.y)}}})}),
 // ---------- Bukijutsu ----------
 // Ashibarai : balayage bas, fait trébucher
 buk_sweep:S_('Ashibarai : Balayage','',5,{line:{len:115,w:200},ai:SELF(115,.6)},(u,a)=>{anim(u,'buk_sweep',.36);S('saber',u);
  for(const e of stIn(u,a,115,3.5))if(hit(e,u,12,{melee:1,slow:.8})&&e.unstop<=0){if(e.dash&&!e.dash.lock){e.dash=null;e.z=0}e.run=Math.min(e.run??100,10);say(e,'TRÉBUCHE','#e8c8a0')}
  kenArc(u,a,115,3.5,{z:6,th:9,d:1,c:'#e8d0a8',c2:'#8a5a2a',blade:0,rr:.95});jx({jfx:'buk_dust',x:u.x,y:u.y,a,t:.5,m:.5});for(const d of[-1.2,0,1.2])fxSmoke(u.x+Math.cos(a+d)*90,u.y+Math.sin(a+d)*90,{u,col:'#d8c8a8',n:2,r:20,s:12,t:.6,al:.22,rise:8})}),
 // Kusarigama : Harpon : la faucille au bout de sa chaîne ramène l'ennemi touché
 buk_hook:S_('Kusarigama : Harpon','',8,{line:{len:300,w:20},ai:RG(300,.6,90)},(u,a)=>{anim(u,'throw2',.3);S('blaster',u);u.thrT=.2;
  proj(u,a,{spd:950,r:9,dmg:18,life:.31,col:'#d8dde6',hook:1,kind:'buk_kama',o:{root:.4},onHit:(p,t)=>{fxBurst(t.x,t.y,'#eef2f8',{u:p.owner,z:32,n:7,sp:240,gr:0,up:20,w:1.4,c2:'#ffffff'});fxFlare(t.x,t.y,'#ffffff',{u:p.owner,z:32,r:16,t:.15})}});aux.push({type:'buk_chain',x:u.x,y:u.y,r:0,t:.7,m:.7,team:u.team,owner:u,ui:stI(u),p:projs[projs.length-1]})}),
 // Moulinet du bâton : arme qui tournoie devant soi 1,4 s (bloque les tirs de face, frappe toutes les 0,3 s), coup final qui repousse
 buk_mouli:S_('Bôjutsu : Moulinet du bâton','',11,{ai:DEF},(u,a)=>{anim(u,'buk_twirl',1.4);S('wind',u);aux.push({type:'buk_mouli',x:u.x,y:u.y,a,r:95,t:1.4,m:1.4,team:u.team,owner:u,ui:stI(u),k:.15,n:0})}),
 // Ruée des cent armes : ruée ; au 1er ennemi touché, 5 armes à la suite (la masse étourdit)
 buk_hyaku:S_('Hyaku Buki : Ruée des cent armes','',13,{line:{len:220,w:44},ai:{mode:'gap',min:40,max:220,p:.6}},(u,a)=>{S('dash',u);anim(u,'lunge',.3);dash(u,a,220,.3,{end:()=>bukCombo(u,null,a)});
  jx({jfx:'tj_dash',ui:stI(u),x:u.x,y:u.y,a,t:.32,m:.32});aux.push({type:'buk_rush',x:u.x,y:u.y,r:0,t:.4,m:.4,team:u.team,owner:u,d:u.dash,a})}),
 // Kongô Nyoi : le bâton pousse (0,35 s, ligne d'alerte) puis balaie 120° à 380
 buk_nyoi:S_('Kongô Nyoi : Bâton infini','',22,{line:{len:380,w:30},ai:RG(370,.7,120)},(u,a)=>{const D=tjLock(u,.75);anim(u,'buk_nyoi',.75);S('heavy',u);
  jx({jfx:'buk_staff',ui:stI(u),x:u.x,y:u.y,a,t:.75,m:.75});aux.push({type:'buk_nyoiw',x:u.x,y:u.y,a,r:380,t:.35,m:.35,team:u.team,owner:u,ui:stI(u)}); // alerte : l'arc réel du balayage (120°, 380)
  later(u,.35,()=>{if(u.dead||u.dash!==D||u.stun>0)return;S('wind',u);S('boom',u);const b=u.aim;
   for(const e of enemies(u)){const d=dist(u,e);if(d>380+e.r||angDiff(ang(u,e),b)>1.05)continue;const tip=d>300;
    if(hit(e,u,50,tip?{melee:1,kb:260,stun:1,unblockable:1,fx:u.x,fy:u.y}:{melee:1,kb:260,unblockable:1,fx:u.x,fy:u.y})){jx({jfx:'tj_impact',x:e.x,y:e.y,a:ang(u,e),t:.4,m:.4,big:tip?1:0});fxImpact(e.x,e.y,'doton',tip?1.4:1,{u,r:tip?54:40,dec:0});fxHitStop(u,e,50,1);if(tip)say(e,'POINTE','#ffd36a')}}
   for(const d of[-.7,0,.7])fxWind(u.x+Math.cos(b+d)*220,u.y+Math.sin(b+d)*220,b+d+Math.PI/2,{u,len:200,w:80,n:4,t:.4,col:'#ffe08a'});fxShake(.3,u.x,u.y)})}),
});
// Kongô Nyoi : alerte du balayage (secteur exact de 120° sur 380 autour de la visée), jamais atténuée
AUXF.buk_nyoiw=x=>{const u=x.owner;if(!u||u.dead||u.stun>0){x.t=0;return}x.x=u.x;x.y=u.y;x.a=u.aim};
AUXD.buk_nyoiw=x=>{const u=units[x.ui],o=u&&!u.dead?u:x;fxTeleCone(o.x,o.y,u?u.aim:x.a,x.r,2.1,1-x.t/x.m,'#ffd36a',x,.08)};
// Ruée des cent armes : 1er contact pendant la ruée
AUXF.buk_rush=x=>{const u=x.owner;if(u.dead||u.dash!==x.d){x.t=0;return}for(const e of enemies(u))if(dist(u,e)<u.r+e.r+18){u.dash=null;u.z=0;x.t=0;bukCombo(u,e,x.a);return}};
// les 5 armes à la suite sur la cible (ou le 1er ennemi devant soi en fin de ruée)
const BUKW=['kunai','tonfa','staff','kama','mace'];
function bukCombo(u,e,a){if(u.dead)return;if(!e){e=stIn(u,a,70,1.6)[0];if(!e){sparks(u.x,u.y,'#d8c8a8',8,'smoke');return}}if(aux.some(o=>o.type==='buk_rushk'&&o.owner===u&&o.t>0))return;
 const D=tjLock(u,.6);aux.push({type:'buk_rushk',x:e.x,y:e.y,r:0,t:.62,m:.62,team:u.team,owner:u,tg:e,ti:stI(e),ui:stI(u),d:D,k:0,n:0});say(u,'CENT ARMES !','#ffd36a')}
AUXF.buk_rushk=(x,dt)=>{const u=x.owner,e=x.tg;if(u.dead||!e||e.dead||u.dash!==x.d||u.stun>0){x.t=0;return}x.x=e.x;x.y=e.y;u.aim=ang(u,e);x.k-=dt;if(x.k>0||x.n>=5)return;x.k=.11;
 const n=x.n++,w=BUKW[n];S(n===4?'heavy':'saber',u);anim(u,n%2?'stab':'lunge',.12);jx({jfx:'buk_wsw',ui:stI(u),x:u.x,y:u.y,a:u.aim,w,d:n%2?1:-1,t:.22,m:.22});
 if(hit(e,u,7,n===4?{melee:1,stun:.8,kb:200,fx:u.x,fy:u.y}:{melee:1}))jx({jfx:'tj_impact',x:e.x,y:e.y,a:u.aim,t:.3,m:.3,big:n===4?1:0});if(n===4){bukDrop(u,e.x,e.y,4);fxImpact(e.x,e.y,'doton',1,{u,r:44,dec:0});fxHitStop(u,e,20,1)}};
// Kusarigama : la chaîne relie le lanceur à la faucille
AUXF.buk_chain=x=>{const p=x.p;if(!p||p.dead||p.life<=0||x.owner.dead){x.t=Math.min(x.t,.12);x.p=null;return}x.x=p.x;x.y=p.y};
AUXD.buk_chain=(x,k)=>{const u=units[x.ui];if(!u||u.dead)return;const a=P(u.x,u.y,30),b=P(x.x,x.y,26),al=Math.min(1,x.t/.12);g.strokeStyle=rgba('#9aa4b4',.9*al);g.lineWidth=2.2*a.s;g.setLineDash([3*a.s,2*a.s]);g.beginPath();g.moveTo(a.x,a.y);
 g.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+8*a.s,b.x,b.y);g.stroke();g.setLineDash([])};
PROJD.buk_kama=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle='#5a3a22';g.fillRect(-R*1.6,-R*.25,R*1.6,R*.5);g.fillStyle='#e4e8ee';g.strokeStyle='#5a6070';g.lineWidth=1;g.beginPath();g.moveTo(0,-R*.3);g.quadraticCurveTo(R*1.4,-R*1.6,R*.4,-R*2);
 g.quadraticCurveTo(R*1,-R*1,-R*.2,R*.3);g.closePath();g.fill();g.stroke()};
// Moulinet : suit le lanceur, bloque les tirs de face, coupe toutes les 0,3 s
AUXF.buk_mouli=(x,dt)=>{const u=x.owner;if(u.dead||u.stun>0){x.t=0;return}x.x=u.x;x.y=u.y;x.a=u.aim;
 for(const p of projs){if(p.dead||p.life<=0||p.owner.team===u.team||p.rocket)continue;const d=Math.hypot(p.x-u.x,p.y-u.y);if(d<x.r+p.r&&angDiff(Math.atan2(p.y-u.y,p.x-u.x),x.a)<1.2){p.life=0;p.dead=1;if(near(p.x,p.y)){sparks(p.x,p.y,'#e8d0a8',6);S('deflect',u)}}}
 x.k-=dt;if(x.k<=0&&x.t>.15){x.k=.3;x.n++;for(const e of stIn(u,x.a,x.r,2.4))hit(e,u,4,{melee:1,silent:x.n%2?1:0})}
 if(x.t<=dt*1.01&&!x.fin){x.fin=1;S('heavy',u);for(const e of stIn(u,x.a,x.r+15,2.4))hit(e,u,12,{melee:1,kb:300,fx:u.x,fy:u.y});kenArc(u,x.a,x.r+20,2.4,{c:'#f0dcb8',c2:'#8a5a2a',blade:0,th:10,z:30});fxWind(u.x+Math.cos(x.a)*60,u.y+Math.sin(x.a)*60,x.a,{u,len:110,w:150,n:6,t:.35,col:'#f0dcb8'})}};
AUXD.buk_mouli=(x,k,t)=>fxAlpha(fxA(x),()=>stMouliD(x,k,t));function stMouliD(x,k,t){const u=units[x.ui];if(!u||u.dead)return;const c=fwd(u,x.a,34),q=P(c.x,c.y,32),s=q.s,R=42*s,sp=t*26;g.save();g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#f0dcb8',.16);g.beginPath();g.ellipse(q.x,q.y,R*.55,R,0,0,7);g.fill();g.strokeStyle=rgba('#ffffff',.35);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R*.55,R,0,sp,sp+2.4);g.stroke();g.restore();
 for(let i=0;i<2;i++){const b=sp+i*Math.PI;g.strokeStyle='#6a4a2a';g.lineWidth=3.2*s;g.lineCap='round';g.beginPath();g.moveTo(q.x-Math.cos(b)*R*.5,q.y-Math.sin(b)*R);g.lineTo(q.x+Math.cos(b)*R*.5,q.y+Math.sin(b)*R);g.stroke();
  g.fillStyle='#e8c040';circ(q.x+Math.cos(b)*R*.5,q.y+Math.sin(b)*R,2.4*s,'#e8c040')}};
// Tourbillon d'acier : renvoie les tirs autour du lanceur tant qu'il tournoie
AUXF.ken_spin=x=>{const u=x.owner;if(u.dead||!u.spin){x.t=0;return}x.x=u.x;x.y=u.y;kenReflect(u,u.x,u.y,x.r+10,0,null)};
AUXD.ken_spin=(x,k,t)=>fxAlpha(fxA(x),()=>stKenSpinD(x,k,t));function stKenSpinD(x,k,t){const u=units[x.ui];if(!u||u.dead)return;const q=P(u.x,u.y,26),R=x.r*q.s;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const b=t*22+i*2.09;
 g.strokeStyle=rgba(i?'#9ab8ff':'#ffffff',.7);g.lineWidth=(4-i)*q.s;g.beginPath();g.ellipse(q.x,q.y,R*(.92-i*.08),R*(.92-i*.08)*K,0,b,b+1.4);g.stroke()}
 g.fillStyle=rgba('#c8d8ff',.08);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.restore()};
// ---- visuels des arbres de style
// coupe en ligne du dégainé : trait blanc et éclat
JFXD.ken_line=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,ca=Math.cos(f.a),sa=Math.sin(f.a),pr=Math.min(1,e/.12),a0=P(o.x+ca*14,o.y+sa*14,32),a1=P(o.x+ca*f.len*pr,o.y+sa*f.len*pr,32);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 g.strokeStyle=rgba('#9ab8ff',.5*k);g.lineWidth=9*a0.s*k+1;g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.stroke();g.strokeStyle=rgba('#ffffff',.95*k);g.lineWidth=2.4*a0.s;g.stroke();g.restore()};
// marque du croissant de lune, puis l'ombre qui frappe
JFXD.ken_moon=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,40),R=34*q.s*(.8+e*.4);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#e8f0ff',.75*k);g.beginPath();g.arc(q.x,q.y,R,-1.2,1.2);
 g.arc(q.x+R*.45,q.y,R*.8,1.1,-1.1,true);g.closePath();g.fill();g.strokeStyle=rgba('#9ab8ff',.8*k);g.lineWidth=2;g.stroke();g.restore()};
JFXD.ken_shade=(f,k,e,t,u)=>{const a=Math.atan2(f.y2-f.y,f.x2-f.x);if(u&&!f.me)tjGhost(u,f.x,f.y,0,.5*k);const p0=P(f.x,f.y,34),p1=P(f.x2+Math.cos(a)*30,f.y2+Math.sin(a)*30,30);g.save();g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=3*p0.s;g.lineCap='round';g.beginPath();g.moveTo(p0.x,p0.y);g.quadraticCurveTo((p0.x+p1.x)/2,(p0.y+p1.y)/2-26*p0.s,p1.x,p1.y);g.stroke();g.strokeStyle=rgba('#9ab8ff',.6*k);g.lineWidth=8*p0.s;g.stroke();g.restore()};
// Ôkashô : chakra qui gonfle le poing, puis la fissure
JFXD.tai_charge=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x+Math.cos(f.a)*14,u.y+Math.sin(f.a)*14,50),r=(6+e*16)*q.s;g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ff9ac8',.5);g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill();
 g.fillStyle=rgba('#ffffff',.8);g.beginPath();g.arc(q.x,q.y,r*.45,0,7);g.fill();g.restore()};
JFXD.tai_crack=(f,k,e)=>{const ca=Math.cos(f.a),sa=Math.sin(f.a),L=f.len*Math.min(1,e/.15),al=Math.min(1,k*2.5);g.strokeStyle=rgba('#1a120a',.85*al);g.lineWidth=3;g.lineJoin='round';g.beginPath();
 for(let j=-1;j<=1;j+=2){let px=f.x,py=f.y;const a0=P(px,py,0);g.moveTo(a0.x,a0.y);for(let i=1;i<=7;i++){const d=L*i/7,w=Math.sin(i*2.3+f.x)*12+j*i*2;px=f.x+ca*d-sa*w;py=f.y+sa*d+ca*w;const q=P(px,py,0);g.lineTo(q.x,q.y)}}g.stroke();
 if(e<.5){g.fillStyle=rgba('#6a4a30',1-e*2);for(let i=0;i<8;i++){const d=L*(i+.5)/8,q=P(f.x+ca*d,f.y+sa*d,Math.sin(Math.PI*Math.min(1,e*2.5))*(18+i%3*10));g.fillRect(q.x-3,q.y-3,6,5)}}};
// Tsûtenkyaku : traînée d'envol et éclats de roche
JFXD.tai_rise=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,(u.z||0)+20);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd0e0',.6*k);g.lineWidth=3*q.s;for(let i=0;i<5;i++){const x=q.x+(i-2)*6*q.s;g.beginPath();g.moveTo(x,q.y);g.lineTo(x,q.y+(30+i%2*16)*q.s);g.stroke()}g.restore()};
JFXD.tai_shards=(f,k,e)=>{for(let i=0;i<12;i++){const b=i*.524+f.x*.01,d=(20+e*140)*(.6+(i%3)*.2),h=Math.sin(Math.PI*Math.min(1,e*1.3))*(50+(i%4)*20),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,h);
 g.fillStyle=i%2?'#7a5a3a':'#a8885a';g.save();g.translate(q.x,q.y);g.rotate(e*8+i);g.fillRect(-5*q.s,-4*q.s,10*q.s,8*q.s);g.restore()}};
// poussière du balayage
JFXD.buk_dust=(f,k,e)=>{for(let i=0;i<9;i++){const b=f.a+(i-4)*.38,d=60+e*70,q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,4+e*16);g.fillStyle=rgba('#d8c8a8',.4*k);g.beginPath();g.ellipse(q.x,q.y,(8+e*12)*q.s,(5+e*7)*q.s,0,0,7);g.fill()}};
// arme dessinée au vol (Ruée des cent armes, Arsenal changeant) : w = kunai, tonfa, staff (bô), kama (faucille), mace (masse), axe (hache)
function bukWeapon(w,s){g.lineCap='round';
 if(w==='staff'){g.strokeStyle='#6a4a2a';g.lineWidth=3.4*s;g.beginPath();g.moveTo(-30*s,0);g.lineTo(46*s,0);g.stroke();circ(46*s,0,2.6*s,'#e8c040');circ(-30*s,0,2.6*s,'#e8c040');return}
 if(w==='tonfa'){g.strokeStyle='#4a3a2a';g.lineWidth=3.6*s;g.beginPath();g.moveTo(-6*s,0);g.lineTo(24*s,0);g.stroke();g.lineWidth=3*s;g.beginPath();g.moveTo(2*s,0);g.lineTo(2*s,7*s);g.stroke();return}
 if(w==='kama'){g.strokeStyle='#5a3a22';g.lineWidth=3*s;g.beginPath();g.moveTo(0,0);g.lineTo(18*s,0);g.stroke();g.fillStyle='#e4e8ee';g.beginPath();g.moveTo(16*s,-1*s);g.quadraticCurveTo(26*s,-14*s,12*s,-18*s);g.quadraticCurveTo(20*s,-10*s,14*s,1*s);g.fill();return}
 if(w==='mace'||w==='axe'){g.strokeStyle='#5a3a22';g.lineWidth=3.4*s;g.beginPath();g.moveTo(0,0);g.lineTo(26*s,0);g.stroke();if(w==='axe'){g.fillStyle='#c8ccd4';g.beginPath();g.moveTo(20*s,-2*s);g.quadraticCurveTo(36*s,-14*s,32*s,4*s);g.quadraticCurveTo(28*s,14*s,20*s,4*s);g.fill()}
  else{circ(29*s,0,7*s,'#5a5f6a');g.fillStyle='#c8ccd4';for(let i=0;i<6;i++){const b=i*1.047;g.beginPath();g.moveTo(29*s+Math.cos(b)*6*s,Math.sin(b)*6*s);g.lineTo(29*s+Math.cos(b)*11*s,Math.sin(b)*11*s);g.lineTo(29*s+Math.cos(b+.4)*6*s,Math.sin(b+.4)*6*s);g.fill()}}return}
 g.strokeStyle='#3a3a44';g.lineWidth=2.6*s;g.beginPath();g.moveTo(-4*s,0);g.lineTo(4*s,0);g.stroke();g.fillStyle='#d3d8e2';g.beginPath();g.moveTo(4*s,-3*s);g.lineTo(18*s,0);g.lineTo(4*s,3*s);g.fill()}
JFXD.buk_wsw=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,pr=Math.min(1,e/.6),b=f.a+(f.d||1)*(-1.1+2.2*ezo(pr)),q=P(o.x+Math.cos(b)*14,o.y+Math.sin(b)*14,32);g.save();g.globalAlpha=Math.min(1,k*3);g.translate(q.x,q.y);
 g.rotate(Math.atan2(Math.sin(b)*K,Math.cos(b)));bukWeapon(f.w,q.s*1.1);g.restore();
 g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.5*k);g.lineWidth=3*q.s;g.beginPath();const R=(f.w==='staff'?60:f.w==='mace'?40:30)*q.s;g.ellipse(P(o.x,o.y,32).x,P(o.x,o.y,32).y,R,R*K,0,f.a-(f.d||1)*1.1,b,(f.d||1)<0);g.stroke();g.restore()};
// Kongô Nyoi : le bâton pousse puis balaie l'arc
JFXD.buk_staff=(f,k,e,t,u)=>{if(!u||u.dead)return;const ext=e<.47?ezo(e/.47):1,sw=e<.47?0:ezio(Math.min(1,(e-.47)/.35)),b=u.aim-1.05*Math.sin(sw*4.712),L=40+340*ext,q0=P(u.x,u.y,34),q1=P(u.x+Math.cos(b)*L,u.y+Math.sin(b)*L,34);
 g.save();g.lineCap='round';if(e>=.47&&sw<1){g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffe08a',.18*k);g.beginPath();g.moveTo(q0.x,q0.y);g.ellipse(q0.x,q0.y,L*q0.s,L*q0.s*K,0,u.aim-1.05,u.aim+1.05);g.closePath();g.fill();g.globalCompositeOperation='source-over'}
 g.strokeStyle='#3a2414';g.lineWidth=7*q0.s;g.beginPath();g.moveTo(q0.x,q0.y);g.lineTo(q1.x,q1.y);g.stroke();g.strokeStyle='#b8782a';g.lineWidth=4.6*q0.s;g.stroke();
 circ(q1.x,q1.y,5*q0.s,'#ffd36a');circ(q0.x+(q1.x-q0.x)*.06,q0.y+(q1.y-q0.y)*.06,4*q0.s,'#ffd36a');g.restore()};
// jambes tranchées (pas de dash) : marque rouge sur les jambes de la cible
AUXF.ken_legs=x=>{const e=units[x.ti];if(!e||e.dead){x.t=0;return}x.x=e.x;x.y=e.y};
AUXD.ken_legs=(x,k)=>{const e=units[x.ti];if(!e||e.dead)return;const q=P(e.x,e.y,0),S=q.s;g.save();g.strokeStyle=rgba('#ff5a5a',.9*Math.min(1,x.t*3));g.lineWidth=2.4*S;for(const s of[-1,1]){g.beginPath();g.moveTo(q.x+s*6*S-5*S,q.y-14*S);g.lineTo(q.x+s*6*S+5*S,q.y-6*S);g.stroke()}g.restore()};
// animations
Object.assign(ANIM,{
 // Ôkashô : poing levé puis abattu au sol
 tai_oka:(P,e)=>{if(e<.35){const k=e/.35;pz(P,'armR',-3*k,0,-.2);pz(P,'foreR',-.6*k);pz(P,'chest',-.3*k,.2);P.root.y=2*k}else{const k=ezo(Math.min(1,(e-.35)/.2));pz(P,'armR',-3+1.9*k,0,.1);pz(P,'foreR',-.1);pz(P,'chest',.85*k,.1);pz(P,'head',.3*k);P.root.y=-8*k;pz(P,'thighL',-.8*k);pz(P,'shinL',1.2*k);pz(P,'thighR',.4*k);pz(P,'shinR',.8*k)}},
 // dégainé : main gauche au fourreau, puis la lame part en travers
 ken_draw:(P,e)=>{if(e<.3){const k=e/.3;pz(P,'armR',-.4*k,0,.6*k);pz(P,'foreR',-1.4*k);pz(P,'armL',-.3*k,0,.3);pz(P,'chest',.2*k,.5*k);P.root.y=-4*k}else{const k=ezo(Math.min(1,(e-.3)/.25));pz(P,'armR',-1.5,0,-1.3*k+.6*(1-k));pz(P,'foreR',-.1);pz(P,'chest',.25,-.6*k+.5*(1-k));P.root.y=-5;P.root.z=6*k;pz(P,'thighL',-.7,0,.2);pz(P,'shinL',.9);pz(P,'thighR',.5);pz(P,'shinR',.7)}},
 // coupe basse : accroupi, lame au ras du sol
 ken_low:(P,e)=>{const k=Math.min(1,e*4),s=ezo(Math.min(1,e*1.6));P.root.y=-10*k;pz(P,'chest',.7*k,.8-1.6*s);pz(P,'armR',-1.2,0,-.8+1.4*s);pz(P,'foreR',-.2);pz(P,'thighL',-1.1*k,0,.3);pz(P,'shinL',1.6*k);pz(P,'thighR',.5*k,0,-.3);pz(P,'shinR',1.4*k)},
 // rafale de coupes (Ranbu)
 ken_flurry:(P,e,u,t)=>{const n=t*16,x=Math.sin(n*Math.PI),R=(n|0)%2===0;pz(P,'armR',-1.5+.6*x,0,R?-1.1*x:1.1*x);pz(P,'foreR',-.3);pz(P,'armL',-.8,0,.4);pz(P,'chest',.25,(R?.5:-.5)*x);P.root.y=-4;pz(P,'thighL',-.6,0,.25);pz(P,'shinL',.8);pz(P,'thighR',.45);pz(P,'shinR',.7)},
 // balayage bas (arme tenue à deux mains)
 buk_sweep:(P,e)=>{const s=ezo(Math.min(1,e*1.4)),k=Math.min(1,e*5);P.rootR.y=tjSp(1.2-3*s);P.root.y=-9*k;pz(P,'armR',-1.3,0,-.4);pz(P,'armL',-1.3,0,.4);pz(P,'chest',.5*k);pz(P,'thighR',-1.3*k);pz(P,'shinR',1.7*k);pz(P,'thighL',.2,0,.6*k)},
 // moulinet : bras tendus, poignets qui tournent
 buk_twirl:(P,e,u,t)=>{const w=Math.sin(t*26)*.4;pz(P,'armR',-1.5,0,-.2+w);pz(P,'foreR',-.3);pz(P,'armL',-1.3,0,.3-w);pz(P,'foreL',-.5);pz(P,'chest',.12);P.root.y=-3;pz(P,'thighL',-.4,0,.2);pz(P,'shinL',.6);pz(P,'thighR',.3);pz(P,'shinR',.5)},
 // bâton infini : bras tendu qui pousse puis balaie
 buk_nyoi:(P,e)=>{if(e<.47){const k=ezo(e/.47);pz(P,'armR',-1.55*k,0,0);pz(P,'armL',-1.4*k,0,.2);pz(P,'chest',.25*k);P.root.y=-5*k;pz(P,'thighL',-.8*k);pz(P,'shinL',1*k);pz(P,'thighR',.6*k)}
  else{const k=ezio(Math.min(1,(e-.47)/.35));P.rootR.y=tjSp(.9-1.8*k);pz(P,'armR',-1.55,0,0);pz(P,'armL',-1.4,0,.2);pz(P,'chest',.25,.4-.8*k);P.root.y=-5;pz(P,'thighL',-.8);pz(P,'shinL',1);pz(P,'thighR',.6)}},
});
