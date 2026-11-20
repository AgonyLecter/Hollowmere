'use strict';
// ================= UI =================
const NAMES=Object.fromEntries(NPC_DEF);NAMES.voce='Voce dietro la porta';NAMES.cocchiere='Cocchiere';
function fmt(t){const f=G.st&&G.st.g==='f';return String(t).replace(/\{n\}/g,G.st&&G.st.name||(f?'forestiera':'forestiero')).replace(/\{([^{}|]*)\|([^{}|]*)\}/g,(_,a,b)=>f?b:a)}
function glitchText(t,h){const g='▓▒░█#';return t.split('').map(c=>c!==' '&&c!=='\n'&&Math.random()<(h-.5)*.12?g[Math.random()*g.length|0]:c).join('')}
const UI={dlgOpen:false,modalOpen:false,_res:null,_typ:null,_full:'',_choices:null,ci:0,_lock:0,
 init(){
  $('#bPause').onclick=()=>{AU.play('ui');this.pauseKey()};$('#bFull').onclick=()=>goFull();
  document.querySelectorAll('#tmenu button').forEach(b=>b.onclick=()=>{AU.resume();AU.play('ui');TITLE[b.dataset.a]()});
  addEventListener('keydown',e=>{if(!this.dlgOpen||!this._choices)return;if(['ArrowLeft','ArrowUp','KeyA','KeyW'].includes(e.code)){this.ci=(this.ci+this._choices.length-1)%this._choices.length;this.markChoice()}if(['ArrowRight','ArrowDown','KeyD','KeyS'].includes(e.code)){this.ci=(this.ci+1)%this._choices.length;this.markChoice()}});
  try{const v=JSON.parse(LS.get('hm_vol'));if(v)AU.vol=v}catch(e){}
  this.buildHotbar();
 },
 busy(){return this.dlgOpen||this.modalOpen},
 // ---------- dialoghi ----------
 say(who,text,mood,opts){return new Promise(res=>{
  const d=$('#dlg'),choices=Array.isArray(opts)?opts:null,o=(!Array.isArray(opts)&&opts)||{};
  let t=fmt(text||'');if(G.horror>.55&&who)t=glitchText(t,G.horror);
  const hasP=who&&LOOKS[who];d.classList.toggle('np',!hasP);d.classList.toggle('dark',!!o.dark||(mood==='dark'));
  $('#dname').textContent=who?(NAMES[who]||who):'';
  if(hasP){const pc=$('#portrait'),px=pc.getContext('2d');px.imageSmoothingEnabled=false;px.clearRect(0,0,64,64);let md=mood;if(G.horror>.6&&Math.random()<.25&&who!=='player')md='dark';px.drawImage(portrait(who,md),0,0)}
  $('#dchoices').innerHTML='';$('#dnext').style.visibility='hidden';
  d.classList.remove('hide');this.dlgOpen=true;this._res=res;this._choices=choices;this._full=t;this.ci=0;
  const el=$('#dtext');el.textContent='';let i=0;clearInterval(this._typ);
  if(!t){this.finishType();return}
  this._typ=setInterval(()=>{i+=2;el.textContent=t.slice(0,i);if(i%6===0)AU.play('blip');if(i>=t.length)this.finishType()},24);
 })},
 finishType(){clearInterval(this._typ);this._typ=null;$('#dtext').textContent=this._full;
  if(this._choices){const box=$('#dchoices');box.innerHTML='';this._choices.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.onclick=e=>{e.stopPropagation();if(performance.now()<this._lock)return;AU.play('ui');this.closeDlg(i)};b.onpointerdown=e=>e.stopPropagation();box.appendChild(b)});this.markChoice();this._lock=performance.now()+800;box.classList.add('lock');setTimeout(()=>box.classList.remove('lock'),800)}
  else $('#dnext').style.visibility='visible'},
 markChoice(){[...$('#dchoices').children].forEach((b,i)=>b.classList.toggle('cur',i===this.ci))},
 advance(){if(!this.dlgOpen)return;if(this._typ){this.finishType();return}if(this._choices){if(performance.now()<this._lock)return;this.closeDlg(this.ci);return}this.closeDlg()},
 closeDlg(v){$('#dlg').classList.add('hide');this.dlgOpen=false;const r=this._res;this._res=null;this._choices=null;if(r)r(v)},
 toast(t,cls){const d=document.createElement('div');d.className='toast'+(cls?' '+cls:'');d.textContent=fmt(t);const box=$('#toasts');box.appendChild(d);while(box.children.length>4)box.firstChild.remove();setTimeout(()=>d.remove(),2800)},
 // ---------- HUD ----------
 buildHotbar(){const hb=$('#hotbar');hb.innerHTML='';const rw=document.createElement('button');rw.id='hbrow';rw.className='ib';rw.textContent='⇅';rw.onpointerdown=e=>{e.stopPropagation();this.swapRow()};hb.appendChild(rw);for(let i=0;i<10;i++){const s=document.createElement('div');s.className='slot';const c=document.createElement('canvas');c.width=c.height=32;s.appendChild(c);const n=document.createElement('i');s.appendChild(n);s.onpointerdown=e=>{e.stopPropagation();this.selectSlot(i)};hb.appendChild(s)}},
 swapRow(){const st=G.st;if(!st||st.inv.length<=10)return;st.sel=(st.sel+10)%st.inv.length;AU.play('blip');this.hotbar()},
 hotbar(){if(!G.st)return;const st=G.st,base=Math.floor(st.sel/10)*10,sl=[...$('#hotbar').querySelectorAll('.slot')];$('#hbrow').classList.toggle('hide',st.inv.length<=10);$('#hbrow').textContent=base?'⇅2':'⇅1';for(let i=0;i<10;i++){const s=G.st.inv[base+i],el=sl[i],c=el.firstChild,x=c.getContext('2d');x.clearRect(0,0,32,32);if(s&&ICON[s.id])x.drawImage(ICON[s.id],0,0);el.lastChild.textContent=s&&s.n>1?s.n:'';el.classList.toggle('sel',base+i===G.st.sel)}},
 selectSlot(i){if(!G.st||G.mode!=='game')return;i=Math.floor(G.st.sel/10)*10+(i%10);G.st.sel=i;this.hotbar();AU.play('blip');const s=G.st.inv[i];const el=$('#itemname');el.textContent=s?ITEMS[s.id].n+(ITEMS[s.id].d?' — '+ITEMS[s.id].d:''):'';el.style.opacity=1;clearTimeout(this._inT);this._inT=setTimeout(()=>el.style.opacity=0,2200)},
 hud(){const st=G.st;if(!st)return;const t=st.time,h=Math.floor(t/60)%24,mm=t%60;
  $('#cdayt').textContent=dateLabel(st);if(this._wx!==st.weather){this._wx=st.weather;drawWxIcon($('#cwx'),st.weather)}$('#cmark').style.left=clamp((t-360)/1200,0,1)*100+'%';$('#ctime').textContent=`${h}:${String(mm-mm%10).padStart(2,'0')}`;$('#cmoney').textContent=st.money;$('#bChat').classList.toggle('hide',!PRES_V);
  $('#efill').style.height=(st.energy)+'%';$('#efill').style.background=st.energy<25?'linear-gradient(#ffb07a,#c0221e)':'';
  document.body.classList.toggle('corrupt',G.horror>.35);document.body.classList.toggle('corrupt2',G.horror>.7)},
 quest(){if(!G.st)return;{const st=G.st,F=st.flags;if(st.day===1&&!F.tired&&G.mode==='game'&&metCount()>=5&&F.planted>=3){F.tired=1;st.energy=Math.min(st.energy,35);this.hud();this.toast('Il viaggio ti pesa addosso. Torna a casa e dormi: domani è un nuovo giorno.');if(Object.values(st.farm).some(f=>f.c&&!f.w))setTimeout(()=>this.toast('Prima di dormire, annaffia i semi: crescono di notte.'),2900)}}const q=activeQuests().filter(q=>!q.d(G.st));const el=$('#qtext');if(!q.length){el.textContent=fmt(hintText());$('#quest').classList.remove('alarm');return}
  el.textContent=fmt(q[0].t(G.st))+(q.length>1?`  (+${q.length-1})`:'');$('#quest').classList.toggle('alarm',!!q[0].alarm)},
 showHud(v){$('#hud').classList.toggle('hide',!v)},
 // ---------- modali ----------
 open(html,onClose){const b=$('#mbox');b.innerHTML=html;$('#modal').classList.remove('hide');this.modalOpen=true;this._mclose=onClose;b.scrollTop=0;
  b.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>{AU.play('ui');this.close()});},
 close(){$('#modal').classList.add('hide');this.modalOpen=false;this.onEnter=null;const f=this._mclose;this._mclose=null;if(f)f()},
 paper(html,btn='Chiudi'){return new Promise(res=>{this.open(fmt(html)+`<p style="text-align:right"><button class="btn" data-close>${btn}</button></p>`,res)})},
 shop(){return new Promise(res=>{const draw=()=>{const st=G.st;const it=shopItems(),disc=hearts('agatha')>=4?.9:1,price=id=>Math.round(ITEMS[id].p*disc),bread=st.time>=480?(st.bread||0):0;
  const note=id=>{const d=ITEMS[id];if(id==='pane')return st.time<480?'Lo porta Clara, dopo le 8:00.':bread?`Sfornato da Clara stamattina. Ne restano ${bread}.`:'Finito per oggi.';if(d.t!=='seed')return d.d;
   const c=CROPS[d.crop];return `Matura in ${c.days} notti${c.re?', poi ricresce ogni notte':''} · vale ${CZ(ITEMS[d.crop].v)}${c.y[1]>1?(c.re?' a manciata':' (a volte di più)'):''}${d.x?'. '+d.x:''}`};
  const can=(id,q)=>st.money>=price(id)*q&&(id!=='pane'||bread>=q);
  this.open(`<button class="btn mclose" data-close>✕</button><h2>Emporio Crane</h2><p class="small">«Semi buoni, terra buona, gente buona.» — Hai <b>${CZ(st.money)}</b>${disc<1?' · sconto amicizia −10%':''}</p>`+it.map(id=>`<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}<br><span class="small">${note(id)}</span></span><b class="price">${CZ(price(id))}</b><button class="btn" data-b="${id}" data-q="1" ${can(id,1)?'':'disabled'}>×1</button><button class="btn" data-b="${id}" data-q="5" ${can(id,5)?'':'disabled'}>×5</button></div>`).join('')+`<p class="small">Per vendere i raccolti usa la cassetta accanto a casa tua.${st.demand?` Oggi si pagano di più: ${PL[st.demand]}.`:''} Gli scudi di Hollowmere, fuori dalla Valle, non li accetta nessuno.</p>`,res);
  $('#mbox').querySelectorAll('canvas[data-i]').forEach(c=>c.getContext('2d').drawImage(ICON[c.dataset.i],0,0));
  $('#mbox').querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const id=b.dataset.b,q=+b.dataset.q;if(!can(id,q))return;if(addItem(id,q)){G.st.money-=price(id)*q;if(id==='pane')G.st.bread-=q;else if(ITEMS[id].t==='seed')G.st.flags.boughtSeeds=1;AU.play('coin');this.hud();this._mclose=null;draw();this._mclose=res}})};draw()})},
 board(){const st=G.st;const c=st.chore&&CHORES[st.chore];const fest=Math.max(0,8-st.day);const fv=(st.favors||[]).filter(f=>!f.done);fv.forEach(f=>f.told=1);
  const PREPT={4:'In piazza si ammucchiano le zucche della Festa.',5:'Brom monta le tavolate. Clara appende i festoni.',6:'Le tavolate sono pronte. Otto posti per lato.',7:'Domani: il Conteggio. Non mancate.'};
  this.open(`<button class="btn mclose" data-close>✕</button><h2>Bacheca delle Faccende</h2>
   <div class="paper"><p><b>Faccenda del giorno:</b><br>${c?esc(c.t):'Nessuna.'}<br><span class="small">Ricompensa: ${CZ(c?c.pay:0)}</span></p>
   <p>${st.choreDone?'✓ Completata. Grazie, vicino.':st.choreOk?'Accettata. Il villaggio conta su di te.':`<button class="btn" id="acc">Accetta la faccenda</button>`}</p></div>
   ${fv.length?`<h3>Richieste del villaggio</h3><p class="small">${fv.map(f=>`• ${NAMES[f.id]} cerca ${fmtItems(f.item,f.n)} — ${CZ(f.reward)}, entro ${DAYN[(f.until+3)%7]}`).join('<br>')}</p>`:''}<h3>Avvisi</h3><p class="small">• Chi trova oggetti ROSSI li seppellisca. Subito.<br>${isFree(st)?`• ${seasonName()}, giorno ${seasonDay()} di ${SEASON_LEN}. Semi di stagione all'Emporio.<br>`:`• Festa del Raccolto: ${st.chapter>=4?'<b>stasera</b>':st.flags.ch3end||fest===1?'<b>domani</b>':fest>1?`tra ${fest} giorni`:'<b>presto</b>'}. Portate zucche.<br>`}• Al suono della campana: a casa.<br>${st.demand?`• Quotazione del giorno: ${PL[st.demand]} +40% nella cassetta.<br>`:''}${PREPT[st.day]?`• ${PREPT[st.day]}<br>`:''}${H2(st)?'• <span style="color:#8a0f0f">'+fmt('Benvenut{o|a}')+', '+esc(st.name)+'. '+fmt('Ti abbiamo contat{o|a}.')+'</span>':'• Si cerca un aiuto per la fucina. Chiedere a Brom.'}</p>`);
  const a=$('#acc');if(a)a.onclick=()=>{st.choreOk=true;AU.play('ok');if(st.chore==='foglie')rebuildMaps();this.close();this.quest();this.toast('Faccenda accettata!')}},
 nameless(){const draw=()=>{const L=(NET.msgs||[]).slice(-8);
  this.open(`<button class="btn mclose" data-close>✕</button><h2>Lapide senza nome</h2><p class="small">Una pietra nera, liscia. Chi è passato di qui ci ha inciso qualcosa. ${NET.ok?'(Le incisioni sono lasciate da altri giocatori.)':'(Offline: solo le tue incisioni.)'}</p>
   <div class="paper">${L.length?L.map(m=>`<p>— «${esc(m.t)}»${m.n?` <span class="small">(${esc(m.n)})</span>`:''}</p>`).join(''):'<p><i>La pietra è ancora liscia.</i></p>'}</div>
   <h3>Incidi qualcosa</h3><div style="display:flex;gap:4px"><input class="tx" id="lapt" maxlength="70" placeholder="Un avvertimento per chi verrà…"><button class="btn" id="lapb">Incidi</button></div>`);
  const go=async()=>{const v=$('#lapt').value.trim();if(!v)return;$('#lapb').disabled=true;await NET.carve(v,G.st.name);AU.play('hoe');this.toast('Hai inciso la pietra.');draw()};$('#lapb').onclick=go;this.onEnter=go};
  this.refreshNameless=()=>{if(this.modalOpen&&$('#lapt')&&!$('#lapt').value)draw()};draw()},
 ledger(){const st=G.st;const hist=[['1712','Josiah Wren','Contato.'],['1748','Mercy Hale','Contata.'],['1781','Thomas Ashby','Contato due volte.'],['1799','Ezra Blackwood','Contato.'],['1846','Elias Marlowe','<b>RISPARMIATO.</b> Debito: uno del suo sangue.']];
  const others=[...new Set((NET.regNames||[]).filter(n=>n&&n!==st.name))].slice(-6);
  return this.paper(`<h2>Registro dei Nuovi Arrivati</h2><div class="paper">${hist.map(r=>`<p>${r[0]} · <b>${r[1]}</b> — ${r[2]}</p>`).join('')}
   ${others.length?`<p class="small" style="margin-top:6px"><i>Poi, una calligrafia più recente:</i></p>`+others.map(n=>`<p>— · <b>${esc(n)}</b> — <span class="ink">Contato.</span></p>`).join(''):''}
   <p class="wet" style="margin-top:8px">Quest'anno · <b>${esc(st.name)}</b>, nipote di E. Marlowe — ${fmt('Arrivat{o|a}. Contat{o|a}.')} <b>Destinat${fmt('{o|a}')} al Raccolto.</b></p>
   <p class="small"><i>L'inchiostro dell'ultima riga è ancora umido.</i></p>${(NET.heirs||[]).length?`<p class="small" style="margin-top:6px"><i>E sotto, una calligrafia nuova:</i></p><p>— · <b>${esc(NET.heirs[NET.heirs.length-1])}</b> — <b>RISPARMIATO.</b> <span class="small">Il Cavaliere di quest'anno.</span></p>`:''}</div>${others.length?'<p class="small">Alcuni di quei nomi… ti sembrano di persone vere. Arrivate da poco.</p>':''}`)},
 pause(tab='diario'){if(G.mode!=='game'||G.cut||this.dlgOpen)return;const st=G.st;
  const tabs=`<div class="tabs">${[['diario','Diario'],['amici','Abitanti'],...(isFree(st)?[['abil','Abilità']]:[]),['lore','Lore'],['opz','Opzioni'],['save','Salvataggio']].map(([k,n])=>`<button class="btn ${k===tab?'on':''}" data-t="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(tab==='diario'){const qs=activeQuests();const keys=[st.flags.gotPaint&&'Vernice gialla',st.flags.gotChestKey&&'Chiave della cassa',st.flags.barnKey&&'Chiave del fienile',st.flags.openedChest&&'Pagina di Elias (1)',st.flags.page2&&'Pagina di Elias (2)'].filter(Boolean);
   body=`<h3>Obiettivi</h3>${qs.map(q=>`<p>${q.d(st)?'✓ <s>':'• '}${esc(fmt(q.t(st)))}${q.d(st)?'</s>':''}</p>`).join('')||'<p>Nessuno.</p>'}<h3>Oggetti chiave</h3><p>${keys.join(' · ')||'—'}</p><h3>Le Regole</h3><p class="small">I. Il rosso è il colore cattivo. II. Non oltrepassare il recinto giallo. III. Alla campana della sera, a casa. Non aprire a nessuno.</p><h3>Comandi</h3><p class="small">WASD/frecce: muoviti · E/Spazio/clic: usa e parla · 1–0/rotella: oggetto · Esc: menu · F: schermo intero</p>`}
  if(tab==='abil')body=skillsHTML();
  if(tab==='amici'&&isFree(st))body=friendsHTML();
  else if(tab==='amici')body=['ezekiel','agatha','lucius','clara','brom','tobia'].map(id=>{const met=st.flags.met[id]||id==='tobia',n=NPC(id),f=favorOf(id),where=!met?'Non ancora conosciuto':(n.hidden?(n.lastIn?'Ora: '+({chapel:'in cappella',barn:'nel fienile'}[n.lastIn]||'dentro')+(ACTD[n.act]?' · '+ACTD[n.act]:''):'In casa'):'Ora: '+placeNameAt(n)+(ACTD[n.act]?' · '+ACTD[n.act]:''));
   return `<div class="mrow"><canvas data-p="${id}" width="64" height="64" style="width:calc(26*var(--u));height:calc(26*var(--u))"></canvas><span><b>${NAMES[id]}</b><br><span class="small">${where}${f&&f.told?`<br>Cerca: ${fmtItems(f.item,f.n)}`:''}</span></span><span class="hearts">${'♥'.repeat(hearts(id))}${'♡'.repeat(Math.max(0,5-hearts(id)))}</span></div>`}).join('');
  if(tab==='lore')body=loreHTML();
  if(tab==='opz')body=`<p>Musica <input type="range" id="vm" min="0" max="1" step=".05" value="${AU.vol.m}"></p><p>Effetti <input type="range" id="vs" min="0" max="1" step=".05" value="${AU.vol.s}"></p><p><label><input type="checkbox" id="gd" ${G.guideOn?'checked':''}> Indicatore dell'obiettivo (freccia)</label></p><p><button class="btn" id="fs">Schermo intero</button></p>`;
  if(tab==='save')body=`<p>Il gioco si salva da solo ogni mattina. ${NET.ok?'I salvataggi sono custoditi nella Valle (online).':'Sei offline: il salvataggio resta su questo dispositivo.'}</p><p>Il tuo codice: <b style="font-size:1.3em;letter-spacing:.1em">${esc(st.pid||'—')}</b>${NET.key(st.pid)?`<br>Chiave di recupero: <b style="letter-spacing:.1em">${esc(NET.key(st.pid))}</b>`:''}<br><span class="small">Da un altro dispositivo usa "Carica da codice" con codice e chiave. Non dare la chiave a nessuno: chi ce l'ha può usare il tuo salvataggio.</span></p><p class="small">${netDiag()}</p><p><button class="btn" id="sq">Salva ed esci al menu</button> <button class="btn" id="sNow">Salva adesso</button></p>`;
  this.open(`<button class="btn mclose" data-close>✕</button><h2>${esc(st.name)} · Giorno ${st.day}</h2>${tabs}${body}`);
  $('#mbox').querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{AU.play('ui');this._mclose=null;this.pause(b.dataset.t)});
  $('#mbox').querySelectorAll('canvas[data-p]').forEach(c=>{const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(portrait(c.dataset.p,''),0,0)});
  const vm=$('#vm'),vs=$('#vs');if(vm){vm.oninput=()=>{AU.vol.m=+vm.value;AU.applyVol();LS.set('hm_vol',JSON.stringify(AU.vol))};vs.oninput=()=>{AU.vol.s=+vs.value;AU.applyVol();AU.play('blip');LS.set('hm_vol',JSON.stringify(AU.vol))};$('#fs').onclick=goFull;$('#gd').onchange=e=>{G.guideOn=e.target.checked;LS.set('hm_guide',G.guideOn?'1':'0')}}
  const sq=$('#sq');if(sq)sq.onclick=async()=>{const [tx,ty]=ptile(G.player);st.map=G.map.id;st.px=tx;st.py=ty;st.dir=G.player.dir;await NET.save(st);this.close();toTitle()};
  const sn=$('#sNow');if(sn)sn.onclick=async()=>{if(G.visit){UI.toast('Sei in visita: si salva quando torni a casa.');return}const [tx,ty]=ptile(G.player);st.map=G.map.id;st.px=tx;st.py=ty;st.dir=G.player.dir;sn.disabled=true;await NET.save(st);UI.toast(NET.saveErr?'Salvataggio online rifiutato: '+NET.saveErr:NET.ok?'Salvato, anche online.':'Salvato su questo dispositivo.');this.close()};
 },
 pauseKey(){if(this.modalOpen){this.close();return}if(G.mode==='game')this.pause()},
 // ---------- schermate ----------
 fade(v,ms=400){return new Promise(r=>{const f=$('#fade');f.style.transition=`opacity ${ms}ms`;f.style.opacity=v;setTimeout(r,ms+20)})},
 card(k,t,s,red,click=true,ms=1600){return new Promise(res=>{const c=$('#card');$('#cardk').textContent=k||'';$('#cardt').textContent=fmt(t||'');$('#cards').innerHTML=fmt(s||'')+(click?'<br><br><span class="small" style="opacity:.6">— tocca per continuare —</span>':'');c.classList.toggle('red',!!red);c.classList.remove('hide');
  const done=()=>{c.classList.add('hide');c.onclick=null;removeEventListener('keydown',kd);res()};const kd=e=>{if(ok&&(e.code==='Space'||e.code==='Enter'||e.code==='KeyE'))done()};let ok=false;
  setTimeout(()=>{ok=true;if(!click)done()},ms);c.onclick=()=>{if(ok)done()};addEventListener('keydown',kd)})},
 askName(){return new Promise(res=>{this.open(`<h2>Chi sei?</h2><p>Il notaio ha scritto il tuo nome sulla lettera del nonno. Con la stessa calligrafia, qualcuno lo scriverà anche altrove.</p><div class="gpick"><canvas id="gprev" width="36" height="54"></canvas><div><p style="margin:0 0 calc(3*var(--u))"><button class="btn gb on" data-g="m">Ragazzo</button> <button class="btn gb" data-g="f">Ragazza</button></p><input class="tx" id="nm" maxlength="14" placeholder="Il tuo nome" autocomplete="off"></div></div><p style="text-align:right;margin-top:6px"><button class="btn" data-close>Indietro</button> <button class="btn" id="nmok">Inizia</button></p>`,()=>res(null));
  let g='m';const prev=()=>{const c=$('#gprev'),x=c.getContext('2d');x.clearRect(0,0,36,54);heroFrame(PLAYER_LOOKS[g],0,null,0,false).put(x,0,0)};prev();
  $('#mbox').querySelectorAll('.gb').forEach(b=>b.onclick=()=>{g=b.dataset.g;AU.play('ui');$('#mbox').querySelectorAll('.gb').forEach(o=>o.classList.toggle('on',o===b));prev()});
  const go=()=>{const v=$('#nm').value.trim().replace(/[<>{}|]/g,'').slice(0,14);if(!v){$('#nm').focus();return}this._mclose=null;this.close();res({name:v,g})};$('#nmok').onclick=go;this.onEnter=go;setTimeout(()=>{const n=$('#nm');if(n&&!IN.touch)n.focus()},50)})},
 askCode(){return new Promise(res=>{this.open(`<h2>Carica da codice</h2><p>Inserisci il codice che trovi nel menu di gioco (Salvataggio).</p><input class="tx" id="cd" maxlength="12" placeholder="HM-XXXXXX" autocomplete="off" style="text-transform:uppercase"><p class="small" style="margin:6px 0 2px">Chiave di recupero (nel menu Salvataggio del vecchio dispositivo):</p><input class="tx" id="ck" maxlength="9" placeholder="XXXX-XXXX" autocomplete="off" style="text-transform:uppercase"><p style="text-align:right;margin-top:6px"><button class="btn" data-close>Indietro</button> <button class="btn" id="cdok">Carica</button></p>`,()=>res(null));
  const go=()=>{const v=$('#cd').value.trim().toUpperCase();if(!v)return;const k=$('#ck').value.trim().toUpperCase();this._mclose=null;this.close();res({c:v,k})};$('#cdok').onclick=go;this.onEnter=go})},
 letter(name){return new Promise(res=>{const txt0=`{Caro|Cara} ${name},\n\nse leggi queste righe, il tuo vecchio nonno Elias se n'è andato.\n\nTi lascio la fattoria di Hollowmere, nella Valle Quieta. È un posto tranquillo: la gente è gentile, l'aria profuma di mele e le zucche crescono grandi come carrozze.\n\nVai a viverci. Coltiva. Sii felice.\n\nAh, e una cosa sola: rispetta le loro regole. Tutte.\n\nCon affetto,\nNonno Elias`;const txt=fmt(txt0);
  this.open(`<div class="paper" style="min-height:calc(190*var(--u));white-space:pre-wrap" id="lt"></div><p style="text-align:right"><button class="btn" id="ltok" style="visibility:hidden">Parti per Hollowmere</button></p>`,res);
  const el=$('#lt');let i=0;const tick=setInterval(()=>{i+=2;el.textContent=txt.slice(0,i);if(i%8===0)AU.play('page');if(i>=txt.length){clearInterval(tick);setTimeout(()=>{el.innerHTML=esc(txt)+'\n\n<s style="opacity:.35">non venire</s>';$('#ltok').style.visibility='visible'},900)}},28);
  const skip=()=>{if(i<txt.length){i=txt.length-2}};$('#mbox').onclick=skip;$('#ltok').onclick=e=>{e.stopPropagation();AU.play('ui');clearInterval(tick);this.close()}})},
 showTitle(){$('#fade').style.transition='opacity .8s';$('#fade').style.opacity=0;$('#card').classList.add('hide');$('#title').classList.remove('hide');this.showHud(false);$('#tmenu [data-a="cont"]').disabled=!LS.get('hm_save');
  {const done=JSON.parse(LS.get('hm_endings')||'[]').length>0||!!LS.get('hm_free')||(typeof legacyDone==='function'&&legacyDone()),vb=$('#tmenu [data-a="valle"]');vb.classList.remove('hide');vb.classList.toggle('locked',!done);vb.textContent=done?'La Valle · multiplayer':'🔒 La Valle · multiplayer';$('#tmenu [data-a="finali"]').classList.toggle('hide',!done)}
  clearInterval(this._tt);let n=0;this._tt=setInterval(()=>{n++;const s=$('#tsub');if(n>8&&Math.random()<.35){s.textContent='La Valle Affamata';s.classList.add('g');setTimeout(()=>{s.textContent='La Valle Quieta';s.classList.remove('g')},180+Math.random()*300)}},1500)},
 hideTitle(){$('#title').classList.add('hide');clearInterval(this._tt)},
};
