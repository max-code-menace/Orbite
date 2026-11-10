import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Les décors posés sur les îles, construits avec des formes simples.
//
// Pour que ça reste fluide, toutes les pièces fixes d'une île (arbres, cadres,
// maisons…) sont fusionnées en UN SEUL objet 3D, chaque pièce gardant sa couleur.
// Seules les pièces qui bougent (barres d'égaliseur, avion) restent à part.

const SOL = 0.15; // la hauteur du dessus de l'île
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

// Une position, une rotation et une taille réunies en une « matrice ».
function m(pos = [0, 0, 0], rot = [0, 0, 0], taille = 1) {
  const s = Array.isArray(taille) ? taille : [taille, taille, taille];
  tmpQ.setFromEuler(tmpE.set(rot[0], rot[1], rot[2]));
  return new THREE.Matrix4().compose(new THREE.Vector3(...pos), tmpQ.clone(), new THREE.Vector3(...s));
}

// Rassemble des pièces de couleur, puis les fusionne en un seul objet.
class Assemblage {
  constructor() {
    this.pieces = [];
  }

  // geo : la forme ; couleur ; matrice : où la poser (on peut enchaîner des matrices).
  ajouter(geo, couleur, ...matrices) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute('uv');
    g.deleteAttribute('normal');
    for (const mat of matrices) g.applyMatrix4(mat);
    const c = new THREE.Color(couleur);
    const n = g.attributes.position.count;
    const couleurs = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      couleurs[i * 3] = c.r;
      couleurs[i * 3 + 1] = c.g;
      couleurs[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(couleurs, 3));
    this.pieces.push(g);
    return this;
  }

  objet() {
    const geo = mergeGeometries(this.pieces);
    geo.computeVertexNormals();
    for (const p of this.pieces) p.dispose();
    return new THREE.Mesh(geo, matiereDecor);
  }
}

const matiereDecor = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.8 });

// --- Petites pièces réutilisables ------------------------------------------

function arbre(a, x, z, h = 0.3, feuillage = '#2fbf6a') {
  a.ajouter(new THREE.CylinderGeometry(0.025, 0.035, h * 0.45, 5), '#8a5a3a', m([x, SOL + h * 0.22, z]));
  a.ajouter(new THREE.ConeGeometry(h * 0.42, h * 0.8, 6), feuillage, m([x, SOL + h * 0.75, z]));
}

function buisson(a, x, z, r = 0.09, couleur = '#3ccf7a') {
  a.ajouter(new THREE.IcosahedronGeometry(r, 0), couleur, m([x, SOL + r * 0.6, z]));
}

function fleur(a, x, z, couleur) {
  a.ajouter(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 4), '#3c9a5a', m([x, SOL + 0.06, z]));
  a.ajouter(new THREE.IcosahedronGeometry(0.045, 0), couleur, m([x, SOL + 0.13, z]));
}

function rocher(a, x, z, r = 0.07, couleur = '#8a78b0') {
  a.ajouter(new THREE.DodecahedronGeometry(r, 0), couleur, m([x, SOL + r * 0.4, z], [0.4, x * 5, 0.2]));
}

function palmier(a, x, z, h = 0.42, angle = 0) {
  // Un tronc un peu penché et cinq palmes qui retombent.
  const base = m([x, SOL, z], [0, angle, 0.12]);
  a.ajouter(new THREE.CylinderGeometry(0.022, 0.035, h, 5), '#a5733f', m([0, h / 2, 0]), base);
  const sommet = new THREE.Vector3(0, h, 0).applyMatrix4(base);
  for (let i = 0; i < 5; i++) {
    const ay = (i / 5) * Math.PI * 2;
    a.ajouter(
      new THREE.BoxGeometry(0.26, 0.012, 0.08),
      '#27c46b',
      m([0.12, -0.03, 0], [0, 0, -0.45]),
      m([sommet.x, sommet.y, sommet.z], [0, ay, 0]),
    );
  }
}

