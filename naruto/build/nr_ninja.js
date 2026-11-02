// ===================== NINJAS : chacun crée son ninja et compose son kit =====================
// Build v5 (voir FONDATION.md) : clan, nature, arbre de style (Tai/Ken/Buki) + attaque de base, familles de sub (sans clan), dash, jutsu APPRIS par arbre et par rang, barre de 6 cases.
// Les jutsu réutilisent les mécaniques éprouvées du moteur (SRC) avec leurs propres effets visuels (vfx). Plus de budget de points, de passif ni de voie. Pas de versions EX.
const RANKC={D:'#9aa3ad',C:'#6fcf6f',B:'#5ab4ff',A:'#c07aff',S:'#ffc53a'};
const NATURES=[['Katon','Feu','#ff7a2a'],['Suiton','Eau','#3aa8ff'],['Fûton','Vent','#9fe8c8'],['Raiton','Foudre','#ffe14a'],['Doton','Terre','#b08850']];
const CLANS=[['Uchiha','#c0202a'],['Hyûga','#d8d0f0'],['Nara','#5a6a3a'],['Akimichi','#d87a3a'],['Aburame','#4a6a5a'],['Inuzuka','#a04a2a'],['Uzumaki','#e0503a'],['Yamanaka','#c8a0e0'],['Sabaku','#c8a060'],['Kaguya','#e8e8e0'],['Taijutsuka','#4aa83a'],
 // clans ajoutés (c11-c20) : 3e champ = sigle de l'icône (le 1er lettre ne suffit plus à les distinguer)
 ['Hoki','#8ab83a','Hk'],['Roran','#e0b84a','Ro'],['Hakumei','#6a4a8a','Hm'],['Shirogane','#a8b4c8','Sg'],['Chinoike','#9a1424','Ci'],
 ['Kami','#7a9ae0','Km'],['Fûma','#5a5a6e','Fm'],['Hoshigaki','#4a7a9a','Hs'],['Hôzuki','#4ac8d8','Hz'],['Yuki','#bfe6ff','Yu'],
 // clans martiaux ajoutés (c21 Kenjutsuka, Pays du Fer ; c22 Bukijutsuka, Konoha) : sans nature, arbre de style imposé (MARTIAL, nr_kits.js)
 ['Kenjutsuka','#9aa8b8','Kj'],['Bukijutsuka','#c8a070','Bk']];
