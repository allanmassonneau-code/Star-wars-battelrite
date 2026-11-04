// ---------- Effets visuels : intensité, budget de particules, boîte à outils commune (FX) ----------
// Tout ici est VISUEL : rien ne change le jeu (dégâts, positions, recharges). Doc et exemples : kits/API.md, section « VFX ».
// Effets « analytiques » : UN objet fx par effet (sans vx, donc envoyé tel quel aux invités par netCapture), dont les particules sont
// recalculées au dessin à partir d'une graine (sd) : chaque écran les dessine avec SA propre intensité (option, foule, camp du lanceur).
// Niveaux (OPT.fxi, « Intensité des effets » dans Partie & options, gardé dans nrOpt) : 0 Faible, 1 Normal (défaut), 2 Fort
//  k = échelle du décor (nombre de particules), a = opacité des effets ENNEMIS, b = budget de particules dessinées par image, sh = secousse
const FXL=[{n:'Faible',k:.45,a:.55,b:420,sh:0},{n:'Normal',k:.8,a:.68,b:850,sh:.6},{n:'Fort',k:1,a:.8,b:1400,sh:1}];
const FXF={fl:0,t:0,crowd:1,alive:0,drawn:0,dec:0,shW:0,hp:null,hu:null,hooked:false};
let FXO=null,FXAM=1; // FXO : lanceur courant (posé par le moteur pendant un jutsu, un objet aux, une zone, un projectile) ; FXAM : opacité imposée (fxAlpha)
const FXRK=[1,.8,.55,1]; // décor selon le camp : 0 le mien, 1 allié, 2 ennemi, 3 inconnu (décor du monde)
const fxLvl=()=>FXL[OPT.fxi==null?1:OPT.fxi]||FXL[1];
const fxH=(s,i,k)=>{const v=Math.sin(s*12.9898+i*78.233+k*37.719)*43758.5453;return v-Math.floor(v)}; // hasard fixe (graine, indice, canal) → 0..1
// ---- camp du lanceur : unité, indice d'unité, ou objet (fx avec oi/ui, projectile/aux/zone avec owner, objet avec team)
function fxOwn(o){if(o==null)return FXO||CUR||null;if(typeof o==='number')return units[o]||null;if(o.ch&&o.max!==undefined)return o;
 if(o.oi!=null)return units[o.oi]||null;if(o.owner&&o.owner.ch)return o.owner;if(o.u&&o.u.ch)return o.u;if(o.ui!=null&&o.jfx)return units[o.ui]||null;if(o.src&&o.src.ch)return o.src;return null}
function fxRel(o){const u=fxOwn(o);if(u)return u===player?0:player&&u.team===player.team?1:2;const tm=o&&typeof o==='object'?o.team:undefined;return tm==null||!player?3:tm===player.team?1:2}
const fxOI=u=>{const w=u===undefined?(FXO||CUR):u;if(w==null)return undefined;if(typeof w==='number')return w;const i=units.indexOf(w);return i>=0?i:undefined};
function fxTag(i0,u){const oi=fxOI(u);if(oi==null)return;for(let i=i0;i<fx.length;i++)if(fx[i].oi==null)fx[i].oi=oi}
// ---- échelles : à appeler AU DESSIN (chaque écran a ses réglages)
function fxK(o){const L=fxLvl(),r=fxRel(o),c=FXF.crowd;return L.k*(r===0?Math.max(c,.85):c)*FXRK[r]} // décor 0..1 (Normal, 1c1, mon jutsu = 0,8)
function fxA(o){const r=fxRel(o);if(r===0||r===3)return 1;const L=fxLvl();return r===1?Math.min(1,L.a+.22):L.a*(.85+.15*FXF.crowd)} // opacité (ennemi ≈ 0,68 en Normal)
function fxN(n,o){return n>0?Math.max(1,Math.round(n*fxK(o)/.8)):0} // nombre de particules (n = nombre voulu en Normal pour ton jutsu)
function fxNB(n,o){let m=fxN(n,o);const B=fxLvl().b*(.55+.45*FXF.crowd),d=FXF.drawn;if(d>B*.6)m=Math.floor(m*Math.max(0,(B-d)/(B*.4)));FXF.drawn+=m;return m} // + budget global de l'image
// ---- une fois par image (draw) : foule, secousse, coup lourd reçu
function fxFrame(){const now=performance.now(),dt=FXF.t?Math.min(.1,Math.max(0,(now-FXF.t)/1000)):0;FXF.t=now;FXF.drawn=0;FXF.dec=0;FXF.fl=0;fxHook();
 let n=0;for(const u of units){if(!u.dead)n++;if(u.fxHS>0)u.fxHS=Math.max(0,u.fxHS-dt)}FXF.alive=n;FXF.crowd=n<=8?1:Math.max(.56,1-(n-8)*.44/32); // 20c20 : 0,56 (Normal ≈ Faible en 1c1)
 FXF.shW=Math.max(0,FXF.shW-dt);
 const pl=player;if(pl&&!pl.dead&&state==='fight'){if(FXF.hu===pl&&FXF.hp!=null){const d=FXF.hp-pl.hp;if(d>=pl.max*.09)fxShake(Math.min(.32,d/pl.max*2))}FXF.hp=pl.hp;FXF.hu=pl}else FXF.hp=null}
// opacité imposée à tout un dessin (jfx ennemis…) : le contexte principal multiplie globalAlpha par FXAM (lecture : valeur logique)
function fxHook(){if(FXF.hooked)return;FXF.hooked=true;try{const c=cv.getContext('2d'),D=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'globalAlpha');if(!D||!D.set)return;
 Object.defineProperty(c,'globalAlpha',{configurable:true,get(){const v=D.get.call(this);return FXAM===1?v:v/FXAM},set(v){D.set.call(this,FXAM===1?v:v*FXAM)}})}catch(e){}}
function fxAlpha(m,fn){if(!(m<1))return fn();const o=FXAM;g.save();FXAM=o*Math.max(0,m);g.globalAlpha=1;try{return fn()}finally{g.restore();FXAM=o}}
// ---- secousse : seulement jutsu S (fenêtre ouverte au lancement) et gros coups reçus ; × intensité (aucune en Faible)
function fxShake(a,x,y){if(x!=null&&!nearMe(x,y))return;FXF.shW=Math.max(FXF.shW,.45);shake=Math.max(shake,a)}
function fxShakeNow(){const L=fxLvl();return FXF.shW>0&&L.sh>0&&shake>0?Math.min(shake,.5)*L.sh:0}
// ---- arrêt sur coup (hit-stop) : gel visuel des deux ninjas (u.fxHS, lu par l'animation) ; vraie pause de 35-75 ms seulement hors ligne et pour un gros coup du joueur local
function fxHitStop(src,t,dmg,big){if(!t||!t.ch)return false;if(!(big||dmg>=Math.max(16,(t.max||200)*.07)))return false;
 t.fxHS=Math.max(t.fxHS||0,.08);if(src&&src.ch)src.fxHS=Math.max(src.fxHS||0,.06);
 if((src===player||t===player)&&!isGuest()&&!coop())hs=Math.max(hs,Math.min(.075,.035+dmg/900));return true}
