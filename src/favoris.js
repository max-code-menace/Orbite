// Les favoris ♥ : la liste des ids de systèmes que la personne a aimés, gardée sur SON appareil
// (localStorage). Rien n'est envoyé nulle part. (Pas de compte : changer de téléphone = repartir de zéro.)

const CLE = 'orbite-favoris';
const MAX = 200;

// Lit la liste ; si le stockage est vide, bloqué (navigation privée) ou abîmé : liste vide, sans casser la page.
export function lireFavoris(stockage = globalThis.localStorage) {
  try {
    const liste = JSON.parse(stockage.getItem(CLE) ?? '[]');
    return Array.isArray(liste) ? liste.filter((x) => typeof x === 'string').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function enregistrerFavoris(liste, stockage = globalThis.localStorage) {
  try {
    stockage.setItem(CLE, JSON.stringify(liste.slice(0, MAX)));
  } catch {
    // stockage plein ou bloqué : le favori vaut pour cette visite seulement
  }
}

// Ajoute l'id s'il n'y est pas, le retire sinon. Renvoie une nouvelle liste.
export function basculer(liste, id) {
  return liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id].slice(-MAX);
}
