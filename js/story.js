'use strict';
// ================= CAPITOLO III — L'ALBERO DEI MORTI =================
NAMES.coro='Le voci';NAMES.nonnovoce='Una voce';NAMES.elias='Elias Marlowe';
const CH3L={
 ezekiel:['Ti sta bene il giallo, {n}. È così che si riconosce uno della Valle.','Domani sera, il Conteggio. Riposa: ti vogliamo in forze.'],
 agatha:['Ti sta proprio bene il giallo, tesoro. Oh, ti sta proprio bene.','Per la Festa ho già apparecchiato otto posti. Otto! Che sbadata.'],
 lucius:['Ho contato tre volte, stamattina. Tre numeri diversi.','Non ho dormito. Qualcuno ha camminato nella cappella.'],
 clara:['Parla piano. Hanno orecchie anche le zucche.','Non guardarmi troppo. Ci guardano.'],
 brom:['Quattro ferri. Finiti. Non chiedere.','Il cavallo non c\'è. Il fieno però lo comprano lo stesso.'],
 tobia:['Hihi. Il bosco ti conosce già.','Lui conta le teste. Tu ne hai una. Per ora.']};

// ---------- scene del giorno 7 ----------
async function claraAlly(n){const st=G.st,F=st.flags;
 await say('clara','{n}. Sei viv{o|a}. Meno male.','fear');
 await say('clara','Posso dirti una cosa? Anche mio padre era un nuovo arrivato. Come te, come tuo nonno. Sparì quando avevo sei anni.');
 await say('clara','Dissero che era partito. Ma da qui non parte nessuno. Il ponte non c\'è mai stato: lo sai anche tu, ormai.','sad');
 const c=await ask('clara','Voglio sapere cosa c\'è oltre il bosco. E cosa ne è stato di lui. Mi aiuti?',['Ti aiuterò','È pericoloso, Clara']);
 if(c===0){addFriend('clara',3);await say('clara','Lo sapevo. Sapevo che eri divers{o|a} dagli altri.')}
 else{addFriend('clara',1);await say('clara','Lo so che è pericoloso. Per questo non voglio andarci da sola.','sad')}
 await say('clara','Prendi la mia lanterna. Nel bosco si vede solo con la luce. E la luce gialla… beh, è l\'unica che abbiamo.');
 giveItem('lanterna');F.claraAlly=1;addQuiete(3);UI.quest()}
async function tobiaCostumeScene(){const st=G.st,F=st.flags;F.tobiaScene=1;const tb=NPC('tobia');tb.script=true;placeNPC(tb,'barn',4,4,0);
 await narr('In fondo al fienile, qualcosa si muove. È alto. Troppo alto per essere una persona.');
 AU.play('hooves');await narr('Zoccoli sul legno. Poi una risata.');
 await say('tobia','Hihi! Mi hai trovato! Sono il Cavaliere!');
 await say('tobia','Lo faccio a volte, sai? Per gioco. Per far stare tutti buoni. Il Vecchio dice che serve.');
 await say('tobia','Ma l\'altra notte non c\'ero. Io dormivo. Lo giuro sul Vecchio!','dark');
 const c=await ask('tobia','Mi credi? Dimmi che mi credi.',['Ti credo','Ho visto il costume vuoto']);
 if(c===0){addFriend('tobia',2);await say('tobia','Hihi! Sei {buono|buona}! Buon{o|a} come il nonno.')}else{addFriend('tobia',1);await say('tobia','Vuoto, sì. Il costume non cammina da solo. Hihi. Chi cammina, allora?','dark')}
 await say('tobia','Lui conta le teste. Il Vecchio non ha le mani. Hihi.','dark');
 await say('tobia','Se vuoi sapere chi cavalca… devi andare dall\'Albero.','dark');AU.play('laugh');addQuiete(-4);tb.script=false;UI.quest()}
async function ezekielTruth(n){const st=G.st,F=st.flags;
 const c=await ask(null,'Clara ha parlato. Tobia ha parlato. Ezekiel ti guarda come chi sa già cosa stai per chiedere.',['Voglio la verità','Niente']);if(c!==0)return;
 await say('ezekiel','Siediti, {n}. È una storia lunga e non è bella.','stern');
 await say('ezekiel','Due secoli fa i fondatori fuggirono dal mondo di fuori. Da qualcosa di cui non ho mai chiesto.');
 await say('ezekiel','Nel cuore del bosco trovarono un Albero. Fecero un patto: la Valle sarebbe rimasta quieta e nascosta.','dark');
 await say('ezekiel','In cambio, a ogni generazione, l\'Albero prende un forestiero. Uno solo. È il prezzo della pace.','dark');
 await say('ezekiel','Il costume lo costruirono i miei padri, dopo. Per spaventare chi voleva andarsene. Un Cavaliere senza testa tiene tutti dentro meglio di qualsiasi recinto.');
 await say('ezekiel','Abbiamo costruito la paura per non dover guardare quella vera.','stern');
 const d=await ask('ezekiel','Chiedi pure, {ragazzo|ragazza}. Non ho più niente da nascondere.',['E mio nonno?','Il Cavaliere è un costume, allora?']);
 if(d===0)await say('ezekiel','Tuo nonno fu risparmiato. Così dicono i registri. Il resto… non l\'ho mai voluto vedere.','dark');
 else await say('ezekiel','Il costume sì. Ma stanotte i zoccoli erano veri. E non li abbiamo fatti noi.','dark');
 await say('ezekiel','Il Varco si apre a chi lo cerca con una luce. Non ti fermerò: non potrei. E forse non voglio.','stern');
 F.ezTruth=1;addQuiete(-10);UI.quest()}
async function varcoCh3(){const st=G.st,F=st.flags;if(st.chapter<3||!F.ezTruth||F.woodDone)return false;
 if(!countItem('lanterna')){await narr('Senza luce non vai da nessuna parte. Ti serve la lanterna di Clara.');return true}
 await narr('Il Varco è aperto. Il sentiero entra nel bosco nero, e questa volta le tue gambe non si rifiutano.');
 const c=await ask(null,'Accendi la lanterna e oltrepassi il recinto giallo?',['Entra nel bosco','Non ancora']);if(c!==0)return true;
 await goMap('wood',15,41,3);return true}

// ---------- il bosco ----------
const WOOD_ST=[{id:'s1',stage:0,x:15,y:40},{id:'s2',stage:1,x:15,y:34},{id:'s3',stage:2,x:15,y:28},{id:'s4',stage:3,x:22,y:18},{id:'s5',stage:4,x:16,y:11},{id:'s6',stage:5,x:15,y:8}];
const WOOD_PRINTS=[[16,30],[16,26],[19,24],[22,21],[22,17],[19,14],[16,10]];
const WOOD_GRAVES=[[13,29,0],[18,31,1],[12,33,2],[19,34,0],[13,36,1],[18,37,2],[12,38,0],[19,39,1]];
const WOOD_EPI=['JOSIAH WREN — Contato.','MERCY HALE — Contata.','Non fidarti di chi ti sorride.','Il giallo non bastò.','Ho aperto. Non dovevo aprire.','Tre volte. Mi hanno contato tre volte.','NON GIRARTI','Chi legge questa pietra è già nella lista.'];
const WOOD_WHISPER=['…non girarti…','…uno di troppo…','…otto…','…resta con noi…','…hai le sue mani…','…il rosso, il rosso…','…{n}…','…sei in ritardo…'];
function buildWood(st){const m=new GMap('wood',32,44,{interior:1,name:'Il bosco'});m.fill(0,0,31,43,5);
 const P=(a,b,c,d)=>m.fill(a,b,c,d,2);
 P(15,24,16,43);P(8,24,14,25);P(8,18,9,25);P(17,24,23,25);P(22,14,23,25);P(15,14,23,15);P(15,7,16,15);P(11,2,20,7);
 WOOD_GRAVES.forEach(([x,y,v],i)=>m.add(OB('grave',x,y,IMG.grave[v],{act:'woodgrave',gi:i})));
 m.add(OB('albero',12,6,IMG.albero,{wt:7,solid:[[12,6],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6]],hits:[[12,6],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6]],act:'albero'}));
 m.add(OB('corpo',19,6,IMG.corpo,{act:'corpo'}));
 for(let y=-1;y<45;y++)for(let x=-1;x<33;x++){if(m.get(x,y)===2||m.objAt(x,y))continue;if(y>=2&&y<=6&&x>=10&&x<=21)continue;
  if(x>=0&&x<32&&y>=0&&y<44&&((x*7+y*13)%11===0))continue;
  const o=OB('pine',x,y,IMG.pine[hsh(x,y)%3],{act:'pine'});o.dx+=(hsh(x,y)%7)-3;m.add(o)}
 m.lights.push({x:15*16+8,y:5*16,r:95,red:1});
 m.doors.push({tx:15,ty:43,to:'main',x:30,y:5,dir:0});
 return m}
