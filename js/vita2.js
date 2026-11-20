'use strict';
// ================= LA VALLE VIVA (2): TUTTI, PIÙ SVEGLI, E I SUSSURRI =================
// - Giornate vere anche per Tobia, gli otto nuovi abitanti e Ottavio.
// - Si accorgono di te: stanchezza, piante assetate, raccolto pronto, posta, zaino pieno, incarichi, ore piccole.
// - Sussurri: quando passi vicino, due abitanti parlano piano e si lasciano scappare indizi su quello che ti manca
//   (Nove e i ricordi, le curiosità, il museo, la miniera, le zone chiuse, la Valle degli altri giocatori).
//   Quello che senti finisce nel diario (☰ → Traguardi → Sussurri sentiti).

// ---------- Tobia ----------
{
  const orig = SCHED.tobia;
  SCHED.tobia = function (st) {
    if (!isFree(st) || G.visit) return orig(st);
    const t = st.time,
      d = WD(st);
    if (t < 480 || t >= 1200) return null;
    if (d === 6 && t >= 840 && t < 1080)
      return zoneOpen('lago', st) ? VA(66, 30, 2, 'play', 1) : VA(36, 41, 0, 'play', 1); // con Brom a pescare
    if ((d === 0 || d === 2) && t >= 900 && t < 990) return VA(28, 22, 3, 'read'); // Ezekiel gli insegna a leggere
    if (t >= 600 && t < 720) return VA(24, 32, 0, 'play', 4, { run: 1 }); // a caccia di farfalle
    if (t >= 720 && t < 780) return VA(36, 30, 2, 'idle', 1); // da Clara, per pranzo
    if (t >= 1020) return VA(44, 20, 0, 'play', 3, { run: 1 });
    const p = cyc(t, st.day * 90, 70, [
      [23, 16],
      [29, 6],
      [54, 11],
      [40, 24],
      [23, 30],
      [16, 35]
    ]);
    return VA(p[0], p[1], 0, 'play', 3, { run: 1 });
  };
}
// ---------- Ottavio: il giro della posta ----------
{
  const orig = SCHED.ottavio;
  SCHED.ottavio = function (st) {
    const r = orig(st);
    if (!r || !isFree(st)) return r;
    const t = st.time;
    if (t >= 540 && t < 720) {
      const [hx, hy] = bdoor('house');
      const p = cyc(t, 540, 20, [
        [55, 17],
        [52, 31],
        [35, 29],
        [36, 15],
        [hx, hy + 1],
        [46, 22]
      ]);
      return VA(p[0], p[1], 0, 'deliver');
    }
    return r;
  };
}
// ---------- i nuovi abitanti: ognuno il suo mestiere ----------
const builtOf = (st, id) => {
  for (const k in st.free.built)
    if (st.free.built[k].id === id) {
      const [x, y] = k.split(',').map(Number);
      return [x, y + 1];
    }
  return null;
};
const RES_DAY = {
  nora(st, t, d, door) {
    if (t < 330) return null;
    if (t < 540) return zoneOpen('lago', st) ? VA(67, 31, 2, 'fish') : VA(30, 41, 0, 'fish');
    if (t < 720) return VA(door[0], door[1], 0, 'bake', 1);
    if (t < 780) return null;
    if (t < 1020) return zoneOpen('lago', st) && d % 2 ? VA(80, 24, 0, 'fish') : VA(52, 41, 0, 'fish');
    if (t < 1140) return VA(42, 23, 2, 'bench');
    return null;
  },
  bruno(st, t, d, door) {
    if (t < 420) return null;
    const m = builtOf(st, 'mulino');
    if (t < 720) return m ? VA(m[0], m[1], 3, 'idle', 1) : VA(door[0], door[1], 0, 'bake', 1);
    if (t < 780) return VA(45, 22, 0, 'idle', 1);
    if (t < 900) return VA(48, 21, 1, 'deliver');
    if (t < 1080) return m ? VA(m[0], m[1], 3, 'idle', 1) : VA(door[0], door[1], 0, 'bake', 1);
    if (t < 1170) return VA(47, 41, 0, 'bench');
    return null;
  },
  lia(st, t, d, door) {
    if (t < 450) return null;
    if (t < 720) return VA(26, 21, 0, 'flowers', 3);
    if (t < 780) return VA(44, 18, 0, 'idle', 2);
    const a = builtOf(st, 'aiuola');
    if (t < 1020) return a ? VA(a[0], a[1], 3, 'garden', 1) : VA(41, 13, 0, 'garden', 1);
    if (d === 5 && t >= 1140 && t < 1290) return VA(45, 21, 0, 'dance', 1);
    if (t < 1140) return VA(door[0], door[1], 0, 'idle', 1);
    return null;
  },
  teo(st, t, d, door) {
    if (t < 420) return null;
    if (t < 720) return zoneOpen('collina', st) ? VA(92, 15, 3, 'mine') : VA(33, 6, 3, 'mine');
    if (t < 780) return VA(46, 22, 0, 'idle', 1);
    if (t < 1020) return zoneOpen('collina', st) ? VA(86, 10, 0, 'mine', 1) : VA(34, 6, 3, 'mine');
    if (t < 1200) return VA(47, 41, 0, 'bench');
    return null;
  },
  mirta(st, t, d, door) {
    if (t < 360) return null;
    if (t < 600) {
      const p = cyc(t, 360, 40, [
        [5, 20],
        [5, 30],
        [6, 38],
        [20, 39],
        [5, 12]
      ]);
      return VA(p[0], p[1], 0, 'garden');
    }
    if (t < 720) return VA(door[0], door[1], 0, 'bake', 1);
    if (t < 840) return null;
    if (t < 1020) return VA(20, 38, 0, 'garden', 2);
    if (t < 1110) return VA(42, 13, 3, 'pray');
    return null;
  },
  silvio(st, t, d, door) {
    if (t < 450) return null;
    if (t < 720) return VA(door[0] + 1, door[1], 0, 'chopwood');
    if (t < 780) return VA(44, 22, 0, 'idle', 1);
    if (t < 1020) {
      const K = Object.keys(st.free.built);
      if (K.length) {
        const k = K[Math.floor(t / 45 + st.day) % K.length].split(',').map(Number);
        return VA(k[0], k[1] + 1, 3, 'watch', 1);
      }
      return VA(door[0], door[1], 0, 'chopwood');
    }
    if (t < 1140) return VA(42, 23, 2, 'bench');
    return null;
  },
  ada(st, t, d, door) {
    if (t < 540) return null;
    const S = [
        [44, 24, 3],
        [20, 40, 0],
        zoneOpen('lago', st) ? [64, 28, 2] : [50, 24, 0],
        zoneOpen('collina', st) ? [86, 9, 0] : [28, 6, 0]
      ],
      s = S[d % S.length];
    if (t < 720) return VA(s[0], s[1], s[2], 'paint');
    if (t < 780) return VA(45, 18, 0, 'idle', 2);
    if (t < 1080) return VA(s[0], s[1], s[2], 'paint');
    if (t < 1230) return VA(43, 23, 0, 'stargaze');
    return null;
  },
  gaspare(st, t, d, door) {
    if (t < 480) return null;
    const a = builtOf(st, 'apiario');
    if (t < 720) return a ? VA(a[0], a[1], 3, 'garden', 1) : VA(22, 20, 0, 'garden', 2);
    if (t < 780) return VA(46, 22, 0, 'idle', 1);
    if (t < 1020) return VA(24, 26, 0, 'flowers', 3);
    if (t < 1140) return VA(47, 41, 0, 'bench');
    return null;
  }
};
for (const R of RES_POOL) {
  const orig = SCHED[R.id];
  SCHED[R.id] = function (st) {
    const base = orig(st);
    if (!base || !isFree(st) || G.visit) return base;
    const r = resOf(R.id, st),
      door = r && resDoor(r, st);
    if (!door || !RES_DAY[R.id]) return base;
    let x = RES_DAY[R.id](st, st.time, WD(st), door);
    if (x === undefined) return base;
    if (x && rainyV(st) && LEISURE.has(x.act)) x = VA(door[0], door[1], 0, 'idle', 1);
    return x;
  };
}
Object.assign(ACTD, { paint: 'dipinge', mine: 'scava', watch: 'guarda', deliver: 'consegna' });
// cavalletto del pittore e polvere del minatore
{
  const _dv = drawVita;
  drawVita = function (m) {
    _dv(m);
    if (m.id !== 'main') return;
    for (const n of G.npcs) {
      if (n.hidden || n.map !== 'main' || n.moving) continue;
      const X = Math.round(n.x),
        Y = Math.round(n.y);
      if (n.act === 'paint') {
        const ex = X + (n.dir === 1 ? -12 : 12);
        ctx.fillStyle = '#6a4428';
        ctx.fillRect(ex - 1, Y - 22, 2, 22);
        ctx.fillRect(ex - 6, Y - 2, 12, 2);
        ctx.fillStyle = '#efe2c2';
        ctx.fillRect(ex - 6, Y - 24, 12, 10);
        ctx.fillStyle = ['#5a8ad8', '#d8a83a', '#5aa84a'][Math.floor(n.x) % 3];
        ctx.fillRect(ex - 4, Y - 21, 8, 4);
      }
      if (n.act === 'mine' && Math.random() < 0.04) {
        burst('dust', X + (n.dir === 1 ? -8 : 8), Y - 6, 4, '#a8a59a');
      }
    }
  };
}

