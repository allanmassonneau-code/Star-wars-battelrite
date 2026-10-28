// ===== Clan Uchiha =====
// Identité : le Sharingan (trait) lit les jutsu ennemis. Jutsu du regard (Genjutsu, Tsukuyomi, Amaterasu), copie (Sharingan),
// Katon du clan (Gôkakyû, Ryûka), kenjutsu (Kusanagi), corbeaux (Shunshin), Kamui, Izanagi et Susanô.
const ucD={
 kusa:'Le sabre s\'allonge d\'un coup : estoc en ligne qui ignore les parades et ralentit ; la pointe frappe 55 % plus fort',
 goka:'Grande boule de feu qui grossit en avançant, explose et brûle ; relance pour la faire exploser où tu veux',
 shar:'Copie le dernier jutsu ennemi vu (10 s) et le relance aussitôt, à 90 % ; sans copie, esquive le prochain coup (2,5 s)',
 ryuka:'3 shuriken à fil : le premier ennemi touché est ligoté, puis le feu court le long du fil et l\'embrase',
 genj:'Regard droit devant : qui te regarde est paralysé 0,9 s, les autres sont ralentis. Détourner les yeux protège',
 iza:'Pendant 4 s la réalité se réécrit : à la fin, ou si tu meurs, tu reviens au point et aux PV du lancement',
 shun:'Disparaît en corbeaux et surgit dans le dos de l\'ennemi visé ; ta prochaine attaque de base frappe +15 %',
 kamui:'Aspiré dans ta dimension : intangible et invisible, tu réapparais au point visé (300 max)',
 amat:'Le regard embrase la cible de flammes noires inextinguibles : longue brûlure qui se propage aux ennemis proches',
 tsuku:'Si la cible croise ton regard : 72 h de torture en 0,9 s (paralysée, blessée, vidée de chakra), puis vulnérable 1,5 s ; sinon ralentie',
 susa:'Le Susanô t\'entoure 3 s (−15 % de dégâts) et frappe 3 fois devant toi ; le dernier coup scelle (étourdit)',
};
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c0',[
 [1,'D','x.uc_kusa','Lame de Kusanagi',ucD.kusa,'steel'],
 [1,'C','x.uc_goka','Katon : Gôkakyû',ucD.goka,'fire'],
 [4,'C','x.uc_shar','Sharingan',ucD.shar,'genjutsu'],
 [3,'B','x.uc_ryuka','Katon : Ryûka',ucD.ryuka,'fire'],
 [3,'B','x.uc_genj','Sharingan : Genjutsu',ucD.genj,'genjutsu'],
 [4,'A','x.uc_iza','Izanagi',ucD.iza,'genjutsu'],
 [2,'C','x.uc_shun','Shunshin Uchiha',ucD.shun,'genjutsu'],
 [2,'B','x.uc_kamui','Kamui',ucD.kamui,'genjutsu'],
 [5,'S','x.uc_amat','Amaterasu',ucD.amat,'black'],
 [5,'S','x.uc_tsuku','Tsukuyomi',ucD.tsuku,'tsukuyomi'],
 [5,'A','x.uc_susa','Susanô : Totsuka',ucD.susa,'susano'],
]);
// ---- aides
let ucCopy=null; // lanceur d'un jutsu copié : ses coups immédiats font −10 %
const ucTR={rng:560,rec:40,part:.65}; // trait : portée de lecture des mudras, repos de l'œil après une lecture, part des dégâts encore subie (le contrôle est toujours annulé)
// réglages d'équilibre (dégâts de base avant la puissance du ninja)
const ucK={kusa:9,kusaP:14,kusaS:.3,gkD:6,gkA:5,gkR:46,cpM:.9,ryuS:4,ryuR:.65,ryuF:12,genD:12,genS:.9,genL:345,genW:120,shB:1.15,shT:.22,amD:15,amP:7.5,tsuD:8,tsuS:.9,tsuT:6,tsuC:15,tsuV:1.5,susD:7,susL:12,susR:.15,susT:3,susU:.8,susS:.6};
const ucAI={cp:{max:420,p:.75},wake:{mode:'def',p:.45},izF:{mode:'self',max:260,p:.6},izN:{mode:'heal',p:0}}; // conduite des bots : Sharingan (copie prête ou non), Izanagi (blessé et au contact), Kamui (esquive, fuite si presque mort)
const ucI=u=>units.indexOf(u),ucCol=u=>u.ch.look.weapon.col||'#a5f';
function ucS(k,u){const V=VFX;VFX=null;S(k,u);VFX=V} // son exact (sans la teinte sonore de l'élément)
function ucSay(u,s,col,dz,dx){if(near(u.x,u.y))txt.push({x:u.x+(dx||0)+(rnd()-.5)*12,y:u.y,z:95+(dz||0),s,col,t:1})} // texte plus haut : ne se mêle pas à « ÉTOURDI » et aux dégâts
function ucSlot(u,k){const A=u.ch.abil;for(let i=0;i<A.length;i++)if(A[i]&&A[i].key===k)return i;return -1}
function ucLine(u,a,len,w){const c=Math.cos(a),s=Math.sin(a);return enemies(u).filter(e=>{const dx=e.x-u.x,dy=e.y-u.y,f=dx*c+dy*s;return f>-e.r&&f<len+e.r&&Math.abs(-dx*s+dy*c)<w/2+e.r})}
const ucEye=(e,u)=>angDiff(e.aim||0,ang(e,u))<1.15; // contact visuel : la cible regarde vers le lanceur
// cible d'un regard : dans la ligne (télégraphe), la plus proche du point visé ; sinon un ennemi tout près du point visé
function ucGazeT(u,a,td,L,w){const p=fwd(u,a,Math.min(td||300,L)),c=ucLine(u,a,L,w);if(c.length)return c.reduce((b,x)=>Math.hypot(x.x-p.x,x.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?x:b);return nearE(u,p.x,p.y,110)}
const ucCopyOk=ab=>typeof ab.f==='function'&&ab.key!=='uc_shar'&&!/findIndex\(x=>x\.key/.test(String(ab.f)); // les jutsu à charges / canalisés ne se copient pas
Object.assign(NAT,{
 // Lame de Kusanagi : estoc instantané en ligne (la lame s'allonge), ignore les parades ; le bout de la lame frappe plus fort
 uc_kusa:S_('Lame de Kusanagi',ucD.kusa,8,{hero:'anakin',line:{len:235,w:34},ai:RG(225,.65)},(u,a)=>{const L=235;ucS('saber',u);anim(u,'uc_thrust',.45);
  jx({jfx:'uc_blade',ui:ucI(u),x:u.x,y:u.y,a,L,t:.62,m:.62,col:ucCol(u)});
  for(const e of ucLine(u,a,L,34)){const tip=dist(u,e)>L-70;if(hit(e,u,tip?ucK.kusaP:ucK.kusa,{melee:1,unblockable:1,slow:ucK.kusaS})){sparks(e.x,e.y,'#ffffff',tip?10:5,'steel');jx({jfx:'uc_cut',ti:ucI(e),x:e.x,y:e.y,a,tip:tip?1:0,t:.45,m:.45});if(tip)ucSay(e,'POINTE !','#e8ecf2',26)}}}),
 // Katon : Gôkakyû : grosse boule de feu lente qui grossit ; explose au contact ou en fin de course ; relance = explosion immédiate
 uc_goka:S_('Katon : Gôkakyû',ucD.goka,10,{line:{len:520,w:56},ai:RG(470,.6)},(u,a)=>{const i=ucCopy===u?-1:ucSlot(u,'uc_goka'),p0=u.uc_gk; // copiée par le Sharingan : simple boule, sans relance
  if(i>=0&&u.jst&&u.jst.key==='uc_goka'&&p0&&!p0.dead&&p0.life>0){if(p0.life0-p0.life<.3){u.cds[i]=.05;return}ucGokaBoom(p0);p0.life=0;u.cds[i]=u.jst.cd;u.jst=null;return}
  ucS('fire',u);anim(u,'breath',.6);proj(u,a,{spd:350,r:14,dmg:ucK.gkD,life:1.5,col:'#ff7a2a',big:1,kind:'uc_goka',onHit:p=>ucGokaBoom(p)});const p=projs[projs.length-1];if(i>=0)u.uc_gk=p;
  aux.push({type:'uc_gk',x:p.x,y:p.y,r:0,t:4,m:4,team:u.team,owner:u,p,i,cd:i>=0?u.ch.abil[i].cd:0});
  if(i>=0&&!u.jst){u.jst={key:'uc_goka',i,n:1,t:1.5,cd:u.ch.abil[i].cd,v:'fire'};u.cds[i]=.3}}), // relance seulement si aucune autre charge n'est en cours
 // Sharingan : copie le dernier jutsu ennemi vu (10 s) et le relance à 90 % ; sinon lit le prochain coup (esquive 2,5 s, comme l'ancien Sharingan)
 uc_shar:S_('Sharingan',ucD.shar,10,{ai:SELF(380,.4)},(u,a,td)=>{const c=u.uc_cp,ok=!!(c&&c.ab&&SIMT-c.t<10);anim(u,'eye',.5);ucS('genjutsu',u);jx({jfx:'uc_copy',ui:ucI(u),x:u.x,y:u.y,t:.7,m:.7,cp:ok?1:0});
  if(!ok){u.dodge=Math.max(u.dodge,2.5);ring(u.x,u.y,48,'#e0304a');say(u,'SHARINGAN','#ff5a6a');return}
  u.uc_cp=null;say(u,'COPIE : '+c.ab.n,'#ff5a6a');const n0=projs.length,z0=zones.length,f0=fields.length,a0=aux.length,ab=Object.assign({},c.ab);
  ucCopy=u;try{fire(u,ab,a,td,false)}catch(err){}ucCopy=null;
  const M=ucK.cpM;for(let k=n0;k<projs.length;k++)if(projs[k].owner===u)projs[k].dmg*=M;for(let k=z0;k<zones.length;k++)zones[k].dmg*=M;for(let k=f0;k<fields.length;k++)fields[k].dps*=M;
  for(let k=a0;k<aux.length;k++)if(typeof aux[k].dmg==='number')aux[k].dmg*=M;const v=ab.vfx;later(u,0,()=>{if(auraOn(u))u.auraV=v})}),
 // Katon : Ryûka : 3 shuriken à fil ; le premier ennemi touché est ligoté, puis le feu court le long du fil jusqu'à lui
 uc_ryuka:S_('Katon : Ryûka',ucD.ryuka,10,{line:{len:440,w:90},ai:RG(420,.6)},(u,a)=>{ucS('dash',u);ucS('deflect',u);anim(u,'uc_fan',.4);const c={done:0},ps=[];
  for(const k of[-.1,0,.1]){proj(u,a+k,{spd:820,r:7,dmg:ucK.ryuS,life:.55,col:'#d8dde6',vfx:'shuriken',kind:'uc_shuri',ox:u.x,oy:u.y,onHit:(p,t)=>{if(c.done||t.dead||p.owner!==u)return;c.done=1;ucWire(u,t)}});ps.push(projs[projs.length-1])}
  aux.push({type:'uc_wthrow',x:u.x,y:u.y,r:0,t:.6,m:.6,team:u.team,owner:u,ps})}),
 // Sharingan : Genjutsu : regard droit devant ; paralyse ceux qui regardent le lanceur, ralentit les autres (la zone touchée est exactement la bande du télégraphe)
 uc_genj:S_('Sharingan : Genjutsu',ucD.genj,10,{hero:'inquisitor',line:{len:ucK.genL,w:ucK.genW},ai:RG(320,.6)},(u,a)=>{ucS('genjutsu',u);anim(u,'uc_stare',.6);jx({jfx:'uc_gaze',ui:ucI(u),x:u.x,y:u.y,a,L:ucK.genL,w:ucK.genW,t:.6,m:.6});
  for(const e of ucLine(u,a,ucK.genL,ucK.genW)){
   if(ucEye(e,u)){if(hit(e,u,ucK.genD,{stun:ucK.genS,unblockable:1,reveal:1})){jx({jfx:'uc_bind',ti:ucI(e),x:e.x,y:e.y,t:ucK.genS,m:ucK.genS});jx({jfx:'uc_gazeline',ui:ucI(u),ti:ucI(e),x:e.x,y:e.y,t:.4,m:.4});ucSay(e,'GENJUTSU','#ff5a6a',28)}}
   else if(hit(e,u,ucK.genD*.5,{slow:1.6,unblockable:1}))ucSay(e,'REGARD ÉVITÉ','#ffb0c0',28)}}),
 // Izanagi : ancre (position + PV) ; au bout de 4 s, ou à la mort (moteur : izRevive), retour à l'ancre
 uc_iza:S_('Izanagi',ucD.iza,14,{ai:HEALM},(u)=>{ucS('genjutsu',u);anim(u,'pray',.5);const T=4;u.izT=T+.3;u.izS={x:u.x,y:u.y,hp:u.hp};
  aux.push({type:'uc_iza',x:u.x,y:u.y,r:0,t:T,m:T,team:u.team,owner:u,ui:ucI(u),hp:u.hp,lx:u.x,ly:u.y});jx({jfx:'uc_izaon',ui:ucI(u),x:u.x,y:u.y,t:T,m:T});ring(u.x,u.y,46,'#e0304a');say(u,'IZANAGI','#ff5a6a')}),
 // Shunshin Uchiha : éclair dans une nuée de corbeaux, réapparaît dans le dos de l'ennemi visé (sinon au curseur)
 uc_shun:S_('Shunshin Uchiha',ucD.shun,10,{hero:'maul',ai:GAP},(u,a,td)=>{const p=fwd(u,a,Math.min(td||260,330)),e=nearE(u,p.x,p.y,150);let tx,ty;
  if(e){const b=ang(u,e);tx=e.x+Math.cos(b)*52;ty=e.y+Math.sin(b)*52}else{const q=fwd(u,a,Math.min(td||260,280));tx=q.x;ty=q.y}
  tx=clamp(tx,B.x+u.r,B.x+B.w-u.r);ty=clamp(ty,B.y+u.r,B.y+B.h-u.r);const b=Math.atan2(ty-u.y,tx-u.x),d=Math.hypot(tx-u.x,ty-u.y);
  ucS('dash',u);ucS('poof',u);jx({jfx:'uc_crows',x:u.x,y:u.y,a:b,t:.8,m:.8,out:1});u.phase=Math.max(u.phase||0,.1);
  dash(u,b,d,ucK.shT,{end:()=>{if(e&&!e.dead)u.aim=ang(u,e);u.uc_shB=SIMT+1.6;anim(u,'uc_land',.4);jx({jfx:'uc_crows',x:u.x,y:u.y,a:b+Math.PI,t:.55,m:.55,out:0})}})}),
 // Kamui : aspiré dans l'autre dimension (intangible, invisible) puis recraché au point visé, sans traverser la carte ; le point d'arrivée tourbillonne d'avance
 // (deux « dash » immobiles : ni déplacement visible ni jutsu pendant le passage)
 uc_kamui:S_('Kamui',ucD.kamui,12,{ai:ESC},(u,a,td)=>{const p=fwd(u,a,clamp(td||260,90,300)),dur=.5,h=dur/2;ucS('wind',u);ucS('genjutsu',u);anim(u,'eye',.65);
  jx({jfx:'uc_kamui',x:u.x,y:u.y,t:.55,m:.55,in:1});jx({jfx:'uc_kamui',x:p.x,y:p.y,t:dur+.4,m:dur+.4,dl:dur});
  u.phase=Math.max(u.phase||0,dur+.05);u.stealth=Math.max(u.stealth,dur-.08);
  dash(u,a,0,h,{end:()=>{u.x=p.x;u.y=p.y;u.kx=u.ky=0;collide(u);dash(u,a,0,h,{end:()=>{ring(u.x,u.y,46,'#8a3ab0');ucS('wind',u)}})}})}),
 // Amaterasu : le regard verrouille l'ennemi le plus proche du point visé (dans le cercle annoncé) ; 0,28 s plus tard, flammes noires (brûlure inextinguible qui se propage)
 uc_amat:ULT('Amaterasu',ucD.amat,{tele:{r:110,max:480},ai:{max:480,p:.8}},(u,a,td)=>{const p=atP(u,a,td,480),tg=nearE(u,p.x,p.y,130); // verrouille un ennemi qui touche le cercle annoncé
  ucS('genjutsu',u);anim(u,'uc_amat',1);
  jx({jfx:'uc_mgk',ui:ucI(u),x:u.x,y:u.y,t:1.4,m:1.4,blood:1});if(tg)jx({jfx:'uc_gazeline',ui:ucI(u),ti:ucI(tg),x:tg.x,y:tg.y,t:.3,m:.3,dark:1});
  later(u,.28,()=>{const live=tg&&!tg.dead,x=live?tg.x:p.x,y=live?tg.y:p.y;ucS('fire',u);jx({jfx:'uc_amatb',x,y,r:72,t:1.1,m:1.1});field(u,x,y,{r:62,t:3.5,dps:6,col:'#120a16',vfx:'black'});
   if(live){ucIgnite(u,tg,ucK.amD,ucK.amP,6);for(const o of enemies(u))if(o!==tg&&dist(o,tg)<110)ucIgnite(u,o,10,5,4)}else for(const o of enemies(u))if(Math.hypot(o.x-x,o.y-y)<72+o.r)ucIgnite(u,o,12,6,5);
   if(near(x,y))shake=Math.max(shake,.3)})}),
 // Tsukuyomi : contact visuel obligatoire ; crucifiée 0,9 s, 3 « jours » de tourments, chakra perdu, puis esprit brisé (vulnérable) ; sinon simple ralentissement
 // cible : l'ennemi de la ligne de regard (télégraphe) le plus proche du point visé, sinon celui tout près du point visé
 uc_tsuku:ULT('Tsukuyomi',ucD.tsuku,{line:{len:420,w:70},ai:{max:400,p:.8}},(u,a,td)=>{const e=ucGazeT(u,a,td,420,70);anim(u,'uc_stare',.9);ucS('genjutsu',u);jx({jfx:'uc_mgk',ui:ucI(u),x:u.x,y:u.y,t:1.1,m:1.1});
  if(!e){say(u,'AUCUN REGARD','#ffb0c0');return}jx({jfx:'uc_gazeline',ui:ucI(u),ti:ucI(e),x:e.x,y:e.y,t:.45,m:.45});
  if(!ucEye(e,u)){if(hit(e,u,10,{slow:1.6,unblockable:1}))ucSay(e,'REGARD ÉVITÉ','#ffb0c0',28);return}
  const T=ucK.tsuS;if(!hit(e,u,ucK.tsuD,{stun:T,unblockable:1}))return;e.energy=Math.max(0,e.energy-ucK.tsuC);jx({jfx:'redmoon',x:e.x,y:e.y,t:1.5,m:1.5});ucS('heavy',u);
  if(!(e.stun>0)){ucSay(e,'RÉSISTE','#ffb0c0',28);return} // inarrêtable, ou lu par un Sharingan : le monde de Tsukuyomi ne le retient pas
  anim(e,'uc_cross',T);e.aim=Math.PI/2;ucSay(e,'TSUKUYOMI','#ff3a4a',36); // crucifiée face à nous
  jx({jfx:'uc_tsuku',ti:ucI(e),x:e.x,y:e.y,t:T,m:T});aux.push({type:'uc_tsk',x:e.x,y:e.y,r:0,t:T,m:T,team:u.team,owner:u,tg:e,ti:ucI(e)});
  for(let i=0;i<3;i++)later(u,.18+i*.25,()=>{if(e.dead||!(e.stun>0))return;hit(e,u,ucK.tsuT,{unblockable:1});ucSay(e,(24*(i+1))+' H','#ff5a6a',-14,58)});
  // au réveil : esprit brisé (vulnérable), même si la paralysie a été levée plus tôt
  later(u,T,()=>{if(e.dead)return;e.vuln=Math.max(e.vuln,ucK.tsuV);ucSay(e,'ESPRIT BRISÉ','#ff9ab0',28)})}),
 // Susanô : Totsuka : armure de chakra (moins de dégâts, inarrêtable) + 3 coups d'épée en arc devant soi ; le 3e scelle (étourdit)
 uc_susa:ULT('Susanô : Totsuka',ucD.susa,{hero:'kylo',line:{len:185,w:220},ai:{max:160,p:.8}},(u,a)=>{ucS('roar',u);ucS('heavy',u);anim(u,'uc_susa',1.6);const col=ucCol(u);
  const T=ucK.susT;u.uc_suT=SIMT+T;u.unstop=Math.max(u.unstop,ucK.susU);aux.push({type:'uc_susa',x:u.x,y:u.y,r:0,t:T,m:T,team:u.team,owner:u,ui:ucI(u),col});
  jx({jfx:'uc_susf',ui:ucI(u),x:u.x,y:u.y,t:T,m:T,col});later(u,0,()=>{u.auraV=null});
  for(let i=0;i<3;i++)later(u,.3+i*.42,()=>{if(u.dead)return;const b=u.aim,last=i===2;ucS('saber',u);ucS(last?'boom':'heavy',u);
   jx({jfx:'uc_totsuka',ui:ucI(u),x:u.x,y:u.y,a:b,dir:i%2?-1:1,last:last?1:0,t:.42,m:.42,col});
   for(const e of enemies(u))if(dist(u,e)<180+e.r&&angDiff(ang(u,e),b)<1.05&&hit(e,u,last?ucK.susL:ucK.susD,last?{stun:ucK.susS,unblockable:1}:{kb:150,unblockable:1,fx:u.x,fy:u.y})&&last){jx({jfx:'seal',ti:ucI(e),x:e.x,y:e.y,t:1,m:1});say(e,'SCELLÉ','#ffe8a0')}
   if(near(u.x,u.y))shake=Math.max(shake,last?.35:.18)})}),
});
Object.assign(NATHERO,{uc:'ahsoka'});
// ---- mécaniques annexes
// fil de Ryûka : la cible est ligotée, le feu court le long du fil (rompu si le lanceur est étourdi ou trop loin)
function ucWire(u,t){if(t.unstop<=0&&!(t.slowImm>0)){t.root=Math.max(t.root,ucK.ryuR);t.rootV='kunai';ucSay(t,'LIGOTÉ','#e8ecf2',28)}const tr=.24+dist(u,t)/900;anim(u,'breath',tr+.1);
 const f=jx({jfx:'uc_ryuka',ui:ucI(u),ti:ucI(t),x:t.x,y:t.y,t:tr+.45,m:tr+.45,tr});aux.push({type:'uc_wire',x:t.x,y:t.y,r:0,t:tr,m:tr,team:u.team,owner:u,tg:t,f,ui:ucI(u),ti:ucI(t)})}
AUXF.uc_wire=x=>{const u=x.owner,e=x.tg;if(x.done)return;
 if(u.dead||e.dead||u.stun>0||dist(u,e)>560){x.done=1;x.t=0;if(x.f)x.f.t=Math.min(x.f.t,.1);if(!e.dead)say(e,'FIL ROMPU','#cccccc');return}
 x.x=e.x;x.y=e.y;if(x.t<=0){x.done=1;VFX='fire';hit(e,u,ucK.ryuF,{dot:BURN(3,2)});VFX=null;detoFx(e.x,e.y,46,'fire');ucS('fire',u);sparks(e.x,e.y,'#ffb03a',12,'fire')}};
// fils des shuriken en vol : on tient à jour le point d'attache (lanceur) pour le dessin
AUXF.uc_wthrow=x=>{for(const p of x.ps){p.ox=x.owner.x;p.oy=x.owner.y}};
// Gôkakyû : la boule grossit en vol ; explosion (feu, brûlure, sol embrasé) au contact, en fin de course ou à la relance
function ucGokaBoom(p){if(p.uc_b)return;p.uc_b=1;const u=p.owner,R=ucK.gkR+p.r*2.2,d=ucK.gkA+(p.r-14)*.5,V=VFX;VFX='fire';
 aoe(u,p.x,p.y,R,d,{dot:BURN(3,1.5),kb:110,quiet:1},'#ff7a2a');field(u,p.x,p.y,{r:R*.7,t:1.6,dps:3,col:'#ff7a2a',vfx:'fire'});VFX=V;
 jx({jfx:'uc_gkboom',x:p.x,y:p.y,r:R,t:.75,m:.75});if(near(p.x,p.y)){shake=Math.max(shake,.28);ucS('boom',u)}}
AUXF.uc_gk=(x,dt)=>{const p=x.p,u=x.owner;if(x.done)return;
 // tant que la boule vole : pas de nouvelle boule (si une autre charge a pris la relance) ; les bots ne relancent pas
 if(!p.dead&&p.life>0&&projs.indexOf(p)>=0){p.r=Math.min(p.windB?34:26,p.r+dt*9);x.x=p.x;x.y=p.y;if(x.i>=0&&(!u.ctrl||!(u.jst&&u.jst.key==='uc_goka')))u.cds[x.i]=Math.max(u.cds[x.i],.3);return}
 x.done=1;x.t=0;if(!p.uc_b)ucGokaBoom(p);if(x.i>=0&&u.uc_gk===p){if(u.jst&&u.jst.key==='uc_goka')u.jst=null;if(u.cds[x.i]<1)u.cds[x.i]=x.cd}};
// Izanagi : au bout du temps, retour au point et aux PV d'origine ; si le moteur a déjà ramené le ninja (mort annulée), simple effet
const ucIzaClean=u=>{cleanse(u);for(const o of aux)if(o.type==='uc_amat'&&o.tg===u)o.end=1}; // la réalité réécrite efface aussi les flammes noires
AUXF.uc_iza=x=>{const u=x.owner;if(x.done)return;if(u.dead){x.done=1;x.t=0;return}
 if(!(u.izT>0)){x.done=1;x.t=0;ucIzaClean(u);jx({jfx:'uc_izend',x:x.lx,y:x.ly,x2:u.x,y2:u.y,t:.7,m:.7});return}x.lx=u.x;x.ly=u.y;
 if(x.t<=0){x.done=1;const ox=u.x,oy=u.y;u.izT=0;u.hp=Math.max(u.hp,x.hp);u.x=x.x;u.y=x.y;u.kx=u.ky=0;u.dash=null;ucIzaClean(u);collide(u);
  jx({jfx:'uc_izend',x:ox,y:oy,x2:u.x,y2:u.y,t:.7,m:.7});ring(u.x,u.y,60,'#e0304a');say(u,'IZANAGI !','#ff5a6a');ucS('genjutsu',u)}};
// Amaterasu : flammes noires à part (élément neutre, indépendantes des brûlures du moteur : ni l'eau ni une autre brûlure ne les éteignent ;
// seuls l'intangibilité et Izanagi y échappent) ; chaque seconde, elles sautent sur les ennemis proches qui ne brûlent pas encore
function ucIgnite(u,e,dmg,dps,dur){if(!hit(e,u,dmg,{el:-1,unblockable:1}))return false;const x=aux.find(o=>o.type==='uc_amat'&&o.tg===e&&!o.end);
 if(x){x.t=Math.max(x.t,dur);x.m=Math.max(x.m,x.t);x.dps=Math.max(x.dps,dps);x.owner=u}else aux.push({type:'uc_amat',x:e.x,y:e.y,r:0,t:dur,m:dur,team:u.team,owner:u,tg:e,ti:ucI(e),dps,k:1,tk:.5});
 e.uc_am=Math.max(e.uc_am||0,dur);return true}
AUXF.uc_amat=(x,dt)=>{const e=x.tg;if(!e||e.dead||x.end||x.t<=0){x.t=0;if(e)e.uc_am=0;return}x.x=e.x;x.y=e.y;e.uc_am=x.t;
 if((x.tk-=dt)<=0){x.tk+=.5;hit(e,x.owner,x.dps*.5,{silent:1,el:-1})} // même rythme que les brûlures du moteur
 if(x.k>0)return;x.k=1;for(const o of units)if(!o.dead&&o!==e&&o.team===e.team&&!(o.uc_am>0)&&dist(o,e)<95&&ucIgnite(x.owner,o,6,5,3))beamFx(e.x,e.y,o.x,o.y,'#5a2a7a',4)};
// Tsukuyomi et Susanô suivent leur ninja
AUXF.uc_tsk=x=>{const e=x.tg;if(!e||e.dead||!(e.stun>0)){x.t=Math.min(x.t,.2);if(e&&e.anim&&e.anim.k==='uc_cross')e.anim=null;if(!e||e.dead)x.t=0;return}x.x=e.x;x.y=e.y};
AUXF.uc_susa=x=>{const u=x.owner;if(!u||u.dead){x.t=0;return}x.x=u.x;x.y=u.y};

// ---- trait de clan : Sharingan
TRAITS[0]={nom:'Sharingan',desc:'Chaque jutsu ennemi vu éveille un tomoe ; à 3 tomoe, le prochain jutsu qui te touche est lu : aucun contrôle et −35 % de dégâts (puis l\'œil se repose 40 s)',
 init(u){u.uc_tm=0;u.uc_obs=new Map()},
 // le Sharingan suit les mudras : un temps de recharge ennemi qui repart = un jutsu vu (tomoe + copie possible)
 update(u,dt){if(!u.uc_obs||u.uc_obs.size>64)u.uc_obs=new Map();if(u.uc_tmF>0)u.uc_tmF-=dt;const see=!(u.stun>0)&&!(u.sleepT<0);
  const rest=u.uc_rec>SIMT; // l'œil qui se repose n'éveille plus de tomoe, mais il voit toujours (copie possible)
  // (un même emplacement n'est compté qu'une fois en 2 s : les jutsu qui fixent leur recharge plus tard, relance ou charges, ne comptent pas double)
  for(const e of units){if(e.team===u.team||e.dead)continue;const cd=e.cds||[],o=u.uc_obs.get(e);if(!o){u.uc_obs.set(e,{c:cd.slice(),t:[]});continue}const pv=o.c,vis=see&&dist(u,e)<ucTR.rng;
   for(let i=1;i<6;i++){const c=cd[i]||0;if(vis&&c>(pv[i]||0)+.5&&!(SIMT-(o.t[i]??-9)<2)){o.t[i]=SIMT;const ab=e.ch.abil[i];if(ab){if(!rest&&(u.uc_tm|0)<3){u.uc_tm=(u.uc_tm|0)+1;u.uc_tmF=.6;if(u.uc_tm===3)say(u,'SHARINGAN','#ff5a6a')}if(!ab.ult&&ucCopyOk(ab))u.uc_cp={ab,t:SIMT}}}pv[i]=c}}
  const live=!!(u.uc_cp&&SIMT-u.uc_cp.t<10);u.uc_cpN=live?u.uc_cp.ab.n:'';u.uc_cpT=live?Math.ceil(10-(SIMT-u.uc_cp.t)):0;u.uc_rcT=u.uc_rec>SIMT?Math.ceil(u.uc_rec-SIMT):0;
  const i=ucSlot(u,'uc_shar');if(i>=0)u.ch.abil[i].ai=live?ucAI.cp:ucAI.wake;
  const j=ucSlot(u,'uc_iza');if(j>=0)u.ch.abil[j].ai=u.hp<u.max*.7?ucAI.izF:ucAI.izN; // Izanagi : avant d'encaisser (l'ancre se pose à la fin des mudras)
  const k=ucSlot(u,'uc_kamui');if(k>=0)u.ch.abil[k].ai=u.hp<u.max*.35?ESC:DEF},
 deal(src,t,dmg,o){if(ucCopy===src)dmg*=ucK.cpM;if(src.uc_shB>SIMT&&o.melee&&o.basic&&!o.silent){src.uc_shB=0;dmg*=ucK.shB;say(t,'DANS LE DOS !','#ff5a6a')}return dmg},
 // lecture : à 3 tomoe, le premier jutsu ennemi (pas une attaque de base ni une brûlure) est anticipé d'un pas de côté : pas de contrôle, dégâts réduits
 take(t,src,dmg,o){if(t.uc_suT>SIMT&&src!==t)dmg*=1-ucK.susR; // Susanô : l'armure de chakra réduit tous les dégâts (en plus des autres réductions)
  if(!src||src===t||src.team===t.team||o.silent||o.basic||o.thorn||o.arc)return dmg;if(t.uc_rdT>SIMT){if(!ucTR.part)return -1;t.unstop=Math.max(t.unstop,.05);return dmg*ucTR.part} // la lecture couvre toute la technique (0,3 s)
  if((t.uc_tm|0)<3||t.stun>0||t.sleepT<0)return dmg;
  t.uc_tm=0;t.uc_rec=SIMT+ucTR.rec;const b=ang(src,t)+(rnd()<.5?1:-1)*Math.PI/2;jx({jfx:'uc_read',ui:ucI(t),x:t.x,y:t.y,t:.5,m:.5});t.kx+=Math.cos(b)*240;t.ky+=Math.sin(b)*240;t.haste=Math.max(t.haste,1);say(t,'LU !','#ff5a6a');ucS('deflect',t);
  t.uc_rdT=SIMT+.3;if(ucTR.part){t.unstop=Math.max(t.unstop,.05);return dmg*ucTR.part}return -1},
 // 1 à 3 tomoe tournent au sol autour du ninja ; à 3, un cercle rouge annonce la lecture
 draw(u,p,S,sk){const n=u.uc_tm|0;if(!n||u.dead)return;const t=performance.now()/1000,full=n>=3,R=25*S*sk,rot=t*(full?2.6:1);g.save();
  if(full){g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff2a3a',.4+.2*Math.sin(t*8));g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,R,R*K,0,0,7);g.stroke();g.globalCompositeOperation='source-over'}
  for(let i=0;i<3;i++){const b=rot+i*2.094,f=i<n&&u.uc_tmF>0&&i===n-1?1+u.uc_tmF:1;ucTomoe(p.x+Math.cos(b)*R,p.y+Math.sin(b)*R*K,2.6*S*f,b+1.57,i<n?(full?'#ff2a3a':'#c0202a'):'rgba(60,10,16,.3)')}g.restore()},
 hud(u,x,y){const X=x+232,Y=y-8,n=u.uc_tm|0,t=performance.now()/1000;g.save();circ(X,Y,11,'#c0202a');g.strokeStyle='#1a0006';g.lineWidth=2;g.beginPath();g.arc(X,Y,11,0,7);g.stroke();g.lineWidth=1;g.beginPath();g.arc(X,Y,6.5,0,7);g.stroke();circ(X,Y,2.4,'#1a0006');
  for(let i=0;i<3;i++){const b=(n>=3?t*4:0)+i*2.094-1.57;ucTomoe(X+Math.cos(b)*6.5,Y+Math.sin(b)*6.5,1.9,b+1.57,i<n?'#1a0006':'rgba(26,0,6,.22)')}
  text(n>=3?'Sharingan : lecture prête':u.uc_rcT>0?'Sharingan : l\'œil récupère ('+u.uc_rcT+' s)':'Sharingan '+n+'/3',X+16,Y+4,12,n>=3?'#ff6a7a':'#e8b0b8','left');if(u.uc_cpN)tfit('Copie : '+u.uc_cpN+' ('+u.uc_cpT+' s)',X+16,Y+18,11,'#ffd0d8',230);g.restore()}};
AFTER.push(()=>{UK.push('uc_tm','uc_cpN','uc_cpT','uc_rcT','uc_am');
 // Susanô et Tsukuyomi du clan ont leurs propres effets : on coupe les effets génériques de l'élément pour eux
 for(const v of['susano','tsukuyomi']){const o=JFX[v];if(o)JFX[v]=(u,a,td,pre,ab)=>{if(ab&&(ab.key==='uc_susa'||ab.key==='uc_tsuku'))return;o(u,a,td,pre,ab)}}});

// ---- dessins
// tomoe (virgule) : tête ronde + queue qui s'enroule dans la direction a
function ucTomoe(x,y,r,a,col){const c=Math.cos(a),s=Math.sin(a);g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.beginPath();g.moveTo(x-s*r,y+c*r);
 g.quadraticCurveTo(x+c*r*1.5-s*r*1.3,y+s*r*1.5+c*r*1.3,x+c*r*2.5-s*r*.2,y+s*r*2.5+c*r*.2);g.quadraticCurveTo(x+c*r*1.2+s*r*.2,y+s*r*1.2-c*r*.2,x+s*r*.7,y-c*r*.7);g.closePath();g.fill()}
// œil Sharingan en amande (op = ouverture des paupières)
function ucEyeDraw(x,y,R,op,rot){const lid=()=>{g.beginPath();g.moveTo(x-R,y);g.quadraticCurveTo(x,y-R*op*1.3,x+R,y);g.quadraticCurveTo(x,y+R*op*1.3,x-R,y);g.closePath()};g.save();
 lid();g.fillStyle='#f4ecec';g.fill();g.clip();circ(x,y,R*.52,'#d01a2a');g.strokeStyle='#1a0006';g.lineWidth=R*.06;g.beginPath();g.arc(x,y,R*.32,0,7);g.stroke();circ(x,y,R*.13,'#1a0006');
 for(let i=0;i<3;i++){const b=rot+i*2.094;ucTomoe(x+Math.cos(b)*R*.32,y+Math.sin(b)*R*.32,R*.075,b+1.57,'#1a0006')}g.restore();lid();g.strokeStyle='#1a0006';g.lineWidth=Math.max(1.5,R*.09);g.stroke()}
// Mangekyô (Itachi) : disque rouge et trois lames noires
function ucMgk(x,y,R,rot){circ(x,y,R,'#d01a2a');g.fillStyle='#1a0006';for(let i=0;i<3;i++){const b=rot+i*2.094;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(b-.7)*R*.95,y+Math.sin(b-.7)*R*.95,x+Math.cos(b)*R,y+Math.sin(b)*R);g.quadraticCurveTo(x+Math.cos(b+.55)*R*.4,y+Math.sin(b+.55)*R*.4,x,y);g.fill()}
 g.strokeStyle='#1a0006';g.lineWidth=Math.max(1,R*.1);g.beginPath();g.arc(x,y,R,0,7);g.stroke();circ(x,y,R*.17,'#d01a2a')}
// lame de Kusanagi qui s'allonge depuis la main puis se rétracte
JFXD.uc_blade=(f,k,e,t,u)=>{const el=e*f.m,a=f.a,ex=el<.06?ezo(el/.06):el<.2?1:el<.36?1-(el-.2)/.16:0,o=u&&!u.dead?u:f;
 // traînée : trait de vitesse figé là où la lame a frappé
 const s0=P(f.x+Math.cos(a)*14,f.y+Math.sin(a)*14,30),s1=P(f.x+Math.cos(a)*(14+f.L),f.y+Math.sin(a)*(14+f.L),30);g.globalCompositeOperation='lighter';g.lineCap='round';
 g.strokeStyle=rgba(f.col,.35*k);g.lineWidth=7*k*s0.s;g.beginPath();g.moveTo(s0.x,s0.y);g.lineTo(s1.x,s1.y);g.stroke();g.strokeStyle=rgba('#ffffff',.6*k);g.lineWidth=1.4;g.stroke();
 const L=f.L*ex;if(L<4){g.globalCompositeOperation='source-over';return}
 const h=P(o.x+Math.cos(a)*14,o.y+Math.sin(a)*14,30),tp=P(o.x+Math.cos(a)*(14+L),o.y+Math.sin(a)*(14+L),30),dx=tp.x-h.x,dy=tp.y-h.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=3.2*h.s;
 g.strokeStyle=rgba(f.col,.45);g.lineWidth=11*h.s;g.beginPath();g.moveTo(h.x,h.y);g.lineTo(tp.x,tp.y);g.stroke();
 g.globalCompositeOperation='source-over';g.fillStyle='#eef1f6';g.beginPath();g.moveTo(h.x+nx*w,h.y+ny*w);g.lineTo(tp.x,tp.y);g.lineTo(h.x-nx*w*.5,h.y-ny*w*.5);g.closePath();g.fill();
 g.strokeStyle='#7a8496';g.lineWidth=1;g.beginPath();g.moveTo(h.x-nx*w*.5,h.y-ny*w*.5);g.lineTo(tp.x,tp.y);g.stroke();g.fillStyle='#2a2a33';g.fillRect(h.x-3*h.s,h.y-3*h.s,6*h.s,6*h.s);
 if(el>.03&&el<.24){const s=(1-Math.abs(el-.11)/.13)*18*h.s;g.globalCompositeOperation='lighter';g.fillStyle='#ffffff';g.beginPath();for(let i=0;i<8;i++){const b=i*Math.PI/4+.4,r=i%2?s*.2:s;g.lineTo(tp.x+Math.cos(b)*r,tp.y+Math.sin(b)*r*.8)}g.closePath();g.fill()}
 g.globalCompositeOperation='source-over'};
// entaille laissée sur une cible transpercée (croix blanche, rouge à la pointe)
JFXD.uc_cut=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,38),s=q.s,L=(f.tip?22:15)*s*Math.min(1,e*6),c=Math.cos(f.a),n=Math.sin(f.a)*K;g.globalCompositeOperation='lighter';g.lineCap='round';
 for(const [d,w] of[[.55,1],[-.55,.7]]){const cx=Math.cos(f.a+d),cy=Math.sin(f.a+d)*K;g.strokeStyle=rgba(f.tip?'#ff6a7a':'#ffffff',.9*k);g.lineWidth=(f.tip?3:2)*w*s;g.beginPath();g.moveTo(q.x-cx*L,q.y-cy*L);g.lineTo(q.x+cx*L,q.y+cy*L);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.5*k);g.lineWidth=1;g.beginPath();g.moveTo(q.x-c*L*1.6,q.y-n*L*1.6);g.lineTo(q.x+c*L*1.6,q.y+n*L*1.6);g.stroke();g.globalCompositeOperation='source-over'};
