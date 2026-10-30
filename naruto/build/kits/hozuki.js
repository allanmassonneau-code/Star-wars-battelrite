// ===== Clan Hôzuki (c19, préfixe hz_) : corps liquide (Suigetsu, Mangetsu) =====
// Duelliste évasif : le corps devient eau pour laisser passer les coups (trait Hydrification, réserve d'eau),
// le doigt tire des balles d'eau (Suirendan, Grand jet), le bras gonfle (Gôwan), le corps fond en flaque (Liquéfaction)
// ou devient un géant d'eau (Corps-déluge) ; le grand sabre Kubikiribôchô se reforge avec le sang (vol de vie).
// Contrepartie : le Raiton frappe +25 % et coupe l'hydrification 3 s.
// Combos : Contre-courant étourdit → Gôwan ; Bond fendant ralentit → Fauche ; Suirendan trempe (un allié Raiton en profite).
// Équilibre (duels simulés contre kits quelconques) : kits mixtes 46-52 %, kits 100 % Hôzuki ≈ 70 % (Kaguya 68 %, Sabaku 61 %) ; réglé par les jutsu et les modificateurs des 2 styles.
const HZD={gun:'Deux balles d\'eau tirées du doigt, très rapides : 8 dégâts chacune, trempent la cible',
 ctr:'1 s : le prochain coup subi traverse le corps sans dégâts et une balle d\'eau riposte : 14 dégâts, étourdit 0,4 s (le Raiton passe)',
 arm:'Le bras gonfle d\'eau puis s\'abat devant soi : 28 dégâts, repousse. Avec 50 d\'eau ou plus, en dépense 30 : 36 dégâts, zone plus large',
 jet:'Le doigt se charge 0,3 s puis tire un jet d\'eau qui traverse la ligne : 26 dégâts, repousse, trempe',
 cleave:'Moulinet géant devant soi : 32 dégâts, ralentit ; le sang reforge la lame : rend 30 % des dégâts infligés en PV',
 pud:'Fond en flaque 1 s : intouchable et plus rapide (attaquer reforme le corps) ; se reforme en jaillissant : 14 dégâts autour, ralentit',
 leap:'Bondit au point visé (280 max) et abat le sabre à l\'arrivée : 20 dégâts dans la zone, ralentit',
 behead:'Fonce sur 300 et fend tout sur la ligne : 38 dégâts + 10 % des PV manquants ; la lame boit le sang : rend 30 % des dégâts',
 giant:'4 s : géant d\'eau (dégâts subis −20 %, infligés +20 %) ; inonde autour : 5 dégâts / 0,5 s, ralentit 0,35 s chaque seconde ; remplit la réserve d\'eau. Puis vague : 24 dégâts, repousse'};
KIT('c19',[
 [1,'D','x.hz_gun','Suirendan',HZD.gun,'water'],
 [3,'C','x.hz_ctr','Suika : Contre-courant',HZD.ctr,'water'],
 [4,'B','x.hz_arm','Suika : Gôwan',HZD.arm,'water'],
 [1,'B','x.hz_jet','Mizudeppô : Grand jet',HZD.jet,'water'],
 [3,'A','x.hz_cleave','Kubikiribôchô : Fauche',HZD.cleave,'steel'],
 [2,'C','x.hz_pud','Liquéfaction',HZD.pud,'water'],
 [2,'B','x.hz_leap','Kubikiribôchô : Bond fendant',HZD.leap,'steel'],
 [5,'S','x.hz_behead','Kubikiribôchô : Décapitation',HZD.behead,'steel'],
 [5,'A','x.hz_giant','Suika : Corps-déluge',HZD.giant,'water'],
]);
// ---- styles de combat propres au clan (ajoutés à la fin de STYLES)
STYLES.push(['Kubikiribôchô','Sabre géant aux coups très larges ; 3e coup : ralentit ; 5e : abattu d\'en haut, repousse. Le sang reforge la lame : chaque coup rend 10 % de ses dégâts en PV','x.hz_st_kubi','steel','sword',[19],.97,.94],
 ['Taijutsu liquide','Les bras s\'allongent en eau : longue allonge ; 3e coup : trempe ; 5e : fouet d\'eau qui ramène la cible et ralentit','x.hz_st_liq','tai','fist',[19],1.,.96]);

// ---- petites aides du clan
const HZC={w:'#5ad8f0',l:'#c8f4ff',d:'#1a7aa8',b:'#c8283a',s:'#dfe6ee'}; // eau, écume, eau profonde, sang, acier
const HZ={cost:35,red:.6,reg:3,wet:3,zap:3,min:6}; // trait : coût d'une hydrification, part des dégâts gardée, eau/s, ×trempé, durée du court-circuit, coup minimal
const hzI=u=>units.indexOf(u);
const hzS=(n,u)=>{const V=VFX;VFX=null;S(n,u);VFX=V}; // son brut (hors teinte de l'élément)
const hzMix=(a,b,k)=>{const p=h=>{h=String(h||'#888');if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];const n=parseInt(h.slice(1,7),16);return[n>>16,n>>8&255,n&255]},A=p(a),B=p(b);
 return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
// dégâts réellement infligés (PV + bouclier) pendant f()
function hzDrain(L,f){const H=L.map(e=>e.hp+(e.shield||0));f();let tot=0;L.forEach((e,i)=>{const d=H[i]-(e.hp+(e.shield||0));if(d>.01)tot+=d});return tot}
// le sang reforge la lame : soin = part des dégâts infligés (gain() applique déjà la réduction commune des soins : on la compense pour que le chiffre annoncé soit exact)
function hzReforge(u,tot,k,e){if(tot<=0||u.dead)return;const v=tot*k;gain(u,v/HEALX,u);if(near(u.x,u.y)){say(u,'+'+Math.round(v),'#ff7a8a');if(e)jx({jfx:'hz_blood',ui:hzI(u),ti:hzI(e),x:e.x,y:e.y,t:.5,m:.5})}}

