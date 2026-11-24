import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createAsset as createFern } from '../assets/polyfork/fern-plant-1559b8.mjs';
import { preparePolyforkAsset } from '../assets/polyfork';
import { createPalaceToonMaterial, PalaceMaterialOptions } from '../render/toon';

/**
 * Creates a rounded box with smooth bevel segments.
 */
export function makeRoundedBox(
  w: number,
  h: number,
  d: number,
  radius = 0.02,
  segments = 3
): THREE.BufferGeometry {
  const safeR = Math.min(radius, w * 0.45, h * 0.45, d * 0.45);
  return new RoundedBoxGeometry(w, h, d, segments, safeR);
}

/**
 * Creates a studio PBR mesh (kept function name for drop-in compatibility across rooms/dioramas).
 */
export function makeOutlinedMesh(
  geometry: THREE.BufferGeometry,
  matOpts: PalaceMaterialOptions,
  _outlineThickness = 3.0,
  options: { castShadow?: boolean; receiveShadow?: boolean; name?: string } = {}
): THREE.Mesh {
  const mat = createPalaceToonMaterial(matOpts);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.name) mesh.name = options.name;
  return mesh;
}

let softShadowTex: THREE.CanvasTexture | null = null;

function getSoftShadowTexture(): THREE.CanvasTexture {
  if (softShadowTex) return softShadowTex;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.05,
    size * 0.5,
    size * 0.5,
    size * 0.5
  );
  grad.addColorStop(0, 'rgba(20, 16, 12, 0.34)');
  grad.addColorStop(0.55, 'rgba(20, 16, 12, 0.14)');
  grad.addColorStop(1, 'rgba(20, 16, 12, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  softShadowTex = new THREE.CanvasTexture(canvas);
  softShadowTex.colorSpace = THREE.SRGBColorSpace;
  return softShadowTex;
}

/**
 * Soft ambient-occlusion ground contact shadow decal.
 */
export function makeContactShadow(rx: number, rz: number, _shadeHex?: string): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(rx * 2.25, rz * 2.25);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: getSoftShadowTexture(),
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.004;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

/**
 * Creates a detailed Polyfork fern plant in a terracotta pot.
 */
export function makePottedPlant(targetHeight = 0.62): THREE.Group {
  const g = new THREE.Group();
  const fern = createFern({
    pot: '#D96348',
    frond: '#458B58',
    tip: '#69B477',
    soil: '#4B3A2C',
  });
  preparePolyforkAsset(fern, {
    targetHeight,
    groundY: true,
    centerXZ: true,
    roughness: 0.68,
  });
  g.add(fern);
  g.add(makeContactShadow(0.22, 0.22));
  return g;
}
