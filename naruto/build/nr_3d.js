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
// vitesse de mise en place de chaque os (plus haut = plus sec)
const BRATE={root:16,hips:16,spine:16,chest:18,neck:18,head:16,hair:7,band:6,armL:22,foreL:22,handL:22,armR:22,foreR:22,handR:22,cape:6,cape2:5,skirt:10,thighL:18,shinL:18,footL:18,thighR:18,shinR:18,footR:18};
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
 Object.assign(N3,{ok:true,r,cv,sc,cam,right,up,fwd,gm,outline,faceTex:new Map(),symTex:new Map(),cols:0,rows:0,small:0});atlasSize(2);
 // l'ordre d'affichage : un projet Three.js ne reçoit pas les ombres portées (ombre ovale du 2D conservée)
 return true}catch(e){console.warn('3D indisponible, dessin 2D',e);N3.ok=false;return false}}
// ----- fabrication du modèle (géométrie fusionnée, un os par pièce : pièces rigides, rendu en 2 appels par ninja)
const col3=h=>new THREE.Color(h);
function lookKey(u){const L=u.ch.look;return JSON.stringify([L,u.ch.look.weapon&&u.ch.look.weapon.k])}
function buildNinja3D(u){const L=u.ch.look,h=L.head,W=L.weapon||{},k=W.k||'fist',T=THREE;
 const P=[],N=[],C=[],SI=[],SW=[];const rest={};
 for(const [n,p,o] of BONES){const v=new T.Vector3(...o);if(p)v.add(rest[p]);rest[n]=v}
 const M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),S=new T.Vector3(),V=new T.Vector3();
 // ajoute une pièce : g géométrie, bone os, c couleur, [x,y,z] position relative à l'os au repos, [rx,ry,rz], [sx,sy,sz]
 const add=(g,bone,c,pos=[0,0,0],rot=[0,0,0],scl=[1,1,1])=>{const gg=g.index?g.toNonIndexed():g;if(rot.isQuaternion)Q.copy(rot);else{E.set(...rot);Q.setFromEuler(E)}V.set(...pos).add(rest[bone]);S.set(...scl);M.compose(V,Q,S);gg.applyMatrix4(M);
  const a=gg.attributes.position,nn=gg.attributes.normal,cc=col3(c),bi=BI[bone];for(let i=0;i<a.count;i++){P.push(a.getX(i),a.getY(i),a.getZ(i));N.push(nn.getX(i),nn.getY(i),nn.getZ(i));C.push(cc.r,cc.g,cc.b);SI.push(bi,0,0,0);SW.push(1,0,0,0)}};
 const sph=(r,w=12,hh=9)=>new T.SphereGeometry(r,w,hh),sphp=(...a)=>new T.SphereGeometry(...a),cap=(r,l,s=8)=>new T.CapsuleGeometry(r,l,3,s),cyl=(a,b,hh,s=12)=>new T.CylinderGeometry(a,b,hh,s),box=(x,y,z)=>new T.BoxGeometry(x,y,z),cone=(r,hh,s=7)=>new T.ConeGeometry(r,hh,s),tor=(R,r,s=14)=>new T.TorusGeometry(R,r,6,s);
 const skin=h.skin,hair=h.hair,legs=L.legs||'#2a3550',torso=L.torso||'#f08a24',arm=L.arm||torso,boot=L.boot||'#222',band=h.band||'#1f3a6a';
 const fistC=k==='fist'||k==='bigfist'?'#f0ebe0':skin,big=k==='bigfist';
 // jambes et sandales (orteils visibles)
 for(const s of['L','R']){const sx=s==='L'?1:-1;
  add(cap(3.3,5.6),'thigh'+s,legs,[0,-4.6,0]);add(cap(3,5),'shin'+s,legs,[0,-4.4,0]);add(cyl(3.1,3.3,2.2,10),'shin'+s,'#e8e0d0',[0,-7.8,0]);
  add(box(5.2,2.4,8.6),'foot'+s,boot,[0,-.6,1.4]);add(sph(1.9,8,6),'foot'+s,skin,[0,.4,4.6],[0,0,0],[1.25,.6,.7])}
 // bassin, ventre, torse, ceinture
 add(cap(7.6,3,10),'hips',legs,[0,1.5,0],[0,0,Math.PI/2],[1,1.15,.78]);
 add(cap(8.4,3.5,12),'spine',torso,[0,4,0],[0,0,0],[1,1,.76]);add(cap(9.6,5.5,12),'chest',torso,[0,1.5,0],[0,0,0],[1,1,.74]);
 if(L.belt)add(tor(8.3,1.2),'spine',L.belt,[0,-.6,0],[Math.PI/2,0,0],[1,.78,1]);
 if(torso==='#f08a24'){add(cap(9.9,1.6,12),'chest',L.belt||'#2a3550',[0,6.2,0],[0,0,0],[1,1,.76]);add(box(1.2,15,.6),'chest',L.belt||'#2a3550',[0,0,7.2])}
 if(L.vest){add(cap(10.4,5,12),'chest',L.vest,[0,1.2,.2],[0,0,0],[1,1,.8]);add(tor(5.6,1.8),'chest',L.vest,[0,8.2,0],[Math.PI/2,0,0]);for(const x of[-4.6,4.6])for(const y of[-1.5,3])add(box(4,3.2,1.6),'chest',L.vest,[x,y,7.6])}
 if(L.tunic){add(tor(5.2,2.1),'chest',L.tunic,[0,8.5,0],[Math.PI/2,0,0]);add(cyl(3.6,3.6,.8,14),'chest','#ffffff',[0,2,-7.6],[Math.PI/2,0,0]);add(cyl(3.6,3.6,.9,14),'chest','#d02a2a',[0,.4,-7.7],[Math.PI/2,0,0],[1,1,.5])}
 if(L.armor){add(cap(10.2,3.6,12),'chest',L.armor,[0,2.4,.6],[0,0,0],[1,.9,.8]);add(sph(4.2,10,7),'armL',L.armor,[1,-.5,0],[0,0,0],[1,.8,1])}
 if(L.robe){add(cyl(10.2,14.5,24,16),'skirt',L.robe,[0,-6,0]);add(cap(10.6,5.5,12),'chest',L.robe,[0,1.2,0],[0,0,0],[1,1,.8]);add(cyl(6,7.2,5,14),'chest',L.robe,[0,9,0]);
  // nuages rouges de l'Akatsuki, posés sur la surface du manteau
  if(L.clouds)for(const [bn,x,y,z] of[['chest',-5,-2,8.1],['chest',4,4,8.3],['chest',6,2,-7.4],['skirt',5,-12,12.6],['skirt',-5,-15,-13.2],['skirt',-11,-9,4.6]]){const b=Math.atan2(x,z),ox=Math.sin(b)*.35,oz=Math.cos(b)*.35;
   add(sph(3.3,10,7),bn,'#ffffff',[x,y,z],[0,b,0],[1.25,.78,.3]);add(sph(2.6,10,7),bn,'#c0202a',[x+ox,y,z+oz],[0,b,0],[1.2,.7,.3])}}
 if(L.cape){add(box(18,13.5,1),'cape',L.cape,[0,-6.5,-.4]);add(box(17,15,1),'cape2',L.cape,[0,-7.2,-.4])}
 if(L.gourd){add(sph(6.5,12,9),'chest','#c8945a',[1,-2,-11],[0,0,0],[1,1.1,.95]);add(sph(4.4,12,9),'chest','#c8945a',[2.4,6.4,-11.5]);add(tor(9.5,.8,16),'chest','#8a3a2a',[0,1,-1],[.2,0,.75],[1,1.05,.95])}
 // bras, mains (bandages pour le taijutsu), cou, tête
 for(const s of['L','R']){add(cap(2.7,5.4),'arm'+s,arm,[0,-4.4,0]);add(sph(3.1,10,7),'arm'+s,arm,[0,0,0]);add(cap(2.45,5),'fore'+s,arm,[0,-4,0]);add(sph(big?3.9:2.9,10,8),'hand'+s,fistC,[0,-1.6,.3])}
 add(cyl(3.2,3.6,4.5,10),'neck',skin,[0,1.4,0]);
 add(sph(12.6,20,15),'head',skin,[0,8,0],[0,0,0],[1.03,.97,.96]);for(const x of[-12,12])add(sph(2.3,8,6),'head',skin,[x,7.5,0],[0,0,0],[.6,1,1]);
 // bandeau frontal et plaque
 add(tor(12.2,1.5,22),'head',band,[0,15.2,-.4],[Math.PI/2+.05,0,0],[1.03,.98,1]);add(box(9.6,5.2,1.6),'head','#c8ccd6',[0,15.3,11.2],[-.32,0,0]);
 add(box(1.6,7,.8),'band',band,[1.2,-3.5,0],[0,0,.2]);add(box(1.6,6.5,.8),'band',band,[-1.2,-3.2,0],[0,0,-.25]);
 // cheveux : calotte + mèches (cônes qui sortent du crâne dans la direction donnée par [élévation, tour])
 const hc=hair,st=h.style,HC=new T.Vector3(0,8,0),UPV=new T.Vector3(0,1,0);
 const spike=(el,az,len,rad,bone='head',col=hc)=>{const d=new T.Vector3(Math.sin(el)*Math.sin(az),Math.cos(el),Math.sin(el)*Math.cos(az)),q=new T.Quaternion().setFromUnitVectors(UPV,d);const base=HC.clone().addScaledVector(d,10.6+len*.45);add(cone(rad,len,6),bone,col,[base.x,base.y,base.z],q)};
 if(st!=='chauve')add(sphp(13.3,20,12,0,Math.PI*2,0,Math.PI*.5),'head',hc,[0,8.4,-.9],[-.42,0,0],[1.05,1.06,1.05]);
 if(st==='pics'){for(const [el,az,l,r] of[[.25,0,12,4.2],[.45,1.1,12,4],[.45,-1.1,12,4],[.62,2.2,11,4],[.62,-2.2,11,4],[.75,3.1,11,4],[.95,2.6,10,3.6],[.95,-2.6,10,3.6],[1.25,3.0,9,3.4],[1.2,1.75,9,3.2],[1.2,-1.75,9,3.2],[.55,.4,9,3.5],[.55,-.4,9,3.5]])spike(el,az,l,r);
  for(const az of[-.55,0,.55])spike(1.25,az,6,2.6)}
 if(st==='lisse'){add(cap(12.6,6,16),'head',hc,[0,4.5,-4.4],[0,0,0],[1.05,1.05,.62]);for(const x of[-11.8,11.8])add(cap(2.6,10,8),'head',hc,[x,4,3.5]);spike(1.15,.35,6,3.2);spike(1.15,-.35,6,3.2);spike(1.2,0,5,3)}
 if(st==='queue'){add(cone(4.8,15,7),'hair',hc,[0,4.5,-1],[-2.3,0,0]);add(sph(2.5,8,6),'hair','#3a2a20',[0,-.4,0]);for(const az of[-.5,0,.5])spike(1.2,az,5,2.8)}
 if(st==='courts'){for(const [el,az] of[[1.1,2.7],[1.1,-2.7],[1.25,3.14],[.95,2.2],[.95,-2.2]])spike(el,az,8,3.4);for(const az of[-.5,0,.5])spike(1.2,az,5,2.8)}
 if(st==='chignons'){for(const x of[-9.5,9.5])add(sph(5.2,12,9),'head',hc,[x,19.5,-2.5]);for(const az of[-.5,0,.5])spike(1.2,az,5,2.8)}
 if(h.acc==='masque')add(sphp(12.9,18,10,Math.PI*.15,Math.PI*.7,Math.PI*.52,Math.PI*.36),'head','#2a3550',[0,8,.2],[0,0,0],[1.03,.97,.96]);
 // armes selon le style
 const wpn=W.col||'#3af';
 if(k==='kunai'){add(box(2.6,4.2,3),'thighR','#3a3a44',[-3,-3,1.6]);add(cyl(.7,.7,4,6),'handR','#3a3a44',[0,-3.2,1.2],[0,0,0]);add(cone(1.6,6,4),'handR','#d3d8e2',[0,-7.8,1.2],[Math.PI,0,0]);add(tor(1.1,.35,8),'handR','#3a3a44',[0,-.6,1.2])}
 if(k==='sword'){add(cyl(.8,.8,6,6),'handR','#2a2a33',[0,-1,2.8],[Math.PI/2,0,0]);add(cyl(2.2,2.2,.6,10),'handR','#c8a040',[0,-1,5.6],[Math.PI/2,0,0]);add(box(1.2,.5,32),'handR','#e8ecf2',[0,-1,22]);add(box(1,4,20),'chest','#2a2a33',[6,-2,-8],[0,0,.7])}
 if(k==='bone'){add(cone(1.9,24,6),'foreR','#f2efe6',[0,-14,-1.5],[Math.PI-.15,0,0]);add(cone(1.4,10,6),'foreL','#f2efe6',[0,-8,-1.5],[Math.PI-.4,0,0])}
 if(k==='claws')for(const s of['L','R'])for(const x of[-1.2,0,1.2])add(cone(.6,4.6,4),'hand'+s,'#f4f0e8',[x,-4.4,1.4],[Math.PI+.3,0,0]);
 if(k==='senbon')for(const x of[-1,0,1])add(cyl(.18,.18,9,4),'handR','#e8eef6',[x,-3,2.6],[1.2,0,0]);
 if(k==='chain')for(let i=0;i<4;i++)add(tor(1.2,.4,8),'foreR','#e8c860',[0,-1.5-i*2,0],[0,i*1.2,0]);
 // géométrie fusionnée + squelette
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('normal',new T.Float32BufferAttribute(N,3));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(SI,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(SW,4));
 const bones=BONES.map(([n,p,o])=>{const b=new T.Bone();b.name=n;b.position.set(...o);return b});BONES.forEach(([n,p],i)=>{if(p)bones[BI[p]].add(bones[i])});
 const mat=new T.MeshToonMaterial({vertexColors:true,gradientMap:N3.gm});
 const mesh=new T.SkinnedMesh(geo,mat);mesh.add(bones[0]);const skel=new T.Skeleton(bones);mesh.bind(skel);mesh.frustumCulled=false;
 const out=new T.SkinnedMesh(geo,N3.outline);out.bind(skel,mesh.bindMatrix);out.frustumCulled=false;
 const grp=new T.Group();grp.add(mesh);grp.add(out);
 // visage (yeux, bouche, marques, masque) et symbole du village : décalques sur la tête
 const face=new T.Mesh(new T.SphereGeometry(12.75,20,14,Math.PI/2-1.05,2.1,Math.PI/2-.8,1.6),new T.MeshBasicMaterial({map:faceTexture(L),transparent:true,depthWrite:false}));
 face.position.set(0,8,0);face.scale.set(1.03,.97,.96);bones[BI.head].add(face);
 const sym=new T.Mesh(new T.PlaneGeometry(7.4,4.2),new T.MeshBasicMaterial({map:symTexture(h.vil),transparent:true,depthWrite:false}));sym.position.set(0,15.3,12.05);sym.rotation.x=-.32;bones[BI.head].add(sym);
 N3.sc.add(grp);
 const cur={};for(const [n] of BONES)cur[n]=new T.Quaternion();
 return{grp,mesh,out,mat,bones,skel,key:lookKey(u),cur,rootP:new T.Vector3(),rootR:new T.Euler(),yaw:Math.PI/2-(u.aim||0),used:0,face,sym,k}}
