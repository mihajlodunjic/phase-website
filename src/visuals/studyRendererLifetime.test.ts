import { describe,expect,it,vi } from 'vitest'
import { attachStudyRenderers,registerStudyRenderer } from './studyRendererLifetime'
describe('shared study renderer ownership',()=>{
 it('survives Strict Mode probing and releases page-owned resources once at final detach',async()=>{
  const dispose=vi.fn(),unregister=registerStudyRenderer(dispose)
  attachStudyRenderers()()
  const detach=attachStudyRenderers()
  await Promise.resolve();expect(dispose).not.toHaveBeenCalled()
  detach();await Promise.resolve();expect(dispose).toHaveBeenCalledOnce()
  detach();await Promise.resolve();expect(dispose).toHaveBeenCalledOnce();unregister()
 })
})
