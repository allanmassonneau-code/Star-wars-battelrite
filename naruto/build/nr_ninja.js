// ===================== NINJAS : chacun crée son ninja et compose son kit =====================
// Les jutsu réutilisent les mécaniques éprouvées du moteur (SRC) avec leurs propres effets visuels (vfx).
// Rangs D C B A S = coût en points ; le kit a un budget maximum. Jutsu universels + nature(s) + clan.
const RANKS={D:1,C:2,B:3,A:4,S:5},RANKC={D:'#9aa3ad',C:'#6fcf6f',B:'#5ab4ff',A:'#c07aff',S:'#ffc53a'},BUDGET=17;
const NATURES=[['Katon','Feu','#ff7a2a'],['Suiton','Eau','#3aa8ff'],['Fûton','Vent','#9fe8c8'],['Raiton','Foudre','#ffe14a'],['Doton','Terre','#b08850']];
const CLANS=[['Uchiha','#c0202a'],['Hyûga','#d8d0f0'],['Nara','#5a6a3a'],['Akimichi','#d87a3a'],['Aburame','#4a6a5a'],['Inuzuka','#a04a2a'],['Uzumaki','#e0503a'],['Yamanaka','#c8a0e0'],['Sabaku','#c8a060'],['Kaguya','#e8e8e0']];
// [catégorie, emplacement 0-5, rang, source perso.sort, nom, description, nom EX, description EX, effet visuel]
// catégorie : 'u' universel, 'n0'..'n4' nature, 'c0'..'c9' clan
const JD=[
 ['u',0,'D','lando.0','Kunai','Lancer de kunai rapide','','','kunai'],
 ['u',0,'D','deathtrooper.0','Shuriken','Trois shuriken en éventail','','','shuriken'],
 ['u',0,'D','rey.0','Taijutsu','Enchaînement de coups rapides','','','tai'],
 ['u',0,'C','ig88.0','Senbon','Aiguilles très rapides, longue portée','','','senbon'],
 ['u',0,'C','mace.0','Lame de chakra','Grands coups de lame imprégnée de chakra','','','chakra'],
 ['u',0,'C','vader.0','Grande épée','Coup lent et lourd qui ralentit','','','steel'],
 ['u',0,'C','quigon.0','Poing du lotus','Chaque coup qui touche le soigne','','','tai'],
 ['u',1,'A','savage.1','Rasengan','Fonce avec une sphère de chakra qui projette en l\'air','Rasengan géant','Plus long et plus fort','chakra'],
 ['u',1,'C','vader.1','Fûma Shuriken','Shuriken géant qui revient','','','shuriken'],
 ['u',1,'C','maul.1','Coup de pied tornade','Repousse fort et ralentit','','','tai'],
 ['u',1,'B','anakin.1','Lotus primaire','Gros coup qui ignore les parades','','','tai'],
 ['u',2,'C','palpatine.2','Shunshin','Se téléporte dans un tourbillon de feuilles','','','leaf'],
 ['u',2,'C','lando.2','Kawarimi','Se substitue à une bûche qui explose','','','smoke'],
 ['u',2,'C','luke.2','Saut ninja','Bondit au curseur, choc à l\'arrivée','','','leaf'],
 ['u',2,'C','yoda.2','Bonds acrobatiques','3 petits bonds rechargeables','','','leaf'],
 ['u',2,'D','rey.2','Roulade','Roulade rapide','','','smoke'],
 ['u',2,'A','ventress.2','Hiraishin','Apparaît derrière l\'ennemi visé','','','chakra'],
 ['u',3,'B','gideon.3','Multiclonage','Deux clones qui lancent des kunai 7 s','Clones d\'ombre','Dégâts doublés','smoke'],
 ['u',3,'C','han.3','Parchemin explosif','Se colle au premier ennemi et explose','','','tag'],
 ['u',3,'D','lando.3','Bombe fumigène','Fumée : ralentit les ennemis, cache les alliés','','','smoke'],
 ['u',3,'C','wicket.3','Piège ninja','Piège qui étourdit et repousse','','','steel'],
 ['u',3,'B','cadbane.3','Genjutsu : Plumes','Les ennemis qui restent dedans s\'endorment','','','genjutsu'],
 ['u',3,'C','rex.3','Kunai explosifs','Explose puis se divise en 4','','','tag'],
 ['u',4,'B','rey.4','Shôsen','Soigne l\'allié le plus blessé','','','heal'],
 ['u',4,'B','yoda.3','Zone de soin','Zone de chakra médical autour de soi','','','heal'],
 ['u',4,'B','luke.4','Contre du clone','Contre le prochain coup : apparaît derrière l\'attaquant','','','smoke'],
 ['u',4,'C','savage.4','Première Porte','Inarrêtable 3 s','','','gate'],
 ['u',4,'C','bossk.4','Pilule du soldat','Soin rapide et se libère','','','heal'],
 ['u',5,'A','wicket.5','Invocation : Crapaud','Un crapaud géant s\'écrase et laisse un sol boueux','','','smoke'],
 ['u',5,'A','bossk.5','Huit Portes','Rage, vitesse et vol de vie 5 s','','','gate'],
 ['u',5,'B','rex.5','Pluie de parchemins','4 parchemins explosifs sur la zone','','','tag'],
 // ---- natures
 ['n0',1,'B','jango.1','Katon : Boule de feu','Grosse boule de feu qui repousse','Katon : Grand feu','Explosion plus large','fire'],
 ['n0',1,'B','din.1','Katon : Souffle du dragon','Brûle tout devant soi','','','fire'],
 ['n0',3,'C','finn.3','Katon : Phénix','Explose et laisse le sol en feu','','','fire'],
 ['n0',3,'C','jango.4','Katon : Souffle ardent','Jet de flammes court qui brûle','','','fire'],
 ['n0',5,'A','din.5','Katon : Pluie de phénix','8 petites boules de feu à tête chercheuse','','','fire'],
 ['n1',1,'B','luke.1','Suiton : Vague','Cône d\'eau qui repousse et ralentit','Suiton : Raz-de-marée','Plus large, étourdit','water'],
 ['n1',3,'B','vader.3','Suiton : Prison aqueuse','Enferme et étouffe à distance','','','water'],
 ['n1',4,'B','mace.4','Suiton : Mur d\'eau','2 s : moitié moins de dégâts, renvoie 30 % au contact','','','water'],
 ['n1',5,'A','maul.5','Suiton : Grand requin','Requin d\'eau géant qui revient','','','water'],
 ['n2',1,'B','ventress.1','Fûton : Lames de vent','Deux lames de vent qui transpercent','Fûton : Tempête','Plus de lames','wind'],
 ['n2',2,'C','quigon.2','Fûton : Pas du vent','Très rapide 2 s, se libère des entraves','','','wind'],
 ['n2',3,'C','anakin.3','Fûton : Vide','Cône qui rend les ennemis vulnérables','','','wind'],
 ['n2',5,'S','thrawn.5','Fûton : Rasen-shuriken','Un Rasen-shuriken s\'abat sur une grande zone','','','wind'],
 ['n3',0,'C','palpatine.0','Raiton : Étincelles','Courts arcs électriques','','','lightning'],
 ['n3',1,'A','grievous.1','Chidori','Fente électrique qui traverse la cible','Chidori nagashi','Plus long, étourdit','lightning'],
 ['n3',1,'B','palpatine.1','Raiton : Chaîne','Éclair qui rebondit entre les ennemis','','','lightning'],
 ['n3',3,'B','palpatine.3','Raiton : Orage','La foudre tombe sur une zone après un délai','','','lightning'],
 ['n3',4,'B','grievous.4','Raiton : Armure de foudre','Renvoie les tirs en avançant vite','','','lightning'],
 ['n3',5,'S','dooku.5','Raiton : Kirin','Le dragon de foudre frappe en ligne','','','lightning'],
 ['n4',1,'B','obiwan.1','Doton : Rocher','Projette un rocher qui envoie en l\'air','Doton : Éboulement','Plus gros','earth'],
 ['n4',2,'C','jyn.2','Doton : Taupe','Passe sous terre et ressort invisible','','','earth'],
 ['n4',3,'C','phasma.3','Doton : Mur de terre','Mur qui bloque les tirs','','','earth'],
 ['n4',4,'B','deathtrooper.4','Doton : Corps de roche','40 % de dégâts en moins','','','earth'],
 ['n4',5,'A','obiwan.5','Doton : Montagne écrasante','Saut très haut, projette tout le monde à l\'arrivée','','','earth'],
 // ---- clans
 ['c0',3,'B','inquisitor.3','Sharingan : Genjutsu','Le regard terrifie la cible','','','genjutsu'],
 ['c0',4,'C','ahsoka.4','Sharingan','Lit le prochain coup, l\'évite et accélère','','','genjutsu'],
 ['c0',5,'S','ahsoka.5','Amaterasu','Flammes noires sur jusqu\'à 5 ennemis','','','black'],
 ['c0',5,'A','luke.5','Tsukuyomi','Immense cône qui projette et étourdit','','','genjutsu'],
 ['c0',5,'S','kylo.5','Susanô : Totsuka','Trois coups dévastateurs autour de soi','','','chakra'],
 ['c1',0,'C','yoda.0','Poing souple','Frappes du Jûken qui ralentissent','','','jyuken'],
 ['c1',1,'B','quigon.1','Hakke : Paume','Paume du Hakke qui étourdit devant soi','Hakke : Vide','Plus fort','jyuken'],
 ['c1',3,'C','lando.4','Byakugan','Bloque le chakra de la cible (silence) et la révèle','','','jyuken'],
 ['c1',4,'B','obiwan.4','Kaiten','Tourbillon divin qui renvoie les tirs','','','jyuken'],
 ['c1',5,'A','mace.5','Hakke : 64 points','Tous les ennemis proches : dégâts, étourdis et vulnérables','','','jyuken'],
 ['c2',1,'B','padme.1','Kage Mane','L\'ombre immobilise la cible','Ombre étendue','Plus longue','shadow'],
 ['c2',3,'B','maul.3','Kage Kubi Shibari','L\'ombre saisit et attire un peu','','','shadow'],
 ['c2',5,'A','rey.5','Ombres liées','Attire tous les ennemis proches puis les étourdit','','','shadow'],
 ['c3',0,'C','savage.0','Poing décuplé','Coups lourds','','','tai'],
 ['c3',2,'C','chewie.2','Boulet humain','Roule et renverse','','','tai'],
 ['c3',5,'S','savage.5','Décuplement','Devient énorme 6 s : bouclier, dégâts et portée','','','gate'],
 ['c4',3,'B','boba.3','Essaim d\'insectes','3 nuées qui empoisonnent','','','bugs'],
 ['c4',4,'B','ventress.4','Insectes dévoreurs','Lien qui vole le chakra tant que la cible reste proche','','','bugs'],
 ['c4',5,'A','deathtrooper.5','Nuée destructrice','3 nuées qui attaquent 8 s','','','bugs'],
 ['c5',1,'B','rey.1','Gatsûga','Tornade qui traverse les ennemis','','','tai'],
 ['c5',2,'C','bossk.2','Instinct bestial','Bondit sur l\'ennemi le plus blessé','','','tai'],
 ['c5',3,'B','iden.1','Ninken','Un chien ninja le suit et attaque 8 s','','','smoke'],
 ['c5',5,'A','anakin.5','Garôga','Frappe jusqu\'à 4 ennemis d\'affilée','','','tai'],
 ['c6',1,'B','cadbane.1','Chaînes de chakra','Attrape un ennemi et le ramène','','','chain'],
 ['c6',3,'B','dooku.3','Sceau','La cible ne peut plus attaquer','','','chain'],
 ['c6',5,'S','chewie.5','Chakra de Kyûbi','6 s : inarrêtable, régénération et dégâts','','','fox'],
 ['c7',3,'B','kylo.3','Shintenshin','Lien : si la cible reste proche 2 s, gros dégâts et étourdie','','','genjutsu'],
 ['c7',4,'C','quigon.3','Champ de fleurs','Aura de soin qui le suit 5 s','','','heal'],
 ['c7',5,'A','sister.5','Esprit destructeur','Coup fatal sur les ennemis blessés','','','genjutsu'],
 ['c8',1,'B','kylo.1','Cercueil de sable','Le sable fige la cible sur place','Funérailles du désert','Plus long','sand'],
 ['c8',3,'C','cal.3','Sable mouvant','Zone où ennemis et tirs ralentissent','','','sand'],
 ['c8',4,'B','thrawn.4','Armure de sable','Bouclier pour les alliés proches','','','sand'],
 ['c8',5,'A','grievous.5','Tsunami de sable','Tourbillon géant qui aspire','','','sand'],
 ['c9',0,'C','grievous.0','Danse du saule','Balayage très large avec des os','','','bone'],
 ['c9',1,'C','gideon.1','Doigts-balles','Tire un os comme une balle','','','bone'],
 ['c9',5,'A','inquisitor.5','Forêt d\'os','Anneau d\'os qui jaillissent autour de soi','','','bone'],
 // ---- ajouts (en fin de liste pour garder les ninjas déjà enregistrés)
 ['u',0,'D','finn.0','Double kunai','Deux kunai lancés ensemble','','','kunai'],
 ['u',2,'C','padme.2','Kunai à fil','Plante un kunai et se tire jusqu\'à lui','','','chain'],
 ['u',3,'B','jango.3','Clone explosif','Un clone piégé explose en grand anneau','','','smoke'],
 ['u',4,'C','luke.3','Concentration du chakra','Réduit tous ses temps de recharge de 2 s','','','chakra'],
 ['u',5,'A','yoda.5','Mode Ermite','6 s : vitesse, dégâts et soin','','','gate'],
 ['u',5,'B','r2.5','Invocation : Katsuyu','La limace soigne et recharge le chakra des alliés proches','','','heal'],
 ['n0',1,'B','boba.1','Katon : Météore','Boule de feu explosive qui étourdit','','','fire'],
 ['n1',2,'C','deathtrooper.2','Suiton : Brume cachée','Recule dans un nuage de brume','','','water'],
 ['n1',3,'C','bossk.1','Suiton : Balles d\'eau','Bulle qui rebondit 2 fois en éclatant','','','water'],
 ['n1',5,'A','jyn.5','Suiton : Dragon aqueux','Un dragon d\'eau transperce toute une ligne','','','water'],
 ['n2',1,'B','yoda.1','Fûton : Grand souffle','Onde de vent à 360° qui repousse','','','wind'],
 ['n2',3,'B','mace.3','Fûton : Rafale','Repousse et coupe le chakra (silence)','','','wind'],
 ['n3',3,'C','r2.3','Raiton : Piège électrique','Piège qui étourdit','','','lightning'],
 ['n3',4,'C','phasma.1','Raiton : Décharge','Décharge autour de soi qui étourdit','','','lightning'],
 ['n4',5,'A','gideon.5','Doton : Séisme','Grand coup de terre circulaire qui repousse','','','earth'],
];
const JL=JD.map(([cat,slot,r,src,n,d,xn,xd,vfx],id)=>({id,cat,slot,r,cost:RANKS[r],src,n,d,xn,xd,vfx}));
const SLOTN=['Attaque de base','Jutsu principal','Déplacement','Technique','Défense','Ultime'];
const catName=c=>c==='u'?'Universel':c[0]==='n'?NATURES[+c.slice(1)][0]:'Clan '+CLANS[+c.slice(1)][0];
const catCol=c=>c==='u'?'#c8b89a':c[0]==='n'?NATURES[+c.slice(1)][2]:CLANS[+c.slice(1)][1];
// jutsu accessibles : universels + nature principale + (clan, ou seconde nature si sans clan)
const avail=(b,slot)=>JL.filter(j=>j.slot===slot&&(j.cat==='u'||j.cat==='n'+b.nat||(b.clan>=0?j.cat==='c'+b.clan:j.cat==='n'+b.nat2)));
const kitCost=b=>b.j.reduce((a,id)=>a+JL[id].cost,0);
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
// build : {name, side, voie, nat, clan (-1 = sans clan), nat2, j:[6 id de jutsu], pass, l:{v,t,c,h,p,k,a}}
// strict : ramène le kit sous le budget (pour les builds reçus en ligne et les bots)
function sanitizeBuild(b,strict){b=b&&typeof b==='object'?b:{};const n=(a,m)=>Math.max(0,Math.min(m-1,(a|0)));const l=b.l||{};
 const o={name:String(b.name||'Ninja').replace(/[<>]/g,'').slice(0,16)||'Ninja',side:b.side?1:0,voie:n(b.voie??1,VOIES.length),nat:n(b.nat,NATURES.length),clan:b.clan==null?0:Math.max(-1,Math.min(CLANS.length-1,b.clan|0)),nat2:n(b.nat2??1,NATURES.length),pass:n(b.pass,PASSK.length),
  l:{v:n(l.v,VILLAGES.length),t:n(l.t,TENUES.length),c:n(l.c,COIFS.length),h:n(l.h,HAIRC.length),p:n(l.p,PEAUX.length),k:n(l.k,CHAKRAS.length),a:n(l.a,ACCS.length)}};
 if(o.clan<0&&o.nat2===o.nat)o.nat2=(o.nat+1)%NATURES.length;
 o.j=[0,1,2,3,4,5].map(s=>{const A=avail(o,s),id=(b.j||[])[s];return A.some(j=>j.id===id)?id:A.reduce((a,c)=>c.cost<a.cost?c:a).id});
 if(strict)while(kitCost(o)>BUDGET){let best=null;o.j.forEach((id,s)=>{for(const c of avail(o,s))if(c.cost<JL[id].cost){const gain=JL[id].cost-c.cost;if(!best||gain>best.g)best={s,id:c.id,g:gain}}});if(!best)break;o.j[best.s]=best.id}
 return o}
