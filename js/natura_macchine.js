'use strict';
// ================= NATURA (2): MACCHINARI NUOVI =================
// Frantoio, essiccatoio, zangola, alambicco, seminatrice, compostiera, forno a legna.
// Usano il sistema delle macchine di macchine.js (MACH, la schermata macGui, il fumetto «pronto» di drawMachines)
// e hanno ognuno la sua animazione: si disegnano da soli (punto di estensione 'listaMondo' di world.js),
// fermi quando sono vuoti e animati quando lavorano. Di notte il fuoco di forno e alambicco fa luce.

// ---------- prodotti nuovi ----------
const NAT_SECCO = {
  funghi: 'Porcini secchi',
  finferli: 'Finferli secchi',
  spugnole: 'Spugnole secche',
  pomodoro: 'Pomodori secchi',
  peperone: 'Peperoni secchi',
  fico: 'Fichi secchi',
  albicocca: 'Albicocche secche',
  prugna: 'Prugne secche',
  uva: 'Uvetta',
  cachi: 'Cachi secchi',
  mela: 'Mele essiccate',
  pera: 'Pere essiccate',
  castagne: 'Castagne secche',
  basilico: 'Basilico secco',
  salvia: 'Salvia secca',
  rosmarino: 'Rosmarino secco',
  origano: 'Origano secco',
  menta: 'Menta secca',
  lavanda: 'Lavanda secca',
  camomilla: 'Camomilla secca'
};
const NAT_ESS = [
  'lavanda',
  'camomilla',
  'menta',
  'salvia',
  'rosmarino',
  'sambuco',
  'violette',
  'calendula',
  'ginepro',
  'zafferano'
];
Object.assign(ITEMS, {
  olio: { n: "Olio d'oliva", t: 'crop', v: 150, d: 'Verde e dorato. Dal frantoio: olive, girasoli o noci.' },
  burro: { n: 'Burro', t: 'crop', v: 110, d: 'Dalla zangola, con il latte di mucca.' },
  caldarroste: { n: 'Caldarroste', t: 'food', e: 40, d: 'Calde nel cartoccio. +40 energia.' }
});
for (const [id, n] of Object.entries(NAT_SECCO))
  if (ITEMS[id] || NAT_CROPS[id] || NAT_WILD_ITEMS[id])
    ITEMS['secco_' + id] = { n, t: 'crop', v: 0, pre2: id };
for (const id of NAT_ESS)
  ITEMS['ess_' + id] = {
    n: 'Essenza di ' + (ITEMS[id] ? ITEMS[id].n.toLowerCase() : id),
    t: 'crop',
    v: 0,
    pre2: id,
    d: "Dall'alambicco: poche gocce, profumo per un anno."
  };
// il valore si calcola quando tutti gli oggetti esistono (alcuni arrivano da file caricati dopo)
function natValori() {
  for (const k of Object.keys(ITEMS)) {
    const it = ITEMS[k];
    if (!it.pre2 || !ITEMS[it.pre2]) continue;
    const v = ITEMS[it.pre2].v || 30;
    if (k.startsWith('secco_')) it.v = Math.round(v * 2.2 + 20);
    if (k.startsWith('ess_')) it.v = Math.round(v * 3.5 + 60);
  }
}
natValori();

