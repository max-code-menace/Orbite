import * as THREE from 'three';
import { createStars, createAsteroids } from './sky.js';
import { createSun } from './sun.js';
import { PALIERS, calculerRatio, creaturesVisibles, palierApres } from './fluidite.js';
import { creerPlanetes } from './planets.js';
import { remplirProfil, creerAccesRapide, creerPanneau, ecranLarge } from './ui.js';
import {
  amisDe,
  auHasard,
  indexDepuisAdresse,
  indexNomme,
  indicesDuTheme,
  sensDuBalayage,
  voisinDans,
} from './parcours.js';
import { creerBandeAmis } from './amis.js';
import { creerFaisLeTien } from './faistien.js';
import { creerMenu } from './menu.js';
import { montrerAccueil } from './accueil.js';

const container = document.getElementById('scene');

// --- Le moteur de dessin -------------------------------------------------
// Résolution plafonnée (BUDGET_PIXELS) et mode allégé (PALIERS) : voir fluidite.js.
const paramQualite = Number(new URLSearchParams(window.location.search).get('qualite'));
let palier = paramQualite >= 1 && paramQualite <= PALIERS.length ? paramQualite - 1 : 0;
const palierForce = paramQualite >= 1;

function calculerPixelRatio() {
  return calculerRatio(window.innerWidth, window.innerHeight, window.devicePixelRatio, palier);
}
let pixelRatio = calculerPixelRatio();

