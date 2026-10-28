// ===== Fûton (vent) =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('n2',[
 [1,'D','x.fu_wall','Fûton : Mur de vent','Mur de vent qui bloque les projectiles et le passage','wind'],
 [1,'D','x.fu_bullet','Fûton : Balle d\'air','Projectile de vent qui repousse légèrement','wind'],
 [1,'C','x.fu_tri','Fûton : Triple balle d\'air','3 balles de vent tirées l\'une après l\'autre, qui repoussent légèrement','wind'],
 [1,'C','x.fu_big','Fûton : Grande balle d\'air','Gros projectile de vent','wind'],
 [1,'B','x.fu_shotgun','Fûton : Rafale à bout portant','Immobile, tire 10 balles d\'air imprécises au corps à corps','wind'],
 [1,'B','x.fu_stack','Fûton : Balles chargées','Prépare 3 balles d\'air qui repoussent, à relancer pendant 5 s','wind'],
 [1,'A','x.fu_line','Fûton : Lame d\'air','Projectile linéaire perçant qui repousse','wind'],
 [1,'A','x.fu_breath','Fûton : Souffle','Canalise un souffle de vent qui repousse et blesse','wind'],
 [5,'S','x.fu_corridor','Fûton : Couloir de vent','Couloir de vent : dégâts croissants et silence pour ceux qui restent dedans','wind'],
 [5,'S','x.fu_tornado','Fûton : Tornade','Tornade qui avance, blesse et emporte les ennemis','wind'],
]);
Object.assign(NAT,{
 fu_wall:SP('Fûton : Mur de vent','Mur de vent qui bloque les projectiles et le passage',8,{ai:DEF},(u,a)=>{wallLine(u,a,2,{wind:1});S('wind',u)}),
 fu_bullet:SP('Fûton : Balle d\'air','Projectile de vent qui repousse légèrement',4,{ai:RG(520,.7)},(u,a)=>{S('wind',u);wind(u,a,{})}),
 fu_tri:SP('Fûton : Triple balle d\'air','3 balles de vent tirées l\'une après l\'autre, qui repoussent légèrement',6,{ai:RG(520,.6)},(u,a)=>{S('wind',u);wind(u,a,{dmg:8,o:{kb:100}});seqs.push({owner:u,n:2,t:.16,iv:.16,vfx:'wind',f:o=>{S('wind',o);wind(o,o.aim,{dmg:8,o:{kb:100}})}})}),
 fu_big:SP('Fûton : Grande balle d\'air','Gros projectile de vent',7,{cast:.2,line:{len:480,w:30},ai:RG(480,.5)},(u,a)=>{S('wind',u);wind(u,a,{r:15,dmg:20,spd:600,life:.8,big:1,o:{kb:170}})}),
 fu_shotgun:SP('Fûton : Rafale à bout portant','Immobile, tire 10 balles d\'air imprécises au corps à corps',8,{cast:.2,ai:RG(200,.7)},(u,a)=>{u.root=Math.max(u.root,.35);S('wind',u);S('heavy',u);for(let i=0;i<10;i++)wind(u,a+(rnd()-.5)*1,{spd:760+rnd()*160,r:5,dmg:5,life:.3,o:{kb:60}})}),
 fu_stack:SP('Fûton : Balles chargées','Prépare 3 balles d\'air qui repoussent, à relancer pendant 5 s',10,{ai:RG(500,.7)},null),
 fu_line:SP('Fûton : Lame d\'air','Projectile linéaire perçant qui repousse',10,{cast:.3,line:{len:700,w:24},ai:RG(650,.5)},(u,a)=>{S('wind',u);wind(u,a,{spd:1200,r:12,dmg:26,life:.62,pierce:1,big:1,o:{kb:300}})}),
 fu_breath:SP('Fûton : Souffle','Canalise un souffle de vent qui repousse et blesse',11,{ai:RG(240,.6)},(u,a)=>{u.flame={t:1.4,k:0,R:260,arc:.5,d:4,kb:140,still:1,v:'wind'};S('wind',u)}),
 fu_corridor:ULT('Fûton : Couloir de vent','Couloir de vent : dégâts croissants et silence pour ceux qui restent dedans',{cast:.3,line:{len:520,w:110},ai:{max:480,p:.8}},(u,a)=>{aux.push({type:'corridor',x:u.x,y:u.y,a,len:520,w:110,t:4,m:4,team:u.team,owner:u,vfx:'wind',k:0,in:{}});S('wind',u)}),
 fu_tornado:ULT('Fûton : Tornade','Tornade qui avance, blesse et emporte les ennemis',{cast:.3,ai:{max:480,p:.8}},(u,a)=>{aux.push({type:'tornado',x:u.x+Math.cos(a)*50,y:u.y+Math.sin(a)*50,vx:Math.cos(a)*150,vy:Math.sin(a)*150,r:70,t:4,m:4,team:u.team,owner:u,vfx:'wind',k:0,carry:1,dmg:4});S('wind',u)}),
});
NAT.fu_stack.f=stackAb('fu_stack',3,(u,a)=>{S('wind',u);wind(u,a,{r:9,dmg:14,o:{kb:220}})});
Object.assign(NATHERO,{fu:'palpatine'});
