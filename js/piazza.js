'use strict';
// ================= LA PIAZZA DELLA VALLE =================
// Nella Valle la piazza si fa bella (tools/pixel/piazza_abbozzo.py → js/piazza_mano.js):
//   · a terra il cordolo di granito lungo il bordo (aperto dove entrano i sentieri) e il rosone al centro, che resta
//     libero: nelle feste lì si accende il falò e si balla;
//   · le due bacheche, nuove e simmetriche ai lati dell'ingresso dalla cappella: a sinistra quella degli incarichi
//     (legno, tettuccio di scandole, lanterna), a destra l'albo della Valle (pietra e ardesia, il piccione in cima,
//     la mappa dipinta e la lavagna dei nomi: i pallini si accendono per chi è online qui);
//   · due allori in vaso accanto all'ingresso, le fioriere di pietra agli angoli (i fiori cambiano con la stagione);
//   · i festoni di bandierine tra i lampioni, che il vento muove.
// La pietra del villaggio non c'è più: il rango sta nel pulsante sotto l'orologio. Nella storia la piazza resta com'era.

const PZ = { x0: 38, y0: 15, x1: 51, y1: 23 };
Ext.on('arte', () => {
  const D = PIAZZA_MANO;
  for (const k of Object.keys(D.sprite)) FREEIMG['pz_' + k] = daGriglia(D, k);
});

const PZ_CEDE = new Set(['pumpkin', 'debris', 'tuft']);
function pzMetti(m, kind, x, y, img, o = {}) {
  const T = o.T || [[x, y]];
  for (const [a, b] of T) {
    const q = m.objAt(a, b);
    if (q && !PZ_CEDE.has(q.kind)) return null; // zucche, rami, sassi ed erbacce lasciano il posto; il resto no
  }
  for (const [a, b] of T) {
    const q = m.objAt(a, b);
    if (!q) continue;
    if (q.kind === 'debris' && G.st.free) delete G.st.free.debris[fkey(a, b)];
    mapRemove(m, q);
  }
  return m.add(OB(kind, x, y, img, Object.assign({ wt: T.length > 1 ? T.length : 1, solid: T, hits: T }, o)));
}
Ext.on('applyFree', (m, st) => {
  if (m.id !== 'main' || !isFree(st) || !FREEIMG.pz_selciato) return;
  const I = FREEIMG;
  // la pietra del villaggio, se un salvataggio vecchio l'avesse ancora
  for (const o of m.objs.filter(q => q.kind === 'pietra')) mapRemove(m, o);
  // il selciato: cordolo e rosone, sotto tutto
  m.add({
    kind: 'selciato',
    tx: PZ.x0,
    ty: PZ.y0,
    img: I.pz_selciato,
    dx: PZ.x0 * 16,
    dy: PZ.y0 * 16,
    sy: -2,
    solid: [],
    hits: [],
    deco: 1
  });
  // la bacheca degli incarichi: due caselle, al posto della vecchia
  const vecchia = m.objs.find(q => q.kind === 'board');
  if (vecchia) mapRemove(m, vecchia);
  const T2 = (x, y) => [
    [x, y],
    [x + 1, y]
  ];
  const bach = pzMetti(m, 'board', 40, 16, I.pz_bacheca, { act: 'board', T: T2(40, 16) });
  if (bach) m.lights.push({ x: bach.dx + 32, y: bach.dy + 13, r: 30, fire: 1 });
  // l'albo della Valle: stesso posto, disegno nuovo
  const albo = m.objs.find(q => q.kind === 'albo');
  if (albo) {
    const n = OB('albo', albo.tx, albo.ty, I.pz_albo, { wt: 2 });
    Object.assign(albo, { img: I.pz_albo, dx: n.dx, dy: n.dy, sy: n.sy });
  }
  // gli allori all'ingresso dalla cappella e le fioriere agli angoli
  for (const x of [42, 44]) pzMetti(m, 'alloro', x, 16, I.pz_alloro, { act: 'alloro' });
  const fio = I['pz_fioriera' + seasonOf(st)];
  for (const [x, y] of [
    [38, 16],
    [50, 16],
    [39, 22],
    [49, 22]
  ])
    pzMetti(m, 'fioriera', x, y, fio, { act: 'fioriera', T: T2(x, y) });
});

