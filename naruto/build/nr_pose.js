// ---------- Poses des ninjas (2D) : squelette, poses par état, animations nommées, puis rig 2D (cinématique directe projetée) ----------
// Chaque image, on calcule une pose cible (angles par os) d'après l'état du ninja ; chaque os la rejoint en douceur ; une cinématique directe
// place épaules, coudes, mains, hanches, genoux, pieds et tête, et le dessin 2D (nr_char.js) trace le ninja chibi sur ces points.
// os du squelette : [nom, parent, position de repos relative au parent] (unités du dessin 2D : pieds en 0, hanches à 20,5, centre de la tête à 53)
const BONES=[['root',null,[0,0,0]],['hips','root',[0,20.5,0]],['spine','hips',[0,4,0]],['chest','spine',[0,9,0]],['neck','chest',[0,8,0]],['head','neck',[0,3.5,0]],
 ['hair','head',[0,10,-9]],['band','head',[0,9,-11.5]],['armL','chest',[10,5.5,0]],['foreL','armL',[0,-8.5,0]],['handL','foreL',[0,-8,0]],['armR','chest',[-10,5.5,0]],['foreR','armR',[0,-8.5,0]],['handR','foreR',[0,-8,0]],
 ['cape','chest',[0,6,-7.6]],['cape2','cape',[0,-13,0]],['skirt','hips',[0,0,0]],['thighL','hips',[4.4,-.5,0]],['shinL','thighL',[0,-9.5,0]],['footL','shinL',[0,-9,0]],['thighR','hips',[-4.4,-.5,0]],['shinR','thighR',[0,-9.5,0]],['footR','shinR',[0,-9,0]]];
const BI=Object.fromEntries(BONES.map((b,i)=>[b[0],i]));
// vitesse de mise en place de chaque os (plus haut = plus sec)
const BRATE={root:20,hips:20,spine:20,chest:22,neck:22,head:20,hair:7,band:6,armL:26,foreL:26,handL:26,armR:26,foreR:26,handR:26,cape:6,cape2:5,skirt:12,thighL:24,shinL:24,footL:24,thighR:24,shinR:24,footR:24};
// taille (bh) et carrure (bw) : longueurs des os et épaisseur des pièces (purement visuel : la zone de coups ne change pas)
const BYS=new Set(['hips','spine','chest','neck','foreL','handL','foreR','handR','shinL','footL','shinR','footR','cape2']);
function boneOffs(L){const bh=L.bh||1,bw=L.bw||1;return BONES.map(([n,p,o])=>{const v=o.slice();if(BYS.has(n))v[1]*=bh;if(n==='armL'||n==='armR'){v[0]*=bw;v[1]*=bh}
 if(n==='thighL'||n==='thighR')v[0]*=(1+bw)/2;if(n==='cape'){v[2]*=bw;v[1]*=bh}return v})}
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
// fin des mudras : au plus tard à 62 % de l'incantation, pour que la préparation propre à l'élément (bras levés du Doton, souffle du Katon…) se voie vraiment
const mdEnd=md=>Math.min(1-Math.min(.3,.9/md.n),.62);
function castPose(u,P,t,A){const c=u.cast,ab=castAb(u,c),k=c01(c.t/(c.dur||1)),st=A.cs||anStyle(ab),S=ab&&ab.rank==='S'?1:0,md=typeof mudraOf==='function'?mudraOf(u):null,s=ezo(c01(k/.22));
 let b;if(md){mudraPose(P,md,t);b=smt(mdEnd(md),1,k);legsW(P,s,.8)}else{b=ezo(c01(k/.35));pz(P,'armL',-.5,0,.2);pz(P,'armR',-.5,0,-.2)}
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
  if(nin){const L=spr?.74:.56;pz(P,'chest',L,-s*.1);pz(P,'spine',.2);pz(P,'head',-L*.8);pz(P,'armL',.62+.06*s,0,.5);pz(P,'armR',.62-.06*s,0,-.5);pz(P,'foreL',-.05);pz(P,'foreR',-.05);pz(P,'handL',.5);pz(P,'handR',.5);pz(P,'cape',-1.15);pz(P,'cape2',-.4)} // course ninja : buste couché, bras tendus en arrière
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
function anNew(){return{ph:fxR()*6.28,fl:0,hp:-1,hT:9,hK:0,hZ:1,hX:0,hs:0,vic:0,sq:0,kd:0,kT:0,kS:1,kX:0,lT:9,air:false,cs:null,csT:9,rl:0,rs:null,dd:0,dS:1,dX:0}}
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
 if(A.kd){A.kT+=dt;if(u.dead)A.kd=0;else if(A.kd===1&&!(u.airT>0)){A.kd=2;A.kT=0;A.lT=9}else if(A.kd===2&&((!(u.stun>0)&&A.kT>.22)||A.kT>1.4||u.moving&&!(u.stun>0)&&!(Math.hypot(u.kx||0,u.ky||0)>40)&&A.kT>.15)){A.kd=3;A.kT=0}else if(A.kd===3&&A.kT>.45)A.kd=0}
 const inAir=(u.z||0)>5||u.airT>0||!!(u.dash&&u.dash.jump);if(A.air&&!inAir&&!u.dead&&!A.kd)A.lT=0;A.air=inAir;A.lT+=dt;
 if(u.cast){A.cs=anStyle(castAb(u,u.cast));A.csT=0}else A.csT+=dt;
 // jutsu instantané (sans incantation) : repéré par sa recharge qui repart (hôte, et le joueur chez un invité) → libération propre à sa catégorie
 const cd=u.cds;if(cd&&!u.cast&&u.ch&&u.ch.abil){const C=A.cd||(A.cd=[0,0,0,0,0,0,0]);for(let i=1;i<7;i++){const v=cd[i]||0;if(v>C[i]+.5&&u.ch.abil[i]&&u.ch.abil[i].rank){A.cs=anStyle(u.ch.abil[i]);A.csT=0}C[i]=v}}
 const rl=u.relT||0;if(rl>A.rl+.05)A.rs=A.csT<.3&&A.cs?A.cs:'push';A.rl=rl;
 if(u.dead&&!A.dd){A.dd=1;A.dS=A.hT<1&&A.hZ<-.3?-1:1;A.dX=A.hT<1?A.hX:0}else if(!u.dead)A.dd=0}

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

