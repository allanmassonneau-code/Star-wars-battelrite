// ---------- Jutsu signature : animations propres à chaque technique célèbre ----------
// Au lancement, JFX[vfx](u,a,td,pre) ajoute des effets « jfx » (purement visuels) qui suivent le lanceur ou la cible.
Object.assign(VP,{rasengan:['#7fc8ff','#ffffff','#3a8aff'],chidori:['#bfe6ff','#ffffff','#7fd0ff'],kirin:['#bfe6ff','#ffffff','#ffe14a'],hiraishin:['#ffe14a','#ffffff'],rasenshuriken:['#c8fff0','#9fd8ff','#ffffff'],
 tsukuyomi:['#d01a2a','#3a0a0a'],susano:null,byakugan:['#cfe0ff','#8ab0ff'],kaiten:['#cfe0ff','#ffffff'],hakke64:['#cfe0ff','#8ab0ff','#ffffff'],sandcoffin:['#d8b878','#a88a50','#f0d8a0'],mind:['#c080ff','#ffffff'],
 flower:['#ff9ac8','#ffd8e8','#ffffff'],seal:['#e8c860','#2a2a33'],gatsuga:['#d8d8e0','#a0a0a8','#ffffff'],peacock:['#ff8a2a','#ffd36a','#ff4a2a'],sage:['#e8a020','#8ad05a'],claws:['#ffffff','#e0d0c0']});
Object.assign(VSND,{rasengan:{'*':'rasengan'},chidori:{'*':'chidori'},kirin:{'*':'chidori',boom:'boom'},hiraishin:{'*':'chidori'},rasenshuriken:{'*':'rasengan',boom:'boom'},tsukuyomi:{'*':'genjutsu'},susano:{'*':'roar'},
 byakugan:{'*':'jyuken'},kaiten:{'*':'jyuken'},hakke64:{'*':'jyuken'},sandcoffin:{'*':'sand'},mind:{'*':'genjutsu'},flower:{'*':'genjutsu'},seal:{'*':'genjutsu'},gatsuga:{'*':'wind'},peacock:{'*':'fire'},sage:{'*':'roar'},claws:{saber:'saber'}});
