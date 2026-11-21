'use strict';
// ================= LA VALLE INFINITA — FASE 6: SEMPRE QUALCOSA DA FARE =================
// Incarichi del giorno e della settimana (bacheca in piazza), il Museo della Valle con le collezioni,
// i traguardi, gli eventi a sorpresa, le missioni che esistono solo a certe ore e in certe stagioni,
// nuove curiosità nascoste e Nove: un personaggio che si mostra solo a chi ha trovato i suoi quattro ricordi.

const freeSt = () => {
  const s = G.visit ? G.home : G.st;
  return s && isFree(s) ? s : null;
};
const fx6 = st => {
  const F = st.free;
  F.inc = F.inc || {};
  F.museo = F.museo || {};
  F.trag = F.trag || {};
  F.ricordi = F.ricordi || {};
  F.stats = F.stats || {};
  return F;
};
function srng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const pidSeed = st => {
  let h = 0;
  for (const c of String(st.pid || 'x')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};
const weekOf = st => Math.floor((st.day - (st.free.start || 0)) / 7);
const itemV = id =>
  ({ legna: 5, pietra: 5, fibra: 4 })[id] || (ITEMS[id] && (ITEMS[id].v || ITEMS[id].p)) || 20;

// ================= INCARICHI =================
// tipi: consegna (porti gli oggetti), pesca (N pesci da quando lo accetti), parla (N abitanti oggi), regalo (a qualcuno oggi), scendi (piano N della miniera)
function incPool(st) {
  const s = seasonOf(st),
    P = [];
  for (const c of Object.keys(CROPS)) if (cropInSeason(c, s) && ITEMS[c]) P.push(c);
  for (const w of WILD[s] || []) P.push(w);
  P.push('legna', 'pietra', 'fibra');
  if ((st.free.animals || []).some(a => a.kind === 'gallina')) P.push('uovo');
  if ((st.free.animals || []).some(a => a.kind === 'mucca')) P.push('latte');
  if ((mineSt(st).deep || 0) >= 1) P.push('ferro');
  if ((mineSt(st).deep || 0) >= 10) P.push('quarzo');
  return P;
}
function incMake(st, seed, big) {
  const R = srng(seed),
    pick = a => a[Math.floor(R() * a.length)];
  const P = incPool(st);
  const r = R();
  const npcs = [
    'agatha',
    'brom',
    'clara',
    'tobia',
    'lucius',
    'ezekiel',
    ...residents(st).map(x => x.id)
  ].filter(id => NPC(id));
  if (!big) {
    if (r < 0.62) {
      const item = pick(P),
        cheap = ['legna', 'pietra', 'fibra'].includes(item),
        n = cheap ? 10 + Math.floor(R() * 15) : 1 + Math.floor(R() * 4);
      return { type: 'consegna', item, n, pay: Math.round(itemV(item) * n * 1.5) + 60 };
    }
    if (r < 0.74 && (zoneOpen('lago', st) || true))
      return { type: 'pesca', n: 2 + Math.floor(R() * 3), pay: 180 };
    if (r < 0.87) return { type: 'parla', n: 3 + Math.floor(R() * 3), pay: 120 };
    return { type: 'regalo', who: pick(npcs), pay: 150 };
  }
  // settimanali: più grandi, pagano di più
  if (r < 0.5) {
    const item = pick(P),
      cheap = ['legna', 'pietra', 'fibra'].includes(item),
      n = cheap ? 60 + Math.floor(R() * 60) : 8 + Math.floor(R() * 10);
    return { type: 'consegna', item, n, pay: Math.round(itemV(item) * n * 1.8) + 500, big: 1 };
  }
  if (r < 0.75 && zoneOpen('collina', st))
    return { type: 'scendi', n: Math.max(5, (mineSt(st).deep || 0) + 3), pay: 900, big: 1 };
  return { type: 'pesca', n: 10 + Math.floor(R() * 6), pay: 900, big: 1 };
}
function incToday(st) {
  const F = fx6(st),
    I = F.inc;
  if (I.day !== st.day) {
    const base = pidSeed(st) ^ (st.day * 7919);
    I.day = st.day;
    I.list = [0, 1, 2].map(i =>
      Object.assign(incMake(st, base + i * 104729), {
        id: 'd' + st.day + '_' + i,
        fish0: st.free.fished || 0
      })
    );
  }
  const w = weekOf(st);
  if (!I.week || I.week.w !== w) {
    I.week = Object.assign(incMake(st, pidSeed(st) ^ (w * 15485863), true), {
      id: 'w' + w,
      w,
      fish0: st.free.fished || 0
    });
  }
  return [...I.list, I.week];
}
function incProg(st, q) {
  if (q.type === 'consegna') return [Math.min(q.n, countItem(q.item)), q.n];
  if (q.type === 'pesca') return [Math.min(q.n, (st.free.fished || 0) - (q.fish0 || 0)), q.n];
  if (q.type === 'parla') return [Math.min(q.n, Object.keys(st.talked || {}).length), q.n];
  if (q.type === 'regalo') return [st.gifted && st.gifted[q.who] ? 1 : 0, 1];
  if (q.type === 'scendi') return [Math.min(q.n, mineSt(st).deep || 0), q.n];
  return [0, 1];
}
function incText(q) {
  const N = x => NAMES[x] || x;
  return q.type === 'consegna'
    ? `Porta ${q.n} × ${ITEMS[q.item].n}`
    : q.type === 'pesca'
      ? `Pesca ${q.n} pesci`
      : q.type === 'parla'
        ? `Parla con ${q.n} abitanti oggi`
        : q.type === 'regalo'
          ? `Fai un regalo a ${N(q.who)} oggi`
          : `Scendi al piano ${q.n} della miniera`;
}
function incClaim(st, q) {
  const [a, b] = incProg(st, q);
  if (a < b || q.claimed) return false;
  if (q.type === 'consegna') removeItem(q.item, q.n);
  q.claimed = 1;
  st.money += q.pay;
  const F = fx6(st);
  F.stats.inc = (F.stats.inc || 0) + 1;
  AU.play('coin');
  UI.hud();
  UI.toast(`Incarico completato: ${incText(q)}. +${SC(q.pay)}`);
  if (q.big && Math.random() < 0.6) {
    const r = ['alb_ciliegio', 'statua', 'lampadario', 'fontana'][Math.floor(Math.random() * 4)];
    addItem(r, 1);
    UI.toast(`Premio della settimana: ${ITEMS[r].n}!`);
  }
  NET.save(st);
  return true;
}
function incHTML(st) {
  const L = incToday(st);
  const row = q => {
    const [a, b] = incProg(st, q),
      ok = a >= b;
    return `<div class="mrow"><span style="flex:1"><b>${q.big ? '⭐ Della settimana: ' : ''}${esc(incText(q))}</b><br><span class="small">${q.claimed ? '✔ Fatto' : `${a}/${b}`} · ${CZ(q.pay)}${q.big ? ' + un premio' : ''}</span></span>${q.claimed ? '' : `<button class="btn" data-inc="${q.id}" ${ok ? '' : 'disabled'}>${q.type === 'consegna' ? 'Consegna' : 'Riscuoti'}</button>`}</div>`;
  };
  const ev = evToday(st);
  return `<h3>Incarichi di oggi</h3>${L.slice(0, 3).map(row).join('')}<h3>Della settimana</h3>${row(L[3])}<p class="small">Nuovi incarichi ogni mattina; quello della settimana cambia ogni sette giorni.</p>${ev ? `<h3>Oggi nella Valle</h3><p>${esc(EVENTI[ev].n)}: ${esc(EVENTI[ev].d)}</p>` : ''}`;
}
function incWire(st, again) {
  $('#mbox')
    .querySelectorAll('[data-inc]')
    .forEach(
      b =>
        (b.onclick = () => {
          const q = incToday(st).find(x => x.id === b.dataset.inc);
          if (q && incClaim(st, q)) {
            UI._mclose = null;
            again();
          }
        })
    );
}
// nella bacheca della piazza, sotto le missioni
{
  const _b = UI.board.bind(UI);
  UI.board = function () {
    _b();
    const st = freeSt();
    if (!st || G.visit) return;
    const box = $('#mbox');
    if (!box) return;
    const d = document.createElement('div');
    d.innerHTML = incHTML(st);
    box.appendChild(d);
    incWire(st, () => UI.board());
  };
}
QUESTS.push({
  free: 1,
  s: st => isFree(st) && !G.visit,
  t: st => {
    const L = incToday(st),
      n = L.slice(0, 3).filter(q => q.claimed).length;
    return `Incarichi di oggi: ${n}/3 — bacheca in piazza`;
  },
  d: st =>
    incToday(st)
      .slice(0, 3)
      .every(q => q.claimed)
});

// ================= EVENTI A SORPRESA =================
const EVENTI = {
  stelle: {
    n: 'Notte di stelle cadenti',
    d: 'stanotte, dopo le 21, dove cadono le stelle resta polvere luminosa da raccogliere.'
  },
  pesce: { n: 'Fiera del pesce', d: 'oggi il pesce alla cassetta vale la metà in più.' },
  raccolto: { n: 'Giorno del raccolto', d: 'oggi le verdure alla cassetta valgono un terzo in più.' },
  vento: {
    n: 'Vento di tramontana',
    d: 'stanotte il vento ha spezzato rami dappertutto: legna gratis per chi la raccoglie.'
  },
  nebbia: {
    n: 'La nebbia di Nove',
    d: 'stanotte una nebbia bassa, e qualcuno che canta piano vicino al pozzo.'
  }
};
function evToday(st) {
  const F = fx6(st);
  return F.ev && F.ev.day === st.day ? F.ev.id : null;
}
function evMorning(st) {
  const F = fx6(st);
  if (F.ev && F.ev.day === st.day) return;
  F.ev = null;
  if (festToday && festToday(st)) return;
  const R = srng(pidSeed(st) ^ (st.day * 2654435761));
  if (R() > 0.3) return;
  const k = Object.keys(EVENTI);
  let id = k[Math.floor(R() * k.length)];
  if (id === 'nebbia' && !Object.keys(F.ricordi).length) id = 'vento';
  F.ev = { day: st.day, id };
  if (id === 'vento') {
    const W2 = st.free;
    for (let i = 0; i < 14; i++) {
      const x = 5 + Math.floor(Math.random() * 54),
        y = 6 + Math.floor(Math.random() * 35),
        kk = fkey(x, y);
      if (!W2.debris[kk] && !W2.built[kk] && !st.farm[kk]) W2.debris[kk] = 'ramo';
    }
  }
  if (id === 'nebbia') st.weather = 'nebbia';
  setTimeout(() => UI.toast(`Oggi nella Valle — ${EVENTI[id].n}: ${EVENTI[id].d}`), 2600);
}
{
  Ext.on('freeMorning', function (st) {
    if (isFree(st) && !G.visit) evMorning(st);
  });
}
function evMult(id) {
  const st = freeSt();
  if (!st) return 1;
  const ev = evToday(st);
  if (ev === 'pesce' && FISH_IDS.has(id)) return 1.5;
  if (ev === 'raccolto' && CROPS[id]) return 1.33;
  return 1;
}
// le stelle cadenti: dopo le 21 compaiono qua e là, si raccolgono come i frutti selvatici
Object.assign(ITEMS, {
  stella: {
    n: 'Polvere di stella',
    t: 'crop',
    v: 90,
    d: 'Raccolta dove è caduta una stella. Brilla anche al buio.'
  }
});
function evTick() {
  const st = freeSt();
  if (!st || G.visit || G.mode !== 'game' || evToday(st) !== 'stelle' || st.time < 21 * 60) return;
  const F = fx6(st);
  if (F.starDay === st.day) return;
  F.starDay = st.day;
  const W2 = st.free,
    m = G.maps.main;
  let n = 0;
  for (let i = 0; i < 40 && n < 7; i++) {
    const x = 5 + Math.floor(Math.random() * 54),
      y = 6 + Math.floor(Math.random() * 35),
      k = fkey(x, y);
    if (W2.debris[k] || W2.built[k] || st.farm[k] || m.objAt(x, y) || m.solid(x, y)) continue;
    W2.debris[k] = 'w_stella';
    n++;
  }
  rebuildMaps();
  if (G.map) G.map = G.maps[G.map.id];
  AU.play('ok');
  UI.toast("✦ Una stella cade sulla Valle. Poi un'altra. E un'altra ancora.");
}

// ================= IL MUSEO DELLA VALLE =================
const MUSEO_AT = [26, 9]; // impronta 4×3 (25-28, 7-9), porta in basso
PROTECT.push([24, 6, 29, 11]);
const COLL = {
  colture: { n: 'Colture', l: () => Object.keys(CROPS).filter(c => ITEMS[c]) },
  selvatici: { n: 'Raccolta selvatica', l: () => [...new Set(Object.values(WILD).flat())] },
  pesci: { n: 'Pesci', l: () => [...FISH_IDS] },
  minerali: {
    n: 'Minerali e rarità',
    l: () => ['ferro', 'quarzo', 'rame', 'nichel', 'oro', 'ametista', 'diamante', 'essenza', 'stella']
  },
  piatti: { n: 'Piatti', l: () => COOK.map(r => r.id).filter(id => ITEMS[id]) }
};
const museoN = st => Object.keys(fx6(st).museo).length;
const museoTot = () => Object.values(COLL).reduce((a, c) => a + c.l().length, 0);
const MUSEO_PREMI = { 10: ['scudi', 1000], 25: ['statua', 1], 40: ['lampadario', 1], 60: ['scudi', 8000] };
function museoMenu(cat) {
  const st = freeSt();
  if (!st) return;
  const F = fx6(st),
    M = F.museo;
  cat = cat || 'colture';
  const L = COLL[cat].l();
  const tabs = `<div class="tabs" style="flex-wrap:wrap">${Object.entries(COLL)
    .map(([k, c]) => {
      const l = c.l(),
        g = l.filter(i => M[i]).length;
      return `<button class="btn ${k === cat ? 'on' : ''}" data-mc="${k}">${c.n} ${g}/${l.length}</button>`;
    })
    .join('')}</div>`;
  const tot = museoTot(),
    n = museoN(st),
    next = Object.keys(MUSEO_PREMI)
      .map(Number)
      .find(k => k > n);
  UI.open(`<button class="btn mclose" data-close>✕</button><h2>Il Museo della Valle</h2><p class="small">Irene cura le teche. «Una cosa per tipo. Quello che doni resta qui per sempre, col tuo nome sotto.» — Donati: <b>${n}/${tot}</b>${next ? ` · prossimo premio a ${next}` : ''}</p>${tabs}
  <div class="cgrid" style="grid-template-columns:repeat(auto-fill,minmax(calc(44*var(--u)),1fr))">${L.map(
    id => {
      const has = M[id],
        can = !has && countItem(id) > 0;
      return `<div class="mcell${has ? ' on' : ''}" title="${esc(has || can ? ITEMS[id].n : '???')}"><canvas data-i="${id}" width="32" height="32" style="${has ? '' : 'filter:brightness(0) opacity(.35)'}"></canvas><span class="small">${has || can ? esc(ITEMS[id].n) : '???'}</span>${can ? `<button class="btn" data-don="${id}">Dona</button>` : ''}</div>`;
    }
  ).join('')}</div>`);
  const box = $('#mbox');
  box.querySelectorAll('canvas[data-i]').forEach(c => {
    const ic = ICON[c.dataset.i];
    if (ic) c.getContext('2d').drawImage(ic, 0, 0);
  });
  box.querySelectorAll('[data-mc]').forEach(
    b =>
      (b.onclick = () => {
        UI._mclose = null;
        museoMenu(b.dataset.mc);
      })
  );
  box.querySelectorAll('[data-don]').forEach(
    b =>
      (b.onclick = () => {
        const id = b.dataset.don;
        if (M[id] || !countItem(id)) return;
        removeItem(id, 1);
        M[id] = st.day;
        AU.play('ok');
        const n2 = museoN(st);
        UI.toast(`Donato al museo: ${ITEMS[id].n}. (${n2}/${museoTot()})`);
        const pr = MUSEO_PREMI[n2];
        if (pr) {
          if (pr[0] === 'scudi') {
            st.money += pr[1];
            UI.hud();
            UI.toast(`Premio del museo: +${SC(pr[1])}!`);
          } else {
            addItem(pr[0], pr[1]);
            UI.toast(`Premio del museo: ${ITEMS[pr[0]].n}!`);
          }
        }
        if (COLL[cat].l().every(i => M[i]))
          UI.toast(`Collezione completa: ${COLL[cat].n}! Irene ti stringe la mano.`);
        NET.save(st);
        UI._mclose = null;
        museoMenu(cat);
      })
  );
}
PROMPT.museo = 'Museo';
ACT.museo = () => {
  if (G.visit) {
    UI.toast('Il museo di un altro villaggio: puoi guardare, non donare.');
    return;
  }
  museoMenu();
};
{
  Ext.on('applyFree', function (m, st) {
    if (m.id !== 'main' || !isFree(st)) return;
    if (!IMG.museo) genSempreArt();
    const [x, y] = MUSEO_AT;
    const T = [];
    for (let j = y - 2; j <= y; j++) for (let i = x - 1; i <= x + 2; i++) T.push([i, j]);
    m.objs
      .filter(
        o =>
          o.kind !== 'built' &&
          o.kind !== 'bld' &&
          (T.some(([a, b]) => o.tx === a && o.ty === b) ||
            (o.ty >= y + 1 && o.ty <= y + 4 && o.tx >= x - 2 && o.tx <= x + 3))
      )
      .forEach(o => mapRemove(m, o));
    for (const [a, b] of T) m.set(a, b, 1);
    for (let i = x; i <= x + 1; i++) m.set(i, y + 1, 2);
    m.add(OB('museo', x - 1, y, IMG.museo, { wt: 4, act: 'museo', solid: T, hits: T }));
  });
}

// ================= TRAGUARDI =================
const TRAG = [
  ['costruttore', 'Costruttore', 'Costruisci 25 cose', st => Object.keys(st.free.built).length >= 25, 300],
  ['architetto', 'Architetto', 'Costruisci 80 cose', st => Object.keys(st.free.built).length >= 80, 1500],
  ['salone', 'Il salone', 'Porta la casa al livello 5', st => houseLv(st) >= 5, 2000],
  [
    'latifondo',
    'Latifondista',
    'Possiedi tutte le terre',
    st => Object.keys(PLOTS).every(k => (st.free.land || []).includes(k)),
    3000
  ],
  ['borgo', 'Borgo', 'Il villaggio diventa Borgo', st => myRank(st) >= 1, 200],
  ['paese', 'Paese', 'Il villaggio diventa Paese', st => myRank(st) >= 2, 600],
  ['citta', 'Città', 'Il villaggio diventa Città', st => myRank(st) >= 4, 3000],
  ['vicini', 'Buon vicinato', '4 nuovi abitanti', st => residents(st).length >= 4, 800],
  ['paese8', 'Tutti a casa', '8 nuovi abitanti', st => residents(st).length >= 8, 2500],
  ['pescatore', 'Pescatore', 'Pesca 50 pesci', st => (st.free.fished || 0) >= 50, 700],
  [
    'salmerino',
    'La moneta del lago',
    "Dona un salmerino d'oro al museo",
    st => !!fx6(st).museo.salmerino,
    800
  ],
  ['minatore', 'Minatore', 'Raggiungi il piano 10', st => (mineSt(st).deep || 0) >= 10, 400],
  ['abisso', "L'abisso", 'Raggiungi il piano 30', st => (mineSt(st).deep || 0) >= 30, 1500],
  ['senzafondo', 'Senza fondo', 'Raggiungi il piano 60', st => (mineSt(st).deep || 0) >= 60, 4000],
  ['curatore', 'Curatore', 'Dona 20 cose al museo', st => museoN(st) >= 20, 600],
  ['custode', 'Custode', 'Dona 50 cose al museo', st => museoN(st) >= 50, 2500],
  ['cuoco', 'Cuoco', 'Impara 12 ricette', st => COOK.filter(r => knows(st, r.id)).length >= 12, 500],
  [
    'amico',
    'Amico della Valle',
    '10 cuori con qualcuno',
    st => Object.keys(st.friends).some(id => (st.friends[id] || 0) >= 20),
    800
  ],
  ['lavoratore', 'Lavoratore', 'Completa 20 incarichi', st => (fx6(st).stats.inc || 0) >= 20, 600],
  ['instancabile', 'Instancabile', 'Completa 100 incarichi', st => (fx6(st).stats.inc || 0) >= 100, 3000],
  [
    'curioso',
    'Curioso',
    'Trova 8 curiosità',
    st => Object.keys(eggAll()).filter(k => st.flags['egg_' + k]).length >= 8,
    700
  ],
  [
    'tutto',
    'Niente sfugge',
    'Trova tutte le curiosità',
    st => Object.keys(eggAll()).every(k => st.flags['egg_' + k]),
    2500
  ],
  ['ricco', 'Ricco', 'Abbi 20.000 scudi', st => st.money >= 20000, 0],
  [
    'ricordi',
    'I quattro ricordi',
    'Trova i ricordi della Valle',
    st => Object.keys(fx6(st).ricordi).length >= 4,
    1000
  ],
  ['nove', 'Nove', 'Incontra chi non è stato contato', st => !!st.flags.nove, 2000]
];
let TRAG_T = 3;
function tragTick(dt) {
  const st = freeSt();
  if (!st || G.visit || G.mode !== 'game') return;
  TRAG_T -= dt;
  if (TRAG_T > 0 || G.cut || UI.busy()) return;
  TRAG_T = 3;
  const T = fx6(st).trag;
  for (const [id, n, d, ok, pay] of TRAG) {
    if (T[id] || !ok(st)) continue;
    T[id] = st.day;
    if (pay) {
      st.money += pay;
      UI.hud();
    }
    AU.play('ok');
    UI.toast(`🏆 Traguardo: ${n} — ${d}${pay ? ` · +${SC(pay)}` : ''}`);
    NET.save(st);
    break;
  }
  evTick();
  ricordiTick();
}
{
  Ext.on('mpTick', function (dt) {
    tragTick(dt);
  });
}
function tragHTML(st) {
  const T = fx6(st).trag,
    got = TRAG.filter(t => T[t[0]]).length;
  return (
    `<h3>Traguardi ${got}/${TRAG.length}</h3>` +
    TRAG.map(
      ([id, n, d, , pay]) =>
        `<p class="small">${T[id] ? '🏆' : '○'} <b>${esc(n)}</b> — ${esc(d)}${pay ? ` <span style="opacity:.7">(${SC(pay)})</span>` : ''}</p>`
    ).join('') +
    `<h3>Museo</h3><p class="small">Donati ${museoN(st)}/${museoTot()}. Il museo è a nord dei campi, vicino al sentiero del Varco.</p>` +
    `<h3>Voci della Valle</h3>` +
    VOCI.map(
      ([k, t]) =>
        `<p class="small">${fx6(st).ricordi[k] ? '✔ <s>' : '• '}${esc(t)}${fx6(st).ricordi[k] ? '</s>' : ''}</p>`
    ).join('')
  );
}
// una scheda nuova nel menu di pausa
{
  const _p = UI.pause.bind(UI);
  UI.pause = function (tab) {
    _p(tab === 'trag' ? 'diario' : tab);
    const st = freeSt();
    if (!st || !UI.modalOpen) return;
    const tb = $('#mbox .tabs');
    if (!tb) return;
    const b = document.createElement('button');
    b.className = 'btn' + (tab === 'trag' ? ' on' : '');
    b.textContent = 'Traguardi';
    b.onclick = () => {
      AU.play('ui');
      UI._mclose = null;
      UI.pause('trag');
    };
    tb.insertBefore(b, tb.children[2] || null);
    if (tab === 'trag') {
      tb.querySelectorAll('.btn').forEach(x => x.classList.toggle('on', x === b));
      while (tb.nextSibling) tb.nextSibling.remove();
      const d = document.createElement('div');
      d.innerHTML = tragHTML(st);
      tb.after(d);
    }
  };
}
{
}

// ================= MISSIONI A ORARI E STAGIONI: I QUATTRO RICORDI =================
// Ogni stagione, in un posto e a un'ora precisa, succede qualcosa una volta sola. Ogni volta un ricordo di Nove.
const VOCI = [
  ['inverno', "D'inverno, dopo mezzanotte, la tomba senza nome ha una candela accesa."],
  ['primavera', "In primavera, all'alba, sul pontile del Lago qualcuno lascia una barchetta di carta."],
  ['estate', "D'estate, tra le nove e le undici di sera, le lucciole del prato sud disegnano un numero."],
  ['autunno', 'In autunno, la notte di luna piena (il 14), dalla torre sulla Collina si contano le stelle.']
];
const RICORDI = {
  inverno: {
    s: 1,
    from: 24 * 60,
    to: 25 * 60 + 30,
    at: [
      [58, 6],
      [58, 7]
    ],
    item: 'fischietto',
    text: [
      "Sulla tomba senza nome c'è una candela accesa. Nessuno l'ha portata.",
      "Accanto alla candela, un fischietto di latta. Piccolo, da bambino. È caldo, come se qualcuno l'avesse appena stretto."
    ]
  },
  primavera: {
    s: 2,
    from: 5 * 60,
    to: 7 * 60,
    at: [
      [67, 31],
      [67, 32],
      [68, 31]
    ],
    need: () => zoneOpen('lago'),
    item: 'chiavina',
    text: [
      "Sul pontile, ferma sull'acqua, una barchetta di carta. Dentro c'è una chiave piccola, da carillon.",
      'Sulla carta, a matita: «per quando avrai finito di contare».'
    ]
  },
  estate: {
    s: 3,
    from: 21 * 60,
    to: 23 * 60,
    at: [
      [18, 38],
      [19, 38],
      [20, 38],
      [18, 39],
      [19, 39],
      [20, 39]
    ],
    item: 'disegno',
    text: [
      "Le lucciole si alzano tutte insieme dal prato. Per un momento disegnano qualcosa nell'aria.",
      "Un 9. Poi si spengono. Nell'erba, dove erano, c'è un foglio piegato: il disegno di nove figure che si tengono per mano."
    ]
  },
  autunno: {
    s: 0,
    day: 14,
    from: 22 * 60,
    to: 24 * 60 + 30,
    at: [
      [88, 7],
      [89, 7]
    ],
    need: () => zoneOpen('collina'),
    item: 'nastroazzurro',
    text: [
      'Dalla torre si vedono tutte le stelle sopra la Valle. Le conti. Otto costellazioni. Poi nove.',
      'Sul parapetto, legato stretto, un nastro azzurro. Non rosso. Azzurro.'
    ]
  }
};
Object.assign(ITEMS, {
  fischietto: { n: 'Fischietto di latta', t: 'key', d: 'Un ricordo di Nove.' },
  chiavina: { n: 'Chiave di carillon', t: 'key', d: 'Un ricordo di Nove.' },
  disegno: { n: 'Il disegno dei nove', t: 'key', d: 'Un ricordo di Nove.' },
  nastroazzurro: { n: 'Nastro azzurro', t: 'key', d: 'Un ricordo di Nove.' }
});
function ricordiAt(fx, fy) {
  const st = freeSt();
  if (!st || G.visit || G.map.id !== 'main') return false;
  const F = fx6(st),
    t = st.time,
    s = seasonOf(st);
  for (const k in RICORDI) {
    const R = RICORDI[k];
    if (
      F.ricordi[k] ||
      R.s !== s ||
      t < R.from ||
      t > R.to ||
      (R.day && seasonDay(st) !== R.day) ||
      (R.need && !R.need()) ||
      !R.at.some(([x, y]) => x === fx && y === fy)
    )
      continue;
    (async () => {
      G.cut++;
      try {
        AU.play('whisper');
        for (const l of R.text) await narr(l, { dark: 1 });
        F.ricordi[k] = st.day;
        addItem(R.item, 1);
        AU.play('ok');
        const n = Object.keys(F.ricordi).length;
        UI.toast(`Ricordo trovato (${n}/4): ${ITEMS[R.item].n}.`);
        if (n === 4)
          await narr(
            'Quattro ricordi. Ti viene in mente il pozzo della piazza, e una voce che conta fino a otto. Forse a mezzanotte qualcuno conterà fino a nove.'
          );
        NET.save(st);
      } finally {
        G.cut--;
      }
    })();
    return true;
  }
  // Nove: con i quattro ricordi, al pozzo, tra mezzanotte e l'una
  if (
    !st.flags.nove &&
    Object.keys(F.ricordi).length >= 4 &&
    t >= 24 * 60 &&
    t <= 25 * 60 &&
    Math.abs(fx - 47) <= 1 &&
    Math.abs(fy - 19) <= 1
  ) {
    noveIncontro(st);
    return true;
  }
  return false;
}
{
  Ext.on('freeAct:intercetta', function (fx, fy) {
    if (ricordiAt(fx, fy)) return true;
  });
}
// un brivido quando sei nel posto giusto all'ora giusta
function ricordiTick() {
  const st = freeSt();
  if (!st || G.map.id !== 'main') return;
  const F = fx6(st),
    t = st.time,
    s = seasonOf(st),
    [px, py] = ptile(G.player);
  for (const k in RICORDI) {
    const R = RICORDI[k];
    if (F.ricordi[k] || R.s !== s || t < R.from || t > R.to || (R.day && seasonDay(st) !== R.day)) continue;
    if (R.at.some(([x, y]) => Math.abs(x - px) <= 3 && Math.abs(y - py) <= 3) && Math.random() < 0.5)
      burst('dust', R.at[0][0] * 16 + 8, R.at[0][1] * 16 + 2, 4, '#bfe3ff');
  }
}

// ================= NOVE =================
NPC_DEF.push(['nove', 'Nove']);
NAMES.nove = 'Nove';
HOMES.nove = 'ponte';
LOOKS.nove = {
  skin: '#e8e2ea',
  hair: '#f0f0f6',
  style: 'long',
  eye: '#8ad0ff',
  shirt: '#c8d0e0',
  dress: '#9aa8c8',
  pants: '#8a90a8',
  shoe: '#5a6070'
};
SCHED.nove = function (st) {
  if (!isFree(st) || !st.flags.nove) return null;
  const t = st.time;
  if (t >= 20 * 60 && t < 25 * 60 + 30) return at(50, 9, 0, 'idle', 2);
  if (t >= 6 * 60 && t < 8 * 60) return at(47, 21, 3, 'idle', 1);
  return null;
};
async function noveIncontro(st) {
  G.cut++;
  try {
    AU.play('whisper');
    G.glitch = 6;
    await narr('Il pozzo tace. Poi una voce, vicinissima, conta: «…sette… otto…»', { dark: 1 });
    await narr(
      "«…nove.» Accanto a te c'è una bambina pallida, con i capelli bianchi e un vestito di un azzurro che non si usa più.",
      { dark: 1 }
    );
    const n = NPC('nove');
    placeNPC(n, 'main', 48, 19, 1);
    n.hidden = false;
    await say(
      'nove',
      'Mi hai trovata. Nessuno mi trova. Al Conteggio mi hanno sempre saltata: otto, e poi basta.'
    );
    await say(
      'nove',
      'I miei ricordi… li hai tenuti tu? Il fischietto, la chiave, il disegno, il nastro. Allora adesso sono di nuovo nove.'
    );
    await say(
      'nove',
      'Posso restare? Di notte sto al cimitero, la mattina presto vicino al pozzo. Non faccio paura. Quasi mai.'
    );
    st.flags.nove = st.day;
    st.flags.met.nove = 1;
    addFriend('nove', 2);
    AU.play('ok');
    UI.toast('Hai incontrato Nove. La troverai di notte al cimitero.');
    NET.save(st);
  } finally {
    G.cut--;
  }
}
const NOVE_L = [
  'Contavano sempre fino a otto. Io stavo zitta, così non si accorgevano.',
  'Il Cavaliere non mi vede. Non si vede quello che non si conta.',
  'Tu conti le cose? Io conto le stelle. Stanotte erano tante quante ieri, più una.',
  'Agatha mi lasciava il pane sul davanzale. Lo fa ancora. Non sa perché.'
];
const NOVE_SHOP = [
  ['stella', 150],
  ['lanternacarta', 90],
  ['alb_ciliegio', 300],
  ['diamante', 900]
];
FREE_ASK.nove = async n => {
  const st = G.st,
    h = hearts('nove');
  const c = await ask('nove', NOVE_L[(st.day + h) % NOVE_L.length], [
    'Chiacchiera',
    'Cose che ho trovato',
    'Un indovinello',
    'Niente'
  ]);
  if (c === 0) {
    await say(
      'nove',
      h >= 6
        ? 'Sei la prima persona che mi conta. Lo sai? Uno, due… nove. Grazie.'
        : h >= 3
          ? 'Mi piace quando passi. Il cimitero è più caldo.'
          : 'Shh. Se parli forte i morti si girano.'
    );
    return Chiacchiera.parla(n);
  }
  if (c === 1) {
    UI.open(
      `<button class="btn mclose" data-close>✕</button><h2>Le cose di Nove</h2><p class="small">«Le trovo di notte. Le do a chi mi conta.» — Hai <b>${CZ(st.money)}</b></p>` +
        NOVE_SHOP.map(
          ([id, p]) =>
            `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}</span><b class="price">${CZ(p)}</b><button class="btn" data-b="${id}" ${st.money >= p ? '' : 'disabled'}>×1</button></div>`
        ).join('')
    );
    $('#mbox')
      .querySelectorAll('canvas[data-i]')
      .forEach(cv => {
        const ic = ICON[cv.dataset.i];
        if (ic) cv.getContext('2d').drawImage(ic, 0, 0);
      });
    $('#mbox')
      .querySelectorAll('[data-b]')
      .forEach(
        b =>
          (b.onclick = () => {
            const [id, p] = NOVE_SHOP.find(x => x[0] === b.dataset.b);
            if (st.money < p || !addItem(id, 1)) return;
            st.money -= p;
            AU.play('coin');
            UI.hud();
            b.disabled = st.money < p;
          })
      );
    return true;
  }
  if (c === 2) {
    const Q = [
      ["Più ne togli, più diventa grande. Cos'è?", 'buca'],
      ['Ha un collo ma non ha la testa. Come il Cavaliere.', 'bottiglia'],
      ['Cammina sempre e non arriva mai.', 'tempo'],
      ['Lo conti, ma non lo vedi mai finire. Nella Valle ce ne sono nove.', '?']
    ];
    const q = Q[st.day % Q.length];
    const F = fx6(st);
    if (F.indov === st.day) return say('nove', 'Uno al giorno. Domani un altro.');
    F.indov = st.day;
    await say('nove', q[0]);
    await say('nove', `La risposta è «${q[1]}». Hihi. Tieni, per aver ascoltato.`);
    st.money += 80;
    addFriend('nove', 1);
    UI.hud();
    return true;
  }
  return false;
};

// ================= CURIOSITÀ NUOVE =================
Object.assign(EGG_EXTRA, {
  tredici: {
    t: 'Il piano tredici',
    lore: 'Al piano 13 della miniera qualcuno ha scritto sulla roccia: «NON CONTARE I PIANI». Sotto, nove tacche.'
  },
  stivale: {
    t: 'Lo stivale del lago',
    lore: 'Pescando, uno stivale vecchio. Dentro, un biglietto: «se lo trovi, il piede è ancora qui».'
  },
  omonimo: {
    t: 'Lo stesso nome',
    lore: "Ti chiami come il nonno. Ezekiel, quando l'ha saputo, ha smesso di guardarti negli occhi."
  },
  spaventa: {
    t: 'Lo spaventapasseri a mezzanotte',
    lore: 'Dopo mezzanotte lo spaventapasseri non guarda la strada. Guarda te. Ha sorriso.'
  },
  codice: {
    t: 'Il vecchio codice',
    lore: 'Su, su, giù, giù, sinistra, destra, sinistra, destra. Il Cavaliere, da qualche parte, si è tolto il cappello. Che non ha.'
  },
  stelle: {
    t: 'Le nove costellazioni',
    lore: 'Dalla torre, di notte, le costellazioni sopra la Valle sono nove. Nei libri ce ne sono otto.'
  }
});
{
  const _mg = mineGo;
  mineGo = async function (f) {
    await _mg(f);
    if (f === 13 && !G.st.flags.egg_tredici) {
      G.cut++;
      try {
        await narr(
          'Sulla roccia, vicino alla scala, qualcuno ha inciso con un chiodo: «NON CONTARE I PIANI». Sotto, nove tacche.',
          { dark: 1 }
        );
        await eggFound('tredici');
      } finally {
        G.cut--;
      }
    }
  };
}
{
  const _fp = fishPull;
  fishPull = function () {
    const f = G.fish,
      st = G.st;
    if (f && f.st === 'bite' && !st.flags.egg_stivale && Math.random() < 0.04) {
      G.fish = null;
      (async () => {
        G.cut++;
        try {
          await narr('Tiri su qualcosa di pesante. Uno stivale vecchio, pieno di fango.');
          await narr('Dentro, un biglietto bagnato: «se lo trovi, il piede è ancora qui».', { dark: 1 });
          await eggFound('stivale');
        } finally {
          G.cut--;
        }
      })();
      return;
    }
    return _fp();
  };
}
{
  const _fs = freeStart;
  freeStart = async function (e) {
    await _fs(e);
    const st = G.st;
    if (/^elias$/i.test((st.name || '').trim()) && !st.flags.egg_omonimo) {
      G.cut++;
      try {
        await narr(
          'Sulla soglia, Ezekiel ti guarda a lungo. «Elias.» Poi si volta e se ne va senza dire altro.'
        );
        await eggFound('omonimo');
      } finally {
        G.cut--;
      }
    }
  };
}
{
  const _sc = ACT.scare;
  ACT.scare = async o => {
    const st = G.st;
    if (isFree(st) && st.time >= 24 * 60 && !st.flags.egg_spaventa) {
      AU.play('whisper');
      G.glitch = 5;
      await narr(
        'Lo spaventapasseri ha girato la testa. Verso di te. Il sorriso cucito è più largo di stamattina.',
        { dark: 1 }
      );
      await eggFound('spaventa');
      return;
    }
    return _sc(o);
  };
}
{
  const _tr = ACT.torre;
  ACT.torre = async () => {
    const st = G.st;
    if (isFree(st) && st.time >= 22 * 60 && !st.flags.egg_stelle) {
      await narr(
        'Di notte, dalla torre, il cielo sopra la Valle è pieno. Conti le costellazioni. Otto. Le riconti.'
      );
      await narr('Nove.', { dark: 1 });
      await eggFound('stelle');
      return;
    }
    return _tr();
  };
}
{
  const K = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA'
  ];
  let i = 0;
  addEventListener('keydown', e => {
    if (e.repeat) return;
    i = e.code === K[i] ? i + 1 : e.code === K[0] ? 1 : 0;
    if (i === K.length) {
      i = 0;
      const st = G.st;
      if (G.mode === 'game' && st && isFree(st) && !st.flags.egg_codice) {
        (async () => {
          G.cut++;
          try {
            AU.play('hooves');
            G.shake = 3;
            await narr(
              'Da lontano, zoccoli. Poi niente. Ti sembra di vedere, sul crinale, un cavaliere che si toglie il cappello. Il cappello che non ha.'
            );
            await eggFound('codice');
          } finally {
            G.cut--;
          }
        })();
      }
    }
  });
}

