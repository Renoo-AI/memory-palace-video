import * as THREE from 'three';
import { createAsset as createBookcase } from '../../assets/polyfork/alcove-bookcase-83894d.mjs';
import { createAsset as createCoffeeTable } from '../../assets/polyfork/coffee-table-acc698.mjs';
import { createAsset as createLamp } from '../../assets/polyfork/table-lamp-e25998.mjs';
import { createAsset as createTubChair } from '../../assets/polyfork/velvet-tub-chair-b0b5f8.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { PALETTE } from '../../palette';
import { buildGiantBanana, BananaRig } from '../../objects/banana';
import { buildSofa, SofaRig } from '../../objects/sofa';
import { makeOutlinedMesh, makePottedPlant, makeRoundedBox } from '../../objects/primitives';
import { makeBrassMaterial } from '../../render/toon';
import { makeCeilingSlab, makeCorridor, makeFloorPlane, makeWallSegment, WALL_HEIGHT } from '../wallBuilder';

export interface LivingRoom {
  group: THREE.Group;
  sofa: SofaRig;
  banana: BananaRig;
  roofPanel: THREE.Mesh;
}

/**
 * LIVING ROOM (5.0 x 4.5 centered at (0, 0, -5.25))
 * Furnished with Polyfork sofa, Giant Banana, coffee table, velvet armchair, alcove bookcase, fern & framed art.
 */
export function buildLivingRoom(): LivingRoom {
  const group = new THREE.Group();
  group.name = 'room_living';

  const floor = makeFloorPlane({ width: 5.0, depth: 4.5, pattern: 'woodPlanks' });
  floor.position.set(0, 0, -5.25);
  group.add(floor);

  const roofPanel = makeCeilingSlab(5.0, 4.5);
  roofPanel.position.set(0, WALL_HEIGHT + 0.06, -5.25);
  group.add(roofPanel);

  const wallOpts = {
    wallpaper: 'wallpaperStripes' as const,
    accentHex: PALETTE.mustard,
    accentShadeHex: PALETTE.mustardShade,
  };

  const westWall = makeWallSegment({ width: 4.5, ...wallOpts });
  westWall.rotation.y = Math.PI * 0.5;
  westWall.position.set(-2.5, 0, -5.25);
  group.add(westWall);

  const northWall = makeWallSegment({ width: 5.0, ...wallOpts });
  northWall.position.set(0, 0, -7.5);
  group.add(northWall);

  const eastWall = makeWallSegment({ width: 4.5, hasDoor: true, doorOffset: 0, ...wallOpts });
  eastWall.rotation.y = Math.PI * 0.5;
  eastWall.position.set(2.5, 0, -5.25);
  group.add(eastWall);

  for (const sx of [-2.0, 2.0]) {
    const flank = makeWallSegment({ width: 1.0, ...wallOpts });
    flank.position.set(sx, 0, -3.0);
    group.add(flank);
  }

  const corridor = makeCorridor(0.5, 1.5, true);
  corridor.position.set(2.75, 0, -5.25);
  group.add(corridor);

  // Woven mustard & cream area rug under sofa
  const rugBorder = makeOutlinedMesh(makeRoundedBox(2.9, 0.012, 2.1, 0.01), { colorKey: 'creamWall', roughness: 0.94 });
  rugBorder.position.set(-1.1, 0.006, -6.22);
  group.add(rugBorder);
  const rug = makeOutlinedMesh(makeRoundedBox(2.65, 0.016, 1.85, 0.01), { colorKey: 'mustard', roughness: 0.92 });
  rug.position.set(-1.1, 0.008, -6.22);
  group.add(rug);

  // Polyfork Sofa + Giant Banana
  const sofa = buildSofa();
  sofa.group.position.set(-1.15, 0, -6.55);
  sofa.group.rotation.y = 0.25;
  group.add(sofa.group);

  const banana = buildGiantBanana();
  banana.group.position.set(-1.15, 0.44, -6.48);
  banana.group.rotation.y = 0.25;
  group.add(banana.group);

  // Polyfork Coffee Table offset cleanly to right-front so it frames S05 without clipping the camera arc
  const coffeeTable = createCoffeeTable({
    top: '#C79B68',
    frame: '#3B3632',
  });
  preparePolyforkAsset(coffeeTable, { targetWidth: 0.95, groundY: true, centerXZ: true, roughness: 0.48 });
  coffeeTable.position.set(0.95, 0, -6.25);
  coffeeTable.rotation.y = 0.15;
  group.add(coffeeTable);

  const coffeeLamp = createLamp({ shade: '#FAF2DF', base: '#D9A02B' });
  preparePolyforkAsset(coffeeLamp, { targetHeight: 0.42, groundY: true, centerXZ: true });
  coffeeLamp.position.set(0.98, 0.44, -6.28);
  group.add(coffeeLamp);

  // Polyfork Bookcase against east-north corner
  const bookcase = createBookcase({
    carcass: '#E6D9C2',
    back: '#D4C3A6',
  });
  preparePolyforkAsset(bookcase, { targetHeight: 2.05, groundY: true, centerXZ: true, roughness: 0.65 });
  bookcase.position.set(1.85, 0, -7.05);
  group.add(bookcase);

  // Velvet reading chair in south-west corner
  const chair = createTubChair({
    velvet: '#3F6E57',
    leg: '#785434',
  });
  preparePolyforkAsset(chair, { targetHeight: 0.82, groundY: true, centerXZ: true, roughness: 0.85 });
  chair.position.set(-1.95, 0, -3.75);
  chair.rotation.y = 0.72;
  group.add(chair);

  // Potted fern beside doorway
  const fern = makePottedPlant(0.75);
  fern.position.set(1.98, 0, -3.55);
  group.add(fern);

  // Framed Mustard abstract geometric painting with brass bezel on north wall
  const brassMat = makeBrassMaterial('#C9A24B');
  const artBrass = new THREE.Mesh(makeRoundedBox(1.04, 0.74, 0.04, 0.01), brassMat);
  artBrass.position.set(0.55, 1.68, -7.41);
  artBrass.castShadow = true;
  group.add(artBrass);

  const artCanvas = makeOutlinedMesh(makeRoundedBox(0.94, 0.64, 0.048, 0.008), { colorKey: 'paperWhite', roughness: 0.78 });
  artCanvas.position.set(0.55, 1.68, -7.405);
  group.add(artCanvas);

  const artSun = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.056, 24),
    makeOutlinedMesh(new THREE.BoxGeometry(1, 1, 1), { colorKey: 'mustard', roughness: 0.55 }).material
  );
  artSun.rotation.x = Math.PI * 0.5;
  artSun.position.set(0.55, 1.68, -7.40);
  group.add(artSun);

  return { group, sofa, banana, roofPanel };
}