// le clan se voit : Sharingan, Byakugan, carrure Akimichi, marques Kaguya
function ninjaLook(l,clan){const v=VILLAGES[l.v];return Object.assign({},TENUES[l.t][1],clan===3?{scale:1.14}:{},{head:{t:'ninja',skin:PEAUX[l.p][1],hair:HAIRC[l.h][1],style:COIFS[l.c][1],band:v[1],vil:l.v,acc:ACCS[l.a][1],eye:clan===0?'#e01a1a':clan===1?'#e8e8f8':null,kaguya:clan===9},weapon:{t:'kunai',col:CHAKRAS[l.k][1]}})}
function jutsu(id){const J=JL[id],[h,k]=J.src.split('.'),b=SRC[h].abil[+k];return Object.assign({},b,{n:J.n,d:J.d,ex:b.ex?{n:J.xn||J.n,d:J.xd||b.ex.d,p:b.ex.p}:null,src:h,vfx:J.vfx,rank:J.r,jid:id})}
// stats : moyenne des persos d'origine des jutsu (l'attaque de base compte double), puis la voie
function mkNinja(b,strict){b=sanitizeBuild(b,strict);const abil=b.j.map(id=>jutsu(id)),w=[2,1,1,1,1,1];let hp=0,pw=0,sp=0,W=0;
 abil.forEach((a,s)=>{const o=SRC[a.src];hp+=o.hp*w[s];pw+=o.pw*w[s];sp+=o.spd*w[s];W+=w[s]});const v=VOIES[b.voie];
 const lign=b.clan>=0?'Clan '+CLANS[b.clan][0]:'Sans clan · '+NATURES[b.nat2][0];
 return{name:b.name,side:b.side,desc:`${v[0]} · ${NATURES[b.nat][0]} · ${lign}`,hp:Math.round(hp/W*v[1]),spd:Math.round(sp/W+v[2]),pw:Math.round(pw/W*v[3]*100)/100,pref:200,pass:PASSK[b.pass],look:ninjaLook(b.l,b.clan),abil,build:b}}
