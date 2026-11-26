'use strict';
// ================= MONDO =================
const GSOLID = new Set([0, 3, 8, 9, 13]);
class GMap {
  constructor(id, w, h, o = {}) {
    this.id = id;
    this.w = w;
    this.h = h;
    this.interior = !!o.interior;
    this.name = o.name || id;
    this.g = new Uint8Array(w * h);
    this.sol = new Uint8Array(w * h);
    this.objs = [];
    this.hit = {};
    this.lights = [];
    this.doors = [];
    this.smokes = [];
  }
  inb(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }
  get(x, y) {
    return this.inb(x, y) ? this.g[y * this.w + x] : 0;
  }
  set(x, y, v) {
    if (this.inb(x, y)) this.g[y * this.w + x] = v;
  }
  fill(x0, y0, x1, y1, v) {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, v);
  }
  solid(x, y) {
    if (!this.inb(x, y)) return true;
    return this.sol[y * this.w + x] === 1 || GSOLID.has(this.g[y * this.w + x]);
  }
  block(x, y) {
    if (this.inb(x, y)) this.sol[y * this.w + x] = 1;
  }
  add(o) {
    this.objs.push(o);
    (o.solid || []).forEach(([x, y]) => this.block(x, y));
    (o.hits || o.solid || []).forEach(([x, y]) => {
      this.hit[x + ',' + y] = o;
    });
    return o;
  }
  objAt(x, y) {
    return this.hit[x + ',' + y];
  }
}
// decorazioni basse (zucche, fiori, mucchi di foglie): ci si passa sopra, ma si possono ancora guardare e usare
const BASSI = new Set(['pumpkin', 'hydr', 'sunflower', 'leaves']);
// crea un oggetto ancorato al tile (tx,ty): immagine centrata e poggiata sul fondo del tile
function OB(kind, tx, ty, img, o = {}) {
  const w = img ? iw(img) : 16,
    h = img ? ih(img) : 16,
    wt = o.wt || 1;
  const b = {
    kind,
    tx,
    ty,
    img,
    dx: tx * 16 + (wt * 16 - w) / 2,
    dy: (ty + 1) * 16 - h + (o.lift || 0),
    sy: (ty + 1) * 16 - 1,
    solid: [[tx, ty]]
  };
  if (BASSI.has(kind)) {
    b.solid = [];
    b.hits = [[tx, ty]];
  }
  return Object.assign(b, o);
}
const FARM = { x0: 5, y0: 13, x1: 21, y1: 33 };
const POSTS = [
  [12, 3],
  [22, 3],
  [40, 3],
  [52, 3],
  [3, 25]
];
const BUSHES = [
  [18, 11],
  [6, 35],
  [20, 35]
];
const LEAVES = [
  [41, 13],
  [45, 13],
  [39, 14],
  [46, 14]
];
const BLD = {
  house: { x: 7, y: 5, w: 6, h: 5 },
  chapel: { x: 40, y: 5, w: 7, h: 7 },
  store: { x: 52, y: 12, w: 6, h: 5 },
  elder: { x: 49, y: 26, w: 6, h: 5 },
  barn: { x: 56, y: 25, w: 4, h: 6 },
  cottage: { x: 33, y: 25, w: 5, h: 4 },
  forge: { x: 33, y: 9, w: 5, h: 4 }
};
function bdoor(k) {
  const b = BLD[k];
  const dx = { house: 2, store: 3, elder: 3, barn: 2, cottage: 2, forge: 2, chapel: 3 }[k];
  return [b.x + dx, b.y + b.h - 1];
}

function buildMain(st) {
  const MW = isFree(st) ? 100 : 64,
    m = new GMap('main', MW, 48, { name: 'Hollowmere' });
  const F = st.flags;
  srand(1234);
  for (let y = 0; y < 48; y++)
    for (let x = 0; x < MW; x++) {
      const out = x < 3 || x > 60 || y < 3 || y > 42;
      m.set(x, y, out ? 5 : 1);
    }
  m.fill(0, 43, MW - 1, 44, 3);
  if (!F.bridgeGone) m.fill(44, 43, 45, 44, 4);
  m.fill(43, 45, 46, 47, 2);
  // sentieri
  m.fill(10, 10, 10, 18, 2);
  m.fill(10, 19, 51, 20, 2);
  m.fill(30, 0, 31, 18, 2);
  m.fill(38, 15, 51, 23, 11);
  m.fill(43, 12, 43, 14, 2);
  m.fill(44, 24, 45, 42, 2);
  m.fill(51, 17, 55, 18, 2);
  m.fill(46, 31, 58, 31, 2);
  m.fill(35, 29, 43, 29, 2);
  m.fill(35, 13, 35, 18, 2);
  m.fill(48, 4, 59, 11, 1);
  // fiori decorativi
  for (let i = 0; i < 120; i++) {
    const x = ri(4, 59),
      y = ri(4, 41);
    if (m.get(x, y) === 1 && !(x >= FARM.x0 && x <= FARM.x1 && y >= FARM.y0 && y <= FARM.y1)) m.set(x, y, 12);
  }
  // recinto giallo
  const fen = (x, y, h) => {
    const pi = POSTS.findIndex(p => p[0] === x && p[1] === y);
    if (pi >= 0) {
      const painted = F.posts && F.posts[pi];
      m.add(
        OB('post', x, y, h ? (painted ? IMG.fenceH : IMG.fenceHg) : painted ? IMG.fenceV : IMG.fenceVg, {
          act: 'post',
          pi
        })
      );
      return;
    }
    m.add(OB('fence', x, y, h ? IMG.fenceH : IMG.fenceV, { act: 'fence' }));
  };
  for (let x = 3; x <= 60; x++) {
    if (!(x === 30 || x === 31)) fen(x, 3, 1);
    if (!(x === 44 || x === 45)) fen(x, 42, 1);
  }
  for (let y = 4; y <= 41; y++) {
    fen(3, y, 0);
    fen(60, y, 0);
  }
  [
    [30, 3],
    [31, 3]
  ].forEach(([x, y]) => m.add(OB('varco', x, y, null, { act: 'varco' })));
  if (F.arrived)
    [
      [44, 42],
      [45, 42]
    ].forEach(([x, y]) => m.add(OB('bridgegap', x, y, null, { act: 'bridge' })));
  // edifici
  const addB = (k, img) => {
    const b = BLD[k],
      [dx, dy] = bdoor(k);
    const solid = [];
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) solid.push([x, y]);
    m.add({
      kind: 'bld',
      key: k,
      tx: b.x,
      ty: b.y,
      img,
      dx: b.x * 16 - 1,
      dy: (b.y + b.h) * 16 - ih(img),
      sy: (b.y + b.h) * 16 - 1,
      solid,
      hits: solid.filter(([x, y]) => !(x === dx && y === dy))
    });
    m.add({
      kind: 'door',
      key: k,
      tx: dx,
      ty: dy,
      img: null,
      solid: [[dx, dy]],
      hits: [[dx, dy]],
      act: 'door',
      auto: true,
      sy: 0
    });
    if (img.chim)
      m.smokes.push({ x: b.x * 16 - 1 + img.chim[0], y: (b.y + b.h) * 16 - ih(img) + img.chim[1], a: 0 });
    (IMG.lights[k] || []).forEach(([lx, ly, lw = 10, lh = 10]) =>
      m.lights.push({
        x: b.x * 16 - 1 + 1 + lx + lw / 2,
        y: (b.y + b.h) * 16 - ih(img) + ly + lh / 2,
        r: 26,
        k,
        win: 1
      })
    );
  };
  addB('house', IMG.house);
  addB('chapel', IMG.chapel);
  addB('store', IMG.store);
  addB('elder', IMG.elder);
  addB('barn', IMG.barn);
  addB('cottage', IMG.cottage);
  addB('forge', IMG.forge);
  // oggetti
  m.add(OB('bin', 13, 9, IMG.bin, { act: 'bin' }));
  m.add(OB('scare', 13, 22, IMG.scare[H2(st) ? 1 : 0], { act: 'scare' }));
  m.add(OB('board', 40, 16, IMG.board, { act: 'board' }));
  m.add(OB('well', 47, 19, IMG.well, { act: 'well' }));
  m.add(
    OB('stall', 48, 21, IMG.stall, {
      wt: 3,
      act: 'stall',
      solid: [
        [48, 21],
        [49, 21],
        [50, 21]
      ],
      hits: [
        [48, 21],
        [49, 21],
        [50, 21]
      ]
    })
  );
  m.add(OB('anvil', 37, 14, IMG.anvil, { act: 'anvil' }));
  m.add(
    OB('stump', 33, 5, F.offered ? (st.day > F.offerDay ? IMG.stumpH : IMG.stumpB) : IMG.stump, {
      act: 'stump'
    })
  );
  LAMPS.forEach(([x, y], i) => {
    m.add(OB('lamp', x, y, IMG.lamp, { act: 'lamp', li: i }));
    m.lights.push({ x: x * 16 + 8, y: y * 16 - 26, r: 40, lamp: 1, li: i });
  });
  // cimitero
  const graves = [
    [49, 5, 0],
    [51, 5, 1],
    [55, 5, 2],
    [57, 5, 0],
    [49, 8, 2],
    [51, 8, 1],
    [55, 8, 0],
    [57, 8, 1],
    [50, 10, 2],
    [56, 10, 0]
  ];
  graves.forEach(([x, y, v], i) => m.add(OB('grave', x, y, IMG.grave[v], { act: 'grave', gi: i })));
  m.add(OB('elias', 53, 7, IMG.cross, { act: 'elias' }));
  m.add(OB('nameless', 58, 6, IMG.nameless, { act: 'nameless' }));
  // decorazioni
  [
    [50, 16],
    [52, 22],
    [39, 22],
    [22, 9],
    [14, 9],
    [56, 18]
  ].forEach(([x, y]) =>
    m.add(
      OB('pumpkin', x, y, H2(st) && G.night > 0.4 ? IMG.jackL : H2(st) ? IMG.jack : IMG.pumpkin, {
        act: 'pumpkin'
      })
    )
  );
  if ((st.day >= 4 || st.chapter >= 4) && !st.free) {
    const nP = st.chapter >= 4 ? FEST_PUMP.length : Math.min(FEST_PUMP.length, (st.day - 3) * 3),
      pimg = H2(st) && G.night > 0.4 ? IMG.jackL : H2(st) ? IMG.jack : IMG.pumpkin;
    FEST_PUMP.slice(0, nP).forEach(([x, y]) => {
      if (!m.objAt(x, y) && m.get(x, y) !== 3) m.add(OB('pumpkin', x, y, pimg, { act: 'pumpkin' }));
    });
  }
  if ((st.day >= 6 || st.chapter >= 4) && !st.free)
    FEAST.forEach(([x, y]) => {
      m.add(
        OB('feast', x, y, IMG.feast, {
          wt: 3,
          solid: [
            [x, y],
            [x + 1, y],
            [x + 2, y]
          ],
          hits: [
            [x, y],
            [x + 1, y],
            [x + 2, y]
          ],
          act: 'feast'
        })
      );
      m.lights.push({ x: x * 16 + 24, y: y * 16 + 2, r: 46, fire: 1, festa: 1 });
    });
  [
    [60 - 5, 32],
    [59, 32],
    [54, 24]
  ].forEach(([x, y]) => m.add(OB('hay', x, y, IMG.hay, { act: 'hay' })));
  [
    [39, 10],
    [38, 11]
  ].forEach(([x, y]) => m.add(OB('barrel', x, y, IMG.barrel, { act: 'barrel' })));
  // cespugli di bacche rosse (dal giorno 2)
  if (st.day >= 2)
    BUSHES.forEach(([x, y], i) => {
      if (!(F.bush && F.bush[i])) m.add(OB('bushR', x, y, IMG.bushR, { act: 'bushR', bi: i, wt: 1 }));
    });
  // foglie (faccenda)
  if (st.chore === 'foglie' && !st.choreDone)
    LEAVES.forEach(([x, y], i) => {
      if (!(st.leaves && st.leaves[i])) m.add(OB('leaves', x, y, IMG.leaves, { act: 'leaves', li: i }));
    });
  addDeco(m, st);
  // alberi
  const reserved = [
    [4, 11, 23, 36],
    [5, 3, 15, 11],
    [38, 3, 60, 12],
    [37, 13, 58, 24],
    [46, 23, 60, 33],
    [31, 23, 40, 31],
    [31, 7, 39, 16],
    [28, 3, 34, 7],
    [42, 24, 47, 42],
    [2, 23, 6, 27],
    [10, 2, 24, 5],
    [38, 2, 54, 5]
  ];
  const isRes = (x, y) => reserved.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);
  const ok = (x, y) => {
    for (let j = -1; j <= 1; j++)
      for (let i = -1; i <= 1; i++) {
        const g = m.get(x + i, y + j);
        if (!(g === 1 || g === 12) || m.hit[x + i + ',' + (y + j)]) return false;
      }
    return !isRes(x, y);
  };
  for (let i = 0; i < 500; i++) {
    const x = ri(5, 58),
      y = ri(5, 40);
    if (ok(x, y) && rnd() < 0.5) {
      m.add(OB('tree', x, y, IMG.tree[ri(0, 4)], { act: 'tree' }));
    }
  }
  for (let i = 0; i < 40; i++) {
    const x = ri(5, 58),
      y = ri(5, 40);
    if (ok(x, y)) m.add(OB('bush', x, y, IMG.bush, { act: 'bush' }));
  }
  // bosco esterno
  for (let y = -1; y < 48; y++)
    for (let x = -1; x < MW + 1; x++) {
      const band = x <= 2 || x >= 61 || y <= 2 || y >= 45;
      if (!band) continue;
      if ((x === 30 || x === 31) && y <= 2) continue;
      if (y >= 45 && y < 47) continue;
      if (m.get(x, y) === 3) continue;
      if (x >= 43 && x <= 46 && y >= 45) continue;
      if ((x * 7 + y * 13) % 3 !== 0 && !(y <= 1 || y >= 46 || x <= 1 || x >= 62)) continue;
      if (x >= 65 && (x * 5 + y * 11) % 2) continue;
      if (POSTS.some(([px, py]) => Math.abs(px - x) <= 1 && y >= py - 1 && y <= py + 2)) continue;
      const o = OB('pine', x, y, IMG.pine[hsh(x, y) % 3], { act: 'pine' });
      o.dx += (hsh(x, y) % 7) - 3;
      m.add(o);
    }
  addFlora(m);
  return m;
}
// i mobili del nonno nella casa: finita la storia diventano mobili come gli altri (si spostano, si tolgono).
// Il passaggio si fa una volta sola (st.free.casaLibera), al primo ingresso nella Valle; il resto lo fa casa_libera.js.
const CASA_NONNO = [
  ['letto_nonno', '1,3'],
  ['camino_nonno', '5,1'],
  ['ritratto_nonno', '3,1'],
  ['cassa_nonno', '9,2'],
  ['scaffale_nonno', '10,2'],
  ['tavolo_nonno', '7,5'],
  ['tappeto_nonno', '4,4']
];
function casaLibera(st) {
  if (!isFree(st) || !st.free) return false;
  if (G.visit) return !!st.free.casaLibera; // in visita la casa dell'amico resta com'è: niente passaggi
  if (!st.free.casaLibera) {
    st.free.casaLibera = 1;
    const I = (st.free.inside = st.free.inside || {});
    for (const [id, k] of CASA_NONNO) {
      if (I[k]) (st.free.daRiporre = st.free.daRiporre || []).push(id);
      else I[k] = { id };
    }
  }
  return true;
}
// dove ci si sveglia: accanto al letto (quello del nonno o uno nuovo), dovunque sia
function svegliaPos(st) {
  if (!casaLibera(st)) return [2, 3];
  const I = st.free.inside || {},
    HS = houseSize(st),
    occ = new Set();
  let letto = null;
  for (const k in I) {
    const [x, y] = k.split(',').map(Number),
      it = ITEMS[I[k].id] || {},
      [w, h] = it.fp || [1, 1];
    if (!it.flat && !it.wall)
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) occ.add(x + i + ',' + (y - j));
    if ((I[k].id === 'letto_nonno' || I[k].id === 'letto') && !letto) letto = [x, y, w, h];
  }
  if (!letto) return [2, 3];
  const [x, y, w, h] = letto,
    ok = (a, b) => a >= 1 && b >= 2 && a <= HS.w - 2 && b <= HS.h - 2 && !occ.has(a + ',' + b);
  for (const [a, b] of [
    [x + w, y],
    [x - 1, y],
    [x, y + 1],
    [x + w, y - 1],
    [x - 1, y - 1],
    [x + 1, y + 1]
  ])
    if (ok(a, b)) return [a, b];
  return [2, 3];
}
function buildHouse(st) {
  const HS = houseSize(st),
    HW = HS.w,
    HH = HS.h;
  const m = new GMap('house', HW, HH, { interior: 1, name: 'Casa' });
  m.fill(0, 0, HW - 1, 0, 8);
  m.fill(0, 1, HW - 1, 1, 9);
  m.fill(0, 2, HW - 1, HH - 1, 6);
  // finita la storia i mobili del nonno sono mobili come gli altri (st.free.inside): si spostano tutti
  const libera = casaLibera(st);
  if (!libera) {
    m.add(
      OB('fire', 5, 1, IMG.fire[0], {
        wt: 2,
        solid: [
          [5, 1],
          [6, 1]
        ],
        hits: [
          [5, 1],
          [6, 1]
        ],
        act: 'fire',
        anim: 'fire',
        lift: 4
      })
    );
    m.lights.push({ x: 6 * 16, y: 24, r: 70, fire: 1 });
  }
  m.add(OB('window', 8, 1, IMG.window, { act: 'window', win: 1, lift: -6 }));
  m.add(OB('window', 2, 1, IMG.window, { act: 'window', win: 1, lift: -6 }));
  if (!libera) {
    m.add(OB('portrait', 3, 1, IMG.portrait[H2(st) ? 1 : 0], { act: 'portrait', lift: -6 }));
    m.add(
      OB('bed', 1, 3, IMG.bed, {
        solid: [
          [1, 2],
          [1, 3]
        ],
        hits: [
          [1, 2],
          [1, 3]
        ],
        act: 'bed'
      })
    );
    m.add(OB('chest', 9, 2, F_(st).openedChest ? IMG.chestO : IMG.chest, { act: 'chest' }));
    m.add(OB('shelf', 10, 2, IMG.shelf, { act: 'shelf' }));
    m.add(
      OB('table', 7, 5, IMG.table, {
        wt: 2,
        solid: [
          [7, 5],
          [8, 5]
        ],
        hits: [
          [7, 5],
          [8, 5]
        ],
        act: 'table'
      })
    );
    m.add({
      kind: 'rug',
      tx: 4,
      ty: 4,
      img: IMG.rug,
      dx: 4 * 16,
      dy: 4 * 16 + 8,
      sy: -1,
      solid: [],
      hits: [],
      deco: 1
    });
  }
  if (F_(st).page2avail && !F_(st).page2)
    m.add(OB('page2', 6, 7, IMG.paper, { act: 'page2', solid: [], hits: [[6, 7]] }));
  if (HW > 12) {
    m.add(OB('window', 14, 1, IMG.window, { act: 'window', win: 1, lift: -6 }));
  }
  if (HH > 9) {
    m.add(OB('window', 16, 1, IMG.window, { act: 'window', win: 1, lift: -6 }));
  }
  addFurniture(m, st);
  m.add({
    kind: 'mat',
    tx: 6,
    ty: HH - 1,
    img: IMG.mat,
    dx: 6 * 16,
    dy: (HH - 1) * 16 + 4,
    sy: -1,
    solid: [],
    hits: [],
    deco: 1
  });
  m.doors.push({ tx: 6, ty: HH - 1, to: 'main', x: 10, y: 10, dir: 0 });
  return m;
}
function F_(st) {
  return st.flags;
}
function buildChapel(st) {
  const m = new GMap('chapel', 14, 11, { interior: 1, name: 'Cappella' });
  m.fill(0, 0, 13, 1, 13);
  m.fill(0, 2, 13, 10, 7);
  m.add(
    OB('altar', 6, 2, IMG.altar, {
      wt: 2,
      solid: [
        [6, 2],
        [7, 2]
      ],
      hits: [
        [6, 2],
        [7, 2]
      ],
      act: 'altar'
    })
  );
  [
    [3, 2],
    [10, 2]
  ].forEach(([x, y]) => {
    m.add(OB('candle', x, y, IMG.candle, { act: 'candle' }));
    m.lights.push({ x: x * 16 + 8, y: y * 16 - 4, r: 46, fire: 1 });
  });
  m.add(OB('rope', 12, 2, IMG.rope, { act: 'rope' }));
  [4, 6, 8].forEach(y => {
    m.add(
      OB('pew', 1, y, IMG.pew, {
        wt: 4,
        solid: [
          [1, y],
          [2, y],
          [3, y],
          [4, y]
        ],
        hits: [
          [1, y],
          [2, y],
          [3, y],
          [4, y]
        ],
        act: 'pew'
      })
    );
    m.add(
      OB('pew', 9, y, IMG.pew, {
        wt: 4,
        solid: [
          [9, y],
          [10, y],
          [11, y],
          [12, y]
        ],
        hits: [
          [9, y],
          [10, y],
          [11, y],
          [12, y]
        ],
        act: 'pew'
      })
    );
  });
  m.add(OB('window', 2, 0, IMG.window, { solid: [], hits: [], lift: 2, win: 1 }));
  m.add(OB('window', 11, 0, IMG.window, { solid: [], hits: [], lift: 2, win: 1 }));
  m.add({
    kind: 'mat',
    tx: 7,
    ty: 10,
    img: IMG.mat,
    dx: 7 * 16,
    dy: 10 * 16 + 4,
    sy: -1,
    solid: [],
    hits: [],
    deco: 1
  });
  m.doors.push({ tx: 7, ty: 10, to: 'main', x: 43, y: 12, dir: 0 });
  return m;
}
function buildBarn(st) {
  const m = new GMap('barn', 9, 8, { interior: 1, name: 'Fienile' });
  m.fill(0, 0, 8, 0, 8);
  m.fill(0, 1, 8, 1, 9);
  m.fill(0, 2, 8, 7, 10);
  m.add(OB('hay', 1, 2, IMG.hay, { act: 'hay' }));
  m.add(OB('hay', 1, 3, IMG.hay, { act: 'hay' }));
  m.add(OB('hay', 7, 5, IMG.hay, { act: 'hay' }));
  m.add(OB('costume', 4, 2, IMG.costume, { act: 'costume' }));
  m.add(OB('ledger', 6, 2, IMG.ledger, { act: 'ledger' }));
  m.add(OB('stilts', 2, 5, IMG.stilts, { act: 'stilts' }));
  m.add(OB('lanternI', 7, 2, IMG.lantern, { act: 'lanternI' }));
  m.lights.push({ x: 7 * 16 + 8, y: 2 * 16 + 8, r: 50, fire: 1, barn: 1 });
  m.add({
    kind: 'mat',
    tx: 4,
    ty: 7,
    img: IMG.mat,
    dx: 4 * 16,
    dy: 7 * 16 + 4,
    sy: -1,
    solid: [],
    hits: [],
    deco: 1
  });
  m.doors.push({ tx: 4, ty: 7, to: 'main', x: 58, y: 31, dir: 0 });
  return m;
}
function rebuildMapsBase() {
  const st = G.st;
  applySeasonLooks();
  if (typeof FREEIMG !== 'undefined' && FREEIMG.trees)
    IMG.tree = FREEIMG.trees[seasonOf(st)] || FREEIMG.trees[0];
  G.maps.main = buildMain(st);
  applyFree(G.maps.main, st);
  seasonDecor(G.maps.main, st);
  festDecor(G.maps.main, st);
  G.hits = {};
  G.maps.house = buildHouse(st);
  G.maps.chapel = buildChapel(st);
  G.maps.barn = buildBarn(st);
  G.maps.wood = buildWood(st);
  missionObjects(G.maps.main);
  missionObjects(G.maps.wood);
  for (const k in G.maps) {
    if (G.maps[k].interior) addExits(G.maps[k]);
    buildGround(G.maps[k]);
    seasonGround(G.maps[k]);
  }
  applyLook(G.maps.main, st);
  applyLook(G.maps.house, st);
  spawnFarmAnimals();
  if (G.map) G.map = G.maps[G.map.id];
}

