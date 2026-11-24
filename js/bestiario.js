'use strict';
// ================= IL BESTIARIO: gli animali disegnati a mano prendono il loro posto =================
// Alla fine del caricamento (punto 'arte'; questo file viene dopo natura_fauna.js e contenuti.js, che disegnano
// la fauna e gli animali nuovi) gli sprite fatti a mano in tools/pixel/ sostituiscono quelli generati:
//   animali.pxs → js/animali_mano.js   la fattoria: gallina (3 fotogrammi, il terzo becca), anatra, mucca, capra,
//                                       pecora e pecora tosata (2 di passo)
//   fauna.pxs   → js/fauna_mano.js     corvo, coniglio, volpe, gufo, pipistrello, cervo
//   compagni_abbozzo.py → js/compagni_mano.js   il gatto nero randagio del paese (e i compagni: compagno.js)
// Tutti di profilo verso destra (il gioco li specchia), un pixel per unità, già nello stile: il filtro non li tocca.

// i fotogrammi di nome base0, base1, ... di un foglio disegnato a mano
const fotogrammi = (D, base) =>
  Object.keys(D.sprite)
    .filter(n => n.replace(/\d+$/, '') === base)
    .map(n => daGriglia(D, n));
Ext.on('arte', () => {
  const A = ANIMALI_MANO,
    F = FAUNA_MANO;
  // la fattoria
  CRIT.chicken = fotogrammi(A, 'gallina');
  Object.assign(AIMG, {
    anatra: fotogrammi(A, 'anatra'),
    mucca: fotogrammi(A, 'mucca'),
    capra: fotogrammi(A, 'capra'),
    pecora: fotogrammi(A, 'pecora'),
    pecoraTosata: fotogrammi(A, 'tosata')
  });
  // le bestiole del paese: il corvo dall'occhio rosso (posato, due battiti d'ala), il coniglio (fermo, due salti),
  // l'anatra dello stagno,
  // il gatto nero randagio (passo, seduto, sdraiato)
  CRIT.crow = fotogrammi(F, 'corvo');
  CRIT.rabbit = fotogrammi(F, 'coniglio');
  CRIT.duck = fotogrammi(A, 'anatra'); // l'anatra dello stagno: la stessa della fattoria, grigia col collo petrolio
  const P = COMPAGNI_MANO.paese;
  CRIT.cat = [0, 1, 2, 3].map(f => daGriglia(P, 'f' + f));
  // la fauna del bosco
  FAUNA_IMG.volpe = { passo: fotogrammi(F, 'volpe_passo'), fermo: fotogrammi(F, 'volpe_fermo') };
  const gufo = fotogrammi(F, 'gufo');
  // il gufo guarda a lungo, sbatte gli occhi, gira la testa
  FAUNA_IMG.gufo = { fermo: [0, 0, 0, 1, 0, 0, 2, 2].map(k => gufo[k]) };
  FAUNA_IMG.pipistrello = { ali: fotogrammi(F, 'pipistrello') };
  // l'icona per il taccuino: il primo fotogramma del disegno nuovo
  for (const k of ['volpe', 'gufo', 'pipistrello']) {
    const I = FAUNA_IMG[k];
    I.icona = (I.fermo || I.ali)[0];
  }
  // il cervo nero dalle corna a lira
  Object.assign(DEER, {
    stand: daGriglia(F, 'cervo_fermo'),
    graze: daGriglia(F, 'cervo_bruca'),
    run: fotogrammi(F, 'cervo_corsa')
  });
});