// ---------- si accorgono di te ----------
function contesto(st) {
  const L = [],
    t = st.time,
    p = G.player;
  if (st.energy < 25) L.push('Hai una faccia stanca, {n}. Mangia qualcosa, o vai a dormire.');
  if (t >= 23 * 60) L.push("È tardi, {n}. A quest'ora escono le Ombre.");
  let dry = 0,
    ripe = 0;
  for (const k in st.farm) {
    const f = st.farm[k];
    if (f.c && !f.c.dead) {
      if (cropStage(f.c) === 3) ripe++;
      else if (!f.w) dry++;
    }
  }
  if (dry >= 3 && t >= 720 && st.weather !== 'pioggia')
    L.push(`Le tue piante hanno sete: ne ho contate ${dry} all'asciutto.`);
  if (ripe >= 3) L.push('Hai roba matura nei campi! Raccogli, prima che arrivino i corvi.');
  if ((st.mailbox || []).length) L.push("C'è qualcosa nella tua cassetta delle spedizioni, sai?");
  if (st.inv.every(Boolean)) L.push('Hai lo zaino pieno. Una cassa vicino a casa aiuta.');
  try {
    const q = incToday(st).find(q => !q.claimed && incProg(st, q)[0] >= incProg(st, q)[1]);
    if (q) L.push(`Alla bacheca c'è un incarico che puoi già chiudere: «${incText(q)}».`);
  } catch (e) {}
  if (st.money < 40) L.push('Soldi pochi, eh? Porta qualcosa alla cassetta delle spedizioni.');
  if (st.free.letNew) L.push('Ottavio dice che hai lettere nuove al ponte.');
  return L;
}
{
  const _sa = saluto;
  saluto = function (n) {
    const st = G.st,
      C = contesto(st);
    if (C.length && Math.random() < 0.55) return C[Math.floor(Math.random() * C.length)];
    const H = indizi(st);
    if (H.length && Math.random() < 0.25) return 'Psst… ' + H[Math.floor(Math.random() * H.length)];
    return _sa(n);
  };
}

