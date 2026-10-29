// GPU elapsed per shared AFTERIMAGE update (one instanced draw plus two history lines).
async(page)=>{
 const results=[]
 for(const [width,height,dpr] of [[1440,900,1],[390,844,3]]){
  const context=await page.context().browser().newContext({viewport:{width,height},deviceScaleFactor:dpr,isMobile:width===390,hasTouch:width===390})
  try{
   await context.addInitScript(()=>{const native=HTMLCanvasElement.prototype.getContext;window.__gl=[];HTMLCanvasElement.prototype.getContext=function(kind,...args){const gl=native.call(this,kind,...args);if(/webgl/.test(kind)&&gl&&!window.__gl.includes(gl))window.__gl.push(gl);return gl}})
   const test=await context.newPage();await test.goto('http://127.0.0.1:4173/?inspect=1');await test.getByRole('button',{name:'View AFTERIMAGE study',exact:true}).click();await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor()
   await test.waitForFunction(()=>+document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.elapsed>1.3)
   const gpu=await test.evaluate(async()=>{
    const hero=document.querySelector('.phase-visual canvas').getContext('webgl2'),gl=window.__gl.find(value=>value!==hero),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),root=document.querySelector('.study-panel:not([hidden]) [data-study-visual]')
    if(!ext)return{available:false}
    const originals={},queries=[]
    for(const method of ['drawElementsInstanced','drawArrays']){originals[method]=gl[method];gl[method]=function(...args){if(queries.length>=180)return originals[method].apply(this,args);const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);try{return originals[method].apply(this,args)}finally{gl.endQuery(ext.TIME_ELAPSED_EXT);queries.push({q,frame:root.dataset.frames})}}}
    try{
     for(let i=0;i<140;i++)await new Promise(requestAnimationFrame)
     const groups=new Map()
     for(const {q,frame} of queries)if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)){const item=groups.get(frame)||{time:0,draws:0};item.time+=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6;item.draws++;groups.set(frame,item)}
     const times=[...groups.values()].filter(item=>item.draws===3).map(item=>item.time).sort((a,b)=>a-b)
     return{available:true,disjoint:!!gl.getParameter(ext.GPU_DISJOINT_EXT),queries:queries.length,completeUpdates:times.length,p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:times.at(-1)}
    }finally{for(const [method,native] of Object.entries(originals))gl[method]=native;queries.forEach(({q})=>gl.deleteQuery(q))}
   })
   results.push({width,height,dpr,gpu})
  }finally{await context.close()}
 }
 return results
}
