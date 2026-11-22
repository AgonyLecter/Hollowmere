'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (2): la Valle, le stagioni, i nuovi arrivati =================
// Stesso formato di dialoghi_testi.js. Qui: personalità e passato dei nuovi abitanti, stagioni, voci su tutti.
{
  const V = 'valle';
  const AUT = [0],
    INV = [1],
    PRI = [2],
    EST = [3];

  // ======================= FRASI AL PASSAGGIO: STAGIONI E NUOVI ARRIVATI =======================
  Dialoghi.aggiungi('passaggio', {
    // --- i sei del villaggio, per stagione ---
    ezekiel: [
      ["D'inverno contavo le finestre accese. Adesso le guardo e basta.", { fase: V, stagione: INV }],
      ['La primavera qui arrivava tardi. Come se avesse paura del recinto.', { fase: V, stagione: PRI }],
      [
        "D'estate il registro restava chiuso. Era la stagione più quieta. Per noi.",
        { fase: V, stagione: EST }
      ],
      [
        "L'autunno… mi viene ancora da preparare la Festa. Le mani non dimenticano.",
        { fase: V, stagione: AUT }
      ],
      [
        'Sono arrivati tanti nuovi. Imparo i loro nomi. Senza scriverli.',
        { fase: V, se: st => residents(st).length >= 2 }
      ]
    ],
    agatha: [
      [
        'Brr. Ho rifatto le calze a tutti. Anche a Brom. Le ha messe, tesoro! Le ha messe!',
        { fase: V, stagione: INV }
      ],
      [
        'Primavera! Ho venduto più semi questa settimana che in tutto il… in tanto tempo.',
        { fase: V, stagione: PRI }
      ],
      ['Che caldo, tesoro. Il burro si scioglie appena lo guardi.', { fase: V, stagione: EST }],
      [
        "Le mele di quest'anno le compro da te, tesoro. Quelle del recinto… basta.",
        { fase: V, stagione: AUT }
      ],
      [
        'Il pastore, Elio, mi ha regalato un gomitolo. Gli farò una sciarpa. Gialla. No, verde.',
        { fase: V, se: st => residents(st).some(r => r.id === 'elio') }
      ],
      [
        'Rina dice che le mie uova sono le più buone. Ha gusto, quella ragazza.',
        { fase: V, se: st => residents(st).some(r => r.id === 'rina') }
      ]
    ],
    lucius: [
      [
        'Il freddo entra in cappella dalla porta. Lascio aperto lo stesso. Non si sa mai chi deve entrare.',
        { fase: V, stagione: INV }
      ],
      [
        'A primavera le rondini tornano sotto il campanile. Le conto. Scusate. Le conto e basta.',
        { fase: V, stagione: PRI }
      ],
      ["D'estate predico all'aperto. Le api fanno da coro.", { fase: V, stagione: EST }],
      [
        'Gaspare mi ha portato il miele per le candele. Profumano di prato.',
        { fase: V, se: st => residents(st).some(r => r.id === 'gaspare') }
      ]
    ],
    clara: [
      [
        'Ho fatto un pupazzo di neve uguale a Brom. Uguale! Non ride neanche lui.',
        { fase: V, stagione: INV }
      ],
      [
        'Ho trovato un nido! Dentro ci sono tre uova. No, quattro. Non dirlo a Tobia.',
        { fase: V, stagione: PRI }
      ],
      ['Al lago fa fresco. Nora mi insegna a stare zitta. Non ci riesco.', { fase: V, stagione: EST }],
      ['Le foglie fanno crac quando le pesti. Le pesto tutte. Tutte!', { fase: V, stagione: AUT }],
      [
        'Lia mi ha insegnato a fare le coroncine di fiori. Ne ho fatta una per il papà. Gli sta piccola.',
        { fase: V, se: st => residents(st).some(r => r.id === 'lia') }
      ]
    ],
    brom: [
      ['Mh. Inverno. Ferri da neve per tutti.', { fase: V, stagione: INV }],
      ['Mh. Zappe nuove. La primavera le consuma.', { fase: V, stagione: PRI }],
      ['Mh. Caldo. La forgia di più.', { fase: V, stagione: EST }],
      [
        'Mh. Teo ha le mani giuste. Per il ferro.',
        { fase: V, se: st => residents(st).some(r => r.id === 'teo') }
      ]
    ],
    tobia: [
      [
        'Hihi. La neve copre tutte le impronte. Anche quelle che non sono di nessuno.',
        { fase: V, stagione: INV }
      ],
      ['Hihi. A primavera i rospi cantano. Io gli rispondo. Litighiamo.', { fase: V, stagione: PRI }],
      [
        "Hihi. D'estate dormo nel fienile. È fresco. E c'è sempre qualcuno che russa. Non io.",
        { fase: V, stagione: EST }
      ],
      [
        'Hihi. Elio dice che le pecore non contano. Bugia. Le ho viste.',
        { fase: V, se: st => residents(st).some(r => r.id === 'elio') }
      ]
    ],
    // --- i nuovi abitanti: il loro passato, quello che pensano della Valle ---
    nora: [
      [
        "Vengo da un paese di mare. Qui l'acqua è ferma. Ci ho messo un anno ad abituarmi al silenzio.",
        { fase: V }
      ],
      [
        'Mio padre diceva: il pesce più grosso non abbocca mai il primo giorno. Neanche le persone.',
        { fase: V }
      ],
      [
        "D'inverno il lago gela ai bordi. Pesco nel buco. I pesci sono lenti e tristi.",
        { fase: V, stagione: INV }
      ],
      [
        "D'estate le trote salgono a galla la sera. Sembra che ascoltino qualcosa.",
        { fase: V, stagione: EST }
      ],
      ["Tobia mi segue al lago. Non pesca, guarda l'acqua. Dice che c'è qualcuno sotto. Ride.", { fase: V }],
      ['Brom mi ha rifatto l\'amo. Dice che il ferro della Valle "tiene". Tiene cosa?', { fase: V }]
    ],
    bruno: [
      [
        "Avevo un mulino in pianura. L'ha preso la banca. Qui il mulino me l'hai fatto tu. Non lo prende nessuno.",
        { fase: V }
      ],
      ['Agatha compra la mia farina e mi fa la predica sul prezzo. Poi me la ricompra.', { fase: V }],
      ['Il pane della Valle ha un sapore che non so dire. Buono. Ma non so dire.', { fase: V }],
      [
        "D'inverno macino le castagne. La farina viene dolce e scura. Come Agatha quando è di buon umore.",
        { fase: V, stagione: INV }
      ],
      ['A primavera il grano nuovo profuma di erba. Lo sentirei a occhi chiusi.', { fase: V, stagione: PRI }],
      [
        'Le pale cigolano solo la notte. Di giorno girano zitte. Mia moglie diceva che i mulini sono timidi.',
        { fase: V }
      ]
    ],
    lia: [
      ['Fuori facevo fiori per i matrimoni. Qui li faccio per niente. È meglio.', { fase: V }],
      [
        'Ezekiel mi ha comprato un mazzo di margherite. Per una tomba, ha detto. Non ha detto quale.',
        { fase: V }
      ],
      [
        "D'inverno faccio fiori di carta. Clara me li colora. Fuori dai bordi, sempre.",
        { fase: V, stagione: INV }
      ],
      ['A primavera la Valle esplode. Io corro dietro ai fiori come una matta.', { fase: V, stagione: PRI }],
      ["D'estate i girasoli mi superano. Mi sento piccola. Mi piace.", { fase: V, stagione: EST }],
      ['Ada vuole dipingermi tra i fiori. Le ho detto: solo se i fiori vengono più belli di me.', { fase: V }]
    ],
    teo: [
      [
        "Ho fatto la miniera per vent'anni, fuori. Carbone. Qui c'è ferro e silenzio. Preferisco il silenzio.",
        { fase: V }
      ],
      [
        'Sotto la Collina ci sono gallerie vecchie. Più vecchie della Valle. Qualcuno scavava, prima.',
        { fase: V }
      ],
      [
        "D'inverno in miniera fa più caldo che fuori. Ci dormirei, se Mirta non mi sgridasse.",
        { fase: V, stagione: INV }
      ],
      [
        'Bruno mi fa il pane per il cantiere. Lo mangio col ferro sotto le unghie. Niente di più buono.',
        { fase: V }
      ],
      ['Silvio mi ha fatto un manico di piccone. Più bello del piccone. Che spreco.', { fase: V }]
    ],
    mirta: [
      ['Mia nonna mi raccontava di una valle con un recinto giallo. Pensavo fosse una favola.', { fase: V }],
      [
        "D'inverno faccio sciroppi. Per la tosse, per la tristezza, per chi non dorme. Vanno a ruba.",
        { fase: V, stagione: INV }
      ],
      ['A primavera il tarassaco: amaro fuori, buono dentro. Come Ezekiel.', { fase: V, stagione: PRI }],
      [
        "D'estate la camomilla. Ne raccolgo per tutto l'anno. E per Lucius, che non dorme mai.",
        { fase: V, stagione: EST }
      ],
      [
        'Lucius viene da me per le notti. Gli do la valeriana. Mi dice grazie contando le gocce.',
        { fase: V }
      ],
      [
        'Teo scende troppo in fondo. Gli preparo un sacchetto di salvia. Non so contro cosa. Contro.',
        { fase: V }
      ]
    ],
    silvio: [
      ['Facevo mobili per gente ricca, in città. Qui faccio panchine per chi si siede davvero.', { fase: V }],
      [
        'Le travi della cappella sono di un legno che non conosco. Rosso dentro. Le ho lasciate stare.',
        { fase: V }
      ],
      ["D'inverno lavoro in bottega. Il legno secco canta meglio.", { fase: V, stagione: INV }],
      [
        'Brom dice che il ferro è più onesto del legno. Gli ho fatto una sedia. Non ha più detto niente.',
        { fase: V }
      ],
      ['Ho rifatto la porta del negozio di Agatha. Non cigola più. Le manca il cigolio, dice.', { fase: V }]
    ],
    ada: [
      [
        "Studiavo all'accademia. Mi hanno cacciata perché dipingevo facce che non c'erano. Qui ci sono tutte.",
        { fase: V }
      ],
      ["D'inverno la luce è bianca e onesta. Dipingo i ritratti.", { fase: V, stagione: INV }],
      [
        'A primavera il verde della Valle ha venti tonalità. Ne ho trovate diciotto.',
        { fase: V, stagione: PRI }
      ],
      ["D'estate dipingo all'alba. Dopo, la luce mente.", { fase: V, stagione: EST }],
      [
        "Ho fatto il ritratto di Clara. Nel quadro ha un uomo dietro, con la mano sulla sua spalla. Non l'ho dipinto io.",
        { fase: V, finale: [1, 2] }
      ],
      [
        'Ho fatto il ritratto di Clara con suo padre. Per la prima volta le facce sono rimaste ferme.',
        { fase: V, finale: [3] }
      ]
    ],
    gaspare: [
      [
        'Avevo cento arnie, fuori. Le ho perse tutte in un inverno. Qui le api sono tornate a fidarsi di me.',
        { fase: V }
      ],
      [
        "D'inverno le api dormono strette. Io le ascolto con l'orecchio sul legno. Ronzano piano. Sognano.",
        { fase: V, stagione: INV }
      ],
      ['A primavera le api impazziscono. Io pure, con loro.', { fase: V, stagione: PRI }],
      ["D'estate il miele cola da solo. È la stagione in cui mi sento ricco.", { fase: V, stagione: EST }],
      [
        'Lia pianta i fiori, io raccolgo il miele. Le ho detto che siamo soci. Ha riso. Siamo soci.',
        { fase: V }
      ]
    ],
    elio: [
      [
        'Facevo il pastore in montagna. Poi le montagne le hanno vendute a pezzi. Qui nessuno vende niente.',
        { fase: V }
      ],
      [
        "D'inverno le pecore stanno strette. Io con loro. È il modo più vecchio per non avere freddo.",
        { fase: V, stagione: INV }
      ],
      [
        'A primavera nascono gli agnelli. Mi sveglio di notte per ogni belato. Sono contento lo stesso.',
        { fase: V, stagione: PRI }
      ],
      [
        "D'estate le tosiamo. Le pecore tosate sembrano offese per una settimana.",
        { fase: V, stagione: EST }
      ],
      [
        'Clara viene ogni giorno a contare le pecore. Le sbaglia sempre. Gliele lascio sbagliare.',
        { fase: V }
      ],
      ["Il formaggio di capra è come la Valle: all'inizio pizzica, poi non ne fai più a meno.", { fase: V }]
    ],
    rina: [
      ['Mio nonno coltivava questa terra prima del recinto. Così diceva. Nessuno gli credeva.', { fase: V }],
      [
        "D'inverno preparo i semi. Li divido in bustine e ci scrivo sopra una speranza.",
        { fase: V, stagione: INV }
      ],
      [
        "A primavera dormo quattro ore. Le altre le passo in ginocchio nell'orto.",
        { fase: V, stagione: PRI }
      ],
      [
        "D'estate annaffio all'alba e al tramonto. In mezzo, parlo con i pomodori.",
        { fase: V, stagione: EST }
      ],
      [
        'In autunno raccolgo tutto e mi viene da piangere. Ogni anno. Poi semino di nuovo.',
        { fase: V, stagione: AUT }
      ],
      [
        'Bruno dice che il mio grano è il migliore della Valle. Lo dice anche del suo pane. Esagera sempre.',
        { fase: V }
      ]
    ],
    ottavio: [
      ['In città mi chiedono dove porto la posta. Dico "in una valle". Ridono. Non insisto.', { fase: V }],
      [
        "D'inverno la strada del ponte è un ghiacciolo. Ci metto il doppio. Ma arrivo.",
        { fase: V, stagione: INV }
      ],
      [
        "D'estate porto i giornali a Ezekiel. Li legge tutti, anche le pubblicità. Dice che vuole capire il mondo.",
        { fase: V, stagione: EST }
      ],
      ["Ho portato un pacco per Lucius. Dentro c'era un pallottoliere. Me l'ha restituito.", { fase: V }],
      ['Agatha mi ha chiesto di comprarle un giornale di moda. Non le chiederò mai perché.', { fase: V }]
    ],
    irene: [
      [
        'Avevo una mostra in città. Ho ritirato tutte le foto della Valle. Le persone svenivano. Una sola, ma le ho ritirate.',
        { fase: V }
      ],
      [
        "D'inverno la neve cancella le ombre. Le foto vengono pulite. Quasi tranquille.",
        { fase: V, stagione: INV }
      ],
      [
        "Ho fotografato Brom alla forgia. È l'unico che viene sempre uguale. Credo che sia perché non finge mai.",
        { fase: V }
      ],
      [
        'Mi sono comprata una casetta di carta: un album. Dentro ci metto solo le foto venute normali.',
        { fase: V }
      ]
    ],
    mercante: [
      ["«D'inverno il carro scivola. Ma il sabato è il sabato.»", { fase: V, stagione: INV }],
      ['«Quella contadina, Rina, compra i semi a peso. Sa quello che fa. Mi piace.»', { fase: V }],
      [
        '«Ho visto il vostro rango sulla bacheca. Fuori se ne parla. Poco. Ma se ne parla.»',
        { fase: V, se: st => myRank(st) >= 2 }
      ]
    ]
  });

  // ======================= SALUTI DEI NUOVI ARRIVATI, PER AMICIZIA =======================
  Dialoghi.aggiungi('saluto', {
    nora: [['Eccoti. Ti ho tenuto il posto buono sul pontile.', { fase: V, cuori: [4] }]],
    bruno: [
      [
        'Il mio cliente preferito! Ti ho messo da parte una pagnotta. Non dirlo a Teo.',
        { fase: V, cuori: [4] }
      ]
    ],
    lia: [['Ciao! Oggi ti porto una margherita. Domani due. Dopodomani un mazzo.', { fase: V, cuori: [4] }]],
    teo: [['Ehi. Oggi niente polvere: mi sono lavato. Per te.', { fase: V, cuori: [4] }]],
    mirta: [
      [
        'Vieni, che ti guardo la lingua. Mh. Stai bene. Strano, per uno che lavora così.',
        { fase: V, cuori: [4] }
      ]
    ],
    silvio: [
      ['Ciao! Ho pensato a una mensola per casa tua. Dritta. Diritta come te.', { fase: V, cuori: [4] }]
    ],
    ada: [
      [
        "Ti ho ritratt{o|a} a memoria, stanotte. Sei venut{o|a} benissimo. Sei l'unic{o|a} che resta ferm{o|a}.",
        { fase: V, cuori: [4] }
      ]
    ],
    gaspare: [["Le api ti hanno nominat{o|a} amic{o|a} dell'alveare. Onore raro.", { fase: V, cuori: [4] }]],
    elio: [['Fiocco ti ha riconosciut{o|a} da lontano. Ha belato. È un sì.', { fase: V, cuori: [4] }]],
    rina: [['Ecco chi ha le mani migliori della Valle. Dopo le mie.', { fase: V, cuori: [4] }]],
    ottavio: [['Posta per te! No, scherzo. Volevo solo vedere la tua faccia.', { fase: V, cuori: [4] }]],
    irene: [
      [
        'Ciao. Ho stampato una tua foto. È venuta normale. Te la regalo, è la cosa più bella che ho.',
        { fase: V, cuori: [4] }
      ]
    ]
  });

  // ======================= SEGRETI CHE SFUGGONO (nuovi arrivati) =======================
  Dialoghi.aggiungi('sfuggito', {
    nora: [
      [
        "Una notte ho preso all'amo una cosa che non era un pesce. Aveva le dita. Ho tagliato la lenza.",
        { fase: V, cuori: [4], una: true }
      ]
    ],
    bruno: [
      [
        "Nel sacco di farina che mi hai dato c'era un nastro rosso. L'ho bruciato senza guardarlo.",
        { fase: V, cuori: [4], una: true, finale: [1, 2] }
      ]
    ],
    lia: [
      [
        'Pianto una margherita ogni mattina sul confine del bosco. Chi le coglie la notte? Io no.',
        { fase: V, cuori: [4], una: true }
      ]
    ],
    silvio: [
      [
        'Ho trovato il costume, in soffitta da Ezekiel. Le scarpe alte erano consumate. Di recente.',
        { fase: V, cuori: [4], una: true, finale: [1] }
      ]
    ],
    gaspare: [
      [
        "Le mie api fanno il miele più scuro vicino alla cappella. Una volta era rosso. L'ho buttato.",
        { fase: V, cuori: [4], una: true }
      ]
    ],
    rina: [
      [
        "Il nonno diceva che sotto il recinto giallo c'è un altro recinto, più vecchio. Rosso. Ho scavato. Era vero.",
        { fase: V, cuori: [5], una: true }
      ]
    ],
    ottavio: [
      [
        "Le lettere per la Valle arrivano all'ufficio già timbrate. Da qui. Da prima che io parta.",
        { fase: V, cuori: [4], una: true }
      ]
    ]
  });

  // ======================= CHIACCHIERE =======================
  Dialoghi.conversazioni('chiacchiera', [
    {
      tra: 'nora bruno',
      fase: V,
      righe: [
        'bruno: Pesce fresco oggi?',
        'nora: Tre trote.',
        'bruno: Te le scambio con due pagnotte.',
        'nora: Tre.',
        'bruno: …Tre.'
      ]
    },
    {
      tra: 'lia mirta',
      fase: V,
      righe: [
        'lia: Questa pianta è velenosa?',
        'mirta: Solo se la mangi.',
        'lia: E se la guardo?',
        'mirta: Allora fa bene agli occhi.'
      ]
    },
    {
      tra: 'teo silvio',
      fase: V,
      righe: [
        'teo: Mi fai un carrello per la miniera?',
        'silvio: Con le ruote dritte?',
        'teo: Con le ruote.',
        'silvio: Dritte. Le faccio dritte.'
      ]
    },
    {
      tra: 'ada gaspare',
      fase: V,
      righe: [
        'ada: Posso dipingere le tue api?',
        'gaspare: Se stai ferma.',
        'ada: E se mi pungono?',
        'gaspare: Allora dipingi in fretta.'
      ]
    },
    {
      tra: 'elio rina',
      fase: V,
      righe: [
        'rina: Le tue pecore hanno mangiato le mie lattughe.',
        'elio: Erano buone?',
        'rina: Elio!',
        'elio: Te le pago in lana.'
      ]
    },
    {
      tra: 'agatha nora',
      fase: V,
      righe: [
        "agatha: Tesoro, mangi abbastanza? Sei magra come un'acciuga.",
        'nora: Sono pescatrice.',
        'agatha: Appunto!'
      ]
    },
    {
      tra: 'ezekiel mirta',
      fase: V,
      righe: [
        'mirta: Sua nonna conosceva la mia, Anziano.',
        'ezekiel: Non sono più Anziano.',
        'mirta: Allora sua nonna conosceva la mia, Ezekiel.',
        'ezekiel: …Sì. La conosceva.'
      ]
    },
    {
      tra: 'lucius gaspare',
      fase: V,
      righe: [
        'gaspare: Le api sono entrate in cappella.',
        'lucius: Lasciale.',
        "gaspare: Si sono messe sull'altare.",
        'lucius: Allora pregano anche loro.'
      ]
    },
    {
      tra: 'brom teo',
      fase: V,
      righe: [
        'teo: Ho trovato un ferro che non arrugginisce.',
        'brom: Mh. Dove?',
        'teo: In fondo.',
        'brom: Mh. Lascialo in fondo.'
      ]
    },
    {
      tra: 'clara lia',
      fase: V,
      righe: [
        'clara: Che fiore è questo?',
        'lia: Non lo so. È nato da solo.',
        'clara: Allora lo chiamo come me!',
        'lia: Fiore Clara. Mi piace.'
      ]
    },
    {
      tra: 'tobia elio',
      fase: V,
      righe: [
        'tobia: Posso cavalcare una pecora? Hihi.',
        'elio: No.',
        'tobia: Una piccola?',
        'elio: Soprattutto non una piccola.'
      ]
    },
    {
      tra: 'ottavio bruno',
      fase: V,
      righe: [
        'ottavio: In città la farina costa la metà!',
        'bruno: E il pane sa di carta.',
        'ottavio: …Questo è vero.'
      ]
    },
    {
      tra: 'irene ada',
      fase: V,
      righe: [
        'irene: Facciamo una mostra insieme? Foto e quadri.',
        'ada: Delle facce?',
        'irene: Dei paesaggi.',
        'ada: Allora sì.'
      ]
    },
    {
      tra: 'silvio agatha',
      fase: V,
      righe: [
        'agatha: Silvio, la porta non cigola più.',
        'silvio: Prego.',
        'agatha: Non ti ho ringraziato, tesoro. Mi manca il cigolio.'
      ]
    },
    {
      tra: 'nora tobia',
      fase: V,
      stagione: INV,
      righe: [
        'tobia: Il lago è gelato! Ci cammino sopra!',
        'nora: No.',
        'tobia: Un pezzettino.',
        'nora: Tobia.',
        'tobia: Hihi. Un pezzettino piccolo.'
      ]
    },
    {
      tra: 'rina bruno',
      fase: V,
      stagione: PRI,
      righe: [
        'rina: Ho seminato il grano a righe dritte.',
        'bruno: Silvio sarà contento.',
        'rina: Silvio è venuto a controllare col metro.'
      ]
    },
    {
      tra: 'gaspare lia',
      fase: V,
      stagione: EST,
      righe: [
        'lia: Le tue api stanno svuotando i miei girasoli.',
        'gaspare: Te li riempiranno di semi.',
        'lia: …Promesso?',
        'gaspare: Promesso dalle api.'
      ]
    },
    {
      tra: 'elio clara',
      fase: V,
      stagione: PRI,
      righe: [
        'clara: È nato un agnello! Come si chiama?',
        'elio: Scegli tu.',
        'clara: Brom!',
        'elio: …Va bene. Brom.'
      ]
    }
  ]);

  // ======================= BISBIGLI =======================
  Dialoghi.conversazioni('bisbiglio', [
    {
      tra: 'nora teo',
      fase: V,
      copertura: 'teo: Ciao! Parlavamo di vermi. Per la pesca.',
      righe: [
        'nora: Al lago si sente cantare, la notte.',
        'teo: In miniera si sente picchiare.',
        'nora: Allo stesso ritmo?',
        "teo: …Non me l'ero chiesto."
      ]
    },
    {
      tra: 'mirta lucius',
      fase: V,
      copertura: 'mirta: Buongiorno. Fratello Lucius mi chiedeva della valeriana.',
      righe: [
        'mirta: Dorme, adesso?',
        'lucius: Quattro ore.',
        'mirta: E nelle altre?',
        'lucius: Conto. Ma piano.'
      ]
    },
    {
      tra: 'agatha lia',
      fase: V,
      copertura: 'agatha: Tesoro! Lia mi spiegava i tulipani. Rossi. Cioè, gialli.',
      righe: [
        'agatha: Ada si è innamorata.',
        'lia: Di chi?',
        'agatha: Della Valle. Non se ne andrà più.',
        'lia: Allora siamo in due.'
      ]
    },
    {
      tra: 'bruno silvio',
      fase: V,
      copertura: 'silvio: Ciao. Bruno mi chiedeva di una scala. Dritta.',
      righe: [
        'bruno: Le pale del mulino girano anche senza vento.',
        'silvio: Il legno si assesta.',
        'bruno: Al contrario?',
        'silvio: …Allora no.'
      ]
    },
    {
      tra: 'elio gaspare',
      fase: V,
      copertura: 'elio: Ehi. Gaspare voleva lana per le arnie. Contro il freddo.',
      righe: [
        'gaspare: Le api evitano la cappella.',
        'elio: Le pecore ci si mettono davanti.',
        "gaspare: Allora c'è qualcosa.",
        'elio: O qualcuno.'
      ]
    },
    {
      tra: 'ezekiel ottavio',
      fase: V,
      copertura: "ottavio: Buongiorno! L'Anziano mi chiedeva i francobolli nuovi.",
      righe: [
        'ezekiel: Le lettere di Elias. Bruciale.',
        'ottavio: Sono per te.',
        'ezekiel: Bruciale lo stesso.',
        'ottavio: …Le tengo io. Non si sa mai.'
      ]
    },
    {
      tra: 'rina mirta',
      fase: V,
      copertura: 'rina: Ciao! Mirta mi insegnava le erbe matte.',
      righe: [
        'rina: Ho scavato sotto il recinto giallo.',
        'mirta: E?',
        "rina: Ce n'era un altro. Rosso.",
        'mirta: Ricoprilo. E non dirlo a Ezekiel.'
      ]
    },
    {
      tra: 'teo brom',
      fase: V,
      finale: [2],
      copertura: 'brom: Mh. Ferro.',
      righe: [
        'teo: Di notte ho sentito zoccoli sopra la miniera.',
        'brom: Mh.',
        'teo: Lo sai chi è?',
        'brom: Mh. Lo so. Gli voglio bene lo stesso.'
      ]
    },
    {
      tra: 'ada clara',
      fase: V,
      finale: [3],
      copertura: 'clara: Ciao! Ada mi faceva il ritratto. Sto ferma! Quasi.',
      righe: [
        'ada: Tuo papà ha una faccia gentile.',
        "clara: Prima non ce l'aveva.",
        'ada: Prima?',
        'clara: Niente. Dipingi.'
      ]
    },
    {
      tra: 'agatha ottavio',
      fase: V,
      copertura: 'agatha: Tesoro! Ottavio mi portava il giornale. Quello di moda, sì.',
      righe: [
        'agatha: Fuori… si vive bene?',
        'ottavio: Si corre.',
        'agatha: E dove?',
        'ottavio: Nessuno lo sa, signora Agatha.'
      ]
    }
  ]);
}