function genWoodArt(){
 {const [c,x]=mk2(112,104);srand(777);
  x.fillStyle='#0c0a10';for(let i=0;i<9;i++){x.beginPath();x.ellipse(56+(rnd()-.5)*90,18+rnd()*22,16+rnd()*14,10+rnd()*8,0,0,7);x.fill()}
  x.strokeStyle='#1a1014';x.lineCap='round';for(let i=0;i<7;i++){x.lineWidth=3+rnd()*3;x.beginPath();x.moveTo(56,52);x.bezierCurveTo(56+(rnd()-.5)*50,40,56+(rnd()-.5)*90,30,56+(rnd()-.5)*104,8+rnd()*20);x.stroke()}
  x.fillStyle='#241519';x.beginPath();x.moveTo(40,96);x.bezierCurveTo(44,78,38,60,46,40);x.lineTo(68,40);x.bezierCurveTo(76,60,70,80,76,96);x.closePath();x.fill();
  x.strokeStyle='#3a2229';x.lineWidth=1;for(let i=0;i<10;i++){x.beginPath();x.moveTo(44+rnd()*24,44+rnd()*8);x.lineTo(42+rnd()*30,94);x.stroke()}
  for(let i=0;i<13;i++){const sx=42+rnd()*30,ex=sx+(rnd()-.5)*104;x.strokeStyle=i%3?'#7c1512':'#a01c18';x.lineWidth=2+rnd()*3;x.beginPath();x.moveTo(sx,86);x.bezierCurveTo(sx+(ex-sx)*.3,100,sx+(ex-sx)*.7,84,ex,96+rnd()*3);x.stroke()}
  for(let i=0;i<9;i++){const hx=10+i*11+(rnd()-.5)*6,hy=94+rnd()*5,nonno=i===5;x.fillStyle='#cfc6b8';x.beginPath();x.ellipse(hx,hy,4.2,5,0,0,7);x.fill();
   x.fillStyle=nonno?'#fff':'#120a0c';x.fillRect(hx-2.5,hy-1,1.6,2);x.fillRect(hx+1,hy-1,1.6,2);if(nonno){x.fillStyle='#120a0c';x.fillRect(hx-2,hy-.6,.8,1.2);x.fillRect(hx+1.5,hy-.6,.8,1.2)}x.fillRect(hx-1,hy+2,2,1)}
  IMG.albero=c}
 {const [c,x]=mk2(24,34);x.fillStyle='#0e0b10';x.beginPath();x.moveTo(3,34);x.lineTo(7,15);x.quadraticCurveTo(12,9,17,15);x.lineTo(21,34);x.closePath();x.fill();
  x.fillStyle='#5a1210';x.fillRect(10,9,4,5);x.strokeStyle='#7c1512';x.lineWidth=1.4;for(let y=17;y<32;y+=5){x.beginPath();x.moveTo(2,y);x.lineTo(22,y+2);x.stroke()}
  IMG.corpo=c}}
PROMPT.woodgrave='Leggi';PROMPT.albero='Guarda';PROMPT.corpo='Guarda';
function woodTick(dt){if(G.mode!=='game'||!G.map||G.map.id!=='wood'||G.cut||UI.busy())return;const st=G.st,F=st.flags,[tx,ty]=ptile(G.player);
 G.woodT=(G.woodT||0)-dt;if(G.woodT<=0){G.woodT=7+Math.random()*6;const p=G.player;AU.play('whisper');floatText(fmt(WOOD_WHISPER[Math.random()*WOOD_WHISPER.length|0]),p.x+(Math.random()-.5)*60,p.y-30-Math.random()*20,'#c9b4b4',2.4)}
 if(F.woodDone)return;
 if(tx>=7&&tx<=10&&ty>=17&&ty<=19)return woodGo(woodDead);
 const stg=F.woodStage||0;for(const S of WOOD_ST)if(S.stage===stg&&Math.abs(tx-S.x)<=1&&Math.abs(ty-S.y)<=1)return woodGo(()=>woodRun(S.id))}
function woodGo(f){G.cut++;f().catch(e=>console.error(e)).finally(()=>{G.cut--})}
async function woodPull(tx,ty){AU.play('sting');G.shake=4;G.flash={a:1,c:'#000'};await UI.fade(1,400);setPos(G.player,tx,ty,3);updateCam(0);await UI.fade(0,500)}
const shuf=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
async function woodChoice(q,opts){const o=shuf(opts),c=await ask('coro',q,o.map(x=>x[0]),'dark');return o[c][1]}
async function woodDead(){await narr('Il sentiero si stringe, si chiude in un cerchio di alberi. Nessuna impronta, qui.');await narr('Dietro di te, i rami si sono richiusi. Qualcuno ha rialzato il sentiero.',{dark:1});addQuiete(-10);await woodPull(15,26)}
async function woodRun(id){const st=G.st,F=st.flags;
 if(id==='s1'){await narr('Il recinto giallo è alle tue spalle. Oltre, il buio non è assenza di luce: è qualcosa che ti guarda.');await narr('La lanterna fa un cerchio piccolo. Fuori dal cerchio, il bosco sussurra.');F.woodStage=1}
 else if(id==='s2'){await narr('Lapidi, a destra e a sinistra. Incisioni fresche: nomi e frasi lasciati da chi è passato prima di te.');await narr('Ti accorgi che alcune hanno scritto il tuo nome. Non ancora. Ma lo spazio c\'è.',{dark:1});F.woodStage=2}
 else if(id==='s3'){await narr('Una voce, vicinissima. Molte voci, in realtà, una dentro l\'altra.',{dark:1});
  const ok=await woodChoice('Come ti chiami, viandante?',[[st.name,1],['Elias',0],['Nessuno',0]]);
  if(ok){await say('coro','Un nome vero. Passa, per ora.',null,{dark:1});addQuiete(-2);F.woodStage=3}
  else{await say('coro','Bugiard{o|a}. Ti conteremo noi.',null,{dark:1});addQuiete(-12);await woodPull(15,40)}}
 else if(id==='s4'){await narr('Hai seguito le impronte di zoccoli, a destra, dove il sentiero è battuto. Le voci ti seguono, più vicine.');
  const ok=await woodChoice('Sei dei nostri?',[['Sì, sono dei vostri',0],['No. Non sono uno di voi.',1],['Aiutatemi',0]]);
  if(ok){await say('coro','…No. Non ancora.',null,{dark:1});addQuiete(-2);F.woodStage=4}
  else{await say('coro','Sì. Sì. Vieni a sederti.',null,{dark:1});addQuiete(-12);await woodPull(15,26)}}
 else if(id==='s5'){await narr('Silenzio. Poi, alle tue spalle, una voce che conosci.',{dark:1});await say('nonnovoce','{n}…',null,{dark:1});await say('nonnovoce','Sono io. Il nonno. Girati, fatti guardare.',null,{dark:1});
  const c=await ask(null,'La voce è quella del nonno. Viene da dietro di te. Vicinissima.',['Continua a camminare','Ti giri'],'dark');
  if(c===0){addQuiete(-3);await narr('Ti tappi la bocca con la mano e cammini. La voce, dietro di te, comincia a piangere.',{dark:1});F.woodStage=5}
  else{AU.play('scream');G.scare=1.2;G.shake=7;await sleep(1200);await narr('Dietro di te non c\'è nessuno. Ma tutto il bosco, ora, sa che hai guardato.',{dark:1});addQuiete(-15);await woodPull(22,16)}}
 else if(id==='s6')await treeScene()}
async function treeScene(){const st=G.st,F=st.flags;G.cutMusic='silent';
 await walkPlayer(15,7);G.player.dir=3;
 await narr('La radura. L\'Albero è immenso, contorto, nero. Le sue radici sono rosse come ferite aperte.');
 await narr('Fra le radici, in fila, ci sono le teste. Decine. Sussurrano tutte insieme, a bocca chiusa.',{dark:1});
 AU.play('whisper');G.glitch=10;await narr('Una di loro ha gli occhi aperti. Conosci quegli occhi. Li hai nei tuoi.',{dark:1});
 await say('elias','…{n}.',null,{dark:1});
 await say('elias','Sei venut{o|a}. Avevo sperato che non lo faresti. Avevo sperato che lo faresti.',null,{dark:1});
 await narr('Accanto all\'Albero, legato al tronco con radici rosse, c\'è un corpo seduto, in un mantello nero. Non ha la testa.');
 await narr('Gli zoccoli, il costume vuoto, il Cavaliere. È reale. È lui. È il corpo di tuo nonno.',{dark:1});AU.play('hooves');G.shake=3;
 await say('elias','Non fui risparmiato. Fui rimandato. Così il debito restasse aperto.',null,{dark:1});
 await say('elias','Il Cavaliere caccia finché il debito non è pagato. Con il tuo sangue. Il mio sangue.',null,{dark:1});
 if(countItem('nastro')&&!F.ribbonBuried){F.ribbonOut=1;await narr('Nella tasca, il nastro rosso brucia. Lo tiri fuori. Le radici si ritraggono dalla tua mano. Per un istante, le teste tacciono.');await say('elias','Quel colore… l\'Albero lo teme. L\'ho sempre saputo. Non ho mai avuto il coraggio.',null,{dark:1})}
 else await narr('Hai le mani vuote. Le radici si muovono verso i tuoi piedi, lente, curiose.',{dark:1});
 await say('elias','Ho mandato la lettera perché non potevo più resistere. Ho barrato la riga perché ti volevo bene. Perdonami.',null,{dark:1});
 AU.play('bell');await sleep(500);AU.play('bell',1.7);await narr('Lontano, nella Valle, suonano le campane. Una volta. Due. Il corpo, legato all\'Albero, solleva le mani.',{dark:1});
 AU.play('sting');G.scare=1;G.shake=7;await sleep(1300);
 F.treeSeen=1;F.woodDone=1;F.ch3end=1;st.flags.woodStage=6;
 await UI.fade(1,900);
 await UI.card('Fine del Capitolo III','L\'Albero dei Morti','Il Cavaliere è reale.<br>Il debito è tuo.',true,true,2000);
 await narr('Non ricordi la strada del ritorno. Ricordi solo il recinto giallo che si richiude alle tue spalle, e le lanterne della Valle accese tutte insieme, come occhi.',{dark:1});
 await narr('Domani è la Festa del Raccolto. Domani ti contano. Per l\'ultima volta.',{dark:1});
 G.cutMusic=null;G.cut--;await endDay(false,true);G.cut++}
