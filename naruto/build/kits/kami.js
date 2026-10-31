// ===== Clan Kami (c16, préfixe km_) : le papier (Konan) =====
// Identité : des feuilles de papier tournent autour du ninja (trait « Danse du shikigami ») ; elles amortissent les gros coups
// et nourrissent les jutsu (shuriken et papillons en plus, mer de papiers plus forte). Le rempart les rend, les tirs de base aussi.
// Combo signature : Lance (clouée) ou Cocon (entravée) → Mer de papiers explosifs ; Corps de papier / Clone pour esquiver.
// [emplacement, rang, mécanique, nom, description, élément visuel]
const KMD={
 shuri:'3 shuriken de papier en éventail serré (6 dégâts chacun) ; dépense jusqu\'à 2 feuilles : +1 shuriken par feuille',
 lance:'Lance de papier comprimé qui transperce (17 dégâts) ; le premier ennemi touché est cloué au sol 0,6 s',
 corps:'Ton corps se disperse en feuilles 0,8 s : intouchable et plus rapide, sans attaquer ; en se reformant, elles tranchent autour de toi (12 dégâts, ralentit)',
 bfly:'4 papillons de papier traquent l\'ennemi le plus proche (5 dégâts chacun, ralentit, révèle) ; +1 papillon par feuille dépensée (3 max)',
 chakram:'Chakram de papier qui revient : 13 dégâts à l\'aller, 13 au retour, et le retour ralentit 1,2 s',
 wall:'Mur de papier plié devant toi 3 s : il arrête les tirs ennemis ; en retombant, ses feuilles rejoignent ta réserve (+3)',
 cocoon:'Les feuilles s\'enroulent sur la zone visée (0,5 s) : 10 dégâts, entravé 1,1 s ; puis le cocon explose (20 dégâts, repousse)',
 wings:'Ailes de papier : tu voles jusqu\'au point visé (300 max) ; à l\'atterrissage, un coup d\'ailes repousse les ennemis proches (6 dégâts)',
 clone:'Tu files de 200 max en laissant un double de papier : il arrête un tir ennemi et explose alors, ou au contact d\'un ennemi, ou au bout de 1,5 s (12 dégâts, ralentit)',
 sea:'Mer de papiers explosifs sur la zone (ralentit) ; au bout de 1,5 s, tout explose : 40 dégâts, repousse, étourdit 0,4 s ; +12 au centre ; dépense toutes tes feuilles : +2 dégâts par feuille',
 angel:'Grandes ailes d\'ange 6 s : plus rapide, insensible aux ralentissements et entraves, feuilles 2× plus vite ; chaque seconde, 2 lames de papier filent vers l\'ennemi le plus proche (4 dégâts chacune)'};
KIT('c16',[
 [1,'D','x.km_shuri','Shuriken de papier',KMD.shuri,'km_paper'],
 [2,'C','x.km_wings','Ailes de papier',KMD.wings,'km_paper'],
 [3,'C','x.km_lance','Lance de papier',KMD.lance,'km_paper'],
 [4,'C','x.km_corps','Corps de papier',KMD.corps,'km_paper'],
 [1,'B','x.km_bfly','Papillons shikigami',KMD.bfly,'km_paper'],
 [3,'B','x.km_chakram','Chakram de papier',KMD.chakram,'km_paper'],
 [4,'B','x.km_wall','Rempart d\'origami',KMD.wall,'km_paper'],
 [1,'A','x.km_cocoon','Cocon de papier',KMD.cocoon,'km_paper'],
 [2,'D','x.km_clone','Clone de papier',KMD.clone,'km_paper'],
 [5,'S','x.km_sea','Mer de papiers explosifs',KMD.sea,'km_paper'],
 [5,'A','x.km_angel','Ange de papier',KMD.angel,'km_paper'],
]);
// style de combat propre (ajouté à la fin de STYLES)
STYLES.push(['Mains-lames de papier','Feuilles repliées en lames sur tes avant-bras, coups vifs ; tous les 3 coups qui touchent, une feuille rejoint ta réserve ; 5e coup : tourbillon de papier tout autour','x.km_style','km_paper','paper',[16],1.12,1.07]);
// apparence du clan : yeux ambrés et fleur de papier dans les cheveux (si aucun accessoire choisi)
CLOOK[16]=(look)=>{look.head.eye='#d89a3a';if(!look.head.acc)look.head.acc='fleur'};

// ---------- outils ----------
const KMC={w:'#f6f3ea',s:'#d6d0c0',b:'#7a9ae0',l:'#c8d6f4',o:'#2a3050',r:'#c8302a',y:'#ffb04a'}; // papier, ombre, bleu du clan, bleu clair, contour, encre rouge, feu
const KM_MAX=6,KM_REG=3,KM_TEAR=12,KM_ABS=3; // feuilles max, une toutes les 3 s, un coup ≥ 12 en déchire une qui en absorbe 3
const km_I=u=>units.indexOf(u);
const km_S=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son brut
// dépense jusqu'à n feuilles de la réserve, renvoie le nombre dépensé
function km_spend(u,n){const k=Math.max(0,Math.min(n,u.km_pp|0));if(k){u.km_pp-=k;jx({jfx:'km_puff',ui:km_I(u),x:u.x,y:u.y,n:k,t:.45,m:.45})}return k}
function km_gain(u,n){const k=Math.min(n,KM_MAX-(u.km_pp|0));if(k>0)u.km_pp=(u.km_pp|0)+k;return k}

