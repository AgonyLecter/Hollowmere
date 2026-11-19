'use strict';
// ================= GIOCO LIBERO: la Valle dopo il finale =================
// Stagioni vere, attrezzi, risorse, banco da lavoro, oggetti da costruire. Si attiva con st.free.

// ---------- stagioni ----------
const SEASONS=['Autunno','Inverno','Primavera','Estate'];
const SEASON_LEN=28;
const isFree=st=>!!((st||G.st)&&(st||G.st).free);
function seasonOf(st){st=st||G.st;if(!isFree(st))return 0;return Math.floor((st.day-st.free.start)/SEASON_LEN)%4}
function seasonDay(st){st=st||G.st;if(!isFree(st))return st.day;return (st.day-st.free.start)%SEASON_LEN+1}
function yearOf(st){st=st||G.st;if(!isFree(st))return 1;return Math.floor((st.day-st.free.start)/(SEASON_LEN*4))+1}
const seasonName=st=>SEASONS[seasonOf(st)];
function dateLabel(st){st=st||G.st;return `${DAYN[(st.day+3)%7]} ${seasonDay(st)} · ${seasonName(st)}${isFree(st)&&yearOf(st)>1?' · anno '+yearOf(st):''}`}

// colture: stagioni in cui crescono (0 autunno, 1 inverno, 2 primavera, 3 estate)
Object.assign(CROPS.rapa,{s:[0,2]});Object.assign(CROPS.patata,{s:[0,2]});Object.assign(CROPS.zucca,{s:[0]});Object.assign(CROPS.fagioli,{s:[0,3]});Object.assign(CROPS.cavolo,{s:[0,1]});
Object.assign(CROPS,{
 fragola:{days:4,n:'Fragole',y:[1,2],re:2,s:[2]},
 pomodoro:{days:5,n:'Pomodori',y:[1,3],re:2,s:[3]},
 mais:{days:5,n:'Mais',y:[1,2],s:[3]},
 porro:{days:4,n:'Porro',y:[1,1],s:[1]},
});
const SEASON_ICON=['🍂','❄','🌱','☀'];
Object.assign(ITEMS,{
 s_fragola:{n:'Semi di fragola',t:'seed',crop:'fragola',p:70,x:'Si raccolgono più volte.'},
 s_pomodoro:{n:'Semi di pomodoro',t:'seed',crop:'pomodoro',p:60,x:'Si raccolgono più volte.'},
 s_mais:{n:'Semi di mais',t:'seed',crop:'mais',p:55},
 s_porro:{n:'Semi di porro',t:'seed',crop:'porro',p:45,x:'L\'unico che non teme il gelo.'},
 fragola:{n:'Fragole',t:'crop',v:55},pomodoro:{n:'Pomodori',t:'crop',v:45},mais:{n:'Mais',t:'crop',v:120},porro:{n:'Porro',t:'crop',v:150},
 // attrezzi e risorse
 accetta:{n:'Accetta',t:'tool',d:'Abbatte alberi e taglia rami. Di Brom.'},
 piccone:{n:'Piccone',t:'tool',d:'Spacca sassi e rocce. Di Brom.'},
 legna:{n:'Legna',t:'res',d:'Dagli alberi e dai rami. Serve al banco da lavoro.'},
 pietra:{n:'Pietra',t:'res',d:'Dalle rocce. Serve al banco da lavoro.'},
 fibra:{n:'Fibra',t:'res',d:'Dalle erbacce. Si intreccia.'},
 // oggetti da piazzare
 banco:{n:'Banco da lavoro',t:'place',d:'Mettilo a terra e usalo per costruire.'},
 cassa:{n:'Cassa',t:'place',d:'Venti posti per le tue cose.'},
 irrigatore:{n:'Irrigatore',t:'place',d:'Ogni mattina bagna le quattro zolle intorno.'},
 lampione:{n:'Lampione',t:'place',d:'Una luce gialla tutta tua. Di notte fa compagnia.'},
 recinto:{n:'Recinto',t:'place',d:'Un pezzo di staccionata.'},
 panchina:{n:'Panchina',t:'place',d:'Per sedersi a guardare la Valle.'},
});
Object.assign(PL,{fragola:'cestini di fragole',pomodoro:'cestini di pomodori',mais:'pannocchie',porro:'porri'});
Object.assign(SG,{fragola:'un cestino di fragole',pomodoro:'un cestino di pomodori',mais:'una pannocchia',porro:'un porro'});
Object.assign(FAV_VAL,{fragola:55,pomodoro:45,mais:120,porro:150});
const cropInSeason=(t,s)=>!CROPS[t].s||CROPS[t].s.includes(s);

// ricette del banco da lavoro
const CRAFTS=[
 {id:'recinto',q:2,c:{legna:2}},
 {id:'concime',q:2,c:{fibra:5}},
 {id:'cassa',q:1,c:{legna:25}},
 {id:'panchina',q:1,c:{legna:15,pietra:5}},
 {id:'lampione',q:1,c:{legna:5,pietra:12,fibra:2}},
 {id:'irrigatore',q:1,c:{pietra:20,legna:10,fibra:5}},
 {id:'banco',q:1,c:{legna:20,pietra:5}},
];
// che attrezzo serve per togliere un oggetto piazzato
const PLACE_TOOL={banco:'accetta',cassa:'accetta',recinto:'accetta',panchina:'accetta',lampione:'piccone',irrigatore:'piccone'};

