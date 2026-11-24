'use strict';
// Il terreno rifatto a pezzi (un colpo di pala) deve essere svelto (prima ogni vialetto ridisegnava tutta la mappa
// e il gioco si fermava per quasi un secondo) e uguale a quello rifatto per intero: le foglie e il prato non devono
// cambiare altrove. Resta qualche pixel diverso di un'inezia (arrotondamenti del browser nelle trasparenze, che il
// filtro dello stile a volte porta al colore vicino della tavolozza): se ne tollera meno del 2% della zona ridipinta.
const { openGame, newGame } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ugo', 'm');
  await page.evaluate(() => goMap('main', 44, 20, 0, true));
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const m = G.maps.main,
      // tre caselle di prato lontane dai bordi: si fa un vialetto, poi lo si toglie
      prati = [];
    for (let y = 8; y < m.h - 8 && prati.length < 3; y += 7)
      for (let x = 8; x < m.w - 8 && prati.length < 3; x += 9) if (m.get(x, y) === 1) prati.push([x, y]);
    const tempi = [];
    for (const [x, y] of prati) {
      let t0 = performance.now();
      setGround(m, x, y, 2);
      tempi.push(performance.now() - t0);
    }
    const pezzi = m.ground.getContext('2d').getImageData(0, 0, m.ground.width, m.ground.height).data.slice();
    let t0 = performance.now();
    buildGround(m);
    seasonGround(m);
    const intero = performance.now() - t0,
      tutto = m.ground.getContext('2d').getImageData(0, 0, m.ground.width, m.ground.height).data;
    // pixel diversi (oltre un'inezia di arrotondamento)
    let diversi = 0;
    for (let i = 0; i < tutto.length; i += 4)
      if (
        Math.abs(tutto[i] - pezzi[i]) > 6 ||
        Math.abs(tutto[i + 1] - pezzi[i + 1]) > 6 ||
        Math.abs(tutto[i + 2] - pezzi[i + 2]) > 6 ||
        Math.abs(tutto[i + 3] - pezzi[i + 3]) > 6
      )
        diversi++;
    for (const [x, y] of prati) setGround(m, x, y, 1);
    // fuori dalle zone ridipinte non deve cambiare niente
    const W = m.ground.width,
      T = 16 * (m.ground.s || 1);
    let fuori = 0;
    for (let i = 0; i < tutto.length; i += 4) {
      const px = (i / 4) % W,
        py = Math.floor(i / 4 / W),
        dentro = prati.some(
          ([x, y]) => Math.abs(Math.floor(px / T) - x) <= 1 && Math.abs(Math.floor(py / T) - y) <= 1
        );
      if (
        !dentro &&
        (tutto[i] !== pezzi[i] || tutto[i + 1] !== pezzi[i + 1] || tutto[i + 2] !== pezzi[i + 2])
      )
        fuori++;
    }
    return {
      n: prati.length,
      piu: Math.max(...tempi),
      intero,
      diversi,
      fuori,
      zona: prati.length * 9 * T * T
    };
  });
  t.eq('ci sono tre caselle di prato su cui provare', r.n, 3);
  t.true(
    `un vialetto ridipinge solo lì attorno: ${r.piu.toFixed(0)} ms contro ${r.intero.toFixed(0)} ms di tutta la mappa`,
    r.piu < Math.max(60, r.intero / 4)
  );
  t.eq('fuori dalla zona del vialetto il terreno non cambia', r.fuori, 0);
  t.true(
    `dentro la zona è uguale a quello rifatto da capo (${r.diversi} pixel diversi su ${r.zona})`,
    r.diversi < r.zona * 0.02
  );
  t.eq('terreno: nessun errore', errors.join('\n'), '');
  await page.close();
};
