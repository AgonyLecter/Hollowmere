'use strict';
// ================= LE BATTUTE DEGLI ABITANTI =================
// Solo testo e condizioni: il funzionamento è in js/dialoghi.js (lì è spiegato il formato).
// Regole di coerenza con la storia (le controlla il test dei dati):
//  - l'Albero si nomina dal Capitolo II (lo racconta Ezekiel); teste, radici rosse, catene e la verità sul
//    nonno-Cavaliere solo dal Capitolo III (cap: [3]) o nella Valle;
//  - nei capitoli I e II gli anziani mentono: il ponte "crollato", i "lupi" nel bosco, il nonno "morto sereno";
//  - nella Valle conta il finale: 1 sei fuggit{o|a} e tornat{o|a}, 2 sei l'Erede (il Cavaliere delle notti), 3 il patto è spezzato.
const S = 'storia',
  V = 'valle';
const MATTINA = [5, 12],
  POMERIGGIO = [12, 18],
  SERA = [18, 22],
  NOTTE = [22, 29];

// ======================= SALUTI =======================
Dialoghi.aggiungi('saluto', {
  ezekiel: [
    ['Buongiorno, {n}. Le Regole le ricordi?', { fase: S, ora: MATTINA }],
    [
      '{n}. Spero tu abbia dormito. Qui si dorme bene, se si rispettano le Regole.',
      { fase: S, ora: MATTINA }
    ],
    [
      'Buon pomeriggio. Il recinto giallo è sempre lì, {n}. Non spostarlo con lo sguardo.',
      { fase: S, ora: POMERIGGIO }
    ],
    ['Si fa sera, {n}. Tra poco la campana.', { fase: S, ora: SERA }],
    ['Ancora fuori? Rientra, {n}. Te lo chiedo per favore.', { fase: S, ora: NOTTE }],
    ['{n}. Cammini molto, per essere appena arrivat{o|a}.', { fase: S, cap: [1, 1] }],
    ['Sei ancora qui, {n}. Bene. Bene.', { fase: S, cap: [2, 2] }],
    ['Non guardarmi così, {n}. Ti ho detto tutto quello che so. Quasi.', { fase: S, cap: [3, 4] }],
    ['Buongiorno, {n}. La Valle è tranquilla, oggi.', { fase: V, ora: MATTINA }],
    ['{n}. Il registro ha una pagina nuova, adesso. La tua.', { fase: V, finale: [1] }],
    ['Buongiorno… {n}. Hai riposato? Le notti sono lunghe, per te.', { fase: V, finale: [2] }],
    ['Non chiamarmi Anziano, {n}. Non più. Ezekiel basta.', { fase: V, finale: [3] }],
    [
      'Buonasera, {n}. Il tramonto qui era una minaccia. Adesso è solo un tramonto.',
      { fase: V, finale: [3], ora: SERA }
    ],
    ['Copriti, {n}. La neve qui pesa più che altrove.', { meteo: ['neve'] }],
    ['La pioggia lava i sentieri, {n}. Non le colpe.', { meteo: ['pioggia'] }]
  ],
  agatha: [
    ['Buongiorno, tesoro! Il pane è ancora caldo, se ti sbrighi.', { ora: MATTINA }],
    ['Tesoro! Dormito bene? Hai una faccia… vieni che ti do una mela.', { fase: S, ora: MATTINA }],
    ['Ciao, tesoro. Hai mangiato? No, non dirmelo: si vede che no.', { ora: POMERIGGIO }],
    ['Buonasera, tesoro. Chiudo tra poco, se ti serve qualcosa.', { ora: SERA }],
    ["Tesoro, a quest'ora! Fila a casa. Fila!", { fase: S, ora: NOTTE }],
    ['Eccoti, tesoro. Hai visto che giornata? Una di quelle che si ricordano.', { cuori: [4] }],
    ['Il mio cliente preferito! Non dirlo a Ezekiel, si offende.', { cuori: [6] }],
    ['Ciao, tesoro. Non stare troppo vicino al recinto, eh. Te lo dico io.', { fase: S, cap: [1, 2] }],
    ['Tesoro. Ieri sera ho pensato a te. Tutta la sera.', { fase: S, cap: [2, 4], h2: true }],
    [
      "Tesoro! Bentornat{o|a}. Te l'ho detto io che le mele del recinto erano per i forestieri.",
      { fase: V, finale: [1] }
    ],
    ['B-buongiorno, tesoro. Vuoi… vuoi qualcosa? Offro io.', { fase: V, finale: [2] }],
    [
      'Tesoro! Hai visto quanta gente nuova? Il negozio non è mai stato così pieno.',
      { fase: V, finale: [3] }
    ],
    ['Che acqua, tesoro! Entra un momento, che ti asciughi.', { meteo: ['pioggia'] }],
    ['Brr, tesoro. Ho del vin brulè. Non dirlo a Lucius.', { meteo: ['neve'] }]
  ],
  lucius: [
    ['Pace a te, {n}. Il giallo ti protegga.', { fase: S }],
    ['Buongiorno, {figliolo|figliola}. Uno… volevo dire: buongiorno.', { fase: S, ora: MATTINA }],
    ['Il Vespro è stasera, {n}. Ti aspetto. Ci contiamo tutti.', { fase: S, cap: [1, 1], ora: [10, 18] }],
    ['{figliolo|figliola}. Ho pregato per te. Non so bene a chi, ma ho pregato.', { fase: S, cap: [2, 4] }],
    ['Buonasera, {n}. Conto le stelle, la sera. Sono sempre di più.', { ora: SERA }],
    ['Pace a te, {n}. Oggi le campane suonano solo quando le tocco io.', { fase: V, finale: [3] }],
    [
      'Buongiorno, {n}. Non conto più nessuno, sai? Faccio fatica. Le mani lo fanno da sole.',
      { fase: V, finale: [3] }
    ],
    ["{n}. Sei tornat{o|a}. Allora il Signore ha un senso dell'umorismo.", { fase: V, finale: [1] }],
    ['…Pace a te, {n}. Pace anche a quello che sei, di notte.', { fase: V, finale: [2] }],
    ["Buongiorno, {n}. Ho fatto la predica sull'abbondanza. Tre persone si sono addormentate.", { fase: V }],
    ['Che neve, {n}. Bianca come le pagine che non ho scritto.', { meteo: ['neve'] }]
  ],
  clara: [
    ['Ciao {n}! Indovina cosa ho trovato stamattina? No, non te lo dico.', { ora: MATTINA }],
    ['{n}! Vieni, vieni! Ah, no, niente. Volevo solo salutarti.', {}],
    ['Ciao! Hai le mani sporche di terra. Anche io! Siamo uguali.', { fase: S }],
    [
      'Buonasera, {n}. La mamma dice di non parlare coi forestieri dopo il tramonto. Tu però non conti.',
      { fase: S, ora: SERA }
    ],
    ['{n}… sei viv{o|a}. Cioè: ciao! Ciao.', { fase: S, cap: [2, 2] }],
    ["Ce l'hai ancora la mia lanterna? Trattala bene. Era di… era mia.", { fase: S, flag: 'claraAlly' }],
    ['{n}! Il papà mi ha fatto le trecce. Le sa fare storte. Sono bellissime.', { fase: V, finale: [3] }],
    [
      'Ciao, {n}! Il papà dice che sei la persona più coraggiosa della Valle. Io lo dicevo da prima.',
      { fase: V, finale: [3], cuori: [3] }
    ],
    ['{n}! Fuori ci sono le luci che non si spengono. Ma qui ci sei tu.', { fase: V, finale: [1] }],
    ['Ciao, {n}. Di giorno non mi fai paura. Di giorno no.', { fase: V, finale: [2] }],
    ['Neve! {n}, NEVE! Facciamo un pupazzo? Facciamo una battaglia? Facciamo tutto?', { meteo: ['neve'] }],
    [
      'Pioggia! Le pozzanghere più grandi sono dietro la cappella. Non dirlo a nessuno.',
      { meteo: ['pioggia'] }
    ]
  ],
  brom: [
    ['Mh. Giorno.', {}],
    ['Mh.', {}],
    ['{n}.', { cuori: [0, 2] }],
    ['Mh. Buongiorno, {n}. Hai gli attrezzi in ordine?', { cuori: [3] }],
    ['…Ciao. Sì. Ciao.', { cuori: [5] }],
    ['Mh. Torna a casa prima della campana.', { fase: S, ora: [16, 22] }],
    ['Mh. Non guardarmi le mani. Tremano solo la mattina.', { fase: S, cap: [3, 4], cuori: [3] }],
    ['Mh. Il ferro oggi canta. Buon segno.', { fase: V, ora: MATTINA }],
    ['…Mh. Buongiorno. Ti ho fatto un ferro di cavallo. Per la porta. Se vuoi.', { fase: V, finale: [2] }],
    ['Mh. Ho rifatto i chiodi del ponte. Tengono.', { fase: V, finale: [3] }],
    ['Mh. Freddo. Bene per la forgia.', { meteo: ['neve'] }]
  ],
  tobia: [
    ['Hihi! Ciao!', {}],
    ['Ti ho vist{o|a}! Io vedo tutto. Quasi tutto. Hihi.', {}],
    ['Buongiorno! Sai quanti siamo, oggi? Io lo so. Hihi.', { fase: S }],
    ['Hihi. Hai i piedi sporchi di bosco. No? Ancora no. Hihi.', { fase: S, cap: [1, 2] }],
    ["Sei tornat{o|a} dall'Albero! Lo sapevo! Hai visto il Vecchio?", { fase: S, cap: [3, 4] }],
    ['Hihi. Ciao, Cavaliere! Cioè: ciao, {n}! Hihi.', { fase: V, finale: [2] }],
    ["Il costume l'ho bruciato! Tutto! Anche le scarpe alte! Hihi!", { fase: V, finale: [3] }],
    ['Hihi. Neve! Ti tiro una palla. Non adesso. Tra un attimo. ADESSO. Hihi.', { meteo: ['neve'] }]
  ],
  ottavio: [
    ['Posta per la Valle! No, per te niente. Però ciao!', {}],
    ['Buongiorno! Sai che il ponte regge? Ogni volta ci passo trattenendo il fiato.', {}],
    ['Ehilà, {n}! Fuori è uscito un telefono che fa le foto al buio. Qui servirebbe.', {}],
    ['Ciao, {n}. Ho una lettera per Ezekiel. Pesa come un mattone. Chissà.', { cuori: [2] }]
  ],
  irene: [
    ['Buongiorno, {n}. Non muoverti: la luce è perfetta. No, ecco, è sparita.', {}],
    ['Ciao. Ti ho fotografat{o|a} ieri, di spalle. Non eri sol{o|a}, nella foto.', {}],
    ["Buonasera, {n}. A quest'ora le foto vengono strane. Le faccio lo stesso.", { ora: SERA }]
  ],
  mercante: [
    ["«Ancora qui. Ve l'avevo detto, di non venire.»", {}],
    ['«Merce di fuori. Contanti. Niente domande.»', {}],
    ['«Buongiorno. Se così si può dire, da queste parti.»', {}]
  ],
  nora: [
    ["Buongiorno. L'acqua è calma, oggi. Troppo calma.", { ora: MATTINA }],
    ['Ciao, {n}. Hai visto dove saltano i pesci? Io sì.', {}],
    ['Sera. I pesci migliori abboccano col buio. Come le brutte notizie.', { ora: SERA }]
  ],
  bruno: [
    ['Buongiorno! Hai farina sulle scarpe. Ah no, sono io che ne ho sulle tue.', {}],
    ['Ciao, {n}. Il mulino gira, la Valle mangia. Semplice.', {}],
    ['Buonasera. Ho le mani bianche fino ai gomiti. Domani di nuovo.', { ora: SERA }]
  ],
  lia: [
    ['Buongiorno, {n}! Le margherite oggi ti guardano. Si vede che ti vogliono bene.', {}],
    ["Ciao! Ti metto un fiore all'occhiello? Dai, uno solo.", {}],
    ['Buonasera. I fiori di sera chiudono gli occhi. Io no, ancora no.', { ora: SERA }]
  ],
  teo: [
    ['Buongiorno. Ho la polvere della Collina anche nei sogni.', {}],
    ['{n}. Piccone affilato? Allora siamo amici.', {}],
    ['Sera. Sotto terra la sera non esiste. Qui sì, per fortuna.', { ora: SERA }]
  ],
  mirta: [
    ["Buongiorno, {n}. Hai dormito poco. La camomilla, te l'avevo detto.", {}],
    ["Ciao. Raccogli all'alba, ricordatelo. Le erbe hanno ancora la memoria.", { ora: MATTINA }],
    ["Buonasera. A quest'ora certe radici cambiano odore. Io lo sento.", { ora: SERA }]
  ],
  silvio: [
    ['Buongiorno, {n}. Quella staccionata è storta di due dita. Lo so, non è tua.', {}],
    ['Ciao. Il legno di oggi è buono. Si sente dal suono.', {}],
    ['Sera. Ho piallato tutto il giorno. Ho le mani lisce come una tavola.', { ora: SERA }]
  ],
  ada: [
    ['Buongiorno, {n}! Ti posso ritrarre? Stai ferm{o|a}. Più ferm{o|a}. Ecco, hai mosso il naso.', {}],
    ['Ciao. Oggi i colori della Valle sono giusti. È raro.', {}],
    ['Buonasera. Dipingo il tramonto da tre settimane. Non finisce mai uguale.', { ora: SERA }]
  ],
  gaspare: [
    ['Buongiorno. Le api ti hanno annusat{o|a}. Sei promoss{o|a}.', {}],
    ['Ciao, {n}. Miele scuro, oggi. Le api hanno girato vicino al bosco.', {}],
    ['Sera. Le api dormono. Io dovrei imparare da loro.', { ora: SERA }]
  ],
  elio: [
    ['Buongiorno. Le pecore ti salutano. Io pure, a modo mio.', {}],
    ["{n}. Hai l'aria di chi conta le nuvole. Io conto le pecore. Siamo pari.", {}],
    ['Sera. Le porto dentro prima del buio. Abitudine vecchia.', { ora: SERA }]
  ],
  rina: [
    ['Buongiorno, {n}! Hai già annaffiato? La terra ha sete presto, qui.', { ora: MATTINA }],
    ['Ciao! Fammi vedere le mani. Mh, calli giusti. Brav{o|a}.', {}],
    ['Buonasera. Ho seminato i ravanelli stamattina. Domani mi diranno se ho fatto bene.', { ora: SERA }]
  ]
});

