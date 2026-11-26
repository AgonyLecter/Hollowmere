'use strict';
// ================= GIOCO LIBERO: la Valle dopo il finale =================
// Stagioni vere, attrezzi, risorse, banco da lavoro, oggetti da costruire. Si attiva con st.free.

// colture: stagioni in cui crescono (0 autunno, 1 inverno, 2 primavera, 3 estate)
Object.assign(CROPS.rapa, { s: [0, 2] });
Object.assign(CROPS.patata, { s: [0, 2] });
Object.assign(CROPS.zucca, { s: [0] });
Object.assign(CROPS.fagioli, { s: [0, 3] });
Object.assign(CROPS.cavolo, { s: [0, 1] });
Object.assign(CROPS, {
  fragola: { days: 4, n: 'Fragole', y: [1, 2], re: 2, s: [2] },
  pomodoro: { days: 5, n: 'Pomodori', y: [1, 3], re: 2, s: [3] },
  mais: { days: 5, n: 'Mais', y: [1, 2], s: [3] },
  porro: { days: 4, n: 'Porro', y: [1, 1], s: [1] }
});
Object.assign(ITEMS, {
  s_fragola: { n: 'Semi di fragola', t: 'seed', crop: 'fragola', p: 70, x: 'Si raccolgono più volte.' },
  s_pomodoro: { n: 'Semi di pomodoro', t: 'seed', crop: 'pomodoro', p: 60, x: 'Si raccolgono più volte.' },
  s_mais: { n: 'Semi di mais', t: 'seed', crop: 'mais', p: 55 },
  s_porro: { n: 'Semi di porro', t: 'seed', crop: 'porro', p: 45, x: "L'unico che non teme il gelo." },
  fragola: { n: 'Fragole', t: 'crop', v: 55 },
  pomodoro: { n: 'Pomodori', t: 'crop', v: 45 },
  mais: { n: 'Mais', t: 'crop', v: 120 },
  porro: { n: 'Porro', t: 'crop', v: 150 },
  // attrezzi e risorse
  accetta: { n: 'Accetta', t: 'tool', d: 'Abbatte alberi e taglia rami. Di Brom.' },
  piccone: { n: 'Piccone', t: 'tool', d: 'Spacca sassi e rocce. Di Brom.' },
  legna: { n: 'Legna', t: 'res', d: 'Dagli alberi e dai rami. Serve al banco da lavoro.' },
  pietra: { n: 'Pietra', t: 'res', d: 'Dalle rocce. Serve al banco da lavoro.' },
  fibra: { n: 'Fibra', t: 'res', d: 'Dalle erbacce. Si intreccia.' },
  // oggetti da piazzare
  banco: { n: 'Banco da lavoro', t: 'place', d: 'Mettilo a terra e usalo per costruire.' },
  cassa: { n: 'Cassa', t: 'place', d: 'Venti posti per le tue cose.' },
  irrigatore: { n: 'Irrigatore', t: 'place', d: 'Ogni mattina bagna le quattro zolle intorno.' },
  lampione: { n: 'Lampione', t: 'place', d: 'Una luce gialla tutta tua. Di notte fa compagnia.' },
  recinto: { n: 'Recinto', t: 'place', d: 'Un pezzo di staccionata.' },
  panchina: { n: 'Panchina', t: 'place', d: 'Per sedersi a guardare la Valle.' }
});
Object.assign(PL, {
  fragola: 'cestini di fragole',
  pomodoro: 'cestini di pomodori',
  mais: 'pannocchie',
  porro: 'porri'
});
Object.assign(SG, {
  fragola: 'un cestino di fragole',
  pomodoro: 'un cestino di pomodori',
  mais: 'una pannocchia',
  porro: 'un porro'
});
Object.assign(FAV_VAL, { fragola: 55, pomodoro: 45, mais: 120, porro: 150 });
const cropInSeason = (t, s) => !CROPS[t].s || CROPS[t].s.includes(s);

// ricette del banco da lavoro
const CRAFTS = [
  { id: 'recinto', q: 2, c: { legna: 2 } },
  { id: 'concime', q: 2, c: { fibra: 5 } },
  { id: 'cassa', q: 1, c: { legna: 25 } },
  { id: 'panchina', q: 1, c: { legna: 15, pietra: 5 } },
  { id: 'lampione', q: 1, c: { legna: 5, pietra: 12, fibra: 2 } },
  { id: 'irrigatore', q: 1, c: { pietra: 20, legna: 10, fibra: 5 } },
  { id: 'banco', q: 1, c: { legna: 20, pietra: 5 } }
];
// che attrezzo serve per togliere un oggetto piazzato
const PLACE_TOOL = {
  banco: 'accetta',
  cassa: 'accetta',
  recinto: 'accetta',
  panchina: 'accetta',
  lampione: 'piccone',
  irrigatore: 'piccone'
};

