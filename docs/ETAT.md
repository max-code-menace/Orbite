# Orbite — état du projet

Dernière mise à jour : 10 novembre 2026, session 5 (voyage entre systèmes fusionné et en ligne ; étape « thèmes » faite, à fusionner).

## Le plan en 8 étapes

| Étape | Contenu | État |
|---|---|---|
| 1 | Ciel étoilé, astéroïdes, soleil, mise en ligne | ✅ fait, validé sur appareil |
| 2 | 5 îles flottantes, orbites en pointillé, anneaux néon, étiquettes | ✅ fait, validé sur appareil |
| 3 | Profil en haut, Accès rapide en bas (glissable), système cadré entre les deux | ✅ fait, validé sur appareil |
| 4 | Toucher une planète : caméra qui s'approche + panneau de liens | ✅ fait, validé sur appareil |
| 5 | Décors des îles | ✅ fait, testé en simulation ; **pas encore mesuré sur appareil** (fluidité, animations, 3 décors libres jamais vus sur appareil) |
| 6 | Bouton « Changer de décor » sur la planète libre, avec animation | ✅ fait ; mesuré : iPhone 15 à 60 img/s, tablette à 83-90 img/s |
| 7 | Petites créatures décoratives (facultatives, à retirer en premier si ça rame) | ✅ fait, testé en simulation ; **pas encore vu ni mesuré sur appareil** |
| 8 | Derniers réglages de fluidité + checklist des critères de réussite du brief | ⏳ à faire |

## Où on s'est arrêté (session 5)

- **Étape « thèmes » faite** (branche de session, à fusionner), 1re étape vers `docs/VISION.md` : `galaxie.json` a une liste
  `themes` (Musique, Voyages, Cuisine, Gaming, Création, Nature) et chaque système un `theme` (exemples inventés). La bande sous
  le profil montre des pastilles « Tous · Musique · … » **avant** les amis (la bande défile). Toucher un thème emmène dans son
  premier système ; flèches et balayage restent ensuite **dans ce thème** (on refait le tour) ; « Tous » = toute la liste.
  Arriver chez quelqu'un d'un autre thème (ami, adresse) repasse sur « Tous ». Le thème choisi n'est pas gardé dans l'adresse
  (`#id` seulement) ni au rechargement. Validation : thèmes uniques, id sûr, nom ≤ 20 caractères, ≤ 12 thèmes, chaque thème a un système.
  **Vérifié (simulation)** : tests rapides 70/70 ; `npm run verifier` ✅ téléphone + tablette (pastilles, choix d'un thème, tour du
  thème par flèche et par balayage, retour à « Tous », ami d'un autre thème) ; captures regardées. **Pas vérifié** : le ressenti
  sur appareil ; **les amis sont maintenant cachés à droite des pastilles** (il faut faire défiler la bande) : à juger sur
  téléphone si c'est trop discret.

- **Réflexion de la session 5** : le visiteur d'un lien en bio ne reste que s'il a « quelque chose à lui ». Direction choisie
  avec la personne, **sans serveur** (on teste d'abord avec ses copains, systèmes ajoutés à la main dans `galaxie.json`) :
  A) « Fais le tien » (formulaire qui prépare un message, rien d'enregistré) — **pas encore fait** ;
  B) « Ses amis » + se perdre en défilant, façon Reels mais **à l'horizontale** (le vertical sert déjà à l'Accès rapide
  et au panneau). Les exemples inventés (« (exemple) ») suffisent pour l'instant.
- **Étape « voyage » faite** (branche de session, à fusionner) : balayage gauche/droite sur la 3D, ou flèches, pour passer au
  système suivant/précédent (ordre de la liste, on revient au début au bout) ; bande « Amis » sous le profil (toucher un ami
  ouvre son système) ; l'adresse `…/#noe` ouvre directement un système et suit les voyages ; animation de sortie (0,18 s) et
  d'entrée (0,28 s), instantanée avec « réduire les animations ». Le balayage est ignoré quand une planète est ouverte.
  Données : champ facultatif `amis` (ids, 6 au plus, pas soi-même) dans `galaxie.json`, validé.
