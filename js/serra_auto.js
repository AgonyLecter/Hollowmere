'use strict';
// ================= LA SERRA CHE LAVORA DA SOLA =================
// Due migliorie si comprano al banco del giardiniere, dentro la serra (funcMenu in costruire.js):
//   · gli irrigatori a scomparsa: ogni mattina alle 7 spuntano dalla terra delle aiuole, girano spruzzando
//     tutte le zolle e rientrano;
//   · il braccio a carrucola: una gru a ponte sotto il tetto di vetro. Dalle 8, quando ci sono piante mature,
//     corre lungo le rotaie, cala il braccio, le raccoglie (fino a tre per giro) e le posa nella cassa della
//     serra, che il giocatore svuota quando vuole.
// Se sei dentro li vedi lavorare; se sei altrove il lavoro si fa lo stesso, all'ora giusta, in un colpo.
// Quello che conta (zolle bagnate, raccolti nella cassa) si decide subito: l'animazione mostra soltanto, così
// uscendo a metà non si perde niente. La cassa della serra è una cassa vera (st.free.built, id 'cassa'), con
// la chiave oltre SERRA_OX come le zolle: schermata, «Prendi tutto», cooperativo e riparazioni sono quelli
// di sempre (zaino.js).
// Stato salvato, nella serra (st.free.built[k]): auto = { irr: 1, gru: 1 }, irrDay, gruDay.

const SERRA_AUTO = {
  irr: {
    n: 'Irrigatori a scomparsa',
    d: 'Ogni mattina alle 7 spuntano dalla terra delle aiuole e bagnano tutte le zolle. Poi rientrano.',
    money: 1500,
    c: { lingotto: 6, rame: 4 }
  },
  gru: {
    n: 'Braccio a carrucola',
    d: 'Una gru sotto il tetto: dalle 8 raccoglie le piante mature e le posa nella cassa della serra, accanto alla porta.',
    money: 3000,
    c: { lingotto: 8, oro: 2, legna: 30 }
  }
};
const ORA_IRR = 7 * 60,
  ORA_GRU = 8 * 60,
  SERRA_CASSA = [3, 9], // la cassa della serra, nella stanza
  GRU_ALTO = 30, // quanto sta in alto il ponte (pixel)
  GRU_BASSO = 9, // fin dove cala il braccio sopra la pianta
  GRU_CESTO = 3; // quante piante porta per giro
const serraAuto = b => (b && b.auto) || {};
const cassaSerraK = b => b.ox + SERRA_CASSA[0] + ',' + SERRA_CASSA[1];
// le zolle di questa serra (chiavi vere in st.farm)
function serraZolleK(b) {
  return serraZolle(fLv(b)).map(([x, y]) => b.ox + x + ',' + y);
}
// la cassa: nasce col braccio a carrucola
function serraCassa(st, k, b) {
  if (!serraAuto(b).gru || !b.ox) return null;
  const ck = cassaSerraK(b);
  let c = st.free.built[ck];
  if (!c || c.id !== 'cassa') c = st.free.built[ck] = { id: 'cassa', inv: cassaVuota(), serra: k };
  if (!Array.isArray(c.inv)) c.inv = cassaVuota();
  return c;
}
// dove sei: nella stanza di questa serra?
const serraGuardata = k => !!(G.map && G.map.id === 'serra' && G.map.serraK === k && G.mode === 'game');

