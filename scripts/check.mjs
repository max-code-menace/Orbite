// Vérification unique : regarde les fichiers modifiés et choisit le niveau tout seul.
//
//   npm run check              → niveau choisi automatiquement (0, 1 ou 2)
//   npm run check -- --niveau 2 → force un niveau
//   npm run check -- --ci       → niveau 3 (tout), utilisé par GitHub Actions
//
// Niveau 0 – textes/docs seulement : format + construction.          Cible < 10 s
// Niveau 1 – code : + linter + tests rapides (données, règles, logique). Cible < 1 min
// Niveau 2 – zone sensible : + secrets + audit des dépendances, puis agent « securite ».
// Niveau 3 – avant fusion (CI) : tout, y compris le test téléphone/tablette (~30 s).
//
// Le test téléphone/tablette n'est pas dans les niveaux 0-2 (trop lent pour un hook) :
// il reste obligatoire avant chaque commit (npm run verifier) et en CI.
import { execSync, spawnSync } from 'node:child_process';
import { choisirNiveau } from './niveaux.mjs';

const BRANCHE_PRINCIPALE = 'ccr-be406ff5-wxbiv4';

const args = process.argv.slice(2);
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

// Fichiers modifiés depuis la branche principale (commits de la branche + travail en cours).
function fichiersModifies() {
  const base = git(`merge-base HEAD origin/${BRANCHE_PRINCIPALE}`);
  const listes = [
    base ? git(`diff --name-only ${base}`) : git('diff --name-only HEAD'),
    git('ls-files --others --exclude-standard'),
  ];
  return [...new Set(listes.join('\n').split('\n').filter(Boolean))];
}

function niveauDemande(fichiers) {
  if (args.includes('--ci')) return { niveau: 3, raison: 'vérification complète (CI)' };
  const force = args.indexOf('--niveau');
  if (force >= 0) return { niveau: Number(args[force + 1]), raison: 'niveau demandé' };
  return choisirNiveau(fichiers);
}

const ETAPES = {
  format: ['Format et linter (Biome)', 'npx biome check .'],
  construction: ['Construction de la page', 'npx vite build --logLevel error'],
  tests: ['Tests rapides (données, règles, logique)', 'node --test tests/*.test.mjs'],
  secrets: ['Détection de secrets', 'npx secretlint "**/*"'],
  audit: ['Audit des dépendances', 'npm audit --audit-level=high'],
  complet: ['Test complet téléphone + tablette', 'npm run verifier'],
};
const PAR_NIVEAU = [
  ['format', 'construction'],
  ['format', 'construction', 'tests'],
  ['format', 'construction', 'tests', 'secrets', 'audit'],
  ['format', 'tests', 'secrets', 'audit', 'complet'], // « complet » construit déjà la page
];

const fichiers = fichiersModifies();
const { niveau, raison } = niveauDemande(fichiers);
console.log(`🔎 Niveau ${niveau} — ${raison}`);

const debut = Date.now();
let echec = false;
for (const cle of PAR_NIVEAU[niveau]) {
  const [nom, commande] = ETAPES[cle];
  const t = Date.now();
  const r = spawnSync(commande, { shell: true, encoding: 'utf8' });
  const duree = ((Date.now() - t) / 1000).toFixed(1);
  if (r.status === 0) console.log(`   ✅ ${nom} (${duree} s)`);
  else {
    echec = true;
    console.log(`   ❌ ${nom} (${duree} s)\n${(r.stdout + r.stderr).trim().split('\n').slice(-30).join('\n')}`);
  }
}
const total = ((Date.now() - debut) / 1000).toFixed(1);

if (echec) {
  console.log(`\n❌ Niveau ${niveau} en échec (${total} s). Corrige le code, ne contourne pas la vérification.`);
  process.exit(1);
}
console.log(`\n✅ Niveau ${niveau} réussi en ${total} s.`);
if (niveau === 2)
  console.log('👉 Zone sensible touchée : lancer l’agent « securite » avant d’annoncer la fin de l’étape.');
if (niveau < 3) console.log('👉 Avant chaque commit : npm run verifier (test complet téléphone + tablette).');
