// ---------- Ninjas en 3D (Three.js) : même style que le 2D (chibi, gros contour sombre, aplats de couleur), avec de vraies articulations ----------
// Tous les ninjas visibles sont rendus en une passe dans un atlas (une case par ninja), puis chaque case est collée dans la scène 2D
// au bon moment de l'ordre d'affichage. Sans WebGL (ou option coupée), le dessin 2D d'origine prend le relais.
const N3={ok:false,tried:false,on:true,recs:new Map(),tile:new Map(),req:new Set(),frame:0,last:0};
const TWU=120,THU=134,FOOT=12,TCOLS=8,TROWS=6,EL3=.36; // case : 120 × 134 unités (pieds à 12 unités du bas), caméra inclinée de 20°
let PXU=1.9,TPW=228,TPH=255; // pixels par unité (selon la finesse de l'écran)
// os du squelette : [nom, parent, position de repos relative au parent]
const BONES=[['root',null,[0,0,0]],['hips','root',[0,20.5,0]],['spine','hips',[0,4,0]],['chest','spine',[0,9,0]],['neck','chest',[0,8,0]],['head','neck',[0,3.5,0]],
 ['hair','head',[0,10,-9]],['band','head',[0,9,-11.5]],['armL','chest',[10,5.5,0]],['foreL','armL',[0,-8.5,0]],['handL','foreL',[0,-8,0]],['armR','chest',[-10,5.5,0]],['foreR','armR',[0,-8.5,0]],['handR','foreR',[0,-8,0]],
 ['cape','chest',[0,6,-7.6]],['cape2','cape',[0,-13,0]],['skirt','hips',[0,0,0]],['thighL','hips',[4.4,-.5,0]],['shinL','thighL',[0,-9.5,0]],['footL','shinL',[0,-9,0]],['thighR','hips',[-4.4,-.5,0]],['shinR','thighR',[0,-9.5,0]],['footR','shinR',[0,-9,0]]];
const BI=Object.fromEntries(BONES.map((b,i)=>[b[0],i]));
// couvre-chefs qui cachent le bandeau de tête (et aplatissent les mèches dressées) ; façons de porter le bandeau sur la tête
const HATS=new Set(['kage','paille','kabuto','bandana']),BAND_HEAD=new Set(['front','barre','cornes','oblique','tete']);
// vitesse de mise en place de chaque os (plus haut = plus sec)
const BRATE={root:20,hips:20,spine:20,chest:22,neck:22,head:20,hair:7,band:6,armL:26,foreL:26,handL:26,armR:26,foreR:26,handR:26,cape:6,cape2:5,skirt:12,thighL:24,shinL:24,footL:24,thighR:24,shinR:24,footR:24};
// cosmétiques ajoutés plus tard, décrits sur un corps plus long et plus fin (marqués « raw » dans add) : ramenés sur ce corps, os par os
// p : facteurs de position [x, y, z] ; s : facteurs de taille [épaisseur, longueur] ; un anneau ou un disque couché grandit d'un bloc (épaisseur)
const R2O=(()=>{const o={},u=(p,s)=>({p:Array.isArray(p)?p:[p,p,p],s:Array.isArray(s)?s:[s,s]});o.chest=o.cape=u(1.25,1.25);o.cape2=u([1.25,.94,1.25],[1.25,.94]);o.spine=u([1.3,1.05,1.3],[1.3,1.1]);
 o.hips=u([1.4,1,1.4],[1.4,1]);o.skirt=u([1.19,.63,1.19],[1.19,.63]);for(const s of['L','R']){o['thigh'+s]=u([1.02,.565,1.02],[1.02,.565]);o['shin'+s]=u([1.07,.55,1.07],[1.07,.55]);
 o['arm'+s]=u([1.08,.685,1.08],[1.08,.685]);o['fore'+s]=u([1.09,.77,1.09],[1.09,.77]);o['hand'+s]=u(1.16,1.16)}return o})();
// taille (bh) et carrure (bw) : longueurs des os et épaisseur des pièces (purement visuel : la zone de coups ne change pas)
const BYS=new Set(['hips','spine','chest','neck','foreL','handL','foreR','handR','shinL','footL','shinR','footR','cape2']);
function boneOffs(L){const bh=L.bh||1,bw=L.bw||1;return BONES.map(([n,p,o])=>{const v=o.slice();if(BYS.has(n))v[1]*=bh;if(n==='armL'||n==='armR'){v[0]*=bw;v[1]*=bh}
 if(n==='thighL'||n==='thighR')v[0]*=(1+bw)/2;if(n==='cape'){v[2]*=bw;v[1]*=bh}return v})}
function boneScale(L){const bh=L.bh||1,bw=L.bw||1,tw=(1+bw)/2;if(bh===1&&bw===1)return null;const D={};
 for(const b of['hips','spine','chest','skirt','cape','cape2'])D[b]=[bw,bh,(1+bw)/2];for(const s of['L','R']){for(const b of['arm','fore','thigh','shin'])D[b+s]=[tw,bh,tw];D['foot'+s]=[tw,1,tw]}return D}
function init3D(){if(N3.tried)return N3.ok;N3.tried=true;try{
 if(typeof THREE==='undefined'||OPT&&OPT.p3d===false)return false;
 let cv=document.createElement('canvas'),r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
 // rendu logiciel (pas de carte graphique) : sans anticrénelage et un peu moins fin, pour rester fluide
 {const gl=r.getContext(),ex=gl.getExtension('WEBGL_debug_renderer_info'),nm=ex?String(gl.getParameter(ex.UNMASKED_RENDERER_WEBGL)):'';N3.soft=/SwiftShader|llvmpipe|Software/i.test(nm);
  if(N3.soft){r.dispose();cv=document.createElement('canvas');r=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:true})}}
 PXU=(N3.soft?1.35:1.9)*Math.min(1.4,Math.max(1,typeof RS==='number'?RS:1));TPW=Math.round(TWU*PXU);TPH=Math.round(THU*PXU);
 r.setPixelRatio(1);r.setClearColor(0x000000,0);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x6a5a4a,1.35));const dl=new THREE.DirectionalLight(0xffffff,2.1);dl.position.set(-.6,1,.8);sc.add(dl);
 const cam=new THREE.OrthographicCamera(0,2*TWU,THU,0,1,3000);cam.position.set(0,0,0);cam.up.set(0,1,0);cam.lookAt(0,-Math.sin(EL3),-Math.cos(EL3));cam.updateMatrixWorld();
 const right=new THREE.Vector3(1,0,0),up=new THREE.Vector3(0,Math.cos(EL3),-Math.sin(EL3)),fwd=new THREE.Vector3(0,-Math.sin(EL3),-Math.cos(EL3));
 const gm=new THREE.DataTexture(new Uint8Array([120,120,120,255,190,190,190,255,255,255,255,255]),3,1,THREE.RGBAFormat);gm.minFilter=gm.magFilter=THREE.NearestFilter;gm.needsUpdate=true;
 const outline=new THREE.ShaderMaterial({uniforms:{w:{value:1.05},col:{value:new THREE.Color(0x140c08)}},side:THREE.BackSide,
  vertexShader:'#include <common>\n#include <skinning_pars_vertex>\nuniform float w;\nvoid main(){\n#include <skinbase_vertex>\n#include <beginnormal_vertex>\n#include <skinnormal_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\ntransformed+=normalize(objectNormal)*w;\n#include <project_vertex>\n}',
  fragmentShader:'uniform vec3 col;void main(){gl_FragColor=vec4(col,1.0);}'});
 Object.assign(N3,{ok:true,r,cv,sc,cam,right,up,fwd,gm,outline,faceTex:new Map(),symTex:new Map(),geo:new Map(),faceGeo:new THREE.SphereGeometry(12.75,20,14,Math.PI/2-1.05,2.1,Math.PI/2-.8,1.6),symGeo:new THREE.PlaneGeometry(7.4,4.2),cols:0,rows:0,small:0});atlasSize(2);
 // l'ordre d'affichage : un projet Three.js ne reçoit pas les ombres portées (ombre ovale du 2D conservée)
 return true}catch(e){console.warn('3D indisponible, dessin 2D',e);N3.ok=false;return false}}
