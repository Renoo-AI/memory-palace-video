import * as THREE from 'three';
import { createAsset as createDeskAsset } from '../../assets/polyfork/faculty-office-desk-a6575a.mjs';
import { createAsset as createGlobeAsset } from '../../assets/polyfork/classroom-globe-16a96e.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { makeOutlinedMesh, makeRoundedBox } from '../../objects/primitives';
import { makeBlockText, makeSignPlaque } from '../../text/signs';

export interface SchoolDiorama {
  group: THREE.Group;
  plusBlock: THREE.Group;
  sign: THREE.Group;
}

/**
 * SCHOOL DIORAMA (Mathematics, S26)
 * Hardwood floor, oak-framed chalkboard, Polyfork desks, classroom globe, oversized "+" & "=" blocks, "MATH" plaque.
 */
export function buildSchoolDiorama(): SchoolDiorama {
  const group = new THREE.Group();
  group.name = 'diorama_school';

  const floor = makeOutlinedMesh(makeRoundedBox(3.4, 0.10, 3.2, 0.01), { colorKey: 'floorWood', roughness: 0.52 });
  floor.position.set(0, -0.05, 0);
  group.add(floor);

  const backWall = makeOutlinedMesh(makeRoundedBox(3.4, 2.4, 0.12, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  backWall.position.set(0, 1.2, -1.55);
  group.add(backWall);

  const leftWall = makeOutlinedMesh(makeRoundedBox(0.12, 2.4, 3.2, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  leftWall.position.set(-1.65, 1.2, 0);
  group.add(leftWall);

  const rightWall = makeOutlinedMesh(makeRoundedBox(0.12, 2.4, 3.2, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  rightWall.position.set(1.65, 1.2, 0);
  group.add(rightWall);

  const ceil = makeOutlinedMesh(makeRoundedBox(3.4, 0.12, 3.2, 0.01), { colorKey: 'ceiling', roughness: 0.85 });
  ceil.position.set(0, 2.42, 0);
  group.add(ceil);

  // Chalkboard with timber frame
  const boardFrame = makeOutlinedMesh(makeRoundedBox(2.05, 1.08, 0.06, 0.015), { colorKey: 'cobalt', roughness: 0.45 });
  boardFrame.position.set(0, 1.38, -1.46);
  group.add(boardFrame);

  const board = makeOutlinedMesh(makeRoundedBox(1.88, 0.90, 0.07, 0.01), { baseHex: '#25352E', roughness: 0.9 });
  board.position.set(0, 1.38, -1.45);
  group.add(board);

  for (let i = 0; i < 4; i++) {
    const line = makeOutlinedMesh(
      makeRoundedBox(0.55 + (i % 2) * 0.35, 0.024, 0.014, 0.004),
      { colorKey: 'paperWhite', roughness: 0.85 }
    );
    line.position.set(-0.3 + (i % 2) * 0.25, 1.62 - i * 0.16, -1.40);
    group.add(line);
  }

  // 4 Polyfork desks arranged neatly
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const desk = createDeskAsset({
        timber: '#B78352',
        inlay: '#2F4FD1',
      });
      preparePolyforkAsset(desk, { targetWidth: 0.92, groundY: true, centerXZ: true, roughness: 0.55 });
      desk.position.set(-0.62 + col * 1.24, 0, -0.42 + row * 0.88);
      group.add(desk);
    }
  }

  // Classroom globe on corner shelf/desk
  const globe = createGlobeAsset();
  preparePolyforkAsset(globe, { targetHeight: 0.38, groundY: true, centerXZ: true });
  globe.position.set(1.22, 0, -1.12);
  group.add(globe);

  // Oversized "+" and "=" 3D blocks standing on front desks
  const plusBlock = makeBlockText('+', { size: 0.42, colorKey: 'cobalt' });
  plusBlock.position.set(-0.62, 0.68, -0.42);
  group.add(plusBlock);

  const eqBlock = makeBlockText('=', { size: 0.42, colorKey: 'cobalt' });
  eqBlock.position.set(0.62, 0.68, -0.42);
  group.add(eqBlock);

  const sign = makeSignPlaque('MATH', {
    width: 0.82,
    height: 0.28,
    plateColor: 'creamWall',
    textColor: 'cobalt',
    textSize: 0.14,
    strings: true,
  });
  sign.position.set(0, 2.12, -1.25);
  group.add(sign);

  return { group, plusBlock, sign };
}
