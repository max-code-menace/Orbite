// Vérifie le fichier de données public/systeme.json avant la mise en ligne.
// Il est modifié à la main (souvent depuis GitHub) : une virgule oubliée ou un
// lien mal écrit casserait la page. Ce script le dit clairement, en français.
import { readFileSync } from 'node:fs';

const chemin = new URL('../public/systeme.json', import.meta.url);
const erreurs = [];
let donnees;

try {
  donnees = JSON.parse(readFileSync(chemin, 'utf8'));
} catch (e) {
  console.error(`❌ public/systeme.json n'est pas lisible : ${e.message}`);
  console.error('   (souvent : une virgule en trop ou en moins, ou un guillemet " oublié)');
  process.exit(1);
}

const texte = (v) => typeof v === 'string' && v.trim().length > 0;

if (!donnees.profil || !texte(donnees.profil.nom)) erreurs.push('profil.nom manque');
if (donnees.profil && typeof donnees.profil.bio !== 'string') erreurs.push('profil.bio manque');

const planetes = donnees.planetes;
if (!Array.isArray(planetes)) {
  erreurs.push('la liste "planetes" manque');
} else {
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
    } else {
      if (p.liens.length > 3) erreurs.push(`${qui} : 3 liens au maximum (il y en a ${p.liens.length})`);
      p.liens.forEach((l, j) => {
        if (!texte(l?.titre)) erreurs.push(`${qui}, lien ${j + 1} : "titre" manque`);
        if (!/^https?:\/\/[^\s]+$/.test(l?.url ?? ''))
          erreurs.push(`${qui}, lien ${j + 1} : l'adresse doit commencer par https:// (reçu : "${l?.url}")`);
      });
    }
  });
}

if (erreurs.length) {
  console.error('❌ Problèmes dans public/systeme.json :');
  for (const e of erreurs) console.error(`   - ${e}`);
  process.exit(1);
}
console.log('✅ public/systeme.json est valide (profil + 5 planètes, liens corrects).');
