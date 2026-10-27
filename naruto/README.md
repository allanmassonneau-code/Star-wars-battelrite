# Naruto · Arène ninja

Même moteur que l'arène Star Wars (vue 3/4 façon Battlerite, arène, bataille, duel, en ligne jusqu'à 8), mais dans le monde de Naruto, et **on joue son propre ninja**.

## Créer son ninja
- **Apparence** : nom, camp (Alliance Shinobi / Akatsuki), village du bandeau (Konoha, Suna, Kiri, Kumo, Iwa, Oto, Nukenin), tenue, coiffure, cheveux, peau, couleur du chakra, accessoire. Le clan se voit (Sharingan rouge, Byakugan, carrure Akimichi, marques Kaguya).
- **Voie** : Taijutsu (plus de PV et de vitesse), Équilibré, Ninjutsu (plus de puissance).
- **Nature** : Katon (feu), Suiton (eau), Fûton (vent), Raiton (foudre), Doton (terre) : chacune débloque ses jutsu.
- **Clan** : Uchiha, Hyûga, Nara, Akimichi, Aburame, Inuzuka, Uzumaki, Yamanaka, Sabaku, Kaguya, chacun avec ses jutsu de clan. **Sans clan**, on débloque une **2e nature**.
- **Kit** : 6 jutsu (Clic G, Clic D, Espace, Q, E, R) + un passif. Jutsu universels (kunai, Kawarimi, Rasengan, Multiclonage, invocations…) + ceux de sa nature et de son clan.
- **Rangs D, C, B, A, S** = 1 à 5 points. Le kit a **17 points** : impossible de ne prendre que des rangs S, il faut choisir.
- **Modèles** inspirés des ninjas célèbres (style Naruto, Sasuke, Itachi, Gaara, Neji, Shikamaru, Kakashi, Rock Lee, Kiba, Shino, Sakura, Chôji, Ino, Kimimaro, Jiraiya, Deidara) pour démarrer vite, plus kit et apparence aléatoires.

## En jeu
- Effets visuels propres à chaque élément : boules de feu et braises, vagues et requin d'eau, lames de vent, Chidori crépitant, rochers, sable, ombres, nuées d'insectes, os, parchemins explosifs, fumée des clones, feuilles du Shunshin.
- Auras pendant les jutsu de renforcement : manteau et queues de Kyûbi, vapeur des Huit Portes, Susanô spectral, peau de pierre, armure de foudre, Kaiten, armure de sable.
- Mudras (signes des mains) pendant les incantations, annonce plein écran de ton ultime, bûche du Kawarimi, crapaud qui tombe, Rasen-shuriken qui s'abat.
- Sons synthétisés par élément (feu, eau, vent, Chidori, terre, sable, « pouf » des clones…).
- Chakra (barre bleue) : se remplit en combattant, sert aux EX (Maj, 25) et aux ultimes (100).
- Cartes : Terrain d'entraînement, Vallée de la Fin, Désert de Suna (⚙ Partie).
- Parade au kunai (F), tableau des scores (Tab), réglages de partie et de son (O), pilule du soldat au centre de l'arène, mort subite.

## Technique
`naruto/index.html` est généré à partir du jeu Star Wars : `python3 naruto/build/mknaruto.py` (modules dans `naruto/build/`).
