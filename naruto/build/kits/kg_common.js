// ===== Kekkei genkai (sans clan, À LA PLACE des sub) : outils communs (préfixe gk_) =====
// Chaque kekkei genkai (kits/kg_*.js) appelle defKG(i,{…}) (nr_kits.js), écrit KIT('g<i>',…) (1 jutsu par rang, D → S, comme un clan),
// KGTRAITS[i] (trait), DASHG[i] (dash) et KGBAL[i]. Ce fichier réunit ce qu'ils partagent : palettes, coups, cumuls (états du trait),
// flaques au sol, rayons, explosions, dessins de projectiles et la petite icône de l'étape Origine.
// Palettes : GK[vfx] = {a clair, b principal, c sombre, d contour} (VP[vfx] est rempli d'après elles : étincelles et impacts aux couleurs du KG)
const GK={};
function gkPal(v,a,b,c,d){GK[v]={a,b,c,d};AFTER.push(()=>{VP[v]=[b,a,c]})}
const gkI=u=>units.indexOf(u);
const gkIn=(e,x,y,r)=>Math.hypot(e.x-x,e.y-y)<r+e.r;
// coup aux couleurs du KG (VFX = clé du KG : le trait reconnaît ses propres jutsu, même dans les effets différés)
function gkHit(e,u,d,o,v){const V=VFX;VFX=v;try{return hit(e,u,d,o||{})}finally{VFX=V}}
function gkS(k,u){const V=VFX;VFX=null;try{S(k,u)}finally{VFX=V}} // son brut (sans variante d'élément)
function gkAoe(u,x,y,r,d,o,v,cb){let n=0;for(const e of enemies(u))if(gkIn(e,x,y,r)&&gkHit(e,u,d,Object.assign({fx:x,fy:y,unblockable:1},o),v)){n++;if(cb)cb(e)}return n}
// le jutsu en cours vient-il de ce KG ? (VFX posé par fire et par gkHit)
const gkMine=v=>VFX===v;
// ---------- VFX (boîte à outils nr_fx.js : intensité, foule, camp) ----------
// gkDim(o,fn) : décor d'un objet / d'un ninja (o) atténué s'il est ennemi ; jamais pour un bord de zone dangereuse (gkEdge)
const gkDim=(o,fn)=>{const m=fxA(o);return m<1?fxAlpha(m,fn):fn()};
// impact complet aux couleurs du KG (r = rayon RÉEL du coup : l'onde s'arrête là)
function gkImp(u,x,y,v,r,o){fxImpact(x,y,v,clamp(r/60,.5,1.25),Object.assign({u,r},o||{}))} // taille de l'éclat plafonnée : un gros coup ne délave pas la cible
// bord d'une zone durable qui fait mal (flaque, nappe) : net à toute intensité ; liseré rouge pointillé si elle est ennemie
function gkEdge(x,y,r,col,k,o){const p=P(x,y),R=r*p.s;if(!(R>2)||!(k>0))return;const ga=g.globalAlpha;g.save();g.globalAlpha=ga*Math.min(1,k);
 g.lineWidth=3;g.strokeStyle=rgba('#000000',.28);g.beginPath();g.ellipse(p.x,p.y,R+1,(R+1)*K,0,0,7);g.stroke();g.lineWidth=1.7;g.strokeStyle=rgba(col,.9);g.beginPath();g.ellipse(p.x,p.y,R,R*K,0,0,7);g.stroke();
 if(fxRel(o)===2){g.strokeStyle=rgba('#ff3b3b',.7);g.lineWidth=1.2;g.setLineDash([8,7]);g.lineDashOffset=-performance.now()/60;g.beginPath();g.ellipse(p.x,p.y,Math.max(0,R-3),Math.max(0,R-3)*K,0,0,7);g.stroke();g.setLineDash([])}g.restore()}