// ======================= FRASI AL PASSAGGIO =======================
Dialoghi.aggiungi('passaggio', {
  ezekiel: [
    ['Il rosso si seppellisce, {n}. Sempre.', { fase: S }],
    [
      "Il ponte è crollato con la piena di trent'anni fa. Nessuno l'ha più rifatto. Non serviva.",
      { fase: S, cap: [1, 2] }
    ],
    ["Tuo nonno era un uomo tranquillo. Se n'è andato sereno.", { fase: S, cap: [1, 2] }],
    ["Le zucche quest'anno sono enormi. È un buon segno. Per la Valle.", { fase: S }],
    ['Il bosco è pieno di lupi, {n}. Per questo il recinto.', { fase: S, cap: [1, 2] }],
    ['Ogni Regola ha un motivo. Anche se il motivo non piace.', { fase: S }],
    ["Ho tenuto il registro per quarant'anni. Le pagine pesano.", { fase: S, cap: [3, 4] }],
    ["La Valle ti guarda, {n}. Fa così con tutti. Con te un po' di più.", { fase: S, cap: [2, 4] }],
    [
      'Domani è la Festa. Mangia, ridi. E non bere niente che non hai visto versare.',
      { fase: S, cap: [4], cuori: [4] }
    ],
    ['Le Regole le ho scritte su carta nuova. Le vecchie… le ho bruciate.', { fase: V, finale: [3] }],
    ['Ci sono forestieri in piazza. Forestieri veri. Non so più cosa dire loro.', { fase: V, finale: [3] }],
    ["Il registro dei Nuovi Arrivati è chiuso. L'ho legato con lo spago.", { fase: V, finale: [1, 3] }],
    ['Ti chiedo scusa, {n}. Lo farò ogni giorno, finché non basta.', { fase: V, finale: [1], cuori: [3] }],
    ['Le notti sono tue, ormai. I giorni… cerchiamo di dividerli.', { fase: V, finale: [2] }],
    ['Il villaggio cresce. Io invecchio. È giusto così.', { fase: V }],
    ['Un tempo contavamo gli abitanti. Adesso li conto per piacere.', { fase: V }]
  ],
  agatha: [
    ['Mele fresche! Rosse… no, gialle. Solo gialle, tesoro.', { fase: S }],
    ['Hai sentito? Brom ha rifatto il ferro alla porta della cappella. Chissà perché.', { fase: S }],
    ['Le mele del recinto sono le più dolci. Non chiedermi perché.', { fase: S, cap: [1, 3] }],
    [
      'Tesoro, quel nastro rosso… no, niente. Non ho visto niente.',
      { fase: S, se: () => countItem('nastro') > 0 }
    ],
    ['Il sidro della Festa lo faccio io. Ogni anno. Ogni anno.', { fase: S, cap: [3, 4] }],
    ['Non fidarti dei sorrisi stasera, tesoro. Neanche del mio.', { fase: S, cap: [4], cuori: [3] }],
    ['Prezzi onesti! Più onesti di certe persone, tesoro.', {}],
    ['Hai visto Lucius? Conta di nuovo le pecore che non abbiamo.', { fase: S }],
    ['Ho finito lo zucchero. Ottavio dice che fuori lo vendono a chili. A CHILI, tesoro.', { fase: V }],
    ['Quella pittrice mi ha fatto il ritratto. Sembro più giovane. Lo appendo in vetrina.', { fase: V }],
    [
      'Una signora di fuori mi ha chiesto se accetto «la carta». Che carta, tesoro?',
      { fase: V, finale: [3] }
    ],
    ['Il tuo villaggio sta diventando bello, tesoro. Il nonno sarebbe fiero. Davvero.', { fase: V }],
    ['Brom stamattina ha detto quattro parole di fila. Quattro! Annotalo.', { fase: V }],
    ["Le uova d'anatra fanno torte più gialle. Te lo dico come segreto di bottega.", { fase: V }],
    ["Semi di stagione, tesoro! Chi semina bene, d'inverno non piange.", { fase: V }]
  ],
  lucius: [
    ['…cinque, sei, sette… oh, scusa. Abitudine.', { fase: S }],
    ['La pace sia con te. E con chi ti cammina dietro.', { fase: S, cap: [2, 4] }],
    ['Il giallo protegge. Così dicono. Così diciamo.', { fase: S }],
    ["Ho suonato la campana alle sei. O l'ha suonata qualcun altro? Non ricordo.", { fase: S, cap: [2, 4] }],
    ['Non ho mai sbagliato un conto. Mai. È questo il problema.', { fase: S, cap: [2, 4] }],
    [
      "Le candele della cappella si spengono da sole, ultimamente. Verso l'ultima panca.",
      { fase: S, cap: [1, 3] }
    ],
    ['Perdonami, {n}. Non so di cosa, ancora. Ma perdonami.', { fase: S, cap: [3, 4], cuori: [2] }],
    ["Domenica predico sull'ospitalità. Non ridere. Ci sto provando.", { fase: V }],
    ['Le campane suonano per le feste, adesso. Solo per le feste.', { fase: V, finale: [3] }],
    ["Ho tolto l'ultima panca. Nessuno ci si sedeva più. Nessuno.", { fase: V, finale: [3] }],
    ['Prego per le notti tranquille. A volte funziona.', { fase: V, finale: [2] }],
    ['I nuovi abitanti vengono a messa per curiosità. Va bene anche la curiosità.', { fase: V }],
    ['Uno, due… no. Basta contare. Basta.', { fase: V }]
  ],
  clara: [
    ['♪ La la la… ♪', {}],
    ['Sai fischiare? Io sì. Solo con una mano in bocca, però.', {}],
    ['Ho visto un gatto nero con tutti e due gli occhi gialli. Fortuna doppia!', {}],
    [
      'La mamma dice che oltre il recinto ci sono i lupi. Io non ho mai sentito un lupo.',
      { fase: S, cap: [1, 2] }
    ],
    ['Il papà conosceva tutte le stelle per nome. Io ne so tre.', { fase: S }],
    ['Se vedi Tobia con le scarpe alte, non ridere. Si offende.', { fase: S, cap: [1, 3] }],
    ['Non ho paura del bosco. Ho paura di quello che dicono del bosco. È diverso.', { fase: S, cap: [2, 4] }],
    [
      'Ho tenuto la lanterna accesa tutta la notte. Per te. Non dirlo.',
      { fase: S, cap: [3, 4], flag: 'claraAlly' }
    ],
    ['Il papà non si ricorda tante cose. Gliele racconto io, una al giorno.', { fase: V, finale: [3] }],
    ["Fuori c'è una cosa che si chiama gelato. Ottavio dice che te la porta se fai la brava.", { fase: V }],
    ['Ho piantato un girasole. È più alto di me! Non di Brom, però.', { fase: V }],
    ['Le pecore di Elio hanno un nome per ciascuna. Io le so tutte!', { fase: V }],
    ['Da grande faccio la guida del bosco. Adesso è un bosco normale, no? No?', { fase: V, finale: [3] }]
  ],
  brom: [
    ['Mh.', {}],
    ['…', {}],
    ['Lavoro.', {}],
    ['Mh. Ferri di cavallo. Troppi, per una valle senza cavalli.', { fase: S }],
    ['Non chiedere.', { fase: S, cap: [1, 3] }],
    ["Mh. La campanella di Agatha. L'ho fatta io. Con i ferri.", { fase: S }],
    ['Corri, quando senti gli zoccoli. Non pensare. Corri.', { fase: S, cap: [2, 4], cuori: [3] }],
    ['Mh. Gli attrezzi. Portali, li sistemo.', { fase: V }],
    ['Mh. Silvio dice che pialla meglio di me. Ha ragione. Non diteglielo.', { fase: V }],
    ['Mh. Teo ha trovato ferro buono nella miniera. Buon ferro.', { fase: V }],
    ['Mh. Le notti fanno meno rumore. Dormo.', { fase: V, finale: [3] }]
  ],
  tobia: [
    ['Hihi!', {}],
    ['Una, due, tante!', {}],
    ['Conta, conta! Hihi.', { fase: S }],
    ['Lo sai che il Vecchio non ha le mani? Hihi. Neanche la testa.', { fase: S, cap: [2, 4] }],
    ['Le scarpe alte sono sotto il letto. Shhh.', { fase: S, cap: [2, 4] }],
    ['Hihi. Rosso! Rosso rosso rosso. Non dirlo a Ezekiel.', { fase: S }],
    ['Gli alberi del bosco parlano. Dicono sempre lo stesso nome. Hihi.', { fase: S, cap: [3, 4] }],
    ['Io il Cavaliere lo facevo per gioco. Tu no, vero? Hihi.', { fase: V, finale: [2] }],
    ['Ho insegnato una canzone alle anatre. Non la cantano. Maleducate.', { fase: V }],
    [
      'Hihi. Ho scoperto che fuori ci sono le giostre. Ci voglio andare. Con il costume no.',
      { fase: V, finale: [1, 3] }
    ],
    ['Le api di Gaspare mi conoscono. Mi pungono per salutarmi. Hihi.', { fase: V }]
  ],
  ottavio: [
    ["Raccomandata per l'Anziano! Firma qui. No, non lei, l'Anziano.", {}],
    ["In città dicono che questa valle non c'è sulle mappe. Allora io dove consegno?", {}],
    ['Se hai roba buona da vendere, la porto fuori. Pago bene!', {}],
    ['Irene mi ha fatto vedere una foto. Non dormo da due giorni.', {}],
    ["Ho portato una cartolina del mare a Clara. L'ha appesa sopra il letto.", { fase: V }]
  ],
  irene: [
    ['Le facce, qui, non vengono a fuoco. Solo le facce.', {}],
    ['Conto le fotografie. Ne manca sempre una.', {}],
    ["Ho fotografato la cappella da dentro. C'è una panca in più, nella foto.", { fase: V, finale: [1, 2] }],
    ['Da quando il bosco è bruciato, le foto vengono normali. È quasi peggio.', { fase: V, finale: [3] }]
  ],
  mercante: [
    ['«Semi di fuori. Crescono meglio, qui. Chissà perché.»', {}],
    ['«Io non scendo dalla carrozza dopo il tramonto. Mai.»', {}],
    ['«Ho portato tante persone a quel ponte. Me le ricordo tutte.»', {}]
  ],
  nora: [
    ["Il Salmerino d'oro esiste. Io l'ho visto. Una volta.", {}],
    ['Pesco da quando avevo sei anni. Qui i pesci ti guardano prima di abboccare.', {}],
    ['Le carpe del lago sono vecchie. Più vecchie del villaggio, scommetto.', {}],
    ['Al lago, la sera, si sente cantare. Non è nessuno. Credo.', { finale: [1, 2] }]
  ],
  bruno: [
    ['Il grano cresce bene nella Valle. Strano, con questa luce.', {}],
    ['Farina! Chi vuole farina? Tutti vogliono farina.', {}],
    ['Il mio mulino ha le pale che cantano. Una canzone sola, ma la sa bene.', {}],
    'Pane di grano, adesso. Prima solo mais. La Valle mangia meglio.'
  ],
  lia: [
    ['Un villaggio senza fiori è un cimitero con le finestre.', {}],
    ['La lavanda tiene lontane le tarme. E certi pensieri.', {}],
    ['I girasoli qui girano verso il bosco, non verso il sole. Li sto convincendo.', { finale: [1, 2] }],
    ['Ho fatto una corona di fiori per Agatha. Ha pianto. Bene, credo.', {}]
  ],
  teo: [
    ["Sotto la Collina c'è un piano che non finisce. L'ho sognato. Spero.", {}],
    ['Rame, ferro, quarzo. E una volta un dente. Non ho chiesto di chi.', {}],
    ['Lanterna e piccone. Il resto è fortuna.', {}],
    ['Brom lavora il mio ferro come se gli parlasse. Forse gli parla.', {}]
  ],
  mirta: [
    ["Per ogni male c'è un'erba. Per la Valle ce ne vogliono parecchie.", {}],
    ['La camomilla di qui fa sognare. A volte troppo.', {}],
    ['Non mangiare mai le radici rosse del bosco. Mai.', { finale: [1, 2] }],
    ['La lavanda in sacchetto sotto il cuscino. Fidati di una vecchia.', {}]
  ],
  silvio: [
    ["Il legno buono si sente con l'orecchio, non con l'occhio.", {}],
    ["Questa panchina l'ho fatta io. Sedetevi con rispetto.", {}],
    ['Le case della Valle hanno travi vecchie di due secoli. Ancora dritte. Che rabbia.', {}],
    ["Il legno dell'Albero bruciato? Non lo tocco. Non chiedetemelo.", { fase: V, finale: [3] }]
  ],
  ada: [
    ['Le facce non vengono mai bene, qui. Si muovono anche nel ritratto.', {}],
    ["Ho finito il blu. Il cielo della Valle se l'è mangiato tutto.", {}],
    ['Colora il tuo tetto. La Valle ha bisogno di colore.', {}],
    [
      "Ho dipinto la cappella. Nel quadro c'era una figura in più. L'ho coperta col bianco. Torna.",
      { finale: [1, 2] }
    ]
  ],
  gaspare: [
    ['Le api sanno chi sei. Non mentire mai vicino a un alveare.', {}],
    ['Più fiori pianti, più le api ti vogliono bene.', {}],
    ['Il miele della lavanda è il più chiaro. Il più onesto.', {}],
    ['Le api non vanno mai verso il bosco. Mai. Loro sanno.', { finale: [1, 2] }]
  ],
  elio: [
    ["Le pecore non sono stupide. Sono prudenti. C'è differenza.", {}],
    ["Lana buona quest'anno. L'erba della Valle è grassa.", {}],
    ['Fiocco è scappata di nuovo. La trovo sempre davanti alla cappella.', {}],
    ["Il latte di capra fa venire la forza. E un po' di carattere.", {}]
  ],
  rina: [
    ['La terra della Valle è nera e grassa. Le manca solo qualcuno che la ascolti.', {}],
    ['I piselli vogliono il palo. Come certe persone.', {}],
    ['Il cavolfiore è paziente come un vecchio. Io no.', {}],
    ['Ho insegnato a Clara a distinguere i germogli. È più brava di me.', {}]
  ],
  '*': [
    ['Bella giornata, eh?', { meteo: ['sereno'], fase: V }],
    ['Che acqua!', { meteo: ['pioggia'] }],
    ['Nebbia fitta… non si vede il recinto.', { meteo: ['nebbia'], fase: S }],
    ['Nebbia. Si sentono le voci, ma non le facce.', { meteo: ['nebbia'], fase: V }]
  ]
});