// visage dessiné sur une petite toile (même style que le 2D : grands yeux à reflet, Sharingan, Byakugan…)
function faceTexture(L){const h=L.head,key=[h.eye,h.acc,h.kaguya,h.brows,h.skin].join('|');if(N3.faceTex.has(key))return N3.faceTex.get(key);
 // toile = devant de la tête (≈ 9,7 px par unité, centre de la tête en 128,100) : mêmes proportions que le visage 2D
 const c=document.createElement('canvas');c.width=256;c.height=200;const x=c.getContext('2d'),U=9.7,ex=128,hy=100,ey=hy+2.2*U;
 if(h.acc==='marques'){x.fillStyle='#c22';for(const s of[-1,1]){x.beginPath();x.moveTo(ex+s*5*U,hy+4*U);x.lineTo(ex+s*8*U,hy+4*U);x.lineTo(ex+s*6.5*U,hy+9*U);x.fill()}}
 if(h.acc==='moust'){x.strokeStyle='#5a3a22';x.lineWidth=3;x.lineCap='round';for(const s of[-1,1])for(let q=0;q<3;q++){x.beginPath();x.moveTo(ex+s*5*U,hy+(4.6+q*1.6)*U);x.lineTo(ex+s*9.6*U,hy+(4+q*2.2)*U);x.stroke()}}
 for(const s of[-1,1]){const cx=ex+s*4.2*U;x.fillStyle='#fff';x.strokeStyle='#1a1410';x.lineWidth=4;x.beginPath();x.ellipse(cx,ey,2.7*U,3.3*U,0,0,7);x.fill();x.stroke();
  const eye=h.eye||'#2a2a38',ix=cx+s*.5*U;
  if(h.eye==='#e8e8f8'){x.fillStyle='#d6d6ec';x.beginPath();x.ellipse(ix,ey+.3*U,1.9*U,2.6*U,0,0,7);x.fill();x.strokeStyle='#a8aed0';x.lineWidth=2;x.stroke()}
  else{x.fillStyle=eye;x.beginPath();x.ellipse(ix,ey+.3*U,1.8*U,2.5*U,0,0,7);x.fill();
   if(h.eye==='#e01a1a'){x.fillStyle='#111';x.beginPath();x.arc(ix,ey+.4*U,.6*U,0,7);x.fill();x.strokeStyle='#111';x.lineWidth=1.5;x.beginPath();x.arc(ix,ey+.4*U,1.2*U,0,7);x.stroke();for(let i=0;i<3;i++){const a=i*2.09+.5;x.beginPath();x.arc(ix+Math.cos(a)*1.2*U,ey+.4*U+Math.sin(a)*1.2*U,.38*U,0,7);x.fill()}}
   else{x.fillStyle='#0a0a12';x.beginPath();x.ellipse(ix,ey+.6*U,.9*U,1.4*U,0,0,7);x.fill()}}
  x.fillStyle='#fff';x.beginPath();x.arc(ix-.7*U,ey-1*U,.75*U,0,7);x.fill();x.beginPath();x.arc(ix+.6*U,ey+1.2*U,.35*U,0,7);x.fill()}
 if(h.brows){x.fillStyle='#111';for(const s of[-1,1])x.fillRect(ex+s*4.5*U-3*U,hy-4.2*U,6*U,2.2*U)}
 else{x.strokeStyle='#3a2a20';x.lineWidth=4;x.lineCap='round';for(const s of[-1,1]){x.beginPath();x.moveTo(ex+s*2.4*U,hy-2.6*U);x.lineTo(ex+s*6.2*U,hy-3.1*U);x.stroke()}}
 if(h.kaguya){x.fillStyle='#c22';for(const s of[-1,1]){x.beginPath();x.arc(ex+s*3*U,hy-4.4*U,.8*U,0,7);x.fill()}}
 x.strokeStyle='#5a3020';x.lineWidth=3.5;x.lineCap='round';x.beginPath();x.moveTo(ex-1.5*U,hy+6.8*U);x.quadraticCurveTo(ex,hy+7.4*U,ex+1.5*U,hy+6.8*U);x.stroke();
 if(h.acc==='lunettes'){x.fillStyle='rgba(30,30,40,.93)';for(const s of[-1,1]){x.beginPath();x.roundRect(ex+s*4.2*U-3.1*U,ey-2.1*U,6.2*U,4.2*U,1.2*U);x.fill()}x.fillRect(ex-1.3*U,ey-.6*U,2.6*U,1*U)}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;N3.faceTex.set(key,t);return t}
