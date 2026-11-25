'use strict';
// ================= L'EMPORIO CRANE, DENTRO =================
// La porta dell'emporio di Agatha si apre (di giorno): dentro, il bancone con la bilancia, il campanello, il
// registro e il barattolo degli scudi, gli scaffali lungo il muro con i semi della stagione, il tavolo delle
// novità, i sacchi di concime e il cesto del pane di Clara. La merce si tocca: si vede il prezzo, la descrizione,
// e si compra (le stesse regole della bottega di sempre, UI.shop: sconto d'amica, il pane solo dopo le 8).
// Nella Valle, quando la sua giornata dice «banco», Agatha sta qui dietro il bancone; il sabato torna in piazza
// col banco del mercato. Nella storia il banco in piazza resta il suo posto: dentro ci si serve da soli e gli
// scudi vanno nel barattolo. Di notte l'emporio è chiuso: alla porta si bussa (porte.js).

const EMP_W = 12,
  EMP_H = 9,
  EMP_APRE = 7 * 60 + 30,
  EMP_CHIUDE = 18 * 60 + 30,
  EMP_DIETRO = [9, 4]; // dove sta Agatha, dietro il bancone
const empAperto = st => st.time >= EMP_APRE && st.time < EMP_CHIUDE && !(st.flags && st.flags.finaleChase);
IMAP.store = 'store'; // chi esce dall'emporio esce dalla porta dell'emporio (npc.js)

// ---------- la grafica ----------
Ext.on('arte', () => {
  const D = EMPORIO_MANO;
  for (const k of Object.keys(D.sprite)) FREEIMG['emp_' + k] = daGriglia(D, k);
});

// ---------- la merce: dove sta ogni cosa ----------
// i semi della stagione sugli scaffali (quattro per scaffale, uno per asse) e il resto sul tavolo delle novità;
// il concime nei sacchi, il pane nel cesto
const EMP_SCAFFALI = [
  [1, 2],
  [3, 2],
  [5, 2]
];
function empMerce() {
  const L = shopItems(),
    semi = L.filter(id => ITEMS[id] && ITEMS[id].t === 'seed'),
    M = { scaffali: EMP_SCAFFALI.map((_, i) => semi.slice(i * 4, i * 4 + 4)), tavolo: semi.slice(12) };
  M.altro = L.filter(id => !semi.includes(id));
  return M;
}

