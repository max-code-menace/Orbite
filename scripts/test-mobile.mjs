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
  verifier(['foret', 'cristaux', 'champignons', 'glace', 'volcan'].includes(libre?.typeLibre), `la planète libre a un décor tiré au hasard (${libre?.typeLibre})`);
  await page.waitForTimeout(700);
  const apres = await page.evaluate(() => window.orbite.planetes());
  for (const id of ['spotify', 'voyage']) {
    const a = avant.find((p) => p.id === id)?.signature;
    const b = apres.find((p) => p.id === id)?.signature;
    verifier(a != null && b != null && a !== b, `les pièces animées de ${id} bougent (${id === 'spotify' ? "barres d'égaliseur" : 'avion'})`);
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
  verifier(panneau && panneau.height <= hauteur * 0.6 + 1, "le panneau ne couvre pas plus d'environ la moitié de l'écran");

  // La croix referme le panneau.
  await page.locator('.panneau-fermer').click();
  await page.waitForTimeout(800);
  verifier((await page.locator('#panneau.visible').count()) === 0, 'la croix referme le panneau');

  verifier(erreurs.length === 0, `aucune erreur dans la page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`);
  await page.close();
}

await navigateur.close();
serveur.httpServer.close();

if (echecs) {
  console.log(`\n❌ ${echecs} vérification(s) en échec. Captures dans ${DOSSIER}/`);
  process.exit(1);
}
console.log(`\n✅ Tout est bon. Captures dans ${DOSSIER}/`);
process.exit(0);