// Sharingan qui tourne devant le regard (copie : rayons de lecture)
JFXD.uc_copy=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x+Math.cos(u.aim)*8,u.y+Math.sin(u.aim)*8,64),y=q.y-64*q.s,R=(6+20*ezo(Math.min(1,e*2.5)))*q.s,al=Math.min(1,k*2.5);g.globalAlpha=al;
 g.globalCompositeOperation='lighter';circ(q.x,y,R*1.35,'rgba(208,26,42,.3)');g.globalCompositeOperation='source-over';circ(q.x,y,R,'#d01a2a');g.strokeStyle='#1a0006';g.lineWidth=2;g.beginPath();g.arc(q.x,y,R,0,7);g.stroke();
 g.lineWidth=1;g.beginPath();g.arc(q.x,y,R*.55,0,7);g.stroke();circ(q.x,y,R*.17,'#1a0006');for(let i=0;i<3;i++){const b=t*7+i*2.094;ucTomoe(q.x+Math.cos(b)*R*.55,y+Math.sin(b)*R*.55,R*.13,b+1.57,'#1a0006')}
 if(f.cp){g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff5a6a',.7);g.lineWidth=1.5;for(let i=0;i<10;i++){const b=i*.628+t*2;g.beginPath();g.moveTo(q.x+Math.cos(b)*R*1.3,y+Math.sin(b)*R*1.3);g.lineTo(q.x+Math.cos(b)*R*(1.7+e),y+Math.sin(b)*R*(1.7+e));g.stroke()}}g.globalAlpha=1};
// regard du Genjutsu : bande rouge au sol (exactement la zone touchée), rayons, et l'œil géant qui s'ouvre au-dessus du lanceur
JFXD.uc_gaze=(f,k,e,t,u)=>{const o=u||f,a=f.a,L=(f.L||345)*ezo(Math.min(1,e*3)),w=(f.w||150)/2,c=Math.cos(a),s=Math.sin(a),pt=(d,l,z)=>P(o.x+c*d-s*l,o.y+s*d+c*l,z||2);
 poly([pt(0,-w),pt(L,-w),pt(L,w),pt(0,w)],rgba('#e0304a',.14*k));poly([pt(0,-w*.3),pt(L,-w*.85),pt(L,w*.85),pt(0,w*.3)],rgba('#e0304a',.16*k));
 g.globalCompositeOperation='lighter';g.lineWidth=2;g.strokeStyle=rgba('#ff3a4a',.7*k);for(const l of[-w,w]){const p0=pt(0,l),p1=pt(L,l);g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.stroke()}
 const h=P(o.x+c*10,o.y+s*10,62);g.lineWidth=2;
 for(let i=0;i<5;i++){const p2=pt(L,(i-2)*w*.45,24);g.strokeStyle=rgba(i===2?'#ffd0d8':'#ff3a4a',.5*k);g.beginPath();g.moveTo(h.x,h.y);g.lineTo(p2.x,p2.y);g.stroke()}
 g.globalCompositeOperation='source-over';const op=e<.15?e/.15:e>.75?Math.max(0,1-(e-.75)/.25):1;if(op>.05)ucEyeDraw(h.x,h.y-54*h.s,24*h.s,op*.6,t*5)};
// lien de regard (yeux dans les yeux)
JFXD.uc_gazeline=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const a=P(u.x,u.y,62),b=P(tg.x,tg.y,62);g.globalCompositeOperation=f.dark?'source-over':'lighter';g.lineCap='round';
 g.strokeStyle=f.dark?rgba('#3a0a2a',.75*k):rgba('#ff2a3a',.7*k);g.lineWidth=5*k+1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=f.dark?rgba('#c060ff',.6*k):rgba('#ffd0d8',.8*k);g.lineWidth=1.2;g.stroke()};
