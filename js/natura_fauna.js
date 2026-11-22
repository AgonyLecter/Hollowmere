'use strict';
// ================= NATURA (4): LA FAUNA =================
// Animali selvatici che rendono viva la Valle. Non si cacciano: si osservano. Ognuno ha la sua stagione, le sue ore,
// il suo ambiente (prato, alberi, acqua, riva, cielo) e il suo modo di muoversi, con animazioni sue.
// Avvicinandoti a uno che non hai mai visto, finisce nel «Taccuino del naturalista» (scheda nel menu di pausa).
// Si aggiorna in 'mpTick' (ogni fotogramma) e si disegna nell'ordine giusto con 'listaMondo' (world.js).

// m: modo di muoversi · h: ore [da, a] (in ore, anche più fasce) · s: stagioni · dove: ambiente · n: quanti al massimo
const FAUNA = {
  farfalla: {
    n: 'Farfalla',
    s: [2, 3],
    h: [[8, 18]],
    dove: 'prato',
    m: 'vola',
    q: 4,
    d: "Bianche, gialle, azzurre. Si posano sui fiori dell'orto.",
    dove2: 'nei prati di primavera ed estate, di giorno'
  },
  ape: {
    n: 'Ape',
    s: [2, 3],
    h: [[8, 17]],
    dove: 'prato',
    m: 'vola',
    q: 3,
    d: 'Lavora più di tutti nella Valle. Ama girasoli, lavanda e calendule.',
    dove2: 'vicino ai fiori, nelle giornate di sole'
  },
  libellula: {
    n: 'Libellula',
    s: [3],
    h: [[9, 18]],
    dove: 'riva',
    m: 'vola',
    q: 2,
    d: "Si ferma a mezz'aria e poi sparisce. Azzurra come il vetro.",
    dove2: "lungo il fiume, d'estate"
  },
  lucciola: {
    n: 'Lucciola',
    s: [3],
    h: [[20.5, 24]],
    dove: 'prato',
    m: 'vola',
    q: 9,
    d: "Le notti d'estate il prato si accende. Contarle non si può.",
    dove2: "nei prati, le notti d'estate"
  },
  passero: {
    n: 'Passero',
    s: [0, 1, 2, 3],
    h: [[6, 18]],
    dove: 'prato',
    m: 'stormo',
    q: 4,
    d: 'Saltellano, beccano, scappano tutti insieme.',
    dove2: "nei prati, tutto l'anno, di giorno"
  },
  pettirosso: {
    n: 'Pettirosso',
    s: [1],
    h: [[7, 17]],
    dove: 'prato',
    m: 'stormo',
    q: 2,
    d: 'Il petto rosso, nella neve. Adesso il rosso si può guardare.',
    dove2: "nei prati d'inverno"
  },
  rondine: {
    n: 'Rondine',
    s: [2, 3],
    h: [[6, 20]],
    dove: 'cielo',
    m: 'cielo',
    q: 3,
    d: 'Tornano ogni primavera, sempre allo stesso tetto.',
    dove2: 'in cielo, in primavera ed estate'
  },
  pipistrello: {
    n: 'Pipistrello',
    s: [3, 0],
    h: [[19.5, 23.5]],
    dove: 'cielo',
    m: 'cielo',
    q: 3,
    d: 'Al crepuscolo, a zig-zag sopra i tetti. Mangia le zanzare.',
    dove2: "al crepuscolo, d'estate e d'autunno"
  },
  scoiattolo: {
    n: 'Scoiattolo',
    s: [0, 2, 3],
    h: [[7, 18]],
    dove: 'alberi',
    m: 'terra',
    q: 2,
    d: 'Nasconde le nocciole e poi dimentica dove.',
    dove2: "sotto gli alberi, di giorno (non d'inverno)"
  },
  riccio: {
    n: 'Riccio',
    s: [0, 2, 3],
    h: [[18, 23.5]],
    dove: 'prato',
    m: 'terra',
    q: 1,
    d: 'Esce la sera. Se ti avvicini, diventa una palla.',
    dove2: 'nei prati, la sera'
  },
  volpe: {
    n: 'Volpe',
    s: [0, 1, 2, 3],
    h: [
      [5.5, 8],
      [17.5, 20]
    ],
    dove: 'prato',
    m: 'terra',
    q: 1,
    raro: 1,
    d: "Arancione, prudente. Si vede solo all'alba e al tramonto.",
    dove2: "all'alba e al tramonto, tutto l'anno"
  },
  lumaca: {
    n: 'Lumaca',
    s: [0, 2],
    h: [[0, 24]],
    meteo: 'pioggia',
    dove: 'prato',
    m: 'terra',
    q: 3,
    d: 'Quando piove escono tutte. Lentissime, lucide.',
    dove2: 'quando piove, in primavera e in autunno'
  },
  lucertola: {
    n: 'Lucertola',
    s: [2, 3],
    h: [[10, 17]],
    dove: 'prato',
    m: 'terra',
    q: 2,
    d: "Si scalda al sole sulle pietre. Un attimo, e non c'è più.",
    dove2: 'al sole, nelle ore calde'
  },
  ermellino: {
    n: 'Ermellino',
    s: [1],
    h: [[8, 16]],
    dove: 'prato',
    m: 'terra',
    q: 1,
    raro: 1,
    d: "D'inverno diventa bianco, tranne la punta della coda.",
    dove2: "nei prati d'inverno (raro)"
  },
  gufo: {
    n: 'Gufo',
    s: [0, 1, 2, 3],
    h: [
      [20, 24],
      [0, 5]
    ],
    dove: 'alberi',
    m: 'albero',
    q: 1,
    d: "Ti guarda dall'albero. Gira la testa. Ti guarda ancora.",
    dove2: 'sugli alberi, di notte'
  },
  picchio: {
    n: 'Picchio',
    s: [0, 2, 3],
    h: [[7, 17]],
    dove: 'alberi',
    m: 'albero',
    q: 1,
    d: 'Toc-toc-toc. Si sente prima di vederlo.',
    dove2: 'sui tronchi, di giorno'
  },
  airone: {
    n: 'Airone',
    s: [0, 2, 3],
    h: [[6, 19]],
    dove: 'riva',
    m: 'riva',
    q: 1,
    d: 'Immobile su una zampa, finché non colpisce.',
    dove2: 'sulle rive del fiume e del Lago'
  },
  cigno: {
    n: 'Cigno',
    s: [0, 2, 3],
    h: [[7, 19]],
    dove: 'acqua',
    m: 'nuota',
    q: 2,
    d: "Scivola sull'acqua senza fare una piega.",
    dove2: "sull'acqua, di giorno"
  }
};
// anche gli animali che c'erano già finiscono nel taccuino
const FAUNA_VECCHI = {
  coniglio: {
    n: 'Coniglio',
    crit: 'rabbit',
    d: 'Nei prati a sud. Scappa appena ti vede.',
    dove2: 'nei prati a sud'
  },
  corvo: { n: 'Corvo', crit: 'crow', d: 'Sorveglia i campi. Ti conosce.', dove2: 'sui pali e sui tetti' },
  germano: { n: 'Germano reale', crit: 'duck', d: 'Sul fiume, a coppie.', dove2: 'sul fiume' },
  cervo: {
    n: 'Cervo',
    amb: 'deer',
    d: "Ai margini del bosco, quando c'è silenzio.",
    dove2: 'ai margini del bosco'
  }
};
const TACC_PREMI = { 4: 250, 8: 500, 12: 900, 22: 2500 };
const fauna = () => (G.fauna = G.fauna || []);
const faunaOra = (F, st) => {
  const h = st.time / 60;
  return F.h.some(([a, b]) => (b > 24 ? h >= a || h < b - 24 : h >= a && h < b));
};
const faunaOk = (F, st) =>
  F.s.includes(seasonOf(st)) &&
  faunaOra(F, st) &&
  (!F.meteo || st.weather === F.meteo) &&
  !(F.m === 'vola' && st.weather === 'pioggia' && F.dove !== 'riva');

