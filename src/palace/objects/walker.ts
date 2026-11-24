import * as THREE from 'three';
import { PALETTE } from '../palette';
import { createPalaceToonMaterial, makeBrassMaterial } from '../render/toon';
import { makeContactShadow, makeRoundedBox } from './primitives';
import { makeStampMesh } from '../text/signs';

export interface WalkerRig {
  group: THREE.Group;
  headLidPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftFoot: THREE.Mesh;
  rightFoot: THREE.Mesh;
  miniStage: THREE.Group;
  update: (opts: {
    walkPhase?: number;
    lidOpen?: number;
    sitting?: boolean;
    boilAngle?: number;
  }) => void;
}

/**
 * THE WALKER (viewer's stand-in):
 * Studio-crafted matte-lilac porcelain & walnut artist mannequin with woven cobalt scarf,
 * brass joints, and machined brass-hinged dome head revealing the miniature palace diorama (S15).
 */
export function buildWalker(opts: { bibNumber?: string; scale?: number } = {}): WalkerRig {
  const group = new THREE.Group();
  group.name = 'walker_root';
  if (opts.scale) group.scale.setScalar(opts.scale);

  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  const porcelainMat = createPalaceToonMaterial({
    colorKey: 'lilac',
    roughness: 0.45,
    metalness: 0.04,
  });
  const shoeMat = createPalaceToonMaterial({
    baseHex: '#35313E',
    roughness: 0.52,
  });
  const scarfMat = createPalaceToonMaterial({
    colorKey: 'cobalt',
    roughness: 0.85,
  });
  const brassMat = makeBrassMaterial();

  // Articulated legs + sculpted shoes
  const footGeo = makeRoundedBox(0.14, 0.1, 0.25, 0.032);
  const leftFoot = new THREE.Mesh(footGeo, shoeMat);
  leftFoot.position.set(-0.13, 0.05, 0.04);
  leftFoot.castShadow = true;
  leftFoot.receiveShadow = true;
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, shoeMat);
  rightFoot.position.set(0.13, 0.05, 0.04);
  rightFoot.castShadow = true;
  rightFoot.receiveShadow = true;
  group.add(rightFoot);

  // Pelvis & tapered lathe torso
  const torsoPts = [
    new THREE.Vector2(0.01, 0.0),
    new THREE.Vector2(0.19, 0.06),
    new THREE.Vector2(0.22, 0.35),
    new THREE.Vector2(0.24, 0.64),
    new THREE.Vector2(0.17, 0.82),
    new THREE.Vector2(0.09, 0.88),
  ];
  const torsoGeo = new THREE.LatheGeometry(torsoPts, 24);
  const torso = new THREE.Mesh(torsoGeo, porcelainMat);
  torso.position.set(0, 0.30, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // Brass waist band
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.016, 10, 24), brassMat);
  belt.rotation.x = Math.PI * 0.5;
  belt.position.set(0, 0.56, 0);
  bodyGroup.add(belt);

  // Optional numbered Tomato bib (S14 athlete clones)
  if (opts.bibNumber) {
    const bib = new THREE.Mesh(
      makeRoundedBox(0.29, 0.26, 0.035, 0.012),
      createPalaceToonMaterial({ colorKey: 'tomato', roughness: 0.65 })
    );
    bib.position.set(0, 0.82, 0.235);
    bib.castShadow = true;
    bodyGroup.add(bib);

    const num = makeStampMesh(opts.bibNumber, { size: 0.135, colorKey: 'cobalt' });
    num.position.set(0, 0.82, 0.258);
    bodyGroup.add(num);
  }

  // Woven Cobalt scarf
  const scarfRingGeo = new THREE.TorusGeometry(0.19, 0.052, 12, 24);
  scarfRingGeo.rotateX(Math.PI * 0.5);
  const scarfRing = new THREE.Mesh(scarfRingGeo, scarfMat);
  scarfRing.position.set(0, 1.18, 0);
  scarfRing.castShadow = true;
  bodyGroup.add(scarfRing);

  const scarfTail = new THREE.Mesh(makeRoundedBox(0.11, 0.30, 0.036, 0.014), scarfMat);
  scarfTail.position.set(0.14, 1.02, 0.18);
  scarfTail.rotation.z = -0.18;
  scarfTail.castShadow = true;
  bodyGroup.add(scarfTail);

  // Head lower bowl + brass collar rim
  const headBase = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.17, 0.26, 24), porcelainMat);
  headBase.position.set(0, 1.36, 0);
  headBase.castShadow = true;
  headBase.receiveShadow = true;
  bodyGroup.add(headBase);

  const brassRim = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.012, 10, 28), brassMat);
  brassRim.rotation.x = Math.PI * 0.5;
  brassRim.position.set(0, 1.49, 0);
  bodyGroup.add(brassRim);

  // Miniature palace diorama hidden inside open head (S15)
  const miniStage = new THREE.Group();
  miniStage.position.set(0, 1.48, 0);
  miniStage.visible = false;
  bodyGroup.add(miniStage);

  const stageFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.025, 20),
    createPalaceToonMaterial({ colorKey: 'creamWall', roughness: 0.55 })
  );
  miniStage.add(stageFloor);

  const tinyHouse = new THREE.Mesh(
    makeRoundedBox(0.11, 0.08, 0.10, 0.01),
    createPalaceToonMaterial({ colorKey: 'cobalt', roughness: 0.45 })
  );
  tinyHouse.position.set(-0.06, 0.05, -0.04);
  miniStage.add(tinyHouse);

  const tinyRoof = new THREE.Mesh(
    new THREE.ConeGeometry(0.085, 0.06, 4),
    createPalaceToonMaterial({ colorKey: 'tomato', roughness: 0.5 })
  );
  tinyRoof.rotation.y = Math.PI * 0.25;
  tinyRoof.position.set(-0.06, 0.12, -0.04);
  miniStage.add(tinyRoof);

  const tinyCtrl = new THREE.Mesh(
    makeRoundedBox(0.12, 0.03, 0.07, 0.01),
    createPalaceToonMaterial({ colorKey: 'tomato', roughness: 0.4 })
  );
  tinyCtrl.position.set(0.06, 0.035, 0.06);
  miniStage.add(tinyCtrl);

  const ctrlBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10),
    makeBrassMaterial()
  );
  ctrlBtn.position.set(0.08, 0.055, 0.06);
  miniStage.add(ctrlBtn);

  // Hinged dome lid with brass hinge
  const headLidPivot = new THREE.Group();
  headLidPivot.position.set(0, 1.49, -0.20);
  bodyGroup.add(headLidPivot);

  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.09, 10), brassMat);
  hinge.rotation.z = Math.PI * 0.5;
  headLidPivot.add(hinge);

  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    porcelainMat
  );
  lid.position.set(0, 0, 0.20);
  lid.castShadow = true;
  headLidPivot.add(lid);

  // Articulated arms with brass shoulder spheres
  const shoulderGeo = new THREE.SphereGeometry(0.065, 14, 14);
  const armGeo = new THREE.CapsuleGeometry(0.058, 0.26, 8, 12);
  armGeo.translate(0, -0.18, 0);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.27, 1.07, 0);
  leftArmPivot.add(new THREE.Mesh(shoulderGeo, brassMat));
  const lArm = new THREE.Mesh(armGeo, porcelainMat);
  lArm.castShadow = true;
  leftArmPivot.add(lArm);
  bodyGroup.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.27, 1.07, 0);
  rightArmPivot.add(new THREE.Mesh(shoulderGeo, brassMat));
  const rArm = new THREE.Mesh(armGeo, porcelainMat);
  rArm.castShadow = true;
  rightArmPivot.add(rArm);
  bodyGroup.add(rightArmPivot);

  group.add(makeContactShadow(0.26, 0.24, PALETTE.lilacShade));

  const update: WalkerRig['update'] = ({ walkPhase = 0, lidOpen = 0, sitting = false, boilAngle = 0 }) => {
    bodyGroup.rotation.y = boilAngle * 0.5;
    if (sitting) {
      bodyGroup.position.y = -0.18;
      leftFoot.position.set(-0.13, 0.18, 0.34);
      rightFoot.position.set(0.13, 0.18, 0.34);
      leftArmPivot.rotation.x = -0.55;
      rightArmPivot.rotation.x = -0.55;
    } else {
      const stride = Math.sin(walkPhase);
      bodyGroup.position.y = Math.abs(stride) * 0.04;
      leftFoot.position.set(-0.13, 0.05 + Math.max(0, stride) * 0.08, 0.04 + stride * 0.18);
      rightFoot.position.set(0.13, 0.05 + Math.max(0, -stride) * 0.08, 0.04 - stride * 0.18);
      leftArmPivot.rotation.x = -stride * 0.35;
      rightArmPivot.rotation.x = stride * 0.35;
    }

    headLidPivot.rotation.x = -lidOpen * 1.45;
    miniStage.visible = lidOpen > 0.05;
  };

  return {
    group,
    headLidPivot,
    leftArmPivot,
    rightArmPivot,
    leftFoot,
    rightFoot,
    miniStage,
    update,
  };
}
