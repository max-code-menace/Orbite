// Tests rapides : la logique de fluidité et des décors, sans navigateur.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { creerDecor, tirerAutreType, typesLibres } from '../src/decors.js';
import { creerCreature, pose } from '../src/creatures.js';
import {
  amisDe,
  indexDepuisAdresse,
  indexNomme,
  indicesDuTheme,
  sensDuBalayage,
  voisin,
  voisinDans,
} from '../src/parcours.js';
import { BUDGET_PIXELS, PALIERS, calculerRatio, creaturesVisibles, palierApres } from '../src/fluidite.js';

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

// --- Étape 7 : les créatures ---------------------------------------------------

test('le mode allégé retire les créatures en premier, avant de baisser la finesse', () => {
  assert.equal(creaturesVisibles(0), true);
  for (let p = 1; p < PALIERS.length; p++) assert.equal(creaturesVisibles(p), false, `palier ${p}`);
  for (const [nom, [l, h, d]] of Object.entries(ecrans)) {
    assert.equal(calculerRatio(l, h, d, 1), calculerRatio(l, h, d, 0), `${nom} : la finesse baisse dès le 1er cran`);
    assert.ok(calculerRatio(l, h, d, 2) <= calculerRatio(l, h, d, 1), nom);
  }
});

test('chaque planète a sa créature, en un seul objet 3D', () => {
  const tailles = new Set();
  for (const [i, id] of ['instagram', 'youtube', 'spotify', 'voyage', 'libre'].entries()) {
    const c = creerCreature(id, '#ff00ff', i);
    assert.equal(c.objet.children.length, 1, `${id} : pièces non fusionnées`);
    const n = sommets(c.objet);
    assert.ok(n > 100, `${id} : ${n} sommets`);
    tailles.add(n);
  }
  assert.equal(tailles.size, 5, 'chaque créature devrait avoir un accessoire différent');
});

test('une créature saute ou tourne la tête de temps en temps, et se repose entre-temps', () => {
  const poses = Array.from({ length: 800 }, (_, i) => pose(i / 100, 3.5));
  assert.ok(
    poses.some((p) => p.saut > 0.05),
    'jamais de saut',
  );
  assert.ok(
    poses.some((p) => Math.abs(p.tour) > 0.3),
    'ne tourne jamais la tête',
  );
  const repos = poses.filter((p) => p.saut === 0 && p.tour === 0).length;
  assert.ok(repos > poses.length / 2, 'bouge presque tout le temps');
  for (const p of poses) assert.ok(p.saut >= 0 && p.saut < 0.15 && p.ecrase > 0.8 && p.ecrase < 1.2);
});

test('« réduire les animations » : la créature reste immobile', () => {
  const c = creerCreature('spotify', '#3dff7a', 0);
  const vues = new Set();
  for (let t = 0; t < 10; t += 0.05) {
    c.update(t, true);
    vues.add(c.signature());
  }
  assert.equal(vues.size, 1);
});

test('la créature de la planète libre change de couleur avec le décor', () => {
  const c = creerCreature('libre', '#7dff9a', 4);
  const avant = c.objet.children[0];
  c.recolorer('#ff7a2a');
  assert.notEqual(c.objet.children[0], avant);
  assert.equal(c.objet.children.length, 1, "l'ancienne créature n'a pas été retirée");
});

// --- Le voyage d'un système à l'autre (src/parcours.js) ---
const liste = [{ id: 'luna', amis: ['noe', 'inconnu'] }, { id: 'noe' }, { id: 'ines' }];

test("l'adresse #noe ouvre le système de Noé ; une adresse inconnue ou abîmée ouvre le premier", () => {
  assert.equal(indexDepuisAdresse(liste, '#noe'), 1);
  assert.equal(indexDepuisAdresse(liste, '#NOE'), 1);
  assert.equal(indexDepuisAdresse(liste, '#personne'), 0);
  assert.equal(indexDepuisAdresse(liste, ''), 0);
  assert.equal(indexDepuisAdresse(liste, undefined), 0);
  assert.equal(indexDepuisAdresse(liste, '#%E0%A4%A'), 0);
});

test("indexNomme dit -1 quand l'adresse ne nomme aucun système (elle ne doit alors rien déclencher)", () => {
  assert.equal(indexNomme(liste, '#ines'), 2);
  for (const h of ['#personne', '', undefined, '#%E0%A4%A']) assert.equal(indexNomme(liste, h), -1);
});

