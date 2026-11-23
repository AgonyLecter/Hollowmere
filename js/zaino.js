'use strict';
// ================= LO ZAINO (inventario vero) =================
// Nella Valle lo zaino ha tre file da 10 (la barra in basso mostra una fila alla volta: ⇅ cambia fila).
// Schermata completa (🎒 accanto alla barra, o tasto I), come in Minecraft: tocca per prendere in mano e posare,
// doppio tocco per spostare veloce, tieni premuto per dividere la pila. La cassa usa lo stesso sistema.
// Gli oggetti della storia, nella Valle, sono ricordi qualsiasi: si spostano, si mettono in cassa, si buttano.

const INV_FREE = 30,
  CASSA_POSTI = 20;
const cassaVuota = () => Array(CASSA_POSTI).fill(null);

// ---------- contenitori sempre sani ----------
// Firebase non conserva le liste con i posti vuoti: toglie quelli in fondo (una cassa di 20 posti tornava di 3)
// e, se il primo è vuoto, la trasforma in un oggetto {"3": …}. Tutto quello che arriva da fuori o da un
// salvataggio vecchio passa da qui: torna una lista di esattamente n posti, con pile valide nella loro casella.
// Niente si perde: quello che non trova posto va nella cassetta delle spedizioni (avanzi).
function pilaSana(s) {
  if (!s || typeof s !== 'object' || !ITEMS[s.id]) return null;
  const n = Math.floor(+s.n);
  return n >= 1 ? { id: s.id, n } : null;
}
function inventario(x, n, avanzi) {
  const A = Array(n).fill(null),
    fuori = [];
  if (x && typeof x === 'object')
    for (const k of Object.keys(x)) {
      const i = +k,
        s = pilaSana(x[k]);
      if (!s) continue;
      // un attrezzo è sempre da solo nella sua casella: le copie in più vanno in altri posti
      const pezzi = zTool(s.id) ? Array.from({ length: s.n }, () => ({ id: s.id, n: 1 })) : [s];
      if (Number.isInteger(i) && i >= 0 && i < n && !A[i]) A[i] = pezzi.shift();
      fuori.push(...pezzi);
    }
  for (const s of fuori) {
    const resto = zInfila(A, s);
    if (resto && avanzi) avanzi.push({ id: s.id, n: resto });
  }
  return A;
}
function macchinaSana(m) {
  if (!m || typeof m !== 'object') return undefined;
  const num = v => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0),
    id = v => (v && ITEMS[v] ? v : null);
  return {
    i: id(m.i),
    in: id(m.i) ? num(m.in) : 0,
    f: num(m.f),
    o: id(m.o),
    on: id(m.o) ? num(m.on) : 0,
    t0: Number.isFinite(+m.t0) && m.t0 !== null ? +m.t0 : null
  };
}
// rimette in ordine zaino e casse di una partita (al caricamento): quello che avanza aspetta nella cassetta
function riparaContenitori(st) {
  if (!st) return;
  const avanzi = [];
  const lung = Array.isArray(st.inv) ? st.inv.length : 0;
  st.inv = inventario(st.inv, Math.max(isFree(st) ? INV_FREE : 10, lung), avanzi);
  const B = (st.free && st.free.built) || {};
  for (const k in B) {
    const b = B[k];
    if (!b || typeof b !== 'object') {
      delete B[k];
      continue;
    }
    if (b.id === 'cassa') b.inv = inventario(b.inv, CASSA_POSTI, avanzi);
    else if (b.inv !== undefined) {
      // solo le casse hanno un contenuto: se un'altra costruzione se ne porta dietro uno, va nella cassetta
      inventario(b.inv, 0, avanzi);
      delete b.inv;
    }
    if (b.m !== undefined) b.m = macchinaSana(b.m);
  }
  if (avanzi.length) {
    st.mailbox = Array.isArray(st.mailbox) ? st.mailbox : Object.values(st.mailbox || {});
    for (const a of avanzi) st.mailbox.push({ item: a.id, n: a.n, from: '' });
  }
}
const ORD = ['tool', 'seed', 'fert', 'crop', 'food', 'res', 'place', 'arredo', 'gift', 'bad', 'key'];
// lo zaino della Valle è di 30 posti
{
  Ext.on('applyFree', function (m, st) {
    if (m.id === 'main' && isFree(st) && !G.visit) {
      while (st.inv.length < INV_FREE) st.inv.push(null);
    }
  });
}
// la fila della barra: ⇅1, ⇅2, ⇅3
{
  const _hb = UI.hotbar.bind(UI);
  UI.hotbar = function () {
    _hb();
    const st = G.st,
      r = $('#hbrow');
    if (st && r && st.inv.length > 10) r.textContent = '⇅' + (Math.floor(st.sel / 10) + 1);
  };
}

