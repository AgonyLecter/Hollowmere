'use strict';
// 15. I gesti: l'effetto dei colpi parte all'impatto (non quando premi), l'albero abbattuto cade e lascia il
// ceppo, la roccia si spacca in pezzi, ogni terreno ha il suo passo.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    for (const g of GUIDES) guideSeen(G.st, g);
    G.st.energy = 100;
    const m = G.maps.main;
    G.map = m;
    const albero = m.objs.find(o => o.kind === 'tree' && !m.solid(o.tx - 1, o.ty));
    window.__a = [albero.tx, albero.ty];
    setPos(G.player, albero.tx - 1, albero.ty, 2);
    G.player.dir = DIRV.findIndex(v => v[0] > 0 && v[1] === 0);
    G.st.sel = G.st.inv.findIndex(s => s && s.id === 'accetta');
  });
  // un colpo: subito niente schegge, all'impatto sì
  const colpo = await page.evaluate(async () => {
    const n0 = GESTI.pezzi.length;
    doAction();
    const subito = GESTI.pezzi.length - n0;
    await new Promise(r => setTimeout(r, 450));
    return { subito, dopo: GESTI.pezzi.length - n0 };
  });
  t.eq('premendo, le schegge non partono subito', colpo.subito, 0);
  t.true('partono all’impatto', colpo.dopo > 0);
  // i colpi fino in fondo: l'albero cade, poi resta il ceppo
  const caduta = await page.evaluate(async () => {
    for (
      let i = 0;
      i < 6 && G.maps.main.objs.some(o => o.kind === 'tree' && o.tx === __a[0] && o.ty === __a[1]);
      i++
    ) {
      doAction();
      await new Promise(r => setTimeout(r, 420));
    }
    const cade = GESTI.cadute.length;
    await new Promise(r => setTimeout(r, 1800));
    return {
      cade,
      finita: GESTI.cadute.length,
      ceppo: G.maps.main.objs.some(o => o.kind === 'ceppo' && o.tx === __a[0] && o.ty === __a[1])
    };
  });
  t.true('l’albero abbattuto cade', caduta.cade >= 1);
  t.eq('e poi la caduta finisce', caduta.finita, 0);
  t.true('resta il ceppo', caduta.ceppo);
  // la roccia: resta visibile fino all'impatto, poi pezzi
  const roccia = await page.evaluate(async () => {
    const m = G.maps.main,
      r = m.objs.find(o => o.kind === 'rock' && !m.solid(o.tx - 1, o.ty));
    if (!r) return null;
    setPos(G.player, r.tx - 1, r.ty, 2);
    G.player.dir = DIRV.findIndex(v => v[0] > 0 && v[1] === 0);
    G.st.sel = G.st.inv.findIndex(s => s && s.id === 'piccone');
    let resti = 0;
    for (let i = 0; i < 4 && m.objs.includes(r); i++) {
      doAction();
      resti = Math.max(resti, GESTI.resti.length);
      await new Promise(r => setTimeout(r, 420));
    }
    return { tolta: !m.objs.includes(r), resti, pezzi: GESTI.pezzi.length };
  });
  if (roccia) {
    t.true('la roccia si toglie', roccia.tolta);
    t.true('ma il suo disegno resta fino all’impatto', roccia.resti >= 1);
    t.true('e all’impatto si spacca in pezzi', roccia.pezzi > 0);
  }
  // i passi
  const passi = await page.evaluate(() => {
    const m = G.maps.main;
    return [1, 2, 4, 7].map(g => suonoPasso(m, g)).join(',');
  });
  t.eq(
    'ogni terreno ha il suo passo (erba, ghiaia, legno, pietra)',
    passi,
    'passoErba,passoGhiaia,passoLegno,passoPietra'
  );
  t.eq('gesti: nessun errore', errors.join('\n'), '');
  await page.close();
};
