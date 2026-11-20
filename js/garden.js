'use strict';
// ================= ORTO, BOSCO E CUCINA (gioco libero) =================

// ---------- ortaggi nuovi: stagioni, crescita, valore ----------
// k: forma della pianta per il disegno — root (radice), leaf (cespo), bush (cespuglio con frutti), vine (frutto a terra)
const GARDEN={
 carota:{n:'Carota',pl:'carote',s:[2,0],days:3,v:60,p:35,k:'root',c:['#e8781a','#5a9a2a']},
 lattuga:{n:'Lattuga',pl:'cespi di lattuga',s:[2],days:3,v:55,p:30,k:'leaf',c:['#8ac83a','#5a9a2a']},
 cipolla:{n:'Cipolla',pl:'cipolle',s:[2,0],days:4,v:70,p:35,k:'root',c:['#c88a4a','#6aa84a']},
 aglio:{n:'Aglio',pl:'teste d\'aglio',s:[2],days:4,v:80,p:40,k:'root',c:['#f2ecdc','#7ab85a']},
 peperone:{n:'Peperone',pl:'peperoni',s:[3],days:5,re:2,v:40,p:50,k:'bush',c:['#d8302a','#4a8a2a']},
 melanzana:{n:'Melanzana',pl:'melanzane',s:[3],days:5,re:2,v:50,p:55,k:'bush',c:['#5a2a6a','#4a8a2a']},
 anguria:{n:'Anguria',pl:'angurie',s:[3],days:7,v:260,p:90,k:'vine',c:['#3a7a2a','#5a9a2a']},
 barbabietola:{n:'Barbabietola',pl:'barbabietole',s:[0],days:4,v:95,p:45,k:'root',c:['#8a1a3a','#5a8a3a']},
 spinaci:{n:'Spinaci',pl:'mazzi di spinaci',s:[1,2],days:3,v:60,p:30,k:'leaf',c:['#2a6a2a','#3a7a2a']},
};
for(const [id,g] of Object.entries(GARDEN)){CROPS[id]={days:g.days,n:g.n,y:[1,g.re?2:1],re:g.re,s:g.s};ITEMS[id]={n:g.n,t:'crop',v:g.v};ITEMS['s_'+id]={n:'Semi di '+g.n.toLowerCase(),t:'seed',crop:id,p:g.p};PL[id]=g.pl;SG[id]=(/^[aeiou]/i.test(g.n)?'un\'':/a$/.test(g.n)?'una ':'un ')+g.n.toLowerCase();FAV_VAL[id]=g.v}

// ---------- raccolta selvatica: cresce da sola, nei prati e ai margini del bosco ----------
const WILD={
 0:['funghi','castagne','nocciole'],1:['radice','agrifoglio'],2:['asparagi','tarassaco','fragoline'],3:['more','camomilla','nocciole'],
};
Object.assign(ITEMS,{
 funghi:{n:'Porcini',t:'crop',v:70},castagne:{n:'Castagne',t:'crop',v:40},nocciole:{n:'Nocciole',t:'crop',v:35},radice:{n:'Radice d\'inverno',t:'crop',v:55},
 agrifoglio:{n:'Agrifoglio',t:'crop',v:30},asparagi:{n:'Asparagi selvatici',t:'crop',v:65},tarassaco:{n:'Tarassaco',t:'crop',v:25},fragoline:{n:'Fragoline di bosco',t:'crop',v:60},
 more:{n:'More di rovo',t:'crop',v:40},camomilla:{n:'Camomilla',t:'crop',v:35},
});
Object.assign(PL,{funghi:'porcini',castagne:'manciate di castagne',nocciole:'manciate di nocciole',radice:'radici d\'inverno',agrifoglio:'rametti d\'agrifoglio',asparagi:'mazzi di asparagi',tarassaco:'mazzi di tarassaco',fragoline:'cestini di fragoline',more:'cestini di more',camomilla:'mazzi di camomilla'});
Object.assign(SG,{funghi:'un porcino',castagne:'una manciata di castagne',nocciole:'una manciata di nocciole',radice:'una radice d\'inverno',agrifoglio:'un rametto d\'agrifoglio',asparagi:'un mazzo di asparagi',tarassaco:'un mazzo di tarassaco',fragoline:'un cestino di fragoline',more:'un cestino di more',camomilla:'un mazzo di camomilla'});
function wildMorning(st){if(!isFree(st))return;const W2=st.free,list=WILD[seasonOf(st)]||[];if(!list.length)return;let n=Object.values(W2.debris).filter(t=>t.startsWith('w_')).length;
 for(let i=0;i<14&&n<9;i++){const edge=Math.random()<.5,x=edge?(Math.random()<.5?4+Math.floor(Math.random()*3):56+Math.floor(Math.random()*4)):4+Math.floor(Math.random()*56),y=edge?6+Math.floor(Math.random()*35):34+Math.floor(Math.random()*8),k=fkey(x,y);
  if(W2.debris[k]||W2.built[k]||st.farm[k]||(W2.tiles||{})[k])continue;W2.debris[k]='w_'+list[Math.floor(Math.random()*list.length)];n++}}