// ---------- grafica ----------
const FREEIMG={};
function genFreeArt(){
 const I=(id,fn)=>{const P=new PX(32,32);fn(P);P.outline();ICON[id]=pxCanvas(P)};
 const wood=rp('#8a5a30'),iron=rp('#9a9aa2'),stone=rp('#8a877d');
 I('accetta',P=>{P.capsule(8,29,22,7,1.6,wood);P.ellipse(23,8,6,5,iron,{spec:.8,clip:(X,Y)=>X>19});P.rect(19,4,4,8,iron,{spec:.6})});
 I('piccone',P=>{P.capsule(16,29,16,8,1.6,wood);P.capsule(4,10,28,10,2,iron,{r2:1.2,spec:.8});P.capsule(4,10,3,15,1.2,iron)});
 I('legna',P=>{for(const [y,x0] of [[22,6],[16,10],[22,16]]){P.capsule(x0,y,x0+12,y,4,rp('#8a5a30'),{spec:.2});P.ellipse(x0+12,y,3,4,rp('#d8b078'),{spec:.4})}});
 I('pietra',P=>{P.ellipse(13,20,9,7,stone,{spec:.4});P.ellipse(21,16,7,6,rp('#9a978d'),{spec:.4})});
 I('fibra',P=>{for(let i=0;i<5;i++)P.capsule(10+i*3,28,8+i*4,5+(i%2)*3,1,rp(i%2?'#7aa83a':'#5a8a2a'),{r2:.6})});
 I('banco',P=>{P.rect(4,10,24,6,wood,{mod:woodMod,spec:.3});P.rect(6,16,3,13,rp('#5a3a1e'));P.rect(23,16,3,13,rp('#5a3a1e'));P.capsule(9,8,15,8,1,iron);P.rect(18,6,6,4,rp('#6a6a72'),{spec:.6})});
 I('cassa',P=>{P.rect(5,9,22,18,wood,{mod:woodMod,spec:.2});P.rect(5,9,22,6,rp('#6a4424'),{spec:.3});P.rect(14,13,4,5,rp('#d8a84a'),{spec:.8})});
 I('irrigatore',P=>{P.ellipse(16,22,9,4,stone,{spec:.3});P.capsule(16,22,16,10,2,rp('#6a6a72'),{spec:.6});P.ellipse(16,9,4,2.4,rp('#8a9aa8'),{spec:.8});for(const [a,b] of [[8,6],[24,6],[6,12],[26,12]])P.ellipse(a,b,1.2,1.2,rp('#7ab0e8'),{edge:false})});
 I('lampione',P=>{P.rect(15,10,3,19,rp('#3a3a40'),{spec:.4});P.rect(10,27,13,3,stone);P.rect(11,3,11,9,rp('#3a3a40'));P.rect(13,5,7,5,rp('#ffe08a'),{amb:.95,edge:false})});
 I('recinto',P=>{for(const x of [7,23])P.rect(x,8,4,20,rp('#e8c23a'),{mod:woodMod});P.rect(4,12,24,3,rp('#e8c23a'));P.rect(4,20,24,3,rp('#e8c23a'))});
 I('panchina',P=>{P.rect(4,12,24,5,wood,{mod:woodMod});P.rect(4,6,24,4,wood,{mod:woodMod});P.rect(6,17,2,10,rp('#3a2414'));P.rect(24,17,2,10,rp('#3a2414'))});
 I('fragola',P=>{for(const [a,b] of [[11,19],[21,18],[16,24]]){P.ellipse(a,b,5,6,rp('#d8302a'),{spec:.6});P.set(a-1,b,C('#f8e070'));P.set(a+1,b+2,C('#f8e070'))}P.capsule(12,10,20,9,1.4,rp('#5a9a2a'))});
 I('pomodoro',P=>{P.ellipse(16,19,10,9,rp('#e0402a'),{spec:.7});P.capsule(12,10,20,10,1.2,rp('#4a8a2a'));P.capsule(16,10,16,6,1,rp('#4a8a2a'))});
 I('mais',P=>{P.capsule(16,28,16,7,5,rp('#f0c83a'),{r2:3,spec:.5,mod:(X,Y,v)=>((X+Y*2)%4===0)?v-.2:v});P.capsule(9,28,14,10,1.6,rp('#7aa83a'),{r2:.6});P.capsule(23,28,18,10,1.6,rp('#5a8a2a'),{r2:.6})});
 I('porro',P=>{P.capsule(16,30,16,16,3.4,rp('#f2f0e0'),{spec:.4});P.capsule(16,18,8,3,1.6,rp('#5a8a4a'),{r2:2.4});P.capsule(16,18,24,3,1.6,rp('#4a7a3a'),{r2:2.4});P.capsule(16,18,16,2,1.6,rp('#6a9a5a'),{r2:2.2})});
 const packet=(id,crop,col)=>{const P=new PX(32,32);P.rect(6,4,20,26,rp('#e8d6a8'),{n:[.1,-.2,1]});P.rect(6,3,20,4,rp('#b89a68'),{n:[0,-.6,.8]});P.rect(6,24,20,5,rp(col),{n:[0,-.2,1]});P.outline();
  const c=pxCanvas(P),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(ICON[crop],8,6,16,16);ICON[id]=c};
 packet('s_fragola','fragola','#d8302a');packet('s_pomodoro','pomodoro','#e0402a');packet('s_mais','mais','#c9a03a');packet('s_porro','porro','#4a7a3a');
 // oggetti nel mondo
 FREEIMG.ramo=SP(16,10,P=>{P.capsule(6,14,26,10,1.6,wood);P.capsule(16,12,20,5,1,wood);P.ellipse(24,8,2,1.6,rp('#5a8a2a'))});
 FREEIMG.sasso=SP(14,10,P=>{P.ellipse(14,12,10,7,stone,{spec:.4});P.ellipse(10,10,3,2,rp('#a8a59a'),{edge:false})});
 FREEIMG.erbaccia=SP(14,12,P=>{for(let i=0;i<6;i++)P.capsule(8+i*2.6,22,4+i*4,4+(i%3)*3,.9,rp(i%2?'#6a9a2a':'#4a7a24'),{r2:.5})});
 FREEIMG.banco=SP(18,18,P=>{P.rect(2,10,32,8,wood,{mod:woodMod,spec:.3});P.rect(4,18,4,16,rp('#5a3a1e'));P.rect(28,18,4,16,rp('#5a3a1e'));P.rect(6,4,10,6,rp('#6a6a72'),{spec:.6});P.capsule(20,7,30,7,1.2,rp('#8a5a30'))});
 FREEIMG.cassa=SP(16,15,P=>{P.rect(2,6,28,22,wood,{mod:woodMod,spec:.2});P.rect(2,6,28,8,rp('#6a4424'),{spec:.3});P.rect(13,11,6,7,rp('#d8a84a'),{spec:.8})});
 FREEIMG.irrigatore=SP(14,14,P=>{P.ellipse(14,22,10,4,stone,{spec:.3});P.capsule(14,22,14,10,2.2,rp('#6a6a72'),{spec:.6});P.ellipse(14,8,5,3,rp('#8a9aa8'),{spec:.8})});
 // alberi di stagione (stesse forme dell'autunno, altri colori; d'inverno spogli e innevati)
 const PALS={
  2:[['#1e3a18','#2e5a22','#467c2e','#62a03a','#86c050','#b8e07a'],['#3a1e2a','#6a3448','#a85878','#d888a8','#f0b0c8','#fde0ea'],['#1a3418','#2a5020','#3e702a','#5a9636','#7cb848','#a8d870'],['#1e3a18','#2e5a22','#467c2e','#62a03a','#86c050','#b8e07a'],['#16261a','#253f22','#3a5c2c','#56803a','#77a24a','#a2c66a']],
  3:[['#102a10','#1a4218','#285e22','#3a7a2c','#56983a','#7ab450'],['#142a12','#20441c','#305e26','#447a32','#5c963e','#82b25a'],['#0e2410','#183a16','#265420','#36702a','#4c8c36','#6aa84a'],['#102a10','#1a4218','#285e22','#3a7a2c','#56983a','#7ab450'],['#16261a','#253f22','#3a5c2c','#56803a','#77a24a','#a2c66a']],
 };
 const orig=TREEPAL.slice();FREEIMG.trees={0:IMG.tree};
 for(const s of [2,3]){PALS[s].forEach((p,i)=>TREEPAL[i]=p);FREEIMG.trees[s]=[0,1,2,3,4].map(genTreeHD)}
 orig.forEach((p,i)=>TREEPAL[i]=p);
 FREEIMG.trees[1]=[0,1,2,3,4].map(winterTree);
 // colture nuove (stessa griglia 32×48 delle altre)
 const S=fn=>{const P=new PX(32,48);fn(P);P.outline();const c=pxCanvas(P);c.top=imgTop(c);return c};
 const soil=rp('#6a4428'),stem=rp('#4a7a24'),lf=rp('#5a9a2a'),lf2=rp('#3f7424');
 const mound=(P,col)=>{P.ellipse(16,42,7,2.8,soil,{spec:.1});for(const [a,b] of [[13,41],[18,41],[16,43]])P.ellipse(a,b,1.3,1,rp(col),{edge:false,spec:.6})};
 const sprout=P=>{P.ellipse(16,43,5,1.6,soil,{edge:false});P.capsule(16,43,16,35,.8,stem);P.capsule(16,36,10,32,.7,rp('#7aba3a'),{r2:2.2});P.capsule(16,35,22,31,.7,rp('#7aba3a'),{r2:2.2})};
 CROPIMG.fragola=[S(P=>mound(P,'#e8d0a0')),S(sprout),S(P=>{for(const [a,b] of [[8,34],[16,30],[24,34],[12,38],[20,38]])P.ellipse(a,b,4.4,3.4,lf,{spec:.2});P.ellipse(16,40,2,1.6,rp('#f6f2dc'),{edge:false})}),
  S(P=>{for(const [a,b] of [[7,32],[16,28],[25,32],[11,37],[21,37]])P.ellipse(a,b,4.8,3.6,lf,{spec:.2});for(const [a,b] of [[9,40],[17,41],[24,39],[13,35]]){P.ellipse(a,b,2.4,2.8,rp('#d8302a'),{spec:.7});P.set(a,b,C('#f8e070'))}})];
 const stake=(P,y0)=>P.rect(23,y0,2,43-y0,rp('#8a5a30'),{n:[.3,0,1]});
 CROPIMG.pomodoro=[S(P=>mound(P,'#e8d0a0')),S(P=>{stake(P,24);sprout(P)}),S(P=>{stake(P,12);P.capsule(16,43,18,16,1,stem);for(let i=0;i<5;i++)P.ellipse(16+(i%2?6:-5),38-i*5,4.4,3,i%2?lf:lf2,{spec:.2})}),
  S(P=>{stake(P,6);P.capsule(16,43,19,8,1,stem);for(let i=0;i<7;i++)P.ellipse(16+(i%2?6:-5),40-i*5,4.6,3,i%2?lf:lf2,{spec:.2});for(const [a,b] of [[11,30],[21,24],[12,18],[20,36]])P.ellipse(a,b,3,3,rp('#e0402a'),{spec:.7})})];
 CROPIMG.mais=[S(P=>mound(P,'#f0c83a')),S(sprout),S(P=>{P.capsule(16,43,16,18,1.4,stem);for(let i=0;i<4;i++)P.capsule(16,40-i*6,i%2?28:4,30-i*6,.8,i%2?lf:lf2,{r2:1.6})}),
  S(P=>{P.capsule(16,43,16,4,1.6,stem);for(let i=0;i<5;i++)P.capsule(16,40-i*6,i%2?29:3,30-i*6,.8,i%2?lf:lf2,{r2:1.6});P.capsule(19,26,21,16,2.6,rp('#f0c83a'),{spec:.5});P.capsule(16,5,16,1,1,rp('#d8b048'))})];
 CROPIMG.porro=[S(P=>mound(P,'#d0d8c0')),S(P=>{P.ellipse(16,43,5,1.6,soil,{edge:false});P.capsule(16,43,16,34,1.2,rp('#6a9a5a'))}),S(P=>{P.capsule(16,43,16,30,2,rp('#e8ecd8'));P.capsule(16,32,10,20,1,rp('#5a8a4a'),{r2:1.6});P.capsule(16,32,22,20,1,rp('#4a7a3a'),{r2:1.6})}),
  S(P=>{P.capsule(16,43,16,26,3,rp('#f2f0e0'),{spec:.4});P.capsule(16,28,7,12,1.2,rp('#5a8a4a'),{r2:2.2});P.capsule(16,28,25,12,1.2,rp('#4a7a3a'),{r2:2.2});P.capsule(16,28,16,8,1.2,rp('#6a9a5a'),{r2:2})})];
 for(const t of ['fragola','pomodoro','mais','porro'])CROPW[t]=CROPIMG[t].map(wiltImg)}
