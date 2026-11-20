'use strict';
// ================= LA VALLE INFINITA — FASE 1: IL VILLAGGIO CHE CRESCE =================
// - Rango del villaggio: Casale → Borgo → Paese → Cittadina → Città → Città ★… (senza fine)
// - Nuove zone a est, oltre il recinto: la Collina (dal Borgo) e il Lago (dal Paese). Si esplorano
//   gratis; le terre lì dentro si comprano dall'Anziano Ezekiel e si coltivano/costruiscono.
// - La pesca: canna da pesca sul Lago e sul fiume.
// - Nuovi abitanti: costruisci una casetta e qualcuno si trasferisce. Ognuno ha un mestiere,
//   una bottega, una richiesta al giorno e un'amicizia da coltivare.

// ---------- rango ----------
const RANKS=[['Casale',0],['Borgo',250],['Paese',800],['Cittadina',1800],['Città',3500]];
const BIG_BUILT={pollaio:30,stalla:40,casetta:45,statua:25,fontana:25,banderuola:15,fornace:10,barattolo:8,botte:8,apiario:10,irrigatore2:6,alb_melo:8,alb_pero:8,alb_ciliegio:8,alb_pesco:8,lampione:4,banco:4};
function villageScore(st){st=st||homeSt();if(!st||!isFree(st))return 0;const W2=st.free;let s=0;
 for(const k in W2.built){const id=W2.built[k].id;s+=BIG_BUILT[id]||1}
 s+=(houseLv(st)-1)*80+Math.max(0,(W2.land||['casa']).length-1)*60+(W2.animals||[]).length*8+Object.keys(W2.recipes||{}).length*4+(W2.residents||[]).length*50+Object.keys(W2.inside||{}).length*2;
 for(const k in SKILLS)s+=skLv(k,st)*6;for(const id in st.friends)s+=Math.max(0,Math.floor((st.friends[id]||0)/2))*3;
 return Math.round(s)}
// oltre la Città il rango continua: una stella ogni 2500 punti
function rankOf(score){let i=0;for(let k=0;k<RANKS.length;k++)if(score>=RANKS[k][1])i=k;const extra=i===RANKS.length-1?Math.floor((score-RANKS[i][1])/2500):0;return i+extra}
function rankName(r){return r<RANKS.length?RANKS[r][0]:'Città '+'★'.repeat(Math.min(5,r-RANKS.length+1))+(r-RANKS.length+1>5?'×'+(r-RANKS.length+1):'')}
function rankNext(r){return r<RANKS.length-1?RANKS[r+1][1]:RANKS[RANKS.length-1][1]+(r-RANKS.length+2)*2500}
const myRank=st=>rankOf(villageScore(st));
const resCap=r=>Math.min(RES_POOL.length,r);   // Borgo 1 abitante, Paese 2, … fino a 8
const RANK_GIFTS={1:'La Collina a est si apre: legna, pietre e terre nuove. E puoi costruire una casetta per un nuovo abitante.',2:'Il Lago si apre: si pesca, e le sue rive si possono comprare.',3:'Un posto in più per un nuovo abitante.',4:'Sei una Città. Da qui ogni 2500 punti di prestigio guadagni una stella.'};

