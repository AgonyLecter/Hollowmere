'use strict';
// ================= LO ZAINO (inventario vero) =================
// Nella Valle lo zaino ha tre file da 10 (la barra in basso mostra una fila alla volta: ⇅ cambia fila).
// Schermata completa (🎒 accanto alla barra, o tasto I): tocca un oggetto e poi un posto per spostarlo, oppure
// trascinalo. Pile uguali si uniscono, diverse si scambiano. «Metà» divide una pila, «Ordina» riordina e unisce,
// il cestino butta (gli attrezzi chiedono conferma). La cassa usa lo stesso sistema, con due griglie.
// Gli oggetti della storia, nella Valle, sono ricordi qualsiasi: si spostano, si mettono in cassa, si buttano.

const INV_FREE=30;
const ORD=['tool','seed','fert','crop','food','res','place','arredo','gift','bad','key'];
// lo zaino della Valle è di 30 posti
{const _af=applyFree;applyFree=function(m,st){_af(m,st);if(m.id==='main'&&isFree(st)&&!G.visit){while(st.inv.length<INV_FREE)st.inv.push(null)}}}
// la fila della barra: ⇅1, ⇅2, ⇅3
{const _hb=UI.hotbar.bind(UI);UI.hotbar=function(){_hb();const st=G.st,r=$('#hbrow');if(st&&r&&st.inv.length>10)r.textContent='⇅'+(Math.floor(st.sel/10)+1)}}

let ZPICK=null;   // {w,i}: l'oggetto che hai in mano nella schermata
function zLists(){const L={z:G.st.inv};if(ZCH)L.c=G.st.free.built[ZCH].inv;return L}
let ZCH=null;     // la cassa aperta (chiave in built), o null
function zSlot(L,w,i,s){const hot=w==='z'&&Math.floor(i/10)===Math.floor(G.st.sel/10),sel=w==='z'&&i===G.st.sel,pk=ZPICK&&ZPICK.w===w&&ZPICK.i===i;
 return `<div class="islot${hot?' hot':''}${sel?' sel':''}${pk?' pick':''}" data-w="${w}" data-i="${i}"><canvas width="32" height="32"></canvas><i>${s&&s.n>1?s.n:''}</i></div>`}
