// ===== Clan Akimichi =====
// Identité : les décuplements (Baika) et les calories. Encaisser, frapper au corps à corps et manger remplissent la jauge ;
// chaque décuplement en brûle 50 pour frapper plus fort et plus large (+20 % de dégâts, +15 % de taille), le Mode Papillon brûle tout.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c3',[
 [1,'C','x.ak_palm','Paume géante','Gifle géante devant soi : repousse fort, renvoie les projectiles, étourdit si la cible heurte un obstacle','tai'],
 [2,'D','x.ak_roll','Boulet humain','Roule en boulet 0,6 s en suivant la visée : percute les ennemis sur sa route, les écarte et les ralentit','tai'],
 [3,'B','x.ak_arm','Décuplement partiel','Bras géant lancé droit devant : saisit le 1er ennemi et le jette derrière soi, étourdi à l\'atterrissage','tai'],
 [3,'B','x.ak_spike','Boulet à pointes','Boulet hérissé inarrêtable, peu maniable : rebondit sur obstacles et bords ; chaque passage fait saigner','tai'],
 [4,'C','x.ak_red','Pilule rouge','Pilule du piment : soigne, libère des contrôles et remplit la jauge de calories','heal'],
 [1,'A','x.ak_slam','Chôdan Bakugeki','Le ventre enfle et s\'abat devant soi : gros dégâts et étourdit, bien plus au centre','tai'],
 [4,'D','x.ak_pill','Pilule verte','Pilule d\'épinards : bouclier, vitesse 3 s, endurance et +25 calories','heal'],
 [5,'S','x.ak_butterfly','Mode Papillon','Ailes de chakra 4,5 s (+1 s / 34 calories) : géant, rapide, +35 % de dégâts, bouclier, ignore les ralentissements ; épuisé après','ak_bf'],
 [5,'B','x.ak_baika','Décuplement','Devient géant 3 s : inarrêtable, et le sol tremble sans cesse autour de lui (dégâts, ralentit)','tai'],
]);
// ---- calories : jauge 0-100 (2 portions de 50)
// décuplement : brûle 50 calories si possible → 1 (suralimenté : +20 % de dégâts, +15 % de taille), sinon 0
function ak_burn(u){if((u.ak_cal||0)<50)return 0;u.ak_cal-=50;say(u,'SURALIMENTÉ','#ffb04a');jx({jfx:'ak_fed',ui:units.indexOf(u),x:u.x,y:u.y,t:.6,m:.6});return 1}
const ak_add=(u,v)=>{u.ak_cal=Math.min(100,(u.ak_cal||0)+v)};
// tenue sombre ? (boulet et ventre prennent la couleur de la tenue : motifs clairs sur une tenue sombre)
const ak_dark=c=>{if(typeof c!=='string'||c[0]!=='#')return false;const h=c.length===4?c.slice(1).split('').map(x=>x+x).join(''):c.slice(1,7),n=parseInt(h,16);return .299*(n>>16)+.587*(n>>8&255)+.114*(n&255)<85};
TRAITS[3]={nom:'Calories',desc:'Encaisser des coups, frapper au corps à corps et manger (pilules, ou chips en rechargeant le chakra) remplit la jauge. Paume, bras, ventre et Décuplement brûlent 50 calories : +20 % de dégâts et plus grands. Le Mode Papillon brûle tout.',
 init(u){u.ak_cal=20},
 update(u,dt){if(u.chk){ak_add(u,9*dt);if(!u.anim||u.anim.k!=='ak_eat')anim(u,'ak_eat',.7)}
  // filet de sécurité : un état dessiné (boulet, bras, ailes) sans son objet aux est remis à zéro
  if((u.ak_roll>0||u.ak_arm||u.ak_bf>0)&&!aux.some(x=>x.owner===u&&(x.type==='ak_roll'||x.type==='ak_arm'||x.type==='ak_wings'))){u.ak_roll=0;u.ak_spk=0;u.ak_arm=null;u.ak_bf=0}},
 deal(src,t,dmg,o){if(o.melee&&dmg>0)ak_add(src,dmg*.2);return dmg},
 take(t,src,dmg,o){if(src&&src!==t&&dmg>0)ak_add(t,dmg*.25);return dmg},
 // sur le ninja : sachet de chips quand il recharge, vapeur de chaleur quand une portion est prête
 draw(u,p,S,sk){const c=u.ak_cal||0,t=performance.now()/1000,H=S*sk;
  if(u.chk){const bx=p.x+Math.cos(u.aim)*9*S,by=p.y-26*H;g.fillStyle='#d8302a';g.strokeStyle='#1a1410';g.lineWidth=1.5;g.beginPath();g.moveTo(bx-6*S,by-8*S);for(let i=0;i<=4;i++)g.lineTo(bx-6*S+i*3*S,by-(i%2?10:8)*S);g.lineTo(bx+6*S,by+8*S);g.lineTo(bx-6*S,by+8*S);g.closePath();g.fill();g.stroke();
   g.fillStyle='#ffd34a';g.fillRect(bx-4*S,by-2*S,8*S,4*S);for(let i=0;i<2;i++){const k=(t*2.2+i*.5)%1,x=lerp(bx,p.x,k),y=lerp(by-8*S,p.y-34*H,k)-Math.sin(Math.PI*k)*10*S;circ(x,y,2.2*S,'#f2c040')}}
  if(c>=50){g.save();g.globalCompositeOperation='lighter';const n=c>=100?5:3;g.lineWidth=2*S;for(let i=0;i<n;i++){const k=(t*.8+i/n)%1,x=p.x+Math.sin(i*2.4+t*1.5)*12*S,y=p.y-(28+k*44)*H;g.strokeStyle=rgba(i%2?'#ffb04a':'#ff7a2a',.55*(1-k));g.beginPath();g.moveTo(x,y+7*S);g.quadraticCurveTo(x+5*S*Math.sin(t*5+i),y,x,y-7*S);g.stroke()}
   if(c>=100){g.strokeStyle=rgba('#ff9a3a',.3+.2*Math.sin(t*6));g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,19*S,19*S*K,0,0,7);g.stroke()}g.restore()}},
 // jauge à droite de la barre de vie (2 portions de 50), libellé dans la jauge : rien au-dessus (en bataille, la barre des renforts y passe)
 hud(u,x,y){const c=u.ak_cal||0,X=x+368,Y=45,W=96,H=11,t=performance.now()/1000,n=Math.floor(c/50);
  g.fillStyle='rgba(0,0,0,.6)';g.fillRect(X,Y,W,H);g.fillStyle=n?'#ff9a3a':'#a8683a';g.fillRect(X,Y,W*c/100,H);g.fillStyle='#04050b';g.fillRect(X+W/2-1,Y,2,H);
  g.strokeStyle=n?rgba('#ffd36a',.55+.45*Math.sin(t*6)):'#5a3a1e';g.lineWidth=1;g.strokeRect(X,Y,W,H);
  g.font='bold 9px "Trebuchet MS",system-ui,sans-serif';g.textAlign='center';g.lineWidth=2.5;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText('CALORIES',X+W/2,Y+H-2);g.fillStyle=n?'#fff3d0':'#d8c0a0';g.fillText('CALORIES',X+W/2,Y+H-2);
  if(n)text('×'+n,X+W+5,Y+H,12,'#ffd36a','left')}};
