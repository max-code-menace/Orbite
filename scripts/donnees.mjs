// Règles du fichier de données public/galaxie.json (la liste des systèmes).
// Renvoie la liste des problèmes trouvés (vide = tout va bien), en français.
// Utilisé par verifier-donnees.mjs et par les tests rapides (tests/).

const texte = (v) => typeof v === 'string' && v.trim().length > 0;
// Lien sûr : https uniquement (pas de http, ni javascript:, ni espace).
const lienSur = (v) => typeof v === 'string' && /^https:\/\/[^\s]+$/.test(v);

// Identifiant d'un système : il servira dans l'adresse de la page (ex. …/#luna),
// donc minuscules, chiffres et tirets seulement.
const idSur = (v) => typeof v === 'string' && v.length <= 30 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v);

// La galaxie : une liste de systèmes, chacun avec un id unique et valide.
export function verifierGalaxie(galaxie) {
  if (!galaxie || typeof galaxie !== 'object') return ['le fichier ne contient pas un objet { ... }'];
  const systemes = galaxie.systemes;
  if (!Array.isArray(systemes) || systemes.length === 0) return ['la liste "systemes" manque ou est vide'];
  const erreurs = [];
  const ids = new Set();
  systemes.forEach((s, i) => {
    const qui = `système n°${i + 1} (${s?.profil?.nom ?? '?'})`;
    if (!idSur(s?.id)) erreurs.push(`${qui} : "id" doit être en minuscules, chiffres et tirets (reçu : "${s?.id}")`);
    else if (ids.has(s.id)) erreurs.push(`${qui} : l'id "${s.id}" est en double`);
    else ids.add(s.id);
    for (const e of verifierDonnees(s)) erreurs.push(`${qui} : ${e}`);
  });
  // Les amis (facultatifs) : des ids qui existent, pas soi-même, pas deux fois, 6 au plus.
  systemes.forEach((s, i) => {
    if (s?.amis === undefined) return;
    const qui = `système n°${i + 1} (${s?.profil?.nom ?? '?'})`;
    if (!Array.isArray(s.amis) || s.amis.length > 6) {
      erreurs.push(`${qui} : "amis" doit être une liste de 6 ids au plus`);
      return;
    }
    s.amis.forEach((a, j) => {
      if (!ids.has(a)) erreurs.push(`${qui}, ami ${j + 1} : "${a}" n'est pas un système de la galaxie`);
      else if (a === s.id) erreurs.push(`${qui}, ami ${j + 1} : un système ne peut pas être son propre ami`);
      else if (s.amis.indexOf(a) !== j) erreurs.push(`${qui}, ami ${j + 1} : "${a}" est en double`);
    });
  });
  return erreurs;
}

// Un système : un profil et ses 5 planètes.
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
