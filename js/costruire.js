'use strict';
// ================= LA VALLE INFINITA — FASE 2: COSTRUIRE SUL SERIO =================
// Modalità costruzione (tasto B o il martello in alto): il personaggio si ferma, un cursore si muove
// sulla griglia con frecce/joystick/mouse/tocco. Piazza ciò che hai in mano (anteprima verde o rossa),
// sposta le costruzioni (le bestie, le casse e gli abitanti vengono con loro), togli e riprendi.

G.bm = null; // {x,y,mode:'piazza'|'sposta'|'togli',carry:{from,data},t}
const BM_MODES = { piazza: 'Piazza', sposta: 'Sposta', togli: 'Togli' };
const bmHome = () => isFree(G.st) && !G.visit && G.map && (G.map.id === 'main' || G.map.id === 'house');
// fuori si piazzano le costruzioni, in casa i mobili
const canHere = id =>
  !!ITEMS[id] && (G.map && G.map.id === 'house' ? ITEMS[id].t === 'arredo' : ITEMS[id].t === 'place');
function houseRebuild() {
  const st = G.st;
  G.maps.house = buildHouse(st);
  addExits(G.maps.house);
  buildGround(G.maps.house);
  applyLook(G.maps.house, st);
  G.map = G.maps.house;
}
function bmOpen() {
  if (G.mode !== 'game' || G.cut || UI.busy()) return;
  if (!isFree(G.st)) {
    UI.toast("La modalità costruzione c'è nella Valle (gioco libero).");
    return;
  }
  if (G.visit) {
    UI.toast('Sei ospite: qui non puoi costruire.');
    return;
  }
  if (G.map.id !== 'main' && G.map.id !== 'house') {
    UI.toast("Qui non si costruisce: esci all'aperto o torna a casa.");
    return;
  }
  const [fx, fy] = frontTile();
  const it = selItem();
  G.bm = { x: fx, y: fy, mode: it && canHere(it.id) ? 'piazza' : 'sposta', carry: null, t: 0 };
  G.player.moving = false;
  AU.play('ui');
  bmBar();
}
function bmClose() {
  const b = G.bm;
  if (!b) return;
  if (b.carry) {
    bmPut(b.carry.from, b.carry.data, true);
    b.carry = null;
  }
  G.bm = null;
  $('#bmbar') && $('#bmbar').classList.add('hide');
  AU.play('ui');
  NET.save(G.st);
}
function bmBar() {
  let el = $('#bmbar');
  if (!el) {
    el = document.createElement('div');
    el.id = 'bmbar';
    el.className = 'dark hide';
    ($('#hud') || document.body).appendChild(el);
    el.addEventListener('pointerdown', e => e.stopPropagation());
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-bm]');
      if (!a) return;
      e.stopPropagation();
      const v = a.dataset.bm;
      if (v === 'esci') return bmClose();
      if (v === 'ok') return bmAction();
      if (G.bm.carry) {
        UI.toast('Prima metti giù quello che stai spostando.');
        return;
      }
      G.bm.mode = v;
      AU.play('ui');
      bmBar();
    });
  }
  const b = G.bm;
  if (!b) {
    el.classList.add('hide');
    return;
  }
  const it = selItem();
  const what = b.carry
    ? `Stai spostando: <b>${ITEMS[b.carry.data.id].n}</b>`
    : b.mode === 'piazza'
      ? it && canHere(it.id)
        ? `In mano: <b>${ITEMS[it.id].n}</b> ×${it.n}`
        : 'Scegli nella barra qualcosa da costruire.'
      : b.mode === 'sposta'
        ? 'Punta una costruzione e premi A per sollevarla.'
        : 'Punta una costruzione o una lastra: torna nello zaino.';
  el.classList.toggle('top', !!(G.map && G.map.id === 'house'));
  el.innerHTML = `<b>Costruzione</b><p>${what}</p><p class="tb">${Object.entries(BM_MODES)
    .map(([k, n]) => `<button class="btn ${b.mode === k ? 'on' : ''}" data-bm="${k}">${n}</button>`)
    .join(
      ' '
    )} <button class="btn" data-bm="ok">A · Fai</button> <button class="btn" data-bm="esci">Esci (B)</button></p>`;
  el.classList.remove('hide');
}
// regole di posa: le stesse del gioco, ma sul cursore
function bmCanPlace(id, x, y) {
  if (G.map && G.map.id === 'house') {
    const m = G.map,
      o = m.objAt(x, y);
    if (!ITEMS[id] || ITEMS[id].t !== 'arredo') return 'In casa vanno i mobili.';
    if (ITEMS[id].wall) return m.get(x, y) === 9 && !o ? '' : 'I quadri vanno sulla parete in alto.';
    return furnFree(m, x, y) ? '' : 'Non qui: serve un posto libero sul pavimento, lontano dalla porta.';
  }
  const st = G.st,
    m = G.maps.main,
    k = fkey(x, y),
    g = m.get(x, y),
    o = m.objAt(x, y);
  if (ITEMS[id].size)
    return bigFree(id, x, y)
      ? ''
      : 'Serve un prato libero di ' + ITEMS[id].size.join('×') + ' sulle tue terre.';
  if (!ownedAt(x, y)) return 'Questa terra non è tua.';
  if (x < 4 || x > 96 || y < 4 || y > 41) return 'Troppo vicino al bosco.';
  if (id === 'lastre')
    return !o && !st.farm[k] && (g === 1 || g === 12 || g === 2)
      ? ''
      : "Le lastre vanno sull'erba o sui vialetti liberi.";
  if (o || m.solid(x, y) || !(g === 1 || g === 12 || g === 2)) return 'Non qui: serve un posto libero.';
  if (st.farm[k] && st.farm[k].c) return "C'è una pianta.";
  return '';
}
function bmPut(k, data, quiet) {
  const st = G.st,
    W2 = st.free,
    [x, y] = k.split(',').map(Number);
  if (G.map && G.map.id === 'house') {
    W2.inside = W2.inside || {};
    W2.inside[k] = data;
    houseRebuild();
    if (!quiet) {
      AU.play('plant');
      const o = G.map.objAt(x, y);
      if (o) o.popT = G.t;
    }
    return;
  }
  if (data.id === 'lastre') {
    W2.tiles = W2.tiles || {};
    W2.tiles[k] = 11;
  } else {
    if (st.farm[k] && !ITEMS[data.id].size) delete st.farm[k];
    W2.built[k] = data;
  }
  rebuildMaps();
  G.map = G.maps.main;
  if (!quiet) {
    AU.play(ITEMS[data.id].size ? 'slam' : 'plant');
    hitFx(x, y, '#8a6a3a');
    const o = G.map.objAt(x, y);
    if (o) o.popT = G.t;
  }
}
// le cose che vivono dentro una costruzione la seguono
function bmRekey(from, to) {
  const st = G.st,
    W2 = st.free;
  for (const a of W2.animals || []) if (a.home === from) a.home = to;
  for (const r of W2.residents || []) if (r.house === from) r.house = to;
}
function bmTarget(x, y) {
  if (G.map && G.map.id === 'house') {
    const o = G.map.objAt(x, y);
    return o && o.kind === 'furn' && (G.st.free.inside || {})[o.fk] ? o : null;
  }
  const m = G.maps.main,
    o = m.objAt(x, y);
  if (o && o.kind === 'built' && G.st.free.built[o.bk]) return o;
  return null;
}
function bmAction() {
  const b = G.bm;
  if (!b) return;
  if (G.map && G.map.id === 'house') return bmActionHouse();
  const st = G.st,
    W2 = st.free,
    m = G.maps.main,
    x = b.x,
    y = b.y;
  if (b.carry) {
    const d = b.carry.data,
      anchor = fkey(x, y),
      why = bmCanPlace(d.id, x, y);
    if (why) {
      UI.toast(why);
      AU.play('no');
      return;
    }
    bmPut(anchor, d);
    bmRekey(b.carry.from, anchor);
    b.carry = null;
    UI.toast('Spostato: ' + ITEMS[d.id].n + '.');
    bmBar();
    return;
  }
  if (b.mode === 'piazza') {
    const it = selItem();
    if (!it || !canHere(it.id)) {
      UI.toast(
        G.map.id === 'house'
          ? 'Seleziona nella barra un mobile o un quadro.'
          : 'Seleziona nella barra qualcosa da costruire.'
      );
      return;
    }
    const why = bmCanPlace(it.id, x, y);
    if (why) {
      UI.toast(why);
      AU.play('no');
      return;
    }
    if (it.id === 'casetta') {
      const r = myRank(st),
        cnt = Object.values(W2.built).filter(q => q.id === 'casetta').length;
      if (r < 1 || cnt >= resCap(r)) {
        UI.toast(
          r < 1
            ? 'Le casette si costruiscono dal rango Borgo.'
            : `Per ora il Consiglio permette ${resCap(r)} casette.`
        );
        return;
      }
    }
    const id = it.id,
      d = { id };
    if (ITEMS[id].tree) d.d = st.day;
    if (id === 'cassa') d.inv = Array(20).fill(null);
    removeItem(id, 1);
    bmPut(fkey(x, y), d);
    addXP('arti', ITEMS[id].size ? 10 : 3);
    st.flags.built = (st.flags.built || 0) + 1;
    if (id === 'casetta') UI.toast('Casetta costruita! Domattina arriverà qualcuno ad abitarla.');
    UI.hotbar();
    bmBar();
    return;
  }
  // sposta e togli
  const k = fkey(x, y);
  if (b.mode === 'togli' && W2.tiles && W2.tiles[k] === 11 && !m.objAt(x, y)) {
    if (!addItem('lastre', 1)) return;
    delete W2.tiles[k];
    rebuildMaps();
    G.map = G.maps.main;
    AU.play('pick');
    return;
  }
  const o = bmTarget(x, y);
  if (!o) {
    UI.toast(b.mode === 'sposta' ? "Qui non c'è niente da spostare." : "Qui non c'è niente da togliere.");
    return;
  }
  const bd = W2.built[o.bk];
  if (b.mode === 'togli') {
    if (bd.id === 'cassa' && (bd.inv || []).some(Boolean)) {
      UI.toast('Svuota la cassa prima di toglierla.');
      return;
    }
    if (MACH[bd.id] && !macVuota(bd)) {
      UI.toast(`Svuota la ${ITEMS[bd.id].n.toLowerCase()} prima di toglierla.`);
      return;
    }
    if (ITEMS[bd.id].size && animalsOf(o.bk).length) {
      UI.toast('Dentro ci vivono delle bestie. Spostala, invece.');
      return;
    }
    const res = (W2.residents || []).find(r => r.house === o.bk);
    if (res) {
      UI.toast(`Ci abita ${NAMES[res.id]}. Puoi spostare la casetta, non toglierla.`);
      return;
    }
    if (ITEMS[bd.id].tree && st.day - (bd.d || st.day) >= 3) {
      UI.toast("Un albero che ha messo radici non si toglie: si abbatte con l'accetta.");
      return;
    }
    if (!addItem(bd.id, 1)) return;
    delete W2.built[o.bk];
    rebuildMaps();
    G.map = G.maps.main;
    AU.play('pick');
    UI.toast(ITEMS[bd.id].n + ' nello zaino.');
    UI.hotbar();
    return;
  }
  b.carry = { from: o.bk, data: bd };
  delete W2.built[o.bk];
  rebuildMaps();
  G.map = G.maps.main;
  AU.play('pick');
  bmBar();
}
// il cursore: frecce/WASD/joystick, mouse, tocco
{
  const _up = updatePlayer;
  updatePlayer = function (dt) {
    const b = G.bm;
    if (!b) return _up(dt);
    if (!bmHome() || G.cut) {
      bmClose();
      return;
    }
    G.player.moving = false;
    if (UI.busy()) return;
    if (IN.takeAct()) bmAction();
    if (!G.bm) return;
    const mx = IN.mx(),
      my = IN.my();
    if (Math.hypot(mx, my) < 0.3) {
      b.held = 0;
      b.t = 0;
      return;
    }
    b.t -= dt;
    if (b.t > 0) return;
    const dx = Math.abs(mx) > 0.3 ? Math.sign(mx) : 0,
      dy = Math.abs(my) > 0.3 ? Math.sign(my) : 0;
    b.x = clamp(b.x + dx, 1, G.map.w - 2);
    b.y = clamp(b.y + dy, 1, G.map.h - 2);
    b.t = b.held ? 0.09 : 0.25;
    b.held = 1;
  };
}
{
  const _uc = updateCam;
  updateCam = function (dt) {
    const b = G.bm;
    if (!b || !G.map) return _uc(dt);
    const m = G.map,
      mw = m.w * 16,
      mh = m.h * 16;
    let cx = b.x * 16 + 8 - W / 2,
      cy = b.y * 16 + 8 - H / 2;
    const k = dt ? Math.min(1, dt * 10) : 1;
    cx = mw <= W ? (mw - W) / 2 : clamp(cx, 0, mw - W);
    cy = mh <= H ? (mh - H) / 2 : clamp(cy, 0, mh - H);
    G.cam.x += (cx - G.cam.x) * k;
    G.cam.y += (cy - G.cam.y) * k;
  };
}
{
  const _da = doAction;
  doAction = function () {
    if (G.bm) return bmAction();
    return _da();
  };
}
{
  const cvs = cv;
  const tile = e => {
    const r = cvs.getBoundingClientRect();
    return [
      Math.floor((((e.clientX - r.left) / r.width) * W + G.cam.x) / 16),
      Math.floor((((e.clientY - r.top) / r.height) * H + G.cam.y) / 16)
    ];
  };
  if (cvs) {
    cvs.addEventListener('pointermove', e => {
      if (!G.bm || e.pointerType !== 'mouse') return;
      const [x, y] = tile(e);
      G.bm.x = x;
      G.bm.y = y;
    });
    cvs.addEventListener('pointerdown', e => {
      if (!G.bm || UI.busy()) return;
      const [x, y] = tile(e),
        same = G.bm.x === x && G.bm.y === y;
      G.bm.x = x;
      G.bm.y = y;
      if (e.pointerType !== 'mouse' && same) bmAction();
    });
  }
}
addEventListener('keydown', e => {
  if (e.code !== 'KeyB' || e.repeat || (e.target && e.target.tagName === 'INPUT')) return;
  if (G.bm) bmClose();
  else bmOpen();
});
// tasto nella barra in alto (solo nella Valle)
{
  const tb = document.getElementById('topbtns');
  if (tb) {
    const bt = document.createElement('button');
    bt.id = 'bBuild';
    bt.className = 'btn ib hide';
    bt.title = 'Costruisci (B)';
    bt.textContent = '🔨';
    tb.insertBefore(bt, tb.firstChild);
    bt.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (G.bm) bmClose();
      else bmOpen();
    });
  }
}
{
  const _h = UI.hud.bind(UI);
  UI.hud = function () {
    _h();
    const b = $('#bBuild');
    if (b) b.classList.toggle('hide', !(G.st && isFree(G.st) && !G.visit));
  };
}
// anteprima: griglia delle tue terre, il fantasma verde o rosso
function drawBM() {
  const b = G.bm;
  if (!b || !G.map) return;
  const st = G.st,
    m = G.map,
    cx = G.cam.x,
    cy = G.cam.y;
  ctx.save();
  // le tue terre a puntini
  ctx.fillStyle = 'rgba(246,217,138,.35)';
  const x0 = Math.max(0, Math.floor(cx / 16)),
    y0 = Math.max(0, Math.floor(cy / 16)),
    x1 = Math.min(m.w - 1, x0 + Math.ceil(W / 16) + 1),
    y1 = Math.min(m.h - 1, y0 + Math.ceil(H / 16) + 1);
  if (m.id === 'main')
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        if (ownedAt(x, y)) ctx.fillRect(Math.round(x * 16 - cx) + 7, Math.round(y * 16 - cy) + 7, 2, 2);
  const it = selItem(),
    id = b.carry ? b.carry.data.id : b.mode === 'piazza' && it && canHere(it.id) ? it.id : null;
  if (id) {
    const ok = !bmCanPlace(id, b.x, b.y),
      sz = ITEMS[id].size,
      T = sz ? bldFoot(id, b.x, b.y).T : [[b.x, b.y]];
    ctx.fillStyle = ok ? 'rgba(110,220,110,.32)' : 'rgba(230,80,60,.38)';
    for (const [x, y] of T) ctx.fillRect(Math.round(x * 16 - cx), Math.round(y * 16 - cy), 16, 16);
    const img = sz
      ? AIMG[id]
      : id === 'lastre'
        ? null
        : placeImg(id, b.carry ? b.carry.data : { id, d: st.day });
    if (img) {
      ctx.globalAlpha = 0.6;
      const w = iw(img),
        h = ih(img),
        wt = sz ? sz[0] : 1,
        dx = sz ? bldFoot(id, b.x, b.y).x0 : b.x;
      ctx.drawImage(
        img,
        Math.round(dx * 16 + (wt * 16 - w) / 2 - cx),
        Math.round((b.y + 1) * 16 - h - cy),
        w,
        h
      );
      ctx.globalAlpha = 1;
    }
  } else {
    const o = bmTarget(b.x, b.y);
    if (o) {
      ctx.strokeStyle = b.mode === 'togli' ? '#ff8a6a' : '#f6d98a';
      ctx.lineWidth = 1;
      for (const [x, y] of o.hits || o.solid)
        ctx.strokeRect(Math.round(x * 16 - cx) + 0.5, Math.round(y * 16 - cy) + 0.5, 15, 15);
    }
  }
  // il cursore
  const X = Math.round(b.x * 16 - cx),
    Y = Math.round(b.y * 16 - cy),
    a = 0.6 + 0.4 * Math.sin(G.t * 6);
  ctx.strokeStyle = `rgba(255,240,190,${a.toFixed(2)})`;
  ctx.lineWidth = 1;
  for (const [ax, ay, sx, sy] of [
    [0, 0, 1, 1],
    [16, 0, -1, 1],
    [0, 16, 1, -1],
    [16, 16, -1, -1]
  ]) {
    ctx.beginPath();
    ctx.moveTo(X + ax + 0.5 * sx, Y + ay + 5 * sy);
    ctx.lineTo(X + ax + 0.5 * sx, Y + ay + 0.5 * sy);
    ctx.lineTo(X + ax + 5 * sx, Y + ay + 0.5 * sy);
    ctx.stroke();
  }
  ctx.restore();
}
{
  const _dg = drawGuide;
  drawGuide = function () {
    if (G.bm) {
      drawBM();
      return;
    }
    _dg();
  };
}
{
  const _sel = UI.selectSlot.bind(UI);
  UI.selectSlot = function (n) {
    _sel(n);
    if (G.bm) {
      const it = selItem();
      if (!G.bm.carry && it && canHere(it.id)) G.bm.mode = 'piazza';
      bmBar();
    }
  };
}
SFX.no =
  SFX.no ||
  ((a, t) => {
    a.osc('square', 160, t, 0.08, 0.06);
  });

