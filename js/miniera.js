'use strict';
// ================= LA VALLE INFINITA — FASE 4: LA MINIERA SENZA FONDO =================
// Sotto la Collina c'è la miniera vecchia. Ogni piano è generato quando ci scendi: rocce con minerali
// che cambiano con la profondità, una sola roccia nasconde la scala per scendere, forzieri, torce.
// Più giù si va, più Ombre: ti tolgono energia, si scacciano con un colpo d'attrezzo.
// Ogni 5 piani un ascensore ricorda la strada. Non c'è un fondo.

const MINE_IN=[92,13];   // l'imbocco, sulla Collina
const mineSt=st=>{st=st||G.st;st.free.mine=st.free.mine||{max:0,deep:0};return st.free.mine};
Object.assign(ITEMS,{
 essenza:{n:'Essenza d\'ombra',t:'crop',v:150,d:'Quello che resta di un\'Ombra scacciata. Fredda, e pesa più di quanto dovrebbe.'},
 quarzo:{n:'Quarzo',t:'crop',v:70,d:'Trasparente, dai piani di mezzo. Lo comprano tutti.'},
 ametista:{n:'Ametista',t:'crop',v:220,d:'Viola scuro. Dai piani profondi.'},
});
PROTECT.push([90,11,95,14]);

