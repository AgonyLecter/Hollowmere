'use strict';
// ================= I RICORDI_NONNO DEL NONNO =================
// Dopo la storia, nella Valle, gli oggetti della storia che restano in tasca (il nastro rosso per chi non l'ha
// seppellito, le chiavi, la lanterna di Clara, il mantello giallo) trovano il loro posto: la cassa del nonno, in casa.
// Ogni ricordo riposto apre una pagina che gli dà un senso, secondo il finale vissuto, e si può rileggere quando si
// vuole. Restano nel salvataggio (st.free.ricordi: id → giorno in cui è stato riposto): la storia che verrà dopo
// li ritroverà lì, con ricordiCustoditi().

const RICORDI_NONNO = {
  nastro: {
    n: 'Il nastro rosso',
    pagina: {
      1: '<p>Sei scappat{o|a} con Clara, e il nastro è venuto con te. Lei dice che suo padre ne aveva uno uguale e che lo tirava fuori solo il giorno del suo compleanno. Il giorno in cui lo contarono.</p><p>Nella Valle il rosso era proibito perché è il colore di chi ha detto <b>no</b>. Le radici se lo ricordano: quando lo vedono, si ritraggono ancora.</p>',
      2: "<p>Lo avevi in tasca anche mentre ti contavano. Adesso, la notte, sono i tuoi zoccoli che si sentono sul ponte.</p><p>Di giorno il nastro è l'unica cosa che ricorda chi eri. Quando lo tocchi, per un istante, il collo non ti fa male.</p>",
      3: "<p>L'hai legato alla testa di tuo nonno, e il patto si è spezzato. Eppure stamattina era di nuovo nella tua tasca, asciutto, senza un filo di terra.</p><p>Forse non è mai stato uno solo. Forse ce n'è uno per ogni nome che la Valle ha contato.</p>"
    },
    fine: 'Nella cassa non brucia più. Aspetta.'
  },
  key: {
    n: 'La chiave della cassa',
    pagina: {
      0: "<p>Era la chiave di questa cassa. Dentro c'erano una pipa, un fazzoletto giallo e la prima pagina del diario: «Non farti contare due volte».</p><p>La lasci dentro, sotto il fazzoletto. Una chiave chiusa nella sua cassa non apre più niente. È questo, il punto.</p>",
      1: "<p>Il nonno l'aveva lasciata perché tu leggessi e scappassi. Ci sei riuscit{o|a}.</p>",
      2: "<p>Il nonno l'aveva lasciata perché tu leggessi e scappassi. Non è bastato. Ma hai letto.</p>",
      3: "<p>Il nonno l'aveva lasciata perché tu leggessi. Hai letto tutto, fino all'ultima pagina.</p>"
    },
    fine: 'La pipa sa ancora di tabacco.'
  },
  keyI: {
    n: 'La chiave del fienile',
    pagina: {
      0: "<p>Fredda come la prima volta. Apriva il fienile rosso dell'Anziano, dove dormiva il registro: otto nomi per ogni autunno, e uno in più, scritto a matita.</p>",
      1: "<p>Il fienile è ancora rosso. Qualcuno, nella Valle, tiene ancora il registro. Ma la pagina di quest'anno è bianca.</p>",
      2: '<p>Il registro adesso ha anche il tuo nome, in fondo, sulla pagina nuova. La grafia è la tua.</p>',
      3: '<p>Il fienile ora è vuoto. Ezekiel ci ha portato le sue cose e ci dorme: un custode che non ha più niente da custodire.</p>'
    },
    fine: 'Il registro non serve più a nessuno. La chiave sì: ricorda.'
  },
  lanterna: {
    n: 'La lanterna di Clara',
    pagina: {
      0: "<p>Una luce gialla, piccola. Nel bosco era l'unica che contava.</p>",
      1: "<p>Clara te l'ha lasciata quando vi siete separati, fuori dalla Valle. «Per quando torni», ha detto. La domenica, quando viene, la accende lei.</p>",
      2: "<p>Clara non l'ha più chiesta indietro. La notte ne accende un'altra alla sua finestra, perché tu sappia da che parte non andare.</p>",
      3: "<p>Ora che l'Albero è bruciato non serve più. La accendi lo stesso, la sera, per abitudine. Per tuo nonno.</p>"
    },
    fine: 'Si accende da sola, ogni tanto, quando nessuno guarda.'
  },
  mantello: {
    n: 'Il mantello giallo',
    pagina: {
      0: '<p>Un dono del villaggio. Il giallo non protegge: segna.</p>',
      1: "<p>Non l'hai mai indossato. È la cosa migliore che tu abbia fatto, nella Valle.</p>",
      2: '<p>È tuo. Lo porti quando cavalchi. Di giorno lo pieghi qui, nella cassa del nonno, perché nessuno lo veda.</p>',
      3: '<p>Il giallo è sbiadito in una notte sola. Adesso è soltanto stoffa, e sa di fumo.</p>'
    },
    fine: 'Lo pieghi con cura. Il nonno ne aveva uno uguale.'
  }
};

