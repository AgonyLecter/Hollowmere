'use strict';
// ================= LE BATTUTE DEGLI ABITANTI (6): amicizia, quotidianità, segreti =================
{
  const S = 'storia',
    V = 'valle';
  const g = (tipo, cond, perChi) => Dialoghi.gruppo(tipo, cond, perChi);

  // ======================= SALUTI SECONDO L'AMICIZIA =======================
  g(
    'saluto',
    { cuori: [0, 2] },
    {
      ezekiel: ['{n}.', 'Buongiorno.', 'Ah. Sei tu.'],
      agatha: ['Buongiorno, tesoro. Comprare qualcosa?', 'Ciao. Il negozio è aperto, se ti serve.'],
      lucius: ['Pace a te.', 'Buongiorno, {figliolo|figliola}.'],
      clara: ['Ciao…', 'Ah, ciao.'],
      brom: ['Mh.', '…'],
      tobia: ['Hihi.', 'Chi sei? Hihi. Lo so chi sei.'],
      nora: ['Buongiorno.', 'Mh, ciao.'],
      bruno: ['Buongiorno.', 'Salve.'],
      lia: ['Ciao!', 'Buongiorno.'],
      teo: ['Ehi.', 'Giorno.'],
      mirta: ['Buongiorno.', 'Mh. Ciao.'],
      silvio: ['Buongiorno.', 'Salve.'],
      ada: ['Ciao.', 'Buongiorno.'],
      gaspare: ['Buongiorno.', 'Salve.'],
      elio: ['Giorno.', 'Ciao.'],
      rina: ['Buongiorno!', 'Ciao.']
    }
  );
  g(
    'saluto',
    { cuori: [3, 5] },
    {
      ezekiel: ['Buongiorno, {n}. Passeggi?', 'Ah, {n}. Mi fa piacere vederti.'],
      agatha: [
        'Tesoro! Eccoti. Ti stavo aspettando, sai?',
        'Ciao, tesoro. Hai una faccia più riposata, oggi.'
      ],
      lucius: [
        'Pace a te, {n}. Oggi la cappella è più luminosa. Forse per te.',
        '{figliolo|figliola}! Vieni a sederti un momento, se vuoi.'
      ],
      clara: ['{n}! Ciao ciao ciao!', 'Ciao! Oggi giochiamo? Dopo? Dopo dopo?'],
      brom: ['Mh. {n}. Ciao.', 'Mh. Buongiorno, {n}.'],
      tobia: ['Hihi! Il mio preferito! Dopo il Vecchio. Hihi.', 'Hihi. Ciao, ciao, ciao.'],
      nora: ['Ciao, {n}. I pesci oggi sono di buon umore.', 'Ehi. Ti ho visto passare ieri sera.'],
      bruno: ['Ciao, {n}! Pane caldo, se lo vuoi.', 'Eccoti! Il mulino ti saluta.'],
      lia: ['Ciao, {n}! Hai un fiore in tasca? No? Te lo do io.', 'Che bello vederti!'],
      teo: ['Ehi, {n}. Oggi niente polvere. Quasi.', 'Ciao! Ho trovato un sasso che ti piacerebbe.'],
      mirta: ['Ciao, {n}. Stai mangiando abbastanza verdura?', "Eccoti. Hai l'aria di chi dorme poco."],
      silvio: ['Ciao, {n}! La tua panchina regge?', 'Buongiorno! Ho pensato a te mentre piallavo.'],
      ada: [
        '{n}! Stai ferm{o|a} un secondo. Ecco. Ti ho rubato un colore.',
        'Ciao! Oggi sei di un bel giallo.'
      ],
      gaspare: ['Ciao, {n}. Le api ti mandano saluti.', 'Ehi! Miele nuovo, se passi.'],
      elio: ['Ciao, {n}. Fiocco ti saluta. Io pure.', 'Eccoti. Le capre ti stavano cercando.'],
      rina: ["Ciao, {n}! Come va l'orto?", 'Eccoti! Ti ho messo da parte dei semi buoni.']
    }
  );

  // ======================= LA QUOTIDIANITÀ NELLA VALLE =======================
  g(
    'passaggio',
    { fase: V },
    {
      ezekiel: [
        'Ho iniziato a scrivere un libro. Sulla Valle. Le cose belle. È un libro corto, per ora.',
        'I bambini di fuori, un giorno, verranno qui in gita. Mi piace pensarlo.',
        'Ho piantato un melo. Uno nuovo. Lontano dal recinto.',
        'Ho rinunciato alla carica. Mi chiamano lo stesso Anziano. Le abitudini sono dure a morire.',
        'Il tuo villaggio ha più case del mio paese natale. Che ironia.',
        'Leggo i giornali di fuori. Litigano tutti. Qui, almeno, litighiamo solo per i confini dei campi.'
      ],
      agatha: [
        'Tesoro, ho imparato una ricetta nuova da Ottavio. Si chiama "pizza". Non mi è venuta.',
        "Hai visto la sciarpa di Brom? L'ho fatta io. Se la mette solo quando non lo guardo.",
        'Il negozio va benissimo. Sono stanca morta. Sono felice.',
        'Le pettegolezze, tesoro, sono la cosa più sana del mondo. Tengono sveglia la gente.',
        'Mi sono comprata un vestito nuovo. Rosso. Sì, rosso. Lo indosso la domenica.',
        'Lia mi porta i fiori ogni lunedì. Le faccio lo sconto. Non dirlo agli altri.'
      ],
      lucius: [
        'Ho ricominciato a leggere. Libri di avventura. Dio mi perdonerà.',
        'Insegno a Clara a leggere le stelle. Lei insegna a me a ridere.',
        'Le mie prediche sono più corte. La gente viene di più. Coincidenze.',
        'Ho piantato rose davanti alla cappella. Rosse. Ho tremato tutto il tempo.',
        'Mirta mi dà le erbe per dormire. Le prendo. A volte dormo.',
        'Il campanile ha bisogno di vernice. Bianca, stavolta.'
      ],
      clara: [
        'Da grande voglio fare tutto. Prima la pittrice, poi la pescatrice, poi Agatha.',
        'Ho un diario segreto. Ci scrivo una cosa bella al giorno. Ieri ho scritto il tuo nome.',
        'Tobia dice che i fantasmi esistono. Io dico che sono solo persone stanche.',
        'Ho imparato a fischiare! Ascolta! …Aspetta. Non viene.',
        'Ezekiel mi ha regalato una penna. Scrive storto. Come me.',
        'Le pecore di Elio sono più simpatiche delle persone. Non tutte. Le pecore.'
      ],
      brom: [
        'Mh. Ho fatto un cucchiaio. Di ferro. Per Clara.',
        'Mh. Silvio è bravo. Non dirglielo.',
        'Mh. Il ferro della Collina è buono. Più del mio di prima.',
        "Mh. La forgia fa caldo. D'inverno vengono tutti a scaldarsi. Mi piace. Non dirlo.",
        'Mh. Agatha mi ha fatto una sciarpa. Pizzica. La metto.',
        'Mh.'
      ],
      tobia: [
        'Hihi. Ho scoperto che so contare fino a mille. Poi mi annoio.',
        'Hihi. Ho un amico nuovo. È un corvo. Si chiama Ezekiel. Hihi.',
        'Hihi. Le galline mi inseguono. Io inseguo le galline. Siamo pari.',
        "Hihi. Di notte salgo sul campanile. Si vede tutto. Anche quello che non c'è.",
        'Hihi. Ho imparato a fare le facce. Questa è Brom. Mh. Hihi.',
        'Hihi. Ho nascosto una cosa per te. Cercala. Fuoco. Freddo. Hihi.'
      ]
    }
  );
  g(
    'passaggio',
    { fase: V },
    {
      nora: [
        'Ho chiamato la mia barca "Silenzio". Silvio l\'ha scritto storto apposta.',
        'Il lago mi parla con le bolle. Una bolla: pesce. Due bolle: grosso. Tre: scappa.'
      ],
      bruno: [
        "Ho fatto un pane a forma di Brom. Gliel'ho regalato. L'ha mangiato serio.",
        'Mio figlio vive in città. Gli ho mandato la farina della Valle. Dice che il pane viene triste. Qui viene allegro.'
      ],
      lia: [
        'Ho insegnato a Brom il nome di un fiore. Ha detto "Mh". Lo prendo come un sì.',
        'Ogni casa del villaggio ha il suo fiore. La tua ne ha tre. Sei speciale.'
      ],
      teo: [
        "Ho trovato un fossile. Una conchiglia. Qui una volta c'era il mare. O un lago enorme.",
        'Il piccone nuovo canta quando colpisce il ferro. Brom dice che è un buon segno.'
      ],
      mirta: [
        'Ho insegnato a Clara a fare la tisana. Ci ha messo lo zucchero. Tanto.',
        'Ogni erba ha un carattere. La menta è allegra. La salvia è severa. Il rosmarino è Brom.'
      ],
      silvio: [
        'Ho fatto una culla. Per nessuno. Per quando servirà.',
        'Le travi della tua casa sono buone. Il nonno sapeva scegliere.'
      ],
      ada: [
        "Ho dipinto il tuo campo all'alba. È appeso nel negozio di Agatha. Lo vende cara.",
        'Clara vuole imparare a dipingere. Dipinge solo cavalli. Senza testa. Le ho detto di metterla.'
      ],
      gaspare: [
        'Ho dato un nome a ogni regina. Si chiamano come le stagioni.',
        'Il miele di castagno è amaro come la verità. Lo vendo poco. Lo mangio io.'
      ],
      elio: [
        'Ho insegnato a Tobia a mungere. Ha munto il mio stivale.',
        'Le pecore conoscono la strada di casa. Io a volte no.'
      ],
      rina: [
        'Ho piantato un girasole per ogni abitante. Il tuo è il più alto. Non dirlo a Ezekiel.',
        "L'orto è come un libro. Ogni stagione una pagina. Io sono ancora alle prime."
      ],
      ottavio: [
        'In città mi chiedono perché sorrido quando torno dalla Valle. Non so cosa rispondere.',
        'Ho portato una radio a Ezekiel. La ascolta con le mani giunte.'
      ],
      irene: [
        'Ho fotografato Agatha che ride. È la mia foto migliore.',
        "Sto imparando a fotografare senza cercare l'ottavo. È difficile."
      ]
    }
  );

  // ======================= LA STORIA: ANCORA DUE COSE PER CAPITOLO =======================
  g(
    'passaggio',
    { fase: S, cap: [1, 1] },
    {
      ezekiel: [
        'Le Regole non sono gabbie. Sono un abbraccio. Stretto.',
        "Il nonno teneva la cassa chiusa. Non aprirla. Non c'è niente di interessante."
      ],
      agatha: [
        'Le galline del villaggio sono le più grasse della provincia. Merito del mangime. Non chiedere.',
        'Ti piace la Valle, tesoro? Dimmi di sì. Mi fa piacere quando dicono di sì.'
      ],
      lucius: [
        'Siediti in prima fila, al Vespro. Si sente meglio. Si vede meno.',
        "Il giallo è il colore della pace. Me l'hanno insegnato così."
      ],
      clara: [
        'Ezekiel dice che sono curiosa. Io dico che sono attenta.',
        'Mi presti la zappa? No, scherzo. Le zappe sono noiose.'
      ],
      brom: [
        'Mh. Il fienile è chiuso. Non serve entrarci.',
        'Mh. Il nonno tuo mi pagava sempre in ritardo. Ma pagava.'
      ],
      tobia: [
        'Hihi. Ti piacciono i segreti? Io ne ho tanti. Uno è tuo.',
        'Hihi. Sei arrivat{o|a} in autunno. Gli altri pure. Tutti in autunno. Hihi.'
      ]
    }
  );
  g(
    'passaggio',
    { fase: S, cap: [2, 2] },
    {
      ezekiel: [
        'Ti sento camminare di notte, {n}. Non farlo.',
        "Il fienile? Chiuso da anni. Non c'è niente. Niente di tuo."
      ],
      agatha: [
        'Ho chiuso le persiane alle sei, ieri. Le chiuderò alle cinque, stasera.',
        "Tesoro, mangia la mia minestra. Non c'è niente dentro. Solo minestra."
      ],
      lucius: [
        'Ho perso il conto delle preghiere. Ricomincio. Uno…',
        'La cappella di notte scricchiola. Come se qualcuno si sedesse.'
      ],
      clara: [
        "Ho dormito con la lanterna accesa. La mamma l'ha spenta. L'ho riaccesa.",
        'Se sparisco, cerca nel bosco. Dico per dire.'
      ],
      brom: ['Mh. Ho sentito gli zoccoli sul selciato. Ferri nuovi. Non miei.', 'Mh. Chiudi a chiave.'],
      tobia: [
        'Hihi. Gli zoccoli? Non ero io. Lo giuro sul Vecchio. Hihi.',
        'Hihi. Otto, nove, dieci… ah no, siamo otto. Hihi.'
      ]
    }
  );
  g(
    'passaggio',
    { fase: S, cap: [3, 3] },
    {
      ezekiel: [
        'Domani è la Festa. Riposa, {n}. È un ordine gentile.',
        "Le tue mani tremano. Le mie pure. Da quarant'anni."
      ],
      agatha: [
        'Ti ho cucito un mantello. Giallo. Non metterlo. Non ancora.',
        'Tesoro, se domani vedi la mia faccia strana, non è colpa mia.'
      ],
      lucius: [
        'Ho visto la tua faccia quando sei tornat{o|a}. Era la faccia di tutti noi, la prima volta.',
        'Domani conto. Spero di sbagliare.'
      ],
      clara: [
        'Il papà è là. Lo so. Lo sento. Domani lo vado a prendere.',
        'Hai ancora il nastro? Tienilo stretto. Strettissimo.'
      ],
      brom: [
        'Mh. Domani ti tengono. Non fare resistenza. Poi corri.',
        'Mh. Hai visto il corpo. Era un uomo buono. Il nonno.'
      ],
      tobia: [
        'Hihi. Il Vecchio ha detto il tuo nome. Hihi. Stanotte.',
        'Hihi. Domani faccio il Cavaliere finto. Tu fai quello vero? Hihi. No? Meglio.'
      ]
    }
  );

  // ======================= SEGRETI CHE SFUGGONO (ancora) =======================
  g(
    'sfuggito',
    { una: true },
    {
      agatha: [
        [
          "Tesoro, la ricetta del mio pane ha un ingrediente segreto: lacrime. Le mie. Una volta l'anno.",
          { fase: V, cuori: [5] }
        ]
      ],
      ezekiel: [
        [
          'Il primo forestiero che ho visto contare era una donna. Aveva una voce bellissima. Cantava mentre la portavano via.',
          { cuori: [5] }
        ]
      ],
      lucius: [['Quando ero bambino volevo fare il marinaio. Non ho mai visto il mare.', { cuori: [4] }]],
      clara: [
        [
          "Il papà mi ha scritto una lettera, prima di sparire. L'ho sepolta sotto il melo. Non ho mai avuto il coraggio di leggerla.",
          { fase: S, cuori: [4] }
        ],
        [
          'Ho letto la lettera del papà, finalmente. Diceva: "Torno". Aveva ragione.',
          { fase: V, finale: [3], cuori: [4] }
        ]
      ],
      brom: [['Mh. Ho una figlia. Fuori. Non sa di me. Meglio così.', { cuori: [6] }]],
      tobia: [
        ['Hihi. Io non ho mai avuto una mamma. Mi ha trovato il Vecchio. Hihi. Nel bosco.', { cuori: [4] }]
      ],
      bruno: [
        [
          "Il mulino che mi hanno preso fuori era di mio padre. Questo l'ho costruito con te. Questo è mio davvero.",
          { fase: V, cuori: [5] }
        ]
      ],
      lia: [['Avevo una sorella. Adorava le margherite. Le pianto per lei.', { fase: V, cuori: [5] }]],
      elio: [
        [
          "Ho perso una pecora, l'inverno scorso. Fiocco. Questa Fiocco è la seconda. Non ditelo a lei.",
          { fase: V, cuori: [5] }
        ]
      ],
      mirta: [
        [
          'Mia nonna ha scritto il suo nome sul registro, prima di andarsene. L\'ho trovato. "Fuggita", c\'era scritto.',
          { fase: V, cuori: [5] }
        ]
      ],
      silvio: [
        [
          'Ho fatto la culla per mio figlio. Non è mai nato. Adesso la faccio per la Valle.',
          { fase: V, cuori: [6] }
        ]
      ],
      gaspare: [
        [
          "Le api mi hanno salvato, quell'inverno. Dormivo tra le arnie per scaldarmi. Loro mi hanno lasciato vivere.",
          { fase: V, cuori: [5] }
        ]
      ]
    }
  );
}
