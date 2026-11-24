import * as THREE from 'three';
import { PALETTE } from '../../palette';
import { createPalaceToonMaterial, makeBrassMaterial, setPalaceMaterialColor } from '../../render/toon';
import { mulberry32 } from '../../seed';
import { makeOutlinedMesh, makeRoundedBox } from '../../objects/primitives';
import { makeBlockText } from '../../text/signs';

export interface CellPlantRig {
  group: THREE.Group;
  gear: THREE.Mesh;
  workersMain: THREE.InstancedMesh;
  workersOutline: THREE.InstancedMesh;
  lampConeMat: THREE.MeshStandardMaterial;
  lampShadeMat: THREE.MeshStandardMaterial;
  crumbleSlab: THREE.Group;
  crumbleLetters: THREE.Group[];
  update: (opts: {
    twosTime: number;
    frameIndex: number;
    workerCount: number;
    gearAngle: number;
    lampOn: boolean;
    lampFlash: boolean;
    crumbleProgress: number;
  }) => void;
}

/**
 * SECTION 9.5: THE MITOCHONDRIA POWER STATION (Kitchen island, S23-S24)
 * Refined miniature brass & enamel turbine factory with twin spinning gears, smokestacks,
 * copper power conduits, illuminated lamp light, and 2,000 smooth miniature workers.
 */
