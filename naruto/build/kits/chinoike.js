// ===== Clan Chinoike (c15, préfixe ci_) : le sang =====
// Identité : la Saignée (trait) : les jutsu du clan ouvrent des entailles qui saignent, et le sang versé soigne le Chinoike (ou lui rend du chakra à PV pleins).
// Quatre axes : Ketsuryûgan (l'œil de sang : paralyser ceux qui saignent, faire bouillir leur sang, illusions), armes de sang cristallisé
// (aiguilles, fouet, lance, pieux), prix du sang (certains jutsu se paient en PV au lieu du chakra et frappent plus fort : option hpc,
// coût affiché en rouge dans la barre de jutsu et le créateur ; moteur : bloc « # clan Chinoike » de mknaruto.py) et vol de vie.
// Combo signature : ouvrir des entailles (aiguilles, fouet, lame) → Ketsuryûgan : Paralysie ou Sang bouillant (qui consume les entailles).
const ciD={
 ndl:'3 aiguilles de sang en éventail ; chaque aiguille qui touche ouvre une entaille (2 max par lancer)',
 whip:'Prix du sang (5 % des PV max) : le fouet de sang frappe toute la ligne, ouvre 2 entailles et ramène les ennemis vers toi',
 spear:'Prix du sang (7 % des PV max) : lance de sang perçante ; dans une cible qui saigne déjà, elle éclate (+45 % de dégâts) et l\'entrave 0,5 s',
 gaze:'Regard droit devant : qui saigne est paralysé 0,9 s, les autres sont ralentis 1,2 s',
 boil:'Fait bouillir le sang de l\'ennemi visé : réduit au silence 0,8 s, 3 brûlures en 1,5 s, plus fortes par entaille, puis les entailles sont consumées',
 mir:'Tu disparais 1,6 s (plus rapide) et laisses un double de sang ; les ennemis proches qui te regardaient fuient, terrifiés 0,7 s',
 step:'Fonce au travers des ennemis jusqu\'au point visé (240 max) : chaque ennemi traversé est entaillé',
 tide:'Prix du sang (4 % des PV max) : tu fonds en une flaque intouchable qui glisse au point visé (300 max), puis jaillis : dégâts, entaille, ralentit',
 moon:'Lune de sang sur la zone 4 s : les ennemis dedans sont ralentis, gagnent une entaille par seconde et leur sang te soigne 2 fois plus ; à la fin, les entailles explosent et étourdissent 0,5 s',
 stk:'Prix du sang (10 % des PV max) : 3 vagues de pieux de sang jaillissent en ligne devant toi : gros dégâts, entrave 0,7 s, 2 entailles',
};
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c15',[
 [1,'D','x.ci_ndl','Aiguilles de sang',ciD.ndl,'ci_blood'],
 [1,'C','x.ci_whip','Fouet de sang',ciD.whip,'ci_blood'],
 [3,'B','x.ci_spear','Lance de sang cristallisé',ciD.spear,'ci_blood'],
 [3,'B','x.ci_gaze','Ketsuryûgan : Paralysie',ciD.gaze,'genjutsu'],
 [4,'A','x.ci_boil','Ketsuryûgan : Sang bouillant',ciD.boil,'genjutsu'],
 [4,'C','x.ci_mir','Ketsuryûgan : Mirage',ciD.mir,'genjutsu'],
 [2,'C','x.ci_step','Pas sanglant',ciD.step,'ci_blood'],
 [2,'B','x.ci_tide','Marée de sang',ciD.tide,'ci_blood'],
 [5,'S','x.ci_moon','Ketsuryûgan : Lune de sang',ciD.moon,'genjutsu'],
 [5,'A','x.ci_stk','Forêt de pieux de sang',ciD.stk,'ci_blood'],
]);
// style de combat propre (lame de sang cristallisé) ; le clan garde aussi les kunai pour jouer à distance
STYLES.push(['Lame de sang','Sabre de sang cristallisé à longue allonge ; 5e coup : grande entaille en arc qui ouvre 2 entailles','x.ci_style','ci_blood','sword',[15],1.3,1.24]);
STYLES.find(s=>s[0]==='Kunai')[5].push(15);

// ---- réglages (dégâts de base avant la puissance du ninja)
const ciK={
 bl:{max:5,dur:4,dps:1,heal:.5,ck:.3}, // entailles : 5 max, 4 s (relancées à chaque nouvelle entaille), dégâts/s par entaille, part du sang bu en PV, chakra par PV saigné à PV pleins
 ndl:{d:6,sp:.13,n:2},whip:{L:270,w:44,d:20,pull:240},spr:{d:24,bon:.45,root:.5},gaze:{L:340,w:110,d:10,st:.9,sl:1.2},
 boil:{d:6,ps:2.5,sil:.8},mir:{t:1.6,fear:.7,R:300},step:{D:240,d:6},tide:{D:300,r:95,d:12},moon:{r:190,t:4,b:8,det:6,st:.5},stk:{L:450,d:26,root:.7}};
const ciAI={gzOn:RG(320,.75),gzOff:RG(320,.1),bOn:RG(420,.8),bOff:RG(420,.18),spOn:RG(500,.7),spOff:RG(500,.35)};
const CIR=['#c0142a','#ff4a5a','#5a0610','#ff9aa4'];
const ciI=u=>units.indexOf(u);
function ciS(k,u){const V=VFX;VFX=null;S(k,u);VFX=V} // son exact, sans la teinte de l'élément
function ciSay(u,s,col,dz){if(near(u.x,u.y))txt.push({x:u.x+(rnd()-.5)*12,y:u.y,z:95+(dz||0),s,col,t:1})}
function ciSlot(u,k){const A=u.ch.abil;for(let i=0;i<A.length;i++)if(A[i]&&A[i].key===k)return i;return -1}
function ciLine(u,a,len,w){const c=Math.cos(a),s=Math.sin(a);return enemies(u).filter(e=>{const dx=e.x-u.x,dy=e.y-u.y,f=dx*c+dy*s;return f>-e.r&&f<len+e.r&&Math.abs(-dx*s+dy*c)<w/2+e.r})}
const ciIn=(x,y,e,r)=>Math.hypot(e.x-x,e.y-y)<r+e.r;

// ---- saignée : une entaille = un objet aux par cible (logique sur l'hôte) ; la cible porte ci_bl (nombre d'entailles, synchronisé) pour le dessin
function ciBl(e){for(const x of aux)if(x.type==='ci_bl'&&x.tg===e&&x.t>0)return x;return null}
function ciBleed(u,e,n){if(!u||!e||e.dead||e.team===u.team||!(n>0)||e.phase>0)return 0;const K=ciK.bl;let x=ciBl(e);
 if(!x){x={type:'ci_bl',x:e.x,y:e.y,r:0,t:K.dur,m:K.dur,team:u.team,owner:u,tg:e,ti:ciI(e),n:0,k:.5,dk:0};aux.push(x)}
 const n0=x.n;x.n=Math.min(K.max,x.n+n);x.t=x.m=K.dur;x.owner=u;e.ci_bl=x.n;
 if(x.n>n0&&near(e.x,e.y)){sparks(e.x,e.y,CIR[0],3+2*(x.n-n0),'ci_blood');if(x.n===K.max&&n0<K.max)ciSay(e,'SAIGNE À FLOTS','#ff4a5a',22)}return x.n}
// consume les entailles d'une cible (Sang bouillant, Lune de sang) : renvoie leur nombre
function ciTake(e){const x=ciBl(e);if(!x)return 0;const n=x.n;x.n=0;x.t=0;e.ci_bl=0;return n}
// le sang versé revient au Chinoike : soin (la moitié des PV saignés, ×2 sous la Lune de sang), ou chakra à PV pleins
function ciDrink(u,e,real,x){if(!u||u.dead||!(real>0))return;const K=ciK.bl,v=real*K.heal*(e.ci_mnT>SIMT?2:1);
 if(u.hp<u.max-.5){const r=gain(u,v/HEALX,u);u.ci_hp=(u.ci_hp||0)+r}else u.energy=Math.min(100,u.energy+real*K.ck);
 if(x&&(x.dk-=.5)<=0&&dist(u,e)<760){x.dk=1;jx({jfx:'ci_drink',ui:ciI(u),ti:ciI(e),x:e.x,y:e.y,t:.75,m:.75})}}