// paralysie du genjutsu : pieux noirs plantés dans la cible, tomoe qui tournent autour d'elle
JFXD.uc_bind=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,al=Math.min(1,k*4,e*6);g.globalAlpha=al;g.strokeStyle='#e0304a';g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,26*s,26*s*K,0,0,7);g.stroke();
 g.lineCap='round';for(let i=0;i<3;i++){const b=-2.3+i*.8,x0=q.x+Math.cos(b)*40*s,y0=q.y-84*s+Math.sin(b)*10*s,x1=q.x+Math.cos(b)*6*s,y1=q.y-42*s,L=Math.min(1,e*6),xe=lerp(x0,x1,L),ye=lerp(y0,y1,L);
  g.strokeStyle='#120a16';g.lineWidth=4*s;g.beginPath();g.moveTo(x0,y0);g.lineTo(xe,ye);g.stroke();g.fillStyle='#120a16';g.beginPath();g.arc(x0,y0,2.6*s,0,7);g.fill()}
 for(let i=0;i<3;i++){const b=t*4+i*2.094;ucTomoe(q.x+Math.cos(b)*24*s,q.y-44*s+Math.sin(b)*8*s,3*s,b+1.57,'#e0304a')}g.globalAlpha=1};
// shuriken à fil : étoile d'acier qui tourne, fil tendu jusqu'à la main du lanceur
PROJD.uc_shuri=(p,R,ra,t)=>{if(p.ox!=null){const q=P(p.x,p.y,28),o=P(p.ox,p.oy,46);g.strokeStyle='rgba(235,240,248,.75)';g.lineWidth=.9;g.beginPath();g.moveTo(0,0);g.lineTo((o.x-q.x)/q.s,(o.y-q.y)/q.s);g.stroke()}
 g.rotate(t/28);g.fillStyle='#3a3f4a';g.beginPath();for(let i=0;i<4;i++){const b=i*Math.PI/2;g.lineTo(Math.cos(b)*11,Math.sin(b)*11);g.lineTo(Math.cos(b+.6)*3.4,Math.sin(b+.6)*3.4)}g.closePath();g.fill();
 g.strokeStyle='#e8ecf2';g.lineWidth=1;g.stroke();circ(0,0,2,'#9aa3b4')};
