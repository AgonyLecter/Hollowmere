'use strict';
// ================= L'INGEGNERE =================
// Il primo automatismo della serra (serra_auto.js) fa parlare di te: la mattina dopo, in paese, accanto alla piazza,
// si ferma un carro-officina sbuffante. Ci vive l'Ingegnere, un costruttore di automi a molla e a vapore, col
// cilindro, gli occhialoni d'ottone da saldatore e un passerotto meccanico sul cappello.
// Vende i congegni per i campi e la chiave inglese per montarli dove vuoi (come i fili della pietra rossa):
//   · l'irrigatore interrato e quello grande: si montano sull'INCROCIO fra quattro zolle, sotto terra, quindi non
//     tolgono posto a nessuna pianta; alle 7 spuntano, girano spruzzando e rientrano (2×2 o 4×4 zolle);
//   · il braccio raccoglitore: un palo sottile sull'incrocio con un braccio d'ottone a gomito; dalle 8 raccoglie le
//     piante mature delle 4×4 zolle intorno e le spedisce, in una capsula lungo il filo di rame, alla cassa a cui
//     l'hai collegato con la chiave.
// Con la chiave in mano si vedono gli incroci, i congegni, le zolle che coprono e i fili (come in Terraria):
// il tasto azione monta, smonta, collega. Se sei altrove, il lavoro si fa lo stesso, all'ora giusta, in un colpo.
// Stato: st.free.ing = { arriva, qui: [x, y], day, conosciuto }, st.free.auto = { 'cx,cy': { t, cassa } },
// st.free.autoDay = { irr, braccio }. L'incrocio (cx, cy) è l'angolo in alto a sinistra della zolla (cx, cy).

const ING = 'ingegnere';
const ING_N = "L'Ingegnere";

// ---------- l'aspetto: cilindro con la fascia di rame, occhialoni, baffi arricciati, cappotto e grembiule ----------
NPC_DEF.push([ING, ING_N]);
NAMES[ING] = ING_N;
LOOKS[ING] = {
  mano: 1,
  volto: 'ingegnere',
  occhialoni: 1,
  skin: '#d4b49a',
  hair: '#2a2228',
  style: 'messy',
  eye: '#3a5a4a',
  shirt: '#d8ccb0',
  coat: '#24343c',
  apron: '#5a3a22',
  belt: '#3a2414',
  cravat: '#7c1512',
  pants: '#2a2228',
  shoe: '#1e140c',
  boots: 1,
  rolled: 1,
  hat: 'tall',
  hatCol: '#1c181e',
  hatBand: '#b05a22'
};

// i regali: metalli e cristalli sì, fiori no («fanno polline negli ingranaggi»)
LIKES[ING] = { lingotto: 3, nichel: 3, quarzo: 2, ametista: 2, rame: 2, oro: 2, ferro: 1 };
DISLIKES[ING] = ['lavanda', 'girasole', 'viola', 'calendula'];

// ---------- i congegni ----------
const CONGEGNI = {
  irr: { item: 'irr_auto', r: 1, n: 'Irrigatore interrato' },
  irr2: { item: 'irr_auto2', r: 2, n: 'Irrigatore interrato grande' },
  braccio: { item: 'braccio_auto', r: 2, n: 'Braccio raccoglitore' }
};
const CONG_DA_ITEM = Object.fromEntries(Object.entries(CONGEGNI).map(([t, c]) => [c.item, t]));
Object.assign(ITEMS, {
  chiave: {
    n: 'Chiave inglese',
    t: 'tool',
    d: 'Dell’Ingegnere. In mano mostra gli incroci fra le zolle e i congegni: monta, smonta, collega.'
  },
  irr_auto: {
    n: 'Irrigatore interrato',
    t: 'congegno',
    d: 'Si monta con la chiave sull’incrocio fra 4 zolle, sotto terra: non toglie posto. Alle 7 le bagna.'
  },
  irr_auto2: {
    n: 'Irrigatore interrato grande',
    t: 'congegno',
    d: 'Come quello piccolo, ma con quattro becchi: alle 7 bagna le 16 zolle intorno al suo incrocio.'
  },
  braccio_auto: {
    n: 'Braccio raccoglitore',
    t: 'congegno',
    d: 'Un palo sull’incrocio e un braccio d’ottone: dalle 8 raccoglie le 16 zolle intorno e spedisce tutto alla cassa collegata.'
  }
});
SWING_TOOLS.chiave = 1; // la chiave fa il suo gesto, come gli altri attrezzi
const ING_SHOP = [
  ['chiave', 350],
  ['irr_auto', 280],
  ['irr_auto2', 950],
  ['braccio_auto', 1800]
];

