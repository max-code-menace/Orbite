import * as THREE from 'three';
import { createStars, createAsteroids } from './sky.js';
import { createSun } from './sun.js';
import { creerPlanetes } from './planets.js';

const container = document.getElementById('scene');

// --- Le moteur de dessin -------------------------------------------------
// Résolution limitée à 2x : au-delà, l'œil ne voit pas la différence
// mais le téléphone chauffe.
const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

const renderer = new THREE.WebGLRenderer({
  antialias: pixelRatio < 2, // inutile sur les écrans très fins, coûteux
  alpha: true, // transparent : on voit le dégradé du ciel dessiné en CSS
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

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

// Les planètes arrivent dès que le fichier de données est lu.
let systeme = null;
const conteneurEtiquettes = document.getElementById('etiquettes');
fetch('./systeme.json')
  .then((r) => r.json())
  .then((donnees) => {
    systeme = creerPlanetes(donnees, conteneurEtiquettes);
    scene.add(systeme.groupe);
  })
  .catch((err) => console.error('Impossible de lire systeme.json', err));

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
  if (systeme) systeme.update(elapsed, motion, camera, window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);

  if (showFps) {
    fpsFrames++;
    const now = performance.now();
    if (now - fpsLast >= 500) {
      fpsBox.textContent = `${Math.round((fpsFrames * 1000) / (now - fpsLast))} img/s`;
      fpsFrames = 0;
      fpsLast = now;
    }
  }
}

function start() {
  clock.getDelta(); // remet le chrono à zéro
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

// --- Adapter à la taille de l'écran ---------------------------------------
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  // On recule la caméra pour que tout le système tienne, en largeur comme en hauteur.
  const demiVertical = THREE.MathUtils.degToRad(camera.fov / 2);
  const demiHorizontal = Math.atan(Math.tan(demiVertical) * camera.aspect);
  const distance = RAYON_SYSTEME / Math.sin(Math.min(demiVertical, demiHorizontal));
  camera.position.copy(CAMERA_DIRECTION).multiplyScalar(distance);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', resize);
resize();

start();