// ---------- la stanza ----------
function buildEmporio(st) {
  const m = new GMap('store', EMP_W, EMP_H, { interior: 1, name: 'Emporio Crane' });
  m.fill(0, 0, EMP_W - 1, 0, 8);
  m.fill(0, 1, EMP_W - 1, 1, 9);
  m.fill(0, 2, EMP_W - 1, EMP_H - 1, 6);
  const I = FREEIMG,
    pezzo = (kind, x, y, img, o = {}) =>
      img &&
      m.add(
        Object.assign(OB(kind, x, y, img, o), {
          solid: o.solid || [[x, y]],
          hits: o.hits || o.solid || [[x, y]]
        })
      );
  // gli scaffali lungo il muro di fondo (due caselle ciascuno)
  EMP_SCAFFALI.forEach(([x, y], i) =>
    pezzo('emp_scaffale', x, y, I.emp_scaffale, {
      wt: 2,
      act: 'empScaffale',
      scaffale: i,
      solid: [
        [x, y],
        [x + 1, y]
      ],
      lift: 3
    })
  );
  // le erbe appese e la lavagnetta coi prezzi
  pezzo('emp_erbe', 8, 1, I.emp_erbe, { solid: [], hits: [], lift: -2 });
  pezzo('emp_lavagna', 10, 1, I.emp_lavagna, { solid: [], hits: [[10, 2]], act: 'empLavagna', lift: 4 });
  m.add(OB('window', 7, 0, IMG.window, { solid: [], hits: [], lift: 2, win: 1 }));
  // il bancone, con Agatha dietro (lo spazio dietro è suo)
  pezzo('emp_bancone', 7, 5, I.emp_bancone, {
    wt: 4,
    act: 'empBancone',
    solid: [
      [7, 5],
      [8, 5],
      [9, 5],
      [10, 5]
    ]
  });
  for (let y = 2; y <= 4; y++) m.block(11, y);
  m.block(7, 4);
  m.block(7, 3);
  // il tavolo delle novità, i sacchi, il cesto del pane
  pezzo('emp_tavolo', 1, 6, I.emp_tavolo, {
    wt: 3,
    act: 'empTavolo',
    solid: [
      [1, 6],
      [2, 6],
      [3, 6]
    ]
  });
  pezzo('emp_sacchi', 5, 6, I.emp_sacchi, { act: 'empSacchi', wt: 1 });
  pezzo('emp_cesto', 10, 7, I.emp_cesto, { act: 'empCesto', lift: -2 });
  // il tappeto davanti al bancone, la luce delle candele
  m.add({
    kind: 'rug',
    tx: 7,
    ty: 6,
    img: IMG.rug,
    dx: 7 * 16,
    dy: 6 * 16 + 4,
    sy: -1,
    solid: [],
    hits: [],
    deco: 1
  });
  m.lights.push({ x: 9 * 16, y: 4 * 16, r: 64, fire: 1 }, { x: 3 * 16, y: 3 * 16, r: 52, fire: 1 });
  const [dx, dy] = bdoor('store');
  m.add({
    kind: 'mat',
    tx: 5,
    ty: EMP_H - 1,
    img: IMG.mat,
    dx: 5 * 16,
    dy: (EMP_H - 1) * 16 + 4,
    sy: -1,
    solid: [],
    hits: [],
    deco: 1
  });
  m.doors.push({ tx: 5, ty: EMP_H - 1, to: 'main', x: dx, y: dy + 1, dir: 0 });
  addExits(m);
  buildGround(m);
  return m;
}
Ext.avvolgi('rebuildMaps', function (prossimo, ...a) {
  const r = prossimo(...a);
  if (G.st) {
    G.maps.store = buildEmporio(G.st);
    if (G.map && G.map.id === 'store') G.map = G.maps.store;
  }
  return r;
});
// la merce si vede: pacchetti di semi sulle assi degli scaffali e nelle cassette del tavolo
Ext.on('drawWorldExtras', m => {
  if (m.id !== 'store') return;
  const M = empMerce(),
    ic = (id, x, y, s = 10) => ICON[id] && ctx.drawImage(ICON[id], Math.round(x), Math.round(y), s, s);
  for (const o of m.objs) {
    if (o.act === 'empScaffale')
      (M.scaffali[o.scaffale] || []).forEach((id, i) => {
        // un pacchetto per asse, appoggiato (le assi sono alle righe 9, 17, 25 e 33 dello scaffale), a zig-zag
        ic(id, o.dx + 6 + (i % 2) * 12, o.dy + 1 + i * 8, 8);
      });
    if (o.act === 'empTavolo')
      M.tavolo
        .slice(0, 6)
        .forEach((id, i) => ic(id, o.dx + 5 + (i % 3) * 14, o.dy - 2 - Math.floor(i / 3) * 3, 9));
  }
});