function zGrid(w,L,label){let h='';for(let r=0;r*10<L.length;r++)h+=(w==='z'&&L.length>10?`<div class="irow"><span class="small">${r===Math.floor(G.st.sel/10)?'Barra':'Fila '+(r+1)}</span></div>`:'')+`<div class="igrid">${L.slice(r*10,r*10+10).map((s,k)=>zSlot(L,w,r*10+k,s)).join('')}</div>`;return (label?`<h3>${label}</h3>`:'')+h}
function zInfo(){if(!ZPICK)return '<span class="small">Tocca un oggetto per prenderlo, poi tocca dove metterlo. Puoi anche trascinarlo.</span>';const s=zLists()[ZPICK.w][ZPICK.i];if(!s)return '';const it=ITEMS[s.id];return `<b>${esc(it.n)}</b>${s.n>1?' ×'+s.n:''}<br><span class="small">${esc(it.d||'')}</span>`}
function zaino(chestKey){ZCH=chestKey||null;const st=G.st,L=zLists();if(ZPICK&&!(L[ZPICK.w]&&L[ZPICK.w][ZPICK.i]))ZPICK=null;
 const tools=`<div class="itools"><button class="btn" data-z="meta" ${ZPICK&&L[ZPICK.w][ZPICK.i]&&L[ZPICK.w][ZPICK.i].n>1?'':'disabled'}>Metà</button> <button class="btn" data-z="ordina">Ordina</button>${ZCH?' <button class="btn" data-z="deposita">Metti tutto in cassa</button> <button class="btn" data-z="prendi">Prendi tutto</button>':''} <button class="btn idel" data-z="butta" ${ZPICK?'':'disabled'}>🗑</button></div>`;
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>${ZCH?'Cassa':'Zaino'}</h2><div class="iinfo">${zInfo()}</div>${tools}`+(ZCH?zGrid('c',L.c,'Cassa'):'')+zGrid('z',L.z,ZCH?'Zaino':''),()=>{ZPICK=null;ZCH=null;UI.hotbar()});
 const box=$('#mbox');box.querySelectorAll('.islot').forEach(el=>{const s=L[el.dataset.w][+el.dataset.i];if(s&&ICON[s.id])el.firstChild.getContext('2d').drawImage(ICON[s.id],0,0);if(s)el.title=ITEMS[s.id].n});
 box.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>zTool(b.dataset.z));zDrag(box)}
// spostare: vuoto → sposta, stesso oggetto → unisce, diverso → scambia
function zMove(a,b){const L=zLists(),A=L[a.w],B=L[b.w],s=A[a.i],t=B[b.i];if(!s||(a.w===b.w&&a.i===b.i))return false;
 if(t&&t.id===s.id){t.n+=s.n;A[a.i]=null}else{B[b.i]=s;A[a.i]=t||null}AU.play('blip');return true}
function zTap(w,i){const L=zLists(),s=L[w][i];if(!ZPICK){if(s){ZPICK={w,i};AU.play('ui')}}else if(ZPICK.w===w&&ZPICK.i===i)ZPICK=null;else{zMove(ZPICK,{w,i});ZPICK=null}UI._mclose=null;zaino(ZCH)}
function zTool(k){const L=zLists(),st=G.st;
 if(k==='meta'&&ZPICK){const A=L[ZPICK.w],s=A[ZPICK.i];if(!s||s.n<2)return;const j=A.findIndex(x=>!x);if(j<0){UI.toast('Non c\'è un posto libero per dividere.');return}const h=Math.floor(s.n/2);s.n-=h;A[j]={id:s.id,n:h};ZPICK={w:ZPICK.w,i:j}}
 if(k==='ordina'){for(const w in L){const A=L[w],m={},keep=[];for(const s of A){if(!s)continue;if(ITEMS[s.id].t==='tool'||!m[s.id]){const c={id:s.id,n:s.n};keep.push(c);if(ITEMS[s.id].t!=='tool')m[s.id]=c}else m[s.id].n+=s.n}
  keep.sort((a,b)=>(ORD.indexOf(ITEMS[a.id].t)-ORD.indexOf(ITEMS[b.id].t))||ITEMS[a.id].n.localeCompare(ITEMS[b.id].n));for(let i=0;i<A.length;i++)A[i]=keep[i]||null}ZPICK=null;AU.play('ok')}
 if(k==='deposita'&&ZCH){const C=L.c,Z=L.z;for(let i=0;i<Z.length;i++){const s=Z[i];if(!s||ITEMS[s.id].t==='tool')continue;const t=C.find(x=>x&&x.id===s.id);if(t){t.n+=s.n;Z[i]=null;continue}const j=C.findIndex(x=>!x);if(j<0)break;C[j]=s;Z[i]=null}ZPICK=null;AU.play('ok')}
 if(k==='prendi'&&ZCH){const C=L.c,Z=L.z;for(let i=0;i<C.length;i++){const s=C[i];if(!s)continue;const t=Z.find(x=>x&&x.id===s.id&&ITEMS[x.id].t!=='tool');if(t){t.n+=s.n;C[i]=null;continue}const j=Z.findIndex(x=>!x);if(j<0){UI.toast('Lo zaino è pieno.');break}Z[j]=s;C[i]=null}ZPICK=null;AU.play('ok')}
 if(k==='butta'&&ZPICK){const A=L[ZPICK.w],s=A[ZPICK.i];if(!s)return;const it=ITEMS[s.id];
  if(it.t==='tool'&&!confirm(`Buttare ${it.n}? Non torna più.`))return;A[ZPICK.i]=null;ZPICK=null;AU.play('pick');UI.toast(`Hai buttato: ${it.n}${s.n>1?' ×'+s.n:''}.`)}
 if(st.free)NET.save(myHome());UI._mclose=null;zaino(ZCH)}
// trascinare (dito o mouse): un'icona segue il dito e si posa dove lo lasci
function zDrag(box){let d=null;
 box.querySelectorAll('.islot').forEach(el=>{el.onpointerdown=e=>{const L=zLists(),w=el.dataset.w,i=+el.dataset.i;if(!L[w][i]){if(ZPICK)zTap(w,i);return}d={w,i,x:e.clientX,y:e.clientY,moved:false,el};try{el.setPointerCapture(e.pointerId)}catch(_){}};
  el.onpointermove=e=>{if(!d||d.el!==el)return;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<8)return;if(!d.moved){d.moved=true;const g=document.createElement('canvas');g.width=g.height=32;g.className='ighost';const s=zLists()[d.w][d.i];if(ICON[s.id])g.getContext('2d').drawImage(ICON[s.id],0,0);document.body.appendChild(g);d.g=g;el.classList.add('drag')}
   d.g.style.left=e.clientX+'px';d.g.style.top=e.clientY+'px'};
  el.onpointerup=e=>{if(!d||d.el!==el){return}const was=d;d=null;if(was.g)was.g.remove();el.classList.remove('drag');
   if(!was.moved){zTap(was.w,was.i);return}const t=document.elementFromPoint(e.clientX,e.clientY),slot=t&&t.closest&&t.closest('.islot');if(slot&&zMove({w:was.w,i:was.i},{w:slot.dataset.w,i:+slot.dataset.i}))ZPICK=null;UI._mclose=null;zaino(ZCH)};
  el.onpointercancel=()=>{if(d&&d.g)d.g.remove();d=null};})}
// la cassa: stessa schermata, due griglie
chestMenu=function(bk){const b=G.st.free.built[bk];if(!b)return;if(!b.inv)b.inv=Array(20).fill(null);ZPICK=null;zaino(bk)};
// il pulsante 🎒 accanto alla barra, e il tasto I
{const _bh=UI.buildHotbar.bind(UI);UI.buildHotbar=function(){_bh();const hb=$('#hotbar');const b=document.createElement('button');b.id='bInv';b.className='ib';b.title='Zaino (I)';b.textContent='🎒';
 b.onpointerdown=e=>{e.stopPropagation();if(G.mode!=='game'||G.cut||UI.busy())return;AU.play('ui');ZPICK=null;zaino()};hb.appendChild(b)}}
if($('#hotbar')&&$('#hotbar').children.length)UI.buildHotbar();
addEventListener('keydown',e=>{if(e.code!=='KeyI'||e.repeat||(e.target&&e.target.tagName==='INPUT'))return;if(UI.modalOpen&&$('#mbox .igrid')&&!ZCH){UI.close();return}if(G.mode!=='game'||G.cut||UI.busy())return;e.preventDefault();ZPICK=null;zaino()});
GUIDES.push({id:'zaino',v:16,n:'Lo zaino nuovo',steps:[
 {t:'Lo zaino adesso ha tre file. Il bottone 🎒 accanto alla barra (o il tasto I) apre la schermata completa.'},
 {t:'Tocca un oggetto e poi il posto dove metterlo, oppure trascinalo col dito. Uguali si uniscono, diversi si scambiano. «Metà» divide una pila, «Ordina» mette tutto in ordine, il cestino butta.'},
 {t:'La cassa funziona allo stesso modo, con «Metti tutto in cassa» e «Prendi tutto». E i ricordi della storia, come la chiave e il nastro, adesso puoi spostarli, metterli in cassa o buttarli.'}]});