export function buildCellPlant(): CellPlantRig {
  const group = new THREE.Group();
  group.name = 'mitochondria_power_station';

  const brassMat = makeBrassMaterial('#CFA548');
  const copperMat = makeBrassMaterial('#C8734A');
  const ironMat = createPalaceToonMaterial({ baseHex: '#2B2F36', roughness: 0.42, metalness: 0.65 });

  // Plinth foundation
  const basePlate = makeOutlinedMesh(makeRoundedBox(0.68, 0.03, 0.48, 0.01), { baseHex: '#6F685F', roughness: 0.72 });
  basePlate.position.set(0, 0.015, 0);
  group.add(basePlate);

  // Mustard enamel turbine hall body
  const body = makeOutlinedMesh(
    makeRoundedBox(0.60, 0.34, 0.42, 0.015),
    {
      colorKey: 'mustard',
      pattern: 'wallpaperDots',
      patternHex: PALETTE.mustardShade,
      patternShadeHex: PALETTE.mustardShade,
      patternScale: 0.25,
      roughness: 0.55,
    }
  );
  body.position.set(0, 0.19, 0);
  group.add(body);

  // Pitched Terracotta roof
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.34, 0);
  roofShape.lineTo(0.34, 0);
  roofShape.lineTo(0, 0.19);
  roofShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  roofGeo.translate(0, 0, -0.23);
  const roof = makeOutlinedMesh(roofGeo, { colorKey: 'tomato', roughness: 0.58 });
  roof.position.set(0, 0.36, 0);
  group.add(roof);

  // 3 Industrial Chimneys with brass collars
  const chimGeo = new THREE.CylinderGeometry(0.034, 0.044, 0.28, 16);
  for (const cx of [-0.18, 0, 0.18]) {
    const chim = new THREE.Mesh(chimGeo, ironMat);
    chim.position.set(cx, 0.54, -0.08);
    chim.castShadow = true;
    group.add(chim);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.028, 16), brassMat);
    rim.position.set(cx, 0.67, -0.08);
    group.add(rim);
  }

  // Arched Doorway with brass trim
  const door = makeOutlinedMesh(makeRoundedBox(0.11, 0.17, 0.028, 0.008), { colorKey: 'tomato', roughness: 0.45 });
  door.position.set(-0.16, 0.10, 0.215);
  group.add(door);

  // Toothed Brass Primary Gear
  const gearShape = new THREE.Shape();
  const teeth = 12;
  const rOut = 0.125;
  const rIn = 0.095;
  for (let i = 0; i < teeth * 2; i++) {
    const a1 = (i / (teeth * 2)) * Math.PI * 2;
    const a2 = ((i + 0.65) / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? rOut : rIn;
    const x1 = Math.cos(a1) * r;
    const y1 = Math.sin(a1) * r;
    const x2 = Math.cos(a2) * r;
    const y2 = Math.sin(a2) * r;
    if (i === 0) gearShape.moveTo(x1, y1);
    else gearShape.lineTo(x1, y1);
    gearShape.lineTo(x2, y2);
  }
  gearShape.closePath();
  const gearGeo = new THREE.ExtrudeGeometry(gearShape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  gearGeo.center();
  const gear = new THREE.Mesh(gearGeo, brassMat);
  gear.position.set(0.14, 0.19, 0.23);
  gear.castShadow = true;
  group.add(gear);

  // "ENERGY" Plaque above door
  const signPlate = makeOutlinedMesh(makeRoundedBox(0.44, 0.11, 0.03, 0.008), { colorKey: 'creamWall', roughness: 0.55 });
  signPlate.position.set(0, 0.34, 0.23);
  group.add(signPlate);

  const energyText = makeBlockText('ENERGY', { size: 0.052, colorKey: 'tomato' });
  energyText.position.set(0, 0.34, 0.25);
  group.add(energyText);

  // 5 Copper power conduits running from turbine hall up to wall lamp
  for (let i = 0; i < 5; i++) {
    const startX = -0.14 + i * 0.07;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startX, 0.36, -0.20),
      new THREE.Vector3(startX * 0.8, 0.62, -0.34),
      new THREE.Vector3(0.45 + (i - 2) * 0.025, 0.96, -0.38),
      new THREE.Vector3(0.58, 1.18, -0.34),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.007, 8, false);
    const cable = new THREE.Mesh(tubeGeo, i % 2 === 0 ? copperMat : ironMat);
    cable.castShadow = true;
    group.add(cable);
  }

  // Sculpted Brass & Enamel Wall Lamp with real PointLight flash!
  const lampGroup = new THREE.Group();
  lampGroup.position.set(0.58, 1.24, -0.28);
  group.add(lampGroup);

  const lampPost = new THREE.Mesh(makeRoundedBox(0.036, 1.30, 0.036, 0.008), ironMat);
  lampPost.position.set(0, -0.59, -0.14);
  lampPost.castShadow = true;
  lampGroup.add(lampPost);

  const lampArm = new THREE.Mesh(makeRoundedBox(0.036, 0.036, 0.16, 0.008), brassMat);
  lampArm.position.set(0, 0.06, -0.06);
  lampGroup.add(lampArm);

  const lampShadeMat = createPalaceToonMaterial({ colorKey: 'mustard', roughness: 0.35, metalness: 0.2 });
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.14, 20, 1, false), lampShadeMat);
  lampShade.castShadow = true;
  lampGroup.add(lampShade);

  const lampBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 12, 12),
    new THREE.MeshStandardMaterial({
      color: '#FFF9E2',
      emissive: new THREE.Color('#FFD97A'),
      emissiveIntensity: 0,
    })
  );
  lampBulb.position.y = -0.06;
  lampGroup.add(lampBulb);

  const lampPointLight = new THREE.PointLight(0xffe7a8, 0, 3.2, 1.5);
  lampPointLight.position.set(0, -0.12, 0);
  lampGroup.add(lampPointLight);

  const lampConeMat = createPalaceToonMaterial({
    baseHex: PALETTE.mustard,
    shadeHex: PALETTE.mustard,
    transparent: true,
    opacity: 0.22,
  });
  const lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.42, 18), lampConeMat);
  lightCone.position.set(0, -0.26, 0);
  lightCone.visible = false;
  lampGroup.add(lightCone);

  // 2000 Instanced miniature workers
  const MAX_WORKERS = 2000;
  const workerGeo = new THREE.CapsuleGeometry(0.007, 0.012, 4, 8);
  const workerMat = createPalaceToonMaterial({ colorKey: 'tomato', roughness: 0.55 });
  const workersMain = new THREE.InstancedMesh(workerGeo, workerMat, MAX_WORKERS);
  workersMain.castShadow = true;
  workersMain.receiveShadow = true;
  workersMain.frustumCulled = false;
  group.add(workersMain);

  const workersOutline = new THREE.InstancedMesh(workerGeo, workerMat, 0);
  workersOutline.visible = false;

  const rng = mulberry32(9955);
  const workerColors = [
    new THREE.Color(PALETTE.tomato),
    new THREE.Color(PALETTE.cobalt),
    new THREE.Color(PALETTE.mustard),
  ];

  const workerData: { laneX: number; laneZ: number; speed: number; phase: number; dropWorker: boolean }[] = [];
  for (let i = 0; i < MAX_WORKERS; i++) {
    const lane = i % 10;
    const laneZ = -0.32 + lane * 0.068 + (rng() - 0.5) * 0.015;
    const phase = rng();
    const speed = 0.08 + (lane % 3) * 0.02;
    workerData.push({
      laneX: (rng() - 0.5) * 2.1,
      laneZ,
      speed,
      phase,
      dropWorker: i === 12,
    });
    workersMain.setColorAt(i, workerColors[i % 3]);
  }
  if (workersMain.instanceColor) workersMain.instanceColor.needsUpdate = true;

  // Abstract sentence slab for S24 comparison
  const crumbleSlab = new THREE.Group();
  crumbleSlab.position.set(-0.72, 0.24, 0.05);
  crumbleSlab.visible = false;
  group.add(crumbleSlab);

  const slabBase = makeOutlinedMesh(makeRoundedBox(0.68, 0.36, 0.06, 0.01), { colorKey: 'creamWall', roughness: 0.65 });
  crumbleSlab.add(slabBase);

  const crumbleLetters: THREE.Group[] = [];
  const words = ['MITOCHONDRIA', 'PRODUCE', 'ENERGY'];
  for (let i = 0; i < words.length; i++) {
    const blk = makeBlockText(words[i], { size: 0.04, colorKey: 'coal' });
    blk.position.set(0, 0.09 - i * 0.09, 0.045);
    crumbleSlab.add(blk);
    crumbleLetters.push(blk);
  }

  const dummy = new THREE.Object3D();
  const zeroMat = new THREE.Matrix4().makeScale(0, 0, 0);

  const update: CellPlantRig['update'] = ({
    twosTime,
    workerCount,
    gearAngle,
    lampOn,
    lampFlash,
    crumbleProgress,
  }) => {
    gear.rotation.z = gearAngle;

    lightCone.visible = lampOn;
    lampPointLight.intensity = lampFlash ? 4.5 : lampOn ? 2.1 : 0;
    (lampBulb.material as THREE.MeshStandardMaterial).emissiveIntensity = lampFlash ? 2.5 : lampOn ? 1.2 : 0;
    if (lampFlash) {
      setPalaceMaterialColor(lampShadeMat, PALETTE.paperWhite);
    } else {
      setPalaceMaterialColor(lampShadeMat, PALETTE.mustard);
    }

    const active = Math.min(MAX_WORKERS, Math.max(0, Math.floor(workerCount)));
    for (let i = 0; i < MAX_WORKERS; i++) {
      if (i >= active) {
        workersMain.setMatrixAt(i, zeroMat);
      } else {
        const wd = workerData[i];
        const t = (wd.phase + twosTime * wd.speed) % 1.0;
        const wx = -1.05 + t * 2.1;
        let wz = wd.laneZ;
        if (Math.abs(wx) < 0.38 && Math.abs(wz) < 0.27) {
          wz = wz >= 0 ? 0.30 + (i % 5) * 0.025 : -0.30 - (i % 4) * 0.025;
        }
        const stepHop = Math.abs(Math.sin(twosTime * 12 + i)) * 0.005;
        let wy = 0.015 + stepHop;
        if (wd.dropWorker && (twosTime % 3.0) > 1.8 && (twosTime % 3.0) < 2.4) {
          wy = 0.006;
        }
        dummy.position.set(wx, wy, wz);
        dummy.rotation.set(0, Math.PI * 0.5, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        workersMain.setMatrixAt(i, dummy.matrix);
      }
    }
    workersMain.instanceMatrix.needsUpdate = true;

    if (crumbleProgress > 0) {
      crumbleSlab.rotation.z = -crumbleProgress * 0.18;
      for (let i = 0; i < crumbleLetters.length; i++) {
        const drop = Math.max(0, crumbleProgress - i * 0.18) * 1.4;
        crumbleLetters[i].position.y = 0.09 - i * 0.09 - Math.min(0.24, drop * 0.24);
        crumbleLetters[i].rotation.z = (i % 2 === 0 ? 1 : -1) * Math.min(0.45, drop * 0.5);
      }
    }
  };

  return {
    group,
    gear,
    workersMain,
    workersOutline,
    lampConeMat,
    lampShadeMat,
    crumbleSlab,
    crumbleLetters,
    update,
  };
}
