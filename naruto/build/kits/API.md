# Écrire un kit (kits/<catégorie>.js)

> **Format v5 (arbres de compétences)** : une ligne de catalogue s'écrit désormais `[rang, mécanique, nom, description, vfx]` (sans emplacement) et la catégorie est un **arbre** : `n0-n4` natures, `t0-t2` styles (Taijutsu, Kenjutsu, Bukijutsu), `c0-c22` clans (21 Kenjutsuka, 22 Bukijutsuka), `f0-f7` familles de sub. L'ancien format à emplacement est encore accepté pendant la transition (emplacement 2 = déplacement → réserve des dashs `DASHPOOL`). Arbres, limites par rang, dashs (`DASHC/DASHN/DASHF/DASHB`), Kawarimi (`SHUN`), objets aux à n° de case (`BARAUX`) : voir les déclarations commentées en tête de `nr_kits.js`, les règles dans `nr_tree.js` et la barre de combat dans `nr_bar.js`. Plus de budget de points, de passif, de voie ni d'ultime (le cut-in passe aux jutsu de rang S). Les passages ci-dessous qui parlent d'emplacements, de points ou d'ultime décrivent l'ancien format.

Chaque fichier de `naruto/build/kits/` décrit **une catégorie** : `styles` (attaques de base), `sub` (subjutsu, sans clan),
les 5 natures (`katon`, `suiton`, `futon`, `raiton`, `doton`) et les 21 clans (`uchiha` … `yuki`, voir la table ci-dessous).
Le générateur `python3 naruto/build/mknaruto.py` assemble tout dans `naruto/index.html`.

## Clans (`CLANS` dans `nr_ninja.js` : [nom, couleur, sigle de l'icône])
| cat. | clan | fichier | préfixe | | cat. | clan | fichier | préfixe |
|---|---|---|---|---|---|---|---|---|
| c0 | Uchiha | uchiha.js | uc_ | | c11 | Hoki (plantes) | hoki.js | hk_ |
| c1 | Hyûga | hyuga.js | hy_ | | c12 | Roran (éventail, façon Temari) | roran.js | rr_ |
| c2 | Nara | nara.js | na_ | | c13 | Hakumei (araignées assassines) | hakumei.js | hm_ |
| c3 | Akimichi | akimichi.js | ak_ | | c14 | Shirogane (marionnettes) | shirogane.js | sg_ |
| c4 | Aburame | aburame.js | ab_ | | c15 | Chinoike | chinoike.js | ci_ |
| c5 | Inuzuka | inuzuka.js | in_ | | c16 | Kami | kami.js | km_ |
| c6 | Uzumaki (fûinjutsu) | uzumaki.js | uz_ | | c17 | Fûma (shuriken) | fuma.js | fm_ |
| c7 | Yamanaka | yamanaka.js | ya_ | | c18 | Hoshigaki | hoshigaki.js | hs_ |
| c8 | Sabaku | sabaku.js | sa_ | | c19 | Hôzuki | hozuki.js | hz_ |
| c9 | Kaguya | kaguya.js | kg_ | | c20 | Yuki | yuki.js | yu_ |
| c10 | Taijutsuka (`TAIJ`, sans nature) | taijutsuka.js | tj_ | | c21 | Kenjutsuka | kenjutsuka.js | kj_ |
| c22 | Bukijutsuka | bukijutsuka.js | bk_ | | c23 | Senju (Mokuton) | senju.js | sj_ |
| c24 | Ôtsutsuki (céleste) | otsutsuki.js | ot_ | | c25 | Kurama (genjutsu) | kurama.js | kr_ |
| c26 | Iburi (fumée) | iburi.js | ib_ | | c27 | Jûgo (énergie naturelle) | jugo.js | jg_ |

Les clans c23-c27 n'ont pas de style propre (ils prennent les attaques de base sans clan) et réutilisent les outils de `kits/kg_common.js` (chargé avant eux). Mur de bois Senju : murs du moteur à `vfx:'sj_wood'`, dessinés par `WALLD[vfx]` (nr_kits.js, appelé par `drawWallN`) : tout kit peut y déclarer le dessin de ses propres murs.

Les indices sont figés (sauvegardes, `PRESETS`, réseau) : ne jamais réordonner `CLANS`. Un clan ajouté a par défaut `CLANBAL` = [1, 1], aucun trait, aucun style propre.

## Assistant de création (nr_wiz.js) : ce qu'il lit
L'écran de création est un assistant en 8 étapes (Identité → Origine → Nature → Style → Jutsu → Barres → Apparence → Résumé). Il est **piloté par les données** : rien à coder dans `nr_wiz.js` pour un nouveau clan ou un nouveau kekkei genkai.
- **Nouveau clan** : ajouter l'entrée à la fin de `CLANS` (nr_ninja.js) et `CLANVIL` (nr_roster.js), puis son fichier `kits/<clan>.js` (dans `KIT_ORDER`, mknaruto.py) avec `KIT('c<n>',…)`, `TRAITS[<n>]`, `DASHC[<n>]`, `CLOOK[<n>]`, éventuellement un style propre. Il apparaît tout seul dans la grille « Clans » de l'étape Origine (5 colonnes, 30 clans tiennent sans défilement), son trait dans la carte, l'aperçu et le Résumé ; les bots le tirent (`CLANRND`) dès que son arbre a des jutsu.
- **Kekkei genkai (sans clan, à la place des sub)** : dans un fichier `kits/kg_<nom>.js` (dans `KIT_ORDER`, avant `nr_tree.js` comme tout kit) :
  `defKG(<i>,{n:'Yôton',col:'#ff5a1a',tag:'Yô',d:'Lave : …'})` (crée l'arbre `g<i>`, 1 jutsu par rang de D à S, comme un clan), puis `KIT('g<i>',[[rang, mécanique, nom, description, vfx], …])`,
  `KGTRAITS[<i>]={nom,desc,…}` (même interface que `TRAITS`, branché par `trait(u)` et `traitOfB(b)`), `DASHG[<i>]={src,n,d,vfx}` (son dash, proposé avec le dash normal et celui de la nature), `KGBAL[<i>]=[PV, puissance]`.
  La carte apparaît dans « Sans clan » de l'étape Origine (l'emplacement en pointillés disparaît), l'onglet de l'étape Jutsu devient « Kekkei genkai · <nom> », le Résumé et la fiche suivent ; la moitié des bots sans clan prennent un KG (`randomKit`). Build : champ `kg` (indice, -1 = sub), validé par `kgOk` dans `sanitizeBuild`.