// ---- mécaniques
const AK_SLAM=.4,AK_ARM_ST=.3; // AK_SLAM : délai entre la fin des mudras du Chôdan Bakugeki et l'écrasement (zone d'alerte visible) ; AK_ARM_ST : étourdissement à l'atterrissage du bras
Object.assign(NAT,{
 // Paume géante : la main grandit et balaie l'avant ; repousse (écrase contre un obstacle) et renvoie les projectiles
 ak_palm:S_('Paume géante','Gifle géante devant soi : repousse fort, renvoie les projectiles, étourdit si la cible heurte un obstacle',9,{hero:'sister',line:{len:190,w:190},ai:RG(185,.6)},(u,a)=>{const F=ak_burn(u),R=185*(1+.15*F),M=1+.2*F;
  S('heavy',u);anim(u,'ak_slap',.45);jx({jfx:'ak_palm',ui:units.indexOf(u),x:u.x,y:u.y,a,r:R,t:.5,m:.5});
  later(u,.1,()=>{if(u.dead)return;let n=0;for(const e of enemies(u))if(dist(u,e)<R+e.r&&angDiff(ang(u,e),a)<.85&&hit(e,u,11*M,{melee:1,unblockable:1,kb:760,wall:.8,fx:u.x,fy:u.y})){n++;jx({jfx:'shock',x:e.x,y:e.y,r:46,t:.3,m:.3,col:'#ffe0b0'})}
   for(const p of projs)if(p.owner.team!==u.team&&clashOk(p)&&Math.hypot(p.x-u.x,p.y-u.y)<R+30&&angDiff(Math.atan2(p.y-u.y,p.x-u.x),a)<1)reflect(p,u);
   if(n){S('hit',u);if(nearMe(u.x,u.y))shake=Math.max(shake,.16)}})}),
 // Boulet humain (Nikudan Sensha) : roule en suivant la visée, percute et écarte les ennemis
 ak_roll:S_('Boulet humain','Roule en boulet 0,6 s en suivant la visée : percute les ennemis sur sa route, les écarte et les ralentit',7,{hero:'chewie',ai:{mode:'gap',min:130,max:360,p:.5}},(u,a)=>{S('dash',u);S('heavy',u);anim(u,'ak_ball',.7);
  aux.push({type:'ak_roll',x:u.x,y:u.y,a,r:0,t:.6,m:.6,team:u.team,owner:u,ui:units.indexOf(u),vfx:'tai',k:0,hs:[]});u.ak_roll=.6;sparks(u.x,u.y,'#e8dcc8',10,'smoke')}),
 // Décuplement partiel : le bras file comme un grappin, saisit le premier ennemi et le jette par-dessus soi
 ak_arm:S_('Décuplement partiel','Bras géant lancé droit devant : saisit le 1er ennemi et le jette derrière soi, étourdi à l\'atterrissage',12,{hero:'chewie',line:{len:270,w:44},ai:RG(250,.6)},(u,a)=>{const F=ak_burn(u);S('heavy',u);anim(u,'ak_reach',.45);u.slow=Math.max(u.slow,.35);
  aux.push({type:'ak_arm',x:u.x,y:u.y,a,len:0,mx:265*(1+.15*F),M:1+.2*F,t:1.4,m:1.4,team:u.team,owner:u,ui:units.indexOf(u),ti:null,st:0,k:0,vfx:'tai'})}),
 // Boulet à pointes (Nikudan Hari Sensha) : boulet hérissé inarrêtable, qui tourne à peine et rebondit sur les obstacles et les bords
 ak_spike:S_('Boulet à pointes','Boulet hérissé inarrêtable, peu maniable : rebondit sur obstacles et bords ; chaque passage fait saigner',10,{line:{len:480,w:56},ai:RG(400,.55)},(u,a)=>{S('dash',u);S('saber',u);anim(u,'ak_ball',1.05);u.unstop=Math.max(u.unstop,1);
  aux.push({type:'ak_roll',x:u.x,y:u.y,a,r:0,t:1,m:1,team:u.team,owner:u,ui:units.indexOf(u),vfx:'tai',k:0,hs:[],spk:1,ht:{}});u.ak_roll=1;u.ak_spk=1;sparks(u.x,u.y,'#d8dde6',10)}),
 // Pilule rouge (piment) : soin, libération et jauge de calories pleine
 ak_red:S_('Pilule rouge','Pilule du piment : soigne, libère des contrôles et remplit la jauge de calories',12,{hero:'bossk',ai:HEALM},(u)=>{heal(u,40);cleanse(u);u.ak_cal=100;anim(u,'ak_pill',.55);S('fire',u);
  jx({jfx:'ak_pill',ui:units.indexOf(u),x:u.x,y:u.y,col:'#ff3a2a',red:1,t:.9,m:.9});later(u,.27,()=>{if(u.dead)return;say(u,'CALORIES MAX','#ff7a2a');if(near(u.x,u.y))S('roar',u)})}),
 // Chôdan Bakugeki : le ventre enfle, monte puis s'abat ; le centre écrase bien plus fort (zone d'alerte sans dégâts : les bots l'esquivent comme les autres)
 ak_slam:S_('Chôdan Bakugeki','Le ventre enfle et s\'abat devant soi : gros dégâts et étourdit, bien plus au centre',11,{tele:{r:140,max:120},ai:RG(220,.6)},(u,a,td)=>{const F=ak_burn(u),R=135*(1+.15*F),M=1+.2*F,D=AK_SLAM,p=fwd(u,a,clamp(td||120,40,120));
  S('heavy',u);anim(u,'ak_belly',D*1.5);u.unstop=Math.max(u.unstop,D+.05);u.giant=Math.max(u.giant,D+.4);jx({jfx:'ak_belly',ui:units.indexOf(u),x:p.x,y:p.y,a,r:R,t:D/.66,m:D/.66});
  zone(u,p.x,p.y,R,0,D,{silent:1,quiet:1},'#e8dcc8');lastZ().deto='ak_none';
  later(u,D,()=>{if(u.dead)return;for(const e of enemies(u)){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<R+e.r){const c=d<R*.5+e.r;hit(e,u,(c?32:22)*M,{stun:c?.9:.4,kb:c?120:280,fx:p.x,fy:p.y,unblockable:1})}}
   jx({jfx:'ak_crack',x:p.x,y:p.y,r:R,t:.9,m:.9});jx({jfx:'shock',x:p.x,y:p.y,r:R*1.2,t:.5,m:.5,col:'#e8c8a0'});sparks(p.x,p.y,'#a07850',16,'earth');sparks(p.x,p.y,'#e8dcc8',10,'smoke');if(near(p.x,p.y)){S('rock',u);if(nearMe(p.x,p.y))shake=Math.max(shake,.35)}})}),
 // Pilule verte (épinards) : bouclier, vitesse, endurance, et c'est de la nourriture : +25 calories
 ak_pill:S_('Pilule verte','Pilule d\'épinards : bouclier, vitesse 3 s, endurance et +25 calories',8,{ai:DEF},(u)=>{shieldU(u,20,3);u.haste=Math.max(u.haste,3);u.stam=Math.min(100,u.stam+40);u.blockLock=0;ak_add(u,25);anim(u,'ak_pill',.45);S('poof',u);
  jx({jfx:'ak_pill',ui:units.indexOf(u),x:u.x,y:u.y,col:'#4ad04a',t:.8,m:.8})}),
 // Mode Papillon : brûle toutes les calories (+1 s par 34), ailes de chakra, puissance maximale ; épuisé à la fin
 ak_butterfly:ULT('Mode Papillon','Ailes de chakra 4,5 s (+1 s / 34 calories) : géant, rapide, +35 % de dégâts, bouclier, ignore les ralentissements ; épuisé après',{ai:SELF(320,.8)},(u)=>{const c=u.ak_cal||0,D=4.5+Math.floor(c/34);u.ak_cal=0;
  S('roar',u);anim(u,'ak_bfly',.9);for(const k of['giant','haste','rage','slowImm'])u[k]=Math.max(u[k]||0,D);shieldU(u,20,D);u.ak_bf=D;
  aux.push({type:'ak_wings',x:u.x,y:u.y,r:0,t:D,m:D,team:u.team,owner:u,ui:units.indexOf(u),k:0,vfx:'ak_bf'});
  aoe(u,u.x,u.y,150,8,{kb:280,quiet:1},'#ff7ad8');jx({jfx:'ak_bfburst',ui:units.indexOf(u),x:u.x,y:u.y,t:.9,m:.9});if(D>5)say(u,'+'+Math.round(D-4.5)+' s','#ffb04a')}),
 // Décuplement (Baika) : géant inarrêtable, le sol tremble autour de lui
 ak_baika:ULT('Décuplement','Devient géant 3 s : inarrêtable, et le sol tremble sans cesse autour de lui (dégâts, ralentit)',{hero:'savage',ai:SELF(220,.8)},(u)=>{const F=ak_burn(u);S('roar',u);S('heavy',u);anim(u,'ak_grow',.8);
  u.giant=Math.max(u.giant,3);u.unstop=Math.max(u.unstop,3);aux.push({type:'ak_quake',x:u.x,y:u.y,r:95*(1+.15*F),t:3,m:3,team:u.team,owner:u,ui:units.indexOf(u),k:.35,M:1+.2*F,vfx:'tai'});
  jx({jfx:'ak_grow',ui:units.indexOf(u),x:u.x,y:u.y,t:.8,m:.8})}),
});
Object.assign(NATHERO,{ak:'chewie'});
AFTER.push(()=>{UK.push('ak_cal','ak_roll','ak_spk','ak_arm','ak_bf');Object.assign(VP,{ak_bf:['#ff7ad8','#a8f0ff','#ffffff']})});
// ---- logique des objets (hôte)
// direction voulue par le lanceur pendant qu'il roule (souris, entrée réseau ou cible du bot)
function ak_want(u){if(u.ctrl==='local'){const m=unP(mouse.x,mouse.y);return Math.atan2(m.y-u.y,m.x-u.x)}if(u.ctrl==='remote'){const Q=peerOf(u.rid);if(Q&&Q.in)return Math.atan2((+Q.in.ay||0)-u.y,(+Q.in.ax||0)-u.x)}return u.tgt&&!u.tgt.dead?ang(u,u.tgt):u.aim}
// traînée du dash du moteur (points couleur chakra) : poussière au sol pour le boulet, traits de vitesse blancs pour une cible projetée
function ak_trail(u,air){for(let i=Math.max(0,fx.length-12);i<fx.length;i++){const f=fx[i];if(f.r!==6||f.m!==.25||f.vx!==0||f.vfx||Math.abs(f.x-u.x)>30||Math.abs(f.y-u.y)>30)continue;
 if(air){f.col='rgba(246,242,234,.75)';f.r=3.5}else{f.z=3;f.col='#ddd0bc';f.vfx='smoke';f.r=2.5+rnd()*2;f.t=f.m=.5;f.vx=(rnd()-.5)*50;f.vy=(rnd()-.5)*30}}}