// ----- fabrication du modèle (géométrie fusionnée, un os par pièce : pièces rigides, rendu en 2 appels par ninja)
const col3=h=>new THREE.Color(h);
function lookKey(u){const L=u.ch.look;return JSON.stringify([L,u.ch.look.weapon&&u.ch.look.weapon.k])}
// géométrie fusionnée partagée par apparence (réapparition, retour à l'écran, clones : plus de reconstruction)
function buildNinja3D(u){const L=u.ch.look,h=L.head,W=L.weapon||{},k=W.k||'fist',T=THREE,key=lookKey(u),OFF=boneOffs(L);let G=N3.geo.get(key);
 if(!G){const P=[],N=[],C=[],SI=[],SW=[];const rest={},DS=boneScale(L),DM={};
 BONES.forEach(([n,p],i)=>{const v=new T.Vector3(...OFF[i]);if(p)v.add(rest[p]);rest[n]=v});
 if(DS)for(const b in DS){const r=rest[b];DM[b]=new T.Matrix4().makeTranslation(r.x,r.y,r.z).multiply(new T.Matrix4().makeScale(...DS[b])).multiply(new T.Matrix4().makeTranslation(-r.x,-r.y,-r.z))}
 const M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),S=new T.Vector3(),V=new T.Vector3();
 // ajoute une pièce : g géométrie, bone os, c couleur, [x,y,z] position relative à l'os au repos, [rx,ry,rz], [sx,sy,sz] ; raw : pièce décrite sur le corps long (ramenée par R2O)
 const add=(g,bone,c,pos=[0,0,0],rot=[0,0,0],scl=[1,1,1],raw)=>{const gg=g.index?g.toNonIndexed():g;if(rot.isQuaternion)Q.copy(rot);else{E.set(...rot);Q.setFromEuler(E)}
  const kk=raw&&R2O[bone];if(kk){const fl=rot.isQuaternion||Math.abs(rot[0])>.3||Math.abs(rot[2])>.3,a=kk.s[0],b=fl?a:kk.s[1];pos=pos.map((x,i)=>x*kk.p[i]);scl=[scl[0]*a,scl[1]*b,scl[2]*a]}
  V.set(...pos).add(rest[bone]);S.set(...scl);M.compose(V,Q,S);if(DM[bone])M.premultiply(DM[bone]);gg.applyMatrix4(M);
  const a=gg.attributes.position,nn=gg.attributes.normal,cc=col3(c),bi=BI[bone];for(let i=0;i<a.count;i++){P.push(a.getX(i),a.getY(i),a.getZ(i));N.push(nn.getX(i),nn.getY(i),nn.getZ(i));C.push(cc.r,cc.g,cc.b);SI.push(bi,0,0,0);SW.push(1,0,0,0)}};
 const sph=(r,w=12,hh=9)=>new T.SphereGeometry(r,w,hh),sphp=(...a)=>new T.SphereGeometry(...a),cap=(r,l,s=8)=>new T.CapsuleGeometry(r,l,3,s),cyl=(a,b,hh,s=12,...o)=>new T.CylinderGeometry(a,b,hh,s,...o),box=(x,y,z)=>new T.BoxGeometry(x,y,z),cone=(r,hh,s=7)=>new T.ConeGeometry(r,hh,s),tor=(R,r,s=14)=>new T.TorusGeometry(R,r,6,s);
 const skin=h.skin,hair=h.hair,legs=L.legs||'#2a3550',torso=L.torso||'#f08a24',arm=L.arm||torso,boot=L.boot||'#222',band=h.band||'#1f3a6a',AA=L.armAcc||'';
 const fistC=AA==='gants'?'#3a3f50':AA==='gantelets'?'#7a828e':k==='fist'||k==='bigfist'?'#f0ebe0':skin,big=k==='bigfist';
 const qv=(a,b)=>new T.Quaternion().setFromUnitVectors(new T.Vector3(...a).normalize(),new T.Vector3(...b).normalize());
 const dk=(c,f)=>typeof shade==='function'?shade(c,f):c;
 // jambes et sandales (orteils visibles)
 for(const s of['L','R']){
  add(cap(3.3,5.6),'thigh'+s,legs,[0,-4.6,0]);add(cap(3,5),'shin'+s,legs,[0,-4.4,0]);add(cyl(3.1,3.3,2.2,10),'shin'+s,'#e8e0d0',[0,-7.8,0]);
  add(box(5.2,2.4,8.6),'foot'+s,boot,[0,-.6,1.4]);add(sph(1.9,8,6),'foot'+s,skin,[0,.4,4.6],[0,0,0],[1.25,.6,.7]);
  if(L.warm)add(cyl(3.6,3.8,5,10),'shin'+s,L.warm,[0,-5.2,0]);
  if(AA==='bandall')add(cyl(3.1,3.25,4.4,10),'shin'+s,'#f0ece0',[0,-5.2,0]); // bandages au mollet seulement (plus d'anneau à la cuisse)
  if(L.stripes)for(const [b,y,r] of[['thigh',-4.6,3.4],['shin',-4.2,3.1]])add(cyl(r,r,1.6,10),b+s,L.stripes,[0,y,0])}
 // bassin, ventre, torse, ceinture
 add(cap(7.6,3,10),'hips',legs,[0,1.5,0],[0,0,Math.PI/2],[1,1.15,.78]);
 add(cap(8.4,3.5,12),'spine',torso,[0,4,0],[0,0,0],[1,1,.76]);add(cap(9.6,5.5,12),'chest',torso,[0,1.5,0],[0,0,0],[1,1,.74]);
 if(L.belly)add(sph(9,16,12),'spine',L.armor||torso,[0,2.6,1.1],[0,0,0],[1.1,1,1]);
 if(L.belt)add(tor(L.belly?10.2:8.3,1.2),'spine',L.belt,[0,-.6,L.belly?1.1:0],[Math.PI/2,0,0],[1,L.belly?.86:.78,1]);
 if(torso==='#f08a24'){add(cap(9.9,1.6,12),'chest',L.belt||'#2a3550',[0,6.2,0],[0,0,0],[1,1,.76]);add(box(1.2,15,.6),'chest',L.belt||'#2a3550',[0,0,7.2])}
 if(L.vest){add(cap(10.4,5,12),'chest',L.vest,[0,1.2,.2],[0,0,0],[1,1,.8]);add(tor(5.6,1.8),'chest',L.vest,[0,8.2,0],[Math.PI/2,0,0]);for(const x of[-4.6,4.6])for(const y of[-1.5,3])add(box(4,3.2,1.6),'chest',L.vest,[x,y,7.6]);
  if(L.vband)for(const y of[-4,0,4])add(tor(10.5,.55,24),'chest',dk(L.vest,.7),[0,y,.2],[Math.PI/2,0,0],[1,.8,1]);
  if(L.spiral){add(cyl(3.4,3.4,.6,16),'chest','#c0302a',[0,1,-8.5],[Math.PI/2,0,0]);add(cyl(2.1,2.1,.7,16),'chest',L.vest,[0,1,-8.6],[Math.PI/2,0,0]);add(cyl(.9,.9,.8,10),'chest','#c0302a',[0,1,-8.7],[Math.PI/2,0,0])}}
 if(L.tunic){add(tor(5.2,2.1),'chest',L.tunic,[0,8.5,0],[Math.PI/2,0,0]);add(cyl(3.6,3.6,.8,14),'chest','#ffffff',[0,2,-7.6],[Math.PI/2,0,0]);add(cyl(3.6,3.6,.9,14),'chest','#d02a2a',[0,.4,-7.7],[Math.PI/2,0,0],[1,1,.5])}
 if(L.armor){add(cap(10.2,3.6,12),'chest',L.armor,[0,2.4,.6],[0,0,0],[1,.9,.8]);add(sph(4.2,10,7),'armL',L.armor,[1,-.5,0],[0,0,0],[1,.8,1])}
 if(L.samurai){const c=L.samurai;add(cap(10.6,4,12),'chest',c,[0,1.6,.4],[0,0,0],[1,.95,.84]);if(!(L.hov&&L.hsl))for(const s of['L','R'])add(sphp(4.6,12,8,0,Math.PI*2,0,Math.PI*.55),'arm'+s,c,[0,1,0],[0,0,(s==='L'?-1:1)*.25],[1.2,.9,1.15]);
  for(const a of[-.9,0,.9,Math.PI-.6,Math.PI+.6]){const R=10.6;add(box(6.6,7.2,1),'skirt',c,[Math.sin(a)*R,-2.6,Math.cos(a)*R],[.14,a,0]);add(box(6.8,.9,1.1),'skirt',L.belt||'#d8c060',[Math.sin(a)*(R+.3),.9,Math.cos(a)*(R+.3)],[.14,a,0])}}
 // robes et manteaux longs : jusqu'aux chevilles (la jupe suit la hanche)
 const robeR=y=>10.2+(6-y)/24*4.3; // rayon de la robe longue à la hauteur y (repère de la hanche)
 if(L.robe){if(L.rshort)add(cyl(10.2,12.8,11,16),'skirt',L.robe,[0,-.5,0]);else{add(cyl(10.2,14.5,24,16),'skirt',L.robe,[0,-6,0]);if(L.trim)add(cyl(14.3,14.8,3.2,16),'skirt',L.trim,[0,-16.5,0])}
  add(cap(10.6,5.5,12),'chest',L.robe,[0,1.2,0],[0,0,0],[1,1,.8]);add(cyl(6,7.2,5,14),'chest',L.robe,[0,9,0]);
  if(L.dots&&(!L.haori||L.hov))for(const [a,y] of[[.6,.2],[-.7,-3.6],[2.2,-1.7],[-2.4,-7.4],[3.1,-4.8],[1.3,-11.1],[-1.5,-13.7]]){const R=(L.rshort?10.2+(5-y)/11*2.6:robeR(y))+.3;if(L.rshort&&y<-5)continue;add(sph(1.7,8,6),'skirt',L.dots,[Math.sin(a)*R,y,Math.cos(a)*R],[0,a,0],[1,1,.35])}
  // nuages rouges de l'Akatsuki, posés sur la surface du manteau
  if(L.clouds&&!L.hov){const CC=L.cloudC||'#c0202a';for(const [x,y,z] of[[-5,-2,8.1],[4,4,8.3],[6,2,-7.4]]){const b=Math.atan2(x,z),ox=Math.sin(b)*.35,oz=Math.cos(b)*.35;add(sph(3.3,10,7),'chest','#ffffff',[x,y,z],[0,b,0],[1.25,.78,.3]);add(sph(2.6,10,7),'chest',CC,[x+ox,y,z+oz],[0,b,0],[1.2,.7,.3])}
   for(const [x,y,z] of[[5,-12,12.6],[-5,-15,-13.2],[-11,-9,4.6]]){const b=Math.atan2(x,z),ox=Math.sin(b)*.35,oz=Math.cos(b)*.35;add(sph(3.3,10,7),'skirt','#ffffff',[x,y,z],[0,b,0],[1.25,.78,.3]);add(sph(2.6,10,7),'skirt',CC,[x+ox,y,z+oz],[0,b,0],[1.2,.7,.3])}}}
 if(L.jupe)add(cyl(10.4,12.6,8.4,16),'skirt',L.jupe,[0,-1.6,0]);
 if(L.yoke){add(sphp(10.05,16,8,0,Math.PI*2,0,Math.PI*.36),'chest',L.yoke,[0,4.25,0],[0,0,0],[1.01,1,.77]);for(const s of['L','R'])add(sph(3.3,10,7),'arm'+s,L.yoke,[0,0,0])}
 if(L.open)add(box(4.4,4.4,.8),'chest',skin,[0,6.8,7],[-.35,0,Math.PI/4],[1,1.3,1]);
 if(L.kcol)for(const s of[-1,1])add(box(1.5,9.5,.9),'chest',L.kcol,[s*2,4.4,7.6],[-.3,0,s*.48]);
 if(L.obi){add(cyl(8.6,8.6,4.6,18),'spine',L.obi,[0,.2,0],[0,0,0],[1,1,.8],1);if(!L.cape&&!L.hov)for(const s of[-1,1])add(sph(2.5,10,7),'spine',L.obi,[s*2.6,.6,-7.2],[0,0,s*.6],[1.4,.8,.7],1)}
 if(L.rope){add(tor(8.6,.95,16),'spine',L.rope,[0,-.6,0],[Math.PI/2,0,0],[1,.8,1]);if(!L.cape&&!L.hov){for(const s of[-1,1])add(sph(2.6,8,6),'spine',L.rope,[s*2.9,-.6,-7.4],[0,0,s*.5],[1.3,.8,.6]);add(sph(1.4,8,6),'spine',L.rope,[0,-.6,-7.8])}}
 if(L.fan&&!L.tunic){add(cyl(3.6,3.6,.8,14),'chest','#ffffff',[0,2,-7.6],[Math.PI/2,0,0]);add(cyl(3.6,3.6,.9,14),'chest','#d02a2a',[0,.4,-7.7],[Math.PI/2,0,0],[1,1,.5])}
 if(L.disc)add(tor(3.4,.8,16),'chest',L.disc,[0,2,-8],[-.12,0,0]);
 if(L.haori){const H=L.haori,lg=L.hlong,HW=L.hov?(L.vest||L.armor||L.samurai||L.robe||L.belly?1.14:1.04):1,HT=L.hov?L.htrim:L.trim;add(cyl(10.6,11.1,15,16,1,true,.95,Math.PI*2-1.9),'chest',H,[0,.2,0],[0,0,0],[HW,1,.84*HW]);
  if(lg)add(cyl(11,14.6,24,16,1,true,.85,Math.PI*2-1.7),'skirt',H,[0,-6,0],[0,0,0],[HW,1,HW]);else add(cyl(11,13.4,18,16,1,true,.85,Math.PI*2-1.7),'skirt',H,[0,-3.5,0],[0,0,0],[HW,1,HW]);
  if(L.hsl)for(const s of['L','R'])add(cyl(3.7,4.6,6.5,10),'arm'+s,H,[0,-2.6,0]);if(HT&&!lg&&L.hkan){const yb=-12.5,R0=13.4*HW;add(cyl(R0+.12,R0+.15,2.2,16,1,true,.85,Math.PI*2-1.7),'skirt',HT,[0,yb+1.1,0]);
   for(let i=0;i<9;i++){const a=.95+i*(Math.PI*2-1.9)/8,R=R0+.25;add(cone(1.8,3.6+(i%2)*1.6,4),'skirt',HT,[Math.sin(a)*R,yb+2.8+(i%2)*.8,Math.cos(a)*R],[0,a,0],[1,1,.35])}} // flammes du Hokage
  else if(HT)add(lg?cyl(14.3,14.65,2.8,16,1,true,.85,Math.PI*2-1.7):cyl(13.35,13.7,2.8,16,1,true,.85,Math.PI*2-1.7),'skirt',HT,[0,lg?-16.8:-11.3,0],[0,0,0],[HW,1,HW]);
  if(L.dots&&!L.hov)for(const [a,y] of[[1.5,-2],[2.3,-8],[3.14,-3],[3.9,-8],[4.7,-2],[2.8,-10.5],[3.5,1.5]]){const R=(11.4+(-y+5)/18*2.2)*HW;add(sph(1.7,8,6),'skirt',L.dots,[Math.sin(a)*R,y,Math.cos(a)*R],[0,a,0],[1,1,.35])}
  if(L.clouds&&(!L.robe||L.hov)){const CC=L.cloudC||'#c0202a';for(const [x,y,z] of L.sym?[[5.6,-4.6,-8.1*HW],[-5.4,-3.8,-8.2*HW]]:[[6,1,-8.3*HW],[-5,4.5,-8.8*HW]]){const b=Math.atan2(x,z),ox=Math.sin(b)*.35,oz=Math.cos(b)*.35;add(sph(3.3,10,7),'chest','#ffffff',[x,y,z],[0,b,0],[1.25,.78,.3]);add(sph(2.6,10,7),'chest',CC,[x+ox,y,z+oz],[0,b,0],[1.2,.7,.3])}
   for(const [a,y] of[[1.3,-4],[3.5,-1],[-1.3,-12]]){const R=(11+(6-y)/24*3.6)*HW+.2;add(sph(3.3,10,7),'skirt','#ffffff',[Math.sin(a)*R,y,Math.cos(a)*R],[0,a,0],[1.25,.78,.3]);add(sph(2.6,10,7),'skirt',CC,[Math.sin(a)*(R+.35),y,Math.cos(a)*(R+.35)],[0,a,0],[1.2,.7,.3])}}}
 if(L.collar)add(cyl(11.8,8.4,9,16),'chest',L.collar,[0,11,0],[0,0,0],[1,1,.95]);
 if(L.fur)add(tor(7.8,3,16),'chest',L.fur,[0,8.6,0],[Math.PI/2,0,0],[1,1,.85]);
 if(L.hood==='down'){add(tor(7.6,2.7,14),'chest',L.hoodC||torso,[0,8.4,-1.4],[Math.PI/2+.35,0,0]);add(sph(5.5,10,8),'chest',L.hoodC||torso,[0,6.5,-8.4],[0,0,0],[1.35,.8,.7])}
 if(L.sash)add(tor(10.6,1.35,20),'chest',L.sash,[0,1,0],[-Math.PI/2,.62,0],[1,1,.8]);
 // cou : écharpes (sur les épaules, pans jusqu'à la taille), colliers et pendentifs (bien devant le torse, par-dessus un col montant)
 const NK=L.neck,CO=!!L.collar,dz=CO?0:L.samurai?1.5:L.vest||L.robe?1.2:L.armor?1:0,nz=(CO?9.4:7.6)+dz,ny=CO?4.2:2.6;
 if(NK==='echarpe'||NK==='echlong'||NK==='foulard'){const c=L.maskC||(NK==='echarpe'?'#c0282a':NK==='echlong'?'#3a6ac8':'#d8d0c0');add(tor(CO?8.4:6.8,2.3,18),'chest',c,[0,CO?9.2:7.4,.2],[Math.PI/2+.12,0,0],[1,1,.86],1);add(sph(3,10,8),'chest',c,[2.8,6.6,5.4],[0,0,0],[1,.8,.8],1);
  if(NK==='echarpe'){add(box(3.4,12,1.2),'chest',c,[3.4,.6,6.3],[-.12,0,.1],[1,1,1],1);add(box(3.2,9,1.2),'chest',c,[5.6,1.8,5.9],[-.1,0,.32],[1,1,1],1)}
  else if(NK==='echlong'){add(box(3.6,16,1),'chest',c,[3.6,-1.6,6.4],[-.1,0,.06],[1,1,1],1);{const cz=L.cape?-1.4:.4;add(box(3.4,13,1),'cape',c,[3,-5,cz],[0,0,.1],[1,1,1],1);add(box(3.2,15,1),'cape2',c,[3.4,-6,cz],[0,0,.14],[1,1,1],1)}}
  else add(cone(5.2,8,4),'chest',c,[0,3.2,5.6+dz],[Math.PI+.25,Math.PI/4,0],[1,1,.42],1)}
 if(NK==='tsunade'||NK==='jashin'||NK==='crocs'||NK==='anneaux'){add(tor(CO?8.6:6.4,.42,20),'chest',NK==='crocs'?'#5a3a22':'#3a3a44',[0,CO?7.4:5.6,1.4+dz],[Math.PI/2+.35,0,0],[1,1,1],1);
  if(NK==='tsunade')add(sph(1.5,8,6),'chest','#4ae070',[0,ny,nz],[0,0,0],[1,1.9,.7],1);
  if(NK==='jashin'){add(tor(2.1,.42,14),'chest','#e0e4ec',[0,ny,nz],[0,0,0],[1,1,1],1);add(cone(1.4,3.2,3),'chest','#e0e4ec',[0,ny+.1,nz+.2],[0,0,0],[1,1,.4],1)}
  if(NK==='crocs')for(const x of[-2.6,-1.3,0,1.3,2.6])add(cone(.75,3.2,4),'chest','#f8f4ea',[x,ny+.6-Math.abs(x)*.35,nz-.4],[Math.PI,0,0],[1,1,1],1);
  if(NK==='anneaux')for(const x of[-2.4,0,2.4])add(tor(1.15,.36,12),'chest','#d8dce6',[x,ny+.4-Math.abs(x)*.2,nz],[0,0,0],[1,1,1],1)}
 if(NK==='chapelet')for(let i=0;i<12;i++){const a=i/12*Math.PI*2,R=CO?8.4:6.6;add(sph(i===6?1.6:1.05,8,6),'chest',i===6?'#c8a050':'#6a4a2a',[Math.sin(a)*R,(CO?7.6:5.6)-Math.cos(a)*3.4,Math.cos(a)*R*.86+1+dz],[0,0,0],[1,1,1],1)}
 // objets portés dans le dos
 const BK=L.back;
 if(BK==='parchemin'){add(cyl(3.4,3.4,26,14),'chest','#e8dcc0',[0,-9,-10],[0,0,Math.PI/2]);for(const x of[-13,13])add(cyl(3.8,3.8,2.6,14),'chest','#b83a2a',[x,-9,-10],[0,0,Math.PI/2])}
 if(BK==='samehada'){const ax=[.48,.88,0],c=[2,2,-11.5],at=t=>c.map((v,i)=>v+ax[i]*t),qa=qv([0,1,0],ax),qr=qv([0,0,1],ax);add(cap(4.4,24,10),'chest','#3a4a7a',c,qa);for(const t of[-9,-3,3,9])add(tor(4.4,.55,14),'chest','#7a8ab8',at(t),qr);add(cyl(1.5,1.5,8,8),'chest','#5a4a3a',at(19.5),qa)}
 if(BK==='faux'){const ax=[-.52,.85,0],c=[-1,4,-11],at=t=>c.map((v,i)=>v+ax[i]*t),pp=[ax[1],-ax[0],0];add(cyl(.75,.75,42,6),'chest','#4a3426',c,qv([0,1,0],ax));for(let k=0;k<3;k++){const b=at(19-k*4.5).map((v,i)=>v+pp[i]*7);add(cone(2.4,14,4),'chest','#c42a2a',b,qv([0,1,0],pp),[1,1,.35])}}
 if(BK==='eventail'){const md=h.style==='madara',ax=md?[.62,.78,0]:[.34,.94,0],c=md?[7,1,-12.2]:[-2,3,-10.6],qa=qv([0,1,0],ax);add(box(5,40,3),'chest','#4a3a2a',c,qa);for(const t of[-12,0,12])add(cyl(2.3,2.3,.6,12),'chest','#8a5ab8',c.map((v,i)=>v+ax[i]*t+(i===2?-1.6:0)),[Math.PI/2,0,0])}
 if(BK==='fuma'){const c=[0,2,-10.6];for(let i=0;i<4;i++){const a=i*Math.PI/2+.4,d=[Math.cos(a),Math.sin(a),0];add(cone(2.8,13,4),'chest','#9aa2ae',c.map((v,j)=>v+d[j]*7.5),qv([0,1,0],d),[1,1,.3])}add(cyl(2.6,2.6,1.8,12),'chest','#5a5f6a',c,[Math.PI/2,0,0])}
 if(BK==='katana'){const ax=[-.87,.5,0],c=[0,-1.5,-9.6],qa=qv([0,1,0],ax);add(box(2.4,30,2.4),'spine','#24242c',c,qa);add(cyl(1.1,1.1,8,8),'spine','#d8d0c0',c.map((v,i)=>v+ax[i]*19),qa)}
 if(BK==='kubi'){const ax=[-.5,.87,0],c=[1,2,-10.6],qa=qv([0,1,0],ax),pp=[ax[1],-ax[0],0];add(box(12,38,1.2),'chest','#c8d0da',c,qa);add(cyl(2.6,2.6,1.4,14),'chest','#2a2e36',c.map((v,i)=>v+ax[i]*13+pp[i]*2),[Math.PI/2,0,0]);add(cyl(1.3,1.3,10,8),'chest','#4a3a2a',c.map((v,i)=>v-ax[i]*24),qa)}
 if(BK==='karasu'){add(cap(6.4,14,10),'chest','#e8e2d0',[0,-1,-12],[.1,0,0]);for(const y of[-8,-3,2,7])add(tor(6.5,.6,14),'chest','#8a6a4a',[0,y,-12.6+y*.1],[Math.PI/2+.1,0,.15]);add(sph(3.2,10,8),'chest','#e8e2d0',[0,12,-11],[0,0,0],[1,1.1,1])}
 if(BK==='kusanagi'){const q=qv([0,1,0],[1,.12,0]);add(box(2,30,2),'spine','#4a3a6a',[0,-2,-9.4],q);add(cyl(1.1,1.1,7,8),'spine','#e8e2d0',[-18.5,-4.2,-9.4],q);add(tor(3.4,.8,12),'spine','#8a5ab8',[3,-1.6,-9.6],[0,0,0])}
 if(BK==='rouleaux')for(const x of[-4.6,4.6]){add(cyl(3,3,22,14),'chest','#e8dcc0',[x,-2,-10.4],[.1,0,x*.03]);for(const y of[-11,7])add(cyl(3.3,3.3,2.2,14),'chest','#b83a2a',[x,y+2,-10.4+y*.1],[.1,0,x*.03])}
 if(BK==='baton'){const ax=[.45,.89,0],qa=qv([0,1,0],ax);add(cyl(.9,.9,52,8),'chest','#6a4a2a',[0,2,-10],qa);for(const t of[-24,24])add(cyl(1.25,1.25,3,10),'chest','#e8c040',[ax[0]*t,2+ax[1]*t,-10],qa)}
 if(BK==='sac'){add(box(13,13,6),'chest','#6a5a3a',[0,-2,-10.6]);add(box(13.4,5,6.6),'chest','#5a4a2e',[0,4,-10.6]);for(const s of[-1,1])add(tor(4,.7,10),'chest','#4a3a22',[s*5,5,-3],[0,Math.PI/2,0],[1,1.4,1])}
 if(BK==='hirame'){const ax=[.42,.9,0],c=[0,2,-10.8],qa=qv([0,1,0],ax),qr=qv([0,0,1],ax);add(box(8,36,2),'chest','#4a5a7a',c,qa);for(const t of[-14,-7,0,7,14])add(box(8.6,1.1,2.4),'chest','#d8d0c0',c.map((v,i)=>v+ax[i]*t),qa);add(cyl(1.4,1.4,9,8),'chest','#3a2a2a',c.map((v,i)=>v+ax[i]*22),qa)}
 if(L.cape){const rb=L.robe&&!L.rshort;add(box(18,13.5,1),'cape',L.cape,[0,-6.5,rb?-1.9:-.4]);add(box(17,15,1),'cape2',L.cape,[0,-7.2,rb?-4.4:-.4],rb?[-.12,0,0]:[0,0,0])}
 if(L.gourd){add(sph(6.5,12,9),'chest','#c8945a',[1,-2,-11],[0,0,0],[1,1.1,.95]);add(sph(4.4,12,9),'chest','#c8945a',[2.4,6.4,-11.5]);add(tor(9.5,.8,16),'chest','#8a3a2a',[0,1,-1],[.2,0,.75],[1,1.05,.95])}
 // bras, mains (bandages pour le taijutsu), cou, tête
 for(const s of['L','R']){add(cap(2.7,5.4),'arm'+s,arm,[0,-4.4,0]);add(sph(3.1,10,7),'arm'+s,arm,[0,0,0]);add(cap(2.45,5),'fore'+s,arm,[0,-4,0]);add(sph(big?3.9:2.9,10,8),'hand'+s,fistC,[0,-1.6,.3]);
  if(L.stripes)for(const [b,y,r] of[['arm',-4.6,2.85],['fore',-4,2.6]])add(cyl(r,r,1.4,10),b+s,L.stripes,[0,y,0]);
  if(AA==='bandages'||AA==='bandall')add(cyl(2.2,2.3,7.5,10),'fore'+s,'#f0ece0',[0,-6.4,0],[0,0,0],[1,1,1],1);
  if(AA==='protege'){add(cyl(2.45,2.6,6.6,10),'fore'+s,'#2a3050',[0,-6,0],[0,0,0],[1,1,1],1);add(cyl(2.7,2.7,.9,10),'fore'+s,'#c8ccd6',[0,-8.8,0],[0,0,0],[1,1,1],1)}
  if(AA==='gantelets')add(cyl(2.5,2.8,7,10),'fore'+s,'#9aa2ae',[0,-6.2,0],[0,0,0],[1,1,1],1);
  if(AA==='gants'){add(cyl(2.3,2.35,2,10),'fore'+s,'#3a3f50',[0,-9.6,0],[0,0,0],[1,1,1],1);add(box(2.2,1.6,.5),'hand'+s,'#c8ccd6',[0,-1.6,2.5],[0,0,0],[1,1,1],1)}
  if(AA==='bracelets')for(const y of[-8.6,-9.8])add(tor(2.25,.42,12),'fore'+s,'#e8c040',[0,y,0],[Math.PI/2,0,0],[1,1,1],1);
  if(AA==='bague')add(tor(.95,.32,10),'hand'+s,'#f0c840',[s==='L'?1.4:-1.4,-2.4,2.2])} // un simple anneau (plus de vernis qui recouvre la main)
 if(AA==='tatouage'){const tx=L.haori&&L.hsl?1.4:0;add(tor(1.7,.42,14),'armL','#c02a2a',[2.6+tx,-2.6,0],[0,Math.PI/2,0],[1,1,1],1);add(tor(.8,.38,10),'armL','#c02a2a',[2.75+tx,-2.6,0],[0,Math.PI/2,0],[1,1,1],1);add(box(.5,3.2,.7),'armL','#c02a2a',[2.7+tx,-4.9,1.2],[0,0,.1],[1,1,1],1)}
 if(L.samurai)for(const s of['L','R'])add(cyl(2.6,2.8,6,10),'fore'+s,L.samurai,[0,-6,0],[0,0,0],[1,1,1],1);
 add(cyl(3.2,3.6,4.5,10),'neck',skin,[0,1.4,0]);
 add(sph(12.6,20,15),'head',skin,[0,8,0],[0,0,0],[1.03,.97,.96]);for(const x of[-12,12])add(sph(2.3,8,6),'head',skin,[x,7.5,0],[0,0,0],[.6,1,1]);
 // bandeau frontal et plaque
 const ac=h.acc,hatF=HATS.has(ac),bs=hatF&&BAND_HEAD.has(h.bs==null?'front':h.bs)?'':h.bs==null?'front':h.bs,hoodUp=L.hood==='up'||L.hood==='chat',HS=HAIRS[h.style]; // couvre-chef : le bandeau de tête est caché, les mèches dressées aplaties
 if(bs==='front'||bs==='barre'||bs==='cornes'){add(tor(12.2,1.5,22),'head',band,[0,15.2,-.4],[Math.PI/2+.05,0,0],[1.03,.98,1]);add(box(9.6,5.2,1.6),'head','#c8ccd6',[0,15.3,11.2],[-.32,0,0]);
  if(bs==='cornes')for(const s of[-1,1])add(cone(1.5,5.5,6),'head','#c8ccd6',[s*3.4,19.6,11.4],[.35,0,-s*.55])}
 if(bs==='oblique'){const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-.42).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2+.3));add(tor(12.6,1.5,22),'head',band,[0,13.6,-.6],q,[1.03,.98,1]);
  add(box(9.6,5.6,1.6),'head','#c8ccd6',[4.4,8.4,11],[-.05,.36,-.42])}
 if(bs==='tete'){add(tor(14.2,1.4,22),'head',band,[0,12,-1.5],[Math.PI/2-.6,0,0]);add(box(8.4,4.6,1.4),'head','#c8ccd6',[0,20.4,10.2],[-.85,0,0])}
 if(bs==='cou'){add(tor(9.3,1.4,20),'chest',band,[0,6,0],[Math.PI/2,0,0],[1,.8,1]);add(box(5.8,3.4,1),'chest','#c8ccd6',[0,5.6,7.9],[.3,0,0])}
 if(bs==='taille'){add(tor(8.9,1.3,20),'spine',band,[0,-.4,0],[Math.PI/2,0,0],[1,.8,1]);add(box(6.6,3.6,1.1),'spine','#c8ccd6',[0,-.4,7.3])}
 if(bs==='bras'){add(tor(3.4,1.15,12),'armL',band,[0,-3,0],[Math.PI/2,0,0]);add(box(1,2.8,3.6),'armL','#c8ccd6',[3.9,-3,0])}
 if(bs==='front'||bs==='barre'||bs==='cornes'||bs==='oblique'||bs==='tete'){add(box(1.6,7,.8),'band',band,[1.2,-3.5,0],[0,0,.2]);add(box(1.6,6.5,.8),'band',band,[-1.2,-3.2,0],[0,0,-.25])}
 // cheveux : calotte + mèches (cônes qui sortent du crâne dans la direction donnée par [élévation, tour])
 const hc=hair,st=h.style,HC=new T.Vector3(0,8,0),UPV=new T.Vector3(0,1,0);
 const spike=(el,az,len,rad,bone='head',col=hc)=>{if(hatF)return;const d=new T.Vector3(Math.sin(el)*Math.sin(az),Math.cos(el),Math.sin(el)*Math.cos(az)),q=new T.Quaternion().setFromUnitVectors(UPV,d);const base=HC.clone().addScaledVector(d,10.6+len*.45);add(cone(rad,len,6),bone,col,[base.x,base.y,base.z],q)};
 if(st!=='chauve'&&!(HS&&HS.cap===0&&!hoodUp))add(sphp(13.3,20,12,0,Math.PI*2,0,Math.PI*.5),'head',hc,[0,8.4,-.9],[-.42,0,0],[1.05,1.06,1.05]);
 if(hoodUp){add(sphp(15.2,20,11,Math.PI/2+1,Math.PI*2-2,0,Math.PI*.62),'head',L.hoodC||torso,[0,8.6,-.6],[0,0,0],[1.02,1,1]);if(L.hood==='chat')for(const s of[-1,1])add(cone(3.4,7,6),'head',L.hoodC||torso,[s*7.5,23.5,-1.5],[0,0,-s*.45])}
 else if(HS)for(const q of HS.p){const t=q[0];if(hatF&&t==='o'&&q[1][1]>=17)continue;const hb=String(t==='o'?q[4]:t==='c'?q[6]:t==='k'?q[5]:'').includes('h'),bn=hb?'hair':'head',ps=v=>hb?v.map((x,i)=>x-HAIRB[i]):v;
  if(t==='s')spike(q[1],q[2],q[3],q[4]);else if(t==='c')add(cap(q[2],q[3],10),bn,hc,ps(q[1]),q[4],q[5]);else if(t==='k')add(cone(q[2],q[3],7),bn,hc,ps(q[1]),q[4]);
  else if(t==='o')add(sph(q[2],12,9),bn,q[5]||hc,ps(q[1]),[0,0,0],q[3]);else if(t==='sh')add(sphp(q[1],22,12,q[3]?Math.PI/2+q[3]:0,q[3]?Math.PI*2-2*q[3]:Math.PI*2,0,q[2]),'head',hc,[0,8,-.4],[0,0,0],[1.02,1,1])}
 if(!hoodUp&&st==='pics'){for(const [el,az,l,r] of[[.25,0,12,4.2],[.45,1.1,12,4],[.45,-1.1,12,4],[.62,2.2,11,4],[.62,-2.2,11,4],[.75,3.1,11,4],[.95,2.6,10,3.6],[.95,-2.6,10,3.6],[1.25,3.0,9,3.4],[1.2,1.75,9,3.2],[1.2,-1.75,9,3.2],[.55,.4,9,3.5],[.55,-.4,9,3.5]])spike(el,az,l,r);
  for(const az of[-.55,0,.55])spike(1.25,az,6,2.6)}
 if(!hoodUp&&st==='lisse'){add(cap(12.6,6,16),'head',hc,[0,4.5,-4.4],[0,0,0],[1.05,1.05,.62]);for(const x of[-11.8,11.8])add(cap(2.6,10,8),'head',hc,[x,4,3.5]);spike(1.15,.35,6,3.2);spike(1.15,-.35,6,3.2);spike(1.2,0,5,3)}
 if(!hoodUp&&st==='queue'){add(cone(4.8,15,7),'hair',hc,[0,4.5,-1],[-2.3,0,0]);add(sph(2.5,8,6),'hair','#3a2a20',[0,-.4,0]);for(const az of[-.5,0,.5])spike(1.2,az,5,2.8)}
 if(!hoodUp&&st==='courts'){for(const [el,az] of[[1.1,2.7],[1.1,-2.7],[1.25,3.14],[.95,2.2],[.95,-2.2]])spike(el,az,8,3.4);for(const az of[-.5,0,.5])spike(1.2,az,5,2.8)}
 if(!hoodUp&&st==='chignons'){for(const x of[-9.5,9.5])add(sph(5.2,12,9),'head',hc,[x,19.5,-2.5]);for(const az of[-.5,0,.5])spike(1.2,az,5,2.8)}
 if(ac==='kage'){const hk=L.hatC||'#c0202a';add(cone(21,8,22),'head','#f0eee6',[0,22.6,0]);add(cone(11,6.2,18),'head',hk,[0,25.8,.3]);add(box(13,11,.8),'band','#f0eee6',[0,-4.5,1.5])} // kanji du village : décalque (sym)
 if(ac==='visee'){add(cyl(2.5,2.5,2.6,12),'head','#5a6a7a',[4.4,5.9,12],[Math.PI/2,0,0]);add(cyl(1.8,1.8,.5,12),'head','#6ad8ff',[4.4,5.9,13.4],[Math.PI/2,0,0]);add(box(.9,1.1,9),'head','#3a3f4a',[9.4,6.6,7.6],[0,.75,0])}
 if(ac==='fleur'){for(let i=0;i<5;i++){const a=i*1.26;add(sph(2.3,8,6),'head','#e4e8f8',[-9.2,17.5+Math.sin(a)*2.6,-1+Math.cos(a)*2.6],[0,Math.PI/2,0],[1,1,.45])}add(sph(1.4,8,6),'head','#8e9ede',[-10.3,17.5,-1])}
 if(ac==='masque'||ac==='bandvis')add(sphp(12.9,18,10,Math.PI*.15,Math.PI*.7,Math.PI*.55,Math.PI*.33),'head',ac==='masque'?L.maskC||'#2a3550':'#ece8de',[0,8,.2],[0,0,0],[1.03,.97,.96]);
 if(ac==='goggles'){add(tor(13.2,1.7,22),'head','#2a2a30',[0,18.8,-1.2],[Math.PI/2-.25,0,0],[1.02,1,1.02]);for(const s of[-1,1]){add(cyl(4,4.3,2.6,16),'head','#2a2a30',[s*4.6,19.4,10.6],[Math.PI/2-.55,0,0]);add(cyl(3.3,3.3,.8,16),'head','#ff8a1a',[s*4.6,20.1,11.9],[Math.PI/2-.55,0,0])}}
 if(ac==='boucles')for(const s of[-1,1]){add(tor(2.6,.8,12),'head','#f0c840',[s*12.4,1.2,.6],[0,Math.PI/2,0]);add(sph(1.3,8,6),'head','#f0c840',[s*12.3,4.6,.4])}
 if(ac==='paille'){add(cone(20,11,22),'head','#c8a860',[0,23.5,0]);add(cyl(19.4,20,.8,22),'head','#a8885a',[0,18.4,0]);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;if(Math.abs(Math.sin(a/2))<.22)continue;add(box(1.6,9,.4),'head','#f0ece0',[Math.sin(a)*18.6,13.8,Math.cos(a)*18.6],[0,a,0])}
  for(const s of[-1,1]){add(cyl(.35,.35,6,6),'head','#c02a2a',[s*15.5,13.6,5.5]);add(sph(1.9,10,8),'head','#f0c840',[s*15.5,10.4,5.5])}}
 if(ac==='kabuto'){add(sphp(14.2,20,10,0,Math.PI*2,0,Math.PI*.45),'head','#3a3a48',[0,8.6,-.6],[-.15,0,0],[1.04,1.04,1.04]);add(cyl(15.6,16.6,1.6,20),'head','#2a2a34',[0,9.4,-.8],[-.15,0,0]);for(const s of[-1,1])add(cone(1.1,9,6),'head','#e8c040',[s*3,23,9.4],[.25,0,-s*.5])}
 if(ac==='bandana'){const bc=L.maskC||'#3a3a48';add(sphp(13.9,20,10,0,Math.PI*2,0,Math.PI*.42),'head',bc,[0,8.6,-.7],[-.3,0,0],[1.05,1.05,1.05]);add(sph(2.2,8,6),'head',bc,[0,10,-13.4]);for(const s of[-1,1])add(box(1.6,5,.6),'band',bc,[s*1.4,-2,0],[0,0,s*.25])}
 // ceinture et équipement : porte-kunai à la cuisse (bandé), pochette au bas du dos, parchemins, clochettes
 const GR=L.gear;
 if(GR==='holster'||GR==='both'){add(cyl(3.6,3.6,1.3,12),'thighR','#f0ece0',[0,-5,0],[0,0,0],[1,1,1],1);add(cyl(3.6,3.6,1.3,12),'thighR','#f0ece0',[0,-9.4,0],[0,0,0],[1,1,1],1);add(box(2.6,6.4,4.2),'thighR','#3a3a44',[-3.6,-7.2,.6],[0,0,-.06],[1,1,1],1);add(cyl(.5,.5,2.6,6),'thighR','#24242c',[-3.6,-3.2,1.4],[0,0,0],[1,1,1],1)}
 if(GR==='pouch'||GR==='both'){add(box(7,4.6,3.6),'hips','#5a4a32',[0,1.6,-5.5],[0,0,0],[1,1,1],1);add(box(7.4,1.4,3.9),'hips','#4a3a24',[0,3.6,-5.5],[0,0,0],[1,1,1],1)}
 if(GR==='scrolls')for(const sd of[-1,1]){add(cyl(1.7,1.7,7,10),'hips','#e8dcc0',[sd*6.8,1.4,-2],[Math.PI/2,0,0],[1,1,1],1);add(cyl(1.85,1.85,1.2,10),'hips','#b83a2a',[sd*6.8,1.4,1.5],[Math.PI/2,0,0],[1,1,1],1)}
 if(GR==='bells')for(const sd of[-1,1]){add(cyl(.3,.3,3,5),'hips','#c02a2a',[sd*5,.6,5],[0,0,0],[1,1,1],1);add(sph(1.7,10,8),'hips','#f0c840',[sd*5,-1.6,5.2],[0,0,0],[1,1,1],1)}
 // armes selon le style
 const wpn=W.col||'#3af';
 if(k==='kunai'){add(box(2.6,4.2,3),'thighR','#3a3a44',[-3,-3,1.6]);add(cyl(.7,.7,4,6),'handR','#3a3a44',[0,-3.2,1.2],[0,0,0]);add(cone(1.6,6,4),'handR','#d3d8e2',[0,-7.8,1.2],[Math.PI,0,0]);add(tor(1.1,.35,8),'handR','#3a3a44',[0,-.6,1.2])}
 // clan Hoshigaki : Samehada en main (style « Samehada ») : grosse lame bandée, écailles
 if(k==='sword'&&W.same){add(cyl(1,1,8,6),'handR','#5a4a3a',[0,-1,2.6],[Math.PI/2,0,0]);add(cap(3.6,26,10),'handR','#3a4a7a',[0,-1,22],[Math.PI/2,0,0],[1,.75,1]);for(const z of[12,18,24,30])add(tor(3.5,.55,12),'handR','#7a8ab8',[0,-1,z],[0,0,0],[1,.78,1]);
  for(const z of[14,21,28])for(const sd of[-1,1])add(cone(1.1,3.2,4),'handR','#9ab8cc',[sd*3.6,-1,z],[0,0,-sd*Math.PI/2])}
 else if(k==='sword'){add(cyl(.8,.8,6,6),'handR','#2a2a33',[0,-1,2.8],[Math.PI/2,0,0]);add(cyl(2.2,2.2,.6,10),'handR','#c8a040',[0,-1,5.6],[Math.PI/2,0,0]);add(box(1.2,.5,32),'handR','#e8ecf2',[0,-1,22]);add(box(1,4,20),'chest','#2a2a33',[6,-2,-8],[0,0,.7])}
 if(k==='bone'){add(cone(1.9,24,6),'foreR','#f2efe6',[0,-14,-1.5],[Math.PI-.15,0,0]);add(cone(1.4,10,6),'foreL','#f2efe6',[0,-8,-1.5],[Math.PI-.4,0,0])}
 if(k==='claws')for(const s of['L','R'])for(const x of[-1.2,0,1.2])add(cone(.6,4.6,4),'hand'+s,'#f4f0e8',[x,-4.4,1.4],[Math.PI+.3,0,0]);
 if(k==='senbon')for(const x of[-1,0,1])add(cyl(.18,.18,9,4),'handR','#e8eef6',[x,-3,2.6],[1.2,0,0]);
 if(k==='chain')for(const s of['L','R'])for(let i=0;i<4;i++)add(tor(1.2,.4,8),'fore'+s,'#e8c860',[0,-1.5-i*2,0],[0,i*1.2,0]);
 // armes des styles de clan (toutes au corps à corps) : mains d'ombre, insectes, gantelets de sable, lianes épineuses, éventail fermé, kunai d'or, lames de papier, shuriken en main, glace
 if(k==='shadow')for(const s of['L','R']){add(sph(2.5,8,6),'hand'+s,'#0c0c12',[0,-2.4,.6],[0,0,0],[1.1,1.25,1.1]);for(const x of[-1.3,1.3])add(cone(.7,5.5,4),'fore'+s,'#14141c',[x,-5,0],[Math.PI+.25*x,0,0])}
 if(k==='bugs')for(const s of['L','R'])for(let i=0;i<7;i++){const a=i*.9;add(box(.9,.9,.9),'fore'+s,i%2?'#1a2218':'#3a4a30',[Math.cos(a)*2.9,-1-i*1.1,Math.sin(a)*2.9])}
 if(k==='sand')for(const s of['L','R']){add(sph(3,10,8),'hand'+s,'#d8b878',[0,-2.2,.6],[0,0,0],[1.15,1.05,1.15]);add(cyl(2.9,2.6,5,10),'fore'+s,'#c8a868',[0,-5.6,0])}
 if(k==='vine')for(const s of['L','R']){for(let i=0;i<3;i++)add(tor(2.4,.6,10),'fore'+s,'#3a6a2a',[0,-2-i*2.4,0],[Math.PI/2+.35,i*.8,0]);for(const x of[-1.2,0,1.2])add(cone(.55,4.2,4),'hand'+s,'#e8e0b0',[x,-4.2,1.2],[Math.PI+.3,0,0])}
 if(k==='fan'){add(box(1.6,15,2.2),'handR','#3a2a1e',[0,-6.5,1.4]);add(box(1.9,13,1.2),'handR','#f4ecd8',[0,-7,2.6]);add(cyl(.9,.9,2.6,8),'handR','#e0b84a',[0,-.5,1.4],[0,0,Math.PI/2])}
 if(k==='gold')for(const s of['L','R']){add(cyl(.7,.7,3.6,6),'hand'+s,'#8a6a20',[0,-2.8,1.2]);add(cone(1.7,8,4),'hand'+s,'#f0c040',[0,-8.6,1.2],[Math.PI,0,0])}
 if(k==='paper')for(const s of['L','R']){const x=s==='L'?2.8:-2.8;add(box(.5,15,4.2),'fore'+s,'#f6f3ea',[x,-8,0]);add(box(.6,2,4.4),'fore'+s,'#7a9ae0',[x,-2,0])}
 if(k==='shuriken'){add(cyl(1.6,1.6,.8,10),'handR','#3a3a44',[0,-3.6,1.6],[Math.PI/2,0,0]);for(let i=0;i<4;i++){const a=i*Math.PI/2;add(cone(1.4,6,4),'handR','#cfd3dd',[Math.cos(a)*3.6,-3.6+Math.sin(a)*3.6,1.6],[0,0,a-Math.PI/2])}}
 // armes des arbres Bukijutsu / Kenjutsu : bô (bâton long tenu au milieu), kusarigama (faucille + chaîne), tonfa (un par main, le long de l'avant-bras), ninjatô (lame courte tenue à l'envers)
 if(k==='staff'){add(cyl(1.1,1.1,64,8),'handR','#6a4a2a',[0,-1,8],[Math.PI/2,0,0]);for(const z of[39,-23])add(cyl(1.45,1.45,3,8),'handR','#e8c040',[0,-1,z],[Math.PI/2,0,0])}
 if(k==='kama'){add(cyl(.9,.9,12,6),'handR','#5a3a22',[0,-1,5],[Math.PI/2,0,0]);add(box(.5,6.5,1.6),'handR','#e4e8ee',[0,-4,11],[.35,0,0]);add(box(.5,4,1.3),'handR','#e4e8ee',[0,-7.4,9.4],[1.1,0,0]);for(let i=0;i<5;i++)add(tor(.9,.3,6),'handR','#9aa4b4',[0,-2-i*1.7,-1.5-i*1.2],[0,i*1.2,0])}
 if(k==='tonfa')for(const s of['L','R']){add(cyl(.8,.8,4.4,6),'hand'+s,'#3a2a1e',[0,-3,1.2]);add(box(2.3,15,2.3),'fore'+s,'#c8a070',[0,-4.5,3.6]);add(box(2.5,2,2.5),'fore'+s,'#3a2414',[0,-11.6,3.6])}
 if(k==='ninjato'){add(cyl(.8,.8,6,6),'handR','#2a2a33',[0,-1,1.5],[Math.PI/2,0,0]);add(box(2.4,2.4,.6),'handR','#3a3a44',[0,-1,-1.6]);add(box(1.4,.5,19),'handR','#e8ecf2',[0,-1,-11.5]);add(box(1,4,15),'chest','#2a2a33',[-6,-2,-8],[0,0,-.7])}
 if(k==='ice')for(const s of['L','R']){for(const [x,z,h] of[[-1.5,0,7],[1.3,.6,6],[0,-1.2,5.5]])add(cone(1.2,h,5),'fore'+s,'#7fc8f0',[x,-3-h*.2,z],[Math.PI-.5,0,x*.3]);add(sph(2.5,8,6),'hand'+s,'#bfe6ff',[0,-2,.6]);add(cone(1.5,11,5),'hand'+s,'#5ab4ec',[0,-8.5,1.2],[Math.PI,0,0])} // lame de glace bien bleue (lisible sur une tenue claire)
 // géométrie fusionnée + squelette
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('normal',new T.Float32BufferAttribute(N,3));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(SI,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(SW,4));
 G={geo,n:0,last:0};N3.geo.set(key,G)}
 G.n++;const geo=G.geo;
 const bones=BONES.map(([n,p],i)=>{const b=new T.Bone();b.name=n;b.position.set(...OFF[i]);return b});BONES.forEach(([n,p],i)=>{if(p)bones[BI[p]].add(bones[i])});
 const mat=new T.MeshToonMaterial({vertexColors:true,gradientMap:N3.gm});
 const mesh=new T.SkinnedMesh(geo,mat);mesh.add(bones[0]);const skel=new T.Skeleton(bones);mesh.bind(skel);mesh.frustumCulled=false;
 const out=new T.SkinnedMesh(geo,N3.outline);out.bind(skel,mesh.bindMatrix);out.frustumCulled=false;geo.boundingSphere||geo.computeBoundingSphere();mesh.boundingSphere=out.boundingSphere=geo.boundingSphere; // clé de tri seulement (évite le calcul skinné sur tous les sommets)
 const grp=new T.Group();grp.add(mesh);grp.add(out);
 // visage (yeux, bouche, marques, masque) et symbole du village : décalques sur la tête
 const face=new T.Mesh(N3.faceGeo,new T.MeshBasicMaterial({map:faceTexture(L),transparent:true,depthWrite:false}));
 face.position.set(0,8,0);face.scale.set(1.03,.97,.96);bones[BI.head].add(face);
 const bs0=h.bs==null?'front':h.bs,bs=HATS.has(h.acc)&&BAND_HEAD.has(bs0)?'':bs0,sym=new T.Mesh(N3.symGeo,new T.MeshBasicMaterial({map:symTexture(h.vil,bs0),transparent:true,depthWrite:false}));
 const SP={front:['head',[0,15.3,12.05],[-.32,0,0],1],barre:['head',[0,15.3,12.05],[-.32,0,0],1],cornes:['head',[0,15.3,12.05],[-.32,0,0],1],oblique:['head',[4.7,8.5,11.85],[-.05,.36,-.42],1.02],
  tete:['head',[0,20.95,10.75],[-.85,0,0],.86],cou:['chest',[0,5.75,8.45],[.3,0,0],.6],taille:['spine',[0,-.4,7.9],[0,0,0],.68],bras:['armL',[4.45,-3,0],[0,Math.PI/2,0],.36]}[bs];
 if(SP){sym.position.set(...SP[1]);sym.rotation.set(...SP[2]);sym.scale.setScalar(SP[3]);bones[BI[SP[0]]].add(sym)}
 else if(h.acc==='kage'){sym.material.map=signTexture('k:'+(L.hatK||'火'));sym.position.set(0,24.6,8.4);sym.rotation.set(-1.02,0,0);sym.scale.set(1.25,2.2,1);bones[BI.head].add(sym)} // kanji du village sur le chapeau de Kage
 else{sym.visible=false;bones[BI.head].add(sym)}
 // symbole dans le dos (ou kanji du haori de Hokage) : sur la cape, le haori ou le haut
 let bsym=null;const bk=L.sym?'s:'+L.sym:L.haori&&L.hkan?'h:'+L.hkan:''; // un symbole choisi passe avant le kanji du Hokage
 if(bk){bsym=new T.Mesh(N3.signGeo||(N3.signGeo=new T.PlaneGeometry(1,1)),new T.MeshBasicMaterial({map:signTexture(bk),transparent:true,depthWrite:false}));const bw=L.bw||1;
  if(L.cape&&!L.haori){bsym.position.set(0,-6.5,L.robe&&!L.rshort?-2.45:-.95);bsym.scale.set(9*bw,9,1);bones[BI.cape].add(bsym)}
  else{const HW=L.hov?(L.vest||L.armor||L.samurai||L.robe||L.belly?1.14:1.04):1,zb=L.haori?9.45*HW:L.samurai||L.robe?8.95:L.vest?8.55:L.armor?8.4:7.45,hk=bk[0]==='h';
   bsym.position.set(0,hk?-.6:1.75,-zb*(1+bw)/2);bsym.scale.set((hk?7:9.25)*bw,hk?13.75:9.25,1);bones[BI.chest].add(bsym)}
  bsym.rotation.set(0,Math.PI,0)}
 N3.sc.add(grp);
 const cur={};for(const [n] of BONES)cur[n]=new T.Quaternion();
 return{grp,mesh,out,mat,bones,skel,key,look:L,G,cur,rootP:new T.Vector3(),rootR:new T.Euler(),yaw:Math.PI/2-(u.aim||0),used:0,face,sym,bsym,k}}

