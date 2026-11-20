// Cancella da un file le toppe `const _x = nome; nome = function (...) {...};` (codice morto dopo uno spostamento).
//   node tools/togli_toppa.js nome file...
const fs=require('fs'),acorn=require('acorn');const [name,...files]=process.argv.slice(2);
function walk(n,f){if(!n||typeof n.type!=='string')return;f(n);for(const k in n){const v=n[k];if(Array.isArray(v))v.forEach(c=>walk(c,f));else if(v&&typeof v.type==='string')walk(v,f)}}
for(const file of files){let s=fs.readFileSync(file,'utf8');const cut=[];
 walk(acorn.parse(s,{ecmaVersion:'latest'}),n=>{if(!n.body||!Array.isArray(n.body))return;const B=n.body;for(let i=0;i<B.length-1;i++){const a=B[i],b=B[i+1];
  if(a.type==='VariableDeclaration'&&a.declarations.length===1&&a.declarations[0].init&&a.declarations[0].init.type==='Identifier'&&a.declarations[0].init.name===name&&b.type==='ExpressionStatement'&&b.expression.type==='AssignmentExpression'&&b.expression.left.name===name)cut.push([a.start,b.end])}});
 if(!cut.length){console.error('nessuna toppa di',name,'in',file);process.exit(1)}
 for(const [a,b] of cut.sort((x,y)=>y[0]-x[0]))s=s.slice(0,a)+s.slice(b);fs.writeFileSync(file,s);console.log('tolta toppa',name,'da',file,'('+cut.length+')')}