// générateur pseudo-aléatoire déterministe (mêmes ninjas adverses chez tous les joueurs en ligne)
const srnd=seed=>()=>(seed=seed*16807%2147483647)/2147483647;
function randomKit(r,b){const k=a=>Math.floor(r()*a.length);b.nat=k(NATURES);b.clan=r()<.75?k(CLANS):-1;b.nat2=k(NATURES);b.voie=k(VOIES);b.pass=k(PASSK);
 b=sanitizeBuild(b);b.j=[0,1,2,3,4,5].map(s=>{const A=avail(b,s);const own=A.filter(j=>j.cat!=='u');const L=own.length&&r()<.6?own:A;return L[Math.floor(r()*L.length)].id});return sanitizeBuild(b,true)}
function randomBuild(r,side,name){const k=a=>Math.floor(r()*a.length);
 return randomKit(r,{name,side,l:{v:side&&r()<.6?6:k(VILLAGES.slice(0,6)),t:side?(r()<.55?2:k(TENUES)):[0,1,3,4,5,6,7][k([0,1,3,4,5,6,7])],c:k(COIFS),h:k(HAIRC),p:k(PEAUX),k:k(CHAKRAS),a:r()<.6?0:k(ACCS)}})}
const BOTN=[['Hayate','Kaito','Ren','Sora','Yuki','Haruto','Aiko','Daichi','Emi','Hikaru','Kenji','Mitsuki','Natsu','Riku','Saki','Takumi','Yori','Asuka','Jiro','Kaede'],
 ['Kurogane','Akuma','Raijin','Mizore','Shiden','Gekkô','Hebi','Kagerô','Oboro','Tetsu','Jaku','Kirisame','Yami','Rasetsu','Kuroi','Hyôga','Doku','Zangetsu','Mukuro','Shura']];