// Ryûka : fil tendu entre le lanceur et la cible, le dragon de feu court dessus puis embrase la cible
JFXD.uc_ryuka=(f,k,e,t,u,tg)=>{if(!u||!tg||u.dead||tg.dead||f.cut)return;const el=e*f.m;
 // fil rompu : l'objet « uc_wire » (synchronisé) a disparu avant l'arrivée du feu → plus ni fil ni embrasement (aussi chez les invités)
 if(el<f.tr-.05&&!aux.some(x=>x.type==='uc_wire'&&x.ui===f.ui&&x.ti===f.ti)){f.cut=1;return}const fp=clamp((el-.22)/Math.max(.05,f.tr-.22),0,1),a=P(u.x+Math.cos(u.aim)*10,u.y+Math.sin(u.aim)*10,50),b=P(tg.x,tg.y,34),
  m={x:(a.x+b.x)/2,y:(a.y+b.y)/2+14*a.s*(1-fp*.8)},Q=s=>({x:(1-s)*(1-s)*a.x+2*(1-s)*s*m.x+s*s*b.x,y:(1-s)*(1-s)*a.y+2*(1-s)*s*m.y+s*s*b.y});
 if(el<f.tr){g.strokeStyle='rgba(20,20,26,.75)';g.lineWidth=2.6;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo(m.x,m.y,b.x,b.y);g.stroke();g.strokeStyle='#eef2f8';g.lineWidth=1;g.stroke();
  g.strokeStyle='rgba(230,236,244,.85)';g.lineWidth=1.3;for(let i=0;i<3;i++){g.beginPath();g.ellipse(b.x,b.y+(i-1)*9*b.s,15*b.s,5*b.s,0,0,7);g.stroke()}
  if(fp>0){g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle='rgba(255,120,40,.55)';g.lineWidth=7;g.beginPath();for(let i=0;i<=10;i++){const p=Q(fp*i/10);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}g.stroke();g.strokeStyle='#ffd36a';g.lineWidth=2.5;g.stroke();
   const h=Q(fp),R=(9+Math.sin(t*30)*1.5)*a.s;for(let j=1;j<4;j++){const p=Q(Math.max(0,fp-j*.06));circ(p.x,p.y-j*2*a.s,R*(1-j*.2),'rgba(255,120,40,.45)')}
   circ(h.x,h.y,R*1.6,'rgba(255,90,26,.5)');circ(h.x,h.y,R,'#ffb03a');circ(h.x,h.y,R*.5,'#fff3c0');g.globalCompositeOperation='source-over'}}
 else{const e2=(el-f.tr)/(f.m-f.tr);g.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const c=i*.785+t*2,r=(12+e2*30)*b.s;circ(b.x+Math.cos(c)*r,b.y+Math.sin(c)*r*.6-e2*20*b.s,(9-e2*6)*b.s,rgba(i%2?'#ff7a2a':'#ffd36a',.7*(1-e2)))}}};