AUXF.ci_bl=(x,dt)=>{const e=x.tg;if(!e||e.dead||x.n<=0||x.t<=0){if(e)e.ci_bl=0;x.t=0;return}x.x=e.x;x.y=e.y;e.ci_bl=x.n;
 if(x.k<=0){x.k+=.5;const u=x.owner,h0=e.hp;e.cbT=SIMT;hit(e,u,x.n*ciK.bl.dps*.5,{silent:1,el:-1,unblockable:1,ci_b:1});const real=Math.max(0,h0-Math.max(0,e.hp));ciDrink(u,e,real,x);
  if(real>=1&&near(e.x,e.y)&&(x.tx=(x.tx||0)+real)>=4){txt.push({x:e.x+(rnd()-.5)*16,y:e.y,z:70,s:'-'+Math.round(x.tx),col:'#ff4a5a',t:.8});x.tx=0}}};
// flaque de sang sous la cible (plus large avec les entailles)
AUXD.ci_bl=(x,k,t)=>{const n=x.n||0;if(!n)return;const q=P(x.x,x.y,0),s=q.s,R=(12+n*3.2)*s;g.fillStyle=rgba('#6a0610',.5*k);g.beginPath();g.ellipse(q.x,q.y+2*s,R,R*K*.8,0,0,7);g.fill();
 g.fillStyle=rgba('#a0101e',.55*k);for(let i=0;i<n+2;i++){const b=i*2.4+1,d=R*(.75+.25*Math.sin(i*1.7));g.beginPath();g.ellipse(q.x+Math.cos(b)*d,q.y+2*s+Math.sin(b)*d*K*.8,2.6*s,1.6*s,0,0,7);g.fill()}
 g.fillStyle=rgba('#ff8a94',.35*k);g.beginPath();g.ellipse(q.x-R*.3,q.y,R*.25,R*K*.12,0,0,7);g.fill()};
// goutte (pointe en haut)
function ciDrop(x,y,r,col){g.fillStyle=col;g.beginPath();g.moveTo(x,y-r*2.2);g.quadraticCurveTo(x+r*1.1,y-r*.4,x+r,y+r*.2);g.arc(x,y+r*.2,r,0,Math.PI);g.quadraticCurveTo(x-r*1.1,y-r*.4,x,y-r*2.2);g.fill()}
// ninja qui saigne : gouttes qui tombent du corps + rangée d'entailles sous les pieds (lisible : combien d'entailles)
STATD.push((u,p,S,sk)=>{const n=u.ci_bl|0;if(!n||u.dead)return;if(!isGuest()&&!ciBl(u)){u.ci_bl=0;return}const t=performance.now()/1000;g.save();
 for(let i=0;i<Math.min(5,n+1);i++){const k=(t*1.5+i*.29)%1,x=p.x+((i*13)%22-11)*S,y0=p.y-(44+(i*7)%16)*S*sk,y=y0+ezio(k)*(p.y-y0);ciDrop(x,y,(1.7+.3*(i%2))*S,rgba(i%2?'#c0142a':'#8a0a18',.95*(1-k*.5)))}
 for(let i=0;i<3;i++){const y=p.y-(30+i*9)*S*sk;g.strokeStyle=rgba('#d01828',i<n?.8:0);g.lineWidth=1.6*S;g.beginPath();g.moveTo(p.x-6*S,y-2*S);g.lineTo(p.x+5*S,y+2*S);g.stroke()} // entailles sur le torse
 const W=7*S;for(let i=0;i<n;i++)ciDrop(p.x+(i-(n-1)/2)*W,p.y+15*S,2.2*S,i===4?'#ff4a5a':'#c0142a');g.restore()});

// ---- prix du sang (moteur générique : option hpc d'un jutsu, voir mknaruto.py) : paiement, refus, case de la barre de jutsu
function hpPay(u,v,ab){u.hp=Math.max(1,u.hp-v);u.ci_pd=(u.ci_pd||0)+v;if(near(u.x,u.y)){txt.push({x:u.x,y:u.y,z:112,s:'-'+v+' PV (prix du sang)',col:'#ff3a4a',t:1.1});sparks(u.x,u.y,CIR[0],8,'ci_blood')}
 jx({jfx:'ci_price',ui:ciI(u),x:u.x,y:u.y,t:.6,m:.6})}
function hpLack(u,i){if(u.ckMsg>SIMT)return;u.ckMsg=SIMT+.7;if(u===player||u.human)say(u,'PAS ASSEZ DE PV','#ff6a7a');if(u===player){ckFl.i=i;ckFl.t=performance.now()+450}}
function hudHpc(p,ab,x,y,s,sh){const c=hpcost(p,ab),lack=p.hp<=c+1;
 if(lack){g.fillStyle='rgba(110,10,20,.55)';g.fillRect(x,y,s,sh);if(p.cds[ciSlotP(p,ab)]<=0)text('SANG',x+s/2,y+44,10,'#ff8a94','center')}
 g.fillStyle=lack?'#3a0a10':'#7a0a18';g.beginPath();g.roundRect(x+3,y+3,30,13,4);g.fill();ciDrop(x+9,y+10.5,2,'#ff9aa4');text(String(c),x+21,y+13,10,'#ffe0e4','center')}
const ciSlotP=(p,ab)=>{const i=p.ch.abil.indexOf(ab);return i<0?1:i};

