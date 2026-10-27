// ===================== NINJAS : chacun crée son ninja et compose son kit =====================
// Kit = style de combat (attaque de base, selon le clan) + jutsu de clan (ou Subjutsu si sans clan) + jutsu d'une nature.
// Les jutsu réutilisent les mécaniques éprouvées du moteur (SRC) avec leurs propres effets visuels (vfx).
// Rangs D C B A S = coût en points ; le kit (5 jutsu) a un budget maximum. Pas de versions EX dans ce jeu.
const RANKS={D:1,C:2,B:3,A:4,S:5},RANKC={D:'#9aa3ad',C:'#6fcf6f',B:'#5ab4ff',A:'#c07aff',S:'#ffc53a'},BUDGET=17;
const NATURES=[['Katon','Feu','#ff7a2a'],['Suiton','Eau','#3aa8ff'],['Fûton','Vent','#9fe8c8'],['Raiton','Foudre','#ffe14a'],['Doton','Terre','#b08850']];
const CLANS=[['Uchiha','#c0202a'],['Hyûga','#d8d0f0'],['Nara','#5a6a3a'],['Akimichi','#d87a3a'],['Aburame','#4a6a5a'],['Inuzuka','#a04a2a'],['Uzumaki','#e0503a'],['Yamanaka','#c8a0e0'],['Sabaku','#c8a060'],['Kaguya','#e8e8e0'],['Taijutsuka','#4aa83a']];
const TAIJ=10; // le clan Taijutsuka n'a pas de nature : uniquement du taijutsu
// styles de combat (attaque de base) : [nom, description, source, vfx, arme, clans autorisés (-1 = sans clan), modif. PV, modif. puissance]
const STYLES=[
 ['Taijutsu','Enchaînement de coups de poing et de pied','rey.0','tai','fist',[-1,6],1.25,1.2],
 ['Kunai','Lancer de kunai à distance','lando.0','kunai','kunai',[-1,7],.74,.74],
 ['Kenjutsu','Sabre : escrime rapide et longue','dooku.0','steel','sword',[0],1.45,1.4],
 ['Taijutsu Uchiha','Coups de pied rapides, lus par le Sharingan','ahsoka.0','tai','fist',[0],1.35,1.3],
 ['Poing souple','Frappes du Jûken qui bloquent le chakra et ralentissent','yoda.0','jyuken','palm',[1],1.45,1.4],
 ['Fouet d\'ombre','L\'ombre frappe à moyenne portée et ralentit','padme.0','shadow','shadow',[2],.88,.88],
 ['Poing décuplé','Grand poing qui frappe large et lourd','savage.0','tai','bigfist',[3],1.5,1.45],
 ['Nuée d\'insectes','Petites nuées à distance','thrawn.0','bugs','bugs',[4],.72,.72],
 ['Taijutsu + insectes','Coups qui drainent la vie','quigon.0','bugs','fist',[4],1.08,1.08],
 ['Crocs et griffes','Griffures rapides, le chien ninja attaque avec toi','ventress.0','claws','claws',[5],1.32,1.28],
 ['Chaînes de chakra','Chaîne qui frappe à moyenne portée','palpatine.0','chain','chain',[6],.84,.84],
 ['Senbon fleuris','Aiguilles rapides à distance, avec des pétales','ig88.0','senbon','senbon',[7],.75,.75],
 ['Balles de sable','Projectiles de sable compact qui repoussent','bossk.0','sand','sand',[8],.84,.84],
 ['Danse des os','Lames d\'os, balayage très large','grievous.0','bone','bone',[9],1.42,1.4],
 ['Taijutsu du fauve','Enchaînements violents façon Fauve de Jade','kylo.0','tai','fist',[10],1.6,1.55],
];
const styleOk=(s,clan)=>STYLES[s][5].includes(clan);
// [catégorie, emplacement 1-5, rang, source perso.sort, nom, description, effet visuel]
// catégorie : 'u' Subjutsu (sans clan), 'n0'..'n4' nature, 'c0'..'c10' clan
const JD=[
 // ---- Subjutsu (ninjas sans clan)
 ['u',1,'S','savage.1','Rasengan','Fonce avec une sphère de chakra qui projette en l\'air','rasengan'],
 ['u',1,'C','vader.1','Fûma Shuriken','Shuriken géant qui revient','shuriken'],
 ['u',1,'C','maul.1','Coup de pied tornade','Repousse fort et ralentit','tai'],
 ['u',1,'B','anakin.1','Lotus primaire','Gros coup qui ignore les parades','tai'],
 ['u',2,'C','palpatine.2','Shunshin','Se téléporte dans un tourbillon de feuilles','leaf'],
 ['u',2,'C','lando.2','Kawarimi','Se substitue à une bûche qui explose','smoke'],
 ['u',2,'C','luke.2','Saut ninja','Bondit au curseur, choc à l\'arrivée','leaf'],
 ['u',2,'D','rey.2','Roulade','Roulade rapide','smoke'],
 ['u',2,'A','ventress.2','Hiraishin','Apparaît derrière l\'ennemi visé dans un éclair jaune','hiraishin'],
 ['u',2,'C','padme.2','Kunai à fil','Plante un kunai et se tire jusqu\'à lui','chain'],
 ['u',3,'S','gideon.3','Multiclonage','Deux clones qui lancent des kunai 7 s','smoke'],
 ['u',3,'B','han.3','Parchemin explosif','Se colle au premier ennemi et explose','tag'],
 ['u',3,'D','lando.3','Bombe fumigène','Fumée : ralentit les ennemis, cache les alliés','smoke'],
 ['u',3,'C','wicket.3','Piège ninja','Piège qui étourdit et repousse','steel'],
 ['u',3,'C','cadbane.3','Genjutsu : Plumes','Les ennemis qui restent dedans s\'endorment','genjutsu'],
 ['u',3,'C','rex.3','Kunai explosifs','Explose puis se divise en 4','tag'],
 ['u',4,'B','rey.4','Shôsen','Soigne l\'allié le plus blessé','heal'],
 ['u',4,'B','yoda.3','Zone de soin','Zone de chakra médical autour de soi','heal'],
 ['u',4,'B','luke.4','Contre du clone','Contre le prochain coup : apparaît derrière l\'attaquant','smoke'],
 ['u',4,'C','bossk.4','Pilule du soldat','Soin rapide et se libère','heal'],
 ['u',4,'C','luke.3','Concentration du chakra','Réduit tous ses temps de recharge de 2 s','chakra'],
 ['u',5,'A','wicket.5','Invocation : Crapaud','Un crapaud géant s\'écrase et laisse un sol boueux','smoke'],
 ['u',5,'C','rex.5','Pluie de parchemins','4 parchemins explosifs sur la zone','tag'],
 ['u',5,'S','yoda.5','Mode Ermite','6 s : vitesse, dégâts et soin','sage'],
 ['u',5,'B','r2.5','Invocation : Katsuyu','La limace soigne et recharge le chakra des alliés proches','heal'],
 // ---- Katon
 ['n0',1,'S','jango.1','Katon : Boule de feu','Grosse boule de feu crachée qui repousse','fire'],
 ['n0',1,'S','boba.1','Katon : Météore','Boule de feu explosive qui étourdit','fire'],
 ['n0',1,'B','din.1','Katon : Souffle du dragon','Brûle tout devant soi','fire'],
 ['n0',2,'C','boba.2','Katon : Propulsion','S\'élance porté par les flammes','fire'],
 ['n0',3,'C','finn.3','Katon : Phénix','Explose et laisse le sol en feu','fire'],
 ['n0',3,'B','jango.4','Katon : Souffle ardent','Jet de flammes court qui brûle','fire'],
 ['n0',4,'A','palpatine.4','Katon : Manteau de flammes','Bouclier et flammes autour de soi 3 s','fire'],
 ['n0',5,'S','din.5','Katon : Pluie de phénix','8 petites boules de feu à tête chercheuse','fire'],
 // ---- Suiton
 ['n1',1,'B','luke.1','Suiton : Vague','Vague d\'eau qui repousse et ralentit','water'],
 ['n1',2,'C','deathtrooper.2','Suiton : Brume cachée','Recule dans un nuage de brume','water'],
 ['n1',3,'A','vader.3','Suiton : Prison aqueuse','Enferme la cible dans une bulle d\'eau','water'],
 ['n1',3,'D','bossk.1','Suiton : Balles d\'eau','Bulle qui rebondit 2 fois en éclatant','water'],
 ['n1',4,'B','mace.4','Suiton : Mur d\'eau','2 s : moitié moins de dégâts, renvoie 30 % au contact','water'],
 ['n1',5,'A','maul.5','Suiton : Grand requin','Requin d\'eau géant qui revient','water'],
 ['n1',5,'A','jyn.5','Suiton : Dragon aqueux','Un dragon d\'eau transperce toute une ligne','water'],
 // ---- Fûton
 ['n2',1,'B','ventress.1','Fûton : Lames de vent','Deux lames de vent qui transpercent','wind'],
 ['n2',1,'B','yoda.1','Fûton : Grand souffle','Onde de vent à 360° qui repousse','wind'],
 ['n2',2,'C','quigon.2','Fûton : Pas du vent','Très rapide 2 s, se libère des entraves','wind'],
 ['n2',3,'C','anakin.3','Fûton : Vide','Cône qui rend les ennemis vulnérables','wind'],
 ['n2',3,'B','mace.3','Fûton : Rafale','Repousse et coupe le chakra (silence)','wind'],
 ['n2',4,'B','vader.4','Fûton : Mur de vent','Renvoie les tirs, repousse au contact','wind'],
 ['n2',5,'A','thrawn.5','Fûton : Rasen-shuriken','Un Rasen-shuriken s\'abat sur une grande zone','rasenshuriken'],
 // ---- Raiton
 ['n3',1,'A','grievous.1','Chidori','Fente électrique qui traverse la cible','chidori'],
 ['n3',1,'B','palpatine.1','Raiton : Chaîne','Éclair qui rebondit entre les ennemis','lightning'],
 ['n3',2,'B','ig88.2','Raiton : Pas de l\'éclair','Fonce en éclair à travers les ennemis','lightning'],
 ['n3',3,'B','palpatine.3','Raiton : Orage','La foudre tombe sur une zone après un délai','lightning'],
 ['n3',3,'C','r2.3','Raiton : Piège électrique','Piège qui étourdit','lightning'],
 ['n3',4,'B','grievous.4','Raiton : Armure de foudre','Renvoie les tirs en avançant vite','lightning'],
 ['n3',4,'C','phasma.1','Raiton : Décharge','Décharge autour de soi qui étourdit','lightning'],
 ['n3',5,'S','dooku.5','Raiton : Kirin','Le dragon de foudre frappe en ligne','kirin'],
 // ---- Doton
 ['n4',1,'C','obiwan.1','Doton : Rocher','Projette un rocher qui envoie en l\'air','earth'],
 ['n4',2,'D','jyn.2','Doton : Taupe','Passe sous terre et ressort invisible','earth'],
 ['n4',3,'D','phasma.3','Doton : Mur de terre','Mur qui bloque les tirs','earth'],
 ['n4',4,'C','deathtrooper.4','Doton : Corps de roche','40 % de dégâts en moins','earth'],
 ['n4',5,'B','obiwan.5','Doton : Montagne écrasante','Saut très haut, projette tout le monde à l\'arrivée','earth'],
 ['n4',5,'B','gideon.5','Doton : Séisme','Grand coup de terre circulaire qui repousse','earth'],
 // ---- Uchiha
 ['c0',1,'C','anakin.1','Lame de Kusanagi','Coup de sabre chargé de chakra qui ignore les parades','steel'],
 ['c0',2,'B','maul.2','Shunshin Uchiha','Atterrit derrière l\'ennemi visé','genjutsu'],
 ['c0',3,'B','inquisitor.3','Sharingan : Genjutsu','Le regard terrifie la cible','genjutsu'],
 ['c0',4,'C','ahsoka.4','Sharingan','Lit le prochain coup, l\'évite et accélère','genjutsu'],
 ['c0',5,'S','ahsoka.5','Amaterasu','Flammes noires sur jusqu\'à 5 ennemis','black'],
 ['c0',5,'S','luke.5','Tsukuyomi','Immense cône qui projette et étourdit','tsukuyomi'],
 ['c0',5,'S','kylo.5','Susanô : Totsuka','Trois coups dévastateurs autour de soi','susano'],
 // ---- Hyûga
 ['c1',1,'D','quigon.1','Hakke : Paume','Paume du vide qui étourdit devant soi','jyuken'],
 ['c1',2,'C','ahsoka.2','Pas du Hakke','2 bonds rapides','jyuken'],
 ['c1',3,'D','lando.4','Byakugan','Bloque le chakra de la cible (silence) et la révèle','byakugan'],
 ['c1',4,'C','obiwan.4','Kaiten','Tourbillon divin qui renvoie les tirs','kaiten'],
 ['c1',5,'C','mace.5','Hakke : 64 points','Tous les ennemis proches : dégâts, étourdis et vulnérables','hakke64'],
 // ---- Nara
 ['c2',1,'D','padme.1','Kage Mane','L\'ombre immobilise la cible','shadow'],
 ['c2',2,'C','grievous.2','Course de l\'ombre','Très rapide, insensible aux ralentissements','shadow'],
 ['c2',3,'B','maul.3','Kage Kubi Shibari','Des mains d\'ombre saisissent et attirent','shadow'],
 ['c2',4,'C','gideon.2','Ombre protectrice','Recule d\'un bond avec un bouclier d\'ombre','shadow'],
 ['c2',5,'A','rey.5','Ombres liées','Attire tous les ennemis proches puis les étourdit','shadow'],
 // ---- Akimichi
 ['c3',1,'B','sister.1','Paume géante','Repousse ; étourdit si la cible heurte un obstacle','tai'],
 ['c3',2,'D','chewie.2','Boulet humain','Roule et renverse','tai'],
 ['c3',3,'B','chewie.3','Décuplement partiel','Bras géant qui attrape et jette derrière soi','tai'],
 ['c3',4,'C','bossk.4','Pilule rouge','Soin rapide et se libère','heal'],
 ['c3',5,'B','savage.5','Décuplement','Devient énorme 6 s : bouclier, dégâts et portée','gate'],
 // ---- Aburame
 ['c4',1,'B','lando.1','Insectes chercheurs','Nuée qui rebondit sur 3 ennemis','bugs'],
 ['c4',2,'B','lando.2','Clone d\'insectes','Se téléporte et laisse un clone d\'insectes','bugs'],
 ['c4',3,'A','boba.3','Essaim d\'insectes','3 nuées qui empoisonnent','bugs'],
 ['c4',4,'S','ventress.4','Insectes dévoreurs','Lien qui vole le chakra tant que la cible reste proche','bugs'],
 ['c4',5,'S','deathtrooper.5','Nuée destructrice','3 nuées qui attaquent 8 s','bugs'],
 // ---- Inuzuka
 ['c5',1,'B','rey.1','Gatsûga','Tornade-vrille qui traverse les ennemis','gatsuga'],
 ['c5',2,'C','bossk.2','Instinct bestial','Bondit sur l\'ennemi le plus blessé','tai'],
 ['c5',3,'S','iden.1','Ninken','Le chien ninja attaque à tes côtés 8 s','smoke'],
 ['c5',4,'C','ahsoka.4','Flair du chien','Évite le prochain coup et accélère','tai'],
 ['c5',5,'A','anakin.5','Garôga','Double vrille géante qui frappe jusqu\'à 4 ennemis','gatsuga'],
 // ---- Uzumaki
 ['c6',1,'C','cadbane.1','Chaînes de chakra','Attrape un ennemi et le ramène','chain'],
 ['c6',1,'S','savage.1','Rasengan','Fonce avec une sphère de chakra qui projette en l\'air','rasengan'],
 ['c6',2,'B','dooku.2','Sceau d\'échange','Échange sa place avec l\'ennemi touché','chain'],
 ['c6',3,'B','dooku.3','Sceau','La cible ne peut plus attaquer','seal'],
 ['c6',3,'S','gideon.3','Multiclonage','Deux clones qui lancent des kunai 7 s','smoke'],
 ['c6',4,'C','bossk.4','Vitalité Uzumaki','Soin rapide et se libère','heal'],
 ['c6',5,'A','chewie.5','Chakra de Kyûbi','6 s : inarrêtable, régénération et dégâts','fox'],
 // ---- Yamanaka
 ['c7',1,'A','inquisitor.3','Shinranshin','Projectile mental qui terrifie','genjutsu'],
 ['c7',2,'C','thrawn.2','Transposition','Échange sa place avec un allié','genjutsu'],
 ['c7',3,'S','kylo.3','Shintenshin','Lien : si la cible reste proche 2 s, gros dégâts et étourdie','mind'],
 ['c7',4,'S','quigon.3','Champ de fleurs','Aura de soin qui le suit 5 s','flower'],
 ['c7',5,'S','sister.5','Esprit destructeur','Coup fatal sur les ennemis blessés','mind'],
 // ---- Sabaku
 ['c8',1,'D','kylo.1','Cercueil de sable','Le sable fige la cible sur place','sandcoffin'],
 ['c8',2,'C','cadbane.2','Sable volant','S\'élève sur un nuage de sable et retombe plus loin','sand'],
 ['c8',3,'D','cal.3','Sable mouvant','Zone où ennemis et tirs ralentissent','sand'],
 ['c8',4,'C','thrawn.4','Armure de sable','Bouclier de sable pour les alliés proches','sand'],
 ['c8',5,'B','grievous.5','Tsunami de sable','Tourbillon géant qui aspire','sand'],
 // ---- Kaguya
 ['c9',1,'C','gideon.1','Doigts-balles','Tire un os comme une balle','bone'],
 ['c9',2,'B','savage.2','Bond d\'os','Bondit et repousse tout à l\'arrivée','bone'],
 ['c9',3,'B','iden.3','Forêt naissante','Des os jaillissent du sol et étourdissent','bone'],
 ['c9',4,'B','gideon.4','Armure d\'os','Inarrêtable, 30 % de dégâts en moins','bone'],
 ['c9',5,'B','inquisitor.5','Forêt d\'os','Anneau d\'os qui jaillissent autour de soi','bone'],
 // ---- Taijutsuka (Fauves de jade)
 ['c10',1,'D','maul.1','Konoha Senpû','Coup de pied tornade qui repousse et ralentit','tai'],
 ['c10',1,'C','anakin.1','Lotus primaire','Saisit et projette : ignore les parades','tai'],
 ['c10',1,'C','savage.3','Konoha Daisenpû','Tourbillon de coups de pied qui étourdit autour de soi','tai'],
 ['c10',2,'D','quigon.2','Poids retirés','Très rapide 2 s, se libère des entraves','gate'],
 ['c10',2,'C','savage.2','Bond du fauve','Bondit et repousse tout à l\'arrivée','tai'],
 ['c10',3,'D','bossk.2','Dynamic Entry','Fond sur l\'ennemi le plus blessé d\'un coup de pied','tai'],
 ['c10',3,'B','mace.1','Lotus caché','La cible subit +25 % de dégâts','gate'],
 ['c10',4,'D','savage.4','Première Porte','Inarrêtable 3 s','gate'],
 ['c10',4,'D','ahsoka.4','Esquive du fauve','Évite le prochain coup et accélère','tai'],
 ['c10',5,'B','bossk.5','Huit Portes','Rage, vitesse et vol de vie 5 s','gate'],
 ['c10',5,'B','iden.5','Paon du matin','Rafale de coups enflammés devant soi','peacock'],
 ['c10',5,'B','gideon.5','Tigre du soir','Coup d\'air géant qui repousse tout autour','gate'],
];
// réglages propres à certains jutsu (réglés par duels simulés)
const JPAR={'Multiclonage':{d:1.2},'Ninken':{d:3},'Insectes dévoreurs':{dps:4}};
const JL=JD.map(([cat,slot,r,src,n,d,vfx],id)=>({id,cat,slot,r,cost:RANKS[r],src,n,d,vfx,P:JPAR[n]}));
const SLOTN=['Style de combat','Jutsu principal','Déplacement','Technique','Défense','Ultime'];
const catName=c=>c==='u'?'Subjutsu':c[0]==='n'?NATURES[+c.slice(1)][0]:'Clan '+CLANS[+c.slice(1)][0];
const catCol=c=>c==='u'?'#c8b89a':c[0]==='n'?NATURES[+c.slice(1)][2]:CLANS[+c.slice(1)][1];
// jutsu accessibles : jutsu de clan (ou Subjutsu sans clan) + jutsu de sa nature (les Taijutsuka n'ont pas de nature)
const avail=(b,slot)=>JL.filter(j=>j.slot===slot&&((b.clan>=0?j.cat==='c'+b.clan:j.cat==='u')||(b.clan!==TAIJ&&j.cat==='n'+b.nat)));
const kitCost=b=>b.j.slice(1).reduce((a,id)=>a+JL[id].cost,0);
// passifs renommés
Object.assign(PASS,{third:['Taijutsu',PASS.third[1]],crit:['Précision ninja',PASS.crit[1]],slow:['Fils de chakra',PASS.slow[1]],lifesteal:['Vol de chakra',PASS.lifesteal[1]],rage:['Volonté du feu',PASS.rage[1]],
 armor:['Corps endurci',PASS.armor[1]],regen:['Sang Uzumaki',PASS.regen[1]],speed:['Pieds légers',PASS.speed[1]],energy:['Contrôle du chakra','Récupère 50 % de chakra en plus']});
