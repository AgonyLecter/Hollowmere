'use strict';
// ================= LA COLONNA SONORA =================
// Tutta sintetizzata (Web Audio) e scritta come dati: ogni brano ha una tonalità, un tempo, due temi (melodia in
// gradi della scala, accordi in numeri romani), una forma e i suoi strumenti. main.js (chooseMusic) sceglie il
// brano dalla situazione; core.js (AU.tick) chiama Musica.tick a ogni fotogramma.
//
// La regola della Valle: anche il brano più allegro ha qualcosa che non torna. È l'«ombra» di ogni brano: una
// campana lontana, una nota che stona, un respiro, un carillon che conta fino a otto (e a volte a nove).
// Con l'orrore (G.horror) l'ombra cresce, il tempo rallenta e le note scivolano di un semitono.
//
// Come si scrive un tema (un passo = un ottavo; «passi» per battuta, di solito 8):
//   5   grado della scala      5'  un'ottava sopra     5,  un'ottava sotto     b6 #4  alterato di un semitono
//   -   la nota prima continua  .   pausa
// Accordi, uno per battuta (o due, divisi da «/»): numeri romani relativi alla scala del brano.
//   maiuscolo = maggiore, minuscolo = minore, ° diminuito; suffissi 7, M7, 9, sus2, sus4.
// Forma: A, B = i temi; A~ = variato da un altro strumento; A_ = un'ottava sotto, piano; · = respiro (solo accordi).

const SCALA = {
  ionio: [0, 2, 4, 5, 7, 9, 11],
  dorico: [0, 2, 3, 5, 7, 9, 10],
  eolio: [0, 2, 3, 5, 7, 8, 10],
  misolidio: [0, 2, 4, 5, 7, 9, 10],
  lidio: [0, 2, 4, 6, 7, 9, 11],
  frigio: [0, 1, 3, 5, 7, 8, 10],
  armonica: [0, 2, 3, 5, 7, 8, 11]
};