// ---------- mécaniques ----------
Object.assign(NAT,{
 // attaque de base (corps à corps) : mains-lames de papier ; 3 coups qui touchent = une feuille en réserve ; 5e : tourbillon tout autour
 km_style:SP('Mains-lames de papier','',.34,{hero:'rey',melee:1,ai:{max:92,p:1}},(u,a)=>{const c=stC(u),T=[0,[88,1.7,9,.34],[88,1.7,9,.34],[92,2.2,10,.38],[94,2.4,10,.42],[86,6.3,12,.58]][c],W=KMC.w,B=KMC.b;
  stMelee(u,a,T[0],T[1],T[2],{},[0,{d:-1,tl:.6,z:36,th:7,c:W,c2:B,blade:1,fl:'paper'},{d:1,tl:-.6,z:36,th:7,c:W,c2:B,blade:1,fl:'paper'},{d:-1,tl:.8,z:32,th:8,c:W,c2:B,blade:1,x2:1,fl:'paper'},{d:1,tl:1.4,z:30,th:9,c:W,c2:B,rr:.7,fl:'paper'},{d:-1,z:26,th:10,c:W,c2:B,rr:.8,fl:'paper'}][c],e=>{
   u.km_hc=(u.km_hc|0)+1;if(u.km_hc>=3){u.km_hc=0;if(km_gain(u,1))jx({jfx:'km_back',ui:km_I(u),x:e.x,y:e.y,n:1,t:.5,m:.5})}});
  if(c===5){jx({jfx:'km_swirl',ui:km_I(u),x:u.x,y:u.y,t:.5,m:.5});S('wind',u)}stCd(u,T[3]);anim(u,'st_pap'+c,c===5?.4:.27)}),
 // Shuriken de papier : éventail, +1 shuriken par feuille dépensée (2 max)
 km_shuri:SP('Shuriken de papier',KMD.shuri,5,{line:{len:520,w:60},ai:RG(480,.7)},(u,a)=>{const n=3+km_spend(u,2);S('wind',u);km_S('saber',u);anim(u,'km_flick',.42);
  jx({jfx:'km_fold',ui:km_I(u),x:u.x,y:u.y,a,t:.35,m:.35});
  for(let i=0;i<n;i++)proj(u,a+(i-(n-1)/2)*.06,{vfx:'km_paper',spd:860,r:7,dmg:6,life:.62,col:KMC.w,kind:'km_shuri'})}),
 // Lance de papier : perce, le premier ennemi touché est cloué
 km_lance:SP('Lance de papier',KMD.lance,8,{line:{len:560,w:22},ai:RG(540,.6)},(u,a)=>{S('wind',u);km_S('saber',u);anim(u,'km_spear',.5);let pin=0;
  jx({jfx:'km_fold',ui:km_I(u),x:u.x,y:u.y,a,t:.35,m:.35,big:1});
  proj(u,a,{vfx:'km_paper',spd:1050,r:9,dmg:17,life:.55,col:KMC.w,pierce:1,kind:'km_spear',onHit:(p,t)=>{if(pin||t.dead)return;pin=1;hit(t,p.owner,0,{root:.6,silent:1});
   if(t.root>0){jx({jfx:'km_pin',ti:km_I(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.7,m:.7});km_S('rock',t)}}})}),
 // Corps de papier : intangible 1 s, plus rapide, ne peut ni frapper ni lancer de jutsu ; se reforme en tranchant autour de soi
 km_corps:SP('Corps de papier',KMD.corps,13,{hero:'ahsoka',ai:DEF},(u)=>{const D=.8;u.phase=Math.max(u.phase||0,D);u.haste=Math.max(u.haste,D);u.disarm=Math.max(u.disarm,D);u.silence=Math.max(u.silence,D);u.km_sc=D;
  S('wind',u);km_S('poof',u);anim(u,'km_scatter',D);jx({jfx:'km_swirl',ui:km_I(u),x:u.x,y:u.y,t:D,m:D});
  later(u,D,()=>{if(u.dead)return;u.km_sc=0;VFX='km_paper';aoe(u,u.x,u.y,90,12,{slow:.8,unblockable:1,quiet:1},KMC.l);VFX=null;jx({jfx:'km_reform',x:u.x,y:u.y,r:90,t:.45,m:.45});km_S('saber',u);anim(u,'km_open',.35)})}),
 // Papillons shikigami : nuée qui traque, +1 papillon par feuille (3 max)
 km_bfly:SP('Papillons shikigami',KMD.bfly,10,{ai:RG(460,.6)},(u,a)=>{const n=4+km_spend(u,3);let i=0;S('wind',u);anim(u,'km_point',.55);jx({jfx:'km_fold',ui:km_I(u),x:u.x,y:u.y,a,t:.4,m:.4,big:1});
  const f=o=>{const b=a+(i-(n-1)/2)*.32;i++;proj(o,b,{vfx:'km_paper',spd:420,r:7,dmg:5,life:1.5,col:KMC.w,home:1,slow:.5,noClash:1,o:{reveal:1},kind:'km_bfly'})};
  f(u);seqs.push({owner:u,n:n-1,t:.06,iv:.06,vfx:'km_paper',f})}),
 // Chakram de papier : aller-retour, le retour ralentit
 km_chakram:SP('Chakram de papier',KMD.chakram,9,{line:{len:400,w:40},ai:RG(380,.6)},(u,a)=>{S('wind',u);km_S('saber',u);anim(u,'km_spear',.45);
  proj(u,a,{vfx:'km_paper',spd:700,r:14,dmg:13,life:1.7,col:KMC.w,ret:380,pierce:1,noClash:1,kind:'km_chakram',onHit:(p,t)=>{if(p.back&&!t.dead){hit(t,p.owner,0,{slow:1.2,silent:1});sparks(t.x,t.y,KMC.w,6,'bone')}}})}),
 // Rempart d'origami : mur qui arrête les tirs (logique : AUXF.km_wall), puis rend 3 feuilles
 km_wall:SP('Rempart d\'origami',KMD.wall,12,{hero:'thrawn',ai:{mode:'def',p:.45}},(u,a)=>{const c=fwd(u,a,58);S('wind',u);km_S('poof',u);anim(u,'km_open',.5);
  aux.push({type:'km_wall',x:c.x,y:c.y,a,len:170,w:14,r:85,t:3,m:3,team:u.team,owner:u,ui:km_I(u),n:0,k:0});sparks(c.x,c.y,KMC.w,10,'bone')}),
 // Cocon de papier : zone retardée qui entrave, puis le cocon explose
 km_cocoon:SP('Cocon de papier',KMD.cocoon,13,{tele:{r:85,max:440},ai:RG(430,.6)},(u,a,td)=>{const p=atP(u,a,td,440),R=85,vic=[];S('wind',u);anim(u,'km_point',.6);
  jx({jfx:'km_gather',x:p.x,y:p.y,r:R,t:.5,m:.5});zone(u,p.x,p.y,R,10,.5,{root:1.1},KMC.b);lastZ().deto='km_wrap';
  later(u,.52,()=>{for(const e of enemies(u))if(e.root>0&&Math.hypot(e.x-p.x,e.y-p.y)<R+e.r+4){vic.push({x:e.x,y:e.y});jx({jfx:'km_cocoon',ti:km_I(e),x:e.x,y:e.y,t:1.1,m:1.1})}});
  later(u,1.6,()=>{for(const v of vic){VFX='km_paper';for(const e of enemies(u))if(Math.hypot(e.x-v.x,e.y-v.y)<50+e.r)hit(e,u,20,{kb:120,fx:v.x,fy:v.y,unblockable:1});VFX=null;
   jx({jfx:'km_boom',x:v.x,y:v.y,r:50,t:.6,m:.6});km_S('boom',u)}if(vic.length&&near(p.x,p.y))shake=Math.max(shake,.2)})}),
 // Ailes de papier : vol jusqu'au point visé, coup d'ailes à l'atterrissage
 km_wings:SP('Ailes de papier',KMD.wings,12,{hero:'cadbane',ai:ESC},(u,a,td)=>{const d=clamp(td||260,100,300),D=.48;S('wind',u);km_S('dash',u);anim(u,'km_open',D+.1);
  aux.push({type:'km_wings',x:u.x,y:u.y,r:1.2,t:D+.15,m:D+.15,team:u.team,owner:u,ui:km_I(u),k:0});
  dash(u,a,d,D,{jump:70,end:()=>{if(u.dead)return;VFX='km_paper';for(const e of enemies(u))if(dist(u,e)<105+e.r)hit(e,u,6,{kb:150,fx:u.x,fy:u.y});VFX=null;
   jx({jfx:'km_gust',x:u.x,y:u.y,r:105,t:.45,m:.45});km_S('wind',u)}})}),
 // Clone de papier : double qui arrête un tir puis explose (logique : AUXF.km_clone)
 km_clone:SP('Clone de papier',KMD.clone,9,{hero:'cadbane',ai:ESC},(u,a,td)=>{const d=clamp(td||200,110,200);km_S('poof',u);S('dash',u);
  aux.push({type:'km_clone',x:u.x,y:u.y,a:u.aim,r:18,t:1.5,m:1.5,team:u.team,owner:u,ui:km_I(u),k:0});jx({jfx:'km_puff',ui:km_I(u),x:u.x,y:u.y,n:5,t:.45,m:.45});
  anim(u,'km_scatter',.25);dash(u,a,d,.2,{jump:18})}),
 // Mer de papiers explosifs : la zone se couvre de papiers (ralentit), puis tout explose (zone) ; +12 au centre (later)
 km_sea:ULT('Mer de papiers explosifs',KMD.sea,{tele:{r:170,max:420},ai:{max:420,p:.8}},(u,a,td)=>{const p=atP(u,a,td,420),R=170,D=1.5,n=u.km_pp|0;u.km_pp=0;
  S('wind',u);km_S('heavy',u);anim(u,'km_pray',.9);jx({jfx:'km_puff',ui:km_I(u),x:u.x,y:u.y,n:Math.max(4,n),t:.5,m:.5});
  aux.push({type:'km_sea',x:p.x,y:p.y,r:R,t:D,m:D,team:u.team,owner:u,danger:1,n,k:0});
  zone(u,p.x,p.y,R,40+2*n,D,{kb:220,stun:.4},KMC.b);lastZ().deto='km_sea';
  later(u,D,()=>{VFX='km_paper';for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<70+e.r)hit(e,u,12,{unblockable:1});VFX=null;km_S('boom',u);if(near(p.x,p.y))shake=Math.max(shake,.5)})}),
 // Ange de papier : ailes 6 s (voir le trait : vol, lames de papier)
 km_angel:ULT('Ange de papier',KMD.angel,{ai:SELF(450,.8)},(u)=>{const D=6;u.km_ang=D;u.km_angK=.5;u.haste=Math.max(u.haste,D);u.slowImm=Math.max(u.slowImm,D);u.slow=0;u.root=0;
  S('wind',u);km_S('roar',u);anim(u,'km_pray',.8);aux.push({type:'km_wings',x:u.x,y:u.y,r:1.6,t:D,m:D,team:u.team,owner:u,ui:km_I(u),k:0,big:1});
  jx({jfx:'km_gust',x:u.x,y:u.y,r:140,t:.6,m:.6});jx({jfx:'km_puff',ui:km_I(u),x:u.x,y:u.y,n:10,t:.6,m:.6})}),
});
Object.assign(NATHERO,{km:'kylo'});

