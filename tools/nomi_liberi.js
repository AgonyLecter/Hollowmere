// Elenca, per le funzioni indicate, i nomi usati che non sono dichiarati dentro la funzione (vanno cercati tra i globali).
const fs=require('fs'),acorn=require('acorn');
const pairs=process.argv.slice(2).map(x=>x.split(':'));const out={};
function walk(n,f,p,key){if(!n||typeof n.type!=='string')return;f(n,p,key);for(const k in n){const v=n[k];if(Array.isArray(v))v.forEach(c=>walk(c,f,n,k));else if(v&&typeof v.type==='string')walk(v,f,n,k)}}
for(const [file,name] of pairs){const s=fs.readFileSync(file,'utf8'),ast=acorn.parse(s,{ecmaVersion:'latest'});let fn=null;walk(ast,n=>{if(n.type==='FunctionDeclaration'&&n.id&&n.id.name===name)fn=n});
 const decl=new Set(),used=new Set();
 const pat=p=>{if(!p)return;if(p.type==='Identifier')decl.add(p.name);else if(p.type==='ObjectPattern')p.properties.forEach(q=>pat(q.value||q.argument));else if(p.type==='ArrayPattern')p.elements.forEach(pat);else if(p.type==='AssignmentPattern')pat(p.left);else if(p.type==='RestElement')pat(p.argument)};
 walk(fn,(n,p,key)=>{if(/Function/.test(n.type)){n.params.forEach(pat);if(n.id)decl.add(n.id.name)}if(n.type==='VariableDeclarator')pat(n.id);if(n.type==='CatchClause')pat(n.param);
  if(n.type==='Identifier'){if(p&&p.type==='MemberExpression'&&key==='property'&&!p.computed)return;if(p&&p.type==='Property'&&key==='key'&&!p.computed)return;if(p&&(p.type==='VariableDeclarator'&&key==='id'))return;used.add(n.name)}});
 out[file+':'+name]=[...used].filter(x=>!decl.has(x))}
console.log(JSON.stringify(out));