// visage dessiné sur une petite toile (même style que le 2D : grands yeux à reflet, Sharingan, Byakugan…)
function faceTexture(L,mode='o'){const h=L.head,key=[h.eye,h.acc,h.kaguya,h.brows,h.skin,mode,h.face,h.eyeT,h.bs==='oblique',h.face==='rides'||h.face==='barbe'?h.hair:''].join('|');if(N3.faceTex.has(key))return N3.faceTex.get(key);
 // toile = devant de la tête (≈ 9,7 px par unité, centre de la tête en 128,100) : mêmes proportions que le visage 2D
 const c=document.createElement('canvas');c.width=256;c.height=200;const x=c.getContext('2d'),U=9.7,ex=128,hy=100,ey=hy+2.2*U;
 faceMarks(x,h,ex,hy,ey,U,3.2,0);
 for(const s of[-1,1]){const cx=ex+s*4.2*U;if(s>0&&h.bs==='oblique')continue;
  if(mode==='c'){x.strokeStyle='#1a1410';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(cx-2.4*U,ey+.4*U);x.quadraticCurveTo(cx,ey-1*U,cx+2.4*U,ey+.4*U);x.stroke();continue}
  if(mode==='s'){x.strokeStyle='#1a1410';x.lineWidth=3.5;x.beginPath();for(let k=0;k<26;k++){const a=k*.55,r=(k/26)*2.6*U;x.lineTo(cx+Math.cos(a*s)*r,ey+Math.sin(a*s)*r)}x.stroke();continue}
  if(mode==='x'){x.strokeStyle='#1a1410';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(cx-2*U,ey-2*U);x.lineTo(cx+2*U,ey+2*U);x.moveTo(cx+2*U,ey-2*U);x.lineTo(cx-2*U,ey+2*U);x.stroke();continue}
  if(eyeSpecial(x,h,cx+s*.3*U,ey,U,3.2))continue;
  x.fillStyle='#fff';x.strokeStyle='#1a1410';x.lineWidth=4;x.beginPath();x.ellipse(cx,ey,2.7*U,3.3*U,0,0,7);x.fill();x.stroke();
  const eye=h.eye||'#2a2a38',ix=cx+s*.5*U;
  if(h.eye==='#e8e8f8'){x.fillStyle='#d6d6ec';x.beginPath();x.ellipse(ix,ey+.3*U,1.9*U,2.6*U,0,0,7);x.fill();x.strokeStyle='#a8aed0';x.lineWidth=2;x.stroke()}
  else{x.fillStyle=eye;x.beginPath();x.ellipse(ix,ey+.3*U,1.8*U,2.5*U,0,0,7);x.fill();
   if(h.eye==='#e01a1a'){x.fillStyle='#111';x.beginPath();x.arc(ix,ey+.4*U,.6*U,0,7);x.fill();x.strokeStyle='#111';x.lineWidth=1.5;x.beginPath();x.arc(ix,ey+.4*U,1.2*U,0,7);x.stroke();for(let i=0;i<3;i++){const a=i*2.09+.5;x.beginPath();x.arc(ix+Math.cos(a)*1.2*U,ey+.4*U+Math.sin(a)*1.2*U,.38*U,0,7);x.fill()}}
   else{x.fillStyle='#0a0a12';x.beginPath();x.ellipse(ix,ey+.6*U,.9*U,1.4*U,0,0,7);x.fill()}}
  x.fillStyle='#fff';x.beginPath();x.arc(ix-.7*U,ey-1*U,.75*U,0,7);x.fill();x.beginPath();x.arc(ix+.6*U,ey+1.2*U,.35*U,0,7);x.fill()}
 if(h.brows){x.fillStyle='#111';for(const s of[-1,1])x.fillRect(ex+s*4.5*U-3*U,hy-4.2*U,6*U,2.2*U)}
 else if(h.face!=='gaara'){x.strokeStyle='#3a2a20';x.lineWidth=4;x.lineCap='round';for(const s of[-1,1]){x.beginPath();x.moveTo(ex+s*2.4*U,hy-2.6*U);x.lineTo(ex+s*6.2*U,hy-3.1*U);x.stroke()}}
 if(h.kaguya){x.fillStyle='#c22';for(const s of[-1,1]){x.beginPath();x.arc(ex+s*3*U,hy-4.4*U,.8*U,0,7);x.fill()}}
 x.strokeStyle='#5a3020';x.lineWidth=3.5;x.lineCap='round';x.beginPath();x.moveTo(ex-1.5*U,hy+6.8*U);x.quadraticCurveTo(ex,hy+7.4*U,ex+1.5*U,hy+6.8*U);x.stroke();
 faceMarks(x,h,ex,hy,ey,U,3.2,1);
 if(h.acc==='anbu'){x.fillStyle='#f2f0ea';x.strokeStyle='#1a1410';x.lineWidth=4;x.beginPath();x.ellipse(ex,hy+1.6*U,10.4*U,9.6*U,0,0,7);x.fill();x.stroke();x.fillStyle='#1a1414';for(const s of[-1,1]){x.beginPath();x.ellipse(ex+s*4*U,ey-.6*U,2*U,1.3*U,0,0,7);x.fill()}
  x.strokeStyle='#c02a2a';x.lineWidth=5;x.lineCap='round';for(const s of[-1,1]){x.beginPath();x.moveTo(ex+s*2*U,hy-5*U);x.lineTo(ex+s*3.6*U,hy-1.6*U);x.moveTo(ex+s*6.6*U,hy+4*U);x.lineTo(ex+s*4.6*U,hy+7*U);x.stroke()}}
 accFace(x,h,ex,hy,ey,U,4);
 if(h.acc==='oinin')yu_mask(x,ex,hy,U,4); // clan Yuki : masque de chasseur de déserteurs (kits/yuki.js)
 if(h.acc==='lunettes'){x.fillStyle='rgba(30,30,40,.93)';for(const s of[-1,1]){x.beginPath();x.roundRect(ex+s*4.2*U-3.1*U,ey-2.1*U,6.2*U,4.2*U,1.2*U);x.fill()}x.fillRect(ex-1.3*U,ey-.6*U,2.6*U,1*U)}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;N3.faceTex.set(key,t);return t}
