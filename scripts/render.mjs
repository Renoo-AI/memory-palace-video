import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/usr/local/share/bun-global/node_modules/playwright-core');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = path.join(ROOT, 'dist');
const CHROMIUM_EXEC =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function startStaticServer(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0];
      const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
      const fullPath = path.join(dir, rel);
      if (!fullPath.startsWith(dir) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const ext = path.extname(fullPath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      fs.createReadStream(fullPath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

function parseArgs(argv) {
  const args = {
    lookdev: false,
    thumbnail: false,
    keyframes: false,
    preview: false,
    final: false,
    force: false,
    workers: 4,
    start: 0,
    end: null,
    frames: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lookdev') args.lookdev = true;
    else if (a === '--thumbnail') args.thumbnail = true;
    else if (a === '--keyframes') args.keyframes = true;
    else if (a === '--preview') args.preview = true;
    else if (a === '--final') args.final = true;
    else if (a === '--force') args.force = true;
    else if (a === '--workers') args.workers = Number(argv[++i]) || 4;
    else if (a === '--start') args.start = Number(argv[++i]) || 0;
    else if (a === '--end') args.end = Number(argv[++i]);
    else if (a === '--frames') args.frames = argv[++i].split(',').map((n) => Number(n.trim()));
  }
  return args;
}

async function launchBrowser() {
  return chromium.launch({
    executablePath: CHROMIUM_EXEC,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      '--disable-gpu-sandbox',
    ],
  });
}

async function openRenderPage(browser, baseUrl, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.stack || e.message}`;
    errors.push(msg);
    console.error('[BROWSER]', msg);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const txt = `console.${msg.type()}: ${msg.text()}`;
      if (msg.type() === 'error') errors.push(txt);
      console.error('[BROWSER]', txt);
    }
  });

  await page.goto(`${baseUrl}/?headless=1&w=${width}&h=${height}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__PALACE__ && window.__PALACE__.ready), null, {
    timeout: 60000,
  });
  return { context, page, errors };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    throw new Error('dist/ not found. Run "npm run build" before scripts/render.mjs');
  }

  const { server, port } = await startStaticServer(DIST_DIR);
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await launchBrowser();

  try {
    if (args.lookdev) {
      const outDir = path.join(ROOT, 'renders', 'lookdev');
      fs.mkdirSync(outDir, { recursive: true });
      const { context, page, errors } = await openRenderPage(browser, baseUrl, 1920, 1080);

      const specs = [
        [1, 'frame1_entrance.png'],
        [2, 'frame2_kitchen.png'],
        [3, 'frame3_plant.png'],
      ];
      for (const [which, fname] of specs) {
        const rep = await page.evaluate((w) => window.__PALACE__.renderLookDevFrame(w), which);
        await page.waitForTimeout(30);
        const dest = path.join(outDir, fname);
        await page.screenshot({ path: dest, type: 'png', animations: 'disabled' });
        console.log(`LookDev ${which} -> ${fname}: ${rep.renderMs}ms, tris=${rep.triangles}`);
      }
      if (errors.length) console.log('LookDev browser errors:', errors);
      await context.close();
    }

    if (args.thumbnail) {
      const { context, page, errors } = await openRenderPage(browser, baseUrl, 1280, 720);
      const rep = await page.evaluate(() => window.__PALACE__.renderThumbnailFrame());
      await page.waitForTimeout(30);
      await page.screenshot({ path: path.join(ROOT, 'thumbnail.png'), type: 'png', animations: 'disabled' });
      console.log(`Thumbnail -> thumbnail.png: tris=${rep.triangles}`);
      if (errors.length) console.log('Thumbnail errors:', errors);
      await context.close();
    }

    if (args.keyframes) {
      const outDir = path.join(ROOT, 'renders', 'audit');
      fs.mkdirSync(outDir, { recursive: true });
      const { context, page, errors } = await openRenderPage(browser, baseUrl, 1280, 720);
      const wordsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'audio', 'words.json'), 'utf8'));
      const total = wordsData.total_frames;

      const sampleFrames = new Set([0, 75, 290, 395, 530, 665, 760, 880, 1015, 1120, 1174, 1175, 1230, 1360, 1455, 1458, 1650, 1779, 1780, 1895, 2100, 2230, 2317, 2318, 2500, 2603, 2710, 2950, 3070, 3153, 3154, 3270, 3320, 3380, 3480, 3616, 3617, 3780, 3890, 3980, 4120, 4260, 4324, 4325, 4417, 4470, 4520, total - 1]);
      for (const f of [...sampleFrames].sort((a, b) => a - b)) {
        if (f < 0 || f >= total) continue;
        const rep = await page.evaluate((idx) => window.__PALACE__.renderFrame(idx), f);
        await page.waitForTimeout(15);
        const fname = `f_${String(f).padStart(5, '0')}_${rep.shotId}.png`;
        await page.screenshot({ path: path.join(outDir, fname), type: 'png', animations: 'disabled' });
      }
      console.log(`Rendered ${sampleFrames.size} audit keyframes to renders/audit/`);
      if (errors.length) console.log('Audit errors:', errors);
      await context.close();
    }

    if (args.preview || args.final || args.frames) {
      const isFinal = args.final;
      const w = isFinal ? 1920 : 1280;
      const h = isFinal ? 1080 : 720;
      const step = isFinal ? 1 : 2; // preview at 15fps (step=2), final at 30fps (step=1)
      const outDir = path.join(
        ROOT,
        'renders',
        args.frames ? 'custom' : isFinal ? 'final' : 'preview'
      );
      fs.mkdirSync(outDir, { recursive: true });

      const wordsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'audio', 'words.json'), 'utf8'));
      const total = wordsData.total_frames;
      const end = args.end !== null ? Math.min(total - 1, args.end) : total - 1;

      const queue = [];
      if (args.frames) {
        for (const f of args.frames) {
          if (f >= 0 && f < total) queue.push({ frameIndex: f, seqIndex: f });
        }
      } else {
        let seq = 0;
        for (let f = args.start; f <= end; f += step) {
          const outPath = path.join(outDir, `frame_${String(seq).padStart(5, '0')}.png`);
          if (args.force || !fs.existsSync(outPath)) {
            queue.push({ frameIndex: f, seqIndex: seq });
          }
          seq++;
        }
      }

      const workers = Math.min(args.workers, Math.max(1, queue.length));
      const slowest = [];
      let completed = 0;
      const tStart = Date.now();
      let cursor = 0;

      console.log(
        `Rendering ${queue.length} frames (${w}x${h}) across ${workers} worker pages into ${path.relative(ROOT, outDir)}...`
      );

      await Promise.all(
        Array.from({ length: workers }, async (_, wid) => {
          const { context, page, errors } = await openRenderPage(browser, baseUrl, w, h);
          try {
            while (cursor < queue.length) {
              const job = queue[cursor++];
              if (!job) break;
              const outPath = path.join(
                outDir,
                `frame_${String(job.seqIndex).padStart(5, '0')}.png`
              );
              const t0 = Date.now();
              const rep = await page.evaluate((idx) => window.__PALACE__.renderFrame(idx), job.frameIndex);
              await page.screenshot({ path: outPath, type: 'png', animations: 'disabled' });
              const dt = Date.now() - t0;
              slowest.push({ frame: job.frameIndex, shot: rep.shotId, ms: dt, renderMs: rep.renderMs });
              if (slowest.length > 50) {
                slowest.sort((a, b) => b.ms - a.ms);
                slowest.length = 10;
              }
              completed++;
              if (completed % 100 === 0 || completed === queue.length) {
                const elapsed = (Date.now() - tStart) / 1000;
                const rate = completed / Math.max(0.1, elapsed);
                const eta = (queue.length - completed) / Math.max(0.01, rate);
                console.log(
                  `[w${wid}] ${completed}/${queue.length} (${((completed / queue.length) * 100).toFixed(1)}%) | ${rate.toFixed(2)} fps | ETA ${eta.toFixed(0)}s`
                );
              }
            }
            if (errors.length) console.log(`Worker ${wid} errors:`, errors.slice(0, 5));
          } finally {
            await context.close();
          }
        })
      );

      slowest.sort((a, b) => b.ms - a.ms);
      const perfPath = path.join(outDir, 'perf.json');
      fs.writeFileSync(
        perfPath,
        JSON.stringify({ totalFramesQueued: queue.length, slowestTop5: slowest.slice(0, 5) }, null, 2)
      );
      console.log('Done! Slowest 5 frames:', slowest.slice(0, 5));
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