const clanTag=c=>CLANS[c]?CLANS[c][2]||CLANS[c][0][0]:'?'; // sigle d'un clan (icônes)
const TAIJ=10; // le clan Taijutsuka n'a pas de nature : uniquement du taijutsu (clan martial, voir isMartial)
// styles de combat (attaque de base) : [nom, description, source, vfx, arme, clans autorisés (-1 = sans clan), modif. PV, modif. puissance, arbre 'tai'|'ken'|'buki']
// styles de combat : voir kits/styles.js ; styles permis pour un build : stylesOf(b) (nr_tree.js)
const styleOk=(s,b)=>stylesOf(typeof b==='object'&&b?b:{clan:b,st:0,nat:0,fam:[]}).includes(s);
// style signature du clan (réservé au clan, pas aux sans-clan) : -1 s'il n'y en a pas ; c'est le style par défaut quand on choisit le clan
const clanStyle=c=>c<0?-1:STYLES.findIndex(x=>x[5].includes(c)&&!x[5].includes(-1));
// catalogue : KIT(arbre, [[rang, mécanique, nom, description, vfx], …]) ; arbres 'n0'..'n4' natures, 't0'..'t2' styles, 'c0'..'c22' clans, 'f0'..'f7' familles
/*NR_NATURE*/
const JD=KITROWS; // le catalogue est assemblé par les fichiers kits/*.js (un par catégorie)
// réglages propres à certains jutsu (réglés par duels simulés)
const JPAR={'Multiclonage':{d:1.2},'Ninken':{d:3},'Insectes dévoreurs':{dps:4}};
const JCD={}; // (Lotus primaire / Lotus caché : recharge du barème de leur rang, A / S) // temps de recharge propres à certains jutsu
// équilibrage par clan (-1 = sans clan) et par nature : [multiplicateur PV, multiplicateur puissance], réglés par duels simulés
// réglés à nouveau pour l'ambiance NRP (PV ×1,2 puis ×1,1, chakra rare) : duels simulés de chaque clan / nature contre des kits aléatoires, 45-55 % visés
// puis pour les 21 clans (Hoki … Yuki, refonte Uzumaki) : duels 1v1 sans soin, 46-56 % pour chaque clan / nature ; les clans aux combats trop courts
// (Nara, Uzumaki, Hoki, Shirogane, Chinoike, Hôzuki, Katon) ont plus de PV et moins de puissance : duel médian ≈ 50 s
// passe d'équilibrage après le passage des M1 au corps à corps (un style propre à chaque clan) : simulateur du jeu (nr_bal.js), duels 1v1 AVEC soin (H),
// kits aléatoires de chaque clan / nature / style contre un ninja aléatoire, 45-55 % visés pour chacun et 40-60 % pour chaque jutsu (JBAL) ; duel médian ≈ 52 s
// puis, quand les bots ont enfin frappé au corps à corps (aiIn) : PV ×1,3 (HPK) et attaques de base ×0,4 (M1K), Shirogane refait (M1 au contact,
// SG.BAL 1,15 / SG.TAKE 1), clans recalés sur bal21 (1v1 sans soin, 150 à 400 duels par catégorie) : 44-55 % pour chaque clan / nature, duel médian ≈ 50 s
// arbres de compétences (format v5) : builds valides tirés au hasard (barres variées, bots qui changent leur barre), 1v1 avec soin, 700 duels par catégorie :
// clans, natures, arbres de style, familles et sans-clan à 45-55 %, chaque jutsu lancé à 40-60 %, duel médian ≈ 58 s ; TREEBAL / FAMBAL ci-dessous, PREBAL dans nr_pass.js
// puis barème borné (JBAL : recharge à 10 % et chakra à 25 % de la fourchette du rang, nr_bal.js blRk) et PREBAL sans barre ni clans martiaux : nouvelle passe,
// 700 duels par catégorie : clans, natures, arbres et familles à 45-55 %, 233 jutsu sur 235 à 40-60 % ; persos de l'anime à 39-60 % les uns contre les autres
// puis arbres martiaux SANS CHAKRA (Taijutsu, Kenjutsu, Bukijutsu et clans Taijutsuka, Kenjutsuka, Bukijutsuka : TREES[…].ckFree) : les clans martiaux passent
// de ≈ 48 % à ≈ 86 % ; compensé par leurs recharges (haut de la fourchette du rang +10 %) et CLANBAL 10 / 21 / 22 (PV et puissance ×0,8 environ), TREEBAL retouché
// (même passe : CLANBAL 2-8 / 11 / 17, FAMBAL 3 / 5 / 7, NATBAL et PREBAL aussi réglés à nouveau — ex. Neji 403 → 449 PV — gardés : catégories mesurées à 45-55 %)
// puis Rock Lee / Gaï / Tenten (barres de rang A-S) à 66-84 % contre les autres persos de l'anime alors que leurs clans tirés au hasard restent à 45-55 % :
// sans chakra, une barre de rangs hauts valait bien plus qu'une barre au hasard (Taijutsuka : 71 % contre 31 % pour les 6 plus bas). Dégâts (d) des jutsu martiaux
// de leurs barres baissés (Huit Portes, Lotus caché, Éléphant, Paon, Gôriki Senpû, Daisenpû, Sôshôryû, Kôkinjô, Buki Shôkan, Kunai Ori…, Dynamic Entry / Lotus primaire en t0),
// les autres montés (Défi éternel, Esquive du fauve, Tonfa, Fundo, Makimono, Ôtsuchi, Konoha Senpû / Ôkashô / Tsûtenkyaku), CLANBAL 10 ×1,083 et 22 ×1,015,
// PREBAL ×1,025 (les persos de l'anime perdaient 54-46 contre des ninjas au hasard). Mesure finale (8400 duels entre persos de l'anime, 1400 par catégorie) :
// Rock Lee 62 %, Gaï 63 %, Tenten 57 %, Mifune 50 % ; Taijutsuka 47 %, Kenjutsuka 50 %, Bukijutsuka 45 %, arbres Taijutsu / Kenjutsu / Bukijutsu 49 / 48 / 50 %
// puis RECHARGES LONGUES (D 20-30 s, C 30-40 s, B 40-60 s, A 60-80 s, S 80-100 s ; RKB / rkCd, nr_flow.js : les cd de JBAL ci-dessous restent sur l'ancien barème) :
// sans retouche, les clans martiaux s'effondraient (Taijutsuka 23 %, Kenjutsuka 22 %, Rock Lee 6 %, Gaï 4 %) : leur puissance avait été baissée pour des jutsu
// gratuits lancés en boucle. Dégâts (d) de leurs jutsu de rang haut remontés (racine carrée de l'ancien réglage, puis ×1,3 pour ceux des barres de Lee, Gaï
// et Mifune, ×1,2 de plus pour ceux de Gaï), CLANBAL / NATBAL / STYLEBAL / TREEBAL / FAMBAL recalés en 12 passes (400 duels par catégorie), PREBAL aussi
// (les persos de l'anime contre des ninjas au hasard : 53 % comme avant). Mesure finale : 67 catégories sur 74 à 45-55 % (les autres à 42-59 %),
// 42 persos de l'anime à 42-58 % entre eux, duel médian 52 s (44 s avant ; 52,6 s entre persos de l'anime), HPK inchangé
const CLANBAL={"0":[0.822,0.784],"1":[0.756,0.76],"2":[1.066,1.108],"3":[0.904,0.813],"4":[0.931,0.931],"5":[1.113,1.118],"6":[1.093,0.925],"7":[0.974,1.015],"8":[0.864,0.978],"9":[0.975,0.824],"10":[0.887,0.523],"11":[1.087,0.946],"12":[1.044,0.982],"13":[1.148,1.13],"14":[0.972,1.317],"15":[1.084,0.98],"16":[0.971,1.11],"17":[0.989,1.05],"18":[0.939,0.928],"19":[0.833,1.029],"20":[0.952,1.125],"21":[1.04,0.709],"22":[0.927,0.73],"-1":[1.008,0.966]},NATBAL={"0":[1.161,0.958],"1":[1.038,1.114],"2":[1.003,1.011],"3":[1.066,1.0],"4":[1.044,1.056]},STYLEBAL={"0":[1.022,1.026],"1":[1.0,0.987],"2":[0.904,0.869],"2:-1":[0.811,0.727],"3":[0.886,0.927],"7":[1.03,1.061],"8":[1.001,0.919],"10":[1.025,1.113],"12":[0.917,1.054],"15":[1.127,1.32],"16":[0.985,0.985],"18":[0.929,0.849],"19":[1.035,0.855],"20":[1.01,1.01],"23":[1.005,1.027],"24":[0.994,1.0],"25":[1.244,1.103],"26":[1.081,1.084],"29":[1.027,1.015],"31":[1.005,1.008],"32":[1.013,1.054],"33":[1.037,1.005]}; // STYLEBAL[indice du style] ou STYLEBAL['indice:clan'] = [PV, puissance], réglés par duels simulés (Kenjutsu sans clan à part)
// équilibrage par arbre de style (TREEBAL[st]) et par famille de sub (FAMBAL[f], moyenne géométrique des familles prises) : [PV, puissance], défaut [1, 1]
const TREEBAL={"1":[1.088,1.081],"0":[1.021,1.073],"2":[1.036,1.065]},FAMBAL={"0":[0.791,1.2],"1":[1.046,1.028],"2":[1.037,1.134],"3":[0.951,1.078],"4":[1.048,1.027],"5":[0.952,1.103],"6":[0.937,1.016],"7":[0.953,1.015]};
// équilibrage par jutsu (« catégorie|nom ») : d = dégâts ×, cd = recharge (s), ck = coût en chakra ; appliqué par nr_bal.js (les « N dégâts » des descriptions suivent d)
const JBAL={
 "c0|Amaterasu":{"d":0.4,"cd":17.6},
 "c0|Genjutsu : Tsukuyomi":{"cd":13.0,"ck":21},
 "c0|Katon : Gôkakyû":{"d":0.45},
 "c0|Sharingan":{"cd":11},
 "c0|Susanô : Totsuka":{"d":1.32},
 "c10|Défi éternel":{"cd":7.7,"d":1.725},
 "c10|Esquive du fauve":{"cd":9.0,"d":1.62},
 "c10|Huit Portes":{"d":0.703,"cd":26.4},
 "c10|Konoha Daisenpû":{"d":1.201,"cd":11.0},
 "c10|Konoha Gôriki Senpû":{"cd":13.2,"d":1.194},
 "c10|Lotus caché":{"d":0.809,"cd":26.4},
 "c10|Paon du matin":{"d":1.108,"cd":17.6},
 "c10|Poids retirés":{"d":2.431,"cd":6.0},
 "c10|Portes célestes":{"cd":13.2,"d":1.3},
 "c10|Éléphant du soir":{"d":0.821,"cd":17.6},
 "c11|Arbre millénaire":{"d":0.329,"cd":17.6},
 "c11|Fleur carnivore":{"d":0.465},
 "c11|Floraison mortelle":{"d":0.886},
 "c11|Graine épineuse":{"d":0.507},
 "c11|Liane étrangleuse":{"d":0.415},
 "c12|Grande Kamaitachi":{"d":0.936},
 "c12|Invocation : Kamatari":{"d":0.587},
 "c12|Kamaitachi":{"d":0.647},
 "c12|Rafale de l'éventail":{"cd":11.0,"ck":15},
 "c12|Tempête tranchante":{"d":0.658},
 "c13|Arc d'or : Kumo Senkyû":{"ck":35,"cd":17.5},
 "c13|Armure d'or":{"cd":8.5},
 "c13|Fil d'araignée":{"d":0.675},
 "c13|Filet d'araignée":{"d":0.67},
 "c13|Invocation : Araignée géante":{"d":0.346,"cd":26.4},
 "c14|Armée de marionnettes":{"d":1.157},
 "c14|Brume toxique":{"cd":13.2,"d":1.035},
 "c14|Fils de chakra":{"cd":10.5},
 "c14|Kuroari":{"d":0.625},
 "c14|Senbon empoisonnés":{"d":0.578},
 "c15|Aiguilles de sang":{"d":0.379,"cd":7.7},
 "c15|Fouet de sang":{"cd":11.0,"d":0.776},
 "c15|Ketsuryûgan : Lune de sang":{"d":0.777},
 "c15|Ketsuryûgan : Paralysie":{"cd":11.5},
 "c15|Ketsuryûgan : Sang bouillant":{"d":0.704},
 "c16|Cocon de papier":{"d":0.607},
 "c16|Lance de papier":{"d":0.626},
 "c16|Mer de papiers explosifs":{"d":0.543},
 "c16|Papillons shikigami":{"d":0.666},
 "c16|Shuriken de papier":{"d":0.433,"cd":6.5},
 "c17|Danse des mille ombres":{"d":0.587,"ck":50},
 "c17|Kage shuriken":{"d":0.596},
 "c17|Pluie de shuriken":{"d":0.456},
 "c17|Shuriken du croissant":{"d":0.696},
 "c17|Shuriken traceur":{"d":0.551},
 "c18|Fusion avec Samehada":{"cd":20.0,"d":0.466},
 "c18|Samehada : Morsure":{"cd":7.5},
 "c18|Suiton : Daikôdan":{"d":0.407},
 "c18|Suiton : Prison aqueuse":{"d":0.525},
 "c18|Suiton : Requins voraces":{"d":0.458},
 "c19|Kubikiribôchô : Décapitation":{"d":0.369,"cd":26.4},
 "c19|Suika : Contre-courant":{"cd":10.5},
 "c19|Suika : Corps-déluge":{"d":0.412},
 "c19|Suika : Gôwan":{"d":0.621},
 "c19|Suirendan":{"d":0.457},
 "c1|Byakugan":{"cd":7.5,"ck":10},
 "c1|Hakke : 64 / 128 points":{"d":0.875},
 "c1|Hakke Kûshô":{"d":0.457},
 "c1|Jûho Sôshiken":{"d":0.638},
 "c1|Kaiten":{"d":1.108},
 "c20|Hyôton : Dragon de glace":{"d":0.653},
 "c20|Hyôton : Sensatsu Suishô":{"d":0.536},
 "c20|Hyôton : Tsubame Fubuki":{"d":0.399},
 "c20|Makyô Hyôshô":{"d":0.464},
 "c20|Miroir de glace":{"d":2.2,"cd":11.0},
 "c21|Battô : Coupe du fourreau":{"cd":6.0,"d":1.644},
 "c21|Iai : Passage du vent":{"d":0.974,"cd":17.6},
 "c21|Iai : Tranche-ciel":{"d":0.957,"cd":26.4},
 "c21|Jûmonji : Coupe en croix":{"d":1.148,"cd":13.2},
 "c21|Kamae : Posture du roc":{"cd":4.5,"d":1.495},
 "c21|Kengeki : Croissant de chakra":{"d":0.888,"cd":11.0},
 "c21|Kiai : Cri de guerre":{"cd":9.0,"d":1.08},
 "c21|Nanabana : Sept fleurs de l'aube":{"d":0.58,"cd":26.4},
 "c21|Tetsu no Yoroi : Armure du Pays du Fer":{"cd":17.6,"d":0.82},
 "c21|Ukenagashi : Lame qui détourne":{"cd":10.5,"d":1.3},
 "c22|Buki Shôkan : Arsenal volant":{"d":0.78,"cd":17.6},
 "c22|Fundo : Masse à chaîne":{"d":1.751,"cd":11.0},
 "c22|Kunai Ori : Cage de kunai":{"cd":13.2,"d":0.806},
 "c22|Kunai Rendan : Volée de kunai":{"d":0.761,"cd":7.7},
 "c22|Kusarigama : Tourbillon":{"d":1.173,"cd":17.6},
 "c22|Kôkinjô : Corde d'or":{"d":0.538,"cd":26.4},
 "c22|Makimono : Arme lourde":{"cd":11.0,"d":1.512},
 "c22|Sôshôryû":{"d":0.449,"cd":26.4},
 "c22|Tonfa : Contre":{"cd":4.5,"d":1.61},
 "c22|Ôtsuchi : Marteau écraseur":{"d":0.961,"cd":13.2},
 "c2|Kage Kubi Shibari":{"d":0.533},
 "c2|Kage Mane":{"d":0.596},
 "c2|Kage Nui":{"d":0.67},
 "c2|Ombres liées":{"d":2.036},
 "c2|Plan du stratège":{"cd":7.5},
 "c3|Chôdan Bakugeki":{"d":0.591},
 "c3|Décuplement partiel":{"cd":13.0},
 "c3|Paume géante":{"d":0.908},
 "c3|Pilule rouge : Mode Papillon":{"cd":26.4,"ck":50},
 "c3|Pilule verte":{"cd":7.5,"ck":9},
 "c4|Essaim d'insectes":{"d":0.418,"cd":12.5},
 "c4|Insectes chercheurs":{"d":1.088},
 "c4|Insectes espions":{"d":2.132,"cd":7.0},
 "c4|Mur d'insectes":{"d":1.392},
 "c4|Nuée destructrice":{"d":0.351,"cd":26.0},
 "c5|Garôga":{"d":0.778},
 "c5|Gatsûga":{"d":1.172},
 "c5|Loup bicéphale":{"cd":26.4,"ck":42},
 "c5|Marquage":{"d":1.387},
 "c5|Shikyaku":{"cd":11,"ck":17},
 "c6|Cage adamantine":{"d":0.442},
 "c6|Chaîne-harpon":{"d":0.839},
 "c6|Entrave du démon":{"d":0.575},
 "c6|Kunai à sceau":{"d":0.39,"cd":4.0},
 "c6|Sceaux : Détonation":{"cd":13.0,"ck":25},
 "c7|Kunai fleuri":{"d":0.549},
 "c7|Pollen hypnotique":{"cd":11.0},
 "c7|Shinranshin":{"d":0.667},
 "c7|Shintenshin":{"cd":26.4,"ck":50},
 "c7|Tempête de pétales":{"d":0.458},
 "c8|Bouclier absolu":{"d":1.246},
 "c8|Cercueil de sable":{"d":2.2,"cd":7.0},
 "c8|Funérailles du désert":{"d":0.632},
 "c8|Sable mouvant":{"d":0.708},
 "c8|Tsunami de sable":{"d":0.788},
 "c9|Danse de la clématite":{"d":0.414},
 "c9|Danse des fougères":{"d":0.518},
 "c9|Danse du mélèze":{"cd":13.0,"ck":25},
 "c9|Danse du saule":{"d":1.72},
 "c9|Doigts-balles":{"d":0.567},
 "f0|Byakugô":{"cd":16.2,"ck":37},
 "f0|Pilule du soldat":{"cd":7.5,"ck":10},
 "f0|Ranshinshô : Chaos nerveux":{"d":0.98},
 "f0|Scalpel de chakra":{"cd":5.5},
 "f1|Barrière Shishienjin":{"d":0.568},
 "f1|Hiraishin : Danse de l'éclair jaune":{"cd":26.4,"ck":50},
 "f1|Hiraishin : Kunai marqué":{"d":0.988},
 "f1|Hiraishin : Éclair jaune":{"cd":8.5},
 "f1|Kunai à parchemin explosif":{"d":0.52},
 "f2|Genjutsu : Ténèbres":{"d":0.622},
 "f2|Genjutsu : Étreinte de l'arbre":{"d":0.571},
 "f2|Sharingan : Œil copieur":{"cd":16.2,"ck":37},
 "f3|Chiens ninja":{"d":0.804},
 "f3|Invocation : Crapaud":{"d":0.426},
 "f3|Invocation : Katsuyu":{"cd":13.0,"ck":21},
 "f3|Invocation : Manda":{"d":0.556},
 "f3|Kuchiyose : Rashômon":{"cd":6.0},
 "f4|Fûma Shuriken":{"d":0.875},
 "f4|Multiclonage de shuriken":{"d":0.692},
 "f4|Shuriken Kaiten : Ronde des shuriken":{"d":0.749},
 "f4|Sôfûsha : Shuriken à fil":{"d":1.101},
 "f5|Clone explosif":{"d":0.483},
 "f5|Contre du clone":{"cd":11.0,"ck":15},
 "f5|Kage Bunshin : leurre":{"cd":5.5},
 "f5|Multiclonage":{"d":0.554},
 "f5|Rasengan":{"d":1.015},
 "f6|Concentration du chakra":{"cd":7.5,"ck":10},
 "f6|Fûton : Rasenshuriken":{"d":0.362,"cd":26.4},
 "f6|Mode Ermite":{"cd":10.0,"ck":21},
 "f6|Senpô : Kawazu Kumite":{"cd":8.5},
 "f6|Senpô : Kebari Senbon":{"d":1.958},
 "f7|Argile explosive":{"d":0.497},
 "f7|Chakra de Kyûbi":{"cd":17.5},
 "f7|Marque de Jashin":{"cd":7.5,"ck":9},
 "f7|Serpents de l'ombre":{"d":0.51},
 "f7|Shiki Fûjin":{"d":0.725},
 "n0|Katon : Boule de feu suprême":{"cd":7.2},
 "n0|Katon : Dragon de feu":{"d":0.721},
 "n0|Katon : Flamme":{"d":0.862},
 "n0|Katon : Fournaise":{"d":0.97},
 "n0|Katon : Grand souffle de feu":{"d":1.159},
 "n0|Katon : Mur de feu":{"d":1.349},
 "n0|Katon : Nuée ardente":{"d":0.708},
 "n0|Katon : Shuriken de feu aériens":{"d":1.058},
 "n0|Katon : Tornade de feu":{"d":0.88},
 "n0|Katon : Triple flamme":{"d":0.928},
 "n1|Suiton : Bakusui Shôha":{"d":0.434},
 "n1|Suiton : Daibakufu":{"d":0.632},
 "n1|Suiton : Dragon aqueux":{"d":1.09},
 "n1|Suiton : Dôme des requins":{"d":0.723},
 "n1|Suiton : Kirigakure":{"cd":7.2},
 "n1|Suiton : Mizurappa":{"d":1.492},
 "n1|Suiton : Suijinheki":{"cd":5.0,"d":1.23},
 "n1|Suiton : Suikôdan":{"d":1.569},
 "n1|Suiton : Suirô":{"d":1.156},
 "n1|Suiton : Teppôdama":{"cd":4.5},
 "n2|Fûton : Balle d'air":{"d":0.87},
 "n2|Fûton : Balles chargées":{"d":0.739},
 "n2|Fûton : Couloir de vent":{"d":0.48},
 "n2|Fûton : Grande balle d'air":{"d":1.183},
 "n2|Fûton : Lame d'air":{"d":1.05},
 "n2|Fûton : Mur de vent":{"cd":4.5},
 "n2|Fûton : Souffle":{"d":1.133},
 "n2|Fûton : Tornade":{"d":0.853},
 "n2|Fûton : Triple balle d'air":{"d":1.08},
 "n3|Chidori":{"d":1.053},
 "n3|Raiton : Armure de foudre":{"d":0.352,"cd":23.5},
 "n3|Raiton : Chidori Eisô":{"d":0.827},
 "n3|Raiton : Chidori Nagashi":{"d":1.213},
 "n3|Raiton : Kage Bunshin":{"d":1.437},
 "n3|Raiton : Kirin":{"d":0.854},
 "n3|Raiton : Orage":{"d":1.15},
 "n3|Raiton : Panthère noire":{"d":2.013},
 "n3|Raiton : Éclair":{"d":1.283},
 "n4|Doton : Chute de montagne":{"d":1.071},
 "n4|Doton : Doryûheki":{"d":1.12},
 "n4|Doton : Doryûsô":{"d":0.765},
 "n4|Doton : Dragon de terre":{"d":1.033},
 "n4|Doton : Grand séisme":{"d":1.333},
 "n4|Doton : Kajûgan":{"d":1.281},
 "n4|Doton : Kyôka":{"d":1.828},
 "n4|Doton : Main de terre":{"d":1.461},
 "n4|Doton : Rocher":{"d":0.832},
 "n4|Doton : Yomi Numa":{"d":0.455},
 "t0|Dynamic Entry":{"d":1.134},
 "t0|Konoha Senpû":{"d":1.242},
 "t0|Lotus primaire":{"d":0.714,"cd":13.5},
 "t0|Tsûtenkyaku : Talon céleste":{"d":0.871},
 "t0|Ôkashô":{"d":0.835},
 "t1|Ashigiri : Coupe aux jarrets":{"cd":8.5,"d":1.04},
 "t1|Iai : Dégainé éclair":{"cd":6.0,"d":1.08},
 "t1|Kaiten-giri : Tourbillon d'acier":{"d":1.156},
 "t1|Mikazuki no Mai : Danse du croissant":{"d":0.723},
 "t1|Ranbu : Tempête de lames":{"d":1.067},
 "t2|Ashibarai : Balayage":{"d":1.08},
 "t2|Hyaku Buki : Ruée des cent armes":{"cd":15.0,"d":0.94},
 "t2|Kongô Nyoi : Bâton infini":{"d":0.867},
 "t2|Kusarigama : Harpon":{"d":1.04},
 "u|Hiraishin":{"cd":16.0},
 "u|Kage Bunshin : leurre":{"cd":22.5},
 "u|Kawarimi":{"d":2.2,"cd":6.5},
 "u|Kunai à fil":{"d":1.078},
 "u|Roulade":{"cd":3.0},
 "u|Saut ninja":{"d":0.888},
 "u|Shunshin":{"cd":12.5}
};
/*NR_TREE*/
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
 ['Robe de Kage',{legs:'#e8e6de',torso:'#efeee8',robe:'#efeee8',trim:'#c0202a',arm:'#efeee8',belt:'#c0202a',boot:'#5a4a3a',hatC:'#c0202a',hatK:'火'}],['Manteau du Hokage',{legs:'#26365a',torso:'#26365a',vest:'#5a6e3a',arm:'#26365a',haori:'#f2f0ea',hsl:1,trim:'#d03a2a',hkan:'火影',belt:'#1a2238',boot:'#1a2238'}],
 ['Tenue de Sannin',{legs:'#5a6a3a',torso:'#5a6a3a',arm:'#5a6a3a',haori:'#b8302a',dots:'#e8c040',belt:'#2a2a2a',boot:'#7a5a3a'}],['Haori vert',{legs:'#2a3550',torso:'#9a9aa6',arm:'#9a9aa6',haori:'#4a8a4a',hsl:1,belt:'#2a3a6a',boot:'#2a2a33'}],
 ['Tenue du serpent',{legs:'#3a3a48',torso:'#d8d2c0',robe:'#d8d2c0',rshort:1,arm:'#d8d2c0',rope:'#6a3a9a',boot:'#2a2a33'}],['Veste lavande',{legs:'#2a2a50',torso:'#e2dcee',arm:'#e2dcee',belt:'#8a6ab0',boot:'#2a2a50'}],
 ['Long manteau',{legs:'#3a3a42',torso:'#6a7466',robe:'#6a7466',arm:'#6a7466',collar:'#5e685a',hood:'up',boot:'#2a2a33'}],['Veste à fourrure',{legs:'#2a2a38',torso:'#5a5a64',arm:'#5a5a64',fur:'#ece6da',belt:'#2a2a38',boot:'#2a2a33'}],
 ['Manteau rouge de Suna',{legs:'#3a2a2a',torso:'#8a2a2a',robe:'#8a2a2a',arm:'#8a2a2a',sash:'#d8d0c0',boot:'#3a2a1a'}],['Combinaison à capuche',{legs:'#1c1c24',torso:'#1c1c24',arm:'#1c1c24',hood:'chat',belt:'#5a4a8a',boot:'#222'}],
 ['Armure Akimichi',{legs:'#3a3a40',torso:'#3a3a40',armor:'#b02a2a',arm:'#3a3a40',belt:'#d8c060',boot:'#222'}],['Tenue violette',{legs:'#e8e2d6',torso:'#7a4a9a',robe:'#7a4a9a',rshort:1,arm:'skin',boot:'#3a2a4a'}],
 ['Tenue chinoise rose',{legs:'#4a5a3a',torso:'#e88aa8',arm:'#e88aa8',belt:'#c03a5a',boot:'#2a2a33'}],
 // tenues ajoutées (toujours à la fin : l'indice des anciennes ne change pas) ; nouveaux drapeaux : jupe jupe courte, samurai plaques d'armure, obi large ceinture nouée,
 // kcol col croisé de kimono, hlong haori long, vband bandes du gilet, spiral tourbillon rouge dans le dos, stripes anneaux sur bras et jambes, torso 'skin' torse nu, hatC / hatK chapeau de Kage
 ['Chûnin de Suna',{legs:'#5a4a38',torso:'#6a5a44',vest:'#c8b896',arm:'#6a5a44',belt:'#3a2a1a',boot:'#3a2a1a'}],['Chûnin de Kiri',{legs:'#3a4a5a',torso:'#4a5a6a',vest:'#6a7a6a',vband:1,arm:'#4a5a6a',belt:'#2a3038',boot:'#2a3038'}],
 ['Chûnin de Kumo',{legs:'#2a2a30',torso:'#2a2a30',vest:'#ece6d4',arm:'#2a2a30',belt:'#4a4a52',boot:'#222'}],['Chûnin d\'Iwa',{legs:'#5a4a3a',torso:'#8a2a24',vest:'#6a6a58',arm:'#8a2a24',belt:'#3a2a1a',boot:'#3a2a1a'}],
 ['Jônin de Konoha',{legs:'#1f2c48',torso:'#26365a',vest:'#5a6e3a',spiral:1,arm:'#26365a',belt:'#1a2238',boot:'#1a2238'}],['Anbu à cape',{legs:'#2a2a30',torso:'#3a3a42',armor:'#c8ccd4',cape:'#d8d8de',arm:'#2a2a30',belt:'#555',boot:'#222'}],
 ['Anbu de la Racine',{legs:'#1a1a20',torso:'#24242a',armor:'#4a4a54',arm:'#24242a',sash:'#4a4a54',belt:'#333',boot:'#1a1a1a'}],['Akatsuki ouvert',{legs:'#2a2a33',torso:'skin',haori:'#16161c',hlong:1,hsl:1,clouds:1,arm:'#16161c',boot:'#2a2a33'}],
 ['Robe du Kazekage',{legs:'#e8e6de',torso:'#efeee8',robe:'#efeee8',trim:'#2a5aa8',yoke:'#2a5aa8',arm:'#efeee8',belt:'#2a5aa8',boot:'#5a4a3a',hatC:'#2a5aa8',hatK:'風'}],
 ['Robe du Mizukage',{legs:'#e8e6de',torso:'#efeee8',robe:'#efeee8',trim:'#2a8aa8',arm:'#efeee8',belt:'#2a8aa8',boot:'#5a4a3a',hatC:'#2a8aa8',hatK:'水'}],
 ['Robe du Raikage',{legs:'#e8e6de',torso:'#efeee8',robe:'#efeee8',trim:'#e0b020',arm:'#efeee8',belt:'#e0b020',boot:'#5a4a3a',hatC:'#e0b020',hatK:'雷'}],
 ['Robe du Tsuchikage',{legs:'#e8e6de',torso:'#efeee8',robe:'#efeee8',trim:'#4a8a3a',arm:'#efeee8',belt:'#4a8a3a',boot:'#5a4a3a',hatC:'#4a8a3a',hatK:'土'}],
 ['Tenue de Sakura (Shippûden)',{legs:'#3a3a40',torso:'#c8283a',arm:'skin',jupe:'#f0a0b8',belt:'#3a3a40',boot:'#3a3a40'}],['Tenue de Zabuza',{legs:'#8a9098',torso:'skin',arm:'#8a9098',stripes:'#3a4048',sash:'#4a3a2a',belt:'#4a3a2a',warm:'#8a9098',boot:'#2a2a33'}],
 ['Armure de samouraï',{legs:'#2a2a38',torso:'#3a3a48',arm:'#3a3a48',samurai:'#8a2a2a',belt:'#d8c060',boot:'#2a2a33'}],['Kimono',{legs:'#e8e2d6',torso:'#3a5a9a',robe:'#3a5a9a',arm:'#3a5a9a',obi:'#e8c040',kcol:'#f0ece0',boot:'#5a4a3a'}],
 ['Kimono fleuri',{legs:'#e8e2d6',torso:'#e88aa8',robe:'#e88aa8',arm:'#e88aa8',obi:'#c0283a',kcol:'#f6f2ea',dots:'#ffffff',boot:'#5a4a3a'}],['Haori de combat',{legs:'#2a2a33',torso:'#5a5a64',arm:'#5a5a64',haori:'#1c1c24',hsl:1,trim:'#c03a2a',belt:'#2a2a33',boot:'#2a2a33'}],
 ['Tenue de Kabuto',{legs:'#4a3a6a',torso:'#5a4a7a',arm:'#5a4a7a',jupe:'#e8e2d6',belt:'#e8e2d6',boot:'#2a2a33'}],['Tenue de Danzô',{legs:'#3a3a40',torso:'#4a4a50',robe:'#4a4a50',arm:'#4a4a50',sash:'#ece8de',collar:'#4a4a50',boot:'#2a2a33'}],
 ['Kimono noir de Temari',{legs:'#2a2a38',torso:'#2a2a38',robe:'#2a2a38',rshort:1,arm:'#2a2a38',obi:'#c0283a',kcol:'#f0ece0',boot:'#2a2a38'}],['Tenue d\'Oto',{legs:'#5a5048',torso:'#d8d2c0',arm:'#d8d2c0',rope:'#6a3a9a',kcol:'#5a5048',boot:'#2a2a33'}],
 ['Gilet et combinaison verte',{legs:'#3f8f3a',torso:'#3f8f3a',vest:'#5a6e3a',arm:'#3f8f3a',belt:'#c03a2a',warm:'#f08a24',boot:'#c8b080'}]];
