'use strict';
// ================= SVAGO: il tempo libero con gli abitanti (gioco libero) =================
// Gli abitanti hanno già le loro giornate (vita.js): pescano, prendono il tè, leggono, spaccano legna, guardano le
// stelle, fanno il picnic, ballano, curano l'orto, stanno in panchina. Qui ci si può UNIRE a loro: davanti a chi
// sta facendo una di queste cose, il tasto azione dice «Unisciti» e si fa insieme.
//   · panchina  → seduti accanto: il tempo passa, si chiacchiera, si riprende fiato;
//   · tè        → una tazza calda e due domande: ognuno apprezza un modo di rispondere (dolce, buffo, curioso);
//   · pesca     → tre lanci a testa con la sua canna: si tira quando compare il «!», poi si confronta il bottino;
//   · lettura   → un racconto a puntate, una puntata al giorno (Ezekiel e Lucius hanno il loro);
//   · legna     → colpi a tempo sul segno verde: metà della legna è tua;
//   · stelle    → di notte, le costellazioni della Valle e le loro leggende (e a volte una stella cadente);
//   · picnic    → si divide un piatto (i gusti contano) o si assaggia il suo;
//   · ballo     → un passo quando il cerchio si chiude;
//   · orto      → erbacce a tempo, e in cambio semi di stagione.
// Poi le cose che succedono in paese:
//   · il FALÒ della sera: il venerdì dalle 20 e il sabato dopo il ballo, in piazza; chi c'è si siede intorno al
//     fuoco: storie (di paura, buffe, ricordi), la tua storia, castagne sulle braci, una canzone, il silenzio;
//   · la CORSA COI SACCHI: il 9 e il 23 di ogni stagione, alle 18 (prima ci sono le visite alle fattorie), la organizza Agatha; si salta a ritmo (chi salta
//     troppo presto inciampa), Ezekiel aspetta all'arrivo; premi per il podio.
// E da soli: sedersi a pensare sulle panchine, i sassi piatti sull'acqua (a mani vuote, davanti al fiume).
// I testi stanno in svago_testi.js (SV_T). Quello che resta nel salvataggio sta in st.free.svago.

const SVAGO = {
  gioco: null,
  busy: false,
  falo: { o: null, m: null, luce: null },
  sasso: null,
  sassoT: 0,
  tick: 0
};

// ---------- stato e utilità ----------
function svSt() {
  const st = G.st,
    F = st.free;
  const S = (F.svago = F.svago || {});
  if (S.day !== st.day) {
    S.day = st.day;
    S.oggi = {};
    S.falo = 0;
  }
  S.oggi = S.oggi || {};
  S.letture = S.letture || {};
  S.visti = S.visti || {};
  S.rec = S.rec || {};
  S.corse = S.corse || {};
  return S;
}
const svQui = () => isFree(G.st) && !G.visit && G.st.free;
const svCaso = L => L[Math.floor(Math.random() * L.length)];
const svDi = (cat, id) => (SV_T[cat] && (SV_T[cat][id] || SV_T[cat]._)) || [];
const svRiga = (cat, id) => svCaso(svDi(cat, id)) || '…';
// un elemento non ancora visto (per chiave); finiti tutti si ricomincia
function svNuovo(chiave, L) {
  if (!L || !L.length) return null;
  const S = svSt(),
    V = (S.visti[chiave] = S.visti[chiave] || []);
  let liberi = L.map((_, i) => i).filter(i => !V.includes(i));
  if (!liberi.length) {
    V.length = 0;
    liberi = L.map((_, i) => i);
  }
  const i = svCaso(liberi);
  V.push(i);
  return L[i];
}
// l'amicizia cresce una volta al giorno per abitante e per attività
function svAmico(id, n, tipo) {
  const S = svSt(),
    k = id + ':' + tipo;
  if (S.oggi[k]) return false;
  S.oggi[k] = 1;
  addFriend(id, n);
  const c = NPC(id);
  if (c) floatText(n > 1 ? '♥♥' : '♥', c.x, c.y - 32, '#ff7a6a');
  return true;
}
function svEnergia(n) {
  const st = G.st;
  st.energy = Math.max(0, Math.min(100, st.energy + n));
  if (n > 0) floatText('+' + n + ' ⚡', G.player.x, G.player.y - 34, '#bff0a0');
  UI.hud();
}
// il tempo passa (senza dissolvenza: si resta nella scena)
function svPassa(min) {
  const st = G.st,
    fino = Math.min(st.time + min, 23 * 60 + 50);
  while (st.time < fino) {
    st.time++;
    onMinute();
  }
  UI.hud();
}
async function svPassaBuio(min) {
  await UI.fade(1, 350);
  svPassa(min);
  await sleep(150);
  await UI.fade(0, 450);
}
const svVerso = (a, b) => {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
};
function svLibera(m, x, y) {
  if (!m.inb(x, y) || m.solid(x, y) || m.get(x, y) === 3) return false;
  const o = m.objAt(x, y);
  if (o && !o.deco) return false;
  return !G.npcs.some(q => !q.hidden && q.map === m.id && ptile(q)[0] === x && ptile(q)[1] === y);
}
// mettere il giocatore accanto all'abitante: «lato» (stessa direzione: pesca, stelle, panchina, ballo) o «fronte»
function svAccanto(n, modo) {
  const m = G.map,
    p = G.player,
    [nx, ny] = ptile(n),
    d = n.dir || 0,
    [dx, dy] = DIRV[d],
    opp = [3, 2, 1, 0][d],
    lati =
      d === 0 || d === 3
        ? [
            [nx + 1, ny, d],
            [nx - 1, ny, d]
          ]
        : [
            [nx, ny + 1, d],
            [nx, ny - 1, d]
          ];
  const C = modo === 'fronte' ? [[nx + dx, ny + dy, opp], ...lati] : [...lati, [nx + dx, ny + dy, opp]];
  for (const [x, y, f] of C)
    if (svLibera(m, x, y)) {
      setPos(p, x, y, f);
      if (modo === 'fronte') n.dir = svVerso(n, p);
      return true;
    }
  p.dir = svVerso(p, n);
  return false;
}
async function svVicino(n, modo) {
  await UI.fade(1, 250);
  svAccanto(n, modo);
  G.player.moving = false;
  await UI.fade(0, 300);
}
// una scena con un abitante: lui resta fermo dov'è, il gioco aspetta
async function svScena(n, fn) {
  if (SVAGO.busy || (n && n.script)) return; // già in un'altra scena (una visita, una festa): non la si ruba
  SVAGO.busy = true;
  G.cut++;
  if (n) {
    n.script = true;
    n.path = [];
    n.moving = false;
  }
  try {
    await fn();
  } catch (e) {
    segnala(e, 'svago');
  } finally {
    if (n) {
      n.script = false;
      n.goal = null;
    }
    G.cut--;
    SVAGO.busy = false;
    UI.hud();
    UI.hotbar();
  }
}
// ---------- i giochi a tempo ----------
// Un gioco prende il tasto azione (che altrimenti farebbe agire il giocatore) e ferma il passo; muoversi lo
// interrompe (tranne la corsa). g: { premi(), passo(dt), mondo(), hud(), esci }
function svGioco(g) {
  return new Promise(res => {
    const c = G.cut;
    G.cut = 0; // il tasto azione arriva solo se non c'è una scena in corso
    g.t = 0;
    g.map = G.map.id;
    g.fine = r => {
      if (SVAGO.gioco !== g) return;
      SVAGO.gioco = null;
      G.cut = c;
      res(r);
    };
    SVAGO.gioco = g;
  });
}
Ext.avvolgi('updatePlayer', function (prossimo, dt) {
  const g = SVAGO.gioco;
  if (!g) return prossimo(dt);
  const p = G.player;
  p.moving = false;
  if (UI.busy()) return; // un dialogo (Ottavio, un abitante che passa): il gioco aspetta
  if (G.mode !== 'game' || !G.map || G.map.id !== g.map) return g.fine(g.ris ? g.ris(true) : null);
  const premuto = IN.takeAct();
  if (g.esci !== false && Math.hypot(IN.mx(), IN.my()) > 0.6) return g.fine(g.ris ? g.ris(true) : null);
  g.t += dt;
  if (premuto && g.premi) g.premi();
  if (SVAGO.gioco === g && g.passo) g.passo(dt);
});
// durante un gioco niente fumetto delle azioni (copre chi gioca, e il tasto azione serve al gioco)
Ext.avvolgi('promptInfo', function (prossimo, ...a) {
  return SVAGO.gioco ? null : prossimo(...a);
});
Ext.on('listaMondo', (L, m) => {
  if (SVAGO.gioco && SVAGO.gioco.lista && G.map === m) SVAGO.gioco.lista(L);
});
Ext.on('drawWorldExtras', m => {
  if (SVAGO.gioco && SVAGO.gioco.mondo && G.map === m) SVAGO.gioco.mondo();
  svSassoDisegna(m);
});
Ext.on('drawAmbTop', m => {
  if (SVAGO.gioco && SVAGO.gioco.hud && G.map === m) SVAGO.gioco.hud();
});
// linee a pixel (la lenza, la canna)
function svLinea(x0, y0, x1, y1, col) {
  ctx.fillStyle = col;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0;
  for (let i = 0; i <= n; i++) {
    const k = n ? i / n : 0;
    ctx.fillRect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), 1, 1);
  }
}
function svTesto(t, x, y, col, big) {
  ctx.save();
  ctx.font = (big ? '16px' : '8px') + ' "Silkscreen","Pixelify Sans",monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(20,12,8,.85)';
  ctx.fillText(t, Math.round(x) + 1, Math.round(y) + 1);
  ctx.fillStyle = col || '#fff2c0';
  ctx.fillText(t, Math.round(x), Math.round(y));
  ctx.restore();
}
const svTri = x => 1 - Math.abs(1 - 2 * (x - Math.floor(x)));
// la barra: un cursore va avanti e indietro, si preme quando è sul segno verde
function svBarra({ N = 5, periodo = 1.3, largo = 0.24, onColpo, testo }) {
  const g = {
    N,
    i: 0,
    ok: 0,
    tt: Math.random(),
    pausa: 0.5,
    c: 0.5,
    lampo: null,
    nuovo() {
      g.c = 0.2 + Math.random() * 0.6;
      g.tt = Math.random();
    },
    premi() {
      if (g.pausa > 0 || g.i >= g.N) return;
      const k = svTri(g.tt / periodo),
        hit = Math.abs(k - g.c) <= largo / 2;
      if (hit) g.ok++;
      g.i++;
      g.lampo = { hit, t: 0.5, k };
      g.pausa = 0.7;
      if (onColpo) onColpo(hit, g);
    },
    passo(dt) {
      g.tt += dt;
      if (g.lampo) g.lampo.t -= dt;
      if (g.pausa > 0) {
        g.pausa -= dt;
        if (g.pausa <= 0) {
          if (g.i >= g.N) return g.fine(g.ris());
          g.nuovo();
        }
      }
    },
    ris: via => ({ ok: g.ok, N: g.N, fatti: g.i, via: !!via }),
    hud() {
      const p = G.player,
        W = 52,
        X = Math.round(p.x - W / 2),
        Y = Math.round(p.y + 10); // sotto i piedi: sopra la testa ci sono i fumetti
      ctx.fillStyle = 'rgba(20,12,8,.85)';
      ctx.fillRect(X - 2, Y - 2, W + 4, 10);
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(X, Y, W, 6);
      ctx.fillStyle = '#6ec860';
      ctx.fillRect(Math.round(X + (g.c - largo / 2) * W), Y, Math.max(2, Math.round(largo * W)), 6);
      const k = g.pausa > 0 && g.lampo ? g.lampo.k || svTri(g.tt / periodo) : svTri(g.tt / periodo);
      ctx.fillStyle = '#fff6d8';
      ctx.fillRect(Math.round(X + k * W) - 1, Y - 2, 2, 10);
      for (let i = 0; i < g.N; i++) {
        ctx.fillStyle = i < g.i ? '#f6d98a' : '#5a4a3a';
        ctx.fillRect(X + i * 6, Y + 10, 4, 3);
      }
      if (testo) svTesto(testo, p.x, Y + 22);
      if (g.lampo && g.lampo.t > 0)
        svTesto(g.lampo.hit ? '✓' : '✗', p.x + W / 2 + 8, Y + 6, g.lampo.hit ? '#9ef08a' : '#ff9a8a');
    }
  };
  return g;
}

