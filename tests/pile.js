'use strict';
// 31. Pile alla Minecraft e schermate che stanno sui telefoni: con una pila scelta, trascinando sulle caselle la
// si divide in parti uguali; i pulsanti −, +, ½, 1 e Tutta cambiano quanti se ne spostano; nella macchina il
// tocco lungo mette metà pila; la fornace e la cassa, su uno schermo basso, stanno tutte senza scorrere.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await page.setViewportSize({ width: 568, height: 320 });
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const st = G.st,
      R = {};
    for (const g of GUIDES) guidesSeen(st)[g.id] = 1;
    if (G.tour) tourEnd();
    st.free.built['10,10'] = { id: 'fornace', d: st.day };
    st.free.built['12,10'] = { id: 'cassa', inv: cassaVuota() };
    st.inv[12] = { id: 'ferro', n: 24 };
    st.inv[13] = { id: 'legna', n: 10 };
    // la fornace: tutto in una schermata; tocco lungo = metà pila di ferro
    macGui('10,10', st.free.built['10,10']);
    const b = $('#mbox');
    R.fornace = b.scrollHeight - b.clientHeight;
    macMetti(12, 'meta');
    R.meta = st.inv[12] ? st.inv[12].n : 0;
    UI.close();
    // la cassa: tutto in una schermata
    zaino('12,10');
    R.cassa = $('#mbox').scrollHeight - $('#mbox').clientHeight;
    // 10 legna su tre caselle: 3 + 3 + 3, e 1 resta scelta nello zaino
    zTocca('z', 13, false);
    zDistribuisci([
      ['c', 0],
      ['c', 1],
      ['c', 2]
    ]);
    const C = st.free.built['12,10'].inv;
    R.dist = C.slice(0, 3)
      .map(s => s && s.n)
      .join(',');
    R.resto = st.inv[13] ? st.inv[13].n : 0;
    // i pulsanti della quantità
    zNessuna();
    zTocca('z', 12, false);
    zQuanti('meta');
    const a = ZSEL.n;
    zQuanti('+1');
    const b2 = ZSEL.n;
    zQuanti('1');
    const c = ZSEL.n;
    zQuanti('tutta');
    R.quanti = [a, b2, c, ZSEL.n].join(',');
    UI.close();
    return R;
  });
  t.eq('la fornace sta tutta nello schermo di un telefono, senza scorrere', r.fornace, 0);
  t.eq('nella fornace il tocco lungo mette metà pila', r.meta, 12);
  t.eq('la cassa con lo zaino sta tutta nello schermo, senza scorrere', r.cassa, 0);
  t.eq('trascinando su tre caselle la pila si divide in parti uguali', r.dist, '3,3,3');
  t.eq('e quello che avanza resta nello zaino', r.resto, 1);
  t.eq('i pulsanti ½, +, 1 e Tutta cambiano la quantità scelta', r.quanti, '6,7,1,12');
  t.eq('pile: nessun errore', errors.join('\n'), '');
  await page.close();
};