function symTexture(v){if(N3.symTex.has(v))return N3.symTex.get(v);const c=document.createElement('canvas');c.width=96;c.height=56;const x=c.getContext('2d');const ex=48,hy=28;
 x.strokeStyle='#3a3f4a';x.lineWidth=4;x.lineCap='round';x.beginPath();
 switch(v){case 0:x.arc(ex,hy,10,0,5.2);x.moveTo(ex+9,hy-2);x.lineTo(ex+19,hy-11);break;case 1:x.moveTo(ex-14,hy-12);x.lineTo(ex+14,hy+12);x.moveTo(ex+14,hy-12);x.lineTo(ex-14,hy+12);break;
  case 2:for(let q=0;q<4;q++){x.moveTo(ex-14+q*9,hy-12);x.lineTo(ex-14+q*9,hy+12)}break;case 3:x.arc(ex-8,hy,7,0,7);x.moveTo(ex+15,hy);x.arc(ex+8,hy,7,0,7);break;
  case 4:x.moveTo(ex-15,hy+12);x.lineTo(ex-5,hy-12);x.lineTo(ex+5,hy+12);x.lineTo(ex+15,hy-12);break;case 5:x.arc(ex-4,hy+5,6,0,7);x.moveTo(ex+3,hy+5);x.lineTo(ex+3,hy-13);break;
  default:x.arc(ex,hy,10,0,5.2);x.stroke();x.strokeStyle='#b22';x.lineWidth=4;x.beginPath();x.moveTo(ex-28,hy-2);x.lineTo(ex+28,hy+3)}x.stroke();
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;N3.symTex.set(v,t);return t}