// ---------- unirsi a un abitante ----------
const SV_ATT = {
  bench: { fum: 'Siediti accanto', fn: n => svPanchina(n) },
  tea: { fum: 'Prendi il tè', fn: n => svTe(n) },
  fish: { fum: 'Pesca insieme', fn: n => svPesca(n) },
  read: { fum: 'Ascolta', fn: n => svLettura(n) },
  chopwood: { fum: 'Aiuta', fn: n => svLegna(n) },
  stargaze: { fum: 'Guarda le stelle', fn: n => svStelle(n) },
  picnic: { fum: 'Unisciti', fn: n => svPicnic(n) },
  dance: { fum: 'Balla', fn: n => svBallo(n) },
  garden: { fum: 'Aiuta', fn: n => svOrto(n) },
  falo: { fum: 'Siediti al falò', fn: () => svFalo() },
  corsa_org: { fum: 'Corsa coi sacchi', fn: n => svCorsaIscrivi(n) },
  corsa: { fum: 'Parla', fn: n => svCorsaChiacchiera(n) }
};
function svAttDi(n) {
  const a = SV_ATT[n.act];
  if (!a) return null;
  if (n.moving || (n.path && n.path.length)) return null; // prima arriva, poi ci si unisce
  return a;
}
Ext.on('mira', (C, ax, ay, m) => {
  if (!svQui() || m.id !== 'main' || SVAGO.busy || SVAGO.gioco) return;
  for (const n of G.npcs) {
    if (n.hidden || n.map !== m.id || n.script) continue;
    const a = svAttDi(n);
    if (!a) continue;
    const d = Math.hypot(n.x - ax, n.y - ay);
    if (d >= 20) continue;
    // vince sulla «Parla» dello stesso abitante (che ha d ≥ -3): parlare resta una scelta del menu
    C.push({
      k: 'ext',
      d: Math.min(d, 6) - 4,
      act: () => a.fn(n),
      fumetto: () => ({ x: n.x, y: n.y - 31, t: a.fum })
    });
  }
});
// la prima domanda: unirsi, o parlare come sempre
async function svChiedi(n, invito, lab) {
  const c = await ask(n.id, invito, [lab, 'Parla e basta', 'Niente']);
  if (c === 1) {
    n.script = false;
    G.cut--;
    try {
      await talkTo(n);
    } finally {
      G.cut++;
      n.script = true;
    }
  }
  return c === 0;
}

// ---------- la panchina ----------
async function svPanchina(n) {
  await svScena(n, async () => {
    if (
      !(await svChiedi(
        n,
        svCaso(['Siediti, c’è posto.', 'Vieni, siediti un momento.', 'Mh. Siediti.']),
        'Siediti accanto'
      ))
    )
      return;
    await svVicino(n, 'lato');
    G.player.dir = n.dir;
    await say(n.id, svNuovo('panchina:' + n.id, svDi('panchina', n.id)));
    svPassa(20);
    svEnergia(5);
    for (let giro = 0; giro < 2; giro++) {
      const c = await ask(null, 'Il tempo passa piano.', ['Resta ancora un po’', 'Alzati']);
      if (c !== 0) break;
      svPassa(20);
      svEnergia(4);
      let t = svNuovo('panchina:' + n.id, svDi('panchina', n.id));
      if (giro === 1 && typeof Chiacchiera !== 'undefined') t = Chiacchiera.novita(n.id) || t;
      await say(n.id, t);
    }
    svAmico(n.id, 1, 'panchina');
  });
}

// ---------- il tè ----------
async function svTe(n) {
  await svScena(n, async () => {
    if (!(await svChiedi(n, 'Una tazza anche per te? C’è ancora acqua calda.', 'Prendi il tè insieme')))
      return;
    await svVicino(n, 'fronte');
    await say(n.id, svRiga('teIntro', n.id));
    svEnergia(8);
    const L = svDi('te', n.id),
      piace = SV_T.gusti[n.id];
    let colpiti = 0;
    for (let giro = 0; giro < 2; giro++) {
      const D = svNuovo('te:' + n.id, L);
      if (!D) break;
      const c = await ask(
        n.id,
        D.q,
        D.r.map(r => r[0])
      );
      const r = D.r[c] || D.r[0];
      await say(n.id, r[2]);
      if (r[1] === piace) {
        colpiti++;
        floatText('♥', n.x, n.y - 32, '#ff7a6a');
        AU.play('ok');
      }
    }
    svPassa(30);
    svAmico(n.id, 1 + colpiti, 'te');
    if (colpiti === 2)
      UI.toast(`A ${NAMES[n.id] || n.id} piace il tuo modo di rispondere: l’amicizia cresce di più.`);
  });
}

