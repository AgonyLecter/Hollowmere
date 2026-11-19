'use strict';
// ================= VITA AMBIENTALE E CURIOSITÀ =================
// Animali che non servono a niente se non a far sembrare viva la Valle, e segreti nascosti per chi guarda bene.

Object.assign(SFX,{
 hoot:(a,t)=>{a.osc('sine',392,t,.32,.05,null,.06,370);a.osc('sine',370,t+.45,.5,.05,null,.08,330)},
 flap:(a,t)=>{for(let i=0;i<4;i++)a.noise(t+i*.07,.05,.06,'bandpass',600,1.5)},
 rustle:(a,t)=>a.noise(t,.35,.08,'highpass',2400,.7),
});

// ---------- creature ----------
function spawnAmbient(){const st=G.st,R=Math.random,A={fly:[],bugs:[],owl:null,deer:null,hog:null};
 const homes=[[6,10],[13,10],[32,29],[56,17],[10,20],[18,26],[44,30],[28,12]];
 for(let i=0;i<7;i++){const h=homes[i%homes.length];A.fly.push({hx:h[0]*16+8,hy:h[1]*16,ph:R()*9,sp:.6+R()*.6,c:['#f0e070','#ffffff','#f0a050','#b8d8f8'][i%4]})}
 for(let i=0;i<18;i++){const river=i<10;A.bugs.push({x:(river?6+R()*54:6+R()*15)*16,y:(river?38+R()*3:14+R()*19)*16,ph:R()*9,sp:.4+R()*.5})}
 A.owl={x:26*16+8,y:6*16-26,gone:false,t:4+R()*8};
 if(R()<.6)A.deer={x:(10+R()*16)*16,y:(36+R()*3)*16,dir:R()<.5?-1:1,st:'graze',t:2,f:0,dawn:R()<.5};
 A.hog={x:23*16,y:20*16,dir:1,t:0,f:0,ball:0};
 G.amb=A}
function ambTick(dt){const m=G.map;if(!m||m.id!=='main'||G.mode!=='game')return;if(!G.amb)spawnAmbient();const A=G.amb,p=G.player,t=G.st.time;
 // gufo: di notte sul ramo; se ti avvicini troppo vola via fino alla notte dopo
 const o=A.owl;if(G.night>.5&&!o.gone){o.t-=dt;const d=Math.hypot(p.x-o.x,p.y-o.y-26);if(o.t<=0){o.t=10+Math.random()*12;if(d<240)AU.play('hoot')}if(d<34){o.gone=true;AU.play('flap');for(let i=0;i<5;i++)G.parts.push({k:'dust',x:o.x,y:o.y,vx:(Math.random()-.5)*50,vy:-30,t:0,life:.6})}}
 // cervo: all'alba o al tramonto, scappa se ti avvicini
 const e=A.deer;if(e){const on=e.dawn?(t>=6*60&&t<8*60+30):(t>=17*60+30&&t<20*60);e.on=on||e.st==='flee';if(e.on){const d=Math.hypot(p.x-e.x,p.y-e.y);
  if(e.st!=='flee'&&d<84){e.st='flee';e.dir=p.x<e.x?1:-1;AU.play('rustle')}
  if(e.st==='flee'){e.x+=e.dir*110*dt;e.y-=14*dt;e.f+=dt*12;if(e.x<-40||e.x>64*16+40)A.deer=null}
  else{e.t-=dt;if(e.t<=0){e.t=2+Math.random()*4;e.st=e.st==='graze'?'look':'graze'}}}}
 // riccio: di notte gira attorno ai campi, si appallottola se lo tocchi
 const h=A.hog;if(G.night>.45){h.t-=dt;if(h.ball>0)h.ball-=dt;else{if(h.t<=0){h.t=2+Math.random()*3;h.dir=Math.random()<.5?-1:1;h.vy=(Math.random()-.5)*8}const nx=h.x+h.dir*9*dt;if(nx>22*16&&nx<27*16)h.x=nx;else h.dir*=-1;h.y=clamp(h.y+(h.vy||0)*dt,14*16,32*16);h.f+=dt*6}}}
