'use strict';
// ================= I MOBILI DELLA CASA =================
// Un set di mobili disegnati a mano (tools/pixel/arredi_abbozzo.py → js/arredi_mano.js), più grandi di quelli di
// prima: il letto grande, l'armadio, il comò, lo scrittoio, il divano, la tavola apparecchiata… Alcuni sono vivi:
// l'orologio a pendolo segna l'ora del gioco e batte i rintocchi, la sedia a dondolo dondola se la tocchi o ci passi
// accanto, l'arcolaio gira, il candelabro e la stufa hanno il fuoco vero, l'uccellino saltella nella gabbia, il pesce
// rosso nuota, il carillon suona e la ballerina gira.
// I mobili di legno si fanno al banco; quelli di stoffa, vetro e ottone li vende Agatha.
// Quando Brom amplia la casa, le stanze nuove non restano spoglie: finestre, applique accese e, nel salone, un
// secondo camino (arredaCasa, da build.js).

// fp: caselle occupate [larghezza, profondità] · luce: [dx, dy, raggio] dall'angolo in alto dello sprite
const ARREDI = {
  letto: {
    n: 'Letto grande',
    d: 'Di noce, con la trapunta a quadri cucita da qualcuno che non c’è più.',
    fp: [2, 2]
  },
  armadio: {
    n: 'Armadio intagliato',
    d: 'Due ante con le specchiature. Dentro, odore di lavanda e di naftalina.',
    fp: [2, 1]
  },
  como: {
    n: 'Comò',
    d: 'Tre cassetti, uno che si incastra sempre. Sopra, uno scrigno e una fotografia.',
    fp: [2, 1]
  },
  comodino: { n: 'Comodino', d: 'Con la candela accesa per la notte.', luce: [7, 1, 34] },
  scrittoio: { n: 'Scrittoio', d: 'Il libro aperto, i fogli, il calamaio e la penna d’oca.', fp: [2, 1] },
  poltrona: { n: 'Poltrona di velluto', d: 'Rossa, col capitonné. Ci si affonda.' },
  divano: { n: 'Divano', d: 'Velluto verde bottiglia, tre cuscini e uno ricamato.', fp: [3, 1] },
  tavolopranzo: {
    n: 'Tavola da pranzo',
    d: 'Lunga, con la tovaglia di lino: apparecchiata per quattro.',
    fp: [3, 1]
  },
  baule: { n: 'Baule', d: 'Fasciato di ferro. La chiave non si trova.', fp: [2, 1] },
  appendiabiti: { n: 'Appendiabiti', d: 'Col mantello scuro e il cappello a tesa larga.' },
  mensola: {
    n: 'Mensola coi barattoli',
    d: 'Conserve, spezie, un barattolo che nessuno apre.',
    fp: [2, 1],
    wall: 1
  },
  tappetone: {
    n: 'Tappeto intrecciato',
    d: 'Grande, ovale, fatto di stracci colorati.',
    fp: [3, 2],
    flat: 1
  },
  vasofiori: { n: 'Vaso di cardi', d: 'Cardi secchi, viola. Durano tutto l’inverno.' },
  pendolo: {
    n: 'Orologio a pendolo',
    d: 'Segna l’ora giusta e la batte. Di notte si sente da tutta la casa.'
  },
  dondolo: { n: 'Sedia a dondolo', d: 'Toccala e dondola. A volte dondola da sola.' },
  candelabro: { n: 'Candelabro', d: 'D’ottone, tre candele.', luce: [8, 2, 66] },
  stufa: {
    n: 'Stufa di ghisa',
    d: 'Il fuoco dietro il vetro, il tubo che sale. Scalda tutta la stanza.',
    luce: [10, 20, 74]
  },
  arcolaio: { n: 'Arcolaio', d: 'Toccalo e la ruota gira. Fila la lana, e i pensieri.', fp: [2, 1] },
  gabbia: { n: 'Gabbia con l’uccellino', d: 'Un lucherino giallo. Canta la mattina, dorme la notte.' },
  boccia: { n: 'Boccia del pesce rosso', d: 'Il pesce si chiama come vuoi tu. Non risponde comunque.' },
  carillon: { n: 'Carillon', d: 'Lo apri e suona. La ballerina gira, gira.' }
};
for (const [id, a] of Object.entries(ARREDI))
  ITEMS[id] = Object.assign(
    { n: a.n, t: 'arredo', d: a.d },
    a.fp ? { fp: a.fp } : {},
    a.wall ? { wall: 1 } : {},
    a.flat ? { flat: 1 } : {},
    a.luce ? { luce: a.luce } : {}
  );