function gkEdgeL(x,y,a,len,w,col,k,o){if(!(k>0))return;const c=Math.cos(a),s=Math.sin(a),h=w/2,pt=(f,d)=>P(x+c*f-s*d,y+s*f+c*d),Q=[pt(0,-h),pt(len,-h),pt(len,h),pt(0,h)],ga=g.globalAlpha;
 const path=()=>{g.beginPath();Q.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.closePath()};g.save();g.globalAlpha=ga*Math.min(1,k);g.lineJoin='round';
 path();g.lineWidth=3;g.strokeStyle=rgba('#000000',.28);g.stroke();g.lineWidth=1.7;g.strokeStyle=rgba(col,.9);g.stroke();
 if(fxRel(o)===2){g.strokeStyle=rgba('#ff3b3b',.7);g.lineWidth=1.2;g.setLineDash([8,7]);g.lineDashOffset=-performance.now()/60;path();g.stroke();g.setLineDash([])}g.restore()}
// sillage d'un ninja qui fonce (dash, charge) : ruban lumineux qui le suit (jx 'gk_trail', v = clé du KG)
JFXD.gk_trail=(f,k,e,t,u)=>{if(!u||u.dead)return;const C=GK[f.v]||{a:'#ffffff',b:'#ffffff'},a=Math.min(1,k*4),z=f.z??30,w=f.w||16;
 fxRibbon(f,u.x,u.y,z,C.b,w,12,.6*a);fxRibbon(f._c||(f._c={}),u.x,u.y,z,C.a,w*.4,12,.7*a)};
const gkTrail=(u,v,t,o)=>jx(Object.assign({jfx:'gk_trail',ui:gkI(u),x:u.x,y:u.y,v,t,m:t},o||{}));
// particules de décor à dessiner soi-même : nombre selon intensité / camp / budget (n = nombre voulu en Normal pour ton jutsu)
const gkN=(n,o)=>fxNB(n,o);
// contrôle à chaque image pendant un dash (charges, poings) : aux.push({type:'gk_chk',…,f})
AUXF.gk_chk=x=>{if(x.t>0&&x.f)x.f()};AUXD.gk_chk=()=>{};
// pilote : fait virer un projectile vers l'ennemi le plus proche (tête chercheuse douce)
function gkSteer(u,p,rate,R){aux.push({type:'gk_pil',x:p.x,y:p.y,r:0,t:p.life+.2,m:p.life+.2,team:u.team,owner:u,p,rate,R})}
AUXF.gk_pil=(x,dt)=>{const p=x.p;if(!p||p.dead||p.life<=0||!projs.includes(p)){x.t=0;return}x.x=p.x;x.y=p.y;const o=x.owner;if(!o)return;const e=nearE(o,p.x,p.y,x.R);if(!e)return;
 const h=Math.atan2(p.vy,p.vx);let df=Math.atan2(e.y-p.y,e.x-p.x)-h;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;const na=h+clamp(df,-x.rate*dt,x.rate*dt),sp=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp};
AUXD.gk_pil=()=>{};
// ---------- cumuls posés par un trait (un objet aux de l'hôte par cible et par clé : compte, fonte, insensibilité) ----------
// t[key] = nombre de cumuls (synchronisé : AFTER UK.push(key) dans le fichier du KG)
function gkStack(src,t,key,n,max,dur){if(!t||t.dead||!src||t.team===src.team||t.phase>0||!(n>0))return 0;let x=null;
 for(const q of aux)if(q.type==='gk_st'&&q.tg===t&&q.key===key&&!q.done){x=q;break}
 if(!x){x={type:'gk_st',x:t.x,y:t.y,r:0,t:1,m:1,team:src.team,owner:src,tg:t,key,n:0,d:0,im:0};aux.push(x)}
 if(x.im>0)return 0;x.n=Math.min(max,x.n+n);x.d=dur;x.owner=src;t[key]=x.n;return x.n}
function gkStSet(t,key,n,im){for(const q of aux)if(q.type==='gk_st'&&q.tg===t&&q.key===key&&!q.done){q.n=n;q.im=im||0;t[key]=n}}
AUXF.gk_st=(x,dt)=>{const t=x.tg;if(x.done)return;if(!t||t.dead||units.indexOf(t)<0){x.done=1;x.t=0;if(t)t[x.key]=0;return}
 x.x=t.x;x.y=t.y;if(x.d>0){x.d-=dt;if(x.d<=0)x.n=0}if(x.im>0)x.im-=dt;t[x.key]=x.n;if(!x.n&&!(x.im>0)){x.done=1;x.t=0}else x.t=1};
