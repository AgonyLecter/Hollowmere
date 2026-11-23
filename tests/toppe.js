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