// ---------- grafica ----------
const FREEIMG = {};
function genFreeArtBase() {
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  const wood = rp('#8a5a30'),
    iron = rp('#9a9aa2'),
    stone = rp('#8a877d');
  I('accetta', P => {
    P.capsule(8, 29, 22, 7, 1.6, wood);
    P.ellipse(23, 8, 6, 5, iron, { spec: 0.8, clip: (X, Y) => X > 19 });
    P.rect(19, 4, 4, 8, iron, { spec: 0.6 });
  });
  I('piccone', P => {
    P.capsule(16, 29, 16, 8, 1.6, wood);
    P.capsule(4, 10, 28, 10, 2, iron, { r2: 1.2, spec: 0.8 });
    P.capsule(4, 10, 3, 15, 1.2, iron);
  });
  I('legna', P => {
    for (const [y, x0] of [
      [22, 6],
      [16, 10],
      [22, 16]
    ]) {
      P.capsule(x0, y, x0 + 12, y, 4, rp('#8a5a30'), { spec: 0.2 });
      P.ellipse(x0 + 12, y, 3, 4, rp('#d8b078'), { spec: 0.4 });
    }
  });
  I('pietra', P => {
    P.ellipse(13, 20, 9, 7, stone, { spec: 0.4 });
    P.ellipse(21, 16, 7, 6, rp('#9a978d'), { spec: 0.4 });
  });
  I('fibra', P => {
    for (let i = 0; i < 5; i++)
      P.capsule(10 + i * 3, 28, 8 + i * 4, 5 + (i % 2) * 3, 1, rp(i % 2 ? '#7aa83a' : '#5a8a2a'), {
        r2: 0.6
      });
  });
  I('banco', P => {
    P.rect(4, 10, 24, 6, wood, { mod: woodMod, spec: 0.3 });
    P.rect(6, 16, 3, 13, rp('#5a3a1e'));
    P.rect(23, 16, 3, 13, rp('#5a3a1e'));
    P.capsule(9, 8, 15, 8, 1, iron);
    P.rect(18, 6, 6, 4, rp('#6a6a72'), { spec: 0.6 });
  });
  I('cassa', P => {
    P.rect(5, 9, 22, 18, wood, { mod: woodMod, spec: 0.2 });
    P.rect(5, 9, 22, 6, rp('#6a4424'), { spec: 0.3 });
    P.rect(14, 13, 4, 5, rp('#d8a84a'), { spec: 0.8 });
  });
  I('irrigatore', P => {
    P.ellipse(16, 22, 9, 4, stone, { spec: 0.3 });
    P.capsule(16, 22, 16, 10, 2, rp('#6a6a72'), { spec: 0.6 });
    P.ellipse(16, 9, 4, 2.4, rp('#8a9aa8'), { spec: 0.8 });
    for (const [a, b] of [
      [8, 6],
      [24, 6],
      [6, 12],
      [26, 12]
    ])
      P.ellipse(a, b, 1.2, 1.2, rp('#7ab0e8'), { edge: false });
  });
  I('lampione', P => {
    P.rect(15, 10, 3, 19, rp('#3a3a40'), { spec: 0.4 });
    P.rect(10, 27, 13, 3, stone);
    P.rect(11, 3, 11, 9, rp('#3a3a40'));
    P.rect(13, 5, 7, 5, rp('#ffe08a'), { amb: 0.95, edge: false });
  });
  I('recinto', P => {
    for (const x of [7, 23]) P.rect(x, 8, 4, 20, rp('#e8c23a'), { mod: woodMod });
    P.rect(4, 12, 24, 3, rp('#e8c23a'));
    P.rect(4, 20, 24, 3, rp('#e8c23a'));
  });
  I('panchina', P => {
    P.rect(4, 12, 24, 5, wood, { mod: woodMod });
    P.rect(4, 6, 24, 4, wood, { mod: woodMod });
    P.rect(6, 17, 2, 10, rp('#3a2414'));
    P.rect(24, 17, 2, 10, rp('#3a2414'));
  });
  I('fragola', P => {
    for (const [a, b] of [
      [11, 19],
      [21, 18],
      [16, 24]
    ]) {
      P.ellipse(a, b, 5, 6, rp('#d8302a'), { spec: 0.6 });
      P.set(a - 1, b, C('#f8e070'));
      P.set(a + 1, b + 2, C('#f8e070'));
    }
    P.capsule(12, 10, 20, 9, 1.4, rp('#5a9a2a'));
  });
  I('pomodoro', P => {
    P.ellipse(16, 19, 10, 9, rp('#e0402a'), { spec: 0.7 });
    P.capsule(12, 10, 20, 10, 1.2, rp('#4a8a2a'));
    P.capsule(16, 10, 16, 6, 1, rp('#4a8a2a'));
  });
  I('mais', P => {
    P.capsule(16, 28, 16, 7, 5, rp('#f0c83a'), {
      r2: 3,
      spec: 0.5,
      mod: (X, Y, v) => ((X + Y * 2) % 4 === 0 ? v - 0.2 : v)
    });
    P.capsule(9, 28, 14, 10, 1.6, rp('#7aa83a'), { r2: 0.6 });
    P.capsule(23, 28, 18, 10, 1.6, rp('#5a8a2a'), { r2: 0.6 });
  });
  I('porro', P => {
    P.capsule(16, 30, 16, 16, 3.4, rp('#f2f0e0'), { spec: 0.4 });
    P.capsule(16, 18, 8, 3, 1.6, rp('#5a8a4a'), { r2: 2.4 });
    P.capsule(16, 18, 24, 3, 1.6, rp('#4a7a3a'), { r2: 2.4 });
    P.capsule(16, 18, 16, 2, 1.6, rp('#6a9a5a'), { r2: 2.2 });
  });
  const packet = (id, crop, col) => {
    const P = new PX(32, 32);
    P.rect(6, 4, 20, 26, rp('#e8d6a8'), { n: [0.1, -0.2, 1] });
    P.rect(6, 3, 20, 4, rp('#b89a68'), { n: [0, -0.6, 0.8] });
    P.rect(6, 24, 20, 5, rp(col), { n: [0, -0.2, 1] });
    P.outline();
    const c = pxCanvas(P),
      x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(ICON[crop], 8, 6, 16, 16);
    ICON[id] = c;
  };
  packet('s_fragola', 'fragola', '#d8302a');
  packet('s_pomodoro', 'pomodoro', '#e0402a');
  packet('s_mais', 'mais', '#c9a03a');
  packet('s_porro', 'porro', '#4a7a3a');
  // oggetti nel mondo
  FREEIMG.ramo = SP(16, 10, P => {
    P.capsule(6, 14, 26, 10, 1.6, wood);
    P.capsule(16, 12, 20, 5, 1, wood);
    P.ellipse(24, 8, 2, 1.6, rp('#5a8a2a'));
  });
  FREEIMG.sasso = SP(14, 10, P => {
    P.ellipse(14, 12, 10, 7, stone, { spec: 0.4 });
    P.ellipse(10, 10, 3, 2, rp('#a8a59a'), { edge: false });
  });
  FREEIMG.erbaccia = SP(14, 12, P => {
    for (let i = 0; i < 6; i++)
      P.capsule(8 + i * 2.6, 22, 4 + i * 4, 4 + (i % 3) * 3, 0.9, rp(i % 2 ? '#6a9a2a' : '#4a7a24'), {
        r2: 0.5
      });
  });
  FREEIMG.banco = SP(18, 18, P => {
    P.rect(2, 10, 32, 8, wood, { mod: woodMod, spec: 0.3 });
    P.rect(4, 18, 4, 16, rp('#5a3a1e'));
    P.rect(28, 18, 4, 16, rp('#5a3a1e'));
    P.rect(6, 4, 10, 6, rp('#6a6a72'), { spec: 0.6 });
    P.capsule(20, 7, 30, 7, 1.2, rp('#8a5a30'));
  });
  FREEIMG.cassa = SP(16, 15, P => {
    P.rect(2, 6, 28, 22, wood, { mod: woodMod, spec: 0.2 });
    P.rect(2, 6, 28, 8, rp('#6a4424'), { spec: 0.3 });
    P.rect(13, 11, 6, 7, rp('#d8a84a'), { spec: 0.8 });
  });
  FREEIMG.irrigatore = SP(14, 14, P => {
    P.ellipse(14, 22, 10, 4, stone, { spec: 0.3 });
    P.capsule(14, 22, 14, 10, 2.2, rp('#6a6a72'), { spec: 0.6 });
    P.ellipse(14, 8, 5, 3, rp('#8a9aa8'), { spec: 0.8 });
  });
  // alberi di stagione (stesse forme dell'autunno, altri colori; d'inverno spogli e innevati)
  const PALS = {
    2: [
      ['#1e3a18', '#2e5a22', '#467c2e', '#62a03a', '#86c050', '#b8e07a'],
      ['#3a1e2a', '#6a3448', '#a85878', '#d888a8', '#f0b0c8', '#fde0ea'],
      ['#1a3418', '#2a5020', '#3e702a', '#5a9636', '#7cb848', '#a8d870'],
      ['#1e3a18', '#2e5a22', '#467c2e', '#62a03a', '#86c050', '#b8e07a'],
      ['#16261a', '#253f22', '#3a5c2c', '#56803a', '#77a24a', '#a2c66a']
    ],
    3: [
      ['#102a10', '#1a4218', '#285e22', '#3a7a2c', '#56983a', '#7ab450'],
      ['#142a12', '#20441c', '#305e26', '#447a32', '#5c963e', '#82b25a'],
      ['#0e2410', '#183a16', '#265420', '#36702a', '#4c8c36', '#6aa84a'],
      ['#102a10', '#1a4218', '#285e22', '#3a7a2c', '#56983a', '#7ab450'],
      ['#16261a', '#253f22', '#3a5c2c', '#56803a', '#77a24a', '#a2c66a']
    ]
  };
  const orig = TREEPAL.slice();
  FREEIMG.trees = { 0: IMG.tree };
  for (const s of [2, 3]) {
    PALS[s].forEach((p, i) => (TREEPAL[i] = p));
    FREEIMG.trees[s] = [0, 1, 2, 3, 4].map(genTreeHD);
  }
  orig.forEach((p, i) => (TREEPAL[i] = p));
  FREEIMG.trees[1] = [0, 1, 2, 3, 4].map(winterTree);
  // colture nuove (stessa griglia 32×48 delle altre)
  const S = fn => {
    const P = new PX(32, 48);
    fn(P);
    P.outline();
    const c = pxCanvas(P);
    c.top = imgTop(c);
    return c;
  };
  const soil = rp('#6a4428'),
    stem = rp('#4a7a24'),
    lf = rp('#5a9a2a'),
    lf2 = rp('#3f7424');
  const mound = (P, col) => {
    P.ellipse(16, 42, 7, 2.8, soil, { spec: 0.1 });
    for (const [a, b] of [
      [13, 41],
      [18, 41],
      [16, 43]
    ])
      P.ellipse(a, b, 1.3, 1, rp(col), { edge: false, spec: 0.6 });
  };
  const sprout = P => {
    P.ellipse(16, 43, 5, 1.6, soil, { edge: false });
    P.capsule(16, 43, 16, 35, 0.8, stem);
    P.capsule(16, 36, 10, 32, 0.7, rp('#7aba3a'), { r2: 2.2 });
    P.capsule(16, 35, 22, 31, 0.7, rp('#7aba3a'), { r2: 2.2 });
  };
  CROPIMG.fragola = [
    S(P => mound(P, '#e8d0a0')),
    S(sprout),
    S(P => {
      for (const [a, b] of [
        [8, 34],
        [16, 30],
        [24, 34],
        [12, 38],
        [20, 38]
      ])
        P.ellipse(a, b, 4.4, 3.4, lf, { spec: 0.2 });
      P.ellipse(16, 40, 2, 1.6, rp('#f6f2dc'), { edge: false });
    }),
    S(P => {
      for (const [a, b] of [
        [7, 32],
        [16, 28],
        [25, 32],
        [11, 37],
        [21, 37]
      ])
        P.ellipse(a, b, 4.8, 3.6, lf, { spec: 0.2 });
      for (const [a, b] of [
        [9, 40],
        [17, 41],
        [24, 39],
        [13, 35]
      ]) {
        P.ellipse(a, b, 2.4, 2.8, rp('#d8302a'), { spec: 0.7 });
        P.set(a, b, C('#f8e070'));
      }
    })
  ];
  const stake = (P, y0) => P.rect(23, y0, 2, 43 - y0, rp('#8a5a30'), { n: [0.3, 0, 1] });
  CROPIMG.pomodoro = [
    S(P => mound(P, '#e8d0a0')),
    S(P => {
      stake(P, 24);
      sprout(P);
    }),
    S(P => {
      stake(P, 12);
      P.capsule(16, 43, 18, 16, 1, stem);
      for (let i = 0; i < 5; i++)
        P.ellipse(16 + (i % 2 ? 6 : -5), 38 - i * 5, 4.4, 3, i % 2 ? lf : lf2, { spec: 0.2 });
    }),
    S(P => {
      stake(P, 6);
      P.capsule(16, 43, 19, 8, 1, stem);
      for (let i = 0; i < 7; i++)
        P.ellipse(16 + (i % 2 ? 6 : -5), 40 - i * 5, 4.6, 3, i % 2 ? lf : lf2, { spec: 0.2 });
      for (const [a, b] of [
        [11, 30],
        [21, 24],
        [12, 18],
        [20, 36]
      ])
        P.ellipse(a, b, 3, 3, rp('#e0402a'), { spec: 0.7 });
    })
  ];
  CROPIMG.mais = [
    S(P => mound(P, '#f0c83a')),
    S(sprout),
    S(P => {
      P.capsule(16, 43, 16, 18, 1.4, stem);
      for (let i = 0; i < 4; i++)
        P.capsule(16, 40 - i * 6, i % 2 ? 28 : 4, 30 - i * 6, 0.8, i % 2 ? lf : lf2, { r2: 1.6 });
    }),
    S(P => {
      P.capsule(16, 43, 16, 4, 1.6, stem);
      for (let i = 0; i < 5; i++)
        P.capsule(16, 40 - i * 6, i % 2 ? 29 : 3, 30 - i * 6, 0.8, i % 2 ? lf : lf2, { r2: 1.6 });
      P.capsule(19, 26, 21, 16, 2.6, rp('#f0c83a'), { spec: 0.5 });
      P.capsule(16, 5, 16, 1, 1, rp('#d8b048'));
    })
  ];
  CROPIMG.porro = [
    S(P => mound(P, '#d0d8c0')),
    S(P => {
      P.ellipse(16, 43, 5, 1.6, soil, { edge: false });
      P.capsule(16, 43, 16, 34, 1.2, rp('#6a9a5a'));
    }),
    S(P => {
      P.capsule(16, 43, 16, 30, 2, rp('#e8ecd8'));
      P.capsule(16, 32, 10, 20, 1, rp('#5a8a4a'), { r2: 1.6 });
      P.capsule(16, 32, 22, 20, 1, rp('#4a7a3a'), { r2: 1.6 });
    }),
    S(P => {
      P.capsule(16, 43, 16, 26, 3, rp('#f2f0e0'), { spec: 0.4 });
      P.capsule(16, 28, 7, 12, 1.2, rp('#5a8a4a'), { r2: 2.2 });
      P.capsule(16, 28, 25, 12, 1.2, rp('#4a7a3a'), { r2: 2.2 });
      P.capsule(16, 28, 16, 8, 1.2, rp('#6a9a5a'), { r2: 2 });
    })
  ];
  for (const t of ['fragola', 'pomodoro', 'mais', 'porro']) CROPW[t] = CROPIMG[t].map(wiltImg);
}

