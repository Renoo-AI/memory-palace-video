declare module '*.mjs' {
  import * as THREE from 'three';
  export function createAsset(options?: Record<string, unknown>): THREE.Group;
  export const presets: Record<string, Record<string, unknown>> | undefined;
  export const params: Record<string, unknown> | undefined;
}