// ---------- la pesca insieme ----------
// il galleggiante: la prima acqua davanti (fino a 4 caselle), o due caselle avanti
function svGalla(e) {
  const m = G.maps.main,
    [x, y] = ptile(e),
    [dx, dy] = DIRV[e.dir || 0];
  for (let k = 1; k <= 4; k++)
    if (m.inb(x + dx * k, y + dy * k) && m.get(x + dx * k, y + dy * k) === 3)
      return { x: (x + dx * k) * 16 + 8, y: (y + dy * k) * 16 + 8, acqua: 1, tx: x + dx * k, ty: y + dy * k };
  return { x: (x + dx * 2) * 16 + 8, y: (y + dy * 2) * 16 + 8, acqua: 0, tx: x + dx * 2, ty: y + dy * 2 };
}
async function svPesca(n) {
  await svScena(n, async () => {
    if (!(await svChiedi(n, 'C’è posto sulla riva. Peschi con me?', 'Pesca insieme'))) return;
    if (G.st.energy <= 0) return void UI.toast('Sei esaust{o|a}. Vai a dormire.', 'bad');
    await svVicino(n, 'lato');
    G.player.dir = n.dir;
    await say(n.id, svCaso(SV_T.pesca.inizio[n.id] || SV_T.pesca.inizio._));
    useEnergy(2);
    UI.toast('Premi A quando sul galleggiante compare il «!». Muoviti per smettere.');
    const p = G.player,
      bob = svGalla(p),
      nbob = svGalla(n),
      dove = typeof zoneAt === 'function' && zoneAt(bob.tx, bob.ty) === 'lago' ? 'lago' : 'fiume';
    const tuo = SV_T.pesca.tuo[n.id] || SV_T.pesca.tuo._,
      suo = SV_T.pesca.suo[n.id] || SV_T.pesca.suo._;
    const g = {
      N: 3,
      i: 0,
      fase: 'lancio',
      tt: 0,
      nt: 0,
      presi: [],
      suoi: [],
      lampo: null,
      nuovo() {
        g.fase = 'attesa';
        g.tt = 0;
        g.attesa = 1.3 + Math.random() * 2.7;
        g.nt = 0;
        g.nT = 1 + Math.random() * 3.5;
        g.nFatto = false;
        AU.play('water');
      },
      dopo(t, col) {
        g.i++;
        g.fase = 'pausa';
        g.tt = 0;
        if (t) g.lampo = { t, col, life: 1.2 };
      },
      premi() {
        if (g.fase === 'abbocca') {
          const id = fishPick(dove);
          g.presi.push(id);
          if (!addItem(id, 1)) riponi(id, 1);
          addXP('racc', id === 'salmerino' ? 30 : 6);
          G.st.free.fished = (G.st.free.fished || 0) + 1;
          AU.play('ok');
          bubble(n, svCaso(tuo), 2);
          g.dopo(ITEMS[id].n + '!', id === 'salmerino' ? '#ffd84a' : '#bfe3ff');
        } else if (g.fase === 'attesa') {
          AU.play('err');
          g.dopo('Troppo presto!', '#ffb0a0');
        }
      },
      passo(dt) {
        g.tt += dt;
        g.nt += dt;
        if (g.lampo) g.lampo.life -= dt;
        if (g.fase === 'lancio' && g.tt > 0.4) g.nuovo();
        else if (g.fase === 'attesa' && g.tt >= g.attesa) {
          g.fase = 'abbocca';
          g.tt = 0;
          AU.play('pop');
        } else if (g.fase === 'abbocca' && g.tt > 0.7) {
          AU.play('water');
          g.dopo('Scappato…', '#c8c0b0');
        } else if (g.fase === 'pausa' && g.tt > 1.1) {
          if (g.i >= g.N) return g.fine(g.ris());
          g.nuovo();
        }
        if (!g.nFatto && g.fase !== 'lancio' && g.nt >= g.nT) {
          g.nFatto = true;
          if (Math.random() < 0.55) {
            const id = fishPick(dove);
            g.suoi.push(id);
            bubble(n, svCaso(suo) + ' ' + ITEMS[id].n + '.', 2);
            burst('spark', nbob.x, nbob.y, 4, '#bfe3ff');
          }
        }
      },
      ris: () => ({ presi: g.presi, suoi: g.suoi }),
      mondo() {
        const d = p.dir,
          [dx, dy] = DIRV[d],
          hx = p.x + dx * 4,
          hy = p.y - 10,
          tx = p.x + dx * 12,
          ty = p.y - 20 + dy * 4;
        svLinea(hx, hy, tx, ty, '#6a4a2a');
        const dip = g.fase === 'abbocca' ? 2 + Math.round(Math.sin(G.t * 30)) : Math.round(Math.sin(G.t * 3));
        svLinea(tx, ty, bob.x, bob.y + dip - 2, 'rgba(230,230,220,.7)');
        ctx.fillStyle = '#e8e2d0';
        ctx.fillRect(Math.round(bob.x) - 1, Math.round(bob.y) + dip - 3, 3, 2);
        ctx.fillStyle = '#d0342a';
        ctx.fillRect(Math.round(bob.x) - 1, Math.round(bob.y) + dip - 1, 3, 2);
        if (g.fase === 'abbocca') {
          ctx.strokeStyle = 'rgba(220,240,255,.6)';
          ctx.beginPath();
          ctx.arc(bob.x, bob.y + 1, 4 + ((g.tt * 14) % 6), 0, 7);
          ctx.stroke();
        }
      },
      hud() {
        if (g.fase === 'abbocca') svTesto('!', bob.x, bob.y - 8, '#ffe14a', true);
        svTesto(`${Math.min(g.i + 1, g.N)}/${g.N}`, p.x, p.y + 12, '#f6d98a');
        if (g.lampo && g.lampo.life > 0) svTesto(g.lampo.t, p.x, p.y + 22, g.lampo.col);
      }
    };
    const r = await svGioco(g);
    if (!r) return;
    const val = L => L.reduce((a, id) => a + ((ITEMS[id] && ITEMS[id].v) || 0), 0);
    const io = r.presi.length * 1000 + val(r.presi),
      lui = r.suoi.length * 1000 + val(r.suoi);
    const k = io > lui ? 'vinci' : io < lui ? 'perdi' : 'pari';
    await say(n.id, svCaso(SV_T.pesca[k][n.id] || SV_T.pesca[k]._));
    svPassa(30);
    svAmico(n.id, k === 'vinci' ? 2 : 1, 'pesca');
  });
}

// ---------- la lettura ----------
async function svLettura(n) {
  await svScena(n, async () => {
    const R = SV_T.racconti[n.id] || SV_T.racconti._,
      S = svSt(),
      i = S.letture[n.id] || 0;
    if (S.oggi['letto:' + n.id]) {
      await say(
        n.id,
        'Per oggi basta così. Una puntata al giorno: le storie vanno aspettate, come il pane che lievita.'
      );
      return;
    }
    if (!(await svChiedi(n, `Sto leggendo «${R.t}». Vuoi sentire un pezzo?`, 'Ascolta la lettura'))) return;
    await svVicino(n, 'lato');
    if (i >= R.cap.length) {
      await say(n.id, `«${R.t}» l’abbiamo finito. Lo ricomincio da capo: le storie belle si rileggono.`);
      S.letture[n.id] = 0;
    }
    const k = S.letture[n.id] || 0,
      cap = R.cap[k];
    await narr(`«${R.t}» · puntata ${k + 1} di ${R.cap.length}`);
    for (const riga of cap) await say(n.id, riga);
    S.letture[n.id] = k + 1;
    S.oggi['letto:' + n.id] = 1;
    if (k + 1 < R.cap.length) await say(n.id, 'Il resto domani. Se vuoi.');
    svPassa(30);
    svAmico(n.id, 1, 'lettura');
  });
}

