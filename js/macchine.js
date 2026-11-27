'use strict';
// ================= FARMING E COSTRUZIONE, LIVELLO DUE =================
// Abilità con vantaggi, macchine che trasformano i raccolti, alberi da frutto, lastricato, muretti, aiuole.

// ---------- abilità ----------
const SKILLS = {
  agri: { n: 'Agricoltura', ico: '🌱' },
  racc: { n: 'Raccolta', ico: '🪓' },
  arti: { n: 'Artigianato', ico: '🔨' }
};
const SK_XP = [0, 60, 160, 320, 560, 900, 1350, 1950, 2700, 3700];
const SK_PERK = {
  agri: {
    2: 'Raccolti venduti al 10% in più',
    4: 'Più raccolti abbondanti',
    6: "L'annaffiatoio bagna tre zolle",
    8: 'Raccolti venduti al 25% in più',
    10: 'A volte una pianta cresce due tacche in una notte'
  },
  racc: {
    2: 'Abbattere e spaccare costa meno energia',
    4: '+1 legna e pietra a ogni colpo finale',
    6: 'Più minerale di ferro dalle rocce',
    8: 'A volte i selvatici sono doppi',
    10: 'Gli alberi ricrescono in metà tempo'
  },
  arti: {
    2: "Sblocca l'irrigatore grande",
    3: 'Sblocca il barattolo delle conserve',
    4: "Sblocca la botte e l'apiario",
    6: 'Sblocca muretti e aiuole',
    8: 'Le macchine lavorano un giorno prima'
  }
};
const skLv = (k, st) => {
  st = st || G.st;
  const x = ((st.free && st.free.xp) || {})[k] || 0;
  let l = 1;
  for (let i = 1; i < SK_XP.length; i++) if (x >= SK_XP[i]) l = i + 1;
  return l;
};
function addXP(k, n) {
  const st = G.st;
  if (!isFree(st) || G.visit) return;
  st.free.xp = st.free.xp || {};
  const before = skLv(k);
  st.free.xp[k] = (st.free.xp[k] || 0) + n;
  const after = skLv(k);
  if (after > before) {
    AU.play('ok');
    UI.toast(
      `${SKILLS[k].ico} ${SKILLS[k].n}: livello ${after}!${SK_PERK[k][after] ? ' ' + SK_PERK[k][after] + '.' : ''}`
    );
    floatText('LIVELLO ' + after, G.player.x, G.player.y - 34, '#f6d98a', 2.4);
  }
}
function skillsHTML() {
  const st = G.st,
    X = (st.free && st.free.xp) || {};
  return Object.entries(SKILLS)
    .map(([k, s]) => {
      const l = skLv(k),
        x = X[k] || 0,
        nx = SK_XP[l] || null,
        pv = SK_XP[l - 1] || 0,
        pc = nx ? Math.round(((x - pv) / (nx - pv)) * 100) : 100;
      return `<h3>${s.ico} ${s.n} — livello ${l}</h3><div style="height:calc(5*var(--u));background:#d8c49a;box-shadow:inset 0 0 0 var(--u) #7a4a20"><div style="height:100%;width:${pc}%;background:linear-gradient(#a8d860,#5a9a2a)"></div></div><p class="small">${nx ? `${x}/${nx} punti esperienza` : 'Livello massimo'}<br>${Object.entries(
        SK_PERK[k]
      )
        .map(
          ([lv, t]) =>
            `<span style="opacity:${l >= +lv ? 1 : 0.5}">${l >= +lv ? '✔' : '✦'} Liv. ${lv}: ${t}</span>`
        )
        .join('<br>')}</p>`;
    })
    .join('');
}

