#!/usr/bin/env node
'use strict';
// Test automatici di Hollowmere.   node tests/run.js            tutti i test
//                                  node tests/run.js dati fumo  solo alcuni
//                                  node tests/run.js --aggiorna  rifà l'impronta (dopo una modifica voluta alla grafica o ai dati)
const { ROOT, chromium } = require('./helpers');
const SUITES = {
  sintassi: require('./sintassi'),
  dati: require('./dati'),
  impronta: require('./impronta'),
  fumo: require('./fumo'),
  toppe: require('./toppe'),
  economia: require('./economia'),
  aggiornamento: require('./aggiornamento'),
  gazzetta: require('./gazzetta'),
  suono: require('./suono')
};
const args = process.argv.slice(2),
  aggiorna = args.includes('--aggiorna'),
  pick = args.filter(a => !a.startsWith('--'));
(async () => {
  let pass = 0,
    fail = 0;
  const fails = [];
  const t = {
    ok: n => {
      pass++;
      console.log('  ✓ ' + n);
    },
    fail: (n, d) => {
      fail++;
      fails.push(n);
      console.log('  ✗ ' + n + (d ? '\n      ' + String(d).split('\n').join('\n      ') : ''));
    },
    eq(n, got, exp) {
      got === exp
        ? this.ok(n)
        : this.fail(n, `atteso: ${JSON.stringify(exp)}\n ottenuto: ${String(got).slice(0, 1500)}`);
    },
    true(n, v) {
      v ? this.ok(n) : this.fail(n, 'falso');
    }
  };
  const browser = await chromium.launch();
  const t0 = Date.now();
  try {
    for (const [name, fn] of Object.entries(SUITES)) {
      if (pick.length && !pick.includes(name)) continue;
      console.log('\n▸ ' + name);
      try {
        await fn(t, { ROOT, browser, aggiorna });
      } catch (e) {
        t.fail(name + ' si è interrotto', e.stack);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    `\n${fail ? '✗' : '✓'} ${pass} superati, ${fail} falliti · ${((Date.now() - t0) / 1000).toFixed(1)} s`
  );
  if (fail) console.log('Falliti:\n - ' + fails.join('\n - '));
  process.exit(fail ? 1 : 0);
})();