// ---------- le zone a est ----------
const ZONES={
 collina:{n:'La Collina',r:[61,4,96,21],gate:[[60,17],[60,18]],rank:1,d:'Alberi vecchi, pietre grosse, il vento. Da lassù si vede tutta la Valle.'},
 lago:{n:'Il Lago',r:[61,22,96,41],gate:[[60,31],[60,32]],rank:2,d:'Acqua ferma e nera, canne, pesci che nessuno pesca da anni.'},
};
const zoneOpen=(z,st)=>{st=st||G.st;return isFree(st)&&myRank(st)>=ZONES[z].rank};
const inRect=(x,y,[a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d;
const zoneAt=(x,y)=>{for(const z in ZONES)if(inRect(x,y,ZONES[z].r))return z;return null};
Object.assign(PLOTS,{
 collina_o:{n:'Il pendio della Collina',r:[[61,4,78,21]],p:2600,zone:'collina',d:'Prato in salita, sole tutto il giorno. Buono per frutteti.'},
 collina_e:{n:'La cima della Collina',r:[[79,4,96,21]],p:3400,zone:'collina',d:'In alto, dove arriva il vento. Tanto spazio per costruire.'},
 lago_o:{n:'La riva ovest del Lago',r:[[61,22,78,41]],p:3600,zone:'lago',d:'Terra umida e grassa, vicino all\'acqua.'},
 lago_e:{n:'La riva est del Lago',r:[[79,22,96,41]],p:4400,zone:'lago',d:'Lontana da tutto. Il posto più quieto della Valle.'},
});
function buildEast(m,st){if(!IMG.torre&&PX.prototype.line)genEspArt();if(m.id!=='main'||!isFree(st)||m.w<100)return;
 for(const z in ZONES){const Z=ZONES[z],[a,b,c,d]=Z.r,open=zoneOpen(z,st);
  if(!open){for(const [x,y] of Z.gate){const o=m.objAt(x,y);if(o&&o.kind==='fence')mapRemove(m,o);m.add(OB('cancello',x,y,IMG.gateLock,{act:'cancello',zone:z}))}continue}
  // il bosco si apre: via i pini, prato al posto del sottobosco
  m.objs=m.objs.filter(o=>!(o.tx>=a&&o.tx<=c&&o.ty>=b&&o.ty<=d&&o.kind==='pine'));
  for(let y=b;y<=d;y++)for(let x=a;x<=c;x++){m.sol[y*m.w+x]=0;delete m.hit[x+','+y];m.set(x,y,1)}
  for(const [x,y] of Z.gate){const o=m.objAt(x,y);if(o)mapRemove(m,o);m.set(x,y,2)}
  srand(z==='collina'?7001:7002);const ok=(x,y,r=1)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const g=m.get(x+i,y+j);if(!(g===1||g===12)||m.hit[(x+i)+','+(y+j)])return false}return true};
  if(z==='collina'){
   for(let x=61;x<=72;x++)m.set(x,17+(x>66?1:0),2);for(let y=6;y<=18;y++)m.set(72,y,2);for(let x=72;x<=86;x++)m.set(x,8,2);   // il sentiero che sale
   for(let i=0;i<220;i++){const x=ri(a+1,c-1),y=ri(b+1,d-1);if(rnd()<.35&&m.get(x,y)===1)m.set(x,y,12)}
   m.add(OB('torre',88,6,IMG.torre,{wt:2,act:'torre',solid:[[88,6],[89,6]],hits:[[88,6],[89,6]]}));
   for(let i=0;i<260;i++){const x=ri(a+1,c-1),y=ri(b+1,d-1);if(ok(x,y)&&rnd()<.5)m.add(OB('tree',x,y,IMG.tree[ri(0,4)],{act:'tree'}))}
   for(let i=0;i<60;i++){const x=ri(a+1,c-2),y=ri(b+1,d-1);if(ok(x,y)&&ok(x+1,y,0))m.add(OB('rock',x,y,IMG.rock[ri(0,2)],{act:'rock'}))}}
  else{
   // il lago: un'ellisse d'acqua con le sue anse
   const cx=79,cy=31,rx=13,ry=6.5;for(let y=b;y<=d;y++)for(let x=a;x<=c;x++){const k=((x-cx)/rx)**2+((y-cy)/ry)**2+Math.sin(x*.7+y*.4)*.08;if(k<1)m.set(x,y,3)}
   for(let x=61;x<=66;x++)m.set(x,31,2);
   for(let i=0;i<70;i++){const x=ri(a+1,c-1),y=ri(b+1,d-1);if(m.get(x,y)!==1||m.hit[x+','+y])continue;let shore=false;for(const [dx,dy] of DIRV)if(m.get(x+dx,y+dy)===3)shore=true;if(shore&&rnd()<.6)m.add(OB('canne',x,y,IMG.canne,{solid:[],hits:[]}))}
   m.add(OB('pontile',67,31,IMG.pontile,{solid:[],hits:[]}));
   for(let i=0;i<140;i++){const x=ri(a+1,c-1),y=ri(b+1,d-1);if(ok(x,y,2)&&rnd()<.45)m.add(OB('tree',x,y,IMG.tree[ri(0,4)],{act:'tree'}))}
   for(let i=0;i<18;i++){const x=ri(a+1,c-2),y=ri(b+1,d-1);if(ok(x,y)&&ok(x+1,y,0))m.add(OB('rock',x,y,IMG.rock[ri(0,2)],{act:'rock'}))}}}}
// le zone si costruiscono prima che il gioco libero applichi tagli, detriti e costruzioni
{const _af=applyFree;applyFree=function(m,st){buildEast(m,st);_af(m,st)}}
PROMPT.cancello='Cancello';PROMPT.torre='La torre';
ACT.cancello=o=>{const Z=ZONES[o.zone],r=myRank();return narr(`${Z.n}. Il cancello è chiuso con una catena nuova. Un cartello del Consiglio: «Si apre quando il villaggio sarà ${RANKS[Z.rank][0].toUpperCase()}.»\nIl tuo villaggio adesso è: ${rankName(r)} (${villageScore()} punti). Costruisci, coltiva, fatti degli amici: il prestigio cresce.`)};
ACT.torre=()=>narr('Una vecchia torre di guardia. Da quassù si vedono il campanile, il fiume e i tetti di tutta la Valle. Qualcuno ha inciso nella pietra: «Da qui le contavano».');
// i detriti crescono anche nelle zone aperte
{const _fm=freeMorning;freeMorning=function(st){_fm(st);if(!isFree(st))return;const W2=st.free;for(const z in ZONES){if(!zoneOpen(z,st))continue;const [a,b,c,d]=ZONES[z].r;let n=0;for(const k in W2.debris){const [x,y]=k.split(',').map(Number);if(inRect(x,y,ZONES[z].r))n++}
  for(let i=0;n<18&&i<10;i++){const x=a+1+Math.floor(Math.random()*(c-a-1)),y=b+1+Math.floor(Math.random()*(d-b-1)),k=fkey(x,y);if(W2.debris[k]||W2.built[k]||st.farm[k])continue;W2.debris[k]=['ramo','sasso','erbaccia'][i%3];n++}}}}