// ---------- la legna ----------
async function svLegna(n) {
  await svScena(n, async () => {
    if (!(await svChiedi(n, 'Due braccia in più fanno comodo.', 'Aiuta con la legna'))) return;
    if (G.st.energy <= 0) return void UI.toast('Sei esaust{o|a}. Vai a dormire.', 'bad');
    await svVicino(n, 'fronte');
    await say(n.id, svCaso(SV_T.legna.inizio[n.id] || SV_T.legna.inizio._));
    UI.toast('Premi A quando il cursore è sul verde. Muoviti per smettere.');
    useEnergy(3);
    const p = G.player,
      g = svBarra({
        N: 5,
        periodo: 1.15,
        largo: 0.22,
        testo: 'Spacca!',
        onColpo: hit => {
          AU.play(hit ? 'legno' : 'tonfo');
          burst('dust', p.x + DIRV[p.dir][0] * 12, p.y - 4, hit ? 6 : 2, hit ? '#c89a5a' : '#8a7a6a');
          if (Math.random() < 0.5)
            bubble(
              n,
              svCaso(SV_T.legna[hit ? 'bene' : 'male'][n.id] || SV_T.legna[hit ? 'bene' : 'male']._),
              1.4
            );
        }
      });
    const r = await svGioco(g);
    if (!r || !r.fatti) return;
    const legna = r.ok * 2 + (r.fatti >= r.N ? 2 : 0);
    if (legna) giveItem('legna', legna);
    await say(n.id, svCaso(SV_T.legna.fine[n.id] || SV_T.legna.fine._));
    svPassa(20);
    svAmico(n.id, r.ok >= 3 ? 2 : 1, 'legna');
  });
}

// ---------- le stelle ----------
async function svStelle(n) {
  await svScena(n, async () => {
    if (!(await svChiedi(n, 'Stanotte il cielo è limpido. Guardi con me?', 'Guarda le stelle'))) return;
    await svVicino(n, 'lato');
    await say(n.id, svCaso(SV_T.stelleIntro[n.id] || SV_T.stelleIntro._));
    const S = svSt(),
      giri = S.oggi['stelle:' + n.id] ? 1 : 2;
    for (let i = 0; i < giri; i++) {
      const C = svNuovo('stelle', SV_T.stelle);
      await narr(`✦ ${C.n}`);
      for (const r of C.r) await say(n.id, r);
      svPassa(15);
    }
    if (Math.random() < 0.35) {
      SVAGO.cadente = { t: G.t };
      AU.play('carillon');
      await sleep(600);
      const c = await ask(null, SV_T.stellaCadente, [
        ...SV_T.desideri.map(d => d[0]),
        'Niente: va bene così'
      ]);
      const D = SV_T.desideri[c];
      if (D) {
        G.st.free.buff = { k: D[1], fino: G.st.day * 1440 + G.st.time + 8 * 60 };
        UI.toast(`✦ Il desiderio si avvera: ${NAT_BUFF[D[1]].d}, per qualche ora.`);
      } else await say(n.id, 'Saggio. Le stelle cadenti sono più belle se non chiedi loro niente.');
    }
    svAmico(n.id, 2, 'stelle');
  });
}
// la scia della stella cadente
Ext.on('drawAmbTop', m => {
  const c = SVAGO.cadente;
  if (!c || m.id !== 'main') return;
  const k = (G.t - c.t) / 1.1;
  if (k > 1) return void (SVAGO.cadente = null);
  const x0 = G.cam.x + 40,
    y0 = G.cam.y + 20,
    x = x0 + k * 160,
    y = y0 + k * 50;
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = `rgba(255,248,220,${(1 - i / 14) * (1 - k)})`;
    ctx.fillRect(Math.round(x - i * 3), Math.round(y - i), 2, 1);
  }
});

// ---------- il picnic ----------
async function svPicnic(n) {
  await svScena(n, async () => {
    if (!(await svChiedi(n, 'C’è posto sulla coperta!', 'Unisciti al picnic'))) return;
    await svVicino(n, 'fronte');
    await say(n.id, svCaso(SV_T.picnic.inizio[n.id] || SV_T.picnic.inizio._));
    const cibi = [];
    for (const s of G.st.inv)
      if (s && ITEMS[s.id] && ITEMS[s.id].t === 'food' && !cibi.includes(s.id)) cibi.push(s.id);
    const L = cibi.slice(0, 4);
    const c = L.length
      ? await ask(null, 'Cosa metti sulla coperta?', [...L.map(id => ITEMS[id].n), 'Niente: assaggio il suo'])
      : -1;
    if (L[c]) {
      const id = L[c],
        lv = (LIKES[n.id] || {})[id] || 0;
      removeItem(id, 1);
      const k = lv >= 3 ? 'ama' : lv >= 1 ? 'piace' : 'neutro';
      await say(n.id, svCaso(SV_T.picnic[k][n.id] || SV_T.picnic[k]._));
      svEnergia(10);
      svAmico(n.id, 1 + Math.min(2, lv), 'picnic');
    } else {
      await say(n.id, svCaso(SV_T.picnic.loro[n.id] || SV_T.picnic.loro._));
      svEnergia(15);
      svAmico(n.id, 1, 'picnic');
    }
    svPassa(40);
  });
}

// ---------- il ballo ----------
async function svBallo(n) {
  await svScena(n, async () => {
    if (!(await svChiedi(n, 'Balli? Dai!', 'Balla insieme'))) return;
    await svVicino(n, 'fronte');
    await say(n.id, svCaso(SV_T.ballo.inizio[n.id] || SV_T.ballo.inizio._));
    UI.toast('Premi A quando il cerchio si chiude. Muoviti per smettere.');
    const p = G.player,
      BEAT = 0.62,
      T0 = 1.4,
      N = 12;
    const g = {
      tt: 0,
      giudizi: [],
      ultimo: null,
      battuto: -1,
      premi() {
        const j = Math.round((g.tt - T0) / BEAT);
        if (j < 0 || j >= N || g.giudizi[j]) return;
        const d = Math.abs(g.tt - (T0 + j * BEAT));
        if (d > 0.3) return;
        const v = d < 0.07 ? 'perfetto' : d < 0.16 ? 'bene' : 'mancato';
        g.giudizi[j] = v;
        g.ultimo = { v, t: 0.6 };
        if (v !== 'mancato') {
          p.dir = j % 2 ? 1 : 2;
          floatText(v === 'perfetto' ? '♪' : '♩', p.x, p.y - 30, v === 'perfetto' ? '#ffe14a' : '#f6d98a');
        }
      },
      passo(dt) {
        g.tt += dt;
        if (g.ultimo) g.ultimo.t -= dt;
        const j = Math.floor((g.tt - T0) / BEAT + 0.5);
        if (j >= 0 && j < N && j !== g.battuto && g.tt >= T0 + j * BEAT - 0.01) {
          g.battuto = j;
          AU.play('blip');
          n.dir = svVerso(n, p);
          n.anim = (n.anim || 0) + 1;
        }
        for (let k = 0; k < N; k++)
          if (!g.giudizi[k] && g.tt > T0 + k * BEAT + 0.3) {
            g.giudizi[k] = 'mancato';
            g.ultimo = { v: 'mancato', t: 0.6 };
          }
        if (g.tt > T0 + (N - 1) * BEAT + 0.8) g.fine(g.ris());
      },
      ris: () => ({
        punti: g.giudizi.reduce((a, v) => a + (v === 'perfetto' ? 2 : v === 'bene' ? 1 : 0), 0),
        max: N * 2
      }),
      hud() {
        const X = p.x,
          Y = p.y - 14;
        ctx.strokeStyle = 'rgba(255,240,200,.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(X, Y, 5, 0, 7);
        ctx.stroke();
        for (let k = 0; k < N; k++) {
          if (g.giudizi[k]) continue;
          const dt = T0 + k * BEAT - g.tt;
          if (dt < -0.1 || dt > 0.95) continue;
          ctx.strokeStyle = `rgba(246,${200 - k * 4},120,${Math.max(0.2, 1 - dt)})`;
          ctx.beginPath();
          ctx.arc(X, Y, 5 + Math.max(0, dt) * 26, 0, 7);
          ctx.stroke();
        }
        if (g.ultimo && g.ultimo.t > 0)
          svTesto(
            { perfetto: 'Perfetto!', bene: 'Bene', mancato: 'Ops' }[g.ultimo.v],
            X,
            p.y + 14,
            { perfetto: '#ffe14a', bene: '#bff0a0', mancato: '#ffb0a0' }[g.ultimo.v]
          );
      }
    };
    const r = await svGioco(g);
    if (!r) return;
    const q = r.punti / r.max,
      k = q >= 0.7 ? 'bene' : q >= 0.35 ? 'medio' : 'male';
    await say(n.id, svCaso(SV_T.ballo[k][n.id] || SV_T.ballo[k]._));
    svEnergia(-2);
    svPassa(20);
    svAmico(n.id, q >= 0.7 ? 2 : 1, 'ballo');
  });
}