// ---- couleurs : hex (#rgb / #rrggbb) depuis n'importe quelle couleur CSS, mis en cache
const FXHX=new Map();let FXCX=null;
function fxHex(c){if(typeof c!=='string')return'#ffffff';if(c[0]==='#'&&(c.length===7||c.length===4))return c;let h=FXHX.get(c);if(h)return h;
 try{FXCX=FXCX||document.createElement('canvas').getContext('2d');FXCX.fillStyle='#fff';FXCX.fillStyle=c;const s=FXCX.fillStyle;if(s[0]==='#')h=s;else{const m=s.match(/[\d.]+/g)||[255,255,255];h='#'+[0,1,2].map(i=>(+m[i]|0).toString(16).padStart(2,'0')).join('')}}catch(e){h='#ffffff'}
 if(FXHX.size>200)FXHX.clear();FXHX.set(c,h);return h}
// ---- sprites pré-rendus (dégradés radiaux en cache) : 0 linéaire, 1 lueur à cœur blanc, 2 doux (fumée, ombre)
const FXSPR=new Map();
function fxSpr(col,kind=1){col=fxHex(col);const key=kind+col;let c=FXSPR.get(key);if(c)return c;if(FXSPR.size>300)FXSPR.clear();
 c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);
 if(kind===1){gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.14,rgba(col,1));gr.addColorStop(.42,rgba(col,.42));gr.addColorStop(1,rgba(col,0))}
 else if(kind===2){gr.addColorStop(0,rgba(col,1));gr.addColorStop(.5,rgba(col,.62));gr.addColorStop(1,rgba(col,0))}
 else{gr.addColorStop(0,rgba(col,1));gr.addColorStop(1,rgba(col,0))}
 x.fillStyle=gr;x.fillRect(0,0,64,64);FXSPR.set(key,c);return c}
// lueur additive en coordonnées écran (rx, ry : rayons) ; fxGlow : au point (x, y, hauteur z) du monde ; fxGlowG : tache de lumière au sol (ellipse)
function fxGlowS(sx,sy,rx,col,a=1,ry,kind=1){if(!(rx>0)||!(a>0)||sx+rx<-20||sx-rx>W+20)return;ry=ry??rx;const o=g.globalCompositeOperation,ga=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=ga*Math.min(1,a);g.drawImage(fxSpr(col,kind),sx-rx,sy-ry,rx*2,ry*2);g.globalAlpha=ga;g.globalCompositeOperation=o}
function fxGlow(x,y,z,r,col,a){const q=P(x,y,z);fxGlowS(q.x,q.y,r*q.s,col,a)}
function fxGlowG(x,y,r,col,a){const q=P(x,y);fxGlowS(q.x,q.y,r*q.s,col,a,r*q.s*K,0)}
// tache sombre / fumée (source-over, jamais opaque : a ≤ 0,5 conseillé)
function fxSoftS(sx,sy,rx,col,a=.3,ry){if(!(rx>0)||!(a>0))return;ry=ry??rx;const ga=g.globalAlpha;g.globalAlpha=ga*Math.min(1,a);g.drawImage(fxSpr(col,2),sx-rx,sy-ry,rx*2,ry*2);g.globalAlpha=ga}
// éclair brisé à l'écran (additif) : lueur large + cœur blanc ; seed change ≈ 18 fois/s pour crépiter sans clignoter
function fxBoltS(x0,y0,x1,y1,col,w=2,seed=1,jit=.18,seg=8){const L=Math.hypot(x1-x0,y1-y0);if(!(L>1))return;const nx=-(y1-y0)/L,ny=(x1-x0)/L,pts=[[x0,y0]];
 for(let i=1;i<seg;i++){const k=i/seg,o=(fxH(seed,i,5)-.5)*2*L*jit*Math.sin(Math.PI*k);pts.push([x0+(x1-x0)*k+nx*o,y0+(y1-y0)*k+ny*o])}pts.push([x1,y1]);
 const o=g.globalCompositeOperation;g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';const ga=g.globalAlpha;
 for(const [lw,c,a] of[[w*3.2,col,.28],[w,col,.9],[Math.max(.8,w*.4),'#ffffff',.95]]){g.globalAlpha=ga*a;g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
 g.globalAlpha=ga;g.globalCompositeOperation=o}
// traînée effilée dans le repère courant (après g.rotate : axe x = direction) : de (0,0) vers -len ; idéal dans PROJD
function fxTailL(len,w,col,a=.7){if(!(len>1)||!(w>0))return;const ga=g.globalAlpha,o=g.globalCompositeOperation,S=fxSpr(col,0),Wt=fxSpr('#ffffff',0);g.globalCompositeOperation='lighter';g.globalAlpha=ga*a;
 g.drawImage(S,0,0,32,64,-len,-w/2,len,w);g.drawImage(S,32,0,32,64,0,-w/2,w*.35,w); // demi-sprite : le plus vif au niveau de l'objet, s'éteint derrière
 g.globalAlpha=ga*a*.7;g.drawImage(Wt,0,0,32,64,-len*.45,-w*.17,len*.45,w*.34);g.globalAlpha=ga;g.globalCompositeOperation=o}
// traînée d'un objet mobile (monde) d'après sa vitesse : x, y, hauteur z, vx, vy (px/s) ; len en px de monde
function fxTrailW(x,y,z,vx,vy,len,w,col,a=.6){const q=P(x,y,z),sp=Math.hypot(vx,vy);if(!(sp>1))return;const ra=Math.atan2(vy*K,vx);g.save();g.translate(q.x,q.y);g.rotate(ra);fxTailL(len*q.s,w*q.s,col,a);g.restore()}
// ruban (historique de positions gardé sur l'objet, ex. une unité qui fonce) : appeler à chaque image de dessin
function fxRibbon(o,x,y,z,col,w=10,n=10,a=.6){const now=performance.now(),H=o._fxrb||(o._fxrb=[]),l=H[H.length-1];if(!l||Math.hypot(l[0]-x,l[1]-y)>3)H.push([x,y,z,now]);while(H.length>n||(H.length&&now-H[0][3]>260))H.shift();if(H.length<2)return;
 const o0=g.globalCompositeOperation;g.globalCompositeOperation='lighter';g.lineCap='round';const ga=g.globalAlpha;
 for(let i=1;i<H.length;i++){const k=i/H.length,p0=P(H[i-1][0],H[i-1][1],H[i-1][2]),p1=P(H[i][0],H[i][1],H[i][2]);g.globalAlpha=ga*a*k;g.strokeStyle=col;g.lineWidth=w*k*p1.s;g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.stroke()}
 g.globalAlpha=ga;g.globalCompositeOperation=o0}
// ---- TÉLÉGRAPHES (danger) : JAMAIS atténués (ni intensité, ni foule, ni camp) ; forme = hitbox EXACTE ; k = progression 0→1 (1 = ça frappe)
// ennemi : liseré rouge en plus de la couleur de l'élément ; dernier quart : bord qui pulse
function fxTeleStyle(col,o,k,fill){const en=fxRel(o)===2,pl=k>.75?.6+.4*Math.sin(performance.now()/45):1;return{c:fxHex(col),en,pl,fill:fill??.1}}
function fxTele(x,y,r,k,col,o,fill){const S=fxTeleStyle(col,o,k,fill),p=P(x,y),R=Math.max(0,r*p.s);if(!(R>0))return;const ga=g.globalAlpha;g.save();g.globalAlpha=1;
 g.fillStyle=rgba(S.c,S.fill);g.beginPath();g.ellipse(p.x,p.y,R,R*K,0,0,6.2832);g.fill();
 if(k>0){g.fillStyle=rgba(S.c,.2);g.beginPath();g.ellipse(p.x,p.y,R*Math.min(1,k),R*K*Math.min(1,k),0,0,6.2832);g.fill()}
 g.lineWidth=2;g.strokeStyle=rgba('#000000',.45);g.beginPath();g.ellipse(p.x,p.y,R+1.5,(R+1.5)*K,0,0,6.2832);g.stroke();
 g.strokeStyle=rgba(S.c,.95*S.pl);g.beginPath();g.ellipse(p.x,p.y,R,R*K,0,0,6.2832);g.stroke();
 if(S.en){g.strokeStyle=rgba('#ff3b3b',.85*S.pl);g.lineWidth=1.4;g.setLineDash([10,6]);g.lineDashOffset=-performance.now()/40;g.beginPath();g.ellipse(p.x,p.y,R-3,Math.max(0,R-3)*K,0,0,6.2832);g.stroke();g.setLineDash([])}
 g.restore();g.globalAlpha=ga}
// rectangle partant de (x, y) dans la direction a : longueur len, largeur w (hitbox des rayons / lignes)
function fxTeleLine(x,y,a,len,w,k,col,o,fill){const S=fxTeleStyle(col,o,k,fill),c=Math.cos(a),s=Math.sin(a),h=w/2,cr=(f0,s0)=>P(x+c*f0-s*s0,y+s*f0+c*s0),poly4=(L)=>{const A=cr(0,-h),B=cr(L,-h),C=cr(L,h),D=cr(0,h);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B.x,B.y);g.lineTo(C.x,C.y);g.lineTo(D.x,D.y);g.closePath()};
 g.save();g.globalAlpha=1;g.fillStyle=rgba(S.c,S.fill);poly4(len);g.fill();if(k>0){g.fillStyle=rgba(S.c,.2);poly4(len*Math.min(1,k));g.fill()}
 poly4(len);g.lineWidth=3.5;g.strokeStyle=rgba('#000000',.4);g.stroke();g.lineWidth=2;g.strokeStyle=rgba(S.c,.95*S.pl);g.stroke();
 if(S.en){g.strokeStyle=rgba('#ff3b3b',.85*S.pl);g.lineWidth=1.4;g.setLineDash([10,6]);g.lineDashOffset=-performance.now()/40;poly4(len);g.stroke();g.setLineDash([])}g.restore()}