// ----- poses : chaque image, on calcule une pose cible d'après l'état du ninja, puis chaque os la rejoint en douceur
const E3=(P,b)=>P[b]||(P[b]={x:0,y:0,z:0});
const ezo=x=>1-(1-x)*(1-x),ezio=x=>x<.5?2*x*x:1-(-2*x+2)**2/2,bump=x=>Math.sin(Math.PI*Math.min(1,Math.max(0,x)));
// petites aides de pose pour les animations nommées
const pz=(P,b,x=0,y=0,z=0)=>{const o=E3(P,b);o.x=x;o.y=y;o.z=z;return o},padd=(P,b,x=0,y=0,z=0)=>{const o=E3(P,b);o.x+=x;o.y+=y;o.z+=z;return o};
// mains jointes pour les mudras : 12 signes (bras et avant-bras gauche/droit), comme les signes du 2D
const MUDP=[[-1.25,-.62,-1.75,-1.25,.62,-1.75],[-1.2,-.5,-1.55,-1.05,.7,-1.9],[-.95,-.6,-1.35,-.95,.6,-1.35],[-1.35,-.45,-1.4,-1.35,.45,-1.4],[-1.5,-.7,-1.9,-.9,.4,-1.4],[-1.45,-.25,-1.6,-1.45,.25,-1.6],
 [-1,-.65,-1.5,-1.25,.4,-1.7],[-.9,-.55,-1.1,-.9,.55,-1.1],[-1.6,-.6,-1.95,-1.6,.6,-1.95],[-1.2,-.8,-1.6,-1.2,.8,-1.6],[-1.05,-.3,-1.5,-1.4,.7,-1.85],[-.95,-.5,-1.45,-1.2,.65,-1.7]];
function basePose(u,t,rec,P){const run=u.moving?(u.dash||u.haste>0?2:1):0,w=u.walk||0,air=(u.z||0)>4||u.airT>0;
 P.root={x:0,y:0,z:0};P.rootR={x:0,y:0,z:0};
 if(u.dead){const d=Math.min(1,(u.deadT||0)*4);P.rootR.x=-1.45*ezo(d);P.root.y=2*d;pz(P,'armL',-.4*d,0,1.1*d);pz(P,'armR',-.4*d,0,-1.1*d);pz(P,'head',-.3*d);return P}
 // repos : respiration, bras un peu écartés
 const br=Math.sin(t*2.1);pz(P,'chest',.03*br);pz(P,'head',-.04*br,Math.sin(t*.7)*.08);pz(P,'armL',.05*br,0,.14);pz(P,'armR',.05*br,0,-.14);pz(P,'foreL',-.25);pz(P,'foreR',-.25);P.root.y=.35*br;
 if(run){const a=run>1?1.05:.78,s=Math.sin(w),c=Math.cos(w);
  pz(P,'thighL',-s*a,0,0);pz(P,'thighR',s*a,0,0);pz(P,'shinL',.25+Math.max(0,Math.sin(w-1.1))*1.25);pz(P,'shinR',.25+Math.max(0,Math.sin(w+Math.PI-1.1))*1.25);
  pz(P,'footL',-.2*s);pz(P,'footR',.2*s);P.root.y=Math.abs(c)*1.6-.6;pz(P,'hips',0,s*.16);
  if(run>1){pz(P,'chest',.5,-s*.12);pz(P,'spine',.18);pz(P,'head',-.42);pz(P,'armL',.95,0,.32);pz(P,'armR',.95,0,-.32);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'cape',-.9);pz(P,'cape2',-.35)}
  else{pz(P,'chest',.14,-s*.14);pz(P,'armL',s*.65,0,.12);pz(P,'armR',-s*.65,0,-.12);pz(P,'foreL',-.7-.25*Math.max(0,-s));pz(P,'foreR',-.7-.25*Math.max(0,s));pz(P,'cape',-.35-Math.abs(s)*.1);pz(P,'cape2',-.2)}
  pz(P,'hair',.3+Math.sin(w*2)*.1);pz(P,'band',.5+Math.sin(w*2)*.15)}
 else{pz(P,'hair',Math.sin(t*1.7)*.06);pz(P,'band',.15+Math.sin(t*2.3)*.12);pz(P,'cape',-.05+Math.sin(t*1.4)*.04)}
 if(air){pz(P,'thighL',-.9);pz(P,'shinL',1.5);pz(P,'thighR',-.4);pz(P,'shinR',1.1);pz(P,'armL',-.5,0,.6);pz(P,'armR',-.5,0,-.6);pz(P,'cape',-.7)}
 // garde de combat après un coup au corps à corps
 if(!run&&u.cmbT>0&&MELEEK.has(u.ch.look.weapon.k)&&!u.swing){P.root.y=-2.2;pz(P,'thighL',-.35,0,.12);pz(P,'thighR',.25,0,-.12);pz(P,'shinL',.55);pz(P,'shinR',.6);pz(P,'chest',.12,.35);pz(P,'head',0,-.3);
  pz(P,'armL',-1.05,0,.18);pz(P,'foreL',-1.75);pz(P,'armR',-.85,0,-.25);pz(P,'foreR',-1.9)}
 return P}
