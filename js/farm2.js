'use strict';
// ================= FARMING E COSTRUZIONE, LIVELLO DUE =================
// Abilità con vantaggi, macchine che trasformano i raccolti, alberi da frutto, lastricato, muretti, aiuole.

// ---------- abilità ----------
const SKILLS={agri:{n:'Agricoltura',ico:'🌱'},racc:{n:'Raccolta',ico:'🪓'},arti:{n:'Artigianato',ico:'🔨'}};
const SK_XP=[0,60,160,320,560,900,1350,1950,2700,3700];
const SK_PERK={agri:{2:'Raccolti venduti al 10% in più',4:'Più raccolti abbondanti',6:'L\'annaffiatoio bagna tre zolle',8:'Raccolti venduti al 25% in più',10:'A volte una pianta cresce due tacche in una notte'},
 racc:{2:'Abbattere e spaccare costa meno energia',4:'+1 legna e pietra a ogni colpo finale',6:'Più minerale di ferro dalle rocce',8:'A volte i selvatici sono doppi',10:'Gli alberi ricrescono in metà tempo'},
 arti:{2:'Sblocca l\'irrigatore grande',3:'Sblocca il barattolo delle conserve',4:'Sblocca la botte e l\'apiario',6:'Sblocca muretti e aiuole',8:'Le macchine lavorano un giorno prima'}};
const skLv=(k,st)=>{st=st||G.st;const x=((st.free&&st.free.xp)||{})[k]||0;let l=1;for(let i=1;i<SK_XP.length;i++)if(x>=SK_XP[i])l=i+1;return l};
function addXP(k,n){const st=G.st;if(!isFree(st)||G.visit)return;st.free.xp=st.free.xp||{};const before=skLv(k);st.free.xp[k]=(st.free.xp[k]||0)+n;const after=skLv(k);
 if(after>before){AU.play('ok');UI.toast(`${SKILLS[k].ico} ${SKILLS[k].n}: livello ${after}!${SK_PERK[k][after]?' '+SK_PERK[k][after]+'.':''}`);floatText('LIVELLO '+after,G.player.x,G.player.y-34,'#f6d98a',2.4)}}
function skillsHTML(){const st=G.st,X=(st.free&&st.free.xp)||{};return Object.entries(SKILLS).map(([k,s])=>{const l=skLv(k),x=X[k]||0,nx=SK_XP[l]||null,pv=SK_XP[l-1]||0,pc=nx?Math.round((x-pv)/(nx-pv)*100):100;
 return `<h3>${s.ico} ${s.n} — livello ${l}</h3><div style="height:calc(5*var(--u));background:#d8c49a;box-shadow:inset 0 0 0 var(--u) #7a4a20"><div style="height:100%;width:${pc}%;background:linear-gradient(#a8d860,#5a9a2a)"></div></div><p class="small">${nx?`${x}/${nx} punti esperienza`:'Livello massimo'}<br>${Object.entries(SK_PERK[k]).map(([lv,t])=>`<span style="opacity:${l>=+lv?1:.5}">${l>=+lv?'✔':'✦'} Liv. ${lv}: ${t}</span>`).join('<br>')}</p>`}).join('')}

