'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (9): la grande raccolta di conversazioni =================
{
  const S = 'storia',
    V = 'valle';
  const C = (cond, L) => Dialoghi.conversazioniCon('chiacchiera', cond, L);
  const B = (cond, L) => Dialoghi.conversazioniCon('bisbiglio', cond, L);
  const t = (tra, ...righe) => ({ tra, righe });
  const w = (tra, copertura, ...righe) => ({ tra, copertura, righe });
  const INV = [1],
    PRI = [2],
    EST = [3],
    AUT = [0];

  // ---------------- i sei del villaggio, nella Valle, di tutti i giorni ----------------
  C({ fase: V }, [
    t(
      'agatha clara',
      'clara: Agatha, quanti anni hai?',
      'agatha: Abbastanza, tesoro.',
      'clara: Più di Ezekiel?',
      'agatha: Meno di Ezekiel. Scrivilo.'
    ),
    t(
      'ezekiel clara',
      'clara: Ezekiel, perché hai la barba bianca?',
      'ezekiel: Per gli inverni.',
      'clara: Quanti inverni?',
      'ezekiel: Troppi. E qualcuno buono.'
    ),
    t(
      'lucius agatha',
      'lucius: Agatha, la tua torta era buonissima.',
      'agatha: Quale?',
      'lucius: Tutte.',
      'agatha: Allora vieni più spesso, tesoro.'
    ),
    t(
      'brom tobia',
      'tobia: Brom, hai mai avuto paura?',
      'brom: Mh. Sì.',
      'tobia: Di cosa? Hihi.',
      'brom: Mh. Di non avere più paura.'
    ),
    t(
      'clara ezekiel',
      'ezekiel: Clara, hai finito di leggere il libro?',
      'clara: Ho letto la fine.',
      "ezekiel: E l'inizio?",
      "clara: L'inizio è noioso."
    ),
    t(
      'tobia agatha',
      'tobia: Agatha, mi dai una mela? Hihi.',
      'agatha: Gialla o rossa?',
      'tobia: Rossa! Hihi.',
      'agatha: …Ecco. Rossa. Il mondo è cambiato.'
    ),
    t(
      'lucius ezekiel',
      'ezekiel: Lucius, ti ricordi la prima volta che hai contato?',
      'lucius: Ogni notte.',
      'ezekiel: Mi dispiace.',
      'lucius: Lo so. Adesso lo so.'
    ),
    t(
      'brom agatha',
      'agatha: Brom, vieni a cena?',
      'brom: Mh. No.',
      "agatha: C'è la polenta.",
      'brom: …Mh. Alle sette.'
    ),
    t(
      'clara lucius',
      "clara: Lucius, cos'è la pace?",
      'lucius: Quando dormi senza contare.',
      'clara: Io dormo sempre senza contare.',
      'lucius: Allora sei in pace, Clara.'
    ),
    t(
      'ezekiel tobia',
      'tobia: Ezekiel, ti faccio una domanda. Hihi.',
      'ezekiel: Una.',
      'tobia: Perché tutti mi danno le mele?',
      'ezekiel: Perché tutti ti vogliono bene, Tobia. Anche se fai paura.'
    ),
    t(
      'agatha brom',
      'agatha: Brom, hai mai pensato di sposarti di nuovo?',
      'brom: Mh.',
      'agatha: Questo è un sì?',
      'brom: Mh. È un "lasciami stare".'
    ),
    t(
      'lucius clara',
      'clara: Posso fare la chierichetta?',
      "lucius: Cos'è una chierichetta?",
      'clara: Non lo so. Mi piace la parola.',
      'lucius: Allora sì.'
    )
  ]);
  C({ fase: V, stagione: INV }, [
    t(
      'agatha lucius',
      'agatha: Lucius, la stufa della cappella funziona?',
      'lucius: Scalda le prime due panche.',
      'agatha: E le altre?',
      'lucius: Le altre pregano più forte.'
    ),
    t(
      'clara ezekiel',
      'clara: Ezekiel, la neve ha un sapore?',
      'ezekiel: Non mangiarla.',
      'clara: Troppo tardi.',
      'ezekiel: …Sa di inverno.'
    ),
    t(
      'tobia brom',
      'tobia: Brom, mi fai i pattini? Hihi.',
      'brom: Mh. Per dove?',
      'tobia: Il lago è gelato! Hihi.',
      'brom: Mh. Solo ai bordi. Niente pattini.'
    )
  ]);
  C({ fase: V, stagione: PRI }, [
    t(
      'lucius ezekiel',
      'lucius: Le rondini sono tornate.',
      'ezekiel: Tutte?',
      'lucius: Non le ho contate.',
      'ezekiel: Bravo.'
    ),
    t(
      'clara agatha',
      'clara: Agatha, i semi di fiori?',
      'agatha: Per chi, tesoro?',
      'clara: Per la tomba del nonno di {n}.',
      'agatha: …Te li regalo.'
    )
  ]);
  C({ fase: V, stagione: EST }, [
    t(
      'brom clara',
      "clara: Brom, la forgia d'estate è un forno!",
      'brom: Mh. Sì.',
      'clara: Perché non chiudi?',
      'brom: Mh. Il ferro non va in vacanza.'
    ),
    t(
      'agatha tobia',
      'tobia: Agatha, fa caldo! Hihi.',
      'agatha: Vieni dentro, ho la limonata.',
      "tobia: Cos'è la limonata? Hihi.",
      'agatha: Acqua che sorride, tesoro.'
    )
  ]);
  C({ fase: V, stagione: AUT }, [
    t(
      'ezekiel agatha',
      "agatha: L'autunno ti fa ancora paura?",
      "ezekiel: Un po'.",
      'agatha: Anche a me.',
      'ezekiel: Allora siamo in due. È già meglio.'
    ),
    t(
      'lucius tobia',
      'tobia: Lucius, le foglie cadono perché sono stanche? Hihi.',
      'lucius: Perché devono riposare.',
      'tobia: Come noi?',
      'lucius: Come noi, adesso.'
    )
  ]);

  // ---------------- i nuovi abitanti con i sei ----------------
  C({ fase: V }, [
    t(
      'nora agatha',
      'agatha: Tesoro, il pesce me lo pulisci tu?',
      'nora: Lo pulisco io.',
      'agatha: E me lo friggi?',
      'nora: …Lo friggi tu.'
    ),
    t(
      'bruno ezekiel',
      'bruno: Anziano, il mulino ha bisogno di un nome.',
      'ezekiel: Non sono più Anziano.',
      'bruno: Ezekiel, il mulino ha bisogno di un nome.',
      'ezekiel: Chiamalo "Speranza". Gira anche senza vento.'
    ),
    t(
      'lia lucius',
      "lia: Fratello, posso mettere fiori sull'altare?",
      'lucius: Gialli?',
      'lia: Di tutti i colori.',
      'lucius: …Sì. Di tutti i colori.'
    ),
    t(
      'teo clara',
      'clara: Teo, mi porti in miniera?',
      'teo: No.',
      "clara: Solo all'ingresso!",
      "teo: All'ingresso. Con il casco."
    ),
    t(
      'mirta brom',
      'mirta: Brom, hai le mani rovinate.',
      'brom: Mh. Ferro.',
      'mirta: Ti faccio un unguento.',
      'brom: Mh. Profumato?',
      'mirta: Di salvia.',
      'brom: Mh. Va bene.'
    ),
    t(
      'silvio tobia',
      'tobia: Silvio, mi fai le scarpe alte? Hihi.',
      'silvio: Di legno?',
      'tobia: Hihi. Altissime.',
      'silvio: No.',
      'tobia: Brom ha detto la stessa cosa. Hihi.'
    ),
    t(
      'ada agatha',
      'ada: Agatha, il tuo negozio è il più bel soggetto della Valle.',
      'agatha: Perché, tesoro?',
      'ada: Perché ogni cosa è al posto sbagliato.',
      'agatha: È un complimento?',
      'ada: Il più grande.'
    ),
    t(
      'gaspare clara',
      'clara: Gaspare, le api sono tue amiche?',
      'gaspare: Sono la mia famiglia.',
      'clara: Quante sono?',
      'gaspare: Non le conto. Qui non si conta.'
    ),
    t(
      'elio ezekiel',
      'ezekiel: Le tue pecore hanno mangiato il mio giardino.',
      'elio: Era buono?',
      'ezekiel: …Era il mio giardino.',
      'elio: Allora era buono.'
    ),
    t(
      'rina lucius',
      'rina: Fratello, benedice i miei semi?',
      'lucius: Non so se funziona.',
      'rina: Male non fa.',
      'lucius: …Allora li benedico. Crescete.'
    ),
    t(
      'ottavio brom',
      'ottavio: Brom, in città fanno i chiodi con le macchine!',
      'brom: Mh. Storti?',
      'ottavio: Dritti. Tutti uguali.',
      'brom: Mh. Tristi.'
    ),
    t(
      'irene agatha',
      'agatha: Tesoro, mi fai una foto per la vetrina?',
      'irene: Sorridi.',
      'agatha: Sto sorridendo.',
      'irene: Di più.',
      'agatha: Questo è il mio massimo, tesoro.'
    ),
    t(
      'nora ezekiel',
      'nora: Il lago ha un fondo?',
      'ezekiel: Una volta, qualcuno ci è sceso.',
      'nora: E?',
      "ezekiel: Ha detto che c'era un campanile."
    ),
    t(
      'teo agatha',
      'teo: Agatha, mi dai il pane del giorno prima?',
      'agatha: Perché, tesoro?',
      'teo: In miniera non si sente la differenza.',
      'agatha: La sento io. Prendi quello fresco.'
    ),
    t(
      'mirta clara',
      'clara: Mirta, sei una strega?',
      'mirta: Sì.',
      'clara: Davvero?',
      'mirta: Una strega buona. Mangia la tua verdura.'
    ),
    t(
      'silvio ezekiel',
      'silvio: Il registro ha la copertina rovinata.',
      'ezekiel: Lasciala.',
      'silvio: Gliela rifaccio nuova.',
      'ezekiel: …Rifallo tutto nuovo. Le pagine bianche.'
    )
  ]);

  // ---------------- i nuovi abitanti tra loro ----------------
  C({ fase: V }, [
    t(
      'nora ada',
      'ada: Nora, posso dipingerti mentre peschi?',
      'nora: Se stai zitta.',
      'ada: Sto sempre zitta quando dipingo.',
      'nora: Allora sì.'
    ),
    t(
      'bruno gaspare',
      'bruno: Pane al miele?',
      'gaspare: Miele al pane.',
      'bruno: È uguale.',
      'gaspare: Dipende da chi paga.'
    ),
    t(
      'lia teo',
      'lia: Teo, mi porti terra dalla miniera?',
      'teo: Terra di sotto?',
      'lia: Per i fiori che amano il buio.',
      'teo: Esistono?',
      'lia: Li sto inventando.'
    ),
    t(
      'mirta silvio',
      'silvio: Mirta, mi fai una tisana per la schiena?',
      'mirta: Smetti di piegarti sul legno.',
      'silvio: Impossibile.',
      'mirta: Allora la tisana. Doppia.'
    ),
    t(
      'ada elio',
      'elio: Il ritratto di Fiocco?',
      'ada: Finito.',
      'elio: Le somiglia?',
      'ada: Più di quanto lei somigli a se stessa.'
    ),
    t(
      'gaspare teo',
      'teo: Le api scendono in miniera?',
      'gaspare: Mai.',
      'teo: Perché?',
      "gaspare: Non c'è niente da fiorire. E qualcosa da temere."
    ),
    t(
      'elio nora',
      'nora: Le tue pecore sanno nuotare?',
      'elio: No.',
      'nora: Una ieri nuotava.',
      'elio: …Fiocco. Era Fiocco.'
    ),
    t(
      'rina ada',
      'ada: Rina, che colore ha la terra buona?',
      'rina: Nero.',
      'ada: E quella cattiva?',
      'rina: Rosso. Sotto il recinto.'
    ),
    t(
      'bruno mirta',
      'mirta: Il tuo pane fa dormire.',
      'bruno: È un pregio o un difetto?',
      'mirta: Per Lucius un pregio.'
    ),
    t(
      'lia nora',
      'nora: Lia, perché metti fiori sul pontile?',
      'lia: Perché i pesci li guardino.',
      'nora: I pesci non guardano.',
      'lia: Questi sì. Te lo dico io.'
    ),
    t(
      'teo rina',
      'rina: Teo, mi presti il piccone? Ho un sasso nel campo.',
      'teo: Che sasso?',
      'rina: Uno grande come una pecora.',
      'teo: …Vengo io.'
    ),
    t(
      'silvio gaspare',
      'gaspare: Silvio, le api hanno fatto il nido nella tua bottega.',
      'silvio: Lo so.',
      'gaspare: Lo togli?',
      'silvio: No. Lavorano dritto.'
    ),
    t(
      'ottavio ada',
      'ottavio: Ada, ti porto i colori da fuori?',
      'ada: Quali?',
      'ottavio: Tutti.',
      'ada: Tutti tranne il rosso.',
      'ottavio: Perché?',
      "ada: Ce n'è già abbastanza, qui sotto."
    ),
    t(
      'irene mirta',
      "irene: Hai un'erba per non sognare?",
      'mirta: Sì.',
      'irene: Me la dai?',
      'mirta: No. I sogni vanno sognati.'
    )
  ]);
  C({ fase: V, stagione: INV }, [
    t(
      'bruno elio',
      'elio: Le pecore hanno freddo.',
      'bruno: Portale nel mulino.',
      'elio: Tutte?',
      'bruno: Tutte. Mi faranno compagnia.'
    ),
    t(
      'lia mirta',
      "lia: Che fiori nascono d'inverno?",
      "mirta: L'agrifoglio.",
      'lia: È un fiore?',
      'mirta: È coraggio con le foglie.'
    ),
    t(
      'gaspare ada',
      "ada: Le api d'inverno dove sono?",
      'gaspare: Abbracciate.',
      'ada: Tutte insieme?',
      'gaspare: Tutte. Come una famiglia vera.'
    )
  ]);
  C({ fase: V, stagione: PRI }, [
    t(
      'rina elio',
      'rina: Gli agnelli?',
      'elio: Tre.',
      'rina: Che nomi?',
      'elio: Clara li ha chiamati tutti Brom.'
    ),
    t(
      'nora lia',
      'lia: Il lago fiorisce?',
      'nora: Le ninfee.',
      'lia: Me ne porti una?',
      'nora: Le ninfee non si portano. Si guardano.'
    )
  ]);
  C({ fase: V, stagione: EST }, [
    t(
      'teo nora',
      'teo: Vengo a pescare? In miniera fa caldo.',
      'nora: Stai zitto?',
      'teo: Come in miniera.',
      'nora: Allora vieni.'
    ),
    t(
      'ada lia',
      'lia: Dipingi i girasoli?',
      'ada: Mi superano.',
      'lia: Anche a me.',
      'ada: Allora li dipingo dal basso. Come li vediamo noi.'
    )
  ]);

  // ---------------- forestieri ----------------
  C({ fase: V }, [
    t(
      'ottavio irene',
      'ottavio: La strada del ponte è più corta, oggi.',
      'irene: Le strade non si accorciano.',
      'ottavio: Questa sì. Quando hai fretta di arrivare.'
    ),
    t(
      'irene ezekiel',
      'irene: Posso fotografare il registro?',
      'ezekiel: No.',
      'irene: Una pagina.',
      'ezekiel: …La prima. È bianca.'
    ),
    t(
      'ottavio lucius',
      'ottavio: Fratello, una lettera per lei!',
      'lucius: Da chi?',
      'ottavio: Dal vescovo.',
      'lucius: Quale vescovo?',
      'ottavio: Esattamente.'
    )
  ]);

  // ---------------- bisbigli ----------------
  B({ fase: V }, [
    w(
      'nora bruno',
      'bruno: Ciao! Nora mi portava il pesce del giorno.',
      'nora: Il lago ieri era più basso.',
      'bruno: Ha piovuto poco.',
      'nora: È piovuto tanto.',
      'bruno: …Allora qualcuno beve.'
    ),
    w(
      'lia mirta',
      'mirta: Buongiorno. Lia voleva semi di lavanda.',
      'lia: Agatha si tinge i capelli.',
      'mirta: Con cosa?',
      'lia: Con la tua camomilla.',
      'mirta: Allora devo farle pagare il doppio.'
    ),
    w(
      'teo gaspare',
      'gaspare: Buongiorno. Teo mi chiedeva della cera per la lanterna.',
      'teo: Ho trovato una porta, in fondo alla miniera.',
      'gaspare: Aperta?',
      "teo: Chiusa. Dall'altra parte."
    ),
    w(
      'silvio elio',
      'elio: Ciao. Silvio mi rifaceva il recinto.',
      "silvio: Il recinto giallo l'ha fatto Brom.",
      'elio: E allora?',
      "silvio: Le assi sono legno dell'Albero. Vecchio. L'ho sentito con la pialla."
    ),
    w(
      'ada rina',
      'rina: Ciao! Ada voleva un ravanello da dipingere.',
      'ada: Ottavio dorme sul carro, quando arriva.',
      'rina: Perché?',
      'ada: Dice che nelle case della Valle si sogna troppo.'
    ),
    w(
      'bruno lia',
      'lia: Ciao! Bruno mi regalava un sacco di farina per i fiori.',
      'bruno: Ezekiel viene a comprare il pane a mezzanotte.',
      'lia: A mezzanotte?',
      "bruno: Dice che a quell'ora non lo vede nessuno piangere."
    ),
    w(
      'gaspare elio',
      'elio: Ciao. Gaspare mi spiegava perché le api odiano le capre.',
      'gaspare: Agatha dice che Mirta ha cento anni.',
      'elio: E li ha?',
      'gaspare: Non lo so. Ma le api la rispettano come una regina.'
    ),
    w(
      'irene ottavio',
      'ottavio: Ciao! Parlavamo di francobolli rari.',
      'irene: Ho trovato una foto vecchia in soffitta. Del villaggio.',
      'ottavio: Di quando?',
      "irene: Di quando c'erano tutti. Ci sei anche tu, Ottavio.",
      "ottavio: …Io non c'ero."
    )
  ]);
  B({ fase: V }, [
    w(
      'agatha ada',
      'agatha: Tesoro! Ada mi faceva il ritratto. Giovane.',
      "agatha: Lucius si è comprato un libro d'amore.",
      'ada: Davvero?',
      "agatha: L'ho visto io. Lo nascondeva nel breviario."
    ),
    w(
      'ezekiel teo',
      "teo: Buongiorno. L'Anziano mi chiedeva della miniera.",
      'ezekiel: Non scendere oltre il quarantesimo piano.',
      'teo: Perché?',
      'ezekiel: Perché i fondatori sono saliti da lì.'
    ),
    w(
      'lucius lia',
      'lia: Ciao! Fratello Lucius mi chiedeva fiori per la domenica.',
      'lucius: Le rose rosse davanti alla cappella.',
      'lia: Ti fanno paura?',
      'lucius: Mi fanno piangere. È diverso. È meglio.'
    ),
    w(
      'clara elio',
      'clara: Ciao! Elio mi lasciava contare le pecore!',
      'clara: Se le conto, succede qualcosa?',
      'elio: Sbagli il numero.',
      'clara: E poi?',
      'elio: E poi ricominci. Niente di più.'
    ),
    w(
      'brom gaspare',
      'brom: Mh. Miele.',
      'gaspare: Agatha dice che hai un debole per lei.',
      'brom: Mh.',
      'gaspare: È vero?',
      'brom: Mh. Per la sua polenta.'
    ),
    w(
      'tobia nora',
      'tobia: Hihi! Nora mi insegnava a stare zitto. Hihi. Non ci riesco.',
      "tobia: Sotto il lago c'è un campanile. Hihi.",
      'nora: Lo so.',
      'tobia: Lo senti suonare?',
      'nora: Le notti senza luna.'
    )
  ]);
  B({ fase: V, finale: [2] }, [
    w(
      'mirta gaspare',
      'mirta: Buongiorno. Parlavamo di valeriana.',
      'gaspare: Le api, di notte, sentono gli zoccoli.',
      'mirta: E?',
      'gaspare: Si stringono. Come per il freddo.'
    ),
    w(
      'silvio ada',
      'ada: Ciao! Silvio mi faceva una cornice storta.',
      'silvio: Ha ordinato una sella. Il vicino.',
      'ada: Per chi?',
      'silvio: Per un cavallo che non ho mai visto. Le misure sono enormi.'
    )
  ]);
  B({ fase: V, finale: [3] }, [
    w(
      'nora elio',
      'elio: Ciao. Nora mi dava pesce per i gatti.',
      'nora: Il lago adesso è limpido fino al fondo.',
      'elio: E il campanile?',
      "nora: Non c'è più. Solo sassi. Che peccato. Che bello."
    ),
    w(
      'bruno teo',
      'teo: Ciao! Bruno mi dava il pane del cantiere.',
      'bruno: In miniera picchiano ancora?',
      'teo: No.',
      'bruno: Allora?',
      'teo: Allora dormo laggiù, ogni tanto. Si sta bene.'
    )
  ]);
}