// ---------- logique des objets (hôte) ----------
// mur de papier : détruit les tirs ennemis qui le traversent ; en retombant, rend 3 feuilles
AUXF.km_wall=(x,dt)=>{const o=x.owner,ca=Math.cos(x.a),sa=Math.sin(x.a),H=x.len/2;
 if(x.t<=0){if(!x.done){x.done=1;if(o&&!o.dead&&o.team===x.team){const k=km_gain(o,3);if(k){jx({jfx:'km_back',ui:km_I(o),x:x.x,y:x.y,n:k,t:.6,m:.6});say(o,'+'+k+' FEUILLES',KMC.l)}}}return}
 for(const p of projs){if(p.dead||p.grenade||!p.owner||p.owner.team===x.team||p.life<=0)continue;
  const dx=p.x-x.x,dy=p.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;if(Math.abs(s)>H+p.r)continue;
  const f0=f-(p.vx*ca+p.vy*sa)*dt;if(Math.abs(f)<x.w+p.r||(f0<0)!==(f<0)){p.life=0;if(p.rocket)p.boom=1;x.n=(x.n|0)+1;if(near(p.x,p.y)){sparks(p.x,p.y,KMC.w,6,'bone');km_S('deflect',o)}}}};
// double de papier : arrête un tir, explose au contact d'un ennemi ou à la fin
AUXF.km_clone=x=>{if(x.done)return;const o=x.owner;let go=x.t<=0;
 if(!go)for(const p of projs){if(p.dead||p.grenade||!p.owner||p.owner.team===x.team)continue;if(Math.hypot(p.x-x.x,p.y-x.y)<x.r+p.r+6){p.life=0;if(p.rocket)p.boom=1;go=true;break}}
 if(!go)for(const e of units)if(!e.dead&&e.team!==x.team&&Math.hypot(e.x-x.x,e.y-x.y)<60+e.r){go=true;break}
 if(!go)return;x.done=1;x.t=Math.min(x.t,.02);if(!o)return;VFX='km_paper';aoe(o,x.x,x.y,80,12,{slow:1,unblockable:1,quiet:1},KMC.y);VFX=null;
 jx({jfx:'km_boom',x:x.x,y:x.y,r:80,t:.6,m:.6});km_S('boom',o)};
// mer de papiers : ralentit les ennemis dedans (l'explosion est une zone)
AUXF.km_sea=x=>{for(const e of units){if(e.dead||e.team===x.team||e.unstop>0||e.slowImm>0)continue;if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)e.slow=Math.max(e.slow,.3)}};
// ailes : suivent le ninja (dessin derrière lui) ; celles de l'ange tombent quand l'ange prend fin
AUXF.km_wings=x=>{const u=x.owner;if(!u||u.dead||(x.big&&!(u.km_ang>0))){x.t=Math.min(x.t,.25);return}x.x=u.x;x.y=u.y};