function drawDeer(e){const X=Math.round(e.x),Y=Math.round(e.y),s=e.dir,run=e.st==='flee',k=run?Math.sin(e.f)*2:0,R=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(s>0?X+a:X-a-w,Y+b,w,h)};
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(X-7,Y-1,14,2);
 R('#5a3a22',-5,-6+k*.3,1,6-k);R('#5a3a22',4,-6-k*.3,1,6+k);R('#4a2e1a',-3,-6,1,6);R('#4a2e1a',2,-6,1,6);
 R('#8a5a32',-6,-11,12,6);R('#a8744a',-5,-11,10,2);R('#f2e6d0',-7,-10,2,2);
 const hy=e.st==='graze'?-7:-17;R('#8a5a32',5,hy+3,3,e.st==='graze'?4:8);R('#8a5a32',6,hy,4,4);R('#2a1a10',9,hy+1,1,1);
 if(e.st!=='graze'){R('#6a4a2a',6,hy-3,1,3);R('#6a4a2a',8,hy-4,1,4);R('#6a4a2a',5,hy-4,1,1);R('#6a4a2a',9,hy-5,1,1)}}
function drawHog(h){const X=Math.round(h.x),Y=Math.round(h.y);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(X-4,Y,8,1);
 if(h.ball>0){ctx.fillStyle='#4a3a2a';ctx.fillRect(X-3,Y-5,6,5);ctx.fillStyle='#6a5a44';ctx.fillRect(X-2,Y-5,1,1);ctx.fillRect(X+1,Y-4,1,1);return}
 const s=h.dir;ctx.fillStyle='#4a3a2a';ctx.fillRect(X-4,Y-4,8,4);ctx.fillStyle='#6a5a44';for(let i=0;i<4;i++)ctx.fillRect(X-4+i*2,Y-5,1,1);ctx.fillStyle='#c8a888';ctx.fillRect(s>0?X+4:X-6,Y-3,2,2);ctx.fillStyle='#000';ctx.fillRect(s>0?X+5:X-6,Y-3,1,1);ctx.fillStyle='#a01810';ctx.fillRect(X-1,Y-6,2,1)}
