// Service worker di Hollowmere: il gioco si installa e si apre anche senza rete.
// Strategia "prima la rete": quando c'è connessione si prende sempre la versione nuova, altrimenti quella salvata.
const CACHE='hollowmere-v3';
const CORE=['index.html', 'css/style.css', 'js/core.js', 'js/art.js', 'js/world.js', 'js/farm.js', 'js/npc.js', 'js/ui.js', 'js/net.js', 'js/life.js', 'js/story.js', 'js/cine.js', 'js/ambient.js', 'js/free.js', 'js/animals.js', 'js/mp.js', 'js/missions.js', 'js/build.js', 'js/garden.js', 'js/relations.js', 'js/feste.js', 'js/farm2.js', 'js/trade.js', 'js/anim.js', 'js/main.js', 'icons/icon-192.png', 'icons/icon-512.png', 'manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