// Gôkakyû : boule de feu en couches, langues de flamme qui tournent autour
PROJD.uc_goka=(p,R,ra,t)=>{const T=t/1000;g.globalCompositeOperation='lighter';g.rotate(ra);for(let i=5;i>=1;i--)circ(-i*R*.42,Math.sin(T*16+i)*R*.12,R*(1-i*.13),rgba(i%2?'#ff5a1a':'#ffb03a',.4));
 circ(0,0,R*1.12,'rgba(224,64,26,.55)');circ(0,0,R*.9,'rgba(255,122,42,.85)');circ(R*.1,0,R*.66,'#ffb03a');circ(R*.18,0,R*.4,'#ffe9a0');circ(R*.22,0,R*.18,'#ffffff');
 g.fillStyle='rgba(255,170,60,.5)';for(let i=0;i<6;i++){const b=T*5+i*1.047,c=Math.cos(b),s=Math.sin(b);g.beginPath();g.moveTo(c*R*.8,s*R*.8);g.quadraticCurveTo(c*R*1.25-s*R*.3,s*R*1.25+c*R*.3,c*R*1.5,s*R*1.5);g.quadraticCurveTo(c*R*1.1+s*R*.2,s*R*1.1-c*R*.2,c*R*.8,s*R*.8);g.fill()}};
