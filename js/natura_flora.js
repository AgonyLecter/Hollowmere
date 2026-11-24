'use strict';
// ================= NATURA (1): LA FLORA =================
// Colture nuove (erbe, legumi, ortaggi d'inverno, fiori), alberi da frutto nuovi e piante selvatiche per ogni stagione.
// Tutto si aggiunge ai dati esistenti (CROPS, ITEMS, FRUIT, WILD, MERC_STOCK…): i salvataggi vecchi restano validi.
// La grafica si fa nel punto di estensione 'arte' (alla fine di boot, in main.js).

// stagioni: 0 autunno · 1 inverno · 2 primavera · 3 estate
// k: forma della pianta (vedi CART.DEF in contenuti.js) · ic: forma dell'icona (vedi NAT_IC qui sotto)
const NAT_CROPS = {
  basilico: {
    n: 'Basilico',
    pl: 'mazzi di basilico',
    sg: 'un mazzo di basilico',
    s: [3],
    days: 3,
    re: 2,
    v: 30,
    p: 25,
    k: 'leaf',
    c: '#3f9a3a',
    ic: ['erba', '#3f9a3a']
  },
  prezzemolo: {
    n: 'Prezzemolo',
    pl: 'mazzi di prezzemolo',
    sg: 'un mazzo di prezzemolo',
    s: [2, 0],
    days: 3,
    re: 2,
    v: 25,
    p: 20,
    k: 'leaf',
    c: '#2f8a2a',
    ic: ['erba', '#2f8a2a', 1]
  },
  salvia: {
    n: 'Salvia',
    pl: 'mazzi di salvia',
    sg: 'un mazzo di salvia',
    s: [2, 3],
    days: 4,
    re: 3,
    v: 35,
    p: 30,
    k: 'leaf',
    c: '#8aa88a',
    ic: ['erba', '#8aa88a']
  },
  rosmarino: {
    n: 'Rosmarino',
    pl: 'rametti di rosmarino',
    sg: 'un rametto di rosmarino',
    s: [2, 3, 0],
    days: 5,
    re: 3,
    v: 40,
    p: 40,
    k: 'flower',
    c: '#8aa0e0',
    ic: ['rametto', '#3a6a4a', '#8aa0e0']
  },
  fave: {
    n: 'Fave',
    pl: 'manciate di fave',
    sg: 'una manciata di fave',
    s: [2],
    days: 4,
    re: 2,
    v: 40,
    p: 30,
    k: 'pole',
    c: '#7ab84a',
    ic: ['baccello', '#7ab84a', '#d8e8a0']
  },
  ceci: {
    n: 'Ceci',
    pl: 'manciate di ceci',
    sg: 'una manciata di ceci',
    s: [3],
    days: 5,
    v: 45,
    p: 30,
    k: 'bush',
    c: '#e8d0a0',
    fr: '#e8d0a0',
    ic: ['semi', '#e8c890']
  },
  lenticchie: {
    n: 'Lenticchie',
    pl: 'manciate di lenticchie',
    sg: 'una manciata di lenticchie',
    s: [0],
    days: 5,
    v: 50,
    p: 35,
    k: 'bush',
    fr: '#8a5a3a',
    ic: ['semi', '#8a5a3a', 1]
  },
  orzo: {
    n: 'Orzo',
    pl: 'covoni di orzo',
    sg: 'un covone di orzo',
    s: [2, 3],
    days: 4,
    v: 30,
    p: 20,
    k: 'grain',
    ic: ['spiga', '#d8b860']
  },
  cetriolo: {
    n: 'Cetriolo',
    pl: 'cetrioli',
    sg: 'un cetriolo',
    s: [3],
    days: 4,
    re: 2,
    v: 35,
    p: 30,
    k: 'vine',
    fr: '#3a7a2a',
    ic: ['lungo', '#3a7a2a', '#8ac060']
  },
  finocchio: {
    n: 'Finocchio',
    pl: 'finocchi',
    sg: 'un finocchio',
    s: [0, 1],
    days: 4,
    v: 60,
    p: 35,
    k: 'bulb',
    c: '#eef2d8',
    ic: ['bulbo', '#eef2d8', '#7ab84a']
  },
  carciofo: {
    n: 'Carciofo',
    pl: 'carciofi',
    sg: 'un carciofo',
    s: [2],
    days: 6,
    re: 3,
    v: 90,
    p: 60,
    k: 'tall',
    top: '#6a8a5a',
    ic: ['carciofo', '#6a8a5a', '#8a5a8a']
  },
  cavolocap: {
    n: 'Cavolo cappuccio',
    pl: 'cavoli cappucci',
    sg: 'un cavolo cappuccio',
    s: [0, 1],
    days: 5,
    v: 100,
    p: 50,
    k: 'leaf',
    c: '#9ac86a',
    ic: ['testa', '#9ac86a']
  },
  broccolo: {
    n: 'Broccolo',
    pl: 'broccoli',
    sg: 'un broccolo',
    s: [1],
    days: 5,
    v: 90,
    p: 50,
    k: 'leaf',
    c: '#2f6a3a',
    ic: ['broccolo', '#2f6a3a']
  },
  bietola: {
    n: 'Bietola',
    pl: 'mazzi di bietole',
    sg: 'un mazzo di bietole',
    s: [0, 2],
    days: 3,
    re: 3,
    v: 30,
    p: 20,
    k: 'leaf',
    c: '#4a8a3a',
    ic: ['foglie', '#4a8a3a', '#c83a4a']
  },
  rucola: {
    n: 'Rucola',
    pl: 'mazzi di rucola',
    sg: 'un mazzo di rucola',
    s: [2, 0],
    days: 2,
    v: 25,
    p: 15,
    k: 'leaf',
    c: '#5aa83a',
    ic: ['foglie', '#5aa83a', '#d8e8b0']
  },
  sedano: {
    n: 'Sedano',
    pl: 'sedani',
    sg: 'un sedano',
    s: [0],
    days: 4,
    v: 45,
    p: 30,
    k: 'tall',
    top: '#a8d878',
    ic: ['gambi', '#a8d878']
  },
  zafferano: {
    n: 'Zafferano',
    pl: 'pizzichi di zafferano',
    sg: 'un pizzico di zafferano',
    s: [0],
    days: 6,
    v: 300,
    p: 140,
    k: 'flower',
    c: '#9a5ad8',
    ic: ['fiore', '#9a5ad8', '#e8402a']
  },
  topinambur: {
    n: 'Topinambur',
    pl: 'topinambur',
    sg: 'un topinambur',
    s: [1],
    days: 4,
    v: 55,
    p: 30,
    k: 'tall',
    top: '#f0c83a',
    ic: ['tubero', '#c8945a']
  },
  cicoria: {
    n: 'Cicoria',
    pl: 'mazzi di cicoria',
    sg: 'un mazzo di cicoria',
    s: [1, 2],
    days: 3,
    v: 35,
    p: 20,
    k: 'leaf',
    c: '#6a9a4a',
    ic: ['foglie', '#6a9a4a', '#f0f0e0']
  },
  calendula: {
    n: 'Calendula',
    pl: 'calendule',
    sg: 'una calendula',
    s: [2, 3],
    days: 3,
    v: 50,
    p: 30,
    k: 'flower',
    c: '#f0902a',
    ic: ['fiore', '#f0902a', '#c86a1a']
  },
  viola: {
    n: 'Viola',
    pl: 'mazzetti di viole',
    sg: 'un mazzetto di viole',
    s: [1, 2],
    days: 3,
    v: 45,
    p: 25,
    k: 'flower',
    c: '#7a4ac8',
    ic: ['fiore', '#7a4ac8', '#f0d040']
  },
  // --- la Valle d'inverno e di primavera (aggiunte) ---
  radicchio: {
    n: 'Radicchio',
    pl: 'cespi di radicchio',
    sg: 'un cespo di radicchio',
    s: [1],
    days: 5,
    v: 70,
    p: 40,
    k: 'leaf',
    c: '#8a2a3a',
    ic: ['foglie', '#8a2a3a', '#f0e8e0']
  },
  cavolonero: {
    n: 'Cavolo nero',
    pl: 'mazzi di cavolo nero',
    sg: 'un mazzo di cavolo nero',
    s: [0, 1],
    days: 5,
    re: 3,
    v: 60,
    p: 35,
    k: 'leaf',
    c: '#2f4a3a',
    ic: ['foglie', '#2f4a3a', '#6a8a5a']
  },
  pastinaca: {
    n: 'Pastinaca',
    pl: 'pastinache',
    sg: 'una pastinaca',
    s: [0, 1],
    days: 6,
    v: 55,
    p: 30,
    k: 'bulb',
    c: '#efe6c4',
    ic: ['lungo', '#efe6c4', '#6a9a4a']
  },
  rabarbaro: {
    n: 'Rabarbaro',
    pl: 'gambi di rabarbaro',
    sg: 'un gambo di rabarbaro',
    s: [2],
    days: 5,
    re: 3,
    v: 55,
    p: 40,
    k: 'tall',
    c: '#c84a5a',
    ic: ['gambi', '#c84a5a']
  },
  fagiolini: {
    n: 'Fagiolini',
    pl: 'manciate di fagiolini',
    sg: 'una manciata di fagiolini',
    s: [2, 3],
    days: 4,
    re: 2,
    v: 40,
    p: 30,
    k: 'pole',
    c: '#5aa83a',
    ic: ['baccello', '#5aa83a', '#a8d878']
  },
  peperoncino: {
    n: 'Peperoncino',
    pl: 'mazzetti di peperoncini',
    sg: 'un mazzetto di peperoncini',
    s: [3],
    days: 5,
    re: 2,
    v: 50,
    p: 35,
    k: 'bush',
    c: '#3a7a2a',
    fr: '#d8201a',
    ic: ['lungo', '#d8201a', '#3a7a2a']
  },
  erbacipollina: {
    n: 'Erba cipollina',
    pl: 'mazzi di erba cipollina',
    sg: 'un mazzo di erba cipollina',
    s: [2, 3],
    days: 3,
    re: 2,
    v: 25,
    p: 20,
    k: 'leaf',
    c: '#4a9a3a',
    ic: ['erba', '#4a9a3a']
  }
};
const NAT_SEEDX = {
  zafferano: 'Il fiore più prezioso della Valle: tre fili rossi per fiore.',
  rosmarino: 'Resiste a tre stagioni e ricresce dopo ogni raccolto.',
  topinambur: "Uno dei pochi ortaggi che crescono d'inverno.",
  broccolo: "Cresce solo d'inverno, quando l'orto dorme.",
  carciofo: 'Lento, ma poi ricresce per tutta la primavera.',
  orzo: 'Al mulino diventa farina.',
  viola: "Fiorisce anche col freddo, d'inverno e in primavera.",
  radicchio: "Il cuore dell'orto d'inverno: amaro, rosso e bianco.",
  cavolonero: 'Più gela, più è buono. Ricresce fino a fine inverno.',
  pastinaca: 'Una carota bianca e dolce, che non teme il freddo.',
  rabarbaro: 'Gambi rosa e aspri: in torta diventano dolci.',
  peperoncino: 'Rosso. Agatha lo coltiva lo stesso: «nel piatto non conta».'
};
// alberi da frutto nuovi (t: nome dell'albero)
const NAT_FRUIT = {
  olive: {
    t: 'olivo',
    n: 'Olive',
    pl: 'manciate di olive',
    sg: 'una manciata di olive',
    s: [0, 1],
    c: '#4a5a2a',
    v: 45,
    p: 380,
    d: 'Olive in autunno e in inverno. Al frantoio diventano olio.',
    ic: ['bacche', '#4a5a2a', 3]
  },
  mandorle: {
    t: 'mandorlo',
    n: 'Mandorle',
    pl: 'manciate di mandorle',
    sg: 'una manciata di mandorle',
    s: [3],
    c: '#c8a070',
    v: 60,
    p: 360,
    d: 'Mandorle a fine estate.',
    ic: ['noce', '#c8a070']
  },
  melograno: {
    t: 'melograno',
    n: 'Melograno',
    pl: 'melograni',
    sg: 'un melograno',
    s: [0],
    c: '#b8303a',
    v: 90,
    p: 380,
    d: 'Melograni in autunno, pieni di chicchi.',
    ic: ['frutto', '#b8303a', 1]
  },
  nespole: {
    t: 'nespolo',
    n: 'Nespole',
    pl: 'manciate di nespole',
    sg: 'una manciata di nespole',
    s: [2],
    c: '#e8a040',
    v: 55,
    p: 320,
    d: 'Le prime frutta della primavera.',
    ic: ['bacche', '#e8a040', 2]
  },
  gelsi: {
    t: 'gelso',
    n: 'More di gelso',
    pl: 'cestini di more di gelso',
    sg: 'un cestino di more di gelso',
    s: [3],
    c: '#4a1a3a',
    v: 50,
    p: 300,
    d: "More di gelso d'estate. Macchiano le dita.",
    ic: ['bacche', '#4a1a3a', 4]
  },
  cachi: {
    t: 'caco',
    n: 'Cachi',
    pl: 'cachi',
    sg: 'un caco',
    s: [0],
    c: '#f07a1a',
    v: 70,
    p: 340,
    d: "Cachi a fine autunno, quando l'albero ha perso le foglie.",
    ic: ['frutto', '#f07a1a']
  },
  castagne: {
    t: 'castagno',
    n: 'Castagne',
    pl: 'castagne',
    sg: 'una manciata di castagne',
    s: [0],
    c: '#7a4a2a',
    v: 40,
    p: 360,
    d: 'Il castagno: castagne ogni autunno, senza cercarle nel bosco.',
    esiste: 1
  },
  uva: {
    t: 'vite',
    n: 'Uva',
    pl: "grappoli d'uva",
    sg: "un grappolo d'uva",
    s: [3, 0],
    c: '#5a3a8a',
    v: 65,
    p: 400,
    d: "Una vite: uva a fine estate e in autunno. Nella botte, succo d'uva.",
    ic: ['grappolo', '#5a3a8a']
  },
  nocciole: {
    t: 'nocciolo',
    n: 'Nocciole',
    pl: 'manciate di nocciole',
    sg: 'una manciata di nocciole',
    s: [3, 0],
    c: '#a87a4a',
    v: 35,
    p: 300,
    d: 'Un nocciolo vicino a casa: nocciole a fine estate e in autunno, senza andare nel bosco.',
    esiste: 1
  },
  cotogne: {
    t: 'cotogno',
    n: 'Mele cotogne',
    pl: 'mele cotogne',
    sg: 'una mela cotogna',
    s: [0],
    c: '#e8c840',
    v: 55,
    p: 340,
    d: 'Mele cotogne in autunno: dure e profumate. Crude no, cotte sì.',
    ic: ['frutto', '#e8c840']
  },
  sorbe: {
    t: 'sorbo',
    n: 'Sorbe',
    pl: 'grappoli di sorbe',
    sg: 'un grappolo di sorbe',
    s: [0, 1],
    c: '#d8702a',
    v: 45,
    p: 320,
    d: "Bacche in autunno e d'inverno. I vecchi piantavano il sorbo davanti a casa, «contro quelli del bosco».",
    ic: ['bacche', '#d8702a', 3]
  }
};
// raccolta selvatica nuova, per stagione
const NAT_WILD = {
  0: ['finferli', 'cinorrodi', 'corbezzoli', 'prugnole', 'chiodini'],
  1: ['ginepro', 'pinoli', 'tartufo', 'crescione', 'vischio'],
  2: ['ortica', 'aglio_orsino', 'sambuco', 'violette', 'spugnole', 'crescione', 'bruscandoli', 'primule'],
  3: ['menta', 'origano', 'finocchietto', 'lamponi', 'iperico']
};
const NAT_WILD_ITEMS = {
  finferli: {
    n: 'Finferli',
    pl: 'manciate di finferli',
    sg: 'una manciata di finferli',
    v: 60,
    ic: ['fungo', '#f0b030', '#e8c060']
  },
  cinorrodi: {
    n: 'Rosa canina',
    pl: 'rametti di rosa canina',
    sg: 'un rametto di rosa canina',
    v: 35,
    ic: ['bacche', '#d8502a', 5]
  },
  corbezzoli: {
    n: 'Corbezzoli',
    pl: 'manciate di corbezzoli',
    sg: 'una manciata di corbezzoli',
    v: 45,
    ic: ['bacche', '#e8402a', 2]
  },
  ginepro: {
    n: 'Bacche di ginepro',
    pl: 'rametti di ginepro',
    sg: 'un rametto di ginepro',
    v: 40,
    ic: ['bacche', '#3a4a7a', 5]
  },
  pinoli: {
    n: 'Pinoli',
    pl: 'manciate di pinoli',
    sg: 'una manciata di pinoli',
    v: 70,
    ic: ['pigna', '#8a5a2a']
  },
  tartufo: {
    n: 'Tartufo',
    pl: 'tartufi',
    sg: 'un tartufo',
    v: 420,
    raro: 1,
    d: "Nero, rugoso, profumato. Il tesoro del bosco d'inverno.",
    ic: ['tartufo', '#3a2e28']
  },
  crescione: {
    n: 'Crescione',
    pl: 'mazzi di crescione',
    sg: 'un mazzo di crescione',
    v: 30,
    ic: ['foglie', '#3a8a3a', '#a8d878']
  },
  ortica: {
    n: 'Ortica',
    pl: 'mazzi di ortiche',
    sg: 'un mazzo di ortiche',
    v: 20,
    d: 'Punge. Cotta, è buonissima.',
    ic: ['foglie', '#3a6a2a', '#6a9a4a']
  },
  aglio_orsino: {
    n: 'Aglio orsino',
    pl: "mazzi d'aglio orsino",
    sg: "un mazzo d'aglio orsino",
    v: 40,
    ic: ['erba', '#4aa84a', 1]
  },
  sambuco: {
    n: 'Fiori di sambuco',
    pl: 'ombrelle di sambuco',
    sg: "un'ombrella di sambuco",
    v: 35,
    ic: ['ombrella', '#f4f0d8']
  },
  violette: {
    n: 'Violette',
    pl: 'mazzetti di violette',
    sg: 'un mazzetto di violette',
    v: 30,
    ic: ['fiore', '#8a5ad8', '#f8f0f8']
  },
  spugnole: {
    n: 'Spugnole',
    pl: 'manciate di spugnole',
    sg: 'una manciata di spugnole',
    v: 110,
    d: 'Funghi di primavera, a forma di spugna.',
    ic: ['spugnola', '#a8805a']
  },
  menta: { n: 'Menta', pl: 'mazzi di menta', sg: 'un mazzo di menta', v: 25, ic: ['erba', '#5ac87a'] },
  origano: {
    n: 'Origano',
    pl: "mazzi d'origano",
    sg: "un mazzo d'origano",
    v: 30,
    ic: ['rametto', '#5a7a3a', '#c8a0d8']
  },
  finocchietto: {
    n: 'Finocchietto selvatico',
    pl: 'mazzi di finocchietto',
    sg: 'un mazzo di finocchietto',
    v: 30,
    ic: ['ombrella', '#d8d040']
  },
  lamponi: {
    n: 'Lamponi',
    pl: 'cestini di lamponi',
    sg: 'un cestino di lamponi',
    v: 60,
    ic: ['bacche', '#e8304a', 1]
  },
  prugnole: {
    n: 'Prugnole',
    pl: 'manciate di prugnole',
    sg: 'una manciata di prugnole',
    v: 35,
    d: 'Blu e aspre: vanno colte dopo la prima brina.',
    ic: ['bacche', '#3a3a6a', 3]
  },
  chiodini: {
    n: 'Chiodini',
    pl: 'manciate di chiodini',
    sg: 'una manciata di chiodini',
    v: 55,
    d: 'Crescono a grappoli sui ceppi tagliati.',
    ic: ['fungo', '#c89a4a', '#e8d0a0']
  },
  vischio: {
    n: 'Vischio',
    pl: 'rametti di vischio',
    sg: 'un rametto di vischio',
    v: 50,
    d: 'Non si mangia. Lo si appende sopra la porta, prima della campana delle nove.',
    ic: ['bacche', '#f0f0e0', 2]
  },
  bruscandoli: {
    n: 'Bruscandoli',
    pl: 'mazzi di bruscandoli',
    sg: 'un mazzo di bruscandoli',
    v: 45,
    d: 'I germogli del luppolo selvatico, lungo le siepi.',
    ic: ['gambi', '#6aa84a']
  },
  primule: {
    n: 'Primule',
    pl: 'mazzetti di primule',
    sg: 'un mazzetto di primule',
    v: 25,
    d: "I primi fiori dopo la neve. Si mangiano anche, nell'insalata.",
    ic: ['fiore', '#f0e070', '#e89a2a']
  },
  iperico: {
    n: 'Iperico',
    pl: "mazzi d'iperico",
    sg: "un mazzo d'iperico",
    v: 40,
    d: 'Fiorisce a San Giovanni. Lo chiamano «scacciadiavoli».',
    ic: ['fiore', '#f0c020', '#c88a10']
  }
};