Object.assign(ACT,{
 woodgrave:(o)=>{const L=NET.msgs||[],m=L[L.length-1-o.gi];UI.toast(m&&m.t?`«${m.t}»${m.n?' — '+m.n:''}`:WOOD_EPI[o.gi%WOOD_EPI.length])},
 albero:()=>UI.toast('L\'Albero dei Morti. Le radici si muovono quando non le guardi.'),
 corpo:()=>UI.toast('Il corpo di Elias. Le mani sono legate dietro il tronco. Ma si stanno sciogliendo.')});
function drawWoodExtras(m){for(const [tx,ty] of WOOD_PRINTS){const X=tx*16+4,Y=ty*16+6;ctx.fillStyle='rgba(60,18,8,.9)';for(const o of [0,7]){ctx.fillRect(X+o,Y,3,1);ctx.fillRect(X+o-1,Y+1,1,2);ctx.fillRect(X+o+3,Y+1,1,2)}}}

// ================= ABITANTI: reazioni, segreti, aiuti =================
const CH3T={agatha:['Ezekiel ti ha parlato, vero? Si vede dalla faccia. Si vede sempre.'],lucius:['So che sai. Non dire niente: i muri hanno orecchie, e i morti pure.'],brom:['Ti ha detto dei ferri? No? Meglio così.'],clara:['Ora siamo in due a sapere. Tre, con Tobia.'],tobia:['Hihi. Ora sai chi cavalca. O quasi.']};
const CH3W={agatha:['Sei tornat{o|a} dal bosco, tesoro. Lo so dal fango. E dalla faccia.'],lucius:['Sei tornat{o|a}. Conto otto, ma stavolta ti perdono.'],brom:['Mh. Sei tornat{o|a}. Allora bisogna fare altri ferri.'],clara:['Sei viv{o|a}! Dimmi tutto, ma non qui.'],tobia:['Hihi. Hai visto il Vecchio Albero? Ha le mani?']};
const CAUGHTL={ezekiel:'Stanotte eri fuori dopo la campana, {n}. Non farlo più. Non per me.',agatha:'Hai le occhiaie, tesoro. Stanotte hai fatto un giro sbagliato?',lucius:'Ti ho sentito correre. Di notte le mie orecchie sono buone.',clara:'Ti ho visto stamattina, sporco di terra. Stai bene?',brom:'Mh. Unghie piene di terra.',tobia:'Hihi. Hai corso! Anch\'io corro, quando mi inseguono.'};
const MISSL={ezekiel:'La focaccia, {n}. Era una cosa semplice.',agatha:'Qualcuno ha dimenticato il ceppo, ieri. Chissà chi, tesoro.',lucius:'La porta incisa… l\'ho vista. Non dirò niente.',clara:'Mi dispiace per la focaccia. Dovevo ricordartelo.',brom:'Porta graffiata. Fuori. Ripara tu.',tobia:'Hihi. Hanno grattato, grattato! Avevi dimenticato!'};
// segreti: si sbloccano con l'amicizia (cuori) e finiscono nella scheda Lore
const SECRETS={
 ezekiel:[[3,'Non ho mai visto il mondo di fuori, {n}. Sono nato qui, come mio padre. Ho sempre avuto paura di chiedere com\'è.'],[5,'Il fienile è rosso perché il rosso è l\'unico colore che l\'Albero non guarda. È il mio rifugio. Non l\'ho mai detto a nessuno. Non dirlo.']],
 agatha:[[3,'Ho visto arrivare sette forestieri, tesoro. Tuo nonno è l\'unico che si è fermato a ringraziarmi. Per questo sono ancora gentile.'],[5,'Il rosso non è cattivo, sai. È solo… scomodo. Per chi vive sotto terra. Non te l\'ho detto io.']],
 lucius:[[3,'Ogni sera conto sette e dico otto. Se lo dico io, forse ci crede meno.'],[5,'L\'ottavo, quello senza faccia: certe sere cammina in un modo che conosco. Ricorda uno di noi, uno che non c\'è più. Non posso dirti di più.']],
 clara:[[3,'Mio padre teneva un nastro rosso in tasca. Lo chiamava il mio compleanno, perché me lo mostrava solo quel giorno. Poi sparì.'],[5,'Certe notti qualcuno si ferma davanti alla mia finestra. Non ha faccia. Mi chiama "piccola". Non ho mai avuto il coraggio di aprire.']],
 brom:[[3,'Forgio i ferri perché quando smetto gli zoccoli si sentono più forte. Non so spiegarlo meglio.'],[5,'Una volta ne ho fatto uno storto, apposta. La mattina dopo era perfetto, appeso alla mia porta. Da allora non provo più.']],
 tobia:[[3,'Il rosso fa paura al Vecchio Albero. Hihi. Ma non dirlo alle zucche: ascoltano.'],[5,'Il Senza Volto non è cattivo. È solo stanco di aspettare. Hihi. Aspetta una bambina.']],
};
async function secretTell(n){const st=G.st,F=st.flags;if(!F.met[n.id])return;
 for(const [h,t] of SECRETS[n.id]||[]){const k='sec_'+n.id+h;if(F[k]||hearts(n.id)<h)continue;F[k]=1;
  await say(n.id,'Posso dirti una cosa, {n}? A te sì.');await say(n.id,t,'dark');UI.toast('Un segreto di '+NAMES[n.id]+' è stato aggiunto al diario (Lore).');addQuiete(-2);return}}
const RED_R={agatha:'Tesoro… hai in tasca qualcosa di rosso. Non l\'ho visto. Non l\'ho visto.',lucius:'Quell\'odore… Seppelliscilo, {figliolo|figliola}. Per il tuo bene.',clara:'…Hai del rosso addosso. Per favore, nascondilo.',brom:'Mh. Rosso. Non davanti alla fucina.'};
const RED_F={agatha:'Tienilo, tesoro. Ma nascondilo bene. E non farti vedere da Ezekiel.',lucius:'Lo sento anch\'io. Mi dà un sollievo che non dovrei provare. Tienilo nascosto.',clara:'Quel nastro… mio padre ne aveva uno uguale. Tienilo, ti prego. Non seppellirlo.',brom:'…Tienilo. Io non ho visto niente.'};
async function redReact(n){const st=G.st;if(!RED_R[n.id]||!(countItem('nastro')||countItem('bacche')))return;st.redSeen=st.redSeen||{};if(st.redSeen[n.id]===st.day)return;st.redSeen[n.id]=st.day;
 const friend=countItem('nastro')&&!countItem('bacche')&&hearts(n.id)>=(n.id==='brom'?3:2);
 if(friend){await say(n.id,RED_F[n.id],'fear');addQuiete(1)}else{await say(n.id,RED_R[n.id],'fear');addQuiete(-3)}}
async function ezekielCh3(n){const st=G.st,F=st.flags;
 const B=F.woodDone?['Sei tornat{o|a}. Non tutti tornano, {n}.','Hai visto, allora. Meglio saperlo prima della Festa.','Domani il Conteggio. Ti prego: non fare sciocchezze. Pensa a Clara.','Hai ancora della terra rossa sulle scarpe. Lavala prima della Festa.']
  :F.ezTruth?['Ora sai. Sapere non cambia niente, ma pesa in modo diverso.','Non ti fermo, {n}. Ma le campane le conosci. E io conosco te.','Se vai nel bosco, non fidarti della voce di chi hai amato.','Clara sa. Tobia sa. Non è un\'accusa: è un conto.']
  :[countItem('mantello')?'Il giallo ti sta bene, {n}. Così ti riconoscono.':'Hai ricevuto il mantello? Portalo. È così che ti riconoscono.','Oggi è un bel giorno, {n}.','Dormi bene? Qualcuno, stanotte, no. Ma è passato.','Niente parole inutili, oggi. Lavora, sorridi, aspetta la Festa.'];
 if(isSunday(st)&&F['mass'+st.day])B.push('Ti ho visto alla messa, stamattina. Bene. Molto bene.');
 return say('ezekiel',pickLine('ezekiel',[...B,...B,...B]),F.ezTruth?'dark':'stern')}
