'use strict';
// ================= SVAGO: i testi =================
// Le battute del tempo libero con gli abitanti (svago.js): la panchina, il tè, la pesca, le letture, la legna,
// le stelle, il picnic, il ballo, l'orto, il falò della sera, la corsa coi sacchi e i pensieri da soli.
// Ogni gruppo ha le battute per abitante e una riserva comune («_») per chi non ne ha di sue.
// {n} è il nome del giocatore; {o|a} sceglie per genere (come in tutto il gioco).
const SV_T = {
  // ---------- la panchina: seduti, il tempo che passa ----------
  panchina: {
    ezekiel: [
      'Tuo nonno si sedeva qui ogni sera. Diceva che da questa panchina si vede tutto il paese senza che il paese veda te.',
      'Alla mia età il tempo non si conta più in ore. Si conta in panchine.',
      'Senti? Il fiume. Quando ero giovane faceva più rumore. O io sentivo meglio.',
      'Il Registro mi aspetta. Ma il Registro aspetta da duecento anni: può aspettare un’altra mezz’ora.',
      'Ogni nome che scrivo è una persona che è arrivata qui per restare. Sai che il tuo l’ho scritto con la penna buona?',
      'Le rondini tornano sempre sullo stesso tetto. Anche le persone, se le lasci fare.',
      'Una volta questa piazza era fango. Poi qualcuno ha messo una pietra. Poi un altro. Così si fanno i paesi: una pietra per uno.'
    ],
    agatha: [
      'Ah, finalmente seduta. Sai quanti chilometri faccio dietro quel bancone? Nessuno, ma mi sembrano mille.',
      'Tesoro, ti dico una cosa ma resta tra noi: Brom canticchia quando batte il ferro. Canticchia! L’ho sentito io.',
      'I prezzi li faccio con il cuore e con il bilancino. Più con il bilancino, a dire il vero.',
      'Questa panchina l’ha regalata mio marito al paese. Ci ha inciso le nostre iniziali sotto. Non guardare, che arrossisco.',
      'Se resti ancora un po’ ti racconto chi ha rotto il vaso della canonica. Spoiler: non è stato il vento.',
      'Mi piace guardare la gente che passa. Si capisce tutto da come cammina. Tu cammini come chi ha fretta di vivere.'
    ],
    brom: [
      'Mh.',
      '…Si sta bene.',
      'Il ferro va lasciato riposare. Anche le braccia.',
      'Non parlo molto. Ma mi piace quando c’è qualcuno seduto vicino.',
      'Vedi quella lanterna? L’ho forgiata io. Quindici anni fa. Ancora accesa.',
      'Mia madre diceva: chi sta zitto sente anche quello che gli altri non dicono.',
      'Mh. Domani piove. Lo sento nel ginocchio.'
    ],
    lucius: [
      'Il silenzio non è vuoto, sai. È pieno di cose che non hanno ancora trovato le parole.',
      'Anche Dio si è riposato il settimo giorno. Io mi accontento di mezz’ora il martedì.',
      'Guardo le nuvole e penso che nessuna è mai uguale a un’altra. Come le preghiere.',
      'A volte mi chiedo se la campana suoni per chiamare la gente o per farle compagnia.'
    ],
    clara: [
      'Mi piace stare qui! Si sente il profumo del forno fino a qui. Cioè, del mio forno. Cioè, è normale che mi piaccia.',
      'Secondo te le formiche hanno un paese come il nostro? Con una formica che fa il pane?',
      'Da piccola mi sedevo qui e contavo i passanti. Il record è stato dodici. Era il giorno della fiera.',
      'Tu da dove vieni, prima di qui? No, non dirmelo. Me lo immagino più bello di come è.'
    ],
    tobia: [
      'Hihi. La panchina è calda. Qualcuno ci è stato prima. Era un fantasma? Hihi.',
      'Io conto le galline. Sono sette. A volte otto. L’ottava non so di chi sia.',
      'Il Vecchio dice di stare seduti composti. Io sto seduto scomposto. Hihi!'
    ],
    ingegnere: [
      'Seduto si pensa meglio: il sangue va tutto alla testa. Credo. Non ho mai misurato.',
      'Il passerotto si è addormentato. Cioè, l’ho spento io. Ma mi piace dire che dorme.',
      'Questa panchina ha tre viti allentate. Le sento. Non chiedermi come.'
    ],
    _: [
      'Ogni tanto bisogna fermarsi. Il lavoro non scappa.',
      'Si sta bene, qui. Il paese sembra più piccolo e più caro, da seduti.',
      'Chi l’avrebbe detto che una panchina potesse essere la cosa migliore della giornata?',
      'Guarda come cambia la luce sulla piazza. Ogni ora un colore diverso.'
    ]
  },

  // ---------- il tè: domande e risposte; ognuno apprezza un modo di rispondere ----------
  // tono: 'dolce' (gentile, affettuoso), 'buffo' (scherzoso), 'curioso' (fa domande, vuole sapere)
  gusti: {
    ezekiel: 'curioso',
    agatha: 'buffo',
    lucius: 'dolce',
    clara: 'curioso',
    brom: 'dolce',
    tobia: 'buffo',
    ingegnere: 'curioso'
  },
  teIntro: {
    agatha: [
      'Siediti, tesoro! Camomilla con un cucchiaio di miele: la ricetta di mia madre. E di sua madre. E così via fino ad Adamo.',
      'Tè nero, forte. Quello che vendo a peso d’oro. A te lo offro, ma non dirlo in giro.'
    ],
    clara: [
      'Ho fatto i biscotti! Sono un po’ bruciati sotto, ma sopra sono perfetti. Mangiali dal sopra.',
      'Il tè di menta lo raccolgo io, dietro al forno. Senti che profumo!'
    ],
    lucius: ['Una tisana di sambuco. Calma lo spirito e lo stomaco, non necessariamente in quest’ordine.'],
    _: ['Una tazza calda, ecco. Niente scalda come una tazza tenuta con due mani.']
  },
  te: {
    agatha: [
      {
        q: 'Dimmi la verità, tesoro: il mio vestito nuovo. Troppo rosso?',
        r: [
          ['È perfetto. Ti illumina il viso.', 'dolce', 'Oh! Lo dici per farmi piacere. Continua pure.'],
          [
            'Dalla collina ti scambiano per un papavero.',
            'buffo',
            'Ahahah! Un papavero! Allora mi pianto in piazza e aspetto le api.'
          ],
          [
            'Chi te l’ha cucito?',
            'curioso',
            'La sarta di Valdorso. Costa un occhio, ma l’occhio l’ho lasciato a lei.'
          ]
        ]
      },
      {
        q: 'Se un giorno chiudessi l’emporio, cosa farebbe il paese senza di me?',
        r: [
          ['Si perderebbe. Sei il cuore della piazza.', 'dolce', 'Tesoro… mi fai venire il groppo in gola.'],
          [
            'Finalmente qualcuno abbasserebbe i prezzi.',
            'buffo',
            'Ah! Sfacciat{o|a}! Mi piaci. Sconto del niente per cento, la prossima volta.'
          ],
          [
            'Ci hai mai pensato davvero?',
            'curioso',
            'Ogni inverno. Poi arriva la primavera e mi dimentico. È la primavera che mi tiene qui.'
          ]
        ]
      },
      {
        q: 'Hai sentito che Clara ha un ammiratore segreto? Lascia fiori sulla porta del forno.',
        r: [
          [
            'Spero sia una persona gentile.',
            'dolce',
            'Anch’io. Quella ragazza merita qualcuno che la faccia ridere.'
          ],
          [
            'Sono io. Scherzo! Forse.',
            'buffo',
            'Ahah! Attent{o|a}, che in paese le voci corrono più dei cavalli.'
          ],
          [
            'E chi pensi che sia?',
            'curioso',
            'Ho tre sospetti e mezzo. Il mezzo è Tobia. Ma non ci credo nemmeno io.'
          ]
        ]
      },
      {
        q: 'Io ho visto tre inverni brutti, qui. Tu cosa porteresti con te, se arrivasse una tempesta?',
        r: [
          [
            'Le persone a cui voglio bene.',
            'dolce',
            'Questa è la risposta giusta. Ma porta anche la marmellata.'
          ],
          [
            'La tua torta di mele. Tutta.',
            'buffo',
            'Ahah! Allora ne faccio due: una per la tempesta e una per me.'
          ],
          [
            'Tu cosa porteresti?',
            'curioso',
            'Il registro dei conti. Mi devono ancora dei soldi in mezzo paese!'
          ]
        ]
      }
    ],
    clara: [
      {
        q: 'Secondo te si può essere felici facendo la stessa cosa tutti i giorni? Tipo il pane?',
        r: [
          [
            'Se la fai con amore, sì.',
            'dolce',
            'Lo penso anch’io! Anche se alle quattro di mattina l’amore dorme ancora.'
          ],
          ['Dipende se il pane ti risponde.', 'buffo', 'Ahah! Il mio a volte mi risponde. Fa crack.'],
          [
            'Cosa faresti, se non facessi il pane?',
            'curioso',
            'Disegnerei le mappe! Di posti veri e posti inventati. Non dirlo a nessuno, eh.'
          ]
        ]
      },
      {
        q: 'Ho trovato un libro vecchio in soffitta, scritto in una lingua strana. Vuoi vederlo un giorno?',
        r: [
          [
            'Con piacere, se ti fa piacere.',
            'dolce',
            'Mi fa piacere! Nessuno ha mai voglia di guardare le mie scoperte.'
          ],
          [
            'Se è un libro di incantesimi, voglio il primo.',
            'buffo',
            'Ahah! Il primo incantesimo è: «impasta e aspetta». Funziona sempre.'
          ],
          [
            'Che lingua pensi che sia?',
            'curioso',
            'Ha delle lettere a forma di foglia. Secondo me è la lingua di chi abitava la Valle prima di noi.'
          ]
        ]
      },
      {
        q: 'Qual è la cosa più bella che hai visto da quando sei arrivat{o|a}?',
        r: [
          [
            'Il paese che si sveglia la mattina.',
            'dolce',
            'Sì! Quando i camini fumano tutti insieme. Sembra che il paese respiri.'
          ],
          [
            'Te che inciampi nei sacchi di farina.',
            'buffo',
            'Ehi! È successo una volta sola. Due. Va bene, quattro.'
          ],
          [
            'E per te, qual è?',
            'curioso',
            'Le lanterne sul fiume, d’autunno. Ogni anno piango un po’. Di nascosto.'
          ]
        ]
      },
      {
        q: 'Secondo te le stelle si vedono anche dalle altre valli? O ogni valle ha le sue?',
        r: [
          [
            'Ogni valle ha le stelle che si merita.',
            'dolce',
            'Allora noi ce le meritiamo belle. Fra’ Lucius sarebbe d’accordo.'
          ],
          ['Le altre valli si arrangiano.', 'buffo', 'Ahah! Le nostre non le prestiamo a nessuno.'],
          [
            'Ti piacerebbe vedere altre valli?',
            'curioso',
            'Un giorno sì. Ma poi tornerei. Si torna sempre dove c’è il proprio forno.'
          ]
        ]
      }
    ],
    lucius: [
      {
        q: 'Ti capita mai di sentirti piccol{o|a}, sotto il cielo?',
        r: [
          [
            'Sì, ma è una sensazione che consola.',
            'dolce',
            'È così. Piccoli, ma non soli. Grazie per averlo detto.'
          ],
          ['Solo quando Brom mi sta accanto.', 'buffo', 'Eh… sì, Brom fa sentire piccoli anche i campanili.'],
          [
            'Tu ti senti piccolo?',
            'curioso',
            'Sempre. È per questo che guardo in alto: per ricordarmi la misura.'
          ]
        ]
      },
      {
        q: 'Ho dimenticato il testo di una preghiera che recitavo da bambino. Ti è mai successo di perdere una parola importante?',
        r: [
          [
            'Le parole tornano quando servono.',
            'dolce',
            'Spero tu abbia ragione. Forse tornerà quando smetterò di cercarla.'
          ],
          [
            'Prova a inventarne un’altra. Dio capirà.',
            'buffo',
            'Ah! Forse è proprio quello che vuole. Una preghiera nuova, per una volta.'
          ],
          ['Di cosa parlava?', 'curioso', 'Del pane e del perdono. Due cose che non bastano mai.']
        ]
      },
      {
        q: 'Il Registro di Ezekiel… a volte penso a tutti quei nomi. Credi che ci ricorderanno?',
        r: [
          ['Chi ha voluto bene viene ricordato.', 'dolce', 'Allora spero di aver voluto bene abbastanza.'],
          [
            'Io mi farò ricordare per le zucche giganti.',
            'buffo',
            'Ah! È un buon modo. Le zucche non mentono.'
          ],
          [
            'Tu come vorresti essere ricordato?',
            'curioso',
            'Come uno che ha acceso le lanterne. Ogni sera. Anche quando non serviva.'
          ]
        ]
      }
    ],
    brom: [
      {
        q: 'Mh. Il ferro è buono, quest’anno. Il tuo attrezzo regge?',
        r: [
          ['Regge benissimo, grazie a te.', 'dolce', '…Mh. Bene. Mi fa piacere.'],
          ['L’ho usato per aprire un barattolo.', 'buffo', 'Mh! Un barattolo. …Mh. Ha funzionato?'],
          [
            'Come fai a capire se il ferro è buono?',
            'curioso',
            'Dal suono. Il ferro buono canta. Quello cattivo tossisce.'
          ]
        ]
      }
    ],
    _: [
      {
        q: 'Com’è andata la giornata?',
        r: [
          ['Meglio, adesso che sono qui.', 'dolce', 'Mi fa piacere. Anche la mia.'],
          ['Ho lottato con una gallina. Ho perso.', 'buffo', 'Ahah! Le galline non perdonano.'],
          ['E la tua?', 'curioso', 'Lunga. Ma le giornate lunghe hanno più sere.']
        ]
      },
      {
        q: 'Ti piace la vita della Valle?',
        r: [
          ['Molto. Mi sento a casa.', 'dolce', 'Allora sei a casa. Funziona così, qui.'],
          ['Tranne la sveglia del gallo.', 'buffo', 'Il gallo è la vera autorità del paese.'],
          [
            'Tu sei nat{o|a} qui?',
            'curioso',
            'Sono arrivat{o|a} come te, tanto tempo fa. Poi la Valle ti tiene.'
          ]
        ]
      }
    ]
  },

  // ---------- la pesca insieme ----------
  pesca: {
    inizio: {
      brom: [
        'Mh. Tieni la canna vecchia. Lancia lì, dove l’acqua fa i cerchi. E zitt{o|a}: i pesci sentono.',
        'Siediti. Tre lanci a testa. Chi prende di più offre la birra. Cioè, il latte.'
      ],
      nora: [
        'Oh, compagnia! Prendi questa canna. Il segreto è non avere fretta. Il pesce sente la fretta.',
        'Tre lanci, poi confrontiamo. Ti avverto: io non perdo mai. Quasi.'
      ],
      _: ['Ecco una canna. Tre lanci a testa, vediamo chi è più fortunato.']
    },
    tuo: {
      brom: ['Mh! Bello.', 'Brav{o|a}.', '…Non male. Davvero.'],
      _: ['Bel colpo!', 'Eccolo!', 'Ottimo!']
    },
    suo: {
      brom: ['Mh. Uno.', 'Preso.', 'Eccone un altro. Mh.'],
      _: ['Preso anch’io!', 'Ah! Abboccato!']
    },
    vinci: {
      brom: [
        'Mh. Hai la mano buona. Tuo nonno era uguale: pescava pensando ad altro e prendeva sempre.',
        'Hai vinto tu. …Mh. Il latte lo offro io. Sono di parola.'
      ],
      nora: ['Mi hai battuta! Nessuno mi batte da tre estati. Ti odio un po’. Scherzo. Torna a trovarmi.'],
      _: ['Hai vinto tu! Complimenti, hai la pazienza dei pescatori veri.']
    },
    perdi: {
      brom: [
        'Mh. Oggi tocca a me. La prossima volta lancia più a sinistra. Lì ci stanno quelli grossi.',
        'Non è questione di fortuna. È questione di stare zitti. Tu parli col pensiero. Si sente.'
      ],
      nora: ['Ho vinto io, come sempre. Ma tu migliori. Fra un anno forse mi preoccuperò.'],
      _: ['Oggi è andata a me! Ma ti sei difes{o|a} bene.']
    },
    pari: {
      brom: ['Pari. Mh. Va bene così. I pesci non si offendono.'],
      _: ['Pari! Allora siamo bravi tutti e due.']
    }
  },

  // ---------- le letture: racconti a puntate, uno per chi legge ----------
  racconti: {
    ezekiel: {
      t: 'La cronaca del primo inverno',
      cap: [
        [
          'Leggo dalla cronaca del paese. «Anno primo. Arrivarono in sette, con un carro e una capra. La capra era la più saggia.»',
          '«Scelsero la Valle perché il fiume faceva un’ansa a forma di braccio. Dissero: qui siamo abbracciati.»'
        ],
        [
          '«Il primo inverno fu crudele. Il fieno finì a gennaio. La capra, saggia, sparì nel bosco.»',
          '«Tornò dopo tre giorni, seguita da un pastore di Valdorso che portava fieno per tutti. Nessuno seppe mai come l’avesse convinto.»'
        ],
        [
          '«Il pastore restò. Sposò la figlia del fabbro. Fu il primo nome scritto nel Registro che non fosse dei sette.»',
          'Vedi, {n}? Il Registro è cominciato così: con qualcuno che è arrivato da fuori e ha deciso di restare. Come te.'
        ],
        [
          '«In primavera piantarono il primo melo, al centro della piazza. Oggi non c’è più: lo colpì un fulmine nell’anno quaranta.»',
          '«Ma i suoi semi erano già dappertutto. Ogni melo della Valle è suo nipote.» …Fine della cronaca. Per oggi.'
        ]
      ]
    },
    lucius: {
      t: 'La leggenda della campana muta',
      cap: [
        [
          'È una storia che raccontava il frate prima di me. C’era una campana che non suonava. Il fonditore aveva sbagliato la lega.',
          'Il paese voleva rifonderla. Ma il frate di allora disse: aspettiamo. Una campana muta ascolta meglio.'
        ],
        [
          'Per vent’anni la campana restò sul campanile, zitta. La gente saliva a raccontarle i segreti, sicura che non li avrebbe ripetuti.',
          'Il campanile divenne il posto più frequentato del paese. Più dell’osteria. Il che, per un campanile, è un miracolo.'
        ],
        [
          'Poi venne la notte della grande nebbia. Un bambino si perse nel bosco. Tutti lo cercavano, nessuno lo trovava.',
          'E la campana muta suonò. Una volta sola. Un suono basso, come un respiro. Il bambino seguì il suono e tornò a casa.'
        ],
        [
          'Il giorno dopo la campana era di nuovo muta. Per sempre. Nessuno seppe mai chi l’avesse fatta suonare.',
          'Io credo che fosse tutti quei segreti, {n}. Vent’anni di cose non dette. A un certo punto, bisogna dirle. …Fine.'
        ]
      ]
    },
    _: {
      t: 'Il libro delle storie della Valle',
      cap: [
        [
          'C’era una volta un mugnaio che macinava la nebbia per farne farina. Il pane veniva leggero leggero, e si mangiava con gli occhi chiusi.'
        ],
        [
          'Il mugnaio diventò famoso. Venivano da tre valli per il suo pane di nebbia. Ma una mattina la nebbia non venne.'
        ],
        [
          'Il mugnaio aspettò sette giorni. Al settimo, capì: la nebbia si era offesa. Le chiese scusa, e la nebbia tornò. Morale: ringrazia sempre la nebbia.'
        ]
      ]
    }
  },

  // ---------- la legna ----------
  legna: {
    inizio: {
      brom: [
        'Mh. Prendi l’accetta. Colpisci quando la lama è sopra il segno. Non prima. Non dopo.',
        'A due si fa prima. Tu spacchi, io impilo. Poi cambiamo. Mh.'
      ],
      _: ['Aiutami con questi ceppi: colpisci al momento giusto, e si aprono da soli.']
    },
    bene: { brom: ['Mh!', 'Così.', 'Pulito.'], _: ['Ottimo colpo!', 'Così!'] },
    male: { brom: ['Mh. Storto.', 'Piano. Senti il legno.'], _: ['Quasi!', 'Riprova.'] },
    fine: {
      brom: [
        'Mh. Metà è tua. Te la sei guadagnata.',
        'Buon lavoro. Il legno spaccato in due scalda il doppio.'
      ],
      _: ['Ecco, la tua parte di legna. Grazie dell’aiuto!']
    }
  },

  // ---------- le stelle: costellazioni della Valle ----------
  stelle: [
    {
      n: 'La Falce di Ezra',
      r: [
        'Vedi quelle sette stelle in curva? È la Falce di Ezra. Il primo contadino della Valle.',
        'Si dice che d’autunno la falce si abbassi verso i campi, per aiutare chi miete. Infatti d’autunno si vede più bassa.'
      ]
    },
    {
      n: 'La Lanterna',
      r: [
        'Quella stella sola, gialla, è la Lanterna. Non si muove mai.',
        'I pescatori la usano per tornare a casa. I frati la usano per ricordarsi che qualcuno veglia. Io la uso per entrambe le cose.'
      ]
    },
    {
      n: 'Il Corvo Bianco',
      r: [
        'Laggiù, sopra il bosco: quattro stelle a rombo con una coda. Il Corvo Bianco.',
        'La leggenda dice che un corvo bianco portò il fuoco alla Valle, e per la fatica diventò nero. Le stelle ricordano com’era prima.'
      ]
    },
    {
      n: 'Le Due Sorelle',
      r: [
        'Quelle due stelle vicine, una rossa e una blu, sono le Due Sorelle.',
        'Litigarono per un pettine e il cielo le separò. Ma solo di poco. Ogni secolo si avvicinano di un dito.'
      ]
    },
    {
      n: 'Il Pozzo',
      r: [
        'Quel cerchio di stelle deboli, quasi invisibile, si chiama il Pozzo.',
        'Chi riesce a contarle tutte esprime un desiderio. Io ne conto sempre una in meno. Forse è il desiderio che si nasconde.'
      ]
    },
    {
      n: 'Il Cavaliere Stanco',
      r: [
        'Quella figura lunga, con la spada inclinata: il Cavaliere Stanco.',
        'Combatté per cento anni contro l’inverno. Alla fine si sedette, e l’inverno si sedette accanto a lui. Ora sono amici.'
      ]
    }
  ],
  stelleIntro: {
    lucius: [
      'Sdraiati qui. L’erba è fredda, ma il cielo ripaga.',
      'Stasera è limpido. Guarda bene: ti presento qualche vecchia amica.'
    ],
    _: ['Guarda su. Stasera il cielo è pieno.']
  },
  stellaCadente: 'Una stella cadente! Esprimi un desiderio, presto!',
  desideri: [
    ['Un raccolto abbondante', 'raccolta'],
    ['Gambe leggere', 'passo'],
    ['Meno fatica', 'fatica']
  ],

  // ---------- il picnic ----------
  picnic: {
    inizio: {
      agatha: [
        'Tesoro! Siediti sulla coperta. Ho portato pane, formaggio e una torta che non dovrei mangiare. Tu hai portato qualcosa?',
        'Il picnic della domenica è sacro. Più della messa. Non dirlo a fra’ Lucius.'
      ],
      _: ['Siediti! C’è posto sulla coperta. Hai portato qualcosa da dividere?']
    },
    loro: {
      agatha: [
        'Allora assaggia la mia torta. È la ricetta della nonna, ma con più burro. La nonna approverebbe.'
      ],
      _: ['Allora mangia del mio. In un picnic non si conta chi ha portato cosa.']
    },
    ama: {
      agatha: [
        'Oh! Ma questa è una delizia! Me ne dai la ricetta? No, non dirmela: me la invento io, così è mia.'
      ],
      _: ['Che buono! Me ne ricorderò.']
    },
    piace: {
      agatha: ['Buono, tesoro. Brav{o|a}. Ci vuole sale, ma brav{o|a}.'],
      _: ['Buono, grazie!']
    },
    neutro: {
      agatha: ['Mh… interessante. Sì. È… interessante. Passami la torta.'],
      _: ['Grazie, è stato un pensiero gentile.']
    }
  },

  // ---------- il ballo ----------
  ballo: {
    inizio: {
      clara: [
        'Balli con me? Dai! Segui il ritmo: un passo quando il cerchio si chiude. È facilissimo! Più o meno.',
        'Finalmente qualcuno! Tobia mi pesta i piedi. Tu non pestarmeli, eh!'
      ],
      _: ['Balliamo? Segui il ritmo: un passo quando il cerchio si chiude.']
    },
    bene: {
      clara: ['Che bello! Balli come se l’avessi sempre fatto!', 'Ahah! Mi gira la testa! Ancora!'],
      _: ['Che ritmo!']
    },
    medio: {
      clara: ['Niente male! Un paio di pestoni, ma con stile.'],
      _: ['Bello! Un po’ storto, ma bello.']
    },
    male: {
      clara: ['Ahi, il mio piede! Ahah, non importa. L’importante è ridere. E io ho riso tanto.'],
      _: ['Beh… l’importante è divertirsi!']
    }
  },

  // ---------- l'orto ----------
  orto: {
    inizio: {
      ezekiel: [
        'Le erbacce crescono più in fretta dei pensieri. Aiutami a strapparle: alla radice, non a metà.'
      ],
      lucius: [
        'Il nostro orticello. Strappa le erbacce con delicatezza: anche loro sono creature. Solo un po’ invadenti.'
      ],
      _: ['Mi dai una mano con le erbacce? Alla radice, mi raccomando.']
    },
    fine: {
      ezekiel: ['Grazie. Prendi questi semi: li conservo da anni, ma i semi vanno piantati, non conservati.'],
      lucius: ['Grazie, {n}. Questi semi vengono dall’orto della canonica. Che crescano bene da te.'],
      _: ['Grazie dell’aiuto! Tieni qualche seme: da me ne avanzano sempre.']
    },
    poco: {
      ezekiel: ['Mh. Più radici e meno foglie, la prossima volta. Ma grazie lo stesso.'],
      _: ['Grazie comunque. Le erbacce ti hanno vinto, ma solo per oggi.']
    }
  },

  // ---------- il falò della sera ----------
  falo: {
    arrivo: [
      'Il fuoco scoppietta. Qualcuno ti fa posto senza dire niente, come si fa con chi è di casa.',
      'Le facce sono rosse di fiamma. Il fumo sale dritto: stanotte non c’è vento.',
      'Il calore ti arriva prima alle mani, poi alla faccia, poi da qualche parte dentro.'
    ],
    solo: [
      'Il falò brucia da solo. Gli altri sono già andati a dormire. Ti scaldi le mani sulle braci.',
      'Restano le braci, e il silenzio. Va bene anche così.'
    ],
    storie: {
      ezekiel: [
        [
          'Vi racconto di quando la nebbia salì fino ai tetti. Era l’anno del grande freddo.',
          'Per tre giorni nessuno vide la casa del vicino. Ci si chiamava per nome, da una finestra all’altra.',
          'La terza notte qualcuno cominciò a rispondere da una finestra che non c’era. Una voce gentile, che conosceva i nostri nomi.',
          'All’alba la nebbia se ne andò. Non abbiamo mai capito chi fosse. Ma da allora, quando c’è nebbia, lasciamo una lanterna accesa per lui.'
        ],
        [
          'Tuo nonno, {n}, una volta scommise che avrebbe attraversato il fiume a piedi, d’inverno, sul ghiaccio.',
          'Arrivò a metà. Il ghiaccio fece crac. Lui si fermò, si tolse il cappello e disse: «Va bene, hai vinto tu.»',
          'Tornò indietro all’indietro, piano piano, sempre col cappello in mano. Il fiume lo lasciò passare.',
          'Diceva che col fiume bisogna essere educati. Aveva ragione.'
        ],
        [
          'Quando ero bambino, la Valle aveva un orso. Un orso solo, vecchio, che scendeva in paese d’autunno.',
          'Non faceva male a nessuno. Mangiava le mele cadute e se ne andava. Lo chiamavamo il Sindaco.',
          'Un anno non scese più. Mia madre lasciò comunque un cesto di mele al limitare del bosco. Il cesto la mattina era vuoto.',
          'Lo ha fatto per vent’anni. Il cesto era sempre vuoto. Non ho mai voluto sapere chi le mangiasse.'
        ]
      ],
      agatha: [
        [
          'Volete sapere la storia vera del vaso della canonica? Ve la dico, tanto ormai è prescritta.',
          'Fu Brom. Era entrato per riparare la grondaia, si girò, e il vaso volò via come un uccello.',
          'Fra’ Lucius pensò per anni che fosse stato un segno divino. Brom non ha mai avuto il cuore di dirgli la verità.',
          'Brom, non guardarmi così. È passato tanto tempo. E il vaso era brutto.'
        ],
        [
          'Il mio primo giorno all’emporio vendetti un sacco di farina a un uomo con un mantello lungo fino ai piedi.',
          'Mi pagò con una moneta che nessuno aveva mai visto. Da una parte un albero, dall’altra una porta.',
          'La tengo ancora nel cassetto. Ogni tanto la guardo, e la porta è… socchiusa. Prima era chiusa. Lo giuro.',
          'Ma va bene, l’ho pesata: è oro vero. Il resto non è affar mio.'
        ]
      ],
      brom: [
        [
          'Mh. Una storia. …Va bene.',
          'Mio padre forgiò una spada per un cavaliere di passaggio. Il cavaliere non tornò mai a pagarla.',
          'La spada è ancora in fucina. Ogni tanto, di notte, la sento vibrare. Come se aspettasse.',
          'Non la vendo. Non la tocco. Se il cavaliere torna, è sua. Mh. Fine.'
        ],
        [
          'Quando avevo dieci anni mi persi nel bosco a est. Una notte intera.',
          'Non avevo paura. Avevo fame. Una volpe mi portò una mela. Poi un’altra.',
          'All’alba mi riportò al sentiero. Si girò una volta, e se ne andò.',
          'Da allora non metto trappole. Mai. Mh.'
        ]
      ],
      clara: [
        [
          'Ve la racconto io una storia di paura! Allora. C’era una fornaia. Bellissima. Bravissima.',
          'Una notte sente bussare al forno. Toc. Toc. Toc. Apre… e non c’è nessuno.',
          'Torna dentro e il pane è sparito! Tutto! Trenta pagnotte!',
          'La mattina dopo trova sulla porta trenta castagne, una per pagnotta. …Era il bosco che aveva fame. Ecco. Fa paura, no? Un pochino?'
        ],
        [
          'La nonna diceva che la prima neve dell’anno va assaggiata. Un fiocco solo, sulla lingua.',
          'Se sa di niente, l’inverno sarà lungo. Se sa di mela, sarà dolce.',
          'Io ogni anno assaggio, e sa sempre di niente. Ma l’inverno è sempre dolce lo stesso. Forse perché ci siete voi.'
        ]
      ],
      lucius: [
        [
          'Una storia breve. Un monaco chiese al suo maestro: quanto è lunga la notte?',
          'Il maestro rispose: quanto il tempo che ci metti ad accendere una candela.',
          'Il monaco disse: ma la notte dura ore! E il maestro: allora sbrigati con quella candela.',
          '…Io la trovo divertente. Voi no? Va bene.'
        ],
        [
          'Nei registri della canonica c’è una pagina scritta da una mano che nessuno riconosce.',
          'Dice solo: «Grazie per il fuoco di stanotte. Tornerò.» La data è di centotrenta anni fa.',
          'Ogni volta che accendiamo un falò in piazza penso a quella pagina. E lascio un posto libero, vicino alle braci.',
          'Così, per educazione.'
        ]
      ],
      tobia: [
        [
          'Hihi. Io so una storia. È vera. Tutte le mie storie sono vere.',
          'C’è un uomo senza faccia che cammina nel bosco. Non fa niente. Cammina e basta.',
          'Una volta l’ho salutato. Lui ha alzato la mano. Ma non aveva la mano. Hihi.',
          'Adesso ci salutiamo sempre. È educato. Più del Vecchio.'
        ],
        [
          'Le galline sanno contare. Io le ho viste.',
          'Una notte erano in fila, e la prima faceva coccodè una volta, la seconda due volte, la terza tre.',
          'Arrivate a otto si sono fermate tutte e mi hanno guardato. Erano sette galline. Hihi.',
          'Non le conto più. Lo fanno da sole.'
        ]
      ],
      ingegnere: [
        [
          'Vi dico di quando costruii un automa che doveva cucinare.',
          'Gli insegnai a fare la frittata. Funzionava benissimo. Il primo giorno.',
          'Il secondo giorno decise che la frittata era meglio senza uova. Il terzo giorno, senza padella.',
          'Il quarto mi servì un piatto vuoto con grande dignità. L’ho tenuto: è il mio automa più filosofo.'
        ]
      ],
      _: [
        [
          'Dalle mie parti si dice che il fuoco ascolta. Per questo davanti al falò si dicono solo cose vere.',
          'Una volta un bugiardo provò a mentire davanti al fuoco. La fiamma si piegò verso di lui e gli bruciò la barba.',
          'Da allora, nel mio paese, i bugiardi si riconoscono: sono tutti senza barba. Ehm. Io me la taglio per altri motivi.'
        ]
      ]
    },
    generi: [
      ['Una storia di paura', 'paura'],
      ['Una storia buffa', 'buffa'],
      ['Un ricordo del nonno', 'nonno']
    ],
    tuaStoria: {
      paura:
        'Racconti della notte in cui hai sentito dei passi intorno alla casa, e la mattina hai trovato impronte che andavano solo verso la porta. Mai via.',
      buffa:
        'Racconti di quando hai rincorso una gallina per mezza Valle, e alla fine la gallina era tornata nel pollaio da sola, e ti aspettava.',
      nonno:
        'Racconti di una lettera del nonno trovata in un cassetto: «Se stai leggendo, la casa ha trovato chi la merita.» La voce ti si incrina un po’.'
    },
    reazioni: {
      ezekiel: {
        paura: 'Mh. Le impronte che vanno solo verso la porta… Lascia una lanterna accesa, stanotte.',
        buffa: 'Ahah. Le galline della Valle hanno un senso dell’umorismo tutto loro.',
        nonno: '…Era proprio da lui. Scriveva sempre come se sapesse già come andava a finire.'
      },
      agatha: {
        paura:
          'Oh, tesoro, mi si è gelato il sangue! Domani ti porto una serratura nuova. A prezzo pieno, ma nuova.',
        buffa: 'Ahahah! Me la immagino! Con quella faccia che fai quando non trovi le cose!',
        nonno: 'Oh… vieni qui, fatti abbracciare. Era un uomo buono. Un po’ tirchio, ma buono.'
      },
      brom: {
        paura: 'Mh. Domani vengo a vedere quelle impronte. Porto il martello.',
        buffa: 'Mh. …Mh! Ahah. Mh.',
        nonno: '…Mh. Gli ho forgiato la zappa. Quella che usi adesso. Era contento.'
      },
      clara: {
        paura: 'Basta, basta! Stanotte non dormo! …Racconta ancora.',
        buffa: 'Ahahah! Le galline sono più furbe di tutti noi, lo dico sempre!',
        nonno: 'Che bello… mi viene da piangere. Scusate. È il fumo. È il fumo.'
      },
      lucius: {
        paura:
          'Le cose che vengono verso la porta, a volte, cercano solo un posto caldo. Ma chiudi bene lo stesso.',
        buffa: 'Ah! Anche le galline hanno una vocazione. La sua era farti correre.',
        nonno: 'Le parole lasciate per chi viene dopo sono le preghiere più belle. Grazie di avercela detta.'
      },
      tobia: {
        paura: 'Hihi! Erano i miei piedi. No. Forse. Hihi!',
        buffa: 'Hihi! La gallina sapeva contare! Te l’avevo detto!',
        nonno: 'Il nonno mi dava le caramelle. Quelle alla menta. Hihi. Mi manca.'
      },
      ingegnere: {
        paura: 'Affascinante. Hai misurato le impronte? No? Peccato, un dato perso.',
        buffa: 'Ahah! Dovrei costruire una gallina meccanica. Che torna da sola.',
        nonno:
          'I messaggi per il futuro sono la migliore delle macchine. Funzionano anche quando chi li ha scritti non c’è più.'
      },
      _: {
        paura: 'Brr! Che brividi!',
        buffa: 'Ahah! Bellissima!',
        nonno: 'Che ricordo prezioso.'
      }
    },
    // chi apprezza quale storia (sale di più l'amicizia)
    gusti: {
      ezekiel: 'nonno',
      agatha: 'buffa',
      brom: 'nonno',
      clara: 'paura',
      lucius: 'nonno',
      tobia: 'paura',
      ingegnere: 'buffa'
    },
    canzone: [
      'Sul fiume va la lanterna, va…',
      '…e chi la segue torna a casa, sa!',
      'Brucia la legna, scalda la sera…',
      '…la Valle è piccola, ma è vera!',
      'Dormi gallina, dormi campana…',
      '…domani il sole ci viene a cercare, piano piano!'
    ],
    silenzio: [
      'Guardi le fiamme. Hanno il colore di tutte le cose che non hai detto a nessuno.',
      'Una scintilla sale, sale, e diventa una stella. O forse era già una stella.',
      'Il legno si spacca e sospira. Qualcuno accanto a te sospira insieme.',
      'Per un po’ nessuno parla. È un silenzio che non pesa.',
      'Pensi a tutte le sere passate da sol{o|a}, prima di arrivare qui. Sembrano molto lontane.'
    ],
    arrosto: {
      castagne: 'Metti le castagne sulle braci. Scoppiettano, si aprono, e il profumo fa voltare tutti.',
      patata: 'Seppellisci una patata sotto la cenere. Dieci minuti dopo è la cosa più buona del mondo.',
      mais: 'Arrostisci una pannocchia sul fuoco, girandola piano. Si annerisce dove deve.',
      pane: 'Tosti una fetta di pane sulla punta di un bastone. Croccante fuori, morbida dentro.',
      nulla: 'Non hai niente da arrostire. Brom, senza dire niente, ti passa una castagna già aperta.'
    },
    tardi: 'Si fa tardi. Le braci si spengono piano, una alla volta, come i discorsi.'
  },

  // ---------- la corsa coi sacchi ----------
  corsa: {
    annuncio:
      'Oggi alle 18 c’è la corsa coi sacchi! La organizza Agatha, con i sacchi di farina dell’emporio. Partenza dal prato a ovest della piazza.',
    invito: [
      'Tesoro! Ti iscrivo? Un sacco, una corsa, un premio. E tanto ridere. Soprattutto quando cade Brom.',
      'Manca solo un concorrente! Dai, il sacco è pulito. Quasi. Ci tenevo le patate.'
    ],
    regole:
      'Salta con A, ma non troppo presto: aspetta di toccare terra, o inciampi. Un salto alla volta, a ritmo. Vince chi arriva primo da Ezekiel.',
    prima: {
      clara: [
        'Ho vinto due anni fa! Il segreto è saltare come un coniglio felice.',
        'Mi sono allenata tutta la settimana. Davvero! In cortile. Di notte.'
      ],
      brom: ['Mh. Il sacco mi sta stretto.', 'Non vinco mai. Ma partecipo. Mh.'],
      tobia: [
        'Hihi! Io salto altissimo! Poi cado. Ma salto altissimo!',
        'Il sacco è il mio vestito preferito.'
      ],
      ezekiel: [
        'Io faccio il giudice. Alla mia età si salta solo sulle conclusioni.',
        'Arrivate da me. Chi arriva primo, lo scrivo nel Registro. A matita.'
      ],
      _: ['Che bella giornata per una corsa!']
    },
    via: ['Ai vostri posti…', 'Pronti…', 'VIA!'],
    cadi: ['Ops!', 'Patatrac!', 'Ahia!'],
    cadeNpc: { clara: 'Ahi!', brom: 'Mh!', tobia: 'Hihi!' },
    tifo: ['Forza!', 'Salta!', 'Dai, dai!', 'Ahah!'],
    risultato: {
      1: [
        'Prim{o|a}! Il paese ha un nuovo campione dei sacchi! Ezekiel lo scrive nel Registro. A matita, ma lo scrive.',
        'Hai vinto! Agatha ti mette in mano la busta del premio e ti stampa un bacio sulla guancia. Tobia applaude con i piedi.'
      ],
      2: ['Second{o|a}! Una corsa splendida. Agatha dice che l’anno prossimo vinci di sicuro.'],
      3: ['Terz{o|a}! Il podio è il podio. Brom ti dà una pacca sulla spalla che ti fa quasi cadere.'],
      4: [
        'Ultim{o|a}… ma che salti! Tobia dice che sei stat{o|a} il più bravo a cadere. Lo dice come un complimento.'
      ]
    },
    vince: {
      clara: 'Ha vinto Clara! Salta tra la folla con il sacco ancora addosso.',
      brom: 'Ha vinto Brom! Tutti sono così sorpresi che per un momento nessuno applaude. Poi tutti applaudono.',
      tobia: 'Ha vinto Tobia! Ride così forte che spaventa le galline.'
    },
    senza: 'La corsa coi sacchi si è fatta senza di te.'
  },

  // ---------- pensieri da soli, seduti ----------
  pensieri: {
    0: [
      'Le foglie cadono una alla volta, senza fretta. Si potrebbe imparare qualcosa.',
      'Odore di fumo e di mele. L’autunno nella Valle ha un profumo tutto suo.',
      'Il vento porta le foglie in piazza come se volesse farle vedere a qualcuno.'
    ],
    1: [
      'Il freddo pizzica le guance. I camini fumano tutti insieme, come un respiro.',
      'La neve attutisce i passi. Il paese sembra parlare sottovoce.',
      'Un corvo si posa sulla neve e lascia tre impronte. Poi ci ripensa e vola via.'
    ],
    2: [
      'Le prime gemme. Il mondo ricomincia, come se niente fosse.',
      'Un’ape ti gira intorno, decide che non sei un fiore, e se ne va. Un po’ ci resti male.',
      'Il fiume è gonfio di neve sciolta. Si sente da qui.'
    ],
    3: [
      'Le cicale cantano. L’aria trema di caldo sopra i tetti.',
      'Un’ombra fresca, una brezza. Non serve altro.',
      'Le giornate lunghe hanno un sapore di pesca matura.'
    ],
    notte: [
      'Le finestre del paese si spengono una dopo l’altra.',
      'Una civetta, lontano. Poi niente.',
      'Le stelle sono tante. Più di quante ne ricordassi.'
    ]
  },

  // ---------- i sassi piatti sull'acqua ----------
  sassi: {
    0: 'Il sasso fa plop e va a fondo. Il fiume non commenta.',
    1: 'Un rimbalzo. È un inizio.',
    3: 'Tre rimbalzi! Non male.',
    5: 'Cinque rimbalzi! Il sasso danza sull’acqua.',
    7: 'Sette rimbalzi! Se ti avesse visto qualcuno…',
    9: 'Nove rimbalzi! Il sasso arriva quasi all’altra riva. Un airone ti guarda con rispetto.'
  }
};