// boulet : avance en tournant vers la visée et s'arrête contre un obstacle (le boulet à pointes, lui, rebondit) ; un étourdissement l'arrête
AUXF.ak_roll=(x,dt)=>{const u=x.owner;if(u.dead||(!x.spk&&u.stun>0)){x.t=0;u.ak_roll=0;u.ak_spk=0;return}if(x.spk)return ak_spikeF(x,u,dt);
 if(x.lx!=null&&x.ex>2&&Math.hypot(u.x-x.lx,u.y-x.ly)<x.ex*.45){x.t=0;u.ak_roll=0;u.kx=-Math.cos(x.a)*160;u.ky=-Math.sin(x.a)*160;jx({jfx:'shock',x:u.x,y:u.y,r:40,t:.3,m:.3,col:'#e8dcc8'});sparks(u.x,u.y,'#e8dcc8',10,'smoke');if(near(u.x,u.y))S('rock',u);return}
 let d=ak_want(u)-x.a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;x.a+=clamp(d,-4.2*dt,4.2*dt);u.aim=x.a;
 for(const e of enemies(u))if(!x.hs.includes(e)&&Math.hypot(e.x-u.x,e.y-u.y)<u.r+e.r+16){x.hs.push(e);const s=(-(e.x-u.x)*Math.sin(x.a)+(e.y-u.y)*Math.cos(x.a))<0?-1:1,b=x.a+s*1.1;
  VFX='tai';hit(e,u,10,{unblockable:1,slow:.6,kb:430,fx:e.x-Math.cos(b)*20,fy:e.y-Math.sin(b)*20});VFX=null;jx({jfx:'shock',x:e.x,y:e.y,r:44,t:.3,m:.3,col:'#ffe0b0'});if(near(e.x,e.y)){S('heavy',u);if(nearMe(e.x,e.y))shake=Math.max(shake,.12)}}
 if(x.t<=0){u.ak_roll=0;sparks(u.x,u.y,'#e8dcc8',8,'smoke');return}
 ak_trail(u,0);
 const sp=560;x.lx=u.x;x.ly=u.y;x.ex=sp*dt;u.dash={sx:u.x,sy:u.y,tx:u.x+Math.cos(x.a)*sp*dt,ty:u.y+Math.sin(x.a)*sp*dt,t:0,dur:dt,jump:0};x.x=u.x;x.y=u.y;u.ak_roll=x.t};
