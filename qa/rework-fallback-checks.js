// Expected shader/context failures must expose honest SVG fallback and usable HTML.
async (page) => {
  const results=[];
  for (const mode of ['shader','context']) {
    const context=await page.context().browser().newContext({viewport:{width:390,height:844}});
    try {
      await context.addInitScript(mode=>{
        window.__studyGL=null;
        const native=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(kind,...args){const gl=native.call(this,kind,...args);if(/webgl/.test(kind)&&gl&&!this.isConnected)window.__studyGL=gl;return gl};
        if(mode==='shader'){
          const original=WebGL2RenderingContext.prototype.shaderSource;
          WebGL2RenderingContext.prototype.shaderSource=function(shader,source){return original.call(this,shader,source.includes('vec3 studyPosition')?source+'\n deliberate_study_compile_failure':source)};
        }
      },mode);
      const test=await context.newPage();
      await test.goto('http://127.0.0.1:4173/?inspect=1');
      await test.getByRole('button',{name:'View FORM study',exact:true}).click();
      const host=test.locator('.study-panel:not([hidden]) [data-study-visual]');
      if(mode==='context'){
        await test.locator('.study-panel:not([hidden]) [data-renderer=webgl]').waitFor();
        await test.evaluate(()=>window.__studyGL.getExtension('WEBGL_lose_context').loseContext());
      }
      await test.waitForFunction(()=>!!document.querySelector('.study-panel:not([hidden]) [data-study-visual]').dataset.failure);
      const state=await host.evaluate(e=>({renderer:e.dataset.renderer,failure:e.dataset.failure,svg:getComputedStyle(e.querySelector('svg')).visibility,canvas:getComputedStyle(e.querySelector('canvas')).visibility}));
      if(state.renderer!=='fallback'||state.svg!=='visible'||state.canvas!=='hidden')throw new Error('Failed renderer hid fallback '+JSON.stringify(state));
      await test.getByRole('tab',{name:'ECHO',exact:true}).click();
      await test.getByRole('dialog').getByRole('button',{name:'Play ECHO study',exact:true}).click();
      await test.waitForFunction(()=>document.querySelector('[data-audio-debug]').dataset.state==='playing');
      await test.getByRole('dialog').getByRole('button',{name:'Stop ECHO study',exact:true}).click();
      await test.waitForFunction(()=>document.querySelector('[data-audio-debug]').dataset.voices==='0');
      results.push({mode,...state,htmlAndAudio:true});
    } finally {await context.close()}
  }
  return results;
}