// ----- rig 2D : pose lissée par ninja (aucune allocation par image), puis cinématique directe projetée sur le dessin chibi
// Projection : le corps reste de face (épaules à ±9), ce qui part vers l'avant (+z) suit la visée à l'écran (cos a, sin a × K × 0,6), le haut (+y) monte ;
// la main droite (celle de l'arme) est toujours la main avant, côté visée. Repère du dessin : pieds en (0, 0), y vers le bas.
const NBONE=BONES.length,BNAME=BONES.map(b=>b[0]),BPAR=BONES.map(b=>b[1]?BI[b[1]]:-1),BRATEA=BONES.map(b=>BRATE[b[0]]||16),RLAT=.9;
const BSKIP=new Set([BI.hair,BI.band,BI.cape2,BI.skirt]); // os sans usage en 2D (balancements dessinés à part)
const RT9=new Float64Array(9),LEGS2=[[BI.thighL,BI.shinL,BI.footL,-1],[BI.thighR,BI.shinR,BI.footR,1]]; // jambes : [hanche, genou, cheville, côté]
function rigOf(u){return u._rg||(u._rg={P:poseNew(),C:poseNew(),A:anNew(),rP:{x:0,y:0,z:0},rR:{x:0,y:0,z:0},last:0,M:new Float64Array(NBONE*9),J:new Float64Array(NBONE*3),S:new Float64Array(NBONE*2),
 off:null,offL:null,flip:false,fs:1,ax:1,ay:0,hL:[0,0],hR:[0,0],hc:[0,0],wa:0,wd:0,zL:0,zR:0})}
// pose de l'image (une seule mise à jour par image, même si le ninja est dessiné plusieurs fois : images rémanentes, teinte, cartes)
function rigUpd(u,R,t){const sim=typeof SIMT!=='undefined'&&state==='fight'&&!isGuest(),now=sim?SIMT*1000:performance.now();if(sim!==R.sim){R.sim=sim;R.last=0}let dt=(now-R.last)/1000;if(R.last&&dt>=0&&dt<.003)return R;const first=!R.last;R.last=now;dt=Math.min(.05,Math.max(0,dt));if(!sim)dt=dt||1/60; // en combat (hôte, hors ligne) : temps du JEU (pause, arrêt sur coup, ralenti suivis) ; invité et menus : temps réel
 const A=R.A,P=poseClr(R.P);try{anEvents(u,A,dt);if(u.dead)deathPose(u,P,t,A);else{basePose(u,t,R,P,A);actionPose(u,t,R,P,A);if(A.kd)downPose(u,P,t,A)}}catch(e){}
 // arrêt sur image : les os ne bougent plus pendant ~75 ms ; juste après un coup, le buste répond plus sec
 let pdt=dt,bo=1;if(A.hs>0){A.hs-=dt;pdt=0}else if(A.hT<.12)bo=2.3;
 if(pdt>0){const C=R.C;for(let i=1;i<NBONE;i++){if(BSKIP.has(i))continue;const n=BNAME[i],o=P[n],c=C[n],k=first?1:1-Math.exp(-BRATEA[i]*(i<6?bo:1)*pdt);c.x+=(o.x-c.x)*k;c.y+=(o.y-c.y)*k;c.z+=(o.z-c.z)*k}
  const k=first?1:1-Math.exp(-24*bo*pdt),rp=R.rP,rr=R.rR,pr=P.root,pR=P.rootR;rp.x+=((pr.x||0)-rp.x)*k;rp.y+=((pr.y||0)-rp.y)*k;rp.z+=((pr.z||0)-rp.z)*k;
  rr.x+=((pR.x||0)-rr.x)*k;rr.z+=((pR.z||0)-rr.z)*k;rr.y=pR.y?pR.y:rr.y*(1-k)}
 // écrasement : touché fort (pendant l'arrêt sur image) et réception d'un saut
 const sqT=(A.hs>0&&A.vic?1:0)+(A.lT<.14?bump(A.lT/.14)*.55:0);A.sq+=(sqT-A.sq)*(1-Math.exp(-40*dt));return R}