// al banco: il legno; da Agatha: stoffa, vetro e ottone
CRAFTS.push(
  { id: 'letto', q: 1, c: { legna: 60, fibra: 30 }, cat: 'cas' },
  { id: 'armadio', q: 1, c: { legna: 50 }, cat: 'cas' },
  { id: 'como', q: 1, c: { legna: 35, lingotto: 1 }, cat: 'cas' },
  { id: 'comodino', q: 1, c: { legna: 12 }, cat: 'cas' },
  { id: 'scrittoio', q: 1, c: { legna: 30, lingotto: 1 }, cat: 'cas' },
  { id: 'tavolopranzo', q: 1, c: { legna: 45, fibra: 10 }, cat: 'cas' },
  { id: 'baule', q: 1, c: { legna: 25, ferro: 4 }, cat: 'cas' },
  { id: 'appendiabiti', q: 1, c: { legna: 10, fibra: 6 }, cat: 'cas' },
  { id: 'mensola', q: 1, c: { legna: 10, pietra: 4 }, cat: 'cas' },
  { id: 'dondolo', q: 1, c: { legna: 20, fibra: 8 }, cat: 'cas' },
  { id: 'arcolaio', q: 1, c: { legna: 25, fibra: 10 }, cat: 'cas' },
  { id: 'pendolo', q: 1, c: { legna: 30, lingotto: 2, quarzo: 1 }, cat: 'cas' },
  { id: 'stufa', q: 1, c: { lingotto: 4, pietra: 20 }, cat: 'cas' }
);
DECOR_SHOP.push(
  ['poltrona', 380],
  ['divano', 650],
  ['tappetone', 420],
  ['vasofiori', 120],
  ['candelabro', 260],
  ['gabbia', 300],
  ['boccia', 240],
  ['carillon', 520]
);

// ---------- i disegni ----------
Ext.on('arte', () => {
  const D = ARREDI_MANO;
  for (const k of Object.keys(D.sprite)) {
    const c = daGriglia(D, k);
    FREEIMG[k === 'applique' ? 'arr_applique' : k] = c;
    if (!ITEMS[k]) continue;
    // l'icona: lo stesso disegno, rimpicciolito quanto basta per stare nella casella
    const I = document.createElement('canvas');
    I.width = I.height = 32;
    const x = I.getContext('2d'),
      s = Math.min(1, 30 / Math.max(c.width, c.height));
    x.imageSmoothingEnabled = false;
    x.drawImage(
      c,
      Math.round(16 - (c.width * s) / 2),
      Math.round(16 - (c.height * s) / 2),
      c.width * s,
      c.height * s
    );
    ICON[k] = I;
  }
});

// ---------- vivi: lo stato di ogni mobile animato (non si salva) ----------
const ARR = {}; // fk → { tela, dondola, gira, canta, suona, … }
const arrStato = o =>
  (ARR[o.fk] = ARR[o.fk] || { dondola: 0, gira: 0, suona: -9, salto: 0, posa: 0, pesce: Math.random() * 6 });
