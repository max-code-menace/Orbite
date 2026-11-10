import * as THREE from 'three';
import { Assemblage, SOL, m } from './decors.js';

// Les petites créatures décoratives (étape 7) : une même bestiole ronde sur
// chaque île, de la couleur de sa planète, avec un accessoire différent.
// Toutes ses pièces sont fusionnées en UN seul objet 3D (comme les décors).
// Facultatives : le mode allégé les retire en premier (voir fluidite.js).

const R = 0.085; // le rayon du corps (avant agrandissement)
const TAILLE = 1.7; // agrandie pour être visible sur un écran de téléphone

// Où elle se tient sur l'île (place libre dans le décor). Pour la planète libre,
// la place est libre dans les 5 décors possibles.
const places = {
  instagram: [0.25, 0.05],
  youtube: [0.12, 0.17],
  spotify: [-0.1, 0.3],
  voyage: [0.45, -0.3],
  libre: [-0.58, 0],
};

// --- Les accessoires (un par planète) ---------------------------------------

function appareilPhoto(a) {
  const y = SOL + R * 0.75;
  a.ajouter(new THREE.BoxGeometry(0.085, 0.055, 0.035), '#2a2438', m([0, y, R * 0.95]));
  a.ajouter(
    new THREE.CylinderGeometry(0.02, 0.022, 0.03, 8),
    '#8a8aa0',
    m([0, y, R * 0.95 + 0.03], [Math.PI / 2, 0, 0]),
  );
  a.ajouter(new THREE.BoxGeometry(0.018, 0.012, 0.01), '#ffffff', m([0.026, y + 0.033, R * 0.95]));
}

function casquette(a) {
  const haut = SOL + R * 1.9;
  a.ajouter(
    new THREE.SphereGeometry(R * 0.85, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2),
    '#ff4f4f',
    m([0, haut - 0.03, 0]),
  );
  a.ajouter(new THREE.BoxGeometry(0.1, 0.012, 0.07), '#ffffff', m([0, haut - 0.028, R * 0.8], [-0.15, 0, 0]));
}

function casqueAudio(a) {
  const y = SOL + R * 1.15;
  // l'arceau par-dessus la tête, et les deux écouteurs sur les côtés
  a.ajouter(new THREE.TorusGeometry(R * 1.08, 0.011, 4, 10, Math.PI), '#2b2440', m([0, y, 0]));
  for (const cote of [-1, 1]) {
    a.ajouter(
      new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8),
      '#3dffa0',
      m([cote * R * 1.05, y, 0], [0, 0, Math.PI / 2]),
    );
  }
}

function valise(a) {
  const x = R + 0.06;
  a.ajouter(new THREE.BoxGeometry(0.1, 0.085, 0.045), '#ff8a3d', m([x, SOL + 0.0425, 0]));
  a.ajouter(new THREE.BoxGeometry(0.1, 0.012, 0.047), '#a5733f', m([x, SOL + 0.05, 0]));
  a.ajouter(new THREE.TorusGeometry(0.018, 0.005, 3, 8, Math.PI), '#2b2440', m([x, SOL + 0.085, 0]));
}

function bonnet(a) {
  const haut = SOL + R * 1.75;
  a.ajouter(new THREE.ConeGeometry(R * 0.85, 0.11, 7), '#ffffff', m([0, haut + 0.035, 0]));
  a.ajouter(new THREE.TorusGeometry(R * 0.82, 0.016, 4, 10), '#ffd34d', m([0, haut - 0.01, 0], [Math.PI / 2, 0, 0]));
  a.ajouter(new THREE.IcosahedronGeometry(0.022, 0), '#ffd34d', m([0, haut + 0.1, 0]));
}

const accessoires = { instagram: appareilPhoto, youtube: casquette, spotify: casqueAudio, voyage: valise };

