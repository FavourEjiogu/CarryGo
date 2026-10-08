const CACHE='carrygo-v8';
const PUBLIC_SHELL=['/','/login','/offline','/privacy','/terms','/faq'];
const isPublicPath=(path)=>PUBLIC_SHELL.includes(path);
self.addEventListener('install',(event)=>event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(PUBLIC_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',(event)=>event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE).map((key)=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',(event)=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
  if(event.request.mode==='navigate'){
    if(!isPublicPath(url.pathname))return;
    event.respondWith(fetch(event.request).then((response)=>{
      if(response.ok){const clone=response.clone();void caches.open(CACHE).then((cache)=>cache.put(event.request,clone));}
      return response;
    }).catch(()=>caches.match(event.request).then((cached)=>cached||caches.match('/offline'))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached)=>cached||fetch(event.request).then((response)=>{
    if(response.ok){const clone=response.clone();void caches.open(CACHE).then((cache)=>cache.put(event.request,clone));}
    return response;
  })));
});
