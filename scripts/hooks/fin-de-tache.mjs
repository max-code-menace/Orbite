// Hook Claude Code « fin de tâche » : lance scripts/check.mjs (niveau choisi tout seul).
// - Rien n'a changé depuis la dernière vérification réussie : on ne relance pas (0 s).
// - Échec : Claude est renvoyé au travail avec le détail (code de sortie 2).
// - Zone sensible modifiée : Claude est renvoyé une fois pour lancer l'agent « securite ».
import { createHash } from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

let entree = {};
try {
  entree = JSON.parse(readFileSync(0, 'utf8'));
} catch {}
if (entree.stop_hook_active) process.exit(0); // déjà renvoyé une fois : on ne boucle pas

const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8' });
const memoire = `${git('rev-parse --git-dir').trim()}/orbite-check.json`;
const empreinte = (texte) => createHash('sha1').update(texte).digest('hex');
const etat = empreinte(git('rev-parse HEAD') + git('status --porcelain') + git('diff HEAD'));
const avant = existsSync(memoire) ? JSON.parse(readFileSync(memoire, 'utf8')) : {};
if (avant.etat === etat) process.exit(0);

const r = spawnSync('node', ['scripts/check.mjs'], { encoding: 'utf8' });
const sortie = r.stdout + r.stderr;
if (r.status !== 0) {
  console.error(sortie);
  process.exit(2);
}
const niveau = Number(sortie.match(/Niveau (\d)/)?.[1] ?? 0);
const sensible = niveau === 2 ? empreinte(sortie.match(/zone sensible : (.*)/)?.[1] + git('diff HEAD')) : null;
writeFileSync(memoire, JSON.stringify({ etat, sensible: sensible ?? avant.sensible }));
if (sensible && sensible !== avant.sensible) {
  console.error(
    `${sortie}\nZone sensible modifiée : lance l'agent « securite » sur ces changements avant de conclure.`,
  );
  process.exit(2);
}
