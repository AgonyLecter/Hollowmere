'use strict';
// ================= MULTIPLAYER IBRIDO =================
// Visite: carichi il villaggio salvato di un altro giocatore, puoi annaffiare e lasciare regali.
// Presenza: se siete nello stesso villaggio nello stesso momento vi vedete muovere e potete scrivervi.
// Tutto passa da Firebase (nodo "hollowmere"): villaggi/, presenza/, chat/, visite/.

const MP={
 // ---- rete (sostituibile nei test) ----
 ok(){return NET.ok},
 async publish(st){if(!NET.ok||!st.pid||!isFree(st))return;try{await NET.api.set(NET.r('villaggi/'+st.pid),{name:st.name,g:st.g,season:seasonOf(st),sday:seasonDay(st),year:yearOf(st),ts:Date.now(),anim:(st.free.animals||[]).length,built:Object.keys(st.free.built).length})}catch(e){}},
 async list(){if(!NET.ok)return [];try{const D=NET.api,s=await D.get(D.query(NET.r('villaggi'),D.orderByChild('ts'),D.limitToLast(25)));const v=s.val()||{};return Object.entries(v).map(([pid,o])=>Object.assign({pid},o)).sort((a,b)=>(b.ts||0)-(a.ts||0))}catch(e){return []}},
 async load(pid){return NET.load(pid)},
 async act(owner,a){if(!NET.ok)return;try{await NET.api.push(NET.r('visite/'+owner),Object.assign({ts:Date.now()},a))}catch(e){}},
 inbox(pid,cb){if(!NET.ok)return null;const D=NET.api,ref=NET.r('visite/'+pid);return D.onChildAdded(ref,s=>{cb(s.val()||{});D.remove(s.ref).catch(()=>{})})},
 presence(village,me,cb){if(!NET.ok)return null;const D=NET.api,mine=NET.r(`presenza/${village}/${me}`);try{D.onDisconnect(mine).remove()}catch(e){}
  const off=D.onValue(NET.r('presenza/'+village),s=>cb(s.val()||{}));return {send:v=>D.set(mine,v).catch(()=>{}),stop:()=>{try{off&&off()}catch(e){}D.remove(mine).catch(()=>{})}}},
 chat(village,cb){if(!NET.ok)return null;const D=NET.api,t0=Date.now();return D.onChildAdded(D.query(NET.r('chat/'+village),D.limitToLast(8)),s=>{const v=s.val()||{};if((v.ts||0)>=t0-2000)cb(v)})},
 async say(village,m){if(!NET.ok)return;try{await NET.api.push(NET.r('chat/'+village),m)}catch(e){}},
};
G.others={};

// ---------- presenza ----------
let PRES=null,PRES_V=null,PRES_T=0,CHAT_OFF=null,INBOX_OFF=null;
async function presenceJoin(village){const st=G.st,me=(G.visit?G.home:st).pid;presenceLeave();if(!MP.ok()||!me)return;if(NET.own)await NET.own(me);PRES_V=village;G.others={};
 PRES=MP.presence(village,me,all=>{const now=performance.now();for(const pid in all){if(pid===me)continue;const v=all[pid],o=G.others[pid]||(G.others[pid]={x:v.x,y:v.y,anim:0});Object.assign(o,{name:v.name,g:v.g,tx:v.x,ty:v.y,dir:v.dir|0,moving:!!v.mv,map:v.map,seen:now})}
  for(const pid in G.others)if(!all[pid])delete G.others[pid]});
 CHAT_OFF=MP.chat(village,m=>{const o=Object.values(G.others).find(o=>o.name===m.n);AU.play('blip');UI.toast(`${m.n}: ${m.t}`);G.chatB=G.chatB||[];G.chatB.push({who:m.n,t:m.t,life:5,o})})}
function presenceLeave(){if(PRES)PRES.stop();PRES=null;if(CHAT_OFF)try{CHAT_OFF()}catch(e){}CHAT_OFF=null;G.others={}}
function mpTick(dt){if(!PRES||G.mode!=='game')return;const p=G.player,st=G.st;PRES_T-=dt;
 if(PRES_T<=0){PRES_T=p.moving?.25:3;PRES.send({name:(G.visit?G.home:st).name,g:(G.visit?G.home:st).g,x:Math.round(p.x),y:Math.round(p.y),dir:p.dir,mv:p.moving?1:0,map:G.map.id,ts:Date.now()})}
 const now=performance.now();for(const pid in G.others){const o=G.others[pid];if(now-o.seen>15000){delete G.others[pid];continue}const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy);if(d>120){o.x=o.tx;o.y=o.ty}else if(d>.5){const k=Math.min(1,dt*8);o.x+=dx*k;o.y+=dy*k}o.anim=(o.anim||0)+(o.moving?dt*9:0)}
 if(G.chatB)for(const b of G.chatB)b.life-=dt;if(G.chatB)G.chatB=G.chatB.filter(b=>b.life>0)}
