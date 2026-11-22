'use strict';
// ================= CONTENUTI NUOVI: colture, frutti, animali, ricette, abitanti =================
// Tutto si aggiunge ai dati esistenti (CROPS, ITEMS, FRUIT, ANIMALS, COOK, RES_POOL…): i salvataggi vecchi restano validi.

// ---------- colture nuove ----------
const NEWCROPS = {
  piselli: {
    n: 'Piselli',
    pl: 'manciate di piselli',
    sg: 'una manciata di piselli',
    s: [2],
    days: 4,
    re: 2,
    v: 45,
    p: 35
  },
  zucchina: { n: 'Zucchina', pl: 'zucchine', sg: 'una zucchina', s: [3], days: 4, re: 2, v: 45, p: 40 },
  girasole: { n: 'Girasole', pl: 'girasoli', sg: 'un girasole', s: [3], days: 6, v: 110, p: 50 },
  grano: { n: 'Grano', pl: 'covoni di grano', sg: 'un covone di grano', s: [0, 2], days: 5, v: 40, p: 25 },
  mirtilli: {
    n: 'Mirtilli',
    pl: 'cestini di mirtilli',
    sg: 'un cestino di mirtilli',
    s: [3],
    days: 5,
    re: 2,
    v: 70,
    p: 60
  },
  lavanda: {
    n: 'Lavanda',
    pl: 'mazzi di lavanda',
    sg: 'un mazzo di lavanda',
    s: [2, 3],
    days: 4,
    v: 65,
    p: 40
  },
  cavolfiore: { n: 'Cavolfiore', pl: 'cavolfiori', sg: 'un cavolfiore', s: [1], days: 5, v: 130, p: 55 },
  ravanello: {
    n: 'Ravanello',
    pl: 'mazzi di ravanelli',
    sg: 'un mazzo di ravanelli',
    s: [2, 0],
    days: 2,
    v: 35,
    p: 20
  }
};
for (const [id, g] of Object.entries(NEWCROPS)) {
  CROPS[id] = { days: g.days, n: g.n, y: [1, g.re ? 2 : 1], re: g.re, s: g.s };
  ITEMS[id] = { n: g.n, t: 'crop', v: g.v };
  ITEMS['s_' + id] = { n: 'Semi di ' + g.n.toLowerCase(), t: 'seed', crop: id, p: g.p };
  PL[id] = g.pl;
  SG[id] = g.sg;
  FAV_VAL[id] = g.v;
}
ITEMS.s_girasole.x = 'Alto come una porta. Le api lo adorano.';
ITEMS.s_grano.x = 'Al mulino diventa farina.';
ITEMS.s_ravanello.x = "Il più svelto dell'orto: due notti.";
// il grano si macina
if (typeof MILL !== 'undefined') MILL.grano = [1, 1];
if (ITEMS.mulino)
  ITEMS.mulino.d = 'Macina grano, mais, patate e castagne in farina. Con la farina, ricette nuove.';

// ---------- alberi da frutto nuovi ----------
const NEWFRUIT = {
  albicocca: {
    t: 'albicocco',
    n: 'Albicocca',
    pl: 'albicocche',
    sg: "un'albicocca",
    s: [3],
    c: '#f0a040',
    v: 80,
    p: 320,
    d: "Albicocche d'estate."
  },
  prugna: {
    t: 'prugno',
    n: 'Prugna',
    pl: 'prugne',
    sg: 'una prugna',
    s: [3, 0],
    c: '#6a3a8a',
    v: 70,
    p: 320,
    d: 'Prugne a fine estate e in autunno.'
  },
  fico: {
    t: 'fico',
    n: 'Fico',
    pl: 'fichi',
    sg: 'un fico',
    s: [3],
    c: '#7a4a6a',
    v: 95,
    p: 360,
    d: "Fichi d'estate, dolci come il miele."
  },
  noce: {
    t: 'noce',
    n: 'Noci',
    pl: 'manciate di noci',
    sg: 'una manciata di noci',
    s: [0],
    c: '#9a7a4a',
    v: 60,
    p: 340,
    d: "Noci in autunno. Si conservano tutto l'inverno."
  }
};
for (const [id, f] of Object.entries(NEWFRUIT)) {
  FRUIT[id] = { s: f.s, c: f.c };
  ITEMS[id] = { n: f.n, t: 'crop', v: f.v };
  ITEMS['alb_' + f.t] = {
    n: 'Alberello di ' + f.t,
    t: 'place',
    tree: id,
    p: f.p,
    d: 'Matura in 12 giorni. ' + f.d
  };
  PL[id] = f.pl;
  SG[id] = f.sg;
  FAV_VAL[id] = f.v;
  if (typeof BIG_BUILT !== 'undefined') BIG_BUILT['alb_' + f.t] = 8;
  if (typeof MERC_STOCK !== 'undefined') MERC_STOCK.push('alb_' + f.t);
}
if (typeof JUICY !== 'undefined') JUICY.push('mirtilli', 'albicocca', 'prugna', 'fico');
if (typeof MERC_STOCK !== 'undefined')
  MERC_STOCK.push(
    's_piselli',
    's_zucchina',
    's_girasole',
    's_grano',
    's_mirtilli',
    's_lavanda',
    's_cavolfiore',
    's_ravanello'
  );

// ---------- animali nuovi ----------
Object.assign(ITEMS, {
  ovile: {
    n: 'Ovile',
    t: 'place',
    size: [3, 2],
    d: 'Un recinto coperto per quattro pecore. Va messo su un prato libero, 3×2.'
  },
  uovo_anatra: { n: "Uovo d'anatra", t: 'crop', v: 45 },
  latte_capra: { n: 'Latte di capra', t: 'crop', v: 80 },
  lana: { n: 'Lana', t: 'crop', v: 90 }
});
Object.assign(PL, {
  uovo_anatra: "uova d'anatra",
  latte_capra: 'secchi di latte di capra',
  lana: 'matasse di lana'
});
Object.assign(SG, {
  uovo_anatra: "un uovo d'anatra",
  latte_capra: 'un secchio di latte di capra',
  lana: 'una matassa di lana'
});
Object.assign(FAV_VAL, { uovo_anatra: 45, latte_capra: 80, lana: 90 });
Object.assign(PLACE_TOOL, { ovile: 'accetta' });
if (typeof BIG_BUILT !== 'undefined') BIG_BUILT.ovile = 30;
CRAFTS.push({ id: 'ovile', q: 1, c: { legna: 60, pietra: 10, fibra: 20 }, cat: 'edi' });
// modo: ground = lo trovi a terra la mattina, milk = da mungere, shear = da tosare
Object.assign(ANIMALS.gallina, { mode: 'ground', pl: 'galline', art: 'una gallina' });
Object.assign(ANIMALS.mucca, { mode: 'milk', pl: 'mucche', art: 'una mucca' });
Object.assign(ANIMALS, {
  anatra: {
    n: 'Anatra',
    home: 'pollaio',
    cap: 4,
    cost: 240,
    prod: 'uovo_anatra',
    mode: 'ground',
    pl: 'anatre',
    art: "un'anatra"
  },
  capra: {
    n: 'Capra',
    home: 'stalla',
    cap: 3,
    cost: 420,
    prod: 'latte_capra',
    mode: 'milk',
    pl: 'capre',
    art: 'una capra'
  },
  pecora: {
    n: 'Pecora',
    home: 'ovile',
    cap: 4,
    cost: 380,
    prod: 'lana',
    mode: 'shear',
    pl: 'pecore',
    art: 'una pecora'
  }
});
const ANAMES2 = [
  'Fiocco',
  'Batuffolo',
  'Gigia',
  'Lola',
  'Brunella',
  'Viola',
  'Pepita',
  'Mora',
  'Stella',
  'Cannella',
  'Teresa',
  'Ondina'
];