const COIFS=[['Pics','pics'],['Lisses','lisse'],['Queue haute','queue'],['Courts','courts'],['Chignons','chignons'],['Crâne rasé','chauve'],
 ['Mèches de canard','sasuke'],['Carré court','carre'],['Pics obliques','kakashi'],['Queue basse','itachi'],['Demi-queue et mèche','deidara'],['Pics de requin','requin'],['Ébouriffés','sasori'],['Plaqués en arrière','plaque'],
 ['Pics hérissés','pain'],['Chignon et fleur','konan'],['Crinière d\'ermite','jiraiya'],['Deux queues basses','tsunade'],['Longs raides','orochimaru'],['Pics et longues mèches','minato'],['Longs attachés','neji'],
 ['Coupe au bol','bol'],['Ananas','ananas'],['Pics sous bandeau','choji'],['Longue queue et mèche','ino'],['Sauvages','kiba'],['Coupe hime','hinata'],['Courts en pics','gaara'],['Quatre couettes','temari'],
 ['Iroquoise','iroquoise'],['Rasé sur les côtés','rase'],['Longs détachés','longs'],['Tresse','tresse'],['Chignon haut','chignon1'],['Coupe lisse','sai'],['Hérissés courts','obito'],['Crinière de guerrier','madara'],['Afro','afro'],['Couettes hautes','couettes'],['Pics dressés','konohamaru'],['Mi-longs en mèches','milongs']];
