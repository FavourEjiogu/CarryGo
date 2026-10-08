const CACHE='carrygo-v8';const PUBLIC_PAGES=new Set(['/','/login','/offline','/faq','/privacy','/terms','/testimonials']);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...PUBLIC_PAGES])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('carrygo-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
 const destination=e.request.destination;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request).then(r=>{
     if(r.ok&&PUBLIC_PAGES.has(u.pathname)){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
     return r;
   }).catch(()=>caches.match(e.request).then(r=>r||caches.match('/offline'))));
   return;
 }
 if(['style','script','image','font'].includes(destination)){
   e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
     if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
     return r;
   })));
 }
});