AUXD.ak_roll=()=>{};
// boulet à pointes : rebondit (obstacles, murs ennemis, bords), écarte les ennemis touchés (de nouveau touchables après 0,6 s) ;
// le saignement est une brûlure sans élément marquée el:-2 (champ dotEl synchronisé : gouttes de sang dessinées chez tous)
function ak_spikeF(x,u,dt){for(const e of enemies(u)){const kk=e.c+'|'+e.team;if(SIMT-(x.ht[kk]||-9)<.6||Math.hypot(e.x-u.x,e.y-u.y)>=u.r+e.r+14)continue;x.ht[kk]=SIMT;const sd=(-(e.x-u.x)*Math.sin(x.a)+(e.y-u.y)*Math.cos(x.a))<0?-1:1,bk=x.a+sd*1.2;
  VFX='tai';hit(e,u,17,{unblockable:1,slow:.6,kb:330,dot:{dps:3,dur:3},el:-2,fx:e.x-Math.cos(bk)*20,fy:e.y-Math.sin(bk)*20});VFX=null;sparks(e.x,e.y,'#c03030',6);jx({jfx:'shock',x:e.x,y:e.y,r:44,t:.3,m:.3,col:'#e8e8f0'});if(near(e.x,e.y)){S('saber',u);if(nearMe(e.x,e.y))shake=Math.max(shake,.12)}}
 if(x.t<=0){u.ak_roll=0;u.ak_spk=0;sparks(u.x,u.y,'#e8dcc8',8,'smoke');return}
 ak_trail(u,0);
 {let d=ak_want(u)-x.a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;x.a+=clamp(d,-1.6*dt,1.6*dt)}
 const sp=620;let vx=Math.cos(x.a),vy=Math.sin(x.a),nx=u.x+vx*sp*dt,ny=u.y+vy*sp*dt,b=0;
 for(const o of OBST.concat(walls.filter(w=>w.team!==u.team))){const d=Math.hypot(nx-o.x,ny-o.y);if(d<o.r+u.r&&d>0){const n0=(nx-o.x)/d,n1=(ny-o.y)/d,dp=vx*n0+vy*n1;if(dp<0){vx-=2*dp*n0;vy-=2*dp*n1;b=1}}}
 if(nx<B.x+u.r+2&&vx<0||nx>B.x+B.w-u.r-2&&vx>0){vx=-vx;b=1}if(ny<B.y+u.r+2&&vy<0||ny>B.y+B.h-u.r-2&&vy>0){vy=-vy;b=1}
 if(b){x.a=Math.atan2(vy,vx);jx({jfx:'shock',x:u.x,y:u.y,r:40,t:.3,m:.3,col:'#e8dcc8'});sparks(u.x,u.y,'#e8dcc8',6,'smoke');if(near(u.x,u.y)){S('rock',u);if(nearMe(u.x,u.y))shake=Math.max(shake,.08)}}
 u.aim=x.a;u.dash={sx:u.x,sy:u.y,tx:u.x+Math.cos(x.a)*sp*dt,ty:u.y+Math.sin(x.a)*sp*dt,t:0,dur:dt,jump:0};x.x=u.x;x.y=u.y;u.ak_roll=x.t}
// bras : s'allonge (1300 px/s), saisit le premier ennemi sur sa ligne, le tient pendant le vol, puis se rétracte
AUXF.ak_arm=(x,dt)=>{const u=x.owner;if(u.dead){x.t=0;u.ak_arm=null;return}x.x=u.x;x.y=u.y;const ca=Math.cos(x.a),sa=Math.sin(x.a);
 if(x.st===0){if(u.stun>0)x.st=2;else{x.len+=1300*dt;let b=null,bf=1e9;for(const e of enemies(u)){const dx=e.x-u.x,dy=e.y-u.y,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f>0&&f<x.len+e.r&&s<e.r+22&&f<bf){bf=f;b=e}}
  if(b){x.len=Math.max(30,bf);ak_grab(x,u,b)}else if(x.len>=x.mx){x.len=x.mx;x.st=2}}}
 else if(x.st===1){const e=x.tg;if(!e||e.dead||!e.dash)x.st=2;else{u.x=x.hx;u.y=x.hy;u.vx=u.vy=0;x.len=Math.hypot(e.x-u.x,e.y-u.y);x.a=Math.atan2(e.y-u.y,e.x-u.x);ak_trail(e,1)}}
 else{x.len-=2400*dt;if(x.len<=0)x.t=0}
 u.ak_arm=x.t>0?{a:x.a,l:x.len,g:x.st,ti:x.st===1?x.ti:-1}:null};
AUXD.ak_arm=()=>{};
function ak_grab(x,u,e){const M=x.M;if(!hit(e,u,5*M,{unblockable:1})){x.st=2;return}
 if(e.dead||e.unstop>0){if(!e.dead)hit(e,u,10*M,{unblockable:1,kb:220});x.st=2;return}
 x.st=1;x.tg=e;x.ti=units.indexOf(e);x.hx=u.x;x.hy=u.y;anim(u,'ak_heave',.55);S('heavy',u);say(e,'SAISI','#ffb04a');const b=fwd(u,x.a+Math.PI,125);e.stun=Math.max(e.stun,.5);e.cast=null;e.spin=null;e.flame=null;e.block=false;
 e.dash={sx:e.x,sy:e.y,tx:b.x,ty:b.y,t:0,dur:.5,jump:115,end:()=>ak_land(u,e,M)}}
function ak_land(u,e,M){const V=VFX;VFX='tai';if(!u.dead&&!e.dead){hit(e,u,14*M,{stun:AK_ARM_ST,unblockable:1});for(const o of enemies(u))if(o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<75+o.r)hit(o,u,8*M,{kb:240,fx:e.x,fy:e.y,unblockable:1})}
 jx({jfx:'ak_crack',x:e.x,y:e.y,r:70,t:.7,m:.7});sparks(e.x,e.y,'#a07850',10,'earth');sparks(e.x,e.y,'#e8dcc8',8,'smoke');if(near(e.x,e.y)){S('boom',e);if(nearMe(e.x,e.y))shake=Math.max(shake,.25)}VFX=V}
// ailes du Mode Papillon : planent au-dessus du sol ; à la fin, épuisement
AUXF.ak_wings=(x,dt)=>{const u=x.owner;if(u.dead){x.t=0;u.ak_bf=0;return}x.x=u.x;x.y=u.y;u.ak_bf=Math.max(0,x.t);u.z=Math.max(u.z||0,7+Math.sin(SIMT*5)*2.5);
 if(x.t<=0){u.ak_bf=0;u.slow=Math.max(u.slow,1.5);say(u,'ÉPUISÉ','#d8c8b8');sparks(u.x,u.y,'#e8e0f0',10,'smoke')}};
// Décuplement : onde toutes les 0,6 s autour du géant
AUXF.ak_quake=(x,dt)=>{const u=x.owner;if(u.dead){x.t=0;return}x.x=u.x;x.y=u.y;if(x.k>0)return;x.k=.6;VFX='tai';
 for(const e of enemies(u))if(Math.hypot(e.x-u.x,e.y-u.y)<x.r+e.r)hit(e,u,4*x.M,{slow:.4,unblockable:1,fx:u.x,fy:u.y});VFX=null;
 jx({jfx:'ak_crack',x:u.x,y:u.y,r:x.r*.8,t:.55,m:.55});jx({jfx:'shock',x:u.x,y:u.y,r:x.r,t:.35,m:.35,col:'#d8a070'});sparks(u.x,u.y,'#e8dcc8',5,'smoke');if(near(u.x,u.y)){S('rock',u);if(nearMe(u.x,u.y))shake=Math.max(shake,.06)}};
// ---- dessins
// cercle du séisme autour du géant
AUXD.ak_quake=(x,k,t)=>{const u=x.ui!=null?units[x.ui]:null;if(!u||u.dead)return;const pl=.5+.5*Math.sin(t*10.5);g.fillStyle=rgba('#000000',.2*k);gEll(u.x,u.y,36);g.fill();
 g.strokeStyle=rgba('#d8a070',(.25+.25*pl)*k);g.lineWidth=2;g.setLineDash([10,7]);g.lineDashOffset=-t*40;gEll(u.x,u.y,x.r);g.stroke();g.setLineDash([]);g.fillStyle=rgba('#a07850',.08*k);gEll(u.x,u.y,x.r);g.fill();
 for(let i=0;i<7;i++){const b=i*.9+(i%2?t*.6:-t*.5),r=x.r*(.55+.4*((i*37)%10)/10),q=P(u.x+Math.cos(b)*r,u.y+Math.sin(b)*r,Math.abs(Math.sin(t*9+i*1.7))*14);g.fillStyle=i%2?'#8a6a48':'#a07850';g.fillRect(q.x-2.5*q.s,q.y-2.5*q.s,5*q.s,5*q.s)}};