// ======================= SEGRETI CHE SFUGGONO =======================
// Una volta sola per partita, sottovoce, quando passi vicino a un abitante amico.
Dialoghi.aggiungi('sfuggito', {
  agatha: [
    [
      'Le mele del recinto le raccolgo di notte. Non chiedermi chi mi fa luce.',
      { fase: S, cuori: [3], una: true }
    ],
    [
      "Il sidro… ha un'erba dentro. Non cattiva, tesoro. Ti fa solo dire di sì.",
      { fase: S, cap: [2, 4], cuori: [4], una: true }
    ],
    [
      'Anche mio marito era un forestiero, tesoro. Il registro dice "partito". Da qui non parte nessuno.',
      { fase: S, cuori: [5], una: true }
    ],
    [
      'Ho ancora la sua sciarpa rossa. Sepolta sotto il pavimento del negozio. Non riesco a buttarla.',
      { fase: V, cuori: [6], una: true }
    ]
  ],
  ezekiel: [
    [
      'Il registro ha pagine strappate. Le ho strappate io, da ragazzo. Non volevo leggerle.',
      { fase: S, cuori: [3], una: true }
    ],
    [
      "Mio padre cucì il costume. Mio nonno lo indossò. Io… io l'ho stirato. Ogni autunno.",
      { fase: S, cap: [2, 4], cuori: [4], una: true }
    ],
    [
      "Ho visto tuo nonno, l'ultima notte. Rideva. Non ho mai capito perché rideva.",
      { fase: S, cap: [3, 4], cuori: [5], una: true }
    ],
    ['A volte sogno ancora le campane della Festa. Mi sveglio contando.', { fase: V, cuori: [5], una: true }]
  ],
  lucius: [
    [
      "Al primo Vespro avevo contato sette. Poi ho detto otto. Non so chi me l'abbia messo in bocca.",
      { fase: S, cap: [2, 4], cuori: [2], una: true }
    ],
    [
      "Nella sacrestia c'è una croce di legno rosso. La giro verso il muro ogni sera. Ogni mattina è girata verso di me.",
      { fase: S, cuori: [4], una: true }
    ],
    [
      'Non sono un prete vero, {figliolo|figliola}. Ho trovato la tonaca nella cappella. Era della mia misura.',
      { cuori: [6], una: true }
    ]
  ],
  clara: [
    [
      'Il papà teneva un nastro rosso in tasca. Me lo faceva vedere solo al compleanno.',
      { fase: S, cuori: [2], una: true }
    ],
    [
      'Certe notti uno senza faccia si ferma davanti alla mia finestra. Mi chiama "piccola". Solo il papà mi chiamava così.',
      { fase: S, cap: [2, 4], cuori: [4], una: true }
    ],
    [
      "Ho una mappa del bosco disegnata dal papà. Ci sono le lapidi. C'è anche la tua, ma è vuota.",
      { fase: S, cap: [2, 3], cuori: [5], una: true }
    ],
    [
      'Il papà di notte piange piano. Dice che si ricorda le teste. Io gli tengo la mano.',
      { fase: V, finale: [3], cuori: [5], una: true }
    ]
  ],
  brom: [
    [
      "Mh. Ho forgiato le catene dell'Albero. Da ragazzo. Non sapevo per cosa.",
      { fase: S, cap: [3, 4], cuori: [4], una: true }
    ],
    [
      'Mh. La campanella del pollaio di Agatha suona da sola, certe notti. Il ferro si ricorda da dove viene.',
      { fase: S, cap: [2, 4], cuori: [5], una: true }
    ],
    [
      'Mh. Alla Festa mi metteranno vicino a te. Per tenerti. Io… non lo so.',
      { fase: S, cap: [4], cuori: [3], una: true }
    ]
  ],
  tobia: [
    [
      "Hihi. L'altra notte non ero io. Le scarpe alte erano sotto il letto. Le ho contate.",
      { fase: S, cuori: [1], una: true }
    ],
    [
      "Il Vecchio mi ha detto un segreto: il rosso brucia le radici. Hihi. Non dirlo all'Albero.",
      { fase: S, cap: [2, 4], cuori: [3], una: true }
    ],
    [
      "Io sono nato dall'altra parte del bosco. Hihi. Nessuno se lo ricorda. Neanche io.",
      { cuori: [5], una: true }
    ]
  ],
  ottavio: [
    [
      "In città ho chiesto all'ufficio postale di Hollowmere. Mi hanno detto che non esiste dal 1846.",
      { cuori: [3], una: true }
    ]
  ],
  irene: [
    [
      "Il libro sulle valli abbandonate non lo finirò. Ogni volta che rileggo, c'è un capitolo in più. Non l'ho scritto io.",
      { cuori: [3], una: true }
    ]
  ],
  mirta: [
    [
      'Mia nonna era di qui. Se ne andò prima di essere contata. Mi disse di non tornare mai. Eccomi.',
      { cuori: [4], una: true }
    ]
  ],
  elio: [
    [
      "Le pecore non entrano nel bosco. Mai. Nemmeno inseguendo il lupo che non c'è.",
      { cuori: [3], una: true }
    ]
  ],
  teo: [
    [
      "Al piano quaranta della miniera c'è una parete di radici. Rosse. Le ho coperte di sassi.",
      { cuori: [4], una: true }
    ]
  ],
  ada: [
    [
      'Ho dipinto tutti gli abitanti. Tutti meno uno. Ogni volta che ci provo, la tela resta bianca.',
      { cuori: [3], una: true }
    ]
  ]
});