// albero d'inverno: tronco e rami nudi, neve sopra
function winterTree(v){srand(400+v);const [c,x]=mk(88,116);c.s=2;const bark=['#22150b','#3a2414','#563820','#74502c'];
 for(let y=60;y<112;y++){const w=y>100?12+Math.min(14,(y-100)*2):10,x0=44-Math.floor(w/2);for(let i=0;i<w;i++){const t=i/(w-1);R_(x,bark[t<.2?3:t<.5?2:t<.85?1:0],x0+i,y)}}
 const br=(x0,y0,a,len,w,d)=>{const x1=x0+Math.cos(a)*len,y1=y0+Math.sin(a)*len;x.strokeStyle=bark[1+(d%2)];x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();
  x.strokeStyle='#eef3fa';x.lineWidth=Math.max(1,w*.45);x.beginPath();x.moveTo(x0,y0-w*.4);x.lineTo(x1,y1-w*.4);x.stroke();if(d<3)for(let k=0;k<2;k++)br(x1,y1,a+(k?-.5:.5)+(rnd()-.5)*.3,len*.65,w*.62,d+1)};
 br(44,64,-Math.PI/2,26,6,0);br(44,72,-Math.PI/2-.8,18,4,1);br(44,70,-Math.PI/2+.8,18,4,1);
 R_(x,'#eef3fa',30,108,28,3);c.canopyH=44;return outline(c,'#160c08')}
