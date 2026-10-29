// Motion rework proof: native renderer, multiple instants, pixels, audio and lifecycle.
async (page) => {
 const browser=page.context().browser(),results={layouts:[],errors:[],formBounds:[],cycles:[]}
 const assert=(v,m)=>{if(!v)throw new Error(m)}
 const context=await browser.newContext({viewport:{width:1440,height:900}})
 try{
  await context.addInitScript(()=>{
   window.__phaseGL={created:0,live:0,max:0,contexts:[]}
   const native=HTMLCanvasElement.prototype.getContext,seen=new Set()
   HTMLCanvasElement.prototype.getContext=function(kind,...args){const value=native.call(this,kind,...args);if(/webgl/.test(kind)&&value&&!seen.has(value)){seen.add(value);const stats=window.__phaseGL;stats.created++;stats.live++;stats.max=Math.max(stats.max,stats.live);stats.contexts.push(value);this.addEventListener('webglcontextlost',()=>stats.live--,{once:true})}return value}
  })
  const test=await context.newPage()
  test.on('pageerror',error=>results.errors.push(error.message));test.on('console',m=>{if(m.type()==='error')results.errors.push(m.text())})
  await test.goto('http://127.0.0.1:4173/?inspect=1')
  await test.locator('.phase-visual[data-ready=true]').waitFor()
  results.hero=await test.locator('.phase-visual').evaluate(e=>({renderer:e.dataset.renderer,material:e.dataset.material,webgl:!!e.querySelector('canvas').getContext('webgl2')}))
  assert(results.hero.webgl&&results.hero.material==='shader','Hero is not native WebGL shader output')
  await test.waitForFunction(()=>Number(document.querySelector('.phase-visual').dataset.time)>.7)
  await test.screenshot({path:'artifacts/qa/rework-final-hero-t1.png'})
  const first=JSON.parse(await test.locator('.phase-visual').getAttribute('data-pose'))
  await test.waitForFunction(()=>Number(document.querySelector('.phase-visual').dataset.time)>2.9)
  await test.screenshot({path:'artifacts/qa/rework-final-hero-t3.png'})
  const later=JSON.parse(await test.locator('.phase-visual').getAttribute('data-pose'))
  assert(later.phase-first.phase>1&&later.wave>.9,'No visible-period wave advancement')
  results.hero.phases=[first.phase,later.phase]
  await test.getByRole('button',{name:'View FORM study',exact:true}).click()
  const host=test.locator('.study-panel:not([hidden]) [data-study-visual]')
  await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor()
  // Restart after initialization so measurements cover the complete impulse.
  await test.getByRole('button',{name:'Replay motion',exact:true}).click()
  for(const time of [.2,.85,1.65,3.7]){
   await test.waitForFunction(t=>Number(document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.elapsed)>=t,time)
   const bounds=await host.locator('canvas').evaluate(canvas=>{const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let x0=canvas.width,x1=0,y0=canvas.height,y1=0;for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>64){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}return{width:x1-x0+1,height:y1-y0+1,canvasWidth:canvas.width,canvasHeight:canvas.height}})
   assert(bounds.width>bounds.canvasWidth*.55,'FORM collapsed into a small object')
   results.formBounds.push({time,...bounds});await test.screenshot({path:`artifacts/qa/rework-final-form-${time}.png`})
  }
  const widths=results.formBounds.map(b=>b.width),heights=results.formBounds.map(b=>b.height)
  assert(Math.max(...widths)/Math.min(...widths)<1.1&&Math.max(...heights)/Math.min(...heights)<1.15,'FORM outline destabilized')
  await test.waitForFunction(()=>document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.running==='false')
  const ended=await host.getAttribute('data-frames');await test.evaluate(async()=>{for(let i=0;i<15;i++)await new Promise(requestAnimationFrame)})
  assert(ended===await host.getAttribute('data-frames'),'Finite FORM preview kept rendering')
  await test.getByRole('tab',{name:'AFTERIMAGE',exact:true}).click();await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor()
  await test.waitForFunction(()=>Number(document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.elapsed)>.7)
  await test.screenshot({path:'artifacts/qa/rework-final-afterimage-t1.png'})
  const pixelHash=()=>host.locator('canvas').evaluate(canvas=>{const p=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let sum=0;for(let i=0;i<p.length;i+=64)sum=(Math.imul(sum,31)+p[i])|0;return sum})
  const hash=await pixelHash()
  await test.waitForFunction(()=>Number(document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.elapsed)>2.7)
  assert(hash!==await pixelHash(),'AFTERIMAGE surface pixels did not change')
  results.afterimage=await host.evaluate(e=>({time:+e.dataset.surfaceTime,history:+e.dataset.historyTime,calls:e.dataset.calls}))
  assert(Math.abs(results.afterimage.time-results.afterimage.history-.55)<.06,'History is not time delayed')
  await test.screenshot({path:'artifacts/qa/rework-final-afterimage-t3.png'})
  await test.getByRole('tab',{name:'ECHO',exact:true}).click()
  await test.waitForFunction(()=>Number(document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.elapsed)>.6)
  const signal1=Number(await host.getAttribute('data-signal'))
  await test.waitForFunction(()=>Number(document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.elapsed)>1.5)
  const signal2=Number(await host.getAttribute('data-signal'));assert(signal2>signal1,'ECHO signal did not travel')
  await test.screenshot({path:'artifacts/qa/rework-final-echo.png'});results.echo={signal1,signal2}
  await test.getByRole('dialog').getByRole('button',{name:'Play ECHO study',exact:true}).click()
  await test.waitForFunction(()=>JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy).elapsed>1.15)
  const sync=await test.evaluate(()=>({energy:JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy),signal:+document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.signal}))
  assert(sync.signal>=1&&sync.signal<1.5,'ECHO arrival diverged from the synth clock')
  await test.getByRole('dialog').getByRole('button',{name:'Stop ECHO study',exact:true}).click();results.echo.audioSync=sync.signal
  for(let i=0;i<10;i++){
   await test.getByRole('tab',{name:i%2?'FORM':'AFTERIMAGE',exact:true}).click();await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor()
   results.cycles.push(await test.evaluate(()=>({contexts:window.__phaseGL.live,created:window.__phaseGL.created,max:window.__phaseGL.max,...document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset})))
   assert(results.cycles.at(-1).contexts<=2&&results.cycles.at(-1).created<=2,'WebGL contexts accumulated')
  }
  await test.keyboard.press('Escape')
  await test.locator('#approach').scrollIntoViewIfNeeded()
  const paths=[]
  for(const [i,name] of ['Listen','Shape','Refine'].entries()){
   await test.getByRole('button',{name,exact:true}).click();await test.waitForFunction(step=>Math.abs(+document.querySelector('.approach-main-visual svg').dataset.state-step)<.01,i)
   paths.push(await test.locator('.approach-main-visual [data-process-strip]').first().getAttribute('d'));await test.screenshot({path:`artifacts/qa/rework-final-process-${name.toLowerCase()}.png`})
  }
  assert(new Set(paths).size===3,'Process steps are indistinguishable')
  await test.getByRole('button',{name:'Listen',exact:true}).click();await test.getByRole('button',{name:'Refine',exact:true}).click();await test.getByRole('button',{name:'Shape',exact:true}).click()
  await test.waitForFunction(()=>Math.abs(+document.querySelector('.approach-main-visual svg').dataset.state-1)<.01)
  results.process={differentStates:true,rapidSelection:true}
  await test.emulateMedia({reducedMotion:'reduce'})
  for(const [width,height] of [[1440,900],[1280,720],[390,844],[320,568]]){
   await test.setViewportSize({width,height});await test.goto('http://127.0.0.1:4173/?inspect=1')
   await test.locator('.phase-visual[data-ready=true]').waitFor()
   assert(await test.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Page overflow')
   await test.screenshot({path:`artifacts/qa/rework-final-page-${width}.png`,fullPage:true})
   for(const name of ['FORM','ECHO','AFTERIMAGE']){
    await test.getByRole('button',{name:`View ${name} study`,exact:true}).click();if(name!=='ECHO')await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor()
    const bounds=await test.getByRole('dialog').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,controls:e.querySelector('.panel-audio-controls').getBoundingClientRect().bottom,height:innerHeight}))
    assert(bounds.scroll<=bounds.client&&bounds.controls<height,'Mobile panel overflow')
    const before=await host.getAttribute('data-frames');await test.evaluate(async()=>{for(let i=0;i<10;i++)await new Promise(requestAnimationFrame)})
    assert(before===await host.getAttribute('data-frames'),'Reduced motion kept rendering')
    if(width===320)await test.screenshot({path:`artifacts/qa/rework-final-panel-${name.toLowerCase()}-320.png`})
    await test.keyboard.press('Escape')
   }
   results.layouts.push({width,height})
  }
  results.maxContexts=await test.evaluate(()=>window.__phaseGL.max)
  assert(results.errors.length===0,results.errors.join('\n'))
  return results
 }finally{await context.close()}
}