// catena: altri file la avvolgono con Ext.avvolgi('genFreeArt', …)
function genFreeArt(...a) {
  return Ext.catena('genFreeArt', genFreeArtBase, this, a);
}

// albero d'inverno: tronco e rami nudi, neve sopra
function winterTree(v) {
  srand(400 + v);
  const [c, x] = mk(88, 116);
  c.s = 2;
  const bark = ['#22150b', '#3a2414', '#563820', '#74502c'];
  for (let y = 60; y < 112; y++) {
    const w = y > 100 ? 12 + Math.min(14, (y - 100) * 2) : 10,
      x0 = 44 - Math.floor(w / 2);
    for (let i = 0; i < w; i++) {
      const t = i / (w - 1);
      R_(x, bark[t < 0.2 ? 3 : t < 0.5 ? 2 : t < 0.85 ? 1 : 0], x0 + i, y);
    }
  }
  const br = (x0, y0, a, len, w, d) => {
    const x1 = x0 + Math.cos(a) * len,
      y1 = y0 + Math.sin(a) * len;
    x.strokeStyle = bark[1 + (d % 2)];
    x.lineWidth = w;
    x.lineCap = 'round';
    x.beginPath();
    x.moveTo(x0, y0);
    x.lineTo(x1, y1);
    x.stroke();
    x.strokeStyle = '#eef3fa';
    x.lineWidth = Math.max(1, w * 0.45);
    x.beginPath();
    x.moveTo(x0, y0 - w * 0.4);
    x.lineTo(x1, y1 - w * 0.4);
    x.stroke();
    if (d < 3)
      for (let k = 0; k < 2; k++)
        br(x1, y1, a + (k ? -0.5 : 0.5) + (rnd() - 0.5) * 0.3, len * 0.65, w * 0.62, d + 1);
  };
  br(44, 64, -Math.PI / 2, 26, 6, 0);
  br(44, 72, -Math.PI / 2 - 0.8, 18, 4, 1);
  br(44, 70, -Math.PI / 2 + 0.8, 18, 4, 1);
  R_(x, '#eef3fa', 30, 108, 28, 3);
  c.canopyH = 44;
  return outline(c, '#160c08');
}
function wiltImg(src) {
  const [c, x] = mk(src.width, src.height);
  x.drawImage(src, 0, 4);
  const d = x.getImageData(0, 0, c.width, c.height),
    a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const L = (a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11) / 255;
    a[i] = a[i] * 0.35 + 175 * L * 1.15 * 0.65;
    a[i + 1] = a[i + 1] * 0.35 + 130 * L * 1.15 * 0.65;
    a[i + 2] = a[i + 2] * 0.35 + 60 * L * 0.65;
  }
  x.putImageData(d, 0, 0);
  c.s = src.s;
  c.top = Math.min(c.height / c.s, (src.top || 0) + 2);
  return c;
}
// terreno di stagione: sopra lo strato già disegnato
// la stagione sul terreno: su tutto m.ground, o su un pezzo rifatto da buildGround(m, zona)
function seasonGround(m, pezzo) {
  if (m.id !== 'main' || !isFree()) return;
  const s = seasonOf();
  if (!s) return;
  const c = pezzo ? pezzo.c : m.ground,
    x = c.getContext('2d'),
    T = 16 * (c.s || 1),
    W = m.w * T,
    H = m.h * T;
  x.save();
  x.setTransform(1, 0, 0, 1, pezzo ? -pezzo.x0 * T : 0, pezzo ? -pezzo.y0 * T : 0);
  if (s === 1) {
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(236,242,250,.62)';
    x.fillRect(0, 0, W, H);
    srand(77);
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = i % 3 ? 'rgba(255,255,255,.7)' : 'rgba(190,205,225,.6)';
      x.fillRect(ri(0, W), ri(0, H), 2, 2);
    }
  } else {
    x.globalCompositeOperation = 'soft-light';
    x.fillStyle = s === 2 ? 'rgba(120,220,90,.55)' : 'rgba(170,220,70,.45)';
    x.fillRect(0, 0, W, H);
  }
  x.restore();
}

