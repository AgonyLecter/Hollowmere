'use strict';
// ================= ANIMALI DA FATTORIA E CUCINA =================
// Pollaio e stalla si costruiscono al banco; le bestie si comprano dal loro edificio.
// Fuori stagione fredda pascolano da sole; d'inverno vogliono il fieno nella mangiatoia.

Object.assign(ITEMS, {
  pollaio: {
    n: 'Pollaio',
    t: 'place',
    size: [3, 2],
    d: 'Casa per quattro galline. Va messo su un prato libero, 3×2.'
  },
  stalla: {
    n: 'Stalla',
    t: 'place',
    size: [4, 3],
    d: 'Casa per tre mucche. Va messa su un prato libero, 4×3.'
  },
  fieno: { n: 'Fieno', t: 'res', d: "D'inverno le bestie non pascolano: mettilo nella mangiatoia." },
  uovo: { n: 'Uovo', t: 'crop', v: 30 },
  latte: { n: 'Latte', t: 'crop', v: 65 },
  frittata: { n: 'Frittata', t: 'food', e: 45, d: 'Gialla come il recinto di una volta. +45 energia.' },
  polenta: { n: 'Polenta', t: 'food', e: 60, d: "Calda, densa, d'inverno salva la vita. +60 energia." },
  marmellata: {
    n: 'Marmellata di fragole',
    t: 'food',
    e: 40,
    d: 'Rossa. Nessuno la seppellisce più. +40 energia.'
  },
  zuppaporri: { n: 'Zuppa di porri', t: 'food', e: 55, d: "Il sapore dell'inverno. +55 energia." },
  insalata: { n: "Insalata d'estate", t: 'food', e: 35, d: 'Pomodori, sale, sole. +35 energia.' },
  umido: { n: 'Fagioli in umido', t: 'food', e: 50, d: 'Cotti piano, come una volta. +50 energia.' },
  crostata: { n: 'Crostata', t: 'food', e: 90, d: 'Fragole, uova, latte. Una festa vera. +90 energia.' }
});
Object.assign(PLACE_TOOL, { pollaio: 'accetta', stalla: 'accetta' });
CRAFTS.push(
  { id: 'fieno', q: 1, c: { fibra: 3 } },
  { id: 'pollaio', q: 1, c: { legna: 50, pietra: 15, fibra: 10 } },
  { id: 'stalla', q: 1, c: { legna: 90, pietra: 40, fibra: 20 } }
);
Object.assign(PL, { uovo: 'uova', latte: 'secchi di latte' });
Object.assign(SG, { uovo: 'un uovo', latte: 'un secchio di latte' });
Object.assign(FAV_VAL, { uovo: 30, latte: 65 });
Object.assign(LIKES.agatha, { uovo: 1, crostata: 3, marmellata: 2 });
Object.assign(LIKES.clara, { fragola: 2, marmellata: 3, latte: 1 });
Object.assign(LIKES.brom, { polenta: 3, latte: 2 });
Object.assign(LIKES.lucius, { zuppaporri: 3, frittata: 1 });
Object.assign(LIKES.ezekiel, { umido: 3, porro: 2 });
Object.assign(LIKES.tobia, { uovo: 2, crostata: 3, fragola: 2 });
const ANIMALS = {
  gallina: { n: 'Gallina', home: 'pollaio', cap: 4, cost: 180, prod: 'uovo' },
  mucca: { n: 'Mucca', home: 'stalla', cap: 3, cost: 520, prod: 'latte' }
};
const ANAMES = [
  'Rosina',
  'Bianca',
  'Nuvola',
  'Margherita',
  'Pina',
  'Clementina',
  'Gina',
  'Tilde',
  'Ortensia',
  'Zucca',
  'Ninì',
  'Elvira',
  'Ottavia',
  'Fiamma'
];

