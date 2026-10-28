// ===== Clan Yamanaka =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c7',[
 [1,'A','inquisitor.3','Shinranshin','Projectile mental qui terrifie','genjutsu'],
 [2,'C','x.ya_swap','Transposition','Échange sa place avec l\'allié visé ; sans allié, l\'esprit file au curseur en un éclair','genjutsu'],
 [1,'D','x.ya_flower','Kunai fleuri','Kunai entouré de pétales qui transperce et ralentit','flower'],
 [3,'C','x.ya_pollen','Pollen hypnotique','Nuage de pollen : les ennemis qui y restent s\'endorment','genjutsu'],
 [4,'B','x.ya_storm','Tempête de pétales','Cône de pétales tranchants : dégâts et ralentit','flower'],
 [3,'S','kylo.3','Shintenshin','Lien : si la cible reste proche 2 s, gros dégâts et étourdie','mind'],
 [4,'S','quigon.3','Champ de fleurs','Aura de soin qui le suit 5 s','flower'],
 [5,'S','sister.5','Esprit destructeur','Coup fatal sur les ennemis blessés','mind'],
]);
Object.assign(NAT,{
 ya_flower:S_('Kunai fleuri','Kunai entouré de pétales qui transperce et ralentit',5,{ai:RG(500,.7)},(u,a)=>{S('blaster',u);proj(u,a,{spd:820,r:7,dmg:14,life:.7,col:'#ff9ac8',pierce:1,slow:1,kind:'petal'})}),
 ya_pollen:S_('Pollen hypnotique','Nuage de pollen : les ennemis qui y restent s\'endorment',11,{ai:RG(400,.5)},(u,a,td)=>{const p=atP(u,a,td,400);S('genjutsu',u);field(u,p.x,p.y,{r:115,t:4,sleep:1,col:'#ff9ac8',vfx:'genjutsu'})}),
 ya_storm:S_('Tempête de pétales','Cône de pétales tranchants : dégâts et ralentit',8,{ai:RG(220,.6)},(u,a)=>{S('genjutsu',u);VFX='flower';cone(u,a,240,.9,26,{slow:1.2},'#ff9ac8')}),
 ya_swap:S_('Transposition','Échange sa place avec l\'allié visé ; sans allié, l\'esprit file au curseur en un éclair',8,{ai:ESC},(u,a,td)=>{const p=atP(u,a,td,300),al=units.filter(x=>x!==u&&x.team===u.team&&!x.dead&&Math.hypot(x.x-p.x,x.y-p.y)<180)[0];S('genjutsu',u);
  if(al){const ox=u.x,oy=u.y;blinkTo(u,al.x,al.y);al.x=ox;al.y=oy;collide(al)}else blinkTo(u,p.x,p.y)}),
});
Object.assign(NATHERO,{ya:'thrawn'});
// ---- visuels
PROJD.petal=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle='#d8dde6';g.beginPath();g.moveTo(-6,-4);g.lineTo(10,0);g.lineTo(-6,4);g.fill();for(let i=0;i<6;i++){const b=t/80+i*1.05;g.save();g.translate(-8+Math.cos(b)*9,Math.sin(b)*7);g.rotate(b);g.fillStyle=i%2?'#ff9ac8':'#ffd8e8';g.beginPath();g.ellipse(0,0,4,2,0,0,7);g.fill();g.restore()}};
PROJD.spirit=(p,R,ra,t)=>{g.globalCompositeOperation='lighter';for(let i=0;i<5;i++)circ(-Math.cos(ra)*i*6,-Math.sin(ra)*i*6,R*(1-i*.15),rgba('#c080ff',.5-i*.08));circ(0,0,R*.5,'#fff')};