// ---------- stato del mondo libero: alberi tagliati, detriti, costruzioni ----------
const fkey = (x, y) => x + ',' + y;
function mapRemove(m, o) {
  m.objs = m.objs.filter(q => q !== o);
  for (const [x, y] of o.solid || []) if (m.inb(x, y)) m.sol[y * m.w + x] = 0;
  for (const [x, y] of o.hits || o.solid || []) if (m.hit[fkey(x, y)] === o) delete m.hit[fkey(x, y)];
  // un oggetto rimosso può aver coperto il blocco di un altro: rimetti i blocchi degli altri
  for (const q of m.objs) for (const [x, y] of q.solid || []) m.block(x, y);
}
// giorni per ricrescere: alberi, rocce, tronchi e l'erba alta falciata
const REGROW = { tree: 10, rock: 14, log: 20, tuft: 3 };
function applyFreeBase(m, st) {
  if (m.id !== 'main' || !isFree(st)) return;
  const W2 = st.free;
  applyTiles(m, st);
  for (const o of m.objs.slice()) {
    if (!REGROW[o.kind]) continue;
    const g = W2.gone[fkey(o.tx, o.ty)];
    if (!g) continue;
    if (st.day - g.day >= (o.kind === 'tree' && skLv('racc', st) >= 10 ? 5 : REGROW[o.kind])) {
      delete W2.gone[fkey(o.tx, o.ty)];
      continue;
    }
    mapRemove(m, o);
    if (o.kind === 'tree' && !g.stumpGone)
      m.add(OB('ceppo', o.tx, o.ty, IMG.stump, { act: 'ceppo', of: fkey(o.tx, o.ty) }));
  }
  for (const k in W2.debris) {
    const [x, y] = k.split(',').map(Number),
      t = W2.debris[k];
    if (m.hit[k] || m.solid(x, y)) {
      delete W2.debris[k];
      continue;
    }
    m.add(OB('debris', x, y, FREEIMG[t], { act: 'debris', dt: t, solid: [], hits: [[x, y]] }));
  }
  for (const k in W2.built) {
    const [x, y] = k.split(',').map(Number),
      b = W2.built[k];
    if (ITEMS[b.id].size) {
      addBigBuilt(m, k, b);
      continue;
    }
    const img = placeImg(b.id, b);
    m.add(
      OB('built', x, y, img, {
        act: 'built',
        bk: k,
        bid: b.id,
        canopy: !!ITEMS[b.id].tree,
        frames: Array.isArray(FREEIMG[b.id]) ? FREEIMG[b.id] : null
      })
    );
    if (b.id === 'lampione') m.lights.push({ x: x * 16 + 8, y: y * 16 - 14, r: 62 });
  }
}
// punto di estensione: gli altri file si iscrivono con Ext.on('applyFree…') invece di sovrascriverla
function applyFree(m, st) {
  Ext.runPrima('applyFree:prima', m, st);
  const v = applyFreeBase(m, st);
  Ext.run('applyFree', m, st);
  return v;
}