// ---------- grafica ----------
const AIMG = {};
function genAnimalArt() {
  const wood = rp('#8a5a30'),
    dk = rp('#5a3a1e'),
    roof = rp('#7a2a1a'),
    roof2 = rp('#4a3a3a');
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  I('pollaio', P => {
    P.rect(5, 14, 22, 14, wood, { mod: woodMod });
    P.body(
      4,
      15,
      Y => 16,
      Y => 2 + (Y - 4) * 1.1,
      roof2,
      { nyF: () => -0.4 }
    );
    P.rect(13, 19, 6, 9, dk);
  });
  I('stalla', P => {
    P.rect(3, 13, 26, 16, rp('#9a3a24'), { mod: woodMod });
    P.body(
      3,
      14,
      Y => 16,
      Y => 3 + (Y - 3) * 1.2,
      roof2,
      { nyF: () => -0.4 }
    );
    P.rect(11, 17, 10, 12, dk);
    P.line(11, 17, 21, 29, C('#e8dcc0'));
    P.line(21, 17, 11, 29, C('#e8dcc0'));
  });
  I('fieno', P => {
    P.ellipse(16, 20, 12, 8, rp('#d8b048'), {
      spec: 0.3,
      mod: (X, Y, v) => ((X * 3 + Y) % 4 === 0 ? v - 0.25 : v)
    });
    P.rect(6, 18, 20, 2, rp('#8a6a2a'));
  });
  I('uovo', P => {
    P.ellipse(16, 18, 8, 10, rp('#f4ead8'), { spec: 0.7 });
  });
  I('latte', P => {
    P.body(
      9,
      28,
      () => 16,
      Y => 8 + (Y - 9) * 0.08,
      rp('#a8b0b8'),
      { spec: 0.7 }
    );
    P.ellipse(16, 10, 8, 3, rp('#fbfbf6'), { spec: 0.4, edge: false });
    P.capsule(9, 8, 23, 8, 0.8, rp('#6a6a72'), { clip: (X, Y) => Y < 9 });
  });
  const plate = (P, c, top) => {
    P.ellipse(16, 22, 13, 6, rp('#d9d2c2'), { spec: 0.5 });
    P.ellipse(16, 19, 10, 5, rp(c), { spec: 0.4 });
    if (top) top(P);
  };
  I('frittata', P =>
    plate(P, '#f0c040', P => {
      P.ellipse(12, 18, 2, 1.4, rp('#5a9a2a'), { edge: false });
    })
  );
  I('polenta', P =>
    plate(P, '#f0b830', P => {
      P.ellipse(16, 16, 6, 3, rp('#f8d860'), { spec: 0.6, edge: false });
    })
  );
  I('marmellata', P => {
    P.body(
      8,
      28,
      () => 16,
      () => 8,
      rp('#c8202a'),
      { spec: 0.6 }
    );
    P.rect(8, 6, 16, 4, rp('#e8dcc0'), { n: [0, -0.5, 0.9] });
    P.rect(11, 15, 10, 6, rp('#efe2c2'), { n: [0, 0, 1] });
  });
  I('zuppaporri', P => {
    P.body(
      15,
      27,
      () => 16,
      Y => 12 - (Y - 15) * 0.35,
      rp('#a8785a'),
      { spec: 0.4 }
    );
    P.ellipse(16, 15, 12, 3.6, rp('#d8d8a8'), { spec: 0.6 });
    for (const x of [11, 16, 21]) P.ellipse(x, 14, 1.6, 1.2, rp('#6a9a5a'), { edge: false });
  });
  I('insalata', P =>
    plate(P, '#5a9a2a', P => {
      for (const [a, b] of [
        [11, 17],
        [18, 16],
        [15, 20]
      ])
        P.ellipse(a, b, 3, 2.4, rp('#e0402a'), { spec: 0.6 });
    })
  );
  I('umido', P => {
    P.body(
      15,
      27,
      () => 16,
      Y => 12 - (Y - 15) * 0.35,
      rp('#6a6a72'),
      { spec: 0.6 }
    );
    P.ellipse(16, 15, 12, 3.6, rp('#a8402a'), { spec: 0.5 });
    for (const x of [10, 14, 19, 22]) P.ellipse(x, 14, 1.4, 1, rp('#e8dcc0'), { edge: false });
  });
  I('crostata', P => {
    P.ellipse(16, 20, 14, 8, rp('#c98a3e'), { spec: 0.3 });
    P.ellipse(16, 18, 11, 5.4, rp('#c8202a'), { spec: 0.6 });
    for (const k of [-6, -2, 2, 6]) P.line(16 + k - 4, 14, 16 + k + 4, 22, C('#e0a85a'));
  });
  AIMG.pollaio = SP(48, 34, P => {
    P.rect(4, 22, 88, 44, wood, { mod: woodMod, spec: 0.2 });
    P.body(
      2,
      26,
      Y => 48,
      Y => 12 + (Y - 2) * 1.7,
      roof2,
      { nyF: () => -0.5, mod: (X, Y, v) => (Y % 5 === 0 ? v - 0.2 : v) }
    );
    P.rect(40, 40, 16, 26, dk);
    P.rect(14, 34, 12, 10, rp('#2a1a10'));
    P.rect(70, 34, 12, 10, rp('#2a1a10'));
    P.rect(30, 58, 36, 4, rp('#d8b048'));
  });
  AIMG.stalla = SP(64, 48, P => {
    P.rect(4, 30, 120, 64, rp('#9a3a24'), { mod: woodMod, spec: 0.2 });
    P.body(
      2,
      34,
      Y => 64,
      Y => 14 + (Y - 2) * 1.7,
      roof2,
      { nyF: () => -0.5, mod: (X, Y, v) => (Y % 6 === 0 ? v - 0.2 : v) }
    );
    P.rect(46, 50, 36, 44, dk);
    P.line(46, 50, 82, 94, C('#e8dcc0'));
    P.line(82, 50, 46, 94, C('#e8dcc0'));
    P.rect(46, 50, 36, 2, rp('#e8dcc0'));
    P.rect(16, 44, 16, 12, rp('#2a1a10'));
    P.rect(96, 44, 16, 12, rp('#2a1a10'));
  });
  AIMG.mucca = critFrames(28, 22, 2, (P, f) => {
    const wh = rp('#f2ece0'),
      bk = rp('#2a2630'),
      pk = rp('#e8a8a0');
    for (const [lx, o] of [
      [7, 0],
      [11, 1],
      [18, 0],
      [22, 1]
    ])
      P.capsule(lx, 13, lx + (f && o ? 1 : 0), 20, 1.2, o ? bk : wh, { edge: false });
    P.ellipse(14, 11, 10, 5.4, wh, { spec: 0.3 });
    P.ellipse(10, 9, 3, 2.4, bk, { edge: false });
    P.ellipse(17, 12, 3.4, 2, bk, { edge: false });
    P.ellipse(24, 8, 4, 3.4, wh, { spec: 0.3 });
    P.ellipse(26, 10, 2.2, 1.6, pk, { edge: false });
    P.capsule(22, 5, 21, 3, 0.6, rp('#d8c8a0'));
    P.capsule(25, 5, 26, 3, 0.6, rp('#d8c8a0'));
    P.set(24, 7, C('#000'));
    P.capsule(4, 10, 2, 15, 0.6, wh);
  });
  FREEIMG.uovo = SP(8, 7, P => P.ellipse(8, 8, 5, 6, rp('#f4ead8'), { spec: 0.7 }));
}

