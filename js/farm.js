'use strict';
// ================= STATO, OGGETTI, FATTORIA =================
const ITEMS = {
  hoe: { n: 'Zappa', t: 'tool', d: 'Dissoda la terra. Seppellisce ciò che va seppellito.' },
  can: { n: 'Annaffiatoio', t: 'tool', d: 'Acqua per le piantine. Non finisce mai. Strano.' },
  s_rapa: { n: 'Semi di rapa', t: 'seed', crop: 'rapa', p: 20, d: 'Crescono in 2 giorni.' },
  s_patata: { n: 'Semi di patata', t: 'seed', crop: 'patata', p: 35, d: 'Crescono in 3 giorni.' },
  s_zucca: {
    n: 'Semi di zucca',
    t: 'seed',
    crop: 'zucca',
    p: 60,
    d: 'Crescono in 3 giorni. Alla Valle piacciono le zucche.',
    x: 'Alla Valle piacciono le zucche.'
  },
  s_fagioli: {
    n: 'Semi di fagiolo',
    t: 'seed',
    crop: 'fagioli',
    p: 60,
    d: 'Rampicanti: dopo il primo raccolto ricrescono ogni notte.',
    x: 'Si raccolgono più volte.'
  },
  s_cavolo: {
    n: 'Semi di cavolo nero',
    t: 'seed',
    crop: 'cavolo',
    p: 55,
    d: 'Lento, ma prezioso.',
    x: 'Lento, ma prezioso.'
  },
  concime: {
    n: 'Concime',
    t: 'fert',
    p: 15,
    d: 'Spargilo sulla terra dissodata: il raccolto di quella zolla sarà più abbondante.'
  },
  rapa: { n: 'Rapa', t: 'crop', v: 45 },
  patata: { n: 'Patata', t: 'crop', v: 80 },
  zucca: { n: 'Zucca', t: 'crop', v: 170 },
  fagioli: { n: 'Fagioli', t: 'crop', v: 32 },
  cavolo: { n: 'Cavolo nero', t: 'crop', v: 210 },
  bacche: { n: 'Bacche rosse', t: 'bad', d: 'Il colore cattivo. Andrebbero seppellite.' },
  nastro: { n: 'Nastro rosso', t: 'bad', d: 'Morbido. Bellissimo. Proibito.' },
  focaccia: { n: 'Focaccia di zucca', t: 'gift', d: 'Per il ceppo, al tramonto. Non mangiarla.' },
  vernice: {
    n: 'Vernice gialla',
    t: 'key',
    d: 'Per i pali grigi del recinto. Avvicinati a un palo e usalo.'
  },
  key: { n: 'Chiave della cassa', t: 'key', d: 'La chiave della cassa del nonno, in casa.' },
  keyI: { n: 'Chiave del fienile', t: 'key', d: "Fredda. Apre il fienile rosso dell'Anziano." },
  lanterna: {
    n: 'Lanterna di Clara',
    t: 'key',
    d: "Una luce gialla, piccola. Nel bosco è l'unica che conta.",
    use: 'La lanterna è pronta. Si accenderà da sola, quando passerai il Varco.'
  },
  mantello: {
    n: 'Mantello giallo',
    t: 'key',
    d: 'Un dono del villaggio. Il giallo non protegge: segna.',
    use: 'Lo pieghi tra le mani. Il giallo non protegge: segna. Non lo indossi. Non ancora.'
  },
  pane: { n: 'Pane di Clara', t: 'food', e: 30, p: 35, d: 'Ancora tiepido. +30 energia.' },
  zuppa: { n: 'Zuppa di rape', t: 'food', e: 38, d: 'Calda e semplice. +38 energia.' },
  arrosto: { n: 'Patate arrosto', t: 'food', e: 50, d: 'Croccanti fuori, morbide dentro. +50 energia.' },
  torta: { n: 'Torta di zucca', t: 'food', e: 75, d: 'La Valle ne va pazza. +75 energia.' }
};
const LIKES = {
  ezekiel: { patata: 2, rapa: 1, cavolo: 2, arrosto: 3, zuppa: 1 },
  agatha: { zucca: 2, rapa: 1, fagioli: 1, torta: 3, zuppa: 1 },
  lucius: { rapa: 2, fagioli: 2, zuppa: 3, pane: 1 },
  clara: { zucca: 2, patata: 1, fagioli: 1, torta: 3, arrosto: 1 },
  brom: { patata: 2, zucca: 1, cavolo: 2, arrosto: 3, pane: 1 },
  tobia: { nastro: 3, zucca: 2, rapa: 1, torta: 3, pane: 2, zuppa: 1 }
};
const DAYN = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
function newState(name, g = 'm') {
  return {
    v: 1,
    name,
    g,
    weather: 'sereno',
    pid: null,
    day: 0,
    time: 18 * 60 + 20,
    money: 250,
    energy: 100,
    quiete: 100,
    chapter: 0,
    flags: { posts: [0, 0, 0, 0, 0], bush: [0, 0, 0], met: {}, buried: 0, planted: 0 },
    inv: [
      { id: 'hoe', n: 1 },
      { id: 'can', n: 1 },
      { id: 's_rapa', n: 12 },
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    sel: 0,
    farm: {},
    friends: {},
    talked: {},
    gifted: {},
    chore: null,
    choreOk: false,
    choreDone: false,
    leaves: [0, 0, 0, 0],
    shipped: [],
    map: 'main',
    px: 44,
    py: 46,
    dir: 3,
    lastChore: null,
    favors: [],
    up: {},
    forge: null,
    bread: 0,
    demand: null
  };
}
function selItem() {
  const s = G.st.inv[G.st.sel];
  return s || null;
}
function countItem(id) {
  return G.st.inv.reduce((a, s) => a + (s && s.id === id ? s.n : 0), 0);
}
function addItem(id, n = 1) {
  const ok = addItemBase(id, n);
  if (ok) Ext.run('ottieni', id, n); // punto di estensione: qualcosa è entrato nello zaino
  return ok;
}
// tutto o niente: le pile uguali si uniscono; gli attrezzi no, ognuno occupa il suo posto
function addItemBase(id, n = 1) {
  const inv = G.st.inv,
    tool = ITEMS[id] && ITEMS[id].t === 'tool',
    s = !tool && inv.find(s => s && s.id === id);
  if (s) s.n += n;
  else {
    const vuoti = inv.reduce((L, s, i) => (s ? L : L.concat(i)), []);
    if (vuoti.length < (tool ? n : 1)) {
      UI.toast('Lo zaino è pieno!', 'bad');
      return false;
    }
    if (tool) for (let k = 0; k < n; k++) inv[vuoti[k]] = { id, n: 1 };
    else inv[vuoti[0]] = { id, n };
  }
  UI.hotbar();
  return true;
}
// nello zaino, oppure (se è pieno) nella cassetta delle spedizioni di casa: non si perde mai niente
function riponi(id, n = 1) {
  if (addItem(id, n)) return true;
  const casa = G.home || G.st;
  (casa.mailbox = casa.mailbox || []).push({ item: id, n, from: '' });
  UI.toast(`Lo zaino è pieno: ${ITEMS[id].n} ti aspetta nella cassetta delle spedizioni.`, 'bad');
  return false;
}
function removeItem(id, n = 1) {
  const inv = G.st.inv;
  for (let i = 0; i < inv.length && n > 0; i++) {
    const s = inv[i];
    if (s && s.id === id) {
      const k = Math.min(n, s.n);
      s.n -= k;
      n -= k;
      if (s.n <= 0) inv[i] = null;
    }
  }
  UI.hotbar();
}
function giveItem(id, n = 1) {
  // zaino pieno: l'oggetto aspetta nella cassetta delle spedizioni di casa (prima prendeva il posto del primo
  // oggetto dello zaino, di solito la zappa, che spariva)
  if (!riponi(id, n)) {
    AU.play('pick');
    return;
  }
  AU.play('pick');
  const p = G.player;
  floatText('+ ' + ITEMS[id].n, p.x, p.y - 32, '#f6d98a', 2);
  UI.toast('Ottenuto: ' + ITEMS[id].n);
  const k = G.st.inv.findIndex(s => s && s.id === id);
  if (k >= 0) {
    G.st.sel = k;
    UI.hotbar();
  }
}
function addFriend(id, n) {
  const f = G.st.friends;
  f[id] = clamp((f[id] || 0) + n, -4, 20);
}
function hearts(id) {
  return Math.max(0, Math.floor((G.st.friends[id] || 0) / 2));
}
function addQuiete(n) {
  const st = G.st;
  st.quiete = clamp(st.quiete + n, 0, 100);
  if (n <= -8) {
    G.glitch = 6;
    AU.play('heart');
  }
}
function useEnergy(n) {
  const st = G.st;
  if (st.energy <= 0) {
    UI.toast('Sei esaust{o|a}. Vai a dormire.', 'bad');
    return false;
  }
  if (typeof buffOn === 'function' && buffOn('fatica')) n = Math.ceil(n / 2);
  st.energy = Math.max(0, st.energy - n);
  return true;
}
function cropStage(c) {
  if (c.dead) return -1;
  const d = CROPS[c.t].days;
  if (c.a >= d) return 3;
  if (c.a <= 0) return 0;
  return c.a >= d / 2 ? 2 : 1;
}
function harvest(tx, ty, f) {
  Dialoghi.evento('raccolto', { item: f.c && f.c.t });
  const st = G.st,
    c = f.c,
    t = c.t,
    cr = CROPS[t];
  addXP('agri', 4 + cr.days * 2);
  let n = cr.y[0] + Math.floor(Math.random() * (cr.y[1] - cr.y[0] + 1));
  const rich =
    Math.random() <
    0.08 + (f.f ? 0.42 : 0) + (c.bad ? 0 : 0.15) + (isFree(st) && skLv('agri') >= 4 ? 0.15 : 0);
  if (rich) n++;
  if (!addItem(t, n)) return;
  Ext.run('fatto', 'raccogli', 1);
  if (cr.re) {
    c.a = cr.days - cr.re;
    c.dry = 0;
  } else {
    f.c = null;
    f.f = 0;
  }
  AU.play('pick');
  burst('spark', tx * 16 + 8, ty * 16 + 6, rich ? 16 : 8, '#ffe27a');
  (G.pops || (G.pops = [])).push({ img: ICON[t], x: tx * 16 + 8, y: ty * 16 + 2, t0: G.t });
  floatText('+' + (n === 1 ? '1 ' + CROPS[t].n : n + ' ' + PL[t]), tx * 16 + 8, ty * 16 - 6);
  if (rich) setTimeout(() => floatText('Raccolto abbondante!', tx * 16 + 8, ty * 16 - 14, '#b8f08a'), 250);
  st.flags.harvested = (st.flags.harvested || 0) + 1;
  tip('tutSell', 'Raccolto! Tienilo in mano e usalo sulla cassetta accanto a casa per venderlo.');
  if (cr.re) tip('tutRegrow', cr.n + ': la pianta resta. Bagnala e ricrescerà.');
  if (t === 'zucca' && H2(st) && !st.flags.faceSeen) {
    st.flags.faceSeen = 1;
    addQuiete(-6);
    UI.toast("La zucca ha una faccia. Non l'hai intagliata tu.", 'bad');
  }
}
function inFarm(x, y) {
  return x >= FARM.x0 && x <= FARM.x1 && y >= FARM.y0 && y <= FARM.y1;
}
function tip(flag, txt) {
  const F = G.st.flags;
  if (F[flag]) return;
  F[flag] = 1;
  setTimeout(() => UI.toast(txt), 700);
}
function farmAct(tx, ty) {
  const st = G.st,
    m = G.map,
    k = tx + ',' + ty,
    f = st.farm[k],
    it = selItem(),
    id = it && it.id,
    def = id && ITEMS[id];
  if (f && f.c && cropStage(f.c) === 3) {
    harvest(tx, ty, f);
    return;
  }
  const g = m.get(tx, ty),
    free = !m.objAt(tx, ty) && (g === 1 || g === 12);
  if (def && def.t === 'bad') {
    if (free || f) {
      const n = countItem(id);
      removeItem(id, n);
      AU.play('bury');
      burst('dust', tx * 16 + 8, ty * 16 + 8, 10);
      if (id === 'bacche') {
        st.flags.buried += n;
        UI.toast(`Hai seppellito ${n} bacche rosse.`);
      } else {
        st.flags.ribbonBuried = 1;
        UI.toast('Hai seppellito il nastro. Ti senti più legger{o|a}. O più sol{o|a}.');
      }
      addQuiete(4);
      return;
    }
    UI.toast('Non qui.');
    return;
  }
  if (id === 'hoe' && cropGone(f)) {
    if (!useEnergy(1)) return;
    f.c = null;
    f.w = false;
    allImpatto(() => GESTO.terra(tx * 16 + 8, ty * 16 + 12));
    UI.toast('Hai tolto la pianta appassita. Puoi seminare di nuovo.');
    return;
  }
  if (def && def.t === 'fert') {
    if (!f) {
      UI.toast('Il concime va sulla terra dissodata.');
      return;
    }
    if (f.f) {
      UI.toast('Questa zolla è già concimata.');
      return;
    }
    f.f = 1;
    removeItem(id, 1);
    AU.play('plant');
    burst('dust', tx * 16 + 8, ty * 16 + 10, 6);
    floatText('Concimata', tx * 16 + 8, ty * 16 - 4, '#e8c23a');
    tip('tutFert', 'Concimata: il raccolto di questa zolla sarà più abbondante.');
    return;
  }
  if (id === 'hoe') {
    if (isFree(st) ? !ownedAt(tx, ty) : !inFarm(tx, ty)) {
      if (free)
        UI.toast(
          isFree(st)
            ? "Questa terra non è tua. Le terre le vende l'Anziano Ezekiel."
            : 'La terra qui è troppo dura. Coltiva nei campi del nonno.'
        );
      return;
    }
    if (f) {
      UI.toast('È già dissodato.');
      return;
    }
    if (!free) return;
    if (!useEnergy(st.up && st.up.hoe ? 1 : 2)) return;
    st.farm[k] = { w: false, c: null };
    eggDig(tx, ty);
    allImpatto(() => GESTO.terra(tx * 16 + 8, ty * 16 + 12));
    tip('tutHoe', 'Terra dissodata. Ora scegli i semi nella barra (slot 3) e usali qui.');
    return;
  }
  if (id === 'can') {
    if (!f) {
      if (m.get(tx, ty) === 3) {
        UI.toast("L'annaffiatoio è già pieno.");
        return;
      }
      UI.toast('Niente da annaffiare.');
      return;
    }
    if (f.w) return;
    if (!useEnergy(1)) return;
    f.w = true;
    waterWide(tx, ty);
    allImpatto(() => {
      AU.play('water');
      GESTO.acqua(tx * 16 + 8, ty * 16 + 10);
    });
    if (f.c) {
      Ext.run('fatto', 'annaffia', 1);
      st.flags.watered = (st.flags.watered || 0) + 1;
      addXP('agri', 1);
      tip(
        'tutWater',
        `Annaffiata! Cresce di notte, se la bagni ogni giorno: ${CROPS[f.c.t].n.toLowerCase()} matura in ${CROPS[f.c.t].days} notti.`
      );
    }
    return;
  }
  if (def && def.t === 'seed') {
    if (!f) {
      UI.toast('Prima dissoda la terra con la zappa.');
      return;
    }
    if (!cropInSeason(def.crop, seasonOf()) && !(typeof inSerra === 'function' && inSerra(tx, ty))) {
      UI.toast(
        `Non è stagione: ${CROPS[def.crop].n.toLowerCase()} cresce in ${CROPS[def.crop].s.map(i => SEASONS[i].toLowerCase()).join(' e ')}.`
      );
      return;
    }
    if (f.c) {
      UI.toast("C'è già qualcosa qui.");
      return;
    }
    f.c = { t: def.crop, a: 0, dry: 0 };
    removeItem(id, 1);
    AU.play('plant');
    st.flags.planted++;
    GESTO.semi(tx * 16 + 8, ty * 16 + 10);
    floatText('Seminato: ' + CROPS[def.crop].n, tx * 16 + 8, ty * 16 - 4, '#f6e6c0');
    tip('tutSeed', "Seminato! Ora prendi l'annaffiatoio (slot 2) e bagna la terra.");
    return;
  }
  if (f && f.c) {
    const c = f.c,
      n = CROPS[c.t].n;
    if (c.dead) {
      UI.toast(`${n}: è seccata. Ripulisci la zolla con la zappa.`, 'bad');
      return;
    }
    const l = cropLeft(c);
    UI.toast(
      `${n}: ${c.a <= 0 ? 'appena seminata, ' : ''}${l === 1 ? 'matura domani' : 'matura tra ' + l + ' notti'} bagnate.${f.w ? ' Annaffiata oggi.' : cropWilt(f) ? ' È appassita: annaffiala per farla riprendere, o toglila con la zappa e ripianta.' : ' Va annaffiata.'}${f.f ? ' Terra concimata.' : ''}`,
      cropWilt(f) ? 'bad' : ''
    );
    return;
  }
}
// ================= AZIONI =================
// chi o cosa hai davanti: una persona, una bestia, il gatto o la casella (un sasso, un albero, un oggetto).
// Vince il più vicino al punto in cui guardi, con un piccolo vantaggio alle persone: così un gatto o un sasso
// accanto a qualcuno non ti impediscono di parlarci, e una persona accanto a un sasso non ti impedisce di romperlo.
// Con un attrezzo in mano conta solo l'attrezzo: niente carezze a bestie, gatti e compagno (basta una casella
// vuota per coccolarli), e con le persone parli solo se le hai proprio davanti (non di lato).
// La usano sia il tasto azione sia il fumetto sopra la testa, che quindi dicono sempre la stessa cosa.
const AIM_TILE = ['debris', 'tree', 'pine', 'ceppo', 'log', 'rock', 'built', 'bush'];
function aimScelta() {
  const p = G.player,
    m = G.map,
    st = G.st;
  if (!p || !m) return null;
  const ax = p.x + DIRV[p.dir][0] * 14,
    ay = p.y + DIRV[p.dir][1] * 14,
    [fx, fy] = frontTile(),
    it = st && st.inv && st.inv[st.sel],
    attrezzo = !!(it && ITEMS[it.id] && ITEMS[it.id].t === 'tool'),
    C = [];
  for (const n of G.npcs) {
    if (n.hidden || n.map !== m.id) continue;
    const [nx, ny] = ptile(n),
      d = Math.hypot(n.x - ax, n.y - ay),
      davanti = nx === fx && ny === fy;
    if (attrezzo ? davanti || d < 10 : d < 18 || davanti)
      C.push({ k: 'npc', r: n, d: Math.min(d, davanti ? 6 : d) - 3 });
  }
  if (!attrezzo && m.id === 'main' && isFree(st) && G.fanimals)
    for (const e of G.fanimals) {
      if (e.dentro) continue;
      const d = Math.hypot(e.x - ax, e.y - ay);
      if (d < 18) C.push({ k: 'animal', r: e, d });
    }
  if (!attrezzo && m.id === 'main' && G.critters)
    for (const c of G.critters) {
      if (c.k !== 'cat' && c.k !== 'chicken') continue;
      const d = Math.hypot(c.x - ax, c.y - ay);
      if (d < 14) C.push({ k: 'critter', r: c, d: d + 2 });
    }
  const o = m.objAt(fx, fy),
    f = m.id === 'main' && st.farm && st.farm[fx + ',' + fy];
  if ((o && (o.act || AIM_TILE.includes(o.kind))) || (f && f.c))
    C.push({ k: 'tile', d: Math.hypot(fx * 16 + 8 - ax, fy * 16 + 12 - ay) });
  // punto di estensione: altri file aggiungono chi si può toccare ({ k: 'ext', d, act(), fumetto() })
  if (!attrezzo) Ext.run('mira', C, ax, ay, m);
  C.sort((a, b) => a.d - b.d);
  return C[0] || null;
}
function critterAct(c) {
  const p = G.player;
  if (c.k === 'cat') {
    c.st = 'sit';
    c.t = 4;
    AU.play('meow');
    eggCat();
    floatText('♥', c.x, c.y - 20, '#ff8a8a');
    if (!G.st.flags.pettedToday) {
      G.st.flags.pettedToday = 1;
      addQuiete(2);
    }
    UI.toast(
      [
        'Fa le fusa. Ha un occhio giallo e uno… anche giallo.',
        'Il gatto nero ti si struscia sulle gambe.',
        'Miao. Sembra che ti conosca da sempre.'
      ][(Math.random() * 3) | 0]
    );
  } else if (c.k === 'chicken') {
    AU.play('cluck');
    UI.toast('Coccodè! La gallina ti guarda storto.');
    c.tx = c.x + (c.x - p.x) * 2;
    c.ty = c.y + (c.y - p.y) * 2;
    c.st = 'move';
  }
}
function doAction() {
  const [fx, fy] = frontTile();
  const p = G.player;
  toolSwing();
  const sc = aimScelta();
  if (sc && sc.k === 'npc') {
    talkTo(sc.r);
    return;
  }
  if (sc && sc.k === 'ext') {
    sc.act();
    return;
  }
  // le bestie del tuo pollaio e della tua stalla prima delle galline selvatiche del paese
  if (sc && sc.k === 'animal' && typeof animalAct === 'function' && animalAct(sc.r.x, sc.r.y)) return;
  if (sc && sc.k === 'critter') {
    critterAct(sc.r);
    return;
  }
  if (houseAct(fx, fy)) return;
  if (freeAct(fx, fy)) return;
  if (eggAt(fx, fy)) return;
  if (G.map.id === 'main' && hogAt(p.x + DIRV[p.dir][0] * 14, p.y + DIRV[p.dir][1] * 14)) return;
  if (G.visit) {
    // in visita si può mangiare (tranne davanti alla cassetta e al ponte, che hanno le loro azioni)
    const ov = G.map.objAt(fx, fy);
    if (!(ov && (ov.act === 'bin' || ov.act === 'bridge')) && eatSel()) return;
    visitAct(fx, fy);
    return;
  }
  const o = G.map.objAt(fx, fy);
  if (o && o.act) {
    runAct(o);
    return;
  }
  if (useKey()) return;
  if (eatSel()) return;
  if (G.map.id === 'main') farmAct(fx, fy);
}
function runAct(o) {
  const f = ACT[o.act];
  if (f) {
    const r = f(o);
    if (r && r.then) {
      G.cut++;
      r.catch(e => console.error(e)).finally(() => {
        G.cut--;
      });
    }
  }
}
const narr = (t, o) => UI.say(null, t, null, o);
const say = (id, t, mood, o) => UI.say(id, t, mood, o);
const ask = (id, t, opts, mood) => UI.say(id, t, mood, opts);
const ACT = {
  sunflower: () =>
    UI.toast(
      H2()
        ? 'Il girasole non segue il sole. Segue te.'
        : 'Un girasole. Gira la testa verso la luce. Quasi sempre.'
    ),
  hydr: () => UI.toast("Ortensie. Agatha dice che cambiano colore con la terra. Sotto, cosa c'è?"),
  rock: () => UI.toast('Un sasso coperto di muschio. Sotto, formiche al lavoro.'),
  log: () => UI.toast('Un tronco caduto. Dentro è cavo. Qualcosa ci ha fatto la tana.'),
  mush: () => UI.toast('Funghi. Meglio non mangiarli. Meglio non toccarli.'),
  fence: () =>
    UI.toast(
      H2() ? 'Il giallo protegge. Il giallo protegge. Il giallo…' : 'Il recinto giallo. Oltre, il bosco.'
    ),
  pine: () => UI.toast('Pini neri, fitti come denti.'),
  tree: () =>
    UI.toast(
      [
        "Un albero d'autunno. Le foglie cadono senza vento.",
        'Corteccia ruvida. Qualcuno ci ha inciso delle tacche.',
        'Un albero. Sembra ascoltare.'
      ][hsh(G.st.day, G.st.time) % 3]
    ),
  bush: () => UI.toast('Un cespuglio. Solo un cespuglio.'),
  lamp: o => {
    const on = lampOn(o.li, G.st.time);
    UI.toast(
      on
        ? o.li >= 5
          ? "Un lampione acceso. Nessuno l'ha acceso: si è acceso da solo."
          : 'Un lampione acceso. Fratello Lucius li accende ogni sera, uno per uno.'
        : "Un lampione. L'olio puzza di sego."
    );
  },
  feast: () => {
    const st = G.st;
    UI.toast(
      H2(st)
        ? 'Otto piatti apparecchiati. Uno ha già il tuo nome sotto il bicchiere.'
        : 'La tavolata della Festa. Otto posti per lato, zucche e candele gialle.'
    );
  },
  hay: () => UI.toast("Balle di fieno. Ce n'è più di quanto serva a un villaggio senza cavalli."),
  barrel: () => UI.toast('Botti di sidro. Chiuse con la cera gialla.'),
  pumpkin: () =>
    UI.toast(
      H2()
        ? 'La zucca ti sorride. Qualcuno le ha dato una bocca.'
        : 'Una zucca gigante! Hollowmere ne va fiera.'
    ),
  varco: async () => {
    if (await varcoCh3()) return;
    if (isFree(G.st)) {
      const m = missionsFor(G.st).find(
        m =>
          m.tipo === 'recupero' && m.luogo === 'bosco' && mstate(G.st, m.id).acc && !mstate(G.st, m.id).found
      );
      if (m) {
        const c = await ask(null, `Il Varco è aperto. «${m.oggetto}» è da qualche parte nel bosco.`, [
          'Entra nel bosco',
          'Non ancora'
        ]);
        if (c === 0) await goMap('wood', 15, 41, 3);
        return;
      }
      return narr('Il Varco. Il bosco è più quieto, adesso. Senza una ragione, non ci entri.');
    }
    await narr('Il Varco. Un sentiero che entra nel bosco e non ne esce.');
    await narr(
      H2()
        ? 'Senti qualcosa respirare tra gli alberi. Le gambe non ti obbediscono.'
        : 'Le tue gambe si rifiutano di andare avanti. Regola numero due.'
    );
  },
  bridge: async () => {
    const F = G.st.flags;
    if (isFree(G.st)) {
      travelMenu();
      return;
    }
    if (!F.bridgeGone) return narr('Il cocchiere è sparito. Non hai motivo di tornare indietro. Non ancora.');
    if (!F.sawNoBridge) {
      F.sawNoBridge = 1;
      addQuiete(-10);
      await narr("Il ponte… non c'è più.");
      await narr('Solo acqua nera e due pali spezzati. Come se non ci fosse mai stato.');
    } else narr('Acqua nera. Nessun ponte.');
  },
  post: async o => {
    const F = G.st.flags;
    if (F.posts[o.pi]) {
      UI.toast('Un palo giallo. Protetto.');
      return;
    }
    if (!F.gotPaint) {
      UI.toast('Un palo grigio, scrostato. Stona col resto del recinto.');
      return;
    }
    AU.play('paint');
    F.posts[o.pi] = 1;
    burst('spark', o.tx * 16 + 8, o.tx * 0 + o.ty * 16 + 6, 12, PAL.yel);
    o.img = o.img === IMG.fenceHg ? IMG.fenceH : IMG.fenceV;
    const n = F.posts.filter(Boolean).length;
    UI.toast(`Palo dipinto di giallo (${n}/5)`);
    if (n === 5) {
      addQuiete(5);
      removeItem('vernice', 99);
      UI.toast('Il recinto è di nuovo tutto giallo. La vernice è finita.');
    }
  },
  bushR: async o => {
    const st = G.st,
      F = st.flags;
    const it = selItem();
    if (it && it.id === 'hoe') {
      AU.play('bury');
      F.bush[o.bi] = 1;
      F.buried++;
      burst('dust', o.tx * 16 + 8, o.ty * 16 + 8, 14);
      rebuildMaps();
      UI.toast(`Bacche seppellite (${Math.min(F.buried, 3)}/3)`);
      addQuiete(2);
      return;
    }
    const c = await ask(null, 'Un cespuglio carico di bacche rosse. Rosse come… il colore cattivo.', [
      'Raccoglile',
      'Lasciale lì'
    ]);
    if (c === 0) {
      if (addItem('bacche', 1)) {
        F.bush[o.bi] = 1;
        F.pickedBerries = 1;
        addQuiete(-8);
        AU.play('whisper');
        rebuildMaps();
        await narr(
          'Sono calde. Come se avessero un battito.\n(Puoi seppellirle con la zappa, o selezionarle e usarle sul terreno.)'
        );
      }
    } else UI.toast('Con la zappa in mano potresti seppellire il cespuglio.');
  },
  stump: async o => {
    const st = G.st,
      F = st.flags,
      t = st.time;
    if (F.offered) {
      if (st.day > F.offerDay)
        return narr("La focaccia è sparita. Al suo posto, l'impronta di uno zoccolo, bruciata nel legno.");
      return narr('La focaccia è lì. Qualcosa, nel bosco, la sta guardando.');
    }
    if (!countItem('focaccia'))
      return narr('Un vecchio ceppo vicino al Varco. Sopra, tacche incise. Sembrano conteggi.');
    if (t < 18 * 60) return narr('Clara ha detto: al tramonto. Dalle 18:00.');
    if (t > 20 * 60 + 30)
      return narr('Troppo tardi. Il sole è sparito da un pezzo. Senti che non la vogliono più.');
    removeItem('focaccia', 1);
    F.offered = 1;
    F.offerDay = st.day;
    o.img = IMG.stumpB;
    AU.play('ok');
    addQuiete(3);
    await narr('Appoggi la focaccia sul ceppo.');
    AU.play('whisper');
    await narr('Dal bosco, un suono. Come qualcuno che deglutisce.');
  },
  bin: async () => {
    const it = selItem(),
      st = G.st;
    if (mailboxTake()) return;
    if (it && ITEMS[it.id].t === 'crop') {
      const v = Mercato.vendi(it.id, it.n);
      st.shipped.push([it.id, it.n, v]);
      UI.toast(`Spedite ${it.n} × ${ITEMS[it.id].n} (+${SC(v)} domattina)`);
      st.inv[st.sel] = null;
      UI.hotbar();
      AU.play('coin');
      return;
    }
    const tot = st.shipped.reduce((a, [id, n, v]) => a + (v ?? sellPrice(id) * n), 0);
    narr(
      `La cassetta delle spedizioni. Tieni in mano un raccolto per metterlo dentro.\nDomattina verrà pagato. Nessuno ha mai visto chi lo ritira.${st.demand ? `\nOggi si paga di più: ${PL[st.demand]} (+40%).` : ''}${tot ? `\n(Oggi: ${SC(tot)})` : ''}`
    );
  },
  scare: async () => {
    const st = G.st;
    if (st.choreOk && st.chore === 'spaventa' && !st.choreDone) {
      await narr('Raccogli il cappello di paglia da terra e lo rimetti sulla testa dello spaventapasseri.');
      await narr('…Il cappello era già sulla sua testa. Eppure ne stai tenendo uno in mano.');
      AU.play('whisper');
      choreDone();
      return;
    }
    if (H2(st)) {
      addQuiete(-2);
      return narr('Lo spaventapasseri adesso guarda verso casa tua. Lo hai sempre visto guardare la strada.');
    }
    narr('Uno spaventapasseri col sorriso cucito. Il nonno lo chiamava "Signor Paglia".');
  },
  board: () => UI.board(),
  well: async () => {
    const st = G.st;
    if (st.choreOk && st.chore === 'pozzo' && !st.choreDone && !st.flags.bucket) {
      st.flags.bucket = 1;
      AU.play('water');
      return narr(
        "Riempi il secchio. L'acqua è fredda e sa di ferro.\n(Portala alla tomba di Elias, nel cimitero.)"
      );
    }
    narr(
      G.horror > 0.4
        ? 'Guardi giù nel pozzo. Il tuo riflesso guarda su. Poi si gira.'
        : 'Il pozzo del villaggio. Una monetina brilla sul fondo.'
    );
    if (G.horror > 0.4) addQuiete(-1);
  },
  stall: () => {
    const a = NPC('agatha');
    if (!a.hidden && a.map === 'main' && Math.abs(a.x - 49 * 16 - 8) < 20) talkTo(a);
    else if (!a.hidden && a.map === 'main' && Math.hypot(a.x - (55 * 16 + 8), a.y - (17 * 16 + 14)) < 34)
      UI.toast("Con la pioggia Agatha ha ritirato il banco. Vende dal portico dell'emporio.");
    else if (isFree(G.st) && G.st.time >= 6 * 60 && G.st.time < 21 * 60) {
      UI.toast("Agatha non c'è. Un cartello: «Servitevi pure. Gli scudi nel barattolo.»");
      return UI.shop();
    } else UI.toast('Il banco di Agatha. Chiuso.');
  },
  anvil: () => {
    const b = NPC('brom');
    if (!b.hidden && Math.hypot(b.x - G.player.x, b.y - G.player.y) < 48) talkTo(b);
    else UI.toast("L'incudine di Brom. È ancora tiepida.");
  },
  grave: o => {
    const E = [
      'JOSIAH WREN — Contato.',
      'MERCY HALE — Contata.',
      'THOMAS ASHBY — Contato due volte.',
      "ABIGAIL MOSS — Arrivata d'autunno.",
      'Il nome è stato raschiato via.',
      'SAMUEL CROWE — Il giallo non bastò.',
      'HANNAH PRICE — Riposa. Non tornare.',
      'Una lapide nuova. Nessun nome. Ancora.',
      'EZRA BLACKWOOD — Un forestiero.',
      'PRUDENCE GALE — Contata.'
    ];
    UI.toast(E[o.gi % E.length]);
  },
  elias: async () => {
    const st = G.st;
    st.flags.visitedGrave = 1;
    UI.quest();
    if (st.choreOk && st.chore === 'pozzo' && !st.choreDone && st.flags.bucket) {
      st.flags.bucket = 0;
      AU.play('water');
      await narr("Versi l'acqua sulla terra della tomba. La terra la beve tutta, avida.");
      choreDone();
      return;
    }
    if (H2(st)) {
      addQuiete(-3);
      return narr("ELIAS MARLOWE — Tornerà per il raccolto.\n\nLa terra della tomba è smossa. Dall'interno.");
    }
    narr('ELIAS MARLOWE — Tornerà per il raccolto.\n\nLa tomba del nonno. Fiori gialli, freschi.');
  },
  nameless: () => UI.nameless(),
  door: async o => {
    const st = G.st,
      F = st.flags,
      t = st.time;
    // punto di estensione: bussare a chi è in casa (porte.js)
    const ix = Ext.intercetta('porta:intercetta', o);
    if (ix) return ix;
    switch (o.key) {
      case 'house':
        return goMap('house', 6, houseSize(st).h - 2, 3);
      case 'chapel':
        if (t >= 22 * 60 || t < 6 * 60 || (F.finaleChase && !F.ch2end))
          return narr('La porta della cappella è sbarrata. Da dentro.');
        return goMap('chapel', 7, 9, 3);
      case 'store':
        return narr(
          'Emporio Crane. Un biglietto sulla porta: «Sono al banco in piazza. Prezzi onesti. — A.»'
        );
      case 'cottage':
        return narr('La casetta di Clara. Profuma di pane e di cera gialla.');
      case 'forge':
        return narr('La fucina di Brom. Fa caldo anche da fuori. Dentro, tanti ferri di cavallo appesi.');
      case 'elder':
        if (F.tobiaTalk && !F.barnKey) {
          F.barnKey = 1;
          giveItem('keyI');
          addQuiete(-3);
          await narr("Sopra la porta dell'Anziano è inchiodato un ferro di cavallo, come portafortuna.");
          return narr(
            "Ci passi le dita dietro. C'è una chiave di ferro, fredda.\n(Hai ottenuto: Chiave del fienile)"
          );
        }
        return narr(
          t >= 20 * 60
            ? 'Le luci sono spente. Ma qualcuno ti osserva dalla finestra.'
            : 'Bussi. Nessuno risponde. La tenda però si è mossa.'
        );
      case 'barn':
        if (!F.barnKey) {
          if (!F.sawBarn) {
            F.sawBarn = 1;
            addQuiete(-3);
          }
          return narr(
            "Il fienile dell'Anziano. È rosso.\nL'unica cosa rossa in tutta Hollowmere. È chiuso a chiave."
          );
        }
        if (F.ch2end && st.chapter < 3) return narr('Il fienile è vuoto adesso. Hanno portato via tutto.');
        if (F.finaleChase) return narr('NON LÌ! A CASA!', { dark: 1 });
        if (t < 21 * 60 && t >= 6 * 60 && st.chapter < 3)
          return narr(
            "Senti qualcuno muoversi dentro. Una voce: l'Anziano. Meglio tornare dopo la campana delle nove."
          );
        AU.play('door');
        return goMap('barn', 4, 6, 3);
    }
  },
  // interni
  bed: async () => {
    if (G.st.chapter >= 4 && G.st.flags.ch4day === G.st.day && !G.st.flags.festaDone)
      return narr("Stasera c'è la Festa. Non puoi mancare: ti aspettano tutti. Tutti.", { dark: 1 });
    const t = G.st.time,
      o = [],
      tired = G.st.day === 1 && G.st.flags.tired;
    if (tired) o.push(['Dormi fino a domani', () => endDay(false)]);
    if (t < 20 * 60 + 30) o.push(["Riposa un'ora", () => rest(60)]);
    if (t < 12 * 60) o.push(['Riposa fino a mezzogiorno', () => rest(12 * 60 - t)]);
    if (t < 18 * 60) o.push(['Riposa fino alle 18:00', () => rest(18 * 60 - t)]);
    if (!tired) o.push(['Dormi fino a domani', () => endDay(false)]);
    o.push(['Non ancora', null]);
    const c = await ask(
      null,
      G.st.day === 1 && G.st.flags.tired
        ? 'Sei sfinit{o|a} dal viaggio. Il letto del nonno sa di lavanda. Dormi fino a domani?'
        : t < 18 * 60
          ? "Il letto del nonno. Coperte gialle, che sanno di lavanda. Puoi riposare un po', o dormire fino a domattina."
          : 'Il letto del nonno. Coperte gialle, che sanno di lavanda. Dormire?',
      o.map(a => a[0])
    );
    const f = o[c] && o[c][1];
    if (f) await f();
  },
  bench: async () => {
    const t = G.st.time;
    if (t >= 20 * 60 + 30) return narr("È tardi. Non è un'ora per stare seduti all'aperto.");
    const o = [["Aspetta un'ora", 60]];
    if (t < 12 * 60) o.push(['Aspetta fino a mezzogiorno', 12 * 60 - t]);
    if (t < 18 * 60) o.push(['Aspetta fino alle 18:00', 18 * 60 - t]);
    o.push(['Alzati', 0]);
    const c = await ask(
      null,
      'Una panchina di legno, consumata da generazioni di attese. Ti siedi?',
      o.map(a => a[0])
    );
    if (o[c] && o[c][1]) await rest(o[c][1], true);
  },
  chest: async o => {
    const F = G.st.flags;
    if (F.openedChest) return narr('La cassa del nonno. Vuota, a parte un odore di tabacco e di terra.');
    if (!F.gotChestKey)
      return narr('La cassa del nonno. È chiusa a chiave. Qualcuno al villaggio forse ha la chiave.');
    F.openedChest = 1;
    removeItem('key', 9);
    o.img = IMG.chestO;
    AU.play('door');
    await narr('La chiave gira. Dentro: una pipa, un fazzoletto giallo, e una pagina strappata.');
    AU.play('page');
    await UI.paper(PAGES.p1);
    addQuiete(-8);
  },
  shelf: () =>
    isFree(G.st)
      ? recipeBook()
      : narr(
          H2()
            ? 'Libri del nonno. Su ogni dorso, qualcuno ha scritto a matita un numero. Tutti "8".'
            : 'Libri del nonno: almanacchi, un erbario, "Il buon contadino". Polvere.'
        ),
  table: () => narr('Un tavolo per una persona. Ci sono due sedie.'),
  fire: () => (G.map.id === 'house' ? cookMenu() : narr('Il fuoco scoppietta e ti scalda le mani.')),
  window: () =>
    narr(
      G.night > 0.5
        ? 'Fuori è buio pesto. Qualcosa di più buio si muove al limite del campo.'
        : 'Dalla finestra vedi i campi e il recinto giallo.'
    ),
  portrait: () => {
    if (H2()) {
      addQuiete(-3);
      return narr('Il ritratto del nonno. Qualcuno ha grattato via la testa.');
    }
    return narr('Il nonno Elias, da giovane. Sorride. Ha i tuoi occhi.');
  },
  page2: async () => {
    const F = G.st.flags;
    F.page2 = 1;
    AU.play('page');
    await UI.paper(PAGES.p2);
    addQuiete(-8);
    rebuildMaps();
  },
  altar: () =>
    narr(
      "L'altare. Un drappo giallo, due candele. Nessuna croce: solo un cerchio intagliato con otto tacche."
    ),
  candle: () => narr('Candele di sego. Fumano nero.'),
  pew: async () => {
    const st = G.st;
    if (massNow()) {
      if (st.flags['mass' + st.day])
        return narr(
          "Hai già ascoltato la messa, oggi. Lucius ti sorride dall'altare. Un sorriso un po' troppo largo."
        );
      const c = await ask(null, 'Fratello Lucius sta per cominciare la messa. Ti siedi in una panca?', [
        'Siediti',
        'Non ora'
      ]);
      if (c === 0) return attendMass();
      return;
    }
    narr('Panche di legno consumato. Sullo schienale qualcuno ha inciso: "NON GIRARTI".');
  },
  rope: async () => {
    const st = G.st,
      t = st.time;
    if (st.choreOk && st.chore === 'campana' && !st.choreDone) {
      if (t >= 12 * 60 && t < 13 * 60) {
        AU.play('bell');
        G.shake = 1.5;
        await narr(
          'DONG. La campana suona sopra di te. In tutta la valle, la gente si ferma e guarda la cappella.'
        );
        choreDone();
        return;
      }
      return narr('La faccenda dice: a mezzogiorno. Tra le 12:00 e le 13:00.');
    }
    narr('La corda della campana. Solo Fratello Lucius può suonarla. E tu, se te lo chiedono.');
  },
  costume: async () => {
    const F = G.st.flags;
    if (!F.sawCostume) {
      F.sawCostume = 1;
      addQuiete(-10);
      await narr(
        "Appeso a un'impalcatura di vimini: un mantello nero, enorme. Il colletto è imbottito per sembrare un collo mozzato."
      );
      await narr('Accanto, una sciabola di latta. Un costume.');
      await narr('Il Cavaliere senza testa… è un costume. Lo hanno costruito loro.');
      await barnCheck();
      return;
    }
    narr('Il costume del Cavaliere. Vuoto.');
  },
  stilts: () => narr('Trampoli. In fondo, inchiodati, zoccoli di cavallo veri. Ecco le impronte.'),
  lanternI: () =>
    narr(
      G.st.flags.barnDark
        ? 'La lanterna è spenta. Lo stoppino è ancora caldo.'
        : 'Una lanterna. Il vetro è dipinto di rosso.'
    ),
  ledger: async () => {
    const F = G.st.flags;
    AU.play('page');
    await UI.ledger();
    if (!F.readLedger) {
      F.readLedger = 1;
      addQuiete(-15);
    }
    await barnCheck();
  }
};
function choreDone() {
  const st = G.st;
  st.choreDone = true;
  st.choreFatte = (st.choreFatte || 0) + 1;
  const c = CHORES[st.chore];
  st.money += c.pay;
  AU.play('coin');
  UI.toast(`Faccenda completata: +${SC(c.pay)}`);
  addQuiete(3);
  addFriend('ezekiel', 1);
}
// Le faccende storiche si completano con la loro azione (campana, foglie, pozzo, spaventapasseri). Le altre
// (vedi le faccende della Valle in sempre.js) dicono come si contano, e il conto parte quando le accetti:
//   n          quante volte
//   fatto      un tipo di Ext 'fatto' ('annaffia', 'raccogli', 'albero', 'falcia')
//   ottieni    gli oggetti che entrano nello zaino che contano (lista o funzione id → vero)
//   misura     un numero della partita che cresce (pesci pescati, detriti tolti…): conta quanto sale
//   luoghi     [[x, y, nome]] da raggiungere nel villaggio
//   assoluto   la misura conta così com'è (non da quando l'hai accettata)
//   ok(st)     se oggi si può proporre (hai le galline? il compagno?)
//   valle      solo nel gioco libero
const CHORES = {
  campana: { t: 'Suona la campana della cappella tra le 12:00 e le 13:00', pay: 60 },
  foglie: { t: 'Spazza le 4 cataste di foglie davanti alla cappella', pay: 50 },
  pozzo: { t: 'Prendi acqua dal pozzo e versala sulla tomba di Elias', pay: 45 },
  spaventa: { t: 'Rimetti il cappello allo spaventapasseri della tua fattoria', pay: 35 }
};
// la mattina una faccenda; nella Valle, finita quella, alla bacheca se ne prende un'altra (fino a CHORE_GIORNO)
const CHORE_GIORNO = 3;
function choreScegli(st, altra) {
  if (!altra) st.choreFatte = 0;
  const ks = Object.keys(CHORES).filter(
    k => k !== st.lastChore && (!CHORES[k].valle || isFree(st)) && (!CHORES[k].ok || CHORES[k].ok(st))
  );
  st.chore = ks[(Math.random() * ks.length) | 0];
  st.lastChore = st.chore;
  st.choreOk = st.choreDone = false;
  st.choreC = 0;
  st.choreV = [];
}
function choreAccetta(st) {
  const c = CHORES[st.chore];
  st.choreOk = true;
  st.choreC = 0;
  st.choreV = [];
  st.choreB = c && c.misura ? c.misura(st) : 0;
}
// a che punto sei: [fatti, quanti] (null per le faccende storiche, che non hanno un conto)
function choreProg(st) {
  const c = CHORES[st.chore];
  if (!c || !c.n) return null;
  const a = c.misura
    ? c.misura(st) - (c.assoluto ? 0 : st.choreB || 0)
    : c.luoghi
      ? (st.choreV || []).length
      : st.choreC || 0;
  return [Math.min(c.n, Math.max(0, a)), c.n];
}
const choreText = st => {
  const c = CHORES[st.chore],
    p = choreProg(st);
  return c ? c.t + (p ? ` (${p[0]}/${p[1]})` : '') : '';
};
function choreVerifica(st) {
  const p = choreProg(st);
  if (p && p[0] >= p[1] && st.choreOk && !st.choreDone) {
    choreDone();
    UI.quest();
  }
}
const choreAttiva = () => {
  const st = G.st;
  return !G.visit && st && st.choreOk && !st.choreDone && CHORES[st.chore];
};
Ext.on('fatto', (tipo, n) => {
  const c = choreAttiva();
  if (!c || c.fatto !== tipo) return;
  G.st.choreC = (G.st.choreC || 0) + n;
  choreVerifica(G.st);
});
Ext.on('ottieni', (id, n) => {
  const c = choreAttiva();
  if (!c || !c.ottieni || !(typeof c.ottieni === 'function' ? c.ottieni(id) : c.ottieni.includes(id))) return;
  G.st.choreC = (G.st.choreC || 0) + n;
  choreVerifica(G.st);
});
// i conti della partita e i luoghi si controllano due volte al secondo
{
  let T = 0;
  Ext.on('mpTick', dt => {
    T -= dt;
    if (T > 0) return;
    T = 0.5;
    const c = choreAttiva();
    if (!c || !c.n) return;
    const st = G.st;
    if (c.luoghi && G.map && G.map.id === 'main') {
      const [px, py] = ptile(G.player);
      for (const [x, y, nome] of c.luoghi)
        if (!st.choreV.includes(nome) && Math.abs(px - x) <= 2 && Math.abs(py - y) <= 2) {
          st.choreV.push(nome);
          AU.play('blip');
          UI.toast(`${nome} ✓ (${st.choreV.length}/${c.luoghi.length})`);
        }
    }
    choreVerifica(st);
  });
}
ACT.leaves = o => {
  const st = G.st;
  st.leaves[o.li] = 1;
  AU.play('step');
  burst('spark', o.tx * 16 + 8, o.ty * 16 + 8, 10, '#d9822b');
  const n = st.leaves.filter(Boolean).length;
  UI.toast(`Foglie spazzate (${n}/4)`);
  rebuildMaps();
  if (n === 4) {
    choreDone();
    if (st.day >= 2) UI.toast("Sotto l'ultima catasta, un dente. Umano.", 'bad');
  }
};
// ================= PAGINE =================
const PAGES = {
  p1: `<h2>Pagina strappata</h2><div class="paper"><p><i>Dal diario di Elias Marlowe</i></p><p>Il primo giorno mi hanno sorriso tutti. Il secondo mi hanno dato la vernice. Il terzo mi hanno <b>contato</b>.</p><p>Dicono che il rosso è il colore cattivo. Ma il fienile dell'Anziano è rosso. È l'unico. Nessuno ci fa caso, o tutti fanno finta.</p><p>Il giallo dei loro mantelli puzza di sego e di paura.</p><p>Se stai leggendo, sei arrivat{o|a}. <s>Mi dispiace.</s> Coltiva. Sorridi. Rispetta le regole.</p><p class="ink">E non farti contare due volte.</p></div>`,
  p2: `<h2>Una pagina sotto la porta</h2><div class="paper"><p><i>La calligrafia del nonno. L'inchiostro è fresco.</i></p><p>Quell'autunno mi risparmiarono. Ezekiel disse che la Valle accetta i debiti: <b>«Uno del tuo sangue, quando sarà il momento.»</b></p><p>Firmai. Ero giovane. Avevo paura. Volevo vivere.</p><p>Ho vissuto cinquant'anni nella Valle Quieta. Ti ho scritto ogni Natale e non ho mai spedito niente. Fino a quest'anno.</p><p>Le lanterne gialle non proteggono. <b>Segnano.</b></p><p class="ink">Il fienile. Di notte. Leggi il registro.</p></div>`
};
async function barnCheck() {
  const F = G.st.flags;
  if (!(F.sawCostume && F.readLedger) || F.barnEvent) return;
  F.barnEvent = 1;
  await sleep(600);
  F.barnDark = 1;
  AU.play('slam');
  G.shake = 3;
  await narr('La lanterna si spegne di colpo.');
  G.cutMusic = 'silent';
  await sleep(900);
  AU.play('hooves');
  await sleep(1600);
  await narr('Fuori. Zoccoli. Pesanti, lenti, sempre più vicini.');
  await narr('Ma il costume è ancora qui, appeso. Vuoto.');
  G.glitch = 12;
  AU.play('sting');
  addQuiete(-15);
  await narr('Allora chi sta cavalcando?', { dark: 1 });
  G.checkpoint = JSON.stringify(G.st);
  F.finaleChase = 1;
  await goMap('main', 58, 31, 0, true);
  await sleep(300);
  G.cutMusic = null;
  spawnHorse(44, 40, 61);
  await narr('CORRI. A CASA. ADESSO.', { dark: 1 });
}
