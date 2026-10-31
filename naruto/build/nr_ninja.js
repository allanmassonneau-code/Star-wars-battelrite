// ===================== NINJAS : chacun crée son ninja et compose son kit =====================
// Kit = style de combat (attaque de base, selon le clan) + jutsu de clan (ou Subjutsu si sans clan) + jutsu d'une nature.
// Les jutsu réutilisent les mécaniques éprouvées du moteur (SRC) avec leurs propres effets visuels (vfx).
// Rangs D C B A S = coût en points ; le kit (5 jutsu) a un budget maximum. Pas de versions EX dans ce jeu.
const RANKS={D:1,C:2,B:3,A:4,S:5},RANKC={D:'#9aa3ad',C:'#6fcf6f',B:'#5ab4ff',A:'#c07aff',S:'#ffc53a'},BUDGET=17;
const NATURES=[['Katon','Feu','#ff7a2a'],['Suiton','Eau','#3aa8ff'],['Fûton','Vent','#9fe8c8'],['Raiton','Foudre','#ffe14a'],['Doton','Terre','#b08850']];
const CLANS=[['Uchiha','#c0202a'],['Hyûga','#d8d0f0'],['Nara','#5a6a3a'],['Akimichi','#d87a3a'],['Aburame','#4a6a5a'],['Inuzuka','#a04a2a'],['Uzumaki','#e0503a'],['Yamanaka','#c8a0e0'],['Sabaku','#c8a060'],['Kaguya','#e8e8e0'],['Taijutsuka','#4aa83a'],
 // clans ajoutés (c11-c20) : 3e champ = sigle de l'icône (le 1er lettre ne suffit plus à les distinguer)
 ['Hoki','#8ab83a','Hk'],['Roran','#e0b84a','Ro'],['Hakumei','#6a4a8a','Hm'],['Shirogane','#a8b4c8','Sg'],['Chinoike','#9a1424','Ci'],
 ['Kami','#7a9ae0','Km'],['Fûma','#5a5a6e','Fm'],['Hoshigaki','#4a7a9a','Hs'],['Hôzuki','#4ac8d8','Hz'],['Yuki','#bfe6ff','Yu']];