// ---------- l'orto ----------
function svSemiStagione() {
  const s = seasonOf(G.st);
  return Object.keys(ITEMS).filter(k => {
    if (!k.startsWith('s_')) return false;
    const c = CROPS[k.slice(2)];
    return c && (!c.s || c.s.includes(s));
  });
}
async function svOrto(n) {
  await svScena(n, async () => {
    if (!(await svChiedi(n, 'Le erbacce non si strappano da sole.', 'Aiuta nell’orto'))) return;
    if (G.st.energy <= 0) return void UI.toast('Sei esaust{o|a}. Vai a dormire.', 'bad');
    await svVicino(n, 'lato');
    await say(n.id, svCaso(SV_T.orto.inizio[n.id] || SV_T.orto.inizio._));
    UI.toast('Premi A quando il cursore è sul verde: alla radice! Muoviti per smettere.');
    useEnergy(2);
    const p = G.player,
      g = svBarra({
        N: 4,
        periodo: 1.0,
        largo: 0.26,
        testo: 'Strappa!',
        onColpo: hit => {
          AU.play(hit ? 'zolla' : 'rustle');
          burst('dust', p.x + DIRV[p.dir][0] * 10, p.y, hit ? 5 : 2, '#6a4a2a');
        }
      });
    const r = await svGioco(g);
    if (!r || !r.fatti) return;
    if (r.ok >= 2) {
      const L = svSemiStagione();
      await say(n.id, svCaso(SV_T.orto.fine[n.id] || SV_T.orto.fine._));
      if (L.length) giveItem(svCaso(L), r.ok >= 4 ? 3 : 2);
    } else await say(n.id, svCaso(SV_T.orto.poco[n.id] || SV_T.orto.poco._));
    svPassa(20);
    svAmico(n.id, r.ok >= 3 ? 2 : 1, 'orto');
  });
}

// ================= IL FALÒ DELLA SERA =================
const SV_FALO = { x: 44, y: 19 };
// venerdì dalle 20; sabato dopo il ballo (21:30); fino alle 23:30. Non con la pioggia, non il giorno della festa.
function svFaloOra(st) {
  if (!isFree(st) || G.visit || !st.free) return false;
  if (st.weather === 'pioggia' || st.weather === 'temporale') return false;
  if (typeof festToday === 'function' && festToday(st)) return false;
  const d = WD(st),
    t = st.time;
  return (d === 4 && t >= 20 * 60 && t < 23 * 60 + 30) || (d === 5 && t >= 21 * 60 + 30 && t < 23 * 60 + 30);
}
// i posti intorno al fuoco (il giocatore si siede davanti, in 44,20)
const SV_POSTI = [
  [43, 19, 2],
  [46, 19, 1],
  [44, 18, 0],
  [45, 18, 0],
  [43, 18, 2],
  [46, 18, 1],
  [45, 20, 3],
  [43, 20, 2],
  [46, 20, 1],
  [42, 19, 2],
  [47, 19, 1]
];
const SV_FALO_CHI = {
  brom: [0, 20 * 60, 23 * 60 + 30],
  clara: [1, 20 * 60, 22 * 60 + 30],
  agatha: [2, 20 * 60, 23 * 60],
  ezekiel: [3, 20 * 60, 21 * 60 + 30],
  tobia: [4, 20 * 60 + 30, 23 * 60 + 30],
  lucius: [5, 22 * 60 + 30, 23 * 60 + 30],
  ingegnere: [6, 21 * 60, 23 * 60 + 30]
};
function svFaloPosto(id, st) {
  let c = SV_FALO_CHI[id];
  // l'Ingegnere solo se il suo carro è arrivato; i nuovi abitanti solo se abitano già in paese
  if (id === 'ingegnere' && !(typeof ingQui === 'function' && ingQui(st))) return null;
  if (!c && typeof RES_POOL !== 'undefined' && typeof resOf === 'function') {
    const i = RES_POOL.findIndex(r => r.id === id),
      r = i >= 0 && resOf(id, st);
    if (r && st.day > r.day) c = [7 + (i % 4), 20 * 60 + 30, 23 * 60];
  }
  if (!c) return null;
  const t = st.time;
  if (t < c[1] || t >= c[2]) return null;
  return SV_POSTI[c[0]];
}
// ================= LA CORSA COI SACCHI =================
const SV_CORSA = { giorni: [9, 23], x0: 30, x1: 48, corsie: { clara: 17, player: 18, brom: 19, tobia: 20 } };
function svCorsaOggi(st) {
  if (!isFree(st) || G.visit || !st.free) return false;
  if (!SV_CORSA.giorni.includes(seasonDay(st))) return false;
  if (typeof festToday === 'function' && festToday(st)) return false;
  return st.weather !== 'pioggia' && st.weather !== 'temporale';
}
const svCorsaFatta = st => {
  const S = st.free.svago;
  return !!(S && S.corse && S.corse[st.day]);
};
const svCorsaOra = st =>
  svCorsaOggi(st) && st.time >= 17 * 60 + 40 && st.time < 19 * 60 + 30 && !svCorsaFatta(st);
// ---------- dove stanno gli abitanti (prima di tutto il resto della giornata) ----------
function svSched(id, st) {
  if (svCorsaOra(st)) {
    if (id === 'agatha') return at(SV_CORSA.x0, 16, 0, 'corsa_org', 0);
    if (id === 'ezekiel') return at(SV_CORSA.x1 + 2, 18, 1, 'corsa', 0);
    if (SV_CORSA.corsie[id]) return at(SV_CORSA.x0 - 1, SV_CORSA.corsie[id], 2, 'corsa', 0);
  }
  if (svFaloOra(st)) {
    const p = svFaloPosto(id, st);
    if (p) return at(p[0], p[1], p[2], 'falo', 0, { snap: 1 });
  }
  return undefined;
}
function svAvvolgiSched() {
  for (const id of Object.keys(SCHED)) {
    const orig = SCHED[id];
    if (typeof orig !== 'function' || orig._sv) continue;
    const f = function (st) {
      if (isFree(st) && !G.visit) {
        const r = svSched(id, st);
        if (r !== undefined) return r;
      }
      return orig(st);
    };
    f._sv = 1;
    SCHED[id] = f;
  }
}
svAvvolgiSched();
Ext.on('arte', svAvvolgiSched);

