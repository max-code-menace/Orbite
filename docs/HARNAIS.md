# Orbite — le harnais de vérification

Principe : les machines font les vérifications mécaniques (rapides, fiables), les agents ne servent qu'au jugement.

## Les niveaux (`npm run check`, choisis tout seuls d'après les fichiers modifiés)

| Niveau | Quand | Ce qui tourne | Mesuré (10/11/2026) | Cible |
|---|---|---|---|---|
| 0 | Textes / docs seulement | Format + linter, construction | 1,1 s | < 10 s |
| 1 | Code | + tests rapides (données, règles, logique, harnais) | 1,2 s | < 1 min |
| 2 | Zone sensible | + secrets + audit des dépendances, puis agent `securite` | 2,3 s (+ agent) | — |
| 3 | CI GitHub, avant fusion | Tout + test complet téléphone + tablette | 48,5 s ici (étape 7) ; sur GitHub : 77 s avant l'étape 7, pas encore mesuré depuis | — |

Zones sensibles : voir `scripts/niveaux.mjs` (et sa copie lisible dans `CLAUDE.md`).

## Chaque élément : temps, risque évité, pourquoi il vaut le coup

| Élément | Temps ajouté | Risque évité |
|---|---|---|
| Biome (format + linter) | 0,3 s | Fautes bêtes (variable mal nommée, code mort), style incohérent. A déjà trouvé une ligne mal mise en forme. |
| Tests rapides `tests/` (`node --test`) | 0,2 s | Données cassées ou piégées (`http://`, `javascript:`), retour du flou qui faisait tomber la tablette à 24 img/s, lien en dur, `innerHTML` avec les données, garde-fous de fluidité débranchés, décor qui ne change pas, harnais débranché. |
| Détection de secrets (Secretlint) | 0,4-0,6 s | Clé ou jeton publié dans un dépôt **public**. |
| Audit des dépendances (`npm audit`) | 0,4 s | Faille connue dans un outil utilisé. |
| Test complet téléphone + tablette (existait déjà) | ~30 s ; ~46 s depuis l'étape 7 (créatures : ~13 s, sur le téléphone seulement) | La page ne s'affiche pas, un toucher ne marche plus. Seul test qui voit la vraie page. |
| Hook « après modification » | 0,1 s | Fichier mal mis en forme qui fait échouer la CI plus tard. |
| Hook « fin de tâche » | 1-3 s ; 0,06 s si rien n'a changé | Tâche annoncée finie alors qu'une vérification échoue. |
| Hook git « avant commit » | 0,4 s | Secret enregistré dans l'historique (difficile à effacer ensuite). |
| Blocages (`.claude/settings.json`) | 0 s | Push forcé (historique écrasé), suppression de données, push direct sur la branche principale, commit sans vérification. |
| Agents `relecteur`, `securite`, `auditeur-harness` | Quelques minutes, seulement niveaux 2-3 ou sur demande | Ce qu'une machine ne sait pas juger : logique, annonce fausse, donnée privée publiée, dépendance douteuse. |
| Protection de la branche principale (GitHub) | 0 s | Fusion d'un code dont la CI est rouge. **À activer par la personne.** |

## Mesures de référence

| Mesure | Avant le harnais | Après |
|---|---|---|
| Vérification locale la plus rapide | 31,6 s (`npm run verifier`, seule option) | 1,1 s (niveau 0) / 1,2 s (niveau 1) |
| CI GitHub (un envoi, hors mise en ligne) | 68-83 s | 77 s (premier passage) |

## Limites connues (honnêtes)

- Secretlint ne fouille que les fichiers actuels, pas tout l'historique git. L'historique a été vérifié à la main
  le 10/11/2026 (rien trouvé). La protection GitHub contre l'envoi de secrets complète ce point.
- Les clés d'exemple officielles (ex. la fausse clé AWS des documentations) sont ignorées exprès par Secretlint.
- Le hook « avant commit » ne protège pas une modification faite directement sur le site GitHub : la CI le fait.
- Aucun outil ne mesure la fluidité réelle : seulement les vrais appareils.
- À surveiller : le renvoi « lance l'agent securite » du hook de fin de tâche ajoute un tour à Claude chaque fois
  qu'une zone sensible change. Si c'est trop fréquent sans rien trouver, l'auditeur doit proposer de l'alléger.