// enchaînement au corps à corps : 5 coups différents selon le style (poing, paume, sabre, gros poing, griffes, os)
function comboPose(u,P,cs,ph,k){const pl=ph,fs=1;
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
function actionPose(u,t,rec,P){const k=u.ch.look.weapon.k;
 if(u.dead)return P;
 if(u.block){P.root.y=-2;pz(P,'armL',-1.35,0,-.55);pz(P,'foreL',-1.25);pz(P,'armR',-1.35,0,.55);pz(P,'foreR',-1.25);pz(P,'chest',.15);pz(P,'thighL',-.3);pz(P,'shinL',.5);pz(P,'shinR',.4)}
 if(u.chk){P.root.y=-3.5+Math.sin(t*40)*.25;pz(P,'thighL',-.1,0,.42);pz(P,'thighR',-.1,0,-.42);pz(P,'shinL',.55);pz(P,'shinR',.55);pz(P,'armL',.15,0,.55);pz(P,'armR',.15,0,-.55);pz(P,'foreL',-.5);pz(P,'foreR',-.5);pz(P,'chest',-.12);pz(P,'head',-.18)}
 const md=typeof mudraOf==='function'?mudraOf(u):null;
 if(md){const m=MUDP[(MUDP.length+((md.sg&&SIGNS.indexOf(md.sg))||0))%MUDP.length],snap=md.q<.25?Math.sin(md.q/.25*Math.PI)*.18:0;
  pz(P,'armL',m[0]-snap,0,m[1]);pz(P,'foreL',m[2]);pz(P,'armR',m[3]-snap,0,m[4]);pz(P,'foreR',m[5]);pz(P,'head',.22);pz(P,'chest',.08);P.root.y=-1.2}
 else if(u.cast){pz(P,'armL',-1.2,0,-.5);pz(P,'foreL',-1.6);pz(P,'armR',-1.2,0,.5);pz(P,'foreR',-1.6)}
 if(u.flame){pz(P,'armL',-1.3,0,-.35);pz(P,'foreL',-2.3);pz(P,'armR',-1.3,0,.35);pz(P,'foreR',-2.3);pz(P,'chest',.25+Math.sin(t*20)*.03);pz(P,'head',.1);P.root.y=-1.5}
 if(u.chan){pz(P,'armL',-2.9,0,.35);pz(P,'armR',-2.9,0,-.35);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'head',-.4);pz(P,'chest',-.2)}
 if(u.spin){P.rootR.y=t*22;pz(P,'armL',-1.45,0,1.3);pz(P,'armR',-1.45,0,-1.3);pz(P,'foreL',-.1);pz(P,'foreR',-.1)}
 if(u.thrT>0){const e=1-u.thrT/.2,a=e<.35?e/.35:1-(e-.35)/.65*.5;pz(P,'armR',-3.3+2*a,0,-.15);pz(P,'foreR',-1.4+1.3*a);pz(P,'chest',.1,.45*a-.2);pz(P,'armL',-.5,0,.4)}
 else if(u.relT>0){const e=1-u.relT/.3,ph=e<.25?e/.25:1-(e-.25)/.75*.7;pz(P,'armL',-1.5*ph-.1,0,-.2*ph);pz(P,'armR',-1.5*ph-.1,0,.2*ph);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'chest',.2*ph);P.root.z=4*ph;pz(P,'thighR',-.5*ph);pz(P,'shinR',.3*ph)}
 if(u.swing>0){const sw=u.swing/.18,ph=typeof punchK==='function'?punchK(sw):Math.sin(Math.PI*(1-sw));
  if(MELEEK.has(k))comboPose(u,P,(u.cmbH||1),ph,k);else{pz(P,'armR',-1.6*ph-.1,0,.1);pz(P,'foreR',-.1);pz(P,'chest',.1,.3*ph)}}
 if(u.stun>0&&!u.dead){pz(P,'head',.45+Math.sin(t*6)*.15,Math.sin(t*3)*.3);pz(P,'chest',.25,0,Math.sin(t*6)*.12);pz(P,'armL',.2,0,.35);pz(P,'armR',.2,0,-.35);pz(P,'foreL',-.1);pz(P,'foreR',-.1);P.root.y=-1.5}
 if(u.sleepT<0){pz(P,'head',.7);pz(P,'chest',.35);pz(P,'armL',.1,0,.2);pz(P,'armR',.1,0,-.2);P.root.y=-3}
 if(u.flash>0&&!u.stun){const f=u.flash/.12;padd(P,'chest',-.4*f);padd(P,'head',-.35*f);P.root.z-=3*f}
 if(u.anim&&ANIM[u.anim.k]){const a=u.anim,e=1-Math.max(0,a.t)/a.m;try{ANIM[a.k](P,Math.min(1,e),u,t)}catch(err){}}
 return P}