// ---- mécaniques des jutsu
Object.assign(NAT,{
 // Suirendan : deux balles d'eau sous pression tirées du doigt (pistolet à eau)
 hz_gun:SP('Suirendan',HZD.gun,5,{line:{len:550,w:14},ai:RG(540,.7)},(u,a)=>{anim(u,'hz_point',.5);
  const f=o=>{const b=o.aim,h=fwd(o,b,26);hzS('blaster',o);S('water',o);proj(o,b,{spd:1150,r:6,dmg:8,life:.48,col:HZC.w,kind:'hz_drop',vfx:'water'});jx({jfx:'hz_muzzle',x:h.x,y:h.y,a:b,t:.2,m:.2})};
  f(u);seqs.push({owner:u,n:1,t:.14,iv:.14,vfx:'water',f})}),
 // Contre-courant : le prochain coup traverse le corps liquide ; une balle d'eau riposte (voir le trait)
 hz_ctr:SP('Suika : Contre-courant',HZD.ctr,10,{ai:DEF},(u)=>{anim(u,'hz_ctr',.5);S('water',u);u.hz_ctr=1;jx({jfx:'hz_ctrOn',ui:hzI(u),x:u.x,y:u.y,t:.45,m:.45})}),
 // Gôwan : le bras gonfle d'eau (0,35 s) puis s'abat ; la réserve d'eau le rend énorme
 hz_arm:SP('Suika : Gôwan',HZD.arm,10,{tele:{r:105,max:90},ai:RG(150,.6)},(u,a,td)=>{const big=(u.hz_w||0)>=50;if(big){u.hz_w-=30;say(u,'GÔWAN !',HZC.l)}
  const R=big?105:80,dmg=big?36:28,p=fwd(u,a,clamp(td||90,45,90));anim(u,'hz_arm',.75);S('water',u);u.hz_arm=.4;u.hz_armB=big?1:0;
  later(u,.35,()=>{u.hz_arm=0;if(u.dead||u.stun>0)return;const V=VFX;VFX='water';for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<R+e.r)hit(e,u,dmg,{kb:big?330:260,fx:p.x-Math.cos(a)*40,fy:p.y-Math.sin(a)*40});VFX=V;
   jx({jfx:'hz_fist',x:p.x,y:p.y,a,r:R,big:big?1:0,t:.6,m:.6});sparks(p.x,p.y,HZC.l,big?16:10,'water');if(near(p.x,p.y)){hzS('heavy',u);S('water',u);shake=Math.max(shake,big?.3:.2)}},{x:p.x,y:p.y,r:R})}),
 // Grand jet (Mizudeppô) : charge au bout du doigt, puis jet perçant sur toute la ligne
 hz_jet:SP('Mizudeppô : Grand jet',HZD.jet,9,{line:{len:560,w:30},ai:RG(540,.6,110)},(u,a)=>{anim(u,'hz_jet',.65);S('water',u);
  aux.push({type:'hz_jet',x:u.x,y:u.y,a,len:560,w:30,t:.6,m:.6,team:u.team,owner:u,ui:hzI(u),vfx:'water',k:0,n:0})}),
 // Fauche : moulinet du Kubikiribôchô ; le sang des blessés reforge la lame (soin)
 hz_cleave:SP('Kubikiribôchô : Fauche',HZD.cleave,12,{tele:{self:1,r:150},ai:RG(140,.75)},(u,a)=>{anim(u,'hz_cleave',.55);hzS('saber',u);hzS('heavy',u);
  const L=enemies(u).filter(e=>dist(u,e)<150+e.r&&angDiff(ang(u,e),a)<1.35),V=VFX;VFX='steel';const tot=hzDrain(L,()=>{for(const e of L)hit(e,u,32,{slow:1,fx:u.x,fy:u.y})});VFX=V;
  hzReforge(u,tot,.3,L[0]);jx({jfx:'hz_cleave',ui:hzI(u),x:u.x,y:u.y,a,R:150,w:2.7,d:1,bl:tot>0?1:0,big:1,t:.5,m:.5});if(L.length&&near(u.x,u.y))shake=Math.max(shake,.18)}),
 // Liquéfaction : fond en flaque dirigée au clavier, puis se reforme en geyser
 hz_pud:SP('Liquéfaction',HZD.pud,9,{ai:ESC},(u)=>{S('water',u);anim(u,'hz_melt',1);u.hz_pud=1;u.phase=Math.max(u.phase||0,1);u.haste=Math.max(u.haste||0,1);
  aux.push({type:'hz_pud',x:u.x,y:u.y,r:30,t:1,m:1,team:u.team,owner:u,ui:hzI(u),vfx:'water',k:0});jx({jfx:'hz_geyser',x:u.x,y:u.y,r:40,s:.5,t:.45,m:.45})}),
 // Bond fendant : saut, le sabre levé, abattu à l'arrivée
 hz_leap:SP('Kubikiribôchô : Bond fendant',HZD.leap,11,{tele:{r:85,max:280},ai:{mode:'gap',min:120,max:300,p:.5}},(u,a,td)=>{const d=clamp(td||250,60,280),p=fwd(u,a,d);anim(u,'hz_leap',.62);hzS('dash',u);
  later(u,.45,()=>{},{x:p.x,y:p.y,r:85});sparks(u.x,u.y,HZC.l,6,'water');dash(u,a,d,.45,{jump:95,end:()=>hzLand(u,a)})}),
 // Décapitation : ruée en ligne, coup de sabre géant (bonus selon les PV manquants), vol de vie
 hz_behead:ULT('Kubikiribôchô : Décapitation',HZD.behead,{line:{len:300,w:80},ai:{mode:'gap',min:60,max:300,p:.8}},(u,a)=>{anim(u,'hz_behead',.6);hzS('saber',u);hzS('heavy',u);
  u.unstop=Math.max(u.unstop,.45);dash(u,a,300,.3,{});aux.push({type:'hz_behead',x:u.x,y:u.y,a,r:54,t:.55,m:.55,team:u.team,owner:u,ui:hzI(u),vfx:'steel',k:0,hs:new Set()});
  jx({jfx:'hz_behead',ui:hzI(u),x:u.x,y:u.y,a,t:.6,m:.6})}),
 // Corps-déluge : géant d'eau qui inonde autour, puis s'effondre en vague
 hz_giant:ULT('Suika : Corps-déluge',HZD.giant,{tele:{self:1,r:130},ai:SELF(150,.8)},(u)=>{anim(u,'hz_giant',.8);S('water',u);hzS('roar',u);u.giant=Math.max(u.giant||0,4);u.hz_gT=4;u.hz_w=100;
  aux.push({type:'hz_flood',x:u.x,y:u.y,r:130,t:4,m:4,team:u.team,owner:u,ui:hzI(u),vfx:'water',k:.5});jx({jfx:'hz_geyser',x:u.x,y:u.y,r:110,s:1.4,t:.7,m:.7});sparks(u.x,u.y,HZC.l,18,'water');if(near(u.x,u.y))shake=Math.max(shake,.25)}),
 // ---- styles
 // Kubikiribôchô : sabre géant, coups lents et très larges ; [portée, arc, dégâts, recharge] par coup ; chaque coup qui touche rend 10 % de ses dégâts
 hz_st_kubi:SP('Kubikiribôchô','',.5,{hero:'dooku',melee:1,ai:{max:112,p:1}},(u,a)=>{const c=stC(u),T=[0,[112,2.2,13,.5],[112,2.2,13,.52],[118,3,14,.58],[126,.7,14,.52],[122,2.4,17,.78]][c];
  if(c===4)stLunge(u,a,34);if(c===5){stLunge(u,a,40);hzS('dash',u)}
  const L=stIn(u,a,T[0],T[1]),tot=hzDrain(L,()=>stMelee(u,a,T[0],T[1],T[2],c===5?{kb:150}:c===3?{slow:.5}:{},null));hzReforge(u,tot,.1,tot>0?L.find(e=>!e.dead)||L[0]:null);
  jx({jfx:'hz_cleave',ui:hzI(u),x:u.x,y:u.y,a,R:T[0],w:T[1],d:[0,-1,1,-1,0,1][c],thr:c===4?1:0,ov:c===5?1:0,bl:tot>0?1:0,t:.3,m:.3});
  if(c===5){const p=fwd(u,a,T[0]*.7);jx({jfx:'shock',x:p.x,y:p.y,r:70,t:.35,m:.35,col:HZC.s});if(near(p.x,p.y))shake=Math.max(shake,.14)}
  stCd(u,T[3]);anim(u,'hz_k'+c,c===5?.42:.32)}),
 // Taijutsu liquide : poings qui s'allongent en eau ; 3e : coup d'eau (trempe) ; 5e : fouet d'eau qui ramène la cible
 hz_st_liq:SP('Taijutsu liquide','',.42,{hero:'rey',melee:1,ai:{max:104,p:1}},(u,a)=>{const c=stC(u),T=[0,[102,1.4,10,.42],[102,1.4,10,.42],[106,1.6,11,.46],[104,1.5,11,.44],[160,.55,12,.62]][c];
  const o=c===3?{el:1}:c===5?{el:1,pull:380,fx:u.x,fy:u.y,slow:.5}:{};stMelee(u,a,T[0],T[1],T[2],o,null);
  jx({jfx:'hz_wfist',ui:hzI(u),x:u.x,y:u.y,a,R:T[0]*(c===5?1:.92),s:c%2?1:-1,whip:c===5?1:0,big:c===3?1:0,t:c===5?.4:.28,m:c===5?.4:.28});
  if(c>=3){S('water',u);const p=fwd(u,a,T[0]*.8);sparks(p.x,p.y,HZC.l,c===5?8:5,'water')}
  stCd(u,T[3]);anim(u,c===5?'hz_whip':'st_tai'+c,c===5?.4:.28)}),
});
Object.assign(NATHERO,{hz:'kylo'});

// Bond fendant : le sabre s'abat à l'arrivée
function hzLand(u,a){if(u.dead)return;const x=u.x,y=u.y,V=VFX;VFX='steel';for(const e of enemies(u))if(Math.hypot(e.x-x,e.y-y)<85+e.r)hit(e,u,20,{slow:1,fx:x,fy:y});VFX=V;
 jx({jfx:'hz_slam',x:x+Math.cos(a)*30,y:y+Math.sin(a)*30,a,r:85,t:.8,m:.8});jx({jfx:'shock',x,y,r:100,t:.4,m:.4,col:HZC.l});sparks(x,y,HZC.l,12,'water');if(near(x,y)){hzS('heavy',u);hzS('rock',u);shake=Math.max(shake,.22)}}
// Liquéfaction : le corps se reforme en jaillissant
function hzReform(o){const V=VFX;VFX='water';for(const e of enemies(o))if(Math.hypot(e.x-o.x,e.y-o.y)<80+e.r)hit(e,o,14,{slow:1,fx:o.x,fy:o.y});VFX=V;
 jx({jfx:'hz_geyser',x:o.x,y:o.y,r:80,s:1,t:.6,m:.6});jx({jfx:'shock',x:o.x,y:o.y,r:90,t:.35,m:.35,col:HZC.l});sparks(o.x,o.y,HZC.l,12,'water');if(near(o.x,o.y))S('water',o)}

// ---- objets (logique hôte)
// Grand jet : 0,3 s de charge (le lanceur étourdi l'annule), puis le jet frappe toute la ligne une fois
AUXF.hz_jet=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}if(x.n)return;x.x=o.x;x.y=o.y;if(o.stun>0){x.t=0;x.n=2;return}
 if(x.m-x.t<.3)return;x.n=1;const ca=Math.cos(x.a),sa=Math.sin(x.a),V=VFX;VFX='water';
 for(const e of enemies(o)){const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f>0&&f<x.len+e.r&&s<x.w/2+e.r)hit(e,o,26,{kb:150,fx:x.x,fy:x.y})}VFX=V;
 o.kx-=ca*120;o.ky-=sa*120;if(near(x.x,x.y)){hzS('boom',o);S('water',o);shake=Math.max(shake,.16)}sparks(x.x+ca*x.len,x.y+sa*x.len,HZC.l,10,'water')};
// Liquéfaction : la flaque suit le ninja ; à la fin (ou s'il attaque), le corps se reforme
AUXF.hz_pud=x=>{const o=x.owner;if(!o||o.dead){x.t=0;x.done=1;if(o)o.hz_pud=0;return}x.x=o.x;x.y=o.y;if(x.done)return;
 if(x.t<=0||o.swing>0||(o.relT>0&&x.m-x.t>.32)){const r=Math.max(0,x.t)+.05;x.done=1;x.t=0;o.hz_pud=0;if(o.phase<=r)o.phase=0;if(o.haste<=r)o.haste=0;hzReform(o)}};
