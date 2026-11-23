'use strict';
// 5. Toppe: un file che sovrascrive una funzione definita in un altro file è fragile (l'ordine di caricamento
// decide chi vince). Questo test conta le toppe e non permette che aumentino: per aggiungere comportamento
// a una funzione di un altro file si usa Ext.on(...) o Ext.avvolgi(...) (vedi js/core.js). Il tetto è zero.
const fs = require('fs'),
  path = require('path');
const MAX = require('./toppe.json');
module.exports = async function (t, { ROOT }) {
  let acorn;
  try {
    acorn = require('acorn');
  } catch (e) {
    t.fail('serve acorn (npm install)');
    return;
  }
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]);
  const defs = {},
    asts = {};
  const walk = (n, f) => {
    if (!n || typeof n.type !== 'string') return;
    f(n);
    for (const k in n) {
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => walk(c, f));
      else if (v && typeof v.type === 'string') walk(v, f);
    }
  };
  for (const f of files) {
    asts[f] = acorn.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'), { ecmaVersion: 'latest' });
    for (const n of asts[f].body)
      if (n.type === 'FunctionDeclaration') defs[n.id.name] = defs[n.id.name] || f;
  }
  const found = [];
  for (const f of files)
    walk(asts[f], n => {
      if (n.type !== 'AssignmentExpression') return;
      if (
        n.left.type === 'Identifier' &&
        defs[n.left.name] &&
        defs[n.left.name] !== f &&
        (/Function/.test(n.right.type) || n.right.type === 'CallExpression')
      )
        found.push(`${n.left.name} ← ${f}`);
      // anche le sostituzioni per nome: window[nome] = …, window.nome = …
      const L = n.left;
      if (
        L.type === 'MemberExpression' &&
        L.object.type === 'Identifier' &&
        ['window', 'globalThis', 'self'].includes(L.object.name) &&
        (L.computed || defs[L.property.name])
      )
        found.push(`${L.computed ? '[…]' : L.property.name} ← ${f} (per nome)`);
    });
  const per = {};
  for (const x of found) {
    const [, f] = x.split(' ← ');
    per[f] = (per[f] || 0) + 1;
  }
  t.true(
    `toppe: ${found.length} (tetto ${MAX.totale}) — per aggiungere usa Ext.on o Ext.avvolgi`,
    found.length <= MAX.totale
  );
  if (found.length < MAX.totale)
    console.log(`    (le toppe sono scese a ${found.length}: abbassa il tetto in tests/toppe.json)`);
  if (process.env.TOPPE) console.log(found.join('\n'));
};

// 6. Scritture incrociate: un file non cambia le variabili dichiarate in un altro (con i moduli JavaScript
// non sarà permesso). Chi deve cambiarle chiama una funzione del file che le possiede.
const scritture = async function (t, { ROOT }) {
  let escope, acorn;
  try {
    escope = require('eslint-scope');
    acorn = require('acorn');
  } catch (e) {
    t.fail('serve eslint-scope (npm install)');
    return;
  }
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]);
  const def = {},
    S = {};
  for (const f of files) {
    const ast = acorn.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'), {
      ecmaVersion: 'latest',
      ranges: true
    });
    S[f] = escope.analyze(ast, { ecmaVersion: 2022 });
    for (const v of S[f].globalScope.variables) if (v.defs.length && !def[v.name]) def[v.name] = f;
  }
  const L = [];
  for (const f of files)
    for (const r of S[f].globalScope.through) {
      const n = r.identifier.name;
      if (r.isWrite() && def[n] && def[n] !== f) L.push(`${n} (di ${def[n]}) ← ${f}`);
    }
  t.true('nessun file scrive le variabili di un altro' + (L.length ? ': ' + L.join(', ') : ''), !L.length);
  // 7. Riferimenti all'indietro: nomi usati da un file ma dichiarati in un file caricato DOPO di lui.
  // Finché ce ne sono, i file non possono diventare moduli JavaScript (partirebbero in un altro ordine).
  // Il tetto (tests/toppe.json, «indietro») può solo scendere: vedi node tools/dipendenze.js.
  const pos = Object.fromEntries(files.map((f, i) => [f, i])),
    dietro = new Set();
  for (const f of files)
    for (const r of S[f].globalScope.through) {
      const d = def[r.identifier.name];
      if (d && pos[d] > pos[f]) dietro.add(f + '→' + r.identifier.name);
    }
  t.true(`riferimenti all'indietro: ${dietro.size} (tetto ${MAX.indietro})`, dietro.size <= MAX.indietro);
  if (dietro.size < MAX.indietro)
    console.log(
      `    (i riferimenti all'indietro sono scesi a ${dietro.size}: abbassa il tetto in tests/toppe.json)`
    );
};
const _toppe = module.exports;
module.exports = async (t, o) => {
  await _toppe(t, o);
  await scritture(t, o);
};