test('suivant / précédent font le tour de la liste, sans cul-de-sac', () => {
  assert.equal(voisin(3, 0, 1), 1);
  assert.equal(voisin(3, 2, 1), 0);
  assert.equal(voisin(3, 0, -1), 2);
  assert.equal(voisin(1, 0, 1), 0);
});

test('les amis inconnus sont ignorés ; sans amis, la liste est vide', () => {
  assert.deepEqual(amisDe(liste, liste[0]), [1]);
  assert.deepEqual(amisDe(liste, liste[1]), []);
});

test('un balayage doit être long, plutôt horizontal et vif ; un tap ou un doigt qui traîne ne compte pas', () => {
  assert.equal(sensDuBalayage(-120, 10, 200), 1); // vers la gauche : suivant
  assert.equal(sensDuBalayage(120, -10, 200), -1); // vers la droite : précédent
  assert.equal(sensDuBalayage(-30, 0, 100), 0); // trop court
  assert.equal(sensDuBalayage(-120, 150, 200), 0); // plutôt vertical (ouvre l'Accès rapide)
  assert.equal(sensDuBalayage(-120, 0, 1500), 0); // trop lent
  assert.equal(sensDuBalayage(3, 2, 50), 0); // un tap
});

// --- Les thèmes ---
const themes = [{ theme: 'a' }, { theme: 'b' }, { theme: 'a' }, { theme: 'b' }, { theme: 'a' }];

test('un thème ne garde que ses systèmes ; sans thème, on garde tout', () => {
  assert.deepEqual(indicesDuTheme(themes, 'a'), [0, 2, 4]);
  assert.deepEqual(indicesDuTheme(themes, 'b'), [1, 3]);
  assert.deepEqual(indicesDuTheme(themes, null), [0, 1, 2, 3, 4]);
});

test("suivant / précédent restent dans le thème, font le tour, et entrent par un bout si on n'y est pas", () => {
  const a = [0, 2, 4];
  assert.equal(voisinDans(a, 0, 1), 2);
  assert.equal(voisinDans(a, 4, 1), 0);
  assert.equal(voisinDans(a, 0, -1), 4);
  assert.equal(voisinDans(a, 1, 1), 0); // arrivé d'un autre thème : suivant = premier
  assert.equal(voisinDans(a, 1, -1), 4); // précédent = dernier
  assert.equal(voisinDans([3], 3, 1), 3); // un seul système : on reste
  assert.equal(voisinDans([], 2, 1), 2);
});

// --- « Fais le tien » : le message préparé et les liens acceptés ---
import { construireMessage, lienValide } from '../src/faistien.js';

test('« Fais le tien » : seuls les liens https:// bien formés sont acceptés', () => {
  assert.equal(lienValide('https://exemple.fr/moi'), true);
  for (const mauvais of [
    'http://exemple.fr',
    'javascript:alert(1)',
    'exemple.fr',
    'https://',
    'https://a b.fr',
    '',
    null,
  ]) {
    assert.equal(lienValide(mauvais), false, String(mauvais));
  }
  assert.equal(lienValide(`https://exemple.fr/${'a'.repeat(300)}`), false);
});

test('« Fais le tien » : le message contient nom, bio, thème et liens', () => {
  const r = construireMessage({ nom: ' Ana ', bio: 'Salut', theme: 'Musique', liens: ['https://exemple.fr/a', ''] });
  assert.match(r.texte, /Nom : Ana/);
  assert.match(r.texte, /Bio : Salut/);
  assert.match(r.texte, /Thème : Musique/);
  assert.match(r.texte, /- https:\/\/exemple\.fr\/a/);
});

test('« Fais le tien » : refuse nom vide, trop long, pas de lien, lien faux, trop de liens', () => {
  const ok = { nom: 'Ana', bio: '', theme: '', liens: ['https://exemple.fr'] };
  assert.ok(construireMessage(ok).texte);
  assert.ok(construireMessage({ ...ok, nom: '  ' }).erreur);
  assert.ok(construireMessage({ ...ok, nom: 'x'.repeat(41) }).erreur);
  assert.ok(construireMessage({ ...ok, bio: 'x'.repeat(81) }).erreur);
  assert.ok(construireMessage({ ...ok, liens: ['', ' '] }).erreur);
  assert.ok(construireMessage({ ...ok, liens: ['http://non.fr'] }).erreur);
  assert.ok(construireMessage({ ...ok, liens: Array(6).fill('https://exemple.fr') }).erreur);
});