function signTexture(k){N3.signTex||(N3.signTex=new Map());if(N3.signTex.has(k))return N3.signTex.get(k);const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 if(k[0]==='h'){const ch=[...k.slice(2)];c.height=256;x.fillStyle='#c0201a';x.font='bold 100px serif';x.textAlign='center';x.textBaseline='middle';ch.forEach((q,i)=>x.fillText(q,64,128+(i-(ch.length-1)/2)*112))}
 else if(k[0]==='k'){x.fillStyle='#ffffff';x.font='bold 104px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(k.slice(2),64,70)}
 else drawSign(x,k.slice(2),64,64,54,1.4);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;N3.signTex.set(k,t);return t}
function symTexture(v,bs){const sk=v+'|'+(bs==='barre'||bs==='cornes'?bs:'');if(N3.symTex.has(sk))return N3.symTex.get(sk);const c=document.createElement('canvas');c.width=96;c.height=56;const x=c.getContext('2d');const ex=48,hy=28;
 x.strokeStyle='#3a3f4a';x.lineWidth=4;x.lineCap='round';x.beginPath();
 switch(v){case 0:x.arc(ex,hy,10,0,5.2);x.moveTo(ex+9,hy-2);x.lineTo(ex+19,hy-11);break;case 1:x.moveTo(ex-14,hy-12);x.lineTo(ex+14,hy+12);x.moveTo(ex+14,hy-12);x.lineTo(ex-14,hy+12);break;
  case 2:for(let q=0;q<4;q++){x.moveTo(ex-14+q*9,hy-12);x.lineTo(ex-14+q*9,hy+12)}break;case 3:x.arc(ex-8,hy,7,0,7);x.moveTo(ex+15,hy);x.arc(ex+8,hy,7,0,7);break;
  case 4:x.moveTo(ex-15,hy+12);x.lineTo(ex-5,hy-12);x.lineTo(ex+5,hy+12);x.lineTo(ex+15,hy-12);break;case 5:x.arc(ex-4,hy+5,6,0,7);x.moveTo(ex+3,hy+5);x.lineTo(ex+3,hy-13);break;
  case 7:x.moveTo(ex-15,hy-12);x.lineTo(ex+15,hy-12);for(let q=0;q<4;q++){x.moveTo(ex-11+q*7.3,hy-5);x.lineTo(ex-11+q*7.3,hy+13)}break;
  case 8:for(let q=0;q<2;q++){x.moveTo(ex-15,hy-5+q*11);x.quadraticCurveTo(ex-7.5,hy-12+q*11,ex,hy-5+q*11);x.quadraticCurveTo(ex+7.5,hy+2+q*11,ex+15,hy-5+q*11)}break;
  default:x.arc(ex,hy,10,0,5.2)}
 if(bs==='cornes'){x.beginPath();x.fillStyle='#3a3f4a';x.font='bold 34px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('油',ex,hy+2)}else x.stroke();
 if(v===6||bs==='barre'){x.strokeStyle='#b22';x.lineWidth=4;x.beginPath();x.moveTo(ex-28,hy-2);x.lineTo(ex+28,hy+3);x.stroke()}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;N3.symTex.set(sk,t);return t}

// ----- poses : chaque image, on calcule une pose cible d'après l'état du ninja, puis chaque os la rejoint en douceur
// Passe d'animation : la pose est un objet gardé par ninja (aucune allocation par image) ; couches dans l'ordre :
// locomotion (repos, course, course ninja, marche arrière, pas chassés, dash, saut) → actions (garde, parade, chakra, incantation par élément,
// libération, combo, étourdi) → animation nommée d'un kit (ANIM) → réactions (recul orienté, chancellement, réception) → chute / relevé / mort.
// Tout est lu dans des champs déjà synchronisés (flash, hp, airT, stun, cast, relT, deadT, parry, vx/vy…) : même rendu chez l'hôte et les invités.
const E3=(P,b)=>P[b]||(P[b]={x:0,y:0,z:0});
const ezo=x=>1-(1-x)*(1-x),ezio=x=>x<.5?2*x*x:1-(-2*x+2)**2/2,bump=x=>Math.sin(Math.PI*Math.min(1,Math.max(0,x)));
// petites aides de pose pour les animations nommées
const pz=(P,b,x=0,y=0,z=0)=>{const o=E3(P,b);o.x=x;o.y=y;o.z=z;return o},padd=(P,b,x=0,y=0,z=0)=>{const o=E3(P,b);o.x+=x;o.y+=y;o.z+=z;return o};
// c01 borne à [0,1], smt transition douce, pzl rapproche un os de (x,y,z) avec le mélange k ; anW élan (monte puis retombe) / anK frappe (part après l'élan)
const c01=x=>x<0?0:x>1?1:x,smt=(a,b,x)=>{const k=c01((x-a)/(b-a));return k*k*(3-2*k)},pzl=(P,b,x,y,z,k)=>{const o=E3(P,b);o.x+=(x-o.x)*k;o.y+=(y-o.y)*k;o.z+=(z-o.z)*k;return o};
const anW=(e,a)=>e<a?ezo(e/a):Math.max(0,1-(e-a)/.1),anK=(e,a,d=.14)=>e<a?0:ezo(c01((e-a)/d));
const PBN=BONES.map(b=>b[0]).filter(n=>n!=='root');
function poseNew(){const P={root:{x:0,y:0,z:0},rootR:{x:0,y:0,z:0}};for(const n of PBN)P[n]={x:0,y:0,z:0};return P}
function poseClr(P){for(const n in P){const o=P[n];if(o&&typeof o==='object'){o.x=0;o.y=0;o.z=0}}return P}
// ---- mudras : mains jointes devant le sternum (sous la caméra, elles se lisent sur le torse), chaque famille de signe a sa forme
// [hauteur, croisement des bras, torsion des mains, flexion des mains, décalage gauche/droite]
const MUDF={up:[.14,0,0,-.55,0],up1:[.2,.06,.35,-.65,.18],clasp:[-.1,.14,0,.25,0],side:[0,0,1.2,-.2,.22],fist:[-.04,.1,0,.55,-.12],wing:[.06,-.32,-.7,-.35,0],
 flat:[-.16,.06,0,.95,.28],down:[-.2,.1,0,1.15,0],tri:[.24,0,0,-.95,0],cross:[.03,.32,.65,0,0]};
// (gardé pour compatibilité : anciens repères des 12 signes)
const MUDP=[[-1.25,-.62,-1.75,-1.25,.62,-1.75],[-1.2,-.5,-1.55,-1.05,.7,-1.9],[-.95,-.6,-1.35,-.95,.6,-1.35],[-1.35,-.45,-1.4,-1.35,.45,-1.4],[-1.5,-.7,-1.9,-.9,.4,-1.4],[-1.45,-.25,-1.6,-1.45,.25,-1.6],
 [-1,-.65,-1.5,-1.25,.4,-1.7],[-.9,-.55,-1.1,-.9,.55,-1.1],[-1.6,-.6,-1.95,-1.6,.6,-1.95],[-1.2,-.8,-1.6,-1.2,.8,-1.6],[-1.05,-.3,-1.5,-1.4,.7,-1.85],[-.95,-.5,-1.45,-1.2,.65,-1.7]];
const mudF=sg=>MUDF[sg&&sg[3]]||MUDF.clasp;
function mudraPose(P,md,t){const B=mudF(md.sg),Aq=md.pv?mudF(md.pv):MUDF.clasp,e=ezo(c01(md.q/.32)),m=i=>Aq[i]+(B[i]-Aq[i])*e;
 const h=m(0),c=m(1),tw=m(2),fl=m(3),off=m(4),sep=md.q<.3?bump(md.q/.3):0; // à chaque signe : les mains s'écartent puis claquent ensemble
 const ax=-.88-h*1.1+sep*.14,az=1.02+c-sep*.38,fo=-1.32-h*.5;
 pz(P,'armL',ax-off*.25,0,-az);pz(P,'foreL',fo+off*.3);pz(P,'handL',fl,tw,0);pz(P,'armR',ax+off*.25,0,az);pz(P,'foreR',fo-off*.3);pz(P,'handR',fl,-tw,0);
 padd(P,'head',.05+.08*sep,0,0);padd(P,'chest',.08+.05*sep);P.root.y-=.9*sep}
// ---- catégorie d'animation d'un jutsu, déduite de ses données (élément visuel, famille, arbre, préfixe du kit) : gardée par clé
const ASC=new Map();
function anStyle(ab){if(!ab)return'chakra';const key=ab.key||ab.n||'?';let s=ASC.get(key);if(s===undefined){try{s=anStyle0(ab)}catch(e){s='chakra'}ASC.set(key,s)}return s}
function anStyle0(ab){const k=ab.key||'',v=ab.vfx||'',p=k.split('_')[0],tr=ab.tree||'',n=(ab.n||'').toLowerCase(),e=(typeof fxPal==='function'&&(fxPal(v)||{}).e)||'';
 if(tr==='f3'||/kuchiyose|invocation|invoque/.test(n))return'summon';
 if(v==='rasengan'||v==='rasenshuriken')return'orb';
 if(v==='kirin')return'kirin';if(v==='chidori')return'raiton';
 if(v==='tsukuyomi'||v==='black'||v==='mind'||v==='flower'||tr==='f2'||e==='genjutsu'||p==='kr'||e==='blood')return'gen';
 if(v==='gate'||v==='susano'||v==='ak_bf'||v==='sage'&&p!=='sub')return'power';
 if(v==='fox')return'beast';
 if(tr==='f0'||v==='heal')return'heal';
 if(tr==='f6'||v==='sage'||p==='jg')return'sage';
 if(tr==='f5')return'clone';
 if(v==='kunai'||v==='shuriken'||v==='senbon'||tr==='f4'||v==='tag'&&p==='sub')return'throw';
 if(v==='jyuken'||v==='byakugan'||v==='kaiten'||v==='hakke64'||p==='hy')return'jyuken';
 if(v==='tai'||v==='peacock'||v==='claws'||v==='gatsuga'||p==='tj'||p==='tai'||p==='in'||v==='leaf'&&p!=='hk'&&p!=='sj')return'tai';
 if(v==='steel'||p==='ken'||p==='kj'||p==='hz'&&e==='metal')return'blade';
 if(tr==='f1'||e==='seal'||v==='hiraishin'||v==='seal'||v==='chain'||v==='tag')return'seal';
 if(p==='sg'||v==='sg_pup')return'puppet';
 if(v==='shadow'||p==='na')return'shadow';
 if(v==='bugs'||p==='ab')return'bugs';
 if(e==='sand'||p==='sa'||p==='gd'||p==='ji'||p==='km')return'sand';
 if(p==='bt')return'blast';if(p==='sk'||p==='jn'||p==='ot')return'orb';
 if(e==='fire'||p==='ib'||p==='ft')return'katon';
 if(e==='water')return'suiton';if(e==='wind')return'futon';if(e==='lightning')return'raiton';
 if(p==='kg')return'bone';if(e==='earth')return'doton';if(e==='ice')return'ice';if(e==='steam')return'clone';
 if(e==='dark')return'shadow';if(e==='metal')return'blade';return'chakra'}
// ---- incantation : posture du corps (s, installée vite) + préparation des bras propre à l'élément (b : 0 pendant les mudras → 1 juste avant le lancer)
// k = avancement de l'incantation, S = 1 pour un rang S (anticipation plus forte), t = temps (frémissements)
const legsW=(P,s,d=1)=>{pzl(P,'thighL',-.18,0,.24*d,s);pzl(P,'thighR',.1,0,-.24*d,s);pzl(P,'shinL',.42*d,0,0,s);pzl(P,'shinR',.38*d,0,0,s);P.root.y-=2.4*d*s};
const legsF=(P,s,d=1)=>{pzl(P,'thighL',-.55*d,0,.1,s);pzl(P,'shinL',.6*d,0,0,s);pzl(P,'thighR',.38*d,0,-.1,s);pzl(P,'shinR',.55*d,0,0,s);P.root.y-=2.6*d*s};
const CSP={
 katon:(P,k,b,s,t)=>{legsF(P,s,.8);pzl(P,'chest',-.32*k,.15,0,s);pzl(P,'head',-.28*k,0,0,s);P.root.z-=3.5*k*s; // inspire : le buste se gonfle et part en arrière
  pzl(P,'armR',-1.38,0,.5,b);pzl(P,'foreR',-2.45,0,0,b);pzl(P,'handR',-.4,0,0,b);pzl(P,'armL',-.5,0,.28,b);pzl(P,'foreL',-1,0,0,b)}, // main au bord des lèvres
 suiton:(P,k,b,s,t)=>{legsW(P,s,1.1);P.rootR.z+=Math.sin(t*3.2)*.05*s;const f=k*Math.PI*1.6;
  pzl(P,'armL',-1.3+.7*Math.sin(f),0,.6+.55*Math.cos(f),b);pzl(P,'foreL',-.6,0,0,b);pzl(P,'armR',-1.3+.7*Math.sin(f+2.2),0,-.6-.55*Math.cos(f+2.2),b);pzl(P,'foreR',-.7,0,0,b);pzl(P,'chest',.12,0,0,s)}, // bras qui tournent comme un courant
 futon:(P,k,b,s,t)=>{legsF(P,s);pzl(P,'chest',.1,.75*k+.1,0,s);pzl(P,'head',0,-.45*k,0,s); // buste tordu, bras ramenés sur le côté (le balayage part au lancer)
  pzl(P,'armR',.55,0,-1.15,b);pzl(P,'foreR',-.4,0,0,b);pzl(P,'armL',-1.2,0,-1.3,b);pzl(P,'foreL',-.5,0,0,b)},
 raiton:(P,k,b,s,t)=>{legsF(P,s,1.5);pzl(P,'chest',.45,-.3,0,s);pzl(P,'head',-.35,0,0,s);const cr=Math.sin(t*61)*.07*b; // bras chargé en bas, l'autre main tient le poignet
  pzl(P,'armR',.5+cr,0,-.28,b);pzl(P,'foreR',-.3,0,0,b);pzl(P,'handR',-.3,cr*3,0,b);pzl(P,'armL',-.4,0,-.95,b);pzl(P,'foreL',-1.15,0,0,b)},
 kirin:(P,k,b,s,t)=>{legsW(P,s);pzl(P,'armR',-3,0,.12,b);pzl(P,'foreR',-.1,0,0,b);pzl(P,'armL',-.4,0,.6,b);pzl(P,'head',-.45*k,0,0,s);pzl(P,'chest',-.2,0,0,s)},
 doton:(P,k,b,s,t)=>{legsW(P,s,1.6);pzl(P,'chest',.22,0,0,s); // garde de sumo, bras levés : les paumes s'abattent au lancer
  pzl(P,'armL',-2.75,0,.3,b);pzl(P,'foreL',-.45,0,0,b);pzl(P,'handL',.6,0,0,b);pzl(P,'armR',-2.75,0,-.3,b);pzl(P,'foreR',-.45,0,0,b);pzl(P,'handR',.6,0,0,b);P.root.y+=2.5*b},
 bone:(P,k,b,s,t)=>{legsF(P,s);pzl(P,'chest',.1,.45,0,s);pzl(P,'armR',-2,0,.95,b);pzl(P,'foreR',-1.85,0,0,b);pzl(P,'armL',.25,0,.45,b);pzl(P,'foreL',-.3,0,0,b)}, // la main va chercher l'os à l'épaule
 orb:(P,k,b,s,t)=>{legsF(P,s);pzl(P,'chest',.15,-.28,0,s);const c=t*14; // paume ouverte vers le haut, l'autre main tourne au-dessus
  pzl(P,'armR',-1.35,0,.12,b);pzl(P,'foreR',-.65,0,0,b);pzl(P,'handR',.9,0,0,b);pzl(P,'armL',-1.45+.1*Math.sin(c),0,-.8+.12*Math.cos(c),b);pzl(P,'foreL',-1.05,0,0,b);pzl(P,'head',.1,0,0,s)},
 summon:(P,k,b,s,t)=>{if(k<.45){legsF(P,s,.6);pzl(P,'armR',-1.38,0,.5,b);pzl(P,'foreR',-2.5,0,0,b);pzl(P,'head',.12,.2,0,s);pzl(P,'armL',-.3,0,.3,b);return} // pouce mordu
  const d=ezo(c01((k-.45)/.2));P.root.y-=10*d;pzl(P,'thighL',-1.25,0,.1,d);pzl(P,'shinL',2.05,0,0,d);pzl(P,'thighR',.3,0,-.1,d);pzl(P,'shinR',1.9,0,0,d);pzl(P,'chest',.75,0,0,d); // paume au sol
  pzl(P,'armR',-1,0,.1,d);pzl(P,'foreR',-.1,0,0,d);pzl(P,'handR',-1,0,0,d);pzl(P,'armL',.25,0,.55,d);pzl(P,'foreL',-.5,0,0,d);pzl(P,'head',-.25,0,0,d)},
 gen:(P,k,b,s,t)=>{pzl(P,'head',.2-.32*k,.08*Math.sin(t*1.7),0,s);P.rootR.z+=Math.sin(t*2.2)*.03*s; // deux doigts dressés devant le visage, regard qui se relève
  pzl(P,'armL',-1.55,0,-.42,b);pzl(P,'foreL',-1.9,0,0,b);pzl(P,'handL',-.35,0,0,b);pzl(P,'armR',.25,0,-.5,b);pzl(P,'foreR',-1.55,0,0,b);pzl(P,'thighL',-.15,0,.12,s);pzl(P,'shinL',.2,0,0,s)},
 heal:(P,k,b,s,t)=>{const p=Math.sin(t*8)*.05;P.root.y-=2.2*s;pzl(P,'chest',.25,0,0,s);pzl(P,'head',.12,0,0,s);legsW(P,s,.7); // paumes tendues vers le bas, qui « chauffent »
  pzl(P,'armL',-1.08+p,0,-.22,b);pzl(P,'foreL',-.45,0,0,b);pzl(P,'handL',.55,0,0,b);pzl(P,'armR',-1.08-p,0,.22,b);pzl(P,'foreR',-.45,0,0,b);pzl(P,'handR',.55,0,0,b)},
 clone:(P,k,b,s,t)=>{legsW(P,s,1.2);pzl(P,'chest',.08,0,0,s); // signe en croix du Kage Bunshin
  pzl(P,'armL',-1.05,0,-.85,b);pzl(P,'foreL',-1.45,0,0,b);pzl(P,'handL',-.85,0,0,b);pzl(P,'armR',-.9,0,1.05,b);pzl(P,'foreR',-1.5,0,0,b);pzl(P,'handR',.2,1.2,0,b)},
 seal:(P,k,b,s,t)=>{legsF(P,s);pzl(P,'chest',.2,.3,0,s); // main armée à la hanche, l'autre forme un signe d'une main
  pzl(P,'armR',.4,0,-.22,b);pzl(P,'foreR',-1.45,0,0,b);pzl(P,'handR',-.6,0,0,b);pzl(P,'armL',-1.15,0,-.5,b);pzl(P,'foreL',-1.65,0,0,b);pzl(P,'handL',-.4,0,0,b)},
 throw:(P,k,b,s,t)=>{legsF(P,s,.8);pzl(P,'chest',-.25,.55,0,s);pzl(P,'head',0,-.4,0,s); // bras armé derrière la tête, l'autre vise
  pzl(P,'armR',-2.7,0,-.2,b);pzl(P,'foreR',-1.6,0,0,b);pzl(P,'armL',-1.5,0,-.1,b);pzl(P,'foreL',-.12,0,0,b)},
 blade:(P,k,b,s,t)=>{legsF(P,s,1.5);pzl(P,'chest',.35,-.32,0,s);pzl(P,'head',-.2,.25,0,s); // iai : main sur la poignée à la hanche gauche
  pzl(P,'armR',-.45,0,.85,b);pzl(P,'foreR',-1.25,0,0,b);pzl(P,'handR',.4,0,0,b);pzl(P,'armL',-.2,0,-.3,b);pzl(P,'foreL',-1,0,0,b)},
 tai:(P,k,b,s,t)=>{legsF(P,s,1.3);P.root.y+=Math.sin(t*9)*.6*s;pzl(P,'chest',.2,-.2,0,s); // garde de combat qui sautille
  pzl(P,'armL',-1.45,0,.08,b);pzl(P,'foreL',-.35,0,0,b);pzl(P,'handL',-.6,0,0,b);pzl(P,'armR',-.8,0,-.15,b);pzl(P,'foreR',-2,0,0,b)},
 jyuken:(P,k,b,s,t)=>{legsW(P,s,1.6);pzl(P,'thighL',-.6,0,.3,s);pzl(P,'chest',.25,-.45,0,s); // garde Hyûga : paume avant tendue, paume arrière haute
  pzl(P,'armL',-1.5,0,.05,b);pzl(P,'foreL',-.15,0,0,b);pzl(P,'handL',-.9,0,0,b);pzl(P,'armR',-1.9,0,-.5,b);pzl(P,'foreR',-1,0,0,b);pzl(P,'handR',-.9,0,0,b)},
 power:(P,k,b,s,t)=>{legsW(P,s,1.5);const f=smt(.55,.8,k),tr=Math.sin(t*47)*.03*b; // bras croisés qui rassemblent, puis s'ouvrent d'un coup
  pzl(P,'armL',-1.3+.8*f+tr,0,-.7+1.8*f,b);pzl(P,'foreL',-1.6+.3*f,0,0,b);pzl(P,'armR',-1.3+.8*f-tr,0,.7-1.8*f,b);pzl(P,'foreR',-1.6+.3*f,0,0,b);pzl(P,'chest',.35-.6*f,0,0,s);pzl(P,'head',.3-.65*f,0,0,s)},
 beast:(P,k,b,s,t)=>{P.root.y-=9*s;pzl(P,'chest',1,0,0,s);pzl(P,'head',-.7,0,0,s);pzl(P,'thighL',-1.1,0,.2,s);pzl(P,'shinL',1.8,0,0,s);pzl(P,'thighR',-.7,0,-.2,s);pzl(P,'shinR',1.6,0,0,s);
  pzl(P,'armL',-.95,0,.3,b);pzl(P,'foreL',-.3,0,0,b);pzl(P,'armR',-.95,0,-.3,b);pzl(P,'foreR',-.3,0,0,b)}, // à quatre pattes
 sage:(P,k,b,s,t)=>{P.root.y-=6*s;pzl(P,'thighL',-.9,0,.55,s);pzl(P,'shinL',1.7,0,0,s);pzl(P,'thighR',-.9,0,-.55,s);pzl(P,'shinR',1.7,0,0,s);pzl(P,'head',.3,0,0,s); // méditation accroupie
  pzl(P,'armL',-.75,0,-.98,b);pzl(P,'foreL',-1.2,0,0,b);pzl(P,'armR',-.75,0,.98,b);pzl(P,'foreR',-1.2,0,0,b)},
 shadow:(P,k,b,s,t)=>{P.root.y-=5*s;pzl(P,'chest',.45,0,0,s);pzl(P,'thighL',-.9,0,.15,s);pzl(P,'shinL',1.35,0,0,s);pzl(P,'thighR',-.3,0,-.15,s);pzl(P,'shinR',1.2,0,0,s); // signe du rat, accroupi
  pzl(P,'armL',-.95,0,-1.02,b);pzl(P,'foreL',-1.35,0,0,b);pzl(P,'armR',-.95,0,1.02,b);pzl(P,'foreR',-1.35,0,0,b);pzl(P,'head',-.15,0,0,s)},
 bugs:(P,k,b,s,t)=>{legsW(P,s,.8);pzl(P,'armL',-.6,0,1,b);pzl(P,'foreL',-.4,0,0,b);pzl(P,'handL',.5,0,0,b);pzl(P,'armR',-.6,0,-1,b);pzl(P,'foreR',-.4,0,0,b);pzl(P,'handR',.5,0,0,b);pzl(P,'chest',-.1,0,0,s)}, // bras ouverts, l'essaim sort des manches
 sand:(P,k,b,s,t)=>{legsW(P,s,.9);const r=-1.1-.7*k; // les mains soulèvent la matière (sable, or, fer, papier)
  pzl(P,'armL',r,0,.45,b);pzl(P,'foreL',-.5,0,0,b);pzl(P,'handL',.65,0,0,b);pzl(P,'armR',r,0,-.45,b);pzl(P,'foreR',-.5,0,0,b);pzl(P,'handR',.65,0,0,b);pzl(P,'head',-.12*k,0,0,s)},
 puppet:(P,k,b,s,t)=>{legsF(P,s,.7);const w=Math.sin(t*21)*.08; // doigts tendus : les fils de chakra
  pzl(P,'armL',-1.4,0,.25,b);pzl(P,'foreL',-.9,0,0,b);pzl(P,'handL',-.5+w,0,0,b);pzl(P,'armR',-1.6,0,-.25,b);pzl(P,'foreR',-.7,0,0,b);pzl(P,'handR',-.5-w,0,0,b)},
 blast:(P,k,b,s,t)=>{legsF(P,s);pzl(P,'chest',.15,0,0,s);pzl(P,'armL',-1.3,0,-.38,b);pzl(P,'foreL',-1,0,0,b);pzl(P,'armR',-1.3,0,.38,b);pzl(P,'foreR',-1,0,0,b);pzl(P,'handL',.4,0,0,b);pzl(P,'handR',.4,0,0,b)},
 ice:(P,k,b,s,t)=>{legsF(P,s,1.2);pzl(P,'armR',-1.5,0,.38,b);pzl(P,'foreR',-1.9,0,0,b);pzl(P,'handR',-.35,0,0,b);pzl(P,'armL',-1.2,0,-.1,b);pzl(P,'foreL',-.3,0,0,b);pzl(P,'handL',-.6,0,0,b)}, // signe d'une main, paume glacée devant
 chakra:(P,k,b,s,t)=>{legsW(P,s);const o=.3*k; // deux mains qui rassemblent le chakra puis s'écartent
  pzl(P,'armL',-1.2,0,-.3+o,b);pzl(P,'foreL',-1.2,0,0,b);pzl(P,'armR',-1.2,0,.3-o,b);pzl(P,'foreR',-1.2,0,0,b);pzl(P,'chest',.1,0,0,s)},
};
function castPose(u,P,t,A){const c=u.cast,ab=castAb(u,c),k=c01(c.t/(c.dur||1)),st=A.cs||anStyle(ab),S=ab&&ab.rank==='S'?1:0,md=typeof mudraOf==='function'?mudraOf(u):null,s=ezo(c01(k/.22));
 let b;if(md){mudraPose(P,md,t);b=smt(1-Math.min(.3,.9/md.n),1,k);legsW(P,s,.8)}else{b=ezo(c01(k/.35));pz(P,'armL',-.5,0,.2);pz(P,'armR',-.5,0,-.2)}
 (CSP[st]||CSP.chakra)(P,k,b,s,t,u);
 if(S){const f=smt(.5,1,k);P.root.y-=2.5*s;P.root.x+=Math.sin(t*53)*.35*f;padd(P,'head',-.15*f);padd(P,'chest',-.1*f)}} // rang S : posture plus basse et frémissement qui monte
// ---- libération du jutsu (0,3 s après le lancer) quand le kit n'a pas sa propre animation
function relPose(u,P,st,e){const p=e<.22?ezo(e/.22):1-(e-.22)/.78*.7;
 switch(st){
 case'katon':case'blast':pz(P,'armR',-1.38,0,.5);pz(P,'foreR',-2.45);pz(P,'armL',-.5,0,.3);pz(P,'foreL',-1);pz(P,'chest',.4*p);pz(P,'head',.15*p);P.root.z=4*p;legsF(P,p);return;
 case'futon':{const k=ezo(c01(e/.3));pz(P,'armR',-1.45,0,lrp(-.7,.9,k));pz(P,'foreR',-.2);pz(P,'armL',-1.3,0,lrp(-1,.6,k));pz(P,'foreL',-.3);pz(P,'chest',.15,lrp(.6,-.7,k));legsF(P,p);return}
 case'raiton':case'tai':case'seal':pz(P,'armR',-1.62*p,0,.05);pz(P,'foreR',0);pz(P,'handR',st==='seal'?-1:0);pz(P,'armL',.45*p,0,.4);pz(P,'chest',.4*p,.35*p);P.root.z=8*p;legsF(P,p,1.3);return;
 case'doton':case'bone':P.root.y=-9*p;pz(P,'chest',.85*p);pz(P,'armL',-.95,0,-.12);pz(P,'foreL',-.1);pz(P,'handL',-1.1);pz(P,'armR',-.95,0,.12);pz(P,'foreR',-.1);pz(P,'handR',-1.1);
  pz(P,'thighL',-1.15*p,0,.25);pz(P,'shinL',1.85*p);pz(P,'thighR',.25*p,0,-.25);pz(P,'shinR',1.6*p);return;
 case'kirin':{const k=ezo(c01(e/.25));pz(P,'armR',lrp(-3,-1.2,k),0,.1);pz(P,'foreR',-.1);pz(P,'chest',.4*k);pz(P,'armL',.3,0,.5);legsF(P,p);return}
 case'gen':pz(P,'armL',-1.55*p-.05,0,-.05);pz(P,'foreL',-.1);pz(P,'handL',-.6);pz(P,'head',-.05);pz(P,'armR',.2,0,-.4);return;
 case'throw':{const k=ezo(c01(e/.2));pz(P,'armR',lrp(-2.7,-1.2,k),0,.1);pz(P,'foreR',lrp(-1.6,-.1,k));pz(P,'chest',.25,-.45*k);pz(P,'armL',.5,0,.35);legsF(P,p);return}
 case'blade':{const k=ezo(c01(e/.2));pz(P,'armR',-1.5,0,lrp(.85,-.95,k));pz(P,'foreR',-.15);pz(P,'handR',1.3);pz(P,'chest',.3,lrp(-.3,-.6,k));P.root.z=10*p;legsF(P,p,1.4);return}
 case'summon':case'shadow':case'sage':case'beast':return; // la posture d'incantation tient (lissée par les os)
 case'power':pz(P,'armL',-.4,0,1.3*p);pz(P,'armR',-.4,0,-1.3*p);pz(P,'chest',-.4*p);pz(P,'head',-.45*p);legsW(P,p);return;
 }
 pz(P,'armL',-1.5*p-.1,0,-.2*p);pz(P,'armR',-1.5*p-.1,0,.2*p);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'handL',-.6*p);pz(P,'handR',-.6*p);pz(P,'chest',.2*p);P.root.z=4*p;pz(P,'thighR',-.5*p);pz(P,'shinR',.3*p)}
function basePose(u,t,rec,P,A){A=A||rec.A||{ph:0};const mv=u.moving&&!u.dead,air=(u.z||0)>4||u.airT>0,ph=A.ph||0;
 if(!P.root)P.root={x:0,y:0,z:0};if(!P.rootR)P.rootR={x:0,y:0,z:0};
 if(u.dead)return P;
 // sens de la course par rapport à la visée : avant, arrière (jambes à l'envers), pas chassés (corps penché)
 let fw=1,sd=0;if(mv){const vx=u.vx||0,vy=u.vy||0,sp=Math.hypot(vx,vy);if(sp>15){const ca=Math.cos(u.aim||0),sa=Math.sin(u.aim||0);fw=(vx*ca+vy*sa)/sp;sd=(vy*ca-vx*sa)/sp}}
 const run=mv?(u.dash||u.haste>0||u.sprint?2:1):0;
 // repos : respiration, regard qui balaie, poids qui passe d'une jambe à l'autre (phase propre à chaque ninja : une armée ne respire pas en rythme)
 const br=Math.sin(t*2.1+ph);pz(P,'chest',.03*br);pz(P,'head',-.04*br,Math.sin(t*.7+ph)*.1+Math.sin(t*.29+ph*2)*.12);pz(P,'armL',.05*br,0,.14);pz(P,'armR',.05*br,0,-.14);pz(P,'foreL',-.25);pz(P,'foreR',-.25);P.root.y=.35*br;
 if(!run&&state==='fight'){const ws=Math.sin(t*1.25+ph);P.root.y-=.9;pz(P,'thighL',-.12,0,.1);pz(P,'thighR',.08,0,-.1);pz(P,'shinL',.24);pz(P,'shinR',.2);pz(P,'hips',0,.07*ws,.03*ws);padd(P,'chest',.04,-.07*ws);pz(P,'foreL',-.45);pz(P,'foreR',-.4)}
 if(run){const back=fw<-.35,nin=run>1&&fw>.3,spr=nin&&u.sprint,w=back?-(u.walk||0):(u.walk||0),a=nin?(spr?1.22:1.08):back?.6:.8,s=Math.sin(w),c=Math.cos(w);
  pz(P,'thighL',-s*a,0,0);pz(P,'thighR',s*a,0,0);pz(P,'shinL',.25+Math.max(0,Math.sin(w-1.1))*(nin?1.45:1.25));pz(P,'shinR',.25+Math.max(0,Math.sin(w+Math.PI-1.1))*(nin?1.45:1.25));
  pz(P,'footL',-.2*s);pz(P,'footR',.2*s);P.root.y=Math.abs(c)*(nin?1.3:1.6)-(nin?2:.6);pz(P,'hips',0,s*.16);
  if(nin){const L=spr?.74:.56;pz(P,'chest',L,-s*.1);pz(P,'spine',.2);pz(P,'head',-L*.8);pz(P,'armL',1.18+.08*s,0,.24);pz(P,'armR',1.18-.08*s,0,-.24);pz(P,'foreL',-.08);pz(P,'foreR',-.08);pz(P,'handL',.4);pz(P,'handR',.4);pz(P,'cape',-1.15);pz(P,'cape2',-.4)} // course ninja : buste couché, bras tendus en arrière
  else if(back){pz(P,'chest',-.12,-s*.08);pz(P,'head',.08);pz(P,'armL',-.7+s*.25,0,.15);pz(P,'armR',-.7-s*.25,0,-.15);pz(P,'foreL',-1.5);pz(P,'foreR',-1.5);pz(P,'cape',-.15)} // recule en gardant la garde
  else{pz(P,'chest',.16+(run>1?.12:0),-s*.14);pz(P,'armL',s*.68,0,.12);pz(P,'armR',-s*.68,0,-.12);pz(P,'foreL',-.75-.3*Math.max(0,-s));pz(P,'foreR',-.75-.3*Math.max(0,s));pz(P,'cape',-.35-Math.abs(s)*.1);pz(P,'cape2',-.2)}
  if(!nin&&Math.abs(sd)>.45){const q=sd*(Math.abs(sd)-.45)/.55;P.rootR.z-=.14*q;padd(P,'thighL',0,0,.22*q*s);padd(P,'thighR',0,0,.22*q*s);padd(P,'chest',0,0,.1*q);padd(P,'head',0,0,-.1*q)} // pas chassés
  pz(P,'hair',.3+Math.sin(w*2)*.1);pz(P,'band',.5+Math.sin(w*2)*.15)}
 else{pz(P,'hair',Math.sin(t*1.7+ph)*.06);pz(P,'band',.15+Math.sin(t*2.3+ph)*.12);pz(P,'cape',-.05+Math.sin(t*1.4+ph)*.04)}
 if(air&&!u.dash){pz(P,'thighL',-.9);pz(P,'shinL',1.5);pz(P,'thighR',-.4);pz(P,'shinR',1.1);pz(P,'armL',-.5,0,.6);pz(P,'armR',-.5,0,-.6);pz(P,'cape',-.7)}
 // dash : corps jeté en avant, bras en arrière, foulée fendue (saut : jambes repliées)
 if(u.dash){const jp=(u.dash&&u.dash.jump)||(u.z||0)>6;
  if(jp){P.root.y+=2;pz(P,'thighL',-1.3);pz(P,'shinL',1.9);pz(P,'thighR',-.9);pz(P,'shinR',1.6);pz(P,'chest',.35);pz(P,'armL',-1.2,0,.55);pz(P,'armR',-1.2,0,-.55);pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'cape',-1)}
  else{P.root.y=-4.5;pz(P,'chest',.92);pz(P,'spine',.25);pz(P,'head',-.75);pz(P,'armL',1.3,0,.38);pz(P,'armR',1.3,0,-.38);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'handL',.5);pz(P,'handR',.5);
   pz(P,'thighL',-1.15);pz(P,'shinL',.6);pz(P,'thighR',.95);pz(P,'shinR',1.1);pz(P,'footR',.5);pz(P,'cape',-1.35);pz(P,'cape2',-.5);pz(P,'hair',.5);pz(P,'band',.9)}}
 // garde de combat après un coup au corps à corps
 if(!run&&u.cmbT>0&&MELEEK.has(u.ch.look.weapon.k)&&!u.swing){P.root.y=-2.2;pz(P,'thighL',-.35,0,.12);pz(P,'thighR',.25,0,-.12);pz(P,'shinL',.55);pz(P,'shinR',.6);pz(P,'chest',.12,.35);pz(P,'head',0,-.3);
  pz(P,'armL',-1.05,0,.18);pz(P,'foreL',-1.75);pz(P,'armR',-.85,0,-.25);pz(P,'foreR',-1.9)}
 return P}
