// ---------- Effets visuels propres au monde ninja ----------
// Chaque jutsu porte un élément (vfx) : ses projectiles, particules, zones, ondes et rayons sont dessinés selon cet élément.
let VFX=null;
const VP={kunai:['#d8dde6','#8a929e'],shuriken:['#c8ccd4','#6a707a'],senbon:['#e8eef6','#aab4c4'],tai:['#ffffff','#e8e0d0'],steel:['#d8dde6','#ffffff'],chakra:null,
 fire:['#ff7a2a','#ffd36a','#e0401a'],water:['#3aa8ff','#bfe6ff','#1a6ad0'],wind:['#c8fff0','#7fe0c0','#ffffff'],lightning:['#ffe14a','#ffffff','#9fdcff'],earth:['#a07850','#6a4a30','#c8a070'],
 sand:['#d8b878','#a88a50','#f0d8a0'],shadow:['#141418','#2a2a33'],bugs:['#26302a','#4a5a3a'],bone:['#f2efe6','#c8c2b0'],tag:['#ff9a3a','#f0e0b0','#c0302a'],smoke:['#d8d8dc','#a8a8b0'],
 genjutsu:['#e0304a','#8a3ab0','#ff9ab0'],jyuken:['#cfe0ff','#8ab0ff','#ffffff'],black:['#18101c','#5a2a7a'],fox:['#ff6a2a','#ff2a1a','#ffb04a'],heal:['#7fe07f','#cfffcf'],leaf:['#5aa83a','#8ad05a','#3a7a2a'],
 gate:['#6aff7a','#2aaa4a','#d8ffd8'],chain:['#e8c860','#b8963a']};