const clanTag=c=>CLANS[c]?CLANS[c][2]||CLANS[c][0][0]:'?'; // sigle d'un clan (icônes)
const TAIJ=10; // le clan Taijutsuka n'a pas de nature : uniquement du taijutsu
// styles de combat (attaque de base) : [nom, description, source, vfx, arme, clans autorisés (-1 = sans clan), modif. PV, modif. puissance]
// styles de combat : voir kits/styles.js
// un clan qui n'a (encore) aucun style propre peut prendre les styles « sans clan » (Taijutsu, Kunai au poing, Kenjutsu, Kubikiribôchô)
const styleOk=(s,clan)=>STYLES[s][5].includes(clan)||(clan>=0&&STYLES[s][5].includes(-1)&&!STYLES.some(x=>x[5].includes(clan)));
// style signature du clan (réservé au clan, pas aux sans-clan) : -1 s'il n'y en a pas ; c'est le style par défaut quand on choisit le clan
const clanStyle=c=>c<0?-1:STYLES.findIndex(x=>x[5].includes(c)&&!x[5].includes(-1));
// [catégorie, emplacement 1-5, rang, source perso.sort, nom, description, effet visuel]
// catégorie : 'u' Subjutsu (sans clan), 'n0'..'n4' nature, 'c0'..'c20' clan (CLANS.length)
/*NR_NATURE*/
const JD=KITROWS; // le catalogue est assemblé par les fichiers kits/*.js (un par catégorie)
// réglages propres à certains jutsu (réglés par duels simulés)
const JPAR={'Multiclonage':{d:1.2},'Ninken':{d:3},'Insectes dévoreurs':{dps:4}};
const JCD={'Lotus primaire':10,'Lotus caché':9}; // temps de recharge propres à certains jutsu
// équilibrage par clan (-1 = sans clan) et par nature : [multiplicateur PV, multiplicateur puissance], réglés par duels simulés
// réglés à nouveau pour l'ambiance NRP (PV ×1,2 puis ×1,1, chakra rare) : duels simulés de chaque clan / nature contre des kits aléatoires, 45-55 % visés
// puis pour les 21 clans (Hoki … Yuki, refonte Uzumaki) : duels 1v1 sans soin, 46-56 % pour chaque clan / nature ; les clans aux combats trop courts
// (Nara, Uzumaki, Hoki, Shirogane, Chinoike, Hôzuki, Katon) ont plus de PV et moins de puissance : duel médian ≈ 50 s
// passe d'équilibrage après le passage des M1 au corps à corps (un style propre à chaque clan) : simulateur du jeu (nr_bal.js), duels 1v1 AVEC soin (H),
// kits aléatoires de chaque clan / nature / style contre un ninja aléatoire, 45-55 % visés pour chacun et 40-60 % pour chaque jutsu (JBAL) ; duel médian ≈ 52 s
// puis, quand les bots ont enfin frappé au corps à corps (aiIn) : PV ×1,3 (HPK) et attaques de base ×0,4 (M1K), Shirogane refait (M1 au contact,
// SG.BAL 1,15 / SG.TAKE 1), clans recalés sur bal21 (1v1 sans soin, 150 à 400 duels par catégorie) : 44-55 % pour chaque clan / nature, duel médian ≈ 50 s
const CLANBAL={"0":[0.842,0.781],"1":[0.636,0.687],"2":[1.123,1.139],"3":[0.962,0.903],"4":[0.992,0.888],"5":[1.209,1.204],"6":[1.02,0.903],"7":[1.096,1.018],"8":[0.964,0.994],"9":[0.975,0.831],"10":[0.838,0.681],"11":[0.996,0.962],"12":[1.053,0.968],"13":[1.162,1.192],"14":[0.867,1.184],"15":[1.275,0.83],"16":[1.046,1.115],"17":[1.078,0.999],"18":[1.001,0.961],"19":[1.029,0.994],"20":[1.01,1.052],"-1":[0.974,0.955]},NATBAL={"0":[1.13,0.865],"1":[1.01,1.003],"2":[0.928,0.971],"3":[1.02,0.954],"4":[0.946,1.04]},STYLEBAL={"0":[1.003,1.017],"1":[0.945,1.054],"2":[0.876,0.859],"2:-1":[0.79,0.721],"3":[0.89,0.955],"7":[1.052,1.004],"8":[1.033,0.875],"10":[1.007,1.122],"12":[0.9,0.999],"15":[1.148,1.207],"18":[0.913,0.819],"19":[1.042,0.887],"23":[1.029,1.07],"24":[0.931,0.928],"25":[1.15,1.015],"26":[0.978,1.01]}; // STYLEBAL[indice du style] ou STYLEBAL['indice:clan'] = [PV, puissance], réglés par duels simulés (Kenjutsu sans clan à part)
// équilibrage par jutsu (« catégorie|nom ») : d = dégâts ×, cd = recharge (s), ck = coût en chakra ; appliqué par nr_bal.js (les « N dégâts » des descriptions suivent d)
const JBAL={
 "c0|Amaterasu":{"d":0.4,"ck":51},
 "c0|Izanagi":{"cd":16.5},
 "c0|Kamui":{"cd":15.0},
 "c0|Katon : Gôkakyû":{"d":0.49},
 "c0|Katon : Ryûka":{"d":0.445},
 "c0|Lame de Kusanagi":{"cd":7.0},
 "c0|Sharingan":{"cd":13.5},
 "c0|Sharingan : Genjutsu":{"cd":16.0},
 "c0|Shunshin Uchiha":{"cd":8.5},
 "c0|Susanô : Totsuka":{"d":1.549},
 "c0|Tsukuyomi":{"ck":75},
 "c10|Bond du fauve":{"d":1.186},
 "c10|Corps de jade":{"cd":7.0},
 "c10|Dynamic Entry":{"d":1.311},
 "c10|Défi éternel":{"cd":6.0},
 "c10|Esquive du fauve":{"cd":11.5},
 "c10|Huit Portes":{"ck":52},
 "c10|Konoha Daisenpû":{"d":1.238},
 "c10|Konoha Gôriki Senpû":{"cd":8.0},
 "c10|Konoha Senpû":{"cd":4.5},
 "c10|Lotus caché":{"d":1.617},
 "c10|Lotus primaire":{"d":1.155},
 "c10|Nuit de la mort":{"d":1.073},
 "c10|Paon du matin":{"d":1.295},
 "c10|Poids retirés":{"cd":11.0},
 "c10|Porte de la Vie":{"cd":19.0},
 "c10|Première Porte":{"cd":17.0},
 "c10|Tigre de midi":{"d":0.867},
 "c10|Vitesse du fauve":{"cd":5.0},
 "c10|Éléphant du soir":{"d":1.764},
 "c11|Arbre millénaire":{"d":0.4},
 "c11|Cocon de sève":{"cd":27.0},
 "c11|Fleur carnivore":{"d":0.745},
 "c11|Floraison mortelle":{"d":0.993},
 "c11|Fusion végétale":{"cd":17.5},
 "c11|Graine épineuse":{"d":0.55},
 "c11|Liane étrangleuse":{"d":0.493},
 "c11|Liane-grappin":{"cd":6.0},
 "c11|Mur de ronces":{"d":0.89},
 "c12|Barrière de l'éventail":{"cd":14.5},
 "c12|Contre-vent":{"cd":19.0},
 "c12|Grande Kamaitachi":{"d":0.875},
 "c12|Invocation : Kamatari":{"d":0.696},
 "c12|Kamaitachi":{"d":0.622},
 "c12|Rafale de l'éventail":{"cd":13.0},
 "c12|Tempête de l'éventail":{"d":0.416},
 "c12|Tempête tranchante":{"d":0.683},
 "c12|Vent ascendant":{"d":0.856},
 "c12|Vol sur l'éventail":{"d":1.425,"cd":10.0},
 "c13|Arc d'or : Kumo Senkyû":{"ck":40},
 "c13|Armure d'or":{"cd":8.5},
 "c13|Fil d'araignée":{"d":0.831},
 "c13|Filet d'araignée":{"d":0.643},
 "c13|Filin d'araignée":{"cd":5.0},
 "c13|Invocation : Araignée géante":{"d":0.4},
 "c13|Mue de l'araignée":{"cd":24.0},
 "c13|Nuée d'araignées":{"d":0.62},
 "c13|Toile collante":{"d":0.736},
 "c13|Étreinte de soie":{"d":0.96},
 "c14|Armée de marionnettes":{"d":1.766},
 "c14|Brume toxique":{"cd":17.5},
 "c14|Fils de chakra":{"cd":10.5},
 "c14|Kawarimi de marionnette":{"cd":10.5},
 "c14|Kuroari":{"d":0.626},
 "c14|Lames cachées":{"cd":9.5},
 "c14|Sanshôuo":{"cd":19.0},
 "c14|Senbon empoisonnés":{"d":0.753},
 "c15|Aiguilles de sang":{"d":0.4,"cd":8.5},
 "c15|Forêt de pieux de sang":{"d":0.848},
 "c15|Fouet de sang":{"cd":11.0},
 "c15|Ketsuryûgan : Lune de sang":{"d":1.016},
 "c15|Ketsuryûgan : Mirage":{"cd":17.5},
 "c15|Ketsuryûgan : Paralysie":{"cd":11.5},
 "c15|Ketsuryûgan : Sang bouillant":{"d":0.783},
 "c15|Lance de sang cristallisé":{"d":0.985},
 "c15|Marée de sang":{"d":1.652},
 "c15|Pas sanglant":{"d":0.722},
 "c16|Ailes de papier":{"d":1.581,"cd":9.0},
 "c16|Ange de papier":{"ck":63},
 "c16|Chakram de papier":{"d":0.941},
 "c16|Clone de papier":{"d":0.517},
 "c16|Cocon de papier":{"d":0.639},
 "c16|Corps de papier":{"cd":20.5},
 "c16|Lance de papier":{"d":0.622},
 "c16|Mer de papiers explosifs":{"d":0.65},
 "c16|Papillons shikigami":{"d":0.654},
 "c16|Rempart d'origami":{"cd":10.0},
 "c16|Shuriken de papier":{"d":0.4,"cd":6.0},
 "c17|Assassinat de l'ombre":{"d":0.4,"cd":13.0},
 "c17|Danse des mille ombres":{"d":0.558,"ck":66},
 "c17|Kage shuriken":{"d":0.609},
 "c17|Makibishi":{"d":1.352},
 "c17|Pluie de shuriken":{"d":0.838},
 "c17|Repli du Fûma":{"cd":11.0},
 "c17|Shunshin de l'ombre":{"cd":8.0},
 "c17|Shuriken du croissant":{"d":0.757},
 "c17|Shuriken tournoyants":{"d":0.765},
 "c17|Shuriken traceur":{"d":0.613},
 "c17|Shuriken à fil":{"d":1.009},
 "c18|Fusion avec Samehada":{"cd":20.0},
 "c18|Nage du requin":{"d":0.4,"cd":16.0},
 "c18|Samehada : Morsure":{"cd":9.0},
 "c18|Samehada déchaînée":{"d":0.667},
 "c18|Suiton : Bakusui":{"cd":8.0},
 "c18|Suiton : Daikôdan":{"d":0.485},
 "c18|Suiton : Mer des requins":{"d":0.591},
 "c18|Suiton : Prison aqueuse":{"d":0.604},
 "c18|Suiton : Requins voraces":{"d":0.518},
 "c18|Écailles de Samehada":{"cd":14.5},
 "c19|Kubikiribôchô : Bond fendant":{"d":0.921},
 "c19|Kubikiribôchô : Décapitation":{"d":0.522},
 "c19|Kubikiribôchô : Fauche":{"cd":19.0},
 "c19|Mizudeppô : Grand jet":{"d":0.484},
 "c19|Suika : Contre-courant":{"cd":11.5},
 "c19|Suika : Corps-déluge":{"d":0.581},
 "c19|Suika : Gôwan":{"d":0.626},
 "c19|Suirendan":{"d":0.525},
 "c1|Byakugan":{"cd":14.5},
 "c1|Hakke : 128 points":{"d":0.4,"ck":52},
 "c1|Hakke : 64 points":{"d":1.913},
 "c1|Hakke : Paume":{"cd":13.0},
 "c1|Hakke Kûhekishô":{"d":0.4,"cd":13.5},
 "c1|Hakke Kûshô":{"d":0.448},
 "c1|Jûho Sôshiken":{"d":0.601},
 "c1|Kaiten":{"cd":6.0},
 "c1|Pas du Hakke":{"cd":6.0},
 "c20|Glissade de glace":{"d":1.317},
 "c20|Hyôton : Blizzard":{"d":1.139},
 "c20|Hyôton : Dragon de glace":{"d":0.67},
 "c20|Hyôton : Lance de glace":{"d":0.688},
 "c20|Hyôton : Pics de glace":{"d":0.519},
 "c20|Hyôton : Sensatsu Suishô":{"d":0.585},
 "c20|Hyôton : Tsubame Fubuki":{"d":0.533},
 "c20|Makyô Hyôshô":{"d":0.516},
 "c20|Miroir de glace":{"d":1.733},
 "c20|Pas du miroir":{"cd":17.5},
 "c2|Course de l'ombre":{"cd":5.0},
 "c2|Kage Kubi Shibari":{"d":0.691},
 "c2|Kage Mane":{"d":0.94},
 "c2|Kage Nui":{"d":0.829},
 "c2|Ombre explosive":{"d":0.766},
 "c2|Ombre protectrice":{"cd":7.0},
 "c2|Ombres liées":{"d":2.169,"ck":47},
 "c2|Plan du stratège":{"cd":6.0},
 "c3|Boulet humain":{"d":1.154},
 "c3|Boulet à pointes":{"d":1.11},
 "c3|Chôdan Bakugeki":{"d":0.701},
 "c3|Décuplement partiel":{"cd":18.0},
 "c3|Mode Papillon":{"ck":56},
 "c3|Paume géante":{"d":0.811},
 "c3|Pilule rouge":{"cd":19.0},
 "c3|Pilule verte":{"cd":7.0},
 "c4|Clone d'insectes":{"cd":9.0},
 "c4|Essaim d'insectes":{"d":0.439,"cd":13.0},
 "c4|Insectes chercheurs":{"d":1.282},
 "c4|Insectes dévoreurs":{"d":0.765},
 "c4|Insectes espions":{"d":2.192},
 "c4|Mur d'insectes":{"d":1.252},
 "c4|Nuée destructrice":{"d":0.803},
 "c4|Sphère d'insectes":{"d":0.764},
 "c5|Flair du chien":{"cd":13.0},
 "c5|Garôga":{"d":0.775},
 "c5|Gatsûga":{"d":0.685},
 "c5|Instinct bestial":{"cd":4.0},
 "c5|Loup bicéphale":{"ck":35},
 "c5|Marquage":{"d":1.51},
 "c5|Ninken":{"d":0.599},
 "c5|Shikyaku":{"cd":9.0},
 "c5|Tsûga":{"d":1.396},
 "c6|Bond des chaînes":{"d":0.753},
 "c6|Cage adamantine":{"d":0.581},
 "c6|Chaîne-harpon":{"d":0.929},
 "c6|Entrave du démon":{"d":0.718},
 "c6|Kunai à sceau":{"d":0.488},
 "c6|Parchemin de stockage":{"d":0.798},
 "c6|Sceau d'échange":{"cd":6.0},
 "c6|Sceau des cinq éléments":{"d":0.517},
 "c6|Sceaux : Détonation":{"cd":14.0},
 "c6|Shiki Fûjin":{"d":1.446},
 "c7|Champ de fleurs":{"cd":12.0},
 "c7|Esprit destructeur":{"d":0.715},
 "c7|Kunai fleuri":{"d":0.623},
 "c7|Pollen hypnotique":{"cd":6.0},
 "c7|Shinden : Lien des esprits":{"ck":30},
 "c7|Shinranshin":{"d":0.657},
 "c7|Shintenshin":{"d":0.537},
 "c7|Tempête de pétales":{"d":0.51},
 "c7|Transposition":{"cd":5.5},
 "c8|Armure de sable":{"cd":15.5},
 "c8|Bouclier absolu":{"d":1.229},
 "c8|Cercueil de sable":{"d":1.724},
 "c8|Funérailles du désert":{"d":0.797},
 "c8|Lances de sable":{"d":0.549},
 "c8|Sable mouvant":{"d":0.648},
 "c8|Sable volant":{"cd":9.0},
 "c8|Tsunami de sable":{"d":1.124},
 "c9|Armure d'os":{"d":0.982},
 "c9|Bond d'os":{"d":0.899},
 "c9|Danse de la clématite":{"d":0.414},
 "c9|Danse de la clématite : Liane":{"d":1.427},
 "c9|Danse du camélia":{"d":1.007},
 "c9|Danse du mélèze":{"cd":17.5},
 "c9|Danse du saule":{"d":1.769,"cd":7.5},
 "c9|Doigts-balles":{"d":0.567},
 "c9|Forêt d'os":{"d":1.02},
 "c9|Forêt naissante":{"d":0.492},
 "n0|Katon : Boule de feu suprême":{"cd":5.5},
 "n0|Katon : Dragon de feu":{"d":0.79},
 "n0|Katon : Flamme":{"d":0.871},
 "n0|Katon : Fournaise":{"d":1.044},
 "n0|Katon : Grand souffle de feu":{"d":1.434},
 "n0|Katon : Mur de feu":{"d":1.474},
 "n0|Katon : Nuée ardente":{"d":1.101},
 "n0|Katon : Shuriken de feu aériens":{"d":1.257},
 "n0|Katon : Tornade de feu":{"d":0.924},
 "n0|Katon : Triple flamme":{"d":1.027},
 "n1|Suiton : Bakusui Shôha":{"d":0.963},
 "n1|Suiton : Corps liquide":{"cd":6.5},
 "n1|Suiton : Daibakufu":{"d":0.853},
 "n1|Suiton : Daikôdan":{"d":1.127},
 "n1|Suiton : Dragon aqueux":{"d":1.137},
 "n1|Suiton : Dôme des requins":{"d":1.882},
 "n1|Suiton : Kirigakure":{"cd":8.0},
 "n1|Suiton : Mizurappa":{"d":1.371},
 "n1|Suiton : Suijinheki":{"cd":5.0},
 "n1|Suiton : Suikôdan":{"d":1.662},
 "n1|Suiton : Suirô":{"d":1.285},
 "n2|Fûton : Balle d'air":{"d":0.809},
 "n2|Fûton : Balles chargées":{"d":0.705},
 "n2|Fûton : Couloir de vent":{"d":0.82},
 "n2|Fûton : Envol":{"cd":11.0},
 "n2|Fûton : Grande balle d'air":{"d":1.049},
 "n2|Fûton : Lame d'air":{"d":0.995},
 "n2|Fûton : Mur de vent":{"cd":5.5},
 "n2|Fûton : Rafale à bout portant":{"d":0.898},
 "n2|Fûton : Souffle":{"d":0.81},
 "n2|Fûton : Tornade":{"d":0.9},
 "n2|Fûton : Triple balle d'air":{"d":0.953},
 "n3|Chidori":{"d":0.98},
 "n3|Raiton : Armure de foudre":{"d":1.215},
 "n3|Raiton : Chidori Eisô":{"d":0.934},
 "n3|Raiton : Chidori Nagashi":{"d":1.64},
 "n3|Raiton : Kage Bunshin":{"d":2.109,"cd":10.5},
 "n3|Raiton : Kirin":{"d":1.26},
 "n3|Raiton : Orage":{"d":1.244},
 "n3|Raiton : Panthère noire":{"d":1.827},
 "n3|Raiton : Pas de l'éclair":{"d":0.767},
 "n3|Raiton : Éclair":{"d":1.224},
 "n4|Doton : Chute de montagne":{"d":1.581},
 "n4|Doton : Doroku Gaeshi":{"cd":7.5},
 "n4|Doton : Doryû Taiga":{"d":1.455},
 "n4|Doton : Doryûheki":{"d":2.2,"cd":10.0},
 "n4|Doton : Doryûsô":{"d":0.794},
 "n4|Doton : Dragon de terre":{"d":1.077},
 "n4|Doton : Grand séisme":{"d":1.508},
 "n4|Doton : Kajûgan":{"d":1.22},
 "n4|Doton : Kyôka":{"d":1.887},
 "n4|Doton : Main de terre":{"d":1.405},
 "n4|Doton : Rocher":{"d":0.869},
 "n4|Doton : Taupe":{"cd":17.5},
 "n4|Doton : Yomi Numa":{"d":0.482},
 "u|Argile explosive":{"d":0.517},
 "u|Barrière Shishienjin":{"d":0.613},
 "u|Bombe fumigène":{"cd":6.0},
 "u|Byakugô":{"cd":12.0},
 "u|Chakra de Kyûbi":{"cd":32.0},
 "u|Chiens ninja":{"d":1.02},
 "u|Clone explosif":{"d":0.61},
 "u|Concentration du chakra":{"cd":9.5},
 "u|Contre du clone":{"cd":11.0},
 "u|Fûma Shuriken":{"d":1.074},
 "u|Fûton : Rasenshuriken":{"d":0.663},
 "u|Genjutsu : Plumes":{"cd":6.5},
 "u|Hiraishin":{"cd":16.0},
 "u|Invocation : Crapaud":{"d":1.182},
 "u|Invocation : Katsuyu":{"ck":27},
 "u|Invocation : Manda":{"d":0.792},
 "u|Kage Bunshin : leurre":{"cd":22.5},
 "u|Kawarimi":{"d":2.2,"cd":6.5},
 "u|Kunai explosifs":{"d":1.789},
 "u|Kunai à fil":{"d":1.078},
 "u|Lotus primaire":{"d":0.428},
 "u|Mode Ermite":{"ck":75},
 "u|Multiclonage":{"d":0.699},
 "u|Multiclonage de shuriken":{"d":0.654},
 "u|Parchemin explosif":{"d":0.926},
 "u|Pilule du soldat":{"cd":21.0},
 "u|Piège ninja":{"d":1.276},
 "u|Pluie de parchemins":{"d":1.937},
 "u|Raikiri":{"d":0.634},
 "u|Rasengan":{"d":0.989},
 "u|Rashômon":{"cd":9.5},
 "u|Roulade":{"cd":3.0},
 "u|Saut ninja":{"d":0.888},
 "u|Scalpel de chakra":{"cd":10.5},
 "u|Serpents de l'ombre":{"d":0.554},
 "u|Shunshin":{"cd":12.5},
 "u|Shôsen":{"cd":19.0},
 "u|Sôshôryû":{"d":0.995},
 "u|Ôkashô":{"d":0.546}
};
const JL=JD.map(([cat,slot,r,src,n,d,vfx],id)=>({id,cat,slot,r,cost:RANKS[r],src,n,d,vfx,P:JPAR[n]}));
const SLOTN=['Style de combat','Jutsu','Déplacement','Jutsu','Jutsu','Ultime'];
const stype=s=>s===2?2:s===5?5:1; // 1 = jutsu (Clic D, Q, E), 2 = déplacement, 5 = ultime
const catName=c=>c==='u'?'Subjutsu':c[0]==='n'?NATURES[+c.slice(1)][0]:'Clan '+CLANS[+c.slice(1)][0];
const catCol=c=>c==='u'?'#c8b89a':c[0]==='n'?NATURES[+c.slice(1)][2]:CLANS[+c.slice(1)][1];
// jutsu accessibles : jutsu de clan (ou Subjutsu sans clan) + jutsu de sa nature (les Taijutsuka n'ont pas de nature)
const avail=(b,slot)=>JL.filter(j=>stype(j.slot)===stype(slot)&&((b.clan>=0?j.cat==='c'+b.clan:j.cat==='u')||(b.clan!==TAIJ&&j.cat==='n'+b.nat)));
const kitCost=b=>b.j.slice(1).reduce((a,id)=>a+JL[id].cost,0);
// passifs renommés
// valeurs des passifs propres au jeu Naruto (mknaruto.py les branche dans le moteur), réglées par duels simulés ; les descriptions en découlent
const PASSV={regen:1.2,crit:.33,slow:.8,slowD:1.2,rage:1.25,speed:1.25,speedA:.8,armor:.88,ls:.25};
const pvF=v=>String(v).replace('.',',');
Object.assign(PASS,{third:['Taijutsu',PASS.third[1]],crit:['Précision ninja',Math.round(PASSV.crit*100)+' % de coups critiques sur les attaques de base'],slow:['Fils de chakra','Les attaques de base ralentissent ; +'+Math.round((PASSV.slowD-1)*100)+' % de dégâts sur une cible ralentie'],lifesteal:['Vol de chakra','Récupère '+Math.round(PASSV.ls*100)+' % des dégâts infligés'],rage:['Volonté du feu','+'+Math.round((PASSV.rage-1)*100)+' % de dégâts sous 50 % de vie'],
 armor:['Corps endurci','Subit '+Math.round((1-PASSV.armor)*100)+' % de dégâts en moins'],regen:['Sang Uzumaki','Récupère '+pvF(PASSV.regen)+' PV par seconde'],speed:['Pieds légers','+'+Math.round((PASSV.speed-1)*100)+' % de vitesse de déplacement, attaques de base '+Math.round((1-PASSV.speedA)*100)+' % plus rapides'],energy:['Contrôle du chakra','Recharge (R) et régénération du chakra +50 %']});