// la pagina di un ricordo: quello che è, e cosa vuol dire dopo il finale che hai vissuto
function paginaRicordo(id) {
  const R = RICORDI_NONNO[id],
    fin = (G.st.free && G.st.free.ending) || 3;
  return (
    `<h2>${R.n}</h2><div class="paper"><p><i>Dalla cassa del nonno</i></p>` +
    (R.pagina[0] || '') +
    (R.pagina[fin] || '') +
    `<p class="ink">${R.fine}</p></div>`
  );
}
// i ricordi sono gli oggetti segnati ricordo: 1 in ITEMS (farm.js); qui ognuno ha la sua pagina
// i ricordi riposti nella cassa, per la storia che verrà
function ricordiCustoditi(st = G.st) {
  return Object.keys((st && st.free && st.free.ricordi) || {});
}
async function cassaDelNonno(o) {
  const st = G.st,
    R = (st.free.ricordi = st.free.ricordi || {}),
    daRiporre = Object.keys(RICORDI_NONNO).filter(k => countItem(k) > 0 && !R[k]);
  o.img = IMG.chestO;
  AU.play('door');
  if (daRiporre.length) {
    await narr(
      Object.keys(R).length
        ? 'Apri la cassa del nonno. In tasca hai ancora qualcosa che appartiene a qui.'
        : 'Apri la cassa del nonno. Una pipa, un fazzoletto giallo, e tanto posto vuoto. Come se ti aspettasse. Le cose che la storia ti ha lasciato in tasca, qui, avrebbero un senso.'
    );
    for (const k of daRiporre) {
      removeItem(k, countItem(k));
      R[k] = st.day;
      AU.play('page');
      await UI.paper(paginaRicordo(k), 'Riponi');
    }
    await narr('Chiudi la cassa. Per la prima volta, in questa casa, qualcosa è al suo posto.');
    return;
  }
  const L = Object.keys(R).filter(k => RICORDI_NONNO[k]);
  if (!L.length)
    return narr(
      'La cassa del nonno. Una pipa, un fazzoletto giallo, e tanto posto vuoto. Qui staranno bene le cose che la storia ti ha lasciato in tasca.'
    );
  const c = await ask(
    null,
    'La cassa del nonno. Dentro, i ricordi che hai riposto. Quale vuoi rileggere?',
    L.map(k => RICORDI_NONNO[k].n).concat(['Chiudi la cassa'])
  );
  if (c >= 0 && c < L.length) {
    AU.play('page');
    await UI.paper(paginaRicordo(L[c]));
  }
}
// nella Valle la cassa del nonno è la cassa dei ricordi (nella storia resta quella con la chiave)
Ext.on('cassaNonno', o => {
  if (!isFree(G.st)) return false;
  cassaDelNonno(o).catch(e => segnala(e, 'ricordi'));
  return true;
});
// al mattino, se in tasca c'è ancora un ricordo della storia: un suggerimento, una volta sola
Ext.on('freeMorning', () => {
  const st = G.st;
  if (!isFree(st)) return;
  const R = (st.free && st.free.ricordi) || {};
  if (Object.keys(RICORDI_NONNO).some(k => countItem(k) > 0 && !R[k]))
    tip(
      'tipRicordi',
      'Hai ancora in tasca un ricordo della storia. La cassa del nonno, in casa, ha posto per lui.'
    );
});