// ---------- dati ----------
for (const [id, g] of Object.entries(NAT_CROPS)) {
  CROPS[id] = { days: g.days, n: g.n, y: [1, g.re ? 2 : 1], re: g.re, s: g.s };
  ITEMS[id] = { n: g.n, t: 'crop', v: g.v };
  ITEMS['s_' + id] = {
    n: 'Semi di ' + g.n.toLowerCase(),
    t: 'seed',
    crop: id,
    p: g.p,
    ...(NAT_SEEDX[id] ? { x: NAT_SEEDX[id] } : {})
  };
  PL[id] = g.pl;
  SG[id] = g.sg;
  FAV_VAL[id] = g.v;
  if (!MERC_STOCK.includes('s_' + id)) MERC_STOCK.push('s_' + id);
}
if (typeof MILL !== 'undefined') MILL.orzo = [1, 1];
for (const [id, f] of Object.entries(NAT_FRUIT)) {
  FRUIT[id] = { s: f.s, c: f.c };
  if (!f.esiste) {
    ITEMS[id] = { n: f.n, t: 'crop', v: f.v };
    PL[id] = f.pl;
    SG[id] = f.sg;
    FAV_VAL[id] = f.v;
  }
  ITEMS['alb_' + f.t] = {
    n: 'Alberello di ' + f.t,
    t: 'place',
    tree: id,
    p: f.p,
    d: 'Matura in 12 giorni. ' + f.d
  };
  if (typeof BIG_BUILT !== 'undefined') BIG_BUILT['alb_' + f.t] = 8;
  MERC_STOCK.push('alb_' + f.t);
}
JUICY.push('uva', 'melograno', 'nespole', 'gelsi', 'cachi', 'lamponi', 'corbezzoli', 'cotogne', 'prugnole');
for (const s of [0, 1, 2, 3]) for (const id of NAT_WILD[s]) if (!WILD[s].includes(id)) WILD[s].push(id);
for (const [id, w] of Object.entries(NAT_WILD_ITEMS)) {
  ITEMS[id] = { n: w.n, t: 'crop', v: w.v, ...(w.d ? { d: w.d } : {}) };
  PL[id] = w.pl;
  SG[id] = w.sg;
  FAV_VAL[id] = w.v;
}
// il tartufo è raro: compare solo ogni tanto al posto di un'altra pianta d'inverno
Ext.on('freeMorning', st => {
  try {
    const W2 = st.free;
    if (!W2 || !W2.debris) return;
    for (const k in W2.debris)
      if (W2.debris[k] === 'w_tartufo' && Math.random() < 0.75) W2.debris[k] = 'w_ginepro';
  } catch (e) {
    console.error(e);
  }
});
// conserve e succhi anche per tutto il nuovo
for (const id of [...Object.keys(NAT_CROPS), ...Object.keys(NAT_FRUIT), ...Object.keys(NAT_WILD_ITEMS)]) {
  const it = ITEMS[id];
  if (!it || ['tartufo', 'vischio', 'iperico'].includes(id)) continue;
  if (!ITEMS['cons_' + id])
    ITEMS['cons_' + id] = {
      n: 'Conserva di ' + it.n.toLowerCase(),
      t: 'crop',
      v: Math.round(it.v * 2 + 30),
      pre: id
    };
  if (JUICY.includes(id) && !ITEMS['succo_' + id])
    ITEMS['succo_' + id] = {
      n: 'Succo di ' + it.n.toLowerCase(),
      t: 'crop',
      v: Math.round(it.v * 3 + 20),
      pre: id
    };
}
// semi nuovi anche nelle botteghe di Rina e Lia
{
  const add = (rid, L) => {
    const r = RES_POOL.find(x => x.id === rid);
    if (r) for (const x of L) if (!r.shop.some(([y]) => y === x[0])) r.shop.push(x);
  };
  add('rina', [
    ['s_fave', 34],
    ['s_carciofo', 62],
    ['s_broccolo', 52]
  ]);
  add('lia', [
    ['s_calendula', 32],
    ['s_viola', 28],
    ['s_zafferano', 150]
  ]);
  add('mirta', [
    ['s_rosmarino', 42],
    ['s_salvia', 32]
  ]);
}