// ---------- edifici grandi: posizionamento e impronta ----------
function bldFoot(id, ax, ay) {
  const [w, h] = ITEMS[id].size,
    x0 = ax - Math.floor(w / 2),
    T = [];
  for (let y = ay - h + 1; y <= ay; y++) for (let x = x0; x < x0 + w; x++) T.push([x, y]);
  return { x0, T, w, h };
}
function bigFree(id, ax, ay) {
  const st = G.st,
    m = G.map,
    { T } = bldFoot(id, ax, ay);
  return T.every(([x, y]) => {
    const g = m.get(x, y);
    return (
      x >= 4 &&
      x <= 96 &&
      y >= 5 &&
      y <= 41 &&
      !!ownedAt(x, y) &&
      !m.objAt(x, y) &&
      !m.solid(x, y) &&
      (g === 1 || g === 12) &&
      !st.farm[fkey(x, y)]
    );
  });
}
function addBigBuilt(m, k, b) {
  const [ax, ay] = k.split(',').map(Number),
    { x0, T, w } = bldFoot(b.id, ax, ay);
  return m.add(OB('built', x0, ay, AIMG[b.id], { wt: w, act: 'built', bk: k, bid: b.id, solid: T, hits: T }));
}
function animalsOf(k) {
  return (G.st.free.animals || []).filter(a => a.home === k);
}

