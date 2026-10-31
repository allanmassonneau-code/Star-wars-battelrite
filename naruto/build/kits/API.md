# Écrire un kit (kits/<catégorie>.js)

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
| c10 | Taijutsuka (`TAIJ`, sans nature) | taijutsuka.js | tj_ | | | | | |

Les indices sont figés (sauvegardes, `PRESETS`, réseau) : ne jamais réordonner `CLANS`. Un clan ajouté a par défaut `CLANBAL` = [1, 1], aucun trait, aucun style propre.

## Points d'extension d'un clan (tout depuis son propre fichier)
- `KIT('c<n>',[…])` + `Object.assign(NAT,{…})` + `Object.assign(NATHERO,{<préfixe>:'perso'})` (obligatoire : stats de référence de tes mécaniques).
- `TRAITS[<n>]={…}` : trait du clan (voir plus bas).
- **Style de combat propre** (attaque de base, clic gauche) : `STYLES.push(['Nom','desc','x.<préfixe>_style','vfx','arme',[<n>],modPV,modPuissance])`.
  **Règle : une attaque de base est TOUJOURS au corps à corps** (allonge max ≈ 130, celle d'un sabre) : pas de projectile, pas de frappe à distance ni à moyenne portée ; le jeu à distance passe par les jutsu. Seule exception voulue : Shirogane, dont la marionnette frappe au contact là où elle se trouve (fils de 180 au plus, `SG.L`).
  Arme (objet tenu en 3D et en 2D, toutes dans `MELEEK`) : `fist bigfist palm claws bone sword kunai shadow bugs chain senbon sand puppet vine fan gold paper shuriken ice` (une nouvelle arme : l'ajouter à `MELEEK` dans `nr_flow.js`, à `buildNinja3D` dans `nr_3d.js` et à `drawNinjaWeapon` dans `nr_char.js`).
  La mécanique passe par `stMelee(u,a,portée,arc,dégâts,o,traînée,cb)` (styles.js, sur `melee()`) ou `stSlam` : combo de 5 coups, endurance, parade (F+clic), étourdissement du 5e coup ; `cb(e)` est appelé pour chaque ennemi vraiment touché.
  Chaque style a sa direction artistique liée au clan : chorégraphie `ANIM` par coup (générateurs `stAJ stAS stASpin stALunge stATwo stAOver stAUp stAKick stACrouch stAPull stALeap stACross`), traînée `st_arc` aux couleurs du clan (`fl` : `sand bugs shadow vine ice paper petal chain gold silk`), effet signature (5e coup) et une petite mécanique liée au trait du clan.
  Même base pour tous (`hero:'rey'`, modif. 1,12 / 1,07, ≈ 55-60 dégâts par combo de 5 coups en ≈ 2,3 s, avant le multiplicateur commun `M1K` = ×0,4 de nr_pace.js) ; les différences sont de style : vitesse, allonge, arc, effet. `ai:{max:<allonge>,p:1}` : un bot au corps à corps s'approche jusqu'à `max`−8 (`aiIn`, nr_pace.js), garde donc `max` ≥ l'allonge réelle du 1er coup + rayon de la cible.
  La recharge affichée dans le menu est lue dans la table `T=[0,[portée,arc,dégâts,recharge],…]` du style (`stCad`) : garde ce format pour que le rythme affiché reste juste.
  Tant qu'aucun style ne liste ton clan, il prend les styles « sans clan » (Taijutsu, Kunai au poing, Kenjutsu, Kubikiribôchô). Toujours **ajouter à la fin** (`push`), jamais insérer : les sauvegardes gardent l'indice du style (un style qu'on refait est remplacé en place, même indice ; les `PRESETS` le désignent par son nom).
  Un style existant peut aussi être ouvert à ton clan : `STYLES.find(s=>s[0]==='Marionnette')[5].push(14)`.
- **Apparence imposée** : `CLOOK[<n>]=(look,l,style)=>{look.head.eye='#c8e8ff';look.scale=1.05;…}` (appelé par `ninjaLook`, en 3D et en 2D ; `look.head` : `skin hair style eye eyeT face acc`, `look.back` : objet dans le dos, `look.dog`, `look.gourd`…).
- Équilibrage par clan : `CLANBAL["<n>"]` dans `nr_ninja.js` (laisser [1, 1] tant que la simulation n'a pas tourné).
- Équilibrage d'un style : `STYLEBAL["<indice>"]` ou `STYLEBAL["<indice>:<clan>"]` = [PV, puissance] ; d'un jutsu : `JBAL["<catégorie>|<nom>"] = {d, cd, ck}` (dégâts ×, recharge en s, coût en chakra), tous deux dans `nr_ninja.js`. Les « N dégâts » des descriptions suivent `d` automatiquement : écris toujours un chiffre de dégâts sous la forme « N dégâts ».
- Sigle de l'icône de jutsu : 3e champ de `CLANS` (`clanTag(c)`).

## Règles d'or
- **Préfixe** : toutes les clés que tu crées (NAT, PROJD, AUXF/AUXD, JFXD, DETO, ANIM, champs ajoutés aux ninjas) commencent par le préfixe de ta catégorie
  (`ka_`, `su_`, `fu_`, `ra_`, `do_`, `uc_`, `hy_`, `na_`, `ak_`, `ab_`, `in_`, `uz_`, `ya_`, `sa_`, `kg_`, `tj_` pour Taijutsuka, `hk_ rr_ hm_ sg_ ci_ km_ fm_ hs_ hz_ yu_` pour les clans c11-c20, `sub_` pour Subjutsu (fichier `sub_naruto.js` : `sub_nr_…` conseillé), `st_` pour les styles).
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
  et le **coût en chakra** (D 10, C 16, B 21, A 28, S 36, ultime +14 : une jauge pleine ≈ 5 jutsu). Les ultimes ont 22 s de recharge.
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
- `SP(nom, desc, recharge_s, options, f)` ; `ULT(nom, desc, options, f)`. `f(u, a, td)` : `u` lanceur, `a` angle visé, `td` distance au curseur.
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
- **Animation 3D** : `anim(u,'nom',durée)` au lancement. Noms existants : `palm twohand slam hammer stomp spin breath summon leap point raise clap pray kickup uppercut throw2 lunge stab crouch backflip roar eye seal channel dance guard swirl kneel`.
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
- `prev(u,p,S,front)` : signe du trait dans les aperçus (galerie, créateur), appelé derrière (`front` faux) puis devant (`front` vrai) le ninja.

## Réseau
Champs synchronisés : projectiles (`kind` et les clés de base), objets `aux` (`type x y a len w r t m team vfx k ti ui kind col n`), ninjas (champs listés dans `UK`).
Pour synchroniser un nouveau champ de ninja : `AFTER.push(()=>UK.push('ka_monChamp'))`. Les effets créés avec `jx`/`fx`/`sparks` côté hôte sont envoyés aux invités.

## Équilibre (repères)
PV des ninjas ≈ 250-350 avant le multiplicateur commun `HPK` (×1,3, nr_pace.js ; avec `M1K` ×0,4 sur les attaques de base, réglé pour un duel 1v1 médian de ≈ 50 s sans soin) ; coup de base ≈ 10-15.
Le chakra ne revient plus en frappant : un jutsu qui **vole ou brûle du chakra** pèse donc lourd (il peut pousser la cible à l'épuisement). Par rang (recharge entre parenthèses) :
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
