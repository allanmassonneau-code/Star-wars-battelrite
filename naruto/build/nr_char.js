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
// ---------- Coiffures des ninjas célèbres : une seule description pour la 3D et le 2D ----------
// repère de la tête 3D (centre du crâne en [0,8,0], rayon ≈ 12,6 ; +z = visage, +x = gauche du ninja) ; le 2D projette les mêmes pièces
// ['s',élévation,tour,long.,rayon] pic qui sort du crâne · ['c',[x,y,z],rayon,long.,[rx,ry,rz],[sx,sy,sz],fl] mèche (capsule) · ['k',[x,y,z],rayon,long.,[rx,ry,rz],fl] cône
// ['o',[x,y,z],rayon,[sx,sy,sz],fl,couleur] boule · ['sh',rayon,fin (0 = sommet),ouverture du visage] coque ; fl : h = suit l'os des cheveux (balancement), f = devant les yeux en 2D
// f = frange 2D : zig (pointes), part (raie au milieu), flat (droite), none ; cap:0 = pas de calotte de base
const HAIRS={
 sasuke:{f:'zig',p:[['s',1.55,3.14,13,4.6],['s',1.4,2.75,12,4.2],['s',1.4,-2.75,12,4.2],['s',1.15,2.95,11,4],['s',1.15,-2.95,11,4],['s',1.8,2.9,10,3.8],['s',1.8,-2.9,10,3.8],['s',.95,3.14,9,3.6],
  ['c',[10.6,4,6.4],2.3,9,[.08,0,.12],[1,1,.8]],['c',[-10.6,4,6.4],2.3,9,[.08,0,-.12],[1,1,.8]],['s',1.25,.3,7,3],['s',1.25,-.3,7,3],['s',1.3,0,6,2.8]]},
 carre:{f:'part',p:[['sh',13.9,2.1,1],['c',[9.6,3.5,7.6],2.4,8,[.1,0,.1],[1,1,.7]],['c',[-9.6,3.5,7.6],2.4,8,[.1,0,-.1],[1,1,.7]]]},
 kakashi:{f:'zig',p:[['s',.55,1.5,15,4.8],['s',.75,2,14,4.5],['s',.45,.9,14,4.4],['s',.85,2.6,13,4.2],['s',.3,1.2,13,4.2],['s',.95,1.1,11,4],['s',.6,-.4,11,4],['s',.95,-1.2,10,3.8],['s',1.15,2.95,10,3.8],['s',1.15,-2.4,9,3.6],['s',.5,.2,12,4.2],['s',1.2,.4,6,3],['s',1.2,-.2,5,2.8]]},
 itachi:{f:'part',p:[['c',[0,7,-5],11.6,3,[0,0,0],[1.05,1,.6]],['c',[9.8,4.5,7.4],2,10,[.05,0,.08],[1,1,.7]],['c',[-9.8,4.5,7.4],2,10,[.05,0,-.08],[1,1,.7]],['o',[0,0,-11.5],2,[1,1,1],'h','#3a2a26'],['c',[0,-8,-12.5],1.9,10,[.2,0,0],[1,1,.8],'h']]},
 deidara:{f:'none',p:[['c',[0,2,-5],12,7,[0,0,0],[1.05,1,.6]],['c',[-10.8,1,4],2.4,11,[0,0,-.08],[1,1,.8]],['c',[10.8,1,3],2.4,11,[0,0,.08],[1,1,.8]],['o',[0,19.5,-7],2.6,[1,1,1],'h'],['c',[0,16.5,-13],2.8,6,[-1,0,0],[1,1,.8],'h'],
  ['c',[4.6,8,12.3],3.6,9,[-.25,0,.25],[1.1,1,.45],'f']]},
 requin:{f:'none',p:[['s',.15,0,10,4],['s',.45,0,9,4],['s',.4,3.14,10,4.2],['s',.45,2.1,10,4],['s',.45,-2.1,10,4],['s',.4,1.1,9,3.8],['s',.4,-1.1,9,3.8],['s',.8,2.7,9,3.8],['s',.8,-2.7,9,3.8],['s',.9,3.14,8,3.6]]},
 sasori:{f:'zig',p:[['s',1.2,0,7,3.2],['s',1.25,.5,7,3.2],['s',1.25,-.5,7,3.2],['s',1,.95,7,3.2],['s',1,-.95,7,3.2],['s',.5,.4,6,3],['s',.5,-.6,6,3],['s',.3,2,6,3],['s',1.1,2.6,7,3.4],['s',1.1,-2.6,7,3.4],['s',1.3,3.14,7,3.4],['s',1.35,1.6,6,3],['s',1.35,-1.6,6,3]]},
 plaque:{f:'none',p:[['s',1.6,3.14,9,4],['s',1.5,2.65,9,3.8],['s',1.5,-2.65,9,3.8],['s',1.85,2.9,8,3.6],['s',1.85,-2.9,8,3.6],['s',1.35,2.2,7,3.4],['s',1.35,-2.2,7,3.4]]},
 pain:{f:'zig',p:[['s',.2,0,12,4.2],['s',.45,.6,12,4.2],['s',.45,-.6,12,4.2],['s',.6,1.5,12,4.2],['s',.6,-1.5,12,4.2],['s',.65,2.4,12,4.2],['s',.65,-2.4,12,4.2],['s',.7,3.14,12,4.2],['s',1,2,10,3.8],['s',1,-2,10,3.8],['s',1.1,2.8,10,3.8],['s',1.1,-2.8,10,3.8],['s',.35,3.14,11,4],
  ['s',1.1,.3,8,3.2],['s',1.1,-.3,8,3.2],['s',1.15,0,7,3]]},
 konan:{f:'part',p:[['sh',13.8,1.95,1.05],['o',[0,20,-7],4.6,[1,1,1],'h'],['o',[8.6,17.5,-1.5],3.4,[1,1,.55],'','#eef0fa'],['o',[10.6,15.8,-1.8],2.6,[1,1,.5],'','#dfe4f6'],['o',[6.6,20,-2],2.6,[1,1,.5],'','#dfe4f6'],['o',[9,17.8,-.6],1.5,[1,1,.6],'','#8e9ede']]},
 jiraiya:{f:'part',p:[['s',.3,3.14,12,4.6],['s',.6,2.4,13,4.6],['s',.6,-2.4,13,4.6],['s',.4,1.3,11,4.2],['s',.4,-1.3,11,4.2],['s',.2,.2,10,4],['k',[0,-10,-14],5.5,26,[3.32,0,0],'h'],['k',[4.5,-8,-13],4.6,22,[3.36,0,-.15],'h'],['k',[-4.5,-8,-13],4.6,22,[3.36,0,.15],'h'],
  ['k',[8,-2,-10],4,16,[3.44,0,-.3],'h'],['k',[-8,-2,-10],4,16,[3.44,0,.3],'h'],['c',[10.6,3,6.8],2.6,11,[.08,0,.1],[1,1,.8]],['c',[-10.6,3,6.8],2.6,11,[.08,0,-.1],[1,1,.8]]]},
 tsunade:{f:'part',p:[['c',[0,7,-5],11.6,3,[0,0,0],[1.05,1,.6]],['o',[4.5,1,-11],2,[1,1,1],'h','#3a3a44'],['o',[-4.5,1,-11],2,[1,1,1],'h','#3a3a44'],['c',[5,-8,-12],2.6,12,[.25,0,.05],[1,1,.85],'h'],['c',[-5,-8,-12],2.6,12,[.25,0,-.05],[1,1,.85],'h'],
  ['c',[10,4,7.4],2.2,9,[.08,0,.1],[1,1,.7]],['c',[-10,4,7.4],2.2,9,[.08,0,-.1],[1,1,.7]]]},
 orochimaru:{f:'part',p:[['c',[0,-6,-6.5],11.5,16,[.1,0,0],[1.05,1,.5]],['c',[10.6,0,5.5],2.4,16,[.06,0,.06],[1,1,.8]],['c',[-10.6,0,5.5],2.4,16,[.06,0,-.06],[1,1,.8]]]},
 minato:{f:'zig',p:[['s',.35,3.14,12,4.4],['s',.6,2.3,12,4.4],['s',.6,-2.3,12,4.4],['s',.4,1.2,11,4.2],['s',.4,-1.2,11,4.2],['s',.9,2.8,11,4],['s',.9,-2.8,11,4],['s',1.2,3.14,10,4],['s',.25,.3,10,4],
  ['c',[10.6,2.5,7],2.5,12,[.08,0,.1],[1,1,.8]],['c',[-10.6,2.5,7],2.5,12,[.08,0,-.1],[1,1,.8]],['s',1.15,.35,8,3.2],['s',1.15,-.35,8,3.2],['s',1.2,0,7,3]]},
 neji:{f:'part',p:[['c',[0,4,-5.5],11.6,6,[0,0,0],[1.05,1,.6]],['o',[0,-6,-11.5],2.2,[1.3,1,1],'h','#e8e0d0'],['c',[0,-15,-11],4.5,10,[.12,0,0],[1,1,.6],'h'],['c',[10.4,3.5,7],2.2,9,[.08,0,.1],[1,1,.7]],['c',[-10.4,3.5,7],2.2,9,[.08,0,-.1],[1,1,.7]]]},
 bol:{f:'flat',cap:0,p:[['sh',13.7,1.42,0],['sh',13.6,1.9,1.1]]},
 ananas:{f:'none',p:[['o',[0,15,-10],2.4,[1,1,1],'h','#3a2a20'],['k',[0,20.5,-11.5],3,10,[-.35,0,0],'h'],['k',[3,19.5,-12],2.6,9,[-.6,0,-.55],'h'],['k',[-3,19.5,-12],2.6,9,[-.6,0,.55],'h'],['k',[0,18,-14.5],2.6,9,[-1.2,0,0],'h'],
  ['k',[2.5,17.5,-13.5],2.4,8,[-1,0,-.9],'h'],['k',[-2.5,17.5,-13.5],2.4,8,[-1,0,.9],'h']]},
 choji:{f:'none',p:[['s',1.35,1.4,8,3.4],['s',1.35,-1.4,8,3.4],['s',1.4,2,9,3.6],['s',1.4,-2,9,3.6],['s',1.4,2.6,9,3.6],['s',1.4,-2.6,9,3.6],['s',1.45,3.14,9,3.6],['s',1.05,2.3,7,3.2],['s',1.05,-2.3,7,3.2],['s',1.05,3.14,7,3.2],['s',1.2,.6,6,3],['s',1.2,-.6,6,3]]},
 ino:{f:'none',p:[['o',[0,15,-10],2.4,[1,1,1],'h','#7a4a9a'],['c',[0,0,-13],3.6,20,[.15,0,0],[1,1,.8],'h'],['c',[-4.8,8,12.3],3.6,9,[-.25,0,-.25],[1.1,1,.45],'f'],['c',[10.4,3,6.5],2.2,9,[.08,0,.1],[1,1,.7]]]},
 kiba:{f:'zig',p:[['s',.3,.4,8,3.4],['s',.4,-.8,8,3.4],['s',.6,1.8,8,3.4],['s',.6,-1.9,8,3.4],['s',.5,2.7,8,3.4],['s',.8,3.14,8,3.4],['s',1,2.2,8,3.4],['s',1,-2.3,8,3.4],['s',1.3,1.6,7,3.2],['s',1.3,-1.6,7,3.2],['s',1.2,2.8,8,3.4],['s',1.2,-2.8,8,3.4],
  ['s',.9,1,7,3.2],['s',.9,-1.1,7,3.2],['s',1.15,.35,7,3],['s',1.15,-.35,7,3],['s',1.2,0,6,2.8],['s',1.25,.75,6,2.8],['s',1.25,-.75,6,2.8]]},
 hinata:{f:'flat',cap:0,p:[['sh',13.7,1.38,0],['c',[0,-4,-6.5],11.4,13,[.08,0,0],[1.05,1,.5]],['c',[10.6,2.5,6.8],2.6,8,[0,0,0],[1,1,.8]],['c',[-10.6,2.5,6.8],2.6,8,[0,0,0],[1,1,.8]],['sh',13.6,1.75,1.05]]},
 // Temari : quatre petites couettes à l'arrière
 temari:{f:'zig',p:[['o',[9.5,14,-6],2.3,[1,1,1],'h','#3a2a20'],['o',[-9.5,14,-6],2.3,[1,1,1],'h','#3a2a20'],['k',[13.1,14,-7.8],3,8,[-1.6,0,-1.1],'h'],['k',[-13.1,14,-7.8],3,8,[-1.6,0,1.1],'h'],
  ['o',[9.5,4,-7],2.3,[1,1,1],'h','#3a2a20'],['o',[-9.5,4,-7],2.3,[1,1,1],'h','#3a2a20'],['k',[12.9,2.7,-8.7],3,8,[-2.2,0,-1],'h'],['k',[-12.9,2.7,-8.7],3,8,[-2.2,0,1],'h'],['c',[10.4,3.5,6.5],2.2,8,[.08,0,.1],[1,1,.7]],['c',[-10.4,3.5,6.5],2.2,8,[.08,0,-.1],[1,1,.7]]]},
 gaara:{f:'none',p:[['s',.3,.1,8,3.6],['s',.5,1.1,8,3.6],['s',.5,-1.1,8,3.6],['s',.6,2.1,8,3.6],['s',.6,-2.1,8,3.6],['s',.7,3.14,8,3.6],['s',1.05,2.6,8,3.4],['s',1.05,-2.6,8,3.4],['s',1.2,1.5,7,3.2],['s',1.2,-1.5,7,3.2],
  ['s',1.1,-.35,8,3.2],['s',1.15,-.05,7,3],['s',1.2,.55,5,2.6]]},
 // coiffures ajoutées
 iroquoise:{f:'none',cap:0,p:[['sh',13.1,.42,0],['s',.85,0,11,4.4],['s',.55,0,15,4.8],['s',.28,0,17,5],['s',.05,3.14,17,5],['s',.35,3.14,15,4.8],['s',.65,3.14,13,4.4],['s',.95,3.14,10,4],['s',1.25,3.14,7,3.2],['s',.4,.25,13,3.6],['s',.4,-.25,13,3.6]]},
 rase:{f:'none',cap:0,p:[['sh',13.4,.8,0],['s',.25,0,8,3.4],['s',.4,1.1,7,3],['s',.4,-1.1,7,3],['s',.45,2.4,7,3],['s',.45,-2.4,7,3],['s',.3,3.14,7,3],['s',.1,1.6,6,2.8]]},
 longs:{f:'part',p:[['sh',13.9,2.15,1.05],['c',[0,-5,-7],11.2,14,[.1,0,0],[1.08,1,.5]],['c',[0,-14,-9],9.5,8,[.3,0,0],[1.1,1,.42],'h'],['c',[10.8,0,5.8],2.5,15,[.06,0,.06],[1,1,.8]],['c',[-10.8,0,5.8],2.5,15,[.06,0,-.06],[1,1,.8]]]},
 tresse:{f:'part',p:[['sh',13.8,1.95,1.05],['o',[0,1,-12.4],3,[1,1,1],'h'],['o',[0,-3.6,-12.9],2.8,[1,1,1],'h'],['o',[0,-8.2,-13.2],2.6,[1,1,1],'h'],['o',[0,-12.6,-13.3],2.4,[1,1,1],'h'],['o',[0,-16.6,-13.2],2.1,[1,1,1],'h'],
  ['o',[0,-19.4,-13.1],1.3,[1,1,1],'h','#c0303a'],['k',[0,-22.6,-13],1.8,5,[3.14,0,0],'h']]},
 chignon1:{f:'part',p:[['sh',13.8,1.9,1],['o',[0,21.2,-4.2],5.2,[1,.9,1]],['o',[0,17.6,-4.8],2.4,[1.3,.6,1.3],'','#c0303a']]},
 sai:{f:'flat',cap:0,p:[['sh',13.6,1.5,0],['sh',13.5,1.95,1.15],['c',[9.9,4,7.2],2.1,7,[.08,0,.08],[1,1,.7]],['c',[-9.9,4,7.2],2.1,7,[.08,0,-.08],[1,1,.7]]]},
 obito:{f:'zig',p:[['s',.3,0,7,3.4],['s',.42,.9,7,3.4],['s',.42,-.9,7,3.4],['s',.55,1.8,7,3.4],['s',.55,-1.8,7,3.4],['s',.6,2.6,7,3.4],['s',.6,-2.6,7,3.4],['s',.5,3.14,7,3.4],['s',.95,2.2,6,3],['s',.95,-2.2,6,3],['s',1.05,3.14,6,3],['s',1.2,.35,5,2.8],['s',1.2,-.35,5,2.8]]},
 madara:{f:'zig',p:[['s',.3,.3,9,3.6],['s',.3,-.3,9,3.6],['s',.55,1.4,10,4],['s',.55,-1.4,10,4],['s',.6,2.4,10,4],['s',.6,-2.4,10,4],['k',[0,-21,-13.6],7.4,48,[3.2,0,0],'h'],['k',[6.4,-18,-12.6],6.4,42,[3.22,0,-.16],'h'],['k',[-6.4,-18,-12.6],6.4,42,[3.22,0,.16],'h'],
  ['k',[10,-10,-8],5,30,[3.3,0,-.3],'h'],['k',[-10,-10,-8],5,30,[3.3,0,.3],'h'],['c',[10.4,1,6.4],2.6,13,[.08,0,.1],[1,1,.8]],['c',[-10.4,1,6.4],2.6,13,[.08,0,-.1],[1,1,.8]],['s',1.2,.3,7,3],['s',1.2,-.3,7,3]]},
 afro:{f:'flat',cap:0,p:[['sh',15,2.05,1.15],['o',[0,18,-3],12.6,[1.12,.9,1.08]],['o',[0,27,-2],7.4,[1,1,1]],['o',[10,24,-3],7,[1,1,1]],['o',[-10,24,-3],7,[1,1,1]],['o',[15,15,-4],6.6,[1,1,1]],['o',[-15,15,-4],6.6,[1,1,1]],['o',[0,21,-13],7.6,[1,1,1]],['o',[9,17,-12],7,[1,1,1]],['o',[-9,17,-12],7,[1,1,1]],['o',[5,25,6],6,[1,1,1]],['o',[-5,25,6],6,[1,1,1]],['o',[14,7,-8],6,[1,1,1]],['o',[-14,7,-8],6,[1,1,1]]]},
 couettes:{f:'zig',p:[['o',[10.8,15,-3],2,[1,1,1],'h','#c0303a'],['o',[-10.8,15,-3],2,[1,1,1],'h','#c0303a'],['c',[14.6,9,-4],3.4,13,[0,0,.5],[1,1,.85],'h'],['c',[-14.6,9,-4],3.4,13,[0,0,-.5],[1,1,.85],'h'],['c',[10.4,3.5,6.5],2.2,8,[.08,0,.1],[1,1,.7]],['c',[-10.4,3.5,6.5],2.2,8,[.08,0,-.1],[1,1,.7]]]},
 konohamaru:{f:'zig',p:[['s',.15,0,13,4],['s',.3,.8,12,4],['s',.3,-.8,12,4],['s',.42,2.2,12,4],['s',.42,-2.2,12,4],['s',.36,3.14,12,4],['s',.62,1.5,10,3.6],['s',.62,-1.5,10,3.6],['s',.9,2.8,9,3.4],['s',.9,-2.8,9,3.4]]},
 milongs:{f:'part',p:[['sh',13.9,2.25,1.05],['c',[10.4,1,6],2.6,13,[.06,0,.1],[1,1,.8]],['c',[-10.4,1,6],2.6,13,[.06,0,-.1],[1,1,.8]],['k',[0,-3,-12.5],4.2,13,[3.3,0,0],'h'],['k',[5.4,-2,-11.2],3.6,12,[3.3,0,-.28],'h'],['k',[-5.4,-2,-11.2],3.6,12,[3.3,0,.28],'h'],
  ['c',[3.6,9,12],2.6,8,[-.3,0,.35],[1.1,1,.45],'f']]}};