// ailes de chakra (dessinées derrière les ninjas)
AUXD.ak_wings=(x,k,t)=>{const u=x.ui!=null?units[x.ui]:null;if(!u||u.dead)return;const q=P(u.x,u.y,u.z||0),s=q.s*1.3*(u.giant>0?1.35:1)*(u.ch.look.scale||1)*.62,cx=q.x,cy=q.y-58*s,fl=.7+.3*Math.sin(t*8);
 const W=(sd)=>{g.beginPath();g.moveTo(6*s,0);g.bezierCurveTo(28*s,-62*s,80*s,-74*s,90*s,-40*s);g.bezierCurveTo(94*s,-14*s,52*s,-2*s,6*s,5*s);g.moveTo(6*s,8*s);g.bezierCurveTo(48*s,8*s,68*s,32*s,52*s,52*s);g.bezierCurveTo(38*s,62*s,16*s,38*s,6*s,12*s)};
 for(const sd of[-1,1]){g.save();g.translate(cx,cy);g.scale(sd*fl,1);W();g.fillStyle=rgba('#ff5ac8',.38*k);g.fill();g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=1.5;g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#7fe8ff',.45*k);g.lineWidth=5;g.stroke();g.strokeStyle=rgba('#ffd0f0',.5*k);g.lineWidth=1.2;g.beginPath();g.moveTo(8*s,0);g.quadraticCurveTo(40*s,-30*s,84*s,-44*s);g.moveTo(8*s,0);g.quadraticCurveTo(46*s,-12*s,80*s,-20*s);g.moveTo(8*s,10*s);g.quadraticCurveTo(38*s,22*s,50*s,46*s);g.stroke();
  circ(62*s,-44*s,9*s,rgba('#ffffff',.35*k));circ(42*s,-28*s,5*s,rgba('#ffe0f6',.45*k));circ(36*s,32*s,6*s,rgba('#ffffff',.3*k));g.restore()}
 g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const a=t*1.7+i*1.05,r=(50+(i%3)*18)*s;circ(cx+Math.cos(a)*r,cy+Math.sin(a*1.3)*r*.4-((t*30+i*20)%40)*s,2*s+1,rgba(i%2?'#ffb8ec':'#c8f6ff',.75*k))}};
// boulet (par-dessus le ninja) et bras géant (à la profondeur du lanceur)
STATD.push((u,p,S,sk)=>{const t=performance.now()/1000,L=u.ch.look;
 // saignement (boulet à pointes) : gouttes de sang qui perlent
 if(u.dotT>0&&u.dotEl===-2){g.strokeStyle='rgba(60,0,8,.55)';g.lineWidth=1;for(let i=0;i<4;i++){const k=(t*1.5+i*.25)%1,x=p.x+Math.sin(i*2.3+.6)*12*S,y=p.y-(48-k*42)*S*sk,r=(2.4-k*.8)*S;g.fillStyle=rgba(i%2?'#e0182a':'#b00c1c',.95*(1-k*.5));g.beginPath();g.moveTo(x,y-r*2.2);g.quadraticCurveTo(x+r*1.3,y+r*.2,x,y+r);g.quadraticCurveTo(x-r*1.3,y+r*.2,x,y-r*2.2);g.fill();g.stroke()}}
 if(u.ak_roll>0){if(u._tr)u._tr.length=0;const R=30*S*sk,a=Math.atan2(Math.sin(u.aim)*K,Math.cos(u.aim)),cx=p.x+Math.cos(a)*R*.16,cy=p.y-R*.9+Math.sin(a)*R*.1,col=L.torso||'#d87a3a',ph=t*13,dk=L._akDk??(L._akDk=ak_dark(col));
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx,p.y,R*.95,R*.32,0,0,7);g.fill();
  g.fillStyle=rgba('#e8dcc8',.2);for(let i=1;i<3;i++){g.beginPath();g.arc(cx-Math.cos(a)*R*.55*i,cy-Math.sin(a)*R*.55*i,R*(1-i*.15),0,7);g.fill()}
  g.save();g.translate(cx,cy);g.fillStyle=col;g.strokeStyle='#1a1410';g.lineWidth=3;g.beginPath();g.arc(0,0,R,0,7);g.fill();g.stroke();
  g.rotate(a);g.lineCap='round';g.strokeStyle=dk?rgba('#ffe6c0',.5):rgba('#1a1410',.45);g.lineWidth=R*.13;g.beginPath();g.arc(0,0,R*.64,ph,ph+1.5);g.moveTo(Math.cos(ph+3.14)*R*.64,Math.sin(ph+3.14)*R*.64);g.arc(0,0,R*.64,ph+3.14,ph+4.64);g.moveTo(Math.cos(ph+1.6)*R*.3,Math.sin(ph+1.6)*R*.3);g.arc(0,0,R*.3,ph+1.6,ph+2.9);g.stroke();
  g.strokeStyle=rgba('#ffffff',dk?.5:.3);g.lineWidth=R*.07;g.beginPath();g.arc(0,0,R*.82,ph+.5,ph+1.6);g.stroke();g.restore();if(dk){g.strokeStyle=rgba('#ffffff',.22);g.lineWidth=2;g.beginPath();g.arc(cx,cy,R*.93,3.5,5.2);g.stroke()}
  const hc=L.head&&L.head.hair||'#3a2a1a',hx=cx+Math.cos(a)*R*.3;g.fillStyle=hc;g.strokeStyle='#1a1410';g.lineWidth=1.5;g.beginPath();g.moveTo(hx-R*.36,cy-R*.84);g.lineTo(hx-R*.2,cy-R*1.2);g.lineTo(hx-R*.02,cy-R*.96);g.lineTo(hx+R*.16,cy-R*1.24);g.lineTo(hx+R*.36,cy-R*.86);g.closePath();g.fill();g.stroke();
  if(u.ak_spk){g.fillStyle='#c8ccd4';g.strokeStyle='#1a1410';g.lineWidth=1.3;g.beginPath();for(let i=0;i<11;i++){const b=ph*.55+i*.571,c=Math.cos(b),sn=Math.sin(b);g.moveTo(cx+c*R*.9-sn*R*.1,cy+sn*R*.9+c*R*.1);g.lineTo(cx+c*R*1.38,cy+sn*R*1.38);g.lineTo(cx+c*R*.9+sn*R*.1,cy+sn*R*.9-c*R*.1)}g.fill();g.stroke()}
  circ(cx-R*.4,cy-R*.42,R*.18,rgba('#ffffff',.38));g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=2.5;g.beginPath();g.arc(cx,cy,R*1.14,a+2.1,a+2.9);g.stroke();g.beginPath();g.arc(cx,cy,R*1.27,a+3.4,a+4.1);g.stroke()}
 const A=u.ak_arm;if(A&&A.l>4){const tg=A.ti>=0?units[A.ti]:null,sx=u.x+Math.cos(A.a+1.57)*9,sy=u.y+Math.sin(A.a+1.57)*9,s0=P(sx,sy,(u.z||0)+44),
  e1=tg&&!tg.dead?P(tg.x,tg.y,(tg.z||0)+30):P(u.x+Math.cos(A.a)*A.l,u.y+Math.sin(A.a)*A.l,30),dx=e1.x-s0.x,dy=e1.y-s0.y,dl=Math.hypot(dx,dy)||1,nx=-dy/dl,ny=dx/dl,w0=7*S,w1=13*S,skin=L.head&&L.head.skin||'#f6d6b4';
  g.fillStyle=skin;g.strokeStyle='#1a1410';g.lineWidth=2.5;g.beginPath();g.moveTo(s0.x+nx*w0,s0.y+ny*w0);g.lineTo(e1.x+nx*w1,e1.y+ny*w1);g.lineTo(e1.x-nx*w1,e1.y-ny*w1);g.lineTo(s0.x-nx*w0,s0.y-ny*w0);g.closePath();g.fill();g.stroke();
  g.fillStyle=L.torso||'#d87a3a';g.beginPath();g.moveTo(s0.x+nx*(w0+2),s0.y+ny*(w0+2));g.lineTo(s0.x+dx*.18+nx*(w0+3),s0.y+dy*.18+ny*(w0+3));g.lineTo(s0.x+dx*.18-nx*(w0+3),s0.y+dy*.18-ny*(w0+3));g.lineTo(s0.x-nx*(w0+2),s0.y-ny*(w0+2));g.closePath();g.fill();g.stroke();
  const ha=Math.atan2(dy,dx),hr=(A.g===1?17:15)*S;g.save();g.translate(e1.x,e1.y);g.rotate(ha);g.fillStyle=skin;g.beginPath();
  if(A.g===1){g.ellipse(0,0,hr,hr*1.1,0,0,7);g.fill();g.stroke();g.beginPath();for(let i=0;i<4;i++){const y=(-.6+i*.4)*hr;g.moveTo(hr*.2,y);g.lineTo(hr*.85,y)}g.stroke()}
  else{g.ellipse(0,0,hr*.85,hr,0,0,7);for(let i=0;i<4;i++){const y=(-.75+i*.5)*hr;g.moveTo(hr*.5,y);g.roundRect(hr*.5,y-hr*.17,hr*1.1,hr*.34,hr*.17)}g.fill();g.stroke();g.beginPath();g.ellipse(-hr*.1,-hr*1.05,hr*.45,hr*.2,-.6,0,7);g.fill();g.stroke()}g.restore();
  if(A.g===0){g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=1.5;g.beginPath();for(const o of[-1,1]){g.moveTo(s0.x+dx*.3+nx*o*(w1+6),s0.y+dy*.3+ny*o*(w1+6));g.lineTo(s0.x+dx*.75+nx*o*(w1+6),s0.y+dy*.75+ny*o*(w1+6))}g.stroke()}}});
