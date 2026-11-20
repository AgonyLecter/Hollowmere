'use strict';
// ================= MISSIONI, MINACCIA E GENTE DA FUORI (gioco libero) =================
// Le missioni arrivano da Firebase (missioni/), scritte dalla pagina admin fusco.html.
// La minaccia: di notte, dal bosco, escono le Ombre. Le luci le tengono lontane.

// ---------- gente da fuori ----------
NPC_DEF.push(['ottavio', 'Ottavio il postino'], ['irene', 'Irene Vasi'], ['mercante', 'Il cocchiere']);
Object.assign(NAMES, { ottavio: 'Ottavio il postino', irene: 'Irene Vasi', mercante: 'Il cocchiere' });
Object.assign(LOOKS, {
  ottavio: {
    skin: '#e8b892',
    hair: '#5a3a22',
    style: 'short',
    eye: '#4a5a7a',
    shirt: '#3a4a7a',
    pants: '#2a2a3a',
    shoe: '#1c140e',
    hat: 'cap',
    hatCol: '#2a3a6a'
  },
  irene: {
    skin: '#e0b090',
    hair: '#1a1416',
    style: 'long',
    eye: '#3a3a3a',
    shirt: '#c8b8a0',
    dress: '#8a7a60',
    pants: '#3a3a4a',
    shoe: '#1a1a1a',
    lip: '#a0504a'
  },
  mercante: {
    skin: '#d8b898',
    hair: '#8a8a8a',
    style: 'short',
    beard: '#9a9a9a',
    eye: '#3a3a3a',
    shirt: '#1c1a22',
    robe: '#24222a',
    shoe: '#111',
    hat: 'tall',
    hatCol: '#0e0c10',
    hatBand: '#5a4a3a',
    smile: false
  }
});
LOOKS.cocchiere = LOOKS.mercante;
Object.assign(HOMES, { ottavio: 'ponte', irene: 'ponte', mercante: 'ponte' });
// quando arrivano: il postino dopo la prima visita data o ricevuta (o dopo una settimana), la fotografa dopo la prima stagione, il cocchiere il sabato dal secondo sabato
function outsiderHere(id, st) {
  if (!isFree(st)) return false;
  const F = st.flags,
    days = st.day - st.free.start;
  if (id === 'ottavio') return !!(F.mpVisited || days >= 7);
  if (id === 'irene') return days >= SEASON_LEN || (Object.keys(st.free.built).length >= 4 && days >= 10);
  if (id === 'mercante') return days >= 6 && (st.day + 3) % 7 === 5;
  return false;
}
Object.assign(SCHED, {
  ottavio(st) {
    const t = st.time,
      d = (st.day + 3) % 7;
    if (!outsiderHere('ottavio', st) || !(d === 0 || d === 3)) return null;
    if (t >= 9 * 60 && t < 12 * 60) return at(46, 39, 1, 'idle', 1);
    if (t >= 12 * 60 && t < 16 * 60) return at(47, 20, 0, 'idle', 1);
    return null;
  },
  irene(st) {
    const t = st.time;
    if (!outsiderHere('irene', st)) return null;
    if (t >= 9 * 60 && t < 12 * 60) return at(54, 10, 3, 'photo', 1);
    if (t >= 12 * 60 && t < 15 * 60) return at(23, 4, 3, 'photo', 1);
    if (t >= 15 * 60 && t < 18 * 60) return at(44, 40, 1, 'photo', 1);
    return null;
  },
  mercante(st) {
    const t = st.time;
    if (!outsiderHere('mercante', st)) return null;
    if (t >= 8 * 60 && t < 18 * 60) return at(43, 46, 3, 'stall', 0, { snap: 1 });
    return null;
  }
});
const OUT_L = {
  ottavio: [
    'Posta per la Valle! Per anni le lettere si fermavano al ponte. Ora passo io.',
    'Fuori dicono che qui il tempo sia fermo. A me pare che corra come dappertutto.',
    'Se hai roba buona da vendere, la porto in città. Pago subito, e pago bene.'
  ],
  irene: [
    'Faccio foto per un libro sulle valli abbandonate. Questa non è abbandonata. È peggio: è abitata.',
    "Nelle mie foto della cappella c'è sempre una figura in più. Sempre. Non so chi sia.",
    'Mi hanno detto che qui contavate le persone. Io conto le fotografie. Ne manca sempre una.'
  ],
  mercante: [
    "«Ve l'avevo detto, di non venire. E invece guardatevi: radici.»",
    '«Il sabato passo. Semi che qui non trovate, roba di fuori. Contanti.»',
    "«Il ponte l'hanno rifatto. Non ci credevo finché non ci ho messo le ruote sopra.»"
  ]
};
const MERC_STOCK = [
  'alb_melo',
  'alb_pero',
  'alb_ciliegio',
  'alb_pesco',
  'lastre',
  's_rapa',
  's_patata',
  's_zucca',
  's_fagioli',
  's_cavolo',
  's_fragola',
  's_pomodoro',
  's_mais',
  's_porro',
  'fieno',
  'concime'
];
async function outsiderTalk(n) {
  const st = G.st,
    F = st.flags;
  F.met[n.id] = 1;
  if (n.id === 'irene' && !F.ireneFoto) {
    F.ireneFoto = 1;
    await say(
      'irene',
      "Tu sei il nipote di Marlowe? Allora guarda questa. L'ho scattata ieri, davanti al cimitero."
    );
    await UI.paper(
      `<h2>Una fotografia</h2><div class="paper"><p>Il cimitero, in bianco e nero. Le tombe, il pioppo, la tomba di Elias Marlowe.</p><p>Davanti alla tomba, di spalle, una figura con un mantello giallo. Nessuno, quel giorno, portava un mantello giallo.</p><p class="ink">Sul retro, a matita, non con la calligrafia di Irene: «otto».</p></div>`
    );
    await say('irene', "Non l'ho scritto io. Te la lascio. Io non la voglio più.");
    return true;
  }
  if (n.id === 'ottavio') {
    const R = OTT_RECIPES(),
      c = await ask('ottavio', pickFrom(OUT_L.ottavio), [
        'Vendi qualcosa a Ottavio',
        ...(R.length ? [`Ricetta di città (${SC(300)})`] : []),
        'Niente'
      ]);
    if (c === 0) ottavioSell();
    else if (c === 1 && R.length) {
      if (st.money < 300) return say('ottavio', 'Trecento scudi, amico. Le ricette di città costano.');
      st.money -= 300;
      UI.hud();
      AU.play('coin');
      learnRecipe(R[0].id, 'Ottavio');
    }
    return true;
  }
  if (n.id === 'mercante') {
    const c = await ask('mercante', pickFrom(OUT_L.mercante), ['Guarda la merce', 'Niente']);
    if (c === 0) merchantShop();
    return true;
  }
  await say(n.id, pickFrom(OUT_L[n.id]));
  return true;
}
const pickFrom = L => L[(G.st.day + G.st.time) % L.length];
function ottavioSell() {
  const st = G.st,
    L = st.inv.map((s, i) => [s, i]).filter(([s]) => s && ITEMS[s.id].t === 'crop');
  const pr = id => Math.round(sellPrice(id) * 1.2);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Ottavio compra</h2><p class="small">Paga subito, il 20% in più della cassetta. Porta tutto in città.</p>` +
      (L.length
        ? L.map(
            ([s, i]) =>
              `<div class="mrow"><canvas data-i="${s.id}" width="32" height="32"></canvas><span>${ITEMS[s.id].n} ×${s.n}</span><b class="price">${CZ(pr(s.id) * s.n)}</b><button class="btn" data-s="${i}">Vendi</button></div>`
          ).join('')
        : '<p>Non hai niente che gli interessi: vuole raccolti, uova e latte.</p>')
  );
  $('#mbox')
    .querySelectorAll('canvas[data-i]')
    .forEach(c => c.getContext('2d').drawImage(ICON[c.dataset.i], 0, 0));
  $('#mbox')
    .querySelectorAll('[data-s]')
    .forEach(
      b =>
        (b.onclick = () => {
          const s = st.inv[+b.dataset.s];
          if (!s) return;
          st.money += pr(s.id) * s.n;
          st.inv[+b.dataset.s] = null;
          AU.play('coin');
          UI.hud();
          UI.hotbar();
          UI._mclose = null;
          ottavioSell();
        })
    );
}
function merchantShop() {
  const st = G.st,
    pr = id => Math.round((ITEMS[id].p || 20) * 1.35);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Il carro del cocchiere</h2><p class="small">Semi di tutte le stagioni, fieno e concime. Costa di più. «Il viaggio, lo pagate voi.» — Hai <b>${CZ(st.money)}</b></p>` +
      MERC_STOCK.map(
        id =>
          `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}${ITEMS[id].crop ? `<br><span class="small">${CROPS[ITEMS[id].crop].s.map(i => SEASONS[i]).join(', ')}</span>` : ''}</span><b class="price">${CZ(pr(id))}</b><button class="btn" data-b="${id}" ${st.money >= pr(id) ? '' : 'disabled'}>×1</button></div>`
      ).join('')
  );
  $('#mbox')
    .querySelectorAll('canvas[data-i]')
    .forEach(c => c.getContext('2d').drawImage(ICON[c.dataset.i], 0, 0));
  $('#mbox')
    .querySelectorAll('[data-b]')
    .forEach(
      b =>
        (b.onclick = () => {
          const id = b.dataset.b;
          if (st.money < pr(id) || !addItem(id, 1)) return;
          st.money -= pr(id);
          AU.play('coin');
          UI.hud();
          UI._mclose = null;
          merchantShop();
        })
    );
}
// la diligenza del mercante, il sabato
function merchantCoach() {
  const st = G.st;
  if (!st || !isFree(st) || G.map.id !== 'main' || G.visit) return;
  const on = outsiderHere('mercante', st) && st.time >= 8 * 60 && st.time < 18 * 60;
  if (on && !G.coach) G.coach = { x: 45 * 16 + 4, y: 47 * 16 + 30, moving: false, merc: 1 };
  else if (!on && G.coach && G.coach.merc) G.coach = null;
}