function placeImg(id, b) {
  if (ITEMS[id] && ITEMS[id].tree) return fruitTreeImg(b || { id, d: G.st.day });
  return (
    {
      banco: FREEIMG.banco,
      cassa: FREEIMG.cassa,
      irrigatore: FREEIMG.irrigatore,
      lampione: IMG.lamp,
      recinto: IMG.fenceV,
      panchina: IMG.bench
    }[id] || (Array.isArray(FREEIMG[id]) ? FREEIMG[id][0] : FREEIMG[id])
  );
}
// ogni mattina: nuovi detriti nei prati e nei campi vuoti; gli irrigatori bagnano
function freeMorningBase(st) {
  if (!isFree(st)) return;
  const W2 = st.free;
  const n = Object.keys(W2.debris).length;
  if (n < 40) {
    const add = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < add; i++) {
      const x = 4 + Math.floor(Math.random() * 56),
        y = 6 + Math.floor(Math.random() * 36),
        k = fkey(x, y);
      if (W2.debris[k] || W2.built[k] || st.farm[k]) continue;
      if (x >= 37 && x <= 52 && y >= 13 && y <= 24) continue; // la piazza resta pulita
      if (x >= 52 && x <= 57 && y >= 17 && y <= 23) continue; // e anche l'angolo del pozzo
      W2.debris[k] = inFarm(x, y)
        ? ['erbaccia', 'sasso', 'ramo', 'erbaccia'][i % 4]
        : ['ramo', 'sasso', 'erbaccia'][i % 3];
    }
  }
  animalsMorning(st);
  wildMorning(st);
  friendGifts(st);
  machinesMorning(st);
  for (const k in W2.built) {
    const bid = W2.built[k].id;
    if (bid !== 'irrigatore' && bid !== 'irrigatore2') continue;
    const [x, y] = k.split(',').map(Number),
      N =
        bid === 'irrigatore2'
          ? [
              [-1, -1],
              [0, -1],
              [1, -1],
              [-1, 0],
              [1, 0],
              [-1, 1],
              [0, 1],
              [1, 1]
            ]
          : DIRV;
    for (const [a, b] of N) {
      const f = st.farm[fkey(x + a, y + b)];
      if (f) f.w = true;
    }
  }
}
// punto di estensione: gli altri file si iscrivono con Ext.on('freeMorning…') invece di sovrascriverla
function freeMorning(st) {
  Ext.runPrima('freeMorning:prima', st);
  const v = freeMorningBase(st);
  Ext.run('freeMorning', st);
  return v;
}

