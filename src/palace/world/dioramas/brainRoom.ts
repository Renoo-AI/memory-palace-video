import * as THREE from 'three';
import { createAsset as createBookcase } from '../../assets/polyfork/alcove-bookcase-83894d.mjs';
import { createAsset as createDesk } from '../../assets/polyfork/faculty-office-desk-a6575a.mjs';
import { createAsset as createGlobe } from '../../assets/polyfork/classroom-globe-16a96e.mjs';
import { createAsset as createLamp } from '../../assets/polyfork/table-lamp-e25998.mjs';
import { createAsset as createMug } from '../../assets/polyfork/office-mug-8afee0.mjs';
import { createAsset as createNotebook } from '../../assets/polyfork/lab-notebook-e60f7a.mjs';
import { createAsset as createSchool } from '../../assets/polyfork/public-school-19ade5.mjs';
import { createAsset as createTubChair } from '../../assets/polyfork/velvet-tub-chair-b0b5f8.mjs';
import { createAsset as createWashHouse } from '../../assets/polyfork/timber-wash-house-c7e7d5.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { PALETTE } from '../../palette';
import { buildWalker, WalkerRig } from '../../objects/walker';
import { makeOutlinedMesh, makePottedPlant, makeRoundedBox } from '../../objects/primitives';
import { createPalaceToonMaterial, makeBrassMaterial, makeGlassMaterial } from '../../render/toon';
import { makeBlockText, makePaperTag, makeSignPlaque, makeStampMesh } from '../../text/signs';

export interface BrainRoomWorld {
  group: THREE.Group;
  walkerChair: WalkerRig;
  miniPalaceModel: THREE.Group;
  wallFrames: THREE.Group[];
  frameTextures: THREE.MeshBasicMaterial[];
  ghostZone: THREE.Group;
  ghostWalker: WalkerRig;
  dustSheet: THREE.Mesh;
  ghostSofa: THREE.Group;
  ghostDoor: THREE.Group;
  ghostPathDots: THREE.Mesh[];
  ghostBox: THREE.Mesh;
  athletesZone: THREE.Group;
  athletesSign: THREE.Group;
  tallestTowerParts: THREE.Mesh[];
  knownZone: THREE.Group;
  flagHouse: THREE.Group;
  flagSchool: THREE.Group;
  flagGame: THREE.Group;
  mapCurlPivot: THREE.Group;
  routeDots: THREE.Mesh[];
  mugZone: THREE.Group;
  mugGroup: THREE.Group;
  mugLegs: THREE.Group;
  mugGlasses: THREE.Group;
  boringTag: THREE.Group;
  zzzStamp: THREE.Group;
  klonkStamp: THREE.Group;
  bioDeskZone: THREE.Group;
  bioSlab: THREE.Group;
  dioramaWallZone: THREE.Group;
  shadowboxDoors: THREE.Group[];
}

function makeWireBox(w: number, h: number, d: number, opacity = 0.55, thickness = 0.022): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2B3648'),
    roughness: 0.5,
    transparent: opacity < 1.0,
    opacity,
  });
  const addBar = (bw: number, bh: number, bd: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
    m.position.set(x, y, z);
    g.add(m);
  };
  const hw = w * 0.5;
  const hh = h * 0.5;
  const hd = d * 0.5;
  for (const sx of [-hw, hw]) {
    for (const sz of [-hd, hd]) addBar(thickness, h, thickness, sx, 0, sz);
    for (const sy of [-hh, hh]) addBar(thickness, thickness, d, sx, sy, 0);
  }
  for (const sy of [-hh, hh]) {
    for (const sz of [-hd, hd]) addBar(w, thickness, thickness, 0, sy, sz);
  }
  return g;
}