// ---------- Auras de jutsu (Kyûbi, Huit Portes, Susanô, peau de pierre…) ----------
const AURK=['rage','unstop','giant','haste','deflect','drT','absorb','regenB','lsB','chrome','dodge','counter','riot','shieldT'];
const auraOn=u=>AURK.some(k=>(u[k]||0)>0);
function drawAura(u,p,S,sk,front){const v=u.auraV,t=performance.now()/1000,cx=p.x,cy=p.y-38*S*sk,ch=u.ch.look.weapon.col;
 if(front){if(v==='lightning'){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#fff6a0';g.lineWidth=1.5;for(let i=0;i<3;i++){const a=rnd()*7,r=(18+rnd()*14)*S;g.beginPath();g.moveTo(cx+Math.cos(a)*r*.4,cy+Math.sin(a)*r*.6);g.lineTo(cx+Math.cos(a+.3)*r,cy+Math.sin(a+.3)*r*1.3);g.lineTo(cx+Math.cos(a+.1)*r*1.3,cy+Math.sin(a+.1)*r*1.6);g.stroke()}g.restore()}
  else if(v==='earth'){g.fillStyle='rgba(120,110,100,.35)';g.beginPath();g.ellipse(cx,cy+4*S,15*S*sk,30*S*sk,0,0,7);g.fill();g.strokeStyle='rgba(60,50,40,.6)';g.lineWidth=1;g.beginPath();g.moveTo(cx-6*S,cy-14*S);g.lineTo(cx-1*S,cy-4*S);g.lineTo(cx-5*S,cy+6*S);g.moveTo(cx+5*S,cy-8*S);g.lineTo(cx+2*S,cy+4*S);g.stroke()}
  else if(v==='sand'){for(let i=0;i<14;i++){const a=t*3+i*.45,q={x:cx+Math.cos(a)*24*S,y:cy+18*S+Math.sin(a)*8*S-(i%3)*10*S};if(Math.sin(a)>0)circ(q.x,q.y,2*S,i%2?'#d8b878':'#a88a50')}}
  else if(v==='bugs'){g.fillStyle='#26302a';for(let i=0;i<16;i++){const a=t*4+i*.9,r=(20+(i%4)*6)*S;if(Math.sin(a)>0)g.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a*1.3)*r*.8,2*S,2*S)}}
  return}
 g.save();
 switch(v){
  case'fox':{g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const tl=Math.sin(t*3+i*2)*.35;g.strokeStyle=rgba(i%2?'#ff6a2a':'#ff2a1a',.55);g.lineWidth=7*S;g.lineCap='round';g.beginPath();g.moveTo(cx,cy+18*S);g.quadraticCurveTo(cx-(20+i*8)*S,cy+(4+i*6)*S,cx-(28+i*10)*S*Math.cos(tl),cy-(18+i*10)*S);g.stroke()}
   for(let i=0;i<7;i++){const a=i/7*Math.PI*2+t*2,r=(20+Math.sin(t*9+i*3)*4)*S;circ(cx+Math.cos(a)*r*.7,cy+Math.sin(a)*r*1.3,8*S,rgba(i%2?'#ff6a2a':'#ff3a1a',.28))}break}
  case'gate':{g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(cx,cy,0,cx,cy,40*S);gr.addColorStop(0,rgba('#6aff7a',.35));gr.addColorStop(1,rgba('#2aaa4a',0));g.fillStyle=gr;g.beginPath();g.ellipse(cx,cy,30*S,46*S,0,0,7);g.fill();
   for(let i=0;i<5;i++){const k=((t*.9+i/5)%1);circ(cx+Math.sin(i*2.3+t)*12*S,cy-k*50*S,(4+k*8)*S,rgba('#d8ffd8',.25*(1-k)))}break}
  case'chakra':{g.globalCompositeOperation='lighter';const c=ch||'#a5f',s=S*1.9,x=cx,y=p.y-10*S;g.strokeStyle=rgba(c,.75);g.fillStyle=rgba(c,.14);g.lineWidth=3;
   g.beginPath();g.ellipse(x,y-58*s*.55,15*s,16*s,0,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(x-26*s,y-44*s*.55);g.quadraticCurveTo(x,y-34*s*.55,x+26*s,y-44*s*.55);g.lineTo(x+20*s,y);g.lineTo(x-20*s,y);g.closePath();g.fill();g.stroke();
   for(let i=0;i<4;i++){g.beginPath();g.moveTo(x-18*s,y-(38-i*8)*s*.55);g.quadraticCurveTo(x,y-(30-i*8)*s*.55,x+18*s,y-(38-i*8)*s*.55);g.stroke()}circ(x-5*s,y-60*s*.55,2.5*s,rgba('#fff',.8));circ(x+5*s,y-60*s*.55,2.5*s,rgba('#fff',.8));break}
  case'jyuken':{g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#cfe0ff',.7);g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(cx,p.y-6*S,(34-i*5)*S,(30-i*4)*S*K,0,t*6+i,t*6+i+4.2);g.stroke();g.beginPath();g.ellipse(cx,cy,(30-i*4)*S,(42-i*5)*S,0,t*-5+i,t*-5+i+3.5);g.stroke()}break}
  case'water':{g.fillStyle='rgba(58,168,255,.18)';g.strokeStyle='rgba(191,230,255,.6)';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,26*S,44*S,0,0,7);g.fill();g.stroke();break}
  case'wind':{g.strokeStyle='rgba(200,255,240,.6)';g.lineWidth=1.5;for(let i=0;i<4;i++){const a=t*7+i*1.6;g.beginPath();g.ellipse(cx,cy+(i-1.5)*12*S,24*S,7*S,0,a,a+2.4);g.stroke()}break}
  case'genjutsu':{g.globalAlpha=.25;for(let i=1;i<=2;i++){const q=Math.sin(t*8+i)*10*S;circ(cx+q,cy,12*S,'#8a3ab0')}g.globalAlpha=1;break}
  case'heal':case'leaf':{g.globalCompositeOperation='lighter';circ(cx,cy,34*S,rgba('#7fe07f',.12));break}
  case'lightning':{g.globalCompositeOperation='lighter';circ(cx,cy,30*S,rgba('#ffe14a',.13));break}
  default:{if(v){g.globalCompositeOperation='lighter';circ(cx,cy,32*S,rgba(ch||'#3af',.14))}}}
 g.restore()}