const PASSK=Object.keys(PASS);
// voies : modifient PV, vitesse et puissance
const VOIES=[['Taijutsu',1.09,6,.95],['Équilibré',1,0,1],['Ninjutsu',.9,-4,1.1]]; // réglées par duels simulés (Taijutsu PV ×1,12 et Ninjutsu puissance ×1,08 auparavant)
const CAMPS=['Alliance Shinobi','Akatsuki'];
const VILLAGES=[['Konoha','#1f3a6a'],['Suna','#7a5a2a'],['Kiri','#2a5a6a'],['Kumo','#3a3a4a'],['Iwa','#5a3a2a'],['Oto','#4a2a5a'],['Nukenin','#2a2a2a'],['Ame','#4a5a6a'],['Yu','#6a4a3a']];
const TENUES=[['Tenue orange',{legs:'#2a3550',torso:'#f08a24',arm:'#f08a24',belt:'#2a3550',boot:'#1a2a48'}],['Gilet de chûnin',{legs:'#1f2c48',torso:'#26365a',vest:'#5a6e3a',arm:'#26365a',belt:'#1a2238',boot:'#1a2238'}],
 ['Manteau Akatsuki',{legs:'#16161c',torso:'#16161c',robe:'#16161c',clouds:1,arm:'#16161c',boot:'#2a2a33'}],['Tenue Anbu',{legs:'#2a2a30',torso:'#3a3a42',armor:'#c8ccd4',arm:'#2a2a30',belt:'#555',boot:'#222'}],
 ['Kimono Hyûga',{legs:'#d8d0c0',torso:'#ece6da',robe:'#ddd6c8',arm:'#ece6da',belt:'#6a5a8a',boot:'#5a5060'}],['Tenue Uchiha',{legs:'#d8d8dc',torso:'#1c2238',tunic:'#2a3050',arm:'#1c2238',belt:'#6a2a2a',boot:'#222'}],
 ['Tenue de Suna',{legs:'#6a5038',torso:'#8a6a48',cape:'#5a4030',arm:'#8a6a48',belt:'#3a2a1a',boot:'#3a2a1a'}],['Tenue verte',{legs:'#3a7a3a',torso:'#4a8a3a',vest:'#5a6e3a',arm:'#4a8a3a',belt:'#c03a2a',boot:'#c8b080',warm:'#f08a24'}],
 // tenues des personnages célèbres (drapeaux : yoke épaules, open col en V, rope corde à nœud, fan éventail Uchiha, disc cercle dans le dos, rshort robe courte, warm jambières,
 // haori manteau ouvert (+ trim bordure, dots pois, hsl manches), collar col montant, hood capuche up/down/chat, fur col de fourrure, sash écharpe ; arm/legs 'skin' = bras ou jambes nus)
 ['Veste orange et noire',{legs:'#f08a24',torso:'#f08a24',yoke:'#1c1c26',arm:'#f08a24',belt:'#1c1c26',boot:'#1a2238'}],['Chemise blanche',{legs:'#2a2a3a',torso:'#ecebf0',arm:'#ecebf0',open:1,rope:'#6a4aa8',fan:1,boot:'#222'}],
 ['Qipao rouge',{legs:'#2a2a38',torso:'#c8283a',robe:'#c8283a',rshort:1,arm:'skin',disc:'#ffffff',boot:'#2a2a38'}],['Combinaison verte',{legs:'#3f8f3a',torso:'#3f8f3a',arm:'#3f8f3a',belt:'#c03a2a',warm:'#f08a24',boot:'#c8b080'}],
 ['Robe de Kage',{legs:'#e8e6de',torso:'#efeee8',robe:'#efeee8',trim:'#c0202a',arm:'#efeee8',belt:'#c0202a',boot:'#5a4a3a'}],['Manteau du Hokage',{legs:'#26365a',torso:'#26365a',vest:'#5a6e3a',arm:'#26365a',haori:'#f2f0ea',hsl:1,trim:'#d03a2a',belt:'#1a2238',boot:'#1a2238'}],
 ['Tenue de Sannin',{legs:'#5a6a3a',torso:'#5a6a3a',arm:'#5a6a3a',haori:'#b8302a',dots:'#e8c040',belt:'#2a2a2a',boot:'#7a5a3a'}],['Haori vert',{legs:'#2a3550',torso:'#9a9aa6',arm:'#9a9aa6',haori:'#4a8a4a',hsl:1,belt:'#2a3a6a',boot:'#2a2a33'}],
 ['Tenue du serpent',{legs:'#3a3a48',torso:'#d8d2c0',robe:'#d8d2c0',rshort:1,arm:'#d8d2c0',rope:'#6a3a9a',boot:'#2a2a33'}],['Veste lavande',{legs:'#2a2a50',torso:'#e2dcee',arm:'#e2dcee',belt:'#8a6ab0',boot:'#2a2a50'}],
 ['Long manteau',{legs:'#3a3a42',torso:'#6a7466',robe:'#6a7466',arm:'#6a7466',collar:'#5e685a',hood:'up',boot:'#2a2a33'}],['Veste à fourrure',{legs:'#2a2a38',torso:'#5a5a64',arm:'#5a5a64',fur:'#ece6da',belt:'#2a2a38',boot:'#2a2a33'}],
 ['Manteau rouge de Suna',{legs:'#3a2a2a',torso:'#8a2a2a',robe:'#8a2a2a',arm:'#8a2a2a',sash:'#d8d0c0',boot:'#3a2a1a'}],['Combinaison à capuche',{legs:'#1c1c24',torso:'#1c1c24',arm:'#1c1c24',hood:'chat',belt:'#5a4a8a',boot:'#222'}],
 ['Armure Akimichi',{legs:'#3a3a40',torso:'#3a3a40',armor:'#b02a2a',arm:'#3a3a40',belt:'#d8c060',boot:'#222'}],['Tenue violette',{legs:'#e8e2d6',torso:'#7a4a9a',robe:'#7a4a9a',rshort:1,arm:'skin',boot:'#3a2a4a'}],
 ['Tenue chinoise rose',{legs:'#4a5a3a',torso:'#e88aa8',arm:'#e88aa8',belt:'#c03a5a',boot:'#2a2a33'}]];
