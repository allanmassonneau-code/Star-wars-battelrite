// ---------- Rythme Naruto : chakra, mudras, combo, endurance ----------
const GSPEED=.8; // tout le jeu tourne à 80 % : combats plus lisibles
const CKCOST={D:8,C:12,B:16,A:22,S:30},MUDRAS={D:2,C:3,B:4,A:5,S:6},MUDRA_T=.13;
// coût en chakra d'un jutsu (les ultimes coûtent 12 de plus)
const jcost=ab=>ab&&ab.rank?CKCOST[ab.rank]+(ab.ult?12:0):0;
let COMBO3=false; // vrai pendant le 5e coup du combo corps à corps (petit étourdissement)
// corps à corps : combo de 5 coups (20 d'endurance chacun = un combo complet) ; distance : 10 d'endurance par tir, sans combo
const MELEEK=new Set(['fist','bigfist','palm','claws','bone','sword']);
const meleeU=u=>MELEEK.has(u.ch.look.weapon.k);
function drawFlowN(u,p,S,sk){const t=performance.now()/1000,col=u.ch.look.weapon.col||'#3af';
 if(u.chk&&!u.dead){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(col,.6);g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,(26+Math.sin(t*10)*3)*S,(10+Math.sin(t*10))*S,0,0,7);g.stroke();
  for(let i=0;i<8;i++){const a=i*.785+t*2,k=(t*1.6+i/8)%1,x=p.x+Math.cos(a)*16*S,y=p.y-k*70*S;g.fillStyle=rgba(col,.55*(1-k));g.beginPath();g.moveTo(x-4*S,y);g.quadraticCurveTo(x,y-12*S,x+4*S,y);g.fill()}g.restore()}
 if(u.cast&&!u.dead){const ab=castAb(u,u.cast),n=ab&&ab.rank?MUDRAS[ab.rank]:0;if(n){const done=Math.min(n,Math.floor(u.cast.t/u.cast.dur*n)+1),y=p.y-112*S*sk;
  for(let i=0;i<n;i++){const x=p.x+(i-(n-1)/2)*10;g.save();g.translate(x,y);g.rotate(.785);g.fillStyle=i<done?col:'rgba(0,0,0,.5)';g.strokeStyle='#fff';g.lineWidth=1;g.fillRect(-3,-3,6,6);g.strokeRect(-3,-3,6,6);g.restore()}}}
 if(u===player&&u.cmbT>0&&u.cmb){for(let i=0;i<5;i++){const x=p.x+(i-2)*11,y=p.y+16*S;g.fillStyle=i<u.cmb?(u.cmb===5?'#ffd36a':'#fff'):'rgba(0,0,0,.4)';g.beginPath();g.arc(x,y,3.5,0,7);g.fill()}}}