- **Les 10 kekkei genkai** (`kits/kg_common.js` puis un fichier par KG) : g0 Yôton `yo_` · g1 Futton `ft_` · g2 Jiton `ji_` · g3 Bakuton `bt_` · g4 Shakuton `sk_` · g5 Ranton `rt_` · g6 Shôton `so_` · g7 Jinton `jn_` · g8 Kiminari `kn_` · g9 Sakin `gd_` (indices figés : sauvegardes, réseau). Champs de `defKG` en plus : `el` (natures d'origine, texte), `nat` (nature suggérée : ★ dans l'étape Origine et fenêtre de migration), `ico(f)` (icône dessinée dans un repère de 32 px, couleur `f`, voir `jIcon`).
  Outils communs (`gk_`) : `gkPal(vfx,…)` (palette `GK[vfx]` + `VP`), `gkHit` / `gkAoe` (coups avec `VFX` = la clé du KG : le trait reconnaît ses jutsu par `gkMine(vfx)`, même dans les effets différés), `gkStack(src,t,clé,n,max,durée)` / `gkStSet` (cumuls d'un trait, `t[clé]` synchronisé, pastilles `GKST`), `gkPool` / `gkStrip` (flaques et traînées au sol, dessin `GKPOOL[kind]`), `gkBeam` (rayon, dessin `GKBEAM[st]`), `gkSteer` (tête chercheuse douce), `gk_chk` (contrôle à chaque image pendant un dash), `JFXD.gk_boom` (explosion par style), `gkOrbD` / `gkShardD` / `gkLumpD` (projectiles), `gkPrism`, `gkBolt` / `gkZig`, `gkHud`, animations `gk_push gk_call gk_charge`.
  Équilibrage : `KGBAL[i]` réglé par duels simulés (catégorie `g<i>` du simulateur, `blKit`).
- **Sub (sans clan sans KG)** : une seule liste de tous les sub (familles `f0-f7` = étiquettes et filtres), **exactement 1 sub par rang** (pool `fam` ; l'assistant refuse « Suivant » tant qu'un rang manque). `b.fam` est dérivé des sub appris (`famOfK`) : dash de famille, `FAMBAL`, `subHasF`.

- **Barres d'une origine choisie** (`nr_tree.js`) : `startBar(b)` = les jutsu appris de l'arbre de clan (non martial) ou de kekkei genkai d'abord, rang S → D (5 cases), la 6e par la barre auto ; `startBars(b)` = `startBar` + `barsCover`. Utilisé pour un nouveau perso (`rosEdit`) et à chaque changement d'origine (`wzSetOrig`) ; les bots gardent leur tirage (`randomKit`).
- **Changement d'origine** (`wzSetOrig`) : `wzOrigFx` dit ce qui change de nature / style (clan martial) ; la nature et le style d'avant un clan martial sont gardés dans `WZ.keep` et reviennent quand on en sort ; seules les étapes vraiment touchées sont marquées « à revoir ». Sans clan à sub : `wzSubPick` tire 5 sub de familles différentes.
- **Persos de l'anime au kit canon incomplet** : `wzCanonSubs()` laisse enregistrer une retouche tant que les sub sont ceux de l'original ; `rosDup` complète les rangs vides (`subFill`).

## Points d'extension d'un clan (tout depuis son propre fichier)
- `KIT('c<n>',[…])` + `Object.assign(NAT,{…})` + `Object.assign(NATHERO,{<préfixe>:'perso'})` (obligatoire : stats de référence de tes mécaniques).
- `TRAITS[<n>]={…}` : trait du clan (voir plus bas).
- **Style de combat propre** (attaque de base, clic gauche) : `STYLES.push(['Nom','desc','x.<préfixe>_style','vfx','arme',[<n>],modPV,modPuissance])`.
  **Règle : une attaque de base est TOUJOURS au corps à corps** (allonge max ≈ 130, celle d'un sabre) : pas de projectile, pas de frappe à distance ni à moyenne portée ; le jeu à distance passe par les jutsu. Seule exception voulue : Shirogane, dont la marionnette frappe au contact là où elle se trouve (fils de 180 au plus, `SG.L`).
  Arme (objet tenu dans la main avant, toutes dans `MELEEK`) : `fist bigfist palm claws bone sword kunai shadow bugs chain senbon sand puppet vine fan gold paper shuriken ice` (une nouvelle arme : l'ajouter à `MELEEK` dans `nr_flow.js` et à `drawNinjaWeapon` dans `nr_char.js` ; elle suit l'axe de la main du squelette, `R.wa`).
  La mécanique passe par `stMelee(u,a,portée,arc,dégâts,o,traînée,cb)` (styles.js, sur `melee()`) ou `stSlam` : combo de 5 coups, endurance, parade (F+clic), étourdissement du 5e coup ; `cb(e)` est appelé pour chaque ennemi vraiment touché.
  Chaque style a sa direction artistique liée au clan : chorégraphie `ANIM` par coup (générateurs `stAJ stAS stASpin stALunge stATwo stAOver stAUp stAKick stACrouch stAPull stALeap stACross`), traînée `st_arc` aux couleurs du clan (`fl` : `sand bugs shadow vine ice paper petal chain gold silk`), effet signature (5e coup) et une petite mécanique liée au trait du clan.
  Même base pour tous (`hero:'rey'`, modif. 1,12 / 1,07, ≈ 55-60 dégâts par combo de 5 coups en ≈ 2,3 s, avant le multiplicateur commun `M1K` = ×0,4 de nr_pace.js) ; les différences sont de style : vitesse, allonge, arc, effet. `ai:{max:<allonge>,p:1}` : un bot au corps à corps s'approche jusqu'à `max`−8 (`aiIn`, nr_pace.js), garde donc `max` ≥ l'allonge réelle du 1er coup + rayon de la cible.
  La recharge affichée dans le menu est lue dans la table `T=[0,[portée,arc,dégâts,recharge],…]` du style (`stCad`) : garde ce format pour que le rythme affiché reste juste.
  Tant qu'aucun style ne liste ton clan, il prend les styles « sans clan » (Taijutsu, Kunai au poing, Kenjutsu, Kubikiribôchô). Toujours **ajouter à la fin** (`push`), jamais insérer : les sauvegardes gardent l'indice du style (un style qu'on refait est remplacé en place, même indice ; les `PRESETS` le désignent par son nom).
  Un style existant peut aussi être ouvert à ton clan : `STYLES.find(s=>s[0]==='Marionnette')[5].push(14)`.
- **Apparence imposée** : `CLOOK[<n>]=(look,l,style)=>{look.head.eye='#c8e8ff';look.scale=1.05;…}` (appelé par `ninjaLook` ; `look.head` : `skin hair style eye eyeT face acc`, `look.back` : objet dans le dos, `look.dog`, `look.gourd`…).
- Équilibrage par clan : `CLANBAL["<n>"]` dans `nr_ninja.js` (laisser [1, 1] tant que la simulation n'a pas tourné).
- Équilibrage d'un style : `STYLEBAL["<indice>"]` ou `STYLEBAL["<indice>:<clan>"]` = [PV, puissance] ; d'un jutsu : `JBAL["<catégorie>|<nom>"] = {d, cd, ck}` (dégâts ×, recharge en s, coût en chakra), tous deux dans `nr_ninja.js`. Les « N dégâts » des descriptions suivent `d` automatiquement : écris toujours un chiffre de dégâts sous la forme « N dégâts ».
- Sigle de l'icône de jutsu : 3e champ de `CLANS` (`clanTag(c)`).

## Règles d'or
- **Préfixe** : toutes les clés que tu crées (NAT, PROJD, AUXF/AUXD, JFXD, DETO, ANIM, champs ajoutés aux ninjas) commencent par le préfixe de ta catégorie
  (`sj_ ot_ kr_ ib_ jg_` pour les clans c23-c27, `ka_`, `su_`, `fu_`, `ra_`, `do_`, `uc_`, `hy_`, `na_`, `ak_`, `ab_`, `in_`, `uz_`, `ya_`, `sa_`, `kg_`, `tj_` pour Taijutsuka, `hk_ rr_ hm_ sg_ ci_ km_ fm_ hs_ hz_ yu_` pour les clans c11-c20, `sub_` pour Subjutsu (fichier `sub_naruto.js` : `sub_nr_…` conseillé), `st_` pour les styles).
- **Au chargement du fichier**, n'utilise que : `KIT`, `NAT`, `SP`, `ULT`, `RG`, `SELF`, `DEF`, `ESC`, `GAP`, `HEALM`, `ALLY`, `S_`, `BURN`, les registres
  (`PROJD AUXF AUXD JFXD DETO ANIM TRAITS STATD AFTER NATHERO`) et des fonctions. Tout le reste (VP, VSND, UK, units…) seulement **dans des fonctions**
  ou dans `AFTER.push(()=>{…})` (exécuté une fois tout le jeu chargé).
- Texte affiché en **français**, court et clair (nom, description). Pas d'EX.
- La logique (dégâts, effets) tourne sur l'**hôte** ; les invités voient les projectiles, objets `aux`, effets `fx`/`jx` et champs synchronisés (voir « Réseau »).

## Catalogue
```js
KIT('n0',[ // catégorie : 'u' subjutsu, 'n0'…'n4' natures, 'c0'…'c20' clans
 [1,'D','x.ka_ball','Katon : Flamme','Projectile de feu qui brûle quelques secondes','fire'],
 // [emplacement, rang, mécanique, nom, description, élément visuel]
]);
```
- **Emplacement** : `1` = jutsu (va dans Clic D, Q ou E), `2` = déplacement (Espace), `5` = ultime (T). (3 et 4 = jutsu aussi.)
- **Rang** D C B A S = 1 à 5 points (budget 17 par kit, 19 sans clan). Le rang fixe les **mudras** (D 2 … S 6, sauf subjutsu et déplacements)
  et le **coût en chakra** (D 10, C 16, B 21, A 28, S 36, ultime +14 : une jauge pleine ≈ 5 jutsu). Recharge par rang (`RKB`, nr_flow.js) : D 20-30 s, C 30-40 s, B 40-60 s, A 60-80 s, S 80-100 s, en secondes RÉELLES (recharge interne `ab.cd` / `u.cds` = réel × GSPEED, voir `rtIn` / `rtOut`) ; une mécanique ULT() prend le haut de la fourchette.
- **Mécanique** : `'x.cle'` = `NAT.cle` (toujours préférer des mécaniques sur mesure). Les anciennes sources `perso.n` (moteur Star Wars) sont à remplacer.
- **Élément visuel** (`vfx`) : couleur/style des effets génériques et du son (`fire water wind lightning earth sand shadow bugs bone tag smoke genjutsu jyuken black fox heal leaf gate chain kunai shuriken senbon steel tai flower mind seal chidori kirin rasengan rasenshuriken hiraishin sandcoffin tsukuyomi susano gatsuga peacock sage byakugan kaiten hakke64 claws chakra`).
- Statistiques : chaque mécanique a un personnage de référence (PV/vitesse/puissance du ninja). Par défaut celui du préfixe (`NATHERO.ka='boba'`, déjà réglé).
  **Quand tu remplaces une ancienne source `perso.n` par une mécanique sur mesure, garde ses stats** avec l'option `hero:'perso'` (ex. `SP(…,{hero:'rey',ai:…},f)`).
  Styles : `STYLES` = `[nom, description, mécanique, vfx, arme, clans autorisés, modif. PV, modif. puissance]` ; une attaque de base sur mesure doit appeler `stMelee(…)`/`melee(…)`/`slash(…)` (toujours au corps à corps) pour garder combo, endurance, parade et étourdissement du 5e coup.

## Mécanique d'un jutsu
```js
Object.assign(NAT,{
 ka_ball:SP('Katon : Flamme','desc',4,{ai:RG(520,.7)},(u,a,td)=>{S('fire',u);fireP(u,a,{});}),
 ka_nuee:ULT('Katon : Nuée ardente','desc',{ai:{max:480,p:.8}},(u,a,td)=>{…}),
});
```
- `SP(nom, desc, recharge_s, options, f)` (`recharge_s` et `JBAL.cd` restent écrits sur l'**ancien** barème, `RKB_CD0` : D 4-7, C 6-10, B 8-12, A 11-16, S 18-24 ; `rkCd` les convertit proportionnellement dans la nouvelle fourchette du rang, bornée strictement : un réglage au-delà de l'ancienne fourchette donne le bord) ; `ULT(nom, desc, options, f)`. `f(u, a, td)` : `u` lanceur, `a` angle visé, `td` distance au curseur.
- Options : `ai` (indice pour les bots) : `RG(portéeMax, proba, portéeMin)`, `SELF(portée)`, `DEF`, `ESC` (fuite), `{mode:'gap',min,max,p}` (engagement),
  `HEALM` (si PV < 60 %), `ALLY`, `{mode:'exec',max}` ; télégraphes : `line:{len,w}` (rectangle) ou `tele:{r,max}` (cercle au sol) / `tele:{self:1,r}`.
  `charges:n` (plusieurs charges), `cast` (ignoré : les mudras fixent l'incantation).
  `hpc:.05` (« prix du sang », clan Chinoike) : le jutsu coûte cette part des PV max au lieu du chakra (refusé s'il ne reste pas assez de PV ; coût affiché en rouge dans la barre et le créateur).
- Aides de mécanique : `stackAb(cle,n,tirUnique)` (charges à relancer 5 s), `chanAb(cle)` (canalisation relâchée par relance),
  `later(u,délai,f,{x,y,r})` (effet différé avec cercle d'alerte si `r`), `seqs.push({owner:u,n,t,iv,vfx,f:o=>{…}})` (rafale),
  `wallLine(u,a,n,{wind:1|burn:1|earth:1|water:1,t})`, `ringHit(u,x,y,r0,r1,dmg,o)`, `atP(u,a,td,R)` (point visé), `pick(u,a,td,R)` (ennemi visé),
  `nearE(u,x,y,r)`, `enemies(u)`, `allies(u,r)`, `fwd(u,a,d)`, `dist(a,b)`, `ang(a,b)`, `clamp`, `lerp`, `rnd()`.

## Briques du moteur
- `proj(u,a,{spd,r,dmg,life,col, …})` : `pierce`, `big`, `home` (tête chercheuse), `steer` (suit la visée), `rocket` (explose : `ar`, `kb`, `stun`, `burn`),
  `grenade` (`tx,ty,ar`, explose au sol), `ret` (boomerang, distance), `hook:1` (ramène la cible) / `hook:2` (tire le lanceur), `drag`, `swap` (échange de place),
  `anchor` (le lanceur se tire au point d'impact), `chain:n` (rebondit), `bounce:n`, `split:n`, `sticky:{t,r,dmg,stun}` (se colle puis explose),
  `slow`, `root`, `stun`, `exec`, `o:{…options de hit}`, `onHit:(p,cible)=>{…}`, `kind:'ka_xxx'` (dessin sur mesure, voir PROJD), `noClash`.
- `melee(u,a,portée,arc,dmg,o)`, `slash(u,a,R,arc,dmg,o)`, `cone(u,a,portée,arc,dmg,o,col)`, `aoe(u,x,y,r,dmg,o,col)`,
  `zone(u,x,y,r,dmg,délai,o,col)` (explosion retardée avec cercle d'alerte ; `lastZ()` pour la retoucher : `.follow=u`, `.deto='clé DETO'`),
  `field(u,x,y,{r,t,dps,slow,heal,cloak,sleep,drain,mark,follow,dome,timeSlow,col,vfx})` (zone durable), `trap(u,a,td,{root,stun,slow,dmg,r,arm,t})`,
  `turret(u,a,durée,dmg,col,{follow,…})` (clone/allié qui tire), `tether(u,cible,durée,portée,col,fin,tick)` (lien, `tick` toutes les 0,5 s),
  `dash(u,a,dist,durée,{jump,end,dmg,kb,air,through})`, `beamHit(u,a,len,w,dmg,o,col)`, `lightning(u,a,{range,arc,dmg,slow,small,col})`,
  `alphaStrike(u,a,td,n,dmg)`, `blinkTo(u,x,y)`, `walls.push({x,y,r,t,team,owner,vfx})`, `shieldU(u,valeur,durée)`, `gain(u,soin,src)` (soins ×0,65).
- `u.flame={t,k:0,R,arc,d,kb,still,v,dot}` (souffle canalisé), `u.spin={t,k:0,r,dmg,pull}` (toupie).
- `hit(cible,src,dmg,o)` — options : `stun root slow silence fear taunt disarm vuln air (projeté) kb pull fx fy (centre) dot:{dps,dur} exec unblockable melee silent reveal el` (élément forcé 0-4).
- Effets sur le ninja (secondes) : `haste rage(+35 % dégâts) unstop(insensible au contrôle) drT+dr(réduction) giant lsB(vol de vie) regenB dodge counter deflect absorb thorns riposte stealth phase(intangible) slowImm`
  + `markB={t,dmg,src}` (marque qui explose), `stick`, `energy` (chakra 0-100 : rare, se recharge surtout avec R, voir `CK` dans `nr_pace.js` ; `exh` = épuisé), `stam`, `cds[]`, `kx,ky` (élan).

## Éléments (automatique d'après le `vfx`, ou `o.el`)
Katon bat Fûton, Fûton bat Raiton, Raiton bat Doton, Doton bat Suiton, Suiton bat Katon (×1,15 / ×0,9 selon la nature de la cible).
Eau → la cible est **trempée** (`wet`, 3 s) ; foudre sur trempé ×1,35 et arc vers un autre trempé ; feu sur trempé ×0,75 (vapeur) ; eau éteint la brûlure ;
un projectile de feu qui traverse un **vent** allié (mur, tornade, couloir, zone `vfx:'wind'`) grossit ×1,5 ; deux projectiles ennemis se **choquent** (le plus fort passe, l'élément dominant compte).

## Visuel
- Tout jutsu doit avoir **une signature visuelle unique** : geste du lanceur (`anim`), effet de lancement, projectile/zone, impact.
- `jx({jfx:'cle',x,y,t,m,…})` ajoute un effet dessiné par `JFXD.cle=(f,k,e,t,u,tg)=>{…}` (k = temps restant 1→0, e = 1-k, `f.ui`/`f.ti` = index d'un ninja suivi).
  Effets existants : `rasengan chidori hiraishin redmoon veins dome trigram palms sandcoffin shadowhands shadowstar waterprison wave mouthfire mind seal drill peacock gateburst slugs flashsky spikes pillar splash windsphere aura clash shock bigbolt mountain blackfire needles`.
- `PROJD.cle=(p,R,ra,t)=>{…}` dessine un projectile `kind:'cle'` (repère : origine = projectile, axe x = sa direction après `g.rotate(ra)`, unité ≈ pixel).
- `AUXF.type=(x,dt)=>{…}` logique d'un objet `aux.push({type,x,y,r,t,m,team,owner,vfx,k,…})` ; `AUXD.type=(x,k,t)=>{…}` son dessin.
- Ne jamais modifier `x.type` ni `x.danger` d'un objet `aux` après sa création, et seulement ajouter à `aux` par `push` (jamais `splice` ni `aux[i]=`) : l'IA met en cache la sélection des objets dangereux (`auxSel`) tant que le tableau ne change pas.
- `DETO.cle=(x,y,r)=>{…}` effet d'explosion (zones avec `.deto`, détonations).
- Dessin : `g` (contexte 2D), `P(x,y,z)` (→ écran `{x,y,s}`), `gEll(x,y,r)`, `circ(x,y,r,col)`, `poly(pts,col)`, `rgba(hex,a)`, `vcol(vfx,col,i)`,
  palettes `VP.fire` etc., `sparks(x,y,col,n,vfx)`, `ring(x,y,r,col)`, `beamFx(x,y,x2,y2,col,w)`, `fx.push({...particule})`, `say(u,'TEXTE',col)`, `shake`, `flashS`.
- `STATD.push((u,p,S,sk)=>{…})` dessine un état sur les ninjas (p = position écran des pieds, S = échelle).
- **Animation** (le jeu est en 2D ; les ninjas sont dessinés sur un squelette posé, `nr_pose.js`) : `anim(u,'nom',durée)` au lancement. Noms existants : `palm twohand slam hammer stomp spin breath summon leap point raise clap pray kickup uppercut throw2 lunge stab crouch backflip roar eye seal channel dance guard swirl kneel`.
  Nouvelles : `ANIM.ka_xxx=(P,e,u,t)=>{pz(P,'armR',x,y,z);…}` — os : `hips spine chest neck head armL foreL handL armR foreR handR thighL shinL footL thighR shinR footR cape cape2 skirt hair band` ;
  `P.root={x,y,z}` (décalage), `P.rootR={x,y,z}` (rotation du corps). Repères : `armX.x=-1.57` bras tendu devant, `-3.1` levé, `+0.6` en arrière ; `armL.z>0`/`armR.z<0` écartés ;
  `foreX.x<0` plie le coude ; `thighX.x<0` jambe devant ; `shinX.x>0` plie le genou ; `chest.x>0` penché en avant. Aides : `pz(P,os,x,y,z)`, `padd`, `ezo(x)`, `ezio(x)`, `bump(x)`.
- Sons : `S('cle',u)` avec `blaster bone boom bugs chidori dash deflect fire flame genjutsu heavy hit jyuken poof rasengan roar rock saber sand shadow water wind zap`.

## Trait de clan (fichiers de clan)
```js
TRAITS[0]={nom:'Sharingan',desc:'…',init(u){}, update(u,dt){}, deal(src,t,dmg,o){return dmg}, take(t,src,dmg,o){return dmg /* <0 annule */}, draw(u,p,S,sk){}, hud(u,x,y){}};
```
Un trait = **la mécanique qui fait l'identité du clan** (passif, jauge, état…), modéré et lisible. `update` tourne sur l'hôte à chaque image.
Crochets facultatifs :
- `landed(src,t,dmg,o)` : effets de l'attaquant **une fois le coup confirmé** (après `take` de la cible ; pas appelé si la défense l'annule). Mettre ici les vols de chakra, griffes, etc., pas dans `deal`.
- `drawB(u,p,S,sk)` : dessin **derrière** le ninja (appelé avant lui) ; `draw` dessine devant.
- `prev(u,p,S,front)` : signe du trait dans les aperçus (cartes et fiche de la liste des persos, création), appelé derrière (`front` faux) puis devant (`front` vrai) le ninja.

## Menu : liste des persos et création (`nr_roster.js`, `nr_menu.js`, `nr_wiz.js`)
- `scr` = écran du menu : `'list'` (liste + fiche), `'opp'` (arène / duel hors ligne : choix de l'adversaire), `'edit'` (création : assistant en 8 étapes, `drawWiz` / `wizClick`, `nr_wiz.js` ; `WZ` = étape affichée, étapes ouvertes, filtres de la liste des sub). `drawMenu` choisit l'écran ; `menuClick` reçoit les clics (`menuGrab()` vrai : il les prend tous, avant les boutons de mode).
- Persos : `rosEntries()` = `{k, b, sec, P?, i?, mod?, id?}` ; clés `'m'+id` (« Mes ninjas ») et `'a:'+nom` (perso de l'anime, `PRESETS`). Section : `SECS` (village ou groupe) ; celle d'un perso de l'anime vient de `P.sec`, sinon de son groupe `g` (`rosSec`). Un nouveau perso de l'anime n'a rien d'autre à déclarer.
- `MY` = build du perso joué (`MEK`), `CH.p0` = son ninja ; `rebuildMine()` le recalcule et, en ligne, l'envoie (`{t:'build'}`) ou diffuse le salon, comme avant. Le perso en création est `EB` (`edRebuild`), rien n'est gardé ni envoyé avant `edSave()`.
- Adversaire choisi : `CH.o0` + `OPPK='o0'`, lu par `startMatch` à la place du tirage (aussi en 2 contre 2 / 3 contre 3, ses alliés restent des bots). Un adversaire de ton camp passe dans le camp d'en face pour le combat (titres des équipes et message de fin suivent le camp). Un double-clic qui ouvre l'étape adversaire ne lance rien (`OPPT`, 0,5 s).
- Fiche : `FK` = perso montré ; il suit la carte survolée quand la souris s'y arrête, jamais tant que la souris file vers la fiche (`rosHover`, vitesse lue sur les derniers `mousemove`). Un kit au-dessus du budget (`rosOver`) ne se joue pas : badge « TROP CHER », bouton « Trop de points », fenêtre qui ouvre la création (`rosOverWarn`). En ligne, ouvrir la création retire PRÊT.
- Sauvegarde `localStorage['nrRoster1']` = `{v, nid, mine:[{id,build}], anime:{nom:build}, last:{me,opp}}` ; chaque build garde le nom de ses jutsu (`jn`) et de son style (`sn`) et repasse par `sanitizeBuild` au chargement (`bIn`) ; JSON illisible = liste vide. Première fois : l'ancien `nrBuild4` devient le premier de « Mes ninjas » (sauf perso de l'anime tel quel). `'nrBuild4'` reste écrit (perso joué). Le simulateur (`?sim=1`) n'écrit rien.
- Aperçus : un ninja par carte (`rosFake`, refait si la build change) ; le ninja est dessiné en 2D (`cardChar` → `drawChar`). Une carte au repos est dessinée une fois dans sa propre image (`rosCardC`, `CC`) puis recopiée : le contexte `g` est un `let` (rep de `mknaruto.py`), les fonctions de dessin y dessinent le temps de la carte.

## Réseau
Champs synchronisés : projectiles (`kind` et les clés de base), objets `aux` (`type x y a len w r t m team vfx k ti ui kind col n`), ninjas (champs listés dans `UK`).
Pour synchroniser un nouveau champ de ninja : `AFTER.push(()=>UK.push('ka_monChamp'))`. Les effets créés avec `jx`/`fx`/`sparks` côté hôte sont envoyés aux invités.

## Équilibre (repères)
PV des ninjas ≈ 250-350 avant le multiplicateur commun `HPK` (×1,3, nr_pace.js ; avec `M1K` ×0,4 sur les attaques de base, réglé pour un duel 1v1 médian de ≈ 50 s sans soin) ; coup de base ≈ 10-15.
Le chakra ne revient plus en frappant : un jutsu qui **vole ou brûle du chakra** pèse donc lourd (il peut pousser la cible à l'épuisement). Par rang (recharge entre parenthèses, ancien barème des mécaniques ; en jeu ×≈5, voir plus haut) :
D (4-8 s) ≈ 10-18 dégâts ou petite utilité · C (6-10 s) ≈ 16-26 ou contrôle modéré (étourdir ≤ 0,6 s, entraver ≤ 1,2 s) ·
B (8-12 s) ≈ 22-34 ou contrôle fort (≤ 1 s) / bonne défense · A (10-14 s) ≈ 30-45 + effet · S (ultime, 22 s) ≈ 45-70 ou effet décisif.
Tout contrôle doit être **lisible** (télégraphe, projectile visible, délai) et **contrable** (esquivable, bloquable, interrompable).

## Équilibrage en jeu (`nr_bal.js` : panneau F8 + simulateur)
- Le profil « Standard » (vide) = les valeurs du jeu : `CLANBAL`, `NATBAL`, `STYLEBAL`, `JBAL` (nr_ninja.js), `CK`, `HLS`, `HPK`, `M1K` (nr_pace.js). Un profil ne garde que ses écarts : PV/puissance d'un clan ou d'une nature et réglages d'un jutsu remplacent la valeur du jeu, ceux d'un style la multiplient.
- Le profil actif (onglets Global, Clans, Natures, Styles, Jutsu) réécrit `CLANBAL`, `NATBAL`, `STYLEBAL`, `CKCOST` (dont `CKCOST.U`, surcoût d'un ultime), `CK` et `HLS`, puis recalcule tous les `CH[…]` sur place ; il est réappliqué à chaque `startMatch`.
- Dégâts × d'un jutsu : tout ce que le jutsu crée pendant `fire` (projectiles, zones, champs, pièges, clones, `aux`, `seqs`, liens, `later`, fin de `dash`, `stick`, `markB`, brûlures `dot`) garde son multiplicateur. Un jutsu qui recalcule ses dégâts à chaque image, ou les range dans un état du ninja, peut y échapper.
- Coût propre à un jutsu : `ab.ckO` (lu par `jcost`). Dans un profil, les jutsu sont repérés par `catégorie|nom` et les styles par leur **nom** : renommer un jutsu ou un style fait perdre son réglage.
- En ligne : l'hôte envoie `{t:'bal',p,n}` (avec le salon et au lancement) ; l'invité l'applique (`blRecv`) et retrouve son propre profil en quittant.
- Simulateur : iframe `index.html?sim=1` en bac à sable (`sandbox`, autre processus chez Chrome : l'interface reste fluide ; iframe ordinaire en `file://`), ni rendu ni boucle de jeu, même tirage de kits et même duel que `bal21/sim.mjs` (`player.ctrl=null`, 1v1, 150 s au plus).
- `BLPART` (nr_bal.js) : jutsu dont une partie des dégâts échappe au multiplicateur (signalés ⚠ dans l'onglet Jutsu). Un kit qui corrige ça (dégâts recalculés à partir de `p.dmg` d'origine) peut en être retiré.

## VFX
Boîte à outils commune (`nr_fx.js`, chargée avant les kits ; utilisable dans toute fonction, et au chargement pour les palettes `FXP` / `fxPal`). **Tout est visuel** : rien ne change le jeu.

### Règles (demande du joueur)
- **Ça doit claquer sans gêner** : chaque jutsu a son identité (anticipation, silhouette forte, traînée, impact, trace au sol qui s'efface, particules secondaires, lumière additive) et **se lit** : la forme dessinée = la hitbox (même rayon, même largeur), les télégraphes restent nets.
- **Ne jamais cacher un ninja** : rien d'opaque sur un corps, grosses formes semi-transparentes (≤ 0,35 au-dessus des unités), lueurs blanches petites et brèves, durées courtes pour le fouillis.
- **Aucun flash plein écran** (`fillRect(0,0,W,H)`, voile coloré, vignette qui clignote) : utiliser `fxFlare` / `fxLight` (lumière locale). Un `JFXD`/`AUXD` qui remplit encore tout l'écran d'une couleur unie est redessiné automatiquement en éclat local (garde-fou `fxNoFull`) : à corriger quand même dans le kit. `flashS` n'est plus dessiné.
- **Secousse** : seulement les jutsu S (une fenêtre de 3 s s'ouvre au lancement d'un S près de la caméra, `fxSCast`) et les gros coups reçus par le joueur (≥ 9 % de ses PV, automatique). Ailleurs, `shake=` n'a plus d'effet. Pour une secousse voulue (impact d'un S) : `fxShake(.3,x,y)`. Aucune en « Faible ».
- **Intensité** (`OPT.fxi`, option « Intensité des effets » : 0 Faible, 1 Normal, 2 Fort), **foule** (au-delà de 8 ninjas vivants, le décor baisse : 20c20 ≈ 0,56 → Normal ≈ Faible) et **camp** (effets ENNEMIS atténués en nombre et en opacité, alliés un peu) sont appliqués **au dessin, chez chaque joueur**. Les effets du joueur restent pleins.
- **Télégraphes / zones de danger : jamais atténués** (utiliser `fxTele*`, ou `tele:1` sur un `jx`).
- Budget : particules dessinées par image plafonnées (`fxNB`), anciennes particules du moteur coupées au-delà du plafond (`fxCull`), ≤ 36 traces au sol.

### Échelles (à appeler AU DESSIN, dans `JFXD` / `AUXD` / `PROJD` / `STATD`)
- `fxK(o)` : échelle du décor 0..1 (0,8 = Normal, 1c1, ton jutsu). `o` = le lanceur (unité), un indice d'unité, ou l'objet dessiné (`f` d'un jx, `x` d'un aux, projectile : il lit `oi`, `owner`, `ui`, `team`).
- `fxA(o)` : opacité selon le camp (1 pour toi, ≈ 0,68 ennemi en Normal, ≈ 0,55 en Faible).
- `fxN(n,o)` : nombre de particules (n = ce que tu veux en Normal pour TON jutsu ; au moins 1). `fxNB(n,o)` : idem + budget global de l'image (pour une boucle de particules dessinées).
- `fxRel(o)` : 0 le mien, 1 allié, 2 ennemi, 3 inconnu. `fxAlpha(m,()=>{…})` : dessine un bloc avec une opacité imposée (tout `globalAlpha` du bloc est multiplié).
- Les `jx(...)` reçoivent `oi` (lanceur) automatiquement pendant un jutsu, un objet `aux`, une zone, un projectile, une rafale `seqs`, un `later` ; un jfx d'ennemi est déjà dessiné à `fxA` (sauf `f.tele`, `f.danger`, nom contenant `warn|tele|alert|danger`, ou `FXTELE.add('xx_nom')`).
```js
JFXD.ka_cone=(f,k,e,t,u)=>{const n=fxNB(14,f);for(let i=0;i<n;i++){…}};      // nombre de flammes selon intensité/camp
AUXD.do_rubble=(x,k)=>{fxTele(x.x,x.y,x.r,1-x.t/x.m,'#a07850',x);              // le danger : net
 fxAlpha(fxA(x),()=>{/* décor (cailloux, poussière) */})};
```

### Effets analytiques (côté hôte, dans la mécanique : `f(u,a,td)`, `AUXF`, `later`, `onHit`…)
Un seul objet `fx` par effet, synchronisé avec les invités, recalculé au dessin depuis une graine : coût réseau minime, chacun le voit à SA intensité. Tous prennent `o.u` (lanceur ; par défaut le lanceur courant), `o.t` (durée, s), `o.z` (hauteur).
| appel | effet | options utiles |
|---|---|---|
| `fxBurst(x,y,col,o)` | étincelles / gouttes / pétales qui jaillissent | `n` (12), `sp` vitesse (260), `a`+`arc` (cône), `up`, `gr` gravité (110 ; négatif = monte), `w`, `len` traînée, `sh:'line'|'dot'|'petal'`, `c2` couleur chaude, `add:0` (pas additif : sang, encre) |
| `fxSmoke(x,y,o)` | bouffées de fumée / poussière / vapeur | `col`, `n` (6), `r` étalement, `s` taille, `rise`, `al` (≤ 0,35), `dx`,`dy` dérive |
| `fxDebris(x,y,o)` | éclats qui retombent et rebondissent | `col`, `c2`, `n`, `sp`, `s` taille |
| `fxRing(x,y,o)` | onde de choc au sol (sous les ninjas) | `r0`, **`r1` = rayon réel du coup**, `col`, `c2`, `w`, `fill:1` |
| `fxDecal(x,y,kind,o)` | trace au sol qui s'efface (sous les ninjas) | `kind` : `scorch crack puddle ice burn seal sand leaf` ; `r`, `t` (3-5 s), `col` (puddle, seal), `al` |
| `fxArc(x,y,x2,y2,col,o)` / `fxArcs(x,y,r,col,o)` | arc électrique entre deux points / autour d'un point | `z`, `z2`, `w`, `n`, `j` (zigzag) |
| `fxWind(x,y,a,o)` | filets de vent dans la direction `a` | `len`, `w` largeur, `n`, `spin:1` (tourbillon) |
| `fxFlare(x,y,col,o)` | éclat de lumière LOCAL (impact) | `r` (28), `t` (0,2), `c2`, `star:0`, `al` |
| `fxLight(x,y,r,col,o)` | lumière additive au sol | `t`, `a` (0,45) |
| `fxPillar(x,y,col,o)` | colonne de lumière | `h`, `w`, `al` |
| `fxEmbers(x,y,r,col,o)` | braises / bulles / spores qui montent d'une zone (en boucle pendant `t`) | `n`, `h`, `w`, `c2` |
| `fxCharge(u,col,o)` | anticipation : particules aspirées vers les mains de `u` (le suit) | `t`, `n`, `r`, `hd` (distance de la main), `z` (34 mains, 52 bouche) |
| `fxGlyph(x,y,col,o)` | cercle de sceau au sol | `r`, `ui` (suit l'unité d'indice ui) |
Combinés :
- `fxImpact(x,y,vfx,s,o)` : impact complet selon la famille de l'élément (éclat + lumière + onde + particules + trace au sol) ; `s` taille (1 ≈ 44 px), `o.r` rayon de l'onde (mets le rayon réel), `o.dec:0` sans trace, `o.ring:0` sans onde, `o.a` direction (vent).
- `fxCast(u,vfx,durée,o)` : préparation (charge aux mains ; `o.mouth:1` pour un souffle Katon, `o.glyph:1` cercle au sol).
- `fxDeto(x,y,r,vfx,u)` : décor d'explosion (déjà appelé par le moteur pour les zones et projectiles qui explosent).
- `fxHitStop(src,cible,dégâts,gros)` : gros coup (≥ 16 ou 7 % des PV, ou `gros`) → gel visuel des deux ninjas (`u.fxHS`, secondes, lu par l'animation) ; une vraie pause de 35-75 ms seulement hors ligne et si le joueur local donne/reçoit le coup (jamais en ligne : la simulation de l'hôte n'est jamais arrêtée).
- `fxShake(a,x,y)` : secousse (voir règles).
```js
// Katon : Grande boule de feu — préparation, tir, impact
ka_ball:SP('Katon : …','…',6,{ai:RG(520,.7)},(u,a,td)=>{fxCast(u,'katon',.35,{mouth:1});
  fireP(u,a,{r:14,onHit:(p,e)=>{fxImpact(p.x,p.y,'katon',1.3,{u,r:60});fxHitStop(u,e,p.dmg)}})}),
// Doton : pics — l'onde = le rayon exact du coup
later(u,.5,()=>{aoe(u,x,y,110,26,{});fxRing(x,y,{u,r0:20,r1:110,col:'#a07850',w:7});fxDebris(x,y,{u,n:10});fxDecal(x,y,'crack',{u,r:100,t:4})},{x,y,r:110}),
// Raiton : arc vers chaque cible touchée
for(const e of hit)fxArc(u.x,u.y,e.x,e.y,'#bfe6ff',{u,z:34,t:.2});
```

### Dessin (dans `PROJD`, `JFXD`, `AUXD`, `STATD` : contexte `g`)
- `fxGlow(x,y,z,r,col,a)` (monde), `fxGlowS(sx,sy,rx,col,a,ry)` (écran) : lueur additive à cœur blanc, **sprite pré-rendu** (bien moins cher qu'un `createRadialGradient` par image). `fxGlowG(x,y,r,col,a)` : tache de lumière au sol. `fxSoftS(sx,sy,rx,col,a,ry)` : tache douce non additive (fumée, ombre, brûlure). `fxSpr(col,kind)` : le sprite 64 px (0 linéaire, 1 lueur, 2 doux).
- `fxTailL(len,w,col,a)` : traînée effilée dans le repère courant (après `g.rotate(ra)` dans un `PROJD` : de 0 vers −len). `fxTrailW(x,y,z,vx,vy,len,w,col,a)` : traînée d'un objet du monde d'après sa vitesse. `fxRibbon(obj,x,y,z,col,w,n,a)` : ruban d'historique (dash, arme), garde ses points sur `obj`.
- Projectiles : traînée lumineuse automatique pour les éléments lumineux (`fire wind water lightning chidori rasengan jyuken heal chakra genjutsu…`) ; `p.tail=1` / `p.tail=0` pour forcer, `FXNOTAIL.ka_dragon=1` pour un `PROJD` qui a la sienne.
- `fxBoltS(x0,y0,x1,y1,col,w,graine,zigzag,segments)` : éclair à l'écran (lueur + cœur blanc). Graine `f.sd+Math.floor(performance.now()/55)` = crépite sans clignoter.
- **Télégraphes** (jamais atténués, forme = hitbox, `k` progression 0→1, `o` lanceur : un ennemi ajoute un liseré rouge pointillé, le dernier quart pulse) : `fxTele(x,y,r,k,col,o)` (cercle), `fxTeleLine(x,y,a,len,w,k,col,o)` (rectangle depuis x,y), `fxTeleCone(x,y,a,R,arc,k,col,o)` (secteur, arc = ouverture totale).
- Ondes et traces au sol passent **sous** les ninjas et sous les télégraphes ; les autres effets FXK passent avec les particules (au-dessus) : garder leur opacité modérée.

### Palettes par nature (`fxPal(vfx)` → `{a principale, b claire, c sombre, h cœur chaud, sm fumée, e famille d'impact}`)
`FXP` : `katon suiton futon raiton doton genjutsu iryo fuin chakra rasengan kage mushi hone suna mokuton hyoton yoton futton jiton bakuton shakuton ranton shoton jinton kiminari sakin kurama sennin metal taijutsu chi`. Les clés `vfx` du catalogue y renvoient (`fire`→katon, `yo_lava`→yoton, `sj_wood`→mokuton, `ci_blood`→chi…) ; une clé de kit inconnue prend les couleurs de `VP[vfx]`. Une nouvelle palette : `FXP.xx_moi={a:'#…',b:'#…',c:'#…',h:'#fff',sm:'#…',e:'fire'}` (familles `e` : `fire water wind lightning earth sand ice steam genjutsu heal seal dark blood chakra metal`).

### Outils VFX des kekkei genkai et des clans c23-c27 (`kits/kg_common.js`)
`gkDim(o,fn)` décor atténué si `o` est ennemi · `gkImp(u,x,y,v,r,o)` impact complet à éclat plafonné (ne délave pas la cible) · `gkEdge(x,y,r,col,a,o)` / `gkEdgeL` bord net d'une zone durable (liseré rouge si ennemie, jamais atténué) · `gkTrail` sillage de dash · `gkN(n,o)` nombre de particules selon le budget · `GKPOOLC[kind]` couleur de bord d'une nappe. Poses : `gk_lob` (lancer par-dessus l'épaule), `gk_slam` (deux poings au sol), `gk_sweep` (balayage du bras).

### Éclair du coup reçu (moteur, `hitFl(u)` dans `nr_char.js`)
Le blanc d'un ninja touché (`u.flash`) dure au plus 130 ms par rafale de coups (`hitFl`) : un broyage ou un dôme qui frappe à chaque image ne blanchit plus la cible en continu. Ne pas remettre `flash` à la main pour « faire briller » une cible : utiliser `fxFlare` / `fxLight`.

### Restes (passe de fondations, mis à jour à l'intégration)
- Faits : `bt_flash` (Bakuton) est une lueur au sol locale ; le `flashS` de `fam_fuin.js` est retiré ; l'éclair lointain de la carte d'orage (`nr_maps.js`) n'éclaire plus que le haut du ciel et disparaît en Faible.
- Gardés (gameplay) : `hyuga.js` `JFXD.hy_view` (vignette du Byakugan) ; `suiton.js` brume du Kirigakure autour du joueur.
- Beaucoup de kits mettent `shake=…` sur des jutsu non S : sans effet maintenant (normal), ne pas compenser.