const ARR_VIVI = new Set([
  'pendolo',
  'dondolo',
  'candelabro',
  'stufa',
  'arcolaio',
  'gabbia',
  'boccia',
  'carillon',
  'comodino'
]);
// una tela per mobile: lo sprite fermo più le parti che si muovono, ridisegnata a ogni fotogramma e messa al posto
// dell'immagine, così il mobile resta nel suo ordine di profondità (davanti o dietro al personaggio)
function arrTela(o, base) {
  const S = arrStato(o);
  if (!S.tela || S.tela.width !== base.width) {
    S.tela = document.createElement('canvas');
    S.tela.width = base.width;
    S.tela.height = base.height;
  }
  const x = S.tela.getContext('2d');
  x.clearRect(0, 0, base.width, base.height);
  x.imageSmoothingEnabled = false;
  return [x, S];
}
const px = (x, c, X, Y, w = 1, h = 1) => {
  x.fillStyle = c;
  x.fillRect(Math.round(X), Math.round(Y), w, h);
};
const notte = () => G.st.time >= 21 * 60 || G.st.time < 6 * 60;
// la fiamma di una candela: due o tre pixel che tremano
function fiammella(x, X, Y) {
  const f = Math.random();
  px(x, '#ff8a30', X, Y - 1, 2, 2);
  px(x, f < 0.5 ? '#ffd070' : '#fff0c0', X, Y - 2 - (f < 0.3 ? 1 : 0), 2, 1);
  if (f > 0.6) px(x, '#ffd070', X + (f > 0.8 ? 1 : 0), Y - 3, 1, 1);
}

