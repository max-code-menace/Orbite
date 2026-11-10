// Tests rapides : le harnais lui-même reste branché (hooks, blocages, agents).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const racine = new URL('..', import.meta.url).pathname;
const reglages = JSON.parse(readFileSync(join(racine, '.claude/settings.json'), 'utf8'));

test('les hooks pointent vers des scripts qui existent', () => {
  const commandes = Object.values(reglages.hooks).flatMap((l) => l.flatMap((h) => h.hooks.map((x) => x.command)));
  for (const s of ['scripts/hooks/formater.mjs', 'scripts/hooks/fin-de-tache.mjs']) {
    assert.ok(
      commandes.some((c) => c.includes(s)),
      `${s} n'est plus branché`,
    );
    assert.ok(existsSync(join(racine, s)), `${s} manque`);
  }
  assert.ok(existsSync(join(racine, '.githooks/pre-commit')), 'hook git avant commit manquant');
});

test('les commandes dangereuses restent bloquées', () => {
  const refus = reglages.permissions.deny.join(' ');
  for (const motif of ['--force', 'reset --hard', '--no-verify', 'rm -rf', 'ccr-be406ff5-wxbiv4']) {
    assert.ok(refus.includes(motif), `plus de blocage pour « ${motif} »`);
  }
});

test('les 3 agents existent', () => {
  for (const a of ['relecteur', 'securite', 'auditeur-harness']) {
    assert.ok(existsSync(join(racine, `.claude/agents/${a}.md`)), `agent ${a} manquant`);
  }
});

test('le hook de formatage met en forme le fichier modifié', () => {
  const fichier = join(racine, 'tests/essai-formatage.tmp.js');
  writeFileSync(fichier, 'const  a = {b:1}\n');
  try {
    spawnSync('node', ['scripts/hooks/formater.mjs'], {
      cwd: racine,
      input: JSON.stringify({ tool_input: { file_path: fichier } }),
    });
    assert.equal(readFileSync(fichier, 'utf8'), 'const a = { b: 1 };\n');
  } finally {
    rmSync(fichier, { force: true });
  }
});
