// ===== Katon (feu) =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('n0',[
 [1,'D','x.ka_ball','Katon : Flamme','Projectile de feu qui brûle quelques secondes','fire'],
 [1,'D','x.ka_wall','Katon : Mur de feu','Mur de feu qui bloque les tirs et le passage, et brûle au contact','fire'],
 [1,'C','x.ka_tri','Katon : Triple flamme','3 boules de feu tirées l\'une après l\'autre, qui brûlent','fire'],
 [1,'C','x.ka_air','Katon : Shuriken de feu aériens','Saute et lance 5 shuriken de feu sur un point précis','fire'],
 [1,'B','x.ka_zone','Katon : Fournaise','Grande zone de feu autour de soi : plus on y reste, plus ça brûle','fire'],
 [1,'B','x.ka_stack','Katon : Flammes chargées','Prépare 5 flammes qui brûlent, à relancer pendant 5 s','fire'],
 [1,'A','x.ka_dragon','Katon : Dragon de feu','Dragon de feu qu\'on peut rediriger, explose et brûle','fire'],
 [1,'A','x.ka_tornado','Katon : Tornade de feu','Tornade de feu qui avance et brûle, sans emporter','fire'],
 [5,'S','x.ka_nuee','Katon : Nuée ardente','Canalise une nuée sur une zone, immobile ; relance pour relâcher : plus c\'est long, plus c\'est fort','fire'],
 [5,'S','x.ka_breath','Katon : Grand souffle de feu','Immobile, embrase une très large zone devant soi','fire'],
]);
Object.assign(NAT,{
 ka_ball:SP('Katon : Flamme','Projectile de feu qui brûle quelques secondes',4,{ai:RG(520,.7)},(u,a)=>{S('fire',u);fireP(u,a,{})}),
 ka_wall:SP('Katon : Mur de feu','Mur de feu qui bloque les tirs et le passage, et brûle au contact',9,{ai:DEF},(u,a)=>{wallLine(u,a,2,{burn:1,k:0});S('fire',u)}),
 ka_tri:SP('Katon : Triple flamme','3 boules de feu tirées l\'une après l\'autre, qui brûlent',6,{ai:RG(520,.6)},(u,a)=>{S('fire',u);fireP(u,a,{dmg:9,o:{dot:BURN(3,2.5)}});seqs.push({owner:u,n:2,t:.16,iv:.16,vfx:'fire',f:o=>{S('fire',o);fireP(o,o.aim,{dmg:9,o:{dot:BURN(3,2.5)}})}})}),
 ka_air:SP('Katon : Shuriken de feu aériens','Saute et lance 5 shuriken de feu sur un point précis',8,{ai:RG(450,.55)},(u,a,t)=>{S('fire',u);const tp=fwd(u,a,Math.min(t||300,450));dash(u,a,0,.45,{jump:110});
  for(let i=0;i<5;i++){const ox=u.x+(rnd()-.5)*50,oy=u.y+(rnd()-.5)*50,b=Math.atan2(tp.y-oy,tp.x-ox),d=Math.hypot(tp.x-ox,tp.y-oy);projs.push({x:ox,y:oy,vx:Math.cos(b)*700,vy:Math.sin(b)*700,owner:u,src:u,rot:0,r:7,dmg:7,life:Math.max(.2,d/700),life0:Math.max(.2,d/700),col:'#ff7a2a',o:{dot:BURN(3,2.5)},vfx:'fire',shuri:1,hitSet:null})}}),
 ka_zone:SP('Katon : Fournaise','Grande zone de feu autour de soi : plus on y reste, plus ça brûle',10,{ai:SELF(200,.5)},(u)=>{aux.push({type:'prog',x:u.x,y:u.y,r:180,t:4,m:4,team:u.team,owner:u,vfx:'fire',k:0,in:{},dmg:3});S('fire',u)}),
 ka_stack:SP('Katon : Flammes chargées','Prépare 5 flammes qui brûlent, à relancer pendant 5 s',10,{ai:RG(500,.7)},null),
 ka_dragon:SP('Katon : Dragon de feu','Dragon de feu qu\'on peut rediriger, explose et brûle',12,{cast:.3,ai:RG(600,.5)},(u,a)=>{S('fire',u);proj(u,a,{spd:430,r:14,dmg:24,life:1.8,col:'#ff7a2a',rocket:1,ar:85,kb:180,burn:1,steer:1,big:1,dragon:1})}),
 ka_tornado:SP('Katon : Tornade de feu','Tornade de feu qui avance et brûle, sans emporter',12,{cast:.25,ai:RG(450,.6)},(u,a)=>{aux.push({type:'tornado',x:u.x+Math.cos(a)*50,y:u.y+Math.sin(a)*50,vx:Math.cos(a)*140,vy:Math.sin(a)*140,r:78,t:3.5,m:3.5,team:u.team,owner:u,vfx:'fire',k:0,dmg:6});S('fire',u)}),
 ka_nuee:ULT('Katon : Nuée ardente','Canalise une nuée sur une zone, immobile ; relance pour relâcher : plus c\'est long, plus c\'est fort',{ai:{max:480,p:.8}},null),
 ka_breath:ULT('Katon : Grand souffle de feu','Immobile, embrase une très large zone devant soi',{ai:{max:300,p:.8}},(u,a)=>{u.flame={t:2,k:0,R:330,arc:.9,d:5,burn:1,still:1,v:'fire',dot:BURN(4,3)};S('fire',u)}),
});
NAT.ka_stack.f=stackAb('ka_stack',5,(u,a)=>{S('fire',u);fireP(u,a,{dmg:12})});
NAT.ka_nuee.f=chanAb('ka_nuee');
Object.assign(NATHERO,{ka:'boba'});