// ---------- trait de clan : Danse du shikigami ----------
TRAITS[16]={nom:'Danse du shikigami',desc:'Jusqu\'à 6 feuilles de papier tournent autour de toi (une de plus toutes les 3 s). Un coup reçu de 12 dégâts ou plus en déchire une, qui en absorbe 3. Shuriken, Papillons et Mer de papiers dépensent ces feuilles pour frapper plus fort',
 init(u){u.km_pp=2;u.km_ppT=0},
 update(u,dt){if(u.km_rs!==u.chg){if(u.km_rs){u.km_pp=2;u.km_ppT=0;u.km_ang=0;u.km_sc=0;u.km_hc=0}u.km_rs=u.chg} // nouveau ninja ou réapparition (mkUnit recrée u.chg ; les outils de test remplacent souvent u.cds, pas u.chg)
  if(u.km_sc>0)u.km_sc=Math.max(0,u.km_sc-dt);
  if(u.km_ang>0){u.km_ang=Math.max(0,u.km_ang-dt);u.root=0;u.km_angK-=dt;
   if(u.km_angK<=0){u.km_angK=1;let tg=null,bd=520;for(const e of enemies(u)){if(e.stealth>0)continue;const d=dist(u,e);if(d<bd){bd=d;tg=e}}
    if(tg){const a=ang(u,tg);VFX='km_paper';for(const o of[-.22,.22])proj(u,a+o,{vfx:'km_paper',spd:720,r:6,dmg:4,life:.8,col:KMC.w,home:1,noClash:1,kind:'km_blade'});VFX=null;if(near(u.x,u.y))km_S('saber',u)}}}
  if((u.km_pp|0)<KM_MAX){u.km_ppT=(u.km_ppT||0)+dt*(u.km_ang>0?2:1);if(u.km_ppT>=KM_REG){u.km_ppT=0;u.km_pp=(u.km_pp|0)+1}}else u.km_ppT=0},
 // un gros coup déchire une feuille, qui en absorbe une partie
 take(t,src,dmg,o){if(dmg>=KM_TEAR&&src&&src!==t&&src.team!==t.team&&(t.km_pp|0)>0&&!o.silent){t.km_pp--;dmg=Math.max(0,dmg-KM_ABS);jx({jfx:'km_tear',ui:km_I(t),x:t.x,y:t.y,a:Math.atan2(t.y-src.y,t.x-src.x),t:.5,m:.5})}return dmg},
 // feuilles qui tournent autour du ninja (en arrière : plus petites et pâles)
 draw(u,p,S,sk){const n=u.km_pp|0;if(!n||u.km_sc>0)return;const t=performance.now()/1000,cy=p.y-36*S*(sk||1);
  for(let i=0;i<n;i++){const b=t*1.5+i*Math.PI*2/n,c=Math.cos(b),s=Math.sin(b),y=cy+s*9*S+Math.sin(t*2.4+i*1.7)*4*S,fr=s<0?.75:1;
   km_leaf(p.x+c*27*S,y,S*.9*fr,Math.sin(t*3+i)*.6,Math.cos(t*4.2+i*2.1),s<0?.55:.95)}},
 hud(u,x,y){const n=u.km_pp|0;y-=20;for(let i=0;i<KM_MAX;i++){const on=i<n;g.fillStyle=on?KMC.w:'rgba(120,130,160,.35)';g.strokeStyle=on?KMC.b:'rgba(120,130,160,.5)';g.lineWidth=1;g.beginPath();g.rect(x+i*13,y-2,9,11);g.fill();g.stroke();
  if(on){g.fillStyle=KMC.s;g.beginPath();g.moveTo(x+i*13+9,y-2);g.lineTo(x+i*13+5,y-2);g.lineTo(x+i*13+9,y+2);g.closePath();g.fill()}}
  text('Feuilles de papier '+n+' / '+KM_MAX,x+84,y+7,11,n?'#dfe8ff':'#8a96b8','left','normal')}};
AFTER.push(()=>{UK.push('km_pp','km_ang','km_sc');VP.km_paper=[KMC.b,KMC.l,KMC.w];NOTRAIL.km_paper=1});

// ---------- dessins ----------
// feuille de papier en repère écran : s échelle, rot rotation, fl battement (-1 … 1 : la feuille tourne sur elle-même), al opacité
function km_leaf(x,y,s,rot,fl,al){const f=Math.abs(fl)<.18?(fl<0?-.18:.18):fl;g.save();g.globalAlpha*=al==null?1:al;g.translate(x,y);g.rotate(rot);g.scale(1,f);
 g.fillStyle=f>0?KMC.w:KMC.s;g.strokeStyle=KMC.o;g.lineWidth=.9/Math.max(.3,Math.abs(f));g.beginPath();g.rect(-4.5*s,-6*s,9*s,12*s);g.fill();g.stroke();
 g.fillStyle=f>0?KMC.l:KMC.w;g.beginPath();g.moveTo(4.5*s,-6*s);g.lineTo(.5*s,-6*s);g.lineTo(4.5*s,-2*s);g.closePath();g.fill();g.restore()}
// papillon de papier (repère courant, tourné vers +x) : fl battement 0 … 1
function km_bf(s,fl){const w=.25+.75*Math.abs(fl);g.lineJoin='round';
 for(const sg of[-1,1]){g.fillStyle=sg<0?KMC.w:'#ffffff';g.strokeStyle=KMC.o;g.lineWidth=1;
  g.beginPath();g.moveTo(1*s,0);g.lineTo(4*s,sg*10*s*w);g.lineTo(-5*s,sg*9*s*w);g.closePath();g.fill();g.stroke();
  g.fillStyle=KMC.l;g.beginPath();g.moveTo(-1*s,0);g.lineTo(-7*s,sg*6*s*w);g.lineTo(-4*s,sg*1.5*s);g.closePath();g.fill();g.stroke();
  g.fillStyle=KMC.b;g.beginPath();g.moveTo(4*s,sg*10*s*w);g.lineTo(1*s,sg*6*s*w);g.lineTo(-1*s,sg*9.3*s*w);g.closePath();g.fill()}
 g.strokeStyle=KMC.o;g.lineWidth=1.6*s;g.lineCap='round';g.beginPath();g.moveTo(-4*s,0);g.lineTo(4*s,0);g.stroke()}
// shuriken plié (4 pales bicolores) en repère courant
function km_star(R,rot){g.save();g.rotate(rot);g.strokeStyle=KMC.o;g.lineWidth=1;g.lineJoin='round';
 for(let i=0;i<4;i++){const b=i*Math.PI/2;g.fillStyle=i%2?KMC.b:KMC.w;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(b)*R*.35-Math.sin(b)*R*.35,Math.sin(b)*R*.35+Math.cos(b)*R*.35);g.lineTo(Math.cos(b)*R,Math.sin(b)*R);g.closePath();g.fill();g.stroke();
  g.fillStyle=i%2?KMC.l:KMC.s;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(b)*R,Math.sin(b)*R);g.lineTo(Math.cos(b)*R*.35+Math.sin(b)*R*.35,Math.sin(b)*R*.35-Math.cos(b)*R*.35);g.closePath();g.fill();g.stroke()}
 g.fillStyle=KMC.o;g.beginPath();g.arc(0,0,R*.12,0,7);g.fill();g.restore()}