// ---------- dove possono stare ----------
function faunaPosto(F, m) {
  const cx = G.cam.x,
    cy = G.cam.y;
  for (let tries = 0; tries < 30; tries++) {
    const x = Math.floor((cx - 40 + Math.random() * (VW + 80)) / 16),
      y = Math.floor((cy - 20 + Math.random() * (VH + 40)) / 16);
    if (x < 1 || y < 1 || x >= m.w - 1 || y >= m.h - 1) continue;
    const g = m.get(x, y),
      o = m.objAt(x, y),
      libero = !m.solid(x, y) && !o && (g === 1 || g === 12 || g === 2);
    if (F.dove === 'cielo') return [x * 16 + 8, y * 16];
    if (F.dove === 'acqua' && g === 3 && m.get(x + 1, y) === 3 && m.get(x - 1, y) === 3)
      return [x * 16 + 8, y * 16 + 10];
    if (
      F.dove === 'riva' &&
      libero &&
      [m.get(x, y + 1), m.get(x, y - 1), m.get(x + 1, y), m.get(x - 1, y)].includes(3)
    )
      return [x * 16 + 8, y * 16 + 12];
    if (F.dove === 'alberi') {
      if (F.m === 'albero' && o && o.kind === 'tree') return [x * 16 + 8, y * 16, o];
      if (
        F.m !== 'albero' &&
        libero &&
        [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1]
        ].some(([a, b]) => (m.objAt(x + a, y + b) || {}).kind === 'tree')
      )
        return [x * 16 + 8, y * 16 + 12];
    }
    if (F.dove === 'prato' && libero) return [x * 16 + 8, y * 16 + 12];
  }
  return null;
}
function faunaNuovo(id, F, m) {
  const p = faunaPosto(F, m);
  if (!p) return null;
  const a = {
    id,
    x: p[0],
    y: p[1],
    hx: p[0],
    hy: p[1],
    dir: Math.random() < 0.5 ? 1 : -1,
    t: Math.random() * 3,
    f: 0,
    st: 'fermo',
    var: Math.floor(Math.random() * 3),
    z: 0
  };
  if (F.m === 'albero') {
    const o = p[2];
    a.x = o.dx + iw(o.img) / 2 + (Math.random() < 0.5 ? -4 : 4);
    a.y = o.dy + ih(o.img) * (id === 'picchio' ? 0.62 : 0.32);
    a.tronco = o.sy;
  }
  if (F.m === 'vola') a.z = 6 + Math.random() * 10;
  if (F.m === 'cielo') {
    a.z = 40 + Math.random() * 30;
    a.x = G.cam.x + (a.dir > 0 ? -20 : VW + 20);
    a.y = G.cam.y + 30 + Math.random() * (VH - 40);
    a.vx = a.dir * (id === 'rondine' ? 90 : 55);
  }
  return a;
}