// ----- mise à jour du modèle (pose lissée, orientation, éclat blanc) puis rendu de l'atlas
const _Q=typeof THREE!=='undefined'?new THREE.Quaternion():null,_E=typeof THREE!=='undefined'?new THREE.Euler():null;
function poseModel(u,rec,dt,t){const P={};basePose(u,t,rec,P);actionPose(u,t,rec,P);
 for(const [n] of BONES){if(n==='root')continue;const o=P[n],b=rec.bones[BI[n]],q=rec.cur[n];_E.set(o?o.x:0,o?o.y:0,o?o.z:0);_Q.setFromEuler(_E);q.slerp(_Q,1-Math.exp(-(BRATE[n]||16)*dt));b.quaternion.copy(q)}
 const rb=rec.bones[0],k=1-Math.exp(-18*dt);rec.rootP.x+=((P.root.x||0)-rec.rootP.x)*k;rec.rootP.y+=((P.root.y||0)-rec.rootP.y)*k;rec.rootP.z+=((P.root.z||0)-rec.rootP.z)*k;rb.position.copy(rec.rootP);
 const R=P.rootR;rec.rootR.x+=(R.x-rec.rootR.x)*k;rec.rootR.z+=(R.z-rec.rootR.z)*k;rec.rootR.y=R.y?R.y:rec.rootR.y*(1-k);rb.rotation.set(rec.rootR.x,rec.rootR.y,rec.rootR.z);
 // orientation : le ninja se tourne vers sa visée (au plus court), un peu en douceur
 const a=u.aim||0,want=Math.PI/2-Math.atan2(Math.sin(a)*.7+.42,Math.cos(a));let d=want-rec.yaw;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;rec.yaw+=d*(1-Math.exp(-20*dt));
 const f=u.flash>0&&!u.dead?Math.min(1,u.flash/.12):0;rec.mat.emissive.setRGB(f,f,f);rec.mat.emissiveIntensity=f?1:0}
// taille de l'atlas : de 2 à 48 cases selon le nombre de ninjas visibles (agrandi aussitôt, réduit après un moment)
function atlasSize(n){const caps=[2,4,8,16,24,32,48],cap=caps.find(c=>c>=n)||48,cols=Math.min(8,cap),rows=Math.ceil(cap/cols);
 if(cols*rows<n||cols>N3.cols||rows>N3.rows||(N3.small>180&&cols*rows<N3.cols*N3.rows)){N3.cols=cols;N3.rows=rows;N3.small=0;N3.r.setSize(cols*TPW,rows*TPH,false);
  Object.assign(N3.cam,{left:0,right:cols*TWU,top:rows*THU,bottom:0});N3.cam.updateProjectionMatrix()}else if(cols*rows<N3.cols*N3.rows)N3.small++;else N3.small=0}
function render3D(){N3.tile.clear();if(!N3.on||OPT.p3d===false)return;if(!N3.tried&&!init3D())return;if(!N3.ok)return;
 const now=performance.now(),rdt=(now-(N3.last||now))/1000,dt=Math.min(.05,rdt)||1/60,t=now/1000;N3.last=now;N3.frame++;
 // plus de 2,5 s sous ~22 images/s en combat : on repasse en 2D
 if(state==='fight'&&rdt>0&&rdt<1){N3.slow=rdt>.045?(N3.slow||0)+1:Math.max(0,(N3.slow||0)-2);if(N3.slow>150){N3.on=false;N3.auto=true;console.warn('Ninjas 3D coupés : ordinateur trop lent');return}}
 const want=[];for(const u of units)if(u&&!(u.dead&&u.deadT>1.6)&&u.ch&&u.ch.look&&u.ch.look.head.t==='ninja'&&near(u.x,u.y))want.push(u);for(const u of[...want])if(u.ch.look.dog&&!u.dead)want.push(u._dog3||(u._dog3={dog:1,owner:u,aim:0}));for(const u of N3.req)if(!want.includes(u))want.push(u);N3.req.clear();
 const n=Math.min(want.length,TCOLS*TROWS);atlasSize(Math.max(2,n));const CO=N3.cols,RO=N3.rows;
 for(const rec of N3.recs.values())rec.grp.visible=false;
 for(let i=0;i<n;i++){const u=want[i];let rec=N3.recs.get(u);if(rec&&!u.dog&&rec.key!==lookKey(u)){dispose3D(u,rec);rec=null}if(!rec){rec=u.dog?buildDog3D():buildNinja3D(u);N3.recs.set(u,rec)}
  rec.used=N3.frame;rec.grp.visible=true;if(rec.dog)poseDog(u,rec,dt,t);else poseModel(u,rec,dt,t);
  const c=i%CO,r=Math.floor(i/CO),cx=c*TWU+TWU/2,cy=(RO-1-r)*THU+FOOT;
  rec.grp.position.copy(N3.right).multiplyScalar(cx).addScaledVector(N3.up,cy).addScaledVector(N3.fwd,1200);rec.grp.rotation.set(0,rec.yaw,0);
  N3.tile.set(u,{sx:c*TPW,sy:r*TPH})}
 if(N3.frame%120===0)for(const [u,rec] of N3.recs)if(N3.frame-rec.used>240)dispose3D(u,rec);
 N3.r.render(N3.sc,N3.cam)}
function dispose3D(u,rec){N3.sc.remove(rec.grp);rec.mesh.geometry.dispose();rec.mat.dispose();rec.face.geometry.dispose();rec.face.material.dispose();rec.sym.geometry.dispose();rec.sym.material.dispose();N3.recs.delete(u)}
// colle la case du ninja dans la scène 2D (même échelle et même point d'appui que le dessin 2D), sinon dessin 2D
function drawChar3(u,bx,by,s,alpha){if(N3.ok)N3.req.add(u);const tl=N3.ok&&N3.tile.get(u);if(!tl)return drawChar(u,bx,by,s)
 const sk=u.ch.look.scale||1,w=TWU*s*sk,h=THU*s*sk;g.save();if(u.dead)g.globalAlpha*=Math.max(0,1-u.deadT*.6);if(u.phase>0)g.globalAlpha*=.35+Math.sin(performance.now()/33)*.1;if(alpha!=null)g.globalAlpha*=alpha;
 if(u.stun>0)g.translate(Math.sin(performance.now()/80)*1.2,0);
 g.drawImage(N3.cv,tl.sx,tl.sy,TPW,TPH,bx-w/2,by-h+FOOT*s*sk,w,h);g.restore()}