// cône (secteur) depuis (x, y) : rayon R, ouverture totale arc
function fxTeleCone(x,y,a,R,arc,k,col,o,fill){const S=fxTeleStyle(col,o,k,fill),path=r=>{const p0=P(x,y);g.beginPath();g.moveTo(p0.x,p0.y);for(let i=0;i<=16;i++){const b=a-arc/2+arc*i/16,q=P(x+Math.cos(b)*r,y+Math.sin(b)*r);g.lineTo(q.x,q.y)}g.closePath()};
 g.save();g.globalAlpha=1;g.fillStyle=rgba(S.c,S.fill);path(R);g.fill();if(k>0){g.fillStyle=rgba(S.c,.2);path(R*Math.min(1,k));g.fill()}
 path(R);g.lineWidth=3.5;g.strokeStyle=rgba('#000000',.4);g.stroke();g.lineWidth=2;g.strokeStyle=rgba(S.c,.95*S.pl);g.stroke();
 if(S.en){g.strokeStyle=rgba('#ff3b3b',.85*S.pl);g.lineWidth=1.4;g.setLineDash([10,6]);path(R);g.stroke();g.setLineDash([])}g.restore()}
// ---- palettes par nature / famille : a principale, b claire, c sombre, h cœur chaud, sm fumée, e famille d'impact (fxImpact)
const FXP={
 katon:{a:'#ff7a2a',b:'#ffd36a',c:'#c0301a',h:'#fff3c0',sm:'#4a3a36',e:'fire'},
 suiton:{a:'#3aa8ff',b:'#bfe6ff',c:'#1a5ab0',h:'#ffffff',sm:'#d8ecff',e:'water'},
 futon:{a:'#9ff0d8',b:'#e8fff8',c:'#3aa88a',h:'#ffffff',sm:'#e8fff8',e:'wind'},
 raiton:{a:'#ffe14a',b:'#e8f6ff',c:'#7fd0ff',h:'#ffffff',sm:'#c8d8ff',e:'lightning'},
 doton:{a:'#a07850',b:'#c8a070',c:'#5a4028',h:'#f0d8a8',sm:'#9a8268',e:'earth'},
 genjutsu:{a:'#e0304a',b:'#c080ff',c:'#5a1a7a',h:'#ffd0e0',sm:'#6a2a8a',e:'genjutsu'},
 iryo:{a:'#7fe07f',b:'#cfffcf',c:'#2a9a4a',h:'#ffffff',sm:'#cfffcf',e:'heal'},
 fuin:{a:'#e8c860',b:'#fff0b8',c:'#2a2a33',h:'#ffffff',sm:'#3a3a44',e:'seal'},
 chakra:{a:'#5ab8ff',b:'#cfe8ff',c:'#1a5ad0',h:'#ffffff',sm:'#cfe8ff',e:'chakra'},
 rasengan:{a:'#7fc8ff',b:'#ffffff',c:'#3a8aff',h:'#ffffff',sm:'#cfe8ff',e:'wind'},
 kage:{a:'#2a2a33',b:'#5a5a6a',c:'#0c0c10',h:'#8a8a9a',sm:'#101014',e:'dark'},
 mushi:{a:'#4a5a3a',b:'#8a9a6a',c:'#26302a',h:'#c8d0a0',sm:'#26302a',e:'dark'},
 hone:{a:'#f2efe6',b:'#ffffff',c:'#b8b0a0',h:'#ffffff',sm:'#d8d2c4',e:'earth'},
 suna:{a:'#d8b878',b:'#f0d8a0',c:'#a88a50',h:'#fff4d8',sm:'#c8a870',e:'sand'},
 mokuton:{a:'#8a6a3a',b:'#6aa83a',c:'#4a3220',h:'#d8f0a0',sm:'#8a7a58',e:'earth'},
 hyoton:{a:'#9fe0ff',b:'#ffffff',c:'#4a9ad0',h:'#ffffff',sm:'#e8f8ff',e:'ice'},
 yoton:{a:'#ff5a1a',b:'#ffb03a',c:'#5a1a0a',h:'#fff0a0',sm:'#3a2a24',e:'fire'},
 futton:{a:'#e8e8f0',b:'#ffffff',c:'#a0a8b8',h:'#ffffff',sm:'#e8eef4',e:'steam'},
 jiton:{a:'#3a3a44',b:'#8a8a9a',c:'#18181e',h:'#c8c8d8',sm:'#2a2a30',e:'sand'},
 bakuton:{a:'#ffb03a',b:'#fff4c0',c:'#c0401a',h:'#ffffff',sm:'#4a3a36',e:'fire'},
 shakuton:{a:'#ff8a3a',b:'#ffe8a0',c:'#c04a1a',h:'#ffffff',sm:'#5a4030',e:'fire'},
 ranton:{a:'#8ab8ff',b:'#e0f0ff',c:'#3a5ab0',h:'#ffffff',sm:'#a0b0d0',e:'lightning'},
 shoton:{a:'#c080ff',b:'#f0d8ff',c:'#6a3ab0',h:'#ffffff',sm:'#d8c8f0',e:'ice'},
 jinton:{a:'#f0f0ff',b:'#ffffff',c:'#a0a0c0',h:'#ffffff',sm:'#e0e0f0',e:'chakra'},
 kiminari:{a:'#8a3aff',b:'#d0a0ff',c:'#1a0a2a',h:'#ffffff',sm:'#2a1a3a',e:'lightning'},
 sakin:{a:'#e8c040',b:'#fff0a0',c:'#a07a10',h:'#ffffff',sm:'#c8a040',e:'sand'},
 kurama:{a:'#ff6a2a',b:'#ffb04a',c:'#ff2a1a',h:'#fff0c0',sm:'#5a2a1a',e:'fire'},
 sennin:{a:'#e8a020',b:'#8ad05a',c:'#5a3a10',h:'#fff0c0',sm:'#a08050',e:'chakra'},
 metal:{a:'#d8dde6',b:'#ffffff',c:'#8a929e',h:'#ffffff',sm:'#c8ccd4',e:'metal'},
 chi:{a:'#c0102a',b:'#ff5a6a',c:'#5a0010',h:'#ffd0d0',sm:'#5a0010',e:'blood'},
 taijutsu:{a:'#ffffff',b:'#fff4d8',c:'#c8c0b0',h:'#ffffff',sm:'#d8d0c0',e:'metal'},
};
// alias : clés vfx du catalogue → palette (les clés de kits inconnues prennent les couleurs de VP[vfx])
const FXAL={fire:'katon',peacock:'katon',fox:'kurama',water:'suiton',wind:'futon',rasenshuriken:'futon',lightning:'raiton',chidori:'raiton',kirin:'raiton',hiraishin:'raiton',
 earth:'doton',genjutsu:'genjutsu',tsukuyomi:'genjutsu',mind:'genjutsu',flower:'genjutsu',heal:'iryo',seal:'fuin',tag:'bakuton',shadow:'kage',bugs:'mushi',bone:'hone',
 sand:'suna',sandcoffin:'suna',leaf:'mokuton',sage:'sennin',gate:'iryo',jyuken:'chakra',byakugan:'chakra',kaiten:'chakra',hakke64:'chakra',black:'kiminari',susano:'chakra',
 kunai:'metal',shuriken:'metal',senbon:'metal',steel:'metal',chain:'fuin',claws:'taijutsu',tai:'taijutsu',gatsuga:'futon',smoke:'futton',ice:'hyoton',
 yo_lava:'yoton',ft_steam:'futton',ji_iron:'jiton',bt_blast:'bakuton',sk_heat:'shakuton',rt_storm:'ranton',so_cry:'shoton',jn_dust:'jinton',kn_black:'kiminari',gd_gold:'sakin',gold:'sakin',
 sj_wood:'mokuton',kr_gen:'genjutsu',ib_smoke:'futton',jg_sage:'sennin',ot_void:'jinton',yu_ice:'hyoton',km_paper:'taijutsu',ci_blood:'chi',silk:'hone',ak_bf:'kurama',sg_poison:'mushi',sg_pup:'metal'};
