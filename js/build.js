'use strict';
// ================= COSTRUIRE NELLA VALLE: terre, pala e vialetti, casa più grande, arredo =================

// ---------- le terre ----------
// la fattoria del nonno è tua; il resto si compra dall'Anziano Ezekiel
const PLOTS = {
  casa: {
    n: 'La fattoria del nonno',
    r: [
      [4, 4, 24, 12],
      [4, 13, 21, 33]
    ],
    p: 0
  },
  mulino: {
    n: 'Il prato del mulino',
    r: [[22, 13, 31, 33]],
    p: 900,
    d: "La striscia d'erba tra i campi e la piazza. Alberi da legna, sole buono."
  },
  sud: {
    n: 'Il prato sud',
    r: [[4, 34, 41, 41]],
    p: 1400,
    d: 'Il prato lungo il fiume, fino al ponte. Tanto spazio, e la nebbia la mattina.'
  },
  riva: {
    n: 'La riva est',
    r: [[47, 32, 60, 41]],
    p: 1800,
    d: "Dietro la casa dell'Anziano, verso il fiume. Lontana dagli occhi."
  }
};
const myLand = st => ((st = st || G.st), (st.free && st.free.land) || ['casa']);
function ownedAt(x, y, st) {
  for (const id of myLand(st)) {
    const P = PLOTS[id];
    if (P && P.r.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d)) return id;
  }
  return null;
}
// bordo delle terre: picchetti agli angoli, e un contorno quando hai in mano un attrezzo da lavoro
function drawLand(m) {
  if (m.id !== 'main' || !isFree() || G.visit) return;
  const it = selItem(),
    id = it && it.id,
    show =
      (id && (id === 'hoe' || id === 'pala' || (ITEMS[id] && ITEMS[id].t === 'place'))) ||
      (G.landFlash && G.t - G.landFlash.t < 4);
  if (!show) return;
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  for (const lid of myLand()) {
    const P = PLOTS[lid];
    if (!P) continue;
    const fl = G.landFlash && G.landFlash.id === lid && G.t - G.landFlash.t < 4;
    ctx.strokeStyle = fl
      ? `rgba(255,226,122,${(0.5 + 0.5 * Math.sin(G.t * 8)).toFixed(2)})`
      : 'rgba(246,217,138,.45)';
    for (const [a, b, c, d] of P.r)
      ctx.strokeRect(a * 16 + 0.5, b * 16 + 0.5, (c - a + 1) * 16 - 1, (d - b + 1) * 16 - 1);
  }
  ctx.restore();
}

// ---------- la pala: vialetti e terra che torna prato ----------
Object.assign(ITEMS, {
  pala: {
    n: 'Pala',
    t: 'tool',
    d: "Fa i vialetti nell'erba e rimette a prato la terra zappata. Solo sulle tue terre."
  }
});
function setGround(m, x, y, v) {
  m.set(x, y, v);
  buildGround(m);
  seasonGround(m);
}
function shovelAct(fx, fy) {
  const st = G.st,
    m = G.map,
    k = fkey(fx, fy),
    f = st.farm[k],
    W2 = st.free;
  if (!ownedAt(fx, fy)) {
    const o = m.objAt(fx, fy);
    if (o && o.act) return false;
    UI.toast("Questa terra non è tua. Le terre le vende l'Anziano Ezekiel.");
    return true;
  }
  if (f) {
    if (f.c && !f.c.dead && !cropGone(f)) {
      UI.toast("C'è una pianta che cresce. Prima raccoglila, o toglila se è appassita.");
      return true;
    }
    if (!useEnergy(1)) return true;
    delete st.farm[k];
    AU.play('hoe');
    burst('dust', fx * 16 + 8, fy * 16 + 10, 8, '#5a8a2a');
    UI.toast('La terra torna prato.');
    return true;
  }
  if (m.objAt(fx, fy)) {
    UI.toast("C'è qualcosa in mezzo.");
    return true;
  }
  const g = m.get(fx, fy);
  W2.tiles = W2.tiles || {};
  if (W2.tiles[k] === 11) {
    if (!useEnergy(1)) return true;
    delete W2.tiles[k];
    setGround(m, fx, fy, 1);
    addItem('lastre', 1);
    allImpatto(() => GESTO.pietra(fx * 16 + 8, fy * 16 + 12));
    return true;
  }
  if (W2.tiles[k] === 2) {
    if (!useEnergy(1)) return true;
    delete W2.tiles[k];
    setGround(m, fx, fy, 1);
    AU.play('hoe');
    burst('dust', fx * 16 + 8, fy * 16 + 10, 8, '#5a8a2a');
    return true;
  }
  if (g === 1 || g === 12) {
    if (!useEnergy(1)) return true;
    W2.tiles[k] = 2;
    setGround(m, fx, fy, 2);
    AU.play('hoe');
    burst('dust', fx * 16 + 8, fy * 16 + 10, 8, '#8a6a3a');
    st.flags.paths = (st.flags.paths || 0) + 1;
    tip('tutPath', 'Vialetto! Con la pala sullo stesso punto lo togli.');
    return true;
  }
  UI.toast('Qui la pala non serve.');
  return true;
}
function shovelAimOk(tx, ty) {
  const st = G.st,
    m = G.map,
    f = st.farm[fkey(tx, ty)];
  if (!ownedAt(tx, ty)) return false;
  if (f) return !f.c || f.c.dead || cropGone(f);
  if (m.objAt(tx, ty)) return false;
  const g = m.get(tx, ty),
    tl = (st.free.tiles || {})[fkey(tx, ty)];
  return g === 1 || g === 12 || tl === 2 || tl === 11;
}
function applyTiles(m, st) {
  if (m.id !== 'main' || !isFree(st)) return;
  for (const k in st.free.tiles || {}) {
    const [x, y] = k.split(',').map(Number);
    m.set(x, y, st.free.tiles[k]);
  }
}

