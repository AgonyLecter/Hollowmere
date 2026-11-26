'use strict';
// I ricordi del nonno: gli oggetti della storia che restano in tasca nella Valle (il nastro rosso, le chiavi, la
// lanterna, il mantello) si ripongono nella cassa del nonno, con una pagina che dà loro un senso secondo il finale,
// e restano nel salvataggio per la storia che verrà.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ugo', 'm');
  // si entra nella Valle (finale 3) con in tasca due ricordi e una cosa cattiva da buttare
  await page.evaluate(() => {
    addItem('nastro', 1);
    addItem('keyI', 1);
    addItem('bacche', 1);
    window.__fine = 0;
    freeStart(3)
      .catch(e => console.error('ricordi: ' + (e.stack || e)))
      .finally(() => (window.__fine = 1));
  });
  await skipScenes(page, { max: 200, until: () => window.__fine === 1 && !G.cut && !UI.busy() });
  const dopo = await page.evaluate(() => ({
    nastro: countItem('nastro'),
    keyI: countItem('keyI'),
    bacche: countItem('bacche')
  }));
  t.eq(
    'nella Valle i ricordi restano in tasca, le bacche no',
    JSON.stringify(dopo),
    '{"nastro":1,"keyI":1,"bacche":0}'
  );
  // la cassa del nonno li ripone, una pagina ciascuno
  const pagine = await page.evaluate(() => {
    window.__pagine = [];
    const paper = UI.paper.bind(UI);
    UI.paper = (html, b) => (window.__pagine.push(html), paper(html, b));
    const o = G.maps.house.objs.find(o => o.act === 'chest' || o.fid === 'cassa_nonno'); // nella Valle è un mobile come gli altri
    window.__fine = 0;
    Promise.resolve(ACT.chest(o)).finally(() => (window.__fine = 1));
    return true;
  });
  await skipScenes(page, { max: 60, until: () => window.__fine === 1 && !UI.busy() });
  await page.waitForTimeout(300);
  await skipScenes(page, { max: 60, until: () => !UI.busy() });
  const r = await page.evaluate(() => ({
    tasca: countItem('nastro') + countItem('keyI'),
    custoditi: ricordiCustoditi().sort().join(','),
    pagine: window.__pagine.length,
    patto: window.__pagine.some(h => h.includes('patto si è spezzato'))
  }));
  t.true('la cassa si apre', pagine);
  t.eq('i ricordi lasciano la tasca', r.tasca, 0);
  t.eq('e restano custoditi nel salvataggio', r.custoditi, 'keyI,nastro');
  t.eq('una pagina per ricordo', r.pagine, 2);
  t.true('la pagina del nastro racconta il finale vissuto (il patto spezzato)', r.patto);
  t.eq('ricordi: nessun errore', errors.join('\n'), '');
  await page.close();
};