// ---------- ricette nuove ----------
Object.assign(ITEMS, {
  pastapiselli: { n: 'Pasta e piselli', t: 'food', e: 60, d: 'Verde di primavera. +60 energia.' },
  frittatazucchine: { n: 'Frittata di zucchine', t: 'food', e: 55, d: 'Agosto in padella. +55 energia.' },
  tortamirtilli: { n: 'Torta di mirtilli', t: 'food', e: 85, d: 'Blu fino al cuore. +85 energia.' },
  formaggio: {
    n: 'Formaggio di capra',
    t: 'food',
    e: 45,
    d: 'Stagionato in cantina, profuma di prato. +45 energia.'
  },
  fichiformaggio: {
    n: 'Fichi e formaggio',
    t: 'food',
    e: 75,
    d: 'Dolce e salato. Irene dice che a Roma si fa così. +75 energia.'
  },
  marmellataalbicocche: {
    n: 'Marmellata di albicocche',
    t: 'food',
    e: 45,
    d: 'Un barattolo di sole. +45 energia.'
  },
  crostataprugne: {
    n: 'Crostata di prugne',
    t: 'food',
    e: 85,
    d: "Scura, profumata, d'autunno. +85 energia."
  },
  cavolfioregratin: {
    n: 'Cavolfiore gratinato',
    t: 'food',
    e: 65,
    d: 'Croccante sopra, morbido sotto. +65 energia.'
  },
  biscottilavanda: {
    n: 'Biscotti alla lavanda',
    t: 'food',
    e: 50,
    d: 'Profumano di cassetto della nonna. +50 energia.'
  },
  pagnottanoci: { n: 'Pagnotta alle noci', t: 'food', e: 70, d: 'Il pane della festa. +70 energia.' },
  uovaanatra: {
    n: "Uova d'anatra e spinaci",
    t: 'food',
    e: 55,
    d: "Tuorlo grande, colore d'oro. +55 energia."
  },
  insalataravanelli: { n: 'Insalata di ravanelli', t: 'food', e: 35, d: 'Pizzica, rinfresca. +35 energia.' },
  semigirasole: {
    n: 'Semi di girasole tostati',
    t: 'food',
    e: 25,
    d: 'Da sgranocchiare sul muretto. +25 energia.'
  }
});
COOK.push(
  { id: 'pastapiselli', need: { piselli: 2, farina: 1 }, min: 30, da: 'clara' },
  { id: 'frittatazucchine', need: { zucchina: 1, uovo: 2 }, min: 25, da: 'agatha' },
  { id: 'tortamirtilli', need: { mirtilli: 2, uovo: 1, latte: 1 }, min: 70, adv: 1, da: 'lia' },
  { id: 'formaggio', need: { latte_capra: 2 }, min: 60, adv: 1, da: 'elio' },
  { id: 'fichiformaggio', need: { fico: 1, formaggio: 1 }, min: 5, da: 'irene' },
  { id: 'marmellataalbicocche', need: { albicocca: 2 }, min: 40, da: 'mirta' },
  { id: 'crostataprugne', need: { prugna: 2, uovo: 1, farina: 1 }, min: 70, adv: 1, da: 'bruno' },
  { id: 'cavolfioregratin', need: { cavolfiore: 1, latte: 1 }, min: 50, adv: 1, da: 'ezekiel' },
  { id: 'biscottilavanda', need: { lavanda: 1, farina: 1, uovo: 1 }, min: 40, adv: 1, da: 'ada' },
  { id: 'pagnottanoci', need: { farina: 2, noce: 1 }, min: 60, adv: 1, da: 'rina' },
  { id: 'uovaanatra', need: { uovo_anatra: 2, spinaci: 1 }, min: 20, da: 'tobia' },
  { id: 'insalataravanelli', need: { ravanello: 2, lattuga: 1 }, min: 10, da: 'lucius' },
  { id: 'semigirasole', need: { girasole: 1 }, min: 15, da: 'brom' }
);
// gusti degli abitanti
Object.assign(LIKES.agatha, { frittatazucchine: 3, lana: 2, lavanda: 1 });
Object.assign(LIKES.clara, { mirtilli: 2, tortamirtilli: 3, pastapiselli: 2, girasole: 2 });
Object.assign(LIKES.brom, { semigirasole: 3, pagnottanoci: 2, noce: 1 });
Object.assign(LIKES.lucius, { insalataravanelli: 3, lavanda: 2, biscottilavanda: 2 });
Object.assign(LIKES.ezekiel, { cavolfioregratin: 3, formaggio: 2, prugna: 1 });
Object.assign(LIKES.tobia, { uovaanatra: 3, albicocca: 2, fico: 2, semigirasole: 2 });
if (typeof DISLIKES !== 'undefined') {
  DISLIKES.brom && DISLIKES.brom.push('lavanda');
  DISLIKES.clara && DISLIKES.clara.push('ravanello');
}

// ---------- abitanti nuovi e richieste ----------
if (typeof RES_POOL !== 'undefined') {
  const addReq = (id, L) => {
    const r = RES_POOL.find(x => x.id === id);
    if (r) for (const x of L) if (!r.req.includes(x)) r.req.push(x);
  };
  addReq('lia', ['lavanda', 'girasole']);
  addReq('gaspare', ['lavanda', 'girasole']);
  addReq('bruno', ['grano']);
  addReq('mirta', ['lavanda', 'albicocca']);
  addReq('ada', ['albicocca', 'prugna']);
  addReq('silvio', ['noce']);
  addReq('nora', ['uovo_anatra']);
  // d'autunno e d'inverno i fiori non ci sono: chiedono quello che la stagione dà
  addReq('lia', ['agrifoglio', 'zucca']); // ghirlande d'inverno, zucche ornamentali d'autunno
  addReq('gaspare', ['castagne', 'agrifoglio']); // miele di castagno; l'agrifoglio per coprire le arnie
  addReq('ada', ['agrifoglio', 'cavolfiore']); // rosso e bianco per i quadri d'inverno
}

// ---------- animali: sistema generalizzato (galline, anatre, mucche, capre, pecore) ----------
const kindsFor = bid => Object.keys(ANIMALS).filter(k => ANIMALS[k].home === bid);
const capFor = bid => Math.max(0, ...kindsFor(bid).map(k => ANIMALS[k].cap));
function animalImg(kind, moving, f) {
  const fr = moving ? Math.floor(f) % 2 : 0;
  if (kind === 'mucca') return AIMG.mucca[fr];
  if (kind === 'gallina') return CRIT.chicken[fr];
  if (kind === 'pecora') return (AIMG.pecora || AIMG.mucca)[fr];
  return (AIMG[kind] || CRIT.chicken)[fr];
}