// ---------- missioni (da fusco.html) ----------
G.missions = [];
G.event = { ombre: 0, annuncio: '' };
const LUOGHI = {
  campi: [
    [8, 36],
    [20, 38],
    [30, 37],
    [14, 40]
  ],
  cimitero: [
    [48, 9],
    [58, 9],
    [52, 4],
    [47, 6]
  ],
  fiume: [
    [10, 41],
    [26, 41],
    [36, 41],
    [54, 41]
  ],
  piazza: [
    [40, 18],
    [50, 17],
    [42, 24],
    [49, 24]
  ],
  bosco: [
    [13, 30],
    [19, 25],
    [22, 15],
    [9, 19]
  ]
};
function missionListen() {
  if (!NET.ok || G._mlist) return;
  G._mlist = 1;
  const D = NET.api;
  D.onValue(
    NET.r('missioni'),
    s => {
      const v = s.val() || {};
      G.missions = Object.entries(v)
        .map(([id, o]) => Object.assign({ id }, o))
        .filter(m => m && m.attiva && m.titolo);
      for (const m of G.missions)
        if (m.tipo === 'recupero')
          ITEMS['m_' + m.id] = {
            n: m.oggetto || 'Oggetto smarrito',
            t: 'key',
            d: 'Va riportato a ' + (NAMES[m.npc] || "chi l'ha perso") + '.'
          };
      UI.quest();
    },
    () => {}
  );
  D.onValue(
    NET.r('eventi'),
    s => {
      G.event = Object.assign({ ombre: 0, annuncio: '' }, s.val() || {});
    },
    () => {}
  );
}
function missionsFor(st) {
  if (!isFree(st)) return [];
  return G.missions.filter(m => {
    const d = (m.dest || 'finiti').trim();
    if (d === 'tutti' || d === 'finiti') return true;
    return d.split(/[\s,]+/).includes(st.pid);
  });
}
const mstate = (st, id) => (st.missions = st.missions || {})[id] || (st.missions[id] = {});
function missionSpot(m) {
  const L = LUOGHI[m.luogo] || LUOGHI.campi;
  let h = 0;
  for (const ch of m.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return L[h % L.length];
}
function missionAccept(m) {
  const st = G.st,
    s = mstate(st, m.id);
  s.acc = 1;
  AU.play('ok');
  UI.toast(`Missione accettata: ${m.titolo}`);
  if (m.npc && NAMES[m.npc]) setTimeout(() => UI.toast(`Parlane con ${NAMES[m.npc]}.`), 1200);
  UI.quest();
}
QUESTS.push({
  free: 1,
  s: st => isFree(st) && missionsFor(st).some(m => mstate(st, m.id).acc && !mstate(st, m.id).done),
  t: st => {
    const m = missionsFor(st).find(m => mstate(st, m.id).acc && !mstate(st, m.id).done);
    const s = mstate(st, m.id);
    if (m.tipo === 'recupero')
      return countItem('m_' + m.id)
        ? `Riporta «${m.oggetto}» a ${NAMES[m.npc] || "chi l'ha perso"}`
        : `Cerca «${m.oggetto}» (${{ campi: 'nei prati a sud', cimitero: 'al cimitero', fiume: 'lungo il fiume', piazza: 'in piazza', bosco: 'nel bosco oltre il Varco' }[m.luogo] || 'nella Valle'})`;
    if (m.tipo === 'consegna')
      return `Porta ${m.n || 1} × ${ITEMS[m.item] ? ITEMS[m.item].n : m.item} a ${NAMES[m.npc] || '?'} (${Math.min(countItem(m.item), m.n || 1)}/${m.n || 1})`;
    if (m.tipo === 'ombre') return `Scaccia le Ombre di notte (${s.k || 0}/${m.n || 3})`;
    return m.titolo;
  },
  d: () => false
});
// l'oggetto smarrito sulla mappa
function missionObjects(m0) {
  const st = G.st;
  if (!isFree(st) || G.visit) return;
  for (const m of missionsFor(st)) {
    const s = mstate(st, m.id);
    if (m.tipo !== 'recupero' || !s.acc || s.found || s.done) continue;
    const [x, y] = missionSpot(m),
      map = m.luogo === 'bosco' ? 'wood' : 'main';
    if (m0.id !== map) continue;
    if (m0.objAt(x, y)) continue;
    m0.add(OB('mobj', x, y, FREEIMG.mobj, { act: 'mobj', mid: m.id, solid: [], hits: [[x, y]] }));
  }
}
ACT.mobj = o => {
  const st = G.st,
    m = G.missions.find(m => m.id === o.mid);
  if (!m) return;
  if (!addItem('m_' + m.id, 1)) return;
  mstate(st, m.id).found = 1;
  G.map.objs = G.map.objs.filter(q => q !== o);
  delete G.map.hit[fkey(o.tx, o.ty)];
  AU.play('ok');
  burst('spark', o.tx * 16 + 8, o.ty * 16 + 6, 12, '#ffe27a');
  UI.toast(`Hai trovato: ${m.oggetto}. Riportalo a ${NAMES[m.npc] || "chi l'ha perso"}.`);
};
PROMPT.mobj = 'Raccogli';
async function missionTalk(n) {
  const st = G.st;
  for (const m of missionsFor(st)) {
    const s = mstate(st, m.id);
    if (s.done || m.npc !== n.id) continue;
    if (!s.acc) {
      await say(n.id, m.testo || m.titolo);
      const c = await ask(n.id, 'Mi aiuti?', ['Ci penso io', 'Non ora']);
      if (c === 0) missionAccept(m);
      return true;
    }
    if (m.tipo === 'recupero' && countItem('m_' + m.id)) {
      removeItem('m_' + m.id, 1);
      return missionDone(m, n);
    }
    if (m.tipo === 'consegna' && countItem(m.item) >= (m.n || 1)) {
      removeItem(m.item, m.n || 1);
      return missionDone(m, n);
    }
    if (m.tipo === 'ombre' && (s.k || 0) >= (m.n || 3)) return missionDone(m, n);
  }
  return false;
}
async function missionDone(m, n) {
  const st = G.st;
  mstate(st, m.id).done = 1;
  const r = +m.premio || 0;
  st.money += r;
  AU.play('coin');
  UI.hud();
  await say(n.id, m.grazie || 'Grazie, {n}. Davvero. La Valle si ricorda di chi aiuta.');
  UI.toast(`Missione completata: ${m.titolo}${r ? ` (+${SC(r)})` : ''}`);
  if (m.item2 && ITEMS[m.item2]) giveItem(m.item2);
  NET.save(st);
  UI.quest();
  return true;
}

// ---------- la minaccia: le Ombre ----------
G.shadows = [];
function shadowRate() {
  const st = G.st;
  let k = 1 + (+G.event.ombre || 0);
  if (missionsFor(st).some(m => m.tipo === 'ombre' && mstate(st, m.id).acc && !mstate(st, m.id).done))
    k += 1.5;
  if (seasonOf() === 0) k += 0.5;
  return k;
}
function lightNear(x, y) {
  const st = G.st;
  for (const k in st.free.built)
    if (st.free.built[k].id === 'lampione') {
      const [a, b] = k.split(',').map(Number);
      if (Math.hypot(a * 16 + 8 - x, b * 16 - 6 - y) < 68) return [a * 16 + 8, b * 16];
    }
  for (let i = 0; i < LAMPS.length; i++)
    if (lampOn(i, st.time) && Math.hypot(LAMPS[i][0] * 16 + 8 - x, LAMPS[i][1] * 16 - y) < 44)
      return [LAMPS[i][0] * 16 + 8, LAMPS[i][1] * 16];
  return null;
}
function shadowTick(dt) {
  const st = G.st;
  if (!st || !isFree(st) || G.visit || G.mode !== 'game' || G.map.id !== 'main' || G.cut) {
    return;
  }
  const t = st.time,
    night = t >= 22 * 60 || t < 4 * 60;
  if (!night) {
    if (G.shadows.length) {
      for (const s of G.shadows) burst('dust', s.x, s.y - 10, 6, '#1a1418');
      G.shadows = [];
    }
    return;
  }
  if (G.shadows.length < Math.round(2 + shadowRate() * 1.5) && Math.random() < dt * 0.04 * shadowRate()) {
    const side = Math.random() < 0.5,
      x = (side ? 4 : 59) * 16,
      y = (8 + Math.random() * 32) * 16;
    const crops = Object.keys(st.farm).filter(k => st.farm[k].c && !st.farm[k].c.dead),
      homes = Object.keys(st.free.built).filter(k => /pollaio|stalla/.test(st.free.built[k].id));
    const pool = [...crops, ...crops, ...homes];
    const tk = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    G.shadows.push({ x, y, tk, dir: side ? 2 : 1, anim: 0, moving: true, a: 0 });
    if (!G.st.flags.shadowTip) {
      G.st.flags.shadowTip = 1;
      UI.toast('Qualcosa esce dal bosco. Non ha faccia. Le luci la tengono lontana.', 'bad');
    }
    AU.play('whisper');
  }
  const p = G.player;
  for (const s of G.shadows) {
    s.a = Math.min(0.75, s.a + dt * 0.5);
    s.anim += dt * 6;
    let tx, ty;
    if (s.tk) {
      const [a, b] = s.tk.split(',').map(Number);
      tx = a * 16 + 8;
      ty = b * 16 + 14;
    } else {
      tx = p.x;
      ty = p.y;
    }
    const L = lightNear(s.x, s.y - 10);
    if (L) {
      tx = s.x + (s.x - L[0]) * 3;
      ty = s.y + (s.y - L[1]) * 3;
      s.fear = (s.fear || 0) + dt;
    }
    const dx = tx - s.x,
      dy = ty - s.y,
      d = Math.hypot(dx, dy) || 1,
      sp = L ? 30 : 16;
    s.x += (dx / d) * sp * dt;
    s.y += (dy / d) * sp * dt;
    s.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
    if (s.fear > 2.5) s.gone = 1;
    if (Math.hypot(p.x - s.x, p.y - s.y) < 13) {
      s.gone = 1;
      s.hit = 1;
      AU.play('whisper');
      G.shake = 2;
      st.energy = Math.max(0, st.energy - 4);
      UI.hud();
      for (const m of missionsFor(st))
        if (m.tipo === 'ombre' && mstate(st, m.id).acc && !mstate(st, m.id).done) {
          const ms = mstate(st, m.id);
          ms.k = (ms.k || 0) + 1;
          if (ms.k === (m.n || 3))
            UI.toast(`Hai scacciato abbastanza Ombre. Torna da ${NAMES[m.npc] || "chi te l'ha chiesto"}.`);
          UI.quest();
        }
    }
    if (s.tk && d < 6 && !L) {
      const f = st.farm[s.tk];
      if (f && f.c && !f.c.dead) {
        f.c = null;
        f.f = 0;
        st.flags.stolen = (st.flags.stolen || 0) + 1;
        G.stolenN = (G.stolenN || 0) + 1;
      } else if (st.free.built[s.tk]) {
        for (const a of animalsOf(s.tk)) a.love = Math.max(0, a.love - 2);
        G.scaredN = (G.scaredN || 0) + 1;
      }
      s.gone = 1;
    }
  }
  for (const s of G.shadows) if (s.gone) burst('dust', s.x, s.y - 10, 8, s.hit ? '#3a3040' : '#1a1418');
  G.shadows = G.shadows.filter(s => !s.gone);
}
function drawShadow(s) {
  ctx.globalAlpha = s.a * (0.75 + 0.25 * Math.sin(G.t * 9 + s.x));
  drawSprite('faceless', s);
  ctx.globalAlpha = 1;
}
function shadowNews() {
  if (G.stolenN) {
    UI.toast(
      `Stanotte le Ombre hanno portato via ${G.stolenN === 1 ? 'una pianta' : G.stolenN + ' piante'}. Un lampione vicino ai campi le terrebbe lontane.`,
      'bad'
    );
    G.stolenN = 0;
  }
  if (G.scaredN) {
    UI.toast('Le bestie hanno passato una brutta notte: qualcosa ha girato attorno ai loro recinti.', 'bad');
    G.scaredN = 0;
  }
  if (G.event.annuncio) UI.toast('Bacheca: ' + G.event.annuncio);
}
// di notte, mentre dormi: le Ombre girano per i campi non illuminati
function shadowNightRaid(st) {
  if (!isFree(st) || st.day - st.free.start < 3) return;
  const lit = Object.keys(st.free.built)
    .filter(k => st.free.built[k].id === 'lampione')
    .map(k => k.split(',').map(Number));
  const exposed = Object.keys(st.farm).filter(k => {
    const f = st.farm[k];
    if (!f.c || f.c.dead) return false;
    const [x, y] = k.split(',').map(Number);
    return !lit.some(([a, b]) => Math.abs(a - x) <= 4 && Math.abs(b - y) <= 4);
  });
  let n = Math.floor(Math.random() * (shadowRate() + 0.6));
  n = Math.min(n, 2, exposed.length);
  for (let i = 0; i < n; i++) {
    const k = exposed.splice(Math.floor(Math.random() * exposed.length), 1)[0];
    st.farm[k].c = null;
    st.farm[k].f = 0;
    G.stolenN = (G.stolenN || 0) + 1;
  }
}
function genMissionArt() {
  FREEIMG.mobj = SP(12, 12, P => {
    P.ellipse(12, 15, 9, 8, rp('#a8743e'), { spec: 0.3 });
    P.rect(9, 4, 6, 5, rp('#7a4a20'));
    P.ellipse(12, 4, 4, 2, rp('#e8c23a'), { spec: 0.8 });
  });
}
// bacheca: le missioni disponibili e l'avviso del giorno
{
  const _b = UI.board.bind(UI);
  UI.board = function () {
    _b();
    const st = G.st;
    if (!isFree(st)) return;
    const L = missionsFor(st).filter(m => !mstate(st, m.id).done);
    const box = $('#mbox');
    if (!box) return;
    const d = document.createElement('div');
    d.innerHTML =
      `<h3>Richieste dalla Valle</h3>` +
      (G.event.annuncio ? `<p class="small"><b>Avviso:</b> ${esc(G.event.annuncio)}</p>` : '') +
      (L.length
        ? L.map(
            m =>
              `<div class="mrow"><span><b>${esc(m.titolo)}</b>${m.premio ? ` — ${CZ(+m.premio)}` : ''}<br><span class="small">${esc(m.testo || '')}${m.npc && NAMES[m.npc] ? ' — ' + esc(NAMES[m.npc]) : ''}</span></span>${mstate(st, m.id).acc ? '<span class="small">accettata</span>' : `<button class="btn" data-m="${esc(m.id)}">Accetta</button>`}</div>`
          ).join('')
        : '<p class="small">Nessuna richiesta, oggi. Torna domani.</p>');
    box.appendChild(d);
    d.querySelectorAll('[data-m]').forEach(
      b =>
        (b.onclick = () => {
          const m = G.missions.find(x => x.id === b.dataset.m);
          if (m) {
            missionAccept(m);
            UI._mclose = null;
            UI.close();
            UI.board();
          }
        })
    );
  };
}
