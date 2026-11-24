import * as THREE from 'three';
import opentype from 'opentype.js';
import { PALETTE, PALETTE_PAIRS, PaletteColorKey } from '../palette';
import { createPalaceToonMaterial, makeBrassMaterial } from '../render/toon';
import { makeRoundedBox } from '../objects/primitives';

let cachedFont: opentype.Font | null = null;

export async function loadPalaceFont(
  url = '/fonts/BricolageGrotesque-Bold.ttf'
): Promise<opentype.Font> {
  if (cachedFont) return cachedFont;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load font (${res.status}) from ${url}`);
  }
  const buf = await res.arrayBuffer();
  cachedFont = opentype.parse(buf);
  return cachedFont;
}

export function getLoadedFont(): opentype.Font {
  if (!cachedFont) {
    throw new Error('Font not loaded yet; call loadPalaceFont() before building 3D text');
  }
  return cachedFont;
}

function opentypePathToShapes(path: opentype.Path): THREE.Shape[] {
  const shapePath = new THREE.ShapePath();
  for (const cmd of path.commands) {
    if (cmd.type === 'M') {
      shapePath.moveTo(cmd.x, cmd.y);
    } else if (cmd.type === 'L') {
      shapePath.lineTo(cmd.x, cmd.y);
    } else if (cmd.type === 'Q') {
      shapePath.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
    } else if (cmd.type === 'C') {
      shapePath.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
    } else if (cmd.type === 'Z') {
      if (shapePath.currentPath) {
        shapePath.currentPath.closePath();
      }
    }
  }
  return shapePath.toShapes();
}

/**
 * Extrudes clean architectural 3D typography using Bricolage Grotesque Bold.
 */
export function buildExtrudedTextMesh(
  text: string,
  opts: {
    size?: number;
    depth?: number;
    bevel?: number;
    colorKey?: PaletteColorKey;
    outlineThickness?: number;
    unlit?: boolean;
  } = {}
): THREE.Group {
  const font = getLoadedFont();
  const size = opts.size ?? 0.22;
  const depth = opts.depth ?? Math.min(0.036, size * 0.3);
  const bevel = opts.bevel ?? Math.min(0.005, size * 0.025);
  const colorKey = opts.colorKey ?? 'coal';

  const group = new THREE.Group();
  const path = new opentype.Path();
  let cursorX = 0;
  let prevGlyph: opentype.Glyph | null = null;
  const scale = size / font.unitsPerEm;
  const extraTrack = size * 0.035;

  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    if (prevGlyph) {
      cursorX += font.getKerningValue(prevGlyph, glyph) * scale;
    }
    const gPath = glyph.getPath(cursorX, 0, size);
    path.extend(gPath);
    cursorX += (glyph.advanceWidth ?? font.unitsPerEm * 0.5) * scale + extraTrack;
    prevGlyph = glyph;
  }

  for (const cmd of path.commands) {
    if ('y' in cmd && typeof cmd.y === 'number') cmd.y = -cmd.y;
    if ('y1' in cmd && typeof cmd.y1 === 'number') cmd.y1 = -cmd.y1;
    if ('y2' in cmd && typeof cmd.y2 === 'number') cmd.y2 = -cmd.y2;
  }

  const shapes = opentypePathToShapes(path);
  if (shapes.length === 0) return group;

  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: bevel > 0.0005,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 10,
  });

  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const cx = (bb.min.x + bb.max.x) * 0.5;
  const cy = (bb.min.y + bb.max.y) * 0.5;
  geo.translate(-cx, -cy, -depth * 0.5);

  const pair = PALETTE_PAIRS[colorKey];
  const mat = createPalaceToonMaterial({
    baseHex: pair.base,
    shadeHex: pair.shade,
    unlit: opts.unlit ?? false,
    roughness: 0.42,
    metalness: 0.06,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = size >= 0.1;
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

/**
 * Hanging or mounted architectural plaque with subtle brass bezel trim.
 */
export function makeSignPlaque(
  text: string,
  opts: {
    width?: number;
    height?: number;
    plateColor?: PaletteColorKey;
    textColor?: PaletteColorKey;
    textSize?: number;
    strings?: boolean;
  } = {}
): THREE.Group {
  const w = opts.width ?? 1.2;
  const h = opts.height ?? 0.36;
  const plateColor = opts.plateColor ?? 'mustard';
  const textColor = opts.textColor ?? 'coal';
  const textSize = opts.textSize ?? 0.16;

  const g = new THREE.Group();
  const pair = PALETTE_PAIRS[plateColor];

  // Outer brass frame
  const rim = new THREE.Mesh(
    makeRoundedBox(w + 0.03, h + 0.03, 0.032, 0.014),
    makeBrassMaterial('#B8964A')
  );
  rim.position.z = -0.004;
  rim.castShadow = true;
  rim.receiveShadow = true;
  g.add(rim);

  const board = new THREE.Mesh(
    makeRoundedBox(w, h, 0.038, 0.012),
    createPalaceToonMaterial({ baseHex: pair.base, shadeHex: pair.shade, roughness: 0.55 })
  );
  board.castShadow = true;
  board.receiveShadow = true;
  g.add(board);

  const letters = buildExtrudedTextMesh(text, {
    size: textSize,
    depth: 0.02,
    bevel: 0.0035,
    colorKey: textColor,
  });
  letters.position.z = 0.022;
  g.add(letters);

  if (opts.strings) {
    const wireMat = makeBrassMaterial('#7E6E52');
    const strGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.46, 8);
    for (const sx of [-w * 0.36, w * 0.36]) {
      const s = new THREE.Mesh(strGeo, wireMat);
      s.position.set(sx, h * 0.5 + 0.22, 0);
      g.add(s);
    }
  }
  return g;
}

/**
 * Crisp stamped emblem or typography pressed cleanly onto a surface.
 */
export function makeStampMesh(
  text: string,
  opts: {
    size?: number;
    colorKey?: 'tomato' | 'cobalt' | 'leaf';
    withCircleCross?: boolean;
    radius?: number;
  } = {}
): THREE.Group {
  const colorKey = opts.colorKey ?? 'tomato';
  const size = opts.size ?? 0.16;
  const g = new THREE.Group();

  if (text.length > 0) {
    const letters = buildExtrudedTextMesh(text, {
      size,
      depth: 0.014,
      bevel: 0.0025,
      colorKey,
    });
    letters.position.z = 0.009;
    g.add(letters);
  }

  if (opts.withCircleCross) {
    const r = opts.radius ?? 0.28;
    const pair = PALETTE_PAIRS[colorKey];
    const stampMat = createPalaceToonMaterial({
      baseHex: pair.base,
      shadeHex: pair.shade,
      roughness: 0.48,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 10, 32), stampMat);
    ring.castShadow = true;
    g.add(ring);

    const bar = new THREE.Mesh(makeRoundedBox(r * 1.9, 0.04, 0.024, 0.008), stampMat);
    bar.rotation.z = Math.PI * 0.25;
    bar.position.z = 0.006;
    bar.castShadow = true;
    g.add(bar);
  }
  return g;
}

/**
 * Refined paper hang-tag with brass eyelet and cord.
 */
export function makePaperTag(
  text: string,
  opts: { textSize?: number; width?: number; height?: number } = {}
): THREE.Group {
  const w = opts.width ?? 0.28;
  const h = opts.height ?? 0.16;
  const g = new THREE.Group();

  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.12, 8),
    createPalaceToonMaterial({ colorKey: 'coal', roughness: 0.8 })
  );
  cord.position.y = -0.06;
  g.add(cord);

  const card = new THREE.Mesh(
    makeRoundedBox(w, h, 0.014, 0.006),
    createPalaceToonMaterial({
      baseHex: PALETTE.mustard,
      shadeHex: PALETTE.mustardShade,
      roughness: 0.62,
    })
  );
  card.position.y = -0.12 - h * 0.5;
  card.castShadow = true;
  card.receiveShadow = true;
  g.add(card);

  const eyelet = new THREE.Mesh(
    new THREE.TorusGeometry(0.014, 0.004, 8, 16),
    makeBrassMaterial()
  );
  eyelet.position.set(0, -0.135, 0.008);
  g.add(eyelet);

  const letters = buildExtrudedTextMesh(text, {
    size: opts.textSize ?? 0.065,
    depth: 0.009,
    bevel: 0.002,
    colorKey: 'coal',
  });
  letters.position.set(0, card.position.y, 0.011);
  g.add(letters);

  return g;
}

export function makeBlockText(
  text: string,
  opts: { size?: number; colorKey?: PaletteColorKey } = {}
): THREE.Group {
  const s = opts.size ?? 0.14;
  return buildExtrudedTextMesh(text, {
    size: s,
    depth: Math.min(0.048, s * 0.34),
    bevel: Math.min(0.005, s * 0.025),
    colorKey: opts.colorKey ?? 'coal',
  });
}
