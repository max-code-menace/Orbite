import * as THREE from 'three';

// Une texture de halo (un rond lumineux qui s'efface sur les bords),
// dessinée une seule fois dans un petit canvas.
function glowTexture(inner, outer) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, outer);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Le petit soleil au centre : il représente la personne.
export function createSun() {
  const group = new THREE.Group();

  // Le cœur : une boule à facettes orange qui brille d'elle-même.
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 1),
    new THREE.MeshStandardMaterial({
      color: '#ffc061',
      emissive: '#ff8a1f',
      emissiveIntensity: 0.8,
      roughness: 0.6,
      flatShading: true,
    }),
  );
  group.add(core);

  // Le halo : deux couches de lumière douce autour.
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture('rgba(255,210,120,1)', 'rgba(255,140,40,0.45)'),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  );
  halo.scale.setScalar(3.2);
  group.add(halo);

  const outerHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture('rgba(255,140,210,0.7)', 'rgba(170,80,240,0.3)'),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  );
  outerHalo.scale.setScalar(7);
  group.add(outerHalo);

  // La lumière chaude qui éclairera les planètes.
  const light = new THREE.PointLight('#ffb070', 40, 30, 1.6);
  group.add(light);

  function update(elapsed, motion) {
    core.rotation.y = elapsed * 0.15 * motion;
    core.rotation.x = elapsed * 0.05 * motion;
    // Le halo « respire » doucement.
    const pulse = 1 + Math.sin(elapsed * 1.5) * 0.04 * motion;
    halo.scale.setScalar(3.2 * pulse);
  }

  return { group, update };
}
