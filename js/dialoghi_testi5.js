'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (5): conversazioni fra abitanti =================
{
  const S = 'storia',
    V = 'valle';
  const C = (cond, L) => Dialoghi.conversazioniCon('chiacchiera', cond, L);
  const B = (cond, L) => Dialoghi.conversazioniCon('bisbiglio', cond, L);
  const t = (tra, ...righe) => ({ tra, righe });
  const w = (tra, copertura, ...righe) => ({ tra, copertura, righe });

  // ---------------- storia ----------------
  C({ fase: S }, [
    t(
      'ezekiel clara',
      'ezekiel: Clara, il recinto.',
      'clara: Lo so, lo so.',
      "ezekiel: Allora perché hai le scarpe dall'altra parte?",
      'clara: …Si sono mosse da sole.'
    ),
    t(
      'agatha tobia',
      'agatha: Tobia, chi ti ha dato quella mela?',
      'tobia: Il recinto. Hihi.',
      'agatha: Il recinto non regala mele.',
      'tobia: A me sì. Hihi.'
    ),
    t(
      'lucius clara',
      'clara: Fratello Lucius, perché la campana suona tre volte?',
      "lucius: Una per chi c'è, una per chi è andato…",
      'clara: E la terza?',
      'lucius: La terza per chi deve arrivare.'
    ),
    t(
      'brom agatha',
      'agatha: Brom, ti ho fatto la torta.',
      'brom: Mh. Perché?',
      'agatha: Perché sei triste.',
      'brom: …Mh. Grazie.'
    ),
    t(
      'ezekiel tobia',
      'ezekiel: Tobia, il costume è al suo posto?',
      'tobia: Hihi. Sotto il letto.',
      'ezekiel: Bene.',
      "tobia: Ma stanotte non c'era. Hihi."
    ),
    t(
      'lucius agatha',
      'agatha: Lucius, hai le occhiaie.',
      'lucius: Conto anche di notte.',
      'agatha: Le pecore?',
      'lucius: Le persone.'
    ),
    t(
      'clara brom',
      'clara: Brom, perché non sorridi mai?',
      'brom: Mh. Sorrido.',
      'clara: Quando?',
      'brom: Quando non guardi.'
    ),
    t(
      'ezekiel brom',
      'ezekiel: Il recinto è ridipinto?',
      'brom: Mh. Giallo.',
      'ezekiel: Bene.',
      'brom: Mh. Giallo non basta.'
    )
  ]);
  C({ fase: S, cap: [2, 4] }, [
    t(
      'agatha lucius',
      'agatha: Hai dormito, Lucius?',
      'lucius: Ho contato le travi del soffitto.',
      'agatha: Quante sono?',
      'lucius: Ogni volta una in più.'
    ),
    t(
      'clara tobia',
      'clara: Domani vado nel bosco.',
      'tobia: Hihi. Porta la luce.',
      'clara: E se non basta?',
      'tobia: Allora porta il rosso. Hihi.'
    ),
    t(
      'ezekiel lucius',
      "lucius: Ezekiel, possiamo non farlo, quest'anno?",
      'ezekiel: No.',
      "lucius: E l'anno prossimo?",
      'ezekiel: Nemmeno.'
    ),
    t(
      'brom tobia',
      'tobia: Brom, mi rifai le scarpe alte?',
      'brom: No.',
      'tobia: Perché?',
      'brom: Mh. Perché poi le usi.'
    )
  ]);
  B({ fase: S }, [
    w(
      'agatha ezekiel',
      'agatha: Tesoro! Parlavamo della Festa. Che bella festa sarà!',
      'ezekiel: Mangia?',
      'agatha: Poco.',
      'ezekiel: Che mangi. Alla Festa deve essere in forze.',
      'agatha: Ezekiel…'
    ),
    w(
      'lucius brom',
      'brom: Mh. Niente.',
      "lucius: Conta anche lui, quest'anno?",
      'brom: Mh. Conta.',
      'lucius: Allora siamo otto.',
      'brom: Mh. Sempre otto.'
    ),
    w(
      'tobia agatha',
      'tobia: Hihi! Agatha mi dava una caramella. Hihi.',
      'agatha: Tobia, hai detto a qualcuno del sidro?',
      'tobia: Hihi. Solo al Vecchio.',
      'agatha: Tobia!'
    ),
    w(
      'clara agatha',
      'agatha: Tesoro! Clara mi aiutava con le mele.',
      'clara: Il papà è partito davvero?',
      'agatha: …Sì, tesoro.',
      'clara: Allora perché non ha preso la giacca?'
    )
  ]);
  B({ fase: S, cap: [2, 4] }, [
    w(
      'ezekiel agatha',
      'ezekiel: {n}. Parlavamo del tempo. Pioverà.',
      'agatha: Ha trovato la pagina di Elias.',
      'ezekiel: Quale?',
      'agatha: Quella che hai strappato tu.'
    ),
    w(
      'lucius clara',
      'lucius: Pace a te. Parlavamo di… stelle.',
      "clara: Chi è l'ottavo, Fratello Lucius?",
      'lucius: Non lo so.',
      'clara: Bugia.',
      'lucius: …Sì.'
    ),
    w(
      'brom ezekiel',
      'brom: Mh.',
      'ezekiel: Alla Festa tu le stai accanto.',
      'brom: Mh. Perché io?',
      'ezekiel: Perché hai le mani forti.',
      'brom: …Mh. Non abbastanza.'
    )
  ]);

  // ---------------- la Valle: i sei del villaggio ----------------
  C({ fase: V }, [
    t(
      'agatha ezekiel',
      'agatha: Ezekiel, mi presti il registro?',
      'ezekiel: Per cosa?',
      'agatha: Per le ricette. È carta buona.',
      'ezekiel: …Prendilo.'
    ),
    t(
      'lucius brom',
      'lucius: Brom, la campana nuova è bellissima.',
      'brom: Mh. Suona giusta.',
      'lucius: Suona felice.',
      'brom: Mh. È lo stesso.'
    ),
    t(
      'clara agatha',
      'clara: Agatha, mi insegni a fare la torta?',
      'agatha: Certo, tesoro. Prima lavati le mani.',
      'clara: Sono pulite!',
      'agatha: Sono verdi, tesoro.'
    ),
    t(
      'tobia ezekiel',
      'tobia: Ezekiel, sei vecchio?',
      'ezekiel: Sì.',
      'tobia: Più del Vecchio?',
      'ezekiel: …No. Per fortuna no.'
    ),
    t(
      'brom clara',
      'clara: Brom, mi fai una spada?',
      'brom: No.',
      'clara: Una spada di legno?',
      'brom: Mh. Silvio.'
    ),
    t(
      'ezekiel agatha',
      'ezekiel: Agatha, i prezzi sono saliti.',
      'agatha: È arrivata gente, tesoro.',
      'ezekiel: E quindi?',
      'agatha: E quindi i prezzi salgono. Si chiama commercio.'
    ),
    t(
      'lucius tobia',
      'tobia: Lucius, Dio conta?',
      'lucius: No, Tobia. Dio non conta.',
      'tobia: Allora chi?',
      'lucius: Nessuno. Più.'
    ),
    t(
      'agatha brom',
      'agatha: Brom, mi aggiusti la bilancia?',
      'brom: Mh. Pesa giusto.',
      'agatha: Pesa troppo giusto, tesoro. Non guadagno niente.'
    ),
    t(
      'clara lucius',
      'clara: Lucius, posso suonare io la campana?',
      'lucius: Una volta.',
      'clara: Due!',
      'lucius: …Due. Ma piano.'
    ),
    t(
      'ezekiel tobia',
      'ezekiel: Tobia, hai visto la mia penna?',
      'tobia: Hihi. Sì.',
      "ezekiel: Dov'è?",
      'tobia: Hihi. Sì.'
    ),
    t(
      'brom lucius',
      'brom: Mh. La porta della cappella cigola.',
      'lucius: Lasciala cigolare.',
      'brom: Mh. Perché?',
      'lucius: Così sento chi entra.'
    )
  ]);
  C({ fase: V, stagione: [1] }, [
    t(
      'agatha clara',
      'agatha: Clara, il cappello!',
      'clara: Ma non ho freddo!',
      'agatha: Hai il naso rosso come una ciliegia.',
      'clara: Le ciliegie sono buone!'
    ),
    t(
      'brom ezekiel',
      'ezekiel: Brom, spali tu la piazza?',
      'brom: Mh. Già fatto.',
      'ezekiel: Alle cinque?',
      'brom: Mh. Alle quattro.'
    ),
    t(
      'tobia clara',
      'tobia: Battaglia di neve! Hihi!',
      'clara: Tu bari sempre!',
      'tobia: Hihi. Sempre. Pronta?',
      'clara: …Pronta!'
    )
  ]);
  C({ fase: V, stagione: [2] }, [
    t(
      'agatha lucius',
      'agatha: Lucius, le rondini sono tornate.',
      'lucius: Le ho viste.',
      'agatha: Le hai contate?',
      'lucius: Agatha.',
      'agatha: Scherzavo, tesoro.'
    ),
    t(
      'clara brom',
      'clara: Brom, è nato un vitellino da Elio!',
      'brom: Mh. Bene.',
      'clara: Si chiama come te!',
      'brom: …Mh. Povera bestia.'
    )
  ]);
  C({ fase: V, stagione: [3] }, [
    t(
      'ezekiel lucius',
      'lucius: Che caldo, Ezekiel.',
      "ezekiel: Una volta l'estate era la stagione più tranquilla.",
      'lucius: Adesso?',
      'ezekiel: Adesso è solo calda.'
    ),
    t(
      'tobia agatha',
      'tobia: Agatha, hai il gelato?',
      "agatha: Cos'è il gelato, tesoro?",
      'tobia: Ottavio dice che è neve dolce. Hihi.',
      "agatha: Allora aspetta l'inverno."
    )
  ]);
  B({ fase: V }, [
    w(
      'agatha lucius',
      'agatha: Tesoro! Lucius mi chiedeva della candela. Profumata. Sì.',
      'agatha: Brom ha sorriso, ieri.',
      'lucius: Davvero?',
      "agatha: L'ho visto con i miei occhi.",
      'lucius: Allora è un miracolo. Lo segno.'
    ),
    w(
      'ezekiel brom',
      'ezekiel: {n}. Parlavamo di chiodi.',
      'ezekiel: Il nuovo vicino ti piace?',
      'brom: Mh. Lavora.',
      'ezekiel: Detto da te è un complimento enorme.',
      'brom: Mh. Lo è.'
    ),
    w(
      'clara tobia',
      'clara: Ciao! Giocavamo! A niente!',
      'clara: Ho trovato la scatola dei nastri rossi, in soffitta.',
      'tobia: Hihi. Li bruciamo?',
      'clara: Li teniamo.',
      'tobia: Hihi. Brava.'
    )
  ]);

  // ---------------- la Valle: nuovi e vecchi ----------------
  C({ fase: V }, [
    t(
      'agatha bruno',
      'agatha: Bruno, la tua farina è grossa.',
      'bruno: È rustica.',
      'agatha: È grossa, tesoro.',
      'bruno: …La macino due volte.'
    ),
    t(
      'ezekiel nora',
      'ezekiel: Il lago ti piace?',
      'nora: È profondo.',
      'ezekiel: Più di quanto pensi.',
      "nora: Lo so. L'ho misurato."
    ),
    t(
      'lucius ada',
      'ada: Posso dipingere la cappella dentro?',
      'lucius: Sì.',
      'ada: Davvero?',
      'lucius: Adesso sì. Prima no.'
    ),
    t(
      'clara gaspare',
      'clara: Le api fanno male?',
      'gaspare: Solo se hai paura.',
      'clara: Io non ho paura!',
      'gaspare: Allora vieni. Piano.'
    ),
    t(
      'brom rina',
      'rina: Brom, mi rifai la zappa?',
      'brom: Mh. Ancora?',
      "rina: L'ho consumata.",
      'brom: Mh. Brava.'
    ),
    t(
      'tobia teo',
      "tobia: In miniera c'è il buio vero? Hihi.",
      'teo: Sì.',
      'tobia: Più buio del bosco?',
      'teo: Diverso. Più onesto.'
    ),
    t(
      'agatha silvio',
      'agatha: Silvio, mi fai una mensola?',
      'silvio: Dritta?',
      'agatha: Storta, tesoro. Come il pavimento.',
      'silvio: …Va bene. Storta. Mi costa.'
    ),
    t(
      'ezekiel elio',
      'elio: Posso portare le pecore sul prato della cappella?',
      'ezekiel: Chiedilo a Lucius.',
      'elio: Lucius ha detto di chiedere a te.',
      'ezekiel: …Allora sì.'
    ),
    t(
      'lucius mirta',
      'mirta: La valeriana funziona?',
      'lucius: Dormo quattro ore.',
      'mirta: Prima?',
      'lucius: Prima nessuna.'
    ),
    t('clara rina', "clara: Rina, questa è un'erbaccia?", 'rina: È una carota.', 'clara: Oh. Scusa, carota.'),
    t('brom silvio', 'brom: Mh. Bel manico.', 'silvio: Grazie.', 'brom: Mh. Storto.', 'silvio: …Lo so.'),
    t(
      'agatha ada',
      'ada: Posso ritrarti, Agatha?',
      'agatha: Da giovane, tesoro.',
      'ada: Ti ritraggo come sei.',
      'agatha: Allora da giovane.'
    ),
    t(
      'tobia nora',
      'tobia: Nora, mi presti la canna?',
      'nora: No.',
      'tobia: Per un pesce solo. Hihi.',
      'nora: Per nessun pesce.'
    ),
    t(
      'ezekiel teo',
      'teo: Sotto la Collina ci sono gallerie vecchie.',
      'ezekiel: Lo so.',
      'teo: Chi le ha scavate?',
      'ezekiel: Chi è venuto prima di noi. Non scendere troppo.'
    ),
    t(
      'lucius elio',
      'elio: Una pecora è entrata in cappella.',
      'lucius: Lo so. Era alla messa.',
      'elio: Ha disturbato?',
      'lucius: Meno degli altri.'
    ),
    t(
      'clara bruno',
      'clara: Bruno, il mulino gira per magia?',
      'bruno: Per vento.',
      "clara: E quando non c'è vento?",
      'bruno: Per magia.'
    ),
    t(
      'agatha gaspare',
      'agatha: Il miele costa troppo.',
      'gaspare: Le api lavorano tanto.',
      "agatha: Anch'io, tesoro.",
      'gaspare: Allora ti faccio lo sconto delle api.'
    ),
    t(
      'brom teo',
      'teo: Il ferro di oggi?',
      'brom: Mh. Buono.',
      'teo: Solo buono?',
      'brom: Mh. Molto. Non abituarti.'
    ),
    t(
      'ottavio ezekiel',
      'ottavio: Anziano, una lettera da fuori!',
      'ezekiel: Da chi?',
      'ottavio: Dal comune. Vogliono sapere quanti siete.',
      'ezekiel: …Rispondi che non contiamo più.'
    ),
    t(
      'irene clara',
      'irene: Posso farti una foto?',
      'clara: Con la linguaccia?',
      'irene: Con la linguaccia.',
      'clara: Allora sì!'
    ),
    t(
      'ottavio tobia',
      "tobia: Ottavio, cosa c'è nei pacchi?",
      'ottavio: Segreti.',
      'tobia: Hihi. Anche io ho segreti.',
      'ottavio: Allora siamo colleghi.'
    )
  ]);
  C({ fase: V }, [
    t(
      'nora mirta',
      'mirta: Che pesce è?',
      'nora: Tinca.',
      'mirta: Fa bene allo stomaco.',
      'nora: A me fa bene il pescarla.'
    ),
    t(
      'bruno teo',
      'teo: Pane per il cantiere?',
      'bruno: Dieci pagnotte.',
      'teo: Siamo in due.',
      'bruno: Appunto.'
    ),
    t(
      'lia silvio',
      'lia: Mi fai una fioriera?',
      'silvio: Quadrata?',
      'lia: Rotonda.',
      'silvio: Il legno non è rotondo, Lia.',
      'lia: Il mondo sì.'
    ),
    t(
      'ada elio',
      'ada: Posso dipingere le tue pecore?',
      'elio: Tutte?',
      'ada: Una. La più bella.',
      'elio: Allora tutte. Sono gelose.'
    ),
    t(
      'gaspare rina',
      "rina: Le api mi impollinano l'orto?",
      'gaspare: Gratis.',
      'rina: Grazie!',
      'gaspare: Il miele però si paga.'
    ),
    t(
      'teo mirta',
      'mirta: Hai tossito tutta la notte.',
      'teo: Polvere.',
      'mirta: Domani niente miniera.',
      'teo: …Mezza miniera.'
    ),
    t(
      'nora silvio',
      'nora: Mi fai una barca?',
      'silvio: Per il lago?',
      'nora: Per il silenzio.',
      'silvio: …Te la faccio lenta.'
    ),
    t(
      'bruno lia',
      'lia: Il mulino è triste.',
      'bruno: È vecchio.',
      'lia: Gli metto dei fiori.',
      'bruno: …Gli piaceranno.'
    ),
    t(
      'elio gaspare',
      'elio: Le pecore hanno paura delle api.',
      'gaspare: Le api hanno paura delle pecore.',
      'elio: Allora siamo a posto.'
    ),
    t('ada mirta', 'ada: Che colore ha la valeriana?', 'mirta: Bianco sporco.', 'ada: Il mio preferito.')
  ]);
  C({ fase: V, stagione: [1] }, [
    t(
      'teo bruno',
      'teo: In miniera fa caldo.',
      'bruno: Nel mulino no.',
      'teo: Vieni giù.',
      'bruno: Con le castagne?',
      'teo: Con le castagne.'
    ),
    t(
      'nora elio',
      'elio: Il lago è gelato?',
      'nora: Ai bordi.',
      'elio: Le pecore possono bere?',
      'nora: Rompo il ghiaccio io.'
    )
  ]);
  C({ fase: V, stagione: [2] }, [
    t(
      'lia rina',
      "lia: Mi dai un angolo dell'orto per i fiori?",
      'rina: I fiori non si mangiano.',
      'lia: Si mangiano con gli occhi.',
      'rina: …Un angolo piccolo.'
    ),
    t(
      'gaspare ada',
      'ada: Le api sono tornate?',
      'gaspare: Tutte. Più due.',
      'ada: Due nuove?',
      'gaspare: Due curiose.'
    )
  ]);
  C({ fase: V, stagione: [3] }, [
    t(
      'elio rina',
      'elio: Tosatura domani.',
      'rina: Mi dai la lana corta?',
      'elio: Per cosa?',
      "rina: Per pacciamare l'orto.",
      'elio: Le pecore saranno onorate.'
    ),
    t(
      'nora bruno',
      'nora: Pesce fritto stasera?',
      'bruno: Con la farina mia.',
      'nora: Con il pesce mio.',
      'bruno: Allora cena insieme.'
    )
  ]);
  B({ fase: V }, [
    w(
      'lia gaspare',
      'lia: Ciao! Gaspare mi spiegava le api regine.',
      'lia: Mirta prepara intrugli di notte.',
      'gaspare: Erbe.',
      'lia: E se fossero incantesimi?',
      'gaspare: Allora funzionano. Io dormo meglio.'
    ),
    w(
      'bruno elio',
      'elio: Ciao. Bruno mi chiedeva il latte per il pane.',
      'bruno: Silvio misura le case di notte.',
      'elio: Perché?',
      "bruno: Dice che crescono. Di un dito l'anno."
    ),
    w(
      'teo ada',
      'ada: Ciao! Teo mi portava pigmenti dalla miniera.',
      "teo: Laggiù c'è una parete dipinta.",
      'ada: Dipinta da chi?',
      'teo: Da qualcuno che contava. Ci sono solo tacche.'
    ),
    w(
      'nora gaspare',
      'gaspare: Buongiorno. Nora mi chiedeva della cera per le reti.',
      'nora: Agatha dice che Ottavio ha una fidanzata fuori.',
      'gaspare: E tu ci credi?',
      'nora: Agatha dice tante cose. Questa la spero.'
    ),
    w(
      'rina silvio',
      'silvio: Ciao. Rina voleva dei paletti. Dritti.',
      'rina: Ezekiel mi ha venduto un campo senza contrattare.',
      'silvio: Ezekiel?',
      'rina: Ha detto: "La terra non è mia. Non lo è mai stata."'
    ),
    w(
      'mirta ada',
      'mirta: Buongiorno. Ada mi chiedeva un colore. Il verde salvia.',
      'ada: Lucius ha pianto in cappella.',
      'mirta: Di dolore?',
      'ada: Di sollievo, credo. Contava fino a sette. E si fermava.'
    ),
    w(
      'ottavio nora',
      'ottavio: Ciao! Parlavamo di francobolli.',
      'ottavio: Fuori nessuno trova la Valle sulle mappe.',
      'nora: Bene.',
      'ottavio: Bene?',
      'nora: Le cose belle non stanno sulle mappe.'
    ),
    w(
      'irene teo',
      'irene: Buongiorno. Teo mi spiegava le gallerie.',
      "irene: Ho fotografato l'ingresso della miniera.",
      'teo: E?',
      "irene: Nella foto c'era una lanterna accesa. Dentro.",
      'teo: Io ero fuori.'
    )
  ]);
  B({ fase: V, finale: [2] }, [
    w(
      'nora mirta',
      'nora: Niente. Parlavamo di vermi.',
      'nora: Di notte un cavaliere passa sul ponte.',
      'mirta: Non guardarlo.',
      "nora: L'ho guardato.",
      'mirta: E?',
      'nora: Mi ha salutato. Credo.'
    ),
    w(
      'bruno rina',
      'rina: Ciao! Parlavamo di grano.',
      'bruno: Gli altri dicono che è il nostro vicino. Il cavaliere.',
      'rina: È gentile, di giorno.',
      'bruno: Appunto. Di giorno.'
    )
  ]);
  B({ fase: V, finale: [3] }, [
    w(
      'ada lia',
      'ada: Ciao! Lia mi insegnava le margherite.',
      'lia: Il padre di Clara non parla mai del bosco.',
      'ada: Ha gli occhi di uno che ha visto tanto.',
      'lia: Allora dipingilo con gli occhi chiusi.'
    ),
    w(
      'teo silvio',
      'silvio: Ciao. Teo voleva un manico nuovo. Dritto.',
      "teo: Il legno del ponte nuovo è dell'Albero.",
      'silvio: Lo so.',
      'teo: Ci passi sopra?',
      'silvio: Velocemente.'
    )
  ]);
}