// ---------- menu dell'edificio ----------
function barnMenu(k) {
  const st = G.st,
    b = st.free.built[k],
    kind = b.id === 'pollaio' ? 'gallina' : 'mucca',
    A = ANIMALS[kind],
    L = animalsOf(k),
    win = seasonOf() === 1;
  b.hay = b.hay || 0;
  const hayN = countItem('fieno');
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${ITEMS[b.id].n}</h2><p class="small">${L.length}/${A.cap} ${A.n.toLowerCase() === 'gallina' ? 'galline' : 'mucche'} · Fieno nella mangiatoia: ${b.hay} · ${win ? "<b>D'inverno non si pascola: serve fieno.</b>" : 'Fuori stagione fredda pascolano da sole.'}</p>` +
      L.map(
        a =>
          `<div class="mrow"><canvas data-a="${kind}" width="32" height="32"></canvas><span><b>${esc(a.name)}</b> <span class="hearts">${'♥'.repeat(Math.round(a.love / 2))}${'♡'.repeat(5 - Math.round(a.love / 2))}</span><br><span class="small">${a.pet ? 'Accarezzata oggi.' : "Non l'hai ancora accarezzata oggi."}${a.hungry ? ' Ha fame!' : ''}${kind === 'mucca' ? (a.prod ? ' Pronta da mungere.' : ' Munta.') : ''}</span></span></div>`
      ).join('') +
      `<p>${hayN ? `<button class="btn" data-h="1">Metti fieno (${hayN})</button> ` : ''}${L.length < A.cap ? `<button class="btn" data-buy="1" ${st.money >= A.cost ? '' : 'disabled'}>Compra ${A.n.toLowerCase() === 'gallina' ? 'una gallina' : 'una mucca'} (${CZ(A.cost)})</button>` : ''}</p>` +
      `<p class="small">Accarezza le bestie ogni giorno: più ti vogliono bene, più producono. ${kind === 'gallina' ? 'Le uova le trovi a terra vicino al pollaio, la mattina.' : 'Le mucche pronte hanno un secchio sopra la testa: avvicinati e premi A/E per mungerle.'}</p>`
  );
  $('#mbox')
    .querySelectorAll('canvas[data-a]')
    .forEach(c => {
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      const im = c.dataset.a === 'gallina' ? CRIT.chicken[0] : AIMG.mucca[0];
      x.drawImage(im, 0, 32 - (im.height * 32) / im.width, 32, (im.height * 32) / im.width);
    });
  const h = $('#mbox').querySelector('[data-h]');
  if (h)
    h.onclick = () => {
      const n = countItem('fieno');
      removeItem('fieno', n);
      b.hay += n;
      AU.play('pick');
      UI._mclose = null;
      barnMenu(k);
    };
  const by = $('#mbox').querySelector('[data-buy]');
  if (by)
    by.onclick = () => {
      if (st.money < A.cost) return;
      st.money -= A.cost;
      const used = new Set((st.free.animals || []).map(a => a.name)),
        nm = ANAMES.find(n => !used.has(n)) || A.n;
      (st.free.animals = st.free.animals || []).push({
        kind,
        name: nm,
        home: k,
        love: 2,
        pet: false,
        prod: false,
        hungry: false
      });
      AU.play('coin');
      UI.hud();
      UI.toast(`${nm} è arrivata. Agatha l'ha portata fin qui con una corda e molta pazienza.`);
      spawnFarmAnimals();
      UI._mclose = null;
      barnMenu(k);
    };
}

