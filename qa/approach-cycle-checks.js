// Real timers: automatic progression, manual reset and activity/preference gates.
async (page) => {
 const context=await page.context().browser().newContext({viewport:{width:1440,height:900}});
 const result={errors:[],auto:[],manual:false,gates:[],mobile:[]};
 const assert=(value,message)=>{if(!value)throw new Error(message)};
 try{
  await context.addInitScript(()=>{window.__hidden=false;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__hidden})});
  const test=await context.newPage();test.on('pageerror',e=>result.errors.push(e.message));
  await test.goto('http://127.0.0.1:4173/?inspect=1');
  const section=test.locator('#approach');await section.scrollIntoViewIfNeeded();
  const selected=()=>section.locator('button[aria-pressed=true]').innerText();
  const expectStep=async name=>test.waitForFunction(name=>document.querySelector('#approach button[aria-pressed=true]').textContent.startsWith(name),name,{timeout:5500});
  for(const name of ['Shape','Refine','Listen']){await expectStep(name);result.auto.push(name)}
  await test.screenshot({path:'artifacts/qa/approach-auto-desktop.png'});
  await test.waitForTimeout(1800);
  await section.getByRole('button',{name:'Refine',exact:true}).click();
  await test.waitForTimeout(3100);assert((await selected()).startsWith('Refine'),'Manual click did not reset dwell');
  await expectStep('Listen');result.manual=true;
  // Clicking the already-selected step must also grant a full reading interval.
  await test.waitForTimeout(1800);await section.getByRole('button',{name:'Listen',exact:true}).click();
  await test.waitForTimeout(3100);assert((await selected()).startsWith('Listen'),'Current-step click did not reset dwell');await expectStep('Shape');
  await test.evaluate(()=>document.querySelector('.motion-control').click());
  const paused=await selected();await test.waitForTimeout(4300);assert(await selected()===paused,'Motion off cycled');
  await section.getByRole('button',{name:'Refine',exact:true}).focus();await test.keyboard.press('Enter');assert((await selected()).startsWith('Refine'),'Keyboard choice failed');result.gates.push('motion-off + keyboard');
  await test.evaluate(()=>document.querySelector('.motion-control').click());
  await test.evaluate(()=>{window.__hidden=true;document.dispatchEvent(new Event('visibilitychange'))});
  await test.waitForTimeout(4300);assert((await selected()).startsWith('Refine'),'Hidden tab cycled');result.gates.push('hidden');
  await test.evaluate(()=>{window.__hidden=false;document.dispatchEvent(new Event('visibilitychange'))});
  await expectStep('Listen');
  await test.emulateMedia({reducedMotion:'reduce'});const reduced=await selected();await test.waitForTimeout(4300);assert(await selected()===reduced,'Reduced motion cycled');result.gates.push('reduced-motion');
  await test.emulateMedia({reducedMotion:'no-preference'});
  await test.evaluate(()=>scrollTo({top:0,behavior:'instant'}));const offscreen=await selected();await test.waitForTimeout(4300);assert(await selected()===offscreen,'Offscreen cycled');result.gates.push('offscreen');
  await test.getByRole('button',{name:'Start a project',exact:true}).first().click();
  await test.evaluate(()=>document.querySelector('#approach').scrollIntoView({block:'center',behavior:'instant'}));
  const modal=await selected();await test.waitForTimeout(4300);assert(await selected()===modal,'Obscured section cycled');result.gates.push('modal');await test.keyboard.press('Escape');
  for(const [width,height] of [[390,844],[320,568]]){
   await test.setViewportSize({width,height});await section.scrollIntoViewIfNeeded();
   await section.getByRole('button',{name:'Listen',exact:true}).click();await expectStep('Shape');
   assert(await test.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Mobile overflow');
   await section.getByRole('button',{name:'Refine',exact:true}).click();assert((await selected()).startsWith('Refine'),'Mobile click failed');
   await test.screenshot({path:'artifacts/qa/approach-auto-'+width+'.png'});result.mobile.push(width);
  }
  assert((await test.locator('[data-audio-debug]').getAttribute('data-contexts'))==='0','Visual cycling started audio');
  assert(result.errors.length===0,'Browser errors');return result;
 }finally{await context.close()}
}
