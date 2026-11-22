'use strict';
// ================= LO ZAINO (inventario vero) =================
// Nella Valle lo zaino ha tre file da 10 (la barra in basso mostra una fila alla volta: ⇅ cambia fila).
// Schermata completa (🎒 accanto alla barra, o tasto I), come in Minecraft: tocca per prendere in mano e posare,
// doppio tocco per spostare veloce, tieni premuto per dividere la pila. La cassa usa lo stesso sistema.
// Gli oggetti della storia, nella Valle, sono ricordi qualsiasi: si spostano, si mettono in cassa, si buttano.

const INV_FREE = 30;
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

// ---------- la schermata (stile Minecraft) ----------
// Tocca una pila: la prendi «in mano». Tocca un posto: la posi (uguali si uniscono, diverse si scambiano).
// Doppio tocco: spostamento veloce (zaino ↔ cassa, oppure barra ↔ resto dello zaino). Su computer anche Maiusc+clic.
// Tieni premuto: prendi metà pila; con qualcosa in mano, tieni premuto per posarne uno solo.
// Trascina: sposta direttamente. Il cestino butta quello che hai in mano (gli attrezzi chiedono conferma).
// Le pile non si perdono mai: chiudendo, quello che hai in mano torna nello zaino (lo scambio è permesso solo
// se poi c'è posto per quello che prendi).
let ZPICK = null; // compatibilità: chi apre lo zaino lo azzera
let ZCH = null; // la cassa aperta (chiave in built), o null
const ZH = { s: null, da: null }; // la pila in mano e da dove viene {w,i}
let ZLAST = null; // l'ultimo tocco (per il doppio tocco)
let ZINFO = null; // l'oggetto di cui si mostra la descrizione
function zLists() {
  const L = { z: G.st.inv };
  if (ZCH) L.c = G.st.free.built[ZCH].inv;
  return L;
}
const zTool = id => ITEMS[id] && ITEMS[id].t === 'tool';
const zRiga = () => Math.floor(G.st.sel / 10);
function zSlot(L, w, i, s) {
  const hot = w === 'z' && Math.floor(i / 10) === zRiga(),
    sel = w === 'z' && i === G.st.sel,
    da = ZH.s && ZH.da && ZH.da.w === w && ZH.da.i === i;
  return `<div class="islot${hot ? ' hot' : ''}${sel ? ' sel' : ''}${da ? ' da' : ''}" data-w="${w}" data-i="${i}"><canvas width="32" height="32"></canvas><i>${s && s.n > 1 ? s.n : ''}</i></div>`;
}
// la griglia: per lo zaino prima le file di riserva, poi (staccata) la barra, come in Minecraft
function zGrid(w, L, label) {
  const righe = [];
  for (let r = 0; r * 10 < L.length; r++) righe.push(r);
  const hr = w === 'z' && L.length > 10 ? zRiga() : -1;
  const riga = r =>
    `<div class="igrid">${L.slice(r * 10, r * 10 + 10)
      .map((s, k) => zSlot(L, w, r * 10 + k, s))
      .join('')}</div>`;
  let h = '';
  for (const r of righe) if (r !== hr) h += riga(r);
  if (hr >= 0) h += `<div class="irow ibarra"><span class="small">Barra · ⇅${hr + 1}</span></div>` + riga(hr);
  return (label ? `<h3>${label}</h3>` : '') + h;
}
function zDesc(s) {
  if (!s) return '';
  const it = ITEMS[s.id],
    v = it.v || it.p;
  return `<b>${esc(it.n)}</b>${s.n > 1 ? ' ×' + s.n : ''}${v && !zTool(s.id) ? ` <span class="small">· vale ${v}</span>` : ''}<br><span class="small">${esc(it.d || '')}</span>`;
}
function zInfo() {
  if (ZH.s) return `<span class="ihand-l">In mano</span> ${zDesc(ZH.s)}`;
  if (ZINFO) return zDesc(ZINFO);
  return '<span class="small">Tocca per prendere e posare · <b>doppio tocco</b>: sposta veloce · <b>tieni premuto</b>: metà pila (o posane uno) · trascina per spostare.</span>';
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
// la cassa è cambiata da fuori (l'amico padrone): si riprende il conteggio e si ridisegna, senza annunciare niente
function zCassaDaFuori(k) {
  if (!ZCH || ZCH !== k || !UI.modalOpen) return;
  ZSNAP = { k, c: zConta(G.st.free.built[k].inv) };
  zRidisegna();
}
function zaino(chestKey) {
  ZCH = chestKey || null;
  zCassaNota();
  const L = zLists();
  const tools = `<div class="itools"><button class="btn" data-z="ordina" title="Riordina e unisce le pile uguali">Ordina</button>${ZCH ? ' <button class="btn" data-z="deposita">Metti tutto in cassa</button> <button class="btn" data-z="prendi">Prendi tutto</button>' : ''}<div class="islot itrash${ZH.s ? ' on' : ''}" data-trash="1" title="Butta">🗑</div></div>`;
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${ZCH ? 'Cassa' : 'Zaino'}</h2>` +
      `<div class="ihand"><div class="islot ihslot${ZH.s ? ' on' : ''}"><canvas width="32" height="32"></canvas><i>${ZH.s && ZH.s.n > 1 ? ZH.s.n : ''}</i></div><div class="iinfo">${zInfo()}</div></div>` +
      tools +
      (ZCH ? zGrid('c', L.c, 'Cassa') + '<h3>Zaino</h3>' : '') +
      zGrid('z', L.z, ''),
    () => {
      zRimetti();
      zCassaNota();
      ZCH = null;
      ZSNAP = null;
      ZINFO = null;
      ZLAST = null;
      UI.hotbar();
      if (G.st && G.st.free) NET.save(myHome());
    }
  );
  const box = $('#mbox');
  box.querySelectorAll('.islot[data-w]').forEach(el => {
    const s = L[el.dataset.w][+el.dataset.i];
    if (s && ICON[s.id]) el.firstChild.getContext('2d').drawImage(ICON[s.id], 0, 0);
    if (s) el.title = ITEMS[s.id].n;
  });
  if (ZH.s && ICON[ZH.s.id])
    box.querySelector('.ihslot canvas').getContext('2d').drawImage(ICON[ZH.s.id], 0, 0);
  box.querySelectorAll('[data-z]').forEach(b => (b.onclick = () => zComando(b.dataset.z)));
  zDrag(box);
}
// ridisegna senza far saltare la schermata (UI.open la riporterebbe in cima)
function zRidisegna() {
  const box = $('#mbox'),
    y = box.scrollTop;
  UI._mclose = null;
  zaino(ZCH);
  box.scrollTop = y;
}
// c'è un posto per una pila di questo tipo (fuori dalla mano)?
function zPosto(id) {
  const L = zLists();
  for (const w in L) for (const s of L[w]) if (!s || (s.id === id && !zTool(id))) return true;
  return false;
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
  for (const i of idx)
    if (!A[i]) {
      A[i] = { id: s.id, n: s.n };
      return 0;
    }
  return s.n;
}
// chiudendo: quello che hai in mano torna a posto (prima da dove veniva, poi nello zaino, poi in cassa)
function zRimetti() {
  if (!ZH.s) return;
  const L = zLists(),
    s = ZH.s,
    da = ZH.da;
  ZH.s = ZH.da = null;
  if (da && L[da.w]) {
    const A = L[da.w],
      t = A[da.i];
    if (!t) {
      A[da.i] = s;
      return;
    }
    if (t.id === s.id && !zTool(s.id)) {
      t.n += s.n;
      return;
    }
  }
  if (!zInfila(L.z, s)) return;
  if (L.c && !zInfila(L.c, s)) return;
  addItem(s.id, s.n);
}
// tocco su un posto
function zTocca(w, i, lungo) {
  const L = zLists(),
    A = L[w],
    t = A[i];
  if (!ZH.s) {
    if (!t) return;
    ZINFO = t;
    if (lungo && t.n > 1) {
      // metà pila (arrotondata per eccesso), il resto rimane
      const h = Math.ceil(t.n / 2);
      t.n -= h;
      ZH.s = { id: t.id, n: h };
    } else {
      ZH.s = t;
      A[i] = null;
    }
    ZH.da = { w, i };
    AU.play('ui');
    return;
  }
  const h = ZH.s;
  if (lungo) {
    // posane uno solo
    if (!t || (t.id === h.id && !zTool(h.id))) {
      if (t) t.n++;
      else A[i] = { id: h.id, n: 1 };
      h.n--;
      if (h.n <= 0) ZH.s = ZH.da = null;
      AU.play('blip');
    }
    return;
  }
  if (!t) {
    A[i] = h;
    ZH.s = ZH.da = null;
  } else if (t.id === h.id && !zTool(h.id)) {
    t.n += h.n;
    ZH.s = ZH.da = null;
  } else {
    // scambio: solo se poi c'è un posto per quello che prendi in mano
    A[i] = h;
    if (!zPosto(t.id)) {
      A[i] = t;
      AU.play('err');
      UI.toast('Non c’è posto per scambiarli: prima libera un posto.');
      return;
    }
    ZH.s = t;
    ZH.da = { w, i };
    ZINFO = t;
  }
  AU.play('blip');
}
// spostamento veloce di una pila: zaino ↔ cassa, oppure barra ↔ resto dello zaino
function zVeloce(w, i) {
  const L = zLists(),
    A = L[w],
    s = A[i];
  if (!s) return;
  let B, ordine;
  if (L.c) {
    B = w === 'z' ? L.c : L.z;
    if (B === L.z) {
      // dalla cassa: prima la barra, poi il resto
      const r = zRiga();
      ordine = [...Array(L.z.length).keys()].sort(
        (a, b) => (Math.floor(b / 10) === r) - (Math.floor(a / 10) === r)
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
  ZINFO = s;
  AU.play('blip');
}
function zButta() {
  const h = ZH.s;
  if (!h) return;
  const it = ITEMS[h.id];
  if (it.t === 'tool' && !confirm(`Buttare ${it.n}? Non torna più.`)) return;
  ZH.s = ZH.da = null;
  ZINFO = null;
  AU.play('pick');
  UI.toast(`Hai buttato: ${it.n}${h.n > 1 ? ' ×' + h.n : ''}.`);
}
function zComando(k) {
  const L = zLists();
  if (k === 'ordina') {
    zRimetti();
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
  if ((k === 'deposita' || k === 'prendi') && L.c) {
    zRimetti();
    const [A, B] = k === 'deposita' ? [L.z, L.c] : [L.c, L.z];
    for (let i = 0; i < A.length; i++) {
      const s = A[i];
      if (!s || (k === 'deposita' && zTool(s.id))) continue;
      A[i] = null;
      if (zInfila(B, s)) {
        A[i] = s;
        UI.toast(k === 'deposita' ? 'La cassa è piena.' : 'Lo zaino è pieno.');
        break;
      }
    }
    AU.play('ok');
  }
  if (G.st.free) NET.save(myHome());
  zRidisegna();
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
      d = { w, i, x: e.clientX, y: e.clientY, moved: false, el, lungo: false, shift: e.shiftKey };
      d.timer = setTimeout(() => {
        if (!d || d.moved) return;
        d.lungo = true;
        zTocca(w, i, true);
        if (navigator.vibrate) navigator.vibrate(15);
        zRidisegna();
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
        // si trascina solo una pila vera, a mani vuote
        if (ZH.s || !L[w][i]) return;
        clearTimeout(d.timer);
        d.moved = true;
        const g = document.createElement('canvas');
        g.width = g.height = 32;
        g.className = 'ighost';
        const s = L[w][i];
        if (ICON[s.id]) g.getContext('2d').drawImage(ICON[s.id], 0, 0);
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
        const t = document.elementFromPoint(e.clientX, e.clientY),
          slot = t && t.closest && t.closest('.islot[data-w]'),
          trash = t && t.closest && t.closest('[data-trash]');
        zTocca(w, i, false);
        if (slot) zTocca(slot.dataset.w, +slot.dataset.i, false);
        else if (trash) zButta();
        zRimetti();
        ZLAST = null;
        zRidisegna();
        return;
      }
      const now = performance.now();
      if (was.shift) {
        zVeloce(w, i);
        ZLAST = null;
      } else if (ZLAST && ZLAST.w === w && ZLAST.i === i && now - ZLAST.t < 330) {
        // doppio tocco: il primo tocco l'aveva presa in mano; si rimette giù e si sposta veloce
        if (ZH.s && ZH.da && ZH.da.w === w && ZH.da.i === i) zTocca(w, i, false);
        zVeloce(w, i);
        ZLAST = null;
      } else {
        zTocca(w, i, false);
        ZLAST = { w, i, t: now };
      }
      zRidisegna();
    };
    el.onpointercancel = () => {
      if (d) {
        clearTimeout(d.timer);
        if (d.g) d.g.remove();
      }
      d = null;
    };
  });
  const tr = box.querySelector('[data-trash]');
  if (tr)
    tr.onclick = () => {
      zButta();
      zRidisegna();
    };
  const hs = box.querySelector('.ihslot');
  if (hs)
    hs.onclick = () => {
      zRimetti();
      zRidisegna();
    };
}

// la cassa: stessa schermata, due griglie

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
      ZPICK = null;
      zaino();
    };
    hb.appendChild(b);
  };
}
if ($('#hotbar') && $('#hotbar').children.length) UI.buildHotbar();
addEventListener('keydown', e => {
  if (e.code !== 'KeyI' || e.repeat || (e.target && e.target.tagName === 'INPUT')) return;
  if (UI.modalOpen && $('#mbox .igrid') && !ZCH) {
    UI.close();
    return;
  }
  if (G.mode !== 'game' || G.cut || UI.busy()) return;
  e.preventDefault();
  ZPICK = null;
  zaino();
});
GUIDES.push({
  id: 'zaino',
  v: 16,
  n: 'Lo zaino',
  steps: [
    {
      t: 'Lo zaino ha tre file. Il bottone 🎒 accanto alla barra (o il tasto I) apre la schermata completa: in basso, staccata, c’è la fila che usi come barra.'
    },
    {
      t: 'Funziona come in Minecraft: <b>tocca</b> una pila per prenderla in mano e tocca un posto per posarla (uguali si uniscono, diverse si scambiano). <b>Doppio tocco</b>: la sposti al volo tra barra e zaino, o tra zaino e cassa. <b>Tieni premuto</b>: prendi metà pila; con qualcosa in mano, tieni premuto per posarne uno solo. Puoi anche trascinare.'
    },
    {
      t: 'Per buttare qualcosa, prendilo in mano e tocca il cestino. «Ordina» unisce le pile e mette in ordine. Nella cassa ci sono anche «Metti tutto in cassa» e «Prendi tutto».'
    }
  ]
});
