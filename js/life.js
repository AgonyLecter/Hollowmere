'use strict';
// ================= VITA DELLA VALLE =================
// Calendario, meteo, messa, lampioni, preparativi della Festa, cucina, favori, fucina.
const WD = st => (st.day + 3) % 7; // 0 Lun … 5 Sab, 6 Dom
const isSunday = st => st.day >= 1 && WD(st) === 6;
const massNow = () => {
  const st = G.st;
  return !!st && isSunday(st) && st.time >= 9 * 60 && st.time < 10 * 60 + 30;
};
const MASS_SEATS = {
  lucius: [7, 3, 0],
  ezekiel: [2, 4, 3],
  agatha: [3, 4, 3],
  brom: [10, 4, 3],
  clara: [11, 4, 3]
};
const rainy = st => st.weather === 'pioggia';
const sellPrice = id =>
  Math.round(
    ITEMS[id].v *
      (typeof evMult === 'function' ? evMult(id) : 1) *
      (G.st && G.st.demand === id ? 1.4 : 1) *
      (isFree() ? (skLv('agri') >= 8 ? 1.25 : skLv('agri') >= 2 ? 1.1 : 1) : 1)
  );

// ---------- lampioni: Lucius li accende (e li spegne) uno per uno; gli ultimi tre si accendono "da soli" ----------
const LAMPS = [
  [38, 15],
  [51, 15],
  [51, 23],
  [38, 23],
  [45, 26],
  [44, 38],
  [29, 17],
  [11, 18]
];
const LAMPT = (() => {
  const T = { on: [], off: [], eve: [], mor: [] },
    SPD = 38 * 0.42;
  const leg = (a, b) => Math.ceil(((Math.hypot(a[0] - b[0], a[1] - b[1]) * 16) / SPD) * 1.5) + 2;
  const run = (start, from, order, key, arr) => {
    let t = start,
      p = from;
    for (const i of order) {
      const q = [LAMPS[i][0], LAMPS[i][1] + 1],
        t0 = t;
      t += leg(p, q);
      T[key][i] = t;
      arr.push({ i, from: t0, to: t + 1 });
      p = q;
    }
    return t + 1;
  };
  T.eEnd = run(1010, [54, 9], [1, 2, 4, 3, 0], 'on', T.eve);
  T.mEnd = run(362, [53, 9], [1, 2, 4, 3, 0], 'off', T.mor);
  T.on[5] = 1055;
  T.on[6] = 1068;
  T.on[7] = 1080;
  T.off[5] = 395;
  T.off[6] = 405;
  T.off[7] = 415;
  return T;
})();
const lampOn = (i, t) => !G.festaDark && (t >= LAMPT.on[i] || t < LAMPT.off[i]);
function lampSeg(S, tag, t) {
  for (const g of S)
    if (t >= g.from && t < g.to) {
      const [lx, ly] = LAMPS[g.i];
      return at(lx, ly + 1, 3, 'light', 0, {
        sp: 38,
        lk: tag + g.i,
        lt: tag === 'e' ? LAMPT.on[g.i] : LAMPT.off[g.i],
        lx,
        ly
      });
    }
  return null;
}

