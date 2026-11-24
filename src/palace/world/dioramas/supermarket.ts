import * as THREE from 'three';
import { createAsset as createShelfRun } from '../../assets/polyfork/library-shelf-run-570904.mjs';
import { createAsset as createTrolley } from '../../assets/polyfork/abandoned-shopping-trolley-3de6cb.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { makeOutlinedMesh, makeRoundedBox } from '../../objects/primitives';
import { makeBrassMaterial } from '../../render/toon';
import { makeStampMesh } from '../../text/signs';

export interface SupermarketDiorama {
  group: THREE.Group;
  cart: THREE.Group;
  flipSignPivot: THREE.Group;
  shapeSign: THREE.Mesh;
  questionSign: THREE.Group;
}

/**
 * SUPERMARKET DIORAMA (Language, S28)
 * Polyfork shelf runs stocked with crisp grocery goods, Polyfork rolling shopping trolley,
 * and neutral geometric aisle markers that flip to "?" at "language".
 */
export function buildSupermarketDiorama(): SupermarketDiorama {
  const group = new THREE.Group();
  group.name = 'diorama_supermarket';

  const floor = makeOutlinedMesh(makeRoundedBox(4.2, 0.10, 4.4, 0.01), { colorKey: 'floorWood', roughness: 0.52 });
  floor.position.set(0, -0.05, 0);
  group.add(floor);

  const backWall = makeOutlinedMesh(makeRoundedBox(4.2, 2.4, 0.12, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  backWall.position.set(0, 1.2, -2.15);
  group.add(backWall);

  const ceil = makeOutlinedMesh(makeRoundedBox(4.2, 0.12, 4.4, 0.01), { colorKey: 'ceiling', roughness: 0.85 });
  ceil.position.set(0, 2.42, 0);
  group.add(ceil);

  const aisleXs = [-1.45, -0.62, 0.62, 1.45];

  for (let a = 0; a < 4; a++) {
    const ax = aisleXs[a];
    const shelf = createShelfRun({
      upright: '#E6DEC8',
      shelf: '#F5EFE2',
    });
    preparePolyforkAsset(shelf, { targetHeight: 1.45, groundY: true, centerXZ: true, roughness: 0.65 });
    shelf.rotation.y = a < 2 ? Math.PI * 0.5 : -Math.PI * 0.5;
    shelf.position.set(ax, 0, -0.2);
    group.add(shelf);

    if (a !== 2) {
      let shapeGeo: THREE.BufferGeometry;
      if (a === 0) shapeGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 20);
      else if (a === 1) shapeGeo = new THREE.ConeGeometry(0.15, 0.26, 3);
      else shapeGeo = makeRoundedBox(0.22, 0.22, 0.04, 0.012);
      const sMesh = makeOutlinedMesh(shapeGeo, { colorKey: 'leaf', roughness: 0.45 });
      if (a === 0) sMesh.rotation.x = Math.PI * 0.5;
      sMesh.position.set(ax, 1.58, -0.2);
      group.add(sMesh);
    }
  }

  // Leaf overhead market banner beam with brass hangers
  const beam = makeOutlinedMesh(makeRoundedBox(2.5, 0.14, 0.12, 0.015), { colorKey: 'leaf', roughness: 0.55 });
  beam.position.set(0, 1.88, -0.2);
  group.add(beam);

  const brassMat = makeBrassMaterial('#C9A24B');
  const flipSignPivot = new THREE.Group();
  flipSignPivot.position.set(0.62, 1.58, -0.2);
  group.add(flipSignPivot);

  const plaqueRim = new THREE.Mesh(makeRoundedBox(0.38, 0.38, 0.036, 0.014), brassMat);
  flipSignPivot.add(plaqueRim);

  const plaque = makeOutlinedMesh(makeRoundedBox(0.34, 0.34, 0.042, 0.012), { colorKey: 'creamWall', roughness: 0.6 });
  flipSignPivot.add(plaque);

  const shapeSign = makeOutlinedMesh(makeRoundedBox(0.16, 0.16, 0.05, 0.01), { colorKey: 'leaf', roughness: 0.45 });
  shapeSign.rotation.z = Math.PI * 0.25;
  shapeSign.position.z = 0.015;
  flipSignPivot.add(shapeSign);

  const questionSign = makeStampMesh('?', { size: 0.20, colorKey: 'leaf' });
  questionSign.position.z = -0.025;
  questionSign.rotation.y = Math.PI;
  flipSignPivot.add(questionSign);

  // Polyfork Shopping Trolley in center aisle
  const cart = new THREE.Group();
  cart.position.set(0, 0, 1.1);
  group.add(cart);

  const trolley = createTrolley({
    colorway: 'eco-green',
    plastic: '#4FA36B',
    steel: '#B2BBC4',
    wear: 0.15,
  });
  preparePolyforkAsset(trolley, { targetHeight: 0.88, groundY: true, centerXZ: true, roughness: 0.42, metalness: 0.35 });
  trolley.rotation.y = Math.PI; // pushed forward into aisle toward -Z
  cart.add(trolley);

  return { group, cart, flipSignPivot, shapeSign, questionSign };
}
