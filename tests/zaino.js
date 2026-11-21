'use strict';
// 11. Lo zaino stile Minecraft: tocca per prendere e posare, doppio tocco per spostare veloce, tieni premuto
// per dividere (o posarne uno), la cassa, il cestino, e niente si perde chiudendo con qualcosa in mano.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser, shot }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const prepara = () =>
    page.evaluate(() => {
      const st = G.st;
      st.inv = Array(30).fill(null);
      st.sel = 0;
      st.inv[0] = { id: 'hoe', n: 1 };
      st.inv[1] = { id: 'legna', n: 20 };
      st.inv[2] = { id: 'pietra', n: 7 };
      st.inv[12] = { id: 'legna', n: 5 };
      ZPICK = null;
      zaino();
    });
  const slot = (w, i) => page.locator(`#mbox .islot[data-w="${w}"][data-i="${i}"]`);
  const inv = () => page.evaluate(() => G.st.inv.map(s => (s ? s.id + ':' + s.n : '')));
  await prepara();
  t.true(
    'la barra è staccata in basso',
    await page.evaluate(() => !!document.querySelector('#mbox .ibarra'))
  );
  // tocca e posa in un posto vuoto
  await slot('z', 2).click();
  await page.waitForTimeout(400);
  t.true('toccando una pila la prendi in mano', await page.evaluate(() => ZH.s && ZH.s.id === 'pietra'));
  await slot('z', 5).click();
  await page.waitForTimeout(400);
  let I = await inv();
  t.true('e toccando un posto vuoto la posi', I[5] === 'pietra:7' && I[2] === '');
  // uguali si uniscono
  await slot('z', 12).click();
  await page.waitForTimeout(400);
  await slot('z', 1).click();
  await page.waitForTimeout(400);
  I = await inv();
  t.true('due pile uguali si uniscono', I[1] === 'legna:25' && I[12] === '');
  // tieni premuto: metà pila
  await slot('z', 1).hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(200);
  const meta = await page.evaluate(() => [ZH.s && ZH.s.n, G.st.inv[1].n]);
  t.eq('tenendo premuto prendi metà pila (per eccesso)', meta.join('/'), '13/12');
  // con qualcosa in mano, tieni premuto per posarne uno
  await slot('z', 7).hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(200);
  const uno = await page.evaluate(() => [ZH.s && ZH.s.n, G.st.inv[7] && G.st.inv[7].n]);
  t.eq('con la pila in mano, tenendo premuto ne posi uno', uno.join('/'), '12/1');
  // chiudendo con qualcosa in mano non si perde niente
  await page.evaluate(() => UI.close());
  I = await inv();
  t.eq('chiudendo, quello in mano torna nello zaino', I[1], 'legna:24');
  // doppio tocco: dalla barra al resto dello zaino
  await prepara();
  await slot('z', 2).dblclick();
  await page.waitForTimeout(400);
  I = await inv();
  const dove = I.findIndex(x => x === 'pietra:7');
  t.true('doppio tocco: dalla barra al resto dello zaino', dove >= 10 && I[2] === '');
  t.true('e niente resta in mano', await page.evaluate(() => !ZH.s));
  // e indietro, unendosi a una pila uguale se c'è
  await slot('z', 12).dblclick();
  await page.waitForTimeout(400);
  I = await inv();
  t.eq('doppio tocco dallo zaino alla barra: si unisce alla pila uguale', I[1], 'legna:25');
  await page.evaluate(() => UI.close());
  // la cassa: doppio tocco tra zaino e cassa
  await page.evaluate(() => {
    G.st.free.built['10,10'] = { id: 'cassa', inv: Array(20).fill(null) };
    chestMenu('10,10');
  });
  await page.waitForTimeout(300);
  await slot('z', 1).dblclick();
  await page.waitForTimeout(400);
  const cassa = await page.evaluate(() => G.st.free.built['10,10'].inv.map(s => (s ? s.id + ':' + s.n : '')));
  t.eq('doppio tocco: dallo zaino alla cassa', cassa[0], 'legna:25');
  if (shot) {
    await slot('c', 0).click();
    await page.waitForTimeout(300);
    await page.evaluate(() => (document.querySelector('#mbox').scrollTop = 0));
    await page.screenshot({ path: shot });
    await slot('c', 0).click();
  }
  // il cestino
  const ip = await page.evaluate(() => G.st.inv.findIndex(s => s && s.id === 'pietra'));
  await slot('z', ip).click();
  await page.waitForTimeout(400);
  await page.locator('#mbox [data-trash]').click();
  await page.waitForTimeout(300);
  t.eq('il cestino butta quello che hai in mano', await page.evaluate(() => countItem('pietra')), 0);
  await page.evaluate(() => UI.close());
  // zaino pieno: lo scambio che farebbe perdere qualcosa non si fa
  const pieno = await page.evaluate(() => {
    const st = G.st;
    st.inv = Array(30)
      .fill(0)
      .map((_, i) => ({ id: i === 0 ? 'legna' : i === 1 ? 'pietra' : 'fibra', n: i < 2 ? 10 : 1 }));
    for (let i = 2; i < 30; i++) st.inv[i] = { id: ['hoe', 'accetta', 'piccone', 'can'][i % 4], n: 1 };
    zaino();
    zTocca('z', 0, true); // metà legna in mano, il resto rimane
    zTocca('z', 1, false); // scambio con la pietra: dopo non ci sarebbe posto per la pietra
    const fermo = ZH.s && ZH.s.id === 'legna';
    UI.close();
    const tot = id => G.st.inv.filter(s => s && s.id === id).reduce((a, s) => a + s.n, 0);
    return { fermo, legna: tot('legna'), pietra: tot('pietra') };
  });
  t.true('zaino pieno: lo scambio che farebbe perdere qualcosa non si fa', pieno.fermo);
  t.eq('e non si perde niente', pieno.legna + '/' + pieno.pietra, '10/10');
  t.eq('zaino: nessun errore', errors.join('\n'), '');
  await page.close();
};
