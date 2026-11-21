'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (3): la storia, capitolo per capitolo =================
// Capitolo I: tutti gentili, troppo; le bugie sono piccole e ripetute.
// Capitolo II (dopo il Vespro dell'otto): le crepe; c'è chi ha paura e chi ti tiene d'occhio.
// Capitolo III (dopo l'Albero): sanno che sai. Capitolo IV: la Festa, sorrisi e avvertimenti.
{
  const S = 'storia';
  const C1 = [1, 1],
    C2 = [2, 2],
    C3 = [3, 3],
    C4 = [4, 4];
  const SERA = [17, 22];

  Dialoghi.aggiungi('passaggio', {
    ezekiel: [
      ['Hai trovato tutto, in casa? Il nonno teneva le cose in ordine. Quasi tutte.', { fase: S, cap: C1 }],
      ['La gente di qui è semplice. Lavora, prega, conta. Ti troverai bene.', { fase: S, cap: C1 }],
      ['Il recinto è giallo perché il giallo si vede di notte. Solo per questo.', { fase: S, cap: C1 }],
      [
        'Non è successo niente, al Vespro. Lucius è stanco. Siamo tutti stanchi, in autunno.',
        { fase: S, cap: C2 }
      ],
      ['Gli zoccoli? Un cavallo scappato da qualche fattoria lontana. Lontana.', { fase: S, cap: C2 }],
      ['Ti ho visto parlare con la bambina. Clara ha fantasia. Troppa.', { fase: S, cap: C2 }],
      ['Hai le scarpe sporche di terra rossa. Puliscile prima della Festa.', { fase: S, cap: C3 }],
      ["Avrei voluto un altro modo. Ho cercato per quarant'anni. Non c'è.", { fase: S, cap: C3 }],
      [
        "Stasera mangiamo tutti insieme. È la sera più bella dell'anno. Lo è sempre stata.",
        { fase: S, cap: C4 }
      ]
    ],
    agatha: [
      [
        'Tesoro, prova queste mele. Gratis, per i nuovi arrivati. Solo per i nuovi arrivati.',
        { fase: S, cap: C1 }
      ],
      ['Il negozio chiude alla campana. Anche la porta. Anche le finestre.', { fase: S, cap: C1 }],
      ['Ho sentito che sei andat{o|a} al Vespro. Brav{o|a}. Ti hanno… contat{o|a}?', { fase: S, cap: C1 }],
      ['Hai dormito? Io no. Gli zoccoli passano anche davanti al negozio.', { fase: S, cap: C2 }],
      ['Non ascoltare quello che dice la gente. Ascolta quello che non dice.', { fase: S, cap: C2 }],
      [
        'Tesoro… sei tornat{o|a} dal bosco. Hai una faccia… Siediti. Siediti un momento.',
        { fase: S, cap: C3 }
      ],
      ['Il sidro lo sto facendo. Lo sto facendo lento. Più lento che posso.', { fase: S, cap: C3 }],
      ['Che bella sei, la Valle, stasera. Vero, tesoro? Vero?', { fase: S, cap: C4 }]
    ],
    lucius: [
      ["Il Vespro è alle sette. Siediti dove vuoi. C'è sempre un posto.", { fase: S, cap: C1 }],
      ["Il giallo protegge. L'ho detto tante volte che ormai ci credo.", { fase: S, cap: C1 }],
      ['Ho contato otto. Ho contato otto. Perché ho contato otto…', { fase: S, cap: C2 }],
      ["Non sedermi accanto all'ultima panca. Ti prego.", { fase: S, cap: C2 }],
      ['Le campane hanno suonato da sole stanotte. Tre colpi. Come una porta.', { fase: S, cap: C2 }],
      ["L'Albero… no. Non dirmelo. Non voglio sapere com'è da vicino.", { fase: S, cap: C3 }],
      ["Stasera conto. Per l'ultima volta, me lo prometto.", { fase: S, cap: C4 }]
    ],
    clara: [
      [
        "Il nonno tuo mi regalava le caramelle all'anice. Erano schifose. Le mangiavo tutte.",
        { fase: S, cap: C1 }
      ],
      [
        'Vuoi vedere dove si vede il bosco meglio? Dal fienile! Ma non dirlo a Ezekiel.',
        { fase: S, cap: C1 }
      ],
      [
        "Gli zoccoli li ho sentiti anch'io. Ho messo la testa sotto il cuscino. E poi l'ho tirata fuori. Per ascoltare.",
        { fase: S, cap: C2 }
      ],
      ['Gli adulti dicono "lupi". Ma i lupi non bussano.', { fase: S, cap: C2 }],
      ['Sei tornat{o|a}! Dal bosco! Hai visto… hai visto il papà?', { fase: S, cap: C3, flag: 'claraAlly' }],
      [
        'Stasera stammi vicino. Se succede qualcosa, segui la mia lanterna.',
        { fase: S, cap: C4, flag: 'claraAlly' }
      ]
    ],
    brom: [
      ['Mh. Benvenut{o|a}. Gli attrezzi del nonno li ho io. Te li sistemo.', { fase: S, cap: C1 }],
      ['Mh. Il recinto si ridipinge ogni anno. Lo faccio io.', { fase: S, cap: C1 }],
      ['Mh. Stanotte non ho dormito. Battevo il ferro per non sentire.', { fase: S, cap: C2 }],
      [
        'Mh. Non fare domande a Ezekiel. Fanne a me. Non rispondo, ma non mento.',
        { fase: S, cap: C2, cuori: [2] }
      ],
      ['Mh. Hai visto. Si vede.', { fase: S, cap: C3 }],
      ['Mh. Alla Festa, stai lontan{o|a} da me. Per il tuo bene.', { fase: S, cap: C4, cuori: [3] }]
    ],
    tobia: [
      ['Hihi! Uno nuovo! Uno, due… tu sei sei. Hihi.', { fase: S, cap: C1 }],
      ['Hihi. Il recinto è giallo. Il bosco è nero. Tu che colore sei?', { fase: S, cap: C1 }],
      [
        "Hihi. L'altra notte non ero io. Le scarpe alte erano sotto il letto. Le ho contate.",
        { fase: S, cap: C2 }
      ],
      ['Hihi. Il Vecchio ha fame. Ogni autunno. Come gli orsi, ma al contrario.', { fase: S, cap: C2 }],
      ["Hihi. Hai visto le teste? Ce n'è una che ride. È la mia preferita.", { fase: S, cap: C3 }],
      ['Hihi. Stasera mi travesto. Quando ridi, corri. Hihi.', { fase: S, cap: C4 }]
    ]
  });

  Dialoghi.aggiungi('saluto', {
    ezekiel: [
      ['{n}. Le Regole. Le stai rispettando, vero? Bene. Molto bene.', { fase: S, cap: C2, ora: SERA }]
    ],
    agatha: [
      ["Tesoro, che occhiaie. Vieni dentro, ti do una tisana. Non quella. Un'altra.", { fase: S, cap: C2 }]
    ],
    lucius: [['Pace a te, {n}. Sei… sei ancora sei. Bene. Bene così.', { fase: S, cap: C2 }]],
    brom: [['Mh. {n}. Sei viv{o|a}.', { fase: S, cap: C3 }]],
    clara: [['{n}! Oggi è il giorno! Ho le mani che tremano. Anche tu?', { fase: S, cap: C4 }]],
    tobia: [['Hihi! Oggi si conta! Hihi! Ti piace contare?', { fase: S, cap: C4 }]]
  });

  Dialoghi.conversazioni('chiacchiera', [
    {
      tra: 'agatha lucius',
      fase: S,
      cap: C1,
      righe: [
        'agatha: Il nuovo arrivato mangia poco.',
        'lucius: Mangerà alla Festa.',
        'agatha: Lucius!',
        'lucius: Volevo dire… alla Festa si mangia tanto.'
      ]
    },
    {
      tra: 'clara brom',
      fase: S,
      cap: C1,
      righe: [
        'clara: Brom, mi fai un ferro di cavallo portafortuna?',
        'brom: Mh. Porta sfortuna.',
        'clara: Perché?',
        'brom: …Mh. Te lo faccio.'
      ]
    },
    {
      tra: 'ezekiel agatha',
      fase: S,
      cap: C2,
      righe: [
        'ezekiel: Le mele del recinto sono pronte?',
        'agatha: Quasi.',
        'ezekiel: Quasi non basta.',
        'agatha: Quasi è quello che hai, Ezekiel.'
      ]
    },
    {
      tra: 'tobia clara',
      fase: S,
      cap: C2,
      righe: [
        'clara: Tobia, chi è quello senza faccia?',
        'tobia: Hihi. Uno che ti vuole bene.',
        'clara: Non è divertente.',
        'tobia: Non era una battuta. Hihi.'
      ]
    },
    {
      tra: 'lucius brom',
      fase: S,
      cap: C3,
      righe: [
        "lucius: Ha visto l'Albero.",
        'brom: Mh.',
        'lucius: Cosa facciamo?',
        'brom: Mh. Niente. Come sempre.'
      ]
    },
    {
      tra: 'agatha clara',
      fase: S,
      cap: C4,
      righe: [
        'agatha: Clara, stasera stai vicino a me.',
        'clara: Perché?',
        'agatha: Perché lo dico io, tesoro. Solo per questo.'
      ]
    }
  ]);

  Dialoghi.conversazioni('bisbiglio', [
    {
      tra: 'agatha brom',
      fase: S,
      cap: C1,
      copertura: 'agatha: Tesoro! Brom mi parlava delle zucche. Che zucche!',
      righe: [
        'agatha: Ha le mani del nonno.',
        'brom: Mh. E gli occhi.',
        'agatha: Speriamo non la fine.',
        'brom: Mh.'
      ]
    },
    {
      tra: 'ezekiel brom',
      fase: S,
      cap: C1,
      copertura: 'ezekiel: {n}. Brom mi aggiornava sul recinto. Tutto in ordine.',
      righe: [
        'ezekiel: Il registro dice sei.',
        'brom: Mh. Al Vespro diranno otto.',
        'ezekiel: Diranno quello che devono.'
      ]
    },
    {
      tra: 'lucius agatha',
      fase: S,
      cap: C2,
      copertura: 'lucius: Pace a te. Agatha mi chiedeva delle candele nuove.',
      righe: [
        "lucius: L'ho visto, sull'ultima panca.",
        "agatha: Tutti l'hanno visto.",
        'lucius: Aveva la giacca del padre di Clara.',
        'agatha: Lucius. Basta.'
      ]
    },
    {
      tra: 'ezekiel lucius',
      fase: S,
      cap: C2,
      copertura: 'ezekiel: Buonasera. Parlavamo di inni. Molto noiosi.',
      righe: [
        'lucius: Dobbiamo dirglielo.',
        "ezekiel: Glielo dirà l'Albero.",
        'lucius: È crudele.',
        'ezekiel: È antico. È diverso.'
      ]
    },
    {
      tra: 'brom clara',
      fase: S,
      cap: C3,
      copertura: 'clara: Niente! Brom mi aggiustava la lanterna. Vero, Brom?',
      righe: [
        "clara: Il papà è là. L'ho capito.",
        'brom: Mh. Sì.',
        'clara: Tu lo sapevi?',
        'brom: …Mh. Perdonami.'
      ]
    },
    {
      tra: 'ezekiel agatha',
      fase: S,
      cap: C4,
      copertura: 'agatha: Tesoro! Che bella festa sarà, vero? Bellissima.',
      righe: [
        'ezekiel: Il sidro?',
        'agatha: È sul tavolo.',
        'ezekiel: Forte?',
        'agatha: Come ogni anno.',
        'ezekiel: Bugiarda.'
      ]
    }
  ]);

  Dialoghi.aggiungi('sfuggito', {
    lucius: [
      [
        'Il primo anno che ho contato, avevo dodici anni. Ezekiel mi tenne la mano sulla spalla. Pesava.',
        { fase: S, cap: [2, 4], cuori: [3], una: true }
      ]
    ],
    ezekiel: [
      [
        'Clara. Suo padre. Sono stato io a dirgli di restare. Mi credeva un amico.',
        { fase: S, cap: [3, 4], cuori: [4], una: true }
      ]
    ],
    agatha: [
      [
        "Ogni anno metto meno erba nel sidro. Ogni anno sembra uguale. Forse non è l'erba.",
        { fase: S, cap: [3, 4], cuori: [4], una: true }
      ]
    ]
  });
}