PROJD.km_shuri=(p,R,ra,t)=>{g.save();g.rotate(ra);g.strokeStyle='rgba(200,214,244,.45)';g.lineWidth=3;g.beginPath();g.moveTo(-28,0);g.lineTo(-8,0);g.stroke();g.restore();g.scale(1,.8);km_star(R*1.5,t/28)};
// lance de papier : losange long et plié, pointe bleue
PROJD.km_spear=(p,R,ra,t)=>{g.rotate(ra);g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1.5;g.beginPath();for(const y of[-4,0,4]){g.moveTo(-60,y);g.lineTo(-36-Math.abs(y)*2,y)}g.stroke();
 g.strokeStyle=KMC.o;g.lineWidth=1.3;g.lineJoin='round';g.fillStyle=KMC.w;g.beginPath();g.moveTo(26,0);g.lineTo(4,-5.5);g.lineTo(-34,-3);g.lineTo(-38,0);g.lineTo(-34,3);g.lineTo(4,5.5);g.closePath();g.fill();g.stroke();
 g.fillStyle=KMC.s;g.beginPath();g.moveTo(26,0);g.lineTo(4,5.5);g.lineTo(-34,3);g.lineTo(-38,0);g.closePath();g.fill();g.stroke();
 g.fillStyle=KMC.b;g.beginPath();g.moveTo(26,0);g.lineTo(12,-3.6);g.lineTo(14,0);g.lineTo(12,3.6);g.closePath();g.fill();
 g.strokeStyle=rgba(KMC.o,.5);g.lineWidth=.8;g.beginPath();for(const x of[-22,-10,2]){g.moveTo(x,-4.2);g.lineTo(x+4,0);g.lineTo(x,4.2)}g.stroke()};
// papillon shikigami : battement d'ailes, petite traîne de paillettes
PROJD.km_bfly=(p,R,ra,t)=>{const fl=Math.sin(t/38+p.life0*40+(p.tx||0));g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(200,214,244,.35)';for(let i=1;i<4;i++){g.beginPath();g.arc(-Math.cos(ra)*i*7,-Math.sin(ra)*i*7+Math.sin(t/60+i)*2,2.2-i*.4,0,7);g.fill()}g.restore();
 g.rotate(ra);g.translate(0,-6);km_bf(1.05,fl)};
// chakram : couronne de triangles pliés qui tourne
PROJD.km_chakram=(p,R,ra,t)=>{g.scale(1,.78);const r=R+5,rot=t/30;g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=3;g.beginPath();g.arc(0,0,r+4,rot,rot+2.2);g.stroke();
 g.lineJoin='round';for(let i=0;i<10;i++){const b=rot+i*.6283,c=Math.cos(b),s=Math.sin(b),c2=Math.cos(b+.63),s2=Math.sin(b+.63);g.fillStyle=i%2?KMC.w:KMC.l;g.strokeStyle=KMC.o;g.lineWidth=1;
  g.beginPath();g.moveTo(c*r*.55,s*r*.55);g.lineTo(c*r*1.18+(-s)*r*.25,s*r*1.18+c*r*.25);g.lineTo(c2*r*.55,s2*r*.55);g.closePath();g.fill();g.stroke()}
 g.strokeStyle=KMC.b;g.lineWidth=2.4;g.beginPath();g.arc(0,0,r*.55,0,7);g.stroke()};
// lame de l'ange : plume de papier effilée
PROJD.km_blade=(p,R,ra,t)=>{g.rotate(ra);g.strokeStyle='rgba(200,214,244,.5)';g.lineWidth=2;g.beginPath();g.moveTo(-34,0);g.lineTo(-12,0);g.stroke();
 g.fillStyle=KMC.w;g.strokeStyle=KMC.o;g.lineWidth=1;g.beginPath();g.moveTo(14,0);g.quadraticCurveTo(0,-6,-14,-1.5);g.lineTo(-10,0);g.lineTo(-14,1.5);g.quadraticCurveTo(0,6,14,0);g.fill();g.stroke();
 g.strokeStyle=KMC.b;g.beginPath();g.moveTo(12,0);g.lineTo(-11,0);g.stroke()};
// feuilles qui jaillissent des mains au lancement
JFXD.km_fold=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,n=f.big?9:6;for(let i=0;i<n;i++){const b=f.a+(i-(n-1)/2)*.45,d=(10+e*(f.big?60:42))*(1+(i%3)*.15),q=P(c.x+Math.cos(b)*d,c.y+Math.sin(b)*d,40+Math.sin(i*2.1)*12+e*10);
 km_leaf(q.x,q.y,q.s*.85,b+e*4+i,Math.cos(e*9+i*1.3),Math.min(1,k*2.2))}};
// feuilles dépensées : elles s'envolent du ninja
JFXD.km_puff=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,n=Math.min(10,f.n||3);for(let i=0;i<n;i++){const b=i*2.4+f.x*.01,d=20+e*36,q=P(c.x+Math.cos(b)*d,c.y+Math.sin(b)*d*.7,36+e*40+(i%3)*6);km_leaf(q.x,q.y,q.s*.8,b+e*5,Math.cos(e*10+i),Math.min(1,k*2))}};
// feuilles rendues : elles volent vers le ninja
JFXD.km_back=(f,k,e,t,u)=>{if(!u||u.dead)return;const n=Math.min(6,f.n||1);for(let i=0;i<n;i++){const s=Math.min(1,Math.max(0,e*1.3-i*.06)),x=lerp(f.x,u.x,s)+Math.sin(s*Math.PI)*(i-n/2)*14,y=lerp(f.y,u.y,s),q=P(x,y,34+Math.sin(s*Math.PI)*50);
 km_leaf(q.x,q.y,q.s*.8,s*6+i,Math.cos(s*12+i),Math.min(1,k*3))}};
// feuille déchirée (le trait amortit un coup) : deux moitiés qui s'écartent
JFXD.km_tear=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,q=P(c.x+Math.cos(f.a)*(14+e*26),c.y+Math.sin(f.a)*(14+e*26),46+e*14),s=q.s;g.save();g.globalAlpha=Math.min(1,k*2.2);
 for(const sg of[-1,1]){g.save();g.translate(q.x+sg*e*9*s,q.y+e*e*20*s);g.rotate(sg*(.3+e*2));g.fillStyle=KMC.w;g.strokeStyle=KMC.o;g.lineWidth=1;g.beginPath();g.moveTo(-5*s,-7*s);g.lineTo(5*s,-7*s);g.lineTo(sg*1*s,0);g.lineTo(5*s,7*s);g.lineTo(-5*s,7*s);g.closePath();
  if(sg>0)g.scale(-1,1);g.fill();g.stroke();g.restore()}
 g.strokeStyle=rgba(KMC.l,.8*k);g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,(8+e*18)*s,0,7);g.stroke();g.restore()};