// ---- mécaniques
Object.assign(NAT,{
 // Aiguilles de sang : éventail de 3 aiguilles ; chacune entaille (2 entailles max par lancer et par cible)
 ci_ndl:SP('Aiguilles de sang',ciD.ndl,5,{line:{len:470,w:60},ai:RG(440,.7)},(u,a)=>{const n={};ciS('blaster',u);anim(u,'ci_flick',.3);jx({jfx:'ci_forge',ui:ciI(u),x:u.x,y:u.y,a,t:.3,m:.3});
  for(const o of[-ciK.ndl.sp,0,ciK.ndl.sp])proj(u,a+o,{vfx:'ci_blood',spd:940,r:5,dmg:ciK.ndl.d,life:.5,col:CIR[0],kind:'ci_ndl',onHit:(p,t)=>{const k=ciI(t);if((n[k]=(n[k]||0)+1)<=ciK.ndl.n)ciBleed(p.owner,t,1)}})}),
 // Fouet de sang (prix du sang) : coup de fouet instantané sur toute la ligne, ramène vers le lanceur
 ci_whip:SP('Fouet de sang',ciD.whip,7,{hpc:.05,line:{len:ciK.whip.L,w:ciK.whip.w},ai:RG(250,.6)},(u,a)=>{const W=ciK.whip;ciS('saber',u);ciS('water',u);anim(u,'ci_lash',.45);
  jx({jfx:'ci_whip',ui:ciI(u),x:u.x,y:u.y,a,L:W.L,t:.45,m:.45});
  for(const e of ciLine(u,a,W.L,W.w))if(hit(e,u,W.d,{pull:W.pull,fx:u.x,fy:u.y,el:-1})){ciBleed(u,e,2);jx({jfx:'ci_splash',x:e.x,y:e.y,a,t:.5,m:.5,n:8})}}),
 // Lance de sang cristallisé (prix du sang) : perçante ; éclate dans une cible qui saignait déjà
 ci_spear:SP('Lance de sang cristallisé',ciD.spear,9,{hpc:.07,line:{len:540,w:24},ai:ciAI.spOff},(u,a)=>{const K=ciK.spr;ciS('bone',u);ciS('blaster',u);anim(u,'ci_throw',.45);
  jx({jfx:'ci_forge',ui:ciI(u),x:u.x,y:u.y,a,t:.35,m:.35,big:1});
  proj(u,a,{vfx:'ci_blood',spd:860,r:9,dmg:K.d,life:.63,col:CIR[0],pierce:1,kind:'ci_spear',onHit:(p,t)=>{const o=p.owner;if(t.dead)return;
   if((t.ci_bl|0)>0){if(hit(t,o,K.d*K.bon,{unblockable:1,root:K.root,el:-1})){jx({jfx:'ci_shatter',ti:ciI(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.6,m:.6});ciSay(t,'ÉCLATE !','#ff4a5a',24);ciS('rock',t)}}
   ciBleed(o,t,2)}})}),
 // Ketsuryûgan : Paralysie : le regard fige le sang de ceux qui saignent
 ci_gaze:SP('Ketsuryûgan : Paralysie',ciD.gaze,11,{line:{len:ciK.gaze.L,w:ciK.gaze.w},ai:ciAI.gzOff},(u,a)=>{const K=ciK.gaze;ciS('genjutsu',u);anim(u,'ci_gaze',.6);
  jx({jfx:'ci_gaze',ui:ciI(u),x:u.x,y:u.y,a,L:K.L,w:K.w,t:.6,m:.6});
  for(const e of ciLine(u,a,K.L,K.w)){if((e.ci_bl|0)>0){if(hit(e,u,K.d,{stun:K.st,unblockable:1,el:-1})&&e.stun>0){jx({jfx:'ci_para',ti:ciI(e),x:e.x,y:e.y,t:K.st,m:K.st});ciSay(e,'SANG FIGÉ','#ff4a5a',28)}}
   else hit(e,u,K.d,{slow:K.sl,unblockable:1,el:-1})}}),
 // Ketsuryûgan : Sang bouillant : verrouille l'ennemi visé ; 3 brûlures (plus fortes par entaille), silence, puis les entailles sont consumées
 ci_boil:SP('Ketsuryûgan : Sang bouillant',ciD.boil,12,{tele:{r:90,max:440},ai:ciAI.bOff},(u,a,td)=>{const p=atP(u,a,td,440),e=nearE(u,p.x,p.y,120);anim(u,'ci_gaze',.7);ciS('genjutsu',u);
  jx({jfx:'ci_eye',ui:ciI(u),x:u.x,y:u.y,t:.9,m:.9});
  if(!e){say(u,'AUCUNE CIBLE','#ffb0b8');const i=ciSlot(u,'ci_boil');if(i>=0){u.cds[i]=1.5;u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]))}return}
  jx({jfx:'ci_gline',ui:ciI(u),ti:ciI(e),x:e.x,y:e.y,t:.35,m:.35});
  aux.push({type:'ci_boil',x:e.x,y:e.y,r:0,t:1.55,m:1.55,team:u.team,owner:u,tg:e,ti:ciI(e),k:.05,n:0});ciSay(e,'LE SANG BOUT','#ff6a3a',30)}),
 // Ketsuryûgan : Mirage : invisible et rapide, un double de sang reste ; qui te regardait de près est terrifié
 ci_mir:SP('Ketsuryûgan : Mirage',ciD.mir,13,{ai:DEF},(u)=>{const K=ciK.mir;ciS('genjutsu',u);ciS('poof',u);anim(u,'ci_gaze',.35);
  jx({jfx:'ci_double',ui:ciI(u),x:u.x,y:u.y,t:K.t,m:K.t});jx({jfx:'ci_eye',ui:ciI(u),x:u.x,y:u.y,t:.6,m:.6});
  for(const e of enemies(u))if(dist(u,e)<K.R+e.r&&angDiff(e.aim||0,ang(e,u))<1.2&&hit(e,u,0,{fear:K.fear,fx:u.x,fy:u.y,silent:1,unblockable:1})&&e.fear>0)jx({jfx:'ci_haunt',ti:ciI(e),x:e.x,y:e.y,t:K.fear,m:K.fear});
  u.stealth=Math.max(u.stealth||0,K.t);u.haste=Math.max(u.haste||0,K.t);sparks(u.x,u.y,CIR[0],10,'ci_blood')}),
 // Pas sanglant : élan à travers les ennemis ; chaque ennemi traversé est entaillé
 ci_step:SP('Pas sanglant',ciD.step,8,{ai:GAP},(u,a,td)=>{const D=clamp(td||ciK.step.D,80,ciK.step.D),x0=u.x,y0=u.y;ciS('dash',u);anim(u,'ci_dash',.32);
  const x={type:'ci_stp',x:u.x,y:u.y,r:0,t:.4,m:.4,team:u.team,owner:u,hs:new Set()};aux.push(x);
  dash(u,a,D,.22,{through:1,end:()=>{x.t=Math.min(x.t,.04);jx({jfx:'ci_trail',x:x0,y:y0,x2:u.x,y2:u.y,t:.9,m:.9})}})}),
 // Marée de sang (prix du sang) : flaque intouchable qui glisse, puis jaillit
 ci_tide:SP('Marée de sang',ciD.tide,11,{hpc:.04,tele:{r:ciK.tide.r,max:ciK.tide.D},ai:ESC},(u,a,td)=>{const K=ciK.tide,d=clamp(td||K.D,90,K.D),T=.42;ciS('water',u);anim(u,'ci_melt',T+.1);
  u.phase=Math.max(u.phase||0,T+.04);u.stealth=Math.max(u.stealth||0,T);jx({jfx:'ci_pool',ui:ciI(u),x:u.x,y:u.y,t:T+.1,m:T+.1});
  dash(u,a,d,T,{end:()=>{ciS('water',u);ciS('heavy',u);anim(u,'ci_rise',.4);jx({jfx:'ci_splash',x:u.x,y:u.y,a:-1,t:.7,m:.7,n:16,big:1});
   for(const e of enemies(u))if(ciIn(u.x,u.y,e,K.r)&&hit(e,u,K.d,{slow:1,el:-1,fx:u.x,fy:u.y}))ciBleed(u,e,1);if(near(u.x,u.y))shake=Math.max(shake,.15)}})}),
 // Ketsuryûgan : Lune de sang : zone de genjutsu (logique : AUXF.ci_moon)
 ci_moon:ULT('Ketsuryûgan : Lune de sang',ciD.moon,{tele:{r:ciK.moon.r,max:460},ai:{max:440,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460),K=ciK.moon;ciS('genjutsu',u);ciS('roar',u);anim(u,'ci_moon',1.1);
  jx({jfx:'ci_eye',ui:ciI(u),x:u.x,y:u.y,t:1.2,m:1.2,big:1});aux.push({type:'ci_moon',x:p.x,y:p.y,r:K.r,t:K.t,m:K.t,team:u.team,owner:u,k:.5,danger:1});if(near(p.x,p.y))shake=Math.max(shake,.25)}),
 // Forêt de pieux (prix du sang) : 3 vagues de pieux en ligne, chacune touche une fois
 ci_stk:ULT('Forêt de pieux de sang',ciD.stk,{hpc:.10,line:{len:ciK.stk.L,w:150},ai:{max:420,p:.8}},(u,a)=>{const K=ciK.stk,done=new Set();ciS('bone',u);anim(u,'ci_price',1);
  for(let i=0;i<3;i++){const p=fwd(u,a,90+i*140);later(u,.28+i*.2,()=>{ciS('rock',u);if(i===2)ciS('boom',u);jx({jfx:'ci_stakes',x:p.x,y:p.y,a,t:1.1,m:1.1,s:i});
   for(const e of enemies(u)){if(done.has(e)||!ciIn(p.x,p.y,e,78))continue;done.add(e);if(hit(e,u,K.d,{root:K.root,unblockable:1,el:-1})){ciBleed(u,e,2);if(e.root>0)ciSay(e,'EMPALÉ','#ff4a5a',26)}}
   if(near(p.x,p.y))shake=Math.max(shake,i===2?.3:.16)},{x:p.x,y:p.y,r:78})}}),
 // style : Lame de sang (combo de 5 coups du moteur) ; 5e : grand arc qui ouvre 2 entailles
 ci_style:SP('Lame de sang','',.4,{hero:'dooku',melee:1,ai:{max:104,p:1}},(u,a)=>{const c=stC(u),T=[0,[98,1.5,10,.4],[98,1.5,10,.4],[102,2,10,.42],[124,.6,11,.44],[110,2.8,12,.62]][c];
  if(c===5)stLunge(u,a,30);
  const tr=[0,{d:-1,tl:.75,z:36,th:7,c:'#ff8a96',c2:'#a0101e',blade:1},{d:1,tl:-.75,z:36,th:7,c:'#ff8a96',c2:'#a0101e',blade:1},{d:-1,z:30,th:9,c:'#ff5a6a',c2:'#7a0612',blade:1},{jfx:'st_thrust',z:32,c:'#ff8a96'},{d:-1,z:28,th:11,c:'#ff4a5a',c2:'#5a0610',blade:1,rr:.85}][c];
  stMelee(u,a,T[0],T[1],T[2],{},tr,e=>{if(c===5){ciBleed(u,e,2);sparks(e.x,e.y,CIR[1],5,'ci_blood')}});
  if(c===5)jx({jfx:'ci_crescent',ui:ciI(u),x:u.x,y:u.y,a,R:T[0],t:.5,m:.5});stCd(u,T[3]);anim(u,'st_ken'+c,c===4?.3:.27)}),
});
Object.assign(NATHERO,{ci:'kylo'});