// ================= EDIFICI CHE FANNO QUALCOSA (con tre livelli) =================
Object.assign(ITEMS, {
  serra: {
    n: 'Serra',
    t: 'place',
    size: [4, 3],
    d: "Le zolle intorno alla serra non sentono le stagioni: si semina tutto, tutto l'anno, e niente appassisce al cambio."
  },
  mulino: {
    n: 'Mulino',
    t: 'place',
    size: [3, 3],
    d: 'Macina mais, patate e castagne in farina. Con la farina, ricette nuove.'
  },
  silos: {
    n: 'Silos',
    t: 'place',
    size: [2, 3],
    d: "Tiene il fieno e, d'inverno, riempie da solo le mangiatoie di pollai e stalle."
  },
  pozzogrande: {
    n: "Pozzo d'irrigazione",
    t: 'place',
    size: [2, 2],
    d: 'Ogni mattina bagna tutte le zolle intorno.'
  },
  farina: { n: 'Farina', t: 'res', v: 12, d: 'Dal mulino. Pane, pizza, gnocchi, torte.' }
});
Object.assign(PLACE_TOOL, { serra: 'piccone', mulino: 'accetta', silos: 'accetta', pozzogrande: 'piccone' });
CRAFTS.push(
  { id: 'serra', q: 1, c: { legna: 80, pietra: 40, lingotto: 6, fibra: 20 }, cat: 'edi' },
  { id: 'mulino', q: 1, c: { legna: 120, pietra: 80, lingotto: 2 }, cat: 'edi' },
  { id: 'silos', q: 1, c: { legna: 100, pietra: 30, lingotto: 2 }, cat: 'edi' },
  { id: 'pozzogrande', q: 1, c: { pietra: 90, lingotto: 3 }, cat: 'edi' }
);
Object.assign(BIG_BUILT, { serra: 40, mulino: 35, silos: 25, pozzogrande: 22 });
const FUNC = {
  serra: { lv: ['raggio 2 intorno', 'raggio 3', 'raggio 4'], r: lv => 1 + lv },
  mulino: {
    lv: ['una macinata ogni ora', 'una ogni mezz’ora', 'una ogni quarto d’ora'],
    cap: lv => [10, 25, 60][lv - 1]
  },
  silos: { lv: ['60 fieno', '150 fieno', '400 fieno'], cap: lv => [60, 150, 400][lv - 1] },
  pozzogrande: { lv: ['raggio 3', 'raggio 4', 'raggio 6'], r: lv => [3, 4, 6][lv - 1] }
};
const FUNC_UP = {
  2: { money: 1500, c: { legna: 80, pietra: 60, lingotto: 4 } },
  3: { money: 4000, c: { lingotto: 10, rame: 4, oro: 1 } }
};
const fLv = b => b.lv || 1;
// l'area di un edificio: la sua impronta allargata di r
function funcArea(k, b) {
  const [w, h] = ITEMS[b.id].size,
    [ax, ay] = k.split(',').map(Number),
    x0 = ax - Math.floor(w / 2),
    y0 = ay - h + 1,
    r = FUNC[b.id].r(fLv(b));
  return [x0 - r, y0 - r, x0 + w - 1 + r, ay + r];
}
function inSerra(x, y, st) {
  st = st || G.st;
  if (!st || !isFree(st)) return false;
  for (const k in st.free.built) {
    const b = st.free.built[k];
    if (b.id !== 'serra') continue;
    const [a, c, d, e] = funcArea(k, b);
    if (x >= a && x <= d && y >= c && y <= e) return true;
  }
  return false;
}
const MILL = { mais: [1, 2], patata: [2, 1], castagne: [1, 1] }; // [quanti ne servono, quanta farina danno]
// il mulino è una macchina come la fornace (macchine.js): macina una porzione alla volta, più svelto ai livelli alti
MACH.mulino = {
  ok: id => !!MILL[id],
  need: id => MILL[id][0],
  n: id => MILL[id][1],
  out: () => 'farina',
  vuole: 'mais',
  aiuto: 'Il mulino macina grano, mais, orzo, patate e castagne.',
  preso() {
    const st = G.st;
    if (!knows(st, 'panecasa')) {
      st.free.recipes = st.free.recipes || {};
      st.free.recipes.panecasa = 1;
      UI.toast('Hai imparato: Pane fatto in casa.');
    }
  }
};
MAC_MIN.mulino = b => [60, 30, 15][(b.lv || 1) - 1];
function funcMenu(k) {
  const st = G.st,
    b = st.free.built[k];
  if (!b) return;
  const F = FUNC[b.id],
    lv = fLv(b),
    up = FUNC_UP[lv + 1];
  const canUp = up && st.money >= up.money && Object.entries(up.c).every(([i, n]) => countItem(i) >= n);
  let body = '';
  if (b.id === 'mulino')
    body = `<p class="small">Adesso: ${F.lv[lv - 1]}.</p><p><button class="btn" data-mac="1">← Torna alla macina</button></p>`;
  if (b.id === 'silos') {
    const cap = F.cap(lv),
      h = countItem('fieno');
    body = `<p>Nel silos: <b>${b.hay || 0}</b> / ${cap} fieno.</p><p class="small">D'inverno, ogni mattina, riempie le mangiatoie di tutti i pollai e le stalle.</p>${h ? `<p><button class="btn" data-silo="1">Metti il fieno (${Math.min(h, cap - (b.hay || 0))})</button></p>` : ''}`;
  }
  if (b.id === 'serra')
    body = `<p class="small">Area protetta: ${F.lv[lv - 1]}. Lì si semina fuori stagione e al cambio di stagione non appassisce niente.</p>`;
  if (b.id === 'pozzogrande')
    body = `<p class="small">Ogni mattina bagna tutte le zolle nel ${F.lv[lv - 1]}.</p>`;
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${ITEMS[b.id].n} <span class="small">· livello ${lv}/3</span></h2>` +
      body +
      `<h3>Migliorare</h3>` +
      (up
        ? `<p class="small">Livello ${lv + 1}: ${F.lv[lv]}. Servono ${CZ(up.money)}, ${Object.entries(up.c)
            .map(([i, n]) => `${n} ${ITEMS[i].n.toLowerCase()} (${countItem(i)})`)
            .join(
              ', '
            )}.</p><p><button class="btn" data-up="1" ${canUp ? '' : 'disabled'}>Migliora</button></p>`
        : '<p class="small">Al massimo.</p>')
  );
  const box = $('#mbox');
  box.querySelectorAll('canvas[data-i]').forEach(c => {
    const ic = ICON[c.dataset.i];
    if (ic) c.getContext('2d').drawImage(ic, 0, 0);
  });
  const again = () => {
    UI._mclose = null;
    funcMenu(k);
  };
  {
    const t = box.querySelector('[data-mac]');
    if (t)
      t.onclick = () => {
        UI._mclose = null;
        macGui(k, b);
      };
  }
  box.querySelectorAll('[data-mill]').forEach(
    x =>
      (x.onclick = () => {
        const v = x.dataset.mill;
        if (v === 'take') {
          if (!addItem('farina', b.job.n)) return;
          AU.play('pick');
          UI.toast(`+${b.job.n} farina.`);
          b.job = null;
          addXP('arti', 4);
          if (!knows(st, 'panecasa')) {
            st.free.recipes = st.free.recipes || {};
            st.free.recipes.panecasa = 1;
            UI.toast('Hai imparato: Pane fatto in casa.');
          }
          return again();
        }
        const [need, out] = MILL[v],
          q = Math.min(F.cap(lv), Math.floor(countItem(v) / need));
        if (!q) return;
        removeItem(v, q * need);
        b.job = { n: q * out, ready: st.day + 1, t: st.time };
        AU.play('ok');
        again();
      })
  );
  {
    const s = box.querySelector('[data-silo]');
    if (s)
      s.onclick = () => {
        const n = Math.min(countItem('fieno'), F.cap(lv) - (b.hay || 0));
        removeItem('fieno', n);
        b.hay = (b.hay || 0) + n;
        AU.play('pick');
        again();
      };
  }
  {
    const u = box.querySelector('[data-up]');
    if (u)
      u.onclick = () => {
        if (!canUp) return;
        st.money -= up.money;
        for (const [i, n] of Object.entries(up.c)) removeItem(i, n);
        b.lv = lv + 1;
        AU.play('ok');
        G.shake = 1;
        UI.hud();
        UI.toast(`${ITEMS[b.id].n}: livello ${b.lv}!`);
        addXP('arti', 20);
        NET.save(st);
        again();
      };
  }
}
{
  Ext.on('freeAct:intercetta', function (fx, fy) {
    const st = G.st;
    if (isFree(st) && !G.visit && G.map.id === 'main') {
      const o = G.map.objAt(fx, fy),
        it = selItem();
      if (
        o &&
        o.kind === 'built' &&
        FUNC[o.bid] &&
        st.free.built[o.bk] &&
        !(it && it.id === PLACE_TOOL[o.bid])
      ) {
        if (MACH[o.bid]) macGui(o.bk, st.free.built[o.bk]);
        else funcMenu(o.bk);
        return true;
      }
    }
  });
}
// al mattino: il silos riempie le mangiatoie, il pozzo bagna, il mulino finisce
{
  // d'inverno il silos riempie le mangiatoie di tutte le case degli animali (prima della mattina)
  Ext.on('freeMorning:prima', function (st) {
    if (!isFree(st)) return;
    const W2 = st.free,
      homes = new Set(Object.values(ANIMALS).map(A => A.home));
    if (seasonOf(st) === 1)
      for (const k in W2.built) {
        const s = W2.built[k];
        if (s.id !== 'silos' || !s.hay) continue;
        for (const k2 in W2.built) {
          const b = W2.built[k2];
          if (!homes.has(b.id)) continue;
          const need = Math.max(0, animalsOf(k2).length * 2 - (b.hay || 0)),
            n = Math.min(need, s.hay);
          b.hay = (b.hay || 0) + n;
          s.hay -= n;
        }
      }
  });
  // il pozzo grande bagna i campi intorno (dopo la mattina)
  Ext.on('freeMorning', function (st) {
    if (!isFree(st)) return;
    const W2 = st.free;
    for (const k in W2.built) {
      const b = W2.built[k];
      if (b.id !== 'pozzogrande') continue;
      const [a, c, d, e] = funcArea(k, b);
      for (let y = c; y <= e; y++)
        for (let x = a; x <= d; x++) {
          const f = st.farm[fkey(x, y)];
          if (f) f.w = true;
        }
    }
  });
}
// la serra e il pozzo: l'area si vede quando le guardi in modalità costruzione
{
  const _db = drawBM;
  drawBM = function () {
    _db();
    const b = G.bm;
    if (!b) return;
    const o = bmTarget(b.x, b.y),
      st = G.st;
    if (!o || !FUNC[o.bid] || !FUNC[o.bid].r) return;
    const [a, c, d, e] = funcArea(o.bk, st.free.built[o.bk]);
    ctx.save();
    ctx.fillStyle = o.bid === 'serra' ? 'rgba(140,230,140,.16)' : 'rgba(120,180,255,.18)';
    ctx.fillRect(
      Math.round(a * 16 - G.cam.x),
      Math.round(c * 16 - G.cam.y),
      (d - a + 1) * 16,
      (e - c + 1) * 16
    );
    ctx.restore();
  };
}
// ricette con la farina
Object.assign(ITEMS, {
  panecasa: {
    n: 'Pane fatto in casa',
    t: 'food',
    e: 45,
    v: 60,
    d: 'Croccante fuori, morbido dentro. +45 energia.'
  },
  pizza: {
    n: 'Pizza della Valle',
    t: 'food',
    e: 80,
    v: 140,
    d: 'Pomodoro e farina del tuo mulino. +80 energia.'
  },
  gnocchi: { n: 'Gnocchi', t: 'food', e: 65, v: 110, d: 'Patate e farina, a mano. +65 energia.' },
  tortamele: {
    n: 'Torta di mele',
    t: 'food',
    e: 70,
    v: 160,
    d: "Calda, con la cannella che non c'è. +70 energia."
  }
});
COOK.push(
  { id: 'panecasa', need: { farina: 2 }, min: 40 },
  { id: 'pizza', need: { farina: 2, pomodoro: 1 }, min: 60, da: 'bruno' },
  { id: 'gnocchi', need: { farina: 1, patata: 2 }, min: 50, da: 'bruno' },
  { id: 'tortamele', need: { farina: 1, mela: 2 }, min: 70, da: 'bruno' }
);
// grafica
function genCostrArt() {
  const dk = rp('#5a3a1e'),
    stone = rp('#8a877d'),
    roof = rp('#6a3a2a'),
    glass = rp('#b8e0e8');
  // serra, mulino, silos e pozzo: i disegni sono in grafica.js (ART2)
  AIMG.serra = ART2.serra();
  AIMG.mulino = ART2.mulino();
  AIMG.silos = ART2.silos();
  AIMG.pozzogrande = ART2.pozzogrande();
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  I('serra', P => {
    P.rect(4, 14, 24, 14, rp('#d8e8e0'), { spec: 0.7 });
    P.body(
      4,
      15,
      () => 16,
      Y => 4 + Y * 0.9,
      glass,
      { spec: 1 }
    );
    P.ellipse(11, 24, 3, 3, rp('#5a9a2a'));
    P.ellipse(21, 24, 3, 3, rp('#5a9a2a'));
  });
  I('mulino', P => {
    P.body(
      12,
      30,
      () => 16,
      Y => 6 + (Y - 12) * 0.1,
      stone
    );
    P.body(
      5,
      13,
      () => 16,
      Y => 2 + (Y - 5) * 0.6,
      roof
    );
    for (const a of [0, 1, 2, 3]) {
      const t = (a * Math.PI) / 2 + 0.4;
      P.capsule(16, 10, 16 + Math.cos(t) * 11, 10 + Math.sin(t) * 11, 1.2, rp('#e8e0d0'));
    }
  });
  I('silos', P => {
    P.body(
      8,
      30,
      () => 16,
      () => 8,
      rp('#b8483a'),
      { spec: 0.3 }
    );
    P.body(
      2,
      9,
      () => 16,
      Y => 2 + Y * 0.9,
      rp('#9a9aa2'),
      { spec: 0.8 }
    );
  });
  I('pozzogrande', P => {
    P.ellipse(16, 22, 12, 6, stone);
    P.ellipse(16, 21, 9, 4, rp('#3a6a9a'), { spec: 0.9 });
    P.capsule(5, 22, 5, 6, 1.4, dk);
    P.capsule(27, 22, 27, 6, 1.4, dk);
    P.body(
      1,
      8,
      () => 16,
      Y => 4 + Y * 1.6,
      roof
    );
  });
  I('farina', P => {
    P.body(
      8,
      28,
      () => 16,
      Y => 7 + Math.sin(((Y - 8) / 20) * Math.PI) * 3,
      rp('#e8e0d0'),
      { spec: 0.3 }
    );
    P.rect(11, 6, 10, 3, rp('#c8a03a'));
  });
  I('panecasa', P => {
    P.ellipse(16, 18, 12, 8, rp('#c8803a'), { spec: 0.6 });
    for (const x of [10, 16, 22]) P.line(x - 2, 14, x + 2, 20, C('#e8c080'));
  });
  I('pizza', P => {
    P.ellipse(16, 17, 13, 10, rp('#e8c070'));
    P.ellipse(16, 17, 10, 7.5, rp('#c8402a'), { spec: 0.5 });
    for (const [a, b] of [
      [12, 14],
      [20, 16],
      [15, 21]
    ])
      P.ellipse(a, b, 2, 2, rp('#f0e8d0'));
  });
  I('gnocchi', P => {
    P.ellipse(16, 20, 13, 7, rp('#e8e0d0'), { spec: 0.3 });
    for (const [a, b] of [
      [10, 18],
      [16, 16],
      [22, 18],
      [13, 22],
      [19, 22]
    ])
      P.ellipse(a, b, 3, 2.2, rp('#f0d890'), { spec: 0.5 });
  });
  I('tortamele', P => {
    P.ellipse(16, 19, 13, 8, rp('#c8803a'), { spec: 0.5 });
    P.ellipse(16, 17, 10, 5, rp('#e8b860'));
    for (let i = 0; i < 4; i++) P.line(8 + i * 5, 14, 10 + i * 5, 21, C('#a85a2a'));
  });
}
{
  Ext.on('applyFree:prima', function (m, st) {
    if (!AIMG.serra && PX.prototype.line) genCostrArt();
  });
}
{
}

// ================= LA CASA CRESCE ANCORA =================
Object.assign(HOUSE_LV, { 4: { w: 24, h: 12 }, 5: { w: 24, h: 16 } });
Object.assign(HOUSE_UP, {
  4: {
    n: "L'ala nuova",
    cost: 9000,
    c: { legna: 300, pietra: 250, lingotto: 10 },
    d: "Brom allunga la casa verso il frutteto: un'ala intera, con le finestre a sud."
  },
  5: {
    n: 'Il salone',
    cost: 16000,
    c: { legna: 400, pietra: 300, lingotto: 20, oro: 2, diamante: 1 },
    d: "Il salone delle feste, con il soffitto alto e il camino grande. In tutta la Valle non ce n'è uno così."
  }
});

// ================= I TEMI DEL VILLAGGIO =================
// un tema ricolora tutte le tue costruzioni all'aperto (non la casa del nonno, che ha i suoi colori)
LOOKOPT.tema = {
  n: 'Tema delle costruzioni',
  p: 1200,
  o: {
    rustico: ['Rustico (originale)', null],
    gotico: ['Gotico', '#4a3a5a'],
    fiorito: ['Fiorito', '#d878a0'],
    invernale: ['Invernale', 'rgba(236,244,255,.82)'],
    bosco: ['Bosco', '#3e6a3a']
  }
};
{
  const _al = applyLook;
  applyLook = function (m, st) {
    _al(m, st);
    if (!isFree(st) || m.id !== 'main') return;
    const L = myLook(st),
      t = L.tema && LOOKOPT.tema.o[L.tema];
    if (!t || !t[1]) return;
    const frac = L.tema === 'invernale' ? 0.35 : 1,
      mode = L.tema === 'invernale' ? 'source-atop' : 'color';
    for (const o of m.objs)
      if (o.kind === 'built' && o.img && !(ITEMS[o.bid] && ITEMS[o.bid].tree))
        o.img = tintTop(o.img, t[1], frac, mode);
  };
}
GUIDES.push({
  id: 'costruire',
  v: 3,
  n: 'Costruire sul serio',
  steps: [
    {
      t: 'Novità: la <b>modalità costruzione</b>. Premi <b>B</b> o il martello 🔨 in alto: ti fermi, e un cursore si muove sulla griglia con le frecce, il joystick o il mouse.'
    },
    {
      t: '<b>Piazza</b> quello che hai in mano (verde = si può, rosso = no). <b>Sposta</b> qualsiasi costruzione: le bestie, le casse e gli abitanti vengono con lei. <b>Togli</b> e torna nello zaino.'
    },
    {
      t: "Al banco da lavoro, in Edifici: <b>serra</b> (si semina tutto l'anno), <b>mulino</b> (farina e ricette nuove), <b>silos</b> (sfama le bestie d'inverno), <b>pozzo d'irrigazione</b>. Ognuno sale fino al livello 3."
    },
    {
      t: 'Brom ora allarga la casa fino al <b>salone</b>, e Agatha ha i <b>temi</b> per ricolorare tutte le tue costruzioni: gotico, fiorito, invernale, bosco.'
    }
  ]
});

// ================= DOVE NON SI COSTRUISCE MAI =================
// La piazza, il cimitero, le case degli abitanti (con un margine e l'ingresso) e le strade del paese
// non sono di nessuno: anche dentro una terra comprata, lì non si zappa, non si costruisce, non si fanno vialetti.
const PROTECT = [
  [37, 13, 52, 24],
  [47, 3, 60, 12],
  [10, 19, 51, 20],
  [61, 17, 72, 18],
  [72, 6, 72, 18],
  [72, 8, 86, 8],
  [61, 31, 66, 31],
  [86, 4, 91, 7]
];
function isProtected(x, y) {
  if (PROTECT.some(r => inRect(x, y, r))) return true;
  for (const k in BLD) {
    if (k === 'house') continue;
    const b = BLD[k],
      [dx, dy] = bdoor(k);
    if (x >= b.x - 1 && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h) return true;
    if (x >= dx - 1 && x <= dx + 1 && y >= dy && y <= dy + 2) return true;
  }
  return false;
}
{
  const _own = ownedAt;
  ownedAt = function (x, y, st) {
    const id = _own(x, y, st);
    if (!id) return null;
    if (id !== 'casa' && isProtected(x, y)) return null;
    return id;
  };
}

// in casa: piazza, sposta e togli i mobili (la cucina, la libreria, i quadri…)
function bmActionHouse() {
  const b = G.bm,
    st = G.st,
    W2 = st.free,
    x = b.x,
    y = b.y,
    k = fkey(x, y);
  W2.inside = W2.inside || {};
  if (b.carry) {
    const d = b.carry.data,
      why = bmCanPlace(d.id, x, y);
    if (why) {
      UI.toast(why);
      AU.play('no');
      return;
    }
    bmPut(k, d);
    b.carry = null;
    UI.toast('Spostato: ' + ITEMS[d.id].n + '.');
    bmBar();
    return;
  }
  if (b.mode === 'piazza') {
    const it = selItem();
    if (!it || !canHere(it.id)) {
      UI.toast('Seleziona nella barra un mobile o un quadro.');
      return;
    }
    const why = bmCanPlace(it.id, x, y);
    if (why) {
      UI.toast(why);
      AU.play('no');
      return;
    }
    const id = it.id;
    removeItem(id, 1);
    bmPut(k, { id });
    st.flags.decor = (st.flags.decor || 0) + 1;
    UI.hotbar();
    bmBar();
    return;
  }
  const o = bmTarget(x, y);
  if (!o) {
    UI.toast(
      b.mode === 'sposta' ? "Qui non c'è un mobile da spostare." : "Qui non c'è un mobile da togliere."
    );
    return;
  }
  const d = W2.inside[o.fk];
  if (b.mode === 'togli') {
    if (!addItem(d.id, 1)) return;
    delete W2.inside[o.fk];
    houseRebuild();
    AU.play('pick');
    UI.toast(ITEMS[d.id].n + ' nello zaino.');
    UI.hotbar();
    return;
  }
  b.carry = { from: o.fk, data: d };
  delete W2.inside[o.fk];
  houseRebuild();
  AU.play('pick');
  bmBar();
}

// ================= MAI PIÙ INCASTRATI =================
// se per qualunque motivo il personaggio si ritrova dentro qualcosa di solido (un mobile appena messo, una
// costruzione, un salvataggio strano), dopo un attimo viene spostato nella casella libera più vicina
{
  const _up = updatePlayer;
  updatePlayer = function (dt) {
    _up(dt);
    const p = G.player,
      m = G.map;
    if (!m || G.mode !== 'game' || G.cut || p.auto || G.erede) return;
    if (!boxHit(m, p.x, p.y)) {
      p.stuckT = 0;
      return;
    }
    p.stuckT = (p.stuckT || 0) + dt;
    if (p.stuckT < 0.15) return;
    p.stuckT = 0;
    const [x, y] = ptile(p);
    let best = null,
      bd = 1e9;
    for (let r = 0; r < 6 && !best; r++)
      for (let j = -r; j <= r; j++)
        for (let i = -r; i <= r; i++) {
          if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
          const a = x + i,
            c = y + j;
          if (!m.inb(a, c) || m.solid(a, c)) continue;
          const d = Math.hypot(a * 16 + 8 - p.x, c * 16 + 14 - p.y);
          if (d < bd) {
            bd = d;
            best = [a, c];
          }
        }
    if (best) setPos(p, best[0], best[1], p.dir);
  };
}
GUIDES.push({
  id: 'casa_arredo',
  v: 7,
  n: 'Arredare la casa come vuoi',
  steps: [
    {
      t: "Adesso la modalità costruzione funziona anche in casa: premi B o il martello 🔨 e sposta mobili, cucina, libreria e quadri dove vuoi, con l'anteprima verde o rossa."
    },
    {
      t: '«Sposta» solleva un mobile e lo rimette dove scegli; «Togli» lo rimette nello zaino. Se mai restassi incastrat{o|a} dentro un mobile, il gioco ti libera da solo.'
    }
  ]
});
