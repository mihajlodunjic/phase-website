import { BackSide, BoxGeometry, Color, Mesh, MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene } from 'three'
import type { WebGLRenderer } from 'three'

/** Captured procedural studio, owned by the caller. No files or media loaders. */
export function createStudioEnvironment(renderer: WebGLRenderer,size=256) {
  const room = new Scene()
  room.background = new Color('#39403c')
  room.add(new Mesh(new BoxGeometry(24,24,24),new MeshBasicMaterial({color:'#39403c',side:BackSide})))
  const panel=(width:number,height:number,position:[number,number,number],intensity:number,color='#ffffff')=>{
    const mesh=new Mesh(new PlaneGeometry(width,height),new MeshBasicMaterial({color:new Color(color).multiplyScalar(intensity)}))
    mesh.position.set(...position);mesh.lookAt(0,0,0);room.add(mesh)
  }
  panel(8,6,[-1,3,7],0.9);panel(.35,8,[-3.5,2,5],4);panel(.2,6,[5,1,1],5);panel(5,.55,[0,5,1],2.8)
  panel(2,5,[-4,0,-4],1.4);panel(7,5,[0,-5,2],1,'#050605');panel(3,7,[-4,1,-3],1,'#080a09')
  const generator=new PMREMGenerator(renderer)
  try { return generator.fromScene(room,.01,.1,40,{size}) }
  finally {
    room.traverse(object=>{if(object instanceof Mesh){object.geometry.dispose();(object.material as MeshBasicMaterial).dispose()}})
    generator.dispose()
  }
}