const COIFS=[['Pics','pics'],['Lisses','lisse'],['Queue haute','queue'],['Courts','courts'],['Chignons','chignons'],['Crâne rasé','chauve'],
 ['Mèches de canard','sasuke'],['Carré court','carre'],['Pics obliques','kakashi'],['Queue basse','itachi'],['Demi-queue et mèche','deidara'],['Pics de requin','requin'],['Ébouriffés','sasori'],['Plaqués en arrière','plaque'],
 ['Pics hérissés','pain'],['Chignon et fleur','konan'],['Crinière d\'ermite','jiraiya'],['Deux queues basses','tsunade'],['Longs raides','orochimaru'],['Pics et longues mèches','minato'],['Longs attachés','neji'],
 ['Coupe au bol','bol'],['Ananas','ananas'],['Pics sous bandeau','choji'],['Longue queue et mèche','ino'],['Sauvages','kiba'],['Coupe hime','hinata'],['Courts en pics','gaara'],['Quatre couettes','temari']];
const HAIRC=[['Blond','#f2c84a'],['Noir','#1a1a22'],['Rose','#f08ab0'],['Roux','#c0482a'],['Blanc','#e8e8f0'],['Brun','#6b4a2a'],['Bleu nuit','#2a3a6a'],['Rouge','#b8202a'],['Argenté','#c8ccd6'],['Gris','#8a8a92'],['Orange','#e8702a'],['Lavande','#7a6ab8'],['Blond pâle','#f2e09a'],['Bleu acier','#3a5a8a'],['Châtain foncé','#3a2618'],['Noir bleuté','#1c2238']];
const PEAUX=[['Claire','#f6d6b4'],['Mate','#e0b08a'],['Hâlée','#b8805a'],['Foncée','#7a5038'],['Pâle','#e8e0e8'],['Bleu requin','#7c9cb4'],['Blafarde','#f0eee6'],['Rosée','#fae2d0']];
const CHAKRAS=[['Bleu','#3af'],['Rouge','#f33'],['Vert','#3f6'],['Violet','#a5f'],['Orange','#f93'],['Blanc','#eef'],['Jaune','#fd3']];
const ACCS=[['Aucun',''],['Masque','masque'],['Lunettes noires','lunettes'],['Lunette de visée','visee'],['Chapeau de Kage','kage'],['Masque Anbu','anbu'],['Fleur de papier','fleur']];
// marques du visage (certaines changent les yeux : Rinnegan, yeux de serpent, yeux de requin, yeux ronds)
const FACES=[['Aucune',''],['Moustaches','moust'],['Crocs rouges','marques'],['Cernes','cernes'],['Tatouage « amour »','gaara'],['Losange','losange'],['Spirales','spirales'],['Traits d\'ermite','ermite'],
 ['Branchies','branchies'],['Rinnegan et piercings','pain'],['Fard du serpent','fard'],['Rides et barbiche','rides'],['Gros sourcils','sourcils'],['Peinture de guerre','kankuro'],['Cicatrice','cicatrice'],['Barbe','barbe']];