{
  const _pi = promptInfo;
  promptInfo = function () {
    const q = _pi.apply(this, arguments);
    try {
      if (q && G.fanimals && G.map.id === 'main') {
        const p = G.player,
          ax = p.x + DIRV[p.dir][0] * 14,
          ay = p.y + DIRV[p.dir][1] * 14,
          e = G.fanimals.find(e => Math.hypot(e.x - ax, e.y - ay) < 18);
        if (e) {
          const a = e.a,
            A = ANIMALS[a.kind];
          if (A) {
            if (A.mode !== 'ground' && a.prod) q.t = (A.mode === 'milk' ? 'Mungi ' : 'Tosa ') + a.name;
            q.y = e.y - (a.kind === 'mucca' || a.kind === 'capra' || a.kind === 'pecora' ? 28 : 18);
          }
        }
      }
    } catch (e) {}
    return q;
  };
}
// l'ovile si apre come pollaio e stalla
{
  Ext.on('freeAct:intercetta', function (fx, fy) {
    try {
      const st = G.st;
      if (isFree(st) && G.map.id === 'main' && !G.visit) {
        const o = G.map.objAt(fx, fy),
          it = selItem(),
          id = it && it.id;
        if (o && o.kind === 'built') {
          const b = st.free.built[o.bk];
          if (b && b.id === 'ovile' && id !== PLACE_TOOL.ovile) {
            barnMenu(o.bk);
            return true;
          }
        }
      }
    } catch (e) {}
  });
}
// conserve e succhi anche per i raccolti nuovi
for (const id of [...Object.keys(NEWCROPS), ...Object.keys(NEWFRUIT)]) {
  const it = ITEMS[id];
  if (!ITEMS['cons_' + id])
    ITEMS['cons_' + id] = {
      n: 'Conserva di ' + it.n.toLowerCase(),
      t: 'crop',
      v: Math.round(it.v * 2 + 30),
      pre: id
    };
  if (JUICY.includes(id) && !ITEMS['succo_' + id])
    ITEMS['succo_' + id] = {
      n: 'Succo di ' + it.n.toLowerCase(),
      t: 'crop',
      v: Math.round(it.v * 3 + 20),
      pre: id
    };
}