// ---------- Ultime : bandeau d'annonce façon jeux de combat ----------
let cutin=null;
function drawCutin(){if(!cutin)return;cutin.t-=1/60;if(cutin.t<=0){cutin=null;return}const k=cutin.t,in_=Math.min(1,(1.4-k)*6),out=Math.min(1,k*4),a=Math.min(in_,out),y=H*.38;
 g.save();g.globalAlpha=a;g.translate((1-in_)*-300,0);g.fillStyle='rgba(10,6,4,.78)';g.beginPath();g.moveTo(0,y-40);g.lineTo(W,y-62);g.lineTo(W,y+22);g.lineTo(0,y+44);g.fill();
 g.fillStyle=cutin.col;g.fillRect(0,y+38,W,3);g.save();g.translate(W*.5,y);g.rotate(-.018);g.shadowColor=cutin.col;g.shadowBlur=24;text(cutin.s,0,6,46,'#fff4d8');g.restore();text(cutin.who,W*.5,y+30,15,cutin.col,'center');g.restore()}
// ---------- Modèles de kits inspirés des ninjas célèbres ----------
// [libellé, nature, clan (-1 sans), 2e nature, voie, passif, 6 noms de jutsu, apparence]
const PRESETS=[
 ['Jinchûriki (style Naruto)',2,6,0,0,'regen',['Taijutsu','Rasengan','Roulade','Multiclonage','Première Porte','Chakra de Kyûbi'],{v:0,t:0,c:0,h:0,p:0,k:4,a:2}],
 ['Vengeur (style Sasuke)',3,0,0,1,'crit',['Kunai','Chidori','Saut ninja','Sharingan : Genjutsu','Sharingan','Susanô : Totsuka'],{v:0,t:5,c:0,h:1,p:0,k:3,a:0}],
 ['Prodige Uchiha (style Itachi)',0,0,0,2,'energy',['Shuriken','Katon : Boule de feu','Shunshin','Sharingan : Genjutsu','Sharingan','Amaterasu'],{v:6,t:2,c:1,h:1,p:4,k:1,a:0}],
 ['Démon du sable (style Gaara)',2,8,0,2,'armor',['Shuriken','Cercueil de sable','Shunshin','Sable mouvant','Armure de sable','Tsunami de sable'],{v:1,t:6,c:3,h:7,p:4,k:4,a:0}],
 ['Génie Hyûga (style Neji)',2,1,0,0,'slow',['Poing souple','Hakke : Paume','Roulade','Byakugan','Kaiten','Hakke : 64 points'],{v:0,t:4,c:1,h:5,p:0,k:5,a:0}],
 ['Stratège (style Shikamaru)',0,2,0,1,'energy',['Kunai','Kage Mane','Shunshin','Kage Kubi Shibari','Pilule du soldat','Ombres liées'],{v:0,t:1,c:2,h:1,p:1,k:2,a:0}],
 ['Ninja copieur (style Kakashi)',3,-1,4,1,'crit',['Kunai','Chidori','Doton : Taupe','Multiclonage','Pilule du soldat','Raiton : Kirin'],{v:0,t:1,c:0,h:4,p:0,k:5,a:1}],
 ['Fauve de jade (style Rock Lee)',2,-1,4,0,'third',['Taijutsu','Coup de pied tornade','Bonds acrobatiques','Piège ninja','Première Porte','Huit Portes'],{v:0,t:7,c:3,h:1,p:0,k:2,a:0}],
 ['Maître-chien (style Kiba)',4,5,0,0,'speed',['Taijutsu','Gatsûga','Instinct bestial','Ninken','Pilule du soldat','Garôga'],{v:0,t:1,c:0,h:5,p:1,k:4,a:3}],
 ['Maître des insectes (style Shino)',4,4,0,1,'lifesteal',['Kunai','Fûma Shuriken','Shunshin','Essaim d\'insectes','Insectes dévoreurs','Nuée destructrice'],{v:0,t:1,c:3,h:5,p:1,k:2,a:4}],
 ['Kunoichi médicale (style Sakura)',4,-1,1,0,'regen',['Poing du lotus','Lotus primaire','Saut ninja','Doton : Mur de terre','Shôsen','Doton : Montagne écrasante'],{v:0,t:0,c:1,h:2,p:0,k:2,a:0}],
 ['Gourmet géant (style Chôji)',4,3,0,0,'armor',['Poing décuplé','Lotus primaire','Boulet humain','Bombe fumigène','Pilule du soldat','Décuplement'],{v:0,t:1,c:0,h:5,p:1,k:3,a:3}],
 ['Esprit fleuri (style Ino)',2,7,0,2,'energy',['Kunai','Fûma Shuriken','Shunshin','Shintenshin','Champ de fleurs','Esprit destructeur'],{v:0,t:1,c:2,h:0,p:0,k:3,a:0}],
 ['Os vivants (style Kimimaro)',4,9,0,0,'third',['Danse du saule','Doigts-balles','Roulade','Piège ninja','Première Porte','Forêt d\'os'],{v:5,t:4,c:1,h:4,p:4,k:5,a:0}],
 ['Sage des crapauds (style Jiraiya)',0,-1,4,1,'rage',['Taijutsu','Rasengan','Saut ninja','Katon : Souffle ardent','Pilule du soldat','Invocation : Crapaud'],{v:0,t:6,c:1,h:4,p:1,k:0,a:3}],
 ['Artiste explosif (style Deidara)',4,-1,0,2,'crit',['Shuriken','Doton : Rocher','Saut ninja','Kunai explosifs','Doton : Corps de roche','Pluie de parchemins'],{v:6,t:2,c:1,h:0,p:0,k:4,a:0}],
];
const PASSI=k=>Math.max(0,PASSK.indexOf(k));
function presetBuild(i,name,side){const [lab,nat,clan,nat2,voie,pass,names,l]=PRESETS[i];
 const b={name:name||MY.name,side:side??MY.side,voie,nat,clan,nat2,pass:PASSI(pass),l:Object.assign({},l),j:names.map((n,s)=>{const J=JL.find(j=>j.n===n&&j.slot===s);return J?J.id:-1})};
 return sanitizeBuild(b,true)}