const BRANI = {
  // il titolo: una ninna nanna da carillon, in tre, che non finisce mai di consolare
  titolo: {
    n: 'Ninna nanna di Hollowmere',
    root: 62,
    scala: 'eolio',
    bpm: 66,
    passi: 6,
    temi: {
      A: { m: "5 - 3 - 1 -  2 - 3 4 3 -  5 - 1' - 7 -  6 - - - 5 .", a: ['i', 'iv', 'i', 'VI'] },
      B: { m: "3' - 2' - 1' -  7 - 6 - 5 -  4 - 3 - 2 -  #7, - - - . .", a: ['III', 'VII', 'iv', 'V'] }
    },
    forma: ['A', 'A~', 'B', 'A', '·', 'B~', 'A_', '·'],
    mel: 'carillon',
    alt: 'celesta',
    pad: { s: 'archi', v: 0.5 },
    basso: { s: 'basso', p: 'R . . . . .', v: 0.6 },
    ombra: 0.5,
    rev: 0.7
  },
  // l'autunno: chitarra, celesta e violoncello. Il dorico è malinconico anche quando sorride
  autunno: {
    n: 'Foglie sul recinto',
    root: 50,
    scala: 'dorico',
    bpm: 84,
    passi: 8,
    temi: {
      A: {
        m: "1' . 7 6 5 - 3 -  4 - 5 6 5 - - .  3 . 4 5 6 - 5 4  3 - 2 - 1 - - .",
        a: ['i', 'IV', 'i', 'VII/i']
      },
      B: {
        m: "5 - 6 - 7 - 1' -  2' - 1' 7 6 - - .  5 . 6 5 4 - 3 -  2 - - 1 1, - - .",
        a: ['III', 'VII', 'IV', 'v/i']
      }
    },
    forma: ['A', 'B', 'A~', '·', 'B~', 'A', '·', 'A_'],
    mel: 'celesta',
    alt: 'flauto',
    arp: { s: 'pizzico', p: '0 2 3 2 1 2 3 2', v: 0.5 },
    basso: { s: 'basso', p: 'R . . . 5 . . .', v: 0.8 },
    pad: { s: 'archi', v: 0.45 },
    ombra: 0.35,
    rev: 0.5
  },
  // l'inverno: lento, a vuoto, il carillon e un violino che non ha nessuno a cui suonare
  inverno: {
    n: 'Neve sui pali gialli',
    root: 57,
    scala: 'eolio',
    bpm: 62,
    passi: 8,
    temi: {
      A: {
        m: '5 - - 4 3 - - .  2 - 3 - 1 - - .  5 - - 6 5 - 3 -  2 - - - - - . .',
        a: ['i', 'VI', 'iv', 'V']
      },
      B: {
        m: "1' - 7 - 6 - 5 -  6 - - 5 4 - - .  3 - 4 - 5 - 1 -  #7, - - - 1 - - .",
        a: ['VI', 'iv', 'i', 'V/i']
      }
    },
    forma: ['A', '·', 'B~', 'A', '·', 'A~', 'B', '·'],
    mel: 'carillon',
    alt: 'violino',
    arp: { s: 'arpa', p: '0 . . 2 . 3 . .', v: 0.45 },
    basso: { s: 'basso', p: 'R . . . . . . .', v: 0.6 },
    pad: { s: 'archi', v: 0.55 },
    coro: 0.25,
    ombra: 0.55,
    rev: 0.8
  },
  // la primavera: il flauto, il lidio che apre le finestre… e il quarto grado minore che le richiude
  primavera: {
    n: 'Seme sotto la neve',
    root: 53,
    scala: 'ionio',
    bpm: 96,
    passi: 8,
    temi: {
      A: {
        m: "3 - 5 - 1' - 7 6  5 - - . 3 4 5 -  6 - 5 - #4 - 5 -  3 - - - 2 - - .",
        a: ['I', 'vi7', 'II', 'V']
      },
      B: {
        m: '6 - 5 - 4 - 3 -  4 - 5 - 6 - - .  b6 - 5 - 4 - 3 -  2 - - - 1 - - .',
        a: ['vi', 'IV', 'iv', 'V/I']
      }
    },
    forma: ['A', 'A~', 'B', '·', 'A', 'B~', '·', 'A_'],
    mel: 'flauto',
    alt: 'celesta',
    arp: { s: 'pizzico', p: '0 1 2 3 2 1 2 1', v: 0.4 },
    basso: { s: 'basso', p: 'R . . 5 . . R .', v: 0.7 },
    pad: { s: 'archi', v: 0.35 },
    perc: { legno: '. . x . . . x .' },
    ombra: 0.3,
    rev: 0.45
  },
  // l'estate: pigra, swing, mandolino e fisarmonica. Il quinto grado minore è il sole che cala
  estate: {
    n: 'Polvere e cicale',
    root: 55,
    scala: 'misolidio',
    bpm: 92,
    passi: 8,
    swing: 0.18,
    temi: {
      A: {
        m: '5 . 5 6 5 - 3 -  4 - 3 - 2 - - .  1 . 1 2 3 - 5 -  7 - - 6 5 - - .',
        a: ['I', 'IV', 'I', 'VII']
      },
      B: {
        m: "3' - 2' - 1' - 7 -  6 - 5 - 4 - - .  3 - 4 - 5 - 6 -  5 - - - - - . .",
        a: ['v', 'ii', 'IV', 'I']
      }
    },
    forma: ['A', 'B', '·', 'A~', 'B~', 'A', '·', 'A_'],
    mel: 'fisarmonica',
    alt: 'flauto',
    arp: { s: 'pizzico', p: '0 . 2 1 . 2 3 .', v: 0.45 },
    basso: { s: 'basso', p: 'R . . . 5 . 8 .', v: 0.75 },
    pad: { s: 'archi', v: 0.25 },
    perc: { shaker: '. x . x . x . x' },
    ombra: 0.35,
    rev: 0.4
  },
  // il tramonto: l'ora del Vespro. Organo lontano, il violino, le campane
  vespro: {
    n: 'Vespro',
    root: 52,
    scala: 'eolio',
    bpm: 68,
    passi: 8,
    temi: {
      A: {
        m: '5 - - 6 5 - 4 -  3 - - 2 1 - - .  6 - - 5 4 - 3 -  2 - - - #7, - - .',
        a: ['i', 'VI', 'iv', 'V']
      },
      B: {
        m: "3 - 4 - 5 - 1' -  7 - 6 - 5 - - .  4 - 3 - 2 - 6, -  #7, - - - 1 - - .",
        a: ['III', 'VII', 'iv', 'V/i']
      }
    },
    forma: ['A', '·', 'B', 'A~', '·', 'B~'],
    mel: 'violino',
    alt: 'organo',
    arp: { s: 'arpa', p: '0 . 2 . 3 . 2 .', v: 0.35 },
    basso: { s: 'basso', p: 'R . . . . . . .', v: 0.6 },
    pad: { s: 'organo', v: 0.25 },
    ombra: 0.5,
    rev: 0.7,
    campane: 1
  },
  // la notte: il carillon da lontano, il coro senza bocca, e qualcuno che conta
  notte: {
    n: 'Alla campana delle nove',
    root: 57,
    scala: 'eolio',
    bpm: 58,
    passi: 8,
    temi: {
      A: {
        m: '5 . . 6 5 . . .  3 . . . 2 . 1 .  6, . . . 7, . 1 .  2 . . . . . . .',
        a: ['i', 'VI', 'iv', 'V']
      },
      B: {
        m: "1' . . . 7 . 6 .  5 . . . 4 . . .  3 . 4 . 5 . 3 .  #7, . . . . . . .",
        a: ['VI', 'iv', 'i', 'V']
      }
    },
    forma: ['A', '·', 'B', '·', 'A~', '·'],
    mel: 'carillon',
    alt: 'violino',
    basso: { s: 'basso', p: 'R . . . . . . .', v: 0.5 },
    pad: { s: 'archi', v: 0.6 },
    coro: 0.4,
    ombra: 0.75,
    rev: 0.9,
    notte: 1
  },
  // la pioggia: pianoforte di celesta, poche note, il violoncello sotto
  pioggia: {
    n: 'Gocce sul tetto del nonno',
    root: 48,
    scala: 'dorico',
    bpm: 72,
    passi: 8,
    temi: {
      A: {
        m: '3 - 2 - 1 - 5, -  6, - - 7, 1 - - .  3 - 4 - 5 - 3 -  2 - - - - - . .',
        a: ['i', 'IV', 'i', 'v']
      },
      B: {
        m: '5 - 6 - 7 - 5 -  4 - - 3 2 - - .  3 - 2 - 1 - 7, -  1 - - - - - . .',
        a: ['v', 'VII', 'i', 'i']
      }
    },
    forma: ['A', '·', 'B', 'A_', '·', 'B~'],
    mel: 'celesta',
    alt: 'violino',
    arp: { s: 'arpa', p: '0 . 1 . 2 . 3 .', v: 0.35 },
    basso: { s: 'basso', p: 'R . . . . . 5 .', v: 0.6 },
    pad: { s: 'archi', v: 0.5 },
    ombra: 0.45,
    rev: 0.75
  },
  // la cappella: corale d'organo e voci
  cappella: {
    n: 'Corale dei Contati',
    root: 50,
    scala: 'eolio',
    bpm: 52,
    passi: 8,
    temi: {
      A: {
        m: "1' - - - 7 - - -  6 - - - 5 - - -  4 - - - 3 - - -  #7, - - - - - - -",
        a: ['i', 'VI', 'iv', 'V']
      },
      B: {
        m: '3 - - - 4 - - -  5 - - - 6 - 5 -  4 - - - 3 - 2 -  1 - - - - - - -',
        a: ['III', 'VI', 'iv/V', 'i']
      }
    },
    forma: ['A', 'B', '·', 'A~', 'B'],
    mel: 'organo',
    alt: 'coro',
    basso: { s: 'organo', p: 'R . . . . . . .', v: 0.5 },
    pad: { s: 'organo', v: 0.35 },
    coro: 0.5,
    ombra: 0.6,
    rev: 0.95
  },
  // la Festa della Valle: una tarantella in minore. Si balla, ma con un occhio al bosco
  festa: {
    n: 'Tarantella del Raccolto',
    root: 57,
    scala: 'eolio',
    bpm: 140,
    passi: 6,
    temi: {
      A: { m: '5 . 5 6 5 4  3 . 3 4 3 2  1 2 3 4 5 6  #7, . #7, 1 . .', a: ['i', 'VII', 'iv', 'V/i'] },
      B: { m: "1' . 1' 7 6 5  6 . 6 5 4 3  4 . 4 3 2 1  2 . #7, 1 . .", a: ['VI', 'iv', 'VII', 'V/i'] }
    },
    forma: ['A', 'A', 'B', 'B~', 'A~', '·', 'B', 'A'],
    mel: 'fisarmonica',
    alt: 'flauto',
    arp: { s: 'pizzico', p: '0 . 2 3 . 2', v: 0.4 },
    basso: { s: 'basso', p: 'R . . 5 . .', v: 0.8 },
    perc: { cassa: 'x . . x . .', tamb: '. x x . x x' },
    ombra: 0.4,
    rev: 0.35
  },
  // l'inseguimento: archi a scatti, cuore, ottoni. Niente melodia: solo correre
  inseguimento: {
    n: 'Zoccoli',
    root: 45,
    scala: 'frigio',
    bpm: 152,
    passi: 8,
    temi: {
      A: {
        m: '. . . . . . . .  . . . . . . . .  . . . . . . . .  . . . . . . . .',
        a: ['i', 'i', 'II', 'i']
      },
      B: {
        m: '. . . . . . . .  . . . . . . . .  . . . . . . . .  . . . . . . . .',
        a: ['iv', 'i', 'II', 'V']
      }
    },
    forma: ['A', 'B'],
    ostinato: { s: 'stacc', p: [0, 1, 0, 1, 0, 1, 0, 7] },
    basso: { s: 'basso', p: 'R . R . R . R R', v: 0.9 },
    perc: { cassa: 'x . . . x . . .', battito: '. . x . . . x .', tamb: '. x . x . x . x' },
    ottoni: 1,
    ombra: 0,
    rev: 0.3
  },
  // miniera, bosco e fienile non hanno temi: sono suoni che si generano passo per passo (vedi MUS_GEN)
  miniera: {
    n: 'La miniera senza fondo',
    root: 38,
    scala: 'frigio',
    bpm: 60,
    passi: 8,
    gen: 'miniera',
    rev: 0.9,
    vol: 2.2
  },
  bosco: {
    n: 'Oltre il Varco',
    root: 45,
    scala: 'frigio',
    bpm: 50,
    passi: 8,
    gen: 'bosco',
    rev: 1,
    vol: 2.2
  },
  fienile: {
    n: 'Il fienile rosso',
    root: 40,
    scala: 'frigio',
    bpm: 50,
    passi: 8,
    gen: 'fienile',
    rev: 0.8,
    vol: 2.6
  }
};
// la storia alla Festa del Raccolto: la tarantella, che rallenta e stona man mano che si avvicina la mezzanotte
BRANI.raccolto = Object.assign({}, BRANI.festa, { n: 'Il Raccolto', inquieto: 1, ombra: 0.55 });

