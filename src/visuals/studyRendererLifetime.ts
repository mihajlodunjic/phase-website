// Lightweight ownership gate; importing this does not eagerly load Three.js.
let owners=0,version=0
const disposers=new Set<()=>void>()
export function attachStudyRenderers(){
 owners++;version++
 let detached=false
 return()=>{if(detached)return;detached=true;if(--owners)return;const revision=++version;queueMicrotask(()=>{if(!owners&&version===revision){for(const dispose of [...disposers])dispose();disposers.clear()}})}
}
export function registerStudyRenderer(dispose:()=>void){disposers.add(dispose);return()=>{disposers.delete(dispose)}}
