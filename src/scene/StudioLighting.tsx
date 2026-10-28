import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { BackSide, BoxGeometry, Color, Mesh, MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene } from 'three'

export function StudioLighting() {
  const gl = useThree(state => state.gl)
  const scene = useThree(state => state.scene)
  const invalidate = useThree(state => state.invalidate)

  useEffect(() => {
    // A small virtual photographic studio: silver strips separated by darkness.
    // Captured once in memory. There is no HDRI, texture file or network loader.
    const room = new Scene()
    room.background = new Color('#626664')
    const enclosure = new Mesh(new BoxGeometry(24, 24, 24), new MeshBasicMaterial({ color: '#626664', side: BackSide }))
    room.add(enclosure)
    const panel = (width: number, height: number, position: [number, number, number], intensity: number, color = '#ffffff') => {
      const mesh = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity) }))
      mesh.position.set(...position)
      mesh.lookAt(0, 0, 0)
      room.add(mesh)
    }
    panel(6, 5, [0, 2, 8], 0.35)
    panel(0.35, 8, [-3.5, 2, 5], 5)
    panel(0.2, 6, [5, 1, 1], 7)
    panel(5, 0.55, [0, 5, 1], 4)
    panel(2, 5, [-4, 0, -4], 1.4)
    panel(7, 5, [0, -5, 2], 1, '#050605')
    panel(3, 7, [-4, 1, -3], 1, '#080a09')
    const generator = new PMREMGenerator(gl)
    const target = generator.fromScene(room, 0.01, 0.1, 40, { size: 256 })
    const previous = scene.environment
    scene.environment = target.texture
    invalidate()
    // Source panels are no longer needed once the environment is captured.
    room.traverse(object => {
      if (object instanceof Mesh) {
        object.geometry.dispose()
        ;(object.material as MeshBasicMaterial).dispose()
      }
    })
    generator.dispose()
    return () => {
      scene.environment = previous
      target.dispose()
    }
  }, [gl, scene, invalidate])

  return <directionalLight position={[-3, 4, 5]} intensity={0.7} color="#ecede6" />
}