// le terre nuove nel menu di Ezekiel (con il rango richiesto)
function landMenu(){const st=G.st,own=new Set(myLand()),r=myRank(st);
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>Le terre della Valle</h2><p class="small">«Il Consiglio vende quello che nessuno lavora più.» — Il tuo villaggio: <b>${rankName(r)}</b> · Hai <b>${CZ(st.money)}</b></p>`+
  Object.entries(PLOTS).filter(([k])=>k!=='casa').map(([k,P])=>{const lock=P.zone&&!zoneOpen(P.zone,st);return `<div class="mrow"><span><b>${P.n}</b>${P.zone?` <span class="small">· ${ZONES[P.zone].n}</span>`:''}<br><span class="small">${P.d}</span></span>${own.has(k)?'<span class="small">tua</span>':lock?`<span class="small">🔒 serve ${RANKS[ZONES[P.zone].rank][0]}</span>`:`<b class="price">${CZ(P.p)}</b><button class="btn" data-l="${k}" ${st.money>=P.p?'':'disabled'}>Compra</button>`}</div>`}).join('')+
  '<p class="small">Dove la terra è tua, la casella davanti a te si illumina quando tieni in mano zappa, pala o qualcosa da costruire.</p>');
 $('#mbox').querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const P=PLOTS[b.dataset.l];if(st.money<P.p)return;st.money-=P.p;(st.free.land=st.free.land||['casa']).push(b.dataset.l);AU.play('coin');UI.hud();UI.toast(`Hai comprato: ${P.n}.`);G.landFlash={id:b.dataset.l,t:G.t};NET.save(st);UI._mclose=null;landMenu()})}
// il registro del villaggio: da Ezekiel e dalla bacheca comune
function registroMenu(){const st=homeSt(),sc=villageScore(st),r=rankOf(sc),nx=rankNext(r),pv=r<RANKS.length?RANKS[r][1]:RANKS[RANKS.length-1][1]+(r-RANKS.length+1)*2500,W2=st.free;
 const pc=Math.max(0,Math.min(100,Math.round((sc-pv)/(nx-pv)*100)));
 const items=[['Costruzioni',Object.keys(W2.built).length],['Terre',(W2.land||['casa']).length],['Livello della casa',houseLv(st)],['Animali',(W2.animals||[]).length],['Ricette',Object.keys(W2.recipes||{}).length],['Abitanti nuovi',(W2.residents||[]).length]];
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>Il registro del villaggio</h2><p style="font-size:1.25em"><b>${esc(st.name)}</b> · ${rankName(r)}</p>`+
  `<p class="small">Prestigio <b>${sc}</b> — prossimo rango a <b>${nx}</b></p><div style="height:calc(6*var(--u));background:#c8b48a;box-shadow:inset 0 0 0 var(--u) #5a3a1e"><div style="height:100%;width:${pc}%;background:linear-gradient(#f6d98a,#c8902a)"></div></div>`+
  `<h3>Il villaggio</h3><p class="small">${items.map(([n,v])=>`${n}: <b>${v}</b>`).join(' · ')}</p>`+
  `<h3>Cosa sblocca il rango</h3>`+[1,2,3,4].map(k=>`<p class="small">${r>=k?'✔':'🔒'} <b>${RANKS[k][0]}</b> (${RANKS[k][1]}): ${RANK_GIFTS[k]}</p>`).join('')+
  `<p class="small">Il prestigio cresce con tutto: costruzioni (le grandi valgono di più), terre, casa, animali, abilità, ricette, amicizie e abitanti nuovi.</p>`)}
{const _ez=FREE_ASK.ezekiel;FREE_ASK.ezekiel=async n=>{const c=await ask('ezekiel',freeTalkLine('ezekiel'),['Chiacchiera','Le terre in vendita','Il registro del villaggio','Niente']);if(c===1)landMenu();if(c===2)registroMenu();return c===0}}
// il rango sale: annuncio, zone che si aprono
let RANK_T=2;
function rankTick(dt){const st=homeSt();if(!st||!isFree(st)||G.visit||G.mode!=='game')return;RANK_T-=dt;if(RANK_T>0||G.cut||UI.busy())return;RANK_T=2;
 if(st.free.resCheck!==st.day&&G.map&&G.st===st){st.free.resCheck=st.day;residentMorning(st).catch(e=>console.error(e));return}
 const r=myRank(st),was=st.free.rank||0;if(r<=was){if(st.free.rank==null)st.free.rank=r;return}st.free.rank=r;
 (async()=>{G.cut++;try{AU.play('ok');await UI.card('Il villaggio cresce',rankName(r),RANK_GIFTS[Math.min(r,4)]||'Un\'altra stella per il tuo villaggio.',false,true,1600);rebuildMaps();if(G.map)G.map=G.maps[G.map.id];NET.save(st)}finally{G.cut--}})()}
{const _mt=mpTick;mpTick=function(dt){_mt(dt);rankTick(dt);fishTick(dt)}}
// il rango si vede nell'albo
{const _pub=MP.publish.bind(MP);MP.publish=async function(st){await _pub(st);if(!NET.ok||!st||!st.pid||!isFree(st))return;try{await NET.api.set(NET.r('villaggi/'+st.pid+'/rank'),myRank(st))}catch(e){}}}