// ---------- vivi ----------
// l'albo: i pallini della lavagna si accendono, uno per chi è online qui adesso (tu compreso)
const PZ_PALLINI = [
  [23, 31],
  [26, 34],
  [20, 37],
  [24, 40]
];
Ext.on('listaMondo', (list, m) => {
  if (m.id !== 'main' || !isFree(G.st) || !FREEIMG.pz_albo) return;
  const albo = m.objs.find(q => q.kind === 'albo');
  if (!albo) return;
  const b = FREEIMG.pz_albo,
    t = (albo._tela = albo._tela || document.createElement('canvas'));
  t.width = b.width;
  t.height = b.height;
  const x = t.getContext('2d');
  x.drawImage(b, 0, 0);
  const qui = Math.min(PZ_PALLINI.length, 1 + Object.keys(G.others || {}).length),
    luce = 0.6 + 0.4 * Math.sin(G.t * 3);
  PZ_PALLINI.forEach(([px, py], i) => {
    x.fillStyle = i < qui ? `rgba(255,${200 + Math.round(40 * luce)},90,1)` : '#2e3a22';
    x.fillRect(px, py, 1, 1);
    if (i < qui) {
      x.fillStyle = `rgba(255,220,120,${(0.35 * luce).toFixed(2)})`;
      x.fillRect(px - 1, py, 3, 1);
      x.fillRect(px, py - 1, 1, 3);
    }
  });
  albo.img = t;
});
// i festoni di bandierine tra i lampioni, sopra la piazza: si muovono col vento
const PZ_FESTONI = [
  [38, 15, 51, 15],
  [38, 23, 51, 23]
];
const PZ_COL = ['#b03a30', '#d8aa48', '#4a6a70', '#e8dcc0', '#606a36', '#7a5a86'];
Ext.on('drawWorldExtras', m => {
  if (m.id !== 'main' || !isFree(G.st)) return;
  const vento = G.st.weather === 'pioggia' || G.st.weather === 'temporale' ? 2.2 : 1;
  for (const [ax, ay, bx, by] of PZ_FESTONI) {
    const X0 = ax * 16 + 8,
      Y0 = ay * 16 - 24,
      X1 = bx * 16 + 8,
      Y1 = by * 16 - 24,
      n = 26;
    ctx.strokeStyle = '#2a1e24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const punto = k => {
      const t = k / n,
        sag = Math.sin(t * Math.PI) * (10 + Math.sin(G.t * 1.3 + ay) * 1.5 * vento);
      return [X0 + (X1 - X0) * t, Y0 + (Y1 - Y0) * t + sag];
    };
    for (let k = 0; k <= n; k++) {
      const [x, y] = punto(k);
      k ? ctx.lineTo(x, y + 0.5) : ctx.moveTo(x, y + 0.5);
    }
    ctx.stroke();
    for (let k = 1; k < n; k++) {
      const [x, y] = punto(k),
        sw = Math.sin(G.t * 3.1 * vento + k * 0.9) * 1.2 * vento;
      ctx.fillStyle = PZ_COL[(k + ay) % PZ_COL.length];
      ctx.beginPath();
      ctx.moveTo(Math.round(x) - 2, Math.round(y) + 1);
      ctx.lineTo(Math.round(x) + 2, Math.round(y) + 1);
      ctx.lineTo(Math.round(x + sw), Math.round(y) + 6);
      ctx.closePath();
      ctx.fill();
    }
  }
});

ACT.alloro = () =>
  UI.toast('Un alloro in vaso. Agatha ne stacca una foglia per il brodo, quando pensa che non la vedi.');
ACT.fioriera = () => {
  const s = seasonOf(G.st);
  UI.toast(
    [
      'Crisantemi e calendule, i colori dell’autunno.',
      'Agrifoglio e neve. Le fioriere dormono, ma non del tutto.',
      'Primule, giunchiglie e viole: la piazza si sveglia.',
      'Gerani e girasoli piccoli. Rina li annaffia all’alba.'
    ][s]
  );
};
Object.assign(PROMPT, { alloro: 'Guarda', fioriera: 'Guarda' });