async function claraAllyTalk(n){const st=G.st,F=st.flags;
 const c=await ask('clara',F.woodDone?'Sei tornat{o|a}… dimmi.':'Dimmi, {n}.',['Chiacchiera','Cosa dovrei fare?','Niente']);if(c===2)return;
 if(c===0)return say('clara',pickLine('clara',['Mi sento meno sola. È strano, vero?','Ogni giorno conto le persone. Poi mi ricordo che non spetta a me.']));
 let t;
 if(!F.tobiaScene)t='Tobia… di giorno non lo vedo più in giro. Credo si nasconda nel fienile. Prova ad andarci.';
 else if(!F.ezTruth)t='Ora parla con l\'Anziano Ezekiel. Digli che sai del costume e del Registro. Vedrai come cambia faccia.';
 else if(!F.woodDone)t='Nel bosco: a destra, dove la terra è battuta e ci sono le impronte. Alle voci, di\' la verità. E se senti la voce del nonno… non girarti. Mai.';
 else if(st.chapter>=4)t=canBreak()?'Stasera. Se arriva il momento: il nastro, la testa di tuo nonno e il fuoco della mia lanterna. Io ci sono.':'Stasera la Festa. Non bere il sidro. Se tutto va storto, corri al Varco: ti aspetto lì.';
 else t=countItem('nastro')?'Domani è la Festa. Non andare da sol{o|a}. E tieni quel nastro: non seppellirlo.':'Domani è la Festa. Non andare da sol{o|a}. Se trovi un nastro rosso, tienilo.';
 return say('clara',t,F.woodDone?'fear':'')}
// ---------- indicatore dell'obiettivo ----------
function guideTarget(){const st=G.st,m=G.map;if(st.day<1)return null;const q=activeQuests().filter(q=>!q.d(st))[0];if(!q)return null;const txt=q.t(st);
 const P=(tx,ty,l)=>({x:tx*16+8,y:ty*16+4,l});
 if(m.id==='wood'){const S=WOOD_ST.find(s=>s.stage===(st.flags.woodStage||0));return S?P(S.x,S.y,''):null}
 if(m.interior){const d=m.doors[0];if(m.id==='house'&&/cassa/i.test(txt)&&st.flags.gotChestKey)return P(9,3,'Cassa');if(m.id==='barn'&&/fienile|registro|costume/i.test(txt))return P(5,3,'');return d?P(d.tx,d.ty,'Uscita'):null}
 const npc=id=>{const n=NPC(id);if(n&&!n.hidden&&n.map===m.id)return {x:n.x,y:n.y-12,l:NAMES[id]};const d=n&&n.lastIn?bdoor(n.lastIn):homeDoor(id);return P(d[0],d[1],NAMES[id]+' (dentro)')};
 const door=k=>{const d=bdoor(k);return P(d[0],d[1]+1,{barn:'Fienile',chapel:'Cappella',house:'Casa',forge:'Fucina',store:'Emporio'}[k]||'')};
 if(isFree(st)){const near=k=>{let b=null,bd=1e9;for(const o of m.objs){if(o.kind!==k)continue;const dd=Math.hypot(o.tx*16-G.player.x,o.ty*16-G.player.y);if(dd<bd){bd=dd;b=P(o.tx,o.ty+1,'')}}return b};
  if(/albero/i.test(txt))return near('tree');if(/roccia/i.test(txt))return near('rock');if(/banco/i.test(txt))return P(14,12,'Banco');if(/Piazza nella fattoria/.test(txt))return P(13,20,'Campi');
  const mi=missionsFor(st).find(x=>mstate(st,x.id).acc&&!mstate(st,x.id).done);if(mi&&/^Cerca «/.test(txt)){if(mi.luogo==='bosco')return P(30,5,'Varco');const [x,y]=missionSpot(mi);return P(x,y,'')}
  for(const id of Object.keys(NAMES))if(NPC(id)&&txt.includes(NAMES[id]))return npc(id);return null}
 if(/Presentati/.test(txt)){let best=null,bd=1e9;for(const id of FAV_NPC){if(st.flags.met[id])continue;const n=NPC(id);if(!n||n.hidden)continue;const dd=Math.hypot(n.x-G.player.x,n.y-G.player.y);if(dd<bd){bd=dd;best={x:n.x,y:n.y-12,l:NAMES[id]}}}return best}
 if(/Tobia/.test(txt)){const n=NPC('tobia');if(n&&n.hidden&&n.lastIn==='barn'||(st.chapter>=3&&!st.flags.tobiaScene))return door('barn');return npc('tobia')}
 for(const [re,id] of [[/Clara/,'clara'],[/Brom/,'brom'],[/Agatha/,'agatha'],[/Ezekiel|Anziano/,'ezekiel'],[/Lucius/,'lucius']])if(re.test(txt))return npc(id);
 if(G.erede&&G.prey)return {x:G.prey.x,y:G.prey.y-12,l:'Forestiero'};if(/Festa/.test(txt))return P(43,20,'Piazza');
 if(/bacheca/i.test(txt))return P(40,17,'Bacheca');if(/tomba/i.test(txt))return P(53,8,'Tomba');if(/ceppo/i.test(txt))return P(33,6,'Ceppo');
 if(/Varco|Albero/i.test(txt))return P(30,5,'Varco');if(/fienile/i.test(txt))return door('barn');if(/cappella|Vespro|campana|foglie/i.test(txt))return P(43,12,'Cappella');
 if(/pozzo/i.test(txt))return P(47,20,'Pozzo');if(/spaventapasseri/i.test(txt))return P(13,23,'');if(/cassetta|spedizion/i.test(txt))return P(13,10,'');
 if(/pali/i.test(txt)){const F=st.flags;let best=null,bd=1e9;POSTS.forEach(([x,y],i)=>{if(F.posts[i])return;const dd=Math.hypot(x*16-G.player.x,y*16-G.player.y);if(dd<bd){bd=dd;best=P(x,y+1,'Palo')}});return best}
 if(/campi|Zappa|zappa|semin|Annaffia|bacche|seme/i.test(txt))return P(13,23,'Campi');
 if(/casa|dormi|letto|cassa/i.test(txt)){const d=bdoor('house');return P(d[0],d[1]+1,'Casa')}
 return null}
function drawGuide(){if(!G.guideOn||G.mode!=='game'||G.cut||UI.busy()||!G.st||!G.map)return;
 if(!G.objC||G.t>G.objC.t)G.objC={t:G.t+.35,v:guideTarget()};const T=G.objC.v;if(!T)return;
 const sx=T.x-G.cam.x,sy=T.y-G.cam.y,M=14,RM=34,TOP=40,BOT=38,inside=sx>M&&sx<W-RM&&sy>TOP&&sy<H-BOT;
 ctx.save();ctx.font='8px "Silkscreen","Pixelify Sans",monospace';ctx.textAlign='center';
 const tri=(X,Y,a)=>{ctx.save();ctx.translate(X,Y);ctx.rotate(a);ctx.fillStyle='#2b1a10';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(-6,-3);ctx.lineTo(6,-3);ctx.closePath();ctx.fill();ctx.fillStyle='#f6d98a';ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(-4,-2);ctx.lineTo(4,-2);ctx.closePath();ctx.fill();ctx.restore()};
 let X,Y;
 if(inside){X=sx;Y=sy-14+Math.sin(G.t*4)*2;tri(X,Y,0)}
 else{X=clamp(sx,M,W-RM);Y=clamp(sy,TOP,H-BOT);const a=Math.atan2(sy-(Y-0),sx-X);tri(X,Y,Math.atan2(sy-H/2,sx-W/2)-Math.PI/2)}
 const d=Math.round(Math.hypot(T.x-G.player.x,T.y-G.player.y)/16),lab=(T.l||'')+(d>6?` · ${d}`:'');
 if(lab){const ty=inside?Y-8:(Y<H/2?Y+18:Y-12);ctx.fillStyle='#2b1a10';ctx.fillText(lab,X+1,ty+1);ctx.fillStyle='#f6d98a';ctx.fillText(lab,X,ty)}
 ctx.restore()}