AUXD.gk_st=()=>{};
// pastilles des cumuls sous les pieds de la cible : GKST = [{key, max, col, c2}]
const GKST=[];
STATD.push((u,p,S,sk)=>{if(u.dead)return;sk=sk||1;let row=0;for(const s of GKST){const n=u[s.key]|0;if(!n)continue;const t=performance.now()/1000;g.save();
 g.fillStyle=rgba(s.col,.16+.05*n);g.beginPath();g.ellipse(p.x,p.y+row*3*S,(15+n*3)*S*sk,(5+n)*S*sk,0,0,7);g.fill();
 for(let i=0;i<s.max;i++){const b=t*1.4+i*Math.PI*2/s.max,x=p.x+Math.cos(b)*17*S*sk,y=p.y+Math.sin(b)*6*S*sk-3*S,on=i<n,z=4.5*S;
  g.fillStyle=on?s.col:rgba(s.col,.18);g.strokeStyle=on?s.c2:rgba(s.c2,.3);g.lineWidth=1;g.beginPath();g.arc(x,y-z*.4,z*.8,0,7);g.fill();g.stroke()}
 g.restore();row++}});
// ligne de trait du HUD : nom · cumuls de l'ennemi le plus proche
function gkHud(u,x,y,nm,key,max,col,col0,extra){y-=20;let tg=null,bd=1e9;for(const e of units)if(!e.dead&&e.team!==u.team){const d=dist(u,e);if(d<bd){bd=d;tg=e}}
 const n=key&&tg?tg[key]|0:0;text(nm+(key?' · cible : '+'●'.repeat(n)+'○'.repeat(max-n):'')+(extra?' '+extra:''),x,y+6,11,n?col:col0,'left','normal')}
// ---------- flaques et nappes au sol (lave, brume, or, poussière…) ----------
// gkPool(u,x,y,{r,t,kind,vfx,d (dégâts par tick),iv (intervalle, 0,5 s),o (options du coup),sl (ralentit),fn(e,x) (à chaque tick sur un ennemi),self(o,x) (lanceur dedans, chaque image)})
// kind = dessin (GKPOOL[kind]) : seul ce qui est synchronisé (x y r t m kind) sert au dessin, chez l'hôte comme chez les invités
const GKPOOL={};
function gkPool(u,x,y,o){const q=Object.assign({type:'gk_pool',x:clamp(x,B.x+10,B.x+B.w-10),y:clamp(y,B.y+10,B.y+B.h-10),r:70,t:3,team:u.team,owner:u,k:.15,iv:.5,danger:1},o);q.m=q.t;aux.push(q);return q}
AUXF.gk_pool=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;if(x.self&&!o.dead&&gkIn(o,x.x,x.y,x.r))x.self(o,x);
 if(x.sl)for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)&&!(e.dash&&e.dash.jump)&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.2);
 if(x.k>0)return;x.k=x.iv;for(const e of enemies(o)){if(!gkIn(e,x.x,x.y,x.r)||(e.dash&&e.dash.jump)||e.airT>0)continue;const h=x.d?gkHit(e,o,x.d,Object.assign({silent:1},x.o),x.vfx):true;if(h&&x.fn)x.fn(e,x)}};