// ---------- il raccolto nella cassa (come harvest in farm.js, ma senza zaino) ----------
function serraRaccogli(fk, f, cassa) {
  const st = G.st,
    c = f.c,
    t = c.t,
    cr = CROPS[t];
  let n = cr.y[0] + Math.floor(Math.random() * (cr.y[1] - cr.y[0] + 1));
  if (Math.random() < 0.08 + (f.f ? 0.42 : 0) + (c.bad ? 0 : 0.15) + (skLv('agri') >= 4 ? 0.15 : 0)) n++;
  // ci sta tutto? (si prova su una copia: niente a metà)
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
const mature = (st, b) =>
  serraZolleK(b).filter(fk => {
    const f = st.farm[fk];
    return f && f.c && !f.c.dead && cropStage(f.c) === 3;
  });

// ---------- gli irrigatori ----------
// due per aiuola, dove si toccano le quattro zolle di ogni metà
function serraUgelli(b) {
  const L = [];
  for (const [x0, y0] of SERRA_AIUOLE.slice(0, fLv(b) + 1))
    for (const dx of [1, 3]) L.push([(x0 + dx) * 16, (y0 + 1) * 16]);
  return L;
}
const IRR = { k: null, t0: 0 }; // l'irrigazione che stai guardando
const IRR_SU = 0.55,
  IRR_SPRUZZA = 4,
  IRR_GIU = 0.5;
function serraIrriga(k, b) {
  const st = G.st;
  b.irrDay = st.day;
  if (serraGuardata(k)) {
    IRR.k = k;
    IRR.t0 = G.t;
    AU.play('ugelli');
    return;
  }
  for (const fk of serraZolleK(b)) if (st.farm[fk]) st.farm[fk].w = true;
}
// mentre la guardi: le zolle si bagnano quando il getto ci arriva
function serraIrrigaTick() {
  if (!IRR.k) return;
  const st = G.st,
    b = st.free.built[IRR.k],
    t = G.t - IRR.t0;
  if (!b || !serraGuardata(IRR.k)) {
    // sei uscito a metà: quello che resta si bagna lo stesso
    if (b) for (const fk of serraZolleK(b)) if (st.farm[fk]) st.farm[fk].w = true;
    IRR.k = null;
    return;
  }
  if (t >= IRR_SU && !IRR.bagnato) {
    IRR.bagnato = true;
    AU.play('spruzzo');
    const U = serraUgelli(b);
    for (const fk of serraZolleK(b)) {
      const f = st.farm[fk];
      if (!f) continue;
      const [x, y] = fk.split(',').map(Number),
        X = (x - b.ox) * 16 + 8,
        Y = y * 16 + 8,
        d = Math.min(...U.map(([ux, uy]) => Math.hypot(ux - X, uy - Y)));
      allImpatto(
        () => {
          f.w = true;
          piantaSussulta(fk, 'acqua');
        },
        0.3 + d / 40
      );
    }
  }
  if (t > IRR_SU + IRR_SPRUZZA + IRR_GIU) {
    IRR.k = null;
    IRR.bagnato = false;
  } else if (t > IRR_SU && t < IRR_SU + IRR_SPRUZZA) {
    // le gocce: ogni ugello gira e lancia archi tutt'intorno (fisica dei pezzi di gesti.js)
    for (const [ux, uy] of serraUgelli(b))
      for (let j = 0; j < 2; j++) {
        const a = G.t * 5 + ux * 0.1 + j * Math.PI + Math.random() * 0.6,
          r = caso(10, 22),
          T = caso(0.28, 0.36),
          g = 260,
          z0 = 8;
        pezzo({
          k: 'goccia',
          x: ux,
          y: uy,
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
    // una nebbiolina sopra le aiuole
    if (Math.random() < 0.25) {
      const [ux, uy] = serraUgelli(b)[Math.floor(Math.random() * serraUgelli(b).length)];
      polvere(ux, uy, 1, 'rgba(200,230,245,.35)', 9);
    }
  }
}
function disegnaUgelli(list, m, b) {
  if (!serraAuto(b).irr) return;
  const t = IRR.k === m.serraK ? G.t - IRR.t0 : -1;
  let h = 0;
  if (t >= 0) {
    if (t < IRR_SU) h = (t / IRR_SU) * 7;
    else if (t < IRR_SU + IRR_SPRUZZA) h = 7;
    else h = Math.max(0, 7 * (1 - (t - IRR_SU - IRR_SPRUZZA) / IRR_GIU));
  }
  h = Math.round(h);
  for (const [ux, uy] of serraUgelli(b)) list.push({ sy: uy + 2, draw: () => disegnaUgello(ux, uy, h) });
}
function disegnaUgello(ux, uy, h) {
  {
    const X = Math.round(ux),
      Y = Math.round(uy);
    // il tappo d'ottone a filo della terra, e quando sale il collo e la testa che gira
    ctx.fillStyle = '#07050a';
    ctx.fillRect(X - 2, Y - 1, 5, 3);
    if (h > 0) {
      ctx.fillStyle = '#07050a';
      ctx.fillRect(X - 1, Y - h - 1, 3, h + 1);
      ctx.fillStyle = '#74726e';
      ctx.fillRect(X, Y - h, 1, h);
      const gira = Math.floor(G.t * 12) % 2;
      ctx.fillStyle = '#07050a';
      ctx.fillRect(X - 2, Y - h - 3, 5, 3);
      ctx.fillStyle = gira ? '#d8aa48' : '#c8862e';
      ctx.fillRect(X - 1, Y - h - 2, 3, 1);
      ctx.fillStyle = '#ffd070';
      ctx.fillRect(X + (gira ? 1 : -1), Y - h - 2, 1, 1);
    } else {
      ctx.fillStyle = '#8a6a44';
      ctx.fillRect(X - 1, Y, 3, 1);
      ctx.fillStyle = '#c8862e';
      ctx.fillRect(X, Y, 1, 1);
    }
  }
}

// ---------- il braccio a carrucola ----------
// GRU: dove sta (x, y: il punto a terra sotto il carrello; h: quanto è alto il braccio), cosa sta facendo, e il
// cesto con quello che porta. Il carrello va su due assi insieme: il ponte scorre sulle rotaie lungo le pareti,
// il carrello sul ponte.
const GRU = { k: null, x: 0, y: 0, h: GRU_ALTO, fase: 'riposo', t: 0, giro: [], cesto: [], aperta: 0 };
const gruCasa = () => [SERRA_CASSA[0] * 16 + 8, SERRA_CASSA[1] * 16 + 6];
function gruAZero(k) {
  const [x, y] = gruCasa();
  Object.assign(GRU, { k, x, y, h: GRU_ALTO, fase: 'riposo', t: 0, giro: [], cesto: [], aperta: 0 });
}
// fuori dalla stanza: tutto quello che è maturo, subito nella cassa
function serraRaccogliTutto(k, b) {
  const st = G.st,
    cassa = serraCassa(st, k, b);
  if (!cassa) return 0;
  let n = 0;
  for (const fk of mature(st, b)) if (serraRaccogli(fk, st.farm[fk], cassa)) n++;
  return n;
}
// il prossimo giro: fino a tre piante mature, dalla più vicina
function gruNuovoGiro(b) {
  const st = G.st,
    L = mature(st, b).map(fk => {
      const [x, y] = fk.split(',').map(Number);
      return { fk, x: (x - b.ox) * 16 + 8, y: y * 16 + 12 };
    }),
    giro = [];
  let px = GRU.x,
    py = GRU.y;
  while (L.length && giro.length < GRU_CESTO) {
    L.sort((a, c) => Math.hypot(a.x - px, a.y - py) - Math.hypot(c.x - px, c.y - py));
    const p = L.shift();
    giro.push(p);
    px = p.x;
    py = p.y;
  }
  return giro;
}
function gruTick(dt) {
  const st = G.st,
    k = G.map && G.map.id === 'serra' ? G.map.serraK : null,
    b = k && st.free.built[k];
  if (!b || !serraAuto(b).gru || G.visit) {
    if (GRU.k && GRU.k !== k) GRU.k = null;
    return;
  }
  if (GRU.k !== k) gruAZero(k);
  const cassa = serraCassa(st, k, b),
    vel = 70,
    verso = (tx, ty) => {
      const dx = tx - GRU.x,
        dy = ty - GRU.y,
        d = Math.hypot(dx, dy);
      if (d < vel * dt) {
        GRU.x = tx;
        GRU.y = ty;
        return true;
      }
      GRU.x += (dx / d) * vel * dt;
      GRU.y += (dy / d) * vel * dt;
      return false;
    };
  GRU.t += dt;
  const F = GRU.fase;
  if (F === 'riposo') {
    // di giorno, dalle 8, se c'è qualcosa di maturo (e la cassa ha posto) parte
    if (st.time >= ORA_GRU && st.time < 22 * 60 && GRU.t > 1.2 && !(GRU.ferma > G.t)) {
      const giro = gruNuovoGiro(b);
      if (giro.length) {
        GRU.giro = giro;
        GRU.fase = 'va';
        GRU.t = 0;
        b.gruDay = st.day;
        AU.play('carrucola');
      } else GRU.t = 0;
    }
  } else if (F === 'va') {
    const p = GRU.giro[0];
    if (!p) {
      GRU.fase = GRU.cesto.length ? 'allaCassa' : 'torna';
      GRU.t = 0;
    } else if (verso(p.x, p.y)) {
      GRU.fase = 'scende';
      GRU.t = 0;
    }
  } else if (F === 'scende' || F === 'scendeCassa') {
    GRU.h = Math.max(GRU_BASSO, GRU_ALTO - (GRU.t / 0.45) * (GRU_ALTO - GRU_BASSO));
    if (F === 'scendeCassa') GRU.aperta = Math.min(1, GRU.t / 0.3);
    if (GRU.t >= 0.45) {
      GRU.fase = F === 'scende' ? 'prende' : 'molla';
      GRU.t = 0;
      if (F === 'scende') {
        // la presa: la pianta finisce nella cassa adesso (il cesto la mostra soltanto)
        const p = GRU.giro.shift(),
          f = st.farm[p.fk],
          r = f && f.c && !f.c.dead && cropStage(f.c) === 3 ? serraRaccogli(p.fk, f, cassa) : null;
        if (r) {
          GRU.cesto.push(r);
          piantaSussulta(p.fk, 'raccolto');
          AU.play('pick');
          GESTO.erba(p.x, p.y, 5);
        } else if (f && f.c && cropStage(f.c) === 3) {
          GRU.piena = true;
          GRU.giro = [];
        }
      } else AU.play('legno');
    }
  } else if (F === 'prende' || F === 'molla') {
    if (GRU.t >= 0.3) {
      if (F === 'molla') GRU.cesto = [];
      GRU.fase = F === 'prende' ? 'sale' : 'saleCassa';
      GRU.t = 0;
    }
  } else if (F === 'sale' || F === 'saleCassa') {
    GRU.h = Math.min(GRU_ALTO, GRU_BASSO + (GRU.t / 0.45) * (GRU_ALTO - GRU_BASSO));
    if (F === 'saleCassa') GRU.aperta = Math.max(0, 1 - GRU.t / 0.3);
    if (GRU.t >= 0.45) {
      GRU.t = 0;
      if (F === 'sale') GRU.fase = GRU.giro.length ? 'va' : 'allaCassa';
      else {
        // ancora qualcosa di maturo? un altro giro, altrimenti a riposo sopra la cassa
        const giro = GRU.piena ? [] : gruNuovoGiro(b);
        if (GRU.piena) {
          // la cassa è piena: si ferma finché non la svuoti (si riprova ogni tanto), e lo dice una volta
          GRU.ferma = G.t + 15;
          if (!GRU.detto) UI.toast('La cassa della serra è piena: svuotala, e il braccio riprende.', 'bad');
          GRU.detto = true;
        } else GRU.detto = false;
        GRU.piena = false;
        GRU.giro = giro;
        GRU.fase = giro.length ? 'va' : 'riposo';
      }
    }
  } else if (F === 'allaCassa' || F === 'torna') {
    const [cx, cy] = gruCasa();
    if (verso(cx, cy)) {
      GRU.fase = F === 'allaCassa' ? 'scendeCassa' : 'riposo';
      GRU.t = 0;
    }
  }
}
function disegnaGru(m, b) {
  if (!serraAuto(b).gru) return;
  if (GRU.k !== m.serraK) gruAZero(m.serraK);
  const W = SERRA_W * 16,
    xa = 5,
    xb = W - 6,
    ya = 2 * 16 - GRU_ALTO + 14,
    yb = (SERRA_H - 1) * 16 - GRU_ALTO,
    X = Math.round(GRU.x),
    YP = Math.round(GRU.y - GRU_ALTO), // il ponte, in alto
    YB = Math.round(GRU.y - GRU.h); // il braccio
  // le rotaie lungo le pareti, sotto il tetto: ferro scuro coi chiodi
  for (const x of [xa, xb]) {
    ctx.fillStyle = '#07050a';
    ctx.fillRect(x - 2, ya, 5, yb - ya);
    ctx.fillStyle = '#3a3a44';
    ctx.fillRect(x - 1, ya, 3, yb - ya);
    ctx.fillStyle = '#74726e';
    for (let y = ya + 4; y < yb; y += 12) ctx.fillRect(x, y, 1, 1);
  }
  // il ponte, con le ruote sulle rotaie
  ctx.fillStyle = '#07050a';
  ctx.fillRect(xa - 2, YP - 2, xb - xa + 5, 5);
  ctx.fillStyle = '#4a3222';
  ctx.fillRect(xa - 1, YP - 1, xb - xa + 3, 3);
  ctx.fillStyle = '#6a4a30';
  ctx.fillRect(xa - 1, YP - 1, xb - xa + 3, 1);
  for (let x = xa + 10; x < xb - 4; x += 16) {
    ctx.fillStyle = '#2e2016';
    ctx.fillRect(x, YP - 1, 1, 3);
  }
  for (const x of [xa, xb]) {
    ctx.fillStyle = '#07050a';
    ctx.fillRect(x - 3, YP - 3, 7, 7);
    ctx.fillStyle = '#55545a';
    ctx.fillRect(x - 2, YP - 2, 5, 5);
    ctx.fillStyle = '#9a968a';
    ctx.fillRect(x - 1, YP - 2, 2, 1);
  }
  // il carrello con la puleggia (gira quando la corda si muove)
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 5, YP - 4, 11, 8);
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(X - 4, YP - 3, 9, 6);
  const gira = /scende|sale/.test(GRU.fase) ? Math.floor(G.t * 14) % 2 : 0;
  ctx.fillStyle = '#c8862e';
  ctx.fillRect(X - 1, YP - 2, 3, 3);
  ctx.fillStyle = gira ? '#ffd070' : '#8a5a20';
  ctx.fillRect(X, YP - 2 + gira, 1, 1);
  // la corda
  ctx.fillStyle = '#a88a5e';
  ctx.fillRect(X, YP + 3, 1, Math.max(0, YB - YP - 6));
  // il cesto con quello che porta
  const C = GRU.cesto;
  for (let i = 0; i < C.length; i++) {
    const ic = ICON[C[i].id];
    if (ic) ctx.drawImage(ic, X - 6 + i * 4, YB - 6 + (i % 2), 9, 9);
  }
  // le pinze: aperte quando scende e quando molla, chiuse quando porta
  const chiusa = GRU.fase === 'prende' || (C.length && GRU.fase !== 'molla' && GRU.fase !== 'saleCassa'),
    ap = chiusa ? 1 : 3;
  ctx.fillStyle = '#07050a';
  ctx.fillRect(X - 3, YB - 4, 7, 3);
  ctx.fillRect(X - ap - 2, YB - 2, 3, 6);
  ctx.fillRect(X + ap, YB - 2, 3, 6);
  ctx.fillStyle = '#74726e';
  ctx.fillRect(X - 2, YB - 3, 5, 1);
  ctx.fillRect(X - ap - 1, YB - 1, 1, 4);
  ctx.fillRect(X + ap + 1, YB - 1, 1, 4);
  ctx.fillStyle = '#9a968a';
  ctx.fillRect(X - ap - 1, YB + 3, 1, 1);
  ctx.fillRect(X + ap + 1, YB + 3, 1, 1);
}

// ---------- nella stanza: la cassa e i congegni ----------
Ext.on('serraMappa', (m, b, k) => {
  const st = G.st,
    c = serraCassa(st, k, b);
  if (!c) return;
  const [x, y] = SERRA_CASSA;
  m.add(
    OB('cassaserra', x, y, IMG.chest, {
      act: 'cassaserra',
      ck: cassaSerraK(b),
      solid: [[x, y]],
      hits: [[x, y]]
    })
  );
});
ACT.cassaserra = o => zaino(o.ck);
PROMPT.cassaserra = 'Apri';
// la cassa si apre quando il braccio ci cala dentro; gli irrigatori stanno tra le piante, in profondità
Ext.on('listaMondo', (list, m) => {
  if (m.id !== 'serra') return;
  const o = m.objs.find(q => q.act === 'cassaserra');
  if (o) o.img = GRU.k === m.serraK && GRU.aperta > 0.5 ? IMG.chestO : IMG.chest;
  const b = G.st.free.built[m.serraK];
  if (b) disegnaUgelli(list, m, b);
});
Ext.on('drawWorldExtras', m => {
  if (m.id !== 'serra') return;
  const b = G.st.free.built[m.serraK];
  if (b) disegnaGru(m, b);
});

// ---------- l'orologio: alle 7 gli irrigatori, dalle 8 il braccio; fuori dalla stanza, in un colpo ----------
Ext.on('mpTick', dt => {
  try {
    const st = G.st;
    if (!st || !isFree(st) || G.visit || G.mode !== 'game') return;
    for (const k in st.free.built) {
      const b = st.free.built[k];
      if (!b || b.id !== 'serra' || !b.auto || !b.ox) continue;
      if (b.auto.irr && st.time >= ORA_IRR && b.irrDay !== st.day) serraIrriga(k, b);
      if (b.auto.gru && st.time >= ORA_GRU && b.gruDay !== st.day && !serraGuardata(k)) {
        b.gruDay = st.day;
        serraRaccogliTutto(k, b);
      }
    }
    serraIrrigaTick();
    gruTick(Math.min(0.05, dt));
  } catch (e) {
    segnala(e, 'serra');
  }
});
// la cassa di una serra tolta: il contenuto va nella cassetta delle spedizioni, niente si perde
Ext.on('freeMorning', st => {
  if (!st || !isFree(st)) return;
  for (const ck in st.free.built) {
    const c = st.free.built[ck];
    if (!c || c.id !== 'cassa' || !c.serra) continue;
    const s = st.free.built[c.serra];
    if (s && s.id === 'serra' && cassaSerraK(s) === ck) continue;
    st.mailbox = Array.isArray(st.mailbox) ? st.mailbox : [];
    for (const p of c.inv || []) if (p) st.mailbox.push({ item: p.id, n: p.n, from: '' });
    delete st.free.built[ck];
  }
});

// ---------- al banco del giardiniere: comprarle ----------
const serraCosto = A =>
  `${CZ(A.money)}, ${Object.entries(A.c)
    .map(([i, n]) => `${n} ${ITEMS[i].n.toLowerCase()} (${countItem(i)})${doveMat(i, n)}`)
    .join(', ')}`;
const serraPuo = A => G.st.money >= A.money && Object.entries(A.c).every(([i, n]) => countItem(i) >= n);
Ext.on('serraMenu', (k, b) => {
  const au = serraAuto(b);
  return (
    `<h3>Automatismi</h3>` +
    Object.entries(SERRA_AUTO)
      .map(([id, A]) =>
        au[id]
          ? `<p><b>✓ ${A.n}</b><br><span class="small">${A.d}</span></p>`
          : `<p><b>${A.n}</b><br><span class="small">${A.d} Servono ${serraCosto(A)}.</span><br><button class="btn" data-auto="${id}" ${serraPuo(A) ? '' : 'disabled'}>Installa</button></p>`
      )
      .join('')
  );
});
Ext.on('funcMenuPronto', (k, b, box, again) => {
  if (b.id !== 'serra') return;
  box.querySelectorAll('[data-auto]').forEach(
    el =>
      (el.onclick = () => {
        const id = el.dataset.auto,
          A = SERRA_AUTO[id],
          st = G.st;
        if (!serraPuo(A) || serraAuto(b)[id]) return;
        st.money -= A.money;
        for (const [i, n] of Object.entries(A.c)) removeItem(i, n);
        b.auto = Object.assign({}, b.auto, { [id]: 1 });
        Ext.run('automatismo', k, id); // l'Ingegnere ne sente parlare (ingegnere.js)
        AU.play('ok');
        G.shake = 1;
        UI.hud();
        addXP('arti', 25);
        UI.toast(
          id === 'irr'
            ? 'Irrigatori installati: ogni mattina alle 7 bagnano tutte le aiuole.'
            : 'Braccio a carrucola installato: dalle 8 raccoglie quello che è maturo e lo posa nella cassa accanto alla porta.'
        );
        // la stanza si rifà (la cassa, le rotaie); se è già ora, si vede lavorare subito
        if (G.map && G.map.id === 'serra' && G.map.serraK === k) {
          G.maps.serra = buildSerra(st, k);
          G.map = G.maps.serra;
          if (id === 'irr' && st.time >= ORA_IRR) {
            b.irrDay = null;
          }
        }
        NET.save(st);
        again();
      })
  );
});

// ---------- i suoni ----------
Object.assign(SFX, {
  // gli irrigatori che salgono: uno scatto di ferro e l'aria nei tubi
  ugelli: (a, t) => {
    a.osc('square', 140, t, 0.06, 0.08, null, 0.002, 90);
    a.noise(t + 0.05, 0.4, 0.06, 'bandpass', 900, 2, null, 0.1, 2400);
  },
  // il getto: un fruscio lungo che sale e si spegne
  spruzzo: (a, t) => {
    a.noise(t, 4.2, 0.07, 'highpass', 3200, 1, null, 0.4);
    a.noise(t, 4.2, 0.03, 'bandpass', 6000, 3, null, 0.6);
  },
  // la carrucola: la catena che scorre
  carrucola: (a, t) => {
    for (let i = 0; i < 7; i++) a.noise(t + i * 0.07, 0.03, 0.06, 'bandpass', 2600 + (i % 2) * 700, 6);
    a.osc('triangle', 220, t, 0.4, 0.03, null, 0.05, 180);
  }
});
