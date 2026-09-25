// Daily Garden service worker: works fully offline after the first visit
var CACHE = 'dailygarden-v1.0';
var FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
// Serve from cache first (instant, offline), refresh the cache in the background when online
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request, {ignoreSearch:true}).then(function(hit){
      var net = fetch(e.request).then(function(res){ if(res && res.ok) c.put(e.request, res.clone()); return res; }).catch(function(){ return hit; });
      return hit || net;
    });
  }));
});
