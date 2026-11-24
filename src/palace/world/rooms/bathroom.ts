import * as THREE from 'three';
import { createAsset as createBathAsset } from '../../assets/polyfork/bath-fad968.mjs';
import { createAsset as createSinkAsset } from '../../assets/polyfork/kitchen-sink-7ea438.mjs';
import { createAsset as createToiletAsset } from '../../assets/polyfork/toilet-2edbd9.mjs';
import { preparePolyforkAsset } from '../../assets/polyfork';
import { PALETTE } from '../../palette';
import { buildCrocodile, CrocodileRig } from '../../objects/crocodile';
import { makeOutlinedMesh, makePottedPlant, makeRoundedBox } from '../../objects/primitives';
import { makeBrassMaterial, makeGlassMaterial } from '../../render/toon';
import { makeCeilingSlab, makeCorridor, makeFloorPlane, makeWallSegment, WALL_HEIGHT } from '../wallBuilder';

export interface BathroomRoom {
  group: THREE.Group;
  crocodile: CrocodileRig;
  roofPanel: THREE.Mesh;
}

/**
 * BATHROOM (3.0 x 3.0 centered at (5.0, 0, -9.0))
 * Ceramic leaf-and-ivory checker tile, vanity cabinet with ceramic basin & brass faucet,
 * Polyfork bathtub, Polyfork toilet, fern, brass mirror, and upright Polyfork Crocodile brushing teeth.
 */
export function buildBathroomRoom(): BathroomRoom {
  const group = new THREE.Group();
  group.name = 'room_bathroom';

  const floor = makeFloorPlane({
    width: 3.0,
    depth: 3.0,
    pattern: 'checkerTile',
    tileAccentHex: PALETTE.leaf,
    tileShadeHex: PALETTE.leafShade,
  });
  floor.position.set(5.0, 0, -9.0);
  group.add(floor);

  const roofPanel = makeCeilingSlab(3.0, 3.0);
  roofPanel.position.set(5.0, WALL_HEIGHT + 0.06, -9.0);
  group.add(roofPanel);

  const wallOpts = {
    wallpaper: 'wallpaperDots' as const,
    accentHex: PALETTE.leaf,
    accentShadeHex: PALETTE.leafShade,
  };

  const southWall = makeWallSegment({ width: 3.0, hasDoor: true, doorOffset: 0, ...wallOpts });
  southWall.position.set(5.0, 0, -7.5);
  group.add(southWall);

  const northWall = makeWallSegment({ width: 3.0, ...wallOpts });
  northWall.position.set(5.0, 0, -10.5);
  group.add(northWall);

  const eastWall = makeWallSegment({ width: 3.0, ...wallOpts });
  eastWall.rotation.y = Math.PI * 0.5;
  eastWall.position.set(6.5, 0, -9.0);
  group.add(eastWall);

  const westWall = makeWallSegment({ width: 3.0, hasDoor: true, doorOffset: 0, ...wallOpts });
  westWall.rotation.y = Math.PI * 0.5;
  westWall.position.set(3.5, 0, -9.0);
  group.add(westWall);

  const corridor = makeCorridor(1.25, 1.5, true);
  corridor.position.set(2.875, 0, -9.0);
  group.add(corridor);

  // Vanity cabinet & ceramic sink at (5.0, 0, -10.22)
  const vanityCab = makeOutlinedMesh(makeRoundedBox(0.92, 0.78, 0.50, 0.02), { baseHex: '#ECE3D2', roughness: 0.6 });
  vanityCab.position.set(5.0, 0.39, -10.22);
  group.add(vanityCab);

  const sink = createSinkAsset({
    colorway: 'chalk-brass',
    ceramic: '#FAF8F3',
    brass: '#C9A24B',
    layout: 'single-wide',
  });
  preparePolyforkAsset(sink, { targetWidth: 0.86, groundY: true, centerXZ: true, roughness: 0.25 });
  sink.position.set(5.0, 0.66, -10.20);
  group.add(sink);

  // Polyfork Bath along east wall
  const bath = createBathAsset({
    colorway: 'sage-fitted',
    ceramic: '#FAF8F3',
    brass: '#C9A24B',
    water: '#67AAB6',
    fill: 0.85,
  });
  preparePolyforkAsset(bath, { targetWidth: 1.55, groundY: true, centerXZ: true, roughness: 0.35 });
  bath.rotation.y = -Math.PI * 0.5;
  bath.position.set(6.02, 0, -9.15);
  group.add(bath);

  // Polyfork Toilet tucked in north-west corner
  const toilet = createToiletAsset({
    ceramic: '#FAF8F3',
  });
  preparePolyforkAsset(toilet, { targetHeight: 0.78, groundY: true, centerXZ: true, roughness: 0.28 });
  toilet.rotation.y = 0.65;
  toilet.position.set(3.98, 0, -10.02);
  group.add(toilet);

  // Potted fern in corner
  const fern = makePottedPlant(0.62);
  fern.position.set(6.05, 0, -7.95);
  group.add(fern);

  // Brushed brass round mirror above sink at (5.0, 1.62, -10.38)
  const brassMat = makeBrassMaterial('#CFA84E');
  const mirrorRim = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.032, 14, 36), brassMat);
  mirrorRim.position.set(5.0, 1.62, -10.38);
  mirrorRim.castShadow = true;
  group.add(mirrorRim);

  const mirrorBack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.025, 32).rotateX(Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: '#B4DCE8', metalness: 0.85, roughness: 0.1 })
  );
  mirrorBack.position.set(5.0, 1.62, -10.40);
  group.add(mirrorBack);

  const mirrorGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.41, 0.41, 0.015, 32).rotateX(Math.PI * 0.5),
    makeGlassMaterial('#CBE9F5', 0.48)
  );
  mirrorGlass.position.set(5.0, 1.62, -10.37);
  group.add(mirrorGlass);

  // OBJECT 4: Upright Crocodile brushing teeth in front of sink
  const crocodile = buildCrocodile();
  crocodile.group.position.set(4.74, 0, -9.42);
  crocodile.group.rotation.y = 0.74;
  group.add(crocodile.group);

  // Mirrored Polyfork Crocodile head inside the mirror frame
  crocodile.mirrorHead.position.set(5.0, 1.56, -10.33);
  crocodile.mirrorHead.scale.setScalar(0.95);
  group.add(crocodile.mirrorHead);

  return { group, crocodile, roofPanel };
}
