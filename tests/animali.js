'use strict';
// 17. Gli animali della fattoria: i prodotti finiscono in casa loro (non a terra, non addosso) e si prendono
// dalla schermata dell'edificio, scegliendo cosa; di giorno pascolano, la sera rientrano, la mattina escono.
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
    st.free.built['20,24'] = { id: 'pollaio' };
    st.free.built['26,24'] = { id: 'stalla' };
    st.free.animals = [
      { kind: 'gallina', name: 'Rosina', home: '20,24', love: 10, pet: true, prod: false, hungry: false },
      { kind: 'anatra', name: 'Fiocco', home: '20,24', love: 10, pet: true, prod: false, hungry: false },
      // una mucca di un salvataggio vecchio, pronta da mungere: il suo latte deve finire in stalla
      { kind: 'mucca', name: 'Bianca', home: '26,24', love: 6, pet: false, prod: true, hungry: false }
    ];
    const debris0 = Object.keys(st.free.debris).length;
    const R = Math.random;
    Math.random = () => 0; // tutte producono
    animalsMorning(st);
    Math.random = R;
    const P = st.free.built['20,24'].dentro,
      S = st.free.built['26,24'].dentro;
    return {
      uova: P.uovo,
      anatra: P.uovo_anatra,
      latte: S.latte,
      aTerra: Object.keys(st.free.debris).length - debris0
    };
  });
  t.eq('le uova di gallina sono nel pollaio', r.uova, 1);
  t.eq('quelle d’anatra a parte', r.anatra, 1);
  t.eq('il latte della mucca (anche quello di prima) è in stalla', r.latte, 2);
  t.eq('niente a terra', r.aTerra, 0);
  // la schermata: si prende solo quello che scegli
  const g = await page.evaluate(() => {
    barnMenu('20,24');
    const html = $('#mbox').innerHTML,
      n0 = countItem('uovo_anatra');
    $('#mbox').querySelector('[data-p="uovo_anatra"][data-n="1"]').click();
    const D = G.st.free.built['20,24'].dentro;
    UI.close();
    return {
      vede: /Uovo/.test(html) && /Rosina/.test(html) && /Compra/.test(html),
      preso: countItem('uovo_anatra') - n0,
      restaGallina: D.uovo,
      restaAnatra: D.uovo_anatra || 0
    };
  });
  t.true('la schermata mostra prodotti, bestie e acquisti', g.vede);
  t.eq('scegli l’uovo d’anatra: prendi solo quello', g.preso, 1);
  t.eq('l’uovo di gallina resta in casa', g.restaGallina, 1);
  t.eq('e quello d’anatra non c’è più', g.restaAnatra, 0);
  // con un attrezzo in mano conta solo l'attrezzo: la gallina vicina non si accarezza per sbaglio
  const at = await page.evaluate(() => {
    const st = G.st;
    G.map = G.maps.main;
    st.time = 12 * 60;
    spawnFarmAnimals();
    const e = G.fanimals[0];
    setPos(G.player, Math.floor(e.x / 16) - 1, Math.floor(e.y / 16), 2);
    G.player.x = e.x - 14;
    G.player.y = e.y;
    G.player.dir = 2;
    st.sel = st.inv.findIndex(s => s && s.id === 'accetta');
    const conAttrezzo = (aimScelta() || {}).k;
    const vuoto = st.inv.findIndex(s => !s);
    st.sel = vuoto;
    const aManiVuote = (aimScelta() || {}).k;
    return { conAttrezzo: conAttrezzo || '', aManiVuote };
  });
  t.true('con l’ascia in mano la gallina vicina non si accarezza', at.conAttrezzo !== 'animal');
  t.eq('a mani vuote sì', at.aManiVuote, 'animal');
  // giorno e notte
  const c = await page.evaluate(async () => {
    const st = G.st;
    G.map = G.maps.main;
    st.time = 12 * 60;
    spawnFarmAnimals();
    const giorno = G.fanimals.every(e => !e.dentro);
    st.time = 20 * 60;
    for (let i = 0; i < 400; i++) animalsTick(0.05);
    const sera = G.fanimals.every(e => e.dentro);
    // dentro non si accarezzano
    const p = G.fanimals[0];
    const toccata = animalAct(p.px, p.py);
    st.time = 7 * 60;
    for (let i = 0; i < 300; i++) animalsTick(0.05);
    const mattina = G.fanimals.every(e => !e.dentro);
    return { giorno, sera, toccata, mattina };
  });
  t.true('di giorno sono fuori', c.giorno);
  t.true('la sera rientrano tutte', c.sera);
  t.true('dentro casa non si toccano', !c.toccata);
  t.true('la mattina escono', c.mattina);
  t.eq('animali: nessun errore', errors.join('\n'), '');
  await page.close();
};