// ---------- le macchine ----------
// in: cosa si mette (e quanti), out: cosa esce, n: quanti ne escono, days: giorni di lavoro
const NAT_MACH = {
  frantoio: {
    n: 'Frantoio',
    d: 'La macina di pietra: 3 olive (o 3 noci, o 2 girasoli) diventano olio in sei ore.',
    c: { pietra: 40, legna: 20, lingotto: 2 },
    lv: 5,
    tool: 'piccone',
    size: [18, 22],
    days: 2,
    in: { olive: 3, noce: 3, girasole: 2 },
    out: () => 'olio',
    aiuto: 'Il frantoio vuole 3 olive, 3 noci o 2 girasoli.'
  },
  essiccatoio: {
    n: 'Essiccatoio',
    d: 'Graticci al sole e al vento: funghi, frutta ed erbe si seccano in quattro ore e valgono il doppio.',
    c: { legna: 30, fibra: 15 },
    lv: 2,
    tool: 'accetta',
    size: [18, 22],
    days: 1,
    ok: id => !!ITEMS['secco_' + id],
    out: id => 'secco_' + id,
    aiuto: "L'essiccatoio prende funghi, frutta ed erbe aromatiche."
  },
  zangola: {
    n: 'Zangola',
    d: 'Su e giù, su e giù: dal latte il burro, dal latte di capra il formaggio. Due ore.',
    c: { legna: 25, lingotto: 1 },
    lv: 3,
    tool: 'accetta',
    size: [14, 22],
    days: 1,
    in: { latte: 1, latte_capra: 2 },
    out: id => (id === 'latte' ? 'burro' : 'formaggio'),
    aiuto: 'La zangola vuole latte (burro) o 2 latti di capra (formaggio).'
  },
  alambicco: {
    n: 'Alambicco',
    d: 'Rame e fuoco lento: fiori ed erbe diventano essenze preziose in dieci ore.',
    c: { rame: 4, pietra: 10, lingotto: 1 },
    lv: 6,
    tool: 'piccone',
    size: [18, 24],
    days: 3,
    in: Object.fromEntries(NAT_ESS.map(k => [k, 3])),
    out: id => 'ess_' + id,
    aiuto:
      "L'alambicco vuole 3 fiori o erbe: lavanda, camomilla, menta, salvia, rosmarino, sambuco, violette, calendula, ginepro o zafferano."
  },
  seminatrice: {
    n: 'Seminatrice',
    d: 'Un raccolto dentro, giri la manovella: in due ore, due bustine dei suoi semi.',
    c: { legna: 25, lingotto: 2, fibra: 10 },
    lv: 5,
    tool: 'accetta',
    size: [16, 22],
    days: 1,
    ok: id => !!ITEMS['s_' + id] && ITEMS['s_' + id].t === 'seed',
    out: id => 's_' + id,
    n2: () => 2,
    aiuto: "La seminatrice prende un raccolto dell'orto e ne fa due bustine di semi."
  },
  compostiera: {
    n: 'Compostiera',
    d: 'Erbacce e avanzi diventano concime in sei ore: 10 fibre fanno 3 concimi, un raccolto ne fa uno.',
    c: { legna: 20, fibra: 10 },
    tool: 'accetta',
    size: [16, 16],
    days: 2,
    ok: id =>
      id === 'fibra' || (ITEMS[id] && ITEMS[id].t === 'crop' && !/^(cons_|succo_|secco_|ess_)/.test(id)),
    need: id => (id === 'fibra' ? 10 : 1),
    out: () => 'concime',
    n2: id => (id === 'fibra' ? 3 : 1),
    aiuto: 'La compostiera prende 10 fibre o un raccolto.'
  },
  fornoalegna: {
    n: 'Forno a legna',
    d: "Cupola di mattoni: 2 farine fanno il pane, 3 castagne le caldarroste, 2 patate l'arrosto. Un'ora e mezza.",
    c: { pietra: 50, legna: 15 },
    lv: 4,
    tool: 'piccone',
    size: [20, 22],
    days: 1,
    in: { farina: 2, castagne: 3, patata: 2 },
    out: id => ({ farina: 'panecasa', castagne: 'caldarroste', patata: 'arrosto' })[id],
    aiuto: 'Il forno vuole 2 farine, 3 castagne o 2 patate.'
  }
};
for (const [id, M] of Object.entries(NAT_MACH)) {
  ITEMS[id] = { n: M.n, t: 'place', d: M.d };
  CRAFTS.push({ id, q: 1, c: M.c, cat: 'mac', ...(M.lv ? { lv: M.lv } : {}) });
  PLACE_TOOL[id] = M.tool;
  if (typeof BIG_BUILT !== 'undefined') BIG_BUILT[id] = 8;
  MACH[id] = {
    days: M.days,
    ok: M.ok || (k => !!M.in[k]),
    need: M.in ? k => M.in[k] || 1 : M.need,
    out: M.out,
    n: M.n2,
    vuole: M.in ? Object.keys(M.in)[0] : null,
    aiuto: M.aiuto
  };
}

