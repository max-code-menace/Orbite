# Orbite — brief du prototype 1

(Copie de travail du brief d'origine, rédigé dans un document Claude Docs.)

## Le but

Un seul écran, sur téléphone : le système d'une personne avec ses 5 planètes en 3D. On veut répondre à trois
questions avant d'aller plus loin :

1. **Est-ce que ça tourne bien**, même sur un vieux téléphone ?
2. **Est-ce qu'on comprend tout de suite** où toucher pour ouvrir quelque chose ?
3. **Est-ce qu'on trouve un lien en moins de 5 secondes**, sans jamais devoir explorer ?

Ce prototype sert à décider, pas à être joli à tout prix. Le système de la page est un exemple, avec des liens à remplir.

## Ce qu'on fait, ce qu'on ne fait pas

| Dans le prototype | Pas encore |
|---|---|
| Le système d'une personne, avec 5 planètes en 3D | Les comptes et la connexion |
| Vue fixe : les planètes flottent et tournent doucement sur elles-mêmes | Faire tourner le système au doigt |
| Toucher une planète ouvre son panneau avec ses liens | La galaxie et le voyage entre systèmes |
| La liste Accès rapide en bas | Créer ou modifier son système dans l'appli |
| Une planète libre dont le décor change au hasard | La décoration (arbres, créatures à placer soi-même) |
| Les liens écrits dans un fichier simple, faciles à changer | L'appli iPhone et Android : ici, c'est une page web |

## L'écran et les interactions

- **En haut** : photo de profil (rond), nom, pseudo, bio d'une ligne.
- **Au centre** : un petit soleil (la personne), 5 planètes à places fixes sur des orbites en pointillé lumineux,
  qui flottent et tournent lentement ; une étiquette flottante au-dessus de chacune, toujours lisible.
- **En bas : Accès rapide** : 5 lignes (icône, nom, premier lien) ; toucher une ligne ouvre le lien principal ;
  à moitié ouverte au départ, on la remonte du doigt.
- **Toucher une planète** : la caméra s'approche (moins d'une demi-seconde) ; un panneau monte du bas (nom, une
  phrase, 2 ou 3 liens) ; il couvre au plus la moitié de l'écran ; croix, tap à côté ou glisser vers le bas ferment tout.
- **La planète libre** : dans son panneau, un bouton « Changer de décor » tire au hasard une nouvelle couleur et un
  nouveau décor, avec une petite animation.

## Les 5 planètes

| Planète | Couleurs | Décor | Anneau | Liens d'exemple |
|---|---|---|---|---|
| Instagram | Rose et orange | Petits cadres photo plantés, fleurs | Rose | Voir mon profil · Ma dernière photo |
| YouTube | Rouge corail | Grand écran avec triangle de lecture, deux maisons-studios | Orange | Ma chaîne · Ma dernière vidéo |
| Spotify | Vert néon | Scène de festival, deux enceintes, barres d'égaliseur qui bougent | Vert | Ma playlist du moment · Mon profil |
| Voyage | Bleu océan | Île de sable et palmiers, montagne enneigée, petit avion qui fait le tour | Bleu | Mon dernier voyage · Les endroits où je suis allé |
| Planète libre | Au hasard | Au hasard : forêt, cristaux, champignons, glace, volcan | Au hasard | Le nom et les liens qu'on veut |

Chaque planète accueille aussi une petite créature mignonne, purement décorative, qui bouge un peu (saute, tourne
la tête). Si ça alourdit trop, on l'enlève en premier.

## Le style

Violet néon, mignon et vivant, comme un petit jeu d'exploration spatiale (maquettes générées avec ChatGPT).
Fond spatial bleu nuit et violet avec étoiles et astéroïdes ; planètes en 3D low-poly douce, très colorées ;
reflets violets, bleus et roses, lumière chaude du soleil ; anneaux et orbites fins et lumineux ; interface en
panneaux arrondis, texte blanc bien contrasté, boutons assez grands pour le pouce. À éviter : réalisme, froid,
minimalisme, trop de lueurs sur le texte (lisible en plein soleil).

## Les choix techniques

- Une page web (le lien en bio s'ouvre dans un navigateur). Three.js. Planètes construites dans le code à partir de
  formes simples, pas de modèles 3D téléchargés pour ce prototype.
- Données (nom, bio, liens) dans un fichier simple, modifiable sans toucher au code.
- Texte et panneaux en HTML normal par-dessus la 3D.
- Pour que ça ne rame pas : peu de facettes, pièces réutilisées ; résolution limitée ; animation arrêtée quand la
  page n'est plus visible ; mode allégé automatique (moins d'étoiles, pas de créatures, pas de lueurs) ; respect de
  « réduire les animations » ; mise en ligne gratuite.

## Critères de réussite (sur nos deux appareils, dont au moins un « vieux »)

- [ ] La page s'ouvre en moins de 3 secondes en 4G.
- [ ] L'animation reste fluide : 60 img/s sur un téléphone récent, au moins 30 sur un vieux.
- [ ] Le téléphone ne chauffe pas après 2 minutes sur la page.
- [ ] Ça marche sur iPhone (Safari) et sur Android (Chrome).
- [ ] Chaque planète se touche facilement avec le pouce, sans viser.
- [ ] Quelqu'un qui découvre la page trouve un lien précis en moins de 5 secondes.
- [ ] Changer un lien dans le fichier de données suffit pour qu'il change sur la page.
- [ ] Le texte reste lisible dehors, en plein jour.