const HAIRC=[['Blond','#f2c84a'],['Noir','#1a1a22'],['Rose','#f08ab0'],['Roux','#c0482a'],['Blanc','#e8e8f0'],['Brun','#6b4a2a'],['Bleu nuit','#2a3a6a'],['Rouge','#b8202a'],['Argenté','#c8ccd6'],['Gris','#8a8a92'],['Orange','#e8702a'],['Lavande','#7a6ab8'],['Blond pâle','#f2e09a'],['Bleu acier','#3a5a8a'],['Châtain foncé','#3a2618'],['Noir bleuté','#1c2238'],['Bleu ciel','#6ab0e8'],['Vert','#3a8a4a'],['Violet','#6a3a9a'],['Turquoise','#2ab0b0'],['Rose vif','#e04a8a'],['Bordeaux','#6a1a2a'],['Blond cendré','#d8c89a'],['Roux cuivré','#a0502a'],['Gris bleuté','#7a8aa0'],['Blanc neige','#fafaf6']];
const PEAUX=[['Claire','#f6d6b4'],['Mate','#e0b08a'],['Hâlée','#b8805a'],['Foncée','#7a5038'],['Pâle','#e8e0e8'],['Bleu requin','#7c9cb4'],['Blafarde','#f0eee6'],['Rosée','#fae2d0'],['Ébène','#5a3a28'],['Olive','#c8a070'],['Dorée','#e8c090'],['Cuivrée','#a06a48'],['Ivoire','#f8ece0'],['Grise','#b0aca4']];
const CHAKRAS=[['Bleu','#3af'],['Rouge','#f33'],['Vert','#3f6'],['Violet','#a5f'],['Orange','#f93'],['Blanc','#eef'],['Jaune','#fd3']];
const ACCS=[['Aucun',''],['Masque','masque'],['Lunettes noires','lunettes'],['Lunette de visée','visee'],['Chapeau de Kage','kage'],['Masque Anbu','anbu'],['Fleur de papier','fleur'],
 ['Lunettes de protection','goggles'],['Boucles d\'oreilles','boucles'],['Cache-œil','cacheoeil'],['Bandages du visage','bandvis'],['Chapeau de paille (Akatsuki)','paille'],['Masque à spirale','tobi'],['Masque de renard','renard'],['Casque de samouraï','kabuto'],['Bandana','bandana'],['Lunettes rondes','lunrondes']];
