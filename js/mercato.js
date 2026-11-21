'use strict';
// ================= MERCATO VIVO E DISPENSA DEL VILLAGGIO (solo nella Valle) =================
// MERCATO
//  - Domanda del giorno: ogni mattina tre prodotti pagano di più (+30…70%). Si vede nel taccuino e alla cassetta.
//  - Saturazione: dello stesso prodotto, i primi 10 al giorno si vendono a prezzo pieno; poi ogni pezzo vale il 2%
//    in meno, fino al 40%. Ogni mattina la saturazione si dimezza: il prezzo risale in pochi giorni.
//  Stato: st.free.mercato = { giorno, domanda: {id: molt}, sat: {id: pezzi} }
// DISPENSA
//  - In piazza. Ogni mattina gli abitanti ci lasciano quello che gli avanza; tu puoi prendere 3 cose al giorno.
//  - Puoi lasciarci i tuoi avanzi: prestigio per il villaggio, fiducia di tutti, e ogni tanto un regalo in cambio.
//  Stato: st.free.dispensa = { items: {id: n}, presi: n, giorno, donato: valore totale }
const SOGLIA_SAT = 10;
const Mercato = {
  m(st = G.st) {
    const F = st.free;
    return (F.mercato = F.mercato || { giorno: -1, domanda: {}, sat: {} });
  },
  // fattore della domanda del giorno (il prezzo in cassetta e da Ottavio lo usa sempre)
  domanda(id) {
    const st = G.st;
    if (!st || !isFree(st) || !st.free) return 1;
    return this.m(st).domanda[id] || 1;
  },
  satFatt(u) {
    return u < SOGLIA_SAT ? 1 : Math.max(0.4, 1 - (u - SOGLIA_SAT + 1) * 0.02);
  },
  // vende n pezzi: il prezzo scende pezzo dopo pezzo oltre la soglia; restituisce il totale
  vendi(id, n, molt = 1) {
    const st = G.st;
    if (!isFree(st)) return sellPrice(id) * n * molt;
    const M = this.m(st),
      base = sellPrice(id) * molt;
    let tot = 0;
    for (let i = 0; i < n; i++) {
      tot += base * this.satFatt(M.sat[id] || 0);
      M.sat[id] = (M.sat[id] || 0) + 1;
    }
    return Math.round(tot);
  },
  // quanto renderebbero n pezzi adesso, senza venderli
  stima(id, n, molt = 1) {
    const st = G.st;
    if (!isFree(st)) return sellPrice(id) * n * molt;
    const M = this.m(st),
      base = sellPrice(id) * molt;
    let tot = 0,
      u = M.sat[id] || 0;
    for (let i = 0; i < n; i++) tot += base * this.satFatt(u++);
    return Math.round(tot);
  },
  mattina(st) {
    if (!isFree(st)) return;
    const M = this.m(st);
    if (M.giorno === st.day) return;
    M.giorno = st.day;
    for (const k in M.sat) {
      M.sat[k] = Math.floor(M.sat[k] / 2);
      if (!M.sat[k]) delete M.sat[k];
    }
    const s = seasonOf(st),
      pool = [
        ...Object.keys(CROPS).filter(c => cropInSeason(c, s)),
        ...(WILD[s] || []),
        'uovo',
        'latte',
        'miele',
        'farina',
        'lana',
        'formaggio'
      ].filter((k, i, a) => ITEMS[k] && a.indexOf(k) === i);
    M.domanda = {};
    for (let i = 0; i < 3 && pool.length; i++) {
      const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      M.domanda[k] = Math.round((1.3 + Math.random() * 0.4) * 100) / 100;
    }
  },
  html(st) {
    const M = this.m(st),
      dom = Object.entries(M.domanda),
      sat = Object.entries(M.sat)
        .filter(([, u]) => u >= SOGLIA_SAT)
        .sort((a, b) => b[1] - a[1]);
    let h = '<h3>Il mercato di oggi</h3>';
    h += dom.length
      ? `<p class="small">Si paga di più: ${dom.map(([k, f]) => `<b>${esc(ITEMS[k].n)}</b> (+${Math.round((f - 1) * 100)}%)`).join(' · ')}</p>`
      : '<p class="small">Nessuna richiesta speciale oggi.</p>';
    if (sat.length)
      h += `<p class="small">Ne hai venduti tanti, il prezzo è sceso: ${sat
        .slice(0, 5)
        .map(([k, u]) => `${esc(ITEMS[k].n)} (−${Math.round((1 - this.satFatt(u)) * 100)}%)`)
        .join(' · ')}. Risale un po' ogni mattina.</p>`;
    h += `<p class="small">Dello stesso prodotto, i primi ${SOGLIA_SAT} al giorno si vendono a prezzo pieno. Conviene variare.</p>`;
    return h;
  }
};