// Décapitation : la lame frappe une fois chaque ennemi sur la ligne de la ruée
AUXF.hz_behead=x=>{const o=x.owner;if(!o||o.dead||!o.dash){if(!x.done){x.done=1;x.t=0}return}x.x=o.x;x.y=o.y;const ca=Math.cos(x.a),sa=Math.sin(x.a),tx=o.x+ca*28,ty=o.y+sa*28;
 for(const e of enemies(o))if(!x.hs.has(e)&&Math.hypot(e.x-tx,e.y-ty)<x.r+e.r){x.hs.add(e);const V=VFX;VFX='steel';const tot=hzDrain([e],()=>hit(e,o,38,{exec:.1,kb:140,melee:1,fx:o.x-ca*40,fy:o.y-sa*40}));VFX=V;
  hzReforge(o,tot,.3,e);jx({jfx:'hz_spray',x:e.x,y:e.y,a:x.a,t:.6,m:.6});if(near(e.x,e.y)){hzS('boom',o);shake=Math.max(shake,.3)}}};
AUXD.hz_behead=()=>{};
// Corps-déluge : inonde autour du géant toutes les 0,5 s ; à la fin, il s'effondre en vague
AUXF.hz_flood=x=>{const o=x.owner;if(!o||o.dead){x.t=0;x.done=1;if(o)o.hz_gT=0;return}x.x=o.x;x.y=o.y;
 if(x.t<=0){if(!x.done){x.done=1;o.hz_gT=0;const V=VFX;VFX='water';for(const e of enemies(o))if(Math.hypot(e.x-o.x,e.y-o.y)<160+e.r)hit(e,o,24,{kb:260,fx:o.x,fy:o.y});VFX=V;
  jx({jfx:'hz_wave',x:o.x,y:o.y,r:170,t:.8,m:.8});sparks(o.x,o.y,HZC.l,20,'water');if(near(o.x,o.y)){S('water',o);hzS('boom',o);shake=Math.max(shake,.3)}}return}
 if(x.k>0)return;x.k=.5;x.c=(x.c||0)+1;const V=VFX;VFX='water';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)hit(e,o,5,x.c%2?{slow:.35,fx:x.x,fy:x.y}:{fx:x.x,fy:x.y});VFX=V};

// ---- trait de clan : Hydrification (réserve d'eau)
TRAITS[19]={nom:'Hydrification',desc:'Réserve d\'eau : un coup de 6+ dégâts liquéfie le corps et perd 40 % de ses dégâts (coûte 35 d\'eau). L\'eau revient de 3/s (×3 trempé). Le Raiton frappe +25 % et coupe l\'hydrification 3 s.',
 init(u){u.hz_w=100;u.hz_zap=0;u.hz_ctr=0;u.hz_arm=0;u.hz_armB=0;u.hz_pud=0;u.hz_gT=0},
 update(u,dt){if(u.hz_ctr>0)u.hz_ctr-=dt;if(u.hz_arm>0)u.hz_arm-=dt;if(u.hz_pud>0)u.hz_pud-=dt;if(u.hz_gT>0)u.hz_gT-=dt;
  if(u.hz_zap>0)u.hz_zap-=dt;else if(u.hz_w<100)u.hz_w=Math.min(100,u.hz_w+HZ.reg*(u.wet>0?HZ.wet:1)*dt)},
 take(t,src,dmg,o){if(t.hz_w==null)TRAITS[19].init(t);if(!src||src===t||o.silent||o.thorn)return dmg;const el=o.el??ELM[VFX];
  // Raiton : le courant traverse l'eau du corps
  if(el===3){t.hz_zap=HZ.zap;if(near(t.x,t.y)){if(!(t.hz_zsay>SIMT)){say(t,'COURT-CIRCUIT','#ffe14a');t.hz_zsay=SIMT+1}jx({jfx:'hz_zap',ti:hzI(t),x:t.x,y:t.y,t:.5,m:.5})}return dmg*1.25}
  // Contre-courant : le coup traverse, une balle d'eau riposte
  if(t.hz_ctr>0&&!src.dead){t.hz_ctr=0;const a=ang(t,src);jx({jfx:'hz_melt',ti:hzI(t),x:t.x,y:t.y,a:a+Math.PI,big:1,t:.55,m:.55});say(t,'CONTRE-COURANT','#c8f4ff');S('water',t);
   proj(t,a,{spd:1150,r:9,dmg:14,life:.6,col:HZC.w,kind:'hz_drop',big:1,home:1,stun:.4,vfx:'water',noClash:1});return -1}
  if(dmg<HZ.min||t.hz_zap>0||t.hz_w<HZ.cost||t.hz_pud>0)return dmg;
  t.hz_w-=HZ.cost;if(near(t.x,t.y))jx({jfx:'hz_melt',ti:hzI(t),x:t.x,y:t.y,a:ang(src,t),t:.45,m:.45});return dmg*HZ.red},
 draw(u,p,S,sk){const t=performance.now()/1000,s=S*sk;g.save();
  // corps qui se liquéfie (Liquéfaction, Corps-déluge)
  if(u.hz_pud>0)hzBody(p.x,p.y,s,Math.min(1,u.hz_pud*4),t,.85);
  if(u.hz_gT>0)hzBody(p.x,p.y,s*1.35,Math.min(1,u.hz_gT*2)*.8,t,0,1);
  // Contre-courant : coque d'eau qui tourne autour du corps
  if(u.hz_ctr>0){const a=Math.min(1,u.hz_ctr*4),cy=p.y-30*s;g.globalAlpha=a;g.fillStyle=rgba(HZC.w,.16);g.beginPath();g.ellipse(p.x,cy,21*s,34*s,0,0,7);g.fill();g.lineWidth=2*s;
   for(let i=0;i<3;i++){const b=t*4+i*2.1;g.strokeStyle=rgba(i?HZC.l:'#ffffff',.75);g.beginPath();g.ellipse(p.x,cy+Math.sin(b)*10*s,22*s,6.5*s,0,b%6.28,b%6.28+3.6);g.stroke()}g.globalAlpha=1}
  // Gôwan : le bras gonfle d'eau
  if(u.hz_arm>0){const gr=1-Math.max(0,u.hz_arm)/.4,ca=Math.cos(u.aim),sa=Math.sin(u.aim),R=(5+(u.hz_armB?17:12)*ezo(gr))*s,x=p.x+ca*(14+R/s*.5)*s,y=p.y-(33-sa*4)*s+sa*6*s;
   g.fillStyle=rgba(HZC.w,.6);g.strokeStyle=rgba('#ffffff',.85);g.lineWidth=1.6;g.beginPath();g.arc(x,y,R,0,7);g.fill();g.stroke();g.strokeStyle=rgba('#ffffff',.7);g.beginPath();g.arc(x-R*.3,y-R*.3,R*.5,3.5,4.9);g.stroke();
   g.lineWidth=5*s*(.6+gr*.5);g.strokeStyle=rgba(HZC.w,.55);g.lineCap='round';g.beginPath();g.moveTo(p.x+ca*4*s,p.y-36*s);g.lineTo(x,y);g.stroke()}
  // Raiton : étincelles qui crépitent sur le corps (hydrification coupée)
  if(u.hz_zap>0){g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe14a',.8*Math.min(1,u.hz_zap*2));g.lineWidth=1.4;for(let i=0;i<3;i++){const ph=Math.floor(t*14+i*3.7);let x=p.x+Math.sin(ph*1.7)*12*s,y=p.y-(10+((ph*7)%40))*s;g.beginPath();g.moveTo(x,y);for(let j=0;j<4;j++){x+=Math.sin(ph+j*2.3)*6*s;y-=5*s;g.lineTo(x,y)}g.stroke()}g.globalCompositeOperation='source-over'}
  // réserve pleine : de l'eau perle au bout des doigts
  else if((u.hz_w||0)>=HZ.cost&&!u.dead){const k=(t*.9+(u.x%7)*.1)%1,hx=p.x+Math.cos(u.aim)*11*s;g.fillStyle=rgba(HZC.w,.85*(1-k));g.beginPath();g.ellipse(hx,p.y-(22-k*22)*s,1.3*s,2.1*s,0,0,7);g.fill()}
  g.restore()},
 hud(u,x,y){const w=Math.max(0,Math.min(100,u.hz_w||0)),z=u.hz_zap>0,cx=x+10,cy=y-14;
  g.fillStyle=z?'#6a6a40':HZC.w;g.strokeStyle='rgba(10,8,6,.9)';g.lineWidth=1.3;g.beginPath();g.moveTo(cx,cy-8);g.quadraticCurveTo(cx+6,cy,cx+5,cy+3);g.arc(cx,cy+3,5,0,Math.PI);g.quadraticCurveTo(cx-6,cy,cx,cy-8);g.fill();g.stroke();
  g.fillStyle='rgba(10,8,6,.75)';g.fillRect(x+20,y-19,58,10);g.fillStyle=z?'#8a8a50':w>=HZ.cost?HZC.w:'#3a6a80';g.fillRect(x+21,y-18,56*w/100,8);
  g.fillStyle='rgba(10,8,6,.8)';for(const v of[35,70])g.fillRect(x+21+56*v/100,y-18,1,8);if(z)text('ϟ',x+49,y-10,11,'#ffe14a');text('Eau',x+82,y-10,11,HZC.l,'left')}};
AFTER.push(()=>{UK.push('hz_w','hz_zap','hz_ctr','hz_arm','hz_armB','hz_pud','hz_gT')});

// ---- apparence : yeux violets, dents pointues, cheveux décolorés blanc-bleu ; le Kubikiribôchô à la main
CLOOK[19]=(look,l,S)=>{const h=look.head;h.eye='#8a5ad0';h.hz_teeth=1;h.hair=hzMix(h.hair,'#e4f2fa',.72);if(S&&S[0]==='Kubikiribôchô')look.weapon=Object.assign({},look.weapon,{hz:1})};
AFTER.push(()=>{
 // 2D : dents pointues (sourire de requin) par-dessus la bouche
 if(typeof drawNinjaHead==='function'){const DH=drawNinjaHead;drawNinjaHead=function(u,h,fx,fy,back,fl,t,run){DH.apply(this,arguments);if(!h||!h.hz_teeth||back||h.acc==='masque'||h.acc==='anbu'||u.ch.look.collar)return;
  const ex=fx*5,y=-46;g.fillStyle='#4a1820';g.beginPath();g.moveTo(ex-3.2,y-.6);g.quadraticCurveTo(ex,y+2.6,ex+3.2,y-.6);g.closePath();g.fill();g.fillStyle='#ffffff';g.beginPath();for(let i=0;i<4;i++){const x0=ex-3+i*1.5;g.moveTo(x0,y-.5);g.lineTo(x0+.75,y+1.1);g.lineTo(x0+1.5,y-.5)}g.fill()}}
 // 3D : même sourire peint sur la texture du visage (copie mise en cache par texture d'origine)
 if(typeof faceTexture==='function'){const FT=faceTexture,C=new Map();faceTexture=function(L,mode){const b=FT.apply(this,arguments);if(!L||!L.head||!L.head.hz_teeth||!b||!b.image)return b;if(C.has(b.uuid))return C.get(b.uuid);
  const c=document.createElement('canvas');c.width=b.image.width;c.height=b.image.height;const x=c.getContext('2d'),U=9.7,ex=128,my=100+7*U;x.drawImage(b.image,0,0);
  x.fillStyle='#4a1820';x.strokeStyle='#1a1410';x.lineWidth=2.5;x.beginPath();x.moveTo(ex-3.4*U,my-.8*U);x.quadraticCurveTo(ex,my+2.8*U,ex+3.4*U,my-.8*U);x.closePath();x.fill();x.stroke();
  x.fillStyle='#ffffff';x.beginPath();for(let i=0;i<5;i++){const x0=ex-3.1*U+i*1.24*U;x.moveTo(x0,my-.7*U);x.lineTo(x0+.62*U,my+.9*U);x.lineTo(x0+1.24*U,my-.7*U)}x.fill();
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;C.set(b.uuid,tx);return tx}}
 // 2D : le Kubikiribôchô (grande lame carrée, trou rond, encoche au dos)
 if(typeof drawNinjaWeapon==='function'){const DW=drawNinjaWeapon;drawNinjaWeapon=function(u,L,W,k,hf,hb,fx,fy,back,fl,t){if(!W||!W.hz||k!=='sword')return DW.apply(this,arguments);
  const [x,y]=hf,a=Math.atan2(Math.sin(u.aim)*K,Math.cos(u.aim));blob(x,y,3,fl?'#fff':u.ch.look.head.skin);g.save();g.translate(x,y);g.rotate(u.block?a-1.3:a+(u.swing>0?0:.75));
  g.fillStyle=fl?'#fff':'#2a3a48';g.fillRect(-9,-1.8,11,3.6);g.strokeStyle='#8aa0b0';g.lineWidth=.7;g.beginPath();for(let i=-8;i<1;i+=2.5){g.moveTo(i,-1.8);g.lineTo(i+1.5,1.8)}g.stroke();g.translate(2,0);hzBlade(34,10.5,fl);g.restore()}}
 // 3D : la lame (boîte large, trou rond et encoche sombres) accrochée à la main droite, sur le sabre du moteur
 if(typeof buildNinja3D==='function'){const BN=buildNinja3D;buildNinja3D=function(u){const rec=BN.apply(this,arguments);try{const W=u.ch&&u.ch.look.weapon;if(W&&W.hz&&rec&&rec.bones)hzCleaver3D(rec)}catch(e){}return rec}}
});
const HZ3={};
function hzCleaver3D(rec){const T=THREE;if(!HZ3.g){HZ3.g=1;HZ3.blade=new T.BoxGeometry(9.5,1,30);HZ3.hole=new T.CylinderGeometry(2.4,2.4,1.25,14);HZ3.notch=new T.CylinderGeometry(2,2,1.25,12,1,false,0,Math.PI);HZ3.tip=new T.BoxGeometry(9.5,1.05,1.2);
  HZ3.steel=new T.MeshToonMaterial({color:new T.Color(HZC.s),gradientMap:N3.gm});HZ3.edge=new T.MeshToonMaterial({color:new T.Color('#ffffff'),gradientMap:N3.gm});HZ3.dark=new T.MeshBasicMaterial({color:new T.Color('#141a22')})}
 const G=new T.Group(),add=(geo,mat,x,y,z,ry)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);if(ry)m.rotation.y=ry;G.add(m);return m};
 add(HZ3.blade,HZ3.steel,-3,0,0);const o=add(HZ3.blade,N3.outline,-3,0,0);o.renderOrder=-1;add(HZ3.tip,HZ3.edge,-3,0,15.2);
 add(HZ3.hole,HZ3.dark,-2.2,0,10.5);add(HZ3.notch,HZ3.dark,-7.8,0,6,Math.PI/2);
 G.position.set(0,-1,24);G.rotation.z=Math.PI/2*.8;rec.bones[BI.handR].add(G)}
