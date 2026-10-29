import { useEffect,useState } from 'react'
/** A single introduction, never replayed by a later motion-toggle change. */
export function useHeroIntro(motion:boolean){
 const [intro,setIntro]=useState(motion)
 useEffect(()=>{const timer=setTimeout(()=>setIntro(false),1150);return()=>clearTimeout(timer)},[])
 useEffect(()=>{if(!motion)setIntro(false)},[motion])
 return intro
}