// dessin : décor atténué (ennemi) + bord net (danger) aux couleurs du KG (GKPOOLC[kind] : une nappe qui fait mal ou ralentit ; kind est synchronisé, donc l'invité le voit aussi)
const GKPOOLC={};
AUXD.gk_pool=(x,k,t)=>{const D=GKPOOL[x.kind],a=Math.min(1,x.t/.45,(x.m-x.t)/.2+.15);if(D)gkDim(x,()=>D(x,a,t));if(GKPOOLC[x.kind])gkEdge(x.x,x.y,x.r,GKPOOLC[x.kind]||'#ffffff',Math.min(1,x.t/.3)*Math.min(1,(x.m-x.t)/.15),x)};
// bande au sol (traînée d'un dash) : gkStrip(u,x0,y0,x1,y1,{w,t,kind,vfx,d,iv,o,sl,fn,self})
function gkStrip(u,x0,y0,x1,y1,o){const L=Math.hypot(x1-x0,y1-y0);const q=Object.assign({type:'gk_strip',x:x0,y:y0,a:Math.atan2(y1-y0,x1-x0),len:Math.max(24,L),w:46,r:0,t:2.5,team:u.team,owner:u,k:.1,iv:.5,hs:new Set()},o);q.m=q.t;aux.push(q);return q}
const gkOnStrip=(x,e,pad)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa;return f>-e.r*pad&&f<x.len+e.r*pad&&Math.abs(-dx*sa+dy*ca)<x.w/2+e.r*pad};
AUXF.gk_strip=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;if(x.self&&!o.dead&&gkOnStrip(x,o,1))x.self(o,x);
 if(x.sl)for(const e of enemies(o))if(gkOnStrip(x,e,.6)&&!(e.dash&&e.dash.jump)&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.2);
 if(x.k>0)return;x.k=x.iv;for(const e of enemies(o)){if(!gkOnStrip(x,e,.6)||(e.dash&&e.dash.jump))continue;const h=x.d?gkHit(e,o,x.d,Object.assign({silent:1},x.o),x.vfx):true;if(h&&x.fn)x.fn(e,x)}};
AUXD.gk_strip=(x,k,t)=>{const D=GKPOOL[x.kind];if(!D)return;const ca=Math.cos(x.a),sa=Math.sin(x.a),n=Math.max(1,Math.round(x.len/34)),al=Math.min(1,x.t/.45,(x.m-x.t)/.2+.15);
 gkDim(x,()=>{for(let i=0;i<n;i++){const f=(i+.5)/n*x.len;D({x:x.x+ca*f,y:x.y+sa*f,r:x.w*.62,t:x.t,m:x.m,kind:x.kind,strip:1,i},al,t+i*.37)}});
 if(GKPOOLC[x.kind])gkEdgeL(x.x,x.y,x.a,x.len,x.w,GKPOOLC[x.kind]||'#ffffff',Math.min(1,x.t/.3)*Math.min(1,(x.m-x.t)/.15),x)};
// ---------- rayons (lasers, fils de poussière, foudre) ----------
// touche tout ce qui est dans le rectangle (longueur len, largeur w) ; GKBEAM[st] dessine (st = style du rayon)
const GKBEAM={};
function gkBeam(u,x0,y0,a,len,w,d,o,v,st,cb,dur){const ca=Math.cos(a),sa=Math.sin(a),hs=[];
 for(const e of enemies(u)){const dx=e.x-x0,dy=e.y-y0,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f>-e.r&&f<len+e.r&&s<w/2+e.r&&gkHit(e,u,d,Object.assign({unblockable:1},o),v)){hs.push(e);if(cb)cb(e)}}
 const x2=clamp(x0+ca*len,B.x,B.x+B.w),y2=clamp(y0+sa*len,B.y,B.y+B.h);jx({jfx:'gk_beam',x:x0,y:y0,x2,y2,w,st,t:dur||.4,m:dur||.4});
 const C=GK[v]||{a:'#ffffff',b:'#ffffff'};fxFlare(x2,y2,C.b,{u,z:32,r:Math.min(40,w*.9),t:.18,star:0});for(const e of hs)fxBurst(e.x,e.y,C.a,{u,z:30,n:6,sp:240,c2:'#ffffff',t:.3,w:1.6,a:a,arc:2.2});return hs}