// ---------- routine: il meteo, la domenica e la Festa cambiano la giornata di tutti ----------
function schedOf(id) {
  return worldAdjust(id, SCHED[id] ? SCHED[id](G.st) : null, G.st);
}
function worldAdjust(id, s, st) {
  // gioco libero: ogni abitante passa, un giorno a settimana, dalla tua fattoria
  {
    const fv = festSched(id, st);
    if (fv) return fv;
    const v = freeVisitSched(id, st);
    if (v) return v;
  }
  // dopo la Fuga Clara vive fuori: torna nella Valle solo la domenica
  if (isFree(st) && st.free.ending === 1 && id === 'clara' && !isSunday(st)) return null;
  const t = st.time,
    F = st.flags;
  if (st.day < 1 || F.finaleChase || id === 'faceless' || (F.ezWait && id === 'ezekiel')) return s;
  if (
    st.chapter >= 4 &&
    F.ch4day === st.day &&
    !F.festaDone &&
    !F.conteggio &&
    FESTA_POS[id] &&
    t >= 18 * 60 + 30 &&
    t < 23 * 60 + 45
  ) {
    const [fx, fy] = FESTA_POS[id];
    return at(fx, fy, 0, 'festa', 1, { snap: 1 });
  }
  // Capitolo III: finché non lo trovi nel fienile, Tobia di giorno sta lì dentro
  if (id === 'tobia' && st.chapter >= 3 && !F.tobiaScene && t >= 6 * 60 && t < 21 * 60)
    return Object.assign(at(4, 4, 0, 'hide'), { in: 'barn', seat: [4, 4, 0] });
  // domenica: messa alle 9, tutti in cappella (Tobia no)
  if (isSunday(st) && id !== 'tobia') {
    if (id === 'lucius' && t >= 8 * 60 + 15 && t < 9 * 60) return at(43, 12, 0, 'call', 0); // il prete aspetta fuori dalla cappella e chiama chi non è ancora entrato
    if (t >= 8 * 60 + 30 && t < 9 * 60) return at(43, 13, 0, 'gather', 1);
    if (t >= 9 * 60 && t < 10 * 60 + 30)
      return Object.assign(at(7, 3, 0, 'mass'), { in: 'chapel', seat: MASS_SEATS[id] });
    if (t >= 10 * 60 + 30 && t < 11 * 60 + 30) return at(43, 14, 0, 'gather', 2);
  }
  // pioggia: ognuno si ripara sotto il suo portico
  if (rainy(st) && s) {
    if (id === 'agatha' && s.act === 'stall') return at(55, 17, 0, 'stall', 0, { shelter: 1 });
    if (id === 'clara' && (s.act === 'flowers' || s.act === 'idle')) return at(35, 29, 0, 'idle', 0);
    if (id === 'lucius' && (s.act === 'sweep' || s.act === 'tend')) return at(43, 12, 0, 'watch', 0);
    if (id === 'ezekiel' && (s.act === 'walk' || s.act === 'watch' || s.act === 'pray'))
      return at(52, 31, 0, 'watch', 0);
  }
  if (st.weather === 'nebbia') {
    if (id === 'clara' && s && s.act === 'flowers') return at(35, 29, 0, 'idle', 0);
    if (id === 'tobia' && t >= 540 && t < 1020 && !(F.ch1end && !F.tobiaTalk)) return at(31, 6, 3, 'play', 2); // nella nebbia, Tobia sta al Varco
  }
  // preparativi della Festa del Raccolto
  if (st.day >= 5 && !isSunday(st) && !st.free) {
    if (id === 'brom' && ((t >= 540 && t < 720) || (t >= 780 && t < 900))) return at(43, 18, 0, 'build', 1);
    if (id === 'clara' && t >= 780 && t < 900 && !rainy(st)) return at(45, 16, 0, 'hang', 1);
  }
  return s;
}

const ACTD = {
  call: 'chiama alla messa',
  hide: 'si nasconde',
  forge: 'batte il ferro',
  stall: 'serve al banco',
  sweep: 'spazza il sagrato',
  tend: 'cura le tombe',
  watch: 'osserva il villaggio',
  walk: 'fa il suo giro',
  pray: 'prega',
  flowers: 'raccoglie fiori',
  deliver: 'consegna il pane',
  play: 'gioca',
  light: 'accende i lampioni',
  build: 'monta le tavolate',
  hang: 'appende i festoni',
  mass: 'alla messa',
  gather: 'chiacchiera sul sagrato',
  chat: 'chiacchiera',
  idle: 'passeggia'
};
function placeNameAt(n) {
  const x = Math.floor(n.x / 16),
    y = Math.floor((n.y - 3) / 16);
  if (x >= 38 && x <= 51 && y >= 15 && y <= 23) return 'in piazza';
  if (x >= 39 && x <= 47 && y >= 12 && y <= 14) return 'sul sagrato';
  for (const [k, t] of [
    ['chapel', 'alla cappella'],
    ['store', "all'emporio"],
    ['elder', "dall'Anziano"],
    ['forge', 'alla fucina'],
    ['cottage', 'da Clara'],
    ['barn', 'al fienile'],
    ['house', 'a casa tua']
  ]) {
    const b = BLD[k];
    if (x >= b.x - 1 && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h + 1) return t;
  }
  if (x >= FARM.x0 && x <= FARM.x1 && y >= FARM.y0 && y <= FARM.y1) return 'nei campi';
  if (y <= 8 && x >= 26 && x <= 35) return 'al Varco';
  if (x >= 47 && y <= 11) return 'al cimitero';
  return 'per i sentieri';
}

