# Orbite — brief n°2 : de la page à l'application (validé le 10/11/2026 ; **phase 1 « galaxie » en pause**, voir `ETAT.md`)

Suite du prototype 1 (`docs/BRIEF.md` : un seul système, ses 5 planètes, ses liens). Décidé le 10/11/2026 :
on avance vers l'application. **Ordre : la galaxie d'abord, la messagerie ensuite.** Les îles actuelles seront
refaites dans Blender : on n'investit plus dans leur aspect (décors, créatures).

## Ce qu'on suppose (validé par la personne)

- **Une personne = un système solaire** : son soleil (elle) et ses planètes (ses liens, comme aujourd'hui).
- **La galaxie = la carte de tous les systèmes.** Chaque système y est un petit soleil lumineux avec un nom.
  Toucher un système = on « voyage » dedans (on arrive sur l'écran actuel). Un bouton ramène à la galaxie.
- **Une planète** reste ce qu'elle est aujourd'hui : on la touche, son panneau de liens s'ouvre.
- Le lien en bio d'une personne ouvre **directement son système** (pas la galaxie).

## Phase 1 — la galaxie (sans serveur, données d'exemple)

| Étape | Contenu | Visible sur le téléphone |
|---|---|---|
| G1 | Plusieurs systèmes dans les données (~12 systèmes d'exemple, inventés) au lieu d'un seul | Rien ne change encore à l'écran |
| G2 | L'écran galaxie : tous les systèmes en petits soleils lumineux, avec leur nom | Oui |
| G3 | Le voyage : toucher un système → la caméra plonge dedans ; bouton retour → galaxie | Oui |
| G4 | Trouver quelqu'un vite : recherche par nom / liste des systèmes | Oui |
| G5 | Lien direct vers un système (ex. `…/Orbite/#luna`) | Oui |

## Phase 2 — comptes et messagerie (avec un service en ligne)

Service proposé : **Supabase** (comptes, base de données, messages en direct ; gratuit au début). C'est la
personne qui crée le compte Supabase (je la guide). Détail des étapes à écrire au début de la phase 2, quand on
saura **entre qui** se font les messages (2 personnes ? visiteur → propriétaire ? groupes ?).

## Pas encore

Créer ou modifier son système dans l'appli · les îles Blender · l'appli iPhone / Android (on reste une page web) ·
notifications · faire tourner la galaxie ou le système au doigt (à rediscuter à G2).

## Critères de réussite (phase 1)

- [ ] La galaxie reste fluide avec 50 systèmes : 60 img/s sur l'iPhone 15, au moins 30 sur un vieux téléphone.
- [ ] On trouve le système de quelqu'un en moins de 5 secondes.
- [ ] Le voyage galaxie → système → galaxie se comprend sans explication.
- [ ] Le lien direct d'une personne ouvre son système, pas la galaxie.

## Ce que ça change dans les règles du projet

- Aujourd'hui, une règle vérifiée par `npm test` impose « données dans `public/systeme.json` seulement ».
  Fait à G1 : un seul fichier `public/galaxie.json` (la liste des systèmes), mêmes contrôles sur chaque système.
  C'est une zone sensible : l'agent `securite` relira.
- L'étape 8 du prototype 1 (fluidité + checklist) est absorbée : la fluidité sera mesurée sur la galaxie.
