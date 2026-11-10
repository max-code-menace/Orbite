// Tests rapides : les règles de CLAUDE.md qu'une machine peut vérifier
// (avant, seul l'agent relecteur les contrôlait, à l'œil).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const lire = (chemin) => readFileSync(new URL(`../${chemin}`, import.meta.url), 'utf8');
const sources = readdirSync(new URL('../src', import.meta.url)).map((f) => `src/${f}`);
const code = [...sources, 'index.html'].map((f) => ({ f, texte: lire(f) }));

test('pas de flou backdrop-filter (faisait tomber la tablette à 24 img/s)', () => {
  for (const { f, texte } of code)
    assert.ok(!/backdrop-filter\s*:|backdropFilter/.test(texte), `${f} utilise backdrop-filter`);
});

test('pas de lien écrit en dur dans le code (les liens vivent dans galaxie.json)', () => {
  for (const { f, texte } of code) {
    const liens = (texte.match(/https?:\/\/[^\s'"`)]+/g) ?? []).filter((l) => !l.startsWith('http://www.w3.org/'));
    assert.deepEqual(liens, [], `${f} contient un lien en dur`);
  }
});

test('innerHTML seulement avec nos icônes ou un texte fixe, jamais avec les données', () => {
  for (const { f, texte } of code) {
    for (const [, valeur] of texte.matchAll(/\.innerHTML\s*=\s*([^;]+);/g)) {
      const sur = /^icons\[/.test(valeur) || /^'[^']*'$/.test(valeur.trim());
      assert.ok(sur, `${f} : innerHTML = ${valeur.slice(0, 60)}…`);
    }
  }
});

test('garde-fous de fluidité toujours branchés dans main.js', () => {
  const main = lire('src/main.js');
  for (const morceau of ['calculerRatio(', 'palierApres(', "'visibilitychange'", 'prefers-reduced-motion']) {
    assert.ok(main.includes(morceau), `main.js n'utilise plus ${morceau}`);
  }
});

test('versions des dépendances fixées (pas de ^ ni ~)', () => {
  const pkg = JSON.parse(lire('package.json'));
  for (const [nom, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    assert.match(version, /^\d+\.\d+\.\d+$/, `${nom} : version « ${version} » non fixée`);
  }
});
