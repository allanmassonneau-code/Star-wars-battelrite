// ---------- Kits sur mesure : Suiton, Raiton, Doton et techniques de clan ----------
// AUXF : logique (hôte) des objets spéciaux ; AUXD : leur dessin ; PROJD : dessin de projectiles propres ; JFXD / DETO : effets visuels en plus
const AUXF={},AUXD={},PROJD={},JFXD={},DETO={};
// effet différé (ne s'annule pas si le lanceur est étourdi) ; avec r > 0, un cercle d'alerte s'affiche au sol
function later(u,t,f,o){aux.push(Object.assign({type:'tele',x:u.x,y:u.y,r:0,t,m:t,team:u.team,owner:u,vfx:VFX,f},o))}
AUXF.tele=x=>{if(x.t<=0&&!x.done){x.done=1;const V=VFX;VFX=x.vfx;CUR=x.owner;x.f(x);CUR=null;VFX=V}};
AUXD.tele=(x,k)=>{if(!x.r)return;const c=vcol(x.vfx,'#fff'),e=1-x.t/x.m;g.fillStyle=rgba(DARKV[x.vfx]?'#101014':c,.12);gEll(x.x,x.y,x.r);g.fill();g.fillStyle=rgba(DARKV[x.vfx]?'#101014':c,.3);gEll(x.x,x.y,x.r*e);g.fill();g.strokeStyle=c;g.lineWidth=2;gEll(x.x,x.y,x.r);g.stroke()};
// anneau de choc : touche les ennemis entre r0 et r1
const ringHit=(u,x,y,r0,r1,dmg,o)=>{for(const e of enemies(u)){const d=Math.hypot(e.x-x,e.y-y);if(d>r0-e.r&&d<r1+e.r)hit(e,u,dmg,Object.assign({fx:x,fy:y,unblockable:1},o))}};
const atP=(u,a,td,R)=>fwd(u,a,Math.min(td||300,R));
const lastZ=()=>zones[zones.length-1];
// intangible (Kamui, Corps liquide, Taupe) et Izanagi
function izRevive(t){const s=t.izS;t.izT=0;t.hp=Math.max(s.hp,t.max*.25);t.x=s.x;t.y=s.y;t.kx=t.ky=0;cleanse(t);collide(t);ring(t.x,t.y,60,'#e0304a');say(t,'IZANAGI !','#e0304a');return true}
// prison aqueuse : la cible reste figée tant que le lanceur reste sur place
AUXF.prison=x=>{const o=x.owner,e=x.tg;if(!e||e.dead||o.dead||o.stun>0||e.unstop>0){x.t=0;return}
 e.x=x.x;e.y=x.y;e.kx=e.ky=0;e.stun=Math.max(e.stun,.12);e.cast=null;e.dash=null;o.root=Math.max(o.root,.12);o.disarm=Math.max(o.disarm,.12);
 if(x.k<=0){x.k=.5;VFX='water';hit(e,o,5,{silent:1});VFX=null}};
AUXD.prison=(x,k,t)=>{const e=x.ti!=null?units[x.ti]:null,o=x.ui!=null?units[x.ui]:null,q=P(x.x,x.y,30),R=34*q.s;
 if(o&&!o.dead){const a=P(o.x+Math.cos(ang(o,x))*16,o.y+Math.sin(ang(o,x))*16,30);g.strokeStyle=rgba('#bfe6ff',.6);g.lineWidth=3*q.s;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+q.x)/2,Math.min(a.y,q.y)-30*q.s,q.x,q.y);g.stroke()}
 const gr=g.createRadialGradient(q.x-R*.3,q.y-R*.4,R*.1,q.x,q.y,R*1.2);gr.addColorStop(0,rgba('#ffffff',.55*k));gr.addColorStop(.35,rgba('#7fc8ff',.35*k));gr.addColorStop(1,rgba('#1a6ad0',.5*k));g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-6*q.s,R,R*1.15,0,0,7);g.fill();
 g.strokeStyle=rgba('#e8f6ff',.8*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y-6*q.s,R,R*1.15,0,0,7);g.stroke();for(let i=0;i<5;i++){const b=t*2+i*1.3;circ(q.x+Math.cos(b)*R*.6,q.y-6*q.s-((t*30+i*12)%(R*1.6))+R*.6,2*q.s,rgba('#ffffff',.7*k))}};
