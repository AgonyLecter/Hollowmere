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
};