function drawOther(o){const k='mp_'+(o.g==='f'?'f':'m');if(!LOOKS[k])LOOKS[k]=PLAYER_LOOKS[o.g==='f'?'f':'m'];drawSprite(k,o);
 ctx.font='8px "Silkscreen","Pixelify Sans",monospace';ctx.textAlign='center';const t=o.name||'?',w=Math.ceil(ctx.measureText(t).width)+6,X=Math.round(o.x),Y=Math.round(o.y-36);ctx.fillStyle='rgba(18,11,16,.75)';ctx.fillRect(X-w/2,Y-8,w,10);ctx.fillStyle='#bfe3ff';ctx.fillText(t,X,Y)}
function drawChatBubbles(){if(!G.chatB)return;const me=(G.visit?G.home:G.st).name;ctx.font='8px "Silkscreen","Pixelify Sans",monospace';ctx.textAlign='center';
 for(const b of G.chatB){const o=b.who===me?G.player:Object.values(G.others).find(o=>o.name===b.who);if(!o)continue;const t=b.t.slice(0,40),w=Math.ceil(ctx.measureText(t).width)+8,X=Math.round(o.x),Y=Math.round(o.y-50);
  ctx.fillStyle='#3b1f0e';ctx.fillRect(X-w/2-1,Y-10,w+2,13);ctx.fillStyle='#eaf6ff';ctx.fillRect(X-w/2,Y-9,w,11);ctx.fillStyle='#1a2a3a';ctx.fillText(t,X,Y)}}
async function chatSay(){if(!PRES_V){UI.toast('Non c\'è nessuno con cui parlare: serve la connessione.');return}
 const t=await new Promise(res=>{UI.open(`<h2>Scrivi</h2><input class="tx" id="chatIn" maxlength="60" placeholder="Un saluto, una domanda…" autocomplete="off"><p style="text-align:right;margin-top:6px"><button class="btn" data-close>Annulla</button> <button class="btn" id="chatOk">Invia</button></p>`,()=>res(null));
  const go=()=>{const v=$('#chatIn').value.trim().replace(/[<>]/g,'').slice(0,60);UI._mclose=null;UI.close();res(v||null)};$('#chatOk').onclick=go;UI.onEnter=go;setTimeout(()=>$('#chatIn')&&$('#chatIn').focus(),50)});
 if(!t)return;const me=(G.visit?G.home:G.st).name;MP.say(PRES_V,{n:me,t,ts:Date.now()});G.chatB=G.chatB||[];G.chatB.push({who:me,t,life:5})}