// ---------- vita degli animali ----------
function spawnFarmAnimals() {
  const st = G.st;
  G.fanimals = [];
  if (!isFree(st)) return;
  for (const a of st.free.animals || []) {
    const b = st.free.built[a.home];
    if (!b) continue;
    const [ax, ay] = a.home.split(',').map(Number);
    G.fanimals.push({
      a,
      x: (ax + (Math.random() * 4 - 2)) * 16 + 8,
      y: (ay + 1.6 + Math.random() * 1.5) * 16,
      hx: ax * 16 + 8,
      hy: (ay + 2) * 16,
      dir: 1,
      t: Math.random() * 3,
      f: 0,
      st: 'idle'
    });
  }
}
function animalsTick(dt) {
  if (!G.fanimals || G.map.id !== 'main') return;
  const night = G.night > 0.5;
  for (const e of G.fanimals) {
    e.t -= dt;
    if (night) {
      e.st = 'sleep';
      continue;
    }
    if (e.st === 'sleep') e.st = 'idle';
    if (e.st === 'idle' && e.t <= 0) {
      e.t = 2 + Math.random() * 4;
      e.tx = e.hx + (Math.random() - 0.5) * 80;
      e.ty = e.hy + Math.random() * 44;
      e.st = 'move';
    }
    if (e.st === 'move') {
      const dx = e.tx - e.x,
        dy = e.ty - e.y,
        d = Math.hypot(dx, dy);
      if (d < 2) {
        e.st = 'idle';
        continue;
      }
      const sp = e.a.kind === 'mucca' ? 12 : 18,
        nx = e.x + (dx / d) * sp * dt,
        ny = e.y + (dy / d) * sp * dt;
      if (G.map.solid(Math.floor(nx / 16), Math.floor((ny - 3) / 16))) {
        e.st = 'idle';
        e.t = 1;
        continue;
      }
      e.x = nx;
      e.y = ny;
      e.dir = dx < 0 ? -1 : 1;
      e.f += dt * 5;
    }
  }
}
function drawFarmAnimal(e) {
  const im =
      e.a.kind === 'mucca'
        ? AIMG.mucca[e.st === 'move' ? Math.floor(e.f) % 2 : 0]
        : CRIT.chicken[e.st === 'move' ? Math.floor(e.f) % 2 : 0],
    w = iw(im),
    h = ih(im),
    X = Math.round(e.x),
    Y = Math.round(e.y);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.fillRect(X - w * 0.35, Y - 1, w * 0.7, 2);
  if (e.dir < 0) {
    ctx.save();
    ctx.translate(X, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, Y - h, w, h);
    ctx.restore();
  } else ctx.drawImage(im, X - w / 2, Y - h, w, h);
  if (e.st === 'sleep' && Math.floor(G.t * 1.5 + e.hx) % 3 === 0) {
    ctx.fillStyle = '#fff';
    ctx.font = '8px "Pixelify Sans",monospace';
    ctx.fillText('z', X + 4, Y - h - 2);
  }
  if (e.a.kind === 'mucca' && e.a.prod && e.st !== 'sleep') {
    ctx.fillStyle = '#fbfbf6';
    ctx.fillRect(X - 1, Y - h - 6, 3, 4);
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(X - 1, Y - h - 7, 3, 1);
  }
}
function animalAct(ax, ay) {
  const e = (G.fanimals || []).find(e => Math.hypot(e.x - ax, e.y - ay) < 18);
  if (!e) return false;
  const a = e.a;
  if (a.kind === 'mucca' && a.prod) {
    if (!addItem('latte', 1)) return true;
    a.prod = false;
    AU.play('pick');
    floatText('+1 Latte', e.x, e.y - 24);
    if (!a.pet) {
      a.pet = true;
      a.love = Math.min(10, a.love + 1);
    }
    return true;
  }
  if (!a.pet) {
    a.pet = true;
    a.love = Math.min(10, a.love + 1);
    AU.play(a.kind === 'gallina' ? 'cluck' : 'ok');
    floatText('♥', e.x, e.y - 22, '#ff7a6a');
    UI.toast(`${a.name} ${a.kind === 'gallina' ? 'chioccia contenta' : 'muggisce piano'}.`);
  } else {
    floatText('♥', e.x, e.y - 22, '#ffb0a0', 0.7);
    UI.toast(
      `${a.name} oggi è già stat${a.kind === 'gallina' ? 'a' : 'a'} coccolat${a.kind === 'gallina' ? 'a' : 'a'}. ${a.hungry ? 'Ha fame: metti fieno nella mangiatoia.' : 'Sta bene.'}`
    );
  }
  return true;
}
// ogni mattina: si mangia (pascolo o fieno), si produce, l'affetto cresce o cala
function animalsMorning(st) {
  if (!isFree(st) || !st.free.animals) return;
  const win = seasonOf(st) === 1;
  for (const a of st.free.animals) {
    const b = st.free.built[a.home];
    if (!b) continue;
    b.hay = b.hay || 0;
    let fed = true;
    if (win) {
      if (b.hay > 0) b.hay--;
      else fed = false;
    }
    a.hungry = !fed;
    a.love = clamp(a.love + (a.pet ? 0 : -1) + (fed ? 0 : -1), 0, 10);
    a.pet = false;
    const chance = fed ? 0.55 + a.love * 0.045 : 0;
    if (Math.random() < chance) {
      if (a.kind === 'mucca') a.prod = true;
      else {
        const [ax, ay] = a.home.split(',').map(Number);
        for (let i = 0; i < 8; i++) {
          const x = ax - 2 + Math.floor(Math.random() * 5),
            y = ay + 1 + Math.floor(Math.random() * 2),
            k = fkey(x, y);
          if (!st.free.debris[k] && !st.free.built[k] && !st.farm[k]) {
            st.free.debris[k] = 'uovo';
            break;
          }
        }
      }
    }
  }
}