// explosion du Gôkakyû : sol roussi, anneau de feu, boule qui monte, flammes et fumée
JFXD.uc_gkboom=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r*s,ee=ezo(e);g.fillStyle=rgba('#2a1408',.35*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#ff7a2a',.85*k);g.lineWidth=10*k*s+1;g.beginPath();g.ellipse(q.x,q.y,R*(.35+.75*ee),R*(.35+.75*ee)*K,0,0,7);g.stroke();
 const H=R*.75*(1-e*.4),cy=q.y-H*.6-e*30*s;circ(q.x,cy,H*.8*k,'rgba(255,90,26,.55)');circ(q.x,cy,H*.55*k,'rgba(255,176,58,.7)');circ(q.x,cy,H*.3*k,'rgba(255,240,190,.8)');
 for(let i=0;i<10;i++){const b=i*.628,x=q.x+Math.cos(b)*R*.8*ee,y=q.y+Math.sin(b)*R*.8*ee*K,h=(26+((i*29)%20))*s*k;g.fillStyle=rgba(i%2?'#ff5a1a':'#ffb03a',.75*k);g.beginPath();g.moveTo(x-5*s,y);g.quadraticCurveTo(x,y-h*1.6,x+5*s,y);g.fill()}
 g.globalCompositeOperation='source-over';for(let i=0;i<5;i++){const b=i*1.26+.4;circ(q.x+Math.cos(b)*R*.4,cy-e*40*s-i*6*s,(12+e*14)*s,rgba('#3a3030',.3*k*e))}};
// Izanagi : reflet du ninja au point d'ancrage, horloge au sol, fil rouge jusqu'au ninja
AUXD.uc_iza=(x,k,t)=>{const u=x.ui!=null?units[x.ui]:null,q=P(x.x,x.y,0),fr=Math.max(0,x.t/x.m);g.strokeStyle=rgba('#e0304a',.35);g.lineWidth=2;gEll(x.x,x.y,30);g.stroke();
 g.strokeStyle='#ff3a4a';g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,30*q.s,30*q.s*K,0,-Math.PI/2,-Math.PI/2+fr*Math.PI*2);g.stroke();g.strokeStyle=rgba('#ff9ab0',.5);g.lineWidth=1;
 for(let i=0;i<12;i++){const b=i*.5236,c=Math.cos(b),s=Math.sin(b);g.beginPath();g.moveTo(q.x+c*24*q.s,q.y+s*24*q.s*K);g.lineTo(q.x+c*28*q.s,q.y+s*28*q.s*K);g.stroke()}
 if(u&&!u.dead){const a=P(x.x,x.y,34),b=P(u.x,u.y,34);g.strokeStyle=rgba('#ff3a4a',.45);g.setLineDash([5,6]);g.lineDashOffset=-t*30;g.lineWidth=1.5;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.setLineDash([]);
  g.globalAlpha=(.24+.08*Math.sin(t*6))*k;drawChar3(u,q.x,q.y,q.s*1.3);g.globalAlpha=1}};
// Izanagi actif : la réalité « grésille » autour du ninja (tranches rouges) et un œil se ferme peu à peu au-dessus de lui
JFXD.uc_izaon=(f,k,e,t,u)=>{if(!u||u.dead||!(u.izT>0))return;const q=P(u.x,u.y,0),s=q.s*1.3,al=Math.min(1,e*8);g.globalAlpha=al;g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const ph=(t*2.3+i*.37)%1;if(ph>.55)continue;const y=q.y-(8+((i*37+Math.floor(t*9)*13)%56))*s,w=(16+((i*23+Math.floor(t*9)*7)%14))*s;g.fillStyle=rgba(i%2?'#ff3a4a':'#ff9ab0',.35);g.fillRect(q.x-w+(i-1)*4*s,y,w*2,1.6*s)}
 g.strokeStyle=rgba('#ff3a4a',.4);g.lineWidth=1.5;g.setLineDash([4,5]);g.lineDashOffset=t*20;g.beginPath();g.ellipse(q.x,q.y-34*s,22*s,40*s,0,0,7);g.stroke();g.setLineDash([]);g.globalCompositeOperation='source-over';
 const op=Math.max(.05,k);ucEyeDraw(q.x+22*s,q.y-60*s,7*s,op*.6,t*3);g.globalAlpha=1};
// fin d'Izanagi : le ninja se brise en éclats rouges et file vers l'ancre ; un œil se ferme (le prix d'Izanagi)
JFXD.uc_izend=(f,k,e,t)=>{const a=P(f.x,f.y,34),b=P(f.x2,f.y2,34);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff3a4a',.8*k);g.lineWidth=6*k+1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
 g.globalCompositeOperation='source-over';for(let i=0;i<12;i++){const c=i*.5236+.3,d=(10+e*60)*a.s*(.6+(i%3)*.25),x=a.x+Math.cos(c)*d,y=a.y+Math.sin(c)*d*.8+e*e*30*a.s,z=(4+(i%4))*a.s*k;
  g.fillStyle=i%2?rgba('#ff5a6a',.85*k):rgba('#ffd0d8',.7*k);g.beginPath();g.moveTo(x,y-z);g.lineTo(x+z*.6,y+z*.5);g.lineTo(x-z*.5,y+z*.3);g.closePath();g.fill()}
 const c=P(f.x2,f.y2,100);g.globalAlpha=Math.min(1,k*2);g.strokeStyle='#1a0006';g.lineWidth=2.4;g.beginPath();g.moveTo(c.x-11,c.y);g.quadraticCurveTo(c.x,c.y+8,c.x+11,c.y);g.stroke();
 for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(c.x+i*5,c.y+5);g.lineTo(c.x+i*6.5,c.y+9);g.stroke()}g.globalAlpha=1};
