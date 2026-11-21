'use strict';
// 9. Le macchine: la schermata della fornace (ferro e legna dentro, lingotti fuori), il lavoro col tempo
// del gioco, i lavori del vecchio sistema che diventano prodotti pronti, niente smontaggio con la roba dentro.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser, shot }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    const st = G.st;
    st.free.built['21,29'] = { id: 'fornace', d: st.day };
    // un lavoro del vecchio sistema (prima della schermata)
    st.free.built['24,29'] = {
      id: 'botte',
      d: st.day,
      job: { out: 'succo_mela', ready: st.day + 2, n: 1, in: 'mela' }
    };
    rebuildMaps();
    G.map = G.maps.main;
    setPos(G.player, 21, 31, 3);
    st.time = 10 * 60;
    addItem('ferro', 12);
    addItem('legna', 3);
    addItem('pala', 1);
  });
  await page.waitForTimeout(400);
  // tocca la fornace: si apre la schermata
  const apre = await page.evaluate(() => {
    const st = G.st,
      b = st.free.built['21,29'],
      o = G.map.objs.find(o => o.bk === '21,29');
    st.sel = st.inv.findIndex(s => s && s.id === 'pala');
    machineAct('21,29', b, o);
    return !!document.querySelector('#mbox .mac') && G.macGui === '21,29';
  });
  t.true('toccando la fornace si apre la sua schermata', apre);
  // metti ferro e legna toccandoli nello zaino
  const dentro = await page.evaluate(() => {
    const Z = G.st.inv,
      tocca = id =>
        document
          .querySelector(`#mbox .islot[data-w="z"][data-i="${Z.findIndex(s => s && s.id === id)}"]`)
          .click();
    tocca('ferro');
    tocca('legna');
    const m = G.st.free.built['21,29'].m;
    return {
      i: m.i,
      in: m.in,
      f: m.f,
      lav: macLav(G.st.free.built['21,29']),
      ferro: countItem('ferro'),
      legna: countItem('legna')
    };
  });
  t.eq('il ferro va dentro', dentro.in, 12);
  t.eq('la legna va nel fuoco', dentro.f, 3);
  t.eq('lo zaino si svuota di ferro', dentro.ferro, 0);
  t.true('e la fornace si accende', dentro.lav);
  // il tempo scorre anche con la schermata aperta
  const t0 = await page.evaluate(() => G.st.time);
  await page.waitForTimeout(1500);
  const scorre = await page.evaluate(() => ({
    t: G.st.time,
    barra: parseFloat(document.querySelector('.mac-barra b').style.width),
    testo: document.querySelector('.mac-info').textContent
  }));
  t.true('con la schermata aperta il tempo scorre', scorre.t > t0);
  t.true('la freccia si riempie', scorre.barra > 0);
  t.true('e dice quanto manca', /prossimo tra/.test(scorre.testo));
  await page.evaluate(() => (G.st.time = 10 * 60 + 70));
  await page.waitForTimeout(300);
  if (shot) await page.locator('#mbox').screenshot({ path: shot });
  // dopo tre ore: due lingotti fatti (12 ferro = 2 lotti, avanzano 2), la legna ne ha bruciate 2
  const fatto = await page.evaluate(() => {
    G.st.time = 10 * 60 + 200;
    macAggiorna();
    const m = G.st.free.built['21,29'].m;
    return { on: m.on, o: m.o, in: m.in, f: m.f, lav: macLav(G.st.free.built['21,29']) };
  });
  t.eq('dopo tre ore, due lingotti', fatto.on, 2);
  t.eq('il ferro che avanza resta dentro', fatto.in, 2);
  t.eq('la legna bruciata se ne va', fatto.f, 1);
  t.true('e con 2 ferri si ferma', !fatto.lav);
  // smontarla con la roba dentro non si può
  const smonta = await page.evaluate(() => macVuota(G.st.free.built['21,29']));
  t.true('piena non si smonta', !smonta);
  // prendi i lingotti e riprendi il ferro avanzato
  const preso = await page.evaluate(() => {
    document.querySelector('.mslot[data-m="o"]').click();
    document.querySelector('.mslot[data-m="in"]').click();
    document.querySelector('.mslot[data-m="f"]').click();
    return {
      lingotti: countItem('lingotto'),
      ferro: countItem('ferro'),
      legna: countItem('legna'),
      vuota: macVuota(G.st.free.built['21,29'])
    };
  });
  t.eq('i lingotti finiscono nello zaino', preso.lingotti, 2);
  t.eq('il ferro avanzato torna', preso.ferro, 2);
  t.eq('e la legna', preso.legna, 1);
  t.true('la fornace è vuota', preso.vuota);
  // quello che non ci va resta nello zaino
  const no = await page.evaluate(() => {
    const Z = G.st.inv,
      i = Z.findIndex(s => s && s.id === 'pala');
    document.querySelector(`#mbox .islot[data-w="z"][data-i="${i}"]`).click();
    return !!Z[i] && Z[i].id === 'pala';
  });
  t.true('la pala nella fornace non ci va', no);
  await page.evaluate(() => UI.close());
  t.true('chiusa la schermata il tempo si ferma di nuovo con i menu', await page.evaluate(() => !G.macGui));
  // il vecchio lavoro della botte diventa succo pronto
  const vecchio = await page.evaluate(() => {
    const b = G.st.free.built['24,29'];
    macSim(b);
    return { job: !!b.job, o: b.m.o, on: b.m.on };
  });
  t.true(
    'i lavori di prima diventano prodotti pronti',
    !vecchio.job && vecchio.o === 'succo_mela' && vecchio.on === 1
  );
  // il mulino: stessa schermata, una macinata all'ora al livello 1, il pulsante per migliorarlo
  const mulino = await page.evaluate(() => {
    const st = G.st;
    st.free.built['30,40'] = { id: 'mulino', job: { n: 4, ready: st.day + 1, t: st.time } };
    const b = st.free.built['30,40'];
    st.time = 9 * 60;
    addItem('mais', 3);
    macGui('30,40', b);
    const vecchia = b.m.on;
    document.querySelector('.mslot[data-m="o"]').click();
    const Z = G.st.inv;
    document
      .querySelector(`#mbox .islot[data-w="z"][data-i="${Z.findIndex(s => s && s.id === 'mais')}"]`)
      .click();
    const liv = !!document.querySelector('#mbox [data-liv]');
    st.time = 9 * 60 + 185;
    macAggiorna();
    const fatto = b.m.on;
    UI.close();
    return { vecchia, liv, fatto, farina: countItem('farina') };
  });
  t.eq('il mulino di prima: la farina che macinava è pronta', mulino.vecchia, 4);
  t.eq('e si prende', mulino.farina, 4);
  t.true('nella schermata del mulino c’è «Migliora»', mulino.liv);
  t.eq('3 mais in tre ore: 6 farine', mulino.fatto, 6);
  // l'apiario: la sua schermata con il miele pronto da prendere
  const api = await page.evaluate(() => {
    const st = G.st;
    st.free.built['33,40'] = { id: 'apiario', ready: 1, n: 2, t: 0 };
    const b = st.free.built['33,40'];
    machineAct('33,40', b, { tx: 33, ty: 40 });
    const apre = !!document.querySelector('#mbox .mac');
    document.querySelector('.mac-out').click();
    const testo = document.querySelector('.mac-info').textContent;
    UI.close();
    return { apre, miele: countItem('miele'), ready: b.ready, testo };
  });
  t.true('l’apiario ha la sua schermata', api.apre);
  t.eq('toccando il miele si prende', api.miele, 2);
  t.true('e la schermata dice quando arriva il prossimo', /prossimo miele/.test(api.testo));
  t.eq('macchine: nessun errore', errors.join('\n'), '');
  await page.close();
};