// façon de porter le bandeau
const BANDS=[['Au front','front'],['Œil caché','oblique'],['Barré (renégat)','barre'],['Serre-tête','tete'],['Au cou','cou'],['À la taille','taille'],['Au bras','bras'],['Cornes d\'ermite','cornes'],['Sans bandeau','']];
// porté dans le dos
const BACKS=[['Rien',''],['Gourde de sable','gourde'],['Grand parchemin','parchemin'],['Épée bandée','samehada'],['Faux tripale','faux'],['Éventail géant','eventail'],['Fûma shuriken','fuma'],['Katana','katana']];
const EYEF={pain:'rin',fard:'ser',branchies:'req',sourcils:'rond'}; // yeux propres à certaines marques (si le clan n'en impose pas)
// build : {name, side, voie, nat, clan (-1 = sans clan), j:[style, 5 id de jutsu], pass, l:{v,t,c,h,p,k,a,f,b,d}} (f visage, b bandeau, d dos)
// strict : ramène le kit sous le budget (pour les builds reçus en ligne et les bots)
function sanitizeBuild(b,strict){b=b&&typeof b==='object'?b:{};const n=(a,m)=>Math.max(0,Math.min(m-1,(a|0)));const l=b.l||{};
 const o={name:String(b.name||'Ninja').replace(/[<>]/g,'').slice(0,16)||'Ninja',side:b.side?1:0,voie:n(b.voie??1,VOIES.length),nat:n(b.nat,NATURES.length),clan:b.clan==null?-1:Math.max(-1,Math.min(CLANS.length-1,b.clan|0)),pass:n(b.pass,PASSK.length),
  l:{v:n(l.v,VILLAGES.length),t:n(l.t,TENUES.length),c:n(l.c,COIFS.length),h:n(l.h,HAIRC.length),p:n(l.p,PEAUX.length),k:n(l.k,CHAKRAS.length),a:n(l.a,ACCS.length),f:n(l.f,FACES.length),b:n(l.b,BANDS.length),d:n(l.d,BACKS.length)}};
 const st=(b.j||[])[0];o.j=[STYLES[st]&&styleOk(st,o.clan)?st:clanStyle(o.clan)>=0?clanStyle(o.clan):STYLES.findIndex((_,i)=>styleOk(i,o.clan))];
 for(let s=1;s<6;s++){const A=avail(o,s).filter(j=>!o.j.slice(1).includes(j.id)),id=(b.j||[])[s];o.j.push(A.some(j=>j.id===id)?id:A.reduce((a,c)=>c.cost<a.cost?c:a).id)}
 if(strict)while(kitCost(o)>budgetOf(o)){let best=null;o.j.forEach((id,s)=>{if(!s)return;for(const c of avail(o,s))if(c.cost<JL[id].cost&&!o.j.slice(1).includes(c.id)){const gain=JL[id].cost-c.cost;if(!best||gain>best.g)best={s,id:c.id,g:gain}}});if(!best)break;o.j[best.s]=best.id}
 return o}
