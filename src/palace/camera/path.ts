import * as THREE from 'three';

export interface CameraKeyframe {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  roomFocus: [number, number, number];
  focusRadius: number;
  shotId: string;
  /** True ONLY when this keyframe is a physical match-move handover (L3/L4/L5/L7) where the previous frame is filled by a wall/frame/object/page. */
  matchHandover?: boolean;
}

/**
 * One-take camera rail anchored to real timestamps in audio/words.json.
 * Every move between rooms in the Palace (S01-S09, S19, S29, S36-S38) is 100% continuous physical travel.
 * Secondary diorama zones connect via L3 (frame-in-frame), L4 (wall-wipe <= 3), L5 (page-curl), or L7 (object-fill).
 */
export function buildCameraKeyframes(): CameraKeyframe[] {
  return [
    // S01 HOOK (0.00 -> 4.79)
    { t: 0.00, pos: [0.0, 1.60, 4.00], look: [0.0, 1.42, 0.00], fov: 44, roomFocus: [0, 1.3, 0], focusRadius: 6, shotId: 'S01' },
    // S02 PROMISE (4.79 -> 8.79)
    { t: 4.79, pos: [0.0, 1.60, 2.50], look: [0.0, 1.38, 0.00], fov: 44, roomFocus: [0, 1.3, 0], focusRadius: 6, shotId: 'S02' },
    { t: 8.79, pos: [0.0, 1.60, 1.05], look: [0.0, 1.35, -0.40], fov: 44, roomFocus: [0, 1.3, -1], focusRadius: 6, shotId: 'S02' },
    // S03 OPEN THE DOOR (8.79 -> 11.35) - L1 threshold
    { t: 10.10, pos: [0.0, 1.56, 0.20], look: [0.0, 1.15, -2.40], fov: 45, roomFocus: [0, 1.2, -1.5], focusRadius: 5, shotId: 'S03' },
    { t: 11.35, pos: [0.0, 1.58, -0.35], look: [0.0, 0.92, -2.40], fov: 42, roomFocus: [0, 1.2, -1.5], focusRadius: 5, shotId: 'S03' },
    // S04 OBJECT 1: PENGUIN (11.35 -> 14.86) - mid shot showing full penguin from feet to head
    { t: 12.60, pos: [0.0, 1.42, -0.25], look: [0.0, 0.85, -2.40], fov: 42, roomFocus: [0, 1.0, -2.0], focusRadius: 4.5, shotId: 'S04' },
    { t: 14.50, pos: [0.0, 1.38, -0.50], look: [0.0, 0.88, -2.40], fov: 40, roomFocus: [0, 1.0, -2.0], focusRadius: 4.5, shotId: 'S04' },
    // L1 threshold through hall north door into living room
    { t: 14.86, pos: [0.0, 1.55, -2.25], look: [0.0, 1.40, -3.80], fov: 45, roomFocus: [0, 1.2, -3.5], focusRadius: 6, shotId: 'S05' },
    { t: 15.65, pos: [0.0, 1.60, -3.35], look: [-0.95, 0.88, -6.25], fov: 46, roomFocus: [0, 1.2, -5.2], focusRadius: 6, shotId: 'S05' },
    // S05 OBJECT 2: BANANA (14.86 -> 19.09) - arc 25 deg around sofa
    { t: 17.00, pos: [-0.25, 1.52, -4.35], look: [-1.15, 0.65, -6.55], fov: 42, roomFocus: [-1.0, 1.0, -5.8], focusRadius: 5.5, shotId: 'S05' },
    { t: 18.60, pos: [0.45, 1.55, -4.65], look: [-1.15, 0.65, -6.55], fov: 42, roomFocus: [0, 1.0, -5.5], focusRadius: 5.5, shotId: 'S05' },
    // L1 threshold through east door into Kitchen
    { t: 19.09, pos: [1.65, 1.60, -5.25], look: [3.60, 1.45, -5.25], fov: 46, roomFocus: [3.5, 1.2, -5.25], focusRadius: 6, shotId: 'S06' },
    { t: 20.15, pos: [3.45, 1.60, -5.25], look: [6.15, 1.15, -6.45], fov: 45, roomFocus: [5.0, 1.2, -5.5], focusRadius: 5.5, shotId: 'S06' },
    // S06 OBJECT 3: DIAMOND FRIDGE (19.09 -> 23.14)
    { t: 21.80, pos: [5.80, 1.26, -5.15], look: [6.35, 1.04, -6.58], fov: 42, roomFocus: [5.9, 1.0, -6.2], focusRadius: 4.5, shotId: 'S06' },
    { t: 22.85, pos: [5.92, 1.20, -5.32], look: [6.35, 1.02, -6.62], fov: 38, roomFocus: [5.9, 1.0, -6.2], focusRadius: 4.5, shotId: 'S06' },
    // Back off fridge & L1 threshold through north door into Bathroom
    { t: 23.14, pos: [5.00, 1.60, -6.30], look: [5.00, 1.50, -8.50], fov: 46, roomFocus: [5.0, 1.2, -8.0], focusRadius: 5.5, shotId: 'S07' },
    { t: 24.05, pos: [5.00, 1.60, -7.75], look: [5.00, 1.35, -9.85], fov: 45, roomFocus: [5.0, 1.2, -9.0], focusRadius: 5, shotId: 'S07' },
    // S07 OBJECT 4: CROCODILE (23.14 -> 26.88)
    { t: 25.40, pos: [4.15, 1.52, -8.50], look: [4.92, 1.32, -9.90], fov: 42, roomFocus: [5.0, 1.2, -9.4], focusRadius: 4.5, shotId: 'S07' },
    { t: 26.40, pos: [4.08, 1.46, -9.00], look: [4.95, 1.32, -9.95], fov: 38, roomFocus: [5.0, 1.2, -9.5], focusRadius: 4.5, shotId: 'S07' },
    // L1 threshold through west door into Bedroom
    { t: 26.88, pos: [4.05, 1.60, -9.00], look: [1.80, 1.45, -9.00], fov: 46, roomFocus: [2.5, 1.2, -9.2], focusRadius: 6, shotId: 'S08' },
    { t: 27.95, pos: [2.10, 1.55, -9.00], look: [-0.85, 1.45, -10.75], fov: 48, roomFocus: [0, 1.2, -9.8], focusRadius: 6, shotId: 'S08' },
    // S08 OBJECT 5: ELEPHANT (26.88 -> 31.40) - slightly low 1.3m at foot of bed, full headroom
    { t: 29.00, pos: [1.15, 1.30, -8.25], look: [-0.85, 1.55, -10.75], fov: 48, roomFocus: [-0.5, 1.4, -10.2], focusRadius: 5.5, shotId: 'S08' },
    { t: 31.40, pos: [1.15, 1.32, -8.25], look: [-0.85, 1.50, -10.75], fov: 48, roomFocus: [-0.5, 1.4, -10.2], focusRadius: 5.5, shotId: 'S09' },
    // S09 THAT'S IT + L2 LIFT-OUT (31.40 -> 35.35)
    { t: 32.80, pos: [0.20, 2.05, -9.20], look: [-0.45, 2.55, -9.85], fov: 46, roomFocus: [0, 2.5, -9.85], focusRadius: 6, shotId: 'S09' },
    { t: 34.40, pos: [0.00, 5.20, -9.40], look: [0.00, 1.20, -9.85], fov: 46, roomFocus: [0, 2.0, -9.85], focusRadius: 8, shotId: 'S09' },
    { t: 35.35, pos: [0.00, 10.65, -9.60], look: [0.00, 10.50, -11.60], fov: 46, roomFocus: [0, 10.5, -10.5], focusRadius: 8, shotId: 'S10' },
    // S10 THE BRAIN ROOM (35.35 -> 39.16)
    { t: 37.20, pos: [-0.75, 10.85, -8.65], look: [-0.55, 10.80, -12.80], fov: 44, roomFocus: [0, 10.8, -10.8], focusRadius: 7, shotId: 'S10' },
    // L3 push into wall picture frame
    { t: 39.12, pos: [-2.40, 11.85, -13.65], look: [-2.40, 11.85, -14.30], fov: 36, roomFocus: [-2.4, 11.5, -14.0], focusRadius: 5, shotId: 'S10' },

    // S11 CHILDHOOD HOME GHOST (39.16 -> 43.03) at X=22 (L3 handover from picture frame)
    { t: 39.16, pos: [20.2, 2.65, 3.85], look: [22.0, 1.75, 0.0], fov: 42, roomFocus: [22, 1.5, 0], focusRadius: 6, shotId: 'S11', matchHandover: true },
    { t: 43.03, pos: [23.6, 2.75, 3.60], look: [22.0, 1.75, 0.0], fov: 42, roomFocus: [22, 1.5, 0], focusRadius: 6, shotId: 'S11' },

    // S12 FURNITURE AND DOORS (43.03 -> 48.60) - straight down map moment ~3s
    { t: 44.30, pos: [22.0, 4.80, 0.05], look: [22.0, 1.00, 0.0], fov: 44, roomFocus: [22, 1.2, 0], focusRadius: 6, shotId: 'S12' },
    { t: 47.40, pos: [22.0, 4.80, 0.05], look: [22.0, 1.00, 0.0], fov: 44, roomFocus: [22, 1.2, 0], focusRadius: 6, shotId: 'S12' },
    // L4 Wall-wipe #1 (48.20 -> 48.59) slides squarely past Cream wall panel at X=25.2
    { t: 48.20, pos: [24.2, 1.80, 0.85], look: [24.2, 1.80, -0.50], fov: 42, roomFocus: [23, 1.5, 0], focusRadius: 6, shotId: 'S12' },
    { t: 48.58, pos: [25.2, 1.80, 0.35], look: [25.2, 1.80, -0.50], fov: 40, roomFocus: [25, 1.8, 0], focusRadius: 5, shotId: 'S12' },

    // S13 STORE IT (48.60 -> 52.34) - L4 handover from Cream wipe
    { t: 48.60, pos: [22.2, 2.35, 3.10], look: [22.5, 1.55, -0.25], fov: 40, roomFocus: [22, 1.5, 0], focusRadius: 5.5, shotId: 'S13', matchHandover: true },
    { t: 52.30, pos: [22.8, 1.85, 2.40], look: [22.8, 1.55, -0.35], fov: 40, roomFocus: [22.5, 1.5, 0], focusRadius: 5.5, shotId: 'S13' },

    // S14 MEMORY PALACE SIGN & ATHLETES (52.34 -> 59.34) at X=36 (L1 doorway handover)
    { t: 52.34, pos: [34.5, 1.85, 3.65], look: [35.4, 1.75, -0.50], fov: 44, roomFocus: [36, 1.6, 0], focusRadius: 7, shotId: 'S14', matchHandover: true },
    { t: 57.60, pos: [40.2, 1.85, 3.65], look: [40.6, 1.85, -0.55], fov: 44, roomFocus: [40, 1.8, 0], focusRadius: 7, shotId: 'S14' },
    // L7 Object-fill on tallest card tower's Cream face
    { t: 59.30, pos: [40.85, 2.25, 0.15], look: [40.85, 2.25, -0.55], fov: 35, roomFocus: [40.8, 2.0, -0.5], focusRadius: 4, shotId: 'S14' },

    // S15 VR GAME INSIDE THE HEAD (59.34 -> 63.19) back to Brain Room Walker (L7 handover)
    { t: 59.34, pos: [-1.35, 11.45, -8.30], look: [-1.35, 10.95, -9.35], fov: 40, roomFocus: [-1.35, 10.8, -9.3], focusRadius: 4, shotId: 'S15', matchHandover: true },
    { t: 63.15, pos: [-1.35, 11.78, -8.58], look: [-1.35, 11.02, -9.35], fov: 38, roomFocus: [-1.35, 11.0, -9.35], focusRadius: 3.5, shotId: 'S15' },

    // S16 START WITH SOMEWHERE KNOWN (63.19 -> 66.38) at X=52 (L3 handover from open head stage)
    { t: 63.19, pos: [50.4, 1.65, 3.30], look: [50.7, 1.18, 0.0], fov: 44, roomFocus: [52, 1.2, 0], focusRadius: 6, shotId: 'S16', matchHandover: true },
    { t: 66.38, pos: [50.6, 1.55, 2.40], look: [50.7, 1.18, 0.0], fov: 42, roomFocus: [52, 1.2, 0], focusRadius: 6, shotId: 'S16' },

    // S17 HOUSE, SCHOOL, GAME MAP (66.38 -> 70.72)
    { t: 67.60, pos: [52.0, 1.55, 2.40], look: [52.0, 1.15, 0.0], fov: 42, roomFocus: [52, 1.2, 0], focusRadius: 6, shotId: 'S17' },
    { t: 70.72, pos: [53.4, 1.55, 2.40], look: [53.4, 1.15, 0.0], fov: 42, roomFocus: [53, 1.2, 0], focusRadius: 6, shotId: 'S17' },

    // S18 THE ROUTE (70.72 -> 73.14) - L5 page-curl into high map view (>30 deg pitch allowed here)
    { t: 71.15, pos: [52.0, 4.10, 0.05], look: [52.0, 0.90, 0.0], fov: 44, roomFocus: [52, 1.0, 0], focusRadius: 6, shotId: 'S18' },
    { t: 73.10, pos: [52.0, 3.20, 1.85], look: [52.0, 0.90, 0.0], fov: 44, roomFocus: [52, 1.0, 0], focusRadius: 6, shotId: 'S18' },

    // S19 STORAGE SLOTS (73.14 -> 77.25) - L1 drop back into Palace following Walker cleanly inside rooms
    { t: 73.14, pos: [0.0, 1.75, 0.65], look: [-0.2, 1.05, -2.0], fov: 46, roomFocus: [0, 1.2, -1.5], focusRadius: 6, shotId: 'S19', matchHandover: true },
    { t: 74.60, pos: [0.4, 1.75, -3.10], look: [0.6, 1.05, -5.2], fov: 46, roomFocus: [1.5, 1.2, -5.2], focusRadius: 6, shotId: 'S19' },
    { t: 75.80, pos: [3.8, 1.75, -5.20], look: [4.6, 1.05, -7.8], fov: 46, roomFocus: [4.5, 1.2, -7.0], focusRadius: 6, shotId: 'S19' },
    { t: 76.50, pos: [4.3, 1.75, -8.85], look: [1.5, 1.15, -9.0], fov: 46, roomFocus: [2.8, 1.2, -9.0], focusRadius: 6, shotId: 'S19' },
    { t: 76.92, pos: [1.8, 1.75, -9.00], look: [1.8, 2.35, -9.00], fov: 44, roomFocus: [1.8, 1.8, -9.0], focusRadius: 5, shotId: 'S19' },
    // L4 Wall-wipe #2: tilt cleanly up into Bedroom Cream ceiling at (1.8, 2.62, -9.0) -> 100% Cream
    { t: 77.23, pos: [1.8, 2.62, -9.00], look: [1.8, 2.95, -9.00], fov: 40, roomFocus: [1.8, 2.6, -9.0], focusRadius: 4, shotId: 'S19' },

    // S20 ORDINARY OBJECTS & S21 RIDICULOUS, ENORMOUS, ALIVE (77.25 -> 86.81) at X=68 (L4 wall-wipe #2 handover)
    { t: 77.25, pos: [68.0, 1.45, 2.30], look: [68.0, 1.05, 0.0], fov: 40, roomFocus: [68, 1.2, 0], focusRadius: 5, shotId: 'S20', matchHandover: true },
    { t: 80.67, pos: [68.0, 1.38, 1.85], look: [68.0, 1.05, 0.0], fov: 38, roomFocus: [68, 1.2, 0], focusRadius: 5, shotId: 'S21' },
    { t: 82.60, pos: [68.0, 1.55, 4.35], look: [68.0, 1.65, 0.0], fov: 48, roomFocus: [68, 1.8, 0], focusRadius: 6, shotId: 'S21' },
    { t: 85.40, pos: [68.0, 1.50, 4.20], look: [68.0, 1.15, 0.35], fov: 48, roomFocus: [68, 1.5, 0], focusRadius: 6, shotId: 'S21' },
    // L7 Object-fill: huge Cream mug side fills frame
    { t: 86.78, pos: [68.0, 1.45, 1.10], look: [68.0, 1.45, 0.0], fov: 34, roomFocus: [68, 1.3, 0], focusRadius: 4, shotId: 'S21' },

    // S22 STUDYING BIOLOGY (86.81 -> 93.19) at X=82 (L7 Cream slab handover)
    { t: 86.81, pos: [82.0, 1.55, 2.35], look: [82.0, 1.15, 0.0], fov: 40, roomFocus: [82, 1.2, 0], focusRadius: 5, shotId: 'S22', matchHandover: true },
    { t: 93.15, pos: [82.38, 1.30, 1.25], look: [82.38, 1.15, 0.0], fov: 34, roomFocus: [82, 1.2, 0], focusRadius: 4, shotId: 'S22' },

    // S23 TINY POWER STATION (93.19 -> 99.42) inside Kitchen island (4.90, 0.92, -4.45), Fridge in background!
    { t: 93.19, pos: [4.15, 1.18, -3.55], look: [4.90, 1.12, -4.45], fov: 40, roomFocus: [5.2, 1.2, -5.0], focusRadius: 5.5, shotId: 'S23', matchHandover: true },
    { t: 94.60, pos: [4.70, 1.08, -3.72], look: [4.90, 1.08, -4.45], fov: 36, roomFocus: [5.2, 1.1, -4.8], focusRadius: 4.5, shotId: 'S23' },
    { t: 96.40, pos: [4.35, 1.48, -3.52], look: [5.45, 1.12, -5.35], fov: 46, roomFocus: [5.5, 1.2, -5.2], focusRadius: 6, shotId: 'S23' },
    { t: 99.00, pos: [4.45, 1.44, -3.55], look: [5.40, 1.12, -5.25], fov: 44, roomFocus: [5.5, 1.2, -5.2], focusRadius: 6, shotId: 'S23' },

    // S24 ABSTRACT SENTENCE VS SCENE (99.42 -> 105.11) - left crumbling slab + right factory on island
    { t: 99.42, pos: [4.38, 1.32, -3.38], look: [4.55, 1.14, -4.45], fov: 44, roomFocus: [4.9, 1.2, -4.6], focusRadius: 5, shotId: 'S24' },
    { t: 105.05, pos: [4.52, 1.28, -3.38], look: [4.60, 1.14, -4.45], fov: 42, roomFocus: [4.9, 1.2, -4.6], focusRadius: 5, shotId: 'S24' },

    // S25 WALL OF DIORAMAS (105.11 -> 108.31) at X=96 (L3 handover)
    { t: 105.11, pos: [96.0, 1.55, 2.85], look: [96.0, 1.55, -1.35], fov: 46, roomFocus: [96, 1.5, 0], focusRadius: 7, shotId: 'S25', matchHandover: true },
    { t: 108.28, pos: [94.4, 1.55, 0.40], look: [94.4, 1.55, -1.35], fov: 40, roomFocus: [94.4, 1.5, -1], focusRadius: 5, shotId: 'S25' },

    // S26 SCHOOL FOR MATH (108.31 -> 109.97) at X=112 (L3 push into first shadowbox)
    { t: 108.31, pos: [112.0, 1.35, 2.10], look: [112.0, 1.25, -1.0], fov: 44, roomFocus: [112, 1.2, 0], focusRadius: 6, shotId: 'S26', matchHandover: true },
    { t: 109.94, pos: [112.0, 1.35, 1.15], look: [112.0, 1.25, -1.0], fov: 42, roomFocus: [112, 1.2, 0], focusRadius: 6, shotId: 'S26' },

    // S27 MUSEUM FOR HISTORY (109.97 -> 111.33) at X=118 (L1 arch handover)
    { t: 109.97, pos: [117.3, 1.35, 2.00], look: [118.1, 1.15, -0.5], fov: 44, roomFocus: [118, 1.2, 0], focusRadius: 6, shotId: 'S27', matchHandover: true },
    { t: 111.30, pos: [118.6, 1.35, 2.00], look: [118.2, 1.15, -0.5], fov: 44, roomFocus: [118, 1.2, 0], focusRadius: 6, shotId: 'S27' },

    // S28 SUPERMARKET FOR LANGUAGE (111.33 -> 114.13) at X=124 (L1 arch handover)
    { t: 111.33, pos: [124.25, 1.55, 2.60], look: [124.0, 1.02, -0.5], fov: 46, roomFocus: [124, 1.2, 0], focusRadius: 6, shotId: 'S28', matchHandover: true },
    { t: 114.10, pos: [124.15, 1.48, 1.25], look: [124.0, 1.02, -0.8], fov: 44, roomFocus: [124, 1.2, 0], focusRadius: 6, shotId: 'S28' },

    // S29 BETTER WITH PRACTICE (114.13 -> 120.56) - dollhouse view above Palace + L4 wall-wipe #3
    { t: 114.13, pos: [2.4, 7.2, 1.8], look: [2.0, 0.5, -6.2], fov: 46, roomFocus: [2.0, 1.0, -6.0], focusRadius: 11, shotId: 'S29', matchHandover: true },
    { t: 119.50, pos: [2.2, 6.4, -0.8], look: [2.0, 0.5, -6.5], fov: 46, roomFocus: [2.0, 1.0, -6.0], focusRadius: 11, shotId: 'S29' },
    { t: 120.36, pos: [0.0, 1.55, -12.00], look: [0.0, 1.55, -11.42], fov: 40, roomFocus: [0.0, 1.5, -11.4], focusRadius: 6, shotId: 'S29' },
    { t: 120.54, pos: [0.5, 1.55, -12.00], look: [0.5, 1.55, -11.42], fov: 40, roomFocus: [0.5, 1.5, -11.4], focusRadius: 6, shotId: 'S29' },

    // S30 STUDY 2017 (120.56 -> 122.78) at X=140 (L5 page-curl handover)
    { t: 120.56, pos: [139.2, 1.75, 2.35], look: [139.2, 1.75, -1.0], fov: 40, roomFocus: [140, 1.7, -0.5], focusRadius: 6, shotId: 'S30', matchHandover: true },
    { t: 122.78, pos: [139.5, 1.75, 2.15], look: [139.5, 1.75, -1.0], fov: 40, roomFocus: [140, 1.7, -0.5], focusRadius: 6, shotId: 'S30' },

    // S31 SIX WEEKS (122.78 -> 127.83)
    { t: 127.83, pos: [140.8, 1.65, 2.35], look: [140.8, 1.65, -1.0], fov: 42, roomFocus: [140.8, 1.6, -0.5], focusRadius: 6, shotId: 'S31' },

    // S32 FOUR MONTHS LATER (127.83 -> 130.84) - L5 page curl, dolly across 16 empty rows to flag
    { t: 128.30, pos: [140.2, 1.55, 2.65], look: [140.2, 1.45, -1.0], fov: 42, roomFocus: [141, 1.4, -0.5], focusRadius: 6, shotId: 'S32' },
    { t: 130.80, pos: [142.55, 1.35, 1.25], look: [142.55, 1.32, -0.9], fov: 36, roomFocus: [142.5, 1.3, -0.8], focusRadius: 4, shotId: 'S32' },

    // S33 NOT PHOTOGRAPHIC MEMORY (130.84 -> 133.21) at X=144.8 (L7 Leaf cloth fill handover onto same stage)
    { t: 130.84, pos: [144.8, 1.35, 2.05], look: [144.8, 1.05, 0.0], fov: 38, roomFocus: [144.8, 1.1, 0], focusRadius: 4.5, shotId: 'S33', matchHandover: true },
    { t: 133.21, pos: [144.8, 1.30, 1.75], look: [144.8, 1.05, 0.0], fov: 36, roomFocus: [144.8, 1.1, 0], focusRadius: 4.5, shotId: 'S33' },

    // S34 THREE THINGS YOU STILL NEED (133.21 -> 139.29) continuous dolly along plaques X=146.8..150.6
    { t: 133.60, pos: [146.8, 1.50, 1.50], look: [146.8, 1.50, -1.0], fov: 38, roomFocus: [146.8, 1.5, -0.5], focusRadius: 5, shotId: 'S34' },
    { t: 135.50, pos: [148.7, 1.50, 1.50], look: [148.7, 1.50, -1.0], fov: 38, roomFocus: [148.7, 1.5, -0.5], focusRadius: 5, shotId: 'S34' },
    { t: 139.29, pos: [150.6, 1.50, 1.50], look: [150.6, 1.50, -1.0], fov: 38, roomFocus: [150.6, 1.5, -0.5], focusRadius: 5, shotId: 'S34' },

    // S35 NO HEADSET NEEDED (139.29 -> 144.15) continuous to X=152.9
    { t: 139.80, pos: [152.9, 1.32, 2.50], look: [152.9, 0.88, 0.0], fov: 42, roomFocus: [152.8, 1.0, 0], focusRadius: 5, shotId: 'S35' },
    { t: 144.12, pos: [152.9, 1.26, 2.15], look: [152.9, 0.86, 0.0], fov: 40, roomFocus: [152.8, 1.0, 0], focusRadius: 5, shotId: 'S35' },

    // S36 REMEMBER THE HOUSE (144.15 -> 147.24) - L6 DESCENT from Brain Room shelf back to exact S01 frame 0!
    { t: 144.15, pos: [0.0, 11.4, -11.4], look: [0.0, 9.6, -11.6], fov: 45, roomFocus: [0, 10.0, -11.0], focusRadius: 7, shotId: 'S36', matchHandover: true },
    { t: 145.60, pos: [0.0, 4.80, -3.50], look: [0.0, 1.50, 0.0], fov: 45, roomFocus: [0, 1.5, -2.0], focusRadius: 8, shotId: 'S36' },
    { t: 147.24, pos: [0.0, 1.60, 4.00], look: [0.0, 1.42, 0.00], fov: 44, roomFocus: [0, 1.3, 0], focusRadius: 6, shotId: 'S36' },

    // S37 THE QUESTION (147.24 -> 149.02) - 20% slower push through front door (penguin hidden behind console!)
    { t: 147.60, pos: [0.0, 1.60, 2.20], look: [0.0, 1.35, -0.40], fov: 44, roomFocus: [0, 1.3, 0], focusRadius: 6, shotId: 'S37' },
    { t: 149.02, pos: [0.0, 1.58, -0.35], look: [0.0, 0.95, -2.40], fov: 42, roomFocus: [0, 1.2, -1.5], focusRadius: 5, shotId: 'S37' },

    // S38 THE ANSWER (SILENT BEAT 149.02 -> 152.52) - penguin steps out, sunglasses slide, check stamp, 1.0s hold!
    { t: 151.52, pos: [0.0, 1.38, -0.18], look: [0.0, 0.88, -2.40], fov: 42, roomFocus: [0, 1.0, -2.0], focusRadius: 4.5, shotId: 'S38' },
    { t: 152.52, pos: [0.0, 1.38, -0.18], look: [0.0, 0.88, -2.40], fov: 42, roomFocus: [0, 1.0, -2.0], focusRadius: 4.5, shotId: 'S38' },
  ];
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _focus = new THREE.Vector3();

export function sampleCameraState(
  keyframes: CameraKeyframe[],
  t: number
): {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  roomFocus: THREE.Vector3;
  focusRadius: number;
  shotId: string;
} {
  if (t <= keyframes[0].t) {
    const k = keyframes[0];
    return {
      pos: _pos.set(...k.pos),
      look: _look.set(...k.look),
      fov: k.fov,
      roomFocus: _focus.set(...k.roomFocus),
      focusRadius: k.focusRadius,
      shotId: k.shotId,
    };
  }
  const last = keyframes[keyframes.length - 1];
  if (t >= last.t) {
    return {
      pos: _pos.set(...last.pos),
      look: _look.set(...last.look),
      fov: last.fov,
      roomFocus: _focus.set(...last.roomFocus),
      focusRadius: last.focusRadius,
      shotId: last.shotId,
    };
  }

  let idx = 0;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (t >= keyframes[i].t && t < keyframes[i + 1].t) {
      idx = i;
      break;
    }
  }

  const a = keyframes[idx];
  const b = keyframes[idx + 1];

  // If b is a matchHandover into a separate spatial stage, snap cleanly at b.t (never interpolate through void!)
  if (b.matchHandover) {
    return {
      pos: _pos.set(...a.pos),
      look: _look.set(...a.look),
      fov: a.fov,
      roomFocus: _focus.set(...a.roomFocus),
      focusRadius: a.focusRadius,
      shotId: a.shotId,
    };
  }

  const span = Math.max(0.0001, b.t - a.t);
  let alpha = (t - a.t) / span;
  alpha = alpha * alpha * (3 - 2 * alpha);

  _pos.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], alpha),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], alpha),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], alpha)
  );
  _look.set(
    THREE.MathUtils.lerp(a.look[0], b.look[0], alpha),
    THREE.MathUtils.lerp(a.look[1], b.look[1], alpha),
    THREE.MathUtils.lerp(a.look[2], b.look[2], alpha)
  );
  _focus.set(
    THREE.MathUtils.lerp(a.roomFocus[0], b.roomFocus[0], alpha),
    THREE.MathUtils.lerp(a.roomFocus[1], b.roomFocus[1], alpha),
    THREE.MathUtils.lerp(a.roomFocus[2], b.roomFocus[2], alpha)
  );

  return {
    pos: _pos,
    look: _look,
    fov: THREE.MathUtils.lerp(a.fov, b.fov, alpha),
    roomFocus: _focus,
    focusRadius: THREE.MathUtils.lerp(a.focusRadius, b.focusRadius, alpha),
    shotId: alpha < 0.5 ? a.shotId : b.shotId,
  };
}