// dôme des requins : ralentit, ronge PV et chakra des ennemis dedans, au profit du lanceur
AUXF.sdome=x=>{if(x.k>0)return;x.k=.25;const o=x.owner;for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){VFX='water';if(hit(e,o,3.5,{silent:1})){e.slow=Math.max(e.slow,.35);const d=Math.min(e.energy,3.5);e.energy-=d;o.energy=Math.min(100,o.energy+d);gain(o,1.5,o)}VFX=null}};
AUXD.sdome=(x,k,t)=>{const q=P(x.x,x.y,0);g.fillStyle=rgba('#1a6ad0',.18*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#bfe6ff',.6*k);g.lineWidth=2;gEll(x.x,x.y,x.r);g.stroke();
 const H=x.r*.9*q.s;g.strokeStyle=rgba('#7fc8ff',.35*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,x.r*q.s,H,0,Math.PI,0);g.stroke();g.fillStyle=rgba('#3aa8ff',.08*k);g.fill();
 for(let i=0;i<4;i++){const b=t*1.4+i*1.57,sx=q.x+Math.cos(b)*x.r*.7*q.s,sy=q.y-H*.4+Math.sin(b)*H*.35,f=Math.cos(b+1.57)>0?1:-1;g.save();g.translate(sx,sy);g.scale(f*q.s,q.s);g.fillStyle=rgba('#2a6ab0',.85*k);g.beginPath();g.ellipse(0,0,16,6,0,0,7);g.fill();g.beginPath();g.moveTo(-14,0);g.lineTo(-24,-7);g.lineTo(-22,6);g.fill();g.beginPath();g.moveTo(0,-5);g.lineTo(-5,-13);g.lineTo(-8,-5);g.fill();circ(10,-2,1.3,'#fff');g.restore()}};
// requin géant : avale les projectiles ennemis qu'il croise
AUXF.eater=x=>{const p=x.p;if(!p||p.dead||p.life<=0||projs.indexOf(p)<0){x.t=0;return}x.x=p.x;x.y=p.y;for(const q of projs)if(q!==p&&q.owner.team!==x.team&&Math.hypot(q.x-p.x,q.y-p.y)<p.r+30){q.life=0;q.dead=1;p.r=Math.min(40,p.r+2);if(near(q.x,q.y))sparks(q.x,q.y,'#bfe6ff',8,'water')}};
AUXD.eater=()=>{};

// dessin des projectiles sur mesure (repère du projectile, unité = pixel à l'échelle)
PROJD.shark=(p,R,ra,t)=>{g.rotate(ra);const S=R/12;g.scale(S,S);const w=Math.sin(t/90)*.25;
 for(let i=1;i<4;i++)circ(-14-i*9,Math.sin(t/80+i)*3,5-i,rgba('#bfe6ff',.5));g.fillStyle='#2a6ab0';g.beginPath();g.ellipse(0,0,22,9,0,0,7);g.fill();g.fillStyle='#d8eef8';g.beginPath();g.ellipse(2,4,16,4,0,0,Math.PI);g.fill();
 g.fillStyle='#2a6ab0';g.beginPath();g.moveTo(-18,0);g.lineTo(-32,-10+w*10);g.lineTo(-29,9+w*10);g.fill();g.beginPath();g.moveTo(-2,-8);g.lineTo(-9,-19);g.lineTo(-12,-7);g.fill();
 g.strokeStyle='#fff';g.lineWidth=1.2;g.beginPath();g.moveTo(12,3);g.lineTo(20,2);g.stroke();for(let i=0;i<4;i++){g.beginPath();g.moveTo(13+i*2,3);g.lineTo(14+i*2,5);g.stroke()}circ(13,-3,1.6,'#fff');circ(13,-3,.7,'#111')};
PROJD.panther=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){g.strokeStyle=rgba('#ffe14a',.8);g.lineWidth=1.2;g.beginPath();g.moveTo(-20+rnd()*30,(rnd()-.5)*16);g.lineTo(-10+rnd()*30,(rnd()-.5)*16);g.stroke()}g.globalCompositeOperation='source-over';
 const run=Math.sin(t/40);g.fillStyle='#16161e';g.beginPath();g.ellipse(0,0,15,6,0,0,7);g.fill();g.beginPath();g.ellipse(14,-3,6,5,0,0,7);g.fill();g.beginPath();g.moveTo(11,-7);g.lineTo(13,-12);g.lineTo(15,-7);g.fill();
 g.strokeStyle='#16161e';g.lineWidth=3;g.lineCap='round';for(const [x,s] of[[-9,1],[-5,-1],[6,1],[10,-1]]){g.beginPath();g.moveTo(x,3);g.lineTo(x+run*s*5,10);g.stroke()}g.beginPath();g.moveTo(-14,-1);g.quadraticCurveTo(-24,-8,-28,-2+run*3);g.stroke();
 circ(17,-4,1.4,'#ffe14a');g.strokeStyle='#ffe14a';g.lineWidth=1;g.beginPath();g.moveTo(-12,-5);g.lineTo(-4,-2);g.lineTo(2,-6);g.lineTo(8,-3);g.stroke()};