// ---------- la schermata dello zaino (e della cassa) ----------
// Tutto in una schermata, senza scorrere: in alto i comandi e una riga che dice cosa hai scelto, poi la cassa
// (se è aperta) e lo zaino, con la fila della barra evidenziata.
//   Tocca una pila: la scegli (resta dov'è). Tocca un altro posto: la sposti lì (uguali si uniscono, diverse si
//   scambiano). Tocca di nuovo la stessa: la lasci.
//   Tieni premuto su una pila: ne scegli metà. Con una pila scelta, tieni premuto su un altro posto: ne posi una.
//   Doppio tocco (o Maiusc+clic): spostamento veloce, zaino ↔ cassa (o barra ↔ resto dello zaino).
//   Trascina: sposti tutta la pila. Il cestino butta quello che hai scelto (gli attrezzi chiedono conferma).
// Niente resta mai «in mano»: le pile sono sempre in una casella, quindi chiudendo non si perde niente.
let ZCH = null; // la cassa aperta (chiave in built), o null
const ZSEL = { w: null, i: -1, n: 0 }; // la pila scelta: dove, e quanti se ne spostano
let ZLAST = null; // l'ultimo tocco (per il doppio tocco)
function zLists() {
  const L = { z: G.st.inv },
    b = ZCH && G.st.free && G.st.free.built[ZCH];
  // la cassa può sparire mentre è aperta (il padrone la toglie): si continua con il solo zaino
  if (b && Array.isArray(b.inv)) L.c = b.inv;
  else ZCH = null;
  return L;
}
const zTool = id => ITEMS[id] && ITEMS[id].t === 'tool';
const zRiga = () => Math.floor(G.st.sel / 10);
const zNessuna = () => {
  ZSEL.w = null;
  ZSEL.i = -1;
  ZSEL.n = 0;
};
// la scelta vale ancora? (la cassa può cambiare da fuori)
function zScelta() {
  const L = zLists(),
    s = ZSEL.w && L[ZSEL.w] && L[ZSEL.w][ZSEL.i];
  if (!s) {
    zNessuna();
    return null;
  }
  ZSEL.n = Math.min(Math.max(1, ZSEL.n), s.n);
  return s;
}
// cosa c'è nella cassa aperta (conteggio per oggetto): a ogni cambiamento si annuncia la differenza
// (Ext 'contenitore'), così in cooperativo al padrone arrivano operazioni («+5 legna») e non fotografie
let ZSNAP = null;
const zConta = A => A.reduce((o, s) => (s && (o[s.id] = (o[s.id] || 0) + s.n), o), {});
function zCassaNota() {
  if (!ZCH) {
    ZSNAP = null;
    return;
  }
  const ora = zConta(G.st.free.built[ZCH].inv);
  if (ZSNAP && ZSNAP.k === ZCH) {
    const ops = [];
    for (const id of new Set([...Object.keys(ora), ...Object.keys(ZSNAP.c)])) {
      const d = (ora[id] || 0) - (ZSNAP.c[id] || 0);
      if (d) ops.push({ id, n: d });
    }
    if (ops.length) Ext.run('contenitore', ZCH, 'cassa', ops);
  }
  ZSNAP = { k: ZCH, c: ora };
}
// la cassa è cambiata da fuori (l'amico padrone): si riprende il conteggio e si aggiorna, senza annunciare niente
function zCassaDaFuori(k) {
  if (!ZCH || ZCH !== k || !$('#mbox .izaino')) return;
  ZSNAP = { k, c: zConta(G.st.free.built[k].inv) };
  zAggiorna();
}
// mette una pila nel primo posto adatto di una lista (prima unendo, poi nei vuoti); restituisce quanto resta
function zInfila(A, s, ordine) {
  const idx = ordine || A.map((_, i) => i);
  if (!zTool(s.id))
    for (const i of idx) {
      const t = A[i];
      if (t && t.id === s.id) {
        t.n += s.n;
        return 0;
      }
    }
  // gli attrezzi uno per casella
  let resto = s.n;
  for (const i of idx)
    if (!A[i]) {
      const k = zTool(s.id) ? 1 : resto;
      A[i] = { id: s.id, n: k };
      resto -= k;
      if (!resto) return 0;
    }
  // la pila resta con quello che non ha trovato posto (chi la rimette giù non duplica niente)
  s.n = resto;
  return resto;
}
// chiudendo: quello che hai in mano torna a posto (prima da dove veniva, poi nello zaino, poi in cassa)