// ---------- la pesca ----------
Object.assign(ITEMS,{
 canna:{n:'Canna da pesca',t:'tool',p:250,d:'Davanti all\'acqua (Lago o fiume): lancia, aspetta il «!» e tira.'},
 trota:{n:'Trota',t:'crop',v:55,d:'Del fiume. Fredda e svelta.'},carpa:{n:'Carpa',t:'crop',v:40,d:'Pesce di lago, grosso e pigro.'},
 luccio:{n:'Luccio',t:'crop',v:110,d:'Denti come aghi. D\'autunno e d\'inverno.'},persico:{n:'Persico',t:'crop',v:60,d:'A strisce. D\'estate sotto le canne.'},
 anguilla:{n:'Anguilla',t:'crop',v:90,d:'Esce di notte, nel fiume.'},tinca:{n:'Tinca',t:'crop',v:50,d:'Verde come il fango.'},
 salmerino:{n:'Salmerino d\'oro',t:'crop',v:400,d:'Raro. Brilla come una moneta. Dicono porti fortuna.'},
});
const FISH={lago:[['carpa',40],['tinca',25],['persico',20,[3]],['luccio',12,[0,1]],['salmerino',2]],fiume:[['trota',45,[0,1,2]],['carpa',15],['anguilla',30,null,1],['tinca',10],['salmerino',1]]};
function fishPick(where){const s=seasonOf(),night=G.st.time>=20*60||G.st.time<5*60;const L=FISH[where].filter(([,,ss,n])=>(!ss||ss.includes(s))&&(!n||night));let t=L.reduce((a,f)=>a+f[1],0),r=Math.random()*t;for(const f of L){r-=f[1];if(r<=0)return f[0]}return L[0][0]}
G.fish=null;
function fishCast(fx,fy){const m=G.map;if(m.id!=='main'||m.get(fx,fy)!==3){UI.toast('Serve l\'acqua davanti: il Lago o il fiume.');return true}
 if(!useEnergy(2))return true;const where=zoneAt(fx,fy)==='lago'?'lago':'fiume';G.fish={x:fx*16+8,y:fy*16+8,where,t:0,bite:1.5+Math.random()*3.5,st:'wait',px:G.player.x,py:G.player.y};AU.play('water');return true}
function fishPull(){const f=G.fish;G.fish=null;if(f.st!=='bite'){UI.toast('Troppo presto: il pesce non aveva abboccato.');return}
 const id=fishPick(f.where);if(!addItem(id,1)){UI.toast('Non hai spazio nello zaino.');return}AU.play('ok');floatText(ITEMS[id].n+'!',G.player.x,G.player.y-26,id==='salmerino'?'#ffd84a':'#bfe3ff',id==='salmerino'?2:1);addXP('racc',id==='salmerino'?30:6);
 const st=G.st;st.free.fished=(st.free.fished||0)+1;if(id==='salmerino')UI.toast('Il Salmerino d\'oro! Nella Valle ne parleranno per giorni.')}
function fishTick(dt){const f=G.fish;if(!f)return;if(G.mode!=='game'||G.cut||Math.hypot(G.player.x-f.px,G.player.y-f.py)>3){G.fish=null;return}f.t+=dt;
 if(f.st==='wait'&&f.t>=f.bite){f.st='bite';f.t0=f.t;AU.play('blip')}else if(f.st==='bite'&&f.t-f.t0>.9){G.fish=null;UI.toast('È scappato. Tira appena vedi il «!».')}}
function drawFish(){const f=G.fish;if(!f)return;const X=Math.round(f.x-G.cam.x),Y=Math.round(f.y-G.cam.y+(f.st==='bite'?Math.sin(G.t*30)*1.5:Math.sin(G.t*3)));
 ctx.save();ctx.strokeStyle='rgba(240,240,220,.6)';ctx.beginPath();ctx.moveTo(Math.round(G.player.x-G.cam.x)+(G.player.dir===1?-6:6),Math.round(G.player.y-G.cam.y)-18);ctx.lineTo(X,Y-2);ctx.stroke();
 ctx.fillStyle='#e8e0d0';ctx.fillRect(X-2,Y-3,4,2);ctx.fillStyle='#c8301a';ctx.fillRect(X-2,Y-1,4,2);
 if(f.st==='bite'){ctx.fillStyle='#2b1a10';ctx.fillRect(X-4,Y-22,8,12);ctx.fillStyle='#f6d98a';ctx.fillRect(X-3,Y-21,6,10);ctx.fillStyle='#a8301a';ctx.fillRect(X-1,Y-20,2,5);ctx.fillRect(X-1,Y-14,2,2)}ctx.restore()}
{const _dg=drawGuide;drawGuide=function(){_dg();if(G.mode==='game'&&G.map&&G.map.id==='main')drawFish()}}