const PASSK=Object.keys(PASS);
// voies : modifient PV, vitesse et puissance
const VOIES=[['Taijutsu',1.12,6,.95],['Équilibré',1,0,1],['Ninjutsu',.9,-4,1.08]];
const CAMPS=['Alliance Shinobi','Akatsuki'];
const VILLAGES=[['Konoha','#1f3a6a'],['Suna','#7a5a2a'],['Kiri','#2a5a6a'],['Kumo','#3a3a4a'],['Iwa','#5a3a2a'],['Oto','#4a2a5a'],['Nukenin','#2a2a2a']];
const TENUES=[['Tenue orange',{legs:'#2a3550',torso:'#f08a24',arm:'#f08a24',belt:'#2a3550',boot:'#1a2a48'}],['Gilet de chûnin',{legs:'#1f2c48',torso:'#26365a',vest:'#5a6e3a',arm:'#26365a',belt:'#1a2238',boot:'#1a2238'}],
 ['Manteau Akatsuki',{legs:'#16161c',torso:'#16161c',robe:'#16161c',clouds:1,arm:'#16161c',boot:'#2a2a33'}],['Tenue Anbu',{legs:'#2a2a30',torso:'#3a3a42',armor:'#c8ccd4',arm:'#2a2a30',belt:'#555',boot:'#222'}],
 ['Kimono Hyûga',{legs:'#d8d0c0',torso:'#ece6da',robe:'#ddd6c8',arm:'#ece6da',belt:'#6a5a8a',boot:'#5a5060'}],['Tenue Uchiha',{legs:'#d8d8dc',torso:'#1c2238',tunic:'#2a3050',arm:'#1c2238',belt:'#6a2a2a',boot:'#222'}],
 ['Tenue de Suna',{legs:'#6a5038',torso:'#8a6a48',cape:'#5a4030',arm:'#8a6a48',belt:'#3a2a1a',boot:'#3a2a1a'}],['Tenue verte',{legs:'#3a7a3a',torso:'#4a8a3a',vest:'#5a6e3a',arm:'#4a8a3a',belt:'#c03a2a',boot:'#c8b080'}]];