const renderer = new THREE.WebGLRenderer({
  antialias: pixelRatio < 1.5, // inutile sur les écrans fins, coûteux
  alpha: false, // opaque : le navigateur n'a pas à mélanger la 3D avec la page
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Le ciel (dégradé bleu nuit et violet) est dessiné une seule fois dans une petite
// image, puis affiché en fond par la 3D elle-même.
function creerCiel() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0d0820';
  ctx.fillRect(0, 0, c.width, c.height);
  const taches = [
    [0.5, 0.5, 0.75, 'rgba(36,16,71,1)'],
    [0.7, 0.3, 0.55, 'rgba(155,70,230,0.35)'],
    [0.15, 0.75, 0.5, 'rgba(60,80,220,0.3)'],
  ];
  for (const [x, y, r, couleur] of taches) {
    const g = ctx.createRadialGradient(x * 256, y * 512, 0, x * 256, y * 512, r * 512);
    g.addColorStop(0, couleur);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
scene.background = creerCiel();

// Caméra au-dessus du système, penchée vers le centre, comme sur les maquettes.
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
const CAMERA_DIRECTION = new THREE.Vector3(0, 0.36, 0.93).normalize();
// Le rayon du système entier (planètes, anneaux et étiquettes compris) :
// la caméra recule juste assez pour que tout tienne à l'écran.
const RAYON_SYSTEME = 6.4;

// --- Les lumières --------------------------------------------------------
// Une lumière d'ambiance violette, et des reflets bleus et roses sur les bords.
scene.add(new THREE.HemisphereLight('#b39bff', '#3a1a66', 1.6));
// Une lumière douce de face, pour que les couleurs des planètes restent vives.
const key = new THREE.DirectionalLight('#fff1e6', 1.3);
key.position.set(2, 6, 8);
scene.add(key);
const rimBlue = new THREE.DirectionalLight('#5fa8ff', 0.8);
rimBlue.position.set(-6, 3, -4);
scene.add(rimBlue);
const rimPink = new THREE.DirectionalLight('#ff6fd1', 0.6);
rimPink.position.set(6, 2, -5);
scene.add(rimPink);

// --- Le décor ------------------------------------------------------------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isSmallDevice = Math.min(window.screen.width, window.screen.height) < 400;

const viewDir = CAMERA_DIRECTION.clone().negate();
const stars = createStars(isSmallDevice ? 700 : 1100, pixelRatio, viewDir);
scene.add(stars);

const asteroids = createAsteroids(14);
scene.add(asteroids.mesh);

const sun = createSun();
scene.add(sun.group);

// --- Les systèmes : on en affiche un à la fois ----------------------------
// Les planètes arrivent dès que le fichier de données est lu. Le système affiché
// dépend de l'adresse (…/#noe) ; sinon c'est le premier de la liste.
let galaxie = null;
let courant = 0; // la position du système affiché dans galaxie.systemes
let systeme = null;
let acces = null;
const conteneurEtiquettes = document.getElementById('etiquettes');
let menu = null; // le menu ☰ (créé quand les données sont lues)
let faisLeTien = null; // le formulaire « Fais le tien » (créé quand les données sont lues)
let themeActif = null; // le thème choisi (son id), ou null = « Tous »
const bandeAmis = creerBandeAmis(
  document.getElementById('amis'),
  (i) => voyagerVers(i),
  (sens) => voyager(sens),
  (id) => choisirTheme(id),
);

// Remplace le système affiché par celui-là (sans animation : voir voyagerVers pour l'animation).
function afficherSysteme(index) {
  panneau.fermer();
  if (systeme) {
    scene.remove(systeme.groupe);
    systeme.detruire();
  }
  courant = index;
  const donnees = galaxie.systemes[index];
  // Arrivé chez quelqu'un d'un autre thème (lien d'un ami, adresse) : on repasse sur « Tous ».
  if (themeActif && donnees.theme !== themeActif) themeActif = null;
  bandeAmis.marquerTheme(themeActif);
  remplirProfil(document.getElementById('profil'), donnees.profil);
  menu?.ajouterBoutons(document.getElementById('profil'));
  bandeAmis.remplir(galaxie.systemes, amisDe(galaxie.systemes, donnees));
  if (acces) acces.remplir(donnees.planetes);
  else acces = creerAccesRapide(document.getElementById('acces'), donnees.planetes, resize);
  systeme = creerPlanetes(donnees, conteneurEtiquettes, choisir);
  scene.add(systeme.groupe);
  // L'adresse suit : la recharger ou la copier ramène sur ce système.
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${donnees.id}`);
  resize();
}

fetch('./galaxie.json')
  .then((r) => r.json())
  .then((g) => {
    galaxie = g;
    bandeAmis.creerThemes(g.themes);
    faisLeTien = creerFaisLeTien(g.themes, () => panneau.fermer());
    menu = creerMenu({
      galaxie: () => galaxie,
      courant: () => courant,
      aller: (i) => voyagerVers(i),
      surprise: () => voyagerVers(auHasard(galaxie.systemes.length, courant)),
      faisLeTien: () => faisLeTien.ouvrir(),
    });
    // L'accueil regarde l'adresse AVANT que afficherSysteme n'y écrive le #id.
    montrerAccueil({ onFaisLeTien: () => faisLeTien.ouvrir() });
    afficherSysteme(indexDepuisAdresse(g.systemes, window.location.hash));
    exposerEtatPourTests();
  })
  .catch((err) => console.error('Impossible de lire galaxie.json', err));

// Si l'adresse change sans recharger la page (lien collé dans l'onglet ouvert, bouton retour),
// on voyage vers le système nommé ; une adresse qui n'en nomme aucun est ignorée. Si un voyage
// est en cours, on retient la demande et on la reprend à l'arrivée.
// (Nos propres mises à jour de l'adresse ne déclenchent rien.)
let adresseEnAttente = null;
window.addEventListener('hashchange', () => {
  if (!galaxie) return;
  const index = indexNomme(galaxie.systemes, window.location.hash);
  if (index < 0) return;
  if (voyage) adresseEnAttente = index;
  else voyagerVers(index);
});

// --- Le voyage : le système sort sur le côté, le suivant arrive de l'autre ---
// 0,18 s pour sortir, 0,28 s pour entrer (instantané si « réduire les animations »).
const T_SORTIE = 0.18;
const T_ENTREE = 0.28;
let voyage = null; // { sens, index, phase: 'sortie' | 'entree', debut } pendant le voyage

function voyagerVers(index, sens = index > courant ? 1 : -1) {
  if (!galaxie || voyage || index === courant) return;
  if (reduceMotion.matches) afficherSysteme(index);
  else voyage = { sens, index, phase: 'sortie', debut: performance.now() };
}

// Suivant / précédent, seulement parmi les systèmes du thème choisi (tous si « Tous »).
function voyager(sens) {
  if (!galaxie) return;
  const liste = indicesDuTheme(galaxie.systemes, themeActif);
  voyagerVers(voisinDans(liste, courant, sens), sens);
}

// Toucher une pastille de thème : si on n'est pas déjà dans ce thème, on va dans son premier système.
function choisirTheme(id) {
  if (!galaxie) return;
  themeActif = id;
  bandeAmis.marquerTheme(id);
  if (id && galaxie.systemes[courant].theme !== id) voyagerVers(indicesDuTheme(galaxie.systemes, id)[0]);
}

function poserSysteme(decalage, echelle) {
  systeme.groupe.position.x = decalage;
  systeme.groupe.scale.setScalar(echelle);
}

function majVoyage() {
  if (!voyage) return;
  const t = (performance.now() - voyage.debut) / 1000;
  if (voyage.phase === 'sortie') {
    const k = Math.min(1, t / T_SORTIE);
    poserSysteme(-voyage.sens * 6 * k * k, 1 - 0.5 * k);
    if (k < 1) return;
    afficherSysteme(voyage.index);
    voyage.phase = 'entree';
    voyage.debut = performance.now();
  }
  const k = Math.min(1, (performance.now() - voyage.debut) / 1000 / T_ENTREE);
  const reste = (1 - k) ** 3; // arrive vite, puis se pose doucement
  poserSysteme(voyage.sens * 6 * reste, 1 - 0.5 * reste);
  if (k < 1) return;
  voyage = null;
  if (adresseEnAttente != null) {
    const index = adresseEnAttente;
    adresseEnAttente = null;
    voyagerVers(index);
  }
}

// --- État lisible par le test automatique (scripts/test-mobile.mjs) ----------
// Lecture seule : ça ne change rien à la page, ça permet juste au test de
// vérifier ce qu'une capture d'écran ne prouve pas (décors présents, animations).
function exposerEtatPourTests() {
  window.orbite = {
    systemeId: () => galaxie.systemes[courant].id,
    themeActif: () => themeActif,
    // Combien de formes 3D la carte graphique garde (doit rester stable d'un voyage à l'autre).
    memoire: () => ({ geometries: renderer.info.memory.geometries }),
    planetes: () =>
      systeme.planetes.map((p) => {
        let sommets = 0;
        p.decor.surIle.traverse((o) => {
          if (o.geometry) sommets += o.geometry.attributes.position.count;
        });
        return {
          id: p.donnees.id,
          typeLibre: p.typeLibre,
          couleurAnneau: `#${p.anneau.userData.matieres[0].color.getHexString()}`,
          echelleIle: p.ile.scale.x,
          sommetsDecor: sommets,
          signature: p.decor.signature ? p.decor.signature() : null,
          creatureVisible: p.creature.objet.visible,
          creatureSommets: p.creature.objet.children[0].geometry.attributes.position.count,
          creatureSignature: p.creature.signature(),
        };
      }),
  };
}

