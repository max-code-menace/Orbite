import * as THREE from 'three';
import { icons } from './icons.js';
import { creerCreature } from './creatures.js';
import { creerDecor, decorsLibres, tirerAutreType, typesLibres } from './decors.js';

// Les couleurs de chaque planète (le style reste dans le code,
// le nom et les liens sont dans systeme.json).
export const themes = {
  instagram: { herbe: '#ff8fb1', terre: '#ff9a5a', anneau: '#ff5fb8' },
  youtube: { herbe: '#ff6f61', terre: '#c4453f', anneau: '#ff9a3c' },
  spotify: { herbe: '#3dffa0', terre: '#1c9a68', anneau: '#3dff7a' },
  voyage: { herbe: '#45b4ff', terre: '#2d6fd0', anneau: '#5a8cff' },
  libre: { herbe: '#c58bff', terre: '#7a4fd6', anneau: '#c86bff' },
};

// La place de chaque planète autour du soleil : rayon de l'orbite
// et angle (en degrés). Choisis pour que rien ne se chevauche à l'écran.
const places = {
  instagram: { rayon: 2.6, angle: -150 },
  youtube: { rayon: 3.3, angle: -30 },
  spotify: { rayon: 4.0, angle: 150 },
  voyage: { rayon: 4.7, angle: 60 },
  libre: { rayon: 5.4, angle: -90 },
};

const ROCHE = '#6a4a8c';

// Le plan des orbites est penché vers la caméra : les orbites restent bien rondes
// à l'écran, alors que les îles, elles, restent droites et montrent leurs rochers.
const INCLINAISON = 0.62;

// Déplace un peu chaque sommet au hasard (mais toujours pareil pour un même
// point) : ça donne l'aspect « taillé à la main » des formes à facettes.
function bosseler(geometry, force, garderLeHaut = false) {
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (garderLeHaut && v.y > 0.001) continue;
    const h = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719) * 43758.5453;
    const n = (h - Math.floor(h) - 0.5) * 2;
    const len = Math.hypot(v.x, v.z);
    if (len > 0.001) {
      v.x += (v.x / len) * n * force;
      v.z += (v.z / len) * n * force;
    }
    v.y += n * force * 0.5;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function matiere(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });
}

// Une île flottante : un dessus plat (l'herbe), une couche de terre,
// et un gros rocher pointu en dessous.
function creerIle(theme, r = 0.8) {
  const ile = new THREE.Group();

  const dessus = new THREE.Mesh(
    bosseler(new THREE.CylinderGeometry(r, r * 0.97, 0.16, 10), 0.04),
    matiere(theme.herbe),
  );
  dessus.position.y = 0.08;
  ile.add(dessus);

  const terre = new THREE.Mesh(
    bosseler(new THREE.CylinderGeometry(r * 0.97, r * 0.85, 0.22, 10), 0.05),
    matiere(theme.terre),
  );
  terre.position.y = -0.11;
  ile.add(terre);

  const rocher = new THREE.Mesh(bosseler(new THREE.ConeGeometry(r * 0.85, r * 1.3, 10, 3), 0.1, true), matiere(ROCHE));
  rocher.rotation.x = Math.PI; // la pointe vers le bas
  rocher.position.y = -0.22 - (r * 1.3) / 2;
  ile.add(rocher);

  // On garde les couleurs de l'herbe et de la terre sous la main pour pouvoir
  // les changer plus tard (bouton « Changer de décor » de la planète libre).
  ile.userData.matieres = { herbe: dessus.material, terre: terre.material };
  return ile;
}

// L'anneau néon autour de la planète : un trait fin et un halo plus large.
function creerAnneau(couleur, r) {
  const groupe = new THREE.Group();
  const trait = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.022, 4, 64),
    new THREE.MeshBasicMaterial({ color: couleur }),
  );
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.09, 4, 64),
    new THREE.MeshBasicMaterial({
      color: couleur,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  groupe.add(trait, halo);
  groupe.userData.matieres = [trait.material, halo.material];
  groupe.rotation.x = Math.PI / 2 - 0.85;
  groupe.rotation.z = 0.25;
  return groupe;
}

// Une orbite en pointillé lumineux.
function creerOrbite(rayon) {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * rayon, 0, Math.sin(a) * rayon));
  }
  const ligne = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineDashedMaterial({
      color: '#c9a8ff',
      dashSize: 0.18,
      gapSize: 0.14,
      transparent: true,
      opacity: 0.55,
    }),
  );
  ligne.computeLineDistances();
  return ligne;
}

