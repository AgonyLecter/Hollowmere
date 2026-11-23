'use strict';
// 18. Il compagno: i randagi arrivano dal terzo giorno, l'adozione (tipo, aspetto, nome), Segui e Resta,
// la notte nella cuccia, la ciotola, la fame del mattino, le cose che ti porta.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const a = await page.evaluate(() => {
    const st = G.st;
    st.time = 11 * 60;
    st.day = st.free.start + 2;
    Ext.run('freeMorning', st);
    G.map = G.maps.main;
    const randagi = randagiQui();
    compAdotta('gatto');
    $('#mbox [data-s="2"]').click();
    $('#compNome').value = 'Ombra';
    $('#mbox [data-ok]').click();
    const p = st.free.pet;
    return { randagi, p: p && [p.kind, p.skin, p.name, p.modo].join(','), dopo: randagiQui() };
  });
  t.true('dal terzo giorno, davanti a casa ci sono i randagi', a.randagi);
  t.eq('adotti il gatto grigio e lo chiami Ombra', a.p, 'gatto,2,Ombra,segui');
  t.true('adottato uno, i randagi se ne vanno', !a.dopo);
  // segue: anche in casa
  const s = await page.evaluate(() => {
    setPos(G.player, 9, 12, 0);
    for (let i = 0; i < 20; i++) compTick(0.05);
    const fuori = G.comp.map;
    G.map = G.maps.house;
    setPos(G.player, 5, 6, 0);
    for (let i = 0; i < 40; i++) compTick(0.05);
    const d = Math.hypot(G.comp.x - G.player.x, G.comp.y - G.player.y);
    return { fuori, dentro: G.comp.map, vicino: d < 40 };
  });
  t.eq('ti segue fuori', s.fuori, 'main');
  t.eq('e in casa', s.dentro, 'house');
  t.true('ti sta vicino', s.vicino);
  // resta: la notte dorme in casa, di giorno sta davanti a casa
  const r = await page.evaluate(() => {
    const st = G.st,
      p = st.free.pet;
    p.modo = 'resta';
    st.time = 23 * 60;
    G.map = G.maps.house;
    for (let i = 0; i < 400; i++) compTick(0.05);
    const notte = G.comp.map + ',' + G.comp.st;
    st.time = 10 * 60;
    G.map = G.maps.main;
    setPos(G.player, 40, 30, 0);
    compTick(0.05);
    return { notte, giorno: G.comp.map };
  });
  t.eq('resta: la notte dorme in casa', r.notte, 'house,sleep');
  t.eq('resta: di giorno è fuori', r.giorno, 'main');
  // ciotola e fame
  const f = await page.evaluate(() => {
    const st = G.st,
      p = st.free.pet;
    addItem('crocchette', 2);
    Ext.intercetta('arredo', { fid: 'ciotola' });
    const inCiotola = p.ciotola;
    Ext.run('freeMorning', st);
    const sazio = p.fame === 0 && p.ciotola === inCiotola - 1;
    p.ciotola = 0;
    Ext.run('freeMorning', st);
    Ext.run('freeMorning', st);
    return { inCiotola, sazio, fame: p.fame };
  });
  t.true('le crocchette vanno nella ciotola', f.inCiotola >= 2);
  t.true('la mattina mangia dalla ciotola', f.sazio);
  t.true('senza cibo per due giorni ha fame', f.fame >= 60);
  // ti porta quello che trova
  const g = await page.evaluate(() => {
    const st = G.st,
      p = st.free.pet,
      m = G.maps.main;
    p.modo = 'segui';
    G.map = m;
    setPos(G.player, 20, 20, 0);
    for (let i = 0; i < 5; i++) compTick(0.05);
    // solo il nostro ramo nei dintorni (altrimenti va a prendere il detrito più vicino)
    for (const o of m.objs.filter(
      o => o.kind === 'debris' && Math.abs(o.tx - 20) < 9 && Math.abs(o.ty - 20) < 9
    ))
      mapRemove(m, o);
    const k = '22,20';
    st.free.debris[k] = 'ramo';
    m.add(OB('debris', 22, 20, FREEIMG.ramo, { act: 'debris', dt: 'ramo', solid: [], hits: [[22, 20]] }));
    const n0 = countItem('legna');
    G.comp.aiuto = 0;
    compTick(0.05);
    const p1 = G.comp.preda ? G.comp.preda.dt + '@' + G.comp.preda.tx + ',' + G.comp.preda.ty : 'nessuna';
    for (let i = 0; i < 200; i++) compTick(0.05);
    return {
      preso: countItem('legna') - n0,
      sparito: !st.free.debris[k],
      prima: p1
    };
  });
  t.true('ti porta il ramo che trova vicino a te', g.preso >= 1 && g.sparito && g.prima === 'ramo@22,20');
  t.eq('compagno: nessun errore', errors.join('\n'), '');
  await page.close();
};