// ---- garde (F) selon l'arme : avant-bras croisés, lame en travers, bâton tenu à deux mains, paume avancée, éventail devant le visage
function guardPose(u,P,t,k){const b=Math.sin(t*3)*.03;P.root.y=-3;pz(P,'thighL',-.4,0,.14);pz(P,'shinL',.6);pz(P,'thighR',.3,0,-.14);pz(P,'shinR',.55);pz(P,'chest',.2+b);pz(P,'head',.12);
 switch(k){
 case'sword':case'ninjato':case'kunai':case'kama':case'bone':case'gold':case'paper':case'shuriken':pz(P,'armR',-1.5,0,.3);pz(P,'foreR',-1.15);pz(P,'handR',-.7,0,-.9);pz(P,'armL',-1.15,0,-.35);pz(P,'foreL',-1.55);return;
 case'staff':case'tonfa':pz(P,'armR',-1.35,0,.12);pz(P,'foreR',-1.3);pz(P,'handR',0,0,-1.2);pz(P,'armL',-1.35,0,-.1);pz(P,'foreL',-1.25);return;
 case'palm':pz(P,'armL',-1.45,0,.05);pz(P,'foreL',-.3);pz(P,'handL',-.9);pz(P,'armR',-1.7,0,-.45);pz(P,'foreR',-1.1);pz(P,'handR',-.9);pz(P,'chest',.25,-.4);return;
 case'fan':pz(P,'armR',-1.55,0,.55);pz(P,'foreR',-1.35);pz(P,'handR',.2,0,1.2);pz(P,'armL',-.8,0,-.2);pz(P,'foreL',-1.4);return;
 }
 pz(P,'armL',-1.45,0,-.48);pz(P,'foreL',-1.55);pz(P,'armR',-1.45,0,.48);pz(P,'foreR',-1.55)} // avant-bras croisés devant le visage