const HAIRB=[0,10,-9]; // position de l'os des cheveux dans le repère de la tête
// rotation d'Euler (ordre XYZ, comme Three.js) d'un vecteur
function rotE(v,r){let [x,y,z]=v;if(r[2]){const c=Math.cos(r[2]),s=Math.sin(r[2]);[x,y]=[x*c-y*s,x*s+y*c]}if(r[1]){const c=Math.cos(r[1]),s=Math.sin(r[1]);[x,z]=[x*c+z*s,-x*s+z*c]}if(r[0]){const c=Math.cos(r[0]),s=Math.sin(r[0]);[y,z]=[y*c-z*s,y*s+z*c]}return[x,y,z]}
const spikeDir=(el,az)=>[Math.sin(el)*Math.sin(az),Math.cos(el),Math.sin(el)*Math.cos(az)];
// pièces de coiffure en 2D : chaque pièce est tournée comme la tête 2D (un léger quart de tour, ou de dos), puis dessinée de face
// layer -1 = derrière le corps (longs cheveux), 0 = derrière la tête, 1 = sur la calotte, 2 = devant les yeux
function hairPieces2D(u,HS){const fx=Math.cos(u.aim||0),bk=Math.sin(u.aim||0)<-.3,tq=Math.asin(.28*fx),yw=bk?Math.PI-tq:tq,cy=Math.cos(yw),sy=Math.sin(yw);
 const pr=v=>[v[0]*cy+v[2]*sy,8-v[1],-v[0]*sy+v[2]*cy];const out=[];
 for(const q of HS.p){const t=q[0];let o;
  if(t==='s'||t==='k'){const d=t==='s'?spikeDir(q[1],q[2]):rotE([0,1,0],q[4]),len=q[3],c=t==='s'?d.map((x,i)=>(i===1?8:0)+x*(10.6+len*.45)):q[1];
   o={t:'k',a:pr(c.map((x,i)=>x-d[i]*len/2)),b:pr(c.map((x,i)=>x+d[i]*len/2)),r:t==='s'?q[4]:q[2],fl:t==='s'?'':q[5]||''}}
  else if(t==='c'){const d=rotE([0,1,0],q[4]),h=q[3]/2*q[5][1];o={t:'c',a:pr(q[1].map((x,i)=>x-d[i]*h)),b:pr(q[1].map((x,i)=>x+d[i]*h)),r:q[2]*q[5][0],fl:q[6]||''}}
  else if(t==='o'){o={t:'o',a:pr(q[1]),rx:q[2]*q[3][0],ry:q[2]*q[3][1],fl:q[4]||'',col:q[5]}}
  else if(t==='sh'){o={t:'sh',r:q[1],th:q[2],op:q[3],fl:''}}
  o.z=o.t==='sh'?(q[3]?-20:20):o.t==='o'?o.a[2]:(o.a[2]+o.b[2])/2;o.L=o.fl.includes('f')?2:o.t==='sh'?(q[3]&&!bk?0:1):o.z<-3?(!bk&&o.t!=='o'&&Math.max(o.a[1],o.b[1])+(o.t==='c'?o.r*.6:0)>10?-1:0):1;out.push(o)}
 return out.sort((p,q)=>p.z-q.z)}