// ---------- comportamento ----------
function faunaTick(dt) {
  const st = G.st,
    m = G.map;
  if (!st || !isFree(st) || !m || m.id !== 'main' || G.visit) {
    G.fauna = [];
    return;
  }
  const L = fauna(),
    p = G.player;
  // ogni tanto: chi è fuori orario se ne va, chi manca arriva
  G._faunaT = (G._faunaT || 0) - dt;
  if (G._faunaT <= 0) {
    G._faunaT = 1.5;
    for (const a of L) if (!faunaOk(FAUNA[a.id], st) && a.st !== 'via') a.st = 'via';
    for (const [id, F] of Object.entries(FAUNA)) {
      if (!faunaOk(F, st) || (F.raro && Math.random() < 0.85)) continue;
      const n = L.filter(a => a.id === id && a.st !== 'via').length;
      if (n < F.q && Math.random() < 0.5) {
        const a = faunaNuovo(id, F, m);
        if (a) L.push(a);
      }
    }
  }
  for (const a of L) {
    const F = FAUNA[a.id],
      dx = a.x - p.x,
      dy = a.y - p.y,
      d = Math.hypot(dx, dy);
    a.t -= dt;
    a.f += dt;
    switch (F.m) {
      case 'vola': {
        // svolazza intorno al suo punto; via = si alza e se ne va
        if (a.t <= 0) {
          a.t = 0.6 + Math.random() * 1.6;
          a.tx = a.hx + (Math.random() - 0.5) * (a.id === 'lucciola' ? 80 : 50);
          a.ty = a.hy + (Math.random() - 0.5) * 30;
          a.posa = a.id === 'farfalla' && Math.random() < 0.3 ? 1.5 : 0;
        }
        if (a.posa > 0) {
          a.posa -= dt;
          a.z = Math.max(1, a.z - dt * 20);
          break;
        }
        const sp = { ape: 34, libellula: 60, lucciola: 10, farfalla: 22 }[a.id],
          vx = (a.tx ?? a.x) - a.x,
          vy = (a.ty ?? a.y) - a.y,
          vd = Math.hypot(vx, vy) || 1;
        if (vd > 2) {
          a.x += (vx / vd) * sp * dt;
          a.y += (vy / vd) * sp * dt;
          if (Math.abs(vx) > 1) a.dir = Math.sign(vx);
        }
        a.z = 8 + Math.sin(a.f * (a.id === 'farfalla' ? 3 : 6)) * 3 + (a.id === 'lucciola' ? 6 : 0);
        if (a.st === 'via') {
          a.hy -= dt * 30;
          a.z += dt * 12;
          if ((a.viaT = (a.viaT || 0) + dt) > 4) a.morto = 1;
        }
        break;
      }
      case 'stormo': {
        if (a.st === 'via' || (d < 38 && a.st !== 'vola')) {
          a.st = a.st === 'via' ? 'via' : 'vola';
          a.vx = (dx < 0 ? -1 : 1) * 70;
          a.dir = Math.sign(a.vx);
        }
        if (a.st === 'vola' || a.st === 'via') {
          a.x += a.vx * dt;
          a.z += dt * 40;
          if (a.z > 70) a.morto = 1;
          break;
        }
        if (a.t <= 0) {
          a.t = 0.4 + Math.random() * 1.2;
          a.st = Math.random() < 0.5 ? 'becca' : 'salta';
          if (a.st === 'salta') {
            a.dir = Math.random() < 0.5 ? 1 : -1;
            a.hop = 0.3;
          }
        }
        if (a.hop > 0) {
          a.hop -= dt;
          a.x += a.dir * 26 * dt;
          a.z = Math.sin((1 - a.hop / 0.3) * Math.PI) * 3;
        } else a.z = 0;
        break;
      }
      case 'cielo': {
        a.x += a.vx * dt;
        a.y += Math.sin(a.f * (a.id === 'pipistrello' ? 7 : 2.2)) * (a.id === 'pipistrello' ? 50 : 18) * dt;
        if (a.id === 'pipistrello' && Math.random() < dt * 0.8) {
          a.vx = -a.vx;
          a.dir = Math.sign(a.vx);
        }
        if (a.x < G.cam.x - 60 || a.x > G.cam.x + VW + 60) a.morto = 1;
        break;
      }
      case 'terra': {
        const pauroso = { volpe: 70, scoiattolo: 50, lucertola: 40, ermellino: 60, riccio: 26, lumaca: 0 }[
          a.id
        ];
        if (a.st === 'via' || (pauroso && d < pauroso)) {
          if (a.id === 'riccio' && a.st !== 'via') {
            a.st = 'palla';
            a.t = 3;
            break;
          }
          a.st = a.st === 'via' ? 'via' : 'scappa';
          const sp = { volpe: 80, scoiattolo: 90, lucertola: 110, ermellino: 100, riccio: 20, lumaca: 3 }[
            a.id
          ];
          a.dir = dx < 0 ? -1 : 1;
          a.x += (dx / (d || 1)) * sp * dt;
          a.y += (dy / (d || 1)) * sp * dt * 0.5;
          if (d > 260) a.morto = 1;
          break;
        }
        if (a.st === 'palla') {
          if (a.t <= 0) a.st = 'fermo';
          break;
        }
        if (a.t <= 0) {
          a.t = 1 + Math.random() * 3;
          if (Math.random() < 0.55) {
            a.st = 'cammina';
            a.tx = a.hx + (Math.random() - 0.5) * 70;
            a.ty = a.hy + (Math.random() - 0.5) * 30;
          } else a.st = 'fermo';
        }
        if (a.st === 'cammina') {
          const sp = { volpe: 28, scoiattolo: 40, lucertola: 30, ermellino: 34, riccio: 10, lumaca: 2 }[a.id],
            vx = a.tx - a.x,
            vy = a.ty - a.y,
            vd = Math.hypot(vx, vy);
          if (vd < 2) a.st = 'fermo';
          else {
            const nx = a.x + (vx / vd) * sp * dt,
              ny = a.y + (vy / vd) * sp * dt * 0.6;
            if (m.solid(Math.floor(nx / 16), Math.floor(ny / 16))) a.st = 'fermo';
            else {
              a.x = nx;
              a.y = ny;
            }
            a.dir = Math.sign(vx) || a.dir;
          }
        }
        break;
      }
      case 'albero':
        if (a.st === 'via') a.morto = 1;
        break;
      case 'riva':
        if (a.st !== 'vola' && (d < 50 || a.st === 'via')) {
          a.st = 'vola';
          a.vx = (dx < 0 ? -1 : 1) * 50;
          a.dir = Math.sign(a.vx);
        }
        if (a.st === 'vola') {
          a.x += a.vx * dt;
          a.z += dt * 25;
          if (a.z > 90) a.morto = 1;
        } else if (a.t <= 0) {
          a.t = 1.5 + Math.random() * 3;
          a.posa = Math.random() < 0.4 ? 1 : 0;
        }
        break;
      case 'nuota': {
        if (a.t <= 0) {
          a.t = 3 + Math.random() * 4;
          a.vx = (Math.random() - 0.5) * 12;
          if (a.vx) a.dir = Math.sign(a.vx);
        }
        const nx = a.x + (a.vx || 0) * dt;
        if (m.get(Math.floor(nx / 16), Math.floor(a.y / 16)) === 3) a.x = nx;
        else a.vx = -(a.vx || 0);
        if (a.st === 'via') a.morto = 1;
        break;
      }
    }
    if (Math.abs(a.x - G.cam.x - VW / 2) > VW + 200 || Math.abs(a.y - G.cam.y - VH / 2) > VH + 200) a.morto = 1;
  }
  G.fauna = L.filter(a => !a.morto);
  taccuinoTick(dt);
}
Ext.on('mpTick', dt => {
  try {
    if (!UI.modalOpen) faunaTick(dt);
  } catch (e) {
    console.error(e);
  }
});

