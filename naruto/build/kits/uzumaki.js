// ===== Clan Uzumaki =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c6',[
 [1,'D','x.uz_kunai','Kunai de stockage','Un parchemin libère 3 kunai en éventail','kunai'],
 [1,'A','x.uz_chains','Chaînes adamantines','Des chaînes jaillissent sous la zone visée : immobilisent tous les ennemis','chain'],
 [1,'C','cadbane.1','Chaînes de chakra','Attrape un ennemi et le ramène','chain'],
 [1,'S','savage.1','Rasengan','Fonce avec une sphère de chakra qui projette en l\'air','rasengan'],
 [2,'B','dooku.2','Sceau d\'échange','Échange sa place avec l\'ennemi touché','chain'],
 [3,'B','dooku.3','Sceau','La cible ne peut plus attaquer','seal'],
 [3,'S','gideon.3','Multiclonage','Deux clones qui lancent des kunai 7 s','smoke'],
 [4,'C','bossk.4','Vitalité Uzumaki','Soin rapide et se libère','heal'],
 [5,'A','thrawn.5','Rasen-shuriken','Un Rasen-shuriken s\'abat sur une grande zone','rasenshuriken'],
 [5,'A','chewie.5','Chakra de Kyûbi','6 s : inarrêtable, régénération et dégâts','fox'],
]);
Object.assign(NAT,{
 uz_chains:S_('Chaînes adamantines','Des chaînes jaillissent sous la zone visée : immobilisent tous les ennemis',12,{tele:{r:120,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=atP(u,a,td,420);zone(u,p.x,p.y,120,10,.5,{root:1.6},'#e8c860')}),
 uz_kunai:S_('Kunai de stockage','Un parchemin libère 3 kunai en éventail',5,{ai:RG(480,.7)},(u,a)=>{S('blaster',u);for(const k of[-.1,0,.1])proj(u,a+k,{spd:820,r:6,dmg:9,life:.65,col:'#d8dde6'})}),
});
Object.assign(NATHERO,{uz:'savage'});