function drawHair2D(P,L,hx,hy,hc,fl,back){for(const o of P){if(o.L!==L||(L===2&&back))continue;const c=fl?'#fff':o.col||hc;
 if(o.t==='k'){const dx=o.b[0]-o.a[0],dy=o.b[1]-o.a[1],n=Math.hypot(dx,dy)||1,px=-dy/n*o.r,py=dx/n*o.r;outlined(()=>{g.moveTo(hx+o.a[0]+px,hy+o.a[1]+py);g.lineTo(hx+o.b[0],hy+o.b[1]);g.lineTo(hx+o.a[0]-px,hy+o.a[1]-py)},c)}
 else if(o.t==='c')limb(hx+o.a[0],hy+o.a[1],hx+(o.a[0]+o.b[0])/2,hy+(o.a[1]+o.b[1])/2,hx+o.b[0],hy+o.b[1],o.r*2,c);
 else if(o.t==='o')outlined(()=>{g.ellipse(hx+o.a[0],hy+o.a[1],o.rx,o.ry,0,0,7)},c);
 else{const yc=-o.r*Math.cos(o.th),al=Math.asin(Math.max(-1,Math.min(1,yc/o.r)));outlined(()=>{g.arc(hx,hy,o.r,Math.PI-al,2*Math.PI+al)},c)}}}
