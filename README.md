# Orbite — prototype 1

Une page web, pensée pour le téléphone : le système d'une personne avec ses 5 planètes en 3D.

## Voir la page

- En ligne : https://max-code-menace.github.io/Orbite/
- Ajouter `?fps` à la fin du lien affiche le nombre d'images par seconde (pour tester la fluidité) :
  https://max-code-menace.github.io/Orbite/?fps

La page se remet en ligne toute seule à chaque envoi sur la branche principale, **seulement si les tests passent** (onglet **Actions** sur GitHub).

## Pour les développeurs

```
npm install
npm run dev       # page de test sur l'ordinateur
npm run check     # vérification rapide, niveau choisi tout seul (1 à 3 s)
npm run verifier  # vérifie les données, construit, teste sur téléphone et tablette (~30 s)
```

Le harnais de vérification (niveaux, hooks, agents, temps mesurés) est décrit dans `docs/HARNAIS.md`.

Les règles du projet sont dans `CLAUDE.md`, le brief dans `docs/BRIEF.md`, l'avancement dans `docs/ETAT.md`.

Outils : Three.js (3D) et Vite (préparation de la page), sans React.