// matrice de rotation d'Euler (ordre XYZ), rangée par lignes
function eul9(m,o,x,y,z){const a=Math.cos(x),b=Math.sin(x),c=Math.cos(y),d=Math.sin(y),e=Math.cos(z),f=Math.sin(z),ae=a*e,af=a*f,be=b*e,bf=b*f;
 m[o]=c*e;m[o+1]=-c*f;m[o+2]=d;m[o+3]=af+be*d;m[o+4]=ae-bf*d;m[o+5]=-b*c;m[o+6]=bf-ae*d;m[o+7]=be+af*d;m[o+8]=a*c}
// cinématique directe + projection : R.S = position écran de chaque os ; mains (centre de la paume), axe de l'arme, profondeur des mains
function rigFK(u,R){const L=u.ch.look;if(R.offL!==L){R.offL=L;R.off=boneOffs(L)}const off=R.off,M=R.M,J=R.J,S=R.S,C=R.C,T=RT9;
 const a=u.aim||0,ca=Math.cos(a),fs=ca>=0?1:-1,ax=ca,ay=Math.sin(a)*K*.6;R.fs=fs;R.ax=ax;R.ay=ay;
 // couché (projeté, mort) : le corps bascule autour des pieds ; on ramène le bassin vers le point d'appui pour qu'il reste sur sa zone de coups
 eul9(M,0,R.rR.x,R.rR.y,R.rR.z);J[0]=R.rP.x;J[1]=R.rP.y;J[2]=R.rP.z-Math.sin(R.rR.x)*30;S[0]=-J[0]*fs*RLAT+J[2]*ax;S[1]=-J[1]+J[2]*ay;
 for(let i=1;i<NBONE;i++){if(BSKIP.has(i))continue;const p=BPAR[i],pm=p*9,p3=p*3,i3=i*3,im=i*9,o=off[i],c=C[BNAME[i]];
  J[i3]=J[p3]+M[pm]*o[0]+M[pm+1]*o[1]+M[pm+2]*o[2];J[i3+1]=J[p3+1]+M[pm+3]*o[0]+M[pm+4]*o[1]+M[pm+5]*o[2];J[i3+2]=J[p3+2]+M[pm+6]*o[0]+M[pm+7]*o[1]+M[pm+8]*o[2];
  eul9(T,0,c.x,c.y,c.z);for(let r=0;r<3;r++){const q0=M[pm+r*3],q1=M[pm+r*3+1],q2=M[pm+r*3+2];M[im+r*3]=q0*T[0]+q1*T[3]+q2*T[6];M[im+r*3+1]=q0*T[1]+q1*T[4]+q2*T[7];M[im+r*3+2]=q0*T[2]+q1*T[5]+q2*T[8]}
  S[i*2]=-J[i3]*fs*RLAT+J[i3+2]*ax;S[i*2+1]=-J[i3+1]+J[i3+2]*ay}
 // centre de la paume : 2,6 unités au-delà du poignet, dans l'axe de la main ; tête : centre du crâne 8 unités au-dessus de l'os de la tête
 const pt=(i,ox,oy,oz,out)=>{const i3=i*3,im=i*9,x=J[i3]+M[im]*ox+M[im+1]*oy+M[im+2]*oz,y=J[i3+1]+M[im+3]*ox+M[im+4]*oy+M[im+5]*oz,z=J[i3+2]+M[im+6]*ox+M[im+7]*oy+M[im+8]*oz;
  out[0]=-x*fs*RLAT+z*ax;out[1]=-y+z*ay;return z};
 const cz=J[BI.chest*3+2];R.zL=pt(BI.handL,0,-2.6,0,R.hL)-cz;R.zR=pt(BI.handR,0,-2.6,0,R.hR)-cz;pt(BI.head,0,8,0,R.hc);
 // axe de l'arme : +z de la main droite (lame), et son prolongement (−y, dans l'axe de l'avant-bras)
 const hm=BI.handR*9,dir=(dx,dy,dz)=>Math.atan2(-dy+dz*ay,-dx*fs*RLAT+dz*ax);R.wa=dir(M[hm+2],M[hm+5],M[hm+8]);R.wd=dir(-M[hm+1],-M[hm+4],-M[hm+7]);
 R.flip=Math.cos(R.rR.y)<0;return R}
// pose et points d'un ninja pour cette image
function rig2D(u,t){const R=rigOf(u);rigUpd(u,R,t);return rigFK(u,R)}