// ---------- tile della grotta ----------
GT[14]='cave';GT[15]='cavew';GSOLID.add(15);
function genMineTiles(){const mk16=(seed,fn)=>{const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');srand(seed);fn(x);return c};
 const px=(x,c,a,b,w=1,h=1)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 T.cave=[0,1,2].map(v=>mk16(300+v,x=>{px(x,'#3a332e',0,0,16,16);for(let i=0;i<26;i++)px(x,['#443c36','#332d29','#4a423b'][ri(0,2)],ri(0,15),ri(0,15),ri(1,2),1);if(v===2){px(x,'#5a5048',ri(2,12),ri(2,12),2,2)}}));
 T.cavew=[0,1].map(v=>mk16(310+v,x=>{px(x,'#1c1816',0,0,16,16);for(let j=0;j<3;j++)for(let i=0;i<3;i++){const c=['#2c2622','#26211e','#322b26'][ri(0,2)];px(x,c,i*5+1+(j%2)*2,j*5+1,4,4);px(x,'#3c342e',i*5+1+(j%2)*2,j*5+1,4,1)}px(x,'#0e0c0b',0,15,16,1)}))}

// ---------- minerali per profondità ----------
function oreTable(f){if(f<10)return [['pietra',70],['ferro',30]];if(f<20)return [['pietra',48],['ferro',28],['quarzo',12],['rame',8],['nichel',4]];
 if(f<40)return [['pietra',38],['ferro',22],['quarzo',12],['rame',10],['nichel',8],['oro',6],['ametista',3],['diamante',1]];
 return [['pietra',30],['ferro',18],['quarzo',12],['rame',10],['nichel',10],['oro',10],['ametista',6],['diamante',4]]}
const ORE_COL={pietra:null,ferro:'#c8703a',quarzo:'#e8f4ff',rame:'#d8783a',nichel:'#b8c0c0',oro:'#f0c83a',ametista:'#a85ad8',diamante:'#a8f0ff'};
function pickOre(f){const L=oreTable(f);let t=L.reduce((a,o)=>a+o[1],0),r=Math.random()*t;for(const [id,w] of L){r-=w;if(r<=0)return id}return 'pietra'}

// ---------- un piano ----------
function buildFloor(f,st){const W2=36,H2=24,m=new GMap('miniera',W2,H2,{interior:1,name:'Miniera · piano '+f});srand(f*7919+st.day*31);
 // grotta: automa cellulare, poi solo la parte raggiungibile dall'ingresso
 let g=[];for(let y=0;y<H2;y++){g[y]=[];for(let x=0;x<W2;x++)g[y][x]=(x<2||y<2||x>=W2-2||y>=H2-2)?1:(rnd()<.44?1:0)}
 for(let it=0;it<4;it++){const n=g.map(r=>r.slice());for(let y=1;y<H2-1;y++)for(let x=1;x<W2-1;x++){let c=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)c+=g[y+j][x+i];n[y][x]=c>=5?1:c<=3?0:g[y][x]}g=n;for(let y=0;y<H2;y++)for(let x=0;x<W2;x++)if(x<2||y<2||x>=W2-2||y>=H2-2)g[y][x]=1}
 let sx=4,sy=4;for(let k=0;k<400;k++){const x=ri(3,W2-4),y=ri(3,H2-4);if(!g[y][x]&&!g[y+1][x]){sx=x;sy=y;break}}g[sy][sx]=0;g[sy+1][sx]=0;
 const seen=new Set([sx+','+sy]),Q=[[sx,sy]];while(Q.length){const [x,y]=Q.shift();for(const [dx,dy] of DIRV){const a=x+dx,b=y+dy,k=a+','+b;if(!g[b]||g[b][a]!==0||seen.has(k))continue;seen.add(k);Q.push([a,b])}}
 for(let y=0;y<H2;y++)for(let x=0;x<W2;x++)m.set(x,y,seen.has(x+','+y)?14:15);
 const floor=[...seen].map(k=>k.split(',').map(Number)).filter(([x,y])=>Math.hypot(x-sx,y-sy)>2.5);
 m.start=[sx,sy+1];m.f=f;
 m.add(OB('scalasu',sx,sy,IMG.scalaSu,{act:'scalasu',solid:[[sx,sy]],hits:[[sx,sy]]}));m.lights.push({x:sx*16+8,y:sy*16,r:46,fire:1});
 // rocce: una nasconde la scala
 const nR=Math.min(60,26+Math.floor(f*.8));const spots=floor.sort(()=>rnd()-.5);const rocks=spots.slice(0,nR);
 rocks.forEach(([x,y],i)=>{const ore=pickOre(f);m.add(OB('mrock',x,y,mineRockImg(ore),{act:'mrock',ore,hp:f<20?2:3,ladder:i===0}))});
 // torce sulle pareti, forzieri, cristalli che fanno luce
 for(const [x,y] of spots.slice(nR,nR+4)){m.lights.push({x:x*16+8,y:y*16-4,r:52,fire:1});m.add(OB('torcia',x,y,IMG.torcia,{solid:[],hits:[]}))}
 if(f%10===0||rnd()<.22){const [x,y]=spots[nR+5]||spots[spots.length-1];m.add(OB('mchest',x,y,IMG.mchest,{act:'mchest'}))}
 if(f>=15)for(const [x,y] of spots.slice(nR+6,nR+6+Math.min(5,Math.floor(f/15)))){m.lights.push({x:x*16+8,y:y*16+2,r:30,cold:1});m.add(OB('cristallo',x,y,IMG.cristallo,{solid:[],hits:[]}))}
 buildGround(m);
 // le Ombre: dal piano 3, sempre di più
 G.mshad=[];const nS=f<3?0:Math.min(7,1+Math.floor(f/6));for(let i=0;i<nS;i++){const [x,y]=spots[spots.length-1-i]||[sx,sy];G.mshad.push({x:x*16+8,y:y*16+14,dir:0,anim:0,moving:true,a:0,cd:0,hp:f<25?1:2})}
 return m}
function mineRockImg(ore){const key='mr_'+ore;if(IMG[key])return IMG[key];const base=IMG.rock[ore==='pietra'?1:0];const c=document.createElement('canvas');c.width=base.width;c.height=base.height;c.s=base.s;const x=c.getContext('2d');x.drawImage(base,0,0);
 x.globalCompositeOperation='multiply';x.fillStyle='#8a8090';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(base,0,0);x.globalCompositeOperation='source-over';
 const col=ORE_COL[ore];if(col){srand(ore.length*97);const S=c.width/16;for(let i=0;i<7;i++){const a=(4+ri(0,8))*S,b=(c.height/S-12+ri(0,7))*S;x.fillStyle=col;x.fillRect(a,b,S*2,S*2);x.fillStyle='rgba(255,255,255,.7)';x.fillRect(a,b,S,S)}x.globalCompositeOperation='destination-in';x.drawImage(base,0,0);x.globalCompositeOperation='source-over'}
 IMG[key]=c;return c}

