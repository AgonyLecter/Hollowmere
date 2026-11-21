'use strict';
// ================= BUSSARE ALLE PORTE =================
// Quando un abitante è in casa (il suo orario dice «niente», quindi è dentro) si può bussare alla sua porta:
// se ha voglia esce e parla, se no te lo grida da dietro la porta, ogni volta con parole diverse. Se non c'è,
// sulla porta trovi un biglietto o un indizio su dove sia. Di notte, nella storia, vale la Regola III: non si apre.
// Le battute sono dati (BUSSA_TESTI): per un abitante nuovo basta aggiungere la sua voce, gli altri usano «_».
// Qui c'è anche Porte.dove(id): dove si trova adesso un abitante (lo usa il taccuino degli abitanti).

const BUSSA_TESTI = {
  ezekiel: {
    apre: [
      "Ah, sei tu. Aspetta, esco io: in casa c'è troppo silenzio per parlare.",
      'Bussi come bussava tuo nonno. Tre colpi, piano. Dimmi.',
      'Sì, sì, arrivo. Alla mia età la porta pesa più di me.',
      'Hai fatto bene a bussare. Chi entra senza bussare, qui, di solito non esce.'
    ],
    no: [
      'Non adesso, {n}! Sto scrivendo il Registro. Passa più tardi.',
      'Più tardi! Ho le ossa che chiedono una sedia.',
      "Il Consiglio non riceve a quest'ora. Nemmeno il Consiglio di un vecchio solo. Torna dopo.",
      'Sto contando. Se mi interrompi devo ricominciare da capo. Vai, vai, passa più avanti.',
      'Torna più tardi, {n}. Ho chiuso gli occhi un momento e non li ho ancora riaperti.'
    ],
    dorme: [
      '…chi è? Sono le ore dei morti, {n}. Torna con la luce.',
      'Non apro. Non apro mai di notte, lo sai. Nemmeno a te.',
      '…domattina. Domattina, {n}.'
    ],
    ancora: [
      'Di nuovo? La mia porta non è la campana della cappella.',
      'Ho sentito anche la prima volta, {n}.',
      'Se bussi ancora, ti scrivo nel Registro. Alla voce «seccatori».'
    ],
    regola: [
      'Dopo la campana delle nove non si apre. A nessuno. Vai a casa, {n}. Adesso.',
      'Non sei tu. Non posso sapere se sei tu. Vai via.',
      'Torna a casa. Chiudi a chiave. E stanotte non bussare più a nessuna porta.'
    ]
  },
  agatha: {
    apre: [
      'Tesoro! Arrivo, arrivo, il tempo di togliermi il grembiule.',
      "Ma guarda chi c'è. Esco io, che in casa ho tutto in disordine.",
      'Hai bussato tu? Pensavo fosse il vento. Il vento, qui, bussa spesso.',
      'Eccomi! A casa non si compra niente, eh. Però si chiacchiera.'
    ],
    no: [
      'Il negozio è chiuso, tesoro! Ripassa al banco, più tardi!',
      'Non sono vestita! Passa più tardi, per carità!',
      'Sto facendo i conti, e se mi distrai sbaglio a mio favore. Più tardi!',
      'Ho le mani in pasta, letteralmente! Torna dopo, cara anima!',
      'Più tardi, più tardi! Sto riposando gli occhi. Tutti e due.'
    ],
    dorme: [
      'Tesoro, è notte fonda! Vai a dormire!',
      "Chi è a quest'ora? …Ah. Domani. Domani ti faccio lo sconto, ma adesso va' a letto.",
      'Non apro, non apro! Alla mia età di notte si apre solo un occhio.'
    ],
    ancora: [
      'Ancora tu? Ti ho detto più tardi, tesoro, non più forte!',
      'Se bussi ancora ti faccio pagare la porta.',
      'Lo so che sei tu: ti riconosco dal bussare impaziente.'
    ],
    regola: [
      'Non posso aprire, tesoro. Lo sai. Nessuno può.',
      'Vai a casa. Ti prego. Se ti sentono bussare, ti contano.',
      "…non ci sono. Non c'è nessuno. Vai via, vai via."
    ]
  },
  lucius: {
    apre: [
      "La pace sia con te. Anche a quest'ora.",
      'Il bussare è una preghiera breve. Eccomi.',
      'Chi bussa trova. Così dicono. Dimmi, {n}.'
    ],
    no: [
      'Sto pregando, {n}. Torna quando suona la campana.',
      'Non adesso. Sto accordando la campana: è stonata da duecento anni.',
      'La cappella è chiusa per raccoglimento. Il mio, soprattutto. Più tardi.',
      'Torna più tardi, figliol{o|a}. Il Signore ha pazienza. Io meno.'
    ],
    dorme: [
      "La cappella è chiusa. Anche Dio, di notte, ha diritto a un po' di silenzio.",
      '…otto. Chi è? No. Non apro. Domani.',
      'Vai a dormire, {n}. Ti ricorderò nelle preghiere della notte.'
    ],
    ancora: [
      'Ho sentito, {n}. Il primo colpo. E anche il secondo.',
      "La pazienza è una virtù. Esercitala davanti a un'altra porta.",
      'Bussate e vi sarà aperto. Ma non oggi.'
    ],
    regola: [
      'La cappella è sbarrata. Da dentro. Lo è sempre, dopo le nove.',
      '…sei, sette, otto. Otto. Vai via, chiunque tu sia.',
      'Non apro, {n}. Se sei {n}.'
    ]
  },
  clara: {
    apre: [
      '{n}! Che bello. Esco subito, aspetta che spengo il forno.',
      'Ti ho visto dalla finestra. Speravo che bussassi.',
      'Sapevo che eri tu. Bussi gentile.',
      'Aspetta, porto fuori due sedie. Si sta meglio, qui sulla soglia.'
    ],
    no: [
      'Scusa, {n}, sto impastando! Passa più tardi, ti tengo da parte un pezzo di pane.',
      "Non posso, adesso! Ho il forno acceso. Torni fra un po'?",
      'Sto riposando un momento… Passi dopo? Mi fa piacere, davvero.',
      'Più tardi! Sono tutta infarinata, sembro un fantasma.'
    ],
    dorme: [
      '{n}? È tardissimo… Domattina, va bene? Domattina.',
      'Dormivo. Sognavo la strada asfaltata. Torna domani.',
      'Non posso aprire di notte, lo sai. Ma sono contenta che tu sia lì. Buonanotte.'
    ],
    ancora: [
      'Ho sentito, {n}! Arrivo… no, aspetta, non posso. Più tardi!',
      "Sei impaziente come il lievito d'estate.",
      'Ancora? Mi fai ridere. Ma più tardi.'
    ],
    regola: [
      '{n}, non bussare. Ti prego. Vai a casa e chiudi.',
      'Non posso aprirti. Le regole… Se ti succede qualcosa, io…',
      'La lanterna. Accendi la lanterna e vai a casa. Ora.'
    ]
  },
  brom: {
    apre: [
      "Mh. Sì? Esco io, che dentro c'è ancora fumo.",
      'Ah, sei tu. Pensavo fosse un cliente.',
      'La porta la apro solo a chi bussa forte. Tu bussi forte. Dimmi.'
    ],
    no: [
      'Sto mangiando! Torna dopo!',
      'NON ADESSO! …Scusa. Ho la testa sul fuoco. Più tardi.',
      'Sto dormendo. Non si sente? Più tardi.',
      'Chiuso! Torna quando batto il ferro.',
      'Ho la schiena a pezzi. Passa più avanti, ragazz{o|a}.'
    ],
    dorme: [
      "…CHE C'È? È notte! Torna domani!",
      "Se bussi ancora a quest'ora ti ferro come un cavallo.",
      'Dormo. Domani. Fuori dai piedi.'
    ],
    ancora: [
      'Ti ho sentito! Ho le orecchie, mica un martello al posto della testa.',
      'Bussa ancora e la porta te la rifaccio in testa.',
      'Più tardi vuol dire più tardi.'
    ],
    regola: [
      'Vai via. VAI VIA.',
      'Non apro. Non ho mai aperto. Neanche quella notte.',
      'Torna a casa, ragazz{o|a}. Dopo le nove non si bussa. Mai.'
    ]
  },
  // tutti gli altri (i nuovi abitanti della Valle)
  _: {
    apre: [
      'Oh! Un momento, esco.',
      'Ciao, {n}! Aspetta che mi metto le scarpe.',
      'Visite! Che bello. Arrivo.'
    ],
    no: [
      'Sto riposando! Passa più tardi, per favore!',
      'Non adesso, {n}! Ho da fare. Più tardi!',
      'Torna dopo, ho la casa sottosopra!',
      'Mi hai preso nel momento sbagliato. Più tardi?',
      "Un'altra volta, eh! Adesso proprio no."
    ],
    dorme: ['È notte, {n}… domani.', "Chi è? A quest'ora? Torna domattina!", 'Sto dormendo! Buonanotte!'],
    ancora: ['Ho sentito anche prima!', 'Più tardi vuol dire più tardi, {n}!', 'Non insistere, dai.'],
    regola: ['Non apro. Di notte no.']
  }
};
// di notte, a chi è molto amico, si apre lo stesso (solo nella Valle)
const BUSSA_NOTTE_APRE = [
  'È notte fonda… ma per te apro. Solo un momento, eh.',
  'Ti ho riconosciut{o|a} dal passo. Esco, ma parla piano.',
  "Non si dovrebbe, a quest'ora. Ma tu non sei «chiunque»."
];
// quando in casa non c'è nessuno
const BUSSA_VUOTO = [
  "Bussi. Niente. Infilato nella porta c'è un biglietto: «Sono {dove}. — {chi}»",
  "Nessuno risponde. Dalla finestra si vede la casa vuota. Di solito, a quest'ora, {chi} è {dove}.",
  'Bussi due volte. Risponde solo un corvo, dal tetto. Di {chi} nessuna traccia: forse è {dove}.'
];
const BUSSA_RUMORI = [
  'Dentro, una sedia che si sposta.',
  'Dietro la porta, passi. Poi silenzio.',
  'Una tenda si muove.',
  'Da dentro, un colpo di tosse.',
  'Una voce, da dentro:'
];

