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
  t.true('l’oro ci mette più del ferro', r.tempo[1] > r.tempo[0]);
  t.eq('nessuna ricetta chiede rame, nichel o oro grezzi', r.chi.join(', '), '');
  t.true('ogni minerale e ogni lingotto ha la sua icona', r.icone);
  t.true('i minerali rari hanno ognuno la sua forma (non più lo stesso sasso)', r.formeDiverse);
  t.eq('materiali: nessun errore', errors.join('\n'), '');
  await page.close();
};