// nuée de corbeaux (Shunshin) : out = le ninja se dissout en corbeaux, sinon ils convergent vers lui
JFXD.uc_crows=(f,k,e,t)=>{const N=12,o=f.out?e:1-e;g.lineCap='round';g.lineJoin='round';
 for(let i=0;i<N;i++){const b=f.a+Math.PI+(i/N-.5)*3.8+Math.sin(i*7.3)*.3,sp=.6+((i*37)%10)/14,d=o*120*sp,q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d*.8,30+o*70*sp+Math.sin(i)*10),s=q.s*(1+((i*13)%5)/10),fl=Math.sin(t*26+i*1.7),dir=Math.cos(b)>0?1:-1;
  g.globalAlpha=f.out?Math.min(1,k*1.6):Math.min(1,e*3+.2);g.strokeStyle='#0c0a10';g.lineWidth=2.2*s;g.beginPath();g.moveTo(q.x-8*s,q.y-(3+fl*4)*s);g.lineTo(q.x,q.y);g.lineTo(q.x+8*s,q.y-(3-fl*4)*s);g.stroke();
  g.fillStyle='#0c0a10';g.beginPath();g.ellipse(q.x,q.y+.5*s,4.5*s,2.3*s,0,0,7);g.fill();circ(q.x+dir*4.2*s,q.y-.6*s,1.8*s,'#0c0a10');circ(q.x+dir*4.6*s,q.y-.9*s,.7*s,'#ff2a3a')}
 if(f.out&&e<.5){g.globalAlpha=(1-e*2)*.5;circ(P(f.x,f.y,30).x,P(f.x,f.y,30).y,(20+e*40)*P(f.x,f.y,30).s,'#1a1020')}g.globalAlpha=1};
// Kamui : tourbillon qui aspire (départ) ou recrache (arrivée, annoncé d'avance)
JFXD.uc_kamui=(f,k,e,t)=>{const q=P(f.x,f.y,34),el=e*f.m;let R,al;
 if(f.in){R=48*(1-e*.85);al=k}else{const d=f.dl||.5;if(el<d){R=10+30*(el/d);al=.45+.35*(el/d)}else{const e2=(el-d)/(f.m-d);R=40+26*ezo(e2);al=1-e2}}
 R*=q.s;g.globalAlpha=Math.max(0,al);circ(q.x,q.y,R*.42,'rgba(16,6,24,.75)');g.lineCap='round';const rot=(f.in?1:-1)*t*9;
 for(let j=0;j<3;j++){g.strokeStyle=j===0?'#d8b8f0':j===1?'#8a3ab0':'#3a1a4a';g.lineWidth=(3.4-j*.7)*q.s;g.beginPath();for(let s=0;s<=12;s++){const r=R*s/12,b=rot+j*2.094+s*.42;const x=q.x+Math.cos(b)*r,y=q.y+Math.sin(b)*r*.78;s?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 g.strokeStyle=rgba('#c8a0e0',.4);g.lineWidth=1;g.beginPath();g.ellipse(q.x,q.y,R*1.15,R*.9,0,0,7);g.stroke();g.globalAlpha=1};
// Mangekyô qui s'ouvre au-dessus du lanceur (Amaterasu : une larme de sang coule)
JFXD.uc_mgk=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,64),R=(6+16*ezo(Math.min(1,e*4)))*q.s,y=q.y-58*q.s;g.globalAlpha=Math.min(1,k*3);
 g.globalCompositeOperation='lighter';circ(q.x,y,R*1.5,'rgba(208,26,42,.25)');g.globalCompositeOperation='source-over';ucMgk(q.x,y,R,t*4);
 if(f.blood){const L=Math.min(1,e*3)*10*q.s;g.strokeStyle='#b0101e';g.lineWidth=1.8*q.s;g.lineCap='round';g.beginPath();g.moveTo(q.x+4*q.s,q.y+2*q.s);g.lineTo(q.x+4.3*q.s,q.y+2*q.s+L);g.stroke()}g.globalAlpha=1};
// Amaterasu : gerbe de flammes noires bordées de violet qui jaillit du sol
JFXD.uc_amatb=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r*s,h=Math.min(1,e*5);g.fillStyle=rgba('#120a16',.5*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.lineWidth=1.3;
 for(let i=0;i<9;i++){const b=i*.7,d=R*(.15+((i*37)%60)/100),x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*K,H=(46+((i*53)%40))*s*h*(k*.7+.3)*(1+Math.sin(t*9+i)*.12);
  g.fillStyle='#120a16';g.beginPath();g.moveTo(x-8*s,y);g.quadraticCurveTo(x-7*s,y-H*.6,x+Math.sin(t*7+i)*5*s,y-H);g.quadraticCurveTo(x+7*s,y-H*.5,x+8*s,y);g.closePath();g.fill();g.strokeStyle=rgba('#9a4ad0',.9*k);g.stroke()}};
// flammes noires sur un ninja qui brûle (qx,qy : pieds à l'écran ; s : échelle)
function ucBlackFlames(qx,qy,s,t){g.lineWidth=1;g.strokeStyle='#8a3ab0';g.fillStyle='#120a16';
 for(let i=0;i<7;i++){const a=i*.9+t*2.2,x=qx+Math.cos(a)*13*s,ph=(t*1.3+i*.37)%1,y=qy-(4+ph*58)*s,H=(18-ph*9)*s;
  g.beginPath();g.moveTo(x-5*s,y);g.quadraticCurveTo(x-2*s,y-H*.7,x+Math.sin(t*8+i)*2*s,y-H);g.quadraticCurveTo(x+3*s,y-H*.4,x+5*s,y);g.fill();g.stroke()}
 for(let i=0;i<3;i++){const ph=(t*.9+i*.33)%1;circ(qx+Math.sin(t*3+i*2)*10*s,qy-(60+ph*30)*s,(2.2-ph*1.5)*s,'#2a1238')}}
// la brûlure d'Amaterasu se lit sur le ninja (champ uc_am synchronisé : visible aussi chez les invités)
STATD.push((u,p,S)=>{if(u.uc_am>0)ucBlackFlames(p.x,p.y,S*.96,performance.now()/1000)});
JFXD.blackfire=(f,k,e,t,u,tg)=>{if(tg&&!tg.dead){const q=P(tg.x,tg.y,0);ucBlackFlames(q.x,q.y,q.s*1.25,t)}}; // nom historique (autres kits)
// Tsukuyomi : monde rouge sous la cible, croix noire plantée derrière elle (bras de la croix à hauteur d'épaules : ils dépassent de part et d'autre), lune rouge
AUXD.uc_tsk=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,c=q.s*1.3;g.fillStyle=rgba('#a00a18',.35*k);g.beginPath();g.ellipse(q.x,q.y,80*s,80*s*K,0,0,7);g.fill();g.strokeStyle=rgba('#120408',.6*k);g.lineWidth=1.5;
 for(let i=0;i<8;i++){const b=i*.785+.2;g.beginPath();g.moveTo(q.x+Math.cos(b)*20*s,q.y+Math.sin(b)*20*s*K);g.lineTo(q.x+Math.cos(b)*76*s,q.y+Math.sin(b)*76*s*K);g.stroke()}
 const X=q.x,Y=q.y-3*c,up=Math.min(1,(x.m-x.t)/.15); // la croix surgit du sol
 g.fillStyle=rgba('#140408',.95*k);g.strokeStyle=rgba('#ff3a4a',.75*k);g.lineWidth=1.5;g.beginPath();g.rect(X-5*c,Y-76*c*up,10*c,76*c*up);g.rect(X-46*c,Y-38*c*up,92*c,8*c);g.fill();g.stroke();
 circ(q.x+58*c,q.y-118*c,11*c,rgba('#d01a2a',.8*k))};
// Tsukuyomi (devant) : Mangekyô qui tourne au-dessus de la cible, cordes rouges qui la ligotent à la croix (taille, poignets)
JFXD.uc_tsuku=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,c=s*1.3,al=Math.min(1,k*5,e*8);g.globalAlpha=al;ucMgk(q.x,q.y-132*s,15*s,-t*3);
 g.strokeStyle='rgba(220,30,50,.85)';g.lineWidth=2*s;for(const [y0,w] of[[14,12],[22,13]]){g.beginPath();g.ellipse(q.x,q.y-y0*c,w*c,4*c,0,0,7);g.stroke()}
 for(const d of[-1,1]){g.beginPath();g.ellipse(q.x+d*36*c,q.y-37*c,3.5*c,6*c,0,0,7);g.stroke()}g.globalAlpha=1};
