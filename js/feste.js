'use strict';
// ================= LE FESTE DI STAGIONE (gioco libero) =================
// Ogni stagione un abitante organizza una festa. Nei cinque giorni prima chiede il tuo aiuto (materiali);
// il giorno della festa, dalle 17 alle 23, tutta la Valle è in piazza: gara, ballo, bancarella.
const FESTE = {
  0: {
    id: 'lanterne',
    n: 'La Festa delle Lanterne',
    day: 24,
    org: 'lucius',
    need: { legna: 20, fibra: 10, zucca: 3 },
    col: ['#f6d98a', '#e8a040', '#fff2c0'],
    intro:
      "Ogni autunno, d'ora in poi, accenderemo lanterne sul fiume. Una per ogni nome del Registro. Per ricordarli, non per contarli. Mi aiuti a prepararla?",
    gara: { n: 'La zucca più bella', ok: id => id === 'zucca' || ITEMS[id].t === 'crop' },
    shop: [
      ['lanternacarta', 180],
      ['s_zucca', 50],
      ['s_barbabietola', 40]
    ]
  },
  1: {
    id: 'fuoco',
    n: 'La Notte del Fuoco',
    day: 15,
    org: 'brom',
    need: { legna: 40, pietra: 10, agrifoglio: 3 },
    col: ['#ff8a3a', '#ffd060', '#c83a1a'],
    intro:
      "Mh. D'inverno si accende un fuoco grande, in piazza. Tutta la notte. Così nessuno ha freddo e nessuno ha paura. Servono legna, pietre per il cerchio, e agrifoglio. Aiuti?",
    gara: { n: 'La zuppa più calda', ok: id => ITEMS[id].t === 'food' },
    shop: [
      ['ghirlanda', 220],
      ['s_porro', 40],
      ['s_spinaci', 30]
    ]
  },
  2: {
    id: 'semi',
    n: 'La Fiera dei Semi',
    day: 13,
    org: 'agatha',
    need: { fibra: 15, tarassaco: 3, uovo: 4 },
    col: ['#f0a8c8', '#c8e8a0', '#fff0a0'],
    intro:
      'Tesoro! In primavera faremo la Fiera dei Semi: ognuno porta i suoi, si scambia, si vende, si balla. Mi servono corde di fibra per gli archi, tarassaco per le ghirlande e uova per le torte. Ci stai?',
    gara: { n: "L'ortaggio più bello", ok: id => ITEMS[id].t === 'crop' },
    shop: [
      ['coronafiori', 200],
      ['alb_ciliegio', 400],
      ['s_fragola', 60],
      ['s_aglio', 35]
    ]
  },
  3: {
    id: 'fiume',
    n: 'La Sagra del Fiume',
    day: 20,
    org: 'clara',
    need: { anguria: 2, pomodoro: 5, legna: 15 },
    col: ['#7ab8f0', '#f8f0a0', '#f08a5a'],
    intro:
      "{n}! A fine estate facciamo la Sagra del Fiume: barchette di legno sull'acqua, angurie fresche, si balla fino a tardi! Mi aiuti? Mi servono angurie, pomodori e un po' di legna per le barchette.",
    gara: { n: "La torta d'estate", ok: id => ITEMS[id].t === 'food' },
    shop: [
      ['barchetta', 160],
      ['alb_pesco', 400],
      ['s_anguria', 90]
    ]
  }
};
Object.assign(ITEMS, {
  lanternacarta: {
    n: 'Lanterna di carta',
    t: 'arredo',
    d: 'Dalla Festa delle Lanterne. Fa una luce gialla, gentile.'
  },
  ghirlanda: {
    n: "Ghirlanda d'inverno",
    t: 'arredo',
    d: 'Dalla Notte del Fuoco. Agrifoglio e nastri rossi.',
    wall: 1
  },
  coronafiori: { n: 'Corona di fiori', t: 'arredo', d: 'Dalla Fiera dei Semi. Profuma ancora.', wall: 1 },
  barchetta: { n: 'Barchetta di legno', t: 'arredo', d: 'Dalla Sagra del Fiume. Con una candela dentro.' }
});
const festOf = st => FESTE[seasonOf(st)];
const festKey = st => yearOf(st) + '-' + seasonOf(st);
const festState = st => {
  st.free.fests = st.free.fests || {};
  return st.free.fests[festKey(st)] || (st.free.fests[festKey(st)] = { c: {} });
};
const festToday = st => isFree(st) && !G.visit && seasonDay(st) === festOf(st).day;
const festLive = st => festToday(st) && st.time >= 17 * 60 && st.time < 23 * 60;
const festSoon = st => {
  if (!isFree(st)) return 0;
  const d = festOf(st).day - seasonDay(st);
  return d > 0 && d <= 5 ? d : 0;
};
const festReady = st => {
  const f = festOf(st),
    c = festState(st).c;
  return Object.entries(f.need).every(([k, n]) => (c[k] || 0) >= n);
};
// posti in piazza durante la festa
const FEST_SPOTS = {
  ezekiel: [44, 17],
  agatha: [48, 19],
  lucius: [41, 18],
  clara: [46, 21],
  brom: [43, 22],
  tobia: [40, 21],
  ottavio: [50, 22],
  irene: [39, 17],
  mercante: [51, 18]
};
function festSched(id, st) {
  if (!festLive(st) || !FEST_SPOTS[id]) return null;
  if ((id === 'ottavio' || id === 'irene' || id === 'mercante') && !outsiderHere(id, st) && id !== 'irene')
    return null;
  const [x, y] = FEST_SPOTS[id];
  return at(x, y, 0, 'festa', 1, { snap: 1 });
}
// obiettivo nel diario
QUESTS.unshift({
  free: 1,
  s: st => isFree(st) && !G.visit && (festSoon(st) || festToday(st)),
  t: st => {
    const f = festOf(st),
      s = festState(st);
    if (festToday(st)) return `${f.n}: oggi, dalle 17:00, in piazza`;
    if (!s.intro)
      return `${NAMES[f.org]} prepara ${f.n}: parlale`.replace(
        'parlale',
        f.org === 'brom' || f.org === 'lucius' ? 'parlagli' : 'parlale'
      );
    const left = Object.entries(f.need)
      .filter(([k, n]) => (s.c[k] || 0) < n)
      .map(([k, n]) => `${n - (s.c[k] || 0)} ${ITEMS[k].n.toLowerCase()}`);
    return left.length
      ? `Per ${f.n} servono ancora: ${left.join(', ')} (porta tutto a ${NAMES[f.org]})`
      : `${f.n} è pronta: tra ${festSoon(st)} ${festSoon(st) === 1 ? 'giorno' : 'giorni'}`;
  },
  d: () => false
});
// cosa manca ancora per la festa e dove trovarlo: lo dice trade.js (Ext 'festDove'), che sa dove sta ogni cosa
const festDove = (f, s) => Ext.run('festDove', f, s);
// parlare durante i preparativi e durante la festa
async function festTalk(n) {
  const st = G.st;
  if (!isFree(st) || G.visit) return false;
  const f = festOf(st),
    s = festState(st);
  if (festLive(st)) {
    if (n.id === f.org) return festMenu(n);
    await say(n.id, festLine(n.id, f));
    return true;
  }
  if (n.id !== f.org || (!festSoon(st) && !festToday(st))) return false;
  if (!s.intro) {
    s.intro = 1;
    await say(n.id, f.intro);
    UI.toast(
      `Per ${f.n} servono: ${Object.entries(f.need)
        .map(([k, v]) => v + ' ' + ITEMS[k].n.toLowerCase())
        .join(', ')}.`
    );
    festDove(f, s);
    UI.quest();
    return true;
  }
  if (festReady(st)) {
    await say(n.id, 'È tutto pronto, grazie a te. Ci vediamo in piazza il giorno della festa, dalle cinque.');
    return true;
  }
  const have = Object.entries(f.need).filter(([k, v]) => (s.c[k] || 0) < v && countItem(k) > 0);
  if (!have.length) {
    await say(n.id, 'Hai trovato quello che serve? Senza fretta. Ma nemmeno troppo piano.');
    festDove(f, s);
    return true;
  }
  const c = await ask(n.id, 'Hai portato qualcosa per la festa?', ['Consegna quello che ho', 'Dopo']);
  if (c !== 0) return true;
  for (const [k, v] of have) {
    const g = Math.min(countItem(k), v - (s.c[k] || 0));
    removeItem(k, g);
    s.c[k] = (s.c[k] || 0) + g;
  }
  AU.play('ok');
  addFriend(n.id, 1);
  if (festReady(st)) {
    addFriend(n.id, 2);
    await say(n.id, "C'è tutto! Sarà la festa più bella che la Valle abbia mai visto. Te lo prometto.");
  } else {
    await say(n.id, 'Grazie! Manca ancora qualcosa, ma siamo a buon punto.');
    festDove(f, s);
  }
  UI.quest();
  return true;
}
const FEST_LINES = {
  lanterne: [
    'Guarda il fiume: sembra pieno di stelle.',
    'Ho acceso una lanterna per il nonno. Spero non ti dispiaccia.',
    'Una lanterna per ogni nome. Così nessuno resta al buio.'
  ],
  fuoco: [
    'Avvicinati al fuoco, che si gela.',
    'Il fuoco più grande che abbia mai visto. E nessuno ha paura.',
    'Stanotte nessuno torna a casa presto. Che bello.'
  ],
  semi: [
    'Ho scambiato i miei semi di zucca con i semi di fragola di Clara!',
    'Senti che profumo di fiori.',
    'La Fiera dei Semi! Dovevamo farla da secoli.'
  ],
  fiume: [
    'Le barchette vanno giù per il fiume fino al bosco. Chissà dove arrivano.',
    'Anguria fresca? Prendine una fetta!',
    'Balla, {n}! Stanotte si balla!'
  ]
};
const festLine = (id, f) => {
  const L = FEST_LINES[f.id];
  return isBday(id)
    ? 'Una festa proprio il giorno del mio compleanno. Che fortuna!'
    : L[(G.st.time + id.length) % L.length];
};
async function festMenu(n) {
  const st = G.st,
    f = festOf(st),
    s = festState(st);
  const c = await ask(
    n.id,
    `Benvenut{o|a} a ${f.n}!${festReady(st) ? ' È stata possibile grazie a te.' : ''}`,
    [
      s.gara ? 'La gara (fatta)' : 'La gara: ' + f.gara.n,
      s.ballo ? 'Il ballo (fatto)' : 'Il ballo',
      'La bancarella della festa',
      'Niente'
    ]
  );
  if (c === 0 && !s.gara) return festContest(n, f, s);
  if (c === 1 && !s.ballo) return festDance(n, f, s);
  if (c === 2) {
    festShop(f);
    return true;
  }
  return true;
}
async function festContest(n, f, s) {
  const st = G.st,
    L = st.inv.map((x, i) => [x, i]).filter(([x]) => x && f.gara.ok(x.id));
  if (!L.length) {
    await say(
      n.id,
      `Per «${f.gara.n}» ti serve ${f.gara.ok('zuppa') ? 'un piatto cucinato' : 'un raccolto'}. Torna quando ce l'hai: la gara dura tutta la sera.`
    );
    return true;
  }
  const best = L.sort((a, b) => val(b[0].id) - val(a[0].id)).slice(0, 4);
  const c = await ask(n.id, `Cosa presenti a «${f.gara.n}»?`, [
    ...best.map(([x]) => ITEMS[x.id].n),
    'Niente'
  ]);
  if (c >= best.length) return true;
  const id = best[c][0].id;
  removeItem(id, 1);
  const me = val(id) * (0.85 + Math.random() * 0.4) * (festReady(st) ? 1.1 : 1),
    rivals = [0, 1, 2].map(i => val(id) * (0.6 + Math.random() * 0.6) + i * 8),
    rank = 1 + rivals.filter(r => r > me).length;
  s.gara = rank;
  await narr(
    `La giuria guarda, soppesa, assaggia. ${['Ezekiel', 'Agatha', 'Lucius'].join(', ')} parlano piano tra loro.`
  );
  const prize = {
    1: [500, 'Primo premio'],
    2: [200, 'Secondo posto'],
    3: [100, 'Terzo posto'],
    4: [30, "Menzione d'onore"]
  }[rank];
  st.money += prize[0];
  AU.play(rank === 1 ? 'coin' : 'ok');
  UI.hud();
  await say(
    n.id,
    rank === 1
      ? `${prize[1]}! ${ITEMS[id].n}: la migliore di tutta la Valle. Ecco ${SC(prize[0])}.`
      : `${prize[1]}: ${SC(prize[0])}. Brav{o|a}, la prossima volta vinci.`
  );
  if (rank === 1) giveItem(f.shop[0][0]);
  return true;
}
async function festDance(n, f, s) {
  const ok = FRIENDS.filter(id => id !== n.id && hearts(id) >= 4 && NPC(id) && !NPC(id).hidden);
  if (!ok.length) {
    await say(
      n.id,
      'Per ballare serve qualcuno che ti voglia bene, {n}. Ci arriverai. Intanto guarda: anche guardare è bello.'
    );
    return true;
  }
  const c = await ask(null, 'Con chi vuoi ballare?', [...ok.slice(0, 4).map(id => NAMES[id]), 'Con nessuno']);
  const who = ok[c];
  if (!who) return true;
  s.ballo = who;
  addFriend(who, 5);
  AU.play('ok');
  await narr(
    `Balli con ${NAMES[who]}. La musica è allegra e un po' stonata, come deve essere. Ridete tutti e due, e nessuno conta niente.`
  );
  floatText('♥♥', NPC(who).x, NPC(who).y - 30, '#ff7a6a');
  await say(who, 'Grazie, {n}. Me lo ricorderò.');
  return true;
}
function festShop(f) {
  const st = G.st;
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>La bancarella</h2><p class="small">Cose che si trovano solo a ${f.n}. — Hai <b>${CZ(st.money)}</b></p>` +
      f.shop
        .map(
          ([id, p]) =>
            `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}<br><span class="small">${ITEMS[id].d || ''}</span></span><b class="price">${CZ(p)}</b><button class="btn" data-f="${id}" ${st.money >= p ? '' : 'disabled'}>Compra</button></div>`
        )
        .join('')
  );
  $('#mbox')
    .querySelectorAll('canvas[data-i]')
    .forEach(c => {
      const i = ICON[c.dataset.i];
      if (i) c.getContext('2d').drawImage(i, 0, 0);
    });
  $('#mbox')
    .querySelectorAll('[data-f]')
    .forEach(
      b =>
        (b.onclick = () => {
          const [id, p] = f.shop.find(x => x[0] === b.dataset.f);
          if (st.money < p || !addItem(id, 1)) return;
          st.money -= p;
          AU.play('coin');
          UI.hud();
          UI._mclose = null;
          festShop(f);
        })
    );
}
const val = id => ITEMS[id].v || (ITEMS[id].e || 20) * 2.2;
// mattina: avvisi
function festMorning(st) {
  if (!isFree(st)) return;
  const f = festOf(st),
    d = festSoon(st);
  if (festToday(st)) {
    setTimeout(() => UI.toast(`🎉 Oggi è ${f.n}! Dalle 17:00, in piazza.`), 2200);
    if (festReady(st)) for (const id of FRIENDS) addFriend(id, 1);
  } else if (d === 5)
    setTimeout(
      () => UI.toast(`${NAMES[f.org]} sta organizzando ${f.n}: tra cinque giorni. Vuole il tuo aiuto.`),
      2200
    );
}
// addobbi: il giorno della festa, in piazza
function festDecor(m, st) {
  if (m.id !== 'main' || !festToday(st)) return;
  const f = festOf(st),
    rich = festReady(st);
  if (f.id === 'fuoco') {
    m.add(
      OB('fire', 44, 19, IMG.fire[0], {
        wt: 2,
        solid: [
          [44, 19],
          [45, 19]
        ],
        hits: [
          [44, 19],
          [45, 19]
        ],
        anim: 'fire',
        act: 'festfire'
      })
    );
    m.lights.push({ x: 45 * 16, y: 19 * 16 + 4, r: rich ? 120 : 80, fire: 1 });
  }
  if (f.id !== 'fuoco' && rich)
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
          act: 'feastF'
        })
      );
    });
  for (const [x, y] of [
    [38, 15],
    [51, 15],
    [51, 23],
    [38, 23]
  ])
    m.lights.push({ x: x * 16 + 8, y: y * 16 - 6, r: rich ? 70 : 50 });
}
ACT.festfire = () => UI.toast("Il fuoco della Notte del Fuoco. Ti scaldi le mani, e anche qualcos'altro.");
ACT.feastF = () => UI.toast('Tavolate piene di tutto. Nessun posto vuoto apparecchiato, stavolta.');
function drawFest(m) {
  if (m.id !== 'main' || !isFree() || !festToday(G.st)) return;
  const f = festOf(G.st),
    T = G.t,
    rich = festReady(G.st);
  // fili di lucine tra i lampioni della piazza
  const P = [
    [38, 15],
    [51, 15],
    [51, 23],
    [38, 23],
    [38, 15]
  ];
  for (let i = 0; i < 4; i++) {
    const [a, b] = P[i],
      [c, d] = P[i + 1],
      n = rich ? 22 : 12;
    for (let k = 0; k <= n; k++) {
      const u = k / n,
        x = (a + (c - a) * u) * 16 + 8,
        y = (b + (d - b) * u) * 16 - 14 + Math.sin(u * Math.PI) * 6;
      ctx.fillStyle = f.col[(k + Math.floor(T * 2)) % f.col.length];
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
  // lanterne o barchette sul fiume
  if (f.id === 'lanterne' || f.id === 'fiume') {
    const n = rich ? 26 : 12;
    for (let i = 0; i < n; i++) {
      const x = ((i * 53 + T * (f.id === 'fiume' ? 10 : 5)) % (60 * 16)) + 3 * 16,
        y = 43 * 16 + 6 + (i % 3) * 5 + Math.sin(T + i) * 1.5;
      if (f.id === 'lanterne') {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
        g.addColorStop(0, 'rgba(255,210,110,.6)');
        g.addColorStop(1, 'rgba(255,210,110,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 8, y - 8, 16, 16);
        ctx.fillStyle = '#ffe08a';
        ctx.fillRect(Math.round(x) - 1, Math.round(y) - 2, 3, 3);
      } else {
        ctx.fillStyle = '#8a5a30';
        ctx.fillRect(Math.round(x) - 3, Math.round(y), 7, 2);
        ctx.fillStyle = '#f8f0d0';
        ctx.fillRect(Math.round(x), Math.round(y) - 3, 1, 3);
        ctx.fillStyle = '#ffd060';
        ctx.fillRect(Math.round(x), Math.round(y) - 4, 1, 1);
      }
    }
  }
  // archi di fiori alla fiera
  if (f.id === 'semi')
    for (const [x, y] of [
      [44, 13],
      [44, 24]
    ]) {
      for (let k = 0; k < 14; k++) {
        const a = (Math.PI * k) / 13,
          X = x * 16 + 8 + Math.cos(a) * 18,
          Y = y * 16 - Math.sin(a) * 18;
        ctx.fillStyle = f.col[k % 3];
        ctx.fillRect(Math.round(X) - 1, Math.round(Y) - 1, 3, 3);
      }
    }
}
function genFestArtBase() {
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  I('lanternacarta', P => {
    P.rect(15, 3, 2, 5, rp('#5a3a1e'));
    P.body(
      8,
      27,
      () => 16,
      Y => 8 - Math.abs(Y - 17) * 0.35,
      rp('#f6d98a'),
      { amb: 0.9, nyF: () => 0.1 }
    );
    for (const y of [13, 19, 24]) P.rect(9, y, 14, 1, rp('#c88a3e'));
  });
  I('ghirlanda', P => {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      P.ellipse(16 + Math.cos(a) * 10, 16 + Math.sin(a) * 10, 3.4, 2.4, rp(i % 2 ? '#2a6a3a' : '#3e7a4a'), {
        spec: 0.3
      });
    }
    P.ellipse(16, 26, 3, 3, rp('#d8202a'), { spec: 0.8 });
  });
  I('coronafiori', P => {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      P.ellipse(
        16 + Math.cos(a) * 10,
        16 + Math.sin(a) * 9,
        3,
        3,
        rp(['#f0a8c8', '#fff0a0', '#c8b8f8'][i % 3]),
        { spec: 0.4 }
      );
    }
  });
  I('barchetta', P => {
    P.body(
      18,
      25,
      () => 16,
      Y => 12 - (Y - 18) * 1.2,
      rp('#8a5a30'),
      { nyF: () => 0.3, mod: woodMod }
    );
    P.rect(15, 8, 2, 11, rp('#f8f0d0'));
    P.ellipse(16, 6, 1.6, 2.4, rp('#ffd060'), { amb: 0.95, edge: false });
  });
  const S = (w, h, fn) => SP(w, h, fn);
  FREEIMG.lanternacarta = S(10, 20, P => {
    P.rect(9, 0, 2, 6, rp('#5a3a1e'));
    P.body(
      6,
      38,
      () => 10,
      Y => 7 - Math.abs(Y - 22) * 0.25,
      rp('#f6d98a'),
      { amb: 0.9, nyF: () => 0.1 }
    );
    for (const y of [14, 22, 30]) P.rect(3, y, 14, 1, rp('#c88a3e'));
  });
  FREEIMG.ghirlanda = S(16, 16, P => {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      P.ellipse(16 + Math.cos(a) * 11, 16 + Math.sin(a) * 11, 3.6, 2.6, rp(i % 2 ? '#2a6a3a' : '#3e7a4a'), {
        spec: 0.3
      });
    }
    P.ellipse(16, 27, 3, 3, rp('#d8202a'), { spec: 0.8 });
  });
  FREEIMG.coronafiori = S(16, 16, P => {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      P.ellipse(
        16 + Math.cos(a) * 11,
        16 + Math.sin(a) * 10,
        3.2,
        3.2,
        rp(['#f0a8c8', '#fff0a0', '#c8b8f8'][i % 3]),
        { spec: 0.4 }
      );
    }
  });
  FREEIMG.barchetta = S(16, 14, P => {
    P.body(
      18,
      26,
      () => 16,
      Y => 13 - (Y - 18) * 1.2,
      rp('#8a5a30'),
      { nyF: () => 0.3, mod: woodMod }
    );
    P.rect(15, 6, 2, 12, rp('#f8f0d0'));
    P.ellipse(16, 4, 1.6, 2.4, rp('#ffd060'), { amb: 0.95, edge: false });
  });
}

// catena: altri file la avvolgono con Ext.avvolgi('genFestArt', …)
function genFestArt(...a) {
  return Ext.catena('genFestArt', genFestArtBase, this, a);
}
