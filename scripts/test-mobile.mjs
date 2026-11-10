// Test automatique : ouvre la page construite (dist/) comme un vrai téléphone
// et une tablette, et vérifie que tout ce qui compte marche vraiment.
// Il échoue (et bloque la mise en ligne) au moindre problème.
// Les captures d'écran sont enregistrées dans test-resultats/ pour preuve.
import { preview } from 'vite';
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const DOSSIER = 'test-resultats';
mkdirSync(DOSSIER, { recursive: true });

const serveur = await preview({ preview: { port: 4321, strictPort: true }, logLevel: 'error' });
const url = serveur.resolvedUrls.local[0];

const navigateur = await chromium.launch({
  // La 3D sans carte graphique (serveurs de test) passe par un moteur logiciel.
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

const appareils = [
  { nom: 'telephone', options: { ...devices['Pixel 7'] } },
  { nom: 'tablette-horizontale', options: { viewport: { width: 1000, height: 600 }, isMobile: true, hasTouch: true } },
];

let echecs = 0;
function verifier(condition, message) {
  if (condition) console.log(`   ✅ ${message}`);
  else {
    console.log(`   ❌ ${message}`);
    echecs++;
  }
}

for (const { nom, options } of appareils) {
  console.log(`\n📱 ${nom}`);
  const page = await navigateur.newPage(options);
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));

  await page.goto(url);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${DOSSIER}/${nom}-1-accueil.png` });

  verifier((await page.locator('canvas').count()) === 1, 'la 3D est affichée');
  verifier((await page.locator('.profil-nom').textContent())?.trim().length > 0, 'le profil est rempli');
  verifier((await page.locator('.etiquette').count()) === 5, '5 étiquettes de planètes');
  verifier((await page.locator('.acces-ligne').count()) === 5, "5 lignes dans l'Accès rapide");
  const liensVides = await page.locator('.acces-ligne:not([href])').count();
  verifier(liensVides === 0, "chaque ligne de l'Accès rapide a un lien");

  // Chaque île a son décor ; la planète libre a tiré un des 5 types ; les pièces animées bougent.
  const avant = await page.evaluate(() => window.orbite?.planetes());
  verifier(Array.isArray(avant) && avant.length === 5, "l'état des planètes est lisible");
  for (const p of avant ?? []) verifier(p.sommetsDecor > 50, `l'île ${p.id} a un décor (${p.sommetsDecor} sommets)`);
  const libre = (avant ?? []).find((p) => p.id === 'libre');
  verifier(
    ['foret', 'cristaux', 'champignons', 'glace', 'volcan'].includes(libre?.typeLibre),
    `la planète libre a un décor tiré au hasard (${libre?.typeLibre})`,
  );
  await page.waitForTimeout(700);
  const apres = await page.evaluate(() => window.orbite.planetes());
  for (const id of ['spotify', 'voyage']) {
    const a = avant.find((p) => p.id === id)?.signature;
    const b = apres.find((p) => p.id === id)?.signature;
    verifier(
      a != null && b != null && a !== b,
      `les pièces animées de ${id} bougent (${id === 'spotify' ? "barres d'égaliseur" : 'avion'})`,
    );
  }

  // Toucher une planète (par son étiquette) ouvre son panneau.
  await page.locator('.etiquette', { hasText: 'Spotify' }).click({ force: true });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DOSSIER}/${nom}-2-planete-ouverte.png` });
  verifier((await page.locator('#panneau.visible').count()) === 1, 'toucher une planète ouvre son panneau');
  verifier((await page.locator('.panneau-titre').textContent()) === 'Spotify', 'le panneau montre la bonne planète');
  verifier((await page.locator('.panneau-lien').count()) >= 1, 'le panneau contient des liens');
  const panneau = await page.locator('#panneau').boundingBox();
  const hauteur = page.viewportSize().height;
  verifier(
    panneau && panneau.height <= hauteur * 0.6 + 1,
    "le panneau ne couvre pas plus d'environ la moitié de l'écran",
  );

  verifier(await page.locator('.panneau-changer').isHidden(), 'pas de bouton « Changer de décor » sur Spotify');

  // La croix referme le panneau.
  await page.locator('.panneau-fermer').click();
  await page.waitForTimeout(800);
  verifier((await page.locator('#panneau.visible').count()) === 0, 'la croix referme le panneau');

  // --- Étape 6 : « Changer de décor » sur la planète libre ---
  const etatLibre = async () => (await page.evaluate(() => window.orbite.planetes())).find((p) => p.id === 'libre');
  await page.locator('.etiquette', { hasText: 'Planète libre' }).click({ force: true });
  await page.waitForTimeout(1200);
  const bouton = page.locator('.panneau-changer');
  verifier(await bouton.isVisible(), 'le panneau de la planète libre a le bouton « Changer de décor »');
  const bb = await bouton.boundingBox();
  verifier(
    bb && bb.height >= 44,
    `le bouton est assez grand pour le pouce (${bb ? Math.round(bb.height) : '?'} px de haut)`,
  );
  const panneauLibre = await page.locator('#panneau').boundingBox();
  verifier(
    panneauLibre && panneauLibre.height <= hauteur * 0.6 + 1,
    "avec le bouton, le panneau ne couvre toujours pas plus d'environ la moitié de l'écran",
  );
  await page.screenshot({ path: `${DOSSIER}/${nom}-3-planete-libre.png` });

  const l0 = await etatLibre();
  // Pendant ~1 s, on note la plus petite taille de l'île : preuve que l'animation a eu lieu.
  await page.evaluate(() => {
    window.__tailleMin = 1;
    const fin = performance.now() + 1000;
    (function suivre() {
      const l = window.orbite.planetes().find((p) => p.id === 'libre');
      window.__tailleMin = Math.min(window.__tailleMin, l.echelleIle);
      if (performance.now() < fin) requestAnimationFrame(suivre);
    })();
  });
  await bouton.click();
  await page.waitForTimeout(1100);
  const l1 = await etatLibre();
  const tailleMin = await page.evaluate(() => window.__tailleMin);
  verifier(l1.typeLibre !== l0.typeLibre, `toucher le bouton change le décor (${l0.typeLibre} → ${l1.typeLibre})`);
  verifier(
    l1.couleurAnneau !== l0.couleurAnneau,
    `les couleurs changent aussi (anneau ${l0.couleurAnneau} → ${l1.couleurAnneau})`,
  );
  verifier(l1.sommetsDecor > 50, `le nouveau décor est bien posé sur l'île (${l1.sommetsDecor} sommets)`);
  verifier(tailleMin < 0.6, `l'île fait sa petite animation (taille la plus petite : ${tailleMin.toFixed(2)})`);
  verifier(Math.abs(l1.echelleIle - 1) < 0.001, "l'île retrouve sa taille normale après l'animation");
  const accent = await page.locator('#panneau').evaluate((e) => e.style.getPropertyValue('--accent'));
  verifier(accent === l1.couleurAnneau, 'le panneau prend la nouvelle couleur');
  verifier((await page.locator('#panneau.visible').count()) === 1, 'le panneau reste ouvert après le changement');
  await page.screenshot({ path: `${DOSSIER}/${nom}-4-decor-change.png` });

  await bouton.click();
  await page.waitForTimeout(1100);
  const l2 = await etatLibre();
  verifier(l2.typeLibre !== l1.typeLibre, `un deuxième toucher change encore (${l1.typeLibre} → ${l2.typeLibre})`);
  await page.locator('.panneau-fermer').click();
  await page.waitForTimeout(800);

  // --- Voyage : balayage horizontal, flèches, amis, adresse ---
  await verifierVoyage(page, nom);

  // --- Étape 7 : les créatures (sur le téléphone seulement : ~13 s de test,
  // et leur comportement ne dépend pas de la taille de l'écran) ---
  if (nom === 'telephone') await verifierCreatures(page);

  verifier(erreurs.length === 0, `aucune erreur dans la page${erreurs.length ? ` : ${erreurs.join(' | ')}` : ''}`);
  await page.close();
}

