// ===== Clan Akimichi =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c3',[
 [1,'C','sister.1','Paume géante','Repousse ; étourdit si la cible heurte un obstacle','tai'],
 [2,'D','chewie.2','Boulet humain','Roule et renverse','tai'],
 [3,'B','chewie.3','Décuplement partiel','Bras géant qui attrape et jette derrière soi','tai'],
 [4,'C','bossk.4','Pilule rouge','Soin rapide et se libère','heal'],
 [1,'A','x.ak_slam','Chôdan Bakugeki','Ventre décuplé : écrase la zone devant soi après un instant et étourdit','tai'],
 [4,'D','x.ak_pill','Pilule verte','Petit bouclier et vitesse 3 s','heal'],
 [5,'S','x.ak_butterfly','Mode Papillon','7 s : ailes de chakra, énorme, rapide, +35 % de dégâts et bouclier','fox'],
 [5,'B','savage.5','Décuplement','Devient énorme 6 s : bouclier, dégâts et portée','gate'],
]);
Object.assign(NAT,{
 ak_butterfly:ULT('Mode Papillon','7 s : ailes de chakra, énorme, rapide, +35 % de dégâts et bouclier',{ai:SELF(320,.8)},(u)=>{S('roar',u);u.giant=Math.max(u.giant,7);u.haste=Math.max(u.haste,7);u.rage=Math.max(u.rage,7);shieldU(u,40,7);u.auraV='fox';jx({jfx:'gateburst',ui:units.indexOf(u),x:u.x,y:u.y,t:.8,m:.8,sage:1})}),
 ak_slam:S_('Chôdan Bakugeki','Ventre décuplé : écrase la zone devant soi après un instant et étourdit',11,{tele:{r:140,max:120},ai:RG(220,.6)},(u,a)=>{const p=fwd(u,a,115);u.giant=Math.max(u.giant,.9);zone(u,p.x,p.y,140,34,.45,{stun:.8,kb:200},'#d87a3a');lastZ().deto='mountain'}),
 ak_pill:S_('Pilule verte','Petit bouclier et vitesse 3 s',8,{ai:DEF},(u)=>{shieldU(u,22,3);u.haste=Math.max(u.haste,3);sparks(u.x,u.y,'#6f9',10)}),
});
Object.assign(NATHERO,{ak:'chewie'});