PROJD.mud=(p,R)=>{circ(0,0,R*1.1,'#5a4028');circ(-R*.3,-R*.3,R*.45,'#8a6a48');for(let i=0;i<3;i++)circ(-R*(1.2+i*.6),(rnd()-.5)*R,R*(.4-i*.1),rgba('#6a4a30',.7))};
PROJD.sandwave=(p,R,ra,t)=>{g.rotate(ra);for(let i=0;i<22;i++){const s=(i/21-.5)*2,h=(1-Math.abs(s))*R*1.6+Math.sin(t/60+i)*3;g.fillStyle=vcol('sand','',i);g.beginPath();g.ellipse(-Math.abs(s)*R*.8,s*R*1.6,R*.45,h*.35+4,0,0,7);g.fill()}g.fillStyle=rgba('#f0d8a0',.5);g.beginPath();g.ellipse(R*.2,0,R*.4,R*1.5,0,0,7);g.fill()};
PROJD.bolt=(p,R,ra)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe14a',.5);g.lineWidth=R*1.6;g.lineCap='round';g.beginPath();g.moveTo(-26,0);g.lineTo(6,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(-30,0);for(let i=1;i<6;i++)g.lineTo(-30+i*7,(rnd()-.5)*8);g.stroke()};
PROJD.petal=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle='#d8dde6';g.beginPath();g.moveTo(-6,-4);g.lineTo(10,0);g.lineTo(-6,4);g.fill();for(let i=0;i<6;i++){const b=t/80+i*1.05;g.save();g.translate(-8+Math.cos(b)*9,Math.sin(b)*7);g.rotate(b);g.fillStyle=i%2?'#ff9ac8':'#ffd8e8';g.beginPath();g.ellipse(0,0,4,2,0,0,7);g.fill();g.restore()}};
PROJD.spirit=(p,R,ra,t)=>{g.globalCompositeOperation='lighter';for(let i=0;i<5;i++)circ(-Math.cos(ra)*i*6,-Math.sin(ra)*i*6,R*(1-i*.15),rgba('#c080ff',.5-i*.08));circ(0,0,R*.5,'#fff')};
// effets visuels supplémentaires
JFXD.bigbolt=(f,k,e,t)=>{const q=P(f.x,f.y,0),H=520*q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#bfe6ff',.35*k);gEll(f.x,f.y,f.r*(1+e*.3));g.fill();
 for(let j=0;j<3;j++){g.strokeStyle=j?rgba('#ffe14a',.7*k):rgba('#ffffff',.95*k);g.lineWidth=(j?3:7)*q.s*k+1;g.beginPath();let x=q.x+(rnd()-.5)*20,y=q.y-H;g.moveTo(x,y);while(y<q.y){y+=30*q.s;x+=(rnd()-.5)*36*q.s;g.lineTo(x,Math.min(y,q.y))}g.stroke()}
 if(f.dragon&&e<.5){g.strokeStyle=rgba('#bfe6ff',.9*k);g.lineWidth=5*q.s;g.beginPath();for(let i=0;i<20;i++){const yy=q.y-H+i*H/20,xx=q.x+Math.sin(i*.6+t*10)*40*q.s*(1-i/20);i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}};
JFXD.mountain=(f,k,e)=>{const q=P(f.x,f.y,0),fall=Math.min(1,e*1.6),y=q.y-(1-fall)*420*q.s,R=f.r*q.s;g.fillStyle=rgba('#000',.3*fall);g.beginPath();g.ellipse(q.x,q.y,R*fall,R*.4*fall,0,0,7);g.fill();
 if(fall<1){g.fillStyle='#6a4a30';g.beginPath();g.moveTo(q.x-R,y);g.lineTo(q.x-R*.3,y-R*1.1);g.lineTo(q.x+R*.2,y-R*.8);g.lineTo(q.x+R*.6,y-R*1.3);g.lineTo(q.x+R,y);g.closePath();g.fill();g.fillStyle='#8a6a48';g.beginPath();g.moveTo(q.x-R*.3,y-R*1.1);g.lineTo(q.x+R*.2,y-R*.8);g.lineTo(q.x,y-R*.2);g.fill();g.fillStyle='#e8e8f0';g.beginPath();g.moveTo(q.x+R*.45,y-R*1.15);g.lineTo(q.x+R*.6,y-R*1.3);g.lineTo(q.x+R*.75,y-R*1.1);g.fill()}};
JFXD.shock=(f,k,e)=>{g.strokeStyle=rgba(f.col||'#c8a070',.8*k);g.lineWidth=6*k+1;gEll(f.x,f.y,f.r*(.3+e*.7));g.stroke();g.strokeStyle=rgba('#ffffff',.4*k);g.lineWidth=2;gEll(f.x,f.y,f.r*(.25+e*.7));g.stroke()};
JFXD.needles=(f,k,e)=>{const u=f.ui!=null?units[f.ui]:null,tg=f.ti!=null?units[f.ti]:null;if(!u||!tg)return;const a=P(u.x,u.y,0),b=P(tg.x,tg.y,0),m=Math.min(1,e*4);g.strokeStyle='rgba(10,10,14,.85)';g.lineWidth=5*a.s;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.x+(b.x-a.x)*m,a.y+(b.y-a.y)*m);g.stroke();
 if(m>=1){g.fillStyle='rgba(10,10,14,.9)';for(let i=0;i<5;i++){const c=i*1.25;g.beginPath();g.moveTo(b.x+Math.cos(c)*12*b.s,b.y+Math.sin(c)*5*b.s);g.lineTo(b.x+Math.cos(c)*3*b.s,b.y-(26+i*4)*b.s*k);g.lineTo(b.x+Math.cos(c)*6*b.s,b.y+Math.sin(c)*5*b.s);g.fill()}}};
JFXD.blackfire=(f,k,e,t)=>{const tg=f.ti!=null?units[f.ti]:null;if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0);for(let i=0;i<9;i++){const a=i*.7+t*3,x=q.x+Math.cos(a)*14*q.s,y=q.y-((t*60+i*17)%70)*q.s;g.fillStyle='#120a16';g.beginPath();g.moveTo(x-5*q.s,y);g.quadraticCurveTo(x,y-18*q.s,x+5*q.s,y);g.fill();g.strokeStyle='#6a2a8a';g.lineWidth=1;g.stroke()}};
DETO.kirin=(x,y,r)=>jx({jfx:'bigbolt',x,y,r,t:.8,m:.8,dragon:1});
DETO.lightning=(x,y,r)=>jx({jfx:'bigbolt',x,y,r:r*.8,t:.4,m:.4});
DETO.mountain=(x,y,r)=>{jx({jfx:'spikes',x,y,r,t:1.2,m:1.2,bone:0});jx({jfx:'shock',x,y,r:r*1.5,t:.6,m:.6})};

