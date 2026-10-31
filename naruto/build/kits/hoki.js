// ===== Clan Hoki (c11, préfixe hk_) : plantes vivantes =====
// Identité : le Hoki fait pousser un jardin vivant là où il combat (pas de Mokuton) : lianes, fleurs carnivores, ronces, spores et sève (façon Zetsu).
// Trait « Jardin vivant » : des pousses germent à ses pieds (une toutes les 4 s en combat) et là où tombent ses graines (6 max) ;
// mûres, elles soufflent du pollen sur les ennemis proches (doses cumulables, 5 = éternuement qui étourdit) et soignent ses alliés.
// Contre-jeu : le feu brûle les pousses, un ennemi écrase celles qui germent encore, le vent disperse les spores.
// Les jutsu jouent avec le jardin : la Fusion végétale ressurgit d'une pousse, la Floraison mortelle fait éclore toutes les pousses.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c11',[
 [1,'D','x.hk_seed','Graine épineuse','Graine rapide : 14 dégâts et +1 dose de pollen ; une pousse germe là où elle tombe','leaf'],
 [1,'C','x.hk_vine','Liane étrangleuse','Une liane file au sol : la 1re cible touchée subit 18 dégâts, est entravée 1 s et prend une dose de pollen','leaf'],
 [4,'C','x.hk_hedge','Mur de ronces','Haie de ronces 3,5 s en travers de ta visée : arrête les ennemis et leurs tirs ; la toucher pique (6 dégâts) et ralentit','leaf'],
 [3,'B','x.hk_trap','Fleur carnivore','Une fleur géante éclôt au point visé puis mord 5 s l\'ennemi le plus proche (portée 130) : 10 dégâts, ralentit et attire','leaf'],
 [3,'B','x.hk_spore','Nuage de spores','Pollen toxique 4 s (rayon 105) : ralentit, ronge 3 PV/s et ajoute une dose toutes les 0,75 s. Le vent le disperse','flower'],
 [4,'A','x.hk_sap','Cocon de sève','Toi ou l\'allié le plus proche du curseur : la sève rend 30 PV en 3 s, réduit les dégâts subis de 25 % et libère des entraves ; à la fin, la sève éclabousse et ralentit les ennemis proches','leaf'],
 [2,'C','x.hk_swing','Liane-grappin','Une liane s\'accroche au point visé (380 max) et t\'y hisse ; à l\'arrivée, elle fouette autour de toi (10 dégâts, ralentit) et une pousse germe','leaf'],
 [2,'B','x.hk_merge','Fusion végétale','Tu fonds dans le sol (intangible 0,55 s) et ressurgis au point visé (300 max) ou dans ta pousse la plus proche du curseur (650 max) : elle te rend 10 PV','leaf'],
 [5,'S','x.hk_bloom','Floraison mortelle','Après 0,8 s, des épines géantes jaillissent (rayon 160) : 38 dégâts, entrave 1 s. Toutes tes pousses éclosent : 16 dégâts et +2 doses autour (2 max par cible)','leaf'],
 [5,'A','x.hk_tree','Arbre millénaire','Un arbre géant pousse 6 s au point visé : ses branches fouettent l\'ennemi le plus proche (11 dégâts/s, portée 210), son ombre soigne tes alliés (4 PV/s) et il pleut du pollen','leaf'],
]);
// style de combat propre : griffes de ronces (corps à corps, attaque de base)
STYLES.push(['Griffes de ronces','Griffes de lianes épineuses ; 3e coup : la liane fouette droit devant (allonge 118) ; tous les 3 coups qui touchent, du pollen sur la cible (+1 dose) ; 5e : les épines éclatent (+1 dose)','x.hk_style','leaf','vine',[11],1.12,1.07]);
// apparence du clan : yeux vert sève, fleur dans les cheveux (si aucun accessoire choisi)
CLOOK[11]=(look)=>{look.head.eye=look.head.eye||'#7ad04a';if(!look.head.acc)look.head.acc='fleur'};

// ---- palette (contour sombre, verts, écorce, épines, pétales, pollen, sève)
const HKO='#14200c',HKD='#2f5a1e',HKG='#4f9a32',HKL='#9ad860',HKB='#6a4426',HKBL='#9a6a3e',HKT='#f2ead0',HKP='#e0508a',HKP2='#ffa8cc',HKY='#ffd84a',HKS='#e8a030';
const HK_MAX=6,HK_POL=5; // pousses max par Hoki ; doses de pollen avant l'éternuement
const hk_i=u=>units.indexOf(u);
// ---- jardin : pousses (objets aux synchronisés : x y t m team ui n = 0 germe / 1 mûre, a = orientation)
function hk_plant(u,x,y){if(!u||u.dead&&mode!=='battle')return null;x=clamp(x,B.x+24,B.x+B.w-24);y=clamp(y,B.y+24,B.y+B.h-24);
 let n=0,old=null;for(const s of aux)if(s.type==='hk_sprout'&&s.owner===u&&s.t>.5){n++;if(!old||s.t<old.t)old=s}
 if(n>=HK_MAX&&old)old.t=Math.min(old.t,.5); // la plus vieille fane
 const s={type:'hk_sprout',x,y,r:16,t:14,m:14,team:u.team,owner:u,ui:hk_i(u),k:.4,n:0,a:rnd()*6.28};aux.push(s);
 if(near(x,y))sparks(x,y,'#6a9a3a',3,'leaf');return s}
// pollen sur un ennemi : doses (u.hk_pol, 0-5) qui rongent et, à 5, font éternuer (étourdi 0,5 s, puis 6 s d'immunité)
function hk_pol(u,src,n){if(!u||u.dead||!src||u.team===src.team||n<=0)return;if((u.hk_imm||0)>SIMT)return;
 u.hk_pol=Math.min(HK_POL,(u.hk_pol||0)+n);u.hk_polT=4;u.hk_polS=src;u.hk_polN=0;if(u.hk_pol>=HK_POL)hk_sneeze(u,src)}
function hk_sneeze(u,src){u.hk_pol=0;u.hk_imm=SIMT+6;const V=VFX;VFX='flower';hit(u,src,8,{stun:.5,unblockable:1});VFX=V;
 if(near(u.x,u.y)){say(u,'ATCHOUM !','#ffe070');jx({jfx:'hk_sneeze',ti:hk_i(u),x:u.x,y:u.y,a:u.aim,t:.9,m:.9});S('wind',u)}}
// bouffée de pollen visible
const hk_puff=(x,y,n)=>{if(near(x,y))jx({jfx:'hk_puff',x,y,n:n||6,t:.7,m:.7})};
// un projectile ennemi de l'élément el (0 feu, 2 vent) touche l'objet x (une fois par projectile et par objet)
function hk_elemHit(x,R,el){for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team||ELM[p.vfx]!==el)continue;if(Math.abs(p.x-x.x)>R+p.r||Math.abs(p.y-x.y)>R+p.r)continue;
  if(Math.hypot(p.x-x.x,p.y-x.y)<R+p.r){if(p.hkH===x)continue;p.hkH=x;return p}}return null}
// décor trié en profondeur (comme les objets debout) : projectile immobile et inoffensif, son alerte de grenade rejetée loin sous l'arène (vfx « bugs » : pas de halo ni de traînée)
function hk_decor(o,kind,x,y,life,ex){const p=Object.assign({x,y,vx:0,vy:0,owner:o,src:o,rot:0,r:.1,dmg:0,life,life0:life,col:'#000',grenade:1,boom:1,tx:x,ty:y+6000,ar:1,kind,vfx:'bugs',hitSet:null},ex);projs.push(p);return p}
function hk_keep(x,kind,ex,key){const K0=key||'dp';let p=x[K0];if(!p||p.dead||p.life<=0||projs.indexOf(p)<0)p=x[K0]=hk_decor(x.owner,kind,x.x,x.y,Math.max(.05,x.t),Object.assign({life0:x.m},ex));p.life=Math.max(.02,x.t);return p}
const hk_scr=()=>{g.restore();g.save()}; // dans un décor : revenir au repère de l'écran