// frasi che dipendono da ciò che l'abitante sta facendo in quel momento
const ACTL = {
  ezekiel: {
    walk: [
      'Faccio il mio giro, {n}. Qualcuno deve pur farlo.',
      'Cammino e conto i recinti. Sono tutti al loro posto. Quasi.'
    ],
    pray: ['Un momento di raccoglimento, {n}.'],
    watch: ['Osservo. È il mio compito.', 'Da qui si vede quasi tutta la Valle. Quasi.'],
    gather: ['Dopo la messa la gente ha sempre fame di parole.']
  },
  agatha: {
    stall: [
      'Compri o guardi, tesoro?',
      'Guarda pure. Toccare costa un pochino.',
      'Tutto fresco di stamattina. Il pane lo porta Clara.'
    ],
    gather: ['Che bella predica! Non ricordo di cosa parlasse, ma bella.']
  },
  lucius: {
    call: [
      'Venite, venite alla messa!',
      'La messa sta per cominciare, {n}!',
      "C'è posto in cappella, {figliolo|figliola}."
    ],
    sweep: ['Spazzo. Le foglie cadono solo qui: non ho mai capito perché.'],
    tend: ['Cura delle tombe. I morti ricambiano, a modo loro.'],
    light: ['Un lampione alla volta. Così nessuno resta al buio.', 'Il sego costa poco. Il buio, tanto.'],
    watch: ['Guardo il sagrato. Qualcuno deve contare chi passa.'],
    mass: ['Silenzio, {figliolo|figliola}. Stiamo per cominciare.'],
    gather: ['Il sagrato, dopo la messa, è il posto più vivo della Valle.']
  },
  clara: {
    flowers: ['Scelgo i fiori più gialli per la cappella.', 'Il giallo ci sta bene addosso, vero?'],
    hang: [
      'I festoni devono pendere tutti uguali. Altrimenti Ezekiel se ne accorge.',
      'Ne servono otto per lato. Otto. Non so perché.'
    ],
    deliver: ['Il pane! Scotta! Metà ad Agatha, metà a chi lo merita.'],
    gather: ['Che bella messa… Lucius ha contato tutti. Come sempre.']
  },
  brom: {
    forge: [
      'Non ora, il ferro è caldo. Parla pure, ma non mi fermare.',
      'Clang. Clang. Se parli forte copri il rumore.'
    ],
    build: [
      'Tavolate. Per la Festa. Più lunghe di quanto serva a una Valle così piccola.',
      'Chiodi storti. Legno nuovo. Mh.'
    ],
    gather: ['Messa. Mh.']
  },
  tobia: { play: ['Rincorro le galline! Sono più veloci di te!', 'Non mi prendi! Hihi!'] }
};
// chiacchiere fra abitanti che dipendono da ciò che è successo
const CHATC = [
  [
    'ezekiel',
    'lucius',
    [
      ['lucius', 'Il forestiero ha dipinto tutti i pali.'],
      ['ezekiel', 'Lo ha fatto bene?'],
      ['lucius', 'Meglio di Elias.'],
      ['ezekiel', 'Non dirlo ad alta voce.']
    ],
    st => st.flags.posts.every(Boolean)
  ],
  [
    'agatha',
    'clara',
    [
      ['clara', '{n} ha dimenticato la focaccia, ieri sera.'],
      ['agatha', 'Allora stanotte ha sentito.'],
      ['clara', 'Ha sentito, sì.']
    ],
    st => !!st.flags.missedOffer
  ],
  [
    'agatha',
    'clara',
    [
      ['agatha', 'Ti vedo spesso con {n}, tesoro.'],
      ['clara', 'Ci parlo e basta!'],
      ['agatha', 'Certo. E io vendo semi per hobby.']
    ],
    st => hearts('clara') >= 3
  ],
  [
    'brom',
    'ezekiel',
    [
      ['ezekiel', 'Le tavolate?'],
      ['brom', 'Una è quasi pronta.'],
      ['ezekiel', 'Servono entrambe.'],
      ['brom', 'Per quanti posti?'],
      ['ezekiel', 'Otto.']
    ],
    st => st.day >= 5
  ],
  [
    'agatha',
    'lucius',
    [
      ['agatha', 'Bella predica.'],
      ['lucius', "Era quella dell'anno scorso."],
      ['agatha', 'Per questo mi è piaciuta.']
    ],
    st => isSunday(st)
  ],
  [
    'clara',
    'tobia',
    [
      ['tobia', 'Le pozzanghere ridono!'],
      ['clara', 'Tobia, ti bagni tutto!'],
      ['tobia', 'Hihi. Rosse non ce ne sono.']
    ],
    st => rainy(st)
  ],
  [
    'lucius',
    'ezekiel',
    [
      ['lucius', 'Il forestiero ha guardato il fiume.'],
      ['ezekiel', 'Lo so.'],
      ['lucius', 'Il ponte…'],
      ['ezekiel', "Non c'è mai stato."]
    ],
    st => !!st.flags.sawNoBridge
  ],
  [
    'agatha',
    'brom',
    [
      ['agatha', 'Il forestiero porta roba buona, in piazza.'],
      ['brom', 'Mh.'],
      ['agatha', 'Per una volta la roba è buona sul serio.']
    ],
    st => (st.favors || []).some(f => f.done)
  ],
  [
    'clara',
    'agatha',
    [
      ['agatha', '{n} cucina, adesso. Ha fatto una torta.'],
      ['clara', "Com'era?"],
      ['agatha', 'Troppo buona per essere di un forestiero.']
    ],
    st => (st.flags.cooked || 0) >= 2
  ],
  [
    'ezekiel',
    'agatha',
    [
      ['ezekiel', 'Il rosso, nei campi di Marlowe?'],
      ['agatha', 'Ancora lì, dicono.'],
      ['ezekiel', 'Ricordaglielo.']
    ],
    st => st.day >= 3 && st.flags.gotPaint && st.flags.buried < 3
  ],
  [
    'tobia',
    'brom',
    [
      ['tobia', 'Brom! Per chi sono i ferri?'],
      ['brom', '…'],
      ['tobia', 'Per il Cavaliere! Hihi!'],
      ['brom', 'Vai via, Tobia.']
    ],
    st => st.day >= 3
  ],
  [
    'lucius',
    'clara',
    [
      ['clara', 'Non mi piace la nebbia.'],
      ['lucius', 'Sembrano persone in fila.'],
      ['clara', 'Lucius!']
    ],
    st => st.weather === 'nebbia'
  ],
  [
    'ezekiel',
    'brom',
    [
      ['ezekiel', 'Il forestiero vuole attrezzi nuovi?'],
      ['brom', 'Li ha ordinati.'],
      ['ezekiel', 'Ne avrà bisogno.']
    ],
    st => !!st.forge
  ]
];
function chatPool() {
  const st = G.st;
  return CHATS.concat(
    H2(st) ? CHATS2 : [],
    CHATC.filter(c => {
      try {
        return c[3](st);
      } catch (e) {
        return false;
      }
    })
  );
}