// clouée : la lance plantée dans le sol, anneau de papier
JFXD.km_pin=(f,k,e,t,u,tg)=>{const c=tg&&!tg.dead?tg:f,ra=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)),q=P(c.x-Math.cos(f.a)*10,c.y-Math.sin(f.a)*10,0),s=q.s;g.save();g.globalAlpha=Math.min(1,k*3);
 g.strokeStyle=rgba(KMC.l,.7);g.lineWidth=2;gEll(c.x,c.y,24+e*6);g.stroke();g.translate(q.x,q.y);g.rotate(ra-1.2);g.scale(s,s);g.fillStyle=KMC.w;g.strokeStyle=KMC.o;g.lineWidth=1.2;
 g.beginPath();g.moveTo(0,0);g.lineTo(-4,-30);g.lineTo(0,-46);g.lineTo(4,-30);g.closePath();g.fill();g.stroke();g.fillStyle=KMC.b;g.beginPath();g.moveTo(0,-46);g.lineTo(-3,-38);g.lineTo(3,-38);g.closePath();g.fill();g.restore()};
// corps de papier : tourbillon de feuilles à la place du corps
JFXD.km_swirl=(f,k,e,t,u)=>{const c=u&&!u.dead?u:f,n=18,al=Math.min(1,k*5,e*8);for(let i=0;i<n;i++){const h=(i/n),b=t*(5+h*3)+i*2.4,r=(16+h*10+Math.sin(t*6+i)*3)*(1+(e<.15?(.15-e)*6:0)),q=P(c.x+Math.cos(b)*r,c.y+Math.sin(b)*r*.75,(c.z||0)+6+h*62);
 km_leaf(q.x,q.y,q.s*.75,b+i,Math.cos(t*9+i*1.7),al*(Math.sin(b)<0?.6:1))}};
// le corps se reforme : feuilles qui tranchent en anneau
JFXD.km_reform=(f,k,e)=>{g.save();g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=3;gEll(f.x,f.y,f.r*(.3+e*.75));g.stroke();g.strokeStyle=rgba(KMC.b,.6*k);g.lineWidth=1.5;gEll(f.x,f.y,f.r*(.2+e*.7));g.stroke();g.restore();
 for(let i=0;i<12;i++){const b=i*.5236+e*2.5,d=f.r*(.25+e*.8),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,30-e*16);km_leaf(q.x,q.y,q.s*.9,b+1.57,Math.cos(e*14+i),Math.min(1,k*2))}};
// cocon : les feuilles convergent vers la zone
JFXD.km_gather=(f,k,e)=>{for(let i=0;i<14;i++){const b=i*.4488+e*2.2,d=f.r*(1.9-e*1.5),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,20+Math.sin(i)*14+(1-e)*30);km_leaf(q.x,q.y,q.s*.85,b+e*6,Math.cos(e*12+i*1.3),Math.min(1,e*4))}};
// cocon : bandes de papier enroulées sur la cible, les sceaux rougeoient avant l'explosion
JFXD.km_cocoon=(f,k,e,t,u,tg)=>{const c=tg&&!tg.dead?tg:f,q=P(c.x,c.y,0),s=q.s*((tg&&tg.ch.look.scale)||1),g0=Math.min(1,e*7),hot=k<.35;g.save();g.lineCap='round';
 for(let i=0;i<7;i++){const y=q.y-(6+i*8)*s,w=(15-Math.abs(i-3)*1.2)*s,ph=t*2+i*.9,h=Math.min(1,g0*7-i);if(h<=0)continue;
  g.strokeStyle=KMC.o;g.lineWidth=7.5*s;g.beginPath();g.ellipse(q.x,y,w,w*.36,-.12+(i%2)*.24,ph,ph+Math.PI*1.7*h);g.stroke();
  g.strokeStyle=i%2?KMC.w:KMC.s;g.lineWidth=5.5*s;g.beginPath();g.ellipse(q.x,y,w,w*.36,-.12+(i%2)*.24,ph,ph+Math.PI*1.7*h);g.stroke()}
 if(e>.2)for(let i=0;i<3;i++){const x=q.x+(i-1)*8*s,y=q.y-(20+i*13)*s;g.fillStyle=hot&&Math.sin(t*30+i)>0?KMC.y:'#f2ead2';g.fillRect(x-3*s,y-5*s,6*s,10*s);g.fillStyle=KMC.r;g.fillRect(x-.8*s,y-3.5*s,1.6*s,7*s)}
 g.restore()};
// explosion de papiers piégés : éclair, feuilles qui brûlent et s'envolent, fumée
JFXD.km_boom=(f,k,e)=>{const q=P(f.x,f.y,10),R=f.r*q.s;g.save();g.globalCompositeOperation='lighter';
 const gr=g.createRadialGradient(q.x,q.y-R*.2,0,q.x,q.y-R*.2,R*(.5+e*.7));gr.addColorStop(0,rgba('#fff6d8',.95*k));gr.addColorStop(.45,rgba(KMC.y,.7*k));gr.addColorStop(1,'rgba(255,90,40,0)');g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-R*.2,R*(.5+e*.7),R*(.5+e*.7)*.8,0,0,7);g.fill();g.restore();
 g.save();g.fillStyle=rgba('#c8c4c0',.4*k);for(let i=0;i<5;i++){const b=i*1.26,d=R*(.3+e*.6);g.beginPath();g.arc(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.5-e*R*.6,R*(.18+e*.22),0,7);g.fill()}g.restore();
 for(let i=0;i<9;i++){const b=i*.698+f.x*.03,d=R*(.2+e*1.1),h=Math.sin(Math.min(1,e*1.4)*Math.PI)*R*(.6+(i%3)*.3);km_leaf(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6-h,q.s*.8,b+e*8,Math.cos(e*15+i),Math.min(1,k*1.6));
  if(k>.4){g.fillStyle=rgba(KMC.y,.8*k);g.beginPath();g.arc(q.x+Math.cos(b)*d+3*q.s,q.y+Math.sin(b)*d*.6-h-5*q.s,1.8*q.s,0,7);g.fill()}}};
// coup d'ailes : deux arcs qui balaient et des plumes de papier
JFXD.km_gust=(f,k,e)=>{g.save();g.lineCap='round';for(let j=0;j<2;j++){const r=f.r*(.3+e*.9)*(1-j*.18);g.strokeStyle=rgba(j?KMC.l:'#ffffff',.8*k);g.lineWidth=(5-j*2)*k+1;g.setLineDash([24,12]);g.lineDashOffset=e*40*(j?-1:1);gEll(f.x,f.y,r);g.stroke()}g.setLineDash([]);g.restore();
 for(let i=0;i<10;i++){const b=i*.628,d=f.r*(.3+e*.9),q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,14+e*24);km_leaf(q.x,q.y,q.s*.75,b+e*6,Math.cos(e*12+i),Math.min(1,k*2))}};
