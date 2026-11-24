import * as THREE from 'three';
import { createPalaceLighting, PalaceLightingRig } from './render/hardshadow';
import { GLOBAL_OUTLINE_UNIFORMS } from './render/outline';
import { attachStudioEnvironment, createPalaceRenderer, isSoftwareRenderer } from './render/post';
import {
  cameraTime,
  FPS,
  idleBoilAngle,
  linearWobble,
  quantizeTwos,
  slamOffset,
  stepLinear,
  twosStep,
} from './render/twos';
import { loadPalaceFont } from './text/signs';
import { AlignedTimeline, findSyncTime, getActiveShot } from './timeline';
import { buildCameraKeyframes, CameraKeyframe, sampleCameraState } from './camera/path';
import { buildPalaceWorld, PalaceWorld } from './world/palace';
import { buildBrainRoomWorld, BrainRoomWorld } from './world/dioramas/brainRoom';
import { buildCellPlant, CellPlantRig } from './world/dioramas/cellPlant';
import { buildSchoolDiorama, SchoolDiorama } from './world/dioramas/school';
import { buildMuseumDiorama, MuseumDiorama } from './world/dioramas/museum';
import { buildSupermarketDiorama, SupermarketDiorama } from './world/dioramas/supermarket';
import { buildEvidenceStage, EvidenceAndCaveatsStage, setCalendarRowLit } from './world/dioramas/calendar';
import { buildWalker, WalkerRig } from './objects/walker';

export interface RenderReport {
  frameIndex: number;
  timeSec: number;
  shotId: string;
  renderMs: number;
  triangles: number;
}

export class PalaceEngine {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public lighting: PalaceLightingRig;
  public timeline: AlignedTimeline;
  public keyframes: CameraKeyframe[];

  public palace!: PalaceWorld;
  public brainWorld!: BrainRoomWorld;
  public cellPlant!: CellPlantRig;
  public schoolDiorama!: SchoolDiorama;
  public museumDiorama!: MuseumDiorama;
  public supermarketDiorama!: SupermarketDiorama;
  public evidenceStage!: EvidenceAndCaveatsStage;
  public routeWalker!: WalkerRig;

  private syncTimes: Record<string, number> = {};
  private roomRenderTargets: THREE.WebGLRenderTarget[] = [];

  private sceneFog: THREE.FogExp2;