// ---------- le mosse ----------
// sposta n della pila (w,i) nel posto (w2,i2); restituisce vero se qualcosa si è mosso
function zMuovi(w, i, n, w2, i2) {
  const L = zLists(),
    A = L[w],
    B = L[w2],
    s = A && A[i],
    t = B && B[i2];
  if (!s || !B || (w === w2 && i === i2)) return false;
  n = Math.min(n, s.n);
  if (!t) {
    if (n >= s.n) {
      B[i2] = s;
      A[i] = null;
    } else {
      B[i2] = { id: s.id, n };
      s.n -= n;
    }
    return true;
  }
  if (t.id === s.id && !zTool(s.id)) {
    t.n += n;
    s.n -= n;
    if (s.n <= 0) A[i] = null;
    return true;
  }
  // diverse: si scambiano, ma solo pile intere (mezza pila su un posto occupato non ci sta)
  if (n < s.n) {
    UI.toast('Lì c’è già altro: scegli un posto vuoto o la pila intera.');
    return false;
  }
  B[i2] = s;
  A[i] = t;
  return true;
}
// spostamento veloce: zaino ↔ cassa, oppure barra ↔ resto dello zaino
function zVeloce(w, i) {
  const L = zLists(),
    A = L[w],
    s = A[i];
  if (!s) return;
  let B, ordine;
  if (L.c) {
    B = w === 'z' ? L.c : L.z;
    // dalla cassa: prima la barra, poi il resto
    if (B === L.z) {
      const r = zRiga();
      ordine = [...Array(L.z.length).keys()].sort(
        (a, b) => (Math.floor(b / 10) === r) - (Math.floor(a / 10) === r) || a - b
      );
    }
  } else {
    B = L.z;
    const r = zRiga(),
      inBarra = Math.floor(i / 10) === r;
    ordine = [...Array(L.z.length).keys()].filter(k => (Math.floor(k / 10) === r) !== inBarra);
  }
  A[i] = null;
  const resto = zInfila(B, s, ordine);
  if (resto) {
    A[i] = s;
    AU.play('err');
    UI.toast(L.c ? 'Non c’è posto.' : 'Non c’è posto dall’altra parte.');
    return;
  }
  AU.play('blip');
}
// un tocco su un posto (lungo: tieni premuto)
function zTocca(w, i, lungo) {
  const L = zLists(),
    t = L[w] && L[w][i],
    s = zScelta();
  if (!s) {
    if (!t) return;
    ZSEL.w = w;
    ZSEL.i = i;
    ZSEL.n = lungo && t.n > 1 ? Math.ceil(t.n / 2) : t.n;
    AU.play('ui');
    return;
  }
  if (ZSEL.w === w && ZSEL.i === i) {
    // la stessa: tenendo premuto passi da metà a tutta e viceversa, altrimenti la lasci
    if (lungo && t.n > 1) ZSEL.n = ZSEL.n === t.n ? Math.ceil(t.n / 2) : t.n;
    else zNessuna();
    return;
  }
  if (lungo) {
    // posane una sola, e la scelta resta
    if (zMuovi(ZSEL.w, ZSEL.i, 1, w, i)) {
      AU.play('blip');
      ZSEL.n--;
      if (ZSEL.n <= 0) zNessuna();
      else zScelta();
    }
    return;
  }
  if (zMuovi(ZSEL.w, ZSEL.i, ZSEL.n, w, i)) AU.play('blip');
  else AU.play('err');
  zNessuna();
}
function zButta() {
  const s = zScelta();
  if (!s) {
    UI.toast('Prima scegli cosa buttare.');
    return;
  }
  const it = ITEMS[s.id],
    n = ZSEL.n;
  if (it.t === 'tool' && !confirm(`Buttare ${it.n}? Non torna più.`)) return;
  s.n -= n;
  if (s.n <= 0) zLists()[ZSEL.w][ZSEL.i] = null;
  zNessuna();
  AU.play('pick');
  UI.toast(`Hai buttato: ${it.n}${n > 1 ? ' ×' + n : ''}.`);
}
function zComando(k) {
  const L = zLists();
  zNessuna();
  if (k === 'ordina') {
    for (const w in L) {
      const A = L[w],
        m = {},
        keep = [];
      for (const s of A) {
        if (!s) continue;
        if (zTool(s.id) || !m[s.id]) {
          const c = { id: s.id, n: s.n };
          keep.push(c);
          if (!zTool(s.id)) m[s.id] = c;
        } else m[s.id].n += s.n;
      }
      keep.sort(
        (a, b) =>
          ORD.indexOf(ITEMS[a.id].t) - ORD.indexOf(ITEMS[b.id].t) ||
          ITEMS[a.id].n.localeCompare(ITEMS[b.id].n)
      );
      // nello zaino gli attrezzi restano nella barra: si riempie prima la fila in uso
      if (w === 'z') {
        const r = zRiga(),
          ord = [...Array(A.length).keys()].sort(
            (a, b) => (Math.floor(b / 10) === r) - (Math.floor(a / 10) === r) || a - b
          );
        for (let i = 0; i < A.length; i++) A[i] = null;
        keep.forEach((c, j) => (A[ord[j]] = c));
      } else for (let i = 0; i < A.length; i++) A[i] = keep[i] || null;
    }
    AU.play('ok');
  }
  // metti tutto (tranne gli attrezzi), prendi tutto, oppure solo le cose che in cassa ci sono già
  if ((k === 'deposita' || k === 'prendi' || k === 'uguali') && L.c) {
    const [A, B] = k === 'prendi' ? [L.c, L.z] : [L.z, L.c],
      gia = new Set(L.c.filter(Boolean).map(s => s.id));
    let pieno = false;
    for (let i = 0; i < A.length; i++) {
      const s = A[i];
      if (!s || (k !== 'prendi' && zTool(s.id)) || (k === 'uguali' && !gia.has(s.id))) continue;
      A[i] = null;
      if (zInfila(B, s)) {
        A[i] = s;
        pieno = true;
      }
    }
    if (pieno) UI.toast(k === 'prendi' ? 'Lo zaino è pieno.' : 'La cassa è piena.');
    AU.play('ok');
  }
}

