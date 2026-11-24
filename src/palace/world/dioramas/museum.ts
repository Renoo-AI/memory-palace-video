import * as THREE from 'three';
import { createAsset as createTRex } from '../../assets/polyfork/tyrannosaurus-rex-adf79f.mjs';
import { findPolyforkBone, preparePolyforkAsset } from '../../assets/polyfork';
import { makeOutlinedMesh, makeRoundedBox } from '../../objects/primitives';
import { makeBrassMaterial } from '../../render/toon';
import { makeSignPlaque } from '../../text/signs';

export interface MuseumDiorama {
  group: THREE.Group;
  dinoJaw: THREE.Object3D;
  dinoJawBone: THREE.Bone | null;
  sign: THREE.Group;
}

/**
 * MUSEUM DIORAMA (History, S27)
 * Fluted classical columns, velvet exhibition plinth holding a sculpted bone-ivory Polyfork T-Rex fossil,
 * brass-framed gallery artwork, and "HISTORY" plaque.
 */
export function buildMuseumDiorama(): MuseumDiorama {
  const group = new THREE.Group();
  group.name = 'diorama_museum';

  const brassMat = makeBrassMaterial('#C9A24B');

  const floor = makeOutlinedMesh(makeRoundedBox(3.8, 0.10, 3.2, 0.01), { colorKey: 'floorWood', roughness: 0.5 });
  floor.position.set(0, -0.05, 0);
  group.add(floor);

  const backWall = makeOutlinedMesh(makeRoundedBox(3.8, 2.4, 0.12, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  backWall.position.set(0, 1.2, -1.55);
  group.add(backWall);

  const ceil = makeOutlinedMesh(makeRoundedBox(3.8, 0.12, 3.2, 0.01), { colorKey: 'ceiling', roughness: 0.85 });
  ceil.position.set(0, 2.42, 0);
  group.add(ceil);

  // Fluted museum columns with capitals & plinths
  const colGeo = new THREE.CylinderGeometry(0.13, 0.15, 2.12, 16);
  for (const cx of [-1.45, 1.45]) {
    const col = makeOutlinedMesh(colGeo, { colorKey: 'tomato', roughness: 0.62 });
    col.position.set(cx, 1.15, -1.1);
    group.add(col);
    const cap = makeOutlinedMesh(makeRoundedBox(0.36, 0.10, 0.36, 0.015), { colorKey: 'creamWall', roughness: 0.65 });
    cap.position.set(cx, 2.24, -1.1);
    group.add(cap);
    const base = makeOutlinedMesh(makeRoundedBox(0.38, 0.12, 0.38, 0.015), { colorKey: 'creamWall', roughness: 0.65 });
    base.position.set(cx, 0.06, -1.1);
    group.add(base);
  }

  // Brass-framed minimalist gallery triptych
  const pBrass = new THREE.Mesh(makeRoundedBox(1.02, 0.78, 0.04, 0.01), brassMat);
  pBrass.position.set(-0.95, 1.45, -1.47);
  group.add(pBrass);
  const pFrame = makeOutlinedMesh(makeRoundedBox(0.94, 0.70, 0.05, 0.01), { colorKey: 'paperWhite', roughness: 0.75 });
  pFrame.position.set(-0.95, 1.45, -1.46);
  group.add(pFrame);
  const blockCols: ('tomato' | 'creamWall' | 'coal')[] = ['tomato', 'creamWall', 'coal'];
  for (let i = 0; i < 3; i++) {
    const blk = makeOutlinedMesh(makeRoundedBox(0.24, 0.52, 0.058, 0.006), { colorKey: blockCols[i], roughness: 0.65 });
    blk.position.set(-1.21 + i * 0.26, 1.45, -1.44);
    group.add(blk);
  }

  // Exhibition plinth with brass plaque strip
  const plinth = makeOutlinedMesh(makeRoundedBox(1.65, 0.30, 0.82, 0.02), { colorKey: 'tomato', roughness: 0.65 });
  plinth.position.set(0.25, 0.15, -0.35);
  group.add(plinth);
  const plinthTrim = new THREE.Mesh(makeRoundedBox(1.68, 0.03, 0.85, 0.008), brassMat);
  plinthTrim.position.set(0.25, 0.30, -0.35);
  group.add(plinthTrim);

  // Polyfork T-Rex Museum Fossil Sculpture in ivory bone tones!
  const rex = createTRex({
    coat: '#EFE7D4',
    back: '#DFD4BC',
    stripe: '#CBBFA5',
    belly: '#F7F1E3',
    crown: '#D4C8AE',
    pale: '#FAF6EB',
    claw: '#8D826E',
    mouth: '#9A8E7A',
    tongue: '#9A8E7A',
    tooth: '#FFFFFF',
    dark: '#3D372F',
    stripes: 'plain',
  });
  preparePolyforkAsset(rex, { targetHeight: 1.12, groundY: true, centerXZ: true, roughness: 0.58 });
  rex.rotation.y = Math.PI * 0.42; // turned 3/4 facing right-front camera
  rex.position.set(0.25, 0.31, -0.35);
  group.add(rex);

  const dinoJawBone = findPolyforkBone(rex, 'Jaw');
  const dinoJaw = new THREE.Group();

  const sign = makeSignPlaque('HISTORY', {
    width: 1.05,
    height: 0.30,
    plateColor: 'creamWall',
    textColor: 'tomato',
    textSize: 0.135,
    strings: true,
  });
  sign.position.set(0.25, 2.08, -1.1);
  group.add(sign);

  return { group, dinoJaw, dinoJawBone, sign };
}