// ======================= CHIACCHIERE (ad alta voce) =======================
Dialoghi.conversazioni('chiacchiera', [
  {
    tra: 'agatha clara',
    fase: S,
    righe: [
      'agatha: Clara, tesoro, hai mangiato?',
      'clara: Due mele!',
      'agatha: Del recinto?',
      'clara: …No. Forse.'
    ]
  },
  {
    tra: 'ezekiel lucius',
    fase: S,
    cap: [1, 2],
    righe: [
      'ezekiel: Stasera il Vespro, Lucius.',
      'lucius: Lo so.',
      'ezekiel: Conta bene.',
      'lucius: Conto sempre bene. È questo il guaio.'
    ]
  },
  {
    tra: 'brom tobia',
    fase: S,
    righe: ['tobia: Brom! Mi fai una spada?', 'brom: No.', 'tobia: Un ferro di cavallo?', 'brom: …Mh. Uno.']
  },
  {
    tra: 'agatha brom',
    righe: [
      'agatha: Brom, la campanella del pollaio stona.',
      'brom: Mh. Il ferro era vecchio.',
      'agatha: Rifammela.',
      'brom: Mh.'
    ]
  },
  {
    tra: 'clara tobia',
    righe: [
      'clara: Facciamo a chi conta più stelle?',
      'tobia: Hihi. Io le conto tutte.',
      'clara: Non vale, tu bari!',
      'tobia: Hihi. Sempre.'
    ]
  },
  {
    tra: 'lucius agatha',
    righe: [
      'agatha: Lucius, la tua predica di domenica…',
      'lucius: Troppo lunga?',
      'agatha: Troppo vera, tesoro.'
    ]
  },
  {
    tra: 'ezekiel brom',
    fase: S,
    cap: [2, 4],
    righe: [
      'ezekiel: Il cancello del Varco. Ha tenuto?',
      'brom: Mh. Il cancello sì.',
      'ezekiel: E cosa non ha tenuto?',
      'brom: …Io.'
    ]
  },
  {
    tra: 'clara lucius',
    fase: S,
    righe: ['clara: Fratello Lucius, gli angeli contano?', 'lucius: …Perché?', 'clara: Così. Mi pareva.']
  },
  {
    tra: 'agatha ezekiel',
    fase: S,
    cap: [3, 4],
    righe: ['agatha: Il sidro è pronto, Ezekiel.', 'ezekiel: Bene.', 'agatha: Non è bene. È pronto.']
  },
  {
    tra: 'tobia lucius',
    fase: S,
    cap: [2, 4],
    righe: ['tobia: Otto! Hihi.', 'lucius: Tobia, per favore.', 'tobia: Nove? Hihi.', 'lucius: TOBIA.']
  },
  // la Valle
  {
    tra: 'agatha ottavio',
    fase: V,
    righe: [
      'ottavio: Signora Agatha, in città lo zucchero costa niente!',
      'agatha: E il sale, tesoro?',
      'ottavio: Pure.',
      'agatha: Allora portami il sale. Lo zucchero lo faccio con le api di Gaspare.'
    ]
  },
  {
    tra: 'lucius irene',
    fase: V,
    righe: [
      'irene: Posso fotografare la cappella?',
      'lucius: Da fuori.',
      'irene: E da dentro?',
      'lucius: Da fuori. Glielo chiedo per favore.'
    ]
  },
  {
    tra: 'brom silvio',
    fase: V,
    righe: [
      "silvio: Brom, quella trave l'hai inchiodata storta.",
      'brom: Mh.',
      'silvio: Di due dita.',
      'brom: Mh. Raddrizzala tu.'
    ]
  },
  {
    tra: 'clara elio',
    fase: V,
    righe: [
      'clara: Come si chiama quella pecora?',
      'elio: Batuffolo.',
      'clara: E quella?',
      'elio: Batuffolo anche lei. Sono gemelle.'
    ]
  },
  {
    tra: 'bruno rina',
    fase: V,
    righe: [
      "rina: Il grano di quest'anno è buono?",
      'bruno: Buonissimo. Farina come neve.',
      'rina: Allora ne pianto il doppio.',
      'bruno: Allora io macino il doppio. Pietà.'
    ]
  },
  {
    tra: 'lia gaspare',
    fase: V,
    righe: [
      'lia: Le tue api mi rubano i fiori.',
      'gaspare: Te li restituiscono in miele.',
      'lia: …Va bene. Due vasetti.'
    ]
  },
  {
    tra: 'teo brom',
    fase: V,
    righe: [
      'teo: Ferro nuovo dalla Collina.',
      'brom: Mh. Buono.',
      'teo: Buono e basta?',
      'brom: Mh. Molto buono.'
    ]
  },
  {
    tra: 'mirta agatha',
    fase: V,
    righe: [
      'mirta: La tua camomilla è vecchia, Agatha.',
      'agatha: Come me, tesoro.',
      'mirta: Tu almeno profumi ancora.'
    ]
  },
  {
    tra: 'ada irene',
    fase: V,
    righe: [
      'ada: Anche le tue foto vengono storte?',
      'irene: Sempre. Le facce.',
      'ada: Le facce. Allora non è colpa mia.'
    ]
  },
  {
    tra: 'nora tobia',
    fase: V,
    righe: [
      'tobia: Nora! I pesci parlano?',
      'nora: No.',
      'tobia: Hihi. A me sì.',
      'nora: …Cosa dicono?',
      'tobia: "Non abboccare". Hihi.'
    ]
  },
  {
    tra: 'ezekiel rina',
    fase: V,
    righe: [
      'rina: Anziano, mi vende il campo vicino al ponte?',
      "ezekiel: Non sono più l'Anziano.",
      'rina: Me lo vende lo stesso?',
      'ezekiel: …Vediamo.'
    ]
  },
  {
    tra: 'clara ottavio',
    fase: V,
    righe: [
      'clara: Mi hai portato il gelato?',
      'ottavio: Si scioglie per strada!',
      'clara: Allora portami la strada.'
    ]
  },
  {
    tra: 'elio mirta',
    fase: V,
    righe: ['elio: Una pecora ha mangiato la tua lavanda.', 'mirta: Allora domani ha un sonno bellissimo.']
  },
  {
    tra: 'silvio ada',
    fase: V,
    righe: [
      'ada: Mi fai una cornice?',
      'silvio: Dritta?',
      'ada: Storta. Il quadro è storto.',
      'silvio: Mi fai soffrire.'
    ]
  },
  {
    tra: 'agatha lucius',
    fase: V,
    finale: [3],
    righe: [
      'agatha: Lucius, da quando non conti più sei ingrassato.',
      'lucius: Dormo, Agatha. Dormo.',
      "agatha: Brav'uomo."
    ]
  },
  {
    tra: 'ezekiel brom',
    fase: V,
    finale: [3],
    righe: ['ezekiel: Il ponte regge?', 'brom: Mh. Regge.', 'ezekiel: Viene gente.', 'brom: Mh. Che venga.']
  },
  {
    tra: 'clara tobia',
    fase: V,
    finale: [3],
    righe: [
      'tobia: Tuo papà mi ha sgridato. Hihi.',
      'clara: Perché?',
      'tobia: Ho detto "otto". Per abitudine.'
    ]
  },
  {
    tra: 'agatha brom',
    fase: V,
    finale: [2],
    righe: [
      'agatha: Stanotte… li hai sentiti?',
      'brom: Mh. Sì.',
      'agatha: Lasciamo un lume acceso?',
      'brom: Mh. Due.'
    ]
  },
  {
    tra: 'lucius ezekiel',
    fase: V,
    finale: [1],
    righe: [
      'lucius: È tornat{o|a}, Ezekiel.',
      'ezekiel: Lo so.',
      'lucius: Perché?',
      'ezekiel: Perché la casa era sua. E noi, forse, anche.'
    ]
  }
]);

