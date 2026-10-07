const KEY='carrygo:location-queue:v1';
export type QueuedLocation={taskId:string;latitude:number;longitude:number;accuracy_m:number|null;captured_at:string;sequence:number};
export function readLocationQueue():QueuedLocation[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function queueLocation(item:QueuedLocation){const q=readLocationQueue().filter(x=>!(x.taskId===item.taskId&&x.sequence===item.sequence));q.push(item);try{localStorage.setItem(KEY,JSON.stringify(q.slice(-100)))}catch{}}
export function removeQueued(taskId:string,sequence:number){try{const q=readLocationQueue().filter(x=>!(x.taskId===taskId&&x.sequence===sequence));localStorage.setItem(KEY,JSON.stringify(q))}catch{}}
