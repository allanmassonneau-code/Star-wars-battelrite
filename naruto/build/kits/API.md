# Écrire un kit (kits/<catégorie>.js)

Chaque fichier de `naruto/build/kits/` décrit **une catégorie** : `styles` (attaques de base), `sub` (subjutsu, sans clan),
les 5 natures (`katon`, `suiton`, `futon`, `raiton`, `doton`) et les 11 clans (`uchiha` … `taijutsuka`).
Le générateur `python3 naruto/build/mknaruto.py` assemble tout dans `naruto/index.html`.

## Règles d'or
- **Préfixe** : toutes les clés que tu crées (NAT, PROJD, AUXF/AUXD, JFXD, DETO, ANIM, champs ajoutés aux ninjas) commencent par le préfixe de ta catégorie
  (`ka_`, `su_`, `fu_`, `ra_`, `do_`, `uc_`, `hy_`, `na_`, `ak_`, `ab_`, `in_`, `uz_`, `ya_`, `sa_`, `kg_`, `tj_` pour Taijutsuka, `sub_` pour Subjutsu, `st_` pour les styles).
- **Au chargement du fichier**, n'utilise que : `KIT`, `NAT`, `SP`, `ULT`, `RG`, `SELF`, `DEF`, `ESC`, `GAP`, `HEALM`, `ALLY`, `S_`, `BURN`, les registres
  (`PROJD AUXF AUXD JFXD DETO ANIM TRAITS STATD AFTER NATHERO`) et des fonctions. Tout le reste (VP, VSND, UK, units…) seulement **dans des fonctions**
  ou dans `AFTER.push(()=>{…})` (exécuté une fois tout le jeu chargé).
- Texte affiché en **français**, court et clair (nom, description). Pas d'EX.
- La logique (dégâts, effets) tourne sur l'**hôte** ; les invités voient les projectiles, objets `aux`, effets `fx`/`jx` et champs synchronisés (voir « Réseau »).

## Catalogue
```js
KIT('n0',[ // catégorie : 'u' subjutsu, 'n0'…'n4' natures, 'c0'…'c10' clans
 [1,'D','x.ka_ball','Katon : Flamme','Projectile de feu qui brûle quelques secondes','fire'],
 // [emplacement, rang, mécanique, nom, description, élément visuel]
]);
```
- **Emplacement** : `1` = jutsu (va dans Clic D, Q ou E), `2` = déplacement (Espace), `5` = ultime (T). (3 et 4 = jutsu aussi.)
- **Rang** D C B A S = 1 à 5 points (budget 17 par kit, 19 sans clan). Le rang fixe les **mudras** (D 2 … S 6, sauf subjutsu et déplacements)
  et le **coût en chakra** (D 8, C 12, B 16, A 22, S 30, ultime +12). Les ultimes ont 22 s de recharge.
- **Mécanique** : `'x.cle'` = `NAT.cle` (toujours préférer des mécaniques sur mesure). Les anciennes sources `perso.n` (moteur Star Wars) sont à remplacer.
- **Élément visuel** (`vfx`) : couleur/style des effets génériques et du son (`fire water wind lightning earth sand shadow bugs bone tag smoke genjutsu jyuken black fox heal leaf gate chain kunai shuriken senbon steel tai flower mind seal chidori kirin rasengan rasenshuriken hiraishin sandcoffin tsukuyomi susano gatsuga peacock sage byakugan kaiten hakke64 claws chakra`).
- Statistiques : chaque mécanique a un personnage de référence (PV/vitesse/puissance du ninja). Par défaut celui du préfixe (`NATHERO.ka='boba'`, déjà réglé).
  **Quand tu remplaces une ancienne source `perso.n` par une mécanique sur mesure, garde ses stats** avec l'option `hero:'perso'` (ex. `SP(…,{hero:'rey',ai:…},f)`).
  Styles : `STYLES` = `[nom, description, mécanique, vfx, arme, clans autorisés, modif. PV, modif. puissance]` ; une attaque de base sur mesure doit appeler `melee(…)`/`slash(…)` (corps à corps) ou `proj(…)` (distance) pour garder combo, endurance et étourdissement du 5e coup.

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
  + `markB={t,dmg,src}` (marque qui explose), `stick`, `energy` (chakra 0-100), `stam`, `cds[]`, `kx,ky` (élan).

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

## Réseau
Champs synchronisés : projectiles (`kind` et les clés de base), objets `aux` (`type x y a len w r t m team vfx k ti ui kind col n`), ninjas (champs listés dans `UK`).
Pour synchroniser un nouveau champ de ninja : `AFTER.push(()=>UK.push('ka_monChamp'))`. Les effets créés avec `jx`/`fx`/`sparks` côté hôte sont envoyés aux invités.

## Équilibre (repères)
PV des ninjas ≈ 250-350 ; coup de base ≈ 10-15. Par rang (recharge entre parenthèses) :
D (4-8 s) ≈ 10-18 dégâts ou petite utilité · C (6-10 s) ≈ 16-26 ou contrôle modéré (étourdir ≤ 0,6 s, entraver ≤ 1,2 s) ·
B (8-12 s) ≈ 22-34 ou contrôle fort (≤ 1 s) / bonne défense · A (10-14 s) ≈ 30-45 + effet · S (ultime, 22 s) ≈ 45-70 ou effet décisif.
Tout contrôle doit être **lisible** (télégraphe, projectile visible, délai) et **contrable** (esquivable, bloquable, interrompable).
