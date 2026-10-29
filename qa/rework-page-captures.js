// Initialize real study renderers before full-page captures; no hidden SVG stand-ins.
async(page)=>{
 const results=[];
 for(const [width,height] of [[1440,900],[1280,720],[390,844],[320,568]]){
  const context=await page.context().browser().newContext({viewport:{width,height}});
  try{
   const test=await context.newPage();await test.goto('http://127.0.0.1:4173/?inspect=1');
   await test.locator('.phase-visual[data-ready=true]').waitFor();
   for(const kind of ['form','afterimage']){
    const host=test.locator('.study-entry [data-motif='+kind+']');await host.scrollIntoViewIfNeeded();
    await test.waitForFunction(k=>document.querySelector('.study-entry [data-motif='+k+']').dataset.renderer==='webgl',kind);
    await test.evaluate(async()=>{for(let i=0;i<45;i++)await new Promise(requestAnimationFrame)});
    await test.screenshot({path:'artifacts/qa/rework-live-'+kind+'-'+width+'.png'});
   }
   await test.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await test.evaluate(async()=>{for(let i=0;i<80;i++)await new Promise(requestAnimationFrame)});
   await test.screenshot({path:'artifacts/qa/rework-live-hero-'+width+'.png'});
   await test.screenshot({path:'artifacts/qa/rework-live-page-'+width+'.png',fullPage:true});
   results.push({width,height,renderers:await test.locator('[data-study-visual]').evaluateAll(es=>es.map(e=>e.dataset.renderer))});
  }finally{await context.close()}
 }
 return results;
}