// ---------- Cartes de l'arène ----------
const MAPS=[['Terrain d\'entraînement'],['Vallée de la Fin'],['Désert de Suna']];
const THEME=()=>[{sky:['#2a2650','#a8506a','#f3a65a'],floor:['#3e5a2c','#4f6e34'],line:'rgba(30,50,20,.18)',wall:['#6a4426','#4a2e18'],post:['#4a2e18','#9a6a3a','#3a2210','#b88a52']},
 {sky:['#1a2a4a','#4a6a8a','#a8c0d0'],floor:['#3a6a8a','#4a7a9a'],line:'rgba(200,230,255,.12)',wall:['#5a5a62','#3a3a42'],post:['#4a4a52','#8a8a92','#2a2a32','#9a9aa4']},
 {sky:['#5a2a1a','#c87a3a','#f3c87a'],floor:['#c8a060','#d8b070'],line:'rgba(120,80,30,.15)',wall:['#a07040','#7a5028'],post:['#7a5028','#c89a60','#5a3a1a','#d8b078']}][CFG.map|0]||null;
// ---------- Décor des jutsu marquants pendant leur délai ----------
function drawZoneDeco(z){const k=1-z.t/z.m,p=P(z.x,z.y),s=p.s,t=performance.now()/1000;
 switch(z.jn){
  case'Kawarimi':{g.save();g.translate(p.x,p.y-8*s);g.rotate(.3);g.fillStyle='#8a5a30';g.fillRect(-20*s,-7*s,40*s,14*s);g.fillStyle='#b88a52';g.beginPath();g.ellipse(20*s,0,4*s,7*s,0,0,7);g.fill();g.restore();break}
  case'Invocation : Crapaud':{const h=(1-k)*420*s,sz=(40+k*60)*s;g.fillStyle=`rgba(0,0,0,${.15+k*.35})`;gEll(z.x,z.y,z.r*k);g.fill();g.save();g.translate(p.x,p.y-h-sz*.6);
   g.fillStyle='#c0582a';g.beginPath();g.ellipse(0,0,sz,sz*.7,0,0,7);g.fill();g.fillStyle='#e8c060';circ(-sz*.5,-sz*.55,sz*.22,'#e8c060');circ(sz*.5,-sz*.55,sz*.22,'#e8c060');circ(-sz*.5,-sz*.55,sz*.1,'#111');circ(sz*.5,-sz*.55,sz*.1,'#111');
   g.strokeStyle='#5a2a14';g.lineWidth=3*s;g.beginPath();g.arc(0,sz*.05,sz*.55,.3,Math.PI-.3);g.stroke();g.restore();break}
  case'Fûton : Rasen-shuriken':{const h=(1-k)*240*s;g.save();g.translate(p.x,p.y-h-30*s);g.globalCompositeOperation='lighter';g.rotate(t*14);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle='rgba(200,255,240,.55)';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(30*s,-10*s,60*s,0);g.quadraticCurveTo(30*s,6*s,0,0);g.fill()}circ(0,0,16*s,'rgba(140,200,255,.9)');circ(0,0,8*s,'#fff');g.restore();break}
  case'Pluie de parchemins':{const h=(1-k)*300*s;g.save();g.translate(p.x,p.y-h);g.rotate(t*3);g.fillStyle='#f0e0b0';g.fillRect(-8*s,-4*s,16*s,8*s);g.fillStyle='#c0302a';g.fillRect(-2*s,-3*s,4*s,6*s);g.restore();break}
  case'Raiton : Orage':{g.fillStyle='rgba(40,40,60,.55)';for(let i=0;i<4;i++){const q=P(z.x+(i-1.5)*z.r*.45,z.y,200);g.beginPath();g.ellipse(q.x,q.y,z.r*.4*s,z.r*.18*s,0,0,7);g.fill()}break}}}