// lame du Kubikiribôchô le long de +x (L longueur, W largeur ; dos en −y, tranchant en +y)
function hzBlade(L,W,fl){const h=W/2;g.fillStyle=fl?'#fff':HZC.s;g.strokeStyle=OUT;g.lineWidth=1.3;g.beginPath();g.moveTo(0,-h*.7);g.lineTo(L*.66,-h);g.arc(L*.76,-h,W*.18,Math.PI,0,true);g.lineTo(L,-h);g.lineTo(L,h);g.lineTo(0,h*.8);g.closePath();g.fill();g.stroke();
 g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1;g.beginPath();g.moveTo(2,h*.55);g.lineTo(L-1,h*.7);g.stroke();g.fillStyle='#1a1e26';g.beginPath();g.arc(L*.84,h*.1,W*.2,0,7);g.fill();g.strokeStyle=OUT;g.stroke()}
// silhouette d'eau d'un ninja (pieds en x,y ; s échelle ; a opacité ; sl affaissement 0 → 1 = flaque ; gt : géant, bulles)
function hzBody(x,y,s,a,t,sl,gt){const h=(64-50*sl)*s,w=(14+16*sl)*s,wb=Math.sin(t*7)*1.5*s;g.save();g.globalAlpha*=a;g.fillStyle=rgba(HZC.w,gt?.28:.42);g.strokeStyle=rgba(HZC.l,.85);g.lineWidth=1.4;
 g.beginPath();g.moveTo(x-w,y);g.bezierCurveTo(x-w*1.05+wb,y-h*.55,x-w*.55,y-h*.78,x-w*.5,y-h*.86);g.arc(x,y-h*.86,w*.5,Math.PI,0);g.bezierCurveTo(x+w*.55,y-h*.78,x+w*1.05-wb,y-h*.55,x+w,y);g.closePath();g.fill();g.stroke();
 g.strokeStyle=rgba('#ffffff',.75);g.lineWidth=1.6;g.beginPath();g.moveTo(x-w*.62,y-h*.25);g.quadraticCurveTo(x-w*.8,y-h*.6,x-w*.32,y-h*.92);g.stroke();
 for(let i=0;i<(gt?6:3);i++){const k=(t*(gt?.9:1.6)+i*.37)%1;circ(x+Math.sin(i*2.4+t)*w*.55,y-h*(.1+.8*k),(gt?2.6:1.6)*s*(1-k*.4),rgba('#ffffff',.7*(1-k)))}
 g.fillStyle=rgba(HZC.d,.35);g.beginPath();g.ellipse(x,y,w*1.25,w*.4,0,0,7);g.fill();g.restore()}
// goutte (pointe vers +x)
function hzDropS(x,y,r,a,c){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=c;g.beginPath();g.moveTo(r*2.2,0);g.quadraticCurveTo(r*.4,-r,0,-r);g.arc(0,0,r,-Math.PI/2,Math.PI/2,true);g.quadraticCurveTo(r*.4,r,r*2.2,0);g.fill();g.restore()}