// ---------- minerale, fornace, lingotti ----------
Object.assign(ITEMS, {
  ferro: { n: 'Minerale di ferro', t: 'res', d: 'Dalle rocce, a volte. Nella fornace diventa lingotto.' },
  lingotto: {
    n: 'Lingotto di ferro',
    t: 'res',
    d: "Serve per le macchine, l'irrigatore grande e, all'incudine, per forgiare gli attrezzi."
  },
  // i metalli rari si fondono come il ferro: dalla roccia al lingotto, nella fornace
  lingotto_rame: {
    n: 'Lingotto di rame',
    t: 'res',
    v: 190,
    d: 'Quattro minerali di rame e una legna, nella fornace. Fili, tubi, fontane, congegni.'
  },
  lingotto_nichel: {
    n: 'Lingotto di nichel',
    t: 'res',
    v: 280,
    d: 'Quattro minerali di nichel e una legna, nella fornace. Specchi, lampadari, filo d’argento al telaio.'
  },
  lingotto_oro: {
    n: "Lingotto d'oro",
    t: 'res',
    v: 520,
    d: "Tre pepite d'oro grezzo e una legna, nella fornace. Per le cose che durano: la serra grande, le statue, gli attrezzi d'oro."
  },
  incudine: {
    n: 'Incudine',
    t: 'place',
    d: 'Su un ceppo, accanto alla fornace: con i lingotti e un po’ di legna ci forgi gli attrezzi.'
  },
  falce: {
    n: 'Falce',
    t: 'tool',
    d: "Falcia l'erba alta: fibra senza andarla a cercare. Dopo qualche giorno l'erba ricresce."
  },
  lastre: {
    n: 'Lastre di pietra',
    t: 'place',
    p: 12,
    d: "Per lastricare i vialetti. Tienile in mano e usale sull'erba delle tue terre."
  },
  fornace: {
    n: 'Fornace',
    t: 'place',
    d: 'Minerale e legna a sinistra, lingotti a destra. Fonde il ferro (5), il rame e il nichel (4) e l’oro (3): ogni volta con 1 legna.'
  },
  barattolo: {
    n: 'Barattolo delle conserve',
    t: 'place',
    d: 'Un raccolto dentro, in tre ore una conserva che vale molto di più.'
  },
  botte: { n: 'Botte', t: 'place', d: 'Frutta dentro: in otto ore, succo da vendere caro.' },
  apiario: {
    n: 'Apiario',
    t: 'place',
    d: "Ogni tre giorni, miele. Le api amano i fiori: d'inverno dormono."
  },
  irrigatore2: { n: 'Irrigatore grande', t: 'place', d: 'Ogni mattina bagna le otto zolle intorno.' },
  aiuola: { n: 'Aiuola', t: 'place', d: 'Fiori di stagione, davanti a casa.' },
  muretto: { n: 'Muretto a secco', t: 'place', d: "Pietre una sull'altra, come facevano i fondatori." },
  miele: { n: 'Miele', t: 'crop', v: 140 },
  alb_melo: {
    n: 'Alberello di melo',
    t: 'place',
    tree: 'mela',
    p: 300,
    d: 'Matura in 12 giorni. Mele in autunno.'
  },
  alb_pero: {
    n: 'Alberello di pero',
    t: 'place',
    tree: 'pera',
    p: 300,
    d: 'Matura in 12 giorni. Pere in autunno.'
  },
  alb_ciliegio: {
    n: 'Alberello di ciliegio',
    t: 'place',
    tree: 'ciliegie',
    p: 320,
    d: 'Matura in 12 giorni. Ciliegie in primavera.'
  },
  alb_pesco: {
    n: 'Alberello di pesco',
    t: 'place',
    tree: 'pesca',
    p: 320,
    d: "Matura in 12 giorni. Pesche d'estate."
  },
  mela: { n: 'Mela', t: 'crop', v: 70 },
  pera: { n: 'Pera', t: 'crop', v: 75 },
  ciliegie: { n: 'Ciliegie', t: 'crop', v: 90 },
  pesca: { n: 'Pesca', t: 'crop', v: 85 }
});
Object.assign(PL, {
  mela: 'mele',
  pera: 'pere',
  ciliegie: 'cestini di ciliegie',
  pesca: 'pesche',
  miele: 'vasetti di miele'
});
Object.assign(SG, {
  mela: 'una mela',
  pera: 'una pera',
  ciliegie: 'un cestino di ciliegie',
  pesca: 'una pesca',
  miele: 'un vasetto di miele'
});
Object.assign(PLACE_TOOL, {
  fornace: 'piccone',
  incudine: 'piccone',
  barattolo: 'accetta',
  botte: 'accetta',
  apiario: 'accetta',
  irrigatore2: 'piccone',
  aiuola: 'pala',
  muretto: 'piccone'
});
const FRUIT = {
  mela: { s: [0], c: '#d8302a' },
  pera: { s: [0], c: '#c8c83a' },
  ciliegie: { s: [2], c: '#a8102a' },
  pesca: { s: [3], c: '#f0a060' }
};
const JUICY = ['fragola', 'anguria', 'more', 'fragoline', 'pomodoro', 'mela', 'pera', 'ciliegie', 'pesca'];
// conserve e succhi: un prodotto per ogni raccolto
function makeProducts() {
  for (const id of Object.keys(ITEMS)) {
    const it = ITEMS[id];
    if (
      it.t !== 'crop' ||
      id.startsWith('cons_') ||
      id.startsWith('succo_') ||
      id === 'miele' ||
      id === 'uovo' ||
      id === 'latte'
    )
      continue;
    ITEMS['cons_' + id] = {
      n: 'Conserva di ' + it.n.toLowerCase(),
      t: 'crop',
      v: Math.round(it.v * 2 + 30),
      pre: id
    };
    if (JUICY.includes(id))
      ITEMS['succo_' + id] = {
        n: 'Succo di ' + it.n.toLowerCase(),
        t: 'crop',
        v: Math.round(it.v * 3 + 20),
        pre: id
      };
  }
}
makeProducts();
// ricette del banco, divise per categoria; lv: livello di Artigianato richiesto
CRAFTS.forEach(
  r =>
    (r.cat =
      r.cat ||
      {
        recinto: 'est',
        concime: 'agr',
        cassa: 'cas',
        panchina: 'est',
        lampione: 'est',
        irrigatore: 'agr',
        banco: 'cas',
        fieno: 'agr',
        pollaio: 'edi',
        stalla: 'edi'
      }[r.id] ||
      'cas')
);
CRAFTS.push(
  { id: 'lastre', q: 4, c: { pietra: 3 }, cat: 'est' },
  { id: 'fornace', q: 1, c: { pietra: 25, legna: 10 }, cat: 'mac' },
  { id: 'incudine', q: 1, c: { pietra: 10, lingotto: 2, legna: 5 }, cat: 'mac' },
  // all'incudine: gli attrezzi (anche per rifarsi quelli persi)
  { id: 'hoe', q: 1, c: { lingotto: 1, legna: 4 }, cat: 'att' },
  { id: 'can', q: 1, c: { lingotto: 2 }, cat: 'att' },
  { id: 'accetta', q: 1, c: { lingotto: 1, legna: 4 }, cat: 'att' },
  { id: 'piccone', q: 1, c: { lingotto: 2, legna: 4 }, cat: 'att' },
  { id: 'pala', q: 1, c: { lingotto: 1, legna: 4 }, cat: 'att' },
  { id: 'falce', q: 1, c: { lingotto: 1, legna: 3 }, cat: 'att' },
  { id: 'barattolo', q: 1, c: { legna: 15, lingotto: 1 }, cat: 'mac', lv: 3 },
  { id: 'botte', q: 1, c: { legna: 30, lingotto: 1 }, cat: 'mac', lv: 4 },
  { id: 'apiario', q: 1, c: { legna: 25, fibra: 10 }, cat: 'mac', lv: 4 },
  { id: 'irrigatore2', q: 1, c: { lingotto: 2, pietra: 15, legna: 5 }, cat: 'agr', lv: 2 },
  { id: 'aiuola', q: 1, c: { pietra: 4, fibra: 6 }, cat: 'est', lv: 6 },
  { id: 'muretto', q: 2, c: { pietra: 6 }, cat: 'est', lv: 6 }
);
const CRAFT_CAT = { agr: 'Campi', mac: 'Macchine', edi: 'Edifici', est: 'Esterni', cas: 'Casa' };
// le stazioni di lavoro: ognuna con il suo nome e le sue schede (le ricette stanno tutte in CRAFTS)
const STAZIONI = {
  banco: { n: 'Banco da lavoro', cats: CRAFT_CAT },
  incudine: { n: 'Incudine', cats: { att: 'Attrezzi' } }
};
function craftMenu(cat, staz = 'banco') {
  const S = STAZIONI[staz];
  G.craftCat = G.craftCat || {};
  cat = cat && S.cats[cat] ? cat : G.craftCat[staz] || Object.keys(S.cats)[0];
  G.craftCat[staz] = cat;
  const st = G.st,
    has = c => Object.entries(c).every(([k, n]) => countItem(k) >= n);
  const L = CRAFTS.filter(r => r.cat === cat);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${S.n}</h2><div class="staz staz-${staz}"><i></i><i></i><i></i></div><div class="tabs">${Object.entries(
      S.cats
    )
      .map(([k, n]) => `<button class="btn ${k === cat ? 'on' : ''}" data-cat="${k}">${n}</button>`)
      .join(
        ''
      )}</div><p class="small">Legna ${countItem('legna')} · Pietra ${countItem('pietra')} · Fibra ${countItem('fibra')} · Ferro ${countItem('ferro')} · Lingotti ${countItem('lingotto')} — Artigianato liv. ${skLv('arti')}</p>` +
      L.map(r => {
        const i = CRAFTS.indexOf(r),
          lock = r.lv && skLv('arti') < r.lv;
        return `<div class="mrow"><canvas data-i="${r.id}" width="32" height="32"></canvas><span>${ITEMS[r.id].n}${r.q > 1 ? ' ×' + r.q : ''}<br><span class="small">${
          lock
            ? `🔒 Artigianato liv. ${r.lv}`
            : Object.entries(r.c)
                .map(
                  ([k, n]) =>
                    `<span style="color:${countItem(k) >= n ? 'inherit' : '#a8301a'}">${n} ${ITEMS[k].n}</span>`
                )
                .join(' · ')
        } — ${ITEMS[r.id].d || ''}</span></span><button class="btn" data-r="${i}" ${!lock && has(r.c) ? '' : 'disabled'}>Crea</button></div>`;
      }).join('')
  );
  $('#mbox')
    .querySelectorAll('canvas[data-i]')
    .forEach(c => {
      const i = ICON[c.dataset.i];
      if (i) c.getContext('2d').drawImage(i, 0, 0);
    });
  $('#mbox')
    .querySelectorAll('[data-cat]')
    .forEach(
      b =>
        (b.onclick = () => {
          UI._mclose = null;
          craftMenu(b.dataset.cat, staz);
        })
    );
  $('#mbox')
    .querySelectorAll('[data-r]')
    .forEach(
      b =>
        (b.onclick = () => {
          const r = CRAFTS[+b.dataset.r];
          if (!has(r.c) || (r.lv && skLv('arti') < r.lv)) return;
          if (!addItem(r.id, r.q)) return;
          for (const [k, n] of Object.entries(r.c)) removeItem(k, n);
          AU.play('ok');
          st.flags.crafted = (st.flags.crafted || 0) + 1;
          addXP('arti', 8);
          UI.toast(`Creato: ${ITEMS[r.id].n}${r.q > 1 ? ' ×' + r.q : ''}`);
          UI._mclose = null;
          craftMenu(cat, staz);
        })
    );
}

// ---------- la fusione: quale minerale, quanti per lingotto, quanto tempo ----------
const FUSIONE = {
  ferro: { n: 5, out: 'lingotto', min: 90 },
  rame: { n: 4, out: 'lingotto_rame', min: 100 },
  nichel: { n: 4, out: 'lingotto_nichel', min: 120 },
  oro: { n: 3, out: 'lingotto_oro', min: 150 }
};
const MAC_MIN_FUSIONE = Object.fromEntries(Object.entries(FUSIONE).map(([k, v]) => [k, v.min]));
// ---------- macchine ----------
// Ogni macchina ha la sua schermata (stile fornace): a sinistra quello che metti dentro (e la legna, se brucia),
// al centro la freccia che si riempie, a destra quello che esce. Lavora un pezzo alla volta, col tempo del gioco:
// la fornace fa un lingotto ogni ora e mezza, anche quando non la guardi e mentre dormi.
// Lo stato sta in b.m: { i: cosa c'è dentro, in: quanti, f: legna, o: cosa è uscito, on: quanti, t0: inizio del pezzo }
const MACH = {
  barattolo: { days: 1, ok: id => ITEMS['cons_' + id], out: id => 'cons_' + id },
  botte: { days: 3, ok: id => ITEMS['succo_' + id], out: id => 'succo_' + id },
  fornace: {
    days: 1,
    ok: id => !!FUSIONE[id],
    need: id => (FUSIONE[id] || FUSIONE.ferro).n,
    out: id => (FUSIONE[id] || FUSIONE.ferro).out,
    fuel: 'legna',
    vuole: 'ferro',
    aiutoFuoco:
      'Metti <b>5 minerali di ferro</b>, <b>4 di rame</b>, <b>4 di nichel</b> o <b>3 pepite d’oro</b>, e <b>1 legna</b> per ogni lingotto.'
  }
};
// minuti di gioco per ogni pezzo (un'ora di gioco sono 25 secondi veri)
const MAC_MIN = {
  fornace: b => (FUSIONE[b.m && b.m.i] || FUSIONE.ferro).min,
  barattolo: 180,
  botte: 480,
  frantoio: 360,
  essiccatoio: 240,
  zangola: 120,
  alambicco: 600,
  seminatrice: 120,
  compostiera: 360,
  fornoalegna: 90
};
const MAC_MAX = 99;
const macAbs = (st = G.st) => st.day * 1440 + st.time;
const macDur = b => {
  const v = MAC_MIN[b.id];
  return (typeof v === 'function' ? v(b) : v) || (MACH[b.id].days || 1) * 240;
};
const macNeed = (M, id) => (typeof M.need === 'function' ? M.need(id) : M.need || 1);
const macOutN = (M, id) => (typeof M.n === 'function' ? M.n(id) : 1);
// lo stato della macchina (e i lavori del vecchio sistema diventano prodotti pronti)
function macStato(b) {
  if (!b.m) b.m = { i: null, in: 0, f: 0, o: null, on: 0, t0: null };
  if (b.job) {
    // il mulino di prima teneva solo quanta farina: { n, ready, t }
    if (b.id === 'mulino' && !b.job.out) b.job.out = 'farina';
    if (b.job.out && ITEMS[b.job.out] && (!b.m.o || b.m.o === b.job.out)) {
      b.m.o = b.job.out;
      b.m.on += b.job.n > 0 ? b.job.n : 1;
    }
    delete b.job;
  }
  return b.m;
}
// perché è ferma (o '' se può lavorare)
function macFermo(b) {
  const m = macStato(b),
    M = MACH[b.id];
  if (!m.i || !m.in) return 'vuota';
  if (m.in < macNeed(M, m.i)) return 'poco';
  if (M.fuel && !(m.f > 0)) return 'fuoco';
  const out = M.out(m.i);
  if (m.on > 0 && m.o !== out) return 'altro'; // fuori c'è un prodotto diverso: prima va preso
  if (m.on + macOutN(M, m.i) > MAC_MAX) return 'piena';
  return '';
}
// fa avanzare il lavoro fino ad adesso (si chiama prima e dopo ogni cambiamento, e quando la si guarda)
function macSim(b, now = macAbs()) {
  const m = macStato(b),
    M = MACH[b.id];
  if (!M) return m;
  for (let g = 0; g < 1000; g++) {
    if (macFermo(b)) {
      m.t0 = null;
      return m;
    }
    if (m.t0 == null) {
      m.t0 = now;
      return m;
    }
    const d = macDur(b);
    if (now - m.t0 < d) return m;
    const id = m.i;
    m.in -= macNeed(M, id);
    if (M.fuel) m.f--;
    m.o = M.out(id);
    m.on += macOutN(M, id);
    m.t0 += d;
    if (m.in <= 0) {
      m.in = 0;
      m.i = null;
    }
  }
  return m;
}
// lavora adesso?
function macLav(b) {
  if (!b || !MACH[b.id]) return false;
  return macSim(b).t0 != null;
}
// quanto manca al pezzo in corso (0..1 fatto, minuti che mancano)
function macProg(b) {
  const m = macSim(b);
  if (m.t0 == null) return { p: 0, rest: 0 };
  const d = macDur(b),
    e = macAbs() - m.t0;
  return { p: Math.max(0, Math.min(1, e / d)), rest: Math.max(0, d - e) };
}
// quanti pezzi si possono ancora fare con quello che c'è dentro
function macPezzi(b) {
  const m = macStato(b),
    M = MACH[b.id];
  if (!m.i) return 0;
  let n = Math.floor(m.in / macNeed(M, m.i));
  if (M.fuel) n = Math.min(n, m.f || 0);
  return n;
}
const macVuota = b => !b.m || (!b.m.in && !b.m.f && !b.m.on);
function macMin(n) {
  n = Math.ceil(n);
  const h = Math.floor(n / 60),
    mm = n % 60;
  return h ? `${h} h${mm ? ' ' + mm + ' min' : ''}` : `${mm} min`;
}
function macOra(abs) {
  const st = G.st,
    d = Math.floor(abs / 1440) - st.day,
    t = ((abs % 1440) + 1440) % 1440,
    s = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  return d <= 0 ? 'alle ' + s : d === 1 ? 'domani alle ' + s : `tra ${d} giorni`;
}

function machineAct(k, b, o) {
  const it = selItem(),
    id = it && it.id;
  if (b.id === 'apiario') {
    if (id && id === PLACE_TOOL[b.id]) return false;
    apiGui(k, b);
    return true;
  }
  if (!MACH[b.id]) return false;
  if (id && id === PLACE_TOOL[b.id]) return false;
  macGui(k, b);
  return true;
}

// ---------- la schermata della macchina ----------
const MACG = { k: null, b: null, timer: 0, firma: '' };
function macIcona(el, id, ghost) {
  const c = el.querySelector('canvas');
  if (!c) return;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 32, 32);
  if (id && ICON[id]) {
    x.globalAlpha = ghost ? 0.22 : 1;
    x.drawImage(ICON[id], 0, 0);
    x.globalAlpha = 1;
  }
}
function macTesto(b) {
  const m = macSim(b),
    M = MACH[b.id],
    perche = macFermo(b);
  if (!perche) {
    const pr = macProg(b),
      n = macPezzi(b),
      nome = ITEMS[M.out(m.i)].n,
      fine = macAbs() + pr.rest + (n - 1) * macDur(b);
    return (
      `<b>${esc(nome)}</b>: il prossimo tra <b>${macMin(pr.rest)}</b>.` +
      (n === 2
        ? ` Poi un altro, pronto ${macOra(fine)}.`
        : n > 2
          ? ` Poi altri ${n - 1}, tutto pronto ${macOra(fine)}.`
          : '')
    );
  }
  if (perche === 'piena') return 'Prendi quello che è pronto: la macchina è piena e si è fermata.';
  if (perche === 'altro')
    return `Si è fermata: prima prendi <b>${esc(ITEMS[m.o].n.toLowerCase())}</b> qui a destra, poi ${M.fuel ? 'fonde' : 'lavora'} <b>${esc(ITEMS[m.i].n.toLowerCase())}</b>. Non si mescolano.`;
  if (perche === 'fuoco') return 'Il fuoco è spento: metti della <b>legna</b> qui sotto.';
  if (perche === 'poco')
    return `Ne servono <b>${macNeed(M, m.i)}</b> per volta: aggiungine ancora ${macNeed(M, m.i) - m.in}.`;
  if (M.aiutoFuoco)
    return `${M.aiutoFuoco} Il ferro ci mette ${macMin(MAC_MIN_FUSIONE.ferro)}, l’oro ${macMin(MAC_MIN_FUSIONE.oro)}.`;
  return M.fuel
    ? `Metti <b>${macNeed(M, M.vuole)} ${esc(ITEMS[M.vuole].n.toLowerCase())}</b> e <b>1 legna</b> per ogni ${esc(ITEMS[M.out(M.vuole)].n.toLowerCase())}. Ognuno ci mette ${macMin(macDur(b))}.`
    : `${esc(M.aiuto || 'Tocca nello zaino quello che vuoi metterci dentro.')} Ogni pezzo ci mette ${macMin(macDur(b))}.`;
}
function macGui(k, b) {
  MACG.k = k;
  MACG.b = b;
  G.macGui = k;
  macSim(b);
  const M = MACH[b.id],
    Z = G.st.inv,
    slot = (w, cls = '') =>
      `<div class="islot mslot ${cls}" data-m="${w}"><canvas width="32" height="32"></canvas><i></i></div>`;
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${esc(ITEMS[b.id].n)}${
      typeof FUNC !== 'undefined' && FUNC[b.id]
        ? ` <span class="small">· livello ${b.lv || 1}/3</span> <button class="btn mac-liv" data-liv>Migliora…</button>`
        : ''
    }</h2>
    <div class="mac-corpo"><div class="mac-col">
    <div class="mac tema-${b.id}"><i class="mac-orn"></i>
      <div class="mac-sx">${slot('in')}${M.fuel ? `<div class="mac-fuoco"><div class="mac-fiamma"><b></b></div></div>${slot('f')}` : ''}</div>
      <div class="mac-freccia"><div class="mac-barra"><b></b></div><span class="mac-t"></span></div>
      ${slot('o', 'mac-out')}
    </div>
    <div class="iinfo mac-info"></div></div>
    <div class="mac-zaino"><h3>Zaino <span class="small">— tocca: un lotto · doppio tocco: tutta la pila · tieni premuto: metà</span></h3>` +
      zGriglia('z', Z.length) +
      '</div></div>',
    () => {
      clearInterval(MACG.timer);
      MACG.k = MACG.b = null;
      G.macGui = null;
      UI.hotbar();
      if (G.st && G.st.free) NET.save(myHome());
    }
  );
  const box = $('#mbox');
  box.querySelectorAll('.islot[data-w]').forEach(el => {
    const s = Z[+el.dataset.i];
    if (s && ICON[s.id]) el.firstChild.getContext('2d').drawImage(ICON[s.id], 0, 0);
    el.lastChild.textContent = s && s.n > 1 ? s.n : '';
    el.classList.toggle('hot', Z.length > 10 && Math.floor(+el.dataset.i / 10) === zRiga());
    if (s) {
      el.title = ITEMS[s.id].n;
      const dentro = M.ok(s.id) || (M.fuel && s.id === M.fuel);
      if (!dentro) el.classList.add('mno');
    }
    // un tocco: un lotto (quello che serve per un pezzo); doppio tocco: il resto della pila;
    // tieni premuto (o tasto destro): metà pila, come in Minecraft
    el.onclick = () => {
      if (MACG.lungo) {
        MACG.lungo = false;
        return;
      }
      const i = +el.dataset.i,
        ora = performance.now(),
        doppio = MACG.tocco && MACG.tocco.i === i && ora - MACG.tocco.t < 330;
      MACG.tocco = doppio ? null : { i, t: ora };
      macMetti(i, doppio);
    };
    el.oncontextmenu = e => {
      e.preventDefault();
      MACG.tocco = null;
      macMetti(+el.dataset.i, 'meta');
    };
    el.onpointerdown = e => {
      if (e.button === 2) return;
      clearTimeout(MACG.premi);
      MACG.lungo = false;
      MACG.premi = setTimeout(() => {
        MACG.lungo = true;
        MACG.tocco = null;
        if (navigator.vibrate) navigator.vibrate(15);
        macMetti(+el.dataset.i, 'meta');
      }, 420);
    };
    el.onpointerup = el.onpointerleave = el.onpointercancel = () => clearTimeout(MACG.premi);
  });
  box.querySelectorAll('.mslot').forEach(el => (el.onclick = () => macTogli(el.dataset.m)));
  const liv = box.querySelector('[data-liv]');
  if (liv)
    liv.onclick = () => {
      AU.play('ui');
      UI._mclose();
      UI._mclose = null;
      funcMenu(k);
    };
  MACG.firma = '';
  macAggiorna();
  clearInterval(MACG.timer);
  MACG.timer = setInterval(macAggiorna, 150);
}
// aggiorna solo le parti che cambiano (la freccia, i numeri, le icone)
function macAggiorna() {
  const b = MACG.b,
    box = $('#mbox');
  if (!b || !UI.modalOpen || !box.querySelector('.mac')) {
    clearInterval(MACG.timer);
    return;
  }
  // il tempo scorre anche con la schermata aperta, ma prima della mezzanotte passata la si chiude
  if (G.st.time >= 25 * 60 + 45) {
    UI.close();
    return;
  }
  const M = MACH[b.id],
    m = macSim(b),
    pr = macProg(b),
    lav = m.t0 != null,
    firma = [m.i, m.in, m.f, m.o, m.on, lav].join('|');
  box.querySelector('.mac-barra b').style.width = (pr.p * 100).toFixed(1) + '%';
  box.querySelector('.mac').classList.toggle('lav', lav);
  box.querySelector('.mac-t').textContent = lav ? macMin(pr.rest) : '';
  const fi = box.querySelector('.mac-fiamma');
  if (fi) {
    fi.classList.toggle('on', lav);
    fi.firstChild.style.height = (lav ? 100 - pr.p * 100 : m.f > 0 ? 100 : 0).toFixed(1) + '%';
  }
  const info = macTesto(b),
    ie = box.querySelector('.mac-info');
  if (ie.innerHTML !== info) ie.innerHTML = info;
  if (firma === MACG.firma) return;
  MACG.firma = firma;
  const set = (w, id, n, ghost) => {
    const el = box.querySelector(`.mslot[data-m="${w}"]`);
    if (!el) return;
    macIcona(el, id || ghost, !id);
    el.querySelector('i').textContent = id && n > 1 ? n : '';
    el.title = id ? ITEMS[id].n : '';
    el.classList.toggle('pieno', !!id);
  };
  set('in', m.i, m.in, M.vuole);
  if (M.fuel) set('f', m.f > 0 ? M.fuel : null, m.f, M.fuel);
  set('o', m.on > 0 ? m.o : null, m.on, m.i ? M.out(m.i) : M.vuole ? M.out(M.vuole) : null);
  box.querySelector('.mac-out').classList.toggle('pronto', m.on > 0);
}
// ridisegna senza far saltare la schermata (UI.open la riporterebbe in cima)
function macRidisegna() {
  if (!MACG.b) return;
  const { k, b } = MACG,
    box = $('#mbox'),
    y = box.scrollTop,
    t = MACG.timer;
  UI._mclose = null;
  macGui(k, b);
  clearInterval(t);
  box.scrollTop = y;
}
// dallo zaino alla macchina: tutta la pila (fino a 99)
function macMetti(i, tutto) {
  const b = MACG.b,
    M = MACH[b.id],
    Z = G.st.inv,
    s = Z[i];
  if (!s) return;
  const m = macSim(b);
  let dove = null;
  if (M.fuel && s.id === M.fuel) dove = 'f';
  else if (M.ok(s.id)) dove = 'in';
  if (!dove) {
    AU.play('err');
    UI.toast(M.aiuto || `Nella ${ITEMS[b.id].n.toLowerCase()} questo non ci va.`);
    return;
  }
  if (dove === 'in' && m.i && m.i !== s.id && m.in > 0) {
    AU.play('err');
    UI.toast(`Dentro c'è già ${ITEMS[m.i].n.toLowerCase()}: toccalo per riprenderlo.`);
    return;
  }
  const ora = dove === 'f' ? m.f || 0 : m.in || 0,
    lotto = dove === 'f' ? 1 : macNeed(M, s.id),
    n = Math.min(
      s.n,
      MAC_MAX - ora,
      tutto === 'meta' ? Math.max(lotto, Math.ceil(s.n / 2)) : tutto ? s.n : lotto
    );
  if (n <= 0) {
    UI.toast('È piena.');
    return;
  }
  s.n -= n;
  if (s.n <= 0) Z[i] = null;
  if (dove === 'f') m.f = ora + n;
  else {
    m.i = s.id;
    m.in = ora + n;
  }
  // in cooperativo al padrone arriva l'operazione, non la fotografia della macchina
  Ext.run('contenitore', MACG.k, 'macchina', [{ s: dove, id: s.id, n }]);
  if (dove === 'in' && m.on > 0 && m.o && m.o !== M.out(s.id))
    UI.toast(`Prima prendi ${ITEMS[m.o].n.toLowerCase()} che è pronto: poi si comincia.`);
  AU.play('blip');
  macSim(b);
  macRidisegna();
}
// dalla macchina allo zaino
function macTogli(w) {
  const b = MACG.b,
    M = MACH[b.id],
    m = macSim(b);
  if (w === 'o') {
    if (!m.on) return;
    const n = m.on,
      id = m.o;
    if (!addItem(id, n)) return;
    m.on = 0;
    m.o = null;
    Ext.run('contenitore', MACG.k, 'macchina', [{ s: 'o', id, n: -n }]);
    AU.play('pick');
    addXP('arti', Math.min(40, 4 * n));
    UI.toast(`+${n} ${ITEMS[id].n}`);
    if (M.preso) M.preso(id, n);
  } else if (w === 'in') {
    if (!m.in) return;
    if (!addItem(m.i, m.in)) return;
    Ext.run('contenitore', MACG.k, 'macchina', [{ s: 'in', id: m.i, n: -m.in }]);
    m.in = 0;
    m.i = null;
    AU.play('blip');
  } else if (w === 'f') {
    if (!m.f) return;
    if (!addItem(M.fuel, m.f)) return;
    Ext.run('contenitore', MACG.k, 'macchina', [{ s: 'f', id: M.fuel, n: -m.f }]);
    m.f = 0;
    AU.play('blip');
  }
  macSim(b);
  macRidisegna();
}