// le clan se voit : Sharingan, Byakugan, carrure Akimichi, marques Kaguya, chien Inuzuka, gourde Sabaku (pas pour les marionnettistes) ; l'arme suit le style de combat
function ninjaLook(l,clan,style){const v=VILLAGES[l.v],S=STYLES[style]||STYLES[0],T=TENUES[l.t][1],sk=PEAUX[l.p][1],f=FACES[l.f|0][1],bk=BACKS[l.d|0][1];
 const o=Object.assign({},T,T.arm==='skin'?{arm:sk}:{},clan===3?{scale:1.14}:{},clan===5?{dog:1}:{},(clan===8&&S[0]!=='Marionnette')||bk==='gourde'?{gourd:1}:{},bk&&bk!=='gourde'?{back:bk}:{},
 {head:{t:'ninja',skin:sk,hair:HAIRC[l.h][1],style:COIFS[l.c][1],band:v[1],vil:l.v,bs:BANDS[l.b|0][1],acc:ACCS[l.a][1],face:f,eyeT:EYEF[f]||null,eye:clan===0?'#e01a1a':clan===1?'#e8e8f8':null,kaguya:clan===9,brows:clan===TAIJ||f==='sourcils'},weapon:{t:'kunai',k:S[4],col:CHAKRAS[l.k][1]}});if(CLOOK[clan])CLOOK[clan](o,l,S);return o}
