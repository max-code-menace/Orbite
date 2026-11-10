// Vérifie le fichier de données public/galaxie.json avant la mise en ligne.
// Il est modifié à la main (souvent depuis GitHub) : une virgule oubliée ou un
// lien mal écrit casserait la page. Ce script le dit clairement, en français.
// Les règles elles-mêmes sont dans donnees.mjs.
import { readFileSync } from 'node:fs';
import { verifierGalaxie } from './donnees.mjs';

const chemin = new URL('../public/galaxie.json', import.meta.url);
let galaxie;
try {
  galaxie = JSON.parse(readFileSync(chemin, 'utf8'));
} catch (e) {
  console.error(`❌ public/galaxie.json n'est pas lisible : ${e.message}`);
  console.error('   (souvent : une virgule en trop ou en moins, ou un guillemet " oublié)');
  process.exit(1);
}

const erreurs = verifierGalaxie(galaxie);
if (erreurs.length) {
  console.error('❌ Problèmes dans public/galaxie.json :');
  for (const e of erreurs) console.error(`   - ${e}`);
  process.exit(1);
}
console.log(
  `✅ public/galaxie.json est valide (${galaxie.systemes.length} systèmes, chacun avec profil + 5 planètes, liens corrects).`,
);