// ---------- entrare, scendere, risalire ----------
async function mineGo(f){const st=G.st,ms=mineSt(st);G.cut++;try{AU.play('door');await UI.fade(1,300);
  const m=buildFloor(f,st);G.maps.miniera=m;G.map=m;setPos(G.player,m.start[0],m.start[1],0);updateCam(0);G.parts=[];
  if(f>ms.deep)ms.deep=f;if(f%5===0&&f>ms.max){ms.max=f;UI.toast(`Ascensore: da adesso puoi scendere direttamente al piano ${f}.`)}
  await UI.fade(0,300);UI.toast(`Miniera — piano ${f}`)}finally{G.cut--}}
async function mineLeave(){G.cut++;try{AU.play('door');await UI.fade(1,300);G.mshad=[];delete G.maps.miniera;rebuildMaps();G.map=G.maps.main;setPos(G.player,MINE_IN[0],MINE_IN[1]+1,0);updateCam(0);await UI.fade(0,300);NET.save(G.st)}finally{G.cut--}}
async function mineEnter(){const st=G.st;if(G.visit)return narr('La miniera di un altro villaggio. Meglio non entrare senza il padrone.');const ms=mineSt(st);
 if(!countItem('piccone'))return narr('Senza piccone, laggiù, non fai niente.');
 const opts=['Scendi al piano 1'];const lifts=[];for(let f=5;f<=ms.max;f+=5)lifts.push(f);const top=lifts.slice(-3);top.forEach(f=>opts.push(`Ascensore: piano ${f}`));opts.push('Niente');
 const c=await ask(null,`L'imbocco della miniera vecchia. Esce aria fredda, e un odore di ferro.${ms.deep?` Il punto più profondo che hai raggiunto: piano ${ms.deep}.`:''}`,opts);
 if(c===0)return mineGo(1);if(c>0&&c<=top.length)return mineGo(top[c-1])}
PROMPT.miniera='Miniera';PROMPT.mrock='Scava';PROMPT.scalasu='Risali';PROMPT.scalagiu='Scendi';PROMPT.mchest='Apri';
ACT.miniera=()=>mineEnter();
// l'imbocco sulla Collina
{const _be=buildEast;buildEast=function(m,st){_be(m,st);if(m.id!=='main'||!isFree(st)||m.w<100||!zoneOpen('collina',st))return;const [x,y]=MINE_IN;
 m.objs.filter(o=>o.tx>=x-2&&o.tx<=x+3&&o.ty>=y-3&&o.ty<=y+5&&o.kind!=='built').forEach(o=>mapRemove(m,o));for(let j=y-3;j<=y+5;j++)for(let i=x-2;i<=x+3;i++)m.set(i,j,1);for(let j=y+1;j<=y+5;j++){m.set(x,j,2);m.set(x+1,j,2)}
 if(!IMG.imbocco)genMineArt();m.add(OB('miniera',x,y,IMG.imbocco,{wt:2,act:'miniera',solid:[[x,y],[x+1,y]],hits:[[x,y],[x+1,y]]}))}}