TRAITS[11]={nom:'Jardin vivant',desc:'Là où tu combats, des pousses germent : une à tes pieds toutes les 4 s et une là où tombent tes graines (6 max). Mûres (1,5 s), elles soufflent du pollen sur les ennemis proches (+1 dose/s ; chaque dose ronge 0,6 PV/s ; à 5 doses, la cible éternue : 8 dégâts, étourdie 0,5 s) et te soignent, toi et tes alliés (1,5 PV/s). Le feu les brûle et un ennemi écrase celles qui germent.',
 init(u){u.hk_gT=2},
 update(u,dt){
  // une pousse germe à tes pieds quand un ennemi est proche
  if(state==='fight'){u.hk_gT=(u.hk_gT??2)-dt;if(u.hk_gT<=0){let ok=false;for(const e of units)if(e.team!==u.team&&!e.dead&&Math.abs(e.x-u.x)<650&&Math.hypot(e.x-u.x,e.y-u.y)<650){ok=true;break}
   if(ok&&!u.dash){const a=rnd()*6.28;hk_plant(u,u.x+Math.cos(a)*22,u.y+Math.sin(a)*16);u.hk_gT=4}else u.hk_gT=.5}}
  // pollen : les doses s'effacent peu à peu et rongent la cible (celles d'un Hoki mort s'effacent sans ronger)
  for(const e of units){if(!(e.hk_pol>0))continue;let s=e.hk_polS;if(s&&s!==u){if(!s.dead)continue;e.hk_polS=s=u;e.hk_polN=1}if(e.dead){e.hk_pol=0;continue}
   e.hk_polT=(e.hk_polT||0)-dt;if(e.hk_polT<=0){e.hk_pol--;e.hk_polT=1.5;continue}if(s!==u||e.hk_polN)continue;
   e.hk_dk=(e.hk_dk||0)-dt;if(e.hk_dk<=0){e.hk_dk=.5;VFX='flower';hit(e,u,.3*e.hk_pol,{silent:1});VFX=null}}},
 // sur le Hoki : deux lianes qui s'enroulent autour des jambes, quelques feuilles qui tournent
 draw(u,p,S,sk){const t=performance.now()/1000,H=S*sk;g.save();g.lineCap='round';
  for(const sd of[-1,1]){g.beginPath();for(let i=0;i<=10;i++){const k=i/10,a=k*9+t*1.5*sd,x=p.x+sd*4*S+Math.cos(a)*7*S,y=p.y-(1+k*26)*H+Math.sin(a)*2*S;i?g.lineTo(x,y):g.moveTo(x,y)}
   g.strokeStyle=HKO;g.lineWidth=3.2*S/1.3;g.stroke();g.strokeStyle=HKG;g.lineWidth=1.6*S/1.3;g.stroke()}
  for(let i=0;i<3;i++){const a=t*1.2+i*2.09,x=p.x+Math.cos(a)*16*S,y=p.y-(30+i*12+Math.sin(t*2+i)*4)*H+Math.sin(a)*4*S;hk_leafS(x,y,6*S,a+1.6,S*.7,i%2?HKL:HKG)}g.restore()},
 // jauge à droite de la barre de vie : tes pousses (mûres en fleur) et le pollen de ta cible
 hud(u,x,y){const X=x+368,Y=42,ui=hk_i(u);let n=0,m=0;for(const s of aux)if(s.type==='hk_sprout'&&s.ui===ui&&s.t>.5){n++;if(s.n)m++}
  text('JARDIN',X,Y-4,10,n?'#b8e07a':'#8a967a','left');
  for(let i=0;i<HK_MAX;i++){const cx=X+6+i*14,cy=Y+6;if(i<m){for(let j=0;j<5;j++){const a=j*1.257;circ(cx+Math.cos(a)*3.2,cy+Math.sin(a)*3.2,2.4,HKP)}circ(cx,cy,2,HKY)}
   else if(i<n){g.fillStyle=HKG;g.beginPath();g.ellipse(cx-2,cy,3.6,1.8,-.5,0,7);g.ellipse(cx+2,cy,3.6,1.8,.5,0,7);g.fill()}else{g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1;g.beginPath();g.arc(cx,cy,3.5,0,7);g.stroke()}}
  const e=u.tgt&&!u.tgt.dead?u.tgt:null;let best=e&&e.hk_pol>0?e:null;if(!best)for(const q of units)if(q.team!==u.team&&!q.dead&&q.hk_pol>0&&(!best||q.hk_pol>best.hk_pol))best=q;
  const pv=best?best.hk_pol:0;text('POLLEN',X+92,Y-4,10,pv?'#ffe070':'#8a8a70','left');for(let i=0;i<HK_POL;i++)circ(X+97+i*10,Y+6,i<pv?3.4:2.2,i<pv?HKY:'rgba(255,255,255,.18)')}};

