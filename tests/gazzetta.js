'use strict';
// 8. La Gazzetta della Valle: trespolo, piccione, fotografia, biglietti, piume, commenti, gara.
// Firebase qui non c'è: GZ_DB viene sostituito da un piccolo server finto in memoria.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => goMap('main', 20, 30, 0, true));
  await page.waitForTimeout(800);
  // server finto
  await page.evaluate(() => {
    const db = { post: {}, piume: {}, commenti: {} };
    let cb = null,
      n = 0;
    window.__gz = db;
    // se il gioco si era già collegato a Firebase vero (su GitHub succede), si stacca e riparte dal server finto
    try {
      if (typeof GZ.off === 'function') GZ.off();
    } catch (e) {}
    Object.assign(GZ, { off: null, posts: {}, piume: {}, commenti: {}, pronto: false });
    G.st.flags.gzVisto = 0;
    window.__gzAvvisa = () => cb && cb(JSON.parse(JSON.stringify(db.post)));
    GZ_DB = {
      ok: () => true,
      async proprio() {},
      ascolta(f) {
        cb = f;
        setTimeout(window.__gzAvvisa, 0);
        return () => {};
      },
      async piume(id) {
        return db.piume[id] || {};
      },
      async commenti(id) {
        return db.commenti[id] || {};
      },
      async pubblica(p) {
        db.post['p' + ++n] = p;
        window.__gzAvvisa();
      },
      async togli(id) {
        delete db.post[id];
        window.__gzAvvisa();
      },
      async piuma(id, pid, on) {
        db.piume[id] = db.piume[id] || {};
        if (on) db.piume[id][pid] = true;
        else delete db.piume[id][pid];
      },
      async commenta(id, c) {
        (db.commenti[id] = db.commenti[id] || {})['c' + ++n] = c;
      }
    };
  });
  // il trespolo arriva la mattina
  const dato = await page.evaluate(() => {
    const prima = countItem('trespolo');
    G.st.flags.trespolo = 0;
    freeMorning(G.st);
    return countItem('trespolo') - prima;
  });
  t.eq('la mattina arriva il trespolo (una volta sola)', dato, 1);
  t.eq(
    '…e non ne arriva un altro',
    await page.evaluate(() => (freeMorning(G.st), countItem('trespolo') > 0 && !!G.st.flags.trespolo)),
    true
  );
  await page.evaluate(() => {
    G.st.free.built['21,29'] = { id: 'trespolo' };
    removeItem('trespolo', 1);
    rebuildMaps();
    G.map = G.maps.main;
    setPos(G.player, 21, 30, 3);
  });
  await page.waitForTimeout(600);
  t.true('il trespolo ha il piccione', await page.evaluate(() => !!pcTrespolo() && PC.st === 'posato'));
  // usare il trespolo apre la Gazzetta
  await page.evaluate(() => Ext.intercetta('freeAct:intercetta', 21, 29));
  await page.waitForTimeout(300);
  t.true('usando il trespolo si apre la Gazzetta', await page.evaluate(() => gzAperta()));
  t.true(
    'la bacheca vuota invita a scrivere',
    await page.evaluate(() => /bacheca è vuota/.test($('#gazzetta').textContent))
  );
  // fotografia
  await page.click('[data-tab=scrivi]');
  await page.click('[data-f=scatta]');
  await page.waitForTimeout(300);
  t.true(
    'il mirino si apre e la Valle diventa seppia',
    await page.evaluate(() => !!$('#mirino') && /sepia/.test($('#game').style.filter))
  );
  await page.keyboard.press('Space');
  await page.waitForTimeout(700);
  const foto = await page.evaluate(() => (GZ.foto ? [GZ.foto.slice(0, 23), GZ.foto.length] : null));
  t.eq('la fotografia è un JPEG', foto && foto[0], 'data:image/jpeg;base64,');
  t.true('la fotografia sta nel limite del database', foto && foto[1] < 60000);
  t.true(
    'dopo lo scatto si torna al biglietto',
    await page.evaluate(() => gzAperta() && GZ.tab === 'scrivi' && !$('#mirino'))
  );
  await page.fill('[data-testo]', 'Il mio primo raccolto di zafferano!');
  await page.click('[data-racconta]');
  await page.click('[data-manda]');
  await page.waitForTimeout(300);
  const post = await page.evaluate(() => Object.values(__gz.post)[0]);
  t.true(
    'il biglietto arriva alla Gazzetta, con foto e testo',
    !!(post && post.f && /zafferano/.test(post.t) && /🏡/.test(post.t))
  );
  t.eq('Pennino parte con il biglietto', await page.evaluate(() => PC.st), 'parte');
  await page.waitForTimeout(1200);
  if (process.env.GZ_FOTO) await page.screenshot({ path: process.env.GZ_FOTO + '/volo.png' });
  // un altro giocatore pubblica: Pennino torna con una lettera
  await page.evaluate(() => {
    __gz.post.altro = {
      pid: 'HM-ALTRO1',
      n: 'Bea',
      v: 'Borgo',
      t: 'Venite a vedere il mio frutteto',
      ts: Date.now() + 1000
    };
    __gzAvvisa();
  });
  t.true('la posta degli altri arriva con una lettera', await page.evaluate(() => PC.lettera === 1));
  await page.waitForTimeout(8000);
  t.eq('Pennino torna sul trespolo', await page.evaluate(() => PC.st), 'posato');
  // piume e commenti
  await page.evaluate(() => Gazzetta.apri('bacheca'));
  await page.waitForTimeout(300);
  t.true('aprendo la Gazzetta la lettera è letta', await page.evaluate(() => PC.lettera === 0));
  t.true(
    'i biglietti sono in bacheca',
    await page.evaluate(() => document.querySelectorAll('.gz-post').length === 2)
  );
  t.true(
    'non si danno piume ai propri biglietti',
    await page.evaluate(() => !!document.querySelector('[data-piuma="p1"][disabled]'))
  );
  await page.click('[data-piuma="altro"]');
  await page.waitForTimeout(200);
  t.true('si regala una piuma', await page.evaluate(() => !!(__gz.piume.altro || {})[gzMe().pid]));
  await page.evaluate(() => {
    PC.st = 'posato';
  });
  await page.click('[data-com="altro"]');
  await page.waitForTimeout(200);
  await page.fill('[data-cin="altro"]', 'Bellissimo!');
  await page.click('[data-cman="altro"]');
  await page.waitForTimeout(200);
  t.eq(
    'si commenta',
    await page.evaluate(() =>
      Object.values(__gz.commenti.altro || {})
        .map(c => c.t)
        .join()
    ),
    'Bellissimo!'
  );
  await page.click('[data-tab=gara]');
  await page.waitForTimeout(200);
  t.true(
    'la gara della settimana mostra la foto',
    await page.evaluate(
      () =>
        /Questa settimana/.test($('#gazzetta').textContent) &&
        document.querySelectorAll('.gz-post img').length >= 1
    )
  );
  if (process.env.GZ_FOTO) await page.screenshot({ path: process.env.GZ_FOTO + '/gara.png' });
  await page.keyboard.press('Escape');
  t.true('Esc chiude la Gazzetta', await page.evaluate(() => !gzAperta() && !UI.modalOpen));
  // senza collegamento
  await page.evaluate(() => {
    GZ_DB.ok = () => false;
    Gazzetta.apri();
  });
  t.true(
    'senza collegamento il piccione «non trova la strada»',
    await page.evaluate(() => /non trova la strada/.test($('#gazzetta').textContent))
  );
  await page.evaluate(() => Gazzetta.chiudi());
  t.eq('gazzetta: nessun errore', errors.join('\n'), '');
  await page.close();
};