- **Vérifié (simulation)** : tests rapides 61/61 ; `npm run verifier` ✅ téléphone + tablette (balayage, flèches, amis,
  adresse, adresse abîmée/inconnue, adresse changée en plein voyage, planète ouverte, « réduire les animations ») ;
  12 voyages de suite : nombre de formes 3D gardées stable (52 → 52, test tolérant : il attrape une grosse fuite, pas une
  petite) ; captures regardées ; agents `securite` PRÊT et `relecteur` (a demandé cette mise à jour d'ÉTAT + 2 corrections d'adresse, faites).
- **Pas vérifié (à faire sur tes appareils)** : fluidité réelle à chaque voyage (iPhone 15, S10 Lite) ; geste au pouce et
  Safari ; ressenti de l'animation (seuls départ et arrivée sont testés) ; matières 3D non libérées à chaque voyage
  (volontaire : partagées) ; **l'envie de continuer** (impossible à mesurer avec des systèmes inventés).
- **La cible (maquettes de la personne, 10/11)** : méga-galaxie → galaxies par thème → systèmes → planètes, navigation par
  rotation, voyage « Direction la galaxie… », comptes/favoris/messagerie. Décrite dans `docs/VISION.md`. Elle ne remplace pas
  les étapes ci-dessous ; elle dit où on va. Le « voyage » de la session 5 en est le début.
- **Suite possible** : « Fais le tien » ; « Surprends-moi » ; mettre les amis d'abord dans l'ordre du défilé ; thèmes.

## Où on s'est arrêté (session 4)

- Étape 7 (créatures) fusionnée (PR n°5) et en ligne. La personne ne les voit pas sur son iPhone (compteur à
  « qualité 5/5 », donc pas retirées par le mode allégé) : trop petites, ou pas affichées par Safari — **non
  tranché, abandonné à sa demande** : les îles seront refaites dans Blender, on n'investit plus dans leur aspect.
- **Virage décidé par la personne : avancer vers l'application.** Nouveau plan : `docs/BRIEF-2.md` (validé).
  Ordre : la galaxie d'abord (G1 à G5, sans serveur), puis comptes + messagerie (Supabase, à détailler).
  L'étape 8 du prototype 1 est absorbée par ce plan.
- **G1 faite** (sur la branche de session, PR à fusionner) : `public/systeme.json` remplacé par
  `public/galaxie.json` = liste de 12 systèmes (Luna + 11 personnes **inventées**, bio marquée « (exemple) », liens vers les pages d'accueil seulement — jamais de vrai profil d'un tiers sans son accord). Chaque
  système a un `id` (minuscules, chiffres, tirets : servira dans l'adresse, étape G5). Mêmes contrôles qu'avant,
  appliqués à chaque système. La page affiche toujours le premier système (Luna) : rien ne change à l'écran.
- À surveiller : une fois sur 3 passages du test (10/11, pendant qu'un autre test tournait en même temps), la
  capture « planète ouverte » du téléphone était vide (fond violet, aucune 3D). Non reproduit ensuite, ni sur la
  branche principale : cause inconnue. Le test ne vérifie pas que la 3D est dessinée derrière le panneau.
- G1 fusionnée (PR n°6) et en ligne (vérification GitHub ✅).
- **Galaxie mise en pause par la personne (fin de session 4)** : la carte de systèmes d'inconnus (Inès, Noé,
  Milo…) ne lui semble ni intuitive ni agréable. Ce qu'elle garde : cliquer sur un lien en bio et arriver sur le
  système solaire de la personne, « c'est trop bien ». **La question à travailler (dans une nouvelle
  conversation) : comment donner envie de rester dans l'application quand on sort du système de la personne
  dont on a cliqué le lien — qu'est-ce qu'on fait ensuite ?** Les étapes G2 à G5 de `docs/BRIEF-2.md` ne sont
  donc plus le plan ; G1 (plusieurs systèmes dans les données) reste utile quelle que soit la réponse.
- Question toujours en suspens pour la messagerie : entre qui ?
- Auditeur du harnais : vers le 10 décembre 2026.

## Mesures faites sur les vrais appareils

