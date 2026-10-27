// ---------- Décor : Konoha au crépuscule ----------
function drawSky(){
 const T=THEME(),mp=CFG.map|0,sk=g.createLinearGradient(0,0,0,H*.7);sk.addColorStop(0,T.sky[0]);sk.addColorStop(.45,T.sky[1]);sk.addColorStop(1,T.sky[2]);g.fillStyle=sk;g.fillRect(0,0,W,H);
 const t=performance.now()/1000;
 circ(1010,150,70,'rgba(255,214,140,.9)');circ(1010,150,95,'rgba(255,200,120,.18)');
 g.fillStyle='rgba(255,230,210,.35)';for(let i=0;i<4;i++){const x=((t*(6+i*3)+i*420)%1700)-200,y=60+i*38;g.beginPath();g.ellipse(x,y,90-i*10,12,0,0,7);g.ellipse(x+50,y-6,60,10,0,0,7);g.fill()}
 if(mp===1){drawValley();return}if(mp===2){drawDesert();return}
 // montagne des Hokage
 g.fillStyle='#5a3e3a';g.beginPath();g.moveTo(0,330);g.lineTo(120,250);g.lineTo(260,215);g.lineTo(420,195);g.lineTo(600,190);g.lineTo(780,205);g.lineTo(930,235);g.lineTo(1100,260);g.lineTo(1280,300);g.lineTo(1280,H);g.lineTo(0,H);g.fill();
 g.fillStyle='#6e4c44';for(let i=0;i<4;i++){const x=330+i*150;g.beginPath();g.ellipse(x,262,42,52,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-22,250,14,5);g.fillRect(x+8,250,14,5);g.fillRect(x-10,280,20,4);g.fillStyle='#6e4c44'}
 g.fillStyle='#2e3a2a';for(let x=0;x<W;x+=34){const h=28+((x*37)%23);g.beginPath();g.moveTo(x-20,330);g.lineTo(x,330-h);g.lineTo(x+20,330);g.fill()}
}
function drawFloor(x0,y0,x1,y1,step){
 const tl=P(x0,y0),tr=P(x1,y0),br=P(x1,y1),bl=P(x0,y1);
 const T=THEME(),fg=g.createLinearGradient(0,tl.y,0,bl.y);fg.addColorStop(0,T.floor[0]);fg.addColorStop(1,T.floor[1]);poly([tl,tr,br,bl],fg);
 g.strokeStyle=T.line;g.lineWidth=1;
 for(let x=Math.ceil(x0/step)*step;x<=x1;x+=step){const a=P(x,y0),b=P(x,y1);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
 for(let y=Math.ceil(y0/step)*step;y<=y1;y+=step){const a=P(x0,y),b=P(x1,y);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
 g.fillStyle=(CFG.map|0)===1?'rgba(220,240,255,.14)':(CFG.map|0)===2?'rgba(150,100,40,.16)':'rgba(120,90,50,.18)';for(let x=Math.ceil(x0/step)*step;x<x1;x+=step)for(let y=Math.ceil(y0/step)*step;y<y1;y+=step)if(((x*7+y*13)/step)%5<1){const p=P(x+step*.4,y+step*.5);g.beginPath();g.ellipse(p.x,p.y,step*.3*p.s,step*.12*p.s,0,0,7);g.fill()}
 return[tl,tr,br,bl];
}
function backWall(x0,x1,y){const B2=70,a=P(x0,y),b=P(x1,y),up=(p,h)=>({x:p.x,y:p.y-h*p.s});
 const T=THEME(),wg=g.createLinearGradient(0,a.y-B2,0,a.y);wg.addColorStop(0,T.wall[0]);wg.addColorStop(1,T.wall[1]);poly([a,b,up(b,B2),up(a,B2)],wg);
 g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;for(let x=Math.ceil(x0/40)*40;x<x1;x+=40){const q=P(x,y);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x,q.y-B2*q.s);g.stroke()}
 g.fillStyle='#8a5a30';poly([up(a,B2),up(b,B2),up(b,B2-8),up(a,B2-8)]);g.fill()}
// poteaux d'entraînement (arène) et arbres (bataille)
function drawObst(pl){
 const p=P(pl.x,pl.y),rx=pl.r*p.s,ry=rx*K;
 g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(p.x+10*p.s,p.y+6,rx*1.3,ry*1.3,0,0,7);g.fill();
 if(pl.rock&&(CFG.map|0)!==0){const T=THEME(),h=48*p.s,gr=g.createLinearGradient(p.x-rx,0,p.x+rx,0);gr.addColorStop(0,T.post[2]);gr.addColorStop(.4,T.post[1]);gr.addColorStop(1,T.post[0]);g.fillStyle=gr;g.beginPath();g.moveTo(p.x-rx,p.y);g.lineTo(p.x-rx*.8,p.y-h*.8);g.lineTo(p.x-rx*.2,p.y-h);g.lineTo(p.x+rx*.7,p.y-h*.85);g.lineTo(p.x+rx,p.y);g.closePath();g.fill();g.fillStyle=T.post[3];g.beginPath();g.moveTo(p.x-rx*.8,p.y-h*.8);g.lineTo(p.x-rx*.2,p.y-h);g.lineTo(p.x+rx*.7,p.y-h*.85);g.lineTo(p.x+rx*.1,p.y-h*.7);g.fill();return}
 if(pl.rock){const tr=rx*.45,h=70*p.s,gr=g.createLinearGradient(p.x-tr,0,p.x+tr,0);gr.addColorStop(0,'#3a2414');gr.addColorStop(.4,'#6a4426');gr.addColorStop(1,'#2a180c');
  g.fillStyle=gr;g.fillRect(p.x-tr,p.y-h,tr*2,h);
  for(const [ox,oy,r,c] of[[0,-h-20*p.s,rx*1.35,'#2e4a22'],[-rx*.6,-h,rx*1.05,'#38582a'],[rx*.6,-h-6*p.s,rx,'#355426'],[0,-h-38*p.s,rx*.9,'#44682e']]){g.fillStyle=c;g.beginPath();g.ellipse(p.x+ox,p.y+oy,r,r*.85,0,0,7);g.fill()}
  return}
 const T=THEME(),h=105*p.s,gr=g.createLinearGradient(p.x-rx,0,p.x+rx,0);gr.addColorStop(0,T.post[0]);gr.addColorStop(.35,T.post[1]);gr.addColorStop(1,T.post[2]);
 g.fillStyle=gr;g.fillRect(p.x-rx,p.y-h,rx*2,h);g.beginPath();g.ellipse(p.x,p.y,rx,ry,0,0,Math.PI);g.fill();
 if((CFG.map|0)===0){g.fillStyle='#d8c08a';for(const k of[.35,.62])g.fillRect(p.x-rx,p.y-h*k,rx*2,4*p.s)}
 g.fillStyle=T.post[3];g.beginPath();g.ellipse(p.x,p.y-h,rx,ry,0,0,7);g.fill();
 g.strokeStyle='#7a5430';g.lineWidth=1.5;for(const k of[.75,.5,.25]){g.beginPath();g.ellipse(p.x,p.y-h,rx*k,ry*k,0,0,7);g.stroke()}
}
// pilule du soldat (soin)
function drawHolo(x,y,big){const t=performance.now()/300,p=P(x,y,30+Math.sin(t)*6);g.fillStyle='rgba(255,200,120,.15)';gEll(x,y,26);g.fill();
 g.save();g.shadowColor='#fc6';g.shadowBlur=22;g.translate(p.x,p.y);g.rotate(Math.sin(t)*.4);const s=big?10:7;g.fillStyle='#8a5a2a';g.beginPath();g.ellipse(0,0,s*1.4,s,0,0,7);g.fill();g.fillStyle='#c8e070';g.beginPath();g.ellipse(-s*.4,-s*.25,s*.6,s*.35,0,0,7);g.fill();g.restore()}
// clones / chiens ninja / marionnettes : une copie translucide du lanceur
function drawTurret(tu){const p=P(tu.x,tu.y),oc=tu.oc||(tu.owner&&tu.owner.c);g.fillStyle='rgba(0,0,0,.35)';gEll(tu.x,tu.y,13);g.fill();
 if(oc&&CH[oc]){const f=tu.fk&&tu.fk.c===oc?tu.fk:(tu.fk=mkUnit(oc,0,0,tu.team));f.aim=tu.aim||0;f.walk=performance.now()/80;f.moving=!!tu.follow;g.globalAlpha=.75;drawChar(f,p.x,p.y,p.s*1.15*(tu.big?1.2:1));g.globalAlpha=1;
  if(tu.t<.4||tu.t>7.6){g.fillStyle='rgba(235,235,240,.6)';for(let i=0;i<5;i++){g.beginPath();g.arc(p.x+(i-2)*9,p.y-30+((i*7)%11),11,0,7);g.fill()}}}
 else circ(p.x,p.y-20,8,tu.col)}
function drawWall(w){const p=P(w.x,w.y),rx=w.r*p.s,h=60*p.s,gr=g.createLinearGradient(0,p.y-h,0,p.y);gr.addColorStop(0,'#8a6a48');gr.addColorStop(1,'#5a4028');g.fillStyle=gr;g.fillRect(p.x-rx,p.y-h,rx*2,h);
 g.strokeStyle=player&&w.team===player.team?'rgba(90,180,255,.7)':'rgba(255,90,90,.7)';g.lineWidth=1.5;g.strokeRect(p.x-rx,p.y-h,rx*2,h);g.strokeStyle='rgba(0,0,0,.3)';g.beginPath();g.moveTo(p.x-rx*.5,p.y-h);g.lineTo(p.x-rx*.3,p.y);g.moveTo(p.x+rx*.4,p.y-h);g.lineTo(p.x+rx*.2,p.y);g.stroke()}

// Vallée de la Fin : deux statues géantes face à face et la cascade
function drawValley(){g.fillStyle='#3a4a5a';g.beginPath();g.moveTo(0,300);g.lineTo(200,180);g.lineTo(360,200);g.lineTo(420,330);g.lineTo(0,H);g.fill();g.beginPath();g.moveTo(W,300);g.lineTo(W-200,180);g.lineTo(W-360,200);g.lineTo(W-420,330);g.lineTo(W,H);g.fill();
 for(const [x,f] of[[300,1],[W-300,-1]]){g.fillStyle='#5a5a66';g.beginPath();g.moveTo(x-50,330);g.lineTo(x-40,170);g.lineTo(x+40,170);g.lineTo(x+50,330);g.fill();circ(x,150,30,'#6a6a76');g.fillStyle='#4a4a56';g.fillRect(x-34,142,68,8);g.fillStyle='#5a5a66';g.fillRect(x+f*30,190,f*40,14)}
 const t=performance.now()/1000,wg=g.createLinearGradient(0,200,0,340);wg.addColorStop(0,'rgba(220,240,255,.9)');wg.addColorStop(1,'rgba(120,180,230,.6)');g.fillStyle=wg;g.fillRect(560,200,160,140);
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;for(let i=0;i<8;i++){const x=570+i*20,y=200+((t*120+i*37)%140);g.beginPath();g.moveTo(x,y);g.lineTo(x,y+18);g.stroke()}}
// Désert de Suna : dunes et dômes du village
function drawDesert(){g.fillStyle='#c8905a';g.beginPath();g.moveTo(0,320);for(let x=0;x<=W;x+=40)g.lineTo(x,300-Math.sin(x/170)*24-Math.sin(x/61)*6);g.lineTo(W,H);g.lineTo(0,H);g.fill();
 for(const [x,r] of[[200,46],[290,34],[960,52],[1060,38],[1150,30]]){g.fillStyle='#d8b078';g.fillRect(x-r,300-r*.9,r*2,r*.9);g.beginPath();g.arc(x,300-r*.9,r,Math.PI,0);g.fill();g.fillStyle='rgba(90,60,30,.5)';g.fillRect(x-r*.25,300-r*.6,r*.5,r*.4)}
 circ(1010,140,60,'rgba(255,240,200,.9)')}
