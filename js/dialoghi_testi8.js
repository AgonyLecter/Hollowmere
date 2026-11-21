'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (8): giorni della settimana, lavoro, piccoli pensieri =================
{
  const S = 'storia',
    V = 'valle';
  const g = (tipo, cond, perChi) => Dialoghi.gruppo(tipo, cond, perChi);
  const giorno = d => st => (st.day + 3) % 7 === d; // 0 lunedì … 6 domenica

  // ---------------- la domenica e il sabato ----------------
  g(
    'passaggio',
    { se: giorno(6) },
    {
      lucius: [
        'Oggi è domenica. Messa alle nove. Porta qualcuno, se vuoi.',
        'La domenica la cappella profuma di cera e di pane.',
        ['Oggi predico corto. Lo prometto a tutti, ogni domenica.', { fase: V }]
      ],
      agatha: [
        'Domenica: negozio chiuso. Ma per te, tesoro, apro la finestra.',
        'La domenica metto il vestito buono. Anche se nessuno guarda.'
      ],
      ezekiel: [
        'La domenica è per riposare. Anche le Regole riposano.',
        ['La domenica una volta contavamo. Adesso mangiamo insieme.', { fase: V }]
      ],
      clara: [
        'Domenica! Niente compiti! Ah, non ho compiti. Allora niente niente!',
        'La domenica la torta di Agatha. È la regola più bella.'
      ],
      brom: ['Mh. Domenica. Forgia spenta. Mi manca.'],
      tobia: ['Hihi. La domenica tutti in cappella. Io sul campanile. Si sente meglio.']
    }
  );
  g(
    'passaggio',
    { fase: V, se: giorno(5) },
    {
      agatha: ['Sabato! Arriva il cocchiere. Prezzi da ladro, ma semi buoni.'],
      clara: ['Il sabato arriva il carro del cocchiere! Mi regala sempre una caramella. Brutta.'],
      bruno: ['Il sabato il cocchiere compra farina. Mi paga in monete di fuori. Brillano.'],
      rina: ['Sabato: semi nuovi dal carro. Il giorno più bello della settimana.']
    }
  );
  g(
    'passaggio',
    { se: giorno(0) },
    {
      agatha: [
        'Lunedì: arrivano le merci. Se arrivano.',
        'Il lunedì Lia mi porta i fiori. Che bel modo di cominciare.'
      ],
      brom: ['Mh. Lunedì. Il ferro è freddo. Lo scaldo.'],
      bruno: ['Il lunedì macino per tutta la settimana. Polvere bianca dappertutto.']
    }
  );

  // ---------------- al lavoro (quando fanno quello che fanno) ----------------
  g(
    'passaggio',
    { fase: V },
    {
      nora: [
        'Sssh. Stanno passando.',
        "Non muoverti. C'è una carpa enorme lì sotto.",
        'Oggi niente. Il lago è di cattivo umore.',
        'Il trucco è non volere il pesce. Allora arriva.'
      ],
      bruno: [
        'Uno… due… la macina gira. Senti? Canta.',
        'Attento alla farina, ti imbianca.',
        'Oggi macino grano. Domani mais. Dopodomani riposo. Ah, no: dopodomani castagne.'
      ],
      lia: [
        'Questa la metto qui… no, lì. No, qui.',
        'I gerani sono permalosi. Non guardarli male.',
        'Annaffio piano. I fiori odiano la fretta.'
      ],
      teo: [
        "Ancora un po' e trovo la vena buona.",
        'Il piccone pesa di più la sera. Strano.',
        'Sotto terra il tempo non passa. Esco e sono le sette. Di sera.'
      ],
      mirta: [
        'Questa no… questa sì… questa la tengo per Lucius.',
        'Il segreto è raccogliere senza strappare. Come con le persone.',
        'Annusa. Senti? È la salvia che ti dice ciao.'
      ],
      silvio: [
        'Un altro colpo di pialla e la tavola è perfetta. Quasi.',
        'Il legno di noce si lavora piano. Ha un carattere.',
        'Misura due volte, taglia una. Io misuro tre volte. Taglio una. Rimisuro.'
      ],
      ada: [
        'Non muoverti. Non tu, la luce.',
        'Questo verde è sbagliato. Il prato è sbagliato. Il quadro ha ragione.',
        "Ancora una pennellata. Poi un'altra. Poi è sera."
      ],
      gaspare: [
        'Piano, piano… brave.',
        'Il fumo le calma. Calma anche me.',
        'Questa arnia è la più laboriosa. Somiglia a Brom.'
      ],
      elio: [
        'Su, su, belle! Verso il prato!',
        'Fiocco, torna qui! Fiocco!',
        'Quella capra ha mangiato il mio cappello. Di nuovo.'
      ],
      rina: [
        'Una fila di cavoli, una di porri, una di speranza.',
        'Le lumache stanotte hanno banchettato. Maleducate.',
        'Guarda: un germoglio. Il primo. Il più bello.'
      ]
    }
  );

  // ---------------- piccoli pensieri, la Valle ----------------
  g(
    'passaggio',
    { fase: V },
    {
      ezekiel: [
        'Ho chiesto a Lia di piantare fiori sulle tombe del bosco. Tutte. Anche quelle senza nome.',
        'Mi hanno detto che fuori ci sono macchine che contano da sole. Che orrore.',
        'Ho imparato il nome di tutti i nuovi abitanti. Senza scriverli. Ne vado fiero.',
        'Quando passi tu, la gente sorride. Era da tanto che non vedevo sorridere la Valle.'
      ],
      agatha: [
        'Ottavio mi ha portato un catalogo di fuori. Pagine e pagine di cose inutili. Bellissimo.',
        'Ho insegnato a Ada a fare la marmellata. Lei mi ha insegnato a sporcarmi di colore. Pari.',
        'Le galline hanno fatto sette uova stamattina. Sette! Le ho contate. Ops.',
        'Se vuoi un consiglio, tesoro: vendi le conserve, non i raccolti. Lo sanno tutti. Ora anche tu.'
      ],
      lucius: [
        'Ho scritto una preghiera nuova. Non dice numeri. Neanche uno.',
        'Mi sono fatto crescere la barba. Agatha dice che sembro un tasso. Mi piace.',
        'Le candele colorate profumano di miele. Gaspare ha fatto un miracolo. Più di me.',
        'Il silenzio della cappella, adesso, è un silenzio buono.'
      ],
      clara: [
        'Ho dato un nome a ogni albero del villaggio. Quello è Ottavio. Quello è Brom. Quello sei tu.',
        'Tobia mi ha insegnato a camminare sui muretti. Non dirlo ad Agatha.',
        'Ho trovato una moneta antica nel campo! È di prima di tutti! Ezekiel dice di tenerla.',
        'Ho fatto un giuramento con Tobia: niente più segreti. Lui ha riso. Ha già un segreto.'
      ],
      brom: [
        'Mh. Ho rifatto la ringhiera del ponte. Ci si può appoggiare. Prima no.',
        "Mh. Clara mi ha regalato un disegno. L'ho appeso alla forgia. Si annerisce. Lo rifà.",
        'Mh. Ho insegnato a Teo a temprare. Ha imparato in un giorno. Io in un anno.'
      ],
      tobia: [
        'Hihi. Ho contato le stelle. Mille e una. Una è nuova. Hihi.',
        "Hihi. Ho nascosto un uovo d'anatra nel cappello di Ezekiel. Hihi. Non l'ha ancora trovato.",
        "Hihi. Ho chiesto a Lucius se posso suonare la campana. Ha detto no. L'ho suonata. Hihi."
      ]
    }
  );

  // ---------------- la storia: chi ti osserva ----------------
  g(
    'passaggio',
    { fase: S },
    {
      ezekiel: [
        ['Il nonno amava questa terra. Anche tu la amerai. Tutti finiscono per amarla.', { cap: [1, 2] }],
        ['Hai parlato con Tobia? Non dargli retta. Inventa.', { cap: [1, 2] }]
      ],
      agatha: [
        ['Se ti serve qualcosa, chiedi a me. Prima che a Ezekiel. Sempre prima.', { cap: [1, 3] }],
        ['Ho visto la tua lanterna accesa, stanotte. Spegnila, tesoro. Si vede da lontano.', { cap: [2, 4] }]
      ],
      lucius: [
        ['La tua faccia mi ricorda qualcuno. Qualcuno che è passato di qui. Tanti anni fa.', { cap: [1, 2] }],
        ['Non chiedermi niente, ti prego. Non so dire bugie e non posso dire la verità.', { cap: [2, 4] }]
      ],
      clara: [
        ['Ho una cosa da farti vedere. Non qui. Più tardi. Al fienile.', { cap: [1, 2] }],
        ['Tu non sei come gli altri forestieri. Tu fai domande.', { cap: [1, 2] }]
      ],
      brom: [['Mh. Ti guardano. Tutti. Fai finta di niente.', { cap: [1, 3] }]],
      tobia: [
        ['Hihi. Il Vecchio ha detto che sei carin{o|a}. Hihi. Per lui è un complimento.', { cap: [2, 4] }]
      ]
    }
  );

  // ---------------- reazioni (ancora) ----------------
  g(
    'reazione:raccolto',
    { fase: V },
    {
      ezekiel: ['Quando raccogli, mi viene in mente che la Valle può dare senza chiedere niente in cambio.'],
      lucius: ['Ogni raccolto è una piccola festa. Senza conteggi.'],
      agatha: ['Portami le più brutte, tesoro: con quelle faccio le conserve migliori.'],
      nora: ['Ortaggi. Mai capiti. Non nuotano.'],
      teo: ['Anche io raccolgo. Pietre. Le tue però si mangiano.'],
      ada: ['Che colore! Me la presti per un quadro? Poi te la ridò. Forse.'],
      gaspare: ['Le api hanno lavorato per te. Ringraziale con un fiore.'],
      silvio: ['Ti serve una cassetta per portarle? Te la faccio. Dritta.']
    }
  );
  g(
    'reazione:costruzione',
    { fase: V },
    {
      lucius: ["Un'altra casa, un'altra finestra accesa. Mi piace."],
      rina: ['Bella! Ma non costruire sui campi buoni, eh.'],
      ada: ['Questa la dipingo. Domani. Con la luce giusta.'],
      elio: ['Le pecore guardano la tua costruzione come se fosse una pecora gigante.']
    }
  );
}
