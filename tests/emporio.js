'use strict';
// 24. L'Emporio Crane dentro: di giorno la porta si apre, Agatha (nella Valle, non il sabato) sta dietro il
// bancone, la merce degli scaffali è quella della bottega e si compra toccandola; di sera la porta resta chiusa.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    const st = G.st,
      S = guidesSeen(st);
    for (const g of GUIDES) S[g.id] = 1;
    if (G.tour) tourEnd();
    while (WD(st) !== 1) st.day++;
    st.time = 9 * 60;
    st.weather = 'sole';
    st.money = 2000;
    goMap('main', 55, 17, 3, true);
  });
  await page.waitForTimeout(900);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => G.map && G.map.id === 'store' && !G.cut, null, { timeout: 8000 });
  await page.waitForTimeout(900);
  const dentro = await page.evaluate(() => {
    const a = NPC('agatha'),
      M = empMerce(),
      tutti = [...M.scaffali.flat(), ...M.tavolo, ...M.altro].sort().join(','),
      bottega = shopItems().slice().sort().join(',');
    return { mappa: G.map.id, agatha: a.map === 'store' && !a.hidden, merce: tutti === bottega };
  });
  t.eq('di giorno la porta dell’emporio si apre', dentro.mappa, 'store');
  t.true('nella Valle Agatha sta dietro il bancone', dentro.agatha);
  t.true('sugli scaffali c’è tutta la merce della bottega', dentro.merce);
  const compra = await page.evaluate(() => {
    setPos(G.player, 3, 3, 3);
    runAct(G.map.objAt(3, 2));
    const b = document.querySelector('#mbox [data-b][data-q="1"]'),
      id = b && b.dataset.b,
      prima = countItem(id),
      soldi = G.st.money;
    b.click();
    const ok = countItem(id) === prima + 1 && G.st.money === soldi - empPrezzo(id);
    UI.close();
    return ok;
  });
  t.true('toccando lo scaffale si compra un pacchetto di semi', compra);
  // il sabato: al banco del mercato in piazza
  const sabato = await page.evaluate(() => {
    const st = G.st;
    while (WD(st) !== 5) st.day++;
    const s = schedOf('agatha');
    return !!s && !s.in;
  });
  t.true('il sabato Agatha torna al banco in piazza', sabato);
  // la sera: chiuso
  const sera = await page.evaluate(async () => {
    const st = G.st;
    await goMap('main', 55, 17, 3, true);
    st.time = 20 * 60;
    return empAperto(st);
  });
  t.true('di sera l’emporio è chiuso', !sera);
  t.eq('emporio: nessun errore', errors.join('\n'), '');
  await page.close();
};