// ---------- i nuovi abitanti ----------
Object.assign(ITEMS,{casetta:{n:'Casetta',t:'place',size:[3,3],d:'Una casa per un nuovo abitante. Dal rango Borgo. Va messa su una tua terra libera, 3×3.'}});
CRAFTS.push({id:'casetta',q:1,c:{legna:140,pietra:70,lingotto:3},cat:'edi'});
const RES_POOL=[
 {id:'nora',n:'Nora la pescatrice',job:'pesca',look:{skin:'#e8c0a0',hair:'#a85a2a',style:'long',eye:'#3a5a6a',shirt:'#4a6a8a',pants:'#3a3a4a',shoe:'#2a1c14',hat:'cap',hatCol:'#c8a03a'},
  shop:[['canna',250],['s_spinaci',30]],buys:'pesci',req:['carpa','trota','tinca','persico'],L:['Il Lago è pieno di pesci che non hanno mai visto una canna. Che spreco.','Se peschi un Salmerino d\'oro portamelo: lo appendo sopra la porta.','L\'acqua ferma racconta tutto. Basta stare zitti.']},
 {id:'bruno',n:'Bruno il mugnaio',job:'mulino',look:{skin:'#d8a882',hair:'#e8e0d0',style:'short',beard:'#e8e0d0',eye:'#4a3a2a',shirt:'#e8dcc0',pants:'#6a5a3a',shoe:'#2a1c14'},
  shop:[['pane',28],['polenta',90],['concime',12]],req:['mais','patata','cavolo'],L:['Farina, pane, polenta. La gente mangia, io macino.','Il grano non c\'è, qui. Mi arrangio col mais, che è più onesto.','Le mani bianche non si lavano mai del tutto.']},
 {id:'lia',n:'Lia la fioraia',job:'fiori',look:{skin:'#f0c8a8',hair:'#e8b84a',style:'long',eye:'#4a7a3a',shirt:'#e88aa8',dress:'#c85a7a',pants:'#3a3a4a',shoe:'#5a2a2a',lip:'#c05a6a'},
  shop:[['aiuola',100],['coronafiori',180],['pianta',140],['s_fragola',65]],req:['camomilla','tarassaco','fragoline','fragola'],L:['Un villaggio senza fiori è un cimitero con le finestre.','Le aiuole davanti alle case: la gente sorride di più. L\'ho misurato.','I fiori qui crescono storti, come se cercassero qualcosa.']},
 {id:'teo',n:'Teo il minatore',job:'miniera',look:{skin:'#c8986a',hair:'#2a1c14',style:'short',beard:'#2a1c14',eye:'#2a2a2a',shirt:'#5a4a3a',pants:'#3a3028',shoe:'#1a1410',hat:'cap',hatCol:'#c8a03a'},
  shop:[['ferro',35],['pietra',7],['lingotto',85]],req:['legna','pane','arrosto'],L:['Sotto la Collina c\'è una miniera vecchia. Chiusa. Per ora.','Le pietre di ogni villaggio sono diverse. Le tue hanno un odore strano.','Porta il piccone sempre affilato. E una lanterna.']},
 {id:'mirta',n:'Mirta l\'erborista',job:'erbe',look:{skin:'#e0b898',hair:'#5a5a5a',style:'bun',eye:'#5a6a3a',shirt:'#6a8a5a',dress:'#4a6a4a',pants:'#3a3a3a',shoe:'#2a1c14'},
  shop:[['tisana',55],['camomilla',28],['concime',10]],req:['funghi','radice','more','camomilla'],L:['Per ogni male c\'è un\'erba. Per la Valle ce ne vogliono parecchie.','Raccogli all\'alba: le erbe hanno ancora la rugiada e la memoria.','La radice che cresce vicino al bosco… non mangiarla. Portala a me.']},
 {id:'silvio',n:'Silvio il falegname',job:'legno',look:{skin:'#d8a882',hair:'#6a4a2a',style:'short',beard:'#6a4a2a',eye:'#3a3a2a',shirt:'#a86a3a',pants:'#4a3a2a',shoe:'#2a1c14'},
  shop:[['legna',5],['lastre',10],['panchina',160],['tavolino',220]],req:['pietra','ferro','legna'],L:['Il legno buono si sente con l\'orecchio, non con l\'occhio.','Fammi vedere le tue costruzioni. Mh. Si può fare di meglio. Sempre.','Ogni casa nuova è un villaggio un po\' più grande.']},
 {id:'ada',n:'Ada la pittrice',job:'arte',look:{skin:'#f0d0b8',hair:'#1a1416',style:'bun',eye:'#3a3a5a',shirt:'#e8e0d0',dress:'#3a4a7a',pants:'#3a3a4a',shoe:'#1a1a1a',lip:'#a0504a'},
  shop:[['quadro',240],['lanternacarta',120],['ghirlanda',110]],req:['ciliegie','fragola','mela','barbabietola'],L:['Dipingo la Valle ogni giorno. Ogni giorno il quadro viene diverso.','Le facce, qui, non vengono mai bene. Si muovono anche nel ritratto.','Colora il tuo tetto. La Valle ha bisogno di colore.']},
 {id:'gaspare',n:'Gaspare l\'apicoltore',job:'api',look:{skin:'#e0b090',hair:'#c8c0b0',style:'short',eye:'#4a4a3a',shirt:'#e8c84a',pants:'#5a5a4a',shoe:'#2a1c14',hat:'tall',hatCol:'#e8e0d0',hatBand:'#5a5a5a'},
  shop:[['apiario',380],['miele',55]],req:['camomilla','tarassaco','ciliegie'],L:['Le api sanno chi sei. Non mentire mai vicino a un alveare.','Il miele della Valle è scuro. Dolce, ma scuro.','Più fiori pianti, più le api ti vogliono bene.']},
 // aggiunti con i contenuti nuovi: il pastore e la contadina
 {id:'elio',n:'Elio il pastore',job:'pecore',look:{skin:'#d8a07a',hair:'#3a2a1a',style:'messy',beard:'#3a2a1a',eye:'#3a4a3a',shirt:'#8a6a4a',vest:'#e8dcc0',pants:'#4a4030',shoe:'#2a1c14',hat:'cap',hatCol:'#5a4a3a'},
   shop:[['fieno',15],['s_grano',30],['ovile',650]],req:['lana','latte_capra','formaggio','fieno','grano'],L:['Le pecore non sono stupide. Sono prudenti. C\'è differenza.','D\'estate le porto in alto. D\'inverno le tengo vicine. Come la gente.','Il latte di capra fa venire la forza. E un po\' di carattere.']},
  {id:'rina',n:'Rina la contadina',job:'orto',look:{skin:'#e8b890',hair:'#c8702a',style:'bun',eye:'#5a6a2a',shirt:'#e8d8b0',dress:'#6a7a3a',pants:'#3a3a3a',shoe:'#3a2414',hat:'bonnet',hatCol:'#e8d8a8'},
   shop:[['s_piselli',38],['s_zucchina',42],['s_mirtilli',62],['s_cavolfiore',58],['alb_albicocco',340],['alb_noce',360]],req:['piselli','zucchina','cavolfiore','girasole','ravanello','mirtilli'],L:['La terra della Valle è nera e grassa. Le manca solo qualcuno che la ascolti.','Il ravanello è impaziente come un bambino. Il cavolfiore come un vecchio.','Pianta girasoli ai bordi dei campi: le api ti ringrazieranno.']},
];
const RES=Object.fromEntries(RES_POOL.map(r=>[r.id,r]));
for(const r of RES_POOL){NPC_DEF.push([r.id,r.n]);NAMES[r.id]=r.n;LOOKS[r.id]=Object.assign({pants:'#3a3a4a',shoe:'#2a1c14'},r.look);HOMES[r.id]='ponte'}
const residents=st=>((st||G.st).free&&(st||G.st).free.residents)||[];
const resOf=(id,st)=>residents(st).find(r=>r.id===id);
function resDoor(r,st){const b=(st||G.st).free.built[r.house];if(!b)return null;const [ax,ay]=r.house.split(',').map(Number);return [ax,ay+1]}
// la giornata di un abitante: davanti a casa, al lavoro nella sua zona, in piazza la sera
const RES_WORK={pesca:()=>zoneOpen('lago')?[64,30,2]:[40,42,3],miniera:()=>zoneOpen('collina')?[86,9,0]:[33,6,0],fiori:()=>[24,10,0],erbe:()=>[30,6,3],legno:()=>[36,15,0],arte:()=>[50,24,3],api:()=>[22,20,0],mulino:()=>[46,22,0],pecore:()=>[14,38,0],orto:()=>[12,28,1]};
for(const R of RES_POOL)SCHED[R.id]=function(st){if(!isFree(st))return null;const r=resOf(R.id,st);if(!r||st.day<=r.day)return null;const d=resDoor(r,st);if(!d)return null;const t=st.time,wk=RES_WORK[R.job]();
 if(t>=7*60&&t<9*60)return at(d[0],d[1],0,'idle',1);if(t>=9*60&&t<13*60)return at(wk[0],wk[1],wk[2],'idle',2);if(t>=13*60&&t<14*60+30)return at(44+((R.id.length*3)%5)-2,18+(R.id.length%3),0,'idle',2);
 if(t>=14*60+30&&t<18*60)return at(wk[0],wk[1],wk[2],'idle',2);if(t>=18*60&&t<20*60+30)return at(42+(R.id.charCodeAt(0)%7),21,0,'chat',1);return null};