// ---- mécaniques
Object.assign(NAT,{
 // Griffes de ronces (style, corps à corps) : griffes de lianes ; 3e coup : la liane fouette droit devant ; tous les 3 coups qui touchent +1 dose de pollen, le 5e +1 en plus
 hk_style:SP('Griffes de ronces','',.38,{hero:'rey',melee:1,ai:{max:110,p:1}},(u,a)=>{const c=stC(u),T=[0,[82,1.9,10,.38],[82,1.9,10,.38],[118,.7,11,.46],[86,2.6,11,.44],[100,2,13,.6]][c],V='#9ad860',V2='#2a5a1a';
  stMelee(u,a,T[0],T[1],T[2],{},[0,{d:-1,tl:.7,z:36,th:5,n:3,sp:7,c:V,c2:V2,fl:'vine'},{d:1,tl:-.7,z:36,th:5,n:3,sp:7,c:V,c2:V2,fl:'vine'},null,{d:-1,z:22,th:11,c:V,c2:V2,fl:'vine',x2:1,rr:.75},{d:1,tl:1.2,z:30,th:14,c:V,c2:V2,fl:'vine',rr:.7}][c],e=>{
   u.hk_wc=(u.hk_wc||0)+1;let n=c===5?1:0;if(u.hk_wc>=3){u.hk_wc=0;n++}if(n){hk_pol(e,u,n);hk_puff(e.x,e.y,5)}jx({jfx:'hk_lash',x:e.x,y:e.y,a:ang(u,e),t:.3,m:.3});
   if(c===5)jx({jfx:'hk_thorns',x:e.x,y:e.y,r:34,n:7,t:.6,m:.6})});
  if(c===3){jx({jfx:'st_lash',ui:stI(u),x:u.x,y:u.y,a,R:T[0],kind:'vine',t:.3,m:.3});S('shadow',u)}
  stCd(u,T[3]);anim(u,'st_hok'+c,c===3?.32:.28)}),
 // Graine épineuse : graine rapide ; touche (pollen) ou tombe, et une pousse germe à cet endroit
 hk_seed:SP('Graine épineuse','',5,{hero:'lando',line:{len:510,w:18},ai:RG(500,.7)},(u,a)=>{anim(u,'hk_flick',.4);S('blaster',u);
  proj(u,a,{spd:820,r:8,dmg:14,life:.6,col:'#8ad05a',kind:'hk_seed',onHit:(p,t)=>{const o=p.owner;hk_pol(t,o,1);if(!o)return;const b=Math.atan2(o.y-t.y,o.x-t.x)+(rnd()-.5)*.8,d=t.r+22;hk_plant(o,t.x+Math.cos(b)*d,t.y+Math.sin(b)*d)}});
  aux.push({type:'hk_seedw',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,p:projs[projs.length-1],k:0})}),
 // Liane étrangleuse : la liane file au sol (950/s, 460 max) et s'enroule sur le premier ennemi touché
 hk_vine:SP('Liane étrangleuse','',9,{hero:'lando',line:{len:460,w:30},ai:RG(440,.65)},(u,a)=>{anim(u,'hk_slam',.5);S('shadow',u);const c=fwd(u,a,14);
  aux.push({type:'hk_vine',x:c.x,y:c.y,a,len:0,L:460,w:30,t:1.3,m:1.3,team:u.team,owner:u,n:0,ti:-1,k:0});if(near(c.x,c.y))sparks(c.x,c.y,'#7a5a3a',8,'smoke')}),
 // Mur de ronces : haie perpendiculaire à la visée, à 90 devant soi
 hk_hedge:SP('Mur de ronces','',12,{hero:'lando',ai:DEF},(u,a)=>{anim(u,'hk_wall',.6);S('rock',u);const c=fwd(u,a,90);
  aux.push({type:'hk_hedge',x:c.x,y:c.y,a,len:230,w:28,r:115,t:3.5,m:3.5,team:u.team,owner:u,k:0,n:0,hs:{}});if(near(c.x,c.y)){jx({jfx:'hk_dirt',x:c.x,y:c.y,a:a+Math.PI/2,len:230,t:.6,m:.6});shake=Math.max(shake,.1)}}),
 // Fleur carnivore : éclôt au point visé (0,6 s), mord toutes les 1,25 s l'ennemi le plus proche ; une seule à la fois ; le feu la brûle
 hk_trap:SP('Fleur carnivore','',12,{hero:'lando',tele:{r:130,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=atP(u,a,td,420);anim(u,'hk_plant',.6);S('rock',u);
  for(const x of aux)if(x.type==='hk_trap'&&x.owner===u)x.t=Math.min(x.t,.3);
  aux.push({type:'hk_trap',x:p.x,y:p.y,r:130,t:5.6,m:5.6,team:u.team,owner:u,k:.6,a:ang(p,u),n:0,bt:0,danger:1});if(near(p.x,p.y))jx({jfx:'hk_dirt',x:p.x,y:p.y,a:0,len:0,t:.6,m:.6})}),
 // Nuage de spores : nuage de pollen toxique ; le vent le disperse
 hk_spore:SP('Nuage de spores','',11,{hero:'lando',tele:{r:105,max:440},ai:RG(440,.65)},(u,a,td)=>{const p=atP(u,a,td,440);anim(u,'hk_spore',.6);S('wind',u);
  aux.push({type:'hk_spore',x:p.x,y:p.y,r:105,t:4,m:4,team:u.team,owner:u,k:0,n:0,hs:{},danger:1});jx({jfx:'hk_blow',ui:hk_i(u),x:u.x,y:u.y,x2:p.x,y2:p.y,t:.5,m:.5})}),
 // Cocon de sève : soin sur la durée, réduction de dégâts, libère des entraves (soi ou l'allié le plus proche du curseur)
 hk_sap:SP('Cocon de sève','',17,{hero:'lando',ai:HEALM},(u,a,td)=>{const cx=u.x+Math.cos(a)*(td||0),cy=u.y+Math.sin(a)*(td||0);let t=u,bd=110;
  if(u.ctrl)for(const x of units)if(x!==u&&x.team===u.team&&!x.dead&&dist(x,u)<480){const d=Math.hypot(x.x-cx,x.y-cy);if(d<bd){bd=d;t=x}}
  if(!u.ctrl){let lo=u.hp/u.max;for(const x of units)if(x!==u&&x.team===u.team&&!x.dead&&dist(x,u)<420&&x.hp/x.max<lo-.15){lo=x.hp/x.max;t=x}}
  for(const x of aux)if(x.type==='hk_sapx'&&x.tg===t)x.t=0;
  t.root=0;t.slow=0;t.rootV=null;t.drT=Math.max(t.drT||0,3);t.dr=Math.max(t.drT>3.01?t.dr||0:0,.25);t.hk_sap=3;anim(u,'hk_sap',.7);S('water',u);
  aux.push({type:'hk_sapx',x:t.x,y:t.y,r:0,t:3,m:3,team:u.team,owner:u,tg:t,ti:hk_i(t),k:.25,n:0});if(t!==u)jx({jfx:'hk_sapline',x:u.x,y:u.y,ui:hk_i(u),ti:hk_i(t),t:.5,m:.5});say(t,'COCON DE SÈVE','#ffc060')}),
 // Liane-grappin : la liane s'accroche et hisse le Hoki (0,3 s) ; une pousse germe à l'arrivée
 hk_swing:SP('Liane-grappin','',7,{hero:'lando',ai:{mode:'gap',min:140,max:380,p:.5}},(u,a,td)=>{const d=clamp(td||300,120,380),e=fwd(u,a,d);anim(u,'hk_swing',.4);S('dash',u);
  jx({jfx:'hk_rope',ui:hk_i(u),x:u.x,y:u.y,x2:e.x,y2:e.y,t:.42,m:.42});dash(u,a,Math.hypot(e.x-u.x,e.y-u.y),.3,{jump:42,end:()=>{hk_plant(u,u.x,u.y);for(const e of enemies(u))if(Math.hypot(e.x-u.x,e.y-u.y)<75+e.r)hit(e,u,10,{slow:.8});if(near(u.x,u.y))sparks(u.x,u.y,'#5aa83a',10,'leaf')}})}),
 // Fusion végétale (façon Zetsu) : s'enfonce dans le sol, ressurgit au point visé ou dans une de ses pousses (consommée : +10 PV)
 hk_merge:SP('Fusion végétale','',11,{hero:'lando',ai:ESC},(u,a,td)=>{const cx=u.x+Math.cos(a)*(td||300),cy=u.y+Math.sin(a)*(td||300);let sp=null,bd=150;
  for(const s of aux)if(s.type==='hk_sprout'&&s.owner===u&&s.t>.6&&Math.hypot(s.x-u.x,s.y-u.y)<650){const d=Math.hypot(s.x-cx,s.y-cy);if(d<bd){bd=d;sp=s}}
  let dest=fwd(u,a,Math.min(td||300,300));
  if(!u.ctrl){const e=u.tgt&&!u.tgt.dead?u.tgt:nearE(u,u.x,u.y,900);if(e){let bs=dist(e,dest);for(const s of aux)if(s.type==='hk_sprout'&&s.owner===u&&s.t>.6&&Math.hypot(s.x-u.x,s.y-u.y)<650){const d=Math.hypot(s.x-e.x,s.y-e.y);if(d>bs+40){bs=d;sp=s}}}}
  if(sp)dest={x:sp.x,y:sp.y};const D=dest,S0=sp;
  u.phase=Math.max(u.phase||0,.55);u.root=Math.max(u.root,.45);u.hk_mg=.5;u.dash=null;anim(u,'hk_sink',.95);S('poof',u);jx({jfx:'hk_sink',x:u.x,y:u.y,t:.6,m:.6});if(S0)jx({jfx:'hk_sink',x:D.x,y:D.y,t:.6,m:.6,soft:1});
  later(u,.42,()=>{if(u.dead)return;u.x=D.x;u.y=D.y;u.kx=u.ky=0;u.dash=null;u.root=0;collide(u);u.hk_mg=0;jx({jfx:'hk_rise',x:u.x,y:u.y,t:.6,m:.6});S('rock',u);
   if(S0&&S0.t>0){S0.t=0;gain(u,10/HEALX,u);say(u,'+10','#7fe07f')}})}),
 // Floraison mortelle : épines géantes sur la zone ; toutes les pousses du Hoki éclosent en même temps
 hk_bloom:ULT('Floraison mortelle','',{hero:'kylo',tele:{r:160,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'hk_raise',.85);S('rock',u);
  zone(u,p.x,p.y,160,38,.8,{root:1},'#9ad860');lastZ().deto='hk_bloom';jx({jfx:'hk_buds',x:p.x,y:p.y,r:160,t:.8,m:.8});
  for(const s of aux)if(s.type==='hk_sprout'&&s.owner===u&&s.t>.5)jx({jfx:'hk_buds',x:s.x,y:s.y,r:60,t:.8,m:.8,small:1});
  later(u,.8,()=>{const cnt=new Map();VFX='leaf';for(const s of aux){if(s.type!=='hk_sprout'||s.owner!==u||s.t<=.5)continue;s.t=0;if(near(s.x,s.y))jx({jfx:'hk_thorns',x:s.x,y:s.y,r:75,t:.7,m:.7,n:7});
    for(const e of units){if(e.dead||e.team===u.team||Math.hypot(e.x-s.x,e.y-s.y)>75+e.r)continue;const c=cnt.get(e)||0;if(c>=2)continue;cnt.set(e,c+1);if(hit(e,u,16,{unblockable:1,fx:s.x,fy:s.y}))hk_pol(e,u,2)}}VFX=null;if(near(u.x,u.y))S('bone',u)})}),
 // Arbre millénaire : arbre géant 6 s ; ses branches fouettent, son ombre soigne, il pleut du pollen ; il laisse 3 pousses
 hk_tree:ULT('Arbre millénaire','',{hero:'kylo',tele:{r:210,max:380},ai:{max:380,p:.8}},(u,a,td)=>{const p=atP(u,a,Math.min(td||200,380),380);anim(u,'hk_tree',.9);S('rock',u);S('heavy',u);
  for(const x of aux)if(x.type==='hk_tree'&&x.owner===u)x.t=Math.min(x.t,.4);
  aux.push({type:'hk_tree',x:p.x,y:p.y,r:210,t:6.6,m:6.6,team:u.team,owner:u,k:.6,n:0,ti:-1,hk:.5,pk:1.2,danger:1});if(near(p.x,p.y)){jx({jfx:'hk_dirt',x:p.x,y:p.y,a:0,len:0,big:1,t:.8,m:.8});shake=Math.max(shake,.25)}}),
});
Object.assign(NATHERO,{hk:'kylo'});
AFTER.push(()=>{UK.push('hk_pol','hk_sap','hk_mg')});
// ---- logique des objets (hôte)
// graine : si elle ne touche personne, la pousse germe là où elle tombe
AUXF.hk_seedw=(x)=>{const p=x.p;if(!p){x.t=0;return}if(p.dead||p.life<=0||projs.indexOf(p)<0){x.t=0;if(!p.hitAny)hk_plant(x.owner,p.x,p.y);return}x.x=p.x;x.y=p.y};
AUXD.hk_seedw=()=>{};
// pousse : germe 1,5 s (écrasée par un pas ennemi), puis fleurit ; pollen pour les ennemis, soin pour les alliés ; le feu la brûle
AUXF.hk_sprout=(x,dt)=>{const o=x.owner;if(o.dead&&mode!=='battle'&&x.t>.5)x.t=.5;if(x.t<=.5)return;
 const age=x.m-x.t;if(!x.n&&age>=1.5){x.n=1;if(near(x.x,x.y))jx({jfx:'hk_pop',x:x.x,y:x.y,t:.5,m:.5})}
 const f=hk_elemHit(x,22,0);if(f){x.t=.5;if(near(x.x,x.y)){sparks(x.x,x.y,'#ff9a3a',8,'fire');say(o,'POUSSE BRÛLÉE','#ff9a3a')}return}
 if(!x.n){for(const e of units)if(!e.dead&&e.team!==x.team&&Math.abs(e.x-x.x)<40&&Math.hypot(e.x-x.x,e.y-x.y)<14+e.r){x.t=.5;if(near(x.x,x.y))jx({jfx:'hk_crush',x:x.x,y:x.y,t:.5,m:.5});return}return}
 if(x.k>0)return;x.k=.5;
 for(const f2 of fields)if(f2.team!==x.team&&(f2.vfx==='fire'||f2.vfx==='black')&&Math.hypot(f2.x-x.x,f2.y-x.y)<f2.r){x.t=.5;if(near(x.x,x.y))sparks(x.x,x.y,'#ff9a3a',8,'fire');return}
 let puff=0;for(const e of units){if(e.dead||Math.abs(e.x-x.x)>100||Math.hypot(e.x-x.x,e.y-x.y)>75+e.r)continue;
  if(e.team===x.team){if(SIMT-(e.hk_hT||-9)>=.65&&e.hp<e.max){e.hk_hT=SIMT;gain(e,1/HEALX,o)}}
  else if(SIMT-(e.hk_sT||-9)>=.98){e.hk_sT=SIMT;hk_pol(e,o,1);puff=1}}
 if(puff)hk_puff(x.x,x.y,5)};
// liane : avance au sol, s'enroule sur le premier ennemi touché
AUXF.hk_vine=(x,dt)=>{const o=x.owner;if(x.n)return;const ca=Math.cos(x.a),sa=Math.sin(x.a),L0=x.len;x.len=Math.min(x.L,x.len+950*dt);
 let best=null,bf=1e9;for(const e of units){if(e.dead||e.team===x.team||e.phase>0)continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f>-e.r&&f<x.len+e.r&&s<x.w/2+e.r&&f<bf){bf=f;best=e}}
 if(best){x.n=1;x.len=clamp(bf,0,x.L);x.ti=hk_i(best);x.t=Math.min(x.t,.9);VFX='leaf';if(hit(best,o,18,{root:1}))hk_pol(best,o,1);VFX=null;if(near(best.x,best.y)){jx({jfx:'hk_wrap',ti:x.ti,x:best.x,y:best.y,t:1,m:1});S('shadow',o)}return}
 if(x.len>=x.L){x.n=2;x.t=Math.min(x.t,.45)}};