// ---------------- DISPENSA ----------------
const DISP_T = [
  [50, 19], // fra il pozzo e la bancarella, si apre da sotto
  [47, 20],
  [39, 21],
  [48, 18],
  [38, 18],
  [50, 22],
  [40, 23]
];
// cosa avanza a chi: [oggetto, quanti]
const AVANZI = {
  agatha: [['uovo', 2]],
  brom: [['legna', 4]],
  bruno: [['farina', 2]],
  elio: [
    ['lana', 1],
    ['fieno', 3]
  ],
  gaspare: [['miele', 1]],
  mirta: [['camomilla', 2]],
  teo: [
    ['pietra', 4],
    ['ferro', 1]
  ],
  silvio: [['legna', 5]],
  nora: [['trota', 1]],
  rina: [['__stagione', 2]]
};
const Dispensa = {
  d(st = G.st) {
    return (st.free.dispensa = st.free.dispensa || { items: {}, presi: 0, giorno: -1, donato: 0 });
  },
  presenti(st) {
    const res = typeof residents === 'function' ? residents(st).map(r => r.id) : [];
    return ['agatha', 'brom', ...res];
  },
  mattina(st) {
    if (!isFree(st)) return;
    const D = this.d(st);
    if (D.giorno === st.day) return;
    D.giorno = st.day;
    D.presi = 0;
    let tot = Object.values(D.items).reduce((a, b) => a + b, 0);
    for (const id of this.presenti(st)) {
      if (tot >= 14 || Math.random() < 0.4) continue;
      for (let [it, n] of AVANZI[id] || []) {
        if (it === '__stagione') {
          const L = Object.keys(CROPS).filter(c => cropInSeason(c, seasonOf(st)));
          it = L[Math.floor(Math.random() * L.length)];
        }
        if (!it || !ITEMS[it]) continue;
        D.items[it] = (D.items[it] || 0) + n;
        tot += n;
      }
    }
  },
  apri() {
    const st = G.st,
      D = this.d(st),
      left = Math.max(0, 3 - D.presi),
      L = Object.entries(D.items).filter(([, n]) => n > 0),
      inv = st.inv
        .map((s, i) => [s, i])
        .filter(([s]) => s && ['crop', 'food', 'res'].includes(ITEMS[s.id].t));
    UI.open(
      `<button class="btn mclose" data-close>✕</button><h2>La dispensa del villaggio</h2><p class="small">Gli abitanti ci lasciano quello che gli avanza, tu ci lasci il tuo. Puoi prendere ancora <b>${left}</b> cose oggi. Quello che doni fa crescere il prestigio del villaggio e la fiducia di tutti.</p>` +
        '<h3>Da prendere</h3>' +
        (L.length
          ? L.map(
              ([id, n]) =>
                `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${esc(ITEMS[id].n)} ×${n}</span><button class="btn" data-take="${id}" ${left ? '' : 'disabled'}>Prendi 1</button></div>`
            ).join('')
          : '<p class="small">Vuota, per ora. Domattina qualcuno lascerà qualcosa.</p>') +
        '<h3>Da donare</h3>' +
        (inv.length
          ? inv
              .map(
                ([s, i]) =>
                  `<div class="mrow"><canvas data-i="${s.id}" width="32" height="32"></canvas><span>${esc(ITEMS[s.id].n)} ×${s.n}</span><button class="btn" data-give="${i}">Dona tutto</button></div>`
              )
              .join('')
          : '<p class="small">Non hai niente da donare: raccolti, piatti e materiali.</p>') +
        `<p class="small">Hai donato in tutto: ${CZ(D.donato)} di roba.</p>`
    );
    const box = $('#mbox');
    box.querySelectorAll('canvas[data-i]').forEach(c => {
      if (ICON[c.dataset.i]) c.getContext('2d').drawImage(ICON[c.dataset.i], 0, 0);
    });
    box.querySelectorAll('[data-take]').forEach(
      b =>
        (b.onclick = () => {
          const id = b.dataset.take;
          if (D.presi >= 3 || !D.items[id] || !addItem(id, 1)) return;
          D.items[id]--;
          if (!D.items[id]) delete D.items[id];
          D.presi++;
          AU.play('pick');
          UI._mclose = null;
          this.apri();
        })
    );
    box.querySelectorAll('[data-give]').forEach(
      b =>
        (b.onclick = () => {
          const s = st.inv[+b.dataset.give];
          if (!s) return;
          const val = (ITEMS[s.id].v || ITEMS[s.id].e || 5) * s.n;
          D.items[s.id] = (D.items[s.id] || 0) + s.n;
          D.donato += val;
          st.inv[+b.dataset.give] = null;
          // fiducia per tutti: un punto ogni 60 scudi donati
          const pt = Math.min(5, Math.floor(val / 60));
          if (pt) for (const id of FAV_NPC) Richieste.addFid(id, pt);
          // ogni tanto un grazie
          if (val >= 100 && Math.random() < 0.35) {
            const id = FAV_NPC[Math.floor(Math.random() * FAV_NPC.length)],
              G2 = ['pane', 'marmellata', 'tisana', 'uovo', 'miele'].filter(k => ITEMS[k]),
              it = G2[Math.floor(Math.random() * G2.length)];
            st.mailbox = st.mailbox || [];
            st.mailbox.push({ item: it, n: 1, from: NAMES[id] });
            UI.toast(`${NAMES[id]} ha visto cosa hai donato. Domani c'è un pensiero per te nella cassetta.`);
          }
          AU.play('coin');
          UI.hotbar();
          UI.toast(`Hai donato ${s.n} × ${ITEMS[s.id].n}. Il villaggio ringrazia.`);
          UI._mclose = null;
          this.apri();
        })
    );
  }
};
// la dispensa in piazza
Ext.on('applyFree', (m, st) => {
  if (m.id !== 'main' || !isFree(st) || G.visit) return;
  if (!IMG.dispensa) IMG.dispensa = artDispensa();
  const t = DISP_T.find(([x, y]) => !m.objAt(x, y) && !m.solid(x, y));
  if (!t) return;
  m.add(OB('dispensa', t[0], t[1], IMG.dispensa, { act: 'dispensa' }));
});
PROMPT.dispensa = 'Dispensa';
ACT.dispensa = () => Dispensa.apri();
Ext.on('freeAct:intercetta', (fx, fy) => {
  const o = G.map.objAt(fx, fy);
  if (o && o.act === 'dispensa' && !G.visit) {
    Dispensa.apri();
    return true;
  }
});
Ext.on('freeMorning', st => {
  Mercato.mattina(st);
  Dispensa.mattina(st);
});
function artDispensa() {
  return GB(16, 20, (P, B) => {
    const W = B.R6('#9a6436'),
      D = B.R6('#5a3a1e');
    for (const X of [3, 26]) {
      B.F(P, X, 18, 3, 20, B.tc(D, 3));
      B.F(P, X, 18, 1, 20, B.tc(D, 4));
    }
    B.planks(P, 1, 16, 30, 6, W, { rowH: 6, seam: 15 });
    B.F(P, 1, 22, 30, 2, B.tc(D, 1));
    // tettoia a strisce
    for (let X = 0; X < 32; X++)
      for (let Y = 2; Y < 8; Y++) B.S(P, X, Y, C(Math.floor(X / 4) % 2 ? '#efe6d2' : '#3a7a4a'));
    for (let X = 0; X < 32; X += 4) B.F(P, X + 1, 8, 2, 1, C('#2a5a3a'));
    B.F(P, 2, 8, 2, 8, B.tc(D, 2));
    B.F(P, 28, 8, 2, 8, B.tc(D, 2));
    // ceste
    for (const [x, c] of [
      [4, '#e8781a'],
      [13, '#f2ecdc'],
      [22, '#8acd4a']
    ]) {
      B.F(P, x, 12, 7, 4, B.tc(B.R6('#a8743e'), 3));
      B.F(P, x, 12, 7, 1, B.tc(B.R6('#a8743e'), 4));
      for (let i = 0; i < 3; i++) B.F(P, x + 1 + i * 2, 10, 2, 2, C(c));
    }
  });
}

Ext.on('mpTick', () => {
  const st = G.st;
  if (st && isFree(st) && st.free && !G.visit && Mercato.m(st).giorno !== st.day) Mercato.mattina(st);
});