// la richiesta del giorno: un oggetto della stagione, un premio
function resReq(id,st){const R=RES[id],L=R.req.filter(x=>ITEMS[x]);const k=(st.day*7+id.length*13)%L.length,item=L[k],n=1+((st.day+id.charCodeAt(0))%3),pay=Math.round((ITEMS[item].v||ITEMS[item].p||20)*n*1.6)+40;return {item,n,pay}}
for(const R of RES_POOL)FREE_ASK[R.id]=async n=>{const st=G.st,q=resReq(R.id,st),done=(st.free.reqDone||{})[R.id]===st.day,h=hearts(R.id);
 const line=R.L[(st.day+h)%R.L.length];
 const c=await ask(R.id,line,['Chiacchiera',done?'La richiesta di oggi ✔':`La richiesta: ${q.n} × ${ITEMS[q.item].n}`,'La bottega','Niente']);
 if(c===0){await say(R.id,h>=6?'Sono contento di essere venuto qui. Davvero. Grazie per la casa.':h>=3?'Mi sto abituando. La gente è strana, ma tu no.':'Sono ancora nuovo. Dammi tempo.');return true}
 if(c===1){if(done)return say(R.id,'Per oggi a posto così. Torna domani.');if(countItem(q.item)<q.n)return say(R.id,`Mi servirebbero ${q.n} × ${ITEMS[q.item].n}. Ti pago ${q.pay} scudi.`);
  removeItem(q.item,q.n);st.money+=q.pay;(st.free.reqDone=st.free.reqDone||{})[R.id]=st.day;addFriend(R.id,2);AU.play('coin');UI.hud();await say(R.id,`Proprio quello che serviva. Ecco ${q.pay} scudi.`);NET.save(st);return true}
 if(c===2){resShop(R);return true}return false};