const JFXT={'*':1};
const jx=(o)=>{if(near(o.x,o.y))fx.push(o);return o};
const targetOf=(u,a,td,R=520)=>{const p=fwd(u,a,Math.min(td||300,R));return nearE(u,p.x,p.y,170)||nearE(u,u.x,u.y,R)};
const JFX={
 rasengan:(u,a)=>{jx({jfx:'rasengan',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.7,m:.7})},
 chidori:(u,a)=>{jx({jfx:'chidori',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.8,m:.8})},
 hiraishin:(u,a,td,pre)=>{jx({jfx:'hiraishin',x:pre.x,y:pre.y,x2:u.x,y2:u.y,t:.45,m:.45})},
 leaf:(u,a,td,pre)=>{if(Math.hypot(u.x-pre.x,u.y-pre.y)>40){sparks(pre.x,pre.y,'#5aa83a',16,'leaf');sparks(u.x,u.y,'#5aa83a',16,'leaf')}},
 smoke:(u,a,td,pre)=>{if(Math.hypot(u.x-pre.x,u.y-pre.y)>40)sparks(pre.x,pre.y,'#ddd',14,'smoke')},
 rasenshuriken:(u,a)=>{jx({jfx:'rasengan',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.5,m:.5,big:1})},
 tsukuyomi:(u)=>{jx({jfx:'redmoon',x:u.x,y:u.y,t:.9,m:.9})},
 byakugan:(u)=>{jx({jfx:'veins',ui:units.indexOf(u),x:u.x,y:u.y,t:1.4,m:1.4});ring(u.x,u.y,220,'#cfe0ff')},
 kaiten:(u)=>{jx({jfx:'dome',ui:units.indexOf(u),x:u.x,y:u.y,t:.9,m:.9})},
 hakke64:(u)=>{jx({jfx:'trigram',ui:units.indexOf(u),x:u.x,y:u.y,t:1.2,m:1.2});for(const e of enemies(u))if(dist(u,e)<200)jx({jfx:'palms',ti:units.indexOf(e),x:e.x,y:e.y,t:.9,m:.9})},
 sandcoffin:(u,a,td)=>{const e=targetOf(u,a,td);if(e)jx({jfx:'sandcoffin',ti:units.indexOf(e),x:e.x,y:e.y,t:1.6,m:1.6})},
 shadow:(u,a,td,pre,ab)=>{if(ab.n==='Kage Kubi Shibari'){const e=targetOf(u,a,td);if(e)jx({jfx:'shadowhands',ti:units.indexOf(e),ui:units.indexOf(u),x:e.x,y:e.y,t:1.6,m:1.6})}if(ab.n==='Ombres liées')jx({jfx:'shadowstar',ui:units.indexOf(u),x:u.x,y:u.y,t:1.4,m:1.4})},
 water:(u,a,td,pre,ab)=>{if(ab.n==='Suiton : Prison aqueuse'){const e=targetOf(u,a,td);if(e)jx({jfx:'waterprison',ti:units.indexOf(e),x:e.x,y:e.y,t:2,m:2})}if(ab.n==='Suiton : Vague')jx({jfx:'wave',x:u.x,y:u.y,a,t:.6,m:.6})},
 fire:(u,a,td,pre,ab)=>{if((ab.jid!=null&&JL[ab.jid].slot===1)||/Boule|Météore|Souffle/.test(ab.n))jx({jfx:'mouthfire',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.35,m:.35})},
 mind:(u,a,td)=>{const e=targetOf(u,a,td);if(e)jx({jfx:'mind',ui:units.indexOf(u),ti:units.indexOf(e),x:u.x,y:u.y,t:.8,m:.8})},
 seal:(u,a,td)=>{const e=targetOf(u,a,td);if(e)jx({jfx:'seal',ti:units.indexOf(e),x:e.x,y:e.y,t:2,m:2})},
 gatsuga:(u,a)=>{jx({jfx:'drill',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.65,m:.65,two:u.ch.look.dog?1:0})},
 peacock:(u,a)=>{jx({jfx:'peacock',ui:units.indexOf(u),x:u.x,y:u.y,a,t:1,m:1})},
 gate:(u,a,td,pre,ab)=>{if(/Porte|Tigre|Nuit|Lotus|Éléphant|Vitesse|Poids|Défi|jade/.test(ab.n)){const night=/Nuit/.test(ab.n);jx({jfx:'gateburst',ui:units.indexOf(u),x:u.x,y:u.y,t:night?1.2:.7,m:night?1.2:.7,tiger:/Tigre/.test(ab.n)?1:0,night:night?1:0});
  const call={'Huit Portes':'8e PORTE !','Tigre du soir':'TIGRE DU SOIR !','Nuit de la mort':'NUIT DE LA MORT !','Première Porte':'1re PORTE !','Porte de la Vie':'3e PORTE !','Lotus caché':'LOTUS CACHÉ !','Lotus primaire':'LOTUS !','Éléphant de midi':'ÉLÉPHANT DE MIDI !'}[ab.n];if(call)say(u,call,night?'#ff4a3a':'#6aff7a')}},
 heal:(u,a,td,pre,ab)=>{if(/Katsuyu/.test(ab.n))jx({jfx:'slugs',ui:units.indexOf(u),x:u.x,y:u.y,t:1.6,m:1.6})},
 sage:(u)=>{jx({jfx:'gateburst',ui:units.indexOf(u),x:u.x,y:u.y,t:.8,m:.8,sage:1})},
 susano:(u)=>{jx({jfx:'gateburst',ui:units.indexOf(u),x:u.x,y:u.y,t:.6,m:.6,sus:1});jx({jfx:'aura',kind:'susano',ui:units.indexOf(u),x:u.x,y:u.y,t:2.6,m:2.6})},
 kirin:(u)=>{jx({jfx:'flashsky',x:u.x,y:u.y,t:.5,m:.5})},
};
// effets à l'explosion d'une zone ou d'un projectile, selon l'élément
function detoFx(x,y,r,v){if(!near(x,y))return;
 if(v==='bone'||v==='earth')jx({jfx:'spikes',x,y,r,t:.9,m:.9,bone:v==='bone'?1:0});
 else if(v==='fire'||v==='black'||v==='peacock')jx({jfx:'pillar',x,y,r,t:.7,m:.7,v});
 else if(v==='water')jx({jfx:'splash',x,y,r,t:.6,m:.6});
 else if(v==='wind'||v==='rasenshuriken')jx({jfx:'windsphere',x,y,r,t:.7,m:.7});
 else if(v==='tag')jx({jfx:'pillar',x,y,r,t:.5,m:.5,v:'tag'});
 else if(v==='sand'||v==='sandcoffin')jx({jfx:'splash',x,y,r,t:.6,m:.6,sand:1})}