// enchaînement au corps à corps : 5 coups différents selon le style (poing, paume, sabre, gros poing, griffes, os)
function comboPose(u,P,cs,ph,k){const pl=ph,fs=1;
 const w=WCMB[k];if(w&&w[cs-1]){w[cs-1](P,c01(1-u.swing/.18),u);return}
 const jab=(s)=>{const L=s==='L';pz(P,'arm'+s,-1.55*pl-.2,0,(L?-.15:.15)*pl);pz(P,'fore'+s,-.1);pz(P,'chest',.12,(L?-.25:.28)*pl);pz(P,'head',0,(L?.2:-.22)*pl);pz(P,'hips',0,(L?-.12:.14)*pl);P.root.z=4*pl};
 if(k==='sword'||k==='bone'){const sw=[[-2.6,-.7,-.4,.5],[-2.2,.6,-.5,-.6],[-3.1,0,-.6,0],[-1.57,0,-1.57,0],[-1.6,-.8,-1.6,.8]][cs-1];
  pz(P,'armR',sw[0]+(sw[2]-sw[0])*pl,0,sw[1]+(sw[3]-sw[1])*pl);pz(P,'foreR',-.2);pz(P,'armL',-.6,0,.4);pz(P,'foreL',-1.2);pz(P,'chest',.18,(sw[3]-sw[1])*.6*pl-.3);P.root.z=5*pl;
  if(cs===4){P.root.z=10*pl;pz(P,'thighR',-.7*pl);pz(P,'shinR',.4)}if(cs===5){P.rootR.y=-Math.PI*2*ezo(pl)}return}
 if(k==='palm'){if(cs<3)jab(cs===1?'R':'L');else if(cs===3){pz(P,'armL',-1.1*pl-.3,0,-.2);pz(P,'armR',-1.1*pl-.3,0,.2);pz(P,'foreL',-.3);pz(P,'foreR',-.3);P.root.y=-4*pl;pz(P,'thighL',-.6*pl);pz(P,'shinL',.9*pl)}
  else if(cs===4){P.rootR.y=-Math.PI*ezo(pl);pz(P,'armL',-1.4,0,.6);pz(P,'armR',-1.4,0,-.6)}else{pz(P,'armL',-1.6,0,-.25);pz(P,'armR',-1.6,0,.25);pz(P,'foreL',-.05);pz(P,'foreR',-.05);P.root.z=9*pl;P.root.y=-5*pl;pz(P,'thighR',-.9*pl);pz(P,'shinR',1*pl);pz(P,'thighL',.5*pl);pz(P,'chest',.35*pl)}return}
 if(k==='bigfist'){if(cs<3){const s=cs===1?'R':'L',L=s==='L';pz(P,'arm'+s,-1.2*pl-.3,0,(L?.9:-.9)*(1-pl)+(L?-.2:.2));pz(P,'fore'+s,-.5);pz(P,'chest',.15,(L?-.7:.7)*pl);P.root.z=4*pl}
  else if(cs===3||cs===5){const up=pl<.45,e=up?pl/.45:1;pz(P,'armL',up?-3*e:-3+2.6*((pl-.45)/.55),0,-.2);pz(P,'armR',up?-3*e:-3+2.6*((pl-.45)/.55),0,.2);pz(P,'chest',up?-.3:.6);P.root.y=up?2:-5}
  else{pz(P,'chest',.5*pl);P.root.z=12*pl;pz(P,'armL',.6,0,.5);pz(P,'armR',.6,0,-.5)}return}
 if(k==='claws'){if(cs<3){const s=cs===1?'R':'L',L=s==='L';pz(P,'arm'+s,-1.5,(L?-1:1)*(1.2-2.2*pl),0);pz(P,'fore'+s,-.3);pz(P,'chest',.3,(L?1:-1)*(.5-pl));P.root.z=3*pl}
  else if(cs===3){pz(P,'armL',-.5-2.2*pl,0,.4);pz(P,'armR',-.5-2.2*pl,0,-.4);P.root.y=-3+5*pl}else if(cs===4){P.root.z=14*pl;P.root.y=-4;pz(P,'chest',.7);pz(P,'armL',-1.7,0,.3);pz(P,'armR',-1.7,0,-.3);pz(P,'thighL',-.9);pz(P,'shinL',1.2);pz(P,'thighR',.6);pz(P,'shinR',.8)}
  else{P.rootR.y=Math.PI*2*ezo(pl);pz(P,'armL',-1.2,0,1.2);pz(P,'armR',-1.2,0,-1.2)}return}
 // poings (et défaut) : direct, cross, uppercut, coup de pied circulaire, coup de pied sauté
 if(cs===1)jab('L');else if(cs===2)jab('R');
 else if(cs===3){pz(P,'armR',-.4-2.3*pl,0,.1);pz(P,'foreR',-.9+.6*pl);pz(P,'chest',-.1-.2*pl,.15);pz(P,'head',-.1,-.15);P.root.y=-3+6*pl;pz(P,'thighR',-.4*pl);pz(P,'shinR',.6*(1-pl))}
 else if(cs===4){pz(P,'thighR',-1.45*pl,0,-.5*pl);pz(P,'shinR',.2*(1-pl));pz(P,'chest',-.35*pl,.5*pl);pz(P,'armL',-1.1,0,.6);pz(P,'armR',-.4,0,-.9);P.rootR.y=.5*pl;pz(P,'shinL',.3)}
 else{P.root.y=11*bump(pl);pz(P,'thighL',-1.6*pl);pz(P,'shinL',.15);pz(P,'thighR',-.6);pz(P,'shinR',1.6);pz(P,'chest',-.45*pl);pz(P,'armL',.8,0,.6);pz(P,'armR',.8,0,-.6);P.rootR.x=-.25*pl}}
// ---- combos propres aux armes qui empruntent la chorégraphie d'une autre (ninjatô ← kunai, kusarigama ← chaînes, marionnette, iaidô ← sabre)
// hh : élan de frappe (vite à fond, tient, revient) ; chaque coup est un geste différent, le 5e est le final
const hh=(e,a=.2,b=.55)=>e<a?ezo(e/a):e<b?1:1-ezio((e-b)/(1-b))*.85,lrp=(a,b,k)=>a+(b-a)*k;
const cmbLegs=(P,u,k,d=1)=>{if(u&&u.moving)return;P.root.y=Math.min(P.root.y,-2.6*d*k);pz(P,'thighL',-.5*k,0,.1);pz(P,'shinL',.65*k);pz(P,'thighR',.32*k,0,-.1);pz(P,'shinR',.55*k)};
const WCMB={
 ninjato:[
  (P,e,u)=>{const k=hh(e,.2,.55);pz(P,'armR',lrp(-.3,-2.6,k),0,lrp(.55,-.5,k));pz(P,'foreR',-.15);pz(P,'handR',1.2);pz(P,'armL',-.5,0,.4);pz(P,'foreL',-1.1);pz(P,'chest',.15,lrp(.45,-.5,k));P.root.z=5*k;cmbLegs(P,u,k)}, // taille montante
  (P,e,u)=>{const k=hh(e,.2,.55);pz(P,'armR',-1.45,0,lrp(.75,-1.2,k));pz(P,'foreR',-.15);pz(P,'handR',1.3);pz(P,'armL',-.4,0,.5);pz(P,'chest',.15,lrp(.55,-.65,k));P.root.z=4*k;cmbLegs(P,u,k)}, // revers horizontal
  (P,e,u)=>{const up=e<.3,k=up?ezo(e/.3):ezo(c01((e-.3)/.14));pz(P,'armR',up?lrp(-.5,-3.05,k):lrp(-3.05,-.85,k),0,.1);pz(P,'foreR',-.15);pz(P,'handR',1.3);pz(P,'armL',up?-2.6*k:-.7,0,-.1);pz(P,'chest',up?-.3*k:.55*k);P.root.y=up?1.5*k:-5*k;cmbLegs(P,u,up?0:k,1.2)}, // fendant
  (P,e,u)=>{const k=hh(e,.25,.6);P.rootR.y=-Math.PI*2*ezio(c01(e/.8));P.root.y=-6*k;pz(P,'armR',-1.3,0,-1.3);pz(P,'foreR',-.05);pz(P,'handR',1.2);pz(P,'armL',-.6,0,.9);pz(P,'thighL',-.9*k,0,.2);pz(P,'shinL',1.3*k);pz(P,'thighR',.4,0,-.3);pz(P,'shinR',.9*k)}, // balayage bas tournoyant
  (P,e,u)=>{const k=hh(e,.14,.62),z=e>.7?ezo(c01((e-.7)/.3)):0;pz(P,'armR',lrp(-1.57*k,-.6,z),0,lrp(.05,-.6,z));pz(P,'foreR',-.02);pz(P,'handR',1.5);pz(P,'armL',.75*k,0,.5);pz(P,'chest',.5*k,.35*k);P.root.z=18*k;
   if(!(u&&u.moving)){P.root.y=-6*k;pz(P,'thighR',-1.2*k);pz(P,'shinR',1*k);pz(P,'thighL',.8*k);pz(P,'shinL',.4*k)}pz(P,'head',-.2*k)}], // estoc traversant puis lame abaissée (zanshin)
 kama:[
  (P,e,u)=>{const k=hh(e,.22,.55);pz(P,'armR',lrp(-2.6,-.6,k),0,lrp(-.7,.6,k));pz(P,'foreR',-.65);pz(P,'handR',.5);pz(P,'armL',-.9,0,.3);pz(P,'foreL',-1.4);pz(P,'chest',.2,lrp(.5,-.5,k));cmbLegs(P,u,k)}, // crochet plongeant
  (P,e,u)=>{const k=hh(e,.22,.55);pz(P,'armR',lrp(-.5,-2.25,k),0,lrp(.75,-.6,k));pz(P,'foreR',-.8);pz(P,'handR',.5);pz(P,'armL',-.9,0,.3);pz(P,'foreL',-1.4);pz(P,'chest',.1,lrp(-.4,.45,k));cmbLegs(P,u,k)}, // crochet remontant
  (P,e,u,t)=>{const a=e*Math.PI*5;pz(P,'armR',-2.85,0,.55*Math.sin(a));pz(P,'foreR',-.35+.3*Math.cos(a));pz(P,'handR',.3);pz(P,'armL',-1.2,0,-.2);pz(P,'foreL',-1.3);pz(P,'head',-.25);pz(P,'chest',-.1);cmbLegs(P,u,1,.8)}, // chaîne qui tourne au-dessus de la tête
  (P,e,u)=>{const k=hh(e,.16,.6);pz(P,'armR',-1.6*k-.1,0,.05);pz(P,'foreR',0);pz(P,'handR',.3);pz(P,'armL',.45*k,0,.35);pz(P,'foreL',-1.2);pz(P,'chest',.35*k,.3*k);P.root.z=7*k;cmbLegs(P,u,k,1.2)}, // faucille lancée
  (P,e,u)=>{if(e<.4){const k=ezo(e/.4);pz(P,'armR',lrp(-1.6,.55,k),0,-.2);pz(P,'foreR',-1.3*k);pz(P,'chest',-.3*k);P.root.z=-4*k;cmbLegs(P,u,1,1.3);return} // tirée à soi…
   P.rootR.y=-Math.PI*2*ezio(c01((e-.4)/.5));pz(P,'armR',-1.45,0,-1.45);pz(P,'foreR',-.05);pz(P,'armL',-.5,0,.9);P.root.y=-2}], // …puis tour complet, chaîne tendue
 puppet:[
  (P,e)=>{const k=hh(e,.18,.5);pz(P,'armR',-1.8*k-.1,0,-.2*k);pz(P,'foreR',-.6*(1-k)-.15);pz(P,'handR',-.9*k);pz(P,'armL',-1.3,0,.45);pz(P,'foreL',-.9);pz(P,'handL',-.4)}, // doigts droits projetés
  (P,e)=>{const k=hh(e,.18,.5);pz(P,'armL',-1.8*k-.1,0,.2*k);pz(P,'foreL',-.6*(1-k)-.15);pz(P,'handL',-.9*k);pz(P,'armR',-1.3,0,-.45);pz(P,'foreR',-.9);pz(P,'handR',-.4)}, // doigts gauches
  (P,e)=>{const up=e<.35,k=up?ezo(e/.35):ezo(c01((e-.35)/.15));const a=up?-2.8*k:lrp(-2.8,-1,k);pz(P,'armL',a,0,.3);pz(P,'armR',a,0,-.3);pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'handL',up?-.6:.9);pz(P,'handR',up?-.6:.9);pz(P,'chest',up?-.25:.3);pz(P,'head',up?-.3:.1)}, // fils levés puis abattus
  (P,e)=>{const k=hh(e,.24,.6);pz(P,'armR',-1.4,0,lrp(.7,-1.1,k));pz(P,'armL',-1.4,0,lrp(1.1,-.6,k));pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'handL',-.6);pz(P,'handR',-.6);pz(P,'chest',.1,lrp(.4,-.5,k))}, // balayage des deux bras
  (P,e)=>{if(e<.35){const k=ezo(e/.35);pz(P,'armL',-1.75*k,0,-.15);pz(P,'armR',-1.75*k,0,.15);pz(P,'handL',-1);pz(P,'handR',-1);pz(P,'chest',.3*k);P.root.z=5*k;return} // mains projetées…
   const k=ezo(c01((e-.35)/.2));pz(P,'armL',lrp(-1.75,.45,k),0,.3);pz(P,'armR',lrp(-1.75,.45,k),0,-.3);pz(P,'foreL',-1.4*k);pz(P,'foreR',-1.4*k);pz(P,'handL',.6);pz(P,'handR',.6);pz(P,'chest',-.3*k);P.root.z=-4*k;P.root.y=-3*k}], // …puis les fils arrachés en arrière (final)
 iai:[
  (P,e,u)=>{const k=hh(e,.14,.5);pz(P,'armR',-1.5*k-.45*(1-k),0,lrp(.9,-.9,k));pz(P,'foreR',-.15-1.1*(1-k));pz(P,'handR',1.3);pz(P,'armL',-.2,0,-.3);pz(P,'foreL',-1);pz(P,'chest',.35,lrp(.5,-.6,k));cmbLegs(P,u,k,1.5)}, // coupe dégainée depuis la hanche
  (P,e,u)=>{const k=hh(e,.18,.5);pz(P,'armR',-1.35,0,lrp(-.9,.8,k));pz(P,'foreR',-.15);pz(P,'handR',1.3);pz(P,'armL',-.3,0,-.3);pz(P,'chest',.3,lrp(-.6,.45,k));cmbLegs(P,u,k,1.3)}, // retour
  (P,e,u)=>{const k=hh(e,.2,.55);pz(P,'armR',lrp(-.3,-2.6,k),0,lrp(.75,-.4,k));pz(P,'foreR',-.1);pz(P,'handR',1.3);pz(P,'armL',-.6,0,.3);pz(P,'chest',lrp(.4,-.2,k),lrp(.3,-.4,k));P.root.y=-4*(1-k)+1.5*k}, // montante
  (P,e,u)=>{const k=hh(e,.14,.6);pz(P,'armR',-1.57*k-.1,0,.05);pz(P,'foreR',-.02);pz(P,'handR',1.5*k);pz(P,'armL',.55*k,0,.5);pz(P,'chest',.45*k,.3*k);P.root.z=14*k;cmbLegs(P,u,k,1.6)}, // estoc
  (P,e,u)=>{if(e<.55){const k=ezo(c01(e/.2));pz(P,'armR',lrp(-.45,-1.4,k),0,lrp(.9,-1.25,k));pz(P,'foreR',-.1);pz(P,'handR',1.4);pz(P,'armL',-.2,0,-.35);pz(P,'chest',.6*k,-.6*k);P.root.z=16*k;P.root.y=-7*k;
    pz(P,'thighL',-1.2*k);pz(P,'shinL',1.3*k);pz(P,'thighR',.8*k);pz(P,'shinR',.9*k);return} // battô : coupe éclair en fente basse…
   const k=ezo(c01((e-.55)/.45));pz(P,'armR',lrp(-1.4,-.45,k),0,lrp(-1.25,.9,k));pz(P,'foreR',-1.2*k-.1);pz(P,'handR',1.3);pz(P,'armL',-.2,0,-.35);pz(P,'foreL',-1);pz(P,'chest',.6-.3*k,-.6+.3*k);pz(P,'head',.35*k);P.root.z=16-6*k;P.root.y=-7+3*k;
   pz(P,'thighL',-1.2+.5*k);pz(P,'shinL',1.3-.5*k);pz(P,'thighR',.8-.4*k);pz(P,'shinR',.9-.3*k)}], // …puis la lame rentre lentement au fourreau
};
// l'animation d'un coup de base : celle du kit, sauf pour une arme qui emprunte la chorégraphie d'une autre (elle a alors la sienne)
function wcmbFor(u,k){const w=u.ch&&u.ch.look.weapon.k,d=+k.charAt(k.length-1)||0;
 if(w==='ninjato'&&d&&k.startsWith('st_kun'))return WCMB.ninjato[d-1];
 if(w==='kama'&&d&&k.startsWith('st_chn'))return WCMB.kama[d-1];
 if((k==='st_pupr'||k==='st_pupl')&&u.cmbT>0&&u.cmbH)return WCMB.puppet[(u.cmbH-1)%5];
 if(d&&k.startsWith('st_ken')){const s=u.ch.abil&&u.ch.abil[0];if(s&&s.key==='kj_style')return WCMB.iai[d-1]}
 return null}
