import * as THREE from 'three';
import { createAsset as createLampAsset } from '../../assets/polyfork/table-lamp-e25998.mjs';
import { createAsset as createOliveTree } from '../../assets/polyfork/potted-olive-tree-7eee05.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { PALETTE } from '../../palette';
import { buildPenguin, PenguinRig } from '../../objects/penguin';
import { makeOutlinedMesh, makePottedPlant, makeRoundedBox } from '../../objects/primitives';
import { createPalaceToonMaterial, makeBrassMaterial, makeGlassMaterial } from '../../render/toon';
import { makePaperTag, makeStampMesh } from '../../text/signs';
import { makeCeilingSlab, makeFloorPlane, makeWallSegment, WALL_HEIGHT, DOOR_WIDTH, DOOR_HEIGHT } from '../wallBuilder';

export interface EntranceRoom {
  group: THREE.Group;
  doorPivot: THREE.Group;
  doorPanel: THREE.Group;
  doorStamp: THREE.Group;
  questionTag: THREE.Group;
  checkStamp: THREE.Group;
  penguin: PenguinRig;
  consoleTable: THREE.Group;
  facadeGroup: THREE.Group;
  porchRoofGroup: THREE.Group;
  roofPanel: THREE.Mesh;
}

/**
 * ENTRANCE HALL (3.0 x 3.0 centered at (0, 0, -1.5)) + Exterior House Facade (Z=0)
 * Architectural facade with recessed glass windows, terracotta gable roof, Polyfork olive tree,
 * paneled cobalt front door with brass hardware, console credenza with table lamp & fern.
 */