const COIFS=[['Pics','pics'],['Lisses','lisse'],['Queue haute','queue'],['Courts','courts'],['Chignons','chignons'],['Crâne rasé','chauve']];
const HAIRC=[['Blond','#f2c84a'],['Noir','#1a1a22'],['Rose','#f08ab0'],['Roux','#c0482a'],['Blanc','#e8e8f0'],['Brun','#6b4a2a'],['Bleu nuit','#2a3a6a'],['Rouge','#b8202a']];
const PEAUX=[['Claire','#f6d6b4'],['Mate','#e0b08a'],['Hâlée','#b8805a'],['Foncée','#7a5038'],['Pâle','#e8e0e8']];
const CHAKRAS=[['Bleu','#3af'],['Rouge','#f33'],['Vert','#3f6'],['Violet','#a5f'],['Orange','#f93'],['Blanc','#eef'],['Jaune','#fd3']];
const ACCS=[['Aucun',''],['Masque','masque'],['Moustaches','moust'],['Marques rouges','marques'],['Lunettes','lunettes']];
// build : {name, side, voie, nat, clan (-1 = sans clan), j:[style, 5 id de jutsu], pass, l:{v,t,c,h,p,k,a}}
// strict : ramène le kit sous le budget (pour les builds reçus en ligne et les bots)
function sanitizeBuild(b,strict){b=b&&typeof b==='object'?b:{};const n=(a,m)=>Math.max(0,Math.min(m-1,(a|0)));const l=b.l||{};
 const o={name:String(b.name||'Ninja').replace(/[<>]/g,'').slice(0,16)||'Ninja',side:b.side?1:0,voie:n(b.voie??1,VOIES.length),nat:n(b.nat,NATURES.length),clan:b.clan==null?-1:Math.max(-1,Math.min(CLANS.length-1,b.clan|0)),pass:n(b.pass,PASSK.length),
  l:{v:n(l.v,VILLAGES.length),t:n(l.t,TENUES.length),c:n(l.c,COIFS.length),h:n(l.h,HAIRC.length),p:n(l.p,PEAUX.length),k:n(l.k,CHAKRAS.length),a:n(l.a,ACCS.length)}};
 const st=(b.j||[])[0];o.j=[STYLES[st]&&styleOk(st,o.clan)?st:STYLES.findIndex((_,i)=>styleOk(i,o.clan))];
 for(let s=1;s<6;s++){const A=avail(o,s),id=(b.j||[])[s];o.j.push(A.some(j=>j.id===id)?id:A.reduce((a,c)=>c.cost<a.cost?c:a).id)}
 if(strict)while(kitCost(o)>BUDGET){let best=null;o.j.forEach((id,s)=>{if(!s)return;for(const c of avail(o,s))if(c.cost<JL[id].cost){const gain=JL[id].cost-c.cost;if(!best||gain>best.g)best={s,id:c.id,g:gain}}});if(!best)break;o.j[best.s]=best.id}
 return o}
