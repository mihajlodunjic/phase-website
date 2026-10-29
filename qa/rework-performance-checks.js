// Warm study-view cadence, submission/copy cost and stable shared GPU resources.
async(page)=>{
 const results=[],browser=page.context().browser()
 for(const [width,height,dpr] of [[1440,900,1],[390,844,3]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,isMobile:width===390,hasTouch:width===390})
  try{
   const test=await context.newPage();await test.goto('http://127.0.0.1:4173/?inspect=1')
   await test.locator('.phase-visual[data-ready=true]').waitFor()
   const result={width,height,dpr,studies:[]}
   for(const name of ['FORM','AFTERIMAGE']){
    await test.getByRole('button',{name:`View ${name} study`,exact:true}).click();await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor()
    await test.getByRole('button',{name:'Replay motion',exact:true}).click()
    await test.evaluate(async()=>{for(let i=0;i<12;i++)await new Promise(requestAnimationFrame)})
    const sample=await test.evaluate(async()=>{
     const root=document.querySelector('.study-panel:not([hidden]) [data-study-visual]'),before=+root.dataset.frames,start=performance.now(),intervals=[],submissions=[],longTasks=[]
     const observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>longTasks.push(e.duration)));observer.observe({type:'longtask'})
     let previous=await new Promise(requestAnimationFrame)
     for(let i=0;i<100;i++){const now=await new Promise(requestAnimationFrame);intervals.push(now-previous);previous=now;submissions.push(+root.dataset.submitMs)}
     observer.disconnect();intervals.sort((a,b)=>a-b);submissions.sort((a,b)=>a-b)
     return{duration:performance.now()-start,updates:+root.dataset.frames-before,raf:{p50:intervals[50],p95:intervals[95],max:intervals[99]},submissionMs:{p50:submissions[50],p95:submissions[95],max:submissions[99]},longTasks,triangles:root.dataset.triangles,calls:root.dataset.calls,geometries:root.dataset.poolGeometries,textures:root.dataset.poolTextures,programs:root.dataset.poolPrograms,buffer:[root.querySelector('canvas').width,root.querySelector('canvas').height]}
    })
    result.studies.push({name,...sample})
    if(sample.updates<30||sample.updates>100)throw new Error('Study update cadence outside expected range')
    await test.keyboard.press('Escape')
   }
   results.push(result)
  }finally{await context.close()}
 }
 return results
}
