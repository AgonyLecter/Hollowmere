'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (12): il tempo libero, le pecore tinte, la casa, la notte =================
// Ogni battuta ha un perché: parla di quello che succede davvero nella Valle (il falò del venerdì, la corsa coi
// sacchi, le pecore colorate, la casa del nonno rigirata, l'Albero che di notte conta ancora), con la voce di chi
// la dice, all'ora e nella stagione giusta.
{
  const V = 'valle';
  const g = (tipo, cond, perChi) => Dialoghi.gruppo(tipo, cond, perChi);
  const C = (cond, L) => Dialoghi.conversazioniCon('chiacchiera', cond, L);
  const B = (cond, L) => Dialoghi.conversazioniCon('bisbiglio', cond, L);
  const t = (tra, ...righe) => ({ tra, righe });
  const fv = st => st.free || {};
  const sv = st => fv(st).svago || {};
  const pecoreTinte = st => (fv(st).animals || []).filter(a => a.colore);
  const haPecore = st => (fv(st).animals || []).some(a => a.kind === 'pecora');
  const lettoSpostato = st =>
    Object.entries(fv(st).inside || {}).some(([k, v]) => v.id === 'letto_nonno' && k !== '1,3');
  const vinte = st => (sv(st).rec || {}).vittorie || 0;
  const alberoPasso = st => ((fv(st).segreti || {}).albero || {}).passo || 0;

  // ---------------- passando: il tempo libero ----------------
  g(
    'passaggio',
    { fase: V },
    {
      agatha: [
        ['Venerdì sera c’è il falò, tesoro. Porta le castagne: le mie le mangia tutte Brom.', { peso: 2 }],
        'Il tè delle sei è sacro. Se passi, la tazza in più c’è sempre.',
        'La corsa coi sacchi la organizzo io perché i sacchi sono miei. E perché mi piace vedere Brom che cade.',
        [
          'Una pecora rosa! Nella Valle! Mia nonna sverrebbe. Io ne voglio una.',
          { se: st => pecoreTinte(st).length > 0 }
        ],
        [
          'La lana colorata te la pago bene, sai. Le signore di Valdorso impazziscono per la fucsia.',
          { se: haPecore }
        ],
        [
          'Ho sentito che hai rigirato tutta la casa del nonno. Brav{o|a}. Le case vanno vissute, non conservate.',
          { se: lettoSpostato }
        ],
        [
          'Campion{e|essa} dei sacchi! Ti ho messo un cartello in vetrina. Non guardarlo, è venuto storto.',
          { se: st => vinte(st) > 0 }
        ]
      ],
      ezekiel: [
        'La sera del venerdì mi siedo al falò solo un’ora. Poi le ginocchia vogliono il letto.',
        [
          'Il giovedì do il pane ai piccioni. Loro non sanno che giorno è. Io sì. Ci vuole qualcuno che lo sappia.',
          { peso: 2 }
        ],
        'Ogni sera leggo una pagina della cronaca. A voce alta. Le pagine lette in silenzio si dimenticano.',
        [
          'Hai spostato il letto di tuo nonno. Lui non l’avrebbe mai fatto. Per questo era giusto che lo facessi tu.',
          { se: lettoSpostato }
        ],
        [
          'Ho scritto il tuo nome sotto «corsa coi sacchi». A matita. Il Registro ha anche pagine leggere.',
          { se: st => vinte(st) > 0 }
        ],
        [
          'Le pecore colorate… Ai miei tempi la lana era bianca o nera, come le notizie. Ma il mondo cambia.',
          { se: st => pecoreTinte(st).length > 0 }
        ]
      ],
      brom: [
        'Mh. La legna per il falò la porto io. Il fuoco grande vuole rispetto.',
        ['La domenica pesco. Se vieni, stai zitt{o|a}. È tutto quello che chiedo.', { peso: 2 }],
        'Il mercoledì aggiusto il lampione della piazza. Lo rompe il vento. O qualcuno. Non lo so.',
        [
          'Mh. Nella corsa non vinco mai. Il sacco mi va stretto. Mh. Ci provo lo stesso.',
          { se: st => !vinte(st) }
        ],
        ['Mh. Mi hai battuto coi sacchi. …Mh. Bravo. Brava. Mh.', { se: st => vinte(st) > 0 }],
        [
          'Una cesoia nuova per le tue pecore? Te la faccio. Quelle di Agatha tagliano come un cucchiaio.',
          { se: haPecore }
        ]
      ],
      lucius: [
        'Il sabato mattina pulisco le tombe. I morti non lo chiedono. Ma i vivi lo notano.',
        [
          'Stanotte guardo le stelle, se il cielo vuole. È più bello in due: le stelle si dividono senza diminuire.',
          { ora: [17, 23] }
        ],
        'Il falò del venerdì mi piace. Non lo dite a nessuno, ma canto anche io. Stonato.',
        [
          'Una pecora viola. Il colore dei paramenti dell’Avvento. Che pecora devota.',
          { se: st => pecoreTinte(st).some(a => a.colore === 'viola') }
        ],
        [
          'Una pecora nera, tinta apposta? …Le hai messo una campanella, almeno? Che si senta, di notte.',
          { se: st => pecoreTinte(st).some(a => a.colore === 'nero') }
        ]
      ],
      clara: [
        [
          'Il sabato sera si balla in piazza! Poi c’è il falò. Poi si dorme poco. Poi il pane viene storto. Ne vale la pena!',
          { peso: 2 }
        ],
        'Il martedì raccolgo i fiori per decorare le pagnotte. Le margherite sul pane di segale: buonissime da guardare.',
        'Al tè ti racconto una cosa. Una cosa vera. Forse. Vieni alle sei?',
        [
          'Una pecora gialla come il sole! Posso darle un nome? Si chiama Burro. Ho deciso.',
          { se: st => pecoreTinte(st).some(a => a.colore === 'giallo') }
        ],
        [
          'Hai rifatto il letto con la lana colorata? Che bello! Io dormo ancora con la coperta di quando avevo sei anni.',
          { se: st => !!fv(st).lettoCol }
        ],
        ['La corsa l’anno scorso l’ho vinta io. Quest’anno… ti tengo d’occhio.', { se: st => !vinte(st) }]
      ],
      tobia: [
        'Hihi. Le galline corrono più veloci dei sacchi. Io corro più veloce delle galline. Quindi sono un sacco. Hihi.',
        ['Di sera rincorro le galline. Poi le galline rincorrono me. È un patto.', { ora: [16, 20] }],
        [
          'Hihi. Le pecore colorate di notte sembrano fantasmi colorati. Mi piacciono.',
          { se: st => pecoreTinte(st).length > 0 }
        ],
        [
          'L’Albero ti ha contato. Hihi. Adesso sei nel conto. A matita, però.',
          { se: st => alberoPasso(st) >= 2 }
        ],
        [
          'Il cappello del nonno ti sta bene. Hihi. Quasi uguale. Manca solo una cosa. Hihi.',
          { se: st => alberoPasso(st) >= 3 }
        ]
      ],
      ingegnere: [
        'Sto progettando un automa per la corsa coi sacchi. Salta da solo. Il problema è che salta sempre.',
        'Il falò mi interessa scientificamente. Il fuoco è il primo motore. Poi abbiamo peggiorato tutto.',
        [
          'Le tinture delle pecore: chimica pura. Mi presti una boccetta? No, non la bevo. Forse.',
          { se: st => pecoreTinte(st).length > 0 }
        ]
      ],
      nora: ['Se peschi con Brom, non parlargli. Se peschi con me, parlami. Mi annoio, a stare zitta.'],
      bruno: [
        'La farina per i sacchi della corsa la do io. Poi la rivoglio indietro. Tutta. Anche quella che hai in faccia.'
      ],
      lia: ['Una pecora fucsia sul prato verde. Ci vorrebbe un pittore. Ci vorrebbe Ada.'],
      teo: ['In miniera non ci sono falò. Ci sono solo lampade. Per questo il venerdì vengo in piazza.'],
      mirta: [
        'La camomilla fa il giallo, la lavanda il viola. Chi l’avrebbe detto che le erbe avessero anche un colore da regalare.'
      ],
      silvio: [
        'Ti faccio un telaio più grande, se vuoi. Per gli scialli larghi. Quelli che servono d’inverno.'
      ],
      ada: ['Una pecora blu! Posso dipingerla? Cioè… posso dipingere la pecora che è già dipinta?'],
      gaspare: [
        'Le api il venerdì sera dormono. Io no: vado al falò e racconto storie di api. Nessuno ascolta. Va bene così.'
      ],
      elio: [
        'Il latte di pecora fa un pecorino che a Roma ci invidierebbero. Portamene due secchi e ti insegno.'
      ],
      rina: ['Le carote per il colorante arancio: prendile da me. Le mie sono le più arancioni della Valle.']
    }
  );

  // ---------------- passando: la stagione, il tempo, l'ora ----------------
  g(
    'passaggio',
    { fase: V, stagione: [1] },
    {
      agatha: [
        'Il freddo fa vendere le sciarpe. Le sciarpe fanno vendere i guanti. Io vendo tutto, d’inverno.'
      ],
      brom: ['Mh. La fucina d’inverno è il posto più caldo della Valle. Entra pure. Non toccare niente.'],
      clara: [
        'La neve sul forno si scioglie subito. Il forno è l’unico tetto della Valle che non porta il cappello bianco.'
      ],
      ezekiel: [
        'D’inverno le ossa parlano. Le mie raccontano tutta la storia della Valle, una giuntura alla volta.'
      ],
      lucius: ['La notte d’inverno è lunga. Accendo una candela in più. Per chi è fuori.'],
      tobia: ['Hihi. Il pupazzo di neve mi guarda. Gli ho messo gli occhi io. Adesso guarda me. Hihi.']
    }
  );
  g(
    'passaggio',
    { fase: V, stagione: [3] },
    {
      agatha: ['Che caldo, tesoro. Il burro in vetrina si scioglie e diventa pubblicità.'],
      brom: ['Mh. D’estate la fucina è un inferno. Lavoro all’alba. Poi pesco.'],
      clara: ['D’estate il pane lievita da solo. Io devo solo convincerlo a fermarsi.'],
      ezekiel: ['Le sere d’estate non finiscono mai. Le sere giuste sono così.'],
      lucius: ['Le lucciole sulle tombe. Mi piace pensare che siano visite.'],
      tobia: ['Hihi. Le cicale contano. Contano fino a mille. Poi ricominciano. Come qualcuno che conosco.']
    }
  );
  g(
    'passaggio',
    { fase: V, meteo: ['pioggia'] },
    {
      agatha: ['Pioggia! Niente corsa, niente falò, niente clienti. Solo io e il mio tè.'],
      brom: ['Mh. Pioggia. Il ferro arrugginisce. Io no.'],
      clara: ['Quando piove il pane viene più morbido. Non so perché. Io dico che il cielo impasta con me.'],
      ezekiel: [
        'La pioggia lava le pietre del Registro. Le scritte vecchie tornano a leggersi, per un giorno.'
      ],
      tobia: ['Hihi. Le pozzanghere hanno il cielo dentro. Ci salto. Cado nel cielo. Hihi.']
    }
  );
  g(
    'passaggio',
    { fase: V, ora: [21, 26] },
    {
      agatha: ['A quest’ora? Fila a letto, tesoro. Le ore piccole fanno le rughe grandi.'],
      brom: ['Mh. Tardi. La notte qui ha orecchie.'],
      ezekiel: ['Di notte la Valle è più antica. Si sente.'],
      lucius: ['Le campane dormono. Io no. Qualcuno deve vegliare le campane.'],
      tobia: [
        'Hihi. A quest’ora il bosco si sveglia. Lo senti? Conta.',
        'Hihi. Il Varco di notte è aperto. Di giorno no. Strano, eh?'
      ]
    }
  );

  // ---------------- saluti ----------------
  g(
    'saluto',
    { fase: V, ora: [5, 10] },
    {
      agatha: ['Buongiorno, tesoro! Dormito bene? Si vede di no. Prendi un caffè.'],
      brom: ['Mh. Giorno.'],
      clara: ['Buongiorno! Il pane è caldo. Cioè, era caldo. Adesso è tiepido. Ma è buono!'],
      ezekiel: ['Buongiorno, {n}. Il sole si è alzato prima di te. Non dirglielo.'],
      lucius: ['Il Signore ti dia una buona giornata, {n}. E un buon raccolto. In quest’ordine.'],
      tobia: ['Hihi! Sei ancora qui! Hihi!']
    }
  );
  g(
    'saluto',
    { fase: V, ora: [17, 21] },
    {
      agatha: ['Buonasera, tesoro. Stanca? Stanco? Il tè delle sei è passato, ma per te lo riscaldo.'],
      brom: ['Mh. Sera. La legna per stanotte ce l’hai?'],
      clara: ['Buonasera! Domani alle quattro sono in piedi. Ma stasera… stasera chiacchiero!'],
      ezekiel: ['Buonasera. Le sere sono le pagine più belle della giornata.'],
      lucius: ['Buonasera, {n}. Stanotte, se il cielo è limpido, sai dove trovarmi.'],
      tobia: ['Hihi. Sera. La sera è quando le cose cominciano.']
    }
  );

  // ---------------- reazioni a quello che fai ----------------
  g(
    'reazione:tinta',
    { fase: V },
    {
      agatha: ['Che colore! Me ne tieni una matassa?', 'Tesoro, quella pecora adesso vale il doppio!'],
      brom: ['Mh. Colorata. …Mh. Bella.'],
      clara: ['Che bella! Posso accarezzarla? Mi resta il colore sulle mani?'],
      ezekiel: ['Una pecora colorata. Annoterò anche questa.'],
      lucius: ['Il creato ha tanti colori. Uno in più non guasta.'],
      tobia: ['Hihi! Fammi una pecora rossa! Rossa come il nastro!']
    }
  );
  g(
    'reazione:tosatura',
    { fase: V },
    {
      clara: ['Lana nuova! Ci fai uno scialle? Io ne vorrei uno giallo.'],
      agatha: ['Lana! Al telaio, tesoro: con quella si fanno scialli che a Valdorso pagano oro.']
    }
  );

  // ---------------- le conversazioni fra abitanti ----------------
  C({ fase: V }, [
    t(
      'agatha brom',
      'agatha: Brom, venerdì al falò porti la legna?',
      'brom: Mh. Sempre.',
      'agatha: E le castagne?',
      'brom: …Le mangio io.',
      'agatha: Lo so. Per questo le porto io.'
    ),
    t(
      'clara tobia',
      'clara: Tobia, alla corsa ti metto nella corsia vicino a me.',
      'tobia: Così cado addosso a te? Hihi.',
      'clara: Così ti tiro su.',
      'tobia: …Hihi. Va bene.'
    ),
    t(
      'ezekiel lucius',
      'ezekiel: Fratello, al falò hai raccontato la storia del monaco e della candela.',
      'lucius: Ha riso qualcuno?',
      'ezekiel: Io. Dentro.',
      'lucius: Allora è andata bene.'
    ),
    t(
      'brom ezekiel',
      'ezekiel: Brom, il lampione della piazza…',
      'brom: Lo aggiusto mercoledì.',
      'ezekiel: Lo aggiusti ogni mercoledì.',
      'brom: Mh. E ogni martedì si rompe. Qualcuno ci sale sopra.',
      'ezekiel: …Tobia.',
      'brom: Mh.'
    ),
    t(
      'agatha clara',
      'agatha: Clara, al tè di ieri hai mangiato sei biscotti.',
      'clara: Erano piccoli!',
      'agatha: Erano i miei.',
      'clara: …Erano buonissimi.',
      'agatha: Lo so, tesoro. Per questo li conto.'
    ),
    t(
      'lucius clara',
      'clara: Fra’ Lucius, mi insegna una costellazione?',
      'lucius: Il Cavaliere Stanco. Quella lunga, con la spada inclinata.',
      'clara: Perché è stanco?',
      'lucius: Ha combattuto l’inverno per cento anni. Poi si è seduto. E l’inverno accanto a lui.',
      'clara: Che bello. Che triste. Che bello.'
    ),
    t(
      'tobia ezekiel',
      'tobia: Vecchio, le galline sono sette.',
      'ezekiel: Sette, sì.',
      'tobia: Allora perché di notte contano fino a otto?',
      'ezekiel: …Va’ a dormire, Tobia.'
    ),
    t(
      'brom clara',
      'clara: Brom, mi fai un mestolo nuovo? Quello vecchio l’ho piegato.',
      'brom: Come si piega un mestolo?',
      'clara: Impastando con passione!',
      'brom: …Mh. Te ne faccio due.'
    ),
    t(
      'agatha lucius',
      'lucius: Agatha, la corsa coi sacchi la fate anche quando piove?',
      'agatha: No: i sacchi bagnati pesano, e la farina diventa colla.',
      'lucius: Allora pregherò per il sole.',
      'agatha: Prega per Brom. Che non cada sulla mia vetrina, come l’anno scorso.'
    ),
    t(
      'ezekiel agatha',
      'ezekiel: Agatha, al tè di ieri hai parlato male di me.',
      'agatha: Ho parlato di te. Il male l’hai aggiunto tu.',
      'ezekiel: …Ho ottant’anni, Agatha.',
      'agatha: E li porti benissimo. Ecco: adesso ho parlato bene.'
    )
  ]);
  C({ fase: V, se: st => pecoreTinte(st).length > 0 }, [
    t(
      'agatha clara',
      'clara: Avete visto le pecore di {n}? Colorate!',
      'agatha: Le ho viste. Ne voglio una fucsia.',
      'clara: Io gialla!',
      'agatha: Tu non hai il prato.',
      'clara: Ho il cortile del forno. Ci sta una pecora piccola.'
    ),
    t(
      'brom tobia',
      'tobia: Brom, una pecora rossa! Rossa come il nastro! Hihi!',
      'brom: Mh. Non dire «nastro» così forte.',
      'tobia: …Perché?',
      'brom: Mh. Perché no.'
    )
  ]);
  C({ fase: V, se: lettoSpostato }, [
    t(
      'ezekiel agatha',
      'agatha: Ho sentito che {n} ha spostato il letto del nonno.',
      'ezekiel: Sì.',
      'agatha: Tu che ne pensi?',
      'ezekiel: Elias diceva che i morti trovano la strada lo stesso. Credo che avesse ragione.'
    )
  ]);

  // ---------------- bisbigli (smettono se ti avvicini) ----------------
  B({ fase: V }, [
    t(
      'agatha brom',
      'agatha: Brom… Tobia di notte esce. Va verso il Varco.',
      'brom: Mh. Lo so.',
      'agatha: E tu non dici niente?',
      'brom: Torna sempre. Con le scarpe rosse di terra. Mh. Torna sempre.'
    ),
    t(
      'clara agatha',
      'clara: Agatha, ieri notte ho sentito qualcuno contare. Fuori dalla finestra.',
      'agatha: Era Tobia con le galline.',
      'clara: Le galline erano chiuse.',
      'agatha: …Allora chiudi anche tu la finestra, tesoro.'
    ),
    t(
      'lucius brom',
      'lucius: Brom, nella fucina c’è ancora la spada del cavaliere?',
      'brom: Mh. Sì.',
      'lucius: Vibra ancora, la notte?',
      'brom: …Da quando c’è {n}, di più.'
    )
  ]);
  B({ fase: V, finale: [3] }, [
    t(
      'ezekiel lucius',
      'lucius: Ezekiel… l’Albero. Era bruciato.',
      'ezekiel: Lo so.',
      'lucius: Allora perché di notte si sentono ancora le voci?',
      'ezekiel: Le radici, fratello. Le radici non bruciano. Mai.'
    )
  ]);
  // dopo la notte dell'Albero, qualcuno se ne accorge
  B({ fase: V, se: st => alberoPasso(st) >= 1 }, [
    t(
      'agatha clara',
      'agatha: {n} stamattina aveva le scarpe rosse di terra.',
      'clara: Come Tobia.',
      'agatha: Come Tobia.',
      'clara: …Non chiediamo niente, vero?',
      'agatha: Niente, tesoro. Qui non si chiede niente.'
    ),
    t(
      'ezekiel brom',
      'ezekiel: È andat{o|a} all’Albero.',
      'brom: Mh. L’ho visto dalla fucina. Tobia davanti, con la lanterna spenta.',
      'ezekiel: Speriamo che conti bene.',
      'brom: Mh. Speriamo.'
    )
  ]);

  // ---------------- segreti che sfuggono (una volta sola, con l'amicizia) ----------------
  g(
    'sfuggito',
    { fase: V, cuori: [5, 10] },
    {
      agatha: [
        'La moneta con la porta, nel mio cassetto… stanotte la porta era aperta. Del tutto. Non dirlo a nessuno, tesoro.'
      ],
      brom: ['Mh. La spada del cavaliere in fucina. Stanotte si è girata. Da sola. Verso casa tua.'],
      clara: [
        'Ho un ammiratore segreto. Lascia fiori sulla porta del forno. Fiori rossi. Solo rossi. Mi fa un po’ paura.'
      ],
      ezekiel: [
        'Nel Registro c’è una pagina che non ho scritto io. Il tuo nome, con la mia calligrafia. Datata cinquant’anni fa.'
      ],
      lucius: [
        'La campana muta della storia… non è una storia. È nel campanile. E l’altra notte ha suonato. Una volta.'
      ],
      tobia: ['Hihi. L’Albero mi ha detto un segreto. Il segreto sei tu. Hihi. Non so cosa vuol dire.']
    }
  );
}
