'use strict';
// ================= SEGRETI DELLA VALLE (gioco libero) =================
// 1) L'ALBERO DELLE TESTE, di notte. Finita la storia, l'Albero non ha smesso di contare. Ogni tanto, verso sera,
//    Tobia ti raggiunge e ti invita: stanotte, dopo le 23, al Varco. Tre notti, tre riti (st.free.segreti.albero):
//      · l'offerta — porta qualcosa di rosso; una testa ti racconta chi era;
//      · il conto  — le teste chiedono quante sono, e se ti conti con loro;
//      · il nome   — una voce ti chiama da dietro. Non girarti.
//    Le parole cambiano col finale: nel terzo l'Albero era stato bruciato… ed è ricresciuto.
// 2) CURIOSITÀ nuove (EGG_EXTRA, nel diario): il pozzo a mezzanotte, la lettera dietro il ritratto spostato, il
//    pendolo che batte otto colpi dopo l'una, il sasso che rimbalza nove volte, la pecora tinta di nero, il primo
//    sonno nel letto spostato.
// 3) ABITUDINI: qualche appuntamento fisso in più nella settimana di ognuno (coerente con chi è), e i GESTI: chi è
//    fermo vicino a te ogni tanto fa qualcosa (sbadiglia, si soffia sulle mani d'inverno, conta le monete…).

const segSt = () => {
  const F = G.st.free;
  const S = (F.segreti = F.segreti || {});
  S.albero = S.albero || { passo: 0, invito: null, ultima: -99 };
  S.una = S.una || {};
  return S;
};
const segQui = () => isFree(G.st) && !G.visit && G.st.free;
const segNotte = st => st.time >= 23 * 60 || st.time < 115; // dalle 23 all'1:55 (alle 2 si crolla dal sonno)
const segFinale = () => +G.st.free.ending || 1;

// ---------- le curiosità nuove (nel diario, con le altre) ----------
Object.assign(EGG_EXTRA, {
  albero_offerta: {
    t: 'Una testa che ricorda',
    lore: "Di notte, all'Albero, con un'offerta rossa: una delle teste ha raccontato chi era, prima. Aveva un nome, una bottega, una figlia.",
    dove: 'Quando Tobia ti invita, al Varco dopo le 23, con qualcosa di rosso.'
  },
  albero_conto: {
    t: 'Il conto delle teste',
    lore: 'Le teste sono otto. Lo sanno anche le galline di Tobia. Ti hanno chiesto se volevi essere la nona.',
    dove: "La seconda notte all'Albero."
  },
  albero_nome: {
    t: 'La voce dietro di te',
    lore: 'Una voce, nel bosco, ti ha chiamato con il nome del nonno. Non ti sei girat{o|a}.',
    dove: "La terza notte all'Albero: qualunque cosa senti, non girarti."
  },
  pozzo_notte: {
    t: 'Il nome al contrario',
    lore: 'A mezzanotte, dal fondo del pozzo, una voce ripete il tuo nome al contrario. Senza sbagliare una lettera.',
    dove: 'Il pozzo, fra la mezzanotte e l’una.'
  },
  lettera_ritratto: {
    t: 'Dietro il ritratto',
    lore: 'Spostando il ritratto del nonno è caduta una busta: «Per quando avrai spostato tutto.»',
    dove: 'Sposta il ritratto del nonno dalla parete dov’era, poi guardalo.'
  },
  pendolo_otto: {
    t: 'Otto colpi',
    lore: "Dopo l'una di notte il pendolo ha battuto otto colpi. Poi un nono, piano, come per non svegliare nessuno.",
    dove: "L'orologio a pendolo, poco dopo l'una."
  },
  sasso_nove: {
    t: "Sull'altra riva",
    lore: 'Nove rimbalzi. Il sasso è arrivato all’altra riva, e una figura col mantello giallo l’ha raccolto.',
    dove: 'I sassi piatti sul fiume: nove rimbalzi.'
  },
  pecora_nera: {
    t: 'Una pecora del bosco',
    lore: 'La pecora tinta di nero si è fermata a guardare il bosco. Per un attimo, il bosco ha guardato lei.',
    dove: 'Tingi di nero una pecora.'
  },
  letto_nuovo: {
    t: 'Il sonno in un posto nuovo',
    lore: 'La prima notte col letto spostato hai sognato il nonno che lo cercava al buio, ridendo piano.',
    dove: 'Sposta il letto del nonno e dormici.'
  }
});
async function segEgg(id, righe) {
  const F = G.st.flags;
  if (F['egg_' + id]) return false;
  G.cut++;
  try {
    for (const r of righe) await narr(r, { dark: 1 });
    await eggFound(id);
  } finally {
    G.cut--;
  }
  return true;
}