// ---------- tempo che passa (cucina, messa) ----------
async function passTime(min, msg) {
  const st = G.st;
  G.cut++;
  try {
    await UI.fade(1, 400);
    for (let i = 0; i < min; i++) {
      st.time++;
      onMinute();
    }
    snapNPCs();
    G.parts = [];
    UI.hud();
    UI.quest();
    await sleep(200);
    await UI.fade(0, 500);
    if (msg) UI.toast(msg);
  } finally {
    G.cut--;
  }
}

// ---------- la messa della domenica ----------
const SERMONS = [
  [
    '«Il giallo ci tiene insieme. Chi è dentro il recinto è al sicuro. Chi esce… non lo diciamo.»',
    "«Alla campana, a casa. Non è una regola: è un'abitudine di famiglia.»"
  ],
  [
    '«La terra dà quello che prende. Non chiedete cosa prende.»',
    '«Siamo pochi, ma bastiamo. Sette posti, più uno. È sempre stato così.»'
  ],
  [
    '«Il rosso è un colore stanco. Lo seppelliamo perché si riposi.»',
    '«Chi arriva da fuori porta un odore. Il nostro compito è renderlo familiare.»'
  ],
  [
    '«Ricordate i nomi dei vostri morti. Ricordateli finché potete.»',
    '«Ogni autunno, qualcuno resta in cappella più a lungo degli altri.»'
  ]
];
async function attendMass() {
  const st = G.st;
  st.flags['mass' + st.day] = 1;
  G.cut++;
  try {
    if (st.time < 9 * 60) await passTime(9 * 60 - st.time);
    const S = SERMONS[st.day % SERMONS.length];
    await narr(
      "Ti siedi in una panca. Fratello Lucius sale all'altare. Tutti abbassano la testa nello stesso momento, come un solo corpo."
    );
    for (const l of S) await say('lucius', l, H2(st) ? 'dark' : '');
    if (H2(st)) {
      AU.play('count');
      await narr(
        'Mentre parla, le sue labbra contano sottovoce. Il numero che esce dalla sua bocca non coincide con i volti nella cappella.',
        { dark: 1 }
      );
      addQuiete(-4);
    } else addQuiete(5);
    await passTime(Math.max(5, 10 * 60 + 30 - st.time), 'La messa è finita.');
    for (const id of ['ezekiel', 'agatha', 'lucius', 'clara', 'brom']) addFriend(id, 1);
    UI.toast('Hai partecipato alla messa. Il villaggio lo nota.');
  } finally {
    G.cut--;
  }
}

