// Tests rapides : scripts/check choisit le bon niveau selon les fichiers modifiés.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { choisirNiveau } from '../scripts/niveaux.mjs';

const cas = [
  [[], 0],
  [['docs/ETAT.md', 'README.md'], 0],
  [['CLAUDE.md'], 0],
  [['src/decors.js'], 1],
  [['src/style.css', 'docs/ETAT.md'], 1],
  [['tests/logique.test.mjs'], 1],
  [['public/systeme.json'], 2],
  [['src/ui.js'], 2],
  [['package.json'], 2],
  [['package-lock.json'], 2],
  [['.github/workflows/deploy.yml'], 2],
  [['.claude/settings.json'], 2],
  [['scripts/hooks/avant-commit.mjs'], 2],
  [['scripts/verifier-donnees.mjs'], 2],
  [['src/decors.js', 'package.json'], 2],
];

for (const [fichiers, attendu] of cas) {
  test(`${fichiers.join(' + ') || 'rien'} → niveau ${attendu}`, () => {
    assert.equal(choisirNiveau(fichiers).niveau, attendu);
  });
}
