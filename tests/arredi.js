'use strict';
// 29. I mobili della casa: quelli grandi occupano tutte le loro caselle (e non si sovrappongono), quelli vivi si
// muovono (il pendolo, l'arcolaio, la sedia a dondolo), le stanze nuove hanno finestre, applique e, nel salone,
// il secondo camino; si fanno al banco o si comprano da Agatha.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const st = G.st,
      S = guidesSeen(st),
      R = {};
    for (const g of GUIDES) S[g.id] = 1;
    if (G.tour) tourEnd();
    st.free.house = 1;
    rebuildMaps();
    R.spogliaUno = !G.maps.house.objs.some(o => o.kind === 'applique');
    st.free.house = 5;
    rebuildMaps();
    goMap('house', 6, 12, 0, true);
    const m = G.maps.house;
    R.camini = m.objs.filter(o => o.kind === 'fire' || o.fid === 'camino_nonno').length; // quello del nonno ora è un mobile
    R.applique = m.objs.filter(o => o.kind === 'applique').length;
    R.pietra = m.get(10, 11) === 7;
    // il letto grande: 2×2 caselle
    R.spazio = furnSpazio(m, 'letto', 12, 5);
    st.free.inside['12,5'] = { id: 'letto' };
    rebuildMaps();
    const H = G.maps.house,
      L = H.objAt(12, 5);
    R.letto = [
      [12, 5],
      [13, 5],
      [12, 4],
      [13, 4]
    ].every(([x, y]) => H.objAt(x, y) === L && H.solid(x, y));
    R.sovrapposto = furnSpazio(H, 'divano', 11, 4);
    R.messaggio = (G.map = H) && bmCanPlace('divano', 11, 4);
    // i mobili vivi
    st.free.inside['3,11'] = { id: 'pendolo' };
    st.free.inside['8,11'] = { id: 'arcolaio' };
    st.free.inside['15,11'] = { id: 'dondolo' };
    rebuildMaps();
    G.map = G.maps.house;
    return R;
  });
  t.true('la casa piccola resta com’era', r.spogliaUno);
  t.eq('nel salone c’è il secondo camino', r.camini, 2);
  t.true('le stanze nuove hanno le applique accese', r.applique >= 2);
  t.true('il piano di sotto ha il pavimento di pietra', r.pietra);
  t.true('c’è posto per il letto grande', r.spazio);
  t.true('il letto grande occupa tutte e quattro le sue caselle', r.letto);
  t.true('un divano non si posa sopra il letto', !r.sovrapposto);
  t.true('e la posa dice perché', /caselle/.test(r.messaggio || ''));
  await page.waitForTimeout(500);
  const vivi = await page.evaluate(async () => {
    const m = G.map,
      o = id => m.objs.find(q => q.fid === id),
      R = {};
    R.pendolo = o('pendolo').img !== FREEIMG.pendolo;
    Ext.intercetta('arredo', o('arcolaio'));
    Ext.intercetta('arredo', o('dondolo'));
    await new Promise(r => setTimeout(r, 300));
    R.gira = arrStato(o('arcolaio')).gira > 1;
    R.dondola = arrStato(o('dondolo')).dondola > 0.05;
    return R;
  });
  t.true('l’orologio a pendolo si disegna vivo (lancette e pendolo)', vivi.pendolo);
  t.true('toccato, l’arcolaio gira', vivi.gira);
  t.true('toccata, la sedia dondola', vivi.dondola);
  const dove = await page.evaluate(() => ({
    banco: ['letto', 'armadio', 'pendolo', 'stufa'].every(id => CRAFTS.some(c => c.id === id)),
    agatha: ['divano', 'carillon', 'gabbia'].every(id => DECOR_SHOP.some(d => d[0] === id)),
    icone: Object.keys(ARREDI).every(id => ICON[id] && FREEIMG[id])
  }));
  t.true('i mobili di legno si fanno al banco', dove.banco);
  t.true('stoffa, vetro e ottone li vende Agatha', dove.agatha);
  t.true('ogni mobile ha il suo disegno e la sua icona', dove.icone);
  t.eq('arredi: nessun errore', errors.join('\n'), '');
  await page.close();
};