// ---------- azioni con gli attrezzi ----------
G.hits = {};
function hitFx(x, y, col) {
  burst('dust', x * 16 + 8, y * 16 + 8, 6, col);
  G.shake = Math.max(G.shake, 0.6);
}
function freeActBase(fx, fy) {
  const st = G.st;
  if (!isFree(st) || G.map.id !== 'main' || G.visit) return false;
  const m = G.map,
    it = selItem(),
    id = it && it.id,
    o = m.objAt(fx, fy),
    k = fkey(fx, fy),
    W2 = st.free;
  // raccogliere i detriti
  if (o && o.kind === 'debris') {
    const t = o.dt,
      need = { ramo: 'accetta', sasso: 'piccone' }[t];
    if (need && id !== need) {
      UI.toast(t === 'ramo' ? "Un ramo secco. Ti serve l'accetta." : 'Un sasso. Ti serve il piccone.');
      return true;
    }
    markHit(o);
    if (!useEnergy(1)) return true;
    const got = t.startsWith('w_')
      ? [t.slice(2), 1]
      : {
          ramo: ['legna', 1 + (Math.random() < 0.5 ? 1 : 0)],
          sasso: ['pietra', 1 + (Math.random() < 0.4 ? 1 : 0)],
          erbaccia: ['fibra', 1],
          uovo: ['uovo', 1]
        }[t];
    if (!addItem(got[0], got[1])) return true;
    if (
      t.startsWith('w_') &&
      (skLv('racc') >= 8 || (typeof buffOn === 'function' && buffOn('raccolta'))) &&
      Math.random() < 0.3
    )
      riponi(got[0], 1);
    addXP('racc', t.startsWith('w_') ? 4 : 2);
    delete W2.debris[k];
    mapRemove(m, o);
    restaFinoAllImpatto(o);
    allImpatto(() => {
      const x = fx * 16 + 8,
        y = fy * 16 + 12;
      if (t === 'sasso') GESTO.pietra(x, y);
      else if (t === 'ramo') GESTO.legno(x, y);
      else if (t === 'erbaccia') GESTO.erba(x, y, 6);
      else AU.play('pick');
    });
    allImpatto(() => {
      flyPop(got[0], fx * 16 + 8, fy * 16 + 4);
      floatText(`+${got[1]} ${ITEMS[got[0]].n}`, fx * 16 + 8, fy * 16 - 4);
    });
    st.flags.debris = (st.flags.debris || 0) + 1;
    return true;
  }
  // alberi, ceppi, tronchi: accetta
  if (o && (o.kind === 'tree' || o.kind === 'ceppo' || o.kind === 'log')) {
    if (id !== 'accetta') {
      if (o.kind === 'ceppo') {
        UI.toast("Un ceppo. Con l'accetta lo togli.");
        return true;
      }
      return false;
    }
    const hk = fkey(o.tx, o.ty),
      need = Math.max(1, { tree: 5, ceppo: 2, log: 6 }[o.kind] - (goldTools() ? 1 : 0));
    if (!useEnergy(skLv('racc') >= 2 ? 1 : 2)) return true;
    G.hits[hk] = (G.hits[hk] || 0) + 1;
    // all'impatto: l'albero trema, le schegge volano, e dalla chioma cade qualche foglia
    allImpatto(() => {
      markHit(o);
      GESTO.legno(o.tx * 16 + 8, o.ty * 16 + 12);
      if (o.kind === 'tree')
        for (let i = 0; i < 5; i++)
          G.parts.push({
            k: 'spark',
            x: o.tx * 16 + 8 + (Math.random() - 0.5) * 30,
            y: o.ty * 16 - 30,
            vx: (Math.random() - 0.5) * 20,
            vy: 10,
            t: 0,
            life: 1,
            c: seasonOf() === 1 ? '#eef3fa' : ['#d86a28', '#e8a040', '#6a9a3a', '#5a9a2a'][seasonOf()]
          });
    });
    if (G.hits[hk] < need) return true;
    delete G.hits[hk];
    const n =
      { tree: 8 + Math.floor(Math.random() * 5), ceppo: 3, log: 14 }[o.kind] + (skLv('racc') >= 4 ? 1 : 0);
    addXP('racc', { tree: 10, ceppo: 3, log: 12 }[o.kind]);
    if (!addItem('legna', n)) return true;
    if (o.kind === 'tree') {
      W2.gone[hk] = { day: st.day };
      mapRemove(m, o);
      // l'albero cade (dalla parte opposta a te), con lo scricchiolio e poi il tonfo
      alberoCade(o.img, o.dx + iw(o.img) / 2, o.dy + ih(o.img));
      m.add(OB('ceppo', o.tx, o.ty, IMG.stump, { act: 'ceppo', of: hk }));
      st.flags.felled = (st.flags.felled || 0) + 1;
      Ext.run('fatto', 'albero', 1);
      tip(
        'tutFell',
        "Albero abbattuto! Tra una decina di giorni ne ricrescerà uno. Il ceppo si toglie con l'accetta."
      );
    } else if (o.kind === 'ceppo') {
      const g = W2.gone[o.of];
      if (g) g.stumpGone = 1;
      mapRemove(m, o);
      restaFinoAllImpatto(o);
    } else {
      W2.gone[hk] = { day: st.day };
      mapRemove(m, o);
      restaFinoAllImpatto(o);
    }
    allImpatto(() => {
      flyPop('legna', o.tx * 16 + 8, o.ty * 16 - 6);
      floatText(`+${n} Legna`, o.tx * 16 + 8, o.ty * 16 - 10);
    });
    return true;
  }
  // rocce: piccone
  if (o && o.kind === 'rock') {
    if (id !== 'piccone') return false;
    const hk = fkey(o.tx, o.ty);
    if (!useEnergy(skLv('racc') >= 2 ? 1 : 2)) return true;
    G.hits[hk] = (G.hits[hk] || 0) + 1;
    const rx = o.tx * 16 + 8,
      ry = o.ty * 16 + 12;
    allImpatto(() => {
      markHit(o);
      GESTO.pietra(rx, ry);
    });
    if (G.hits[hk] < (goldTools() ? 2 : 3)) return true;
    // l'ultimo colpo: la roccia si spacca
    allImpatto(() => GESTO.roccia(rx, ry));
    delete G.hits[hk];
    const n = 4 + Math.floor(Math.random() * 3) + (skLv('racc') >= 4 ? 1 : 0);
    if (!addItem('pietra', n)) return true;
    rareDrop(o);
    addXP('racc', 10);
    if (Math.random() < (skLv('racc') >= 6 ? 0.5 : 0.3)) {
      riponi('ferro', 1 + (Math.random() < 0.3 ? 1 : 0));
      allImpatto(() => floatText('+ Minerale di ferro', o.tx * 16 + 8, o.ty * 16 - 16, '#c8703a'));
    }
    W2.gone[hk] = { day: st.day };
    mapRemove(m, o);
    restaFinoAllImpatto(o);
    allImpatto(() => {
      flyPop('pietra', o.tx * 16 + 8, o.ty * 16 - 4);
      floatText(`+${n} Pietra`, o.tx * 16 + 8, o.ty * 16 - 6);
    });
    st.flags.mined = (st.flags.mined || 0) + 1;
    return true;
  }
  // oggetti costruiti
  if (o && o.kind === 'built') {
    const b = W2.built[o.bk];
    if (ITEMS[b.id] && ITEMS[b.id].tree && id === 'accetta') {
      if (!useEnergy(2)) return true;
      delete W2.built[o.bk];
      mapRemove(m, o);
      riponi('legna', st.day - b.d >= 12 ? 6 : 1);
      allImpatto(() => GESTO.legno(o.tx * 16 + 8, o.ty * 16 + 12));
      alberoCade(o.img, o.dx + iw(o.img) / 2, o.dy + ih(o.img));
      UI.toast("Hai tagliato l'albero.");
      return true;
    }
    if ((MACH[b.id] || b.id === 'apiario') && id !== PLACE_TOOL[b.id] && machineAct(o.bk, b, o)) return true;
    if (ITEMS[b.id] && ITEMS[b.id].tree) return treeAct(o, b);
    if (id && id === PLACE_TOOL[b.id]) {
      if (b.id === 'cassa' && (b.inv || []).some(Boolean)) {
        UI.toast('Svuota la cassa prima di spostarla.');
        return true;
      }
      if (MACH[b.id] && !macVuota(b)) {
        UI.toast(`Svuota la ${ITEMS[b.id].n.toLowerCase()} prima di smontarla.`);
        return true;
      }
      if (ITEMS[b.id].size && animalsOf(o.bk).length) {
        UI.toast('Dentro ci vivono delle bestie. Non si smonta.');
        return true;
      }
      if (!addItem(b.id, 1)) return true;
      delete W2.built[o.bk];
      mapRemove(m, o);
      if (b.id === 'lampione')
        m.lights = m.lights.filter(l => !(l.x === o.tx * 16 + 8 && l.y === o.ty * 16 - 14));
      AU.play('pick');
      UI.toast(ITEMS[b.id].n + ' raccolto.');
      return true;
    }
    if (b.id === 'banco' || b.id === 'incudine') {
      craftMenu(null, b.id);
      return true;
    }
    if (b.id === 'pollaio' || b.id === 'stalla') {
      barnMenu(o.bk);
      return true;
    }
    if (b.id === 'cassa') {
      chestMenu(o.bk);
      return true;
    }
    if (b.id === 'panchina') {
      runAct({ act: 'bench', tx: o.tx, ty: o.ty });
      return true;
    }
    UI.toast(
      ITEMS[b.id].n +
        (PLACE_TOOL[b.id]
          ? ` — per spostarlo usa ${PLACE_TOOL[b.id] === 'accetta' ? "l'accetta" : 'il piccone'}.`
          : '')
    );
    return true;
  }
  if (id === 'pala') return shovelAct(fx, fy);
  if (id === 'falce') return falciaAct(fx, fy);
  if (id === 'lastre') {
    const g = m.get(fx, fy);
    if (!ownedAt(fx, fy)) {
      UI.toast('Questa terra non è tua.');
      return true;
    }
    if (o || st.farm[k] || !(g === 1 || g === 12 || g === 2)) {
      UI.toast("Le lastre vanno sull'erba o sui vialetti liberi.");
      return true;
    }
    W2.tiles = W2.tiles || {};
    W2.tiles[k] = 11;
    setGround(m, fx, fy, 11);
    removeItem('lastre', 1);
    AU.play('pietra');
    addXP('arti', 1);
    return true;
  }
  // piazzare un oggetto
  if (id && ITEMS[id].size) {
    if (!bigFree(id, fx, fy)) {
      UI.toast(`Serve un prato libero di ${ITEMS[id].size.join('×')} caselle, davanti a te.`);
      return true;
    }
    W2.built[k] = { id };
    removeItem(id, 1);
    addBigBuilt(m, k, W2.built[k]);
    Dialoghi.evento('costruzione', { item: id });
    AU.play('slam');
    G.shake = 2;
    hitFx(fx, fy, '#8a6a3a');
    st.flags.built = (st.flags.built || 0) + 1;
    UI.toast(
      id === 'casetta'
        ? 'Casetta costruita! Domattina arriverà qualcuno ad abitarla.'
        : ITEMS[id].n + (id === 'stalla' ? ' costruita' : ' costruito') + '! Usalo per comprare le bestie.'
    );
    return true;
  }
  if (id && ITEMS[id].t === 'place') {
    const g = m.get(fx, fy),
      free = !o && !m.solid(fx, fy) && (g === 1 || g === 12 || g === 2);
    if (!free || (st.farm[k] && st.farm[k].c)) {
      UI.toast('Non qui: serve un posto libero.');
      return true;
    }
    if (!ownedAt(fx, fy)) {
      UI.toast("Questa terra non è tua. Le terre le vende l'Anziano Ezekiel.");
      return true;
    }
    if (fx < 4 || fx > 96 || fy < 4 || fy > 41) {
      UI.toast('Troppo vicino al bosco.');
      return true;
    }
    if (st.farm[k]) delete st.farm[k];
    W2.built[k] = { id };
    if (ITEMS[id].tree) W2.built[k].d = st.day;
    addXP('arti', 3);
    if (id === 'cassa') W2.built[k].inv = cassaVuota();
    removeItem(id, 1);
    const nb = m.add(
      OB('built', fx, fy, placeImg(id, W2.built[k]), {
        act: 'built',
        bk: k,
        bid: id,
        frames: Array.isArray(FREEIMG[id]) ? FREEIMG[id] : null
      })
    );
    nb.popT = G.t;
    if (id === 'lampione') m.lights.push({ x: fx * 16 + 8, y: fy * 16 - 14, r: 62 });
    AU.play('plant');
    hitFx(fx, fy, '#8a6a3a');
    st.flags.built = (st.flags.built || 0) + 1;
    return true;
  }
  return false;
}
// punto di estensione: gli altri file si iscrivono con Ext.on('freeAct…') invece di sovrascriverla
function freeAct(fx, fy) {
  const r = Ext.intercetta('freeAct:intercetta', fx, fy);
  if (r) return r;
  const v = freeActBase(fx, fy);
  return v;
}