const DISEGNA = {
  // le lancette segnano l'ora del gioco; il pendolo batte il secondo
  pendolo(x, S, b) {
    x.drawImage(b, 0, 0);
    const t = G.st.time,
      ang = (v, n) => (v / n) * Math.PI * 2 - Math.PI / 2,
      ora = ang((t / 60) % 12, 12),
      min = ang(t % 60, 60),
      lancetta = (a, l, c) => {
        for (let i = 0; i <= l; i += 0.5) px(x, c, 9 + Math.cos(a) * i - 0.5, 11 + Math.sin(a) * i - 0.5);
      };
    lancetta(min, 3.6, '#2a1e24');
    lancetta(ora, 2.4, '#07050a');
    const a = 0.2 * Math.sin(G.t * Math.PI),
      bx = 9 + Math.sin(a) * 15,
      by = 20 + Math.cos(a) * 15;
    for (let i = 1; i < 14; i++) px(x, '#c8862e', 9 + Math.sin(a) * i - 0.5, 20 + Math.cos(a) * i);
    x.fillStyle = '#d8aa48';
    x.beginPath();
    x.arc(bx, by, 2.2, 0, 7);
    x.fill();
    px(x, '#fff0c0', bx - 1, by - 1);
  },
  // dondola attorno ai pattini, sempre meno, finché si ferma
  dondolo(x, S, b) {
    const a = S.dondola * Math.sin(G.t * 3.2);
    x.save();
    x.translate(13, 28);
    x.rotate(a);
    x.drawImage(b, -13, -28);
    x.restore();
  },
  candelabro(x, S, b) {
    x.drawImage(b, 0, 0);
    for (const X of [1, 7, 13]) fiammella(x, X, 3);
  },
  comodino(x, S, b) {
    x.drawImage(b, 0, 0);
    fiammella(x, 6, 3);
  },
  // il fuoco dietro il vetro: braci che respirano e lingue che salgono
  stufa(x, S, b) {
    x.drawImage(b, 0, 0);
    const r = 0.5 + 0.5 * Math.sin(G.t * 2.1);
    px(x, '#5a1e10', 5, 17, 10, 8);
    px(x, '#8a3418', 5, 21, 10, 4);
    for (let i = 0; i < 5; i++) {
      const X = 6 + i * 2,
        h = 2 + Math.round(Math.random() * 3 + r * 2);
      px(x, '#c8862e', X, 25 - h, 1, h);
      if (Math.random() < 0.6) px(x, '#ffd070', X, 24 - Math.round(h / 2), 1, 1);
    }
    px(x, '#ffd070', 6 + Math.round(r * 7), 23, 2, 1);
  },
  // la ruota: sei raggi che girano finché la spinta non finisce
  arcolaio(x, S, b) {
    x.drawImage(b, 0, 0);
    S.ang = (S.ang || 0) + S.gira * G.dtV;
    for (let k = 0; k < 6; k++) {
      const a = S.ang + (k * Math.PI) / 3;
      for (let i = 2; i < 8.5; i += 0.6)
        px(x, '#6a4a30', 12 + Math.cos(a) * i - 0.5, 12 + Math.sin(a) * i - 0.5);
    }
  },
  // l'uccellino: salta da un posatoio all'altro, di notte dorme col becco sotto l'ala
  gabbia(x, S, b) {
    const P = [
      [5, 13],
      [9, 9],
      [11, 13],
      [7, 11]
    ];
    if (!notte() && G.t > S.salto) {
      S.salto = G.t + 0.8 + Math.random() * 2.2;
      S.posa = (S.posa + 1 + Math.floor(Math.random() * 3)) % P.length;
    }
    const [X, Y] = P[notte() ? 3 : S.posa],
      su = !notte() && G.t > S.salto - 0.12 ? -1 : 0;
    px(x, '#d8aa48', X, Y + su, 3, 2);
    px(x, '#ffd070', X, Y - 1 + su, 2, 1);
    if (!notte()) {
      px(x, '#07050a', X + 1, Y - 1 + su);
      px(x, '#c8862e', X + 2, Y - 1 + su);
    }
    px(x, '#8a6a44', X - 1, Y + 2, 5, 1); // il posatoio
    x.drawImage(b, 0, 0); // le sbarre davanti
  },
  // il pesce rosso nuota avanti e indietro; ogni tanto una bollicina
  boccia(x, S, b) {
    x.drawImage(b, 0, 0);
    S.pesce += G.dtV * (S.cibo > G.t ? 2.4 : 0.9);
    const X = 7 + Math.sin(S.pesce) * 3.2,
      Y = 8 + Math.sin(S.pesce * 0.7) * 1.4,
      dir = Math.cos(S.pesce) > 0 ? 1 : -1;
    px(x, '#d8702a', X - 1, Y, 3, 2);
    px(x, '#ff8a30', X - 1 - dir * 2, Y, 1, 2); // la coda
    px(x, '#07050a', X + (dir > 0 ? 1 : -1), Y);
    if ((S.cibo > G.t && Math.random() < 0.3) || Math.random() < 0.02)
      S.bolla = { y: Y - 1, x: X + dir, t: G.t };
    if (S.bolla && G.t - S.bolla.t < 0.8) px(x, '#c8e8f0', S.bolla.x, S.bolla.y - (G.t - S.bolla.t) * 6);
  },
  // la ballerina gira (stretta, larga, stretta…) finché la musica suona
  carillon(x, S, b) {
    x.drawImage(b, 0, 0);
    const va = G.t - S.suona < 7,
      fase = va ? Math.floor(G.t * 6) % 4 : 0,
      w = [3, 1, 3, 1][fase];
    px(x, '#f0e2c0', 6, 4, 1, 1); // la testa
    px(x, '#e8a8b8', 7 - Math.ceil(w / 2) + (w === 1 ? 0 : 0), 6, w, 1); // il tutù
    px(x, '#f0e2c0', 6, 5, 1, 1);
    px(x, '#f0e2c0', 6, 7, 1, 1);
  }
};
Ext.on('listaMondo', (list, m) => {
  if (m.id !== 'house') return;
  for (const o of m.objs) {
    if (o.kind !== 'furn' || !ARR_VIVI.has(o.fid)) continue;
    const base = FREEIMG[o.fid];
    if (!base || !DISEGNA[o.fid]) continue;
    const [x, S] = arrTela(o, base);
    // la sedia a dondolo: dondola da sola quando ci passi accanto camminando
    if (o.fid === 'dondolo') {
      const p = G.player,
        d = Math.hypot(p.x - (o.tx * 16 + 8), p.y - (o.ty * 16 + 8));
      if (p.moving && d < 18) S.dondola = Math.max(S.dondola, 0.1);
      S.dondola *= Math.pow(0.55, G.dtV);
    }
    if (o.fid === 'arcolaio') S.gira *= Math.pow(0.6, G.dtV);
    DISEGNA[o.fid](x, S, base);
    o.img = S.tela;
  }
});
// il tempo tra un fotogramma e l'altro, per le cose che girano (G.dt non c'è sempre)
G.dtV = 0.016;
{
  let prima = performance.now();
  Ext.on('listaMondo', () => {
    const ora = performance.now();
    G.dtV = Math.min(0.1, (ora - prima) / 1000);
    prima = ora;
  });
}
// il pendolo batte le ore: se sei in casa, allo scoccare senti i rintocchi (al massimo tre, per non stancare)
{
  let ultima = -1;
  Ext.on('drawWorldExtras', m => {
    if (m.id !== 'house' || !G.st || G.mode !== 'game') return;
    const h = Math.floor(G.st.time / 60);
    if (h === ultima) return;
    const prima = ultima;
    ultima = h;
    if (prima < 0 || !m.objs.some(o => o.fid === 'pendolo')) return;
    const n = Math.min(3, h % 12 || 12);
    for (let i = 0; i < n; i++) setTimeout(() => AU.play('rintocco'), i * 900);
  });
}