// ---- objets à logique
// Pas sanglant : entaille chaque ennemi frôlé pendant l'élan
AUXF.ci_stp=x=>{const u=x.owner;if(!u||u.dead){x.t=0;return}x.x=u.x;x.y=u.y;if(!u.dash)return;for(const e of enemies(u)){if(x.hs.has(e)||dist(u,e)>u.r+e.r+18)continue;x.hs.add(e);if(hit(e,u,ciK.step.d,{el:-1})){ciBleed(u,e,1);sparks(e.x,e.y,CIR[1],6,'ci_blood')}}};
AUXD.ci_stp=()=>{};
// Sang bouillant : suit la cible ; 3 brûlures (silence à la 1re), entailles consumées à la 3e ; rompu si le lanceur est étourdi ou meurt
AUXF.ci_boil=(x,dt)=>{const e=x.tg,u=x.owner;if(x.done)return;if(!e||e.dead||!u||u.dead||u.stun>0){x.done=1;x.t=Math.min(x.t,.15);if(e&&!e.dead&&u&&u.stun>0)ciSay(e,'REGARD ROMPU','#ffb0b8',30);return}
 x.x=e.x;x.y=e.y;if(x.k>0)return;x.k+=.5;x.n++;const K=ciK.boil,bl=e.ci_bl|0,last=x.n>=3;
 if(hit(e,u,K.d+K.ps*bl,{unblockable:1,el:-1,silence:x.n===1?K.sil:0,slow:.6}))jx({jfx:'ci_pop',ti:ciI(e),x:e.x,y:e.y,t:.45,m:.45,n:bl});ciS('fire',e);
 if(last){x.done=1;x.t=Math.min(x.t,.3);const m=ciTake(e);if(m)ciSay(e,m+' ENTAILLE'+(m>1?'S':'')+' CONSUMÉE'+(m>1?'S':''),'#ff8a5a',44)}};
// Lune de sang : ralentit, ajoute une entaille par seconde, double le sang bu ; à la fin, chaque entaille explose
AUXF.ci_moon=(x,dt)=>{const u=x.owner,K=ciK.moon;if(x.done)return;const tick=x.k<=0;if(tick)x.k+=1;
 for(const e of units){if(e.dead||e.team===x.team||!ciIn(x.x,x.y,e,x.r))continue;e.ci_mnT=SIMT+.6;if(e.unstop<=0)e.slow=Math.max(e.slow||0,.25);if(tick&&!(x.t<=0))ciBleed(u,e,1)}
 if(x.t>0)return;x.done=1;let n=0;ciS('boom',u);ciS('genjutsu',u);jx({jfx:'ci_moonend',x:x.x,y:x.y,r:x.r,t:.8,m:.8});
 for(const e of units){if(e.dead||e.team===x.team||!ciIn(x.x,x.y,e,x.r))continue;const m=ciTake(e);if(hit(e,u,K.b+K.det*m,{stun:K.st,unblockable:1,el:-1,fx:x.x,fy:x.y})){n++;jx({jfx:'ci_pop',ti:ciI(e),x:e.x,y:e.y,t:.6,m:.6,n:m,big:1});if(m)ciSay(e,m+' ENTAILLE'+(m>1?'S':'')+' ÉCLATENT','#ff4a5a',30)}}
 if(near(x.x,x.y))shake=Math.max(shake,n?.4:.2)};

// ---- trait de clan : Saignée
TRAITS[15]={nom:'Saignée',desc:'Tes jutsu de clan ouvrent des entailles qui saignent 4 s (5 max, chacune relance la durée). Le sang versé te soigne de la moitié ; à PV pleins, il te rend du chakra',
 init(u){u.ci_hp=0;u.ci_pd=0},
 // conduite des bots : Paralysie si un ennemi proche saigne, Sang bouillant et Lance sur une cible bien entaillée
 update(u,dt){if((u.ci_aiT=(u.ci_aiT||0)-dt)>0)return;u.ci_aiT=.25;let near1=0,best=0;
  for(const e of units){if(e.dead||e.team===u.team)continue;const d=dist(u,e),n=e.ci_bl|0;if(d<360&&n>0)near1=1;if(d<480&&n>best)best=n}
  const g=ciSlot(u,'ci_gaze'),b=ciSlot(u,'ci_boil'),s=ciSlot(u,'ci_spear');if(g>=0)u.ch.abil[g].ai=near1?ciAI.gzOn:ciAI.gzOff;if(b>=0)u.ch.abil[b].ai=best>=2?ciAI.bOn:ciAI.bOff;if(s>=0)u.ch.abil[s].ai=best>=1?ciAI.spOn:ciAI.spOff},
 hud(u,x,y){let n=0,m=0;for(const e of units)if(e.team!==u.team&&!e.dead&&e.ci_bl>0){n++;m+=e.ci_bl|0}const X=x+232,Y=y-8;g.save();ciDrop(X,Y+5,5,n?'#d01828':'#6a2a32');
  text(n?`Saignée : ${m} entaille${m>1?'s':''} (${n} ennemi${n>1?'s':''})`:'Saignée : aucune entaille',X+12,Y+4,12,n?'#ff7a86':'#d8a8b0','left');
  tfit(`Sang bu +${Math.round(u.ci_hp||0)} PV · prix payé ${Math.round(u.ci_pd||0)} PV`,X+12,Y+18,11,'#ffc8d0',240);g.restore()}};
AFTER.push(()=>{UK.push('ci_bl','ci_hp','ci_pd');
 VP.ci_blood=['#c0142a','#ff4a5a','#7a0612'];
 // Ketsuryûgan : œil rouge à pupille en goutte (3D et 2D), imposé par le clan (CLOOK) via le type d'œil 'ci_k'
 const E0=eyeSpecial;eyeSpecial=function(x,h,cx,cy,U,lw){if(!h.eye&&h.eyeT==='ci_k')return ciEyeTex(x,cx,cy,U,lw);return E0(x,h,cx,cy,U,lw)}});
CLOOK[15]=(look,l,S)=>{look.head.eye=null;look.head.eyeT='ci_k';if(S&&S[0]==='Lame de sang')look.weapon.col='#d01828'};
function ciEyeTex(x,cx,cy,U,lw){x.strokeStyle='#1a1410';x.lineWidth=1.3*lw;x.fillStyle='#fff4f4';x.beginPath();x.ellipse(cx,cy,2.5*U,3*U,0,0,7);x.fill();x.stroke();
 x.fillStyle='#c4101e';x.beginPath();x.ellipse(cx,cy+.35*U,1.95*U,2.45*U,0,0,7);x.fill();x.strokeStyle='#4a0008';x.lineWidth=.6*lw;x.beginPath();x.ellipse(cx,cy+.35*U,1.2*U,1.5*U,0,0,7);x.stroke();
 x.fillStyle='#14000a';x.beginPath();x.moveTo(cx,cy-.75*U);x.quadraticCurveTo(cx+.6*U,cy+.35*U,cx+.45*U,cy+.75*U);x.arc(cx,cy+.75*U,.45*U,0,Math.PI);x.quadraticCurveTo(cx-.6*U,cy+.35*U,cx,cy-.75*U);x.fill();
 x.fillStyle='#ffe0e4';x.beginPath();x.arc(cx-.75*U,cy-.55*U,.38*U,0,7);x.fill();return true}