function hogAt(ax,ay){const h=G.amb&&G.amb.hog;if(!h||G.night<=.45||Math.hypot(h.x-ax,h.y-ay)>14)return false;h.ball=6;AU.play('rustle');UI.toast(h.seen?'Il riccio si chiude a palla. Di nuovo.':'Un riccio! Si chiude a palla. Sugli aculei ha infilzata una foglia rossa.');h.seen=1;return true}
function drawAmbTop(m){if(m.id!=='main'||!G.amb)return;const A=G.amb,T=G.t,night=G.night,rain=G.st.weather==='pioggia';
 if(G.st.weather==='neve'){ctx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<90;i++){const sx=G.cam.x+((i*97+T*(8+i%5)*3+Math.sin(T+i)*10)%(W+20))-10,sy=G.cam.y+((i*53+T*(18+i%7)*2)%(H+10))-5;ctx.fillRect(Math.round(sx),Math.round(sy),i%3?1:2,i%3?1:2)}}
 // farfalle di giorno
 if(night<.3&&!rain)for(const b of A.fly){const a=T*b.sp+b.ph,x=b.hx+Math.sin(a)*28+Math.sin(a*2.7)*8,y=b.hy+Math.cos(a*1.3)*16-10,w=Math.floor(T*14+b.ph)%2;ctx.fillStyle=b.c;ctx.fillRect(Math.round(x)-(w?2:1),Math.round(y),w?2:1,2);ctx.fillRect(Math.round(x)+1,Math.round(y),w?2:1,2);ctx.fillStyle='#2a1a10';ctx.fillRect(Math.round(x),Math.round(y),1,2)}
 // lucciole di notte
 if(night>.45&&!rain)for(const f of A.bugs){const a=T*f.sp+f.ph,x=f.x+Math.sin(a)*20,y=f.y+Math.sin(a*1.7)*10-8,on=(Math.sin(T*2.3+f.ph*3)+1)/2;if(on<.25)continue;
  const g=ctx.createRadialGradient(x,y,0,x,y,7);g.addColorStop(0,`rgba(220,255,120,${(.55*on).toFixed(2)})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-7,y-7,14,14);ctx.fillStyle='#f4ffb0';ctx.fillRect(Math.round(x),Math.round(y),1,1)}
 // gufo: si vedono solo gli occhi (dal Capitolo II sono rossi)
 const o=A.owl;if(night>.5&&!o.gone){const bl=Math.floor(T*.7+1)%7===0,red=H2();ctx.fillStyle='rgba(20,14,18,.85)';ctx.fillRect(o.x-4,o.y-2,8,9);ctx.fillRect(o.x-4,o.y-4,2,2);ctx.fillRect(o.x+2,o.y-4,2,2);
  if(!bl){ctx.fillStyle=red?'#ff4a3a':'#ffd86a';ctx.fillRect(o.x-3,o.y,2,2);ctx.fillRect(o.x+1,o.y,2,2)}}
 // (il riccio si disegna con gli altri animali, sotto il buio)
 // curiosità visibili: la bottiglia tra l'erba luccica ogni tanto
 const F=G.st.flags;if(!F.egg_bottiglia){const X=49*16+6,Y=41*16+9;ctx.fillStyle='#2a4a3a';ctx.fillRect(X,Y,5,3);ctx.fillRect(X+5,Y+1,2,1);ctx.fillStyle='#6a9a7a';ctx.fillRect(X+1,Y,2,1);if(Math.floor(T*1.3)%5===0){ctx.fillStyle='#fffbe0';ctx.fillRect(X+1,Y-1,1,1);ctx.fillRect(X,Y,3,1)}}}

// ---------- curiosità (easter egg) ----------
const EGGS={
 incisione:{at:[[55,40],[55,39]],t:'L\'albero inciso',lore:'Sulla corteccia, alta e vecchissima: «E.M. + A.C. — 1849». Agatha Crane ha detto che tuo nonno è l\'unico che si è fermato a ringraziarla.',
  run:async()=>{await narr('Sulla corteccia, a un\'altezza da ragazzi, qualcuno ha inciso due iniziali dentro un cuore storto.');await narr('«E.M. + A.C. — 1849»');await narr('E.M. Elias Marlowe. A.C.… nella Valle c\'è una sola persona con quelle iniziali. E ti chiama «tesoro».')},again:'«E.M. + A.C. — 1849». Il cuore è storto. Il nome no.'},
 sassi:{at:[[13,5]],t:'Il cerchio di sassi',lore:'Otto sassi in cerchio, a nord-ovest. Contati due volte, fanno nove.',
  run:async()=>{await narr('Dietro il masso c\'è un cerchio di sassi piccoli, lisci, messi con cura.');AU.play('count');await narr('Li conti. Uno, due… otto. Otto sassi.');AU.play('wrongcount');G.glitch=6;await narr('Li riconti. Nove.',{dark:1});await narr('Non li tocchi più.')},again:'Otto sassi. O nove. Meglio non contarli.'},
 zucca:{at:[[22,9]],t:'Un biglietto nella zucca',lore:'Nella zucca vicino a casa, un biglietto di Tobia: «Lo sapevo che avresti guardato. Le zucche ascoltano, ma non ridono. Io sì. Hihi.»',
  run:async()=>{await narr('La zucca accanto a casa ha un tappo intagliato. Dentro, piegato in quattro, un biglietto scritto a matita, con le lettere storte.');await narr('«Ciao {n}. Lo sapevo che avresti guardato. Le zucche ascoltano, ma non ridono. Io sì. Hihi. — T.»');addFriend('tobia',1)},again:'Il biglietto di Tobia è ancora lì. Hihi.'},
 bottiglia:{at:[[49,41]],t:'Una bottiglia nell\'erba',lore:'Una bottiglia di plastica (che cos\'è la plastica?) con un biglietto: dieci cifre scritte a penna a sfera. Nella Valle nessuno ha mai visto una penna a sfera.',
  run:async()=>{await narr('Tra l\'erba alta c\'è una bottiglia. Non è di vetro. È leggera, si piega se la stringi, e fa un rumore secco.');await narr('Dentro, un biglietto arrotolato. Dieci cifre, scritte con un inchiostro che non sbava mai. Sotto: «se qualcuno trova questo, chiamate. vi prego.»');await narr('Chiamare. Con cosa?',{dark:1})},again:'La bottiglia che si piega. Dieci cifre. Nessuno da chiamare.'},
 pozzo:{at:[[47,19]],when:()=>G.st.time>=22*60,t:'La voce nel pozzo',lore:'Dopo le dieci di sera, dal pozzo della piazza, una voce conta. Arriva sempre a otto.',
  run:async()=>{AU.play('whisper');await narr('Ti sporgi sul pozzo. Dal fondo, piano, una voce conta.');await narr('«…sei… sette… otto.» Una pausa. «Sei tu, otto?»',{dark:1});G.glitch=5;addQuiete(-3)},again:'Dal pozzo, qualcuno conta fino a otto. Ogni notte.'},
};
const EGG_EXTRA={moneta:{t:'Una moneta che non esiste',lore:'Zappando nei campi del nonno: una moneta leggera e lucida. Su una faccia un 2, sull\'altra dodici stelle in cerchio e una data che non ha senso.'},
 gatto:{t:'Gli occhi del gatto',lore:'Di notte, accarezzando il gatto nero: per un attimo i suoi occhi gialli sono diventati rossi. Ha fatto le fusa lo stesso.'}};
const eggAll=()=>Object.assign({},EGGS,EGG_EXTRA);
async function eggFound(id){const F=G.st.flags;if(F['egg_'+id])return;F['egg_'+id]=1;AU.play('ok');const n=Object.keys(eggAll()).filter(k=>F['egg_'+k]).length;UI.toast(`Curiosità trovata (${n}/${Object.keys(eggAll()).length}): ${eggAll()[id].t}. Aggiunta al diario.`)}
function eggAt(fx,fy){if(G.map.id!=='main')return false;for(const id in EGGS){const e=EGGS[id];if(!e.at.some(([x,y])=>x===fx&&y===fy))continue;if(e.when&&!e.when())continue;
  const F=G.st.flags;G.cut++;(F['egg_'+id]?narr(e.again):e.run().then(()=>eggFound(id))).catch(er=>console.error(er)).finally(()=>{G.cut--});return true}return false}
function eggDig(tx,ty){if(tx===7&&ty===30&&!G.st.flags.egg_moneta){setTimeout(async()=>{G.cut++;try{AU.play('pick');await narr('La zappa colpisce qualcosa di duro. Una moneta, leggerissima, lucida come se fosse nuova.');await narr('Su una faccia un 2. Sull\'altra, dodici stelle in cerchio e una data. Una data che non può essere vera.');await eggFound('moneta')}finally{G.cut--}},300)}}
function eggCat(){const st=G.st;if(st.time>=21*60&&!st.flags.egg_gatto){setTimeout(async()=>{G.cut++;try{G.glitch=4;await narr('Il gatto alza la testa. Per un istante i suoi occhi non sono gialli. Sono rossi.',{dark:1});await narr('Poi sbatte le palpebre, e fa le fusa come prima.');await eggFound('gatto')}finally{G.cut--}},200)}}
function eggLore(){const F=G.st.flags,all=eggAll(),k=Object.keys(all),got=k.filter(x=>F['egg_'+x]);
 return `<h3>Curiosità trovate (${got.length}/${k.length})</h3>`+(got.length?got.map(x=>`<p class="small"><b>${esc(all[x].t)}.</b> ${esc(fmt(all[x].lore))}</p>`).join(''):'<p class="small">La Valle nasconde più cose di quante ne mostri. Guarda dove gli altri non guardano.</p>')}
