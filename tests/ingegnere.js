'use strict';
// 23. L'Ingegnere: arriva la mattina dopo il primo automatismo della serra e parcheggia il carro accanto alla
// piazza; la sua bottega vende la chiave e i congegni; con la chiave si monta un congegno sull'incrocio fra le
// zolle (senza toccarle) e lo si smonta; alle 7 gli irrigatori bagnano solo le zolle che coprono, dalle 8 il
// braccio manda il raccolto alla cassa collegata (anche quando non sei lì).
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    goMap('main', 12, 28, 0, true);
  });
  await page.waitForTimeout(800);
  // il primo automatismo della serra: arriva il giorno dopo
  const arrivo = await page.evaluate(() => {
    const st = G.st,
      S = guidesSeen(st);
    for (const g of GUIDES) S[g.id] = 1;
    st.money = 20000;
    st.free.built['20,24'] = { id: 'serra', lv: 1, auto: { irr: 1 } };
    Ext.run('automatismo', '20,24', 'irr');
    const domani = st.free.ing.arriva === st.day + 1;
    st.day++;
    Ext.run('freeMorning', st);
    const I = st.free.ing;
    rebuildMaps();
    G.map = G.maps.main;
    const carro = G.maps.main.objs.find(o => o.kind === 'carroIng');
    st.time = 9 * 60;
    snapNPCs();
    const n = G.npcs.find(x => x.id === 'ingegnere');
    // la sua giornata (la domenica mattina, come tutti, va a messa: qui si guarda quella di tutti i giorni)
    const s = SCHED.ingegnere(st),
      [px, py] = carroPorta(I);
    return {
      domani,
      qui: !!I.qui,
      carro: !!carro,
      davanti: !!s && s.x === px && s.y === py,
      nascosto: n.hidden
    };
  });
  t.true(
    'dopo il primo automatismo della serra l’Ingegnere arriva il giorno dopo',
    arrivo.domani && arrivo.qui
  );
  t.true('il suo carro-officina è accanto alla piazza', arrivo.carro);
  t.true('di giorno lui sta davanti al carro', arrivo.davanti);
  // la bottega
  await page.evaluate(() => ingBottega());
  for (const id of ['chiave', 'irr_auto', 'irr_auto2', 'braccio_auto']) {
    await page.click(`#mbox [data-b="${id}"]`);
    await page.waitForTimeout(100);
  }
  const comprati = await page.evaluate(() => {
    UI.close();
    return ['chiave', 'irr_auto', 'irr_auto2', 'braccio_auto'].every(i => countItem(i) === 1);
  });
  t.true('la bottega vende la chiave e i congegni', comprati);
  // un campo e una cassa
  await page.evaluate(() => {
    const st = G.st;
    st.time = 6 * 60 + 30;
    st.free.built['17,24'] = { id: 'cassa', inv: cassaVuota() };
    for (let y = 21; y < 27; y++)
      for (let x = 8; x < 15; x++)
        st.farm[x + ',' + y] = { w: false, c: { t: 'rapa', a: (x + y) % 2 ? 9 : 0, dry: 0 } };
    rebuildMaps();
    G.map = G.maps.main;
  });
  // con la chiave in mano, davanti a un incrocio: il menu, e si monta l'irrigatore grande
  const monta = async (tx, ty, dir, scelta) => {
    await page.evaluate(
      ([tx, ty, dir]) => {
        setPos(G.player, tx, ty, dir);
        G.st.sel = G.st.inv.findIndex(s => s && s.id === 'chiave');
        UI.hotbar();
      },
      [tx, ty, dir]
    );
    await page.waitForTimeout(150);
    await page.keyboard.press('Space');
    await page.waitForSelector('#dchoices > *', { timeout: 5000 });
    await page.waitForTimeout(250);
    await page.locator('#dchoices > *', { hasText: scelta }).first().click();
    await page.waitForTimeout(400);
  };
  await monta(11, 27, 3, 'Irrigatore interrato grande');
  await monta(13, 20, 0, 'Braccio raccoglitore');
  const montati = await page.evaluate(() => {
    const A = G.st.free.auto;
    return {
      irr: A['12,27'] && A['12,27'].t === 'irr2' && countItem('irr_auto2') === 0,
      br: A['14,21'] && A['14,21'].cassa === '17,24',
      zolle: Object.keys(G.st.farm).filter(k => !chiaveSerra(k)).length
    };
  });
  t.true('con la chiave si monta un irrigatore sull’incrocio', montati.irr);
  t.true('il braccio si collega da solo alla cassa più vicina', montati.br);
  t.eq('montare non toglie nessuna zolla', montati.zolle, 42);
  // alle 7 e alle 8, mentre sei altrove: in un colpo
  const lavoro = await page.evaluate(async () => {
    const st = G.st;
    await goMap('house', 5, 5, 0, true);
    st.time = 7 * 60 + 1;
    Ext.run('mpTick', 0.016);
    const dentro = (x, y) => x >= 10 && x <= 13 && y >= 25 && y <= 28;
    let giuste = 0,
      sbagliate = 0;
    for (const k in st.farm) {
      if (chiaveSerra(k)) continue; // le aiuole della serra le bagnano i suoi irrigatori
      const [x, y] = k.split(',').map(Number);
      if (st.farm[k].w) dentro(x, y) ? giuste++ : sbagliate++;
    }
    st.time = 8 * 60 + 1;
    Ext.run('mpTick', 0.016);
    const rape = (st.free.built['17,24'].inv.find(s => s && s.id === 'rapa') || { n: 0 }).n;
    let restano = 0;
    for (let y = 19; y <= 22; y++)
      for (let x = 12; x <= 15; x++) {
        const f = st.farm[x + ',' + y];
        if (f && f.c && cropStage(f.c) === 3) restano++;
      }
    await goMap('main', 12, 28, 0, true);
    return { giuste, sbagliate, rape, restano };
  });
  t.eq('alle 7 l’irrigatore grande bagna le sue 8 zolle', lavoro.giuste, 8);
  t.eq('e nessun’altra', lavoro.sbagliate, 0);
  t.true('dalle 8 il braccio manda il raccolto alla cassa', lavoro.rape > 0);
  t.eq('e nella sua area non resta niente di maturo', lavoro.restano, 0);
  // smontare: torna nello zaino
  await monta(11, 27, 3, 'Smonta');
  const smontato = await page.evaluate(() => !G.st.free.auto['12,27'] && countItem('irr_auto2') === 1);
  t.true('con la chiave si smonta, e torna nello zaino', smontato);
  t.eq('ingegnere: nessun errore', errors.join('\n'), '');
  await page.close();
};