// ---------- cucina e cibo ----------
const RECIPES = [
  { id: 'zuppa', need: { rapa: 2 }, min: 30 },
  { id: 'arrosto', need: { patata: 2 }, min: 40 },
  { id: 'torta', need: { zucca: 1, rapa: 1 }, min: 60 }
];
const needTxt = r =>
  Object.entries(r.need)
    .map(([k, v]) => `${v} ${ITEMS[k].n.toLowerCase()}`)
    .join(' + ');
const canCook = r => Object.entries(r.need).every(([k, v]) => countItem(k) >= v);
async function cookMenu() {
  const st = G.st;
  if (isFree(st) && st.time < 22 * 60) return cookModal();
  if (st.time >= 22 * 60)
    return narr('È troppo tardi per accendere la pentola. Il fuoco ti basta per scaldare le mani.');
  const c = await ask(
    null,
    G.horror > 0.5
      ? 'Il fuoco crepita. La pentola borbotta da sola. Cosa prepari?'
      : 'Il camino del nonno, con la sua pentola annerita. Cosa prepari?',
    [...RECIPES.map(r => `${ITEMS[r.id].n} (${needTxt(r)})${canCook(r) ? '' : ' ✗'}`), 'Niente']
  );
  const r = RECIPES[c];
  if (!r) return;
  if (!canCook(r)) return narr('Non hai gli ingredienti: serve ' + needTxt(r) + '.');
  for (const [k, v] of Object.entries(r.need)) removeItem(k, v);
  AU.play('hoe');
  await passTime(r.min);
  AU.play('ok');
  st.flags.cooked = (st.flags.cooked || 0) + 1;
  giveItem(r.id);
  addQuiete(2);
  if (!st.flags.cookTip) {
    st.flags.cookTip = 1;
    await narr(
      'Il piatto riempie la stanza di odore buono. Usalo dalla barra per mangiarlo e riprendere energia: o regalalo, agli abitanti piacerà molto di più di un raccolto crudo.'
    );
  }
}
function useKey() {
  const it = selItem(),
    d = it && ITEMS[it.id];
  if (!d || !d.use) return false;
  UI.toast(d.use);
  return true;
}
function eatSel() {
  const it = selItem();
  if (!it || ITEMS[it.id].t !== 'food') return false;
  const st = G.st,
    d = ITEMS[it.id],
    p = G.player;
  if (st.energy >= 96) {
    UI.toast('Non hai fame.');
    return true;
  }
  removeItem(it.id, 1);
  st.energy = Math.min(100, st.energy + d.e);
  AU.play('ok');
  floatText('+' + d.e + ' energia', p.x, p.y - 32, '#9be08a', 1.8);
  UI.toast('Mangi: ' + d.n + '.');
  UI.hud();
  return true;
}

// ---------- favori degli abitanti ----------
const FAV_NPC = ['ezekiel', 'agatha', 'lucius', 'clara', 'brom'];
const PL = {
  rapa: 'rape',
  patata: 'patate',
  zucca: 'zucche',
  fagioli: 'manciate di fagioli',
  cavolo: 'cavoli neri',
  pane: 'pani di Clara',
  zuppa: 'zuppe di rape',
  arrosto: 'porzioni di patate arrosto',
  torta: 'torte di zucca'
};
const SG = {
  rapa: 'una rapa',
  patata: 'una patata',
  zucca: 'una zucca',
  fagioli: 'una manciata di fagioli',
  cavolo: 'un cavolo nero',
  pane: 'un pane di Clara',
  zuppa: 'una zuppa di rape',
  arrosto: 'una porzione di patate arrosto',
  torta: 'una torta di zucca'
};
const fmtItems = (id, n) =>
  n === 1 ? SG[id] || ITEMS[id].n.toLowerCase() : n + ' ' + (PL[id] || ITEMS[id].n.toLowerCase());
