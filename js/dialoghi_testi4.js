'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (4): reazioni, finali, meteo, ore =================
{
  const S = 'storia',
    V = 'valle';
  const g = (tipo, cond, perChi) => Dialoghi.gruppo(tipo, cond, perChi);

  // ======================= REAZIONI A QUELLO CHE FAI =======================
  g(
    'reazione:raccolto',
    {},
    {
      '*': ['Bel raccolto!', 'Guarda che {cosa}!', 'La terra ti vuole bene.'],
      ezekiel: [
        'Le tue mani somigliano a quelle del nonno. Anche nel raccogliere.',
        'Un buon raccolto è una preghiera esaudita.',
        ['Raccogli prima del buio, {n}.', { fase: S }]
      ],
      agatha: [
        'Che {cosa}! Te la compro, tesoro. No, aspetta: te la cucino.',
        'Tesoro, quella {cosa} in vetrina farebbe la sua figura!',
        'Brav{o|a}! Mio marito non ne ha mai raccolte così.'
      ],
      lucius: [
        'Il raccolto è un dono. Anche quando costa.',
        'Uno, due… scusa. Bel raccolto.',
        ['Ringrazia la terra. Lei ricorda.', { fase: S }]
      ],
      clara: [
        'Wow! Posso tenerne una? Una piccola!',
        'Che bella! Sembra finta!',
        'Quella {cosa} è più grande della mia testa!'
      ],
      brom: ['Mh. Buona.', 'Mh. Zappa giusta, raccolto giusto.', 'Mh.'],
      tobia: [
        'Hihi! Una {cosa}! Contala! Una!',
        'Hihi. Le {cosa} ridono quando le strappi. Non lo sapevi?',
        'Hihi. Me la dai? No? Hihi.'
      ],
      rina: [
        'Così si fa! Radice intera, niente strappi.',
        'Mh, la prossima volta raccogli un giorno prima. Più dolce.',
        'Brav{o|a}. Ti assumerei.'
      ],
      bruno: [
        'Se è grano, portamelo! Se non è grano, portamelo lo stesso.',
        'Bel raccolto. Diventerà farina? No? Peccato.'
      ],
      lia: ['Che bel colore! Lo metterei in un mazzo.', 'Anche gli ortaggi sono fiori, a modo loro.'],
      elio: ['Le pecore guardano il tuo raccolto con invidia.', 'Buono. Le capre ne vorrebbero un pezzo.'],
      mirta: ["Raccolto all'ora giusta. Si vede dall'odore.", "Lavalo con l'acqua del pozzo, non del lago."]
    }
  );
  g(
    'reazione:regalo',
    {},
    {
      '*': ['Che pensiero gentile!', 'Hai visto? Un regalo!', 'Un regalo! Chissà se ne fa uno anche a me.'],
      agatha: [
        'Tesoro, a me non regali mai niente! Scherzo. Più o meno.',
        'Hai buon gusto, tesoro. Quasi quanto me.'
      ],
      clara: ["Anch'io voglio un regalo! Anche piccolo!", 'Che bello regalare. Io regalo sassi.'],
      tobia: ['Hihi. Regali? A me regala il rosso. Hihi.', 'Hihi. Il prossimo è per me. Conta!'],
      brom: ['Mh. Gentile.', 'Mh.'],
      ezekiel: ['Regalare è il modo più antico di chiedere scusa. O di dire grazie.'],
      lucius: ['Un dono fatto bene vale una predica. Due.'],
      ottavio: ['Se vuoi spedire regali fuori, ci penso io!'],
      lia: ['Un regalo senza fiori? La prossima volta aggiungine uno.']
    }
  );
  g(
    'reazione:pesca',
    {},
    {
      '*': ['Abboccato!', 'Bella presa!', 'Che pesce!'],
      nora: [
        "Bella presa. Ma il Salmerino d'oro è ancora mio.",
        'Tira piano, la prossima volta. Il pesce si arrende prima.',
        'Non male. Per essere una persona di terra.'
      ],
      tobia: ['Hihi! Un pesce! Ha gli occhi tristi. Ridagli il lago! No, tienilo. Hihi.'],
      clara: ['Un pesce! Posso toccarlo? Bleah! Di nuovo!'],
      agatha: ['Pesce fresco! Tesoro, stasera friggi.'],
      gaspare: ['Le api non pescano. Peccato. Sarebbero brave.'],
      elio: ['Le capre non mangiano pesce. Lo so perché ci hanno provato.']
    }
  );
  g(
    'reazione:costruzione',
    {},
    {
      '*': ['Che lavoro!', 'Il villaggio cresce!', "Ma l'hai fatto tu?"],
      silvio: [
        'Dritto. Quasi dritto. Brav{o|a}.',
        'La prossima volta chiamami: due mani in più non guastano.',
        'Si vede che ci hai messo il cuore. E qualche chiodo storto.'
      ],
      brom: ['Mh. Tiene.', 'Mh. Ben fatto.'],
      ezekiel: [
        'Ai miei tempi qui non si costruiva niente. Si aspettava.',
        'Il villaggio cambia faccia. Mi piace la faccia nuova.'
      ],
      agatha: ['Tesoro, dopo il villaggio mi rifai il negozio?'],
      clara: ['Posso entrarci? Posso? Posso?'],
      tobia: ['Hihi. Costruisci, costruisci. Il bosco guarda. Hihi.'],
      teo: ['Belle pietre. Le ho cavate io? No? Dovevi chiedermele.']
    }
  );
  g(
    'reazione:consegna',
    {},
    {
      '*': ['Hai visto? Mantiene le promesse.', 'Puntuale!', 'Che brav{o|a}.'],
      agatha: ['Tesoro, quando consegni a me sei sempre in ritardo! Scherzo. Più o meno.'],
      ezekiel: ['Chi mantiene le promesse è un buon vicino. Il migliore, qui.'],
      lucius: ['Una promessa mantenuta. Ne servirebbero di più, nella Valle.'],
      brom: ['Mh. Mantiene.'],
      tobia: ['Hihi. Promesse. Io le mantengo solo la notte. Hihi.']
    }
  );
  g(
    'reazione:mungitura',
    {},
    {
      '*': ['Latte fresco!', 'Che brava bestia.'],
      elio: [
        'Mani calde, mungitura buona. Si vede che le vuoi bene.',
        'Le capre non dimenticano chi le munge con garbo.'
      ],
      agatha: ['Latte fresco, tesoro! Portamene un secchio, ci faccio la crema.'],
      clara: ['Posso provare? Posso? Ah no, ho paura. Domani.'],
      tobia: ['Hihi. Il latte esce caldo. Che schifo. Che bello. Hihi.']
    }
  );
  g(
    'reazione:tosatura',
    {},
    {
      '*': ['Che lana!', 'Pecora tosata, pecora offesa.'],
      elio: [
        'Brav{o|a}. Senza un taglio. Le pecore te ne saranno grate. Tra una settimana.',
        'Bella matassa. Agatha ci farà le calze a mezza Valle.'
      ],
      agatha: ['Lana! Tesoro, ti faccio una sciarpa. Gialla. No: di che colore vuoi.'],
      clara: ['Sembra nuda! Poverina! Che ridere!']
    }
  );
  g(
    'reazione:pupazzo',
    {},
    {
      '*': ['Che bel pupazzo!', 'Gli manca il nome!'],
      clara: [
        'Si chiama Brom! No, Ezekiel! No… si chiama come te!',
        'Facciamone un altro! Una famiglia di pupazzi!'
      ],
      tobia: ['Hihi. Di notte i pupazzi si girano. Guarda domattina. Hihi.'],
      brom: ['Mh. Storto. Bello.'],
      ezekiel: ["Da ragazzo ne facevo uno ogni inverno. Poi è arrivata l'età. E il registro."],
      lucius: ['Un pupazzo davanti alla cappella. Lascialo. Mi fa compagnia.']
    }
  );

  // ======================= LA VALLE SECONDO IL FINALE =======================
  // 1: sei fuggit{o|a} e tornat{o|a} · 2: sei l'Erede, il Cavaliere delle notti · 3: il patto è spezzato
  g(
    'passaggio',
    { fase: V, finale: [1] },
    {
      ezekiel: [
        "Sei tornat{o|a} da fuori. Com'è, fuori? No, non dirmelo.",
        'Il ponte esiste. Lo sapevi tu prima di noi.',
        "Ogni volta che vedo la tua casa accesa, mi sembra di essere perdonato. Un po'."
      ],
      agatha: [
        'Tesoro, mi hai portato qualcosa da fuori? Un giornale? Uno zucchero di quelli fini?',
        'Sei andat{o|a} e sei tornat{o|a}. Da qui nessuno lo aveva mai fatto. Nessuno.'
      ],
      lucius: [
        "Hai attraversato il bosco e sei tornat{o|a} indietro. Il Signore ha un senso dell'umorismo strano.",
        'Non conto più. Quando sei tornat{o|a}, ho perso il conto.'
      ],
      clara: [
        'Fuori le luci non si spengono mai. Qui sì. Mi piace di più qui. Quasi sempre.',
        "Il papà… non l'abbiamo trovato. Ma tu sei tornat{o|a}. È già qualcosa."
      ],
      brom: [
        'Mh. Hai scelto di tornare. Rispetto.',
        'Mh. Il bosco ti ha lasciat{o|a} passare. Non lo fa con tutti.'
      ],
      tobia: [
        'Hihi. Il Vecchio ti cerca ancora. Ma piano piano. Hihi.',
        'Hihi. Fuori ci sono le giostre? Portami. Un giorno. Hihi.'
      ]
    }
  );
  g(
    'passaggio',
    { fase: V, finale: [2] },
    {
      ezekiel: [
        'Di giorno sei un vicino. Di notte… di notte ti lascio la strada libera.',
        'Il registro dice "risparmiato". Il registro mente da due secoli. Mente anche adesso?'
      ],
      agatha: [
        'Tesoro… vuoi un dolce? Un altro? Prendi, prendi.',
        'Di notte lascio una mela sul davanzale. Per te. Non so perché. Lo faccio.'
      ],
      lucius: [
        'Prego per te. Per quello che sei di giorno e per quello che sei di notte.',
        'La campana la suono più piano, la sera. Per non chiamarti.'
      ],
      clara: [
        'Il papà diceva che il Cavaliere era triste. Tu sei triste?',
        'Di giorno ti voglio bene. Di notte ti voglio bene da lontano.'
      ],
      brom: [
        'Mh. Ti ho fatto i ferri. Per il cavallo che non vedo.',
        'Mh. Le notti sono tue. I giorni siamo noi. Va bene così.'
      ],
      tobia: ['Hihi. Adesso il costume è tuo. Ti sta bene. Hihi.', 'Hihi. Di notte non ridi. Io sì. Hihi.']
    }
  );
  g(
    'passaggio',
    { fase: V, finale: [3] },
    {
      ezekiel: [
        "Ho dormito tutta la notte. Senza contare i rintocchi. Non succedeva da quarant'anni.",
        'I forestieri chiedono del registro. Dico che è un diario. È vero, adesso.',
        'Ho chiesto scusa al padre di Clara. Mi ha dato la mano. Non me lo meritavo.'
      ],
      agatha: [
        'Ho buttato le erbe del sidro, tesoro. Tutte. Il sidro adesso sa solo di mela.',
        'Il negozio è pieno di gente che non conosco. Non ho paura di nessuno. Che strano.'
      ],
      lucius: [
        'Le campane suonano per le feste e basta. Le mani mi tremano meno.',
        "Nessuno sull'ultima panca. Nessuno. Ho pianto, la prima domenica."
      ],
      clara: [
        "Il papà mi ha insegnato una canzone. È stonato. Gliel'ho detto. Ha riso.",
        'Andiamo nel bosco? È solo un bosco, adesso. Solo alberi. Che noia. Che bello.'
      ],
      brom: [
        "Mh. Ho fuso le catene dell'Albero. Ne ho fatto una campanella. Per la scuola, se un giorno c'è una scuola.",
        'Mh. Dormo. Strano. Bello.'
      ],
      tobia: [
        "Hihi. Il Vecchio non c'è più. Mi manca un pochino. Pochissimo. Hihi.",
        'Hihi. Senza costume sono basso. Me ne sono accorto adesso. Hihi.'
      ]
    }
  );
  g(
    'passaggio',
    { fase: V, finale: [3] },
    {
      nora: ['Dicono che prima di me la Valle fosse diversa. Più buia. Io la trovo luminosa.'],
      mirta: ['Il bosco brucia ancora sotto, in certi punti. Ci crescono erbe che non conosco. Buone.'],
      ada: ['Le facce adesso restano ferme nei quadri. Ho dipinto Lucius. Sorride. Lui no, il quadro.'],
      silvio: ["Il ponte nuovo l'ho visto. Brom ha messo i chiodi, io niente. Tengo il broncio."]
    }
  );
  g(
    'passaggio',
    { fase: V, finale: [1, 2] },
    {
      nora: ["Al lago, certe sere, l'acqua si increspa senza vento. Verso il bosco."],
      mirta: ['Il bosco ha ancora radici rosse. Non toccarle. Te lo dico per bene.'],
      gaspare: ['Le api tornano tutte. Tranne una ogni sera. Sempre una.'],
      elio: ["Le pecore non pascolano verso il bosco. Neanche quando l'erba è più verde."]
    }
  );

  // ======================= METEO =======================
  g(
    'passaggio',
    { meteo: ['pioggia'] },
    {
      ezekiel: ['La pioggia cancella le impronte. Anche quelle che non vogliamo vedere.'],
      agatha: [
        "Tesoro, prendi l'ombrello! Non ce l'hai? Te ne vendo uno. No, te lo presto.",
        'Con la pioggia la gente non esce. Il negozio piange.'
      ],
      lucius: ['Piove sulla cappella come piove sui giusti e sugli ingiusti. Cioè su tutti, qui.'],
      clara: [
        'Pozzanghera! Salto! Splash! Ah, mi sono bagnata tutta.',
        'Quando piove i vermi escono. Li conto. Non dirlo a Tobia.'
      ],
      brom: ['Mh. Pioggia. La forgia fuma di più.'],
      tobia: ['Hihi. La pioggia ha un sapore rosso. Assaggia. No? Hihi.'],
      nora: ['Con la pioggia i pesci salgono. Vado al lago.'],
      rina: ['Pioggia! Oggi non annaffio. Oggi canto.'],
      elio: ['Le pecore bagnate puzzano. Non ditelo a loro.'],
      gaspare: ["Le api restano a casa. Anch'io dovrei."]
    }
  );
  g(
    'passaggio',
    { meteo: ['neve'] },
    {
      ezekiel: ['La neve fa silenzio. Il villaggio sembra in attesa.'],
      agatha: ['Neve! Tesoro, a casa ho il vin brulè. Passa. Passa!'],
      lucius: ['Bianca la neve, bianca la Valle. Come una pagina nuova.'],
      clara: ['Neve neve neve! Facciamo un pupazzo? Facciamo una battaglia?'],
      brom: ['Mh. Neve. Spalo io la piazza.'],
      tobia: ['Hihi. Impronte nella neve. Le tue, le mie, e quelle là. Di chi sono? Hihi.'],
      bruno: ['Con la neve il mulino gira piano. Come se avesse freddo.'],
      teo: ['In miniera non nevica mai. Ci vado a scaldarmi.'],
      lia: ['I fiori dormono sotto la neve. Io li sento respirare.']
    }
  );
  g(
    'passaggio',
    { meteo: ['nebbia'] },
    {
      ezekiel: ['Nebbia. Resta sui sentieri, {n}.'],
      agatha: ['Con questa nebbia non vedo neanche la vetrina. Tesoro, sei tu? Sì, sei tu.'],
      lucius: ['Nella nebbia ognuno sembra qualcun altro. Anche io.'],
      clara: ['Nella nebbia gioco a nascondino da sola. Vinco sempre.'],
      tobia: ['Hihi. Nella nebbia siamo di più. Conta! Hihi.'],
      mirta: ['La nebbia porta odori lontani. Oggi sa di bosco bagnato.']
    }
  );

  // ======================= ORE DEL GIORNO =======================
  g(
    'passaggio',
    { ora: [5, 8] },
    {
      ezekiel: ['Mi alzo prima del sole. Abitudine da sentinella.'],
      agatha: ["Il pane è appena sfornato, tesoro. L'odore lo senti fino al recinto."],
      lucius: ['La prima campana la suono io. La seconda… di solito anche.'],
      brom: ['Mh. Forgia accesa. Giorno iniziato.'],
      rina: ["L'alba è l'ora migliore per l'orto. Le foglie bevono di più."],
      nora: ["All'alba il lago è uno specchio. Peccato rompere."],
      elio: ['Le pecore escono adesso. Io dietro, mezzo addormentato.']
    }
  );
  g(
    'passaggio',
    { ora: [12, 14] },
    {
      agatha: ["A mezzogiorno chiudo mezz'ora. Mangio. Non disturbatemi, tesoro. Tranne te."],
      clara: ['Ho fame! Sempre fame! La mamma dice che ho un buco nella pancia.'],
      brom: ['Mh. Pane e formaggio. Poi di nuovo il ferro.'],
      bruno: ['Il pane di mezzogiorno è il più buono. Non chiedetemi perché. Lo è.']
    }
  );
  g(
    'passaggio',
    { ora: [19, 22] },
    {
      ezekiel: [
        'Si accendono le finestre. Mi piace contarle. Non per Regola. Per piacere.',
        ['Le finestre accese sono tante, stasera. Brutto segno o bel segno? Non so più.', { fase: S }]
      ],
      agatha: ['Chiudo, tesoro. Domani alle sette.'],
      lucius: ["La sera è l'ora delle confessioni. Nessuno viene. Io aspetto lo stesso."],
      clara: ['Le stelle! Quella è la mia. No, quella. No, tutte.'],
      tobia: ['Hihi. La sera è la mia ora preferita. Poi viene la notte. Ancora meglio. Hihi.'],
      gaspare: ['Le api tornano. Le conto. Tutte. Sempre tutte.']
    }
  );
  g(
    'passaggio',
    { ora: [22, 29], fase: V },
    {
      '*': ['Ancora sveglio, {n}?', 'Buonanotte…'],
      lucius: ['Non riesco a dormire. Faccio due passi. Non contando.'],
      tobia: ['Hihi. Di notte la Valle sussurra. Ascolta. Hihi.'],
      mirta: ['Raccolgo le erbe della notte. Non fare domande.']
    }
  );
}