JFXD.gk_beam=(f,k,e,t)=>{const D=GKBEAM[f.st];if(D)D(f,k,e,t)};
// rayon générique : cœur blanc, halo à la couleur, éclats le long
function gkBeamDraw(f,k,e,t,c1,c2,o={}){const A=P(f.x,f.y,o.z??30),Bq=P(f.x2,f.y2,o.z??30),s=A.s,w=f.w*s*(o.thin?.8:1),on=Math.min(1,e*f.m/.06);
 // bouche du rayon et point d'arrivée : lueurs (sprites) ; ouverture brève (le rayon « s'allume »)
 const mw=Math.min(w,26*s);fxGlowS(A.x,A.y,mw*1.3+6*s,o.dark?c1:c2,.55*k*on);fxGlowS(Bq.x,Bq.y,mw*1.1+4*s,o.dark?c1:c2,.5*k);g.save();g.lineCap='round';
 if(o.dark){g.strokeStyle=rgba(c2,.85*k);g.lineWidth=w*1.2*(.6+.4*k);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(c1,.8*k);g.lineWidth=Math.max(1.5,w*.25);g.stroke()}
 else{g.globalCompositeOperation='lighter';g.strokeStyle=rgba(c2,.36*k);g.lineWidth=w*(.55+.45*k)*(.6+.4*on); /* halo = largeur réelle du coup */g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke();
  g.strokeStyle=rgba(c1,(o.soft?.5:.9)*k);g.lineWidth=w*.55;g.stroke();g.strokeStyle=rgba('#ffffff',(o.soft?.7:.95)*k);g.lineWidth=Math.max(1.2,w*(o.soft?.1:.18));g.stroke()} /* soft : rayon large au-dessus des ninjas, cœur moins opaque */
 const n=gkN(10,f);for(let i=0;i<n;i++){const m=((i/n+t*1.7)%1),x=lerp(A.x,Bq.x,m),y=lerp(A.y,Bq.y,m)+Math.sin(i*7.3+t*20)*w*.6;g.fillStyle=rgba(o.dark?c1:'#ffffff',.8*k);g.fillRect(x-1.5*s,y-1.5*s,3*s,3*s)}
 g.restore()}
// éclair brisé (foudre, foudre noire) entre deux points
function gkZig(x0,y0,x1,y1,seg,amp,seed){const L=[];for(let i=0;i<=seg;i++){const m=i/seg,j=i===0||i===seg?0:Math.sin(seed+i*12.9898)*43758.5453%1;L.push({x:lerp(x0,x1,m)+(j-.5)*amp*(i%2?1:-1),y:lerp(y0,y1,m)+(Math.cos(seed*1.7+i*7.1)*amp*.5)})}return L}
function gkBolt(pts,c1,c2,w,k,dark){g.save();g.lineCap='round';g.lineJoin='round';const path=()=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y))};
 if(dark){path();g.strokeStyle=rgba(c2,.9*k);g.lineWidth=w*1.6;g.stroke();g.globalCompositeOperation='lighter';path();g.strokeStyle=rgba(c1,.9*k);g.lineWidth=w*.45;g.stroke()}
 else{g.globalCompositeOperation='lighter';path();g.strokeStyle=rgba(c2,.5*k);g.lineWidth=w*2.2;g.stroke();path();g.strokeStyle=rgba(c1,.95*k);g.lineWidth=w*.8;g.stroke();path();g.strokeStyle=rgba('#ffffff',k);g.lineWidth=Math.max(1,w*.3);g.stroke()}g.restore()}