function actionPose(u,t,rec,P,A){A=A||rec.A||{};const k=u.ch.look.weapon.k;
 if(u.dead)return P;
 if(u.block)guardPose(u,P,t,k);
 // parade (F + clic) : le bras avant chasse le coup vers l'extérieur, buste qui pivote
 if(u.parry>0&&!u.dead){const q=c01(1-u.parry/.3),s=ezo(c01(q/.35));pz(P,'armR',-1.7,0,lrp(.5,-.85,s));pz(P,'foreR',-.55);pz(P,'handR',-.4);pz(P,'armL',-1.1,0,-.3);pz(P,'foreL',-1.6);pz(P,'chest',.15,lrp(.4,-.45,s));P.root.y=-2.5;pz(P,'thighL',-.35,0,.12);pz(P,'shinL',.5);pz(P,'thighR',.3);pz(P,'shinR',.5)}
 // concentration du chakra (R) : posture du cavalier, poings aux hanches, épaules qui vibrent
 if(u.chk){const v=Math.sin(t*40)*.25;P.root.y=-4+v;pz(P,'thighL',-.1,0,.45);pz(P,'thighR',-.1,0,-.45);pz(P,'shinL',.6);pz(P,'shinR',.6);pz(P,'armL',.35,0,.5);pz(P,'armR',.35,0,-.5);pz(P,'foreL',-1.6);pz(P,'foreR',-1.6);pz(P,'chest',-.14+v*.04);pz(P,'head',-.2)}
 // épuisé (chakra à sec) : dos voûté, tête basse, bras ballants, souffle court
 if(u.exh&&!u.chk&&!u.cast&&!u.block&&!(u.swing>0)&&!u.dash){const b=Math.sin(t*7);padd(P,'chest',.28+b*.05);padd(P,'head',.22+b*.06);pz(P,'armL',.2,0,.22);pz(P,'armR',.2,0,-.22);pz(P,'foreL',-.35);pz(P,'foreR',-.35);P.root.y=(P.root.y||0)-2+b*.6}
 if(u.cast){try{castPose(u,P,t,A)}catch(err){}}
 if(u.flame){pz(P,'armL',-1.3,0,-.35);pz(P,'foreL',-2.3);pz(P,'armR',-1.3,0,.35);pz(P,'foreR',-2.3);pz(P,'chest',.25+Math.sin(t*20)*.03);pz(P,'head',.1);P.root.y=-1.5}
 if(u.chan){pz(P,'armL',-2.9,0,.35);pz(P,'armR',-2.9,0,-.35);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'head',-.4);pz(P,'chest',-.2);P.root.y+=Math.sin(t*23)*.3}
 if(u.spin){P.rootR.y=t*22;pz(P,'armL',-1.45,0,1.3);pz(P,'armR',-1.45,0,-1.3);pz(P,'foreL',-.1);pz(P,'foreR',-.1);P.root.y=-2}
 if(u.thrT>0){const e=1-u.thrT/.2,a=e<.35?e/.35:1-(e-.35)/.65*.5;pz(P,'armR',-3.3+2*a,0,-.15);pz(P,'foreR',-1.4+1.3*a);pz(P,'chest',.1,.45*a-.2);pz(P,'armL',-.5,0,.4);pz(P,'thighL',-.4*a);pz(P,'shinL',.3*a)}
 else if(u.relT>0&&!(u.anim&&u.anim.t>0)){relPose(u,P,A.rs||'push',c01(1-u.relT/.3))}
 if(u.swing>0){const sw=u.swing/.18,ph=typeof punchK==='function'?punchK(sw):Math.sin(Math.PI*(1-sw));
  if(MELEEK.has(k))comboPose(u,P,(u.cmbH||1),ph,k);else{pz(P,'armR',-1.6*ph-.1,0,.1);pz(P,'foreR',-.1);pz(P,'chest',.1,.3*ph)}}
 // étourdi : tête qui roule, genoux qui flanchent, corps qui tangue
 if(u.stun>0&&!u.dead){pz(P,'head',.22+Math.sin(t*6)*.12,Math.sin(t*3)*.3,Math.cos(t*3)*.14);pz(P,'chest',.25,0,Math.sin(t*6)*.12);pz(P,'armL',.2,0,.35);pz(P,'armR',.2,0,-.35);pz(P,'foreL',-.1);pz(P,'foreR',-.1);
  pz(P,'thighL',-.15,0,.12);pz(P,'thighR',-.05,0,-.12);pz(P,'shinL',.5+Math.sin(t*3.1)*.15);pz(P,'shinR',.45-Math.sin(t*3.1)*.15);P.root.y=-2.2;P.rootR.z=Math.sin(t*3.1)*.11;P.rootR.x=.06}
 if(u.sleepT<0){pz(P,'head',.7);pz(P,'chest',.35);pz(P,'armL',.1,0,.2);pz(P,'armR',.1,0,-.2);P.root.y=-3}
 if(u.flash>0&&!u.stun&&!(A.hT<.35)){const f=u.flash/.12;padd(P,'chest',-.4*f);padd(P,'head',-.35*f);P.root.z-=3*f}
 if(u.anim&&ANIM[u.anim.k]){const a=u.anim,e=c01(1-Math.max(0,a.t)/a.m),w=wcmbFor(u,a.k);try{if(w)w(P,e,u,t);else ANIM[a.k](P,e,u,t)}catch(err){}
  if(u.cmbH===5&&u.cmbT>0&&a.k.startsWith('st_')&&e<.5){P.root.z+=3*bump(e/.5);P.root.y-=1.5*bump(e/.25)}} // 5e coup : élan et poussée en plus
 reactPose(u,P,t,A);
 return P}
// ---- réactions : recul orienté (de face : buste rejeté ; de dos : poussé en avant ; de côté : penché et tourné), chancellement sur un gros coup, réception de saut
function reactPose(u,P,t,A){if(u.dead||A.kd)return;
 if(A.hT<.34){const h=A.hT,f=(h<.035?h/.035:1-ezo(c01((h-.035)/.3)))*A.hK,fz=A.hZ,fx=A.hX;
  padd(P,'chest',-.45*fz*f,.38*fx*f,-.15*fx*f);padd(P,'spine',-.15*fz*f);padd(P,'head',-.4*fz*f,.3*fx*f);P.root.z-=5.5*fz*f;P.rootR.z+=.17*fx*f;
  padd(P,'armL',.4*f,0,.3*f);padd(P,'armR',.4*f,0,-.3*f);padd(P,'foreL',.25*f);padd(P,'foreR',.25*f);
  if(A.hK>.62){const g=(A.hK-.62)/.38*f;padd(P,'thighR',.5*g*fz,0,-.1*g);padd(P,'shinR',.45*g);padd(P,'thighL',-.25*g*fz);padd(P,'shinL',.3*g);P.root.y-=3*g;padd(P,'head',.2*g)}} // gros coup : un pas en arrière, genoux qui plient
 if(A.lT<.24){const f=A.lT<.06?A.lT/.06:1-ezo(c01((A.lT-.06)/.18));P.root.y-=5*f;padd(P,'thighL',-.45*f);padd(P,'thighR',-.3*f);padd(P,'shinL',.9*f);padd(P,'shinR',.75*f);padd(P,'chest',.3*f);padd(P,'armL',0,0,.35*f);padd(P,'armR',0,0,-.35*f)}}
// ---- projeté (airT) → au sol tant qu'il est étourdi → se relève ; mort : genoux qui lâchent, chute selon le dernier coup, petit rebond
function downPose(u,P,t,A){const sg=A.kS||1;poseClr(P);
 if(A.kd===1){const k=ezo(c01(A.kT/.22));P.rootR.x=-1.15*sg*k;P.root.y=4*k;P.rootR.z=.2*A.kX*k;pz(P,'thighL',-.9);pz(P,'shinL',.9);pz(P,'thighR',-.5);pz(P,'shinR',1.3);pz(P,'armL',-2.3,0,.7);pz(P,'armR',-2.1,0,-.75);pz(P,'head',.45*sg);pz(P,'chest',-.25*sg);pz(P,'cape',-.9);return}
 if(A.kd===2){const bo=bump(c01(A.kT/.2));P.rootR.x=-1.5*sg;P.root.y=2+3*bo;P.rootR.z=.15*A.kX;pz(P,'armL',-.4,0,1.15);pz(P,'armR',-.6,0,-1.05);pz(P,'thighL',-.25);pz(P,'shinL',.6);pz(P,'thighR',-.05);pz(P,'head',-.25*sg+.1*bo);return}
 const g=c01(A.kT/.45),up=ezio(g),kn=bump(g); // relevé : appui sur les mains, genou au sol, debout
 P.rootR.x=-1.5*sg*(1-up);P.root.y=2*(1-up)-6*kn;pz(P,'thighL',-1.3*kn);pz(P,'shinL',2*kn);pz(P,'thighR',.2*kn);pz(P,'shinR',1.7*kn);pz(P,'chest',.6*kn);pz(P,'armL',.5*kn-.3*(1-g),0,.5);pz(P,'armR',-.9*kn,0,-.3);pz(P,'foreR',-.2);pz(P,'handR',-.8*kn);pz(P,'head',-.2*kn)}
function deathPose(u,P,t,A){const d=u.deadT||0,sg=A.dS||1,b=c01(d/.16),f=c01((d-.1)/.38),ff=f*f,bo=bump(c01((d-.48)/.22));poseClr(P);
 P.rootR.x=-1.48*sg*ff-.1*sg*bo;P.rootR.z=.3*(A.dX||0)*f;P.root.y=-3*b*(1-f)+2*f+3*bo;
 pz(P,'head',-.45*sg*b*(1-f)+(-.2*sg)*f);pz(P,'chest',-.3*sg*b);pz(P,'shinL',.9*b*(1-f)+.4*f);pz(P,'shinR',.8*b*(1-f)+.1*f);pz(P,'thighL',-.3*f);
 pz(P,'armL',-.9*b*(1-f)-.4*f,0,.6*b+.6*f);pz(P,'armR',-.8*b*(1-f)-.5*f,0,-.6*b-.5*f);pz(P,'foreL',-.3*f);pz(P,'cape',-.6*f)}
// ---- état d'animation propre à chaque ninja (détecte les événements à partir des champs synchronisés)
function anNew(){return{ph:Math.random()*6.28,fl:0,hp:-1,hT:9,hK:0,hZ:1,hX:0,hs:0,vic:0,sq:0,kd:0,kT:0,kS:1,kX:0,lT:9,air:false,cs:null,csT:9,rl:0,rs:null,dd:0,dS:1,dX:0}}
function anEvents(u,A,dt){const fl=u.flash||0,hp=u.hp||0,mx=u.max||300;
 if(fl>A.fl+.03&&!u.dead&&A.hp>=0){const d=Math.max(0,A.hp-hp);A.hK=Math.min(1,.42+d/(mx*.11));A.hT=0;
  // d'où vient le coup : élan de recul (hôte) sinon l'ennemi le plus proche
  let an=null;const kx=u.kx||0,ky=u.ky||0;if(kx*kx+ky*ky>400)an=Math.atan2(-ky,-kx);
  else if(typeof units!=='undefined'){let bd=1e12;for(let i=0;i<units.length;i++){const e=units[i];if(!e||e===u||e.dead||e.team===u.team)continue;const q=(e.x-u.x)**2+(e.y-u.y)**2;if(q<bd){bd=q;an=Math.atan2(e.y-u.y,e.x-u.x)}}}
  if(an==null){A.hZ=1;A.hX=0}else{const r=an-(u.aim||0);A.hZ=Math.cos(r);A.hX=Math.sin(r)}
  if(d>=Math.max(16,mx*.07)){A.hs=.075;A.vic=1}} // gros coup : petit arrêt sur image + écrasement (visuel seulement)
 if(u.fxHS>0&&A.hs<=0){A.hs=Math.min(.08,u.fxHS);A.vic=A.hT<.05?1:0}
 A.fl=fl;A.hp=hp;A.hT+=dt;
 if(u.airT>0&&!A.kd&&!u.dead){A.kd=1;A.kT=0;A.kS=A.hT<.4&&A.hZ<-.2?-1:1;A.kX=A.hT<.4?A.hX:0}
 if(A.kd){A.kT+=dt;if(u.dead)A.kd=0;else if(A.kd===1&&!(u.airT>0)){A.kd=2;A.kT=0;A.lT=9}else if(A.kd===2&&((!(u.stun>0)&&A.kT>.22)||A.kT>1.4||u.moving&&A.kT>.15)){A.kd=3;A.kT=0}else if(A.kd===3&&A.kT>.45)A.kd=0}
 const inAir=(u.z||0)>5||u.airT>0||!!(u.dash&&u.dash.jump);if(A.air&&!inAir&&!u.dead&&!A.kd)A.lT=0;A.air=inAir;A.lT+=dt;
 if(u.cast){A.cs=anStyle(castAb(u,u.cast));A.csT=0}else A.csT+=dt;
 // jutsu instantané (sans incantation) : repéré par sa recharge qui repart (hôte, et le joueur chez un invité) → libération propre à sa catégorie
 const cd=u.cds;if(cd&&!u.cast&&u.ch&&u.ch.abil){const C=A.cd||(A.cd=[0,0,0,0,0,0,0]);for(let i=1;i<7;i++){const v=cd[i]||0;if(v>C[i]+.5&&u.ch.abil[i]&&u.ch.abil[i].rank){A.cs=anStyle(u.ch.abil[i]);A.csT=0}C[i]=v}}
 const rl=u.relT||0;if(rl>A.rl+.05)A.rs=A.csT<.3&&A.cs?A.cs:'push';A.rl=rl;
 if(u.dead&&!A.dd){A.dd=1;A.dS=A.hT<1&&A.hZ<-.3?-1:1;A.dX=A.hT<1?A.hX:0}else if(!u.dead)A.dd=0}
// ----- mise à jour du modèle (pose lissée, orientation, éclat blanc) puis rendu de l'atlas
const _Q=typeof THREE!=='undefined'?new THREE.Quaternion():null,_E=typeof THREE!=='undefined'?new THREE.Euler():null;
function poseModel(u,rec,dt,t){const A=rec.A||(rec.A=anNew()),P=rec.P?poseClr(rec.P):(rec.P=poseNew());anEvents(u,A,dt);
 if(u.dead)deathPose(u,P,t,A);else{basePose(u,t,rec,P,A);actionPose(u,t,rec,P,A);if(A.kd)downPose(u,P,t,A)}
 // arrêt sur image : les os ne bougent plus pendant ~75 ms ; juste après un coup, le buste répond plus sec
 let pdt=dt,bo=1;if(A.hs>0){A.hs-=dt;pdt=0}else if(A.hT<.12)bo=2.3;
 for(let i=1;i<BONES.length;i++){const n=BONES[i][0],o=P[n],b=rec.bones[i],q=rec.cur[n];if(pdt>0){_E.set(o?o.x:0,o?o.y:0,o?o.z:0);_Q.setFromEuler(_E);q.slerp(_Q,1-Math.exp(-(BRATE[n]||16)*(i<6?bo:1)*pdt))}b.quaternion.copy(q)}
 const rb=rec.bones[0],k=pdt>0?1-Math.exp(-24*bo*pdt):0;rec.rootP.x+=((P.root.x||0)-rec.rootP.x)*k;rec.rootP.y+=((P.root.y||0)-rec.rootP.y)*k;rec.rootP.z+=((P.root.z||0)-rec.rootP.z)*k;rb.position.copy(rec.rootP);
 const R=P.rootR;rec.rootR.x+=(R.x-rec.rootR.x)*k;rec.rootR.z+=(R.z-rec.rootR.z)*k;if(pdt>0)rec.rootR.y=R.y?R.y:rec.rootR.y*(1-k);rb.rotation.set(rec.rootR.x,rec.rootR.y,rec.rootR.z);
 // écrasement : touché fort (pendant l'arrêt sur image) et réception d'un saut
 const sqT=(A.hs>0&&A.vic?1:0)+(A.lT<.14?bump(A.lT/.14)*.55:0);A.sq+=(sqT-A.sq)*(1-Math.exp(-40*dt));const sq=A.sq>.002?A.sq:0;rb.scale.set(1+.07*sq,1-.1*sq,1+.07*sq);
 // orientation : le ninja se tourne vers sa visée (au plus court), un peu en douceur
 const a=u.aim||0,want=Math.PI/2-Math.atan2(Math.sin(a)*.7+.42,Math.cos(a));let d=want-rec.yaw;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;if(!u.dead&&!A.kd)rec.yaw+=d*(1-Math.exp(-30*dt));
 const f=hitFl(u);rec.mat.emissive.setRGB(f*.55,f*.52,f*.48);rec.mat.emissiveIntensity=f?1:0; // éclair du coup : modéré (le ninja reste lisible) et bref par rafale (hitFl, nr_char.js)
 if(rec.face&&rec.face.material&&rec.face.material.map){const ph=(rec.ph??(rec.ph=Math.random()*4)),md=u.dead?'x':u.stun>0||u.sleepT<0||A.kd===2?'s':f>.2||(t+ph)%4.1<.13?'c':'o';if(rec.fm!==md){rec.fm=md;rec.face.material.map=faceTexture(u.ch.look,md)}}}
// taille de l'atlas : de 2 à 48 cases selon le nombre de ninjas visibles (agrandi aussitôt, réduit après un moment : 20 images au menu, où la liste fait poser beaucoup de ninjas d'un coup)
// en combat on ne réduit jamais (réallouer le tampon WebGL = saccade) : on efface seulement les cases utilisées
function atlasSize(n){const caps=[2,8,16,24,32,48],cap=caps.find(c=>c>=n)||48,cols=Math.min(8,cap),rows=Math.ceil(cap/cols),fight=state==='fight'||state==='countdown';
 if(cols*rows<n||cols>N3.cols||rows>N3.rows||(!fight&&N3.small>(state==='menu'?20:180)&&cols*rows<N3.cols*N3.rows)){N3.cols=cols;N3.rows=rows;N3.small=0;N3.r.setSize(cols*TPW,rows*TPH,false);
  Object.assign(N3.cam,{left:0,right:cols*TWU,top:rows*THU,bottom:0});N3.cam.updateProjectionMatrix()}else if(cols*rows<N3.cols*N3.rows)N3.small++;else N3.small=0}
function render3D(){N3.tile.clear();if(!N3.on||OPT.p3d===false)return;if(!N3.tried&&!init3D())return;if(!N3.ok)return;
 const now=performance.now(),rdt=(now-(N3.last||now))/1000,dt=Math.min(.05,rdt)||1/60,t=now/1000;N3.last=now;N3.frame++;
 // plus de 2,5 s sous ~22 images/s en combat : on repasse en 2D
 if(state==='fight'&&rdt>0&&rdt<1){N3.slow=rdt>.045?(N3.slow||0)+1:Math.max(0,(N3.slow||0)-2);if(N3.slow>150){N3.on=false;N3.auto=true;console.warn('Ninjas 3D coupés : ordinateur trop lent');return}}
 const want=[];for(const u of units)if(u&&!(u.dead&&u.deadT>1.6)&&u.ch&&u.ch.look&&u.ch.look.head.t==='ninja'&&near(u.x,u.y))want.push(u);for(const u of[...want])if(u.ch.look.dog&&!u.dead)want.push(u._dog3||(u._dog3={dog:1,owner:u,aim:0}));for(const u of N3.req)if(!want.includes(u))want.push(u);N3.req.clear();
 const n=Math.min(want.length,TCOLS*TROWS);atlasSize(Math.max(2,n));const CO=N3.cols,RO=N3.rows;
 for(const rec of N3.recs.values())rec.grp.visible=false;
 for(let i=0;i<n;i++){const u=want[i];let rec=N3.recs.get(u);if(rec&&!u.dog&&rec.look!==u.ch.look){if(rec.key!==lookKey(u)){dispose3D(u,rec);rec=null}else rec.look=u.ch.look}if(!rec){rec=u.dog?buildDog3D():buildNinja3D(u);N3.recs.set(u,rec)}
  rec.used=N3.frame;rec.grp.visible=true;if(rec.dog)poseDog(u,rec,dt,t);else poseModel(u,rec,dt,t);
  const c=i%CO,r=Math.floor(i/CO),cx=c*TWU+TWU/2,cy=(RO-1-r)*THU+FOOT;
  rec.grp.position.copy(N3.right).multiplyScalar(cx).addScaledVector(N3.up,cy).addScaledVector(N3.fwd,1200);rec.grp.rotation.set(0,rec.yaw,0);
  N3.tile.set(u,{sx:c*TPW,sy:r*TPH})}
 if(N3.frame%120===0){for(const [u,rec] of N3.recs)if(N3.frame-rec.used>240)dispose3D(u,rec);for(const [k,G] of N3.geo)if(!G.n&&N3.frame-G.last>3600){G.geo.dispose();N3.geo.delete(k)}} // géométrie inutilisée depuis 1 min : libérée
 const ur=Math.max(1,Math.ceil(n/CO));N3.r.setScissorTest(true);N3.r.setScissor(0,(RO-ur)*TPH,(ur>1?CO:Math.max(1,n))*TPW,ur*TPH); // efface et dessine seulement les cases utilisées
 N3.r.render(N3.sc,N3.cam)}
function dispose3D(u,rec){N3.sc.remove(rec.grp);rec.mat.dispose();rec.face.material.dispose();rec.sym.material.dispose();if(rec.bsym)rec.bsym.material.dispose();rec.G&&(rec.G.n--,rec.G.last=N3.frame);N3.recs.delete(u)} // géométries partagées : gardées en cache
// colle la case du ninja dans la scène 2D (même échelle et même point d'appui que le dessin 2D), sinon dessin 2D
function drawChar3(u,bx,by,s,alpha){if(N3.ok)N3.req.add(u);const tl=N3.ok&&N3.tile.get(u);if(!tl)return drawChar(u,bx,by,s)
 const sk=u.ch.look.scale||1,w=TWU*s*sk,h=THU*s*sk;g.save();if(u.dead)g.globalAlpha*=Math.max(0,1-u.deadT*.6);if(u.phase>0)g.globalAlpha*=.35+Math.sin(performance.now()/33)*.1;if(alpha!=null)g.globalAlpha*=alpha;
 if(u.stun>0)g.translate(Math.sin(performance.now()/80)*1.2,0);
 g.drawImage(N3.cv,tl.sx,tl.sy,TPW,TPH,bx-w/2,by-h+FOOT*s*sk,w,h);g.restore()}

