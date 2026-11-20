'use strict';
// ================= LA CHAT DELLA VALLE =================
// Quando siete nello stesso villaggio: pulsante 💬 accanto all'inventario (o tasto T), una barra che non mette
// in pausa il gioco, frasi rapide ed emoji, registro dei messaggi con i colori di ognuno, fumetti sopra la testa
// e «sta scrivendo…». Passa sempre da chat/<villaggio> (stesse regole di prima).

const CHAT = { log: [], open: false, unread: 0, typingT: 0 };
const CHAT_QUICK = [
  '👋 Ciao!',
  '😄',
  '❤️',
  '👍',
  'Vieni a vedere!',
  'Grazie!',
  'Bel villaggio!',
  'Ci vediamo!'
];
const CHAT_COLS = ['#f6d98a', '#8ad8ff', '#ff9a8a', '#a8f08a', '#d8a8ff', '#ffc070', '#8affd8', '#ff8ad8'];
const chatCol = n => {
  let h = 0;
  for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CHAT_COLS[h % CHAT_COLS.length];
};
const chatMe = () => {
  const s = G.visit ? G.home : G.st;
  return (s && s.name) || '?';
};
const isEmojiOnly = t => /^[\p{Extended_Pictographic}‍️\s]{1,8}$/u.test(t);

// ---------- rete: i messaggi arrivano qui; la presenza porta anche «sta scrivendo» ----------
{
  const _chat = MP.chat.bind(MP);
  MP.chat = function (village, cb) {
    return _chat(village, m => chatIn(m));
  };
}
{
  const _pr = MP.presence.bind(MP);
  MP.presence = function (village, me, cb) {
    const h = _pr(village, me, all => {
      cb(all);
      for (const pid in all) {
        const o = G.others[pid];
        if (o) o.wr = !!all[pid].wr;
      }
    });
    if (!h) return h;
    const send = h.send;
    h.send = v => send(Object.assign(v, { wr: CHAT.typingT > performance.now() ? 1 : 0 }));
    return h;
  };
}
function chatIn(m) {
  if (!m || !m.t) return;
  const n = String(m.n || '?').slice(0, 20),
    t = String(m.t).slice(0, 60);
  const mine = n === chatMe();
  CHAT.log.push({ n, t, ts: Date.now() });
  CHAT.log = CHAT.log.slice(-40);
  const o = mine ? G.player : Object.values(G.others).find(o => o.name === n);
  G.chatB = (G.chatB || []).filter(b => b.who !== n);
  G.chatB.push({ who: n, t, life: 6, t0: G.t, emo: isEmojiOnly(t) });
  if (!mine) {
    AU.play('blip');
    if (!CHAT.open) {
      CHAT.unread++;
      chatFeed(n, t);
    }
  }
  chatRender();
}
async function chatSend(t) {
  t = String(t || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 60);
  if (!t) return;
  if (!PRES_V) {
    UI.toast("La chat c'è quando sei online nella Valle.");
    return;
  }
  const me = chatMe();
  CHAT.typingT = 0;
  MP.say(PRES_V, { n: me, t, ts: Date.now() });
} // il proprio messaggio torna subito dall'ascolto della chat
// il vecchio chatSay apre la barra
function chatSay() {
  chatToggle(true);
}

