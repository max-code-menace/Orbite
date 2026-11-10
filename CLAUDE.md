# Orbite — règles du projet

Ce fichier est lu au début de chaque session. Il passe avant les habitudes par défaut.

## À lire en premier

1. `docs/BRIEF.md` : ce qu'on construit (prototype 1) et les critères de réussite.
2. `docs/ETAT.md` : où on en est, ce qui a été décidé et pourquoi, ce qui reste à faire.

Mets `docs/ETAT.md` à jour à la fin de chaque étape terminée.

## Avec qui on travaille

La personne n'est pas développeuse. Elle teste sur un iPhone 15 et une tablette Samsung S10 Lite.

- Parle en français, avec des mots simples. Explique chaque étape sans jargon (ou explique le jargon).
- Une étape à la fois. Avant de coder une étape : dis ce que tu vas faire, et attends son accord.
- À la fin de chaque étape, dis-lui exactement : quel lien ouvrir (avec `?fps&v=N`, N augmenté à chaque fois,
  pour contourner le cache du navigateur), quoi regarder, quoi mesurer.

## Le récap de fin d'étape (demandé par la personne)

Quand une étape (ou une tâche) est finie, termine **toujours** par un récap **court et précis**, écrit pour un
débutant : 15 lignes au plus, sans jargon. Toujours dans cet ordre :

1. **En une phrase** : ce qui a changé, tel qu'on le voit à l'écran.
2. **Un petit schéma** (dessiné avec du texte) quand ça aide à comprendre : un avant/après, un enchaînement.
3. **✅ Vérifié** et **❓ Pas vérifié** : 2 ou 3 points chacun, les plus importants.
4. **👉 À vous** : ce que la personne doit faire (fusionner, ouvrir tel lien, regarder telle chose, mesurer tel chiffre).

Les détails viennent ensuite, seulement s'ils sont utiles, et clairement séparés du récap.

## Développement honnête

- **Ne dis jamais « ça marche » sans preuve.** La preuve, c'est : `npm run verifier` qui passe, et les captures
  d'écran de `test-resultats/` que tu as regardées. Cite ce que tu as vérifié.
- **Sépare toujours « vérifié » et « pas vérifié ».** Ici on n'a pas de vrai téléphone : la fluidité réelle
  (images par seconde), le toucher au pouce, la chaleur, la lisibilité en plein soleil ne se vérifient que sur
  ses appareils. Dis-le, et demande-lui de mesurer.
- **Une hypothèse est une hypothèse.** Si tu corriges un problème sans pouvoir le reproduire (ex. une lenteur
  sur la tablette), présente la correction comme une piste et demande une mesure avant de la déclarer réglée.
- **N'invente aucun chiffre** (performances, prix, délais, statistiques). Si tu ne sais pas, dis-le.
- **Dis-le quand c'est raté.** Un test qui échoue, une étape sautée, un compromis : on l'annonce, on ne le cache pas.
- **Ne lui demande pas de faire ce que tu peux faire toi-même.** Mais quand une action ne peut être faite que par
  elle (réglages GitHub, fusion d'une pull request), dis-le clairement, avec le chemin exact à suivre.

## Les harnais (garde-fous)

- `npm run verifier` = vérification de `public/systeme.json` + construction + test automatique sur téléphone et
  tablette (Playwright). **Il doit passer avant chaque commit.** Regarde ensuite les captures dans `test-resultats/`.
- **Ne désactive, n'affaiblis et ne contourne jamais un test pour le faire passer.** Corrige le code.
- **Une fonctionnalité nouvelle = une vérification nouvelle** dans `scripts/test-mobile.mjs`
  (ex. le bouton « Changer de décor » change bien le décor).
- **Avant d'annoncer qu'une étape est terminée**, lance l'agent `relecteur` (`.claude/agents/relecteur.md`) en lui
  donnant ce que tu comptes annoncer. S'il répond PAS PRÊT, corrige d'abord. Transmets honnêtement à la personne
  ce qu'il signale comme « non vérifié ».
- Le même `npm run verifier` tourne sur GitHub à chaque envoi (`.github/workflows/deploy.yml`). Si un test échoue,
  rien n'est mis en ligne. **Après chaque envoi, vérifie le résultat sur GitHub Actions** et annonce-le.

## Git et mise en ligne

- La page en ligne : https://max-code-menace.github.io/Orbite/
- Elle est mise en ligne **uniquement depuis la branche principale** du dépôt (`ccr-be406ff5-wxbiv4`).
- Travaille sur la branche de ta session. Une étape terminée et vérifiée = une pull request vers la branche
  principale. La personne la fusionne (bouton « Merge » sur GitHub) ; la mise en ligne suit automatiquement.
- Petits commits, messages clairs en français, qui disent quoi et pourquoi.
- Ne touche pas aux fichiers qui n'ont rien à voir avec l'étape en cours. Pas de grande réécriture non demandée.

## Règles techniques

- **Les données restent dans `public/systeme.json`** (nom, bio, liens). Jamais de lien écrit en dur dans le code.
  Le texte venant des données s'affiche avec `textContent`, jamais `innerHTML`.
- **Pas de vrais logos** (Instagram, YouTube…) : icônes simples maison (`src/icons.js`) et nom écrit en clair.
- **Budget de fluidité** : 60 img/s sur l'iPhone 15, au moins 30 sur un vieux téléphone. Donc :
  - pas de `backdrop-filter` (flou) au-dessus de la 3D : c'est lui qui faisait tomber la tablette à 24 img/s ;
  - les pièces fixes d'une île sont fusionnées en un seul objet (`Assemblage` dans `src/decors.js`) ;
  - seules les pièces qui bougent sont des objets à part ; préférer `InstancedMesh` pour les répétitions ;
  - résolution plafonnée (`BUDGET_PIXELS`) et mode allégé automatique (`PALIERS`) dans `src/main.js` : ne pas les retirer ;
  - l'animation s'arrête quand la page est cachée ; respecter « réduire les animations ».
- Toute nouvelle dépendance doit être justifiée et expliquée simplement avant d'être ajoutée.
- Code commenté en français simple, fichiers courts, une responsabilité par fichier.
