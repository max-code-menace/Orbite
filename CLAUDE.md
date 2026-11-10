# Orbite — règles du projet

Lis d'abord `docs/BRIEF.md` (ce qu'on construit) et `docs/ETAT.md` (où on en est). Mets `ETAT.md` à jour à
chaque étape finie. Le harnais (vérifications, temps, risques) est décrit dans `docs/HARNAIS.md`.

## La personne

Pas développeuse ; teste sur iPhone 15 et tablette Samsung S10 Lite. Français simple, jargon expliqué.
Une étape à la fois : dis ce que tu vas faire, attends son accord. Pour une décision : 2-3 options max,
ta recommandation et ses conséquences.

**Récap de fin d'étape** (15 lignes max, pour un débutant, dans cet ordre) : 1. en une phrase, ce qui change à
l'écran ; 2. un petit schéma texte si utile ; 3. ✅ Vérifié / ❓ Pas vérifié (2-3 points chacun) ; 4. 👉 À vous :
lien à ouvrir (`?fps&v=N`, N augmenté à chaque fois), quoi regarder, quoi mesurer, quoi fusionner. Détails après.

## Honnêteté

- Jamais « ça marche » sans preuve : `npm run verifier` qui passe + captures de `test-resultats/` regardées.
  Cite ce que tu as vérifié.
- Sépare vérifié / pas vérifié. Fluidité réelle, pouce, chaleur, plein soleil, Safari : seulement sur ses appareils.
- Une correction non reproduite est une piste, pas une solution. Aucun chiffre inventé. Un échec s'annonce.
- Ne lui demande pas ce que tu peux faire toi-même. Ce qu'elle seule peut faire (réglages GitHub, fusion) :
  dis-le avec le chemin exact.

## Commandes

| Commande | Quand |
|---|---|
| `npm run check` | Choisit le niveau seul (0 docs, 1 code, 2 zone sensible). Lancé aussi par le hook de fin de tâche. |
| `npm run verifier` | Test complet téléphone + tablette (~45 s). **Avant chaque commit.** |
| `npm run check -- --ci` | Niveau 3 : tout. C'est ce que lance GitHub ; rien n'est mis en ligne s'il échoue. |
| `npm test` / `npm run lint` / `npm run format` | Tests rapides (< 1 s) / linter / mise en forme. |

- Ne désactive, n'affaiblis ni ne contourne jamais une vérification : corrige le code.
- Nouvelle fonctionnalité = nouvelle vérification (`tests/` si possible sans navigateur, sinon `scripts/test-mobile.mjs`).
- **Niveau 2** (zone sensible) → agent `securite`. **Avant d'annoncer une étape finie** → agent `relecteur` ;
  s'il dit PAS PRÊT, corrige ; transmets-lui honnêtement ce qu'il signale « non vérifié ». `auditeur-harness` : une fois par mois ou à sa demande.
- Après chaque envoi, vérifie le résultat sur GitHub Actions et annonce-le.

## Zones sensibles (niveau 2)

`public/galaxie.json` (données publiques : les systèmes), `src/ui.js` (affichage des liens), `package*.json`
(dépendances), `.github/` (mise en ligne), `.claude/`, `.githooks/`, `scripts/hooks/`, `scripts/check.mjs`,
`scripts/niveaux.mjs`, `scripts/verifier-donnees.mjs`.

## Git et mise en ligne

Page : https://max-code-menace.github.io/Orbite/ — mise en ligne seulement depuis la branche principale
`ccr-be406ff5-wxbiv4`. Travaille sur ta branche de session ; étape finie = pull request ; elle fusionne.
Petits commits en français (quoi et pourquoi). Ne touche pas aux fichiers hors de l'étape ;
pas de grande réécriture non demandée.

## Règles techniques (celles marquées 🤖 sont vérifiées par `npm test`)

- Données dans `public/galaxie.json` seulement 🤖 ; texte des données via `textContent`, jamais `innerHTML` 🤖.
- Pas de vrais logos : icônes maison (`src/icons.js`) et nom écrit en clair.
- Fluidité : 60 img/s iPhone 15, ≥ 30 vieux téléphone. Pas de `backdrop-filter` 🤖. Pièces fixes fusionnées
  (`Assemblage`, `src/decors.js`) ; seules les pièces qui bougent sont à part ; `InstancedMesh` pour les répétitions. Budget de pixels et paliers
  (`src/fluidite.js`) toujours branchés 🤖 ; pause quand la page est cachée ; « réduire les animations » respecté 🤖.
- Nouvelle dépendance : justifiée et expliquée avant, version fixée 🤖. Code commenté en français, fichiers courts,
  une responsabilité par fichier.