// ---------- explosions et ondes ----------
// jx({jfx:'gk_boom',x,y,r,v (palette),s (style : 'blast' 'lava' 'steam' 'gold' 'dust' 'crys' 'iron' 'dry'),t,m})
// l'onde s'arrête au rayon r : passer le rayon RÉEL du coup. Lumière en sprites additifs modérés (jamais un aplat blanc sur un ninja).
JFXD.gk_boom=(f,k,e,t)=>{const C=GK[f.v]||{a:'#fff',b:'#fc6',c:'#a50',d:'#420'},q=P(f.x,f.y,0),s=q.s,R=f.r,st=f.s||'blast',hot=st==='blast'||st==='lava'||st==='dry',ee=1-Math.pow(1-e,3),soft=st==='steam'||st==='dust';g.save();
 const gr=R*s*(.45+.6*ee);fxGlowS(q.x,q.y,gr,C.b,(hot?.28:.2)*k,gr*K,0);
 if(hot){const b=P(f.x,f.y,16+34*ee),rr=Math.min(80,R*.5)*s*(.6+.7*ee);fxGlowS(b.x,b.y,rr,C.b,.22*k*k,undefined,0);fxGlowS(b.x,b.y,rr*.4,C.a,.16*k*k)} // boule de feu sans voile : le lanceur au centre reste lisible
 // fumée, vapeur, poussière, poudre : bouffées douces (non additives, ≤ 0,3)
 const nS=gkN(soft?9:st==='crys'||st==='iron'?3:5,f),sc=st==='steam'?'#ffffff':st==='dust'?C.a:st==='gold'?C.b:st==='crys'?C.a:st==='iron'?C.c:'#4a3a36';
 for(let i=0;i<nS;i++){const b=i*2.399+f.x*.013,d=R*(.18+.72*ee)*(.55+.45*((i*.37)%1)),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,8+e*(st==='steam'?64:28)+(i%3)*7),rr=(9+e*18)*s*Math.min(1.7,R/80+.45);
  fxSoftS(p.x,p.y,rr,i%3?sc:C.a,(soft?.3:.22)*k*Math.min(1,e*7))}
 g.strokeStyle=rgba(C.a,.85*k);g.lineWidth=(5*k+1)*s;gEll(f.x,f.y,R*(.25+.75*ee));g.stroke();g.strokeStyle=rgba(C.c,.5*k);g.lineWidth=2;gEll(f.x,f.y,R*(.15+.7*ee));g.stroke();
 const n=soft?0:gkN(12,f);for(let i=0;i<n;i++){const b=i*(6.283/n)+f.y*.01,d=R*(.12+e*.9)*(i%2?.75:1),h=40*Math.sin(Math.PI*Math.min(1,e*1.15))+(i%3)*8,p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,h);
  g.save();g.translate(p.x,p.y);g.rotate(b+e*6);g.globalAlpha=Math.min(1,k*1.5);g.fillStyle=i%3?C.b:C.a;g.strokeStyle=C.d;g.lineWidth=.8;
  if(st==='crys'||st==='iron'){g.beginPath();g.moveTo(-5*s,0);g.lineTo(0,-3.4*s);g.lineTo(6*s,0);g.lineTo(0,2.6*s);g.closePath();g.fill();g.stroke()}
  else if(st==='gold'){g.beginPath();g.arc(0,0,3.2*s,0,7);g.fill();g.stroke()}
  else{g.globalCompositeOperation='lighter';g.beginPath();g.arc(0,0,(2+(i%3))*s,0,7);g.fill()}g.restore()}
 g.restore()};
// ---------- projectiles ----------
// sphère lumineuse (cœur blanc, halo, traînée) : PROJD[kind]=gkOrbD(v,{n:longueur de traînée,spk:pointes}) ; lueurs en sprites (pas de dégradé recalculé)
const gkOrbD=(v,o={})=>(p,R,ra,t)=>{const C=GK[v],A=p&&p.owner?fxA(p):1;g.rotate(ra);fxTailL(R*(o.n??5)*1.5,R*2.3,C.b,.6*A);
 const pu=1+.08*Math.sin(t/70);fxGlowS(0,0,R*2.2*pu,C.b,.85);fxGlowS(0,0,R*1.15,C.a,.9);
 if(o.spk){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(C.a,.85);g.lineWidth=1.4;for(let i=0;i<o.spk;i++){const b=i*6.283/o.spk+t/200,l=1.55+.25*Math.sin(t/60+i*2.1);g.beginPath();g.moveTo(Math.cos(b)*R*.8,Math.sin(b)*R*.8);g.lineTo(Math.cos(b)*R*l,Math.sin(b)*R*l);g.stroke()}g.restore()}
 g.fillStyle=o.core||C.a;g.beginPath();g.arc(0,0,R*.62,0,7);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(-R*.15,-R*.18,R*.24,0,7);g.fill()};