// ---------- la casa: ampliamenti e arredo ----------
const HOUSE_LV = { 1: { w: 12, h: 9 }, 2: { w: 18, h: 9 }, 3: { w: 18, h: 12 } };
const HOUSE_UP = {
  2: {
    n: 'Una stanza in più',
    cost: 2500,
    c: { legna: 120, pietra: 60 },
    d: 'Brom abbatte la parete a est: una stanza nuova, grande quanto la cucina.'
  },
  3: {
    n: 'Il piano di sotto',
    cost: 5000,
    c: { legna: 200, pietra: 150 },
    d: 'Una stanza lunga in fondo, con le travi a vista. Brom dice che il nonno la voleva da sempre.'
  }
};
const houseLv = st => ((st || G.st).free && (st || G.st).free.house) || 1;
const houseSize = st => HOUSE_LV[houseLv(st)] || HOUSE_LV[1];
Object.assign(ITEMS, {
  cucina: {
    n: 'Cucina economica',
    t: 'arredo',
    d: 'Una vera cucina, con il forno. Servono per le ricette più elaborate.'
  },
  tavolino: { n: 'Tavolino', t: 'arredo', d: 'Rotondo, di noce.' },
  sedia: { n: 'Sedia', t: 'arredo', d: 'Impagliata a mano.' },
  tappeto: { n: 'Tappeto', t: 'arredo', d: 'Rosso. Nessuno, adesso, lo seppellisce.', flat: 1 },
  pianta: { n: 'Pianta in vaso', t: 'arredo', d: "Un po' di verde in casa." },
  lampada: { n: 'Lampada', t: 'arredo', d: 'Luce calda, la sera.' },
  libreria: { n: 'Libreria', t: 'arredo', d: 'Per i libri del nonno, e i tuoi.' },
  quadro: {
    n: 'Quadro della Valle',
    t: 'arredo',
    d: 'La Valle dipinta a olio. Nel quadro, il recinto è già grigio.',
    wall: 1
  },
  credenza: { n: 'Credenza', t: 'arredo', d: 'Piatti, barattoli, ricordi.' }
});
CRAFTS.push(
  { id: 'tavolino', q: 1, c: { legna: 15 } },
  { id: 'sedia', q: 1, c: { legna: 8, fibra: 4 } },
  { id: 'libreria', q: 1, c: { legna: 30 } },
  { id: 'credenza', q: 1, c: { legna: 35, pietra: 5 } },
  { id: 'lampada', q: 1, c: { pietra: 6, fibra: 6 } },
  { id: 'cucina', q: 1, c: { pietra: 40, legna: 20 } }
);
const DECOR_SHOP = [
  ['tappeto', 220],
  ['pianta', 90],
  ['quadro', 350],
  ['pala', 150]
];
function genBuildArt() {
  const wood = rp('#8a5a30'),
    dk = rp('#5a3a1e'),
    I = (id, fn) => {
      const P = new PX(32, 32);
      fn(P);
      P.outline();
      ICON[id] = pxCanvas(P);
    };
  I('pala', P => {
    P.capsule(10, 4, 19, 20, 1.4, wood);
    P.body(
      19,
      30,
      Y => 20 + (Y - 19) * 0.35,
      Y => 5 - (Y - 19) * 0.25,
      rp('#9a9aa2'),
      { nyF: () => 0.2, spec: 0.8 }
    );
  });
  I('cucina', P => {
    P.rect(5, 8, 22, 20, rp('#3a3a42'), { spec: 0.5 });
    P.rect(7, 16, 18, 9, rp('#2a2a30'));
    P.rect(9, 18, 14, 5, rp('#d86a28'), { amb: 0.95, edge: false });
    P.rect(5, 6, 22, 3, rp('#6a6a72'), { spec: 0.7 });
  });
  I('tavolino', P => {
    P.ellipse(16, 13, 12, 4, wood, { spec: 0.4 });
    P.rect(14, 15, 4, 13, dk);
  });
  I('sedia', P => {
    P.rect(9, 4, 14, 12, wood, { mod: woodMod });
    P.rect(8, 16, 16, 4, wood);
    P.rect(9, 20, 2, 9, dk);
    P.rect(21, 20, 2, 9, dk);
  });
  I('tappeto', P => {
    P.rect(4, 9, 24, 14, rp('#a8301a'), { n: [0, -0.2, 1] });
    P.rect(7, 12, 18, 8, rp('#d8a84a'), { n: [0, -0.2, 1] });
  });
  I('pianta', P => {
    P.body(
      18,
      29,
      () => 16,
      Y => 6 - (Y - 18) * 0.15,
      rp('#b8703a'),
      { spec: 0.3 }
    );
    for (const [a, b] of [
      [10, 12],
      [16, 6],
      [22, 11],
      [13, 17],
      [20, 16]
    ])
      P.ellipse(a, b, 4, 3, rp('#5a9a2a'), { spec: 0.3 });
  });
  I('lampada', P => {
    P.rect(15, 12, 2, 15, rp('#6a6a72'));
    P.rect(10, 26, 12, 3, rp('#5a3a1e'));
    P.body(
      4,
      13,
      () => 16,
      Y => 4 + (Y - 4) * 0.6,
      rp('#f0d890'),
      { amb: 0.9, nyF: () => -0.2 }
    );
  });
  I('libreria', P => {
    P.rect(6, 3, 20, 26, wood, { mod: woodMod });
    for (const y of [8, 15, 22]) P.rect(8, y, 16, 1, dk);
    for (let i = 0; i < 6; i++)
      P.rect(9 + i * 2.5, 5 + (i % 3) * 7, 2, 3, rp(['#a8301a', '#3a5a8a', '#5a8a3a'][i % 3]));
  });
  I('quadro', P => {
    P.rect(5, 6, 22, 18, rp('#8a6a2a'), { spec: 0.6 });
    P.rect(8, 9, 16, 12, rp('#7aa8c8'), { n: [0, 0, 1] });
    P.rect(8, 16, 16, 5, rp('#5a8a3a'), { n: [0, 0, 1] });
  });
  I('credenza', P => {
    P.rect(4, 8, 24, 20, wood, { mod: woodMod, spec: 0.2 });
    P.rect(4, 8, 24, 3, dk);
    P.rect(15, 13, 2, 4, rp('#d8a84a'));
  });
  // l'icona del ricettario (si vede nel titolo del Ricettario)
  I('ricettario', P => {
    P.rect(7, 4, 18, 24, rp('#7a3a1a'), { spec: 0.3 });
    P.rect(9, 5, 2, 22, rp('#d8a84a'));
    P.ellipse(18, 14, 4, 4, rp('#f0e2c0'), { spec: 0.4 });
  });
  const S = (w, h, fn) => SP(w, h, fn);
  FREEIMG.cucina = S(18, 20, P => {
    P.rect(2, 10, 32, 28, rp('#3a3a42'), { spec: 0.5 });
    P.rect(6, 22, 24, 12, rp('#2a2a30'));
    P.rect(9, 25, 18, 6, rp('#d86a28'), { amb: 0.95, edge: false });
    P.rect(2, 8, 32, 4, rp('#6a6a72'), { spec: 0.7 });
    P.rect(26, 0, 5, 10, rp('#4a4a52'));
  });
  FREEIMG.tavolino = S(16, 14, P => {
    P.ellipse(16, 10, 14, 5, wood, { spec: 0.4 });
    P.rect(14, 14, 4, 12, dk);
  });
  FREEIMG.sedia = S(12, 16, P => {
    P.rect(4, 2, 16, 14, wood, { mod: woodMod });
    P.rect(3, 16, 18, 5, wood);
    P.rect(4, 21, 3, 9, dk);
    P.rect(17, 21, 3, 9, dk);
  });
  FREEIMG.tappeto = S(28, 14, P => {
    P.rect(2, 4, 52, 22, rp('#a8301a'), { n: [0, -0.6, 0.8] });
    P.rect(7, 8, 42, 14, rp('#d8a84a'), { n: [0, -0.6, 0.8] });
    P.rect(11, 11, 34, 8, rp('#a8301a'), { n: [0, -0.6, 0.8] });
  });
  FREEIMG.pianta = S(12, 18, P => {
    P.body(
      22,
      34,
      () => 12,
      Y => 6 - (Y - 22) * 0.15,
      rp('#b8703a'),
      { spec: 0.3 }
    );
    for (const [a, b] of [
      [6, 14],
      [12, 6],
      [18, 13],
      [8, 20],
      [16, 19]
    ])
      P.ellipse(a, b, 4.4, 3.4, rp('#5a9a2a'), { spec: 0.3 });
  });
  FREEIMG.lampada = S(10, 24, P => {
    P.rect(9, 14, 2, 28, rp('#6a6a72'));
    P.rect(4, 42, 12, 4, rp('#5a3a1e'));
    P.body(
      2,
      15,
      () => 10,
      Y => 4 + (Y - 2) * 0.5,
      rp('#f0d890'),
      { amb: 0.9, nyF: () => -0.2 }
    );
  });
  FREEIMG.libreria = S(16, 26, P => {
    P.rect(2, 2, 28, 48, wood, { mod: woodMod });
    for (const y of [14, 26, 38]) P.rect(4, y, 24, 2, dk);
    for (let i = 0; i < 9; i++)
      P.rect(5 + (i % 3) * 8, 4 + Math.floor(i / 3) * 12, 6, 9, rp(['#a8301a', '#3a5a8a', '#5a8a3a'][i % 3]));
  });
  FREEIMG.quadro = S(16, 12, P => {
    P.rect(2, 2, 28, 20, rp('#8a6a2a'), { spec: 0.6 });
    P.rect(5, 5, 22, 14, rp('#7aa8c8'), { n: [0, 0, 1] });
    P.rect(5, 13, 22, 6, rp('#5a8a3a'), { n: [0, 0, 1] });
  });
  FREEIMG.credenza = S(16, 18, P => {
    P.rect(2, 6, 28, 28, wood, { mod: woodMod, spec: 0.2 });
    P.rect(2, 6, 28, 4, dk);
    P.rect(15, 18, 2, 6, rp('#d8a84a'));
    P.rect(4, 0, 6, 6, rp('#e8dcc0'));
    P.rect(20, 1, 5, 5, rp('#a8301a'));
  });
}
// arredo in casa
function furnFree(m, x, y) {
  const g = m.get(x, y);
  return (
    g === 6 &&
    !m.objAt(x, y) &&
    !(m.doors || []).some(d => Math.abs(d.tx - x) <= 0 && Math.abs(d.ty - y) <= 1)
  );
}
function houseAct(fx, fy) {
  const st = G.st,
    m = G.map;
  if (!isFree(st) || m.id !== 'house' || G.visit) return false;
  const it = selItem(),
    id = it && it.id,
    o = m.objAt(fx, fy),
    k = fkey(fx, fy);
  st.free.inside = st.free.inside || {};
  if (o && o.kind === 'furn') {
    if (id === 'accetta' || id === 'piccone') {
      if (!addItem(o.fid, 1)) return true;
      delete st.free.inside[o.fk];
      G.maps.house = buildHouse(st);
      addExits(G.maps.house);
      buildGround(G.maps.house);
      applyLook(G.maps.house, st);
      G.map = G.maps.house;
      AU.play('pick');
      UI.toast(ITEMS[o.fid].n + ' raccolto.');
      return true;
    }
    if (o.fid === 'cucina') {
      cookModal(true);
      return true;
    }
    if (o.fid === 'libreria') {
      recipeBook();
      return true;
    }
    UI.toast(ITEMS[o.fid].n + ". Per spostarlo usa l'accetta.");
    return true;
  }
  if (id && ITEMS[id].t === 'arredo') {
    const wall = ITEMS[id].wall;
    if (wall ? !(m.get(fx, fy) === 9 && !m.objAt(fx, fy)) : !furnFree(m, fx, fy)) {
      UI.toast(
        wall ? 'I quadri vanno appesi alla parete in alto.' : 'Non qui: serve un posto libero sul pavimento.'
      );
      return true;
    }
    st.free.inside[k] = { id };
    removeItem(id, 1);
    G.maps.house = buildHouse(st);
    addExits(G.maps.house);
    buildGround(G.maps.house);
    applyLook(G.maps.house, st);
    G.map = G.maps.house;
    AU.play('plant');
    st.flags.decor = (st.flags.decor || 0) + 1;
    return true;
  }
  return false;
}
function addFurniture(m, st) {
  if (!isFree(st)) return;
  for (const k in st.free.inside || {}) {
    const [x, y] = k.split(',').map(Number),
      f = st.free.inside[k],
      flat = ITEMS[f.id] && ITEMS[f.id].flat;
    if (flat) {
      m.add({
        kind: 'furn',
        tx: x,
        ty: y,
        img: FREEIMG[f.id],
        dx: x * 16 - 4,
        dy: y * 16 + 2,
        sy: -1,
        solid: [],
        hits: [[x, y]],
        fid: f.id,
        fk: k,
        deco: 0
      });
      continue;
    }
    m.add(
      OB('furn', x, y, FREEIMG[f.id], {
        fid: f.id,
        fk: k,
        act: 'furn',
        lift: ITEMS[f.id].wall ? -6 : 0,
        solid: ITEMS[f.id].wall ? [] : [[x, y]],
        hits: [[x, y]]
      })
    );
    if (f.id === 'lampada' || f.id === 'lanternacarta' || f.id === 'lampadario')
      m.lights.push({ x: x * 16 + 8, y: y * 16 - 10, r: 60, fire: 1 });
  }
}
ACT.furn = () => {};
PROMPT.furn = 'Usa';
// Brom amplia la casa
async function houseUpMenu() {
  const st = G.st,
    lv = houseLv(),
    nx = HOUSE_UP[lv + 1],
    o = st.free.houseJob;
  if (o && st.day >= o.ready) {
    st.free.house = o.lv;
    st.free.houseJob = null;
    AU.play('ok');
    addFriend('brom', 2);
    rebuildMaps();
    return say('brom', 'Fatto. La casa è più grande. Mh. Il nonno sarebbe contento.');
  }
  if (o)
    return say(
      'brom',
      `Ci sto lavorando. Pronto ${o.ready - st.day === 1 ? 'domani' : 'tra ' + (o.ready - st.day) + ' giorni'}.`
    );
  if (!nx) return say('brom', 'Più grande di così no. La Valle non è una città.');
  const can = st.money >= nx.cost && Object.entries(nx.c).every(([k, n]) => countItem(k) >= n);
  const c = await ask(
    'brom',
    `${nx.n}: ${nx.d} Servono ${SC(nx.cost)}, ${Object.entries(nx.c)
      .map(([k, n]) => n + ' ' + ITEMS[k].n.toLowerCase())
      .join(', ')}. Tre giorni.`,
    [can ? 'Fallo' : 'Non ho abbastanza', 'Niente']
  );
  if (c !== 0 || !can) return;
  st.money -= nx.cost;
  for (const [k, n] of Object.entries(nx.c)) removeItem(k, n);
  st.free.houseJob = { lv: lv + 1, ready: st.day + 3 };
  AU.play('coin');
  UI.hud();
  return say('brom', 'Tre giorni. Intanto non toccare le travi.');
}