// ================= 1) L'ALBERO DELLE TESTE =================
const SEG_INVITO = [
  {
    1: [
      'Hihi. {n}. Stanotte l’Albero conta. Conta anche te, se vieni.',
      'Porta qualcosa di rosso. Rosso come il nastro. Al Varco, quando la campana ha smesso. Hihi.'
    ],
    2: [
      'Hihi. Cavaliere. Stanotte l’Albero ti chiama. Ti chiama sempre, ma stanotte forte.',
      'Porta qualcosa di rosso. Al Varco, dopo le undici. Il mantello lascialo a casa. Hihi.'
    ],
    3: [
      'Hihi. L’Albero l’hanno bruciato. Ma io stanotte l’ho sentito respirare.',
      'È ricresciuto, {n}. Le teste anche. Porta qualcosa di rosso, al Varco, dopo le undici. Non dirlo al Vecchio.'
    ]
  },
  {
    0: [
      'Sei tornat{o|a} con la testa attaccata. Hihi. Brav{o|a}.',
      'Stanotte le teste vogliono sapere se sai contare. Al Varco, dopo le undici. Conta bene. Io conto le galline.'
    ]
  },
  {
    0: [
      'L’ultima volta, {n}. Te lo prometto. Hihi. Forse.',
      'Stanotte qualcuno ti chiama per nome. Non è la mia voce. Non girarti. Mai. Neanche se ti chiama con la voce del nonno.'
    ]
  }
];
const SEG_ROSSI = [
  'nastro',
  'lana_rosso',
  'colorante_rosso',
  'pomodoro',
  'fragola',
  'ciliegie',
  'melograno',
  'peperoncino',
  'barbabietola',
  'cinorrodi',
  'lamponi',
  'mela'
];
const segInvitoAttivo = st => {
  const A = st.free.segreti && st.free.segreti.albero;
  return !!(A && A.invito === st.day && A.passo < 3);
};
// Tobia ti raggiunge, verso sera
let SEG_T = 30;
async function segInvita(n) {
  const st = G.st,
    A = segSt().albero;
  G.cut++;
  n.script = true;
  try {
    const p = G.player,
      [px, py] = ptile(p);
    const dove = [
      [px + 1, py],
      [px - 1, py],
      [px, py + 1]
    ].find(([x, y]) => !G.map.solid(x, y) && !G.map.objAt(x, y));
    if (dove) {
      await Promise.race([walkNPC(n, dove[0], dove[1], null), sleep(6000)]);
      n.path = [];
    }
    n.dir = [3, 2, 1, 0][p.dir];
    p.dir = Math.abs(n.x - p.x) > Math.abs(n.y - p.y) ? (n.x < p.x ? 1 : 2) : n.y < p.y ? 3 : 0;
    AU.play('whisper');
    const L = SEG_INVITO[A.passo],
      righe = L[segFinale()] || L[1] || L[0];
    for (const r of righe) await say('tobia', r, 'dark');
    A.invito = st.day;
    UI.toast('Tobia ti ha dato appuntamento: stanotte, dopo le 23, al Varco.');
  } finally {
    n.script = false;
    n.goal = null;
    G.cut--;
  }
}
Ext.on('mpTick', dt => {
  if (!segQui()) return;
  SEG_T -= dt;
  if (SEG_T > 0) return;
  SEG_T = 5;
  const st = G.st,
    A = segSt().albero;
  if (G.mode !== 'game' || G.cut || UI.busy() || !G.map || G.map.id !== 'main') return;
  if (typeof SVAGO !== 'undefined' && (SVAGO.busy || SVAGO.gioco)) return;
  if (A.passo >= 3 || A.invito === st.day || st.day < st.free.start + 6 || st.day - A.ultima < 3) return;
  if (st.time < 17 * 60 || st.time >= 21 * 60 || (typeof festLive === 'function' && festLive(st))) return;
  const n = NPC('tobia');
  if (!n || n.hidden || n.script || n.map !== 'main') return;
  if (Math.hypot(n.x - G.player.x, n.y - G.player.y) > 220 || Math.random() > 0.2) return;
  segInvita(n).catch(e => segnala(e, 'segreti'));
});
// il Varco, di notte, con l'invito
{
  const orig = ACT.varco;
  ACT.varco = async o => {
    const st = G.st;
    if (!segQui() || !segInvitoAttivo(st)) return orig(o);
    if (!segNotte(st))
      return narr('Il Varco. Tobia ha detto dopo le undici. Il bosco aspetta il suo orario, come tutti.');
    AU.play('whisper');
    const c = await ask(
      null,
      'Il Varco è aperto. Dal bosco arriva un sussurro che conta: «…uno… due… tre…» e ricomincia.',
      ['Entra nel bosco', 'Torna a casa']
    );
    if (c !== 0) return;
    await goMap('wood', 15, 41, 3);
    UI.toast('Il sentiero sale verso la radura. L’Albero è là in fondo.');
  };
}
// nel bosco: arrivati alla radura, il rito
Ext.on('mpTick', () => {
  const st = G.st;
  if (!segQui() || !G.map || G.map.id !== 'wood' || G.cut || UI.busy() || G.mode !== 'game') return;
  if (!segInvitoAttivo(st) || segSt().albero.rito) return;
  if (ptile(G.player)[1] > 9) return;
  segRito().catch(e => segnala(e, 'segreti'));
});
{
  const orig = ACT.albero;
  ACT.albero = o => (segQui() && segInvitoAttivo(G.st) && !segSt().albero.rito ? segRito() : orig(o));
}
async function segFuga(testo) {
  AU.play('scream');
  G.shake = 7;
  G.glitch = 8;
  await narr(testo, { dark: 1 });
  await UI.fade(1, 500);
  await goMap('main', 30, 5, 0);
  await UI.fade(0, 600);
}
async function segSveglia(testo) {
  // ti svegli a casa, all'alba, con la terra rossa nelle scarpe
  await UI.fade(1, 700);
  G.st.energy = Math.min(G.st.energy, 25);
  await endDay(true, true);
  await sleep(400);
  UI.toast(testo);
}
async function segRito() {
  const st = G.st,
    A = segSt().albero,
    fin = segFinale();
  A.rito = 1;
  G.cut++;
  try {
    G.cutMusic = 'silent';
    await walkPlayer(15, 8);
    G.player.dir = 3;
    AU.play('whisper');
    G.glitch = 6;
    if (A.passo === 0) {
      await narr(
        fin === 3
          ? "La radura. Dove c'era l'Albero bruciato, l'Albero c'è di nuovo. Più piccolo, più rosso. Non doveva ricrescere."
          : "La radura. L'Albero è lì, nero contro il nero. Le radici rosse si muovono piano, come chi respira nel sonno.",
        { dark: 1 }
      );
      await narr('Fra le radici, le teste. Aprono gli occhi tutte insieme. Ti guardano le mani.', {
        dark: 1
      });
      const rossi = SEG_ROSSI.filter(id => ITEMS[id] && countItem(id) > 0);
      if (!rossi.length) {
        A.invito = null;
        A.ultima = st.day;
        await say('coro', '…niente di rosso… niente di rosso… allora sei tu, il rosso…', null, { dark: 1 });
        return segFuga('Le radici ti afferrano le caviglie. Strappi via una scarpa e corri. Corri.');
      }
      const c = await ask(
        null,
        'Cosa lasci fra le radici?',
        rossi.slice(0, 5).map(id => ITEMS[id].n),
        'dark'
      );
      const id = rossi[c] || rossi[0];
      removeItem(id, 1);
      await narr(
        `Appoggi ${ITEMS[id].n.toLowerCase()} fra le radici. Le radici si chiudono sopra come dita. Le teste tacciono.`,
        {
          dark: 1
        }
      );
      const T = svCasoSeg([
        [
          'Mi chiamavo Bartolo. Vendevo ombrelli, di paese in paese.',
          'Arrivai con la pioggia e mi dissero: resta finché smette. Non ha mai smesso.',
          'Ho una figlia a Valdorso. Ha i capelli rossi. Se la vedi… non dirle niente. Lasciala sperare.'
        ],
        [
          'Io ero la maestra. Venni a insegnare a leggere ai bambini della Valle.',
          'Il primo giorno un bambino scrisse il mio nome sulla lavagna. Poi lo cancellò. Poi mi contarono.',
          'Insegna tu a leggere a qualcuno, forestier{o|a}. Le parole sono l’unica cosa che l’Albero non digerisce.'
        ]
      ]);
      for (const r of T) await say('coro', r, null, { dark: 1 });
      giveItem('seme_rosso', 1);
      A.passo = 1;
      await segEgg('albero_offerta', ['Quando ti volti per andare, le teste hanno già chiuso gli occhi.']);
    } else if (A.passo === 1) {
      await narr(
        fin === 2
          ? 'Le teste ti salutano come si saluta un padrone. «Cavaliere», sussurrano. Poi cominciano a contare.'
          : 'Le teste cominciano a contare. Una dopo l’altra, ognuna dice un numero. Si fermano davanti a te.',
        { dark: 1 }
      );
      const c = await ask('coro', '…quante siamo?…', ['Sette', 'Otto', 'Nove', 'Non lo so'], 'dark');
      if (c !== 1) {
        A.invito = null;
        A.ultima = st.day;
        await say('coro', '…sbagliato… sbagliato… conta meglio, la prossima volta… se c’è…', null, {
          dark: 1
        });
        G.glitch = 14;
        AU.play('scream');
        return segSveglia(
          'Ti svegli nel letto, vestit{o|a}. Le scarpe sono piene di terra rossa. Non ricordi la strada.'
        );
      }
      await say('coro', '…otto… otto… brav{o|a}… e con te?…', null, { dark: 1 });
      const d = await ask(null, 'Con te, quante sono?', ['Nove', 'Otto: io non resto'], 'dark');
      if (d === 0) {
        await say('coro', '…nove… nove… allora ti teniamo un posto… quando sarà il momento…', null, {
          dark: 1
        });
        await narr(
          'Una radice ti sfiora la mano, gentile. Sotto, nella terra, qualcosa luccica: monete vecchie, tante.',
          {
            dark: 1
          }
        );
        G.st.money += 333;
        UI.toast('Sotto la radice: 333 monete vecchie. I morti pagano in anticipo.');
      } else {
        await say('coro', '…otto… otto… allora vai… ma il conto resta aperto…', null, { dark: 1 });
        await narr(
          'Le radici si ritirano. Per terra resta una scheggia rossa di corteccia, calda come una mano.',
          { dark: 1 }
        );
        giveItem('scheggia_albero', 1);
      }
      A.passo = 2;
      await segEgg('albero_conto', []);
    } else {
      await narr('Silenzio. Le teste hanno gli occhi chiusi. Il bosco trattiene il fiato.', { dark: 1 });
      AU.play('hooves');
      G.shake = 2;
      await say('elias', '…{n}…', null, { dark: 1 });
      await say('elias', '{n}, sono io. Girati. Fatti vedere. Sei cresciut{o|a}?', null, { dark: 1 });
      const c = await ask(
        null,
        'La voce viene da dietro, a un passo. È la voce del nonno.',
        ['Non girarti', 'Girati'],
        'dark'
      );
      if (c === 1) {
        A.invito = null;
        A.ultima = st.day;
        G.player.dir = 0;
        G.scare = 1.4;
        AU.play('scream');
        G.shake = 9;
        await narr(
          'Dietro di te c’è il corpo nel mantello nero, seduto. Non ha la testa. Ti indica il petto.',
          { dark: 1 }
        );
        return segSveglia(
          'Ti svegli nel letto, con il cuore che batte forte. Fuori, per un attimo, senti gli zoccoli.'
        );
      }
      await narr('Non ti giri. Stringi i pugni. La voce aspetta, poi ride piano, una risata che conosci.', {
        dark: 1
      });
      await say(
        'elias',
        fin === 2
          ? 'Brav{o|a}. Porti il mio mantello e non ti giri. Sei meglio di me.'
          : 'Brav{o|a}. Così si fa. Non girarti mai, nemmeno per me.',
        null,
        { dark: 1 }
      );
      await say(
        'elias',
        'Ti lascio una cosa che era mia. Non serve a niente. Le cose dei nonni non servono: si tengono.',
        null,
        {
          dark: 1
        }
      );
      const O = avOwn(G.st);
      O.hat.tricorn = 1;
      O.col.ombra = 1;
      await narr('Quando la voce tace, ai tuoi piedi c’è un tricorno nero, consumato, con una piuma rossa.', {
        dark: 1
      });
      UI.toast('Nuovo cappello: il tricorno del Cavaliere (e il colore nero d’ombra). Da ☰ → Aspetto.');
      A.passo = 3;
      await segEgg('albero_nome', []);
    }
    A.invito = null;
    A.ultima = st.day;
    await UI.fade(1, 500);
    await goMap('main', 30, 5, 0);
    await UI.fade(0, 600);
  } finally {
    A.rito = 0;
    G.cutMusic = null;
    G.cut--;
  }
}
const svCasoSeg = L => L[Math.floor(Math.random() * L.length)];
CAPPELLI.tricorn = 'Tricorno del Cavaliere';
Object.assign(ITEMS, {
  seme_rosso: {
    n: 'Seme rosso',
    t: 'res',
    premio: 1, // si ha solo dall'Albero, di notte
    v: 0,
    d: 'Caldo come una brace. Non si pianta: dicono che, piantato, crescerebbe un Albero. Si tiene.'
  },
  scheggia_albero: {
    n: "Scheggia dell'Albero",
    t: 'res',
    premio: 1,
    v: 0,
    d: 'Corteccia rossa, tiepida. Di notte, se la stringi, senti contare.'
  }
});
Ext.on('arte', () => {
  for (const [id, a, b] of [
    ['seme_rosso', '#a01e14', '#ff6a4a'],
    ['scheggia_albero', '#5a1410', '#c8302a']
  ]) {
    const [c, x] = mk(32, 32);
    x.fillStyle = '#1a0806';
    if (id === 'seme_rosso') {
      x.fillRect(11, 9, 10, 15);
      x.fillRect(9, 12, 14, 9);
      x.fillStyle = a;
      x.fillRect(12, 10, 8, 13);
      x.fillRect(10, 13, 12, 7);
      x.fillStyle = b;
      x.fillRect(13, 12, 2, 4);
    } else {
      x.fillRect(8, 8, 6, 18);
      x.fillRect(12, 6, 10, 20);
      x.fillStyle = a;
      x.fillRect(13, 7, 8, 18);
      x.fillStyle = b;
      x.fillRect(15, 9, 2, 12);
      x.fillRect(18, 12, 1, 9);
    }
    ICON[id] = c;
  }
});

