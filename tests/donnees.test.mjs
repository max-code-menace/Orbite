// Tests rapides : le fichier de données (les liens, cœur du produit).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { verifierDonnees, verifierGalaxie } from '../scripts/donnees.mjs';

const galaxie = JSON.parse(readFileSync(new URL('../public/galaxie.json', import.meta.url), 'utf8'));
const vraies = galaxie.systemes[0];
const copie = () => structuredClone(vraies);

test('le vrai fichier galaxie.json est valide', () => {
  assert.deepEqual(verifierGalaxie(galaxie), []);
});

test('la galaxie contient plusieurs systèmes (étape G1)', () => {
  assert.ok(galaxie.systemes.length >= 10, `${galaxie.systemes.length} systèmes seulement`);
});

test('les amis du vrai fichier sont valides, et Luna en a au moins 3 (étape « voyage »)', () => {
  assert.ok((galaxie.systemes[0].amis ?? []).length >= 3);
});

const galaxieRefusee = {
  "ami qui n'existe pas": (g) => {
    g.systemes[0].amis = ['personne'];
  },
  'système ami de lui-même': (g) => {
    g.systemes[0].amis = [g.systemes[0].id];
  },
  'même ami deux fois': (g) => {
    g.systemes[0].amis = ['noe', 'noe'];
  },
  'plus de 6 amis': (g) => {
    g.systemes[0].amis = g.systemes.slice(1, 8).map((s) => s.id);
  },
  "amis qui n'est pas une liste": (g) => {
    g.systemes[0].amis = 'noe';
  },
  'liste des systèmes vide': (g) => {
    g.systemes = [];
  },
  'id de système en double': (g) => {
    g.systemes[1].id = g.systemes[0].id;
  },
  'id de système avec majuscule ou espace (inutilisable dans une adresse)': (g) => {
    g.systemes[0].id = 'Luna Martin';
  },
  'id de système fait seulement de tirets': (g) => {
    g.systemes[0].id = '---';
  },
  'un lien piège dans un autre système que le premier': (g) => {
    g.systemes.at(-1).planetes[0].liens[0].url = 'javascript:alert(1)';
  },
};

for (const [nom, abimer] of Object.entries(galaxieRefusee)) {
  test(`galaxie refusée : ${nom}`, () => {
    const g = structuredClone(galaxie);
    abimer(g);
    assert.ok(verifierGalaxie(g).length > 0);
  });
}

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