// marques du visage (certaines changent les yeux : Rinnegan, yeux de serpent, yeux de requin, yeux ronds)
const FACES=[['Aucune',''],['Moustaches','moust'],['Crocs rouges','marques'],['Cernes','cernes'],['Tatouage « amour »','gaara'],['Losange','losange'],['Spirales','spirales'],['Traits d\'ermite','ermite'],
 ['Branchies','branchies'],['Rinnegan et piercings','pain'],['Fard du serpent','fard'],['Rides et barbiche','rides'],['Gros sourcils','sourcils'],['Peinture de guerre','kankuro'],['Cicatrice','cicatrice'],['Barbe','barbe'],
 ['Marque maudite','maudite'],['Cicatrice de l\'œil','cicoeil'],['Taches de rousseur','rousseur'],['Joues roses','rougeur'],['Coutures','coutures'],['Points Kaguya','kaguya'],['Moustaches du Kyûbi','kyubi'],['Sceau de l\'oiseau en cage','cage'],['Lèvres rouges','levres'],['Pigments du Mode Ermite','sennin']];
// façon de porter le bandeau
const BANDS=[['Au front','front'],['Œil caché','oblique'],['Barré (renégat)','barre'],['Serre-tête','tete'],['Au cou','cou'],['À la taille','taille'],['Au bras','bras'],['Cornes d\'ermite','cornes'],['Sans bandeau','']];
// porté dans le dos
const BACKS=[['Rien',''],['Gourde de sable','gourde'],['Grand parchemin','parchemin'],['Épée bandée','samehada'],['Faux tripale','faux'],['Éventail géant','eventail'],['Fûma shuriken','fuma'],['Katana','katana'],
 ['Kubikiribôchô','kubi'],['Marionnette (Karasu)','karasu'],['Épée de Sasuke','kusanagi'],['Rouleaux de Tenten','rouleaux'],['Bâton','baton'],['Sac de voyage','sac'],['Sabre bandé double','hirame']];