export function buildEntranceRoom(): EntranceRoom {
  const group = new THREE.Group();
  group.name = 'room_entrance';

  // Exterior garden & stone walkway
  const lawn = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 14).rotateX(-Math.PI / 2),
    createPalaceToonMaterial({ baseHex: '#699B68', roughness: 0.9 })
  );
  lawn.position.set(0, -0.025, 6.2);
  lawn.receiveShadow = true;
  group.add(lawn);

  const walkway = new THREE.Mesh(
    makeRoundedBox(2.2, 0.04, 8.5, 0.01),
    createPalaceToonMaterial({ baseHex: '#D8CFC0', roughness: 0.78 })
  );
  walkway.position.set(0, -0.005, 4.4);
  walkway.receiveShadow = true;
  group.add(walkway);

  // Exterior house facade
  const facadeGroup = new THREE.Group();
  group.add(facadeGroup);

  const frontWall = makeWallSegment({
    width: 6.4,
    hasDoor: true,
    doorOffset: 0,
    wallpaper: 'none',
    withFrame: true,
  });
  frontWall.position.set(0, 0, 0);
  facadeGroup.add(frontWall);

  // Gable & terracotta pitched roof
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-3.45, 0);
  roofShape.lineTo(3.45, 0);
  roofShape.lineTo(0, 1.4);
  roofShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });

  const porchRoofGroup = new THREE.Group();
  facadeGroup.add(porchRoofGroup);

  const gable = makeOutlinedMesh(roofGeo, { colorKey: 'creamWall', roughness: 0.8 }, 0);
  gable.position.set(0, WALL_HEIGHT, -0.14);
  porchRoofGroup.add(gable);

  const slopeGeo = makeRoundedBox(3.85, 0.14, 1.3, 0.02);
  const roofMat = createPalaceToonMaterial({ colorKey: 'tomato', roughness: 0.68 });
  const leftSlope = new THREE.Mesh(slopeGeo, roofMat);
  leftSlope.position.set(-1.74, WALL_HEIGHT + 0.73, 0.14);
  leftSlope.rotation.z = 0.385;
  leftSlope.castShadow = true;
  leftSlope.receiveShadow = true;
  porchRoofGroup.add(leftSlope);

  const rightSlope = new THREE.Mesh(slopeGeo, roofMat);
  rightSlope.position.set(1.74, WALL_HEIGHT + 0.73, 0.14);
  rightSlope.rotation.z = -0.385;
  rightSlope.castShadow = true;
  rightSlope.receiveShadow = true;
  porchRoofGroup.add(rightSlope);

  // Recessed glazed windows with wood mullions & stone sills
  const mullionMat = createPalaceToonMaterial({ baseHex: '#F3ECE0', roughness: 0.5 });
  const glassMat = makeGlassMaterial('#8FC8E2', 0.46);
  const windowBackMat = createPalaceToonMaterial({ baseHex: '#314559', roughness: 0.8 });

  for (const wx of [-2.0, 2.0]) {
    const winFrame = makeOutlinedMesh(makeRoundedBox(0.96, 1.02, 0.09, 0.02), { colorKey: 'cobalt', roughness: 0.45 });
    winFrame.position.set(wx, 1.48, 0.05);
    facadeGroup.add(winFrame);

    const backing = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.8), windowBackMat);
    backing.position.set(wx, 1.48, 0.096);
    facadeGroup.add(backing);

    const winPane = new THREE.Mesh(makeRoundedBox(0.76, 0.82, 0.02, 0.005), glassMat);
    winPane.position.set(wx, 1.48, 0.105);
    facadeGroup.add(winPane);

    // Cross mullions
    const vBar = new THREE.Mesh(makeRoundedBox(0.032, 0.8, 0.03, 0.005), mullionMat);
    vBar.position.set(wx, 1.48, 0.11);
    facadeGroup.add(vBar);
    const hBar = new THREE.Mesh(makeRoundedBox(0.76, 0.032, 0.03, 0.005), mullionMat);
    hBar.position.set(wx, 1.48, 0.11);
    facadeGroup.add(hBar);

    const sill = makeOutlinedMesh(makeRoundedBox(1.12, 0.08, 0.18, 0.015), { baseHex: '#EAE0CE', roughness: 0.65 });
    sill.position.set(wx, 0.94, 0.11);
    facadeGroup.add(sill);
  }

  // Porch stone step + welcome mat
  const step = makeOutlinedMesh(makeRoundedBox(1.92, 0.10, 0.72, 0.02), { baseHex: '#E8DFCE', roughness: 0.72 });
  step.position.set(0, 0.05, 0.38);
  facadeGroup.add(step);

  const mat = makeOutlinedMesh(makeRoundedBox(1.05, 0.016, 0.52, 0.008), { baseHex: '#C69D6B', roughness: 0.92 });
  mat.position.set(0, 0.105, 0.42);
  facadeGroup.add(mat);

  // Polyfork olive tree on left of porch + fern on right of door
  const oliveTree = createOliveTree({
    pot: '#D8CFC2',
    foliage: '#76916A',
    trunk: '#6C533D',
  });
  preparePolyforkAsset(oliveTree, { targetHeight: 1.55, groundY: true, centerXZ: true, roughness: 0.75 });
  oliveTree.position.set(-1.35, 0, 0.55);
  facadeGroup.add(oliveTree);

  const plant = makePottedPlant(0.68);
  plant.position.set(1.22, 0, 0.48);
  facadeGroup.add(plant);

  // Paneled Cobalt Front Door with brushed brass knob
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-DOOR_WIDTH * 0.5 + 0.05, 0, 0.02);
  group.add(doorPivot);

  const doorPanel = new THREE.Group();
  doorPivot.add(doorPanel);

  const doorW = DOOR_WIDTH - 0.10;
  const doorH = DOOR_HEIGHT - 0.05;
  const doorMat = createPalaceToonMaterial({ colorKey: 'cobalt', roughness: 0.42 });
  const doorMesh = new THREE.Mesh(makeRoundedBox(doorW, doorH, 0.07, 0.018), doorMat);
  doorMesh.name = 'front_door';
  doorMesh.position.set(doorW * 0.5, doorH * 0.5, 0);
  doorMesh.castShadow = true;
  doorMesh.receiveShadow = true;
  doorPanel.add(doorMesh);

  // Inset architectural door panels
  const panelInsetMat = createPalaceToonMaterial({ baseHex: '#2643B8', roughness: 0.38 });
  for (const py of [0.56, 1.48]) {
    const p = new THREE.Mesh(makeRoundedBox(doorW * 0.68, 0.64, 0.082, 0.01), panelInsetMat);
    p.position.set(doorW * 0.5, py, 0);
    doorPanel.add(p);
  }

  // Brushed brass door knob & escutcheon plate
  const brassMat = makeBrassMaterial('#D4AE52');
  const escutcheon = new THREE.Mesh(makeRoundedBox(0.06, 0.18, 0.02, 0.006), brassMat);
  escutcheon.position.set(doorW - 0.14, 1.02, 0.042);
  doorPanel.add(escutcheon);

  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 16), brassMat);
  handle.position.set(doorW - 0.14, 1.02, 0.085);
  handle.castShadow = true;
  doorPanel.add(handle);

  // Tomato stamp "5 OBJECTS" on door (S01/S02)
  const doorStamp = makeStampMesh('5 OBJECTS', { size: 0.135, colorKey: 'tomato' });
  doorStamp.position.set(doorW * 0.5, 1.48, 0.048);
  doorStamp.visible = false;
  doorPanel.add(doorStamp);

  // Mustard question tag "TRY?" hanging from handle (S02)
  const questionTag = makePaperTag('TRY?', { textSize: 0.068, width: 0.28, height: 0.16 });
  questionTag.position.set(doorW - 0.14, 1.02, 0.11);
  questionTag.visible = false;
  doorPanel.add(questionTag);

  // Interior Entrance Hall (3.0 x 3.0 centered at (0, 0, -1.5))
  const floor = makeFloorPlane({ width: 3.0, depth: 3.0, pattern: 'woodPlanks' });
  floor.position.set(0, 0, -1.5);
  group.add(floor);

  const roofPanel = makeCeilingSlab(3.0, 3.0);
  roofPanel.position.set(0, WALL_HEIGHT + 0.06, -1.5);
  group.add(roofPanel);

  const sideWallOpts = {
    width: 3.0,
    wallpaper: 'wallpaperDots' as const,
    accentHex: PALETTE.cobalt,
    accentShadeHex: PALETTE.cobaltShade,
  };
  const westWall = makeWallSegment(sideWallOpts);
  westWall.rotation.y = Math.PI * 0.5;
  westWall.position.set(-1.5, 0, -1.5);
  group.add(westWall);

  const eastWall = makeWallSegment(sideWallOpts);
  eastWall.rotation.y = Math.PI * 0.5;
  eastWall.position.set(1.5, 0, -1.5);
  group.add(eastWall);

  const northWall = makeWallSegment({
    width: 3.0,
    hasDoor: true,
    doorOffset: 0,
    wallpaper: 'wallpaperDots',
    accentHex: PALETTE.cobalt,
    accentShadeHex: PALETTE.cobaltShade,
  });
  northWall.position.set(0, 0, -3.0);
  group.add(northWall);

  // Woven Cobalt runner rug with cream border
  const rugBorder = makeOutlinedMesh(makeRoundedBox(1.54, 0.014, 1.74, 0.01), { colorKey: 'creamWall', roughness: 0.92 });
  rugBorder.position.set(0, 0.007, -2.05);
  group.add(rugBorder);
  const rug = makeOutlinedMesh(makeRoundedBox(1.42, 0.018, 1.62, 0.008), { colorKey: 'cobalt', roughness: 0.9 });
  rug.position.set(0, 0.009, -2.05);
  group.add(rug);

  // Console Table on west side (shields penguin cleanly in S37!)
  const consoleTable = new THREE.Group();
  consoleTable.position.set(-0.88, 0, -1.65);
  group.add(consoleTable);

  const tTop = makeOutlinedMesh(makeRoundedBox(0.76, 0.06, 1.15, 0.015), { colorKey: 'floorWood', roughness: 0.45 });
  tTop.position.set(0, 0.86, 0);
  consoleTable.add(tTop);

  const tApron = makeOutlinedMesh(makeRoundedBox(0.66, 0.78, 1.02, 0.015), { colorKey: 'creamWall', roughness: 0.65 });
  tApron.position.set(0, 0.44, 0);
  consoleTable.add(tApron);

  const tablePlant = makePottedPlant(0.56);
  tablePlant.position.set(0, 0.89, -0.26);
  consoleTable.add(tablePlant);

  const tableLamp = createLampAsset({
    shade: '#FAF2DF',
    base: '#2F4FD1',
    brass: '#CFA84E',
  });
  preparePolyforkAsset(tableLamp, { targetHeight: 0.46, groundY: true, centerXZ: true });
  tableLamp.position.set(0.04, 0.89, 0.0);
  consoleTable.add(tableLamp);

  const tableParcel = makeOutlinedMesh(makeRoundedBox(0.46, 0.54, 0.46, 0.02), { colorKey: 'creamWall', roughness: 0.72 });
  tableParcel.position.set(0, 1.16, 0.28);
  consoleTable.add(tableParcel);

  // Brass & walnut coat hook rack on east wall
  const rackBoard = makeOutlinedMesh(makeRoundedBox(0.05, 0.14, 1.05, 0.012), { colorKey: 'floorWood', roughness: 0.5 });
  rackBoard.position.set(1.40, 1.65, -1.5);
  group.add(rackBoard);
  for (const hz of [-1.8, -1.5, -1.2]) {
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.11, 10), brassMat);
    hook.rotation.z = Math.PI * 0.5;
    hook.position.set(1.33, 1.65, hz);
    group.add(hook);
  }

  // Leaf Checkmark Stamp on north-east wall behind penguin (S38)
  const checkStamp = new THREE.Group();
  checkStamp.position.set(0.78, 1.30, -2.90);
  checkStamp.visible = false;
  group.add(checkStamp);
  const leg1 = makeOutlinedMesh(makeRoundedBox(0.18, 0.07, 0.03, 0.01), { colorKey: 'leaf', roughness: 0.4 });
  leg1.position.set(-0.08, -0.04, 0);
  leg1.rotation.z = -0.78;
  checkStamp.add(leg1);
  const leg2 = makeOutlinedMesh(makeRoundedBox(0.36, 0.07, 0.03, 0.01), { colorKey: 'leaf', roughness: 0.4 });
  leg2.position.set(0.07, 0.02, 0);
  leg2.rotation.z = 0.78;
  checkStamp.add(leg2);

  // OBJECT 1: Polyfork Penguin wearing sculpted sunglasses
  const penguin = buildPenguin();
  penguin.group.position.set(0, 0, -2.4);
  group.add(penguin.group);

  return {
    group,
    doorPivot,
    doorPanel,
    doorStamp,
    questionTag,
    checkStamp,
    penguin,
    consoleTable,
    facadeGroup,
    porchRoofGroup,
    roofPanel,
  };
}
