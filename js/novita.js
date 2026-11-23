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
  },
  {
    id: 'gazzetta',
    v: 27,
    n: 'La Gazzetta della Valle',
    steps: [
      {
        t: 'Ti ho portato un collega: <b>Pennino</b>, il piccione viaggiatore. Vive su un trespolo che trovi nello zaino: mettilo vicino a casa. Se l’hai perso, si costruisce al banco (Esterni).'
      },
      {
        t: 'Usando il trespolo si apre la <b>Gazzetta della Valle</b>: la bacheca di tutti i giocatori. Puoi scrivere biglietti sul tuo villaggio e scattare fotografie con la macchina a soffietto: Pennino le porta a tutti.'
      },
      {
        t: 'Ai biglietti degli altri si regalano piume e si scrivono commenti. Ogni settimana la fotografia con più piume vince il <b>Nastro della Gazzetta</b> e 1500 scudi. Quando arriva posta, Pennino torna con una lettera nel becco.'
      }
    ]
  },
  {
    id: 'ritocchi1',
    v: 28,
    n: 'Piccole cose sistemate',
    steps: [
      {
        t: 'In miniera la scala per scendere si nasconde sempre sotto una pietra: avvicinati e cerca lo spiffero d’aria fredda che sale dalle crepe. Al primo colpo di piccone, quella pietra suona vuota.'
      },
      {
        t: 'Adesso si può mangiare anche in miniera e quando sei ospite nel villaggio di un amico. E gli avvisi uguali non si accumulano più sullo schermo.'
      },
      {
        t: 'Nella Gazzetta Pennino porta un biglietto al giorno: il tuo puoi correggerlo (✏️ Modifica) o toglierlo (🗑 Togli) quando vuoi.'
      }
    ]
  },
  {
    id: 'suono_porte',
    v: 29,
    n: 'Musica nuova e porte a cui bussare',
    steps: [
      {
        t: 'Senti? La Valle ha una musica nuova: una per ogni stagione, una per il tramonto, una per la notte, per la pioggia, la cappella, la miniera e la festa. In casa la stessa musica arriva attutita, come da dietro un muro. E anche nei giorni più allegri, ascolta bene: c’è sempre qualcosa che non torna.'
      },
      {
        t: 'Se un abitante è in casa, <b>bussa alla sua porta</b>. Se ha voglia esce a fare due chiacchiere, se no te lo dice da dietro la porta. Se non c’è, spesso trovi un biglietto con scritto dove è andato. Nel taccuino degli abitanti (☰ → Abitanti) c’è sempre scritto dove si trova ognuno.'
      },
      {
        t: 'E la cassetta delle spedizioni adesso ti dice chi ti ha mandato ogni regalo. Quelli che ricevi restano scritti nel taccuino degli abitanti, così non te li dimentichi. Le scintille della fucina, poi, si vedono solo quando Brom batte davvero il ferro.'
      }
    ]
  },
  {
    id: 'macchine_timer',
    v: 30,
    n: 'Macchine con il cartellino',
    steps: [
      {
        t: 'Fornace, barattolo e botte adesso hanno un <b>cartellino</b> che dice cosa stanno facendo e quando è pronto (per esempio «Lingotto · domani»). Le cose che metti dentro non spariscono: tornano il mattino dopo, trasformate.'
      },
      {
        t: 'E puoi metterne dentro <b>più di un lotto</b> alla volta: con 10 ferro e 2 legna la fornace ti fa 2 lingotti. Anche il suono è più pulito: niente più gracchiare sotto la pioggia e i tuoni.'
      }
    ]
  },
  {
    id: 'macchine_gui',
    v: 31,
    n: 'Le macchine hanno la loro schermata',
    steps: [
      {
        t: 'Tocca la fornace (o il barattolo, la botte, il frantoio…): si apre la sua schermata. A sinistra metti quello che vuoi lavorare, e nella fornace anche la <b>legna</b> sotto il fuoco. A destra escono i prodotti: toccali per prenderli.'
      },
      {
        t: 'La freccia al centro si riempie e ti dice quanto manca. Le macchine lavorano un pezzo alla volta, anche quando non le guardi e mentre dormi: la fornace fa un lingotto ogni ora e mezza. Sopra la macchina, una barretta ti mostra a che punto è.'
      },
      {
        t: 'Quello che avevi già messo nelle macchine ti aspetta, pronto, nello spazio a destra. E una macchina con qualcosa dentro non si smonta più per sbaglio.'
      }
    ]
  },
  {
    id: 'mulino_museo_mira',
    v: 32,
    n: 'Mulino, apiario, museo nuovo',
    steps: [
      {
        t: 'Anche il <b>mulino</b> e l’<b>apiario</b> hanno la loro schermata. Nel mulino metti grano, mais, orzo, patate o castagne e la farina esce a destra, una macinata all’ora (più svelto ai livelli alti: il pulsante «Migliora…» è in alto). Nell’apiario vedi quanti giorni mancano al miele e lo prendi con un tocco.'
      },
      {
        t: 'Il <b>museo</b> è stato ricostruito: adesso è un vero tempietto con sei colonne, più grande delle case del paese. E il mulino è diventato una torre come si deve.'
      },
      {
        t: 'Parlare è più facile: se accanto a una persona c’è un gatto, una gallina o un sasso, il tasto agisce su quello più vicino a dove guardi, e il fumetto sopra la testa te lo dice prima.'
      }
    ]
  },
  {
    id: 'zaino_mc',
    v: 33,
    n: 'Lo zaino nuovo',
    steps: [
      {
        t: 'Lo zaino (🎒 o tasto I) funziona come in Minecraft. <b>Tocca</b> una pila per prenderla in mano, poi tocca dove posarla: uguali si uniscono, diverse si scambiano. In alto vedi sempre cosa hai in mano.'
      },
      {
        t: '<b>Doppio tocco</b>: sposti una pila al volo tra la barra e il resto dello zaino, oppure tra zaino e cassa. <b>Tieni premuto</b>: prendi metà pila; con qualcosa in mano, tieni premuto su un posto per posarne uno solo.'
      },
      {
        t: 'La barra adesso è staccata in fondo, come in Minecraft. Per buttare qualcosa prendilo in mano e tocca il cestino. E niente si perde: se chiudi con qualcosa in mano, torna da solo nello zaino.'
      }
    ]
  },
  {
    id: 'valle_inverno',
    v: 35,
    n: 'Orto, bosco e prato nuovi',
    steps: [
      {
        t: 'Nell’orto: <b>radicchio</b> e <b>cavolo nero</b> per l’inverno, <b>pastinaca</b>, <b>rabarbaro</b>, <b>fagiolini</b>, <b>peperoncino</b> ed <b>erba cipollina</b>. I semi li trovi da Agatha nella loro stagione e sul carro del cocchiere.'
      },
      {
        t: 'Dal cocchiere anche tre alberelli nuovi: il <b>cotogno</b>, il <b>nocciolo</b> e il <b>sorbo</b>, che dà frutti perfino d’inverno. I vecchi lo piantavano davanti a casa, «contro quelli del bosco».'
      },
      {
        t: 'Nei prati e nel bosco: prugnole e chiodini d’autunno, vischio d’inverno, bruscandoli e primule in primavera, iperico d’estate. E diciassette ricette nuove: alcune te le insegnano gli abitanti, altre le scopri da te.'
      },
      {
        t: 'E guarda per terra: il prato adesso è un prato vero, che cambia con le stagioni. L’erba alta ondeggia col vento e si piega quando ci passi in mezzo.'
      },
      {
        t: 'E le misure tornano: la <b>casetta</b> dei nuovi abitanti è una casa vera, grande come quelle del paese (5×4), il <b>mulino</b> è una torre alta come il fienile e la <b>torre di guardia</b> sulla Collina svetta sopra i tetti.'
      }
    ]
  },
  {
    id: 'incudine_falce',
    v: 36,
    n: 'Incudine, falce e casse condivise',
    steps: [
      {
        t: 'Al banco da lavoro puoi costruire l’<b>incudine</b>: con lingotti e un po’ di legna ci forgi gli attrezzi. Zappa, annaffiatoio, accetta, piccone, pala… anche per rifarti quelli che hai perso.'
      },
      {
        t: 'All’incudine c’è anche un attrezzo nuovo, la <b>falce</b>: falcia l’erba alta e ti dà la fibra, senza andarla a cercare. Dopo tre giorni l’erba ricresce.'
      },
      {
        t: 'Nel villaggio di un amico le <b>casse</b> e le <b>macchine</b> adesso funzionano davvero insieme: quello che mettete e prendete arriva sempre, anche se lo fate nello stesso momento. E se chiudi il gioco mentre sei in visita, quello che hai fatto resta salvato.'
      }
    ]
  },
  {
    id: 'insieme',
    v: 37,
    n: 'Insieme nella Valle',
    steps: [
      {
        t: 'Quando qualcuno entra nel tuo villaggio (o in quello dove sei) adesso te ne accorgi: compare un avviso. Il pulsante <b>👥</b> in alto (o il tasto U) mostra chi c’è e cosa può fare.'
      },
      {
        t: 'Da lì dai o togli il permesso <b>🔨 Può costruire</b> agli amici, e aggiungi agli amici chi è passato a trovarti. C’è scritto chiaro cosa può fare ogni ospite, e cosa no.'
      },
      {
        t: 'Quando siete in più nello stesso villaggio arriva la <b>missione comune</b> del giorno: annaffiare, raccogliere, abbattere alberi o falciare, tutti insieme. Contano le mosse di ognuno, e a missione compiuta il premio va a tutti.'
      },
      {
        t: 'E due cose sistemate: un regalo o un piatto ricevuti a zaino pieno non prendono più il posto di niente (aspettano nella cassetta), e nelle macchine un tocco mette un lotto, il doppio tocco tutta la pila.'
      }
    ]
  },
  {
    id: 'gesti',
    v: 38,
    n: 'Colpi che si sentono',
    steps: [
      {
        t: 'Gli attrezzi adesso si caricano e colpiscono davvero: il colpo arriva quando la lama tocca, e solo allora volano schegge, scintille, zolle o gocce, con il loro suono.'
      },
      {
        t: 'L’albero abbattuto <b>scricchiola e cade</b> dalla parte opposta alla tua, con un tonfo che fa tremare la terra; poi resta il ceppo. Le rocce si spaccano in pezzi, la falce spazza l’erba in un arco.'
      },
      {
        t: 'Anche i passi cambiano con il terreno: erba, ghiaia, legno, pietra e neve hanno ognuno il suo rumore.'
      },
      {
        t: 'E la Valle si vede più da vicino: tutto è più grande e dettagliato, i campi arati hanno i bordi tondi e sembrano un orto vero, i sentieri curvano nel prato.'
      }
    ]
  },
  {
    id: 'stile',
    v: 39,
    n: 'Braccia, inquadratura e un vestito nuovo',
    steps: [
      {
        t: 'L’inquadratura la scegli tu: in ☰ → Opzioni c’è il cursore <b>Inquadratura</b>, da lontano a vicino. Sul computer anche i tasti <b>+</b> e <b>−</b>, sul telefono due dita sullo schermo.'
      },
      {
        t: 'Quando usi un attrezzo si muove tutto il corpo: le braccia caricano sopra la testa e colpiscono, l’annaffiatoio si inclina per versare, la falce spazza bassa.'
      },
      {
        t: 'In piazza si passa meglio: zucche, fiori e mucchi di foglie si possono calpestare, e i lampioni stanno a lato del sentiero, non in mezzo.'
      },
      {
        t: 'Menù, zaino, dialoghi e banco da lavoro hanno un vestito nuovo: cornici di legno con gli angolari di ferro, bottoni in rilievo, caselle incavate.'
      }
    ]
  },
  {
    id: 'casse_sane',
    v: 40,
    n: 'Casse e zaino riparati',
    steps: [
      {
        t: 'Nei villaggi dei giocatori di lunga data alcune casse erano rimaste più piccole (anche solo 3 posti) e certe cose sparivano tra zaino e cassa. Adesso, aprendo il gioco, <b>ogni cassa torna di 20 posti</b> con tutto al suo posto, e lo zaino si rimette in ordine da solo.'
      },
      {
        t: 'Se qualcosa non trova posto, non si perde: ti aspetta nella <b>cassetta delle spedizioni</b>. Lo stesso quando lo zaino è pieno e trovi, compri o vinci qualcosa.'
      },
      {
        t: 'Gli attrezzi non si impilano più: ogni attrezzo ha il suo posto, anche quando ne hai due uguali.'
      }
    ]
  },
  {
    id: 'compagno',
    v: 41,
    n: 'Un amico a quattro zampe',
    steps: [
      {
        t: 'Pollaio, stalla e ovile hanno la loro schermata: vedi le bestie, ne compri altre e prendi quello che hanno lasciato in casa, <b>scegliendo tu</b> cosa (le uova di gallina o quelle d’anatra). Niente più uova a terra tra le zampe.'
      },
      {
        t: 'Di giorno le bestie pascolano fuori; la sera tornano alla porta ed entrano, la mattina escono. Quando c’è qualcosa da prendere, sopra la casa compare il prodotto.'
      },
      {
        t: 'Un giorno, davanti a casa, troverai <b>due randagi</b>: un cucciolo e un gattino. Uno può restare con te: scegli com’è e dagli un nome.'
      },
      {
        t: 'Toccalo per la sua schermata: <b>Segui</b> (ti accompagna ovunque, ti porta rami, sassi ed erbe, e se sei sfinito ti tira su) o <b>Resta</b> (gira davanti a casa, la notte dorme nella cuccia, ti fa le feste e ti chiama se ha fame). Lì c’è anche la sua bottega: crocchette, ciotola, cuccia e giochi da mettere in casa.'
      },
      {
        t: 'Alla bacheca le faccende del giorno sono molte di più: annaffiare, raccogliere, la legnaia, i muretti, la ronda, il recinto, la pesca per Agatha, le uova, il latte… Finita una, puoi prenderne un’altra (fino a tre al giorno).'
      }
    ]
  },
  {
    id: 'atmosfera',
    v: 42,
    n: 'L’autunno di Hollowmere',
    steps: [
      {
        t: 'Guarda per terra: il prato si è fatto ocra e muschio, e le foglie cadute si ammucchiano sotto gli alberi e contro i recinti.'
      },
      {
        t: 'All’alba e la sera una nebbia bassa striscia tra le case e gli alberi. La luce cambia con le ore: ambra di giorno, arancio al tramonto.'
      },
      {
        t: 'E la notte, a Hollowmere, è verde come l’acqua di uno stagno. Le lanterne e le finestre accese sono le uniche isole calde. Non allontanarti troppo dalla luce.'
      }
    ]
  }
];
for (const g of NOVITA) if (!GUIDES.some(x => x.id === g.id)) GUIDES.push(g);
