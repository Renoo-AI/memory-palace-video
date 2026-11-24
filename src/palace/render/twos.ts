import { hashInt, mulberry32 } from '../seed';

export const FPS = 30;
export const TWOS_FPS = 15;

/**
 * Quantizes time to steps of 1/15 s ("on twos") for characters & objects.
 */
export function quantizeTwos(frameIndex: number): number {
  const twosFrame = Math.floor(frameIndex / 2) * 2;
  return twosFrame / FPS;
}

/**
 * Returns the integer twos-step index (0, 1, 2, ... at 15 Hz).
 */
export function twosStep(frameIndex: number): number {
  return Math.floor(frameIndex / 2);
}

/**
 * Smooth 30 fps time for the camera dolly.
 */
export function cameraTime(frameIndex: number): number {
  return frameIndex / FPS;
}

/**
 * Idle "boil" rotation (+/- 0.6 deg) on twos around main axis.
 */
export function idleBoilAngle(frameIndex: number, objectSeed: number): number {
  const step = twosStep(frameIndex);
  const rng = mulberry32(hashInt(step, objectSeed));
  const deg = (rng() * 2 - 1) * 0.16;
  return (deg * Math.PI) / 180;
}

/**
 * Deterministic stepped linear interpolation (no overshoot, no elastic).
 */
export function stepLinear(t: number, start: number, end: number): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return (t - start) / (end - start);
}

/**
 * SLAM squash: 2 frames of impact squash (scale Y 0.88 then back, no overshoot)
 * plus 3 frames of small object-only horizontal shake.
 */
export function slamOffset(
  twosTime: number,
  impactTime: number
): { scaleY: number; scaleXZ: number; shakeX: number } {
  const dt = twosTime - impactTime;
  if (dt < 0 || dt > 0.25) {
    return { scaleY: 1, scaleXZ: 1, shakeX: 0 };
  }
  const f = Math.floor(dt * FPS + 0.001);
  if (f < 2) {
    return { scaleY: 0.88, scaleXZ: 1.06, shakeX: 0.015 };
  }
  if (f < 4) {
    return { scaleY: 1, scaleXZ: 1, shakeX: -0.012 };
  }
  if (f < 6) {
    return { scaleY: 1, scaleXZ: 1, shakeX: 0.006 };
  }
  return { scaleY: 1, scaleXZ: 1, shakeX: 0 };
}

/**
 * Linear-decay wobble (max 3 swings, never exponential, never overshoot spring).
 */
export function linearWobble(
  twosTime: number,
  startTime: number,
  duration = 0.8,
  maxAngle = 0.08
): number {
  const dt = twosTime - startTime;
  if (dt < 0 || dt >= duration) return 0;
  const p = dt / duration;
  const amp = maxAngle * (1 - p);
  return Math.sin(p * Math.PI * 6) * amp;
}
