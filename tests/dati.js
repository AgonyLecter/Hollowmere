'use strict';
// 2. Integrità dei dati di gioco: ogni riferimento punta a qualcosa che esiste.
const { openGame } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  const r = await page.evaluate(() => {
    const P = [];
    const bad = (name, list) => P.push([name, list]);
    // le funzioni disegnate solo quando servono
    for (const f of ['genCostrArt', 'genEspArt', 'genSempreArt'])
      try {
        window[f]();
      } catch (e) {
        P.push([f + ' lancia un errore', [String(e)]]);
      }
    bad(
      'oggetti senza nome',
      Object.keys(ITEMS).filter(k => !ITEMS[k].n)
    );
    bad(
      'oggetti senza icona',
      Object.keys(ITEMS).filter(k => !ICON[k] && !['lastre'].includes(k))
    );
    bad(
      'semi di colture inesistenti',
      Object.keys(ITEMS).filter(k => ITEMS[k].t === 'seed' && !CROPS[ITEMS[k].crop])
    );
    bad(
      'colture senza oggetto raccolto',
      Object.keys(CROPS).filter(k => !ITEMS[k])
    );
    bad(
      'colture senza 4 stadi disegnati',
      Object.keys(CROPS).filter(
        k => !(CROPIMG[k] && CROPIMG[k].length === 4 && CROPIMG[k].every(c => c && c.width))
      )
    );
    bad(
      'colture senza stagioni',
      Object.keys(CROPS).filter(k => !Array.isArray(CROPS[k].s) || !CROPS[k].s.length)
    );
    bad(
      'colture senza plurale',
      Object.keys(CROPS).filter(k => !PL[k])
    );
    bad(
      'ricette con ingredienti inesistenti',
      COOK.filter(r => Object.keys(r.need).some(k => !ITEMS[k])).map(r => r.id)
    );
    bad(
      'ricette senza piatto',
      COOK.filter(r => !ITEMS[r.id] || ITEMS[r.id].t !== 'food').map(r => r.id)
    );
    bad(
      'ricette insegnate da abitanti inesistenti',
      COOK.filter(r => r.da && !NAMES[r.da]).map(r => r.id + '→' + r.da)
    );
    bad(
      'ricette doppie',
      COOK.map(r => r.id).filter((id, i, a) => a.indexOf(id) !== i)
    );
    bad(
      'costruzioni con materiali inesistenti',
      CRAFTS.filter(c => !ITEMS[c.id] || Object.keys(c.c).some(k => !ITEMS[k])).map(c => c.id)
    );
    bad(
      'alberi da frutto senza frutto',
      Object.keys(ITEMS).filter(k => ITEMS[k].tree && (!FRUIT[ITEMS[k].tree] || !ITEMS[ITEMS[k].tree]))
    );
    bad(
      'animali con casa inesistente',
      Object.keys(ANIMALS).filter(
        k => !ITEMS[ANIMALS[k].home] || !ITEMS[ANIMALS[k].home].size || !AIMG[ANIMALS[k].home]
      )
    );
    bad(
      'animali con prodotto inesistente',
      Object.keys(ANIMALS).filter(k => !ITEMS[ANIMALS[k].prod])
    );
    bad(
      'edifici grandi senza disegno',
      Object.keys(ITEMS).filter(k => ITEMS[k].size && !AIMG[k])
    );
    bad(
      'abitanti senza aspetto',
      NPC_DEF.map(d => d[0]).filter(id => !LOOKS[id])
    );
    bad(
      'abitanti senza nome',
      NPC_DEF.map(d => d[0]).filter(id => !NAMES[id])
    );
    bad(
      'nuovi abitanti incompleti',
      RES_POOL.filter(
        r => !r.job || !RES_WORK[r.job] || !r.req.length || !r.L.length || !SCHED[r.id] || !FREE_ASK[r.id]
      ).map(r => r.id)
    );
    bad(
      'richieste dei nuovi abitanti con oggetti inesistenti',
      RES_POOL.flatMap(r => r.req.filter(x => !ITEMS[x]).map(x => r.id + ':' + x))
    );
    bad(
      'botteghe con merce inesistente',
      RES_POOL.flatMap(r => r.shop.filter(([x]) => !ITEMS[x]).map(([x]) => r.id + ':' + x))
    );
    bad(
      'gusti per oggetti inesistenti',
      Object.entries(LIKES).flatMap(([id, o]) =>
        Object.keys(o)
          .filter(k => !ITEMS[k])
          .map(k => id + ':' + k)
      )
    );
    bad(
      'merce del cocchiere inesistente',
      MERC_STOCK.filter(k => !ITEMS[k])
    );
    bad(
      'mulino: ingredienti inesistenti',
      Object.keys(MILL).filter(k => !ITEMS[k])
    );
    bad(
      'collezioni del museo con oggetti inesistenti',
      Object.entries(COLL).flatMap(([c, v]) =>
        v
          .l()
          .filter(k => !ITEMS[k])
          .map(k => c + ':' + k)
      )
    );
    // ogni aspetto produce i suoi fotogrammi senza errori
    const sheetErr = [];
    for (const k of Object.keys(LOOKS)) {
      try {
        const s = sheetOf(k);
        if (!s.width) sheetErr.push(k);
      } catch (e) {
        sheetErr.push(k + ': ' + e.message);
      }
    }
    bad('personaggi che non si disegnano', sheetErr);
    return P;
  });
  for (const [name, list] of r) t.eq(name, list.join(', '), '');
  t.eq('nessun errore durante i controlli sui dati', errors.join('\n'), '');
  await page.close();
};
