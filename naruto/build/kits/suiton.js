// ===== Suiton (eau) =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('n1',[
 [1,'D','x.su_ball','Suiton : Teppôdama','Balle d\'eau qui éclate à l\'impact et ralentit autour','water'],
 [1,'D','x.su_wall','Suiton : Suijinheki','Dôme d\'eau autour de soi 1,5 s : arrête les tirs et repousse ceux qui sont collés','water'],
 [1,'C','x.su_jet','Suiton : Mizurappa','Jet d\'eau puissant, immobile : repousse fort','water'],
 [1,'C','x.su_shark','Suiton : Suikôdan','Requin d\'eau qui traque l\'ennemi le plus proche','water'],
 [1,'B','x.su_prison','Suiton : Suirô','Bulle d\'eau : la cible est enfermée tant que tu restes sur place (2,5 s max)','water'],
 [1,'B','x.su_mist','Suiton : Kirigakure','Brume épaisse 5 s : ennemis ralentis, alliés invisibles dedans','water'],
 [1,'A','x.su_dragon','Suiton : Dragon aqueux','Dragon d\'eau qui transperce toute une ligne, repousse et ralentit','water'],
 [1,'A','x.su_fall','Suiton : Daibakufu','Une cascade s\'abat sur la zone visée : gros dégâts, repousse, puis sol inondé qui ralentit','water'],
 [2,'C','x.su_liquid','Suiton : Corps liquide','Se liquéfie et glisse vers l\'avant : intouchable pendant le glissement','water'],
 [5,'S','x.su_big','Suiton : Daikôdan','Requin géant qui avale les jutsu ennemis sur sa route et explose en raz-de-marée','water'],
 [5,'S','x.su_dome','Suiton : Dôme des requins','Grand dôme d\'eau 5 s : les ennemis dedans sont ralentis et perdent PV et chakra, que tu récupères','water'],
]);
Object.assign(NAT,{
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
});
Object.assign(NATHERO,{su:'jyn'});
// ---- visuels
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
PROJD.shark=(p,R,ra,t)=>{g.rotate(ra);const S=R/12;g.scale(S,S);const w=Math.sin(t/90)*.25;
 for(let i=1;i<4;i++)circ(-14-i*9,Math.sin(t/80+i)*3,5-i,rgba('#bfe6ff',.5));g.fillStyle='#2a6ab0';g.beginPath();g.ellipse(0,0,22,9,0,0,7);g.fill();g.fillStyle='#d8eef8';g.beginPath();g.ellipse(2,4,16,4,0,0,Math.PI);g.fill();
 g.fillStyle='#2a6ab0';g.beginPath();g.moveTo(-18,0);g.lineTo(-32,-10+w*10);g.lineTo(-29,9+w*10);g.fill();g.beginPath();g.moveTo(-2,-8);g.lineTo(-9,-19);g.lineTo(-12,-7);g.fill();
 g.strokeStyle='#fff';g.lineWidth=1.2;g.beginPath();g.moveTo(12,3);g.lineTo(20,2);g.stroke();for(let i=0;i<4;i++){g.beginPath();g.moveTo(13+i*2,3);g.lineTo(14+i*2,5);g.stroke()}circ(13,-3,1.6,'#fff');circ(13,-3,.7,'#111')};
