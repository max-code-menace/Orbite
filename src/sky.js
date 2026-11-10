import * as THREE from 'three';

// Les étoiles : des milliers de petits points dessinés en une seule fois,
// chacun avec sa taille, sa couleur et son rythme de scintillement.
export function createStars(count, pixelRatio, viewDir) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  const palette = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#cdb8ff'),
    new THREE.Color('#9ec5ff'),
    new THREE.Color('#ffc7ec'),
  ];

  for (let i = 0; i < count; i++) {
    // Point au hasard sur une grande sphère, mais seulement du côté où
    // regarde la caméra : aucune étoile n'est dessinée pour rien.
    const dir = new THREE.Vector3();
    do {
      dir.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    } while (dir.lengthSq() > 1 || dir.lengthSq() < 0.01 || dir.normalize().dot(viewDir) < 0.45);
    dir.multiplyScalar(45 + Math.random() * 35);
    positions[i * 3] = dir.x;
    positions[i * 3 + 1] = dir.y;
    positions[i * 3 + 2] = dir.z;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    // Beaucoup de petites étoiles, quelques grosses.
    sizes[i] = Math.random() < 0.08 ? 2.4 + Math.random() * 1.6 : 0.8 + Math.random() * 1.2;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uTwinkle: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute float phase;
      attribute vec3 color;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uTwinkle;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        float t = sin(uTime * (0.6 + fract(phase) * 1.2) + phase);
        vAlpha = mix(1.0, 0.45 + 0.55 * (0.5 + 0.5 * t), uTwinkle);
        gl_PointSize = size * uPixelRatio * 2.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        // Un point rond et doux plutôt qu'un carré.
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

// Quelques astéroïdes à facettes qui dérivent lentement autour du système.
export function createAsteroids(count) {
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshStandardMaterial({
    color: '#a08ad0',
    emissive: '#2a1650',
    roughness: 0.85,
    flatShading: true,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);

  const items = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 8.5 + Math.random() * 5;
    items.push({
      angle,
      radius,
      height: (Math.random() - 0.5) * 6,
      scale: 0.08 + Math.random() * 0.18,
      spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.6),
      speed: 0.01 + Math.random() * 0.02,
      rotation: new THREE.Euler(Math.random() * 3, Math.random() * 3, 0),
    });
  }

  const dummy = new THREE.Object3D();
  function update(elapsed) {
    items.forEach((a, i) => {
      const angle = a.angle + elapsed * a.speed;
      dummy.position.set(Math.cos(angle) * a.radius, a.height, Math.sin(angle) * a.radius);
      dummy.rotation.set(
        a.rotation.x + elapsed * a.spin.x,
        a.rotation.y + elapsed * a.spin.y,
        a.rotation.z + elapsed * a.spin.z,
      );
      dummy.scale.setScalar(a.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
  update(0);

  return { mesh, update };
}
