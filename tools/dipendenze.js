// Strumento di manutenzione: la mappa dei nomi globali condivisi tra i file del gioco.
//   node tools/dipendenze.js            riepilogo per file (definisce / usa da altri / usato da altri)
//   node tools/dipendenze.js --cicli    i gruppi di file che dipendono l'uno dall'altro
//   node tools/dipendenze.js --json     tutto, per altri strumenti
'use strict';
const fs = require('fs'),
  acorn = require('acorn'),
  escope = require('eslint-scope');
const html = fs.readFileSync('index.html', 'utf8'),
  files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]);
const def = {}, // nome → file che lo dichiara per primo
  defs = {}, // file → nomi dichiarati
  usa = {}; // file → Set di nomi non dichiarati nel file
for (const f of files) {
  const ast = acorn.parse(fs.readFileSync(f, 'utf8'), { ecmaVersion: 'latest', ranges: true }),
    sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'script' }),
    g = sm.globalScope;
  defs[f] = g.variables.filter(v => v.defs.length).map(v => v.name);
  for (const n of defs[f]) def[n] = def[n] || f;
  usa[f] = new Set(g.through.map(r => r.identifier.name));
}
const dip = {}; // file → { altroFile: [nomi] }
for (const f of files) {
  dip[f] = {};
  for (const n of usa[f]) {
    const d = def[n];
    if (!d || d === f) continue;
    (dip[f][d] = dip[f][d] || []).push(n);
  }
}
const arg = process.argv[2];
if (arg === '--json') {
  console.log(JSON.stringify({ files, def, dip }, null, 1));
  process.exit(0);
}
if (arg === '--cicli') {
  // componenti fortemente connesse (Tarjan)
  let i = 0;
  const idx = {}, low = {}, on = new Set(), st = [], C = [];
  const vai = v => {
    idx[v] = low[v] = i++;
    st.push(v);
    on.add(v);
    for (const w of Object.keys(dip[v])) {
      if (idx[w] === undefined) {
        vai(w);
        low[v] = Math.min(low[v], low[w]);
      } else if (on.has(w)) low[v] = Math.min(low[v], idx[w]);
    }
    if (low[v] === idx[v]) {
      const c = [];
      let w;
      do {
        w = st.pop();
        on.delete(w);
        c.push(w);
      } while (w !== v);
      C.push(c);
    }
  };
  for (const f of files) if (idx[f] === undefined) vai(f);
  const grandi = C.filter(c => c.length > 1).sort((a, b) => b.length - a.length);
  console.log(`${grandi.length} gruppi di file intrecciati; il più grande ne ha ${grandi[0] ? grandi[0].length : 0}`);
  for (const c of grandi) console.log(' - ' + c.map(f => f.slice(3)).join(' '));
  console.log('file indipendenti dagli altri del gruppo: ' + C.filter(c => c.length === 1).length);
  process.exit(0);
}
const usatoDa = {};
for (const f of files) for (const d in dip[f]) (usatoDa[d] = usatoDa[d] || new Set()).add(f);
let tot = 0;
for (const f of files) {
  const n = Object.values(dip[f]).reduce((s, L) => s + L.length, 0);
  tot += defs[f].length;
  console.log(
    `${f.slice(3).padEnd(22)} definisce ${String(defs[f].length).padStart(4)} · usa ${String(n).padStart(4)} nomi da ${String(Object.keys(dip[f]).length).padStart(2)} file · usato da ${String((usatoDa[f] || new Set()).size).padStart(2)} file`
  );
}
console.log(`totale nomi globali: ${tot}`);
