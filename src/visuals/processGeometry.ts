// The same five strips continuously morph from independent rhythms to a closed loop.
export function processPoint(state:number,index:number,t:number,time:number,motion:boolean,out:number[]){
 const shape=Math.min(1,Math.max(0,state)),refine=Math.min(1,Math.max(0,state-1))
 const loosePhase=index*.9-(motion?time*(.55+index*.075):0)
 const lineX=-245+t*490,lineY=(index-2)*43+Math.sin(t*Math.PI*2*(1+index*.045)+loosePhase)*25
 const angle=t*Math.PI*2*(.86+refine*.14)+(.35*(1-refine))
 const radius=132+index*18
 const ripple=(1-refine)*Math.sin(angle*2+(motion?time*.45:0)+index*.22)*7
 const loopX=Math.cos(angle)*(radius+ripple),loopY=Math.sin(angle)*(radius+ripple)*.65
 const x=lineX*(1-shape)+loopX*shape,y=lineY*(1-shape)+loopY*shape
 const rotation=-.25
 out[0]=360+x*Math.cos(rotation)-y*Math.sin(rotation)
 out[1]=240+x*Math.sin(rotation)+y*Math.cos(rotation)
 return out
}
export function processStripPath(state:number,index:number,time:number,motion:boolean){
 const point=[0,0],before=[0,0],after=[0,0]
 let path=''
 for(let side=0;side<2;side++)for(let j=0;j<=72;j++){
   const t=(side?72-j:j)/72
   processPoint(state,index,t,time,motion,point);processPoint(state,index,t-.0005,time,motion,before);processPoint(state,index,t+.0005,time,motion,after)
   const dx=after[0]-before[0],dy=after[1]-before[1],length=Math.hypot(dx,dy)||1,sign=side?-1:1
   const width=5.2+index*.35
   path+=`${!side&&!j?'M':'L'}${(point[0]-dy/length*width*sign).toFixed(2)},${(point[1]+dx/length*width*sign).toFixed(2)} `
 }
 return path+'Z'
}
