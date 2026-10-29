// Full playback in the new 3D panel, including a non-restarting visual end.
async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:1440,height:900}}),results=[]
 try{
  const test=await context.newPage();await test.goto('http://127.0.0.1:4173/?inspect=1')
  for(const name of ['FORM','AFTERIMAGE']){
   await test.getByRole('button',{name:`View ${name} study`,exact:true}).click();await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor()
   await test.getByRole('dialog').getByRole('button',{name:`Play ${name} study`,exact:true}).click()
   await test.waitForFunction(()=>JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy).elapsed>1.3)
   const sync=await test.evaluate(()=>({energy:JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy),surface:+document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.surfaceTime}))
   if(Math.abs(sync.surface-sync.energy.elapsed)>.08)throw new Error('Surface and audio clock diverged')
   await test.waitForFunction(()=>document.querySelector('[data-audio-debug]').dataset.reason==='ended',undefined,{timeout:15000})
   await test.waitForFunction(()=>document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.running==='false')
   const before=await test.locator('.study-panel:not([hidden]) [data-study-visual]').getAttribute('data-frames')
   await test.evaluate(async()=>{for(let i=0;i<15;i++)await new Promise(requestAnimationFrame)})
   if(before!==await test.locator('.study-panel:not([hidden]) [data-study-visual]').getAttribute('data-frames'))throw new Error('End restarted a silent preview')
   const data=await test.locator('[data-audio-debug]').evaluate(e=>({...e.dataset}))
   if(data.contexts!=='1'||data.maxVoices!=='1'||data.voices!=='0'||data.nodes!=='4')throw new Error('Audio resources did not settle')
   results.push({name,clockError:Math.abs(sync.surface-sync.energy.elapsed),finished:true,framesFrozen:true,contexts:data.contexts,voices:data.voices})
   await test.keyboard.press('Escape')
  }
  return results
 }finally{await context.close()}
}