// ---------- i sussurri: indizi su quello che ti manca ----------
const EGG_HINTS = {
  incisione: "Sul grande albero vicino al fiume, a est, c'è un nome inciso. E un cuore.",
  sassi: "A nord-ovest, dietro un masso, c'è un cerchio di sassi. Non contarli.",
  zucca: 'Tobia nasconde biglietti nelle zucche. Una, vicino a casa tua.',
  bottiglia: "Nell'erba alta, giù vicino al fiume, c'è una bottiglia strana. Leggera come l'aria.",
  pozzo: 'Dopo le dieci di sera, affacciati al pozzo della piazza. Ascolta.',
  moneta: 'Nei campi del nonno, zappando, qualcuno ha trovato una moneta che non esiste.',
  gatto: 'Il gatto nero, di notte, ha gli occhi di un altro colore. Accarezzalo e guarda.',
  tredici: 'Teo dice di non contare i piani della miniera. Soprattutto il tredici.',
  stivale: 'Pescando, a volte, si tirano su cose che non sono pesci.',
  spaventa: 'Dopo mezzanotte, lo spaventapasseri non guarda la strada.',
  stelle: 'Di notte, dalla torre sulla Collina, le costellazioni non sono quelle dei libri.',
  codice:
    'Un vecchio forestiero diceva sempre: su, su, giù, giù, sinistra, destra, sinistra, destra… e poi due lettere.',
  omonimo: 'Ezekiel non guarda negli occhi chi porta il nome del nonno.'
};
const RIC_HINTS = {
  inverno: "D'inverno, dopo mezzanotte, sulla tomba senza nome c'è una candela. Nessuno sa chi la accende.",
  primavera: "In primavera, all'alba, sul pontile del Lago galleggia una barchetta di carta.",
  estate: "D'estate, tra le nove e le undici di sera, le lucciole del prato sud disegnano un numero.",
  autunno: 'In autunno, la notte del quattordici, dalla torre si contano nove costellazioni.'
};
function indizi(st) {
  if (!isFree(st)) return [];
  const H = [],
    F = st.free,
    fl = st.flags;
  if (!fl.nove) {
    const R = F.ricordi || {},
      n = Object.keys(R).length;
    H.push('Al Conteggio contavano otto. Ma a tavola, i posti erano nove.');
    for (const k in RIC_HINTS) if (!R[k]) H.push(RIC_HINTS[k]);
    if (n >= 4) H.push('Hai i quattro ricordi? Allora il pozzo, a mezzanotte. Conta fino a nove.');
    const g = (GOSSIP_NOVE || [])[0];
    if (g)
      H.push(
        `Dicono che nel villaggio di ${g} abbiano visto una bambina con i capelli bianchi. Di notte, al cimitero.`
      );
  }
  for (const id in EGG_HINTS) if (!fl['egg_' + id]) H.push(EGG_HINTS[id]);
  if (!zoneOpen('collina', st))
    H.push(
      "Ezekiel dice che il cancello a est si apre quando il villaggio diventa Borgo. Guarda il tuo rango, sotto l'orologio."
    );
  else if (!(F.mine && F.mine.deep))
    H.push("Sulla Collina, oltre la torre, c'è l'imbocco della miniera vecchia. Teo ci va ogni mattina.");
  if (zoneOpen('collina', st) && !zoneOpen('lago', st))
    H.push('Al Lago ci vuole un villaggio grande: un Paese. Dicono che i pesci, là, siano enormi.');
  try {
    const miss = [];
    for (const c in COLL) for (const id of COLL[c].l()) if (!(F.museo || {})[id]) miss.push(id);
    if (miss.length) {
      const id = miss[Math.floor(st.day + miss.length) % miss.length];
      H.push(`Irene cerca ancora ${ITEMS[id].n.toLowerCase()} per il museo.`);
    }
  } catch (e) {}
  const fr = st.mpFriends || [];
  if (!fr.length)
    H.push(
      "Al ponte c'è l'albo di tutti i villaggi. Fatti degli amici: la Valle è più grande di quanto pensi."
    );
  else if (!fr.some(f => f.coop))
    H.push('Sai che un amico può costruire nel tuo villaggio? Al ponte, il bottone col martello.');
  if (!st.flags.mpVisited)
    H.push(
      'Non sei mai andat{o|a} a trovare nessuno? Dal ponte si visitano gli altri villaggi, e si annaffiano i loro campi.'
    );
  return H;
}
let GOSSIP_NOVE = [];
{
  const _gl = gossipLoad;
  gossipLoad = async function () {
    const was = GOSSIP_T;
    await _gl();
    if (GOSSIP_T === was || !NET.ok) return;
    try {
      const me = (G.visit ? G.home : G.st).pid;
      GOSSIP_NOVE = (await MP.list(60)).filter(v => v.nove && v.pid !== me).map(v => v.name);
    } catch (e) {}
  };
}
{
  const _pub = MP.publish.bind(MP);
  MP.publish = async function (st) {
    await _pub(st);
    if (!NET.ok || !st || !st.pid || !isFree(st) || !st.flags.nove) return;
    try {
      await NET.api.set(NET.r('villaggi/' + st.pid + '/nove'), true);
    } catch (e) {}
  };
}
// le coppie che sussurrano: quando passi vicino, si dicono un indizio che ti manca
const SUSS = ['agatha', 'clara', 'tobia', 'ezekiel', 'lucius', 'brom'];
{
  const _cp = chatPool;
  chatPool = function () {
    const L = _cp(),
      st = G.st;
    if (!isFree(st) || G.visit) return L;
    const H = indizi(st);
    if (!H.length) return L;
    const ids = SUSS.concat(residents(st).map(r => r.id)),
      W = [];
    for (let i = 0; i < ids.length; i++)
      for (let j = 0; j < ids.length; j++) {
        if (i === j) continue;
        const h = H[(i * 7 + j * 3 + st.day) % H.length],
          b = NAMES[ids[j]] ? NAMES[ids[j]].split(' ')[0] : '';
        W.push([
          ids[i],
          ids[j],
          [
            [ids[i], `Psst… ${b}, vieni qui. Sai una cosa?`],
            [ids[j], '(sottovoce) ' + h]
          ]
        ]);
      }
    return L.concat(W, W);
  };
} // i sussurri pesano il doppio delle chiacchiere normali
// quello che senti finisce nel diario
{
  const _bu = bubble;
  bubble = function (n, t, life) {
    _bu(n, t, life);
    const st = G.st;
    if (!st || !isFree(st) || G.visit) return;
    const s = String(t);
    if (!/^\(sottovoce\) |^Psst… (?!.*vieni qui)/.test(s)) return;
    const h = s.replace(/^\(sottovoce\) |^Psst… /, '');
    const F = st.free;
    F.sussurri = F.sussurri || [];
    if (!F.sussurri.includes(h)) {
      F.sussurri.push(h);
      if (F.sussurri.length > 60) F.sussurri.shift();
      if (Math.hypot(n.x - G.player.x, n.y - G.player.y) < 90)
        UI.toast('👂 Hai sentito un sussurro. È nel diario: ☰ → Traguardi.');
    }
  };
}
{
  const _th = tragHTML;
  tragHTML = function (st) {
    const S = (st.free.sussurri || []).slice().reverse();
    return (
      _th(st) +
      `<h3>Sussurri sentiti (${S.length})</h3>` +
      (S.length
        ? S.map(s => `<p class="small">👂 ${esc(fmt(s))}</p>`).join('')
        : '<p class="small">Passa vicino a due abitanti che parlano piano: a volte si lasciano scappare qualcosa.</p>')
    );
  };
}
GUIDES.push({
  id: 'vita2',
  v: 12,
  n: 'Abitanti più svegli',
  steps: [
    {
      t: "Adesso tutti hanno giornate vere: Tobia, i nuovi abitanti (Nora pesca all'alba, Teo scava, Ada dipinge in giro, Silvio viene a vedere le tue costruzioni…) e anche io, col giro della posta la mattina."
    },
    {
      t: 'Gli abitanti si accorgono di te: se sei stanco, se le piante hanno sete, se hai roba matura, posta nella cassetta o un incarico pronto.'
    },
    {
      t: 'E sussurrano. Quando passi vicino a due che parlano piano, ascolta: si lasciano scappare indizi su quello che non hai ancora trovato. Li ritrovi in ☰ → Traguardi → Sussurri sentiti.'
    }
  ]
});