// ----- animations nommées : P = pose (os → {x,y,z} en radians), e = avancement 0 → 1, u = ninja
// repères : bras au repos le long du corps ; armX.x = -1.57 bras tendu devant, -3.1 levé au ciel, +0.6 en arrière ; armL.z > 0 / armR.z < 0 = écarté
// foreX.x < 0 plie le coude ; thighX.x < 0 jambe devant ; shinX.x > 0 plie le genou ; chest.x > 0 penché en avant ; chest.y tourne le buste
// P.root = décalage du corps (y = hauteur, z = vers l'avant) ; P.rootR = rotation de tout le corps (y = tourne sur soi, x = bascule)
// passe d'animation : chaque geste a un élan (anticipation), une frappe nette et un retour ; les jambes suivent (fente, appui, réception)
const anFent=(P,k,d=1)=>{P.root.y-=3*d*k;pz(P,'thighR',-.7*d*k);pz(P,'shinR',.8*d*k);pz(P,'thighL',.38*d*k);pz(P,'shinL',.5*d*k)};
Object.assign(ANIM,{
 // double paume : bras ramenés (élan) puis projetés, fente avant
 palm:(P,e)=>{const w=anW(e,.16),k=anK(e,.16);pz(P,'armL',.35*w-1.6*k,0,-.15);pz(P,'armR',.35*w-1.6*k,0,.15);pz(P,'foreL',-1.2*w*(1-k)-.05);pz(P,'foreR',-1.2*w*(1-k)-.05);pz(P,'handL',-.8*k);pz(P,'handR',-.8*k);
  pz(P,'chest',-.18*w+.28*k);P.root.z=-3*w+8*k;anFent(P,k)},
 twohand:(P,e)=>{const w=anW(e,.2),k=anK(e,.2,.16);pz(P,'armL',.3*w-1.5*k,0,-.32*k+.3*w);pz(P,'armR',.3*w-1.5*k,0,.32*k-.3*w);pz(P,'foreL',-.25-.9*w);pz(P,'foreR',-.25-.9*w);pz(P,'chest',-.15*w+.15*k);P.root.z=-2*w+4*k;anFent(P,k,.85)},
 // frappe au sol à deux mains : bras au ciel (sur la pointe des pieds), puis tout le corps s'abat
 slam:(P,e)=>{const up=e<.4,k=up?e/.4:(e-.4)/.6,d=ezo(c01(k/.35));const a=up?-3.1*ezo(k):-3.1+2.75*d;pz(P,'armL',a,0,-.2);pz(P,'armR',a,0,.2);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'handL',up?0:-.8);pz(P,'handR',up?0:-.8);
  pz(P,'chest',up?-.35*k:.7*d);pz(P,'head',up?-.3*k:.2*d);P.root.y=up?4*k:-8*d;pz(P,'thighL',up?0:-.7*d,0,up?0:.2);pz(P,'shinL',up?0:1.1*d);pz(P,'thighR',up?0:-.45*d,0,up?0:-.2);pz(P,'shinR',up?0:1*d)},
 hammer:(P,e)=>ANIM.slam(P,e),
 stomp:(P,e)=>{const up=e<.45,k=up?e/.45:(e-.45)/.55,d=ezo(c01(k/.3));pz(P,'thighR',up?-1.55*ezo(k):-1.55+1.55*d);pz(P,'shinR',up?1.25*k:1.25-1.25*d);pz(P,'armL',up?-.5:-.2,0,up?.7:1.1);pz(P,'armR',up?-.5:-.2,0,up?-.7:-1.1);
  pz(P,'chest',up?-.22:.35*d);pz(P,'head',up?-.15:.15);P.root.y=up?.5:-4*d;pz(P,'shinL',up?.15:.6*d)},
 spin:(P,e)=>{P.rootR.y=Math.PI*2*ezio(e);pz(P,'armL',-1.4,0,1.25);pz(P,'armR',-1.4,0,-1.25);pz(P,'foreL',-.1);pz(P,'foreR',-.1);P.root.y=-1.5;pz(P,'thighL',-.3,0,.25);pz(P,'thighR',-.1,0,-.25);pz(P,'shinL',.45);pz(P,'shinR',.3)},
 // souffle (Katon) : main au bord des lèvres ; inspire (buste en arrière, poitrine qui gonfle) puis souffle (buste en avant, appui avant)
 breath:(P,e)=>{const inh=e<.3,k=inh?ezo(e/.3):1,x=inh?0:ezo(c01((e-.3)/.12));pz(P,'armR',-1.38,0,.5);pz(P,'foreR',-2.45);pz(P,'handR',-.4);pz(P,'armL',-.55+.1*x,0,.3+.1*x);pz(P,'foreL',-1);
  pz(P,'chest',inh?-.38*k:-.38+.78*x);pz(P,'spine',inh?-.1*k:.1*x);pz(P,'head',inh?-.32*k:-.32+.5*x);P.root.y=inh?1*k:1-3*x;P.root.z=inh?-3*k:-3+7*x;
  pz(P,'thighL',-.5*x);pz(P,'shinL',.5*x);pz(P,'thighR',.35*x);pz(P,'shinR',.3*x)},
 // invocation : pouce mordu, puis genou et paume au sol (le sceau se répand)
 summon:(P,e)=>{if(e<.25){const b=ezo(e/.25);pz(P,'armR',-1.38*b,0,.5*b);pz(P,'foreR',-2.5*b);pz(P,'head',.12*b,.2*b);pz(P,'armL',-.3,0,.3);return}
  const k=ezo(c01((e-.25)/.14)),s=k>.95?bump(c01((e-.39)/.12))*.6:0;P.root.y=-10*k-1.5*s;pz(P,'thighL',-1.25*k,0,.1);pz(P,'shinL',2.05*k);pz(P,'thighR',.3*k,0,-.1);pz(P,'shinR',1.9*k);pz(P,'chest',.75*k+.1*s);
  pz(P,'armR',-1-.2*(1-k),0,.1);pz(P,'foreR',-.1);pz(P,'handR',-1*k);pz(P,'armL',.25,0,.55);pz(P,'foreL',-.5);pz(P,'head',-.25*k)},
 // bond : accroupi (élan), saut jambes repliées, réception
 leap:(P,e)=>{const w=anW(e,.14),j=bump(c01((e-.12)/.8)),l=e>.88?bump((e-.88)/.12):0;P.root.y=-5*w+26*j-4*l;pz(P,'thighL',-1.1*j-.6*w-.5*l);pz(P,'shinL',1.6*j+1.1*w+.9*l);pz(P,'thighR',-.6*j-.5*w-.4*l);pz(P,'shinR',1.3*j+1*w+.8*l);
  pz(P,'armL',-2.4*j+.5*w,0,.5);pz(P,'armR',-2.4*j+.5*w,0,-.5);pz(P,'chest',.4*w-.15*j+.3*l)},
 // désigne / vise : bras tendu, l'autre main tient le poignet, petit recul quand ça part
 point:(P,e)=>{const k=ezo(c01(e/.2)),r=bump(c01((e-.18)/.2));pz(P,'armR',-1.62*k+.15*r,0,.08);pz(P,'foreR',0);pz(P,'handR',-.3*k);pz(P,'armL',-1.2*k,0,-.55*k+.3*(1-k));pz(P,'foreL',-1*k-.25);
  pz(P,'chest',.1-.08*r,.35*k);pz(P,'head',0,-.2*k);P.root.z=-1.5*r;pz(P,'thighL',-.35*k);pz(P,'shinL',.35*k);pz(P,'thighR',.25*k)},
 raise:(P,e)=>{const k=ezo(c01(e/.3));pz(P,'armR',-3.05*k,0,.15);pz(P,'foreR',-.1);pz(P,'handR',-.3*k);pz(P,'armL',-.3,0,.55*k);pz(P,'head',-.38*k);pz(P,'chest',-.18*k);P.root.y=1.2*k;pz(P,'footL',.25*k);pz(P,'footR',.25*k)},
 clap:(P,e)=>{const k=e<.5?ezo(e/.5):1,c=e>.45?bump(c01((e-.45)/.15)):0;pz(P,'armL',-1.45,0,-.55*k+.6*(1-k));pz(P,'armR',-1.45,0,.55*k-.6*(1-k));pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'chest',.15*c);P.root.y=-1.5*c;pz(P,'head',.15*c)},
 pray:(P,e)=>{const k=ezo(c01(e/.25));pz(P,'armL',-1.2*k,0,-.6*k);pz(P,'armR',-1.2*k,0,.6*k);pz(P,'foreL',-1.9*k);pz(P,'foreR',-1.9*k);pz(P,'head',.35*k);pz(P,'chest',.12*k);P.root.y=-2*k;
  pz(P,'thighL',-.15*k,0,.15);pz(P,'thighR',-.05,0,-.15);pz(P,'shinL',.35*k);pz(P,'shinR',.3*k)},
 kickup:(P,e)=>{const w=anW(e,.14),k=bump(c01((e-.1)/.9));pz(P,'thighR',-2.3*k+.3*w);pz(P,'shinR',.1+.8*w);pz(P,'chest',-.45*k+.2*w);pz(P,'armL',-.3,0,.8);pz(P,'armR',-.3,0,-.8);P.root.y=4*k-3*w;pz(P,'shinL',.5*w)},
 uppercut:(P,e)=>{const k=ezo(Math.min(1,e/.45));pz(P,'armR',-.4-2.4*k,0,.1);pz(P,'foreR',-.9+.7*k);P.root.y=-4+9*k;pz(P,'chest',-.2*k,.2);pz(P,'head',-.25*k);pz(P,'armL',-1,0,.12);pz(P,'foreL',-1.8);pz(P,'shinL',.5*(1-k));pz(P,'shinR',.6*(1-k))},
 // lancer à deux mains : armé au-dessus de la tête (buste en arrière), puis lancé avec un pas
 throw2:(P,e)=>{const up=e<.35,k=up?ezo(e/.35):(e-.35)/.65,d=up?0:ezo(c01(k/.3));const a=up?-3.4*k:-3.4+2*d;pz(P,'armL',a,0,-.15);pz(P,'armR',a,0,.15);pz(P,'foreL',up?-.4-.6*k:-.4);pz(P,'foreR',up?-.4-.6*k:-.4);
  pz(P,'chest',up?-.3*k:-.3+.65*d);pz(P,'head',up?-.2*k:.1*d);P.root.z=up?-2*k:-2+5*d;pz(P,'thighL',up?.1:-.55*d);pz(P,'shinL',up?.2:.5*d);pz(P,'thighR',up?-.2*k:.3*d)},
 // fente / estoc : petit recul, explosion vers l'avant (bras arrière qui part en arrière), puis retour
 lunge:(P,e)=>{const w=anW(e,.12),k=anK(e,.12,.16)*(e>.75?1-ezio((e-.75)/.25)*.55:1);P.root.z=-3*w+17*k;P.root.y=-5*k-1*w;pz(P,'thighR',-1.15*k);pz(P,'shinR',1*k+.3*w);pz(P,'thighL',.75*k);pz(P,'shinL',.4*k+.3*w);
  pz(P,'armR',-1.62*k+.4*w,0,.05);pz(P,'foreR',-1.1*w);pz(P,'handR',-.3*k);pz(P,'armL',.7*k,0,.45);pz(P,'chest',.5*k-.15*w,.3*k-.25*w);pz(P,'head',-.2*k);pz(P,'cape',-.8*k)},
 stab:(P,e)=>ANIM.lunge(P,e),
 // accroupi (Kawarimi, réception) : chute sur un genou, main au sol, puis on se redresse un peu
 crouch:(P,e)=>{const d=e<.22?ezo(e/.22):1-ezio(c01((e-.22)/.78))*.45;P.root.y=-9*d;pz(P,'thighL',-1.1*d,0,.12);pz(P,'shinL',1.95*d);pz(P,'thighR',.2*d,0,-.12);pz(P,'shinR',1.8*d);pz(P,'chest',.55*d);
  pz(P,'armR',-.8*d,0,.15);pz(P,'foreR',-.2);pz(P,'handR',-1*d);pz(P,'armL',-.35,0,.6*d);pz(P,'foreL',-.7);pz(P,'head',-.3*d)},
 backflip:(P,e)=>{const w=anW(e,.12),f=c01((e-.1)/.85);P.rootR.x=-Math.PI*2*ezio(f);P.root.y=18*bump(f)-4*w;pz(P,'thighL',-1.2*bump(f)-.5*w);pz(P,'shinL',1.8*bump(f)+1*w);pz(P,'thighR',-1.2*bump(f)-.4*w);pz(P,'shinR',1.8*bump(f)+.9*w);
  pz(P,'armL',-1+.8*w,0,.3);pz(P,'armR',-1+.8*w,0,-.3);pz(P,'chest',.35*w)},
 // cri / déchaînement : le corps se ramasse (élan) puis tout s'ouvre, buste rejeté, frémissement
 roar:(P,e,u,t)=>{const w=anW(e,.18),k=anK(e,.18,.12),v=Math.sin((t||0)*45)*.03*k;pz(P,'armL',-.4*k-.9*w,0,1.35*k-.5*w+v);pz(P,'armR',-.4*k-.9*w,0,-1.35*k+.5*w-v);pz(P,'foreL',-1.4*w-.2*k);pz(P,'foreR',-1.4*w-.2*k);
  pz(P,'chest',.4*w-.45*k);pz(P,'head',.3*w-.5*k);P.root.y=-3*w-2*k;pz(P,'thighL',-.2*w,0,.32*k);pz(P,'thighR',0,0,-.32*k);pz(P,'shinL',.5*(w+k));pz(P,'shinR',.45*(w+k))},
 // regard (dôjutsu) : deux doigts près de l'œil, tête avancée, l'autre bras écarté
 eye:(P,e,u,t)=>{const k=ezo(c01(e/.2));pz(P,'armR',-2.05*k,0,.55*k);pz(P,'foreR',-2.45*k);pz(P,'handR',-.4*k);pz(P,'head',.15*k-.08,.1*k+.03*Math.sin((t||0)*2.5));pz(P,'chest',.05*k);pz(P,'armL',-.35,0,.5*k);pz(P,'foreL',-.4);
  pz(P,'thighL',-.2*k,0,.1);pz(P,'shinL',.25*k)},
 // sceau : signe d'une main devant le visage, puis paume plaquée vers l'avant
 seal:(P,e)=>{if(e<.35){const k=ezo(e/.35);pz(P,'armR',-1.45*k,0,.38*k);pz(P,'foreR',-1.9*k);pz(P,'handR',-.4*k);pz(P,'armL',.2,0,.35);pz(P,'foreL',-.4);pz(P,'head',.15*k);P.root.y=-1.5*k;return}
  const k=ezo(c01((e-.35)/.15));pz(P,'armR',-1.45-.15*k,0,.38-.28*k);pz(P,'foreR',-1.9+1.85*k);pz(P,'handR',-.4-.6*k);pz(P,'armL',-1.1*k,0,-.45);pz(P,'foreL',-1.7);pz(P,'chest',.2*k,.25*k);P.root.z=5*k;P.root.y=-1.5;anFent(P,k,.7)},
 channel:(P,e,u,t)=>{pz(P,'armL',-2.9,0,.4);pz(P,'armR',-2.9,0,-.4);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'head',-.4);pz(P,'chest',-.15);P.root.y=Math.sin(t*20)*.4+.8;pz(P,'thighL',0,0,.2);pz(P,'thighR',0,0,-.2)},
 dance:(P,e)=>{P.rootR.y=Math.PI*4*ezio(e);pz(P,'armL',-1.7,0,1);pz(P,'armR',-.9,0,-1.2);pz(P,'thighL',-.5);pz(P,'shinL',.6);P.root.y=2*bump(e*2%1)},
 guard:(P,e)=>{P.root.y=-3;pz(P,'armL',-1.45,0,-.48);pz(P,'foreL',-1.55);pz(P,'armR',-1.45,0,.48);pz(P,'foreR',-1.55);pz(P,'chest',.2);pz(P,'thighL',-.4,0,.14);pz(P,'shinL',.6);pz(P,'thighR',.3,0,-.14);pz(P,'shinR',.55)},
 swirl:(P,e,u,t)=>{const a=t*10;pz(P,'armL',-1.5+Math.sin(a)*.6,0,.6+Math.cos(a)*.4);pz(P,'armR',-1.5+Math.sin(a+Math.PI)*.6,0,-.6-Math.cos(a)*.4);P.root.y=-1.5;pz(P,'shinL',.3);pz(P,'shinR',.3);pz(P,'chest',.1,Math.sin(a*.5)*.2)},
 kneel:(P,e)=>ANIM.summon(P,1),
});

// ----- chien ninja (Inuzuka) en 3D : même style, petit squelette à quatre pattes
const DBONES=[['root',null,[0,0,0]],['body','root',[0,11,0]],['head','body',[0,4.5,8]],['legFL','body',[3.2,-3,5.5]],['legFR','body',[-3.2,-3,5.5]],['legBL','body',[3.2,-3,-5.5]],['legBR','body',[-3.2,-3,-5.5]],['tail','body',[0,2.5,-8.5]]];
const DBI=Object.fromEntries(DBONES.map((b,i)=>[b[0],i]));
function buildDog3D(){const T=THREE;let G=N3.geo.get('dog');if(!G){const P=[],N=[],C=[],SI=[],SW=[],rest={};for(const [n,p,o] of DBONES){const v=new T.Vector3(...o);if(p)v.add(rest[p]);rest[n]=v}
 const M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),S=new T.Vector3(),V=new T.Vector3();
 const add=(g,bone,c,pos=[0,0,0],rot=[0,0,0],scl=[1,1,1])=>{const gg=g.index?g.toNonIndexed():g;E.set(...rot);Q.setFromEuler(E);V.set(...pos).add(rest[bone]);S.set(...scl);M.compose(V,Q,S);gg.applyMatrix4(M);
  const a=gg.attributes.position,nn=gg.attributes.normal,cc=new T.Color(c),bi=DBI[bone];for(let i=0;i<a.count;i++){P.push(a.getX(i),a.getY(i),a.getZ(i));N.push(nn.getX(i),nn.getY(i),nn.getZ(i));C.push(cc.r,cc.g,cc.b);SI.push(bi,0,0,0);SW.push(1,0,0,0)}};
 const fur='#f4f0e8',tan='#c8a080';
 add(new T.CapsuleGeometry(5.6,8,3,10),'body',fur,[0,0,0],[Math.PI/2,0,0],[1,1,.95]);add(new T.SphereGeometry(6,14,10),'head',fur,[0,1,1]);add(new T.CapsuleGeometry(2.6,3,2,8),'head',fur,[0,-.6,6],[Math.PI/2,0,0]);
 add(new T.SphereGeometry(1.2,8,6),'head','#111',[0,.4,8.6]);for(const x of[-2.8,2.8]){add(new T.ConeGeometry(2,5.5,6),'head',tan,[x,6.2,-.5],[0,0,x>0?-.35:.35]);add(new T.SphereGeometry(.9,8,6),'head','#111',[x*.75,2.2,4.6])}
 for(const l of['legFL','legFR','legBL','legBR']){add(new T.CapsuleGeometry(1.7,4.6,2,8),l,fur,[0,-3.4,0]);add(new T.SphereGeometry(1.9,8,6),l,fur,[0,-6.6,.6],[0,0,0],[1,.7,1.2])}
 add(new T.ConeGeometry(1.6,8,7),'tail',fur,[0,3,-1.5],[-.7,0,0]);add(new T.TorusGeometry(4.2,.7,6,14),'body','#c0303a',[0,3.2,5],[Math.PI/2-.4,0,0]);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('normal',new T.Float32BufferAttribute(N,3));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(SI,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(SW,4));
 G={geo,n:0,last:0};N3.geo.set('dog',G)}
 G.n++;const geo=G.geo;
 const bones=DBONES.map(([n,p,o])=>{const b=new T.Bone();b.name=n;b.position.set(...o);return b});DBONES.forEach(([n,p],i)=>{if(p)bones[DBI[p]].add(bones[i])});
 const mat=new T.MeshToonMaterial({vertexColors:true,gradientMap:N3.gm}),mesh=new T.SkinnedMesh(geo,mat);mesh.add(bones[0]);const skel=new T.Skeleton(bones);mesh.bind(skel);mesh.frustumCulled=false;
 const out=new T.SkinnedMesh(geo,N3.outline);out.bind(skel,mesh.bindMatrix);out.frustumCulled=false;geo.boundingSphere||geo.computeBoundingSphere();mesh.boundingSphere=out.boundingSphere=geo.boundingSphere;const grp=new T.Group();grp.add(mesh);grp.add(out);N3.sc.add(grp);
 const cur={};for(const [n] of DBONES)cur[n]=new T.Quaternion();
 return{grp,mesh,out,mat,bones,skel,key:'dog',G,cur,rootP:new T.Vector3(),rootR:new T.Euler(),yaw:0,used:0,dog:1,face:{geometry:{dispose(){}},material:{dispose(){}}},sym:{geometry:{dispose(){}},material:{dispose(){}}}}}
function poseDog(d,rec,dt,t){const u=d.owner,run=u.moving||u.dash,atk=u.swing>0||(u.anim&&u.anim.t>0),w=t*16,P={};
 const lg=(n,x)=>{P[n]=x};if(run){lg('legFL',Math.sin(w)*.8);lg('legBR',Math.sin(w)*.8);lg('legFR',-Math.sin(w)*.8);lg('legBL',-Math.sin(w)*.8)}
 let ry=0,rz=0,hx=Math.sin(t*2)*.05;if(atk){lg('legFL',-1.1);lg('legFR',-1.1);hx=-.35;rz=6}
 for(const [n] of DBONES){if(n==='root')continue;const b=rec.bones[DBI[n]],q=rec.cur[n];const x=n==='head'?hx:n==='tail'?.2:P[n]||0,y=n==='tail'?Math.sin(t*14)*.6:0;_E.set(x,y,0);_Q.setFromEuler(_E);q.slerp(_Q,1-Math.exp(-16*dt));b.quaternion.copy(q)}
 const rb=rec.bones[0];rec.rootP.z+=(rz-rec.rootP.z)*(1-Math.exp(-14*dt));rec.rootP.y=run?Math.abs(Math.cos(w))*1.2:0;rb.position.copy(rec.rootP);
 const a=d.aim||0,want=Math.PI/2-Math.atan2(Math.sin(a)*.7+.42,Math.cos(a));let dd=want-rec.yaw;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;rec.yaw+=dd*(1-Math.exp(-14*dt))}
