/** Fixed memory, time-keyed energy history for delayed deformation copies. */
export function createEnergyHistory(capacity=128){
 const times=new Float64Array(capacity),values=new Float32Array(capacity*2)
 let head=0,count=0,last=-1
 return {
  write(time:number,bass:number,mid:number){
   if(time<last){head=0;count=0}
   if(time===last&&count)return
   times[head]=time;values[head*2]=bass;values[head*2+1]=mid;head=(head+1)%capacity;count=Math.min(capacity,count+1);last=time
  },
  sample(time:number,out:number[]){
   if(!count)return false
   const oldest=(head-count+capacity)%capacity
   if(time<times[oldest])return false
   for(let age=0;age<count;age++){
    const i=(head-1-age+capacity)%capacity
    if(times[i]<=time){
     const next=(i+1)%capacity,weight=age===0?0:Math.max(0,Math.min(1,(time-times[i])/Math.max(.00001,times[next]-times[i])))
     out[0]=values[i*2]+(values[next*2]-values[i*2])*weight;out[1]=values[i*2+1]+(values[next*2+1]-values[i*2+1])*weight
     return true
    }
   }
   return false
  },
  get size(){return count},get capacity(){return capacity},
 }
}