// Crée les 5 planètes, leurs orbites et leurs étiquettes.
export function creerPlanetes(donnees, conteneurEtiquettes, onChoisir) {
  const groupe = new THREE.Group();
  const plan = new THREE.Group();
  plan.rotation.x = INCLINAISON;
  groupe.add(plan);
  const planetes = [];

  donnees.planetes.forEach((p, i) => {
    // La planète libre tire son décor (et ses couleurs) au hasard.
    const typeLibre =
      themes[p.id] && p.id !== 'libre' ? null : typesLibres[Math.floor(Math.random() * typesLibres.length)];
    const theme = typeLibre ? decorsLibres[typeLibre].couleurs : themes[p.id];
    const place = places[p.id] ?? { rayon: 2.6 + i * 0.7, angle: i * 72 };

    plan.add(creerOrbite(place.rayon));

    const pivot = new THREE.Group();
    const a = THREE.MathUtils.degToRad(place.angle);
    const base = new THREE.Vector3(Math.cos(a) * place.rayon, 0, Math.sin(a) * place.rayon);
    base.applyAxisAngle(new THREE.Vector3(1, 0, 0), INCLINAISON);
    pivot.position.copy(base);

    const ile = creerIle(theme);
    pivot.add(ile);
    const decor = creerDecor(p.id, typeLibre);
    ile.add(decor.surIle);
    if (decor.autour) pivot.add(decor.autour);
    // La petite créature, posée sur l'île (elle tourne et « poppe » avec elle).
    const creature = creerCreature(p.id, theme.anneau, i);
    ile.add(creature.objet);
    const anneau = creerAnneau(theme.anneau, 1.25);
    pivot.add(anneau);

    // La zone à toucher : une boule invisible, plus grosse que l'île,
    // pour qu'on puisse toucher la planète au pouce sans viser.
    const zone = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
    zone.position.y = -0.3;
    zone.userData.index = i;
    pivot.add(zone);
    groupe.add(pivot);

    // L'étiquette : du HTML normal posé par-dessus la 3D. La toucher ouvre aussi la planète.
    const etiquette = document.createElement('button');
    etiquette.type = 'button';
    etiquette.className = 'etiquette';
    const icone = document.createElement('span');
    icone.className = 'etiquette-icone';
    icone.style.color = theme.anneau;
    icone.innerHTML = icons[p.id] ?? icons.libre;
    const nom = document.createElement('span');
    nom.textContent = p.nom;
    etiquette.append(icone, nom);
    etiquette.addEventListener('click', () => onChoisir?.(i));
    conteneurEtiquettes.appendChild(etiquette);

    planetes.push({
      donnees: p,
      pivot,
      ile,
      zone,
      theme,
      decor,
      creature,
      typeLibre,
      anneau,
      icone,
      etiquette,
      pop: null, // l'animation de changement de décor en cours (ou null)
      tour: 0, // le tour sur elle-même ajouté pendant cette animation
      phase: i * 1.3,
      baseY: base.y,
    });
  });

  const point = new THREE.Vector3();
  let creaturesMontrees = true;

  // Montre ou cache les créatures (le mode allégé les retire en premier).
  function montrerCreatures(oui) {
    creaturesMontrees = oui;
    for (const p of planetes) p.creature.objet.visible = oui;
  }

  function update(elapsed, motion, camera, largeur, hauteur) {
    for (const p of planetes) {
      // Chaque planète flotte légèrement et tourne lentement sur elle-même.
      p.pivot.position.y = p.baseY + Math.sin(elapsed * 0.9 + p.phase) * 0.12 * motion;
      if (p.pop) animerPop(p);
      p.ile.rotation.y = elapsed * 0.25 + p.phase + p.tour;
      p.decor.update?.(elapsed);
      // Immobiles si « réduire les animations » (motion < 1) ; rien à calculer si cachées.
      if (creaturesMontrees) p.creature.update(elapsed, motion < 1);

      // L'étiquette suit la planète, juste au-dessus d'elle.
      point.set(0, 1.0, 0);
      p.pivot.localToWorld(point);
      point.project(camera);
      const x = (point.x * 0.5 + 0.5) * largeur;
      const y = (-point.y * 0.5 + 0.5) * hauteur;
      p.etiquette.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    }
  }

  // Quelle planète se trouve sous le doigt ? (null si aucune)
  const rayon = new THREE.Raycaster();
  const zones = planetes.map((p) => p.zone);
  function planeteSous(ndcX, ndcY, camera) {
    rayon.setFromCamera({ x: ndcX, y: ndcY }, camera);
    const touche = rayon.intersectObjects(zones, false)[0];
    return touche ? touche.object.userData.index : null;
  }

  // --- « Changer de décor » (planète libre) ---------------------------------
  // Tire un nouveau décor, toujours différent de l'actuel (sinon on croirait
  // que le bouton ne marche pas). Renvoie les nouvelles couleurs, ou null.
  // instantane = sans animation (réglage « réduire les animations »).
  function changerDecor(index, instantane = false) {
    const p = planetes[index];
    if (!p?.typeLibre || p.pop) return null; // pas une planète libre, ou animation déjà en cours
    p.typeLibre = tirerAutreType(p.typeLibre);
    p.theme = decorsLibres[p.typeLibre].couleurs;
    if (instantane) habiller(p);
    else p.pop = { debut: performance.now(), habillee: false };
    return p.theme;
  }

  return { groupe, planetes, update, planeteSous, changerDecor, montrerCreatures };
}

