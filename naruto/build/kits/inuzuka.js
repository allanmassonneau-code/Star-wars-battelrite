// ===== Clan Inuzuka =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c5',[
 [1,'B','rey.1','Gatsûga','Tornade-vrille qui traverse les ennemis','gatsuga'],
 [2,'C','bossk.2','Instinct bestial','Bondit sur l\'ennemi le plus blessé','tai'],
 [3,'S','iden.1','Ninken','Le chien ninja attaque à tes côtés 8 s','smoke'],
 [4,'C','ahsoka.4','Flair du chien','Évite le prochain coup et accélère','tai'],
 [1,'C','x.in_tsuga','Tsûga','Petite vrille qui traverse les ennemis','gatsuga'],
 [4,'D','x.in_beast','Shikyaku','À quatre pattes : très rapide et vol de vie 4 s','tai'],
 [5,'S','x.in_wolf','Loup bicéphale','Fusion avec le chien : loup géant 6 s, rapide, +35 % de dégâts et vol de vie','smoke'],
 [5,'A','anakin.5','Garôga','Double vrille géante qui frappe jusqu\'à 4 ennemis','gatsuga'],
]);
Object.assign(NAT,{
 in_beast:S_('Shikyaku','À quatre pattes : très rapide et vol de vie 4 s',9,{ai:SELF(320,.5)},(u)=>{S('roar',u);u.haste=Math.max(u.haste,4);u.lsB=Math.max(u.lsB,4)}),
 in_tsuga:S_('Tsûga','Petite vrille qui traverse les ennemis',7,{ai:{mode:'gap',min:80,max:240,p:.6}},(u,a)=>{S('wind',u);dash(u,a,230,.2,{dmg:13,through:1,kb:90})}),
 in_wolf:ULT('Loup bicéphale','Fusion avec le chien : loup géant 6 s, rapide, +35 % de dégâts et vol de vie',{ai:SELF(320,.8)},(u)=>{S('roar',u);u.giant=Math.max(u.giant,6);u.haste=Math.max(u.haste,6);u.rage=Math.max(u.rage,6);u.lsB=Math.max(u.lsB,6);sparks(u.x,u.y,'#ddd',20,'smoke')}),
});
Object.assign(NATHERO,{in:'bossk'});
