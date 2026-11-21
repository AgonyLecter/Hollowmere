'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (10): ricordi, desideri, il villaggio che cambia =================
{
  const S = 'storia',
    V = 'valle';
  const g = (tipo, cond, perChi) => Dialoghi.gruppo(tipo, cond, perChi);
  const C = (cond, L) => Dialoghi.conversazioniCon('chiacchiera', cond, L);
  const B = (cond, L) => Dialoghi.conversazioniCon('bisbiglio', cond, L);
  const t = (tra, ...righe) => ({ tra, righe });
  const w = (tra, copertura, ...righe) => ({ tra, copertura, righe });
  const rango = n => st => typeof myRank === 'function' && myRank(st) >= n;

  // ---------------- il villaggio cresce: commenti secondo il rango ----------------
  g(
    'passaggio',
    { fase: V, se: rango(1) },
    {
      ezekiel: [
        'Un borgo, adesso. Il nonno non ci avrebbe creduto.',
        'Le case nuove hanno le finestre grandi. Le nostre erano piccole. Per guardare meno.'
      ],
      agatha: [
        'Tesoro, siamo diventati un borgo! Alzo i prezzi. Scherzo. Un pochino.',
        'Ho dovuto comprare un registro dei conti nuovo. Quello vecchio non bastava più.'
      ],
      lucius: ['La domenica la cappella è piena. Ho dovuto chiedere a Silvio panche nuove.'],
      clara: ["Siamo un borgo! Cos'è un borgo? Non importa, siamo un borgo!"],
      brom: ['Mh. Più case. Più chiodi. Bene.'],
      tobia: ["Hihi. Più gente. Più gente da spaventare. Scherzo. Hihi. Un po'."]
    }
  );
  g(
    'passaggio',
    { fase: V, se: rango(2) },
    {
      ezekiel: [
        'Un paese. Fuori ci troveranno, prima o poi. Spero che ci trovino così.',
        'Mi hanno chiesto di fare il sindaco. Ho detto di no. Ho fatto abbastanza danni.'
      ],
      agatha: [
        'Un paese, tesoro! Ho assunto Clara come commessa. Mi paga in disegni.',
        'Ottavio dice che fuori qualcuno vuole aprire una locanda qui. Concorrenza! Che bello.'
      ],
      lucius: ['Ho celebrato un matrimonio. Il primo da… da sempre, credo. Ho pianto più degli sposi.'],
      clara: ['Siamo un paese! Voglio una scuola! Con una maestra! Non Agatha!'],
      brom: ['Mh. Un paese. Serve una fontana. Gliela faccio.'],
      tobia: ['Hihi. Un paese ha bisogno di un buffone. Mi candido. Hihi.']
    }
  );

  // ---------------- ricordi e desideri ----------------
  g(
    'passaggio',
    { fase: V },
    {
      ezekiel: [
        'Da giovane volevo fare il maestro. Insegnare a leggere. Ho insegnato solo a contare.',
        'Mia madre cantava una ninna nanna sulla Valle. Non ricordo le parole. Solo la musica.',
        'Vorrei vedere il mare, una volta. Prima di morire. Ottavio dice che è blu. Tutto blu.'
      ],
      agatha: [
        'Da ragazza ballavo. Tutta la notte. Ezekiel suonava il violino. Non ci crederai, tesoro.',
        'Vorrei un negozio con le vetrine grandi. Come quelli del catalogo.',
        'Mio marito mi portava le margherite ogni sabato. Lia lo fa senza saperlo.'
      ],
      lucius: [
        'Vorrei scrivere un libro di prediche senza numeri. Uno solo.',
        'Da bambino contavo le pecore per addormentarmi. Poi hanno cominciato a farmi contare le persone.',
        'Mi piacerebbe imparare a nuotare. Nora dice che non è mai troppo tardi.'
      ],
      clara: [
        'Da grande voglio vedere le luci che non si spengono. Poi torno qui a raccontarle.',
        'Vorrei un cane. Agatha dice che i cani nella Valle abbaiano al bosco. Io dico che è un bene.',
        'Ho un sogno ricorrente: il papà mi insegna a nuotare. Lui non sa nuotare.'
      ],
      brom: [
        'Mh. Vorrei forgiare una campana grande. Per tutta la Valle.',
        'Mh. Da giovane avevo i capelli. Lunghi. Non ridere.'
      ],
      tobia: [
        'Hihi. Vorrei volare. Come i corvi. Hihi. Poi atterrare sulla testa di Ezekiel.',
        'Hihi. Mi ricordo il bosco quando ero piccolo. Era caldo. Strano, eh? Hihi.'
      ],
      nora: [
        'Vorrei rivedere il mare una volta. Poi tornare qui. Al silenzio.',
        "Mio padre aveva una barca rossa. L'ho dipinta di blu, qui. Non so perché."
      ],
      bruno: ['Vorrei insegnare a qualcuno il mestiere. Tobia si è offerto. Ci sto pensando. Tanto.'],
      lia: ["Vorrei un giardino che non finisca mai. Qui, quasi, ce l'ho."],
      teo: ["Vorrei trovare l'oro. Non per i soldi. Per vedere la faccia di Brom."],
      mirta: [
        'Vorrei scrivere un erbario della Valle. Ogni erba con la sua storia. Molte storie sono tristi.'
      ],
      silvio: ['Vorrei costruire un ponte tutto di legno. Senza un chiodo. Brom si offenderebbe.'],
      ada: [
        'Vorrei fare una mostra in città. Con le facce della Valle. Che restano ferme, adesso.',
        'Vorrei dipingere il bosco di notte. Mirta dice di no. Per ora le do retta.'
      ],
      gaspare: ['Vorrei cento arnie, come una volta. Ne ho dieci. Dieci felici valgono cento tristi.'],
      elio: [
        "Vorrei portare le pecore in alta montagna, d'estate. Come da giovane. Qui le montagne sono basse e gentili."
      ],
      rina: ['Vorrei che il mio orto sfamasse tutta la Valle. Quasi ci siamo. Mancano i cetrioli.'],
      ottavio: ['Vorrei una casa qui. Una casetta. Con le finestre sul ponte. Per vedermi arrivare.'],
      irene: ['Vorrei fare una foto in cui nessuno è di troppo. Ci sto quasi riuscendo.']
    }
  );

  // ---------------- conversazioni: ricordi e desideri ----------------
  C({ fase: V }, [
    t(
      'agatha ezekiel',
      'agatha: Te lo ricordi il violino?',
      'ezekiel: Me lo ricordo.',
      'agatha: Lo suoni ancora?',
      'ezekiel: Le corde si sono rotte. Come tante cose.',
      'agatha: Brom te le rifà.'
    ),
    t(
      'lucius nora',
      'lucius: Nora, mi insegneresti a nuotare?',
      'nora: Al lago?',
      'lucius: Dove non tocca.',
      'nora: Cominciamo dove tocca.'
    ),
    t(
      'clara bruno',
      'clara: Bruno, mi insegni a fare il pane?',
      'bruno: Ti sporchi.',
      'clara: Mi piace sporcarmi.',
      'bruno: Allora sei nata fornaia.'
    ),
    t(
      'ezekiel ottavio',
      'ezekiel: Il mare è davvero tutto blu?',
      'ottavio: Anche verde. E grigio, quando piove.',
      'ezekiel: Come il lago.',
      'ottavio: Come cento laghi.'
    ),
    t(
      'brom teo',
      'teo: Brom, una campana grande?',
      'brom: Mh. Per tutta la Valle.',
      'teo: Ti porto il bronzo.',
      'brom: Mh. Allora la facciamo insieme.'
    ),
    t(
      'tobia ada',
      'tobia: Ada, mi dipingi con le ali? Hihi.',
      'ada: Che ali?',
      'tobia: Da corvo. Hihi.',
      'ada: Ti dipingo con le ali da corvo. E con il sorriso tuo.'
    ),
    t(
      'mirta lia',
      "mirta: Scriviamo l'erbario insieme?",
      'lia: Io i fiori, tu le erbe?',
      'mirta: E le erbe che sono fiori?',
      'lia: Quelle le litighiamo.'
    ),
    t(
      'silvio brom',
      'silvio: Un ponte senza chiodi.',
      'brom: Mh. Non regge.',
      'silvio: Scommettiamo?',
      'brom: Mh. Una cena.'
    ),
    t(
      'gaspare elio',
      'gaspare: Cento arnie.',
      'elio: Cento pecore.',
      'gaspare: La Valle non basterebbe.',
      'elio: Allora dieci e dieci. E un formaggio al miele.'
    ),
    t(
      'rina clara',
      'clara: Rina, cosa sono i cetrioli?',
      'rina: Zucchine che non sorridono.',
      'clara: Allora non li voglio.',
      'rina: Saggia.'
    ),
    t(
      'ottavio agatha',
      'ottavio: Signora Agatha, se apro una casetta qui, mi fa lo sconto?',
      'agatha: Se mi porti lo zucchero fino.',
      'ottavio: Un sacco al mese.',
      'agatha: Allora ti faccio pure la torta di benvenuto.'
    ),
    t(
      'irene lucius',
      'irene: Ho fatto una foto della messa. Eravamo tutti. Nessuno in più.',
      'lucius: Me la regali?',
      "irene: L'ho stampata per lei.",
      'lucius: La appendo in sacrestia. Al posto della croce rossa.'
    )
  ]);
  C({ fase: V, se: rango(1) }, [
    t(
      'ezekiel agatha',
      'agatha: Siamo un borgo, Ezekiel.',
      "ezekiel: Me l'hanno detto.",
      'agatha: Contento?',
      'ezekiel: Spaventato. Ma contento.'
    ),
    t(
      'clara tobia',
      'clara: Siamo un borgo! Facciamo una festa!',
      "tobia: Hihi. Un'altra?",
      'clara: Una nostra! Per i bambini!',
      'tobia: Hihi. Allora io sono invitato.'
    ),
    t(
      'brom lucius',
      'lucius: Brom, con tanta gente servirà una campana nuova.',
      'brom: Mh. Già pensato.',
      'lucius: Grande?',
      'brom: Mh. Felice.'
    )
  ]);
  B({ fase: V }, [
    w(
      'agatha clara',
      'agatha: Tesoro! Clara mi aiutava a contare il resto. Cioè, a darlo.',
      'clara: Ezekiel suona il violino?',
      'agatha: Suonava.',
      'clara: Lo convinciamo?',
      "agatha: Ci provo da trent'anni, tesoro. Con te forse ce la faccio."
    ),
    w(
      'lucius brom',
      'brom: Mh. Niente.',
      'lucius: Vorrei andare al mare.',
      'brom: Mh. Vai.',
      'lucius: E la cappella?',
      'brom: Mh. Ci sto io. Non conto nessuno. Promesso.'
    ),
    w(
      'nora ottavio',
      'ottavio: Ciao! Parlavamo di pesce e francobolli. Noiosissimo.',
      'nora: Portami una conchiglia del mare.',
      'ottavio: Perché?',
      'nora: Per sentire se il lago le risponde.'
    ),
    w(
      'ezekiel clara',
      'clara: Ciao! Ezekiel mi insegnava a scrivere. In corsivo!',
      'ezekiel: Il tuo papà, da giovane, scriveva benissimo.',
      'clara: Davvero?',
      "ezekiel: Lettere d'amore per tua madre. Ne ho una. Te la do, un giorno."
    ),
    w(
      'ada mirta',
      'mirta: Buongiorno. Ada voleva un colore. Il blu del mirtillo.',
      'ada: Il bosco di notte. Lo dipingo?',
      'mirta: Non ancora.',
      'ada: Quando?',
      'mirta: Quando nessuno si gira a guardarti mentre dipingi.'
    )
  ]);

  // ---------------- la storia: ricordi del nonno ----------------
  g(
    'passaggio',
    { fase: S },
    {
      ezekiel: [
        ['Tuo nonno arrivò nel quarantasei. In autunno. Con una valigia come la tua.', { cap: [1, 4] }]
      ],
      agatha: [
        [
          'Il nonno tuo comprava sempre le stesse cose: pane, candele, e un nastro. Giallo. Diceva.',
          { cap: [1, 4] }
        ]
      ],
      lucius: [['Il nonno tuo veniva al Vespro e si sedeva in fondo. Proprio in fondo.', { cap: [1, 4] }]],
      clara: [
        [
          'Il nonno tuo mi ha insegnato a fare le barchette di carta. Le mettevamo nel ruscello. Non tornavano mai.',
          { cap: [1, 4] }
        ]
      ],
      brom: [['Mh. Il nonno tuo mi ha insegnato a temprare. Prima che… Mh.', { cap: [1, 4] }]],
      tobia: [["Hihi. Il nonno tuo rideva tanto. Anche l'ultima notte. Hihi. Rideva tanto.", { cap: [1, 4] }]]
    }
  );

  // ---------------- saluti sopra i cinque cuori ----------------
  g(
    'saluto',
    { cuori: [6] },
    {
      ezekiel: ["{n}. Non te l'ho mai detto: sono felice che tu sia arrivat{o|a}."],
      agatha: ['Tesoro mio! Vieni qui, fatti abbracciare. Non scappare, tesoro!'],
      lucius: ['{n}! Che gioia. La mia preghiera di oggi era per te. Ha funzionato.'],
      clara: ['{n}! Il mio migliore amico! Dopo il papà. E dopo Tobia. No, prima di Tobia.'],
      brom: ['Mh. {n}. Ti ho tenuto il posto alla forgia. Per scaldarti.'],
      tobia: ['Hihi! {n}! Sei il mio preferito. Prima del Vecchio. Hihi. Molto prima.'],
      nora: ['{n}. Ti ho chiamato col nome di una barca. È un complimento.'],
      bruno: ['{n}! Il pane migliore è sempre per te. Lo sanno tutti. Si lamentano.'],
      lia: ['{n}! Ho chiamato un fiore come te. Profuma di buono.'],
      teo: ['{n}, amico mio. Il primo diamante che trovo è tuo.'],
      mirta: ['{n}. Sei la medicina migliore della Valle. Non dirlo alle mie erbe.'],
      silvio: ['{n}! Ti ho fatto una sedia. La più dritta della mia vita.'],
      ada: ['{n}! Sei nel mio quadro più bello. Non te lo faccio vedere. Ancora.'],
      gaspare: ['{n}. Le api ti chiamano per nome. Lo giuro.'],
      elio: ["{n}! Fiocco ha avuto un agnellino. L'ho chiamato come te."],
      rina: ['{n}! Sei la miglior contadina… il miglior contadino… la persona migliore della Valle.']
    }
  );
}