// ---------- animazioni ----------
// ogni macchina ha i suoi fotogrammi (fermo e al lavoro) e un disegno «vivo» sopra (fumo, gocce, mosche…)
const NAT_MF = {};
const natPart = (x, y, w, h, col, a = 1) => {
  ctx.globalAlpha = a;
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
};
// sbuffi di fumo o vapore che salgono e si allargano (senza stato: dipendono solo dal tempo)
function natFumo(x, y, n, col, vel = 0.5, alto = 22, larg = 4) {
  for (let i = 0; i < n; i++) {
    const ph = (G.t * vel + i / n) % 1,
      X = x + Math.sin(ph * 6 + i * 2) * larg * ph,
      Y = y - ph * alto,
      r = 1 + ph * 3;
    natPart(X - r / 2, Y - r / 2, r, r, col, (1 - ph) * 0.55);
  }
}
const NAT_ANIM = {
  // la macina gira, l'olio gocciola nel coccio
  frantoio(e, x, y, lav) {
    if (!lav) return;
    const ph = (G.t * 1.3) % 1;
    natPart(x + 32.5 / 2, y + (33 + ph * 6) / 2, 0.5, 1, '#c8c040', 1 - ph * 0.3);
    if (ph > 0.85) natPart(x + 16, y + 20.5, 1.5, 0.5, '#e8e070', 0.8);
  },
  // aria calda che tremola e piccoli disegni del raccolto sui graticci
  essiccatoio(e, x, y, lav, b) {
    if (!lav || !b.m || !b.m.i) return;
    const ic = ICON[b.m.i];
    if (ic)
      for (const [tx, ty] of [
        [4, 8.5],
        [10, 8.5],
        [4, 13.5],
        [10, 13.5]
      ])
        ctx.drawImage(ic, x + tx, y + ty, 5, 5);
    for (let i = 0; i < 3; i++) {
      const ph = (G.t * 0.4 + i / 3) % 1;
      for (let k = 0; k < 4; k++)
        natPart(
          x + 4 + i * 5 + Math.sin(G.t * 5 + k + i) * 0.8,
          y + 4 - ph * 8 - k,
          0.5,
          0.5,
          '#fff8e0',
          (1 - ph) * 0.35
        );
    }
  },
  // schizzi di latte quando il pistone affonda
  zangola(e, x, y, lav) {
    if (!lav) return;
    const ph = (G.t * 2.2) % 1;
    if (ph < 0.3)
      for (let i = 0; i < 4; i++) {
        const a = -Math.PI / 2 + (i - 1.5) * 0.6,
          d = ph * 14;
        natPart(
          x + 7 + Math.cos(a) * d * 0.5,
          y + 6 + Math.sin(a) * d * 0.4 + ph * ph * 10,
          0.75,
          0.75,
          '#fffaf0',
          1 - ph * 2.5
        );
      }
  },
  // bolle nella boccia, vapore dal cappello, una goccia che cade
  alambicco(e, x, y, lav) {
    if (!lav) return;
    for (let i = 0; i < 3; i++) {
      const ph = (G.t * 0.9 + i / 3) % 1;
      natPart(x + 14.5 + Math.sin(ph * 9 + i) * 1, y + 20 - ph * 3, 0.75, 0.75, '#ffffff', 0.9 - ph * 0.6);
    }
    natFumo(x + 6.5, y + 6, 4, '#f4f4f4', 0.45, 14, 3);
    const d = (G.t * 0.8) % 1;
    natPart(x + 14.75, y + 15 + d * 2.5, 0.5, 0.75, '#a8e0ff', 1 - d);
  },
  // i semi scendono dallo scivolo nel sacchetto
  seminatrice(e, x, y, lav) {
    if (!lav) return;
    for (let i = 0; i < 4; i++) {
      const ph = (G.t * 1.6 + i / 4) % 1;
      natPart(
        x + 4 + Math.sin(i * 3) * 0.5,
        y + 15 + ph * 5,
        0.5,
        0.5,
        ['#c8a060', '#8a6a3a', '#e8d0a0', '#a87a4a'][i],
        1 - ph * 0.5
      );
    }
  },
  // vapore dal mucchio e due mosche che girano
  compostiera(e, x, y, lav) {
    if (!lav) return;
    natFumo(x + 8, y + 4, 3, '#e8e0d0', 0.25, 10, 3);
    for (let i = 0; i < 2; i++) {
      const a = G.t * (2.4 + i) + i * 3,
        fx = x + 8 + Math.sin(a) * 6,
        fy = y + 1 + Math.sin(a * 2) * 2 - i * 2;
      natPart(fx, fy, 0.75, 0.75, '#1a1a1a', 1);
      if (Math.floor(G.t * 30 + i) % 2) natPart(fx - 0.5, fy - 0.5, 0.5, 0.5, '#d8e8ff', 0.8);
    }
  },
  // fumo dal comignolo, scintille dalla bocca
  fornoalegna(e, x, y, lav) {
    if (!lav) return;
    natFumo(x + 15, y + 1, 5, '#9a9a9a', 0.3, 20, 5);
    for (let i = 0; i < 3; i++) {
      const ph = (G.t * 1.1 + i / 3) % 1;
      natPart(x + 9 + Math.sin(ph * 7 + i * 2) * 2, y + 13 - ph * 7, 0.5, 0.5, '#ffd060', 1 - ph);
    }
  }
};
// fuochi che illuminano la notte
Ext.on('drawAmbTop', m => {
  try {
    if (m.id !== 'main' || !G.st || !G.st.free || G.night < 0.3) return;
    for (const o of m.objs) {
      if (o.kind !== 'built' || (o.bid !== 'fornoalegna' && o.bid !== 'alambicco')) continue;
      const b = G.st.free.built[o.bk];
      if (!macLav(b)) continue;
      const X = o.dx + (o.bid === 'fornoalegna' ? 10 : 7),
        Y = o.dy + (o.bid === 'fornoalegna' ? 15 : 19),
        r = 22 + Math.sin(G.t * 9) * 1.5,
        g = ctx.createRadialGradient(X, Y, 0, X, Y, r);
      g.addColorStop(0, `rgba(255,150,60,${(0.45 * G.night).toFixed(2)})`);
      g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(X - r, Y - r, r * 2, r * 2);
    }
  } catch (e) {
    console.error(e);
  }
});
function natDrawMach(e) {
  const F = NAT_MF[e.bid];
  if (!F) return;
  const st = G.st,
    b = st && st.free && st.free.built[e.bk],
    lav = macLav(b),
    fr = lav ? F.work[Math.floor(G.t * F.fps) % F.work.length] : F.idle;
  const x = Math.round(e.dx + (typeof hitShake === 'function' ? hitShake(e) : 0)),
    y = Math.round(e.dy);
  dImg(ctx, fr, x, y);
  try {
    NAT_ANIM[e.bid](e, x, y, lav, b || {});
  } catch (err) {}
}
Ext.on('listaMondo', list => {
  for (const e of list) if (e.kind === 'built' && NAT_MF[e.bid] && !e.disegna) e.disegna = natDrawMach;
});