// =====================================================================
// GRAFICA: colture (4 stadi ciascuna), icone, bustine, frutti, animali nuovi, ovile
// =====================================================================
const CART = (() => {
  const SOIL = R6b('#6a4428'),
    LF = R6b('#5a9a2a'),
    LF2 = R6b('#3f7a2a'),
    STEM = R6b('#4a7a24'),
    WOOD = R6b('#8a5a30');
  const S = fn => {
    const P = new PX(32, 48);
    fn(P);
    P.outline();
    const c = pxCanvas(P);
    c.top = imgTop(c);
    return c;
  };
  const M = P => new MK2(P.w, P.h);
  const soil = (P, w = 7) => {
    paint2(P, M(P).ell(16, 43.5, w, 2.4), SOIL, {
      nc: 1,
      mod: (X, Y, t) => ((X * 3 + Y) % 5 === 0 ? t - 1 : t)
    });
  };
  const leafE = (P, x, y, rx, ry, ang, R) =>
    paint2(P, M(P).rot(x, y, rx, ry, ang), R || LF, { thin: 1, mod: (X, Y, t) => t });
  const fan = (P, n, len, R, R2, cy = 41, spread = 1.3, wid = 2.4) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2 * spread * 0.9,
        x = 16 + Math.cos(a) * len * 0.55,
        y = cy + Math.sin(a) * len * 0.55;
      leafE(P, x, y, len * 0.5, wid, a, i % 2 ? R2 || LF2 : R || LF);
    }
  };
  const s0 = seed =>
    S(P => {
      soil(P);
      for (const [a, b] of [
        [13, 42],
        [18, 42],
        [16, 44]
      ])
        P.set(a, b, C(seed || '#e8d0a0'));
    });
  const s1 = col =>
    S(P => {
      soil(P, 5);
      paint2(P, M(P).rect(16, 36, 1, 7), STEM, { flat: 1, nc: 1 });
      leafE(P, 13, 35, 3.2, 1.6, -0.4, R6b(col || '#7aba3a'));
      leafE(P, 19.5, 34.5, 3.2, 1.6, 0.4, R6b(col || '#7aba3a'));
    });
  const dots = (P, pts, col, r = 1.6) => {
    for (const [x, y] of pts) paint2(P, M(P).ell(x, y, r, r), R6b(col), { thin: 1 });
  };
  const K = {
    root: (c, top, big) => P => {
      soil(P, big ? 7 : 6);
      if (big)
        paint2(
          P,
          M(P).ell(16, 41, c.rw || 5, c.rh || 3.4, (X, Y) => Y < 43),
          R6b(c.c),
          { mod: (X, Y, t) => (Y < 40 && c.top2 ? (P.set(X, Y, C(c.top2)), null) : t) }
        );
      fan(
        P,
        big ? 7 : 5,
        big ? 22 : 14,
        R6b(c.l || '#5a9a2a'),
        R6b(shade(c.l || '#5a9a2a', -0.2)),
        big ? 39 : 41
      );
    },
    bulb: (c, big) => P => {
      soil(P);
      if (big)
        paint2(
          P,
          M(P).ell(16, 40, 6, 5, (X, Y) => Y < 44),
          R6b(c.c)
        );
      for (let i = -2; i <= 2; i++)
        paint2(
          P,
          M(P).cap(16 + i * 1.2, 41, 16 + i * (big ? 4 : 2.6), big ? 14 : 24, 1, 0.7),
          R6b(i % 2 ? '#6aa84a' : '#4a8a3a'),
          { thin: 1 }
        );
    },
    leek: big => P => {
      soil(P, 5);
      paint2(P, M(P).rect(14, big ? 30 : 34, 4, 12), R6b('#eef0e0'), { thin: 1 });
      for (let i = -2; i <= 2; i++)
        paint2(
          P,
          M(P).cap(16, big ? 31 : 35, 16 + i * (big ? 6 : 4), big ? 8 : 20, 1.5, 0.8),
          R6b(i % 2 ? '#4a8a6a' : '#3a7a5a'),
          { thin: 1 }
        );
    },
    leaf: (c, big) => P => {
      soil(P);
      const R = R6b(c.c),
        R2 = R6b(shade(c.c, -0.2)),
        n = big ? 9 : 6,
        r = big ? 11 : 7;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        leafE(
          P,
          16 + Math.cos(a) * r * 0.55,
          39 + Math.sin(a) * r * 0.3 - (big ? 2 : 0),
          r * 0.55,
          r * 0.36,
          a,
          i % 2 ? R2 : R
        );
      }
      if (big) paint2(P, M(P).ell(16, 36, 4.5, 3.5), R6b(shade(c.c, 0.15)), { thin: 1 });
    },
    kale: big => P => {
      soil(P);
      const R = R6b('#2f5a4a'),
        R2 = R6b('#3e7060');
      const L = big
        ? [
            [5, 24],
            [27, 24],
            [8, 14],
            [24, 14],
            [12, 8],
            [20, 8],
            [16, 6]
          ]
        : [
            [9, 30],
            [13, 26],
            [19, 26],
            [23, 30]
          ];
      L.forEach(([a, b], i) =>
        paint2(P, M(P).cap(16, 41, a, b, 1, big ? 3.4 : 2.6), i % 2 ? R : R2, {
          mod: (X, Y, t) => ((X * 3 + Y * 5) % 7 === 0 ? t - 1 : t)
        })
      );
    },
    head: big => P => {
      soil(P, 8);
      const R = R6b('#4a8a5a');
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        leafE(P, 16 + Math.cos(a) * 7, 37 + Math.sin(a) * 4, 6, 3.2, a, i % 2 ? R : R6b('#3a7a4a'));
      }
      if (big)
        paint2(P, M(P).ell(16, 35, 6, 4.5), R6b('#f2ecd8'), {
          mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t)
        });
    },
    bush: (c, big) => P => {
      soil(P);
      paint2(P, M(P).rect(15, big ? 24 : 30, 2, 19), STEM, { thin: 1 });
      const n = big ? 7 : 4;
      for (let i = 0; i < n; i++)
        leafE(
          P,
          16 + (i % 2 ? 6 : -6),
          41 - i * (big ? 3.2 : 3),
          4.6,
          2.8,
          i % 2 ? -0.3 : 0.3,
          i % 2 ? LF : LF2
        );
      if (big && c.fruit) c.fruit(P);
    },
    berry: (c, big) => P => {
      soil(P, 8);
      for (let i = 0; i < (big ? 7 : 5); i++) {
        const a = (i / 7) * Math.PI * 2;
        leafE(P, 16 + Math.cos(a) * 6, 38 + Math.sin(a) * 3, 4, 3, a, i % 2 ? LF : LF2);
      }
      if (!big)
        dots(
          P,
          [
            [12, 35],
            [20, 36]
          ],
          '#f8f4e8',
          1.2
        );
      else c.fruit(P);
    },
    bluebush: big => P => {
      soil(P, 7);
      paint2(P, M(P).ell(16, big ? 33 : 37, big ? 10 : 7, big ? 9 : 6), R6b('#3a7a3a'), {
        mod: (X, Y, t) => ((X * 5 + Y * 3) % 7 === 0 ? t - 1 : (X + Y * 2) % 9 === 0 ? t + 1 : t)
      });
      if (big)
        dots(
          P,
          [
            [10, 30],
            [14, 27],
            [19, 29],
            [22, 33],
            [12, 35],
            [17, 34],
            [20, 25]
          ],
          '#3a4ab8',
          1.3
        );
    },
    pole: (c, big, mid) => P => {
      soil(P, 5);
      paint2(P, M(P).rect(15, big ? 6 : mid ? 14 : 22, 2, big ? 37 : mid ? 29 : 21), WOOD, { thin: 1 });
      const n = big ? 8 : mid ? 5 : 2;
      for (let i = 0; i < n; i++) {
        const y = 40 - i * 4.4,
          sd = i % 2 ? 1 : -1;
        leafE(P, 16 + sd * 5, y, 3.6, 2.2, sd * 0.4, i % 2 ? LF : LF2);
      }
      if (big)
        for (const [a, b] of [
          [10, 14],
          [22, 20],
          [10, 28],
          [22, 32],
          [11, 8]
        ])
          paint2(P, M(P).cap(a, b, a - 1, b + 7, 1.3), R6b(c.c), { thin: 1 });
    },
    vine: (c, big) => P => {
      paint2(P, M(P).cap(2, 42, 30, 42, 1), STEM, { thin: 1 });
      leafE(P, 6, 37, 5, 3.6, 0, LF);
      leafE(P, 26, 36, 5, 3.6, 0, LF2);
      leafE(P, 16, 33, 4, 3, 0, LF);
      if (big) c.fruit(P);
      else paint2(P, M(P).ell(16, 39, 3, 2.4), R6b('#f0c83a'), { thin: 1 });
    },
    tall: (c, big, mid) => P => {
      soil(P, 6);
      const h = big ? 6 : mid ? 16 : 28;
      paint2(P, M(P).rect(15, h, 3, 44 - h), R6b('#7aa83a'), { thin: 1 });
      for (let y = h + 4; y < 42; y += 5) {
        const sd = ((y / 5) | 0) % 2 ? 1 : -1;
        paint2(P, M(P).cap(16, y, 16 + sd * 10, y - 4, 1.4, 0.6), y % 2 ? LF : LF2, { thin: 1 });
      }
      if (big && c.top) c.top(P);
    },
    grain: (big, mid) => P => {
      soil(P, 9);
      const col = big ? '#e8c050' : '#7aa83a',
        h = big ? 14 : mid ? 20 : 30;
      for (let i = 0; i < 7; i++) {
        const x = 8 + i * 2.6,
          top = h + (i % 3) * 2;
        paint2(P, M(P).rect(Math.round(x), top, 1, 44 - top), R6b(col), { flat: 1, nc: 1 });
        if (big || mid)
          paint2(P, M(P).ell(x + 0.5, top - 1, 1.4, 3.2), R6b(big ? '#f0d070' : '#9ac04a'), { thin: 1 });
      }
    },
    flower: (c, big) => P => {
      soil(P, 7);
      for (let i = 0; i < 7; i++) {
        const x = 9 + i * 2.3,
          top = big ? 16 + (i % 3) * 3 : 30 + (i % 2) * 3;
        paint2(P, M(P).rect(Math.round(x), top, 1, 44 - top), R6b('#7a9a7a'), { flat: 1, nc: 1 });
        if (big)
          paint2(P, M(P).ell(x + 0.5, top + 2, 1.3, 3.4), R6b(c.c), {
            thin: 1,
            mod: (X, Y, t) => (Y % 2 ? t - 1 : t)
          });
      }
      for (let i = 0; i < 5; i++) leafE(P, 10 + i * 3, 40, 2.2, 1, 0, R6b('#8aa88a'));
    }
  };
  const pumpkin = (P, face) => {
    const R = R6b('#d86a18');
    for (const [a, r] of [
      [-6, 6],
      [6, 6],
      [0, 8]
    ])
      paint2(P, M(P).ell(16 + a, 35, r, 8), R, {
        mod: (X, Y, t) => (Math.abs(X - 16 - a) > r - 2 ? t - 1 : t)
      });
    paint2(P, M(P).cap(16, 27, 17, 23, 1.4), R6b('#4a6a2a'), { thin: 1 });
    if (face) {
      const d = C('#2b1205'),
        g = C('#ffb030');
      for (const ex of [11, 19])
        for (let k = 0; k < 3; k++) {
          P.set(ex + k, 32, d);
          P.set(ex + 1, 31, d);
        }
      for (let k = 0; k < 11; k++) P.set(10 + k, 38 + (k % 3 === 1 ? 1 : 0), d);
      P.set(12, 32, g);
      P.set(20, 32, g);
    }
  };
  const DEF = {
    rapa: { k: 'root', c: { c: '#f2ecf4', top2: '#9a4ab8', seed: '#9a6ab8' } },
    carota: { k: 'root', c: { c: '#e8781a', rw: 3.4, rh: 3, seed: '#e8a060' } },
    barbabietola: { k: 'root', c: { c: '#8a1a3a', l: '#5a8a3a' } },
    ravanello: { k: 'root', c: { c: '#e0405a', rw: 3.4, rh: 3, l: '#6aa83a' } },
    cipolla: { k: 'bulb', c: { c: '#c88a4a' } },
    aglio: { k: 'bulb', c: { c: '#f2ecdc' } },
    porro: { k: 'leek' },
    lattuga: { k: 'leaf', c: { c: '#8ac83a' } },
    spinaci: { k: 'leaf', c: { c: '#2a6a2a' } },
    cavolo: { k: 'kale' },
    cavolfiore: { k: 'head' },
    patata: {
      k: 'bush',
      c: {
        fruit: P => {
          dots(
            P,
            [
              [9, 22],
              [17, 19],
              [24, 23]
            ],
            '#f6f2dc',
            1.6
          );
          paint2(P, M(P).ell(9, 43, 4, 2.6), R6b('#c09a62'), { thin: 1 });
          paint2(P, M(P).ell(23, 43.5, 3.4, 2.2), R6b('#b08a5a'), { thin: 1 });
        }
      }
    },
    peperone: {
      k: 'bush',
      c: {
        fruit: P => {
          for (const [a, b, c] of [
            [10, 30, '#d8302a'],
            [22, 26, '#e8a020'],
            [12, 22, '#d8302a']
          ])
            paint2(P, M(P).ell(a, b, 2.6, 3.8), R6b(c));
        }
      }
    },
    melanzana: {
      k: 'bush',
      c: {
        fruit: P => {
          for (const [a, b] of [
            [10, 31],
            [22, 27]
          ])
            paint2(P, M(P).rot(a, b, 2.4, 4.6, 0.2), R6b('#5a2a6a'));
        }
      }
    },
    zucchina: {
      k: 'bush',
      c: {
        fruit: P => {
          for (const [a, b] of [
            [9, 40],
            [23, 41]
          ])
            paint2(P, M(P).rot(a, b, 5, 1.8, 0.15), R6b('#3a7a2a'), {
              mod: (X, Y, t) => (X % 3 === 0 ? t + 1 : t)
            });
          dots(P, [[16, 30]], '#f0c83a', 1.6);
        }
      }
    },
    pomodoro: {
      k: 'bush',
      c: {
        fruit: P => {
          paint2(P, M(P).rect(21, 12, 1, 32), WOOD, { thin: 1, nc: 1 });
          dots(
            P,
            [
              [11, 30],
              [21, 26],
              [12, 22],
              [19, 34],
              [14, 16]
            ],
            '#e0302a',
            2.2
          );
        }
      }
    },
    fragola: {
      k: 'berry',
      c: {
        fruit: P => {
          for (const [a, b] of [
            [10, 39],
            [21, 38],
            [16, 41]
          ]) {
            paint2(
              P,
              M(P).poly([
                [a - 2, b - 2],
                [a + 2, b - 2],
                [a, b + 2]
              ]),
              R6b('#e0302a'),
              { thin: 1 }
            );
            P.set(a, b - 1, C('#f8e070'));
          }
        }
      }
    },
    mirtilli: { k: 'bluebush' },
    fagioli: { k: 'pole', c: { c: '#8acd4a' } },
    piselli: { k: 'pole', c: { c: '#9ad85a' } },
    zucca: { k: 'vine', c: { fruit: P => pumpkin(P) } },
    anguria: {
      k: 'vine',
      c: {
        fruit: P =>
          paint2(P, M(P).ell(16, 36, 11, 7.5), R6b('#3a7a2a'), {
            mod: (X, Y, t) => ((X + 2) % 6 < 2 ? t - 1 : t)
          })
      }
    },
    mais: {
      k: 'tall',
      c: {
        top: P => {
          for (const [a, b] of [
            [11, 22],
            [21, 26]
          ])
            paint2(P, M(P).rot(a, b, 2, 4.4, 0.3), R6b('#f0c83a'), {
              mod: (X, Y, t) => ((X + Y) % 2 ? t - 1 : t)
            });
          for (let i = -2; i <= 2; i++) P.set(16 + i, 4 + Math.abs(i), C('#d8b860'));
        }
      }
    },
    girasole: {
      k: 'tall',
      c: {
        top: P => {
          paint2(P, M(P).ell(16, 8, 7, 6.5), R6b('#f0c020'), { mod: (X, Y, t) => ((X + Y) % 2 ? t : t + 1) });
          paint2(P, M(P).ell(16, 8, 3.6, 3.2), R6b('#5a3a1a'), {
            thin: 1,
            mod: (X, Y, t) => ((X + Y) % 2 ? t - 1 : t)
          });
        }
      }
    },
    grano: { k: 'grain' },
    lavanda: { k: 'flower', c: { c: '#9a7ad8' } }
  };
  const seedCol = {
    rapa: '#9a6ab8',
    carota: '#e8a060',
    barbabietola: '#8a1a3a',
    ravanello: '#e0405a',
    fagioli: '#c08070',
    piselli: '#9ad85a',
    zucca: '#f2e2b0',
    anguria: '#2a2a2a',
    girasole: '#4a3a2a',
    grano: '#e8c050',
    mais: '#f0c83a',
    mirtilli: '#3a4ab8'
  };
  function stages(id) {
    const d = DEF[id];
    if (!d) return null;
    const c = d.c || {};
    const sc = seedCol[id] || c.seed;
    let a, b;
    switch (d.k) {
      case 'root':
        a = K.root(c, 0, false);
        b = K.root(c, 0, true);
        break;
      case 'bulb':
        a = K.bulb(c, false);
        b = K.bulb(c, true);
        break;
      case 'leek':
        a = K.leek(false);
        b = K.leek(true);
        break;
      case 'leaf':
        a = K.leaf(c, false);
        b = K.leaf(c, true);
        break;
      case 'kale':
        a = K.kale(false);
        b = K.kale(true);
        break;
      case 'head':
        a = K.head(false);
        b = K.head(true);
        break;
      case 'bush':
        a = K.bush(c, false);
        b = K.bush(c, true);
        break;
      case 'berry':
        a = K.berry(c, false);
        b = K.berry(c, true);
        break;
      case 'bluebush':
        a = K.bluebush(false);
        b = K.bluebush(true);
        break;
      case 'pole':
        a = K.pole(c, false, true);
        b = K.pole(c, true);
        break;
      case 'vine':
        a = K.vine(c, false);
        b = K.vine(c, true);
        break;
      case 'tall':
        a = K.tall(c, false, true);
        b = K.tall(c, true);
        break;
      case 'grain':
        a = K.grain(false, true);
        b = K.grain(true);
        break;
      case 'flower':
        a = K.flower(c, false);
        b = K.flower(c, true);
        break;
    }
    return [s0(sc), s1(), S(a), S(b)];
  }
  // icone nuove (32×32)
  const ic = fn => icon32(fn),
    I = P => new MK2(32, 32);
  const ICONS = {
    piselli: ic(P => {
      for (const [x, r] of [
        [8, 0],
        [16, 1],
        [24, 0]
      ]) {
        paint2(P, I().rot(x, 17 + r * 2, 3.4, 10, 0.15), R6b('#7ac04a'));
        for (let y = 10; y < 26; y += 4) P.set(x, y + r * 2, C('#b8e878'));
      }
    }),
    zucchina: ic(P => {
      paint2(P, I().rot(16, 17, 13, 4.4, -0.5), R6b('#3a7a2a'), {
        mod: (X, Y, t) => ((X - Y) % 4 === 0 ? t + 1 : t)
      });
      paint2(P, I().ell(26, 9, 2.4, 2), R6b('#f0c83a'), { thin: 1 });
    }),
    girasole: ic(P => {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        paint2(P, I().rot(16 + Math.cos(a) * 9, 15 + Math.sin(a) * 9, 4, 2, a), R6b('#f0c020'), { thin: 1 });
      }
      paint2(P, I().ell(16, 15, 6, 6), R6b('#5a3a1a'), { mod: (X, Y, t) => ((X + Y) % 2 ? t - 1 : t) });
      paint2(P, I().rect(15, 22, 2, 9), R6b('#5a9a2a'), { thin: 1 });
    }),
    grano: ic(P => {
      for (let i = 0; i < 5; i++) {
        const x = 8 + i * 4;
        paint2(P, I().cap(x, 30, x + 2, 8, 0.6), R6b('#c8a040'), { thin: 1, flat: 1 });
        paint2(P, I().rot(x + 2, 8, 2, 5, 0.2), R6b('#f0d070'), {
          thin: 1,
          mod: (X, Y, t) => (Y % 2 ? t - 1 : t)
        });
      }
      paint2(P, I().rect(6, 22, 20, 3), R6b('#a8402a'), { thin: 1 });
    }),
    mirtilli: ic(P => {
      paint2(P, I().ell(16, 22, 12, 6), R6b('#a8743e'), {
        mod: (X, Y, t) => ((X + Y) % 4 === 0 ? t - 1 : t)
      });
      for (const [x, y] of [
        [10, 16],
        [15, 14],
        [20, 15],
        [13, 19],
        [18, 19],
        [23, 18],
        [8, 20]
      ])
        paint2(P, I().ell(x, y, 2.6, 2.6), R6b('#3a4ab8'), { thin: 1 });
    }),
    lavanda: ic(P => {
      for (let i = 0; i < 5; i++) {
        const x = 8 + i * 4,
          top = 4 + (i % 2) * 3;
        paint2(P, I().rect(x, top + 7, 1, 30 - top - 7), R6b('#7a9a7a'), { flat: 1, nc: 1 });
        paint2(P, I().ell(x + 0.5, top + 4, 2, 5), R6b('#9a7ad8'), {
          thin: 1,
          mod: (X, Y, t) => (Y % 2 ? t - 1 : t)
        });
      }
      paint2(P, I().rect(6, 22, 20, 3), R6b('#e8dcc0'), { thin: 1 });
    }),
    cavolfiore: ic(P => {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        paint2(P, I().rot(16 + Math.cos(a) * 8, 18 + Math.sin(a) * 6, 7, 3.6, a), R6b('#4a8a5a'));
      }
      paint2(P, I().ell(16, 16, 9, 7), R6b('#f2ecd8'), { mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t) });
    }),
    ravanello: ic(P => {
      for (const [x, y] of [
        [11, 20],
        [20, 22]
      ]) {
        paint2(P, I().ell(x, y, 5, 5), R6b('#e0405a'));
        paint2(P, I().cap(x, y + 5, x, y + 9, 0.6), R6b('#f4ecec'), { thin: 1, flat: 1 });
      }
      for (const [a, b] of [
        [8, 4],
        [14, 3],
        [20, 4],
        [25, 6]
      ])
        paint2(P, I().cap(15, 14, a, b, 1.2, 2), R6b('#5a9a2a'), { thin: 1 });
    }),
    albicocca: ic(P => {
      paint2(P, I().ell(16, 18, 9.5, 9.5), R6b('#f0a040'), { mod: (X, Y, t) => (X === 16 ? t - 1 : t) });
      paint2(P, I().rot(21, 7, 3.6, 1.6, -0.4), R6b('#5a9a2a'), { thin: 1 });
      P.set(12, 13, C('#ffe0b0'));
    }),
    prugna: ic(P => {
      paint2(P, I().ell(16, 18, 8.5, 10), R6b('#6a3a8a'), { mod: (X, Y, t) => (X === 17 ? t - 1 : t) });
      paint2(P, I().cap(16, 8, 17, 3, 0.8), R6b('#5a3a1e'), { thin: 1 });
      P.set(12, 13, C('#b8a0d8'));
      P.set(13, 13, C('#b8a0d8'));
    }),
    fico: ic(P => {
      paint2(
        P,
        I().poly([
          [16, 4],
          [25, 18],
          [22, 27],
          [10, 27],
          [7, 18]
        ]),
        R6b('#7a4a6a')
      );
      paint2(P, I().ell(16, 22, 6, 5), R6b('#8a5a7a'), { nc: 1, thin: 1 });
      paint2(P, I().rect(15, 2, 2, 4), R6b('#5a7a2a'), { thin: 1 });
    }),
    noce: ic(P => {
      for (const [x, y] of [
        [11, 19],
        [21, 18],
        [16, 24]
      ]) {
        paint2(P, I().ell(x, y, 5.4, 5), R6b('#b8925a'), {
          mod: (X, Y, t) => ((X * 2 + Y) % 3 === 0 ? t - 1 : t)
        });
        for (let k = -3; k <= 3; k++) P.set(x, y + k, C('#7a5a32'));
      }
    }),
    uovo_anatra: ic(P => {
      paint2(P, I().ell(16, 18, 8, 10), R6b('#d8e8e0'));
      P.set(13, 13, C('#ffffff'));
      P.set(19, 20, C('#a8c0b8'));
    }),
    latte_capra: ic(P => {
      paint2(P, I().rect(10, 10, 12, 19), R6b('#a8b0b8'), { mod: (X, Y, t) => (X < 12 ? t + 1 : t) });
      paint2(P, I().ell(16, 10, 6, 2.4), R6b('#fbfbf6'), { thin: 1 });
      paint2(P, I().rect(12, 17, 8, 6), R6b('#c8a050'), { thin: 1, nc: 1 });
      P.set(16, 19, C('#5a3a1e'));
    }),
    lana: ic(P => {
      paint2(P, I().ell(16, 18, 11, 10), R6b('#f0e8d8'), {
        mod: (X, Y, t) => ((X + Y * 2) % 5 === 0 ? t - 1 : (X * 2 - Y) % 7 === 0 ? t - 1 : t)
      });
      for (let i = 0; i < 10; i++) P.set(8 + i * 2, 26 - ((i * 3) % 4), C('#c8b8a0'));
      paint2(P, I().cap(25, 24, 30, 30, 0.7), R6b('#e8dcc8'), { thin: 1 });
    }),
    ovile: ic(P => {
      paint2(P, I().rect(4, 16, 24, 12), R6b('#a0703e'), { mod: (X, Y, t) => (X % 4 === 0 ? t - 1 : t) });
      paint2(
        P,
        I().poly([
          [2, 17],
          [16, 6],
          [30, 17]
        ]),
        R6b('#6a5a4a')
      );
      paint2(P, I().rect(12, 20, 8, 8), R6b('#3a2414'), { thin: 1 });
      paint2(P, I().ell(16, 26, 4, 3), R6b('#f0e8d8'), { thin: 1 });
    })
  };
  const packet = id =>
    icon32(P => {
      const pap = R6b('#ece0bc');
      paint2(P, I().rect(6, 4, 20, 26), pap, { mod: (X, Y, t) => ((X * 5 + Y * 3) % 17 === 0 ? t - 1 : t) });
      for (let x = 6; x < 26; x++) P.set(x, 4 + (x % 2), pap[2]);
      paint2(P, I().rect(6, 23, 20, 6), R6b(seedCol[id] || '#8a6a3a'), { thin: 1, nc: 1 });
      const cr = CROPS[id];
      if (cr && cr.s)
        cr.s.forEach((s, i) => {
          const col = ['#d86a1e', '#a8d0ff', '#7ac04a', '#f0c020'][s];
          P.set(9 + i * 4, 26, C(col));
          P.set(10 + i * 4, 26, C(col));
          P.set(9 + i * 4, 27, C(col));
          P.set(10 + i * 4, 27, C(col));
        });
    });
  return { stages, pumpkin, ICONS, packet, S, DEF };
})();
// applica: dopo l'orto (prima dei barattoli, che copiano le icone dei raccolti)
{
  const _gg = genGardenArt;
  genGardenArt = function () {
    const r = _gg.apply(this, arguments);
    try {
      for (const k in CART.ICONS) ICON[k] = CART.ICONS[k];
      for (const f of Object.values(NEWFRUIT))
        ICON['alb_' + f.t] = icon32(P => {
          const T = R6b('#6a4428');
          paint2(P, new MK2(32, 32).rect(15, 14, 3, 16), T, { thin: 1 });
          for (let i = 0; i < 6; i++)
            paint2(
              P,
              new MK2(32, 32).ell(16 + Math.cos(i * 1.05) * 6, 11 + Math.sin(i * 1.05) * 4.5, 4.6, 3.6),
              R6b(i % 2 ? '#5a9a2a' : '#3f7a2a')
            );
          for (const [x, y] of [
            [12, 10],
            [20, 13],
            [17, 7]
          ])
            paint2(
              P,
              new MK2(32, 32).ell(x, y, 1.6, 1.6),
              R6b(FRUIT[Object.keys(NEWFRUIT).find(k => NEWFRUIT[k] === f)].c),
              { thin: 1, nc: 1 }
            );
        });
      for (const id of Object.keys(CROPS)) {
        const st = CART.stages(id);
        if (st) {
          CROPIMG[id] = st;
          CROPW[id] = st.map(wiltImg);
        }
        if (ITEMS['s_' + id]) {
          const pk = CART.packet(id),
            x = pk.getContext('2d');
          x.imageSmoothingEnabled = false;
          if (ICON[id]) x.drawImage(ICON[id], 8, 6, 16, 16);
          ICON['s_' + id] = pk;
        }
      }
      CROPIMG.zuccaFace = CART.S(P => {
        const v = new MK2(32, 48);
        paint2(P, v.cap(2, 42, 30, 42, 1), R6b('#4a7a24'), { thin: 1 });
        CART.pumpkin(P, 1);
      });
      FREEIMG.w_uovo_anatra = (() => {
        const [c, x] = mk(24, 24);
        x.imageSmoothingEnabled = false;
        x.drawImage(ICON.uovo_anatra, 0, 0, 24, 24);
        c.s = 2;
        return c;
      })();
    } catch (e) {
      console.error(e);
    }
    return r;
  };
}