// catena: altri file la avvolgono con Ext.avvolgi('rebuildMaps', …)
function rebuildMaps(...a) {
  return Ext.catena('rebuildMaps', rebuildMapsBase, this, a);
}

// ---------- strato di terreno pre-disegnato (tile, bordi d'erba, rive, macchie, ombre) ----------
const SHADOWK = {
  feast: [24, 3, 1],
  tree: [14, 5, 4],
  pine: [10, 4, 3],
  bush: [8, 3, 2],
  bushR: [8, 3, 2],
  well: [9, 3, 2],
  stall: [22, 4, 3],
  lamp: [4, 2, 2],
  hay: [8, 3, 2],
  barrel: [6, 2, 2],
  board: [8, 3, 2],
  grave: [6, 2, 2],
  elias: [5, 2, 2],
  nameless: [6, 2, 2],
  scare: [7, 2, 2],
  stump: [7, 2, 2],
  anvil: [7, 2, 2],
  pumpkin: [6, 2, 2],
  bin: [8, 3, 2],
  bed: [8, 3, 1],
  chest: [8, 2, 1],
  shelf: [8, 2, 1],
  table: [15, 3, 1],
  altar: [15, 3, 1],
  pew: [30, 3, 1],
  costume: [8, 3, 1],
  stilts: [7, 2, 1],
  ledger: [8, 2, 1]
};
// le ombre di ciò che si può abbattere o togliere non si stampano nel terreno: si disegnano dal vivo,
// così quando l'albero cade se ne va anche la sua ombra
const OMBRA_VIVA = new Set(['tree', 'pine', 'stump', 'bush', 'bushR']);
function disegnaOmbreVive(m, cx, cy) {
  if (m.interior) return;
  // d'inverno la neve copre (e schiarisce) le ombre stampate: queste fanno lo stesso
  ctx.fillStyle = pratoStagione() === 1 && m.id === 'main' ? 'rgba(12,18,8,.13)' : 'rgba(12,18,8,.3)';
  for (const o of m.objs) {
    if (!o.img || o.deco || !OMBRA_VIVA.has(o.kind)) continue;
    const s = SHADOWK[o.kind],
      X = o.dx + iw(o.img) / 2 + s[2];
    if (X < cx - 30 || X > cx + VW + 30 || o.sy < cy - 10 || o.sy > cy + VH + 10) continue;
    ctx.beginPath();
    ctx.ellipse(X, o.sy - 1, s[0], s[1], 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
// ---------- il prato vivo ----------
// Sopra le piastrelle d'erba (tutte uguali) si dipinge un prato vero: macchie ampie più fitte e più asciutte,
// fili d'erba piegati dal vento, trifoglio e fiorellini di stagione. Tutto deterministico (stesso posto, stesso
// prato) e calcolato una volta sola quando si costruisce il terreno.
const pratoStagione = () => (G.st && typeof isFree === 'function' && isFree(G.st) ? seasonOf(G.st) : 0);
function pratoRumore(x, y, sc, seme) {
  const X = x / sc,
    Y = y / sc,
    x0 = Math.floor(X),
    y0 = Math.floor(Y),
    fx = X - x0,
    fy = Y - y0,
    u = fx * fx * (3 - 2 * fx),
    v = fy * fy * (3 - 2 * fy),
    r = (a, b) => (hsh(a * 7 + seme * 101, b * 13 + seme * 57) % 1000) / 1000,
    a0 = r(x0, y0) + (r(x0 + 1, y0) - r(x0, y0)) * u,
    a1 = r(x0, y0 + 1) + (r(x0 + 1, y0 + 1) - r(x0, y0 + 1)) * u;
  return a0 + (a1 - a0) * v;
}
function pratoVivo(m, x, Z = { x0: 0, y0: 0, x1: m.w, y1: m.h }) {
  const s = pratoStagione(),
    // colori delle zone asciutte e di quelle fitte, per stagione (autunno, inverno, primavera, estate)
    secco = ['#b0a04a', '#a8a890', '#9ec25a', '#c2bc5a'][s],
    fitto = ['#3a5426', '#3a4e36', '#3a6a26', '#3e5e24'][s],
    punta = ['#c8c070', '#c8d0c0', '#c8e888', '#e0d880'][s],
    fiori = [
      ['#f0e0a0', '#d8a04a'],
      ['#f4f4f8'],
      ['#f8f4f0', '#f4d040', '#c8a0e8', '#f0a0c0'],
      ['#f4d040', '#f8f4f0', '#e8a040']
    ][s],
    pFiori = [0.05, 0, 0.22, 0.1][s],
    pr = (a, b, k) => (hsh(a * 31 + k * 977, b * 17 + k * 389) % 10000) / 10000,
    NC = new Float32Array((m.w + 2) * (m.h + 2)).fill(-1),
    nAt = (a, b) => {
      const k = b * (m.w + 2) + a;
      if (NC[k] < 0)
        NC[k] = pratoRumore(a * 16, b * 16, 72, 1) * 0.65 + pratoRumore(a * 16, b * 16, 21, 2) * 0.35;
      return NC[k];
    },
    // i pezzi dello stesso colore (e trasparenza) si raccolgono e si dipingono in un colpo solo, a blocchi fissi
    // di 8×8 piastrelle: un pezzo ridipinto usa gli stessi tracciati del tutto e viene uguale al pixel
    B = new Map(),
    R = (col, a, X, Y, w, h) => {
      const k = col + '|' + a;
      let p = B.get(k);
      if (!p) B.set(k, (p = new Path2D()));
      // sulla griglia dei pixel (mezza unità): niente sfumature ai bordi, e un pezzo ridipinto viene uguale
      const q = v => Math.round(v * 2) / 2;
      p.rect(q(X), q(Y), Math.max(0.5, q(w)), Math.max(0.5, q(h)));
    };
  const BL = 8,
    dipingi = () => {
      // prima le macchie (trasparenti), poi i fili e i fiori; a pari trasparenza in un ordine fisso (per nome)
      const ord = [...B.keys()].sort(
        (a, b) => +a.split('|')[1] - +b.split('|')[1] || (a < b ? -1 : a > b ? 1 : 0)
      );
      for (const k of ord) {
        const [col, a] = k.split('|');
        x.globalAlpha = +a;
        x.fillStyle = col;
        x.fill(B.get(k));
      }
      x.globalAlpha = 1;
      B.clear();
    };
  for (let by0 = Math.floor(Z.y0 / BL) * BL; by0 < Z.y1; by0 += BL)
    for (let bx0 = Math.floor(Z.x0 / BL) * BL; bx0 < Z.x1; bx0 += BL) {
      for (let ty = by0; ty < Math.min(m.h, by0 + BL); ty++)
        for (let tx = bx0; tx < Math.min(m.w, bx0 + BL); tx++) pratoPiastrella(tx, ty);
      dipingi();
    }
  function pratoPiastrella(tx, ty) {
    {
      const g = m.g[ty * m.w + tx];
      if (g !== 1 && g !== 12) return;
      const X0 = tx * 16,
        Y0 = ty * 16;
      // macchie: a blocchetti di 2×2, solo dove il prato si discosta dalla media
      // (il rumore si calcola agli angoli della piastrella e si interpola: le macchie sono molto più grandi)
      const n00 = nAt(tx, ty),
        n10 = nAt(tx + 1, ty),
        n01 = nAt(tx, ty + 1),
        n11 = nAt(tx + 1, ty + 1);
      for (let by = 0; by < 16; by += 2)
        for (let bx = 0; bx < 16; bx += 2) {
          const px = X0 + bx,
            py = Y0 + by,
            u = (bx + 1) / 16,
            v = (by + 1) / 16,
            n = (n00 * (1 - u) + n10 * u) * (1 - v) + (n01 * (1 - u) + n11 * u) * v;
          // trasparenza a gradini (1..5), così i colori si raggruppano
          if (n > 0.58) R(secco, Math.min(5, Math.ceil((n - 0.58) * 20)) * 0.068, px, py, 2, 2);
          else if (n < 0.42) R(fitto, Math.min(5, Math.ceil((0.42 - n) * 19)) * 0.08, px, py, 2, 2);
        }
      // fili d'erba: più alti dove il prato è fitto, tutti piegati un po' dal vento
      const lush = 1 - pratoRumore(X0 + 8, Y0 + 8, 72, 1),
        nf = 10 + Math.round(lush * 10),
        vento = (pratoRumore(X0 + 8, Y0 + 8, 40, 3) - 0.35) * 1.6;
      for (let i = 0; i < nf; i++) {
        const bx = X0 + pr(tx, ty, i) * 16,
          by = Y0 + 2 + pr(tx, ty, i + 50) * 14,
          h = 1 + lush * 1.5 + pr(tx, ty, i + 99) * 1.5,
          lean = vento + (pr(tx, ty, i + 140) - 0.5) * 0.6;
        R('#1e2c10', 0.45, bx, by, 0.5, 0.5);
        R(GR[i % 3 ? 2 : 3], 1, bx, by - h * 0.55, 0.5, h * 0.55);
        R(i % 4 ? GR[4] : punta, 1, bx + lean * 0.5, by - h, 0.5, h * 0.5);
      }
      // trifoglio nei punti più fitti
      if (lush > 0.6 && pr(tx, ty, 7) < 0.3) {
        const cx = X0 + 3 + pr(tx, ty, 8) * 10,
          cy = Y0 + 3 + pr(tx, ty, 9) * 10;
        R('#4a7a2a', 1, cx - 1, cy, 1, 1);
        R('#4a7a2a', 1, cx + 0.5, cy, 1, 1);
        R('#4a7a2a', 1, cx - 0.25, cy - 1, 1, 1);
        R('#7ab048', 1, cx - 1, cy, 0.5, 0.5);
        R('#7ab048', 1, cx + 0.5, cy, 0.5, 0.5);
        R('#7ab048', 1, cx - 0.25, cy - 1, 0.5, 0.5);
      }
      // fiorellini di stagione, sparsi
      if (pr(tx, ty, 11) < pFiori) {
        const fx = X0 + 2 + pr(tx, ty, 12) * 12,
          fy = Y0 + 3 + pr(tx, ty, 13) * 11,
          col = fiori[hsh(tx, ty * 3) % fiori.length];
        R('#3f6a26', 1, fx, fy, 0.5, 1.5);
        R(col, 1, fx - 0.5, fy - 0.5, 1.5, 1);
        R('#f8e070', 1, fx, fy - 0.5, 0.5, 0.5);
      }
    }
  }
}
// i ciuffi d'erba alta ondeggiano col vento (ognuno col suo tempo) e si piegano quando ci passi in mezzo
function disegnaCiuffo(e) {
  const im = e.img,
    w = iw(im),
    h = ih(im),
    bx = e.dx + w / 2,
    by = e.dy + h,
    p = G.player;
  let k = Math.sin(G.t * 1.7 + e.tx * 0.9 + e.ty * 0.4) * 0.07 + Math.sin(G.t * 0.45 + e.tx * 0.13) * 0.05;
  if (p) {
    const dx = bx - p.x,
      dy = by - p.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 7) k += Math.sign(dx || 1) * 0.35 * (1 - Math.abs(dx) / 10);
  }
  ctx.save();
  // d'inverno l'erba alta è secca e mezza sepolta dalla neve
  if (pratoStagione() === 1) ctx.globalAlpha = 0.5;
  ctx.translate(Math.round(bx), Math.round(by));
  ctx.transform(1, 0, -k, 1, 0, 0);
  dImg(ctx, im, -w / 2, -h);
  ctx.restore();
}
Ext.on('listaMondo', list => {
  for (const e of list) if (e.kind === 'tuft' && !e.disegna) e.disegna = disegnaCiuffo;
});
// Il terreno di una mappa, disegnato una volta in m.ground. Con una zona ({x0, y0, x1, y1} in piastrelle) si
// ridipinge solo quel pezzo (con due piastrelle di margine, perché bordi, sentieri e filtri guardano i vicini) e si
// restituisce il pezzo, da incollare con incollaTerreno: così un colpo di pala non ridisegna tutta la mappa.
// Tutto quello che si disegna dipende solo dalle coordinate, quindi il pezzo è identico allo stesso posto rifatto
// per intero.
function buildGround(m, zona) {
  const gw = m.w * 16,
    gh = m.h * 16,
    Z = zona
      ? {
          x0: Math.max(0, zona.x0 - 2),
          y0: Math.max(0, zona.y0 - 2),
          x1: Math.min(m.w, zona.x1 + 2),
          y1: Math.min(m.h, zona.y1 + 2)
        }
      : { x0: 0, y0: 0, x1: m.w, y1: m.h };
  // il terreno si rilegge pixel per pixel (atmosfera, stile): tela nella memoria del processore, che disegna
  // un pezzo e il tutto esattamente allo stesso modo
  const [c, x] = mk2((Z.x1 - Z.x0) * 16, (Z.y1 - Z.y0) * 16, { willReadFrequently: true });
  x.translate(-Z.x0 * 16, -Z.y0 * 16);
  if (!zona) {
    m.ground = c;
    m.water = false;
    m.shore = [];
  }
  for (let ty = Z.y0; ty < Z.y1; ty++)
    for (let tx = Z.x0; tx < Z.x1; tx++) {
      const g = m.g[ty * m.w + tx];
      if (g === 3) {
        m.water = true;
        continue;
      }
      const arr = T[GT[g]];
      if (!arr) continue;
      let v = hsh(tx, ty) % arr.length;
      // le foglie cadute (varianti 4 e 5 del prato) solo in autunno
      if (g === 1 && v >= 4 && pratoStagione() !== 0) v -= 4;
      x.drawImage(arr[v], tx * 16, ty * 16, 16, 16);
    }
  if (!m.interior) pratoVivo(m, x, Z);
  const isG = (tx, ty) => {
    const g = m.get(tx, ty);
    return g === 1 || g === 12;
  };
  for (let ty = Z.y0; ty < Z.y1; ty++)
    for (let tx = Z.x0; tx < Z.x1; tx++) {
      const g = m.get(tx, ty);
      if (g !== 2 && g !== 11) continue;
      const X0 = tx * 16,
        Y0 = ty * 16;
      for (let d = 0; d < 4; d++) {
        const [dx, dy] = DIRV[d];
        if (!isG(tx + dx, ty + dy)) continue;
        for (let i = 0; i < 16; i += 0.5) {
          const len = (1 + (hsh(tx * 34 + i * 2, ty * 31 + d) % 5)) * 0.5;
          let px, py, w, h, sx, sy;
          if (dy === 1) {
            px = X0 + i;
            py = Y0 + 16 - len;
            w = 1;
            h = len;
            sx = px;
            sy = py - 1;
          } else if (dy === -1) {
            px = X0 + i;
            py = Y0;
            w = 1;
            h = len;
            sx = px;
            sy = py + len;
          } else if (dx === 1) {
            px = X0 + 16 - len;
            py = Y0 + i;
            w = len;
            h = 1;
            sx = px - 1;
            sy = py;
          } else {
            px = X0;
            py = Y0 + i;
            w = len;
            h = 1;
            sx = px + len;
            sy = py;
          }
          if (dx) {
            w = len;
            h = 0.5;
          } else {
            w = 0.5;
            h = len;
          }
          if (dy === 1) {
            sy = py - 0.5;
          } else if (dy === -1) {
            sy = py + len;
          } else if (dx === 1) {
            sx = px - 0.5;
          } else sx = px + len;
          x.fillStyle = 'rgba(40,25,10,.28)';
          x.fillRect(sx, sy, 0.5, 0.5);
          x.fillStyle = len > 1.5 ? GR[3] : GR[2];
          x.fillRect(px, py, w, h);
          if (len > 1.5 && (i * 2) % 5 === 0) {
            x.fillStyle = GR[4];
            x.fillRect(px, py, 0.5, 0.5);
          }
        }
      }
    }
  // gli angoli dei sentieri che sporgono nel prato sono arrotondati
  const RA = 3.5;
  for (let ty = Z.y0; ty < Z.y1; ty++)
    for (let tx = Z.x0; tx < Z.x1; tx++) {
      const g = m.get(tx, ty);
      if (g !== 2 && g !== 11) continue;
      for (const [sx, sy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1]
      ]) {
        if (!isG(tx + sx, ty) || !isG(tx, ty + sy) || !isG(tx + sx, ty + sy)) continue;
        // centro del quarto di cerchio, dentro la piastrella
        const cx = tx * 16 + (sx < 0 ? RA : 16 - RA),
          cy = ty * 16 + (sy < 0 ? RA : 16 - RA);
        for (let j = 0; j < RA; j += 0.5)
          for (let i = 0; i < RA; i += 0.5) {
            const px = sx < 0 ? tx * 16 + i : tx * 16 + 16 - 0.5 - i,
              py = sy < 0 ? ty * 16 + j : ty * 16 + 16 - 0.5 - j,
              r = Math.hypot(px + 0.25 - cx, py + 0.25 - cy);
            if (r <= RA - 0.6) continue;
            x.fillStyle = r > RA ? GR[2 + (hsh(px * 2, py * 2) % 2)] : 'rgba(40,25,10,.28)';
            x.fillRect(px, py, 0.5, 0.5);
          }
      }
    }
  if (m.water)
    for (let ty = Z.y0; ty < Z.y1; ty++)
      for (let tx = Z.x0; tx < Z.x1; tx++) {
        if (m.get(tx, ty) !== 3) continue;
        const X0 = tx * 16,
          Y0 = ty * 16,
          n = m.get(tx, ty - 1),
          s = m.get(tx, ty + 1);
        if (n !== 3 && n !== 4) {
          if (!zona) m.shore.push([tx, ty]);
          for (let i = 0; i < 16; i++) {
            const k = 2 + (hsh(tx * 16 + i, 7) % 2);
            x.fillStyle = '#3a2716';
            x.fillRect(X0 + i, Y0, 1, k + 1);
            x.fillStyle = '#5a3e24';
            x.fillRect(X0 + i, Y0, 1, k - 1);
          }
        }
        if (s !== 3 && s !== 4) {
          for (let i = 0; i < 16; i++) {
            const k = 1 + (hsh(tx * 16 + i, 9) % 2);
            x.fillStyle = '#2a1d12';
            x.fillRect(X0 + i, Y0 + 16 - k, 1, k);
          }
        }
      }
  if (m.interior) {
    const dr = new Set(m.doors.map(d => d.tx + ',' + d.ty));
    for (let tx = 0; tx < m.w; tx++) {
      if (dr.has(tx + ',' + (m.h - 1))) continue;
      x.fillStyle = '#22140c';
      x.fillRect(tx * 16, m.h * 16 - 2, 16, 2);
      x.fillStyle = '#5a3a22';
      x.fillRect(tx * 16, m.h * 16 - 2.5, 16, 0.5);
    }
  }
  // punto di estensione: ridipingere il terreno appena fatto (atmosfera.js: colori d'autunno, foglie cadute)
  Ext.run('terreno', m, x, Z);
  x.globalCompositeOperation = 'source-atop';
  if (!m.interior) {
    // le macchie larghe di luce e d'ombra: dipinte una volta su una tela piccola e stese su tutta la mappa.
    // (Una sfumatura disegnata su un pezzo non torna uguale a quella disegnata sul tutto: il browser la puntina
    // secondo il punto dello schermo. Un'immagine stesa, invece, torna sempre uguale.)
    if (!zona || !m.macchie) m.macchie = macchiePrato(gw, gh);
    x.imageSmoothingEnabled = true;
    x.drawImage(m.macchie, 0, 0, gw, gh);
    x.imageSmoothingEnabled = false;
  }
  x.fillStyle = 'rgba(12,18,8,.3)';
  for (const o of m.objs) {
    if (!o.img || o.deco) continue;
    if (o.kind === 'bld') {
      const W0 = iw(o.img),
        top = o.ty * 16,
        base = o.sy + 1;
      x.beginPath();
      x.moveTo(o.dx + W0 - 2, top + 18);
      x.lineTo(o.dx + W0 + 9, top + 26);
      x.lineTo(o.dx + W0 + 9, base + 6);
      x.lineTo(o.dx + 10, base + 6);
      x.lineTo(o.dx + 4, base);
      x.lineTo(o.dx + W0 - 2, base);
      x.closePath();
      x.fill();
      continue;
    }
    const s = SHADOWK[o.kind];
    if (!s || OMBRA_VIVA.has(o.kind)) continue;
    x.beginPath();
    x.ellipse(o.dx + iw(o.img) / 2 + s[2], o.sy - 1, s[0], s[1], 0, 0, Math.PI * 2);
    x.fill();
  }
  x.globalCompositeOperation = 'source-over';
  return zona ? { c, x0: Z.x0, y0: Z.y0, zona } : c;
}
function macchiePrato(gw, gh) {
  const K = 4,
    [c, x] = mk(Math.ceil(gw / K), Math.ceil(gh / K));
  x.scale(1 / K, 1 / K);
  srand(4242);
  for (let i = 0; i < 90; i++) {
    const bx = rnd() * gw,
      by = rnd() * gh,
      r = 24 + rnd() * 70,
      dark = rnd() < 0.6;
    const g = x.createRadialGradient(bx, by, 0, bx, by, r);
    g.addColorStop(0, dark ? 'rgba(20,35,10,.14)' : 'rgba(255,235,160,.08)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(bx - r, by - r, r * 2, r * 2);
  }
  return c;
}
// incolla in m.ground un pezzo rifatto con buildGround(m, zona): solo la zona, senza il margine
function incollaTerreno(m, pezzo) {
  const S = m.ground.s || 1,
    T = 16 * S,
    z = pezzo.zona,
    X0 = Math.max(0, z.x0),
    Y0 = Math.max(0, z.y0),
    w = (Math.min(m.w, z.x1) - X0) * T,
    h = (Math.min(m.h, z.y1) - Y0) * T,
    g = m.ground.getContext('2d');
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(X0 * T, Y0 * T, w, h);
  g.drawImage(pezzo.c, (X0 - pezzo.x0) * T, (Y0 - pezzo.y0) * T, w, h, X0 * T, Y0 * T, w, h);
  g.restore();
}
function freeNear(m, x, y) {
  if (!m.solid(x, y)) return [x, y];
  for (let r = 1; r < 6; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (!m.solid(x + dx, y + dy)) return [x + dx, y + dy];
      }
  return [x, y];
}
// BFS per NPC/cavaliere
function bfs(m, sx, sy, tx, ty, max = 4000) {
  if (sx === tx && sy === ty) return [];
  const key = (x, y) => y * m.w + x;
  const prev = new Int32Array(m.w * m.h).fill(-1);
  const q = [key(sx, sy)];
  prev[key(sx, sy)] = key(sx, sy);
  let n = 0;
  while (q.length && n++ < max) {
    const k = q.shift(),
      x = k % m.w,
      y = (k / m.w) | 0;
    if (x === tx && y === ty) {
      const path = [];
      let c = k;
      while (c !== key(sx, sy)) {
        path.push([c % m.w, (c / m.w) | 0]);
        c = prev[c];
      }
      return path.reverse();
    }
    for (const [dx, dy] of DIRV) {
      const nx = x + dx,
        ny = y + dy;
      if (!m.inb(nx, ny)) continue;
      const nk = key(nx, ny);
      if (prev[nk] !== -1) continue;
      if (m.solid(nx, ny) && !(nx === tx && ny === ty)) continue;
      prev[nk] = k;
      q.push(nk);
    }
  }
  return null;
}
// ================= ENTITÀ, MOVIMENTO, RENDER =================
function boxHit(m, x, y) {
  const x0 = Math.floor((x - 5) / 16),
    x1 = Math.floor((x + 4) / 16),
    y0 = Math.floor((y - 5) / 16),
    y1 = Math.floor((y - 1) / 16);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (m.solid(tx, ty)) return [tx, ty];
  return null;
}
function ptile(e) {
  return [Math.floor(e.x / 16), Math.floor((e.y - 3) / 16)];
}
function frontTile() {
  const p = G.player,
    [dx, dy] = DIRV[p.dir];
  return [Math.floor((p.x + dx * 12) / 16), Math.floor((p.y - 4 + dy * 12) / 16)];
}
const NPC_DEF = [
  ['ezekiel', 'Anziano Ezekiel'],
  ['agatha', 'Agatha Crane'],
  ['lucius', 'Fratello Lucius'],
  ['clara', 'Clara'],
  ['brom', 'Brom'],
  ['tobia', 'Tobia'],
  ['faceless', '???']
];
function initEntities() {
  G.player = { x: 0, y: 0, dir: 0, anim: 0, moving: false, speed: 66, auto: null, stepT: 0, bumpT: 0 };
  G.npcs = NPC_DEF.map(([id, name]) => ({
    id,
    name,
    map: 'main',
    x: 0,
    y: 0,
    dir: 0,
    anim: 0,
    path: null,
    tgt: null,
    hidden: true,
    speed: 34,
    script: false
  }));
  G.horse = { on: false, x: 0, y: 0, dir: 1, anim: 0, path: [], rp: 0, speed: 60, hoofT: 0 };
}
const NPC = id => G.npcs.find(n => n.id === id);
function placeNPC(n, map, tx, ty, dir = 0) {
  n.map = map;
  n.x = tx * 16 + 8;
  n.y = ty * 16 + 14;
  n.dir = dir;
  n.hidden = false;
  n.path = null;
  n.tgt = null;
}
function setPos(e, tx, ty, dir) {
  e.x = tx * 16 + 8;
  e.y = ty * 16 + 14;
  if (dir != null) e.dir = dir;
}
function updatePlayerBase(dt) {
  const p = G.player,
    m = G.map;
  let mx = 0,
    my = 0;
  if (p.auto) {
    const [tx, ty] = p.auto;
    const gx = tx * 16 + 8,
      gy = ty * 16 + 14,
      dx = gx - p.x,
      dy = gy - p.y,
      d = Math.hypot(dx, dy);
    if (d < 2) {
      p.x = gx;
      p.y = gy;
      p.auto = null;
      if (p.autoRes) {
        const r = p.autoRes;
        p.autoRes = null;
        r();
      }
    } else {
      mx = dx / d;
      my = dy / d;
    }
    p.moving = !!p.auto;
    if (p.moving) {
      p.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 1 : 2) : my < 0 ? 3 : 0;
      p.x += mx * 44 * dt;
      p.y += my * 44 * dt;
      p.anim += dt * 7;
    }
    return;
  }
  if (G.cut || UI.busy()) return void (p.moving = false);
  mx = IN.mx();
  my = IN.my();
  const mag = Math.hypot(mx, my);
  if (mag > 1) {
    mx /= mag;
    my /= mag;
  }
  p.moving = mag > 0.15;
  if (p.moving) {
    if (Math.abs(mx) > Math.abs(my)) p.dir = mx < 0 ? 1 : 2;
    else p.dir = my < 0 ? 3 : 0;
    const sp =
      p.speed *
      (G.st.energy <= 0 ? 0.6 : 1) *
      (G.chase ? 1.1 : 1) *
      (typeof buffOn === 'function' && buffOn('passo') ? 1.2 : 1) *
      dt;
    let hit = boxHit(m, p.x + mx * sp, p.y);
    if (!hit) p.x += mx * sp;
    else {
      bump(hit);
      if (Math.abs(my) < 0.3) {
        const cy = Math.floor((p.y - 3) / 16) * 16 + 14;
        const ny = p.y + Math.sign(cy - p.y) * Math.min(Math.abs(cy - p.y), sp);
        if (!boxHit(m, p.x, ny)) p.y = ny;
      }
    }
    hit = boxHit(m, p.x, p.y + my * sp);
    if (!hit) p.y += my * sp;
    else {
      bump(hit);
      if (Math.abs(mx) < 0.3) {
        const cx = Math.floor(p.x / 16) * 16 + 8;
        const nx = p.x + Math.sign(cx - p.x) * Math.min(Math.abs(cx - p.x), sp);
        if (!boxHit(m, nx, p.y)) p.x = nx;
      }
    }
    p.anim += dt * 8.5;
    p.stepT -= dt;
    if (p.stepT <= 0) {
      p.stepT = 0.28;
      const [ux, uy] = ptile(p),
        ug = m.get(ux, uy);
      AU.play(suonoPasso(m, ug));
      addPrint(p);
      if (ug === 2 || ug === 11 || ug === 10)
        for (let i = 0; i < 2; i++)
          G.parts.push({
            k: 'puff',
            x: p.x + (Math.random() - 0.5) * 6,
            y: p.y - 1,
            vx: -mx * 8 + (Math.random() - 0.5) * 8,
            vy: -4,
            t: 0,
            life: 0.5
          });
    }
  }
  p.bumpT -= dt;
  // porte interne
  const [tx, ty] = ptile(p);
  for (const d of m.doors)
    if (d.tx === tx && d.ty === ty) {
      goMap(d.to, d.x, d.y, d.dir);
      return;
    }
  if (IN.takeAct()) doAction();
}

// catena: altri file la avvolgono con Ext.avvolgi('updatePlayer', …)
function updatePlayer(...a) {
  return Ext.catena('updatePlayer', updatePlayerBase, this, a);
}

function bump([tx, ty]) {
  const p = G.player;
  if (p.bumpT > 0) return;
  const o = G.map.objAt(tx, ty);
  if (o && o.auto) {
    const [fx, fy] = frontTile();
    if (fx === tx && fy === ty) {
      p.bumpT = 0.6;
      runAct(o);
    }
  }
}
function walkNPC(n, tx, ty, dir) {
  return new Promise(res => {
    n.script = true;
    const m = G.maps[n.map];
    const [sx, sy] = ptile(n);
    n.path = bfs(m, sx, sy, tx, ty) || [[tx, ty]];
    n.fdir = dir;
    if (!n.path.length) {
      if (dir != null) n.dir = dir;
      res();
      return;
    }
    n.res = res;
  });
}
function walkPlayer(tx, ty) {
  return new Promise(res => {
    G.player.auto = [tx, ty];
    G.player.autoRes = res;
  });
}
function updateHorseBase(dt) {
  const h = G.horse;
  if (!h.on) return;
  if (G.map.id !== 'main') {
    h.on = false;
    return;
  }
  h.anim += dt * 10;
  h.hoofT -= dt;
  const p = G.player;
  const dist = Math.hypot(p.x - h.x, p.y - h.y);
  if (h.hoofT <= 0) {
    h.hoofT = 0.13;
    if (Math.random() < 0.5) addPrint(h, true);
    if (AU.c) {
      const v = clamp(1 - dist / 300, 0.05, 1);
      AU.noise(AU.c.currentTime, 0.05, 0.45 * v, 'lowpass', 230);
      AU.osc('sine', 58, AU.c.currentTime, 0.06, 0.4 * v);
    }
  }
  G.shake = Math.max(G.shake, clamp(1 - dist / 200, 0, 1) * 1.6);
  h.rp -= dt;
  if (h.rp <= 0) {
    h.rp = 0.3;
    const m = G.map;
    const [sx, sy] = ptile(h),
      [tx, ty] = ptile(p);
    h.path = bfs(m, sx, sy, tx, ty, 6000) || [];
  }
  let gx, gy;
  if (dist < 26 || !h.path.length) {
    gx = p.x;
    gy = p.y;
  } else {
    const [px, py] = h.path[0];
    gx = px * 16 + 8;
    gy = py * 16 + 14;
    if (Math.hypot(gx - h.x, gy - h.y) < 4) {
      h.path.shift();
    }
  }
  const dx = gx - h.x,
    dy = gy - h.y,
    d = Math.hypot(dx, dy) || 1,
    sp = h.speed * dt;
  h.x += (dx / d) * sp;
  h.y += (dy / d) * sp;
  if (Math.abs(dx) > 2) h.dir = dx < 0 ? 1 : 2;
  if (dist < 12 && !G.cut) {
    h.on = false;
    caught();
  }
}

// catena: altri file la avvolgono con Ext.avvolgi('updateHorse', …)
function updateHorse(...a) {
  return Ext.catena('updateHorse', updateHorseBase, this, a);
}

function spawnHorseBase(tx, ty, speed) {
  const h = G.horse;
  h.on = true;
  setPos(h, tx, ty);
  h.path = [];
  h.rp = 0;
  h.speed = speed || 60;
  AU.play('sting');
  G.chase = true;
  AU.setMode('inseguimento');
}

// catena: altri file la avvolgono con Ext.avvolgi('spawnHorse', …)
function spawnHorse(...a) {
  return Ext.catena('spawnHorse', spawnHorseBase, this, a);
}

// ---------- camera ----------
function updateCamBase(dt) {
  const m = G.map,
    p = G.player;
  let cx = p.x - VW / 2,
    cy = p.y - 12 - VH / 2;
  const mw = m.w * 16,
    mh = m.h * 16;
  cx = mw <= VW ? (mw - VW) / 2 : clamp(cx, 0, mw - VW);
  cy = mh <= VH ? (mh - VH) / 2 : clamp(cy, 0, mh - VH);
  G.cam.x = cx;
  G.cam.y = cy;
}

// catena: altri file la avvolgono con Ext.avvolgi('updateCam', …)
function updateCam(...a) {
  return Ext.catena('updateCam', updateCamBase, this, a);
}

// ---------- render ----------
const [LC, LX] = mk(MAXW, H);
const SHADOW = (() => {
  const [c, x] = mk(14, 5);
  x.fillStyle = 'rgba(0,0,0,.28)';
  x.fillRect(2, 0, 10, 5);
  x.fillRect(0, 1, 14, 3);
  return c;
})();
const FOG = (() => {
  const [c, x] = mk(96, 40);
  x.scale(1, 0.42);
  const g = x.createRadialGradient(48, 47.6, 0, 48, 47.6, 46);
  g.addColorStop(0, 'rgba(200,205,225,.35)');
  g.addColorStop(1, 'rgba(200,205,225,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 96, 96 / 0.42);
  return c;
})();
// ---------- acqua, riflessi, nuvole, atmosfera ----------
const [RC, RX] = mk(MAXW * 2, 80);
function drawWater(m, tx0, ty0, tx1, ty1, cx) {
  let wy0 = 1e9,
    wy1 = -1;
  for (let ty = ty0; ty <= ty1; ty++)
    for (let tx = tx0; tx <= tx1; tx++)
      if (m.g[ty * m.w + tx] === 3) {
        ctx.fillStyle = m.get(tx, ty - 1) === 3 ? '#22465e' : '#2b5873';
        ctx.fillRect(tx * 16, ty * 16, 16, 16);
        wy0 = Math.min(wy0, ty);
        wy1 = Math.max(wy1, ty);
      }
  if (wy1 < 0) return;
  const Y0 = wy0 * 16;
  RX.setTransform(1, 0, 0, 1, 0, 0);
  RX.clearRect(0, 0, MAXW * 2, 80);
  RX.setTransform(2, 0, 0, -2, -2 * cx, 2 * Y0);
  for (const o of m.objs) {
    if (!o.img || o.sy < Y0 - 80 || o.sy >= Y0) continue;
    if (o.dx > cx + VW || o.dx + iw(o.img) < cx) continue;
    dImg(RX, o.img, Math.round(o.dx), Math.round(o.dy));
  }
  const ents = [];
  if (G.mode === 'game') ents.push(['player', G.player]);
  for (const n of G.npcs) if (!n.hidden && n.map === m.id) ents.push([n.id, n]);
  for (const [k, e] of ents) {
    if (e.y < Y0 - 60 || e.y >= Y0) continue;
    drawSpr(RX, k, e, Math.round(e.x), Math.round(e.y));
  }
  RX.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.34;
  for (let y = 0; y < 32; y += 2) {
    const off = Math.round(Math.sin(G.t * 2.2 + y * 0.45) * 1.2);
    ctx.drawImage(RC, 0, y * 2, VW * 2, 4, cx + off, Y0 + y, VW, 2);
  }
  ctx.globalAlpha = 1;
  for (let ty = wy0; ty <= wy1; ty++)
    for (let tx = tx0; tx <= tx1; tx++) {
      if (m.g[ty * m.w + tx] !== 3) continue;
      const h = hsh(tx, ty);
      for (let k = 0; k < 2; k++) {
        const px = (((h >> (k * 4)) & 15) + G.t * (4 + k * 3)) % 16,
          py = 5 + ((h >> (8 + k * 3)) % 10),
          a = 0.22 + 0.22 * Math.sin(G.t * 2 + tx * 0.7 + k * 2);
        ctx.fillStyle = `rgba(175,220,245,${a.toFixed(2)})`;
        ctx.fillRect(Math.floor(tx * 16 + px), ty * 16 + py, 3, 1);
      }
    }
}
function drawFoam(m, tx0, tx1) {
  for (const [tx, ty] of m.shore) {
    if (tx < tx0 || tx > tx1) continue;
    for (let i = 0; i < 16; i += 2) {
      const X = tx * 16 + i,
        k = 2 + (hsh(X, 7) % 2),
        a = 0.25 + 0.3 * Math.sin(G.t * 2.6 + X * 0.33);
      if (a <= 0) continue;
      ctx.fillStyle = `rgba(215,235,240,${a.toFixed(2)})`;
      ctx.fillRect(X, ty * 16 + k + 1, 2, 1);
    }
  }
}
const CLOUD = (() => {
  const [c, x] = mk(320, 220);
  srand(808);
  for (let i = 0; i < 8; i++) {
    const bx = rnd() * 320,
      by = rnd() * 220,
      r = 30 + rnd() * 48;
    for (const [ox, oy] of [
      [0, 0],
      [320, 0],
      [-320, 0],
      [0, 220],
      [0, -220]
    ]) {
      const g = x.createRadialGradient(bx + ox, by + oy, 0, bx + ox, by + oy, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.6, 'rgba(0,0,0,.7)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g;
      x.fillRect(bx + ox - r, by + oy - r, r * 2, r * 2);
    }
  }
  return c;
})();
function drawClouds(cx, cy) {
  const wx = G.st.weather || 'sereno',
    a = ({ sereno: 0.1, nuvoloso: 0.2, nebbia: 0.05, pioggia: 0.17 }[wx] || 0.1) * (1 - G.night);
  if (a < 0.01) return;
  ctx.globalAlpha = a;
  const ox = (G.t * 7) % 320,
    oy = (G.t * 2.5) % 220;
  for (let X = Math.floor((cx - ox) / 320) * 320 + ox; X < cx + VW; X += 320)
    for (let Y = Math.floor((cy - oy) / 220) * 220 + oy; Y < cy + VH; Y += 220)
      ctx.drawImage(CLOUD, Math.round(X), Math.round(Y));
  ctx.globalAlpha = 1;
}
function atmosphereBase(m) {
  const st = G.st,
    t = st.time,
    wx = st.weather || 'sereno',
    out = !m.interior;
  let col, a;
  if (t < 8 * 60) {
    col = '#ff9a6a';
    a = 0.32 * clamp((8 * 60 - t) / 90, 0, 1);
  } else if (t < 15 * 60 + 30) {
    col = '#fff0d0';
    a = 0.08;
  } else if (t < 18 * 60) {
    col = '#ffc070';
    a = 0.1 + (0.2 * (t - 930)) / 150;
  } else if (t < 20 * 60 + 30) {
    col = '#ff7a48';
    a = 0.3;
  } else {
    col = '#4a68b0';
    a = 0.28;
  }
  if (!out) a *= 0.4;
  if (G.mode === 'title') {
    col = '#ff8a50';
    a = 0.25;
  }
  if (a > 0.01) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = a;
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, VW, VH);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  if (!out) return;
  if (wx === 'nuvoloso') {
    ctx.fillStyle = 'rgba(80,90,105,.14)';
    ctx.fillRect(0, 0, VW, VH);
  }
  if (wx === 'pioggia') {
    ctx.fillStyle = 'rgba(30,40,60,.3)';
    ctx.fillRect(0, 0, VW, VH);
  }
  if (wx === 'nebbia') {
    ctx.fillStyle = 'rgba(205,210,220,.15)';
    ctx.fillRect(0, 0, VW, VH);
  }
  const ray = (t >= 6 * 60 + 30 && t < 9 * 60) || (t >= 15 * 60 + 30 && t < 18 * 60 + 30);
  if (ray && (wx === 'sereno' || wx === 'nuvoloso') && G.horror < 0.6) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    ctx.rotate(-0.5);
    for (let i = 0; i < 4; i++) {
      const x0 = ((i * 173 + G.t * 4) % (VW + 360)) - 180,
        w = 16 + ((i * 37) % 30),
        g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      g.addColorStop(0, 'rgba(255,220,150,0)');
      g.addColorStop(0.5, `rgba(255,215,140,${wx === 'sereno' ? 0.075 : 0.035})`);
      g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x0, -200, w, VH + 500);
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }
}

// catena: altri file la avvolgono con Ext.avvolgi('atmosphere', …)
function atmosphere(...a) {
  return Ext.catena('atmosphere', atmosphereBase, this, a);
}

// testo a capo entro una larghezza massima (in unità di gioco)
function wrapText(t, maxW) {
  const out = [];
  let line = '';
  for (const w of String(t).split(' ')) {
    const tryL = line ? line + ' ' + w : w;
    if (line && ctx.measureText(tryL).width > maxW) {
      out.push(line);
      line = w;
    } else line = tryL;
  }
  if (line) out.push(line);
  return out;
}
function drawBubbles(m) {
  if (!G.bubbles.length) return;
  ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
  ctx.textAlign = 'center';
  for (const b of G.bubbles) {
    const n = b.n;
    if (n.hidden || n.map !== m.id) continue;
    const L = wrapText(b.t, 132),
      lh = 9,
      tw = Math.ceil(Math.max(...L.map(l => ctx.measureText(l).width))) + 8,
      th = L.length * lh + 2,
      age = (b.max || 2.6) - b.life,
      X = Math.round(n.x),
      bx = Math.round(X - tw / 2),
      by = Math.round(n.y - 42 - th + (age < 0.2 ? (0.2 - age) * 30 : 0));
    const ink = b.w ? '#5a5048' : '#3b1f0e',
      paper = b.w ? '#e8e2d6' : '#fff4dc';
    ctx.globalAlpha = b.life < 0.4 ? b.life / 0.4 : 1;
    ctx.fillStyle = ink;
    if (b.w) {
      // bordo tratteggiato: si bisbiglia
      for (let x = bx - 1; x < bx + tw + 1; x += 2) {
        ctx.fillRect(x, by - 1, 1, 1);
        ctx.fillRect(x, by + th, 1, 1);
      }
      for (let y = by; y < by + th; y += 2) {
        ctx.fillRect(bx - 1, y, 1, 1);
        ctx.fillRect(bx + tw, y, 1, 1);
      }
    } else ctx.fillRect(bx - 1, by - 1, tw + 2, th + 2);
    ctx.fillRect(X - 2, by + th + 1, 5, 1);
    ctx.fillRect(X - 1, by + th + 2, 3, 1);
    ctx.fillStyle = paper;
    ctx.fillRect(bx, by, tw, th);
    ctx.fillRect(X - 1, by + th, 3, 1);
    ctx.fillStyle = ink;
    L.forEach((l, i) => ctx.fillText(l, X, by + 8 + i * lh));
    ctx.globalAlpha = 1;
  }
}
function cropImg(f) {
  const c = f.c;
  if (c.dead) return CROPIMG.dead;
  const s = cropStage(c);
  if (c.t === 'zucca' && s === 3 && H2()) return CROPIMG.zuccaFace;
  return (cropWilt(f) ? CROPW : CROPIMG)[c.t][s];
}
const cropWilt = f => !!(f.c && !f.c.dead && !f.w && (f.c.dry || 0) >= 2 && cropStage(f.c) < 3);
const cropGone = f => !!(f && f.c && (f.c.dead || cropWilt(f)));
const cropLeft = c => Math.max(0, CROPS[c.t].days - c.a);
function cropStatus(f) {
  const c = f.c,
    l = cropLeft(c);
  if (c.dead) return 'secca';
  if (!l) return 'matura!';
  if (cropWilt(f)) return 'appassita';
  return l === 1 ? 'domani' : `${l} notti`;
}
function drawDrop(X, Y, bad) {
  const fl = bad && Math.floor(G.t * 4) % 2;
  ctx.fillStyle = '#14202a';
  ctx.fillRect(X - 2, Y - 2, 5, 6);
  ctx.fillRect(X - 1, Y - 4, 3, 2);
  ctx.fillRect(X, Y - 5, 1, 1);
  ctx.fillStyle = bad ? (fl ? '#ffb060' : '#e0602a') : '#5aa8f0';
  ctx.fillRect(X - 1, Y - 2, 3, 5);
  ctx.fillRect(X, Y - 4, 1, 2);
  ctx.fillStyle = bad ? '#ffe0b0' : '#d8f0ff';
  ctx.fillRect(X - 1, Y - 1, 1, 2);
}
// ---------- il timer unico: lo stesso segno per tutto quello che aspetta ----------
// Il quadrante: un orologino di ferro col quadrante di pergamena; lo spicchio d'oro si riempie come una lancetta
// (p da 0 a 1). Il sigillo: quando è pronto, un tondo d'oro con l'icona di quello che si raccoglie.
// L'etichetta: avvicinandosi, il nome e il tempo che manca. Li usano colture, macchine, apiario e alberi da frutto.
function drawQuadrante(X, Y, p, a = 1) {
  if (a <= 0.03) return;
  X = Math.round(X);
  Y = Math.round(Y);
  ctx.globalAlpha = a;
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 4, Y - 6, 9, 11);
  ctx.fillRect(X - 5, Y - 5, 11, 9);
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(X - 3, Y - 5, 7, 9);
  ctx.fillRect(X - 4, Y - 4, 9, 7);
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(X - 2, Y - 4, 5, 7);
  ctx.fillRect(X - 3, Y - 3, 7, 5);
  // lo spicchio d'oro: si accende pixel per pixel in senso orario a partire dalle 12
  const lim = Math.max(0, Math.min(1, p)) * Math.PI * 2;
  for (let dy = -3; dy <= 2; dy++)
    for (let dx = -3; dx <= 3; dx++) {
      if ((Math.abs(dx) === 3 && (dy === -3 || dy === 2)) || Math.hypot(dx, dy + 0.5) > 3.3) continue;
      let ang = Math.atan2(dx, -(dy + 0.5));
      if (ang < 0) ang += Math.PI * 2;
      if (ang <= lim && (dx || dy + 0.5)) {
        ctx.fillStyle = dy < 0 ? '#d8aa48' : '#c8862e';
        ctx.fillRect(X + dx, Y + dy, 1, 1);
      }
    }
  // la lancetta e il perno
  const hx = Math.round(Math.sin(lim) * 2.4),
    hy = Math.round(-Math.cos(lim) * 2.4);
  ctx.fillStyle = '#1c1418';
  ctx.fillRect(X, Y - 1, 1, 1);
  ctx.fillRect(X + Math.round(hx / 2), Y - 1 + Math.round(hy / 2), 1, 1);
  ctx.fillRect(X + hx, Y - 1 + hy, 1, 1);
  // l'anello per appenderlo
  ctx.fillStyle = '#74726e';
  ctx.fillRect(X, Y - 7, 1, 1);
  ctx.globalAlpha = 1;
}
function drawSigillo(X, Y, icona, a = 1) {
  if (a <= 0.03) return;
  X = Math.round(X);
  Y = Math.round(Y);
  const lu = 0.5 + 0.5 * Math.sin(G.t * 3);
  ctx.globalAlpha = a * (0.25 + 0.25 * lu);
  ctx.fillStyle = '#ffd070';
  ctx.fillRect(X - 7, Y - 6, 15, 13);
  ctx.globalAlpha = a;
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 5, Y - 7, 11, 15);
  ctx.fillRect(X - 6, Y - 6, 13, 13);
  ctx.fillRect(X - 1, Y + 8, 3, 1);
  ctx.fillRect(X, Y + 9, 1, 1);
  ctx.fillStyle = '#8a5a20';
  ctx.fillRect(X - 4, Y - 6, 9, 13);
  ctx.fillRect(X - 5, Y - 5, 11, 11);
  ctx.fillStyle = '#d8aa48';
  ctx.fillRect(X - 4, Y - 5, 9, 11);
  ctx.fillRect(X - 5, Y - 4, 11, 9);
  ctx.fillStyle = '#ffd070';
  ctx.fillRect(X - 3, Y - 6, 7, 1);
  ctx.fillRect(X - 5, Y - 3, 1, 5);
  ctx.fillStyle = '#c8862e';
  ctx.fillRect(X - 3, Y + 6, 7, 1);
  if (icona) ctx.drawImage(icona, X - 4, Y - 4, 9, 9);
  ctx.globalAlpha = 1;
}
// la stellina d'oro delle piante mature viste da lontano: luccica a turno
function drawStellina(X, Y, fase) {
  const u = (G.t * 0.8 + fase * 0.37) % 1,
    on = u < 0.5,
    bob = Math.round(Math.sin(G.t * 3 + fase) * 1);
  X = Math.round(X);
  Y = Math.round(Y) + bob;
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 1, Y - 2, 3, 5);
  ctx.fillRect(X - 2, Y - 1, 5, 3);
  ctx.fillStyle = on ? '#ffd070' : '#c8862e';
  ctx.fillRect(X, Y - 1, 1, 3);
  ctx.fillRect(X - 1, Y, 3, 1);
  if (on) {
    ctx.fillStyle = '#fff6d0';
    ctx.fillRect(X, Y, 1, 1);
  }
}
function drawEtichetta(X, Y, t, brutta) {
  ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
  ctx.textAlign = 'center';
  const w = Math.ceil(ctx.measureText(t).width) + 8,
    bx = Math.round(X - w / 2),
    by = Math.round(Y - 11);
  ctx.fillStyle = '#07040a';
  ctx.fillRect(bx - 1, by - 1, w + 2, 13);
  ctx.fillStyle = 'rgba(28,18,22,.94)';
  ctx.fillRect(bx, by, w, 11);
  ctx.fillStyle = 'rgba(217,166,70,.7)';
  ctx.fillRect(bx, by, w, 1);
  ctx.fillStyle = brutta ? '#ffb0a0' : '#f6e6c0';
  ctx.fillText(t, X, by + 8.5);
}
// ---------- le piante vive ----------
// Le colture non sono immagini ferme: il vento le muove a fasce di pixel (la cima più della base, come in un
// disegno a mano), chi passa le piega e tornano su con una molla, quando crescono di stadio fanno un piccolo
// scatto con qualche scintilla verde (la prima volta che le vedi: così la mattina si vede cos'è cresciuto),
// sussultano quando le semini, le annaffi o le raccogli, e la terra bagnata si scurisce piano.
// Lo stato è solo per il disegno (non si salva): PIANTE, per chiave della zolla in st.farm.
const PIANTE = new Map();
function pianta(k) {
  let s = PIANTE.get(k);
  if (!s) PIANTE.set(k, (s = { ang: 0, vel: 0, t: G.t, stadio: null, popT: -9, scT: -9, wT: -9 }));
  return s;
}
// chiamata da farm.js e dalla serra: tipo = 'semina' | 'acqua' | 'raccolto'
function piantaSussulta(k, tipo) {
  const s = pianta(k);
  if (tipo === 'acqua') {
    s.wT = G.t;
    s.scT = G.t;
  } else if (tipo === 'semina') {
    s.popT = G.t;
    s.stadio = 0;
  } else {
    s.scT = G.t;
    s.vel += 40;
    s.stadio = null; // ricresce: il prossimo stadio si conta da qui
  }
}
// chi passa tra le piante (tu e, in cooperativo, gli altri sulla stessa mappa): posizione e velocità
const MOVENTI = { t: -1, L: [], prec: new Map() };
function moventi(m) {
  if (MOVENTI.t === G.t) return MOVENTI.L;
  const dt = Math.max(1e-3, G.t - (MOVENTI.tp ?? G.t - 0.016)),
    L = [],
    vedi = (id, x, y) => {
      const pr = MOVENTI.prec.get(id),
        vx = pr ? (x - pr[0]) / dt : 0;
      MOVENTI.prec.set(id, [x, y]);
      if (Math.abs(vx) < 400) L.push({ x, y, vx });
    };
  if (G.player && G.mode === 'game') vedi('io', G.player.x, G.player.y);
  for (const pid in G.others || {}) {
    const o = G.others[pid];
    if (o && o.map === m.id) vedi(pid, o.x, o.y);
  }
  MOVENTI.tp = G.t;
  MOVENTI.t = G.t;
  MOVENTI.L = L;
  return L;
}
// e = { img, x, y (casella), k (chiave in st.farm), f (la zolla), m (la mappa) }
function disegnaPianta(e) {
  const { img, x, y, k, f, m } = e,
    c = f.c,
    s = pianta(k),
    dt = Math.min(0.05, Math.max(0, G.t - s.t));
  s.t = G.t;
  // lo stadio: la prima volta si prende com'è; se poi è più avanti, scatta
  const st = c.dead ? -1 : cropStage(c);
  if (s.stadio === null || st < s.stadio) s.stadio = st;
  else if (st > s.stadio) {
    s.stadio = st;
    s.popT = G.t + ((x * 7 + y * 3) % 5) * 0.06; // non tutte insieme: un'onda lungo il campo
    for (let i = 0; i < 5; i++)
      G.parts.push({
        k: 'spark',
        x: x * 16 + 3 + Math.random() * 10,
        y: y * 16 + 4 + Math.random() * 8,
        vx: 0,
        vy: -14,
        t: -i * 0.05,
        life: 0.7,
        c: i % 2 ? '#b8f08a' : '#e8ffc0'
      });
  }
  // chi passa vicino la spinge dall'altra parte, in proporzione a quanto va veloce
  const bx = x * 16 + 8,
    by = y * 16 + 12;
  for (const p of moventi(m)) {
    const ddx = bx - p.x,
      ddy = by - p.y;
    if (Math.abs(ddy) < 9 && Math.abs(ddx) < 12 && Math.abs(p.vx) > 8) {
      const vicino = 1 - Math.abs(ddx) / 12;
      s.vel += Math.sign(p.vx) * vicino * Math.min(1, Math.abs(p.vx) / 60) * 140 * dt * 6;
      if (!s.fruscio || G.t - s.fruscio > 0.5) {
        s.fruscio = G.t;
        if (Math.random() < 0.5) AU.play('passoErba');
      }
    }
  }
  // la molla: torna dritta, smorzata
  s.vel += (-90 * s.ang - 7 * s.vel) * dt;
  s.ang = Math.max(-4, Math.min(4, s.ang + s.vel * dt));
  // il vento: più forte con la pioggia, quasi niente sotto i vetri, lento d'inverno; le secche no
  const forza = m.interior ? 0.25 : G.st.weather === 'pioggia' ? 1.5 : G.st.weather === 'neve' ? 0.4 : 0.8,
    vento = c.dead
      ? 0
      : (Math.sin(G.t * (1.3 + forza * 0.5) + x * 0.7 + y * 0.45) * 0.7 +
          Math.sin(G.t * 3.1 + x * 1.9) * 0.25) *
        forza,
    // il sussulto (acqua, raccolto): un tremito breve
    ts = G.t - s.scT,
    trem = ts >= 0 && ts < 0.35 ? Math.sin(ts * 55) * 1.2 * (1 - ts / 0.35) : 0,
    cima = vento + s.ang + trem;
  const W = iw(img),
    H = ih(img),
    X = x * 16 + Math.round((16 - W) / 2),
    Y = y * 16 + 15 - H,
    top = Math.floor(img.top || 0),
    alto = H - top;
  // lo scatto (semina, nuovo stadio): si schiaccia e si allunga dalla base
  const tp = G.t - s.popT;
  if (tp >= 0 && tp < 0.42) {
    const u = tp / 0.42,
      e2 = Math.sin(u * Math.PI) * (1 - u * 0.5),
      sy = 1 + e2 * 0.22,
      sx = 1 - e2 * 0.12;
    ctx.save();
    ctx.translate(X + W / 2, Y + H);
    ctx.scale(sx, sy);
    ctx.drawImage(img, -W / 2, -H, W, H);
    ctx.restore();
    return;
  }
  if (tp < 0 && tp > -0.5) {
    // in attesa del suo turno nell'onda: un filo più bassa
    ctx.drawImage(img, X, Y + 1, W, H - 1);
    return;
  }
  // a fasce di 3 righe: in cima tutto lo spostamento, ai piedi (la zolla) niente
  if (Math.abs(cima) < 0.5 || alto <= 4) {
    ctx.drawImage(img, X, Y, W, H);
    return;
  }
  const S = img.s || 1,
    piedi = 4;
  for (let r = top; r < H; r += 3) {
    const h = Math.min(3, H - r),
      quota = (H - piedi - (r + h / 2)) / Math.max(1, alto - piedi),
      dx = quota > 0 ? Math.round(cima * Math.pow(quota, 1.3)) : 0;
    ctx.drawImage(img, 0, r * S, img.width, h * S, X + dx, Y + r, W, h);
  }
}
// la terra bagnata si scurisce piano (0.7 s) invece di cambiare di colpo
function disegnaZolla(k, f, x, y, bordi) {
  const s = PIANTE.get(k),
    tw = s ? G.t - s.wT : 9,
    v = hsh(x, y) % 3;
  if (f.w && tw < 0.7) {
    ctx.drawImage(T.zolla[0][v][bordi], x * 16, y * 16, 16, 16);
    ctx.globalAlpha = tw / 0.7;
    ctx.drawImage(T.zolla[1][v][bordi], x * 16, y * 16, 16, 16);
    ctx.globalAlpha = 1;
  } else ctx.drawImage(T.zolla[f.w ? 1 : 0][v][bordi], x * 16, y * 16, 16, 16);
}
const QUADRANTI_VIS = new Map(); // quanto si vede l'orologino di ogni zolla (dissolvenza)
function drawCropMarks(m, tx0, ty0, tx1, ty1) {
  if (m.id !== 'main' || G.mode !== 'game') return;
  const fm = G.st.farm,
    p = G.player,
    bob = Math.round(Math.sin(G.t * 4) * 1.2),
    it = selItem(),
    hold = !!(it && (it.id === 'can' || /^(seed|fert)$/.test(ITEMS[it.id].t)));
  const [fx, fy] = frontTile(),
    calm = !G.cut && !UI.busy();
  let focus = null;
  for (const k in fm) {
    const f = fm[k],
      c = f.c;
    if (!c) continue;
    const [x, y] = k.split(',').map(Number);
    if (x < tx0 - 1 || x > tx1 + 1 || y < ty0 - 1 || y > ty1 + 1) continue;
    const img = cropImg(f),
      X = x * 16 + 8,
      top = y * 16 + 15 - ih(img) + (img.top || 0),
      Y = Math.round(Math.min(top, y * 16 + 6) - 3 + bob);
    if (calm && x === fx && y === fy) focus = { f, X, Y: Y - 8 };
    if (c.dead) continue;
    const d = Math.hypot(p.x - X, p.y - (y * 16 + 8)) / 16;
    if (cropStage(c) === 3) {
      if (Math.random() < 0.05)
        G.parts.push({
          k: 'spark',
          x: x * 16 + 3 + Math.random() * 10,
          y: top + Math.random() * 8,
          vx: 0,
          vy: -10,
          t: 0,
          life: 0.6,
          c: '#fff3a0'
        });
      // da vicino il sigillo d'oro col raccolto; da lontano solo una stellina, per non coprire il campo
      if (d < 2.2 || (x === fx && y === fy)) drawSigillo(X, Y - 5, ICON[c.t]);
      else drawStellina(X, Y - 4, x * 3 + y);
      continue;
    }
    // il quadrante: sulla zolla davanti e su quelle accanto, o su tutte con l'annaffiatoio o i semi in mano
    // visibile o no, con una dissolvenza rapida nel passaggio: a metà opacità diventerebbe una macchia
    const qv = QUADRANTI_VIS.get(G.map.id + ':' + k) || { v: 0, t: G.t },
      voglio = hold || d < 2.2 ? 1 : 0;
    qv.v += (voglio - qv.v) * Math.min(1, (G.t - qv.t) * 12);
    qv.t = G.t;
    QUADRANTI_VIS.set(G.map.id + ':' + k, qv);
    const a = qv.v < 0.05 ? 0 : qv.v * 0.95;
    // il quadrante: le notti passate, e mezza in più se oggi è già bagnata
    const n = CROPS[c.t].days;
    drawQuadrante(X, Y - 3, (c.a + (f.w ? 0.5 : 0)) / n, a);
    if (f.f && a > 0.03) {
      ctx.globalAlpha = a;
      ctx.fillStyle = '#e8c23a';
      ctx.fillRect(X - 6, Y - 9, 2, 2);
      ctx.globalAlpha = 1;
    }
    if (!f.w) drawDrop(a > 0.03 ? X + 9 : X, a > 0.03 ? Y - 3 : Y - 2, cropWilt(f));
  }
  // l'etichetta col nome: solo quando ti fermi davanti (camminando tra i filari sfarfallerebbe)
  if (focus && !p.moving) {
    const c = focus.f.c,
      pronta = c && !c.dead && cropStage(c) === 3;
    drawEtichetta(
      focus.X,
      focus.Y - (pronta ? 6 : 0),
      CROPS[c.t].n + ' · ' + cropStatus(focus.f),
      c.dead || cropWilt(focus.f)
    );
  }
}
// ---------- il raccolto che vola nello zaino ----------
// Quello che raccogli sale dalla pianta, si gonfia un attimo, poi vola con una curva fino alla sua casella della
// barra (o al 🎒, se è in un'altra fila), rimpicciolendo fino alla misura della casella, con una scia di
// scintille; all'arrivo la casella sussulta e si accende d'oro. Senza barra visibile, va verso il personaggio.
// Con o.n (il raccolto dei campi) la casella mostra il nuovo numero solo all'arrivo: popInVolo lo sottrae.
function popInVolo(id) {
  let n = 0;
  for (const o of G.pops || []) if (o.id === id && o.n) n += o.n;
  return n;
}
function popMeta(o) {
  const cv = document.querySelector('canvas'),
    r = cv && cv.getBoundingClientRect();
  if (!r || !r.width || !G.st) return null;
  const inv = G.st.inv,
    i = o.id ? inv.findIndex(s => s && s.id === o.id) : -1,
    base = Math.floor(G.st.sel / 10) * 10;
  let el = null;
  if (i >= base && i < base + 10) el = document.querySelectorAll('#hotbar .slot')[i - base];
  if (!el || !el.offsetWidth) el = document.getElementById('bInv');
  if (!el || !el.offsetWidth || UI.busy()) return null;
  const q = el.getBoundingClientRect(),
    k = VW / r.width;
  return {
    el,
    x: G.cam.x + (q.left + q.width / 2 - r.left) * k,
    y: G.cam.y + (q.top + q.height / 2 - r.top) * k,
    lato: Math.max(8, q.width * k * 0.62)
  };
}
function drawPops() {
  const P = G.pops;
  if (!P || !P.length) return;
  const pl = G.player,
    SALE = 0.32,
    VOLA = 0.55;
  for (let i = P.length - 1; i >= 0; i--) {
    const o = P[i],
      t = G.t - o.t0;
    if (t < SALE) {
      // sale e si gonfia, con un piccolo dondolio
      const u = t / SALE,
        e = 1 - Math.pow(1 - u, 3),
        sc = 1 + Math.sin(u * Math.PI) * 0.3,
        L = 16 * sc,
        dond = Math.sin(u * Math.PI * 2) * 0.25;
      ctx.save();
      ctx.translate(Math.round(o.x), Math.round(o.y - e * 14));
      ctx.rotate(dond);
      ctx.drawImage(o.img, -L / 2, -L / 2, L, L);
      ctx.restore();
      continue;
    }
    const meta = popMeta(o) || { x: pl.x, y: pl.y - 26, lato: 10, el: null },
      u = Math.min(1, (t - SALE) / VOLA),
      e = u * u * (3 - 2 * u),
      x0 = o.x,
      y0 = o.y - 14,
      // la curva: un arco che sale prima di scendere verso la casella
      mx = (x0 + meta.x) / 2,
      my = Math.min(y0, meta.y) - 30,
      x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * mx + e * e * meta.x,
      y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * my + e * e * meta.y,
      L = 16 + (meta.lato - 16) * e;
    if (u >= 1) {
      P.splice(i, 1);
      if (o.n) UI.hotbar();
      if (meta.el) {
        meta.el.classList.remove('arriva');
        void meta.el.offsetWidth; // fa ripartire l'animazione se arriva un altro
        meta.el.classList.add('arriva');
        clearTimeout(meta.el._arrT);
        meta.el._arrT = setTimeout(() => meta.el.classList.remove('arriva'), 450);
      }
      continue;
    }
    if (Math.random() < 0.5)
      G.parts.push({
        k: 'spark',
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: 0,
        vy: 4,
        t: 0,
        life: 0.35,
        c: Math.random() < 0.5 ? '#ffe27a' : '#fff6d0'
      });
    ctx.drawImage(o.img, Math.round(x - L / 2), Math.round(y - L / 2), Math.round(L), Math.round(L));
  }
}
function drawPostMarks(m) {
  const F = G.st.flags;
  if (m.id !== 'main' || !F.gotPaint || G.mode !== 'game') return;
  for (const o of m.objs) {
    if (o.kind !== 'post' || F.posts[o.pi]) continue;
    const X = o.tx * 16 + 8,
      Y = o.ty * 16 - 16 + Math.round(Math.sin(G.t * 4) * 2);
    ctx.fillStyle = '#3b1f0e';
    ctx.fillRect(X - 4, Y - 1, 9, 4);
    ctx.fillRect(X - 3, Y + 3, 7, 1);
    ctx.fillRect(X - 2, Y + 4, 5, 1);
    ctx.fillRect(X - 1, Y + 5, 3, 1);
    ctx.fillStyle = PAL.yel;
    ctx.fillRect(X - 3, Y, 7, 2);
    ctx.fillRect(X - 2, Y + 2, 5, 1);
    ctx.fillRect(X - 1, Y + 3, 3, 1);
    ctx.fillRect(X, Y + 4, 1, 1);
  }
}
function drawSprite(key, e) {
  ctx.drawImage(SHADOW, Math.round(e.x - 7), Math.round(e.y - 3));
  drawSpr(ctx, key, e, Math.round(e.x), Math.round(e.y));
}
function darkLevelBase() {
  const st = G.st,
    t = st.time,
    m = G.map;
  let d = 0;
  if (t < 390) d = lerp(0.55, 0, (t - 360) / 30);
  else if (t < 1050) d = 0;
  else if (t < 1230) d = ((t - 1050) / 180) * 0.8;
  else d = 0.82;
  G.night = clamp(d / 0.8, 0, 1);
  if (m.interior) {
    if (m.id === 'wood') d = 0.93;
    else if (m.id === 'barn') d = Math.max(0.72, d);
    else d = d * 0.5 + 0.06;
  }
  d += G.horror * 0.07;
  return clamp(d, 0, 0.94);
}