function wiltImg(src){const [c,x]=mk(src.width,src.height);x.drawImage(src,0,4);const d=x.getImageData(0,0,c.width,c.height),a=d.data;
 for(let i=0;i<a.length;i+=4){if(!a[i+3])continue;const L=(a[i]*.3+a[i+1]*.59+a[i+2]*.11)/255;a[i]=a[i]*.35+175*L*1.15*.65;a[i+1]=a[i+1]*.35+130*L*1.15*.65;a[i+2]=a[i+2]*.35+60*L*.65}
 x.putImageData(d,0,0);c.s=src.s;c.top=Math.min(c.height/c.s,(src.top||0)+2);return c}
// terreno di stagione: sopra lo strato già disegnato
function seasonGround(m){if(m.id!=='main'||!isFree())return;const s=seasonOf();if(!s)return;const c=m.ground,x=c.getContext('2d');
 if(s===1){x.globalCompositeOperation='source-atop';x.fillStyle='rgba(236,242,250,.62)';x.fillRect(0,0,c.width,c.height);srand(77);for(let i=0;i<2600;i++){x.fillStyle=i%3?'rgba(255,255,255,.7)':'rgba(190,205,225,.6)';x.fillRect(ri(0,c.width),ri(0,c.height),2,2)}}
 else{x.globalCompositeOperation='soft-light';x.fillStyle=s===2?'rgba(120,220,90,.55)':'rgba(170,220,70,.45)';x.fillRect(0,0,c.width,c.height)}
 x.globalCompositeOperation='source-over'}

// ---------- stato del mondo libero: alberi tagliati, detriti, costruzioni ----------
const fkey=(x,y)=>x+','+y;
function mapRemove(m,o){m.objs=m.objs.filter(q=>q!==o);for(const [x,y] of o.solid||[])if(m.inb(x,y))m.sol[y*m.w+x]=0;for(const [x,y] of (o.hits||o.solid||[]))if(m.hit[fkey(x,y)]===o)delete m.hit[fkey(x,y)];
 // un oggetto rimosso può aver coperto il blocco di un altro: rimetti i blocchi degli altri
 for(const q of m.objs)for(const [x,y] of q.solid||[])m.block(x,y)}