const DARKV={shadow:1,bugs:1,black:1};
const vcol=(v,col,i=0)=>v&&VP[v]?VP[v][i%VP[v].length]:col;
// particules
function drawPart(f,p){const v=f.vfx,k=f.t/f.m,s=p.s;
 if(!v||!VP[v]&&v!=='chakra'){g.fillStyle=f.col;g.beginPath();g.arc(p.x,p.y,f.r*s,0,7);g.fill();return}
 const c=v==='chakra'?f.col:vcol(v,f.col,(f.r*7|0));
 switch(v){
  case'fire':case'fox':{g.save();g.globalCompositeOperation='lighter';const r=f.r*s*(1.6+(1-k)*1.4);const gr=g.createRadialGradient(p.x,p.y-(1-k)*14*s,0,p.x,p.y-(1-k)*14*s,r);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.4,c);gr.addColorStop(1,rgba(v==='fox'?'#ff2a1a':'#c0301a',0));g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y-(1-k)*14*s,r,0,7);g.fill();g.restore();break}
  case'black':{g.fillStyle='#120a16';g.beginPath();g.arc(p.x,p.y-(1-k)*12*s,f.r*s*2,0,7);g.fill();g.strokeStyle='#6a2a8a';g.lineWidth=1;g.stroke();break}
  case'water':{g.fillStyle=c;g.beginPath();g.ellipse(p.x,p.y,f.r*s*.9,f.r*s*1.4,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(p.x-1,p.y-f.r*s*.6,1.5,1.5);break}
  case'wind':{const a=Math.atan2(f.vy||0,f.vx||1);g.strokeStyle=c;g.lineWidth=1.5;g.beginPath();g.moveTo(p.x-Math.cos(a)*10*s,p.y-Math.sin(a)*5*s);g.lineTo(p.x+Math.cos(a)*6*s,p.y+Math.sin(a)*3*s);g.stroke();break}
  case'lightning':{g.strokeStyle=c;g.lineWidth=1.5;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(rnd()-.5)*12*s,p.y+(rnd()-.5)*12*s);g.lineTo(p.x+(rnd()-.5)*12*s,p.y+(rnd()-.5)*12*s);g.stroke();break}
  case'earth':case'bone':{g.save();g.translate(p.x,p.y);g.rotate(f.r*3+(1-k)*6);g.fillStyle=c;const w=f.r*s*(v==='bone'?.7:1.4);g.fillRect(-w,-w*(v==='bone'?2.2:1),w*2,w*(v==='bone'?4.4:2));g.restore();break}
  case'sand':{g.fillStyle=c;g.fillRect(p.x,p.y,2*s,2*s);g.fillRect(p.x+3*s,p.y-2*s,1.5*s,1.5*s);break}
  case'leaf':{g.save();g.translate(p.x,p.y);g.rotate(f.r*5+(1-k)*8);g.fillStyle=c;g.beginPath();g.ellipse(0,0,f.r*s*1.8,f.r*s*.8,0,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=.8;g.beginPath();g.moveTo(-f.r*s*1.6,0);g.lineTo(f.r*s*1.6,0);g.stroke();g.restore();break}
  case'smoke':case'tag':{const r=f.r*s*(2+(1-k)*4);g.fillStyle=v==='tag'&&k>.6?'#ffb04a':rgba(c,.55);if(v==='tag'&&k<=.6)g.fillStyle='rgba(200,200,205,.5)';g.beginPath();g.arc(p.x,p.y-(1-k)*10*s,r,0,7);g.fill();break}
  case'bugs':{g.fillStyle=c;for(let i=0;i<3;i++)g.fillRect(p.x+(rnd()-.5)*6*s,p.y+(rnd()-.5)*6*s,1.8*s,1.8*s);break}
  case'shadow':{g.fillStyle='rgba(10,10,14,.8)';g.beginPath();g.ellipse(p.x,p.y,f.r*s*2,f.r*s,0,0,7);g.fill();break}
  case'heal':{g.fillStyle=c;g.fillRect(p.x-1,p.y-f.r*s*1.5,2,f.r*s*3);g.fillRect(p.x-f.r*s*1.5,p.y-1,f.r*s*3,2);break}
  case'genjutsu':{g.save();g.translate(p.x,p.y+(1-k)*10*s);g.rotate(f.r*4+(1-k)*3);g.fillStyle=c;g.beginPath();g.ellipse(0,0,f.r*s*2,f.r*s*.6,0,0,7);g.fill();g.restore();break}
  default:{g.save();g.globalCompositeOperation='lighter';g.fillStyle=c;g.beginPath();g.arc(p.x,p.y,f.r*s,0,7);g.fill();g.restore()}}}
