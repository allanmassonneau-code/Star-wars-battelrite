# Naruto · Arène ninja

Même moteur que l'arène Star Wars (vue 3/4 façon Battlerite, arène, bataille, duel, en ligne jusqu'à 8), mais dans le monde de Naruto, et **on joue son propre ninja**.

## Créer son ninja
- **Clan** (ou sans clan) : Uchiha, Hyûga, Nara, Akimichi, Aburame, Inuzuka, Uzumaki, Yamanaka, Sabaku, Kaguya, Taijutsuka (style Rock Lee / Gai).
- **Style de combat** (attaque de base, gratuit) selon le clan :
  - Sans clan : Taijutsu ou Kunai
  - Uchiha : Kenjutsu ou Taijutsu Uchiha · Hyûga : Poing souple · Nara : Fouet d'ombre · Akimichi : Poing décuplé
  - Aburame : Nuée d'insectes ou Taijutsu + insectes · Inuzuka : Crocs et griffes (avec le chien ninja)
  - Uzumaki : Taijutsu ou Chaînes de chakra · Yamanaka : Kunai ou Senbon fleuris · Sabaku : Balles de sable · Kaguya : Danse des os · Taijutsuka : Taijutsu du fauve
- **Kit** (5 jutsu : Clic D, Espace, Q, E, T) = jutsu de **clan** (ou **Subjutsu** si sans clan : Rasengan, Multiclonage, Hiraishin, parchemins, invocations, Mode Ermite…) + jutsu d'**une nature**. Les Taijutsuka n'ont pas de nature.
- **Natures** (11 jutsu chacune, de D à S, mécaniques propres) :
  - Katon : flammes, mur de feu, shuriken aériens, fournaise, dragon redirigeable, tornade, Nuée ardente, Grand souffle
  - Fûton : balles d'air (en rafale ou chargées), mur de vent, lame perçante, souffle, couloir de vent, tornade qui emporte
  - Suiton : Teppôdama, Suijinheki, Mizurappa, requin traqueur, prison aqueuse, Kirigakure, dragon aqueux, Daibakufu, corps liquide, requin géant qui avale les jutsu, dôme des requins
  - Raiton : éclair, décharge, chaîne d'éclairs, Chidori Nagashi, Chidori Eisô, panthère noire, Chidori, orage, pas de l'éclair, Kirin, armure de foudre
  - Doton : rocher, Doryûheki, pics de terre, marécage, corps de roche, main de terre, dragon de terre, Kajûgan, taupe, chute de montagne, grand séisme
- **Clans** : chacun a ses techniques de D à S (ex. Uchiha : Kamui, Izanagi, Amaterasu, Tsukuyomi, Susanô ; Hyûga : 128 points ; Nara : Kage Nui ; Akimichi : Mode Papillon ; Sabaku : Bouclier absolu, Funérailles du désert ; Kaguya : danses du saule, du mélèze et de la clématite…)
- **Rangs D, C, B, A, S** = 1 à 5 points, budget de **17 points** par kit. Pas de versions EX.
- **Voie** (Taijutsu, Équilibré, Ninjutsu), **passif**, apparence complète (village, tenue, coiffure, cheveux, peau, couleur du chakra, accessoire).
- **18 modèles** inspirés des ninjas célèbres (style Naruto, Sasuke, Itachi, Gaara, Neji, Shikamaru, Kakashi, Rock Lee, Gai, Kiba, Shino, Sakura, Chôji, Ino, Kimimaro, Jiraiya, Minato, Deidara).

## En jeu
- L'arme suit le style : poings bandés, kunai, sabre, paume lumineuse, poing géant, griffes + chien, os, gourde de sable, chaîne, senbon, insectes.
- Ninjas animés : respiration, course avec les bras, « course ninja » quand on est rapide, fente sur les coups, garde croisée, mudras pendant les incantations, recul quand on est touché.
- Jutsu reconnaissables : sphère du Rasengan, Chidori qui crépite, traînée jaune du Hiraishin, Rasen-shuriken, Kirin, dragon d'eau, requin, prison aqueuse, Kage Mane et mains d'ombre, cercueil de sable, Kaiten, trigramme des 64 points, Byakugan, Tsukuyomi (lune rouge), Amaterasu (flammes noires), Susanô, manteau de Kyûbi, Huit Portes, Paon du matin, Tigre du soir, vrilles du Gatsûga, forêt d'os, Katsuyu, sceaux, feuilles du Shunshin, bûche du Kawarimi, crapaud géant.
- Rythme posé : jeu à 80 %, **R maintenu = recharger le chakra**, chaque jutsu coûte du chakra et demande des **mudras** (D 2, C 3, B 4, A 5, S 6 ; subjutsu, jutsu de clan et déplacements sans mudra), animés signe par signe.
- **Ambiance NRP** : combats plus longs et posés (PV ×1,4, course 10 % plus lente, duel IA ≈ 1 min). Le chakra est **rare** : une jauge pleine ≈ 5 jutsu, presque pas de régénération en combat, il ne revient plus en frappant. **R** recharge mais immobilise, fait prendre +20 % de dégâts et un coup franc brise la concentration. Sans assez de chakra, le jutsu ne part pas (« CHAKRA INSUFFISANT », case grisée avec son coût). À sec, le ninja est **épuisé** (plus lent, endurance lente, garde coûteuse, pas de sprint) jusqu'à 25 de chakra.
- **Soin (H)**, commun à tous : soigne l'allié le plus proche du curseur à 600 de portée (ou toi) de 25 % de ses PV + 8 % en 2 s, 0,3 s d'incantation (un étourdissement l'interrompt), 60 s de recharge, sans chakra.
- Clic gauche : **combo de 5 coups** au corps à corps (le 5e étourdit, l'endurance permet un combo complet) ; à distance, 10 tirs par barre d'endurance.
- Prise en main fluide : déplacements vifs, **Maj maintenue = sprint** (consomme l'endurance), touches mémorisées pendant un coup ou une incantation, caméra rapprochée qui regarde devant.
- Sons synthétisés par élément, annonce plein écran de ton ultime.
- Cartes : Terrain d'entraînement, Vallée de la Fin, Désert de Suna (⚙ Partie), avec feuilles, sable ou brume.

## Technique
`naruto/index.html` est généré à partir du jeu Star Wars : `python3 naruto/build/mknaruto.py` (modules dans `naruto/build/`).
