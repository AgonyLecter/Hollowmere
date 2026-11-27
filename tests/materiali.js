'use strict';
// 27. I materiali: ferro, rame, nichel e oro si fondono nella fornace (5, 4, 4 e 3 minerali per lingotto, con una
// legna); le ricette chiedono i lingotti, mai i minerali rari grezzi; ogni minerale e ogni lingotto ha la sua icona.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const M = MACH.fornace,
      fusi = ['ferro', 'rame', 'nichel', 'oro'].map(id => [id, M.ok(id), macNeed(M, id), M.out(id)]);
    // tutte le ricette e i miglioramenti: nessuno chiede rame, nichel o oro grezzi
    const grezzi = new Set(['rame', 'nichel', 'oro']),
      chi = [];
    for (const c of CRAFTS) for (const k in c.c) if (grezzi.has(k)) chi.push(c.id + ':' + k);
    for (const [n, T] of [
      ['miglioramenti', FUNC_UP],
      ['casa', HOUSE_UP],
      ['serra', SERRA_AUTO]
    ])
      for (const [lv, v] of Object.entries(T))
        for (const k in (v && v.c) || {}) if (grezzi.has(k)) chi.push(n + lv + ':' + k);
    for (const [k] of TELAIO) if (grezzi.has(TELAIO.find(x => x[0] === k)[1])) chi.push('telaio:' + k);
    // le icone: tutte diverse fra loro (prima i minerali rari erano lo stesso sasso con un altro colore)
    const ids = [
        'ferro',
        'rame',
        'nichel',
        'oro',
        'lingotto',
        'lingotto_rame',
        'lingotto_nichel',
        'lingotto_oro'
      ],
      firma = id => {
        const c = ICON[id];
        if (!c) return null;
        const d = c.getContext('2d').getImageData(0, 0, 32, 32).data;
        let h = 0;
        for (let i = 3; i < d.length; i += 4) h = (h * 31 + (d[i] > 128 ? i : 0)) >>> 0;
        return h;
      },
      forme = ids.slice(0, 4).map(firma);
    return {
      fusi,
      chi,
      icone: ids.every(id => !!ICON[id]),
      formeDiverse: new Set(forme).size === 4,
      altro: (() => {
        // fuori ci sono lingotti di ferro, dentro il rame: si ferma e lo dice (non «è piena»)
        const b = { id: 'fornace', m: { i: 'rame', in: 4, f: 1, o: 'lingotto', on: 2, t0: null } };
        return [macFermo(b), macTesto(b)];
      })(),
      tempo: [macDur({ id: 'fornace', m: { i: 'ferro' } }), macDur({ id: 'fornace', m: { i: 'oro' } })]
    };
  });
  t.eq(
    'la fornace fonde ferro, rame, nichel e oro, ognuno nel suo lingotto',
    JSON.stringify(r.fusi),
    JSON.stringify([
      ['ferro', true, 5, 'lingotto'],
      ['rame', true, 4, 'lingotto_rame'],
      ['nichel', true, 4, 'lingotto_nichel'],
      ['oro', true, 3, 'lingotto_oro']
    ])
  );
  t.eq('con altri lingotti pronti la fornace aspetta che li prendi', r.altro[0], 'altro');
  t.true(
    'e lo dice, invece di «è piena»',
    /prendi <b>lingotto/i.test(r.altro[1]) && !/piena/.test(r.altro[1])
  );
  t.true('l’oro ci mette più del ferro', r.tempo[1] > r.tempo[0]);
  t.eq('nessuna ricetta chiede rame, nichel o oro grezzi', r.chi.join(', '), '');
  t.true('ogni minerale e ogni lingotto ha la sua icona', r.icone);
  t.true('i minerali rari hanno ognuno la sua forma (non più lo stesso sasso)', r.formeDiverse);
  // l'equilibrio: nessuna coltura rende quasi niente, nessuna doppia le altre; le macchine non fanno perdere valore
  const eq = await page.evaluate(() => {
    const V = id => (ITEMS[id] && ITEMS[id].v) || 0,
      basse = [],
      resa = [];
    for (const it of Object.values(ITEMS)) {
      if (it.t !== 'seed' || !CROPS[it.crop]) continue;
      const c = CROPS[it.crop],
        y = (c.y[0] + c.y[1]) / 2,
        g = c.re
          ? ((1 + Math.floor((28 - c.days) / c.re)) * y * V(it.crop) - it.p) / 28
          : (Math.floor(28 / c.days) * (y * V(it.crop) - it.p)) / 28;
      resa.push([it.crop, g]);
      if (g < 7.5) basse.push(it.crop + ' ' + g.toFixed(1));
    }
    resa.sort((a, b) => b[1] - a[1]);
    const perdono = [];
    for (const [id, M] of Object.entries(NAT_MACH))
      if (M.in && id === 'frantoio')
        for (const [k, n] of Object.entries(M.in)) if (V(M.out(k)) <= V(k) * n) perdono.push(id + ':' + k);
    for (const [k, [q, f]] of Object.entries(MILL))
      if (k === 'grano' && V('farina') * f <= V(k) * q) perdono.push('mulino:' + k);
    const h = Wiki.pagina(),
      wiki = ['lingotto_rame', 'lingotto_nichel', 'lingotto_oro'].every(k =>
        h.includes('Fornace: ' + FUSIONE[Object.keys(FUSIONE).find(m => FUSIONE[m].out === k)].n + '×')
      );
    return { basse, primo: resa[0], secondo: resa[1], perdono, wiki, testo: ITEMS.s_fagioli.d };
  });
  t.eq('nessuna coltura rende quasi niente', eq.basse.join(', '), '');
  t.true(
    `nessuna coltura rende il doppio delle altre (${eq.primo[0]} ${eq.primo[1].toFixed(0)}, poi ${eq.secondo[0]} ${eq.secondo[1].toFixed(0)})`,
    eq.primo[1] < eq.secondo[1] * 1.5
  );
  t.eq('frantoio e mulino non fanno perdere valore', eq.perdono.join(', '), '');
  t.true('la wiki dice come si fondono rame, nichel e oro', eq.wiki);
  t.eq('materiali: nessun errore', errors.join('\n'), '');
  await page.close();
};