// ---- dessins
// balle d'eau : goutte étirée, reflet blanc, traînée d'écume
PROJD.hz_drop=(p,R,ra,t)=>{const b=p.big?1.5:1;g.rotate(ra);g.scale(b,b);g.strokeStyle=rgba(HZC.l,.55);g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-34,0);g.lineTo(-8,0);g.stroke();
 g.strokeStyle=rgba('#ffffff',.5);g.lineWidth=1.2;g.beginPath();g.moveTo(-24,-3+Math.sin(t/30)*1.5);g.lineTo(-6,-2);g.moveTo(-20,3);g.lineTo(-6,2);g.stroke();
 g.fillStyle=HZC.w;g.strokeStyle='rgba(10,40,60,.75)';g.lineWidth=1.1;g.beginPath();g.moveTo(9,0);g.quadraticCurveTo(2,-5,-5,-4.2);g.quadraticCurveTo(-9,0,-5,4.2);g.quadraticCurveTo(2,5,9,0);g.fill();g.stroke();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(2,-1.6,2.6,1.1,0,0,7);g.fill()};
// éclat au bout du doigt
JFXD.hz_muzzle=(f,k,e)=>{const q=P(f.x,f.y,34),a=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));g.globalAlpha=k;g.strokeStyle=rgba(HZC.l,.9);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,(4+e*14)*q.s,(2+e*7)*q.s,a+Math.PI/2,0,7);g.stroke();
 for(let i=0;i<5;i++){const b=a+(i-2)*.35,d=(6+e*26)*q.s;hzDropS(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d-e*e*10*q.s,2*q.s,b,rgba(i%2?HZC.w:'#ffffff',.9))}};
// hydrification : le coup passe à travers un corps d'eau (trou, ondes, gerbe dans le sens du coup)
JFXD.hz_melt=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,tg.z||0),s=q.s*1.3*(tg.giant>0?1.35:1),cy=q.y-32*s,a=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),B=f.big?1.4:1;
 hzBody(q.x,q.y,s,Math.min(1,k*2.2)*.9,t,0);g.save();g.globalAlpha=Math.min(1,k*2);g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=1.6;
 for(let i=0;i<2;i++){const r=(3+e*(14+i*9))*s*B;g.beginPath();g.ellipse(q.x+Math.cos(a)*(4+e*10)*s,cy,r*.45,r*.85,0,0,7);g.stroke()}
 for(let i=0;i<7;i++){const b=a+(i-3)*.28,d=(8+e*(30+i%3*8))*s*B;hzDropS(q.x+Math.cos(b)*d,cy+Math.sin(b)*d*.6-Math.sin(Math.PI*e)*8*s+e*e*14*s,2.2*s,b,rgba(i%2?HZC.w:HZC.l,.9))}g.restore()};
// Raiton sur un corps d'eau : décharge jaune
JFXD.hz_zap=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,tg.z||0),s=q.s*1.3;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe14a',.95*k);g.lineWidth=2;
 for(let i=0;i<4;i++){let x=q.x+(i-1.5)*8*s,y=q.y-4*s;g.beginPath();g.moveTo(x,y);const ph=Math.floor(t*30)+i*7;for(let j=0;j<5;j++){x+=Math.sin(ph*1.3+j*2.1)*7*s;y-=11*s;g.lineTo(x,y)}g.stroke()}
 g.fillStyle=rgba('#fff6a0',.25*k);g.beginPath();g.ellipse(q.x,q.y-30*s,22*s,36*s,0,0,7);g.fill()};
// Contre-courant : l'eau enveloppe le corps
JFXD.hz_ctrOn=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s*1.3;g.strokeStyle=rgba(HZC.l,.9*k);g.lineWidth=3*k+1;for(let i=0;i<2;i++){g.beginPath();g.ellipse(q.x,q.y-(4+e*50+i*12)*s,(26-e*8)*s,(8-e*2)*s,0,0,7);g.stroke()}
 for(let i=0;i<8;i++){const b=i*.785+e*3;circ(q.x+Math.cos(b)*(30-e*16)*s,q.y-(6+e*46)*s+Math.sin(b)*6*s,2*s,rgba('#ffffff',.8*k))}};
// Gôwan : le poing d'eau géant s'écrase
JFXD.hz_fist=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r*s,dz=(1-ezo(Math.min(1,e/.22)))*80*s,sq=e<.22?1:1+Math.sin(Math.min(1,(e-.22)/.3)*Math.PI)*.25,a=Math.min(1,k*2.5);
 // flaque et anneau d'onde
 g.fillStyle=rgba(HZC.w,.25*a);g.beginPath();g.ellipse(q.x,q.y,R*(.5+e*.7),R*(.5+e*.7)*K,0,0,7);g.fill();g.strokeStyle=rgba('#ffffff',.8*a);g.lineWidth=3*k+1;g.beginPath();g.ellipse(q.x,q.y,R*(.3+e*.9),R*(.3+e*.9)*K,0,0,7);g.stroke();
 // poing d'eau (sphère aplatie à l'impact) + jointures
 const fr=R*.62*(f.big?1.1:1);if(e<.75){const fa=Math.min(1,(.75-e)/.25),cy=q.y-fr*.6/sq-dz;g.globalAlpha=fa;g.fillStyle=rgba(HZC.w,.72);g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=2;g.beginPath();g.ellipse(q.x,cy,fr*sq,fr/sq*.85,0,0,7);g.fill();g.stroke();
  g.strokeStyle=rgba(HZC.d,.6);g.lineWidth=1.6;for(let i=-1;i<=1;i++){g.beginPath();g.arc(q.x+i*fr*.42,cy-fr*.35,fr*.2,Math.PI,0);g.stroke()}g.strokeStyle=rgba('#ffffff',.8);g.beginPath();g.arc(q.x-fr*.35,cy-fr*.1,fr*.4,3.6,4.8);g.stroke();g.globalAlpha=1}
 // gerbes
 if(e>.15)for(let i=0;i<12;i++){const b=i*.5236+.2,d=R*(.3+(e-.15)*1.3),hh=Math.sin(Math.min(1,(e-.15)/.7)*Math.PI)*(30+(i%3)*12)*s;hzDropS(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-hh,2.6*s,b-.9,rgba(i%2?HZC.w:HZC.l,.9*a))}};
// Grand jet : charge (fine ligne, eau qui s'amasse au doigt), puis jet épais qui s'efface
AUXD.hz_jet=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),el=x.m-x.t,o=units[x.ui],z=30,h=P(x.x+ca*24,x.y+sa*24,z),E=P(x.x+ca*x.len,x.y+sa*x.len,z),hw=x.w/2;
 if(!x.n){const c=Math.min(1,el/.3);g.strokeStyle=rgba(HZC.l,.5);g.lineWidth=1.5;g.setLineDash([8,8]);g.lineDashOffset=-t*80;g.beginPath();g.moveTo(h.x,h.y);g.lineTo(E.x,E.y);g.stroke();g.setLineDash([]);
  g.fillStyle=rgba(HZC.w,.25*c);const A=P(x.x-sa*hw,x.y+ca*hw,0),Bq=P(x.x+sa*hw,x.y-ca*hw,0),Cq=P(x.x+ca*x.len+sa*hw,x.y+sa*x.len-ca*hw,0),D=P(x.x+ca*x.len-sa*hw,x.y+sa*x.len+ca*hw,0);poly([A,Bq,Cq,D],rgba(HZC.w,.12*c));
  g.fillStyle=rgba(HZC.w,.8);g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=1.5;g.beginPath();g.arc(h.x,h.y,(3+9*c)*h.s,0,7);g.fill();g.stroke();
  for(let i=0;i<6;i++){const b=i*1.05+t*6,d=(1-((t*3+i/6)%1))*26*h.s;circ(h.x+Math.cos(b)*d,h.y+Math.sin(b)*d*.7,1.8*h.s,rgba(HZC.l,.9))}return}
 if(x.n!==1)return;const f=Math.max(0,Math.min(1,x.t/(x.m-.3))),W=hw*1.25*h.s*(.45+.55*f),ra=Math.atan2(E.y-h.y,E.x-h.x),L=Math.hypot(E.x-h.x,E.y-h.y);g.save();g.translate(h.x,h.y);g.rotate(ra);
 g.fillStyle=rgba(HZC.w,.55*f);g.beginPath();g.moveTo(0,-W*.5);g.lineTo(L,-W);g.quadraticCurveTo(L+W*1.2,0,L,W);g.lineTo(0,W*.5);g.closePath();g.fill();
 g.fillStyle=rgba('#ffffff',.85*f);g.beginPath();g.moveTo(0,-W*.18);g.lineTo(L,-W*.35);g.lineTo(L,W*.35);g.lineTo(0,W*.18);g.closePath();g.fill();
 g.strokeStyle=rgba(HZC.l,.8*f);g.lineWidth=1.5;for(let i=0;i<8;i++){const p0=((t*900+i*137)%L),w0=((i*53)%10-5)/5*W*.8;g.beginPath();g.moveTo(p0,w0);g.lineTo(p0+30,w0*.9);g.stroke()}
 for(let i=0;i<6;i++){const b=(i-2.5)*.5,d=(8+(1-f)*30)*h.s;hzDropS(L+Math.cos(b)*d,Math.sin(b)*d,2.4*h.s,b,rgba('#ffffff',.85*f))}g.restore()};