// ---- dessins
// œil Ketsuryûgan en amande (op = ouverture)
function ciEyeDraw(x,y,R,op,al){const lid=()=>{g.beginPath();g.moveTo(x-R,y);g.quadraticCurveTo(x,y-R*op*1.3,x+R,y);g.quadraticCurveTo(x,y+R*op*1.3,x-R,y);g.closePath()};g.save();g.globalAlpha*=al;
 lid();g.fillStyle='#f6e4e4';g.fill();g.clip();circ(x,y,R*.55,'#c4101e');g.strokeStyle='#3a0006';g.lineWidth=R*.07;g.beginPath();g.arc(x,y,R*.34,0,7);g.stroke();
 g.fillStyle='#14000a';g.beginPath();g.moveTo(x,y-R*.3);g.quadraticCurveTo(x+R*.17,y+R*.02,x+R*.13,y+R*.12);g.arc(x,y+R*.12,R*.13,0,Math.PI);g.quadraticCurveTo(x-R*.17,y+R*.02,x,y-R*.3);g.fill();g.restore();
 g.save();g.globalAlpha*=al;lid();g.strokeStyle='#2a0006';g.lineWidth=Math.max(1.5,R*.09);g.stroke();g.restore()}
// projectiles : aiguille et lance de sang cristallisé
PROJD.ci_ndl=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,40,60,.28)';g.beginPath();g.ellipse(-8,0,14,3.4,0,0,7);g.fill();g.globalCompositeOperation='source-over';
 g.fillStyle='#8a0a18';g.strokeStyle='#ff8a94';g.lineWidth=.8;g.beginPath();g.moveTo(13,0);g.lineTo(-8,-1.8);g.lineTo(-13,0);g.lineTo(-8,1.8);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd0d6';g.fillRect(-4,-.5,12,1)};
PROJD.ci_spear=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(-50,0,10,0);gr.addColorStop(0,'rgba(200,20,40,0)');gr.addColorStop(1,'rgba(255,60,80,.45)');g.fillStyle=gr;g.fillRect(-50,-5,60,10);g.globalCompositeOperation='source-over';
 for(let i=1;i<5;i++){g.fillStyle=rgba('#c0142a',.6-i*.12);g.beginPath();g.arc(-22-i*9,Math.sin(t/45+i*2)*3,1.8,0,7);g.fill()}
 g.fillStyle='#7a0612';g.strokeStyle='#ff9aa4';g.lineWidth=1;g.beginPath();g.moveTo(26,0);g.lineTo(8,-5.5);g.lineTo(4,-2.2);g.lineTo(-26,-2.2);g.lineTo(-30,0);g.lineTo(-26,2.2);g.lineTo(4,2.2);g.lineTo(8,5.5);g.closePath();g.fill();g.stroke();
 g.fillStyle='#d8243a';g.beginPath();g.moveTo(24,0);g.lineTo(9,-3.6);g.lineTo(9,0);g.closePath();g.fill();g.strokeStyle='rgba(255,220,226,.85)';g.lineWidth=1;g.beginPath();g.moveTo(20,-.4);g.lineTo(-22,-.8);g.stroke()};
// le sang se cristallise dans la main avant le tir
JFXD.ci_forge=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,a=f.a,q=P(o.x+Math.cos(a)*16,o.y+Math.sin(a)*16,40),s=q.s;g.globalCompositeOperation='lighter';
 const R=(f.big?20:13)*s*(1-e*.4),gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R);gr.addColorStop(0,rgba('#ffd0d6',.9*k));gr.addColorStop(.4,rgba('#ff3a4a',.6*k));gr.addColorStop(1,'rgba(160,10,30,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();
 g.globalCompositeOperation='source-over';for(let i=0;i<6;i++){const b=i*1.047+t*6,r=(18-e*14)*s;ciDrop(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*.6,1.6*s,rgba('#c0142a',k))}};
// fouet de sang : la lanière se déroule vers l'avant en ondulant, claque au bout puis revient
JFXD.ci_whip=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,a=f.a,c=Math.cos(a),s=Math.sin(a),ext=e<.35?ezo(e/.35):e<.55?1:1-ezio((e-.55)/.45),L=f.L*ext;if(L<6)return;
 const N=16,pts=[];for(let i=0;i<=N;i++){const q=i/N,d=12+L*q,lat=Math.sin(q*6.3-e*16)*16*(1-q*.4)*(1-ext*.55),z=40-q*26+Math.sin(q*Math.PI)*16;pts.push(P(o.x+c*d-s*lat,o.y+s*d+c*lat,z))}
 g.lineCap='round';for(let i=0;i<N;i++){const q=i/N;g.strokeStyle='#4a0610';g.lineWidth=(7.5-5*q)*pts[i].s;g.beginPath();g.moveTo(pts[i].x,pts[i].y);g.lineTo(pts[i+1].x,pts[i+1].y);g.stroke()}
 for(let i=0;i<N;i++){const q=i/N;g.strokeStyle=i%3?'#d01828':'#ff6a78';g.lineWidth=(4-2.6*q)*pts[i].s;g.beginPath();g.moveTo(pts[i].x,pts[i].y);g.lineTo(pts[i+1].x,pts[i+1].y);g.stroke()}
 const tp=pts[N];if(e>.25&&e<.6){g.globalCompositeOperation='lighter';const al=1-Math.abs(e-.4)/.2;g.strokeStyle=rgba('#ffb0b8',.8*al);g.lineWidth=2;g.beginPath();g.arc(tp.x,tp.y,(8+30*(e-.25))*tp.s,0,7);g.stroke();g.globalCompositeOperation='source-over'}
 for(let i=0;i<5;i++){const m=(e*2+i*.2)%1,b=a+(i-2)*.5,d=f.L*ext*(.4+i*.12),p0=P(o.x+c*d+Math.cos(b)*m*30,o.y+s*d+Math.sin(b)*m*30,30*(1-m));ciDrop(p0.x,p0.y,1.6*p0.s,rgba('#c0142a',k*(1-m)))}};
// gerbe de sang (impact, jaillissement) : gouttes en fontaine
JFXD.ci_splash=(f,k,e,t)=>{const n=f.n||8,H=f.big?70:42,R=f.big?95:44;const q0=P(f.x,f.y,0);g.fillStyle=rgba('#6a0610',.45*k);g.beginPath();g.ellipse(q0.x,q0.y,R*.55*q0.s*Math.min(1,e*3),R*.55*q0.s*K*Math.min(1,e*3),0,0,7);g.fill();
 for(let i=0;i<n;i++){const b=(f.a>=0?f.a+(i/n-.5)*2.2:i/n*6.283)+Math.sin(i*7.1)*.3,d=R*e*(.55+.45*((i*37)%10)/10),z=H*Math.sin(Math.PI*Math.min(1,e*1.15))*(.6+.4*((i*13)%7)/7),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,z);
  ciDrop(p.x,p.y,(f.big?2.8:2)*p.s,rgba(i%3?'#c0142a':'#ff4a5a',Math.min(1,k*1.6)))}
 if(f.big&&e<.5){const q=P(f.x,f.y,0);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff4a5a',.8*(1-e*2));g.lineWidth=3*q.s;g.beginPath();g.ellipse(q.x,q.y,R*(.4+e)*q.s,R*(.4+e)*q.s*K,0,0,7);g.stroke();g.globalCompositeOperation='source-over'}};
// lance qui éclate dans la cible : éclats de sang cristallisé
JFXD.ci_shatter=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,36),s=q.s;g.globalCompositeOperation='lighter';if(e<.3){const R=(20+60*e)*s;const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R);gr.addColorStop(0,'rgba(255,230,234,.9)');gr.addColorStop(.5,'rgba(255,40,60,.5)');gr.addColorStop(1,'rgba(150,0,20,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill()}
 g.globalCompositeOperation='source-over';for(let i=0;i<9;i++){const b=f.a+(i-4)*.33+Math.sin(i*3.3)*.2,d=(10+70*ezo(e))*s,x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*.7-20*Math.sin(Math.PI*e)*s;g.save();g.translate(x,y);g.rotate(b+e*6);g.fillStyle=rgba(i%2?'#d01828':'#8a0a18',k);g.strokeStyle=rgba('#ffb0b8',k);g.lineWidth=.8;g.beginPath();g.moveTo(6*s,0);g.lineTo(0,-2.4*s);g.lineTo(-5*s,0);g.lineTo(0,2.4*s);g.closePath();g.fill();g.stroke();g.restore()}};