// ---------- toccarli ----------
Ext.on('arredo', o => {
  if (!ARREDI[o.fid]) return false;
  const S = arrStato(o),
    st = G.st;
  switch (o.fid) {
    case 'dondolo':
      S.dondola = 0.22;
      AU.play('cigolio');
      UI.toast('La sedia dondola. Cric. Crac. Cric.');
      return true;
    case 'arcolaio':
      S.gira = 9;
      AU.play('arcolaio');
      UI.toast('La ruota gira e la lana si torce in un filo sottile.');
      return true;
    case 'carillon':
      S.suona = G.t;
      AU.play('carillon');
      return true;
    case 'pendolo': {
      const h = Math.floor(st.time / 60),
        mm = st.time % 60;
      AU.play('rintocco');
      UI.toast(`Tic, tac. Sono le ${h}:${String(mm).padStart(2, '0')}.`);
      return true;
    }
    case 'gabbia':
      AU.play('cip');
      UI.toast(
        notte() ? 'Dorme, con la testa sotto l’ala. Shh.' : 'Cip! Il lucherino ti guarda di lato e saltella.'
      );
      return true;
    case 'boccia':
      S.cibo = G.t + 4;
      UI.toast('Un pizzico di briciole. Il pesce rosso fa il giro della boccia, contento.');
      return true;
    case 'letto':
      UI.toast('Morbido. Per dormire, però, il letto del nonno è quello che conosci.');
      return true;
    case 'stufa':
      UI.toast('La ghisa scotta. Dentro, il fuoco borbotta.');
      return true;
    default:
      UI.toast(`${ITEMS[o.fid].n}. ${ITEMS[o.fid].d} Per spostarlo usa l'accetta.`);
      return true;
  }
});
// la stufa fuma dal tubo; il candelabro e la stufa scaldano (un po' di scintille)
Ext.on('drawWorldExtras', m => {
  if (m.id !== 'house' || G.mode !== 'game') return;
  for (const o of m.objs) {
    if (o.fid !== 'stufa' || Math.random() > 0.05) continue;
    G.parts.push({ k: 'smoke', x: o.dx + 10, y: o.dy, vx: 2, vy: -6, t: 0, life: 1.4 });
  }
});

