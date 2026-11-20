// Strumento di manutenzione (non fa parte del gioco): sposta il corpo delle funzioni sostituite nel file originale.
//   node tools/sposta.js nome fileOriginale fileToppa
// Nel file originale, `function nome(...) {...}` prende il corpo della sostituzione `nome = function (...) {...};`
// trovata nel file toppa, che viene cancellata.
const fs = require('fs'), acorn = require('acorn');
const [name, orig, patch] = process.argv.slice(2);
const parse = s => acorn.parse(s, { ecmaVersion: 'latest', sourceType: 'script', ranges: true });
function walk(n, f, parent) { if (!n || typeof n.type !== 'string') return; f(n, parent); for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(c => walk(c, f, n)); else if (v && typeof v.type === 'string') walk(v, f, n); } }
const ps = fs.readFileSync(patch, 'utf8'); let asg = null;
walk(parse(ps), (n, p) => { if (n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression' && n.expression.left.type === 'Identifier' && n.expression.left.name === name && /Function/.test(n.expression.right.type)) asg = n; });
if (!asg) { console.error('sostituzione non trovata:', name, 'in', patch); process.exit(1) }
const fn = asg.expression.right, isAsync = fn.async;
const params = ps.slice(fn.params.length ? fn.params[0].start : fn.body.start, fn.params.length ? fn.params[fn.params.length - 1].end : fn.body.start);
const body = ps.slice(fn.body.start, fn.body.end);
const os = fs.readFileSync(orig, 'utf8'); let decl = null;
walk(parse(os), n => { if (n.type === 'FunctionDeclaration' && n.id && n.id.name === name) decl = n; });
if (!decl) { console.error('funzione originale non trovata:', name, 'in', orig); process.exit(1) }
const lead = os.slice(0, decl.start), comment = `${isAsync ? 'async ' : ''}function ${name}(${fn.params.length ? params : ''}) `;
const nos = lead + comment + body + os.slice(decl.end);
let nps = ps.slice(0, asg.start) + ps.slice(asg.end);
if (orig === patch) { console.error('stesso file'); process.exit(1) }
fs.writeFileSync(orig, nos); fs.writeFileSync(patch, nps);
console.log(`spostata ${name}: ${patch} → ${orig}`);
