// ===== Doton (terre) =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('n4',[
 [1,'D','x.do_rock','Doton : Rocher','Lance un lourd rocher qui repousse','earth'],
 [1,'D','x.do_wall','Doton : Doryûheki','Grand mur de terre qui bloque tirs et passage pendant 6 s','earth'],
 [1,'C','x.do_spikes','Doton : Doryûsô','Des pics de terre jaillissent en ligne devant soi et projettent en l\'air','earth'],
 [1,'C','x.do_swamp','Doton : Yomi Numa','Marécage sous la zone visée : les ennemis s\'y enlisent','earth'],
 [1,'B','x.do_armor','Doton : Kyôka','Corps de roche 4 s : 45 % de dégâts en moins et inarrêtable, mais plus lent','earth'],
 [1,'B','x.do_hand','Doton : Main de terre','Une main de terre jaillit sous la zone visée et immobilise','earth'],
 [1,'A','x.do_dragon','Doton : Dragon de terre','Un dragon de terre crache 3 boulets de boue qui explosent et ralentissent','earth'],
 [1,'A','x.do_weight','Doton : Kajûgan','Projectile qui alourdit la cible : immobilisée 1,2 s puis ralentie','earth'],
 [2,'D','x.do_mole','Doton : Taupe','Passe sous terre (intouchable), ressort plus loin et projette les ennemis proches','earth'],
 [5,'S','x.do_mountain','Doton : Chute de montagne','Une montagne s\'écrase sur la zone : énormes dégâts, étourdit, puis un cercle de rochers enferme la zone','earth'],
 [5,'S','x.do_quake','Doton : Grand séisme','Trois ondes de choc autour de soi : projettent en l\'air et repoussent','earth'],
]);
Object.assign(NAT,{
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
});
Object.assign(NATHERO,{do:'obiwan'});
// ---- visuels
PROJD.mud=(p,R)=>{circ(0,0,R*1.1,'#5a4028');circ(-R*.3,-R*.3,R*.45,'#8a6a48');for(let i=0;i<3;i++)circ(-R*(1.2+i*.6),(rnd()-.5)*R,R*(.4-i*.1),rgba('#6a4a30',.7))};
JFXD.mountain=(f,k,e)=>{const q=P(f.x,f.y,0),fall=Math.min(1,e*1.6),y=q.y-(1-fall)*420*q.s,R=f.r*q.s;g.fillStyle=rgba('#000',.3*fall);g.beginPath();g.ellipse(q.x,q.y,R*fall,R*.4*fall,0,0,7);g.fill();
 if(fall<1){g.fillStyle='#6a4a30';g.beginPath();g.moveTo(q.x-R,y);g.lineTo(q.x-R*.3,y-R*1.1);g.lineTo(q.x+R*.2,y-R*.8);g.lineTo(q.x+R*.6,y-R*1.3);g.lineTo(q.x+R,y);g.closePath();g.fill();g.fillStyle='#8a6a48';g.beginPath();g.moveTo(q.x-R*.3,y-R*1.1);g.lineTo(q.x+R*.2,y-R*.8);g.lineTo(q.x,y-R*.2);g.fill();g.fillStyle='#e8e8f0';g.beginPath();g.moveTo(q.x+R*.45,y-R*1.15);g.lineTo(q.x+R*.6,y-R*1.3);g.lineTo(q.x+R*.75,y-R*1.1);g.fill()}};
DETO.mountain=(x,y,r)=>{jx({jfx:'spikes',x,y,r,t:1.2,m:1.2,bone:0});jx({jfx:'shock',x,y,r:r*1.5,t:.6,m:.6})};