// ---------- grafica ----------
function genGardenArt(){const I=(id,fn)=>{const P=new PX(32,32);fn(P);P.outline();ICON[id]=pxCanvas(P)};
 const leafy=(P,c,cx,cy,r)=>{for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P.ellipse(cx+Math.cos(a)*r*.5,cy+Math.sin(a)*r*.35,r*.6,r*.45,rp(i%2?c:shade(c,-.15)),{spec:.25})}};
 const icon={
  root:(P,g)=>{P.capsule(16,30,16,14,g.n==='Carota'?3.6:6,rp(g.c[0]),{r2:g.n==='Carota'?1:5,spec:.5});for(const [a,b] of [[10,3],[16,1],[22,3]])P.capsule(16,12,a,b,1.2,rp(g.c[1]),{r2:2})},
  leaf:(P,g)=>leafy(P,g.c[0],16,18,14),
  bush:(P,g)=>{P.ellipse(16,18,8,10,rp(g.c[0]),{spec:.7});P.capsule(13,8,19,8,1.4,rp(g.c[1]));P.capsule(16,8,16,4,1,rp(g.c[1]))},
  vine:(P,g)=>{P.ellipse(16,18,13,10,rp(g.c[0]),{spec:.5,mod:(X,Y,v)=>((X+2)%6<2)?v-.25:v});P.capsule(16,8,18,4,1,rp(g.c[1]))},
 };
 for(const [id,g] of Object.entries(GARDEN))I(id,P=>icon[g.k](P,g));
 const W={funghi:P=>{P.capsule(16,28,16,18,3,rp('#efe2c2'));P.ellipse(16,15,10,6,rp('#8a4a1a'),{spec:.5})},castagne:P=>{for(const [a,b] of [[11,19],[21,18],[16,23]])P.ellipse(a,b,5,5,rp('#6a3a1a'),{spec:.7})},
  nocciole:P=>{for(const [a,b] of [[11,19],[20,17],[15,23]])P.ellipse(a,b,4.4,4.8,rp('#b8803a'),{spec:.6})},radice:P=>{P.capsule(16,30,14,10,4,rp('#d8c8a8'),{r2:2,spec:.3});P.capsule(16,10,13,3,1,rp('#6a8a5a'))},
  agrifoglio:P=>{for(const [a,b] of [[10,16],[22,14]])P.ellipse(a,b,7,4,rp('#2a6a3a'),{spec:.4});for(const [a,b] of [[15,18],[18,16],[17,20]])P.ellipse(a,b,2.2,2.2,rp('#d8202a'),{spec:.8})},
  asparagi:P=>{for(let i=0;i<4;i++)P.capsule(10+i*4,30,11+i*4,6,1.6,rp('#6a9a3a'),{r2:1.8,spec:.4})},tarassaco:P=>{P.ellipse(16,12,7,7,rp('#f0d02a'),{spec:.5});P.capsule(16,19,16,30,1,rp('#5a9a2a'))},
  fragoline:P=>{for(const [a,b] of [[11,18],[17,15],[21,20],[14,23]])P.ellipse(a,b,3,3.4,rp('#e0302a'),{spec:.7})},more:P=>{for(const [a,b] of [[11,18],[17,15],[21,20],[14,23]])P.ellipse(a,b,3.4,3.4,rp('#3a1a3a'),{spec:.8})},
  camomilla:P=>{for(const [a,b] of [[11,12],[20,10],[16,18]]){P.ellipse(a,b,4.4,4.4,rp('#f8f4e8'),{spec:.4});P.ellipse(a,b,1.6,1.6,rp('#f0c02a'),{edge:false})}}};
 for(const id in W){I(id,W[id]);const [c,x]=mk(24,24);x.imageSmoothingEnabled=false;x.drawImage(ICON[id],0,0,24,24);c.s=2;FREEIMG['w_'+id]=c}
 // pacchetti di semi
 for(const [id,g] of Object.entries(GARDEN)){const P=new PX(32,32);P.rect(6,4,20,26,rp('#e8d6a8'),{n:[.1,-.2,1]});P.rect(6,3,20,4,rp('#b89a68'),{n:[0,-.6,.8]});P.rect(6,24,20,5,rp(g.c[0]),{n:[0,-.2,1]});P.outline();const c=pxCanvas(P),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(ICON[id],8,6,16,16);ICON['s_'+id]=c}
 // piante nel campo: quattro stadi per forma
 const S=fn=>{const P=new PX(32,48);fn(P);P.outline();const c=pxCanvas(P);c.top=imgTop(c);return c};
 const soil=rp('#6a4428'),stem=rp('#4a7a24');
 const mound=(P,col)=>{P.ellipse(16,42,7,2.8,soil,{spec:.1});for(const [a,b] of [[13,41],[18,41],[16,43]])P.ellipse(a,b,1.3,1,rp(col),{edge:false,spec:.6})};
 const sprout=P=>{P.ellipse(16,43,5,1.6,soil,{edge:false});P.capsule(16,43,16,35,.8,stem);P.capsule(16,36,10,32,.7,rp('#7aba3a'),{r2:2.2});P.capsule(16,35,22,31,.7,rp('#7aba3a'),{r2:2.2})};
 const grown={
  root:(g,big)=>P=>{const L=big?[[8,22],[13,16],[19,16],[24,22]]:[[11,30],[16,27],[21,30]];L.forEach(([a,b],i)=>P.capsule(16,40,a,b,1,rp(i%2?g.c[1]:shade(g.c[1],-.15)),{r2:2.8}));if(big)P.ellipse(16,41,5,3,rp(g.c[0]),{spec:.5,clip:(X,Y)=>Y<42})},
  leaf:(g,big)=>P=>leafy(P,g.c[0],16,big?36:39,big?13:8),
  bush:(g,big)=>P=>{P.capsule(16,43,16,big?20:28,1.2,stem);for(let i=0;i<(big?6:4);i++)P.ellipse(16+(i%2?6:-6),40-i*4,4.4,3,rp(i%2?'#5a9a2a':'#3f7424'),{spec:.2});if(big)for(const [a,b] of [[10,30],[22,26],[12,22]])P.ellipse(a,b,2.6,3.6,rp(g.c[0]),{spec:.7})},
  vine:(g,big)=>P=>{P.capsule(2,41,30,41,1.1,stem);P.ellipse(7,35,5,4,rp('#5a9a2a'),{spec:.2});P.ellipse(26,34,5,4,rp('#3f7424'),{spec:.2});if(big)P.ellipse(16,36,11,7.5,rp(g.c[0]),{spec:.5,mod:(X,Y,v)=>((X+2)%6<2)?v-.25:v});else P.ellipse(16,38,3.2,2.6,rp('#f0c83a'),{spec:.5})},
 };
 for(const [id,g] of Object.entries(GARDEN)){CROPIMG[id]=[S(P=>mound(P,'#e8d0a0')),S(sprout),S(grown[g.k](g,false)),S(grown[g.k](g,true))];CROPW[id]=CROPIMG[id].map(wiltImg)}}

