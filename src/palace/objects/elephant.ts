import * as THREE from 'three';
import { createAsset as createElephantAsset } from '../assets/polyfork/elephant-base.mjs';
import { findPolyforkBone, preparePolyforkAsset } from '../assets/polyfork';

export interface ElephantRig {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  trunkSegments: THREE.Group[];
  update: (opts: {
    jumpY: number;
    squashY: number;
    trunkLift: number;
    boilAngle: number;
  }) => void;
}

/**
 * OBJECT 5: ELEPHANT JUMPING ON THE BED (Bedroom)
 * Uses Polyfork rigged elephant-base.mjs in warm lavender-lilac coat with ivory tusks,
 * animating Trunk/TrunkMid/TrunkTip and LeftEar/RightEar cheerfully on each bounce!
 */
export function buildElephant(): ElephantRig {
  const group = new THREE.Group();
  group.name = 'elephant_root';

  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  const elephant = createElephantAsset({
    coat: '#A696C2',
    ivory: '#F7EFE0',
    nail: '#D8CDBB',
    tuft: '#4E455C',
    eye: '#18141C',
    iris: '#5B3D24',
    build: 1.02,
    ears: 1.08,
    trunk: 1.04,
    tusks: 0.92,
  });

  preparePolyforkAsset(elephant, {
    targetHeight: 1.48,
    groundY: true,
    centerXZ: true,
    roughness: 0.68,
    metalness: 0.02,
  });
  bodyGroup.add(elephant);

  const trunkBase = findPolyforkBone(elephant, 'Trunk');
  const trunkMid = findPolyforkBone(elephant, 'TrunkMid');
  const trunkTip = findPolyforkBone(elephant, 'TrunkTip');
  const leftEar = findPolyforkBone(elephant, 'LeftEar');
  const rightEar = findPolyforkBone(elephant, 'RightEar');
  const headBone = findPolyforkBone(elephant, 'Head');
  const tailBone = findPolyforkBone(elephant, 'Tail');

  const baseTrunkX = trunkBase?.rotation.x ?? 0;
  const baseTrunkMidX = trunkMid?.rotation.x ?? 0;
  const baseTrunkTipX = trunkTip?.rotation.x ?? 0;
  const baseLeftEarY = leftEar?.rotation.y ?? 0;
  const baseRightEarY = rightEar?.rotation.y ?? 0;
  const baseHeadX = headBone?.rotation.x ?? 0;
  const baseTailX = tailBone?.rotation.x ?? 0;

  const trunkSegments: THREE.Group[] = [];

  const update: ElephantRig['update'] = ({ jumpY, squashY, trunkLift, boilAngle }) => {
    bodyGroup.position.y = jumpY;
    const xz = 1 / Math.sqrt(squashY);
    bodyGroup.scale.set(xz, squashY, xz);
    bodyGroup.rotation.y = boilAngle;

    if (headBone) headBone.rotation.x = baseHeadX - trunkLift * 0.12;
    if (trunkBase) trunkBase.rotation.x = baseTrunkX - trunkLift * 0.72;
    if (trunkMid) trunkMid.rotation.x = baseTrunkMidX - trunkLift * 0.45;
    if (trunkTip) trunkTip.rotation.x = baseTrunkTipX - trunkLift * 0.3;

    if (leftEar) leftEar.rotation.y = baseLeftEarY + trunkLift * 0.35;
    if (rightEar) rightEar.rotation.y = baseRightEarY - trunkLift * 0.35;
    if (tailBone) tailBone.rotation.x = baseTailX + trunkLift * 0.25;
  };

  return { group, bodyGroup, trunkSegments, update };
}