const REGROW={tree:10,rock:14,log:20};
function applyFree(m,st){if(m.id!=='main'||!isFree(st))return;const W2=st.free;
 for(const o of m.objs.slice()){if(!REGROW[o.kind])continue;const g=W2.gone[fkey(o.tx,o.ty)];if(!g)continue;
  if(st.day-g.day>=REGROW[o.kind]){delete W2.gone[fkey(o.tx,o.ty)];continue}
  mapRemove(m,o);if(o.kind==='tree'&&!g.stumpGone)m.add(OB('ceppo',o.tx,o.ty,IMG.stump,{act:'ceppo',of:fkey(o.tx,o.ty)}))}
 for(const k in W2.debris){const [x,y]=k.split(',').map(Number),t=W2.debris[k];if(m.hit[k]||m.solid(x,y)){delete W2.debris[k];continue}m.add(OB('debris',x,y,FREEIMG[t],{act:'debris',dt:t,solid:[],hits:[[x,y]]}))}
 for(const k in W2.built){const [x,y]=k.split(',').map(Number),b=W2.built[k];if(ITEMS[b.id].size){addBigBuilt(m,k,b);continue}const img=placeImg(b.id),o=m.add(OB('built',x,y,img,{act:'built',bk:k,bid:b.id}));
  if(b.id==='lampione')m.lights.push({x:x*16+8,y:y*16-14,r:62});}}
function placeImg(id){return {banco:FREEIMG.banco,cassa:FREEIMG.cassa,irrigatore:FREEIMG.irrigatore,lampione:IMG.lamp,recinto:IMG.fenceV,panchina:IMG.bench}[id]}
// ogni mattina: nuovi detriti nei prati e nei campi vuoti; gli irrigatori bagnano
function freeMorning(st){if(!isFree(st))return;const W2=st.free,m=G.maps&&G.maps.main;
 const n=Object.keys(W2.debris).length;if(n<40){const add=6+Math.floor(Math.random()*6);for(let i=0;i<add;i++){const x=4+Math.floor(Math.random()*56),y=6+Math.floor(Math.random()*36),k=fkey(x,y);
  if(W2.debris[k]||W2.built[k]||st.farm[k])continue;if(x>=40&&x<=50&&y>=13&&y<=24)continue;
  W2.debris[k]=inFarm(x,y)?['erbaccia','sasso','ramo','erbaccia'][i%4]:['ramo','sasso','erbaccia'][i%3]}}
 animalsMorning(st);
 for(const k in W2.built){if(W2.built[k].id!=='irrigatore')continue;const [x,y]=k.split(',').map(Number);for(const [a,b] of DIRV){const f=st.farm[fkey(x+a,y+b)];if(f)f.w=true}}}