const FXPC={};
function fxPal(v){if(!v)return FXP.chakra;if(FXP[v])return FXP[v];if(FXAL[v])return FXP[FXAL[v]];if(FXPC[v])return FXPC[v];
 const vp=typeof VP!=='undefined'&&VP[v];if(!vp)return FXP.chakra;const p={a:fxHex(vp[0]),b:fxHex(vp[1]||vp[0]),c:fxHex(vp[2]||vp[1]||vp[0]),h:'#ffffff',sm:fxHex(vp[1]||vp[0]),e:'chakra'};return FXPC[v]=p}
// ---- effets analytiques : ajout (côté hôte ou local), un objet fx par effet
function fxE(o){if(!near(o.x,o.y))return null;o.sd=o.sd??(Math.random()*997|0);if(o.oi==null){const i=fxOI(o.u);if(i!=null)o.oi=i}delete o.u;o.t=o.t||.4;o.m=o.t;fx.push(o);return o}
// étincelles / gouttes / pétales qui jaillissent : n (Normal, ton jutsu), sp vitesse, a+arc (cône), z hauteur, up élan vertical, gr gravité, w épaisseur, len traînée, sh 'line'|'dot'|'petal'
const fxBurst=(x,y,col,o)=>fxE(Object.assign({fk:'burst',x,y,col,n:12,t:.45},o));
const fxSmoke=(x,y,o)=>fxE(Object.assign({fk:'smoke',x,y,col:'#d8d8dc',n:6,t:.9},o)); // r étalement, s taille d'une bouffée, rise montée, al opacité (≤ .35), dx/dy dérive
const fxDebris=(x,y,o)=>fxE(Object.assign({fk:'debris',x,y,col:'#8a6a48',c2:'#5a4028',n:8,t:1.1},o)); // éclats qui retombent et rebondissent
const fxRing=(x,y,o)=>fxE(Object.assign({fk:'ring',gd:1,x,y,r0:10,r1:80,col:'#ffffff',t:.4},o)); // onde au sol : r1 = rayon réel (hitbox)
const fxDecal=(x,y,kind,o)=>fxE(Object.assign({fk:'decal',gd:1,x,y,kind,r:40,t:4},o)); // trace au sol qui s'efface : scorch crack puddle ice burn seal sand leaf
const fxArc=(x,y,x2,y2,col,o)=>fxE(Object.assign({fk:'arc',x,y,x2,y2,col,t:.25},o)); // arc électrique entre deux points (z, z2 hauteurs)
const fxArcs=(x,y,r,col,o)=>fxE(Object.assign({fk:'arc',x,y,r,col,n:3,t:.25},o)); // arcs autour d'un point
const fxWind=(x,y,a,o)=>fxE(Object.assign({fk:'wind',x,y,a,len:160,w:60,n:8,col:'#e8fff8',t:.5},o)); // filets de vent (spin:1 = tourbillon)
const fxFlare=(x,y,col,o)=>fxE(Object.assign({fk:'flare',x,y,col,r:28,t:.2},o)); // éclat de lumière LOCAL (remplace tout flash plein écran)
const fxPillar=(x,y,col,o)=>fxE(Object.assign({fk:'pillar',x,y,col,h:220,w:26,t:.6},o)); // colonne de lumière
const fxEmbers=(x,y,r,col,o)=>fxE(Object.assign({fk:'embers',x,y,r,col,n:8,t:1.2},o)); // braises / bulles / spores qui montent d'une zone
const fxCharge=(u,col,o)=>fxE(Object.assign({fk:'charge',ui:units.indexOf(u),x:u.x,y:u.y,col,n:10,t:.6,u},o)); // anticipation : particules aspirées vers les mains (hd distance, z hauteur)
const fxGlyph=(x,y,col,o)=>fxE(Object.assign({fk:'glyph',gd:1,x,y,col,r:44,t:.8},o)); // cercle de sceau au sol (ui : suit une unité)
const fxLight=(x,y,r,col,o)=>{o=o||{};if(!near(x,y))return null;const f={light:1,x,y,r,col:fxHex(col),t:o.t||.3,m:o.t||.3,a:o.a??.45};const i=fxOI(o.u);if(i!=null)f.oi=i;fx.push(f);return f}; // lumière au sol (additive)
// ---- combinés : impact selon l'élément, préparation (cast), jutsu de rang S
function fxImpact(x,y,v,s=1,o={}){const C=fxPal(v),u=o.u,z=o.z??26,R=o.r||44*s,e=C.e,dec=o.dec!==0;
 fxFlare(x,y,C.a,{u,z,r:24*s,t:.2,c2:C.h});fxLight(x,y,90*s,C.a,{u,t:.3});if(o.ring!==0)fxRing(x,y,{u,r0:R*.2,r1:R,col:C.a,c2:C.h,t:.32,w:5*s});
 if(e==='fire'){fxBurst(x,y,C.a,{u,z,n:14*s,sp:280*s,c2:C.h,up:70,gr:40});fxSmoke(x,y,{u,col:C.sm,n:4*s,r:R*.5,s:12*s,t:1.1,al:.24});if(dec)fxDecal(x,y,'scorch',{u,r:R*.7,t:3.5})}
 else if(e==='water'){fxBurst(x,y,C.b,{u,z,n:16*s,sp:240*s,c2:'#ffffff',up:150,gr:420,w:2.4,len:.06});if(dec)fxDecal(x,y,'puddle',{u,r:R*.75,t:3})}
 else if(e==='wind'){fxWind(x,y,o.a??0,{u,len:R*2.2,w:R,n:7*s,t:.45,col:C.b,spin:1});fxBurst(x,y,C.b,{u,z,n:8*s,sp:340*s,gr:0,up:10,w:1.4,len:.2})}
 else if(e==='lightning'){fxArcs(x,y,R*.9,C.a,{u,z,n:4,t:.25});fxBurst(x,y,C.b,{u,z,n:12*s,sp:420*s,c2:'#ffffff',w:1.6,len:.14});if(dec)fxDecal(x,y,'burn',{u,r:R*.55,t:2.5})}
 else if(e==='earth'){fxDebris(x,y,{u,n:7*s,sp:180*s,col:C.a,c2:C.c,s:4*s});fxSmoke(x,y,{u,col:C.sm,n:5*s,r:R*.6,s:14*s,t:1,al:.26,rise:20});if(dec)fxDecal(x,y,'crack',{u,r:R*.85,t:4})}
 else if(e==='sand'){fxBurst(x,y,C.a,{u,z,n:14*s,sp:200*s,sh:'dot',w:2,gr:160,up:60});fxSmoke(x,y,{u,col:C.b,n:4*s,r:R*.6,s:14*s,t:.9,al:.22,rise:14});if(dec)fxDecal(x,y,'sand',{u,r:R*.7,t:3})}
 else if(e==='blood'){fxBurst(x,y,C.a,{u,z,n:12*s,sp:220*s,c2:C.b,up:140,gr:420,w:2.2,len:.06,add:0});if(dec)fxDecal(x,y,'puddle',{u,r:R*.6,t:3,col:C.c})}
 else if(e==='ice'){fxBurst(x,y,C.b,{u,z,n:12*s,sp:260*s,sh:'dot',w:2.4,gr:300,up:120});if(dec)fxDecal(x,y,'ice',{u,r:R*.7,t:3.5})}
 else if(e==='steam'){fxSmoke(x,y,{u,col:C.a,n:7*s,r:R*.6,s:16*s,t:1.1,al:.3,rise:50})}
 else if(e==='genjutsu'){fxBurst(x,y,C.a,{u,z:z+8,n:10*s,sp:110*s,gr:-30,up:40,w:3,sh:'petal',c2:C.b})}
 else if(e==='heal'){fxBurst(x,y,C.a,{u,z,n:8*s,sp:70*s,gr:-70,up:50,w:2,sh:'dot'})}
 else if(e==='seal'){if(dec)fxDecal(x,y,'seal',{u,r:R*.8,t:1.6,col:C.a});fxBurst(x,y,C.a,{u,z,n:8*s,sp:200*s,w:1.6})}
 else if(e==='dark'){fxSmoke(x,y,{u,col:C.c,n:5*s,r:R*.5,s:12*s,t:.8,al:.3,rise:16})}
 else fxBurst(x,y,C.a,{u,z,n:12*s,sp:300*s,c2:C.h})}