function resShop(R){const st=G.st,disc=hearts(R.id)>=5?.85:1,pr=p=>Math.round(p*disc);
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>La bottega di ${esc(R.n.split(' ')[0])}</h2><p class="small">${disc<1?'Prezzo d\'amico (−15%). ':''}— Hai <b>${CZ(st.money)}</b></p>`+
  R.shop.filter(([id])=>ITEMS[id]).map(([id,p])=>`<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}<br><span class="small">${ITEMS[id].d||''}</span></span><b class="price">${CZ(pr(p))}</b><button class="btn" data-b="${id}" ${st.money>=pr(p)?'':'disabled'}>×1</button></div>`).join('')+
  (R.buys==='pesci'?`<h3>Nora compra il pesce</h3>`+st.inv.map((s,i)=>[s,i]).filter(([s])=>s&&FISH_IDS.has(s.id)).map(([s,i])=>`<div class="mrow"><canvas data-i="${s.id}" width="32" height="32"></canvas><span>${ITEMS[s.id].n} ×${s.n}</span><b class="price">${CZ(Math.round(ITEMS[s.id].v*1.3)*s.n)}</b><button class="btn" data-s="${i}">Vendi</button></div>`).join('')||'<p class="small">Non hai pesce. Il 30% in più della cassetta.</p>':''));
 $('#mbox').querySelectorAll('canvas[data-i]').forEach(c=>{const ic=ICON[c.dataset.i];if(ic)c.getContext('2d').drawImage(ic,0,0)});
 $('#mbox').querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const [id,p]=R.shop.find(x=>x[0]===b.dataset.b);if(st.money<pr(p)||!addItem(id,1))return;st.money-=pr(p);AU.play('coin');UI.hud();UI._mclose=null;resShop(R)});
 $('#mbox').querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const s=st.inv[+b.dataset.s];if(!s)return;st.money+=Math.round(ITEMS[s.id].v*1.3)*s.n;st.inv[+b.dataset.s]=null;AU.play('coin');UI.hud();UI.hotbar();UI._mclose=null;resShop(R)})}
const FISH_IDS=new Set(['trota','carpa','luccio','persico','anguilla','tinca','salmerino']);
// la casetta: si costruisce dal Borgo, e solo se c'è posto per un abitante nuovo
{const _fa=freeAct;freeAct=function(fx,fy){const st=G.st,it=selItem();
 if(G.fish&&isFree(st)&&!G.visit){fishPull();return true}
 if(it&&it.id==='canna'&&isFree(st)&&!G.visit&&G.map.id==='main'){const o=G.map.objAt(fx,fy);if(!o||!o.act)return fishCast(fx,fy)}
 if(it&&it.id==='casetta'&&isFree(st)&&!G.visit&&G.map.id==='main'){const r=myRank(st),cnt=Object.values(st.free.built).filter(b=>b.id==='casetta').length;
  if(r<1){UI.toast('Le casette per i nuovi abitanti si costruiscono dal rango Borgo. Guarda il registro da Ezekiel.');return true}
  if(cnt>=resCap(r)){UI.toast(`Per ora il Consiglio permette ${resCap(r)} ${resCap(r)===1?'casetta':'casette'}. Al prossimo rango, una in più.`);return true}}
 return _fa(fx,fy)}}
// al mattino: se c'è una casetta vuota, arriva qualcuno
async function residentMorning(st){if(!isFree(st)||G.visit)return;G.cut++;try{await _resMorning(st)}finally{G.cut--}}
async function _resMorning(st){const W2=st.free;W2.residents=W2.residents||[];
 const houses=Object.entries(W2.built).filter(([,b])=>b.id==='casetta').map(([k])=>k);W2.residents=W2.residents.filter(r=>houses.includes(r.house));
 const empty=houses.find(k=>!W2.residents.some(r=>r.house===k));if(!empty)return;const free=RES_POOL.filter(r=>!W2.residents.some(x=>x.id===r.id));if(!free.length)return;
 const R=free[(st.day*5+houses.length)%free.length];W2.residents.push({id:R.id,house:empty,day:st.day-1});st.flags.met[R.id]=1;
 await UI.card('Un nuovo abitante',R.n,`Stamattina un carro si è fermato davanti alla casetta nuova. ${R.n.split(' ')[0]} scarica le sue cose e ti saluta con la mano. Ha una bottega, e ogni giorno una richiesta.`,false,true,1400);snapNPCs();NET.save(st)}

// ---------- grafica ----------
function genEspArt(){const wood=rp('#8a5a32'),woodD=rp('#5a3a1e'),stone=rp('#8a877d'),roof=rp('#7a3a2a');
 IMG.gateLock=SP(16,26,P=>{P.capsule(16,8,16,50,2.4,woodD);for(const y of [16,30,44])P.capsule(4,y,28,y,1.6,wood);P.ellipse(20,30,4,3,rp('#c8a03a'),{spec:.9});P.line(14,22,26,40,C('#6a6a72'))});
 IMG.torre=SP(32,52,P=>{P.body(14,102,()=>32,Y=>14+(Y-14)*.03,stone,{nyF:()=>.1,mod:(X,Y,v)=>{const row=Math.floor(Y/6),off=row%2?5:0;return (Y%6===0||(X+off)%10===0)?v-.28:v+(((X*5+Y*3)%7)-3)*.02}});
  P.body(0,16,()=>32,Y=>6+Y*.7,roof,{nyF:()=>-.6});P.rect(28,40,8,12,rp('#1a1418'));P.rect(26,84,12,18,rp('#3a2414'))});
 IMG.canne=SP(12,18,P=>{for(const [x,h] of [[6,6],[11,2],[16,8],[20,4]]){P.line(x,34,x+1,h,C('#6a8a3a'));P.capsule(x+1,h+2,x+1,h+7,1.4,rp('#6a4a2a'))}});
 IMG.pontile=SP(32,10,P=>{P.rect(0,4,64,10,wood,{mod:woodMod});for(let x=0;x<64;x+=8)P.line(x,4,x,14,C('#4a2a14'));P.capsule(4,14,4,20,1.5,woodD);P.capsule(60,14,60,20,1.5,woodD)});
 AIMG.casetta=SP(48,52,P=>{P.rect(6,40,84,60,rp('#e8d8b8'),{mod:(X,Y,v)=>v+(((X*3+Y*7)%11===0)?-.1:0)});P.body(4,44,()=>48,Y=>16+Y*.85,roof,{nyF:()=>-.5,mod:(X,Y,v)=>(Y%5===0)?v-.25:v});
  P.rect(40,70,16,30,rp('#6a3a1e'));P.ellipse(53,86,1.4,1.4,rp('#e8c23a'),{spec:1});for(const x of [14,66])P.rect(x,58,14,14,rp('#ffd86a'),{spec:.8});P.rect(70,8,8,16,rp('#7a7a7a'))});
 const I=(id,fn)=>{const P=new PX(32,32);fn(P);P.outline();ICON[id]=pxCanvas(P)};
 I('canna',P=>{P.line(6,28,27,4,C('#8a5a32'));P.line(7,28,26,5,C('#5a3a1e'));P.ellipse(9,24,3,3,rp('#8a8a8a'),{spec:.8});P.line(27,4,27,20,C('#d8d8c8'))});
 const fish=(id,c,c2,big)=>I(id,P=>{P.ellipse(15,16,big?11:9,big?6:5,rp(c),{spec:.8});P.body(9,23,()=>27,Y=>Math.abs(Y-16)*.7+1,rp(c2));P.ellipse(9,15,1.3,1.3,rp('#1a1418'))});
 fish('trota','#8aa0a8','#6a8088');fish('carpa','#b8903a','#8a6a2a',1);fish('luccio','#6a8a4a','#4a6a3a',1);fish('persico','#a8b84a','#c8603a');fish('anguilla','#4a4a3a','#3a3a2a');fish('tinca','#5a7a3a','#4a5a2a');fish('salmerino','#f0c83a','#d8a02a');
 I('casetta',P=>{P.rect(6,14,20,14,rp('#e8d8b8'));P.body(4,15,()=>16,Y=>4+Y*.85,roof);P.rect(13,19,6,9,rp('#6a3a1e'))})}

// la canna si trova al banco di Agatha da quando il Lago è aperto
{const _si=shopItems;shopItems=function(){const L=_si();return isFree()&&zoneOpen('lago')&&!countItem('canna')?[...L,'canna']:L}}
// la guida delle novità di questa fase (chi ha già fatto la guida della Valle vede solo questa)
GUIDES.push({id:'crescita',v:2,n:'Il villaggio che cresce',steps:[
 {t:'Novità nella Valle: il tuo villaggio ha un <b>rango</b>. Casale, Borgo, Paese, Cittadina, Città… e poi stelle, senza fine. Cresce con tutto: costruzioni, terre, casa, animali, amicizie.'},
 {t:'Il <b>registro del villaggio</b> lo tiene l\'Anziano Ezekiel: chiediglielo per vedere il prestigio e cosa sblocca il prossimo rango.'},
 {t:'A est, nel recinto, ci sono due cancelli: la <b>Collina</b> si apre dal Borgo, il <b>Lago</b> dal Paese. Dentro, legna, pietre, terre nuove da comprare.',at:()=>({x:60*16+8,y:18*16+4,l:'I cancelli a est'})},
 {t:'Al Lago e sul fiume si <b>pesca</b>: lancia davanti all\'acqua, aspetta il «!» e tira subito. La canna la vende Agatha quando il Lago è aperto.'},
 {t:'Dal Borgo, al banco da lavoro (Edifici), puoi costruire una <b>casetta</b>: il giorno dopo arriva un nuovo abitante, con la sua bottega e una richiesta al giorno.'}]});
