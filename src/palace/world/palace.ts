import * as THREE from 'three';
import { buildBathroomRoom, BathroomRoom } from './rooms/bathroom';
import { buildBedroomRoom, BedroomRoom } from './rooms/bedroom';
import { buildEntranceRoom, EntranceRoom } from './rooms/entrance';
import { buildKitchenRoom, KitchenRoom } from './rooms/kitchen';
import { buildLivingRoom, LivingRoom } from './rooms/living';
import { makeOutlinedMesh, makeRoundedBox } from '../objects/primitives';
import { makeStampMesh } from '../text/signs';

export interface PalaceWorld {
  group: THREE.Group;
  entrance: EntranceRoom;
  living: LivingRoom;
  kitchen: KitchenRoom;
  bathroom: BathroomRoom;
  bedroom: BedroomRoom;
  plinthsGroup: THREE.Group;
  plinths: { plinth: THREE.Group; box: THREE.Mesh; flag: THREE.Group }[];
  setWalkthroughRoofsVisible: (visible: boolean) => void;
  setPlinthsVisible: (visible: boolean) => void;
}

/**
 * Full 5-room Palace at real coordinates (Section 9.1):
 * Entrance -> Living Room -> Kitchen -> Bathroom -> Bedroom.
 * Also includes the 5 numbered storage slot plinths (1..5) + Leaf flags used in S19 & S29.
 */
export function buildPalaceWorld(): PalaceWorld {
  const group = new THREE.Group();
  group.name = 'palace_world';

  const entrance = buildEntranceRoom();
  const living = buildLivingRoom();
  const kitchen = buildKitchenRoom();
  const bathroom = buildBathroomRoom();
  const bedroom = buildBedroomRoom();

  group.add(entrance.group);
  group.add(living.group);
  group.add(kitchen.group);
  group.add(bathroom.group);
  group.add(bedroom.group);

  // Clean Cream outer cladding on north wall of Bedroom for L4 Wall-wipe #3 (S29->S30)
  const northCreamBackdrop = makeOutlinedMesh(makeRoundedBox(4.0, 2.9, 0.04, 0.01), { colorKey: 'creamWall' }, 0);
  northCreamBackdrop.position.set(0, 1.45, -11.44);
  group.add(northCreamBackdrop);

  // Storage slot plinths (S19 & S29) placed neatly along the route points
  const plinthsGroup = new THREE.Group();
  plinthsGroup.visible = false;
  group.add(plinthsGroup);

  const slotCoords: [number, number, number, string][] = [
    [-0.7, 0, -2.0, '1'],
    [0.5, 0, -5.2, '2'],
    [4.4, 0, -5.4, '3'],
    [4.3, 0, -8.8, '4'],
    [0.7, 0, -9.4, '5'],
  ];

  const plinths: { plinth: THREE.Group; box: THREE.Mesh; flag: THREE.Group }[] = [];

  for (const [px, py, pz, label] of slotCoords) {
    const pGroup = new THREE.Group();
    pGroup.position.set(px, py, pz);
    plinthsGroup.add(pGroup);

    const body = makeOutlinedMesh(makeRoundedBox(0.56, 0.72, 0.56, 0.02), { colorKey: 'creamWall' }, 2.0);
    body.position.y = 0.36;
    pGroup.add(body);

    const slot = makeOutlinedMesh(makeRoundedBox(0.32, 0.04, 0.32, 0.008), { colorKey: 'coal', unlit: true }, 0);
    slot.position.y = 0.73;
    pGroup.add(slot);

    const num = makeStampMesh(label, { size: 0.22, colorKey: 'cobalt' });
    num.position.set(0, 0.42, 0.285);
    pGroup.add(num);

    const box = makeOutlinedMesh(makeRoundedBox(0.28, 0.28, 0.28, 0.02), { colorKey: 'cobalt' }, 2.0);
    box.position.set(0, 1.4, 0);
    box.visible = false;
    pGroup.add(box);

    // Leaf flag for S29 retrieval
    const flag = new THREE.Group();
    flag.position.set(0.18, 0.74, 0);
    flag.visible = false;
    const pole = makeOutlinedMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), { colorKey: 'coal' }, 1.5);
    pole.position.y = 0.225;
    flag.add(pole);
    const cloth = makeOutlinedMesh(makeRoundedBox(0.22, 0.14, 0.02, 0.005), { colorKey: 'leaf' }, 1.5);
    cloth.position.set(0.11, 0.36, 0);
    flag.add(cloth);
    pGroup.add(flag);

    plinths.push({ plinth: pGroup, box, flag });
  }

  const setWalkthroughRoofsVisible = (visible: boolean) => {
    entrance.roofPanel.visible = visible;
    entrance.porchRoofGroup.visible = visible;
    living.roofPanel.visible = visible;
    kitchen.roofPanel.visible = visible;
    bathroom.roofPanel.visible = visible;
    bedroom.roofHatchPivot.visible = visible;
  };

  const setPlinthsVisible = (visible: boolean) => {
    plinthsGroup.visible = visible;
  };

  return {
    group,
    entrance,
    living,
    kitchen,
    bathroom,
    bedroom,
    plinthsGroup,
    plinths,
    setWalkthroughRoofsVisible,
    setPlinthsVisible,
  };
}