G.guideOn=LS.get('hm_guide')!=='0';
// ---------- scheda Lore ----------
function loreHTML(){const st=G.st,F=st.flags,E=[];
 E.push(['Le Regole','I. Il rosso è il colore cattivo: va seppellito. II. Non si oltrepassa il recinto giallo. III. Alla campana delle nove si torna a casa e non si apre a nessuno.']);
 if(F.arrived)E.push(['La lettera del nonno','«Vai a viverci. Coltiva. Sii felice. Rispetta le loro regole.» In fondo, una riga cancellata: non venire.']);
 if(F.sawNoBridge)E.push(['Il ponte','Il ponte non c\'è più. Agatha giura che non c\'è mai stato.']);
 if(F.openedChest)E.push(['Pagina di Elias (1)','Il fienile dell\'Anziano è l\'unica cosa rossa della Valle. «Non farti contare due volte.» Le lanterne gialle non proteggono: segnano.']);
 if(F.vespro)E.push(['Il Vespro','Lucius conta sette presenti, ma il conto arriva a otto. In fondo siede una figura senza volto.']);
 if(F.page2)E.push(['Pagina di Elias (2)','Elias fu risparmiato in cambio di una promessa: «Uno del tuo sangue, quando sarà il momento.»']);
 if(F.sawCostume)E.push(['Il costume','Mantello, trampoli con zoccoli veri, sciabola di latta. Il Cavaliere l\'hanno costruito gli Anziani.']);
 if(F.readLedger)E.push(['Il Registro dei Nuovi Arrivati','Tutti segnati Contati, tranne Elias: Risparmiato. In fondo, a inchiostro ancora umido, il tuo nome: Destinato al Raccolto.']);
 if(F.tobiaScene)E.push(['Tobia e i trampoli','Tobia a volte "fa il Cavaliere", per gioco. L\'altra notte però dormiva. «Lui conta le teste. Il Vecchio non ha le mani.»']);
 if(F.ezTruth)E.push(['Il patto','Due secoli fa i fondatori fecero un patto con l\'Albero nel bosco: la Valle quieta e nascosta, e a ogni generazione un forestiero. Il costume nacque dopo, per tenere tutti dentro.']);
 if(F.treeSeen)E.push(['L\'Albero dei Morti','Fra le radici rosse, le teste dei Contati. Il Cavaliere è il corpo di Elias, legato all\'Albero: non fu risparmiato, fu rimandato. Con un nastro rosso, le radici si ritraggono.']);
 if(F.conteggio)E.push(['Il Conteggio','Alla Festa Lucius conta: sette presenti, e il numero continua a salire. A mezzanotte, dal Varco, arriva il Cavaliere.']);
 let nSec=0,tot=0;for(const id of Object.keys(SECRETS))for(const [h,t] of SECRETS[id]){tot++;if(F['sec_'+id+h]){nSec++;E.push([NAMES[id]+' confida',t])}}
 return E.map(([a,b])=>`<h3>${esc(a)}</h3><p class="small">${esc(fmt(b))}</p>`).join('')+eggLore()+freeSecretsLore()+`<p class="small" style="opacity:.7">Segreti degli abitanti: ${nSec}/${tot}. Più cresce l'amicizia, più si confidano.</p>`+(()=>{const f=JSON.parse(LS.get('hm_endings')||'[]');return f.length?`<h3>Finali scoperti</h3><p class="small">${f.map(n=>({1:'La Fuga',2:'L\'Erede',3:'Spezzare il patto'}[n])).join(' · ')} (${f.length}/3)</p>`:''})()}

// ================= CAPITOLO IV — LA FESTA DEL RACCOLTO =================
NAMES.padre='Il Senza Volto';
const FESTA_POS={ezekiel:[44,19],agatha:[47,20],lucius:[43,16],clara:[46,18],brom:[41,19],tobia:[49,18]};
const RING_SLOT={ezekiel:[46,18],agatha:[47,20],brom:[46,22],clara:[40,22],tobia:[39,20],lucius:[40,18]};
const festaLive=()=>{const st=G.st;return !!st&&st.chapter>=4&&!!st.flags.festaOn&&!st.flags.conteggio&&!st.flags.festaDone};
const festaPending=()=>{const st=G.st;return !!st&&st.chapter>=4&&!st.flags.festaDone};
const cutDec=()=>{G.cut=Math.max(0,G.cut-1)};
const canBreak=()=>{const st=G.st,F=st.flags;return !!(countItem('nastro')&&!F.ribbonBuried&&hearts('clara')>=3&&hearts('tobia')>=3&&F.openedChest&&F.page2&&F.readLedger&&F.treeSeen&&F.claraAlly)};
function festaGo(f){f().catch(e=>console.error(e))}
function festaTick(dt){const st=G.st;if(G.mode!=='game'||!st||st.chapter<4||G.cut||UI.busy())return;const F=st.flags,t=st.time;
 if(G.erede){eredeTick(dt);return}
 if(G.festaChase&&G.map.id==='main'){const [tx,ty]=ptile(G.player);if(ty<=5&&tx>=29&&tx<=32){G.festaChase=false;festaGo(escapeEnd);return}}
 if(F.festaDone||F.ch4day!==st.day)return;
 if(!F.festaOn){
  if(t>=19*60&&G.map.id==='main'){const [tx,ty]=ptile(G.player);if(tx>=38&&tx<=51&&ty>=15&&ty<=23){festaGo(()=>festaStart(false));return}}
  if(t>=22*60+30){festaGo(()=>festaStart(true))}
  return}
 if(!F.conteggio&&t>=23*60)festaGo(conteggio)}
async function festaStart(forced){const st=G.st,F=st.flags;if(F.festaOn)return;F.festaOn=1;G.cut++;
 try{try{const cp=JSON.parse(JSON.stringify(st));cp.map='main';cp.px=43;cp.py=20;cp.dir=3;LS.set('hm_prefesta',JSON.stringify(cp))}catch(e){}
  if(forced){await UI.fade(1,500);AU.play('knock');G.shake=3;await narr('Bussano alla porta. Non forte. Con pazienza.');await narr('«È ora, {n}. Ti aspettiamo in piazza.» Non una voce sola: tante, a tempo.',{dark:1});
   G.map=G.maps.main;st.map='main';setPos(G.player,43,20,0);snapNPCs();updateCam(0);await UI.fade(0,800)}
  G.cutMusic='title';
  await narr('La piazza è un sogno. Lanterne gialle, tavolate, zucche accese, ghirlande che ondeggiano senza vento.');
  await narr('Tutti ridono. Tutti ti guardano. Nessuno batte le palpebre abbastanza spesso.',{dark:1});
  UI.toast('Parla con tutti. Non accettare niente da chi sorride troppo.');UI.quest()}finally{cutDec()}}
// ---------- dentro la Festa ----------
async function drinkCup(){const st=G.st,F=st.flags;F.drank=1;AU.play('whisper');
 await narr('Il sidro è dolce. Troppo. Sa di mela, di ferro, di qualcosa che ricorda la terra smossa.');
 await narr('Le lanterne cominciano a respirare. Le voci della piazza si allungano, come se venissero da sott\'acqua.',{dark:1});
 G.glitch=12;addQuiete(-15);document.body.classList.add('corrupt2');UI.toast('Qualcosa nel sidro. Le gambe sono pesanti.','bad')}
async function festaTalk(n){const st=G.st,F=st.flags,id=n.id,h=hearts(id);
 if(id==='ezekiel'){if(F.drank){await say('ezekiel','{Bravo ragazzo|Brava ragazza}. Siediti. Tra poco ti sentirai molto legger{o|a}.','stern');return true}
  if(F.refusedE){await say('ezekiel','Il Conteggio è alle undici, {n}. Non allontanarti.','stern');return true}
  await say('ezekiel','Un brindisi, {n}. Al Raccolto. Alle cose che tornano.','stern');
  const c=await ask('ezekiel','Ti porge una coppa di sidro dorato. Sorride, e non è un sorriso che gli hai mai visto fare.',['Bevi','Rifiuta']);
  if(c===0)await drinkCup();else{F.refusedE=1;addQuiete(-2);await say('ezekiel','Peccato. Il sidro è la parte migliore della Festa.','stern')}return true}
 if(id==='agatha'){
  if(countItem('zucca')&&!F.gara){const c=await ask('agatha','Una zucca! Bellissima! Partecipi alla gara della più grande, tesoro?',['Partecipa','Non adesso']);
   if(c===0){F.gara=1;removeItem('zucca',1);st.money+=200;addFriend('agatha',2);AU.play('coin');UI.hud();
    await say('agatha','Vince! Vince la tua! Ecco il premio. E un bacio sulla fronte.');
    await narr('Sul tavolo, la tua zucca ha una faccia che non hai intagliato. Sorride esattamente come te.',{dark:1});addQuiete(-4)}return true}
  if(h>=3){F.warned=1;await say('agatha','Non bere il sidro, tesoro. Ha dentro qualcosa che ti fa dire di sì. Fingi di bere. Io non ti ho detto niente.','fear');return true}
  if(F.drank){await say('agatha','Così, tesoro. Brav{o|a}. Non fa male. Quasi.','dark');return true}
  const c=await ask('agatha','Assaggia il mio sidro, tesoro! Fatto con le mele del recinto!',['Bevi','Rifiuta']);
  if(c===0)await drinkCup();else{addFriend('agatha',-1);await say('agatha','Come vuoi, tesoro. Come vuoi. Ma la Festa è lunga.','dark')}return true}
 if(id==='brom'){if(h>=3){F.warned=1;await say('brom','Mh. Non bere. E quando suonano le campane, non restare vicino al Cavaliere. Corri. Corri senza voltarti.','fear');return true}
  await say('brom','Mh. Mangia. Beve chi non ha altro da fare.');return true}
 if(id==='lucius'){if(h>=3){F.warned=1;await say('lucius','Quando conto otto, {figliolo|figliola}, non guardare me. Guarda Clara. Io… non ce la faccio a mentirti.','fear');return true}
  await say('lucius','Presto conto. Come ogni sera di raccolto. Vorrei non doverlo fare.','dark');return true}
 if(id==='clara'){
  if(!F.claraAlly||h<3){await say('clara','Non adesso. Mi guardano. Ti prego, {n}: sorridi.','fear');return true}
  const c=await ask('clara','Siamo tutti qui, tutti in piazza. Eppure sembra di essere soli.',['Balla con me','Parlami del piano','Niente']);
  if(c===0&&!F.danced){F.danced=1;addFriend('clara',3);AU.play('ok');await narr('Ballate. La musica è dolce e sbagliata, come un carillon rotto.');
   await narr('Ti sussurra, a un passo dall\'orecchio, senza smettere di sorridere: «Dopo il Conteggio. Se succede qualcosa, corri al Varco. Non fermarti per nessuno.»',{dark:1});floatText('♥',n.x,n.y-30,'#ff7a6a');addQuiete(-3)}
  else if(c===1)await say('clara','Dopo il Conteggio, se qualcosa va storto, corri al Varco. Io ti aspetto lì. Ma se hai un nastro rosso, e hai letto tutto… allora forse c\'è un\'altra strada: l\'Albero, la testa di tuo nonno. Devi crederci, però.','fear');
  return true}
 if(id==='tobia'){if(h>=3&&!F.tobiaPlan){F.tobiaPlan=1;await say('tobia','Hihi. Il costume è sotto il mio letto. Quando serve, faccio il Cavaliere. Per distrarli. Tu sai a chi. Hihi.','dark');return true}
  await say('tobia',['Otto, otto, otto! Hihi!','La zucca ti ha vista. Ti ha vista bene.','Nel cerchio c\'è un posto vuoto. Tutto per te.'][st.time%3],'dark');return true}
 return false}