ACT.debris = () => {};
ACT.ceppo = () => UI.toast("Un ceppo. Con l'accetta lo togli.");
ACT.built = () => {};
Object.assign(PROMPT, { debris: 'Raccogli', ceppo: 'Ceppo' });
// ---------- la falce: l'erba alta diventa fibra (e ricresce in qualche giorno, vedi REGROW) ----------
const ciuffiIn = (m, x, y) => m.objs.filter(o => o.kind === 'tuft' && o.tx === x && o.ty === y);
function falciaAct(fx, fy) {
  const st = G.st,
    m = G.map,
    L = ciuffiIn(m, fx, fy);
  if (!L.length) {
    UI.toast("Qui non c'è erba alta da falciare.");
    return true;
  }
  if (!useEnergy(1)) return true;
  let n = 0;
  for (const o of L) {
    mapRemove(m, o);
    restaFinoAllImpatto(o);
    n += 1 + (Math.random() < 0.35 ? 1 : 0);
  }
  // all'impatto: la lama passa, l'erba tagliata vola
  allImpatto(() => GESTO.erba(fx * 16 + 8, fy * 16 + 12, 8 + L.length * 4));
  st.free.gone[fkey(fx, fy)] = { day: st.day };
  Ext.run('fatto', 'falcia', L.length);
  if (!addItem('fibra', n)) return true;
  allImpatto(() => floatText(`+${n} Fibra`, fx * 16 + 8, fy * 16 - 6));
  addXP('racc', 2);
  return true;
}

// ---------- cassa ----------
function chestMenu(bk) {
  const b = G.st.free.built[bk];
  if (!b) return;
  b.inv = inventario(b.inv, CASSA_POSTI);
  zaino(bk);
}

// ---------- inizio del gioco libero ----------
const FREE_INTRO = {
  1: [
    'Sei tornat{o|a}. Clara è rimasta fuori, tra le luci che non si spengono mai: torna a trovarti la domenica. Tu no: la casa del nonno ti aspettava, e la Valle non ha fatto domande.'
  ],
  2: [
    'Il mantello giallo è appeso dietro la porta. Di giorno nessuno ne parla. Di notte, certe volte, senti gli zoccoli. Sono i tuoi.'
  ],
  3: [
    "Il recinto è grigio. Il ponte è stato ricostruito con il legno dell'Albero bruciato. La Valle è libera, e da fuori qualcuno comincia ad arrivare."
  ]
};
async function freeStartBase(ending) {
  const st = G.st,
    F = st.flags;
  G.cut++;
  try {
    await UI.fade(1, 600);
    Object.assign(F, {
      woodDone: 1,
      tobiaScene: 1,
      ezTruth: 1,
      claraAlly: 1,
      ch1end: 1,
      ch2end: 1,
      ch3end: 1,
      festaDone: 1,
      ch2card: 1,
      ch3card: 1,
      ch4card: 1,
      finaleChase: 0,
      bridgeGone: 0
    });
    st.chapter = 5;
    st.day += 1;
    st.free = { start: st.day, ending, gone: {}, debris: {}, built: {} };
    st.time = 6 * 60;
    st.energy = 100;
    st.favors = [];
    st.choreOk = false;
    G.festaDark = false;
    G.redTint = 0;
    G.erede = false;
    G.prey = null;
    G.festaChase = false;
    G.horse.on = false;
    G.npcs = G.npcs.filter(n => !n.clone);
    st.quiete = 100;
    while (st.inv.length < 20) st.inv.push(null);
    // gli oggetti della storia restano solo se sono ricordi (il nastro, le chiavi, la lanterna, il mantello):
    // nella Valle si ripongono nella cassa del nonno (ricordi.js)
    st.inv = st.inv.map(s =>
      s && !ITEMS[s.id].ricordo && (ITEMS[s.id].t === 'key' || ITEMS[s.id].t === 'bad') ? null : s
    );
    morningSetup();
    rebuildMaps();
    snapNPCs();
    spawnCritters();
    G.map = G.maps.house;
    setPos(G.player, 2, 3, 0);
    G.mode = 'game';
    UI.showHud(true);
    await UI.card(
      'La Valle, dopo',
      `${seasonName()} · Giorno ${seasonDay()}`,
      fmt(FREE_INTRO[ending][0]),
      false,
      true,
      1600
    );
    updateCam(0);
    await UI.fade(0, 700);
    await narr(
      "Sulla soglia, appoggiati alla porta, un'accetta e un piccone. Un biglietto con la calligrafia di Brom: «Mh. Per la legna e per le pietre. Si ricostruisce.»"
    );
    giveItem('accetta');
    giveItem('piccone');
    giveItem('pala');
    st.free.land = ['casa'];
    st.free.tiles = {};
    st.free.inside = st.free.inside || {}; // i mobili del nonno ci sono già (casaLibera)
    st.free.recipes = {};
    // il banco da lavoro accanto a casa
    const k = fkey(14, 11);
    if (!st.free.built[k] && !G.maps.main.objAt(14, 11)) {
      st.free.built[k] = { id: 'banco' };
      rebuildMaps();
    } else giveItem('banco');
    await narr(
      "Accanto a casa c'è un banco da lavoro nuovo. Con legna, pietra e fibra potrai costruire quello che ti serve."
    );
    UI.toast('Gioco libero: le stagioni durano 28 giorni. Ogni stagione ha le sue colture.');
    NET.save(st);
    UI.hud();
    UI.quest();
    UI.hotbar();
    presenceJoin(st.pid);
    inboxStart();
  } finally {
    G.cut--;
  }
}