// mer : explosions en cascade du centre vers le bord
JFXD.km_cascade=(f,k,e,t)=>{const N=16;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#fff2d0',.7*k);g.lineWidth=6*k+1;gEll(f.x,f.y,f.r*(.2+e*1));g.stroke();
 for(let i=0;i<N;i++){const b=i*2.39996,dd=f.r*.95*Math.sqrt((i+.5)/N),l=(e-dd/f.r*.45)/.45;if(l<=0||l>=1)continue;const q=P(f.x+Math.cos(b)*dd,f.y+Math.sin(b)*dd,10),R=(14+l*30)*q.s,a=1-l;
  const gr=g.createRadialGradient(q.x,q.y-R*.3,0,q.x,q.y-R*.3,R);gr.addColorStop(0,rgba('#ffffff',.95*a));gr.addColorStop(.4,rgba(KMC.y,.75*a));gr.addColorStop(1,'rgba(255,80,30,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y-R*.3,R,0,7);g.fill()}g.restore();
 for(let i=0;i<N;i++){const b=i*2.39996,dd=f.r*.95*Math.sqrt((i+.5)/N),l=(e-dd/f.r*.45)/.55;if(l<=0||l>=1)continue;for(let j=0;j<2;j++){const c=b+j*2.6,d=dd+l*30,q=P(f.x+Math.cos(c)*d,f.y+Math.sin(c)*d,10+Math.sin(l*Math.PI)*(50+j*20));km_leaf(q.x,q.y,q.s*.75,c+l*7,Math.cos(l*14+i),1-l)}}};
DETO.km_wrap=(x,y,r)=>{jx({jfx:'shock',x,y,r,t:.4,m:.4,col:KMC.l});sparks(x,y,KMC.w,10,'bone')};
DETO.km_sea=(x,y,r)=>{jx({jfx:'km_cascade',x,y,r,t:1,m:1});sparks(x,y,KMC.y,16,'tag')};
// mur de papier plié (accordéon) ; chaque tir arrêté le fait trembler
AUXD.km_wall=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),px=-sa,py=ca,H=x.len/2,N=14,up=Math.min(1,(x.m-x.t)/.25);g.save();g.lineJoin='round';
 g.fillStyle=rgba(KMC.b,.12*k);g.beginPath();const a0=P(x.x+px*H,x.y+py*H),a1=P(x.x-px*H,x.y-py*H);g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.lineWidth=10;g.strokeStyle=rgba(KMC.o,.25*k);g.stroke();
 for(let i=0;i<N;i++){const s0=-H+i*x.len/N,s1=s0+x.len/N,sh=(x.n||0)%2?Math.sin(t*60)*1.5:0,h0=(46+Math.sin(i*1.7)*6)*up,h1=(46+Math.sin((i+1)*1.7)*6)*up,d=i%2?5:-5;
  const b0=P(x.x+px*s0+ca*d,x.y+py*s0+sa*d,0),b1=P(x.x+px*s1-ca*d,x.y+py*s1-sa*d,0),c0=P(x.x+px*s0+ca*d+sh,x.y+py*s0+sa*d,h0),c1=P(x.x+px*s1-ca*d+sh,x.y+py*s1-sa*d,h1);
  g.fillStyle=rgba(i%2?KMC.w:KMC.s,.92*k);g.strokeStyle=rgba(KMC.o,.8*k);g.lineWidth=1;g.beginPath();g.moveTo(b0.x,b0.y);g.lineTo(b1.x,b1.y);g.lineTo(c1.x,c1.y);g.lineTo(c0.x,c0.y);g.closePath();g.fill();g.stroke();
  if(i%3===1){g.strokeStyle=rgba(KMC.b,.7*k);g.lineWidth=1.5;g.beginPath();g.moveTo((b0.x+b1.x)/2,(b0.y+b1.y)/2-h0*.3*c0.s);g.lineTo((b0.x+b1.x)/2,(b0.y+b1.y)/2-h0*.75*c0.s);g.stroke()}}
 if(x.t<.5)for(let i=0;i<6;i++){const s0=-H+((i*37)%x.len),q=P(x.x+px*s0,x.y+py*s0,30+(.5-x.t)*80);km_leaf(q.x,q.y,q.s*.8,i+t*3,Math.cos(t*8+i),x.t*2)}g.restore()};
// double de papier : silhouette en papier plié, bords qui frémissent, sceau qui rougeoit avant d'exploser
AUXD.km_clone=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,f=Math.cos(x.a||0)>=0?1:-1,hot=x.t<.5&&Math.sin(t*30)>0,w=Math.sin(t*7)*1.2;g.save();g.globalAlpha*=Math.min(1,k*1.5);
 g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(q.x,q.y,15*s,5*s,0,0,7);g.fill();g.translate(q.x,q.y);g.scale(s*f*1.35,s*1.35);g.strokeStyle=KMC.o;g.lineWidth=1.2;g.lineJoin='round';
 g.fillStyle=KMC.s;g.beginPath();g.moveTo(-14,0);g.lineTo(-6+w,-34);g.lineTo(6+w,-34);g.lineTo(14,0);g.closePath();g.fill();g.stroke();
 g.fillStyle=KMC.w;g.beginPath();g.moveTo(-6+w,-34);g.lineTo(0,-2);g.lineTo(14,0);g.lineTo(6+w,-34);g.closePath();g.fill();g.stroke();
 g.beginPath();g.moveTo(-6+w,-34);g.lineTo(-17+w,-22);g.lineTo(-9+w,-30);g.moveTo(6+w,-34);g.lineTo(17+w,-22);g.lineTo(9+w,-30);g.fillStyle=KMC.w;g.fill();g.stroke();
 g.fillStyle=KMC.w;g.beginPath();g.arc(w,-44,10,0,7);g.fill();g.stroke();g.fillStyle=KMC.b;g.beginPath();g.arc(-5+w,-51,4,0,7);g.fill();g.stroke();
 g.fillStyle=hot?KMC.y:'#f2ead2';g.fillRect(-3+w,-26,6,11);g.fillStyle=KMC.r;g.fillRect(-.8+w,-24,1.6,7);
 g.fillStyle=KMC.w;for(let i=0;i<4;i++){const b=t*4+i*1.57;g.save();g.translate(Math.cos(b)*18,-20+Math.sin(b*1.3)*14);g.rotate(b);g.fillRect(-2.5,-3.5,5,7);g.restore()}g.restore()};
// mer de papiers : les papiers tombent puis couvrent le sol ; ils rougeoient juste avant l'explosion
AUXD.km_sea=(x,k,t)=>{const N=64,e=1-x.t/x.m,hot=x.t<.45;g.save();g.fillStyle=rgba('#f2ead2',.14+.12*e);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba(hot?KMC.y:KMC.b,.8);g.lineWidth=2.5;g.setLineDash([10,7]);g.lineDashOffset=-t*30;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 for(let i=0;i<N;i++){const s0=i/N*.75,l=(e-s0)/.25;if(l<=0)continue;const b=i*2.39996,d=x.r*.94*Math.sqrt((i+.5)/N),z=l<1?(1-l)*90:0,q=P(x.x+Math.cos(b)*d+(l<1?Math.sin(l*9+i)*10*(1-l):0),x.y+Math.sin(b)*d,z),s=q.s;
  if(l<1){km_leaf(q.x,q.y,s*.8,i+l*6,Math.cos(l*12+i),1);continue}
  g.save();g.translate(q.x,q.y);g.rotate(i*1.7);g.scale(1,K);g.fillStyle=hot&&Math.sin(t*36+i*1.3)>-.2?KMC.y:'#f2ead2';g.strokeStyle=KMC.o;g.lineWidth=.8;g.fillRect(-6*s,-3.5*s,12*s,7*s);g.strokeRect(-6*s,-3.5*s,12*s,7*s);g.fillStyle=KMC.r;g.fillRect(-4*s,-.8*s,8*s,1.6*s);g.restore()}
 g.restore()};