const Porte = {
  pick: L => L[Math.floor(Math.random() * L.length)],
  testi(id) {
    return BUSSA_TESTI[id] || BUSSA_TESTI._;
  },
  // è in casa sua: nascost{o|a} e il suo orario non dice dove andare
  inCasa(n) {
    if (!n || !n.hidden || n.script) return false;
    const s = schedOf(n.id);
    return !s;
  },
  // l'ora in cui va a dormire
  dorme(id, st) {
    const t = st.time,
      letto = { ezekiel: 22 * 60, agatha: 22 * 60 + 30, lucius: 22 * 60, clara: 21 * 60 + 30, brom: 23 * 60 }[
        id
      ];
    return t >= (letto || 22 * 60) || t < 6 * 60;
  },
  // chi abita dietro questa porta (le case del paese) o in questa casetta (i nuovi abitanti)
  abitanti(o) {
    if (!o) return [];
    if (o.kind === 'door' && o.key) return Object.keys(HOMES).filter(id => HOMES[id] === o.key && NPC(id));
    if (o.act === 'built' && o.bid === 'casetta' && typeof residents === 'function')
      return residents()
        .filter(r => r.house === o.bk && NPC(r.id))
        .map(r => r.id);
    return [];
  },
  // dove si trova un abitante, a parole
  dove(id) {
    const n = NPC(id),
      st = G.st;
    if (!n || !st) return '';
    if (
      typeof OUT_L !== 'undefined' &&
      OUT_L[id] &&
      typeof outsiderHere === 'function' &&
      !outsiderHere(id, st)
    )
      return 'fuori dalla Valle';
    if (n.hidden) {
      const s = schedOf(id);
      if (s && s.in) return { chapel: 'in cappella', barn: 'nel fienile' }[s.in] || 'dentro un edificio';
      if (HOMES[id] === 'varco') return 'chissà dove, verso il Varco';
      if (HOMES[id] === 'ponte' && !(typeof resOf === 'function' && resOf(id))) return 'oltre il ponte';
      return 'in casa';
    }
    if (n.map !== 'main')
      return { chapel: 'in cappella', house: 'a casa tua', barn: 'nel fienile' }[n.map] || 'dentro';
    let p = placeNameAt(n);
    if (p === 'per i sentieri' && isFree(st)) {
      const x = n.x / 16,
        y = n.y / 16;
      p =
        x >= 78 && y <= 16
          ? 'sulla Collina'
          : x >= 58 && y >= 22
            ? 'al lago'
            : y >= 40
              ? 'giù al fiume'
              : x < 12
                ? 'ai margini del bosco'
                : 'per i sentieri';
    }
    return p + (ACTD[n.act] ? ' (' + ACTD[n.act] + ')' : '');
  },
  // per il taccuino: una riga breve
  doveRiga(id) {
    const d = this.dove(id);
    if (!d) return '';
    return d === 'in casa' ? 'In casa · puoi bussare alla sua porta' : 'Ora: ' + d;
  },
  conta(id, st) {
    const B = (st.flags.bussa = st.flags.bussa || {});
    if (!B[id] || B[id][0] !== st.day) B[id] = [st.day, 0];
    return ++B[id][1];
  },
  // il posto davanti alla porta dove l'abitante esce (non addosso al giocatore)
  soglia(id) {
    const [hx, hy] = homeDoor(id),
      [px, py] = ptile(G.player),
      m = G.maps.main;
    for (const [x, y] of [
      [hx, hy],
      [hx - 1, hy + 1],
      [hx + 1, hy + 1],
      [hx - 1, hy],
      [hx + 1, hy]
    ])
      if (!(x === px && y === py) && (x === hx && y === hy ? true : !m.solid(x, y))) return [x, y];
    return [hx, hy];
  },
  nomeCasa(o, ids) {
    const chi = (NAMES[ids[0]] || '').split(' ')[0];
    return (
      {
        elder: "La casa dell'Anziano Ezekiel.",
        store: "L'emporio di Agatha. Lei abita al piano di sopra.",
        chapel: "La cappella. Lucius dorme nella stanza dietro l'altare.",
        cottage: 'La casetta di Clara.',
        forge: 'La fucina di Brom. Lui abita nella stanza sul retro.'
      }[o && o.key] || `La casetta di ${chi}.`
    );
  },
  async bussa(ids, o) {
    const st = G.st;
    const c = await ask(null, this.nomeCasa(o, ids) + ' Bussi?', ['Bussa', 'Lascia stare']);
    if (c !== 0) return;
    AU.play('knock');
    await sleep(700);
    const dentro = ids.map(NPC).filter(n => this.inCasa(n));
    if (!dentro.length) {
      // nessuno: un biglietto o un indizio
      const n = NPC(ids[0]);
      if (!n) return narr('Bussi. Nessuno risponde.');
      const chi = (NAMES[n.id] || '').split(' ')[0];
      return narr(fmt(this.pick(BUSSA_VUOTO).replace('{dove}', this.dove(n.id)).replace('{chi}', chi)));
    }
    const n = dentro[0],
      id = n.id,
      T = this.testi(id),
      volte = this.conta(id, st),
      notte = this.dorme(id, st),
      max = isFree(st) ? 10 : 5,
      amico = Math.min(1, hearts(id) / max);
    if (Math.random() < 0.6) await narr(this.pick(BUSSA_RUMORI));
    // la Regola III: nella storia, di notte, nessuno apre
    if (!isFree(st) && notte) {
      addQuiete(-2);
      if (Math.random() < 0.4) AU.play('whisper');
      return say(id, this.pick(T.regola), 'fear');
    }
    if (volte >= 3) {
      if (volte >= 4) addFriend(id, -1);
      return say(id, this.pick(T.ancora), 'stern');
    }
    let apre;
    if (notte) apre = amico >= 0.8 && Math.random() < 0.35;
    else
      apre = Math.random() < 0.25 + amico * 0.6 - (volte - 1) * 0.25 + (st.weather === 'pioggia' ? 0.1 : 0);
    if (!apre) {
      if (notte && volte >= 2) addFriend(id, -1);
      return say(id, this.pick(notte ? T.dorme : volte >= 2 ? T.ancora : T.no), notte ? 'stern' : null);
    }
    // esce sulla soglia, parla, poi rientra
    AU.play('door');
    const [x, y] = this.soglia(id);
    placeNPC(n, 'main', x, y, 0);
    n.script = true;
    n.path = [];
    try {
      await say(id, this.pick(notte ? BUSSA_NOTTE_APRE : T.apre));
      await talkTo(n);
    } finally {
      n.script = false;
      n.goal = null;
    }
  }
};