// ---------- ricettario e cucina vera ----------
// adv: serve la cucina economica (la si costruisce al banco e si mette in casa); da: chi te la insegna
COOK.push(
 {id:'minestrone',need:{carota:1,patata:1,spinaci:1},min:50,adv:1,da:'lucius'},
 {id:'zuppacipolle',need:{cipolla:2,pane:1},min:40,da:'agatha'},
 {id:'risottofunghi',need:{funghi:2,cipolla:1},min:50,adv:1,da:'ezekiel'},
 {id:'peperonata',need:{peperone:2,cipolla:1},min:40,da:'brom'},
 {id:'parmigiana',need:{melanzana:2,pomodoro:1,latte:1},min:70,adv:1,da:'ottavio'},
 {id:'insalatamista',need:{lattuga:1,carota:1,pomodoro:1},min:10,da:'clara'},
 {id:'castagnaccio',need:{castagne:2,latte:1},min:60,adv:1,da:'agatha'},
 {id:'tortamore',need:{more:2,uovo:1,latte:1},min:70,adv:1,da:'clara'},
 {id:'frittataasparagi',need:{asparagi:1,uovo:2},min:25,da:'tobia'},
 {id:'tisana',need:{camomilla:1},min:10,da:'lucius'},
 {id:'anguriafresca',need:{anguria:1},min:5,da:'tobia'},
 {id:'zuppabietole',need:{barbabietola:2,aglio:1},min:40,adv:1,da:'irene'},
 {id:'pastaaglio',need:{aglio:1,spinaci:1,uovo:1},min:30,da:'ottavio'},
);
Object.assign(ITEMS,{
 minestrone:{n:'Minestrone',t:'food',e:70,d:'Tutto l\'orto in una pentola. +70 energia.'},zuppacipolle:{n:'Zuppa di cipolle',t:'food',e:55,d:'Col pane di Clara sopra. +55 energia.'},
 risottofunghi:{n:'Risotto ai porcini',t:'food',e:80,d:'L\'autunno buono. +80 energia.'},peperonata:{n:'Peperonata',t:'food',e:50,d:'Rossa e gialla, come la Valle di adesso. +50 energia.'},
 parmigiana:{n:'Parmigiana',t:'food',e:95,d:'La ricetta di città di Ottavio. +95 energia.'},insalatamista:{n:'Insalata mista',t:'food',e:40,d:'Fresca, croccante. +40 energia.'},
 castagnaccio:{n:'Castagnaccio',t:'food',e:65,d:'Dolce, scuro, d\'inverno. +65 energia.'},tortamore:{n:'Torta di more',t:'food',e:85,d:'Le mani viola per un giorno intero. +85 energia.'},
 frittataasparagi:{n:'Frittata agli asparagi',t:'food',e:55,d:'Tobia giura che è la migliore. +55 energia.'},tisana:{n:'Tisana di camomilla',t:'food',e:20,d:'Si dorme meglio. +20 energia.'},
 anguriafresca:{n:'Anguria a fette',t:'food',e:45,d:'Agosto in un morso. +45 energia.'},zuppabietole:{n:'Zuppa di barbabietole',t:'food',e:60,d:'Rossa. Irene la chiama «borsch». +60 energia.'},
 pastaaglio:{n:'Pasta aglio e spinaci',t:'food',e:60,d:'Semplice e svelta. +60 energia.'},
});
const BASE_RECIPES=['zuppa','arrosto','torta','frittata','polenta','marmellata','zuppaporri','insalata','umido','crostata'];
const knows=(st,id)=>BASE_RECIPES.includes(id)||!!((st.free&&st.free.recipes)||{})[id];
function learnRecipe(id,from){const st=G.st;st.free.recipes=st.free.recipes||{};if(st.free.recipes[id])return false;st.free.recipes[id]=1;AU.play('ok');UI.toast(`Nuova ricetta nel ricettario: ${ITEMS[id].n}${from?' — da '+from:''}.`);return true}
const hasStove=st=>Object.values((st.free&&st.free.inside)||{}).some(f=>f.id==='cucina');
// sostituisce il camino del gioco libero: piatti conosciuti, quelli "di cucina" solo con la cucina economica
function cookModal(atStove){const st=G.st,stove=atStove||hasStove(st),can=r=>Object.entries(r.need).every(([k,v])=>countItem(k)>=v);
 const L=COOK.filter(r=>knows(st,r.id));
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>${stove?'La cucina':'Il camino'}</h2><p class="small">${stove?'Con il forno puoi fare tutte le ricette che conosci.':'Sul camino si fanno i piatti semplici. Le ricette segnate ♨ vogliono la cucina economica (si costruisce al banco e si mette in casa).'} Le ricette nuove le insegnano gli abitanti amici e Ottavio.</p>`+
  L.map(r=>{const i=COOK.indexOf(r),ok=can(r)&&(!r.adv||stove);return `<div class="mrow"><canvas data-i="${r.id}" width="32" height="32"></canvas><span>${r.adv?'♨ ':''}${ITEMS[r.id].n}<br><span class="small">${Object.entries(r.need).map(([k,v])=>`<span style="color:${countItem(k)>=v?'inherit':'#a8301a'}">${v} ${ITEMS[k].n.toLowerCase()}</span>`).join(' + ')} · +${ITEMS[r.id].e} energia</span></span><button class="btn" data-c="${i}" ${ok?'':'disabled'}>Cucina</button></div>`}).join('')+
  `<p class="small">Ricette conosciute: ${COOK.filter(r=>knows(st,r.id)).length}/${COOK.length}.</p>`);
 $('#mbox').querySelectorAll('canvas[data-i]').forEach(c=>c.getContext('2d').drawImage(ICON[c.dataset.i]||ICON.zuppa,0,0));
 $('#mbox').querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{const r=COOK[+b.dataset.c];if(!can(r))return;UI._mclose=null;UI.close();for(const [k,v] of Object.entries(r.need))removeItem(k,v);AU.play('hoe');await passTime(r.min);AU.play('ok');st.flags.cooked=(st.flags.cooked||0)+1;addXP('arti',4);giveItem(r.id)})}
function recipeBook(){const st=G.st,who=id=>NAMES[id]||id;
 UI.open(`<button class="btn mclose" data-close>✕</button><h2>Ricettario</h2>`+COOK.map(r=>knows(st,r.id)?`<p class="small"><b>${r.adv?'♨ ':''}${ITEMS[r.id].n}</b> — ${Object.entries(r.need).map(([k,v])=>v+' '+ITEMS[k].n.toLowerCase()).join(', ')}</p>`:`<p class="small" style="opacity:.6">✦ ??? — la insegna ${who(r.da)}${r.da==='ottavio'?' (la vende)':', quando sarete amici'}.</p>`).join(''))}
// piatti nuovi: icone semplici, ciotola o piatto con il colore dell'ingrediente principale
function genDishArt(){const I=(id,fn)=>{const P=new PX(32,32);fn(P);P.outline();ICON[id]=pxCanvas(P)};
 const bowl=(c,dots)=>P=>{P.body(15,27,()=>16,Y=>12-(Y-15)*.35,rp('#a8785a'),{nyF:()=>.1,spec:.4});P.ellipse(16,15,12,3.6,rp(c),{spec:.6,amb:.6});for(const [x,col] of dots||[])P.ellipse(x,14,1.6,1.1,rp(col),{edge:false})};
 const plate=(c,top)=>P=>{P.ellipse(16,22,13,6,rp('#d9d2c2'),{spec:.5});P.ellipse(16,19,10,5,rp(c),{spec:.4});if(top)for(const [a,b,col] of top)P.ellipse(a,b,2.4,1.8,rp(col),{spec:.6})};
 const D={minestrone:bowl('#c8782a',[[11,'#e8781a'],[16,'#5a9a2a'],[21,'#f2ecdc']]),zuppacipolle:bowl('#d8a85a',[[13,'#c88a3e'],[19,'#c88a3e']]),risottofunghi:plate('#efe2c2',[[12,18,'#8a4a1a'],[19,19,'#8a4a1a']]),peperonata:plate('#d8302a',[[12,18,'#f0c02a'],[20,19,'#5a9a2a']]),
  parmigiana:plate('#a8301a',[[12,18,'#f0e0a0'],[19,19,'#5a2a6a']]),insalatamista:plate('#8ac83a',[[12,18,'#e8781a'],[19,19,'#e0402a']]),castagnaccio:plate('#5a3a1a',[[14,18,'#8a6a3a']]),tortamore:plate('#3a1a3a',[[12,18,'#c98a3e'],[20,19,'#c98a3e']]),
  frittataasparagi:plate('#f0c040',[[12,18,'#6a9a3a'],[19,19,'#6a9a3a']]),tisana:bowl('#e8d890'),anguriafresca:plate('#e0402a',[[14,18,'#2a1a10'],[19,19,'#2a1a10']]),zuppabietole:bowl('#8a1a3a',[[16,'#f2ecdc']]),pastaaglio:plate('#f0e0a0',[[12,18,'#2a6a2a'],[19,19,'#2a6a2a']])};
 for(const id in D)I(id,D[id])}

// ---------- gli abitanti nel gioco libero: chiedono, insegnano, passano a trovarti ----------
const FREE_ASK={
 ezekiel:async n=>{const c=await ask('ezekiel',freeTalkLine('ezekiel'),['Chiacchiera','Le terre in vendita','Niente']);if(c===1)landMenu();return c<2},
 brom:async n=>{const c=await ask('brom',freeTalkLine('brom'),['Chiacchiera','Ampliare la casa','Migliorare gli attrezzi','Niente']);if(c===1)await houseUpMenu();if(c===2)await forgeMenu();return c<3},
 agatha:async n=>{const c=await ask('agatha',freeTalkLine('agatha'),['Semi e provviste','Chiacchiera','Arredo e attrezzi','Personalizza casa e recinti','Niente']);if(c===0){await UI.shop();return true}if(c===2)decorShop();if(c===3)lookMenu();return c===1},
};
function decorShop(){const st=G.st;UI.open(`<button class="btn mclose" data-close>✕</button><h2>Il catalogo di Agatha</h2><p class="small">«Roba buona, tesoro. Il resto lo fai al banco.» — Hai <b>${CZ(st.money)}</b></p>`+
  DECOR_SHOP.map(([id,p])=>`<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span>${ITEMS[id].n}<br><span class="small">${ITEMS[id].d}</span></span><b class="price">${CZ(p)}</b><button class="btn" data-d="${id}" ${st.money>=p?'':'disabled'}>Compra</button></div>`).join(''));
 $('#mbox').querySelectorAll('canvas[data-i]').forEach(c=>c.getContext('2d').drawImage(ICON[c.dataset.i],0,0));
 $('#mbox').querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const [id,p]=DECOR_SHOP.find(x=>x[0]===b.dataset.d);if(st.money<p||!addItem(id,1))return;st.money-=p;AU.play('coin');UI.hud();UI._mclose=null;decorShop()})}
// insegnare ricette: con abbastanza cuori, una volta ogni tanto
async function teachRecipe(n){const st=G.st;if(!isFree(st)||hearts(n.id)<3)return false;const r=COOK.find(r=>r.da===n.id&&!knows(st,r.id));if(!r)return false;
 if((st.free.taught||0)===st.day)return false;st.free.taught=st.day;await say(n.id,`Ti insegno una cosa, {n}. ${ITEMS[r.id].n}: ${Object.keys(r.need).map(k=>ITEMS[k].n.toLowerCase()).join(', ')}.${r.adv?' Ma ti serve un forno vero.':''}`);learnRecipe(r.id,NAMES[n.id]);return true}
// Ottavio vende le ricette di città
const OTT_RECIPES=()=>COOK.filter(r=>r.da==='ottavio'&&!knows(G.st,r.id));
// le visite degli abitanti alla tua fattoria (pomeriggio): commentano quello che hai fatto
function freeVisitSched(id,st){if(!isFree(st)||G.visit)return null;const t=st.time,d=(st.day+3)%7;
 const V={clara:[4,15*60,16*60+30,[14,15]],tobia:[2,14*60,16*60,[18,26]],agatha:[6,16*60,17*60,[12,12]],brom:[5,17*60,18*60,[16,11]],lucius:[3,15*60+30,16*60+30,[10,24]],ezekiel:[1,16*60,17*60,[20,14]]}[id];
 if(!V||d!==V[0]||t<V[1]||t>=V[2])return null;return at(V[3][0],V[3][1],2,'visit',1)}
function farmComment(id){const st=G.st,W2=st.free,crops=Object.values(st.farm).filter(f=>f.c&&!f.c.dead).length,anim=(W2.animals||[]).length,built=Object.keys(W2.built).length,furn=Object.keys(W2.inside||{}).length,paths=Object.keys(W2.tiles||{}).length;
 const L=[];if(crops>20)L.push('Quanta roba nei tuoi campi! Il nonno non ne aveva tanta.');else if(crops)L.push('Le tue piantine crescono bene.');else L.push('I campi sono vuoti. Pianta qualcosa, {n}!');
 if(anim)L.push(`Ho salutato le tue bestie. ${anim>3?'Sono tante!':'Sembrano felici.'}`);if(built>6)L.push('Hai costruito un villaggio nel villaggio.');if(paths>10)L.push('Che bei vialetti. Adesso si cammina senza fango.');if(furn>4)L.push('Ho sbirciato dalla finestra: la casa è proprio bella, adesso.');
 return L[Math.floor(Math.random()*L.length)]}
// regali degli amici nella cassetta, la mattina
function friendGifts(st){if(!isFree(st))return;st.mailbox=st.mailbox||[];const G2={clara:['pane','marmellata','fragoline'],agatha:['uovo','castagne','tisana'],brom:['legna','pietra'],tobia:['more','nocciole','agrifoglio'],lucius:['camomilla','tisana'],ezekiel:['funghi','radice']};
 for(const id in G2){if(hearts(id)<5||Math.random()>.12)continue;const L=G2[id],it=L[Math.floor(Math.random()*L.length)];st.mailbox.push({item:it,n:it==='legna'||it==='pietra'?5:1,from:NAMES[id]})}}