// ---------- grafica ----------
// forme delle icone (32×32): ognuna prende i colori dai dati
const NAT_IC = (() => {
  const I = () => new MK2(32, 32);
  const R = h => R6b(h);
  const dot = (P, x, y, r, col, o = {}) => paint2(P, I().ell(x, y, r, r), R(col), { thin: 1, ...o });
  const stem = (P, x0, y0, x1, y1, col = '#4a7a2a', w = 1) =>
    paint2(P, I().cap(x0, y0, x1, y1, w), R(col), { thin: 1 });
  return {
    erba: (c, curly) => P => {
      stem(P, 16, 29, 16, 18);
      stem(P, 16, 29, 10, 20);
      stem(P, 16, 29, 22, 20);
      for (const [x, y, a] of [
        [10, 12, -0.6],
        [16, 9, 0],
        [22, 12, 0.6],
        [12, 19, -1],
        [20, 19, 1],
        [16, 15, 0]
      ])
        paint2(P, I().rot(x, y, curly ? 3.4 : 4.4, curly ? 3 : 2.4, a), R(c), {
          mod: (X, Y, t) => (curly && (X + Y) % 3 === 0 ? t - 1 : t)
        });
      paint2(P, I().rect(13, 25, 6, 3), R('#c8a060'), { thin: 1 });
    },
    rametto: (c, fl) => P => {
      stem(P, 8, 27, 24, 5, '#6a5a3a');
      for (let i = 0; i < 9; i++) {
        const x = 9 + i * 1.8,
          y = 26 - i * 2.4;
        paint2(P, I().rot(x - 2.4, y, 3, 0.9, -0.5), R(c), { thin: 1, nc: 1 });
        paint2(P, I().rot(x + 2.2, y + 1, 3, 0.9, 0.9), R(c), { thin: 1, nc: 1 });
      }
      if (fl)
        for (const [x, y] of [
          [13, 15],
          [18, 10],
          [21, 7]
        ])
          dot(P, x, y, 1.2, fl, { nc: 1 });
    },
    baccello: (c, sem) => P => {
      for (const [x, y, a] of [
        [12, 16, 0.9],
        [20, 15, 0.7]
      ]) {
        paint2(P, I().rot(x, y, 11, 3.4, a), R(c));
        for (let k = -2; k <= 2; k++)
          dot(P, x + Math.cos(a) * k * 3.6, y + Math.sin(a) * k * 3.6, 1.1, sem, { nc: 1 });
      }
    },
    semi: (c, piatti) => P => {
      paint2(P, I().ell(16, 22, 13, 6), R('#c8a070'), { thin: 1 });
      paint2(P, I().ell(16, 21, 11, 4), R('#a87a4a'), { flat: 1, nc: 1, base: 2 });
      const pts = [
        [10, 19],
        [14, 17],
        [18, 18],
        [22, 19],
        [12, 21],
        [16, 20],
        [20, 21],
        [15, 15],
        [19, 15],
        [17, 13]
      ];
      for (const [x, y] of pts)
        paint2(P, I().ell(x, y, piatti ? 2.2 : 2, piatti ? 1.4 : 2), R(c), { thin: 1 });
    },
    spiga: c => P => {
      for (const dx of [-6, 0, 6]) {
        stem(P, 16 + dx * 0.4, 30, 16 + dx, 10, '#b89a4a');
        for (let y = 5; y < 17; y += 3) {
          dot(P, 16 + dx - 1.5, y, 1.4, c);
          dot(P, 16 + dx + 1.5, y + 1, 1.4, c);
        }
        for (let y = 2; y < 6; y++) P.set(16 + dx, y, C('#e8d8a0'));
      }
    },
    lungo: (c, ch) => P => {
      paint2(P, I().rot(16, 17, 13, 4.6, -0.6), R(c), {
        mod: (X, Y, t) => ((X * 2 + Y) % 5 === 0 ? t + 1 : t)
      });
      for (const [x, y] of [
        [11, 22],
        [16, 17],
        [21, 12],
        [13, 18],
        [19, 15]
      ])
        P.set(x, y, C(ch));
      dot(P, 26, 9, 1.6, '#f0c83a');
    },
    bulbo: (c, l) => P => {
      paint2(P, I().ell(16, 22, 9, 7), R(c));
      for (const dx of [-4, 0, 4]) stem(P, 16 + dx * 0.5, 16, 16 + dx * 1.6, 4, l, 1.4);
      for (const [x, y] of [
        [9, 4],
        [16, 2],
        [23, 4]
      ])
        paint2(P, I().ell(x, y, 2.6, 1.6), R(l), { thin: 1, nc: 1 });
    },
    carciofo: (c, t) => P => {
      stem(P, 16, 30, 16, 22, '#5a7a4a', 1.4);
      for (let r = 0; r < 4; r++)
        for (let i = 0; i < 5; i++) {
          const x = 16 + (i - 2) * (9 - r * 2) * 0.5,
            y = 20 - r * 3.6;
          paint2(P, I().ell(x, y, 3, 3.4), R(r === 3 ? t : c), { mod: (X, Y, k) => (Y > y ? k - 1 : k) });
        }
    },
    testa: c => P => {
      paint2(P, I().ell(16, 18, 12, 11), R(c), {
        mod: (X, Y, t) => ((Math.abs(X - 16) + Y) % 7 === 0 ? t + 1 : t)
      });
      for (let a = 0; a < 5; a++)
        paint2(
          P,
          I().cap(16, 18, 16 + Math.cos(a * 1.25) * 9, 18 + Math.sin(a * 1.25) * 8, 0.5),
          R(shade(c, 0.25)),
          { thin: 1, nc: 1 }
        );
    },
    broccolo: c => P => {
      stem(P, 16, 30, 16, 18, '#6a9a4a', 2.4);
      for (const [x, y, r] of [
        [11, 13, 5],
        [21, 13, 5],
        [16, 9, 5.5],
        [16, 15, 5]
      ])
        paint2(P, I().ell(x, y, r, r - 0.6), R(c), {
          mod: (X, Y, t) => ((X * 3 + Y * 5) % 4 === 0 ? t + 1 : t)
        });
    },
    foglie: (c, gambo) => P => {
      for (const [x, a] of [
        [11, -0.35],
        [16, 0],
        [21, 0.35]
      ]) {
        paint2(P, I().rot(x, 13, 4.6, 10, a), R(c), {
          mod: (X, Y, t) => ((X + Y * 2) % 6 === 0 ? t - 1 : t)
        });
        stem(P, x - a * 4, 30, x + a * 8, 6, gambo, 0.6);
      }
    },
    gambi: c => P => {
      for (const dx of [-5, -1.5, 2, 5.5]) {
        paint2(P, I().cap(16 + dx * 0.6, 30, 16 + dx, 10, 1.8, 1.4), R(c), { thin: 1 });
        paint2(P, I().ell(16 + dx * 1.2, 7, 3.4, 2.6), R('#5a9a3a'), { thin: 1, nc: 1 });
      }
    },
    fiore: (c, ctr) => P => {
      stem(P, 16, 30, 16, 16);
      paint2(P, I().rot(12, 24, 4, 1.8, -0.5), R('#5a9a2a'), { thin: 1 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        paint2(P, I().rot(16 + Math.cos(a) * 5.4, 11 + Math.sin(a) * 5.4, 4.2, 2.6, a), R(c), { thin: 1 });
      }
      dot(P, 16, 11, 2.4, ctr);
    },
    tubero: c => P => {
      for (const [x, y, rx, ry, a] of [
        [12, 18, 7, 5, 0.4],
        [20, 15, 6, 4.4, -0.3],
        [17, 23, 5, 3.6, 0.1]
      ])
        paint2(P, I().rot(x, y, rx, ry, a), R(c), {
          mod: (X, Y, t) => ((X * 7 + Y * 3) % 9 === 0 ? t - 1 : t)
        });
    },
    bacche: (c, kind) => P => {
      if (kind !== 3) stem(P, 16, 4, 16, 14, '#5a4a2a');
      const pts = {
        1: [
          [13, 14],
          [19, 14],
          [16, 18],
          [12, 20],
          [20, 20],
          [16, 24],
          [16, 12]
        ],
        2: [
          [12, 15],
          [20, 15],
          [16, 20],
          [11, 22],
          [21, 22]
        ],
        3: [
          [11, 13],
          [19, 11],
          [14, 19],
          [22, 18],
          [17, 25],
          [9, 22]
        ],
        4: [
          [14, 12],
          [18, 12],
          [16, 15],
          [13, 18],
          [19, 18],
          [16, 21],
          [16, 24]
        ],
        5: [
          [12, 14],
          [20, 12],
          [16, 18],
          [21, 21],
          [11, 22],
          [17, 25]
        ]
      }[kind || 1];
      if (kind === 3 || kind === 5)
        for (const [x, y, a] of [
          [8, 9, -0.6],
          [24, 8, 0.6]
        ])
          paint2(P, I().rot(x, y, 5, 1.8, a), R(kind === 5 ? '#3a6a3a' : '#7a8a5a'), { thin: 1 });
      for (const [x, y] of pts) {
        dot(P, x, y, kind === 3 ? 2.4 : 2.2, c);
        P.set(x - 1, y - 1, C(shade(c, 0.5)));
      }
    },
    noce: c => P => {
      for (const [x, y, a] of [
        [11, 18, -0.5],
        [20, 14, 0.4],
        [18, 23, 1.2]
      ]) {
        paint2(P, I().rot(x, y, 6, 4, a), R(c));
        paint2(P, I().rot(x, y, 4, 1, a), R(shade(c, -0.2)), { thin: 1, nc: 1 });
      }
    },
    frutto: (c, chicchi) => P => {
      paint2(P, I().ell(16, 18, 11, 10.5), R(c), { mod: (X, Y, t) => (X < 12 && Y < 14 ? t + 1 : t) });
      paint2(P, I().rect(14, 5, 4, 4), R(chicchi ? '#c86a3a' : '#4a6a2a'), { thin: 1 });
      if (chicchi)
        for (const [x, y] of [
          [14, 15],
          [18, 17],
          [16, 21],
          [20, 21]
        ])
          P.set(x, y, C('#f8b0b8'));
      else paint2(P, I().rot(21, 6, 4, 1.8, 0.4), R('#4a8a2a'), { thin: 1 });
    },
    grappolo: c => P => {
      stem(P, 16, 3, 16, 8, '#6a4a2a');
      paint2(P, I().rot(22, 6, 5, 2.4, 0.3), R('#5a9a2a'), { thin: 1 });
      const pts = [
        [11, 11],
        [16, 11],
        [21, 11],
        [13, 15],
        [18, 15],
        [10, 15],
        [22, 15],
        [15, 19],
        [20, 19],
        [12, 19],
        [17, 23],
        [14, 26]
      ];
      for (const [x, y] of pts) {
        dot(P, x, y, 2.4, c);
        P.set(x - 1, y - 1, C(shade(c, 0.45)));
      }
    },
    fungo: (c, g) => P => {
      for (const [x, s] of [
        [11, 0.8],
        [20, 1]
      ]) {
        paint2(P, I().rect(x - 2, 18 - s * 2, 4, 10), R('#f0e0b8'), { thin: 1 });
        paint2(
          P,
          I().ell(x, 15 - s * 3, 7 * s, 5 * s, (X, Y) => Y <= 17 - s * 3),
          R(c),
          { mod: (X, Y, t) => ((X + Y) % 5 === 0 ? t + 1 : t) }
        );
        paint2(P, I().rect(x - 5 * s, 16 - s * 3, 10 * s, 1), R(g), { flat: 1, nc: 1 });
      }
    },
    spugnola: c => P => {
      for (const [x, s] of [
        [11, 0.85],
        [20, 1]
      ]) {
        paint2(P, I().rect(x - 2, 22, 4, 7), R('#f0e6c8'), { thin: 1 });
        paint2(P, I().ell(x, 15, 5 * s, 8 * s), R(c), {
          mod: (X, Y, t) => ((X * 3 + Y * 2) % 4 === 0 ? t - 2 : t)
        });
      }
    },
    pigna: c => P => {
      paint2(P, I().ell(16, 17, 8, 11), R(c), {
        mod: (X, Y, t) => ((X + Y) % 4 === 0 ? t - 1 : (X - Y) % 4 === 0 ? t + 1 : t)
      });
      for (const [x, y] of [
        [25, 23],
        [27, 26],
        [24, 27]
      ])
        paint2(P, I().ell(x, y, 1.6, 1), R('#f0e0c0'), { thin: 1 });
    },
    tartufo: c => P => {
      paint2(P, I().ell(16, 18, 10, 8.5), R(c), {
        mod: (X, Y, t) => ((X * 5 + Y * 7) % 6 === 0 ? t + 2 : (X + Y) % 3 === 0 ? t - 1 : t)
      });
      for (const [x, y] of [
        [8, 9],
        [24, 8],
        [20, 5]
      ])
        dot(P, x, y, 0.9, '#f0e8a0', { nc: 1 });
    },
    ombrella: c => P => {
      for (const dx of [-8, -4, 0, 4, 8]) stem(P, 16, 28, 16 + dx, 12, '#5a8a3a', 0.6);
      for (let i = 0; i < 18; i++) dot(P, 8 + (i % 9) * 2, 9 + ((i * 7) % 5), 1.3, c);
    }
  };
})();
function natIcon(spec) {
  const [k, ...a] = spec;
  return icon32(NAT_IC[k](...a));
}
// disegni della flora: icone, stadi delle piante, bustine, alberelli, piante selvatiche nel prato
Ext.on('arte', () => {
  try {
    // le piante dell'orto usano le forme già disegnate in contenuti.js (CART)
    for (const [id, g] of Object.entries(NAT_CROPS)) {
      const fr = g.fr;
      CART.DEF[id] = {
        k: g.k,
        c: {
          c: g.c,
          top: g.top
            ? P =>
                paint2(P, new MK2(32, 48).ell(16, 8, 5, 4.4), R6b(g.top), {
                  mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t)
                })
            : null,
          fruit: fr
            ? g.k === 'vine'
              ? P => paint2(P, new MK2(32, 48).rot(16, 38, 7, 2.6, -0.2), R6b(fr))
              : P => {
                  for (const [x, y] of [
                    [9, 22],
                    [22, 20],
                    [12, 30],
                    [21, 31],
                    [16, 26]
                  ])
                    paint2(P, new MK2(32, 48).ell(x, y, 1.6, 1.6), R6b(fr), { thin: 1 });
                }
            : null
        }
      };
    }
    const all = { ...NAT_CROPS, ...NAT_WILD_ITEMS };
    for (const [id, f] of Object.entries(NAT_FRUIT)) if (!f.esiste) all[id] = f;
    for (const [id, g] of Object.entries(all)) ICON[id] = natIcon(g.ic);
    for (const id of Object.keys(NAT_CROPS)) {
      const st = CART.stages(id);
      if (st) {
        CROPIMG[id] = st;
        CROPW[id] = st.map(wiltImg);
      }
      const pk = CART.packet(id),
        x = pk.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(ICON[id], 8, 6, 16, 16);
      ICON['s_' + id] = pk;
    }
    // alberelli
    for (const [id, f] of Object.entries(NAT_FRUIT))
      ICON['alb_' + f.t] = icon32(P => {
        paint2(P, new MK2(32, 32).rect(15, 14, 3, 16), R6b('#6a4428'), { thin: 1 });
        for (let i = 0; i < 6; i++)
          paint2(
            P,
            new MK2(32, 32).ell(16 + Math.cos(i * 1.05) * 6, 11 + Math.sin(i * 1.05) * 4.5, 4.6, 3.6),
            R6b(id === 'olive' ? (i % 2 ? '#8a9a6a' : '#6a7a5a') : i % 2 ? '#5a9a2a' : '#3f7a2a')
          );
        for (const [x, y] of [
          [12, 10],
          [20, 13],
          [17, 7]
        ])
          paint2(P, new MK2(32, 32).ell(x, y, 1.6, 1.6), R6b(f.c), { thin: 1, nc: 1 });
      });
    // conserve e succhi: il barattolo (già disegnato da genFarm2Art) con dentro il disegno del raccolto
    for (const id of Object.keys(all))
      for (const pre of ['cons_', 'succo_']) {
        const c = ICON[pre + id];
        if (!c || !ICON[id] || c._nat) continue;
        const x = c.getContext('2d');
        x.imageSmoothingEnabled = false;
        if (pre === 'succo_') x.drawImage(ICON[id], 9, 15, 14, 14);
        else x.drawImage(ICON[id], 8, 11, 14, 14);
        c._nat = 1;
      }
    // selvatici nel prato
    for (const id of Object.keys(NAT_WILD_ITEMS)) {
      const [c, x] = mk(24, 24);
      x.imageSmoothingEnabled = false;
      x.drawImage(ICON[id], 0, 0, 24, 24);
      c.s = 2;
      FREEIMG['w_' + id] = c;
    }
  } catch (e) {
    console.error(e);
  }
});
// le colture disegnate a mano (colture.pxs → colture_mano.js): 4 stadi ciascuna, la pianta secca e la zucca
// intagliata. Stanno qui, in fondo a natura_flora.js, perché prendano il posto anche delle colture di questo file. Sono a 1× (un pixel per unità di gioco): l'appassita si ricava qui, piegata di 2 verso terra.
function colturaAppassita(src) {
  const [c, x] = mk(src.width, src.height);
  x.drawImage(src, 0, 2);
  const d = x.getImageData(0, 0, c.width, c.height),
    a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const L = (a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11) / 255;
    a[i] = a[i] * 0.35 + 175 * L * 0.75;
    a[i + 1] = a[i + 1] * 0.35 + 130 * L * 0.75;
    a[i + 2] = a[i + 2] * 0.35 + 60 * L * 0.65;
  }
  x.putImageData(d, 0, 0);
  c.top = Math.min(c.height, (src.top || 0) + 2);
  return c;
}
Ext.on('arte', () => {
  const D = COLTURE_MANO,
    img = nome => {
      const c = daGriglia(D, nome);
      c.top = imgTop(c);
      return c;
    };
  const ids = [...new Set(Object.keys(D.sprite).map(n => n.replace(/\d+$/, '')))];
  for (const id of ids) {
    if (!CROPS[id]) continue;
    CROPIMG[id] = [0, 1, 2, 3].map(s => img(id + s));
    CROPW[id] = CROPIMG[id].map(colturaAppassita);
  }
  CROPIMG.dead = img('secca');
  CROPIMG.zuccaFace = img('zuccaFace');
});
