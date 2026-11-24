import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PALETTE } from '../palette';
import { GLOBAL_OUTLINE_UNIFORMS } from './outline';

const softwareRendererMap = new WeakMap<THREE.WebGLRenderer, boolean>();

export function isSoftwareRenderer(renderer: THREE.WebGLRenderer): boolean {
  return softwareRendererMap.get(renderer) ?? false;
}

export function detectSoftwareWebGL(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const info = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : String(gl.getParameter(gl.RENDERER) || '');
    return /SwiftShader|llvmpipe|Software|Mesa OffScreen/i.test(info);
  } catch {
    return false;
  }
}

export function createPalaceRenderer(
  canvas: HTMLCanvasElement | undefined,
  width: number,
  height: number
): THREE.WebGLRenderer {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
  } catch {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      preserveDrawingBuffer: true,
    });
  }

  const isSoftwareGl = detectSoftwareWebGL(renderer);
  softwareRendererMap.set(renderer, isSoftwareGl);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;

  const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  renderer.setClearColor(new THREE.Color(PALETTE.sky), 1.0);

  GLOBAL_OUTLINE_UNIFORMS.uResolution.value.set(width, height);

  return renderer;
}

export function attachStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.62;
  pmrem.dispose();
  return envTex;
}