// ---------- il fuoco in piazza ----------
const SV_VUOTO = mk(32, 32)[0];
function svFaloDisegna() {
  const X = SV_FALO.x * 16 + 16,
    Y = SV_FALO.y * 16 + 12,
    T = G.t;
  // la cenere e il cerchio di pietre
  ctx.fillStyle = 'rgba(30,20,14,.55)';
  ctx.beginPath();
  ctx.ellipse(X, Y, 15, 6, 0, 0, 7);
  ctx.fill();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2,
      sx = Math.round(X + Math.cos(a) * 15),
      sy = Math.round(Y + Math.sin(a) * 6);
    ctx.fillStyle = '#3a3430';
    ctx.fillRect(sx - 3, sy - 2, 6, 4);
    ctx.fillStyle = i % 3 ? '#8a8680' : '#6e6a64';
    ctx.fillRect(sx - 2, sy - 2, 4, 3);
    ctx.fillStyle = '#b0aca4';
    ctx.fillRect(sx - 2, sy - 2, 2, 1);
  }
  // la legna a capanna
  const ceppo = (x0, y0, x1, y1) => {
    svLinea(x0, y0, x1, y1, '#2e1c0e');
    svLinea(x0 + 1, y0, x1 + 1, y1, '#5a3a1e');
    svLinea(x0 + 2, y0, x1 + 2, y1, '#7a5230');
  };
  ceppo(X - 10, Y + 2, X - 1, Y - 12);
  ceppo(X + 8, Y + 2, X - 1, Y - 12);
  ceppo(X - 5, Y + 3, X, Y - 13);
  ceppo(X + 3, Y + 3, X - 2, Y - 13);
  // le braci
  for (let i = 0; i < 9; i++) {
    const f = (Math.sin(T * 5 + i * 2.1) + 1) / 2;
    ctx.fillStyle = f > 0.6 ? '#ffd24a' : f > 0.3 ? '#ff7a1a' : '#a02a10';
    ctx.fillRect(X - 8 + i * 2, Y + 1 - (i % 2), 2, 1);
  }
  // le fiamme: lingue che danzano, dal rosso al bianco
  const lingua = (ox, h, w0, col, fase) => {
    const hh = h + Math.sin(T * 9 + fase) * 3 + Math.sin(T * 23 + fase * 2);
    for (let y = 0; y < hh; y++) {
      const w = Math.max(1, Math.round((1 - y / hh) * w0 + Math.sin(T * 13 + y + fase) * 0.8));
      ctx.fillStyle = col;
      ctx.fillRect(
        Math.round(X + ox - w / 2 + Math.sin(T * 7 + y * 0.5 + fase) * (y / hh) * 2.5),
        Y - y,
        w,
        1
      );
    }
  };
  lingua(-4, 14, 5, '#b8301a', 0);
  lingua(4, 15, 5, '#b8301a', 2);
  lingua(0, 22, 8, '#e8541a', 1);
  lingua(-2, 16, 6, '#ff9a2a', 3);
  lingua(2, 13, 5, '#ffc83a', 4);
  lingua(0, 9, 4, '#fff0a8', 5);
  // le scintille che salgono
  for (let i = 0; i < 9; i++) {
    const k = (T * 0.55 + i / 9) % 1,
      sx = X + Math.sin(i * 7.3 + T * 2) * 8 * k + (i - 4),
      sy = Y - 18 - k * 38;
    ctx.fillStyle = `rgba(255,${170 + i * 9},70,${1 - k})`;
    ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
  }
}
function svFaloAggiorna() {
  const m = G.maps && G.maps.main,
    st = G.st;
  if (!m || m.id !== 'main' || !st) return;
  const on = svFaloOra(st);
  const F = SVAGO.falo;
  if (F.o && (F.m !== m || !on)) {
    if (F.m === m) mapRemove(m, F.o);
    if (F.m && F.luce) F.m.lights = F.m.lights.filter(l => l !== F.luce);
    F.o = F.luce = F.m = null;
  }
  if (on && !F.o) {
    const p = G.player,
      sopra = G.map === m && ptile(p)[1] === SV_FALO.y && [SV_FALO.x, SV_FALO.x + 1].includes(ptile(p)[0]);
    const T = [
      [SV_FALO.x, SV_FALO.y],
      [SV_FALO.x + 1, SV_FALO.y]
    ];
    F.o = m.add({
      kind: 'svfalo',
      tx: SV_FALO.x,
      ty: SV_FALO.y,
      wt: 2,
      img: SV_VUOTO,
      dx: SV_FALO.x * 16,
      dy: SV_FALO.y * 16 - 16,
      sy: SV_FALO.y * 16 + 15,
      solid: sopra ? [] : T,
      hits: T,
      act: 'svFalo',
      disegna: svFaloDisegna
    });
    F.luce = { x: SV_FALO.x * 16 + 16, y: SV_FALO.y * 16 + 4, r: 96, fire: 1, falo: 1 };
    m.lights.push(F.luce);
    F.m = m;
    const S = svSt();
    if (!S.oggi.faloAvviso && G.map === m) {
      S.oggi.faloAvviso = 1;
      UI.toast('In piazza hanno acceso il falò. Chi passa si ferma a scaldarsi.');
    }
  }
}
ACT.svFalo = () => svFalo();
PROMPT.svFalo = 'Siediti al falò';
const svFaloGente = () =>
  G.npcs.filter(
    n =>
      !n.hidden &&
      n.map === 'main' &&
      n.act === 'falo' &&
      Math.hypot(n.x - (SV_FALO.x * 16 + 16), n.y - (SV_FALO.y * 16 + 12)) < 70
  );
async function svFalo() {
  if (!svFaloOra(G.st)) return void UI.toast('Il falò si accende il venerdì sera e il sabato dopo il ballo.');
  const tutti = svFaloGente();
  await svScena(null, async () => {
    for (const n of tutti) {
      n.script = true;
      n.path = [];
      n.moving = false;
    }
    try {
      await UI.fade(1, 300);
      const m = G.map,
        p = G.player;
      if (svLibera(m, 44, 20)) setPos(p, 44, 20, 3);
      else if (svLibera(m, 45, 21)) setPos(p, 45, 21, 3);
      p.dir = 3;
      await UI.fade(0, 400);
      const S = svSt(),
        F = SV_T.falo;
      if (!tutti.length) {
        await narr(svCaso(F.solo));
        const c = await ask(null, 'Resti un po’?', ['Resta mezz’ora', 'Vai via']);
        if (c === 0) {
          svPassa(30);
          svEnergia(6);
        }
        return;
      }
      await narr(svCaso(F.arrivo));
      if (!S.falo) {
        S.falo = 1;
        for (const n of tutti) {
          addFriend(n.id, 1);
          floatText('♥', n.x, n.y - 32, '#ff7a6a');
        }
      }
      const opz = [
        'Ascolta una storia',
        'Racconta tu',
        'Arrostisci qualcosa',
        'Cantate insieme',
        'Guarda il fuoco',
        'Vai via'
      ];
      let azioni = 0,
        cantato = false,
        raccontato = false;
      while (azioni < 5 && G.st.time < 23 * 60 + 40) {
        const c = await ask(
          null,
          azioni ? 'Il fuoco scoppietta. E adesso?' : 'Intorno al fuoco. Cosa fai?',
          opz
        );
        if (c === 5 || c < 0) break;
        azioni++;
        if (c === 0) await svFaloStoria(tutti);
        else if (c === 1) {
          if (raccontato) await narr('Hai già raccontato la tua, stanotte. Adesso tocca agli altri.');
          else {
            raccontato = true;
            await svFaloTua(tutti);
          }
        } else if (c === 2) await svFaloArrosto(tutti);
        else if (c === 3) {
          if (cantato) await narr('Qualcuno riattacca il ritornello, ma la voce si è stancata. Domani.');
          else {
            cantato = true;
            await svFaloCanta(tutti);
          }
        } else if (c === 4) {
          await narr(svCaso(F.silenzio));
          svPassa(20);
          svEnergia(6);
        }
        svPassa(10);
      }
      if (azioni >= 5 || G.st.time >= 23 * 60 + 40) await narr(F.tardi);
    } finally {
      for (const n of tutti) {
        n.script = false;
        n.goal = null;
      }
    }
  });
}
async function svFaloStoria(tutti) {
  const F = SV_T.falo,
    S = svSt();
  // chi ha ancora una storia da raccontare (non sentita)
  const ordine = tutti.slice().sort(() => Math.random() - 0.5);
  let chi = null,
    storia = null;
  for (const n of ordine) {
    const L = F.storie[n.id] || F.storie._,
      V = (S.visti['falo:' + n.id] = S.visti['falo:' + n.id] || []);
    if (L.some((_, i) => !V.includes(i))) {
      chi = n;
      storia = svNuovo('falo:' + n.id, L);
      break;
    }
  }
  if (!chi) {
    chi = ordine[0];
    storia = svNuovo('falo:' + chi.id, F.storie[chi.id] || F.storie._);
  }
  for (const r of storia) await say(chi.id, r);
  for (const n of tutti)
    if (n !== chi && Math.random() < 0.5) bubble(n, svCaso(['…', 'Mh.', 'Brr.', 'Ahah.', 'Che storia.']), 2);
  svPassa(15);
}
async function svFaloTua(tutti) {
  const F = SV_T.falo;
  const c = await ask(
    null,
    'Che storia racconti?',
    F.generi.map(g => g[0])
  );
  const g = (F.generi[c] || F.generi[0])[1];
  await narr(F.tuaStoria[g]);
  for (const n of tutti.slice(0, 4)) {
    const R = F.reazioni[n.id] || F.reazioni._;
    await say(n.id, R[g]);
    if (F.gusti[n.id] === g && svAmico(n.id, 1, 'falostoria')) AU.play('ok');
  }
  svPassa(15);
}
async function svFaloArrosto(tutti) {
  const F = SV_T.falo.arrosto,
    S = svSt();
  const cosa = ['castagne', 'patata', 'mais', 'pane'].find(id => countItem(id) > 0);
  if (!cosa) {
    if (S.oggi.castagnaRegalata)
      return void (await narr('Non hai niente da arrostire. Ti godi il profumo di quello degli altri.'));
    S.oggi.castagnaRegalata = 1;
    await narr(F.nulla);
    svEnergia(5);
    return;
  }
  removeItem(cosa, 1);
  await narr(F[cosa]);
  svEnergia(cosa === 'castagne' ? 8 : 12);
  if (cosa === 'castagne' && ITEMS.caldarroste) {
    await narr('Ne avanza un cartoccio. Lo infili in tasca, ancora caldo.');
    giveItem('caldarroste', 1);
  }
  const n = tutti[Math.floor(Math.random() * tutti.length)];
  if (n) bubble(n, svCaso(['Che profumo!', 'Ne avanza un pezzetto?', 'Mh. Buono.', 'Hihi! A me!']), 2.5);
  svPassa(15);
}
async function svFaloCanta(tutti) {
  const V = SV_T.falo.canzone;
  await narr(
    'Qualcuno attacca una canzone vecchia come il paese. Gli altri vanno dietro, chi intonato e chi no.'
  );
  for (let i = 0; i < V.length; i++) {
    const n = tutti[i % tutti.length];
    bubble(n, '♪ ' + V[i], 2.4);
    AU.play('carillon', 0.35);
    await sleep(1900);
  }
  for (const n of tutti) svAmico(n.id, 1, 'canzone');
  svEnergia(4);
  svPassa(10);
}