// sabre : traînée large (balayage d = ±1, estoc thr, coup d'en haut ov), lame carrée dessinée sur la traînée, gouttes de sang si le coup a porté
JFXD.hz_cleave=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,pr=Math.min(1,e/(f.big?.4:.45)),R=f.R,ca=Math.cos(f.a),sa=Math.sin(f.a),z0=f.big?26:30,al=e<.45?1:Math.max(0,k/.55);g.globalAlpha=al;
 const W=(o,ph,r,z)=>P(o.x+Math.cos(ph)*r,o.y+Math.sin(ph)*r,z);
 if(f.ov){// coup d'en haut : la lame tombe dans le plan vertical de la visée
  const th=Math.PI/2*(1-ezo(pr)),bl=(r,zz)=>P(o.x+ca*r*Math.cos(th),o.y+sa*r*Math.cos(th),z0+zz+r*Math.sin(th));
  const arc=r=>{const L=[];for(let i=0;i<=10;i++){const tt=Math.PI/2*(1-i/10*ezo(pr));L.push(P(o.x+ca*r*Math.cos(tt),o.y+sa*r*Math.cos(tt),z0+r*Math.sin(tt)))}return L},A1=arc(R),A2=arc(R*.5);g.fillStyle=rgba(HZC.l,.4);g.beginPath();A1.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=10;i>=0;i--)g.lineTo(A2[i].x,A2[i].y);g.closePath();g.fill();g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=2;g.beginPath();A1.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
  const A=bl(R*.25,-5),B2=bl(R,-5),C=bl(R,5),D=bl(R*.25,5);g.fillStyle=HZC.s;g.strokeStyle=OUT;g.lineWidth=1.4;poly([A,B2,C,D],HZC.s);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B2.x,B2.y);g.lineTo(C.x,C.y);g.lineTo(D.x,D.y);g.closePath();g.stroke();
  const hq=bl(R*.84,0);circ(hq.x,hq.y,3*hq.s,'#1a1e26');}
 else if(f.thr){// estoc : la lame jaillit tout droit
  const r1=R*(.3+.7*ezo(pr)),n=-sa,m=ca,pt=(r,s)=>P(o.x+ca*r+n*s,o.y+sa*r+m*s,z0);g.fillStyle=rgba(HZC.l,.4);poly([pt(10,-14),pt(r1+20,0),pt(10,14)],rgba(HZC.l,.35));
  const A=pt(r1-R*.6,-5.5),B2=pt(r1,-5.5),C=pt(r1,5.5),D=pt(r1-R*.6,5.5);poly([A,B2,C,D],HZC.s);g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B2.x,B2.y);g.lineTo(C.x,C.y);g.lineTo(D.x,D.y);g.closePath();g.stroke();const hq=pt(r1-R*.1,1.5);circ(hq.x,hq.y,2.6*hq.s,'#1a1e26')}
 else{// balayage : croissant d'acier pâle + lame au bord d'attaque
  const w=Math.min(f.w,6.28),d=f.d||1,N=18,a0=f.a-d*w/2,cur=a0+d*w*ezo(pr),pts=[],ins=[];for(let i=0;i<=N;i++){const ph=a0+(cur-a0)*i/N,q=i/N;pts.push(W(o,ph,R,z0));ins.push(W(o,ph,R*(1-.45*q),z0))}
  g.fillStyle=rgba(HZC.l,.42);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=N;i>=0;i--)g.lineTo(ins[i].x,ins[i].y);g.closePath();g.fill();g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
  if(e<.6){const n=-Math.sin(cur),m=Math.cos(cur),bw=(f.big?7:5.5),pt=(r,s)=>P(o.x+Math.cos(cur)*r+n*s*d,o.y+Math.sin(cur)*r+m*s*d,z0),A=pt(R*.3,-bw),B2=pt(R,-bw),C=pt(R,bw),D=pt(R*.3,bw);
   poly([A,B2,C,D],HZC.s);g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B2.x,B2.y);g.lineTo(C.x,C.y);g.lineTo(D.x,D.y);g.closePath();g.stroke();const hq=pt(R*.85,-1);circ(hq.x,hq.y,(f.big?3.4:2.6)*hq.s,'#1a1e26')}}
 if(f.bl&&e>.25)for(let i=0;i<(f.big?10:5);i++){const b=f.a+(i-(f.big?4.5:2))*.22,dd=R*(.75+(e-.25)*.6),p=P(o.x+Math.cos(b)*dd,o.y+Math.sin(b)*dd,z0+18*Math.sin(Math.PI*Math.min(1,(e-.25)/.75))-e*10);circ(p.x,p.y,(2.4-(i%3)*.5)*p.s,rgba(i%2?HZC.b:'#ff5a6a',.9*k))}};
// le sang de la cible file vers la lame
JFXD.hz_blood=(f,k,e,t,u,tg)=>{if(!u||u.dead||!tg)return;const a=P(tg.x,tg.y,30),b=P(u.x,u.y,34);for(let i=0;i<6;i++){const s=Math.min(1,Math.max(0,e*1.6-i*.1)),x=lerp(a.x,b.x,s),y=lerp(a.y,b.y,s)-Math.sin(Math.PI*s)*24*a.s;if(s>0&&s<1)circ(x,y,(2.6-i*.25)*a.s,rgba(i%2?HZC.b:'#ff5a6a',.9))}
 if(e>.55){g.strokeStyle=rgba('#ff7a8a',.8*k);g.lineWidth=2;g.beginPath();g.ellipse(b.x,b.y-4*b.s,16*b.s*(1+e*.4),6*b.s,0,0,7);g.stroke()}};
// Bond fendant : le sabre planté, sol fendu, gerbe d'eau
JFXD.hz_slam=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s,a=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),al=Math.min(1,k*2.5);g.globalAlpha=al;
 g.strokeStyle='rgba(30,22,16,.75)';g.lineWidth=2.4;g.beginPath();for(let i=0;i<6;i++){const b=a+(i-2.5)*.6;let x=q.x,y=q.y;g.moveTo(x,y);for(let j=1;j<=3;j++){x=q.x+Math.cos(b+(j%2?.2:-.2))*f.r*.28*j*s;y=q.y+Math.sin(b+(j%2?.2:-.2))*f.r*.28*j*s*K;g.lineTo(x,y)}}g.stroke();
 g.save();g.translate(q.x,q.y);g.rotate(-Math.PI/2+Math.cos(f.a)*.25);g.scale(s*1.3,s*1.3);hzBlade(36*Math.min(1,e*8),11,0);g.restore();
 for(let i=0;i<10;i++){const b=i*.628,d=f.r*(.2+e*.8)*s,hh=Math.sin(Math.min(1,e*1.4)*Math.PI)*(24+(i%3)*10)*s;hzDropS(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-hh,2.4*s,b-1,rgba(i%2?HZC.w:HZC.l,.9))}};
// geyser : le corps liquide jaillit (s = taille)
JFXD.hz_geyser=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s*(f.s||1),H=Math.sin(Math.PI*Math.min(1,e*1.3))*70*s,al=Math.min(1,k*2);g.globalAlpha=al;
 g.fillStyle=rgba(HZC.w,.25);g.beginPath();g.ellipse(q.x,q.y,f.r*q.s*(.6+e*.5),f.r*q.s*(.6+e*.5)*K,0,0,7);g.fill();
 g.fillStyle=rgba(HZC.w,.6);g.strokeStyle=rgba('#ffffff',.85);g.lineWidth=1.6;g.beginPath();g.moveTo(q.x-14*s,q.y);g.quadraticCurveTo(q.x-6*s,q.y-H*.6,q.x-3*s,q.y-H);g.quadraticCurveTo(q.x,q.y-H-8*s,q.x+3*s,q.y-H);g.quadraticCurveTo(q.x+6*s,q.y-H*.6,q.x+14*s,q.y);g.closePath();g.fill();g.stroke();
 for(let i=0;i<10;i++){const b=i*.628+.3,d=(6+e*f.r*.8)*s,hh=H*(.4+.5*((i*7)%5)/5)*(1-e*.3);hzDropS(q.x+Math.cos(b)*d,q.y-hh+Math.sin(b)*d*.4+e*e*30*s,2.4*s,b-1.2,rgba(i%2?HZC.w:'#ffffff',.9))}};
// flaque (Liquéfaction) : suit le ninja, ondes et sillage
AUXD.hz_pud=(x,k,t)=>{if(x.done)return;const q=P(x.x,x.y,0),s=q.s,r=x.r*s,o=units[x.ui];
 g.fillStyle=rgba(HZC.d,.55*k);g.beginPath();g.ellipse(q.x,q.y,r*1.5,r*.6,0,0,7);g.fill();g.fillStyle=rgba(HZC.w,.6*k);g.beginPath();g.ellipse(q.x,q.y-1,r*1.25,r*.48,0,0,7);g.fill();
 g.strokeStyle=rgba('#ffffff',.75*k);g.lineWidth=1.4;for(let i=0;i<2;i++){const ph=(t*1.8+i*.5)%1;g.beginPath();g.ellipse(q.x,q.y,r*(.4+ph*1.2),r*(.4+ph*1.2)*.4,0,0,7);g.globalAlpha=1-ph;g.stroke()}g.globalAlpha=1;
 if(o&&o.moving){const a=o.aim,b=Math.atan2(o.vy||Math.sin(a),o.vx||Math.cos(a));for(let i=1;i<4;i++){const p=P(x.x-Math.cos(b)*i*16,x.y-Math.sin(b)*i*16,0);g.fillStyle=rgba(HZC.w,(.4-i*.1)*k);g.beginPath();g.ellipse(p.x,p.y,(r*1.1-i*3*s),(r*.42-i*s),0,0,7);g.fill()}}};