// marques du visage, communes au 2D (U = 1) et au visage 3D (U ≈ 9,7 px par unité) ; layer 0 = sous les yeux, 1 = par-dessus
function faceMarks(x,h,ex,hy,ey,U,lw,layer){const f=h.face;if(!f)return;const ln=(a,b,c,d)=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()};x.lineCap='round';
 if(layer===0){
  if(f==='moust'){x.strokeStyle='#5a3a22';x.lineWidth=.95*lw;for(const s of[-1,1])for(let q=0;q<3;q++)ln(ex+s*5*U,hy+(4.6+q*1.6)*U,ex+s*9.6*U,hy+(4+q*2.2)*U)}
  if(f==='marques'){x.fillStyle='#c22';for(const s of[-1,1]){x.beginPath();x.moveTo(ex+s*5*U,hy+4*U);x.lineTo(ex+s*8*U,hy+4*U);x.lineTo(ex+s*6.5*U,hy+9*U);x.fill()}}
  if(f==='cernes'){x.strokeStyle='#6a3a2a';x.lineWidth=1.1*lw;for(const s of[-1,1])ln(ex+s*2.3*U,ey+2.6*U,ex+s*2.9*U,ey+5.4*U)}
  if(f==='gaara'){x.strokeStyle='#1e1616';x.lineWidth=2.2*lw;for(const s of[-1,1]){x.beginPath();x.ellipse(ex+s*4.2*U,ey,3.3*U,3.9*U,0,0,7);x.stroke()}}
  if(f==='fard'){x.fillStyle='#8a4ab0';for(const s of[-1,1]){x.beginPath();x.ellipse(ex+s*4.3*U,ey-.2*U,3.6*U,4.3*U,0,0,7);x.fill();x.beginPath();x.moveTo(ex+s*2*U,ey+2*U);x.lineTo(ex+s*1.4*U,ey+6*U);x.lineTo(ex+s*3*U,ey+3*U);x.fill()}}
  if(f==='spirales'){x.strokeStyle='#c02a2a';x.lineWidth=1*lw;for(const s of[-1,1]){x.beginPath();for(let k=0;k<18;k++){const a=k*.6,r=k/18*1.9*U;x.lineTo(ex+s*6.4*U+Math.cos(a*s)*r,hy+5.6*U+Math.sin(a*s)*r)}x.stroke()}}
  if(f==='ermite'){x.strokeStyle='#c02a2a';x.lineWidth=1.5*lw;for(const s of[-1,1])ln(ex+s*2*U,ey+2.6*U,ex+s*2.6*U,hy+8.6*U)}
  if(f==='branchies'){x.strokeStyle='#2a3a5a';x.lineWidth=.9*lw;for(const s of[-1,1])for(let q=0;q<3;q++)ln(ex+s*(5.4+q*1.1)*U,ey+2.4*U,ex+s*(5+q*1.1)*U,ey+4.6*U)}
  if(f==='rides'){x.strokeStyle='#9a6a4a';x.lineWidth=.8*lw;for(const s of[-1,1]){x.beginPath();x.arc(ex+s*6.4*U,hy+5*U,1.6*U,s>0?1.6:-.2,s>0?3.4:1.6);x.stroke();ln(ex+s*1.6*U,hy+5.6*U,ex+s*2.6*U,hy+6.6*U)}}
  if(f==='rousseur'){x.fillStyle='#b8704a';for(const s of[-1,1])for(const [a,b] of[[5,4.4],[6.6,4],[5.8,5.6],[7.4,5.4],[4.6,5.8]]){x.beginPath();x.arc(ex+s*a*U,hy+b*U,.42*U,0,7);x.fill()}}
  if(f==='sennin'){x.fillStyle='#e8781a';for(const s of[-1,1]){x.beginPath();x.ellipse(ex+s*4.3*U,ey-.5*U,3.9*U,4.4*U,0,0,7);x.fill()}x.strokeStyle='#c8501a';x.lineWidth=.8*lw;for(const s of[-1,1])ln(ex+s*6.6*U,ey-3.4*U,ex+s*8.2*U,ey-4.6*U)} // pigments du Mode Ermite
  if(f==='rougeur'){x.fillStyle='rgba(240,110,130,.55)';for(const s of[-1,1]){x.beginPath();x.ellipse(ex+s*6*U,hy+5.2*U,2.4*U,1.2*U,0,0,7);x.fill()}}
  if(f==='kyubi'){x.strokeStyle='#2a1a14';x.lineWidth=1.9*lw;for(const s of[-1,1])for(let q=0;q<3;q++)ln(ex+s*4.8*U,hy+(4.2+q*1.7)*U,ex+s*9.8*U,hy+(3.4+q*2.4)*U)}
  if(f==='coutures'){x.strokeStyle='#4a2a24';x.lineWidth=.8*lw;for(const s of[-1,1]){ln(ex+s*1.6*U,hy+6.9*U,ex+s*7.6*U,hy+4.8*U);for(let q=0;q<4;q++){const t=q/3,px=ex+s*(2.6+t*4.2)*U,py=hy+(6.6-t*1.5)*U;ln(px-.5*U,py-.9*U,px+.5*U,py+.9*U)}}}
 }else{
  if(f==='gaara'){x.fillStyle='#c42a2a';x.font=`bold ${3.8*U}px serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('愛',ex+4.8*U,hy-3.8*U)}
  if(f==='losange'){x.fillStyle='#7a3ac0';x.beginPath();x.moveTo(ex,hy-8*U);x.lineTo(ex+1.3*U,hy-6.4*U);x.lineTo(ex,hy-4.8*U);x.lineTo(ex-1.3*U,hy-6.4*U);x.fill()}
  if(f==='pain'){x.fillStyle='#c4c8d2';x.strokeStyle='#3a3a44';x.lineWidth=.35*lw;for(const [px,py] of[[-1,1],[1,1],[-1,3],[1,3],[-1.4,8.4],[0,8.7],[1.4,8.4]]){x.beginPath();x.arc(ex+px*U,hy+py*U,.55*U,0,7);x.fill();x.stroke()}}
  if(f==='rides'){x.fillStyle=h.hair;x.beginPath();x.moveTo(ex-1.8*U,hy+8.2*U);x.lineTo(ex+1.8*U,hy+8.2*U);x.lineTo(ex,hy+11.4*U);x.fill()}
  if(f==='kankuro'){x.strokeStyle='#7a3aa8';x.lineWidth=1.3*lw;ln(ex,hy-3*U,ex,hy+3.6*U);for(const s of[-1,1]){ln(ex+s*7.2*U,ey-1.4*U,ex+s*5.4*U,hy+8.6*U);ln(ex+s*1.6*U,hy+9*U,ex,hy+10.6*U)}}
  if(f==='cicatrice'){x.strokeStyle='#a8604a';x.lineWidth=1*lw;ln(ex-5.2*U,hy+3.8*U,ex+5.2*U,hy+3.2*U)}
  if(f==='barbe'){x.strokeStyle=h.hair;x.lineWidth=2.6*lw;x.beginPath();x.arc(ex,hy+2.4*U,8.6*U,.55,Math.PI-.55);x.stroke()}
  if(f==='maudite'){x.fillStyle='#14100c';for(const [a,b,r] of[[-7.4,6.4,1],[-8.6,4.2,.9],[-6.2,8.4,.85]]){x.beginPath();x.arc(ex+a*U,hy+b*U,r*U,0,7);x.fill();x.strokeStyle='#14100c';x.lineWidth=.7*lw;x.beginPath();x.arc(ex+a*U+r*.6*U,hy+b*U-r*.4*U,r*1.4*U,2.6,4.2);x.stroke()}}
  if(f==='cicoeil'){x.strokeStyle='#8a4a3a';x.lineWidth=1.1*lw;ln(ex+4.7*U,ey-5.6*U,ex+3.5*U,ey+7.4*U);if(h.bs==='oblique'){x.lineWidth=.6*lw;ln(ex+2.6*U,ey+4.6*U,ex+4.4*U,ey+5.6*U)}}
  if(f==='cage'&&!(x===g&&h.style&&HAIRS[h.style]&&!['none','part'].includes(HAIRS[h.style].f))&&!(x===g&&h.style==='pics')){x.strokeStyle='#3a9a4a';x.lineWidth=.9*lw;ln(ex-2.4*U,hy-8.4*U,ex+2.4*U,hy-5*U);ln(ex+2.4*U,hy-8.4*U,ex-2.4*U,hy-5*U);for(const s of[-1,1])ln(ex+s*2.4*U,hy-8.4*U,ex+s*2.4*U,hy-5*U)}
  if(f==='levres'){x.strokeStyle='#c8283a';x.lineWidth=1.4*lw;x.beginPath();x.moveTo(ex-1.9*U,hy+6.8*U);x.quadraticCurveTo(ex,hy+7.8*U,ex+1.9*U,hy+6.8*U);x.stroke()}
  if(f==='kaguya'&&!h.kaguya){x.fillStyle='#c22';for(const s of[-1,1]){x.beginPath();x.arc(ex+s*3*U,hy-4.4*U,.8*U,0,7);x.fill()}}}}
// accessoires dessinés sur le visage (2D, U = 1, et visage 3D) : cache-œil, bandages, masque à spirale, masque de renard, lunettes rondes
function accFace(x,h,ex,hy,ey,U,lw){const a=h.acc;if(!a)return;x.save();x.lineCap='round';
 if(a==='cacheoeil'){x.strokeStyle='#1a1410';x.lineWidth=.9*lw;x.beginPath();x.moveTo(ex-10*U,hy-5*U);x.lineTo(ex+10*U,hy+1.4*U);x.stroke();x.fillStyle='#1c1c24';x.beginPath();x.ellipse(ex+4.2*U,ey,3.2*U,3.6*U,0,0,7);x.fill()}
 if(a==='bandvis'){x.fillStyle='#ece8de';x.strokeStyle='#1a1410';x.lineWidth=.9*lw;x.beginPath();x.moveTo(ex-10.6*U,hy+3*U);x.lineTo(ex+10.6*U,hy+3*U);x.lineTo(ex+8.6*U,hy+11*U);x.lineTo(ex-8.6*U,hy+11*U);x.closePath();x.fill();x.stroke();
  x.strokeStyle='#b8b0a0';x.lineWidth=.6*lw;for(let q=0;q<3;q++){x.beginPath();x.moveTo(ex-9.8*U,hy+(5+q*2)*U);x.lineTo(ex+9.8*U,hy+(4.4+q*2.2)*U);x.stroke()}}
 if(a==='tobi'){x.fillStyle='#f08a2a';x.strokeStyle='#1a1410';x.lineWidth=1*lw;x.beginPath();x.ellipse(ex,hy+1.4*U,10.4*U,10.6*U,0,0,7);x.fill();x.stroke();x.strokeStyle='#7a3a12';x.lineWidth=.7*lw;x.beginPath();
  for(let k=0;k<60;k++){const t=k/60*Math.PI*5,r=(1-k/60)*9*U;x.lineTo(ex+4.2*U+Math.cos(t)*r,ey+Math.sin(t)*r)}x.stroke();x.fillStyle='#14100c';x.beginPath();x.arc(ex+4.2*U,ey,1.4*U,0,7);x.fill()}
 if(a==='renard'){x.fillStyle='#f4f2ec';x.strokeStyle='#1a1410';x.lineWidth=1*lw;x.beginPath();x.moveTo(ex,hy+11*U);x.lineTo(ex-10*U,hy+1*U);x.lineTo(ex-9*U,hy-8*U);x.lineTo(ex+9*U,hy-8*U);x.lineTo(ex+10*U,hy+1*U);x.closePath();x.fill();x.stroke();
  x.fillStyle='#14100c';for(const s of[-1,1]){x.beginPath();x.ellipse(ex+s*4*U,ey-.4*U,2*U,1.1*U,s*.35,0,7);x.fill()}x.strokeStyle='#d8402a';x.lineWidth=1.1*lw;for(const s of[-1,1]){x.beginPath();x.moveTo(ex+s*1.6*U,hy-6.4*U);x.quadraticCurveTo(ex+s*5*U,hy-3*U,ex+s*7.4*U,hy-6.6*U);x.stroke();x.beginPath();x.moveTo(ex+s*5*U,hy+3*U);x.lineTo(ex+s*7.6*U,hy+5.6*U);x.stroke()}
  x.fillStyle='#14100c';x.beginPath();x.arc(ex,hy+9.6*U,.9*U,0,7);x.fill()}
 if(a==='lunrondes'){x.strokeStyle='#3a3a44';x.lineWidth=.8*lw;for(const s of[-1,1]){x.beginPath();x.arc(ex+s*4.2*U,ey,3.2*U,0,7);x.stroke()}x.beginPath();x.moveTo(ex-1*U,ey-.6*U);x.lineTo(ex+1*U,ey-.6*U);x.stroke();x.fillStyle='rgba(200,230,255,.25)';for(const s of[-1,1]){x.beginPath();x.arc(ex+s*4.2*U,ey,3*U,0,7);x.fill()}}
 x.restore()}
// œil (x,y centre, U échelle, s côté, fx regard) selon les yeux du clan ou des marques ; renvoie false si l'œil normal doit être dessiné
function eyeSpecial(x,h,cx,cy,U,lw){const t=h.eye?null:h.eyeT;if(!t)return false;x.strokeStyle='#1a1410';x.lineWidth=1.3*lw;
 if(t==='rin'){x.fillStyle='#c4bae2';x.beginPath();x.ellipse(cx,cy,2.7*U,3.3*U,0,0,7);x.fill();x.stroke();x.strokeStyle='#4a3a7a';x.lineWidth=.55*lw;for(const r of[.6,1.4,2.2]){x.beginPath();x.ellipse(cx,cy,r*U,r*1.2*U,0,0,7);x.stroke()}x.fillStyle='#2a1a4a';x.beginPath();x.arc(cx,cy,.35*U,0,7);x.fill();return true}
 if(t==='ser'){x.fillStyle='#fff';x.beginPath();x.ellipse(cx,cy,2.7*U,3.1*U,0,0,7);x.fill();x.stroke();x.fillStyle='#e8c020';x.beginPath();x.ellipse(cx,cy+.2*U,1.8*U,2.4*U,0,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.ellipse(cx,cy+.2*U,.4*U,1.9*U,0,0,7);x.fill();return true}
 if(t==='req'){x.fillStyle='#fff';x.beginPath();x.ellipse(cx,cy+.4*U,1.9*U,2*U,0,0,7);x.fill();x.stroke();x.fillStyle='#111';x.beginPath();x.arc(cx,cy+.5*U,.6*U,0,7);x.fill();return true}
 if(t==='rond'){x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,3*U,0,7);x.fill();x.stroke();x.fillStyle='#111';x.beginPath();x.arc(cx,cy+.2*U,1.05*U,0,7);x.fill();return true}
 if(t==='mgk'){x.fillStyle='#fff';x.beginPath();x.ellipse(cx,cy,2.7*U,3.3*U,0,0,7);x.fill();x.stroke();x.fillStyle='#d01414';x.beginPath();x.ellipse(cx,cy+.3*U,1.9*U,2.5*U,0,0,7);x.fill();x.fillStyle='#111';
  for(let i=0;i<3;i++){const a=i*2.094;x.beginPath();x.moveTo(cx,cy+.3*U);x.quadraticCurveTo(cx+Math.cos(a+.9)*2.4*U,cy+.3*U+Math.sin(a+.9)*2.4*U,cx+Math.cos(a+.2)*1.9*U,cy+.3*U+Math.sin(a+.2)*2.3*U);x.quadraticCurveTo(cx+Math.cos(a+.4)*.8*U,cy+.3*U+Math.sin(a+.4)*.8*U,cx,cy+.3*U);x.fill()}
  x.beginPath();x.arc(cx,cy+.3*U,.5*U,0,7);x.fill();return true}
 if(t==='toad'){x.fillStyle='#f0c020';x.beginPath();x.ellipse(cx,cy,2.7*U,3.1*U,0,0,7);x.fill();x.stroke();x.fillStyle='#111';x.fillRect(cx-1.7*U,cy-.35*U,3.4*U,.8*U);x.fillStyle='#d8601a';x.fillRect(cx-2.7*U,cy-4.6*U,5.4*U,1.2*U);return true}
 if(t==='closed'){x.beginPath();x.arc(cx,cy-.4*U,2.4*U,.25,Math.PI-.25);x.stroke();return true}
 return false}
// symbole dans le dos (2D et texture 3D) : x contexte, (cx, cy) centre, R rayon, lw épaisseur des traits
function drawSign(x,k,cx,cy,R,lw=1){x.save();x.lineJoin='round';x.lineCap='round';const O='#1a1410',txt=(t,c,f=1.5)=>{x.fillStyle=c;x.font=`bold ${R*f}px serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(t,cx,cy+R*.06)};
 if(k==='uchiha'){x.fillStyle='#f4f2ee';x.strokeStyle=O;x.lineWidth=1.2*lw;x.fillRect(cx-R*.16,cy+R*.2,R*.32,R*.78);x.strokeRect(cx-R*.16,cy+R*.2,R*.32,R*.78);x.beginPath();x.ellipse(cx,cy-R*.08,R*.78,R*.66,0,0,7);x.fillStyle='#f4f2ee';x.fill();x.stroke();
  x.fillStyle='#d0242a';x.beginPath();x.ellipse(cx,cy-R*.08,R*.78,R*.66,0,Math.PI,0);x.closePath();x.fill();x.stroke()}
 else if(k==='uzumaki'){x.strokeStyle='#b81e1a';x.lineWidth=R*.21;x.beginPath();for(let i=0;i<=40;i++){const a=i/40*Math.PI*3.6,r=R*(.12+.78*i/40);x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.stroke()}
 else if(k==='senju'){x.fillStyle='#f4f2ee';x.strokeStyle='#c0302a';x.lineWidth=R*.12;x.beginPath();x.arc(cx,cy,R*.88,0,7);x.fill();x.stroke();x.fillStyle='#c0302a';x.fillRect(cx-R*.08,cy-R*.62,R*.16,R*1.24);for(const s of[-1,1]){x.beginPath();x.moveTo(cx,cy-R*.1);x.quadraticCurveTo(cx+s*R*.55,cy-R*.6,cx+s*R*.62,cy+R*.1);x.lineWidth=R*.12;x.stroke()}}
 else if(k==='hyuga'){x.fillStyle='#e8e4f4';x.strokeStyle='#6a5a9a';x.lineWidth=R*.1;x.beginPath();x.arc(cx,cy,R*.88,0,7);x.fill();x.stroke();txt('日','#5a4a8a',1.25)}
 else if(k==='nara'){x.fillStyle='#e8e2d0';x.strokeStyle='#3a5a32';x.lineWidth=R*.1;x.beginPath();x.arc(cx,cy,R*.88,0,7);x.fill();x.stroke();txt('鹿','#2f5a32',1.2)}
 else if(k==='akimichi'){x.fillStyle='#f4f0e6';x.strokeStyle='#b02a2a';x.lineWidth=R*.1;x.beginPath();x.arc(cx,cy,R*.88,0,7);x.fill();x.stroke();txt('食','#b02a2a',1.2)}
 else if(k==='feu')txt('火','#d02a1a',1.7);
 else if(k==='amour')txt('愛','#c42a2a',1.7);
 else if(k==='nuage'){for(const [c,r] of[['#ffffff',1],['#c0202a',.74]])for(const [dx,dy,rr] of[[-.42,.08,.36],[0,-.12,.44],[.42,.08,.36],[0,.22,.3]]){x.fillStyle=c;x.beginPath();x.arc(cx+dx*R,cy+dy*R,rr*R*r+(r<1?0:R*.06),0,7);x.fill()}}
 x.restore()}
// objets portés dans le dos (2D) : parchemin, épée bandée, faux, éventail, fûma shuriken, katana
function backItem2D(k,ox,col){g.save();g.translate(ox,0);
 switch(k){
  case'parchemin':outlined(()=>{g.roundRect(-17,-28,34,7.5,3.5)},col('#e8dcc0'));g.fillStyle=col('#b83a2a');g.fillRect(-16,-27,4,5.5);g.fillRect(12,-27,4,5.5);break;
  case'samehada':g.translate(0,-30);g.rotate(-.5);outlined(()=>{g.roundRect(-4.5,-24,9,40,4.5)},col('#3a4a7a'));g.strokeStyle=col('#6a7ab0');g.lineWidth=1;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-4,-18+i*7);g.lineTo(4,-15+i*7);g.stroke()}outlined(()=>{g.rect(-1.6,-31,3.2,8)},col('#5a4a3a'));break;
  case'faux':g.translate(0,-28);g.rotate(.55);limb(0,-30,0,-5,0,22,2.2,col('#4a3426'));for(let k=0;k<3;k++)outlined(()=>{g.moveTo(0,-31+k*5);g.quadraticCurveTo(10,-34+k*5,17,-25+k*5);g.quadraticCurveTo(9,-28+k*5,0,-27+k*5)},col('#c42a2a'));break;
  case'eventail':g.translate(0,-30);g.rotate(-.35);outlined(()=>{g.roundRect(-4,-28,8,46,2.5)},col('#4a3a2a'));for(let i=0;i<3;i++)circ(0,-20+i*9,2.2,col('#8a5ab8'));break;
  case'fuma':g.translate(0,-30);g.rotate(.4);for(let i=0;i<4;i++){g.rotate(Math.PI/2);outlined(()=>{g.moveTo(-3.4,-2);g.quadraticCurveTo(-1.5,-14,3,-22);g.lineTo(3.4,-2)},col('#9aa2ae'))}blob(0,0,4,col('#5a5f6a'));break;
  case'katana':g.translate(0,-22);g.rotate(1.05);outlined(()=>{g.roundRect(-1.8,-14,3.6,30,1.6)},col('#24242c'));outlined(()=>{g.rect(-1.5,-22,3,8)},col('#d8d0c0'));break
  case'kubi':g.translate(0,-30);g.rotate(-.55);outlined(()=>{g.moveTo(-5.5,-24);g.lineTo(5.5,-24);g.lineTo(5.5,18);g.lineTo(-5.5,18)},col('#c8d0da'));circ(1.5,-16,2.6,col('#2a2e36'));outlined(()=>{g.rect(-1.6,18,3.2,9)},col('#4a3a2a'));break
  case'karasu':g.translate(0,-30);outlined(()=>{g.roundRect(-9,-20,18,38,8)},col('#e8e2d0'));g.strokeStyle=col('#8a6a4a');g.lineWidth=1.6;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-9,-12+i*8);g.lineTo(9,-8+i*8);g.stroke()}break
  case'kusanagi':g.translate(0,-22);g.rotate(1.45);outlined(()=>{g.roundRect(-1.6,-16,3.2,26,1.4)},col('#4a3a6a'));outlined(()=>{g.rect(-1.4,-23,2.8,7)},col('#e8e2d0'));g.strokeStyle=col('#8a5ab8');g.lineWidth=2;g.beginPath();g.arc(0,-6,4,0,7);g.stroke();break
  case'rouleaux':for(const x of[-5,5]){outlined(()=>{g.roundRect(x-3.2,-40,6.4,22,3)},col('#e8dcc0'));g.fillStyle=col('#b83a2a');g.fillRect(x-3.2,-41,6.4,3);g.fillRect(x-3.2,-21,6.4,3)}break
  case'baton':g.translate(0,-28);g.rotate(.5);limb(0,-30,0,0,0,30,2.4,col('#6a4a2a'));g.fillStyle=col('#e8c040');g.fillRect(-2,-30,4,3);g.fillRect(-2,27,4,3);break
  case'sac':outlined(()=>{g.roundRect(-9,-40,18,17,4)},col('#6a5a3a'));outlined(()=>{g.roundRect(-9,-41,18,6,3)},col('#5a4a2e'));break
  case'hirame':g.translate(0,-30);g.rotate(-.4);outlined(()=>{g.roundRect(-4,-24,8,38,3)},col('#4a5a7a'));g.strokeStyle=col('#d8d0c0');g.lineWidth=1.2;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-4,-18+i*7);g.lineTo(4,-21+i*7);g.stroke()}outlined(()=>{g.rect(-1.6,14,3.2,8)},col('#3a2a2a'));break}
 g.restore()}