// ailes de papier (derrière le ninja) : plumes de papier qui battent ; grandes ailes de l'ange
AUXD.km_wings=(x,k,t)=>{const u=x.ui!=null?units[x.ui]:null;if(!u||u.dead)return;const sk=(u.ch.look.scale||1),q=P(u.x,u.y,(u.z||0)+40*sk),s=q.s*(x.r||1)*sk,big=(x.r||1)>1.2,fl=Math.sin(t*(big?4:13)),al=Math.min(1,k*1.4);g.save();g.globalAlpha*=al;g.lineJoin='round';
 for(const sg of[-1,1])for(let i=6;i>=0;i--){const th=-Math.PI/2+sg*(.42+i*.2+fl*.16),L=(34-i*2.6)*s,wd=(5.5-i*.25)*s,rx=q.x+sg*5*s,ry=q.y-2*s,tx=rx+Math.cos(th)*L,ty=ry+Math.sin(th)*L*.85,nx=-Math.sin(th)*wd,ny=Math.cos(th)*wd*.85;
  g.fillStyle=i%2?KMC.w:KMC.s;g.strokeStyle=KMC.o;g.lineWidth=1;g.beginPath();g.moveTo(rx,ry);g.lineTo(rx+(tx-rx)*.55+nx,ry+(ty-ry)*.55+ny);g.lineTo(tx,ty);g.lineTo(rx+(tx-rx)*.55-nx,ry+(ty-ry)*.55-ny);g.closePath();g.fill();g.stroke();
  if(i<2){g.strokeStyle=rgba(KMC.b,.8);g.beginPath();g.moveTo(rx+(tx-rx)*.3,ry+(ty-ry)*.3);g.lineTo(tx,ty);g.stroke()}}
 if(big){g.globalCompositeOperation='lighter';g.fillStyle=rgba(KMC.l,.08);g.beginPath();g.ellipse(q.x,q.y-14*s,34*s,22*s,0,0,7);g.fill()}g.restore()};

// ---------- poses 3D ----------
Object.assign(ANIM,{
 // Shuriken : bras croisés devant, puis les deux mains lancent en éventail
 km_flick:(P,e)=>{if(e<.35){const k=ezo(e/.35);pz(P,'armL',-1.3*k,0,-.5*k);pz(P,'foreL',-1.7*k);pz(P,'armR',-1.3*k,0,.5*k);pz(P,'foreR',-1.7*k);pz(P,'chest',-.1*k)}
  else{const k=ezo(Math.min(1,(e-.35)/.3));pz(P,'armL',-1.3-.25*k,0,-.5+1.3*k);pz(P,'foreL',-1.7+1.6*k);pz(P,'armR',-1.3-.25*k,0,.5-1.3*k);pz(P,'foreR',-1.7+1.6*k);pz(P,'chest',-.1+.25*k);P.root.y=-1.2*k}},
 // lance / chakram : bras levé en arrière, puis jeté de tout le corps
 km_spear:(P,e)=>{if(e<.4){const k=ezo(e/.4);pz(P,'armR',-2.9*k,0,-.15);pz(P,'foreR',-.9*k);pz(P,'armL',-1.2*k,0,.3);pz(P,'foreL',-.4);pz(P,'chest',-.12*k,-.35*k);pz(P,'thighR',.3*k);pz(P,'thighL',-.25*k)}
  else{const k=ezo(Math.min(1,(e-.4)/.22));pz(P,'armR',-2.9+1.4*k,0,-.15);pz(P,'foreR',-.9+.9*k);pz(P,'armL',-1.2+1*k,0,.3+.4*k);pz(P,'foreL',-.4);pz(P,'chest',-.12+.35*k,-.35+.7*k);pz(P,'thighL',-.25-.3*k);pz(P,'shinL',.3*k);P.root.y=-1.5*k}},
 // bras grands ouverts (ailes, rempart, reformation)
 km_open:(P,e)=>{const k=ezo(Math.min(1,e/.3));pz(P,'armL',-.55*k,0,1.25*k);pz(P,'foreL',-.3*k);pz(P,'armR',-.55*k,0,-1.25*k);pz(P,'foreR',-.3*k);pz(P,'chest',-.15*k);pz(P,'head',-.12*k);pz(P,'cape',-.4*k);P.root.y=2*k},
 // mains jointes (sceau), puis bras levés vers le ciel (ultimes)
 km_pray:(P,e)=>{if(e<.55){const k=ezo(Math.min(1,e/.25));pz(P,'armL',-1.15*k,0,-.5*k);pz(P,'foreL',-1.5*k);pz(P,'armR',-1.15*k,0,.5*k);pz(P,'foreR',-1.5*k);pz(P,'head',.12*k)}
  else{const k=ezo(Math.min(1,(e-.55)/.25));pz(P,'armL',-1.15-1.75*k,0,-.5+.85*k);pz(P,'foreL',-1.5+1.3*k);pz(P,'armR',-1.15-1.75*k,0,.5-.85*k);pz(P,'foreR',-1.5+1.3*k);pz(P,'chest',-.2*k);pz(P,'head',-.25*k);P.root.y=2.5*k}},
 // le corps se défait : bras pendants écartés, il flotte et tourne
 km_scatter:(P,e,u,t)=>{const b=bump(e);P.rootR.y=Math.sin(t*9)*.5*b;P.root.y=4*b;pz(P,'armL',-.3,0,.9*b+.1);pz(P,'foreL',-.25);pz(P,'armR',-.3,0,-.9*b-.1);pz(P,'foreR',-.25);pz(P,'chest',.12*b);pz(P,'head',.18*b);pz(P,'hair',.5*b);pz(P,'cape',-.5*b)},
 // main tendue vers la cible, l'autre au sceau (papillons, cocon)
 km_point:(P,e)=>{const k=ezo(Math.min(1,e/.25));pz(P,'armL',-1.55*k,0,.05);pz(P,'foreL',-.05);pz(P,'armR',-1*k,0,-.35*k);pz(P,'foreR',-1.9*k);pz(P,'chest',.08*k,-.3*k);pz(P,'head',.05,.2*k)},
});