// ---------- azioni con gli attrezzi ----------
G.hits={};
function hitFx(x,y,col){burst('dust',x*16+8,y*16+8,6,col);G.shake=Math.max(G.shake,.6)}
function freeAct(fx,fy){const st=G.st;if(!isFree(st)||G.map.id!=='main'||G.visit)return false;const m=G.map,it=selItem(),id=it&&it.id,o=m.objAt(fx,fy),k=fkey(fx,fy),W2=st.free,p=G.player;
 if(animalAct(p.x+DIRV[p.dir][0]*14,p.y+DIRV[p.dir][1]*14))return true;
 // raccogliere i detriti
 if(o&&o.kind==='debris'){const t=o.dt,need={ramo:'accetta',sasso:'piccone'}[t];if(need&&id!==need){UI.toast(t==='ramo'?'Un ramo secco. Ti serve l\'accetta.':'Un sasso. Ti serve il piccone.');return true}
  if(!useEnergy(1))return true;const got={ramo:['legna',1+(Math.random()<.5?1:0)],sasso:['pietra',1+(Math.random()<.4?1:0)],erbaccia:['fibra',1],uovo:['uovo',1]}[t];if(!addItem(got[0],got[1]))return true;
  delete W2.debris[k];mapRemove(m,o);AU.play(t==='sasso'?'mine':t==='ramo'?'chop':'pick');hitFx(fx,fy,t==='sasso'?'#a8a59a':'#8a6a3a');floatText(`+${got[1]} ${ITEMS[got[0]].n}`,fx*16+8,fy*16-4);st.flags.debris=(st.flags.debris||0)+1;return true}
 // alberi, ceppi, tronchi: accetta
 if(o&&(o.kind==='tree'||o.kind==='ceppo'||o.kind==='log')){if(id!=='accetta'){if(o.kind==='ceppo'){UI.toast('Un ceppo. Con l\'accetta lo togli.');return true}return false}
  const hk=fkey(o.tx,o.ty),need={tree:5,ceppo:2,log:6}[o.kind];if(!useEnergy(2))return true;G.hits[hk]=(G.hits[hk]||0)+1;AU.play('chop');hitFx(o.tx,o.ty,'#8a6a3a');
  if(o.kind==='tree'&&Math.random()<.5)for(let i=0;i<4;i++)G.parts.push({k:'spark',x:o.tx*16+8+(Math.random()-.5)*30,y:o.ty*16-30,vx:(Math.random()-.5)*20,vy:10,t:0,life:1,c:seasonOf()===1?'#eef3fa':['#d86a28','#e8a040','#6a9a3a','#5a9a2a'][seasonOf()]});
  if(G.hits[hk]<need){floatText('•'.repeat(G.hits[hk]),o.tx*16+8,o.ty*16-6,'#f6d98a',.6);return true}
  delete G.hits[hk];const n={tree:8+Math.floor(Math.random()*5),ceppo:3,log:14}[o.kind];if(!addItem('legna',n))return true;
  if(o.kind==='tree'){W2.gone[hk]={day:st.day};AU.play('slam');G.shake=3;mapRemove(m,o);m.add(OB('ceppo',o.tx,o.ty,IMG.stump,{act:'ceppo',of:hk}));st.flags.felled=(st.flags.felled||0)+1;tip('tutFell','Albero abbattuto! Tra una decina di giorni ne ricrescerà uno. Il ceppo si toglie con l\'accetta.')}
  else if(o.kind==='ceppo'){const g=W2.gone[o.of];if(g)g.stumpGone=1;mapRemove(m,o)}
  else{W2.gone[hk]={day:st.day};mapRemove(m,o)}
  floatText(`+${n} Legna`,o.tx*16+8,o.ty*16-10);return true}
 // rocce: piccone
 if(o&&o.kind==='rock'){if(id!=='piccone')return false;const hk=fkey(o.tx,o.ty);if(!useEnergy(2))return true;G.hits[hk]=(G.hits[hk]||0)+1;AU.play('mine');hitFx(o.tx,o.ty,'#a8a59a');
  if(G.hits[hk]<3){floatText('•'.repeat(G.hits[hk]),o.tx*16+8,o.ty*16-6,'#f6d98a',.6);return true}
  delete G.hits[hk];const n=4+Math.floor(Math.random()*3);if(!addItem('pietra',n))return true;W2.gone[hk]={day:st.day};mapRemove(m,o);floatText(`+${n} Pietra`,o.tx*16+8,o.ty*16-6);st.flags.mined=(st.flags.mined||0)+1;return true}
 // oggetti costruiti
 if(o&&o.kind==='built'){const b=W2.built[o.bk];if(id&&id===PLACE_TOOL[b.id]){if(b.id==='cassa'&&(b.inv||[]).some(Boolean)){UI.toast('Svuota la cassa prima di spostarla.');return true}if(ITEMS[b.id].size&&animalsOf(o.bk).length){UI.toast('Dentro ci vivono delle bestie. Non si smonta.');return true}
   if(!addItem(b.id,1))return true;delete W2.built[o.bk];mapRemove(m,o);if(b.id==='lampione')m.lights=m.lights.filter(l=>!(l.x===o.tx*16+8&&l.y===o.ty*16-14));AU.play('pick');UI.toast(ITEMS[b.id].n+' raccolto.');return true}
  if(b.id==='banco'){craftMenu();return true}if(b.id==='pollaio'||b.id==='stalla'){barnMenu(o.bk);return true}if(b.id==='cassa'){chestMenu(o.bk);return true}if(b.id==='panchina'){runAct({act:'bench',tx:o.tx,ty:o.ty});return true}
  UI.toast(ITEMS[b.id].n+(PLACE_TOOL[b.id]?` — per spostarlo usa ${PLACE_TOOL[b.id]==='accetta'?'l\'accetta':'il piccone'}.`:''));return true}
 // piazzare un oggetto
 if(id&&ITEMS[id].size){if(!bigFree(id,fx,fy)){UI.toast(`Serve un prato libero di ${ITEMS[id].size.join('×')} caselle, davanti a te.`);return true}W2.built[k]={id};removeItem(id,1);addBigBuilt(m,k,W2.built[k]);AU.play('slam');G.shake=2;hitFx(fx,fy,'#8a6a3a');st.flags.built=(st.flags.built||0)+1;UI.toast(ITEMS[id].n+(id==='stalla'?' costruita':' costruito')+'! Usalo per comprare le bestie.');return true}
 if(id&&ITEMS[id].t==='place'){const g=m.get(fx,fy),free=!o&&!m.solid(fx,fy)&&(g===1||g===12||g===2);
  if(!free||st.farm[k]&&st.farm[k].c){UI.toast('Non qui: serve un posto libero.');return true}if(fx<4||fx>59||fy<4||fy>41){UI.toast('Troppo vicino al bosco.');return true}
  if(st.farm[k])delete st.farm[k];W2.built[k]={id};if(id==='cassa')W2.built[k].inv=Array(20).fill(null);removeItem(id,1);
  const nb=m.add(OB('built',fx,fy,placeImg(id),{act:'built',bk:k,bid:id}));if(id==='lampione')m.lights.push({x:fx*16+8,y:fy*16-14,r:62});
  AU.play('plant');hitFx(fx,fy,'#8a6a3a');st.flags.built=(st.flags.built||0)+1;return true}
 return false}
ACT.debris=()=>{};ACT.ceppo=()=>UI.toast('Un ceppo. Con l\'accetta lo togli.');ACT.built=()=>{};
Object.assign(PROMPT,{debris:'Raccogli',ceppo:'Ceppo'});
Object.assign(SFX,{
 chop:(a,t)=>{a.noise(t,.08,.35,'bandpass',900,3);a.osc('triangle',180,t,.08,.08,null,.002,120)},
 mine:(a,t)=>{a.noise(t,.05,.3,'highpass',2600,1);a.osc('square',1400,t,.04,.03,null,.001,900)},
});