// ---------- l'apiario: non si mette niente, le api lavorano da sole ----------
// a sinistra l'alveare e i fiori che aiutano, al centro i giorni che mancano, a destra il miele
function apiGui(k, b) {
  const st = G.st,
    inverno = seasonOf() === 1,
    fiori = Object.values(st.free.built).filter(x => x.id === 'aiuola').length,
    giorni = 3 - Math.min(2, b.t || 0),
    p = b.ready ? 1 : Math.min(1, (b.t || 0) / 3);
  const testo = b.ready
    ? `Il miele è pronto: <b>${b.n || 1}</b> ${(b.n || 1) > 1 ? 'vasetti' : 'vasetto'}. Toccalo per prenderlo.`
    : inverno
      ? "Le api dormono. D'inverno niente miele: tornano a lavorare in primavera."
      : `Le api lavorano. Il prossimo miele ${giorni === 1 ? 'domani mattina' : `tra ${giorni} giorni`}.` +
        (fiori >= 2
          ? ' Con le aiuole fiorite qui intorno ne fanno 2 vasetti.'
          : ` Con 2 aiuole fiorite ne farebbero 2 vasetti (ne hai ${fiori}).`);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${esc(ITEMS[b.id].n)}</h2>
    <div class="mac tema-apiario${b.ready || inverno ? '' : ' lav'}"><i class="mac-orn"></i>
      <div class="mac-sx"><div class="islot mslot pieno mac-fisso" title="Alveare"><canvas width="32" height="32" data-ic="apiario"></canvas><i></i></div>
      <div class="mac-api">${'<b></b>'.repeat(Math.min(3, fiori))}</div></div>
      <div class="mac-freccia"><div class="mac-barra"><b style="width:${(p * 100).toFixed(0)}%"></b></div><span class="mac-t">${b.ready ? 'pronto' : inverno ? 'in letargo' : giorni === 1 ? 'domani' : giorni + ' giorni'}</span></div>
      <div class="islot mslot mac-out${b.ready ? ' pronto pieno' : ''}" data-m="o" title="Miele"><canvas width="32" height="32" data-ic="miele"></canvas><i>${b.ready && (b.n || 1) > 1 ? b.n : ''}</i></div>
    </div>
    <div class="iinfo mac-info">${testo}</div>`,
    () => {
      UI.hotbar();
      if (G.st && G.st.free) NET.save(myHome());
    }
  );
  const box = $('#mbox');
  box.querySelectorAll('canvas[data-ic]').forEach(c => {
    const ic = ICON[c.dataset.ic],
      x = c.getContext('2d');
    if (!ic) return;
    x.globalAlpha = c.dataset.ic === 'miele' && !b.ready ? 0.22 : 1;
    x.drawImage(ic, 0, 0);
  });
  box.querySelector('.mac-out').onclick = () => {
    if (!b.ready) return;
    if (!addItem('miele', b.n || 1)) return;
    UI.toast(`+${b.n || 1} Miele`);
    b.ready = 0;
    AU.play('pick');
    addXP('arti', 4);
    UI._mclose = null;
    apiGui(k, b);
  };
}

function machinesMorning(st) {
  if (!isFree(st)) return;
  for (const k in st.free.built) {
    const b = st.free.built[k];
    if (b.id === 'apiario' && seasonOf(st) !== 1) {
      b.t = (b.t || 0) + 1;
      if (b.t >= 3 && !b.ready) {
        b.t = 0;
        b.ready = 1;
        const fl = Object.values(st.free.built).filter(x => x.id === 'aiuola').length;
        b.n = 1 + (fl >= 2 ? 1 : 0);
      }
    }
    if (ITEMS[b.id] && ITEMS[b.id].tree) {
      const age = st.day - b.d,
        T = FRUIT[ITEMS[b.id].tree],
        grow = skLv('racc', st) >= 10 ? 6 : 12;
      if (age >= grow && T.s.includes(seasonOf(st)) && (b.fruit || 0) < 3) b.fruit = (b.fruit || 0) + 1;
    }
  }
}
// sopra le macchine: il sigillo con quello che è pronto; mentre lavorano il quadrante (world.js) e, da vicino, il tempo
function drawMachines(m) {
  if (m.id !== 'main' || !isFree() || G.visit) return;
  const st = G.st,
    bob = Math.round(Math.sin(G.t * 4));
  let eti = null; // l'etichetta col tempo: solo sulla macchina più vicina
  for (const o of m.objs) {
    if (o.kind !== 'built') continue;
    const b = st.free.built[o.bk];
    if (!b) continue;
    const mac = !!MACH[b.id],
      mm = mac ? macSim(b) : null,
      out =
        mac && mm.on > 0
          ? mm.o
          : b.ready
            ? 'miele'
            : ITEMS[b.id] && ITEMS[b.id].tree && b.fruit > 0
              ? ITEMS[b.id].tree
              : null;
    const X = o.tx * 16 + 8,
      Y = o.dy - 6 + bob,
      p = G.player,
      dist = Math.hypot(p.x - X, p.y - (o.ty * 16 + 8));
    if (out) {
      drawSigillo(X, Y - 2, ICON[out]);
      continue;
    }
    // al lavoro: il quadrante, e da vicino quanto manca
    let prog = null,
      testo = '';
    if (mac && mm.t0 != null) {
      const pr = macProg(b);
      prog = pr.p;
      testo = ITEMS[MACH[b.id].out(mm.i)].n + ' · ' + macMin(pr.rest);
    } else if (b.id === 'apiario' && seasonOf() !== 1) {
      const g = 3 - Math.min(2, b.t || 0);
      prog = Math.min(1, (b.t || 0) / 3);
      testo = 'Miele · ' + (g === 1 ? 'domani' : g + ' giorni');
    }
    if (prog == null) continue;
    drawQuadrante(X, Y, prog);
    if (dist < 44 && (!eti || dist < eti.d)) eti = { d: dist, X, Y: Y - 9, testo };
  }
  if (eti && !G.cut && !UI.busy()) drawEtichetta(eti.X, eti.Y, eti.testo);
}
// alberi da frutto
const FTC = new Map();
function fruitTreeImg(b) {
  const st = G.st,
    age = st.day - b.d,
    grow = skLv('racc') >= 10 ? 6 : 12,
    s = seasonOf(),
    fr = b.fruit || 0,
    tree = ITEMS[b.id].tree,
    key = 'N' + b.id + s + (age >= grow ? 'T' : 'S' + Math.min(2, Math.floor(age / 4))) + fr;
  if (FTC.has(key)) return FTC.get(key);
  let c;
  if (age < grow) {
    const st2 = Math.min(2, Math.floor(age / 4));
    c = spr2(20, 24 + st2 * 8, P => {
      const h = 48 + st2 * 16,
        M = new MK2(P.w, P.h);
      paint2(P, M.rect(9, h - 22 - st2 * 8, 2 + Math.floor(st2 / 2), 22 + st2 * 8), R6b('#6a4428'), {
        thin: 1
      });
      for (let i = 0; i < 3 + st2 * 2; i++)
        paint2(
          P,
          new MK2(P.w, P.h).ell(
            10 + Math.cos(i * 2.1) * (3 + st2 * 1.5),
            h - 24 - st2 * 8 + Math.sin(i * 2.1) * 3,
            3.6,
            2.6
          ),
          R6b(s === 1 ? '#8a7a6a' : i % 2 ? '#5a9a2a' : '#3f7a2a'),
          { thin: 1 }
        );
    });
  } else {
    const src = (FREEIMG.trees[s] || FREEIMG.trees[0])[1],
      w = Math.round(src.width * 0.72),
      h = Math.round(src.height * 0.72);
    c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.s = src.s;
    c.canopyH = Math.round((src.canopyH || 44) * 0.72);
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(src, 0, 0, w, h);
    if (fr && s !== 1) {
      const col = FRUIT[tree].c,
        d = shade(col, -0.4),
        l = shade(col, 0.45);
      srand(b.d * 7 + fr);
      for (let i = 0; i < fr * 5; i++) {
        const a = ri(14, w - 14),
          yy = ri(12, Math.round(h * 0.46));
        if (tree === 'ciliegie') {
          for (const o of [0, 4]) {
            x.fillStyle = '#2a1006';
            x.fillRect(a + o - 1, yy - 1, 5, 5);
            x.fillStyle = col;
            x.fillRect(a + o, yy, 3, 3);
            x.fillStyle = l;
            x.fillRect(a + o, yy, 1, 1);
          }
          x.fillStyle = '#3a5a1a';
          x.fillRect(a + 1, yy - 4, 1, 3);
          x.fillRect(a + 5, yy - 4, 1, 3);
          x.fillRect(a + 2, yy - 5, 3, 1);
          continue;
        }
        const big = tree === 'pera' || tree === 'fico' ? 1 : 0;
        x.fillStyle = '#2a1006';
        x.fillRect(a - 1, yy - 1, 7, 7 + big);
        x.fillRect(a, yy - 2, 5, 1);
        x.fillStyle = d;
        x.fillRect(a, yy, 5, 5 + big);
        x.fillStyle = col;
        x.fillRect(a, yy, 4, 4 + big);
        x.fillRect(a + 1, yy - 1, 3, 1);
        x.fillStyle = l;
        x.fillRect(a + 1, yy + 1, 1, 1);
        x.fillStyle = '#4a2a10';
        x.fillRect(a + 2, yy - 2, 1, 1);
      }
    }
  }
  FTC.set(key, c);
  return c;
}
function treeAct(o, b) {
  const st = G.st,
    T = ITEMS[b.id].tree;
  if (b.fruit > 0) {
    const n = b.fruit + (skLv('agri') >= 4 && Math.random() < 0.3 ? 1 : 0);
    if (!addItem(T, n)) return true;
    b.fruit = 0;
    FTC.clear();
    rebuildMaps();
    AU.play('pick');
    floatText(`+${n} ${ITEMS[T].n}`, o.tx * 16 + 8, o.ty * 16 - 20);
    addXP('agri', 6);
    return true;
  }
  const age = st.day - b.d,
    grow = skLv('racc') >= 10 ? 6 : 12;
  UI.toast(
    age < grow
      ? `${ITEMS[b.id].n}: maturo tra ${grow - age} giorni.`
      : `Un albero di ${ITEMS[T].n.toLowerCase()}. Frutti in ${FRUIT[T].s.map(i => SEASONS[i].toLowerCase()).join(', ')}.`
  );
  return true;
}
// ---------- grafica ----------

// ---------- le icone di minerali e lingotti (disegnate a pixel, ognuna diversa) ----------
// Il minerale è un pezzo di roccia con la sua forma e le sue vene: il ferro arrugginito, il rame lucido con la
// patina verde, il nichel argento-verde a scaglie, l'oro in pepite dentro una vena di quarzo bianco.
// Il lingotto è un mattoncino a tre facce (sopra chiaro, davanti, di lato scuro) col marchio e un lampo di luce.
function iconaPixel(disegna) {
  const W = 32,
    px = new Array(W * W).fill(null),
    set = (x, y, c) => {
      x = Math.round(x);
      y = Math.round(y);
      if (x >= 0 && y >= 0 && x < W && y < W) px[y * W + x] = c;
    },
    has = (x, y) => x >= 0 && y >= 0 && x < W && y < W && px[y * W + x] !== null;
  disegna(set, has);
  const [c, x] = mk(W, W, { willReadFrequently: true }),
    D = x.createImageData(W, W),
    d = D.data,
    put = (i, hex) => {
      d[i * 4] = parseInt(hex.slice(1, 3), 16);
      d[i * 4 + 1] = parseInt(hex.slice(3, 5), 16);
      d[i * 4 + 2] = parseInt(hex.slice(5, 7), 16);
      d[i * 4 + 3] = 255;
    };
  for (let y = 0; y < W; y++)
    for (let X = 0; X < W; X++) {
      const i = y * W + X;
      if (px[i]) put(i, px[i]);
      else if (has(X - 1, y) || has(X + 1, y) || has(X, y - 1) || has(X, y + 1)) put(i, '#1c120e');
    }
  x.putImageData(D, 0, 0);
  return c;
}
const MINERALI = {
  ferro: {
    roccia: ['#9a948a', '#7a756c', '#5a5650'],
    vena: ['#e08a4a', '#b05a2a', '#7a3a1e'],
    tipo: 'macchie',
    forma: 1
  },
  rame: {
    roccia: ['#8e8a84', '#6e6a66', '#4e4c4a'],
    vena: ['#f4a060', '#d8703a', '#9a4a22'],
    patina: '#4ab08a',
    tipo: 'pepite',
    forma: 2
  },
  nichel: {
    roccia: ['#8a8c84', '#6a6c66', '#4c4e4a'],
    vena: ['#e8f0e8', '#b8c8bc', '#7a9a84'],
    tipo: 'scaglie',
    forma: 3
  },
  oro: {
    roccia: ['#968e80', '#766e62', '#564e44'],
    vena: ['#fff0a0', '#f0c030', '#b0801a'],
    quarzo: '#f4f0e4',
    tipo: 'quarzo',
    forma: 4
  }
};
const hshM = (a, b) => (((a * 73856093) ^ (b * 19349663)) >>> 0) % 1000;
function iconaMinerale(id) {
  const M = MINERALI[id];
  return iconaPixel((set, has) => {
    // la roccia: un ciottolo irregolare, con la sua forma (raggio che cambia con l'angolo)
    const cx = 16,
      cy = 17,
      R = a => 10 + Math.sin(a * 3 + M.forma) * 1.6 + Math.sin(a * 5 + M.forma * 2) * 1.1;
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        const dx = x - cx,
          dy = (y - cy) * 1.25,
          a = Math.atan2(dy, dx),
          r = Math.hypot(dx, dy);
        if (r > R(a)) continue;
        // luce da sinistra in alto: chiaro, medio, scuro
        const l = (-dx - dy) / R(a);
        set(x, y, l > 0.35 ? M.roccia[0] : l > -0.45 ? M.roccia[1] : M.roccia[2]);
        if (hshM(x, y) < 40 && l > -0.2) set(x, y, M.roccia[0]);
      }
    const dentro = (x, y) => has(x, y);
    const blob = (x0, y0, r, C) => {
      for (let y = Math.floor(y0 - r); y <= Math.ceil(y0 + r); y++)
        for (let x = Math.floor(x0 - r); x <= Math.ceil(x0 + r); x++) {
          if (!dentro(x, y) || Math.hypot(x - x0, y - y0) > r) continue;
          const l = x - x0 + (y - y0);
          set(x, y, l < -r * 0.4 ? C[0] : l > r * 0.5 ? C[2] : C[1]);
        }
      set(x0 - Math.round(r * 0.4), y0 - Math.round(r * 0.4), '#ffffff');
    };
    if (M.tipo === 'macchie') {
      // il ferro: chiazze di ruggine sparse
      for (const [x, y, r] of [
        [11, 14, 2.6],
        [19, 19, 3],
        [17, 12, 1.8],
        [12, 21, 1.6],
        [22, 14, 1.4]
      ])
        blob(x, y, r, M.vena);
    } else if (M.tipo === 'pepite') {
      // il rame: pepite lucide e la patina verde attorno
      for (const [x, y, r] of [
        [9, 18, 1.8],
        [16, 10, 1.5],
        [22, 16, 1.6],
        [17, 23, 1.7]
      ])
        blob(x, y, r, ['#8ae0b8', M.patina, '#2a7a5a']);
      for (const [x, y, r] of [
        [12, 15, 2.8],
        [20, 20, 2.4],
        [18, 12, 1.6]
      ])
        blob(x, y, r, M.vena);
    } else if (M.tipo === 'scaglie') {
      // il nichel: scaglie metalliche oblique
      for (const [x, y, n] of [
        [9, 15, 6],
        [13, 11, 7],
        [14, 18, 8],
        [18, 22, 5],
        [19, 13, 5]
      ])
        for (let k = 0; k < n; k++) {
          if (dentro(x + k, y + Math.floor(k / 2)))
            set(x + k, y + Math.floor(k / 2), k % 3 ? M.vena[1] : M.vena[0]);
          if (dentro(x + k, y + Math.floor(k / 2) + 1)) set(x + k, y + Math.floor(k / 2) + 1, M.vena[2]);
        }
    } else {
      // l'oro: una vena di quarzo bianco che attraversa la roccia, con le pepite dentro
      for (let x = 4; x < 29; x++) {
        const y = Math.round(20 - (x - 4) * 0.42);
        for (let k = -1; k <= 1; k++) if (dentro(x, y + k)) set(x, y + k, k === -1 ? '#ffffff' : M.quarzo);
      }
      for (const [x, y, r] of [
        [11, 17, 2.4],
        [18, 14, 2.8],
        [23, 12, 1.6]
      ])
        blob(x, y, r, M.vena);
    }
  });
}
const LINGOTTI = {
  lingotto: ['#d4dae0', '#9ca4ae', '#68707c', '#454c56'],
  lingotto_rame: ['#ffc290', '#e8804a', '#b8562a', '#7a3418'],
  lingotto_nichel: ['#f4f8f4', '#c8d4cc', '#94a49a', '#5e6e64'],
  lingotto_oro: ['#fff4b0', '#f4c838', '#c8901a', '#8a5a10']
};
function iconaLingotto(id) {
  const C = LINGOTTI[id];
  return iconaPixel(set => {
    // un mattoncino a tronco di piramide visto un po' dall'alto: sopra (chiaro), davanti, di lato (scuro)
    const xL = 5,
      xR = 26,
      yT = 11,
      yM = 17,
      yB = 24,
      rientro = 3;
    for (let y = yT; y < yM; y++) {
      const k = (y - yT) / (yM - yT),
        a = Math.round(xL + rientro * (1 - k)),
        b = Math.round(xR - 3 - rientro * (1 - k) + 3 * k);
      for (let x = a; x <= b; x++) set(x, y, y === yT ? C[0] : C[1]);
    }
    for (let y = yM; y <= yB; y++) for (let x = xL; x <= xR - 3; x++) set(x, y, y === yM ? C[1] : C[2]);
    for (let y = yM - 1; y <= yB; y++)
      for (let x = xR - 2; x <= xR; x++) if (y - yM + 1 >= x - (xR - 2) - 2) set(x, y, C[3]);
    // il marchio sul davanti e il lampo di luce sopra
    for (let x = 12; x <= 17; x++) set(x, 20, C[3]);
    set(12, 21, C[3]);
    set(17, 21, C[3]);
    for (let x = xL + 5; x <= xL + 11; x++) set(x, yT + 2, '#ffffff');
    set(xL + 4, yT + 3, '#ffffff');
  });
}
function genFarm2ArtBase() {
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  const stone = rp('#8a877d'),
    wood = rp('#8a5a30'),
    iron = rp('#7a7a82');
  ICON.ferro = iconaMinerale('ferro');
  for (const id of Object.keys(LINGOTTI)) ICON[id] = iconaLingotto(id);
  I('lastre', P => {
    for (const [a, b] of [
      [6, 8],
      [17, 10],
      [9, 19],
      [19, 20]
    ])
      P.rect(a, b, 9, 8, rp('#a8a090'), { spec: 0.3 });
  });
  I('incudine', P => {
    P.body(
      20,
      30,
      () => 16,
      () => 8,
      rp('#7a5032'),
      { nyF: () => 0.1 }
    );
    const a = rp('#4a4a54');
    P.rect(11, 12, 10, 8, a, { spec: 0.5 });
    P.body(
      5,
      13,
      () => 16,
      Y => (Y < 9 ? 13 : 9),
      a,
      { nyF: Y => (Y < 9 ? -0.8 : 0.1), spec: 0.9 }
    );
    P.ellipse(3, 8, 3.5, 2.4, a, { spec: 0.8 });
  });
  I('fornace', P => {
    P.body(
      6,
      29,
      () => 16,
      Y => 8 + (Y - 6) * 0.2,
      rp('#7a6a5a'),
      { nyF: () => 0.1, spec: 0.2 }
    );
    P.ellipse(16, 22, 5, 4, rp('#ff8a2a'), { amb: 0.95, edge: false });
    P.rect(13, 2, 6, 6, rp('#5a4a3a'));
  });
  I('barattolo', P => {
    P.body(
      9,
      29,
      () => 16,
      () => 8,
      rp('#b8d0d8'),
      { spec: 0.8 }
    );
    P.rect(8, 6, 16, 4, rp('#a8743e'));
    P.rect(10, 16, 12, 8, rp('#d8a84a'), { edge: false });
  });
  I('botte', P => {
    P.body(
      4,
      29,
      () => 16,
      Y => 9 + Math.sin(((Y - 4) / 25) * Math.PI) * 3,
      wood,
      { nyF: () => 0.1, mod: woodMod }
    );
    for (const y of [8, 16, 25]) P.rect(5, y, 22, 2, iron);
  });
  I('apiario', P => {
    for (let i = 0; i < 3; i++)
      P.rect(7, 6 + i * 7, 18, 7, rp(['#e8c23a', '#d8a83a', '#c8983a'][i]), { mod: woodMod });
    P.rect(5, 27, 22, 3, wood);
    P.rect(13, 22, 6, 3, rp('#2a1a10'));
  });
  I('irrigatore2', P => {
    P.ellipse(16, 24, 11, 4, stone, { spec: 0.3 });
    P.capsule(16, 24, 16, 9, 2.6, rp('#b8883a'), { spec: 0.8 });
    P.ellipse(16, 8, 6, 3, rp('#d8a84a'), { spec: 0.8 });
    for (const [a, b] of [
      [5, 5],
      [27, 5],
      [3, 13],
      [29, 13],
      [16, 2]
    ])
      P.ellipse(a, b, 1.2, 1.2, rp('#7ab0e8'), { edge: false });
  });
  I('aiuola', P => {
    P.rect(4, 18, 24, 10, rp('#7a6a5a'), { spec: 0.2 });
    for (let i = 0; i < 6; i++)
      P.ellipse(8 + i * 3.4, 15 + (i % 2) * 3, 2.4, 2.4, rp(['#f0a8c8', '#f8f0a0', '#c8b8f8'][i % 3]), {
        spec: 0.4
      });
  });
  I('muretto', P => {
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 3; i++)
        P.ellipse(
          8 + i * 8 + (r % 2) * 4,
          24 - r * 7,
          4.4,
          3.4,
          rp(['#a8a090', '#8a877d', '#9a978d'][(i + r) % 3]),
          { spec: 0.3 }
        );
  });
  I('miele', P => {
    P.body(
      10,
      29,
      () => 16,
      () => 8,
      rp('#e8a830'),
      { spec: 0.8, amb: 0.7 }
    );
    P.rect(8, 7, 16, 4, rp('#a8743e'));
  });
  const fr = { mela: '#d8302a', pera: '#c8c83a', ciliegie: '#a8102a', pesca: '#f0a060' };
  for (const [id, c] of Object.entries(fr)) {
    I(id, P => {
      if (id === 'ciliegie') {
        P.ellipse(11, 21, 5, 5, rp(c), { spec: 0.8 });
        P.ellipse(21, 21, 5, 5, rp(c), { spec: 0.8 });
        P.capsule(11, 16, 16, 5, 0.7, rp('#4a7a24'));
        P.capsule(21, 16, 16, 5, 0.7, rp('#4a7a24'));
      } else {
        P.ellipse(16, 18, id === 'pera' ? 8 : 10, id === 'pera' ? 11 : 10, rp(c), { spec: 0.7 });
        P.capsule(16, 8, 17, 3, 1, rp('#5a3a1e'));
        P.ellipse(20, 6, 3, 1.6, rp('#5a9a2a'));
      }
    });
    I('alb_' + { mela: 'melo', pera: 'pero', ciliegie: 'ciliegio', pesca: 'pesco' }[id], P => {
      P.capsule(16, 30, 16, 14, 1.6, rp('#6a4428'));
      for (let i = 0; i < 5; i++)
        P.ellipse(16 + Math.cos(i * 1.3) * 6, 12 + Math.sin(i * 1.3) * 4, 4.4, 3.4, rp('#5a9a2a'), {
          spec: 0.3
        });
      P.ellipse(20, 10, 2, 2, rp(c), { spec: 0.7 });
    });
  }
  // conserve e succhi: un barattolo o una bottiglia con il disegno del raccolto
  const jar = (P, bottle) => {
    if (bottle) {
      P.body(
        10,
        30,
        () => 16,
        Y => (Y < 14 ? 3 : 8),
        rp('#d8e8f0'),
        { spec: 0.8 }
      );
      P.rect(13, 3, 6, 7, rp('#a8743e'));
    } else {
      P.body(
        8,
        30,
        () => 16,
        () => 10,
        rp('#d8e8f0'),
        { spec: 0.8 }
      );
      P.rect(6, 5, 20, 4, rp('#a8743e'));
    }
  };
  for (const id of Object.keys(ITEMS)) {
    const it = ITEMS[id];
    if (!it.pre) continue;
    const bottle = id.startsWith('succo_');
    const P = new PX(32, 32);
    jar(P, bottle);
    P.outline();
    const c = pxCanvas(P),
      x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    if (ICON[it.pre]) x.drawImage(ICON[it.pre], bottle ? 9 : 8, bottle ? 15 : 11, 14, 14);
    ICON[id] = c;
  }
  const S = (w, h, fn) => SP(w, h, fn);
  // l'incudine su un ceppo
  FREEIMG.incudine = S(16, 18, P => {
    P.body(
      18,
      36,
      () => 16,
      () => 9,
      rp('#7a5032'),
      {
        nyF: () => 0.1,
        mod: (X, Y, v) => ((X + Y * 3) % 7 === 0 ? v - 0.15 : v)
      }
    );
    P.ellipse(16, 18, 9, 3, rp('#b08a5a'), { edge: false });
    const a = rp('#4a4a54');
    P.rect(11, 9, 10, 7, a, { spec: 0.5 });
    P.body(
      3,
      10,
      () => 16,
      Y => (Y < 7 ? 12 : 9),
      a,
      { nyF: Y => (Y < 7 ? -0.8 : 0.1), spec: 0.9 }
    );
    P.ellipse(3, 5, 3.5, 2.2, a, { spec: 0.8 });
  });
  FREEIMG.fornace = S(16, 22, P => {
    P.body(
      4,
      44,
      () => 16,
      Y => 9 + (Y - 4) * 0.14,
      rp('#7a6a5a'),
      { nyF: () => 0.1, spec: 0.2, mod: (X, Y, v) => ((X * 3 + Y * 7) % 11 === 0 ? v - 0.2 : v) }
    );
    P.ellipse(16, 34, 6, 5, rp('#ff8a2a'), { amb: 0.95, edge: false });
    P.rect(12, 0, 8, 6, rp('#5a4a3a'));
  });
  FREEIMG.barattolo = S(12, 14, P => {
    P.rect(2, 10, 20, 18, wood, { mod: woodMod });
    P.body(
      1,
      14,
      () => 12,
      () => 6,
      rp('#b8d0d8'),
      { spec: 0.8 }
    );
    P.rect(5, 0, 14, 3, rp('#a8743e'));
  });
  FREEIMG.botte = S(14, 18, P => {
    P.body(
      2,
      34,
      () => 14,
      Y => 10 + Math.sin(((Y - 2) / 32) * Math.PI) * 3,
      wood,
      { nyF: () => 0.1, mod: woodMod }
    );
    for (const y of [6, 17, 28]) P.rect(1, y, 26, 2, iron);
  });
  FREEIMG.apiario = S(14, 18, P => {
    for (let i = 0; i < 3; i++)
      P.rect(3, 2 + i * 9, 22, 9, rp(['#e8c23a', '#d8a83a', '#c8983a'][i]), { mod: woodMod });
    P.rect(1, 29, 26, 4, wood);
    P.rect(11, 24, 6, 3, rp('#2a1a10'));
  });
  FREEIMG.irrigatore2 = S(14, 16, P => {
    P.ellipse(14, 26, 11, 4, stone, { spec: 0.3 });
    P.capsule(14, 26, 14, 10, 2.6, rp('#b8883a'), { spec: 0.8 });
    P.ellipse(14, 8, 6, 3.4, rp('#d8a84a'), { spec: 0.8 });
  });
  FREEIMG.aiuola = S(16, 10, P => {
    P.rect(1, 8, 30, 10, rp('#7a6a5a'), { spec: 0.2 });
    for (let i = 0; i < 9; i++)
      P.ellipse(
        4 + i * 3.2,
        6 + (i % 2) * 3,
        2.4,
        2.4,
        rp(['#f0a8c8', '#f8f0a0', '#c8b8f8', '#ffffff'][i % 4]),
        { spec: 0.4 }
      );
    for (let i = 0; i < 9; i++) P.capsule(4 + i * 3.2, 9, 4 + i * 3.2, 6, 0.5, rp('#4a8a2a'));
  });
  FREEIMG.muretto = S(16, 12, P => {
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 4; i++)
        P.ellipse(
          3 + i * 8 + (r % 2) * 4,
          20 - r * 7,
          4.6,
          3.6,
          rp(['#a8a090', '#8a877d', '#9a978d'][(i + r) % 3]),
          { spec: 0.3 }
        );
  });
}

// catena: altri file la avvolgono con Ext.avvolgi('genFarm2Art', …)
function genFarm2Art(...a) {
  return Ext.catena('genFarm2Art', genFarm2ArtBase, this, a);
}