// main géante qui balaie l'avant (de la droite vers la gauche)
JFXD.ak_palm=(f,k,e,t,u)=>{if(!u||u.dead)return;const sw=ezo(Math.min(1,e/.36)),a0=f.a+1.1,th=a0-1.85*sw,D=f.r*.58,hx=u.x+Math.cos(th)*D,hy=u.y+Math.sin(th)*D,q=P(hx,hy,36),
 sh=P(u.x+Math.cos(f.a+1.57)*9,u.y+Math.sin(f.a+1.57)*9,44),ra=Math.atan2(Math.sin(th)*K,Math.cos(th)),R=f.r*.24*q.s,al=e<.55?1:Math.max(0,1-(e-.55)/.45),skin=u.ch.look.head.skin||'#f6d6b4',o=P(u.x,u.y,36);
 g.globalAlpha=al;g.strokeStyle=rgba('#ffffff',.35);g.lineWidth=R*.7;g.beginPath();g.ellipse(o.x,o.y,D*q.s,D*q.s*K,0,th,a0);g.stroke();
 const wx=q.x-Math.cos(ra)*R*.85,wy=q.y-Math.sin(ra)*R*.85;g.lineCap='round';g.strokeStyle='#1a1410';g.lineWidth=R*.9+5;g.beginPath();g.moveTo(sh.x,sh.y);g.lineTo(wx,wy);g.stroke();g.strokeStyle=skin;g.lineWidth=R*.9;g.stroke();
 g.save();g.translate(q.x,q.y);g.rotate(ra);g.fillStyle=skin;g.strokeStyle='#1a1410';g.lineWidth=2.5;g.beginPath();g.ellipse(0,0,R,R*.95,0,0,7);
 for(let i=0;i<4;i++){const y=(-.72+i*.48)*R,L=R*(i===0||i===3?.95:1.15);g.moveTo(R*.55+L,y);g.roundRect(R*.55,y-R*.2,L,R*.4,R*.2)}g.fill();g.stroke();
 g.beginPath();g.ellipse(R*.2,R*1.05,R*.55,R*.24,.7,0,7);g.fill();g.stroke();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffb04a',.5);g.lineWidth=4;g.beginPath();g.ellipse(R*.35,0,R*1.65,R*1.25,0,0,7);g.stroke();g.restore()};
// ventre géant : enfle en montant vers la zone, puis s'écrase et s'aplatit
JFXD.ak_belly=(f,k,e,t,u)=>{if(!u)return;const T=.66,L=u.ch.look;
 if(e<T){const s=ezo(e/T),cx=lerp(u.x,f.x,.12+.88*s),cy=lerp(u.y,f.y,.12+.88*s),q=P(cx,cy,40+s*40),R=(18+f.r*.62*s)*q.s;g.fillStyle=rgba('#000000',.25*s);gEll(f.x,f.y,f.r*.75*s);g.fill();ak_bellyD(q.x,q.y,R,R*(1-.08*Math.sin(t*20)*s),L)}
 else{const s=(e-T)/(1-T),q=P(f.x,f.y,6),R=f.r*.62*q.s;g.globalAlpha=Math.max(0,1-s*1.3);ak_bellyD(q.x,q.y-R*.3,R*(1.25+.2*s),R*(.55-.2*s),L)}};
// ventre : la tunique remonte sur un ventre nu (nombril), ceinture et pantalon en bas ; lisible quelle que soit la couleur de la tenue
function ak_bellyD(x,y,rx,ry,L){const col=L.torso||'#d87a3a',belt=L.belt||'#3a2a1a',legs=L.legs||belt,skin=L.head&&L.head.skin||'#f6d6b4',hy=y+ry*.08,py=y+ry*.62;
 g.save();g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fillStyle=skin;g.fill();g.clip();
 g.fillStyle=col;g.beginPath();g.moveTo(x-rx-2,y-ry-2);g.lineTo(x+rx+2,y-ry-2);g.lineTo(x+rx+2,hy-ry*.2);g.quadraticCurveTo(x,hy+ry*.18,x-rx-2,hy-ry*.2);g.closePath();g.fill();
 g.fillStyle=legs;g.beginPath();g.moveTo(x-rx-2,y+ry+2);g.lineTo(x+rx+2,y+ry+2);g.lineTo(x+rx+2,py-ry*.12);g.quadraticCurveTo(x,py+ry*.14,x-rx-2,py-ry*.12);g.closePath();g.fill();
 g.strokeStyle=belt;g.lineWidth=Math.max(2,ry*.1);g.beginPath();g.moveTo(x-rx-2,py-ry*.12);g.quadraticCurveTo(x,py+ry*.14,x+rx+2,py-ry*.12);g.stroke();
 g.strokeStyle='rgba(26,20,16,.6)';g.lineWidth=Math.max(1.5,ry*.035);g.beginPath();g.moveTo(x-rx-2,hy-ry*.2);g.quadraticCurveTo(x,hy+ry*.18,x+rx+2,hy-ry*.2);g.stroke();
 g.beginPath();g.arc(x,(hy+py)/2+ry*.06,Math.max(1.5,rx*.05),.3,Math.PI-.3);g.stroke();
 g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.moveTo(x+rx*.8,y-ry*.18);g.ellipse(x-rx*.16,y-ry*.18,rx*.96,ry*.96,0,0,7);g.fill('evenodd');
 circ(x-rx*.38,y-ry*.46,rx*.18,rgba('#ffffff',.3));if(ry>rx*.7&&rx>16)ak_kanji(x+rx*.08,y-ry*.42,rx*.2,'#fff3d0');
 g.restore();g.strokeStyle='#1a1410';g.lineWidth=3;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.stroke()}
// kanji 食 (emblème des Akimichi), en quelques traits
function ak_kanji(x,y,s,col){g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x-s*.95,y-s*.32);g.lineTo(x,y-s);g.lineTo(x+s*.95,y-s*.32);g.moveTo(x-s*.2,y-s*.56);g.lineTo(x+s*.2,y-s*.56);
 g.rect(x-s*.48,y-s*.3,s*.96,s*.62);g.moveTo(x-s*.48,y+s*.01);g.lineTo(x+s*.48,y+s*.01);g.moveTo(x-s*.48,y+s*.32);g.lineTo(x-s*.48,y+s*.95);g.lineTo(x-s*.18,y+s*.76);g.moveTo(x+s*.02,y+s*.42);g.lineTo(x+s*.72,y+s*.95);g.moveTo(x+s*.58,y+s*.36);g.lineTo(x+s*.22,y+s*.62);
 g.strokeStyle='#1a1410';g.lineWidth=s*.36;g.stroke();g.strokeStyle=col;g.lineWidth=s*.18;g.stroke()}