// Un balayage au doigt (simulé à la souris : la page écoute les « pointer events », qui sont les mêmes).
async function balayer(page, versLaGauche) {
  const { width, height } = page.viewportSize();
  const y = height * 0.5;
  const [de, vers] = versLaGauche ? [width * 0.6, width * 0.2] : [width * 0.2, width * 0.6];
  await page.mouse.move(de, y);
  await page.mouse.down();
  await page.mouse.move((de + vers) / 2, y + 4, { steps: 3 });
  await page.mouse.move(vers, y + 6, { steps: 3 });
  await page.mouse.up();
  await page.waitForTimeout(900);
}

async function verifierVoyage(page, nom) {
  const id = () => page.evaluate(() => window.orbite.systemeId());
  const nomAffiche = async () => (await page.locator('.profil-nom').textContent())?.trim();
  verifier((await id()) === 'luna', 'on démarre sur le système de Luna');
  verifier(
    (await page.locator('.ami').count()) >= 3,
    `la bande « amis » montre au moins 3 amis (${await page.locator('.ami').count()})`,
  );
  const fleche = await page.locator('.amis-fleche').first().boundingBox();
  verifier(fleche && fleche.width >= 44 && fleche.height >= 44, 'les flèches sont assez grandes pour le pouce (44 px)');

  await balayer(page, true);
  verifier((await id()) === 'noe', `balayer vers la gauche ouvre le système suivant (${await id()})`);
  verifier((await nomAffiche()) === 'Noé Ferrand', `le profil change aussi (${await nomAffiche()})`);
  verifier((await page.locator('.etiquette').count()) === 5, 'toujours 5 étiquettes (les anciennes sont retirées)');
  verifier((await page.locator('.acces-ligne').count()) === 5, "l'Accès rapide est rempli pour le nouveau système");
  verifier(new URL(page.url()).hash === '#noe', "l'adresse suit (#noe)");
  const pos = await page.evaluate(() => window.orbite.planetes().map((p) => p.echelleIle));
  verifier(
    pos.every((e) => Math.abs(e - 1) < 0.001),
    'les îles ont leur taille normale après le voyage',
  );
  await page.screenshot({ path: `${DOSSIER}/${nom}-7-systeme-suivant.png` });

  await balayer(page, false);
  verifier((await id()) === 'luna', 'balayer vers la droite revient en arrière');

  await page.locator('.amis-fleche').last().click();
  await page.waitForTimeout(900);
  verifier((await id()) === 'noe', 'la flèche « suivant » fait la même chose');
  await page.locator('.ami', { hasText: 'Yanis' }).click();
  await page.waitForTimeout(900);
  verifier((await id()) === 'yanis', 'toucher un ami ouvre son système');

  // Au bout de la liste, on revient au début.
  await page.goto(`${url}#adam`);
  await page.waitForTimeout(1500);
  verifier((await id()) === 'adam', "l'adresse #adam ouvre directement le système d'Adam");
  await page.locator('.amis-fleche').last().click();
  await page.waitForTimeout(900);
  verifier((await id()) === 'luna', 'après le dernier système, on revient au premier');

  // Une adresse qui ne veut rien dire ne casse rien.
  await page.goto(`${url}#%E0%A4%A`);
  await page.waitForTimeout(1500);
  verifier((await id()) === 'luna', 'une adresse abîmée ouvre le premier système');

  // Planète ouverte : le balayage ne change pas de système (on ferme d'abord).
  await page.locator('.etiquette', { hasText: 'Spotify' }).click({ force: true });
  await page.waitForTimeout(1200);
  await balayer(page, true);
  verifier((await id()) === 'luna', 'planète ouverte : balayer ne change pas de système');
  await page.locator('.panneau-fermer').click();
  await page.waitForTimeout(800);

  // « Réduire les animations » : le changement est instantané.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.amis-fleche').last().click();
  await page.waitForTimeout(150);
  verifier((await id()) === 'noe', '« réduire les animations » : le changement est immédiat');
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // Une personne qui enchaîne 12 voyages ne doit pas voir la mémoire grossir : on regarde les formes gardées.
  await page.goto(`${url}?qualite=1`);
  await page.waitForTimeout(1500);
  const avant = await page.evaluate(() => window.orbite.memoire());
  for (let i = 0; i < 12; i++) {
    await page.locator('.amis-fleche').last().click();
    await page.waitForTimeout(700);
  }
  const apres = await page.evaluate(() => window.orbite.memoire());
  verifier(
    apres.geometries <= avant.geometries * 1.5 + 5,
    `12 voyages de suite : les formes en mémoire ne s'accumulent pas (${avant.geometries} → ${apres.geometries})`,
  );
  await page.goto(url);
  await page.waitForTimeout(1500);
}