// regard : bande rouge sang + œil au-dessus du lanceur
JFXD.ci_gaze=(f,k,e,t,u)=>{const o=u||f,a=f.a,L=f.L*ezo(Math.min(1,e*3)),w=f.w/2,c=Math.cos(a),s=Math.sin(a),pt=(d,l,z)=>P(o.x+c*d-s*l,o.y+s*d+c*l,z||2);
 poly([pt(0,-w*.4),pt(L,-w),pt(L,w),pt(0,w*.4)],rgba('#a0101e',.2*k));g.globalCompositeOperation='lighter';g.lineWidth=2;g.strokeStyle=rgba('#ff3a4a',.7*k);for(const l of[-1,1]){const p0=pt(0,l*w*.4),p1=pt(L,l*w);g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.stroke()}
 for(let i=0;i<9;i++){const m=(e*2.2+i/9)%1,l=((i*37)%11-5)/5*w*m,p0=pt(L*m,l,4);g.fillStyle=rgba('#ff4a5a',.8*k*(1-m));g.beginPath();g.ellipse(p0.x,p0.y,6*p0.s,2.2*p0.s,0,0,7);g.fill()}g.globalCompositeOperation='source-over';
 const h=P(o.x,o.y,96);ciEyeDraw(h.x,h.y,15*h.s,Math.min(1,e*5,k*3),1)};
// grand œil Ketsuryûgan qui s'ouvre au-dessus du lanceur
JFXD.ci_eye=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,h=P(o.x,o.y,f.big?118:100),R=(f.big?24:16)*h.s;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(h.x,h.y,0,h.x,h.y,R*2.2);gr.addColorStop(0,rgba('#ff2a3a',.45*k));gr.addColorStop(1,'rgba(120,0,20,0)');g.fillStyle=gr;g.beginPath();g.arc(h.x,h.y,R*2.2,0,7);g.fill();g.globalCompositeOperation='source-over';
 ciEyeDraw(h.x,h.y,R,Math.min(1,e*4,k*3),1);for(let i=0;i<4;i++){const m=(e*1.8+i/4)%1;ciDrop(h.x+(i-1.5)*R*.4,h.y+R*.5+m*28*h.s,1.6*h.s,rgba('#c0142a',k*(1-m)))}};
// ligne du regard vers la cible verrouillée
JFXD.ci_gline=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const a=P(u.x,u.y,96),b=P(tg.x,tg.y,50);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff3a4a',.8*k);g.lineWidth=3*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=rgba('#ffd0d6',.9*k);g.lineWidth=1;g.stroke();g.globalCompositeOperation='source-over'};
// cible paralysée : veines de sang qui montent le long du corps, sceau de l'œil au-dessus
JFXD.ci_para=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,al=Math.min(1,k*4,e*8);g.save();g.globalAlpha=al;g.strokeStyle='#d01828';g.lineWidth=2*s;g.beginPath();g.ellipse(q.x,q.y,26*s,26*s*K,0,0,7);g.stroke();
 g.lineCap='round';for(let i=0;i<6;i++){const b=i*1.047+.3,x0=q.x+Math.cos(b)*24*s,y0=q.y+Math.sin(b)*24*s*K,L=Math.min(1,e*5);g.strokeStyle=i%2?'#8a0a18':'#c0142a';g.lineWidth=2.2*s;g.beginPath();g.moveTo(x0,y0);
  for(let j=1;j<=5;j++){const m=j/5*L;g.lineTo(lerp(x0,q.x+Math.cos(b)*6*s,m)+Math.sin(j*2.3+i)*4*s,lerp(y0,q.y-60*s,m))}g.stroke()}
 g.restore();const h=P(tg.x,tg.y,112);ciEyeDraw(h.x,h.y,11*h.s,Math.min(1,e*6),al*.9)};
// sang bouillant : la cible rougeoie, bulles et vapeur
AUXD.ci_boil=(x,k,t)=>{const e=x.ti!=null?units[x.ti]:null,o=e&&!e.dead?e:x,q=P(o.x,o.y,0),s=q.s,pr=1-Math.max(0,x.t/x.m);g.save();g.globalCompositeOperation='lighter';
 const gr=g.createRadialGradient(q.x,q.y-36*s,0,q.x,q.y-36*s,46*s);gr.addColorStop(0,rgba('#ff3a2a',(.25+.35*pr)*k));gr.addColorStop(1,'rgba(160,10,20,0)');g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-36*s,40*s,52*s,0,0,7);g.fill();
 for(let i=0;i<10;i++){const m=(t*1.4+i*.1)%1,x0=q.x+Math.sin(i*2.7+t)*16*s,y0=q.y-(14+m*70)*s,r=(1.5+2.5*m)*s;g.strokeStyle=rgba(i%3?'#ff6a5a':'#ffd0c0',.8*(1-m)*k);g.lineWidth=1.2;g.beginPath();g.arc(x0,y0,r,0,7);g.stroke()}
 g.globalCompositeOperation='source-over';for(let i=0;i<5;i++){const m=(t*.8+i*.2)%1;g.fillStyle=rgba('#e8d0d0',.22*(1-m)*k);g.beginPath();g.arc(q.x+Math.sin(i*1.9+t*2)*12*s,q.y-(70+m*40)*s,(6+m*10)*s,0,7);g.fill()}g.restore()};
// brûlure du sang (chaque tic du Sang bouillant, explosion de la Lune)
JFXD.ci_pop=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,38),s=q.s,n=f.n||0,R=(16+5*n+(f.big?20:0))*s*(.4+e);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff4a3a',.85*k);g.lineWidth=(3+n*.4)*s;g.beginPath();g.arc(q.x,q.y,R,0,7);g.stroke();
 const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R);gr.addColorStop(0,rgba('#ffd0c0',.6*k));gr.addColorStop(1,'rgba(200,20,30,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();g.globalCompositeOperation='source-over';
 for(let i=0;i<6+n*2;i++){const b=i*2.4,d=R*(.6+.6*e),p=P(o.x+Math.cos(b)*d/s,o.y+Math.sin(b)*d/s*.6,38+20*Math.sin(Math.PI*e));ciDrop(p.x,p.y,1.8*p.s,rgba('#c0142a',k))}};
// Mirage : double de sang à l'endroit quitté (le ninja lui-même, teinté), qui fond à la fin
JFXD.ci_double=(f,k,e,t,u)=>{if(!u)return;const q=P(f.x,f.y,0),s=q.s,melt=k<.25?k/.25:1;g.save();g.globalAlpha=.75*melt;drawChar3(u,q.x,q.y+(1-melt)*10*s,s*1.3*(0.7+.3*melt));g.restore();
 g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(q.x,q.y-40*s,0,q.x,q.y-40*s,50*s);gr.addColorStop(0,rgba('#ff2a3a',.35*melt));gr.addColorStop(1,'rgba(160,0,20,0)');g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-40*s,34*s,56*s,0,0,7);g.fill();g.restore();
 for(let i=0;i<4;i++){const m=(t*1.2+i*.25)%1;ciDrop(q.x+(i-1.5)*8*s,q.y-(60-m*58)*s,1.8*s,rgba('#c0142a',.9*(1-m)))}g.fillStyle=rgba('#6a0610',.5*(1-melt*.6));g.beginPath();g.ellipse(q.x,q.y,(14+(1-melt)*16)*s,(14+(1-melt)*16)*s*K,0,0,7);g.fill()};