// --- Toucher une planète -------------------------------------------------
let focus = null; // l'index de la planète ouverte, ou null
const panneau = creerPanneau(document.getElementById('panneau'), () => {
  focus = null;
  document.body.classList.remove('focus');
});

function choisir(index) {
  const p = systeme.planetes[index];
  focus = index;
  document.body.classList.add('focus');
  // Seule la planète libre (celle qui a un type tiré au hasard) a le bouton « Changer de décor ».
  const onChanger = p.typeLibre ? () => systeme.changerDecor(index, reduceMotion.matches) : null;
  panneau.ouvrir(p.donnees, p.theme, onChanger);
}

// Un « tap » = le doigt se pose et se lève presque au même endroit.
let toucher = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  toucher = { x: e.clientX, y: e.clientY, temps: performance.now() };
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!toucher || !systeme) return;
  const bouge = Math.hypot(e.clientX - toucher.x, e.clientY - toucher.y);
  const duree = performance.now() - toucher.temps;
  toucher = null;
  if (bouge > 12 || duree > 600) return;
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = -(e.clientY / window.innerHeight) * 2 + 1;
  const index = systeme.planeteSous(x, y, camera);
  if (index != null) choisir(index);
  else panneau.fermer(); // toucher à côté referme tout
});

// --- Balayer à l'horizontale : changer de système ----------------------------
// Le doigt peut partir du fond ou d'une étiquette ; pas du profil, de la bande, de l'Accès rapide
// ni du panneau (ils ont leurs propres gestes). Impossible pendant qu'une planète est ouverte.
let balayage = null;
let dernierBalayage = 0;
const peutBalayer = (cible) => cible === renderer.domElement || cible.closest?.('#etiquettes');
window.addEventListener('pointerdown', (e) => {
  balayage = peutBalayer(e.target) ? { x: e.clientX, y: e.clientY, temps: performance.now() } : null;
});
window.addEventListener('pointerup', (e) => {
  if (!balayage) return;
  const sens = sensDuBalayage(e.clientX - balayage.x, e.clientY - balayage.y, performance.now() - balayage.temps);
  balayage = null;
  if (sens === 0) return;
  dernierBalayage = performance.now();
  if (focus == null) voyager(sens);
});
window.addEventListener('pointercancel', () => {
  balayage = null;
});
// Un balayage qui finit sur une étiquette ne doit pas, en plus, ouvrir sa planète.
conteneurEtiquettes.addEventListener(
  'click',
  (e) => {
    if (performance.now() - dernierBalayage < 400) e.stopPropagation();
  },
  true,
);