DETO.ak_none=()=>{};
// fissures du sol (impact, atterrissage, séisme)
JFXD.ak_crack=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s,z=Math.min(1,e*6);g.strokeStyle=rgba('#e8dcc8',.5*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(q.x,q.y,R*(.45+e*.75),R*(.45+e*.75)*K,0,0,7);g.stroke();
 g.strokeStyle=rgba('#2a1c10',.8*Math.min(1,k*2));g.lineWidth=2.2;g.beginPath();for(let i=0;i<7;i++){const b=i*.9+f.x*.013,L=R*(.5+.4*((i*37)%10)/10)*z;g.moveTo(q.x,q.y);for(let j=1;j<=3;j++){const bb=b+Math.sin(i*3+j*2)*.32;g.lineTo(q.x+Math.cos(bb)*L*j/3,q.y+Math.sin(bb)*L*j/3*K)}}g.stroke()};
// pilule avalée : vole de la main à la bouche, puis bouffée de chaleur (rouge) ou spirale de feuilles (verte)
JFXD.ak_pill=(f,k,e,t,u)=>{if(!u||u.dead)return;const c=f.col,q=P(u.x,u.y,u.z||0),sc=q.s*1.3*(u.giant>0?1.35:1)*(u.ch.look.scale||1),hy=q.y-34*sc;
 if(e<.28){const s=e/.28,a=u.aim,h=P(u.x+Math.cos(a)*16,u.y+Math.sin(a)*16,26),x=lerp(h.x,q.x,s),y=lerp(h.y,hy,s)-Math.sin(Math.PI*s)*30*q.s,w=6*q.s;
  g.save();g.translate(x,y);g.rotate(t*12);g.strokeStyle='#1a1410';g.lineWidth=2;g.fillStyle=c;g.beginPath();g.ellipse(-w*.55,0,w,w*.8,0,0,7);g.fill();g.stroke();g.fillStyle='#fff6e8';g.beginPath();g.ellipse(w*.55,0,w,w*.8,0,0,7);g.fill();g.stroke();circ(-w*.6,-w*.3,w*.25,'rgba(255,255,255,.8)');g.restore();return}
 const s=(e-.28)/.72,ks=1-s;g.strokeStyle=rgba(c,.8*ks);g.lineWidth=5*ks+1;g.beginPath();g.ellipse(q.x,q.y,(18+s*70)*sc,(18+s*70)*sc*K,0,0,7);g.stroke();g.globalCompositeOperation='lighter';
 if(f.red){g.fillStyle=rgba('#ff3a1a',.2*ks);g.beginPath();g.ellipse(q.x,q.y-22*sc,22*sc,30*sc,0,0,7);g.fill();
  for(let i=0;i<9;i++){const b=i*.7+t*2.5,x=q.x+Math.cos(b)*17*sc,y=q.y-(2+((s*80+i*11)%46))*sc,h=(12+5*Math.sin(t*9+i))*sc;g.fillStyle=rgba(i%2?'#ff7a2a':'#ff3a1a',.85*ks);g.beginPath();g.moveTo(x-4*sc,y);g.quadraticCurveTo(x,y-h,x+4*sc,y);g.fill()}
  g.globalCompositeOperation='source-over';for(const sd of[-1,1])for(let i=0;i<3;i++){const z=(s*1.6+i*.3)%1;circ(q.x+sd*(9+z*16)*sc,hy-(2+z*18)*sc,(2+z*5)*sc,rgba('#f6f2ee',.8*(1-z)*ks))}}
 else{for(let i=0;i<10;i++){const b=i*.63+s*8,r=(20-s*6)*sc,x=q.x+Math.cos(b)*r,y=q.y-(s*50+i*3.5)*sc+Math.sin(b)*r*.35;g.fillStyle=rgba(i%2?'#5ad05a':'#b8ffb0',.85*ks);g.beginPath();g.ellipse(x,y,5*sc,2*sc,b,0,7);g.fill()}
  g.fillStyle=rgba('#4ad04a',.16*ks);g.beginPath();g.ellipse(q.x,q.y-22*sc,20*sc,29*sc,0,0,7);g.fill()}};
// « suralimenté » : flammèches orange autour du ninja
JFXD.ak_fed=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,u.z||0),s=q.s*1.3*(u.ch.look.scale||1);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff9a3a',.8*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-36*s,(16+e*26)*s,(26+e*34)*s,0,0,7);g.stroke();
 for(let i=0;i<6;i++){const b=i*1.05+t*4,x=q.x+Math.cos(b)*16*s,y=q.y-(18+e*56+(i%3)*8)*s;g.fillStyle=rgba(i%2?'#ffd36a':'#ff7a2a',.75*k);g.beginPath();g.moveTo(x-3*s,y);g.quadraticCurveTo(x,y-12*s,x+3*s,y);g.fill()}};