// Corps-déluge : sol inondé autour du géant
AUXD.hz_flood=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba(HZC.w,.16*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.strokeStyle=rgba(HZC.l,.6*k);g.lineWidth=2;g.setLineDash([12,8]);g.lineDashOffset=-t*40;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.setLineDash([]);
 for(let i=0;i<3;i++){const ph=(t*.8+i/3)%1;g.strokeStyle=rgba('#ffffff',.5*(1-ph)*k);g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y,R*ph,R*ph*K,0,0,7);g.stroke()}
 for(let i=0;i<8;i++){const b=i*.785+t*.6,d=R*.85,y0=q.y+Math.sin(b)*d*K,x0=q.x+Math.cos(b)*d,h=(6+Math.sin(t*5+i)*4)*q.s;g.fillStyle=rgba(HZC.l,.6*k);g.beginPath();g.moveTo(x0-6*q.s,y0);g.quadraticCurveTo(x0,y0-h*2,x0+6*q.s,y0);g.fill()}};
// Corps-déluge : la vague finale
JFXD.hz_wave=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s*(.25+ezo(e)*.85),H=Math.sin(Math.PI*Math.min(1,e*1.2))*34*q.s;g.globalAlpha=Math.min(1,k*2);
 g.fillStyle=rgba(HZC.w,.35);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.strokeStyle=rgba(HZC.w,.8);g.lineWidth=H*.5+2;g.beginPath();g.ellipse(q.x,q.y-H*.5,R,R*K,0,Math.PI,0);g.stroke();
 g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y-H,R*.98,R*.98*K,0,Math.PI,0);g.stroke();g.strokeStyle=rgba(HZC.l,.85);g.lineWidth=H*.4+2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,Math.PI);g.stroke()};
// Décapitation : lame géante qui balaie au bout de la ruée, gerbe de sang
JFXD.hz_behead=(f,k,e,t,u)=>{if(!u||u.dead)return;const pr=Math.min(1,e/.55),ca=Math.cos(f.a),sa=Math.sin(f.a),R=150,z0=30,cur=f.a+1.6-3.2*ezo(pr),o=u;
 const s0=P(f.x,f.y,z0),s1=P(u.x,u.y,z0);g.strokeStyle=rgba(HZC.l,.5*k);g.lineWidth=10*s0.s;g.lineCap='round';g.beginPath();g.moveTo(s0.x,s0.y);g.lineTo(s1.x,s1.y);g.stroke();
 const pts=[],ins=[];for(let i=0;i<=16;i++){const ph=f.a+1.6+(cur-f.a-1.6)*i/16;pts.push(P(o.x+Math.cos(ph)*R,o.y+Math.sin(ph)*R,z0));ins.push(P(o.x+Math.cos(ph)*R*.45,o.y+Math.sin(ph)*R*.45,z0))}
 g.globalAlpha=Math.min(1,k*2);g.fillStyle=rgba('#ffffff',.45);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=16;i>=0;i--)g.lineTo(ins[i].x,ins[i].y);g.closePath();g.fill();
 g.strokeStyle=rgba(HZC.b,.85);g.lineWidth=3;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
 if(e<.75){const n=-Math.sin(cur),m=Math.cos(cur),pt=(r,s)=>P(o.x+Math.cos(cur)*r+n*s,o.y+Math.sin(cur)*r+m*s,z0),A=pt(R*.3,-10),B2=pt(R*1.02,-10),C=pt(R*1.02,10),D=pt(R*.3,10);poly([A,B2,C,D],HZC.s);g.strokeStyle=OUT;g.lineWidth=1.6;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B2.x,B2.y);g.lineTo(C.x,C.y);g.lineTo(D.x,D.y);g.closePath();g.stroke();
  const hq=pt(R*.86,-2);circ(hq.x,hq.y,5*hq.s,'#1a1e26');g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.4;const e1=pt(R*.32,8),e2=pt(R,8);g.beginPath();g.moveTo(e1.x,e1.y);g.lineTo(e2.x,e2.y);g.stroke()}};
// gerbe de sang de la Décapitation
JFXD.hz_spray=(f,k,e)=>{const q=P(f.x,f.y,34);for(let i=0;i<12;i++){const b=f.a+(i-5.5)*.22,d=(10+e*(50+(i%4)*14))*q.s;circ(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-Math.sin(Math.PI*e)*26*q.s+e*e*20*q.s,(3-(i%3)*.6)*q.s*k+1,rgba(i%2?HZC.b:'#ff5a6a',.9*k))}};
// Taijutsu liquide : le bras s'allonge en tube d'eau jusqu'au poing (fouet au 5e coup)
JFXD.hz_wfist=(f,k,e,t,u)=>{if(!u||u.dead)return;const ex=Math.sin(Math.PI*Math.min(1,e*1.4)),a=u.aim,sd=f.s*6,R=f.R*ex,ca=Math.cos(a),sa=Math.sin(a),n=-sa,m=ca,h=P(u.x+ca*10+n*sd,u.y+sa*10+m*sd,34),q=P(u.x+ca*R+n*sd*.3,u.y+sa*R+m*sd*.3,f.whip?24:32);if(R<8)return;
 g.lineCap='round';const wv=f.whip?Math.sin(t*30)*8*h.s:0,mx=(h.x+q.x)/2-sa*wv,my=(h.y+q.y)/2+ca*wv;
 g.strokeStyle=rgba(HZC.d,.55);g.lineWidth=(f.whip?5:7)*h.s;g.beginPath();g.moveTo(h.x,h.y);g.quadraticCurveTo(mx,my,q.x,q.y);g.stroke();g.strokeStyle=rgba(HZC.w,.8);g.lineWidth=(f.whip?3.4:5)*h.s;g.stroke();g.strokeStyle=rgba('#ffffff',.8);g.lineWidth=1.2*h.s;g.stroke();
 const fr=(f.whip?4:f.big?8:6)*q.s;g.fillStyle=rgba(HZC.w,.85);g.strokeStyle=rgba('#ffffff',.9);g.lineWidth=1.4;g.beginPath();g.arc(q.x,q.y,fr,0,7);g.fill();g.stroke();
 if(e>.3)for(let i=0;i<4;i++){const b=a+(i-1.5)*.5,d=(4+e*16)*q.s;hzDropS(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6,1.8*q.s,b,rgba(HZC.l,.85*k))}};

