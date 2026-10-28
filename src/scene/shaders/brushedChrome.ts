import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

export type LoopUniforms = { uBreath: { value: number }; uTwist: { value: number } }
export const createLoopUniforms = (): LoopUniforms => ({ uBreath: { value: 0 }, uTwist: { value: 0 } })

// WebGL GLSL, Three r186 MeshStandardMaterial chunks. Positions and normals below
// are object-space. Three's normalMatrix and ACES / sRGB output remain untouched.
const vertexDeclarations = /* glsl */ `
  uniform float uBreath;
  uniform float uTwist;
  varying vec2 vPhaseUv;

  vec3 phasePosition(vec3 p) {
    float spread = 1.0 + uBreath * cos(2.0 * p.y);
    vec3 q = vec3(p.x * spread, p.y, p.z * spread);
    float angle = uTwist * p.y;
    float c = cos(angle), s = sin(angle);
    return vec3(c * q.x - s * q.z, q.y, s * q.x + c * q.z);
  }

  vec3 phaseTangent(vec3 p, vec3 t) {
    float spread = 1.0 + uBreath * cos(2.0 * p.y);
    float slope = -2.0 * uBreath * sin(2.0 * p.y);
    vec3 q = vec3(p.x * spread, p.y, p.z * spread);
    vec3 corrected = vec3(spread * t.x + p.x * slope * t.y,
      t.y, spread * t.z + p.z * slope * t.y);
    float angle = uTwist * p.y;
    float c = cos(angle), s = sin(angle);
    return normalize(vec3(c * corrected.x - s * corrected.z
        - uTwist * (s * q.x + c * q.z) * corrected.y,
      corrected.y, s * corrected.x + c * corrected.z
        + uTwist * (c * q.x - s * q.z) * corrected.y));
  }

  // Analytic inverse-transpose Jacobians: first the y-dependent spread,
  // then a twist around y. This keeps specular highlights attached to the
  // moving surface, rather than lighting it with the undeformed CPU normals.
  vec3 phaseNormal(vec3 p, vec3 n) {
    float spread = 1.0 + uBreath * cos(2.0 * p.y);
    float slope = -2.0 * uBreath * sin(2.0 * p.y);
    vec3 q = vec3(p.x * spread, p.y, p.z * spread);
    vec3 corrected = vec3(n.x / spread,
      n.y - slope * (p.x * n.x + p.z * n.z) / spread,
      n.z / spread);
    corrected.y += uTwist * (q.z * corrected.x - q.x * corrected.z);
    float angle = uTwist * p.y;
    float c = cos(angle), s = sin(angle);
    return normalize(vec3(c * corrected.x - s * corrected.z,
      corrected.y, s * corrected.x + c * corrected.z));
  }
`

const satinRoughness = /* glsl */ `
  // Etched satin grain changes microsurface roughness only. Derivative filtering
  // removes the subpixel frequency on small / low-DPR canvases; no shimmer.
  float grainPhase = vPhaseUv.y * 6283.1853 + sin(vPhaseUv.x * 18.8496) * 0.3;
  float grainVisibility = 1.0 - smoothstep(0.8, 3.0, fwidth(grainPhase));
  float grain = sin(grainPhase) * grainVisibility;
  roughnessFactor = clamp(roughnessFactor + grain * 0.014
    + 0.016 * sin(vPhaseUv.y * 12.5664), 0.19, 0.31);
`

export function createChromeMaterial(uniforms: LoopUniforms, useShader = true) {
  const parameters = { color: '#c1c7c2', metalness: 1, roughness: 0.245, envMapIntensity: 1 }
  const material = useShader
    ? new MeshPhysicalMaterial({ ...parameters, anisotropy: 0.22, anisotropyRotation: 0 })
    : new MeshStandardMaterial(parameters)
  material.name = useShader ? 'PHASE / satin chrome r186' : 'PHASE / standard chrome fallback'
  if (!useShader) return material
  material.customProgramCacheKey = () => 'phase-satin-chrome-r186-v4'
  material.onBeforeCompile = shader => {
    // Fail visibly on a Three upgrade instead of silently losing deformation.
    for (const token of ['#include <beginnormal_vertex>', '#include <begin_vertex>']) {
      if (!shader.vertexShader.includes(token)) throw new Error(`PHASE: missing Three shader chunk ${token}`)
    }
    if (!shader.fragmentShader.includes('#include <roughnessmap_fragment>')) throw new Error('PHASE: missing Three roughness shader chunk')
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${vertexDeclarations}`)
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = phaseNormal(position, normal);\n#ifdef USE_TANGENT\nobjectTangent = phaseTangent(position, tangent.xyz);\n#endif')
      .replace('#include <begin_vertex>', 'vec3 transformed = phasePosition(position);\nvPhaseUv = uv;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPhaseUv;')
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${satinRoughness}`)
  }
  return material
}
