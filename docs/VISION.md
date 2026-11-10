# Orbite — la vision de la personne (maquettes du 10/11/2026)

Quatre planches de maquettes (générées avec ChatGPT) montrent **où elle veut aller**. Ce n'est pas le plan
des prochaines étapes : c'est la cible, à garder en tête pour que chaque étape serve à y arriver.
(Les images ne sont pas dans le dépôt ; la personne les a. Dire si on veut les y ajouter.)

## L'idée en une phrase

Un « Instagram de liens » en 3D : **une méga-galaxie** regroupe des **galaxies par thème** (Musique, Gaming,
Voyages, Cuisine, Création, Nature…) ; une galaxie contient des **systèmes** (une personne = un système solaire) ;
un système a des **planètes** (ses liens) ; une planète s'ouvre sur son panneau de liens.

```
Méga-galaxie → Galaxie « Musique » → Système de ChefLuna → Planète « Techno » → liens (Spotify, YouTube…)
```

## Ce que les maquettes montrent

| Écran | Contenu |
|---|---|
| Accueil / onboarding | « Explore des univers, découvre des créateurs et partage le tien » ; Commencer ; « J'ai déjà un compte ». |
| Méga-galaxie | Une grande galaxie ; pastilles de thèmes en bas (Musique, Gaming, Voyages, Cuisine, Autres) ; **flèches ‹ › et glisser pour tourner d'une galaxie à l'autre**. |
| Galaxie d'un thème | Liste de créateurs (nom, métier, abonnés, cœur) avec filtres Populaire / Nouveau / DJ / Live. |
| Un système | Planètes autour d'un soleil ; chiffres (planètes, visites, liens) ; « Explorer le système » ; partager. |
| Une planète | Grosse île en gros plan, puis liste de liens (Spotify, YouTube, SoundCloud, événements). |
| Voyage | Écran « Direction la galaxie Musique » : traversée à vitesse lumière, fusée. |
| « Ma galaxie » | Les galaxies de la personne (celles qu'elle suit / crée), recherche, créer sa galaxie. |
| Compte | Mon univers, modifier, créer / éditer un système (nom, thème, visibilité public/privé), favoris, paramètres. |
| Social | Suivre, favoris, planètes privées (« Demander l'accès »), communautés, fil de discussion, messagerie. |

## Ce qui existe déjà (session 5) et va dans ce sens

- Un système = une personne, ses planètes, son lien direct (`#id`).
- **Voyager d'un système à l'autre** en balayant à l'horizontale ou avec les flèches ‹ › : c'est le début de la
  « navigation par rotation » des maquettes.
- Bande « Amis ».

## Ce qui est très différent de ce qu'on a fait, et à trancher plus tard

- **Les galaxies sont des thèmes, pas une carte d'inconnus.** C'est ce qui rend « se perdre » intuitif (on choisit
  « Musique » et on défile des gens qui font de la musique). Cela remplace l'ancienne idée G2-G5 (carte de tous les systèmes).
  À valider avec elle.
- Besoin d'un **thème par système** dans `galaxie.json` (ex. `"galaxie": "musique"`).
- Comptes, favoris, suivre, planètes privées, communautés, messagerie : **tout cela demande un serveur** (Supabase).
  Elle veut d'abord tester sans serveur avec ses copains : on n'y touche pas avant d'avoir vu l'intérêt.
- Les îles des maquettes (bien plus détaillées) viendront de modèles Blender, pas du code actuel.
