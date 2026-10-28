// ===== Clan Hyûga =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c1',[
 [1,'D','quigon.1','Hakke : Paume','Paume du vide qui étourdit devant soi','jyuken'],
 [2,'C','ahsoka.2','Pas du Hakke','2 bonds rapides','jyuken'],
 [3,'D','lando.4','Byakugan','Bloque le chakra de la cible (silence) et la révèle','byakugan'],
 [4,'C','obiwan.4','Kaiten','Tourbillon divin qui renvoie les tirs','kaiten'],
 [1,'B','x.hy_kusho','Hakke Kûshô','Paume d\'air à distance qui repousse violemment','jyuken'],
 [1,'A','x.hy_great','Hakke Kûhekishô','Grande paume du vide : souffle tout ce qui est devant soi, repousse très loin et étourdit','jyuken'],
 [5,'S','x.hy_128','Hakke : 128 points','Fonce sur la cible et enchaîne les frappes : bloque son chakra (silence) puis l\'étourdit','jyuken'],
 [5,'C','mace.5','Hakke : 64 points','Tous les ennemis proches : dégâts, étourdis et vulnérables','hakke64'],
]);
Object.assign(NAT,{
 hy_kusho:S_('Hakke Kûshô','Paume d\'air à distance qui repousse violemment',8,{ai:RG(400,.6)},(u,a)=>{S('jyuken',u);u.swing=.18;u.swingA=a;proj(u,a,{spd:900,r:14,dmg:18,life:.45,col:'#cfe0ff',big:1,o:{kb:320}})}),
 hy_128:ULT('Hakke : 128 points','Fonce sur la cible et enchaîne les frappes : bloque son chakra (silence) puis l\'étourdit',{ai:{max:300,p:.8}},(u,a,td)=>{const e=pick(u,a,td||200,300);if(!e)return;const b=ang(e,u);u.dash={sx:u.x,sy:u.y,tx:e.x+Math.cos(b)*40,ty:e.y+Math.sin(b)*40,t:0,dur:.15,jump:0};u.root=Math.max(u.root,1.2);
  jx({jfx:'trigram',ui:units.indexOf(u),x:u.x,y:u.y,t:1.3,m:1.3});for(let i=0;i<7;i++)later(u,.2+i*.13,()=>{if(e.dead||u.dead||u.stun>0)return;u.swing=.18;u.swingA=ang(u,e);hit(e,u,i<6?6:14,{melee:1,silence:2.5,stun:i<6?0:1.1,unblockable:1});say(u,(2**(i+1))+' POINTS','#cfe0ff')})}),
 hy_great:S_('Hakke Kûhekishô','Grande paume du vide : souffle tout ce qui est devant soi, repousse très loin et étourdit',12,{ai:RG(240,.6)},(u,a)=>{S('jyuken',u);S('heavy',u);u.swing=.18;u.swingA=a;VFX='jyuken';cone(u,a,260,1.1,24,{kb:340,stun:.6},'#cfe0ff');jx({jfx:'shock',x:u.x+Math.cos(a)*120,y:u.y+Math.sin(a)*120,r:120,t:.45,m:.45,col:'#cfe0ff'})}),
});
Object.assign(NATHERO,{hy:'quigon'});
