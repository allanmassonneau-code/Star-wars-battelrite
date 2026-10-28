// ===== Raiton (foudre) =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('n3',[
 [1,'D','x.ra_bolt','Raiton : Éclair','Trait de foudre très rapide qui ralentit','lightning'],
 [1,'D','x.ra_dis','Raiton : Décharge','Décharge autour de soi après un court instant : étourdit','lightning'],
 [1,'C','x.ra_chain','Raiton : Chaîne d\'éclairs','Éclair qui rebondit sur 3 ennemis proches','lightning'],
 [1,'C','x.ra_nagashi','Raiton : Chidori Nagashi','Courant électrique autour de soi : blesse et étourdit au contact, puis 2 s de riposte qui étourdit','lightning'],
 [1,'B','x.ra_spear','Raiton : Chidori Eisô','Lance de foudre instantanée qui transperce en ligne et étourdit brièvement','lightning'],
 [1,'B','x.ra_panther','Raiton : Panthère noire','Panthère de foudre qui traque la cible et l\'étourdit','lightning'],
 [1,'A','x.ra_chidori','Chidori','Charge la foudre dans la main puis fonce : gros dégâts, étourdit et projette la première cible','chidori'],
 [1,'A','x.ra_storm','Raiton : Orage','3 éclairs s\'abattent l\'un après l\'autre sur la zone visée : chacun étourdit brièvement','lightning'],
 [2,'C','x.ra_step','Raiton : Pas de l\'éclair','Fonce en éclair à travers les ennemis, qu\'il blesse et ralentit','lightning'],
 [5,'S','x.ra_kirin','Raiton : Kirin','Un dragon de foudre s\'abat du ciel sur la zone : énormes dégâts, étourdit','kirin'],
 [5,'S','x.ra_armor','Raiton : Armure de foudre','8 s : très rapide, +35 % de dégâts et 25 % de dégâts en moins','lightning'],
]);
Object.assign(NAT,{
 ra_bolt:S_('Raiton : Éclair','Trait de foudre très rapide qui ralentit',4,{ai:RG(520,.7)},(u,a)=>{S('zap',u);proj(u,a,{spd:1400,r:6,dmg:11,life:.42,col:'#ffe14a',slow:.8,kind:'bolt'})}),
 ra_dis:S_('Raiton : Décharge','Décharge autour de soi après un court instant : étourdit',9,{tele:{self:1,r:120},ai:SELF(130,.6)},(u)=>{S('zap',u);zone(u,u.x,u.y,120,12,.35,{stun:.7},'#ffe14a');lastZ().follow=u}),
 ra_chain:S_('Raiton : Chaîne d\'éclairs','Éclair qui rebondit sur 3 ennemis proches',7,{ai:RG(480,.6)},(u,a)=>{S('zap',u);proj(u,a,{spd:1100,r:7,dmg:14,life:.45,col:'#ffe14a',chain:3,kind:'bolt'})}),
 ra_nagashi:S_('Raiton : Chidori Nagashi','Courant électrique autour de soi : blesse et étourdit au contact, puis 2 s de riposte qui étourdit',10,{ai:SELF(110,.6)},(u)=>{S('zap',u);aoe(u,u.x,u.y,100,10,{stun:.45},'#bfe6ff');u.riposte=2;u.riposteS=1;for(let i=0;i<6;i++)fx.push({bolt:2,x:u.x+(rnd()-.5)*120,y:u.y+(rnd()-.5)*90,t:.25,m:.25,col:'#bfe6ff',vfx:'lightning'})}),
 ra_spear:S_('Raiton : Chidori Eisô','Lance de foudre instantanée qui transperce en ligne et étourdit brièvement',9,{line:{len:520,w:26},ai:RG(500,.55)},(u,a)=>{beamHit(u,a,520,26,22,{stun:.35},'#bfe6ff')}),
 ra_panther:S_('Raiton : Panthère noire','Panthère de foudre qui traque la cible et l\'étourdit',11,{ai:RG(560,.6)},(u,a)=>{S('zap',u);S('roar',u);proj(u,a,{spd:560,r:13,dmg:18,life:1.3,col:'#ffe14a',home:1,stun:.9,kind:'panther'})}),
 ra_chidori:S_('Chidori','Charge la foudre dans la main puis fonce : gros dégâts, étourdit et projette la première cible',10,{ai:{mode:'gap',min:90,max:330,p:.6}},(u,a,td)=>{S('chidori',u);dash(u,a,clamp((td||300)+20,120,330),.2,{dmg:34,kb:160,air:.6})}),
 ra_storm:S_('Raiton : Orage','3 éclairs s\'abattent l\'un après l\'autre sur la zone visée : chacun étourdit brièvement',12,{tele:{r:110,max:450},ai:RG(450,.6)},(u,a,td)=>{const p=atP(u,a,td,450);for(let i=0;i<3;i++){const b=i*2.1+rnd(),d=i?45:0;zone(u,p.x+Math.cos(b)*d,p.y+Math.sin(b)*d*.8,80,14,.45+i*.3,{stun:.3},'#ffe14a')}}),
 ra_kirin:ULT('Raiton : Kirin','Un dragon de foudre s\'abat du ciel sur la zone : énormes dégâts, étourdit',{tele:{r:150,max:480},ai:{max:480,p:.8}},(u,a,td)=>{const p=atP(u,a,td,480);zone(u,p.x,p.y,150,58,1.1,{stun:1.1},'#bfe6ff')}),
 ra_armor:ULT('Raiton : Armure de foudre','8 s : très rapide, +35 % de dégâts et 25 % de dégâts en moins',{ai:SELF(320,.8)},(u)=>{S('chidori',u);u.haste=Math.max(u.haste,8);u.rage=Math.max(u.rage,8);u.drT=Math.max(u.drT,8);u.dr=.25;u.auraV='lightning';ring(u.x,u.y,80,'#ffe14a')}),
 ra_step:S_('Raiton : Pas de l\'éclair','Fonce en éclair à travers les ennemis, qu\'il blesse et ralentit',7,{ai:{mode:'gap',min:120,max:280,p:.4}},(u,a)=>{S('zap',u);dash(u,a,260,.13,{dmg:10,through:1})}),
});
Object.assign(NATHERO,{ra:'ig88'});
// ---- visuels
PROJD.panther=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){g.strokeStyle=rgba('#ffe14a',.8);g.lineWidth=1.2;g.beginPath();g.moveTo(-20+rnd()*30,(rnd()-.5)*16);g.lineTo(-10+rnd()*30,(rnd()-.5)*16);g.stroke()}g.globalCompositeOperation='source-over';
 const run=Math.sin(t/40);g.fillStyle='#16161e';g.beginPath();g.ellipse(0,0,15,6,0,0,7);g.fill();g.beginPath();g.ellipse(14,-3,6,5,0,0,7);g.fill();g.beginPath();g.moveTo(11,-7);g.lineTo(13,-12);g.lineTo(15,-7);g.fill();
 g.strokeStyle='#16161e';g.lineWidth=3;g.lineCap='round';for(const [x,s] of[[-9,1],[-5,-1],[6,1],[10,-1]]){g.beginPath();g.moveTo(x,3);g.lineTo(x+run*s*5,10);g.stroke()}g.beginPath();g.moveTo(-14,-1);g.quadraticCurveTo(-24,-8,-28,-2+run*3);g.stroke();
 circ(17,-4,1.4,'#ffe14a');g.strokeStyle='#ffe14a';g.lineWidth=1;g.beginPath();g.moveTo(-12,-5);g.lineTo(-4,-2);g.lineTo(2,-6);g.lineTo(8,-3);g.stroke()};