// ---------- viaggi ----------
async function travelMenu(){const st=G.visit?G.home:G.st;if(!isFree(st))return false;
 if(!MP.ok()){UI.toast('Per visitare altri villaggi serve la connessione alla Valle (online).','bad');return true}
 st.mpFriends=st.mpFriends||[];UI.open(`<button class="btn mclose" data-close>✕</button><h2>La strada di fuori</h2><p class="small">Il tuo codice: <b>${esc(st.pid)}</b>. Dallo agli amici per farti visitare.</p><p class="small">Cerco i villaggi…</p>`);
 const list=(await MP.list()).filter(v=>v.pid!==st.pid);if(!UI.modalOpen)return true;
 const fr=st.mpFriends,row=(v,tag)=>`<div class="mrow"><span><b>${esc(v.name||'?')}</b> <span class="small">${tag||''}</span><br><span class="small">${v.season!=null?`${SEASONS[v.season]} ${v.sday||''}${v.year>1?' · anno '+v.year:''} · `:''}${v.anim?v.anim+' bestie · ':''}${v.built?v.built+' costruzioni':''}</span></span><button class="btn" data-v="${esc(v.pid)}">Visita</button></div>`;
 const known=new Set(fr.map(f=>f.pid));
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>La strada di fuori</h2><p class="small">Il tuo codice: <b>${esc(st.pid)}</b>. Dallo agli amici per farti visitare.</p><p><button class="btn" id="tvMkt">Il mercato del ponte</button></p>`+
  (G.visit?`<p><button class="btn" data-home="1">Torna a casa</button></p>`:'')+
  `<h3>Amici</h3>${fr.length?fr.map(f=>row(Object.assign({},list.find(v=>v.pid===f.pid)||{},f),'')).join(''):'<p class="small">Nessuno, per ora. Aggiungi un amico con il suo codice.</p>'}`+
  `<p><input class="tx" id="frIn" maxlength="9" placeholder="HM-XXXXXX" style="width:50%;text-transform:uppercase"> <button class="btn" id="frAdd">Aggiungi amico</button> <button class="btn" id="frInv">Invita</button></p><p class="small">«Invita» manda il tuo villaggio all'amico: lo troverà qui anche se adesso è offline. I villaggi si visitano sempre, anche quando il padrone non c'è.</p>`+
  `<h3>Villaggi vicini</h3>${list.filter(v=>!known.has(v.pid)).slice(0,10).map(v=>row(v)).join('')||'<p class="small">Nessun altro villaggio, per ora.</p>'}`);
 $('#mbox').querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{UI._mclose=null;UI.close();startVisit(b.dataset.v)});
 const h=$('#mbox').querySelector('[data-home]');if(h)h.onclick=()=>{UI._mclose=null;UI.close();endVisit()};
 {const mk=$('#tvMkt');if(mk)mk.onclick=()=>{UI._mclose=null;marketMenu()};const iv=$('#frInv');if(iv)iv.onclick=()=>{const c=$('#frIn').value.trim().toUpperCase();UI._mclose=null;UI.close();inviteFriend(c)}}
 $('#frAdd').onclick=async()=>{const c=$('#frIn').value.trim().toUpperCase();if(!/^HM-[A-Z0-9]{6}$/.test(c)){UI.toast('Il codice è fatto così: HM-XXXXXX.');return}if(c===st.pid){UI.toast('Quello è il tuo codice.');return}
  const s=await MP.load(c);if(!s){UI.toast('Nessun villaggio con questo codice.','bad');return}if(!fr.some(f=>f.pid===c))fr.push({pid:c,name:s.name});AU.play('ok');UI.toast(`${s.name} aggiunto agli amici.`);UI._mclose=null;UI.close();travelMenu()};
 return true}
async function startVisit(pid){const home=G.visit?G.home:G.st;if(G.visit)await endVisit(true);
 const s=await MP.load(pid);if(!s){UI.toast('Quel villaggio non risponde.','bad');return}if(!s.free){UI.toast(`${s.name} non ha ancora finito la storia: il suo villaggio è ancora chiuso nel recinto.`);return}
 G.cut++;try{await UI.fade(1,500);
  const v=JSON.parse(JSON.stringify(s));v.inv=home.inv;v.sel=home.sel;v.money=home.money;v.energy=home.energy;v.time=home.time;v.name=home.name;v.g=home.g;v.talked={};v.flags=Object.assign({},v.flags,{met:home.flags.met});
  home.flags.mpVisited=1;G.home=home;G.visit={pid,name:s.name,watered:0,gifts:0};G.st=v;rebuildMaps();G.map=G.maps.main;snapNPCs();G.amb=null;setPos(G.player,44,41,3);updateCam(0);
  await UI.card('In visita',`Il villaggio di ${s.name}`,`${dateLabel(v)}. Puoi annaffiare i suoi campi e lasciargli un regalo nella cassetta delle spedizioni.`,false,true,1200);await UI.fade(0,600);
  presenceJoin(pid);UI.hud();UI.quest()}finally{G.cut--}}
async function endVisit(quiet){if(!G.visit)return;const v=G.st,h=G.home,vis=G.visit;h.inv=v.inv;h.sel=v.sel;h.money=v.money;h.energy=v.energy;h.time=v.time;
 G.cut++;try{if(!quiet)await UI.fade(1,500);G.st=h;G.visit=null;G.home=null;rebuildMaps();G.map=G.maps.main;snapNPCs();G.amb=null;setPos(G.player,44,41,3);updateCam(0);
  if(!quiet){await UI.fade(0,600);UI.toast(`Sei tornat${h.g==='f'?'a':'o'} a casa.${vis.watered?` Hai annaffiato ${vis.watered} piante di ${vis.name}.`:''}`)}
  presenceJoin(h.pid);NET.save(h);UI.hud();UI.quest();UI.hotbar()}finally{G.cut--}}
// azioni da ospite: annaffiare, lasciare regali, tornare
function visitAct(fx,fy){if(!G.visit)return false;const st=G.st,m=G.map,it=selItem(),o=m.objAt(fx,fy),f=st.farm[fkey(fx,fy)];
 if(o&&o.act==='bridge'||fy>=42&&fx>=43&&fx<=46){travelMenu();return true}
 if(it&&it.id==='can'&&f){if(f.w){UI.toast('Questa è già bagnata.');return true}if(!useEnergy(1))return true;f.w=true;AU.play('water');burst('water',fx*16+8,fy*16+4,10);G.visit.watered++;MP.act(G.visit.pid,{t:'water',k:fkey(fx,fy),day:st.day,from:G.home.name});return true}
 if(o&&o.act==='bin'){giftMenu();return true}
 UI.toast(`Sei ospite da ${G.visit.name}: puoi annaffiare e lasciare regali nella cassetta. Al ponte torni a casa.`);return true}
function giftMenu(){const st=G.st,L=st.inv.map((s,i)=>[s,i]).filter(([s])=>s&&ITEMS[s.id].t!=='key'&&ITEMS[s.id].t!=='tool');
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>Un regalo per ${esc(G.visit.name)}</h2><p class="small">Lo troverà nella sua cassetta delle spedizioni.</p>`+(L.length?L.map(([s,i])=>`<div class="mrow"><canvas data-i="${s.id}" width="32" height="32"></canvas><span>${ITEMS[s.id].n} <span class="small">(${s.n})</span></span><button class="btn" data-g="${i}">Regala 1</button></div>`).join(''):'<p>Non hai niente da regalare.</p>'));
 $('#mbox').querySelectorAll('canvas[data-i]').forEach(c=>c.getContext('2d').drawImage(ICON[c.dataset.i],0,0));
 $('#mbox').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const s=st.inv[+b.dataset.g];if(!s)return;const id=s.id;removeItem(id,1);MP.act(G.visit.pid,{t:'gift',item:id,n:1,from:G.home.name});G.visit.gifts++;AU.play('ok');UI.toast(`Hai lasciato ${ITEMS[id].n} per ${G.visit.name}.`);UI._mclose=null;giftMenu()})}
