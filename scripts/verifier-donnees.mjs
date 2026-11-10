// Vérifie le fichier de données public/systeme.json avant la mise en ligne.
// Il est modifié à la main (souvent depuis GitHub) : une virgule oubliée ou un
// lien mal écrit casserait la page. Ce script le dit clairement, en français.
// Les règles elles-mêmes sont dans donnees.mjs.
import { readFileSync } from 'node:fs';
import { verifierDonnees } from './donnees.mjs';

const chemin = new URL('../public/systeme.json', import.meta.url);
let donnees;
try {
  donnees = JSON.parse(readFileSync(chemin, 'utf8'));
} catch (e) {
  console.error(`❌ public/systeme.json n'est pas lisible : ${e.message}`);
  console.error('   (souvent : une virgule en trop ou en moins, ou un guillemet " oublié)');
  process.exit(1);
}

const erreurs = verifierDonnees(donnees);
if (erreurs.length) {
  console.error('❌ Problèmes dans public/systeme.json :');
  for (const e of erreurs) console.error(`   - ${e}`);
  process.exit(1);
}
console.log('✅ public/systeme.json est valide (profil + 5 planètes, liens corrects).');