// ---------- lettura dei temi e degli accordi ----------
const ROMANI = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
function musLeggiTema(br, src) {
  const tok = src.trim().split(/\s+/),
    S = SCALA[br.scala],
    ev = new Array(tok.length).fill(null);
  for (let i = 0; i < tok.length; i++) {
    const m = /^([#b]?)([1-7])([',]*)$/.exec(tok[i]);
    if (!m) continue;
    let len = 1;
    while (tok[i + len] === '-') len++;
    const d = +m[2] - 1,
      ott = (m[3].match(/'/g) || []).length - (m[3].match(/,/g) || []).length;
    ev[i] = { m: br.root + 12 + S[d] + (m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0) + 12 * ott, len };
  }
  return ev;
}
function musLeggiAccordo(br, s) {
  const m = /^([#b]?)([ivIV]+)(°?)(M7|7|9|sus2|sus4)?$/.exec(s);
  if (!m) return null;
  const S = SCALA[br.scala],
    g = ROMANI[m[2].toLowerCase()] - 1,
    magg = m[2] !== m[2].toLowerCase(),
    r = br.root + S[g] + (m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0);
  let iv = m[3] ? [0, 3, 6] : magg ? [0, 4, 7] : [0, 3, 7];
  if (m[4] === 'sus2') iv = [0, 2, 7];
  if (m[4] === 'sus4') iv = [0, 5, 7];
  if (m[4] === '7') iv = iv.concat(10);
  if (m[4] === 'M7') iv = iv.concat(11);
  if (m[4] === '9') iv = iv.concat(10, 14);
  return { r, iv };
}
for (const k in BRANI) {
  const br = BRANI[k];
  if (!br.temi) continue;
  for (const t of Object.values(br.temi)) {
    t.ev = musLeggiTema(br, t.m);
    t.acc = t.a.map(b => b.split('/').map(x => musLeggiAccordo(br, x)));
  }
}

// ---------- gli strumenti ----------
// ognuno riceve (M, t, nota midi, durata in secondi, volume, opzioni) e suona nel bus del brano
const STRUMENTI = {
  carillon(M, t, m, d, v) {
    const f = M.f(m);
    M.o('sine', f, t, 0.002, 2.2, v, 1);
    M.o('sine', f * 2, t, 0.002, 0.45, v * 0.22, 1);
    M.o('sine', f * 5.4, t, 0.001, 0.07, v * 0.1, 0);
  },
  celesta(M, t, m, d, v) {
    const f = M.f(m);
    M.o('sine', f, t, 0.003, 1.4, v, 1);
    M.o('triangle', f * 2, t, 0.002, 0.35, v * 0.2, 0);
  },
  pizzico(M, t, m, d, v) {
    const c = AU.c,
      f = M.f(m),
      o = c.createOscillator(),
      fl = c.createBiquadFilter(),
      g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.value = f;
    fl.type = 'lowpass';
    fl.frequency.setValueAtTime(Math.min(9000, f * 7), t);
    fl.frequency.exponentialRampToValueAtTime(f * 1.3, t + 0.28);
    AU.env(g, t, 0.003, v * 0.5, 1.1);
    o.connect(fl);
    fl.connect(g);
    M.esci(g, 0.4);
    o.start(t);
    o.stop(t + 1.2);
    M.o('sine', f, t, 0.003, 0.7, v * 0.35, 0);
  },
  arpa(M, t, m, d, v) {
    const f = M.f(m);
    M.o('triangle', f, t, 0.004, 2.4, v * 0.7, 1);
    M.o('sine', f * 2, t, 0.003, 0.6, v * 0.15, 1);
  },
  flauto(M, t, m, d, v) {
    const f = M.f(m);
    M.s('sine', f, t, Math.max(0.12, d), v * 0.15, { a: 0.07, r: 0.22, vib: 0.006, rev: 1 });
    M.s('triangle', f, t, Math.max(0.12, d), v * 0.03, { a: 0.07, r: 0.2 });
    AU.noise(t, 0.12, v * 0.05, 'bandpass', f * 2, 3, M.B.g, 0.02);
  },
  violino(M, t, m, d, v) {
    const f = M.f(m),
      o = { a: 0.22, r: 0.5, vib: 0.009, rev: 1, lp: 1600 + f };
    M.s('sawtooth', f, t, Math.max(0.3, d), v * 0.32, o);
    M.s('sawtooth', f * 1.004, t, Math.max(0.3, d), v * 0.22, o);
  },
  fisarmonica(M, t, m, d, v) {
    const f = M.f(m),
      o = { a: 0.025, r: 0.08, lp: 2200, trem: 1 };
    M.s('square', f, t, Math.max(0.1, d * 0.92), v * 0.16, o);
    M.s('square', f * 1.0035, t, Math.max(0.1, d * 0.92), v * 0.14, o);
    M.s('sawtooth', f * 2, t, Math.max(0.1, d * 0.92), v * 0.06, o);
  },
  organo(M, t, m, d, v) {
    const f = M.f(m);
    [
      [1, 0.15],
      [2, 0.09],
      [3, 0.042],
      [4, 0.027]
    ].forEach(([k, w]) => M.s('sine', f * k, t, Math.max(0.2, d), v * w, { a: 0.07, r: 0.3, rev: 1 }));
  },
  coro(M, t, m, d, v) {
    const c = AU.c,
      f = M.f(m);
    for (const det of [1, 1.006]) {
      const o = c.createOscillator(),
        g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.value = f * det;
      o.detune.value = M.storto(t);
      for (const fr of [700, 1150]) {
        const b = c.createBiquadFilter();
        b.type = 'bandpass';
        b.frequency.value = fr;
        b.Q.value = 6;
        o.connect(b);
        b.connect(g);
      }
      const a = Math.min(1.2, d * 0.4);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v * 0.5, t + a);
      g.gain.setValueAtTime(v * 0.5, t + Math.max(a, d - 0.8));
      g.gain.linearRampToValueAtTime(0.0001, t + d + 0.6);
      M.esci(g, 1);
      o.start(t);
      o.stop(t + d + 0.8);
    }
  },
  archi(M, t, m, d, v) {
    const c = AU.c,
      f = M.f(m),
      fl = c.createBiquadFilter(),
      g = c.createGain();
    fl.type = 'lowpass';
    fl.frequency.value = 520 + f * 0.6;
    const a = Math.min(1.6, d * 0.35);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v * 0.06, t + a);
    g.gain.setValueAtTime(v * 0.06, t + Math.max(a, d - 0.6));
    g.gain.linearRampToValueAtTime(0.0001, t + d + 0.8);
    for (const det of [1, 1.006]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f * det;
      o.detune.value = M.storto(t);
      o.connect(fl);
      o.start(t);
      o.stop(t + d + 1);
    }
    fl.connect(g);
    M.esci(g, 1);
  },
  basso(M, t, m, d, v) {
    const f = M.f(m);
    M.o('triangle', f, t, 0.01, Math.min(1.6, d + 0.2), v * 0.32, 0);
    M.o('sine', f, t, 0.01, Math.min(1.8, d + 0.3), v * 0.25, 0);
  },
  campana(M, t, m, d, v) {
    const f = M.f(m);
    [
      [1, 0.45, 4.5],
      [2.01, 0.28, 3.5],
      [2.42, 0.22, 3],
      [3.02, 0.18, 2.2],
      [4.2, 0.1, 1.6]
    ].forEach(([r, w, dd]) => M.o('sine', f * r, t, 0.003, dd, v * w, 1));
  },
  stacc(M, t, m, d, v) {
    const f = M.f(m);
    M.s('sawtooth', f, t, 0.1, v * 0.16, { a: 0.006, r: 0.08, lp: 1700 });
    M.s('sawtooth', f * 1.006, t, 0.1, v * 0.12, { a: 0.006, r: 0.08, lp: 1700 });
  },
  ottone(M, t, m, d, v) {
    const c = AU.c,
      f = M.f(m),
      fl = c.createBiquadFilter(),
      g = c.createGain();
    fl.type = 'lowpass';
    fl.frequency.setValueAtTime(300, t);
    fl.frequency.linearRampToValueAtTime(1400, t + 0.12);
    fl.frequency.exponentialRampToValueAtTime(320, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v * 0.12, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.2);
    for (const k of [1, 1.5, 2.003]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f * k;
      o.connect(fl);
      o.start(t);
      o.stop(t + d + 0.3);
    }
    fl.connect(g);
    M.esci(g, 0.5);
  }
};
// percussioni: (M, t, volume)
const PERCUSSIONI = {
  cassa(M, t, v) {
    M.o('sine', 110, t, 0.002, 0.18, v * 0.6, 0, 40);
    AU.noise(t, 0.05, v * 0.25, 'lowpass', 220, 1, M.B.g);
  },
  tamb(M, t, v) {
    AU.noise(t, 0.05, v * 0.12, 'highpass', 6500, 1, M.B.g);
    AU.noise(t, 0.09, v * 0.05, 'bandpass', 9500, 4, M.B.g);
  },
  legno(M, t, v) {
    M.o('sine', 1250, t, 0.001, 0.04, v * 0.12, 0);
    M.o('triangle', 820, t, 0.001, 0.05, v * 0.06, 0);
  },
  shaker(M, t, v) {
    AU.noise(t, 0.04, v * 0.05, 'highpass', 5200, 1, M.B.g, 0.01);
  },
  battito(M, t, v) {
    M.o('sine', 55, t, 0.004, 0.12, v * 0.7, 0);
    M.o('sine', 50, t + 0.17, 0.004, 0.15, v * 0.5, 0);
  },
  tictac(M, t, v, s) {
    M.o('sine', s % 4 ? 1900 : 2400, t, 0.001, 0.02, v * 0.05, 0);
  }
};

// ---------- i brani senza temi ----------
const MUS_GEN = {
  // la miniera: un bordone che si scurisce con la profondità, gocce, colpi di piccone di qualcun altro
  miniera(M, t, s, sp, Hh) {
    const f = (G.map && G.map.f) || 1,
      k = Math.min(1, f / 25);
    if (s % 16 === 0) {
      STRUMENTI.archi(M, t, 38, 16 * sp + 1, 0.9);
      STRUMENTI.archi(M, t, k > 0.35 ? 39 : 45, 16 * sp + 1, 0.5 + k * 0.4);
      if (k > 0.6) STRUMENTI.coro(M, t + 2, 50, 10 * sp, 0.25);
    }
    if (Math.random() < 0.09) {
      const fr = 1500 + Math.random() * 1800;
      M.o('sine', fr, t + Math.random() * sp, 0.001, 0.09, 0.05, 1, fr * 0.55);
    }
    if (Math.random() < 0.03 + k * 0.03)
      STRUMENTI.campana(M, t, 74 + [0, 1, 3, 7, 8][(Math.random() * 5) | 0], 1, 0.05 + k * 0.03);
    if (Math.random() < 0.012) {
      // da lontano, qualcuno scava. Ma sei sol{o|a}
      for (let i = 0; i < 3; i++) AU.noise(t + i * 0.55, 0.05, 0.05, 'highpass', 2600, 1, M.B.r);
    }
    if (k > 0.3 && s % 8 === 0) PERCUSSIONI.battito(M, t, 0.2 + k * 0.35 + Hh * 0.3);
    if (s % 64 === 32 && Math.random() < 0.35) M.conta(t, 69 - Math.floor(k * 5));
  },
  // il bosco oltre il Varco: vento, un coro senza bocca, il carillon del titolo, stonato, da molto lontano
  bosco(M, t, s, sp, Hh) {
    if (s % 16 === 0) {
      STRUMENTI.archi(M, t, 33, 16 * sp + 1, 0.8);
      STRUMENTI.archi(M, t, 34, 16 * sp + 1, 0.35 + Hh * 0.4);
    }
    if (s % 32 === 8) STRUMENTI.coro(M, t, [57, 58, 60, 56][((s / 32) | 0) % 4], 12 * sp, 0.18 + Hh * 0.15);
    if (s % 48 === 24 && Math.random() < 0.6) {
      const tema = BRANI.titolo.temi.A.ev;
      let k = 0;
      for (let i = 0; i < 12 && k < 5; i++)
        if (tema[i]) {
          STRUMENTI.carillon(M, t + k * 0.62, tema[i].m - 1 + (k === 4 ? -1 : 0), 1, 0.05);
          k++;
        }
    }
    if (Math.random() < 0.015) AU.play('whisper', Math.random() * sp);
    if (Hh > 0.4 && s % 8 === 0) PERCUSSIONI.battito(M, t, Hh * 0.45);
  },
  // il fienile: quasi silenzio. Il legno che scricchiola, un bordone, il cuore se hai paura
  fienile(M, t, s, sp, Hh) {
    if (s % 16 === 0) STRUMENTI.archi(M, t, 40, 16 * sp + 1, 0.5);
    if (s % 32 === 16) STRUMENTI.archi(M, t, 41, 12 * sp, 0.3);
    if (Math.random() < 0.02)
      AU.noise(t, 0.5 + Math.random() * 0.4, 0.06, 'bandpass', 380, 9, M.B.g, 0.1, 240 + Math.random() * 160);
    if (Hh > 0.3 && s % 8 === 0) PERCUSSIONI.battito(M, t, Hh * 0.4);
  }
};

// ---------- il direttore ----------
const Musica = {
  id: 'none',
  br: null,
  B: null,
  step: 0,
  next: 0,
  note: 0, // quante note ha suonato (per i test)
  mod: { casa: 0, nebbia: 0 },
  ultimo: 'A',
  contaFino: 0,
  f(m) {
    return AU.mtof(m) * Math.pow(2, this.storto(this.tNota || 0) / 1200);
  },
  // il nastro che ondeggia: un po' sempre, molto con l'ombra e la paura
  storto(t) {
    const br = this.br,
      om = (br && br.ombra) || 0,
      Hh = G.horror || 0;
    return Math.sin(t * 0.37) * (3 + om * 6 + Hh * 22) + (Math.random() - 0.5) * (2 + Hh * 18);
  },
  // nota con attacco e decadimento (pizzicati, campane)
  o(type, f, t, a, dec, peak, rev, slide) {
    const c = AU.c,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dec);
    AU.env(g, t, a, peak, dec);
    o.connect(g);
    this.esci(g, rev);
    o.start(t);
    o.stop(t + a + dec + 0.05);
  },
  // nota tenuta (fiati, archi, organo): attacco, tenuta, rilascio; vibrato e tremolo a richiesta
  s(type, f, t, d, peak, o = {}) {
    const c = AU.c,
      os = c.createOscillator(),
      g = c.createGain(),
      a = o.a || 0.05,
      r = o.r || 0.2;
    os.type = type;
    os.frequency.value = f;
    let last = os;
    if (o.lp) {
      const fl = c.createBiquadFilter();
      fl.type = 'lowpass';
      fl.frequency.value = o.lp;
      os.connect(fl);
      last = fl;
    }
    if (o.vib) {
      const l = c.createOscillator(),
        lg = c.createGain();
      l.frequency.value = 5 + Math.random();
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(f * o.vib, t + Math.min(0.5, d));
      l.connect(lg);
      lg.connect(os.frequency);
      l.start(t);
      l.stop(t + d + r + 0.1);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    if (o.trem) {
      for (let x = t + a + 0.09; x < t + d; x += 0.18) {
        g.gain.linearRampToValueAtTime(peak * 0.8, x);
        g.gain.linearRampToValueAtTime(peak, x + 0.09);
      }
    }
    g.gain.setValueAtTime(peak, t + Math.max(a, d));
    g.gain.linearRampToValueAtTime(0.0001, t + Math.max(a, d) + r);
    last.connect(g);
    this.esci(g, o.rev);
    os.start(t);
    os.stop(t + Math.max(a, d) + r + 0.1);
  },
  esci(g, rev) {
    this.note++;
    g.connect(this.B.g);
    if (rev) g.connect(this.B.r);
  },
  // un bus per brano: così due brani si incrociano senza tagli
  bus(br, now, fade) {
    const c = AU.c,
      g = c.createGain(),
      f = c.createBiquadFilter(),
      r = c.createGain();
    f.type = 'lowpass';
    f.frequency.value = 12000;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(br.vol || 1, now + fade);
    r.gain.value = (br.rev ?? 0.5) * 0.9;
    g.connect(f);
    f.connect(AU.mus);
    r.connect(AU.rev);
    return { g, f, r };
  },
  spegni(B, now, fade) {
    if (!B) return;
    try {
      B.g.gain.cancelScheduledValues(now);
      B.g.gain.setValueAtTime(Math.max(0.0001, B.g.gain.value), now);
      B.g.gain.exponentialRampToValueAtTime(0.0001, now + fade);
      B.r.gain.setTargetAtTime(0, now, fade / 3);
    } catch (e) {}
    setTimeout(
      () => {
        try {
          B.g.disconnect();
          B.f.disconnect();
          B.r.disconnect();
        } catch (e) {}
      },
      (fade + 7) * 1000
    );
  },
  // il nome del brano può avere dei modificatori: «autunno|casa», «estate|nebbia»
  cambia(id, now) {
    const [base, ...mods] = String(id).split('|'),
      br = BRANI[base],
      prima = this.id.split('|')[0];
    this.id = id;
    const mod = { casa: mods.includes('casa'), nebbia: mods.includes('nebbia') };
    // stesso brano, solo un'altra stanza: si continua, cambia il colore del suono
    if (br && base === prima && this.B) {
      this.mod = mod;
      this.colora(now);
      return;
    }
    const fade = base === 'inseguimento' ? 0.25 : prima === 'inseguimento' ? 1.2 : 2.8;
    this.spegni(this.B, now, fade);
    this.B = null;
    this.br = br || null;
    this.mod = mod;
    if (!br) return;
    this.B = this.bus(br, now, fade);
    this.colora(now);
    this.step = 0;
    this.ultimo = 'A';
    this.giro = 0;
    this.next = now + (base === 'inseguimento' ? 0.02 : 0.6);
  },
  colora(now) {
    if (!this.B) return;
    const dentro = this.mod.casa;
    this.B.f.frequency.setTargetAtTime(dentro ? 1300 : this.mod.nebbia ? 3200 : 12000, now, 0.6);
    this.B.r.gain.setTargetAtTime((this.br.rev ?? 0.5) * (dentro ? 0.35 : 1) * 0.9, now, 0.6);
  },
  tick(now, Hh) {
    if (!AU.c) return;
    try {
      if (AU.mode !== this.id) this.cambia(AU.mode, now);
      this.ambiente(now, Hh);
      const br = this.br;
      if (!br || !this.B) return;
      let lento = br === BRANI.inseguimento ? 1 : 1 - Hh * 0.22;
      if (this.mod.casa) lento *= 0.9;
      if (br.inquieto) lento *= 1 - this.inquietudine() * 0.3;
      const sp = 60 / (br.bpm * lento) / 2;
      if (this.next < now - 0.5) this.next = now + 0.05;
      while (this.next < now + 0.3) {
        const sw = br.swing && this.step % 2 ? br.swing * sp : 0;
        this.passo(this.next + sw, this.step, sp, Hh);
        this.next += sp;
        this.step++;
      }
    } catch (e) {
      if (!this.errore) {
        this.errore = 1;
        console.error(e);
      }
    }
  },
  // alla Festa del Raccolto: da 0 (le 18:30) a 1 (mezzanotte)
  inquietudine() {
    const t = G.st ? G.st.time : 0;
    return clamp((t - (18 * 60 + 30)) / (5.5 * 60), 0, 1);
  },
  passo(t, s, sp, Hh) {
    const br = this.br,
      P = br.passi,
      bar = Math.floor(s / P),
      pos = s % P;
    this.tNota = t;
    if (br.gen) return MUS_GEN[br.gen](this, t, s, sp, Hh);
    const iSez = Math.floor(bar / 4) % br.forma.length,
      sez = br.forma[iSez],
      lettera = sez[0] === '·' ? this.ultimo : sez[0],
      tema = br.temi[lettera] || br.temi.A,
      b4 = bar % 4,
      dentro = this.mod.casa,
      vol = dentro ? 0.75 : 1;
    if (sez[0] !== '·') this.ultimo = lettera;
    if (pos === 0 && b4 === 0 && iSez === 0 && bar) this.giro++;
    // accordo di questo mezzo
    const halves = tema.acc[b4],
      meta = halves.length > 1 && pos >= P / 2 ? 1 : 0,
      ac = halves[meta] || halves[0];
    const cambio = pos === 0 || (halves.length > 1 && pos === P / 2);
    const durAcc = (halves.length > 1 ? P / 2 : P) * sp;
    // l'ombra: all'inizio di ogni battuta, a volte, qualcosa che non torna
    if (pos === 0) this.ombra(t, sp, Hh, ac);
    if (!ac) return;
    // tappeto
    if (cambio && br.pad) {
      const voc = this.voci(ac, 52);
      for (const m of voc) STRUMENTI[br.pad.s](this, t, m, durAcc + 0.3, br.pad.v * vol);
    }
    if (cambio && br.coro && (pos === 0 || Math.random() < 0.5))
      STRUMENTI.coro(this, t, this.voci(ac, 60)[Math.floor(Math.random() * 3)], durAcc + 0.5, br.coro);
    // basso
    if (br.basso) {
      const c = br.basso.p.split(' ')[pos];
      if (c && c !== '.') {
        const r = ac.r - 12 * Math.ceil((ac.r - 45) / 12);
        const m = c === 'R' ? r : c === '5' ? r + 7 : c === '8' ? r + 12 : r;
        STRUMENTI[br.basso.s](this, t, m, sp * 2.2, br.basso.v * vol);
      }
    }
    // arpeggio
    if (br.arp) {
      const c = br.arp.p.split(' ')[pos];
      if (c && c !== '.') {
        const voc = this.voci(ac, 55),
          ext = voc.concat(voc.map(x => x + 12));
        STRUMENTI[br.arp.s](
          this,
          t,
          ext[+c % ext.length],
          sp * 2,
          br.arp.v * vol * (0.85 + Math.random() * 0.3)
        );
      }
    }
    // ostinato (inseguimento)
    if (br.ostinato) {
      const st = br.ostinato.p[pos],
        sale = (Math.floor(bar / 2) % 4) * (G.horse && G.horse.on ? 1 : 0);
      STRUMENTI[br.ostinato.s](this, t, ac.r + 12 + st + sale, sp, 0.9);
      if (br.ottoni && pos === 0 && b4 % 2 === 0) STRUMENTI.ottone(this, t, ac.r, sp * 6, 0.8);
    }
    // percussioni
    if (br.perc)
      for (const k in br.perc) {
        const c = br.perc[k].split(' ')[pos];
        if (c === 'x') PERCUSSIONI[k](this, t, vol * (0.8 + Math.random() * 0.3), s);
      }
    if (dentro && s % 2 === 0) PERCUSSIONI.tictac(this, t, 1, s);
    // melodia
    const ev = tema.ev[b4 * P + pos];
    if (sez[0] === '·') {
      // respiro: solo un'eco del tema, ogni tanto
      if (ev && Math.random() < 0.18)
        STRUMENTI[br.alt || br.mel](this, t, ev.m + 12, ev.len * sp, 0.35 * vol);
      return;
    }
    if (!ev) return;
    let m = ev.m,
      v = 1,
      strum = br.mel;
    if (sez.includes('~')) {
      strum = br.alt || br.mel;
      if (pos && Math.random() < 0.15) return;
      if (pos && Math.random() < 0.18) m += Math.random() < 0.5 ? 12 : -12;
      if (ev.len === 1 && Math.random() < 0.15) {
        // un'appoggiatura dalla nota sopra
        STRUMENTI[strum](this, t - sp * 0.35, m + 2, sp * 0.3, 0.45 * vol);
      }
    }
    if (sez.includes('_') || dentro) {
      m -= 12;
      v *= 0.7;
    }
    // con la paura le note scivolano giù, o mancano
    if (Hh > 0.3 && Math.random() < Hh * 0.3) m -= 1;
    if (Hh > 0.6 && Math.random() < 0.25) return;
    if (br.inquieto) {
      const q = this.inquietudine();
      if (Math.random() < q * 0.35) m -= 1;
      if (Math.random() < q * 0.2) return;
    }
    const lung = ev.len * sp * (strum === 'carillon' || strum === 'celesta' ? 1 : 0.95);
    STRUMENTI[strum](
      this,
      t + (Math.random() - 0.5) * 0.012,
      m,
      lung,
      v * vol * (0.85 + Math.random() * 0.25)
    );
  },
  // le note di un accordo vicino a un centro (voice leading semplice)
  voci(ac, centro) {
    return ac.iv.slice(0, 4).map(i => {
      let m = ac.r + i;
      while (m < centro - 6) m += 12;
      while (m > centro + 6) m -= 12;
      return m;
    });
  },
  // l'angoscia sotto la gioia
  ombra(t, sp, Hh, ac) {
    const br = this.br,
      om = br.ombra || 0;
    if (!om && Hh < 0.2) return;
    const p = om * 0.09 + Hh * 0.22 + (br.notte ? 0.04 : 0);
    if (Math.random() > p) return;
    const r = Math.random(),
      root = ac ? ac.r : br.root;
    if (r < 0.28) {
      // una campana lontana, un po' calante
      STRUMENTI.campana(this, t, root - 12 - (Math.random() < 0.5 ? 1 : 0), 4, 0.06 + om * 0.04);
    } else if (r < 0.5) {
      // un bordone un semitono sopra la tonica, che sale piano e se ne va
      STRUMENTI.archi(this, t, root - 12 + 1, sp * 16, 0.25 + Hh * 0.5);
    } else if (r < 0.7) {
      // un respiro (rumore che si gonfia)
      const c = AU.c,
        s = c.createBufferSource(),
        f = c.createBiquadFilter(),
        g = c.createGain();
      s.buffer = AU.nb;
      f.type = 'bandpass';
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(900, t + 2.2);
      f.Q.value = 2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05 + Hh * 0.05, t + 2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      s.connect(f);
      f.connect(g);
      this.esci(g, 1);
      s.start(t, Math.random());
      s.stop(t + 2.7);
    } else if (r < 0.88 || !(br.notte || Hh > 0.3)) {
      // una nota di carillon che stona, sopra tutto
      STRUMENTI.carillon(this, t + sp * 3, root + 25, 1, 0.05);
    } else {
      this.conta(t, root + 24);
    }
  },
  // qualcuno conta fino a otto. A volte arriva a nove
  conta(t, m) {
    if (t < this.contaFino) return;
    const nove = Math.random() < 0.3 + (G.horror || 0) * 0.3;
    for (let i = 0; i < (nove ? 9 : 8); i++)
      STRUMENTI.carillon(this, t + i * 0.55, i === 8 ? m - 1 : m, 1, i === 8 ? 0.08 : 0.04);
    this.contaFino = t + 7;
  },
  // i suoni del mondo: uccelli per stagione, cicale d'estate, grilli, gufo, cornacchie d'autunno
  ambiente(now, Hh) {
    if (G.mode !== 'game' || !G.map || G.map.interior || !G.st) return;
    const s = typeof seasonOf === 'function' ? seasonOf(G.st) : 0,
      notte = G.night > 0.5,
      pioggia = G.st.weather === 'pioggia';
    if (notte) {
      if (s !== 1 && Math.random() < (s === 3 ? 0.05 : 0.025)) AU.chirp(now);
      if (Math.random() < 0.0009) this.gufo(now);
    } else if (G.night < 0.2 && Hh < 0.5 && !pioggia) {
      const uccelli = [0.004, 0.0015, 0.012, 0.006][s];
      if (Math.random() < uccelli) AU.bird(now);
      if (s === 3 && Math.random() < 0.004) this.cicala(now);
      if (s === 0 && Math.random() < 0.0008) AU.play('caw');
    }
  },
  gufo(t) {
    for (const [d, f] of [
      [0, 380],
      [0.5, 360],
      [0.72, 360]
    ]) {
      const g = AU.osc('sine', f, t + d, 0.28, 0.025, AU.sfx, 0.05, f * 0.9);
      g.connect(AU.rev);
    }
  },
  cicala(t) {
    for (let i = 0; i < 14; i++) AU.noise(t + i * 0.07, 0.05, 0.012, 'bandpass', 5200, 8, AU.sfx, 0.01);
  },
  // il nome del brano che sta suonando (per le opzioni e i test)
  titolo() {
    return this.br ? this.br.n : '';
  }
};
