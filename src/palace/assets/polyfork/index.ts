import * as THREE from 'three';

export interface PolyforkTuneOptions {
  targetHeight?: number;
  targetWidth?: number;
  scale?: number;
  groundY?: boolean;
  centerXZ?: boolean;
  roughness?: number;
  metalness?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * Prepares a Polyfork parametric THREE.Group for studio PBR lighting:
 * enables shadows on all Mesh/SkinnedMesh nodes, tunes roughness/metalness,
 * scales cleanly, and optionally grounds minY=0 and centers X/Z.
 */
export function preparePolyforkAsset(
  root: THREE.Group,
  opts: PolyforkTuneOptions = {}
): THREE.Group {
  const cast = opts.castShadow ?? true;
  const receive = opts.receiveShadow ?? true;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      mesh.frustumCulled = false; // prevent SkinnedMesh culling when bones move!
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (!m) continue;
        if ('roughness' in m && typeof m.roughness === 'number' && opts.roughness !== undefined) {
          m.roughness = opts.roughness;
        }
        if ('metalness' in m && typeof m.metalness === 'number' && opts.metalness !== undefined) {
          m.metalness = opts.metalness;
        }
      }
    }
  });

  if (opts.scale !== undefined) {
    root.scale.setScalar(opts.scale);
  } else if (opts.targetHeight !== undefined || opts.targetWidth !== undefined) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (opts.targetHeight && size.y > 0.0001) {
      root.scale.setScalar(opts.targetHeight / size.y);
    } else if (opts.targetWidth && size.x > 0.0001) {
      root.scale.setScalar(opts.targetWidth / size.x);
    }
  }

  if (opts.groundY || opts.centerXZ) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);
    if (opts.centerXZ) {
      root.position.x -= center.x;
      root.position.z -= center.z;
    }
    if (opts.groundY) {
      root.position.y -= box.min.y;
    }
  }

  return root;
}

/**
 * Finds a named Bone inside a Polyfork rigged SkinnedMesh hierarchy.
 */
export function findPolyforkBone(root: THREE.Object3D, name: string): THREE.Bone | null {
  let found: THREE.Bone | null = null;
  root.traverse((obj) => {
    if (!found && (obj as THREE.Bone).isBone && obj.name === name) {
      found = obj as THREE.Bone;
    }
  });
  return found;
}

/**
 * Finds a named child Object3D (e.g. door-fridge, hand-hour) inside a Polyfork asset.
 */
export function findPolyforkPart(root: THREE.Object3D, name: string): THREE.Object3D | null {
  return root.getObjectByName(name) ?? null;
}