// ---------- la corsa: iscrizione ----------
async function svCorsaChiacchiera(n) {
  await svScena(n, async () => {
    const L = SV_T.corsa.prima[n.id] || SV_T.corsa.prima._;
    await say(n.id, svCaso(L));
  });
}
async function svCorsaIscrivi(n) {
  await svScena(n, async () => {
    const st = G.st;
    if (st.time < 18 * 60) {
      await say(
        n.id,
        'Tesoro, si parte alle sei in punto! Intanto scaldati le gambe. Saltella un po’. Non così, sembri una cavalletta malata.'
      );
      return;
    }
    const c = await ask(n.id, svCaso(SV_T.corsa.invito), ['Mi iscrivo!', 'Guardo e basta']);
    if (c !== 0) {
      await say(n.id, 'Peccato! Allora fai il tifo forte. Per me. Cioè, per tutti.');
      return;
    }
    await say(n.id, SV_T.corsa.regole);
    await svCorsa(n);
  });
}
// i corridori degli abitanti: intervallo fra un salto e l'altro (oltre al salto), variazione e inciampi
const SV_CORRE = {
  clara: { gap: 0.07, jit: 0.05, inc: 0.03 },
  brom: { gap: 0.1, jit: 0.03, inc: 0.01 },
  tobia: { gap: 0.02, jit: 0.12, inc: 0.12 }
};
async function svCorsa(org) {
  const m = G.map,
    p = G.player,
    HOP = 0.4,
    PASSO = 12,
    X0 = SV_CORSA.x0 * 16 + 8,
    X1 = SV_CORSA.x1 * 16 + 8;
  const giudice = NPC('ezekiel'),
    C = [];
  await UI.fade(1, 350);
  const corsia = y => y * 16 + 14;
  setPos(p, SV_CORSA.x0, SV_CORSA.corsie.player, 2);
  C.push({ e: p, pl: 1, x: X0, y0: corsia(SV_CORSA.corsie.player), hop: -1, coda: false, giu: 0, w: 0 });
  for (const id of ['clara', 'brom', 'tobia']) {
    const n = NPC(id);
    if (!n || n.hidden || n.map !== 'main') continue;
    n.script = true;
    n.path = [];
    n.moving = false;
    n.dir = 2;
    C.push({
      e: n,
      id,
      x: X0,
      y0: corsia(SV_CORSA.corsie[id]),
      hop: -1,
      giu: 0,
      w: 0.2 + Math.random() * 0.2,
      ai: SV_CORRE[id]
    });
  }
  if (giudice && !giudice.hidden) {
    giudice.script = true;
    setPos(giudice, SV_CORSA.x1 + 2, 18, 1);
  }
  for (const c of C) {
    c.e.x = c.x;
    c.e.y = c.y0;
  }
  await UI.fade(0, 400);
  const arrivi = [];
  const g = {
    C,
    esci: false,
    tt: -3.4,
    conto: -1,
    salta(c) {
      c.hop = 0;
      if (c.ai && Math.random() < c.ai.inc) {
        c.hop = -1;
        c.giu = 0.8;
        bubble(c.e, SV_T.corsa.cadeNpc[c.id] || 'Ahi!', 1);
      }
    },
    premi() {
      const c = C[0];
      if (g.tt < 0 || c.arrivo || c.giu > 0) return;
      if (c.hop < 0) g.salta(c);
      else if (c.hop < 0.6) {
        c.hop = -1;
        c.giu = 0.8;
        c.coda = false;
        AU.play('tonfo');
        floatText(svCaso(SV_T.corsa.cadi), p.x, p.y - 30, '#ffb0a0');
      } else c.coda = true;
    },
    passo(dt) {
      const prima = g.tt;
      g.tt += dt;
      // il conto alla rovescia: lo dice Agatha
      const k = Math.floor(g.tt + 3.4);
      if (g.tt < 0.2 && k !== g.conto && k >= 0 && k <= 3) {
        g.conto = k;
        const L = SV_T.corsa.via;
        if (k < 3) {
          bubble(org, L[k], 1);
          AU.play('blip');
        }
      }
      if (prima < 0 && g.tt >= 0) {
        bubble(org, SV_T.corsa.via[2], 1.2);
        AU.play('bell');
      }
      if (g.tt < 0) return;
      for (const c of C) {
        if (c.arrivo) continue;
        if (c.giu > 0) {
          c.giu -= dt;
          c.e.y = c.y0;
          continue;
        }
        if (c.hop >= 0) {
          c.hop += dt / HOP;
          c.x += (PASSO * dt) / HOP;
          if (c.hop >= 1) {
            c.hop = -1;
            AU.play('passoErba', 0.4);
            if (c.coda) {
              c.coda = false;
              g.salta(c);
            }
            if (c.ai) c.w = c.ai.gap + Math.random() * c.ai.jit;
          }
        } else if (c.ai) {
          c.w -= dt;
          if (c.w <= 0) g.salta(c);
        }
        c.e.x = c.x;
        c.e.y = c.y0 - (c.hop >= 0 ? Math.sin(c.hop * Math.PI) * 6 : 0);
        if (c.x >= X1) {
          c.arrivo = g.tt;
          c.e.y = c.y0;
          arrivi.push(c);
          if (c.pl) AU.play('ok');
          else if (Math.random() < 0.6) bubble(c.e, svCaso(SV_T.corsa.tifo), 1);
        }
      }
      const io = C[0];
      if ((io.arrivo && g.tt > io.arrivo + 1.5) || g.tt > 40) g.fine(g.ris());
    },
    ris: () => {
      const ordine = arrivi.slice();
      for (const c of C.filter(c => !c.arrivo).sort((a, b) => b.x - a.x)) ordine.push(c);
      return ordine;
    },
    mondo() {
      // partenza e arrivo
      const ya = SV_CORSA.corsie.clara * 16,
        yb = SV_CORSA.corsie.tobia * 16 + 16;
      for (let y = ya; y < yb; y += 2) {
        ctx.fillStyle = ((y / 2) | 0) % 2 ? '#f6f0e0' : '#2a1c14';
        ctx.fillRect(X1 + 6, y, 2, 2);
        ctx.fillStyle = 'rgba(246,240,224,.5)';
        ctx.fillRect(X0 - 7, y, 1, 1);
      }
    },
    // i sacchi: ognuno subito dopo il suo corridore (così chi sta davanti copre chi sta dietro)
    lista(L) {
      for (const c of C) L.push({ sy: c.y0 + 0.5, draw: () => svSacco(c.e) });
    },
    hud() {
      if (g.tt < 0) {
        const k = Math.ceil(-g.tt);
        svTesto(k > 3 ? '' : String(k), p.x, p.y - 40, '#ffe14a', true);
      } else if (g.tt < 0.8) svTesto('VIA!', p.x, p.y - 40, '#9ef08a', true);
      const io = C[0];
      if (io.giu > 0) svTesto('…', p.x, p.y - 34, '#ffb0a0');
    }
  };
  try {
    const ordine = await svGioco(g);
    const pos = Math.max(1, ordine.findIndex(c => c.pl) + 1);
    const S = svSt();
    S.corse[G.st.day] = { pos, vince: ordine[0] && (ordine[0].id || 'player') };
    S.rec.corse = (S.rec.corse || 0) + 1;
    if (pos === 1) S.rec.vittorie = (S.rec.vittorie || 0) + 1;
    await narr(svCaso(SV_T.corsa.risultato[Math.min(pos, 4)]));
    const premio = { 1: 250, 2: 120, 3: 60 }[pos] || 20;
    G.st.money += premio;
    AU.play('coin');
    UI.toast(
      `Premio della corsa: ${premio} monete.` +
        (pos === 1 && S.rec.vittorie > 1 ? ` Vittorie: ${S.rec.vittorie}.` : '')
    );
    for (const c of C) if (c.id) svAmico(c.id, 1, 'corsa');
    svAmico('agatha', 1, 'corsa');
    if (pos !== 1 && ordine[0] && ordine[0].id) await narr(SV_T.corsa.vince[ordine[0].id]);
  } finally {
    for (const c of C)
      if (c.id) {
        c.e.script = false;
        c.e.goal = null;
        c.e.y = c.y0;
      }
    if (giudice) {
      giudice.script = false;
      giudice.goal = null;
    }
    p.y = C[0].y0;
  }
}
// la corsa si fa anche senza di te
function svSacco(e) {
  const X = Math.round(e.x),
    Y = Math.round(e.y);
  // il contorno, un po' più largo in fondo
  ctx.fillStyle = '#4a3218';
  ctx.fillRect(X - 6, Y - 12, 12, 13);
  ctx.fillRect(X - 7, Y - 6, 14, 6);
  // la tela di juta: chiara a sinistra, in ombra a destra
  ctx.fillStyle = '#c9a66b';
  ctx.fillRect(X - 5, Y - 11, 10, 11);
  ctx.fillRect(X - 6, Y - 5, 12, 4);
  ctx.fillStyle = '#dcbf87';
  ctx.fillRect(X - 5, Y - 11, 2, 9);
  ctx.fillStyle = '#a8814a';
  ctx.fillRect(X + 3, Y - 10, 2, 10);
  ctx.fillRect(X - 6, Y - 1, 12, 1);
  // la trama
  ctx.fillStyle = 'rgba(120,86,44,.45)';
  for (let i = 0; i < 4; i++) ctx.fillRect(X - 4 + i * 3, Y - 9 + (i % 2), 1, 7);
  // il timbro della farina
  ctx.fillStyle = '#8a5a2a';
  ctx.fillRect(X - 2, Y - 7, 3, 1);
  ctx.fillRect(X - 2, Y - 7, 1, 4);
  ctx.fillRect(X - 2, Y - 5, 2, 1);
  // l'orlo arrotolato in vita, stretto con lo spago
  ctx.fillStyle = '#4a3218';
  ctx.fillRect(X - 7, Y - 14, 14, 3);
  ctx.fillStyle = '#d8b878';
  ctx.fillRect(X - 6, Y - 13, 12, 1);
  ctx.fillStyle = '#7a3a1a';
  ctx.fillRect(X - 5, Y - 12, 10, 1);
}
function svCorsaSenza() {
  const st = G.st;
  if (!svCorsaOggi(st) || svCorsaFatta(st) || st.time < 19 * 60 + 15 || SVAGO.busy || SVAGO.gioco) return;
  const S = svSt(),
    r = Math.random(),
    vince = r < 0.45 ? 'clara' : r < 0.7 ? 'brom' : 'tobia';
  S.corse[st.day] = { pos: 0, vince };
  if (G.map && G.map.id === 'main') UI.toast(SV_T.corsa.senza + ' ' + SV_T.corsa.vince[vince]);
}
Ext.on('freeMorning', st => {
  if (!st || !isFree(st) || G.visit) return;
  if (SV_CORSA.giorni.includes(seasonDay(st)) && !(typeof festToday === 'function' && festToday(st)))
    setTimeout(() => {
      if (svCorsaOggi(G.st)) UI.toast(SV_T.corsa.annuncio);
    }, 4500);
});