// ----- animations nommées : P = pose (os → {x,y,z} en radians), e = avancement 0 → 1, u = ninja
// repères : bras au repos le long du corps ; armX.x = -1.57 bras tendu devant, -3.1 levé au ciel, +0.6 en arrière ; armL.z > 0 / armR.z < 0 = écarté
// foreX.x < 0 plie le coude ; thighX.x < 0 jambe devant ; shinX.x > 0 plie le genou ; chest.x > 0 penché en avant ; chest.y tourne le buste
// P.root = décalage du corps (y = hauteur, z = vers l'avant) ; P.rootR = rotation de tout le corps (y = tourne sur soi, x = bascule)
Object.assign(ANIM,{
 palm:(P,e)=>{const k=e<.3?e/.3:1;pz(P,'armL',-1.6*k,0,-.15);pz(P,'armR',-1.6*k,0,.15);pz(P,'foreL',-.05);pz(P,'foreR',-.05);pz(P,'chest',.25*k);P.root.z=7*k;P.root.y=-3*k;pz(P,'thighR',-.7*k);pz(P,'shinR',.8*k);pz(P,'thighL',.35*k);pz(P,'shinL',.5*k)},
 twohand:(P,e)=>{const k=e<.4?e/.4:1;pz(P,'armL',-1.5*k,0,-.32*k);pz(P,'armR',-1.5*k,0,.32*k);pz(P,'foreL',-.25);pz(P,'foreR',-.25);pz(P,'chest',.15*k);P.root.y=-2.5*k;pz(P,'thighR',-.55*k);pz(P,'shinR',.7*k);pz(P,'thighL',.3*k)},
 slam:(P,e)=>{const up=e<.4,k=up?e/.4:(e-.4)/.6;const a=up?-3.1*ezo(k):-3.1+2.7*ezo(k);pz(P,'armL',a,0,-.2);pz(P,'armR',a,0,.2);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'chest',up?-.35*k:.65);P.root.y=up?4*k:-7*ezo(k);pz(P,'thighL',up?0:-.6);pz(P,'shinL',up?0:1);pz(P,'thighR',up?0:-.4);pz(P,'shinR',up?0:.9)},
 hammer:(P,e)=>ANIM.slam(P,e),
 stomp:(P,e)=>{const up=e<.45,k=up?e/.45:(e-.45)/.55;pz(P,'thighR',up?-1.5*ezo(k):-1.5+1.5*ezo(k));pz(P,'shinR',up?1.2*k:1.2-1.2*k);pz(P,'armL',-.4,0,.9);pz(P,'armR',-.4,0,-.9);pz(P,'chest',up?-.2:.3);P.root.y=up?0:-3*ezo(k)},
 spin:(P,e)=>{P.rootR.y=Math.PI*2*ezio(e);pz(P,'armL',-1.4,0,1.25);pz(P,'armR',-1.4,0,-1.25);pz(P,'foreL',-.1);pz(P,'foreR',-.1);P.root.y=1.5},
 breath:(P,e)=>{const inh=e<.3,k=inh?e/.3:1;pz(P,'armL',-1.35,0,-.35);pz(P,'foreL',-2.3);pz(P,'armR',-1.35,0,.35);pz(P,'foreR',-2.3);pz(P,'chest',inh?-.35*k:.35);pz(P,'head',inh?-.3*k:.15);P.root.y=inh?1:-2;P.root.z=inh?-3*k:3},
 summon:(P,e)=>{const k=Math.min(1,e/.35);P.root.y=-9*k;pz(P,'thighL',-1.2*k);pz(P,'shinL',2*k);pz(P,'thighR',.3*k);pz(P,'shinR',1.8*k);pz(P,'chest',.7*k);pz(P,'armR',-1.1*k,0,.1);pz(P,'foreR',-.2);pz(P,'armL',.2,0,.5);pz(P,'head',-.2)},
 leap:(P,e)=>{P.root.y=26*bump(e);pz(P,'thighL',-1.1*bump(e));pz(P,'shinL',1.6*bump(e));pz(P,'thighR',-.6*bump(e));pz(P,'shinR',1.3*bump(e));pz(P,'armL',-2.4*bump(e),0,.5);pz(P,'armR',-2.4*bump(e),0,-.5)},
 point:(P,e)=>{const k=Math.min(1,e/.25);pz(P,'armR',-1.62*k,0,.08);pz(P,'foreR',0);pz(P,'chest',.05,.3*k);pz(P,'armL',-.2,0,.3)},
 raise:(P,e)=>{const k=Math.min(1,e/.3);pz(P,'armR',-3.05*k,0,.15);pz(P,'foreR',-.1);pz(P,'armL',-.3,0,.4);pz(P,'head',-.35*k);pz(P,'chest',-.15*k)},
 clap:(P,e)=>{const k=e<.5?e/.5:1;pz(P,'armL',-1.45,0,-.55*k+.6*(1-k));pz(P,'armR',-1.45,0,.55*k-.6*(1-k));pz(P,'foreL',-.4);pz(P,'foreR',-.4)},
 pray:(P,e)=>{pz(P,'armL',-1.2,0,-.6);pz(P,'armR',-1.2,0,.6);pz(P,'foreL',-1.9);pz(P,'foreR',-1.9);pz(P,'head',.3);P.root.y=-1},
 kickup:(P,e)=>{const k=bump(e);pz(P,'thighR',-2.3*k);pz(P,'shinR',.1);pz(P,'chest',-.45*k);pz(P,'armL',-.3,0,.8);pz(P,'armR',-.3,0,-.8);P.root.y=4*k},
 uppercut:(P,e)=>{const k=ezo(Math.min(1,e/.45));pz(P,'armR',-.4-2.4*k,0,.1);pz(P,'foreR',-.9+.7*k);P.root.y=-4+9*k;pz(P,'chest',-.2*k,.2)},
 throw2:(P,e)=>{const up=e<.35,k=up?e/.35:(e-.35)/.65;const a=up?-3.4*k:-3.4+2*ezo(k);pz(P,'armL',a,0,-.15);pz(P,'armR',a,0,.15);pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'chest',up?-.3:.35)},
 lunge:(P,e)=>{const k=ezo(Math.min(1,e/.3));P.root.z=16*k;P.root.y=-5*k;pz(P,'thighR',-1.1*k);pz(P,'shinR',1*k);pz(P,'thighL',.7*k);pz(P,'shinL',.4*k);pz(P,'armR',-1.6*k,0,.05);pz(P,'foreR',0);pz(P,'armL',.6*k,0,.4);pz(P,'chest',.45*k)},
 stab:(P,e)=>ANIM.lunge(P,e),
 crouch:(P,e)=>{P.root.y=-8;pz(P,'thighL',-1);pz(P,'shinL',1.9);pz(P,'thighR',-.6);pz(P,'shinR',1.7);pz(P,'chest',.5);pz(P,'armL',-.6,0,.3);pz(P,'armR',-.6,0,-.3)},
 backflip:(P,e)=>{P.rootR.x=-Math.PI*2*ezio(e);P.root.y=18*bump(e);pz(P,'thighL',-1.2);pz(P,'shinL',1.8);pz(P,'thighR',-1.2);pz(P,'shinR',1.8);pz(P,'armL',-1,0,.3);pz(P,'armR',-1,0,-.3)},
 roar:(P,e)=>{const k=Math.min(1,e/.3);pz(P,'armL',-.4*k,0,1.3*k);pz(P,'armR',-.4*k,0,-1.3*k);pz(P,'chest',-.4*k);pz(P,'head',-.45*k);P.root.y=-2*k;pz(P,'thighL',0,0,.3*k);pz(P,'thighR',0,0,-.3*k)},
 eye:(P,e)=>{pz(P,'armR',-2.2,0,.55);pz(P,'foreR',-2.4);pz(P,'head',.15,.1);pz(P,'armL',-.3,0,.4)},
 seal:(P,e)=>{const k=Math.min(1,e/.25);pz(P,'armR',-1.6*k,0,.1);pz(P,'foreR',-.05);pz(P,'armL',-1.1*k,0,-.45);pz(P,'foreL',-1.7);pz(P,'chest',.2*k,.25*k);P.root.z=5*k},
 channel:(P,e,u,t)=>{pz(P,'armL',-2.9,0,.4);pz(P,'armR',-2.9,0,-.4);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'head',-.4);P.root.y=Math.sin(t*20)*.4},
 dance:(P,e)=>{P.rootR.y=Math.PI*4*ezio(e);pz(P,'armL',-1.7,0,1);pz(P,'armR',-.9,0,-1.2);pz(P,'thighL',-.5);pz(P,'shinL',.6);P.root.y=2*bump(e*2%1)},
 guard:(P,e)=>{P.root.y=-2;pz(P,'armL',-1.35,0,-.55);pz(P,'foreL',-1.25);pz(P,'armR',-1.35,0,.55);pz(P,'foreR',-1.25)},
 swirl:(P,e,u,t)=>{const a=t*10;pz(P,'armL',-1.5+Math.sin(a)*.6,0,.6+Math.cos(a)*.4);pz(P,'armR',-1.5+Math.sin(a+Math.PI)*.6,0,-.6-Math.cos(a)*.4)},
 kneel:(P,e)=>ANIM.summon(P,1),
});