const FAV_VAL = {
  rapa: 45,
  patata: 80,
  zucca: 170,
  fagioli: 32,
  cavolo: 210,
  pane: 35,
  zuppa: 95,
  arrosto: 140,
  torta: 260
};
const FAV_ASK = {
  ezekiel: [
    'Per il Conteggio alla Festa mi servono {it}. Portamele, {n}. Ti ricompenserò: {r} scudi.',
    'La mensa del Raccolto ha bisogno di {it}. Puoi provvedere? Ricompensa: {r} scudi.'
  ],
  agatha: [
    'Tesoro, per le tavolate mi mancano {it}. Ci pensi tu? Ti do {r} scudi.',
    'Mi servono {it}, ma di quelle buone! Pago {r} scudi.'
  ],
  lucius: [
    "Per le offerte all'altare servono {it}. Sono per i… per i presenti. Ricompensa: {r} scudi.",
    'Potresti portarmi {it}? Il digiuno è stato lungo. Ti darò {r} scudi.'
  ],
  clara: [
    'Mi aiuti? Mi servono {it} per il pane della Festa! Ti do {r} scudi.',
    'Se hai {it}, ti ripago: {r} scudi. Promesso!'
  ],
  brom: [
    'Mh. {it}. Il fuoco è acceso da ieri, non ho tempo. {r} scudi.',
    'Portami {it}. Non chiedere. {r} scudi.'
  ]
};
const FAV_THX = {
  ezekiel: ['Il villaggio ricorda chi contribuisce, {n}.', 'Bene. Molto bene. Sei dei nostri. Quasi.'],
  agatha: [
    'Che tesoro! Ecco il compenso, e un bacio sulla fronte.',
    'Perfetto, perfetto! Per la Festa ci voleva proprio.'
  ],
  lucius: ["Grazie. L'altare ringrazia. Anch'io, un poco.", 'Pregherò per te. Ho già iniziato.'],
  clara: [
    'Grazie mille! Sei {il mio preferito|la mia preferita}. Non dirlo a Tobia!',
    "Ce l'hai fatta! Sapevo di poter contare su di te."
  ],
  brom: ['Mh. Buono.', '…Grazie. Davvero.']
};
function genFavors() {
  const st = G.st,
    F = st.flags;
  st.favors = (st.favors || []).filter(f => !f.done && f.until >= st.day);
  if (st.day < 3) return;
  const maxN = st.day >= 5 ? 3 : 2;
  for (let tries = 0; tries < 5 && st.favors.length < maxN; tries++) {
    const cand = FAV_NPC.filter(id => F.met[id] && !st.favors.some(f => f.id === id));
    if (!cand.length) break;
    const id = cand[Math.floor(Math.random() * cand.length)];
    let pool = ['rapa'];
    if (isFree(st)) {
      const s = seasonOf(st);
      pool = [
        ...Object.keys(CROPS).filter(c => cropInSeason(c, s)),
        ...(WILD[s] || []),
        ...COOK.filter(r => knows(st, r.id))
          .map(r => r.id)
          .slice(0, 6)
      ];
    } else if (st.day >= 4) pool.push('patata', 'zucca');
    if (st.day >= 5) pool.push('cavolo', 'fagioli');
    if (F.cooked) pool.push('zuppa', 'arrosto', 'torta');
    if (id !== 'clara') pool.push('pane');
    const lk = LIKES[id] || {},
      w = [];
    pool.forEach(k => {
      for (let j = 0; j < (lk[k] >= 2 ? 3 : 1); j++) w.push(k);
    });
    if (st.day >= 6 && !isFree(st)) w.push('zucca', 'zucca', 'zucca');
    const item = w[Math.floor(Math.random() * w.length)],
      q = ITEMS[item].t === 'crop' ? 1 + (st.day >= 5 ? 1 : 0) + (Math.random() < 0.4 ? 1 : 0) : 1;
    st.favors.push({
      id,
      item,
      n: q,
      reward: Math.round(((FAV_VAL[item] || ITEMS[item].v || ITEMS[item].e || 50) * q * 1.2) / 5) * 5,
      until: st.day + 2,
      told: 0,
      done: 0
    });
  }
}
const favorOf = id => (G.st.favors || []).find(f => f.id === id && !f.done);
async function favorDeliver(n) {
  const st = G.st,
    f = favorOf(n.id);
  if (!f || !st.flags.met[n.id] || countItem(f.item) < f.n) return false;
  const c = await ask(null, `Consegni ${fmtItems(f.item, f.n)} a ${n.name}? (+${SC(f.reward)})`, [
    'Consegna',
    'Dopo'
  ]);
  if (c !== 0) return false;
  removeItem(f.item, f.n);
  f.done = 1;
  f.told = 1;
  st.money += f.reward;
  st.flags.favorsDone = (st.flags.favorsDone || 0) + 1;
  addFriend(n.id, 2 + (((LIKES[n.id] || {})[f.item] || 0) >= 2 ? 1 : 0));
  addQuiete(2);
  AU.play('coin');
  UI.hud();
  floatText('♥', n.x, n.y - 30, '#ff7a6a');
  const L = FAV_THX[n.id];
  await say(n.id, L[Math.floor(Math.random() * L.length)]);
  UI.toast(`Favore completato: +${SC(f.reward)}`);
  UI.quest();
  return true;
}
async function favorTell(n) {
  const st = G.st,
    f = favorOf(n.id);
  if (!f || f.told || !st.flags.met[n.id]) return;
  f.told = 1;
  const L = (isFree(st) && FAV_ASK_FREE[n.id]) || FAV_ASK[n.id];
  await say(
    n.id,
    L[Math.floor(Math.random() * L.length)].replace('{it}', fmtItems(f.item, f.n)).replace('{r}', f.reward)
  );
  UI.toast(`Favore: ${NAMES[n.id]} vorrebbe ${fmtItems(f.item, f.n)}.`);
  UI.quest();
}
function favorMark(n) {
  const st = G.st;
  if (!st.favors || G.mode !== 'game') return;
  const f = favorOf(n.id);
  if (!f) return;
  const ok = countItem(f.item) >= f.n;
  if (f.told && !ok) return;
  const X = Math.round(n.x),
    Y = Math.round(n.y - 34 + Math.sin(G.t * 4) * 1.5),
    ch = ok ? '✓' : '!';
  ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2b1a10';
  ctx.fillText(ch, X + 1, Y + 1);
  ctx.fillStyle = ok ? '#9be08a' : '#f6d98a';
  ctx.fillText(ch, X, Y);
}