// ondes (ring) et coups au corps à corps (swing)
function drawRingSwing(f){const v=f.vfx,c=v==='chakra'||!v?f.col:vcol(v,f.col),k=f.t/f.m;
 if(f.ring){const r=f.ring*(1.1-k*.6);
  if(v==='smoke'||v==='tag'||v==='sand'){g.fillStyle=rgba(vcol(v,f.col,v==='tag'?1:0),.35*k);gEll(f.x,f.y,r);g.fill();g.strokeStyle=rgba(vcol(v,f.col,1),.6*k);g.lineWidth=3;gEll(f.x,f.y,r);g.stroke();return}
  if(v==='water'){g.strokeStyle=c;g.lineWidth=3;gEll(f.x,f.y,r);g.stroke();g.lineWidth=1.5;gEll(f.x,f.y,r*.7);g.stroke();return}
  if(v==='wind'){g.strokeStyle=c;g.lineWidth=2;g.setLineDash([18,10]);g.lineDashOffset=k*60;gEll(f.x,f.y,r);g.stroke();gEll(f.x,f.y,r*.75);g.stroke();g.setLineDash([]);return}
  if(v==='fire'||v==='fox'){g.strokeStyle=c;g.lineWidth=6;gEll(f.x,f.y,r);g.stroke();g.strokeStyle=vcol(v,f.col,1);g.lineWidth=2;gEll(f.x,f.y,r*.92);g.stroke();return}
  if(v==='leaf'){g.strokeStyle=rgba('#5aa83a',.7);g.lineWidth=2;g.setLineDash([4,8]);gEll(f.x,f.y,r);g.stroke();g.setLineDash([]);return}
  g.strokeStyle=c;g.lineWidth=4;gEll(f.x,f.y,r);g.stroke();return}
 // coup : arc fin et vif pour le taijutsu, double pour les lames, crocs pour les os
 const a0=f.a-f.arc/2,a1=f.a+f.arc/2,sw=1-k;
 if(v==='tai'||v==='jyuken'){g.strokeStyle=c;g.lineWidth=2.5;for(const m of[1,.82,.64]){gEll(f.x,f.y,f.range*m,a0+sw*.2,a1-sw*.2);g.stroke()}return}
 if(v==='claws'){g.strokeStyle='#fff';g.lineWidth=2.5;for(const m of[.85,1,1.15]){gEll(f.x,f.y,f.range*m,a0+sw*.15,a1-sw*.15);g.stroke()}g.strokeStyle='rgba(200,40,40,.6)';g.lineWidth=1;gEll(f.x,f.y,f.range*1.05,a0,a1);g.stroke();return}
 if(v==='bone'){g.strokeStyle=c;g.lineWidth=7;gEll(f.x,f.y,f.range,a0,a1);g.stroke();g.strokeStyle='#8a8070';g.lineWidth=1.5;gEll(f.x,f.y,f.range*.9,a0,a1);g.stroke();return}
 if(v==='lightning'){g.strokeStyle=c;g.lineWidth=3;gEll(f.x,f.y,f.range,a0,a1);g.stroke();g.strokeStyle='#fff';g.lineWidth=1;gEll(f.x,f.y,f.range*(.9+rnd()*.15),a0,a1);g.stroke();return}
 g.strokeStyle=c;g.lineWidth=6;gEll(f.x,f.y,f.range,a0,a1);g.stroke();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.5;gEll(f.x,f.y,f.range*.96,a0,a1);g.stroke()}
// rayons (beamFx) et éclairs
function drawBeamN(f){const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30),v=f.vfx,c=v==='chakra'||!v?f.col:vcol(v,f.col),dark=DARKV[v];g.save();if(dark)g.globalCompositeOperation='source-over';g.globalAlpha=f.t/f.m;g.lineCap='round';
 if(v==='lightning'){drawBolt(a.x,a.y,b.x,b.y,c);drawBolt(a.x,a.y,b.x,b.y,'#fff');g.restore();return}
 if(v==='kirin'){for(let i=0;i<4;i++)drawBolt(a.x,a.y,b.x,b.y,i%2?'#fff':'#9fd8ff');g.lineWidth=f.w*a.s*1.4;g.strokeStyle=rgba('#bfe6ff',.5);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();const ang=Math.atan2(b.y-a.y,b.x-a.x);g.translate(b.x,b.y);g.rotate(ang);g.fillStyle='#e8f6ff';g.beginPath();g.moveTo(26,0);g.lineTo(-10,-16);g.lineTo(-4,0);g.lineTo(-10,16);g.closePath();g.fill();g.fillStyle='#ffe14a';g.fillRect(4,-6,4,3);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(-8,-14);g.lineTo(-22,-30);g.moveTo(-8,14);g.lineTo(-22,30);g.stroke();g.restore();return}
 if(v==='wind'){g.strokeStyle=rgba(c,.6);g.lineWidth=f.w*a.s;g.setLineDash([24,12]);g.lineDashOffset=-performance.now()/8;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.setLineDash([]);g.restore();return}
 if(v==='fire'){for(let i=0;i<3;i++){g.strokeStyle=vcol('fire','',i);g.lineWidth=f.w*a.s*(1-i*.3);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x+(rnd()-.5)*8,b.y+(rnd()-.5)*8);g.stroke()}g.restore();return}
 g.strokeStyle=c;g.lineWidth=f.w*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();if(!dark){g.strokeStyle='#fff';g.lineWidth=Math.max(1,f.w*a.s*.3);g.stroke()}g.restore()}