// ----- chien ninja (Inuzuka) en 3D : même style, petit squelette à quatre pattes
const DBONES=[['root',null,[0,0,0]],['body','root',[0,11,0]],['head','body',[0,4.5,8]],['legFL','body',[3.2,-3,5.5]],['legFR','body',[-3.2,-3,5.5]],['legBL','body',[3.2,-3,-5.5]],['legBR','body',[-3.2,-3,-5.5]],['tail','body',[0,2.5,-8.5]]];
const DBI=Object.fromEntries(DBONES.map((b,i)=>[b[0],i]));
function buildDog3D(){const T=THREE,P=[],N=[],C=[],SI=[],SW=[],rest={};for(const [n,p,o] of DBONES){const v=new T.Vector3(...o);if(p)v.add(rest[p]);rest[n]=v}
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
 const bones=DBONES.map(([n,p,o])=>{const b=new T.Bone();b.name=n;b.position.set(...o);return b});DBONES.forEach(([n,p],i)=>{if(p)bones[DBI[p]].add(bones[i])});
 const mat=new T.MeshToonMaterial({vertexColors:true,gradientMap:N3.gm}),mesh=new T.SkinnedMesh(geo,mat);mesh.add(bones[0]);const skel=new T.Skeleton(bones);mesh.bind(skel);mesh.frustumCulled=false;
 const out=new T.SkinnedMesh(geo,N3.outline);out.bind(skel,mesh.bindMatrix);out.frustumCulled=false;const grp=new T.Group();grp.add(mesh);grp.add(out);N3.sc.add(grp);
 const cur={};for(const [n] of DBONES)cur[n]=new T.Quaternion();
 return{grp,mesh,out,mat,bones,skel,key:'dog',cur,rootP:new T.Vector3(),rootR:new T.Euler(),yaw:0,used:0,dog:1,face:{geometry:{dispose(){}},material:{dispose(){}}},sym:{geometry:{dispose(){}},material:{dispose(){}}}}}
function poseDog(d,rec,dt,t){const u=d.owner,run=u.moving||u.dash,atk=u.swing>0||(u.anim&&u.anim.t>0),w=t*16,P={};
 const lg=(n,x)=>{P[n]=x};if(run){lg('legFL',Math.sin(w)*.8);lg('legBR',Math.sin(w)*.8);lg('legFR',-Math.sin(w)*.8);lg('legBL',-Math.sin(w)*.8)}
 let ry=0,rz=0,hx=Math.sin(t*2)*.05;if(atk){lg('legFL',-1.1);lg('legFR',-1.1);hx=-.35;rz=6}
 for(const [n] of DBONES){if(n==='root')continue;const b=rec.bones[DBI[n]],q=rec.cur[n];const x=n==='head'?hx:n==='tail'?.2:P[n]||0,y=n==='tail'?Math.sin(t*14)*.6:0;_E.set(x,y,0);_Q.setFromEuler(_E);q.slerp(_Q,1-Math.exp(-16*dt));b.quaternion.copy(q)}
 const rb=rec.bones[0];rec.rootP.z+=(rz-rec.rootP.z)*(1-Math.exp(-14*dt));rec.rootP.y=run?Math.abs(Math.cos(w))*1.2:0;rb.position.copy(rec.rootP);
 const a=d.aim||0,want=Math.PI/2-Math.atan2(Math.sin(a)*.7+.42,Math.cos(a));let dd=want-rec.yaw;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;rec.yaw+=dd*(1-Math.exp(-14*dt))}
