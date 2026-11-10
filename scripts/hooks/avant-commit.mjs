// Hook git « avant commit » : cherche des secrets (clés, jetons, mots de passe)
// dans les fichiers qu'on s'apprête à enregistrer. Bloque le commit s'il en trouve.
import { execSync, spawnSync } from 'node:child_process';

const fichiers = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
if (fichiers.length === 0) process.exit(0);
const r = spawnSync('node_modules/.bin/secretlint', ['--secretlintignore', '.secretlintignore', ...fichiers], {
  stdio: 'inherit',
});
if (r.status !== 0) {
  console.error('\n❌ Commit bloqué : un secret a peut-être été trouvé. Retire-le du fichier (le dépôt est public).');
  process.exit(1);
}
