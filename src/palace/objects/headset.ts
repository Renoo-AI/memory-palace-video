import * as THREE from 'three';
import { createPalaceToonMaterial, makeChromeMaterial, makeGlassMaterial } from '../render/toon';
import { makeContactShadow, makeRoundedBox } from './primitives';

export interface HeadsetRig {
  group: THREE.Group;
  visorGroup: THREE.Group;
  update: (lensSwingRad: number) => void;
}

/**
 * Sleek generic matte-ivory & anodized aluminum VR Headset for S35.
 */
export function buildGenericHeadset(): HeadsetRig {
  const group = new THREE.Group();
  group.name = 'generic_vr_headset';

  const visorGroup = new THREE.Group();
  visorGroup.position.y = 0.12;
  group.add(visorGroup);

  const shellMat = createPalaceToonMaterial({
    colorKey: 'creamWall',
    roughness: 0.35,
    metalness: 0.06,
  });
  const padMat = createPalaceToonMaterial({
    baseHex: '#2C2F36',
    roughness: 0.85,
  });
  const strapMat = createPalaceToonMaterial({
    colorKey: 'cobalt',
    roughness: 0.78,
  });
  const chromeMat = makeChromeMaterial('#C5CCD4');
  const glassMat = makeGlassMaterial('#1A2029', 0.92);

  // Main curved shell
  const box = new THREE.Mesh(makeRoundedBox(0.36, 0.16, 0.18, 0.045), shellMat);
  box.castShadow = true;
  box.receiveShadow = true;
  visorGroup.add(box);

  // Soft facial gasket cushion
  const gasket = new THREE.Mesh(makeRoundedBox(0.32, 0.135, 0.04, 0.025), padMat);
  gasket.position.z = -0.095;
  visorGroup.add(gasket);

  // Front glossy glass visor plate + dual optical rings
  const frontGlass = new THREE.Mesh(makeRoundedBox(0.31, 0.115, 0.024, 0.025), glassMat);
  frontGlass.position.z = 0.092;
  visorGroup.add(frontGlass);

  const ringGeo = new THREE.TorusGeometry(0.036, 0.006, 10, 24);
  for (const sx of [-1, 1]) {
    const ring = new THREE.Mesh(ringGeo, chromeMat);
    ring.position.set(sx * 0.088, 0, 0.104);
    visorGroup.add(ring);
  }

  // Woven Cobalt head strap & top strap
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.022, 10, 24, Math.PI * 1.25),
    strapMat
  );
  strap.rotation.x = Math.PI * 0.5;
  strap.rotation.z = Math.PI * 0.875;
  strap.position.set(0, 0, -0.09);
  strap.castShadow = true;
  visorGroup.add(strap);

  group.add(makeContactShadow(0.22, 0.18));

  return {
    group,
    visorGroup,
    update: (lensSwingRad: number) => {
      visorGroup.rotation.y = lensSwingRad;
    },
  };
}