// catena: altri file la avvolgono con Ext.avvolgi('darkLevel', …)
function darkLevel(...a) {
  return Ext.catena('darkLevel', darkLevelBase, this, a);
}

function render() {
  const m = G.map;
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (!m || !G.st) return;
  ctx.setTransform(RS * ZOOM, 0, 0, RS * ZOOM, 0, 0);
  const sx = (Math.random() - 0.5) * G.shake * 2,
    sy = (Math.random() - 0.5) * G.shake * 2;
  G.shake *= 0.9;
  const cx = Math.round(G.cam.x + sx),
    cy = Math.round(G.cam.y + sy);
  ctx.save();
  ctx.translate(-cx, -cy);
  const tx0 = Math.max(0, Math.floor(cx / 16)),
    ty0 = Math.max(0, Math.floor(cy / 16)),
    tx1 = Math.min(m.w - 1, Math.floor((cx + VW) / 16)),
    ty1 = Math.min(m.h - 1, Math.floor((cy + VH) / 16));
  if (m.water) drawWater(m, tx0, ty0, tx1, ty1, cx);
  {
    const gw = m.ground.width,
      gh = m.ground.height,
      sx0 = Math.max(0, cx),
      sy0 = Math.max(0, cy),
      sx1 = Math.min(gw, cx + VW),
      sy1 = Math.min(gh, cy + VH);
    if (sx1 > sx0 && sy1 > sy0)
      ctx.drawImage(
        m.ground,
        sx0 * 2,
        sy0 * 2,
        (sx1 - sx0) * 2,
        (sy1 - sy0) * 2,
        sx0,
        sy0,
        sx1 - sx0,
        sy1 - sy0
      );
  }
  if (m.water) drawFoam(m, tx0, tx1);
  // campi
  if (m.id === 'main') {
    const fm = G.st.farm;
    for (const k in fm) {
      const [x, y] = k.split(',').map(Number);
      if (x < tx0 - 1 || x > tx1 + 1 || y < ty0 - 1 || y > ty1 + 1) continue;
      const f = fm[k];
      const vicina = (dx, dy) => (fm[x + dx + ',' + (y + dy)] ? 1 : 0),
        bordi = vicina(0, -1) | (vicina(1, 0) << 1) | (vicina(0, 1) << 2) | (vicina(-1, 0) << 3);
      disegnaZolla(k, f, x, y, bordi);
      if (f.f)
        for (let i = 0; i < 7; i++) {
          const h = hsh(x * 7 + i, y * 13 + i);
          ctx.fillStyle = i % 3 ? 'rgba(24,14,6,.6)' : 'rgba(214,176,90,.75)';
          ctx.fillRect(x * 16 + 3 + (h % 10), y * 16 + 3 + ((h >> 5) % 10), 1, 1);
        }
    }
  }
  disegnaOmbreVive(m, cx, cy);
  // punto di estensione: sopra il terreno, sotto oggetti e personaggi (atmosfera.js: la nebbia che striscia a terra)
  Ext.run('sopraTerreno', m, cx, cy);
  drawPrints(m);
  drawFlowers(m, cx, cy);
  drawAim();
  // oggetti + personaggi ordinati
  const list = [];
  for (const o of m.objs) {
    if (!o.img) continue;
    if (o.dx > cx + VW + 8 || o.dx + iw(o.img) < cx - 8 || o.dy > cy + VH + 8 || o.dy + ih(o.img) < cy - 8)
      continue;
    list.push(o);
  }
  if (m.id === 'main') {
    const fm = G.st.farm;
    for (const k in fm) {
      const f = fm[k];
      if (!f.c) continue;
      const [x, y] = k.split(',').map(Number);
      if (x < tx0 - 1 || x > tx1 + 1 || y < ty0 - 1 || y > ty1 + 1) continue;
      const img = cropImg(f);
      list.push({ img, x, y, k, f, m, sy: y * 16 + 6, crop: f, draw: disegnaPianta });
    }
  }
  for (const n of G.npcs) if (!n.hidden && n.map === m.id) list.push({ npc: n, sy: n.y });
  if (G.mode === 'game') list.push({ pl: 1, sy: G.player.y });
  if (G.horse.on && m.id === 'main') list.push({ horse: 1, sy: G.horse.y });
  if (G.prey && m.id === 'main') list.push({ prey: 1, sy: G.prey.y });
  if (G.coach && m.id === 'main') list.push({ coach: 1, sy: G.coach.y });
  if (m.id === 'main') for (const s of G.shadows) list.push({ sh: s, sy: s.y });
  for (const pid in G.others) {
    const o = G.others[pid];
    if (o.map === m.id) list.push({ other: o, sy: o.y });
  }
  if (m.id === 'main' && G.fanimals) for (const a of G.fanimals) list.push({ fa: a, sy: a.y });
  if (m.id === 'main' && G.amb) {
    if (G.amb.deer && G.amb.deer.on) list.push({ deer: G.amb.deer, sy: G.amb.deer.y });
    if (G.night > 0.45) list.push({ hog: G.amb.hog, sy: G.amb.hog.y });
  }
  if (m.id === 'main' && G.critters)
    for (const c of G.critters)
      if (c.x > cx - 30 && c.x < cx + VW + 30 && c.y > cy - 20 && c.y < cy + VH + 40)
        list.push({
          crit: c,
          sy: c.k === 'crow' && c.st !== 'perch' ? 9e9 : c.k === 'duck' ? 43 * 16 + 2 : c.y
        });
  // punto di estensione: altri file aggiungono cose da disegnare in ordine ({ sy, draw() } o oggetti con disegna)
  Ext.run('listaMondo', list, m, cx, cy);
  list.sort((a, b) => a.sy - b.sy);
  for (const e of list) {
    if (e.draw) e.draw(e);
    else if (e.crit) drawCritter(e.crit);
    else if (e.pl) {
      if (G.erede) drawEredeHorse();
      else {
        const [ox, oy] = swingOffset();
        G.player.x += ox;
        G.player.y += oy;
        if (swingK() >= 0 && ICON[G.toolA.id]) disegnaPresa();
        else drawSprite('player', G.player);
        G.player.x -= ox;
        G.player.y -= oy;
      }
    } else if (e.prey) drawSprite('prey', G.prey);
    else if (e.coach) drawCoach();
    else if (e.deer) drawDeer(e.deer);
    else if (e.hog) drawHog(e.hog);
    else if (e.fa) drawFarmAnimal(e.fa);
    else if (e.other) drawOther(e.other);
    else if (e.sh) drawShadow(e.sh);
    else if (e.npc) {
      drawSprite(e.npc.id, e.npc);
      favorMark(e.npc);
    } else if (e.horse) {
      const h = G.horse,
        img = IMG.horse[Math.floor(h.anim / 2) % IMG.horse.length];
      ctx.drawImage(SHADOW, h.x - 12, h.y - 3, 24, 6);
      if (h.dir === 1) {
        ctx.save();
        ctx.translate(Math.round(h.x), 0);
        ctx.scale(-1, 1);
        dImg(ctx, img, -22, Math.round(h.y - 38));
        ctx.restore();
      } else dImg(ctx, img, Math.round(h.x - 22), Math.round(h.y - 38));
    } else if (e.disegna) e.disegna(e);
    else if (e.img.canopyH) {
      const im = e.img,
        ch = im.canopyH,
        S2 = im.s || 1,
        IW = iw(im),
        IH = ih(im),
        wind = G.st.weather === 'pioggia' ? 1 : 0.25,
        sw = Math.round(
          Math.sin(G.t * (1.1 + wind) + e.tx * 0.9 + e.ty * 0.4) * (0.65 + wind) + hitShake(e) * 1.5
        );
      ctx.drawImage(im, 0, 0, im.width, ch * S2, Math.round(e.dx) + sw, Math.round(e.dy), IW, ch);
      ctx.drawImage(
        im,
        0,
        ch * S2,
        im.width,
        im.height - ch * S2,
        Math.round(e.dx),
        Math.round(e.dy) + ch,
        IW,
        IH - ch
      );
    } else {
      let img = e.img;
      if (e.anim === 'fire') img = IMG.fire[Math.floor(G.t * 5) % 2];
      if (e.frames) img = e.frames[Math.floor(G.t * 3 + e.tx) % e.frames.length];
      if (e.win && G.night > 0.5) img = IMG.windowN;
      {
        const sh = hitShake(e),
          sc = popScale(e);
        if (sc !== 1) {
          ctx.save();
          ctx.translate(e.dx + iw(img) / 2, e.dy + ih(img));
          ctx.scale(sc, sc);
          dImg(ctx, img, Math.round(-iw(img) / 2), Math.round(-ih(img)));
          ctx.restore();
        } else dImg(ctx, img, Math.round(e.dx + sh), Math.round(e.dy));
      }
      if (e.kind === 'bld' && G.night > 0.25 && e.img.lights && winLit(e.key)) {
        const k = clamp((G.night - 0.25) * 3, 0, 1);
        for (const [wx, wy] of e.img.lights) {
          const X = Math.round(e.dx) + 1 + wx,
            Y = Math.round(e.dy) + wy;
          ctx.fillStyle = `rgba(255,196,110,${(0.9 * k).toFixed(2)})`;
          ctx.fillRect(X, Y, 10, 10);
          ctx.fillStyle = `rgba(255,236,170,${(0.8 * k).toFixed(2)})`;
          ctx.fillRect(X + 1, Y + 1, 3, 3);
          ctx.fillStyle = `rgba(90,50,20,${k.toFixed(2)})`;
          ctx.fillRect(X + 4, Y, 2, 10);
          ctx.fillRect(X, Y + 4, 10, 2);
        }
      }
    }
  }
  if (!m.interior && G.mode !== 'boot') drawClouds(cx, cy);
  drawPostMarks(m);
  drawWorldExtras(m);
  drawPops(); // il raccolto che vola nello zaino: su ogni mappa
  drawLand(m);
  drawMachines(m);
  drawFest(m);
  drawCropMarks(m, tx0, ty0, tx1, ty1);
  // particelle
  drawParts();
  // testi fluttuanti
  ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
  ctx.textAlign = 'center';
  for (const f of G.floats) {
    ctx.fillStyle = '#000';
    ctx.fillText(f.t, f.x + 1, f.y + 1);
    ctx.fillStyle = f.c || '#fff4c0';
    ctx.fillText(f.t, f.x, f.y);
  }
  ctx.restore();
  // luce
  const d = G.mode === 'title' ? 0.5 : darkLevel();
  if (d > 0.01) {
    const L = [];
    const t = G.st.time;
    for (const l of m.lights) {
      if (l.win && !(t >= 1020 && t < 1320 && winLit(l.k))) continue;
      if (l.lamp && !lampOn(l.li, t)) continue;
      if (l.festa && G.festaDark) continue;
      if (l.barn && G.st.flags.barnDark) continue;
      const fl = l.fire ? 1 + Math.sin(G.t * 9 + l.x) * 0.06 : 1;
      L.push({ x: l.x - cx, y: l.y - cy, r: l.r * fl, warm: 1, red: l.red });
    }
    if (d > 0.25 && G.mode === 'game')
      L.push({
        x: G.player.x - cx,
        y: G.player.y - 12 - cy,
        r:
          (m.id === 'wood' ? 42 : m.id === 'barn' && G.st.flags.barnDark ? 22 : 48) + Math.sin(G.t * 7) * 1.5,
        warm: 1,
        a: 0.95
      });
    if (G.horse.on) L.push({ x: G.horse.x - cx + 8, y: G.horse.y - 34 - cy, r: 22, red: 1 });
    if (m.id === 'main' && H2()) {
      const fm = G.st.farm;
      for (const k in fm) {
        const f = fm[k];
        if (f.c && f.c.t === 'zucca' && cropStage(f.c) === 3) {
          const [x, y] = k.split(',').map(Number);
          L.push({ x: x * 16 + 8 - cx, y: y * 16 + 6 - cy, r: 16, red: 1 });
        }
      }
    }
    LX.globalCompositeOperation = 'source-over';
    LX.clearRect(0, 0, VW, VH);
    // fuori, la notte di Hollowmere è verde-blu come l'acqua di uno stagno; dentro casa resta calda
    LX.fillStyle = m.interior ? `rgba(10,8,30,${d})` : `rgba(0,20,30,${d})`;
    LX.fillRect(0, 0, VW, VH);
    LX.globalCompositeOperation = 'destination-out';
    for (const l of L) {
      const g = LX.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      g.addColorStop(0, `rgba(0,0,0,${l.a || 1})`);
      g.addColorStop(0.55, `rgba(0,0,0,${(l.a || 1) * 0.7})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      LX.fillStyle = g;
      LX.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
    }
    ctx.drawImage(LC, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of L) {
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      g.addColorStop(
        0,
        l.red ? 'rgba(200,30,10,.35)' : m.interior ? 'rgba(255,150,60,.16)' : 'rgba(255,150,50,.3)'
      );
      if (!m.interior) g.addColorStop(0.5, l.red ? 'rgba(120,15,5,.12)' : 'rgba(220,110,30,.1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
    }
    // fuori, la luce di lanterne e finestre tinge d'ambra quello che tocca
    if (!m.interior) {
      ctx.globalCompositeOperation = 'overlay';
      for (const l of L) {
        if (l.red) continue;
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        g.addColorStop(0, `rgba(255,140,40,${(0.6 * Math.min(1, d * 1.4)).toFixed(2)})`);
        g.addColorStop(1, 'rgba(255,140,40,0)');
        ctx.fillStyle = g;
        ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.translate(-cx, -cy);
  drawAmbTop(m);
  ctx.restore();
  atmosphere(m);
  // punto di estensione: la gradazione dei colori sopra tutto il mondo, sotto fumetti e interfaccia (atmosfera.js)
  Ext.run('gradazione', m, cx, cy);
  ctx.save();
  ctx.translate(-cx, -cy);
  drawBubbles(m);
  drawChatBubbles();
  drawPrompt();
  ctx.restore();
  // nebbia
  const fogA = m.interior
    ? 0
    : Math.max(
        G.night > 0.4 || G.horror > 0.4 ? clamp(G.night * 0.6 + G.horror * 0.4, 0, 0.8) : 0,
        G.st.weather === 'nebbia' ? 0.6 : 0,
        G.st.time < 8 * 60 && G.st.time >= 6 * 60 ? 0.3 : 0,
        G.st.weather === 'pioggia' ? 0.25 : 0
      );
  if (fogA > 0) {
    ctx.globalAlpha = fogA;
    for (let i = 0; i < 9; i++) {
      const fx = ((i * 137 + G.t * (6 + i)) % (VW + 120)) - 100,
        fy = ((i * 61) % VH) + Math.sin(G.t * 0.3 + i) * 8;
      ctx.drawImage(FOG, fx, fy, 180, 70);
    }
    ctx.globalAlpha = 1;
  }
  if (G.redTint > 0) {
    ctx.fillStyle = `rgba(130,0,0,${(G.redTint * (0.85 + 0.15 * Math.sin(G.t * 6))).toFixed(2)})`;
    ctx.fillRect(0, 0, VW, VH);
  }
  drawGuide();
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  postFX();
}
// una finestra del paese è accesa se in casa c'è qualcuno (OCC, aggiornato in grafica.js) e non è ancora ora
// di dormire; la casa del giocatore no (le sue luci le gestisce la casa stessa)
function winLit(k) {
  if (k === 'house' || !OCC.has(k)) return false;
  const t = G.st.time;
  return t < (BEDTIME[k] || 22 * 60) && t >= 5 * 60 + 30;
}
function postFX() {
  const Hh = G.horror;
  if (Hh > 0.05) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = `rgba(128,128,128,${clamp(Hh * 0.85, 0, 0.85)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (H2() && G.mode === 'game') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255,235,225,1)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = clamp(0.25 + Hh * 0.6 + (G.chase ? 0.3 : 0), 0, 1);
  ctx.drawImage(IMG.vignette, (W - MAXW) / 2, 0);
  ctx.globalAlpha = 1;
  if (Hh > 0.15 || G.chase) {
    ctx.globalAlpha = clamp(Hh * 0.45, 0.1, 0.4);
    ctx.drawImage(IMG.grain[Math.floor(G.t * 24) % 4], 0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  if ((Hh > 0.45 && Math.random() < Hh * 0.03) || G.glitch > 0) {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const y = (Math.random() * H) | 0,
        h = (2 + Math.random() * 14) | 0,
        dx = ((Math.random() - 0.5) * 24) | 0;
      ctx.drawImage(cv, 0, y * RS, W * RS, h * RS, dx, y, W, h);
    }
    if (G.glitch > 0) G.glitch--;
  }
  if (G.scare > 0) {
    const a = Math.min(1, G.scare);
    ctx.fillStyle = `rgba(120,0,0,${a * 0.7})`;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = a;
    if (IMG.spavento) {
      // l'illustrazione dello spavento: riempie lo schermo e si avvicina mentre svanisce
      const im = IMG.spavento,
        s = ((H * 0.98) / im.height) * (1 + (1 - a) * 0.25);
      ctx.translate(W / 2 + (Math.random() - 0.5) * 3, H / 2 + (Math.random() - 0.5) * 3);
      ctx.scale(s, s);
      ctx.drawImage(im, -im.width / 2, -im.height / 2);
    } else {
      const img = IMG.horse[Math.floor(G.t * 20) % IMG.horse.length],
        s = 5 + (1 - a) * 2 + Math.random() * 0.4;
      ctx.translate(W / 2, H / 2 + 20);
      ctx.scale(s, s);
      dImg(ctx, img, -22 + (Math.random() - 0.5), -26);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.drawImage(IMG.grain[Math.floor(Math.random() * 4)], 0, 0, W, H);
  }
  if (G.flash.a > 0) {
    ctx.fillStyle = G.flash.c;
    ctx.globalAlpha = G.flash.a;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}
// ---------- particelle ----------
function updPartsBase(dt) {
  const m = G.map;
  if (!m) return;
  if (!m.interior && G.mode !== 'boot') {
    if (G.night < 0.5 && G.horror < 0.6 && leafSeason() && Math.random() < dt * 5)
      G.parts.push({
        k: 'leaf',
        x: G.cam.x + Math.random() * VW * 1.2,
        y: G.cam.y - 6,
        vx: -8 - Math.random() * 10,
        vy: 12 + Math.random() * 10,
        t: 0,
        life: 12,
        c: leafCol(),
        ph: Math.random() * 6
      });
    if (G.night > 0.3 && G.horror < 0.5 && Math.random() < dt * 3)
      G.parts.push({
        k: 'fly',
        x: G.cam.x + Math.random() * VW,
        y: G.cam.y + Math.random() * VH,
        vx: 0,
        vy: 0,
        t: 0,
        life: 4,
        ph: Math.random() * 6
      });
    if (G.horror > 0.5 && Math.random() < dt * 4)
      G.parts.push({
        k: 'ash',
        x: G.cam.x + Math.random() * VW,
        y: G.cam.y - 4,
        vx: (Math.random() - 0.5) * 6,
        vy: 10 + Math.random() * 8,
        t: 0,
        life: 14
      });
    const wx = G.st && G.st.weather;
    if (wx === 'pioggia') {
      const n = Math.floor(dt * 140 + Math.random());
      for (let i = 0; i < n; i++)
        G.parts.push({
          k: 'rain',
          x: G.cam.x + Math.random() * (VW + 60),
          y: G.cam.y + Math.random() * VH - 50,
          vx: -40,
          vy: 300,
          t: 0,
          life: 0.12 + Math.random() * 0.25
        });
    }
    if (G.night < 0.3 && G.horror < 0.5 && wx !== 'pioggia' && Math.random() < dt * 0.05) {
      const dir = Math.random() < 0.5 ? 1 : -1,
        y0 = G.cam.y + 15 + Math.random() * VH * 0.5,
        n = 3 + ((Math.random() * 4) | 0);
      for (let i = 0; i < n; i++)
        G.parts.push({
          k: 'bird',
          x: dir > 0 ? G.cam.x - 20 - i * 11 : G.cam.x + VW + 20 + i * 11,
          y: y0 + (i % 2) * 7 + i * 2,
          vx: dir * (44 + Math.random() * 8),
          vy: -2,
          t: 0,
          life: 22,
          ph: Math.random() * 6
        });
    }
    if (
      G.night < 0.4 &&
      G.horror < 0.5 &&
      wx !== 'pioggia' &&
      Math.random() < dt * 0.5 &&
      G.parts.filter(p => p.k === 'fly2').length < 6
    )
      G.parts.push({
        k: 'fly2',
        x: G.cam.x + Math.random() * VW,
        y: G.cam.y + Math.random() * VH,
        vx: (Math.random() - 0.5) * 12,
        vy: 0,
        t: 0,
        life: 9,
        ph: Math.random() * 6,
        c: ['#fff8e0', '#f3e27a', '#e0c8f0'][(Math.random() * 3) | 0]
      });
    for (const s of m.smokes) {
      s.a = (s.a || 0) + dt;
      if (s.a > 0.32) {
        s.a = 0;
        G.parts.push({
          k: 'smoke',
          x: s.x + (Math.random() * 2 - 1),
          y: s.y,
          vx: 5 + Math.random() * 4 + (wx === 'pioggia' ? 8 : 0),
          vy: -9 - Math.random() * 4,
          t: 0,
          life: 3.2 + Math.random()
        });
      }
    }
  }
  for (const p of G.parts) {
    p.t += dt;
    if (p.k === 'leaf') {
      p.x += (p.vx + Math.sin(p.t * 2 + p.ph) * 14) * dt;
      p.y += p.vy * dt;
    } else if (p.k === 'fly') {
      p.x += Math.sin(p.t * 1.3 + p.ph) * 10 * dt;
      p.y += Math.cos(p.t * 1.7 + p.ph) * 8 * dt;
    } else if (p.k === 'dust' || p.k === 'water' || p.k === 'spark') {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
    } else if (p.k === 'fly2') {
      p.x += (p.vx + Math.sin(p.t * 1.7 + p.ph) * 16) * dt;
      p.y += Math.cos(p.t * 2.3 + p.ph) * 12 * dt;
    } else if (p.k === 'bird') {
      p.x += p.vx * dt;
      p.y += Math.sin(p.t * 2 + p.ph) * 5 * dt;
    } else {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    if (p.k === 'rain' && p.t >= p.life)
      G.parts.push({ k: 'splash', x: p.x, y: p.y, vx: 0, vy: 0, t: 0, life: 0.22 });
  }
  G.parts = G.parts.filter(p => p.t < p.life);
  if (G.parts.length > 420) G.parts.splice(0, G.parts.length - 420);
  for (const f of G.floats) {
    f.y -= dt * (f.vy || 10);
    f.t2 = (f.t2 || 0) + dt;
  }
  G.floats = G.floats.filter(f => f.t2 < (f.life || 1.4));
}

// catena: altri file la avvolgono con Ext.avvolgi('updParts', …)
function updParts(...a) {
  return Ext.catena('updParts', updPartsBase, this, a);
}

function drawPartsBase() {
  for (const p of G.parts) {
    if (p.k === 'leaf') {
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x | 0, p.y | 0, 2, 1);
      ctx.fillRect((p.x | 0) + 1, (p.y | 0) + 1, 1, 1);
    } else if (p.k === 'fly') {
      const a = 0.5 + Math.sin(p.t * 6 + p.ph) * 0.5;
      ctx.fillStyle = `rgba(255,240,120,${a})`;
      ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
      ctx.fillStyle = `rgba(255,240,120,${a * 0.3})`;
      ctx.fillRect((p.x | 0) - 1, (p.y | 0) - 1, 3, 3);
    } else if (p.k === 'ash') {
      ctx.fillStyle = 'rgba(60,50,50,.7)';
      ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
    } else if (p.k === 'dust') {
      ctx.fillStyle = '#7b4f2c';
      ctx.fillRect(p.x | 0, p.y | 0, 2, 2);
    } else if (p.k === 'water') {
      ctx.fillStyle = '#9ad0f0';
      ctx.fillRect(p.x | 0, p.y | 0, 1, 2);
    } else if (p.k === 'spark') {
      ctx.fillStyle = p.c || '#ffe27a';
      ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
    } else if (p.k === 'rain') {
      ctx.fillStyle = 'rgba(190,210,240,.75)';
      ctx.fillRect(p.x | 0, p.y | 0, 1, 6);
    } else if (p.k === 'splash') {
      const r = 1 + p.t * 12;
      ctx.fillStyle = 'rgba(200,220,245,.5)';
      ctx.fillRect((p.x - r) | 0, p.y | 0, 1, 1);
      ctx.fillRect((p.x + r) | 0, p.y | 0, 1, 1);
    } else if (p.k === 'smoke') {
      const r = 1.5 + p.t * 1.3,
        a = 0.3 * (1 - p.t / p.life);
      ctx.fillStyle = G.night > 0.5 ? `rgba(90,90,100,${a.toFixed(2)})` : `rgba(215,210,205,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 7);
      ctx.fill();
    } else if (p.k === 'puff') {
      const r = 1 + p.t * 3,
        a = 0.35 * (1 - p.t / p.life);
      ctx.fillStyle = `rgba(200,170,120,${a.toFixed(2)})`;
      ctx.fillRect((p.x - r) | 0, (p.y - r / 2) | 0, Math.ceil(r * 2), Math.ceil(r));
    } else if (p.k === 'bird') {
      const X = p.x | 0,
        Y = p.y | 0,
        up = Math.floor(p.t * 8 + p.ph) % 2;
      ctx.fillStyle = '#2a2420';
      ctx.fillRect(X - 1, Y, 3, 1);
      ctx.fillRect(X - 2, Y + (up ? -1 : 1), 1, 1);
      ctx.fillRect(X + 2, Y + (up ? -1 : 1), 1, 1);
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      ctx.fillRect(X - 1, Y + 40, 3, 1);
    } else if (p.k === 'fly2') {
      const X = p.x | 0,
        Y = p.y | 0,
        op = Math.floor(p.t * 10 + p.ph) % 2;
      ctx.fillStyle = p.c;
      if (op) {
        ctx.fillRect(X - 1, Y, 1, 1);
        ctx.fillRect(X + 1, Y, 1, 1);
      } else ctx.fillRect(X, Y - 1, 1, 1);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(X, Y, 1, 1);
    }
  }
}

// catena: altri file la avvolgono con Ext.avvolgi('drawParts', …)
function drawParts(...a) {
  return Ext.catena('drawParts', drawPartsBase, this, a);
}

function burst(k, x, y, n, c) {
  for (let i = 0; i < n; i++)
    G.parts.push({
      k,
      x,
      y,
      vx: (Math.random() - 0.5) * 50,
      vy: -20 - Math.random() * 40,
      t: 0,
      life: 0.6,
      c
    });
}
function floatText(t, x, y, c, life) {
  G.floats.push({ t, x, y, c, life });
}