const S_=SP; // raccourci
Object.assign(NAT,{
 // ================= SUITON : contrôle, eau qui repousse, prisons =================
 su_ball:S_('Suiton : Teppôdama','Balle d\'eau qui éclate à l\'impact et ralentit autour',4,{ai:RG(500,.7)},(u,a)=>{S('water',u);proj(u,a,{spd:650,r:9,dmg:12,life:.75,col:'#3aa8ff',slow:1,onHit:(p,t)=>{aoe(p.owner,t.x,t.y,65,4,{slow:.9,quiet:1},'#3aa8ff')}})}),
 su_wall:S_('Suiton : Suijinheki','Dôme d\'eau autour de soi 1,5 s : arrête les tirs et repousse ceux qui sont collés',9,{ai:DEF},(u)=>{S('water',u);for(let i=0;i<12;i++){const b=i*Math.PI/6;walls.push({x:u.x+Math.cos(b)*60,y:u.y+Math.sin(b)*60,r:16,t:1.5,team:u.team,owner:u,water:1})}aoe(u,u.x,u.y,85,6,{kb:200},'#3aa8ff')}),
 su_jet:S_('Suiton : Mizurappa','Jet d\'eau puissant, immobile : repousse fort',7,{ai:RG(220,.6)},(u)=>{u.flame={t:1,k:0,R:230,arc:.35,d:3.5,kb:210,still:1,v:'water'};S('water',u)}),
 su_shark:S_('Suiton : Suikôdan','Requin d\'eau qui traque l\'ennemi le plus proche',7,{ai:RG(560,.6)},(u,a)=>{S('water',u);proj(u,a,{spd:520,r:12,dmg:18,life:1.4,col:'#3aa8ff',home:1,kind:'shark',o:{kb:130}})}),
 su_prison:S_('Suiton : Suirô','Bulle d\'eau : la cible est enfermée tant que tu restes sur place (2,5 s max)',12,{ai:RG(420,.6),line:{len:350,w:20}},(u,a)=>{S('water',u);proj(u,a,{spd:720,r:10,dmg:6,life:.5,col:'#3aa8ff',onHit:(p,t)=>{if(t.unstop>0||t.dead)return;say(t,'PRISON AQUEUSE','#7fc8ff');aux.push({type:'prison',ti:units.indexOf(t),ui:units.indexOf(p.owner),x:t.x,y:t.y,r:34,t:2.5,m:2.5,team:p.owner.team,owner:p.owner,tg:t,vfx:'water',k:.5})}})}),
 su_mist:S_('Suiton : Kirigakure','Brume épaisse 5 s : ennemis ralentis, alliés invisibles dedans',12,{ai:SELF(230,.4)},(u)=>{S('water',u);field(u,u.x,u.y,{r:200,t:5,slow:1,cloak:1,col:'#cfe8ff',vfx:'smoke'});u.stealth=Math.max(u.stealth,1)}),
 su_dragon:S_('Suiton : Dragon aqueux','Dragon d\'eau qui transperce toute une ligne, repousse et ralentit',11,{line:{len:680,w:34},ai:RG(600,.55)},(u,a)=>{S('water',u);proj(u,a,{spd:760,r:16,dmg:26,life:.9,col:'#3aa8ff',pierce:1,big:1,slow:1.2,o:{kb:220}})}),
 su_fall:S_('Suiton : Daibakufu','Une cascade s\'abat sur la zone visée : gros dégâts, repousse, puis sol inondé qui ralentit',12,{tele:{r:140,max:450},ai:RG(450,.6)},(u,a,td)=>{const p=atP(u,a,td,450);S('water',u);zone(u,p.x,p.y,140,30,.7,{kb:280,slow:1},'#3aa8ff');field(u,p.x,p.y,{r:140,t:3.8,slow:1,col:'#3aa8ff',vfx:'water'})}),
 su_big:ULT('Suiton : Daikôdan','Requin géant qui avale les jutsu ennemis sur sa route et explose en raz-de-marée',{line:{len:700,w:60},ai:{max:560,p:.8}},(u,a)=>{S('water',u);S('heavy',u);proj(u,a,{spd:470,r:24,dmg:46,life:1.6,col:'#3aa8ff',rocket:1,ar:150,kb:330,stun:.5,big:1,kind:'shark'});aux.push({type:'eater',x:u.x,y:u.y,r:0,t:1.7,m:1.7,team:u.team,owner:u,p:projs[projs.length-1]})}),
 su_dome:ULT('Suiton : Dôme des requins','Grand dôme d\'eau 5 s : les ennemis dedans sont ralentis et perdent PV et chakra, que tu récupères',{tele:{self:1,r:210},ai:SELF(220,.8)},(u)=>{S('water',u);S('heavy',u);aux.push({type:'sdome',x:u.x,y:u.y,r:210,t:5,m:5,team:u.team,owner:u,vfx:'water',k:0});ring(u.x,u.y,210,'#3aa8ff')}),
 su_liquid:S_('Suiton : Corps liquide','Se liquéfie et glisse vers l\'avant : intouchable pendant le glissement',7,{ai:ESC},(u,a)=>{S('water',u);dash(u,a,240,.32,{});u.phase=Math.max(u.phase||0,.45);sparks(u.x,u.y,'#3aa8ff',12,'water')}),
 // ================= RAITON : vitesse, perforation, étourdissements =================
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
 // ================= DOTON : murs, terrain, armure, projections =================
 do_rock:S_('Doton : Rocher','Lance un lourd rocher qui repousse',5,{ai:RG(480,.7)},(u,a)=>{S('rock',u);proj(u,a,{spd:560,r:12,dmg:16,life:.8,col:'#a07850',o:{kb:190}})}),
 do_wall:S_('Doton : Doryûheki','Grand mur de terre qui bloque tirs et passage pendant 6 s',10,{ai:DEF},(u,a)=>{S('rock',u);wallLine(u,a,3,{earth:1,t:6})}),
 do_spikes:S_('Doton : Doryûsô','Des pics de terre jaillissent en ligne devant soi et projettent en l\'air',8,{line:{len:340,w:70},ai:RG(320,.6)},(u,a)=>{const o={x:u.x,y:u.y},hs=new Set();for(let i=0;i<5;i++){const p=fwd(o,a,60+i*65);later(u,.02+i*.07,()=>{for(const e of enemies(u))if(!hs.has(e)&&Math.hypot(e.x-p.x,e.y-p.y)<46+e.r){hs.add(e);hit(e,u,13,{air:.45,unblockable:1})}detoFx(p.x,p.y,42,'earth');if(near(p.x,p.y))S('rock',u)},{x:p.x,y:p.y})}}),
 do_swamp:S_('Doton : Yomi Numa','Marécage sous la zone visée : les ennemis s\'y enlisent',10,{ai:RG(420,.5)},(u,a,td)=>{const p=atP(u,a,td,420);S('rock',u);field(u,p.x,p.y,{r:135,t:4.5,slow:1,dps:2,col:'#6a4a30',vfx:'earth'})}),
 do_armor:S_('Doton : Kyôka','Corps de roche 4 s : 45 % de dégâts en moins et inarrêtable, mais plus lent',13,{ai:DEF},(u)=>{S('rock',u);u.drT=Math.max(u.drT,4);u.dr=.45;u.unstop=Math.max(u.unstop,4);u.slow=Math.max(u.slow,4);ring(u.x,u.y,50,'#a07850')}),
 do_hand:S_('Doton : Main de terre','Une main de terre jaillit sous la zone visée et immobilise',10,{tele:{r:80,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=atP(u,a,td,420);zone(u,p.x,p.y,80,12,.45,{root:1.4},'#a07850')}),
 do_dragon:S_('Doton : Dragon de terre','Un dragon de terre crache 3 boulets de boue qui explosent et ralentissent',12,{tele:{r:120,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=atP(u,a,td,420);S('rock',u);for(let i=0;i<3;i++){const b=i*2.1+rnd(),d=i?55:0,x=p.x+Math.cos(b)*d,y=p.y+Math.sin(b)*d*.8,dl=.35+i*.15,dd=Math.hypot(x-u.x,y-u.y);
  zone(u,x,y,70,14,dl,{slow:1.2},'#8a6a48');projs.push({x:u.x,y:u.y,vx:(x-u.x)/dl,vy:(y-u.y)/dl,owner:u,src:u,rot:0,r:9,dmg:0,life:dl,life0:dl,col:'#6a4a30',grenade:1,tx:x,ty:y,ar:1,kind:'mud',vfx:'earth',hitSet:null,nodet:1})}}),
 do_weight:S_('Doton : Kajûgan','Projectile qui alourdit la cible : immobilisée 1,2 s puis ralentie',11,{ai:RG(520,.6)},(u,a)=>{S('rock',u);proj(u,a,{spd:700,r:10,dmg:16,life:.7,col:'#c8a070',root:1.2,slow:3})}),
 do_mountain:ULT('Doton : Chute de montagne','Une montagne s\'écrase sur la zone : énormes dégâts, étourdit, puis un cercle de rochers enferme la zone',{tele:{r:150,max:450},ai:{max:450,p:.8}},(u,a,td)=>{const p=atP(u,a,td,450);S('heavy',u);zone(u,p.x,p.y,150,52,1,{stun:1},'#a07850');lastZ().deto='mountain';jx({jfx:'mountain',x:p.x,y:p.y,r:150,t:1,m:1});
  later(u,1,()=>{for(let i=0;i<18;i++){const b=i*Math.PI/9;walls.push({x:p.x+Math.cos(b)*185,y:p.y+Math.sin(b)*185*.9,r:16,t:4,team:u.team,owner:u,earth:1,vfx:'earth'})}shake=Math.max(shake,.4)},{x:p.x,y:p.y})}),
 do_quake:ULT('Doton : Grand séisme','Trois ondes de choc autour de soi : projettent en l\'air et repoussent',{tele:{self:1,r:270},ai:SELF(250,.8)},(u)=>{S('heavy',u);const o={x:u.x,y:u.y};[[0,40,120],[.35,110,200],[.7,190,280]].forEach(([dl,r0,r1])=>later(u,dl+.01,()=>{ringHit(u,o.x,o.y,r0,r1,16,{air:.5,kb:150});jx({jfx:'shock',x:o.x,y:o.y,r:r1,t:.5,m:.5});for(let i=0;i<6;i++){const b=i*1.05+dl*3;detoFx(o.x+Math.cos(b)*(r0+r1)/2,o.y+Math.sin(b)*(r0+r1)/2*.85,30,'earth')}if(near(o.x,o.y)){S('rock',u);shake=Math.max(shake,.25)}},{x:o.x,y:o.y}))}),
 do_mole:S_('Doton : Taupe','Passe sous terre (intouchable), ressort plus loin et projette les ennemis proches',8,{ai:{mode:'gap',min:150,max:320,p:.4}},(u,a,td)=>{S('rock',u);u.phase=Math.max(u.phase||0,.45);u.stealth=Math.max(u.stealth,.45);dash(u,a,clamp(td||300,100,300),.42,{end:()=>{aoe(u,u.x,u.y,75,10,{air:.4},'#a07850');detoFx(u.x,u.y,50,'earth')}})}),

 // ================= Clans : techniques corrigées et nouvelles =================
 // Uchiha
 uc_amat:ULT('Amaterasu','Flammes noires inextinguibles sur la cible regardée et jusqu\'à 4 ennemis près d\'elle : très longue brûlure',{ai:{max:520,p:.8}},(u,a,td)=>{const e=pick(u,a,td||300,520);S('fire',u);if(!e){const p=atP(u,a,td,520);field(u,p.x,p.y,{r:70,t:3,dps:9,col:'#120a16',vfx:'black'});return}
  const L=[e,...enemies(u).filter(x=>x!==e&&dist(x,e)<170).slice(0,4)];for(const x of L){hit(x,u,14,{dot:{dps:6,dur:6},unblockable:1});jx({jfx:'blackfire',ti:units.indexOf(x),x:x.x,y:x.y,t:6,m:6})}say(e,'AMATERASU','#b070ff')}),
 uc_tsuku:ULT('Tsukuyomi','Croise le regard de la cible : genjutsu, elle est paralysée 1,8 s et subit de gros dégâts',{ai:{max:420,p:.8}},(u,a,td)=>{const e=pick(u,a,td||300,420);if(!e)return;hit(e,u,30,{stun:1.8,unblockable:1});jx({jfx:'redmoon',x:e.x,y:e.y,t:1.4,m:1.4});say(e,'TSUKUYOMI','#e0304a')}),
 uc_iza:S_('Izanagi','5 s : si tu dois mourir, tu reviens à l\'endroit et aux PV du lancement',25,{ai:HEALM},(u)=>{u.izT=5;u.izS={x:u.x,y:u.y,hp:u.hp};ring(u.x,u.y,50,'#e0304a');say(u,'IZANAGI','#e0304a')}),
 uc_kamui:S_('Kamui','Devient intangible 1 s et file vers l\'avant',10,{ai:ESC},(u,a)=>{dash(u,a,200,.45,{});u.phase=Math.max(u.phase||0,1);jx({jfx:'shock',x:u.x,y:u.y,r:50,t:.4,m:.4,col:'#8a3ab0'})}),
 uc_kunai:S_('Kunai guidés','3 kunai en éventail qui s\'incurvent vers la cible',6,{ai:RG(500,.6)},(u,a)=>{S('blaster',u);for(const k of[-.35,0,.35])proj(u,a+k,{spd:760,r:6,dmg:9,life:.8,col:'#d8dde6',home:1})}),
 // Hyûga
 hy_kusho:S_('Hakke Kûshô','Paume d\'air à distance qui repousse violemment',8,{ai:RG(400,.6)},(u,a)=>{S('jyuken',u);u.swing=.18;u.swingA=a;proj(u,a,{spd:900,r:14,dmg:18,life:.45,col:'#cfe0ff',big:1,o:{kb:320}})}),
 hy_128:ULT('Hakke : 128 points','Fonce sur la cible et enchaîne les frappes : bloque son chakra (silence) puis l\'étourdit',{ai:{max:300,p:.8}},(u,a,td)=>{const e=pick(u,a,td||200,300);if(!e)return;const b=ang(e,u);u.dash={sx:u.x,sy:u.y,tx:e.x+Math.cos(b)*40,ty:e.y+Math.sin(b)*40,t:0,dur:.15,jump:0};u.root=Math.max(u.root,1.2);
  jx({jfx:'trigram',ui:units.indexOf(u),x:u.x,y:u.y,t:1.3,m:1.3});for(let i=0;i<7;i++)later(u,.2+i*.13,()=>{if(e.dead||u.dead||u.stun>0)return;u.swing=.18;u.swingA=ang(u,e);hit(e,u,i<6?6:14,{melee:1,silence:2.5,stun:i<6?0:1.1,unblockable:1});say(u,(2**(i+1))+' POINTS','#cfe0ff')})}),
 hy_great:S_('Hakke Kûhekishô','Grande paume du vide : souffle tout ce qui est devant soi, repousse très loin et étourdit',12,{ai:RG(240,.6)},(u,a)=>{S('jyuken',u);S('heavy',u);u.swing=.18;u.swingA=a;VFX='jyuken';cone(u,a,260,1.1,24,{kb:340,stun:.6},'#cfe0ff');jx({jfx:'shock',x:u.x+Math.cos(a)*120,y:u.y+Math.sin(a)*120,r:120,t:.45,m:.45,col:'#cfe0ff'})}),
 // Nara
 na_kubi:S_('Kage Kubi Shibari','Des mains d\'ombre saisissent la cible : immobilisée et étranglée',10,{line:{len:420,w:20},ai:RG(420,.6)},(u,a)=>{S('shadow',u);proj(u,a,{spd:800,r:10,dmg:6,life:.55,col:'#141418',root:1.6,o:{dot:{dps:6,dur:1.6}}})}),
 na_nui:ULT('Kage Nui','Des aiguilles d\'ombre transpercent jusqu\'à 4 ennemis proches : dégâts et immobilise',{ai:{max:400,p:.8}},(u)=>{S('shadow',u);const L=enemies(u).filter(e=>dist(u,e)<420).sort((x,y)=>dist(u,x)-dist(u,y)).slice(0,4);for(const e of L){jx({jfx:'needles',ui:units.indexOf(u),ti:units.indexOf(e),x:e.x,y:e.y,t:.9,m:.9});later(u,.2,()=>hit(e,u,32,{root:1.4,unblockable:1}))}}),
 na_trap:S_('Ombre explosive','Pose un parchemin dans l\'ombre : piège qui immobilise puis explose',9,{ai:RG(380,.4)},(u,a,td)=>{trap(u,a,td||200,{root:1.2,dmg:24,r:60,col:'#141418',vfx:'shadow'})}),
 // Akimichi
 ak_butterfly:ULT('Mode Papillon','7 s : ailes de chakra, énorme, rapide, +35 % de dégâts et bouclier',{ai:SELF(320,.8)},(u)=>{S('roar',u);u.giant=Math.max(u.giant,7);u.haste=Math.max(u.haste,7);u.rage=Math.max(u.rage,7);shieldU(u,40,7);u.auraV='fox';jx({jfx:'gateburst',ui:units.indexOf(u),x:u.x,y:u.y,t:.8,m:.8,sage:1})}),
 ak_slam:S_('Chôdan Bakugeki','Ventre décuplé : écrase la zone devant soi après un instant et étourdit',11,{tele:{r:140,max:120},ai:RG(220,.6)},(u,a)=>{const p=fwd(u,a,115);u.giant=Math.max(u.giant,.9);zone(u,p.x,p.y,140,34,.45,{stun:.8,kb:200},'#d87a3a');lastZ().deto='mountain'}),
 ak_pill:S_('Pilule verte','Petit bouclier et vitesse 3 s',8,{ai:DEF},(u)=>{shieldU(u,22,3);u.haste=Math.max(u.haste,3);sparks(u.x,u.y,'#6f9',10)}),
 // Aburame
 ab_drain:S_('Insectes dévoreurs','Lien d\'insectes : vole du chakra (et un peu de vie) tant que la cible reste proche',12,{ai:RG(300,.6)},(u,a,td)=>{const e=pick(u,a,td||250,320);S('bugs',u);if(!e)return;tether(u,e,4,340,'#4a5a3a',null,()=>{const d=Math.min(e.energy,8);e.energy-=d;u.energy=Math.min(100,u.energy+d);VFX='bugs';hit(e,u,4,{silent:1});VFX=null;sparks(e.x,e.y,'#4a5a3a',4,'bugs')})}),
 ab_spy:S_('Insectes espions','Nuée lente qui traque la cible : la révèle et la rend vulnérable 3 s',7,{ai:RG(560,.6)},(u,a)=>{S('bugs',u);proj(u,a,{spd:430,r:9,dmg:5,life:1.6,col:'#4a5a3a',home:1,o:{vuln:3,reveal:1}})}),
 ab_wall:S_('Mur d\'insectes','2 s : un essaim t\'entoure et dévore les projectiles (rend du chakra)',9,{ai:DEF},(u)=>{S('bugs',u);u.absorb=Math.max(u.absorb,2);u.absorbEn=4;sparks(u.x,u.y,'#26302a',20,'bugs')}),
 // Inuzuka
 in_beast:S_('Shikyaku','À quatre pattes : très rapide et vol de vie 4 s',9,{ai:SELF(320,.5)},(u)=>{S('roar',u);u.haste=Math.max(u.haste,4);u.lsB=Math.max(u.lsB,4)}),
 in_tsuga:S_('Tsûga','Petite vrille qui traverse les ennemis',7,{ai:{mode:'gap',min:80,max:240,p:.6}},(u,a)=>{S('wind',u);dash(u,a,230,.2,{dmg:13,through:1,kb:90})}),
 in_wolf:ULT('Loup bicéphale','Fusion avec le chien : loup géant 6 s, rapide, +35 % de dégâts et vol de vie',{ai:SELF(320,.8)},(u)=>{S('roar',u);u.giant=Math.max(u.giant,6);u.haste=Math.max(u.haste,6);u.rage=Math.max(u.rage,6);u.lsB=Math.max(u.lsB,6);sparks(u.x,u.y,'#ddd',20,'smoke')}),
 // Uzumaki
 uz_chains:S_('Chaînes adamantines','Des chaînes jaillissent sous la zone visée : immobilisent tous les ennemis',12,{tele:{r:120,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=atP(u,a,td,420);zone(u,p.x,p.y,120,10,.5,{root:1.6},'#e8c860')}),
 uz_kunai:S_('Kunai de stockage','Un parchemin libère 3 kunai en éventail',5,{ai:RG(480,.7)},(u,a)=>{S('blaster',u);for(const k of[-.1,0,.1])proj(u,a+k,{spd:820,r:6,dmg:9,life:.65,col:'#d8dde6'})}),
 // Yamanaka
 ya_flower:S_('Kunai fleuri','Kunai entouré de pétales qui transperce et ralentit',5,{ai:RG(500,.7)},(u,a)=>{S('blaster',u);proj(u,a,{spd:820,r:7,dmg:14,life:.7,col:'#ff9ac8',pierce:1,slow:1,kind:'petal'})}),
 ya_pollen:S_('Pollen hypnotique','Nuage de pollen : les ennemis qui y restent s\'endorment',11,{ai:RG(400,.5)},(u,a,td)=>{const p=atP(u,a,td,400);S('genjutsu',u);field(u,p.x,p.y,{r:115,t:4,sleep:1,col:'#ff9ac8',vfx:'genjutsu'})}),
 ya_storm:S_('Tempête de pétales','Cône de pétales tranchants : dégâts et ralentit',8,{ai:RG(220,.6)},(u,a)=>{S('genjutsu',u);VFX='flower';cone(u,a,240,.9,26,{slow:1.2},'#ff9ac8')}),
 ya_swap:S_('Transposition','Échange sa place avec l\'allié visé ; sans allié, l\'esprit file au curseur en un éclair',8,{ai:ESC},(u,a,td)=>{const p=atP(u,a,td,300),al=units.filter(x=>x!==u&&x.team===u.team&&!x.dead&&Math.hypot(x.x-p.x,x.y-p.y)<180)[0];S('genjutsu',u);
  if(al){const ox=u.x,oy=u.y;blinkTo(u,al.x,al.y);al.x=ox;al.y=oy;collide(al)}else blinkTo(u,p.x,p.y)}),
 // Sabaku
 sa_tsunami:ULT('Tsunami de sable','Vague de sable géante qui avance, repousse et ralentit tout sur son passage',{line:{len:600,w:90},ai:{max:500,p:.8}},(u,a)=>{S('sand',u);S('heavy',u);proj(u,a,{spd:520,r:32,dmg:34,life:1.15,col:'#d8b878',pierce:1,slow:1.5,kind:'sandwave',o:{kb:230}})}),
 sa_funeral:ULT('Funérailles du désert','Le sable écrase la zone : énormes dégâts (×1,5 sur une cible immobilisée) et étourdit',{tele:{r:110,max:450},ai:{max:450,p:.8}},(u,a,td)=>{const p=atP(u,a,td,450);S('sand',u);
  later(u,.7,()=>{for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<110+e.r)hit(e,u,(e.root>0||e.stun>0?1.5:1)*50,{stun:.9,unblockable:1});detoFx(p.x,p.y,110,'sand');jx({jfx:'sandcoffin',x:p.x,y:p.y,t:.8,m:.8});if(near(p.x,p.y))shake=Math.max(shake,.35)},{x:p.x,y:p.y,r:110})}),
 sa_shield:S_('Bouclier absolu','3 s : dôme de sable qui arrête les projectiles ennemis, plus un bouclier',14,{ai:DEF},(u)=>{S('sand',u);field(u,u.x,u.y,{r:85,t:3,dome:1,follow:u,col:'#d8b878',vfx:'sand'});shieldU(u,30,3)}),
 sa_spears:S_('Lances de sable','3 lances de sable perçantes tirées l\'une après l\'autre',8,{ai:RG(520,.6)},(u,a)=>{const f=o=>{S('sand',o);proj(o,o.aim,{spd:900,r:8,dmg:10,life:.6,col:'#d8b878',pierce:1})};f(u);seqs.push({owner:u,n:2,t:.15,iv:.15,vfx:'sand',f})}),
 // Kaguya
 kg_willow:S_('Danse du saule','Tourbillon de lames d\'os autour de soi, qui renvoie les tirs',7,{ai:SELF(110,.6)},(u)=>{S('bone',u);u.spin={t:.45,k:0,r:95,dmg:6};u.deflect=Math.max(u.deflect,.5)}),
 kg_larch:S_('Danse du mélèze','Des os jaillissent de tout le corps : dégâts autour, puis 3 s d\'épines et inarrêtable',12,{ai:SELF(120,.6)},(u)=>{S('bone',u);aoe(u,u.x,u.y,105,22,{kb:130},'#f2efe6');detoFx(u.x,u.y,90,'bone');u.thorns=Math.max(u.thorns,3);u.unstop=Math.max(u.unstop,3)}),
 kg_drill:ULT('Danse de la clématite','Foreuse d\'os géante : fonce à travers tout, énormes dégâts et projette',{line:{len:340,w:50},ai:{mode:'gap',min:80,max:340,p:.8}},(u,a)=>{S('bone',u);S('heavy',u);dash(u,a,340,.3,{dmg:46,through:1,kb:180,air:.5})}),
});
for(const k in NAT)NAT[k].key=k;
Object.assign(NATHERO,{su:'jyn',ra:'ig88',do:'obiwan',uc:'ahsoka',hy:'quigon',na:'padme',ak:'chewie',ab:'lando',in:'bossk',uz:'savage',ya:'thrawn',sa:'kylo',kg:'gideon'});