// ---------- il Conteggio ----------
const FESTA_HELP={agatha:'Agatha rovescia una tavolata davanti agli zoccoli. «Oh, che sbadata!», dice, senza smettere di sorridere.',brom:'Brom si para davanti al Cavaliere con il martello in mano. Non dice niente. Non serve.',lucius:'Lucius ricomincia a contare ad alta voce, sbagliando apposta. Il Cavaliere si volta verso di lui, confuso.',tobia:'Tobia ride, fortissimo, e corre dalla parte opposta: «Di qua! Di qua, Vecchio! Hihi!»'};
const FESTA_FOE={agatha:'«È lì! Va verso il Varco!» grida Agatha, con la voce dolce di sempre.',lucius:'«Di là» sussurra Lucius, e indica il Varco. Non riesce a guardarti.',brom:'Brom sposta una panca, piano, per lasciare passare il Cavaliere.',tobia:'Tobia batte le mani. «Corri, corri! Tanto ti prende! Hihi!»'};
function ringDir(x,y){const dx=43-x,dy=20-y;return Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0)}
function addClone(tx,ty,dir){const o={id:'faceless',name:'???',map:'main',x:tx*16+8,y:ty*16+14,dir,anim:0,path:null,tgt:null,hidden:false,speed:34,script:true,clone:1};G.npcs.push(o);return o}
async function moveHorse(tx,ty,sp){const h=G.horse;h.on=true;while(Math.hypot(h.x-tx*16-8,h.y-ty*16-14)>3){const dx=tx*16+8-h.x,dy=ty*16+14-h.y,d=Math.hypot(dx,dy);h.x+=dx/d*sp*.05;h.y+=dy/d*sp*.05;if(Math.abs(dx)>2)h.dir=dx<0?1:2;h.anim+=.5;G.shake=Math.max(G.shake,.8);if(Math.random()<.4)AU.play('hooves');await sleep(50)}}
async function cleanFesta(){G.npcs=G.npcs.filter(n=>!n.clone);const f=NPC('faceless');f.hidden=true;f.script=false;for(const id of Object.keys(RING_SLOT))NPC(id).script=false}
async function conteggio(){const st=G.st,F=st.flags;F.conteggio=1;G.cut++;
 try{G.cutMusic='silent';document.body.classList.remove('corrupt2');
  for(const id in RING_SLOT){const n=NPC(id),[x,y]=RING_SLOT[id];n.script=true;placeNPC(n,'main',x,y,ringDir(x,y))}
  await UI.fade(1,300);setPos(G.player,43,23,3);updateCam(0);await UI.fade(0,500);
  await say('ezekiel','Cittadini di Hollowmere. È l\'ora del Conteggio. Siamo tutti? Fratello Lucius.','stern');
  const order=[['ezekiel','Ezekiel Thorne. Uno.'],['agatha','Agatha Crane. Due.'],['brom','Brom. Tre.'],['clara','Clara. Quattro.'],['tobia','Tobia. Cinque.']];
  for(let i=0;i<order.length;i++){const n=NPC(order[i][0]);AU.play('count');floatText(String(i+1),n.x,n.y-30,'#fff4c0',2.2);await say('lucius',order[i][1])}
  AU.play('count');floatText('6',G.player.x,G.player.y-30,'#fff4c0',2.2);await say('lucius','{n}. Sei.');
  const lu=NPC('lucius');AU.play('count');floatText('7',lu.x,lu.y-30,'#fff4c0',2);await say('lucius','E io. Sette.','fear');
  await sleep(900);
  const f1=NPC('faceless');f1.script=true;placeNPC(f1,'main',43,17,0);AU.play('wrongcount');floatText('8',f1.x,f1.y-30,'#ff6a5a',3.5);G.glitch=14;
  G.festaDark=true;G.horror=1;await sleep(900);
  await say('lucius','…Otto.','dark');
  const f2=addClone(41,21,2);AU.play('wrongcount');floatText('9',f2.x,f2.y-30,'#ff6a5a',3);await sleep(700);
  await say('lucius','…Nove. No. No, io… dieci. Undici.','fear');
  addClone(45,21,1);const f4=addClone(43,26,3);AU.play('sting');G.shake=5;floatText('11',f4.x,f4.y-30,'#ff6a5a',3);await sleep(900);
  for(const id in RING_SLOT){const n=NPC(id);n.dir=ringDir(n.x,n.y)}
  await narr('Le lanterne gialle si sono spente, una dopo l\'altra, senza fare rumore. Resta solo la luce della tua lanterna. E gli occhi.',{dark:1});
  await narr('Tutti, nel cerchio, si sono voltati verso di te. Anche chi sorrideva. Soprattutto chi sorrideva.',{dark:1});
  await say('ezekiel','Il Conteggio è giusto, come ogni anno. Uno di troppo, come ogni anno. La Valle sa quale.','dark');
  if(F.drank){await narr('Provi a muoverti. Le gambe non rispondono. Qualcuno ti prende sotto le braccia, con dolcezza.',{dark:1});await cleanFesta();await ending2(true,'sidro');return}
  AU.play('bell');await sleep(500);G.redTint=.25;
  for(let i=1;i<=12;i++){AU.play('bell',i%2?1:1.7);G.shake=2.5;if(i===4)G.redTint=.4;if(i===9)G.redTint=.55;await sleep(520)}
  await narr('Dopo il dodicesimo rintocco, dal Varco, il rumore che aspettavi dal primo giorno.',{dark:1});
  setPos(G.horse,30,4);G.horse.dir=1;G.horse.on=true;await moveHorse(36,19,70);await moveHorse(41,24,55);
  await narr('Il Cavaliere entra nella piazza. Il mantello nero è più alto delle lanterne spente. Non ha la testa: dove dovrebbe stare il collo, una radice rossa si muove, cieca.',{dark:1});
  AU.play('scream');G.scare=1.1;await sleep(900);
  const opts=[],act=[];
  opts.push(F.claraAlly&&hearts('clara')>=3?'Corri verso il Varco':'Corri');act.push('run');
  if(canBreak()){opts.push('Spezza il patto: usa il nastro rosso');act.push('break')}
  opts.push('Indossa il mantello giallo e lasciati contare');act.push('heir');
  const c=await ask(null,'Il Cavaliere ti guarda, senza occhi. Il cerchio si stringe. Tutti aspettano.',opts,'dark');const ch=act[c];
  await cleanFesta();
  if(ch==='heir'){await ending2(false,'accetti');return}
  if(ch==='break'){await breakPact();return}
  {const H=['agatha','brom','lucius','tobia'],help=H.filter(id=>hearts(id)>=3),foes=H.filter(id=>hearts(id)<=1),clara=F.claraAlly&&hearts('clara')>=3;
   if(!help.length&&foes.length===H.length&&!clara){await narr('Fai un passo. Una mano ti stringe il polso, forte: è Brom. Non ti guarda negli occhi.',{dark:1});await say('brom','Mh. Mi dispiace. Non abbastanza.','dark');
    await narr('Nessuno, nel cerchio, si muove per aiutarti. Nessuno ti ha mai conosciuto abbastanza da provarci.',{dark:1});await ending2(true,'consegnato');return}
   for(const id of help.slice(0,2))await narr(FESTA_HELP[id]);
   if(foes.length>=2&&help.length<2){const id=foes.find(x=>FESTA_FOE[x]);await narr(FESTA_FOE[id],{dark:1})}
   G.redTint=.3;G.cutMusic=null;G.horse.on=false;spawnHorse(43,29+Math.min(help.length,3)*3,57-help.length*2+(foes.length>=3?3:0));G.festaChase=true}
  UI.toast('CORRI AL VARCO!','bad');UI.quest()}
 finally{cutDec()}}