// réglages d'apparence ajoutés (champs l.e, l.o, l.s, l.z, l.w, l.r, l.n : absents d'une ancienne sauvegarde = 0 = valeur d'origine)
// yeux : couleur (#…) ou dôjutsu purement cosmétique (Sharingan et Byakugan reprennent le dessin des clans, le reste passe par eyeSpecial)
const EYES=[['Selon le clan',''],['Noirs','#2a2a38'],['Bleus','#3a7ad8'],['Bleu ciel','#5ab8f0'],['Verts','#3aa85a'],['Ambre','#d89a3a'],['Gris','#8a8a9a'],['Violets','#8a5ad0'],['Turquoise','#2ab8b8'],['Bruns','#7a4a2a'],
 ['Sharingan','=#e01a1a'],['Mangekyô Sharingan','*mgk'],['Byakugan','=#e8e8f8'],['Rinnegan','*rin'],['Yeux de serpent','*ser'],['Yeux de crapaud','*toad'],['Yeux de requin','*req'],['Yeux ronds','*rond'],['Ketsuryûgan','*ci_k'],['Yeux fermés','*closed']];
// couleurs de tenue : principale (remplace la couleur du haut) et secondaire (gilet, haori, pantalon…)
const TENCOL=[['D\'origine',''],['Noir','#1c1c24'],['Blanc','#eeece6'],['Rouge','#c0282a'],['Bordeaux','#6a1a24'],['Orange','#f08a24'],['Jaune','#e8c030'],['Vert','#3f8f3a'],['Kaki','#5a6e3a'],['Vert sapin','#2a4a32'],
 ['Bleu','#2a5aa8'],['Bleu marine','#1f2c48'],['Bleu ciel','#6ab0e0'],['Violet','#6a3a9a'],['Lavande','#b8a8e0'],['Rose','#e88aa8'],['Brun','#6a4a2a'],['Beige','#c8b48a'],['Gris','#7a7a84'],['Anthracite','#3a3a42']];
// taille et carrure : purement visuelles (même zone de coups, même cercle d'équipe)
const TAILLES=[['Normale',1],['Petite',.93],['Grande',1.07]],CARRURES=[['Normale',1],['Mince',.88],['Costaude',1.15]];
const ARMS=[['Rien',''],['Bandages aux bras','bandages'],['Bandages bras et jambes','bandall'],['Gants noirs','gants'],['Protège-bras','protege'],['Bracelets d\'or','bracelets'],['Bague et vernis','bague'],['Tatouage Anbu','tatouage'],['Gantelets de métal','gantelets']];
const NECKS=[['Rien',''],['Écharpe rouge','echarpe'],['Longue écharpe bleue','echlong'],['Collier de Tsunade','tsunade'],['Pendentif de Jashin','jashin'],['Chapelet','chapelet'],['Collier à anneaux','anneaux'],['Foulard','foulard'],['Collier de crocs','crocs']];
// 2e passe : ceinture et équipement, vêtement par-dessus la tenue, symbole dans le dos, couleur du bandeau, couleur du masque et de l'écharpe (champs l.g, l.m, l.y, l.q, l.x)
const GEARS=[['Rien',''],['Porte-kunai à la cuisse','holster'],['Pochette dans le dos','pouch'],['Porte-kunai et pochette','both'],['Parchemins à la ceinture','scrolls'],['Clochettes à la ceinture','bells']];
const OVERS=[['Rien',''],['Haori de Hokage (flammes)','hokage'],['Haori rouge d\'ermite','ermite'],['Manteau de l\'Akatsuki','akatsuki'],['Cape de voyage','voyage'],['Cape noire','noire']];
const OVERL={hokage:{haori:'#f2f0ea',hsl:1,trim:'#d03a2a',hkan:'火影'},ermite:{haori:'#b8302a'},akatsuki:{haori:'#16161c',hlong:1,hsl:1,clouds:1},voyage:{cape:'#6a5038'},noire:{cape:'#1c1c24'}};
const SYMS=[['Aucun',''],['Éventail Uchiha','uchiha'],['Spirale Uzumaki','uzumaki'],['Symbole Senju','senju'],['Symbole Hyûga','hyuga'],['Symbole Nara','nara'],['Symbole Akimichi','akimichi'],['Kanji « Feu »','feu'],['Kanji « Amour »','amour'],['Nuage de l\'Akatsuki','nuage']];
const BANDC=[['D\'origine',''],['Bleu marine','#1f3a6a'],['Noir','#1c1c24'],['Gris','#5a5a64'],['Rouge','#a82a2a'],['Violet','#5a3a8a'],['Vert','#2f5a32'],['Blanc','#e8e6e0'],['Rose','#d87aa0'],['Brun','#5a3a22'],['Bleu ciel','#5a9ad0']];
const EYEF={pain:'rin',fard:'ser',branchies:'req',sourcils:'rond',sennin:'toad'}; // yeux propres à certaines marques (si le clan n'en impose pas)
// le clan se voit : Sharingan, Byakugan, carrure Akimichi, marques Kaguya, chien Inuzuka, gourde Sabaku (pas pour les marionnettistes) ; l'arme suit le style de combat
function ninjaLook(l,clan,style){const v=VILLAGES[l.v],S=STYLES[style]||STYLES[0],T=TENUES[l.t][1],sk=PEAUX[l.p][1],f=FACES[l.f|0][1],bk=BACKS[l.d|0][1];
 const o=Object.assign({},T,T.arm==='skin'?{arm:sk}:{},clan===3?{scale:1.14,belly:1}:{},clan===5?{dog:1}:{},(clan===8&&S[0]!=='Marionnette')||bk==='gourde'?{gourd:1}:{},bk&&bk!=='gourde'?{back:bk}:{},
 {head:{t:'ninja',skin:sk,hair:HAIRC[l.h][1],style:COIFS[l.c][1],band:v[1],vil:l.v,bs:BANDS[l.b|0][1],acc:ACCS[l.a][1],face:f,eyeT:EYEF[f]||null,eye:clan===0?'#e01a1a':clan===1?'#e8e8f8':null,kaguya:clan===9||f==='kaguya',brows:clan===TAIJ||f==='sourcils'},weapon:{t:'kunai',k:S[4],col:CHAKRAS[l.k][1]}});
 if(T.torso==='skin')o.torso=sk;tenueCols(o,T,l);
 // par-dessus (haori, manteau, cape) : ne remplace pas une pièce déjà portée par la tenue
 {const ov=OVERL[(OVERS[l.m|0]||OVERS[0])[1]];if(ov){const hasH=T.haori,hasC=T.cape;if(ov.haori&&!hasH){o.haori=ov.haori;o.hsl=ov.hsl||0;o.hlong=ov.hlong||0;o.hov=1;o.htrim=ov.trim||null;if(ov.hkan)o.hkan=ov.hkan;if(ov.clouds)o.clouds=1}else if(ov.cape&&!hasC)o.cape=ov.cape}}
 {const gr=(GEARS[l.g|0]||GEARS[0])[1],sy=(SYMS[l.y|0]||SYMS[0])[1],bc=(BANDC[l.q|0]||BANDC[0])[1],mc=(TENCOL[l.x|0]||TENCOL[0])[1];if(gr)o.gear=gr;if(sy)o.sym=sy;if(bc)o.head.band=bc;if(mc){o.maskC=mc;o.head.maskC=mc}}
 const ar=(ARMS[l.r|0]||ARMS[0])[1],nk=(NECKS[l.n|0]||NECKS[0])[1];if(ar)o.armAcc=ar;if(nk)o.neck=nk;
 {const bh=(TAILLES[l.z|0]||TAILLES[0])[1],bw=(CARRURES[l.w|0]||CARRURES[0])[1];if(bh!==1)o.bh=bh;if(bw!==1)o.bw=bw}
 if(CLOOK[clan])CLOOK[clan](o,l,S);
 // torse nu ou bras nus : suivent la peau donnée par le clan (Hoshigaki bleu…)
 if(T.torso==='skin')o.torso=o.head.skin;if(T.arm==='skin')o.arm=o.head.skin;
 // yeux choisis : passent avant ceux du clan (choix purement cosmétique)
 {const E=(EYES[l.e|0]||EYES[0])[1],h=o.head;if(E[0]==='#'){h.eye=E;h.eyeT=null}else if(E[0]==='='){h.eye=E.slice(1);h.eyeT=null}else if(E[0]==='*'){h.eye=null;h.eyeT=E.slice(1)}}
 return o}