// éclosion du Mode Papillon : anneau et nuée de papillons de chakra
JFXD.ak_bfburst=(f,k,e,t)=>{const q=P(f.x,f.y,40);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff7ad8',.8*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(q.x,q.y+30*q.s,(30+e*150)*q.s,(30+e*150)*q.s*K,0,0,7);g.stroke();
 for(let i=0;i<9;i++){const b=i*.7+.3,r=(20+e*140)*q.s,x=q.x+Math.cos(b)*r,y=q.y+Math.sin(b)*r*K-e*50*q.s,fl=Math.abs(Math.sin(t*18+i))*.8+.2,w=7*q.s;g.fillStyle=rgba(i%2?'#ff9ae8':'#a8f0ff',.85*k);
  g.beginPath();g.ellipse(x-w*fl*.6,y,w*fl,w*.8,-.5,0,7);g.fill();g.beginPath();g.ellipse(x+w*fl*.6,y,w*fl,w*.8,.5,0,7);g.fill()}};
// Décuplement : anneaux d'expansion et flèches qui poussent vers l'extérieur
JFXD.ak_grow=(f,k,e,t,u)=>{const q=u?P(u.x,u.y,0):P(f.x,f.y,0);for(let i=0;i<3;i++){const s=clamp(e*1.6-i*.25,0,1);if(s<=0||s>=1)continue;g.strokeStyle=rgba(i%2?'#ffb04a':'#d87a3a',.8*(1-s));g.lineWidth=6*(1-s)+1;g.beginPath();g.ellipse(q.x,q.y,(20+s*130)*q.s,(20+s*130)*q.s*K,0,0,7);g.stroke()}
 g.strokeStyle=rgba('#fff3d0',.75*k);g.lineWidth=2.5;g.beginPath();for(let i=0;i<8;i++){const b=i*.785,r0=(30+e*50)*q.s,r1=r0+18*q.s;g.moveTo(q.x+Math.cos(b)*r0,q.y-44*q.s+Math.sin(b)*r0*.8);g.lineTo(q.x+Math.cos(b)*r1,q.y-44*q.s+Math.sin(b)*r1*.8)}g.stroke()};
// ---- animations 3D
Object.assign(ANIM,{
 // gifle : bras droit armé sur le côté puis balayé vers l'avant
 ak_slap:(P,e)=>{const w=e<.22?ezo(e/.22):1,s=e<.22?0:ezo(Math.min(1,(e-.22)/.2));pz(P,'armR',-1.15-.45*s,0,-1.45*w*(1-s)+.35*s);pz(P,'foreR',-.12);pz(P,'chest',.08+.28*s,.55*w*(1-s)-.6*s);pz(P,'armL',-.5,0,.5);pz(P,'foreL',-.8);
  P.root.z=6*s;P.root.y=-2*s;pz(P,'thighR',-.6*s);pz(P,'shinR',.6*s);pz(P,'thighL',.3*s)},
 // boulet : recroquevillé
 ak_ball:(P)=>{P.root.y=-9;pz(P,'thighL',-1.6);pz(P,'shinL',2.2);pz(P,'thighR',-1.6);pz(P,'shinR',2.2);pz(P,'chest',.9);pz(P,'spine',.4);pz(P,'head',.6);pz(P,'armL',-1.2,0,-.5);pz(P,'foreL',-2);pz(P,'armR',-1.2,0,.5);pz(P,'foreR',-2)},
 // bras lancé droit devant
 ak_reach:(P,e)=>{const k=ezo(Math.min(1,e/.25));pz(P,'armR',-1.62*k,0,.05);pz(P,'foreR',0);pz(P,'armL',.5*k,0,.4);pz(P,'chest',.35*k,-.35*k);P.root.z=5*k;P.root.y=-2*k;pz(P,'thighR',-.7*k);pz(P,'shinR',.6*k);pz(P,'thighL',.4*k)},
 // projection par-dessus la tête
 ak_heave:(P,e)=>{const k=ezio(e),a=-1.4-2.2*k;pz(P,'armR',a,0,.1);pz(P,'armL',a,0,-.1);pz(P,'foreR',-.3);pz(P,'foreL',-.3);pz(P,'chest',.3-.75*k);pz(P,'head',-.3*k);P.root.y=-3+2*k;pz(P,'thighL',-.3);pz(P,'shinL',.5);pz(P,'thighR',.3);pz(P,'shinR',.4)},
 // ventre : inspire en gonflant, puis coup de ventre vers l'avant
 ak_belly:(P,e)=>{const up=e<.6,k=up?ezo(e/.6):1,s=up?0:ezo(Math.min(1,(e-.6)/.12));pz(P,'armL',-.3+.2*s,0,1.3*k-.5*s);pz(P,'armR',-.3+.2*s,0,-1.3*k+.5*s);pz(P,'foreL',-.4);pz(P,'foreR',-.4);
  pz(P,'chest',-.4*k+1*s);pz(P,'spine',-.2*k+.3*s);pz(P,'head',-.3*k+.2*s);P.root.y=3*k-6*s;P.root.z=-3*k+12*s;pz(P,'thighL',-.4*s);pz(P,'shinL',.8*s);pz(P,'thighR',.5*s);pz(P,'shinR',.6*s)},
 // pilule : main à la bouche, puis il gonfle les bras
 ak_pill:(P,e)=>{if(e<.45){const k=ezo(e/.45);pz(P,'armR',-2.1*k,0,.45*k);pz(P,'foreR',-2.3*k);pz(P,'head',.1*k)}else{const k=ezo(Math.min(1,(e-.45)/.25));pz(P,'armL',-.3,0,1.1*k);pz(P,'armR',-.3,0,-1.1*k);pz(P,'foreL',-1.6*k);pz(P,'foreR',-1.6*k);pz(P,'chest',-.3*k);pz(P,'head',-.4*k);P.root.y=1.5*k}},
 // chips : le sachet dans la main gauche, la droite fait l'aller-retour vers la bouche
 ak_eat:(P,e,u,t)=>{const c=Math.max(0,Math.sin(t*9));pz(P,'armL',-1.1,0,-.25);pz(P,'foreL',-1.6);pz(P,'armR',-1.5-.6*c,0,.35);pz(P,'foreR',-1.8-.6*c);pz(P,'head',.15-.12*c)},
 // papillon : bras grands ouverts, il s'élève
 ak_bfly:(P,e)=>{const k=ezo(Math.min(1,e/.3));pz(P,'armL',-2.2*k,0,1.2*k);pz(P,'armR',-2.2*k,0,-1.2*k);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'chest',-.35*k);pz(P,'head',-.4*k);P.root.y=6*k;pz(P,'thighL',-.3*k);pz(P,'shinL',.6*k);pz(P,'shinR',.5*k)},
 // décuplement : se ramasse puis se déploie en gonflant les muscles
 ak_grow:(P,e)=>{if(e<.35){const k=ezo(e/.35);P.root.y=-6*k;pz(P,'chest',.4*k);pz(P,'armL',-.3,0,.3);pz(P,'armR',-.3,0,-.3);pz(P,'thighL',-.6*k);pz(P,'shinL',1.1*k);pz(P,'thighR',-.6*k);pz(P,'shinR',1.1*k)}
  else{const k=ezo(Math.min(1,(e-.35)/.3));P.root.y=-6+9*k;pz(P,'chest',.4-.75*k);pz(P,'head',-.45*k);pz(P,'armL',-.8*k,0,1.3*k);pz(P,'armR',-.8*k,0,-1.3*k);pz(P,'foreL',-1.5*k);pz(P,'foreR',-1.5*k)}},
});
