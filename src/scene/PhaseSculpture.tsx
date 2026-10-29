import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group } from 'three'
import type { WebGLRenderer } from 'three'
import { createLoopGeometry } from './loopGeometry'
import { createSceneController } from './sceneController'
import type { SceneInputs } from './sceneController'
import { createChromeMaterial, createLoopUniforms } from './shaders/brushedChrome'

type Props = { motion: boolean; active: boolean; inputs: RefObject<SceneInputs>; host: RefObject<HTMLDivElement | null>; shaderFallback: boolean }
type SurfaceProps = Omit<Props, 'inputs'> & {
  compact: boolean
  pivot: RefObject<Group | null>
  controller: ReturnType<typeof createSceneController>
  frameCount: RefObject<number>
}

function LoopSurface({ motion, active, host, shaderFallback, compact, pivot, controller, frameCount }: SurfaceProps) {
  // This owner is keyed by quality/material. React detaches its mesh before the
  // cleanup releases resources, so a disposed geometry cannot be drawn again
  // between a resize effect cleanup and a later setState commit.
  const [resources] = useState(() => {
    const geometry = createLoopGeometry(compact ? 144 : 208, compact ? 40 : 56)
    const uniforms = createLoopUniforms()
    return { geometry, uniforms, material: createChromeMaterial(uniforms, !shaderFallback) }
  })
  const options = useRef({ motion, active, compact })
  options.current.motion = motion
  options.current.active = active
  options.current.compact = compact
  const invalidate = useThree(state => state.invalidate)
  const inspect = new URLSearchParams(window.location.search).has('inspect')

  useEffect(() => {
    if (host.current) {
      host.current.dataset.material = shaderFallback ? 'standard' : 'shader'
      host.current.dataset.quality = compact ? 'compact' : 'full'
    }
    invalidate()
    return () => { resources.geometry.dispose(); resources.material.dispose() }
  }, [resources, compact, shaderFallback, invalidate, host])

  useEffect(() => { invalidate() }, [active, motion, invalidate])

  useFrame((state, delta) => {
    if (!pivot.current) return
    const pose = controller.step(delta, options.current)
    pivot.current.quaternion.copy(controller.orientation)
    pivot.current.position.set(0, pose.lift, pose.retreat)
    pivot.current.scale.setScalar(pose.scale)
    resources.uniforms.uBreath.value = pose.breath
    resources.uniforms.uTwist.value = pose.twist
    resources.material.envMapIntensity = pose.shine
    if (motion && active) state.invalidate()
  })

  const rendered = (renderer: WebGLRenderer) => {
    const element = host.current
    if (!element) return
    if (element.dataset.ready !== 'true') element.dataset.ready = 'true'
    if (!inspect) return
    element.dataset.frames = String(++frameCount.current)
    element.dataset.calls = String(renderer.info.render.calls)
    element.dataset.triangles = String(renderer.info.render.triangles)
    element.dataset.geometries = String(renderer.info.memory.geometries)
    element.dataset.textures = String(renderer.info.memory.textures)
    element.dataset.programs = String(renderer.info.programs?.length ?? 0)
    element.dataset.pose = JSON.stringify(controller.pose)
    element.dataset.orientation = JSON.stringify(controller.orientation.toArray())
    element.dataset.time = String(controller.time)
  }

  return <mesh geometry={resources.geometry} material={resources.material} dispose={null} onAfterRender={rendered} />
}

export function PhaseSculpture(props: Props) {
  const pivot = useRef<Group>(null)
  const [controller] = useState(() => createSceneController(props.inputs.current))
  const frameCount = useRef(0)
  const compact = useThree(state => state.size.width < 600)
  return (
    <group ref={pivot}>
      <group rotation={[0.22, -0.3, -0.36]}>
        <LoopSurface key={`${compact}-${props.shaderFallback}`} {...props} compact={compact} pivot={pivot} controller={controller} frameCount={frameCount} />
      </group>
    </group>
  )
}
