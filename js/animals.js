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
  // pollaio e stalla: i disegni sono in grafica.js (ART2)
  AIMG.pollaio = ART2.pollaio();
  AIMG.stalla = ART2.stalla();
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

// ---------- quello che gli animali lasciano in casa ----------
// Uova, latte, lana: ogni mattina finiscono dentro la loro casa (b.dentro = { id: quanti }) e si prendono
// dalla sua schermata, scegliendo cosa e quanto. Niente più uova a terra tra le zampe delle galline.
function dentroDi(k, st = G.st) {
  const b = st.free.built[k];
  b.dentro = b.dentro || {};
  // salvataggi di prima: latte e lana pronti stavano sulla bestia, adesso entrano in casa
  if (!b.dentroV) {
    b.dentroV = 1;
    for (const a of (st.free.animals || []).filter(a => a.home === k)) {
      const A = ANIMALS[a.kind];
      if (A && A.mode !== 'ground' && a.prod) b.dentro[A.prod] = (b.dentro[A.prod] || 0) + 1;
    }
  }
  return b.dentro;
}
const dentroTot = b => Object.values(b.dentro || {}).reduce((n, v) => n + v, 0);
// prendi n di un prodotto: quello che non entra nello zaino resta in casa
function prendiDentro(k, id, n) {
  const D = dentroDi(k);
  let preso = 0;
  while (preso < n && D[id] > 0 && addItemBase(id, 1)) {
    D[id]--;
    preso++;
  }
  if (!D[id]) delete D[id];
  if (!preso) {
    UI.toast('Lo zaino è pieno!', 'bad');
    return 0;
  }
  Ext.run('ottieni', id, preso);
  // chi passa di lì commenta (le stesse reazioni di quando si mungeva e si tosava a mano)
  const A = Object.values(ANIMALS).find(A => A.prod === id);
  if (A && A.mode !== 'ground') Dialoghi.evento(A.mode === 'shear' ? 'tosatura' : 'mungitura', { item: id });
  // le pecore a cui hai preso la lana restano tosate fino alla prossima
  let c = preso;
  for (const a of animalsOf(k))
    if (c > 0 && ANIMALS[a.kind].prod === id && a.prod) {
      a.prod = false;
      c--;
    }
  AU.play('pick');
  UI.toast(`Hai preso: ${ITEMS[id].n}${preso > 1 ? ' ×' + preso : ''}.`);
  return preso;
}

