import * as THREE from 'three';
import { createPalaceToonMaterial, makeChromeMaterial } from '../render/toon';
import { makeRoundedBox } from './primitives';

/**
 * Multi-part sculpted ergonomic toothbrush: coral-tomato body, rubber grip, chrome collar, tapered bristle tufts.
 */
export function buildToothbrush(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'toothbrush';

  const handleMat = createPalaceToonMaterial({
    colorKey: 'tomato',
    roughness: 0.32,
    metalness: 0.04,
  });
  const gripMat = createPalaceToonMaterial({
    colorKey: 'paperWhite',
    roughness: 0.65,
  });
  const collarMat = makeChromeMaterial('#D8DEE4');
  const bristleMat = createPalaceToonMaterial({
    colorKey: 'paperWhite',
    roughness: 0.85,
  });

  // Lower tapered handle
  const handle = new THREE.Mesh(makeRoundedBox(0.036, 0.25, 0.024, 0.01), handleMat);
  handle.position.y = 0.125;
  handle.castShadow = true;
  g.add(handle);

  // Soft white thumb grip inlay
  const grip = new THREE.Mesh(makeRoundedBox(0.024, 0.11, 0.027, 0.008), gripMat);
  grip.position.y = 0.14;
  g.add(grip);

  // Chrome collar ring
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.022, 12), collarMat);
  collar.position.y = 0.26;
  g.add(collar);

  // Slender neck
  const neck = new THREE.Mesh(makeRoundedBox(0.024, 0.11, 0.018, 0.006), handleMat);
  neck.position.set(0, 0.32, 0.006);
  neck.rotation.x = 0.08;
  neck.castShadow = true;
  g.add(neck);

  // Head plate
  const headPlate = new THREE.Mesh(makeRoundedBox(0.034, 0.085, 0.016, 0.007), handleMat);
  headPlate.position.set(0, 0.39, 0.012);
  headPlate.castShadow = true;
  g.add(headPlate);

  // 3 sculpted rows of bristle tufts
  for (let row = 0; row < 3; row++) {
    const tuft = new THREE.Mesh(makeRoundedBox(0.026, 0.022, 0.042, 0.004), bristleMat);
    tuft.position.set(0, 0.365 + row * 0.025, 0.036);
    tuft.castShadow = true;
    g.add(tuft);
  }

  return g;
}