// images rémanentes : silhouettes qui s'effacent derrière un ninja qui file
function drawGhosts(u){const T=u._tr||(u._tr=[]),fast=!u.dead&&(u.dash||u.phase>0||(u===player&&(u.haste>0||u.sprint)&&u.moving));if(fast)T.push({x:u.x,y:u.y,z:u.z||0});else if(T.length)T.shift();while(T.length>7)T.shift();
 if(T.length<3||u.ch.look.head.t!=='ninja')return;const S2=1.3*(u.giant>0?1.35:1);for(let i=0;i<T.length-2;i+=2){const o=T[i],q=P(o.x,o.y,o.z);g.save();g.globalAlpha=.1+.18*i/T.length;(N3.ok&&N3.tile.get(u)?drawChar3(u,q.x,q.y,q.s*S2):drawNinja(u,q.x,q.y,q.s*S2,1));g.restore()}}
// détails de tenue (2D) : épaules sombres, col en V, manteau ouvert (haori), écharpe, col de fourrure, capuche baissée, corde à nœud
function outfit2D(L,back,step,col){const hy2=L.hlong?16*(L.bh||1)-3:-3;
 if(L.yoke){g.fillStyle=col(L.yoke);g.fillRect(-10.5,-42,21,7)}
 if(L.open&&!back){g.fillStyle=col(L.head.skin);g.beginPath();g.moveTo(-3.5,-42);g.lineTo(3.5,-42);g.lineTo(0,-34);g.fill()}
 if(L.haori){const c=col(L.haori);if(back)outlined(()=>{g.moveTo(-12,-42);g.lineTo(12,-42);g.lineTo(16+step,hy2);g.lineTo(-16+step,hy2)},c);
  else for(const s of[-1,1])outlined(()=>{g.moveTo(s*12,-42);g.lineTo(s*6.5,-42);g.lineTo(s*8.5+step,hy2);g.lineTo(s*16.5+step,hy2)},c);
  const HT=L.hov?L.htrim:L.trim;if(HT&&!L.dots){g.fillStyle=col(HT);for(let x=-15;x<=13;x+=3.5){if(!back&&Math.abs(x+1.5)<8)continue;g.beginPath();g.moveTo(x+step,hy2);g.lineTo(x+1.7+step,hy2-5.5);g.lineTo(x+3.4+step,hy2);g.fill()}}
  if(L.clouds&&(!L.robe||L.hov))for(const [cx,cy] of back?[[-5,-26],[6,-8]]:[[-12,-24],[12,-6]]){g.fillStyle=col('#fff');g.beginPath();g.ellipse(cx,cy,4.6,2.8,0,0,7);g.fill();g.fillStyle=col(L.cloudC||'#c0202a');g.beginPath();g.ellipse(cx,cy,3.6,2,0,0,7);g.fill()}
  if(L.dots)for(const [x,y] of back?[[-6,-30],[6,-24],[-2,-16],[8,-13]]:[[-12,-28],[12,-24],[-13,-15],[13.5,-13]])circ(x+step*(y+42)/33,y,2,col(L.dots))}
 if(L.sash){g.strokeStyle=col(L.sash);g.lineWidth=3;g.beginPath();g.moveTo(back?9:-9,-41);g.lineTo(back?-9:9,-22);g.stroke()}
 if(L.fur||L.hood==='down')outlined(()=>{g.ellipse(0,-42.5,back?12:12.5,back?6:4.2,0,0,7)},col(L.fur||L.torso));
 if(L.jupe)outlined(()=>{g.moveTo(-11,-21);g.lineTo(11,-21);g.lineTo(14+step,-8);g.lineTo(-14+step,-8)},col(L.jupe));
 if(L.obi){g.fillStyle=col(L.obi);g.fillRect(-11.5,-27,23,6.5);if(back){blob(-4,-24,3,col(L.obi));blob(4,-24,3,col(L.obi))}}
 if(L.kcol&&!back){g.strokeStyle=col(L.kcol);g.lineWidth=2.2;g.beginPath();g.moveTo(-5,-42);g.lineTo(2,-29);g.moveTo(5,-42);g.lineTo(-1,-31);g.stroke()}
 if(L.samurai){const c=col(L.samurai);for(const s of[-1,1])outlined(()=>{g.roundRect(s>0?8:-15,-43,7,6,2)},c);if(!back)outlined(()=>{g.roundRect(-8.5,-40,17,12,3)},c);for(const x of[-11,-3.5,4])outlined(()=>{g.rect(x+step*.5,-21,7,9)},c)}
 if(L.vband&&L.vest&&!back){g.fillStyle=col(shade(L.vest,.72));for(const y of[-38,-33,-28])g.fillRect(-10,y,20,1.6)}
 if(L.spiral&&back){g.strokeStyle=col('#c0302a');g.lineWidth=2;g.beginPath();g.arc(0,-31,4.5,0,7);g.stroke();g.beginPath();g.arc(0,-31,1.8,0,5);g.stroke()}
 if(L.rope){g.strokeStyle=col(L.rope);g.lineWidth=2.6;g.beginPath();g.moveTo(-10.5,-21.5);g.lineTo(10.5,-21.5);g.stroke();if(back){blob(-4,-22,3,col(L.rope));blob(4,-22,3,col(L.rope));blob(0,-21.5,1.8,col(L.rope))}}}
// proportions du dessin 2D (comme la 3D) : jambes ≈ moitié de la hauteur, tête réduite autour du cou (≈ 1 : 5), bras jusqu'à mi-cuisse
const HS2=.68;function headT(){g.translate(0,-42);g.scale(HS2,HS2);g.translate(0,42)}
// cou (2D, repère du torse : base du cou en 0,-42)
function neck2D(L,back,col){const k=L.neck;if(!k)return;
 if(k==='echarpe'||k==='echlong'){const c=col(L.maskC||(k==='echarpe'?'#c0282a':'#3a6ac8'));outlined(()=>{g.ellipse(0,-42,9.5,4.2,0,0,7)},c);if(k==='echarpe')outlined(()=>{g.roundRect(back?-6:3,-40,4,11,1.5)},c);
  else outlined(()=>{g.moveTo(-3,-42);g.quadraticCurveTo(-12,-36,-20,-24);g.lineTo(-16,-22);g.quadraticCurveTo(-9,-34,2,-40)},c)}
 if(back)return;
 if(k==='tsunade'){g.strokeStyle='#3a3a44';g.lineWidth=.7;g.beginPath();g.arc(0,-43,6,.5,Math.PI-.5);g.stroke();outlined(()=>{g.moveTo(0,-39.5);g.lineTo(1.6,-37);g.lineTo(0,-34);g.lineTo(-1.6,-37)},col('#5ad86a'))}
 if(k==='jashin'){g.strokeStyle='#3a3a44';g.lineWidth=.7;g.beginPath();g.arc(0,-44,7,.5,Math.PI-.5);g.stroke();g.strokeStyle=col('#d8dce4');g.lineWidth=1.4;g.beginPath();g.arc(0,-35,2.6,0,7);g.stroke()}
 if(k==='chapelet')for(let i=0;i<9;i++){const a=.35+i*(Math.PI-.7)/8;circ(Math.cos(a)*7,-43+Math.sin(a)*5,1.2,col('#6a4a2a'))}
 if(k==='anneaux'){g.strokeStyle=col('#c8ccd6');g.lineWidth=1;for(const x of[-2.6,0,2.6]){g.beginPath();g.arc(x,-37.5,1.4,0,7);g.stroke()}}
 if(k==='foulard')outlined(()=>{g.moveTo(-8,-42);g.lineTo(8,-42);g.lineTo(0,-33)},col(L.maskC||'#d8d0c0'));
 if(k==='crocs'){g.strokeStyle='#3a2a20';g.lineWidth=.7;g.beginPath();g.arc(0,-43,6,.5,Math.PI-.5);g.stroke();g.fillStyle=col('#f4f0e6');for(const x of[-3,0,3]){g.beginPath();g.moveTo(x-1,-38.4+Math.abs(x)*.3);g.lineTo(x+1,-38.4+Math.abs(x)*.3);g.lineTo(x,-35.2+Math.abs(x)*.3);g.fill()}}}
// bras (2D) : coude e, main h ; bandages, gants, protège-bras, bracelets, bague, tatouage, gantelets
function arm2D(L,sx,sy,e,h,col,front){const k=L.armAcc;if(!k)return;const at=t=>[e[0]+(h[0]-e[0])*t,e[1]+(h[1]-e[1])*t];
 const seg=(a,b,w,c)=>{const p=at(a),q=at(b);limb(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2,q[0],q[1],w,c)};
 if(k==='bandages'||k==='bandall')seg(.25,.92,4.4,col('#f0ece0'));if(k==='protege')seg(.2,.85,5.2,col('#2a3050'));if(k==='gantelets')seg(.15,.9,5.6,col('#9aa2ae'));if(k==='gants')seg(.8,.98,5,col('#1c1c24'));
 if(k==='bracelets')seg(.72,.86,5.2,col('#e8c040'));if(k==='bague'&&front)circ(h[0],h[1]+2.4,1.3,col('#f0c840'));
 if(k==='tatouage'&&front){const tx=sx+(e[0]-sx)*.35,ty=sy+(e[1]-sy)*.35;g.strokeStyle=col('#c02a2a');g.lineWidth=1.1;g.beginPath();g.arc(tx,ty,2.2,0,5.4);g.stroke();g.beginPath();g.arc(tx,ty,.9,0,7);g.stroke()}}