// ---------- il taccuino del naturalista ----------
function taccuino(st) {
  st = st || G.st;
  return (st.free.taccuino = st.free.taccuino || {});
}
const TACC_TOT = () => Object.keys(FAUNA).length + Object.keys(FAUNA_VECCHI).length;
function taccuinoSegna(id) {
  const st = G.st,
    T = taccuino(st);
  if (T[id]) return;
  T[id] = st.day;
  const n = Object.keys(T).length,
    nome = (FAUNA[id] || FAUNA_VECCHI[id]).n;
  AU.play('ok');
  UI.toast(`📖 Nel taccuino: ${nome} (${n}/${TACC_TOT()}).`);
  const premio = n === TACC_TOT() ? TACC_PREMI[22] : TACC_PREMI[n];
  if (premio) {
    st.money += premio;
    UI.hud();
    setTimeout(() => UI.toast(`Il taccuino si riempie: ${n} animali osservati. +${SC(premio)}`), 1800);
  }
}
function taccuinoTick(dt) {
  const st = G.st,
    p = G.player;
  if (G.cut || UI.busy()) return;
  G._taccT = (G._taccT || 0) - dt;
  if (G._taccT > 0) return;
  G._taccT = 0.4;
  const T = taccuino(st),
    vicino = (x, y, r = 64) => Math.hypot(x - p.x, y - p.y) < r;
  for (const a of fauna())
    if (!T[a.id] && vicino(a.x, a.y - a.z, FAUNA[a.id].m === 'cielo' ? 110 : 64)) return taccuinoSegna(a.id);
  for (const [id, V] of Object.entries(FAUNA_VECCHI)) {
    if (T[id]) continue;
    if (V.crit && G.critters && G.critters.some(c => c.k === V.crit && vicino(c.x, c.y)))
      return taccuinoSegna(id);
    if (
      V.amb &&
      G.amb &&
      G.amb[V.amb] &&
      G.amb[V.amb].on !== false &&
      vicino(G.amb[V.amb].x, G.amb[V.amb].y, 90)
    )
      return taccuinoSegna(id);
  }
}
function taccuinoHTML() {
  const st = G.st,
    T = taccuino(st),
    n = Object.keys(T).length;
  const riga = (id, F, img) =>
    `<div class="mrow"><canvas data-fauna="${T[id] ? id : ''}" width="40" height="32"></canvas><span>${
      T[id]
        ? `<b>${esc(F.n)}</b><br><span class="small">${esc(F.d)}</span>`
        : `<b>???</b><br><span class="small">Si vede ${esc(F.dove2)}.</span>`
    }</span></div>`;
  return `<p class="small">Gli animali della Valle non si cacciano: si osservano. Avvicinati piano a uno che non conosci e finirà qui. Osservati: <b>${n}/${TACC_TOT()}</b>. Premi a 4, 8, 12 e a taccuino completo.</p>${Object.entries(
    FAUNA
  )
    .map(([id, F]) => riga(id, F))
    .join('')}${Object.entries(FAUNA_VECCHI)
    .map(([id, F]) => riga(id, F))
    .join('')}`;
}
function taccuinoMonta(box) {
  box.querySelectorAll('canvas[data-fauna]').forEach(c => {
    const id = c.dataset.fauna,
      x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    let im = null;
    if (FAUNA_IMG[id]) im = FAUNA_IMG[id].icona;
    else if (FAUNA_VECCHI[id] && FAUNA_VECCHI[id].crit) im = (CRIT[FAUNA_VECCHI[id].crit] || [])[0];
    else if (id === 'cervo' && typeof DEER !== 'undefined')
      im = Array.isArray(DEER) ? DEER[0] : DEER.idle ? DEER.idle[0] : null;
    if (!im) {
      x.fillStyle = 'rgba(60,40,20,.35)';
      x.font = '20px serif';
      x.fillText('?', 14, 24);
      return;
    }
    const s = Math.min(36 / iw(im), 28 / ih(im), 2);
    x.drawImage(im, 20 - (iw(im) * s) / 2, 30 - ih(im) * s, iw(im) * s, ih(im) * s);
  });
}

