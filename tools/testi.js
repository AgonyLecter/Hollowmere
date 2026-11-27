'use strict';
// I testi del gioco da tradurre: legge i file JS (quelli di index.html, senza i disegni *_mano.js) e raccoglie ogni
// frase italiana scritta nel codice. I pezzi variabili dei template (`Spedite ${n} × ${nome}`) diventano {0}, {1}…
// e i template con dentro dei tag HTML si spezzano nei pezzi di testo fra un tag e l'altro (come li vede la pagina).
//   node tools/testi.js                 riepilogo: quante frasi, quante tradotte in inglese, per file
//   node tools/testi.js mancanti FILE   le frasi di FILE ancora da tradurre (JSON pronto da riempire)
// Il dizionario inglese sta in js/lingua_en*.js (TRAD.en). Lo usa anche il test «lingua».
const fs = require('fs'),
  path = require('path'),
  acorn = require('acorn');
const ROOT = path.resolve(__dirname, '..');

// è una frase da leggere? (non un id, un colore, un selettore, un codice)
const LETTERE = /[a-zàèéìòùA-ZÀÈÉÌÒÙ]/;
function frase(s) {
  const t = s.replace(/\{\d+\}/g, '').trim();
  if (t.length < 2 || !LETTERE.test(t)) return false;
  if (!/[a-zàèéìòù]{2,}/.test(t) && !/^[A-ZÀÈÉÌÒÙ][a-zàèéìòù]/.test(t)) return false; // sigle, note musicali, numeri
  if (t === 'use strict' || /^&\w+;$/.test(t)) return false;
  if (
    /^(Key|Arrow|Numpad|Digit)\w*$|^(Enter|Space|Escape|Tab|Equal|Minus|Backspace|Shift\w*|Control\w*)$/.test(
      t
    )
  )
    return false;
  if (/^[\w-]+\(.*\)$/.test(t) || /^\(.*:.*\)$/.test(t) || /\|$/.test(t)) return false; // css, media query, separatori
  if (/^[#.]?[\w-]+$/.test(t) && !/[A-ZÀÈÉÌÒÙ]/.test(t[0])) return false; // id, classi, chiavi
  if (/^#[0-9a-f]{3,8}$/i.test(t)) return false;
  if (/^(https?:|data:|\.\/|js\/|css\/|icons\/)/.test(t)) return false;
  if (/^[\w.-]+\.(js|png|css|html|json|wav|mp3|ogg)$/.test(t)) return false;
  if (/^(rgba?|hsla?)\(/.test(t)) return false;
  if (/^[\d\s.,:%px()+\-*/]+$/.test(t)) return false;
  if (/^[\w-]+(\s[\w-]+)*$/.test(t) && /[_]/.test(t)) return false; // chiavi_con_trattino
  if (
    /^(bold|italic|normal|center|left|right|top|bottom|middle|alphabetic|source-over|lighter|multiply|screen)$/.test(
      t
    )
  )
    return false;
  if (/^\d*px\s/.test(t) || /monospace|sans-serif|Silkscreen|Pixelify/.test(t)) return false; // font del canvas
  // una parola sola, minuscola: chiave o nome interno (le parole da mostrare le prende il dizionario dei dati)
  if (/^[a-zàèéìòù]+$/.test(t)) return false;
  return true;
}
// un template: i pezzi di testo fuori dai tag HTML, con {0} {1}… al posto delle espressioni
function pezziTemplate(node, src) {
  let s = '';
  node.quasis.forEach((q, i) => {
    s += q.value.cooked == null ? q.value.raw : q.value.cooked;
    if (i < node.expressions.length) s += '\u0000' + i + '\u0000';
  });
  return pezziHtml(s);
}
// spezza ai tag: «<b>X</b>: il prossimo tra <b>Y</b>.» → ["X", ": il prossimo tra ", "Y", "."] (con {n} rinumerati)
function pezziHtml(s) {
  const out = [],
    html = /<[a-z/!][^>]*>/i.test(s); // nell'HTML gli spazi e gli a capo contano come uno spazio; nel testo no

  for (let parte of s.split(/<[^>]*>/)) {
    let k = 0;
    const m = {};
    parte = parte.replace(/\u0000(\d+)\u0000/g, (_, i) => '{' + (m[i] ??= k++) + '}');
    parte = parte.replace(/&nbsp;/g, ' ');
    if (frase(parte)) out.push(html ? parte.replace(/\s+/g, ' ').trim() : parte.trim());
  }
  return out;
}
function fileDelGioco() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="(js\/[^"]+)"/g)]
    .map(m => m[1])
    .filter(f => !/_mano\.js$|\/lingua/.test(f));
}
function estrai(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8'),
    chiavi = new Set();
  const ast = acorn.parse(src, { ecmaVersion: 2022 });
  (function giro(n, padre) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Literal' && typeof n.value === 'string') {
      // le chiavi degli oggetti e gli argomenti di funzioni tecniche non sono frasi
      const tecnico =
        (padre && padre.type === 'Property' && padre.key === n && !padre.computed) ||
        (padre &&
          padre.type === 'CallExpression' &&
          padre.callee &&
          /^(querySelector(All)?|getElementById|\$|segnala|rete|atteso|addEventListener|getItem|setItem)$/.test(
            padre.callee.name || (padre.callee.property && padre.callee.property.name) || ''
          ));
      // le conversazioni fra abitanti: «tra» sono i nomi, e ogni riga è «chi: battuta» (si mostra solo la battuta)
      const tra = padre && padre.type === 'Property' && padre.value === n && (padre.key.name || padre.key.value) === 'tra';
      // (anche nella forma corta t('agatha clara', 'agatha: …', …): il primo argomento sono i nomi)
      const nomi =
        padre && padre.type === 'CallExpression' && padre.arguments[0] === n && /^[a-z]+( [a-z]+)+$/.test(n.value);
      if (nomi) return;
      const v = /^[a-z]+: /.test(n.value) ? n.value.replace(/^[a-z]+: /, '') : n.value;
      if (!tecnico && !tra) for (const p of pezziHtml(v)) chiavi.add(p);
    } else if (n.type === 'TemplateLiteral') {
      for (const p of pezziTemplate(n, src)) chiavi.add(p);
    }
    for (const k of Object.keys(n)) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(x => giro(x, n));
      else if (v && typeof v.type === 'string') giro(v, n);
    }
  })(ast, null);
  return chiavi;
}
// il dizionario inglese: si carica come lo carica il gioco
function dizionario() {
  const TRAD = { en: {} };
  for (const f of fs
    .readdirSync(path.join(ROOT, 'js'))
    .filter(f => /^lingua_en.*\.js$/.test(f))
    .sort()) {
    new Function('TRAD', fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'))(TRAD);
  }
  return TRAD.en;
}
// le frasi dell'indice di partenza (index.html): titolo, menu, schermata di caricamento
function testiHtml() {
  const html = fs
    .readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/g, '');
  const out = new Set();
  for (const m of html.matchAll(/>([^<>]+)</g)) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (frase(t) || /^[A-ZÀ-Ù][a-zà-ù]+$/.test(t)) out.add(t);
  }
  for (const m of html.matchAll(/\btitle="([^"]+)"/g)) out.add(m[1]);
  return out;
}
function tutte() {
  const per = {};
  per['index.html'] = testiHtml();
  for (const f of fileDelGioco()) per[f] = estrai(f);
  return per;
}
module.exports = { tutte, dizionario, frase, fileDelGioco };

if (require.main === module) {
  const per = tutte(),
    D = dizionario(),
    [cmd, quale] = process.argv.slice(2);
  if (cmd === 'mancanti') {
    const k = [...(per[quale] || per['js/' + quale] || [])].filter(x => D[x] == null);
    console.log(JSON.stringify(Object.fromEntries(k.map(x => [x, ''])), null, 1));
    return;
  }
  let tot = 0,
    fatte = 0,
    parole = 0;
  const righe = [];
  for (const [f, set] of Object.entries(per)) {
    const k = [...set],
      ok = k.filter(x => D[x] != null).length,
      w = k.reduce((a, x) => a + x.split(/\s+/).length, 0);
    tot += k.length;
    fatte += ok;
    parole += w;
    righe.push([f, k.length, ok, w]);
  }
  righe.sort((a, b) => b[3] - a[3]);
  for (const [f, n, ok, w] of righe)
    console.log(`${f.padEnd(28)} ${String(ok).padStart(5)}/${String(n).padEnd(5)} ${w} parole`);
  console.log(
    `\nTotale: ${fatte}/${tot} frasi tradotte (${((100 * fatte) / Math.max(1, tot)).toFixed(1)}%), ${parole} parole`
  );
}
