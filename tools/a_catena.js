// Strumento di manutenzione (non fa parte del gioco): converte TUTTE le toppe «a involucro» in Ext.avvolgi.
//   node tools/a_catena.js            mostra cosa farebbe
//   node tools/a_catena.js --scrivi   lo fa
//
// Prima:   (file B)  const _x = nome; nome = function (a, b) { ... _x(a, b) ... };
// Dopo:    (file B)  Ext.avvolgi('nome', function (prossimo, a, b) { ... prossimo(a, b) ... });
//          (file A)  function nomeBase(a, b) { ...il corpo di sempre... }
//                    function nome(...a) { return Ext.catena('nome', nomeBase, this, a); }
// L'ordine resta lo stesso: l'ultimo involucro registrato è il più esterno, come quando ognuno
// riassegnava la funzione. Le toppe «per nome» (window[nome] = ...) si convertono a mano; i loro nomi
// vanno passati con --anche=nome1,nome2 perché anche quelle funzioni diventino catene.
'use strict';
const fs = require('fs'),
  acorn = require('acorn');
const scrivi = process.argv.includes('--scrivi'),
  anche = (process.argv.find(a => a.startsWith('--anche=')) || '--anche=').slice(8).split(',').filter(Boolean);
const html = fs.readFileSync('index.html', 'utf8'),
  files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]),
  src = Object.fromEntries(files.map(f => [f, fs.readFileSync(f, 'utf8')])),
  parse = s => acorn.parse(s, { ecmaVersion: 'latest', locations: true });
function walk(n, f) {
  if (!n || typeof n.type !== 'string') return;
  f(n);
  for (const k in n) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach(c => walk(c, f));
    else if (v && typeof v.type === 'string') walk(v, f);
  }
}
// dove è dichiarata ogni funzione
const defs = {};
for (const f of files)
  for (const n of parse(src[f]).body) if (n.type === 'FunctionDeclaration') defs[n.id.name] = defs[n.id.name] || f;

// 1. le toppe
const edits = Object.fromEntries(files.map(f => [f, []])),
  nomi = new Set(anche),
  problemi = [];
for (const f of files) {
  const s = src[f];
  walk(parse(s), n => {
    if (!Array.isArray(n.body)) return;
    const B = n.body;
    for (let i = 0; i < B.length - 1; i++) {
      const a = B[i],
        b = B[i + 1];
      if (
        !(
          a.type === 'VariableDeclaration' &&
          a.declarations.length === 1 &&
          a.declarations[0].init &&
          a.declarations[0].init.type === 'Identifier' &&
          defs[a.declarations[0].init.name] &&
          defs[a.declarations[0].init.name] !== f
        )
      )
        continue;
      const nome = a.declarations[0].init.name,
        x = a.declarations[0].id.name;
      if (
        !(
          b.type === 'ExpressionStatement' &&
          b.expression.type === 'AssignmentExpression' &&
          b.expression.left.type === 'Identifier' &&
          b.expression.left.name === nome &&
          /Function/.test(b.expression.right.type)
        )
      ) {
        problemi.push(`${f}:${a.loc.start.line} ${nome}: la riassegnazione non segue subito`);
        continue;
      }
      const fn = b.expression.right;
      let corpo = s.slice(fn.body.start, fn.body.end);
      let params = fn.params.map(p => s.slice(p.start, p.end));
      // _x.apply(this, arguments) → prossimo(...argomenti)
      if (/\barguments\b/.test(corpo)) {
        // con parametri semplici: si passano gli stessi parametri, più quelli in eccesso
        if (params.length && !fn.params.every(p => p.type === 'Identifier')) {
          problemi.push(`${f}:${a.loc.start.line} ${nome}: usa arguments e parametri complessi`);
          continue;
        }
        const pn = params.length ? params.join(', ') + ', ...altri' : '...argomenti';
        corpo = corpo.replace(
          new RegExp(`\\b${x}\\.apply\\(this, arguments\\)`, 'g'),
          `${x}(${params.length ? params.join(', ') + ', ...altri' : '...argomenti'})`
        );
        if (/\barguments\b/.test(corpo)) {
          problemi.push(`${f}:${a.loc.start.line} ${nome}: arguments usato in altro modo`);
          continue;
        }
        params = [pn];
      }
      if (/\bthis\b/.test(corpo)) {
        problemi.push(`${f}:${a.loc.start.line} ${nome}: usa this`);
        continue;
      }
      const nuovo = /\bprossimo\b/.test(corpo) ? x : 'prossimo';
      corpo = corpo.replace(new RegExp(`\\b${x}\\b`, 'g'), nuovo);
      edits[f].push([
        a.start,
        b.end,
        `Ext.avvolgi('${nome}', ${fn.async ? 'async ' : ''}function (${[nuovo, ...params].join(', ')}) ${corpo});`
      ]);
      nomi.add(nome);
    }
  });
}
// 2. le funzioni avvolte diventano catene
for (const nome of nomi) {
  const f = defs[nome];
  if (!f) {
    problemi.push(`${nome}: dichiarazione non trovata`);
    continue;
  }
  let decl = null;
  for (const n of parse(src[f]).body) if (n.type === 'FunctionDeclaration' && n.id.name === nome) decl = decl || n;
  const base = defs[nome + 'Base'] ? nome + 'Nucleo' : nome + 'Base';
  if (defs[base]) {
    problemi.push(`${nome}: esiste già ${base}`);
    continue;
  }
  const s = src[f],
    testa = s.slice(decl.start, decl.body.start).replace(new RegExp(`function ${nome}\\(`), `function ${base}(`);
  edits[f].push([
    decl.start,
    decl.body.start,
    testa,
    `\n// catena: altri file la avvolgono con Ext.avvolgi('${nome}', …)\nfunction ${nome}(...a) {\n  return Ext.catena('${nome}', ${base}, this, a);\n}\n`,
    decl.end
  ]);
}
// applica: dal fondo verso l'inizio di ogni file
let tot = 0;
for (const f of files) {
  if (!edits[f].length) continue;
  let s = src[f];
  const E = edits[f].sort((p, q) => q[0] - p[0]);
  for (const e of E) {
    if (e.length === 3) s = s.slice(0, e[0]) + e[2] + s.slice(e[1]);
    else {
      // rinomina la testa e aggiunge la catena subito dopo la fine della funzione
      const fine = e[4] + (e[2].length - (e[1] - e[0]));
      s = s.slice(0, e[0]) + e[2] + s.slice(e[1]);
      s = s.slice(0, fine) + '\n' + e[3] + s.slice(fine);
    }
    tot++;
  }
  console.log(`${f}: ${E.length}`);
  if (scrivi) fs.writeFileSync(f, s);
}
console.log(`${tot} modifiche, ${nomi.size} funzioni a catena${scrivi ? '' : ' (prova: aggiungi --scrivi)'}`);
if (problemi.length) console.log('DA FARE A MANO:\n - ' + problemi.join('\n - '));
