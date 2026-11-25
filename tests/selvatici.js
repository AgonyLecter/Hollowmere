'use strict';
// 28. Le erbe spontanee: d'inverno nascono davvero (agrifoglio, radice d'inverno, vischio…), quelle di un'altra
// stagione appassiscono e non occupano i posti delle nuove, e ognuna ha la sua stellina che luccica.
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
      W = st.free;
    while (seasonOf(st) !== 1) st.day++;
    // l'autunno ha lasciato a terra tanti funghi mai raccolti
    for (let i = 0; i < 12; i++) W.debris[fkey(10 + i, 36)] = 'w_funghi';
    const tipi = {};
    for (let d = 0; d < 20; d++) {
      st.day++;
      wildMorning(st);
      for (const [k, v] of Object.entries(W.debris))
        if (v.startsWith('w_')) {
          tipi[v.slice(2)] = (tipi[v.slice(2)] || 0) + 1;
          if (d % 2) delete W.debris[k]; // un giorno sì e uno no il giocatore passa e raccoglie
        }
    }
    return {
      funghi: Object.values(W.debris).filter(v => v === 'w_funghi').length,
      tipi
    };
  });
  t.eq('i funghi dell’autunno, d’inverno, appassiscono', r.funghi, 0);
  t.true('d’inverno nasce l’agrifoglio', (r.tipi.agrifoglio || 0) >= 5);
  t.true('d’inverno nasce la radice d’inverno', (r.tipi.radice || 0) >= 5);
  t.true('d’inverno nasce il vischio', (r.tipi.vischio || 0) >= 5);
  const aiuto = await page.evaluate(() => {
    const st = G.st,
      R = {};
    R.dove = doveTesto('agrifoglio');
    R.html = doveMat('oro', 5);
    AIUTO_DOVE.on = false;
    R.spento = doveMat('oro', 5);
    AIUTO_DOVE.on = true;
    const a0 =
      countItem('agrifoglio') +
      (st.mailbox || []).filter(m => m.item === 'agrifoglio').reduce((x, m) => x + m.n, 0);
    delete st.flags.scuseSelvatici;
    Ext.run('partitaCaricata', st);
    Ext.run('partitaCaricata', st);
    R.dono =
      countItem('agrifoglio') +
      (st.mailbox || []).filter(m => m.item === 'agrifoglio').reduce((x, m) => x + m.n, 0) -
      a0;
    return R;
  });
  t.true('l’aiuto dice dove si trova l’agrifoglio (d’inverno)', /inverno/.test(aiuto.dove));
  t.true('e dove si trova l’oro che manca', /miniera/.test(aiuto.html) && /Brom/.test(aiuto.html));
  t.eq('spento nelle Opzioni, l’aiuto tace', aiuto.spento, '');
  t.eq('il dono di scuse arriva una volta sola: 20 agrifogli', aiuto.dono, 20);
  t.eq('selvatici: nessun errore', errors.join('\n'), '');
  await page.close();
};
