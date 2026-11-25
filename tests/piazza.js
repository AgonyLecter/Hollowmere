'use strict';
// 30. La piazza della Valle: niente più pietra del villaggio, le due bacheche nuove ai lati dell'ingresso (due
// caselle ciascuna), allori e fioriere, il selciato col rosone; il centro resta libero per il falò delle feste.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const st = G.st;
    st.free.debris['38,16'] = 'sasso'; // un sasso dove va una fioriera: deve lasciarle il posto
    rebuildMaps();
    const m = G.maps.main,
      k = kind => m.objs.filter(o => o.kind === kind);
    return {
      pietra: k('pietra').length,
      bacheca: m.objAt(40, 16) && m.objAt(40, 16) === m.objAt(41, 16) && m.objAt(40, 16).act === 'board',
      albo: !!k('albo')[0] && k('albo')[0].img === FREEIMG.pz_albo,
      allori: k('alloro').length,
      fioriere: k('fioriera').length,
      selciato: k('selciato').length,
      centro: !m.solid(44, 19) && !m.solid(45, 19) && !m.objAt(44, 19) && !m.objAt(45, 19),
      sasso: !st.free.debris['38,16']
    };
  });
  t.eq('in piazza non c’è più la pietra del villaggio', r.pietra, 0);
  t.true('la bacheca degli incarichi è nuova e larga due caselle', r.bacheca);
  t.true('l’albo della Valle ha il disegno nuovo', r.albo);
  t.eq('due allori all’ingresso dalla cappella', r.allori, 2);
  t.eq('quattro fioriere agli angoli', r.fioriere, 4);
  t.eq('il selciato col rosone', r.selciato, 1);
  t.true('il centro resta libero per il falò delle feste', r.centro);
  t.true('un sasso lascia il posto alla fioriera', r.sasso);
  t.eq('piazza: nessun errore', errors.join('\n'), '');
  await page.close();
};
