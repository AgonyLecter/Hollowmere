'use strict';
// ================= LE NOVITÀ CHE PORTA OTTAVIO =================
// Ogni aggiornamento del gioco ha qui la sua voce: Ottavio il postino la consegna una volta sola a ogni giocatore
// (postino.js, due novità per volta). Per un aggiornamento futuro: aggiungi una voce in fondo, con v più alto.
// La wiki NON va annunciata: è privata.
const NOVITA = [
  {
    id: 'grafica2',
    v: 17,
    n: 'La Valle ridisegnata',
    steps: [
      {
        t: 'Guardati intorno: la Valle è stata ridisegnata. Personaggi, ritratti, case, attrezzi, cibi e animali sono nuovi, e le stagioni cambiano davvero i colori del paese.'
      },
      {
        t: 'Le case sono vive: finestre che si accendono la sera, comignoli che fumano, la fucina di Brom che sprizza scintille, il mulino che gira e le macchine che lavorano davanti ai tuoi occhi.'
      }
    ]
  },
  {
    id: 'contenuti1',
    v: 18,
    n: 'Nuove colture e nuovi animali',
    steps: [
      {
        t: "Nell'orto: piselli, zucchine, girasoli, grano, mirtilli, lavanda, cavolfiori e ravanelli. Nel frutteto: albicocchi, prugni, fichi e noci, dal carro del cocchiere."
      },
      {
        t: "Nella stalla e nel pollaio adesso ci stanno anche anatre e capre. E con l'ovile, le pecore: la loro lana piace a tutti. Il grano, al mulino, diventa farina per ricette nuove."
      },
      {
        t: 'E nella Valle possono trasferirsi due abitanti nuovi: Elio il pastore e Rina la contadina, ognuno con la sua bottega.'
      }
    ]
  },
  {
    id: 'mercato',
    v: 19,
    n: 'Richieste, mercato e dispensa',
    steps: [
      {
        t: 'Gli abitanti ti chiedono cose in modi diversi: per stasera, entro qualche giorno, per una festa, o a tre passi con un premio speciale alla fine. Le trovi tutte nel taccuino delle richieste, nel menu (☰ → Richieste).'
      },
      {
        t: 'Il mercato è vivo: ogni mattina tre prodotti pagano di più. Se vendi tanto dello stesso, il prezzo scende un po’, e nei giorni dopo risale.'
      },
      {
        t: "In piazza c'è la <b>dispensa del villaggio</b>: gli abitanti ci lasciano quello che avanza, tu puoi prendere tre cose al giorno. E se ci lasci i tuoi avanzi, il villaggio ti vuole più bene.",
        at: () => {
          const o = G.maps.main && G.maps.main.objs.find(o => o.act === 'dispensa');
          return o ? { x: o.tx * 16 + 8, y: o.ty * 16, l: 'La dispensa' } : null;
        }
      }
    ]
  },
  {
    id: 'chiacchiera',
    v: 20,
    n: 'Gli abitanti parlano davvero',
    steps: [
      {
        t: 'Gli abitanti hanno migliaia di cose nuove da dire: cambiano con la stagione, il tempo, l’ora, la vostra amicizia e quello che hai fatto. E parlano fra loro, in piazza: avvicinati e ascolta.'
      },
      {
        t: '«Chiacchiera», nel menu di ogni abitante, apre una conversazione vera: come sta, le novità del paese, e i suoi ricordi quando vi conoscete bene.'
      }
    ]
  },
  {
    id: 'equo',
    v: 21,
    n: 'Botteghe e richieste più giuste',
    steps: [
      {
        t: 'Le botteghe sono state sistemate: il miele di Gaspare e la camomilla di Mirta costano il giusto, e nessuno ti chiede più quello che vende lui stesso.'
      },
      {
        t: 'Le richieste dei nuovi abitanti pagano quanto vale davvero la roba (un piatto vale i suoi ingredienti) e chiedono solo cose che in quella stagione si trovano. Le mie ricette di città, invece, si comprano da me.'
      }
    ]
  },
  {
    id: 'natura_flora',
    v: 22,
    n: 'Un orto e un bosco nuovi',
    steps: [
      {
        t: "Ventuno semi nuovi da Agatha e dal cocchiere: basilico, prezzemolo, salvia, rosmarino, fave, ceci, lenticchie, orzo, cetrioli, finocchi, carciofi, cavolo cappuccio, broccoli, bietole, rucola, sedano, cicoria, topinambur, calendule, viole e lo zafferano, il fiore più prezioso. Alcuni crescono anche d'inverno."
      },
      {
        t: 'Otto alberelli nuovi dal cocchiere: olivo, mandorlo, melograno, nespolo, gelso, caco, castagno e la vite.'
      },
      {
        t: "E il bosco regala di più: finferli, spugnole, rosa canina, corbezzoli, ginepro, pinoli, crescione, ortiche, aglio orsino, fiori di sambuco, violette, menta, origano, finocchietto e lamponi. D'inverno, se hai fortuna, un tartufo."
      }
    ]
  },
  {
    id: 'natura_cucina',
    v: 23,
    n: 'Sessantacinque ricette nuove',
    steps: [
      {
        t: 'In cucina ci sono più di cento ricette. Alcune te le insegnano gli abitanti quando siete amici; altre le scopri da sol{o|a}: quando hai avuto fra le mani tutti gli ingredienti, ti viene l’idea. Altre ancora arrivano con l’esperienza, salendo di livello.'
      },
      {
        t: 'Il ricettario ti dice come imparare quelle che non sai ancora. E certi piatti fanno effetto per mezza giornata: passo svelto, meno fatica, o il bosco più generoso.'
      }
    ]
  },
  {
    id: 'natura_macchine',
    v: 24,
    n: 'Sette macchinari nuovi',
    steps: [
      {
        t: 'Al banco da lavoro, nella scheda Macchine: il <b>frantoio</b> (olio), l’<b>essiccatoio</b> (funghi, frutta ed erbe secche), la <b>zangola</b> (burro e formaggio), l’<b>alambicco</b> (essenze preziose), la <b>seminatrice</b> (semi dai raccolti), la <b>compostiera</b> (concime) e il <b>forno a legna</b>.'
      },
      {
        t: 'Si usano come il barattolo: tieni in mano quello che va dentro e usalo sulla macchina. Mentre lavorano si vede: la macina gira, il fuoco scoppietta, il fumo esce dal comignolo.'
      }
    ]
  },
  {
    id: 'natura_fauna',
    v: 25,
    n: 'Gli animali del bosco',
    steps: [
      {
        t: 'La Valle si è riempita di animali selvatici: farfalle e api di giorno, lucciole e pipistrelli d’estate, scoiattoli sotto gli alberi, il riccio la sera, la volpe all’alba, il gufo di notte, l’airone e i cigni sul fiume, il pettirosso d’inverno, le lumache quando piove… e altri ancora.'
      },
      {
        t: 'Non si cacciano: si osservano. Avvicinati piano a uno che non conosci e finirà nel <b>Taccuino del naturalista</b> (☰ → Taccuino). Più animali osservi, più premi ricevi.'
      }
    ]
  },
  {
    id: 'mp_fluido',
    v: 26,
    n: 'Visite più fluide',
    steps: [
      {
        t: 'Quando sei nel villaggio di un amico, o un amico è nel tuo, adesso vi vedete camminare in modo fluido, senza scatti e con meno ritardo.'
      }
    ]
  }
];
for (const g of NOVITA) if (!GUIDES.some(x => x.id === g.id)) GUIDES.push(g);
