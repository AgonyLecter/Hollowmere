'use strict';
// 7. Aggiornamento automatico: quando sul sito esce una versione nuova (sw.js cambia), il gioco aspetta un
// momento tranquillo, salva, si ricarica e rimette il giocatore nella partita senza passare dal menu.
const { openGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  let versione = 'vecchia';
  await page.route('**/sw.js*', r =>
    r.fulfill({ status: 200, contentType: 'text/javascript', body: `const CACHE='${versione}';` })
  );
  await page.evaluate(() => sessionStorage.setItem('__keep', '1')); // i salvataggi restano dopo il ricaricamento
  await page.evaluate(() => {
    G.st = newState('Upd', 'f');
    freeStart(3);
  });
  await skipScenes(page, { max: 80, until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    goMap('main', 44, 20, 0, true);
    G.st.money = 4321;
    NET.save(G.st);
  });
  await page.evaluate(() => updCheck()); // prima firma: la versione in uso
  versione = 'nuova';
  await page.evaluate(() => updCheck());
  t.true('una versione nuova sul sito viene notata', await page.evaluate(() => UPD.pending));
  // si ricarica e torna in partita da solo
  let dentro = null;
  for (let i = 0; i < 30 && !dentro; i++) {
    await page.waitForTimeout(1000);
    dentro = await page
      .evaluate(() =>
        G.mode === 'game' && G.st && G.st.name === 'Upd' && !UPD.pending
          ? { soldi: G.st.money, mappa: G.map && G.map.id }
          : null
      )
      .catch(() => null);
  }
  t.true("dopo l'aggiornamento si è di nuovo in partita, senza menu", !!dentro);
  t.eq(
    'la partita ripresa è la stessa (soldi e posto)',
    dentro && dentro.soldi + '/' + dentro.mappa,
    '4321/main'
  );
  t.eq('aggiornamento: nessun errore', errors.join('\n'), '');
  await page.close();
};
