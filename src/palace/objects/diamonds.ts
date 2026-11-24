import * as THREE from 'three';
import { createAsset as createCutDiamondAsset } from '../assets/polyfork/cut-diamond-1fd38b.mjs';
import { makeCrystalMaterial } from '../render/toon';
import { hashInt, mulberry32 } from '../seed';
import { stepLinear } from '../render/twos';

export interface DiamondsRig {
  group: THREE.Group;
  instanced: THREE.InstancedMesh;
  fallingDiamond: THREE.Mesh;
  update: (frameIndex: number, twosTime: number, fallStartTime: number) => void;
}

function extractPolyforkDiamondGeometry(): THREE.BufferGeometry {
  const asset = createCutDiamondAsset();
  let geo: THREE.BufferGeometry | null = null;
  asset.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!geo && m.isMesh && m.geometry) {
      geo = m.geometry.clone();
    }
  });
  if (!geo) {
    return new THREE.IcosahedronGeometry(0.062, 0).toNonIndexed();
  }
  const g = geo as THREE.BufferGeometry;
  g.deleteAttribute('color');
  g.computeVertexNormals();
  g.center();
  return g;
}

/**
 * 120 faceted crystal diamonds overflowing 3 shelves + floor inside the Polyfork fridge,
 * plus 1 hero falling diamond that lands with a crisp SLAM at sync word "diamonds".
 */
export function buildDiamonds(): DiamondsRig {
  const group = new THREE.Group();
  group.name = 'fridge_diamonds';

  const count = 120;
  const geo = extractPolyforkDiamondGeometry();
  const mat = makeCrystalMaterial('#B7EEFF');

  const instanced = new THREE.InstancedMesh(geo, mat, count);
  instanced.castShadow = true;
  instanced.receiveShadow = true;
  instanced.frustumCulled = false;
  group.add(instanced);

  const rng = mulberry32(42069);
  const dummy = new THREE.Object3D();

  const colorsHex = ['#9EE6FF', '#FFFFFF', '#6BC4F0', '#D9F6FF'];
  // Exact shelf surface heights matching fridge-freezer-fb9b5a.mjs (split: 0.34, shelves: 3)
  const shelfHeights = [0.70, 0.99, 1.28];
  const basePositions: { pos: THREE.Vector3; rot: THREE.Euler; scale: number; colIdx: number }[] = [];

  for (let i = 0; i < count; i++) {
    let x = 0;
    let y = 0;
    let z = 0;

    if (i < 100) {
      const shelfIdx = i % 3;
      const baseY = shelfHeights[shelfIdx];
      const layer = Math.floor(i / 34);
      x = (rng() - 0.5) * 0.58;
      y = baseY + layer * 0.036 + rng() * 0.015;
      z = (rng() - 0.5) * 0.44 - 0.04;
    } else {
      // Spilled out onto the kitchen floor right in front of the fridge!
      x = (rng() - 0.5) * 0.85;
      y = 0.048;
      z = 0.48 + rng() * 0.62;
    }

    const scale = 0.82 + rng() * 0.85;
    const rot = new THREE.Euler(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    const colIdx = i % colorsHex.length;

    basePositions.push({ pos: new THREE.Vector3(x, y, z), rot, scale, colIdx });

    dummy.position.set(x, y, z);
    dummy.rotation.copy(rot);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
    instanced.setColorAt(i, new THREE.Color(colorsHex[colIdx]));
  }

  instanced.instanceMatrix.needsUpdate = true;
  if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;

  // Hero falling diamond
  const fallingMat = makeCrystalMaterial('#D9F6FF');
  fallingMat.emissive = new THREE.Color('#6FD2F5');
  fallingMat.emissiveIntensity = 0.18;
  const fallingDiamond = new THREE.Mesh(geo, fallingMat);
  fallingDiamond.name = 'falling_diamond';
  fallingDiamond.castShadow = true;
  fallingDiamond.scale.setScalar(1.45);
  fallingDiamond.position.set(0.16, 1.56, 0.24);
  group.add(fallingDiamond);

  const tmpCol = new THREE.Color();

  const update: DiamondsRig['update'] = (frameIndex, twosTime, fallStartTime) => {
    const shimmerStep = Math.floor(frameIndex / 6);
    for (let i = 0; i < count; i++) {
      const h = hashInt(i, shimmerStep) % 5;
      const hex = h === 0 ? '#FFFFFF' : colorsHex[basePositions[i].colIdx];
      tmpCol.set(hex);
      instanced.setColorAt(i, tmpCol);
    }
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;

    const p = stepLinear(twosTime, fallStartTime, fallStartTime + 0.36);
    const fallY = THREE.MathUtils.lerp(1.56, 0.06, p * p);
    const fallZ = THREE.MathUtils.lerp(0.24, 0.62, p);
    fallingDiamond.position.set(0.16, fallY, fallZ);
    fallingDiamond.rotation.set(p * 3.2, p * 2.1, 0);
  };

  return { group, instanced, fallingDiamond, update };
}
