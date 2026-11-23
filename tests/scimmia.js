'use strict';
// 13. La scimmia: nella Valle si fanno per giorni azioni a caso (attrezzi, oggetti, zaino, banco, cucina,
// macchine, dormire) e dopo ogni gruppo si controllano le regole che non devono mai rompersi.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser, { seed: 777 });
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    for (const g of GUIDES) guideSeen(G.st, g);
    for (const [id, n] of [
      ['legna', 200],
      ['pietra', 200],
      ['fibra', 80],
      ['ferro', 40],
      ['lingotto', 20],
      ['s_rapa', 20],
      ['s_patata', 10],
      ['uovo', 10],
      ['latte', 5],
      ['patata', 10],
      ['falce', 1]
    ])
      addItem(id, n);
    G.st.money = 20000;
  });
  const regole = () =>
    page.evaluate(() => {
      const st = G.st,
        P = [];
      if (!Array.isArray(st.inv) || st.inv.length < 30) P.push('zaino corto: ' + (st.inv && st.inv.length));
      st.inv.forEach((s, i) => {
        if (s && (!ITEMS[s.id] || !Number.isInteger(s.n) || s.n <= 0))
          P.push('casella ' + i + ' non valida: ' + JSON.stringify(s));
      });
      if (!Number.isFinite(st.money) || st.money < 0) P.push('scudi: ' + st.money);
      if (!Number.isFinite(st.energy)) P.push('energia: ' + st.energy);
      if (!Number.isFinite(st.time) || !Number.isFinite(st.day))
        P.push('ora/giorno: ' + st.time + '/' + st.day);
      for (const [k, b] of Object.entries(st.free.built))
        if (b.inv)
          b.inv.forEach((s, i) => {
            if (s && (!ITEMS[s.id] || !Number.isInteger(s.n) || s.n <= 0))
              P.push('cassa ' + k + ' casella ' + i + ': ' + JSON.stringify(s));
          });
      return P;
    });
  const problemi = new Set();
  // i campi arati si contano lungo tutta la partita: la scimmia poi ci posa sopra di tutto, a caso
  let campi = 0;
  for (let giro = 0; giro < 24; giro++) {
    await page.evaluate(giro => {
      const st = G.st,
        m = G.maps.main,
        R = Math.random;
      const pick = A => A[Math.floor(R() * A.length)];
      for (let a = 0; a < 25; a++) {
        if (G.cut || UI.busy() || G.mode !== 'game') {
          if (UI.modalOpen) UI.close();
          continue;
        }
        G.map = m;
        const r = R();
        try {
          if (r < 0.55) {
            // un attrezzo o un oggetto a caso, su una casella a caso vicino a casa
            let x, y;
            for (let k = 0; k < 20; k++) {
              x = 8 + Math.floor(R() * 40);
              y = 8 + Math.floor(R() * 30);
              if (!m.solid(x, y)) break;
            }
            setPos(G.player, x, y, Math.floor(R() * 4));
            const piene = st.inv.map((s, i) => (s ? i : -1)).filter(i => i >= 0);
            st.sel = pick(piene);
            doAction();
          } else if (r < 0.65) {
            zaino();
            const L = [...document.querySelectorAll('#mbox .islot[data-w]')];
            for (let k = 0; k < 4 && L.length; k++) {
              const el = pick(L);
              zTocca(el.dataset.w, +el.dataset.i, R() < 0.3);
            }
            UI.close();
          } else if (r < 0.75) {
            craftMenu(null, 'banco');
            const B = [...document.querySelectorAll('#mbox [data-r]:not([disabled])')];
            if (B.length) pick(B).click();
            if (UI.modalOpen) UI.close();
          } else if (r < 0.82) {
            cookModal();
            const B = [
              ...document.querySelectorAll(
                '#mbox [data-c]:not([disabled]), #mbox button.btn:not([data-close])'
              )
            ];
            if (B.length) pick(B).click();
            if (UI.modalOpen) UI.close();
          } else if (r < 0.9) {
            const mac = Object.entries(st.free.built).filter(([, b]) => MACH[b.id] || b.id === 'cassa');
            if (mac.length) {
              const [k, b] = pick(mac);
              if (b.id === 'cassa') chestMenu(k);
              else macGui(k, b);
              const L = [...document.querySelectorAll('#mbox .islot[data-w], #mbox .mslot')];
              for (let q = 0; q < 3 && L.length; q++) pick(L).click();
              if (UI.modalOpen) UI.close();
            }
          } else st.time = Math.min(st.time + 30 + Math.floor(R() * 90), 25 * 60);
        } catch (e) {
          console.error('scimmia ' + giro + ': ' + (e.stack || e));
        }
      }
    }, giro);
    await skipScenes(page, { max: 40 });
    for (const p of await regole()) problemi.add(p);
    campi = Math.max(campi, await page.evaluate(() => Object.keys(G.st.farm).length));
    // ogni quattro giri si dorme
    if (giro % 4 === 3) {
      await page.evaluate(() => {
        if (UI.modalOpen) UI.close();
        endDay(true, true);
      });
      await page.waitForTimeout(800);
      await skipScenes(page, { max: 60 });
    }
  }
  const fatto = await page.evaluate(() => ({
    giorni: G.st.day - G.st.free.start,
    costruiti: G.st.flags.crafted || 0,
    cucinati: G.st.flags.cooked || 0,
    campi: 0,
    energia: G.st.energy
  }));
  fatto.campi = campi;
  console.log('    (la scimmia ha fatto: ' + JSON.stringify(fatto) + ')');
  t.true(
    'la scimmia ha davvero giocato (giorni, costruzioni, campi)',
    fatto.giorni >= 5 && fatto.costruiti > 0 && fatto.campi > 0
  );
  t.eq('la scimmia: regole sempre rispettate', [...problemi].join('\n'), '');
  t.eq('la scimmia: nessun errore', errors.join('\n'), '');
  await page.close();
};
