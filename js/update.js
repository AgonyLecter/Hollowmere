'use strict';
// ================= AGGIORNAMENTI AUTOMATICI =================
// Ogni minuto (e quando si torna sull'app) il gioco guarda se sul sito c'è una versione nuova: la firma è il
// service worker (sw.js), che cambia a ogni pubblicazione. Se c'è, aspetta un momento tranquillo (niente scene,
// dialoghi, menu, chat, costruzione, visite, miniera), salva, si ricarica e riprende da dove eri, senza menu.

const UPD={v0:null,pending:false,going:false,t:0};
async function updSig(){try{const r=await fetch('sw.js?u='+Date.now(),{cache:'no-store'});if(!r.ok)return null;const s=await r.text();let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return String(h)}catch(e){return null}}
async function updCheck(){if(UPD.pending||!location.protocol.startsWith('http'))return;const s=await updSig();if(!s)return;if(UPD.v0==null){UPD.v0=s;return}
 if(s!==UPD.v0){UPD.pending=true;try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg)await reg.update()}catch(e){}}}
// il momento giusto per ricaricare
function updQuiet(){if(G.mode==='title')return !UI.busy();if(G.mode!=='game')return false;
 return !G.cut&&!UI.busy()&&!G.bm&&!G.visit&&!G.erede&&!G.chase&&!G.festaChase&&!G.fish&&!(typeof CHAT!=='undefined'&&CHAT.open)&&G.map&&G.map.id!=='miniera'&&!G.player.auto}
function updTick(){if(!UPD.pending||UPD.going)return;if(!updQuiet())return;UPD.going=true;
 (async()=>{try{UI.toast('Nuova versione della Valle: aggiorno il gioco…');await sleep(1600);if(!updQuiet()){UPD.going=false;return}
  if(G.mode==='game'&&G.st){const st=G.st,[tx,ty]=ptile(G.player);st.map=G.map.id;st.px=tx;st.py=ty;st.dir=G.player.dir;
   LS.set(isFree(st)?'hm_free':'hm_save',JSON.stringify(Object.assign(st,{ts:Date.now()})));try{await Promise.race([NET.save(st),sleep(3000)])}catch(e){}
   LS.set('hm_resume',JSON.stringify({kind:isFree(st)?'free':'story',ts:Date.now()}))}
  await UI.fade(1,400);location.reload()}catch(e){UPD.going=false}})()}
setInterval(updTick,1000);setInterval(updCheck,60000);setTimeout(updCheck,4000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updCheck()});
// dopo il ricaricamento: si rientra subito nella partita
(async()=>{let r=null;try{r=JSON.parse(LS.get('hm_resume')||'null')}catch(e){}LS.del('hm_resume');if(!r||Date.now()-r.ts>120000)return;
 for(let i=0;i<100&&G.mode!=='title';i++)await sleep(100);if(G.mode!=='title')return;
 for(let i=0;i<40&&!NET.ok&&!NET.netErr;i++)await sleep(100);   // un attimo per la connessione, senza farla aspettare troppo
 let st=null;try{st=JSON.parse(LS.get(r.kind==='free'?'hm_free':'hm_save'))}catch(e){}if(!st)return;
 await startFrom(st);UI.toast('Gioco aggiornato. Sei dove eri.')})();
