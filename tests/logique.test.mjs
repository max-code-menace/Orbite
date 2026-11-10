// Tests rapides : la logique de fluidité et des décors, sans navigateur.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { creerDecor, tirerAutreType, typesLibres } from '../src/decors.js';
import { BUDGET_PIXELS, PALIERS, calculerRatio, palierApres } from '../src/fluidite.js';

const ecrans = {
  'iPhone 15': [393, 852, 3],
  'tablette S10 Lite horizontale': [1200, 750, 2],
  'vieux téléphone': [360, 640, 2],
  'grand écran': [1920, 1080, 1],
};

test('la résolution respecte le budget de pixels et ne dépasse jamais 2x', () => {
  for (const [nom, [l, h, d]] of Object.entries(ecrans)) {
    const r = calculerRatio(l, h, d, 0);
    assert.ok(r <= 2, `${nom} : ${r}`);
    assert.ok(r <= 1 || r * r * l * h <= BUDGET_PIXELS * 1.0001, `${nom} : dépasse le budget`);
  }
});

test('chaque palier du mode allégé dessine moins finement, sans descendre sous 0,6', () => {
  for (const [nom, [l, h, d]] of Object.entries(ecrans)) {
    const ratios = PALIERS.map((_, p) => calculerRatio(l, h, d, p));
    for (let p = 1; p < ratios.length; p++) assert.ok(ratios[p] <= ratios[p - 1], nom);
    assert.ok(Math.min(...ratios) >= 0.6, nom);
  }
});

test("le mode allégé descend d'un palier sous 50 img/s, jamais au-delà du dernier", () => {
  assert.equal(palierApres(0, 30), 1);
  assert.equal(palierApres(0, 55), 0);
  assert.equal(palierApres(PALIERS.length - 1, 10), PALIERS.length - 1);
});

test('« Changer de décor » tire toujours un décor différent et existant', () => {
  for (const actuel of typesLibres) {
    for (const h of [0, 0.25, 0.5, 0.75, 0.9999]) {
      const nouveau = tirerAutreType(actuel, () => h);
      assert.ok(typesLibres.includes(nouveau), `${nouveau} inconnu`);
      assert.notEqual(nouveau, actuel);
    }
  }
});

const sommets = (objet) => {
  let n = 0;
  objet.traverse((o) => {
    n += o.geometry?.attributes.position?.count ?? 0;
  });
  return n;
};

test('chaque île a un décor construit (y compris les 5 décors libres)', () => {
  for (const id of ['instagram', 'youtube', 'spotify', 'voyage']) assert.ok(sommets(creerDecor(id).surIle) > 50, id);
  for (const t of typesLibres) assert.ok(sommets(creerDecor('libre', t).surIle) > 50, t);
});