const srcAb=src=>{const [h,k]=src.split('.');return h==='x'?NAT[k]:SRC[h].abil[+k]};
// personnage de référence pour les stats : option hero de la mécanique, sinon celui du préfixe (ka_, su_, sub_…)
const srcHero=src=>{const [h,k]=src.split('.');return h==='x'?(NAT[k]&&NAT[k].hero)||NATHERO[k.split('_')[0]]||NATHERO[k.slice(0,2)]:h};
// subjutsu, jutsu de clan et déplacements : pas de mudras (instantanés)
function jutsu(id){const J=JL[id],b=srcAb(J.src),mud=J.cat==='u'||J.cat[0]==='c'||J.slot===2?0:MUDRAS[J.r];return Object.assign({},b,J.P?{P:Object.assign({},b.P,J.P)}:{},JCD[J.n]?{cd:JCD[J.n]}:{},b.ult?{cd:22}:{},{cast:mud?mud*MUDRA_T:b.cast,mud,noTele:!b.line&&!b.tele,n:J.n,d:J.d,ex:null,src:srcHero(J.src),vfx:J.vfx,rank:J.r,jid:id})}
function styleAb(i){const S=STYLES[i],b=srcAb(S[2]);return Object.assign({},b,{n:S[0],d:S[1],ex:null,src:srcHero(S[2]),vfx:S[3],style:i})}
// stats : moyenne des persos d'origine (le style de combat compte pour 5), puis la voie, puis les réglages CLANBAL / NATBAL / STYLEBAL
function mkNinja(b,strict){b=sanitizeBuild(b,strict);const abil=[styleAb(b.j[0])].concat(b.j.slice(1).map(id=>jutsu(id))),w=[5,1,1,1,1,1];let hp=0,pw=0,sp=0,W=0;
 abil.forEach((a,s)=>{const o=SRC[a.src];hp+=o.hp*w[s];pw+=o.pw*w[s];sp+=o.spd*w[s];W+=w[s]});const v=VOIES[b.voie],S=STYLES[b.j[0]];hp*=S[6];pw*=S[7];if(b.clan===TAIJ){hp*=1.05;sp+=4*W}
 {const cb=CLANBAL[b.clan]||[1,1],nb=b.clan===TAIJ?[1,1]:NATBAL[b.nat]||[1,1],sb=STYLEBAL[b.j[0]+':'+b.clan]||STYLEBAL[b.j[0]]||[1,1];hp*=cb[0]*nb[0]*sb[0];pw*=cb[1]*nb[1]*sb[1]} // corps surentraîné : pas de ninjutsu, mais plus solide et plus rapide
 const lign=b.clan>=0?'Clan '+CLANS[b.clan][0]:'Sans clan';
 return{name:b.name,side:b.side,desc:`${lign}${b.clan===TAIJ?'':' · '+NATURES[b.nat][0]} · voie ${v[0].toLowerCase()}`,hp:Math.round(hp/W*v[1]*HPK),spd:Math.round(sp/W+v[2]),pw:Math.round(pw/W*v[3]*100)/100,clan:b.clan,nat:b.clan===TAIJ?-1:b.nat,pref:{bigfist:85,bone:90,sword:90,chain:90,fan:85,vine:85,puppet:95}[S[4]]||75,taij:b.clan===TAIJ,pass:PASSK[b.pass],look:ninjaLook(b.l,b.clan,b.j[0]),abil,build:b}}
// générateur pseudo-aléatoire déterministe (mêmes ninjas adverses chez tous les joueurs en ligne)
const srnd=seed=>()=>(seed=seed*16807%2147483647)/2147483647;
function randomKit(r,b){const k=a=>Math.floor(r()*a.length);b.nat=k(NATURES);b.clan=r()<.8?k(CLANS):-1;b.voie=k(VOIES);b.pass=k(PASSK);
 b=sanitizeBuild(b);const ST=STYLES.map((_,i)=>i).filter(i=>styleOk(i,b.clan));b.j=[ST[k(ST)]];for(let s=1;s<6;s++){const A=avail(b,s).filter(j=>!b.j.slice(1).includes(j.id));b.j.push(A[k(A)].id)}return sanitizeBuild(b,true)}
// apparence au hasard : les pièces très typées (chapeau de Kage, robe de Kage, peau de requin, objets dans le dos) restent rares
const RND_T=[0,1,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24],RND_A=[0,0,0,0,0,0,1,2,3,5,6],RND_P=[0,0,1,1,2,3,4,7],RND_B=[0,0,0,0,0,0,0,1,3,4,5,6,8];
function randomBuild(r,side,name){const k=a=>Math.floor(r()*a.length),o=a=>a[k(a)],l={v:side&&r()<.6?6:k(VILLAGES.slice(0,6)),t:side?(r()<.55?2:k(TENUES)):o(RND_T),c:k(COIFS),h:k(HAIRC),p:o(RND_P),k:k(CHAKRAS),a:r()<.6?0:o(RND_A)};
 l.f=r()<.65?0:1+k(FACES.slice(1));if(l.f===11&&r()<.7)l.f=0;l.b=side&&r()<.5?2:o(RND_B);l.d=r()<.8?0:1+k(BACKS.slice(1));if(l.t===12)l.t=1;
 return randomKit(r,{name,side,l})}