// ================= DA SOLI =================
// la panchina: se c'è qualcuno seduto ci si siede accanto; se no si può restare a pensare
{
  const orig = ACT.bench;
  ACT.bench = async o => {
    if (!svQui()) return orig(o);
    const cx = o.tx * 16 + 8,
      cy = o.ty * 16 + 14;
    const n = G.npcs.find(
      q =>
        !q.hidden &&
        q.map === G.map.id &&
        !q.script &&
        q.act === 'bench' &&
        Math.hypot(q.x - cx, q.y - cy) < 40
    );
    if (n) return svPanchina(n);
    const c = await ask(null, 'Una panchina di legno, consumata da generazioni di attese.', [
      'Siediti a pensare',
      'Aspetta che passi il tempo…',
      'Niente'
    ]);
    if (c === 0) return svPensa();
    if (c === 1) return orig(o);
  };
}
async function svPensa() {
  const st = G.st,
    notte = st.time >= 20 * 60 || st.time < 6 * 60;
  const L = notte ? SV_T.pensieri.notte : SV_T.pensieri[seasonOf(st)] || SV_T.pensieri[0];
  await svPassaBuio(30);
  await narr(svNuovo('pensieri:' + (notte ? 'n' : seasonOf(st)), L));
  svEnergia(5);
}
// i sassi piatti: a mani vuote, davanti all'acqua
Ext.on('freeAct:intercetta', function (fx, fy) {
  if (!svQui() || G.map.id !== 'main' || G.fish || SVAGO.gioco) return;
  if (G.map.get(fx, fy) !== 3 || selItem()) return;
  if (G.t < SVAGO.sassoT) return true;
  SVAGO.sassoT = G.t + 1.4;
  const S = svSt(),
    tiri = (S.rec.tiri = (S.rec.tiri || 0) + 1),
    max = 4 + Math.min(5, Math.floor(tiri / 8)),
    n = Math.floor(Math.pow(Math.random(), 0.8) * (max + 1));
  const p = G.player,
    [dx, dy] = DIRV[p.dir];
  SVAGO.sasso = { x: p.x + dx * 10, y: p.y - 4 + dy * 10, dx, dy, n, t: G.t };
  AU.play('rustle');
  const prima = S.rec.sassi || 0;
  if (n > prima) S.rec.sassi = n;
  setTimeout(
    () => {
      const k = Object.keys(SV_T.sassi)
        .map(Number)
        .filter(v => v <= n)
        .pop();
      floatText(
        n ? n + (n === 1 ? ' rimbalzo' : ' rimbalzi') : 'Plop',
        p.x,
        p.y - 30,
        n > prima && prima ? '#ffe14a' : '#bfe3ff'
      );
      UI.toast(SV_T.sassi[k] + (n > prima && prima ? ` Nuovo record: ${n}!` : ''));
    },
    400 + n * 220
  );
  return true;
});
function svSassoDisegna(m) {
  const s = SVAGO.sasso;
  if (!s || m.id !== 'main') return;
  const T = G.t - s.t,
    durata = 0.35 + s.n * 0.22 + 0.9;
  if (T > durata) return void (SVAGO.sasso = null);
  // i punti dove il sasso tocca l'acqua: sempre più vicini
  let d = 14,
    salto = 22;
  for (let i = 0; i <= s.n; i++) {
    const tb = 0.35 + i * 0.22;
    if (T >= tb) {
      const k = T - tb,
        r = 1 + k * 10;
      if (k < 0.9) {
        ctx.strokeStyle = `rgba(220,240,255,${0.8 * (1 - k / 0.9)})`;
        ctx.beginPath();
        ctx.ellipse(s.x + s.dx * d, s.y + s.dy * d + 6, r, r * 0.45, 0, 0, 7);
        ctx.stroke();
      }
    } else {
      const k = (T - (tb - (i ? 0.22 : 0.35))) / (i ? 0.22 : 0.35);
      if (k >= 0) {
        const pd = d - salto + salto * k;
        ctx.fillStyle = '#8a8680';
        ctx.fillRect(
          Math.round(s.x + s.dx * pd),
          Math.round(s.y + s.dy * pd + 6 - Math.sin(k * Math.PI) * 6),
          2,
          2
        );
      }
      break;
    }
    salto = Math.max(6, salto * 0.78);
    d += salto;
  }
}

// ---------- ogni mezzo secondo: il falò e la corsa ----------
Ext.on('mpTick', dt => {
  SVAGO.tick -= dt;
  if (SVAGO.tick > 0) return;
  SVAGO.tick = 0.5;
  try {
    if (!G.st || !isFree(G.st)) return;
    svFaloAggiorna();
    svCorsaSenza();
  } catch (e) {
    segnala(e, 'svago');
  }
});