// ======================= BISBIGLI (sottovoce: bugie, paure, voci) =======================
// copertura: cosa dice chi viene colto sul fatto quando ti avvicini troppo.
Dialoghi.conversazioni('bisbiglio', [
  {
    tra: 'ezekiel agatha',
    fase: S,
    cap: [1, 2],
    copertura: "agatha: Oh, tesoro! Parlavamo delle zucche. Che zucche, quest'anno!",
    righe: [
      "ezekiel: Quest'anno è giovane.",
      'agatha: Più giovane del nonno.',
      'ezekiel: Meglio. Si abitua prima.'
    ]
  },
  {
    tra: 'ezekiel lucius',
    fase: S,
    cap: [1, 2],
    copertura: 'ezekiel: {n}. Stavamo decidendo gli inni del Vespro.',
    righe: [
      'lucius: Non voglio contare, stavolta.',
      'ezekiel: Conterai.',
      'lucius: E se arrivo a otto?',
      'ezekiel: Arriverai a otto.'
    ]
  },
  {
    tra: 'agatha lucius',
    fase: S,
    copertura: 'lucius: Pace a te! Agatha mi chiedeva delle candele.',
    righe: [
      'agatha: Ha lo stesso modo di camminare del vecchio Marlowe.',
      'lucius: Non dirlo.',
      'agatha: E gli stessi occhi.',
      'lucius: Agatha. Non dirlo.'
    ]
  },
  {
    tra: 'brom ezekiel',
    fase: S,
    copertura: 'brom: Mh. Ferri.',
    righe: [
      'ezekiel: I ferri sono pronti?',
      'brom: Mh. Quattro.',
      'ezekiel: Per cosa, quattro?',
      "brom: Per chi non c'è."
    ]
  },
  {
    tra: 'clara tobia',
    fase: S,
    cap: [1, 3],
    copertura: 'clara: Ciao {n}! Giocavamo a… a nascondino. Hai perso!',
    righe: [
      "clara: L'hai visto anche tu, quello senza faccia?",
      "tobia: Hihi. Si siede sempre all'ultima panca.",
      'clara: Chi è?',
      'tobia: Uno che conosci. Hihi.'
    ]
  },
  {
    tra: 'agatha brom',
    fase: S,
    cap: [2, 4],
    copertura: 'agatha: Tesoro! Brom mi stava aggiustando la bilancia.',
    righe: [
      'agatha: Il sidro lo faccio più leggero, stavolta.',
      'brom: Ezekiel se ne accorge.',
      'agatha: Ezekiel non beve mai il mio sidro.',
      'brom: …Mh. Lo so.'
    ]
  },
  {
    tra: 'lucius brom',
    fase: S,
    cap: [2, 4],
    copertura: 'lucius: {figliolo|figliola}! Brom mi parlava del tempo.',
    righe: ['lucius: Stanotte zoccoli. Veri.', 'brom: Mh.', 'lucius: Tobia dormiva.', "brom: Mh. L'ho visto."]
  },
  {
    tra: 'ezekiel agatha',
    fase: S,
    cap: [3, 4],
    copertura: 'ezekiel: {n}. Parlavamo della Festa. Sarà bellissima.',
    righe: [
      "agatha: È stat{o|a} all'Albero.",
      'ezekiel: Lo so. Ha la terra rossa sulle scarpe.',
      'agatha: E adesso?',
      'ezekiel: Adesso la Festa.'
    ]
  },
  {
    tra: 'clara lucius',
    fase: S,
    cap: [3, 4],
    copertura: 'clara: Niente! Gli chiedevo… delle stelle. Sì.',
    righe: [
      'clara: Se scappo, mi copri?',
      'lucius: Non so mentire, Clara.',
      'clara: Allora non dire niente.',
      'lucius: Quello… quello lo so fare.'
    ]
  },
  {
    tra: 'tobia brom',
    fase: S,
    cap: [3, 4],
    copertura: 'tobia: Hihi! Brom mi insegnava a fare il ferro. Hihi.',
    righe: [
      'tobia: Alla Festa faccio il Cavaliere. Per distrarli.',
      'brom: Ti prendono.',
      'tobia: Hihi. Corro forte.',
      'brom: Mh. Corri più forte.'
    ]
  },
  // la Valle
  {
    tra: 'agatha mirta',
    fase: V,
    copertura: 'agatha: Tesoro! Mirta mi vendeva la camomilla.',
    righe: [
      'agatha: Dicono che Silvio di notte parli con il legno.',
      'mirta: Il legno risponde?',
      'agatha: Dicono di sì.',
      'mirta: Allora va tutto bene.'
    ]
  },
  {
    tra: 'ottavio irene',
    fase: V,
    copertura: 'ottavio: Ehilà! Parlavamo di francobolli. Noiosissimi.',
    righe: [
      "irene: Hai consegnato la lettera all'Anziano?",
      "ottavio: Non l'ha aperta.",
      'irene: Il mittente?',
      "ottavio: Elias Marlowe. Timbro di quest'anno."
    ]
  },
  {
    tra: 'lia ada',
    fase: V,
    copertura: 'ada: Ciao! Lia mi spiegava i colori dei tulipani.',
    righe: [
      'lia: Agatha ha detto che Bruno è innamorato.',
      'ada: Di chi?',
      'lia: Del suo mulino.',
      'ada: Ah. Allora non è una notizia.'
    ]
  },
  {
    tra: 'bruno teo',
    fase: V,
    copertura: 'bruno: Ciao! Teo voleva farina per il pane del cantiere.',
    righe: [
      'teo: Ho sentito picchiare dal basso, nella miniera.',
      'bruno: Acqua.',
      "teo: L'acqua non picchia in ritmo.",
      'bruno: …Allora non scendere più così in fondo.'
    ]
  },
  {
    tra: 'elio rina',
    fase: V,
    copertura: 'rina: Ciao! Elio mi chiedeva il letame. Romantico, eh?',
    righe: [
      'elio: Le pecore stanotte guardavano tutte verso la cappella.',
      'rina: Avevano freddo.',
      'elio: In fila?',
      'rina: …Avevano freddo in fila.'
    ]
  },
  {
    tra: 'gaspare nora',
    fase: V,
    copertura: 'nora: Gaspare voleva sapere se le api bevono al lago. Non bevono.',
    righe: [
      "gaspare: Il tuo Salmerino d'oro… l'hai visto davvero?",
      'nora: Sì.',
      "gaspare: Io ho visto un'ape d'oro.",
      'nora: Allora siamo matti in due.'
    ]
  },
  {
    tra: 'silvio brom',
    fase: V,
    copertura: 'silvio: Ciao! Brom mi ha prestato una lima. Miracolo.',
    righe: [
      'silvio: Tu lo sai chi ha costruito il costume del Cavaliere?',
      'brom: Mh.',
      'silvio: Le cuciture sono di Agatha.',
      'brom: …Mh. Non dirlo a lei.'
    ]
  },
  {
    tra: 'agatha ezekiel',
    fase: V,
    finale: [2],
    copertura: 'agatha: Tesoro! Che bella giornata, vero? Bellissima.',
    righe: [
      'agatha: Stanotte è passat{o|a} davanti al negozio.',
      'ezekiel: Non guardare dalla finestra.',
      'agatha: Ha rallentato.',
      'ezekiel: Allora domani regalale il pane migliore.'
    ]
  },
  {
    tra: 'lucius clara',
    fase: V,
    finale: [2],
    copertura: 'clara: Ciao {n}! Lucius mi insegnava una preghiera. Corta.',
    righe: [
      'clara: Di giorno è gentile.',
      'lucius: Di notte non è cattiv{o|a}. È…',
      'clara: È cosa?',
      'lucius: È il prezzo, Clara.'
    ]
  },
  {
    tra: 'ezekiel lucius',
    fase: V,
    finale: [3],
    copertura: 'lucius: Pace a te! Parlavamo delle campane nuove.',
    righe: [
      "ezekiel: I forestieri chiedono dell'Albero.",
      'lucius: Cosa dici loro?',
      'ezekiel: Che era un albero.',
      'lucius: È la prima bugia buona che ti sento dire.'
    ]
  },
  {
    tra: 'agatha brom',
    fase: V,
    finale: [1],
    copertura: 'agatha: Tesoro! Brom mi riparava la porta. Cigolava.',
    righe: [
      'agatha: È tornat{o|a} per restare?',
      'brom: Mh. Ha seminato.',
      'agatha: Allora resta.',
      'brom: Mh. Chi semina resta.'
    ]
  },
  {
    tra: 'tobia ada',
    fase: V,
    copertura: 'tobia: Hihi! Ada mi faceva il ritratto. Sono venuto bellissimo. Hihi.',
    righe: [
      'ada: Tobia, perché nel tuo ritratto hai due ombre?',
      'tobia: Hihi. Una è mia.',
      "ada: E l'altra?",
      'tobia: Hihi. In prestito.'
    ]
  },
  {
    tra: 'irene lucius',
    fase: V,
    finale: [1, 2],
    copertura: 'irene: Buongiorno. Fratello Lucius mi parlava delle vetrate.',
    righe: [
      "irene: Nell'ultima foto della messa siete in otto.",
      'lucius: Eravamo in sette.',
      'irene: Lo so.',
      'lucius: …Bruci quella foto.'
    ]
  }
]);
