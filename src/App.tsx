/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PalaceEngine, RenderReport } from './palace/engine';
import { FPS } from './palace/render/twos';
import { ShotTiming } from './palace/timeline';

declare global {
  interface Window {
    __PALACE__?: {
      ready: boolean;
      totalFrames: number;
      fps: number;
      renderFrame: (frameIndex: number) => RenderReport;
      renderLookDevFrame: (which: 1 | 2 | 3) => RenderReport;
      renderThumbnailFrame: () => RenderReport;
      setSize: (w: number, h: number) => void;
    };
  }
}

const SHOT_LABELS: Record<string, string> = {
  S01: 'Front Door',
  S02: 'Without Knowing How',
  S03: 'Opening the Door',
  S04: 'Penguin in Shades',
  S05: 'Banana on the Sofa',
  S06: 'Diamond Fridge',
  S07: 'Crocodile Brushing Teeth',
  S08: 'Jumping Elephant',
  S09: 'Roof Hatch Pullback',
  S10: 'Brain Room Gallery',
  S11: 'Two Thousand Years',
  S12: 'Childhood Walkthrough',
  S13: 'Mental Storage',
  S14: 'Memory Athletes',
  S15: 'Inside the Mind',
  S16: 'Somewhere You Know',
  S17: 'Three Familiar Places',
  S18: 'Walking a Route',
  S19: 'Slots Along the Path',
  S20: 'Ordinary Mug',
  S21: 'Ridiculous & Enormous',
  S22: 'Biology Slab',
  S23: 'Mitochondria Plant',
  S24: 'Concrete & Vivid',
  S25: 'Different Subjects',
  S26: 'Mathematics Room',
  S27: 'History Museum',
  S28: 'Language Market',
  S29: 'Retrieval Practice',
  S30: '2017 Study',
  S31: 'Six Weeks Later',
  S32: 'Four Months Later',
  S33: 'Effortless Camera',
  S34: 'How Memory Works',
  S35: 'VR Headset',
  S36: 'Back to the Roof',
  S37: 'Return to the Door',
  S38: 'The Penguin Returns',
};

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isHeadless = params.get('headless') === '1';
  const targetW = Number(params.get('w')) || 1920;
  const targetH = Number(params.get('h')) || 1080;

  const mainRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrubRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<PalaceEngine | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number } | null>(null);
  const [totalFrames, setTotalFrames] = useState(4576);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [shots, setShots] = useState<ShotTiming[]>([]);
  const [hoverTime, setHoverTime] = useState<{ xPct: number; sec: number } | null>(null);
  const draggingRef = useRef(false);

  const audioSrc = '/audio/mix.wav';
  const frameIndexRef = useRef(0);

  useEffect(() => {
    if (isHeadless) return;
    const el = mainRef.current;
    if (!el) return;

    const updateSize = () => {
      const style = window.getComputedStyle(el);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availW = Math.max(240, el.clientWidth - padX);
      const availH = Math.max(135, el.clientHeight - padY);
      const aspect = 16 / 9;
      let width = availW;
      let height = width / aspect;
      if (height > availH) {
        height = availH;
        width = height * aspect;
      }
      setStageSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isHeadless, cinemaMode]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onContextLost = (e: Event) => {
      e.preventDefault();
    };
    const onContextRestored = () => {
      const engine = engineRef.current;
      if (engine) {
        engine.renderFrame(frameIndexRef.current);
      }
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const w = isHeadless ? targetW : 1280;
    const h = isHeadless ? targetH : 720;

    PalaceEngine.create(canvas, w, h)
      .then((engine) => {
        if (cancelled) return;
        engineRef.current = engine;
        setShots(engine.timeline.shots);
        setTotalFrames(engine.timeline.total_frames);
        engine.renderFrame(0);
        setReady(true);

        window.__PALACE__ = {
          ready: true,
          totalFrames: engine.timeline.total_frames,
          fps: FPS,
          setSize: (nw: number, nh: number) => engine.setSize(nw, nh),
          renderFrame: (idx: number) => engine.renderFrame(idx),
          renderLookDevFrame: (which: 1 | 2 | 3) => engine.renderLookDevFrame(which),
          renderThumbnailFrame: () => {
            engine.setSize(1280, 720);
            engine.applyFrameState(Math.round(13.2 * FPS));
            engine.palace.entrance.doorPivot.rotation.y = -1.35;
            engine.palace.entrance.doorStamp.visible = true;
            engine.palace.entrance.doorStamp.scale.set(1, 1, 1);
            engine.camera.position.set(0.18, 1.38, 1.35);
            engine.camera.lookAt(0.0, 0.94, -2.35);
            engine.camera.fov = 42;
            engine.camera.updateProjectionMatrix();
            engine.lighting.focusRoom(engine.camera.position.clone().set(0, 1.2, -1.0), 6.5);
            engine.renderer.render(engine.scene, engine.camera);
            return {
              frameIndex: -1,
              timeSec: 0,
              shotId: 'THUMB',
              renderMs: 0,
              triangles: engine.renderer.info.render.triangles,
            };
          },
        };
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to initialize PalaceEngine:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to initialize 3D scene');
      });

    return () => {
      cancelled = true;
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isHeadless, targetW, targetH]);

  useEffect(() => {
    if (isHeadless || !playing) return;

    const startWallMs = performance.now();
    const startSec = frameIndexRef.current / FPS;

    const tick = () => {
      const engine = engineRef.current;
      const audio = audioRef.current;
      if (engine) {
        const t =
          audio && !audio.paused
            ? audio.currentTime
            : startSec + (performance.now() - startWallMs) / 1000;
        const nextFrame = Math.min(engine.timeline.total_frames - 1, Math.round(t * FPS));
        frameIndexRef.current = nextFrame;
        engine.renderFrame(nextFrame);
        setFrameIndex(nextFrame);

        if (nextFrame >= engine.timeline.total_frames - 1) {
          setPlaying(false);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, isHeadless]);

  const jumpToFrame = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(totalFrames - 1, idx));
      frameIndexRef.current = clamped;
      setFrameIndex(clamped);
      if (engineRef.current) {
        engineRef.current.renderFrame(clamped);
      }
      if (audioRef.current) {
        audioRef.current.currentTime = clamped / FPS;
      }
    },
    [totalFrames]
  );

  const togglePlay = useCallback(async () => {
    if (!ready) return;
    const audio = audioRef.current;
    if (playing) {
      audio?.pause();
      setPlaying(false);
    } else {
      if (frameIndexRef.current >= totalFrames - 1) {
        jumpToFrame(0);
      }
      if (audio) {
        audio.currentTime = frameIndexRef.current / FPS;
        try {
          await audio.play();
        } catch {
          // Silent visual playback fallback
        }
      }
      setPlaying(true);
    }
  }, [playing, ready, totalFrames, jumpToFrame]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isHeadless) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setPlaying(false);
        audioRef.current?.pause();
        jumpToFrame(frameIndexRef.current + FPS * 2);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setPlaying(false);
        audioRef.current?.pause();
        jumpToFrame(frameIndexRef.current - FPS * 2);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'h' || e.key === 'H') {
        setCinemaMode((c) => !c);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHeadless, togglePlay, toggleMute, jumpToFrame]);

  const seekFromPointer = (clientX: number) => {
    const bar = scrubRef.current;
    if (!bar || !ready) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    const target = Math.round(ratio * Math.max(1, totalFrames - 1));
    setPlaying(false);
    audioRef.current?.pause();
    jumpToFrame(target);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      seekFromPointer(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  });

  const currentSec = frameIndex / FPS;
  const totalSec = totalFrames / FPS;
  const progressPct = totalFrames > 1 ? (frameIndex / (totalFrames - 1)) * 100 : 0;
  const activeShot = shots.find((s) => currentSec >= s.start && currentSec < s.end) ?? shots[0];
  const activeShotTitle = activeShot
    ? `${activeShot.id} · ${SHOT_LABELS[activeShot.id] ?? activeShot.id}`
    : 'S01 · Front Door';

  if (isHeadless) {
    return (
      <div
        className="relative overflow-hidden bg-[#CBE2EF]"
        style={{ width: `${targetW}px`, height: `${targetH}px` }}
      >
        <canvas
          ref={canvasRef}
          width={targetW}
          height={targetH}
          className="block h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0C0D10] text-[#F4F1EA] select-none">
      <audio ref={audioRef} src={audioSrc} preload="metadata" muted={muted} />

      {!cinemaMode && (
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#111318] px-5">
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-base font-bold tracking-tight text-[#F4F1EA]">
              Memory Palace
            </h1>
            <span className="text-xs font-medium tracking-wide text-[#9B9890]">
              {activeShotTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCinemaMode(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[#C8C4BA] transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-[#F4F1EA]"
            title="Hide controls (H)"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Cinema</span>
          </button>
        </header>
      )}

      <main
        ref={mainRef}
        className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#0C0D10] p-3 md:p-5"
      >
        <div
          className="relative aspect-video max-h-full max-w-full overflow-hidden rounded-lg border border-white/10 bg-[#CBE2EF] shadow-[0_24px_70px_rgba(0,0,0,0.65)]"
          style={stageSize ? { width: `${stageSize.width}px`, height: `${stageSize.height}px` } : undefined}
          onDoubleClick={() => setCinemaMode((c) => !c)}
        >
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="block h-full w-full"
          />

          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#12141A] p-6">
              <div className="text-center">
                <p className="font-display text-base font-bold text-[#F4F1EA]">
                  {loadError ? 'Unable to load 3D scene' : 'Constructing Palace'}
                </p>
                <p className="mt-1 text-xs text-[#9B9890]">
                  {loadError ?? 'Preparing rooms, lighting & narration'}
                </p>
              </div>
            </div>
          )}

          {cinemaMode && (
            <button
              type="button"
              onClick={() => setCinemaMode(false)}
              className="absolute right-3.5 top-3.5 cursor-pointer rounded-md border border-white/15 bg-[#0C0D10]/80 p-2 text-[#F4F1EA] transition-opacity hover:bg-[#0C0D10]"
              title="Show controls (H)"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>

      {!cinemaMode && (
        <footer className="flex shrink-0 flex-wrap items-center gap-3 border-t border-white/10 bg-[#111318] px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!ready}
              onClick={togglePlay}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[#E86B42] px-3.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#D75B33] disabled:cursor-not-allowed disabled:opacity-40"
              title="Play / Pause (Space)"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              <span>{playing ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              disabled={!ready}
              onClick={() => {
                setPlaying(false);
                audioRef.current?.pause();
                jumpToFrame(0);
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#C8C4BA] transition-colors hover:bg-white/[0.09] hover:text-[#F4F1EA] disabled:opacity-40"
              title="Restart"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              disabled={!ready}
              onClick={toggleMute}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#C8C4BA] transition-colors hover:bg-white/[0.09] hover:text-[#F4F1EA] disabled:opacity-40"
              title="Mute / Unmute (M)"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div
            ref={scrubRef}
            role="slider"
            tabIndex={0}
            aria-label="Timeline scrubber"
            aria-valuemin={0}
            aria-valuemax={Math.max(1, totalFrames - 1)}
            aria-valuenow={frameIndex}
            onPointerDown={(e) => {
              draggingRef.current = true;
              seekFromPointer(e.clientX);
            }}
            onPointerMove={(e) => {
              const bar = scrubRef.current;
              if (!bar) return;
              const rect = bar.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
              setHoverTime({ xPct: ratio * 100, sec: ratio * totalSec });
            }}
            onPointerLeave={() => setHoverTime(null)}
            className="relative flex h-6 min-w-[160px] flex-1 cursor-pointer items-center"
          >
            {hoverTime && (
              <div
                className="font-mono-num pointer-events-none absolute -top-6 -translate-x-1/2 rounded bg-[#1E2129] px-1.5 py-0.5 text-[10px] text-[#F4F1EA]"
                style={{ left: `${hoverTime.xPct}%` }}
              >
                {formatClock(hoverTime.sec)}
              </div>
            )}
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/12">
              {shots.map((s) => (
                <div
                  key={s.id}
                  className="pointer-events-none absolute top-0 bottom-0 w-px bg-black/35"
                  style={{ left: `${(s.start / Math.max(1, totalSec)) * 100}%` }}
                />
              ))}
              <div
                className="h-full rounded-full bg-[#E86B42]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-[#0C0D10] bg-[#F4F1EA] shadow"
              style={{ left: `${progressPct}%` }}
            />
          </div>

          <span className="font-mono-num min-w-[92px] text-right text-xs text-[#C8C4BA]">
            {formatClock(currentSec)} / {formatClock(totalSec)}
          </span>

          <select
            aria-label="Jump to chapter"
            disabled={!ready}
            value={activeShot?.id ?? 'S01'}
            onChange={(e) => {
              const s = shots.find((item) => item.id === e.target.value);
              if (s) {
                setPlaying(false);
                audioRef.current?.pause();
                jumpToFrame(Math.round((s.start + 0.05) * FPS));
              }
            }}
            className="h-8 max-w-[230px] cursor-pointer rounded-md border border-white/10 bg-[#191C24] px-2.5 text-xs font-medium text-[#F4F1EA] outline-none hover:border-white/25 disabled:opacity-40"
          >
            {shots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id.replace('S', '')} · {SHOT_LABELS[s.id] ?? s.id} ({formatClock(s.start)})
              </option>
            ))}
          </select>
        </footer>
      )}
    </div>
  );
}
