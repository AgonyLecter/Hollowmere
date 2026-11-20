'use strict';
// 3. Impronta del gioco: un codice per ogni immagine generata e per ogni tabella di dati.
// Con il caso reso prevedibile, due versioni del codice che si comportano allo stesso modo danno la stessa impronta.
// Serve soprattutto ai lavori di pulizia (riformattare, spostare codice): l'impronta non deve cambiare.
// Se una modifica cambia la grafica o i dati DI PROPOSITO: node tests/run.js --aggiorna
const fs = require('fs'),
  path = require('path');
const { openGame } = require('./helpers');
const FILE = path.join(__dirname, 'impronta.json');
function fingerprint() {
  const fnv = (h, v) => Math.imul(h ^ v, 16777619) >>> 0;
  const hc = c => {
    if (!c || !c.getContext) return 'x';
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let h = 2166136261;
    for (let i = 0; i < d.length; i += 1) h = fnv(h, d[i]);
    return c.width + 'x' + c.height + ':' + h.toString(16);
  };
  const hs = s => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = fnv(h, s.charCodeAt(i));
    return h.toString(16);
  };
  const out = {};
  const walk = (pre, o) => {
    if (!o) return;
    for (const k of Object.keys(o).sort()) {
      const v = o[k];
      if (v && v.getContext) out[pre + k] = hc(v);
      else if (Array.isArray(v))
        v.forEach((c, i) => {
          if (c && c.getContext) out[pre + k + '#' + i] = hc(c);
        });
    }
  };
  // le funzioni pigre, ognuna con il suo seme
  __seed(101);
  genCostrArt();
  __seed(102);
  genEspArt();
  __seed(103);
  genSempreArt();
  walk('ICON.', ICON);
  walk('IMG.', IMG);
  walk('FREEIMG.', FREEIMG);
  walk('AIMG.', AIMG);
  walk('CRIT.', CRIT);
  walk('CROPIMG.', CROPIMG);
  walk('T.', T);
  for (const k of Object.keys(LOOKS).sort()) {
    __seed(7);
    delete SHEET[k];
    out['SHEET.' + k] = hc(sheetOf(k));
    for (const md of ['', 'sad', 'fear', 'stern', 'dark']) {
      __seed(9);
      delete PORT[k + '|' + md];
      out['PORT.' + k + '|' + md] = hc(portrait(k, md));
    }
  }
  const J = o =>
    JSON.stringify(o, (k, v) =>
      typeof v === 'function' ? 'ƒ' + v.length : v && v.getContext ? 'canvas' : v
    );
  const data = {
    ITEMS,
    CROPS,
    COOK,
    CRAFTS,
    ANIMALS,
    FRUIT,
    MILL,
    LIKES,
    NAMES,
    HOMES,
    PL,
    SG,
    LOOKS,
    RES_POOL,
    MERC_STOCK,
    CRAFT_CAT: typeof CRAFT_CAT !== 'undefined' ? CRAFT_CAT : null
  };
  for (const k in data) out['DATI.' + k] = hs(J(data[k]));
  out['DATI.SCHED(chiavi)'] = hs(Object.keys(SCHED).sort().join());
  out['DATI.NPC_DEF'] = hs(J(NPC_DEF));
  return out;
}
module.exports = async function (t, { browser, aggiorna }) {
  const run = async () => {
    const { page, errors } = await openGame(browser);
    const fp = await page.evaluate(fingerprint);
    await page.close();
    return { fp, errors };
  };
  const a = await run(),
    b = await run();
  const unstable = Object.keys(a.fp).filter(k => a.fp[k] !== b.fp[k]);
  t.eq("l'impronta è stabile da un'esecuzione all'altra", unstable.slice(0, 10).join(', '), '');
  t.eq("nessun errore mentre si calcola l'impronta", a.errors.join('\n'), '');
  if (aggiorna || !fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify(a.fp, null, 1) + '\n');
    t.ok(`impronta salvata (${Object.keys(a.fp).length} voci)`);
    return;
  }
  const base = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const changed = Object.keys(base).filter(k => k in a.fp && base[k] !== a.fp[k]),
    gone = Object.keys(base).filter(k => !(k in a.fp)),
    added = Object.keys(a.fp).filter(k => !(k in base));
  t.eq(
    `grafica e dati identici all'impronta salvata (${Object.keys(base).length} voci)`,
    [...changed.map(k => 'cambiato ' + k), ...gone.map(k => 'sparito ' + k), ...added.map(k => 'nuovo ' + k)]
      .slice(0, 25)
      .join('\n'),
    ''
  );
};