// ---------- minerale, fornace, lingotti ----------
Object.assign(ITEMS,{
 ferro:{n:'Minerale di ferro',t:'res',d:'Dalle rocce, a volte. Nella fornace diventa lingotto.'},lingotto:{n:'Lingotto di ferro',t:'res',d:'Serve per le macchine e l\'irrigatore grande.'},
 lastre:{n:'Lastre di pietra',t:'place',p:12,d:'Per lastricare i vialetti. Tienile in mano e usale sull\'erba delle tue terre.'},
 fornace:{n:'Fornace',t:'place',d:'5 minerali di ferro e 1 legna: il mattino dopo, un lingotto.'},
 barattolo:{n:'Barattolo delle conserve',t:'place',d:'Un raccolto dentro, il giorno dopo una conserva che vale molto di più.'},
 botte:{n:'Botte',t:'place',d:'Frutta dentro: in tre giorni, succo da vendere caro.'},
 apiario:{n:'Apiario',t:'place',d:'Ogni tre giorni, miele. Le api amano i fiori: d\'inverno dormono.'},
 irrigatore2:{n:'Irrigatore grande',t:'place',d:'Ogni mattina bagna le otto zolle intorno.'},
 aiuola:{n:'Aiuola',t:'place',d:'Fiori di stagione, davanti a casa.'},muretto:{n:'Muretto a secco',t:'place',d:'Pietre una sull\'altra, come facevano i fondatori.'},
 miele:{n:'Miele',t:'crop',v:140},
 alb_melo:{n:'Alberello di melo',t:'place',tree:'mela',p:300,d:'Matura in 12 giorni. Mele in autunno.'},alb_pero:{n:'Alberello di pero',t:'place',tree:'pera',p:300,d:'Matura in 12 giorni. Pere in autunno.'},
 alb_ciliegio:{n:'Alberello di ciliegio',t:'place',tree:'ciliegie',p:320,d:'Matura in 12 giorni. Ciliegie in primavera.'},alb_pesco:{n:'Alberello di pesco',t:'place',tree:'pesca',p:320,d:'Matura in 12 giorni. Pesche d\'estate.'},
 mela:{n:'Mela',t:'crop',v:70},pera:{n:'Pera',t:'crop',v:75},ciliegie:{n:'Ciliegie',t:'crop',v:90},pesca:{n:'Pesca',t:'crop',v:85},
});
Object.assign(PL,{mela:'mele',pera:'pere',ciliegie:'cestini di ciliegie',pesca:'pesche',miele:'vasetti di miele'});Object.assign(SG,{mela:'una mela',pera:'una pera',ciliegie:'un cestino di ciliegie',pesca:'una pesca',miele:'un vasetto di miele'});
Object.assign(PLACE_TOOL,{fornace:'piccone',barattolo:'accetta',botte:'accetta',apiario:'accetta',irrigatore2:'piccone',aiuola:'pala',muretto:'piccone'});
const FRUIT={mela:{s:[0],c:'#d8302a'},pera:{s:[0],c:'#c8c83a'},ciliegie:{s:[2],c:'#a8102a'},pesca:{s:[3],c:'#f0a060'}};
const JUICY=['fragola','anguria','more','fragoline','pomodoro','mela','pera','ciliegie','pesca'];
// conserve e succhi: un prodotto per ogni raccolto
function makeProducts(){for(const id of Object.keys(ITEMS)){const it=ITEMS[id];if(it.t!=='crop'||id.startsWith('cons_')||id.startsWith('succo_')||id==='miele'||id==='uovo'||id==='latte')continue;
 ITEMS['cons_'+id]={n:'Conserva di '+it.n.toLowerCase(),t:'crop',v:Math.round(it.v*2+30),pre:id};if(JUICY.includes(id))ITEMS['succo_'+id]={n:'Succo di '+it.n.toLowerCase(),t:'crop',v:Math.round(it.v*3+20),pre:id}}}
makeProducts();
// ricette del banco, divise per categoria; lv: livello di Artigianato richiesto
CRAFTS.forEach(r=>r.cat=r.cat||({recinto:'est',concime:'agr',cassa:'cas',panchina:'est',lampione:'est',irrigatore:'agr',banco:'cas',fieno:'agr',pollaio:'edi',stalla:'edi'}[r.id]||'cas'));
CRAFTS.push({id:'lastre',q:4,c:{pietra:3},cat:'est'},{id:'fornace',q:1,c:{pietra:25,legna:10},cat:'mac'},{id:'barattolo',q:1,c:{legna:15,lingotto:1},cat:'mac',lv:3},
 {id:'botte',q:1,c:{legna:30,lingotto:1},cat:'mac',lv:4},{id:'apiario',q:1,c:{legna:25,fibra:10},cat:'mac',lv:4},{id:'irrigatore2',q:1,c:{lingotto:2,pietra:15,legna:5},cat:'agr',lv:2},
 {id:'aiuola',q:1,c:{pietra:4,fibra:6},cat:'est',lv:6},{id:'muretto',q:2,c:{pietra:6},cat:'est',lv:6});