// ---------- le stanze nuove non restano spoglie ----------
// finestre lungo la parete, applique accese fra una finestra e l'altra, e nel salone (livello 5) un secondo camino
function arrFisso(m, kind, x, y, img, o = {}) {
  const T = o.T || [[x, y]];
  if (!img || T.some(([a, b]) => m.objAt(a, b))) return null;
  return m.add(OB(kind, x, y, img, Object.assign({ solid: [], hits: T, fisso: 1 }, o)));
}
Ext.on('arredaCasa', (m, st) => {
  const W = m.w,
    H = m.h,
    lv = houseLv(st);
  if (lv < 2) return;
  // il salone: il camino grande, con la sua luce
  if (lv >= 5 && IMG.fire)
    if (!m.objAt(18, 1) && !m.objAt(19, 1)) {
      m.add(
        OB('fire', 18, 1, IMG.fire[0], {
          wt: 2,
          solid: [
            [18, 1],
            [19, 1]
          ],
          hits: [
            [18, 1],
            [19, 1]
          ],
          act: 'fire',
          anim: 'fire',
          lift: 4
        })
      );
      m.lights.push({ x: 19 * 16, y: 24, r: 70, fire: 1 });
    }
  // le finestre nuove, dove la parete è libera
  for (const x of [11, 17, 20, 22])
    if (x < W - 1 && !m.objAt(x, 1))
      arrFisso(m, 'window', x, 1, IMG.window, { act: 'window', win: 1, lift: -6 });
  // le applique: una ogni tanto, accese
  for (const x of [13, 19, 23]) {
    if (x >= W - 0) continue;
    const o = arrFisso(m, 'applique', x, 1, FREEIMG.arr_applique, { act: 'applique', lift: -2 });
    if (o) m.lights.push({ x: o.dx + 5, y: o.dy + 3, r: 46, fire: 1 });
  }
  // il piano di sotto (livello 3 in su): il pavimento di pietra, più fresco, che separa le stanze
  if (H > 9)
    for (let y = 9; y < H - 1; y++)
      for (let x = 0; x < W; x++) if (m.get(x, y) === 6 && !(x === 6 && y >= H - 2)) m.set(x, y, 7);
});
// le applique: fiamma che trema
Ext.on('listaMondo', (list, m) => {
  if (m.id !== 'house' || !FREEIMG.arr_applique) return;
  for (const o of m.objs) {
    if (o.kind !== 'applique') continue;
    const [x, S] = arrTela(Object.assign(o, { fk: o.fk || 'app' + o.tx }), FREEIMG.arr_applique);
    x.drawImage(FREEIMG.arr_applique, 0, 0);
    fiammella(x, 4, 4);
    o.img = S.tela;
  }
});
ACT.applique = () =>
  UI.toast('Una candela nella sua applique d’ottone. Brom l’ha messa quando ha allargato la casa.');
PROMPT.applique = 'Guarda';

// ---------- i suoni ----------
Object.assign(SFX, {
  // il rintocco del pendolo: una campana bassa che si spegne piano
  rintocco: (a, t) => {
    a.osc('sine', 330, t, 1.6, 0.07);
    a.osc('sine', 660, t, 1.1, 0.025);
    a.osc('sine', 495, t, 0.8, 0.015);
  },
  cip: (a, t) => {
    a.osc('sine', 2600, t, 0.06, 0.04);
    a.osc('sine', 3200, t + 0.08, 0.07, 0.035);
  },
  cigolio: (a, t) => {
    a.osc('sawtooth', 240, t, 0.18, 0.015);
    a.osc('sawtooth', 210, t + 0.5, 0.2, 0.012);
  },
  arcolaio: (a, t) => a.noise(t, 1.4, 0.05, 'bandpass', 900),
  // il carillon: una melodia piccola, sempre la stessa
  carillon: (a, t) => {
    const N = [784, 659, 698, 784, 880, 784, 659, 587, 659, 784, 698, 659, 587, 523];
    N.forEach((f, i) => {
      a.osc('sine', f, t + i * 0.42, 0.55, 0.04);
      a.osc('sine', f * 2, t + i * 0.42, 0.25, 0.01);
    });
  }
});