// accessoires de tête (2D) : lunettes de protection, boucles, chapeau de paille, casque, bandana
function headAcc2D(h,hx,hy,R,ex,back,fl){const a=h.acc,c=v=>fl?'#fff':v;
 if(a==='bandana'){const bc=c(h.maskC||'#3a3a48');outlined(()=>{g.arc(hx,hy-1,R+1,Math.PI*1.02,Math.PI*1.98)},bc);if(back)blob(hx,hy-7,2.6,bc)}
 if(a==='goggles'){g.fillStyle=c('#2a2a30');g.fillRect(hx-R,hy-14,R*2,3.6);if(!back)for(const s of[-1,1]){blob(ex+s*4.6,hy-12.5,4,c('#2a2a30'));circ(ex+s*4.6,hy-12.5,3,c('#ff8a1a'))}}
 if(a==='boucles')for(const s of[-1,1]){g.strokeStyle=c('#f0c840');g.lineWidth=1.3;g.beginPath();g.arc(hx+s*(R-.2),hy+7,2.2,0,7);g.stroke()}
 if(a==='kabuto'){outlined(()=>{g.arc(hx,hy-1.5,R+1.6,Math.PI,2*Math.PI)},c('#3a3a48'));g.fillStyle=c('#2a2a34');g.fillRect(hx-R-3,hy-2.5,2*R+6,3);if(!back){g.strokeStyle=c('#e8c040');g.lineWidth=1.8;g.beginPath();g.moveTo(ex,hy-10);g.lineTo(ex-6,hy-22);g.moveTo(ex,hy-10);g.lineTo(ex+6,hy-22);g.stroke()}}
 if(a==='paille'){outlined(()=>{g.moveTo(hx-21,hy-5);g.lineTo(hx,hy-27);g.lineTo(hx+21,hy-5);g.quadraticCurveTo(hx,hy-1,hx-21,hy-5)},c('#c8a860'));g.strokeStyle=c('#8a6a3a');g.lineWidth=.7;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(hx,hy-26);g.lineTo(hx+i*8,hy-4.6);g.stroke()}
  g.fillStyle=c('#f0ece0');for(const x of back?[-14,-7,0,7,14]:[-17,-12,12,17])g.fillRect(hx+x-1,hy-4,2,9);if(!back)for(const s of[-1,1]){g.fillStyle=c('#c02a2a');g.fillRect(hx+s*15-.5,hy-3,1,5);blob(hx+s*15,hy+3,1.8,c('#f0c840'))}}}