- **iPhone 15 (Safari)** : 60 img/s constant, au repos comme pendant le rapprochement (après l'étape 4).
- **Tablette Samsung S10 Lite (Chrome)** : 60-67 img/s à l'étape 1 ; tombée à **24 img/s** à l'étape 4 ;
  remontée à **80-89 img/s** après avoir retiré le flou `backdrop-filter`, plafonné la résolution et rendu le
  canvas opaque. Le mode allégé automatique n'a donc pas eu à agir sur elle.
  Étapes 5-6 (10/11/2026, `v=12`) : **90 img/s constant** ; **83 img/s** en touchant « Changer de décor » à répétition.
- **iPhone 15**, étapes 5-6 (`v=12`) : **60 img/s** en touchant « Changer de décor » plusieurs fois.
- Rien n'a encore été mesuré sur un vrai « vieux » téléphone.

## Comment c'est construit (fichiers)

| Fichier | Rôle |
|---|---|
| `public/galaxie.json` | Les données : la liste des systèmes ; chacun = id + profil + 5 planètes (id, nom, description, liens). Modifiable à la main. |
| `src/main.js` | Moteur 3D, caméra (repos / rapprochement), cadrage, toucher, fluidité (budget de pixels, paliers du mode allégé). |
| `src/sky.js` | Étoiles (un seul objet, scintillement dans le shader) et astéroïdes (`InstancedMesh`). |
| `src/sun.js` | Soleil à facettes, halos, lumière chaude. |
| `src/planets.js` | Îles flottantes, anneaux, orbites, étiquettes HTML, zones de toucher invisibles, couleurs par planète. |
| `src/decors.js` | Décors des îles. `Assemblage` fusionne les pièces fixes d'une île en un seul objet. Décors de la planète libre : `decorsLibres` (foret, cristaux, champignons, glace, volcan). |
| `src/creatures.js` | Étape 7 : la petite bestiole de chaque île (corps rond, yeux, accessoire), fusionnée en un seul objet ; son saut / tour de tête (`pose`). |
| `src/parcours.js` | Voyage entre systèmes : adresse `#id`, suivant/précédent, amis, sens d'un balayage (logique pure, testée). |
| `src/amis.js` | La bande sous le profil : flèches précédent/suivant et amis du système affiché. |
| `src/ui.js` | Profil, Accès rapide (feuille glissable ; colonne fixe sur tablette à l'horizontale), panneau d'une planète. |
| `src/icons.js` | Icônes maison (pas de vrais logos). |
| `src/style.css` | Styles. Pas de `backdrop-filter`. |
| `scripts/verifier-donnees.mjs`, `scripts/donnees.mjs` | Vérifient `galaxie.json` (JSON valide, ids de systèmes uniques et utilisables dans une adresse, 5 planètes par système, liens et photo en https uniquement). |
| `src/fluidite.js` | Budget de pixels, paliers du mode allégé (sortis de `main.js` pour être testés sans navigateur). |
| `scripts/check.mjs`, `scripts/niveaux.mjs` | `npm run check` : choisit le niveau de vérification d'après les fichiers modifiés. |
| `tests/` | Tests rapides (< 1 s) : données, règles du projet, logique, niveaux, harnais. |
| `scripts/hooks/`, `.githooks/`, `.claude/settings.json` | Hooks automatiques et commandes interdites à Claude. |
| `scripts/test-mobile.mjs` | Test Playwright sur téléphone et tablette : 3D affichée, étiquettes, Accès rapide, ouverture/fermeture du panneau, « Changer de décor » (décor, couleurs, animation), aucune erreur. Captures dans `test-resultats/`. |
| `.claude/agents/` | `relecteur` (avant fusion), `securite` (zones sensibles), `auditeur-harness` (une fois par mois). |
| `.github/workflows/deploy.yml` | Sur chaque envoi : `npm run check -- --ci` (niveau 3). Sur la branche principale seulement, et si tout passe : mise en ligne GitHub Pages. |

## Décisions prises (et pourquoi)

- **Three.js sans React**, construit avec Vite : un seul écran, page plus légère, s'ouvre plus vite en 4G.
- **Îles flottantes** plutôt que boules rondes (choix de la personne, d'après ses maquettes).
- **Plan des orbites incliné vers la caméra** (`INCLINAISON` dans `planets.js`) : les orbites restent rondes à
  l'écran tandis que les îles, droites, montrent leur rocher.
- **Pas de flou d'arrière-plan** : c'était la cause du passage de la tablette à 24 img/s.
- **Mode allégé automatique** : sous 50 img/s pendant 2 s, on passe au palier suivant (5 paliers depuis l'étape 7).
  Le 1er cran retire seulement les créatures ; les 3 suivants baissent la finesse du dessin.
  `?fps` affiche le compteur et « qualité N/5 » (avant l'étape 7 : « finesse N/4 ») ; `?qualite=1..5` force un
  palier pour tester (`?qualite=2` = sans créatures).
- **Créatures (étape 7, option A)** : la même bestiole ronde sur chaque île, couleur de sa planète éclaircie à 60 % vers le blanc
  (sinon elle se confond avec l'herbe, surtout sur Spotify), agrandie 1,7x pour être visible. Accessoires : appareil photo (Instagram),
  casquette (YouTube), casque audio (Spotify), valise (Voyage), bonnet (planète libre ; sa couleur suit le décor).
  Toutes les 3,2 à 4,2 s, un saut puis, la fois suivante, un tour de tête ; immobiles avec « réduire les animations ».
  5 objets 3D de plus à dessiner au total. Vues de loin (écran d'accueil), elles sont toutes petites.
- **Formes construites dans le code** pour ce prototype. Le rendu « vraies îles » des maquettes demandera des
  modèles faits dans Blender (format `.glb`, ~1-2 Mo max par île), chargés à la place de `creerIle` + `creerDecor`.
  Décidé avec la personne : on valide d'abord le prototype.
- **Sur tablette à l'horizontale**, l'Accès rapide devient une colonne fixe à droite (sinon le système était minuscule).
- **La planète libre** tire son décor et ses couleurs au hasard au chargement (`typesLibres`).
- **« Changer de décor » (étape 6)** : bouton visible seulement dans le panneau de la planète libre. Il tire un
  décor toujours *différent* de l'actuel (sinon on croirait que rien ne se passe). Animation « pop » de 0,6 s
  (`animerPop` dans `planets.js`) : l'île rapetisse en tournant, change de décor, regrossit avec un rebond ;
  instantané si « réduire les animations ». Changent : herbe, terre, anneau, icône de l'étiquette, accent du
  panneau. L'ancien décor est effacé de la mémoire. Le rocher garde sa couleur (commun à toutes les îles).
  Non changée : l'icône de la planète libre dans l'Accès rapide reste violette (comme avant l'étape 6).
  Le choix n'est pas mémorisé : au rechargement, nouveau tirage.

## Ce qu'il faut savoir pour la suite

- **Les tests tournent sur un téléphone et une tablette simulés** (Chromium, 3D logicielle), pas sur les vrais
  appareils ni sur Safari. Fluidité réelle, toucher au pouce, chaleur, plein soleil : à mesurer par la personne.
- `window.orbite.planetes()` expose (en lecture seule) l'état des décors pour le test automatique.
- Jusqu'ici (session 1), le travail se faisait directement sur la branche principale : chaque envoi était mis en
  ligne sans pull request. À partir de la session 2 : branche de session + pull request fusionnée par la personne.
- Poids de la page : ~616 Ko de JavaScript (~157 Ko compressés), surtout Three.js. À surveiller pour le critère
  « s'ouvre en moins de 3 s en 4G » (étape 8).

- Le navigateur garde la page en cache jusqu'à ~10 minutes : donner des liens avec `&v=N` (dernier utilisé : `v=14`).
- Le compte GitHub Pages est activé avec la source « GitHub Actions ». La branche principale du dépôt est
  `ccr-be406ff5-wxbiv4` : c'est elle qui est mise en ligne.
- Étape 8 : le brief demande aussi « moins d'étoiles, pas de lueurs » dans le mode allégé ; aujourd'hui seuls les
  paliers de résolution existent.
