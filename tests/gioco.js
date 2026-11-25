'use strict';
// 32. Giocare davvero col compagno: lanci il gioco (resta tuo), il gatto ci salta sopra e lo prende a zampate tre
// volte, il cane lo rincorre e te lo riporta ai piedi; la cesta sta a terra e il compagno ci dorme sopra, visibile;
// se lo segui di qua e di là, ti viene dietro senza fermarsi e ripartire a ogni passo.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const adotta = kind =>
    page.evaluate(kind => {
      const st = G.st;
      st.time = 11 * 60;
      st.free.pet = {
        kind,
        skin: 0,
        name: kind === 'cane' ? 'Fido' : 'Ombra',
        love: 6,
        fame: 0,
        modo: 'segui',
        ciotola: 0,
        d: st.day,
        coccole: true
      };
      G.comp = null;
      G.map = G.maps.main;
      setPos(G.player, 20, 14, 2);
      for (let i = 0; i < 30; i++) compTick(0.05);
      return !!G.comp;
    }, kind);
  await adotta('gatto');
  const gatto = await page.evaluate(() => {
    const st = G.st,
      p = st.free.pet,
      c = G.comp,
      amore = p.love;
    st.inv[15] = { id: 'topolino', n: 1 };
    const ok = compLancia('topolino'),
      fasi = new Set();
    let giri = 0;
    for (let i = 0; i < 400 && c.gioco; i++) {
      fasi.add(c.gioco.fase);
      giri = c.gioco.giri;
      compTick(0.05);
    }
    return {
      ok,
      fasi: [...fasi].sort().join(','),
      giri,
      finito: !c.gioco,
      amore: p.love - amore,
      resta: countItem('topolino')
    };
  });
  t.true('il gatto: lanci il topolino', gatto.ok);
  t.true(
    'ci salta sopra e lo prende a zampate',
    /agguato/.test(gatto.fasi) && /salto/.test(gatto.fasi) && /rotola/.test(gatto.fasi)
  );
  t.true('poi si siede contento', gatto.finito);
  t.eq('e ti vuole un po’ più bene', gatto.amore, 1);
  t.eq('il topolino resta tuo', gatto.resta, 1);
  await adotta('cane');
  const cane = await page.evaluate(() => {
    const st = G.st,
      c = G.comp;
    st.inv[16] = { id: 'pallina', n: 1 };
    compLancia('pallina');
    const fasi = new Set();
    for (let i = 0; i < 400 && c.gioco; i++) {
      fasi.add(c.gioco.fase);
      compTick(0.05);
    }
    return { riporta: fasi.has('riporta'), vicino: Math.hypot(c.x - G.player.x, c.y - G.player.y) < 26 };
  });
  t.true('il cane rincorre la pallina e la prende in bocca', cane.riporta);
  t.true('e te la riporta ai piedi', cane.vicino);
  const cesta = await page.evaluate(() => {
    const st = G.st;
    st.free.inside['4,6'] = { id: 'cuccia' };
    rebuildMaps();
    const m = G.maps.house,
      o = m.objs.find(q => q.fid === 'cuccia'),
      [x, y] = compCuccia(m);
    return {
      piatta: o.sy < 0 && !m.solid(4, 6),
      sopra: x > o.dx && x < o.dx + iw(o.img) && y > o.dy && y < o.dy + ih(o.img) + 6
    };
  });
  t.true('la cesta sta a terra (il compagno ci dorme sopra e si vede)', cesta.piatta);
  t.true('e dorme proprio sul cuscino', cesta.sopra);
  const segue = await page.evaluate(() => {
    const c = G.comp;
    G.map = G.maps.main;
    setPos(G.player, 20, 14, 2);
    for (let i = 0; i < 40; i++) compTick(0.05);
    // passettini avanti e indietro: non deve fermarsi e ripartire ogni volta
    let cambi = 0,
      prima = c.st;
    for (let k = 0; k < 60; k++) {
      G.player.x += k % 20 < 10 ? 1.2 : -1.2;
      compTick(0.05);
      if (c.st !== prima) cambi++;
      prima = c.st;
    }
    return cambi;
  });
  t.true('con passettini avanti e indietro non scatta (al massimo un paio di cambi)', segue <= 4);
  t.eq('gioco: nessun errore', errors.join('\n'), '');
  await page.close();
};
