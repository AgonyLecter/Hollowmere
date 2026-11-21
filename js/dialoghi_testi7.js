'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (7): tante conversazioni =================
{
  const S = 'storia',
    V = 'valle';
  const C = (cond, L) => Dialoghi.conversazioniCon('chiacchiera', cond, L);
  const B = (cond, L) => Dialoghi.conversazioniCon('bisbiglio', cond, L);
  const t = (tra, ...righe) => ({ tra, righe });
  const w = (tra, copertura, ...righe) => ({ tra, copertura, righe });

  // ---------------- le feste della Valle ----------------
  const festaVicina = st => typeof festSoon === 'function' && festSoon(st) > 0;
  C({ fase: V, se: festaVicina }, [
    t(
      'agatha lucius',
      'agatha: La festa si avvicina, Lucius.',
      'lucius: Le feste di adesso mi piacciono.',
      'agatha: Perché?',
      'lucius: Perché nessuno conta niente.'
    ),
    t(
      'clara tobia',
      'clara: Alla festa ballo tutta la notte!',
      'tobia: Hihi. Io ballo con le lanterne.',
      'clara: Le lanterne non ballano.',
      'tobia: Con me sì. Hihi.'
    ),
    t(
      'ezekiel brom',
      'ezekiel: Le tavolate per la festa?',
      'brom: Mh. Pronte.',
      'ezekiel: Quante?',
      'brom: Mh. Abbastanza per tutti. Anche per chi arriva.'
    ),
    t(
      'bruno agatha',
      'bruno: Per la festa faccio cento pagnotte.',
      'agatha: E io cento torte.',
      'bruno: Chi le mangia?',
      'agatha: Tobia, tesoro. Tobia.'
    ),
    t(
      'lia ada',
      'lia: Addobbo la piazza con i fiori.',
      'ada: E io la dipingo addobbata.',
      'lia: Poi la vendiamo ad Agatha.',
      'ada: Doppio guadagno.'
    ),
    t(
      'elio gaspare',
      'elio: Porto le pecore alla festa?',
      'gaspare: Le pecore odiano la musica.',
      'elio: Le mie no.',
      'gaspare: Allora porto le api.',
      'elio: …Lascio le pecore a casa.'
    )
  ]);
  // ---------------- voci di paese (chiacchiere) ----------------
  C({ fase: V }, [
    t(
      'agatha mirta',
      'agatha: Hai saputo di Silvio?',
      'mirta: Cosa?',
      'agatha: Ha fatto una sedia storta. Di proposito.',
      'mirta: Non ci credo.',
      "agatha: Neanch'io, tesoro. Ma è bello dirlo."
    ),
    t(
      'bruno nora',
      "bruno: Dicono che hai visto il Salmerino d'oro.",
      'nora: Dicono bene.',
      "bruno: E perché non l'hai preso?",
      'nora: Perché mi ha guardata.'
    ),
    t(
      'lia clara',
      'clara: Lia, perché parli ai fiori?',
      'lia: Perché ascoltano.',
      'clara: E rispondono?',
      'lia: Crescono. È la loro risposta.'
    ),
    t(
      'teo elio',
      'elio: In miniera ci sono pecore?',
      'teo: Ci sono pipistrelli.',
      'elio: Sono pecore volanti.',
      'teo: …No.'
    ),
    t(
      'ada ottavio',
      'ada: Fuori vendono i miei quadri?',
      "ottavio: Uno l'ho venduto a una signora.",
      'ada: Che cosa ha detto?',
      "ottavio: Che le facce la guardavano. L'ha comprato lo stesso."
    ),
    t(
      'irene lucius',
      'irene: Ho fotografato la campana nuova.',
      "lucius: Com'è venuta?",
      'irene: Normale.',
      'lucius: Che bella parola, normale.'
    ),
    t(
      'silvio rina',
      'rina: Silvio, mi fai una cassetta per le verdure?',
      'silvio: Quanto grande?',
      'rina: Come un cavolfiore e mezzo.',
      'silvio: È una misura nuova.',
      'rina: È la mia.'
    ),
    t(
      'gaspare mirta',
      'gaspare: Il miele cura la tosse?',
      'mirta: Con il limone.',
      'gaspare: Qui non ci sono limoni.',
      'mirta: Allora con la pazienza.'
    ),
    t(
      'nora lia',
      'lia: Mi porti dei sassi del lago per le aiuole?',
      'nora: Quelli lisci?',
      'lia: Quelli che hanno una storia.',
      'nora: Allora tutti.'
    ),
    t(
      'bruno silvio',
      'bruno: Mi rifai le pale del mulino?',
      'silvio: Ancora?',
      'bruno: Il vento le stanca.',
      'silvio: Il vento stanca tutti.'
    ),
    t(
      'ottavio rina',
      'ottavio: Fuori vendono semi in bustine colorate!',
      'rina: Germogliano?',
      'ottavio: …Non lo so.',
      'rina: Allora tienitele.'
    ),
    t(
      'irene elio',
      'irene: Posso fotografare le pecore?',
      'elio: Se non usi il lampo.',
      'irene: Perché?',
      'elio: Fiocco si offende.'
    ),
    t(
      'teo lia',
      'teo: Ho trovato un cristallo viola.',
      'lia: Sembra un fiore.',
      'teo: È un sasso.',
      'lia: Anche un sasso può essere un fiore.'
    ),
    t(
      'ada bruno',
      'ada: Il tuo mulino è il soggetto più difficile.',
      'bruno: Perché?',
      'ada: Non sta mai fermo.',
      'bruno: Come me.'
    ),
    t(
      'mirta elio',
      'mirta: Il latte di capra fa bene alle ossa.',
      'elio: E alle pecore gelose?',
      "mirta: Per loro c'è la camomilla."
    ),
    t(
      'gaspare silvio',
      "gaspare: Mi fai un'arnia nuova?",
      'silvio: Con le pareti dritte?',
      'gaspare: Le api preferiscono storte.',
      'silvio: Tutti preferiscono storto, qui.'
    )
  ]);
  // ---------------- i sei del villaggio con i nuovi ----------------
  C({ fase: V }, [
    t(
      'ezekiel lia',
      'lia: Ezekiel, mi presta un pezzo di terra davanti alla cappella?',
      'ezekiel: Per cosa?',
      'lia: Per un giardino.',
      'ezekiel: …Fai crescere qualcosa di bello, lì. Ne ha bisogno.'
    ),
    t(
      'agatha teo',
      'agatha: Teo, sei magro come un piccone.',
      'teo: Lavoro tanto.',
      'agatha: Allora mangia tanto. Siediti.'
    ),
    t(
      'lucius nora',
      'nora: Fratello, si può pescare la domenica?',
      'lucius: Dopo la messa.',
      'nora: E se i pesci abboccano prima?',
      'lucius: Allora anche loro sono devoti.'
    ),
    t(
      'clara silvio',
      'clara: Silvio, mi fai un cavallo di legno?',
      'silvio: Con la testa?',
      'clara: Sì! Con la testa!',
      'silvio: Brava. Con la testa.'
    ),
    t(
      'brom elio',
      'elio: Brom, mi fai i campanacci?',
      'brom: Mh. Quanti?',
      'elio: Uno per pecora.',
      'brom: Mh. Quante pecore?',
      'elio: Tante.',
      'brom: …Mh.'
    ),
    t(
      'tobia mirta',
      "tobia: Mirta, hai un'erba per diventare invisibile? Hihi.",
      'mirta: No.',
      'tobia: Peccato. Hihi.',
      "mirta: Ce l'ho per stare zitti."
    ),
    t(
      'ezekiel gaspare',
      'gaspare: Le mie api ronzano attorno alla sua casa.',
      "ezekiel: C'è un fiore, sotto la finestra.",
      "gaspare: Chi l'ha piantato?",
      "ezekiel: Non lo so. È nato da solo, l'anno in cui ho smesso di contare."
    ),
    t(
      'agatha rina',
      'rina: Agatha, le tue uova sono le più buone.',
      'agatha: È merito delle galline, tesoro.',
      'rina: Le galline le nutri tu.',
      'agatha: …Con le tue lattughe. Siamo pari.'
    ),
    t(
      'lucius teo',
      'teo: Fratello, laggiù ho sentito cantare.',
      'lucius: Un inno?',
      'teo: Una ninna nanna.',
      'lucius: …Allora lascialo dormire, laggiù.'
    ),
    t(
      'clara nora',
      'clara: Nora, mi insegni a pescare?',
      'nora: Devi stare zitta.',
      'clara: Quanto?',
      'nora: Tanto.',
      'clara: …Domani.'
    ),
    t(
      'brom bruno',
      'bruno: Brom, la macina è scheggiata.',
      'brom: Mh. La porto alla forgia.',
      'bruno: Pesa cento chili.',
      'brom: Mh. Lo so.'
    ),
    t(
      'tobia lia',
      'tobia: Lia, i fiori hanno paura del buio?',
      'lia: Chiudono gli occhi.',
      "tobia: Hihi. Anch'io. Ma sbircio."
    ),
    t(
      'ezekiel ada',
      'ada: Posso ritrarla, Ezekiel?',
      'ezekiel: Non vengo bene.',
      'ada: Nessuno viene bene, qui.',
      'ezekiel: Allora sì.'
    ),
    t(
      'agatha elio',
      'agatha: Elio, la lana per le calze?',
      'elio: Pronta.',
      'agatha: Morbida?',
      'elio: Come le pecore quando dormono.'
    ),
    t(
      'lucius silvio',
      'silvio: Fratello, le panche nuove le faccio dritte?',
      'lucius: Comode.',
      "silvio: Dritte e comode non vanno d'accordo.",
      'lucius: Allora comode.'
    ),
    t(
      'clara mirta',
      'clara: Mirta, perché le erbe puzzano?',
      'mirta: Per farsi ricordare.',
      'clara: Io mi faccio ricordare cantando.',
      'mirta: È peggio.'
    )
  ]);
  // ---------------- bisbigli: voci, sospetti, piccole bugie ----------------
  B({ fase: V }, [
    w(
      'agatha teo',
      'agatha: Tesoro! Teo mi chiedeva il prezzo del pane.',
      'agatha: Dicono che Lia e Gaspare…',
      'teo: Cosa?',
      'agatha: Si scambiano più miele che fiori.',
      'teo: Allora è una cosa seria.'
    ),
    w(
      'lucius gaspare',
      'lucius: Pace a te. Gaspare mi portava la cera.',
      'gaspare: Le api non entrano più in cappella.',
      'lucius: Da quando?',
      "gaspare: Da quando hai tolto l'ultima panca.",
      'lucius: …Allora era lì.'
    ),
    w(
      'ezekiel mirta',
      'ezekiel: Buongiorno. Mirta mi chiedeva del registro. Vecchie storie.',
      'mirta: Mia nonna è scappata. Come?',
      'ezekiel: Di notte. Senza luce.',
      'mirta: Nessuno ci riusciva.',
      'ezekiel: Lei sì. Non so come. Ho sempre sperato che me lo insegnasse.'
    ),
    w(
      'brom nora',
      "nora: Niente. Brom mi rifaceva l'amo.",
      'nora: Il ferro dei tuoi ami tiene troppo.',
      'brom: Mh.',
      'nora: Cosa ci metti?',
      'brom: Mh. Il ferro dei ferri di cavallo.'
    ),
    w(
      'clara ada',
      'clara: Ciao! Ada mi insegnava il blu!',
      'ada: Perché dipingi sempre otto persone?',
      'clara: Perché siamo otto.',
      'ada: Siamo di più, Clara.',
      "clara: …Lo so. È un'abitudine."
    ),
    w(
      'tobia silvio',
      'tobia: Hihi! Silvio mi faceva una trottola. Hihi.',
      'silvio: Hai visto chi entra nella soffitta di Ezekiel?',
      'tobia: Hihi. Io.',
      'silvio: E poi?',
      'tobia: Hihi. Poi nessuno. Ma le scarpe si muovono.'
    ),
    w(
      'agatha bruno',
      'bruno: Ciao! Agatha mi chiedeva farina fina.',
      'agatha: Ottavio ha una fidanzata fuori.',
      "bruno: Te l'ha detto lui?",
      "agatha: No, tesoro. L'ho capito dal profumo."
    ),
    w(
      'ezekiel silvio',
      "silvio: Buongiorno. L'Anziano mi chiedeva una cornice.",
      'ezekiel: Per il registro.',
      'silvio: Lo vuole appendere?',
      'ezekiel: Lo voglio chiudere dietro un vetro. Per sempre.'
    ),
    w(
      'lia elio',
      'elio: Ciao. Lia voleva fiori di trifoglio.',
      'lia: Hai visto chi lascia le margherite sul confine del bosco?',
      'elio: Le lasci tu.',
      'lia: Io le lascio. Qualcuno le prende. Di notte.'
    ),
    w(
      'gaspare bruno',
      'gaspare: Ciao. Bruno mi chiedeva miele per il pane dolce.',
      'bruno: Brom ha pianto, ieri.',
      'gaspare: Brom?',
      'bruno: Davanti alla forgia. Ha detto che era il fumo.',
      'gaspare: Allora era il fumo.'
    )
  ]);
  B({ fase: V, finale: [1] }, [
    w(
      'agatha clara',
      'agatha: Tesoro! Clara mi aiutava con le mele.',
      "clara: Il papà, fuori, l'hanno cercato?",
      'agatha: Non lo so, tesoro.',
      'clara: Se torna, mi riconosce?',
      'agatha: Ti riconoscerebbe al buio.'
    ),
    w(
      'ezekiel lucius',
      'lucius: Pace a te. Parlavamo di… del raccolto.',
      'lucius: Il bosco è ancora là.',
      'ezekiel: Sì.',
      "lucius: E l'Albero?",
      'ezekiel: Anche. Ma non ha più fame di noi. Ha fame di chi arriva.'
    )
  ]);
  B({ fase: V, finale: [2] }, [
    w(
      'agatha tobia',
      'tobia: Hihi! Agatha mi dava un biscotto.',
      'agatha: Tobia, tu lo vedi di notte?',
      'tobia: Hihi. Sì.',
      'agatha: È triste?',
      'tobia: Hihi. Fa il suo lavoro. Come me prima.'
    ),
    w(
      'clara brom',
      'clara: Ciao! Brom mi aggiustava la lanterna.',
      'clara: Se di notte lo incontro?',
      'brom: Mh. Non scappare.',
      'clara: E cosa faccio?',
      'brom: Mh. Salutalo. Si ricorda chi è.'
    )
  ]);
  B({ fase: V, finale: [3] }, [
    w(
      'lucius clara',
      'clara: Ciao! Lucius mi insegnava una canzone.',
      'clara: Il papà dorme male.',
      'lucius: È normale.',
      'clara: Per quanto?',
      'lucius: Finché non si dimentica le teste. Aiutalo a ricordare altro.'
    ),
    w(
      'ezekiel agatha',
      'agatha: Tesoro! Parlavamo di marmellate.',
      'agatha: Il ponte nuovo porta gente.',
      'ezekiel: Gente buona?',
      'agatha: Gente. Come noi.',
      'ezekiel: Allora qualcuna buona, qualcuna no.'
    )
  ]);
  // ---------------- la storia: ancora qualche crepa ----------------
  C({ fase: S, cap: [1, 1] }, [
    t(
      'agatha ezekiel',
      'agatha: Il nuovo arrivato ha comprato i semi.',
      'ezekiel: Bene. Che pianti.',
      'agatha: Pianta zucche.',
      'ezekiel: …Bene. Molto bene.'
    ),
    t(
      'lucius tobia',
      'tobia: Lucius, quanti siamo?',
      'lucius: Sette.',
      'tobia: Hihi. E lui?',
      'lucius: …Otto. Ma non adesso.'
    )
  ]);
  B({ fase: S, cap: [1, 2] }, [
    w(
      'agatha clara',
      'agatha: Tesoro! Clara mi chiedeva le caramelle.',
      'clara: Perché il nuovo arrivato non deve uscire la sera?',
      'agatha: Per i lupi.',
      'clara: Non ci sono lupi.',
      'agatha: Per questo, tesoro. Per questo.'
    ),
    w(
      'brom lucius',
      'lucius: Pace a te. Brom mi portava i chiodi.',
      'brom: Mh. Il fienile.',
      'lucius: Che cosa?',
      'brom: Mh. Gli zoccoli venivano da lì.',
      'lucius: Il costume è sotto il letto di Tobia.',
      'brom: Mh. Appunto.'
    )
  ]);
}
