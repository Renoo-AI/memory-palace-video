import * as THREE from 'three';

export interface PalaceLightingRig {
  dirLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  ambientLight: THREE.AmbientLight;
  interiorFill: THREE.PointLight;
  lightDirection: THREE.Vector3;
  focusRoom: (center: THREE.Vector3, radius?: number) => void;
}

/**
 * 3-point + bounce studio lighting rig:
 * - Warm key DirectionalLight casting soft PCF shadows onto the focused room
 * - Cool-sky / warm-ground HemisphereLight for natural indirect bounce
 * - Cool-neutral rim DirectionalLight for clean silhouette separation
 * - Gentle interior PointLight following the active room center for rich indoor warmth
 */
export function createPalaceLighting(
  scene: THREE.Scene,
  isSoftwareGl = false
): PalaceLightingRig {
  const ambientLight = new THREE.AmbientLight(0xfff7ec, 0.22);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xdcebff, 0xc8a982, 0.78);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // Warm key sun from upper-left-front
  const lightDir = new THREE.Vector3(-0.48, 0.78, 0.42).normalize();
  const dirLight = new THREE.DirectionalLight(0xfff2dc, 1.85);
  dirLight.position.copy(lightDir).multiplyScalar(25);
  dirLight.target.position.set(0, 0, -5);
  dirLight.castShadow = true;

  const shadowSize = isSoftwareGl ? 2048 : 4096;
  dirLight.shadow.mapSize.set(shadowSize, shadowSize);
  dirLight.shadow.bias = -0.00045;
  dirLight.shadow.normalBias = 0.022;
  dirLight.shadow.radius = 2.4;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 60;

  const d = 8;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  scene.add(dirLight);
  scene.add(dirLight.target);

  // Cool rim / back-right fill for depth & edge separation
  const rimDir = new THREE.Vector3(0.62, 0.54, -0.58).normalize();
  const rimLight = new THREE.DirectionalLight(0xd8e8ff, 0.58);
  rimLight.position.copy(rimDir).multiplyScalar(25);
  rimLight.target.position.set(0, 0, -5);
  rimLight.castShadow = false;
  scene.add(rimLight);
  scene.add(rimLight.target);

  // Soft warm ceiling bounce inside rooms
  const interiorFill = new THREE.PointLight(0xfff4e2, 1.65, 11, 1.4);
  interiorFill.position.set(0, 2.35, -1.5);
  interiorFill.castShadow = false;
  scene.add(interiorFill);

  const focusRoom = (center: THREE.Vector3, radius = 8) => {
    dirLight.target.position.copy(center);
    dirLight.position.copy(center).addScaledVector(lightDir, 24);
    dirLight.shadow.camera.left = -radius;
    dirLight.shadow.camera.right = radius;
    dirLight.shadow.camera.top = radius;
    dirLight.shadow.camera.bottom = -radius;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 55;
    dirLight.shadow.camera.updateProjectionMatrix();
    dirLight.target.updateMatrixWorld();
    dirLight.updateMatrixWorld();

    rimLight.target.position.copy(center);
    rimLight.position.copy(center).addScaledVector(rimDir, 22);
    rimLight.target.updateMatrixWorld();
    rimLight.updateMatrixWorld();

    interiorFill.position.set(center.x, center.y + 1.25, center.z + 0.45);
  };

  return {
    dirLight,
    rimLight,
    hemiLight,
    ambientLight,
    interiorFill,
    lightDirection: lightDir,
    focusRoom,
  };
}