const UI=f=>f.ui!=null?units[f.ui]:null,TI=f=>f.ti!=null?units[f.ti]:null;
function drawChainLine(x0,y0,x1,y1){const n=Math.max(3,Math.hypot(x1-x0,y1-y0)/7|0);g.strokeStyle='#e8c860';g.lineWidth=1.6;for(let i=0;i<n;i++){const k=i/n,x=lerp(x0,x1,k),y=lerp(y0,y1,k);g.beginPath();g.ellipse(x,y,3.2,1.8,Math.atan2(y1-y0,x1-x0)+(i%2?1.2:0),0,7);g.stroke()}}
function drawJfx(f){const k=f.t/f.m,e=1-k,t=performance.now()/1000,u=UI(f),tg=TI(f);if(u&&u.dead&&f.ui!=null&&!f.ti)return;
 const hand=(uu,z=30)=>{const a=uu.aim;return P(uu.x+Math.cos(a)*16,uu.y+Math.sin(a)*16,z)};
 g.save();
 switch(f.jfx){
  case'aura':{if(!u||u.dead)break;const q=P(u.x,u.y,u.z||0),old=u.auraV;u.auraV=f.kind;g.globalAlpha=Math.min(1,k*4);drawAura(u,q,q.s*1.3,u.ch.look.scale||1);u.auraV=old;break}
  case'rasengan':{if(!u)break;const q=hand(u),R=(f.big?16:11)*q.s*(1+e*.2);g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R*1.8);gr.addColorStop(0,'#fff');gr.addColorStop(.4,f.big?'#bfffe8':'#9fd8ff');gr.addColorStop(1,'rgba(58,138,255,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R*1.8,0,7);g.fill();
   g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.5;for(let i=0;i<4;i++){g.beginPath();g.ellipse(q.x,q.y,R*(.5+i*.2),R*(.3+i*.12),t*12+i,0,4.5);g.stroke()}
   if(f.big){g.translate(q.x,q.y);g.rotate(t*16);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle='rgba(220,255,245,.55)';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(R*2,-R*.6,R*3.6,0);g.quadraticCurveTo(R*2,R*.3,0,0);g.fill()}}break}
  case'chidori':{if(!u)break;const q=hand(u,22);g.globalCompositeOperation='lighter';circ(q.x,q.y,10*q.s,rgba('#9fd8ff',.5));circ(q.x,q.y,5*q.s,'#fff');for(let i=0;i<6;i++){const a=rnd()*7,r=(16+rnd()*18)*q.s;drawBolt(q.x,q.y,q.x+Math.cos(a)*r,q.y+Math.sin(a)*r*.7,i%2?'#fff':'#9fd8ff')}
   const b=P(u.x-Math.cos(u.aim)*40,u.y-Math.sin(u.aim)*40,6);g.globalAlpha=k*.7;drawBolt(b.x,b.y,q.x,q.y,'#bfe6ff');break}
  case'hiraishin':{const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.globalCompositeOperation='lighter';g.globalAlpha=k;g.strokeStyle='#ffe14a';g.lineWidth=10*k;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle='#fff';g.lineWidth=3*k;g.stroke();
   for(const p of[a,b]){circ(p.x,p.y,(24*e+6)*p.s,rgba('#ffe14a',.5*k))}const m=P(f.x2,f.y2,4);g.globalCompositeOperation='source-over';g.fillStyle='#ccc';g.save();g.translate(m.x,m.y);g.rotate(.6);g.beginPath();g.moveTo(-3,-6);g.lineTo(9,0);g.lineTo(-3,6);g.fill();g.restore();break}
  case'redmoon':{if(!nearMe(f.x,f.y))break;g.setTransform(RS,0,0,RS,0,0);const a=Math.min(1,k*3)*Math.min(1,e*6);g.globalAlpha=a*.55;g.fillStyle='#3a0006';g.fillRect(0,0,W,H);g.globalAlpha=a;circ(W*.78,H*.2,70,'#d01a2a');circ(W*.78,H*.2,70,'rgba(0,0,0,0)');g.strokeStyle='#1a0003';g.lineWidth=5;g.beginPath();g.arc(W*.78,H*.2,40,0,7);g.stroke();
   for(let i=0;i<3;i++){const b=t*2+i*2.09;circ(W*.78+Math.cos(b)*40,H*.2+Math.sin(b)*40,8,'#1a0003')}break}
  case'veins':{if(!u)break;const q=P(u.x,u.y,58);g.strokeStyle=rgba('#9ab8ff',.8*k);g.lineWidth=1.2;for(const sx of[-1,1])for(let i=0;i<3;i++){g.beginPath();g.moveTo(q.x+sx*6*q.s,q.y);g.lineTo(q.x+sx*(11+i*2)*q.s,q.y-(4-i*4)*q.s);g.stroke()}break}
  case'dome':{if(!u)break;const q=P(u.x,u.y,0),R=50*q.s;g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){g.strokeStyle=rgba('#dfe8ff',.6*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-R*.45,R*(1-i*.08),R*(.9-i*.07),0,t*10+i,t*10+i+3.6);g.stroke()}g.fillStyle=rgba('#cfe0ff',.15*k);g.beginPath();g.ellipse(q.x,q.y-R*.45,R,R*.9,0,0,7);g.fill();break}
  case'trigram':{if(!u)break;const q=P(u.x,u.y,0),R=120*q.s;g.globalAlpha=Math.min(1,k*3);g.strokeStyle='#dfe8ff';g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.beginPath();g.ellipse(q.x,q.y,R*.25,R*.25*K,0,0,7);g.stroke();
   for(let i=0;i<8;i++){const a=i*Math.PI/4+.4,x=q.x+Math.cos(a)*R*.68,y=q.y+Math.sin(a)*R*.68*K;for(let l=0;l<3;l++){g.fillStyle='#dfe8ff';if((i>>l)&1)g.fillRect(x-7,y-4+l*3.2,14,2);else{g.fillRect(x-7,y-4+l*3.2,5.5,2);g.fillRect(x+1.5,y-4+l*3.2,5.5,2)}}}
   g.fillStyle='#fff';g.beginPath();g.arc(q.x,q.y,R*.2,Math.PI/2,Math.PI*1.5);g.ellipse(q.x,q.y,R*.2,R*.2*K,0,0,0);g.fill();break}
  case'palms':{if(!tg)break;const q=P(tg.x,tg.y,30);g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const a=rnd()*7,r=rnd()*16;circ(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r,4+rnd()*3,rgba('#cfe0ff',.8))}text(String(Math.min(64,Math.round(e*64))),q.x,q.y-36,12,'#dfe8ff');break}
  case'sandcoffin':{if(!tg)break;const q=P(tg.x,tg.y,0),h=Math.min(1,e*3)*60*q.s;g.fillStyle='#c8a060';g.strokeStyle='#8a6a3a';g.lineWidth=1.5;g.beginPath();g.moveTo(q.x-18*q.s,q.y+4);g.quadraticCurveTo(q.x-22*q.s,q.y-h*.6,q.x-6*q.s,q.y-h);g.quadraticCurveTo(q.x,q.y-h-6*q.s,q.x+6*q.s,q.y-h);g.quadraticCurveTo(q.x+22*q.s,q.y-h*.6,q.x+18*q.s,q.y+4);g.closePath();g.fill();g.stroke();
   g.fillStyle='#e0c080';for(let i=0;i<10;i++)g.fillRect(q.x+(rnd()-.5)*36*q.s,q.y-rnd()*h,2,2);break}
  case'shadowhands':{if(!tg)break;const q=P(tg.x,tg.y,0);g.fillStyle='rgba(8,8,12,.85)';g.beginPath();g.ellipse(q.x,q.y,26*q.s,26*q.s*K,0,0,7);g.fill();for(let i=0;i<5;i++){const a=i*1.26+t,len=(18+Math.sin(t*5+i)*4)*Math.min(1,e*4)*q.s;g.strokeStyle='#0c0c10';g.lineWidth=4*q.s;g.lineCap='round';g.beginPath();g.moveTo(q.x+Math.cos(a)*20*q.s,q.y+Math.sin(a)*8*q.s);g.quadraticCurveTo(q.x+Math.cos(a)*14*q.s,q.y-len,q.x+Math.cos(a)*6*q.s,q.y-len*1.6);g.stroke()}
   if(u){const a=P(u.x,u.y,0);g.strokeStyle='rgba(8,8,12,.8)';g.lineWidth=6*q.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(q.x,q.y);g.stroke()}break}
  case'shadowstar':{if(!u)break;const q=P(u.x,u.y,0);g.strokeStyle='rgba(8,8,12,.8)';g.lineCap='round';for(let i=0;i<8;i++){const a=i*Math.PI/4,len=Math.min(1,e*3)*260*q.s;g.lineWidth=5*q.s;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x+Math.cos(a)*len,q.y+Math.sin(a)*len*K);g.stroke()}break}
  case'waterprison':{if(!tg)break;const q=P(tg.x,tg.y,32),R=30*q.s*Math.min(1,e*4);g.fillStyle='rgba(58,168,255,.35)';g.strokeStyle='rgba(191,230,255,.9)';g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();g.stroke();g.strokeStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(q.x-R*.3,q.y-R*.3,R*.35,3.6,4.8);g.stroke();for(let i=0;i<3;i++)circ(q.x+(rnd()-.5)*R,q.y+R*.6-((t*30+i*10)%(R*1.4)),2,'rgba(255,255,255,.7)');break}
  case'wave':{const q=P(f.x,f.y,0);for(let i=0;i<3;i++){const r=(60+e*320-i*40)*q.s;if(r<0)continue;g.strokeStyle=i?'rgba(191,230,255,.7)':'rgba(58,168,255,.85)';g.lineWidth=(10-i*3)*q.s;g.beginPath();g.ellipse(q.x,q.y,r,r*K,0,f.a-.55,f.a+.55);g.stroke()}break}
  case'mouthfire':{if(!u)break;const q=P(u.x+Math.cos(f.a)*10,u.y+Math.sin(f.a)*10,52);g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const d=(8+i*9)*e*q.s,b=f.a+(rnd()-.5)*.5;circ(q.x+Math.cos(b)*d*2,q.y+Math.sin(b)*d*K*2,(6+i*2)*q.s*k,rgba(i<2?'#fff3c0':'#ff8a2a',.7*k))}break}
  case'mind':{if(!u||!tg)break;const a=P(u.x,u.y,55),b=P(tg.x,tg.y,55);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#c080ff',.8*k);g.lineWidth=3;g.setLineDash([6,6]);g.lineDashOffset=-t*60;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.setLineDash([]);circ(b.x,b.y,(14+e*14)*b.s,rgba('#c080ff',.35*k));break}
  case'seal':{if(!tg)break;const q=P(tg.x,tg.y,0),R=34*q.s;g.strokeStyle=rgba('#e8c860',.9*Math.min(1,k*3));g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.beginPath();g.ellipse(q.x,q.y,R*.6,R*.6*K,0,0,7);g.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4+t;g.fillStyle='#2a2a33';g.fillRect(q.x+Math.cos(a)*R*.8-2,q.y+Math.sin(a)*R*.8*K-3,4,6)}break}
  case'drill':{if(!u)break;const q=P(u.x,u.y,26),s=q.s;for(const off of f.two?[-14,14]:[0]){const ox=-Math.sin(u.aim)*off*s,oy=Math.cos(u.aim)*off*s*K;g.save();g.translate(q.x+ox,q.y+oy);g.rotate(Math.atan2(Math.sin(u.aim)*K,Math.cos(u.aim)));
    for(let i=0;i<5;i++){g.strokeStyle=i%2?'rgba(200,200,210,.85)':'rgba(255,255,255,.7)';g.lineWidth=3*s;g.beginPath();g.ellipse(-10*s+i*6*s,0,(22-i*4)*s,(14-i*2.5)*s,0,t*30+i,t*30+i+4);g.stroke()}g.restore()}break}
  case'peacock':{if(!u)break;const q=P(u.x,u.y,40);g.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const a=u.aim+(i-4)*.28,r=(40+e*60)*q.s;g.fillStyle=rgba(i%2?'#ff8a2a':'#ffd36a',.6*k);g.beginPath();g.ellipse(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r*K,10*q.s,5*q.s,a,0,7);g.fill()}break}
  case'gateburst':{if(!u)break;const q=P(u.x,u.y,30),col=f.sage?'#e8a020':f.sus?(u.ch.look.weapon.col||'#a5f'):f.night?'#ff3a2a':'#6aff7a';
   if(f.night){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff3a2a',.7*k);g.lineWidth=8*q.s;g.lineCap='round';g.beginPath();for(let i=0;i<=20;i++){const d=i/20,x=q.x+Math.cos(u.aim)*d*220*e*q.s,y=q.y+Math.sin(u.aim)*d*220*e*q.s*K+Math.sin(d*9+t*8)*16*q.s;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.restore()}g.globalCompositeOperation='lighter';g.strokeStyle=rgba(col,.8*k);g.lineWidth=5;g.beginPath();g.ellipse(q.x,q.y+16*q.s,(30+e*120)*q.s,(30+e*120)*q.s*K,0,0,7);g.stroke();
   for(let i=0;i<10;i++){const a=i*.63+t,r=(20+e*70)*q.s;circ(q.x+Math.cos(a)*r,q.y-e*40*q.s+Math.sin(a)*r*.4,(5+e*8)*q.s,rgba(col,.25*k))}
   if(f.tiger){g.globalCompositeOperation='source-over';g.globalAlpha=k;const R=(40+e*90)*q.s;g.fillStyle='rgba(180,255,190,.35)';g.beginPath();g.ellipse(q.x+Math.cos(u.aim)*R,q.y,R,R*.8,0,0,7);g.fill();g.fillStyle='rgba(20,60,30,.6)';g.fillRect(q.x+Math.cos(u.aim)*R-R*.45,q.y-R*.25,R*.25,R*.12);g.fillRect(q.x+Math.cos(u.aim)*R+R*.2,q.y-R*.25,R*.25,R*.12)}break}
  case'slugs':{if(!u)break;for(let i=0;i<4;i++){const a=i*1.57+t*.6,q=P(u.x+Math.cos(a)*50,u.y+Math.sin(a)*40,6);g.fillStyle='#e8eef8';g.beginPath();g.ellipse(q.x,q.y,11*q.s,6*q.s,a,0,7);g.fill();g.fillStyle='#4a6aa8';g.fillRect(q.x-6*q.s,q.y-2*q.s,12*q.s,2*q.s)}break}
  case'flashsky':{if(!nearMe(f.x,f.y))break;g.setTransform(RS,0,0,RS,0,0);g.globalAlpha=k*.35;g.fillStyle='#e8f4ff';g.fillRect(0,0,W,H);break}
  case'spikes':{const q0=P(f.x,f.y,0),n=f.bone?10:7;for(let i=0;i<n;i++){const a=i*2.4,d=(i%3)*f.r*.28,q=P(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d*.8,0),h=(f.bone?46:38)*q.s*Math.min(1,e*4)*k*1.4;
    g.fillStyle=f.bone?'#f2efe6':'#8a6a48';g.strokeStyle=f.bone?'#b8b0a0':'#4a3424';g.lineWidth=1.2;g.beginPath();g.moveTo(q.x-6*q.s,q.y);g.lineTo(q.x+(i%2?2:-2)*q.s,q.y-h);g.lineTo(q.x+6*q.s,q.y);g.closePath();g.fill();g.stroke()}break}
  case'pillar':{const q=P(f.x,f.y,0),h=140*q.s*Math.min(1,e*4),w=f.r*.6*q.s*k;g.globalCompositeOperation=f.v==='black'?'source-over':'lighter';const gr=g.createLinearGradient(0,q.y-h,0,q.y);
   if(f.v==='black'){gr.addColorStop(0,'rgba(20,10,24,0)');gr.addColorStop(1,'rgba(20,10,24,.9)')}else{gr.addColorStop(0,'rgba(255,120,40,0)');gr.addColorStop(.5,rgba('#ff8a2a',.6*k));gr.addColorStop(1,rgba('#fff3c0',.9*k))}g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-h/2,w,h/2,0,0,7);g.fill();break}
  case'splash':{const q=P(f.x,f.y,0);for(let i=0;i<10;i++){const a=i*.63,r=f.r*.7*e*q.s,hh=Math.sin(Math.PI*e)*40*q.s;circ(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r*K-hh*(i%2?1:.6),(4+(i%3))*q.s,f.sand?'#d8b878':'rgba(160,210,255,.85)')}g.strokeStyle=f.sand?'rgba(200,160,90,.7)':'rgba(191,230,255,.8)';g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,f.r*e*q.s,f.r*e*q.s*K,0,0,7);g.stroke();break}
  case'windsphere':{const q=P(f.x,f.y,20),R=f.r*(.4+e*.8)*q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#c8fff0',.25*k);g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();g.strokeStyle=rgba('#ffffff',.6*k);g.lineWidth=1;for(let i=0;i<24;i++){const a=i*.26+t*3,r0=R*.3,r1=R;g.beginPath();g.moveTo(q.x+Math.cos(a)*r0,q.y+Math.sin(a)*r0);g.lineTo(q.x+Math.cos(a+.15)*r1,q.y+Math.sin(a+.15)*r1);g.stroke()}break}
 }
 g.restore()}
