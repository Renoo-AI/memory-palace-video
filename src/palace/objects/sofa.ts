import * as THREE from 'three';
import { createAsset as createSofaAsset } from '../assets/polyfork/sofa-9c0e7e.mjs';
import { preparePolyforkAsset } from '../assets/polyfork';
import { makeContactShadow } from './primitives';

export interface SofaRig {
  group: THREE.Group;
  cushionGroup: THREE.Group;
  update: (dipAmount: number) => void;
}

/**
 * Living room Sofa using Polyfork sofa-9c0e7e.mjs (3-seater warm oatmeal-mustard wool with terracotta accent pillows).
 */
export function buildSofa(): SofaRig {
  const group = new THREE.Group();
  group.name = 'living_sofa';

  const cushionGroup = new THREE.Group();
  group.add(cushionGroup);

  const sofa = createSofaAsset({
    frame: '#E0C078',
    cushion: '#F7ECD4',
    scatterFabric: '#D9553B',
    leg: '#7D5836',
    seats: 3,
    scatter: 2,
    lived_in: 0.4,
  });

  preparePolyforkAsset(sofa, {
    targetWidth: 2.35,
    groundY: true,
    centerXZ: true,
    roughness: 0.86,
    metalness: 0.0,
  });
  cushionGroup.add(sofa);

  group.add(makeContactShadow(1.22, 0.58));

  return {
    group,
    cushionGroup,
    update: (dipAmount: number) => {
      cushionGroup.scale.y = 1.0 - dipAmount * 0.06;
    },
  };
}