// ---------- scavare e il resto, nella miniera ----------
function mineAct(fx,fy){const st=G.st,m=G.map,it=selItem(),id=it&&it.id,o=m.objAt(fx,fy),p=G.player;
 // un colpo a un'Ombra davanti
 if(id&&['piccone','accetta','pala','hoe'].includes(id)){const ax=p.x+DIRV[p.dir][0]*14,ay=p.y+DIRV[p.dir][1]*14;const s=(G.mshad||[]).find(s=>Math.hypot(s.x-ax,s.y-ay)<16);
  if(s){if(!useEnergy(1))return true;s.hp--;s.hitT=G.t;AU.play('whisper');burst('dust',s.x,s.y-10,8,'#3a3040');if(s.hp<=0){s.gone=1;if(Math.random()<.5){addItem('essenza',1);floatText('+ Essenza d\'ombra',s.x,s.y-24,'#c8a8ff')}addXP('racc',8)}return true}}
 if(!o){if(id==='piccone')UI.toast('Solo roccia viva. Cerca le pietre da scavare.');return true}
 if(o.act==='scalasu'){(async()=>{const c=await ask(null,`Piano ${m.f}. Risali in superficie?`,['Risali','Resta']);if(c===0)mineLeave()})();return true}
 if(o.act==='scalagiu'){mineGo(m.f+1);return true}
 if(o.act==='mchest'){const f=m.f,money=60+f*25+Math.floor(Math.random()*f*10);st.money+=money;const loot=[f>=20?(Math.random()<.5?'oro':'ametista'):f>=10?'quarzo':'ferro',Math.random()<.3?'diamante':null].filter(Boolean);
  for(const l of loot)addItem(l,l==='diamante'?1:2+Math.floor(f/10));if(f%10===0&&Math.random()<.6)addItem(['statua','fontana','lampadario','specchio','banderuola'][Math.floor(f/10)%5],1);
  mapRemove(m,o);AU.play('coin');UI.hud();UI.toast(`Un forziere! +${SC(money)}${loot.length?' e '+loot.map(l=>ITEMS[l].n.toLowerCase()).join(', '):''}.`);return true}
 if(o.act==='mrock'){if(id!=='piccone'){UI.toast('Ci vuole il piccone.');return true}if(!useEnergy(skLv('racc')>=2?1:2))return true;o.hp-=goldTools()?2:1;markHit(o);AU.play('mine');hitFx(fx,fy,'#a8a59a');if(o.hp>0)return true;
  mapRemove(m,o);const n=o.ore==='pietra'?2+Math.floor(Math.random()*3):o.ore==='diamante'?1:1+(Math.random()<.35?1:0);if(addItem(o.ore,n)){flyPop(o.ore,fx*16+8,fy*16-4);floatText(`+${n} ${ITEMS[o.ore].n}`,fx*16+8,fy*16-6,ORE_COL[o.ore]||'#fff4c0')}addXP('racc',o.ore==='pietra'?3:8);
  if(o.ladder){m.add(OB('scalagiu',fx,fy,IMG.scalaGiu,{act:'scalagiu',solid:[],hits:[[fx,fy]]}));AU.play('ok');UI.toast('Sotto la roccia c\'è una scala che scende.')}
  // se restano poche rocce e la scala non è uscita, compare comunque
  if(!m.objs.some(q=>q.act==='mrock')&&!m.objs.some(q=>q.act==='scalagiu')){m.add(OB('scalagiu',fx,fy,IMG.scalaGiu,{act:'scalagiu',solid:[],hits:[[fx,fy]]}))}return true}
 return true}
{const _da=doAction;doAction=function(){if(G.map&&G.map.id==='miniera'&&!G.bm){toolSwing();const [fx,fy]=frontTile();return mineAct(fx,fy)}return _da()}}
// le Ombre della miniera
G.mshad=[];
function mineTick(dt){if(!G.map||G.map.id!=='miniera'||G.mode!=='game'||G.cut||UI.busy())return;const st=G.st,p=G.player;
 for(const s of G.mshad){s.a=Math.min(.8,s.a+dt*.6);s.anim+=dt*6;s.cd=Math.max(0,s.cd-dt);const dx=p.x-s.x,dy=p.y-s.y,d=Math.hypot(dx,dy)||1;
  // sentono il giocatore da vicino; la luce delle torce le rallenta
  const lit=G.map.lights.some(l=>Math.hypot(l.x-s.x,l.y-s.y)<l.r*.8),sp=d<150?(lit?10:22+Math.min(14,G.map.f*.3)):6;
  const nx=s.x+dx/d*sp*dt,ny=s.y+dy/d*sp*dt;if(!G.map.solid(Math.floor(nx/16),Math.floor((ny-4)/16))){s.x=nx;s.y=ny}s.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);
  if(d<12&&!s.cd){s.cd=1.4;AU.play('whisper');G.shake=1.5;st.energy=Math.max(0,st.energy-(6+Math.floor(G.map.f/10)));UI.hud();p.x-=dx/d*10;p.y-=dy/d*10;if(st.energy<=0){UI.toast('Sei sfinit{o|a}. Le Ombre ti spingono su, verso la luce.','bad');mineLeave()}}}
 G.mshad=G.mshad.filter(s=>{if(s.gone)burst('dust',s.x,s.y-10,10,'#2a2030');return !s.gone})}
{const _mt=mpTick;mpTick=function(dt){_mt(dt);mineTick(dt)}}
{const _we=drawWorldExtras;drawWorldExtras=function(m){_we(m);if(m.id!=='miniera')return;for(const s of G.mshad||[]){drawShadow(s);if(s.hitT&&G.t-s.hitT<.2){ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(s.x-6,s.y-28,12,26)}}}}
// buio pesto, tranne le torce e la tua lanterna
{const _dl=darkLevel;darkLevel=function(){const d=_dl();return G.map&&G.map.id==='miniera'?.9:d}}
// il piano corrente, in alto
{const _dg=drawGuide;drawGuide=function(){_dg();if(!G.map||G.map.id!=='miniera'||G.mode!=='game')return;ctx.save();ctx.font='8px "Silkscreen","Pixelify Sans",monospace';ctx.textAlign='center';const t=`MINIERA · PIANO ${G.map.f}`;ctx.fillStyle='rgba(18,11,16,.75)';ctx.fillRect(W/2-46,4,92,12);ctx.fillStyle='#f6d98a';ctx.fillText(t,W/2,13);ctx.restore()}}
// se salvi o esci dentro la miniera, ti ritrovi all'imbocco
{const _sv=NET.save.bind(NET);NET.save=async function(st){if(st&&G.map&&G.map.id==='miniera'&&st===G.st){st.map='main';st.px=MINE_IN[0];st.py=MINE_IN[1]+1}return _sv(st)}}
{const _rb=rebuildMaps;rebuildMaps=function(){const mm=G.maps&&G.maps.miniera,cur=G.map;_rb();if(mm){G.maps.miniera=mm;if(cur&&cur.id==='miniera')G.map=mm}}}
// il prestigio conta anche la profondità
{const _vs=villageScore;villageScore=function(st){st=st||homeSt();const s=_vs(st);return st&&isFree(st)&&st.free.mine?s+Math.min(400,(st.free.mine.deep||0)*3):s}}

