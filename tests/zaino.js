'use strict';
// 11. Lo zaino: tocca per scegliere e tocca dove spostare (la pila non lascia mai la sua casella finché non la
// sposti), doppio tocco per lo spostamento veloce, tieni premuto per metà pila (o per posarne una), la cassa,
// il cestino; tutto in una schermata senza scorrere; niente si perde chiudendo.
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
      zaino();
    });
  const slot = (w, i) => page.locator(`#mbox .islot[data-w="${w}"][data-i="${i}"]`);
  const inv = () => page.evaluate(() => G.st.inv.map(s => (s ? s.id + ':' + s.n : '')));
  await prepara();
  t.true(
    'tutto in una schermata: niente da scorrere',
    await page.evaluate(() => $('#mbox').scrollHeight <= $('#mbox').clientHeight + 2)
  );
  // tocca e sposta in un posto vuoto
  await slot('z', 2).click();
  await page.waitForTimeout(400);
  t.true(
    'toccando una pila la scegli, e resta al suo posto',
    await page.evaluate(() => ZSEL.w === 'z' && ZSEL.i === 2 && G.st.inv[2].id === 'pietra')
  );
  await slot('z', 5).click();
  await page.waitForTimeout(400);
  let I = await inv();
  t.true('e toccando un posto vuoto la sposti lì', I[5] === 'pietra:7' && I[2] === '');
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
  t.eq('tenendo premuto scegli metà pila (per eccesso)', await page.evaluate(() => ZSEL.n), 13);
  // con una pila scelta, tieni premuto su un altro posto: ne posi una
  await slot('z', 7).hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(200);
  I = await inv();
  t.eq('tenendo premuto su un altro posto ne posi una', [I[1], I[7]].join(' '), 'legna:24 legna:1');
  // e toccando un posto vuoto sposti il resto della metà scelta
  await slot('z', 8).click();
  await page.waitForTimeout(400);
  I = await inv();
  t.eq('la metà scelta va dove tocchi', [I[1], I[8]].join(' '), 'legna:12 legna:12');
  await page.evaluate(() => UI.close());
  I = await inv();
  t.eq('chiudendo non si perde niente', I.filter(Boolean).length, 5);
  // doppio tocco: dalla barra al resto dello zaino
  await prepara();
  await slot('z', 2).dblclick();
  await page.waitForTimeout(400);
  I = await inv();
  const dove = I.findIndex(x => x === 'pietra:7');
  t.true('doppio tocco: dalla barra al resto dello zaino', dove >= 10 && I[2] === '');
  // e indietro, unendosi a una pila uguale se c'è
  await slot('z', 12).dblclick();
  await page.waitForTimeout(400);
  I = await inv();
  t.eq('doppio tocco dallo zaino alla barra: si unisce alla pila uguale', I[1], 'legna:25');
  await page.evaluate(() => UI.close());
  // la cassa: doppio tocco tra zaino e cassa, sempre senza scorrere
  await page.evaluate(() => {
    G.st.free.built['10,10'] = { id: 'cassa', inv: Array(20).fill(null) };
    chestMenu('10,10');
  });
  await page.waitForTimeout(300);
  t.true(
    'cassa e zaino insieme, senza scorrere',
    await page.evaluate(() => $('#mbox').scrollHeight <= $('#mbox').clientHeight + 2)
  );
  await slot('z', 1).dblclick();
  await page.waitForTimeout(400);
  const cassa = await page.evaluate(() => G.st.free.built['10,10'].inv.map(s => (s ? s.id + ':' + s.n : '')));
  t.eq('doppio tocco: dallo zaino alla cassa', cassa[0], 'legna:25');
  // «Uguali»: nella cassa solo quello che c'è già
  await page.evaluate(() => {
    G.st.inv[20] = { id: 'legna', n: 3 };
    G.st.inv[21] = { id: 'fibra', n: 2 };
  });
  await page.locator('#mbox [data-z="uguali"]').click();
  await page.waitForTimeout(300);
  const ug = await page.evaluate(() => [
    countItem('legna'),
    countItem('fibra'),
    G.st.free.built['10,10'].inv[0].n
  ]);
  t.eq('«Uguali» porta in cassa solo le cose che ci sono già', ug.join('/'), '0/2/28');
  if (shot) {
    await slot('c', 0).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot });
    await slot('c', 0).click();
  }
  // il cestino
  const ip = await page.evaluate(() => G.st.inv.findIndex(s => s && s.id === 'pietra'));
  await slot('z', ip).click();
  await page.waitForTimeout(400);
  await page.locator('#mbox [data-trash]').click();
  await page.waitForTimeout(300);
  t.eq('il cestino butta quello che hai scelto', await page.evaluate(() => countItem('pietra')), 0);
  await page.evaluate(() => UI.close());
  // metà pila su un posto occupato da un'altra cosa: non si fa, e non si perde niente
  const pieno = await page.evaluate(() => {
    const st = G.st;
    st.inv = Array(30).fill(null);
    st.inv[0] = { id: 'legna', n: 10 };
    st.inv[1] = { id: 'pietra', n: 10 };
    zaino();
    zTocca('z', 0, true); // metà della legna
    zTocca('z', 1, false); // sulla pietra: no
    UI.close();
    const tot = id => G.st.inv.filter(s => s && s.id === id).reduce((a, s) => a + s.n, 0);
    return tot('legna') + '/' + tot('pietra') + '/' + G.st.inv[1].id;
  });
  t.eq('mezza pila su un posto occupato: niente si muove, niente si perde', pieno, '10/10/pietra');
  // un regalo (o un piatto) a zaino pieno non deve prendere il posto di niente
  const pieno2 = await page.evaluate(() => {
    const st = G.st;
    st.inv = Array(30)
      .fill(0)
      .map((_, i) => ({ id: i === 0 ? 'hoe' : 'legna', n: 1 }));
    for (let i = 1; i < 30; i++) st.inv[i] = { id: ['pietra', 'fibra', 'accetta', 'can'][i % 4] + '', n: 1 };
    st.mailbox = [];
    giveItem('pane');
    return { zappa: st.inv[0] && st.inv[0].id, posta: st.mailbox.map(m => m.item).join(',') };
  });
  t.eq('a zaino pieno la zappa resta al suo posto', pieno2.zappa, 'hoe');
  t.eq('e il regalo aspetta nella cassetta', pieno2.posta, 'pane');
  t.eq('zaino: nessun errore', errors.join('\n'), '');
  await page.close();
};