// couleurs de tenue choisies : la principale remplace la couleur du haut partout où elle apparaît, la secondaire celle de la pièce suivante (gilet, haori, jupe, pantalon…)
const TCF=['torso','arm','legs','robe','haori','vest','hoodC','cape','collar','yoke','tunic','armor','fur','jupe','samurai','sash','warm','belt','stripes'];
function tenueCols(o,T,l){const c1=(TENCOL[l.o|0]||TENCOL[0])[1],c2=(TENCOL[l.s|0]||TENCOL[0])[1];if(!c1&&!c2)return;const p0=T.torso==='skin'?(T.robe||T.haori||T.arm):T.torso;
 const longR=T.robe&&!T.rshort,s0=(T.robe?['obi','kcol','trim','yoke','sash','belt','collar','legs']:['vest','haori','jupe','yoke','tunic','armor','samurai','cape','legs','belt']).map(k=>T[k]).find(c=>c&&c!==p0&&c!=='skin');
 if(c2&&longR&&T.clouds)o.cloudC=c2; // manteau de l'Akatsuki : la couleur 2 teinte les nuages
 for(const k of TCF.concat(T.robe?['obi','kcol','trim']:[])){const v=T[k];if(!v||v==='skin')continue;if(c1&&v===p0&&k!=='belt')o[k]=c1;else if(c2&&v===s0)o[k]=c2}}
const srcAb=src=>{const [h,k]=src.split('.');return h==='x'?NAT[k]:SRC[h].abil[+k]};
// personnage de référence pour les stats : option hero de la mécanique, sinon celui du préfixe (ka_, su_, sub_…)
const srcHero=src=>{const [h,k]=src.split('.');return h==='x'?(NAT[k]&&NAT[k].hero)||NATHERO[k.split('_')[0]]||NATHERO[k.slice(0,2)]:h};
// mudras : seulement les jutsu de NATURE (style, clan, familles, dash, Kawarimi : instantanés) ; recharge = JCD sinon celle de la mécanique bornée au barème du rang (RKB)
function jutsu(id){const J=JL[id],b=srcAb(J.src),T=TREES[J.cat],mud=T&&T.type==='nature'?MUDRAS[J.r]:0,R=RKB[J.r]||RKB.D;
 const rk=RKB[J.r]?J.r:'D',R0=RKB_CD0[rk],cd=rkCd(rk,JCD[J.n]!=null?JCD[J.n]:b.ult?R0[1]:Math.max(R0[0],Math.min(R0[1],b.cd||R0[0]))); // ancien barème → nouveau (rkCd, nr_flow.js)
 return Object.assign({},b,J.P?{P:Object.assign({},b.P,J.P)}:{},{cd,ult:false,cast:mud?mud*MUDRA_T:b.cast,mud,noTele:!b.line&&!b.tele,n:J.n,d:J.d,ex:null,src:srcHero(J.src),vfx:J.vfx,rank:J.r,jid:id,tree:J.cat})}
function styleAb(i){const S=STYLES[i],b=srcAb(S[2]);return Object.assign({},b,{n:S[0],d:S[1],ex:null,src:srcHero(S[2]),vfx:S[3],style:i})}
// dash (Espace) et Kawarimi (A) : sans rang = 0 chakra, 0 mudra ; recharge propre (D.cd) sinon celle de la mécanique bornée à 5-8 s ; dégâts × de l'ancienne ligne (JBAL) gardés
function mkDashAb(D,shun){D=D||DASHB;let s=srcAb(D.src);if(!s){D=DASHB;s=srcAb(D.src)}const q=D.key0&&JBAL[D.key0]||{};
 return Object.assign({},s,{n:D.n||s.n,d:D.d||s.d,rank:null,ult:false,cast:s.cast,mud:0,noTele:!s.line&&!s.tele,ex:null,src:srcHero(D.src),vfx:D.vfx||null,dash:shun?0:1,shun:shun?1:0,cd:D.cd||Math.max(5,Math.min(8,s.cd||6))},q.d&&q.d!==1?{bdm:q.d}:{})}
const dashAbOf=b=>mkDashAb(dashOf(b)),shunAbOf=()=>mkDashAb(SHUN,1);
// équilibrage des persos de l'anime (PREBAL[nom] = [PV, puissance], nr_pass.js) : appliqué à tout build dont le kit APPRIS est exactement celui du perso
// (même clan, nature, arbre de style, attaque de base, familles et jutsu appris ; ni la barre de départ ni le dash ne comptent, DESIGN §2 : les stats ne dépendent
// jamais de la barre). Même kit = mêmes stats, hors ligne comme en ligne (l'hôte recalcule à partir du build).
// Clans martiaux exclus : tout leur arbre est appris d'office, leur kit appris est donc celui de TOUT le clan (Rock Lee = Gaï = n'importe quel Taijutsuka) ;
// leur réglage passe par CLANBAL.
const preKitSig=b=>[b.clan,b.nat,b.st,b.w,b.fam.slice().sort((x,y)=>x-y).join('.'),b.k.slice().sort((x,y)=>x-y).join('.')].join('|');
let PRESIG=null;
function preBal(b){if(isMartial(b.clan))return[1,1];if(!PRESIG){if(typeof PRESETS==='undefined'||typeof PREBAL==='undefined')return[1,1];const A={};PRESETS.forEach((P,i)=>{const v=PREBAL[P.n];if(!v||isMartial(P.clan))return;try{const k=preKitSig(presetBuild(i,P.n,P.side));(A[k]=A[k]||[]).push(v)}catch(e){}});
  PRESIG={};for(const k in A){const L=A[k],g=j=>Math.pow(L.reduce((a,v)=>a*v[j],1),1/L.length);PRESIG[k]=[g(0),g(1)]}}
 return PRESIG[preKitSig(b)]||[1,1]}