// --- Compteur d'images par seconde (ajouter ?fps à la fin du lien) --------
const fpsBox = document.getElementById('fps');
const showFps = new URLSearchParams(window.location.search).has('fps');
fpsBox.hidden = !showFps;
let fpsFrames = 0;
let fpsLast = performance.now();

// --- L'animation ---------------------------------------------------------
const clock = new THREE.Clock();
let elapsed = 0;

function frame() {
  // On avance le temps nous-mêmes : si la page était cachée, rien ne « saute ».
  const delta = Math.min(clock.getDelta(), 0.1);
  // « Réduire les animations » : tout bouge 5 fois moins, rien ne scintille.
  const motion = reduceMotion.matches ? 0.2 : 1;
  elapsed += delta * motion;

  stars.material.uniforms.uTime.value = elapsed;
  stars.material.uniforms.uTwinkle.value = reduceMotion.matches ? 0 : 1;
  stars.rotation.z = elapsed * 0.003;
  asteroids.update(elapsed);
  sun.update(elapsed, motion);
  majCamera(delta);
  majVoyage();
  if (systeme) systeme.update(elapsed, motion, camera, window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);

  surveillerFluidite();

  if (showFps) {
    fpsFrames++;
    const now = performance.now();
    if (now - fpsLast >= 500) {
      const ips = Math.round((fpsFrames * 1000) / (now - fpsLast));
      fpsBox.textContent = `${ips} img/s · qualité ${PALIERS.length - palier}/${PALIERS.length}`;
      fpsFrames = 0;
      fpsLast = now;
    }
  }
}

// La page mesure sa fluidité sur des périodes de 2 secondes (après 2 secondes
// de mise en route). Sous 50 images par seconde, elle passe au palier suivant.
let mesure = { debut: 0, images: 0 };
function remettreMesure(attente = 2000) {
  mesure = { debut: performance.now() + attente, images: 0 };
}
function surveillerFluidite() {
  if (palierForce || palier >= PALIERS.length - 1) return;
  const now = performance.now();
  if (now < mesure.debut) return;
  mesure.images++;
  const duree = now - mesure.debut;
  if (duree < 2000) return;
  const ips = (mesure.images * 1000) / duree;
  const suivant = palierApres(palier, ips);
  if (suivant !== palier) {
    palier = suivant;
    resize();
    remettreMesure(1000);
  } else {
    remettreMesure(0);
  }
}

function start() {
  clock.getDelta(); // remet le chrono à zéro
  remettreMesure();
  renderer.setAnimationLoop(frame);
}

function stop() {
  renderer.setAnimationLoop(null);
}

// L'animation s'arrête quand la page n'est plus visible (autre onglet, écran verrouillé).
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else start();
});

// --- La caméra ---------------------------------------------------------------
// La caméra a deux positions : « tout le système » (au repos) et « près d'une
// planète » (quand on l'a touchée). Elle glisse doucement de l'une à l'autre.
const cadre = { haut: 0, centreX: 0, w: 1, h: 1 };
const repos = { pos: new THREE.Vector3(), cible: new THREE.Vector3(), offX: 0, offY: 0 };
const voulu = { pos: new THREE.Vector3(), cible: new THREE.Vector3(), offX: 0, offY: 0 };
const actuel = { pos: new THREE.Vector3(), cible: new THREE.Vector3(), offX: 0, offY: 0 };
let premiereImage = true;
const demiVertical = THREE.MathUtils.degToRad(camera.fov / 2);