// ---------- cucina del gioco libero ----------
const COOK = [
  { id: 'zuppa', need: { rapa: 2 }, min: 30 },
  { id: 'arrosto', need: { patata: 2 }, min: 40 },
  { id: 'torta', need: { zucca: 1, rapa: 1 }, min: 60 },
  { id: 'frittata', need: { uovo: 2 }, min: 20 },
  { id: 'polenta', need: { mais: 1, latte: 1 }, min: 50 },
  { id: 'marmellata', need: { fragola: 2 }, min: 40 },
  { id: 'zuppaporri', need: { porro: 1, patata: 1 }, min: 40 },
  { id: 'insalata', need: { pomodoro: 2 }, min: 10 },
  { id: 'umido', need: { fagioli: 1, pomodoro: 1 }, min: 50 },
  { id: 'crostata', need: { fragola: 1, uovo: 1, latte: 1 }, min: 70 }
];
function cookModal() {
  const st = G.st,
    can = r => Object.entries(r.need).every(([k, v]) => countItem(k) >= v);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Il camino</h2><p class="small">Ogni piatto prende un po' di tempo. I piatti ridanno energia, e agli abitanti piacciono più dei raccolti crudi.</p>` +
      COOK.map(
        (r, i) =>
          `<div class="mrow"><canvas data-i="${r.id}" width="32" height="32"></canvas><span>${ITEMS[r.id].n}<br><span class="small">${Object.entries(
            r.need
          )
            .map(
              ([k, v]) =>
                `<span style="color:${countItem(k) >= v ? 'inherit' : '#a8301a'}">${v} ${ITEMS[k].n.toLowerCase()}</span>`
            )
            .join(
              ' + '
            )} · +${ITEMS[r.id].e} energia</span></span><button class="btn" data-c="${i}" ${can(r) ? '' : 'disabled'}>Cucina</button></div>`
      ).join('')
  );
  $('#mbox')
    .querySelectorAll('canvas[data-i]')
    .forEach(c => c.getContext('2d').drawImage(ICON[c.dataset.i], 0, 0));
  $('#mbox')
    .querySelectorAll('[data-c]')
    .forEach(
      b =>
        (b.onclick = async () => {
          const r = COOK[+b.dataset.c];
          if (!can(r)) return;
          UI._mclose = null;
          UI.close();
          for (const [k, v] of Object.entries(r.need)) removeItem(k, v);
          AU.play('hoe');
          await passTime(r.min);
          AU.play('ok');
          st.flags.cooked = (st.flags.cooked || 0) + 1;
          giveItem(r.id);
        })
    );
}
