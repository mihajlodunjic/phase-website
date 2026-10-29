import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { createStudioEnvironment } from './studioEnvironment'
export function StudioLighting() {
  const gl=useThree(state=>state.gl),scene=useThree(state=>state.scene),invalidate=useThree(state=>state.invalidate)
  useEffect(()=>{
    const target=createStudioEnvironment(gl),previous=scene.environment
    scene.environment=target.texture;invalidate()
    return()=>{scene.environment=previous;target.dispose()}
  },[gl,scene,invalidate])
  return <directionalLight position={[-3,4,5]} intensity={0.7} color="#ecede6" />
}