// ---------- disegno: la schermata si costruisce una volta, poi si aggiornano solo le caselle ----------
function zDesc(s, n) {
  if (!s) return '';
  const it = ITEMS[s.id],
    v = it.v || it.p;
  return `<b>${esc(it.n)}</b>${s.n > 1 ? ` ×${n && n < s.n ? n + ' di ' + s.n : s.n}` : ''}${v && !zTool(s.id) ? ` · vale ${v}` : ''} <span class="small">— ${esc(it.d || '')}</span>`;
}
function zGriglia(w, n) {
  let h = '';
  for (let i = 0; i < n; i++)
    h += `<div class="islot" data-w="${w}" data-i="${i}"><canvas width="32" height="32"></canvas><i></i></div>`;
  return `<div class="igrid" data-g="${w}">${h}</div>`;
}
function zaino(chestKey) {
  ZCH = chestKey || null;
  zNessuna();
  ZLAST = null;
  const L = zLists();
  zCassaNota();
  UI.open(
    `<div class="izaino"><button class="btn mclose" data-close>✕</button><h2>${ZCH ? 'Cassa' : 'Zaino'}</h2>` +
      `<div class="itools"><button class="btn" data-z="ordina" title="Unisce le pile uguali e mette in ordine">Ordina</button>` +
      (ZCH
        ? `<button class="btn" data-z="deposita" title="Tutto nella cassa, tranne gli attrezzi">⇩ Metti tutto</button><button class="btn" data-z="uguali" title="Nella cassa solo le cose che ci sono già">⇩ Uguali</button><button class="btn" data-z="prendi">⇧ Prendi tutto</button>`
        : '') +
      `<div class="islot itrash" data-trash="1" title="Butta quello che hai scelto">🗑</div></div>` +
      `<div class="iinfo"></div>` +
      (ZCH ? `<div class="icap">Cassa</div>${zGriglia('c', L.c.length)}<div class="icap">Zaino</div>` : '') +
      zGriglia('z', L.z.length) +
      `</div>`,
    () => {
      zCassaNota();
      ZCH = null;
      zNessuna();
      ZLAST = null;
      UI.hotbar();
      if (G.st && G.st.free) NET.save(myHome());
    }
  );
  const box = $('#mbox');
  box.querySelectorAll('[data-z]').forEach(
    b =>
      (b.onclick = () => {
        zComando(b.dataset.z);
        zDopo();
      })
  );
  zDrag(box);
  zAggiorna();
}
// dopo ogni mossa: la cassa annuncia i cambiamenti, la barra si aggiorna, si ridisegnano le caselle
function zDopo() {
  zCassaNota();
  UI.hotbar();
  zAggiorna();
}
function zAggiorna() {
  const box = $('#mbox');
  if (!box || !box.querySelector('.izaino')) return;
  const L = zLists(),
    sc = zScelta(),
    r = zRiga();
  box.querySelectorAll('.islot[data-w]').forEach(el => {
    const w = el.dataset.w,
      i = +el.dataset.i,
      s = L[w] && L[w][i],
      k = s ? s.id + ':' + s.n : '';
    if (el._k !== k) {
      el._k = k;
      const x = el.firstChild.getContext('2d');
      x.clearRect(0, 0, 32, 32);
      if (s && ICON[s.id]) x.drawImage(ICON[s.id], 0, 0);
      el.lastChild.textContent = s && s.n > 1 ? s.n : '';
      el.title = s ? ITEMS[s.id].n : '';
    }
    el.classList.toggle('hot', w === 'z' && L.z.length > 10 && Math.floor(i / 10) === r);
    el.classList.toggle('sel', w === 'z' && i === G.st.sel);
    el.classList.toggle('pick', !!sc && ZSEL.w === w && ZSEL.i === i);
  });
  box.querySelector('.iinfo').innerHTML = sc
    ? zDesc(sc, ZSEL.n)
    : '<span class="small">Tocca per scegliere, tocca un posto per spostare · <b>doppio tocco</b>: sposta veloce · <b>tieni premuto</b>: metà pila (o posane una) · trascina</span>';
  box.querySelector('[data-trash]').classList.toggle('on', !!sc);
}
// tocchi, doppi tocchi, pressioni lunghe e trascinamenti (dito o mouse)
function zDrag(box) {
  let d = null;
  const LUNGO = 420;
  box.querySelectorAll('.islot[data-w]').forEach(el => {
    const w = el.dataset.w,
      i = +el.dataset.i;
    el.onpointerdown = e => {
      e.preventDefault();
      d = { w, i, x: e.clientX, y: e.clientY, moved: false, el, shift: e.shiftKey };
      d.timer = setTimeout(() => {
        if (!d || d.moved) return;
        zTocca(w, i, true);
        if (navigator.vibrate) navigator.vibrate(15);
        zDopo();
        d = null;
      }, LUNGO);
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
    };
    el.onpointermove = e => {
      if (!d || d.el !== el) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) return;
      const L = zLists();
      if (!d.moved) {
        if (!L[w][i]) return;
        clearTimeout(d.timer);
        d.moved = true;
        const g = document.createElement('canvas');
        g.width = g.height = 32;
        g.className = 'ighost';
        if (ICON[L[w][i].id]) g.getContext('2d').drawImage(ICON[L[w][i].id], 0, 0);
        document.body.appendChild(g);
        d.g = g;
        el.classList.add('drag');
      }
      d.g.style.left = e.clientX + 'px';
      d.g.style.top = e.clientY + 'px';
    };
    el.onpointerup = e => {
      if (!d || d.el !== el) return;
      const was = d;
      d = null;
      clearTimeout(was.timer);
      if (was.g) was.g.remove();
      el.classList.remove('drag');
      if (was.moved) {
        // trascinata: tutta la pila dove la lasci (o nel cestino)
        const t = document.elementFromPoint(e.clientX, e.clientY),
          slot = t && t.closest && t.closest('.islot[data-w]'),
          trash = t && t.closest && t.closest('[data-trash]'),
          s = zLists()[w][i];
        zNessuna();
        if (s) {
          ZSEL.w = w;
          ZSEL.i = i;
          ZSEL.n = s.n;
          if (slot) zTocca(slot.dataset.w, +slot.dataset.i, false);
          else if (trash) zButta();
          zNessuna();
        }
        ZLAST = null;
        zDopo();
        return;
      }
      const now = performance.now();
      if (was.shift) {
        zNessuna();
        zVeloce(w, i);
        ZLAST = null;
      } else if (ZLAST && ZLAST.w === w && ZLAST.i === i && now - ZLAST.t < 330) {
        // doppio tocco: il primo l'aveva scelta, il secondo la sposta veloce
        zNessuna();
        zVeloce(w, i);
        ZLAST = null;
      } else {
        zTocca(w, i, false);
        ZLAST = { w, i, t: now };
      }
      zDopo();
    };
    el.onpointercancel = () => {
      if (d) {
        clearTimeout(d.timer);
        if (d.g) d.g.remove();
        d.el.classList.remove('drag');
      }
      d = null;
    };
  });
  const tr = box.querySelector('[data-trash]');
  if (tr)
    tr.onclick = () => {
      zButta();
      zDopo();
    };
}