// ---------- banco da lavoro ----------
function craftMenu(){const draw=()=>{const has=c=>Object.entries(c).every(([k,n])=>countItem(k)>=n);
  UI.open(`<button class="btn mclose" data-close>✕</button><h2>Banco da lavoro</h2><p class="small">Legna ${countItem('legna')} · Pietra ${countItem('pietra')} · Fibra ${countItem('fibra')}</p>`+
   CRAFTS.map((r,i)=>`<div class="mrow"><canvas data-i="${r.id}" width="32" height="32"></canvas><span>${ITEMS[r.id].n}${r.q>1?' ×'+r.q:''}<br><span class="small">${Object.entries(r.c).map(([k,n])=>`<span style="color:${countItem(k)>=n?'inherit':'#a8301a'}">${n} ${ITEMS[k].n}</span>`).join(' · ')} — ${ITEMS[r.id].d||''}</span></span><button class="btn" data-r="${i}" ${has(r.c)?'':'disabled'}>Crea</button></div>`).join('')+
   '<p class="small">Gli oggetti creati finiscono nello zaino. Per piazzarli: tienili in mano e usali su un punto libero.</p>');
  $('#mbox').querySelectorAll('canvas[data-i]').forEach(c=>c.getContext('2d').drawImage(ICON[c.dataset.i],0,0));
  $('#mbox').querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const r=CRAFTS[+b.dataset.r];if(!has(r.c))return;if(!addItem(r.id,r.q))return;for(const [k,n] of Object.entries(r.c))removeItem(k,n);AU.play('ok');G.st.flags.crafted=(G.st.flags.crafted||0)+1;UI.toast(`Creato: ${ITEMS[r.id].n}${r.q>1?' ×'+r.q:''}`);UI._mclose=null;draw()})};draw()}

// ---------- cassa ----------
function chestMenu(bk){const b=G.st.free.built[bk];if(!b.inv)b.inv=Array(20).fill(null);
 const cell=(s,w,i)=>`<div class="cslot" data-w="${w}" data-i="${i}"><canvas width="32" height="32"></canvas><i>${s&&s.n>1?s.n:''}</i></div>`;
 const draw=()=>{UI.open(`<button class="btn mclose" data-close>✕</button><h2>Cassa</h2><p class="small">Tocca un oggetto per spostarlo tra lo zaino e la cassa.</p><h3>Cassa</h3><div class="cgrid">${b.inv.map((s,i)=>cell(s,'c',i)).join('')}</div><h3>Zaino</h3><div class="cgrid">${G.st.inv.map((s,i)=>cell(s,'z',i)).join('')}</div>`);
  $('#mbox').querySelectorAll('.cslot').forEach(el=>{const L=el.dataset.w==='c'?b.inv:G.st.inv,s=L[+el.dataset.i];if(s&&ICON[s.id])el.firstChild.getContext('2d').drawImage(ICON[s.id],0,0);if(s)el.title=ITEMS[s.id].n;
   el.onclick=()=>{const from=el.dataset.w==='c'?b.inv:G.st.inv,to=el.dataset.w==='c'?G.st.inv:b.inv,i=+el.dataset.i,s=from[i];if(!s)return;if(el.dataset.w==='z'&&ITEMS[s.id].t==='key'){UI.toast('Questo lo tieni con te.');return}
    const same=to.find(q=>q&&q.id===s.id);if(same)same.n+=s.n;else{const j=to.findIndex(q=>!q);if(j<0){UI.toast(el.dataset.w==='c'?'Lo zaino è pieno!':'La cassa è piena!','bad');return}to[j]={id:s.id,n:s.n}}from[i]=null;AU.play('blip');UI.hotbar();UI._mclose=null;draw()}})};draw()}

// ---------- inizio del gioco libero ----------
const FREE_INTRO={
 1:['Sei tornat{o|a}. Clara è rimasta fuori, tra le luci che non si spengono mai. Tu no: la casa del nonno ti aspettava, e la Valle non ha fatto domande.'],
 2:['Il mantello giallo è appeso dietro la porta. Di giorno nessuno ne parla. Di notte, certe volte, senti gli zoccoli. Sono i tuoi.'],
 3:['Il recinto è grigio. Il ponte è stato ricostruito con il legno dell\'Albero bruciato. La Valle è libera, e da fuori qualcuno comincia ad arrivare.'],
};
async function freeStart(ending){const st=G.st,F=st.flags;G.cut++;
 try{await UI.fade(1,600);
  Object.assign(F,{ch1end:1,ch2end:1,ch3end:1,festaDone:1,ch2card:1,ch3card:1,ch4card:1,finaleChase:0,bridgeGone:0});st.chapter=5;
  st.day+=1;st.free={start:st.day,ending,gone:{},debris:{},built:{}};st.time=6*60;st.energy=100;st.favors=[];st.choreOk=false;G.festaDark=false;G.redTint=0;G.erede=false;G.prey=null;G.festaChase=false;G.horse.on=false;G.npcs=G.npcs.filter(n=>!n.clone);
  st.quiete=100;while(st.inv.length<20)st.inv.push(null);st.inv=st.inv.map(s=>s&&(ITEMS[s.id].t==='key'||(ITEMS[s.id].t==='bad'&&s.id!=='nastro'))?null:s);
  morningSetup();rebuildMaps();snapNPCs();spawnCritters();G.map=G.maps.house;setPos(G.player,2,3,0);G.mode='game';UI.showHud(true);
  await UI.card('La Valle, dopo',`${seasonName()} · Giorno ${seasonDay()}`,fmt(FREE_INTRO[ending][0]),false,true,1600);updateCam(0);await UI.fade(0,700);
  await narr('Sulla soglia, appoggiati alla porta, un\'accetta e un piccone. Un biglietto con la calligrafia di Brom: «Mh. Per la legna e per le pietre. Si ricostruisce.»');
  giveItem('accetta');giveItem('piccone');
  // il banco da lavoro accanto a casa
  const k=fkey(14,11);if(!st.free.built[k]&&!G.maps.main.objAt(14,11)){st.free.built[k]={id:'banco'};rebuildMaps()}else giveItem('banco');
  await narr('Accanto a casa c\'è un banco da lavoro nuovo. Con legna, pietra e fibra potrai costruire quello che ti serve.');
  UI.toast('Gioco libero: le stagioni durano 28 giorni. Ogni stagione ha le sue colture.');
  NET.save(st);UI.hud();UI.quest();UI.hotbar()}finally{G.cut--}}
