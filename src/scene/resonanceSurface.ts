// One periodic parameterization for the CPU rest mesh, tests and the GPU surface.
// u follows the closed spine; v follows the rounded, thin ribbon cross-section.
export function sampleResonance(u: number, v: number, phase: number, wave: number, tension: number, twistEnergy: number, out: number[]) {
  const travelling = Math.sin(u - phase)
  const counter = Math.sin(2 * u - phase + 0.8)
  const radial = 1.43 + 0.09 * Math.cos(2 * u - 0.4) + 0.045 * Math.sin(3 * u) + wave * 0.065 * counter
  const width = (0.46 + 0.085 * Math.cos(u + 0.7) + 0.025 * Math.sin(3 * u)) * (1 + wave * 0.23 * travelling + tension * 0.15 * Math.cos(u - phase))
  const thickness = 0.105 + 0.025 * Math.sin(u - 0.5)
  const twist = u + 0.32 * Math.sin(2 * u + 0.3) + 0.45 + wave * 0.48 * travelling + twistEnergy * Math.sin(u - phase + 0.5)
  const a = Math.cos(v) * width * (1 + 0.16 * Math.sin(v) ** 2)
  const b = Math.sin(v) * thickness
  const outward = a * Math.cos(twist) - b * Math.sin(twist)
  const depth = a * Math.sin(twist) + b * Math.cos(twist)
  out[0] = ((radial + outward) * Math.cos(u) + 0.11 * Math.sin(2 * u)) * 1.04
  out[1] = ((radial + outward) * Math.sin(u) + 0.08 * Math.cos(2 * u)) * 1.06
  out[2] = 0.2 * Math.sin(2 * u - 0.7) + 0.1 * Math.cos(u) + depth + wave * 0.18 * Math.sin(u - phase + 0.8)
  return out
}

// Object-space positions. All u harmonics are integral: position AND derivatives
// agree at u=0/2PI. Central partials update the normal and anisotropic tangent.
export const resonanceGLSL = /* glsl */ `
  uniform float uPhase;
  uniform float uWave;
  uniform float uTension;
  uniform float uTwist;
  varying vec2 vPhaseUv;
  vec3 ribbonPosition(vec2 st) {
    float u = st.x * 6.28318530718, v = st.y * 6.28318530718;
    float travelling = sin(u - uPhase);
    float counter = sin(2.0*u - uPhase + 0.8);
    float radial = 1.43 + 0.09*cos(2.0*u-0.4) + 0.045*sin(3.0*u) + uWave*0.065*counter;
    float width = (0.46 + 0.085*cos(u+0.7) + 0.025*sin(3.0*u)) * (1.0 + uWave*0.23*travelling + uTension*0.15*cos(u-uPhase));
    float thickness = 0.105 + 0.025*sin(u-0.5);
    float twist = u + 0.32*sin(2.0*u+0.3) + 0.45 + uWave*0.48*travelling + uTwist*sin(u-uPhase+0.5);
    float a = cos(v)*width*(1.0+0.16*sin(v)*sin(v));
    float b = sin(v)*thickness;
    float outward = a*cos(twist)-b*sin(twist);
    float depth = a*sin(twist)+b*cos(twist);
    return vec3(((radial+outward)*cos(u)+0.11*sin(2.0*u))*1.04,
      ((radial+outward)*sin(u)+0.08*cos(2.0*u))*1.06,
      0.2*sin(2.0*u-0.7)+0.1*cos(u)+depth+uWave*0.18*sin(u-uPhase+0.8));
  }
  vec3 ribbonU(vec2 st) { return ribbonPosition(st+vec2(0.0004,0.0))-ribbonPosition(st-vec2(0.0004,0.0)); }
  vec3 ribbonV(vec2 st) { return ribbonPosition(st+vec2(0.0,0.0004))-ribbonPosition(st-vec2(0.0,0.0004)); }
`