// ================= GRAFICA =================
function genSempreArt() {
  const stone = rp('#9a968c'),
    roof = rp('#3a4a6a'),
    wood = rp('#7a5030');
  IMG.museo = SP(64, 52, P => {
    P.rect(6, 36, 116, 64, stone, {
      mod: (X, Y, v) => {
        const r = Math.floor(Y / 6),
          off = r % 2 ? 5 : 0;
        return Y % 6 === 0 || (X + off) % 12 === 0 ? v - 0.22 : v;
      }
    });
    P.body(
      14,
      38,
      () => 64,
      Y => 22 + (Y - 14) * 1.7,
      roof,
      { nyF: () => -0.6, mod: (X, Y, v) => (Y % 4 === 0 ? v - 0.2 : v) }
    );
    P.rect(10, 36, 108, 4, rp('#e8e0d0'), { spec: 0.5 });
    for (const x of [16, 36, 92, 112]) P.capsule(x, 42, x, 98, 3, rp('#e8e0d0'), { spec: 0.6 });
    P.rect(54, 66, 20, 34, rp('#4a2a14'));
    P.rect(52, 64, 24, 3, rp('#c8a03a'), { spec: 0.8 });
    for (const x of [26, 98]) P.rect(x - 6, 56, 12, 16, rp('#ffe08a'), { spec: 0.8 });
    P.rect(48, 20, 32, 10, rp('#c8a03a'), { spec: 0.8 });
  });
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  I('stella', P => {
    for (let a = 0; a < 5; a++) {
      const t = (a / 5) * Math.PI * 2 - Math.PI / 2;
      P.capsule(16, 17, 16 + Math.cos(t) * 11, 17 + Math.sin(t) * 11, 2.4, rp('#f6e08a'), { spec: 1 });
    }
    P.ellipse(16, 17, 5, 5, rp('#fff6c0'), { amb: 1 });
  });
  I('fischietto', P => {
    P.capsule(8, 18, 22, 14, 4, rp('#b8b8c0'), { spec: 0.9 });
    P.ellipse(24, 13, 4, 4, rp('#9a9aa2'), { spec: 0.8 });
  });
  I('chiavina', P => {
    P.ellipse(10, 12, 5, 5, rp('#c8a03a'), { spec: 0.9 });
    P.capsule(14, 15, 26, 25, 1.6, rp('#c8a03a'), { spec: 0.9 });
    P.rect(22, 22, 3, 5, rp('#c8a03a'));
  });
  I('disegno', P => {
    P.rect(5, 6, 22, 20, rp('#efe2c2'));
    for (let i = 0; i < 9; i++) {
      const x = 8 + i * 2.2;
      P.line(x, 20, x, 14, C('#3a3a5a'));
      P.ellipse(x, 12, 1, 1, rp('#3a3a5a'));
    }
  });
  I('nastroazzurro', P => {
    P.capsule(8, 8, 24, 24, 2.4, rp('#5a9ad8'), { spec: 0.6 });
    P.capsule(24, 8, 8, 24, 2.4, rp('#5a9ad8'), { spec: 0.6 });
  });
  const [c, x] = mk(24, 24);
  x.imageSmoothingEnabled = false;
  x.drawImage(ICON.stella, 0, 0, 24, 24);
  c.s = 2;
  FREEIMG.w_stella = c;
}
// le curiosità nascoste non si vedono nella lista finché non le trovi; il resto è nel menu ☰ → Traguardi
GUIDES.push({
  id: 'sempre',
  v: 6,
  n: 'Sempre qualcosa da fare',
  steps: [
    {
      t: 'Novità: ogni mattina la <b>bacheca in piazza</b> ha 3 incarichi nuovi, più uno della settimana che paga di più.',
      at: () => ({ x: 40 * 16 + 8, y: 17 * 16, l: 'Bacheca' })
    },
    {
      t: 'A nord dei campi, vicino al sentiero del Varco, ha aperto il <b>Museo della Valle</b>: dona una cosa per tipo, completa le collezioni, prendi i premi.',
      at: () => ({ x: MUSEO_AT[0] * 16 + 16, y: MUSEO_AT[1] * 16 + 4, l: 'Museo' })
    },
    {
      t: "Nel menu ☰ c'è la scheda <b>Traguardi</b>, con le «Voci della Valle»: cose che succedono solo in certe stagioni, a certe ore. Qualcuno, nella Valle, aspetta di essere contato."
    }
  ]
});