// ================= 2) LE CURIOSITÀ =================
// il pozzo a mezzanotte
{
  const orig = ACT.well;
  ACT.well = async o => {
    const st = G.st;
    if (segQui() && st.time < 60 && !st.flags.egg_pozzo_notte) {
      const rev = String(st.name || 'forestiero')
        .split('')
        .reverse()
        .join('')
        .toLowerCase();
      AU.play('whisper');
      return segEgg('pozzo_notte', [
        'Ti sporgi sul pozzo. Dal fondo, una voce bagnata ripete una parola, piano, tre volte.',
        `«${rev}… ${rev}… ${rev}…»`,
        'È il tuo nome. Al contrario. Senza sbagliare una lettera.'
      ]);
    }
    return orig(o);
  };
}
// la lettera dietro il ritratto (solo se l'hai spostato dalla parete di sempre)
Ext.on('arredo', o => {
  if (o.fid !== 'ritratto_nonno' || !segQui() || G.st.flags.egg_lettera_ritratto || o.fk === '3,1')
    return false;
  (async () => {
    G.cut++;
    try {
      AU.play('page');
      await UI.paper(
        `<h2>Dietro il ritratto</h2><div class="paper"><p><i>Una busta gialla, incollata dietro la cornice. Sopra: «Per quando avrai spostato tutto.»</i></p><p>Allora l'hai fatto. Hai preso la mia casa e l'hai rigirata come un guanto. Brav{o|a}.</p><p>Io non ho mai spostato niente. Il letto dov'era mio padre, il tavolo dove mangiava mia madre. Pensavo che se avessi spostato qualcosa, i morti non avrebbero più trovato la strada.</p><p>Sbagliavo. I morti la strada la trovano lo stesso. Sono i vivi che si perdono, se tutto resta fermo.</p><p class="ink">Metti il letto dove vedi la finestra. La mattina, la luce sveglia meglio di qualunque gallo. — E.</p></div>`
      );
      await eggFound('lettera_ritratto');
    } finally {
      G.cut--;
    }
  })();
  return true;
});
// il pendolo dopo l'una
Ext.on('arredo', o => {
  const st = G.st;
  if (o.fid !== 'pendolo' || !segQui() || st.flags.egg_pendolo_otto || st.time < 60 || st.time >= 75)
    return false;
  (async () => {
    for (let i = 0; i < 8; i++) {
      AU.play('rintocco');
      await sleep(520);
    }
    await sleep(900);
    AU.play('rintocco', 0.3);
    await segEgg('pendolo_otto', [
      'Otto colpi. Poi, dopo un attimo, un nono. Piano piano, come per non svegliare nessuno.'
    ]);
  })();
  return true;
});
// il sasso che arriva all'altra riva
Ext.on('sassi', n => {
  if (n >= 9 && segQui())
    setTimeout(
      () =>
        segEgg('sasso_nove', [
          'Il sasso arriva fino all’altra riva. Lì, fra le canne, una figura col mantello giallo si china, lo raccoglie.',
          'Alza la mano, come per salutarti. Quando sbatti le palpebre, non c’è più.'
        ]),
      1800
    );
});
// la pecora tinta di nero
{
  // si guarda il gregge ogni tanto: la prima pecora nera
  let T = 3;
  Ext.on('mpTick', dt => {
    T -= dt;
    if (T > 0) return;
    T = 3;
    const st = G.st;
    if (!segQui() || st.flags.egg_pecora_nera || G.cut || UI.busy() || G.mode !== 'game') return;
    if (!(st.free.animals || []).some(a => a.colore === 'nero')) return;
    segEgg('pecora_nera', [
      'La pecora tinta di nero smette di brucare. Alza la testa verso il bosco, immobile.',
      'Per un attimo, dal bosco, qualcosa alza la testa verso di lei.'
    ]).catch(e => segnala(e, 'segreti'));
  });
}
// il primo sonno nel letto spostato (la mattina dopo)
Ext.on('freeMorning', st => {
  if (!st || !isFree(st) || G.visit || st.flags.egg_letto_nuovo) return;
  const I = st.free.inside || {};
  const k = Object.keys(I).find(k => I[k].id === 'letto_nonno');
  if (!k || k === '1,3') return;
  setTimeout(() => {
    if (G.mode === 'game')
      segEgg('letto_nuovo', [
        'Stanotte hai dormito in un punto nuovo della casa.',
        'Hai sognato il nonno che cercava il suo letto al buio, a tentoni, e quando l’ha trovato rideva piano.'
      ]).catch(e => segnala(e, 'segreti'));
  }, 2500);
});

