import * as THREE from 'three';
import { createAsset as createPenguinAsset } from '../assets/polyfork/penguin-base.mjs';
import { findPolyforkBone, preparePolyforkAsset } from '../assets/polyfork';
import { PALETTE } from '../palette';
import { makeBrassMaterial, makeGlassMaterial } from '../render/toon';
import { makeContactShadow, makeRoundedBox } from './primitives';

export interface PenguinRig {
  group: THREE.Group;
  bodyPivot: THREE.Group;
  glassesGroup: THREE.Group;
  rightFlipperPivot: THREE.Group;
  leftFlipperPivot: THREE.Group;
  lowerBeak: THREE.Mesh;
  update: (
    twosTime: number,
    opts: {
      leanPhase?: number;
      glassesSlide?: number;
      walkStepOffset?: THREE.Vector3;
      boilAngle?: number;
    }
  ) => void;
}

/**
 * OBJECT 1: PENGUIN WEARING SUNGLASSES (Entrance & Final Reveal)
 * Powered by Polyfork rigged penguin-base.mjs + sculpted brass/tinted-glass sunglasses
 * bound directly to the Head bone and animated RightWing flipper.
 */
export function buildPenguin(): PenguinRig {
  const group = new THREE.Group();
  group.name = 'penguin_root';

  const bodyPivot = new THREE.Group();
  bodyPivot.name = 'penguin_body_pivot';
  group.add(bodyPivot);

  const penguin = createPenguinAsset({
    plumage: '#232832',
    belly: '#FBF7EE',
    undertail: '#D5D4D2',
    bill: '#F29A2E',
    feet: '#EA8422',
    keratin: '#3B3F46',
    eye: '#4A2B16',
    pupil: '#0E0A08',
    build: 0.62,
    headSize: 1.04,
    flipperSpread: 0.55,
  });

  // Scale to ~1.24m tall for crisp eye-level hero framing in Entrance hall
  preparePolyforkAsset(penguin, {
    targetHeight: 1.24,
    groundY: true,
    roughness: 0.58,
    metalness: 0.03,
  });
  bodyPivot.add(penguin);

  const hipsBone = findPolyforkBone(penguin, 'Hips');
  const spineBone = findPolyforkBone(penguin, 'Spine');
  const chestBone = findPolyforkBone(penguin, 'Chest');
  const neckBone = findPolyforkBone(penguin, 'Neck');
  const headBone = findPolyforkBone(penguin, 'Head');
  const rightWingBone = findPolyforkBone(penguin, 'RightWing');
  const rightWingTipBone = findPolyforkBone(penguin, 'RightWingTip');
  const leftWingBone = findPolyforkBone(penguin, 'LeftWing');
  const tailBone = findPolyforkBone(penguin, 'Tail');

  const baseHipsRotZ = hipsBone?.rotation.z ?? 0;
  const baseChestRotZ = chestBone?.rotation.z ?? 0;
  const baseHeadRotX = headBone?.rotation.x ?? 0;
  const baseHeadRotZ = headBone?.rotation.z ?? 0;
  const baseRWingRotX = rightWingBone?.rotation.x ?? 0;
  const baseRWingRotZ = rightWingBone?.rotation.z ?? 0;
  const baseRWingTipRotZ = rightWingTipBone?.rotation.z ?? 0;
  const baseLWingRotZ = leftWingBone?.rotation.z ?? 0;
  const baseTailRotY = tailBone?.rotation.y ?? 0;

  // Sculpted brass-rimmed & dark tinted sunglasses (in penguin native scale so they inherit 1.72x cleanly!)
  const glassesGroup = new THREE.Group();
  glassesGroup.name = 'penguin_sunglasses';
  const baseGlassesY = 0.022;
  const baseGlassesZ = 0.105;
  glassesGroup.position.set(0, baseGlassesY, baseGlassesZ);

  const darkFrameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#19191D'),
    roughness: 0.25,
    metalness: 0.45,
  });
  const brassMat = makeBrassMaterial('#D4AE52');
  const tintLensMat = makeGlassMaterial('#161920', 0.88);
  tintLensMat.roughness = 0.05;
  tintLensMat.metalness = 0.25;

  const lensShape = new THREE.Shape();
  const lw = 0.095;
  const lh = 0.056;
  const r = 0.016;
  lensShape.moveTo(-lw / 2 + r, -lh / 2);
  lensShape.lineTo(lw / 2 - r, -lh / 2);
  lensShape.quadraticCurveTo(lw / 2, -lh / 2, lw / 2, -lh / 2 + r);
  lensShape.lineTo(lw / 2, lh / 2 - r);
  lensShape.quadraticCurveTo(lw / 2, lh / 2, lw / 2 - r, lh / 2);
  lensShape.lineTo(-lw / 2 + r, lh / 2);
  lensShape.quadraticCurveTo(-lw / 2, lh / 2, -lw / 2, lh / 2 - r);
  lensShape.lineTo(-lw / 2, -lh / 2 + r);
  lensShape.quadraticCurveTo(-lw / 2, -lh / 2, -lw / 2 + r, -lh / 2);

  const lensGeo = new THREE.ExtrudeGeometry(lensShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  lensGeo.center();

  const rimGeo = new THREE.ExtrudeGeometry(lensShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.006,
    bevelSegments: 2,
  });
  rimGeo.center();

  for (const side of [-1, 1]) {
    const rim = new THREE.Mesh(rimGeo, darkFrameMat);
    rim.position.set(side * 0.062, 0, -0.002);
    rim.rotation.y = side * -0.14;
    rim.castShadow = true;
    glassesGroup.add(rim);

    const lens = new THREE.Mesh(lensGeo, tintLensMat);
    lens.position.set(side * 0.062, 0, 0.002);
    lens.rotation.y = side * -0.14;
    glassesGroup.add(lens);

    // Temple arm tucked back toward ear/side of head
    const arm = new THREE.Mesh(makeRoundedBox(0.009, 0.011, 0.14, 0.003), brassMat);
    arm.position.set(side * 0.106, 0.014, -0.068);
    arm.rotation.y = side * 0.08;
    glassesGroup.add(arm);
  }

  // Brass double bridge bar
  const bridgeTop = new THREE.Mesh(makeRoundedBox(0.056, 0.008, 0.01, 0.003), brassMat);
  bridgeTop.position.set(0, 0.022, 0.015);
  glassesGroup.add(bridgeTop);

  const bridgeLow = new THREE.Mesh(makeRoundedBox(0.044, 0.007, 0.01, 0.003), darkFrameMat);
  bridgeLow.position.set(0, 0.006, 0.014);
  glassesGroup.add(bridgeLow);

  if (headBone) {
    headBone.add(glassesGroup);
  } else {
    glassesGroup.position.set(0, 1.07, 0.17);
    bodyPivot.add(glassesGroup);
  }

  // Dummy compatibility nodes for PenguinRig interface
  const rightFlipperPivot = new THREE.Group();
  const leftFlipperPivot = new THREE.Group();
  const lowerBeak = new THREE.Mesh();

  group.add(makeContactShadow(0.34, 0.32, PALETTE.cobaltShade));

  const update: PenguinRig['update'] = (twosTime, opts) => {
    const leanPhase = opts.leanPhase ?? 0;
    const boil = opts.boilAngle ?? 0;
    const slide = opts.glassesSlide ?? 0;

    // Smooth swagger sway across hips & chest
    const sway = Math.sin(leanPhase) * 0.065;
    bodyPivot.rotation.y = boil + Math.sin(leanPhase * 0.5) * 0.05;

    if (hipsBone) hipsBone.rotation.z = baseHipsRotZ + sway * 0.55;
    if (spineBone) spineBone.rotation.z = sway * 0.45;
    if (chestBone) chestBone.rotation.z = baseChestRotZ + sway * 0.5;
    if (tailBone) tailBone.rotation.y = baseTailRotY + Math.sin(twosTime * 3.1) * 0.08;

    // Subtle cool nod every ~2.4s
    const blinkCycle = twosTime % 2.4;
    const nod = blinkCycle > 2.15 && blinkCycle < 2.38 ? 0.07 : 0;

    if (headBone) {
      headBone.rotation.x = baseHeadRotX + nod + slide * 0.08;
      headBone.rotation.z = baseHeadRotZ - sway * 0.35;
    }
    if (neckBone) {
      neckBone.rotation.x = nod * 0.5;
    }

    // Sunglasses slide down & slightly forward along the bill
    glassesGroup.position.y = baseGlassesY - slide * 0.028;
    glassesGroup.position.z = baseGlassesZ + slide * 0.022;
    glassesGroup.rotation.x = slide * 0.22;

    // Right wing lifts gracefully to touch sunglasses rim during slide
    if (rightWingBone) {
      rightWingBone.rotation.x = baseRWingRotX - slide * 1.35;
      rightWingBone.rotation.z = baseRWingRotZ + slide * 0.72 + Math.sin(leanPhase) * 0.04;
    }
    if (rightWingTipBone) {
      rightWingTipBone.rotation.z = baseRWingTipRotZ + slide * 0.45;
    }
    if (leftWingBone) {
      leftWingBone.rotation.z = baseLWingRotZ - Math.sin(leanPhase) * 0.06;
    }

    if (opts.walkStepOffset) {
      group.position.copy(opts.walkStepOffset);
    }
  };

  return {
    group,
    bodyPivot,
    glassesGroup,
    rightFlipperPivot,
    leftFlipperPivot,
    lowerBeak,
    update,
  };
}
