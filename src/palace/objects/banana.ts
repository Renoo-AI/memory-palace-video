import * as THREE from 'three';
import { createAsset as createBananaAsset } from '../assets/polyfork/banana-09c206.mjs';
import { preparePolyforkAsset } from '../assets/polyfork';

export interface BananaRig {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  update: (twosTime: number, tipAmount: number, boilAngle: number) => void;
}

/**
 * OBJECT 2: GIANT BANANA ON THE SOFA (~2.1m long)
 * Uses Polyfork banana-09c206.mjs scaled up heroically with realistic peel sheen.
 */
export function buildGiantBanana(): BananaRig {
  const group = new THREE.Group();
  group.name = 'giant_banana';

  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  const banana = createBananaAsset({
    colorway: 'ripe',
    peel: '#F2BE2C',
    tip: '#3E2B1C',
    bend: 0.72,
    girth: 1.12,
  });

  preparePolyforkAsset(banana, {
    targetWidth: 2.08,
    groundY: true,
    centerXZ: true,
    roughness: 0.42,
    metalness: 0.02,
  });

  // Tilt slightly toward camera so its sculptural curve catches studio key & rim light
  banana.rotation.x = 0.22;
  bodyGroup.add(banana);

  const update: BananaRig['update'] = (twosTime, tipAmount, boilAngle) => {
    const breath = 1.0 + Math.sin(twosTime * 2.2) * 0.015;
    bodyGroup.scale.set(1, breath, 1);
    bodyGroup.rotation.x = tipAmount * ((4.0 * Math.PI) / 180);
    bodyGroup.rotation.z = boilAngle * 0.5;
  };

  return { group, bodyGroup, update };
}