// cible terrifiée : deux yeux rouges la toisent
JFXD.ci_haunt=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const h=P(tg.x,tg.y,128),s=h.s,al=Math.min(1,k*3,e*6);for(const d of[-1,1])ciEyeDraw(h.x+d*12*s,h.y+Math.sin(t*9)*2*s,7*s,.75,al)};
// Pas sanglant : traînée de sang au sol
JFXD.ci_trail=(f,k,e,t)=>{const a=P(f.x,f.y,0),b=P(f.x2,f.y2,0),s=b.s,L=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=-(b.y-a.y)/L,ny=(b.x-a.x)/L;g.fillStyle=rgba('#7a0612',.55*k);g.beginPath();g.moveTo(a.x+nx*2*s,a.y+ny*2*s);g.lineTo(b.x+nx*9*s,b.y+ny*9*s*K);g.lineTo(b.x-nx*9*s,b.y-ny*9*s*K);g.lineTo(a.x-nx*2*s,a.y-ny*2*s);g.closePath();g.fill();
 for(let i=0;i<9;i++){const m=i/8,x=lerp(a.x,b.x,m)+nx*Math.sin(i*4.1)*10*s,y=lerp(a.y,b.y,m)+ny*Math.sin(i*4.1)*10*s*K;g.fillStyle=rgba(i%2?'#a0101e':'#c0142a',.7*k);g.beginPath();g.ellipse(x,y,3*s,1.8*s,0,0,7);g.fill()}
 if(e<.3){g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff4a5a',.8*(1-e/.3));g.lineWidth=3*s;g.beginPath();g.moveTo(a.x,a.y-30*s);g.lineTo(b.x,b.y-30*s);g.stroke();g.globalCompositeOperation='source-over'}};
// Marée de sang : flaque qui glisse sous le ninja
JFXD.ci_pool=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,q=P(o.x,o.y,0),s=q.s,R=(30+10*Math.sin(t*12))*s*Math.min(1,e*5);g.fillStyle=rgba('#7a0612',.8*Math.min(1,k*4));g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#ff4a5a',.7*k);g.lineWidth=2*s;for(let j=0;j<2;j++){const m=(t*2+j*.5)%1;g.beginPath();g.ellipse(q.x,q.y,R*(.3+.7*m),R*(.3+.7*m)*K,0,0,7);g.stroke()}
 g.fillStyle=rgba('#c0142a',.9*k);g.beginPath();g.ellipse(q.x+Math.cos(o.aim||0)*R*.6,q.y-6*s,R*.5,10*s,0,Math.PI,0);g.fill()};
// prix du sang : jet de sang du bras du lanceur
JFXD.ci_price=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,q=P(o.x,o.y,50),s=q.s;for(let i=0;i<7;i++){const b=-1.2-i*.16,d=(6+46*e)*s,x=q.x+Math.cos(b+(i%2?.6:0))*d*(i%2?-1:1),y=q.y+Math.sin(b)*d*.8+60*e*e*s;ciDrop(x,y,(1.6+(i%3)*.4)*s,rgba(i%2?'#ff4a5a':'#c0142a',k))}
 g.strokeStyle=rgba('#ff3a4a',.9*Math.min(1,k*2));g.lineWidth=2*s;g.beginPath();g.moveTo(q.x-10*s,q.y-4*s);g.lineTo(q.x+8*s,q.y+4*s);g.stroke()};
// le sang bu : filet de gouttes de la cible vers le Chinoike
JFXD.ci_drink=(f,k,e,t,u,tg)=>{if(!u||u.dead||!tg)return;const a=P(tg.x,tg.y,40),b=P(u.x,u.y,46),mx=(a.x+b.x)/2,my=Math.min(a.y,b.y)-50*a.s;
 for(let i=0;i<8;i++){const m=Math.min(1,Math.max(0,e*1.6-i*.08));if(m<=0||m>=1)continue;const x=(1-m)*(1-m)*a.x+2*(1-m)*m*mx+m*m*b.x,y=(1-m)*(1-m)*a.y+2*(1-m)*m*my+m*m*b.y;ciDrop(x,y,2*a.s,rgba(i%2?'#ff4a5a':'#c0142a',.9))}
 if(e>.55){g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff6a7a',.8*k);g.lineWidth=2*b.s;g.beginPath();g.ellipse(b.x,b.y+40*b.s,(14+20*(e-.55))*b.s,(14+20*(e-.55))*b.s*K,0,0,7);g.stroke();g.globalCompositeOperation='source-over'}};
// pieux de sang cristallisé qui jaillissent (une vague)
const ciSPK=[[0,0,62],[-34,-20,44],[30,-26,48],[-26,26,40],[36,22,46],[-56,4,32],[58,-2,34],[4,-48,36],[2,46,34]];
JFXD.ci_stakes=(f,k,e,t)=>{const a=f.a+(f.s||0)*.7,c=Math.cos(a),s0=Math.sin(a),up=ezo(Math.min(1,e/.12)),dn=k<.25?k/.25:1,q0=P(f.x,f.y,0);g.fillStyle=rgba('#5a0610',.5*dn);g.beginPath();g.ellipse(q0.x,q0.y,78*q0.s,78*q0.s*K,0,0,7);g.fill();
 if(e<.25){g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff4a5a',1-e*4);g.lineWidth=4*q0.s;g.beginPath();g.ellipse(q0.x,q0.y,(40+120*e)*q0.s,(40+120*e)*q0.s*K,0,0,7);g.stroke();g.globalCompositeOperation='source-over'}
 for(const [dx,dy,h] of ciSPK){const x=f.x+dx*c-dy*s0,y=f.y+dx*s0+dy*c,b=P(x,y,0),tp=P(x+dx*.12,y+dy*.12,h*up*dn),w=(5+h*.09)*b.s;
  g.fillStyle='#7a0612';g.beginPath();g.moveTo(b.x-w,b.y);g.lineTo(tp.x,tp.y);g.lineTo(b.x+w,b.y);g.closePath();g.fill();g.fillStyle='#d01828';g.beginPath();g.moveTo(b.x-w*.2,b.y);g.lineTo(tp.x,tp.y);g.lineTo(b.x+w,b.y);g.closePath();g.fill();
  g.strokeStyle='rgba(255,200,208,.8)';g.lineWidth=1;g.beginPath();g.moveTo(b.x+w*.3,b.y-2*b.s);g.lineTo(tp.x,tp.y);g.stroke()}};
// Lune de sang : dôme de genjutsu, lune-œil géante au-dessus, pluie de sang
AUXD.ci_moon=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,R=x.r,fr=Math.max(0,x.t/x.m);g.fillStyle=rgba('#7a0612',.2*k);gEll(x.x,x.y,R);g.fill();g.strokeStyle=rgba('#ff3a4a',.75*k);g.lineWidth=2.5;gEll(x.x,x.y,R);g.stroke();
 g.strokeStyle='#ff4a5a';g.lineWidth=4;g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,-Math.PI/2,-Math.PI/2+fr*Math.PI*2);g.stroke();
 g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(0,q.y-190*s,0,q.y);gr.addColorStop(0,'rgba(200,20,40,0)');gr.addColorStop(1,rgba('#c0142a',.22*k));g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-95*s,R*s,95*s+R*s*K*.5,0,Math.PI,0);g.lineTo(q.x+R*s,q.y);g.ellipse(q.x,q.y,R*s,R*s*K,0,0,Math.PI);g.fill();
 g.strokeStyle=rgba('#ff6a7a',.55*k);g.lineWidth=1.3;for(let i=0;i<18;i++){const m=(t*1.6+i*.137)%1,b=i*2.4,d=R*(.15+.8*((i*29)%17)/17),p0=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.9,170*(1-m));g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(p0.x-2*s,p0.y+12*s);g.stroke()}
 g.globalCompositeOperation='source-over';const h=P(x.x,x.y,215),MR=34*h.s;{const g2=g.createRadialGradient(h.x,h.y,MR*.5,h.x,h.y,MR*2);g2.addColorStop(0,rgba('#ff2a3a',.4*k));g2.addColorStop(1,'rgba(120,0,20,0)');g.fillStyle=g2;g.beginPath();g.arc(h.x,h.y,MR*2,0,7);g.fill()}
 circ(h.x,h.y,MR,rgba('#a0101e',.95*k));g.fillStyle=rgba('#7a0612',.8*k);for(const [cx,cy,r] of[[-.4,-.3,.18],[.35,.25,.14],[.1,-.5,.1],[-.2,.45,.12]]){g.beginPath();g.arc(h.x+cx*MR,h.y+cy*MR,r*MR,0,7);g.fill()}
 ciEyeDraw(h.x,h.y,MR*.8,Math.min(1,(x.m-x.t)*2.5,x.t*3),k*.95)};
