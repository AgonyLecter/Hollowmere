'use strict';
// 22. La serra: dentro si zappa (risponde), si semina fuori stagione, si annaffia e si raccoglie col tasto
// azione; da ospite col permesso si semina nella serra dell'amico; gli irrigatori bagnano tutte le aiuole alle 7
// e il braccio a carrucola posa le piante mature nella cassa della serra dalle 8 (anche quando non sei lì);
// la cassa di una serra tolta finisce nella cassetta delle spedizioni.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    goMap('main', 14, 20, 0, true);
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const st = G.st;
    st.time = 6 * 60 + 10;
    st.free.built['20,24'] = { id: 'serra', lv: 1 };
    rebuildMaps();
    G.map = G.maps.main;
    if (G.tour) tourEnd();
    serraEntra('20,24');
  });
  await page.waitForFunction(() => G.map && G.map.id === 'serra' && !G.cut, null, { timeout: 10000 });
  // il tasto azione davanti all'aiuola, con la zappa, un seme fuori stagione e l'annaffiatoio
  const lavoro = await page.evaluate(() => {
    const st = G.st,
      seme = Object.keys(ITEMS).find(k => ITEMS[k].t === 'seed' && !cropInSeason(ITEMS[k].crop, seasonOf())),
      fk = G.map.ox + 3 + ',4',
      prendi = id => {
        if (!st.inv.some(s => s && s.id === id)) addItem(id, id === seme ? 2 : 1);
        st.sel = st.inv.findIndex(s => s && s.id === id);
      },
      azione = () => {
        G.toolA = null;
        doAction();
      },
      toasts = () => [...document.querySelectorAll('.toast')].map(e => e.textContent).join(' | ');
    document.querySelectorAll('.toast').forEach(e => e.remove());
    setPos(G.player, 3, 5, 3);
    prendi('hoe');
    azione();
    const zappa = toasts();
    prendi(seme);
    azione();
    const seminata = !!(st.farm[fk].c && st.farm[fk].c.t === ITEMS[seme].crop);
    prendi('can');
    azione();
    const bagnata = st.farm[fk].w;
    // matura: si raccoglie col tasto azione e finisce nello zaino
    st.farm[fk].c.a = CROPS[st.farm[fk].c.t].days;
    const prima = st.inv.reduce((n, s) => n + (s && s.id === st.farm[fk].c.t ? s.n : 0), 0),
      t2 = st.farm[fk].c.t;
    st.sel = st.inv.findIndex(s => !s);
    azione();
    const dopo = st.inv.reduce((n, s) => n + (s && s.id === t2 ? s.n : 0), 0);
    // sul pavimento, coi semi: si spiega dove si coltiva
    document.querySelectorAll('.toast').forEach(e => e.remove());
    setPos(G.player, 7, 6, 1);
    prendi(seme);
    azione();
    return { zappa, seminata, bagnata, raccolto: dopo > prima, pavimento: toasts() };
  });
  t.true('nella serra la zappa risponde (l’aiuola è già dissodata)', /già dissodata/.test(lavoro.zappa));
  t.true('nella serra si semina anche fuori stagione', lavoro.seminata);
  t.true('nella serra si annaffia', lavoro.bagnata);
  t.true('nella serra si raccoglie col tasto azione', lavoro.raccolto);
  t.true('sul pavimento coi semi il gioco dice dove si coltiva', /aiuole/.test(lavoro.pavimento));
  // ospite col permesso di aiutare: semina nella serra dell'amico
  const ospite = await page.evaluate(() => {
    const st = G.st,
      fk = G.map.ox + 4 + ',4',
      v = { pid: 'amico', name: 'Bea', coop: true, watered: 0 };
    G.home = JSON.parse(JSON.stringify(st));
    G.visit = v;
    addItem('s_rapa', 1);
    st.sel = st.inv.findIndex(s => s && s.id === 's_rapa');
    setPos(G.player, 4, 5, 3);
    G.toolA = null;
    doAction();
    G.visit = null;
    G.home = null;
    return !!(st.farm[fk] && st.farm[fk].c);
  });
  t.true('da ospite col permesso si semina nella serra dell’amico', ospite);
  // gli automatismi, fuori dalla serra: alle 7 bagnano, dalle 8 raccolgono nella cassa
  const auto = await page.evaluate(async () => {
    const st = G.st,
      k = '20,24',
      b = st.free.built[k];
    b.auto = { irr: 1, gru: 1 };
    await goMap('main', 20, 26, 0, true);
    const zolle = serraZolleK(b);
    zolle.forEach(
      (fk, i) => (st.farm[fk] = { w: false, c: { t: 'rapa', a: i % 2 ? CROPS.rapa.days : 0, dry: 0 } })
    );
    st.day++;
    st.time = 7 * 60 + 1;
    Ext.run('mpTick', 0.016);
    const bagnate = zolle.filter(fk => st.farm[fk].w).length,
      primaDelle8 = mature(st, b).length;
    st.time = 8 * 60 + 1;
    Ext.run('mpTick', 0.016);
    const cassa = st.free.built[cassaSerraK(b)],
      rape = (cassa && cassa.inv.find(s => s && s.id === 'rapa')) || { n: 0 };
    return {
      bagnate,
      tutte: zolle.length,
      primaDelle8,
      dopo: mature(st, b).length,
      rape: rape.n,
      ck: cassaSerraK(b)
    };
  });
  t.eq('alle 7 gli irrigatori bagnano tutte le zolle', auto.bagnate, auto.tutte);
  t.true('prima delle 8 le piante mature restano', auto.primaDelle8 > 0);
  t.eq('dalle 8 il braccio le raccoglie tutte', auto.dopo, 0);
  t.true('e le posa nella cassa della serra', auto.rape >= auto.primaDelle8);
  // la cassa della serra si apre come le altre
  const apre = await page.evaluate(ck => {
    zaino(ck);
    const ok = !!document.querySelector('#mbox .izaino') && ZCH === ck;
    UI.close();
    return ok;
  }, auto.ck);
  t.true('la cassa della serra si apre come le altre casse', apre);
  // tolta la serra, il contenuto della sua cassa finisce nella cassetta delle spedizioni
  const tolta = await page.evaluate(ck => {
    const st = G.st,
      n = st.free.built[ck].inv.reduce((a, s) => a + (s ? s.n : 0), 0);
    delete st.free.built['20,24'];
    st.mailbox = [];
    Ext.run('freeMorning', st);
    return { via: !st.free.built[ck], posta: st.mailbox.reduce((a, m) => a + m.n, 0) === n && n > 0 };
  }, auto.ck);
  t.true('tolta la serra, la sua cassa sparisce', tolta.via);
  t.true('e il contenuto arriva nella cassetta delle spedizioni', tolta.posta);
  t.eq('serra: nessun errore', errors.join('\n'), '');
  await page.close();
};