// ---------- disegni ----------
Ext.on('arte', () => {
  try {
    const R = h => R6b(h);
    const WOOD = R('#8a5a32'),
      WD = R('#5a3a1e'),
      STONE = R('#8e8a80'),
      IRON = R('#4a4a52'),
      COP = R('#c8763a'),
      BRICK = R('#a85a3a');
    const F = (id, n, fn) => {
      const [w, h] = NAT_MACH[id].size;
      return Array.from({ length: n }, (_, i) =>
        SP(w, h, P => fn(P, i, new MK2(P.w, P.h), () => new MK2(P.w, P.h)))
      );
    };
    const legs = (P, M, xs, y0, y1) =>
      xs.forEach(x => paint2(P, M().rect(x, y0, 2, y1 - y0), WD, { thin: 1 }));
    // FRANTOIO: vasca di pietra, palo, macina che gira, beccuccio e coccio dell'olio
    const frantoio = (P, i, _, M) => {
      paint2(P, M().ell(18, 37, 16, 6), STONE, { mod: (X, Y, t) => ((X * 3 + Y * 5) % 9 === 0 ? t - 1 : t) });
      paint2(P, M().ell(18, 36, 12, 3.6), R('#5a6a3a'), { flat: 1, nc: 1, base: 2 });
      paint2(P, M().rect(17, 4, 3, 32), WOOD, { thin: 1 });
      paint2(P, M().rect(3, 4, 30, 3), WOOD, { thin: 1 });
      const a = (i / 8) * Math.PI * 2;
      paint2(P, M().ell(18, 25, 9, 9), STONE, { mod: (X, Y, t) => ((X + Y * 2) % 7 === 0 ? t - 1 : t) });
      paint2(P, M().ell(18, 25, 2.4, 2.4), IRON, { thin: 1 });
      for (let k = 0; k < 4; k++) {
        const ax = 18 + Math.cos(a + (k * Math.PI) / 2) * 6.5,
          ay = 25 + Math.sin(a + (k * Math.PI) / 2) * 6.5;
        paint2(P, M().ell(ax, ay, 1.4, 1.4), R('#5e5a52'), { thin: 1, nc: 1 });
      }
      paint2(P, M().rect(31, 32, 4, 2), IRON, { thin: 1 });
      paint2(P, M().ell(33, 41, 3, 2.6), R('#b8683a'), { thin: 1 });
    };
    // ESSICCATOIO: due pali, tettoia, tre graticci, mazzetti appesi che dondolano
    const essiccatoio = (lav, P, i, _, M) => {
      legs(P, M, [3, 31], 4, 44);
      paint2(
        P,
        M().poly([
          [0, 6],
          [36, 2],
          [36, 6],
          [0, 10]
        ]),
        R('#7a4a2a'),
        { thin: 1 }
      );
      for (const y of [17, 27, 37]) {
        paint2(P, M().rect(4, y, 28, 2), WOOD, { thin: 1 });
        for (let x = 5; x < 31; x += 3) P.set(x, y, C('#3a2414'));
      }
      if (lav) {
        const sw = [0, 1, 0, -1][i];
        for (const [x, c] of [
          [9, '#5a9a3a'],
          [18, '#c84a2a'],
          [27, '#a8805a']
        ]) {
          paint2(P, M().cap(x, 9, x + sw, 12, 0.5), R('#e8d8a8'), { thin: 1, nc: 1 });
          paint2(P, M().ell(x + sw, 14, 2.4, 2.8), R(c), { thin: 1 });
        }
      }
    };
    // ZANGOLA: botticella con cerchi di ferro, coperchio, pistone che va su e giù
    const zangola = (P, i, _, M) => {
      const off = [0, -3, -6, -3][i];
      paint2(P, M().rect(13, 2 + off, 2, 14), R('#c8a070'), { thin: 1 });
      paint2(P, M().rect(9, 2 + off, 10, 2), R('#c8a070'), { thin: 1 });
      paint2(
        P,
        M().poly([
          [6, 12],
          [22, 12],
          [24, 40],
          [4, 40]
        ]),
        WOOD,
        { mod: (X, Y, t) => (X % 4 === 0 ? t - 1 : t) }
      );
      for (const y of [16, 26, 36]) paint2(P, M().rect(5, y, 18, 2), IRON, { thin: 1, nc: 1 });
      paint2(P, M().ell(14, 12, 9, 2.6), R('#a87a4a'), { thin: 1 });
      paint2(P, M().rect(3, 40, 22, 3), WD, { thin: 1 });
    };
    // ALAMBICCO: fornello di mattoni con fuoco, caldaia di rame, collo di cigno, boccia di vetro
    const alambicco = (lav, P, i, _, M) => {
      paint2(P, M().rect(2, 30, 22, 16), BRICK, {
        mod: (X, Y, t) => (Y % 4 === 0 || (X + (Y >> 2) * 3) % 6 === 0 ? t - 2 : t)
      });
      paint2(
        P,
        M().ell(13, 39, 5, 4, (X, Y) => Y < 43),
        R('#1a0e0a'),
        { flat: 1 }
      );
      if (lav) {
        const h = [3, 4, 2.5][i];
        paint2(P, M().ell(13, 42 - h / 2, 3.2, h), R('#ff8a2a'), { flat: 1, nc: 1 });
        paint2(P, M().ell(13 + [0, -1, 1][i], 42 - h / 2 + 1, 1.6, h * 0.6), R('#ffe070'), {
          flat: 1,
          nc: 1
        });
      }
      paint2(P, M().ell(13, 24, 10, 8), COP, { mod: (X, Y, t) => (X < 9 && Y < 22 ? t + 2 : t) });
      paint2(P, M().rect(11, 9, 4, 9), COP, { thin: 1 });
      paint2(P, M().ell(13, 9, 4, 3), COP, { thin: 1 });
      paint2(P, M().cap(15, 9, 29, 22, 1.2), COP, { thin: 1 });
      paint2(P, M().ell(30, 38, 5, 5.4), R('#c8e4f0'), {
        mod: (X, Y, t) => (Y > 37 ? (P.set(X, Y, C('#9ad0e8')), null) : X < 28 && Y < 36 ? t + 2 : t)
      });
      paint2(P, M().rect(29, 30, 3, 4), R('#c8e4f0'), { thin: 1 });
      paint2(P, M().rect(25, 43, 11, 3), WD, { thin: 1 });
    };
    // SEMINATRICE: tramoggia di legno sulle gambe, ruota a manovella che gira, scivolo e sacchetto
    const seminatrice = (P, i, _, M) => {
      legs(P, M, [6, 24], 24, 42);
      paint2(
        P,
        M().poly([
          [2, 6],
          [30, 6],
          [24, 26],
          [8, 26]
        ]),
        WOOD,
        { mod: (X, Y, t) => (Y % 5 === 0 ? t - 1 : t) }
      );
      paint2(P, M().rect(5, 7, 22, 3), R('#8a6a3a'), { flat: 1, nc: 1 });
      for (const [x, y] of [
        [9, 8],
        [14, 8],
        [19, 8],
        [24, 8],
        [12, 9],
        [21, 9]
      ])
        P.set(x, y, C('#e8d0a0'));
      paint2(P, M().cap(10, 26, 8, 32, 1.4), WD, { thin: 1 });
      const a = (i / 6) * Math.PI * 2;
      paint2(P, M().ell(27, 18, 5, 5), IRON, { thin: 1 });
      paint2(P, M().ell(27, 18, 3.6, 3.6), R('#8a8a92'), { flat: 1, nc: 1 });
      for (let k = 0; k < 3; k++)
        paint2(
          P,
          M().cap(
            27,
            18,
            27 + Math.cos(a + (k * 2 * Math.PI) / 3) * 4,
            18 + Math.sin(a + (k * 2 * Math.PI) / 3) * 4,
            0.5
          ),
          IRON,
          { thin: 1, nc: 1 }
        );
      const hx = 27 + Math.cos(a) * 4.5,
        hy = 18 + Math.sin(a) * 4.5;
      paint2(P, M().rect(Math.round(hx), Math.round(hy) - 1, 3, 2), R('#c8a070'), { thin: 1 });
      paint2(P, M().ell(8, 40, 4, 3.4), R('#d8c8a0'), { thin: 1 });
    };
    // COMPOSTIERA: cassone a doghe con il mucchio scuro; quando lavora, il mucchio «respira»
    const compostiera = (lav, P, i, _, M) => {
      paint2(P, M().ell(16, 9 + (lav ? [0, -0.5, -1, -0.5][i] : 0), 12, 4), R('#3a2a1e'), {
        mod: (X, Y, t) => ((X * 5 + Y * 3) % 7 === 0 ? (P.set(X, Y, C('#5a8a2a')), null) : t)
      });
      for (let x = 3; x < 30; x += 5)
        paint2(P, M().rect(x, 9, 4, 22), WOOD, { mod: (X, Y, t) => (Y % 6 === 0 ? t - 1 : t) });
      paint2(P, M().rect(2, 14, 28, 2), WD, { thin: 1, nc: 1 });
      paint2(P, M().rect(2, 25, 28, 2), WD, { thin: 1, nc: 1 });
    };
    // FORNO A LEGNA: cupola di mattoni, bocca col fuoco, comignolo, legna accatastata
    const fornoalegna = (lav, P, i, _, M) => {
      paint2(P, M().rect(1, 34, 38, 10), STONE, { mod: (X, Y, t) => ((X * 3 + Y) % 8 === 0 ? t - 1 : t) });
      paint2(
        P,
        M().ell(18, 34, 15, 16, (X, Y) => Y <= 34),
        BRICK,
        {
          mod: (X, Y, t) => (Y % 4 === 0 || (X + ((Y >> 2) % 2) * 3) % 6 === 0 ? t - 1 : t)
        }
      );
      paint2(P, M().rect(26, 12, 5, 10), BRICK, { thin: 1 });
      paint2(
        P,
        M().ell(18, 34, 6, 7, (X, Y) => Y <= 34),
        R('#1a0e0a'),
        { flat: 1 }
      );
      if (lav) {
        const f = [
          [5, 4],
          [6, 5],
          [4, 3.5],
          [5.5, 4.6]
        ][i];
        paint2(
          P,
          M().ell(18, 34, f[0], f[1], (X, Y) => Y <= 34),
          R('#ff7a1a'),
          { flat: 1, nc: 1 }
        );
        paint2(
          P,
          M().ell(18 + [0, 1, -1, 0][i], 34, f[0] * 0.5, f[1] * 0.6, (X, Y) => Y <= 34),
          R('#ffe070'),
          { flat: 1, nc: 1 }
        );
      } else
        for (const [x, y] of [
          [16, 33],
          [19, 32],
          [21, 33]
        ])
          P.set(x, y, C('#c8401a'));
      for (const [x, y] of [
        [33, 38],
        [35, 36],
        [37, 38]
      ])
        paint2(P, M().ell(x, y, 2.4, 1.6), R('#7a4a2a'), { thin: 1 });
    };
    const def = {
      frantoio: [frantoio, 8, 8],
      essiccatoio: [null, 4, 3],
      zangola: [zangola, 4, 5],
      alambicco: [null, 3, 9],
      seminatrice: [seminatrice, 6, 8],
      compostiera: [null, 4, 2],
      fornoalegna: [null, 4, 9]
    };
    const conLav = { essiccatoio, alambicco, compostiera, fornoalegna };
    for (const [id, [fn, n, fps]] of Object.entries(def)) {
      const work = conLav[id] ? F(id, n, (...a) => conLav[id](true, ...a)) : F(id, n, fn),
        idle = conLav[id] ? F(id, 1, (...a) => conLav[id](false, ...a))[0] : work[0];
      NAT_MF[id] = { idle, work, fps };
      FREEIMG[id] = idle;
      ICON[id] = icon32(P => {}); // si ridisegna qui sotto, rimpicciolito
      const x = ICON[id].getContext('2d'),
        s = Math.min(30 / iw(idle), 30 / ih(idle));
      x.imageSmoothingEnabled = false;
      x.drawImage(idle, 16 - (iw(idle) * s) / 2, 31 - ih(idle) * s, iw(idle) * s, ih(idle) * s);
    }
    // prodotti
    const I = () => new MK2(32, 32);
    ICON.olio = icon32(P => {
      paint2(P, I().rect(10, 12, 12, 17), R('#a8b048'), { mod: (X, Y, t) => (X < 13 ? t + 2 : t) });
      paint2(P, I().rect(13, 4, 6, 8), R('#c8d8a0'), { thin: 1 });
      paint2(P, I().rect(13, 2, 6, 3), R('#8a5a32'), { thin: 1 });
      paint2(P, I().rect(11, 17, 10, 6), R('#f0e8c8'), { thin: 1, nc: 1 });
      paint2(P, I().ell(16, 20, 2.4, 1.6), R('#4a5a2a'), { thin: 1, nc: 1 });
    });
    ICON.burro = icon32(P => {
      paint2(P, I().ell(16, 22, 13, 5), R('#f2ece0'), { thin: 1 });
      paint2(
        P,
        I().poly([
          [7, 14],
          [23, 12],
          [26, 20],
          [10, 22]
        ]),
        R('#f6e08a'),
        { mod: (X, Y, t) => (Y < 15 ? t + 1 : t) }
      );
    });
    ICON.caldarroste = icon32(P => {
      paint2(
        P,
        I().poly([
          [6, 8],
          [26, 8],
          [16, 30]
        ]),
        R('#d8c8a0'),
        { mod: (X, Y, t) => ((X + Y) % 6 === 0 ? t - 1 : t) }
      );
      for (const [x, y] of [
        [10, 8],
        [15, 6],
        [20, 8],
        [13, 10],
        [18, 10]
      ]) {
        paint2(P, I().ell(x, y, 3, 2.6), R('#6a3a1e'));
        P.set(x, y - 1, C('#f0d8a0'));
      }
    });
    for (const k of Object.keys(ITEMS)) {
      const it = ITEMS[k];
      if (!it.pre2 || !ICON[it.pre2]) continue;
      if (k.startsWith('secco_'))
        ICON[k] = icon32(P => {
          paint2(P, I().ell(16, 24, 13, 5), R('#c8a870'), {
            mod: (X, Y, t) => ((X * 3 + Y) % 5 === 0 ? t - 1 : t)
          });
        });
      if (k.startsWith('ess_'))
        ICON[k] = icon32(P => {
          paint2(P, I().ell(16, 21, 8, 8), R('#d8ecf4'), {
            mod: (X, Y, t) => (X < 13 && Y < 18 ? t + 2 : t)
          });
          paint2(P, I().rect(13, 6, 6, 8), R('#d8ecf4'), { thin: 1 });
          paint2(P, I().rect(13, 3, 6, 4), R('#8a5a32'), { thin: 1 });
        });
      const c = ICON[k],
        x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      if (k.startsWith('secco_')) {
        x.filter = 'sepia(0.55) saturate(0.85) brightness(0.92)';
        x.drawImage(ICON[it.pre2], 6, 4, 20, 20);
        x.filter = 'none';
      } else x.drawImage(ICON[it.pre2], 10, 15, 12, 12);
    }
  } catch (e) {
    console.error(e);
  }
});