export function buildBrainRoomWorld(): BrainRoomWorld {
  const group = new THREE.Group();
  group.name = 'brain_world';
  const brassMat = makeBrassMaterial('#C9A24B');

  // =========================================================================
  // 1. THE BRAIN ROOM (Y = 9.5 above Bedroom)
  // =========================================================================
  const brainRoom = new THREE.Group();
  brainRoom.position.set(0, 9.5, -9.85);
  group.add(brainRoom);

  const brainShape = new THREE.Shape();
  brainShape.moveTo(0, -1.8);
  brainShape.bezierCurveTo(1.8, -1.9, 2.5, -0.8, 2.2, 0.2);
  brainShape.bezierCurveTo(2.4, 1.3, 1.2, 2.0, 0, 1.8);
  brainShape.bezierCurveTo(-1.2, 2.0, -2.4, 1.3, -2.2, 0.2);
  brainShape.bezierCurveTo(-2.5, -0.8, -1.8, -1.9, 0, -1.8);
  const brainPadGeo = new THREE.ExtrudeGeometry(brainShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 20,
  });
  brainPadGeo.rotateX(Math.PI * 0.5);
  const brainPad = makeOutlinedMesh(brainPadGeo, { colorKey: 'lilac', roughness: 0.85 });
  brainPad.position.set(0, 0.05, 0.6);
  brainRoom.add(brainPad);

  const roomFloor = makeOutlinedMesh(makeRoundedBox(10, 0.12, 10, 0.01), { colorKey: 'creamWall', roughness: 0.72 });
  roomFloor.position.set(0, -0.14, 0);
  brainRoom.add(roomFloor);

  const wallMatOpts = { colorKey: 'lilac' as const, roughness: 0.82 };
  const bBackWall = makeOutlinedMesh(makeRoundedBox(10, 5.2, 0.16, 0.01), wallMatOpts);
  bBackWall.position.set(0, 2.5, -4.6);
  brainRoom.add(bBackWall);

  const bLeftWall = makeOutlinedMesh(makeRoundedBox(0.16, 5.2, 10, 0.01), wallMatOpts);
  bLeftWall.position.set(-4.8, 2.5, 0);
  brainRoom.add(bLeftWall);

  const bRightWall = makeOutlinedMesh(makeRoundedBox(0.16, 5.2, 10, 0.01), wallMatOpts);
  bRightWall.position.set(4.8, 2.5, 0);
  brainRoom.add(bRightWall);

  // Studio Loft Bookcases & Lamp
  const bBookcaseL = createBookcase({ carcass: '#E6D9C2', back: '#D0C1A6' });
  preparePolyforkAsset(bBookcaseL, { targetHeight: 2.35, groundY: true, centerXZ: true });
  bBookcaseL.position.set(-3.8, -0.08, -3.95);
  brainRoom.add(bBookcaseL);

  const bBookcaseR = createBookcase({ carcass: '#E6D9C2', back: '#D0C1A6' });
  preparePolyforkAsset(bBookcaseR, { targetHeight: 2.35, groundY: true, centerXZ: true });
  bBookcaseR.position.set(3.8, -0.08, -3.95);
  brainRoom.add(bBookcaseR);

  // Polyfork Velvet Armchair + sitting Walker facing the miniature Palace shelf
  const chair = new THREE.Group();
  chair.position.set(-1.35, 0.04, 0.45);
  chair.rotation.y = 0.35;
  brainRoom.add(chair);

  const tubChair = createTubChair({
    velvet: '#EAE2D2',
    leg: '#785434',
  });
  preparePolyforkAsset(tubChair, { targetHeight: 0.96, groundY: true, centerXZ: true });
  chair.add(tubChair);

  const walkerChair = buildWalker();
  walkerChair.group.position.set(-1.35, 0.36, 0.52);
  walkerChair.group.rotation.y = 0.35;
  brainRoom.add(walkerChair.group);

  // Side table + warm lamp beside chair
  const sideTbl = makeOutlinedMesh(new THREE.CylinderGeometry(0.28, 0.24, 0.54, 18), { colorKey: 'floorWood', roughness: 0.48 });
  sideTbl.position.set(-2.15, 0.22, 0.35);
  brainRoom.add(sideTbl);
  const bLamp = createLamp({ shade: '#FAF2DF', base: '#7B6798' });
  preparePolyforkAsset(bLamp, { targetHeight: 0.48, groundY: true, centerXZ: true });
  bLamp.position.set(-2.15, 0.49, 0.35);
  brainRoom.add(bLamp);

  // Walnut gallery pedestal holding the miniature 5-room Palace architectural model
  const shelf = makeOutlinedMesh(makeRoundedBox(2.45, 0.14, 1.85, 0.02), { colorKey: 'floorWood', roughness: 0.46 });
  shelf.position.set(0, 0.85, -1.8);
  brainRoom.add(shelf);
  const pedLeg = makeOutlinedMesh(makeRoundedBox(1.5, 0.82, 1.1, 0.02), { baseHex: '#E8E0D0', roughness: 0.65 });
  pedLeg.position.set(0, 0.41, -1.8);
  brainRoom.add(pedLeg);

  const miniPalaceModel = new THREE.Group();
  miniPalaceModel.position.set(0, 0.92, -1.8);
  brainRoom.add(miniPalaceModel);

  const miniRooms: [number, number, number, number, 'cobalt' | 'mustard' | 'sky' | 'leaf' | 'tomato'][] = [
    [-0.35, 0.55, 0.42, 0.42, 'cobalt'],
    [-0.35, 0.05, 0.64, 0.52, 'mustard'],
    [0.35, 0.05, 0.54, 0.52, 'sky'],
    [0.35, -0.52, 0.42, 0.42, 'leaf'],
    [-0.35, -0.55, 0.58, 0.55, 'tomato'],
  ];
  for (const [rx, rz, rw, rd, col] of miniRooms) {
    const rBox = makeOutlinedMesh(makeRoundedBox(rw, 0.34, rd, 0.015), { colorKey: 'creamWall', roughness: 0.65 });
    rBox.position.set(rx, 0.17, rz);
    miniPalaceModel.add(rBox);
    const accent = makeOutlinedMesh(makeRoundedBox(rw * 0.55, 0.12, rd * 0.55, 0.01), { colorKey: col, roughness: 0.45 });
    accent.position.set(rx, 0.24, rz);
    miniPalaceModel.add(accent);
  }

  // 5 Brass-framed gallery pictures hung on the Brain Room wall (live RenderTarget textures!)
  const wallFrames: THREE.Group[] = [];
  const frameTextures: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 5; i++) {
    const fGroup = new THREE.Group();
    fGroup.position.set(-2.4 + i * 1.2, 2.35, -4.45);
    brainRoom.add(fGroup);

    const fBrass = new THREE.Mesh(makeRoundedBox(1.02, 0.72, 0.045, 0.012), brassMat);
    fBrass.castShadow = true;
    fGroup.add(fBrass);

    const fMat = makeOutlinedMesh(makeRoundedBox(0.92, 0.62, 0.055, 0.01), { colorKey: 'paperWhite', roughness: 0.75 });
    fGroup.add(fMat);

    const texMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const canvasPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.52), texMat);
    canvasPlane.position.z = 0.032;
    fGroup.add(canvasPlane);

    wallFrames.push(fGroup);
    frameTextures.push(texMat);
  }

  // =========================================================================
  // 2. CHILDHOOD HOME GHOST ZONE (S11-S13) at X = 22
  // =========================================================================
  const ghostZone = new THREE.Group();
  ghostZone.position.set(22, 0, 0);
  group.add(ghostZone);

  const gTable = makeOutlinedMesh(makeRoundedBox(5.5, 0.9, 4.5, 0.02), { colorKey: 'creamWall', roughness: 0.68 });
  gTable.position.set(0, 0.45, 0);
  ghostZone.add(gTable);

  const ghostHouse = new THREE.Group();
  ghostHouse.position.set(0, 0.92, 0);
  ghostZone.add(ghostHouse);

  const outerWire = makeWireBox(3.4, 2.0, 2.8, 0.52, 0.024);
  outerWire.position.set(0, 1.0, 0);
  ghostHouse.add(outerWire);
  const innerDivider = makeWireBox(0.03, 2.0, 2.8, 0.52, 0.02);
  innerDivider.position.set(0, 1.0, 0);
  ghostHouse.add(innerDivider);

  const l4WipeWall1 = makeOutlinedMesh(makeRoundedBox(1.8, 3.6, 0.16, 0.01), { colorKey: 'creamWall', roughness: 0.8 });
  l4WipeWall1.position.set(3.2, 1.8, -0.5);
  ghostZone.add(l4WipeWall1);

  const dustSheet = makeOutlinedMesh(makeRoundedBox(3.6, 0.12, 3.0, 0.02), { colorKey: 'creamWall', roughness: 0.85 });
  dustSheet.position.set(0, 2.55, 0);
  ghostZone.add(dustSheet);

  const ghostWalker = buildWalker({ scale: 0.72 });
  ghostWalker.group.position.set(-0.9, 0.92, 0.8);
  ghostZone.add(ghostWalker.group);

  const ghostSofa = new THREE.Group();
  ghostSofa.position.set(-0.85, 1.16, -0.55);
  ghostSofa.add(makeWireBox(1.1, 0.48, 0.55, 0.85, 0.025));
  ghostSofa.visible = false;
  ghostZone.add(ghostSofa);

  const ghostDoor = new THREE.Group();
  ghostDoor.position.set(0, 1.65, 0.2);
  ghostDoor.add(makeWireBox(0.14, 1.45, 0.72, 0.85, 0.025));
  ghostDoor.visible = false;
  ghostZone.add(ghostDoor);

  const ghostPathDots: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const dot = makeOutlinedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16), { colorKey: 'cobalt', roughness: 0.4 });
    dot.position.set(-0.85 + i * 0.25, 0.94, -0.2 + Math.sin(i * 0.6) * 0.35);
    dot.visible = false;
    ghostZone.add(dot);
    ghostPathDots.push(dot);
  }

  const ghostBox = makeOutlinedMesh(makeRoundedBox(0.45, 0.42, 0.45, 0.025), { colorKey: 'cobalt', roughness: 0.4 });
  ghostBox.position.set(0.85, 2.4, -0.35);
  ghostBox.visible = false;
  ghostZone.add(ghostBox);

  // =========================================================================
  // 3. MEMORY ATHLETES HALL (S14) at X = 36
  // =========================================================================
  const athletesZone = new THREE.Group();
  athletesZone.position.set(36, 0, 0);
  group.add(athletesZone);

  const athFloor = makeOutlinedMesh(makeRoundedBox(10, 0.12, 6, 0.01), { colorKey: 'floorWood', roughness: 0.52 });
  athFloor.position.set(1.5, -0.06, 0);
  athletesZone.add(athFloor);
  const athWall = makeOutlinedMesh(makeRoundedBox(10, 3.6, 0.14, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  athWall.position.set(1.5, 1.8, -1.8);
  athletesZone.add(athWall);

  const athletesSign = makeSignPlaque('MEMORY PALACE', {
    width: 2.25,
    height: 0.42,
    plateColor: 'floorWood',
    textColor: 'coal',
    textSize: 0.145,
    strings: true,
  });
  athletesSign.position.set(0.2, 2.45, -1.1);
  athletesZone.add(athletesSign);

  const athTable = makeOutlinedMesh(makeRoundedBox(7.2, 0.85, 1.4, 0.02), { colorKey: 'creamWall', roughness: 0.65 });
  athTable.position.set(1.8, 0.425, -0.6);
  athletesZone.add(athTable);

  const tallestTowerParts: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const wx = -1.2 + i * 1.45;
    const clone = buildWalker({ bibNumber: String(i + 1), scale: 0.85 });
    clone.group.position.set(wx - 0.35, 0, 0.55);
    athletesZone.add(clone.group);

    const levels = i === 4 ? 7 : i + 2;
    for (let l = 0; l < levels; l++) {
      const cardBlk = makeOutlinedMesh(
        makeRoundedBox(0.55 - l * 0.03, 0.28, 0.42, 0.012),
        { colorKey: l % 2 === 0 ? 'paperWhite' : 'creamWall', roughness: 0.55 }
      );
      cardBlk.position.set(wx + 0.25, 0.99 + l * 0.28, -0.55);
      athletesZone.add(cardBlk);
      if (i === 4 && l >= 4) {
        cardBlk.visible = false;
        tallestTowerParts.push(cardBlk);
      }
    }
  }

  // =========================================================================
  // 4. KNOWN PLACES TABLE + ROUTE MAP (S16-S18) at X = 52
  // =========================================================================
  const knownZone = new THREE.Group();
  knownZone.position.set(52, 0, 0);
  group.add(knownZone);

  const kFloor = makeOutlinedMesh(makeRoundedBox(8, 0.12, 6, 0.01), { colorKey: 'lilac', roughness: 0.82 });
  kFloor.position.set(0, -0.06, 0);
  knownZone.add(kFloor);
  const kWall = makeOutlinedMesh(makeRoundedBox(8, 3.6, 0.14, 0.01), { colorKey: 'lilac', roughness: 0.82 });
  kWall.position.set(0, 1.8, -2.0);
  knownZone.add(kWall);

  const kTable = makeOutlinedMesh(makeRoundedBox(4.8, 0.85, 2.2, 0.02), { colorKey: 'creamWall', roughness: 0.65 });
  kTable.position.set(0, 0.425, 0);
  knownZone.add(kTable);

  // Model 1: Polyfork Timber House (-1.4, 0.85, 0)
  const mHouse = createWashHouse({ colorway: 'heritage-slate' });
  preparePolyforkAsset(mHouse, { targetWidth: 0.92, groundY: true, centerXZ: true, roughness: 0.72 });
  mHouse.position.set(-1.4, 0.85, 0);
  knownZone.add(mHouse);

  // Model 2: Polyfork Public School (0, 0.85, 0)
  const mSchool = createSchool({ colorway: 'brick-heritage' });
  preparePolyforkAsset(mSchool, { targetWidth: 1.05, groundY: true, centerXZ: true, roughness: 0.72 });
  mSchool.position.set(0, 0.85, 0);
  knownZone.add(mSchool);

  // Model 3: Miniature Fantasy Game Island & Castle Keep (+1.4, 0.85, 0)
  const mBoard = makeOutlinedMesh(makeRoundedBox(0.95, 0.09, 0.85, 0.02), { colorKey: 'leaf', roughness: 0.78 });
  mBoard.position.set(1.4, 0.895, 0);
  knownZone.add(mBoard);
  const mCastleBase = makeOutlinedMesh(makeRoundedBox(0.42, 0.34, 0.42, 0.02), { colorKey: 'mustard', roughness: 0.58 });
  mCastleBase.position.set(1.4, 1.11, 0);
  knownZone.add(mCastleBase);
  for (const [tx, tz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
    const tower = makeOutlinedMesh(new THREE.CylinderGeometry(0.065, 0.075, 0.48, 12), { colorKey: 'creamWall', roughness: 0.6 });
    tower.position.set(1.4 + tx, 1.18, tz);
    knownZone.add(tower);
    const spire = makeOutlinedMesh(new THREE.ConeGeometry(0.08, 0.16, 12), { colorKey: 'tomato', roughness: 0.55 });
    spire.position.set(1.4 + tx, 1.48, tz);
    knownZone.add(spire);
  }

  const makeModelFlag = (x: number, y: number) => {
    const fg = new THREE.Group();
    fg.position.set(x, y, 0);
    const fPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 10), brassMat);
    fPole.position.y = 0.22;
    fg.add(fPole);
    const fCloth = makeOutlinedMesh(makeRoundedBox(0.28, 0.16, 0.02, 0.005), { colorKey: 'tomato', roughness: 0.65 });
    fCloth.position.set(0.14, 0.36, 0);
    fg.add(fCloth);
    fg.visible = false;
    knownZone.add(fg);
    return fg;
  };
  const flagHouse = makeModelFlag(-1.4, 1.45);
  const flagSchool = makeModelFlag(0, 1.45);
  const flagGame = makeModelFlag(1.4, 1.56);

  const mapCurlPivot = new THREE.Group();
  mapCurlPivot.position.set(0, 0.90, -1.0);
  knownZone.add(mapCurlPivot);
  const curlSheet = makeOutlinedMesh(makeRoundedBox(4.4, 0.03, 1.9, 0.01), { colorKey: 'creamWall', roughness: 0.72 });
  curlSheet.position.set(0, 0, 1.0);
  mapCurlPivot.add(curlSheet);
  mapCurlPivot.visible = false;

  const routeDots: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const dx = -1.6 + t * 3.2;
    const dz = Math.sin(t * Math.PI * 1.5) * 0.55;
    const dot = makeOutlinedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), { colorKey: 'cobalt', roughness: 0.35 });
    dot.position.set(dx, 0.88, dz);
    dot.visible = false;
    knownZone.add(dot);
    routeDots.push(dot);
  }

  // =========================================================================
  // 5. ORDINARY-TO-RIDICULOUS MUG PLINTH (S20-S21) at X = 68
  // =========================================================================
  const mugZone = new THREE.Group();
  mugZone.position.set(68, 0, 0);
  group.add(mugZone);

  const mugFloor = makeOutlinedMesh(makeRoundedBox(6, 0.12, 6, 0.01), { colorKey: 'floorWood', roughness: 0.55 });
  mugFloor.position.set(0, -0.06, 0);
  mugZone.add(mugFloor);
  const mugWall = makeOutlinedMesh(makeRoundedBox(6, 3.6, 0.14, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  mugWall.position.set(0, 1.8, -2.0);
  mugZone.add(mugWall);
  const mugCeiling = makeOutlinedMesh(makeRoundedBox(6, 0.14, 6, 0.01), { colorKey: 'ceiling', roughness: 0.85 });
  mugCeiling.position.set(0, 3.2, 0);
  mugZone.add(mugCeiling);

  const mugPlinth = makeOutlinedMesh(makeRoundedBox(0.95, 0.85, 0.95, 0.025), { colorKey: 'creamWall', roughness: 0.55 });
  mugPlinth.position.set(0, 0.425, 0);
  mugZone.add(mugPlinth);

  const boringTag = makePaperTag('BORING', { textSize: 0.065, width: 0.36, height: 0.16 });
  boringTag.position.set(0.32, 0.85, 0.48);
  mugZone.add(boringTag);

  const zzzStamp = makeStampMesh('zzz', { size: 0.14, colorKey: 'cobalt' });
  zzzStamp.position.set(0, 0.50, 0.49);
  zzzStamp.visible = false;
  mugZone.add(zzzStamp);

  const klonkStamp = makeStampMesh('KLONK', { size: 0.22, colorKey: 'tomato' });
  klonkStamp.rotation.x = -Math.PI * 0.5;
  klonkStamp.position.set(-0.2, 0.03, 0.85);
  klonkStamp.visible = false;
  mugZone.add(klonkStamp);

  const mugGroup = new THREE.Group();
  mugGroup.position.set(0, 0.85, 0);
  mugZone.add(mugGroup);

  const ceramicMug = createMug({
    body: '#F5EFE4',
    handle: '#E5DCCD',
    interior: '#FAF8F4',
    coffee: '#57301C',
    stain: '#F5EFE4',
    occupancy: 0,
    finish: 'plain',
    fill: 0.92,
  });
  preparePolyforkAsset(ceramicMug, { targetHeight: 0.36, groundY: true, centerXZ: true, roughness: 0.28 });
  mugGroup.add(ceramicMug);

  // Articulated chunky sneaker legs (revealed in S21)
  const mugLegs = new THREE.Group();
  mugLegs.visible = false;
  mugGroup.add(mugLegs);
  for (const sx of [-0.09, 0.09]) {
    const leg = makeOutlinedMesh(new THREE.CapsuleGeometry(0.028, 0.12, 8, 12), { colorKey: 'tomato', roughness: 0.45 });
    leg.position.set(sx, -0.08, 0.01);
    mugLegs.add(leg);
    const shoe = makeOutlinedMesh(makeRoundedBox(0.075, 0.055, 0.13, 0.02), { colorKey: 'paperWhite', roughness: 0.4 });
    shoe.position.set(sx, -0.17, 0.04);
    mugLegs.add(shoe);
  }

  // Sculpted dark glasses (revealed in S21)
  const mugGlasses = new THREE.Group();
  mugGlasses.visible = false;
  mugGlasses.position.set(0, 0.21, 0.175);
  mugGroup.add(mugGlasses);
  const darkLensMat = makeGlassMaterial('#14161B', 0.92);
  for (const sx of [-0.085, 0.085]) {
    const lens = new THREE.Mesh(makeRoundedBox(0.135, 0.075, 0.028, 0.014), darkLensMat);
    lens.position.set(sx, 0, 0);
    lens.castShadow = true;
    mugGlasses.add(lens);
  }
  const bridge = new THREE.Mesh(makeRoundedBox(0.06, 0.018, 0.02, 0.005), brassMat);
  bridge.position.set(0, 0.015, 0.002);
  mugGlasses.add(bridge);

  // =========================================================================
  // 6. BIOLOGY DESK (S22) at X = 82
  // =========================================================================
  const bioDeskZone = new THREE.Group();
  bioDeskZone.position.set(82, 0, 0);
  group.add(bioDeskZone);

  const bioFloor = makeOutlinedMesh(makeRoundedBox(6, 0.12, 6, 0.01), { colorKey: 'lilac', roughness: 0.82 });
  bioFloor.position.set(0, -0.06, 0);
  bioDeskZone.add(bioFloor);
  const bioWall = makeOutlinedMesh(makeRoundedBox(6, 3.6, 0.14, 0.01), { colorKey: 'lilac', roughness: 0.82 });
  bioWall.position.set(0, 1.8, -1.8);
  bioDeskZone.add(bioWall);

  const bDesk = createDesk({
    timber: '#B78352',
    inlay: '#3C5447',
    brass: '#C9A24B',
  });
  preparePolyforkAsset(bDesk, { targetWidth: 2.05, groundY: true, centerXZ: true, roughness: 0.48 });
  bioDeskZone.add(bDesk);

  // Compute exact desktop height
  bDesk.updateMatrixWorld(true);
  const deskBox = new THREE.Box3().setFromObject(bDesk);
  const deskY = deskBox.max.y;

  const bioWalker = buildWalker({ scale: 0.9 });
  bioWalker.group.position.set(-0.65, 0, -0.78);
  bioDeskZone.add(bioWalker.group);

  const notebook = createNotebook({ cover: '#3A7D56', colorway: 'field-green' });
  preparePolyforkAsset(notebook, { targetWidth: 0.36, groundY: true, centerXZ: true });
  notebook.position.set(-0.68, deskY, 0.18);
  notebook.rotation.y = 0.25;
  bioDeskZone.add(notebook);

  const globe = createGlobe();
  preparePolyforkAsset(globe, { targetHeight: 0.42, groundY: true, centerXZ: true });
  globe.position.set(0.86, deskY, -0.22);
  bioDeskZone.add(globe);

  // Leaf biology textbook + spine
  const bioBook = makeOutlinedMesh(makeRoundedBox(0.46, 0.12, 0.58, 0.015), { colorKey: 'leaf', roughness: 0.62 });
  bioBook.position.set(-0.28, deskY + 0.06, 0.15);
  bioDeskZone.add(bioBook);
  const bioSpine = makeBlockText('BIOLOGY', { size: 0.056, colorKey: 'paperWhite' });
  bioSpine.position.set(-0.28, deskY + 0.06, 0.45);
  bioDeskZone.add(bioSpine);

  const bioSlab = new THREE.Group();
  bioSlab.position.set(0.38, deskY + 0.33, 0.04);
  bioSlab.rotation.x = -0.15;
  bioDeskZone.add(bioSlab);
  bioSlab.add(makeOutlinedMesh(makeRoundedBox(1.15, 0.62, 0.06, 0.015), { colorKey: 'creamWall', roughness: 0.6 }));
  const l1 = makeBlockText('MITOCHONDRIA', { size: 0.082, colorKey: 'coal' });
  l1.position.set(0, 0.16, 0.045);
  bioSlab.add(l1);
  const l2 = makeBlockText('PRODUCE', { size: 0.082, colorKey: 'coal' });
  l2.position.set(0, 0.0, 0.045);
  bioSlab.add(l2);
  const l3 = makeBlockText('ENERGY', { size: 0.082, colorKey: 'coal' });
  l3.position.set(0, -0.16, 0.045);
  bioSlab.add(l3);

  // =========================================================================
  // 7. WALL OF DIORAMAS SHADOWBOXES (S25) at X = 96
  // =========================================================================
  const dioramaWallZone = new THREE.Group();
  dioramaWallZone.position.set(96, 0, 0);
  group.add(dioramaWallZone);

  const dwFloor = makeOutlinedMesh(makeRoundedBox(8, 0.12, 6, 0.01), { colorKey: 'lilac', roughness: 0.82 });
  dwFloor.position.set(0, -0.06, 0);
  dioramaWallZone.add(dwFloor);
  const dwWall = makeOutlinedMesh(makeRoundedBox(8, 3.6, 0.14, 0.01), { colorKey: 'lilac', roughness: 0.82 });
  dwWall.position.set(0, 1.8, -1.6);
  dioramaWallZone.add(dwWall);

  const plantD = makePottedPlant(0.76);
  plantD.position.set(-2.65, 0, -1.15);
  dioramaWallZone.add(plantD);

  const boxColors: ('cobalt' | 'tomato' | 'leaf')[] = ['cobalt', 'tomato', 'leaf'];
  const shadowboxDoors: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const bx = -1.6 + i * 1.6;
    const frameRim = new THREE.Mesh(makeRoundedBox(1.32, 1.22, 0.34, 0.02), brassMat);
    frameRim.position.set(bx, 1.55, -1.43);
    frameRim.castShadow = true;
    dioramaWallZone.add(frameRim);

    const sb = makeOutlinedMesh(makeRoundedBox(1.24, 1.14, 0.35, 0.02), { colorKey: 'creamWall', roughness: 0.65 });
    sb.position.set(bx, 1.55, -1.42);
    dioramaWallZone.add(sb);

    const interior = makeOutlinedMesh(makeRoundedBox(1.05, 0.95, 0.08, 0.01), { colorKey: boxColors[i], roughness: 0.72 });
    interior.position.set(bx, 1.55, -1.24);
    dioramaWallZone.add(interior);

    if (i === 0) {
      const miniDesk = makeOutlinedMesh(makeRoundedBox(0.54, 0.26, 0.12, 0.01), { colorKey: 'mustard', roughness: 0.5 });
      miniDesk.position.set(bx, 1.38, -1.16);
      dioramaWallZone.add(miniDesk);
    } else if (i === 1) {
      const miniColL = makeOutlinedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 14), { colorKey: 'creamWall', roughness: 0.5 });
      miniColL.position.set(bx - 0.24, 1.50, -1.16);
      dioramaWallZone.add(miniColL);
      const miniColR = makeOutlinedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 14), { colorKey: 'creamWall', roughness: 0.5 });
      miniColR.position.set(bx + 0.24, 1.50, -1.16);
      dioramaWallZone.add(miniColR);
    } else {
      const miniShelf = makeOutlinedMesh(makeRoundedBox(0.62, 0.14, 0.12, 0.01), { colorKey: 'paperWhite', roughness: 0.5 });
      miniShelf.position.set(bx, 1.55, -1.16);
      dioramaWallZone.add(miniShelf);
    }

    const doorPivot = new THREE.Group();
    doorPivot.position.set(bx - 0.55, 1.55, -1.06);
    dioramaWallZone.add(doorPivot);
    const dMesh = makeOutlinedMesh(makeRoundedBox(1.10, 1.0, 0.05, 0.012), { colorKey: 'creamWall', roughness: 0.55 });
    dMesh.position.set(0.55, 0, 0);
    doorPivot.add(dMesh);
    shadowboxDoors.push(doorPivot);
  }

  return {
    group,
    walkerChair,
    miniPalaceModel,
    wallFrames,
    frameTextures,
    ghostZone,
    ghostWalker,
    dustSheet,
    ghostSofa,
    ghostDoor,
    ghostPathDots,
    ghostBox,
    athletesZone,
    athletesSign,
    tallestTowerParts,
    knownZone,
    flagHouse,
    flagSchool,
    flagGame,
    mapCurlPivot,
    routeDots,
    mugZone,
    mugGroup,
    mugLegs,
    mugGlasses,
    boringTag,
    zzzStamp,
    klonkStamp,
    bioDeskZone,
    bioSlab,
    dioramaWallZone,
    shadowboxDoors,
  };
}