// catena: altri file la avvolgono con Ext.avvolgi('freeStart', …)
function freeStart(...a) {
  return Ext.catena('freeStart', freeStartBase, this, a);
}

// obiettivi del gioco libero (guidano i primi giorni)
QUESTS.push(
  {
    free: 1,
    s: st => isFree(st),
    t: st => `Abbatti un albero con l'accetta (${Math.min(st.flags.felled || 0, 1)}/1)`,
    d: st => (st.flags.felled || 0) >= 1
  },
  {
    free: 1,
    s: st => isFree(st),
    t: st => `Spacca una roccia con il piccone (${Math.min(st.flags.mined || 0, 1)}/1)`,
    d: st => (st.flags.mined || 0) >= 1
  },
  {
    free: 1,
    s: st => isFree(st) && (st.flags.felled || 0) >= 1,
    t: () => 'Costruisci qualcosa al banco da lavoro, accanto a casa',
    d: st => (st.flags.crafted || 0) >= 1
  },
  {
    free: 1,
    s: st => isFree(st) && (st.flags.crafted || 0) >= 1,
    t: () => 'Piazza nella fattoria qualcosa che hai costruito',
    d: st => (st.flags.built || 0) >= 1
  }
);
// dialoghi del gioco libero
const FREE_L = {
  ezekiel: [
    'Il recinto non lo ridipingiamo più. Non so ancora se è una cosa giusta.',
    'Sono stanco di contare, {n}. Ora conto le stagioni. È più facile.',
    'Tuo nonno avrebbe voluto vederti così. Con le mani sporche di terra.'
  ],
  agatha: [
    'Tesoro! Ho semi nuovi, adesso: le stagioni cambiano e io cambio con loro.',
    'Da fuori arrivano notizie strane. Dicono che le carrozze vanno senza cavalli. Figurati.',
    'Il mio negozio non è mai stato così vivo. Grazie anche a te.'
  ],
  lucius: [
    'La campana suona ancora alle nove. Per abitudine. Nessuno corre più a casa.',
    'Ogni tanto, la sera, conto. Sette. E mi viene da piangere, ma di sollievo.',
    'Il bosco è più quieto. Più quieto non vuol dire buono, {figliolo|figliola}.'
  ],
  clara: [
    "Hai visto quanta luce c'è, di notte, adesso? Tutta nostra.",
    "Prima o poi voglio vedere il mondo di fuori. Ma ogni giorno trovo una scusa per restare un altro po'.",
    'Pianta qualcosa di bello per me, quando arriva la primavera.'
  ],
  brom: [
    "Mh. L'accetta è affilata. Non sprecarla sui rami piccoli.",
    'Se ti serve un attrezzo migliore, passa. Ora ho tempo.',
    'Ho smesso di fare ferri. Faccio chiodi. Si costruisce.'
  ],
  tobia: [
    'Hihi! Le zucche adesso dormono. Le ho sentite russare!',
    "Il Vecchio Albero non c'è più. Mi manca un pochino. Hihi. È strano?",
    'Contami! No, non contarmi. Abbracciami. Hihi.'
  ]
};
const FREE_SEASON = {
  1: "Che freddo. D'inverno nella Valle cresce solo il porro, e la pazienza.",
  2: 'Primavera! Fragole, {n}. Le fragole di Hollowmere sono le migliori del mondo. Credo.',
  3: "Che caldo. Il mais arriva più alto di Brom, quest'estate."
};
// la notte: cambio di stagione (le colture fuori stagione muoiono)
function freeNight(st, prev) {
  if (!isFree(st)) return;
  shadowNightRaid(st);
  const s = seasonOf(st);
  if (s === prev) return;
  let n = 0;
  for (const k in st.farm) {
    const c = st.farm[k].c;
    if (
      c &&
      !c.dead &&
      !cropInSeason(c.t, s) &&
      !(typeof inSerra === 'function' && inSerra(...k.split(',').map(Number), st))
    ) {
      c.dead = 1;
      n++;
    }
  }
  G.seasonNews = { s, n };
}
function shopItemsBase() {
  const s = seasonOf();
  return [
    ...Object.keys(ITEMS).filter(k => ITEMS[k].t === 'seed' && cropInSeason(ITEMS[k].crop, s)),
    'concime',
    'pane'
  ];
}

// catena: altri file la avvolgono con Ext.avvolgi('shopItems', …)
function shopItems(...a) {
  return Ext.catena('shopItems', shopItemsBase, this, a);
}

function freeAimOk(it, tx, ty) {
  const st = G.st,
    m = G.map,
    o = m.objAt(tx, ty),
    id = it.id;
  if (!isFree(st)) return null;
  if (id === 'accetta')
    return (
      !!o &&
      (o.kind === 'tree' ||
        o.kind === 'ceppo' ||
        o.kind === 'log' ||
        (o.kind === 'debris' && o.dt === 'ramo') ||
        (o.kind === 'built' && PLACE_TOOL[o.bid] === 'accetta'))
    );
  if (id === 'piccone')
    return (
      !!o &&
      (o.kind === 'rock' ||
        (o.kind === 'debris' && o.dt === 'sasso') ||
        (o.kind === 'built' && PLACE_TOOL[o.bid] === 'piccone'))
    );
  if (id === 'pala') return shovelAimOk(tx, ty);
  if (id === 'falce') return ciuffiIn(m, tx, ty).length > 0;
  if (id === 'lastre') {
    const g = m.get(tx, ty);
    return !!ownedAt(tx, ty) && !o && !st.farm[fkey(tx, ty)] && (g === 1 || g === 12 || g === 2);
  }
  if (ITEMS[id].size) return bigFree(id, tx, ty);
  if (ITEMS[id].t === 'place') {
    const g = m.get(tx, ty);
    return (
      !o &&
      !m.solid(tx, ty) &&
      (g === 1 || g === 12 || g === 2) &&
      !(st.farm[fkey(tx, ty)] && st.farm[fkey(tx, ty)].c) &&
      !!ownedAt(tx, ty)
    );
  }
  return null;
}
PROMPT.built = 'Usa';
const FREE_BARKS = {
  ezekiel: ['Buona giornata, {n}.', 'Le stagioni passano. Finalmente.'],
  agatha: ['Semi freschi, tesoro!', 'Passa a trovarmi!'],
  lucius: ['Pace a te, {n}.', 'Sette. Va bene così.'],
  clara: ['{n}! Ciao!', 'Che bella giornata!'],
  brom: ['Mh.', 'Si ricostruisce.'],
  tobia: ['Hihi! Ciao!', 'Le zucche dormono. Hihi.']
};
