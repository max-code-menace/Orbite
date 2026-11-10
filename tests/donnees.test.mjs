// Tests rapides : le fichier de données (les liens, cœur du produit).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { verifierDonnees } from '../scripts/donnees.mjs';

const vraies = JSON.parse(readFileSync(new URL('../public/systeme.json', import.meta.url), 'utf8'));
const copie = () => structuredClone(vraies);

test('le vrai fichier systeme.json est valide', () => {
  assert.deepEqual(verifierDonnees(vraies), []);
});

const casRefuses = {
  'nom du profil vide': (d) => {
    d.profil.nom = ' ';
  },
  '4 planètes au lieu de 5': (d) => {
    d.planetes.pop();
  },
  'id en double': (d) => {
    d.planetes[1].id = d.planetes[0].id;
  },
  'planète sans lien': (d) => {
    d.planetes[0].liens = [];
  },
  'plus de 3 liens': (d) => {
    d.planetes[0].liens = Array(4).fill({ titre: 'x', url: 'https://example.com/' });
  },
  'lien en http:// (non sécurisé)': (d) => {
    d.planetes[0].liens[0].url = 'http://example.com/';
  },
  'lien javascript: (piège)': (d) => {
    d.planetes[0].liens[0].url = 'javascript:alert(1)';
  },
  'lien sans titre': (d) => {
    d.planetes[0].liens[0].titre = '';
  },
  'photo de profil en http://': (d) => {
    d.profil.photo = 'http://example.com/moi.jpg';
  },
};

for (const [nom, abimer] of Object.entries(casRefuses)) {
  test(`refuse : ${nom}`, () => {
    const d = copie();
    abimer(d);
    assert.ok(verifierDonnees(d).length > 0);
  });
}