// haie de ronces : points de la ligne, blocage des ennemis et de leurs tirs, épines
const hk_hpts=x=>{const L=[],px=-Math.sin(x.a),py=Math.cos(x.a);for(let i=0;i<7;i++){const s=(i/6-.5)*x.len;L.push({x:x.x+px*s,y:x.y+py*s})}return L};
AUXF.hk_hedge=(x,dt)=>{const o=x.owner;x.pts=x.pts||hk_hpts(x);x.dcs=x.dcs||[];
 x.pts.forEach((q,i)=>{let p=x.dcs[i];if(!p||p.dead||p.life<=0&&x.t>.05||projs.indexOf(p)<0)p=x.dcs[i]=hk_decor(o,'hk_hedged',q.x,q.y,x.t,{life0:x.m,ar:i+1});p.life=Math.max(.02,x.t)});
 const ca=Math.cos(x.a),sa=Math.sin(x.a),hl=x.len/2,hw=x.w/2;
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team||Math.abs(p.x-x.x)>hl+30||Math.abs(p.y-x.y)>hl+30)continue;const dx=p.x-x.x,dy=p.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;
  if(Math.abs(s)>hl+p.r||Math.abs(f)>hw+p.r)continue;p.life=0;p.boom=1;if(ELM[p.vfx]===0){x.t-=1;if(near(p.x,p.y))sparks(p.x,p.y,'#ff9a3a',10,'fire')}else if(near(p.x,p.y))jx({jfx:'hk_snag',x:p.x,y:p.y,t:.35,m:.35})}
 for(const e of units){if(e.dead||e.team===x.team||e.dash||Math.abs(e.x-x.x)>hl+40||Math.abs(e.y-x.y)>hl+40)continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;
  if(Math.abs(s)>hl+e.r*.6||Math.abs(f)>hw+e.r)continue;const sd=f>=0?1:-1,nf=sd*(hw+e.r);e.x+=ca*(nf-f);e.y+=sa*(nf-f);e.kx*=.3;e.ky*=.3;collide(e);
  const kk=e.c+'|'+e.team;if(SIMT-(x.hs[kk]||-9)>=.5){x.hs[kk]=SIMT;VFX='leaf';hit(e,o,6,{slow:.8});VFX=null}}};
// fleur carnivore : émerge, puis mord l'ennemi le plus proche ; le feu la brûle ; à la fin, une pousse germe à sa place
AUXF.hk_trap=(x,dt)=>{const o=x.owner;x.bt=Math.max(0,(x.bt||0)-dt);const p=hk_keep(x,'hk_trapd',{});p.col='t|'+x.a.toFixed(2)+'|'+x.bt.toFixed(2)+'|'+x.team;
 const fp=hk_elemHit(x,40,0);if(fp){fp.life=0;x.t-=2;if(near(x.x,x.y)){sparks(x.x,x.y,'#ff9a3a',12,'fire');say(o,'FLEUR BRÛLÉE','#ff9a3a')}}
 if(x.t<=.05&&!x.done){x.done=1;hk_plant(o,x.x,x.y);return}
 if(x.k>0||x.t<.3)return;let tg=null,bd=x.r;for(const e of units){if(e.dead||e.team===x.team||e.phase>0)continue;const d=Math.hypot(e.x-x.x,e.y-x.y)-e.r;if(d<bd){bd=d;tg=e}}
 if(!tg){x.k=.15;return}x.k=1.25;x.bt=.4;x.a=Math.atan2(tg.y-x.y,tg.x-x.x);x.n++;VFX='leaf';const ok=hit(tg,o,10,{slow:.7,pull:260,fx:x.x,fy:x.y});VFX=null;
 if(near(x.x,x.y)){jx({jfx:'hk_chomp',ti:hk_i(tg),x:tg.x,y:tg.y,x2:x.x,y2:x.y,t:.45,m:.45});if(ok)S('bone',o)}};
// nuage de spores : ralentit, ronge, ajoute des doses ; le vent le disperse
AUXF.hk_spore=(x,dt)=>{const o=x.owner;hk_keep(x,'hk_spored',{ar:x.r});const w=hk_elemHit(x,x.r,2);if(w&&x.t>.5){x.t=.5;if(near(x.x,x.y))say(o,'SPORES DISPERSÉES','#c8fff0')}
 const tick=x.k<=0;if(tick)x.k=.25;
 for(const e of units){if(e.dead||e.team===x.team||Math.abs(e.x-x.x)>x.r+40||Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r)continue;if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.3);if(!tick||x.t<.3)continue;
  VFX='flower';hit(e,o,.75,{silent:1});VFX=null;const kk=e.c+'|'+e.team;x.hs[kk]=(x.hs[kk]||0)+1;if(x.hs[kk]%3===1)hk_pol(e,o,1)}}; // une dose toutes les 0,75 s
// cocon de sève : soin toutes les 0,5 s (30 PV réels en 3 s), puis la sève éclabousse et ralentit les ennemis proches
AUXF.hk_sapx=(x,dt)=>{const t=x.tg;if(!t||t.dead){x.t=0;if(t)t.hk_sap=0;return}x.x=t.x;x.y=t.y;t.hk_sap=Math.max(0,x.t);
 if(x.k<=0&&x.t>0){x.k=.5;gain(t,5/HEALX,x.owner);if(near(t.x,t.y))say(t,'+5','#7fe07f')}
 if(x.t<=.02&&!x.done){x.done=1;t.hk_sap=0;for(const e of units)if(!e.dead&&e.team!==x.team&&Math.hypot(e.x-t.x,e.y-t.y)<90+e.r&&e.unstop<=0)e.slow=Math.max(e.slow,1);if(near(t.x,t.y))jx({jfx:'hk_splash',x:t.x,y:t.y,t:.6,m:.6})}};
// arbre millénaire : pousse (0,6 s), tronc infranchissable, branches qui fouettent, ombre qui soigne, pluie de pollen ; laisse 3 pousses
AUXF.hk_tree=(x,dt)=>{const o=x.owner;hk_keep(x,'hk_treed',{ar:x.r});x.hk-=dt;x.pk-=dt;
 const fp=hk_elemHit(x,30,0);if(fp)fp.life=0;
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team||Math.abs(p.x-x.x)>40||Math.abs(p.y-x.y)>40)continue;if(Math.hypot(p.x-x.x,p.y-x.y)<26+p.r){p.life=0;if(near(p.x,p.y))jx({jfx:'hk_snag',x:p.x,y:p.y,t:.35,m:.35})}}
 for(const e of units){if(e.dead||e.team===x.team||e.dash||Math.abs(e.x-x.x)>60||Math.abs(e.y-x.y)>60)continue;const d=Math.hypot(e.x-x.x,e.y-x.y),m=26+e.r;if(d<m&&d>0){e.x=x.x+(e.x-x.x)/d*m;e.y=x.y+(e.y-x.y)/d*m;collide(e)}}
 if(x.t<=.05){if(!x.done){x.done=1;for(let i=0;i<3;i++){const a=i*2.09+.4;hk_plant(o,x.x+Math.cos(a)*70,x.y+Math.sin(a)*50)}}return}
 if(x.m-x.t<.6)return;
 if(x.hk<=0){x.hk=.5;for(const e of units)if(!e.dead&&e.team===x.team&&e.hp<e.max&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)gain(e,2/HEALX,o)}
 if(x.pk<=0){x.pk=1.2;for(const e of units)if(!e.dead&&e.team!==x.team&&Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)hk_pol(e,o,1)}
 if(x.k>0)return;let tg=null,bd=x.r;for(const e of units){if(e.dead||e.team===x.team||e.phase>0)continue;const d=Math.hypot(e.x-x.x,e.y-x.y)-e.r;if(d<bd){bd=d;tg=e}}
 if(!tg){x.k=.15;return}x.k=1;x.ti=hk_i(tg);x.n++;VFX='leaf';const ok=hit(tg,o,11,{});VFX=null;if(near(x.x,x.y)){jx({jfx:'hk_branch',ti:x.ti,x:x.x,y:x.y,n:x.n,t:.4,m:.4});if(ok)S('saber',o)}};

// ---- dessins
// feuille (repère écran) : x,y base, L longueur, a angle
function hk_leafS(x,y,L,a,s,col){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,-L*.42,L,0);g.quadraticCurveTo(L*.5,L*.42,0,0);g.fillStyle=col;g.fill();g.strokeStyle=HKO;g.lineWidth=Math.max(.8,1.1*s);g.stroke();
 g.strokeStyle='rgba(20,40,10,.5)';g.lineWidth=Math.max(.5,.6*s);g.beginPath();g.moveTo(L*.1,0);g.lineTo(L*.85,0);g.stroke();g.restore()}
// tige en style « toon » : contour sombre, vert, reflet clair
function hk_stem(pts,w,s,col){g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.strokeStyle=HKO;g.lineWidth=w+2.4*s;g.stroke();g.strokeStyle=col||HKG;g.lineWidth=w;g.stroke();
 g.strokeStyle='rgba(200,240,150,.55)';g.lineWidth=Math.max(.6,w*.3);g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0]-w*.18,q[1]-w*.18):g.moveTo(q[0]-w*.18,q[1]-w*.18));g.stroke()}
// épine : triangle clair
function hk_thorn(x,y,a,L,s){const c=Math.cos(a),sn=Math.sin(a),w=L*.32;g.beginPath();g.moveTo(x-sn*w,y+c*w);g.lineTo(x+c*L,y+sn*L);g.lineTo(x+sn*w,y-c*w);g.closePath();g.fillStyle=HKT;g.fill();g.strokeStyle=HKO;g.lineWidth=Math.max(.7,s);g.stroke()}
// fleur : n pétales autour d'un cœur de pollen ; op = ouverture 0-1
function hk_flower(x,y,R,op,T,s,c1,c2){const n=6;g.lineWidth=Math.max(.8,1.1*s);g.strokeStyle=HKO;for(let i=0;i<n;i++){const a=i*6.283/n+T*.4,d=R*.55*op;g.save();g.translate(x+Math.cos(a)*d,y+Math.sin(a)*d*.62);g.rotate(a);g.beginPath();g.ellipse(0,0,R*.55*(.4+.6*op),R*.32,0,0,7);g.fillStyle=i%2?c1||HKP:c2||HKP2;g.fill();g.stroke();g.restore()}
 circ(x,y,R*.36,HKY);g.beginPath();g.arc(x,y,R*.36,0,7);g.stroke();g.fillStyle='#c89a20';for(let i=0;i<4;i++)g.fillRect(x+Math.cos(i*1.6+1)*R*.15-s*.6,y+Math.sin(i*1.6+1)*R*.12-s*.6,1.4*s,1.4*s)}
