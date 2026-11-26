'use strict';
// 25. Allevamento e casa: più specie nella stessa casa danno tutti i loro prodotti, «Prendi tutto», le pecore
// danno lana e latte, il colorante tinge la pecora e la sua lana; la lana colorata al telaio dà colori e lo
// scialle; finita la storia i mobili del nonno si spostano, il letto decide dove ci si sveglia e si rifà con la lana.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    const S = guidesSeen(G.st);
    for (const g of GUIDES) S[g.id] = 1;
    window.__vuoi = [];
    window.__auto = setInterval(() => {
      if (!UI.dlgOpen) return;
      if (UI._typ) return UI.finishType();
      const B = [...document.querySelectorAll('#dchoices button')];
      if (B.length) (B.find(x => window.__vuoi.some(v => x.textContent.includes(v))) || B[0]).click();
      else UI.advance();
    }, 60);
  });

  // ---------- più specie, tutti i prodotti ----------
  const stalle = await page.evaluate(async () => {
    const st = G.st;
    st.time = 10 * 60;
    st.weather = 'sereno';
    st.free.built['20,30'] = { id: 'pollaio', lv: 1 };
    st.free.built['26,30'] = { id: 'ovile', lv: 1 };
    st.free.animals = [
      { kind: 'gallina', name: 'Pina', home: '20,30', love: 9, pet: true },
      { kind: 'anatra', name: 'Gigia', home: '20,30', love: 9, pet: true },
      { kind: 'pecora', name: 'Fiocco', home: '26,30', love: 9, pet: true },
      { kind: 'pecora', name: 'Lola', home: '26,30', love: 9, pet: true }
    ];
    rebuildMaps();
    G.map = G.maps.main;
    goMap('main', 27, 34, 3, true);
    spawnFarmAnimals();
    await sleep(200);
    // il colorante sulla pecora al pascolo
    giveItem('colorante_blu', 1);
    const e = G.fanimals.find(e => e.a.name === 'Fiocco');
    e.dentro = false;
    e.x = 27 * 16 + 8;
    e.y = 33 * 16 + 10;
    setPos(G.player, 27, 34, 3);
    const C = [];
    Ext.run('mira', C, G.player.x, G.player.y - 14, G.map);
    const sc = C.find(c => c.k === 'ext');
    const fum = sc && sc.fumetto().t;
    if (sc) sc.act();
    const tinto = !!Ext.intercetta('pelo', e.a, animalImg('pecora', false, 0), false);
    for (let i = 0; i < 10; i++) {
      for (const a of st.free.animals) a.pet = true;
      animalsMorning(st);
    }
    const P = { ...st.free.built['20,30'].dentro },
      O = { ...st.free.built['26,30'].dentro };
    barnMenu('20,30');
    await sleep(100);
    const pile = document.querySelectorAll('#mbox .stl-pila').length;
    document.querySelector('#mbox [data-tutto]').click();
    await sleep(100);
    const vuoto = !Object.keys(st.free.built['20,30'].dentro).length;
    UI.close();
    return {
      fum,
      colore: e.a.colore,
      tinto,
      P,
      O,
      pile,
      vuoto,
      uova: countItem('uovo'),
      anatra: countItem('uovo_anatra')
    };
  });
  t.true(
    'gallina e anatra nello stesso pollaio: uova e uova d’anatra',
    stalle.P.uovo > 0 && stalle.P.uovo_anatra > 0
  );
  t.true(
    'la schermata mostra una pila per ogni prodotto e «Prendi tutto» li prende tutti',
    stalle.pile === 2 && stalle.vuoto && stalle.uova > 0 && stalle.anatra > 0
  );
  t.true(
    'col colorante in mano, davanti a una pecora: «Tingi di blu»',
    stalle.fum === 'Tingi di blu' && stalle.colore === 'blu'
  );
  t.true('la pecora tinta si disegna del suo colore', stalle.tinto);
  t.true(
    'la pecora tinta dà lana blu, l’altra lana bianca, e tutte e due il latte',
    stalle.O.lana_blu > 0 && stalle.O.lana > 0 && stalle.O.latte_pecora > 0
  );

  // ---------- il telaio con la lana ----------
  const telaio = await page.evaluate(async () => {
    const st = G.st;
    giveItem('lana_blu', 2);
    giveItem('lana', 3);
    window.__vuoi = [];
    telaioMenu();
    await sleep(100);
    document.querySelector('#mbox [data-tl="l_blu"]').click();
    await sleep(100);
    document.querySelector('#mbox [data-tl="acc:scialle"]').click();
    await sleep(100);
    UI.close();
    const O = avOwn(st);
    st.avatar = Object.assign(avOf(st), { shawl: 'l_blu', calze: 'l_blu' });
    const L = avLook(st.g, avOf(st));
    return {
      col: !!O.col.l_blu,
      scialle: !!O.acc.scialle,
      shawl: L.shawl,
      calze: L.calze,
      resto: countItem('lana_blu')
    };
  });
  t.true('al telaio la lana blu diventa il colore «Lana blu»', telaio.col && telaio.resto === 0);
  t.true(
    'con la lana si lavora lo scialle, e si indossa del colore scelto (anche le calze)',
    telaio.scialle && telaio.shawl === '#3456b8' && telaio.calze === '#3456b8'
  );

  // ---------- la casa tutta tua ----------
  const casa = await page.evaluate(async () => {
    const st = G.st;
    goMap('house', 6, 7, 3, true);
    await sleep(200);
    const I = st.free.inside,
      mobili = Object.values(I).map(f => f.id);
    const nonno = [
      'letto_nonno',
      'camino_nonno',
      'ritratto_nonno',
      'cassa_nonno',
      'scaffale_nonno',
      'tavolo_nonno',
      'tappeto_nonno'
    ].every(id => mobili.includes(id));
    const fisso = G.map.objs.some(o => o.kind === 'bed');
    // il letto va accanto alla finestra in fondo
    delete I['1,3'];
    I['10,6'] = { id: 'letto_nonno' };
    houseRebuild();
    const sveglia = svegliaPos(st);
    giveItem('lana_blu', 2);
    window.__vuoi = ['Rifai il letto', 'Lana blu'];
    await lettoMenu(G.map.objs.find(o => o.fid === 'letto_nonno'));
    const col = st.free.lettoCol,
      img = FREEIMG.letto_nonno !== IMG.bed;
    // il camino cucina ancora e si porta dietro il fuoco
    const camino = G.map.objs.find(o => o.fid === 'camino_nonno');
    return {
      nonno,
      fisso,
      sveglia,
      col,
      img,
      fuoco: camino && camino.anim === 'fire' && G.map.lights.length > 0
    };
  });
  t.true(
    'finita la storia i mobili del nonno sono mobili come gli altri (e quelli fissi non ci sono più)',
    casa.nonno && !casa.fisso
  );
  t.true('spostato il letto, ci si sveglia accanto a lui', casa.sveglia[0] === 9 && casa.sveglia[1] === 6);
  t.true(
    'due matasse di lana blu rifanno il letto: la coperta cambia colore',
    casa.col === 'blu' && casa.img
  );
  t.true('il camino spostabile si porta dietro fuoco e luce', !!casa.fuoco);
  const mattina = await page.evaluate(async () => {
    window.__vuoi = [];
    await endDay(false);
    await sleep(300);
    return [ptile(G.player)[0], ptile(G.player)[1], G.map.id];
  });
  t.true(
    'la mattina dopo ci si sveglia accanto al letto spostato',
    mattina[0] === 9 && mattina[1] === 6 && mattina[2] === 'house'
  );

  await page.evaluate(() => clearInterval(window.__auto));
  t.eq('allevamento: nessun errore', errors.join('\n'), '');
  await page.close();
};
