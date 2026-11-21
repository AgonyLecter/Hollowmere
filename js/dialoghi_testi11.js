'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (11): ultime voci della Valle =================
{
  const S = 'storia',
    V = 'valle';
  const g = (tipo, cond, perChi) => Dialoghi.gruppo(tipo, cond, perChi);
  const C = (cond, L) => Dialoghi.conversazioniCon('chiacchiera', cond, L);
  const B = (cond, L) => Dialoghi.conversazioniCon('bisbiglio', cond, L);
  const t = (tra, ...righe) => ({ tra, righe });
  const w = (tra, copertura, ...righe) => ({ tra, copertura, righe });

  C({ fase: V }, [
    t(
      'agatha gaspare',
      'agatha: Gaspare, le tue api hanno punto Tobia.',
      'gaspare: Gli hanno detto ciao.',
      'agatha: Tre volte?',
      'gaspare: Gli vogliono molto bene.'
    ),
    t(
      'ezekiel lia',
      'ezekiel: Lia, le margherite sulle tombe del bosco…',
      'lia: Le pianto io.',
      'ezekiel: Grazie.',
      'lia: Non le pianto per loro. Le pianto per chi resta.'
    ),
    t(
      'lucius teo',
      'lucius: Teo, in miniera preghi?',
      'teo: Bestemmio.',
      'lucius: …È una forma di dialogo anche quella.'
    ),
    t(
      'clara gaspare',
      "clara: Gaspare, posso assaggiare il miele dall'arnia?",
      'gaspare: Con il dito?',
      'clara: Con la faccia!',
      'gaspare: …Con il dito.'
    ),
    t(
      'brom nora',
      "nora: Brom, un amo d'oro?",
      'brom: Mh. Per il Salmerino?',
      'nora: Per il Salmerino.',
      'brom: Mh. Se lo prendi, me lo fai vedere.'
    ),
    t(
      'tobia rina',
      'tobia: Rina, le carote crescono al contrario? Hihi.',
      'rina: Crescono in giù.',
      'tobia: Allora sono al contrario. Hihi.',
      'rina: …Hai ragione. Non ci avevo mai pensato.'
    ),
    t(
      'agatha elio',
      'elio: Agatha, il formaggio di capra lo vendi?',
      'agatha: Se è buono.',
      'elio: È ottimo.',
      'agatha: Allora lo vendo caro, tesoro. E tu me lo dai a poco.'
    ),
    t(
      'ezekiel bruno',
      'bruno: Il pane di mezzanotte, Ezekiel?',
      "ezekiel: Chi te l'ha detto?",
      'bruno: Nessuno. Lo lascio sulla soglia. Se lo prendi, bene.',
      'ezekiel: …Lo prendo.'
    ),
    t(
      'lucius ada',
      'ada: Fratello, posso dipingere un angelo sul soffitto?',
      'lucius: Con quante ali?',
      'ada: Due.',
      'lucius: Due va bene. Due è un buon numero. Niente di più.'
    ),
    t(
      'clara mirta',
      "clara: Mirta, hai un'erba per far tornare le persone?",
      'mirta: No.',
      'clara: Peccato.',
      "mirta: Ma ho un'erba per aspettarle senza piangere. Camomilla."
    ),
    t(
      'brom silvio',
      'silvio: Brom, la cena della scommessa.',
      'brom: Mh. Il ponte ha retto?',
      'silvio: Senza un chiodo.',
      'brom: …Mh. Alle sette. Pago io.'
    ),
    t(
      'tobia ottavio',
      'tobia: Ottavio, portami una giostra da fuori! Hihi.',
      'ottavio: Non entra nel sacco.',
      'tobia: Una piccola. Hihi.',
      'ottavio: Ti porto una trottola.'
    ),
    t(
      'nora irene',
      'irene: Posso fotografare il lago di notte?',
      'nora: Senza lampo.',
      'irene: Perché tutti dicono così?',
      'nora: Perché il lago non ama essere svegliato.'
    ),
    t(
      'teo ada',
      'ada: Teo, che colore ha il buio della miniera?',
      'teo: Nero.',
      'ada: Solo nero?',
      "teo: Nero con dentro le lanterne di chi c'era prima."
    ),
    t(
      'lia elio',
      'lia: Le pecore mangiano i fiori?',
      'elio: Solo quelli belli.',
      'lia: Allora hanno gusto.',
      'elio: Più di me.'
    ),
    t(
      'bruno rina',
      'rina: Bruno, oggi il pane è salato.',
      "bruno: Ho pianto nell'impasto.",
      'rina: Perché?',
      'bruno: Mio figlio mi ha scritto. Viene a trovarmi.'
    ),
    t(
      'gaspare silvio',
      "silvio: Gaspare, un'arnia a due piani?",
      'gaspare: Per le api ricche.',
      'silvio: Esistono?',
      'gaspare: Qui sì. Mangiano lavanda.'
    ),
    t(
      'mirta ottavio',
      'ottavio: Mirta, fuori vendono le tue tisane in barattoli di vetro.',
      'mirta: Chi?',
      'ottavio: Io. Senza dirlo a nessuno.',
      'mirta: …Allora dammi metà.'
    )
  ]);
  C({ fase: V, stagione: [1] }, [
    t(
      'clara nora',
      "clara: Nora, i pesci d'inverno dormono?",
      'nora: Sognano.',
      'clara: Cosa?',
      "nora: L'estate. Come noi."
    ),
    t(
      'brom bruno',
      'bruno: Brom, il mulino si è congelato.',
      'brom: Mh. Vengo con il martello.',
      'bruno: E con la pazienza?',
      'brom: Mh. Il martello è la mia pazienza.'
    )
  ]);
  C({ fase: V, stagione: [3] }, [
    t(
      'tobia gaspare',
      "tobia: Gaspare, d'estate le api sudano? Hihi.",
      'gaspare: Lavorano il doppio.',
      'tobia: E si lamentano? Hihi.',
      'gaspare: Mai. Imparerei da loro.'
    ),
    t(
      'lucius rina',
      'rina: Fratello, prega per la pioggia?',
      "lucius: Prego per l'equilibrio.",
      'rina: E se non basta?',
      'lucius: Allora annaffi.'
    )
  ]);
  B({ fase: V }, [
    w(
      'agatha silvio',
      'silvio: Ciao. Agatha voleva una scala per la vetrina.',
      'agatha: Brom e Mirta si scambiano ricette.',
      'silvio: Brom?',
      'agatha: Unguenti, tesoro. Ma è un inizio.'
    ),
    w(
      'ezekiel gaspare',
      "gaspare: Buongiorno. L'Anziano voleva miele scuro.",
      "ezekiel: Il miele rosso. L'hai buttato?",
      'gaspare: Tutto.',
      'ezekiel: Bene. Se torna, dimmelo. Solo a me.'
    ),
    w(
      'lucius rina',
      'rina: Ciao! Fratello Lucius benediceva i miei cavolfiori.',
      "rina: Sotto il recinto giallo c'era un recinto rosso.",
      'lucius: Lo so.',
      'rina: Lo sapeva?',
      'lucius: Il primo recinto lo dipingevano col sangue. Poi qualcuno inventò il giallo.'
    ),
    w(
      'clara teo',
      'clara: Ciao! Teo mi faceva vedere un sasso brillante!',
      "clara: In miniera c'è il mio papà di prima?",
      'teo: No, Clara.',
      'clara: Sicuro?',
      'teo: Sicuro. Laggiù ci sono solo sassi. E qualche fossile.'
    ),
    w(
      'tobia lia',
      'tobia: Hihi! Lia mi metteva un fiore in testa. Hihi.',
      'lia: Tobia, chi prende le margherite sul confine?',
      'tobia: Hihi. Io.',
      'lia: Davvero?',
      'tobia: Hihi. Le porto al Vecchio. Gli piacevano.'
    ),
    w(
      'brom elio',
      'elio: Ciao. Brom mi faceva i campanacci.',
      'elio: I campanacci suonano da soli, la notte.',
      'brom: Mh. Il ferro si ricorda.',
      'elio: Di cosa?',
      'brom: Mh. Da dove viene. Lascialo suonare.'
    )
  ]);
  B({ fase: S, cap: [1, 4] }, [
    w(
      'agatha lucius',
      'lucius: Pace a te. Agatha mi portava la cera.',
      'agatha: Il nonno comprava sempre un nastro giallo.',
      'lucius: Lo so.',
      'agatha: Ma nella cassa ne ha lasciato uno rosso.',
      'lucius: …Allora sapeva.'
    ),
    w(
      'ezekiel brom',
      'ezekiel: {n}. Parlavamo della pioggia. Pioverà.',
      'brom: Mh. Il nuovo arrivato fa domande.',
      'ezekiel: Le facevano tutti.',
      'brom: Mh. Lui ascolta le risposte.'
    )
  ]);

  g(
    'passaggio',
    { fase: V },
    {
      '*': [
        'Bella giornata per lavorare.',
        "Hai visto quanti fiori, quest'anno?",
        'Il villaggio è sempre più bello.'
      ]
    }
  );
  g(
    'reazione:pesca',
    { fase: V },
    {
      bruno: ['Pesce! Lo impaniamo con la mia farina?'],
      lia: ['Il pesce ha le squame che brillano come petali.'],
      teo: ['Anche io pescherei. Ma i sassi non abboccano.'],
      mirta: ['Pesce del lago: buono per la memoria. Mangialo il martedì.']
    }
  );

  // ---------------- altri passaggi della Valle, per carattere ----------------
  g(
    'passaggio',
    { fase: V },
    {
      agatha: [
        'Ho rifatto la vetrina. Silvio dice che pende. Io dico che è artistica.',
        'Oggi sconti. Non chiedermi su cosa. Su quello che vuoi tu, tesoro.',
        'Le uova costano di più quando piove. Non chiedermi perché. È tradizione.'
      ],
      ezekiel: [
        "Ho letto il registro vecchio. Poi l'ho usato per accendere il camino.",
        "Mi alzo all'alba per abitudine. Adesso guardo il sole, non i numeri.",
        'Ho chiesto scusa a una tomba, stamattina. Mi ha fatto bene.'
      ],
      lucius: [
        'Ho imparato a ridere in cappella. Le pareti si sono abituate.',
        'Benedico anche le pecore di Elio. Non stanno ferme, ma va bene.',
        'Una volta pregavo per avere paura di meno. Adesso prego per niente. È bellissimo.'
      ],
      clara: [
        'Oggi faccio la maestra. Gli allievi sono le galline.',
        'Ho scritto una storia! Finisce bene. Tutte le mie storie finiscono bene, adesso.',
        'Agatha mi ha comprato le scarpe nuove. Fanno cic-ciac nel fango!'
      ],
      brom: [
        "Mh. Ho forgiato un ferro di cavallo d'argento. Per fortuna. Non ci credo. Ma l'ho fatto.",
        'Mh. Il martello nuovo è leggero. Troppo. Mi manca il vecchio.',
        "Mh. Tobia ha dormito nella forgia. Al caldo. Non l'ho svegliato."
      ],
      tobia: [
        'Hihi. Ho insegnato al gufo a dire il mio nome. Lo dice male. Hihi.',
        'Hihi. Sul campanile si vede il mare. Forse. Hihi. Forse è una nuvola.',
        'Hihi. Oggi non faccio scherzi. Hihi. Questo è uno scherzo.'
      ],
      nora: [
        'Il lago oggi è liscio come uno specchio. Mi sono pettinata.',
        "Ho dato un nome a una trota. Poi l'ho liberata. Si chiamava Ezekiel.",
        "L'acqua fredda sveglia meglio del caffè di Bruno. Non dirglielo."
      ],
      bruno: [
        'Ho inventato il pane alle castagne. Clara dice che sa di bosco. È un complimento.',
        'La farina sui capelli non è vecchiaia. È lavoro.',
        'Il forno è acceso dalle quattro. Io pure.'
      ],
      lia: [
        'Ho piantato un girasole che guarda la cappella. Lucius dice che prega.',
        'Le rose bianche sono le più gentili. Le rosse le più gelose.',
        'Ogni fiore che regalo torna in qualche modo. A volte come sorriso.'
      ],
      teo: [
        'Ho trovato un quarzo a forma di cuore. Lo tengo. Non per me. Per qualcuno.',
        "Oggi in miniera cantavo. L'eco mi ha risposto stonato.",
        'La miniera di giorno sembra la stessa della notte. Per questo esco a guardare il cielo.'
      ],
      mirta: [
        'La menta cresce dove vuole. Come i bambini.',
        "Ho fatto un infuso per dormire. L'ho provato. Ho dormito due giorni.",
        'Le erbe del fosso sono le più forti. Quelle che nessuno guarda.'
      ],
      silvio: [
        'Ho fatto una sedia che dondola. Ci si addormenta Ezekiel ogni volta.',
        'Il legno di quercia non perdona. Come Agatha con i debiti.',
        'Una mensola storta è una mensola che ha vissuto.'
      ],
      ada: [
        'Ho dipinto il tuo campo. Senza permesso. È venuto bene.',
        "Il tramonto di ieri era viola. Nessuno mi crede. L'ho dipinto.",
        'Mescolo il giallo col blu. Viene verde. Ogni volta mi stupisco.'
      ],
      gaspare: [
        'Le api hanno sciamato sul pero. Le ho riprese con un cesto e una canzone.',
        'Il miele di castagno è amaro. Come certe verità. Ma fa bene.',
        'Non correre vicino alle arnie. Non per loro. Per te.'
      ],
      elio: [
        'Ho tosato Fiocco. Ora sembra un altro. Non mi riconosce più.',
        'Le capre salgono sul tetto della stalla. Non so come. Non voglio saperlo.',
        'Le pecore contano me prima di dormire.'
      ],
      rina: [
        'Ho trovato una zucca gigante. La chiamo Brom.',
        "Le fragole quest'anno sono dolcissime. Ne ho mangiate metà.",
        'Il compost è oro. Puzzolente, ma oro.'
      ],
      ottavio: [
        'Sono tornato con il carro pieno. E con un sacco di storie.',
        'Fuori dicono che Hollowmere non esiste. Mi fa ridere.',
        'Ho barattato una tua conserva con un orologio. Funziona. Più o meno.'
      ],
      irene: [
        "Ho sviluppato le foto. In una c'è un'ombra che sorride.",
        'Fotografo le mani della gente. Raccontano più delle facce.',
        "La luce dell'alba qui è diversa. Più gentile."
      ]
    }
  );

  // ---------------- saluti in base all'ora ----------------
  g(
    'saluto',
    { fase: V, ora: [5, 9] },
    {
      agatha: ["Buongiorno, tesoro! Il caffè c'è, i prezzi pure."],
      bruno: ['Buongiorno! Il pane è appena uscito. Senti il profumo?'],
      elio: ['Buongiorno! Le pecore si sono già svegliate. Io a fatica.'],
      rina: ['Buongiorno! La rugiada è il momento migliore per seminare.'],
      gaspare: ['Buongiorno. Le api sono già al lavoro. Noi?'],
      nora: ["Buongiorno. All'alba i pesci hanno fame. Io pure."]
    }
  );
  g(
    'saluto',
    { fase: V, ora: [19, 23] },
    {
      lucius: ['Buonasera. La cappella resta aperta per chi vuole.'],
      tobia: ['Hihi. Buonasera. Ora escono le lucciole. Hihi.'],
      ezekiel: ['Buonasera. Vai a letto presto, domani si lavora.'],
      ada: ["Buonasera. La luce se n'è andata. Ora dipingo a memoria."],
      teo: ['Buonasera. Esco adesso dalla miniera. Che bello il cielo.'],
      mirta: ['Buonasera. Le erbe di notte profumano di più.']
    }
  );

  // ---------------- altre reazioni ----------------
  g(
    'reazione:regalo',
    { fase: V },
    {
      gaspare: ["Un regalo fatto bene è come un fiore per un'ape."],
      elio: ['Chissà se posso regalare una pecora. Forse no.'],
      silvio: ['Se vuoi, ti faccio una scatola per incartarli.'],
      irene: ['Aspetta, ti faccio una foto mentre lo dai!']
    }
  );
  g(
    'reazione:costruzione',
    { fase: V },
    {
      gaspare: ["Lascia un po' di prato per le api, eh."],
      nora: ['Bella. Ma non costruire sul lago.'],
      teo: ['Se ti serve pietra, la miniera è piena.'],
      mirta: ['Lascia un angolo selvatico. Le erbe ringraziano.']
    }
  );
  g(
    'reazione:raccolto',
    { fase: V },
    {
      elio: ['Se avanzano foglie, le pecore ringraziano.'],
      rina: ['Bel lavoro. Ma la prossima volta lascia un fiore alle api.'],
      bruno: ['Se è grano, portamelo! Lo faccio diventare pane.'],
      irene: ['Ferm{o|a}! Che bella foto. Il contadino col raccolto.']
    }
  );
}
