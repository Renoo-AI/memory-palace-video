import * as THREE from 'three';
import { createAsset as createBedAsset } from '../assets/polyfork/hotel-king-bed-c15761.mjs';
import { preparePolyforkAsset } from '../assets/polyfork';
import { makeContactShadow } from './primitives';

export interface BedRig {
  group: THREE.Group;
  mattressGroup: THREE.Group;
  update: (dipAmount: number) => void;
}

/**
 * Bedroom Bed using Polyfork hotel-king-bed-c15761.mjs
 * Velvet terracotta-crimson headboard with brushed brass trim, crisp white duvet, and plush pillows.
 */
export function buildBed(): BedRig {
  const group = new THREE.Group();
  group.name = 'bedroom_bed';

  const mattressGroup = new THREE.Group();
  group.add(mattressGroup);

  const bed = createBedAsset({
    velvet: '#D44634',
    cap: '#CFA64C',
    duvet: '#FAF6EE',
    pillow: '#FFFDF8',
    sheet: '#E8DFD2',
    scarfColor: '#B83828',
    headboardHeight: 1.4,
    drape: 'hanging',
    scarf: true,
  });

  preparePolyforkAsset(bed, {
    targetWidth: 2.0,
    groundY: true,
    centerXZ: true,
    roughness: 0.78,
    metalness: 0.04,
  });

  mattressGroup.add(bed);
  group.add(makeContactShadow(1.12, 1.24));

  return {
    group,
    mattressGroup,
    update: (dipAmount: number) => {
      mattressGroup.scale.y = 1.0 - dipAmount * 0.08;
    },
  };
}
