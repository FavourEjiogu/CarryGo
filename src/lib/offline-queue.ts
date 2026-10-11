const KEY='carrygo:location-queue:v1';
const MAX_AGE_MS=2*60*1000;
const FUTURE_SKEW_MS=30*1000;

export type QueuedLocation={
  taskId:string;
  latitude:number;
  longitude:number;
  accuracy_m:number|null;
  captured_at:string;
  sequence:number;
};

function isFreshQueuedLocation(item:unknown, now=Date.now()):item is QueuedLocation{
  if(!item||typeof item!=='object'||Array.isArray(item))return false;
  const value=item as Partial<QueuedLocation>;
  if(typeof value.taskId!=='string'||!value.taskId)return false;
  if(typeof value.latitude!=='number'||!Number.isFinite(value.latitude)||value.latitude < -90||value.latitude > 90)return false;
  if(typeof value.longitude!=='number'||!Number.isFinite(value.longitude)||value.longitude < -180||value.longitude > 180)return false;
  if(typeof value.accuracy_m!=='number'||!Number.isFinite(value.accuracy_m)||value.accuracy_m < 0||value.accuracy_m > 10000)return false;
  if(typeof value.sequence!=='number'||!Number.isSafeInteger(value.sequence)||value.sequence < 1)return false;
  if(typeof value.captured_at!=='string')return false;
  const timestamp=Date.parse(value.captured_at);
  if(!Number.isFinite(timestamp))return false;
  const age=now-timestamp;
  return age>=-FUTURE_SKEW_MS&&age<=MAX_AGE_MS;
}

export function readLocationQueue():QueuedLocation[]{
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'[]');
    if(!Array.isArray(raw))return [];
    const queue=raw.filter((item)=>isFreshQueuedLocation(item)).slice(-100);
    // Coordinates are intentionally short-lived on-device too; stale offline
    // points are removed instead of replaying a false historical path later.
    if(queue.length!==raw.length)localStorage.setItem(KEY,JSON.stringify(queue));
    return queue;
  }catch{return []}
}

export function queueLocation(item:QueuedLocation){
  if(!isFreshQueuedLocation(item))return;
  const q=readLocationQueue().filter(x=>!(x.taskId===item.taskId&&x.sequence===item.sequence));
  q.push(item);
  try{localStorage.setItem(KEY,JSON.stringify(q.slice(-100)))}catch{}
}

export function removeQueued(taskId:string,sequence:number){
  try{
    const q=readLocationQueue().filter(x=>!(x.taskId===taskId&&x.sequence===sequence));
    localStorage.setItem(KEY,JSON.stringify(q));
  }catch{}
}

export function clearLocationQueue(taskId:string){
  try{
    const q=readLocationQueue().filter(x=>x.taskId!==taskId);
    localStorage.setItem(KEY,JSON.stringify(q));
  }catch{}
}
