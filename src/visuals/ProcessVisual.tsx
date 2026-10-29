import { useEffect,useId,useRef } from 'react'
import { useVisualActivity } from '../hooks/useVisualActivity'
import { MetalDefinitions } from './StudyVisual'
import { processStripPath } from './processGeometry'
import { subscribeVisualFrame } from './visualScheduler'
export function ProcessVisual({step,motion}:{step:number;motion:boolean}){
 const id=`process-${useId().replace(/:/g,'')}`,root=useRef<SVGSVGElement>(null),current=useRef(step),time=useRef(0)
 const active=useVisualActivity(root,motion)
 useEffect(()=>{
  const element=root.current;if(!element)return
  const paths=element.querySelectorAll<SVGPathElement>('[data-process-strip]')
  const paint=()=>{for(let i=0;i<paths.length;i++)paths[i].setAttribute('d',processStripPath(current.current,i,time.current,motion));element.dataset.step=String(step);element.dataset.state=String(current.current)}
  if(!motion){current.current=step;time.current=0}
  paint();element.dataset.running='false'
  if(!active)return
  let unsubscribe=()=>{}
  unsubscribe=subscribeVisualFrame(delta=>{
   time.current+=delta;current.current+=(step-current.current)*(1-Math.exp(-7*delta))
   if(Math.abs(current.current-step)<.001)current.current=step
   paint();element.dataset.running='true'
   if(step===2&&current.current===2){unsubscribe();element.dataset.running='false'}
  })
  return()=>{unsubscribe();element.dataset.running='false'}
 },[step,motion,active])
 return <svg ref={root} className="process-visual" viewBox="0 0 720 480" aria-hidden="true" focusable="false"><MetalDefinitions id={id}/>{[0,1,2,3,4].map(index=><path key={index} data-process-strip="" d={processStripPath(step,index,0,false)} fill={`url(#${id}-silver)`} stroke={`url(#${id}-edge)`} strokeWidth=".7"/>)}</svg>
}