// le porte del paese: si bussa invece di leggere la descrizione (le porte con una storia da raccontare restano)
Ext.on('porta:intercetta', o => {
  const st = G.st,
    F = st.flags,
    t = st.time;
  if (G.visit || !o || !o.key) return false;
  if (o.key === 'house' || o.key === 'barn') return false;
  if (o.key === 'elder' && F.tobiaTalk && !F.barnKey) return false; // la chiave del fienile, nella storia
  if (o.key === 'chapel' && !(t >= 22 * 60 || t < 6 * 60)) return false; // di giorno in cappella si entra
  if (F.finaleChase) return false;
  const ids = Porte.abitanti(o);
  if (!ids.length) return false;
  // la merceria: se Agatha è al banco vale il suo biglietto di sempre
  if (o.key === 'store' && !Porte.inCasa(NPC('agatha'))) {
    const a = NPC('agatha');
    if (a && !a.hidden && a.act === 'stall') return false;
  }
  return Porte.bussa(ids, o);
});
// le casette dei nuovi abitanti
Ext.on('freeAct:intercetta', (fx, fy) => {
  if (G.visit || G.map.id !== 'main') return false;
  const o = G.map.objAt(fx, fy),
    ids = Porte.abitanti(o);
  if (!ids.length || (o && o.kind === 'door')) return false;
  G.cut++;
  Porte.bussa(ids, o)
    .catch(e => console.error(e))
    .finally(() => {
      G.cut--;
    });
  return true;
});
