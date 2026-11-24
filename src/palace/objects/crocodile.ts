import * as THREE from 'three';
import { createAsset as createCrocAsset } from '../assets/polyfork/crocodile-base.mjs';
import { findPolyforkBone, preparePolyforkAsset } from '../assets/polyfork';
import { createPalaceToonMaterial } from '../render/toon';
import { makeContactShadow } from './primitives';
import { buildToothbrush } from './toothbrush';

export interface CrocodileRig {
  group: THREE.Group;
  armPivot: THREE.Group;
  jawPivot: THREE.Group;
  foamSteps: THREE.Mesh[];
  mirrorHead: THREE.Group;
  update: (frameIndex: number, brushStartTime: number, twosTime: number, boilAngle: number) => void;
}

/**
 * OBJECT 4: CROCODILE BRUSHING ITS TEETH (Bathroom)
 * Uses Polyfork rigged crocodile-base.mjs posed upright at the vanity sink,
 * animating Jaw + sculpted brushing arm with ergonomic toothbrush + pearlescent foam cluster,
 * plus a clean 3D mirrored bust in the bathroom mirror!
 */
export function buildCrocodile(): CrocodileRig {
  const group = new THREE.Group();
  group.name = 'crocodile_root';

  const bodyPivot = new THREE.Group();
  group.add(bodyPivot);

  const croc = createCrocAsset({
    coat: '#488A56',
    flank: '#63AB6F',
    belly: '#EDE4BE',
    scute: '#366942',
    tooth: '#FAF6E8',
    iris: '#D9C038',
    mouth: '#C27468',
  });

  // Scale down cleanly so upright crocodile stands ~1.58m tall in front of sink
  preparePolyforkAsset(croc, {
    scale: 0.56,
    roughness: 0.62,
    metalness: 0.03,
  });

  // Note: Polyfork croc faces +Z horizontally; Bathroom rotates crocodile.group.y = +0.68
  // Wait: Bathroom camera at (4.08, 1.46, -9.0) looks at (4.95, 1.32, -9.95), sink is at (5.0, 0, -10.15).
  // Crocodile sits upright facing -Z (toward sink) rotated slightly toward left camera (+0.68)!
  // Rotate croc Y = Math.PI so +Z becomes -Z (facing sink), then pose spine upright!
  const crocRig = new THREE.Group();
  crocRig.rotation.y = Math.PI;
  crocRig.position.set(0, 0.42, 0.12);
  crocRig.add(croc);
  bodyPivot.add(crocRig);

  const hipsBone = findPolyforkBone(croc, 'Hips');
  const spineBone = findPolyforkBone(croc, 'Spine');
  const chestBone = findPolyforkBone(croc, 'Chest');
  const neckBone = findPolyforkBone(croc, 'Neck');
  const headBone = findPolyforkBone(croc, 'Head');
  const jawBone = findPolyforkBone(croc, 'Jaw');
  const tailBone = findPolyforkBone(croc, 'Tail');
  const tail1Bone = findPolyforkBone(croc, 'Tail1');
  const tail2Bone = findPolyforkBone(croc, 'Tail2');
  const rArmBone = findPolyforkBone(croc, 'RightFrontUpLeg');
  const rForeBone = findPolyforkBone(croc, 'RightFrontLeg');
  const lArmBone = findPolyforkBone(croc, 'LeftFrontUpLeg');
  const lForeBone = findPolyforkBone(croc, 'LeftFrontLeg');
  const lLegBone = findPolyforkBone(croc, 'LeftHindUpLeg');
  const rLegBone = findPolyforkBone(croc, 'RightHindUpLeg');

  // Stand upright on hind legs/hips curving tail gracefully onto floor behind
  if (hipsBone) {
    hipsBone.rotation.x = -0.82;
    hipsBone.position.y += 0.28;
  }
  if (spineBone) spineBone.rotation.x = -0.28;
  if (chestBone) chestBone.rotation.x = -0.18;
  if (neckBone) neckBone.rotation.x = 0.55;
  if (headBone) headBone.rotation.x = 0.72;
  if (jawBone) jawBone.rotation.x = 0.30;

  if (tailBone) tailBone.rotation.x = 0.88;
  if (tail1Bone) tail1Bone.rotation.x = 0.55;
  if (tail2Bone) tail2Bone.rotation.x = 0.35;

  if (lLegBone) lLegBone.rotation.x = 0.75;
  if (rLegBone) rLegBone.rotation.x = 0.75;

  // Left arm (camera-facing side) reaches up toward snout
  if (lArmBone) {
    lArmBone.rotation.x = 0.98;
    lArmBone.rotation.z = -0.32;
  }
  if (lForeBone) {
    lForeBone.rotation.x = 0.80;
  }
  // Right arm rests politely forward toward sink edge
  if (rArmBone) {
    rArmBone.rotation.x = 0.55;
    rArmBone.rotation.z = 0.25;
  }
  if (rForeBone) {
    rForeBone.rotation.x = 0.35;
  }

  // Ergonomic toothbrush positioned so bristle tufts brush directly along snout/teeth (y ~ 1.28, z ~ -0.44)
  const armPivot = new THREE.Group();
  armPivot.position.set(-0.08, 1.24, -0.42);
  bodyPivot.add(armPivot);

  const toothbrush = buildToothbrush();
  // In toothbrush local coords, bristles are at y=0.39, z=0.036; pivot near bristle neck so handle extends down-left
  toothbrush.position.set(-0.18, -0.34, 0.04);
  toothbrush.rotation.set(0.18, 0.95, -0.48);
  armPivot.add(toothbrush);

  // Pearlescent toothpaste foam cluster right along snout teeth
  const foamSteps: THREE.Mesh[] = [];
  const foamMat = createPalaceToonMaterial({
    baseHex: '#FFFFFF',
    roughness: 0.25,
    metalness: 0.02,
  });
  const foamOffsets: [number, number, number, number][] = [
    [-0.04, 1.28, -0.44, 0.036],
    [-0.07, 1.25, -0.48, 0.046],
    [-0.02, 1.24, -0.51, 0.052],
    [-0.06, 1.30, -0.41, 0.058],
  ];
  for (const [fx, fy, fz, fr] of foamOffsets) {
    const fMesh = new THREE.Mesh(new THREE.SphereGeometry(fr, 14, 14), foamMat);
    fMesh.position.set(fx, fy, fz);
    fMesh.visible = false;
    fMesh.castShadow = true;
    bodyPivot.add(fMesh);
    foamSteps.push(fMesh);
  }

  // 3D mirrored Polyfork crocodile bust inside the bathroom mirror!
  const mirrorHead = new THREE.Group();
  mirrorHead.name = 'croc_mirror_flat';
  const mirrorCroc = createCrocAsset({
    coat: '#488A56',
    flank: '#63AB6F',
    belly: '#EDE4BE',
    scute: '#366942',
    tooth: '#FAF6E8',
    iris: '#D9C038',
  });
  preparePolyforkAsset(mirrorCroc, { scale: 0.56, castShadow: false, receiveShadow: false });
  const mJaw = findPolyforkBone(mirrorCroc, 'Jaw');
  if (mJaw) mJaw.rotation.x = 0.28;
  mirrorCroc.position.set(0, -0.26, -0.62);
  mirrorHead.add(mirrorCroc);

  const jawPivot = new THREE.Group();
  group.add(makeContactShadow(0.42, 0.48));

  const baseLArmRotX = lArmBone?.rotation.x ?? 0.98;
  const baseJawRotX = jawBone?.rotation.x ?? 0.30;

  const armPoses: [number, number, number][] = [
    [0.05, 0.06, 0.0],
    [-0.08, 0.02, -0.08],
    [0.04, -0.04, -0.04],
    [0.08, 0.02, 0.06],
  ];

  const update: CrocodileRig['update'] = (frameIndex, brushStartTime, twosTime, boilAngle) => {
    bodyPivot.rotation.y = boilAngle * 0.7;

    if (twosTime >= brushStartTime) {
      const twosIdx = Math.floor(frameIndex / 2);
      const poseIdx = twosIdx % 4;
      const [rx, ry, rz] = armPoses[poseIdx];
      armPivot.rotation.set(rx, ry, rz);
      if (lArmBone) lArmBone.rotation.x = baseLArmRotX + rx * 1.3;
      if (jawBone) jawBone.rotation.x = baseJawRotX + (poseIdx % 2) * 0.06;
      mirrorHead.position.y = 1.56 + (poseIdx % 2) * 0.015;

      const elapsed = twosTime - brushStartTime;
      const foamLevel = Math.min(4, Math.floor(elapsed / 0.42) + 1);
      for (let i = 0; i < 4; i++) {
        foamSteps[i].visible = i < foamLevel;
      }
    } else {
      armPivot.rotation.set(0, 0, 0);
      if (lArmBone) lArmBone.rotation.x = baseLArmRotX;
      if (jawBone) jawBone.rotation.x = baseJawRotX;
      for (let i = 0; i < 4; i++) foamSteps[i].visible = false;
    }
  };

  return { group, armPivot, jawPivot, foamSteps, mirrorHead, update };
}