// ---------- finale 1: la Fuga ----------
async function escapeEnd(){const st=G.st,F=st.flags;G.cut++;G.chase=false;G.horse.on=false;G.redTint=.2;
 try{
  if(!F.claraAlly||!countItem('lanterna')){await narr('Il Varco è lì. Ma i rami si chiudono davanti a te come una mano. Senza una guida e senza una luce che il bosco riconosca, non si passa.',{dark:1});await narr('Dietro di te, gli zoccoli rallentano. Non hanno più fretta.',{dark:1});await ending2(true,'varco');return}
  const cl=NPC('clara');cl.script=true;placeNPC(cl,'main',30,5,0);AU.play('sting');
  await say('clara','Qui! Non guardare indietro! Dammi la mano!','fear');
  await UI.fade(1,300);G.cutMusic='silent';cl.script=false;cl.hidden=true;
  await narr('Il bosco vi lascia passare. I rami si scostano come per chiedere scusa. Dietro di voi, il galoppo, e basta: il galoppo di qualcosa che vi vuole.',{dark:1});
  await narr('Correte per ore, o per minuti. Le teste, fra le radici, sussurrano i vostri nomi. Poi, a poco a poco, smettono: il bosco finisce.');
  G.redTint=0;await showScene('strada','All\'alba, il bosco finisce su una strada asfaltata.');
  await say('clara','Un camion… {n}, un camion! Allora è vero. È tutto vero.');
  await narr('Sul fianco del camion, un adesivo di revisione con una data stampata. Non è il 1800. Non lo è da moltissimo tempo.',{dark:1});
  await narr('Fuori è il mondo di oggi. Hollowmere è una riserva privata, comprata dai fondatori. Nessuno, qui fuori, sa che esiste.');
  await say('clara','Il Registro diceva 1846. Mio padre… tuo nonno… Che anno è, {n}? Che anno è davvero?','fear');
  await say('clara','Guarda quelle luci, laggiù. Non si spengono mai. Non… non si spengono mai.');
  const reg=(NET.regNames||[]).filter(x=>x&&x!==st.name),who=reg.length?reg[reg.length-1]:'Marlowe';
  await UI.paper(`<h2>Una lettera, altrove</h2><div class="paper"><p>Caro ${esc(who)},</p><p>se leggi queste righe, il tuo vecchio zio se n'è andato.</p><p>Ti lascio una casa in una valle tranquilla. La gente è gentile, l'aria profuma di mele.</p><p>Vai a viverci. Coltiva. Sii felice.</p><p class="ink"><s>non venire</s></p></div>`,'Chiudi');
  await finishGame(1,'La Fuga','Sei uscit'+(st.g==='f'?'a':'o')+' dalla Valle. Hollowmere, però, non dimentica chi ha contato.')}
 finally{cutDec()}}
// ---------- finale 2: l'Erede ----------
async function ending2(taken,why){const st=G.st,F=st.flags;G.cut++;G.chase=false;G.festaChase=false;G.horse.on=false;G.festaDark=true;
 try{G.cutMusic='silent';
  if(taken){await narr(why==='chase'?'Ti raggiungono. Non fa male. Il galoppo si ferma proprio dietro di te, e un gelo che sa di terra ti chiude la nuca.':'Tante mani. Odorano di sego e di mela. Ti portano via come si porta via un bambino che dorme.',{dark:1});await narr('Ti vestono con il mantello giallo. Ti si chiude sulle spalle come una mano.',{dark:1})}
  else await narr('Indossi il mantello giallo. Ti si chiude sulle spalle come una mano. È caldo. Pesa meno di quanto pensassi.',{dark:1});
  G.redTint=.7;AU.play('count');await say('lucius','{n}. Otto. Finalmente tutti.','dark');AU.play('sting');G.shake=8;G.scare=1.6;await sleep(1400);
  await UI.fade(1,900);G.redTint=1;await UI.card('','Il Conteggio è giusto.','Qualcuno, a Hollowmere, doveva esserci di troppo.',true,true,1800);
  G.redTint=0;await UI.card('Anni dopo','…','Una nuova diligenza si ferma davanti al ponte.',false,true,1600);
  await eredeChase();
  const heir=st.name;if(NET.heir)NET.heir(heir);
  await UI.paper(`<h2>Registro dei Nuovi Arrivati</h2><div class="paper"><p>1846 · <b>Elias Marlowe</b> — Risparmiato.</p><p class="wet">Quest'anno · <b>${esc(heir)}</b> — <b>RISPARMIATO.</b></p><p class="small"><i>Debito aperto. Il Cavaliere ha una testa, adesso: la tua.</i></p></div>`,'Chiudi');
  await finishGame(2,'L\'Erede','Hollowmere ha di nuovo un Cavaliere. Non ricordi più com\'era respirare.')}
 finally{cutDec()}}
async function eredeChase(){const st=G.st,F=st.flags;F.bridgeGone=0;st.weather='nebbia';st.time=21*60+10;G.festaDark=true;rebuildMaps();G.map=G.maps.main;st.map='main';
 for(const n of G.npcs){n.hidden=true;n.script=true}
 setPos(G.player,44,45,3);updateCam(0);await UI.fade(0,900);
 await say('cocchiere',`«Più in là non vado, ${st.g==='f'?'signore':'signora'}. Nessuno ci va.»`);
 await narr('Dalla diligenza è sceso qualcuno con una valigia e una lettera in mano. Guarda la Valle. Sorride, sollevat'+(st.g==='f'?'o':'a')+'.');
 await narr('Tu sei alle sue spalle, sul ponte. Sei alto. Il tuo cavallo non esiste. Non ti serve.',{dark:1});
 LOOKS.prey=PLAYER_LOOKS[st.g==='f'?'m':'f'];delete SHEET.prey;G.prey={x:44*16+8,y:40*16+14,dir:3,anim:0,moving:true,wp:1,speed:58};
 G.erede=true;G.player.speed=76;G.player.dir=3;UI.toast('Insegui il forestiero. Il debito va pagato.','bad');UI.quest();
 const hold=G.cut;G.cut=0;const res=await new Promise(r=>{G.eredeRes=r});G.cut=hold;   // libera i controlli: il giocatore è il Cavaliere
 G.erede=false;G.prey=null;G.player.speed=66;AU.play('scream');G.scare=1.6;G.shake=8;await sleep(1500);
 await narr(res?(st.g==='f'?'Lo':'La')+' raggiungi in mezzo alla strada, dove la nebbia è più fitta. Non urla. Nessuno urla, a quel punto.':'Si chiude in cappella e tira il chiavistello. Aspetti. Hai tutta la notte. Hai tutte le notti.',{dark:1})}
function eredeTick(dt){const pr=G.prey,p=G.player;if(!pr||G.cut||UI.busy())return;
 const WP=[[44,40],[44,31],[43,24],[43,19],[43,13]],w=WP[pr.wp];
 if(w){const dx=w[0]*16+8-pr.x,dy=w[1]*16+14-pr.y,d=Math.hypot(dx,dy);if(d<4)pr.wp++;else{pr.x+=dx/d*pr.speed*dt;pr.y+=dy/d*pr.speed*dt;pr.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);pr.anim+=dt*9}}
 if(p.moving&&Math.random()<dt*7){AU.play('hooves');G.shake=Math.max(G.shake,.6)}
 if(Math.hypot(p.x-pr.x,p.y-pr.y)<14){const r=G.eredeRes;G.eredeRes=null;G.erede=false;if(r)r(true)}
 else if(pr.wp>=WP.length){const r=G.eredeRes;G.eredeRes=null;G.erede=false;if(r)r(false)}}
