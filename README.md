# Star Wars Arena (Battlerite × Battlefront II)

Jeu de combat en vue 3/4 plongeante (comme Battlerite), jouable directement dans le navigateur : ouvrir `index.html`.

## Modes
- **Arène 1 contre 1** : héros contre méchant, au meilleur des 3 manches. Holocron de soin à 18 s, mort subite à 45 s.
- **Bataille 20 contre 20** : les 20 héros contre les 20 méchants sur une grande carte, caméra qui suit le joueur. 60 renforts par camp, chaque élimination en coûte 1. Réapparition à la base, holocrons de soin, mini-carte et fil des éliminations.
- **Duel** : toi contre ton ami en ligne (1 contre 1, au meilleur des 3 manches), après connexion via « Coop en ligne ».
- **Prêt** : en coop, chacun choisit son héros puis clique sur PRÊT ; la partie démarre quand les deux sont prêts.
- **Coop en ligne** : bouton « Coop en ligne » du menu. L'hôte crée un salon (code à 4 caractères), le coéquipier le rejoint. Arène en 2 contre 2, ou bataille dans la même armée. Connexion pair-à-pair (PeerJS) : il faut ouvrir le jeu depuis un vrai site (GitHub Pages, Vercel, Netlify…), pas depuis un fichier local bloqué ou un aperçu restreint.

## Personnages
**Son** : vrais bruitages Star Wars (dossier `sounds/`, ~1 Mo) : sabres Jedi/Sith, blasters rebelles et impériaux, arbalète de Chewie, DL-44 de Han, éclairs de Force, explosions, et une réplique culte quand un héros lance son ultime (« Hello there! », « Do or do not »…). Si les fichiers manquent (jeu ouvert en local), les sons synthétisés prennent le relais.

40 personnages, chacun avec un kit écrit sur mesure (6 sorts, un passif, et une version EX dérivée pour chaque sort) inspiré de League of Legends et Battlerite : liens à maintenir, échange de place, contre, riposte, peur, provocation, silence, désarmement, vulnérabilité, poison, grenades collantes ou à fragmentation, roquettes à tête chercheuse, charges, barillet à recharger, Grogu, drone, dôme anti-tirs, zone qui ralentit le temps…

Équilibrage : points de vie, dégâts et vitesse calculés en simulant des centaines de duels entre ordinateurs (table `BAL` dans le code).

Héros : Luke, Yoda, Rey, Han, Leia, Chewbacca, Obi-Wan, Anakin, Mace Windu, Ahsoka, Qui-Gon, Finn, Lando, Padmé, Din Djarin, Cal Kestis, Capitaine Rex, Wicket, R2-D2, Jyn Erso.
Méchants : Vador, Palpatine, Maul, Kylo Ren, Boba Fett, Grievous, Dooku, Ventress, Savage Opress, Jango Fett, Phasma, Iden Versio, Bossk, Cad Bane, Grand Inquisiteur, Seconde Sœur, Moff Gideon, Thrawn, Death Trooper, IG-88.

## Contrôles
- ZQSD/WASD ou flèches pour bouger, souris pour viser.
- Clic G, Clic D, Espace, Q (A en AZERTY), E : sorts. R : ultime (100 d'énergie).
- **Maj + sort** : version EX (25 d'énergie). Comme dans Battlerite, c'est un sort dérivé avec son propre effet (ex. Ruée → Ruée aérienne qui projette en l'air, Détonateur → Grappe de grenades).
- **F** (porteurs de sabre) : parade. Une parade déclenchée au bon moment (0,3 s) renvoie le tir vers le tireur ; une garde tenue ne fait que bloquer. Consomme de l'endurance ; si elle tombe à zéro, la garde est brisée.
- Tab (maintenu) : tableau des scores (éliminations, morts, assistances, dégâts infligés et subis, soins) ; le même tableau s'affiche en fin de partie avec le meilleur joueur (★).
- **En ligne jusqu'à 8 joueurs** : l'hôte ouvre un salon, ses amis (7 max) entrent le code. Chacun choisit son héros (un héros pris est marqué) ; en duel et en bataille chacun choisit son équipe A ou B (en arène, tous les joueurs affrontent des bots). La partie démarre quand tout le monde est PRÊT ; si un ami se déconnecte, l'ordinateur reprend son perso.
- ⚙ Partie : taille des équipes en arène/duel (1v1, 2v2, 3v3, complétées par des bots), manches gagnantes, taille de la bataille (5 à 20 par camp), renforts, mort subite, holocron, soins au sol. En ligne, c'est l'hôte qui règle.
- M : couper le son · O (ou bouton ⚙ en bas à droite) : options audio (volume général, bruitages, répliques, cri Wilhelm, son spatialisé), gardées dans le navigateur.

## Mécaniques
Incantations avec zone affichée au sol (esquivables), interruptions par étourdissement ou repoussement, renvoi (contre), parade, énergie à gérer entre sorts EX et ultime.