// ---------- posta in arrivo: chi è passato da te ----------
function inboxStart(){const st=G.st;if(INBOX_OFF||!isFree(st)||!st.pid)return;INBOX_OFF=MP.inbox(st.pid,a=>inboxApply(a))||null}
function inboxApply(a){const st=G.visit?G.home:G.st;if(!st||!isFree(st))return;st.flags.mpVisited=1;st.mailbox=st.mailbox||[];G.inboxN=G.inboxN||{};
 if(a.t==='water'){const f=st.farm[a.k];if(f&&a.day===st.day&&f.c){f.w=true;const k=a.from||'Qualcuno';G.inboxN[k]=(G.inboxN[k]||0)+1;clearTimeout(G.inboxT);G.inboxT=setTimeout(()=>{for(const n in G.inboxN)UI.toast(`Visita di ${n}: ha annaffiato ${G.inboxN[n]} ${G.inboxN[n]===1?'pianta':'piante'} nei tuoi campi.`);G.inboxN={}},800)}}
 else if(a.t==='sale'&&ITEMS[a.item]){st.money+=(+a.price||0);UI.hud();AU.play('coin');UI.toast(`Mercato: ${a.from||'qualcuno'} ha comprato ${a.n} × ${ITEMS[a.item].n}. +${SC(+a.price||0)}`);NET.save(st)}
 else if(a.t==='invite'){inviteReceived(a,st);NET.save(st)}
 else if(a.t==='gift'&&ITEMS[a.item]){st.mailbox.push({item:a.item,n:a.n||1,from:a.from||'Qualcuno'});UI.toast(`${a.from||'Qualcuno'} ti ha lasciato un regalo nella cassetta delle spedizioni.`)}}
function mailboxTake(){const st=G.st;if(G.visit||!st.mailbox||!st.mailbox.length)return false;const left=[];for(const m of st.mailbox){if(!addItem(m.item,m.n)){left.push(m);continue}UI.toast(`Dalla cassetta: ${ITEMS[m.item].n} — da ${m.from}.`)}st.mailbox=left;AU.play('ok');return true}
// pulsante e tasto per scrivere
{const b=document.getElementById('bChat');if(b)b.addEventListener('pointerdown',e=>{e.stopPropagation();AU.play('ui');chatSay()})}
addEventListener('keydown',e=>{if(e.code==='KeyT'&&G.mode==='game'&&!UI.busy()&&!G.cut&&PRES_V){e.preventDefault();chatSay()}});
