import * as THREE from 'three';
import { createAsset as createFridgeAsset } from '../assets/polyfork/fridge-freezer-fb9b5a.mjs';
import { preparePolyforkAsset } from '../assets/polyfork';
import { makeContactShadow } from './primitives';

export interface FridgeRig {
  group: THREE.Group;
  doorPivot: THREE.Group;
}

/**
 * OBJECT 3 CONTAINER: RETRO REFRIGERATOR (wide open for S06 Diamond Reveal)
 * Uses Polyfork fridge-freezer-fb9b5a.mjs with wide-open doors, powder-blue enamel cabinet,
 * bright ivory interior cavity, and a soft cool-white interior light so diamonds sparkle.
 */
export function buildFridge(): FridgeRig {
  const group = new THREE.Group();
  group.name = 'diamond_fridge';

  const fridge = createFridgeAsset({
    body: '#84BED6',
    door: '#70ACC5',
    cavity: '#FCF9F2',
    recess: '#2B363F',
    shelf: '#C5DAE4',
    swing: 'wide',
    split: 0.34,
    shelves: 3,
    lived_in: 0.25,
  });

  preparePolyforkAsset(fridge, {
    groundY: true,
    roughness: 0.32,
    metalness: 0.08,
  });
  // Slightly wider/deeper so 120 diamonds sit generously on shelves
  fridge.scale.set(1.42, 1.0, 1.24);
  group.add(fridge);

  // Subtle cool-daylight interior fridge bulb so crystals catch bright speculars inside
  const fridgeBulb = new THREE.PointLight(0xeef9ff, 2.2, 3.2, 1.6);
  fridgeBulb.position.set(0, 1.65, 0.08);
  fridgeBulb.castShadow = false;
  group.add(fridgeBulb);

  const doorPivot = new THREE.Group();
  group.add(doorPivot);

  group.add(makeContactShadow(0.55, 0.45));

  return { group, doorPivot };
}