// états visibles : flammes noires d'Amaterasu, sommeil, parchemin collé, entrave d'ombre / de sable / d'eau
function drawStatusN(u,p,S,sk){const t=performance.now()/1000;
 if(u.mk){g.save();for(let i=0;i<6;i++){const a=i*1.05+t*2,q={x:p.x+Math.cos(a)*12*S,y:p.y-(10+((t*40+i*13)%50))*S};g.fillStyle='#120a16';g.beginPath();g.moveTo(q.x-4*S,q.y);g.quadraticCurveTo(q.x,q.y-14*S,q.x+4*S,q.y);g.fill();g.strokeStyle='#6a2a8a';g.lineWidth=.8;g.stroke()}g.restore()}
 if(u.sleepT>0){text('z',p.x+14*S+Math.sin(t*2)*3,p.y-80*S-((t*20)%14),11+((t*20)%14)/2,'#dfe8ff');text('Z',p.x+20*S,p.y-92*S-((t*20+7)%14),13,'#dfe8ff')}
 if(u.stk){const q={x:p.x,y:p.y-34*S};g.fillStyle='#f0e0b0';g.fillRect(q.x-5*S,q.y-3*S,10*S,6*S);g.fillStyle='#c0302a';g.fillRect(q.x-1*S,q.y-2*S,2*S,4*S);if(Math.sin(t*20)>0)circ(q.x-6*S,q.y,2*S,'#ffb04a')}
 if(u.root>0&&u.rootV){const v=u.rootV,R=20*S;if(v==='shadow'){g.fillStyle='rgba(8,8,12,.8)';g.beginPath();g.ellipse(p.x,p.y,R*1.3,R*.55,0,0,7);g.fill()}else if(v==='sand'||v==='sandcoffin'){g.fillStyle='#c8a060';g.beginPath();g.ellipse(p.x,p.y-6*S,R,R*.6,0,0,7);g.fill()}else if(v==='water'){g.strokeStyle='rgba(191,230,255,.8)';g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,R*1.2,R*.5,0,0,7);g.stroke()}}}