// ---------- disegno ----------
const FAUNA_IMG = {};
function faunaFrame(a) {
  const I = FAUNA_IMG[a.id],
    F = FAUNA[a.id],
    v = I.var ? I.var[a.var % I.var.length] : I;
  const ciclo = (L, fps) => L[Math.floor(a.f * fps) % L.length];
  switch (F.m) {
    case 'vola':
      return a.posa > 0
        ? ciclo(v.ali, 1.5)
        : ciclo(v.ali, a.id === 'farfalla' ? 8 : a.id === 'lucciola' ? 2 : 20);
    case 'stormo':
      return a.st === 'vola' || a.st === 'via'
        ? ciclo(I.vola, 12)
        : a.st === 'becca'
          ? ciclo(I.becca, 4)
          : I.fermo;
    case 'cielo':
      return ciclo(I.ali, a.id === 'pipistrello' ? 14 : 6);
    case 'terra':
      if (a.st === 'palla') return I.palla || I.fermo[0];
      if (a.st === 'cammina') return ciclo(I.passo, a.id === 'lumaca' ? 2 : 8);
      if (a.st === 'scappa' || a.st === 'via') return ciclo(I.passo, 14);
      return ciclo(I.fermo, a.id === 'volpe' ? 1.2 : 2);
    case 'albero':
      return ciclo(I.fermo, a.id === 'picchio' ? (Math.floor(a.f / 2) % 2 ? 10 : 1) : 0.7);
    case 'riva':
      return a.st === 'vola' ? ciclo(I.vola, 5) : a.posa ? ciclo(I.becca, 3) : I.fermo[0];
    case 'nuota':
      return ciclo(I.fermo, 1.5);
  }
  return null;
}
function faunaDraw(a) {
  const img = faunaFrame(a);
  if (!img) return;
  const w = iw(img),
    h = ih(img),
    X = Math.round(a.x),
    Y = Math.round(a.y - a.z);
  const F = FAUNA[a.id];
  if (F.m === 'terra' || F.m === 'stormo' || (F.m === 'riva' && a.st !== 'vola')) {
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.fillRect(X - w * 0.3, Math.round(a.y) - 1, w * 0.6, 2);
  }
  if (F.m === 'nuota') {
    // scia sull'acqua
    const ph = (a.f * 0.8) % 1;
    ctx.globalAlpha = (1 - ph) * 0.5;
    ctx.fillStyle = '#e8f4ff';
    ctx.fillRect(X - w / 2 - ph * 6 * a.dir, Math.round(a.y) - 1, w * (0.6 + ph), 1);
    ctx.globalAlpha = 1;
  }
  if (a.dir < 0) {
    ctx.save();
    ctx.translate(X, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, Y - h, w, h);
    ctx.restore();
  } else ctx.drawImage(img, X - w / 2, Y - h, w, h);
}
Ext.on('listaMondo', (list, m) => {
  if (m.id !== 'main' || !G.fauna) return;
  for (const a of G.fauna) {
    const F = FAUNA[a.id],
      alto = F.m === 'cielo' || F.m === 'vola' || ((F.m === 'stormo' || F.m === 'riva') && a.z > 6);
    list.push({ sy: alto ? 9e9 : F.m === 'albero' ? a.tronco + 1 : a.y, draw: () => faunaDraw(a) });
  }
});
// le lucciole fanno luce, sopra il buio
Ext.on('drawAmbTop', m => {
  try {
    if (m.id !== 'main' || !G.fauna) return;
    for (const a of G.fauna) {
      if (a.id !== 'lucciola') continue;
      const k = 0.5 + 0.5 * Math.sin(a.f * 3 + a.var * 2),
        X = a.x,
        Y = a.y - a.z - 1,
        g = ctx.createRadialGradient(X, Y, 0, X, Y, 6);
      g.addColorStop(0, `rgba(230,255,120,${(0.9 * k).toFixed(2)})`);
      g.addColorStop(1, 'rgba(200,255,80,0)');
      ctx.fillStyle = g;
      ctx.fillRect(X - 6, Y - 6, 12, 12);
      ctx.fillStyle = `rgba(250,255,200,${k.toFixed(2)})`;
      ctx.fillRect(X - 0.5, Y - 0.5, 1, 1);
    }
  } catch (e) {
    console.error(e);
  }
});