// ---------- frutti veri sugli alberi (prima erano quadratini) ----------

// ---------- icone delle ricette nuove ----------
{
  const DI = (() => {
    const I = () => new MK2(32, 32);
    const plate = P => {
      const R = R6b('#f2ece0');
      paint2(P, I().ell(16, 21, 14.5, 7), R, { thin: 1 });
      paint2(P, I().ell(16, 20.5, 11, 5), R, { flat: 1, nc: 1, base: 4 });
      for (let a = 0; a < 12; a++) {
        const t = (a / 12) * Math.PI * 2;
        P.set(Math.round(16 + Math.cos(t) * 13), Math.round(21 + Math.sin(t) * 6), C('#5a7ab0'));
      }
    };
    const bowl = (P, soup) => {
      const B = R6b('#c87a4a');
      paint2(
        P,
        I().ell(16, 17, 12.5, 10.5, (X, Y) => Y >= 17),
        B
      );
      paint2(P, I().ell(16, 17, 12.5, 3.8), B, { base: 4, thin: 1 });
      paint2(P, I().ell(16, 17, 10.5, 2.8), R6b(soup), { thin: 1, nc: 1 });
    };
    const pie = (P, fill) => {
      const Cr = R6b('#d8984a');
      paint2(P, I().ell(16, 20, 14, 8), Cr);
      paint2(P, I().ell(16, 18.5, 11, 5.5), R6b(fill), { nc: 1 });
      for (let k = -8; k <= 8; k += 4)
        for (let i = -5; i <= 5; i++) {
          const X = 16 + k + i,
            Y = 18 + i;
          if (Math.hypot((X - 16) / 11, (Y - 18.5) / 5.5) < 1) P.set(X, Y, Cr[4]);
        }
    };
    const dots = (P, pts, col, r = 1.2) => {
      for (const [x, y] of pts) paint2(P, I().ell(x, y, r, r), R6b(col), { thin: 1, nc: 1 });
    };
    const steam = P => {
      for (const [x0, ph] of [
        [11, 0],
        [16, 2],
        [21, 1]
      ])
        for (let y = 2; y < 9; y++)
          P.set(x0 + Math.round(Math.sin(y * 0.9 + ph)), y, C('#ffffff'), y < 4 ? 70 : 130);
    };
    return {
      pastapiselli: P => {
        bowl(P, '#f0d080');
        dots(
          P,
          [
            [11, 16],
            [14, 17],
            [18, 16],
            [21, 17],
            [16, 15],
            [13, 15]
          ],
          '#7ac04a',
          1
        );
        steam(P);
      },
      frittatazucchine: P => {
        plate(P);
        paint2(P, I().ell(16, 19, 9, 4.5), R6b('#f0c43a'));
        for (const [x, y] of [
          [12, 18],
          [16, 20],
          [20, 18]
        ]) {
          paint2(P, I().ell(x, y, 2, 1.4), R6b('#5a9a3a'), { thin: 1, nc: 1 });
          P.set(x, y, C('#e8f0a0'));
        }
      },
      tortamirtilli: P => {
        pie(P, '#3a3a9a');
        dots(
          P,
          [
            [12, 17],
            [17, 18],
            [20, 17],
            [15, 20]
          ],
          '#2a2a7a',
          1
        );
      },
      formaggio: P => {
        paint2(
          P,
          I().poly([
            [4, 24],
            [26, 24],
            [28, 14],
            [10, 10]
          ]),
          R6b('#f4ecc8'),
          { mod: (X, Y, t) => ((X * 3 + Y * 5) % 11 === 0 ? t - 2 : t) }
        );
        paint2(
          P,
          I().poly([
            [26, 24],
            [28, 14],
            [28, 22]
          ]),
          R6b('#e8d8a0'),
          { thin: 1 }
        );
      },
      fichiformaggio: P => {
        plate(P);
        paint2(
          P,
          I().poly([
            [8, 22],
            [17, 22],
            [18, 16],
            [10, 15]
          ]),
          R6b('#f4ecc8')
        );
        for (const x of [20, 24]) {
          paint2(P, I().ell(x, 18, 3, 3.4), R6b('#7a4a6a'));
          paint2(P, I().ell(x, 19, 1.6, 1.6), R6b('#e86a7a'), { thin: 1, nc: 1 });
        }
      },
      marmellataalbicocche: P => {
        paint2(P, I().rect(9, 9, 14, 19), R6b('#f0902a'), { mod: (X, Y, t) => (X < 11 ? t + 1 : t) });
        paint2(P, I().rect(8, 5, 16, 5), R6b('#d8c8a8'), {
          mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t)
        });
        paint2(P, I().rect(11, 15, 10, 7), R6b('#f4ecd8'), { thin: 1, nc: 1 });
        dots(P, [[16, 18]], '#f0a040', 1.4);
      },
      crostataprugne: P => {
        pie(P, '#5a2a6a');
        dots(
          P,
          [
            [12, 17],
            [18, 18],
            [15, 20]
          ],
          '#8a5aa8',
          1
        );
      },
      cavolfioregratin: P => {
        const D = R6b('#e8e0d0');
        paint2(P, I().rect(4, 13, 24, 13), D);
        paint2(P, I().rect(6, 14, 20, 9), R6b('#e8c070'), {
          nc: 1,
          mod: (X, Y, t) => ((X * 3 + Y) % 5 === 0 ? t - 1 : t)
        });
        dots(
          P,
          [
            [10, 17],
            [16, 16],
            [21, 18],
            [13, 20]
          ],
          '#c8803a',
          1
        );
      },
      biscottilavanda: P => {
        plate(P);
        for (const [x, y] of [
          [11, 18],
          [17, 17],
          [21, 20],
          [14, 21]
        ]) {
          paint2(P, I().ell(x, y, 3.4, 2.4), R6b('#e8c070'));
          P.set(x, y - 1, C('#9a7ad8'));
          P.set(x + 1, y, C('#9a7ad8'));
        }
      },
      pagnottanoci: P => {
        paint2(P, I().ell(16, 18, 12, 8), R6b('#a8682a'));
        for (let i = -4; i <= 4; i++) P.set(16 + i, 15, C('#e8b060'));
        dots(
          P,
          [
            [11, 19],
            [20, 20],
            [16, 22]
          ],
          '#7a5a32',
          1.2
        );
      },
      uovaanatra: P => {
        plate(P);
        for (const x of [11, 21]) {
          paint2(P, I().ell(x, 19, 5, 3.6), R6b('#f8f4ec'), { thin: 1 });
          paint2(P, I().ell(x, 19, 2, 1.8), R6b('#f0a020'), { thin: 1, nc: 1 });
        }
        dots(
          P,
          [
            [16, 22],
            [16, 17]
          ],
          '#2a6a2a',
          1.2
        );
      },
      insalataravanelli: P => {
        bowl(P, '#8ac83a');
        dots(
          P,
          [
            [11, 15],
            [16, 16],
            [21, 15],
            [14, 14]
          ],
          '#e0405a',
          1.4
        );
      },
      semigirasole: P => {
        plate(P);
        for (let i = 0; i < 14; i++) {
          const x = 8 + ((i * 7) % 16),
            y = 17 + ((i * 5) % 6);
          P.set(x, y, C('#3a2a1a'));
          P.set(x + 1, y, C('#e8e0c8'));
        }
      }
    };
  })();
  const setNew = () => {
    for (const k in DI) {
      try {
        ICON[k] = icon32(DI[k]);
      } catch (e) {
        console.error(e);
      }
    }
  };
  const _gd = genDishArt;
  genDishArt = function () {
    const r = _gd.apply(this, arguments);
    setNew();
    return r;
  };
}

