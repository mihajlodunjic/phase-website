import { FORM_EVENTS } from '../../audio/events'
export type StudyFrame = { time: number; motion: boolean; playing: boolean; sequence: boolean; bass: number; mid: number; high: number }
export function formLayerImpulse(time:number,layer:number,playing:boolean){
  let impulse=0
  const count=playing?FORM_EVENTS.length:3
  for(let i=0;i<count;i++){
    const age=time-FORM_EVENTS[i].at-layer*.095
    if(age>=0)impulse+=Math.exp(-age*4.8)*(1-Math.exp(-age*38))*(i%3===0?1:.48)
  }
  return Math.min(1,impulse)
}
export function afterimagePoint(x:number,row:number,time:number,motion:number,bass:number,mid:number,out:number[]){
  out[0]=x
  out[1]=row*.13+motion*.065*Math.cos(x*1.2-time*.7+row*.16)
  out[2]=(.26+motion*.16+bass*.08)*Math.sin(x*1.45-time*.8+row*.18)+(.10+mid*.07)*Math.sin(x*2.3+time*.35+row*.09)
  return out
}
export const studyFieldsGLSL=/*glsl*/`
 uniform float uTime,uMotion,uBass,uMid,uCount;
 attribute float aLayer;
 attribute float aPulse;
 vec3 formPosition(vec2 st,float layer,float pulse){
   float u=st.x*6.28318530718,v=st.y*6.28318530718;
   float radius=1.72-layer*.151;
   float local=pulse*uMotion;
   float width=.055*(1.0+local*.12*cos(u-uTime*1.3));
   float radial=radius*(1.0+local*.025*sin(u+layer*.3))+cos(v)*width;
   float z=(8.0-layer)*.018 + .025*sin(3.0*u+layer*.18)
     + local*(.19+.12*sin(u-uTime*1.4)) + sin(v)*.0135;
   z+=uBass*.055*sin(u+layer*.3)*uMotion;
   return vec3(radial*cos(u),radial*sin(u),z+uMid*.035*cos(2.0*u)*uMotion);
 }
 vec3 afterPosition(vec2 st,float layer){
   float x=(st.x*2.0-1.0)*2.2,v=st.y*6.28318530718;
   float spacing=19.0/uCount;
   float row=(layer-(uCount-1.0)*.5)*spacing;
   float y=row*.13+cos(v)*.055*spacing+uMotion*.065*cos(x*1.2-uTime*.7+row*.16);
   float z=(.26+uMotion*.16+uBass*.08)*sin(x*1.45-uTime*.8+row*.18)
      +(.10+uMid*.07)*sin(x*2.3+uTime*.35+row*.09)+sin(v)*.01;
   return vec3(x,y,z);
 }
`

