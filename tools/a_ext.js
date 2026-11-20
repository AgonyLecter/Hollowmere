// Converte le toppe di una funzione in iscrizioni Ext.on e rende la funzione originale un punto di estensione.
//   node tools/a_ext.js nome fileOriginale
// Toppa "dopo"      (prima riga: _x(...))              → Ext.on('nome', ...)
// Toppa "prima"     (ultima riga: _x(...))             → Ext.on('nome:prima', ...)
// Toppa "intercetta" (ultima riga: return _x(...))     → Ext.on('nome:intercetta', ...)
const fs=require('fs'),path=require('path'),acorn=require('acorn');const [name,orig]=process.argv.slice(2);
const html=fs.readFileSync('index.html','utf8');const files=[...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m=>m[1]);
function walk(n,f){if(!n||typeof n.type!=='string')return;f(n);for(const k in n){const v=n[k];if(Array.isArray(v))v.forEach(c=>walk(c,f));else if(v&&typeof v.type==='string')walk(v,f)}}
const isCallTo=(e,x)=>e&&e.type==='CallExpression'&&((e.callee.type==='Identifier'&&e.callee.name===x)||(e.callee.type==='MemberExpression'&&e.callee.object.type==='Identifier'&&e.callee.object.name===x&&['apply','call'].includes(e.callee.property.name)));
const kinds=new Set();let total=0;
for(const file of files){if(file===orig)continue;let s=fs.readFileSync(file,'utf8');const edits=[];
 walk(acorn.parse(s,{ecmaVersion:'latest'}),n=>{if(!Array.isArray(n.body))return;const B=n.body;for(let i=0;i<B.length-1;i++){const a=B[i],b=B[i+1];
  if(!(a.type==='VariableDeclaration'&&a.declarations.length===1&&a.declarations[0].init&&a.declarations[0].init.type==='Identifier'&&a.declarations[0].init.name===name))continue;
  if(!(b.type==='ExpressionStatement'&&b.expression.type==='AssignmentExpression'&&b.expression.left.name===name&&/Function/.test(b.expression.right.type)))continue;
  const x=a.declarations[0].id.name,fn=b.expression.right,st=fn.body.body;let kind,keep;
  if(st.length&&st[0].type==='ExpressionStatement'&&isCallTo(st[0].expression,x)){kind='';keep=[st[0].end,fn.body.end-1,'start']}
  else if(st.length&&st[st.length-1].type==='ExpressionStatement'&&isCallTo(st[st.length-1].expression,x)){kind=':prima';keep=[fn.body.start+1,st[st.length-1].start,'end']}
  else if(st.length&&st[st.length-1].type==='ReturnStatement'&&isCallTo(st[st.length-1].argument,x)){kind=':intercetta';keep=[fn.body.start+1,st[st.length-1].start,'end']}
  else{console.error('NON CONVERTIBILE',file,name);process.exit(1)}
  const inner=kind===''?s.slice(st[0].end,fn.body.end-1):s.slice(fn.body.start+1,st[st.length-1].start);
  if(new RegExp('\\b'+x+'\\b').test(inner)){console.error('usa ancora '+x+' in',file);process.exit(1)}
  const params=fn.params.length?s.slice(fn.params[0].start,fn.params[fn.params.length-1].end):'';
  edits.push([a.start,b.end,`Ext.on('${name}${kind}', ${fn.async?'async ':''}function (${params}) {${inner}});`]);kinds.add(kind)}});
 for(const [a,b,t] of edits.sort((p,q)=>q[0]-p[0]))s=s.slice(0,a)+t+s.slice(b);if(edits.length){fs.writeFileSync(file,s);total+=edits.length;console.log(`  ${file}: ${edits.length}`)}}
// la funzione originale diventa il punto di estensione
let o=fs.readFileSync(orig,'utf8');let decl=null;walk(acorn.parse(o,{ecmaVersion:'latest'}),n=>{if(n.type==='FunctionDeclaration'&&n.id.name===name&&!decl)decl=n});
const params=decl.params.length?o.slice(decl.params[0].start,decl.params[decl.params.length-1].end):'',args=decl.params.map(p=>p.type==='Identifier'?p.name:(p.left&&p.left.name)).join(', ');
const wrap=`// punto di estensione: gli altri file si iscrivono con Ext.on('${name}…') invece di sovrascriverla\n${decl.async?'async ':''}function ${name}(${params}) {\n${kinds.has(':prima')?`  Ext.runPrima('${name}:prima', ${args});\n`:''}${kinds.has(':intercetta')?`  const r = Ext.intercetta('${name}:intercetta', ${args});\n  if (r) return r;\n`:''}  const v = ${decl.async?'await ':''}${name}Base(${args});\n${kinds.has('')?`  Ext.run('${name}', ${args});\n`:''}  return v;\n}\n`;
o=o.slice(0,decl.start)+o.slice(decl.start,decl.end).replace(`function ${name}(`,`function ${name}Base(`)+'\n'+wrap+o.slice(decl.end);fs.writeFileSync(orig,o);
console.log(`${name}: ${total} toppe → Ext (${[...kinds].map(k=>k||'dopo').join(', ')})`);
