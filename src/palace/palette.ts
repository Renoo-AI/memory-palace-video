import * as THREE from 'three';

/**
 * Section 8.3 PALETTE (THE ONLY COLORS ALLOWED)
 * Every color has an exact base and shade step. Never invent extra hex values.
 */
export const PALETTE = {
  creamWall: '#F5EEDD',
  creamWallShade: '#E4D9BF',

  floorWood: '#DDBD8F',
  floorWoodShade: '#C6A074',

  ceiling: '#FAF5E8',
  ceilingShade: '#E9E0CA',

  coal: '#1E1B18',
  paperWhite: '#FFFDF6',

  tomato: '#E8472F',
  tomatoShade: '#C2301C',

  cobalt: '#2F4FD1',
  cobaltShade: '#2238A3',

  mustard: '#F0B72A',
  mustardShade: '#CC9215',

  leaf: '#4FA36B',
  leafShade: '#36804F',

  lilac: '#B8A8CC',
  lilacShade: '#9686AF',

  sky: '#9FD3E6',
  skyShade: '#6FB1CB',
} as const;

export type PaletteColorKey =
  | 'creamWall'
  | 'floorWood'
  | 'ceiling'
  | 'coal'
  | 'paperWhite'
  | 'tomato'
  | 'cobalt'
  | 'mustard'
  | 'leaf'
  | 'lilac'
  | 'sky';

export const PALETTE_PAIRS: Record<PaletteColorKey, { base: string; shade: string }> = {
  creamWall: { base: PALETTE.creamWall, shade: PALETTE.creamWallShade },
  floorWood: { base: PALETTE.floorWood, shade: PALETTE.floorWoodShade },
  ceiling: { base: PALETTE.ceiling, shade: PALETTE.ceilingShade },
  coal: { base: PALETTE.coal, shade: PALETTE.coal },
  paperWhite: { base: PALETTE.paperWhite, shade: PALETTE.creamWall },
  tomato: { base: PALETTE.tomato, shade: PALETTE.tomatoShade },
  cobalt: { base: PALETTE.cobalt, shade: PALETTE.cobaltShade },
  mustard: { base: PALETTE.mustard, shade: PALETTE.mustardShade },
  leaf: { base: PALETTE.leaf, shade: PALETTE.leafShade },
  lilac: { base: PALETTE.lilac, shade: PALETTE.lilacShade },
  sky: { base: PALETTE.sky, shade: PALETTE.skyShade },
};

export const ALL_PALETTE_HEXES: string[] = [
  PALETTE.creamWall,
  PALETTE.creamWallShade,
  PALETTE.floorWood,
  PALETTE.floorWoodShade,
  PALETTE.ceiling,
  PALETTE.ceilingShade,
  PALETTE.coal,
  PALETTE.paperWhite,
  PALETTE.tomato,
  PALETTE.tomatoShade,
  PALETTE.cobalt,
  PALETTE.cobaltShade,
  PALETTE.mustard,
  PALETTE.mustardShade,
  PALETTE.leaf,
  PALETTE.leafShade,
  PALETTE.lilac,
  PALETTE.lilacShade,
  PALETTE.sky,
  PALETTE.skyShade,
];

export function paletteColor(hex: string): THREE.Color {
  // Convert sRGB hex directly to linear color space used by Three.js materials
  return new THREE.Color(hex);
}
