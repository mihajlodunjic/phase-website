import { registerStudyRenderer } from '../studyRendererLifetime'
import { createEnergyHistory } from './energyHistory'
﻿import { BufferGeometry,Float32BufferAttribute,InstancedBufferAttribute,InstancedMesh,Matrix4,MeshPhysicalMaterial,LineBasicMaterial,LineSegments,Group,Scene,OrthographicCamera,DirectionalLight,WebGLRenderer,SRGBColorSpace,ACESFilmicToneMapping,Sphere,Vector3 } from 'three'
import { createStudioEnvironment } from '../../scene/studioEnvironment'
import { formLayerImpulse,studyFieldsGLSL } from './studyFields'
import type { StudyFrame } from './studyFields'
import type { StudyId } from '../../data/content'

type Uniforms={uTime:{value:number};uMotion:{value:number};uBass:{value:number};uMid:{value:number};uCount:{value:number}}
const uniforms=(count:number):Uniforms=>({uTime:{value:0},uMotion:{value:0},uBass:{value:0},uMid:{value:0},uCount:{value:count}})
function surfaceGeometry(count:number,segments:number,sides:number,reverse=false){
  const positions=new Float32Array((segments+1)*(sides+1)*3),uvs=new Float32Array((segments+1)*(sides+1)*2),indices:number[]=[]
  for(let i=0;i<=segments;i++)for(let j=0;j<=sides;j++){
    const index=i*(sides+1)+j;positions[index*3]=i/segments;positions[index*3+1]=j/sides
    uvs[index*2]=i/segments;uvs[index*2+1]=j/sides
    if(i<segments&&j<sides){const next=index+sides+1;if(reverse)indices.push(index,index+1,next,next,index+1,next+1);else indices.push(index,next,index+1,next,next+1,index+1)}
  }
  const geometry=new BufferGeometry()
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new Float32BufferAttribute(uvs,2));geometry.setIndex(indices)
  geometry.computeVertexNormals();geometry.computeTangents()
  geometry.setAttribute('aLayer',new InstancedBufferAttribute(Float32Array.from({length:count},(_,i)=>i),1))
  geometry.setAttribute('aPulse',new InstancedBufferAttribute(new Float32Array(count),1))
  geometry.boundingSphere=new Sphere(new Vector3(),4)
  return geometry
}
function material(kind:'form'|'afterimage',values:Uniforms){
  const material=new MeshPhysicalMaterial({color:'#bec5c0',metalness:1,roughness:.285,anisotropy:.18})
  material.customProgramCacheKey=()=>`phase-study-${kind}-v2`
  const fn=kind==='form'?'formPosition(st,aLayer,aPulse)':'afterPosition(st,aLayer)'
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,values)
    const declarations=studyFieldsGLSL+`\nvec3 studyPosition(vec2 st){return ${fn};}`
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\n${declarations}`)
      .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
        vec3 du=studyPosition(uv+vec2(.0004,0.0))-studyPosition(uv-vec2(.0004,0.0));
        vec3 dv=studyPosition(uv+vec2(0.0,.0004))-studyPosition(uv-vec2(0.0,.0004));
        objectNormal=normalize(cross(du,dv))*${kind==='afterimage'?'-1.0':'1.0'};
        #ifdef USE_TANGENT
        objectTangent=normalize(du);
        #endif`)
      .replace('#include <begin_vertex>','vec3 transformed=studyPosition(uv);')
  }
  return material
}
function ghost(count:number,delay:number){
  const values=uniforms(count),positions:number[]=[],uvs:number[]=[],layers:number[]=[]
  for(let row=0;row<count;row+=2)for(let i=0;i<64;i++)for(const u of [i/64,(i+1)/64]){positions.push(0,0,0);uvs.push(u,0);layers.push(row)}
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new Float32BufferAttribute(uvs,2));geometry.setAttribute('aLayer',new Float32BufferAttribute(layers,1));geometry.setAttribute('aPulse',new Float32BufferAttribute(layers.map(()=>0),1))
  const mat=new LineBasicMaterial({color:'#b7c8bd',transparent:true,opacity:.15,depthWrite:false})
  mat.customProgramCacheKey=()=>`phase-after-history-v1`
  mat.onBeforeCompile=shader=>{Object.assign(shader.uniforms,values);shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\n${studyFieldsGLSL}`).replace('#include <begin_vertex>','vec3 transformed=afterPosition(uv,aLayer);')}
  const line=new LineSegments(geometry,mat);line.frustumCulled=false
  return {line,values,delay,dispose(){geometry.dispose();mat.dispose()}}
}
function createObject(kind:'form'|'afterimage',compact:boolean){
  const count=kind==='form'?9:compact?13:19,values=uniforms(count),geometry=surfaceGeometry(count,compact?64:88,8,kind==='afterimage'),mat=material(kind,values)
  const mesh=new InstancedMesh(geometry,mat,count),identity=new Matrix4()
  for(let i=0;i<count;i++)mesh.setMatrixAt(i,identity)
  mesh.frustumCulled=false
  const group=new Group();group.add(mesh)
  const histories=kind==='afterimage'?[ghost(count,.55),ghost(count,1.1)]:[]
  histories.forEach(item=>group.add(item.line))
  const history=createEnergyHistory(),past=[0,0]
  group.rotation.set(kind==='form'?-.8:-.56,kind==='form'?.10:-.08,kind==='form'?-.3:-.2)
  return {group,update(frame:StudyFrame){
    values.uTime.value=frame.motion?frame.time%(Math.PI*(kind==='form'?20:40)):0;values.uMotion.value=frame.motion?1:0;values.uBass.value=frame.bass;values.uMid.value=frame.mid
    mat.envMapIntensity=1+frame.high*.14
    if(kind==='form'){
      const attribute=geometry.getAttribute('aPulse')
      const time=frame.playing||frame.sequence?frame.time:frame.time%4.2
      for(let i=0;i<count;i++)attribute.setX(i,frame.motion?formLayerImpulse(time,i,frame.playing):0)
      attribute.needsUpdate=true
      group.rotation.y=.10+(frame.motion?Math.sin(frame.time*.6)*.045:0)
    }
    history.write(frame.time,frame.bass,frame.mid)
    for(let i=0;i<histories.length;i++){
      const h=histories[i];h.values.uTime.value=(frame.time-h.delay)%(Math.PI*40);h.values.uMotion.value=values.uMotion.value;const valid=history.sample(frame.time-h.delay,past);h.values.uBass.value=past[0];h.values.uMid.value=past[1]
      const tail=frame.sequence?Math.max(0,Math.min(1,((frame.playing?12:8)-frame.time)/1.2)):1
      h.line.material.opacity=frame.motion&&valid?(.12-i*.045)*Math.min(1,Math.max(0,(frame.time-h.delay)*3))*tail:0
    }
  },dispose(){geometry.dispose();mat.dispose();mesh.dispose();histories.forEach(h=>h.dispose())}}
}

const inspect = new URLSearchParams(location.search).has('inspect')
type View={cssWidth:number;cssHeight:number;canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;scene:Scene;camera:OrthographicCamera;object:ReturnType<typeof createObject>;kind:'form'|'afterimage';frames:number;disposed:boolean}
class StudyRendererPool {
  width=innerWidth<=760?720:960
  height=innerWidth<=760?480:680
  renderer:WebGLRenderer
  environment:ReturnType<typeof createStudioEnvironment>
  views=new Set<View>()
  failed=false
  disposed=false
  unregister=()=>{}
  constructor(){
    this.renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})
    this.renderer.setPixelRatio(1);this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.setClearColor(0x000000,0)
    try{this.environment=createStudioEnvironment(this.renderer,innerWidth<=760?128:256)}catch(error){this.renderer.dispose();this.renderer.forceContextLoss();throw error}
    this.renderer.setSize(this.width,this.height,false);this.renderer.setScissorTest(true)
    this.renderer.debug.onShaderError=(gl,program,vertex,fragment)=>{console.error('PHASE study shader failed',gl.getProgramInfoLog(program),gl.getShaderInfoLog(vertex),gl.getShaderInfoLog(fragment));this.markFailure('shader-compile')}
    this.renderer.domElement.addEventListener('webglcontextlost',this.lost)
    window.addEventListener('pagehide',this.pageHide)
    this.unregister=registerStudyRenderer(()=>{this.dispose();if(pool===this)pool=null})
  }
  markFailure(reason:string){this.failed=true;this.views.forEach(view=>{const host=view.canvas.parentElement;if(host){host.dataset.renderer='fallback';host.dataset.failure=reason}})}
  lost=()=>this.markFailure('context-lost')
  pageHide=(event:PageTransitionEvent)=>{if(!event.persisted)this.dispose()}
  add(canvas:HTMLCanvasElement,kind:'form'|'afterimage'){
    const context=canvas.getContext('2d',{alpha:true})
    if(!context||this.failed)throw new Error('Study renderer unavailable')
    const scene=new Scene();scene.environment=this.environment.texture
    const light=new DirectionalLight('#ecede6',.65);light.position.set(-3,4,5);scene.add(light)
    const object=createObject(kind,canvas.getBoundingClientRect().width<420);scene.add(object.group)
    const view:View={cssWidth:0,cssHeight:0,canvas,context,scene,object,kind,camera:new OrthographicCamera(-3,3,2,-2,.1,30),frames:0,disposed:false}
    view.camera.position.z=8;this.views.add(view)
    return {draw:(frame:StudyFrame)=>this.draw(view,frame),dispose:()=>{if(view.disposed)return;view.disposed=true;view.object.dispose();view.scene.clear();this.views.delete(view)}}
  }
  draw(view:View,frame:StudyFrame){
    if(this.failed||view.disposed)return
    const start=inspect?performance.now():0
    const rect=view.canvas.getBoundingClientRect();if(!rect.width||!rect.height)return
    const dpr=Math.min(devicePixelRatio,rect.width<420?1.25:1.2),scale=Math.min(dpr,this.width/rect.width,this.height/rect.height),width=Math.round(rect.width*scale),height=Math.round(rect.height*scale)
    if(view.canvas.width!==width||view.canvas.height!==height){view.canvas.width=width;view.canvas.height=height}
    if(rect.width!==view.cssWidth||rect.height!==view.cssHeight){view.cssWidth=rect.width;view.cssHeight=rect.height
    const aspect=rect.width/rect.height,half=Math.max(1.65,(view.kind==='form'?2.0:2.55)/aspect)
    view.camera.left=-half*aspect;view.camera.right=half*aspect;view.camera.top=half;view.camera.bottom=-half;view.camera.updateProjectionMatrix()
    }
    view.object.update(frame);this.renderer.setViewport(0,0,width,height);this.renderer.setScissor(0,0,width,height);this.renderer.render(view.scene,view.camera);if(this.failed)return
    view.context.clearRect(0,0,width,height);view.context.drawImage(this.renderer.domElement,0,this.height-height,width,height,0,0,width,height)
    const host=view.canvas.parentElement!;host.dataset.renderer='webgl';host.dataset.ready='true'
    if(inspect){
      host.dataset.submitMs=String(performance.now()-start);host.dataset.frames=String(++view.frames);host.dataset.triangles=String(this.renderer.info.render.triangles);host.dataset.calls=String(this.renderer.info.render.calls)
      host.dataset.poolViews=String(this.views.size);host.dataset.poolGeometries=String(this.renderer.info.memory.geometries);host.dataset.poolTextures=String(this.renderer.info.memory.textures);host.dataset.poolPrograms=String(this.renderer.info.programs?.length??0)
      host.dataset.surfaceTime=String(frame.time);host.dataset.historyTime=String(Math.max(0,frame.time-.55))
    }
  }
  dispose(){
    if(this.disposed)return
    this.disposed=true;this.unregister()
    this.failed=true;this.views.forEach(view=>{view.object.dispose();view.disposed=true});this.views.clear()
    this.environment.dispose();this.renderer.domElement.removeEventListener('webglcontextlost',this.lost);window.removeEventListener('pagehide',this.pageHide)
    this.renderer.dispose();this.renderer.forceContextLoss()
  }
}
let pool:StudyRendererPool|null=null
let unavailable=false
export function createStudyView(canvas:HTMLCanvasElement,kind:StudyId){
  if(kind==='echo'||unavailable)throw new Error('Study renderer unavailable')
  try {
    pool??=new StudyRendererPool()
    const owner=pool,view=owner.add(canvas,kind)
    return {draw:view.draw,dispose:view.dispose}
  }
  catch(error){unavailable=true;throw error}
}


