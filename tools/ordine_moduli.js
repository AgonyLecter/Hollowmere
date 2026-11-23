// Strumento di manutenzione: simula l'ordine in cui partirebbero i file se fossero moduli JavaScript
// (ognuno importa ciò che usa dagli altri) e trova le letture all'avvio di valori non ancora pronti.
//   node tools/ordine_moduli.js
'use strict';
const fs = require('fs'),
  acorn = require('acorn'),
  escope = require('eslint-scope');
const html = fs.readFileSync('index.html', 'utf8'),
  files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]),
  pos = Object.fromEntries(files.map((f, i) => [f, i]));
const def = {},
  tipo = {},
  S = {};
for (const f of files) {
  S[f] = escope.analyze(acorn.parse(fs.readFileSync(f, 'utf8'), { ecmaVersion: 'latest', ranges: true }), {
    ecmaVersion: 2022
  });
  for (const v of S[f].globalScope.variables)
    if (v.defs.length && !def[v.name]) {
      def[v.name] = f;
      tipo[v.name] = v.defs[0].type === 'FunctionName' ? 'funzione' : 'valore';
    }
}
const imp = {};
for (const f of files) {
  const s = new Set();
  for (const r of S[f].globalScope.through) {
    const d = def[r.identifier.name];
    if (d && d !== f) s.add(d);
  }
  imp[f] = [...s].sort((a, b) => pos[a] - pos[b]);
}
// valutazione ESM: prima le dipendenze (in ordine di import), poi il file; i cicli si saltano
const fatto = new Set(),
  inCorso = new Set(),
  ordine = [];
const valuta = f => {
  if (fatto.has(f) || inCorso.has(f)) return;
  inCorso.add(f);
  for (const d of imp[f]) valuta(d);
  inCorso.delete(f);
  fatto.add(f);
  ordine.push(f);
};
for (const f of files) valuta(f);
const quando = Object.fromEntries(ordine.map((f, i) => [f, i]));
// letture eseguite all'avvio (codice in cima o in funzioni chiamate subito)
const alCaricamento = sc => {
  for (let s = sc; s; s = s.upper) {
    if (s.type === 'global') return true;
    if (s.type === 'function') {
      const b = s.block,
        p = b.parent;
      if (!(p && p.type === 'CallExpression' && p.callee === b)) return false;
    }
  }
  return true;
};
const rotte = [];
for (const f of files)
  for (const sc of S[f].scopes) {
    if (!alCaricamento(sc)) continue;
    for (const r of sc.references) {
      const n = r.identifier.name;
      if (r.resolved && r.resolved.scope.type !== 'global') continue;
      const d = def[n];
      if (!d || d === f || tipo[n] !== 'valore') continue;
      if (quando[d] > quando[f]) rotte.push(`${f.slice(3)} legge ${n} (di ${d.slice(3)}) prima che parta`);
    }
  }
const spostati = files.filter((f, i) => ordine[i] !== f).length;
console.log(`file che partirebbero in un ordine diverso da oggi: ${spostati} su ${files.length}`);
console.log(`letture all'avvio che si romperebbero: ${rotte.length}`);
const per = {};
for (const r of rotte) per[r.split(' ')[0]] = (per[r.split(' ')[0]] || 0) + 1;
console.log(Object.entries(per).sort((a, b) => b[1] - a[1]).map(x => x.join(': ')).join('  '));
if (process.argv.includes('--tutte')) console.log(rotte.join('\n'));