// ================= 3) ABITUDINI E GESTI =================
// qualche appuntamento fisso nella settimana (0 lunedì … 6 domenica), prima delle altre giornate
const SEG_ABITUDINI = {
  ezekiel: [[3, 9 * 60, 10 * 60 + 30, 45, 20, 0, 'feed']], // il giovedì dà le briciole ai piccioni in piazza
  agatha: [[0, 7 * 60 + 30, 8 * 60, 49, 22, 3, 'sweep']], // il lunedì scopa davanti al banco
  brom: [[2, 12 * 60, 12 * 60 + 45, 38, 24, 3, 'repair']], // il mercoledì aggiusta il lampione
  lucius: [[5, 9 * 60, 10 * 60 + 30, 53, 11, 3, 'tend']], // il sabato cura le tombe
  clara: [[1, 15 * 60, 16 * 60, 33, 22, 0, 'flowers']], // il martedì raccoglie fiori per il forno
  tobia: [[-1, 17 * 60, 18 * 60, 22, 30, 0, 'play']] // ogni sera rincorre le galline
};
function segAbitudine(id, st) {
  const L = SEG_ABITUDINI[id];
  if (!L || !isFree(st) || G.visit) return undefined;
  if (st.weather === 'pioggia' || st.weather === 'temporale') return undefined;
  const d = WD(st),
    t = st.time;
  for (const [g, a, b, x, y, dir, act] of L)
    if ((g < 0 || g === d) && t >= a && t < b) return at(x, y, dir, act, 1);
  return undefined;
}
for (const id of Object.keys(SEG_ABITUDINI)) {
  const orig = SCHED[id];
  if (typeof orig !== 'function') continue;
  SCHED[id] = function (st) {
    const r = segAbitudine(id, st);
    return r !== undefined ? r : orig(st);
  };
}
// i gesti: chi è fermo vicino a te ogni tanto fa qualcosa di suo (coerente con chi è, l'ora e la stagione)
const SEG_GESTI = {
  ezekiel: [
    { t: '*si appoggia al bastone*' },
    { t: '*sbadiglia*', se: st => st.time >= 20 * 60, fx: 'zzz' },
    { t: '*conta le rondini*', se: st => seasonOf(st) === 2 },
    { t: '*sbriciola il pane*', act: 'feed', fx: 'briciole' },
    { t: '*si soffia sulle mani*', se: st => seasonOf(st) === 1, fx: 'fiato' }
  ],
  agatha: [
    { t: '*conta le monete*', fx: 'monete' },
    { t: '*si sistema lo scialle*' },
    { t: '*canticchia*', fx: 'note' },
    { t: '*sventola il ventaglio*', se: st => seasonOf(st) === 3 },
    { t: '*spazza con energia*', act: 'sweep', fx: 'polvere' }
  ],
  brom: [
    { t: 'Mh.' },
    { t: '*si asciuga la fronte*', se: st => seasonOf(st) === 3 || G.st.time < 17 * 60, fx: 'sudore' },
    { t: '*si scrocchia le dita*' },
    { t: '*batte il martello*', act: 'repair', fx: 'scintille' },
    { t: '*fiato che fuma*', se: st => seasonOf(st) === 1, fx: 'fiato' }
  ],
  lucius: [
    { t: '*sgrana il rosario*' },
    { t: '*guarda il cielo*' },
    { t: '*sistema un fiore sulla tomba*', act: 'tend', fx: 'petali' },
    { t: '*sospira*' }
  ],
  clara: [
    { t: '*si spolvera la farina*', fx: 'farina' },
    { t: '*fa una giravolta*', fx: 'giro' },
    { t: '*annusa un fiore*', act: 'flowers', fx: 'petali' },
    { t: '*sbadiglia: si alza alle quattro*', se: st => st.time < 9 * 60, fx: 'zzz' },
    { t: '*acchiappa un fiocco di neve*', se: st => st.weather === 'neve', fx: 'fiato' }
  ],
  tobia: [
    { t: 'Hihi.', fx: 'salto' },
    { t: '*conta sulle dita, fino a otto*' },
    { t: '*fa coccodè*', act: 'play', fx: 'salto' },
    { t: '*guarda il bosco*', se: st => st.time >= 19 * 60 }
  ],
  ingegnere: [{ t: '*carica il passerotto*' }, { t: '*prende appunti*' }, { t: '*ascolta un ingranaggio*' }],
  _: [{ t: '*si stiracchia*' }, { t: '*si guarda intorno*' }]
};
let SEG_GT = 8;
Ext.on('mpTick', dt => {
  SEG_GT -= dt;
  if (SEG_GT > 0) return;
  SEG_GT = 6 + Math.random() * 6;
  segGesto();
});
// un gesto di qualcuno fermo vicino a te (restituisce chi l'ha fatto)
function segGesto() {
  const st = G.st;
  if (!segQui() || !G.map || G.map.id !== 'main' || G.cut || UI.busy() || G.mode !== 'game') return;
  const p = G.player,
    vicini = G.npcs.filter(
      n =>
        !n.hidden &&
        !n.script &&
        n.map === 'main' &&
        !n.moving &&
        !(n.path && n.path.length) &&
        (n.barkT || 0) <= 0 &&
        Math.hypot(n.x - p.x, n.y - p.y) < 150
    );
  if (!vicini.length) return;
  const n = vicini[Math.floor(Math.random() * vicini.length)],
    L = (SEG_GESTI[n.id] || SEG_GESTI._).filter(g => (!g.se || g.se(st)) && (!g.act || g.act === n.act));
  // le attività hanno la precedenza: chi scopa, scopa
  const conAtt = L.filter(g => g.act),
    pool = conAtt.length && Math.random() < 0.7 ? conAtt : L,
    g = pool[Math.floor(Math.random() * pool.length)];
  if (!g) return;
  bubble(n, g.t, 1.8);
  n.barkT = Math.max(n.barkT || 0, 8);
  segFx(n, g.fx);
  return n;
}
function segFx(n, fx) {
  const X = n.x,
    Y = n.y;
  if (!fx) return;
  const col = {
    fiato: '#e8f0f4',
    sudore: '#9ad0f0',
    monete: '#f6d04a',
    note: '#f6d98a',
    briciole: '#d8b878',
    polvere: '#a89878',
    scintille: '#ffb040',
    petali: '#f0a0c0',
    farina: '#f4f0e8',
    zzz: '#c8d8f0'
  }[fx];
  if (fx === 'salto') {
    n.y -= 4;
    setTimeout(() => (n.y += 4), 160);
    return;
  }
  if (fx === 'giro') {
    let k = 0;
    const iv = setInterval(() => {
      n.dir = [0, 2, 3, 1][k++ % 4];
      if (k > 4) clearInterval(iv);
    }, 110);
    return;
  }
  if (fx === 'zzz' || fx === 'note') {
    floatText(fx === 'zzz' ? 'z' : '♪', X + 6, Y - 30, col);
    setTimeout(() => floatText(fx === 'zzz' ? 'Z' : '♫', X + 9, Y - 36, col), 350);
    return;
  }
  if (fx === 'scintille') AU.play('martello', 0.5);
  burst(
    fx === 'scintille' ? 'spark' : 'dust',
    X + (n.dir === 1 ? -6 : n.dir === 2 ? 6 : 0),
    Y - (fx === 'fiato' || fx === 'sudore' ? 22 : 6),
    5,
    col
  );
}