// grains de pollen qui flottent (un seul tracé)
function hk_motes(cx,cy,rx,ry,n,T,s,al){g.fillStyle=rgba(HKY,al==null?.9:al);g.beginPath();for(let i=0;i<n;i++){const k=i*2.399,ph=T*(.8+(i%4)*.3)+k,x=cx+Math.cos(ph)*rx*(.3+.7*((i*.618)%1)),y=cy+Math.sin(ph*1.3+k)*ry*(.3+.7*((i*.37)%1));g.moveTo(x+1.6*s,y);g.arc(x,y,1.6*s,0,7)}g.fill()}
// masse de feuillage façon « toon » : disques [x,y,r] avec contour, liseré clair et corps vert
function hk_blob(C,s,c1,c2){g.fillStyle=HKO;g.beginPath();for(const [x,y,r] of C){g.moveTo(x+r+1.8*s,y);g.arc(x,y,r+1.8*s,0,7)}g.fill();
 g.fillStyle=c2||HKL;g.beginPath();for(const [x,y,r] of C){g.moveTo(x-.8*s+r,y-1.4*s);g.arc(x-.8*s,y-1.4*s,r,0,7)}g.fill();
 g.fillStyle=c1||HKG;g.beginPath();for(const [x,y,r] of C){const q=Math.max(.6,r-1.6*s);g.moveTo(x+.8*s+q,y+1*s);g.arc(x+.8*s,y+1*s,q,0,7)}g.fill()}
// liane au sol de A à B (monde), ondulée, avec épines et feuilles ; z0 : hauteur au départ (la liane du grappin part de la main)
function hk_vineW(x0,y0,a,len,w,T,al,seed,z0){if(len<3)return;const ca=Math.cos(a),sa=Math.sin(a),N=Math.max(3,len/16|0),pts=[];for(let i=0;i<=N;i++){const f=i/N*len,wv=Math.sin(f*.045+seed)*7,q=P(x0+ca*f-sa*wv,y0+sa*f+ca*wv,2+(z0||0)*(1-i/N));pts.push([q.x,q.y,q.s])}
 g.globalAlpha=al;const s=pts[0][2];hk_stem(pts,w*s,s,HKD);
 for(let i=1;i<pts.length;i++){const [x,y,ss]=pts[i],pa=Math.atan2(y-pts[i-1][1],x-pts[i-1][0]);if(i%2)hk_thorn(x,y,pa+(i%4<2?1.4:-1.4),6*ss,ss*.8);if(i%3===0)hk_leafS(x,y,9*ss,pa+(i%6<3?-.9:.9),ss,i%2?HKL:HKG)}
 const [ex,ey,es]=pts[pts.length-1];circ(ex,ey,4.5*es,HKO);circ(ex,ey,3.2*es,HKL);g.globalAlpha=1}
// graine épineuse : graine qui tourne, couronne d'épines, traînée de feuilles
PROJD.hk_seed=(p,R,ra,t)=>{const T=t/1000;g.rotate(ra);g.globalCompositeOperation='lighter';g.fillStyle='rgba(160,230,100,.35)';for(let i=1;i<6;i++)g.fillRect(-i*7-1.5,Math.sin(T*24+i)*2-1.5,3,3);g.globalCompositeOperation='source-over';
 g.rotate(T*14);for(let i=0;i<6;i++){const a=i*1.047;hk_thorn(Math.cos(a)*R*.7,Math.sin(a)*R*.7,a,R*.75,.9)}g.beginPath();g.ellipse(0,0,R*.95,R*.75,0,0,7);g.fillStyle='#7a5a2a';g.fill();g.strokeStyle=HKO;g.lineWidth=1.4;g.stroke();
 g.fillStyle='#b08a4a';g.beginPath();g.ellipse(-R*.2,-R*.2,R*.4,R*.25,.3,0,7);g.fill();hk_leafS(R*.5,0,R*.9,.3,1,HKL)};
// fouet de ronces : liane de la main du lanceur jusqu'à la pointe épineuse
// pousse : butte de terre, tige, deux feuilles ; mûre : fleur rose et pollen qui monte
AUXD.hk_sprout=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,age=x.m-x.t,gr=Math.min(1,age/1.5),fd=Math.min(1,x.t/.5),sd=x.a||0;g.globalAlpha=fd;
 g.fillStyle='rgba(60,40,20,.55)';g.beginPath();g.ellipse(q.x,q.y,11*s,4.4*s,0,0,7);g.fill();
 const sw=Math.sin(t*1.8+sd)*2*s,h=(5+15*gr)*s,tx=q.x+sw,ty=q.y-h;hk_stem([[q.x,q.y],[q.x+sw*.4,q.y-h*.5],[tx,ty]],2.2*s,s,HKG);
 hk_leafS(q.x+sw*.3,q.y-h*.35,(5+5*gr)*s,-2.6+Math.sin(t*2+sd)*.15,s,HKG);hk_leafS(q.x+sw*.3,q.y-h*.4,(5+5*gr)*s,-.5-Math.sin(t*2+sd)*.15,s,HKL);
 if(x.n){const op=Math.min(1,(age-1.5)/.4+.2);hk_flower(tx,ty-2*s,7*s,op,t+sd,s);g.globalAlpha=fd*.85;hk_motes(tx,ty-14*s,10*s,9*s,4,t*1.4+sd,s)}
 else{circ(tx,ty,3*s,HKO);circ(tx,ty,2*s,'#d87aa8')}g.globalAlpha=1};
// liane étrangleuse : liane qui file au sol
AUXD.hk_vine=(x,k,t)=>{hk_vineW(x.x,x.y,x.a,x.len,5,t,Math.min(1,x.t/.35),x.x*.01)};
// haie de ronces au sol : bande de terre retournée
AUXD.hk_hedge=(x,k,t)=>{const px=-Math.sin(x.a),py=Math.cos(x.a),a=P(x.x-px*x.len/2,x.y-py*x.len/2,0),b=P(x.x+px*x.len/2,x.y+py*x.len/2,0);g.strokeStyle=rgba('#3a2a14',.5*k);g.lineCap='round';g.lineWidth=x.w*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};
// colonne de la haie (décor) : buisson de ronces entremêlées, épines, quelques fleurs
PROJD.hk_hedged=(p,R,ra,t)=>{hk_scr();const T=t/1000,q=P(p.x,p.y,0),s=q.s,sd=p.ar||1,gr=Math.min(1,(p.life0-p.life)/.3),fd=Math.min(1,p.life/.4);g.globalAlpha=fd;const H=44*gr*s;
 for(let j=0;j<3;j++){const ph=sd*1.7+j*2.1,pts=[];for(let i=0;i<=6;i++){const kk=i/6;pts.push([q.x+Math.sin(kk*5+ph+T*.6)*12*s,q.y-kk*H])}hk_stem(pts,(3.6-j*.6)*s,s,j%2?HKD:HKB)}
 hk_blob([[q.x-6*s,q.y-H*.55,9*s*gr+1],[q.x+7*s,q.y-H*.7,8*s*gr+1],[q.x,q.y-H*.95,7*s*gr+1]],s,HKD,HKG);
 for(let i=0;i<7;i++){const a=i*.9+sd,yy=q.y-H*(.2+(i%5)*.17),xx=q.x+Math.cos(a)*11*s;hk_thorn(xx,yy,a>3.14?Math.PI:0,6*s*gr,s*.8)}
 if((sd|0)%2===1&&gr>.8)hk_flower(q.x+4*s,q.y-H*.8,5*s,1,T+sd,s);g.globalAlpha=1};
// fleur carnivore (décor) : tige épaisse, feuilles, tête à mâchoires dentées qui s'ouvre et claque vers la cible
PROJD.hk_trapd=(p,R,ra,t)=>{hk_scr();const T=t/1000,q=P(p.x,p.y,0),s=q.s,cs=String(p.col).split('|'),A=+cs[1]||0,bt=+cs[2]||0,em=Math.min(1,(p.life0-p.life)/.6),fd=Math.min(1,p.life/.35);g.globalAlpha=fd;
 g.fillStyle='rgba(40,24,10,.5)';g.beginPath();g.ellipse(q.x,q.y,26*s,10*s,0,0,7);g.fill();
 const bite=bt>0?Math.sin((1-bt/.4)*Math.PI):0,lean=bite*22*s,dx=Math.cos(A),dy=Math.sin(A)*K,H=(20+40*ezo(em))*s,hx=q.x+dx*lean+Math.sin(T*2)*3*s,hy=q.y-H+dy*lean;
 for(const sd of[-1,1])hk_leafS(q.x,q.y-2*s,22*s*em,sd>0?-.25:-2.9,s,sd>0?HKG:HKD);
 hk_stem([[q.x,q.y],[q.x+(hx-q.x)*.3+Math.sin(T*2.4)*5*s,q.y-H*.5],[hx,hy]],6*s,s,HKD);
 const op=bt>0?(bt>.28?.15:.9-.6*bite):.55+.2*Math.sin(T*3),fa=Math.atan2(dy,dx),Rr=18*s*(.5+.5*em),fx=Math.cos(fa)>=0?1:-1;g.save();g.translate(hx,hy);g.scale(fx,1);
 for(const sd of[-1,1]){g.save();g.rotate(-sd*op*.9);g.beginPath();g.moveTo(-Rr*.2,0);g.quadraticCurveTo(Rr*.4,sd*-Rr*1.1,Rr*1.25,sd*-Rr*.05);g.quadraticCurveTo(Rr*.5,sd*Rr*.15,-Rr*.2,0);g.closePath();
  g.fillStyle=sd<0?'#c8304a':'#b02a40';g.fill();g.strokeStyle=HKO;g.lineWidth=1.6*s;g.stroke();g.beginPath();g.moveTo(-Rr*.25,0);g.quadraticCurveTo(Rr*.35,sd*-Rr*1.3,Rr*1.3,sd*-Rr*.12);g.strokeStyle=HKG;g.lineWidth=3.4*s;g.stroke();
  for(let i=1;i<6;i++){const k=i/6,xx=-Rr*.2+k*Rr*1.4,yy=sd*-Rr*(.08+.9*Math.sin(k*Math.PI)*.62);hk_thorn(xx,yy,sd>0?Math.PI/2:-Math.PI/2,5*s,s*.7)}g.restore()}
 circ(0,0,4*s,HKY);g.restore();g.globalAlpha=1};