  constructor(
    canvas: HTMLCanvasElement | undefined,
    width: number,
    height: number,
    timeline: AlignedTimeline
  ) {
    this.timeline = timeline;
    this.renderer = createPalaceRenderer(canvas, width, height);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#CBE2EF');
    this.sceneFog = new THREE.FogExp2('#CFE2EE', 0.0042);
    this.scene.fog = this.sceneFog;
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 140);
    const isSoftwareGl = isSoftwareRenderer(this.renderer);
    this.lighting = createPalaceLighting(this.scene, isSoftwareGl);
    attachStudioEnvironment(this.renderer, this.scene);
    this.keyframes = buildCameraKeyframes();
  }

  public static async create(
    canvas: HTMLCanvasElement | undefined,
    width: number,
    height: number
  ): Promise<PalaceEngine> {
    await loadPalaceFont('/fonts/BricolageGrotesque-Bold.ttf');
    const res = await fetch('/audio/words.json');
    if (!res.ok) {
      throw new Error(`Failed to load timeline (${res.status})`);
    }
    const timeline: AlignedTimeline = await res.json();

    const engine = new PalaceEngine(canvas, width, height, timeline);
    engine.buildWorld();
    engine.cacheSyncTimes();
    engine.renderRoomPicturesToTextures();
    return engine;
  }

  private buildWorld() {
    this.palace = buildPalaceWorld();
    this.scene.add(this.palace.group);

    this.brainWorld = buildBrainRoomWorld();
    this.scene.add(this.brainWorld.group);

    this.cellPlant = buildCellPlant();
    this.palace.kitchen.counterAnchor.add(this.cellPlant.group);

    this.schoolDiorama = buildSchoolDiorama();
    this.schoolDiorama.group.position.set(112, 0, 0);
    this.scene.add(this.schoolDiorama.group);

    this.museumDiorama = buildMuseumDiorama();
    this.museumDiorama.group.position.set(118, 0, 0);
    this.scene.add(this.museumDiorama.group);

    this.supermarketDiorama = buildSupermarketDiorama();
    this.supermarketDiorama.group.position.set(124, 0, 0);
    this.scene.add(this.supermarketDiorama.group);

    this.evidenceStage = buildEvidenceStage();
    this.evidenceStage.group.position.set(140, 0, 0);
    this.scene.add(this.evidenceStage.group);

    // Practice & Storage slot Walker (used in S19 and S29)
    this.routeWalker = buildWalker();
    this.routeWalker.group.visible = false;
    this.palace.group.add(this.routeWalker.group);
  }

  private cacheSyncTimes() {
    const tl = this.timeline;
    const keys: [string, string][] = [
      ['S01_five', 'S01:five'],
      ['S02_without', 'S02:without'],
      ['S03_opening', 'S03:opening'],
      ['S04_penguin', 'S04:penguin'],
      ['S04_sunglasses', 'S04:sunglasses'],
      ['S05_giant', 'S05:giant'],
      ['S05_banana', 'S05:banana'],
      ['S06_diamonds', 'S06:diamonds'],
      ['S07_crocodile', 'S07:crocodile'],
      ['S07_teeth', 'S07:teeth'],
      ['S08_elephant', 'S08:elephant'],
      ['S08_jumping', 'S08:jumping'],
      ['S09_later', 'S09:later'],
      ['S10_environments', 'S10:environments'],
      ['S11_years', 'S11:years'],
      ['S12_furniture', 'S12:furniture'],
      ['S12_doors', 'S12:doors'],
      ['S12_another', 'S12:another'],
      ['S13_store', 'S13:store'],
      ['S14_palace', 'S14:palace'],
      ['S14_enormous', 'S14:enormous'],
      ['S15_virtual', 'S15:virtual'],
      ['S15_game', 'S15:game'],
      ['S16_know', 'S16:know'],
      ['S17_house', 'S17:house'],
      ['S17_school', 'S17:school'],
      ['S17_game', 'S17:game'],
      ['S18_route', 'S18:route'],
      ['S19_location', 'S19:location'],
      ['S20_trick', 'S20:trick'],
      ['S20_ordinary', 'S20:ordinary'],
      ['S21_ridiculous', 'S21:ridiculous'],
      ['S21_enormous', 'S21:enormous'],
      ['S21_movement', 'S21:movement'],
      ['S21_sound', 'S21:sound'],
      ['S22_mitochondria', 'S22:mitochondria'],
      ['S22_energy', 'S22:energy'],
      ['S23_tiny', 'S23:tiny'],
      ['S23_kitchen', 'S23:kitchen'],
      ['S23_thousands', 'S23:thousands'],
      ['S24_abstract', 'S24:abstract'],
      ['S24_scene', 'S24:scene'],
      ['S25_different', 'S25:different'],
      ['S26_school', 'S26:school'],
      ['S26_mathematics', 'S26:mathematics'],
      ['S27_museum', 'S27:museum'],
      ['S27_history', 'S27:history'],
      ['S28_entire', 'S28:entire'],
      ['S28_language', 'S28:language'],
      ['S29_practice', 'S29:practice'],
      ['S29_retrieving', 'S29:retrieving'],
      ['S30_seventeen', 'S30:seventeen'],
      ['S31_weeks', 'S31:weeks'],
      ['S31_improved', 'S31:improved'],
      ['S32_months', 'S32:months'],
      ['S32_detectable', 'S32:detectable'],
      ['S33_isnt', 'S33:isnt'],
      ['S34_understand', 'S34:understand'],
      ['S34_associate', 'S34:associate'],
      ['S34_revisit', 'S34:revisit'],
      ['S35_clearly', 'S35:clearly'],
      ['S35_headset', 'S35:headset'],
      ['S36_remember', 'S36:remember'],
      ['S36_beginning', 'S36:beginning'],
      ['S37_entrance', 'S37:entrance'],
    ];

    for (const [k, spec] of keys) {
      const [sid, w] = spec.split(':');
      this.syncTimes[k] = findSyncTime(tl, sid, w);
    }
  }

  /**
   * Section 9.3: Brain Room wall pictures are real renders of the 5 rooms via render-to-texture!
   */
  private renderRoomPicturesToTextures() {
    const snapViews: { pos: [number, number, number]; look: [number, number, number] }[] = [
      { pos: [0, 1.35, -0.5], look: [0, 0.9, -2.4] },       // Entrance + Penguin
      { pos: [0.3, 1.45, -4.4], look: [-1.1, 0.65, -6.5] }, // Living + Banana
      { pos: [4.8, 1.35, -5.2], look: [6.3, 1.0, -6.6] },   // Kitchen + Fridge
      { pos: [4.4, 1.45, -8.3], look: [5.0, 1.35, -9.8] },  // Bathroom + Croc
      { pos: [0.8, 1.35, -8.6], look: [-0.85, 1.3, -10.7] },// Bedroom + Elephant
    ];

    const snapCam = new THREE.PerspectiveCamera(45, 0.82 / 0.52, 0.1, 40);
    this.palace.entrance.doorPivot.rotation.y = 0;
    this.palace.setWalkthroughRoofsVisible(true);
    const prevFog = this.scene.fog;
    this.scene.fog = null;

    for (let i = 0; i < 5; i++) {
      const rt = new THREE.WebGLRenderTarget(512, 320, {
        colorSpace: THREE.SRGBColorSpace,
      });
      this.roomRenderTargets.push(rt);

      snapCam.position.set(...snapViews[i].pos);
      snapCam.lookAt(...snapViews[i].look);
      this.lighting.focusRoom(new THREE.Vector3(...snapViews[i].look), 5);

      this.renderer.setRenderTarget(rt);
      this.renderer.render(this.scene, snapCam);
      this.brainWorld.frameTextures[i].map = rt.texture;
      this.brainWorld.frameTextures[i].needsUpdate = true;
    }
    this.scene.fog = prevFog;
    this.renderer.setRenderTarget(null);
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    GLOBAL_OUTLINE_UNIFORMS.uResolution.value.set(width, height);
  }

  public applyFrameState(frameIndex: number): string {
    const camT = cameraTime(frameIndex);
    const twosT = quantizeTwos(frameIndex);
    GLOBAL_OUTLINE_UNIFORMS.uBoilStep.value = twosStep(frameIndex);

    const activeShot = getActiveShot(this.timeline, camT);
    const sid = activeShot.id;

    // 1. Camera rail (smooth 30fps)
    const camState = sampleCameraState(this.keyframes, camT);
    this.camera.position.copy(camState.pos);
    this.camera.lookAt(camState.look);
    if (Math.abs(this.camera.fov - camState.fov) > 0.01) {
      this.camera.fov = camState.fov;
      this.camera.updateProjectionMatrix();
    }
    this.lighting.focusRoom(camState.roomFocus, camState.focusRadius);

    // 2. Visibility modes (walkthrough closed house vs dollhouse S29 vs kitchen power station S23-S24)
    if (sid === 'S09' || sid === 'S36') {
      // Hinged bedroom roof swings open on twos
      const openP =
        sid === 'S09'
          ? stepLinear(twosT, 32.0, 34.0)
          : 1.0 - stepLinear(twosT, 145.0, 146.5);
      this.palace.setWalkthroughRoofsVisible(true);
      this.palace.bedroom.roofHatchPivot.rotation.z = openP * 1.35;
    } else if (sid === 'S29') {
      this.palace.setWalkthroughRoofsVisible(false);
    } else {
      this.palace.setWalkthroughRoofsVisible(true);
      this.palace.bedroom.roofHatchPivot.rotation.z = 0;
    }

    // Kitchen counter Power Station: NOT visible in S06, visible ONLY in S23-S24
    const showPlant = sid === 'S23' || sid === 'S24';
    this.palace.kitchen.counterAnchor.visible = showPlant;

    // Storage slot plinths (S19 & S29)
    const showPlinths = sid === 'S19' || sid === 'S29';
    this.palace.setPlinthsVisible(showPlinths);

    // 3. Entrance Door & S01/S02/S37/S38 props
    const stampTime = this.syncTimes['S01_five'];
    const showDoorStamp = camT >= stampTime && camT < 144.0;
    this.palace.entrance.doorStamp.visible = showDoorStamp;
    if (showDoorStamp && camT < 5.0) {
      const sl = slamOffset(twosT, stampTime);
      this.palace.entrance.doorStamp.scale.set(sl.scaleXZ, sl.scaleY, 1);
      this.palace.entrance.doorPanel.position.x = sl.shakeX;
    } else {
      this.palace.entrance.doorStamp.scale.set(1, 1, 1);
      this.palace.entrance.doorPanel.position.x = 0;
    }

    // S02 Question Tag "TRY?"
    const tagDropTime = this.syncTimes['S02_without'];
    if (sid === 'S02' || (sid === 'S01' && camT > 4.2)) {
      this.palace.entrance.questionTag.visible = true;
      if (twosT < tagDropTime) {
        this.palace.entrance.questionTag.position.set(1.06, 1.02, 0.11);
        this.palace.entrance.questionTag.rotation.z = Math.sin(twosT * 6.0) * 0.12;
      } else {
        const dropP = stepLinear(twosT, tagDropTime, tagDropTime + 0.30);
        this.palace.entrance.questionTag.position.set(1.06, THREE.MathUtils.lerp(1.02, 0.15, dropP * dropP), 0.11);
        this.palace.entrance.questionTag.rotation.z = dropP * 0.4;
      }
    } else {
      this.palace.entrance.questionTag.visible = false;
    }

    // Front door angle (closed in S01-S02, opens at S03 "opening", closed in S36, opens in S37)
    let doorOpen = 0;
    if (camT >= this.syncTimes['S03_opening'] && camT < 20.0) {
      doorOpen = stepLinear(twosT, this.syncTimes['S03_opening'], this.syncTimes['S03_opening'] + 1.05);
    } else if (camT >= 147.35) {
      doorOpen = stepLinear(twosT, 147.35, 148.55);
    }
    this.palace.entrance.doorPivot.rotation.y = doorOpen * -1.45;

    // 4. OBJECT 1: PENGUIN (S04 & S37-S38)
    const pengBoil = idleBoilAngle(frameIndex, 101);
    if (camT < 144.0) {
      // S04: Standing at (0, 0, -2.4), leans on "penguin", slides sunglasses down & back on "sunglasses"
      const leanStart = this.syncTimes['S04_penguin'];
      const glassStart = this.syncTimes['S04_sunglasses'];
      const leanPhase = twosT >= leanStart ? (twosT - leanStart) * 3.2 : 0;
      let slide = 0;
      if (twosT >= glassStart && twosT < glassStart + 0.75) {
        const gp = (twosT - glassStart) / 0.75;
        slide = gp < 0.5 ? gp * 2 : (1 - gp) * 2;
      }
      this.palace.entrance.penguin.update(twosT, {
        leanPhase,
        glassesSlide: slide,
        walkStepOffset: new THREE.Vector3(0, 0, -2.4),
        boilAngle: pengBoil,
      });
      this.palace.entrance.checkStamp.visible = false;
    } else {
      // S37: Penguin hidden completely behind console table + plant/parcel (-1.16, 0, -2.02)
      // S38 (149.02 -> 152.52): Steps out in 3 steps on twos, leans, slides glasses, Leaf check stamp lands!
      const stepP = stepLinear(twosT, 149.02, 149.85);
      const px = THREE.MathUtils.lerp(-1.16, 0.0, stepP);
      const pz = THREE.MathUtils.lerp(-2.02, -2.40, stepP);
      const stepHop = stepP > 0 && stepP < 1 ? Math.abs(Math.sin(stepP * Math.PI * 3)) * 0.06 : 0;
      const leanPhase = twosT >= 149.85 ? (twosT - 149.85) * 3.5 : 0;

      let slide = 0;
      if (twosT >= 150.35 && twosT < 151.05) {
        const gp = (twosT - 150.35) / 0.70;
        slide = gp < 0.5 ? gp * 2 : (1 - gp) * 2;
      }
      this.palace.entrance.penguin.update(twosT, {
        leanPhase,
        glassesSlide: slide,
        walkStepOffset: new THREE.Vector3(px, stepHop, pz),
        boilAngle: pengBoil,
      });

      // Check stamp lands exactly 0.5s after sunglasses' second push (151.05 + 0.5 = 151.55)
      const checkShow = twosT >= 151.52;
      this.palace.entrance.checkStamp.visible = checkShow;
      if (checkShow) {
        const sl = slamOffset(twosT, 151.52);
        this.palace.entrance.checkStamp.scale.set(sl.scaleXZ, sl.scaleY, 1);
      }
    }

    // 5. OBJECT 2: GIANT BANANA & SOFA (S05)
    const tipP =
      twosT >= this.syncTimes['S05_giant'] && twosT < 22.0
        ? Math.sin(stepLinear(twosT, this.syncTimes['S05_giant'], this.syncTimes['S05_giant'] + 0.7) * Math.PI)
        : 0;
    const dipP =
      twosT >= this.syncTimes['S05_banana'] && twosT < 22.0
        ? Math.sin(stepLinear(twosT, this.syncTimes['S05_banana'], this.syncTimes['S05_banana'] + 0.55) * Math.PI)
        : 0;
    this.palace.living.banana.update(twosT, tipP, idleBoilAngle(frameIndex, 202));
    this.palace.living.sofa.update(dipP);

    // 6. OBJECT 3: DIAMOND FRIDGE (S06)
    this.palace.kitchen.diamonds.update(frameIndex, twosT, this.syncTimes['S06_diamonds']);

    // 7. OBJECT 4: CROCODILE (S07)
    this.palace.bathroom.crocodile.update(
      frameIndex,
      this.syncTimes['S07_crocodile'],
      twosT,
      idleBoilAngle(frameIndex, 404)
    );

    // 8. OBJECT 5: ELEPHANT & BED (S08-S09) - 3 jumps!
    const jumpStart = this.syncTimes['S08_jumping'];
    const jumpDur = 1.15;
    let jumpY = 0;
    let squashY = 1;
    let trunkLift = 0;
    let bedDip = 0;
    if (twosT >= jumpStart && twosT < jumpStart + jumpDur * 3) {
      const local = (twosT - jumpStart) % jumpDur;
      const p = local / jumpDur;
      if (p < 0.14) {
        squashY = 0.88;
        bedDip = 0.6;
      } else if (p < 0.52) {
        const up = (p - 0.14) / 0.38;
        jumpY = Math.sin(up * Math.PI * 0.5) * 1.1;
        trunkLift = up;
      } else if (p < 0.64) {
        jumpY = 1.1;
        trunkLift = 1.0;
      } else if (p < 0.88) {
        const dn = (p - 0.64) / 0.24;
        jumpY = (1 - dn * dn) * 1.1;
        trunkLift = 1 - dn;
      } else {
        squashY = 0.88;
        bedDip = 1.0;
      }
    }
    this.palace.bedroom.elephant.update({
      jumpY,
      squashY,
      trunkLift,
      boilAngle: idleBoilAngle(frameIndex, 505),
    });
    this.palace.bedroom.bed.update(bedDip);

    // 9. BRAIN ROOM & SECONDARY ZONES
    // S10: 5 wall frames swing 1 deg on twos at "environments"
    const frameWobble = linearWobble(twosT, this.syncTimes['S10_environments'], 0.9, 0.04);
    for (let i = 0; i < 5; i++) {
      this.brainWorld.wallFrames[i].rotation.z = frameWobble * (i % 2 === 0 ? 1 : -1);
    }

    // S15: Walker head lid opens
    const lidOpen =
      sid === 'S15'
        ? stepLinear(twosT, this.syncTimes['S15_virtual'], this.syncTimes['S15_virtual'] + 0.55)
        : 0;
    this.brainWorld.walkerChair.update({
      sitting: true,
      lidOpen,
      boilAngle: idleBoilAngle(frameIndex, 606),
    });

    // S11-S13: Childhood Ghost
    const sheetSlide = stepLinear(twosT, this.syncTimes['S11_years'], this.syncTimes['S11_years'] + 0.7);
    this.brainWorld.dustSheet.position.x = sheetSlide * 4.5;
    this.brainWorld.dustSheet.visible = sheetSlide < 0.99;
    this.brainWorld.ghostSofa.visible = twosT >= this.syncTimes['S12_furniture'];
    this.brainWorld.ghostDoor.visible = twosT >= this.syncTimes['S12_doors'];
    const dotsP = stepLinear(twosT, this.syncTimes['S12_another'] - 0.6, this.syncTimes['S12_another'] + 0.4);
    this.brainWorld.ghostPathDots.forEach((d, idx) => {
      d.visible = dotsP > idx / this.brainWorld.ghostPathDots.length;
    });
    const showGhostBox = twosT >= this.syncTimes['S13_store'];
    this.brainWorld.ghostBox.visible = showGhostBox;
    if (showGhostBox) {
      const boxDrop = stepLinear(twosT, this.syncTimes['S13_store'], this.syncTimes['S13_store'] + 0.25);
      this.brainWorld.ghostBox.position.y = THREE.MathUtils.lerp(2.4, 1.15, boxDrop * boxDrop);
    }
    this.brainWorld.ghostWalker.update({
      walkPhase: sid === 'S12' || sid === 'S13' ? twosT * 5.0 : 0,
      boilAngle: idleBoilAngle(frameIndex, 707),
    });

    // S14: Athletes sign swing & tallest card tower grows 3 steps
    this.brainWorld.athletesSign.rotation.x = linearWobble(twosT, this.syncTimes['S14_palace'], 0.9, 0.15);
    const towerP = stepLinear(twosT, this.syncTimes['S14_enormous'], this.syncTimes['S14_enormous'] + 0.6);
    this.brainWorld.tallestTowerParts.forEach((part, i) => {
      part.visible = towerP > i * 0.3;
    });

    // S16-S18: Known Places flags & Page-Curl route drawing
    this.brainWorld.flagHouse.visible = twosT >= this.syncTimes['S16_know'];
    this.brainWorld.flagSchool.visible = twosT >= this.syncTimes['S17_school'];
    this.brainWorld.flagGame.visible = twosT >= this.syncTimes['S17_game'];
    if (sid === 'S18') {
      const curlP = stepLinear(twosT, 70.72, 71.35);
      this.brainWorld.mapCurlPivot.visible = curlP < 0.98;
      this.brainWorld.mapCurlPivot.rotation.x = -curlP * Math.PI * 0.9;
      const routeP = stepLinear(twosT, this.syncTimes['S18_route'], 72.7);
      this.brainWorld.routeDots.forEach((dot, i) => {
        dot.visible = routeP > i / this.brainWorld.routeDots.length;
      });
    } else {
      this.brainWorld.mapCurlPivot.visible = false;
      this.brainWorld.routeDots.forEach((d) => (d.visible = false));
    }

    // S19 & S29: Route Walker + Plinths + Flags
    if (sid === 'S19') {
      this.routeWalker.group.visible = true;
      const wp = stepLinear(twosT, 73.14, 77.0);
      const pts = [
        new THREE.Vector3(0, 0, -1.8),
        new THREE.Vector3(0.4, 0, -5.0),
        new THREE.Vector3(4.2, 0, -5.2),
        new THREE.Vector3(4.2, 0, -8.8),
        new THREE.Vector3(0.8, 0, -9.2),
      ];
      const segIdx = Math.min(3, Math.floor(wp * 4));
      const localP = wp * 4 - segIdx;
      this.routeWalker.group.position.lerpVectors(pts[segIdx], pts[segIdx + 1], localP);
      this.routeWalker.update({ walkPhase: twosT * 6, boilAngle: idleBoilAngle(frameIndex, 808) });

      this.palace.plinths.forEach((pl, i) => {
        const appearT = 73.8 + i * 0.65;
        pl.box.visible = twosT >= appearT;
        pl.box.position.y = THREE.MathUtils.lerp(1.4, 0.88, stepLinear(twosT, appearT, appearT + 0.25));
        pl.flag.visible = false;
      });
    } else if (sid === 'S29') {
      this.routeWalker.group.visible = true;
      const passP = ((twosT - 114.13) / 2.2) % 1.0;
      const pts = [
        new THREE.Vector3(0, 0, -1.8),
        new THREE.Vector3(0.3, 0, -5.2),
        new THREE.Vector3(4.6, 0, -5.2),
        new THREE.Vector3(4.6, 0, -9.0),
        new THREE.Vector3(0.5, 0, -9.0),
      ];
      const segIdx = Math.min(3, Math.floor(passP * 4));
      const localP = passP * 4 - segIdx;
      this.routeWalker.group.position.lerpVectors(pts[segIdx], pts[segIdx + 1], localP);
      this.routeWalker.update({ walkPhase: twosT * 10, boilAngle: idleBoilAngle(frameIndex, 809) });

      this.palace.plinths.forEach((pl, i) => {
        pl.box.visible = true;
        pl.box.position.y = 0.88;
        pl.flag.visible = twosT >= this.syncTimes['S29_retrieving'] + i * 0.35;
      });
    } else {
      this.routeWalker.group.visible = false;
    }

    // S20-S21: Ordinary -> Ridiculous Mug
    this.brainWorld.boringTag.rotation.z = Math.sin(twosT * 5) * 0.1;
    this.brainWorld.zzzStamp.visible = twosT >= this.syncTimes['S20_ordinary'];
    const isRidic = twosT >= this.syncTimes['S21_ridiculous'];
    this.brainWorld.mugGroup.rotation.y = isRidic
      ? 0
      : twosT >= this.syncTimes['S20_trick']
        ? Math.PI * 0.5 * stepLinear(twosT, this.syncTimes['S20_trick'], this.syncTimes['S20_trick'] + 0.4)
        : 0;
    this.brainWorld.mugLegs.visible = isRidic;
    this.brainWorld.mugGlasses.visible = isRidic;
    const mugScale =
      1.0 + 2.35 * stepLinear(twosT, this.syncTimes['S21_enormous'], this.syncTimes['S21_enormous'] + 0.7);
    this.brainWorld.mugGroup.scale.setScalar(mugScale);
    const mugWalk = stepLinear(twosT, this.syncTimes['S21_movement'], this.syncTimes['S21_movement'] + 1.0);
    this.brainWorld.mugGroup.position.set(0, 0.85 + (isRidic ? 0.19 * mugScale : 0), mugWalk * 0.9);
    this.brainWorld.klonkStamp.visible = twosT >= this.syncTimes['S21_sound'];

    // S22: Biology slab rattle
    if (sid === 'S22') {
      this.brainWorld.bioSlab.rotation.z = linearWobble(twosT, this.syncTimes['S22_mitochondria'], 0.9, 0.1);
      const slump = stepLinear(twosT, this.syncTimes['S22_energy'], this.syncTimes['S22_energy'] + 0.4);
      this.brainWorld.bioSlab.rotation.x = -0.15 - slump * 0.35;
    }

    // S23-S24: Kitchen Mitochondria Power Station (200 -> 2000 workers + lamp flash + crumbling slab!)
    if (showPlant) {
      const multP = stepLinear(twosT, this.syncTimes['S23_thousands'], this.syncTimes['S23_thousands'] + 0.8);
      const workerCount = sid === 'S24' ? 2000 : Math.round(200 + multP * 1800);
      const flashFrame = Math.abs(twosT - (this.syncTimes['S23_thousands'] + 0.5)) < 0.09;
      this.cellPlant.crumbleSlab.visible = sid === 'S24';
      const crumbleP = sid === 'S24' ? stepLinear(twosT, this.syncTimes['S24_abstract'], this.syncTimes['S24_abstract'] + 1.4) : 0;
      this.cellPlant.update({
        twosTime: twosT,
        frameIndex,
        workerCount,
        gearAngle: -twosT * 2.4,
        lampOn: twosT >= this.syncTimes['S23_thousands'] + 0.35,
        lampFlash: flashFrame,
        crumbleProgress: crumbleP,
      });
    }

    // S25-S28: Shadowbox doors, School, Museum, Supermarket
    this.brainWorld.shadowboxDoors.forEach((door, i) => {
      const openT = 105.11 + i * 0.25;
      door.rotation.y = -stepLinear(twosT, openT, openT + 0.40) * 1.55;
    });
    if (this.museumDiorama.dinoJawBone) {
      this.museumDiorama.dinoJawBone.rotation.x =
        twosT >= this.syncTimes['S27_museum'] ? 0.34 : 0.08;
    }
    const cartP = stepLinear(twosT, this.syncTimes['S28_entire'], 113.8);
    this.supermarketDiorama.cart.position.z = THREE.MathUtils.lerp(1.1, -0.7, cartP);
    this.supermarketDiorama.flipSignPivot.rotation.y =
      twosT >= this.syncTimes['S28_language'] ? Math.PI : 0;

    // S30-S35: Calendar, Camera, Plaques, Headset
    this.evidenceStage.stamp2017.visible = twosT >= this.syncTimes['S30_seventeen'];
    const weeksP = stepLinear(twosT, this.syncTimes['S31_weeks'], 126.2);
    this.evidenceStage.weekRows.forEach((row, i) => {
      setCalendarRowLit(row, weeksP > i / 6);
    });
    const barImp = stepLinear(twosT, this.syncTimes['S31_improved'], this.syncTimes['S31_improved'] + 0.4);
    this.evidenceStage.barAfter.scale.y = 1.0 + barImp * 2.2;
    this.evidenceStage.barAfter.position.y = -1.85 + barImp * 0.44;
    this.evidenceStage.barHighlight.visible =
      sid === 'S32' && Math.abs(twosT - this.syncTimes['S32_detectable']) < 0.25;
    this.evidenceStage.tinyWalker.update({
      walkPhase: twosT * 8,
      boilAngle: idleBoilAngle(frameIndex, 909),
    });

    if (camT >= 127.83) {
      const pageCurl = stepLinear(twosT, 127.83, 128.45);
      this.evidenceStage.page1Pivot.rotation.x = pageCurl * Math.PI * 0.95;
      this.evidenceStage.page1Pivot.visible = pageCurl < 0.95;
    } else {
      this.evidenceStage.page1Pivot.rotation.x = 0;
      this.evidenceStage.page1Pivot.visible = true;
    }

    this.evidenceStage.notThisStamp.visible = twosT >= this.syncTimes['S33_isnt'];
    if (this.evidenceStage.clockHands[0]) {
      const steps = Math.floor(stepLinear(twosT, this.syncTimes['S34_revisit'], 139.0) * 3);
      this.evidenceStage.clockHands[0].rotation.z = -steps * 0.8;
    }
    this.evidenceStage.headset.update(linearWobble(twosT, this.syncTimes['S35_headset'] - 1.5, 0.8, 0.05));
    this.evidenceStage.headsetStamp.visible = twosT >= this.syncTimes['S35_clearly'];

    return sid;
  }

  public renderFrame(frameIndex: number): RenderReport {
    const t0 = performance.now();
    const shotId = this.applyFrameState(frameIndex);
    this.renderer.render(this.scene, this.camera);
    const renderMs = performance.now() - t0;

    return {
      frameIndex,
      timeSec: cameraTime(frameIndex),
      shotId,
      renderMs: Math.round(renderMs * 100) / 100,
      triangles: this.renderer.info.render.triangles,
    };
  }

  /**
   * SECTION 15: Renders the 3 exact Look-Dev Checkpoint frames:
   * 1) Entrance with Penguin centered, door open behind camera
   * 2) Kitchen with open Diamond Fridge
   * 3) Mitochondria Power Station + 2000 workers on Kitchen counter
   */
  public renderLookDevFrame(which: 1 | 2 | 3): RenderReport {
    const frameMap: Record<1 | 2 | 3, number> = {
      1: Math.round(12.2 * FPS), // S04 Penguin centered in entrance (feet to head)
      2: Math.round(22.1 * FPS), // S06 Kitchen open fridge full of diamonds
      3: Math.round(98.2 * FPS), // S23 Power station + 2000 workers on counter
    };
    return this.renderFrame(frameMap[which]);
  }
}