// le clan se voit : Sharingan, Byakugan, carrure Akimichi, marques Kaguya, chien Inuzuka, gourde Sabaku ; l'arme suit le style de combat
function ninjaLook(l,clan,style){const v=VILLAGES[l.v],S=STYLES[style]||STYLES[0];return Object.assign({},TENUES[l.t][1],clan===3?{scale:1.14}:{},clan===5?{dog:1}:{},clan===8?{gourd:1}:{},
 {head:{t:'ninja',skin:PEAUX[l.p][1],hair:HAIRC[l.h][1],style:COIFS[l.c][1],band:v[1],vil:l.v,acc:ACCS[l.a][1],eye:clan===0?'#e01a1a':clan===1?'#e8e8f8':null,kaguya:clan===9,brows:clan===TAIJ},weapon:{t:'kunai',k:S[4],col:CHAKRAS[l.k][1]}})}
const srcAb=src=>{const [h,k]=src.split('.');return SRC[h].abil[+k]};
function jutsu(id){const J=JL[id],b=srcAb(J.src);return Object.assign({},b,J.P?{P:Object.assign({},b.P,J.P)}:{},{n:J.n,d:J.d,ex:null,src:J.src.split('.')[0],vfx:J.vfx,rank:J.r,jid:id})}
function styleAb(i){const S=STYLES[i],b=srcAb(S[2]);return Object.assign({},b,{n:S[0],d:S[1],ex:null,src:S[2].split('.')[0],vfx:S[3],style:i})}
// stats : moyenne des persos d'origine (le style de combat compte pour 5 : un ninja à distance est fragile, un ninja au corps à corps solide), puis la voie
function mkNinja(b,strict){b=sanitizeBuild(b,strict);const abil=[styleAb(b.j[0])].concat(b.j.slice(1).map(id=>jutsu(id))),w=[5,1,1,1,1,1];let hp=0,pw=0,sp=0,W=0;
 abil.forEach((a,s)=>{const o=SRC[a.src];hp+=o.hp*w[s];pw+=o.pw*w[s];sp+=o.spd*w[s];W+=w[s]});const v=VOIES[b.voie],S=STYLES[b.j[0]];hp*=S[6];pw*=S[7];if(b.clan===TAIJ){hp*=1.15;pw*=1.1;sp+=8*W} // corps surentraîné : pas de ninjutsu, mais plus solide et plus rapide
 const lign=b.clan>=0?'Clan '+CLANS[b.clan][0]:'Sans clan';
 return{name:b.name,side:b.side,desc:`${lign}${b.clan===TAIJ?'':' · '+NATURES[b.nat][0]} · voie ${v[0].toLowerCase()}`,hp:Math.round(hp/W*v[1]),spd:Math.round(sp/W+v[2]),pw:Math.round(pw/W*v[3]*100)/100,pref:200,pass:PASSK[b.pass],look:ninjaLook(b.l,b.clan,b.j[0]),abil,build:b}}