// nuage de spores (décor) : volutes de pollen jaune-vert au-dessus de la zone
PROJD.hk_spored=(p,R,ra,t)=>{hk_scr();const T=t/1000,q=P(p.x,p.y,0),Rr=(p.ar||105)*q.s,k=Math.min(1,p.life/.5,(p.life0-p.life)/.35+.2),cy=q.y-22*q.s;g.globalAlpha=.55*k;
 for(let i=0;i<9;i++){const a=i*.698+T*.35*(i%2?1:-1),d=Rr*(.25+.5*((i*.618)%1)),x=q.x+Math.cos(a)*d,y=cy+Math.sin(a)*d*.42-Math.sin(T*1.3+i)*6*q.s,r=Rr*(.28+.08*Math.sin(T*2+i));
  const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(236,224,96,.75)');gr.addColorStop(.6,'rgba(190,210,80,.45)');gr.addColorStop(1,'rgba(160,190,60,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
 g.globalAlpha=k;hk_motes(q.x,cy-10*q.s,Rr*.9,Rr*.4,26,T*1.2,q.s);g.globalAlpha=1};
AUXD.hk_spore=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba('#c8c040',.16*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.strokeStyle=rgba('#e8d860',.6*k);g.lineWidth=1.6;g.setLineDash([4,8]);g.lineDashOffset=-t*18;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.setLineDash([])};
AUXD.hk_trap=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.strokeStyle=rgba('#c8304a',.35*k);g.lineWidth=1.4;g.setLineDash([6,8]);g.lineDashOffset=t*14;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.setLineDash([]);
 for(let i=0;i<5;i++){const a=i*1.257+.3,p0=P(x.x+Math.cos(a)*18,x.y+Math.sin(a)*14,0),p1=P(x.x+Math.cos(a)*(44+6*Math.sin(t+i)),x.y+Math.sin(a)*34,0);hk_stem([[p0.x,p0.y],[p1.x,p1.y]],2*q.s,q.s,HKB)}};
AUXD.hk_sapx=()=>{};
// arbre millénaire (au sol) : ombre du feuillage, racines, cercle de la zone
AUXD.hk_tree=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s,gr=Math.min(1,(x.m-x.t)/.6);g.fillStyle=rgba('#0e1a08',.28*k*gr);g.beginPath();g.ellipse(q.x,q.y,R*.85,R*.85*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#9ad860',.45*k);g.lineWidth=1.6;g.setLineDash([10,8]);g.lineDashOffset=t*10;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.setLineDash([]);
 for(let i=0;i<7;i++){const a=i*.897+.2,L=(50+20*((i*.618)%1))*gr,p0=P(x.x+Math.cos(a)*16,x.y+Math.sin(a)*12,0),p1=P(x.x+Math.cos(a)*L*.6,x.y+Math.sin(a)*L*.45+6,0),p2=P(x.x+Math.cos(a+.3)*L,x.y+Math.sin(a+.3)*L*.75,0);hk_stem([[p0.x,p0.y],[p1.x,p1.y],[p2.x,p2.y]],(5-i%3)*q.s,q.s,HKB)}};
// arbre millénaire (décor) : tronc noueux, feuillage en boules, fleurs, feuilles et pollen qui tombent
// un ninja derrière ou dans l'arbre : l'arbre devient translucide pour qu'on le voie toujours
function hk_treeA(q,H,s){let m=0;for(const u of units){if(u.dead)continue;const v=P(u.x,u.y,0),dx=Math.abs(v.x-q.x)/(92*s),by=v.y-40*s,top=q.y-H-52*s,bot=q.y+16*s,out=by<top?top-by:by>bot?by-bot:0;
 m=Math.max(m,clamp((1.15-dx)*4,0,1)*clamp(1-out/(24*s),0,1))}return 1-.68*m}
PROJD.hk_treed=(p,R,ra,t)=>{hk_scr();const T=t/1000,q=P(p.x,p.y,0),s=q.s,gr=ezo(Math.min(1,(p.life0-p.life)/.6)),H=150*gr*s,W=16*s,fd=Math.min(1,p.life/.45)*hk_treeA(q,H,s);g.globalAlpha=fd;
 g.beginPath();g.moveTo(q.x-W*1.5,q.y);g.quadraticCurveTo(q.x-W*.6,q.y-H*.3,q.x-W*.7,q.y-H*.8);g.lineTo(q.x+W*.6,q.y-H*.8);g.quadraticCurveTo(q.x+W*.6,q.y-H*.3,q.x+W*1.5,q.y);g.closePath();g.fillStyle=HKB;g.fill();g.strokeStyle=HKO;g.lineWidth=2.4*s;g.stroke();
 g.strokeStyle=HKBL;g.lineWidth=2*s;g.beginPath();g.moveTo(q.x-W*.3,q.y-4*s);g.quadraticCurveTo(q.x-W*.5,q.y-H*.4,q.x-W*.2,q.y-H*.75);g.stroke();g.strokeStyle='rgba(20,12,4,.5)';g.lineWidth=1.4*s;g.beginPath();g.moveTo(q.x+W*.4,q.y-H*.2);g.quadraticCurveTo(q.x+W*.1,q.y-H*.35,q.x+W*.35,q.y-H*.5);g.stroke();
 for(const sd of[-1,1])hk_stem([[q.x+sd*W*.3,q.y-H*.62],[q.x+sd*W*2.4,q.y-H*.8],[q.x+sd*W*3.6,q.y-H*.78]],5*s,s,HKB);
 const cy=q.y-H*.92,C=[];for(let i=0;i<9;i++){const a=i*.698+.3,d=(i%3?44:24)*gr*s,sw=Math.sin(T*1.1+i)*2*s;C.push([q.x+Math.cos(a)*d*1.35+sw,cy+Math.sin(a)*d*.62,(26-(i%3)*4)*gr*s+1])}C.push([q.x,cy-12*s*gr,30*gr*s+1]);hk_blob(C,s,'#3f8a2a',HKL);
 for(let i=0;i<8;i++){const a=i*.785+T*.1,x=q.x+Math.cos(a)*50*gr*s,y=cy+Math.sin(a)*24*gr*s-4*s;hk_flower(x,y,5.5*s*gr,1,T+i,s)}
 for(let i=0;i<10;i++){const k=((T*.35+i*.1)%1),x=q.x+Math.sin(i*2.3+T*.6)*70*s,y=cy+10*s+k*(q.y-cy-10*s);g.globalAlpha=fd*(1-k);hk_leafS(x,y,6*s,T*3+i,s*.7,i%2?HKL:'#c8d860')}
 g.globalAlpha=fd*.85;hk_motes(q.x,cy+40*s,90*s,50*s,18,T*.9,s,.8);g.globalAlpha=1};
// ---- effets ponctuels
// bouffée de pollen
JFXD.hk_puff=(f,k,e,t)=>{const q=P(f.x,f.y,24),n=f.n||6;g.globalAlpha=k*.7;for(let i=0;i<n;i++){const a=i*6.283/n+f.x*.01,r=(6+26*ezo(e))*q.s,x=q.x+Math.cos(a)*r,y=q.y+Math.sin(a)*r*.6-12*e*q.s;g.fillStyle=i%2?'rgba(240,224,96,.8)':'rgba(200,220,90,.7)';g.beginPath();g.arc(x,y,(5-2*e)*q.s,0,7);g.fill()}
 g.globalAlpha=k;hk_motes(q.x,q.y-10*e*q.s,22*q.s*(.4+e),12*q.s*(.4+e),10,t*2,q.s);g.globalAlpha=1};
// éternuement : grosse bouffée de pollen projetée devant le visage, la tête part en arrière
JFXD.hk_sneeze=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,a=f.a||0,q=P(o.x+Math.cos(a)*10,o.y+Math.sin(a)*10,58),s=q.s;g.globalAlpha=Math.min(1,k*1.6);
 for(let i=0;i<12;i++){const b=a+(i/11-.5)*1.3,d=(10+60*ezo(e)*(.6+.4*((i*.618)%1)))*s,x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*K-6*e*s;g.fillStyle=i%3?'rgba(244,228,100,.85)':'rgba(255,250,200,.9)';g.beginPath();g.arc(x,y,(7-3*e)*s,0,7);g.fill()}
 hk_motes(q.x+Math.cos(a)*30*s,q.y,40*s*(.3+e),18*s*(.3+e),16,t*3,s);g.globalAlpha=1};
// liane enroulée autour des jambes de la cible entravée
JFXD.hk_wrap=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s*1.3,gr=Math.min(1,e*5),fd=Math.min(1,k*4);g.globalAlpha=fd;g.fillStyle='rgba(40,24,10,.45)';g.beginPath();g.ellipse(q.x,q.y,20*s,7*s,0,0,7);g.fill();
 for(const ph of[0,3.14]){const pts=[];for(let i=0;i<=12;i++){const kk=i/12*gr,a=kk*13+ph;pts.push([q.x+Math.cos(a)*11*s,q.y-kk*34*s+Math.sin(a)*3.5*s])}hk_stem(pts,2.6*s,s,ph?HKD:HKG)}
 for(let i=0;i<4;i++){const a=i*1.6+.5,y=q.y-(8+i*7)*s*gr;hk_thorn(q.x+Math.cos(a)*11*s,y,Math.cos(a)>0?0:Math.PI,4*s,s*.7)}if(gr>.9)hk_leafS(q.x+8*s,q.y-34*s,8*s,-.6,s,HKL);g.globalAlpha=1};
// coup de fouet qui touche : éclats de feuilles
JFXD.hk_lash=(f,k,e,t)=>{const q=P(f.x,f.y,30);for(let i=0;i<5;i++){const a=(f.a||0)+(i-2)*.5,d=(6+26*e)*q.s;hk_leafS(q.x+Math.cos(a)*d,q.y+Math.sin(a)*d*.6-8*e*q.s,6*q.s*k,a+t*4,q.s*.7,i%2?HKL:HKG)}
 g.strokeStyle=rgba('#e8ffd0',.8*k);g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,(6+14*e)*q.s,0,7);g.stroke()};