function maison(a, x, z, ry, mur = '#ffe2cc', toit = '#c4453f') {
  const pose = m([x, 0, z], [0, ry, 0]);
  a.ajouter(new THREE.BoxGeometry(0.22, 0.17, 0.2), mur, m([0, SOL + 0.085, 0]), pose);
  a.ajouter(new THREE.ConeGeometry(0.19, 0.14, 4), toit, m([0, SOL + 0.24, 0], [0, Math.PI / 4, 0]), pose);
  a.ajouter(new THREE.BoxGeometry(0.06, 0.09, 0.01), '#5a3a4a', m([0, SOL + 0.045, 0.101]), pose);
}

// --- Les décors de chaque planète -------------------------------------------

function decorInstagram() {
  const a = new Assemblage();
  // Des petits cadres photo plantés comme des panneaux.
  const cadres = [
    [-0.34, -0.12, 0.5, '#ff9a5a'],
    [0.3, -0.3, -0.35, '#ff5fa8'],
    [0.05, 0.32, 0.05, '#ffcf5a'],
  ];
  for (const [x, z, ry, photo] of cadres) {
    const pose = m([x, 0, z], [0, ry, 0]);
    a.ajouter(new THREE.BoxGeometry(0.04, 0.3, 0.04), '#7a4a3a', m([0, SOL + 0.15, 0]), pose);
    a.ajouter(new THREE.BoxGeometry(0.44, 0.34, 0.04), '#fff4f8', m([0, SOL + 0.44, 0]), pose);
    a.ajouter(new THREE.BoxGeometry(0.36, 0.25, 0.046), photo, m([0, SOL + 0.445, 0]), pose);
    // une petite montagne et un soleil sur la photo
    a.ajouter(new THREE.BoxGeometry(0.07, 0.07, 0.05), '#fff2a8', m([0.09, SOL + 0.5, 0]), pose);
    a.ajouter(
      new THREE.ConeGeometry(0.1, 0.12, 3),
      '#ffffff',
      m([-0.07, SOL + 0.39, 0], [0, 0, 0], [1, 1, 0.26]),
      pose,
    );
  }
  // Des fleurs.
  const fleurs = [
    [-0.55, 0.2, '#ff6fb1'],
    [-0.45, 0.42, '#ffd34d'],
    [-0.2, 0.55, '#ffffff'],
    [0.38, 0.38, '#ff6fb1'],
    [0.55, 0.05, '#ffd34d'],
    [0.5, -0.45, '#ffffff'],
    [-0.1, -0.5, '#ff8a3d'],
  ];
  for (const [x, z, c] of fleurs) fleur(a, x, z, c);
  buisson(a, -0.55, -0.35, 0.1, '#e86fa0');
  buisson(a, 0.6, 0.3, 0.08, '#ff9a5a');
  return { surIle: a.objet() };
}

function decorYouTube() {
  const a = new Assemblage();
  // Un grand écran avec un triangle de lecture.
  const z = -0.18;
  a.ajouter(new THREE.BoxGeometry(0.04, 0.24, 0.04), '#2a1840', m([-0.22, SOL + 0.12, z]));
  a.ajouter(new THREE.BoxGeometry(0.04, 0.24, 0.04), '#2a1840', m([0.22, SOL + 0.12, z]));
  a.ajouter(new THREE.BoxGeometry(0.72, 0.44, 0.06), '#2a1840', m([0, SOL + 0.44, z]));
  a.ajouter(new THREE.BoxGeometry(0.64, 0.36, 0.064), '#ff4f4f', m([0, SOL + 0.44, z]));
  // le triangle de lecture, en relief sur les deux faces de l'écran
  const triangle = new THREE.Shape([
    new THREE.Vector2(-0.06, -0.08),
    new THREE.Vector2(0.09, 0),
    new THREE.Vector2(-0.06, 0.08),
  ]);
  const relief = new THREE.ExtrudeGeometry(triangle, { depth: 0.08, bevelEnabled: false });
  a.ajouter(relief, '#ffffff', m([0, SOL + 0.44, z - 0.04]));
  // Deux petites maisons-studios.
  maison(a, -0.42, 0.3, 0.5, '#ffe2cc', '#c4453f');
  maison(a, 0.38, 0.34, -0.4, '#ffd0d0', '#ff8a3d');
  arbre(a, 0.0, 0.5, 0.26, '#3ccf7a');
  arbre(a, -0.6, -0.15, 0.3, '#2fbf6a');
  buisson(a, 0.6, -0.2, 0.08);
  return { surIle: a.objet() };
}

