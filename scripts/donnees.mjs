// Règles du fichier de données public/systeme.json.
// Renvoie la liste des problèmes trouvés (vide = tout va bien), en français.
// Utilisé par verifier-donnees.mjs et par les tests rapides (tests/).

const texte = (v) => typeof v === 'string' && v.trim().length > 0;
// Lien sûr : https uniquement (pas de http, ni javascript:, ni espace).
const lienSur = (v) => typeof v === 'string' && /^https:\/\/[^\s]+$/.test(v);

export function verifierDonnees(donnees) {
  const erreurs = [];
  if (!donnees || typeof donnees !== 'object') return ['le fichier ne contient pas un objet { ... }'];

  if (!donnees.profil || !texte(donnees.profil.nom)) erreurs.push('profil.nom manque');
  if (donnees.profil && typeof donnees.profil.bio !== 'string') erreurs.push('profil.bio manque');
  const photo = donnees.profil?.photo;
  if (photo && !lienSur(photo))
    erreurs.push(`profil.photo doit être vide ou commencer par https:// (reçu : "${photo}")`);

  const planetes = donnees.planetes;
  if (!Array.isArray(planetes)) {
    erreurs.push('la liste "planetes" manque');
    return erreurs;
  }
  if (planetes.length !== 5) erreurs.push(`il faut 5 planètes, il y en a ${planetes.length}`);
  const ids = new Set();
  planetes.forEach((p, i) => {
    const qui = `planète n°${i + 1} (${p?.nom ?? '?'})`;
    if (!texte(p?.id)) erreurs.push(`${qui} : "id" manque`);
    else if (ids.has(p.id)) erreurs.push(`${qui} : l'id "${p.id}" est en double`);
    else ids.add(p.id);
    if (!texte(p?.nom)) erreurs.push(`${qui} : "nom" manque`);
    if (!Array.isArray(p?.liens) || p.liens.length === 0) {
      erreurs.push(`${qui} : il faut au moins un lien`);
      return;
    }
    if (p.liens.length > 3) erreurs.push(`${qui} : 3 liens au maximum (il y en a ${p.liens.length})`);
    p.liens.forEach((l, j) => {
      if (!texte(l?.titre)) erreurs.push(`${qui}, lien ${j + 1} : "titre" manque`);
      if (!lienSur(l?.url))
        erreurs.push(`${qui}, lien ${j + 1} : l'adresse doit commencer par https:// (reçu : "${l?.url}")`);
    });
  });
  return erreurs;
}
