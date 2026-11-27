'use strict';
// 1. Ogni file JS è sintatticamente valido; index.html e il service worker elencano gli stessi file, nello stesso ordine.
const fs = require('fs'),
  path = require('path'),
  { execFileSync } = require('child_process');
module.exports = async function (t, { ROOT }) {
  const js = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'));
  for (const f of js) {
    try {
      execFileSync(process.execPath, ['--check', path.join(ROOT, 'js', f)], { stdio: 'pipe' });
      t.ok('sintassi ' + f);
    } catch (e) {
      t.fail(
        'sintassi ' + f,
        String(e.stderr || e.message)
          .split('\n')
          .slice(0, 4)
          .join('\n')
      );
    }
  }
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
    sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const inHtml = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]);
  const core = (sw.match(/const CORE=\[([^\]]*)\]/) || [])[1] || '';
  const inSw = [...core.matchAll(/'(js\/[^']+)'/g)].map(m => m[1]);
  t.eq('index.html e sw.js caricano gli stessi script nello stesso ordine', inSw.join(','), inHtml.join(','));
  const missing = js.map(f => 'js/' + f).filter(f => !inHtml.includes(f));
  t.eq('nessun file JS dimenticato fuori da index.html', missing.join(','), '');
  // due file che dichiarano lo stesso nome globale (const, let, function, class): con const/let la pagina non parte
  // («already declared»), con function vince l'ultima e l'altra sparisce in silenzio
  const acorn = require('acorn'),
    visto = {},
    doppi = [];
  for (const f of inHtml) {
    const ast = acorn.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'), { ecmaVersion: 2022 });
    for (const n of ast.body) {
      const nomi =
        n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration'
          ? [n.id.name]
          : n.type === 'VariableDeclaration' && n.kind !== 'var'
            ? n.declarations.map(d => d.id.name).filter(Boolean)
            : [];
      for (const x of nomi) {
        if (visto[x] && visto[x] !== f) doppi.push(`${x} (${visto[x]}, ${f})`);
        visto[x] = visto[x] || f;
      }
    }
  }
  t.eq('nessun nome globale dichiarato in due file', doppi.join(', '), '');
};