// ---- animations 3D
Object.assign(ANIM,{
 // Suirendan : bras tendu, doigt pointé, l'autre main tient le poignet ; petit recul à chaque balle
 hz_point:(P,e)=>{const k=ezo(Math.min(1,e/.15)),rc=[.05,.33].reduce((s,t0)=>s+Math.max(0,1-Math.abs(e-t0)/.08),0);
  pz(P,'armR',-1.6*k+.25*rc,0,.05);pz(P,'foreR',-.05);pz(P,'armL',-1.15*k,0,-.42*k);pz(P,'foreL',-.95*k);pz(P,'chest',.05,.3*k);pz(P,'head',0,-.2*k);P.root.z=-1.5*rc;pz(P,'thighL',-.3);pz(P,'thighR',.25);pz(P,'shinR',.3)},
 // Contre-courant : garde basse, bras croisés, le corps ondule
 hz_ctr:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.2)),w=Math.sin(t*12)*.12;pz(P,'armL',-1.1*k,0,-.6*k);pz(P,'foreL',-1.5*k);pz(P,'armR',-1.1*k,0,.6*k);pz(P,'foreR',-1.5*k);pz(P,'chest',.25*k,0,w);P.root.y=-4*k;P.rootR.z=w*.5;
  pz(P,'thighL',-.45*k,0,.15);pz(P,'shinL',.8*k);pz(P,'thighR',-.2*k,0,-.15);pz(P,'shinR',.7*k)},
 // Gôwan : bras armé haut derrière, puis abattu devant soi
 hz_arm:(P,e)=>{if(e<.47){const k=ezo(e/.47);pz(P,'armR',-2.7*k,0,-.45*k);pz(P,'foreR',-1.1*k);pz(P,'chest',-.25*k,-.5*k);pz(P,'armL',-.6*k,0,.5*k);P.root.z=-3*k;pz(P,'thighR',.3*k);pz(P,'thighL',-.4*k);pz(P,'shinL',.4*k)}
  else{const k=ezo(Math.min(1,(e-.47)/.18)),r=e>.8?1-(e-.8)/.2:1;pz(P,'armR',(-2.7+1.55*k)*r,0,-.45+.4*k);pz(P,'foreR',-1.1+1.05*k);pz(P,'chest',(-.25+.8*k)*r,(-.5+.85*k)*r);pz(P,'armL',.5*k,0,.6);P.root.z=(-3+11*k)*r;P.root.y=-6*k*r;
   pz(P,'thighL',-1*k*r);pz(P,'shinL',.9*k*r);pz(P,'thighR',.5*k*r);pz(P,'shinR',.5*k*r)}},
 // Grand jet : deux mains jointes, index tendu ; recul quand le jet part
 hz_jet:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.15)),sh=e<.46?Math.sin(t*60)*.03:0,rc=Math.max(0,1-Math.abs(e-.5)/.12);pz(P,'armR',-1.57*k+sh+.3*rc,0,.12);pz(P,'foreR',-.05);pz(P,'armL',-1.5*k+.3*rc,0,-.28);pz(P,'foreL',-.35);
  pz(P,'chest',.1-.15*rc,.1);P.root.z=-4*rc;P.root.y=-3*k;pz(P,'thighL',-.5*k);pz(P,'shinL',.6*k);pz(P,'thighR',.4*k);pz(P,'shinR',.5*k)},
 // Fauche : armé à droite, grand balayage horizontal à deux mains
 hz_cleave:(P,e,u)=>{const k=stH(e,.35,.62);stSweep(P,'R',k,-1.1,2.5,.1);pz(P,'handR',1.4);pz(P,'armL',-1.2,0,.2);pz(P,'foreL',-1);P.rootR.y=lerp(.75,-.85,ezo(Math.min(1,e/.45)))*(e<.62?1:1-ezio((e-.62)/.38));pz(P,'chest',.25*k,lerp(-.4,.5,k));P.root.z=6*k;stLegs(P,u,k,1.4)},
 // Liquéfaction : le corps s'affaisse au sol, puis se redresse d'un coup
 hz_melt:(P,e)=>{const dn=e<.85?ezo(Math.min(1,e/.15)):1-ezo((e-.85)/.15);P.root.y=-17*dn;pz(P,'chest',.95*dn);pz(P,'spine',.3*dn);pz(P,'head',-.35*dn);pz(P,'thighL',-1.25*dn);pz(P,'shinL',2.15*dn);pz(P,'thighR',-1.1*dn);pz(P,'shinR',2.1*dn);
  pz(P,'armL',.45*dn,0,1*dn);pz(P,'armR',.45*dn,0,-1*dn);pz(P,'foreL',-.2);pz(P,'foreR',-.2)},
 // Bond fendant : appel, sabre levé à deux mains en l'air, abattu à la réception
 hz_leap:(P,e)=>{if(e<.15){const k=e/.15;P.root.y=-5*k;pz(P,'thighL',-.6*k);pz(P,'shinL',1.1*k);pz(P,'thighR',-.6*k);pz(P,'shinR',1.1*k);pz(P,'chest',.35*k);pz(P,'armR',.4*k,0,-.2)}
  else if(e<.7){const k=ezo((e-.15)/.3);pz(P,'armR',-3*k,0,-.1);pz(P,'foreR',-.3);pz(P,'handR',.8*k);pz(P,'armL',-2.8*k,0,-.25);pz(P,'foreL',-.6);pz(P,'chest',-.3*k);pz(P,'thighL',-1.1);pz(P,'shinL',1.6);pz(P,'thighR',-.6);pz(P,'shinR',1.4);P.rootR.x=-.15*k}
  else{const k=ezo(Math.min(1,(e-.7)/.12));pz(P,'armR',-3+1.9*k,0,-.1);pz(P,'foreR',-.3+.25*k);pz(P,'handR',.8+.6*k);pz(P,'armL',-2.8+1.7*k,0,-.25);pz(P,'foreL',-.6);pz(P,'chest',-.3+1*k);P.root.y=-8*k;pz(P,'thighL',-1.1*k);pz(P,'shinL',1.8*k);pz(P,'thighR',.4*k);pz(P,'shinR',1.6*k)}},
 // Décapitation : sabre armé haut derrière l'épaule, ruée, balayage géant
 hz_behead:(P,e,u)=>{if(e<.2){const k=ezo(e/.2);pz(P,'armR',-2.8*k,0,-.4*k);pz(P,'foreR',-.4*k);pz(P,'armL',-1.2*k,0,.3);pz(P,'foreL',-1);P.rootR.y=.6*k;pz(P,'chest',-.2*k)}
  else{const k=ezo(Math.min(1,(e-.2)/.3));stSweep(P,'R',k,-.9,2.6,.1);pz(P,'handR',1.45);pz(P,'armL',-1,0,.3);pz(P,'foreL',-1);P.rootR.y=lerp(.6,-1.2,k);pz(P,'chest',.45*k);P.root.z=10*k;P.root.y=-4*k;pz(P,'thighL',-.9*k);pz(P,'shinL',.8*k);pz(P,'thighR',.6*k);pz(P,'shinR',.5*k)}},
 // Corps-déluge : bras écartés vers le ciel, la tête rejetée en arrière
 hz_giant:(P,e)=>{const k=ezo(Math.min(1,e/.3))*(e>.8?1-(e-.8)/.2:1);pz(P,'armL',-2.4*k,0,.9*k);pz(P,'armR',-2.4*k,0,-.9*k);pz(P,'foreL',-.3*k);pz(P,'foreR',-.3*k);pz(P,'chest',-.35*k);pz(P,'head',-.4*k);P.root.y=2*k;pz(P,'thighL',0,0,.25*k);pz(P,'thighR',0,0,-.25*k)},
 // Kubikiribôchô : diagonale, revers, grand balayage, estoc, coup d'en haut
 hz_k1:(P,e,u)=>{const k=stH(e,.25,.55);pz(P,'armR',lerp(-2.8,-.5,k),0,lerp(-.6,.6,k));pz(P,'foreR',-.15);pz(P,'handR',1.25);pz(P,'armL',lerp(-2.4,-.7,k),0,lerp(-.2,-.5,k));pz(P,'foreL',-.9);pz(P,'chest',.3*k,lerp(-.35,.55,k));P.root.z=6*k;stLegs(P,u,k,1.3)},
 hz_k2:(P,e,u)=>{const k=stH(e,.25,.55);pz(P,'armR',lerp(-.4,-2.5,k),0,lerp(.7,-.7,k));pz(P,'foreR',-.15);pz(P,'handR',1.25);pz(P,'armL',-.6,0,.45);pz(P,'foreL',-1.1);pz(P,'chest',.1,lerp(.55,-.45,k));P.root.z=4*k;stLegs(P,u,k,1.3)},
 hz_k3:(P,e,u)=>{const k=stH(e,.28,.6);stSweep(P,'R',k,-1,2.4,.15);pz(P,'handR',1.45);pz(P,'armL',-.5,0,.6);pz(P,'foreL',-1.1);P.rootR.y=lerp(.7,-.8,ezo(Math.min(1,e/.45)))*(e<.6?1:1-ezio((e-.6)/.4));pz(P,'chest',.15,lerp(-.45,.6,k));stLegs(P,u,k,1.4)},
 hz_k4:(P,e,u)=>{const k=stH(e,.18,.6);pz(P,'armR',-1.57*k-.1,0,.05);pz(P,'foreR',-.05);pz(P,'handR',1.5*k);pz(P,'armL',-1.3*k,0,-.3);pz(P,'foreL',-.4);pz(P,'chest',.4*k,.3*k);P.root.z=15*k;if(!(u&&u.moving)){P.root.y=-5*k;pz(P,'thighR',-1.1*k);pz(P,'shinR',1*k);pz(P,'thighL',.7*k);pz(P,'shinL',.4*k)}},
 hz_k5:(P,e)=>{if(e<.38){const k=ezo(e/.38);pz(P,'armR',-3.1*k,0,-.1);pz(P,'armL',-3*k,0,-.2);pz(P,'foreR',-.3*k);pz(P,'foreL',-.5*k);pz(P,'handR',.6*k);pz(P,'chest',-.3*k);P.root.y=7*Math.sin(Math.PI*k*.5)}
  else{const k=ezo(Math.min(1,(e-.38)/.14)),r=e>.75?1-(e-.75)/.25:1;pz(P,'armR',(-3.1+2.2*k)*r,0,-.1);pz(P,'armL',(-3+2*k)*r,0,-.2);pz(P,'foreR',-.3+.2*k);pz(P,'foreL',-.5);pz(P,'handR',(.6+.8*k)*r);pz(P,'chest',(-.3+1.05*k)*r);P.root.y=(7-14*k)*r;P.root.z=8*k*r;
   pz(P,'thighL',-1*k*r);pz(P,'shinL',1.2*k*r);pz(P,'thighR',.5*k*r);pz(P,'shinR',.9*k*r)}},
 // Taijutsu liquide, 5e coup : fouet d'eau lancé du bras droit puis ramené
 hz_whip:(P,e,u)=>{if(e<.3){const k=ezo(e/.3);pz(P,'armR',-2.5*k,0,-.6*k);pz(P,'foreR',-1.2*k);pz(P,'chest',-.2*k,-.45*k)}
  else{const k=ezo(Math.min(1,(e-.3)/.2)),b=e>.6?ezo((e-.6)/.4):0;pz(P,'armR',-2.5+1*k+.6*b,0,-.6+.6*k);pz(P,'foreR',-1.2+1.15*k-1.1*b);pz(P,'chest',-.2+.5*k-.2*b,-.45+.85*k-.3*b);P.root.z=6*k-6*b;stLegs(P,u,k)}
  pz(P,'armL',-.5,0,.5);pz(P,'foreL',-1.2)},
});