// préparation : particules aspirées vers les mains (+ cercle au sol pour un sceau, souffle à la bouche pour le Katon : o.mouth)
function fxCast(u,v,dur=.6,o={}){const C=fxPal(v);fxCharge(u,C.a,Object.assign({t:dur,c2:C.h,n:10,z:o.mouth?52:34,hd:o.mouth?10:16},o));if(o.glyph)fxGlyph(u.x,u.y,C.a,{ui:units.indexOf(u),t:dur+.2,u})}
// lancement d'un jutsu de rang S (moteur, use()) : lumière locale autour du lanceur + fenêtre de secousse (3 s) si c'est moi ou tout près
function fxSCast(u,ab){if(!near(u.x,u.y))return;const own=u===player,d=player?Math.hypot(u.x-player.x,u.y-player.y):1e9,C=fxPal(ab&&ab.vfx),col=ab&&ab.vfx&&ab.vfx!=='chakra'?C.a:(u.ch.look.weapon.col||C.a);
 if(own||d<520){FXF.shW=Math.max(FXF.shW,3);shake=Math.max(shake,own?.26:.12)}
 fxFlare(u.x,u.y,col,{u,z:40,r:54,t:.32});fxRing(u.x,u.y,{u,r0:16,r1:120,col,t:.5,w:6});fxLight(u.x,u.y,200,col,{u,t:.6,a:.5});fxPillar(u.x,u.y,col,{u,h:200,w:34,t:.55,al:.45})}
// explosion d'une zone / d'un projectile du moteur (cercle déjà dessiné au bon rayon) : lumière + trace au sol de l'élément
function fxDeto(x,y,r,v,u){if(!near(x,y))return;const C=fxPal(v),e=C.e,s=clamp(r/80,.6,1.8);fxFlare(x,y,C.a,{u,z:30,r:22*s,t:.22,c2:C.h,al:.75});fxLight(x,y,r*1.2,C.a,{u,t:.35,a:.35});
 const d={fire:'scorch',lightning:'burn',earth:'crack',water:'puddle',ice:'ice',sand:'sand',seal:'seal'}[e];if(d)fxDecal(x,y,d,{u,r:r*.75,t:3.2,col:C.a});
 if(e==='earth')fxDebris(x,y,{u,n:6*s,sp:170*s,col:C.a,c2:C.c,s:4*s});else if(e==='fire')fxSmoke(x,y,{u,col:C.sm,n:4*s,r:r*.5,s:13*s,t:1.1,al:.22});else if(e==='water')fxBurst(x,y,C.b,{u,n:12*s,sp:220*s,up:150,gr:420,w:2.2,len:.06});else if(e==='lightning')fxArcs(x,y,r*.8,C.a,{u,n:3,t:.22})}
