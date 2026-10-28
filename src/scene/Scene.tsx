import { useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import type { RefObject } from 'react'
import { PhaseSculpture } from './PhaseSculpture'
import { StudioLighting } from './StudioLighting'
import type { SceneInputs } from './sceneController'

function ContextMonitor({ onFailure }: { onFailure: () => void }) {
  const gl = useThree(state => state.gl)
  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', onFailure)
    return () => canvas.removeEventListener('webglcontextlost', onFailure)
  }, [gl, onFailure])
  return null
}

function FitCamera() {
  const camera = useThree(state => state.camera) as PerspectiveCamera
  const size = useThree(state => state.size)
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => {
    if (!size.width || !size.height) return
    // Fit both axes around a conservative 2.15-unit bound, including tilt.
    const halfFov = camera.fov * Math.PI / 360
    const horizontal = Math.atan(Math.tan(halfFov) * size.width / size.height)
    camera.position.set(0, 0, 2.15 / Math.sin(Math.min(halfFov, horizontal)) * 1.04)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, size.width, size.height, invalidate])
  return null
}

type Props = { motion: boolean; active: boolean; inputs: RefObject<SceneInputs>; host: RefObject<HTMLDivElement | null>; onFailure: () => void }

export default function Scene({ motion, active, inputs, host, onFailure }: Props) {
  const [shaderFallback, setShaderFallback] = useState(() => new URLSearchParams(window.location.search).get('surface') === 'standard')
  return (
    <Canvas frameloop="demand" dpr={[1, 1.25]} camera={{ fov: 35, near: 0.1, far: 40, position: [0, 0, 8] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      fallback={null} onCreated={({ gl }) => {
        let failed = false
        gl.debug.onShaderError = (context, program, vertex, fragment) => {
          console.error('PHASE shader compile failed; switching to standard material.',
            context.getProgramInfoLog(program), context.getShaderInfoLog(vertex), context.getShaderInfoLog(fragment))
          if (failed) onFailure()
          else { failed = true; setShaderFallback(true) }
        }
      }}>
      <ContextMonitor onFailure={onFailure} />
      <FitCamera />
      <StudioLighting />
      <PhaseSculpture motion={motion} active={active} inputs={inputs} host={host} shaderFallback={shaderFallback} />
    </Canvas>
  )
}