// éclat (aiguille, cristal, pointe de fer) : filet lumineux derrière
const gkShardD=(v,L=16)=>(p,R,ra,t)=>{const C=GK[v],A=p&&p.owner?fxA(p):1;g.rotate(ra);fxTailL(L*2.6,R*1.5+3,C.a,.55*A);
 g.fillStyle=C.b;g.strokeStyle=C.d;g.lineWidth=.9;g.beginPath();g.moveTo(L,0);g.lineTo(L*.2,-R*.5-2);g.lineTo(-L,-1.2);g.lineTo(-L,1.2);g.lineTo(L*.2,R*.5+2);g.closePath();g.fill();g.stroke();g.fillStyle=C.a;g.fillRect(-L*.6,-.6,L*1.2,1.2);fxGlowS(L*.7,0,5,C.a,.6)};
// masse lourde et grumeleuse (roche en fusion, or) : grumeaux qui tournent sur eux-mêmes ; o.glow lueur, o.tail traînée (projectile en vol)
const gkLumpD=(v,o={})=>(p,R,ra,t)=>{const C=GK[v];g.save();if(o.tail&&p&&p.vx!=null){g.save();g.rotate(ra);fxTailL(R*4.5,R*1.9,C.b,.5*(p.owner?fxA(p):1));g.restore()}
 if(o.glow)fxGlowS(0,0,R*1.9,C.b,.5);
 g.rotate(t/(o.spin||220));g.fillStyle=C.c;g.strokeStyle=C.d;g.lineWidth=1.2;g.beginPath();for(let i=0;i<9;i++){const b=i*.698,rr=R*(.82+.18*Math.sin(i*2.7));i?g.lineTo(Math.cos(b)*rr,Math.sin(b)*rr):g.moveTo(Math.cos(b)*rr,Math.sin(b)*rr)}g.closePath();g.fill();g.stroke();
 g.fillStyle=C.b;for(let i=0;i<4;i++){const b=i*1.57+.4;g.beginPath();g.arc(Math.cos(b)*R*.38,Math.sin(b)*R*.38,R*.26,0,7);g.fill()}g.fillStyle=C.a;g.beginPath();g.arc(-R*.2,-R*.25,R*.18,0,7);g.fill();g.restore()};
// ---------- dessin d'un pilier / bloc (cristal, cube, prison) vu en 3/4 ----------
function gkPrism(cx,cy,r,h,n,rot,cA,cB,cO,al){const pts=[];for(let i=0;i<n;i++){const b=rot+i*6.283/n;pts.push([cx+Math.cos(b)*r,cy+Math.sin(b)*r])}
 const base=pts.map(([x,y])=>P(x,y,0)),top=pts.map(([x,y])=>P(x,y,h));g.save();g.globalAlpha*=al;g.lineWidth=1;g.strokeStyle=cO;
 for(let i=0;i<n;i++){const j=(i+1)%n;if(base[j].x-base[i].x<=0&&n>2)continue;poly([base[i],base[j],top[j],top[i]],i%2?cA:cB);g.stroke()}poly(top,cA);g.stroke();g.restore()}
