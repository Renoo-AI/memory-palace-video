import * as THREE from 'three';
import { createAsset as createWallClock } from '../../assets/polyfork/wall-clock-05f8ff.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { PALETTE } from '../../palette';
import { buildWalker, WalkerRig } from '../../objects/walker';
import { buildGenericHeadset, HeadsetRig } from '../../objects/headset';
import { makeOutlinedMesh, makeRoundedBox } from '../../objects/primitives';
import { createPalaceToonMaterial, makeBrassMaterial, makeChromeMaterial, makeGlassMaterial, setPalaceMaterialColor } from '../../render/toon';
import { makePaperTag, makeSignPlaque, makeStampMesh } from '../../text/signs';

export interface EvidenceAndCaveatsStage {
  group: THREE.Group;
  stamp2017: THREE.Group;
  weekRows: THREE.Mesh[];
  tinyWalker: WalkerRig;
  barBefore: THREE.Mesh;
  barAfter: THREE.Mesh;
  barHighlight: THREE.Mesh;
  page1Pivot: THREE.Group;
  page2Group: THREE.Group;
  flagTagGroup: THREE.Group;
  cameraProp: THREE.Group;
  notThisStamp: THREE.Group;
  plaquesGroup: THREE.Group;
  clockHands: THREE.Object3D[];
  headsetPlinthGroup: THREE.Group;
  headset: HeadsetRig;
  headsetStamp: THREE.Group;
  sketchCard: THREE.Group;
}

/**
 * CHAPTER 6 STAGE (S30 - S35):
 * - Calendar ("STUDY", "2017", 6 week rows + tiny Walker + bar chart -> page curl to 16 empty rows + "4 MONTHS LATER")
 * - Sculpted Leica-style rangefinder camera on plinth + "NOT THIS"
 * - 3 Paneled Cobalt doors ("UNDERSTAND", "ASSOCIATE", "REVISIT") with open book, brass chain & Polyfork Wall Clock
 * - Sleek VR Headset + "FUZZY IS FINE" architectural sketch
 */
