import * as THREE from 'three';
import { PALETTE, PaletteColorKey } from '../palette';
import { createPalaceToonMaterial, makeBrassMaterial, PatternType } from '../render/toon';
import { makeRoundedBox } from '../objects/primitives';

export const WALL_HEIGHT = 2.7;
export const WALL_THICKNESS = 0.14;
export const DOOR_WIDTH = 1.3;
export const DOOR_HEIGHT = 2.15;

function scalePlanarUVs(geo: THREE.BufferGeometry, width: number, height: number, metersPerTile = 1.6) {
  const uv = geo.attributes.uv;
  if (!uv) return;
  const rx = Math.max(0.5, width / metersPerTile);
  const ry = Math.max(0.5, height / metersPerTile);
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * rx, uv.getY(i) * ry);
  }
  uv.needsUpdate = true;
}

/**
 * Builds an architectural wall segment with optional doorway cutout, stepped baseboard,
 * crown molding, chamfered door architrave, and properly scaled wallpaper UVs.
 */
export function makeWallSegment(opts: {
  width: number;
  height?: number;
  thickness?: number;
  hasDoor?: boolean;
  doorOffset?: number;
  doorWidth?: number;
  doorHeight?: number;
  wallpaper?: PatternType;
  accentHex?: string;
  accentShadeHex?: string;
  baseboardColor?: PaletteColorKey;
  withFrame?: boolean;
}): THREE.Group {
  const g = new THREE.Group();
  const w = opts.width;
  const h = opts.height ?? WALL_HEIGHT;
  const t = opts.thickness ?? WALL_THICKNESS;
  const dw = opts.doorWidth ?? DOOR_WIDTH;
  const dh = opts.doorHeight ?? DOOR_HEIGHT;
  const dOff = opts.doorOffset ?? 0;

  const wallMatOpts = {
    colorKey: 'creamWall' as const,
    pattern: opts.wallpaper ?? 'none',
    patternHex: opts.accentHex ?? PALETTE.creamWall,
    patternShadeHex: opts.accentShadeHex ?? PALETTE.creamWallShade,
    patternScale: 1.0,
    roughness: 0.84,
  };

  const trimMat = createPalaceToonMaterial({
    baseHex: '#EFE6D2',
    shadeHex: '#DDD1B8',
    roughness: 0.56,
  });

  const addBaseAndCrown = (segW: number, cx: number) => {
    const bb = new THREE.Mesh(makeRoundedBox(segW, 0.12, t + 0.028, 0.008), trimMat);
    bb.position.set(cx, 0.06, 0);
    bb.castShadow = true;
    bb.receiveShadow = true;
    g.add(bb);

    const crown = new THREE.Mesh(makeRoundedBox(segW, 0.08, t + 0.032, 0.008), trimMat);
    crown.position.set(cx, h - 0.04, 0);
    crown.receiveShadow = true;
    g.add(crown);
  };

  if (!opts.hasDoor) {
    const geo = makeRoundedBox(w, h, t, 0.012);
    scalePlanarUVs(geo, w, h, 2.2);
    const wall = new THREE.Mesh(geo, createPalaceToonMaterial(wallMatOpts));
    wall.position.set(0, h * 0.5, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    g.add(wall);
    addBaseAndCrown(w, 0);
  } else {
    const leftEdge = -w * 0.5;
    const rightEdge = w * 0.5;
    const doorLeft = dOff - dw * 0.5;
    const doorRight = dOff + dw * 0.5;

    const leftW = Math.max(0, doorLeft - leftEdge);
    const rightW = Math.max(0, rightEdge - doorRight);

    if (leftW > 0.02) {
      const lGeo = makeRoundedBox(leftW, h, t, 0.012);
      scalePlanarUVs(lGeo, leftW, h, 2.2);
      const lw = new THREE.Mesh(lGeo, createPalaceToonMaterial(wallMatOpts));
      lw.position.set(leftEdge + leftW * 0.5, h * 0.5, 0);
      lw.castShadow = true;
      lw.receiveShadow = true;
      g.add(lw);
      addBaseAndCrown(leftW, leftEdge + leftW * 0.5);
    }

    if (rightW > 0.02) {
      const rGeo = makeRoundedBox(rightW, h, t, 0.012);
      scalePlanarUVs(rGeo, rightW, h, 2.2);
      const rw = new THREE.Mesh(rGeo, createPalaceToonMaterial(wallMatOpts));
      rw.position.set(doorRight + rightW * 0.5, h * 0.5, 0);
      rw.castShadow = true;
      rw.receiveShadow = true;
      g.add(rw);
      addBaseAndCrown(rightW, doorRight + rightW * 0.5);
    }

    const topH = h - dh;
    if (topH > 0.02) {
      const hGeo = makeRoundedBox(dw + 0.02, topH, t, 0.012);
      scalePlanarUVs(hGeo, dw, topH, 2.2);
      const lintel = new THREE.Mesh(hGeo, createPalaceToonMaterial(wallMatOpts));
      lintel.position.set(dOff, dh + topH * 0.5, 0);
      lintel.castShadow = true;
      lintel.receiveShadow = true;
      g.add(lintel);

      const crown = new THREE.Mesh(makeRoundedBox(dw + 0.02, 0.08, t + 0.032, 0.008), trimMat);
      crown.position.set(dOff, h - 0.04, 0);
      g.add(crown);
    }

    if (opts.withFrame !== false) {
      const frameMat = createPalaceToonMaterial({
        baseHex: '#EFE6D2',
        shadeHex: '#D8CCB4',
        roughness: 0.48,
      });
      const postGeo = makeRoundedBox(0.085, dh, t + 0.045, 0.014);
      const lPost = new THREE.Mesh(postGeo, frameMat);
      lPost.position.set(doorLeft + 0.03, dh * 0.5, 0);
      lPost.castShadow = true;
      lPost.receiveShadow = true;
      g.add(lPost);

      const rPost = new THREE.Mesh(postGeo, frameMat);
      rPost.position.set(doorRight - 0.03, dh * 0.5, 0);
      rPost.castShadow = true;
      rPost.receiveShadow = true;
      g.add(rPost);

      const headPost = new THREE.Mesh(makeRoundedBox(dw + 0.12, 0.095, t + 0.05, 0.014), frameMat);
      headPost.position.set(dOff, dh - 0.015, 0);
      headPost.castShadow = true;
      headPost.receiveShadow = true;
      g.add(headPost);

      // Subtle brass threshold strip
      const threshold = new THREE.Mesh(
        makeRoundedBox(dw - 0.04, 0.014, t + 0.03, 0.004),
        makeBrassMaterial('#B8964A')
      );
      threshold.position.set(dOff, 0.007, 0);
      threshold.receiveShadow = true;
      g.add(threshold);
    }
  }

  return g;
}

/**
 * Physically-scaled wood plank or ceramic checker tile floor plane.
 */
export function makeFloorPlane(opts: {
  width: number;
  depth: number;
  pattern: 'woodPlanks' | 'checkerTile';
  tileAccentHex?: string;
  tileShadeHex?: string;
}): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(opts.width, opts.depth);
  geo.rotateX(-Math.PI / 2);
  scalePlanarUVs(geo, opts.width, opts.depth, opts.pattern === 'checkerTile' ? 1.45 : 2.1);

  const mat =
    opts.pattern === 'woodPlanks'
      ? createPalaceToonMaterial({
          colorKey: 'floorWood',
          pattern: 'woodPlanks',
          patternHex: PALETTE.floorWoodShade,
          patternShadeHex: '#9C7850',
          patternScale: 1.0,
          roughness: 0.52,
        })
      : createPalaceToonMaterial({
          colorKey: 'paperWhite',
          pattern: 'checkerTile',
          patternHex: opts.tileAccentHex ?? PALETTE.sky,
          patternShadeHex: opts.tileShadeHex ?? PALETTE.skyShade,
          patternScale: 1.0,
          roughness: 0.28,
        });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

export function makeCeilingSlab(width: number, depth: number): THREE.Mesh {
  const geo = makeRoundedBox(width, 0.12, depth, 0.01);
  const mat = createPalaceToonMaterial({ colorKey: 'ceiling', roughness: 0.85 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

export function makeCorridor(
  lengthX: number,
  lengthZ: number,
  isAlongX: boolean
): THREE.Group {
  const g = new THREE.Group();
  const w = isAlongX ? lengthX : DOOR_WIDTH + 0.2;
  const d = isAlongX ? DOOR_WIDTH + 0.2 : lengthZ;

  const floor = makeFloorPlane({ width: w, depth: d, pattern: 'woodPlanks' });
  g.add(floor);

  const ceil = makeCeilingSlab(w, d);
  ceil.position.y = WALL_HEIGHT + 0.06;
  g.add(ceil);

  if (isAlongX) {
    const nWall = makeWallSegment({ width: w });
    nWall.position.set(0, 0, -d * 0.5);
    g.add(nWall);
    const sWall = makeWallSegment({ width: w });
    sWall.position.set(0, 0, d * 0.5);
    g.add(sWall);
  } else {
    const wWall = makeWallSegment({ width: d });
    wWall.rotation.y = Math.PI * 0.5;
    wWall.position.set(-w * 0.5, 0, 0);
    g.add(wWall);
    const eWall = makeWallSegment({ width: d });
    eWall.rotation.y = Math.PI * 0.5;
    eWall.position.set(w * 0.5, 0, 0);
    g.add(eWall);
  }

  return g;
}
