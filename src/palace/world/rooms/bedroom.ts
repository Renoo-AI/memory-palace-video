import * as THREE from 'three';
import { createAsset as createBookcase } from '../../assets/polyfork/alcove-bookcase-83894d.mjs';
import { createAsset as createDressingMirror } from '../../assets/polyfork/dressing-mirror-7c0871.mjs';
import { createAsset as createLamp } from '../../assets/polyfork/table-lamp-e25998.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { PALETTE } from '../../palette';
import { buildBed, BedRig } from '../../objects/bed';
import { buildElephant, ElephantRig } from '../../objects/elephant';
import { makeOutlinedMesh, makePottedPlant, makeRoundedBox } from '../../objects/primitives';
import { makeSignPlaque } from '../../text/signs';
import { makeCeilingSlab, makeFloorPlane, makeWallSegment, WALL_HEIGHT } from '../wallBuilder';

export interface BedroomRoom {
  group: THREE.Group;
  bed: BedRig;
  elephant: ElephantRig;
  roofHatchPivot: THREE.Group;
  laterPlaque: THREE.Group;
  roofPanel: THREE.Mesh;
}

/**
 * BEDROOM (4.5 x 4.5 centered at (0, 0, -9.85))
 * Polyfork king bed, Polyfork lilac Elephant jumping on mattress, bedside table + lamp,
 * alcove bookcase, dressing mirror, and hinged ceiling hatch + "LATER" plaque for S09 Lift-Out.
 */
export function buildBedroomRoom(): BedroomRoom {
  const group = new THREE.Group();
  group.name = 'room_bedroom';

  const cz = -9.85;

  const floor = makeFloorPlane({ width: 4.5, depth: 4.5, pattern: 'woodPlanks' });
  floor.position.set(0, 0, cz);
  group.add(floor);

  const roofHatchPivot = new THREE.Group();
  roofHatchPivot.position.set(-2.25, WALL_HEIGHT + 0.06, cz);
  group.add(roofHatchPivot);

  const roofPanel = makeCeilingSlab(4.5, 4.5);
  roofPanel.position.set(2.25, 0, 0);
  roofHatchPivot.add(roofPanel);

  const laterPlaque = makeSignPlaque('LATER', {
    width: 1.05,
    height: 0.34,
    plateColor: 'creamWall',
    textColor: 'tomato',
    textSize: 0.16,
  });
  laterPlaque.rotation.x = Math.PI * 0.5;
  laterPlaque.position.set(2.25, -0.09, 0.45);
  roofHatchPivot.add(laterPlaque);

  const wallOpts = {
    wallpaper: 'wallpaperStripes' as const,
    accentHex: PALETTE.tomato,
    accentShadeHex: PALETTE.tomatoShade,
  };

  const eastWall = makeWallSegment({ width: 4.5, hasDoor: true, doorOffset: -0.85, ...wallOpts });
  eastWall.rotation.y = Math.PI * 0.5;
  eastWall.position.set(2.25, 0, cz);
  group.add(eastWall);

  const westWall = makeWallSegment({ width: 4.5, ...wallOpts });
  westWall.rotation.y = Math.PI * 0.5;
  westWall.position.set(-2.25, 0, cz);
  group.add(westWall);

  const northWall = makeWallSegment({ width: 4.5, ...wallOpts });
  northWall.position.set(0, 0, cz - 2.25);
  group.add(northWall);

  const southWall = makeWallSegment({ width: 4.5, ...wallOpts });
  southWall.position.set(0, 0, cz + 2.25);
  group.add(southWall);

  // Woven terracotta rug
  const rugBorder = makeOutlinedMesh(makeRoundedBox(2.6, 0.012, 2.6, 0.01), { colorKey: 'creamWall', roughness: 0.94 });
  rugBorder.position.set(-0.75, 0.006, -10.65);
  group.add(rugBorder);
  const rug = makeOutlinedMesh(makeRoundedBox(2.4, 0.016, 2.4, 0.01), { colorKey: 'tomato', roughness: 0.92 });
  rug.position.set(-0.75, 0.008, -10.65);
  group.add(rug);

  // Polyfork Bed at (-0.85, 0, -10.85)
  const bed = buildBed();
  bed.group.position.set(-0.85, 0, -10.85);
  group.add(bed.group);

  // Bedside nightstand & lamp
  const nightstand = makeOutlinedMesh(makeRoundedBox(0.48, 0.52, 0.44, 0.02), { colorKey: 'floorWood', roughness: 0.5 });
  nightstand.position.set(0.45, 0.26, -11.65);
  group.add(nightstand);

  const lamp = createLamp({ shade: '#FAF2DF', base: '#D44634' });
  preparePolyforkAsset(lamp, { targetHeight: 0.42, groundY: true, centerXZ: true });
  lamp.position.set(0.45, 0.52, -11.65);
  group.add(lamp);

  // Alcove bookcase & dressing mirror in bedroom corners
  const bookcase = createBookcase({ carcass: '#E6D9C2', back: '#D4C3A6' });
  preparePolyforkAsset(bookcase, { targetHeight: 2.0, groundY: true, centerXZ: true });
  bookcase.position.set(1.55, 0, -11.65);
  group.add(bookcase);

  const mirror = createDressingMirror({ colorway: 'pale-oak', frameShape: 'oval' });
  preparePolyforkAsset(mirror, { targetHeight: 1.62, groundY: true, centerXZ: true });
  mirror.rotation.y = 0.55;
  mirror.position.set(-1.75, 0, -8.25);
  group.add(mirror);

  const plant = makePottedPlant(0.72);
  plant.position.set(1.72, 0, -8.05);
  group.add(plant);

  // OBJECT 5: Polyfork Elephant jumping on the king mattress
  const elephant = buildElephant();
  elephant.group.position.set(-0.85, 0.62, -10.75);
  elephant.group.rotation.y = 0.32;
  group.add(elephant.group);

  return {
    group,
    bed,
    elephant,
    roofHatchPivot,
    laterPlaque,
    roofPanel,
  };
}
