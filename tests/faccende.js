'use strict';
// 19. Le faccende della Valle: tante, ognuna si completa davvero facendo la cosa giusta (dopo averla accettata),
// quelle che richiedono bestie o compagno escono solo se li hai; finita una, alla bacheca se ne prende un'altra.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const st = G.st;
    G.map = G.maps.main;
    const nuove = Object.keys(CHORES).filter(k => CHORES[k].valle);
    // senza bestie né compagno, quelle che li richiedono non escono mai
    const uscite = new Set();
    for (let i = 0; i < 400; i++) {
      choreScegli(st);
      uscite.add(st.chore);
    }
    const vietate = ['uova', 'mungi', 'lana', 'bestie', 'compagno', 'ciotola'].filter(k => uscite.has(k));
    // le bestie e il compagno, per provarle tutte
    st.free.built['20,24'] = { id: 'pollaio' };
    st.free.animals = [
      { kind: 'gallina', name: 'A', home: '20,24', love: 5 },
      { kind: 'mucca', name: 'B', home: '20,24', love: 5 },
      { kind: 'pecora', name: 'C', home: '20,24', love: 5 }
    ];
    st.free.pet = { kind: 'cane', skin: 0, name: 'Pepe', love: 6, fame: 0, modo: 'resta', ciotola: 0 };
    st.free.inside = st.free.inside || {};
    st.free.inside['3,3'] = { id: 'ciotola' };
    const fatto = (k, fare) => {
      st.chore = k;
      st.choreDone = false;
      choreAccetta(st);
      const m0 = st.money;
      fare(CHORES[k]);
      for (let i = 0; i < 3; i++) Ext.run('mpTick', 0.6);
      return st.choreDone && st.money > m0;
    };
    const non = [];
    for (const k of nuove) {
      const ok = fatto(k, c => {
        if (c.fatto) Ext.run('fatto', c.fatto, c.n);
        else if (c.ottieni) {
          const id =
            typeof c.ottieni === 'function' ? Object.values(WILD).flat().find(c.ottieni) : c.ottieni[0];
          addItem(id, c.n);
        } else if (c.luoghi)
          for (const [x, y] of c.luoghi) {
            setPos(G.player, x, y, 0);
            Ext.run('mpTick', 0.6);
          }
        else if (k === 'cena') st.free.fished = (st.free.fished || 0) + c.n;
        else if (k === 'pulizia') st.flags.debris = (st.flags.debris || 0) + c.n;
        else if (k === 'piatto') st.flags.cooked = (st.flags.cooked || 0) + 1;
        else if (k === 'banco') st.flags.crafted = (st.flags.crafted || 0) + 1;
        else if (k === 'saluti') for (const id of ['a', 'b', 'c', 'd']) st.talked[id] = 1;
        else if (k === 'regalo') (st.gifted = st.gifted || {}).brom = 1;
        else if (k === 'bestie') st.free.animals.forEach(a => (a.pet = true));
        else if (k === 'compagno') Object.assign(st.free.pet, { coccole: true, pappa: true });
        else if (k === 'ciotola') st.free.pet.ciotola = 2;
      });
      if (!ok) non.push(k);
    }
    // prima di accettarla non conta
    st.chore = 'muretti';
    st.choreOk = st.choreDone = false;
    st.choreC = 0;
    addItem('pietra', 20);
    Ext.run('mpTick', 0.6);
    const primaNonConta = !st.choreDone;
    // un'altra faccenda alla bacheca
    st.choreFatte = 1;
    st.choreDone = true;
    UI.board();
    const altra = !!$('#altra');
    if (altra) $('#altra').click();
    const nuova = !st.choreDone && !st.choreOk && st.choreFatte === 1;
    UI.close();
    return { n: Object.keys(CHORES).length, vietate, non, primaNonConta, altra, nuova };
  });
  t.true('molte più faccende (almeno 24)', r.n >= 24);
  t.eq('senza bestie né compagno, niente faccende per loro', r.vietate.join(','), '');
  t.eq('ogni faccenda nuova si completa facendola', r.non.join(','), '');
  t.true('prima di accettarla non conta', r.primaNonConta);
  t.true('finita una, alla bacheca c’è «Un’altra faccenda»', r.altra);
  t.true('e ne arriva una nuova da accettare', r.nuova);
  t.eq('faccende: nessun errore', errors.join('\n'), '');
  await page.close();
};