const CRAFT_CAT={agr:'Campi',mac:'Macchine',edi:'Edifici',est:'Esterni',cas:'Casa'};
function craftMenu(cat){cat=cat||G.craftCat||'agr';G.craftCat=cat;const st=G.st,has=c=>Object.entries(c).every(([k,n])=>countItem(k)>=n);
 const L=CRAFTS.filter(r=>r.cat===cat);
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>Banco da lavoro</h2><div class="tabs">${Object.entries(CRAFT_CAT).map(([k,n])=>`<button class="btn ${k===cat?'on':''}" data-cat="${k}">${n}</button>`).join('')}</div><p class="small">Legna ${countItem('legna')} · Pietra ${countItem('pietra')} · Fibra ${countItem('fibra')} · Ferro ${countItem('ferro')} · Lingotti ${countItem('lingotto')} — Artigianato liv. ${skLv('arti')}</p>`+
  L.map(r=>{const i=CRAFTS.indexOf(r),lock=r.lv&&skLv('arti')<r.lv;return `<div class="mrow"><canvas data-i="${r.id}" width="32" height="32"></canvas><span>${ITEMS[r.id].n}${r.q>1?' ×'+r.q:''}<br><span class="small">${lock?`🔒 Artigianato liv. ${r.lv}`:Object.entries(r.c).map(([k,n])=>`<span style="color:${countItem(k)>=n?'inherit':'#a8301a'}">${n} ${ITEMS[k].n}</span>`).join(' · ')} — ${ITEMS[r.id].d||''}</span></span><button class="btn" data-r="${i}" ${!lock&&has(r.c)?'':'disabled'}>Crea</button></div>`}).join(''));
 $('#mbox').querySelectorAll('canvas[data-i]').forEach(c=>{const i=ICON[c.dataset.i];if(i)c.getContext('2d').drawImage(i,0,0)});
 $('#mbox').querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{UI._mclose=null;craftMenu(b.dataset.cat)});
 $('#mbox').querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const r=CRAFTS[+b.dataset.r];if(!has(r.c)||(r.lv&&skLv('arti')<r.lv))return;if(!addItem(r.id,r.q))return;for(const [k,n] of Object.entries(r.c))removeItem(k,n);AU.play('ok');st.flags.crafted=(st.flags.crafted||0)+1;addXP('arti',8);UI.toast(`Creato: ${ITEMS[r.id].n}${r.q>1?' ×'+r.q:''}`);UI._mclose=null;craftMenu(cat)})}

// ---------- macchine ----------
const MACH={barattolo:{days:1,ok:id=>ITEMS['cons_'+id],out:id=>'cons_'+id,n:'conserva'},botte:{days:3,ok:id=>ITEMS['succo_'+id],out:id=>'succo_'+id,n:'succo'},fornace:{days:1,ok:id=>id==='ferro',need:5,out:()=>'lingotto',n:'lingotto'}};
function machineAct(k,b,o){const st=G.st,it=selItem(),id=it&&it.id,M=MACH[b.id];
 if(b.id==='apiario'){if(b.ready){if(!addItem('miele',b.n||1))return true;b.ready=0;AU.play('pick');floatText(`+${b.n||1} Miele`,o.tx*16+8,o.ty*16-10);addXP('arti',4)}else UI.toast(seasonOf()===1?'Le api dormono. D\'inverno niente miele.':'Le api lavorano. Il miele arriva ogni tre giorni.');return true}
 if(!M)return false;
 if(b.job){if(st.day>=b.job.ready){if(!addItem(b.job.out,b.job.n||1))return true;AU.play('pick');floatText(`+${b.job.n||1} ${ITEMS[b.job.out].n}`,o.tx*16+8,o.ty*16-10);b.job=null;addXP('arti',5)}else UI.toast(`Ci vuole ancora ${b.job.ready-st.day===1?'un giorno':(b.job.ready-st.day)+' giorni'}.`);return true}
 if(!id||!M.ok(id)){UI.toast(b.id==='fornace'?'Ci vogliono 5 minerali di ferro (e 1 legna).':`Tieni in mano ${b.id==='botte'?'della frutta':'un raccolto'} e usalo sulla ${ITEMS[b.id].n.toLowerCase().includes('botte')?'botte':ITEMS[b.id].n.toLowerCase()}.`);return true}
 const need=M.need||1;if(countItem(id)<need){UI.toast(`Ne servono ${need}.`);return true}if(b.id==='fornace'){if(!countItem('legna')){UI.toast('Serve anche 1 legna per il fuoco.');return true}removeItem('legna',1)}
 removeItem(id,need);const fast=skLv('arti')>=8?1:0;b.job={out:M.out(id),ready:st.day+Math.max(1,M.days-fast),n:1};AU.play('plant');UI.toast(`Dentro! Sarà pronto ${b.job.ready-st.day===1?'domani':'tra '+(b.job.ready-st.day)+' giorni'}: ${ITEMS[b.job.out].n}.`);return true}
function machinesMorning(st){if(!isFree(st))return;for(const k in st.free.built){const b=st.free.built[k];
 if(b.id==='apiario'&&seasonOf(st)!==1){b.t=(b.t||0)+1;if(b.t>=3&&!b.ready){b.t=0;b.ready=1;const fl=Object.values(st.free.built).filter(x=>x.id==='aiuola').length;b.n=1+(fl>=2?1:0)}}
 if((ITEMS[b.id]&&ITEMS[b.id].tree)){const age=st.day-b.d,T=FRUIT[ITEMS[b.id].tree],grow=skLv('racc',st)>=10?6:12;if(age>=grow&&T.s.includes(seasonOf(st))&&(b.fruit||0)<3)b.fruit=(b.fruit||0)+1}}}
function drawMachines(m){if(m.id!=='main'||!isFree()||G.visit)return;const st=G.st,bob=Math.round(Math.sin(G.t*4));
 for(const o of m.objs){if(o.kind!=='built')continue;const b=st.free.built[o.bk];if(!b)continue;const rd=(b.job&&st.day>=b.job.ready)||b.ready||((ITEMS[b.id]&&ITEMS[b.id].tree)&&b.fruit>0);if(!rd)continue;
  const X=o.tx*16+8,Y=o.dy-6+bob;ctx.fillStyle='#2a1406';ctx.fillRect(X-5,Y-6,11,10);ctx.fillStyle='#f6d98a';ctx.fillRect(X-4,Y-5,9,8);const ic=ICON[b.job?b.job.out:b.ready?'miele':ITEMS[b.id].tree];if(ic)ctx.drawImage(ic,X-4,Y-5,8,8)}}
// alberi da frutto
const FTC=new Map();
function fruitTreeImg(b){const st=G.st,age=st.day-b.d,grow=skLv('racc')>=10?6:12,s=seasonOf(),fr=b.fruit||0,key=b.id+s+(age>=grow?'T':'S'+Math.min(2,Math.floor(age/4)))+fr;if(FTC.has(key))return FTC.get(key);
 let c;if(age<grow){const st2=Math.min(2,Math.floor(age/4));c=SP(10,12+st2*4,P=>{const h=24+st2*8;P.capsule(10,h-1,10,h-10-st2*4,1+st2*.4,rp('#6a4428'));for(let i=0;i<3+st2*2;i++)P.ellipse(10+Math.cos(i*2.1)*(3+st2),h-12-st2*4+Math.sin(i*2.1)*3,3,2.4,rp(s===1?'#8a7a6a':'#5a9a2a'),{spec:.3})})}
 else{const src=(FREEIMG.trees[s]||FREEIMG.trees[0])[1],w=Math.round(src.width*.72),h=Math.round(src.height*.72);c=document.createElement('canvas');c.width=w;c.height=h;c.s=src.s;c.canopyH=Math.round((src.canopyH||44)*.72);const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,w,h);
  if(fr&&s!==1){const col=FRUIT[ITEMS[b.id].tree].c;srand(b.d*7+fr);for(let i=0;i<fr*4;i++){const a=ri(12,w-12),yy=ri(10,Math.round(h*.45));x.fillStyle='#2a1006';x.fillRect(a-1,yy-1,6,6);x.fillStyle=col;x.fillRect(a,yy,4,4);x.fillStyle='rgba(255,255,255,.6)';x.fillRect(a,yy,1,1)}}}
 FTC.set(key,c);return c}
function treeAct(o,b){const st=G.st,T=ITEMS[b.id].tree;if(b.fruit>0){const n=b.fruit+(skLv('agri')>=4&&Math.random()<.3?1:0);if(!addItem(T,n))return true;b.fruit=0;FTC.clear();rebuildMaps();AU.play('pick');floatText(`+${n} ${ITEMS[T].n}`,o.tx*16+8,o.ty*16-20);addXP('agri',6);return true}
 const age=st.day-b.d,grow=skLv('racc')>=10?6:12;UI.toast(age<grow?`${ITEMS[b.id].n}: maturo tra ${grow-age} giorni.`:`Un albero di ${ITEMS[T].n.toLowerCase()}. Frutti in ${FRUIT[T].s.map(i=>SEASONS[i].toLowerCase()).join(', ')}.`);return true}
// ---------- grafica ----------
function genFarm2Art(){const I=(id,fn)=>{const P=new PX(32,32);fn(P);P.outline();ICON[id]=pxCanvas(P)};const stone=rp('#8a877d'),wood=rp('#8a5a30'),iron=rp('#7a7a82');
 I('ferro',P=>{P.ellipse(16,18,10,8,stone,{spec:.3});for(const [a,b] of [[12,16],[19,20],[17,14]])P.ellipse(a,b,2.4,2,rp('#c8703a'),{spec:.8,edge:false})});
 I('lingotto',P=>{P.body(12,24,()=>16,Y=>8+(Y-12)*.4,iron,{nyF:()=>-.5,spec:.9})});
 I('lastre',P=>{for(const [a,b] of [[6,8],[17,10],[9,19],[19,20]])P.rect(a,b,9,8,rp('#a8a090'),{spec:.3})});
 I('fornace',P=>{P.body(6,29,()=>16,Y=>8+(Y-6)*.2,rp('#7a6a5a'),{nyF:()=>.1,spec:.2});P.ellipse(16,22,5,4,rp('#ff8a2a'),{amb:.95,edge:false});P.rect(13,2,6,6,rp('#5a4a3a'))});
 I('barattolo',P=>{P.body(9,29,()=>16,()=>8,rp('#b8d0d8'),{spec:.8});P.rect(8,6,16,4,rp('#a8743e'));P.rect(10,16,12,8,rp('#d8a84a'),{edge:false})});
 I('botte',P=>{P.body(4,29,()=>16,Y=>9+Math.sin((Y-4)/25*Math.PI)*3,wood,{nyF:()=>.1,mod:woodMod});for(const y of [8,16,25])P.rect(5,y,22,2,iron)});
 I('apiario',P=>{for(let i=0;i<3;i++)P.rect(7,6+i*7,18,7,rp(['#e8c23a','#d8a83a','#c8983a'][i]),{mod:woodMod});P.rect(5,27,22,3,wood);P.rect(13,22,6,3,rp('#2a1a10'))});
 I('irrigatore2',P=>{P.ellipse(16,24,11,4,stone,{spec:.3});P.capsule(16,24,16,9,2.6,rp('#b8883a'),{spec:.8});P.ellipse(16,8,6,3,rp('#d8a84a'),{spec:.8});for(const [a,b] of [[5,5],[27,5],[3,13],[29,13],[16,2]])P.ellipse(a,b,1.2,1.2,rp('#7ab0e8'),{edge:false})});
 I('aiuola',P=>{P.rect(4,18,24,10,rp('#7a6a5a'),{spec:.2});for(let i=0;i<6;i++)P.ellipse(8+i*3.4,15+(i%2)*3,2.4,2.4,rp(['#f0a8c8','#f8f0a0','#c8b8f8'][i%3]),{spec:.4})});
 I('muretto',P=>{for(let r=0;r<3;r++)for(let i=0;i<3;i++)P.ellipse(8+i*8+(r%2)*4,24-r*7,4.4,3.4,rp(['#a8a090','#8a877d','#9a978d'][(i+r)%3]),{spec:.3})});
 I('miele',P=>{P.body(10,29,()=>16,()=>8,rp('#e8a830'),{spec:.8,amb:.7});P.rect(8,7,16,4,rp('#a8743e'))});
 const fr={mela:'#d8302a',pera:'#c8c83a',ciliegie:'#a8102a',pesca:'#f0a060'};for(const [id,c] of Object.entries(fr)){I(id,P=>{if(id==='ciliegie'){P.ellipse(11,21,5,5,rp(c),{spec:.8});P.ellipse(21,21,5,5,rp(c),{spec:.8});P.capsule(11,16,16,5,.7,rp('#4a7a24'));P.capsule(21,16,16,5,.7,rp('#4a7a24'))}else{P.ellipse(16,18,id==='pera'?8:10,id==='pera'?11:10,rp(c),{spec:.7});P.capsule(16,8,17,3,1,rp('#5a3a1e'));P.ellipse(20,6,3,1.6,rp('#5a9a2a'))}});
  I('alb_'+({mela:'melo',pera:'pero',ciliegie:'ciliegio',pesca:'pesco'}[id]),P=>{P.capsule(16,30,16,14,1.6,rp('#6a4428'));for(let i=0;i<5;i++)P.ellipse(16+Math.cos(i*1.3)*6,12+Math.sin(i*1.3)*4,4.4,3.4,rp('#5a9a2a'),{spec:.3});P.ellipse(20,10,2,2,rp(c),{spec:.7})})}
 // conserve e succhi: un barattolo o una bottiglia con il disegno del raccolto
 const jar=(P,bottle)=>{if(bottle){P.body(10,30,()=>16,Y=>Y<14?3:8,rp('#d8e8f0'),{spec:.8});P.rect(13,3,6,7,rp('#a8743e'))}else{P.body(8,30,()=>16,()=>10,rp('#d8e8f0'),{spec:.8});P.rect(6,5,20,4,rp('#a8743e'))}};
 for(const id of Object.keys(ITEMS)){const it=ITEMS[id];if(!it.pre)continue;const bottle=id.startsWith('succo_');const P=new PX(32,32);jar(P,bottle);P.outline();const c=pxCanvas(P),x=c.getContext('2d');x.imageSmoothingEnabled=false;if(ICON[it.pre])x.drawImage(ICON[it.pre],bottle?9:8,bottle?15:11,14,14);ICON[id]=c}
 const S=(w,h,fn)=>SP(w,h,fn);
 FREEIMG.fornace=S(16,22,P=>{P.body(4,44,()=>16,Y=>9+(Y-4)*.14,rp('#7a6a5a'),{nyF:()=>.1,spec:.2,mod:(X,Y,v)=>((X*3+Y*7)%11===0)?v-.2:v});P.ellipse(16,34,6,5,rp('#ff8a2a'),{amb:.95,edge:false});P.rect(12,0,8,6,rp('#5a4a3a'))});
 FREEIMG.barattolo=S(12,14,P=>{P.rect(2,10,20,18,wood,{mod:woodMod});P.body(1,14,()=>12,()=>6,rp('#b8d0d8'),{spec:.8});P.rect(5,0,14,3,rp('#a8743e'))});
 FREEIMG.botte=S(14,18,P=>{P.body(2,34,()=>14,Y=>10+Math.sin((Y-2)/32*Math.PI)*3,wood,{nyF:()=>.1,mod:woodMod});for(const y of [6,17,28])P.rect(1,y,26,2,iron)});
 FREEIMG.apiario=S(14,18,P=>{for(let i=0;i<3;i++)P.rect(3,2+i*9,22,9,rp(['#e8c23a','#d8a83a','#c8983a'][i]),{mod:woodMod});P.rect(1,29,26,4,wood);P.rect(11,24,6,3,rp('#2a1a10'))});
 FREEIMG.irrigatore2=S(14,16,P=>{P.ellipse(14,26,11,4,stone,{spec:.3});P.capsule(14,26,14,10,2.6,rp('#b8883a'),{spec:.8});P.ellipse(14,8,6,3.4,rp('#d8a84a'),{spec:.8})});
 FREEIMG.aiuola=S(16,10,P=>{P.rect(1,8,30,10,rp('#7a6a5a'),{spec:.2});for(let i=0;i<9;i++)P.ellipse(4+i*3.2,6+(i%2)*3,2.4,2.4,rp(['#f0a8c8','#f8f0a0','#c8b8f8','#ffffff'][i%4]),{spec:.4});for(let i=0;i<9;i++)P.capsule(4+i*3.2,9,4+i*3.2,6,.5,rp('#4a8a2a'))});
 FREEIMG.muretto=S(16,12,P=>{for(let r=0;r<3;r++)for(let i=0;i<4;i++)P.ellipse(3+i*8+(r%2)*4,20-r*7,4.6,3.6,rp(['#a8a090','#8a877d','#9a978d'][(i+r)%3]),{spec:.3})})}