// ---------- finale 3: spezzare il patto ----------
async function breakPact(){const st=G.st,F=st.flags;G.cut++;
 try{G.cutMusic='silent';G.redTint=.2;
  await narr('Tiri fuori il nastro rosso. Tutto il cerchio fa un passo indietro, nello stesso momento. Il Cavaliere inclina il collo di radice. Per la prima volta, esita.',{dark:1});
  await say('clara','Il Varco! Adesso! L\'Albero, {n}: la testa del nonno!','fear');
  await UI.fade(1,300);AU.play('sting');
  G.map=G.maps.wood;st.map='wood';G.horse.on=false;setPos(G.player,15,8,3);updateCam(0);G.horror=1;await UI.fade(0,600);
  await narr('Corri, e Clara corre con te. Alle vostre spalle, in piazza, un rumore buffo e terribile: trampoli su pietra.');
  await say('tobia','Hihi! Da questa parte! Prendetemi! Prendetemi, Vecchi! Hihi!','dark');
  await narr('Tobia, nel costume del Cavaliere, trascina gli Anziani lontano dalla piazza, ridendo. Ride come ha sempre riso, anche adesso.',{dark:1});
  await narr('La radura. L\'Albero. Fra le radici rosse, la testa di Elias ha gli occhi aperti. Ti stava aspettando.',{dark:1});
  await say('elias','…Sei tornat{o|a}. Credevo non avresti avuto coraggio. Credevo di non averne io.',null,{dark:1});
  await ask(null,'Le radici ti stringono le caviglie. Il nastro è caldo, come se battesse.',['Lega il nastro rosso alla testa di tuo nonno'],'dark');
  AU.play('whisper');G.shake=4;await narr('Quando il rosso tocca il rosso, le radici urlano. Si ritraggono, come bruciate. La testa di Elias si stacca, leggera come un uovo.',{dark:1});
  await say('elias','Grazie. Ora… ora basta, {n}. Riportami da lui.',null,{dark:1});
  await narr('Gli zoccoli. Il Cavaliere è arrivato nella radura. Sei in ginocchio, con la testa di tuo nonno fra le mani, e non scappi.',{dark:1});AU.play('hooves');
  await narr('Gliela porgi. Il corpo, legato da due secoli, si ferma. Le mani cercano la testa. E, piano, il Cavaliere si inginocchia.');
  await say('elias','Sono a casa. Sono… finalmente a casa.');
  await say('clara','Adesso, {n}. Adesso.','fear');
  AU.play('sting');G.redTint=.6;for(let i=0;i<14;i++){burst('spark',15*16+(Math.random()-.5)*80,4*16+Math.random()*40,6,'#ff8a2a');AU.play('hoe');await sleep(120)}
  await narr('Clara avvicina la lanterna alle radici. Il fuoco parte da sotto, rosso e giallo, e sale. L\'Albero non urla: sospira.',{dark:1});
  await narr('Le teste, fra le radici, smettono di sussurrare. Una per una. Poi il silenzio, quello vero, che a Hollowmere non c\'era mai stato.');
  await narr('Nel fumo, dove stava il Senza Volto, c\'è un uomo. Ha un volto. Non è uno sconosciuto.',{dark:1});
  await say('clara','…Papà?');await say('padre','…piccola.');
  G.redTint=0;await UI.fade(1,900);
  await showScene('tomba','Alba. Il recinto giallo, scolorito, è di un grigio qualsiasi.');
  await narr('La Valle è libera, e senza più protezione. Ognuno deve scegliere: restare o andare via. Alcuni piangono. Altri non sanno più che giorno è.');
  await narr('Sulla tomba del nonno, adesso, c\'è scritto: «Elias Marlowe — Tornato a casa.»');
  await finishGame(3,'Spezzare il patto','Il debito è chiuso. Hollowmere, per la prima volta, è solo una valle.')}
 finally{cutDec()}}
// ---------- scene illustrate ----------
const SCENES={
 strada(x,t){const g=x.createLinearGradient(0,0,0,150);g.addColorStop(0,'#10162e');g.addColorStop(.55,'#6a4a6a');g.addColorStop(1,'#f0a060');x.fillStyle=g;x.fillRect(0,0,480,270);
  srand(12);for(let i=0;i<22;i++){const bx=170+i*12,bh=14+rnd()*34;x.fillStyle='#1a1626';x.fillRect(bx,150-bh,10,bh);for(let k=0;k<4;k++)if(rnd()<.6){x.fillStyle='#ffd070';x.fillRect(bx+2+(k%2)*4,150-bh+4+(k>>1)*8,2,3)}}
  x.fillStyle='#14110e';x.fillRect(0,150,480,120);x.fillStyle='#22222a';x.beginPath();x.moveTo(200,150);x.lineTo(280,150);x.lineTo(430,270);x.lineTo(50,270);x.closePath();x.fill();
  x.fillStyle='#d8d8c8';for(let i=0;i<6;i++){const y=156+i*i*3.4,w=1+i*.9;x.fillRect(240-w/2,y,w,3+i)}
  for(const sd of [-1,1])for(let i=0;i<14;i++){const px=sd<0?20+i*13:300+i*13,py=150+(i%3)*4;x.fillStyle='#07090c';x.beginPath();x.moveTo(px,py);x.lineTo(px+7,py-52-(i%4)*9);x.lineTo(px+14,py);x.fill()}
  const tx=((t*55)%620)-110;x.fillStyle='#c8c8d0';x.fillRect(tx,176,70,28);x.fillStyle='#8a8a94';x.fillRect(tx+70,184,22,20);x.fillStyle='#222';x.beginPath();x.arc(tx+16,206,6,0,7);x.arc(tx+78,206,6,0,7);x.fill();
  x.fillStyle='rgba(255,240,170,.35)';x.beginPath();x.moveTo(tx+92,190);x.lineTo(tx+190,176);x.lineTo(tx+190,214);x.closePath();x.fill();
  x.fillStyle='#050505';for(const fx of [212,240]){x.fillRect(fx,238,12,24);x.beginPath();x.arc(fx+6,234,6,0,7);x.fill()}x.fillStyle='#e8c23a';x.fillRect(209,246,5,16)},
 tomba(x,t){const g=x.createLinearGradient(0,0,0,170);g.addColorStop(0,'#7a8aa8');g.addColorStop(1,'#f4c488');x.fillStyle=g;x.fillRect(0,0,480,270);x.fillStyle='#4a5a34';x.beginPath();x.moveTo(0,190);x.quadraticCurveTo(240,120,480,190);x.lineTo(480,270);x.lineTo(0,270);x.fill();
  x.fillStyle='#a8a090';for(let i=0;i<14;i++){x.fillRect(20+i*34,168+Math.sin(i)*3,5,26);x.fillRect(16+i*34,176+Math.sin(i)*3,40,3)}
  x.fillStyle='#3a342c';x.fillRect(228,150,8,56);x.fillRect(214,164,36,7);x.fillStyle='#e8dcc0';x.font='9px monospace';x.textAlign='center';x.fillText('ELIAS MARLOWE',232,226);x.fillText('Tornato a casa',232,238);
  for(let k=0;k<5;k++){const px=60+k*70+Math.sin(t*.6+k)*3;x.fillStyle='#1a1410';x.fillRect(px,222,6,18);x.beginPath();x.arc(px+3,218,4,0,7);x.fill()}}
};
function showScene(kind,cap){return new Promise(res=>{UI.open(`<canvas id="scn" width="480" height="270" style="width:100%;image-rendering:pixelated;border:2px solid #2b1a10"></canvas><p class="small" style="text-align:center;margin-top:6px">${esc(cap||'')}</p><p style="text-align:right"><button class="btn" data-close>Continua</button></p>`,res);
  const c=document.getElementById('scn'),x=c.getContext('2d');x.imageSmoothingEnabled=false;let t=0;SCENES[kind](x,0);const iv=setInterval(()=>{if(!document.getElementById('scn')){clearInterval(iv);return}t+=.05;SCENES[kind](x,t)},50)})}
// ---------- fine ----------
async function finishGame(n,name,epi){
 try{const E=new Set(JSON.parse(LS.get('hm_endings')||'[]'));E.add(n);LS.set('hm_endings',JSON.stringify([...E]));const base=JSON.parse(JSON.stringify(G.st));base.endingN=n;LS.set('hm_freebase',JSON.stringify(base));const cp=LS.get('hm_prefesta');if(cp)LS.set('hm_save',cp)}catch(e){}
 const E=JSON.parse(LS.get('hm_endings')||'[]');
 await UI.fade(1,700);G.redTint=0;G.festaDark=false;
 await UI.card(`Finale ${n}/3`,name,`${epi}<br><br><span class="small">Finali scoperti: ${E.length}/3.<br>Nel menu si è aperta <b>la Valle</b>: il gioco libero, con le stagioni, gli altri giocatori e le missioni. Da «Altri finali» puoi ripartire dal primo bivio.</span>`,n===2,true,2200);
 G.cut=0;toTitle()}

ACTD.festa='alla Festa';
function drawEredeHorse(){const p=G.player,img=IMG.horse[Math.floor(p.anim/2)%2],dir=p.dir===1?1:p.dir===2?0:(G._ed||0);G._ed=dir;ctx.drawImage(SHADOW,p.x-12,p.y-3,24,6);
 if(dir===1){ctx.save();ctx.translate(Math.round(p.x),0);ctx.scale(-1,1);dImg(ctx,img,-22,Math.round(p.y-38));ctx.restore()}else dImg(ctx,img,Math.round(p.x-22),Math.round(p.y-38))}