const BOTN=[['Hayate','Kaito','Ren','Sora','Yuki','Haruto','Aiko','Daichi','Emi','Hikaru','Kenji','Mitsuki','Natsu','Riku','Saki','Takumi','Yori','Asuka','Jiro','Kaede'],
 ['Kurogane','Akuma','Raijin','Mizore','Shiden','Gekkô','Hebi','Kagerô','Oboro','Tetsu','Jaku','Kirisame','Yami','Rasetsu','Kuroi','Hyôga','Doku','Zangetsu','Mukuro','Shura']];
/*NR_PASS*/
// ninjas adverses : les persos de l'anime (leur kit et leur apparence, dans leur camp) + des ninjas inventés :
// moitié sur le kit d'un perso mais avec leur propre apparence (un bot n'a l'air d'un perso que s'il en porte le nom), moitié au hasard ; le nom de clan suit le prénom
const CH={};{const r=srnd(4242);for(let s=0;s<2;s++)BOTN[s].forEach((n,i)=>{let b=randomBuild(r,s,n);if(r()<.5){const q=presetBuild(Math.floor(r()*PRESETS.length),n,s);q.l=b.l;b=q}if(b.clan>=0)b.name=n+' '+CLANS[b.clan][0];if(s&&r()<.6){b.l.t=2;b.l.v=6}CH['b'+(s*20+i)]=mkNinja(b,true)});
 PRESETS.forEach((P,i)=>{CH['a'+i]=mkNinja(presetBuild(i,P.n,P.side),true)})}
const HEROES=Object.keys(CH);
// ton ninja (gardé dans le navigateur)
// ton ninja : les jutsu sont gardés par leur nom (un ninja sauvegardé reste juste quand le catalogue évolue)
const JLEG=["Rasengan", "Fûma Shuriken", "Coup de pied tornade", "Lotus primaire", "Shunshin", "Kawarimi", "Saut ninja", "Roulade", "Hiraishin", "Kunai à fil", "Multiclonage", "Parchemin explosif", "Bombe fumigène", "Piège ninja", "Genjutsu : Plumes", "Kunai explosifs", "Shôsen", "Zone de soin", "Contre du clone", "Pilule du soldat", "Concentration du chakra", "Invocation : Crapaud", "Pluie de parchemins", "Mode Ermite", "Invocation : Katsuyu", "Katon : Flamme", "Katon : Mur de feu", "Katon : Triple flamme", "Katon : Shuriken de feu aériens", "Katon : Fournaise", "Katon : Flammes chargées", "Katon : Dragon de feu", "Katon : Tornade de feu", "Katon : Nuée ardente", "Katon : Grand souffle de feu", "Suiton : Vague", "Suiton : Brume cachée", "Suiton : Prison aqueuse", "Suiton : Balles d'eau", "Suiton : Mur d'eau", "Suiton : Grand requin", "Suiton : Dragon aqueux", "Fûton : Mur de vent", "Fûton : Balle d'air", "Fûton : Triple balle d'air", "Fûton : Grande balle d'air", "Fûton : Rafale à bout portant", "Fûton : Balles chargées", "Fûton : Lame d'air", "Fûton : Souffle", "Fûton : Couloir de vent", "Fûton : Tornade", "Chidori", "Raiton : Chaîne", "Raiton : Pas de l'éclair", "Raiton : Orage", "Raiton : Piège électrique", "Raiton : Armure de foudre", "Raiton : Décharge", "Raiton : Kirin", "Doton : Rocher", "Doton : Taupe", "Doton : Mur de terre", "Doton : Corps de roche", "Doton : Montagne écrasante", "Doton : Séisme", "Lame de Kusanagi", "Shunshin Uchiha", "Sharingan : Genjutsu", "Sharingan", "Amaterasu", "Tsukuyomi", "Susanô : Totsuka", "Hakke : Paume", "Pas du Hakke", "Byakugan", "Kaiten", "Hakke : 64 points", "Kage Mane", "Course de l'ombre", "Kage Kubi Shibari", "Ombre protectrice", "Ombres liées", "Paume géante", "Boulet humain", "Décuplement partiel", "Pilule rouge", "Décuplement", "Insectes chercheurs", "Clone d'insectes", "Essaim d'insectes", "Insectes dévoreurs", "Nuée destructrice", "Gatsûga", "Instinct bestial", "Ninken", "Flair du chien", "Garôga", "Chaînes de chakra", "Rasengan", "Sceau d'échange", "Sceau", "Multiclonage", "Vitalité Uzumaki", "Rasen-shuriken", "Chakra de Kyûbi", "Shinranshin", "Transposition", "Shintenshin", "Champ de fleurs", "Esprit destructeur", "Cercueil de sable", "Sable volant", "Sable mouvant", "Armure de sable", "Tsunami de sable", "Doigts-balles", "Bond d'os", "Forêt naissante", "Armure d'os", "Forêt d'os", "Konoha Senpû", "Konoha Daisenpû", "Konoha Gôriki Senpû", "Lotus primaire", "Poids retirés", "Bond du fauve", "Vitesse du fauve", "Défi éternel", "Dynamic Entry", "Lotus caché", "Esquive du fauve", "Première Porte", "Porte de la Vie", "Corps de jade", "Éléphant de midi", "Huit Portes", "Paon du matin", "Tigre du soir", "Nuit de la mort"];
const byName=n=>{const J=JL.find(j=>j.n===n);return J?J.id:-1};
// même nom dans plusieurs catégories (ex. Rasengan) : on prend celui du clan ou de la nature du ninja
const pickName=(b,n)=>{const c=JL.filter(j=>j.n===n);return(c.find(j=>j.cat===(b.clan>=0?'c'+b.clan:'u')||j.cat==='n'+b.nat)||c[0]||{id:-1}).id};
function legacyLook(b){const l=b&&b.l;if(l&&l.f==null){const a=l.a|0;l.f=a===2?1:a===3?2:0;l.a=a===4?2:a===1?1:0}return b}
function loadMine(){let b=null;try{b=legacyLook(JSON.parse(localStorage.getItem('nrBuild4')||'null'));if(b&&b.jn)b.j=[b.j[0],...b.jn.map(n=>pickName(b,n))];if(!b){const o=JSON.parse(localStorage.getItem('nrBuild3')||'null');if(o&&o.j){o.j=[o.j[0],...o.j.slice(1).map(i=>pickName(o,JLEG[i]))];b=legacyLook(o)}}}catch(e){b=null}
 return sanitizeBuild(b||presetBuild(0,'Ninja',0))}
let MY;try{MY=loadMine()}catch(e){MY=randomBuild(srnd(99),0,'Ninja')}
CH.p0=mkNinja(MY);
// ninja du créateur (toujours le sien) : en ligne, côté ami, CH.p0 est le ninja de l'hôte
let MYCH=CH.p0;