function decorSpotify() {
  const a = new Assemblage();
  // Une petite scène de festival.
  const z = -0.12;
  a.ajouter(new THREE.BoxGeometry(0.8, 0.08, 0.46), '#2b2440', m([0, SOL + 0.04, z]));
  a.ajouter(new THREE.BoxGeometry(0.06, 0.52, 0.06), '#3a2f5a', m([-0.4, SOL + 0.3, z - 0.18]));
  a.ajouter(new THREE.BoxGeometry(0.06, 0.52, 0.06), '#3a2f5a', m([0.4, SOL + 0.3, z - 0.18]));
  a.ajouter(new THREE.BoxGeometry(0.86, 0.07, 0.08), '#3a2f5a', m([0, SOL + 0.58, z - 0.18]));
  a.ajouter(new THREE.BoxGeometry(0.8, 0.025, 0.085), '#3dffa0', m([0, SOL + 0.56, z - 0.18]));
  // Deux enceintes.
  for (const x of [-0.52, 0.52]) {
    a.ajouter(new THREE.BoxGeometry(0.17, 0.32, 0.15), '#1b1628', m([x, SOL + 0.16, z + 0.1]));
    a.ajouter(
      new THREE.CylinderGeometry(0.055, 0.055, 0.02, 8),
      '#3dffa0',
      m([x, SOL + 0.11, z + 0.18], [Math.PI / 2, 0, 0]),
    );
    a.ajouter(
      new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8),
      '#9dffd0',
      m([x, SOL + 0.24, z + 0.18], [Math.PI / 2, 0, 0]),
    );
  }
  arbre(a, -0.4, 0.42, 0.26, '#2fbf6a');
  arbre(a, 0.42, 0.4, 0.3, '#3ccf7a');
  buisson(a, 0.0, 0.52, 0.09, '#3dffa0');

  // Les barres d'égaliseur, qui bougent : un seul objet répété 6 fois.
  const n = 6;
  const barres = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.07, 1, 0.05),
    new THREE.MeshStandardMaterial({
      color: '#3dffa0',
      emissive: '#1aff8a',
      emissiveIntensity: 0.6,
      flatShading: true,
    }),
    n,
  );
  const teintes = ['#3dffa0', '#5affc0', '#9dffd0', '#ffd34d', '#ff6fb1', '#c86bff'];
  teintes.forEach((t, i) => {
    barres.setColorAt(i, new THREE.Color(t));
  });
  const groupe = new THREE.Group();
  groupe.add(a.objet(), barres);

  const tmp = new THREE.Object3D();
  function update(t) {
    for (let i = 0; i < n; i++) {
      const h = 0.08 + 0.28 * (0.5 + 0.5 * Math.sin(t * (3 + i * 0.7) + i * 1.7)) ** 2;
      tmp.position.set(-0.25 + i * 0.1, SOL + 0.08 + h / 2, z - 0.05);
      tmp.scale.set(1, h, 1);
      tmp.updateMatrix();
      barres.setMatrixAt(i, tmp.matrix);
    }
    barres.instanceMatrix.needsUpdate = true;
  }
  update(0);
  // Une valeur qui change quand les barres bougent (sert au test automatique).
  const signature = () => barres.instanceMatrix.array[5];
  return { surIle: groupe, update, signature };
}

