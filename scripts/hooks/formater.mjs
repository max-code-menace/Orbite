// Hook Claude Code « après modification d'un fichier » : met en forme CE fichier seulement.
// Ne bloque jamais (un fichier avec une erreur de syntaxe sera signalé par npm run check).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

let chemin = '';
try {
  chemin = JSON.parse(readFileSync(0, 'utf8')).tool_input?.file_path ?? '';
} catch {}
if (/\.(m?js|css|json|html)$/.test(chemin) && !chemin.includes('node_modules')) {
  spawnSync('node_modules/.bin/biome', ['format', '--write', '--no-errors-on-unmatched', chemin], { stdio: 'ignore' });
}