// ---- dessin des effets analytiques (FXK[fk](f, k, e) : k temps restant 1→0, e = 1-k). gd:1 = au sol, sous les ninjas (fxGroundPass)
const FXK={},FXDEC_MAX=36;
FXK.burst=(f,k,e)=>{const n=fxNB(f.n,f);if(!n)return;const A=fxA(f)*(f.al??1),m=f.m,sp=f.sp||260,z0=f.z??24,up=f.up??50,gr=f.gr??110,w=f.w||2,c1=f.col,c2=f.c2||'#ffffff',arc=f.arc??6.3,a0=f.a??0,L=f.len??.1,sh=f.sh||'line';
 g.save();g.globalCompositeOperation=f.add===0?'source-over':'lighter';g.lineCap='round';
 for(let i=0;i<n;i++){const r1=fxH(f.sd,i,1),r2=fxH(f.sd,i,2),r3=fxH(f.sd,i,3),life=.5+.5*r3,ee=e/life;if(ee>=1)continue;
  const an=arc>=6.28?r1*6.2832:a0+(r1-.5)*arc,v=sp*(.35+.65*r2),ca=Math.cos(an),sa=Math.sin(an),D=t=>v*m*life*.5*(1-(1-t)*(1-t)),Z=t=>Math.max(1,z0+up*r2*t*2-gr*t*t);
  const q1=P(f.x+ca*D(ee),f.y+sa*D(ee),Z(ee));g.globalAlpha=A*(1-ee)*(ee<.08?ee/.08+.2:1);
  if(sh==='line'){const e0=Math.max(0,ee-L-.06*(1-ee)),q0=P(f.x+ca*D(e0),f.y+sa*D(e0),Z(e0));g.strokeStyle=ee<.25?c2:c1;g.lineWidth=Math.max(.8,w*q1.s*(1-ee*.5));g.beginPath();g.moveTo(q0.x,q0.y);g.lineTo(q1.x,q1.y);g.stroke()}
  else if(sh==='petal'){g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(q1.x,q1.y,w*1.8*q1.s,w*.8*q1.s,r1*6+ee*5,0,6.2832);g.fill()}
  else{g.fillStyle=ee<.2?c2:c1;g.beginPath();g.arc(q1.x,q1.y,Math.max(.8,w*q1.s*(1-ee*.4)),0,6.2832);g.fill()}}
 g.restore()};
FXK.smoke=(f,k,e)=>{const n=fxNB(f.n,f);if(!n)return;const A=fxA(f)*Math.min(.45,f.al??.3),spr=fxSpr(f.col||'#d8d8dc',2),R0=f.s||14,rr=f.r||24,rise=f.rise??36;
 for(let i=0;i<n;i++){const r1=fxH(f.sd,i,1),r2=fxH(f.sd,i,2),r3=fxH(f.sd,i,3),dl=r3*.25,ee=(e-dl)/(1-dl);if(ee<=0||ee>=1)continue;
  const an=r1*6.2832,d=rr*(.25+.75*r2)*(.5+.5*Math.sqrt(ee)),q=P(f.x+Math.cos(an)*d+(f.dx||0)*ee,f.y+Math.sin(an)*d*.8+(f.dy||0)*ee,(f.z??10)+rise*ee*(.6+.8*r3)),R=R0*(.6+.6*r2)*(1+1.4*ee)*q.s;
  g.globalAlpha=A*Math.min(1,ee*5)*(1-ee);g.drawImage(spr,q.x-R,q.y-R,R*2,R*2)}};
FXK.debris=(f,k,e)=>{const n=fxNB(f.n,f);if(!n)return;const A=fxA(f),T=f.m*e,cols=[f.col,f.c2||f.col],sz=f.s||4,sp=f.sp||200,G=900;
 for(let i=0;i<n;i++){const r1=fxH(f.sd,i,1),r2=fxH(f.sd,i,2),r3=fxH(f.sd,i,3),an=r1*6.2832,v=sp*(.3+.7*r2),vz=160+240*r3,T1=2*vz/G;let z,dd;
  if(T<T1){z=vz*T-G*T*T/2;dd=v*T}else{const t2=T-T1,v2=vz*.28;z=Math.max(0,v2*t2-G*t2*t2/2);dd=v*T1+v*.3*Math.min(t2,2*v2/G)}
  const q=P(f.x+Math.cos(an)*dd,f.y+Math.sin(an)*dd,z+2),s=sz*(.6+.8*r3)*q.s;g.globalAlpha=A*(e>.7?(1-e)/.3:1);g.fillStyle=cols[i%2];
  g.save();g.translate(q.x,q.y);g.rotate(r2*9+(T<T1?T*14*(r1-.5):T1*14*(r1-.5)));g.beginPath();g.moveTo(-s,-s*.6);g.lineTo(s*.2,-s);g.lineTo(s,-s*.2);g.lineTo(s*.6,s*.8);g.lineTo(-s*.7,s*.6);g.closePath();g.fill();g.restore()}};
FXK.ring=(f,k,e)=>{const A=fxA(f)*(f.al??.85),r0=f.r0??10,ee=1-Math.pow(1-e,3),r=r0+((f.r1??80)-r0)*ee,p=P(f.x,f.y,f.z||0),R=r*p.s;if(!(R>0))return;
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=A*Math.pow(1-e,1.4);g.strokeStyle=f.col;g.lineWidth=Math.max(1,(f.w||6)*(1-e*.7)*p.s);g.beginPath();g.ellipse(p.x,p.y,R,R*K,0,0,6.2832);g.stroke();
 if(e<.5){g.globalAlpha=A*(1-e*2)*.8;g.strokeStyle=f.c2||'#ffffff';g.lineWidth=Math.max(.8,1.6*p.s);g.beginPath();g.ellipse(p.x,p.y,R*.94,R*.94*K,0,0,6.2832);g.stroke()}
 if(f.fill){g.globalAlpha=A*.3*(1-e);g.drawImage(fxSpr(f.col,0),p.x-R,p.y-R*K,R*2,R*2*K)}g.restore()};
