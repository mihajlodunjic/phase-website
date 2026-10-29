import { describe,expect,it } from 'vitest'
import { createEnergyHistory } from './energyHistory'
describe('delayed surface history',()=>{
 it('returns earlier energy rather than applying current energy to an old pose',()=>{
  const history=createEnergyHistory(),out=[0,0]
  history.write(0,0,.2);history.write(.5,1,.6);history.write(1,.1,.9)
  expect(history.sample(.25,out)).toBe(true);expect(out[0]).toBeCloseTo(.5);expect(out[1]).toBeCloseTo(.4)
  expect(history.sample(-.1,out)).toBe(false)
 })
 it('has bounded storage and discards history on replay/time reset',()=>{
  const history=createEnergyHistory(8),out=[0,0]
  for(let i=0;i<100;i++)history.write(i,.1,.2)
  expect(history.size).toBe(8);expect(history.sample(90,out)).toBe(false)
  history.write(0,.5,.4);expect(history.size).toBe(1);expect(history.sample(0,out)).toBe(true);expect(out[0]).toBeCloseTo(.5)
 })
})
