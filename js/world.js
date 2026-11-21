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
function buildHouse(st) {
  const HS = houseSize(st),
    HW = HS.w,
    HH = HS.h;
  const m = new GMap('house', HW, HH, { interior: 1, name: 'Casa' });
  m.fill(0, 0, HW - 1, 0, 8);
  m.fill(0, 1, HW - 1, 1, 9);
  m.fill(0, 2, HW - 1, HH - 1, 6);
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
  m.add(OB('window', 8, 1, IMG.window, { act: 'window', win: 1, lift: -6 }));
  m.add(OB('window', 2, 1, IMG.window, { act: 'window', win: 1, lift: -6 }));
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
function rebuildMaps() {
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
function buildGround(m) {
  const gw = m.w * 16,
    gh = m.h * 16;
  const [c, x] = mk2(gw, gh);
  m.ground = c;
  m.water = false;
  m.shore = [];
  for (let ty = 0; ty < m.h; ty++)
    for (let tx = 0; tx < m.w; tx++) {
      const g = m.g[ty * m.w + tx];
      if (g === 3) {
        m.water = true;
        continue;
      }
      const arr = T[GT[g]];
      if (arr) x.drawImage(arr[hsh(tx, ty) % arr.length], tx * 16, ty * 16, 16, 16);
    }
  const isG = (tx, ty) => {
    const g = m.get(tx, ty);
    return g === 1 || g === 12;
  };
  for (let ty = 0; ty < m.h; ty++)
    for (let tx = 0; tx < m.w; tx++) {
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
  if (m.water)
    for (let ty = 0; ty < m.h; ty++)
      for (let tx = 0; tx < m.w; tx++) {
        if (m.get(tx, ty) !== 3) continue;
        const X0 = tx * 16,
          Y0 = ty * 16,
          n = m.get(tx, ty - 1),
          s = m.get(tx, ty + 1);
        if (n !== 3 && n !== 4) {
          m.shore.push([tx, ty]);
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
  x.globalCompositeOperation = 'source-atop';
  if (!m.interior) {
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
    if (!s) continue;
    x.beginPath();
    x.ellipse(o.dx + iw(o.img) / 2 + s[2], o.sy - 1, s[0], s[1], 0, 0, Math.PI * 2);
    x.fill();
  }
  x.globalCompositeOperation = 'source-over';
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
function updatePlayer(dt) {
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
    const sp = p.speed * (G.st.energy <= 0 ? 0.6 : 1) * (G.chase ? 1.1 : 1) * dt;
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
      AU.play('step');
      addPrint(p);
      const [ux, uy] = ptile(p),
        ug = m.get(ux, uy);
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
function updateHorse(dt) {
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
function spawnHorse(tx, ty, speed) {
  const h = G.horse;
  h.on = true;
  setPos(h, tx, ty);
  h.path = [];
  h.rp = 0;
  h.speed = speed || 60;
  AU.play('sting');
  G.chase = true;
  AU.setMode('tense');
}
// ---------- camera ----------
function updateCam(dt) {
  const m = G.map,
    p = G.player;
  let cx = p.x - W / 2,
    cy = p.y - 12 - H / 2;
  const mw = m.w * 16,
    mh = m.h * 16;
  cx = mw <= W ? (mw - W) / 2 : clamp(cx, 0, mw - W);
  cy = mh <= H ? (mh - H) / 2 : clamp(cy, 0, mh - H);
  G.cam.x = cx;
  G.cam.y = cy;
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
    if (o.dx > cx + W || o.dx + iw(o.img) < cx) continue;
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
    ctx.drawImage(RC, 0, y * 2, W * 2, 4, cx + off, Y0 + y, W, 2);
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
  for (let X = Math.floor((cx - ox) / 320) * 320 + ox; X < cx + W; X += 320)
    for (let Y = Math.floor((cy - oy) / 220) * 220 + oy; Y < cy + H; Y += 220)
      ctx.drawImage(CLOUD, Math.round(X), Math.round(Y));
  ctx.globalAlpha = 1;
}
function atmosphere(m) {
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
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  if (!out) return;
  if (wx === 'nuvoloso') {
    ctx.fillStyle = 'rgba(80,90,105,.14)';
    ctx.fillRect(0, 0, W, H);
  }
  if (wx === 'pioggia') {
    ctx.fillStyle = 'rgba(30,40,60,.3)';
    ctx.fillRect(0, 0, W, H);
  }
  if (wx === 'nebbia') {
    ctx.fillStyle = 'rgba(205,210,220,.15)';
    ctx.fillRect(0, 0, W, H);
  }
  const ray = (t >= 6 * 60 + 30 && t < 9 * 60) || (t >= 15 * 60 + 30 && t < 18 * 60 + 30);
  if (ray && (wx === 'sereno' || wx === 'nuvoloso') && G.horror < 0.6) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    ctx.rotate(-0.5);
    for (let i = 0; i < 4; i++) {
      const x0 = ((i * 173 + G.t * 4) % (W + 360)) - 180,
        w = 16 + ((i * 37) % 30),
        g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      g.addColorStop(0, 'rgba(255,220,150,0)');
      g.addColorStop(0.5, `rgba(255,215,140,${wx === 'sereno' ? 0.075 : 0.035})`);
      g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x0, -200, w, H + 500);
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }
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
      const bx = X - 4,
        by = Y - 8;
      ctx.fillStyle = '#2a1406';
      ctx.fillRect(bx - 1, by - 1, 11, 10);
      ctx.fillRect(X - 1, by + 9, 3, 1);
      ctx.fillRect(X, by + 10, 1, 1);
      ctx.fillStyle = '#f6d98a';
      ctx.fillRect(bx, by, 9, 8);
      ctx.fillRect(X, by + 8, 1, 1);
      ctx.fillStyle = '#fffbe0';
      ctx.fillRect(bx, by, 9, 1);
      ctx.fillRect(bx, by, 1, 8);
      ctx.fillStyle = '#3a7a1a';
      ctx.fillRect(bx + 2, by + 4, 1, 1);
      ctx.fillRect(bx + 3, by + 5, 1, 1);
      ctx.fillRect(bx + 4, by + 4, 1, 1);
      ctx.fillRect(bx + 5, by + 3, 1, 1);
      ctx.fillRect(bx + 6, by + 2, 1, 1);
      continue;
    }
    const d = Math.hypot(p.x - X, p.y - (y * 16 + 8)) / 16;
    let a = d < 3.5 ? 0.92 : d < 6 ? ((6 - d) / 2.5) * 0.92 : 0;
    if (hold) a = Math.max(a, 0.92);
    const n = CROPS[c.t].days,
      pw = n * 4 + 1,
      px = Math.round(X - pw / 2),
      py = Y - 5;
    if (a > 0.03) {
      ctx.globalAlpha = a;
      ctx.fillStyle = '#1a0f08';
      ctx.fillRect(px - 1, py - 1, pw + 2, 7);
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(px, py, pw, 5);
      const pul = 0.55 + 0.45 * Math.sin(G.t * 5);
      for (let i = 0; i < n; i++) {
        const sx = px + 1 + i * 4;
        if (i < c.a) {
          ctx.fillStyle = '#7cc240';
          ctx.fillRect(sx, py + 1, 3, 3);
          ctx.fillStyle = '#d8f6a0';
          ctx.fillRect(sx, py + 1, 3, 1);
        } else if (i === c.a && f.w) {
          ctx.fillStyle = `rgba(106,184,240,${pul.toFixed(2)})`;
          ctx.fillRect(sx, py + 1, 3, 3);
        } else {
          ctx.fillStyle = '#21160e';
          ctx.fillRect(sx, py + 1, 3, 3);
        }
      }
      if (f.f) {
        ctx.fillStyle = '#e8c23a';
        ctx.fillRect(px - 1, py - 2, 2, 2);
      }
      ctx.globalAlpha = 1;
    }
    if (!f.w) drawDrop(a > 0.03 ? px + pw + 4 : X, a > 0.03 ? py + 2 : Y - 2, cropWilt(f));
  }
  if (focus && !(focus.f.c && !focus.f.c.dead && cropStage(focus.f.c) === 3)) {
    const c = focus.f.c,
      t = CROPS[c.t].n + ' · ' + cropStatus(focus.f);
    ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
    ctx.textAlign = 'center';
    const w = Math.ceil(ctx.measureText(t).width) + 8,
      bx = Math.round(focus.X - w / 2),
      by = focus.Y - 11;
    ctx.fillStyle = '#07040a';
    ctx.fillRect(bx - 1, by - 1, w + 2, 13);
    ctx.fillStyle = 'rgba(28,18,22,.94)';
    ctx.fillRect(bx, by, w, 11);
    ctx.fillStyle = 'rgba(217,166,70,.7)';
    ctx.fillRect(bx, by, w, 1);
    ctx.fillStyle = c.dead || cropWilt(focus.f) ? '#ffb0a0' : '#f6e6c0';
    ctx.fillText(t, focus.X, by + 8.5);
  }
  drawPops();
}
function drawPops() {
  const P = G.pops;
  if (!P || !P.length) return;
  const pl = G.player;
  for (let i = P.length - 1; i >= 0; i--) {
    const o = P[i],
      u = (G.t - o.t0) / 0.6;
    if (u >= 1) {
      P.splice(i, 1);
      continue;
    }
    const e = u * u * (3 - 2 * u),
      x = o.x + (pl.x - o.x) * e,
      y = o.y + (pl.y - 26 - o.y) * e - Math.sin(u * Math.PI) * 16;
    ctx.globalAlpha = u > 0.8 ? (1 - u) * 5 : 1;
    ctx.drawImage(o.img, Math.round(x - 8), Math.round(y - 8), 16, 16);
    ctx.globalAlpha = 1;
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
function darkLevel() {
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
function render() {
  const m = G.map;
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (!m || !G.st) return;
  const sx = (Math.random() - 0.5) * G.shake * 2,
    sy = (Math.random() - 0.5) * G.shake * 2;
  G.shake *= 0.9;
  const cx = Math.round(G.cam.x + sx),
    cy = Math.round(G.cam.y + sy);
  ctx.save();
  ctx.translate(-cx, -cy);
  const tx0 = Math.max(0, Math.floor(cx / 16)),
    ty0 = Math.max(0, Math.floor(cy / 16)),
    tx1 = Math.min(m.w - 1, Math.floor((cx + W) / 16)),
    ty1 = Math.min(m.h - 1, Math.floor((cy + H) / 16));
  const wf = Math.floor(G.t * 1.5) % 3;
  if (m.water) drawWater(m, tx0, ty0, tx1, ty1, cx);
  {
    const gw = m.ground.width,
      gh = m.ground.height,
      sx0 = Math.max(0, cx),
      sy0 = Math.max(0, cy),
      sx1 = Math.min(gw, cx + W),
      sy1 = Math.min(gh, cy + H);
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
      const arr = f.w ? T.tilledW : T.tilled;
      ctx.drawImage(arr[hsh(x, y) % 3], x * 16, y * 16, 16, 16);
      if (f.f)
        for (let i = 0; i < 7; i++) {
          const h = hsh(x * 7 + i, y * 13 + i);
          ctx.fillStyle = i % 3 ? 'rgba(24,14,6,.6)' : 'rgba(214,176,90,.75)';
          ctx.fillRect(x * 16 + 1 + (h % 14), y * 16 + 1 + ((h >> 5) % 14), 1, 1);
        }
      for (let d = 0; d < 4; d++) {
        const [dx, dy] = DIRV[d];
        if (fm[x + dx + ',' + (y + dy)]) continue;
        ctx.fillStyle = 'rgba(30,16,8,.55)';
        if (dy === 1) ctx.fillRect(x * 16, y * 16 + 15, 16, 1);
        else if (dy === -1) {
          ctx.fillRect(x * 16, y * 16, 16, 1);
          ctx.fillStyle = 'rgba(30,16,8,.25)';
          ctx.fillRect(x * 16, y * 16 + 1, 16, 1);
        } else if (dx === 1) ctx.fillRect(x * 16 + 15, y * 16, 1, 16);
        else ctx.fillRect(x * 16, y * 16, 1, 16);
      }
    }
  }
  drawPrints(m);
  drawFlowers(m, cx, cy);
  drawAim();
  // oggetti + personaggi ordinati
  const list = [];
  for (const o of m.objs) {
    if (!o.img) continue;
    if (o.dx > cx + W + 8 || o.dx + iw(o.img) < cx - 8 || o.dy > cy + H + 8 || o.dy + ih(o.img) < cy - 8)
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
      list.push({ img, dx: x * 16, dy: y * 16 + 15 - ih(img), sy: y * 16 + 6, crop: f });
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
      if (c.x > cx - 30 && c.x < cx + W + 30 && c.y > cy - 20 && c.y < cy + H + 40)
        list.push({
          crit: c,
          sy: c.k === 'crow' && c.st !== 'perch' ? 9e9 : c.k === 'duck' ? 43 * 16 + 2 : c.y
        });
  list.sort((a, b) => a.sy - b.sy);
  for (const e of list) {
    if (e.crit) drawCritter(e.crit);
    else if (e.pl) {
      if (G.erede) drawEredeHorse();
      else {
        const [ox, oy] = swingOffset();
        G.player.x += ox;
        G.player.y += oy;
        drawSprite('player', G.player);
        G.player.x -= ox;
        G.player.y -= oy;
        drawToolAnim();
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
        img = IMG.horse[Math.floor(h.anim / 2) % 2];
      ctx.drawImage(SHADOW, h.x - 12, h.y - 3, 24, 6);
      if (h.dir === 1) {
        ctx.save();
        ctx.translate(Math.round(h.x), 0);
        ctx.scale(-1, 1);
        dImg(ctx, img, -22, Math.round(h.y - 38));
        ctx.restore();
      } else dImg(ctx, img, Math.round(h.x - 22), Math.round(h.y - 38));
    } else if (e.img.canopyH) {
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
    LX.clearRect(0, 0, W, H);
    LX.fillStyle = `rgba(10,8,30,${d})`;
    LX.fillRect(0, 0, W, H);
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
      g.addColorStop(0, l.red ? 'rgba(200,30,10,.35)' : 'rgba(255,150,60,.16)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.translate(-cx, -cy);
  drawAmbTop(m);
  ctx.restore();
  atmosphere(m);
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
      const fx = ((i * 137 + G.t * (6 + i)) % (W + 120)) - 100,
        fy = ((i * 61) % H) + Math.sin(G.t * 0.3 + i) * 8;
      ctx.drawImage(FOG, fx, fy, 180, 70);
    }
    ctx.globalAlpha = 1;
  }
  if (G.redTint > 0) {
    ctx.fillStyle = `rgba(130,0,0,${(G.redTint * (0.85 + 0.15 * Math.sin(G.t * 6))).toFixed(2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawGuide();
  postFX();
}
function winLit(k) {
  const t = G.st.time;
  if (k === 'house') return G.map.id !== 'house' && false;
  const own = { store: 'agatha', elder: 'ezekiel', cottage: 'clara', forge: 'brom', chapel: 'lucius' }[k];
  if (k === 'chapel') return t < 1290;
  return t < 1290;
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
    const img = IMG.horse[Math.floor(G.t * 20) % 2];
    const s = 5 + (1 - a) * 2 + Math.random() * 0.4;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, H / 2 + 20);
    ctx.scale(s, s);
    dImg(ctx, img, -22 + (Math.random() - 0.5), -26);
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
function updParts(dt) {
  const m = G.map;
  if (!m) return;
  if (!m.interior && G.mode !== 'boot') {
    if (G.night < 0.5 && G.horror < 0.6 && leafSeason() && Math.random() < dt * 5)
      G.parts.push({
        k: 'leaf',
        x: G.cam.x + Math.random() * W * 1.2,
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
        x: G.cam.x + Math.random() * W,
        y: G.cam.y + Math.random() * H,
        vx: 0,
        vy: 0,
        t: 0,
        life: 4,
        ph: Math.random() * 6
      });
    if (G.horror > 0.5 && Math.random() < dt * 4)
      G.parts.push({
        k: 'ash',
        x: G.cam.x + Math.random() * W,
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
          x: G.cam.x + Math.random() * (W + 60),
          y: G.cam.y + Math.random() * H - 50,
          vx: -40,
          vy: 300,
          t: 0,
          life: 0.12 + Math.random() * 0.25
        });
    }
    if (G.night < 0.3 && G.horror < 0.5 && wx !== 'pioggia' && Math.random() < dt * 0.05) {
      const dir = Math.random() < 0.5 ? 1 : -1,
        y0 = G.cam.y + 15 + Math.random() * H * 0.5,
        n = 3 + ((Math.random() * 4) | 0);
      for (let i = 0; i < n; i++)
        G.parts.push({
          k: 'bird',
          x: dir > 0 ? G.cam.x - 20 - i * 11 : G.cam.x + W + 20 + i * 11,
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
        x: G.cam.x + Math.random() * W,
        y: G.cam.y + Math.random() * H,
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
function drawParts() {
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