// ---------- sprite (guardano a destra; a sinistra si specchiano) ----------
Ext.on('arte', () => {
  try {
    const R = h => R6b(h);
    const S = (w, h, fn) => SP(w, h, P => fn(P, () => new MK2(P.w, P.h)));
    const el = (P, M, x, y, rx, ry, c, o = {}) => paint2(P, M().ell(x, y, rx, ry), R(c), o);
    const rot = (P, M, x, y, rx, ry, a, c, o = {}) => paint2(P, M().rot(x, y, rx, ry, a), R(c), o);
    const cap = (P, M, x0, y0, x1, y1, r, c, o = {}) =>
      paint2(P, M().cap(x0, y0, x1, y1, r), R(c), { thin: 1, ...o });
    const px = (P, x, y, c) => P.set(x, y, C(c));
    // farfalla: ali aperte, a metà, chiuse (tre colori)
    FAUNA_IMG.farfalla = {
      var: [
        ['#f4f0e0', '#c8c0a8'],
        ['#f0d040', '#e89020'],
        ['#7ab0f0', '#3a6ac8']
      ].map(([col, bordo]) => ({
        // apertura delle ali: 1 aperte, 0 chiuse (viste di taglio)
        ali: [1, 0.55, 0.15, 0.55].map(k =>
          S(10, 8, (P, M) => {
            for (const sx of [-1, 1]) {
              const ex = 10 + sx * (1.5 + 4 * k);
              paint2(P, M().ell(ex, 6, 0.8 + 3.6 * k, 4), R(col), {
                mod: (X, Y, t) => (Math.abs(X - ex) > 2.6 * k + 0.4 ? (P.set(X, Y, C(bordo)), null) : t)
              });
              paint2(P, M().ell(10 + sx * (1.2 + 3 * k), 11, 0.6 + 2.6 * k, 2.6), R(col), { thin: 1 });
              if (k > 0.5) P.set(Math.round(ex), 6, C('#2a2228'));
            }
            cap(P, M, 10, 4, 10, 13, 0.6, '#2a2228');
            px(P, 9, 2, '#2a2228');
            px(P, 11, 2, '#2a2228');
          })
        )
      }))
    };
    FAUNA_IMG.ape = {
      ali: [0, 1].map(k =>
        S(6, 6, (P, M) => {
          el(P, M, 6, 7, 4, 3, '#f0c020', {
            mod: (X, Y, t) => (X % 3 === 0 ? (P.set(X, Y, C('#2a2020')), null) : t)
          });
          el(P, M, 10.5, 6.5, 1.8, 1.8, '#2a2020', { thin: 1 });
          el(P, M, 6, k ? 3 : 4, 2.6, k ? 2 : 1.2, '#e8f4ff', { thin: 1, nc: 1 });
        })
      )
    };
    FAUNA_IMG.libellula = {
      ali: [0, 1].map(k =>
        S(12, 6, (P, M) => {
          cap(P, M, 2, 6, 18, 6, 0.9, '#3a8ad8');
          el(P, M, 19.5, 6, 2, 2, '#2a5aa8', { thin: 1 });
          for (const x of [13, 16])
            rot(P, M, x, k ? 3 : 4, 1.4, 4, k ? 0.3 : -0.3, '#d8f0ff', { thin: 1, nc: 1 });
        })
      )
    };
    FAUNA_IMG.lucciola = {
      ali: [0, 1].map(k =>
        S(4, 4, (P, M) => {
          el(P, M, 4, 4.5, 2, 1.4, '#3a3020', { thin: 1 });
          px(P, 2, 5, k ? '#f8ff90' : '#d8f070');
          px(P, 3, 2, '#c8d8e8');
        })
      )
    };
    // uccellini: fermo, becca, vola
    const uccellino = petto => {
      const corpo = (P, M, testa) => {
        el(P, M, 7, 9, 5, 3.6, '#8a6a4a');
        el(P, M, 8, 10, 3, 2.4, petto, { thin: 1, nc: 1 });
        cap(P, M, 2, 8, 0, 6, 1, '#6a4a3a');
        el(P, M, testa[0], testa[1], 2.8, 2.6, '#7a5a3a');
        px(P, testa[0] + 1, testa[1] - 1, '#101010');
        px(P, testa[0] + 3, testa[1], '#e8a030');
        px(P, 6, 13, '#4a3020');
        px(P, 8, 13, '#4a3020');
      };
      return {
        fermo: S(8, 7, (P, M) => corpo(P, M, [11, 6])),
        becca: [S(8, 7, (P, M) => corpo(P, M, [11, 6])), S(8, 7, (P, M) => corpo(P, M, [12, 10]))],
        vola: [0, 1].map(k =>
          S(8, 7, (P, M) => {
            corpo(P, M, [11, 7]);
            rot(P, M, 6, k ? 3 : 10, 4, 1.6, k ? -0.5 : 0.5, '#6a4a3a', { thin: 1 });
          })
        )
      };
    };
    FAUNA_IMG.passero = uccellino('#c8b090');
    FAUNA_IMG.pettirosso = uccellino('#e8602a');
    FAUNA_IMG.rondine = {
      ali: [1, 0.3, -0.6, 0.3].map(k =>
        S(12, 6, (P, M) => {
          el(P, M, 12, 6, 6, 2, '#1a2a5a');
          el(P, M, 14, 7, 3, 1.2, '#f4ece0', { thin: 1, nc: 1 });
          px(P, 17, 5, '#c8402a');
          cap(P, M, 6, 6, 1, 3, 0.6, '#1a2a5a');
          cap(P, M, 6, 6, 1, 8, 0.6, '#1a2a5a');
          rot(P, M, 11, 6 - k * 3, 6, 1.4, -0.3 * k, '#22346a', { thin: 1 });
        })
      )
    };
    FAUNA_IMG.pipistrello = {
      ali: [1, 0, -1].map(k =>
        S(12, 6, (P, M) => {
          el(P, M, 12, 7, 2.6, 2.8, '#3a2a30');
          px(P, 11, 4, '#3a2a30');
          px(P, 13, 4, '#3a2a30');
          for (const sx of [-1, 1])
            paint2(
              P,
              M().poly([
                [12, 6],
                [12 + sx * 11, 6 - k * 4],
                [12 + sx * 9, 8 - k * 2],
                [12 + sx * 5, 9]
              ]),
              R('#4a3a42'),
              { thin: 1 }
            );
        })
      )
    };
    // scoiattolo: fermo (rosicchia), corre
    FAUNA_IMG.scoiattolo = {
      fermo: [0, 1].map(k =>
        S(10, 10, (P, M) => {
          rot(P, M, 5, 9 - k, 4, 7, -0.3, '#c8682a', { mod: (X, Y, t) => ((X + Y) % 4 === 0 ? t + 1 : t) });
          el(P, M, 12, 13, 4, 5, '#c8682a');
          el(P, M, 13, 14, 2, 3, '#f0d8b0', { thin: 1, nc: 1 });
          el(P, M, 14, 8, 3, 2.8, '#c8682a');
          px(P, 13, 5, '#c8682a');
          px(P, 15, 7, '#101010');
          el(P, M, 16, 11 - k, 1.4, 1.4, '#8a5a2a', { thin: 1 });
        })
      ),
      passo: [0, 1].map(k =>
        S(10, 10, (P, M) => {
          rot(P, M, 4, 10 + k, 4, 6, -0.8 + k * 0.3, '#c8682a', {
            mod: (X, Y, t) => ((X + Y) % 4 === 0 ? t + 1 : t)
          });
          el(P, M, 11, 14, 5, 3, '#c8682a');
          el(P, M, 16, 12, 2.8, 2.6, '#c8682a');
          px(P, 17, 11, '#101010');
          px(P, k ? 8 : 10, 17, '#7a3a1a');
          px(P, k ? 14 : 12, 17, '#7a3a1a');
        })
      )
    };
    // riccio: cammina, palla
    const aculei = (P, M, cx, cy, rx, ry) =>
      el(P, M, cx, cy, rx, ry, '#6a5040', {
        mod: (X, Y, t) => ((X * 3 + Y * 5) % 4 === 0 ? (P.set(X, Y, C('#c8b098')), null) : t)
      });
    FAUNA_IMG.riccio = {
      fermo: [
        S(10, 7, (P, M) => {
          aculei(P, M, 8, 8, 7, 5);
          el(P, M, 15, 10, 3, 2.2, '#d8b890');
          px(P, 18, 10, '#101010');
          px(P, 15, 9, '#101010');
        })
      ],
      passo: [0, 1].map(k =>
        S(10, 7, (P, M) => {
          aculei(P, M, 8, 8, 7, 5);
          el(P, M, 15, 10, 3, 2.2, '#d8b890');
          px(P, 18, 10, '#101010');
          px(P, 15, 9, '#101010');
          px(P, k ? 5 : 7, 13, '#4a3020');
          px(P, k ? 11 : 9, 13, '#4a3020');
        })
      ),
      palla: S(10, 7, (P, M) => aculei(P, M, 10, 8, 6, 5.4))
    };
    // volpe: trotto (4), seduta che muove la coda (2)
    const volpe = (P, M, fase, seduta, coda) => {
      if (seduta) {
        rot(P, M, 8, 18 - coda, 7, 2.6, 0.3 - coda * 0.3, '#d8702a');
        px(P, 2, 19 - coda * 2, '#f4ece0');
        rot(P, M, 18, 15, 5, 7, 0.2, '#d8702a');
        el(P, M, 19, 17, 2.4, 4, '#f4ece0', { thin: 1, nc: 1 });
        el(P, M, 21, 7, 4, 3.4, '#d8702a');
        paint2(
          P,
          M().poly([
            [18, 2],
            [20, 5],
            [17, 5]
          ]),
          R('#c8602a'),
          { thin: 1 }
        );
        paint2(
          P,
          M().poly([
            [23, 2],
            [24, 5],
            [21, 5]
          ]),
          R('#c8602a'),
          { thin: 1 }
        );
        cap(P, M, 23, 8, 27, 9, 1.2, '#d8702a');
        px(P, 22, 6, '#101010');
        px(P, 27, 9, '#101010');
        cap(P, M, 17, 20, 17, 23, 0.6, '#3a2418');
        cap(P, M, 20, 20, 20, 23, 0.6, '#3a2418');
        return;
      }
      const g = [0, 1, 0, -1][fase];
      rot(P, M, 5, 12, 6, 2.6, 0.4 + g * 0.1, '#d8702a');
      px(P, 0, 15, '#f4ece0');
      el(P, M, 15, 13, 8, 4, '#d8702a');
      el(P, M, 16, 15, 5, 2, '#f4ece0', { thin: 1, nc: 1 });
      el(P, M, 25, 10, 3.6, 3.2, '#d8702a');
      paint2(
        P,
        M().poly([
          [23, 4],
          [25, 7],
          [22, 7]
        ]),
        R('#c8602a'),
        { thin: 1 }
      );
      cap(P, M, 27, 11, 31, 12, 1.1, '#d8702a');
      px(P, 26, 9, '#101010');
      px(P, 31, 12, '#101010');
      for (const [x, s] of [
        [9, 1],
        [12, -1],
        [19, 1],
        [22, -1]
      ])
        cap(P, M, x, 16, x + g * s * 2, 23, 0.6, '#3a2418');
    };
    FAUNA_IMG.volpe = {
      passo: [0, 1, 2, 3].map(f => S(16, 12, (P, M) => volpe(P, M, f))),
      fermo: [0, 1].map(k => S(16, 12, (P, M) => volpe(P, M, 0, 1, k)))
    };
    FAUNA_IMG.lumaca = {
      passo: [0, 1].map(k =>
        S(8, 5, (P, M) => {
          el(P, M, 8 + k, 8, 6 + k, 1.6, '#c8b090', { thin: 1 });
          el(P, M, 7, 5, 4, 3.6, '#a8703a', {
            mod: (X, Y, t) => (Math.hypot(X - 7, Y - 5) < 1.6 ? t + 2 : t)
          });
          cap(P, M, 13 + k, 7, 14 + k, 3, 0.4, '#c8b090');
          px(P, 14 + k, 3, '#101010');
        })
      )
    };
    FAUNA_IMG.lumaca.fermo = [FAUNA_IMG.lumaca.passo[0]];
    FAUNA_IMG.lucertola = {
      passo: [0, 1].map(k =>
        S(12, 4, (P, M) => {
          paint2(P, M().cap(1, 5 + k, 8, 5, 0.7), R('#5a9a3a'), { thin: 1 });
          el(P, M, 13, 5, 6, 1.8, '#5a9a3a', { mod: (X, Y, t) => (X % 3 === 0 ? t + 1 : t) });
          el(P, M, 20, 5 - k * 0.5, 2.4, 1.6, '#4a8a2a');
          px(P, 21, 4, '#101010');
          for (const [x, s] of [
            [10, 1],
            [16, -1]
          ]) {
            px(P, x + k * s, 7, '#3a6a2a');
            px(P, x - k * s, 3, '#3a6a2a');
          }
        })
      )
    };
    FAUNA_IMG.lucertola.fermo = [FAUNA_IMG.lucertola.passo[0], FAUNA_IMG.lucertola.passo[1]];
    FAUNA_IMG.ermellino = {
      passo: [0, 1].map(k =>
        S(12, 6, (P, M) => {
          el(P, M, 11, 8 - k, 7, 2.6, '#f4f4f0');
          cap(P, M, 4, 7, 0, 5 + k * 2, 0.9, '#f4f4f0');
          px(P, 0, 5 + k * 2, '#101010');
          el(P, M, 19, 6 - k, 2.8, 2.4, '#f4f4f0');
          px(P, 20, 5 - k, '#101010');
          px(P, 22, 6 - k, '#3a3030');
        })
      ),
      fermo: [
        S(12, 6, (P, M) => {
          el(P, M, 12, 7, 2.6, 5, '#f4f4f0');
          el(P, M, 13, 2, 2.4, 2, '#f4f4f0');
          px(P, 14, 1, '#101010');
          cap(P, M, 10, 11, 5, 11, 0.8, '#f4f4f0');
          px(P, 4, 11, '#101010');
        })
      ]
    };
    // gufo: guarda, sbatte gli occhi, gira la testa
    const gufo = (P, M, k) => {
      el(P, M, 10, 15, 6, 7.5, '#7a5a3a', { mod: (X, Y, t) => ((X + Y * 2) % 5 === 0 ? t + 1 : t) });
      el(P, M, 10, 17, 3.6, 4.5, '#c8a878', { thin: 1, nc: 1 });
      el(P, M, 10, 7, 6, 5, '#7a5a3a');
      paint2(
        P,
        M().poly([
          [4, 2],
          [6, 5],
          [4, 5]
        ]),
        R('#6a4a2a'),
        { thin: 1 }
      );
      paint2(
        P,
        M().poly([
          [16, 2],
          [16, 5],
          [14, 5]
        ]),
        R('#6a4a2a'),
        { thin: 1 }
      );
      const off = k === 2 ? 2 : 0;
      for (const ex of [7, 13]) {
        el(P, M, ex + off, 7, 2.2, 2.2, k === 1 ? '#7a5a3a' : '#f0c030', { thin: 1, nc: 1 });
        if (k !== 1) px(P, ex + off, 7, '#101010');
      }
      px(P, 10 + off, 9, '#d8a030');
    };
    FAUNA_IMG.gufo = { fermo: [0, 0, 0, 1, 0, 0, 2, 2].map(k => S(10, 12, (P, M) => gufo(P, M, k))) };
    // picchio: sul tronco, testa indietro / colpo
    FAUNA_IMG.picchio = {
      fermo: [0, 1].map(k =>
        S(8, 10, (P, M) => {
          rot(P, M, 6, 11, 3.4, 7, 0.1, '#2a2a2a', {
            mod: (X, Y, t) => ((X + Y) % 3 === 0 ? (P.set(X, Y, C('#f4f4f0')), null) : t)
          });
          el(P, M, 9 - k, 4, 2.8, 2.6, '#2a2a2a');
          px(P, 9 - k, 2, '#d8302a');
          px(P, 8 - k, 2, '#d8302a');
          cap(P, M, 11 - k, 4, 14 - k * 2, 4, 0.5, '#8a8a80');
          px(P, 10 - k, 4, '#f4f4f0');
          cap(P, M, 4, 17, 2, 19, 0.6, '#2a2a2a');
        })
      )
    };
    // airone: in piedi, becca, vola
    const airone = (P, M, collo, ala) => {
      el(P, M, 10, 18, 6, 4, '#a8b0b8', { mod: (X, Y, t) => (Y > 19 ? t - 1 : t) });
      cap(P, M, 4, 19, 1, 22, 0.8, '#a8b0b8');
      if (ala === undefined) {
        cap(P, M, 9, 22, 9, 35, 0.4, '#d8b060');
        cap(P, M, 12, 22, collo === 2 ? 12 : 13, 35, 0.4, '#d8b060');
      } else rot(P, M, 9, 14 + ala * 5, 9, 2.4, -0.3 + ala * 0.4, '#8a929a', { thin: 1 });
      const hx = collo === 1 ? 20 : 15,
        hy = collo === 1 ? 26 : 6;
      cap(P, M, 14, 16, hx, hy, 1.2, '#c8d0d8');
      el(P, M, hx, hy, 2.4, 2, '#e8ecf0');
      cap(P, M, hx + 1, hy, hx + 6, hy + (collo === 1 ? 2 : 1), 0.5, '#e8b040');
      px(P, hx, hy - 1, '#101010');
      cap(P, M, hx - 1, hy - 1, hx - 5, hy - 2, 0.3, '#3a3a40');
    };
    FAUNA_IMG.airone = {
      fermo: [S(12, 18, (P, M) => airone(P, M, 0)), S(12, 18, (P, M) => airone(P, M, 2))],
      becca: [S(12, 18, (P, M) => airone(P, M, 0)), S(12, 18, (P, M) => airone(P, M, 1))],
      vola: [0, 1].map(k => S(12, 18, (P, M) => airone(P, M, 0, k)))
    };
    FAUNA_IMG.cigno = {
      fermo: [0, 1].map(k =>
        S(16, 10, (P, M) => {
          el(P, M, 14, 15, 11, 4.5, '#f8f8f4', { mod: (X, Y, t) => (Y > 16 ? t - 1 : t) });
          rot(P, M, 11, 12, 7, 3, -0.2, '#ececea', { thin: 1, nc: 1 });
          cap(P, M, 22, 14, 23 + k * 0.5, 4, 1.4, '#f8f8f4');
          el(P, M, 25, 4, 2.6, 2, '#f8f8f4');
          cap(P, M, 27, 4, 30, 5, 0.7, '#e87a2a');
          px(P, 25, 3, '#101010');
          for (let x = 4; x < 26; x += 3) px(P, x + k, 19, '#9ad0e8');
        })
      )
    };
    // l'icona per il taccuino: il primo fotogramma
    for (const I of Object.values(FAUNA_IMG)) {
      const v = I.var ? I.var[0] : I;
      I.icona =
        (v.fermo && (Array.isArray(v.fermo) ? v.fermo[0] : v.fermo)) ||
        (v.ali && v.ali[0]) ||
        (v.passo && v.passo[0]);
    }
  } catch (e) {
    console.error(e);
  }
});