async function verifierCreatures(page) {
  // ?qualite=1 : qualité normale imposée (sinon le mode allégé, vu la lenteur de
  // la 3D simulée, pourrait les retirer pendant le test).
  await page.goto(`${url}?qualite=1`);
  await page.waitForTimeout(1500);
  const creatures = await page.evaluate(() => window.orbite.planetes());
  verifier(
    creatures.filter((p) => p.creatureVisible && p.creatureSommets > 100).length === 5,
    'les 5 créatures sont là',
  );
  // Pendant 5 s, on note toutes les poses de chaque créature : plusieurs = elle a bougé.
  const poses = async (duree) =>
    page.evaluate(
      (d) =>
        new Promise((fini) => {
          const vues = {};
          const fin = performance.now() + d;
          (function noter() {
            for (const p of window.orbite.planetes()) {
              if (!vues[p.id]) vues[p.id] = new Set();
              vues[p.id].add(p.creatureSignature);
            }
            if (performance.now() < fin) requestAnimationFrame(noter);
            else fini(Object.fromEntries(Object.entries(vues).map(([id, v]) => [id, v.size])));
          })();
        }),
      duree,
    );
  const bouge = await poses(5000);
  verifier(
    Object.values(bouge).filter((n) => n > 1).length === 5,
    `les 5 créatures bougent (${JSON.stringify(bouge)})`,
  );
  await page.screenshot({ path: `${DOSSIER}/telephone-5-creatures.png` });
  // Gros plan sur Spotify (créature au casque audio) pour la regarder à l'œil.
  await page.locator('.etiquette', { hasText: 'Spotify' }).click({ force: true });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DOSSIER}/telephone-6-creature-de-pres.png` });
  await page.locator('.panneau-fermer').click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(300);
  const immobiles = await poses(3000);
  verifier(
    Object.values(immobiles).every((n) => n === 1),
    `« réduire les animations » : elles ne bougent plus (${JSON.stringify(immobiles)})`,
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${url}?qualite=2`);
  await page.waitForTimeout(1500);
  const allege = await page.evaluate(() => window.orbite.planetes());
  verifier(
    allege.every((p) => !p.creatureVisible),
    'mode allégé (1er cran) : les créatures sont retirées',
  );
}

await navigateur.close();
serveur.httpServer.close();

if (echecs) {
  console.log(`\n❌ ${echecs} vérification(s) en échec. Captures dans ${DOSSIER}/`);
  process.exit(1);
}
console.log(`\n✅ Tout est bon. Captures dans ${DOSSIER}/`);
process.exit(0);
