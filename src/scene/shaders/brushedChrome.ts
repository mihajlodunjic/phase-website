import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { resonanceGLSL } from '../resonanceSurface'

export type LoopUniforms = { uPhase: { value: number }; uWave: { value: number }; uTension: { value: number }; uTwist: { value: number } }
export const createLoopUniforms = (): LoopUniforms => ({ uPhase: { value: 0 }, uWave: { value: 0 }, uTension: { value: 0 }, uTwist: { value: 0 } })

export function createChromeMaterial(uniforms: LoopUniforms, useShader = true) {
  const parameters = { color: '#bec5c0', metalness: 1, roughness: 0.28, envMapIntensity: 1 }
  const material = useShader ? new MeshPhysicalMaterial({ ...parameters, anisotropy: 0.24 }) : new MeshStandardMaterial(parameters)
  material.name = useShader ? 'PHASE / Resonance ribbon r186' : 'PHASE / standard chrome fallback'
  if (!useShader) return material
  material.customProgramCacheKey = () => 'phase-resonance-r186-v1'
  material.onBeforeCompile = shader => {
    for (const token of ['#include <beginnormal_vertex>', '#include <begin_vertex>']) if (!shader.vertexShader.includes(token)) throw new Error(`PHASE: missing Three shader chunk ${token}`)
    if (!shader.fragmentShader.includes('#include <roughnessmap_fragment>')) throw new Error('PHASE: missing Three roughness shader chunk')
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${resonanceGLSL}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        vec3 along = ribbonU(uv), across = ribbonV(uv);
        objectNormal = normalize(cross(along, across));
        #ifdef USE_TANGENT
        objectTangent = normalize(along);
        #endif`)
      .replace('#include <begin_vertex>', 'vec3 transformed = ribbonPosition(uv);\nvPhaseUv = uv;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPhaseUv;')
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        float grainPhase = vPhaseUv.y*1507.96447372 + sin(vPhaseUv.x*18.8496)*0.25;
        float grainVisibility = 1.0-smoothstep(0.8,3.0,fwidth(grainPhase));
        roughnessFactor = clamp(roughnessFactor+sin(grainPhase)*grainVisibility*0.006,0.24,0.33);`)
  }
  return material
}
