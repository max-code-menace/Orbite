// Le voyage d'un système à l'autre : choisir lequel afficher, sans toucher à la 3D.
// (Fichier à part pour pouvoir être testé sans navigateur : tests/logique.test.mjs.)

// Le système nommé par l'adresse de la page (ex. …/#noe : c'est ce lien qu'on mettra en bio).
// Renvoie sa position, ou -1 si l'adresse ne nomme aucun système (vide, inconnue, abîmée).
export function indexNomme(systemes, hash) {
  let id = (hash ?? '').replace(/^#/, '');
  try {
    id = decodeURIComponent(id);
  } catch {
    return -1; // adresse mal écrite (ex. « %E0% ») : on n'essaie pas de la lire
  }
  return systemes.findIndex((s) => s.id === id.toLowerCase());
}

// Quel système afficher au démarrage ? Celui de l'adresse, sinon le premier de la liste.
export function indexDepuisAdresse(systemes, hash) {
  return Math.max(0, indexNomme(systemes, hash));
}

// Le système d'à côté dans la liste : sens = +1 (suivant) ou -1 (précédent).
// Au bout de la liste on revient au début : on ne tombe jamais sur un cul-de-sac.
export function voisin(nombre, index, sens) {
  return (((index + sens) % nombre) + nombre) % nombre;
}

// Les amis d'un système, dans l'ordre où la personne les a écrits.
// Un ami inconnu (faute de frappe dans le fichier) est ignoré plutôt que de tout casser.
export function amisDe(systemes, systeme) {
  return (systeme.amis ?? []).map((id) => systemes.findIndex((s) => s.id === id)).filter((i) => i >= 0);
}

// Un coup de doigt est-il un « balayage horizontal » ? (et dans quel sens : +1 = vers la
// gauche = système suivant). Il faut un trajet assez long, plutôt horizontal que vertical,
// et assez vif : un doigt qui traîne, ou un tap, ne compte pas.
export function sensDuBalayage(dx, dy, dureeMs) {
  if (dureeMs > 700 || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}

// Les positions des systèmes d'un thème (tous les systèmes si aucun thème n'est choisi).
export function indicesDuTheme(systemes, theme) {
  return systemes.map((_, i) => i).filter((i) => !theme || systemes[i].theme === theme);
}

// Le système d'à côté, mais seulement parmi cette liste (le thème choisi). Si on n'est pas dans la liste
// (ex. arrivé par le lien d'un ami d'un autre thème), on entre par le début ou par la fin.
export function voisinDans(liste, index, sens) {
  if (liste.length === 0) return index;
  const pos = liste.indexOf(index);
  if (pos < 0) return sens > 0 ? liste[0] : liste.at(-1);
  return liste[voisin(liste.length, pos, sens)];
}