// fin de la Lune : onde rouge et éclats
JFXD.ci_moonend=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r*(.5+e*.7);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff4a5a',k);g.lineWidth=6*s*k;g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,0,7);g.stroke();g.strokeStyle=rgba('#ffd0d6',.7*k);g.lineWidth=2*s;g.stroke();
 g.globalCompositeOperation='source-over';for(let i=0;i<14;i++){const b=i*.449,d=f.r*e,p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,60*Math.sin(Math.PI*Math.min(1,e*1.2)));ciDrop(p.x,p.y,2.4*p.s,rgba(i%2?'#ff4a5a':'#c0142a',k))}};
// Lame de sang, 5e coup : croissant rouge au sol et gouttes projetées
JFXD.ci_crescent=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,R=f.R,a=f.a;g.globalCompositeOperation='lighter';const A=[],Bp=[];for(let i=0;i<=16;i++){const b=a-1.3+2.6*i/16,p1=P(o.x+Math.cos(b)*R,o.y+Math.sin(b)*R,2),p2=P(o.x+Math.cos(b)*R*.78,o.y+Math.sin(b)*R*.78,2);A.push(p1);Bp.push(p2)}
 g.fillStyle=rgba('#ff3a4a',.4*k);g.beginPath();A.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=16;i>=0;i--)g.lineTo(Bp[i].x,Bp[i].y);g.closePath();g.fill();g.globalCompositeOperation='source-over';
 for(let i=0;i<8;i++){const b=a-1.1+i*.31,d=R*(.8+.5*e),p=P(o.x+Math.cos(b)*d,o.y+Math.sin(b)*d,30*Math.sin(Math.PI*e)+6);ciDrop(p.x,p.y,1.8*p.s,rgba('#c0142a',k))}};

// ---- animations 3D
Object.assign(ANIM,{
 // petit coup de poignet : les aiguilles partent des doigts
 ci_flick:(P,e)=>{const k=e<.35?ezo(e/.35):1-ezio((e-.35)/.65)*.8;pz(P,'armR',lerp(-.6,-1.5,k),0,lerp(.5,-.15,k));pz(P,'foreR',lerp(-1.8,-.1,k));pz(P,'handR',-.4*k);pz(P,'armL',-.4,0,.35);pz(P,'foreL',-1);pz(P,'chest',.1*k,-.35*k)},
 // fouet : bras armé haut et en arrière, puis claque en travers du corps
 ci_lash:(P,e,u)=>{const w=e<.28?ezo(e/.28):1,f=e<.28?0:ezo(Math.min(1,(e-.28)/.22)),b=e>.75?ezio((e-.75)/.25):0;pz(P,'armR',lerp(lerp(-.4,-2.7,w),-1.2,f)*(1-b*.6),0,lerp(lerp(0,-.6,w),.55,f)*(1-b));pz(P,'foreR',lerp(-.9*w,-.1,f));pz(P,'handR',.5*f);
  pz(P,'chest',lerp(-.05,.3,f),lerp(.55*w,-.55,f)*(1-b));pz(P,'armL',-.5,0,.5);pz(P,'foreL',-1.1);P.root.z=7*f*(1-b);stLegs(P,u,f)},
 // lancer de la lance : bras replié derrière la tête, puis jeté vers l'avant
 ci_throw:(P,e,u)=>{const w=e<.35?ezo(e/.35):1,f=e<.35?0:ezo(Math.min(1,(e-.35)/.2)),b=e>.75?ezio((e-.75)/.25):0;pz(P,'armR',lerp(lerp(-.5,-2.9,w),-1.45,f)*(1-b*.7),0,lerp(-.25*w,.1,f));pz(P,'foreR',lerp(-1.5*w,-.1,f)*(1-b));
  pz(P,'armL',lerp(-.3,-1.3,w)*(1-f*.6),0,.3);pz(P,'foreL',-.4);pz(P,'chest',lerp(-.15*w,.4,f)*(1-b),lerp(.4*w,-.3,f)*(1-b));P.root.z=10*f*(1-b);stLegs(P,u,f,1.2)},
 // regard : deux doigts sous l'œil, l'autre main désigne la cible
 ci_gaze:(P,e)=>{const k=ezo(Math.min(1,e/.25))*(e>.8?1-ezio((e-.8)/.2):1);pz(P,'armL',-2.2*k,0,-.55*k);pz(P,'foreL',-2.4*k);pz(P,'handL',.3*k);pz(P,'armR',-1.45*k,0,.1);pz(P,'foreR',-.1);pz(P,'head',.12*k,-.08*k);pz(P,'chest',.14*k)},
 // élan sanglant : penché très bas, bras en arrière
 ci_dash:(P,e)=>{const k=bump(Math.min(1,e*1.1));pz(P,'chest',.75*k);pz(P,'armL',.9*k,0,.3);pz(P,'armR',.9*k,0,-.3);pz(P,'thighL',-.9*k);pz(P,'shinL',.6*k);pz(P,'thighR',.5*k);pz(P,'shinR',.9*k);P.root.y=-4*k;pz(P,'head',-.3*k)},
 // fondre en flaque : s'effondre sur place
 ci_melt:(P,e)=>{const k=ezo(Math.min(1,e*2));P.root.y=-14*k;pz(P,'thighL',-1.3*k);pz(P,'shinL',2*k);pz(P,'thighR',-1.3*k);pz(P,'shinR',2*k);pz(P,'chest',.6*k);pz(P,'armL',-.3*k,0,.8*k);pz(P,'armR',-.3*k,0,-.8*k);pz(P,'head',-.3*k)},
 // jaillir de la flaque : se redresse bras ouverts
 ci_rise:(P,e)=>{const k=1-ezo(Math.min(1,e*1.6)),o=bump(Math.min(1,e*1.3));P.root.y=-10*k+3*o;pz(P,'thighL',-.9*k);pz(P,'shinL',1.4*k);pz(P,'thighR',-.9*k);pz(P,'shinR',1.4*k);pz(P,'armL',-2*o,0,.9*o);pz(P,'armR',-2*o,0,-.9*o);pz(P,'chest',-.2*o)},
 // prix du sang : s'entaille l'avant-bras, puis frappe le sol des deux paumes
 ci_price:(P,e,u)=>{if(e<.42){const k=ezo(Math.min(1,e/.18)),c=e<.18?0:ezio(Math.min(1,(e-.18)/.2));pz(P,'armL',-1.35*k,0,-.15);pz(P,'foreL',-.3);pz(P,'handL',-.6*k);pz(P,'armR',-1.15*k,0,lerp(-.55,.55,c));pz(P,'foreR',-1.3*k);pz(P,'chest',.15*k);pz(P,'head',.25*k);return}
  const k=ezo(Math.min(1,(e-.42)/.15))*(e>.85?1-ezio((e-.85)/.15):1);P.root.y=-9*k;pz(P,'chest',.75*k);pz(P,'head',-.2*k);pz(P,'armL',-1.15*k,0,-.2*k);pz(P,'armR',-1.15*k,0,.2*k);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'handL',-1*k);pz(P,'handR',-1*k);pz(P,'thighL',-1.2*k);pz(P,'shinL',1.6*k);pz(P,'thighR',-.3*k);pz(P,'shinR',1.5*k)},
 // Lune de sang : bras levés en V, tête renversée, s'élève un peu
 ci_moon:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.3))*(e>.85?1-ezio((e-.85)/.15):1);pz(P,'armL',-2.7*k,0,.75*k);pz(P,'armR',-2.7*k,0,-.75*k);pz(P,'foreL',-.25*k);pz(P,'foreR',-.25*k);pz(P,'head',-.4*k);pz(P,'chest',-.22*k);P.root.y=4*k+Math.sin((t||0)*6)*1.2*k},
});