// Susanô (derrière le ninja) : cage thoracique, épaules et crâne de chakra
AUXD.uc_susa=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s*1.3,c=x.col||'#a5f',al=k*(.85+.15*Math.sin(t*7)),cx=q.x,Y=v=>q.y-v*s;g.globalCompositeOperation='lighter';
 g.fillStyle=rgba(c,.13*al);g.beginPath();g.ellipse(cx,q.y,58*s,58*s*K,0,0,7);g.fill();g.fillStyle=rgba(c,.08*al);g.beginPath();g.ellipse(cx,Y(62),48*s,44*s,0,0,7);g.fill();
 g.strokeStyle=rgba(c,.75*al);g.lineCap='round';g.lineWidth=3.2*s;g.beginPath();g.moveTo(cx,Y(20));g.lineTo(cx,Y(92));g.stroke();g.lineWidth=2.6*s;
 for(let i=0;i<4;i++){const y=Y(84-i*13),w=(44-i*4)*s;g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx-w,y-5*s,cx-w*.86,y+15*s);g.moveTo(cx,y);g.quadraticCurveTo(cx+w,y-5*s,cx+w*.86,y+15*s);g.stroke()}
 g.lineWidth=3.4*s;g.beginPath();g.moveTo(cx-54*s,Y(84));g.quadraticCurveTo(cx,Y(100),cx+54*s,Y(84));g.stroke();circ(cx-54*s,Y(84),7*s,rgba(c,.35*al));circ(cx+54*s,Y(84),7*s,rgba(c,.35*al));
 g.fillStyle=rgba(c,.22*al);g.lineWidth=2.4*s;g.beginPath();g.ellipse(cx,Y(114),15*s,17*s,0,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(cx-13*s,Y(122));g.quadraticCurveTo(cx-22*s,Y(140),cx-10*s,Y(150));g.moveTo(cx+13*s,Y(122));g.quadraticCurveTo(cx+22*s,Y(140),cx+10*s,Y(150));g.stroke();
 g.beginPath();g.moveTo(cx-4*s,Y(108));g.lineTo(cx,Y(98));g.lineTo(cx+4*s,Y(108));g.stroke();circ(cx-6*s,Y(116),3.4*s,rgba('#ffffff',.95*al));circ(cx+6*s,Y(116),3.4*s,rgba('#ffffff',.95*al));g.globalCompositeOperation='source-over'};
// Susanô (devant) : côtes avant translucides, le ninja paraît enfermé dedans
JFXD.uc_susf=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s*1.3,c=f.col||'#a5f',al=Math.min(1,k*4,e*8)*.55,cx=q.x;g.globalCompositeOperation='lighter';g.strokeStyle=rgba(c,al);g.lineWidth=2.4*s;g.lineCap='round';
 for(let i=0;i<2;i++){const y=q.y-(70-i*16)*s,w=(40-i*5)*s;g.beginPath();g.moveTo(cx-w*.9,y-8*s);g.quadraticCurveTo(cx-w*.4,y+12*s,cx-4*s,y+14*s);g.moveTo(cx+w*.9,y-8*s);g.quadraticCurveTo(cx+w*.4,y+12*s,cx+4*s,y+14*s);g.stroke()}};
// coup de Totsuka : bras de chakra, longue lame liquide et traînée en arc ; le dernier coup laisse un sceau
JFXD.uc_totsuka=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,c=f.col||'#a5f',sw=ezo(Math.min(1,e/.45)),A=1.15,a0=f.a-A*f.dir,a1=f.a+A*f.dir,b=lerp(a0,a1,sw),L=f.last?215:190,q=P(o.x,o.y,0),s=q.s*1.3;
 g.globalCompositeOperation='lighter';g.fillStyle=rgba(c,.26*k);g.beginPath();for(let i=0;i<=10;i++){const cc=lerp(a0,b,i/10),p=P(o.x+Math.cos(cc)*L,o.y+Math.sin(cc)*L,40);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}
 for(let i=10;i>=0;i--){const cc=lerp(a0,b,i/10),p=P(o.x+Math.cos(cc)*L*.35,o.y+Math.sin(cc)*L*.35,58);g.lineTo(p.x,p.y)}g.closePath();g.fill();
 const h=P(o.x+Math.cos(b)*34,o.y+Math.sin(b)*34,84),tp=P(o.x+Math.cos(b)*L,o.y+Math.sin(b)*L,40),sh={x:q.x+(Math.cos(b)>0?1:-1)*54*s,y:q.y-84*s};g.lineCap='round';
 g.strokeStyle=rgba(c,.45*k);g.lineWidth=9*s;g.beginPath();g.moveTo(sh.x,sh.y);g.lineTo(h.x,h.y);g.stroke();g.strokeStyle=rgba(c,.6*k);g.lineWidth=12*s;g.beginPath();g.moveTo(h.x,h.y);g.lineTo(tp.x,tp.y);g.stroke();
 g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=3.5*s;g.stroke();g.globalCompositeOperation='source-over';circ(h.x,h.y+3*s,5.5*s,rgba('#b0602a',.9*k));circ(h.x,h.y-5*s,3.6*s,rgba('#c8783a',.9*k));
 if(f.last&&e>.35){const p=P(o.x+Math.cos(f.a)*120,o.y+Math.sin(f.a)*120,24),R=(16+e*36)*s;g.strokeStyle=rgba('#ffe8a0',.85*k);g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,R,R*K,0,0,7);g.stroke();
  for(let i=0;i<6;i++){const cc=i*1.047+t*2;g.fillStyle=rgba('#2a2a33',.9*k);g.fillRect(p.x+Math.cos(cc)*R*.8-2,p.y+Math.sin(cc)*R*.8*K-3,4,6)}}};
// lecture du Sharingan : reflet rouge laissé à l'endroit du coup esquivé
JFXD.uc_read=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(f.x,f.y,0);g.globalAlpha=.5*k;drawChar3(u,q.x,q.y,q.s*1.3);g.globalAlpha=1;g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#ff2a3a',.8*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y-40*q.s,(22+e*18)*q.s,(44+e*18)*q.s,0,0,7);g.stroke();
 for(let i=0;i<3;i++){const b=t*6+i*2.094;ucTomoe(q.x+Math.cos(b)*16*q.s,q.y-40*q.s+Math.sin(b)*16*q.s,2.6*q.s,b+1.57,rgba('#ff2a3a',.9*k))}};

// ---- animations 3D
Object.assign(ANIM,{
 // estoc allongé de Kusanagi : fente profonde, bras d'épée tendu
 uc_thrust:(P,e)=>{const k=e<.22?ezo(e/.22):1-.7*ezo((e-.22)/.78);P.root.z=15*k;P.root.y=-5*k;pz(P,'armR',-1.6*k-.05,0,.08*k);pz(P,'foreR',-.04);pz(P,'armL',.55*k,0,.45*k);pz(P,'foreL',-.5);
  pz(P,'chest',.42*k,-.4*k);pz(P,'spine',.1*k);pz(P,'head',-.25*k,.3*k);pz(P,'thighR',-1.05*k);pz(P,'shinR',.95*k);pz(P,'thighL',.7*k);pz(P,'shinL',.3*k);pz(P,'cape',-.6*k)},
 // lancer en éventail : le bras balaie de gauche à droite à hauteur d'épaule
 uc_fan:(P,e)=>{const k=ezo(Math.min(1,e/.35));pz(P,'armR',-1.5,0,.9-1.9*k);pz(P,'foreR',-.25);pz(P,'chest',.15,.5-1*k);pz(P,'armL',-.9,0,.5);pz(P,'foreL',-1.2);pz(P,'thighL',-.45);pz(P,'shinL',.5);pz(P,'thighR',.25);P.root.y=-2},
 // réception accroupie après le Shunshin
 uc_land:(P,e)=>{const k=1-ezio(e);P.root.y=-8*k;pz(P,'thighL',-1.15*k);pz(P,'shinL',1.9*k);pz(P,'thighR',.35*k);pz(P,'shinR',1.6*k);pz(P,'chest',.6*k);pz(P,'head',-.35*k);
  pz(P,'armR',-1.2*k,0,-.35*k);pz(P,'foreR',-.2);pz(P,'armL',.5*k,0,.7*k);pz(P,'foreL',-.2);pz(P,'cape',-1*k)},
 // regard fixe du genjutsu : tête baissée, une main en signe devant le torse
 uc_stare:(P,e)=>{const k=Math.min(1,e/.2);pz(P,'head',.22*k);pz(P,'chest',.1*k);pz(P,'armR',-1.2*k,0,.35*k);pz(P,'foreR',-1.7*k);pz(P,'armL',.15,0,.2);P.root.y=-1*k},
 // Amaterasu : une main sur l'œil qui saigne, l'autre bras tendu vers la cible
 uc_amat:(P,e)=>{const k=Math.min(1,e/.2);pz(P,'armL',-2.2*k,0,-.5*k);pz(P,'foreL',-2.3*k);pz(P,'head',.12,-.15*k,.12*k);pz(P,'armR',-1.55*k,0,.05);pz(P,'foreR',-.05);pz(P,'chest',.08,.25*k);P.root.y=-1.5*k},
 // Tsukuyomi : la victime est crucifiée (bras en croix, tête basse, pieds décollés)
 uc_cross:(P,e,u,t)=>{const k=Math.min(1,e/.1),sw=Math.sin(t*2.4)*.05;pz(P,'armL',0,0,1.5*k);pz(P,'armR',0,0,-1.5*k);pz(P,'foreL',0);pz(P,'foreR',0);pz(P,'head',.55*k+sw,0,.12*k);pz(P,'chest',.06*k,0,0);
  pz(P,'thighL',.05,0,-.05*k);pz(P,'thighR',.05,0,.05*k);pz(P,'shinL',.18*k);pz(P,'shinR',.18*k);P.root.y=4*k;pz(P,'cape',.25*k)},
 // Susanô : bras écartés, buste relevé, le chakra prend forme
 uc_susa:(P,e,u,t)=>{const k=Math.min(1,e/.15);pz(P,'armL',-.5*k,0,1.2*k);pz(P,'armR',-.5*k,0,-1.2*k);pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'chest',-.25*k);pz(P,'head',-.3*k);P.root.y=-2*k+Math.sin(t*3)*.5;
  pz(P,'thighL',0,0,.25*k);pz(P,'thighR',0,0,-.25*k);pz(P,'cape',-.8*k+Math.sin(t*6)*.1)},
});
