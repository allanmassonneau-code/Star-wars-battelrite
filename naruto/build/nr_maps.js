// ---------- Cartes supplémentaires (nr_maps.js) ----------
// 6 cartes de plus après les 3 d'origine (0 Terrain d'entraînement, 1 Vallée de la Fin, 2 Désert de Suna, inchangées).
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
   const k=t%11.5;if(k<.35){g.fillStyle=`rgba(220,230,255,${(k<.12||k>.22)?.1:.03})`;g.fillRect(0,0,W,H)} // éclair lointain, discret
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

 // ===== disposition d'arène / synchro / tirage =====
 let K0=null;
 function sync(){let m=CFG.map|0;if(!(m>=0&&m<MAPS.length))m=CFG.map=0;if(m===K0)return;K0=m;const D=DEF[m];ARENA_OBST.length=0;
  if(D)for(const [dx,dy,r,k] of D.arena)ARENA_OBST.push({x:CX+dx,y:CY+dy,r,k});else for(const o of ARENA0)ARENA_OBST.push(Object.assign({},o))}
 function roll(){if(!CFG.mapRand||isGuest())return;let m;do m=Math.floor(Math.random()*MAPS.length);while(m===(CFG.map|0)&&MAPS.length>1);CFG.map=m;sync()}
 function hook(k,a,b,c,d,e){const M=DEF[CFG.map|0];if(!M)return false;
  switch(k){case'sky':sync();drawBg(M);M.sky();return true;
   case'wall':M.wall(a,b,c);return true;
   case'floor':return floorAll(M,a,b,c,d,e);
   case'obst':{const pl=a,p=P(pl.x,pl.y),rx=pl.r*p.s,kd=pl.k||M.bk[pl.rock?0:1];(OB[kd]||OB.block)(pl,p,rx,rx*K,p.s);g.globalAlpha=1;return true}
   case'amb':g.save();M.amb();g.restore();return true}
  return false}
 // menu « Partie & options » : liste des cartes remplie depuis MAPS (+ « Au hasard » = valeur -1)
 function fillSel(){const s=document.getElementById('cMap');if(!s)return;s.textContent='';for(let i=0;i<MAPS.length;i++){const o=document.createElement('option');o.value=String(i);o.textContent=MAPS[i][0];s.appendChild(o)}const o=document.createElement('option');o.value='-1';o.textContent='Au hasard';o.title='Une carte tirée à chaque partie';s.appendChild(o)}
 fillSel();sync();
 AFTER.push(()=>{
  const sm=startMatch;startMatch=function(){roll();return sm.apply(this,arguments)};
  const rw=resetWorld;resetWorld=function(){sync();return rw.apply(this,arguments)};
  const as=applySnap;applySnap=function(s){if(s&&s.cfg){Object.assign(CFG,s.cfg);sync()}return as.apply(this,arguments)};
  const sc=syncCfg;syncCfg=function(){sc.apply(this,arguments);if(CFG.mapRand)$('cMap').value='-1'};
  $('cMap').onchange=e=>{const v=+e.target.value;CFG.mapRand=v<0;if(v>=0)CFG.map=v;sync();saveCfg();netSend({t:'hello',mode,cfg:CFG});syncCfg()};
  syncCfg()});
 return{hook,sync,roll,DEF,OB,N0};
})();