// terre retournée (la plante sort du sol)
JFXD.hk_dirt=(f,k,e,t)=>{const n=f.big?18:10,L=f.len||0,px=Math.cos(f.a||0),py=Math.sin(f.a||0);g.fillStyle=rgba('#6a4a28',.85*k);g.beginPath();
 for(let i=0;i<n;i++){const s=L?(i/(n-1)-.5)*L:0,a=i*2.4,d=(f.big?30:14)+((i*37)%20),x=f.x+px*s+Math.cos(a)*d*e,y=f.y+py*s+Math.sin(a)*d*e*.8,z=Math.sin(Math.PI*e)*(18+(i%4)*8),q=P(x,y,z);g.moveTo(q.x+3*q.s,q.y);g.arc(q.x,q.y,(2.4+(i%3))*q.s,0,7)}g.fill()};
// tir arrêté par les ronces
JFXD.hk_snag=(f,k,e,t)=>{const q=P(f.x,f.y,28);for(let i=0;i<4;i++)hk_thorn(q.x,q.y,i*1.57+.4,(4+10*e)*q.s,q.s*.7);g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=1.5;g.beginPath();g.arc(q.x,q.y,(4+10*e)*q.s,0,7);g.stroke()};
// la fleur carnivore mord : mâchoire fantôme qui claque sur la cible
JFXD.hk_chomp=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,30),s=q.s,cl=Math.min(1,e*3);g.globalAlpha=k;for(const sd of[-1,1]){g.save();g.translate(q.x,q.y);g.rotate(sd*(1-cl)*.9);
  for(let i=0;i<5;i++){const xx=(i-2)*6*s;hk_thorn(xx,sd*-(12-6*cl)*s,sd>0?Math.PI/2:-Math.PI/2,7*s,s*.8)}g.restore()}
 if(cl>=1){g.strokeStyle=rgba('#ff6080',.8*k);g.lineWidth=2.4;g.beginPath();g.arc(q.x,q.y,(10+16*e)*s,0,7);g.stroke()}g.globalAlpha=1};
// souffle de spores (de la bouche du lanceur vers la zone)
JFXD.hk_blow=(f,k,e,t)=>{for(let i=0;i<16;i++){const kk=((i/16)+e*1.4)%1,x=lerp(f.x,f.x2,kk)+Math.sin(i*2.1)*14*kk,y=lerp(f.y,f.y2,kk)+Math.cos(i*1.7)*10*kk,q=P(x,y,40-kk*20);g.fillStyle=i%2?rgba('#f0e060',.7*k):rgba('#c8d860',.6*k);g.beginPath();g.arc(q.x,q.y,(3+5*kk)*q.s,0,7);g.fill()}};
// lien de sève vers l'allié
JFXD.hk_sapline=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const a=P(u.x,u.y,36),b=P(tg.x,tg.y,36),kk=Math.min(1,e*2.5);g.strokeStyle=rgba(HKS,.85*k);g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(lerp(a.x,b.x,kk),lerp(a.y,b.y,kk));g.stroke();g.strokeStyle=rgba('#fff0c0',.7*k);g.lineWidth=1.5;g.stroke()};
// éclaboussure de sève (fin du cocon)
JFXD.hk_splash=(f,k,e,t)=>{const q=P(f.x,f.y,0);g.fillStyle=rgba(HKS,.3*k);gEll(f.x,f.y,30+60*e);g.fill();for(let i=0;i<12;i++){const a=i*.524,d=(10+60*ezo(e))*q.s,z=Math.sin(Math.PI*e)*30*q.s;circ(q.x+Math.cos(a)*d,q.y+Math.sin(a)*d*K-z,(3.5-2*e)*q.s,rgba(i%2?HKS:'#ffd070',.9*k))}};
// liane-grappin : la liane jaillit de la main jusqu'au point d'accroche
JFXD.hk_rope=(f,k,e,t,u)=>{const ox=u?u.x:f.x,oy=u?u.y:f.y,a=Math.atan2(f.y2-oy,f.x2-ox),L=Math.hypot(f.x2-ox,f.y2-oy)*Math.min(1,e*4);hk_vineW(ox,oy,a,L,4,t,Math.min(1,k*2.5),1.3,(u?u.z||0:0)+34);
 const q=P(f.x2,f.y2,0);if(e>.25){g.globalAlpha=k;for(let i=0;i<4;i++)hk_leafS(q.x,q.y,8*q.s,i*1.57+t,q.s,HKG);g.globalAlpha=1}};
// fusion végétale : racines et feuilles qui se referment sur le Hoki / qui s'ouvrent quand il ressurgit
function hk_sinkD(f,k,e,t,up){const q=P(f.x,f.y,0),s=q.s,c=up?1-e:e;g.fillStyle=rgba('#2a1a0c',.55*k);g.beginPath();g.ellipse(q.x,q.y,24*s,9*s,0,0,7);g.fill();
 for(let i=0;i<8;i++){const a=i*.785+(up?t*2:-t*2),h=(10+30*Math.sin(Math.PI*Math.min(1,e*1.2)))*s*(f.soft?.6:1),bx=q.x+Math.cos(a)*20*s,by=q.y+Math.sin(a)*7*s,tx=q.x+Math.cos(a)*(20-14*c)*s,ty=by-h;g.globalAlpha=Math.min(1,k*2);hk_stem([[bx,by],[lerp(bx,tx,.5)+Math.cos(a)*4*s,by-h*.5],[tx,ty]],2.4*s,s,i%2?HKG:HKD);hk_leafS(tx,ty,7*s,a-1.57,s*.8,i%2?HKL:HKG)}g.globalAlpha=1}
JFXD.hk_sink=(f,k,e,t)=>hk_sinkD(f,k,e,t,0);JFXD.hk_rise=(f,k,e,t)=>{hk_sinkD(f,k,e,t,1);const q=P(f.x,f.y,0);if(e<.5)hk_motes(q.x,q.y-20*q.s,26*q.s,16*q.s,10,t*2,q.s,1-e*2)};
// floraison : des bourgeons pointent dans la zone pendant l'alerte
JFXD.hk_buds=(f,k,e,t)=>{const n=f.small?5:16;for(let i=0;i<n;i++){const a=i*2.399,d=f.r*Math.sqrt((i+.5)/n)*.92,q=P(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d,0),h=(3+10*e)*q.s;hk_stem([[q.x,q.y],[q.x,q.y-h]],2*q.s,q.s,HKG);circ(q.x,q.y-h,2.4*q.s*(.6+e),'#d84a7a')}};
// épines géantes qui jaillissent du sol (détonation de la floraison et des pousses)
JFXD.hk_thorns=(f,k,e,t)=>{const n=f.n||16,up=ezo(Math.min(1,e*3)),fd=Math.min(1,k*2.2);g.globalAlpha=fd;g.fillStyle=rgba('#3a2a14',.4);gEll(f.x,f.y,f.r*.95);g.fill();
 const L=[];for(let i=0;i<n;i++){const a=i*2.399+f.x*.01,d=f.r*Math.sqrt((i+.5)/n)*.9;L.push([f.x+Math.cos(a)*d,f.y+Math.sin(a)*d,i])}L.sort((a,b)=>a[1]-b[1]);
 for(const [x,y,i] of L){const q=P(x,y,0),s=q.s,H=(f.n?26:44+((i*13)%22))*s*up,lean=Math.sin(i*1.7)*.3,W=(f.n?5:8)*s,tx=q.x+Math.sin(lean)*H,ty=q.y-H;
  g.beginPath();g.moveTo(q.x-W,q.y);g.quadraticCurveTo(q.x-W*.3,q.y-H*.5,tx,ty);g.quadraticCurveTo(q.x+W*.3,q.y-H*.5,q.x+W,q.y);g.closePath();g.fillStyle=i%2?HKD:HKB;g.fill();g.strokeStyle=HKO;g.lineWidth=1.6*s;g.stroke();
  g.strokeStyle='rgba(220,240,180,.5)';g.lineWidth=1.2*s;g.beginPath();g.moveTo(q.x-W*.4,q.y-2*s);g.quadraticCurveTo(q.x-W*.2,q.y-H*.5,tx,ty);g.stroke();if(i%3===0&&up>.8)hk_flower(tx,ty,4.5*s,1,t+i,s)}g.globalAlpha=1};
// la pousse fleurit
JFXD.hk_pop=(f,k,e,t)=>{const q=P(f.x,f.y,20);g.strokeStyle=rgba(HKP2,.8*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,(4+16*e)*q.s,(4+16*e)*q.s*.7,0,0,7);g.stroke();hk_motes(q.x,q.y-8*e*q.s,14*q.s,8*q.s,6,t*2,q.s,k)};
// pousse écrasée
JFXD.hk_crush=(f,k,e,t)=>{const q=P(f.x,f.y,0);g.globalAlpha=k;for(let i=0;i<4;i++){const a=i*1.57+.6,d=(4+14*e)*q.s;hk_leafS(q.x+Math.cos(a)*d,q.y+Math.sin(a)*d*.5,6*q.s,a,q.s*.7,HKD)}g.globalAlpha=1};
// branche de l'arbre qui fouette la cible
JFXD.hk_branch=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const a=P(f.x+((f.n||0)%2?-30:30),f.y-4,120),b=P(tg.x,tg.y,30),sw=Math.sin(Math.min(1,e*3)*Math.PI*.5),mx=lerp(a.x,b.x,.5)+((f.n||0)%2?-40:40)*a.s*(1-sw),my=Math.min(a.y,b.y)-30*a.s*(1-sw),ex=lerp(a.x,b.x,sw),ey=lerp(a.y,b.y,sw);
 g.globalAlpha=Math.min(1,k*2.5);const pts=[];for(let i=0;i<=8;i++){const kk=i/8,x=(1-kk)*(1-kk)*a.x+2*(1-kk)*kk*mx+kk*kk*ex,y=(1-kk)*(1-kk)*a.y+2*(1-kk)*kk*my+kk*kk*ey;pts.push([x,y])}hk_stem(pts,5*a.s,a.s,HKB);
 for(let i=2;i<8;i+=2)hk_leafS(pts[i][0],pts[i][1],9*a.s,i+t,a.s,i%4?HKG:HKL);if(sw>.95){g.strokeStyle=rgba('#e8ffd0',.8*k);g.lineWidth=2.4;g.beginPath();g.arc(b.x,b.y,(8+16*e)*b.s,0,7);g.stroke()}g.globalAlpha=1};