// ---------- fucina: attrezzi migliorati ----------
const UPG = {
  hoe: { n: "Zappa d'acciaio", cost: 180, d: 'dissodare costa 1 energia invece di 2' },
  can: { n: 'Annaffiatoio largo', cost: 220, d: 'bagna tre zolle per volta' }
};
function applyUpgrades() {
  const u = (G.st && G.st.up) || {};
  ITEMS.hoe.n = u.hoe ? UPG.hoe.n : 'Zappa';
  ITEMS.hoe.d = u.hoe
    ? 'Acciaio di Brom. Dissoda con meno fatica.'
    : 'Dissoda la terra. Seppellisce ciò che va seppellito.';
  ITEMS.can.n = u.can ? UPG.can.n : 'Annaffiatoio';
  ITEMS.can.d = u.can
    ? 'Rosa larga di Brom: bagna tre zolle per volta.'
    : 'Acqua per le piantine. Non finisce mai. Strano.';
}
async function forgeMenu() {
  const st = G.st,
    o = st.forge;
  if (o && st.day >= o.ready) {
    st.forge = null;
    st.up[o.k] = 1;
    applyUpgrades();
    AU.play('ok');
    addFriend('brom', 2);
    UI.toast('Brom ha finito: ' + UPG[o.k].n + '.');
    return say('brom', `Pronto. ${UPG[o.k].n}. …Non è stato niente.`);
  }
  if (o)
    return say(
      'brom',
      `${UPG[o.k].n}: pronto ${o.ready - st.day === 1 ? 'domani' : 'dopodomani'}. Non chiedere prima.`
    );
  const av = Object.keys(UPG).filter(k => !st.up[k]);
  if (!av.length) return say('brom', 'Non ho altro da migliorare. Il resto è già buono.');
  const c = await ask('brom', 'Mh. Cosa?', [
    ...av.map(k => `${UPG[k].n} — ${SC(UPG[k].cost)} (${UPG[k].d})`),
    'Niente'
  ]);
  const k = av[c];
  if (!k) return;
  if (st.money < UPG[k].cost) return say('brom', 'Non basta. Torna con i soldi.');
  st.money -= UPG[k].cost;
  st.forge = { k, ready: st.day + 2 };
  AU.play('coin');
  UI.hud();
  return say('brom', 'Due giorni. Tieni pure lo strumento, ci penso io.');
}
function waterWide(tx, ty) {
  const st = G.st;
  if (!((st.up && st.up.can) || (isFree(st) && skLv('agri') >= 6))) return;
  const [dx] = DIRV[G.player.dir],
    side =
      dx !== 0
        ? [
            [0, -1],
            [0, 1]
          ]
        : [
            [-1, 0],
            [1, 0]
          ];
  for (const [a, b] of side) {
    const g = st.farm[tx + a + ',' + (ty + b)];
    if (g && !g.w) {
      g.w = true;
      burst('water', (tx + a) * 16 + 8, (ty + b) * 16 + 4, 6);
      if (g.c) st.flags.watered = (st.flags.watered || 0) + 1;
    }
  }
}