const famBal=F=>{let h=1,p=1;for(const f of F){const v=FAMBAL[f]||[1,1];h*=v[0];p*=v[1]}const n=F.length||1;return[Math.pow(h,1/n),Math.pow(p,1/n)]};
// stats : moyenne des persos de référence des mécaniques (le style compte pour 5, les jutsu APPRIS pour 5 en tout : la barre ne change rien),
// puis CLANBAL / NATBAL / STYLEBAL / TREEBAL / FAMBAL. Le ninja « catalogue » porte tous ses jutsu appris (jab), sa barre de départ (bar0), son dash et son Kawarimi ;
// chaque unité en combat reçoit sa propre copie avec SA barre (unitCh, nr_bar.js) : abil = [style, 6 cases (null = vide), dash, Kawarimi]
function mkNinja(b,strict){b=sanitizeBuild(b,strict);const S=STYLES[b.w]||STYLES[0],a0=styleAb(b.w),jab={};for(const id of b.k){jab[id]=jutsu(id);const al=b.al&&b.al[jKey(id)];if(al)jab[id].n=al} // al : nom affiché propre au perso (ex. « Raikiri » pour le Chidori de Kakashi)
 let hp=0,pw=0,sp=0,W=0;const add=(a,w)=>{const o=SRC[a.src]||SRC[a0.src];hp+=o.hp*w;pw+=o.pw*w;sp+=o.spd*w;W+=w};add(a0,5);const wk=b.k.length?5/b.k.length:0;for(const id of b.k)add(jab[id],wk);if(!b.k.length)add(a0,5);
 hp*=S[6];pw*=S[7];if(isMartial(b.clan)){hp*=1.05;sp+=4*W} // corps surentraîné : pas de ninjutsu, mais plus solide et plus rapide
 {const cb=CLANBAL[b.clan]||[1,1],nb=b.nat>=0?NATBAL[b.nat]||[1,1]:[1,1],sb=STYLEBAL[b.w+':'+b.clan]||STYLEBAL[b.w]||[1,1],tb=TREEBAL[b.st]||[1,1],fb=b.clan<0?famBal(b.fam):[1,1],qb=preBal(b);hp*=cb[0]*nb[0]*sb[0]*tb[0]*fb[0]*qb[0];pw*=cb[1]*nb[1]*sb[1]*tb[1]*fb[1]*qb[1]}
 const lign=b.clan>=0?'Clan '+CLANS[b.clan][0]:'Sans clan',dashAb=dashAbOf(b),shunAb=shunAbOf(),bar=b.bar.slice();
 return{name:b.name,side:b.side,desc:`${lign}${b.nat>=0?' · '+NATURES[b.nat][0]:''} · ${STNAME[b.st]}`,hp:Math.round(hp/W*HPK),spd:Math.round(sp/W),pw:Math.round(pw/W*100)/100,clan:b.clan,nat:b.nat,st:b.st,fam:b.fam.slice(),
  pref:{bigfist:85,bone:90,sword:90,chain:90,fan:85,vine:85,puppet:95}[S[4]]||75,taij:isMartial(b.clan),pass:null,look:ninjaLook(b.l,b.clan,b.w),
  abil:[a0,...bar.map(id=>id>=0?jab[id]:null),dashAb,shunAb],jab,learn:b.k.slice(),bar0:bar,bar:bar.slice(),dashAb,shunAb,build:b}}
// générateur pseudo-aléatoire déterministe (mêmes ninjas adverses chez tous les joueurs en ligne)
const srnd=seed=>()=>(seed=seed*16807%2147483647)/2147483647;
// kit au hasard (bots) : clan 80 % (parmi les clans qui ont des jutsu), nature, arbre de style, attaque de base, 2 à 5 familles sans clan, jutsu appris tirés au hasard rang par rang, barre de 6 au hasard, dash au hasard
const CLANRND=()=>CLANS.map((_,i)=>i).filter(i=>RANKO.split('').some(r=>TREE['c'+i]&&TREE['c'+i][r].length));
function randomKit(r,b){const k=a=>Math.floor(r()*a.length),CR=CLANRND();b.nat=k(NATURES);b.clan=r()<.8?CR[k(CR)]:-1;b.st=k(STREE);b.fam=[];
 if(b.clan<0){const F=FAMS.map((_,i)=>i),n=2+Math.floor(r()*4);while(b.fam.length<n&&F.length)b.fam.push(F.splice(k(F),1)[0])}
 b.k=null;b.bar=null;b.w=-1;b.dsh='b';const o=sanitizeBuild(b);{const SW=stylesOf(o);o.w=SW[k(SW)]}
 const ids=[];for(const t of treesOf(o))for(const R of RANKO)ids.push(...TREE[t][R]);for(let i=ids.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
 o.k=[];for(const id of ids)if(canLearn(o.k,id))o.k.push(id);
 {const L=o.k.slice();o.bar=[];while(o.bar.length<BARN&&L.length)o.bar.push(L.splice(k(L),1)[0])}
 {const D=dashOpts(o);o.dsh=D[k(D)]}
 return sanitizeBuild(o,true)}
// apparence au hasard : les pièces très typées (chapeau de Kage, robe de Kage, peau de requin, objets dans le dos) restent rares
const RND_T=[0,1,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,37,38,39,40,41,42,43,44,45,46,47],RND_A=[0,0,0,0,0,0,1,2,3,5,6,7,9,10,15,16],RND_P=[0,0,1,1,2,3,4,7],RND_B=[0,0,0,0,0,0,0,1,3,4,5,6,8];
// cosmétiques ajoutés : tirés avec leur propre générateur (même nom et même camp = même tirage), pour ne pas changer le kit des bots
function randomCosm(l,name,side){let h=7+side;for(const c of String(name))h=(h*31+c.charCodeAt(0))%2147483646;const r=srnd(h+1),k=a=>Math.floor(r()*a.length);r();
 l.e=r()<.72?0:1+k(EYES.slice(1,10));if(r()<.08)l.e=10+k(EYES.slice(10));l.o=r()<.8?0:k(TENCOL);l.s=r()<.85?0:k(TENCOL);l.z=r()<.85?0:k(TAILLES);l.w=r()<.85?0:k(CARRURES);
 l.r=r()<.85?0:1+k(ARMS.slice(1));l.n=r()<.9?0:1+k(NECKS.slice(1)); // accessoires plus rares : des ninjas moins chargés
 l.g=r()<.85?0:1+k(GEARS.slice(1));l.m=r()<.95?0:1+k(OVERS.slice(1));l.y=r()<.92?0:1+k(SYMS.slice(1));l.q=r()<.75?0:k(BANDC);l.x=r()<.9?0:k(TENCOL);if(!l.f&&r()<.06)l.f=16+k(FACES.slice(16));return l}
function randomBuild(r,side,name){const k=a=>Math.floor(r()*a.length),o=a=>a[k(a)],l={v:side&&r()<.6?6:k(VILLAGES.slice(0,6)),t:side?(r()<.55?2:k(TENUES)):o(RND_T),c:k(COIFS),h:k(HAIRC),p:o(RND_P),k:k(CHAKRAS),a:r()<.6?0:o(RND_A)};
 l.f=r()<.65?0:1+Math.floor(r()*15);if(l.f===11&&r()<.7)l.f=0;l.b=side&&r()<.5?2:o(RND_B);l.d=r()<.8?0:1+k(BACKS.slice(1));if(l.t===12)l.t=1;
 return randomKit(r,{name,side,l:randomCosm(l,name,side)})}
const BOTN=[['Hayate','Kaito','Ren','Sora','Yuki','Haruto','Aiko','Daichi','Emi','Hikaru','Kenji','Mitsuki','Natsu','Riku','Saki','Takumi','Yori','Asuka','Jiro','Kaede'],
 ['Kurogane','Akuma','Raijin','Mizore','Shiden','Gekkô','Hebi','Kagerô','Oboro','Tetsu','Jaku','Kirisame','Yami','Rasetsu','Kuroi','Hyôga','Doku','Zangetsu','Mukuro','Shura']];
/*NR_PASS*/
// ninjas adverses : les persos de l'anime (leur kit et leur apparence, dans leur camp) + des ninjas inventés :
// moitié sur le kit d'un perso mais avec leur propre apparence (un bot n'a l'air d'un perso que s'il en porte le nom), moitié au hasard ; le nom de clan suit le prénom
const NPRE0=37; // nombre de persos de l'anime avant les ajouts : les bots copient toujours les mêmes kits
const CH={};{const r=srnd(4242);for(let s=0;s<2;s++)BOTN[s].forEach((n,i)=>{let b=randomBuild(r,s,n);if(r()<.5){const q=presetBuild(Math.floor(r()*Math.min(PRESETS.length,NPRE0)),n,s);q.l=b.l;b=q}if(b.clan>=0)b.name=n+' '+CLANS[b.clan][0];if(s&&r()<.6){b.l.t=2;b.l.v=6}CH['b'+(s*20+i)]=mkNinja(b,true)});
 PRESETS.forEach((P,i)=>{CH['a'+i]=mkNinja(presetBuild(i,P.n,P.side),true)})}
const HEROES=Object.keys(CH);
// ton ninja : la liste « Mes ninjas » (nrRoster2, nr_roster.js) le remplace au chargement ; les anciennes sauvegardes (nrBuild4/3, nrRoster1) ne sont plus lues
function legacyLook(b){const l=b&&b.l;if(l&&l.f==null){const a=l.a|0;l.f=a===2?1:a===3?2:0;l.a=a===4?2:a===1?1:0}return b}
let MY=presetBuild(0,'Ninja',0);
CH.p0=mkNinja(MY);
// ninja du créateur (toujours le sien) : en ligne, côté ami, CH.p0 est le ninja de l'hôte
let MYCH=CH.p0;