// générateur pseudo-aléatoire déterministe (mêmes ninjas adverses chez tous les joueurs en ligne)
const srnd=seed=>()=>(seed=seed*16807%2147483647)/2147483647;
function randomKit(r,b){const k=a=>Math.floor(r()*a.length);b.nat=k(NATURES);b.clan=r()<.8?k(CLANS):-1;b.voie=k(VOIES);b.pass=k(PASSK);
 b=sanitizeBuild(b);const ST=STYLES.map((_,i)=>i).filter(i=>styleOk(i,b.clan));b.j=[ST[k(ST)]];for(let s=1;s<6;s++){const A=avail(b,s);b.j.push(A[k(A)].id)}return sanitizeBuild(b,true)}
function randomBuild(r,side,name){const k=a=>Math.floor(r()*a.length);
 return randomKit(r,{name,side,l:{v:side&&r()<.6?6:k(VILLAGES.slice(0,6)),t:side?(r()<.55?2:k(TENUES)):[0,1,3,4,5,6,7][k([0,1,3,4,5,6,7])],c:k(COIFS),h:k(HAIRC),p:k(PEAUX),k:k(CHAKRAS),a:r()<.6?0:k(ACCS)}})}
const BOTN=[['Hayate','Kaito','Ren','Sora','Yuki','Haruto','Aiko','Daichi','Emi','Hikaru','Kenji','Mitsuki','Natsu','Riku','Saki','Takumi','Yori','Asuka','Jiro','Kaede'],
 ['Kurogane','Akuma','Raijin','Mizore','Shiden','Gekkô','Hebi','Kagerô','Oboro','Tetsu','Jaku','Kirisame','Yami','Rasetsu','Kuroi','Hyôga','Doku','Zangetsu','Mukuro','Shura']];
/*NR_PASS*/
// ninjas adverses : moitié inspirés des modèles, moitié au hasard ; le nom de clan suit le prénom
const CH={};{const r=srnd(4242);for(let s=0;s<2;s++)BOTN[s].forEach((n,i)=>{const b=r()<.5?presetBuild(Math.floor(r()*PRESETS.length),n,s):randomBuild(r,s,n);if(b.clan>=0)b.name=n+' '+CLANS[b.clan][0];if(s&&r()<.6){b.l.t=2;b.l.v=6}CH['b'+(s*20+i)]=mkNinja(b,true)})}
const HEROES=Object.keys(CH);
// ton ninja (gardé dans le navigateur)
let MY;try{MY=sanitizeBuild(JSON.parse(localStorage.getItem('nrBuild3')||'null')||presetBuild(0,'Ninja',0))}catch(e){MY=randomBuild(srnd(99),0,'Ninja')}
CH.p0=mkNinja(MY);