export function buildEvidenceStage(): EvidenceAndCaveatsStage {
  const group = new THREE.Group();
  group.name = 'chapter6_evidence_stage';
  const brassMat = makeBrassMaterial('#C9A24B');
  const chromeMat = makeChromeMaterial('#D0D7DE');

  const floor = makeOutlinedMesh(makeRoundedBox(14, 0.10, 6, 0.01), { colorKey: 'floorWood', roughness: 0.52 });
  floor.position.set(2.5, -0.05, 0);
  group.add(floor);

  const wall = makeOutlinedMesh(makeRoundedBox(14, 3.4, 0.14, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  wall.position.set(2.5, 1.7, -1.2);
  group.add(wall);

  // Page 2 (underneath Page 1)
  const page2Group = new THREE.Group();
  page2Group.position.set(0, 0, -1.08);
  group.add(page2Group);

  const p2Board = makeOutlinedMesh(makeRoundedBox(4.2, 2.3, 0.05, 0.02), { colorKey: 'paperWhite', roughness: 0.72 });
  p2Board.position.set(0.8, 1.5, 0);
  page2Group.add(p2Board);

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const rowBlk = makeOutlinedMesh(makeRoundedBox(0.75, 0.34, 0.04, 0.01), { colorKey: 'creamWall', roughness: 0.7 });
      rowBlk.position.set(-0.6 + c * 0.92, 2.15 - r * 0.44, 0.04);
      page2Group.add(rowBlk);
    }
  }

  const flagTagGroup = new THREE.Group();
  flagTagGroup.position.set(2.35, 0.85, 0.12);
  page2Group.add(flagTagGroup);

  const fPole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.65, 12), brassMat);
  fPole.position.y = 0.32;
  flagTagGroup.add(fPole);

  const fCloth = makeOutlinedMesh(makeRoundedBox(0.55, 0.34, 0.03, 0.01), { colorKey: 'leaf', roughness: 0.6 });
  fCloth.position.set(0.28, 0.48, 0);
  flagTagGroup.add(fCloth);

  const fourMonthsTag = makePaperTag('4 MONTHS LATER', { textSize: 0.05, width: 0.68, height: 0.18 });
  fourMonthsTag.position.set(0.28, 0.28, 0.03);
  flagTagGroup.add(fourMonthsTag);

  // Page 1 (hinged at top)
  const page1Pivot = new THREE.Group();
  page1Pivot.position.set(0, 2.65, -0.96);
  group.add(page1Pivot);

  const p1Board = makeOutlinedMesh(makeRoundedBox(3.4, 2.3, 0.05, 0.02), { colorKey: 'creamWall', roughness: 0.72 });
  p1Board.position.set(0, -1.15, 0);
  page1Pivot.add(p1Board);

  const studyCard = makeSignPlaque('STUDY', {
    width: 0.85,
    height: 0.32,
    plateColor: 'paperWhite',
    textColor: 'coal',
    textSize: 0.13,
  });
  studyCard.position.set(-1.05, -0.35, 0.05);
  page1Pivot.add(studyCard);

  const stamp2017 = makeStampMesh('2017', { size: 0.22, colorKey: 'tomato' });
  stamp2017.position.set(-1.05, -0.78, 0.05);
  stamp2017.visible = false;
  page1Pivot.add(stamp2017);

  const weekRows: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const rMat = createPalaceToonMaterial({ colorKey: 'creamWall', roughness: 0.6 });
    const row = new THREE.Mesh(makeRoundedBox(1.5, 0.18, 0.05, 0.012), rMat);
    row.position.set(0.18, -0.35 - i * 0.28, 0.05);
    row.castShadow = true;
    row.receiveShadow = true;
    page1Pivot.add(row);
    weekRows.push(row);
  }

  const tinyWalker = buildWalker({ scale: 0.16 });
  tinyWalker.group.position.set(-0.45, -0.25, 0.12);
  page1Pivot.add(tinyWalker.group);

  const barBefore = makeOutlinedMesh(makeRoundedBox(0.24, 0.42, 0.16, 0.012), { colorKey: 'leaf', roughness: 0.48 });
  barBefore.position.set(1.22, -1.85, 0.12);
  page1Pivot.add(barBefore);

  const barAfter = makeOutlinedMesh(makeRoundedBox(0.24, 0.42, 0.16, 0.012), { colorKey: 'leaf', roughness: 0.48 });
  barAfter.position.set(1.56, -1.85, 0.12);
  page1Pivot.add(barAfter);

  const barHighlight = makeOutlinedMesh(makeRoundedBox(0.26, 0.14, 0.18, 0.008), { colorKey: 'paperWhite', roughness: 0.3 });
  barHighlight.position.set(1.56, -1.35, 0.14);
  barHighlight.visible = false;
  page1Pivot.add(barHighlight);

  // S33: Sculpted Rangefinder Camera on plinth (X = 4.8)
  const cameraProp = new THREE.Group();
  cameraProp.position.set(4.8, 0, 0);
  group.add(cameraProp);

  const camPlinth = makeOutlinedMesh(makeRoundedBox(0.85, 0.90, 0.75, 0.025), { colorKey: 'creamWall', roughness: 0.58 });
  camPlinth.position.y = 0.45;
  cameraProp.add(camPlinth);

  const leatherMat = createPalaceToonMaterial({ baseHex: '#25262B', roughness: 0.85 });
  const camBody = new THREE.Mesh(makeRoundedBox(0.56, 0.26, 0.24, 0.02), leatherMat);
  camBody.position.set(0, 1.04, 0);
  camBody.castShadow = true;
  cameraProp.add(camBody);

  const camTopPlate = new THREE.Mesh(makeRoundedBox(0.56, 0.10, 0.24, 0.018), chromeMat);
  camTopPlate.position.set(0, 1.20, 0);
  camTopPlate.castShadow = true;
  cameraProp.add(camTopPlate);

  const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.15, 24).rotateX(Math.PI * 0.5), chromeMat);
  lensBarrel.position.set(0, 1.06, 0.16);
  lensBarrel.castShadow = true;
  cameraProp.add(lensBarrel);

  const lensGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.02, 24).rotateX(Math.PI * 0.5),
    makeGlassMaterial('#1E324A', 0.9)
  );
  lensGlass.position.set(0, 1.06, 0.235);
  cameraProp.add(lensGlass);

  const viewfinder = new THREE.Mesh(makeRoundedBox(0.09, 0.06, 0.04, 0.008), makeGlassMaterial('#8AC0E0', 0.75));
  viewfinder.position.set(-0.17, 1.20, 0.11);
  cameraProp.add(viewfinder);

  const camShutter = makeOutlinedMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.055, 16), { colorKey: 'tomato', roughness: 0.35 });
  camShutter.position.set(0.18, 1.27, 0);
  cameraProp.add(camShutter);

  const notThisStamp = makeStampMesh('NOT THIS', {
    size: 0.11,
    colorKey: 'tomato',
    withCircleCross: true,
    radius: 0.34,
  });
  notThisStamp.position.set(0, 1.12, 0.32);
  notThisStamp.visible = false;
  cameraProp.add(notThisStamp);

  // S34: Three Door Plaques along hallway (X = 6.8 .. 10.6)
  const plaquesGroup = new THREE.Group();
  plaquesGroup.position.set(6.8, 0, 0);
  group.add(plaquesGroup);

  const hallWall = makeOutlinedMesh(makeRoundedBox(6.8, 3.2, 0.14, 0.01), { colorKey: 'creamWall', roughness: 0.82 });
  hallWall.position.set(2.4, 1.6, -1.2);
  plaquesGroup.add(hallWall);

  const hallFloor = makeOutlinedMesh(makeRoundedBox(6.8, 0.10, 5.0, 0.01), { colorKey: 'floorWood', roughness: 0.52 });
  hallFloor.position.set(2.4, -0.05, 0);
  plaquesGroup.add(hallFloor);

  const plaqueLabels = ['UNDERSTAND', 'ASSOCIATE', 'REVISIT'];
  const clockHands: THREE.Object3D[] = [];

  for (let i = 0; i < 3; i++) {
    const px = i * 1.9;
    const doorBg = makeOutlinedMesh(makeRoundedBox(1.15, 2.2, 0.08, 0.015), { colorKey: 'cobalt', roughness: 0.45 });
    doorBg.position.set(px, 1.1, -1.1);
    plaquesGroup.add(doorBg);

    const plaque = makeSignPlaque(plaqueLabels[i], {
      width: 1.02,
      height: 0.26,
      plateColor: 'creamWall',
      textColor: 'coal',
      textSize: 0.092,
    });
    plaque.position.set(px, 1.85, -1.03);
    plaquesGroup.add(plaque);

    if (i === 0) {
      const pL = makeOutlinedMesh(makeRoundedBox(0.24, 0.32, 0.04, 0.008), { colorKey: 'leaf', roughness: 0.6 });
      pL.position.set(px - 0.11, 1.32, -1.0);
      pL.rotation.y = 0.25;
      plaquesGroup.add(pL);
      const pR = makeOutlinedMesh(makeRoundedBox(0.24, 0.32, 0.04, 0.008), { colorKey: 'paperWhite', roughness: 0.72 });
      pR.position.set(px + 0.11, 1.32, -1.0);
      pR.rotation.y = -0.25;
      plaquesGroup.add(pR);
    } else if (i === 1) {
      for (let c = 0; c < 4; c++) {
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 10, 16), brassMat);
        link.position.set(px - 0.14 + c * 0.09, 1.34, -1.0);
        link.rotation.y = c % 2 === 0 ? 0 : Math.PI * 0.5;
        plaquesGroup.add(link);
      }
      const slab = makeOutlinedMesh(makeRoundedBox(0.16, 0.20, 0.04, 0.008), { colorKey: 'creamWall', roughness: 0.55 });
      slab.position.set(px - 0.26, 1.34, -1.0);
      plaquesGroup.add(slab);
      const miniGlass = new THREE.Mesh(makeRoundedBox(0.20, 0.08, 0.03, 0.01), makeGlassMaterial('#151820', 0.92));
      miniGlass.position.set(px + 0.26, 1.34, -1.0);
      plaquesGroup.add(miniGlass);
    } else {
      const clock = createWallClock({ colorway: 'brass-cream' });
      preparePolyforkAsset(clock, { scale: 1.55, roughness: 0.45 });
      // wall-clock native origin is at floor with face centered around y = 2.06 -> offset down cleanly
      clock.position.set(px, 1.34 - 2.06 * 1.55, -1.01);
      plaquesGroup.add(clock);
      const minuteHand = clock.getObjectByName('hand-minute') ?? clock.getObjectByName('hand-hour');
      if (minuteHand) clockHands.push(minuteHand);
    }
  }

  // S35: VR Headset on plinth + "FUZZY IS FINE" sketch card (X = 12.6)
  const headsetPlinthGroup = new THREE.Group();
  headsetPlinthGroup.position.set(12.6, 0, 0);
  group.add(headsetPlinthGroup);

  const plinth = makeOutlinedMesh(makeRoundedBox(0.95, 0.90, 0.75, 0.025), { colorKey: 'creamWall', roughness: 0.58 });
  plinth.position.y = 0.45;
  headsetPlinthGroup.add(plinth);

  const headset = buildGenericHeadset();
  headset.group.position.set(0, 0.90, 0);
  headsetPlinthGroup.add(headset.group);

  const headsetStamp = makeStampMesh('', { colorKey: 'tomato', withCircleCross: true, radius: 0.26 });
  headsetStamp.position.set(0, 0.68, 0.39);
  headsetStamp.visible = false;
  headsetPlinthGroup.add(headsetStamp);

  const sketchCard = new THREE.Group();
  sketchCard.position.set(0.88, 1.05, -0.1);
  headsetPlinthGroup.add(sketchCard);

  const paper = makeOutlinedMesh(makeRoundedBox(0.56, 0.48, 0.02, 0.008), { colorKey: 'creamWall', roughness: 0.72 });
  sketchCard.add(paper);

  const lineMat = createPalaceToonMaterial({ colorKey: 'coal', roughness: 0.75 });
  const hBox = new THREE.Mesh(makeRoundedBox(0.24, 0.16, 0.03, 0.004), lineMat);
  hBox.position.set(0, -0.02, 0.015);
  sketchCard.add(hBox);
  const hRoof = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.14, 4), lineMat);
  hRoof.rotation.y = Math.PI * 0.25;
  hRoof.position.set(0, 0.12, 0.015);
  sketchCard.add(hRoof);

  const fuzzyTag = makePaperTag('FUZZY IS FINE', { textSize: 0.044, width: 0.52, height: 0.15 });
  fuzzyTag.position.set(0, -0.12, 0.04);
  sketchCard.add(fuzzyTag);

  return {
    group,
    stamp2017,
    weekRows,
    tinyWalker,
    barBefore,
    barAfter,
    barHighlight,
    page1Pivot,
    page2Group,
    flagTagGroup,
    cameraProp,
    notThisStamp,
    plaquesGroup,
    clockHands,
    headsetPlinthGroup,
    headset,
    headsetStamp,
    sketchCard,
  };
}

export function setCalendarRowLit(row: THREE.Mesh, lit: boolean) {
  const mat = row.material as THREE.MeshStandardMaterial;
  if (lit) {
    setPalaceMaterialColor(mat, PALETTE.leaf);
  } else {
    setPalaceMaterialColor(mat, PALETTE.creamWall);
  }
}