// ---------- comprare quello che tocchi ----------
function empPrezzo(id) {
  const disc = hearts('agatha') >= 4 ? 0.9 : 1;
  return Math.round(ITEMS[id].p * disc);
}
function empNota(id) {
  const st = G.st,
    d = ITEMS[id];
  if (id === 'pane') {
    const bread = st.time >= 480 ? st.bread || 0 : 0;
    return st.time < 480
      ? 'Lo porta Clara, dopo le 8:00.'
      : bread
        ? `Sfornato da Clara stamattina. Ne restano ${bread}.`
        : 'Finito per oggi.';
  }
  if (d.t !== 'seed') return d.d;
  const c = CROPS[d.crop];
  return `Matura in ${c.days} notti${c.re ? ', poi ricresce ogni notte' : ''} · vale ${CZ(ITEMS[d.crop].v)}`;
}
function empCompra(titolo, ids) {
  const st = G.st,
    agatha = NPC('agatha'),
    c_e = agatha && !agatha.hidden && agatha.map === 'store',
    can = (id, q) =>
      st.money >= empPrezzo(id) * q && (id !== 'pane' || (st.time >= 480 && (st.bread || 0) >= q));
  ids = ids.filter(id => ITEMS[id]);
  if (!ids.length) return UI.toast('Qui, oggi, non c’è niente.');
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${titolo}</h2><p class="small">${c_e ? 'Agatha ti guarda da dietro il bancone.' : 'Agatha non c’è: «Servitevi pure. Gli scudi nel barattolo.»'} — Hai <b>${CZ(st.money)}</b>${hearts('agatha') >= 4 ? ' · sconto amicizia −10%' : ''}</p>` +
      ids
        .map(
          id =>
            `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}<br><span class="small">${empNota(id)}</span></span><b class="price">${CZ(empPrezzo(id))}</b><button class="btn" data-b="${id}" data-q="1" ${can(id, 1) ? '' : 'disabled'}>×1</button><button class="btn" data-b="${id}" data-q="5" ${can(id, 5) ? '' : 'disabled'}>×5</button></div>`
        )
        .join('')
  );
  const box = $('#mbox');
  box
    .querySelectorAll('canvas[data-i]')
    .forEach(c => ICON[c.dataset.i] && c.getContext('2d').drawImage(ICON[c.dataset.i], 0, 0));
  box.querySelectorAll('[data-b]').forEach(
    b =>
      (b.onclick = () => {
        const id = b.dataset.b,
          q = +b.dataset.q;
        if (!can(id, q) || !addItem(id, q)) return;
        st.money -= empPrezzo(id) * q;
        if (id === 'pane') st.bread -= q;
        else if (ITEMS[id].t === 'seed') st.flags.boughtSeeds = 1;
        AU.play(c_e ? 'coin' : 'pick');
        UI.hud();
        UI._mclose = null;
        empCompra(titolo, ids);
      })
  );
}
ACT.empScaffale = o => empCompra('Lo scaffale dei semi', empMerce().scaffali[o.scaffale] || []);
ACT.empTavolo = () => {
  const M = empMerce();
  return empCompra('Il tavolo delle novità', M.tavolo.length ? M.tavolo : M.scaffali.flat());
};
ACT.empSacchi = () =>
  empCompra(
    'I sacchi',
    empMerce().altro.filter(id => id !== 'pane')
  );
ACT.empCesto = () => empCompra('Il cesto del pane', ['pane']);
ACT.empLavagna = () =>
  UI.toast(
    G.st.demand
      ? `Sulla lavagnetta, col gesso: «Oggi si pagano bene: ${PL[G.st.demand]}».`
      : 'Sulla lavagnetta, col gesso: «Semi buoni, terra buona, gente buona». E sotto, più piccolo: «Niente credito».'
  );
// il bancone: se c'è, si parla con Agatha; se no, il campanello
ACT.empBancone = () => {
  const a = NPC('agatha');
  if (a && !a.hidden && a.map === 'store') return talkTo(a);
  AU.play('blip');
  UI.toast('Suoni il campanello. Nessuno. Sul registro, la sua scrittura: «Torno subito».');
};
Object.assign(PROMPT, {
  empScaffale: 'Guarda',
  empTavolo: 'Guarda',
  empSacchi: 'Guarda',
  empCesto: 'Guarda',
  empLavagna: 'Leggi',
  empBancone: 'Bancone'
});

// ---------- la porta ----------
Ext.on('porta:intercetta', o => {
  if (o.key !== 'store') return null;
  const st = G.st;
  if (!empAperto(st)) return null; // chiuso: si bussa (porte.js) o si legge il biglietto
  return Ext.intercetta('vaiMappa', 'store', 5, EMP_H - 2, 3);
});
// nella Valle, quando la sua giornata dice «banco», Agatha sta dietro il bancone; il sabato resta al mercato
{
  const giornata = SCHED.agatha;
  SCHED.agatha = function (st) {
    const r = giornata(st);
    if (r && r.act === 'stall' && isFree(st) && !G.visit && WD(st) !== 5)
      return Object.assign({}, r, { in: 'store', seat: [EMP_DIETRO[0], EMP_DIETRO[1], 0], act: 'shop' });
    return r;
  };
}
// la bancarella vuota in piazza, nei giorni senza mercato: si dice dove trovarla
{
  const banco = ACT.stall;
  ACT.stall = o => {
    const st = G.st,
      s = schedOf('agatha');
    if (s && s.in === 'store' && empAperto(st))
      return UI.toast(
        'Il banco è vuoto: oggi non è giorno di mercato. Agatha è dentro l’emporio, lì accanto.'
      );
    return banco(o);
  };
}
