// ---------- Cartes supplémentaires (nr_maps.js) ----------
// 10 cartes de plus après les 3 d'origine (0 Terrain d'entraînement, 1 Vallée de la Fin, 2 Désert de Suna, inchangées).
// CFG.map reste l'index numérique de la carte jouée ; CFG.mapRand = « Au hasard » : l'hôte (ou le joueur seul) tire une carte
// à chaque partie, et CFG (envoyé dans chaque snapshot / hello) donne la même carte et les mêmes obstacles à l'invité.
// Chaque carte : thème (couleurs, pour THEME()), disposition d'arène (cercles de collision {x,y,r,k}, symétrique gauche/droite,
// rien sur les points d'apparition ni au centre), et dessin : ciel (pré-rendu hors écran), mur du fond, sol, obstacles, ambiance.
// nr_draw.js appelle NRMAP.hook('sky'|'wall'|'floor'|'obst'|'amb', …) : faux pour les cartes 0-2 (dessin d'origine).
const NRMAP=(()=>{
 const N0=MAPS.length,DEF=[];
 const ARENA0=ARENA_OBST.map(o=>Object.assign({},o)); // les 8 piliers d'origine (cartes 0-2)
 // symétrie gauche/droite : [dx,dy,r,k] avec dx>0 donne aussi -dx
 const sym=L=>L.flatMap(([dx,dy,r,k,o])=>dx?[[-dx,dy,r,k,o],[dx,dy,r,k,o]]:[[0,dy,r,k,o]]);
 function add(name,theme,d){MAPS.push([name]);THEMES.push(theme);DEF[MAPS.length-1]=d}
 const cur=()=>DEF[CFG.map|0]||null;
 const T=()=>performance.now()/1000;
 const hsh=(x,y)=>{let h=Math.imul(x|0,73856093)^Math.imul(y|0,19349663);h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0};
 const rr=(h,n)=>((h>>>n)&255)/255;
 const up=(p,h)=>({x:p.x,y:p.y-h*p.s});
 const onS=q=>q.x>-140&&q.x<W+140&&q.y>-140&&q.y<H+200;
 // décor du sol regroupé par couleur pendant cells() : un seul fill/stroke par couleur et par image (au lieu d'un par détail)
 let BT=null;const bk=(k,mk)=>{let e=BT.get(k);if(!e)BT.set(k,e=mk());return e};
 function ell(x,y,a,b,col,rot=0){a=Math.max(.1,a);b=Math.max(.1,b);if(BT){const P2=bk('f'+col,()=>({f:col,p:new Path2D()})).p;P2.moveTo(x+a*Math.cos(rot),y+a*Math.sin(rot));P2.ellipse(x,y,a,b,rot,0,7);return}g.fillStyle=col;g.beginPath();g.ellipse(x,y,a,b,rot,0,7);g.fill()}
 function fr(col,x,y,w,h){if(BT)bk('f'+col,()=>({f:col,p:new Path2D()})).p.rect(x,y,w,h);else{g.fillStyle=col;g.fillRect(x,y,w,h)}}
 function sp(col,lw,cap){lw=Math.max(.5,Math.round(lw*2)/2);return bk('s'+col+lw+(cap||''),()=>({s:col,lw,cap,p:new Path2D()})).p}
 const quad=(x0,y0,x1,y1,f)=>poly([P(x0,y0),P(x1,y0),P(x1,y1),P(x0,y1)],f);
 const hgr=(x0,x1,cs)=>{const gr=g.createLinearGradient(x0,0,x1,0);cs.forEach((c,i)=>gr.addColorStop(i/(cs.length-1),c));return gr};
 const vgr=(y0,y1,cs)=>{const gr=g.createLinearGradient(0,y0,0,y1);cs.forEach((c,i)=>gr.addColorStop(i/(cs.length-1),c));return gr};
 // cases déterministes du sol (même décor à chaque image, rien hors écran)
function cells(x0,y0,x1,y1,S,f){const own=!BT;if(own)BT=new Map();for(let x=Math.floor(x0/S)*S;x<x1;x+=S)for(let y=Math.floor(y0/S)*S;y<y1;y+=S){const h=hsh(x+S*7,y+S*3),px=x+rr(h,0)*S,py=y+rr(h,8)*S;if(px<x0||px>x1||py<y0||py>y1)continue;const q=P(px,py);if(onS(q))f(q,h,px,py)}
  if(own){const L=BT;BT=null;for(const e of L.values()){if(e.f){g.fillStyle=e.f;g.fill(e.p)}else{g.strokeStyle=e.s;g.lineWidth=e.lw;g.lineCap=e.cap||'butt';g.stroke(e.p)}}g.lineCap='butt'}}
 function grid(x0,y0,x1,y1,sx,sy,col,lw,stag){g.strokeStyle=col;g.lineWidth=lw;g.beginPath();
  if(sx)for(let x=Math.ceil(x0/sx)*sx;x<=x1;x+=sx){if(stag)continue;const a=P(x,y0),b=P(x,y1);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}
  if(sy)for(let y=Math.ceil(y0/sy)*sy;y<=y1;y+=sy){const a=P(x0,y),b=P(x1,y);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}
  if(stag)for(let y=Math.floor(y0/sy)*sy;y<y1;y+=sy){const ya=Math.max(y0,y),yb=Math.min(y1,y+sy),o=((y/sy)&1)*sx/2;for(let x=Math.ceil((x0-o)/sx)*sx+o;x<=x1;x+=sx){const a=P(x,ya),b=P(x,yb);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}}
  g.stroke()}
 // halo sombre sous les ninjas (lisibilité des cercles d'équipe sur les sols clairs)
 function under(){g.strokeStyle='rgba(20,28,44,.38)';g.lineWidth=7;for(const u of units)if(!u.dead&&near(u.x,u.y)){gEll(u.x,u.y,22);g.stroke()}}
 // lueurs pré-rendues (une texture par couleur) : additives, sans dégradé recréé à chaque image
 const GS={};function glowS(col){if(GS[col])return GS[col];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,rgba(col,1));gr.addColorStop(.35,rgba(col,.45));gr.addColorStop(1,rgba(col,0));x.fillStyle=gr;x.fillRect(0,0,64,64);return GS[col]=c}
 function glowAt(x,y,rx,ry,col,a){if(!(rx>0))return;g.globalAlpha=a;g.drawImage(glowS(col),x-rx,y-ry,rx*2,ry*2);g.globalAlpha=1}
 function flame(x,y,s,sd){const t=T(),f=1+Math.sin(t*13+sd)*.12+Math.sin(t*7.3+sd*2)*.08;
  g.fillStyle='#ff7a1a';g.beginPath();g.moveTo(x-6*s,y);g.quadraticCurveTo(x-7*s,y-12*s*f,x+Math.sin(t*9+sd)*2*s,y-22*s*f);g.quadraticCurveTo(x+7*s,y-12*s*f,x+6*s,y);g.fill();
  g.fillStyle='#ffd860';g.beginPath();g.moveTo(x-3*s,y);g.quadraticCurveTo(x-3.5*s,y-7*s*f,x,y-13*s*f);g.quadraticCurveTo(x+3.5*s,y-7*s*f,x+3*s,y);g.fill()}
 // ciel / fond : partie fixe pré-rendue (une fois par carte et par résolution), animations par-dessus
 let SKY=null;
 function skyImg(M){const w=Math.round(W*RS),h=Math.round(H*RS),key=(CFG.map|0)+'|'+w+'x'+h;if(SKY&&SKY.key===key)return SKY.c;
  const c=SKY&&SKY.c.width===w&&SKY.c.height===h?SKY.c:document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.setTransform(RS,0,0,RS,0,0);M.bg(x);SKY={key,c};return c}
 function drawBg(M){g.drawImage(skyImg(M),0,0,W,H)}
 const R=(n,a,b)=>a+(((Math.sin(n*127.1)*43758.5453)%1+1)%1)*(b-a); // pseudo-aléatoire fixe (décor pré-rendu)
 // ombre portée d'un obstacle
 function shadow(p,rx,ry,k=1.25){ell(p.x+9*p.s,p.y+5*p.s,rx*k,ry*k,'rgba(0,0,0,.36)')}
 // colonnes à torche : toutes en arène, une sur deux en bataille
 const torch=o=>o.k?o.k==='column':(!o.rock&&hsh(o.x|0,o.y|0)%2===0);
 // estompe un obstacle haut quand un ninja est caché derrière lui
 function fade(pl,p,top,half){const Z=ZM()*K;for(const u of units){if(u.dead)continue;const dy=pl.y-u.y;if(dy>0&&dy*Z<top+12&&Math.abs(u.x-pl.x)*p.s<half+18){g.globalAlpha=.45;return}}}
 function cyl(p,rx,ry,h,cs,top){g.fillStyle=hgr(p.x-rx,p.x+rx,cs);g.fillRect(p.x-rx,p.y-h,rx*2,h);g.beginPath();g.ellipse(p.x,p.y,rx,ry,0,0,Math.PI);g.fill();if(top){ell(p.x,p.y-h,rx,ry,top)}}
 function band(p,rx,ry,y,col,lw){g.strokeStyle=col;g.lineWidth=lw;g.beginPath();g.ellipse(p.x,y,rx,ry,0,0,Math.PI);g.stroke()}

 // ===== obstacles (un dessin par type ; les cartes associent leurs types) =====
 const OB={
  crate(pl,p,rx,ry,s){shadow(p,rx,ry);const box=(cx,fb,w,hh,d,c0,c1)=>{poly([{x:cx-w,y:fb-hh},{x:cx+w,y:fb-hh},{x:cx+w*.9,y:fb-hh-d},{x:cx-w*.9,y:fb-hh-d}],c1);
    g.fillStyle=c0;g.fillRect(cx-w,fb-hh,w*2,hh);g.strokeStyle='rgba(40,24,10,.65)';g.lineWidth=1.4*s;g.strokeRect(cx-w,fb-hh,w*2,hh);g.beginPath();for(const k of[.33,.66]){g.moveTo(cx-w,fb-hh*k);g.lineTo(cx+w,fb-hh*k)}g.moveTo(cx-w,fb-hh);g.lineTo(cx+w,fb);g.moveTo(cx+w,fb-hh);g.lineTo(cx-w,fb);g.stroke();
    g.strokeStyle='rgba(255,230,180,.35)';g.beginPath();g.moveTo(cx-w*.9,fb-hh-d);g.lineTo(cx+w*.9,fb-hh-d);g.stroke()};
   box(p.x,p.y+ry*.75,rx*.92,rx*1.05,ry*1.4,'#9a7244','#c09864');if(pl.r>=36)box(p.x-rx*.1,p.y+ry*.75-rx*1.05-ry*.45,rx*.6,rx*.66,ry*.8,'#8a6438','#b48a58')},
  pile(pl,p,rx,ry,s){shadow(p,rx,ry);const r=rx*.85,h=95*s;cyl(p,r,r*K,h,['#3a2a1c','#7a6248','#4a3624','#2a1c10'],'#8a7258');for(const k of[.6,.66,.72])band(p,r,r*K,p.y-h*k,'#c8b48a',2*s);
   g.strokeStyle='rgba(60,40,24,.6)';g.lineWidth=1;g.beginPath();for(const k of[.75,.45]){g.moveTo(p.x+r*k,p.y-h);g.ellipse(p.x,p.y-h,r*k,r*K*k,0,0,7)}g.stroke()},
  barrel(pl,p,rx,ry,s){shadow(p,rx,ry);for(const [ox,oy] of[[0,-.5],[-.48,.32],[.48,.32]]){const q={x:p.x+ox*rx,y:p.y+oy*ry*1.4},r=rx*.46,h=44*s;cyl(q,r,r*K,h,['#4a2c14','#a06a38','#6a4220','#3a200c'],'#7a5230');for(const k of[.2,.8])band(q,r,r*K,q.y-h*k,'#2a2a2e',2.4*s)}},
  trunk(pl,p,rx,ry,s){shadow(p,rx*1.1,ry*1.1,1.15);const tw=rx*.72,h=150*s;fade(pl,p,h+rx*.75,rx*1.35);
   for(const [ox,oy,a,b] of[[-1.05,.15,.42,.3],[1.05,.18,.4,.3],[-.5,.62,.38,.26],[.55,.6,.36,.26]])ell(p.x+ox*rx,p.y+oy*ry,a*rx,b*rx,'#3a2616');
   g.fillStyle=hgr(p.x-tw,p.x+tw,['#1e120a','#5a3a22','#6a4628','#3a2414','#160c06']);g.beginPath();g.moveTo(p.x-rx*1.15,p.y+ry*.35);g.quadraticCurveTo(p.x-tw,p.y-h*.12,p.x-tw*.92,p.y-h*.45);g.lineTo(p.x-tw*.86,p.y-h);g.lineTo(p.x+tw*.86,p.y-h);g.lineTo(p.x+tw*.92,p.y-h*.45);g.quadraticCurveTo(p.x+tw,p.y-h*.12,p.x+rx*1.15,p.y+ry*.35);g.quadraticCurveTo(p.x,p.y+ry*.9,p.x-rx*1.15,p.y+ry*.35);g.fill();
   g.strokeStyle='rgba(16,8,4,.55)';g.lineWidth=1.6*s;g.beginPath();for(let k=-2;k<=2;k++){const x=p.x+k*tw*.36;g.moveTo(x+k*3*s,p.y-4*s);g.bezierCurveTo(x-4*s,p.y-h*.35,x+5*s,p.y-h*.65,x,p.y-h)}g.stroke();
   ell(p.x-tw*.35,p.y-h*.42,tw*.25,h*.06,'rgba(90,130,50,.55)');ell(p.x+tw*.3,p.y-h*.18,tw*.22,h*.05,'rgba(90,130,50,.45)');
   for(const [ox,oy,r,c] of[[0,-1.02,1.2,'#14240e'],[-.75,-.97,.85,'#1a2e12'],[.8,-.98,.9,'#182c10'],[-.25,-1.1,.8,'#22381a'],[.35,-1.08,.72,'#26401c']])ell(p.x+ox*rx,p.y+oy*h,r*rx,r*rx*.55,c);
   g.globalAlpha=1},
  root(pl,p,rx,ry,s){shadow(p,rx,ry);const h=30*s;cyl(p,rx*.62,rx*.62*K,h,['#2a1a0e','#6a4a2a','#3a2414'],'#8a6a44');g.strokeStyle='#5a3a20';g.lineWidth=1;for(const k of[.7,.4])g.beginPath(),g.ellipse(p.x,p.y-h,rx*.62*k,rx*.62*K*k,0,0,7),g.stroke();
   g.strokeStyle='#3a2414';g.lineCap='round';for(const [a,l] of[[-2.6,1.2],[-.4,1.15],[2.2,1.05],[.9,1]]){g.lineWidth=7*s;g.beginPath();g.moveTo(p.x+Math.cos(a)*rx*.5,p.y+Math.sin(a)*ry*.5);g.quadraticCurveTo(p.x+Math.cos(a)*rx*.9,p.y+Math.sin(a)*ry*.9-10*s,p.x+Math.cos(a)*rx*l,p.y+Math.sin(a)*ry*l);g.stroke()}g.lineCap='butt';
   ell(p.x-rx*.2,p.y-h-1,rx*.3,rx*.12,'rgba(100,150,60,.6)')},
  hands(pl,p,rx,ry,s){shadow(p,rx,ry,1.3);const ph=16*s;fade(pl,p,ph+110*s,rx);const st=['#6a6458','#b8b0a0','#9a9284','#5a5448'];cyl(p,rx,ry,ph,st,'#c8c0b0');
   // deux mains jointes dans le signe du sceau (index et majeur levés)
   const b=p.y-ph+2*s,fw=rx*.78,fh=58*s,stone=['#7a7264','#c8c0b0','#d4ccbc','#9a9284','#6a6458'];g.fillStyle=hgr(p.x-fw,p.x+fw,stone);g.beginPath();g.roundRect(p.x-fw,b-fh,fw*2,fh,16*s);g.fill();
   g.strokeStyle='rgba(70,62,52,.5)';g.lineWidth=1.6*s;g.beginPath();for(let i=0;i<4;i++){const x=p.x-fw*.62+i*fw*.41;g.moveTo(x,b-fh+4*s);g.quadraticCurveTo(x+fw*.2,b-fh*.62,x,b-fh*.3)}g.moveTo(p.x-fw*.9,b-fh*.3);g.quadraticCurveTo(p.x,b-fh*.18,p.x+fw*.9,b-fh*.3);g.stroke();
   ell(p.x-fw*.98,b-fh*.45,fw*.2,fh*.28,'#a8a090');ell(p.x+fw*.98,b-fh*.45,fw*.2,fh*.28,'#9a9284');
   const fx0=p.x-fw*.36;g.fillStyle=hgr(fx0,fx0+fw*.72,stone);g.beginPath();g.roundRect(fx0,b-fh-40*s,fw*.72,48*s,[12*s,12*s,4*s,4*s]);g.fill();g.strokeStyle='rgba(70,62,52,.5)';g.beginPath();g.moveTo(p.x,b-fh-38*s);g.lineTo(p.x,b-fh+4*s);for(const k of[.4,.75]){g.moveTo(fx0+2*s,b-fh-40*s+48*s*k);g.lineTo(fx0+fw*.72-2*s,b-fh-40*s+48*s*k)}g.stroke();
   g.globalAlpha=1},
  lantern(pl,p,rx,ry,s){shadow(p,rx,ry);const st=['#6a6458','#a8a090','#5a5448'];cyl(p,rx*.75,rx*.75*K,10*s,st,'#b0a898');const r2=rx*.3;g.fillStyle=hgr(p.x-r2,p.x+r2,st);g.fillRect(p.x-r2,p.y-44*s,r2*2,36*s);
   const bw=rx*.62,by=p.y-44*s;g.fillStyle='#8a8476';g.fillRect(p.x-bw,by-24*s,bw*2,24*s);g.fillStyle='#ffd27a';g.fillRect(p.x-bw*.5,by-19*s,bw,13*s);
   poly([{x:p.x-bw*1.6,y:by-24*s},{x:p.x+bw*1.6,y:by-24*s},{x:p.x+bw*.4,y:by-40*s},{x:p.x-bw*.4,y:by-40*s}],'#6a6458');circ(p.x,by-42*s,4*s,'#7a7466');
   g.save();g.globalCompositeOperation='lighter';glowAt(p.x,by-12*s,30*s,30*s,'#ffb040',.35+Math.sin(T()*5+pl.x)*.05);g.restore()},
  block(pl,p,rx,ry,s){shadow(p,rx,ry);for(const [ox,oy,w,h,c] of[[-.35,.1,.55,38,'#a89c84'],[.38,.2,.48,28,'#988c74'],[0,-.35,.42,22,'#b4a890']]){const x=p.x+ox*rx,y=p.y+oy*ry*1.4,hw=w*rx,hh=h*s;poly([{x:x-hw,y:y-hh},{x:x+hw,y:y-hh},{x:x+hw*.85,y:y-hh-hw*.5},{x:x-hw*.85,y:y-hh-hw*.5}],'#cfc4ac');g.fillStyle=c;g.fillRect(x-hw,y-hh,hw*2,hh);g.strokeStyle='rgba(60,50,40,.4)';g.lineWidth=1;g.strokeRect(x-hw,y-hh,hw*2,hh)}},
  tank(pl,p,rx,ry,s){shadow(p,rx,ry);const h=104*s;fade(pl,p,h+20*s,rx);cyl(p,rx,ry,h,['#262e36','#6a7884','#8a98a4','#46525c','#1e252c'],'#5a6670');for(const k of[.18,.5,.82])band(p,rx,ry,p.y-h*k,'#2a3238',3*s);
   g.strokeStyle='#6e7a84';g.lineWidth=1.5*s;g.beginPath();g.ellipse(p.x,p.y-h,rx*.8,ry*.8,0,0,7);g.stroke();ell(p.x-rx*.3,p.y-h,rx*.18,ry*.18,'#2a3238');g.strokeStyle='#3a444c';g.lineWidth=8*s;g.lineCap='round';g.beginPath();g.moveTo(p.x+rx*.2,p.y-h);g.lineTo(p.x+rx*.2,p.y-h-18*s);g.lineTo(p.x+rx*.95,p.y-h-18*s);g.stroke();g.lineCap='butt';
   g.strokeStyle='#8a3a2a';g.lineWidth=2.5*s;g.beginPath();g.ellipse(p.x+rx*.55,p.y-h*.5,7*s,7*s,0,0,7);g.stroke();g.fillStyle='rgba(210,230,255,.16)';g.fillRect(p.x-rx*.42,p.y-h,rx*.16,h);
   g.fillStyle='rgba(10,14,20,.5)';for(const k of[.18,.5,.82])for(let i=-3;i<=3;i++)g.fillRect(p.x+i*rx*.28-1,p.y-h*k-3*s,2,2)},
  pipe(pl,p,rx,ry,s){shadow(p,rx,ry);const r=rx*.85,h=150*s;fade(pl,p,h+r*2,r*2.6);const cs=['#20262c','#5a6670','#7a8892','#3a444c','#1a2026'];cyl(p,r,r*K,h,cs,'#4a545c');for(const k of[.05,.38,.72])cyl({x:p.x,y:p.y-h*k},r*1.25,r*1.25*K,8*s,cs,'#5a646c');
   g.strokeStyle='#3e4850';g.lineWidth=r*1.5;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y-h);g.quadraticCurveTo(p.x,p.y-h-r*1.6,p.x+r*2.6,p.y-h-r*1.6);g.stroke();g.lineCap='butt';
   g.fillStyle='rgba(210,230,255,.14)';g.fillRect(p.x-r*.5,p.y-h,r*.25,h);const t=T(),k=(t*.9+pl.x*.01)%1;ell(p.x+r*2.6,p.y-h-r*1.6+k*h*.9,1.6*s,2.4*s,`rgba(170,200,230,${.7*(1-k)})`)},
  vent(pl,p,rx,ry,s){shadow(p,rx,ry);const w=rx*.92,hh=34*s,fb=p.y+ry*.7,d=ry*1.4;g.fillStyle='#3a434c';g.fillRect(p.x-w,fb-hh,w*2,hh);poly([{x:p.x-w,y:fb-hh},{x:p.x+w,y:fb-hh},{x:p.x+w*.9,y:fb-hh-d},{x:p.x-w*.9,y:fb-hh-d}],'#56616b');
   g.strokeStyle='#22282e';g.lineWidth=2*s;g.beginPath();for(let i=1;i<6;i++){const y=fb-hh-d*i/6;g.moveTo(p.x-w*.82,y);g.lineTo(p.x+w*.82,y)}g.stroke();g.strokeStyle='#22282e';g.lineWidth=1.2;g.strokeRect(p.x-w,fb-hh,w*2,hh);
   const t=T();for(let i=0;i<3;i++){const k=(t*.45+i/3+pl.x*.001)%1;ell(p.x+Math.sin(t+i*2)*8*s,fb-hh-d*.5-k*80*s,(8+k*16)*s,(6+k*12)*s,`rgba(220,228,236,${.32*(1-k)})`)}},
  ice(pl,p,rx,ry,s){shadow(p,rx,ry);ell(p.x,p.y,rx*1.05,ry*1.05,'#e4ecf4');
   for(const [ox,w,h,lean] of[[-.45,.36,62,-.25],[.42,.34,54,.3],[0,.46,88,.05],[-.1,.3,44,-.5],[.2,.28,40,.55]]){const bx=p.x+ox*rx,hw=w*rx,tp={x:bx+lean*h*s*.5,y:p.y-h*s};
    g.fillStyle=hgr(bx-hw,bx+hw,['#5a8ab4','#a8d4f0','#e8f6ff','#7aaed4']);g.beginPath();g.moveTo(bx-hw,p.y+ry*.2);g.lineTo(tp.x-hw*.2,tp.y+8*s);g.lineTo(tp.x,tp.y);g.lineTo(tp.x+hw*.25,tp.y+10*s);g.lineTo(bx+hw,p.y+ry*.2);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.2;g.beginPath();g.moveTo(bx-hw*.2,p.y);g.lineTo(tp.x-hw*.05,tp.y+5*s);g.stroke()}
   ell(p.x,p.y+ry*.35,rx*.9,ry*.4,'#eef4fa')},
  boulder(pl,p,rx,ry,s){shadow(p,rx,ry);const h=52*s;g.fillStyle=hgr(p.x-rx,p.x+rx,['#4a525c','#848c96','#5e666f','#3a4048']);g.beginPath();g.moveTo(p.x-rx,p.y+ry*.3);g.lineTo(p.x-rx*.9,p.y-h*.6);g.lineTo(p.x-rx*.35,p.y-h);g.lineTo(p.x+rx*.5,p.y-h*.9);g.lineTo(p.x+rx,p.y-h*.35);g.lineTo(p.x+rx*.95,p.y+ry*.3);g.quadraticCurveTo(p.x,p.y+ry,p.x-rx,p.y+ry*.3);g.fill();
   g.fillStyle='#f2f6fa';g.beginPath();g.moveTo(p.x-rx*.95,p.y-h*.55);g.lineTo(p.x-rx*.35,p.y-h-3*s);g.lineTo(p.x+rx*.5,p.y-h*.92);g.lineTo(p.x+rx*.98,p.y-h*.36);g.quadraticCurveTo(p.x+rx*.4,p.y-h*.62,p.x,p.y-h*.66);g.quadraticCurveTo(p.x-rx*.5,p.y-h*.5,p.x-rx*.95,p.y-h*.55);g.fill();
   g.fillStyle='rgba(200,225,245,.9)';for(const k of[-.45,.4]){const x=p.x+k*rx,y=p.y-h*(.52+.1*Math.cos(k*3));g.beginPath();g.moveTo(x-2*s,y);g.lineTo(x,y+6*s);g.lineTo(x+2*s,y);g.fill()}},
  pine(pl,p,rx,ry,s){shadow(p,rx,ry);const h=150*s;fade(pl,p,h*.95,rx*1.25);g.fillStyle='#3a2a1c';g.fillRect(p.x-rx*.16,p.y-h*.3,rx*.32,h*.3);
   for(const [y0,w,hh] of[[.22,1.25,.38],[.48,1,.34],[.7,.72,.32]]){const yb=p.y-h*y0,yt=yb-h*hh;g.fillStyle='#2a4034';g.beginPath();g.moveTo(p.x-rx*w,yb);g.lineTo(p.x,yt);g.lineTo(p.x+rx*w,yb);g.fill();g.fillStyle='#eef3f8';g.beginPath();g.moveTo(p.x-rx*w*.62,yb-h*hh*.38);g.lineTo(p.x,yt);g.lineTo(p.x+rx*w*.5,yb-h*hh*.42);g.quadraticCurveTo(p.x,yb-h*hh*.3,p.x-rx*w*.62,yb-h*hh*.38);g.fill()}g.globalAlpha=1},
  column(pl,p,rx,ry,s){shadow(p,rx,ry);const r=rx*.8,h=190*s;fade(pl,p,h,r*1.2);const cs=['#1e1a24','#4e4858','#6a6274','#3a3442','#16121a'];cyl(p,rx*1.05,ry*1.05,14*s,cs,'#5a5464');cyl(p,r,r*K,h,cs,null);cyl({x:p.x,y:p.y-h+16*s},r*1.2,r*1.2*K,16*s,cs,'#4a4454');
   g.strokeStyle='#3a4a34';g.lineWidth=5*s;g.beginPath();for(let i=0;i<=36;i++){const k=i/36,a=k*Math.PI*5,y=p.y-18*s-k*(h-44*s)-Math.sin(a)*4*s,x=p.x+Math.cos(a)*r*.85;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
   g.strokeStyle='rgba(120,150,100,.45)';g.lineWidth=1.5*s;g.stroke();const hy=p.y-h+30*s;ell(p.x+Math.cos(Math.PI*5)*r*.85,hy,6*s,4*s,'#4a5a40');
   if(torch(pl)){const tx=p.x,ty=p.y-82*s;g.fillStyle='#2a2420';g.fillRect(tx-2*s,ty,4*s,14*s);g.fillRect(tx-5*s,ty,10*s,3*s);flame(tx,ty,s,pl.x);g.save();g.globalCompositeOperation='lighter';glowAt(tx,ty-8*s,60*s,60*s,'#ff9a40',.38+Math.sin(T()*11+pl.x)*.06);g.restore()}g.globalAlpha=1},
  snake(pl,p,rx,ry,s){shadow(p,rx,ry);fade(pl,p,110*s,rx);const st=['#2a3028','#5a6656','#3e463a','#1e221c'];for(const [k,y] of[[1,0],[.8,14],[.6,26]]){const q={x:p.x,y:p.y-y*s};g.fillStyle=hgr(q.x-rx*k,q.x+rx*k,st);g.beginPath();g.ellipse(q.x,q.y,rx*k,ry*k*1.05,0,0,7);g.fill();g.strokeStyle='rgba(20,24,18,.6)';g.lineWidth=1.5*s;g.beginPath();g.ellipse(q.x,q.y,rx*k,ry*k*1.05,0,0,Math.PI);g.stroke()}
   const hx=p.x+rx*.15,hy=p.y-96*s;g.strokeStyle='#4a5444';g.lineWidth=14*s;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y-30*s);g.bezierCurveTo(p.x-rx*.6,p.y-60*s,p.x+rx*.6,p.y-72*s,hx,hy);g.stroke();g.strokeStyle='rgba(140,160,120,.35)';g.lineWidth=4*s;g.stroke();g.lineCap='butt';
   ell(hx,hy,15*s,10*s,'#4e5a46');g.fillStyle='#1a0e10';g.beginPath();g.moveTo(hx+4*s,hy+2*s);g.lineTo(hx+22*s,hy+12*s);g.lineTo(hx+16*s,hy-1*s);g.fill();g.fillStyle='#e8e0d0';g.fillRect(hx+8*s,hy+3*s,1.6*s,5*s);
   const e=.75+Math.sin(T()*2.4+pl.x)*.25;circ(hx-2*s,hy-4*s,2.6*s,`rgba(255,220,60,${e})`);circ(hx+6*s,hy-4*s,2.6*s,`rgba(255,220,60,${e})`);g.save();g.globalCompositeOperation='lighter';glowAt(hx+2*s,hy-4*s,22*s,14*s,'#c070ff',.35*e);g.restore();g.globalAlpha=1},
  rubble(pl,p,rx,ry,s){shadow(p,rx,ry);g.save();g.translate(p.x,p.y-10*s);g.rotate(-.12);g.fillStyle=hgr(-rx,rx,['#2a2630','#5a5464','#3a3442']);g.fillRect(-rx*1.05,-14*s,rx*2.1,24*s);ell(rx*1.05,-2*s,6*s,12*s,'#4a4454');g.restore();ell(p.x-rx*.6,p.y+ry*.3,rx*.35,ry*.35,'#3a3440');ell(p.x+rx*.5,p.y+ry*.5,rx*.28,ry*.3,'#46404e')}
 };

 // ===== fonds pré-rendus (contexte x, espace écran 1280×720) =====
 function bgGrad(x,cs,y1){const gr=x.createLinearGradient(0,0,0,y1);cs.forEach((c,i)=>gr.addColorStop(i/(cs.length-1),c));x.fillStyle=gr;x.fillRect(0,0,W,H)}
 function xpoly(x,pts,f){x.fillStyle=f;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill()}
 function xell(x,cx,cy,a,b,f){x.fillStyle=f;x.beginPath();x.ellipse(cx,cy,a,b,0,0,7);x.fill()}
 // foule des gradins (motif répété)
 let CROWD=null;function crowd(){if(CROWD)return CROWD;const c=document.createElement('canvas');c.width=60;c.height=22;const x=c.getContext('2d');x.fillStyle='#5a4e40';x.fillRect(0,0,60,22);
  const cols=['#c84a3a','#3a6ac8','#e8c050','#4a9a5a','#e8e0d0','#8a4ab0','#d07a30','#2a3a5a'],sk=['#f0c8a0','#d8a878','#b8845a'];for(let i=0;i<12;i++){const px=2+i*5+(i%2),py=i%2?4:12;x.fillStyle=cols[(i*5)%8];x.fillRect(px-2,py+4,5,6);x.fillStyle=sk[i%3];x.fillRect(px-1.5,py,4,4)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,20,60,2);return CROWD=g.createPattern(c,'repeat')}

 // ===== sols : base + décor (arène : sol extérieur, murs latéraux) =====
 function baseFloor(x0,y0,x1,y1,c0,c1){const q=[P(x0,y0),P(x1,y0),P(x1,y1),P(x0,y1)];poly(q,vgr(q[0].y,q[3].y,[c0,c1]));return q}
 // remplace les flancs bruns de drawArena (dessinés avant le sol) par ceux de la carte, ou par le fond (pont)
 function eraseSides(M){const [tl,tr,br,bl]=[P(A.x,A.y),P(A.x+A.w,A.y),P(A.x+A.w,A.y+A.h),P(A.x,A.y+A.h)];g.save();g.beginPath();for(const [a,b] of[[tl,bl],[tr,br]]){const c=up(b,44),d=up(a,74);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.lineTo(d.x,d.y);g.closePath()}g.clip();g.setTransform(RS,0,0,RS,0,0);drawBg(M);g.restore()}
 function sideFaces(h0,h1,fill,deco){const [tl,tr,br,bl]=[P(A.x,A.y),P(A.x+A.w,A.y),P(A.x+A.w,A.y+A.h),P(A.x,A.y+A.h)];for(const [a,b] of[[tl,bl],[tr,br]]){const F=[a,b,up(b,h1),up(a,h0)];poly(F,fill);if(deco)deco(a,b,h0,h1)}}
 function floorAll(M,x0,y0,x1,y1,step){const ar=mode!=='battle';
  if(ar){if(M.erase)eraseSides(M);if(M.outer)M.outer()}
  const q=M.ground(x0,y0,x1,y1,step,ar);
  if(ar&&M.sides)M.sides();
  if(M.light)under();
  return q}

 // ---------------- 3 · Pont du Pays des Vagues ----------------
 add('Pont du Pays des Vagues',{sky:['#8aa2b4','#b8c8d2','#dfe6ea'],floor:['#8a6a48','#9a7854'],line:'rgba(50,30,15,.25)',wall:['#6a5038','#4a3624'],post:['#3a2a1c','#7a6248','#2a1c10','#8a7258']},{
  arena:sym([[420,-250,40,'crate'],[420,250,40,'crate'],[180,-330,24,'pile'],[180,330,24,'pile'],[565,0,34,'barrel']]),
  bk:['crate','pile'],erase:1,
  bg(x){bgGrad(x,['#7f97aa','#b4c4cf','#dce4e8'],250);const hz=250;
   const sg=x.createLinearGradient(0,hz,0,H);sg.addColorStop(0,'#7e9cae');sg.addColorStop(.3,'#4e7488');sg.addColorStop(1,'#24465a');x.fillStyle=sg;x.fillRect(0,hz,W,H-hz);
   for(const [cx,w,h,c] of[[150,260,34,'rgba(90,110,125,.7)'],[420,180,22,'rgba(110,130,145,.6)'],[980,320,40,'rgba(80,100,115,.7)'],[1210,160,26,'rgba(100,120,135,.6)']]){xpoly(x,[[cx-w/2,hz],[cx-w*.2,hz-h],[cx+w*.1,hz-h*.8],[cx+w/2,hz]],c);for(let i=0;i<6;i++)xpoly(x,[[cx-w*.3+i*w*.1,hz-h*.6],[cx-w*.3+i*w*.1+6,hz-h-12-R(i+cx,0,14)],[cx-w*.3+i*w*.1+12,hz-h*.6]],c)}
   // le pont inachevé qui file vers l'horizon
   xpoly(x,[[520,hz+6],[760,hz+6],[700,hz-2],[580,hz-2]],'rgba(70,56,42,.8)');for(let i=0;i<5;i++){const px=560+i*36;x.fillStyle='rgba(60,46,34,.8)';x.fillRect(px,hz-14,3,16)}
   x.strokeStyle='rgba(220,235,245,.12)';x.lineWidth=1.5;for(let i=0;i<70;i++){const yy=hz+8+Math.pow(R(i,0,1),1.6)*(H-hz),ww=10+(yy-hz)*.12;x.beginPath();x.moveTo(R(i+9,0,W),yy);x.lineTo(R(i+9,0,W)+ww,yy);x.stroke()}
   xell(x,1040,120,160,40,'rgba(255,255,255,.25)');xell(x,240,90,200,30,'rgba(255,255,255,.2)')},
  sky(){const t=T();g.strokeStyle='rgba(235,245,255,.28)';g.lineWidth=2;g.beginPath();for(let i=0;i<26;i++){const yy=262+Math.pow(((i*.618)%1),1.4)*(H-262),x=((i*211.7+t*(10+i%4*5))%(W+120))-60,w=14+(yy-250)*.1;g.moveTo(x,yy+Math.sin(t*1.5+i)*2);g.lineTo(x+w,yy+Math.sin(t*1.5+i)*2)}g.stroke()},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),pH=46;g.fillStyle='#4a3826';g.beginPath();for(let x=Math.ceil(x0/80)*80;x<=x1;x+=80){const q=P(x,y);g.rect(q.x-3*q.s,q.y-pH*q.s,6*q.s,pH*q.s)}g.fill();
   g.strokeStyle='#5a4430';g.lineWidth=5*a.s;g.beginPath();for(const hh of[pH-2,24]){const c=up(a,hh),d=up(b,hh);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y)}g.stroke();g.strokeStyle='rgba(255,230,190,.25)';g.lineWidth=1.5;g.beginPath();const c=up(a,pH),d=up(b,pH);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y);g.stroke()},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;for(const [u0,u1] of[[L,A.x],[A.x+A.w,Rr]]){baseFloor(u0,A.y,u1,A.y+A.h,'#6e5438','#7a5e40');grid(u0,A.y,u1,A.y+A.h,40,0,'rgba(40,26,12,.4)',1);this.wall(u0,u1,A.y)}},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#8a6a48','#9c7a56'),t=T();
   g.fillStyle='rgba(40,22,8,.08)';g.beginPath();for(let x=Math.floor(x0/80)*80;x<x1;x+=80){const a=Math.max(x0,x),b=Math.min(x1,x+40);if(a>=b)continue;const p0=P(a,y0),p1=P(b,y0),p2=P(b,y1),p3=P(a,y1);g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.lineTo(p3.x,p3.y);g.closePath()}g.fill();
   grid(x0,y0,x1,y1,40,0,'rgba(50,30,14,.45)',1.2);
   g.strokeStyle='rgba(50,30,14,.4)';g.lineWidth=1;g.beginPath();for(let x=Math.floor(x0/40)*40;x<x1;x+=40){const h=hsh(x,7);for(let y=Math.floor(y0/260)*260+((h&255)/255)*260;y<y1;y+=260){if(y<y0)continue;const a=P(x,y),b=P(x+40,y);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}}g.stroke();
   cells(x0,y0,x1,y1,120,(q,h)=>{const s=q.s,k=rr(h,16);if(k<.16){const P2=sp('#c8b080',2*s);for(const r of[9,6,3]){P2.moveTo(q.x+r*s,q.y);P2.ellipse(q.x,q.y,r*s,r*s*K,0,0,7)}}
    else if(k<.3){ell(q.x,q.y,22*s,8*s,'rgba(110,140,160,.22)');ell(q.x-4*s,q.y-1*s,10*s,2.4*s,'rgba(220,235,245,.22)')}
    else if(k<.38){fr('#6a5034',q.x-14*s,q.y-5*s,28*s,6*s);fr('#7a5c3c',q.x-12*s,q.y-11*s,26*s,6*s)}
    else if(k<.46){ell(q.x,q.y,7*s,3*s,'rgba(230,210,170,.5)')}});
   if(ar){const bl=q[3],br=q[2],L=P(A.x-1100,y1),Rr=P(A.x+A.w+1100,y1);poly([L,Rr,{x:Rr.x,y:Rr.y+20*Rr.s},{x:L.x,y:L.y+20*L.s}],'#3a2818');
    for(let x=A.x-1050;x<A.x+A.w+1100;x+=150){const p=P(x,y1);if(p.x<-40||p.x>W+40)continue;g.fillStyle='#2e2016';g.fillRect(p.x-6*p.s,p.y+18*p.s,12*p.s,60*p.s);ell(p.x,p.y+78*p.s+Math.sin(t*2+x)*1.5,14*p.s,3.5*p.s,'rgba(230,245,255,.45)')}}
   return q},
  sides(){const [tl,tr,br,bl]=[P(A.x,A.y),P(A.x+A.w,A.y),P(A.x+A.w,A.y+A.h),P(A.x,A.y+A.h)];for(const [a,b] of[[tl,bl],[tr,br]]){g.strokeStyle='#c8b080';g.lineWidth=2;g.beginPath();const n=6;for(let i=0;i<=n;i++){const k=i/n,x=lerp(a.x,b.x,k),y=lerp(a.y,b.y,k),s=lerp(a.s,b.s,k);i?g.quadraticCurveTo(x+(lerp(a.x,b.x,k-.5/n)-x),y-14*s,x,y-20*s):g.moveTo(x,y-20*s)}g.stroke();for(let i=0;i<=6;i++){const k=i/6,x=lerp(a.x,b.x,k),y=lerp(a.y,b.y,k),s=lerp(a.s,b.s,k);g.fillStyle='#4a3826';g.fillRect(x-3*s,y-24*s,6*s,24*s)}}},
  amb(){const t=T();for(let i=0;i<5;i++){const y=H*.12+i*H*.2,x=((t*(10+i*3)+i*330)%(W+700))-350;ell(x,y,360,46,'rgba(230,240,248,.045)')}
   const vg=g.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(20,40,60,.3)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
 });

 // ---------------- 4 · Forêt de la Mort ----------------
 add('Forêt de la Mort',{sky:['#0c1a10','#16261a','#1e301e'],floor:['#34462a','#3e5230'],line:'rgba(10,20,8,.2)',wall:['#1a2614','#0e160a'],post:['#1e120a','#5a3a22','#160c06','#6a4628']},{
  arena:sym([[250,-235,56,'trunk'],[250,245,52,'trunk'],[540,-195,46,'trunk'],[560,215,42,'trunk'],[0,-345,60,'trunk'],[0,352,34,'root']]),
  bk:['root','trunk'],
  bg(x){bgGrad(x,['#081208','#122216','#1c2e1c'],H);
   for(let i=0;i<22;i++){const cx=R(i,0,W),w=R(i+3,30,90),c=`rgba(${8+i%3*6},${16+i%4*5},${8+i%3*4},.9)`;x.fillStyle=c;x.fillRect(cx-w/2,0,w,H)}
   for(let i=0;i<40;i++)xell(x,R(i+50,0,W),R(i+80,-20,140),R(i+7,60,140),R(i+9,40,80),`rgba(${14+i%5*4},${30+i%4*6},${14+i%3*4},.9)`);
   for(let i=0;i<18;i++){const cx=R(i+30,0,W),w=R(i+40,60,120);x.fillStyle='rgba(6,12,6,.95)';x.fillRect(cx-w/2,140,w,H)}
   for(let i=0;i<30;i++)xell(x,R(i+90,0,W),R(i+120,300,H),R(i+5,40,90),R(i+6,18,40),'rgba(10,24,10,.9)')},
  sky(){const t=T();g.save();g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=160+i*330+Math.sin(t*.2+i)*30,a=.05+.03*Math.sin(t*.7+i*2);g.fillStyle=`rgba(200,230,140,${a})`;g.beginPath();g.moveTo(x,0);g.lineTo(x+70,0);g.lineTo(x+260,H);g.lineTo(x+120,H);g.fill()}g.restore()},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y);poly([a,b,up(b,90),up(a,90)],vgr(a.y-90*a.s,a.y,['#0a1408','#16240f']));
   for(let x=Math.floor(x0/140)*140+30;x<x1;x+=140){const q=P(x+(hsh(x,1)&63),y),w=(26+(hsh(x,2)&15))*q.s;g.fillStyle=hgr(q.x-w,q.x+w,['#140c06','#3e2816','#20140a']);g.fillRect(q.x-w,-20,w*2,q.y+20);ell(q.x,q.y,w*1.35,w*.35,'#20140a')}
   for(let x=Math.floor(x0/60)*60;x<x1;x+=60){const q=P(x,y),h=hsh(x,3);ell(q.x,q.y-6*q.s,(26+(h&15))*q.s,(16+(h>>4&7))*q.s,h&1?'#1a3012':'#22381a')}},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#121c0e','#1a2812');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#33452a','#3e5232'),t=T();
   cells(x0,y0,x1,y1,140,(q,h)=>{const s=q.s;if(rr(h,16)<.55)ell(q.x,q.y,(40+rr(h,20)*40)*s,(16+rr(h,24)*12)*s,rr(h,4)<.5?'rgba(80,120,50,.22)':'rgba(30,40,20,.28)')});
   cells(x0,y0,x1,y1,95,(q,h)=>{const s=q.s,k=rr(h,16);if(k<.3){const P2=sp(rr(h,4)<.5?'#3a2616':'#4a3220',(4+rr(h,12)*3)*s,'round');P2.moveTo(q.x-30*s,q.y);P2.quadraticCurveTo(q.x,q.y-10*s*(rr(h,20)-.3),q.x+34*s,q.y+6*s*(rr(h,24)-.5))}
    else if(k<.38){ell(q.x,q.y,3*s,1.6*s,'#e8e0c8');ell(q.x,q.y-4*s,6*s,3.5*s,'#c03a2a');ell(q.x-2*s,q.y-5*s,1*s,1*s,'#fff')}
    else if(k<.6){const c=['#7a5a20','#8a3a1a','#5a7a2a','#a07a2a'][h&3];for(let i=0;i<3;i++)ell(q.x+(i-1)*8*s,q.y+((h>>(i*3))&7)*s-3*s,3.5*s,1.6*s,c,(h>>i&7)*.5)}
    else if(k<.75){const P2=sp('#2c4a1e',1.5);for(let i=-2;i<=2;i++){P2.moveTo(q.x+i*2*s,q.y);P2.lineTo(q.x+i*4*s,q.y-(7+((h>>(i+3))&3)*2)*s)}}});
   g.save();g.globalCompositeOperation='lighter';cells(x0,y0,x1,y1,190,(q,h)=>{if(rr(h,16)<.45){const a=Math.round((.06+.035*Math.sin(t*.8+(h&31)))*100)/100;ell(q.x,q.y,(50+rr(h,20)*40)*q.s,(16+rr(h,24)*10)*q.s,`rgba(230,240,150,${a})`)}});g.restore();
   return q},
  sides(){sideFaces(80,48,'#0e180a',(a,b)=>{for(let i=0;i<=8;i++){const k=i/8,x=lerp(a.x,b.x,k),y=lerp(a.y,b.y,k),s=lerp(a.s,b.s,k);ell(x,y-14*s,30*s,20*s,i&1?'#1a3012':'#244020');ell(x+6*s,y-26*s,18*s,12*s,'#2c4a24')}})},
  amb(){const t=T();g.save();g.globalCompositeOperation='lighter';for(let i=0;i<18;i++){const sd=i*71.3,x=(sd*7.1+Math.sin(t*.4+i)*60+t*8)%(W+40)-20,y=(sd*3.7%H)+Math.sin(t*.6+i*1.7)*30,a=.35+.35*Math.sin(t*2.2+i*1.3);if(a>.1)glowAt(x,y,12,12,'#d8ff70',a)}g.restore();
   for(let i=0;i<9;i++){const sd=i*97.3,x=((sd*13+t*(14+i%4*5))%(W+100))-50,y=((sd*7+t*(22+i%3*7))%(H+60))-30;g.save();g.translate(x,y);g.rotate(t*(1+i%3)+i);g.fillStyle=i%3?'rgba(90,140,50,.75)':'rgba(170,110,40,.75)';g.beginPath();g.ellipse(0,0,5,2.2,0,0,7);g.fill();g.restore()}
   const vg=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(4,14,4,.5)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
 });

 // ---------------- 5 · Arène de l'examen Chûnin ----------------
 add('Arène de l\'examen Chûnin',{sky:['#4a8ad0','#86b8e4','#cfe6f6'],floor:['#a29678','#94886c'],line:'rgba(60,50,30,.2)',wall:['#b8a888','#8a7a5c'],post:['#6a6458','#b8b0a0','#5a5448','#c8c0b0']},{
  arena:sym([[480,-290,42,'hands'],[480,300,42,'hands'],[0,-368,24,'lantern'],[0,372,24,'lantern']]),
  bk:['block','lantern'],light:1,
  bg(x){bgGrad(x,['#3f80cc','#7cb2e2','#cfe6f6'],330);
   for(const [cx,cy,w] of[[200,80,120],[300,70,80],[900,110,140],[1010,95,90],[620,50,70]]){xell(x,cx,cy,w,w*.28,'rgba(255,255,255,.85)');xell(x,cx+w*.4,cy-w*.12,w*.55,w*.24,'rgba(255,255,255,.9)')}
   // gradins lointains (ovale du stade)
   for(let i=0;i<5;i++){const y0=170+i*30;x.fillStyle=i%2?'#8a7a62':'#7a6a54';x.beginPath();x.moveTo(0,y0+50);x.quadraticCurveTo(W/2,y0-40,W,y0+50);x.lineTo(W,H);x.lineTo(0,H);x.fill();
    x.fillStyle='rgba(0,0,0,.18)';for(let k=0;k<160;k++){const px=k*8+(i%2)*4,py=y0+50-Math.sin(px/W*Math.PI)*88+10;x.fillStyle=['#c84a3a','#3a6ac8','#e8c050','#4a9a5a','#e8e0d0','#8a4ab0'][(k*7+i)%6];x.fillRect(px,py-6,4,6);x.fillStyle='#e8c09a';x.fillRect(px+.5,py-9,3,3)}}
   x.fillStyle='#6a5a46';x.fillRect(0,0,W,24);for(let i=0;i<12;i++){x.fillStyle=i%2?'#c03a2a':'#e8dcc0';x.fillRect(i*110+20,24,30,48);x.fillStyle='#2a6a2a';x.beginPath();x.arc(i*110+35,52,7,0,7);x.fill()}},
  sky(){},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),h=92;poly([a,b,up(b,h),up(a,h)],vgr(a.y-h*a.s,a.y,['#c8b898','#9a8a6a']));
   g.strokeStyle='rgba(90,76,56,.45)';g.lineWidth=1;g.beginPath();for(const k of[.33,.66]){const c=up(a,h*k),d=up(b,h*k);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y)}for(let x=Math.ceil(x0/90)*90;x<x1;x+=90){const q=P(x,y);g.moveTo(q.x,q.y);g.lineTo(q.x,q.y-h*q.s)}g.stroke();
   const pat=crowd(),t=T();for(let i=0;i<3;i++){const h0=h+i*30,h1=h0+30,c=up(a,h0),d=up(b,h0),e=up(b,h1-4),f=up(a,h1-4);g.fillStyle=pat;poly([c,d,e,f]);g.fill();g.fillStyle='rgba(0,0,0,.2)';poly([c,d,up(b,h0+3),up(a,h0+3)]);g.fill()}
   const c=up(a,h+90),d=up(b,h+90);poly([c,d,{x:d.x,y:-10},{x:c.x,y:-10}],'#7a6a54');
   g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<34;i++){const x=lerp(a.x,b.x,((i*.618)%1)),k=Math.sin(t*6+i*2.1);if(k>.6)g.fillRect(x,a.y-(h+8+(i%3)*30)*a.s-k*4,3,3)}
   if(mode!=='battle'&&x0<=CX&&x1>=CX){const q=P(CX,y),s=q.s,bx=q.x,by=q.y-h*s;g.fillStyle='#a8a090';g.fillRect(bx-60*s,by-20*s,120*s,20*s);for(const sd of[-1,1]){g.fillStyle=sd<0?'#b8b0a0':'#a09888';g.beginPath();g.roundRect(bx+sd*26*s-26*s,by-130*s,52*s,112*s,14*s);g.fill()}
    g.strokeStyle='rgba(70,62,52,.5)';g.lineWidth=2*s;g.beginPath();for(let i=0;i<4;i++){g.moveTo(bx-50*s,by-50*s-i*16*s);g.lineTo(bx+50*s,by-50*s-i*16*s)}g.moveTo(bx,by-18*s);g.lineTo(bx,by-130*s);g.stroke();for(const ox of[-10,10]){g.fillStyle='#c4bcac';g.beginPath();g.roundRect(bx+ox*s-9*s,by-200*s,18*s,80*s,8*s);g.fill()}}},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#7a6e58','#6a604c');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#a49878','#968a6e'),S=120;
   g.fillStyle='rgba(60,46,24,.07)';g.beginPath();for(let x=Math.floor(x0/S)*S;x<x1;x+=S)for(let y=Math.floor(y0/S)*S;y<y1;y+=S){if(((x/S+y/S)&1)===0)continue;const a=Math.max(x0,x),b=Math.min(x1,x+S),c=Math.max(y0,y),d=Math.min(y1,y+S);if(a>=b||c>=d)continue;const p0=P(a,c),p1=P(b,c),p2=P(b,d),p3=P(a,d);if(p2.y<-50||p0.y>H+50)continue;g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.lineTo(p3.x,p3.y);g.closePath()}g.fill();
   grid(x0,y0,x1,y1,S,S,'rgba(70,56,36,.35)',1.4);grid(x0,y0+2,x1,y1,S,S,'rgba(255,245,220,.12)',1);
   cells(x0,y0,x1,y1,S,(q,h)=>{const s=q.s,k=rr(h,16);if(k<.3){const P2=sp('rgba(60,48,30,.45)',1);P2.moveTo(q.x,q.y);P2.lineTo(q.x+(rr(h,20)-.5)*30*s,q.y+8*s);P2.lineTo(q.x+(rr(h,24)-.2)*40*s,q.y+4*s)}
    else if(k<.45){const P2=sp('#6a8a3a',1);for(let i=-1;i<=1;i++){P2.moveTo(q.x+i*2*s,q.y);P2.lineTo(q.x+i*3.5*s,q.y-6*s)}}
    else if(k<.52)ell(q.x,q.y,26*s,9*s,'rgba(60,40,20,.12)')});
   return q},
  sides(){sideFaces(80,52,'#a89878',(a,b,h0,h1)=>{g.strokeStyle='rgba(90,76,56,.45)';g.lineWidth=1;g.beginPath();for(const k of[.33,.66]){const c=up(a,h0*k),d=up(b,h1*k);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y)}g.stroke()})},
  amb(){const t=T();for(let i=0;i<10;i++){const sd=i*83.1,x=((sd*11+t*(20+i%4*6))%(W+100))-50,y=((sd*5+t*(18+i%3*6))%(H+60))-30;g.save();g.translate(x,y);g.rotate(t*(1.3+i%3)+i);g.fillStyle=i%2?'rgba(110,170,60,.7)':'rgba(240,190,200,.75)';g.beginPath();g.ellipse(0,0,4.5,2,0,0,7);g.fill();g.restore()}
   const vg=g.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(40,30,10,.28)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
 });

 // ---------------- 6 · Village caché de la Pluie ----------------
 add('Village caché de la Pluie',{sky:['#262c34','#3a424c','#4e5660'],floor:['#4a525a','#3e464e'],line:'rgba(10,14,18,.3)',wall:['#3a4048','#2a3038'],post:['#262e36','#6a7884','#1e252c','#5a6670']},{
  arena:sym([[380,-262,46,'tank'],[380,262,46,'tank'],[170,-178,22,'pipe'],[170,178,22,'pipe'],[0,-335,30,'vent'],[0,338,30,'vent']]),
  bk:['tank','pipe'],
  bg(x){bgGrad(x,['#1e242c','#343c46','#4a525c'],H*.75);
   for(let i=0;i<16;i++){const cx=R(i,0,W),w=R(i+1,40,110),h=R(i+2,200,520),c=`rgb(${30+i%4*5},${36+i%4*5},${44+i%4*5})`;x.fillStyle=c;x.fillRect(cx-w/2,H*.75-h,w,h+200);
    for(let k=0;k<4;k++){x.fillStyle=c;x.fillRect(cx-w/2-12,H*.75-h+30+k*R(i+k,40,90),w+24,8)}
    x.fillStyle='rgba(20,24,30,.9)';x.fillRect(cx-3,H*.75-h-40,6,40);for(let k=0;k<8;k++)if(R(i*9+k,0,1)<.35){x.fillStyle='rgba(255,210,120,.55)';x.fillRect(cx-w/2+6+R(i*7+k,0,w-14),H*.75-h+20+R(i*5+k,0,h-40),4,6)}}
   // la tour de Pain (silhouette au visage)
   x.fillStyle='#1a1f26';x.fillRect(600,40,120,500);xell(x,660,60,70,46,'#1a1f26');x.fillStyle='rgba(255,180,90,.35)';x.fillRect(632,58,14,6);x.fillRect(674,58,14,6);x.fillStyle='#1a1f26';x.fillRect(650,96,20,80);
   for(let i=0;i<6;i++){x.strokeStyle='#20262e';x.lineWidth=10;x.beginPath();x.moveTo(R(i+60,0,W),R(i+61,200,500));x.lineTo(R(i+62,0,W),R(i+63,200,500));x.stroke()}
   x.fillStyle='rgba(10,12,16,.6)';x.fillRect(0,H*.75,W,H*.25)},
  sky(){},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),h=84;poly([a,b,up(b,h),up(a,h)],vgr(a.y-h*a.s,a.y,['#2a3038','#3e464e']));
   g.strokeStyle='rgba(10,14,18,.6)';g.lineWidth=1.5;g.beginPath();for(let x=Math.ceil(x0/60)*60;x<x1;x+=60){const q=P(x,y);g.moveTo(q.x,q.y);g.lineTo(q.x,q.y-h*q.s)}g.stroke();
   for(const [hh,lw,c] of[[34,9,'#4a545e'],[60,6,'#3a444c']]){g.strokeStyle=c;g.lineWidth=lw*a.s;g.beginPath();const c0=up(a,hh),d=up(b,hh);g.moveTo(c0.x,c0.y);g.lineTo(d.x,d.y);g.stroke();g.strokeStyle='rgba(200,220,240,.2)';g.lineWidth=1.5;g.beginPath();g.moveTo(c0.x,c0.y-lw*a.s*.3);g.lineTo(d.x,d.y-lw*a.s*.3);g.stroke()}
   g.fillStyle='rgba(150,170,190,.12)';for(let x=Math.ceil(x0/60)*60+20;x<x1;x+=60){const q=P(x,y),h2=hsh(x,9);g.fillRect(q.x,q.y-h*q.s,2,(h*(.4+(h2&63)/120))*q.s)}},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#1e2328','#262c32');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#4a525a','#40484f'),t=T();
   grid(x0,y0,x1,y1,100,100,'rgba(14,18,22,.55)',1.6);grid(x0+2,y0+3,x1,y1,100,100,'rgba(190,210,230,.08)',1);
   g.fillStyle='rgba(20,24,28,.6)';g.beginPath();for(let x=Math.ceil(x0/100)*100;x<=x1;x+=100)for(let y=Math.ceil(y0/100)*100;y<=y1;y+=100){const p=P(x,y);if(!onS(p))continue;for(const [ox,oy] of[[8,8],[-8,8],[8,-8],[-8,-8]]){const r=P(x+ox,y+oy);g.rect(r.x-1.3,r.y-1,2.6,2)}}g.fill();
   cells(x0,y0,x1,y1,170,(q,h)=>{const s=q.s,k=rr(h,16);if(k<.5){const a=(30+rr(h,20)*40)*s;ell(q.x,q.y,a,a*.32,'rgba(100,122,148,.22)');ell(q.x-a*.18,q.y-a*.04,a*.55,a*.1,'rgba(190,210,235,.18)')}
    else if(k<.62){fr('#262c32',q.x-16*s,q.y-6*s,32*s,12*s);const P2=sp('#14181c',1);for(let i=-3;i<=3;i++){P2.moveTo(q.x+i*4*s,q.y-6*s);P2.lineTo(q.x+i*4*s,q.y+6*s)}}});
   g.strokeStyle='rgba(190,210,235,.4)';g.lineWidth=1;for(let i=0;i<18;i++){const ph=(t+i*.29)/1.1,cy=Math.floor(ph),k=ph-cy,h=hsh(i*31+cy,cy*7),wx=x0+rr(h,0)*(x1-x0),wy=y0+rr(h,8)*(y1-y0),p=P(wx,wy);if(!onS(p))continue;g.globalAlpha=.8*(1-k);g.beginPath();g.ellipse(p.x,p.y,(3+k*18)*p.s,(3+k*18)*p.s*K,0,0,7);g.stroke()}g.globalAlpha=1;
   return q},
  sides(){sideFaces(80,50,'#2e343c',(a,b)=>{g.strokeStyle='#4a545e';g.lineWidth=6*a.s;g.beginPath();const c=up(a,30),d=up(b,24);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y);g.stroke()})},
  amb(){const t=T();g.strokeStyle='rgba(175,195,225,.38)';g.lineWidth=1.2;g.beginPath();for(let i=0;i<150;i++){const sp=900+(i%5)*120,y=((i*137.31)%H+t*sp)%(H+40)-20,x=((i*211.7)%(W+120))-((y/H)*60)-30+Math.sin(i)*20;g.moveTo(x,y);g.lineTo(x-5,y+20)}g.stroke();
   g.strokeStyle='rgba(200,215,240,.2)';g.beginPath();for(let i=0;i<60;i++){const sp=700,y=((i*91.7)%H+t*sp)%(H+40)-20,x=((i*331.3)%(W+120))-((y/H)*40)-30;g.moveTo(x,y);g.lineTo(x-3,y+12)}g.stroke();
   const k=t%11.5;if(k<.35&&OPT.fxi!==0){const lg=g.createLinearGradient(0,0,0,H*.3);lg.addColorStop(0,`rgba(220,230,255,${(k<.12||k>.22)?.12:.04})`);lg.addColorStop(1,'rgba(220,230,255,0)');g.fillStyle=lg;g.fillRect(0,0,W,H*.3)} // éclair lointain : lueur en haut du ciel seulement (pas de flash plein écran), coupée en Faible
   const vg=g.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,16,26,.42)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
 });

 // ---------------- 7 · Pays du Fer ----------------
 add('Pays du Fer',{sky:['#7f90a4','#aebccb','#d6dee6'],floor:['#aab6c4','#9eaabb'],line:'rgba(60,80,110,.15)',wall:['#5a4a3a','#3a2e22'],post:['#3a4048','#6a727c','#2e343a','#f2f6fa']},{
  arena:sym([[300,-290,40,'boulder'],[300,300,36,'ice'],[600,-305,36,'ice'],[600,312,34,'boulder'],[0,-252,42,'ice'],[0,286,40,'boulder']]),
  bk:['ice','pine'],light:1,
  bg(x){bgGrad(x,['#76889c','#a8b6c6','#d6dee6'],300);
   for(const [cx,w,h,c] of[[180,520,190,'#8894a4'],[620,620,250,'#7a8798'],[1080,560,210,'#8692a2'],[1300,400,160,'#909cac']]){xpoly(x,[[cx-w/2,320],[cx-w*.08,320-h],[cx+w*.04,320-h*.94],[cx+w/2,320]],c);xpoly(x,[[cx-w*.18,320-h*.6],[cx-w*.08,320-h],[cx+w*.04,320-h*.94],[cx+w*.16,320-h*.62],[cx+w*.04,320-h*.68],[cx-w*.05,320-h*.58]],'#eef2f6')}
   x.fillStyle='#d0d8e0';x.fillRect(0,320,W,H);
   for(let i=0;i<60;i++){const cx=R(i,0,W),h=R(i+1,40,80),y=R(i+2,320,360);xpoly(x,[[cx-h*.3,y],[cx,y-h],[cx+h*.3,y]],'#3a4c44');xpoly(x,[[cx-h*.15,y-h*.5],[cx,y-h],[cx+h*.15,y-h*.5]],'#e8eef2')}
   // forteresse des samouraïs
   x.fillStyle='#4a4e58';x.fillRect(560,262,160,60);xpoly(x,[[540,266],[740,266],[700,240],[580,240]],'#2e323a');x.fillRect(600,214,80,28);xpoly(x,[[586,218],[694,218],[668,198],[612,198]],'#2e323a')},
  sky(){},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),h=70;g.fillStyle='#4e3e2e';g.beginPath();for(let x=Math.floor(x0/22)*22;x<x1;x+=22){const q=P(x,y),hh=(h+((hsh(x,4)&7)-3))*q.s;g.rect(q.x-10*q.s,q.y-hh,20*q.s,hh)}g.fill();
   g.strokeStyle='rgba(20,14,8,.5)';g.lineWidth=1;g.beginPath();for(let x=Math.floor(x0/22)*22;x<x1;x+=22){const q=P(x,y);g.moveTo(q.x-10*q.s,q.y);g.lineTo(q.x-10*q.s,q.y-h*q.s)}g.stroke();
   g.fillStyle='#f2f6fa';g.beginPath();g.moveTo(up(a,h+4).x,up(a,h+4).y);for(let x=Math.ceil(x0/30)*30;x<=x1;x+=30){const q=P(x,y);g.quadraticCurveTo(q.x-15*q.s,q.y-(h+10)*q.s,q.x,q.y-(h+4)*q.s)}const e=up(b,h-6),f=up(a,h-6);g.lineTo(e.x,e.y);g.lineTo(f.x,f.y);g.fill();
   poly([a,b,up(b,14),up(a,14)],'#e4eaf0')},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#8a96a6','#7e8a9a');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#a9b5c3','#9ba8b8'),t=T();
   cells(x0,y0,x1,y1,160,(q,h)=>{const s=q.s;if(rr(h,16)<.6)ell(q.x,q.y,(50+rr(h,20)*50)*s,(14+rr(h,24)*10)*s,rr(h,4)<.5?'rgba(255,255,255,.2)':'rgba(70,90,120,.1)')});
   cells(x0,y0,x1,y1,110,(q,h)=>{const s=q.s,k=rr(h,16);if(k<.16){ell(q.x,q.y,30*s,10*s,'rgba(120,160,200,.3)');ell(q.x-8*s,q.y-2*s,14*s,3*s,'rgba(255,255,255,.5)')}
    else if(k<.3){ell(q.x,q.y,6*s,3.4*s,'#5a6068');ell(q.x-1*s,q.y-2*s,5*s,2*s,'#f4f8fb')}
    else if(k<.4){for(let i=0;i<4;i++)fr('rgba(80,96,120,.25)',q.x+i*10*s-(i&1)*4*s,q.y+(i&1)*4*s,4*s,2.2*s)}
    else if(k<.56){const a=.5+.5*Math.sin(t*3+(h&63));if(a>.75)ell(q.x,q.y,1.4*s,1.4*s,`rgba(255,255,255,${Math.round(a*10)/10})`)}});
   return q},
  sides(){sideFaces(76,52,'#4e3e2e',(a,b,h0,h1)=>{g.fillStyle='#f2f6fa';poly([up(a,h0+4),up(b,h1+4),up(b,h1-6),up(a,h0-6)]);g.fill()})},
  amb(){const t=T();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();for(let i=0;i<90;i++){const sd=i*53.7,y=((sd*7.3)%H+t*(38+i%4*12))%(H+20)-10,x=((sd*11.1)%W+Math.sin(t*.8+i)*24+t*(18+i%3*6))%(W+20)-10,r=1.2+(i%3)*.7;g.moveTo(x+r,y);g.arc(x,y,r,0,7)}g.fill();
   g.fillStyle='rgba(255,255,255,.55)';g.beginPath();for(let i=0;i<24;i++){const sd=i*91.3,y=((sd*5.1)%H+t*(80+i%3*20))%(H+40)-20,x=((sd*13.7)%W+Math.sin(t*.5+i)*40+t*40)%(W+40)-20;g.moveTo(x+3.2,y);g.arc(x,y,3.2,0,7)}g.fill();
   const vg=g.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(30,45,70,.3)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
 });

 // ---------------- 8 · Repaire d'Orochimaru ----------------
 const LAIR_T=[]; // torches murales (x monde) du fond
 add('Repaire d\'Orochimaru',{sky:['#0a080c','#141018','#1c1622'],floor:['#36303a','#2c2830'],line:'rgba(0,0,0,.3)',wall:['#2e2a32','#1e1a22'],post:['#1e1a24','#4e4858','#16121a','#5a5464']},{
  arena:sym([[200,-262,34,'column'],[200,266,34,'column'],[490,-266,34,'column'],[490,270,34,'column'],[0,-362,40,'snake'],[0,366,36,'snake']]),
  bk:['rubble','column'],
  bg(x){bgGrad(x,['#060408','#100c14','#1a1520'],H);
   for(let i=0;i<14;i++){const y=60+i*44;x.fillStyle=`rgba(40,34,48,${.25+(i%3)*.08})`;for(let k=0;k<26;k++){x.fillRect(k*52+(i%2)*26,y,48,40)}}
   for(let i=0;i<30;i++){const cx=R(i,0,W),w=R(i+1,14,40),h=R(i+2,30,120);xpoly(x,[[cx-w,0],[cx,h],[cx+w,0]],'#0c0a10')}
   x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,0,W,H)},
  sky(){},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),h=100,t=T();poly([a,b,up(b,h),up(a,h)],vgr(a.y-h*a.s,a.y,['#1a161e','#2e2a34']));
   g.strokeStyle='rgba(8,6,10,.7)';g.lineWidth=1.2;g.beginPath();for(let r=0;r<6;r++){const c=up(a,r*h/6),d=up(b,r*h/6);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y);for(let x=Math.ceil(x0/44)*44+(r&1)*22;x<x1;x+=44){const q=P(x,y),y0=q.y-r*h/6*q.s;g.moveTo(q.x,y0);g.lineTo(q.x,y0-h/6*q.s)}}g.stroke();
   for(let x=Math.ceil((x0-120)/340)*340+120;x<x1;x+=340){const q=P(x,y),s=q.s,ty=q.y-62*s;g.fillStyle='#3a2a1e';g.fillRect(q.x-2*s,ty,4*s,16*s);g.fillRect(q.x-6*s,ty,12*s,3*s);flame(q.x,ty,s,x);g.save();g.globalCompositeOperation='lighter';glowAt(q.x,ty-6*s,90*s,70*s,'#ff8a30',.4+Math.sin(t*9+x)*.06);g.restore()}},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#100e12','#141218');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#352f39','#2c2830'),t=T();
   g.fillStyle='rgba(255,240,255,.035)';g.beginPath();for(let x=Math.floor(x0/90)*90;x<x1;x+=90)for(let y=Math.floor(y0/90)*90;y<y1;y+=90){if(hsh(x,y)%3)continue;const a=Math.max(x0,x),b=Math.min(x1,x+90),c=Math.max(y0,y),d=Math.min(y1,y+90);if(a>=b||c>=d)continue;const p0=P(a,c),p1=P(b,c),p2=P(b,d),p3=P(a,d);if(p2.y<-50||p0.y>H+50)continue;g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.lineTo(p3.x,p3.y);g.closePath()}g.fill();
   grid(x0,y0,x1,y1,90,90,'rgba(8,6,10,.65)',1.6);
   cells(x0,y0,x1,y1,130,(q,h)=>{const s=q.s,k=rr(h,16);if(k<.35){const P2=sp('rgba(8,6,10,.6)',1);P2.moveTo(q.x,q.y);P2.lineTo(q.x+(rr(h,20)-.5)*36*s,q.y+9*s);P2.lineTo(q.x+(rr(h,24)-.3)*44*s,q.y+3*s)}
    else if(k<.45){ell(q.x,q.y,5*s,2.6*s,'#4a4450');ell(q.x+6*s,q.y+2*s,3*s,1.8*s,'#3e3846')}
    else if(k<.5){ell(q.x,q.y,7*s,2.4*s,'#c8c0b0');const P2=sp('#a89f90',1.4*s);P2.moveTo(q.x-12*s,q.y+3*s);P2.lineTo(q.x+12*s,q.y-2*s)}});
   if(ar){g.strokeStyle='rgba(150,90,200,.18)';g.lineWidth=3;g.setLineDash([14,10]);gEll(CX,CY,235);g.stroke();g.setLineDash([])}
   // flaques de lumière au pied des colonnes à torche (surface limitée : le mélange additif coûte cher en rendu logiciel)
   g.save();g.globalCompositeOperation='lighter';for(const o of OBST){if(!torch(o))continue;if(!near(o.x,o.y))continue;const p=P(o.x,o.y+14),f=.36+Math.sin(t*9+o.x)*.04;glowAt(p.x,p.y,125*p.s,125*p.s*K,'#ff8a30',f)}g.restore();
   return q},
  sides(){sideFaces(100,60,'#221e28',(a,b,h0,h1)=>{g.strokeStyle='rgba(8,6,10,.7)';g.lineWidth=1;g.beginPath();for(let r=1;r<5;r++){const c=up(a,h0*r/5),d=up(b,h1*r/5);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y)}g.stroke()})},
  amb(){const t=T();g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,200,150,.35)';g.beginPath();for(let i=0;i<22;i++){const sd=i*67.1,x=((sd*9.3)%W+Math.sin(t*.3+i)*40+t*6)%(W+20)-10,y=((sd*4.7)%H-t*(6+i%4*3)+H*4)%H;g.moveTo(x+1.4,y);g.arc(x,y,1.4,0,7)}g.fill();g.restore();
   const fl=.5+Math.sin(t*7.3)*.03+Math.sin(t*13.1)*.02,vg=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(14,4,20,${fl})`);g.fillStyle=vg;g.fillRect(0,0,W,H)}
 });

 // ===== outils des cartes 9-12 =====
 // regroupe les ell / fr / sp d'un bloc de dessin (comme cells) : un seul fill / stroke par couleur
 function bat(f){const own=!BT;if(own)BT=new Map();f();if(own){const L=BT;BT=null;for(const e of L.values()){if(e.f){g.fillStyle=e.f;g.fill(e.p)}else{g.strokeStyle=e.s;g.lineWidth=e.lw;g.lineCap=e.cap||'butt';g.stroke(e.p)}}g.lineCap='butt'}}
 // rectangle du monde projeté au sol, ajouté au lot de sa couleur (à appeler dans bat)
 function gq(col,x0,y0,x1,y1){const a=P(x0,y0),b=P(x1,y0),c=P(x1,y1),d=P(x0,y1),p=bk('f'+col,()=>({f:col,p:new Path2D()})).p;p.moveTo(a.x,a.y);p.lineTo(b.x,b.y);p.lineTo(c.x,c.y);p.lineTo(d.x,d.y);p.closePath()}
 // face avant d'un quai (bande sous le bord sud x0..x1 à la profondeur y)
 function gqf(col,x0,x1,y,h){const a=P(x0,y),b=P(x1,y),p=bk('f'+col,()=>({f:col,p:new Path2D()})).p;p.moveTo(a.x,a.y);p.lineTo(b.x,b.y);p.lineTo(b.x,b.y+h*b.s);p.lineTo(a.x,a.y+h*a.s);p.closePath()}
 function vig(r0,col){const vg=g.createRadialGradient(W/2,H/2,H*r0,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,col);g.fillStyle=vg;g.fillRect(0,0,W,H)}
 // nappe de brume / de nuage pré-rendue une fois (blanche, teintée par l'alpha), étirée à l'affichage
 let FOG=null;function fogS(){if(FOG)return FOG;const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
  for(let i=0;i<18;i++){const cx=R(i+900,50,462),cy=R(i+930,44,84),r=R(i+960,26,64),gr=x.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,512,128)}return FOG=c}
 function fogAt(x,y,w,h,a){g.globalAlpha=a;g.drawImage(fogS(),x,y,w,h);g.globalAlpha=1}

 // ===== obstacles des cartes 9-12 =====
 Object.assign(OB,{
  // Mont Myôboku : statue de crapaud, aiguille rocheuse coiffée de mousse, rocher moussu, bassin d'huile
  toad(pl,p,rx,ry,s){shadow(p,rx,ry,1.2);const ph=14*s,bw=rx*.88,bh=66*s;fade(pl,p,ph+bh+bw*.12,rx*1.05);const st=['#4e5a46','#8a967a','#a4ae92','#6a7660','#3e4838'];cyl(p,rx,ry,ph,st,'#9aa48a');
   const b=p.y-ph;ell(p.x-bw*.84,b-bh*.2,bw*.32,bh*.26,'#66725c');ell(p.x+bw*.84,b-bh*.2,bw*.32,bh*.26,'#56624e');
   g.fillStyle=hgr(p.x-bw,p.x+bw,st);g.beginPath();g.moveTo(p.x-bw,b);g.bezierCurveTo(p.x-bw*1.05,b-bh*.7,p.x-bw*.55,b-bh*1.04,p.x,b-bh);g.bezierCurveTo(p.x+bw*.55,b-bh*1.04,p.x+bw*1.05,b-bh*.7,p.x+bw,b);g.closePath();g.fill();
   ell(p.x,b-bh*.26,bw*.56,bh*.24,'#b2b69a');g.strokeStyle='rgba(36,42,30,.75)';g.lineWidth=2.2*s;g.beginPath();g.moveTo(p.x-bw*.64,b-bh*.6);g.quadraticCurveTo(p.x,b-bh*.44,p.x+bw*.64,b-bh*.6);g.stroke();
   for(const sd of[-1,1]){const ex=p.x+sd*bw*.42,ey=b-bh*.94;ell(ex,ey,bw*.23,bw*.2,'#7e8a70');ell(ex,ey-1*s,bw*.16,bw*.13,'#e6c85a');ell(ex,ey-1*s,bw*.12,bw*.035,'#1a1a10');ell(p.x+sd*bw*.45,b-2*s,bw*.22,bh*.09,'#7a866c')}
   ell(p.x,b-bh*.99,bw*.16,bh*.05,'rgba(110,160,60,.8)');ell(p.x+bw*.55,b-bh*.5,bw*.15,bh*.08,'rgba(110,160,60,.6)');ell(p.x-bw*.62,b-bh*.32,bw*.1,bh*.06,'rgba(110,160,60,.55)')},
  spire(pl,p,rx,ry,s){shadow(p,rx,ry,1.3);const h=(150+(hsh(pl.x|0,pl.y|0)&31))*s,cw=rx*1.65;fade(pl,p,h+cw*.42,cw);
   g.fillStyle=hgr(p.x-rx,p.x+rx,['#4a3a26','#8a7250','#a88e64','#6a5638','#3a2c1c']);g.beginPath();g.moveTo(p.x-rx,p.y+ry*.3);g.quadraticCurveTo(p.x-rx*.5,p.y-h*.4,p.x-rx*.42,p.y-h);g.lineTo(p.x+rx*.42,p.y-h);g.quadraticCurveTo(p.x+rx*.5,p.y-h*.4,p.x+rx,p.y+ry*.3);g.quadraticCurveTo(p.x,p.y+ry*1.05,p.x-rx,p.y+ry*.3);g.fill();
   g.strokeStyle='rgba(40,28,14,.45)';g.lineWidth=1.5*s;g.beginPath();for(const k of[.16,.36,.58,.8]){const w=lerp(rx*.82,rx*.44,k);g.moveTo(p.x-w,p.y-h*k);g.quadraticCurveTo(p.x,p.y-h*k+w*K*.8,p.x+w,p.y-h*k)}g.stroke();
   const cy=p.y-h;ell(p.x,cy+7*s,cw,cw*.4,'#3a5424');ell(p.x,cy,cw*.96,cw*.34,'#5a8a38');ell(p.x-cw*.25,cy-cw*.08,cw*.5,cw*.13,'#7aa84c');
   g.strokeStyle='#3e6a2a';g.lineWidth=2*s;g.beginPath();for(const k of[-.72,-.22,.48,.8]){g.moveTo(p.x+k*cw,cy+cw*.26);g.lineTo(p.x+k*cw*.96,cy+cw*.26+(18+Math.abs(k)*26)*s)}g.stroke()},
  mossrock(pl,p,rx,ry,s){shadow(p,rx,ry);const h=rx*1.02;g.fillStyle=hgr(p.x-rx,p.x+rx,['#4a5046','#8a9282','#a2aa98','#6a7266','#3e443a']);g.beginPath();g.moveTo(p.x-rx,p.y+ry*.2);g.bezierCurveTo(p.x-rx*1.08,p.y-h*.7,p.x-rx*.45,p.y-h*1.02,p.x+rx*.1,p.y-h);g.bezierCurveTo(p.x+rx*.7,p.y-h*.96,p.x+rx*1.06,p.y-h*.5,p.x+rx,p.y+ry*.2);g.quadraticCurveTo(p.x,p.y+ry*1.1,p.x-rx,p.y+ry*.2);g.fill();
   ell(p.x-rx*.12,p.y-h*.84,rx*.6,h*.18,'#5e8a3c');ell(p.x-rx*.28,p.y-h*.9,rx*.3,h*.07,'#86b058');ell(p.x+rx*.62,p.y-h*.36,rx*.16,h*.11,'rgba(94,138,60,.8)');
   g.strokeStyle='rgba(40,44,34,.5)';g.lineWidth=1.4*s;g.beginPath();g.moveTo(p.x+rx*.15,p.y-h*.68);g.lineTo(p.x+rx*.3,p.y-h*.35);g.lineTo(p.x+rx*.2,p.y-h*.05);g.stroke()},
  oil(pl,p,rx,ry,s){shadow(p,rx,ry,1.15);const h=18*s,t=T();cyl(p,rx,ry,h,['#4e5a46','#8a967a','#6a7660','#3e4838'],'#a4ae92');
   const sy=p.y-h;ell(p.x,sy,rx*.8,ry*.8,'#3a2a0e');ell(p.x,sy+1*s,rx*.72,ry*.68,'#7a5a1a');
   const k=(t*.6+pl.x*.01)%1;g.strokeStyle=`rgba(255,220,120,${(.55*(1-k)).toFixed(2)})`;g.lineWidth=1.4*s;g.beginPath();g.ellipse(p.x,sy+2*s,rx*.66*k+1,ry*.6*k+1,0,0,7);g.stroke();ell(p.x-rx*.3,sy-ry*.22,rx*.2,ry*.1,'rgba(255,236,170,.6)');
   // tête de crapaud en pierre qui déverse l'huile dans le bassin
   const hx=p.x,hy=sy-ry*.72;g.fillStyle='#c89a2a';g.fillRect(hx-1.8*s,hy-3*s,3.6*s,sy-hy+3*s);ell(hx,hy-8*s,12*s,8*s,'#7a866c');for(const sd of[-1,1]){ell(hx+sd*6*s,hy-14*s,4*s,4*s,'#8a967a');ell(hx+sd*6*s,hy-14.5*s,2*s,1.6*s,'#e6c85a')}
   ell(hx,hy-3.5*s,6*s,2*s,'#3a2a0e')},
  myo(pl,p,rx,ry,s){(hsh(pl.x|0,pl.y|0)%3?OB.spire:OB.toad)(pl,p,rx,ry,s)},

  // Kiri : pieux d'amarrage, îlot rocheux, tombe de Zabuza (Kubikiribôchô plantée)
  piling(pl,p,rx,ry,s){const t=T(),k=(t*.5+pl.x*.003)%1;ell(p.x+6*s,p.y+3*s,rx*1.05,ry*1.05,'rgba(0,10,16,.35)');g.strokeStyle=`rgba(200,225,232,${(.5*(1-k)).toFixed(2)})`;g.lineWidth=1.3*s;g.beginPath();g.ellipse(p.x,p.y,rx*(.9+k*.5),ry*(.9+k*.5),0,0,7);g.stroke();fade(pl,p,92*s,rx);
   const cs=['#2a1e14','#6a5238','#7a6448','#3e2e1e'];let L=null;
   for(const [ox,oy,r,hh] of[[-.45,-.32,.3,78],[.44,-.26,.28,64],[0,.36,.33,88]]){const q={x:p.x+ox*rx,y:p.y+oy*ry},r2=r*rx,top=q.y-hh*s;cyl(q,r2,r2*K,hh*s,cs,'#8a7458');band(q,r2,r2*K,q.y-5*s,'rgba(60,100,80,.8)',5*s);g.strokeStyle='rgba(30,20,10,.5)';g.lineWidth=1;g.beginPath();g.ellipse(q.x,top,r2*.55,r2*K*.55,0,0,7);g.stroke();
    if(L){g.strokeStyle='#c8b48a';g.lineWidth=2*s;g.beginPath();g.moveTo(L.x,L.y);g.quadraticCurveTo((L.x+q.x)/2,Math.max(L.y,top+22*s)+10*s,q.x,top+22*s);g.stroke()}L={x:q.x,y:top+22*s}}},
  islet(pl,p,rx,ry,s){const t=T();ell(p.x,p.y+2*s,rx*1.14,ry*1.14,'rgba(210,230,236,.32)');ell(p.x,p.y,rx*1.02,ry*1.02,'#26343a');
   g.strokeStyle='#5a7448';g.lineWidth=1.6*s;g.beginPath();for(let i=0;i<7;i++){const bx=p.x+(i/6-.5)*rx*1.1,by=p.y-ry*.4+(i&1)*3*s,hh=(30+(i*13)%22)*s,sw=Math.sin(t*1.3+i+pl.x)*3*s;g.moveTo(bx,by);g.quadraticCurveTo(bx+sw*.5,by-hh*.6,bx+sw+(i-3)*1.5*s,by-hh)}g.stroke();
   for(const [ox,oy,w,hh,c] of[[-.35,-.15,.55,40,'#56646a'],[.4,-.05,.48,30,'#4a585e'],[0,.4,.5,22,'#606e74']]){const x=p.x+ox*rx,y=p.y+oy*ry,hw=w*rx,H0=hh*s;g.fillStyle=hgr(x-hw,x+hw,['#2e3a3e',c,'#8a989c','#3a464a']);g.beginPath();g.moveTo(x-hw,y);g.bezierCurveTo(x-hw,y-H0*.8,x-hw*.3,y-H0,x+hw*.1,y-H0);g.bezierCurveTo(x+hw*.7,y-H0*.9,x+hw,y-H0*.4,x+hw,y);g.quadraticCurveTo(x,y+hw*K*.7,x-hw,y);g.fill();ell(x-hw*.2,y-H0*.82,hw*.35,H0*.1,'rgba(220,235,240,.25)')}
   const k=(t*.4+pl.y*.002)%1;g.strokeStyle=`rgba(220,238,242,${(.45*(1-k)).toFixed(2)})`;g.lineWidth=1.2*s;g.beginPath();g.ellipse(p.x,p.y,rx*(1.05+k*.4),ry*(1.05+k*.4),0,0,7);g.stroke()},
  sword(pl,p,rx,ry,s){shadow(p,rx,ry);const bw=rx*.66,bh=118*s,bt=p.y-rx*.38;fade(pl,p,rx*.38+bh+34*s,rx);
   g.fillStyle=hgr(p.x-rx,p.x+rx,['#3a464a','#7a868a','#94a0a4','#56626a','#2e383c']);g.beginPath();g.moveTo(p.x-rx,p.y+ry*.2);g.bezierCurveTo(p.x-rx,p.y-rx*.45,p.x-rx*.4,p.y-rx*.62,p.x+rx*.1,p.y-rx*.58);g.bezierCurveTo(p.x+rx*.7,p.y-rx*.55,p.x+rx,p.y-rx*.3,p.x+rx,p.y+ry*.2);g.quadraticCurveTo(p.x,p.y+ry*1.1,p.x-rx,p.y+ry*.2);g.fill();
   g.save();g.translate(p.x,bt);g.rotate(.07);g.fillStyle=hgr(-bw/2,bw/2,['#5a646c','#c8d0d6','#eef3f6','#8a949c']);g.beginPath();g.moveTo(-bw/2,0);g.lineTo(-bw/2,-bh);g.lineTo(bw/2,-bh);g.lineTo(bw/2,-bh*.8);g.arc(bw/2,-bh*.7,bh*.1,-Math.PI/2,Math.PI/2,true);g.lineTo(bw/2,0);g.closePath();g.moveTo(-bw*.02+bw*.2,-bh*.84);g.arc(-bw*.02,-bh*.84,bw*.2,0,7);g.fill('evenodd');
   g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.5*s;g.beginPath();g.moveTo(-bw/2+1.5*s,-3*s);g.lineTo(-bw/2+1.5*s,-bh+2*s);g.stroke();g.strokeStyle='rgba(40,50,56,.6)';g.lineWidth=1.2*s;g.strokeRect(-bw/2,-bh,bw,bh);
   g.fillStyle='#2a2a30';g.fillRect(-3.5*s,-bh-34*s,7*s,34*s);g.fillStyle='#d8d0c0';for(let i=0;i<4;i++)g.fillRect(-3.5*s,-bh-30*s+i*8*s,7*s,2.5*s);g.restore()},

  // Kumo : pic rocheux stratifié, rochers anguleux, paratonnerre de chakra, maison-dôme
  pinnacle(pl,p,rx,ry,s){shadow(p,rx,ry,1.25);const h=(150+(hsh(pl.x|0,pl.y|0)&31))*s;fade(pl,p,h,rx*.95);
   g.fillStyle=hgr(p.x-rx,p.x+rx,['#4e443c','#86786a','#a89a88','#6a5e52','#40382f']);g.beginPath();g.moveTo(p.x-rx,p.y+ry*.3);for(const [fx,fy] of[[-.86,-.3],[-.64,-.6],[-.5,-.86],[-.18,-1],[.08,-.93],[.32,-.7],[.56,-.46],[.82,-.2]])g.lineTo(p.x+fx*rx,p.y+fy*h);g.lineTo(p.x+rx,p.y+ry*.3);g.quadraticCurveTo(p.x,p.y+ry*1.05,p.x-rx,p.y+ry*.3);g.fill();
   g.fillStyle='rgba(255,244,222,.17)';g.beginPath();g.moveTo(p.x-rx*.18,p.y-h);g.lineTo(p.x+rx*.08,p.y-h*.93);g.lineTo(p.x+rx*.32,p.y-h*.7);g.lineTo(p.x+rx*.56,p.y-h*.46);g.lineTo(p.x+rx*.82,p.y-h*.2);g.lineTo(p.x+rx,p.y+ry*.3);g.lineTo(p.x+rx*.35,p.y+ry*.5);g.lineTo(p.x+rx*.1,p.y-h*.55);g.closePath();g.fill();
   g.strokeStyle='rgba(46,36,26,.42)';g.lineWidth=1.5*s;g.beginPath();for(const k of[.16,.34,.52,.7,.86]){const w=lerp(rx*.92,rx*.3,k);g.moveTo(p.x-w,p.y-h*k+2*s);g.lineTo(p.x-w*.2,p.y-h*k-1*s);g.lineTo(p.x+w*.7,p.y-h*k+1.5*s)}g.stroke();
   ell(p.x+rx*.48,p.y-h*.46,rx*.2,5*s,'#6a8a44');ell(p.x-rx*.5,p.y-h*.7,rx*.14,4*s,'#5a7a3a')},
  crag(pl,p,rx,ry,s){shadow(p,rx,ry);for(const [ox,oy,w,hh,c0,c1] of[[-.38,-.25,.54,50,'#6e6256','#a89a86'],[.36,-.1,.52,40,'#62574c','#9a8c78'],[-.04,.38,.48,28,'#786c60','#b0a290']]){const x=p.x+ox*rx,y=p.y+oy*ry,hw=w*rx,H0=hh*s;
    g.fillStyle=c0;g.beginPath();g.moveTo(x-hw,y);g.lineTo(x-hw*.72,y-H0*.84);g.lineTo(x-hw*.1,y-H0);g.lineTo(x+hw*.62,y-H0*.74);g.lineTo(x+hw,y);g.quadraticCurveTo(x,y+hw*K*.8,x-hw,y);g.fill();
    g.fillStyle=c1;g.beginPath();g.moveTo(x-hw*.72,y-H0*.84);g.lineTo(x-hw*.1,y-H0);g.lineTo(x+hw*.62,y-H0*.74);g.lineTo(x+hw*.08,y-H0*.6);g.fill()}},
  rod(pl,p,rx,ry,s){shadow(p,rx,ry);const t=T(),b=16*s,h=118*s;cyl(p,rx,ry,b,['#5a5048','#9a8c78','#463e36'],'#a89a86');fade(pl,p,b+h+8*s,rx);
   g.fillStyle=hgr(p.x-3*s,p.x+3*s,['#3a3a40','#a8b0ba','#4a4a52']);g.fillRect(p.x-3*s,p.y-b-h,6*s,h);
   for(const k of[.22,.48,.74]){ell(p.x,p.y-b-h*k+1.5*s,8*s,3*s,'#8a5428');ell(p.x,p.y-b-h*k,8*s,2.6*s,'#e0a060')}
   const tx=p.x,ty=p.y-b-h,ph=Math.floor(t*12+pl.x),on=ph%5<3;circ(tx,ty,7*s,'#d8e8f6');
   if(on){g.strokeStyle='rgba(200,236,255,.9)';g.lineWidth=1.6*s;g.beginPath();for(let a=0;a<3;a++){const an=(ph*2.3+a*2.1)%6.28;g.moveTo(tx,ty);for(let k=1;k<=4;k++)g.lineTo(tx+Math.cos(an)*k*7*s+Math.sin(ph+k*a)*4*s,ty+Math.sin(an)*k*5*s+Math.cos(ph*1.3+k)*4*s)}g.stroke()}
   g.save();g.globalCompositeOperation='lighter';glowAt(tx,ty,34*s,34*s,'#7ac8ff',on?.55:.3);g.restore()},
  dome(pl,p,rx,ry,s){shadow(p,rx,ry,1.2);const h=50*s,dh=rx*.85;fade(pl,p,h+dh+14*s,rx);const wc=['#9aa4ae','#e8eef2','#f6f9fb','#c4ccd4','#8a949e'];cyl(p,rx,ry,h,wc,null);
   g.fillStyle=hgr(p.x-rx,p.x+rx,wc);g.beginPath();g.ellipse(p.x,p.y-h,rx,dh,0,Math.PI,0);g.fill();band(p,rx,ry,p.y-h,'#4e72a0',4.5*s);band(p,rx,ry,p.y-5*s,'#8a949e',4*s);
   g.fillStyle='#2a3a52';for(const k of[-.55,.55])g.fillRect(p.x+k*rx-4*s,p.y-h*.72,8*s,11*s);g.fillStyle='#3a3020';g.beginPath();g.roundRect(p.x-7*s,p.y+ry-30*s,14*s,28*s,[7*s,7*s,0,0]);g.fill();
   ell(p.x-rx*.36,p.y-h-dh*.55,rx*.22,dh*.13,'rgba(255,255,255,.75)');g.fillStyle='#4a4a52';g.fillRect(p.x-1.2*s,p.y-h-dh-14*s,2.4*s,14*s);circ(p.x,p.y-h-dh-14*s,2.6*s,'#e0a060')},

  // Quatrième Guerre : dalle de terre fracturée, pieux de Mokuton, tombe d'armes et bannière
  shard(pl,p,rx,ry,s){shadow(p,rx,ry,1.3);const h=(64+(hsh(pl.x|0,pl.y|0)&15))*s,TP=[[-.86,-.5],[-.6,-.68],[-.42,-.6],[-.14,-.98],[.16,-.8],[.42,-.9],[.7,-.44],[.92,-.22]],dx=rx*.2,dy=-h*.14;fade(pl,p,h-dy,rx);
   ell(p.x-rx*.98,p.y+ry*.45,rx*.2,ry*.25,'#5a4a3a');ell(p.x+rx*.95,p.y+ry*.55,rx*.15,ry*.2,'#6a5644');
   g.fillStyle='#a8916e';g.beginPath();TP.forEach(([fx,fy],i)=>i?g.lineTo(p.x+fx*rx,p.y+fy*h):g.moveTo(p.x+fx*rx,p.y+fy*h));for(let i=TP.length-1;i>=0;i--)g.lineTo(p.x+TP[i][0]*rx+dx,p.y+TP[i][1]*h+dy);g.closePath();g.fill();
   g.fillStyle=hgr(p.x-rx,p.x+rx,['#3e3024','#7a6650','#5e4c3c','#33281e']);g.beginPath();g.moveTo(p.x-rx,p.y+ry*.3);for(const [fx,fy] of TP)g.lineTo(p.x+fx*rx,p.y+fy*h);g.lineTo(p.x+rx,p.y+ry*.35);g.quadraticCurveTo(p.x,p.y+ry*1.1,p.x-rx,p.y+ry*.3);g.fill();
   g.strokeStyle='rgba(255,230,190,.35)';g.lineWidth=1.5*s;g.beginPath();TP.forEach(([fx,fy],i)=>i?g.lineTo(p.x+fx*rx,p.y+fy*h):g.moveTo(p.x+fx*rx,p.y+fy*h));g.stroke();
   g.strokeStyle='rgba(30,20,12,.6)';g.beginPath();g.moveTo(p.x-rx*.14,p.y-h*.96);g.lineTo(p.x-rx*.05,p.y-h*.55);g.lineTo(p.x-rx*.28,p.y-h*.1);g.moveTo(p.x+rx*.42,p.y-h*.86);g.lineTo(p.x+rx*.5,p.y-h*.4);g.lineTo(p.x+rx*.4,p.y);g.moveTo(p.x-rx*.6,p.y-h*.66);g.lineTo(p.x-rx*.66,p.y-h*.3);g.stroke();
   poly([{x:p.x-rx*.72,y:p.y+ry*.62},{x:p.x-rx*.5,y:p.y-h*.28},{x:p.x-rx*.12,y:p.y+ry*.72}],'#5a4838');poly([{x:p.x-rx*.5,y:p.y-h*.28},{x:p.x-rx*.12,y:p.y+ry*.72},{x:p.x-rx*.36,y:p.y+ry*.6}],'#8a7458')},
  mokuton(pl,p,rx,ry,s){shadow(p,rx*1.1,ry*1.1,1.2);const H0=150*s;fade(pl,p,H0+10*s,rx*1.25);
   g.strokeStyle='#3e2a18';g.lineCap='round';g.lineWidth=7*s;g.beginPath();for(const a of[-2.7,-.5,2.4,.9]){g.moveTo(p.x+Math.cos(a)*rx*.3,p.y+Math.sin(a)*ry*.3);g.quadraticCurveTo(p.x+Math.cos(a)*rx*.8,p.y+Math.sin(a)*ry*.8-6*s,p.x+Math.cos(a)*rx*1.1,p.y+Math.sin(a)*ry*1.1)}g.stroke();g.lineCap='butt';
   for(const [ox,hh,w,lean] of[[-.4,.74,.42,-.38],[.42,.6,.38,.42],[0,1,.55,.08]]){const bx=p.x+ox*rx,bw=w*rx,hT=H0*hh,tx=bx+lean*hT*.35,ty=p.y-hT;
    g.fillStyle=hgr(bx-bw,bx+bw,['#2a1a0e','#6a4a2c','#8a6a44','#4a3220','#24160a']);g.beginPath();g.moveTo(bx-bw,p.y+ry*.2);g.quadraticCurveTo(bx-bw*.55+lean*hT*.1,p.y-hT*.5,tx,ty);g.quadraticCurveTo(bx+bw*.6+lean*hT*.2,p.y-hT*.45,bx+bw,p.y+ry*.2);g.closePath();g.fill();
    g.strokeStyle='rgba(20,10,4,.5)';g.lineWidth=1.4*s;g.beginPath();g.moveTo(bx-bw*.3,p.y);g.quadraticCurveTo(bx-bw*.2+lean*hT*.1,p.y-hT*.5,tx,ty+hT*.15);g.moveTo(bx+bw*.35,p.y);g.quadraticCurveTo(bx+bw*.3+lean*hT*.15,p.y-hT*.4,tx+1*s,ty+hT*.25);g.stroke()}
   ell(p.x-rx*.22,p.y-H0*.45,5*s,3*s,'#5a8a3a');ell(p.x+rx*.5,p.y-H0*.3,4*s,2.4*s,'#6a9a44')},
  weapons(pl,p,rx,ry,s){shadow(p,rx,ry);const t=T();fade(pl,p,100*s,rx*1.3);ell(p.x,p.y,rx*1.02,ry*1.02,'#5a4634');ell(p.x,p.y-4*s,rx*.85,ry*.75,'#6e5840');ell(p.x-rx*.2,p.y-6*s,rx*.4,ry*.3,'#7e6a50');
   const bx=p.x-rx*.35,by=p.y-6*s,top=by-96*s,wv=Math.sin(t*2.4+pl.x)*4*s,cw=34*s,ch=26*s;g.fillStyle='#2a1e14';g.fillRect(bx-1.6*s,top,3.2*s,96*s);
   g.fillStyle='#d8ccb0';g.beginPath();g.moveTo(bx,top+3*s);g.quadraticCurveTo(bx+cw*.5,top+3*s+wv,bx+cw,top+5*s+wv*.6);g.lineTo(bx+cw*.84,top+ch*.55+wv*.6);g.lineTo(bx+cw*.95,top+ch+wv*.4);g.lineTo(bx+cw*.55,top+ch*.8+wv);g.lineTo(bx+cw*.3,top+ch+wv*.5);g.lineTo(bx,top+ch);g.fill();
   g.strokeStyle='#8a2a22';g.lineWidth=2*s;g.beginPath();g.arc(bx+cw*.45,top+ch*.45+wv*.6,6*s,0,7);g.stroke();
   g.lineCap='round';for(const [ox,a,L,c] of[[.12,-.28,40,'#9aa0a8'],[.48,.3,34,'#8a9098'],[-.02,.14,28,'#7a8088'],[.66,-.1,24,'#a0a6ae']]){const x0=p.x+ox*rx,y0=p.y-4*s,x1=x0+Math.sin(a)*L*s,y1=y0-Math.cos(a)*L*s;g.strokeStyle=c;g.lineWidth=3*s;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.strokeStyle='#3a2a1e';g.lineWidth=4*s;g.beginPath();g.moveTo(x1,y1);g.lineTo(x1+Math.sin(a)*8*s,y1-Math.cos(a)*8*s);g.stroke()}g.lineCap='butt'},
  warMix(pl,p,rx,ry,s){(hsh(pl.x|0,pl.y|0)%4?OB.mokuton:OB.weapons)(pl,p,rx,ry,s)}
 });

 // ---------------- 9 · Mont Myôboku ----------------
 add('Mont Myôboku',{sky:['#8fbf9a','#c6dca6','#efe6b4'],floor:['#6f7c40','#7b8648'],line:'rgba(30,40,10,.2)',wall:['#4a5a2a','#33401c'],post:['#4e5a46','#9aa48a','#3a4434','#7e9a4e']},{
  arena:sym([[230,-300,30,'spire'],[540,-278,44,'toad'],[262,262,34,'mossrock'],[565,302,30,'spire'],[0,-345,32,'oil'],[0,352,30,'oil']]),
  bk:['mossrock','myo'],light:1,
  bg(x){bgGrad(x,['#86b896','#c2daa4','#f2e8b6'],300);
   const sg=x.createRadialGradient(880,120,10,880,120,280);sg.addColorStop(0,'rgba(255,250,215,.9)');sg.addColorStop(1,'rgba(255,250,215,0)');x.fillStyle=sg;x.fillRect(0,0,W,H);
   // aiguilles rocheuses lointaines coiffées de mousse (les « champignons » de pierre du mont)
   for(let L=0;L<2;L++)for(let i=0;i<8;i++){const cx=R(i*3+L*50+300,10,W-10),w=R(i+L*20+310,18,40)*(1+L*.35),top=R(i+L*7+320,40,150)+L*50,c=L?'#86a68a':'#a6c0a2',cap=L?'#5e8a50':'#86a87a';
    x.fillStyle=c;x.beginPath();x.moveTo(cx-w,300);x.quadraticCurveTo(cx-w*.6,top+60,cx-w*.55,top+12);x.lineTo(cx+w*.55,top+12);x.quadraticCurveTo(cx+w*.6,top+60,cx+w,300);x.fill();
    x.strokeStyle='rgba(60,70,40,.18)';x.lineWidth=2;for(let k=1;k<4;k++){const yy=top+12+k*(300-top)/4;x.beginPath();x.moveTo(cx-w*.7,yy);x.lineTo(cx+w*.7,yy);x.stroke()}
    xell(x,cx,top+10,w*1.6,w*.5,cap);xell(x,cx-w*.35,top+3,w*.75,w*.2,'rgba(220,240,180,.45)')}
   for(let i=0;i<8;i++)xell(x,R(i+340,0,W),300,R(i+350,140,260),R(i+360,46,80),i%2?'#5e8a58':'#6a985e');
   // feuilles géantes et cascade d'huile au loin
   x.fillStyle='rgba(230,190,90,.55)';x.fillRect(1090,120,14,180);xell(x,1097,300,30,8,'rgba(255,230,150,.5)');
   for(let i=0;i<10;i++){const bx=R(i+370,0,W),by=R(i+380,262,300),Lf=R(i+390,70,150),a=R(i+400,-2.5,-.65);x.save();x.translate(bx,by);x.rotate(a);x.fillStyle=i%2?'#4a8440':'#56944a';x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(Lf*.5,-Lf*.3,Lf,0);x.quadraticCurveTo(Lf*.5,Lf*.3,0,0);x.fill();x.strokeStyle='rgba(220,240,170,.45)';x.lineWidth=2;x.beginPath();x.moveTo(0,0);x.lineTo(Lf*.95,0);x.stroke();x.restore()}
   x.fillStyle='#4e7040';x.fillRect(0,300,W,H)},
  sky(){},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),h=50;poly([a,b,up(b,h),up(a,h)],vgr(a.y-h*a.s,a.y,['#3a5428','#56663a']));
   bat(()=>{for(let x=Math.floor(x0/170)*170+60;x<x1;x+=170){const hh=hsh(x,12),q=P(x+(hh&63),y),s=q.s,Lf=(70+(hh>>6&31))*s,d=hh&1?1:-1,P2=sp(hh&2?'#4a7a34':'#5a8a3c',6*s,'round');P2.moveTo(q.x,q.y-20*s);P2.quadraticCurveTo(q.x+d*Lf*.15,q.y-Lf*.85,q.x+d*Lf*.5,q.y-Lf)}
    for(let x=Math.floor(x0/70)*70;x<x1;x+=70){const hh=hsh(x,11),q=P(x+(hh&31),y),s=q.s,r=(30+(hh>>5&15))*s;ell(q.x,q.y-r*.45,r,r*.72,hh&1?'#6a7468':'#5e685c');ell(q.x-r*.15,q.y-r*.95,r*.72,r*.28,hh&2?'#5e8a3c':'#6a9444')}})},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#56632e','#5e6a34');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#6c7a3e','#788446');
   cells(x0,y0,x1,y1,150,(q,h)=>{const s=q.s;if(rr(h,16)<.5)ell(q.x,q.y,(46+rr(h,20)*40)*s,(15+rr(h,24)*10)*s,rr(h,4)<.5?'rgba(160,180,90,.22)':'rgba(60,50,20,.16)')});
   // cercle de pierres plates de l'entraînement des ermites (arène)
   if(ar)bat(()=>{for(let i=0;i<16;i++){const a=i/16*Math.PI*2,p=P(CX+Math.cos(a)*250,CY+Math.sin(a)*250),s=p.s;ell(p.x,p.y+2.5*s,22*s,9*s,'rgba(40,40,20,.3)');ell(p.x,p.y,20*s,8*s,'#a8a488');ell(p.x-3*s,p.y-1.5*s,11*s,3.6*s,'#c4c0a2')}});
   cells(x0,y0,x1,y1,105,(q,h)=>{const s=q.s,k=rr(h,16);
    if(k<.07){ell(q.x,q.y,26*s,9*s,'rgba(40,30,8,.55)');ell(q.x+1*s,q.y+.5*s,21*s,7*s,'#8a6418');ell(q.x-5*s,q.y-2*s,10*s,2.4*s,'rgba(255,226,130,.7)');ell(q.x+9*s,q.y+2*s,4*s,1.2*s,'rgba(255,226,130,.45)')} // flaque de l'huile des crapauds
    else if(k<.22){ell(q.x,q.y,6*s,3.6*s,'#6e7260');ell(q.x-1*s,q.y-1.4*s,5*s,2.2*s,'#8a9070');ell(q.x+8*s,q.y+2*s,3.4*s,2*s,'#62665a')}
    else if(k<.42){const P2=sp(rr(h,4)<.5?'#4e6a26':'#8aa04a',1.5);for(let i=-2;i<=2;i++){P2.moveTo(q.x+i*2.5*s,q.y);P2.quadraticCurveTo(q.x+i*3*s,q.y-5*s,q.x+i*4.5*s,q.y-(8+((h>>(i+4))&3)*2)*s)}}
    else if(k<.5){ell(q.x,q.y,10*s,10*s*K,'#3e6a2c');ell(q.x+1*s,q.y-.5*s,7.5*s,7.5*s*K,'#5a8a3a');ell(q.x+5*s,q.y-3*s,2.4*s,1.6*s,'#f0d8e0')}
    else if(k<.56){ell(q.x,q.y,3*s,1.6*s,'#d8c8a0');ell(q.x,q.y-3*s,4.5*s,2.4*s,'#c89a4a')}});
   return q},
  sides(){sideFaces(60,40,'#3e5228',(a,b)=>{for(let i=0;i<=8;i++){const k=i/8,x=lerp(a.x,b.x,k),y=lerp(a.y,b.y,k),s=lerp(a.s,b.s,k);ell(x,y-12*s,26*s,18*s,i&1?'#5e685c':'#6a7468');ell(x-4*s,y-26*s,18*s,8*s,'#5e8a3c')}})},
  amb(){const t=T();g.fillStyle='rgba(255,246,190,.6)';g.beginPath();for(let i=0;i<36;i++){const sd=i*59.3,x=((sd*9.7)%W+Math.sin(t*.5+i)*30+W)%W,y=((sd*4.3)%H-t*(10+i%5*4)+H*8)%H,r=1+(i%3)*.6;g.moveTo(x+r,y);g.arc(x,y,r,0,7)}g.fill();
   for(let i=0;i<5;i++){const sd=i*83.1,x=((sd*11+t*(16+i*5))%(W+100))-50,y=((sd*5+t*(12+i*4))%(H+60))-30;g.save();g.translate(x,y);g.rotate(t*(1.2+i%3)+i);g.fillStyle=i%2?'rgba(90,150,60,.75)':'rgba(120,170,70,.7)';g.beginPath();g.ellipse(0,0,6,2.6,0,0,7);g.fill();g.restore()}
   vig(.45,'rgba(40,52,14,.28)')}
 });

 // ---------------- 10 · Village caché de Kiri ----------------
 add('Village caché de Kiri',{sky:['#7e9096','#a4b2b4','#c8d0ce'],floor:['#2f4a52','#36545c'],line:'rgba(200,230,240,.12)',wall:['#3a464c','#2a343a'],post:['#2a1e14','#6a5238','#1e160e','#7a6448']},{
  arena:sym([[300,-258,26,'piling'],[300,262,26,'piling'],[570,-298,40,'islet'],[562,308,36,'islet'],[0,-350,30,'sword'],[0,356,30,'islet']]),
  bk:['islet','piling'],light:1,
  bg(x){bgGrad(x,['#6c7e86','#9cabae','#c4ceca'],280);
   // le village : tours rondes à dôme et réservoirs, de plus en plus nets à travers la brume
   for(let L=0;L<3;L++){const c=['#a8b4b4','#8c9a9c','#6c7c80'][L],base=232+L*16;
    for(let i=0;i<9;i++){const cx=R(i*7+L*31+500,0,W),w=R(i+L*13+520,22,50)*(1+L*.18),hh=R(i+L*17+540,50,150)-L*14;if(L===2&&Math.abs(cx-640)<110)continue;x.fillStyle=c;x.fillRect(cx-w,base-hh,w*2,hh+12);x.beginPath();x.ellipse(cx,base-hh,w,w*.62,0,Math.PI,0);x.fill();
     x.fillStyle='rgba(40,52,58,.22)';for(let k=0;k<3;k++)x.fillRect(cx-w,base-hh+14+k*22,w*2,3);if(R(i+L*5+560,0,1)<.5){x.fillStyle=c;x.fillRect(cx+w*.35,base-hh-w*.62-22,4,24)}}
    if(L===1){x.fillStyle='#7c8a8c';x.fillRect(570,98,140,170);x.beginPath();x.ellipse(640,98,70,48,0,Math.PI,0);x.fill();x.fillStyle='rgba(40,52,58,.28)';x.fillRect(570,130,140,4);x.fillRect(570,176,140,4);x.strokeStyle='rgba(230,240,240,.55)';x.lineWidth=3;for(const k of[0,8,16]){x.beginPath();x.moveTo(620,60+k);x.quadraticCurveTo(630,54+k,640,60+k);x.quadraticCurveTo(650,66+k,660,60+k);x.stroke()}}
    const fg=x.createLinearGradient(0,base-110,0,base+16);fg.addColorStop(0,'rgba(200,212,212,0)');fg.addColorStop(1,'rgba(200,212,212,.6)');x.fillStyle=fg;x.fillRect(0,base-110,W,126)}
   const sg=x.createLinearGradient(0,280,0,H);sg.addColorStop(0,'#7c9298');sg.addColorStop(.25,'#4a6670');sg.addColorStop(1,'#24404a');x.fillStyle=sg;x.fillRect(0,280,W,H-280);
   x.strokeStyle='rgba(220,235,240,.16)';x.lineWidth=1.5;for(let i=0;i<60;i++){const yy=286+Math.pow(R(i+580,0,1),1.6)*(H-286),ww=10+(yy-280)*.12,xx=R(i+600,0,W);x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+ww,yy);x.stroke()}},
  sky(){const t=T(),w=1000;for(let i=0;i<2;i++){const xx=((t*(9+i*6)+i*600)%(W+w))-w;fogAt(xx,150+i*50,w,170,.55)}},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),h=52;poly([a,b,up(b,h),up(a,h)],vgr(a.y-h*a.s,a.y,['#5a686e','#34424a']));
   g.strokeStyle='rgba(16,24,28,.55)';g.lineWidth=1.2;g.beginPath();for(let r=1;r<3;r++){const c=up(a,h*r/3),d=up(b,h*r/3);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y)}for(let r=0;r<3;r++)for(let x=Math.ceil(x0/70)*70+(r&1)*35;x<x1;x+=70){const q=P(x,y),y0=q.y-h*r/3*q.s;g.moveTo(q.x,y0);g.lineTo(q.x,y0-h/3*q.s)}g.stroke();
   poly([up(a,h),up(b,h),up(b,h+7),up(a,h+7)],'#78868a');poly([a,b,up(b,13),up(a,13)],'rgba(40,74,56,.6)');
   g.fillStyle='#262e32';g.beginPath();for(let x=Math.ceil(x0/240)*240+90;x<x1;x+=240){const q=P(x,y),s=q.s,tp=q.y-(h+7)*s;g.rect(q.x-5*s,tp-18*s,10*s,18*s)}g.fill();
   g.strokeStyle='#8a7a5a';g.lineWidth=2*a.s;g.beginPath();for(let x=Math.ceil(x0/240)*240+90;x<x1;x+=240){const q=P(x,y),s=q.s;g.moveTo(q.x,q.y-(h-2)*s);g.quadraticCurveTo(q.x+10*s,q.y-6*s,q.x+4*s,q.y+4*s)}g.stroke()},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#26404a','#2c4852');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#2c4650','#34525c'),t=T();
   cells(x0,y0,x1,y1,170,(q,h)=>{const s=q.s;if(rr(h,16)<.55)ell(q.x,q.y,(50+rr(h,20)*50)*s,(10+rr(h,24)*8)*s,rr(h,4)<.5?'rgba(120,160,170,.15)':'rgba(10,26,32,.22)')});
   // vaguelettes (les ninjas marchent sur l'eau)
   cells(x0,y0,x1,y1,80,(q,h)=>{const s=q.s;if(rr(h,16)<.5){const k=Math.sin(t*1.3+(h&63))*5*s,w=(12+rr(h,20)*10)*s,P2=sp(rr(h,4)<.6?'rgba(196,224,232,.42)':'rgba(160,200,212,.3)',1.6);P2.moveTo(q.x-w+k,q.y);P2.quadraticCurveTo(q.x+k,q.y-4*s,q.x+w+k,q.y)}});
   // quais de pierre et pontons de bois
   const dk=[];
   if(ar){dk.push([A.x-60,CY-270,A.x+300,CY+270,0],[A.x+A.w-300,CY-270,A.x+A.w+60,CY+270,0],[A.x+300,CY-52,CX-205,CY+52,1],[CX+205,CY-52,A.x+A.w-300,CY+52,1])}
   else{const S=560;for(let gx=Math.floor((x0-300)/S)*S;gx<x1+300;gx+=S)for(let gy=Math.floor((y0-300)/S)*S;gy<y1+300;gy+=S){const h=hsh(gx+11,gy+5);if(rr(h,16)>.42)continue;const w=120+rr(h,0)*100,d=90+rr(h,8)*80,cx=gx+S/2+(rr(h,20)-.5)*120,cy=gy+S/2+(rr(h,24)-.5)*120;dk.push([cx-w,cy-d,cx+w,cy+d,h&1])}}
   const vis=[];for(const [a,b,c,d,wd] of dk){const A0=Math.max(x0,a),B0=Math.max(y0,b),C0=Math.min(x1,c),D0=Math.min(y1,d);if(A0>=C0||B0>=D0)continue;const p0=P(A0,B0),p1=P(C0,D0);if(p1.y<-40||p0.y>H+40)continue;vis.push([A0,B0,C0,D0,wd,D0===d])}
   bat(()=>{for(const [a,b,c,d,wd,fr0] of vis){if(fr0)gqf(wd?'#3a2a1a':'#3e4c52',a,c,d,9);gq(wd?'#6a5236':'#6e7c82',a,b,c,d)}
    for(const [a,b,c,d,wd] of vis){if(wd){const P2=sp('rgba(40,26,14,.6)',1.2);for(let yy=Math.ceil(b/26)*26;yy<d;yy+=26){const u=P(a,yy),v=P(c,yy);P2.moveTo(u.x,u.y);P2.lineTo(v.x,v.y)}}
     else{const P2=sp('rgba(30,40,46,.55)',1.3);for(let yy=Math.ceil(b/70)*70;yy<d;yy+=70){const u=P(a,yy),v=P(c,yy);P2.moveTo(u.x,u.y);P2.lineTo(v.x,v.y)}for(let xx=Math.ceil(a/90)*90;xx<c;xx+=90){const u=P(xx,b),v=P(xx,d);P2.moveTo(u.x,u.y);P2.lineTo(v.x,v.y)}}const P3=sp(wd?'rgba(255,230,190,.22)':'rgba(220,232,236,.3)',1.5),u=P(a,b+3),v=P(c,b+3);P3.moveTo(u.x,u.y);P3.lineTo(v.x,v.y);const P4=sp('rgba(14,26,30,.6)',2),o=[P(a,b),P(c,b),P(c,d),P(a,d)];P4.moveTo(o[0].x,o[0].y);for(let i=1;i<4;i++)P4.lineTo(o[i].x,o[i].y);P4.closePath()}});
   // plate-forme ronde au centre de l'arène
   if(ar){const p=P(CX,CY),s=p.s,R0=212*s;ell(p.x,p.y+8*s,R0,R0*K,'#3e4c52');ell(p.x,p.y,R0,R0*K,'#76848a');g.strokeStyle='rgba(30,40,46,.5)';g.lineWidth=1.3;g.beginPath();g.ellipse(p.x,p.y,R0*.62,R0*.62*K,0,0,7);for(let i=0;i<14;i++){const an=i/14*Math.PI*2;g.moveTo(p.x+Math.cos(an)*R0*.62,p.y+Math.sin(an)*R0*.62*K);g.lineTo(p.x+Math.cos(an)*R0,p.y+Math.sin(an)*R0*K)}g.stroke();g.strokeStyle='rgba(220,232,236,.2)';g.beginPath();g.ellipse(p.x,p.y,R0-2,R0*K-2,0,Math.PI,Math.PI*2);g.stroke()}
   return q},
  sides(){sideFaces(22,16,'#4e5c62',(a,b)=>{g.fillStyle='#262e32';for(let i=0;i<=6;i++){const k=i/6,x=lerp(a.x,b.x,k),y=lerp(a.y,b.y,k),s=lerp(a.s,b.s,k);g.fillRect(x-4*s,y-36*s,8*s,22*s)}})},
  amb(){const t=T(),w=1050;for(let i=0;i<3;i++){const xx=((t*(12+i*5)+i*470)%(W+w))-w;fogAt(xx,H*(.06+i*.3),w,230,.3)}vig(.4,'rgba(20,36,44,.38)')}
 });

 // ---------------- 11 · Village caché de Kumo ----------------
 add('Village caché de Kumo',{sky:['#4a84c8','#8cbce8','#dceefa'],floor:['#a8977c','#9c8b70'],line:'rgba(60,46,30,.18)',wall:['#7a6a56','#5a4c3c'],post:['#5a5048','#a89a88','#463e36','#c8bca8']},{
  arena:sym([[250,-282,34,'pinnacle'],[560,-290,46,'dome'],[272,270,32,'crag'],[562,306,30,'pinnacle'],[0,-345,20,'rod'],[0,352,20,'rod']]),
  bk:['crag','pinnacle'],erase:1,light:1,
  bg(x){bgGrad(x,['#3f7cc4','#86b8e6','#e2f1fb'],300);
   // pics rocheux qui percent la mer de nuages, coiffés des maisons-dômes blanches
   for(let L=0;L<2;L++)for(let i=0;i<7;i++){const cx=R(i*3+L*40+600,0,W),w=R(i+L*9+620,28,60)*(L?1.35:1),top=R(i+L*7+640,30,150)+L*45,c=L?'#7e7266':'#a2a4b0',lt=L?'#9a8e80':'#b8bac4';
    xpoly(x,[[cx-w,330],[cx-w*.62,top+34],[cx-w*.26,top],[cx+w*.3,top+8],[cx+w*.68,top+40],[cx+w,330]],c);xpoly(x,[[cx-w*.26,top],[cx+w*.3,top+8],[cx+w*.68,top+40],[cx+w,330],[cx+w*.2,330],[cx,top+50]],lt);
    x.strokeStyle='rgba(50,40,30,.18)';x.lineWidth=2;for(let k=1;k<5;k++){const yy=top+k*(330-top)/5;x.beginPath();x.moveTo(cx-w*.8,yy);x.lineTo(cx+w*.8,yy+3);x.stroke()}
    if(R(i+L*11+660,0,1)<.75){const dw=w*.5,dy=top+8;x.fillStyle='#eef3f6';x.fillRect(cx-dw,dy-dw*.55,dw*2,dw*.55);x.beginPath();x.ellipse(cx,dy-dw*.55,dw,dw*.62,0,Math.PI,0);x.fill();x.fillStyle='rgba(70,110,160,.55)';x.fillRect(cx-dw,dy-dw*.55,dw*2,2.5);x.fillStyle='rgba(40,60,90,.5)';x.fillRect(cx-dw*.5,dy-dw*.38,4,5);x.fillRect(cx+dw*.35,dy-dw*.38,4,5)}}
   // tour du Raikage
   x.fillStyle='#8e8478';x.fillRect(585,120,110,220);x.fillStyle='#f2f6f8';x.fillRect(560,70,160,60);x.beginPath();x.ellipse(640,70,80,52,0,Math.PI,0);x.fill();x.fillStyle='#4e72a0';x.fillRect(560,68,160,5);x.fillStyle='#2a3a52';for(let i=0;i<5;i++)x.fillRect(574+i*30,92,10,14);
   x.strokeStyle='#f0c040';x.lineWidth=4;x.beginPath();x.moveTo(648,8);x.lineTo(634,30);x.lineTo(646,30);x.lineTo(632,52);x.stroke();
   // mer de nuages
   for(let i=0;i<46;i++)xell(x,R(i+700,-60,W+60),R(i+720,272,330),R(i+740,40,120),R(i+760,16,32),i%3?'#f4f8fc':'#d6e4f0');
   x.fillStyle='#eef4fa';x.fillRect(0,318,W,H);for(let i=0;i<30;i++)xell(x,R(i+780,0,W),R(i+800,330,H),R(i+820,60,160),R(i+840,14,30),i%2?'#e0eaf4':'#f8fbfd')},
  sky(){const t=T();for(let i=0;i<3;i++){const xx=((t*(18+i*7)+i*520)%(W+900))-900;fogAt(xx,120+i*60,900,150,.7)}},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y);
   g.fillStyle='#8a7a62';g.beginPath();g.moveTo(a.x,a.y);for(let x=Math.ceil(x0/40)*40;x<=x1;x+=40){const q=P(x,y);g.lineTo(q.x,q.y-(10+(hsh(x,21)&15))*q.s)}g.lineTo(b.x,b.y);g.closePath();g.fill();
   g.fillStyle='#5a4632';g.beginPath();for(let x=Math.ceil(x0/120)*120;x<=x1;x+=120){const q=P(x,y);g.rect(q.x-3*q.s,q.y-50*q.s,6*q.s,44*q.s)}g.fill();
   g.strokeStyle='#d8c49a';g.lineWidth=2.4*a.s;g.beginPath();for(const hh of[44,26]){let pr=null;for(let x=Math.ceil(x0/120)*120;x<=x1;x+=120){const q=P(x,y),yy=q.y-hh*q.s;if(pr){const m=P(x-60,y);g.moveTo(pr.x,pr.y);g.quadraticCurveTo(m.x,m.y-(hh-9)*m.s,q.x,yy)}pr={x:q.x,y:yy}}}g.stroke();
   g.fillStyle='#f4f0e4';g.beginPath();for(let x=Math.ceil(x0/120)*120+60;x<=x1;x+=240){const q=P(x,y),s=q.s,yy=q.y-36*s;g.moveTo(q.x-3*s,yy);g.lineTo(q.x+3*s,yy);g.lineTo(q.x+1*s,yy+14*s);g.lineTo(q.x+4*s,yy+14*s);g.lineTo(q.x-1*s,yy+26*s);g.closePath()}g.fill()},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#b6a486','#aa987a');
   cells(x0,y0,x1,y1,160,(q,h)=>{const s=q.s;if(rr(h,16)<.6)ell(q.x,q.y,(50+rr(h,20)*50)*s,(16+rr(h,24)*12)*s,rr(h,4)<.5?'rgba(228,214,184,.3)':'rgba(96,76,50,.12)')});
   grid(x0,y0,x1,y1,150,110,'rgba(92,72,48,.3)',1.3,1);grid(x0,y0+3,x1,y1,0,110,'rgba(255,248,230,.16)',1);
   if(ar){g.strokeStyle='rgba(70,56,40,.28)';g.lineWidth=3;gEll(CX,CY,300);g.stroke();g.lineWidth=1.5;gEll(CX,CY,284);g.stroke();g.beginPath();for(let i=0;i<12;i++){const an=i/12*Math.PI*2,u=P(CX+Math.cos(an)*284,CY+Math.sin(an)*284),v=P(CX+Math.cos(an)*318,CY+Math.sin(an)*318);g.moveTo(u.x,u.y);g.lineTo(v.x,v.y)}g.stroke()}
   cells(x0,y0,x1,y1,115,(q,h)=>{const s=q.s,k=rr(h,16);
    if(k<.3){const P2=sp('rgba(70,54,36,.5)',1.2);P2.moveTo(q.x-20*s,q.y-3*s);P2.lineTo(q.x+(rr(h,20)-.5)*20*s,q.y+4*s);P2.lineTo(q.x+(rr(h,24)+.2)*26*s,q.y+1*s);P2.moveTo(q.x+(rr(h,20)-.5)*20*s,q.y+4*s);P2.lineTo(q.x+(rr(h,20)-.6)*28*s,q.y+12*s)}
    else if(k<.42){ell(q.x,q.y,7*s,3.6*s,'#7a6c5a');ell(q.x-1*s,q.y-1.6*s,5.4*s,2.2*s,'#b8aa92');ell(q.x+9*s,q.y+2*s,3.6*s,2*s,'#8a7c68')}
    else if(k<.54){const P2=sp('#8a9a4a',1.4);for(let i=-2;i<=2;i++){P2.moveTo(q.x+i*2*s,q.y);P2.lineTo(q.x+i*4*s+3*s,q.y-(7+((h>>(i+3))&3)*2)*s)}}
    else if(k<.59){ell(q.x,q.y,22*s,8*s,'rgba(40,32,26,.3)');const P2=sp('rgba(40,30,22,.45)',1.4);for(let i=0;i<6;i++){const an=i*1.05+rr(h,20);P2.moveTo(q.x,q.y);P2.lineTo(q.x+Math.cos(an)*26*s,q.y+Math.sin(an)*10*s)}}}); // brûlure d'éclair
   return q},
  sides(){const [tl,tr,br,bl]=[P(A.x,A.y),P(A.x+A.w,A.y),P(A.x+A.w,A.y+A.h),P(A.x,A.y+A.h)];for(const [a,b,d] of[[tl,bl,-1],[tr,br,1]]){poly([a,b,{x:b.x+d*30*b.s,y:b.y+110*b.s},{x:a.x+d*22*a.s,y:a.y+80*a.s}],'#6e6050');
    g.strokeStyle='rgba(40,30,22,.35)';g.lineWidth=1.5;g.beginPath();for(const k of[.3,.6]){g.moveTo(a.x+d*22*a.s*k,a.y+80*a.s*k);g.lineTo(b.x+d*30*b.s*k,b.y+110*b.s*k)}g.stroke();g.strokeStyle='#bfae90';g.lineWidth=2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}},
  amb(){const t=T();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.2;g.beginPath();for(let i=0;i<16;i++){const sd=i*71.3,y=(sd*5.3)%H,x=((sd*13.1+t*(260+i%4*60))%(W+200))-100;g.moveTo(x,y);g.lineTo(x-40-(i%3)*16,y+3)}g.stroke();
   {const xx=((t*40)%(W+800))-800;fogAt(xx,-30,800,150,.3)}vig(.45,'rgba(30,50,80,.22)')}
 });

 // ---------------- 12 · Quatrième Guerre ninja (le champ de bataille) ----------------
 add('Quatrième Guerre ninja',{sky:['#3a2420','#8a4a30','#d8945e'],floor:['#7a6650','#6c5a46'],line:'rgba(40,24,12,.25)',wall:['#5a4636','#3e3024'],post:['#4a3a2a','#8a7258','#3a2c1e','#9a8468']},{
  arena:sym([[280,-270,40,'shard'],[560,-292,36,'mokuton'],[292,280,24,'weapons'],[560,302,36,'shard'],[0,-350,26,'weapons'],[0,356,30,'shard']]),
  bk:['shard','warMix'],
  bg(x){bgGrad(x,['#2a1a1a','#76402c','#d08a56'],280);
   // lune rouge du Tsukuyomi infini
   const mx=990,my=104,mr=58,mg=x.createRadialGradient(mx,my,mr*.6,mx,my,mr*2.4);mg.addColorStop(0,'rgba(255,90,60,.4)');mg.addColorStop(1,'rgba(255,90,60,0)');x.fillStyle=mg;x.fillRect(mx-mr*2.4,my-mr*2.4,mr*4.8,mr*4.8);
   xell(x,mx,my,mr,mr,'#c8322a');xell(x,mx-mr*.25,my-mr*.25,mr*.6,mr*.55,'rgba(255,120,90,.25)');x.strokeStyle='rgba(70,0,0,.6)';x.lineWidth=2.5;for(const k of[.28,.54,.8]){x.beginPath();x.arc(mx,my,mr*k,0,7);x.stroke()}
   for(const k of[.54,.8])for(let i=0;i<3;i++){const a=i*2.094+k*3;xell(x,mx+Math.cos(a)*mr*k,my+Math.sin(a)*mr*k,4.5,4.5,'#3a0000')}
   // l'arbre-dieu à l'horizon
   x.fillStyle='#3a2420';x.beginPath();x.moveTo(250,290);x.quadraticCurveTo(300,200,292,120);x.lineTo(326,120);x.quadraticCurveTo(322,200,380,290);x.fill();x.strokeStyle='#3a2420';x.lineCap='round';
   for(const [a,L,w] of[[-2.5,120,12],[-.7,130,12],[-2.1,90,8],[-1,96,8],[-1.6,70,10]]){x.lineWidth=w;x.beginPath();x.moveTo(309,130);x.quadraticCurveTo(309+Math.cos(a)*L*.5,130+Math.sin(a)*L*.3,309+Math.cos(a)*L,130+Math.sin(a)*L*.6);x.stroke()}x.lineCap='butt';
   xell(x,309,64,26,34,'#4a2a2a');for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.45;xell(x,309+Math.cos(a)*24,64+Math.sin(a)*30,9,16,'#5a3030')}
   // fumées et reliefs
   for(let i=0;i<6;i++){const cx=R(i+1000,420,W),y0=R(i+1010,220,280);for(let k=0;k<7;k++)xell(x,cx+Math.sin(k*1.3+i)*14+k*6,y0-k*28,18+k*6,12+k*4,`rgba(70,56,52,${(.4-k*.045).toFixed(2)})`)}
   for(let i=0;i<9;i++){const cx=R(i+1040,0,W),w=R(i+1050,80,200),h=R(i+1060,20,60);xpoly(x,[[cx-w,290],[cx-w*.7,290-h],[cx+w*.6,290-h*.9],[cx+w,290]],i%2?'#5a3a2c':'#4e3226')}
   x.fillStyle='#46302a';x.fillRect(0,288,W,H)},
  sky(){},
  wall(x0,x1,y){const a=P(x0,y),b=P(x1,y),t=T();
   g.fillStyle=vgr(a.y-80*a.s,a.y,['#7a6248','#4e3e2e']);g.beginPath();g.moveTo(a.x,a.y);for(let x=Math.ceil(x0/50)*50;x<=x1;x+=50){const hh=hsh(x,31),q=P(x,y),H0=(hh&7)<2?18+(hh>>3&15):56+(hh>>3&31);g.lineTo(q.x,q.y-H0*q.s)}g.lineTo(b.x,b.y);g.closePath();g.fill();
   g.strokeStyle='rgba(30,20,12,.5)';g.lineWidth=1.3;g.beginPath();for(let x=Math.ceil(x0/90)*90;x<x1;x+=90){const hh=hsh(x,33),q=P(x,y),s=q.s;g.moveTo(q.x,q.y-4*s);g.lineTo(q.x+((hh&15)-8)*s,q.y-22*s);g.lineTo(q.x+((hh>>4&15)-8)*s,q.y-40*s)}g.stroke();
   for(let x=Math.ceil((x0-100)/420)*420+100;x<x1;x+=420){const q=P(x,y),s=q.s,tp=q.y-130*s,wv=Math.sin(t*2.2+x)*5*s,cw=46*s,ch=32*s;g.fillStyle='#2a1e14';g.fillRect(q.x-2*s,tp,4*s,130*s);
    g.fillStyle='#d4c8ac';g.beginPath();g.moveTo(q.x,tp+3*s);g.quadraticCurveTo(q.x+cw*.5,tp+3*s+wv,q.x+cw,tp+5*s+wv*.5);g.lineTo(q.x+cw*.88,tp+ch*.6+wv*.5);g.lineTo(q.x+cw*.96,tp+ch+wv*.3);g.lineTo(q.x+cw*.5,tp+ch*.82+wv);g.lineTo(q.x,tp+ch);g.fill();g.strokeStyle='#8a2a22';g.lineWidth=2.4*s;g.beginPath();g.arc(q.x+cw*.45,tp+ch*.45+wv*.6,8*s,0,7);g.stroke()}},
  outer(){const L=A.x-1100,Rr=A.x+A.w+1100;baseFloor(L,A.y,Rr,A.y+A.h+800,'#5e4c3a','#564434');this.wall(L,A.x,A.y);this.wall(A.x+A.w,Rr,A.y)},
  ground(x0,y0,x1,y1,step,ar){const q=baseFloor(x0,y0,x1,y1,'#7c6850','#6e5a44');
   cells(x0,y0,x1,y1,170,(q,h)=>{const s=q.s;if(rr(h,16)<.55)ell(q.x,q.y,(50+rr(h,20)*50)*s,(15+rr(h,24)*12)*s,rr(h,4)<.5?'rgba(196,166,122,.17)':'rgba(40,26,14,.17)')});
   // cratères (grand cratère au centre de l'arène, simple décor)
   const cr=(x,y,R0,s)=>{ell(x,y,R0*1.1,R0*1.1*K,'rgba(176,148,110,.32)');ell(x,y,R0,R0*K,'rgba(46,32,20,.36)');ell(x,y+R0*K*.25,R0*.7,R0*K*.6,'rgba(30,20,12,.3)');const P2=sp('rgba(214,186,146,.5)',2.4*s);P2.moveTo(x+R0,y);P2.ellipse(x,y,R0,R0*K,0,0,Math.PI)};
   bat(()=>{if(ar){const p=P(CX,CY);cr(p.x,p.y,165*p.s,p.s)}cells(x0,y0,x1,y1,430,(q,h)=>{if(rr(h,16)<.38)cr(q.x,q.y,(55+rr(h,20)*55)*q.s,q.s)})});
   cells(x0,y0,x1,y1,95,(q,h)=>{const s=q.s,k=rr(h,16);
    if(k<.34){const P2=sp('rgba(36,22,12,.55)',1.5),mx=q.x+(rr(h,20)-.5)*24*s,my=q.y+5*s;P2.moveTo(q.x-22*s,q.y-4*s);P2.lineTo(mx,my);P2.lineTo(q.x+(rr(h,24)+.3)*24*s,q.y+1*s);P2.moveTo(mx,my);P2.lineTo(mx-6*s,my+12*s)}
    else if(k<.46){ell(q.x,q.y,6*s,3.4*s,'#4e3e2e');ell(q.x-1*s,q.y-1.4*s,4.6*s,2*s,'#8a7458');ell(q.x+8*s,q.y+2*s,3*s,1.8*s,'#5e4c3a')}
    else if(k<.52){const P2=sp('#6a7078',2*s,'round'),a=rr(h,20)*3;P2.moveTo(q.x-Math.cos(a)*9*s,q.y-Math.sin(a)*4*s);P2.lineTo(q.x+Math.cos(a)*9*s,q.y+Math.sin(a)*4*s);ell(q.x-Math.cos(a)*11*s,q.y-Math.sin(a)*5*s,2.2*s,1.4*s,'#2a2420')} // kunai
    else if(k<.56){const P2=sp('#5a6068',2.2*s);P2.moveTo(q.x-6*s,q.y);P2.lineTo(q.x+6*s,q.y);P2.moveTo(q.x,q.y-3*s);P2.lineTo(q.x,q.y+3*s);ell(q.x,q.y,1.6*s,1*s,'#2a2420')} // shuriken
    else if(k<.6){ell(q.x,q.y,5*s,2.6*s,'#bdb4a2');ell(q.x+1.4*s,q.y-.4*s,1.3*s,.8*s,'#2a2420')} // éclat de masque blanc
    else if(k<.66)ell(q.x,q.y,14*s,5*s,'rgba(30,24,22,.35)')});
   return q},
  sides(){sideFaces(66,44,'#5a4634',(a,b,h0,h1)=>{g.strokeStyle='rgba(30,20,12,.45)';g.lineWidth=1.2;g.beginPath();for(const k of[.35,.7]){const c=up(a,h0*k),d=up(b,h1*k);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y)}g.stroke()})},
  amb(){const t=T();g.fillStyle='rgba(70,62,60,.5)';g.beginPath();for(let i=0;i<46;i++){const sd=i*53.7,y=((sd*7.3)%H+t*(26+i%4*9))%(H+20)-10,x=((sd*11.1)%W+Math.sin(t*.7+i)*26+t*(10+i%3*5))%(W+20)-10;g.rect(x,y,2+(i%3),1.6+(i%2))}g.fill();
   g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,140,60,.55)';g.beginPath();for(let i=0;i<16;i++){const sd=i*67.1,x=((sd*9.3)%W+Math.sin(t*.6+i)*40)%W,y=((sd*4.7)%H-t*(18+i%4*6)+H*6)%H;g.moveTo(x+1.5,y);g.arc(x,y,1.5,0,7)}g.fill();g.restore();
   vig(.4,'rgba(50,14,6,.36)')}
 });

 // ===== disposition d'arène / synchro / tirage =====
 let K0=null;
 function sync(){let m=CFG.map|0;if(!(m>=0&&m<MAPS.length))m=CFG.map=0;if(m===K0)return;K0=m;const D=DEF[m];ARENA_OBST.length=0;
  if(D)for(const [dx,dy,r,k] of D.arena)ARENA_OBST.push({x:CX+dx,y:CY+dy,r,k});else for(const o of ARENA0)ARENA_OBST.push(Object.assign({},o))}
 // compatibilité en ligne : une version sans nr_maps.js ne connaît que les cartes 0..N0-1 (son THEME() est nul au-delà et son dessin plante,
 // menu compris). Un invité à jour annonce son nombre de cartes ({t:'nm'} à la connexion) ; tant qu'un invité ne l'a pas annoncé,
 // l'hôte ne lui envoie qu'une carte d'origine ; une fois annoncé (ex. 9 pour une version à 9 cartes), jamais une carte d'index ≥ ce nombre.
 // Au lancement, l'hôte ne tire / ne joue que parmi les cartes connues de tous (FB = carte choisie, rendue au retour au menu).
 let FB=null;
 const lim=()=>net.role==='host'?Math.min(MAPS.length,...livePeers().map(p=>p.conn&&p.conn.nrNm||N0)):MAPS.length;
 function roll(){if(isGuest())return;if(FB!=null){if(!CFG.mapRand)CFG.map=FB;FB=null}const L=lim();
  if(CFG.mapRand){let m;do m=Math.floor(Math.random()*L);while(m===(CFG.map|0)&&L>1);CFG.map=m}
  else if((CFG.map|0)>=L){FB=CFG.map|0;CFG.map=0}
  if(L<MAPS.length&&(CFG.mapRand||FB!=null))setStat('Un joueur a une ancienne version du jeu : '+(FB!=null?'carte remplacée par « '+MAPS[0][0]+' »':'tirage limité aux cartes qu\'il connaît')+'. Il doit recharger la page pour avoir les nouvelles cartes.');
  sync()}
 function hook(k,a,b,c,d,e){if(FB!=null&&state==='menu'&&!isGuest()){CFG.map=FB;FB=null}const M=DEF[CFG.map|0];if(!M)return false;
  switch(k){case'sky':sync();drawBg(M);M.sky();return true;
   case'wall':M.wall(a,b,c);return true;
   case'floor':return floorAll(M,a,b,c,d,e);
   case'obst':{const pl=a,p=P(pl.x,pl.y),rx=pl.r*p.s,kd=pl.k||M.bk[pl.rock?0:1];(OB[kd]||OB.block)(pl,p,rx,rx*K,p.s);g.globalAlpha=1;return true}
   case'amb':g.save();M.amb();g.restore();return true}
  return false}
 // menu « Partie & options » : liste des cartes remplie depuis MAPS (+ « Au hasard » = valeur -1)
 function fillSel(){const s=document.getElementById('cMap');if(!s)return;s.textContent='';for(let i=0;i<MAPS.length;i++){const o=document.createElement('option');o.value=String(i);o.textContent=MAPS[i][0];o.title=MAPS[i][0];s.appendChild(o)}const o=document.createElement('option');o.value='-1';o.textContent='Au hasard';o.title='Une carte tirée à chaque partie';s.appendChild(o)}
 fillSel();sync();
 AFTER.push(()=>{
  const sm=startMatch;startMatch=function(){roll();return sm.apply(this,arguments)};
  const rw=resetWorld;resetWorld=function(){sync();return rw.apply(this,arguments)};
  const as=applySnap;applySnap=function(s){if(s&&s.cfg){Object.assign(CFG,s.cfg);sync()}return as.apply(this,arguments)};
  const sc=syncCfg;syncCfg=function(){sc.apply(this,arguments);if(CFG.mapRand)$('cMap').value='-1'};
  $('cMap').onchange=e=>{const v=+e.target.value;FB=null;CFG.mapRand=v<0;if(v>=0)CFG.map=v;sync();saveCfg();netSend({t:'hello',mode,cfg:CFG});syncCfg()};
  // hôte : chaque connexion entrante retient le nombre de cartes annoncé par l'invité et n'envoie pas de carte inconnue à un invité qui ne l'a pas annoncé
  const hg=hostGame;hostGame=function(){const r=hg.apply(this,arguments);const pr=net.peer;if(pr&&pr.on)pr.on('connection',c=>{const sd=c.send.bind(c);
   c.send=d=>{if(d&&d.cfg&&(d.cfg.map|0)>=(c.nrNm||N0))d=Object.assign({},d,{cfg:Object.assign({},d.cfg,{map:0,mapRand:false})});return sd(d)};
   c.on('data',d=>{if(d&&d.t==='nm'&&d.v>0&&!c.nrNm){c.nrNm=d.v|0;if(state==='menu')sendLobby()}})});return r};
  // invité : annonce son nombre de cartes dès que la connexion à l'hôte est ouverte (une ancienne version d'hôte ignore ce message)
  const jg=joinGame;joinGame=function(){const r=jg.apply(this,arguments);const pr=net.peer;if(pr&&pr.on&&net.role==='guest')pr.on('open',()=>{const c=net.conn;if(c&&c.on)c.on('open',()=>{try{c.send({t:'nm',v:MAPS.length})}catch(e){}})});return r};
  // simulateur d'équilibrage (?sim=1) : toujours sur la carte 0 (ou job.map), jamais sur la dernière carte enregistrée dans les réglages
  if(typeof blSimJob==='function'){const bj=blSimJob;blSimJob=function(job){CFG.mapRand=false;CFG.map=job&&job.map>=0&&job.map<MAPS.length?job.map|0:0;sync();return bj.apply(this,arguments)}}
  syncCfg()});
 return{hook,sync,roll,lim,DEF,OB,N0};
})();