// projectiles
function drawProj(p){const v=p.vfx;if(!v)return drawProjOld(p);
 if(v==='shadow'&&p.owner&&!p.owner.dead){const a=P(p.owner.x,p.owner.y,0),b=P(p.x,p.y,0);g.strokeStyle='rgba(8,8,12,.75)';g.lineWidth=7*b.s;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
 if(p.hook&&p.ox!=null){const a=P(p.ox,p.oy,30),b=P(p.x,p.y,28);g.strokeStyle=v==='shadow'?'#141418':v==='chain'?'#e8c860':'#888';g.lineWidth=v==='shadow'?5:2.5;if(v==='chain')g.setLineDash([6,3]);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.setLineDash([])}
 const z=p.grenade?Math.sin(Math.PI*(1-p.life/p.life0))*70+15:28,q=P(p.x,p.y,z),t=performance.now();
 g.fillStyle='rgba(0,0,0,.35)';gEll(p.x,p.y,p.r*.9);g.fill();
 g.save();g.translate(q.x,q.y);g.scale(q.s,q.s);const ra=Math.atan2(p.vy*K,p.vx),R=p.r*(p.big?1.6:1),c=vcol(v,p.col),ex=p.ex;
 switch(v){
  case'kunai':g.rotate(ra);g.fillStyle='#3a3a44';g.fillRect(-14,-1.5,8,3);g.strokeStyle='#3a3a44';g.lineWidth=1.2;g.beginPath();g.arc(-16,0,2.4,0,7);g.stroke();g.fillStyle=ex?'#ffe81f':'#d8dde6';g.beginPath();g.moveTo(-6,-4);g.lineTo(10,0);g.lineTo(-6,4);g.fill();break;
  case'shuriken':{g.rotate(t/40);const L=p.saber||p.big?22:9;g.fillStyle=ex?'#ffe81f':'#b8bcc6';g.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;g.lineTo(Math.cos(a)*L,Math.sin(a)*L);g.lineTo(Math.cos(a+.785)*L*.3,Math.sin(a+.785)*L*.3)}g.closePath();g.fill();circ(0,0,L*.18,'#3a3a44');break}
  case'senbon':g.rotate(ra);g.strokeStyle=ex?'#ffe81f':'#e8eef6';g.lineWidth=1.5;g.beginPath();g.moveTo(-14,0);g.lineTo(10,0);g.stroke();break;
  case'fire':{if(p.dragon){g.rotate(ra);for(let i=9;i>=0;i--){const x=-i*7,y=Math.sin(t*14-i*.8)*5*(i/9);g.globalCompositeOperation='lighter';circ(x,y,R*(1.25-i*.07),rgba(i%2?'#ff5a1a':'#ffb03a',.75))}g.globalCompositeOperation='source-over';g.fillStyle='#ff7a2a';g.beginPath();g.ellipse(R*.8,0,R*1.5,R,0,0,7);g.fill();g.fillStyle='#ffd36a';g.beginPath();g.moveTo(R*1.8,-R*.5);g.lineTo(R*2.9,0);g.lineTo(R*1.8,R*.5);g.fill();circ(R*1.1,-R*.45,2,'#fff');g.strokeStyle='#ffd36a';g.lineWidth=2;g.beginPath();g.moveTo(R*.2,-R*.8);g.lineTo(-R*.6,-R*1.9);g.moveTo(R*.2,R*.8);g.lineTo(-R*.6,R*1.9);g.stroke();break}
   if(p.shuri){g.rotate(t*20);g.globalCompositeOperation='lighter';g.fillStyle='#ff9a3a';g.beginPath();for(let i=0;i<4;i++){const b=i*Math.PI/2;g.lineTo(Math.cos(b)*10,Math.sin(b)*10);g.lineTo(Math.cos(b+.785)*3,Math.sin(b+.785)*3)}g.closePath();g.fill();circ(0,0,2.5,'#fff3c0');break}
   g.rotate(ra);for(let i=3;i>=1;i--){circ(-i*R*.9+(rnd()-.5)*2,(rnd()-.5)*3,R*(1.1-i*.18),rgba(vcol('fire','',i),.55))}const gr=g.createRadialGradient(0,0,0,0,0,R*1.5);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.45,'#ffb03a');gr.addColorStop(1,'rgba(224,64,26,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,R*1.5,0,7);g.fill();break}
  case'water':{g.rotate(ra);if(p.jn&&/Dragon/.test(p.jn)){const L=70;for(let i=10;i>=0;i--){const x=-i*L/10,y=Math.sin(t*12-i*.7)*6*(i/10);circ(x,y,R*(1.6-i*.08),i%2?'#2a7ad0':'#3aa8ff')}g.fillStyle='#3aa8ff';g.beginPath();g.ellipse(R*1.2,0,R*2.2,R*1.4,0,0,7);g.fill();g.fillStyle='#bfe6ff';g.beginPath();g.moveTo(R*2.6,-R*.6);g.lineTo(R*4,0);g.lineTo(R*2.6,R*.6);g.fill();circ(R*1.6,-R*.6,1.8,'#fff');g.strokeStyle='#bfe6ff';g.lineWidth=1.5;g.beginPath();g.moveTo(R*.4,-R);g.lineTo(-R*.8,-R*2.4);g.moveTo(R*.4,R);g.lineTo(-R*.8,R*2.4);g.stroke();break}if(p.saber){g.fillStyle='#2a7ad0';g.beginPath();g.ellipse(0,0,R*2.6,R*1.1,0,0,7);g.fill();g.beginPath();g.moveTo(-R*2.2,0);g.lineTo(-R*3.6,-R*1.2);g.lineTo(-R*3.2,R*1.1);g.fill();g.beginPath();g.moveTo(0,-R);g.lineTo(-R*.8,-R*2.2);g.lineTo(-R*1.2,-R);g.fill();circ(R*1.5,-R*.3,1.5,'#fff');break}
   for(let i=1;i<4;i++)circ(-i*R*1.2,0,R*(.6-i*.12),rgba('#7fc8ff',.6));g.fillStyle='#3aa8ff';g.beginPath();g.ellipse(0,0,R*1.4,R,0,0,7);g.fill();circ(R*.4,-R*.35,R*.3,'rgba(255,255,255,.8)');break}
  case'wind':{g.rotate(ra);g.strokeStyle=ex?'#ffe81f':'#d8fff4';g.lineWidth=3;const L=p.saber||p.big?26:16;g.beginPath();g.arc(-L*.6,0,L,-1.1,1.1);g.stroke();g.strokeStyle='rgba(127,224,192,.6)';g.lineWidth=1.5;g.beginPath();g.arc(-L,0,L,-.9,.9);g.stroke();break}
  case'lightning':{g.globalCompositeOperation='lighter';circ(0,0,R*1.3,rgba('#ffe14a',.55));circ(0,0,R*.7,'#fff');g.strokeStyle='#fff6a0';g.lineWidth=1.5;for(let i=0;i<3;i++){const a=rnd()*7;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*R*1.6,Math.sin(a)*R*1.6);g.lineTo(Math.cos(a+.4)*R*2.4,Math.sin(a+.4)*R*2.4);g.stroke()}break}
  case'earth':case'bone':{g.rotate(p.rot||t/200);if(v==='bone'){g.fillStyle='#f2efe6';g.fillRect(-R*1.8,-R*.35,R*3.6,R*.7);circ(-R*1.8,0,R*.5,'#f2efe6');circ(R*1.8,0,R*.5,'#f2efe6');break}
   g.fillStyle='#7a5a3a';g.beginPath();g.moveTo(-R,-R*.6);g.lineTo(-R*.2,-R*1.1);g.lineTo(R,-R*.4);g.lineTo(R*.8,R*.8);g.lineTo(-R*.6,R);g.closePath();g.fill();g.fillStyle='#a07850';g.beginPath();g.moveTo(-R*.6,-R*.5);g.lineTo(-R*.1,-R*.8);g.lineTo(R*.5,-R*.3);g.lineTo(-R*.2,0);g.fill();break}
  case'sand':for(let i=0;i<9;i++){const a=t/120+i*.7,d=R*(.4+(i%3)*.4);circ(Math.cos(a)*d,Math.sin(a)*d*.7,R*.35,vcol('sand','',i))}break;
  case'shadow':g.rotate(ra);g.fillStyle='#141418';g.beginPath();g.ellipse(0,0,R*2,R*.8,0,0,7);g.fill();break;
  case'bugs':for(let i=0;i<10;i++){g.fillStyle=i%2?'#26302a':'#4a5a3a';g.fillRect((rnd()-.5)*R*3,(rnd()-.5)*R*2,1.8,1.8)}break;
  case'tag':{g.rotate(ra);g.fillStyle='#f0e0b0';g.fillRect(-7,-4,14,8);g.strokeStyle='#c0302a';g.lineWidth=1.2;g.beginPath();g.moveTo(-4,-2);g.lineTo(4,2);g.moveTo(-4,2);g.lineTo(0,-2);g.stroke();if(Math.sin(t/60)>0)circ(-8,0,2.5,'#ffb04a');break}
  case'smoke':circ(0,0,R*1.4,'rgba(220,220,225,.8)');circ(-R*.6,-R*.3,R,'rgba(200,200,205,.8)');break;
  case'genjutsu':g.rotate(ra);g.fillStyle='#8a3ab0';g.beginPath();g.ellipse(0,0,R*1.6,R*.6,0,0,7);g.fill();circ(R*.4,0,R*.45,'#e0304a');circ(R*.4,0,R*.18,'#111');break;
  case'black':g.fillStyle='#120a16';g.beginPath();g.arc(0,0,R*1.3,0,7);g.fill();g.strokeStyle='#7a3aa0';g.lineWidth=1.5;g.stroke();break;
  case'jyuken':g.globalCompositeOperation='lighter';g.rotate(ra);g.strokeStyle='#cfe0ff';g.lineWidth=2;for(const m of[1,.7,.4]){g.beginPath();g.arc(-R*2*(1-m),0,R*1.6*m,-1.2,1.2);g.stroke()}break;
  case'chain':g.rotate(ra);g.strokeStyle='#e8c860';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(-i*7,0,4,2.4,0,0,7);g.stroke()}g.fillStyle='#e8c860';g.beginPath();g.moveTo(2,-4);g.lineTo(9,0);g.lineTo(2,4);g.fill();break;
  case'heal':g.globalCompositeOperation='lighter';circ(0,0,R*1.2,rgba('#7fe07f',.6));g.fillStyle='#fff';g.fillRect(-1,-R*.8,2,R*1.6);g.fillRect(-R*.8,-1,R*1.6,2);break;
  default:{g.globalCompositeOperation='lighter';const cc=v==='chakra'?p.col:c;if(p.saber||p.big||R>7){g.rotate(t/50);const gr=g.createRadialGradient(0,0,0,0,0,R*1.8);gr.addColorStop(0,'#fff');gr.addColorStop(.5,cc);gr.addColorStop(1,rgba(cc,0));g.fillStyle=gr;g.beginPath();g.arc(0,0,R*1.8,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.2;for(let i=0;i<3;i++){g.beginPath();g.arc(0,0,R*(.6+i*.35),i*2,i*2+2.2);g.stroke()}}
   else{g.rotate(ra);g.lineCap='round';g.strokeStyle=ex?'#ffe81f':cc;g.lineWidth=R;g.beginPath();g.moveTo(-14,0);g.lineTo(6,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=R/2.5;g.stroke()}}}
 g.restore()}
// zones au sol laissées par les jutsu
function drawFieldN(f,t){const v=f.vfx;if(!v||f.pet||f.spinner||f.dome)return false;const c=vcol(v,f.col),k=Math.min(1,f.t/.5);
 const dark=DARKV[v];g.fillStyle=rgba(dark?'#101014':c,(dark?.45:.16)*k);gEll(f.x,f.y,f.r);g.fill();g.strokeStyle=rgba(c,.5*k);g.lineWidth=2;gEll(f.x,f.y,f.r);g.stroke();
 const seed=(f.x*7+f.y*13)|0,n=Math.min(14,4+f.r/14|0);
 for(let i=0;i<n;i++){const a=i*2.4+seed,d=f.r*(.2+((i*37+seed)%70)/100),x=f.x+Math.cos(a+t*(v==='sand'||v==='wind'||v==='bugs'?1.2:.1))*d,y=f.y+Math.sin(a+t*(v==='sand'||v==='wind'||v==='bugs'?1.2:.1))*d*.8,q=P(x,y,4);
  switch(v){case'fire':case'black':case'fox':{const h=(8+Math.sin(t*9+i)*4)*q.s;g.fillStyle=v==='black'?'#120a16':i%2?'#ffb03a':'#ff5a1a';g.beginPath();g.moveTo(q.x-4*q.s,q.y);g.quadraticCurveTo(q.x,q.y-h*2,q.x+4*q.s,q.y);g.fill();break}
   case'smoke':case'genjutsu':circ(q.x,q.y-8*q.s,(10+Math.sin(t*2+i)*3)*q.s,v==='genjutsu'?rgba('#8a3ab0',.25):'rgba(210,210,215,.35)');break;
   case'water':g.strokeStyle='rgba(191,230,255,.6)';g.lineWidth=1;g.beginPath();g.ellipse(q.x,q.y,(4+((t*6+i)%8))*q.s,(2+((t*6+i)%8)*.5)*q.s,0,0,7);g.stroke();break;
   case'heal':{const yy=q.y-((t*30+i*9)%30)*q.s;g.fillStyle='rgba(127,224,127,.8)';g.fillRect(q.x-1,yy-4,2,8);g.fillRect(q.x-4,yy-1,8,2);break}
   case'lightning':if(rnd()<.3){g.strokeStyle='#fff6a0';g.lineWidth=1;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x+(rnd()-.5)*14,q.y-rnd()*10);g.stroke()}break;
   default:g.fillStyle=vcol(v,f.col,i);g.fillRect(q.x,q.y,2.5*q.s,2.5*q.s)}}
 return true}