FXK.decal=(f,k,e)=>{const kk=fxK(f);if(kk<.25||++FXF.dec>FXDEC_MAX*Math.min(1,kk/.8+.15))return;const lite=kk<.5;/* foule / ennemi : version simple */const env=Math.min(1,e*f.m/.12)*(e>.6?(1-e)/.4:1),A=fxA(f)*Math.min(.6,f.al??.5)*env;if(A<=.01)return;const p=P(f.x,f.y),R=f.r*p.s;if(!(R>1))return;
 const sd=f.sd,now=performance.now()/1000;g.save();
 switch(f.kind){
  case'scorch':{fxSoftS(p.x,p.y,R,'#140a06',A*1.2,R*K);if(lite)break;for(let i=0;i<5;i++){const a=fxH(sd,i,1)*6.28,d=R*(.3+.5*fxH(sd,i,2));fxSoftS(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*K,R*.35,'#1a0e08',A*.9,R*.35*K)}
   if(e<.45)for(let i=0;i<6;i++){const a=fxH(sd,i,3)*6.28,d=R*.7*fxH(sd,i,4);fxGlowS(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*K,3.5*p.s,'#ff7a2a',A*1.6*(1-e/.45)*(.6+.4*Math.sin(now*9+i)))}break}
  case'crack':{fxSoftS(p.x,p.y,R*.45,'#2a1a0e',A*.9,R*.45*K);if(lite)break;g.strokeStyle=rgba('#22160c',Math.min(1,A*1.6));g.lineWidth=Math.max(1,2*p.s);g.lineCap='round';const nb=5+(sd%3);
   for(let i=0;i<nb;i++){let a=i/nb*6.28+fxH(sd,i,1)*.6,x=p.x,y=p.y;g.beginPath();g.moveTo(x,y);for(let j=1;j<=3;j++){a+=(fxH(sd,i,j+1)-.5)*.9;const l=R*(.25+.15*fxH(sd,i,j+4));x+=Math.cos(a)*l;y+=Math.sin(a)*l*K;g.lineTo(x,y)}g.stroke()}break}
  case'puddle':{const wc=f.col?fxHex(f.col):'#2a88e0';fxSoftS(p.x,p.y,R,wc,A*.75,R*K);g.strokeStyle=rgba(f.col?wc:'#bfe6ff',A*.9);g.lineWidth=Math.max(1,1.4*p.s);g.beginPath();g.ellipse(p.x,p.y,R*.9,R*.9*K,0,0,6.2832);g.stroke();
   if(!lite)for(let i=0;i<2;i++){const q=(now*.7+i*.5+sd*.01)%1;g.strokeStyle=rgba('#e8f6ff',A*(1-q)*.8);g.beginPath();g.ellipse(p.x,p.y,R*.8*q,R*.8*q*K,0,0,6.2832);g.stroke()}break}
  case'ice':{fxSoftS(p.x,p.y,R,'#bfe8ff',A*.7,R*K);g.strokeStyle=rgba('#ffffff',A*1.2);g.fillStyle=rgba('#dff4ff',A*.9);g.lineWidth=1;
   for(let i=0;i<7;i++){const a=fxH(sd,i,1)*6.28,d=R*.65*fxH(sd,i,2),x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d*K,h=(5+7*fxH(sd,i,3))*p.s;g.beginPath();g.moveTo(x-3*p.s,y);g.lineTo(x,y-h);g.lineTo(x+3*p.s,y);g.closePath();g.fill();g.stroke()}break}
  case'burn':{fxSoftS(p.x,p.y,R,'#10101a',A,R*K);if(e<.5&&!lite){const s2=sd+Math.floor(now*16);for(let i=0;i<3;i++){const a=fxH(s2,i,1)*6.28,l=R*(.5+.5*fxH(s2,i,2));fxBoltS(p.x,p.y,p.x+Math.cos(a)*l,p.y+Math.sin(a)*l*K,'#9fdcff',1.2,s2+i,.3,5)}}break}
  case'seal':{const c=fxHex(f.col||'#e8c860');g.globalCompositeOperation='lighter';g.strokeStyle=rgba(c,A*1.4);g.lineWidth=Math.max(1,1.6*p.s);for(const m of[1,.62]){g.beginPath();g.ellipse(p.x,p.y,R*m,R*m*K,0,0,6.2832);g.stroke()}
   g.fillStyle=rgba(c,A*1.4);for(let i=0;i<8;i++){const a=i*.785+now*.6;g.fillRect(p.x+Math.cos(a)*R*.81-1.5*p.s,p.y+Math.sin(a)*R*.81*K-3*p.s,3*p.s,6*p.s)}break}
  case'sand':{fxSoftS(p.x,p.y,R,'#c8a060',A*.8,R*K);g.strokeStyle=rgba('#f0d8a0',A);g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.ellipse(p.x,p.y,R*(.4+i*.22),R*(.4+i*.22)*K,0,3.4+i*.3,5.6+i*.3);g.stroke()}break}
  case'leaf':{for(let i=0;i<6;i++){const a=fxH(sd,i,1)*6.28,d=R*fxH(sd,i,2),x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d*K;g.fillStyle=rgba(i%2?'#5aa83a':'#8ad05a',A*1.4);g.beginPath();g.ellipse(x,y,4*p.s,1.8*p.s,a,0,6.2832);g.fill()}break}
  default:fxSoftS(p.x,p.y,R,fxHex(f.col||'#202020'),A,R*K)}
 g.restore()};
FXK.arc=(f,k,e)=>{const A=fxA(f)*(1-e*e),seed=f.sd+Math.floor(performance.now()/55);g.save();g.globalAlpha=A;
 if(f.x2!=null){const a=P(f.x,f.y,f.z??30),b=P(f.x2,f.y2,f.z2??f.z??30);fxBoltS(a.x,a.y,b.x,b.y,f.col,(f.w||2)*a.s,seed,f.j??.16)}
 else{const n=fxNB(f.n||3,f),c=P(f.x,f.y,f.z??30);for(let i=0;i<n;i++){const an=fxH(seed,i,1)*6.2832,R=(f.r||40)*(.5+.5*fxH(seed,i,2))*c.s;fxBoltS(c.x,c.y,c.x+Math.cos(an)*R,c.y+Math.sin(an)*R*.7,f.col,(f.w||1.6)*c.s,seed+i*7,.3,6)}}
 g.restore()};
FXK.wind=(f,k,e)=>{const n=fxNB(f.n||8,f);if(!n)return;const A=fxA(f)*(f.al??.6),ca=Math.cos(f.a||0),sa=Math.sin(f.a||0);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=f.col;g.lineCap='round';
 for(let i=0;i<n;i++){const r1=fxH(f.sd,i,1),r2=fxH(f.sd,i,2),ph=Math.min(1,e*1.2+r2*.25);if(ph>=1)continue;g.globalAlpha=A*Math.sin(Math.PI*ph);
  if(f.spin){const R=(f.w||60)*(.4+.6*r1)*(.6+.6*e),q=P(f.x,f.y,(f.z??14)+r2*30),a0=r1*6.28+e*7;g.lineWidth=Math.max(1,1.8*q.s);g.beginPath();g.ellipse(q.x,q.y,R*q.s,R*q.s*K,0,a0,a0+1.4);g.stroke();continue}
  const off=(r1-.5)*(f.w||60),s0=-(f.len||160)/2+ph*(f.len||160)*.7,s1=s0+(f.len||160)*.35,x0=f.x+ca*s0-sa*off,y0=f.y+sa*s0+ca*off,x1=f.x+ca*s1-sa*off,y1=f.y+sa*s1+ca*off,z=(f.z??18)+r2*26,q0=P(x0,y0,z),q1=P(x1,y1,z);
  g.lineWidth=Math.max(1,1.6*q1.s);g.beginPath();g.moveTo(q0.x,q0.y);g.quadraticCurveTo((q0.x+q1.x)/2-sa*8*q1.s,(q0.y+q1.y)/2-6*q1.s,q1.x,q1.y);g.stroke()}
 g.restore()};
