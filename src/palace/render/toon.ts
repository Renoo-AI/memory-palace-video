import * as THREE from 'three';
import { PALETTE, PALETTE_PAIRS, PaletteColorKey, paletteColor } from '../palette';

export type PatternType =
  | 'none'
  | 'woodPlanks'
  | 'checkerTile'
  | 'wallpaperDots'
  | 'wallpaperStripes'
  | 'wallpaperDiamonds'
  | 'fabricStripes';

export interface PalaceMaterialOptions {
  colorKey?: PaletteColorKey;
  baseHex?: string;
  shadeHex?: string;
  allowHighlight?: boolean;
  highlightFactor?: number;
  pattern?: PatternType;
  patternHex?: string;
  patternShadeHex?: string;
  patternScale?: number;
  halftone?: boolean;
  doubleSide?: boolean;
  unlit?: boolean;
  vertexColors?: boolean;
  opacity?: number;
  transparent?: boolean;
  polygonOffset?: boolean;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  emissiveHex?: string;
  emissiveIntensity?: number;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

function makeSeededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function getProceduralTexture(
  pattern: PatternType,
  baseHex: string,
  accentHex: string,
  shadeHex: string,
  scale: number
): THREE.CanvasTexture | null {
  if (pattern === 'none') return null;
  const key = `${pattern}|${baseHex}|${accentHex}|${shadeHex}|${scale.toFixed(2)}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = makeSeededRandom(
    Array.from(key).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 17)
  );

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  if (pattern === 'woodPlanks') {
    const cols = 6;
    const colW = size / cols;
    const plankH = size / 2;
    const baseCol = new THREE.Color(baseHex);
    const shadeCol = new THREE.Color(shadeHex);

    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const offset = (c % 2) * (plankH * 0.5);
      for (let r = -1; r <= 2; r++) {
        const y = r * plankH + offset;
        const toneShift = (rand() - 0.5) * 0.09;
        const pCol = baseCol.clone().lerp(shadeCol, Math.max(0, 0.15 + toneShift));
        ctx.fillStyle = `#${pCol.getHexString()}`;
        ctx.fillRect(x + 1, y + 1, colW - 2, plankH - 2);

        // Subtle longitudinal wood grain lines
        ctx.strokeStyle = `rgba(110, 74, 42, 0.08)`;
        ctx.lineWidth = 1.5;
        for (let g = 0; g < 6; g++) {
          const gx = x + 6 + rand() * (colW - 12);
          ctx.beginPath();
          ctx.moveTo(gx, y);
          ctx.bezierCurveTo(
            gx + (rand() - 0.5) * 8,
            y + plankH * 0.33,
            gx + (rand() - 0.5) * 8,
            y + plankH * 0.66,
            gx,
            y + plankH
          );
          ctx.stroke();
        }

        // Crisp bevel seam
        ctx.fillStyle = `rgba(85, 58, 34, 0.24)`;
        ctx.fillRect(x, y, colW, 2);
        ctx.fillRect(x, y, 2, plankH);
      }
    }
  } else if (pattern === 'checkerTile') {
    const tiles = 4;
    const ts = size / tiles;
    for (let y = 0; y < tiles; y++) {
      for (let x = 0; x < tiles; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? baseHex : accentHex;
        ctx.fillRect(x * ts, y * ts, ts, ts);
        // Soft ceramic glaze sheen + subtle tonal variation
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x * ts + 4, y * ts + 4, ts - 8, ts - 8);
      }
    }
    // Crisp matte grout lines
    ctx.strokeStyle = 'rgba(130, 128, 122, 0.28)';
    ctx.lineWidth = 4;
    for (let i = 0; i <= tiles; i++) {
      const p = i * ts;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }
  } else if (pattern === 'wallpaperDots') {
    // Subtle plaster texture + delicate geometric dots
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(120,105,85,0.03)';
      ctx.fillRect(rand() * size, rand() * size, 3, 3);
    }
    const step = size / 6;
    ctx.fillStyle = accentHex;
    ctx.globalAlpha = 0.22;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const cx = x * step + (y % 2 === 0 ? step * 0.25 : step * 0.75);
        const cy = y * step + step * 0.5;
        ctx.beginPath();
        ctx.arc(cx % size, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  } else if (pattern === 'wallpaperStripes') {
    const stripes = 8;
    const sw = size / stripes;
    ctx.fillStyle = accentHex;
    ctx.globalAlpha = 0.14;
    for (let i = 0; i < stripes; i++) {
      ctx.fillRect(i * sw, 0, sw * 0.24, size);
    }
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < stripes; i++) {
      ctx.fillRect(i * sw + sw * 0.34, 0, sw * 0.06, size);
    }
    ctx.globalAlpha = 1;
  } else if (pattern === 'wallpaperDiamonds') {
    const step = size / 6;
    ctx.strokeStyle = accentHex;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 2;
    for (let y = -1; y <= 6; y++) {
      for (let x = -1; x <= 6; x++) {
        const cx = x * step + (y % 2) * (step * 0.5);
        const cy = y * step;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12);
        ctx.lineTo(cx + 12, cy);
        ctx.lineTo(cx, cy + 12);
        ctx.lineTo(cx - 12, cy);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  } else if (pattern === 'fabricStripes') {
    const stripes = 12;
    const sw = size / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? baseHex : accentHex;
      ctx.fillRect(i * sw, 0, sw, size);
    }
    // Fine woven linen cross-hatch
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 0; y < size; y += 4) {
      ctx.fillRect(0, y, size, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  const rep = pattern === 'checkerTile' ? 2.5 : pattern === 'woodPlanks' ? 2.2 : 2.0;
  tex.repeat.set(rep / Math.max(0.25, scale), rep / Math.max(0.25, scale));
  tex.anisotropy = 4;
  tex.needsUpdate = true;

  textureCache.set(key, tex);
  return tex;
}

/**
 * Creates a physical studio PBR material (replacing old flat toon shaders).
 * Keeps the exact signature expected across the palace codebase while providing
 * warm tactile matte, satin ceramic, wood grain, and tile sheen.
 */
export function createPalaceToonMaterial(
  opts: PalaceMaterialOptions
): THREE.MeshStandardMaterial {
  const pair = opts.colorKey ? PALETTE_PAIRS[opts.colorKey] : null;
  const baseHex = opts.baseHex ?? pair?.base ?? PALETTE.creamWall;
  const shadeHex = opts.shadeHex ?? pair?.shade ?? PALETTE.creamWallShade;

  const pat = opts.pattern ?? 'none';
  const tex =
    pat !== 'none'
      ? getProceduralTexture(
          pat,
          baseHex,
          opts.patternHex ?? baseHex,
          opts.patternShadeHex ?? shadeHex,
          opts.patternScale ?? 1.0
        )
      : null;

  const defaultRoughness =
    pat === 'checkerTile'
      ? 0.28
      : pat === 'woodPlanks'
        ? 0.56
        : opts.allowHighlight
          ? 0.34
          : 0.72;

  const mat = new THREE.MeshStandardMaterial({
    color: tex || opts.vertexColors ? new THREE.Color(0xffffff) : paletteColor(baseHex),
    map: tex ?? null,
    roughness: opts.roughness ?? defaultRoughness,
    metalness: opts.metalness ?? 0.02,
    side: opts.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1.0,
    vertexColors: opts.vertexColors ?? false,
  });

  if (opts.unlit) {
    mat.emissive = paletteColor(baseHex);
    mat.emissiveIntensity = 0.55;
    mat.roughness = 0.6;
  } else if (opts.emissiveHex) {
    mat.emissive = paletteColor(opts.emissiveHex);
    mat.emissiveIntensity = opts.emissiveIntensity ?? 0.35;
  }

  if (opts.polygonOffset) {
    mat.polygonOffset = true;
    mat.polygonOffsetFactor = -1;
    mat.polygonOffsetUnits = -1;
  }

  mat.userData.palaceBaseHex = baseHex;
  return mat;
}

export function setPalaceMaterialColor(
  mat: THREE.Material,
  baseHex: string,
  _shadeHex?: string
): void {
  if ('color' in mat && mat.color instanceof THREE.Color) {
    mat.color.copy(paletteColor(baseHex));
  }
  if ('emissive' in mat && mat.emissive instanceof THREE.Color && (mat as THREE.MeshStandardMaterial).emissiveIntensity > 0) {
    mat.emissive.copy(paletteColor(baseHex));
  }
}

export function makeBrassMaterial(hex = '#C9A24B'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    metalness: 0.86,
    roughness: 0.24,
  });
}

export function makeChromeMaterial(hex = '#D6DCE2'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    metalness: 0.9,
    roughness: 0.16,
  });
}

export function makeGlassMaterial(hex = '#A8D8EE', opacity = 0.34): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex),
    roughness: 0.08,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    transparent: true,
    opacity,
  });
}

export function makeCrystalMaterial(hex = '#8EE3FF'): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex),
    roughness: 0.07,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    flatShading: true,
  });
}