function drawWallN(w){const p=P(w.x,w.y),rx=w.r*p.s,h=60*p.s,t=performance.now()/1000;
 if(w.vfx==='fire'||w.burn){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=p.x+(i-1.5)*rx*.6,hh=h*(.6+Math.sin(t*9+i+w.x)*.25);const gr=g.createLinearGradient(0,p.y-hh,0,p.y);gr.addColorStop(0,'rgba(255,120,40,0)');gr.addColorStop(.6,'rgba(255,140,40,.7)');gr.addColorStop(1,'rgba(255,240,180,.9)');g.fillStyle=gr;g.beginPath();g.moveTo(x-rx*.45,p.y);g.quadraticCurveTo(x,p.y-hh*1.4,x+rx*.45,p.y);g.fill()}g.restore();return true}
 if(w.vfx==='wind'||w.wind){g.save();g.strokeStyle='rgba(220,255,245,.65)';g.lineWidth=2;for(let i=0;i<4;i++){const y=p.y-h*(i/4)-((t*60+i*11)%15)*p.s;g.beginPath();g.ellipse(p.x,y,rx*1.1,4*p.s,0,t*6+i,t*6+i+4);g.stroke()}g.fillStyle='rgba(200,255,240,.12)';g.fillRect(p.x-rx,p.y-h,rx*2,h);g.restore();return true}
 return false}
