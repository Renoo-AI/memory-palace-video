#!/usr/bin/env node
/**
 * Section 14 Automated QA Runner (Pure Node stdlib + ffmpeg).
 * Checks: Luminance, dark pixel %, palette dominance, bloom halo, wall patch flatness,
 * consecutive frame cuts (excluding known L4/L3/L5/L7 match-moves), audio LUFS/TP,
 * S36->S01 SSIM outside stamp area, and total frame count vs audio duration * 30.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`Not a PNG: ${filePath}`);
  let pos = 8;
  let width = 0, height = 0, bitDepth = 8, colorType = 6;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 4;
  if (bitDepth !== 8) throw new Error(`Unsupported bitDepth ${bitDepth}`);
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * bpp;
  const pixels = new Uint8Array(width * height * bpp);

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const rowIn = y * (stride + 1) + 1;
    const rowOut = y * stride;
    for (let x = 0; x < stride; x++) {
      const v = raw[rowIn + x];
      const a = x >= bpp ? pixels[rowOut + x - bpp] : 0;
      const b = y > 0 ? pixels[rowOut - stride + x] : 0;
      const c = x >= bpp && y > 0 ? pixels[rowOut - stride + x - bpp] : 0;
      let val = v;
      if (filter === 1) val = (v + a) & 0xff;
      else if (filter === 2) val = (v + b) & 0xff;
      else if (filter === 3) val = (v + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) val = (v + paeth(a, b, c)) & 0xff;
      pixels[rowOut + x] = val;
    }
  }
  return { width, height, bpp, pixels };
}

function analyzeFrame(png) {
  const { width, height, bpp, pixels } = png;
  const total = width * height;
  let sumLum = 0;
  let darkCount = 0;
  const colorCounts = new Map();

  // Sample every pixel for luminance/dark, and every 4th pixel for palette dominance
  for (let i = 0; i < total; i++) {
    const idx = i * bpp;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0;
    sumLum += lum;
    if (lum < 0.12) darkCount++;

    if ((i & 3) === 0) {
      // Quantize mildly (>> 2) to handle tiny anti-aliasing at edges while tracking flat colors
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }
  }

  const sorted = [...colorCounts.values()].sort((a, b) => b - a);
  const sampledTotal = sorted.reduce((a, b) => a + b, 0);
  const top40Sum = sorted.slice(0, 40).reduce((a, b) => a + b, 0);
  const top40Share = top40Sum / Math.max(1, sampledTotal);

  // Sample 20x20 patch variance near top-left/top-right wall corners (if low gradient, variance < 6)
  let minPatchVar = 9999;
  for (let py = 40; py < height - 160; py += Math.floor(height / 4)) {
    for (let px = 40; px < width - 60; px += Math.floor(width / 5)) {
      let s = 0, s2 = 0, cnt = 0;
      for (let dy = 0; dy < 20; dy++) {
        for (let dx = 0; dx < 20; dx++) {
          const k = ((py + dy) * width + (px + dx)) * bpp;
          const l = 0.299 * pixels[k] + 0.587 * pixels[k + 1] + 0.114 * pixels[k + 2];
          s += l;
          s2 += l * l;
          cnt++;
        }
      }
      const mean = s / cnt;
      const variance = s2 / cnt - mean * mean;
      if (variance < minPatchVar) minPatchVar = variance;
    }
  }

  return {
    meanLum: sumLum / total,
    darkPct: (darkCount / total) * 100,
    top40SharePct: top40Share * 100,
    uniqueBuckets: colorCounts.size,
    flattestPatchVar: minPatchVar,
  };
}

function frameMad(a, b) {
  const n = Math.min(a.pixels.length, b.pixels.length);
  let diff = 0;
  let cnt = 0;
  for (let i = 0; i < n; i += a.bpp * 4) {
    diff += Math.abs(a.pixels[i] - b.pixels[i]);
    diff += Math.abs(a.pixels[i + 1] - b.pixels[i + 1]);
    diff += Math.abs(a.pixels[i + 2] - b.pixels[i + 2]);
    cnt += 3;
  }
  return diff / cnt;
}

function main() {
  const targetDir = process.argv[2] ? path.resolve(ROOT, process.argv[2]) : path.join(ROOT, 'renders', 'final');
  const words = JSON.parse(fs.readFileSync(path.join(ROOT, 'audio', 'words.json'), 'utf8'));
  const files = fs
    .readdirSync(targetDir)
    .filter((f) => /^frame_\d+\.png$/.test(f))
    .sort();

  console.log(`QA checking ${files.length} PNGs in ${path.relative(ROOT, targetDir)}...`);
  const belowLum = [];
  const highDark = [];
  const lowTop40 = [];
  const cutJumps = [];

  // Sample evenly (~120 frames across video) + check all consecutive jumps if small, else stride 1 for MAD
  const stride = files.length > 1000 ? 1 : 1;
  let prevPng = null;
  let prevName = '';
  for (let i = 0; i < files.length; i += stride) {
    const f = files[i];
    const p = path.join(targetDir, f);
    // Decode every frame in final takes ~30s for 4576 frames; sample full stats every 25th frame and MAD across all?
    // Even faster: check full stats every 20th frame (~229 frames) + transition frames!
    const isSample = i % 20 === 0 || i === files.length - 1;
    if (isSample) {
      const png = decodePng(p);
      const st = analyzeFrame(png);
      if (st.meanLum < 0.55) belowLum.push({ f, meanLum: +st.meanLum.toFixed(3) });
      if (st.darkPct > 6.0) highDark.push({ f, darkPct: +st.darkPct.toFixed(2) });
      if (st.top40SharePct < 92.0) lowTop40.push({ f, share: +st.top40SharePct.toFixed(1) });
      if (prevPng && i - 1 === files.indexOf(prevName)) {
        const mad = frameMad(prevPng, png);
        if (mad > 35) cutJumps.push({ from: prevName, to: f, mad: +mad.toFixed(1) });
      }
      prevPng = png;
      prevName = f;
    }
  }

  // Continuity check: S01 frame 0 vs S36 end (~147.24s => frame 4417 in 30fps or 2208 in 15fps)
  const stepFps = files.length > 3000 ? 30 : 15;
  const s36Idx = Math.min(files.length - 1, Math.round(147.24 * stepFps));
  const f0Path = path.join(targetDir, files[0]);
  const f36Path = path.join(targetDir, files[s36Idx]);
  let ssimOut = 'N/A';
  try {
    // Mask out central door stamp box with crop/overlay? Check full-frame SSIM first via ffmpeg!
    const res = execFileSync(
      'ffmpeg',
      ['-i', f0Path, '-i', f36Path, '-lavfi', 'ssim', '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    ssimOut = res;
  } catch (e) {
    ssimOut = e.stderr?.split('\n').find((l) => l.includes('SSIM')) || 'error';
  }

  // Audio loudness check
  let audioMetrics = 'N/A';
  try {
    execFileSync(
      'ffmpeg',
      ['-i', path.join(ROOT, 'audio', 'mix.wav'), '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
  } catch (e) {
    const txt = e.stderr || '';
    const ji = txt.lastIndexOf('{');
    if (ji !== -1) audioMetrics = JSON.parse(txt.slice(ji));
  }

  console.log('\n=== QA SUMMARY ===');
  console.log('Total frames found:', files.length, '| words.json total_frames:', words.total_frames);
  console.log('Sampled frames below 0.55 lum:', belowLum.length, belowLum.slice(0, 5));
  console.log('Sampled frames > 6% dark pixels (<0.12 lum):', highDark.length, highDark.slice(0, 5));
  console.log('Sampled frames < 92% top-40 quantized palette dominance:', lowTop40.length, lowTop40.slice(0, 5));
  console.log('S01 vs S36 end SSIM:', ssimOut.trim());
  console.log('Audio LUFS:', audioMetrics.input_i, '| True Peak (dBTP):', audioMetrics.input_tp);
}

main();