// ---------- il carro-officina e la grafica ----------
Ext.on('arte', () => {
  const D = INGEGNERE_MANO;
  FREEIMG.carroIng = daGriglia(D, 'carro');
  FREEIMG.passerotto = [0, 1].map(f => daGriglia(D, 'passerotto' + f));
  for (const [id, nome] of [
    ['chiave', 'ico_chiave'],
    ['irr_auto', 'ico_irr'],
    ['irr_auto2', 'ico_irr2'],
    ['braccio_auto', 'ico_braccio']
  ]) {
    const g = daGriglia(D, nome),
      [c, x] = mk(32, 32);
    x.imageSmoothingEnabled = false;
    x.drawImage(g, 0, 0, 32, 32);
    ICON[id] = c;
  }
});
const ingSt = st => (st || G.st).free && (st || G.st).free.ing;
const ingQui = st => {
  const I = ingSt(st);
  return I && I.qui && (st || G.st).day >= I.day ? I : null;
};
const carroPorta = I => [I.qui[0] + 2, I.qui[1] + 1];
// il posto del carro: 4×2 caselle libere (e la fila davanti per la porta), il più vicino possibile alla piazza
function carroPosto(m, st) {
  const libera = (x, y) =>
    m.inb(x, y) &&
    !m.solid(x, y) &&
    !m.objAt(x, y) &&
    !st.farm[x + ',' + y] &&
    !st.free.built[x + ',' + y] &&
    m.get(x, y) !== 3;
  const va = (ax, ay) => {
    for (let y = ay - 1; y <= ay + 1; y++) for (let x = ax; x < ax + 4; x++) if (!libera(x, y)) return false;
    return true;
  };
  for (let r = 0; r < 14; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (va(54 + dx, 21 + dy)) return [54 + dx, 21 + dy];
      }
  return null;
}
Ext.on('applyFree', (m, st) => {
  if (m.id !== 'main' || !isFree(st)) return;
  const I = ingQui(st),
    img = FREEIMG.carroIng;
  if (!I || !img) return;
  const [ax, ay] = I.qui,
    solid = [];
  for (let y = ay - 1; y <= ay; y++) for (let x = ax; x < ax + 4; x++) solid.push([x, y]);
  m.add({
    kind: 'carroIng',
    tx: ax,
    ty: ay,
    wt: 4,
    img,
    dx: ax * 16,
    dy: (ay + 1) * 16 - ih(img),
    sy: (ay + 1) * 16 - 1,
    solid,
    hits: solid,
    act: 'carroIng'
  });
});
ACT.carroIng = () => {
  const t = G.st.time,
    n = G.npcs.find(x => x.id === ING);
  if (n && !n.hidden) return UI.toast('La porta è aperta. Lui è lì fuori: parlagli.');
  UI.toast(
    t >= 22 * 60 || t < 6 * 60
      ? 'Dall’oblò esce una luce verde. Dentro, qualcosa ticchetta. Meglio non bussare.'
      : 'Sulla porta un cartello: «Torno subito. Non toccate niente che si muove».'
  );
};
PROMPT.carroIng = 'Bussa';
// il camino fuma, l'antenna sfrigola, l'oblò si accende la sera
Ext.on('drawWorldExtras', m => {
  if (m.id !== 'main') return;
  const o = m.objs.find(q => q.kind === 'carroIng');
  if (!o) return;
  const X = o.dx,
    Y = o.dy;
  for (let i = 0; i < 5; i++) {
    const u = (G.t * 0.35 + i / 5) % 1;
    ctx.globalAlpha = (1 - u) * 0.7;
    ctx.fillStyle = i % 2 ? '#c8c4cc' : '#9a96a0';
    const r = 1.5 + u * 4;
    ctx.beginPath();
    ctx.arc(X + 7 + Math.sin(u * 6 + i) * 3 + u * 6, Y - u * 26, r, 0, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (Math.floor(G.t * 7) % 9 === 0) {
    ctx.fillStyle = '#c8e8f8';
    ctx.fillRect(X + 53, Y - 2, 1, 2);
    ctx.fillRect(X + 55, Y - 1, 1, 1);
  }
});

// ---------- l'arrivo ----------
// il primo automatismo della serra: il giorno dopo arriva (anche per chi li aveva già comprati prima)
Ext.on('automatismo', () => {
  const st = G.st;
  if (!isFree(st) || G.visit) return;
  const I = (st.free.ing = st.free.ing || {});
  if (I.arriva) return;
  I.arriva = st.day + 1;
  setTimeout(
    () =>
      UI.toast(
        'Da lontano, oltre il ponte, un fischio di vapore. Qualcuno ha sentito parlare della tua serra.'
      ),
    1800
  );
});
Ext.on('freeMorning', st => {
  if (!st || !isFree(st) || G.visit) return;
  const I = (st.free.ing = st.free.ing || {});
  if (!I.arriva && Object.values(st.free.built).some(b => b && b.id === 'serra' && b.auto)) I.arriva = st.day;
  if (I.arriva && st.day >= I.arriva && !I.qui) {
    const m = G.maps.main && G.maps.main.id === 'main' ? G.maps.main : null,
      p = m && carroPosto(m, st);
    if (!p) return; // nessun posto oggi: riprova domani
    I.qui = p;
    I.day = st.day;
    G.ingArrivo = true;
  }
});
// appena hai di nuovo i comandi: il carro compare, e la scheda dell'arrivo
Ext.on('mpTick', () => {
  if (!G.ingArrivo || G.mode !== 'game' || G.cut || UI.busy()) return;
  G.ingArrivo = false;
  const id = G.map && G.map.id;
  rebuildMaps();
  if (id && G.maps[id]) G.map = G.maps[id];
  snapNPCs();
  UI.card(
    'Un arrivo rumoroso',
    ING_N,
    'Stanotte un carro a vapore è salito dal ponte, sbuffando e ticchettando, e si è fermato accanto alla piazza. Sul cilindro di chi lo guida, un passerotto d’ottone si gira a guardarti.',
    false,
    true,
    1400
  );
  NET.save(G.st);
});

// ---------- la giornata ----------
SCHED[ING] = function (st) {
  if (!isFree(st)) return null;
  const I = ingQui(st);
  if (!I) return null;
  const t = st.time,
    [px, py] = carroPorta(I);
  if (t >= 7 * 60 && t < 13 * 60) return at(px, py, 0, 'idle', 1);
  if (t >= 13 * 60 && t < 14 * 60) return at(45, 20, 0, 'idle', 2); // in piazza, a guardare il cielo
  if (t >= 14 * 60 && t < 19 * 60) return at(px, py, 0, 'idle', 1);
  if (t >= 19 * 60 && t < 21 * 60) return at(42, 22, 3, 'chat', 1);
  return null;
};
Ext.on('portaDiCasa', id => {
  if (id !== ING) return null;
  const I = isFree() && ingSt();
  // senza il carro (nella storia, o prima che arrivi) se ne va oltre il ponte, come chi non abita qui
  return I && I.qui ? carroPorta(I) : [44, 46];
});
// il passerotto meccanico sul cilindro: saltella, gira la testa, ogni tanto apre le ali
Ext.on('drawWorldExtras', m => {
  const n = G.npcs && G.npcs.find(x => x.id === ING);
  if (!n || n.hidden || n.map !== m.id || !FREEIMG.passerotto) return;
  const ali = Math.floor(G.t * 2.5 + 0.5) % 7 === 0 ? 1 : 0,
    salto = Math.floor(G.t * 3) % 11 === 0 ? -1 : 0,
    img = FREEIMG.passerotto[ali],
    X = Math.round(n.x - 5),
    Y = Math.round(n.y - 32 + salto);
  if (n.dir === 2) {
    ctx.save();
    ctx.translate(X + 11, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, Y);
    ctx.restore();
  } else ctx.drawImage(img, X, Y);
});

// ---------- le parole ----------
const ING_FRASI = [
  'Le macchine non hanno paura del buio. È per questo che mi piacciono.',
  'Il vapore è un fantasma che ha accettato di lavorare. Bisogna trattarlo con rispetto.',
  'Ottone, il passerotto, non canta: ticchetta. Ha più orecchio di molti cantanti.',
  'Una chiave inglese e un po’ di pazienza: è tutto quello che serve per cambiare il mondo. O almeno un campo.',
  'In città mi chiamavano matto. Qui nessuno mi chiama. È un miglioramento.',
  'Ho sentito i tuoi irrigatori della serra. Rudimentali. Deliziosi.',
  'Di notte, quando passano le Ombre, il mio carro ronza più forte. Credo che non piaccia loro.',
  'Un ingranaggio da solo non fa niente. Due ingranaggi fanno un orologio. Tre, una discussione.'
];
const ING_SPIEGA = [
  'Allora, collega: prendi la <b>chiave inglese</b> in mano. Vedrai dei puntini fra le zolle: sono gli <b>incroci</b>.',
  'Gli <b>irrigatori interrati</b> vanno sugli incroci, sotto terra: non rubano posto a nessuna pianta. Alle 7 spuntano, girano e bagnano le zolle intorno, poi rientrano.',
  'Il <b>braccio raccoglitore</b> va anche lui su un incrocio. Montato, toccalo di nuovo con la chiave e <b>collegalo a una cassa</b>: dalle 8 raccoglie e spedisce tutto lì, lungo il filo di rame.',
  'Con la chiave in mano vedi le zolle che ogni congegno copre e i fili. Se cambi idea, lo smonti e torna nello zaino. Niente si rompe. Quasi niente.'
];
FREE_ASK[ING] = async n => {
  const st = G.st,
    I = ingSt(st),
    h = hearts(ING);
  if (!I.conosciuto) {
    I.conosciuto = 1;
    st.flags.met[ING] = 1;
    await say(
      ING,
      'Ah! Tu sei quell{o|a} della serra. Quella con gli spruzzini che escono dalla terra. Li ho sentiti dal ponte.'
    );
    await say(
      ING,
      'Mi chiamano l’Ingegnere. Il nome vero non lo pronuncerebbe nessuno, e io ho smesso di provarci.'
    );
    await say(
      ING,
      'Costruisco congegni. Irrigatori che dormono sotto terra, braccia che raccolgono da sole. Ti interessano? Ma certo che ti interessano.'
    );
    NET.save(st);
  }
  const c = await ask(ING, ING_FRASI[(st.day + h) % ING_FRASI.length], [
    'Chiacchiera',
    'La bottega',
    'Come si montano?',
    'Niente'
  ]);
  if (c === 0) {
    await say(
      ING,
      h >= 6
        ? 'Sai che sei l’unica persona qui che non mi guarda le mani come se avessi in tasca un fulmine? Grazie, collega.'
        : h >= 3
          ? 'La Valle fa rumori strani, di notte. Li sto registrando. Su un cilindro di cera. Per scienza.'
          : 'Sono appena arrivato. Il carro deve ancora smettere di fischiare.'
    );
    return Chiacchiera.parla(n);
  }
  if (c === 1) {
    ingBottega();
    return true;
  }
  if (c === 2) {
    for (const t of ING_SPIEGA) await say(ING, t.replace(/<\/?b>/g, ''));
    return true;
  }
  return false;
};
function ingBottega() {
  const st = G.st,
    disc = hearts(ING) >= 5 ? 0.85 : 1,
    pr = p => Math.round(p * disc);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Il carro dell’Ingegnere</h2><div class="staz staz-incudine"><i></i><i></i><i></i></div><p class="small">${disc < 1 ? 'Prezzo da collega (−15%). ' : ''}— Hai <b>${CZ(st.money)}</b></p>` +
      ING_SHOP.map(
        ([id, p]) =>
          `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}${id === 'chiave' && countItem('chiave') ? ' <span class="small">(ce l’hai)</span>' : ''}<br><span class="small">${ITEMS[id].d}</span></span><b class="price">${CZ(pr(p))}</b><button class="btn" data-b="${id}" ${st.money >= pr(p) ? '' : 'disabled'}>×1</button></div>`
      ).join('')
  );
  const box = $('#mbox');
  box.querySelectorAll('canvas[data-i]').forEach(c => {
    const ic = ICON[c.dataset.i];
    if (ic) c.getContext('2d').drawImage(ic, 0, 0);
  });
  box.querySelectorAll('[data-b]').forEach(
    b =>
      (b.onclick = () => {
        const [id, p] = ING_SHOP.find(x => x[0] === b.dataset.b);
        if (st.money < pr(p) || !addItem(id, 1)) return;
        st.money -= pr(p);
        AU.play('coin');
        UI.hud();
        if (id === 'chiave' && !st.flags.tutChiave) {
          st.flags.tutChiave = 1;
          setTimeout(
            () =>
              UI.toast(
                'Prendi la chiave in mano nei tuoi campi: tra le zolle compaiono gli incroci dove montare i congegni.'
              ),
            400
          );
        }
        UI._mclose = null;
        ingBottega();
      })
  );
}

// ---------- i congegni montati ----------
const autoSt = st => ((st || G.st).free.auto = (st || G.st).free.auto || {});
// le zolle coperte da un congegno sull'incrocio (cx, cy)
function congZolle(cx, cy, t) {
  const r = CONGEGNI[t].r,
    L = [];
  for (let y = cy - r; y < cy + r; y++) for (let x = cx - r; x < cx + r; x++) L.push([x, y]);
  return L;
}
const conChiave = () => {
  const it = selItem();
  return !!(it && it.id === 'chiave' && G.map && G.map.id === 'main' && isFree() && G.mode === 'game');
};
// l'incrocio che hai davanti: il più vicino al punto dove guardi
function incrocioMira() {
  const p = G.player,
    [dx, dy] = DIRV[p.dir],
    ax = p.x + dx * 12,
    ay = p.y - 4 + dy * 10;
  return [Math.round(ax / 16), Math.round(ay / 16)];
}
// si può montare qui? le quattro zolle intorno all'incrocio devono essere tue
function incrocioTuo(cx, cy) {
  for (const [x, y] of [
    [cx - 1, cy - 1],
    [cx, cy - 1],
    [cx - 1, cy],
    [cx, cy]
  ])
    if (!ownedAt(x, y) || G.maps.main.get(x, y) === 3) return false;
  return true;
}
// le casse dei tuoi campi (non quella della serra), dalla più vicina
function casseVicine(cx, cy) {
  const st = G.st;
  return Object.entries(st.free.built)
    .filter(([k, b]) => b && b.id === 'cassa' && !chiaveSerra(k))
    .map(([k]) => {
      const [x, y] = k.split(',').map(Number);
      return { k, d: Math.hypot(x + 0.5 - cx, y + 0.5 - cy) };
    })
    .filter(c => c.d <= 16)
    .sort((a, b) => a.d - b.d);
}

// ---------- la chiave inglese in mano ----------
async function chiaveAzione() {
  const st = G.st,
    [cx, cy] = incrocioMira(),
    k = cx + ',' + cy,
    A = autoSt(st),
    c = A[k];
  AU.play('chiave');
  G.shake = Math.max(G.shake, 0.3);
  if (c) {
    const C = CONGEGNI[c.t],
      scelte = ['Smonta'];
    if (c.t === 'braccio') scelte.push(c.cassa ? 'Collega a un’altra cassa' : 'Collega a una cassa');
    scelte.push('Lascia stare');
    const s = await ask(
      null,
      `${C.n}${c.t === 'braccio' ? (c.cassa && st.free.built[c.cassa] ? ': collegato a una cassa.' : ': non è collegato a nessuna cassa.') : '.'}`,
      scelte
    );
    if (s === 0) {
      if (!addItem(C.item, 1)) return;
      delete A[k];
      AU.play('chiave');
      UI.toast(`${C.n} smontato: è tornato nello zaino.`);
      NET.save(st);
    } else if (s === 1 && c.t === 'braccio') {
      const L = casseVicine(cx, cy);
      if (!L.length)
        return UI.toast('Nessuna cassa qui intorno (entro 16 caselle). Costruiscine una al banco da lavoro.');
      const s2 = await ask(
        null,
        'A quale cassa lo colleghi?',
        L.slice(0, 5)
          .map(x => `Cassa a ${Math.round(x.d)} caselle${x.k === c.cassa ? ' (quella di adesso)' : ''}`)
          .concat('Lascia stare')
      );
      if (s2 >= 0 && s2 < Math.min(5, L.length)) {
        c.cassa = L[s2].k;
        AU.play('ok');
        UI.toast('Collegato: il filo di rame corre fino alla cassa. Dalle 8 ci spedisce il raccolto.');
        NET.save(st);
      }
    }
    return;
  }
  if (!incrocioTuo(cx, cy))
    return UI.toast('Qui la terra non è tua: i congegni si montano tra le zolle dei tuoi campi.');
  const miei = Object.entries(CONGEGNI).filter(([, C]) => countItem(C.item) > 0);
  if (!miei.length)
    return UI.toast('Non hai congegni da montare: l’Ingegnere li vende al suo carro, vicino alla piazza.');
  const s = await ask(
    null,
    'Cosa monti su questo incrocio?',
    miei.map(([, C]) => `${C.n} (${countItem(C.item)})`).concat('Niente')
  );
  if (s < 0 || s >= miei.length) return;
  const [t, C] = miei[s];
  removeItem(C.item, 1);
  A[k] = { t };
  if (t === 'braccio') {
    const L = casseVicine(cx, cy);
    if (L.length) A[k].cassa = L[0].k;
  }
  AU.play('chiave');
  G.shake = Math.max(G.shake, 0.8);
  if (typeof GESTO !== 'undefined') GESTO.terra(cx * 16, cy * 16 + 2);
  UI.toast(
    t === 'braccio'
      ? A[k].cassa
        ? 'Braccio montato e collegato alla cassa più vicina. Dalle 8 raccoglie.'
        : 'Braccio montato. Costruisci una cassa qui vicino e collegalo con la chiave.'
      : `${C.n} montato sotto terra. Alle 7 bagna le zolle intorno.`
  );
  // se l'ora è già passata, lavora subito: così lo vedi
  if (t !== 'braccio' && st.time >= 7 * 60) congIrriga([k]);
  if (t === 'braccio' && A[k].cassa && st.time >= 8 * 60 && st.time < 22 * 60) congRaccogli([k]);
  NET.save(st);
}
Ext.avvolgi('doAction', function (prossimo, ...a) {
  if (!conChiave() || G.cut || UI.busy()) return prossimo(...a);
  // una persona proprio davanti: ci parli anche con la chiave in mano
  const sc = aimScelta();
  if (sc && sc.k === 'npc') return prossimo(...a);
  if (G.visit) return UI.toast('La chiave funziona solo nei tuoi campi.');
  if (G.chiaveOcc) return;
  G.chiaveOcc = true;
  toolSwing();
  chiaveAzione()
    .catch(e => segnala(e, 'chiave'))
    .finally(() => (G.chiaveOcc = false));
});
Ext.avvolgi('promptInfo', function (prossimo, ...a) {
  if (!conChiave() || G.cut || UI.busy() || G.visit) return prossimo(...a);
  const [cx, cy] = incrocioMira(),
    c = autoSt()[cx + ',' + cy];
  return { x: cx * 16, y: cy * 16 - 14, t: c ? 'Congegno' : incrocioTuo(cx, cy) ? 'Monta' : 'Non è tua' };
});

// ---------- l'irrigazione delle 7 ----------
const ANIM = { irr: {}, bracci: {}, capsule: [] }; // quello che si vede (non si salva)
const CIRR_SU = 0.5,
  CIRR_SPRUZZA = 3.6,
  CIRR_GIU = 0.5;
const vicinoAMe = (cx, cy) =>
  G.map &&
  G.map.id === 'main' &&
  G.mode === 'game' &&
  Math.hypot(cx * 16 - G.player.x, cy * 16 - G.player.y) < 260;
function congIrriga(chiavi) {
  const st = G.st,
    A = autoSt(st);
  for (const k of chiavi) {
    const c = A[k];
    if (!c || !/^irr/.test(c.t)) continue;
    const [cx, cy] = k.split(',').map(Number),
      zolle = congZolle(cx, cy, c.t).filter(([x, y]) => st.farm[x + ',' + y]);
    if (vicinoAMe(cx, cy)) {
      ANIM.irr[k] = G.t;
      AU.play('ugelli');
      allImpatto(() => AU.play('spruzzo'), CIRR_SU);
      for (const [x, y] of zolle) {
        const d = Math.hypot(x * 16 + 8 - cx * 16, y * 16 + 8 - cy * 16);
        allImpatto(
          () => {
            const f = st.farm[x + ',' + y];
            if (f) f.w = true;
            piantaSussulta(x + ',' + y, 'acqua');
          },
          CIRR_SU + 0.2 + d / 45
        );
      }
    } else for (const [x, y] of zolle) st.farm[x + ',' + y].w = true;
  }
}
// ---------- il raccolto delle 8 ----------
const maturaQui = f => f && f.c && !f.c.dead && cropStage(f.c) === 3;
// come harvest (farm.js), ma nella cassa collegata
function congRaccogliUna(x, y, cassa) {
  const st = G.st,
    f = st.farm[x + ',' + y],
    c = f.c,
    t = c.t,
    cr = CROPS[t];
  let n = cr.y[0] + Math.floor(Math.random() * (cr.y[1] - cr.y[0] + 1));
  if (Math.random() < 0.08 + (f.f ? 0.42 : 0) + (c.bad ? 0 : 0.15) + (skLv('agri') >= 4 ? 0.15 : 0)) n++;
  const prova = cassa.inv.map(s => s && { id: s.id, n: s.n });
  if (zInfila(prova, { id: t, n })) return null;
  zInfila(cassa.inv, { id: t, n });
  if (cr.re) {
    c.a = cr.days - cr.re;
    c.dry = 0;
  } else {
    f.c = null;
    f.f = 0;
  }
  addXP('agri', 2 + cr.days);
  st.flags.harvested = (st.flags.harvested || 0) + 1;
  Ext.run('fatto', 'raccogli', 1);
  return { id: t, n };
}
function congRaccogli(chiavi) {
  const st = G.st,
    A = autoSt(st);
  for (const k of chiavi) {
    const c = A[k],
      cassa = c && c.cassa && st.free.built[c.cassa];
    if (!c || c.t !== 'braccio' || !cassa || cassa.id !== 'cassa') continue;
    if (!Array.isArray(cassa.inv)) cassa.inv = cassaVuota();
    const [cx, cy] = k.split(',').map(Number),
      mature = congZolle(cx, cy, 'braccio').filter(([x, y]) => maturaQui(st.farm[x + ',' + y]));
    if (!mature.length) continue;
    if (vicinoAMe(cx, cy)) {
      // si vede: il braccio le prende una alla volta (vedi bracciTick); la logica parte alla presa
      ANIM.bracci[k] = Object.assign(ANIM.bracci[k] || braccioNuovo(), {
        coda: mature.slice(),
        fase: 'gira',
        t: 0
      });
      AU.play('carrucola');
    } else for (const [x, y] of mature) congRaccogliUna(x, y, cassa);
  }
}
// l'orologio: alle 7 tutti gli irrigatori, dalle 8 tutti i bracci (una volta al giorno)
Ext.on('mpTick', dt => {
  try {
    const st = G.st;
    if (!st || !isFree(st) || G.visit || G.mode !== 'game' || !st.free.auto) return;
    const D = (st.free.autoDay = st.free.autoDay || {}),
      A = autoSt(st);
    if (st.time >= 7 * 60 && D.irr !== st.day) {
      D.irr = st.day;
      congIrriga(Object.keys(A).filter(k => /^irr/.test(A[k].t)));
    }
    if (st.time >= 8 * 60 && st.time < 22 * 60 && D.braccio !== st.day) {
      D.braccio = st.day;
      congRaccogli(Object.keys(A).filter(k => A[k].t === 'braccio'));
    }
    bracciTick(Math.min(0.05, dt));
    capsuleTick(Math.min(0.05, dt));
  } catch (e) {
    segnala(e, 'congegni');
  }
});

// ---------- il braccio che lavora (solo quando lo vedi) ----------
// Una gru vista dall'alto: in cima al palo la torretta d'ottone gira (ang), il braccio orizzontale telescopico si
// allunga (len, in pianta) fino sopra la pianta, dal gomito il cavo cala le pinze (h: quanto sono alte da terra),
// le chiude, risale, il braccio rientra sopra il palo e il raccolto cade nell'imbuto: da lì parte la capsula.
const BR_ALTO = 18,
  BR_SU = 15,
  BR_GIU = 6,
  BR_RIPOSO = 5;
function braccioNuovo() {
  return { ang: -2.4, len: BR_RIPOSO, h: BR_SU, presa: null, fase: 'riposo', t: 0, coda: [] };
}
function bracciTick(dt) {
  const st = G.st,
    A = autoSt(st);
  for (const k in ANIM.bracci) {
    const B = ANIM.bracci[k],
      c = A[k];
    if (!c || !(G.map && G.map.id === 'main')) {
      // sei uscito o l'hai smontato: quello che resta si raccoglie lo stesso, in un colpo
      const cassa = c && c.cassa && st.free.built[c.cassa];
      if (cassa)
        for (const [x, y] of B.coda) if (maturaQui(st.farm[x + ',' + y])) congRaccogliUna(x, y, cassa);
      delete ANIM.bracci[k];
      continue;
    }
    const [cx, cy] = k.split(',').map(Number),
      cassa = st.free.built[c.cassa],
      verso = (v, a, vel) => v + Math.sign(a - v) * Math.min(Math.abs(a - v), vel * dt);
    B.t += dt;
    if (B.fase === 'gira') {
      const p = B.coda[0];
      if (!p) {
        B.fase = 'riposo';
        continue;
      }
      const tx = p[0] * 16 + 8 - cx * 16,
        ty = p[1] * 16 + 8 - cy * 16,
        voglioA = Math.atan2(ty, tx),
        voglioL = Math.hypot(tx, ty);
      let da = voglioA - B.ang;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      B.ang += Math.sign(da) * Math.min(Math.abs(da), dt * 3.5);
      B.len = verso(B.len, voglioL, 55);
      if (Math.abs(da) < 0.02 && Math.abs(voglioL - B.len) < 0.5) {
        B.fase = 'cala';
        B.t = 0;
      }
    } else if (B.fase === 'cala') {
      B.h = verso(B.h, BR_GIU, 40);
      if (B.h <= BR_GIU) {
        B.fase = 'prende';
        B.t = 0;
        const [x, y] = B.coda.shift(),
          r = cassa && maturaQui(st.farm[x + ',' + y]) ? congRaccogliUna(x, y, cassa) : null;
        if (r) {
          B.presa = r;
          piantaSussulta(x + ',' + y, 'raccolto');
          AU.play('pick');
          GESTO.erba(x * 16 + 8, y * 16 + 10, 5);
        } else if (cassa && maturaQui(st.farm[x + ',' + y]) && !B.detto) {
          B.detto = 1;
          UI.toast('La cassa collegata al braccio è piena.', 'bad');
          B.coda = [];
        }
      }
    } else if (B.fase === 'prende') {
      if (B.t > 0.22) {
        B.fase = 'sale';
        B.t = 0;
      }
    } else if (B.fase === 'sale') {
      B.h = verso(B.h, BR_SU, 40);
      if (B.h >= BR_SU) {
        B.fase = B.presa ? 'ritira' : 'gira';
        B.t = 0;
      }
    } else if (B.fase === 'ritira') {
      B.len = verso(B.len, 0, 70);
      if (B.len <= 0) {
        // nell'imbuto, e via lungo il filo
        const [ax, ay] = c.cassa.split(',').map(Number);
        ANIM.capsule.push({
          id: B.presa.id,
          x0: cx * 16,
          y0: cy * 16,
          x1: ax * 16 + 8,
          y1: ay * 16 + 8,
          t: 0
        });
        AU.play('posta');
        B.presa = null;
        B.fase = B.coda.length ? 'gira' : 'torna';
      }
    } else if (B.fase === 'torna') {
      B.len = verso(B.len, BR_RIPOSO, 30);
      if (B.len >= BR_RIPOSO) B.fase = 'riposo';
    }
  }
}
function capsuleTick(dt) {
  for (let i = ANIM.capsule.length - 1; i >= 0; i--) {
    const C = ANIM.capsule[i];
    C.t += dt / Math.max(0.35, Math.hypot(C.x1 - C.x0, C.y1 - C.y0) / 140);
    if (C.t >= 1) {
      ANIM.capsule.splice(i, 1);
      AU.play('pop');
      G.parts.push({ k: 'spark', x: C.x1, y: C.y1 - 8, vx: 0, vy: -12, t: 0, life: 0.5, c: '#ffd070' });
    }
  }
}

// ---------- il disegno ----------
// i tappi d'ottone degli irrigatori a filo della terra (sotto le piante); con la chiave in mano, gli incroci
Ext.on('sopraTerreno', m => {
  if (m.id !== 'main' || !isFree() || !G.st.free.auto) return;
  const A = G.st.free.auto;
  for (const k in A) {
    if (!/^irr/.test(A[k].t)) continue;
    const [cx, cy] = k.split(',').map(Number),
      X = cx * 16,
      Y = cy * 16;
    ctx.fillStyle = '#07050a';
    ctx.fillRect(X - 2, Y - 1, 5, 3);
    ctx.fillStyle = A[k].t === 'irr2' ? '#d8aa48' : '#8a6a44';
    ctx.fillRect(X - 1, Y, 3, 1);
    ctx.fillStyle = '#ffd070';
    ctx.fillRect(X, Y, 1, 1);
  }
});
// le teste che salgono e i pali dei bracci stanno tra le piante, in profondità
Ext.on('listaMondo', (list, m) => {
  if (m.id !== 'main' || !isFree() || !G.st.free.auto) return;
  const A = G.st.free.auto;
  for (const k in A) {
    const [cx, cy] = k.split(',').map(Number),
      c = A[k];
    if (/^irr/.test(c.t)) {
      const t0 = ANIM.irr[k];
      if (t0 === undefined) continue;
      const t = G.t - t0;
      if (t > CIRR_SU + CIRR_SPRUZZA + CIRR_GIU) {
        delete ANIM.irr[k];
        continue;
      }
      const h = Math.round(
        t < CIRR_SU
          ? (t / CIRR_SU) * 7
          : t < CIRR_SU + CIRR_SPRUZZA
            ? 7
            : 7 * (1 - (t - CIRR_SU - CIRR_SPRUZZA) / CIRR_GIU)
      );
      list.push({ sy: cy * 16 + 1, draw: () => disegnaTesta(cx * 16, cy * 16, h, c.t === 'irr2') });
      if (t > CIRR_SU && t < CIRR_SU + CIRR_SPRUZZA) spruzza(cx * 16, cy * 16 - h, c.t === 'irr2');
    } else list.push({ sy: cy * 16 + 2, draw: () => disegnaPalo(k, cx * 16, cy * 16) });
  }
});
function disegnaTesta(X, Y, h, grande) {
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 1, Y - h - 1, 3, h + 1);
  ctx.fillStyle = '#74726e';
  ctx.fillRect(X, Y - h, 1, h);
  const gira = Math.floor(G.t * 12) % 2,
    w = grande ? 7 : 5;
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - (w >> 1) - 1, Y - h - 3, w + 2, 3);
  ctx.fillStyle = gira ? '#d8aa48' : '#c8862e';
  ctx.fillRect(X - (w >> 1), Y - h - 2, w, 1);
  ctx.fillStyle = '#ffd070';
  ctx.fillRect(X + (gira ? 1 : -1), Y - h - 2, 1, 1);
}
function spruzza(X, Y, grande) {
  const n = grande ? 4 : 2,
    R = grande ? [16, 34] : [8, 18];
  for (let j = 0; j < n; j++) {
    const a = G.t * 5 + (j * Math.PI * 2) / n + Math.random() * 0.5,
      r = caso(R[0], R[1]),
      T = caso(0.28, 0.38),
      g = 260,
      z0 = 9;
    pezzo({
      k: 'goccia',
      x: X,
      y: Y + 7,
      z: z0,
      g,
      vx: (Math.cos(a) * r) / T,
      vy: (Math.sin(a) * r * 0.6) / T,
      vz: (-z0 + 0.5 * g * T * T) / T,
      col: Math.random() < 0.6 ? '#a8d8f8' : '#d8f0ff',
      w: 1,
      h: 1,
      life: T + 0.03,
      rimbalzi: 0
    });
  }
  if (Math.random() < 0.12) polvere(X, Y + 7, 1, 'rgba(200,230,245,.2)', grande ? 9 : 6);
}
function disegnaPalo(k, X, Y) {
  // la base d'ottone avvitata a terra, il palo di ferro, l'imbuto dove cade il raccolto
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 3, Y - 1, 7, 3);
  ctx.fillRect(X - 1, Y - BR_ALTO, 3, BR_ALTO);
  ctx.fillStyle = '#c8862e';
  ctx.fillRect(X - 2, Y, 5, 1);
  ctx.fillStyle = '#55545a';
  ctx.fillRect(X, Y - BR_ALTO, 1, BR_ALTO);
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 3, Y - 9, 7, 4);
  ctx.fillStyle = '#8a5a20';
  ctx.fillRect(X - 2, Y - 8, 5, 2);
  ctx.fillStyle = '#c8862e';
  ctx.fillRect(X - 2, Y - 8, 5, 1);
  const B = ANIM.bracci[k] || braccioNuovo(),
    // la spalla in cima al palo; il gomito sopra il punto (in pianta) dove arriva il braccio, alla stessa altezza
    SX = X + 0.5,
    SY = Y - BR_ALTO,
    rx = Math.cos(B.ang) * B.len,
    ry = Math.sin(B.ang) * B.len,
    EX = SX + rx,
    EY = SY + ry,
    PX = Math.round(EX),
    PY = Math.round(Y + ry - B.h); // le pinze, sotto il gomito
  // il braccio telescopico: la parte grossa di ferro, quella fine che esce, le fasce d'ottone
  const seg = (x0, y0, x1, y1, w, col) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };
  const mx = SX + rx * 0.55,
    my = SY + ry * 0.55;
  seg(SX, SY, EX, EY, 3, '#07050a');
  seg(SX, SY, mx, my, 2, '#55545a');
  seg(mx, my, EX, EY, 1, '#9a968a');
  ctx.fillStyle = '#d8aa48';
  ctx.fillRect(Math.round(mx) - 1, Math.round(my) - 1, 2, 2);
  // il cavo che cala dal gomito, e il gomito
  ctx.fillStyle = '#a88a5e';
  ctx.fillRect(PX, Math.round(EY) + 1, 1, Math.max(0, PY - Math.round(EY) - 2));
  ctx.fillStyle = '#07050a';
  ctx.fillRect(PX - 2, Math.round(EY) - 2, 5, 4);
  ctx.fillStyle = '#c8862e';
  ctx.fillRect(PX - 1, Math.round(EY) - 1, 3, 2);
  // la torretta che gira sulla spalla
  const g = Math.floor(B.ang * 3) % 2;
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 3, SY - 3, 7, 5);
  ctx.fillStyle = '#c8862e';
  ctx.fillRect(X - 2, SY - 2, 5, 3);
  ctx.fillStyle = '#ffd070';
  ctx.fillRect(X - 2 + (g ? 3 : 0), SY - 2, 2, 1);
  // le pinze, e quello che stringono
  const ap = B.fase === 'cala' || (B.fase === 'gira' && !B.presa) ? 2 : 1;
  if (B.presa && ICON[B.presa.id]) ctx.drawImage(ICON[B.presa.id], PX - 4, PY - 1, 9, 9);
  ctx.fillStyle = '#07050a';
  ctx.fillRect(PX - 3, PY - 2, 7, 2);
  ctx.fillRect(PX - ap - 2, PY - 1, 2, 5);
  ctx.fillRect(PX + ap + 1, PY - 1, 2, 5);
  ctx.fillStyle = '#9a968a';
  ctx.fillRect(PX - 2, PY - 2, 5, 1);
  ctx.fillRect(PX - ap - 1, PY, 1, 3);
  ctx.fillRect(PX + ap + 1, PY, 1, 3);
}
// sopra a tutto: le capsule che corrono sui fili; con la chiave in mano, incroci, zolle coperte e fili
Ext.on('drawWorldExtras', m => {
  if (m.id !== 'main' || !isFree()) return;
  const st = G.st,
    A = st.free.auto || {},
    chiave = conChiave() && !G.visit;
  const filo = (k, c, forte) => {
    const C = c.cassa && st.free.built[c.cassa];
    if (!C) return;
    const [cx, cy] = k.split(',').map(Number),
      [ax, ay] = c.cassa.split(',').map(Number);
    ctx.strokeStyle = forte ? 'rgba(216,140,60,.9)' : 'rgba(200,120,50,.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(cx * 16 + 0.5, cy * 16 - 6);
    ctx.lineTo(ax * 16 + 8.5, ay * 16 + 6);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  // le capsule: si vede il filo mentre ci corrono sopra
  for (const C of ANIM.capsule) {
    const e = C.t * C.t * (3 - 2 * C.t),
      x = C.x0 + (C.x1 - C.x0) * e,
      y = C.y0 - 6 + (C.y1 - 2 - (C.y0 - 6)) * e;
    ctx.strokeStyle = 'rgba(216,140,60,.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(C.x0 + 0.5, C.y0 - 6);
    ctx.lineTo(C.x1 + 0.5, C.y1 - 2);
    ctx.stroke();
    ctx.fillStyle = '#07050a';
    ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 7, 6);
    ctx.fillStyle = '#c8862e';
    ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 4);
    ctx.fillStyle = '#ffd070';
    ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 2, 1);
  }
  if (!chiave) return;
  const p = G.player,
    [mx, my] = incrocioMira(),
    pcx = Math.round(p.x / 16),
    pcy = Math.round(p.y / 16),
    pul = 0.6 + 0.4 * Math.sin(G.t * 6);
  // gli incroci tuoi intorno a te
  for (let cy = pcy - 5; cy <= pcy + 5; cy++)
    for (let cx = pcx - 6; cx <= pcx + 6; cx++) {
      if (A[cx + ',' + cy] || !incrocioTuo(cx, cy)) continue;
      // una crocetta: più chiara vicino a te, svanisce lontano
      const vic = 1 - Math.min(1, Math.hypot(cx - pcx, cy - pcy) / 6.5);
      ctx.fillStyle = `rgba(7,5,10,${(0.35 * vic).toFixed(2)})`;
      ctx.fillRect(cx * 16 - 2, cy * 16, 5, 1);
      ctx.fillRect(cx * 16, cy * 16 - 2, 1, 5);
      ctx.fillStyle = `rgba(240,214,150,${(0.8 * vic).toFixed(2)})`;
      ctx.fillRect(cx * 16 - 1, cy * 16, 3, 1);
      ctx.fillRect(cx * 16, cy * 16 - 1, 1, 3);
    }
  // ogni congegno: le zolle che copre (tenui), il filo; quello che miri più forte
  for (const k in A) {
    const [cx, cy] = k.split(',').map(Number),
      c = A[k],
      mirato = cx === mx && cy === my,
      r = CONGEGNI[c.t].r;
    ctx.strokeStyle =
      c.t === 'braccio'
        ? `rgba(216,170,72,${mirato ? 0.9 : 0.35})`
        : `rgba(120,184,232,${mirato ? 0.9 : 0.35})`;
    ctx.lineWidth = 1;
    ctx.strokeRect((cx - r) * 16 + 0.5, (cy - r) * 16 + 0.5, r * 32 - 1, r * 32 - 1);
    if (c.t === 'braccio') filo(k, c, mirato);
    if (c.t === 'braccio' && !(c.cassa && st.free.built[c.cassa])) {
      ctx.fillStyle = '#ffb060';
      ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', cx * 16 + 6, cy * 16 - 22);
    }
  }
  // l'incrocio che miri: un anello d'oro che pulsa
  const tuo = incrocioTuo(mx, my);
  ctx.strokeStyle = tuo ? `rgba(255,208,112,${pul})` : `rgba(255,120,100,${pul})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(mx * 16 - 3.5, my * 16 - 3.5, 7, 7);
  ctx.fillStyle = tuo ? '#ffd070' : '#ff7860';
  ctx.fillRect(mx * 16, my * 16, 1, 1);
});

// ---------- i suoni ----------
Object.assign(SFX, {
  // la chiave: il cricchetto che scatta
  chiave: (a, t) => {
    for (let i = 0; i < 3; i++) a.noise(t + i * 0.05, 0.02, 0.12, 'bandpass', 3200 + i * 300, 8);
    a.osc('square', 880, t, 0.03, 0.03);
  },
  // la capsula che parte nel tubo: un risucchio
  posta: (a, t) => a.noise(t, 0.25, 0.08, 'bandpass', 600, 3, null, 0.02, 2400),
  // la capsula che arriva nella cassa
  pop: (a, t) => {
    a.osc('sine', 520, t, 0.08, 0.12, null, 0.002, 260);
    a.noise(t, 0.05, 0.06, 'highpass', 3000);
  }
});
