'use strict';
// 16. Zaino e casse sempre sani: un salvataggio rovinato (cassa accorciata da Firebase, cassa diventata un
// oggetto, attrezzi impilati, oggetti che non esistono più) si ripara al caricamento senza perdere niente;
// il contenuto mandato dal padrone in diretta arriva sano; con lo zaino pieno niente sparisce.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const st = JSON.parse(JSON.stringify(G.st));
    // com'era il mondo del giocatore: una cassa di 3 posti, una diventata oggetto, una senza contenuto
    st.free.built['30,30'] = { id: 'cassa', inv: [{ id: 'legna', n: 5 }, null, { id: 'pietra', n: 3 }] };
    st.free.built['31,30'] = { id: 'cassa', inv: { 4: { id: 'fibra', n: 7 }, 19: { id: 'accetta', n: 2 } } };
    st.free.built['32,30'] = { id: 'cassa' };
    st.free.built['33,30'] = { id: 'banco', inv: [{ id: 'ferro', n: 2 }] };
    st.inv = st.inv.slice(0, 7);
    st.inv[5] = { id: 'oggetto_sparito', n: 3 };
    st.inv[6] = { id: 'pietra', n: '4' };
    st.mailbox = [];
    const m = migrate(st),
      B = m.free.built,
      tot = (A, id) => A.reduce((n, s) => n + (s && s.id === id ? s.n : 0), 0),
      posta = id => m.mailbox.filter(x => x.item === id).reduce((n, x) => n + x.n, 0);
    return {
      lung: [B['30,30'].inv.length, B['31,30'].inv.length, B['32,30'].inv.length],
      posti: [B['30,30'].inv[0].id, B['30,30'].inv[2].id, B['31,30'].inv[4].id],
      accette: B['31,30'].inv.filter(s => s && s.id === 'accetta').map(s => s.n),
      banco: B['33,30'].inv === undefined && posta('ferro') === 2,
      zaino: m.inv.length,
      sparito: m.inv.some(s => s && s.id === 'oggetto_sparito'),
      pietra: tot(m.inv, 'pietra') === 4 && typeof m.inv[6].n === 'number'
    };
  });
  t.eq('le casse tornano di 20 posti', r.lung.join(','), '20,20,20');
  t.eq('ogni pila resta nella sua casella', r.posti.join(','), 'legna,pietra,fibra');
  t.eq('due accette impilate tornano due accette', r.accette.join(','), '1,1');
  t.true('il contenuto di chi non è una cassa va nella cassetta', r.banco);
  t.eq('lo zaino della Valle ha 30 posti', r.zaino, 30);
  t.true('un oggetto che non esiste più non blocca lo zaino', !r.sparito);
  t.true('le quantità scritte male tornano numeri', r.pietra);
  // il contenuto in diretta dal padrone, rovinato da Firebase, arriva sano
  const d = await page.evaluate(() => {
    const b = { id: 'cassa', inv: cassaVuota() };
    const x = inventario({ 2: { id: 'legna', n: 9 } }, CASSA_POSTI),
      y = inventario([{ id: 'pietra', n: 1 }], CASSA_POSTI);
    b.inv = x;
    return [x.length, x[2] && x[2].n, y.length, y[0].id].join(',');
  });
  t.eq('una cassa che arriva accorciata o come oggetto torna intera', d, '20,9,20,pietra');
  // zaino pieno: quello che arriva va nella cassetta; un secondo attrezzo occupa un posto suo
  const p = await page.evaluate(() => {
    const st = G.st,
      inv = st.inv;
    for (let i = 0; i < inv.length; i++) if (!inv[i]) inv[i] = { id: 'fibra', n: 1 };
    inv[inv.length - 1] = null;
    st.mailbox = [];
    const a = addItem('accetta', 2);
    inv[inv.length - 1] = { id: 'fibra', n: 1 };
    riponi('pietra', 3);
    const ok1 = st.mailbox.some(x => x.item === 'pietra' && x.n === 3);
    inv[inv.length - 1] = null;
    inv[inv.length - 2] = null;
    const b = addItem('accetta', 2);
    const sole = inv.filter(s => s && s.id === 'accetta').every(s => s.n === 1);
    return { a, ok1, b, sole };
  });
  t.true('due attrezzi in un posto solo: rifiutati', !p.a);
  t.true('zaino pieno: la roba aspetta nella cassetta', p.ok1);
  t.true('con due posti, due attrezzi entrano', p.b);
  t.true('gli attrezzi non si impilano', p.sole);
  t.eq('contenitori: nessun errore', errors.join('\n'), '');
  await page.close();
};
