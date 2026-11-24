import * as THREE from 'three';

export interface OutlineSharedUniforms {
  uResolution: { value: THREE.Vector2 };
  uBoilStep: { value: number };
}

export const GLOBAL_OUTLINE_UNIFORMS: OutlineSharedUniforms = {
  uResolution: { value: new THREE.Vector2(1920, 1080) },
  uBoilStep: { value: 0 },
};

export function attachSmoothedOutlineNormals(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  return geometry;
}

/**
 * Cleanly retired black inverted-hull outlines in favor of crisp studio PBR lighting & bevels.
 */
export function addOutline(
  _mesh: THREE.Mesh,
  _thickness = 3.0,
  _opacity = 1.0,
  _boilAmount = 0.25
): THREE.Mesh | null {
  return null;
}

/**
 * InstancedMesh helper (keeps return signature compatible without dark hull artifacts).
 */
export function createOutlinedInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  count: number,
  _thickness = 1.5
): { main: THREE.InstancedMesh; outline: THREE.InstancedMesh } {
  const main = new THREE.InstancedMesh(geometry, material, count);
  main.castShadow = true;
  main.receiveShadow = true;
  main.frustumCulled = false;

  const outline = new THREE.InstancedMesh(geometry, material, 0);
  outline.visible = false;
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.userData.isOutline = true;

  return { main, outline };
}
