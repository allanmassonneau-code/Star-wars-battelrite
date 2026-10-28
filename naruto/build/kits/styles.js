// ===== Styles de combat (attaque de base, gratuite) =====
// [nom, description, source, vfx, arme, clans autorisés (-1 = sans clan), modif. PV, modif. puissance]
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
 ['Chaînes de chakra','Chaîne qui frappe à moyenne portée','palpatine.0','chain','chain',[6],.76,.76],
 ['Senbon fleuris','Aiguilles rapides à distance, avec des pétales','ig88.0','senbon','senbon',[7],.75,.75],
 ['Balles de sable','Projectiles de sable compact qui repoussent','bossk.0','sand','sand',[8],.84,.84],
 ['Danse des os','Lames d\'os, balayage très large','grievous.0','bone','bone',[9],1.42,1.4],
 ['Taijutsu du fauve','Enchaînements violents façon Fauve de Jade','kylo.0','tai','fist',[10],1.6,1.55],
];