// il pulsante 🎒 accanto alla barra, e il tasto I
{
  const _bh = UI.buildHotbar.bind(UI);
  UI.buildHotbar = function () {
    _bh();
    const hb = $('#hotbar');
    const b = document.createElement('button');
    b.id = 'bInv';
    b.className = 'ib';
    b.title = 'Zaino (I)';
    b.textContent = '🎒';
    b.onpointerdown = e => {
      e.stopPropagation();
      if (G.mode !== 'game' || G.cut || UI.busy()) return;
      AU.play('ui');
      zaino();
    };
    hb.appendChild(b);
  };
}
if ($('#hotbar') && $('#hotbar').children.length) UI.buildHotbar();
addEventListener('keydown', e => {
  if (e.code !== 'KeyI' || e.repeat || (e.target && e.target.tagName === 'INPUT')) return;
  if (UI.modalOpen && $('#mbox .izaino') && !ZCH) {
    UI.close();
    return;
  }
  if (G.mode !== 'game' || G.cut || UI.busy()) return;
  e.preventDefault();
  zaino();
});
GUIDES.push({
  id: 'zaino',
  v: 42,
  n: 'Lo zaino',
  steps: [
    {
      t: 'Il bottone 🎒 accanto alla barra (o il tasto I) apre lo zaino: tre file da dieci, quella evidenziata è la barra che usi. Toccando una cassa, la cassa sta sopra e lo zaino sotto, tutto in una schermata.'
    },
    {
      t: '<b>Tocca</b> una pila per sceglierla (resta al suo posto), poi tocca dove vuoi metterla: le uguali si uniscono, le diverse si scambiano. <b>Doppio tocco</b>: la sposti al volo tra zaino e cassa (o tra barra e zaino). <b>Tieni premuto</b>: ne scegli metà; con una pila scelta, tieni premuto su un altro posto per posarne una. Puoi anche trascinare.'
    },
    {
      t: '«Ordina» unisce le pile e mette in ordine. Nella cassa: «⇩ Metti tutto» (tranne gli attrezzi), «⇩ Uguali» (solo le cose che in cassa ci sono già) e «⇧ Prendi tutto». Il cestino butta quello che hai scelto.'
    }
  ]
});