// ---------- interfaccia ----------
function chatEls() {
  let box = $('#chatbox');
  if (box) return box;
  box = document.createElement('div');
  box.id = 'chatbox';
  box.className = 'dark hide';
  box.innerHTML = `<div class="chhead"><b>Chat</b><span id="chwho"></span><button class="btn ib" id="chclose" title="Chiudi (Esc)">✕</button></div><div id="chlog"></div>
  <div id="chquick">${CHAT_QUICK.map(q => `<button class="btn" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  <div class="chrow"><input class="tx" id="chin" maxlength="60" placeholder="Scrivi qualcosa…" autocomplete="off" enterkeyhint="send"><button class="btn" id="chsend">Invia</button></div>`;
  ($('#hud') || document.body).appendChild(box);
  const feed = document.createElement('div');
  feed.id = 'chatfeed';
  ($('#hud') || document.body).appendChild(feed);
  box.addEventListener('pointerdown', e => e.stopPropagation());
  box.querySelector('#chclose').onclick = () => chatToggle(false);
  box.querySelectorAll('[data-q]').forEach(
    b =>
      (b.onclick = () => {
        chatSend(b.dataset.q);
        AU.play('ui');
        const i = $('#chin');
        if (i && !IN.touch) i.focus();
      })
  );
  const inp = box.querySelector('#chin');
  const go = () => {
    chatSend(inp.value);
    inp.value = '';
  };
  box.querySelector('#chsend').onclick = go;
  inp.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      go();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      chatToggle(false);
    }
  });
  inp.addEventListener('input', () => {
    const was = CHAT.typingT > performance.now();
    CHAT.typingT = inp.value ? performance.now() + 4000 : 0;
    if (!was && CHAT.typingT) PRES_T = 0;
  });
  return box;
}
function chatToggle(v) {
  const box = chatEls();
  CHAT.open = v == null ? !CHAT.open : v;
  if (CHAT.open && !PRES_V) {
    CHAT.open = false;
    UI.toast("La chat c'è quando sei online nella Valle.");
    return;
  }
  box.classList.toggle('hide', !CHAT.open);
  if (CHAT.open) {
    CHAT.unread = 0;
    $('#chatfeed').innerHTML = '';
    chatRender();
    setTimeout(() => {
      const i = $('#chin');
      if (i && !IN.touch) i.focus();
    }, 30);
  } else {
    CHAT.typingT = 0;
    const i = $('#chin');
    if (i) i.blur();
  }
  chatBtn();
}
function chatRender() {
  chatBtn();
  if (!CHAT.open) return;
  const L = $('#chlog');
  if (!L) return;
  const names = [
    ...new Set(
      Object.values(G.others)
        .map(o => o.name)
        .filter(Boolean)
    )
  ];
  $('#chwho').textContent = names.length
    ? ` · qui con te: ${names.join(', ')}`
    : ' · per ora sei sol' + ((G.visit ? G.home : G.st).g === 'f' ? 'a' : 'o');
  L.innerHTML = CHAT.log.length
    ? CHAT.log.map(m => `<p><b style="color:${chatCol(m.n)}">${esc(m.n)}</b> ${esc(m.t)}</p>`).join('')
    : '<p class="small">Nessun messaggio. Saluta chi passa!</p>';
  L.scrollTop = L.scrollHeight;
}
// i messaggi arrivati con la chat chiusa scorrono sopra l'inventario
function chatFeed(n, t) {
  chatEls();
  const f = $('#chatfeed'),
    p = document.createElement('p');
  p.innerHTML = `<b style="color:${chatCol(n)}">${esc(n)}</b> ${esc(t)}`;
  f.appendChild(p);
  while (f.children.length > 4) f.firstChild.remove();
  setTimeout(() => {
    p.classList.add('out');
    setTimeout(() => p.remove(), 600);
  }, 7000);
}
// il pulsante accanto all'inventario
function chatBtn() {
  const b = $('#bChat2');
  if (!b) return;
  b.classList.toggle('hide', !PRES_V || G.mode !== 'game');
  b.querySelector('i').textContent = CHAT.unread ? CHAT.unread : '';
  b.classList.toggle('new', !!CHAT.unread);
}
{
  const _bh = UI.buildHotbar.bind(UI);
  UI.buildHotbar = function () {
    _bh();
    const hb = $('#hotbar');
    const b = document.createElement('button');
    b.id = 'bChat2';
    b.className = 'ib hide';
    b.title = 'Chat (T)';
    b.innerHTML = '💬<i></i>';
    b.onpointerdown = e => {
      e.stopPropagation();
      AU.play('ui');
      chatToggle();
    };
    hb.appendChild(b);
    chatBtn();
  };
}
if ($('#hotbar') && $('#hotbar').children.length) UI.buildHotbar();
{
  const old = $('#bChat');
  if (old) old.style.display = 'none';
} // il vecchio pulsante in alto: resta nascosto (la chat è accanto all'inventario)
{
  const _h = UI.hud.bind(UI);
  UI.hud = function () {
    _h();
    chatBtn();
    if (CHAT.open && !PRES_V) chatToggle(false);
  };
}
addEventListener(
  'keydown',
  e => {
    if (e.code === 'Escape' && CHAT.open) {
      e.preventDefault();
      e.stopImmediatePropagation();
      chatToggle(false);
    }
  },
  true
);
addEventListener(
  'keydown',
  e => {
    if (
      e.code !== 'KeyT' ||
      e.repeat ||
      (e.target && e.target.tagName === 'INPUT') ||
      G.mode !== 'game' ||
      G.cut ||
      UI.busy() ||
      !PRES_V
    )
      return;
    e.preventDefault();
    e.stopImmediatePropagation();
    chatToggle(true);
  },
  true
);

// ---------- fumetti ----------
function wrap2(t, max) {
  const w = String(t).split(' ');
  const L = [''];
  for (const x of w) {
    const c = L[L.length - 1];
    if (ctx.measureText((c ? c + ' ' : '') + x).width > max && c) {
      if (L.length === 2) {
        L[1] += '…';
        break;
      }
      L.push(x);
    } else L[L.length - 1] = c ? c + ' ' + x : x;
  }
  return L;
}
function drawChatBubbles() {
  if (!G.chatB && !Object.keys(G.others || {}).length) return;
  const me = chatMe();
  ctx.save();
  ctx.textAlign = 'center';
  // «sta scrivendo…»
  for (const o of Object.values(G.others || {})) {
    if (!o.wr || o.map !== G.map.id || (G.chatB || []).some(b => b.who === o.name)) continue;
    const X = Math.round(o.x),
      Y = Math.round(o.y - 46);
    ctx.fillStyle = '#3b1f0e';
    ctx.fillRect(X - 12, Y - 7, 24, 11);
    ctx.fillStyle = '#f4ead2';
    ctx.fillRect(X - 11, Y - 6, 22, 9);
    for (let i = 0; i < 3; i++) {
      const a = 0.35 + 0.65 * Math.max(0, Math.sin(G.t * 6 - i * 0.9));
      ctx.fillStyle = `rgba(60,40,24,${a.toFixed(2)})`;
      ctx.fillRect(X - 6 + i * 5, Y - 3, 3, 3);
    }
  }
  for (const b of G.chatB || []) {
    const o = b.who === me ? G.player : Object.values(G.others).find(o => o.name === b.who);
    if (!o || (o !== G.player && o.map !== G.map.id)) continue;
    const age = G.t - (b.t0 || G.t),
      pop = Math.min(1, age / 0.18),
      fade = Math.min(1, b.life / 0.6),
      X = Math.round(o.x),
      base = Math.round(o.y - 44);
    ctx.globalAlpha = fade;
    if (b.emo) {
      ctx.font = `${Math.round(10 + 6 * pop)}px sans-serif`;
      ctx.fillText(b.t, X, base - 2 - Math.sin(age * 4) * 1.5);
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
    const L = wrap2(b.t, 112),
      w = Math.min(124, Math.ceil(Math.max(...L.map(l => ctx.measureText(l).width))) + 10),
      h = L.length * 9 + 6,
      Y = base - h;
    const sx = X - w / 2;
    ctx.save();
    ctx.translate(X, base);
    ctx.scale(pop, pop);
    ctx.translate(-X, -base);
    ctx.fillStyle = '#3b1f0e';
    ctx.fillRect(sx - 1, Y, w + 2, h);
    ctx.fillRect(sx, Y - 1, w, h + 2);
    ctx.fillStyle = '#f4ead2';
    ctx.fillRect(sx, Y, w, h);
    ctx.fillStyle = chatCol(b.who);
    ctx.fillRect(sx, Y, w, 2);
    ctx.fillStyle = '#3b1f0e';
    ctx.fillRect(X - 3, base, 6, 2);
    ctx.fillRect(X - 1, base + 2, 2, 2);
    ctx.fillStyle = '#f4ead2';
    ctx.fillRect(X - 2, base, 4, 1);
    ctx.fillStyle = '#2a1a10';
    L.forEach((l, i) => ctx.fillText(l, X, Y + 9 + i * 9));
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
