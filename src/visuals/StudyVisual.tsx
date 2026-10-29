import { useEffect,useId,useRef,useState } from 'react'
import { useAudio } from '../audio/AudioProvider'
import { audioMatches,mapAudioStudy } from './audioMapping'
import type { StudyId } from '../data/content'
import { useVisualActivity } from '../hooks/useVisualActivity'
import { createAfterimageBands,createFormRings,echoNodes,echoPaths } from './studyGeometry'
import { ECHO_EVENTS } from '../audio/events'
import { mapStudyMotion,studyDuration } from './studyMotion'
import { subscribeVisualFrame } from './visualScheduler'
import type { createStudyView } from './gpu/studyRenderer'
import type { StudyFrame } from './gpu/studyFields'

export const formRings=createFormRings()
const afterimageBands=createAfterimageBands()
export function MetalDefinitions({id}:{id:string}){
 return <defs><linearGradient id={`${id}-silver`} x1="95" y1="70" x2="630" y2="400" gradientUnits="userSpaceOnUse"><stop stopColor="#313d35"/><stop offset=".18" stopColor="#aab8ad"/><stop offset=".23" stopColor="#e9eee6"/><stop offset=".27" stopColor="#617267"/><stop offset=".38" stopColor="#151d18"/><stop offset=".55" stopColor="#9aaba0"/><stop offset=".59" stopColor="#dae2d9"/><stop offset=".65" stopColor="#4d6052"/><stop offset=".85" stopColor="#1e2d22"/><stop offset="1" stopColor="#9faea3"/></linearGradient><linearGradient id={`${id}-edge`} x1="130" y1="110" x2="590" y2="410" gradientUnits="userSpaceOnUse"><stop stopColor="#e2e9dd"/><stop offset=".4" stopColor="#314036"/><stop offset=".66" stopColor="#b8c7b9"/><stop offset="1" stopColor="#263b2b"/></linearGradient></defs>
}
export function FormPaths({id}:{id:string}){return <>{formRings.map((ring,index)=><g key={index} data-ring=""><path d={ring.depth} fill="#26332a" fillRule="evenodd"/><path d={ring.d} fill={`url(#${id}-silver)`} stroke={`url(#${id}-edge)`} strokeWidth=".6" fillRule="evenodd"/></g>)}</>}
type Props={kind:StudyId;motion:boolean;active?:boolean;sequence?:boolean;replay?:number}
export function StudyVisual({kind,motion,active=true,sequence=false,replay=0}:Props){
 const id=`metal-${useId().replace(/:/g,'')}`,{engine,snapshot}=useAudio()
 const audioPlaying=snapshot.status==='playing'&&(snapshot.activeId===kind||kind==='form'&&snapshot.activeId==='phase')
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),elapsed=useRef(0),lastAudioTime=useRef(0),frames=useRef(0)
 const view=useRef<ReturnType<typeof createStudyView>|null>(null)
 const eligible=useVisualActivity(root,active),visible=useRef(eligible);visible.current=eligible
 const [started,setStarted]=useState(false),[ready,setReady]=useState(false)
 const channels=useRef({bass:0,mid:0,high:0})
 const inspect=new URLSearchParams(location.search).has('inspect')
 useEffect(()=>{if(eligible&&kind!=='echo')setStarted(true)},[eligible,kind])
 useEffect(()=>{
   if(!started||kind==='echo')return
   let disposed=false
   void import('./gpu/studyRenderer').then(module=>{
     if(disposed||!canvas.current)return
     view.current=module.createStudyView(canvas.current,kind);setReady(true)
   }).catch(error=>{if(!disposed&&root.current){root.current.dataset.renderer='fallback';root.current.dataset.failure=String(error)}})
   return()=>{disposed=true;view.current?.dispose();view.current=null}
 },[started,kind])
 useEffect(()=>{elapsed.current=0;lastAudioTime.current=0},[kind,replay])
 useEffect(()=>{if(audioPlaying){elapsed.current=0;lastAudioTime.current=0}else{const position=snapshot.lastId===kind?snapshot.position:lastAudioTime.current;elapsed.current=Math.max(elapsed.current,position)}},[audioPlaying,kind])
 useEffect(()=>{
  const element=root.current;if(!element)return
  const rings=element.querySelectorAll<SVGGElement>('[data-ring]'),nodes=element.querySelectorAll<SVGCircleElement>('[data-node]'),bands=element.querySelectorAll<SVGGElement>('[data-band]')
  const routes=[...element.querySelectorAll<SVGPathElement>('[data-route]')],lengths=routes.map(path=>path.getTotalLength()),signal=element.querySelector<SVGGElement>('[data-signal]')
  const pose={compression:0,signal:0,drift:0,wave:0},frame:StudyFrame={time:0,motion,playing:false,sequence,bass:0,mid:0,high:0}
  const paint=(delta:number)=>{
   const playing=audioPlaying&&audioMatches(kind,engine.energy),target=engine.energy,c=channels.current
   for(const band of ['bass','mid','high'] as const){const value=playing?target[band]:0;c[band]+=(value-c[band])*(1-Math.exp(-(value>c[band]?13:3.5)*delta))}
   if(playing)lastAudioTime.current=target.elapsed;
   frame.time=motion?(playing?engine.getPlayheadTime():elapsed.current):0;frame.motion=motion;frame.playing=playing;frame.bass=c.bass;frame.mid=c.mid;frame.high=c.high
   if(view.current&&visible.current)view.current.draw(frame)
   mapStudyMotion(kind,frame.time,sequence,pose);if(playing)mapAudioStudy(kind,target,pose)
   if(!motion){pose.compression=0;pose.signal=3.5;pose.drift=0;pose.wave=0}
   // A readable, bounded SVG rest/preview remains if WebGL cannot initialize.
   if(element.dataset.renderer!=='webgl'){
    for(let i=0;i<rings.length;i++){const pulse=motion?Math.exp(-Math.pow((frame.time-(.5+i*.11))/.24,2)):0;rings[i].setAttribute('transform',`translate(360 ${240-pulse*9}) scale(${1-pulse*.035}) rotate(${pulse*(i%2?2:-2)}) translate(-360 -240)`)}
    for(let i=0;i<bands.length;i++)bands[i].setAttribute('transform',`translate(0 ${Math.sin(frame.time*.8-i*.16)*pose.wave*6})`)
   }
   if(kind==='echo'){
    const t=motion?(playing?frame.time:sequence?Math.min(frame.time,9):frame.time%9):0
    for(let i=0;i<nodes.length;i++){
      const age=t-ECHO_EVENTS[i].at,flash=motion&&age>=0?Math.exp(-age*5.5)*(1-Math.exp(-age*70)):0
      const intensity=playing?flash*(.5+Math.min(.5,target.level+target.high)):flash
      nodes[i].setAttribute('r',String(5+intensity*7));nodes[i].setAttribute('opacity',String(.5+intensity*.5))
    }
    let segment=-1,progress=0
    if(motion)for(let i=0;i<ECHO_EVENTS.length-1;i++)if(t>=ECHO_EVENTS[i].at&&t<ECHO_EVENTS[i+1].at){segment=i;progress=(t-ECHO_EVENTS[i].at)/(ECHO_EVENTS[i+1].at-ECHO_EVENTS[i].at);break}
    routes.forEach((path,i)=>{path.style.strokeDasharray=`${lengths[i]*.16} ${lengths[i]}`;path.style.strokeDashoffset=String(lengths[i]*.16-progress*lengths[i]);path.style.opacity=String(i===segment?.8:0)})
    if(signal){signal.style.opacity=segment>=0?'1':'0';if(segment>=0){const point=routes[segment].getPointAtLength(progress*lengths[segment]);signal.setAttribute('transform',`translate(${point.x} ${point.y})`)}}
    element.dataset.signal=String(segment<0?7:segment+progress)
   }
   element.dataset.running='false'
   if(inspect){element.dataset.frames=String(++frames.current);element.dataset.elapsed=String(elapsed.current);element.dataset.audioEnergy=String(playing?target.level:0);element.dataset.surfaceTime=String(frame.time)}
  }
  if(!motion)elapsed.current=0
  paint(.04)
  if(!eligible||!motion||sequence&&!audioPlaying&&elapsed.current>=studyDuration(kind))return
  element.dataset.running='true'
  let unsubscribe=()=>{}
  unsubscribe=subscribeVisualFrame(delta=>{elapsed.current+=delta;paint(delta);element.dataset.running='true';if(sequence&&!audioPlaying&&elapsed.current>=studyDuration(kind)){unsubscribe();element.dataset.running='false'}})
  return()=>{unsubscribe();element.dataset.running='false'}
 },[kind,motion,eligible,sequence,replay,inspect,audioPlaying,engine,ready])
 return <div ref={root} className={`study-stage motif-${kind}`} data-study-visual="" data-motif={kind} data-renderer={kind==='echo'?'svg':'fallback'} data-audio-reactive={audioPlaying&&motion} aria-hidden="true">
  <svg className="study-visual" viewBox="0 0 720 480" fill="none" focusable="false"><MetalDefinitions id={id}/>
   {kind==='form'&&<FormPaths id={id}/>}
   {kind==='afterimage'&&<>{afterimageBands.map((band,i)=><g key={i} data-band=""><path d={band.d} fill={`url(#${id}-silver)`}/><path d={band.edge} stroke={`url(#${id}-edge)`} strokeWidth=".6"/></g>)}</>}
   {kind==='echo'&&<>{echoPaths.map((d,i)=><g key={i}><path d={d} stroke="#63766a" strokeWidth="1.4" opacity=".62"/><path data-route="" d={d} stroke="#d6edc9" strokeWidth="2.5" strokeLinecap="round" opacity="0"/></g>)}{echoNodes.map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="19" stroke="#7f9285" strokeWidth=".8" opacity=".6"/><circle data-node="" cx={x} cy={y} r="5" fill={i===4?'#d8ff57':'#c9d5cb'}/></g>)}<g data-signal="" opacity="0"><circle r="10" fill="#d8ff57" opacity=".13"/><circle r="3.8" fill="#e7f5de"/></g></>}
  </svg>
  {kind!=='echo'&&<canvas ref={canvas} className="study-surface"/>}
 </div>
}
