// ---------- Ninjas : dessin et animations (style chibi, contour, ombrage) ----------
const shade=(h,k)=>{if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];const n=parseInt(h.slice(1),16),f=c=>Math.max(0,Math.min(255,Math.round(c*k)));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`};
const OUT='rgba(20,12,8,.85)';
function limb(x0,y0,x1,y1,x2,y2,w,col){g.lineCap='round';g.lineJoin='round';g.strokeStyle=OUT;g.lineWidth=w+2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function blob(x,y,r,col){g.fillStyle=OUT;g.beginPath();g.arc(x,y,r+1,0,7);g.fill();g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
function outlined(path,col){g.fillStyle=col;g.strokeStyle=OUT;g.lineWidth=1.6;g.beginPath();path();g.closePath();g.fill();g.stroke()}
// pose des mains selon l'action : renvoie [main avant, main arrière] en coordonnées locales
// mudras : les 12 signes (nom, main avant, main arrière, doigts) ; chaque jutsu a sa propre suite de signes
const SIGNS=[['Tigre',[1,-37],[-1,-33],'up'],['Bélier',[2,-35],[-2,-32],'up1'],['Serpent',[0,-31],[0,-30],'clasp'],['Dragon',[-3,-36],[3,-31],'side'],
 ['Rat',[2,-33],[-2,-35],'fist'],['Oiseau',[-4,-30],[4,-30],'wing'],['Chien',[1,-29],[2,-25],'flat'],['Sanglier',[-1,-31],[1,-31],'down'],
 ['Cheval',[0,-36],[0,-34],'tri'],['Singe',[3,-33],[-3,-33],'cross'],['Lièvre',[-2,-31],[3,-36],'side'],['Bœuf',[1,-33],[-4,-30],'fist']];
const signOf=(ab,i)=>{let h=0;for(const c of ab.n||'')h=(h*31+c.charCodeAt(0))%997;return SIGNS[(h+i*5)%12]};
// état des mudras pendant l'incantation : signe en cours, progression dans le signe (q), signe précédent
function mudraOf(u){if(!u.cast)return null;const ab=castAb(u,u.cast),n=ab&&ab.mud;if(!n)return null;const f=Math.min(.999,u.cast.t/u.cast.dur)*n,i=Math.floor(f);
 return{i,n,q:f-i,sg:signOf(ab,i),pv:i>0?signOf(ab,i-1):null}}
// étape du combo corps à corps en cours (0 si pas de combo)
// courbe de frappe : sortie très rapide puis retour lent
const punchK=sw=>{const p=1-sw;return p<.3?1-(1-p/.3)**2:1-(p-.3)/.7*.85};
const cmbStep=u=>u.swing>0&&u.cmbH&&MELEEK.has(u.ch.look.weapon.k)?u.cmbH:0;
function ninjaHands(u,fx,fy,run,t){const sw=u.swing>0?u.swing/.18:0,ax=Math.cos(u.aim),ay=Math.sin(u.aim)*K*.6;
 const md=mudraOf(u);if(md){const fs=fx>=0?1:-1,k=Math.min(1,md.q/.3),e=1-(1-k)*(1-k),pop=md.q<.3?Math.sin(k*Math.PI)*2.5:0,A=md.pv||[0,[0,-30],[0,-30]],Bs=md.sg;
  const mix=(a,b)=>[fx*3+(a[0]+(b[0]-a[0])*e)*fs,a[1]+(b[1]-a[1])*e-pop];return[mix(A[1],Bs[1]),mix(A[2],Bs[2])]}
 if(u.cast)return[[fx*4,-30+Math.sin(t*14)],[fx*4-1,-30-Math.sin(t*14)]];
 if(u.block)return[[ax*9-3,-34],[ax*9+3,-34]];
 if(sw>0){const ph=punchK(sw),ext=10+19*ph;switch(cmbStep(u)){
  case 2:return[[ax*4,-31],[ax*(ext+3),-33+ay*ext]]; // direct du bras arrière
  case 3:return[[ax*(6+9*ph),-22-20*ph],[-ax*5,-27]]; // uppercut
  case 4:return[[ax*7,-33],[ax*2,-35]]; // garde pendant le coup de pied
  case 5:return[[ax*(ext+4),-30+ay*ext],[ax*(ext+1),-25+ay*ext]]; // double paume du final
  default:return[[ax*ext,-30+ay*ext],[-ax*6,-26]]}} // jab
 if(u.thrT>0){const k=1-u.thrT/.2,e=k<.35?k/.35:1-(k-.35)/.65*.5;return[[ax*(-9+30*e),-40+12*e+ay*18*e],[-ax*6,-27]]} // lancer
 if(u.relT>0){const k=1-u.relT/.3,ph=k<.25?k/.25:1-(k-.25)/.75*.7;return[[ax*(8+16*ph),-33+ay*14*ph],[ax*(6+13*ph),-28+ay*14*ph]]} // libération du jutsu, deux mains en avant
 if(run>1)return[[-fx*13,-24],[-fx*15,-22]];
 if(u.cmbT>0&&MELEEK.has(u.ch.look.weapon.k))return[[ax*9,-33+Math.sin(t*6)],[ax*3,-35-Math.sin(t*6)]]; // garde
 const sv=u.moving?Math.sin(u.walk)*7:Math.sin(t*2)*.6;return[[ax*7+sv*fy*.3,-22+sv*.5],[-ax*4-sv*.6,-22-sv*.4]]}
// images rémanentes : silhouettes qui s'effacent derrière un ninja qui file
function drawGhosts(u){const T=u._tr||(u._tr=[]),fast=!u.dead&&(u.dash||u.phase>0||(u===player&&u.haste>0&&u.moving));if(fast)T.push({x:u.x,y:u.y,z:u.z||0});else if(T.length)T.shift();while(T.length>7)T.shift();
 if(T.length<3||u.ch.look.head.t!=='ninja')return;const S2=1.3*(u.giant>0?1.35:1);for(let i=0;i<T.length-2;i+=2){const o=T[i],q=P(o.x,o.y,o.z);g.save();g.globalAlpha=.1+.18*i/T.length;(N3.ok&&N3.tile.get(u)?drawChar3(u,q.x,q.y,q.s*S2):drawNinja(u,q.x,q.y,q.s*S2,1));g.restore()}}
function drawNinja(u,bx,by,s,ghost){
 const L=u.ch.look,h=L.head,W=L.weapon,k=W.k||'fist',t=performance.now()/1000;
 const fx=Math.cos(u.aim),fy=Math.sin(u.aim),back=fy<-.3,fl=u.flash>0,sk=L.scale||1;
 const run=u.dash?2:u.haste>0&&u.moving?2:u.moving?1:0;
 g.save();g.translate(bx,by);g.scale(s*sk,s*sk);if(u.phase>0)g.globalAlpha*=.35+Math.sin(t*30)*.1;
 if(u.dead){g.globalAlpha=Math.max(0,1-u.deadT*.6);g.rotate(Math.min(1.4,u.deadT*6)*(fx<0?-1:1))}
 if(u.stun>0)g.rotate(Math.sin(t*12)*.06);
 const sw=u.swing>0?u.swing/.18:0,cs=cmbStep(u),cph=sw>0?punchK(sw):0,fs=Math.cos(u.aim)>=0?1:-1;if(sw>0)g.translate(Math.cos(u.aim)*[4,6,10,5,7,12][cs]*cph,Math.sin(u.aim)*3*cph);
 if(cs===5){g.translate(0,-16*cph);g.rotate(fs*.38*cph)}else if(cs===3){g.translate(0,-6*cph);g.rotate(-fs*.12*cph)}else if(cs===4)g.rotate(-fs*.26*cph);else if(cs===2)g.rotate(fs*.14*cph);else if(cs===1)g.rotate(fs*.07*cph);
 // image rémanente du coup final
 if(cs===5&&cph>.3){g.save();g.globalAlpha=.25*cph;g.translate(-fs*14,8);g.fillStyle=rgba(u.ch.look.weapon.col||'#ffd36a',.8);g.beginPath();g.ellipse(0,-30,12,22,0,0,7);g.fill();g.restore()}
 if(fl&&!u.dead){const fk=u.flash/.12;g.translate(-fx*4*fk,0);g.rotate(-(fx>=0?1:-1)*.16*fk)}
 {const zl=u.z||0;if((u._pz||0)>8&&zl<=1)u._land=.16;u._pz=zl;if(u._land>0){u._land-=1/60;const q=Math.max(0,u._land/.16);g.scale(1+.2*q,1-.18*q)}else if(zl>10)g.scale(.94,1.07)}
 if(u.dash&&!u.dead)g.rotate((fx>=0?1:-1)*.22);
 const step=u.moving?Math.sin(u.walk):0,bob=u.moving?Math.abs(Math.cos(u.walk))*1.8:Math.sin(t*2.2)*.5,lean=run>1?fx*5:run?fx*1.5:0;
 const col=c=>fl?'#fff':c,skin=col(h.skin),LG=col(L.legs),TO=col(L.torso),AR=col(L.arm||L.torso);
 // jambes (genou plié) et sandales
 for(const side of[-1,1]){const kick=(cs===4||cs===5)&&side===fs,ph=step*side,hx=side*4;let kx=hx+ph*4+lean*.3,ky=-10+Math.abs(ph)*-2,fxx=hx+ph*6,fyy=-2-Math.max(0,ph)*2;
  if(kick){kx=hx+fs*12*cph;ky=-17-9*cph;fxx=hx+fs*(6+25*cph);fyy=-6-(cs===5?26:19)*cph}
  else if(!u.moving&&(u.cmbT>0||cs)&&MELEEK.has(k)){kx=hx*1.6+side*fs*3;fxx=hx*2+side*fs*5;ky=-9}
  limb(hx,-20,kx,ky,fxx,fyy,5.2,LG);if(L.legs!=='#d8d0c0'&&L.torso==='#4a8a3a'){g.strokeStyle='#e8e0d0';g.lineWidth=1;g.beginPath();g.moveTo(kx-2,ky+3);g.lineTo(kx+2,ky+5);g.stroke()}
  g.fillStyle=OUT;g.fillRect(fxx-4,fyy-1,9,4);g.fillStyle=col(L.boot||'#222');g.fillRect(fxx-3.5,fyy-.5,8,2.5);g.fillStyle=skin;g.fillRect(fxx+(fx>0?2:-3),fyy-2.5,3,2)}
 g.translate(lean*.4,-bob);
 const [hf,hb]=ninjaHands(u,fx,fy,run,t);
 // gourde de sable, cape et manteau à l'arrière
 const gourd=()=>{g.save();g.translate(back?0:-fx*3,-30);outlined(()=>{g.ellipse(0,4,11,12,0,0,7)},col('#c8945a'));outlined(()=>{g.ellipse(0,-11,7,7,0,0,7)},col('#c8945a'));g.fillStyle='#7a4a2a';g.fillRect(-2,-20,4,4);g.strokeStyle='#8a3a2a';g.lineWidth=2;g.beginPath();g.moveTo(-10,-4);g.lineTo(10,-14);g.stroke();g.restore()};
 if(L.gourd&&!back)gourd();
 if(L.cape&&!back)outlined(()=>{g.moveTo(-11,-40);g.lineTo(11,-40);g.lineTo(16-step,-4);g.lineTo(-16-step,-4)},col(L.cape));
 // bras arrière
 const shoulder=side=>[side*9,-37];const armB=()=>{const [sx,sy]=shoulder(-fx>=0?1:-1);limb(sx,sy,(sx+hb[0])/2-2,(sy+hb[1])/2+2,hb[0],hb[1],4.4,AR);blob(hb[0],hb[1],2.6,k==='fist'||k==='bigfist'?col('#f0ebe0'):skin)};
 if(!back)armB();
 // torse et tenue
 if(L.robe)outlined(()=>{g.moveTo(-12,-41);g.lineTo(12,-41);g.lineTo(16+step*2,-7);g.lineTo(-16+step*2,-7)},col(L.robe));
 const tg=g.createLinearGradient(-11,0,11,0);tg.addColorStop(0,col(shade(L.torso,1.12)));tg.addColorStop(1,col(shade(L.torso,.82)));
 outlined(()=>{g.roundRect(-10.5,-42,21,24,5)},tg);
 if(!back){
  if(L.vest){g.fillStyle=col(L.vest);g.strokeStyle=OUT;g.lineWidth=1.2;g.beginPath();g.roundRect(-10.5,-41,21,19,4);g.fill();g.stroke();g.fillStyle=col(shade(L.vest,.8));g.fillRect(-9,-33,6,5);g.fillRect(3,-33,6,5);g.fillRect(-1,-41,2,19);g.fillStyle=col(shade(L.vest,1.15));g.fillRect(-8,-43,16,3)}
  if(L.tunic){g.fillStyle=col(L.tunic);g.fillRect(-4,-42,8,23);g.fillStyle=col(shade(L.torso,.7));g.fillRect(-9,-44,18,4)}
  if(L.armor){g.fillStyle=col(L.armor);g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();g.roundRect(-9,-40,18,11,3);g.fill();g.stroke()}
  if(L.torso==='#f08a24'){g.fillStyle=col('#2a3550');g.fillRect(-10,-42,20,4);g.fillStyle='#ddd';g.fillRect(-.7,-38,1.4,15)}
  if(L.clouds&&!fl){g.fillStyle=col('#16161c');g.fillRect(-11,-45,22,6);for(const [cx,cy] of[[-6,-24],[5,-34]]){g.fillStyle='#fff';g.beginPath();g.ellipse(cx,cy,5.5,3.2,0,0,7);g.fill();g.fillStyle='#c0202a';g.beginPath();g.ellipse(cx,cy,4.4,2.3,0,0,7);g.fill()}}
 }else{
  if(L.tunic){g.fillStyle=col('#ffffff');g.beginPath();g.arc(0,-31,5,Math.PI,0);g.fill();g.fillStyle=col('#d02a2a');g.beginPath();g.arc(0,-31,5,0,Math.PI);g.fill()}
  if(L.clouds&&!fl){g.fillStyle='#c0202a';g.beginPath();g.ellipse(0,-28,5,3,0,0,7);g.fill()}
  if(L.cape)outlined(()=>{g.moveTo(-12,-41);g.lineTo(12,-41);g.lineTo(15-step,-6);g.lineTo(-15-step,-6)},col(L.cape));
  if(L.gourd)gourd();
 }
 if(L.belt){g.fillStyle=col(L.belt);g.fillRect(-10.5,-23,21,3.2)}
 if(k==='kunai'||k==='senbon'){g.fillStyle=col('#3a3a44');g.fillRect(fx>0?-10:6,-17,5,6)}
 // tête
 drawNinjaHead(u,h,fx,fy,back,fl,t,run);
 // bras avant + arme
 const [sx,sy]=shoulder(fx>=0?1:-1);
 if(back)armB();
 limb(sx,sy,(sx+hf[0])/2+1,(sy+hf[1])/2+2,hf[0],hf[1],4.6,AR);
 drawNinjaWeapon(u,L,W,k,hf,hb,fx,fy,back,fl,t);
 // traits d'impact propres à chaque coup du combo
 if(cs&&!fl){const sw2=1-u.swing/.18;if(sw2<.55){const al=.55*(1-sw2/.55);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',al);g.lineCap='round';
   if(cs===1||cs===2){const hp=cs===1?hf:hb;g.lineWidth=2.4;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(hp[0]-fs*(10+8*(1-Math.abs(q))),hp[1]+q*3);g.lineTo(hp[0]-fs*3,hp[1]+q*2);g.stroke()}}
   else if(cs===3){g.lineWidth=4;g.beginPath();g.arc(hf[0]-fs*4,hf[1]+10,14,fs>0?-1.2:-1.95,fs>0?1:-.2+Math.PI);g.stroke()}
   else{g.lineWidth=cs===5?6:4.5;g.strokeStyle=rgba(cs===5?'#ffd36a':'#ffffff',al);g.beginPath();g.arc(0,-18,cs===5?30:25,fs>0?-1.3:1.4,fs>0?1.0:4.4);g.stroke()}g.restore()}}
 if(cs&&cph>.45&&!fl){const ix=cs===2?hb[0]:cs>=4?fs*24:hf[0],iy=cs===2?hb[1]:cs===4?-24:cs===5?-30:hf[1],al=(cph-.45)*1.8;g.save();g.globalCompositeOperation='lighter';
  g.strokeStyle=rgba(cs===5?'#ffd36a':'#ffffff',al);g.lineWidth=cs===5?2.2:1.4;g.beginPath();
  if(cs===3){g.arc(ix,iy+8,12,-2.4,-.7)}else if(cs===4){g.arc(hf[0]*.2,-20,22,fs>0?-1.1:2.0,fs>0?.6:3.7)}else{const n=cs===5?8:4;for(let q=0;q<n;q++){const b=q/n*6.28+t;g.moveTo(ix+Math.cos(b)*4,iy+Math.sin(b)*4);g.lineTo(ix+Math.cos(b)*(cs===5?14:8),iy+Math.sin(b)*(cs===5?14:8))}}
  g.stroke();g.restore()}
 g.restore();
}
function drawNinjaHead(u,h,fx,fy,back,fl,t,run){const hx=fx*1.5,hy=-53,ex=hx+fx*3.5,R=12.5,hc=fl?'#fff':h.hair;
 // bandeau : pans qui flottent
 const flap=Math.sin(t*9+u.x*.01)*(u.moving?3:1);g.strokeStyle=h.band;g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(hx-fx*10,hy-6);g.quadraticCurveTo(hx-fx*17,hy-4+flap,hx-fx*(22+run*3),hy-1+flap*1.5);g.moveTo(hx-fx*10,hy-5);g.quadraticCurveTo(hx-fx*15,hy+1-flap,hx-fx*(19+run*3),hy+4-flap);g.stroke();
 // cheveux arrière
 if(h.style==='lisse')outlined(()=>{g.roundRect(hx-13.5,hy-6,27,back?24:19,6)},hc);
 if(h.style==='queue'){outlined(()=>{g.moveTo(hx-fx*9-3,hy-12);g.lineTo(hx-fx*13,hy-27);g.lineTo(hx-fx*9+3,hy-12)},hc)}
 outlined(()=>{g.arc(hx,hy,R,0,7)},fl?'#fff':h.skin);
 g.fillStyle=hc;
 if(h.style!=='chauve'){g.beginPath();if(back)g.arc(hx,hy,R+.6,0,7);else g.arc(hx,hy-1,R+.6,Math.PI*1.04,Math.PI*1.96);g.fill()}
 if(h.style==='pics')for(let i=-3;i<=3;i++){const a=-Math.PI/2+i*.38;outlined(()=>{g.moveTo(hx+Math.cos(a-.25)*R*.8,hy+Math.sin(a-.25)*R*.8);g.lineTo(hx+Math.cos(a)*(R+9-Math.abs(i)),hy+Math.sin(a)*(R+9-Math.abs(i))-1);g.lineTo(hx+Math.cos(a+.25)*R*.8,hy+Math.sin(a+.25)*R*.8)},hc)}
 if(h.style==='courts'){g.beginPath();g.arc(hx,hy-3,R+1,Math.PI*1.1,Math.PI*1.9);g.fill()}
 if(h.style==='chignons'){blob(hx-12,hy-10,5.5,hc);blob(hx+12,hy-10,5.5,hc)}
 if(h.style==='lisse'&&!back){g.fillRect(hx-13,hy-5,4.5,15);g.fillRect(hx+8.5,hy-5,4.5,15)}
 if(!back&&h.style!=='chauve'){g.beginPath();g.moveTo(ex-9,hy-9);g.lineTo(ex-5,hy-2);g.lineTo(ex-2,hy-8);g.lineTo(ex+2,hy-2);g.lineTo(ex+6,hy-8);g.lineTo(ex+9,hy-3);g.lineTo(ex+9,hy-11);g.closePath();g.fill()}
 // bandeau frontal et plaque du village
 g.fillStyle=h.band;g.fillRect(hx-R,hy-9,R*2,5);
 if(!back){g.fillStyle='#d3d8e2';g.strokeStyle='#5a6070';g.lineWidth=1;g.beginPath();g.roundRect(ex-7,hy-10.5,14,7.5,1.5);g.fill();g.stroke();g.strokeStyle='#4a4f5a';g.lineWidth=1;g.beginPath();
  switch(h.vil){case 0:g.arc(ex,hy-6.8,2.1,0,5.2);g.moveTo(ex+2,hy-6.8);g.lineTo(ex+4.2,hy-8.6);break;case 1:g.moveTo(ex-3,hy-9);g.lineTo(ex+3,hy-4.5);g.moveTo(ex+3,hy-9);g.lineTo(ex-3,hy-4.5);break;
   case 2:for(let q=0;q<4;q++){g.moveTo(ex-3+q*2,hy-9);g.lineTo(ex-3+q*2,hy-4.5)}break;case 3:g.arc(ex-1.6,hy-6.6,1.6,0,7);g.moveTo(ex+3.4,hy-6.6);g.arc(ex+1.8,hy-6.6,1.6,0,7);break;
   case 4:g.moveTo(ex-3,hy-4.5);g.lineTo(ex-1,hy-9);g.lineTo(ex+1,hy-4.5);g.lineTo(ex+3,hy-9);break;case 5:g.arc(ex-1,hy-5.6,1.4,0,7);g.moveTo(ex+.4,hy-5.6);g.lineTo(ex+.4,hy-9.4);break;
   default:g.arc(ex,hy-6.8,2.1,0,5.2);g.stroke();g.strokeStyle='#b22';g.lineWidth=1.5;g.beginPath();g.moveTo(ex-7,hy-7);g.lineTo(ex+7,hy-6)}g.stroke()}
 if(back)return;
 // yeux (grands, avec reflet) ; Sharingan, Byakugan, Mode Ermite
 const sage=u.auraV==='sage',eyeC=h.eye||(sage?'#e8a020':'#2a2a38');
 for(const sx of[-1,1]){const x=ex+sx*4.2,y=hy+1.5;g.fillStyle='#fff';g.beginPath();g.ellipse(x,y,2.6,3.2,0,0,7);g.fill();g.fillStyle=eyeC;g.beginPath();g.ellipse(x+fx*.6,y+.3,1.7,2.4,0,0,7);g.fill();
  if(h.eye==='#e01a1a'){g.fillStyle='#111';g.fillRect(x+fx*.6-.5,y,1,1)}if(h.eye!=='#e8e8f8'){g.fillStyle='#fff';g.fillRect(x+fx*.6-.2,y-1.4,.9,.9)}
  if(sage){g.fillStyle='#d8601a';g.fillRect(x-2.5,y-4.5,5,1.5)}}
 if(h.brows){g.fillStyle='#111';g.fillRect(ex-7.5,hy-4,6,2.2);g.fillRect(ex+1.5,hy-4,6,2.2)}
 if(h.kaguya){blob(ex-3,hy-3,1,'#c22');blob(ex+3,hy-3,1,'#c22')}
 g.strokeStyle='#5a3020';g.lineWidth=1;g.beginPath();g.moveTo(ex-1.5,hy+7);g.lineTo(ex+1.5,hy+7);g.stroke();
 if(h.acc==='masque')outlined(()=>{g.moveTo(ex-11,hy+2.5);g.lineTo(ex+11,hy+2.5);g.lineTo(ex+9,hy+11);g.lineTo(ex-9,hy+11)},'#2a3550');
 if(h.acc==='moust'){g.strokeStyle='#5a3a22';g.lineWidth=.9;for(const sx of[-1,1])for(let q=0;q<3;q++){g.beginPath();g.moveTo(ex+sx*5,hy+5+q*1.6);g.lineTo(ex+sx*10,hy+4+q*2.2);g.stroke()}}
 if(h.acc==='marques'){g.fillStyle='#c22';for(const sx of[-1,1]){g.beginPath();g.moveTo(ex+sx*5,hy+4);g.lineTo(ex+sx*8,hy+4);g.lineTo(ex+sx*6.5,hy+9);g.fill()}}
 if(h.acc==='lunettes'){g.fillStyle='rgba(30,30,40,.9)';g.fillRect(ex-8,hy-.5,6,4);g.fillRect(ex+2,hy-.5,6,4);g.fillRect(ex-2,hy+.5,4,1)}
}
function drawNinjaWeapon(u,L,W,k,hf,hb,fx,fy,back,fl,t){const [x,y]=hf,a=Math.atan2(Math.sin(u.aim)*K,Math.cos(u.aim)),act=u.swing>0||u.block||u.cast,c=W.col;
 const fist=(px,py,r,cc)=>blob(px,py,r,cc);
 switch(k){
  case'fist':fist(x,y,3.2,fl?'#fff':'#f0ebe0');g.strokeStyle='#c8c0b0';g.lineWidth=.8;g.beginPath();g.moveTo(x-2.5,y);g.lineTo(x+2.5,y-1);g.stroke();break;
  case'bigfist':{const r=u.swing>0?9:4.5;fist(x,y,r,fl?'#fff':u.ch.look.head.skin);if(u.swing>0){g.fillStyle=rgba('#ffcf7a',.35);g.beginPath();g.arc(x,y,r+4,0,7);g.fill()}break}
  case'palm':fist(x,y,3,u.ch.look.head.skin);if(act){g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#9fc8ff',.6);g.beginPath();g.arc(x,y,5+rnd()*2,0,7);g.fill();g.restore()}break;
  case'claws':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='#eee';g.lineWidth=1.2;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(x+Math.cos(a+q*.35)*2,y+Math.sin(a+q*.35)*2);g.lineTo(x+Math.cos(a+q*.35)*7,y+Math.sin(a+q*.35)*7);g.stroke()}break;
  case'bone':fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(a);outlined(()=>{g.moveTo(0,-2.5);g.lineTo(22,0);g.lineTo(0,2.5)},'#f2efe6');g.restore();break;
  case'sword':{fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(u.block?a-1.3:a+(u.swing>0?0:.5));g.fillStyle='#3a3a44';g.fillRect(-7,-1.6,8,3.2);g.fillStyle='#c8a040';g.fillRect(1,-3,2,6);
   if(act){g.shadowColor=c;g.shadowBlur=8*RS}g.fillStyle='#e8ecf2';g.beginPath();g.moveTo(3,-1.4);g.lineTo(33,-.6);g.lineTo(35,.6);g.lineTo(3,1.4);g.fill();g.restore();break}
  case'chain':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='#e8c860';g.lineWidth=1.3;for(let q=0;q<4;q++){g.beginPath();g.ellipse(x-fx*q*3,y+4+q*3,2.2,1.4,q,0,7);g.stroke()}break;
  case'bugs':fist(x,y,3,u.ch.look.head.skin);g.fillStyle='#26302a';for(let q=0;q<6;q++){const b=t*6+q*1.1;g.fillRect(x+Math.cos(b)*6,y+Math.sin(b*1.3)*5,1.6,1.6)}break;
  case'shadow':fist(x,y,3,u.ch.look.head.skin);if(act){g.fillStyle='rgba(10,10,14,.6)';g.beginPath();g.arc(x,y,4.5,0,7);g.fill()}break;
  case'sand':fist(x,y,3,u.ch.look.head.skin);if(act){g.fillStyle='#d8b878';for(let q=0;q<6;q++)g.fillRect(x+(rnd()-.5)*10,y+(rnd()-.5)*10,1.8,1.8)}break;
  case'senbon':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='#e8eef6';g.lineWidth=.9;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a+q*.25)*10,y+Math.sin(a+q*.25)*10);g.stroke()}break;
  default:{fist(x,y,3,u.ch.look.head.skin);if(u.saberOut>0)break;g.save();g.translate(x,y);g.rotate(a+(u.block?-1.2:0));if(act){g.shadowColor=c;g.shadowBlur=10*RS}g.fillStyle='#3a3a44';g.fillRect(-7,-1.5,8,3);g.strokeStyle='#3a3a44';g.lineWidth=1.2;g.beginPath();g.arc(-9,0,2.4,0,7);g.stroke();
   g.fillStyle=act?c:'#d3d8e2';g.beginPath();g.moveTo(1,-3.6);g.lineTo(15,0);g.lineTo(1,3.6);g.fill();g.restore()}}
 // mudras : chakra entre les mains pendant l'incantation
 const md=mudraOf(u);if(md){const [f,b]=[hf,hb],mx=(f[0]+b[0])/2,my=(f[1]+b[1])/2,fs=fx>=0?1:-1,st=md.sg[3],pw=(md.i+md.q)/md.n;
  // doigts du signe
  g.strokeStyle=OUT;g.lineWidth=2.6;g.lineCap='round';const fing=(x,y,dx,dy)=>{g.strokeStyle=OUT;g.lineWidth=2.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+dx,y+dy);g.stroke();g.strokeStyle=u.ch.look.head.skin;g.lineWidth=1.4;g.stroke()};
  if(st==='up'||st==='tri'){fing(mx,my-2,0,-7);if(st==='tri'){fing(mx-1.5,my-1,-2,-6);fing(mx+1.5,my-1,2,-6)}}
  else if(st==='up1'){fing(f[0],f[1]-2,0,-6)}else if(st==='side'){fing(f[0],f[1],fs*6,-2)}else if(st==='wing'){fing(f[0],f[1],-4,-5);fing(b[0],b[1],4,-5)}
  else if(st==='down'){fing(mx,my+2,0,6)}else if(st==='cross'){fing(f[0],f[1],-3,-5);fing(b[0],b[1],3,-5)}else if(st==='flat'){fing(f[0],f[1],fs*5,0)}
  blob(f[0],f[1],2.7,u.ch.look.head.skin);blob(b[0],b[1],2.7,u.ch.look.head.skin);
  // chakra qui monte à chaque signe, éclair au changement de signe
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(c,.25+.45*pw);g.beginPath();g.arc(mx,my,4+6*pw+rnd()*1.5,0,7);g.fill();
  if(md.q<.3){const k2=md.q/.3;g.strokeStyle=rgba('#ffffff',.9*(1-k2));g.lineWidth=1.6;g.beginPath();g.arc(mx,my,5+14*k2,0,7);g.stroke();
   for(let q=0;q<6;q++){const b2=q*1.047+md.i;g.beginPath();g.moveTo(mx+Math.cos(b2)*(6+8*k2),my+Math.sin(b2)*(6+8*k2));g.lineTo(mx+Math.cos(b2)*(10+12*k2),my+Math.sin(b2)*(10+12*k2));g.stroke()}}
  g.strokeStyle=rgba(c,.7);g.lineWidth=1.2;g.beginPath();g.arc(mx,my,11+3*pw,t*7,t*7+1.5+3*pw);g.stroke();g.restore()}
 else if(u.cast){g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(c,.45+rnd()*.3);g.beginPath();g.arc(hf[0],hf[1],6+rnd()*3,0,7);g.fill();g.strokeStyle=rgba(c,.85);g.lineWidth=1.2;g.beginPath();g.arc(hf[0],hf[1],11,t*7,t*7+4.5);g.stroke();g.restore()}
}
// chien ninja (Inuzuka) : suit son maître et bondit quand il attaque
function drawDog(u){if(u.dead||!u.ch.look.dog)return;const t=performance.now()/1000,a=u.aim,atk=u.swing>0,d=atk?30:-22,ox=u.x+Math.cos(a+(atk?0:1.9))*Math.abs(d)*(atk?1:1),oy=u.y+Math.sin(a+(atk?0:1.9))*Math.abs(d)+6,p=P(ox,oy),s=p.s*1.25,f=Math.cos(a)>=0?1:-1,run=u.moving?Math.sin(t*16):0;
 // chien en 3D si disponible (même place, même échelle)
 {const dg=u._dog3,tl=dg&&N3.ok&&N3.tile.get(dg);if(tl){dg.aim=a;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(p.x,p.y,13*s,4*s,0,0,7);g.fill();const w=TWU*s,h=THU*s;g.drawImage(N3.cv,tl.sx,tl.sy,TPW,TPH,p.x-w/2,p.y-h+FOOT*s,w,h);return}}
 g.save();g.translate(p.x,p.y);g.scale(s*f,s);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,13,4,0,0,7);g.fill();
 g.strokeStyle=OUT;g.lineWidth=3;for(const [lx,ph] of[[-7,1],[-3,-1],[5,1],[9,-1]]){g.beginPath();g.moveTo(lx,-8);g.lineTo(lx+run*ph*2,-1);g.stroke()}
 outlined(()=>{g.ellipse(0,-11,12,6.5,0,0,7)},'#f4f0e8');outlined(()=>{g.ellipse(11,-17-(atk?2:0),6,5.5,0,0,7)},'#f4f0e8');
 g.fillStyle='#c8a080';g.beginPath();g.moveTo(8,-21);g.lineTo(6,-27);g.lineTo(11,-22);g.fill();g.beginPath();g.moveTo(13,-21);g.lineTo(13,-27);g.lineTo(16,-21);g.fill();
 g.fillStyle='#111';g.fillRect(13,-19,1.6,1.6);g.fillRect(16,-16,2,1.6);g.strokeStyle='#f4f0e8';g.lineWidth=2.5;g.beginPath();g.moveTo(-11,-12);g.quadraticCurveTo(-16,-18+Math.sin(t*12)*3,-15,-22);g.stroke();
 g.restore()}