function drawNinja(u,bx,by,s,ghost){
 const L=u.ch.look,h=L.head,W=L.weapon,k=W.k||'fist',t=performance.now()/1000;
 const fx=Math.cos(u.aim),fy=Math.sin(u.aim),back=fy<-.3,fl=u.flash>0,sk=L.scale||1;
 const run=u.dash?2:(u.haste>0||u.sprint)&&u.moving?2:u.moving?1:0;
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
 const col=c=>fl?'#fff':c,skin=col(h.skin),LG=col(L.legs),TO=col(L.torso),AR=col(L.arm||L.torso),LY=1.8*(L.bh||1),SH2=20*LY-20,bw=(L.bw||1)*(L.belly?1.12:1);
 // cape vue de face : derrière le corps (dessinée avant les jambes, elle ne passe plus devant comme un tablier)
 if(L.cape&&!back){g.save();g.translate(lean*.4,-bob-SH2);outlined(()=>{g.moveTo(-11,-40);g.lineTo(11,-40);g.lineTo(16-step,0);g.lineTo(-16-step,0)},col(L.cape));g.restore()}
 // jambes (genou plié) et sandales
 for(const side of[-1,1]){const kick=(cs===4||cs===5)&&side===fs,ph=step*side,hx=side*4;let kx=hx+ph*4+lean*.3,ky=-10+Math.abs(ph)*-2,fxx=hx+ph*6,fyy=-2-Math.max(0,ph)*2;
  if(kick){kx=hx+fs*12*cph;ky=-17-9*cph;fxx=hx+fs*(6+25*cph);fyy=-6-(cs===5?26:19)*cph}
  else if(!u.moving&&(u.cmbT>0||cs)&&MELEEK.has(k)){kx=hx*1.6+side*fs*3;fxx=hx*2+side*fs*5;ky=-9}
  ky*=LY;fyy=-2+(fyy+2)*LY;kx*=1.05;limb(hx,-20*LY,kx,ky,fxx,fyy,5.2*Math.sqrt(bw),LG);
  if(L.armAcc==='bandall'){const a=.35,b=.85;limb(kx+(fxx-kx)*a,ky+(fyy-ky)*a,kx+(fxx-kx)*(a+b)/2,ky+(fyy-ky)*(a+b)/2,kx+(fxx-kx)*b,ky+(fyy-ky)*b,5.6,col('#f0ece0'))}
  if(L.stripes)for(const q of[.3,.75]){circ(hx+(kx-hx)*q,-20*LY+(ky+20*LY)*q,2.7,col(L.stripes));circ(kx+(fxx-kx)*q,ky+(fyy-ky)*q,2.5,col(L.stripes))}
  if(L.warm)limb(kx+(fxx-kx)*.3,ky+(fyy-ky)*.3,kx+(fxx-kx)*.6,ky+(fyy-ky)*.6,fxx,fyy-1.5,6.2,col(L.warm));if(L.legs!=='#d8d0c0'&&L.torso==='#4a8a3a'){g.strokeStyle='#e8e0d0';g.lineWidth=1;g.beginPath();g.moveTo(kx-2,ky+3);g.lineTo(kx+2,ky+5);g.stroke()}
  if((L.gear==='holster'||L.gear==='both')&&side===(fx>=0?-1:1)){const qx=hx+(kx-hx)*.45,qy=-20*LY+(ky+20*LY)*.45;g.fillStyle=col('#f0ece0');g.fillRect(qx-3.4,qy-2.6,6.8,1.6);outlined(()=>{g.roundRect(qx-2.6,qy-2,5.2,6.4,1.2)},col('#3a3a44'))}
  g.fillStyle=OUT;g.fillRect(fxx-4,fyy-1,9,4);g.fillStyle=col(L.boot||'#222');g.fillRect(fxx-3.5,fyy-.5,8,2.5);g.fillStyle=skin;g.fillRect(fxx+(fx>0?2:-3),fyy-2.5,3,2)}
 g.translate(lean*.4,-bob);g.translate(0,-SH2);
 let [hf,hb]=ninjaHands(u,fx,fy,run,t);if(!mudraOf(u)&&!u.cast&&!u.block){const st=p=>[p[0]*1.1,-37+(p[1]+37)*1.45];hf=st(hf);hb=st(hb)} // bras plus longs : mains à mi-cuisse
 // gourde de sable, cape et manteau à l'arrière
 const gourd=()=>{g.save();g.translate(back?0:-fx*3,-30);outlined(()=>{g.ellipse(0,4,11,12,0,0,7)},col('#c8945a'));outlined(()=>{g.ellipse(0,-11,7,7,0,0,7)},col('#c8945a'));g.fillStyle='#7a4a2a';g.fillRect(-2,-20,4,4);g.strokeStyle='#8a3a2a';g.lineWidth=2;g.beginPath();g.moveTo(-10,-4);g.lineTo(10,-14);g.stroke();g.restore()};
 if(!back&&HAIRS[h.style]&&!(L.hood==='up'||L.hood==='chat')){g.save();headT();drawHair2D(hairPieces2D(u,HAIRS[h.style]),-1,fx*1.5,-53,fl?'#fff':h.hair,fl,back);g.restore()}
 if(L.gourd&&!back)gourd();if(L.back&&!back)backItem2D(L.back,-fx*3,col);
 if(L.neck==='echlong'&&!back)neck2D({neck:'echlong',maskC:L.maskC},true,col);
 // bras arrière
 const shoulder=side=>[side*9*bw,-37];const armB=()=>{const [sx,sy]=shoulder(-fx>=0?1:-1),e=[(sx+hb[0])/2-2,(sy+hb[1])/2+2];limb(sx,sy,e[0],e[1],hb[0],hb[1],4.4,AR);if(L.stripes)circ((sx+e[0])/2,(sy+e[1])/2,2.4,col(L.stripes));arm2D(L,sx,sy,e,hb,col,0);
  blob(hb[0],hb[1],2.6,L.armAcc==='gants'?col('#1c1c24'):L.armAcc==='gantelets'?col('#7a828e'):k==='fist'||k==='bigfist'?col('#f0ebe0'):skin)};
 if(!back)armB();
 // torse et tenue
 if(L.robe){const rb=L.rshort?-11:SH2-3,rw=L.rshort?15:18;outlined(()=>{g.moveTo(-12,-41);g.lineTo(12,-41);g.lineTo(rw+step*2,rb);g.lineTo(-rw+step*2,rb)},col(L.robe));if(L.trim){g.fillStyle=col(L.trim);g.fillRect(-15.4+step*2,rb-4,30.8,3.2)}}
 const tg=g.createLinearGradient(-11,0,11,0);tg.addColorStop(0,col(shade(L.torso,1.12)));tg.addColorStop(1,col(shade(L.torso,.82)));
 outlined(()=>{g.roundRect(-10.5*bw,-42,21*bw,24,5)},tg);if(L.belly)outlined(()=>{g.ellipse(0,-27,12.5*bw*.92,10.5,0,0,7)},tg);
 if(!back){
  if(L.vest){g.fillStyle=col(L.vest);g.strokeStyle=OUT;g.lineWidth=1.2;g.beginPath();g.roundRect(-10.5,-41,21,19,4);g.fill();g.stroke();g.fillStyle=col(shade(L.vest,.8));g.fillRect(-9,-33,6,5);g.fillRect(3,-33,6,5);g.fillRect(-1,-41,2,19);g.fillStyle=col(shade(L.vest,1.15));g.fillRect(-8,-43,16,3)}
  if(L.tunic){g.fillStyle=col(L.tunic);g.fillRect(-4,-42,8,23);g.fillStyle=col(shade(L.torso,.7));g.fillRect(-9,-44,18,4)}
  if(L.armor){g.fillStyle=col(L.armor);g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();g.roundRect(-9,-40,18,11,3);g.fill();g.stroke()}
  if(L.torso==='#f08a24'){g.fillStyle=col('#2a3550');g.fillRect(-10,-42,20,4);g.fillStyle='#ddd';g.fillRect(-.7,-38,1.4,15)}
  if(L.clouds&&L.robe&&!L.hov&&!fl){g.fillStyle=col('#16161c');g.fillRect(-11,-45,22,6);for(const [cx,cy] of[[-6,-24],[5,-34]]){g.fillStyle='#fff';g.beginPath();g.ellipse(cx,cy,5.5,3.2,0,0,7);g.fill();g.fillStyle=L.cloudC||'#c0202a';g.beginPath();g.ellipse(cx,cy,4.4,2.3,0,0,7);g.fill()}}
 }else{
  if(L.tunic){g.fillStyle=col('#ffffff');g.beginPath();g.arc(0,-31,5,Math.PI,0);g.fill();g.fillStyle=col('#d02a2a');g.beginPath();g.arc(0,-31,5,0,Math.PI);g.fill()}
  if(L.clouds&&L.robe&&!L.hov&&!fl){g.fillStyle=L.cloudC||'#c0202a';g.beginPath();g.ellipse(0,-28,5,3,0,0,7);g.fill()}
  if(L.cape)outlined(()=>{g.moveTo(-12,-41);g.lineTo(12,-41);g.lineTo(15-step,-6);g.lineTo(-15-step,-6)},col(L.cape));
  if(L.disc&&!fl){g.strokeStyle=L.disc;g.lineWidth=2.2;g.beginPath();g.arc(0,-31,5,0,7);g.stroke()}
  if(L.fan&&!fl){g.fillStyle='#ffffff';g.beginPath();g.arc(0,-31,5,Math.PI,0);g.fill();g.fillStyle='#d02a2a';g.beginPath();g.arc(0,-31,5,0,Math.PI);g.fill()}
 }
 if(L.belt){g.fillStyle=col(L.belt);g.fillRect(-10.5,-23,21,3.2)}
 outfit2D(L,back,step,col);neck2D(L,back,col);
 if(back){const sg=L.haori&&L.hkan?null:L.sym;if(sg&&!fl)drawSign(g,sg,0,L.cape&&!L.haori?-27:-31,L.cape&&!L.haori?7.5:6.5,.8);
  if(L.haori&&L.hkan&&!fl){g.fillStyle='#c0201a';g.font='bold 7px serif';g.textAlign='center';g.textBaseline='middle';[...L.hkan].forEach((c,i)=>g.fillText(c,0,-34+i*8))}
  if(L.gear==='pouch'||L.gear==='both')outlined(()=>{g.roundRect(-4.5,-25,9,6,1.5)},col('#5a4a32'));
  if(L.gourd)gourd();if(L.back&&!L.gourd)backItem2D(L.back,0,col)} // vu de dos : symbole, pochette puis objet porté dans le dos, par-dessus le haori ou la cape
 if(h.bs==='taille'){g.fillStyle=h.band;g.fillRect(-10.5,-24,21,3.6);if(!back)bandPlate(h,0,-22.2,.7,0)}
 if(k==='kunai'||k==='senbon'){g.fillStyle=col('#3a3a44');g.fillRect(fx>0?-10:6,-17,5,6)}
 // tête
 g.save();headT();drawNinjaHead(u,h,fx,fy,back,fl,t,run);g.restore();
 // bras avant + arme
 const [sx,sy]=shoulder(fx>=0?1:-1);
 if(back)armB();
 {const e=[(sx+hf[0])/2+1,(sy+hf[1])/2+2];limb(sx,sy,e[0],e[1],hf[0],hf[1],4.6,AR);if(L.stripes)circ((sx+e[0])/2,(sy+e[1])/2,2.5,col(L.stripes));arm2D(L,sx,sy,e,hf,col,1)}
 if(h.bs==='bras'){const bx=sx+((sx+hf[0])/2+1-sx)*.45,by=sy+((sy+hf[1])/2+2-sy)*.45;g.fillStyle=h.band;g.beginPath();g.arc(bx,by,3.1,0,7);g.fill();g.fillStyle='#d3d8e2';g.fillRect(bx-1.6,by-1.4,3.2,2.8)}
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
// plaque du bandeau (village, rayure des renégats, kanji « huile » de l'ermite)
function bandPlate(h,px,py,sc,rot){g.save();g.translate(px,py);g.rotate(rot||0);g.scale(sc,sc);g.fillStyle='#d3d8e2';g.strokeStyle='#5a6070';g.lineWidth=1;g.beginPath();g.roundRect(-7,-3.75,14,7.5,1.5);g.fill();g.stroke();
 g.strokeStyle='#4a4f5a';g.lineWidth=1;g.beginPath(); // repère : centre de la plaque
 if(h.bs==='cornes'){g.fillStyle='#4a4f5a';g.font='bold 6px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('油',0,.4)}
 else switch(h.vil){case 0:g.arc(0,0,2.1,0,5.2);g.moveTo(2,0);g.lineTo(4.2,-1.8);break;case 1:g.moveTo(-3,-2.2);g.lineTo(3,2.3);g.moveTo(3,-2.2);g.lineTo(-3,2.3);break;
  case 2:for(let q=0;q<4;q++){g.moveTo(-3+q*2,-2.2);g.lineTo(-3+q*2,2.3)}break;case 3:g.arc(-1.6,.2,1.6,0,7);g.moveTo(3.4,.2);g.arc(1.8,.2,1.6,0,7);break;
  case 4:g.moveTo(-3,2.3);g.lineTo(-1,-2.2);g.lineTo(1,2.3);g.lineTo(3,-2.2);break;case 5:g.arc(-1,1.2,1.4,0,7);g.moveTo(.4,1.2);g.lineTo(.4,-2.6);break;
  case 7:g.moveTo(-3.4,-2.2);g.lineTo(3.4,-2.2);for(let q=0;q<4;q++){g.moveTo(-2.7+q*1.8,-.8);g.lineTo(-2.7+q*1.8,2.4)}break;case 8:for(let q=0;q<2;q++){g.moveTo(-3.4,-1+q*2.4);g.quadraticCurveTo(-1.7,-2.4+q*2.4,0,-1+q*2.4);g.quadraticCurveTo(1.7,.4+q*2.4,3.4,-1+q*2.4)}break;
  default:g.arc(0,0,2.1,0,5.2)}g.stroke();
 if(h.vil===6||h.bs==='barre'){g.strokeStyle='#b22';g.lineWidth=1.5;g.beginPath();g.moveTo(-7,-.2);g.lineTo(7,.8);g.stroke()}
 if(h.bs==='cornes'){g.fillStyle='#d3d8e2';g.strokeStyle='#5a6070';for(const s of[-1,1]){g.beginPath();g.moveTo(s*3,-3.6);g.lineTo(s*5.5,-8.5);g.lineTo(s*6.4,-3.6);g.closePath();g.fill();g.stroke()}}
 g.restore()}
// chapeau de Kage (2D)
function kageHat(hx,hy,fl,L){const hc=L&&L.hatC||'#c0202a',hk=L&&L.hatK||'火';outlined(()=>{g.ellipse(hx,hy-11,21,6,0,0,7)},fl?'#fff':'#f0eee6');outlined(()=>{g.moveTo(hx-13,hy-13);g.quadraticCurveTo(hx,hy-30,hx+13,hy-13)},fl?'#fff':'#f0eee6');
 outlined(()=>{g.moveTo(hx-6,hy-13);g.quadraticCurveTo(hx,hy-27,hx+6,hy-13)},fl?'#fff':hc);g.fillStyle='#fff';g.font='bold 6px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(hk,hx,hy-17.5)}
function drawNinjaHead(u,h,fx,fy,back,fl,t,run){const hx=fx*1.5,hy=-53,ex=hx+fx*3.5,R=12.5,hc=fl?'#fff':h.hair,L=u.ch.look,HS=HAIRS[h.style],bs0=h.bs==null?'front':h.bs,bs=['kage','paille','kabuto','bandana'].includes(h.acc)&&['front','barre','cornes','oblique','tete'].includes(bs0)?'':bs0,hood=L.hood==='up'||L.hood==='chat',HP=HS&&!hood?hairPieces2D(u,HS):null;
 g.save();
 // bandeau : pans qui flottent
 if(bs==='front'||bs==='oblique'||bs==='barre'||bs==='cornes'||bs==='tete'){const flap=Math.sin(t*9+u.x*.01)*(u.moving?3:1),by=bs==='tete'?-6:0;g.strokeStyle=h.band;g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(hx-fx*10,hy-6+by);g.quadraticCurveTo(hx-fx*17,hy-4+flap+by,hx-fx*(22+run*3),hy-1+flap*1.5+by);g.moveTo(hx-fx*10,hy-5+by);g.quadraticCurveTo(hx-fx*15,hy+1-flap+by,hx-fx*(19+run*3),hy+4-flap+by);g.stroke()}
 // cheveux arrière
 if(hood)outlined(()=>{g.arc(hx,hy-.5,R+3.4,0,7)},fl?'#fff':L.hoodC||L.torso);
 else{if(h.style==='lisse')outlined(()=>{g.roundRect(hx-13.5,hy-6,27,back?24:19,6)},hc);
  if(h.style==='queue'){outlined(()=>{g.moveTo(hx-fx*9-3,hy-12);g.lineTo(hx-fx*13,hy-27);g.lineTo(hx-fx*9+3,hy-12)},hc)}
  if(HP)drawHair2D(HP,0,hx,hy,hc,fl,back)}
 outlined(()=>{g.arc(hx,hy,R,0,7)},fl?'#fff':h.skin);
 g.fillStyle=hc;
 if(hood){g.fillStyle=fl?'#fff':L.hoodC||L.torso;g.beginPath();if(back)g.arc(hx,hy-.5,R+3.4,0,7);else g.arc(hx,hy-.5,R+3.4,Math.PI*1.06,Math.PI*1.94);g.fill();
  if(L.hood==='chat')for(const s of[-1,1])outlined(()=>{g.moveTo(hx+s*5,hy-14);g.lineTo(hx+s*10,hy-23);g.lineTo(hx+s*12,hy-10)},fl?'#fff':L.hoodC||L.torso)}
 else{
 if(h.style!=='chauve'&&!(HS&&HS.cap===0)){g.beginPath();if(back)g.arc(hx,hy,R+.6,0,7);else g.arc(hx,hy-1,R+.6,Math.PI*1.04,Math.PI*1.96);g.fill()}
 if(h.style==='pics')for(let i=-3;i<=3;i++){const a=-Math.PI/2+i*.38;outlined(()=>{g.moveTo(hx+Math.cos(a-.25)*R*.8,hy+Math.sin(a-.25)*R*.8);g.lineTo(hx+Math.cos(a)*(R+9-Math.abs(i)),hy+Math.sin(a)*(R+9-Math.abs(i))-1);g.lineTo(hx+Math.cos(a+.25)*R*.8,hy+Math.sin(a+.25)*R*.8)},hc)}
 if(h.style==='courts'){g.beginPath();g.arc(hx,hy-3,R+1,Math.PI*1.1,Math.PI*1.9);g.fill()}
 if(h.style==='chignons'){blob(hx-12,hy-10,5.5,hc);blob(hx+12,hy-10,5.5,hc)}
 if(h.style==='lisse'&&!back){g.fillRect(hx-13,hy-5,4.5,15);g.fillRect(hx+8.5,hy-5,4.5,15)}
 if(HP)drawHair2D(HP,1,hx,hy,hc,fl,back);
 // frange : pointes, raie au milieu ou coupe droite
 const fr=HS?HS.f:h.style==='chauve'?'none':'zig';g.fillStyle=hc;
 if(!back&&fr==='zig'){g.beginPath();g.moveTo(ex-9,hy-9);g.lineTo(ex-5,hy-2);g.lineTo(ex-2,hy-8);g.lineTo(ex+2,hy-2);g.lineTo(ex+6,hy-8);g.lineTo(ex+9,hy-3);g.lineTo(ex+9,hy-11);g.closePath();g.fill()}
 if(!back&&fr==='part'){for(const s of[-1,1]){g.beginPath();g.moveTo(ex+s*.5,hy-12);g.quadraticCurveTo(ex+s*6,hy-9,ex+s*10.5,hy-1);g.lineTo(ex+s*11.5,hy-9);g.closePath();g.fill()}}
 if(!back&&fr==='flat'){const al=Math.asin(4/(R+.8));g.beginPath();g.arc(hx,hy,R+.8,Math.PI+al,2*Math.PI-al);g.closePath();g.fill()}}
 // bandeau frontal et plaque du village (selon la façon de le porter)
 if(!hood){g.fillStyle=h.band;
  if(bs==='front'||bs==='barre'||bs==='cornes'){g.fillRect(hx-R,hy-9,R*2,5);if(!back)bandPlate(h,ex,hy-6.75,1,0)}
  else if(bs==='oblique'){g.save();g.translate(ex+2,hy-3.5);g.rotate(.42);g.fillRect(-R-3,-3,R*2+4,6.2);g.restore();if(!back)bandPlate(h,ex+3.6,hy-1.6,1.08,.42)}
  else if(bs==='tete'){g.fillRect(hx-R+1,hy-15,R*2-2,4.2);if(!back)bandPlate(h,ex,hy-13.4,.85,0)}}
 if(bs==='cou'){g.fillStyle=h.band;g.fillRect(hx-8,hy+11.4,16,3.4);if(!back)bandPlate(h,hx+fx*2,hy+13.1,.6,0)}
 headAcc2D(h,hx,hy,R,ex,back,fl);
 if(back){if(h.acc==='kage')kageHat(hx,hy,fl,L);g.restore();return}
 // yeux (grands, avec reflet) ; Sharingan, Byakugan, Mode Ermite, Rinnegan, yeux de serpent…
 faceMarks(g,h,ex,hy,hy+1.5,1,1,0);
 const sage=u.auraV==='sage',eyeC=h.eye||(sage?'#e8a020':'#2a2a38');
 for(const sx of[-1,1]){const x=ex+sx*4.2,y=hy+1.5;if(bs==='oblique'&&sx>0)continue;
  if(eyeSpecial(g,h,x+fx*.3,y,.95,.75))continue;
  g.fillStyle='#fff';g.beginPath();g.ellipse(x,y,2.6,3.2,0,0,7);g.fill();g.fillStyle=eyeC;g.beginPath();g.ellipse(x+fx*.6,y+.3,1.7,2.4,0,0,7);g.fill();
  if(h.eye==='#e01a1a'){g.fillStyle='#111';g.fillRect(x+fx*.6-.5,y,1,1)}if(h.eye!=='#e8e8f8'){g.fillStyle='#fff';g.fillRect(x+fx*.6-.2,y-1.4,.9,.9)}
  if(sage){g.fillStyle='#d8601a';g.fillRect(x-2.5,y-4.5,5,1.5)}}
 if(h.brows){g.fillStyle='#111';g.fillRect(ex-7.5,hy-4,6,2.2);g.fillRect(ex+1.5,hy-4,6,2.2)}
 if(h.kaguya){blob(ex-3,hy-3,1,'#c22');blob(ex+3,hy-3,1,'#c22')}
 g.strokeStyle='#5a3020';g.lineWidth=1;g.beginPath();g.moveTo(ex-1.5,hy+7);g.lineTo(ex+1.5,hy+7);g.stroke();
 faceMarks(g,h,ex,hy,hy+1.5,1,1,1);accFace(g,h,ex,hy,hy+1.5,1,1);
 if(h.acc==='masque'||L.collar)outlined(()=>{g.moveTo(ex-11,hy+2.5);g.lineTo(ex+11,hy+2.5);g.lineTo(ex+9,hy+11);g.lineTo(ex-9,hy+11)},L.collar&&h.acc!=='masque'?(fl?'#fff':L.collar):(fl?'#fff':h.maskC||'#2a3550'));
 if(h.acc==='lunettes'){g.fillStyle='rgba(30,30,40,.93)';g.beginPath();g.roundRect(ex-8.4,hy-2,6.6,5.4,1.6);g.roundRect(ex+1.8,hy-2,6.6,5.4,1.6);g.fill();g.fillRect(ex-2,hy-.2,4,1.1)}
 if(h.acc==='anbu'){outlined(()=>{g.ellipse(ex,hy+2,10.5,10,0,0,7)},'#f2f0ea');g.fillStyle='#1a1414';for(const s of[-1,1]){g.beginPath();g.ellipse(ex+s*4,hy+1,2,1.4,0,0,7);g.fill()}g.strokeStyle='#c02a2a';g.lineWidth=1.2;for(const s of[-1,1]){g.beginPath();g.moveTo(ex+s*2,hy-5);g.lineTo(ex+s*3.5,hy-1.8);g.moveTo(ex+s*6.5,hy+4);g.lineTo(ex+s*4.5,hy+7);g.stroke()}}
 if(h.acc==='oinin')yu_mask(g,ex,hy,1,1); // clan Yuki : masque de chasseur de déserteurs (kits/yuki.js)
 if(h.acc==='visee'){g.strokeStyle='#3a3f4a';g.lineWidth=1.2;g.beginPath();g.moveTo(ex+4,hy-1.5);g.lineTo(hx+R,hy-3);g.stroke();blob(ex+4.2,hy+1.5,2.5,'#5a6a7a');circ(ex+4.2,hy+1.5,1.5,'#6ad8ff')}
 if(h.acc==='fleur'){const fx2=hx+(fx>=0?-8:8);for(let i=0;i<5;i++){const a=i*1.26;blob(fx2+Math.cos(a)*2.6,hy-11+Math.sin(a)*2.6,2,fl?'#fff':'#e4e8f8')}circ(fx2,hy-11,1.4,'#8e9ede')}
 if(HP)drawHair2D(HP,2,hx,hy,hc,fl,back);
 if(h.acc==='kage')kageHat(hx,hy,fl,L);
 g.restore()}
function drawNinjaWeapon(u,L,W,k,hf,hb,fx,fy,back,fl,t){const [x,y]=hf,a=Math.atan2(Math.sin(u.aim)*K,Math.cos(u.aim)),act=u.swing>0||u.block||u.cast,c=W.col;
 const AA=L.armAcc,glv=AA==='gants'?'#1c1c24':AA==='gantelets'?'#7a828e':null,fist=(px,py,r,cc)=>{blob(px,py,r,glv&&!fl&&(cc==='#f0ebe0'||cc===L.head.skin)?glv:cc);if(AA==='bague'&&!fl){circ(px,py+r*.45,r*.55,'#7a3aaa');circ(px+r*.5,py-r*.2,r*.3,'#f0c840')}}; // gants, gantelets, vernis et bague : aussi sur la main qui tient l'arme
 switch(k){
  case'fist':fist(x,y,3.2,fl?'#fff':'#f0ebe0');if(!glv){g.strokeStyle='#c8c0b0';g.lineWidth=.8;g.beginPath();g.moveTo(x-2.5,y);g.lineTo(x+2.5,y-1);g.stroke()}break;
  case'bigfist':{const r=u.swing>0?9:4.5;fist(x,y,r,fl?'#fff':u.ch.look.head.skin);if(u.swing>0){g.fillStyle=rgba('#ffcf7a',.35);g.beginPath();g.arc(x,y,r+4,0,7);g.fill()}break}
  case'palm':fist(x,y,3,u.ch.look.head.skin);if(act){g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#9fc8ff',.6);g.beginPath();g.arc(x,y,5+rnd()*2,0,7);g.fill();g.restore()}break;
  case'claws':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='#eee';g.lineWidth=1.2;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(x+Math.cos(a+q*.35)*2,y+Math.sin(a+q*.35)*2);g.lineTo(x+Math.cos(a+q*.35)*7,y+Math.sin(a+q*.35)*7);g.stroke()}break;
  case'bone':fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(a);outlined(()=>{g.moveTo(0,-2.5);g.lineTo(22,0);g.lineTo(0,2.5)},'#f2efe6');g.restore();break;
  case'sword':if(W.same){fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(u.block?a-1.3:a+(u.swing>0?0:.5));g.translate(19,0);hs_sameD(.75,0,act);g.restore();break} // clan Hoshigaki : Samehada en main
  {fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(u.block?a-1.3:a+(u.swing>0?0:.5));g.fillStyle='#3a3a44';g.fillRect(-7,-1.6,8,3.2);g.fillStyle='#c8a040';g.fillRect(1,-3,2,6);
   if(act){g.shadowColor=c;g.shadowBlur=8*RS}g.fillStyle='#e8ecf2';g.beginPath();g.moveTo(3,-1.4);g.lineTo(33,-.6);g.lineTo(35,.6);g.lineTo(3,1.4);g.fill();g.restore();break}
  case'chain':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='#e8c860';g.lineWidth=1.3;for(let q=0;q<4;q++){g.beginPath();g.ellipse(x-fx*q*3,y+4+q*3,2.2,1.4,q,0,7);g.stroke()}break;
  case'bugs':fist(x,y,3,u.ch.look.head.skin);g.fillStyle='#26302a';for(let q=0;q<6;q++){const b=t*6+q*1.1;g.fillRect(x+Math.cos(b)*6,y+Math.sin(b*1.3)*5,1.6,1.6)}break;
  case'shadow':fist(x,y,3.2,fl?'#fff':'#16161c');if(act){g.fillStyle='rgba(10,10,14,.6)';g.beginPath();g.arc(x,y,5.5,0,7);g.fill()}break;
  case'sand':fist(x,y,3.8,fl?'#fff':'#d8b878');if(act){g.fillStyle='#d8b878';for(let q=0;q<6;q++)g.fillRect(x+(rnd()-.5)*10,y+(rnd()-.5)*10,1.8,1.8)}break;
  case'senbon':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='#e8eef6';g.lineWidth=.9;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a+q*.25)*10,y+Math.sin(a+q*.25)*10);g.stroke()}break;
  // armes des styles de clan (corps à corps)
  case'vine':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='#3a6a2a';g.lineWidth=1.6;g.beginPath();g.arc(x,y,4.2,0,7);g.stroke();g.strokeStyle='#e8e0b0';g.lineWidth=1.1;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(x+Math.cos(a+q*.4)*3,y+Math.sin(a+q*.4)*3);g.lineTo(x+Math.cos(a+q*.4)*7.5,y+Math.sin(a+q*.4)*7.5);g.stroke()}break;
  case'fan':fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(u.block?a-1.3:a+(u.swing>0?0:.6));g.fillStyle='#3a2a1e';g.fillRect(-3,-1.8,20,3.6);g.fillStyle='#f4ecd8';g.fillRect(1,-1.1,15,2.2);g.fillStyle='#e0b84a';g.fillRect(-3,-2,2,4);g.restore();break;
  case'gold':fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(a+(u.block?-1.2:0));g.fillStyle='#8a6a20';g.fillRect(-6,-1.4,7,2.8);if(act){g.shadowColor='#f0c040';g.shadowBlur=8*RS}g.fillStyle='#f0c040';g.beginPath();g.moveTo(1,-3.4);g.lineTo(16,0);g.lineTo(1,3.4);g.fill();g.restore();break;
  case'paper':fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(a+(u.swing>0?0:.5));g.fillStyle='#f6f3ea';g.strokeStyle='#7a9ae0';g.lineWidth=.8;g.beginPath();g.moveTo(-4,-2.6);g.lineTo(16,-.6);g.lineTo(16,.8);g.lineTo(-4,2.6);g.closePath();g.fill();g.stroke();g.restore();break;
  case'shuriken':fist(x,y,3,u.ch.look.head.skin);g.save();g.translate(x+Math.cos(a)*5,y+Math.sin(a)*5);g.rotate(act?t*18:.4);g.fillStyle='#cfd3dd';g.strokeStyle='#3a3a44';g.lineWidth=.8;g.beginPath();for(let q=0;q<8;q++){const r=q%2?2:7,b=q*Math.PI/4;g.lineTo(Math.cos(b)*r,Math.sin(b)*r)}g.closePath();g.fill();g.stroke();g.restore();break;
  case'ice':fist(x,y,3.2,fl?'#fff':'#e8f8ff');g.fillStyle='rgba(191,230,255,.9)';g.strokeStyle='#7fc8f0';g.lineWidth=.8;for(let q=-1;q<=1;q++){const b=a+q*.5;g.beginPath();g.moveTo(x+Math.cos(b+1.57)*1.6,y+Math.sin(b+1.57)*1.6);g.lineTo(x+Math.cos(b)*(q?7:10),y+Math.sin(b)*(q?7:10));g.lineTo(x-Math.cos(b+1.57)*1.6,y-Math.sin(b+1.57)*1.6);g.closePath();g.fill();g.stroke()}break;
  case'puppet':fist(x,y,3,u.ch.look.head.skin);g.strokeStyle='rgba(170,225,255,.6)';g.lineWidth=.7;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(x+q*1.5,y-1);g.lineTo(x+q*1.5+Math.cos(a)*4,y-4);g.stroke()}break;
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