// ---------- la Valle si prepara alla Festa ----------
const FEST_PUMP = [
  [39, 17],
  [50, 17],
  [41, 24],
  [47, 24],
  [36, 18],
  [36, 22],
  [53, 22],
  [53, 24],
  [42, 13]
];
const FEAST = [
  [44, 17],
  [40, 21]
];
const FEST_MORNING = {
  4: 'In piazza qualcuno ha ammucchiato zucche per la Festa.',
  5: 'Brom e Clara lavorano ai preparativi. Tra i lampioni, spuntano i festoni gialli.',
  6: 'Nella notte hanno montato le tavolate della Festa, in piazza.',
  7: 'La Valle è pronta per la Festa. Troppo pronta.'
};
function drawShoe(X, Y) {
  ctx.fillStyle = '#1e1d22';
  ctx.fillRect(X - 1, Y, 1, 5);
  ctx.fillRect(X + 5, Y, 1, 5);
  ctx.fillRect(X, Y + 5, 5, 1);
  ctx.fillRect(X - 1, Y - 1, 2, 1);
  ctx.fillRect(X + 4, Y - 1, 2, 1);
  ctx.fillStyle = '#b9b9c4';
  ctx.fillRect(X, Y, 1, 4);
  ctx.fillRect(X + 4, Y, 1, 4);
  ctx.fillRect(X + 1, Y + 4, 3, 1);
}
function drawWorldExtrasBase(m) {
  if (m.id === 'wood') return drawWoodExtras(m);
  if (m.id !== 'main') return;
  const st = G.st,
    cx = G.cam.x,
    cy = G.cam.y;
  // Brom forgia quattro ferri di cavallo ogni anno: uno al giorno, appesi sul muro della fucina
  {
    const b = BLD.forge,
      n = st.free ? 0 : clamp(st.day - 1, 0, 4);
    for (let i = 0; i < n; i++) drawShoe(b.x * 16 + 14 + i * 14, (b.y + b.h) * 16 - 28);
  }
  // festoni fra i lampioni della piazza
  if ((st.day >= 5 || st.chapter >= 4) && !st.free) {
    const cols = H2(st) ? ['#c9a84a', '#9a7e34', '#d9ccaa'] : ['#e8c23a', '#d98a1e', '#f0e2b0'];
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0]
    ]) {
      const x0 = LAMPS[a][0] * 16 + 8,
        y0 = LAMPS[a][1] * 16 - 14,
        x1 = LAMPS[b][0] * 16 + 8,
        y1 = LAMPS[b][1] * 16 - 14;
      if (
        Math.max(x0, x1) < cx - 10 ||
        Math.min(x0, x1) > cx + W + 10 ||
        Math.max(y0, y1) < cy - 20 ||
        Math.min(y0, y1) > cy + H + 20
      )
        continue;
      const len = Math.hypot(x1 - x0, y1 - y0),
        vert = Math.abs(x1 - x0) < Math.abs(y1 - y0),
        sag = len > 150 ? 9 : 6,
        sg = x0 < 45 * 16 ? 1 : -1,
        N = Math.floor(len / 2);
      const pt = s => {
        const k = Math.sin(Math.PI * s) * sag;
        return vert
          ? [x0 + (x1 - x0) * s + k * sg, y0 + (y1 - y0) * s]
          : [x0 + (x1 - x0) * s, y0 + (y1 - y0) * s + k];
      };
      ctx.fillStyle = 'rgba(50,34,16,.85)';
      for (let i = 0; i <= N; i++) {
        const [X, Y] = pt(i / N);
        ctx.fillRect(Math.round(X), Math.round(Y), 1, 1);
      }
      const FN = Math.floor(len / 9);
      for (let i = 1; i < FN; i++) {
        const [X0, Y0] = pt(i / FN),
          X = Math.round(X0),
          Y = Math.round(Y0 + Math.sin(G.t * 2.2 + i * 0.9) * 0.5);
        ctx.fillStyle = cols[i % 3];
        ctx.fillRect(X - 2, Y + 1, 5, 2);
        ctx.fillRect(X - 1, Y + 3, 3, 1);
        ctx.fillRect(X, Y + 4, 1, 1);
      }
    }
  }
}
// punto di estensione: gli altri file si iscrivono con Ext.on('drawWorldExtras…') invece di sovrascriverla
function drawWorldExtras(m) {
  const v = drawWorldExtrasBase(m);
  Ext.run('drawWorldExtras', m);
  return v;
}