function decorVoyage() {
  const a = new Assemblage();
  // Une île de sable avec des palmiers…
  a.ajouter(new THREE.CylinderGeometry(0.42, 0.46, 0.06, 8), '#f3d38a', m([0.18, SOL + 0.01, 0.18]));
  palmier(a, 0.08, 0.2, 0.42, 0.3);
  palmier(a, 0.35, 0.05, 0.34, 2.2);
  buisson(a, 0.32, 0.4, 0.07, '#27c46b');
  // … une montagne enneigée…
  a.ajouter(new THREE.ConeGeometry(0.34, 0.62, 6), '#7d8fb8', m([-0.3, SOL + 0.31, -0.22]));
  a.ajouter(new THREE.ConeGeometry(0.117, 0.214, 6), '#ffffff', m([-0.3, SOL + 0.513, -0.22]));
  a.ajouter(new THREE.ConeGeometry(0.2, 0.36, 6), '#8fa0c8', m([-0.05, SOL + 0.18, -0.42]));
  a.ajouter(new THREE.ConeGeometry(0.07, 0.126, 6), '#ffffff', m([-0.05, SOL + 0.297, -0.42]));
  rocher(a, -0.55, 0.25, 0.07, '#9aa8c8');

  // … et un petit avion qui fait le tour de la planète.
  const av = new Assemblage();
  av.ajouter(new THREE.CylinderGeometry(0.035, 0.025, 0.26, 6), '#ffffff', m([0, 0, 0], [0, 0, Math.PI / 2]));
  av.ajouter(new THREE.ConeGeometry(0.035, 0.06, 6), '#ff5f7a', m([0.16, 0, 0], [0, 0, -Math.PI / 2]));
  av.ajouter(new THREE.BoxGeometry(0.07, 0.012, 0.34), '#ffffff', m([0.02, 0, 0]));
  av.ajouter(new THREE.BoxGeometry(0.05, 0.08, 0.012), '#ff5f7a', m([-0.11, 0.05, 0]));
  av.ajouter(new THREE.BoxGeometry(0.04, 0.01, 0.12), '#ffffff', m([-0.11, 0.01, 0]));
  const avion = av.objet();
  const orbite = new THREE.Group();
  avion.position.set(0, 0, 1.05);
  avion.rotation.y = Math.PI; // le nez dans le sens du vol
  orbite.add(avion);
  orbite.position.y = 0.55;
  orbite.rotation.z = 0.15;

  function update(t) {
    orbite.rotation.y = t * 0.8;
    avion.position.y = Math.sin(t * 2) * 0.04;
    avion.rotation.x = Math.sin(t * 2) * 0.15; // il penche un peu dans le virage
  }
  const signature = () => orbite.rotation.y;
  return { surIle: a.objet(), autour: orbite, update, signature };
}

// --- La planète libre : cinq décors possibles --------------------------------