// ---------- la schermata della casa degli animali ----------
function barnMenu(k) {
  const st = G.st,
    b = st.free.built[k],
    kinds = kindsFor(b.id),
    cap = capFor(b.id),
    L = animalsOf(k),
    D = dentroDi(k),
    win = seasonOf() === 1;
  b.hay = b.hay || 0;
  const hayN = countItem('fieno'),
    cuori = a => '♥'.repeat(Math.round(a.love / 2)) + '♡'.repeat(5 - Math.round(a.love / 2)),
    prodotti = Object.keys(D).filter(id => D[id] > 0 && ITEMS[id]);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${ITEMS[b.id].n}</h2>` +
      `<p class="small">${L.length}/${cap} bestie · Fieno nella mangiatoia: ${b.hay} · ${win ? "<b>D'inverno non si pascola: serve fieno.</b>" : 'Di giorno pascolano fuori, la sera rientrano.'}</p>` +
      `<h3>In casa</h3>` +
      (prodotti.length
        ? prodotti
            .map(
              id =>
                `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span><b>${esc(ITEMS[id].n)}</b> ×${D[id]}</span><button class="btn" data-p="${id}" data-n="1">Prendi 1</button><button class="btn" data-p="${id}" data-n="${D[id]}">Prendi tutto</button></div>`
            )
            .join('')
        : `<p class="small">Per ora niente: ${L.length ? 'ogni mattina, se stanno bene, lasciano qualcosa qui.' : 'prima servono le bestie.'}</p>`) +
      `<h3>Le bestie</h3>` +
      (L.length
        ? L.map(
            a =>
              `<div class="mrow"><canvas data-a="${a.kind}" width="32" height="32"></canvas><span><b>${esc(a.name)}</b> <span class="small">(${ANIMALS[a.kind].n.toLowerCase()})</span> <span class="hearts">${cuori(a)}</span><br><span class="small">${a.pet ? 'Accarezzata oggi.' : "Non l'hai ancora accarezzata oggi."}${a.hungry ? ' Ha fame!' : ''}</span></span></div>`
          ).join('')
        : '<p class="small">Nessuna, per ora.</p>') +
      `<p>${hayN ? `<button class="btn" data-h="1">Metti fieno (${hayN})</button> ` : ''}${
        L.length < cap
          ? kinds
              .map(kk => {
                const A = ANIMALS[kk];
                return `<button class="btn" data-buy="${kk}" ${st.money >= A.cost ? '' : 'disabled'}>Compra ${A.art} (${CZ(A.cost)})</button>`;
              })
              .join(' ')
          : ''
      }</p>` +
      `<p class="small">Accarezzale ogni giorno (fuori, di giorno): più ti vogliono bene, più spesso lasciano ${kinds
        .map(kk => SG[ANIMALS[kk].prod] || ITEMS[ANIMALS[kk].prod].n.toLowerCase())
        .join(' o ')} in casa.</p>`
  );
  const box = $('#mbox');
  box.querySelectorAll('canvas[data-a]').forEach(c => {
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const im = animalImg(c.dataset.a, false, 0),
      h = (im.height * 32) / im.width;
    x.drawImage(im, 0, 32 - h, 32, h);
  });
  box.querySelectorAll('canvas[data-i]').forEach(c => {
    if (ICON[c.dataset.i]) c.getContext('2d').drawImage(ICON[c.dataset.i], 0, 0);
  });
  const ancora = () => {
    UI._mclose = null;
    const y = box.scrollTop;
    barnMenu(k);
    box.scrollTop = y;
  };
  box.querySelectorAll('[data-p]').forEach(
    bt =>
      (bt.onclick = () => {
        prendiDentro(k, bt.dataset.p, +bt.dataset.n);
        ancora();
      })
  );
  const h = box.querySelector('[data-h]');
  if (h)
    h.onclick = () => {
      const n = countItem('fieno');
      removeItem('fieno', n);
      b.hay += n;
      AU.play('pick');
      ancora();
    };
  box.querySelectorAll('[data-buy]').forEach(
    by =>
      (by.onclick = () => {
        const kind = by.dataset.buy,
          A = ANIMALS[kind];
        if (st.money < A.cost || animalsOf(k).length >= cap) return;
        st.money -= A.cost;
        const used = new Set((st.free.animals || []).map(a => a.name)),
          nm = [...ANAMES, ...ANAMES2].find(n => !used.has(n)) || A.n;
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
        ancora();
      })
  );
}

// ---------- vita degli animali ----------
// Di giorno pascolano attorno alla loro casa; la sera (o col buio) tornano alla porta ed entrano; la mattina
// escono. Dentro non si vedono e non si toccano.
const ANIM_ESCONO = 6 * 60 + 30,
  ANIM_RIENTRANO = 19 * 60 + 30;
const animSera = () => {
  const t = G.st.time;
  return t >= ANIM_RIENTRANO || t < ANIM_ESCONO;
};
function spawnFarmAnimals() {
  const st = G.st;
  G.fanimals = [];
  if (!isFree(st)) return;
  const sera = animSera();
  for (const a of st.free.animals || []) {
    const b = st.free.built[a.home];
    if (!b) continue;
    const [ax, ay] = a.home.split(',').map(Number),
      px = ax * 16 + 8,
      py = (ay + 1) * 16 + 4; // la porta, sul lato basso della casa
    G.fanimals.push({
      a,
      x: sera ? px : (ax + (Math.random() * 4 - 2)) * 16 + 8,
      y: sera ? py : (ay + 1.6 + Math.random() * 1.5) * 16,
      px,
      py,
      hx: px,
      hy: (ay + 2) * 16,
      dir: 1,
      t: Math.random() * 3,
      f: 0,
      st: 'idle',
      dentro: sera
    });
  }
}
function animalsTick(dt) {
  if (!G.fanimals || G.map.id !== 'main') return;
  const sera = animSera();
  for (const e of G.fanimals) {
    e.t -= dt;
    if (sera) {
      if (e.dentro) continue;
      // verso la porta, poi dentro
      e.tx = e.px;
      e.ty = e.py;
      e.st = 'move';
    } else if (e.dentro) {
      // la mattina escono uno alla volta (ognuno col suo attimo)
      if (e.t > 0) continue;
      e.dentro = false;
      e.x = e.px;
      e.y = e.py;
      e.st = 'idle';
      e.t = 0.5;
    }
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
        if (sera) {
          e.dentro = true;
          e.t = Math.random() * 6;
        }
        e.st = 'idle';
        continue;
      }
      const sp = (e.a.kind === 'mucca' ? 12 : 18) * (sera ? 1.6 : 1),
        nx = e.x + (dx / d) * sp * dt,
        ny = e.y + (dy / d) * sp * dt;
      // rientrando non si fermano per un ostacolo: scivolano verso la porta
      if (!sera && G.map.solid(Math.floor(nx / 16), Math.floor((ny - 3) / 16))) {
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
  if (e.dentro) return;
  const a = e.a,
    im = animalImg(a.kind, e.st === 'move', e.f),
    w = iw(im),
    h = ih(im),
    X = Math.round(e.x),
    Y = Math.round(e.y);
  const shorn = a.kind === 'pecora' && !a.prod && AIMG.pecoraTosata;
  const img = shorn ? AIMG.pecoraTosata[e.st === 'move' ? Math.floor(e.f) % 2 : 0] : im;
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(X, Y, w * 0.35, 1.3, 0, 0, 7);
  ctx.fill();
  if (e.dir < 0) {
    ctx.save();
    ctx.translate(X, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, Y - h, w, h);
    ctx.restore();
  } else ctx.drawImage(img, X - w / 2, Y - h, w, h);
}
// davanti a una bestia: una carezza (i prodotti si prendono in casa loro)
function animalAct(ax, ay) {
  const e = (G.fanimals || []).find(e => !e.dentro && Math.hypot(e.x - ax, e.y - ay) < 18);
  if (!e) return false;
  const a = e.a,
    snd = { gallina: 'cluck', anatra: 'cluck' }[a.kind] || 'ok',
    voc =
      {
        gallina: 'chioccia contenta',
        anatra: 'starnazza felice',
        mucca: 'muggisce piano',
        capra: 'bela e ti mordicchia la manica',
        pecora: 'bela e si struscia'
      }[a.kind] || 'è contenta';
  if (!a.pet) {
    a.pet = true;
    a.love = Math.min(10, a.love + 1);
    AU.play(snd);
    floatText('♥', e.x, e.y - 22, '#ff7a6a');
    UI.toast(`${a.name} ${voc}.`);
  } else {
    floatText('♥', e.x, e.y - 22, '#ffb0a0', 0.7);
    UI.toast(
      `${a.name} oggi è già stata coccolata. ${a.hungry ? 'Ha fame: metti fieno nella mangiatoia.' : 'Sta bene.'}`
    );
  }
  return true;
}
// sopra la casa, quando dentro c'è qualcosa da prendere: il prodotto in una nuvoletta
Ext.on('drawWorldExtras', m => {
  const st = G.st;
  if (!m || m.id !== 'main' || !isFree(st) || !st.free.animals) return;
  for (const k in st.free.built) {
    const b = st.free.built[k];
    if (!kindsFor(b.id).length || !dentroTot(b) || !AIMG[b.id]) continue;
    const id = Object.keys(b.dentro).find(i => b.dentro[i] > 0 && ICON[i]);
    if (!id) continue;
    const [ax, ay] = k.split(',').map(Number),
      { x0, w } = bldFoot(b.id, ax, ay),
      X = Math.round((x0 + w / 2) * 16),
      Y = Math.round((ay + 1) * 16 - ih(AIMG[b.id]) - 6 + Math.sin(G.t * 3) * 1.5);
    ctx.fillStyle = 'rgba(20,12,8,.55)';
    ctx.fillRect(X - 7, Y - 7, 14, 14);
    ctx.fillStyle = '#f4ead0';
    ctx.fillRect(X - 6, Y - 6, 12, 12);
    ctx.drawImage(ICON[id], X - 6, Y - 6, 12, 12);
  }
});
// ogni mattina: si mangia (pascolo o fieno), si produce (in casa), l'affetto cresce o cala
function animalsMorning(st) {
  if (!isFree(st) || !st.free.animals) return;
  const win = seasonOf(st) === 1;
  for (const a of st.free.animals) {
    const b = st.free.built[a.home];
    if (!b) continue;
    b.hay = b.hay || 0;
    dentroDi(a.home, st);
    const A = ANIMALS[a.kind] || ANIMALS.gallina;
    let fed = true;
    if (win) {
      if (b.hay > 0) b.hay--;
      else fed = false;
    }
    a.hungry = !fed;
    a.love = clamp(a.love + (a.pet ? 0 : -1) + (fed ? 0 : -1), 0, 10);
    a.pet = false;
    const chance = (fed ? 0.55 + a.love * 0.045 : 0) * (A.mode === 'shear' ? 0.6 : 1);
    if (Math.random() < chance) {
      b.dentro[A.prod] = (b.dentro[A.prod] || 0) + 1;
      a.prod = true;
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