// ---------- animali nuovi e ovile ----------
{
  const AN = {
    anatra: () =>
      [0, 1].map(f =>
        spr2(24, 20, P => {
          const W = R6b('#f6f2e8'),
            Y = R6b('#f0a020'),
            I = () => new MK2(24, 20);
          for (const k of [0, 1]) {
            const lx = 10 + k * 3 + (f ? (k ? 1 : -1) : 0);
            paint2(P, I().rect(lx, 15, 1, 4), Y, { flat: 1, nc: 1 });
            paint2(P, I().rect(lx - 1, 19, 3, 1), Y, { flat: 1, nc: 1 });
          }
          paint2(P, I().ell(11, 12, 8, 4.6), W);
          paint2(P, I().ell(10, 11.5, 4.4, 2.4), W, { base: 2, thin: 1 });
          paint2(
            P,
            I().poly([
              [2, 9],
              [5, 10],
              [4, 12]
            ]),
            W,
            { thin: 1 }
          );
          paint2(P, I().cap(16, 10, 17, 5, 2), W);
          paint2(P, I().ell(17.5, 4.5, 2.8, 2.6), W);
          P.set(19, 3, C('#14100c'));
          paint2(P, I().rect(20, 5, 3, 1.5), Y, { thin: 1, flat: 1 });
        })
      ),
    capra: () =>
      [0, 1].map(f =>
        spr2(28, 24, P => {
          const W = R6b('#e8dcc4'),
            B = R6b('#8a6a48'),
            I = () => new MK2(28, 24),
            H = R6b('#a89a7a');
          for (const [lx, o] of [
            [7, 0],
            [10, 1],
            [18, 0],
            [21, 1]
          ]) {
            const sw = f ? (o ? 1 : -1) : 0;
            paint2(P, I().rect(lx + sw, 15, 2, 8), o ? W.map(c => c.map(v => v * 0.8)) : W, { thin: 1 });
            P.set(lx + sw, 23, C('#2a1a10'));
            P.set(lx + sw + 1, 23, C('#2a1a10'));
          }
          paint2(P, I().cap(4, 11, 2, 8, 0.8), W, { thin: 1 });
          paint2(P, I().ell(14, 12, 10, 5), W, {
            mod: (X, Y, t) => (Y > 13 && X > 8 && X < 20 && (X + Y) % 4 === 0 ? t - 1 : t)
          });
          paint2(P, I().ell(13, 13, 6, 2.6), B, { nc: 1, thin: 1 });
          paint2(P, I().cap(22, 10, 24, 5, 2.6), W);
          paint2(P, I().rot(25, 6, 3.6, 2.6, 0.4), W);
          paint2(P, I().cap(24, 8, 24, 12, 0.7), R6b('#d8d0c0'), { thin: 1 });
          paint2(P, I().cap(23, 3, 20, 0, 0.8), H, { thin: 1 });
          paint2(P, I().cap(25, 3, 23, 0, 0.8), H, { thin: 1 });
          P.set(21, 4, W[2]);
          P.set(25, 5, C('#14100c'));
          P.set(28, 7, C('#c08080'));
        })
      ),
    pecora: tos =>
      [0, 1].map(f =>
        spr2(28, 22, P => {
          const Wl = R6b(tos ? '#e0d4bc' : '#f4ecdc'),
            K = R6b('#2a2630'),
            I = () => new MK2(28, 22);
          for (const [lx, o] of [
            [8, 0],
            [11, 1],
            [18, 0],
            [21, 1]
          ]) {
            const sw = f ? (o ? 1 : -1) : 0;
            paint2(P, I().rect(lx + sw, 14, 2, 7), o ? K.map(c => c.map(v => v * 0.8)) : K, { thin: 1 });
          }
          if (tos) paint2(P, I().ell(14, 11, 8.5, 4.4), Wl);
          else
            for (const [x, y, r] of [
              [7, 10, 4],
              [11, 7, 4.4],
              [16, 7, 4.4],
              [20, 10, 4],
              [10, 13, 4],
              [17, 13, 4],
              [14, 10, 5]
            ])
              paint2(P, I().ell(x, y, r, r * 0.9), Wl, {
                ck: 0.85,
                mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t)
              });
          paint2(P, I().ell(23.5, 9, 3.2, 3.6), K);
          paint2(P, I().ell(21, 6.5, 1.8, 1), K, { thin: 1 });
          P.set(24, 8, C('#f0f0f0'));
          P.set(25, 8, C('#14100c'));
          if (!tos) paint2(P, I().ell(22.5, 5.5, 2.6, 1.8), Wl, { thin: 1 });
        })
      ),
    ovile: () =>
      GB(48, 34, (P, B) => {
        const W = B.R6('#a8783e'),
          RF = B.R6('#6a5a4a'),
          D = B.R6('#5a3a1e');
        // recinto davanti
        for (let X = 4; X < 92; X += 10) {
          B.F(P, X, 40, 4, 26, B.tc(D, 3));
          B.F(P, X, 40, 1, 26, B.tc(D, 4));
        }
        for (const y of [46, 58]) {
          B.F(P, 4, y, 88, 3, B.tc(W, 3));
          B.F(P, 4, y, 88, 1, B.tc(W, 4));
        }
        // tettoia
        B.boards(P, 14, 22, 68, 26, W, { bw: 7 });
        B.F(P, 40, 30, 16, 18, C('#1e140c'));
        for (let i = 0; i < 16; i++) {
          const h = 3 + (B.hh(i, 3) % 4);
          B.F(P, 40 + i, 48 - h, 1, h, C(B.hh(i, 5) % 2 ? '#d8b048' : '#b8902a'));
        }
        B.shingles(P, 8, 2, 80, 22, RF, { rowH: 5, sw: 8, ins: 10, moss: 1 });
        B.eave(P, 8, 22, 80, RF);
        // una pecora che sbircia
        for (const [x, y, r] of [
          [30, 52, 5],
          [36, 50, 5],
          [33, 55, 5]
        ]) {
          for (let yy = -r; yy <= r; yy++)
            for (let xx = -r; xx <= r; xx++)
              if (xx * xx + yy * yy <= r * r)
                B.S(P, x + xx, y + yy, B.tc(B.R6('#f4ecdc'), xx + yy < 0 ? 4 : 3));
        }
        B.F(P, 40, 48, 5, 6, B.tc(B.R6('#2a2630'), 3));
        B.S(P, 42, 50, C('#f0f0f0'));
      })
  };
  const _ga = genAnimalArt;
  genAnimalArt = function () {
    const r = _ga.apply(this, arguments);
    try {
      AIMG.anatra = AN.anatra();
      AIMG.capra = AN.capra();
      AIMG.pecora = AN.pecora(false);
      AIMG.pecoraTosata = AN.pecora(true);
      AIMG.ovile = AN.ovile();
    } catch (e) {
      console.error(e);
    }
    return r;
  };
}