DETO.hk_bloom=(x,y,r)=>{jx({jfx:'hk_thorns',x,y,r,t:.9,m:.9});jx({jfx:'hk_puff',x,y,n:12,t:.8,m:.8});jx({jfx:'shock',x,y,r:r*1.1,t:.45,m:.45,col:'#9ad860'})};
// ---- états visibles sur les ninjas : pollen (grains qui tournent autour de la tête + doses près de la barre), cocon de sève, fusion dans le sol
STATD.push((u,p,S,sk)=>{const pol=u.hk_pol||0,sap=u.hk_sap>0,mg=u.hk_mg>0;if(!pol&&!sap&&!mg)return;const t=performance.now()/1000,H=S*sk,ps=S/1.3/(u.giant>0?1.35:1),top=p.y-100*sk*ps;
 if(pol){hk_motes(p.x,p.y-62*H,16*S,9*S,pol*3,t*2.2,S*.8,.9);const x0=p.x-pol*4*ps,y0=top+9*ps;for(let i=0;i<pol;i++){const cx=x0+i*8*ps;circ(cx,y0,3*ps,HKO);circ(cx,y0,2.2*ps,i===HK_POL-1?'#ffb030':HKY)}}
 if(sap){g.save();const r=24*S*sk,k=Math.min(1,u.hk_sap/.4);g.globalAlpha=.85*k;const gr=g.createLinearGradient(0,p.y-58*H,0,p.y);gr.addColorStop(0,'rgba(255,210,120,.3)');gr.addColorStop(1,'rgba(232,150,40,.58)');g.fillStyle=gr;g.beginPath();g.ellipse(p.x,p.y-30*H,r*.8,r*1.35,0,0,7);g.fill();
  g.strokeStyle='rgba(255,190,80,.85)';g.lineWidth=2;g.stroke();g.strokeStyle='rgba(255,250,220,.75)';g.lineWidth=2.5;g.beginPath();g.ellipse(p.x-r*.3,p.y-42*H,r*.18,r*.5,.3,3.6,5.2);g.stroke();
  for(let i=0;i<3;i++){const kk=(t*.8+i/3)%1,x=p.x+(i-1)*r*.45,y=p.y-30*H+r*1.1*(.2+.8*kk)*.9;circ(x,y,2.2*S,rgba(HKS,1-kk))}g.restore()}
 if(mg){const e=1-u.hk_mg/.5;g.save();g.fillStyle='rgba(30,20,10,.6)';g.beginPath();g.ellipse(p.x,p.y,26*S,9*S,0,0,7);g.fill();for(let i=0;i<10;i++){const a=i*.628+t*3,h=(14+i%3*8)*S*(.3+.7*e),x=p.x+Math.cos(a)*15*S*(1-e*.5),y=p.y-h+Math.sin(a)*4*S;hk_leafS(x,y,12*S,a,S,i%2?HKL:HKG)}g.restore()}});
// ---- animations 3D
Object.assign(ANIM,{
 // pichenette : la graine part du pouce
 hk_flick:(P,e)=>{if(e<.4){const k=ezo(e/.4);pz(P,'armR',-1.2*k,0,.3*k);pz(P,'foreR',-1.8*k);pz(P,'chest',0,.3*k)}else{const k=ezo(Math.min(1,(e-.4)/.25));pz(P,'armR',-1.2-.4*k,0,.3-.4*k);pz(P,'foreR',-1.8+1.75*k);pz(P,'chest',.1*k,.3-.5*k);pz(P,'thighR',-.3*k);pz(P,'shinR',.3*k)}pz(P,'armL',.2,0,.3)},
 // paume plaquée au sol : la liane part en avant
 hk_slam:(P,e)=>{const k=ezo(Math.min(1,e/.3)),r=e>.75?(e-.75)/.25:0;P.root.y=-7*k*(1-r);pz(P,'chest',.7*k*(1-r));pz(P,'armR',-1.1*k*(1-r),0,.15);pz(P,'foreR',-.2);pz(P,'thighL',-1*k*(1-r));pz(P,'shinL',1.6*k*(1-r));pz(P,'thighR',-.3*k*(1-r));pz(P,'shinR',1.3*k*(1-r));pz(P,'armL',.4*k,0,.5*k)},
 // bras écartés qui remontent : la haie sort du sol
 hk_wall:(P,e)=>{const k=ezo(Math.min(1,e/.25)),u2=e>.25?ezo(Math.min(1,(e-.25)/.35)):0;P.root.y=-4*k+4*u2;pz(P,'chest',.4*k-.5*u2);pz(P,'armL',-.6*k-1.6*u2,0,.5*k+.6*u2);pz(P,'armR',-.6*k-1.6*u2,0,-.5*k-.6*u2);pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'thighL',-.6*k*(1-u2));pz(P,'shinL',1*k*(1-u2))},
 // à genoux, les deux mains enfoncent la graine
 hk_plant:(P,e)=>{const k=ezo(Math.min(1,e/.3)),r=e>.7?(e-.7)/.3:0,m=k*(1-r);P.root.y=-9*m;pz(P,'thighL',-1.4*m);pz(P,'shinL',2*m);pz(P,'thighR',.3*m);pz(P,'shinR',1.8*m);pz(P,'chest',.8*m);pz(P,'head',-.3*m);pz(P,'armL',-1.2*m,0,-.3*m);pz(P,'armR',-1.2*m,0,.3*m);pz(P,'foreL',-.3);pz(P,'foreR',-.3)},
 // souffle : la main en porte-voix, puis le bras balaie
 hk_spore:(P,e)=>{if(e<.35){const k=ezo(e/.35);pz(P,'armR',-1.5*k,0,.9*k);pz(P,'foreR',-2.3*k);pz(P,'chest',-.2*k);pz(P,'head',-.2*k)}else{const k=ezo(Math.min(1,(e-.35)/.3));pz(P,'armR',-1.5,0,.9-1.4*k);pz(P,'foreR',-2.3+2.1*k);pz(P,'chest',-.2+.45*k);pz(P,'head',-.2+.35*k);P.root.z=5*k;pz(P,'thighR',-.4*k)}pz(P,'armL',.3,0,.3)},
 // mains jointes, puis ouvertes : la sève enveloppe
 hk_sap:(P,e)=>{const k=ezo(Math.min(1,e/.3)),o=e>.45?ezo(Math.min(1,(e-.45)/.3)):0;pz(P,'armL',-1.3*k+.5*o,0,-.55*k+1.2*o);pz(P,'armR',-1.3*k+.5*o,0,.55*k-1.2*o);pz(P,'foreL',-1.2*k+.9*o);pz(P,'foreR',-1.2*k+.9*o);pz(P,'head',.3*k-.4*o);pz(P,'chest',.1*k-.15*o)},
 // grappin : bras lancé haut vers l'avant, jambes repliées dans l'élan
 hk_swing:(P,e)=>{const k=ezo(Math.min(1,e/.25));pz(P,'armR',-2.6*k,0,.2);pz(P,'foreR',-.1);pz(P,'armL',.6*k,0,.4);pz(P,'chest',-.2*k);pz(P,'thighL',-1.1*k);pz(P,'shinL',1.4*k);pz(P,'thighR',-.4*k);pz(P,'shinR',1.6*k)},
 // fusion : s'accroupit et disparaît en tournant, ressort en se dépliant
 hk_sink:(P,e)=>{if(e<.45){const k=ezo(e/.45);P.root.y=-16*k;pz(P,'thighL',-1.6*k);pz(P,'shinL',2.2*k);pz(P,'thighR',-1.6*k);pz(P,'shinR',2.2*k);pz(P,'chest',.6*k);pz(P,'armL',-.5*k,0,-.9*k);pz(P,'armR',-.5*k,0,.9*k);P.rootR.y=3*k}
  else{const k=ezo(Math.min(1,(e-.45)/.4));P.root.y=-16+16*k;pz(P,'thighL',-1.6+1.6*k);pz(P,'shinL',2.2-2.2*k);pz(P,'thighR',-1.6+1.6*k);pz(P,'shinR',2.2-2.2*k);pz(P,'chest',.6-.8*k);pz(P,'armL',-.5-1.8*k,0,-.9+1.4*k);pz(P,'armR',-.5-1.8*k,0,.9-1.4*k);P.rootR.y=3+3.28*k}},
 // floraison : les deux bras montent au ciel, la terre tremble
 hk_raise:(P,e)=>{const k=ezo(Math.min(1,e/.4)),d=e>.85?(e-.85)/.15:0;pz(P,'armL',-3*k*(1-d),0,.4*k);pz(P,'armR',-3*k*(1-d),0,-.4*k);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'head',-.45*k);pz(P,'chest',-.25*k);P.root.y=2*k;pz(P,'thighL',0,0,.2*k);pz(P,'thighR',0,0,-.2*k)},
 // arbre millénaire : agenouillé, paumes au sol, puis se redresse bras ouverts
 hk_tree:(P,e)=>{if(e<.5){const k=ezo(e/.5);P.root.y=-9*k;pz(P,'thighL',-1.5*k);pz(P,'shinL',2*k);pz(P,'thighR',.2*k);pz(P,'shinR',1.9*k);pz(P,'chest',.9*k);pz(P,'armL',-1.3*k,0,-.2);pz(P,'armR',-1.3*k,0,.2)}
  else{const k=ezo(Math.min(1,(e-.5)/.35));P.root.y=-9+9*k;pz(P,'thighL',-1.5+1.5*k);pz(P,'shinL',2-2*k);pz(P,'thighR',.2-.2*k);pz(P,'shinR',1.9-1.9*k);pz(P,'chest',.9-1.2*k);pz(P,'armL',-1.3-.9*k,0,-.2+1.2*k);pz(P,'armR',-1.3-.9*k,0,.2-1.2*k);pz(P,'head',-.3*k)}},
});