// Le corps : une boule à facettes, deux yeux, deux pieds. Elle regarde vers +z.
// Sa couleur : celle de sa planète, éclaircie pour qu'on la distingue de l'herbe.
function construire(id, couleurPlanete) {
  const couleur = new THREE.Color(couleurPlanete).lerp(new THREE.Color('#ffffff'), 0.6);
  const a = new Assemblage();
  a.ajouter(new THREE.IcosahedronGeometry(R, 1), couleur, m([0, SOL + R, 0], [0, 0, 0], [1, 0.92, 1]));
  for (const cote of [-1, 1]) {
    a.ajouter(new THREE.IcosahedronGeometry(0.022, 0), '#ffffff', m([cote * 0.032, SOL + R * 1.2, R * 0.82]));
    a.ajouter(new THREE.IcosahedronGeometry(0.011, 0), '#1b1628', m([cote * 0.032, SOL + R * 1.2, R * 0.82 + 0.017]));
    a.ajouter(
      new THREE.IcosahedronGeometry(0.028, 0),
      couleur,
      m([cote * 0.04, SOL + 0.012, 0.02], [0, 0, 0], [1, 0.5, 1.3]),
    );
  }
  (accessoires[id] ?? bonnet)(a);
  return a.objet();
}

// --- Le mouvement ---------------------------------------------------------------
// Toutes les quelques secondes (rythme propre à chaque créature), elle fait un
// petit saut, puis la fois suivante tourne la tête à gauche et à droite.
// Le reste du temps, elle ne bouge pas : presque rien à calculer.
const DUREE_SAUT = 0.5;
const DUREE_TOUR = 0.9;

// t : le temps (en secondes) ; periode : le temps entre deux mouvements.
// Renvoie { saut (hauteur), ecrase (1 = forme normale), tour (angle) }.
export function pose(t, periode) {
  const cycle = Math.floor(t / periode);
  const dans = t - cycle * periode;
  const neutre = { saut: 0, ecrase: 1, tour: 0 };
  if (cycle % 2 === 0) {
    if (dans >= DUREE_SAUT) return neutre;
    const k = dans / DUREE_SAUT;
    // Elle s'étire en montant et s'écrase un peu avant de toucher le sol.
    return { saut: Math.sin(Math.PI * k) * 0.09, ecrase: 1 + 0.12 * Math.sin(Math.PI * 2 * k), tour: 0 };
  }
  if (dans >= DUREE_TOUR) return neutre;
  return { saut: 0, ecrase: 1, tour: Math.sin((Math.PI * 2 * dans) / DUREE_TOUR) * 0.7 };
}

// Crée la créature d'une planète. index : sa place dans la liste (décale son rythme).
export function creerCreature(id, couleur, index) {
  const [x, z] = places[id] ?? places.libre;
  const place = new THREE.Group();
  // Agrandie autour de ses pieds : elle reste posée sur le sol de l'île.
  place.position.set(x, -SOL * (TAILLE - 1), z);
  place.scale.setScalar(TAILLE);
  place.rotation.y = Math.atan2(x, z); // elle regarde vers l'extérieur de l'île
  let corps = construire(id, couleur);
  place.add(corps);

  const periode = 3.2 + (index % 3) * 0.5;
  const decalage = index * 1.7;

  function update(elapsed, immobile) {
    const p = immobile ? { saut: 0, ecrase: 1, tour: 0 } : pose(elapsed + decalage, periode);
    corps.position.y = p.saut;
    corps.scale.set(1 / Math.sqrt(p.ecrase), p.ecrase, 1 / Math.sqrt(p.ecrase));
    corps.rotation.y = p.tour;
  }

  // Nouvelle couleur (planète libre qui change de décor) : on refait l'objet.
  function recolorer(nouvelle) {
    place.remove(corps);
    corps.geometry.dispose();
    corps = construire(id, nouvelle);
    place.add(corps);
  }

  // Une valeur qui change quand elle bouge (sert au test automatique).
  const signature = () => `${corps.position.y.toFixed(4)}|${corps.rotation.y.toFixed(4)}`;

  return { objet: place, update, recolorer, signature };
}