PROJD.bolt=(p,R,ra)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe14a',.5);g.lineWidth=R*1.6;g.lineCap='round';g.beginPath();g.moveTo(-26,0);g.lineTo(6,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(-30,0);for(let i=1;i<6;i++)g.lineTo(-30+i*7,(rnd()-.5)*8);g.stroke()};
JFXD.bigbolt=(f,k,e,t)=>{const q=P(f.x,f.y,0),H=520*q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#bfe6ff',.35*k);gEll(f.x,f.y,f.r*(1+e*.3));g.fill();
 for(let j=0;j<3;j++){g.strokeStyle=j?rgba('#ffe14a',.7*k):rgba('#ffffff',.95*k);g.lineWidth=(j?3:7)*q.s*k+1;g.beginPath();let x=q.x+(rnd()-.5)*20,y=q.y-H;g.moveTo(x,y);while(y<q.y){y+=30*q.s;x+=(rnd()-.5)*36*q.s;g.lineTo(x,Math.min(y,q.y))}g.stroke()}
 if(f.dragon&&e<.5){g.strokeStyle=rgba('#bfe6ff',.9*k);g.lineWidth=5*q.s;g.beginPath();for(let i=0;i<20;i++){const yy=q.y-H+i*H/20,xx=q.x+Math.sin(i*.6+t*10)*40*q.s*(1-i/20);i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}};
DETO.kirin=(x,y,r)=>jx({jfx:'bigbolt',x,y,r,t:.8,m:.8,dragon:1});
DETO.lightning=(x,y,r)=>jx({jfx:'bigbolt',x,y,r:r*.8,t:.4,m:.4});
