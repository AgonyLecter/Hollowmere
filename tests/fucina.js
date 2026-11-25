'use strict';
// 25. La fucina di Brom dentro: di giorno la porta si apre, nella Valle la mattina Brom lavora all'incudine
// dentro (il pomeriggio fuori), all'incudine si migliorano gli attrezzi; di sera la porta resta chiusa.
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
    const [x, y] = bdoor('forge');
    goMap('main', x, y + 1, 3, true);
  });
  await page.waitForTimeout(900);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => G.map && G.map.id === 'forge' && !G.cut, null, { timeout: 8000 });
  await page.waitForTimeout(1500);
  const dentro = await page.evaluate(() => {
    const b = NPC('brom');
    return { mappa: G.map.id, brom: b.map === 'forge' && !b.hidden };
  });
  t.eq('di giorno la porta della fucina si apre', dentro.mappa, 'forge');
  t.true('nella Valle, la mattina, Brom lavora dentro', dentro.brom);
  await page.evaluate(() => {
    setPos(G.player, 5, 6, 3);
  });
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(600);
  const incudine = await page.evaluate(
    () => UI.dlgOpen && /Zappa|Annaffiatoio|Accetta|Piccone/.test($('#dlg').textContent)
  );
  t.true('all’incudine Brom propone i miglioramenti degli attrezzi', incudine);
  const pomeriggio = await page.evaluate(() => {
    const st = G.st;
    st.time = 14 * 60;
    const s = schedOf('brom');
    return !!s && !s.in;
  });
  t.true('il pomeriggio Brom torna all’incudine fuori', pomeriggio);
  t.true('di sera la fucina è chiusa', await page.evaluate(() => ((G.st.time = 20 * 60), !fucAperta(G.st))));
  t.eq('fucina: nessun errore', errors.join('\n'), '');
  await page.close();
};
