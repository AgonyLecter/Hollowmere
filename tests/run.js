#!/usr/bin/env node
'use strict';
// Test automatici di Hollowmere.   node tests/run.js            tutti i test
//                                  node tests/run.js dati fumo  solo alcuni
//                                  node tests/run.js --veloce    solo i controlli rapidi (circa un minuto)
//                                  node tests/run.js --paralleli=1  un gruppo alla volta (per cercare un test instabile)
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
  suono: require('./suono'),
  macchine: require('./macchine'),
  mira: require('./mira'),
  zaino: require('./zaino'),
  coop: require('./coop'),
  scimmia: require('./scimmia'),
  storia: require('./storia'),
  gesti: require('./gesti'),
  contenitori: require('./contenitori'),
  animali: require('./animali'),
  compagno: require('./compagno'),
  faccende: require('./faccende'),
  terreno: require('./terreno'),
  ricordi: require('./ricordi'),
  serra: require('./serra'),
  ingegnere: require('./ingegnere'),
  svago: require('./svago'),
  allevamento: require('./allevamento'),
  segreti: require('./segreti'),
  materiali: require('./materiali'),
  online: require('./online'),
  lingua: require('./lingua'),
  emporio: require('./emporio'),
  fucina: require('./fucina'),
  regole: require('./regole'),
  selvatici: require('./selvatici'),
  arredi: require('./arredi'),
  piazza: require('./piazza'),
  pile: require('./pile'),
  gioco: require('./gioco')
};
const args = process.argv.slice(2),
  aggiorna = args.includes('--aggiorna'),
  // --veloce: solo i controlli rapidi (circa un minuto), da usare mentre si lavora
  VELOCI = ['sintassi', 'dati', 'impronta', 'toppe', 'regole', 'fumo', 'terreno'],
  opz = (k, d) => {
    const a = args.find(a => a.startsWith('--' + k + '='));
    return a ? a.split('=')[1] : d;
  },
  pick = args.includes('--veloce') ? VELOCI : args.filter(a => !a.startsWith('--')),
  // quanti gruppi di test girano insieme (ognuno nella sua pagina): --paralleli=N, oppure TEST_PARALLELI
  PAR = Math.max(
    1,
    +opz('paralleli', process.env.TEST_PARALLELI || Math.min(3, require('os').cpus().length))
  );
// un registro per gruppo: le righe si stampano tutte insieme quando il gruppo finisce, così non si mescolano
function registro() {
  const R = { pass: 0, fail: 0, fails: [], righe: [] };
  R.t = {
    ok: n => {
      R.pass++;
      R.righe.push('  ✓ ' + n);
    },
    fail: (n, d) => {
      R.fail++;
      R.fails.push(n);
      R.righe.push('  ✗ ' + n + (d ? '\n      ' + String(d).split('\n').join('\n      ') : ''));
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
  return R;
}
(async () => {
  const nomi = Object.keys(SUITES).filter(n => !pick.length || pick.includes(n));
  for (const n of pick) if (!SUITES[n]) console.log('? gruppo sconosciuto: ' + n);
  // i più lunghi per primi: così finiscono insieme agli altri
  const DURATA = { storia: 9, suono: 8, fumo: 7, scimmia: 6, gazzetta: 5 };
  nomi.sort((a, b) => (DURATA[b] || 0) - (DURATA[a] || 0));
  const browser = await chromium.launch();
  const t0 = Date.now(),
    tot = { pass: 0, fail: 0, fails: [] };
  console.log(`${nomi.length} gruppi, ${Math.min(PAR, nomi.length)} alla volta`);
  try {
    const coda = [...nomi];
    const lavora = async () => {
      for (let name; (name = coda.shift()); ) {
        const R = registro(),
          s0 = Date.now();
        try {
          await SUITES[name](R.t, { ROOT, browser, aggiorna, shot: process.env.SHOT });
        } catch (e) {
          R.t.fail(name + ' si è interrotto', e.stack);
        }
        console.log(`\n▸ ${name} (${((Date.now() - s0) / 1000).toFixed(0)} s)\n` + R.righe.join('\n'));
        tot.pass += R.pass;
        tot.fail += R.fail;
        tot.fails.push(...R.fails.map(f => name + ': ' + f));
      }
    };
    await Promise.all(Array.from({ length: Math.min(PAR, nomi.length) }, lavora));
  } finally {
    await browser.close();
  }
  console.log(
    `\n${tot.fail ? '✗' : '✓'} ${tot.pass} superati, ${tot.fail} falliti · ${((Date.now() - t0) / 1000).toFixed(1)} s`
  );
  if (tot.fail) console.log('Falliti:\n - ' + tot.fails.join('\n - '));
  process.exit(tot.fail ? 1 : 0);
})();