// ---------- Sons par élément ----------
const VSND={fire:{'*':'fire',dash:'dash',deflect:'deflect'},water:{'*':'water',dash:'dash'},wind:{'*':'wind'},lightning:{'*':'chidori'},earth:{'*':'rock',dash:'rock'},sand:{'*':'sand'},
 smoke:{'*':'poof',blaster:'blaster'},leaf:{dash:'poof',zap:'poof'},bugs:{'*':'bugs'},bone:{'*':'bone',saber:'saber'},tag:{boom:'boom','*':'blaster'},fox:{'*':'fire',heavy:'roar'},gate:{heavy:'roar'},genjutsu:{'*':'genjutsu'},black:{'*':'fire'},jyuken:{'*':'jyuken'},shadow:{'*':'shadow'},chakra:{zap:'jyuken',heavy:'roar'}};
const VSKIP={hit:1,win:1,lose:1,ex:1,orb:1,ignite:1};

// ninjas adverses : moitié inspirés des modèles, moitié au hasard ; le nom de clan suit le prénom
const CH={};{const r=srnd(4242);for(let s=0;s<2;s++)BOTN[s].forEach((n,i)=>{const b=r()<.5?presetBuild(Math.floor(r()*PRESETS.length),n,s):randomBuild(r,s,n);if(b.clan>=0)b.name=n+' '+CLANS[b.clan][0];if(s&&r()<.6){b.l.t=2;b.l.v=6}CH['b'+(s*20+i)]=mkNinja(b,true)})}
const HEROES=Object.keys(CH);
// ton ninja (gardé dans le navigateur)
let MY;try{MY=sanitizeBuild(JSON.parse(localStorage.getItem('nrBuild2')||'null')||presetBuild(0,'Ninja',0))}catch(e){MY=randomBuild(srnd(99),0,'Ninja')}
CH.p0=mkNinja(MY);