// La distance pour qu'un objet de ce rayon tienne dans une zone de cette taille (en pixels).
function distancePour(rayon, zoneH, zoneW, h) {
  const demiZone = Math.atan(Math.tan(demiVertical) * (zoneH / h));
  const demiLarg = Math.atan(Math.tan(demiVertical) * (zoneW / h));
  return rayon / Math.sin(Math.min(demiZone, demiLarg));
}

function calculerVoulu() {
  if (focus == null || !systeme) {
    voulu.pos.copy(repos.pos);
    voulu.cible.copy(repos.cible);
    voulu.offX = repos.offX;
    voulu.offY = repos.offY;
    return;
  }
  // Près de la planète : elle se place au milieu de l'espace au-dessus du panneau.
  const { haut, centreX, w, h } = cadre;
  const basLibre = h - panneau.hauteur();
  const zoneH = Math.max(120, basLibre - haut);
  const zoneW = ecranLarge.matches ? centreX * 2 : w;
  systeme.planetes[focus].pivot.getWorldPosition(voulu.cible);
  voulu.cible.y -= 0.35; // le milieu de l'île, rocher compris
  const distance = Math.min(11, distancePour(2.6, zoneH, zoneW, h));
  voulu.pos.copy(CAMERA_DIRECTION).multiplyScalar(distance).add(voulu.cible);
  voulu.offX = w / 2 - centreX;
  voulu.offY = h / 2 - (haut + zoneH / 2);
}

function majCamera(delta) {
  calculerVoulu();
  // Rapprochement en douceur : environ 0,35 seconde (instantané si « réduire les animations »).
  const t = premiereImage || reduceMotion.matches ? 1 : 1 - Math.exp(-delta * 9);
  premiereImage = false;
  actuel.pos.lerp(voulu.pos, t);
  actuel.cible.lerp(voulu.cible, t);
  actuel.offX += (voulu.offX - actuel.offX) * t;
  actuel.offY += (voulu.offY - actuel.offY) * t;

  camera.position.copy(actuel.pos);
  camera.lookAt(actuel.cible);
  camera.setViewOffset(cadre.w, cadre.h, actuel.offX, actuel.offY, cadre.w, cadre.h);
  camera.updateProjectionMatrix();
}

// --- Adapter à la taille de l'écran ---------------------------------------
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;

  // La place libre pour le système : sous le profil, et au-dessus de l'Accès
  // rapide à moitié ouvert (téléphone) ou à gauche de sa colonne (tablette).
  // La bande « amis » se range juste sous le profil ; le système se cadre sous elle.
  const profil = document.getElementById('profil');
  const bande = document.getElementById('amis');
  bande.style.top = `${profil.getBoundingClientRect().bottom + 6}px`;
  const haut = bande.getBoundingClientRect().bottom + 6;
  const bas = h - (acces ? acces.hauteurRepos() : 0) - 4;
  const zone = Math.max(h * 0.35, bas - haut);
  const droite = ecranLarge.matches ? document.getElementById('acces').getBoundingClientRect().left - 8 : w;
  const largeur = Math.max(w * 0.4, droite);

  // On recule la caméra pour que tout le système tienne dans cette zone,
  // puis on décale l'image pour que le soleil soit au milieu de cette zone.
  const distance = distancePour(RAYON_SYSTEME, zone, largeur, h);
  repos.pos.copy(CAMERA_DIRECTION).multiplyScalar(distance);
  repos.cible.set(0, 0, 0);
  repos.offX = w / 2 - largeur / 2;
  repos.offY = h / 2 - (haut + zone / 2);

  Object.assign(cadre, { haut, centreX: largeur / 2, w, h });
  systeme?.montrerCreatures(creaturesVisibles(palier));
  pixelRatio = calculerPixelRatio();
  renderer.setPixelRatio(pixelRatio);
  stars.material.uniforms.uPixelRatio.value = pixelRatio;
  renderer.setSize(w, h);
}
window.addEventListener('resize', resize);
resize();

start();