// Met sur l'île les couleurs et le décor de son type actuel.
function habiller(p) {
  p.ile.userData.matieres.herbe.color.set(p.theme.herbe);
  p.ile.userData.matieres.terre.color.set(p.theme.terre);
  for (const mat of p.anneau.userData.matieres) mat.color.set(p.theme.anneau);
  p.icone.style.color = p.theme.anneau;
  p.creature.recolorer(p.theme.anneau);

  // L'ancien décor est retiré et sa forme effacée de la mémoire.
  // (Sa matière est partagée par tous les décors : on la garde.)
  p.ile.remove(p.decor.surIle);
  p.decor.surIle.traverse((o) => o.geometry?.dispose());
  if (p.decor.autour) p.pivot.remove(p.decor.autour);

  p.decor = creerDecor(p.donnees.id, p.typeLibre);
  p.ile.add(p.decor.surIle);
  if (p.decor.autour) p.pivot.add(p.decor.autour);
}

// L'animation « pop » (0,6 s) : l'île rapetisse en tournant, change de décor
// quand elle est toute petite, puis regrossit avec un petit rebond.
const DUREE_RETRECIR = 0.22;
const DUREE_POP = 0.6;
function animerPop(p) {
  const t = (performance.now() - p.pop.debut) / 1000;
  let echelle;
  if (t < DUREE_RETRECIR) {
    const k = t / DUREE_RETRECIR;
    echelle = 1 - 0.95 * k * k;
  } else {
    if (!p.pop.habillee) {
      habiller(p);
      p.pop.habillee = true;
    }
    const k = Math.min(1, (t - DUREE_RETRECIR) / (DUREE_POP - DUREE_RETRECIR));
    // « Rebond » : dépasse un peu la taille normale, puis y revient.
    const r = 1 + 2.70158 * (k - 1) ** 3 + 1.70158 * (k - 1) ** 2;
    echelle = 0.05 + 0.95 * r;
  }
  // Un tour complet sur elle-même, qui démarre et finit en douceur.
  const k = Math.min(1, t / DUREE_POP);
  p.tour = Math.PI * 2 * (k * k * (3 - 2 * k));
  if (t >= DUREE_POP) {
    echelle = 1;
    p.tour = 0;
    p.pop = null;
  }
  p.ile.scale.setScalar(Math.max(0.05, echelle));
}