FXK.flare=(f,k,e)=>{if(++FXF.fl>10)return;const A=fxA(f)*(f.al??1),q=P(f.x,f.y,f.z??26),R=(f.r||28)*q.s*(.7+.5*Math.sqrt(e)),a=A*(1-e);if(!(a>0))return;
 fxGlowS(q.x,q.y,R*1.5,f.col,a*.55);fxGlowS(q.x,q.y,R*.45,'#ffffff',a*.35); // modéré : ne délave jamais un corps
 if(f.star!==0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.6;g.strokeStyle=f.c2||'#ffffff';g.lineCap='round';g.lineWidth=Math.max(1,1.6*q.s*(1-e));const L=R*1.6*(1-e*.4),rot=f.rot??((f.sd%7)*.45);
  for(let i=0;i<2;i++){const an=rot+i*1.5708;g.beginPath();g.moveTo(q.x-Math.cos(an)*L,q.y-Math.sin(an)*L*.6);g.lineTo(q.x+Math.cos(an)*L,q.y+Math.sin(an)*L*.6);g.stroke()}g.restore()}};
FXK.pillar=(f,k,e)=>{const A=fxA(f)*(f.al??.6)*(e<.15?e/.15:(1-e)/.85),q=P(f.x,f.y,0),h=(f.h||220)*q.s,w=(f.w||26)*q.s*(1-e*.5);if(!(A>0)||!(h>0))return;const c=fxHex(f.col);
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=A;const gr=g.createLinearGradient(0,q.y-h,0,q.y);gr.addColorStop(0,rgba(c,0));gr.addColorStop(.7,rgba(c,.5));gr.addColorStop(1,'rgba(255,255,255,.75)');g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-h/2,w,h/2,0,0,6.2832);g.fill();g.restore();fxGlowS(q.x,q.y,w*2.4,c,A*.7,w*2.4*K,0)};
FXK.embers=(f,k,e)=>{const n=fxNB(f.n,f);if(!n)return;const A=fxA(f)*(f.al??.9),T=f.m*e;g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const r1=fxH(f.sd,i,1),r2=fxH(f.sd,i,2),r3=fxH(f.sd,i,3),ph=(T*(.6+r3*.6)+r1)%1,an=r2*6.28,d=(f.r||40)*Math.sqrt(r1),q=P(f.x+Math.cos(an)*d+Math.sin(T*3+i)*4,f.y+Math.sin(an)*d*.9,4+ph*(f.h||70));
  g.globalAlpha=A*Math.sin(Math.PI*ph)*Math.min(1,k*3);g.fillStyle=i%3?f.col:(f.c2||'#ffffff');g.beginPath();g.arc(q.x,q.y,Math.max(.8,(f.w||1.8)*q.s),0,6.2832);g.fill()}g.restore()};
FXK.charge=(f,k,e)=>{const u=f.ui!=null?units[f.ui]:null;if(f.ui!=null&&(!u||u.dead))return;const A=fxA(f);let cx=f.x,cy=f.y;if(u){const d=f.hd??16;cx=u.x+Math.cos(u.aim)*d;cy=u.y+Math.sin(u.aim)*d}
 const c=P(cx,cy,f.z??34),n=fxNB(f.n||10,f),R=(f.r||46)*c.s,T=f.m*e,fi=Math.min(1,e*6)*Math.min(1,k*8);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 for(let i=0;i<n;i++){const r1=fxH(f.sd,i,1),r2=fxH(f.sd,i,2),ph=(T*(1.5+r2)+r1)%1,an=r1*6.2832+ph*1.4,rr=R*(1-ph),x=c.x+Math.cos(an)*rr,y=c.y+Math.sin(an)*rr*.75,x0=c.x+Math.cos(an-.25)*rr*1.2,y0=c.y+Math.sin(an-.25)*rr*1.2*.75;
  g.globalAlpha=A*Math.sin(Math.PI*ph)*.9*fi;g.strokeStyle=i%3?f.col:(f.c2||'#ffffff');g.lineWidth=Math.max(1,1.8*c.s);g.beginPath();g.moveTo(x0,y0);g.lineTo(x,y);g.stroke()}
 g.restore();fxGlowS(c.x,c.y,(8+16*e)*c.s,f.col,A*.75*fi)};
FXK.glyph=(f,k,e)=>{const u=f.ui!=null?units[f.ui]:null;if(f.ui!=null&&(!u||u.dead))return;const x=u?u.x:f.x,y=u?u.y:f.y,p=P(x,y),R=f.r*p.s*(.85+.15*Math.min(1,e*5)),A=fxA(f)*(f.al??.7)*Math.min(1,e*6)*Math.min(1,k*4),c=fxHex(f.col),t=performance.now()/1000;if(!(R>0))return;
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=A;g.strokeStyle=c;g.lineWidth=Math.max(1,1.5*p.s);g.beginPath();g.ellipse(p.x,p.y,R,R*K,0,0,6.2832);g.stroke();g.globalAlpha=A*.7;g.beginPath();g.ellipse(p.x,p.y,R*.7,R*.7*K,0,0,6.2832);g.stroke();
 g.globalAlpha=A;g.fillStyle=c;for(let i=0;i<6;i++){const a=i*1.047+t*1.2;g.fillRect(p.x+Math.cos(a)*R*.85-1.5*p.s,p.y+Math.sin(a)*R*.85*K-2.5*p.s,3*p.s,5*p.s)}g.restore();fxGlowS(p.x,p.y,R*.9,c,A*.35,R*.9*K,0)};
// passe au sol (avant les ninjas et les télégraphes) ; les autres effets FXK passent avec les particules (drawPart)
function fxGroundPass(){for(const f of fx){if(!f.gd||!f.fk||!near(f.x,f.y))continue;const D=FXK[f.fk];if(D){const k=f.t/f.m;D(f,k,1-k)}}g.globalAlpha=1}
// budget : particules du moteur (avec vx) au-delà du plafond → les plus anciennes partent ; traces au sol ≤ 48
function fxCull(){const c=FXF.crowd,cap=Math.round(fxLvl().b*.55*(c*c));let n=0,d=0;for(const f of fx){if(f.vx!==undefined)n++;else if(f.fk==='decal')d++}if(n<=cap&&d<=48)return;let x=n-cap,y=d-48;
 fx=fx.filter(f=>{if(x>0&&f.vx!==undefined){x--;return false}if(y>0&&f.fk==='decal'){y--;return false}return true})}
// garde-fou : un effet de kit qui remplit tout l'écran d'une couleur unie (flash) est redessiné en éclat local à sa position
const FXTELE=new Set(); // noms de jfx qui sont des télégraphes (jamais atténués) ; un jx({…, tele:1}) aussi
function fxNoFull(fn){return function(f){const fr=g.fillRect;let used=false;g.fillRect=function(x,y,w,h){if(x<=0&&y<=0&&w>=W&&h>=H&&typeof this.fillStyle==='string'){if(!used&&f&&f.x!=null){used=true;const q=P(f.x,f.y,30),k=f.m?f.t/f.m:1;g.save();g.setTransform(RS,0,0,RS,0,0);fxGlowS(q.x,q.y,160*q.s,fxHex(this.fillStyle),.8*k);g.restore()}return}return fr.apply(this,arguments)};
 try{return fn.apply(this,arguments)}finally{delete g.fillRect}}}
AFTER.push(()=>{for(const R of[JFXD,AUXD])for(const k in R){const f=R[k];if(typeof f==='function'&&/fillRect\(0,0,W,H\)/.test(String(f)))R[k]=fxNoFull(f)}});
