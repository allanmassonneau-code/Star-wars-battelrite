// ---------- Rythme Naruto : chakra, mudras, combo, endurance ----------
const GSPEED=.8; // tout le jeu tourne à 80 % : combats plus lisibles
const CKCOST={D:10,C:16,B:21,A:28,S:36},MUDRAS={D:2,C:3,B:4,A:5,S:6},MUDRA_T=.13;
// coût en chakra d'un jutsu (les ultimes coûtent 14 de plus) : une jauge pleine = 5 jutsu environ
const jcost=ab=>ab&&ab.rank?CKCOST[ab.rank]+(ab.ult?14:0):0;
let COMBO3=false; // vrai pendant le 5e coup du combo corps à corps (petit étourdissement)
// attaque de base = toujours au corps à corps : combo de 5 coups (20 d'endurance chacun = un combo complet) ; toutes les armes des styles sont de mêlée
// (le moteur garde le cas « distance » : 10 d'endurance par tir, sans combo, pour une arme hors de cette liste)
const MELEEK=new Set(['fist','bigfist','palm','claws','bone','sword','kunai','shadow','bugs','chain','senbon','sand','puppet','vine','fan','gold','paper','shuriken','ice']);
const meleeU=u=>MELEEK.has(u.ch.look.weapon.k);
function drawFlowN(u,p,S,sk){const t=performance.now()/1000,col=u.ch.look.weapon.col||'#3af';
 // recharge de chakra (R) : aura toujours bleue — lueur au sol, onde qui s'élargit, flammes de chakra autour du corps, étincelles aspirées, éclat quand la jauge est pleine
 if(u.chk&&!u.dead){const B1='#3a9bff',B2='#8fd0ff',H=110*S*sk,pl=.5+.5*Math.sin(t*9),full=u.energy>=99.5;g.save();g.globalCompositeOperation='lighter';
  {const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,46*S);gr.addColorStop(0,rgba(B1,.55));gr.addColorStop(1,rgba(B1,0));g.fillStyle=gr;g.beginPath();g.ellipse(p.x,p.y,46*S,17*S,0,0,7);g.fill()}
  for(let j=0;j<2;j++){const k=(t*1.3+j*.5)%1;g.strokeStyle=rgba(B2,.7*(1-k));g.lineWidth=(3-2*k)*S;g.beginPath();g.ellipse(p.x,p.y,(18+44*k)*S,(7+16*k)*S,0,0,7);g.stroke()}
  {const gr=g.createLinearGradient(0,p.y,0,p.y-H);gr.addColorStop(0,rgba(B1,.3+.12*pl));gr.addColorStop(.6,rgba(B1,.12));gr.addColorStop(1,rgba(B1,0));g.fillStyle=gr;g.beginPath();g.moveTo(p.x-24*S,p.y);
   for(let i=0;i<=10;i++){const f=i/10,w=24*S*(1-f*.55),y=p.y-H*f-Math.max(0,Math.sin(t*14+i*1.7))*12*S*f;g.lineTo(p.x-w+Math.sin(t*7+i)*3*S,y)}
   for(let i=10;i>=0;i--){const f=i/10,w=24*S*(1-f*.55),y=p.y-H*f-Math.max(0,Math.sin(t*13+i*2.1))*12*S*f;g.lineTo(p.x+w+Math.sin(t*6+i)*3*S,y)}g.closePath();g.fill()}
  for(let i=0;i<14;i++){const a=i*.449+t*2.4,k=(t*1.5+i/14)%1,r=(20-6*k)*S,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*6*S-k*H;g.fillStyle=rgba(i%3?B1:'#d8f0ff',.75*(1-k));g.beginPath();g.moveTo(x-4*S,y);g.quadraticCurveTo(x,y-14*S,x+4*S,y);g.fill()}
  for(let i=0;i<8;i++){const a=i*.785+t*.9,k=1-(t*1.8+i/8)%1,x=p.x+Math.cos(a)*70*S*k,y=p.y-40*S*sk+Math.sin(a)*34*S*k;g.fillStyle=rgba(B2,.9*(1-k*.6));g.beginPath();g.arc(x,y,(1.6+1.4*(1-k))*S,0,7);g.fill()}
  if(full){g.strokeStyle=rgba('#ffffff',.5+.4*pl);g.lineWidth=2*S;g.beginPath();g.ellipse(p.x,p.y-H*.5,30*S,H*.62,0,0,7);g.stroke()}
  g.restore()}
 if(u.cast&&!u.dead){const ab=castAb(u,u.cast),n=ab&&ab.mud||0;if(n){const done=Math.min(n,Math.floor(u.cast.t/u.cast.dur*n)+1),y=p.y-112*S*sk;
  for(let i=0;i<n;i++){const x=p.x+(i-(n-1)/2)*10;g.save();g.translate(x,y);g.rotate(.785);g.fillStyle=i<done?col:'rgba(0,0,0,.5)';g.strokeStyle='#fff';g.lineWidth=1;g.fillRect(-3,-3,6,6);g.strokeRect(-3,-3,6,6);g.restore()}const md=mudraOf(u);if(md){g.save();g.font='bold 11px sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.6)';g.fillText(md.sg[0],p.x+1,y-9);g.fillStyle=md.q<.3?'#fff':col;g.fillText(md.sg[0],p.x,y-10);g.restore()}}}
 if(u===player&&u.cmbT>0&&u.cmb){for(let i=0;i<5;i++){const x=p.x+(i-2)*11,y=p.y+16*S;g.fillStyle=i<u.cmb?(u.cmb===5?'#ffd36a':'#fff'):'rgba(0,0,0,.4)';g.beginPath();g.arc(x,y,3.5,0,7);g.fill()}}}

// ---------- Fluidité : accélération, mémoire des touches, caméra ----------
const ACCEL=30; // le ninja prend et perd sa vitesse en un éclair, sans à-coups
// déplacement posé (ambiance NRP : course 10 % plus lente qu'avant) et sprint (Maj maintenue) : plus rapide, consomme l'endurance
const SPD_K=1,SPRINT_K=1.45,SPRINT_COST=22,RUN_REGEN=26;
// mémoire des touches : un jutsu demandé pendant un coup, une incantation ou une fin de recharge part dès que possible
function tryUse(u,i,td,ex){if(use(u,i,td,undefined,ex)){u.buf=null;return true}const ab=u.ch.abil[i];
 if(ab&&u.energy>=jcost(ab)&&!(u.silence>0)&&(u.cast||u.dash||u.swing>0||u.spin||u.stun>0&&u.stun<.25||(u.cds[i]>0&&u.cds[i]<.35)))u.buf={i,t:.35,ex};return false}
function bufTick(u,dt,td,I){if(I.l||I.p.lmb){if(!use(u,0,td)&&I.p.lmb&&u.stam>=(meleeU(u)?20:10)-.01)u.bufL=.28}else if(u.bufL>0){u.bufL-=dt;if(use(u,0,td))u.bufL=0}
 if(!u.buf)return;u.buf.t-=dt;const ab=u.ch.abil[u.buf.i];if(u.buf.t<=0||!ab||u.energy<jcost(ab)){u.buf=null;return}if(use(u,u.buf.i,td,undefined,u.buf.ex))u.buf=null}
// parade parfaite : durée de la fenêtre, étourdissement infligé, garde indisponible ensuite
const PARRY_WIN=.3,PARRY_STUN=1.3,PARRY_LOCK=5;
