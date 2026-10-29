type Frame=(delta:number)=>void
const subscribers=new Set<Frame>()
let frame=0,previous=0,budget=0,elapsed=0
const STEP=1/30
function tick(now:number){
 frame=0
 if(previous){const delta=Math.min((now-previous)/1000,.05);budget+=delta;elapsed+=delta}
 previous=now
 // Preserve the sampling remainder: average 30 updates/s, not an accidental
 // every-other-RAF cadence. Delta is actual active time since the last update.
 if(budget>=STEP){const delta=Math.min(elapsed,.05);elapsed=0;budget%=STEP;subscribers.forEach(update=>update(delta))}
 if(subscribers.size&&!frame)frame=requestAnimationFrame(tick)
}
export function subscribeVisualFrame(update:Frame){
 subscribers.add(update)
 if(!frame)frame=requestAnimationFrame(tick)
 return()=>{subscribers.delete(update);if(!subscribers.size){cancelAnimationFrame(frame);frame=0;previous=0;budget=0;elapsed=0}}
}