// obiettivi del gioco libero (guidano i primi giorni)
QUESTS.push(
 {free:1,s:st=>isFree(st),t:st=>`Abbatti un albero con l'accetta (${Math.min(st.flags.felled||0,1)}/1)`,d:st=>(st.flags.felled||0)>=1},
 {free:1,s:st=>isFree(st),t:st=>`Spacca una roccia con il piccone (${Math.min(st.flags.mined||0,1)}/1)`,d:st=>(st.flags.mined||0)>=1},
 {free:1,s:st=>isFree(st)&&((st.flags.felled||0)>=1),t:()=>'Costruisci qualcosa al banco da lavoro, accanto a casa',d:st=>(st.flags.crafted||0)>=1},
 {free:1,s:st=>isFree(st)&&((st.flags.crafted||0)>=1),t:()=>'Piazza nella fattoria qualcosa che hai costruito',d:st=>(st.flags.built||0)>=1},
);
// dialoghi del gioco libero
const FREE_L={
 ezekiel:['Il recinto non lo ridipingiamo più. Non so ancora se è una cosa giusta.','Sono stanco di contare, {n}. Ora conto le stagioni. È più facile.','Tuo nonno avrebbe voluto vederti così. Con le mani sporche di terra.'],
 agatha:['Tesoro! Ho semi nuovi, adesso: le stagioni cambiano e io cambio con loro.','Da fuori arrivano notizie strane. Dicono che le carrozze vanno senza cavalli. Figurati.','Il mio negozio non è mai stato così vivo. Grazie anche a te.'],
 lucius:['La campana suona ancora alle nove. Per abitudine. Nessuno corre più a casa.','Ogni tanto, la sera, conto. Sette. E mi viene da piangere, ma di sollievo.','Il bosco è più quieto. Più quieto non vuol dire buono, {figliolo|figliola}.'],
 clara:['Hai visto quanta luce c\'è, di notte, adesso? Tutta nostra.','Prima o poi voglio vedere il mondo di fuori. Ma ogni giorno trovo una scusa per restare un altro po\'.','Pianta qualcosa di bello per me, quando arriva la primavera.'],
 brom:['Mh. L\'accetta è affilata. Non sprecarla sui rami piccoli.','Se ti serve un attrezzo migliore, passa. Ora ho tempo.','Ho smesso di fare ferri. Faccio chiodi. Si costruisce.'],
 tobia:['Hihi! Le zucche adesso dormono. Le ho sentite russare!','Il Vecchio Albero non c\'è più. Mi manca un pochino. Hihi. È strano?','Contami! No, non contarmi. Abbracciami. Hihi.'],
};
const FREE_SEASON={1:'Che freddo. D\'inverno nella Valle cresce solo il porro, e la pazienza.',2:'Primavera! Fragole, {n}. Le fragole di Hollowmere sono le migliori del mondo. Credo.',3:'Che caldo. Il mais arriva più alto di Brom, quest\'estate.'};
function freeTalkLine(id){const st=G.st,L=[...(FREE_L[id]||['…'])];const s=seasonOf();if(FREE_SEASON[s])L.push(FREE_SEASON[s]);if(id==='agatha'&&st.demand)L.push('Oggi pago bene: '+PL[st.demand]+', tesoro.');st.talkN=st.talkN||{};const k=st.talkN[id]=(st.talkN[id]||0)+1;return L[(st.day*7+k*5)%L.length]}
// la notte: cambio di stagione (le colture fuori stagione muoiono)
function freeNight(st,prev){if(!isFree(st))return;const s=seasonOf(st);if(s===prev)return;let n=0;for(const k in st.farm){const c=st.farm[k].c;if(c&&!c.dead&&!cropInSeason(c.t,s)){c.dead=1;n++}}G.seasonNews={s,n}}
function shopItems(){const s=seasonOf();return [...Object.keys(ITEMS).filter(k=>ITEMS[k].t==='seed'&&cropInSeason(ITEMS[k].crop,s)),'concime','pane']}
function freeAimOk(it,tx,ty){const st=G.st,m=G.map,o=m.objAt(tx,ty),id=it.id;if(!isFree(st))return null;
 if(id==='accetta')return !!o&&(o.kind==='tree'||o.kind==='ceppo'||o.kind==='log'||(o.kind==='debris'&&o.dt==='ramo')||(o.kind==='built'&&PLACE_TOOL[o.bid]==='accetta'));
 if(id==='piccone')return !!o&&(o.kind==='rock'||(o.kind==='debris'&&o.dt==='sasso')||(o.kind==='built'&&PLACE_TOOL[o.bid]==='piccone'));
 if(ITEMS[id].size)return bigFree(id,tx,ty);
 if(ITEMS[id].t==='place'){const g=m.get(tx,ty);return !o&&!m.solid(tx,ty)&&(g===1||g===12||g===2)&&!(st.farm[fkey(tx,ty)]&&st.farm[fkey(tx,ty)].c)}return null}
PROMPT.built='Usa';
const FREE_BARKS={ezekiel:['Buona giornata, {n}.','Le stagioni passano. Finalmente.'],agatha:['Semi freschi, tesoro!','Passa a trovarmi!'],lucius:['Pace a te, {n}.','Sette. Va bene così.'],clara:['{n}! Ciao!','Che bella giornata!'],brom:['Mh.','Si ricostruisce.'],tobia:['Hihi! Ciao!','Le zucche dormono. Hihi.']};