// ---------- grafica ----------
function genMineArt(){genMineTiles();const wood=rp('#7a5030'),dk=rp('#4a2e18'),rock=rp('#6a6460');
 IMG.imbocco=SP(32,30,P=>{P.body(4,60,()=>32,Y=>Math.min(31,8+Y*.75),rock,{nyF:Y=>Y<20?-.5:.15,mod:(X,Y,v)=>((X*3+Y*5)%13===0||(X*7+Y)%17===0)?v-.3:v+(((X+Y)%5)-2)*.02});
  P.ellipse(12,8,5,3,rp('#5a8a3a'));P.ellipse(48,12,6,3,rp('#5a8a3a'));P.ellipse(30,5,4,2,rp('#6a9a4a'));
  P.ellipse(32,36,12,10,rp('#0c0a0a'),{edge:false});P.rect(20,36,24,24,rp('#0c0a0a'),{edge:false});
  P.capsule(19,60,19,30,2.4,wood);P.capsule(45,60,45,30,2.4,wood);P.capsule(15,29,49,29,2.6,wood);P.rect(26,20,12,7,rp('#c8a03a'),{spec:.6});P.line(28,23,36,23,C('#5a3a1e'))});
 IMG.scalaSu=SP(16,22,P=>{P.capsule(9,4,9,44,1.6,wood);P.capsule(23,4,23,44,1.6,wood);for(let y=8;y<44;y+=7)P.capsule(9,y,23,y,1.2,dk)});
 IMG.scalaGiu=SP(16,16,P=>{P.ellipse(16,18,13,9,rp('#0c0a0a'),{edge:false});P.capsule(10,10,10,26,1.4,wood);P.capsule(22,10,22,26,1.4,wood);for(let y=14;y<26;y+=5)P.capsule(10,y,22,y,1,dk)});
 IMG.torcia=SP(8,16,P=>{P.capsule(8,14,8,30,1.4,wood);P.ellipse(8,10,3.4,5,rp('#ffb84a'),{amb:1,edge:false});P.ellipse(8,11,1.8,3,rp('#fff0a0'),{amb:1,edge:false})});
 IMG.mchest=SP(16,14,P=>{P.rect(3,10,26,16,wood,{mod:woodMod});P.body(3,11,()=>16,()=>13,dk,{nyF:()=>-.5});P.rect(3,14,26,2,rp('#c8a03a'),{spec:.8});P.rect(14,14,4,6,rp('#e8c23a'),{spec:1})});
 IMG.cristallo=SP(12,16,P=>{for(const [x,h,c] of [[8,20,'#a85ad8'],[14,26,'#c8a0f0'],[18,16,'#8a4ab8']])P.body(30-h,30,()=>x,Y=>Math.max(.5,2.6-(30-Y)*.06),rp(c),{spec:1})});
 const I=(id,fn)=>{const P=new PX(32,32);fn(P);P.outline();ICON[id]=pxCanvas(P)};
 I('essenza',P=>{P.body(8,28,()=>16,Y=>5+Math.sin((Y-8)/20*Math.PI)*3,rp('#c8d8e8'),{spec:.8});P.ellipse(16,20,5,6,rp('#3a2a4a'),{amb:.6});P.rect(13,5,6,4,rp('#5a3a1e'))});
 I('quarzo',P=>{for(const [x,h] of [[11,16],[16,22],[21,14]])P.body(28-h,28,()=>x,Y=>Math.max(.5,3.2-(28-Y)*.1),rp('#e8f4ff'),{spec:1})});
 I('ametista',P=>{for(const [x,h] of [[11,15],[16,21],[21,13]])P.body(28-h,28,()=>x,Y=>Math.max(.5,3.2-(28-Y)*.1),rp('#a85ad8'),{spec:1})})}
{const _af=applyFree;applyFree=function(m,st){if(!IMG.imbocco&&PX.prototype.line)genMineArt();_af(m,st)}}
GUIDES.push({id:'miniera',v:4,n:'La miniera senza fondo',steps:[
 {t:'Novità: sulla <b>Collina</b>, verso est, si è riaperto l\'imbocco della <b>miniera vecchia</b>. Serve il piccone.',at:()=>zoneOpen('collina')?{x:MINE_IN[0]*16+16,y:MINE_IN[1]*16+4,l:'La miniera'}:null},
 {t:'Ogni piano è diverso. Scava le rocce: più scendi, più trovi ferro, quarzo, rame, nichel, oro, ametiste e diamanti. Una roccia nasconde la <b>scala per scendere</b>.'},
 {t:'Dal piano 3 ci sono le <b>Ombre</b>: se ti toccano perdi energia. Un colpo d\'attrezzo le scaccia; la luce delle torce le rallenta. Ogni 5 piani l\'<b>ascensore</b> ricorda la strada. Il fondo non c\'è.'}]});
