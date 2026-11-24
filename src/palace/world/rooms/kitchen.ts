import * as THREE from 'three';
import { createAsset as createKitchenSink } from '../../assets/polyfork/kitchen-sink-7ea438.mjs';
import { createAsset as createOliveTree } from '../../assets/polyfork/potted-olive-tree-7eee05.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { PALETTE } from '../../palette';
import { buildDiamonds, DiamondsRig } from '../../objects/diamonds';
import { buildFridge, FridgeRig } from '../../objects/fridge';
import { makeOutlinedMesh, makeRoundedBox } from '../../objects/primitives';
import { makeBrassMaterial } from '../../render/toon';
import { makeCeilingSlab, makeCorridor, makeFloorPlane, makeWallSegment, WALL_HEIGHT } from '../wallBuilder';

export interface KitchenRoom {
  group: THREE.Group;
  fridge: FridgeRig;
  diamonds: DiamondsRig;
  counterTopY: number;
  counterAnchor: THREE.Group;
  roofPanel: THREE.Mesh;
}

/**
 * KITCHEN (4.0 x 4.0 centered at (5.0, 0, -5.25))
 * Ceramic sky-and-ivory checker tile floor, sculpted island counter (holds Mitochondria Power Station in S23-S24),
 * back cabinetry with Polyfork Belfast sink & brass faucet, and the open Polyfork Fridge overflowing with 120 Diamonds.
 */
export function buildKitchenRoom(): KitchenRoom {
  const group = new THREE.Group();
  group.name = 'room_kitchen';

  const floor = makeFloorPlane({
    width: 4.0,
    depth: 4.0,
    pattern: 'checkerTile',
    tileAccentHex: PALETTE.sky,
    tileShadeHex: PALETTE.skyShade,
  });
  floor.position.set(5.0, 0, -5.25);
  group.add(floor);

  const roofPanel = makeCeilingSlab(4.0, 4.0);
  roofPanel.position.set(5.0, WALL_HEIGHT + 0.06, -5.25);
  group.add(roofPanel);

  const wallOpts = {
    wallpaper: 'wallpaperDiamonds' as const,
    accentHex: PALETTE.sky,
    accentShadeHex: PALETTE.skyShade,
  };

  const westWall = makeWallSegment({ width: 4.0, hasDoor: true, doorOffset: 0, ...wallOpts });
  westWall.rotation.y = Math.PI * 0.5;
  westWall.position.set(3.0, 0, -5.25);
  group.add(westWall);

  const eastWall = makeWallSegment({ width: 4.0, ...wallOpts });
  eastWall.rotation.y = Math.PI * 0.5;
  eastWall.position.set(7.0, 0, -5.25);
  group.add(eastWall);

  const southWall = makeWallSegment({ width: 4.0, ...wallOpts });
  southWall.position.set(5.0, 0, -3.25);
  group.add(southWall);

  const northWall = makeWallSegment({ width: 4.0, hasDoor: true, doorOffset: 0, ...wallOpts });
  northWall.position.set(5.0, 0, -7.25);
  group.add(northWall);

  const corridor = makeCorridor(1.5, 0.25, false);
  corridor.position.set(5.0, 0, -7.375);
  group.add(corridor);

  // Kitchen island counter at (4.90, 0, -4.45) with recessed toe kick & brushed stone countertop
  const counterBase = makeOutlinedMesh(makeRoundedBox(2.26, 0.80, 0.78, 0.02), { colorKey: 'creamWall', roughness: 0.65 });
  counterBase.position.set(4.90, 0.45, -4.45);
  group.add(counterBase);

  const toeKick = makeOutlinedMesh(makeRoundedBox(2.18, 0.10, 0.70, 0.01), { baseHex: '#353C42', roughness: 0.7 });
  toeKick.position.set(4.90, 0.05, -4.45);
  group.add(toeKick);

  // Brass drawer pulls on island
  const brassMat = makeBrassMaterial('#C9A24B');
  for (const dx of [-0.68, 0, 0.68]) {
    const pull = new THREE.Mesh(makeRoundedBox(0.18, 0.02, 0.03, 0.006), brassMat);
    pull.position.set(4.90 + dx, 0.72, -4.05);
    group.add(pull);
  }

  const counterTop = makeOutlinedMesh(makeRoundedBox(2.38, 0.06, 0.90, 0.015), { baseHex: '#DCEAF0', roughness: 0.28 });
  counterTop.position.set(4.90, 0.89, -4.45);
  group.add(counterTop);

  // Anchor on top of counter for Mitochondria Power Station (S23-S24)
  const counterAnchor = new THREE.Group();
  counterAnchor.position.set(4.90, 0.92, -4.45);
  counterAnchor.visible = false;
  group.add(counterAnchor);

  // Side cabinetry + Polyfork Belfast sink along east wall (X = 6.55, Z = -4.75)
  const sideCab = makeOutlinedMesh(makeRoundedBox(0.65, 0.84, 1.55, 0.02), { baseHex: '#E8E0CE', roughness: 0.6 });
  sideCab.position.set(6.58, 0.42, -4.45);
  group.add(sideCab);

  const sink = createKitchenSink({
    colorway: 'chalk-brass',
    ceramic: '#FAF8F3',
    brass: '#C9A24B',
  });
  preparePolyforkAsset(sink, { targetWidth: 0.92, groundY: true, centerXZ: true, roughness: 0.35 });
  sink.rotation.y = -Math.PI * 0.5;
  sink.position.set(6.55, 0.72, -4.45);
  group.add(sink);

  // Wall shelf above side sink
  const wallShelf = makeOutlinedMesh(makeRoundedBox(0.28, 0.04, 1.35, 0.008), { colorKey: 'floorWood', roughness: 0.48 });
  wallShelf.position.set(6.78, 1.62, -4.45);
  group.add(wallShelf);

  const olive = createOliveTree({ pot: '#E8DFD2', foliage: '#6B8C63' });
  preparePolyforkAsset(olive, { targetHeight: 1.25, groundY: true, centerXZ: true });
  olive.position.set(3.48, 0, -6.82);
  group.add(olive);

  // OBJECT 3: Open Polyfork Fridge filled with 120 Crystal Diamonds
  const fridgeGroup = new THREE.Group();
  fridgeGroup.position.set(6.35, 0, -6.65);
  fridgeGroup.rotation.y = -0.45;
  group.add(fridgeGroup);

  const fridge = buildFridge();
  fridgeGroup.add(fridge.group);

  const diamonds = buildDiamonds();
  fridgeGroup.add(diamonds.group);

  return {
    group,
    fridge,
    diamonds,
    counterTopY: 0.92,
    counterAnchor,
    roofPanel,
  };
}