export const decorsLibres = {
  foret: {
    couleurs: { herbe: '#4fd67a', terre: '#3a8a4f', anneau: '#7dff9a' },
    construire(a) {
      const arbres = [
        [-0.4, -0.25, 0.38],
        [0.1, -0.45, 0.32],
        [0.42, -0.1, 0.4],
        [-0.15, 0.1, 0.44],
        [0.3, 0.35, 0.3],
        [-0.5, 0.3, 0.3],
      ];
      for (const [x, z, h] of arbres) arbre(a, x, z, h, h > 0.36 ? '#1fae5a' : '#3ccf7a');
      buisson(a, 0.0, 0.5, 0.08, '#2fbf6a');
      rocher(a, 0.55, 0.15, 0.06);
    },
  },
  cristaux: {
    couleurs: { herbe: '#b38bff', terre: '#6b45c9', anneau: '#5ff2ff' },
    construire(a) {
      const cristaux = [
        [0, 0, 0.5, '#5ff2ff', 0],
        [-0.3, -0.2, 0.36, '#ff7ae0', 0.3],
        [0.3, -0.25, 0.32, '#c86bff', -0.3],
        [0.25, 0.3, 0.28, '#5ff2ff', 0.25],
        [-0.35, 0.3, 0.24, '#ff7ae0', -0.25],
        [0.55, 0.05, 0.18, '#ffffff', 0.2],
      ];
      for (const [x, z, h, c, pench] of cristaux) {
        a.ajouter(
          new THREE.OctahedronGeometry(1, 0),
          c,
          m([x, SOL + h * 0.5, z], [0, x * 3, pench], [h * 0.22, h * 0.6, h * 0.22]),
        );
      }
    },
  },
  champignons: {
    couleurs: { herbe: '#7ddc6a', terre: '#a0603a', anneau: '#ff6f8a' },
    construire(a) {
      const champis = [
        [0, -0.1, 0.4, '#ff4f5f'],
        [-0.4, 0.15, 0.28, '#ff9a3c'],
        [0.38, 0.2, 0.3, '#c86bff'],
        [0.25, -0.42, 0.22, '#ff4f5f'],
        [-0.3, -0.4, 0.2, '#ffd34d'],
      ];
      for (const [x, z, h, c] of champis) {
        a.ajouter(new THREE.CylinderGeometry(h * 0.12, h * 0.16, h * 0.6, 6), '#fff4e6', m([x, SOL + h * 0.3, z]));
        a.ajouter(
          new THREE.SphereGeometry(h * 0.4, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2),
          c,
          m([x, SOL + h * 0.55, z]),
        );
        a.ajouter(
          new THREE.IcosahedronGeometry(h * 0.07, 0),
          '#ffffff',
          m([x + h * 0.15, SOL + h * 0.85, z + h * 0.1]),
        );
      }
      fleur(a, 0.55, -0.1, '#ffffff');
      fleur(a, -0.1, 0.5, '#ffd34d');
    },
  },
  glace: {
    couleurs: { herbe: '#e8f6ff', terre: '#8fc8ff', anneau: '#9fe8ff' },
    construire(a) {
      const pics = [
        [-0.25, -0.2, 0.5],
        [0.05, -0.38, 0.36],
        [0.35, -0.1, 0.44],
        [0.2, 0.3, 0.3],
        [-0.4, 0.25, 0.28],
      ];
      for (const [x, z, h] of pics) {
        a.ajouter(new THREE.ConeGeometry(h * 0.26, h, 5), '#bfe9ff', m([x, SOL + h / 2, z], [0, x * 4, x * 0.3]));
      }
      a.ajouter(new THREE.CylinderGeometry(0.24, 0.26, 0.03, 7), '#7fd0ff', m([0.0, SOL + 0.01, 0.15]));
      rocher(a, 0.5, 0.35, 0.07, '#d8f0ff');
    },
  },
  volcan: {
    couleurs: { herbe: '#5a3848', terre: '#3a2030', anneau: '#ff7a2a' },
    construire(a) {
      a.ajouter(new THREE.CylinderGeometry(0.13, 0.42, 0.5, 7), '#4a3040', m([0, SOL + 0.25, -0.05]));
      a.ajouter(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 7), '#ff6a2a', m([0, SOL + 0.505, -0.05]));
      // coulées de lave
      a.ajouter(new THREE.BoxGeometry(0.06, 0.4, 0.03), '#ff8a3d', m([0.12, SOL + 0.28, 0.12], [-0.55, 0, -0.35]));
      a.ajouter(new THREE.BoxGeometry(0.05, 0.32, 0.03), '#ff6a2a', m([-0.14, SOL + 0.24, 0.1], [-0.5, 0, 0.45]));
      rocher(a, 0.45, 0.3, 0.08, '#6a4858');
      rocher(a, -0.5, 0.2, 0.07, '#6a4858');
      rocher(a, 0.4, -0.4, 0.06, '#ff8a3d');
    },
  },
};

export const typesLibres = Object.keys(decorsLibres);

// Tire un type de décor libre toujours différent de l'actuel
// (sinon on croirait que le bouton « Changer de décor » ne marche pas).
export function tirerAutreType(actuel, hasard = Math.random) {
  const autres = typesLibres.filter((t) => t !== actuel);
  return autres[Math.floor(hasard() * autres.length)];
}

function decorLibre(type) {
  const a = new Assemblage();
  decorsLibres[type].construire(a);
  return { surIle: a.objet() };
}

// Le décor d'une planète, selon son identifiant (pour la planète libre : selon son type).
export function creerDecor(id, typeLibre) {
  switch (id) {
    case 'instagram':
      return decorInstagram();
    case 'youtube':
      return decorYouTube();
    case 'spotify':
      return decorSpotify();
    case 'voyage':
      return decorVoyage();
    default:
      return decorLibre(typeLibre);
  }
}