// ---------- icône d'un KG (jIcon, case 'g') : KGS[i].ico(g) dessine dans un repère de 32 px centré, à la couleur f ----------
// ---------- animation : deux paumes poussées vers l'avant (rayons, jets) ----------
Object.assign(ANIM,{
 gk_push:(P,e)=>{const c=e<.3,k=c?ezo(e/.3):1-ezio(Math.min(1,(e-.3)/.7))*.7;for(const s of['L','R']){const sd=s==='L'?1:-1;pz(P,'arm'+s,c?-.5*k:-1.55*k,0,c?.6*sd*k:.1*sd);pz(P,'fore'+s,c?-1.5*k:-.1)}
  pz(P,'chest',c?-.2*k:.3*k);P.root.z=c?-3*k:8*k;if(!c){pz(P,'thighL',-.6*k);pz(P,'shinL',.5*k);pz(P,'thighR',.4*k)}},
 // mains levées vers le ciel, puis abattues (ce qui tombe d'en haut)
 gk_call:(P,e)=>{const up=e<.55,k=up?ezo(e/.55):1-ezo(Math.min(1,(e-.55)/.3));pz(P,'armL',(up?-2.8:-1.2)*k,0,.4*k);pz(P,'armR',(up?-2.8:-1.2)*k,0,-.4*k);pz(P,'foreL',-.3*k);pz(P,'foreR',-.3*k);pz(P,'chest',(up?-.25:.35)*k);pz(P,'head',(up?-.35:.1)*k);P.root.y=up?2*k:-4*k},
 // ramassé, mains jointes qui concentrent, puis s'ouvrent
 // lancer par-dessus l'épaule (bombes en cloche, grenade) : armé derrière la tête, bascule du buste, bras qui fouette
 gk_lob:(P,e)=>{const a=ezo(Math.min(1,e/.32)),b=e<.32?0:ezo(Math.min(1,(e-.32)/.22)),f=e>.7?1-ezio((e-.7)/.3):1;
  pz(P,'armR',lerp(-2.75*a,-1.25,b)*f,0,lerp(-.35*a,-.1,b)*f);pz(P,'foreR',lerp(-1.3*a,-.15,b)*f);pz(P,'armL',lerp(-1.1*a,.45,b)*f,0,.45*a*f);pz(P,'foreL',-.6*a*f);
  pz(P,'chest',lerp(-.28*a,.38,b)*f);pz(P,'head',lerp(-.2*a,.1,b)*f);P.rootR.y=lerp(.4*a,-.35,b)*f;pz(P,'thighL',lerp(0,-.55,b)*f);pz(P,'shinL',.35*b*f);pz(P,'thighR',lerp(.25*a,.35,b)*f);P.root.y=-3*b*f},
 // deux poings abattus au sol (éruption, mines, pics) : bond léger, accroupi, impact
 gk_slam:(P,e)=>{const a=ezo(Math.min(1,e/.35)),b=e<.35?0:ezo(Math.min(1,(e-.35)/.15)),f=e>.72?1-ezio((e-.72)/.28):1;
  for(const sd of['L','R']){const z=sd==='L'?1:-1;pz(P,'arm'+sd,lerp(-2.9*a,-.9,b)*f,0,lerp(.25,.5,b)*z*f);pz(P,'fore'+sd,lerp(-.4*a,-.2,b)*f)}
  pz(P,'chest',lerp(-.3*a,.75,b)*f);pz(P,'head',lerp(-.25*a,-.15,b)*f);P.root.z=lerp(6*a,-14,b)*f;P.root.y=lerp(4*a,-10,b)*f;
  pz(P,'thighL',lerp(-.2,-1.1,b)*f);pz(P,'shinL',lerp(.3,1.6,b)*f);pz(P,'thighR',lerp(-.1,-.3,b)*f);pz(P,'shinR',lerp(.2,1.5,b)*f)},
 // balayage d'un bras (vague, arc) : le bras part de l'épaule opposée et fauche devant soi
 gk_sweep:(P,e)=>{const a=ezo(Math.min(1,e/.3)),b=e<.3?0:ezio(Math.min(1,(e-.3)/.3)),f=e>.75?1-ezio((e-.75)/.25):1;
  pz(P,'armR',-1.45*f,0,lerp(.9*a,-1.1,b)*f);pz(P,'foreR',lerp(-1.2*a,-.1,b)*f);pz(P,'armL',lerp(-.6*a,.3,b)*f,0,.3*f);
  P.rootR.y=lerp(.65*a,-.6,b)*f;pz(P,'chest',.2*f);pz(P,'thighL',-.5*f);pz(P,'shinL',.4*f);pz(P,'thighR',.3*f);P.root.y=-4*f},
 gk_charge:(P,e)=>{const k=ezo(Math.min(1,e/.3));pz(P,'armL',-1.3*k,0,-.45*k);pz(P,'armR',-1.3*k,0,.45*k);pz(P,'foreL',-1.5*k);pz(P,'foreR',-1.5*k);pz(P,'chest',.15*k);P.root.y=-5*k*(1-Math.max(0,e-.8)*5);pz(P,'thighL',-.5*k);pz(P,'shinL',.8*k);pz(P,'thighR',.3*k);pz(P,'shinR',.6*k)},
});
