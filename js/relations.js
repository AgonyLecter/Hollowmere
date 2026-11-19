'use strict';
// ================= RELAZIONI E STAGIONI (gioco libero) =================
// Compleanni, regali amati e detestati (si scoprono regalando), dialoghi e confidenze che crescono con l'amicizia.
// Le stagioni cambiano i vestiti di tutti e l'aspetto della Valle.

const FRIENDS=['ezekiel','agatha','lucius','clara','brom','tobia','ottavio','irene'];
const BDAY={ezekiel:[1,9],agatha:[2,14],lucius:[0,21],clara:[3,5],brom:[1,23],tobia:[2,1],ottavio:[3,18],irene:[0,11]};
const isBday=(id,st)=>{st=st||G.st;const b=BDAY[id];return !!b&&isFree(st)&&seasonOf(st)===b[0]&&seasonDay(st)===b[1]};
const bdayLabel=id=>{const b=BDAY[id];return b?`${b[1]} ${SEASONS[b[0]].toLowerCase()}`:'?'};
// gusti: 3 ama, 2 piace, 1 gradisce, -1 detesta (LIKES esiste già per gli abitanti della storia)
Object.assign(LIKES,{ottavio:{latte:2,pomodoro:2,parmigiana:3,pastaaglio:3,funghi:1},irene:{zuppabietole:3,camomilla:2,tisana:3,more:2,agrifoglio:1}});
Object.assign(LIKES.ezekiel,{risottofunghi:3,funghi:2,radice:1});Object.assign(LIKES.agatha,{castagnaccio:3,zuppacipolle:2,camomilla:1});Object.assign(LIKES.lucius,{minestrone:3,tisana:2,spinaci:1});
Object.assign(LIKES.clara,{tortamore:3,insalatamista:2,tarassaco:1});Object.assign(LIKES.brom,{peperonata:3,anguriafresca:2,castagne:1});Object.assign(LIKES.tobia,{frittataasparagi:3,anguriafresca:3,nocciole:2});
const DISLIKES={ezekiel:['agrifoglio','tarassaco','fibra'],agatha:['aglio','cipolla','pietra'],lucius:['peperone','peperonata','more'],clara:['radice','aglio','legna'],brom:['lattuga','insalata','camomilla'],tobia:['spinaci','porro','cavolo'],ottavio:['tarassaco','agrifoglio'],irene:['zucca','torta']};
function giftTier(id,item){if((DISLIKES[id]||[]).includes(item))return -1;return (LIKES[id]||{})[item]||0}
const TIER_N={3:'ama','2':'piace','1':'gradisce','0':'neutro','-1':'detesta'};
const GIFT_PTS={3:3,2:2,1:1,0:1,'-1':-2};
const GIFT_L={
 3:['È… è perfetto. Come facevi a saperlo?','Questo lo adoro, {n}. Davvero.','Oh! Il mio preferito in assoluto.'],
 2:['Che pensiero gentile. Mi piace molto.','Grazie! Lo userò di sicuro.','Bello. Mi hai fatto una bella sorpresa.'],
 1:['Grazie, {n}.','Gentile da parte tua.','Lo apprezzo.'],
 0:['Oh. Grazie.','Un regalo? Grazie, {n}.','Mh. Non me l\'aspettavo.'],
 '-1':['…Grazie. Credo.','Questo proprio no, {n}. Ma grazie del pensiero.','Ehm. Lo metto da parte. Molto da parte.'],
};
async function freeGift(n,id){const st=G.st,t=giftTier(n.id,id),bd=isBday(n.id);removeItem(id,1);st.gifted[n.id]=1;
 st.free.known=st.free.known||{};(st.free.known[n.id]=st.free.known[n.id]||{})[id]=t;
 let pts=GIFT_PTS[t];if(bd&&pts>0)pts*=2;addFriend(n.id,pts);AU.play(t>=0?'ok':'sting');floatText(t>=2?'♥♥':t>=0?'♥':'💢',n.x,n.y-30,t>=0?'#ff7a6a':'#a8a8a8');
 const L=GIFT_L[t];await say(n.id,(bd?(t>=0?'Per il mio compleanno! ':'Proprio per il mio compleanno… '):'')+L[(st.day+n.id.length)%L.length],t<0?'sad':'');
 UI.toast(`${NAMES[n.id]} ${TIER_N[t]} ${ITEMS[id].n.toLowerCase()}. Annotato nel taccuino.`)}

// ---------- dialoghi che crescono: quattro gradi di amicizia ----------
const FREE_T={
 ezekiel:[['Buongiorno, {n}. La Valle ti tratta bene?','Non disturbo. Ho solo l\'abitudine di guardare.'],['Il recinto è grigio, ora. Mi sembra quasi più bello.','Ti vedo lavorare ogni mattina. Mi ricordi tuo nonno, prima.'],['Siediti un momento con me, {n}. A volte il silenzio è meglio in due.','Ho sbagliato tante cose. Tu mi aiuti a non sbagliarne altre.'],['Se ti dicessi che sei la cosa più vicina a un figlio che ho avuto, rideresti?','Quando sarò sotto terra, prendi tu le chiavi del Consiglio. Non discutere.']],
 agatha:[['Ciao, tesoro! Semi? Chiacchiere? Ho entrambi.','Hai l\'aria stanca. Mangia, tesoro.'],['Sai che sei l\'unico che mi ascolta fino alla fine? Gli altri scappano.','Ti ho tenuto da parte i semi più belli. Non dirlo a nessuno.'],['Tuo nonno mi portava i fiori di campo, il martedì. Tu hai le sue stesse mani.','Quando chiudo la bottega, la sera, penso che questa Valle adesso è casa davvero.'],['Se avessi avuto un nipote, tesoro, l\'avrei voluto proprio come te.','Ti lascerò la ricetta della mia torta. Quella vera. Quando sarà ora.']],
 lucius:[['Pace a te, {n}.','La campana suona ancora. Ormai è solo musica.'],['Mi aiuteresti, un giorno, a pulire le panche? Si parla meglio lavorando.','Conto ancora, la sera. Ma adesso conto le stelle.'],['Ho scritto il tuo nome nel libro della cappella. Tra i vivi. In alto.','Mi hai restituito il sonno, {figliolo|figliola}. Non sai cosa vuol dire.'],['Se dovessi confessarmi, lo farei con te. Non con un prete. Con te.','Quando morirò, suona tu la campana. Una volta sola. Basta.']],
 clara:[['{n}! Ciao! Hai visto che bel cielo?','Ho fatto il pane. Ne vuoi un pezzo?'],['Mi racconti ancora com\'è fuori? Le luci, le strade…','Con te mi sembra di poter fare qualunque cosa.'],['Papà dice che sei la persona più coraggiosa che abbia mai conosciuto. Io lo sapevo già.','Ho iniziato un diario. Ci sei dentro in quasi ogni pagina.'],['Se un giorno me ne andassi dalla Valle, vorrei farlo con te. E se restassi, pure.','Sei il mio posto sicuro, {n}. Più del recinto, più di tutto.']],
 brom:[['Mh.','Lavora. Il lavoro aiuta.'],['Mh. L\'accetta tienila affilata. Te la sistemo io, se vuoi.','Hai fatto un bel lavoro nei campi. Mh. Davvero.'],['Mia moglie… non te ne ho mai parlato. Un giorno, forse.','Ho fatto una cosa per te. Non chiedere. Arriverà.'],['Mh. Sei come uno di famiglia, ormai. Non lo ripeto.','Quando ho paura, adesso, penso a te che zappi. Passa.']],
 tobia:[['Hihi! Ciao!','Le galline mi rincorrono. O io rincorro loro?'],['Sei mio amico? Hihi. Lo sapevo.','Ti ho nascosto un tesoro! Scherzo. Forse.'],['Prima facevo paura alla gente, col costume. Adesso faccio ridere. È meglio.','Quando sono triste, conto fino a otto. Poi mi ricordo che otto non è più un numero brutto.'],['Sei il mio migliore amico di tutta la Valle. Di tutto il mondo. Hihi.','Ti voglio bene, {n}. Senza indovinelli.']],
 ottavio:[['Posta! Niente per te, oggi.','Che strada, per arrivare qui.'],['Sai, ho cominciato a dire ai colleghi che c\'è un posto dove il tempo è gentile.','Ti porto i giornali, se vuoi. Le notizie di fuori fanno ridere, viste da qui.'],['Ho chiesto il trasferimento fisso su questo giro. Me l\'hanno dato. Non ho detto perché.','Un giorno porto mia figlia a conoscerti. Le piaceranno le tue bestie.'],['Se un giorno ti manca il mondo di fuori, scrivimi. Te lo porto io, un pezzo per volta.','Sei la ragione per cui faccio ancora questo lavoro.']],
 irene:[['Non muoverti. …Fatto. Scusa, deformazione professionale.','La luce qui ha qualcosa di sbagliato. Di bello e sbagliato.'],['Ti mostro le foto, un giorno. Ce n\'è una in cui ridi. È la mia preferita.','Il libro sulla Valle non lo pubblicherò. Certe cose vanno lasciate stare.'],['La figura con il mantello giallo, nelle foto: non c\'è più. Da quando ci sei tu.','Restare qui mi fa paura. Andarmene, di più.'],['Ti ho fotografato dormire sulla panchina. Non ti arrabbiare. Era troppo vero.','Se un giorno farò una mostra, ci sarai solo tu e la Valle.']],
};
const tierOf=id=>{const h=hearts(id);return h>=9?3:h>=6?2:h>=3?1:0};
function freeTalkLine(id){const st=G.st,T=FREE_T[id],L=[...(T?T.slice(0,tierOf(id)+1).flat():FREE_L[id]||['…'])];const s=seasonOf();if(FREE_SEASON[s])L.push(FREE_SEASON[s]);
 if(id==='agatha'&&st.demand)L.push('Oggi pago bene: '+PL[st.demand]+', tesoro.');if(isBday(id))return ['Oggi è il mio compleanno! Te ne sei ricordato?','È il mio compleanno, {n}. Non dirlo a nessuno. Anzi, dillo a tutti.'][st.day%2];
 st.talkN=st.talkN||{};const k=st.talkN[id]=(st.talkN[id]||0)+1;return L[(st.day*7+k*5)%L.length]}

// ---------- confidenze: si sbloccano con i cuori (2, 4, 6, 8, 10) ----------
const FREE_SECRETS={
 ezekiel:[[2,'Non ho mai voluto essere l\'Anziano. Mio padre mi mise in mano il Registro a diciannove anni. Non l\'ho più posato.'],[4,'Ogni anno, il giorno dopo la Festa, andavo a piangere nel fienile rosso. L\'unico posto dove l\'Albero non guardava.'],[6,'Il primo forestiero che ho visto contare aveva la tua età. Si chiamava Josiah. Ho ancora il suo cappello.'],[8,'Ho tenuto una lettera di tuo nonno per cinquant\'anni, senza mai aprirla. L\'ho aperta ieri. Diceva solo: «Prenditi cura di loro.»'],[10,'Se stanotte morissi, sarei in pace. È la prima volta in tutta la vita che posso dirlo.']],
 agatha:[[2,'Ho sessantun anni e non sono mai uscita dalla Valle. Ma ho letto tutti i libri che i forestieri si portavano dietro. Tutti.'],[4,'Le iniziali sull\'albero, vicino al fiume. Le ho incise io. Lui ha solo tenuto il coltello.'],[6,'Tuo nonno mi chiese di andare via con lui, una volta. Gli dissi di no. Ogni giorno, da allora, ho detto sì nella mia testa.'],[8,'Il registro della bottega: segnavo chi comprava semi di zucca, per Ezekiel. Ho smesso il giorno che sei arrivato. Non gliel\'ho mai detto.'],[10,'Ho messo da parte un barattolo di monete per te. Non contarle. Usale per andare a vedere il mare, un giorno.']],
 lucius:[[2,'Ogni sera contavo sette e dicevo otto. Così, se l\'Albero ascoltava, avrebbe pensato di essere già sazio. Non ha mai funzionato.'],[4,'Il Senza Volto si sedeva sempre sulla stessa panca. Quella che lascio vuota anche adesso. Per rispetto.'],[6,'Ho un fratello, fuori. Non so se è vivo. Gli scrivo una lettera ogni Natale e la brucio nel camino.'],[8,'La campana la suono a mano perché il meccanismo l\'ho rotto io. Apposta. Per avere qualcosa da fare con le mani, la notte.'],[10,'Ho chiesto a Ottavio di cercare mio fratello. L\'ha trovato. Mi ha scritto. Ho pianto come un bambino, {n}.']],
 clara:[[2,'Il mantello giallo lo tengo ancora nell\'armadio. Non lo metto. Ma non riesco a buttarlo.'],[4,'Papà parla poco. A volte, di notte, lo sento contare. Poi si ferma, e ride piano.'],[6,'Ho un nastro rosso cucito dentro la manica. Il tuo, quello che hai legato al nonno, l\'ho ritrovato tra la cenere.'],[8,'Ho scritto una lettera a una scuola di fuori. Mi hanno risposto. Non ho ancora deciso. Volevo dirlo prima a te.'],[10,'Quando hai aperto quella porta, la prima sera, ho pensato: questo forestiero ci salverà o ci farà morire. Hai fatto la prima. Grazie.']],
 brom:[[2,'I ferri di cavallo li ho fusi tutti. Ne ho fatto una campanella per il pollaio di Agatha.'],[4,'Mia moglie era una forestiera. Contata nel quarantotto. Io ho forgiato il primo ferro quella notte.'],[6,'Ho ancora il martello di lei. Lo uso solo per le cose belle. Ho usato quello per la tua casa.'],[8,'Una notte sono andato fino all\'Albero, da solo, con un\'ascia. Sono tornato indietro a metà strada. Tu ci sei arrivato. Ti invidio. Ti ammiro.'],[10,'Mh. Ti ho fatto un anello di ferro. Non è un anello di fidanzamento. È… mh. È per dire che sei di casa.']],
 tobia:[[2,'Hihi. Il costume del Cavaliere l\'ho bruciato. Ma i trampoli li ho tenuti. Ci arrivo alle mele più alte!'],[4,'Io non sono semplice. Faccio finta. Se fai finta di essere semplice, la gente ti dice la verità.'],[6,'Gli indovinelli li inventava mia mamma. Era forestiera anche lei. Mi ha insegnato a dire le cose vere senza farmi punire.'],[8,'So leggere. Benissimo. Ho letto il Registro tutto quanto, da piccolo. Sapevo il tuo nome prima che arrivassi.'],[10,'Adesso non ho più bisogno di indovinelli, {n}. Con te parlo dritto. È bellissimo. Hihi.']],
 ottavio:[[2,'Sulla mappa delle Poste, la Valle non c\'è. Ci arrivo seguendo il fiume. Il primo giorno pensavo di essermi perso.'],[4,'In città nessuno ha mai sentito parlare di Hollowmere. Ma il terreno risulta di proprietà di una fondazione. Si chiama «Marlowe».'],[6,'La fondazione Marlowe l\'ha creata tuo nonno, nel 1971. Con i soldi di una vincita al lotto. Comprò la Valle per proteggerla, non per chiuderla.'],[8,'C\'è un avvocato, in città, che amministra la fondazione. Mi ha chiesto di te. Gli ho detto che stai bene. Ha detto: «Allora il testamento può aspettare.»'],[10,'Il testamento di Elias dice che la Valle va a chi la rende libera. Credo che parli di te, amico.']],
 irene:[[2,'Ho iniziato a fotografare valli abbandonate dopo che mia sorella è sparita. In una valle. Non questa. Credo.'],[4,'In una delle mie foto vecchie, di dieci anni fa, c\'è un uomo con un mantello giallo. Davanti a una casa con il tetto viola. La tua.'],[6,'Mia sorella si chiamava Mercy. Sulle lapidi del bosco c\'è scritto MERCY HALE. Il cognome è il nostro.'],[8,'Sono andata al bosco, da sola. La lapide di Mercy era coperta di fiori freschi. Gialli. Qualcuno, qui, la ricordava.'],[10,'Resto. Ho deciso. Mi sono presa la casa vuota vicino alla cappella. Mercy è qui, in qualche modo. E ci sei tu.']],
};
async function freeSecret(n){const st=G.st,F=st.flags,L=FREE_SECRETS[n.id];if(!L||!F.met[n.id]&&!OUT_L[n.id])return false;if(st.free.secretDay===st.day)return false;
 for(const [h,t] of L){const k='fsec_'+n.id+h;if(F[k]||hearts(n.id)<h)continue;F[k]=1;st.free.secretDay=st.day;
  await say(n.id,h>=6?'Vieni più vicino, {n}. Questa non l\'ho mai detta a nessuno.':'Posso dirti una cosa? A te sì.');await say(n.id,t,h>=8?'sad':'');UI.toast(`Una confidenza di ${NAMES[n.id]} è nel diario (Lore).`);return true}
 return false}
function freeSecretsLore(){const st=G.st,F=st.flags;if(!isFree(st))return '';let got=0,tot=0;const E=[];for(const id in FREE_SECRETS)for(const [h,t] of FREE_SECRETS[id]){tot++;if(F['fsec_'+id+h]){got++;E.push(`<p class="small"><b>${esc(NAMES[id])} (${h}♥):</b> ${esc(fmt(t))}</p>`)}}
 return `<h3>Confidenze della Valle libera (${got}/${tot})</h3>`+(E.join('')||'<p class="small">Con l\'amicizia, gli abitanti ti racconteranno quello che non hanno mai detto.</p>')}

// ---------- il taccuino degli abitanti ----------
function friendsHTML(){const st=G.st,K=st.free.known||{};const list=FRIENDS.filter(id=>st.flags.met[id]||(OUT_L[id]&&outsiderHere(id,st)));
 return `<p class="small">Un regalo al giorno per persona. Al compleanno vale il doppio. Quello che scopri finisce qui.</p>`+list.map(id=>{const h=hearts(id),kn=K[id]||{},by=t=>Object.keys(kn).filter(k=>kn[k]===t).map(k=>ITEMS[k]?ITEMS[k].n:k),n=NPC(id);
  const line=(lab,arr,col)=>arr.length?`<br><span style="color:${col}">${lab}:</span> ${esc(arr.join(', '))}`:'';
  return `<div class="mrow"><canvas data-p="${id}" width="64" height="64" style="width:calc(26*var(--u));height:calc(26*var(--u))"></canvas><span><b>${NAMES[id]}</b>${isBday(id)?' 🎂 <b>oggi compie gli anni!</b>':''}<br><span class="hearts">${'♥'.repeat(h)}${'♡'.repeat(Math.max(0,10-h))}</span><span class="small"><br>Compleanno: ${bdayLabel(id)}${st.gifted[id]?' · regalo di oggi fatto':''}${line('Ama',by(3),'#a8301a')}${line('Piace',by(2),'#7a5a1a')}${line('Gradisce',by(1),'#5a6a3a')}${line('Detesta',by(-1),'#4a4a5a')}${Object.keys(kn).length?'':'<br>Gusti: ancora da scoprire.'}</span></span></div>`}).join('')}
function bdayMorning(st){if(!isFree(st))return;for(const id of FRIENDS)if(isBday(id,st)&&(st.flags.met[id]||OUT_L[id]))setTimeout(()=>UI.toast(`🎂 Oggi è il compleanno di ${NAMES[id]}. Un regalo vale il doppio.`),1800)}

// ---------- vestiti di stagione ----------
const LOOK_BASE={};
const SEASON_LOOK={
 1:{ezekiel:{cape:'#2a2530',capeLen:12},agatha:{cape:'#7a4a5a',capeLen:12,shirt:'#6a4a6a'},lucius:{cape:'#3a3a42',capeLen:12},clara:{cape:'#a8402a',capeLen:14,shirt:'#e8d8c0'},brom:{cape:'#5a4a3a',capeLen:9,hat:'cap',hatCol:'#3a2a1a',rolled:0},tobia:{cape:'#5a7a3a',capeLen:9,hatCol:'#7a2a1a'},
  ottavio:{cape:'#2a3a5a',capeLen:10},irene:{cape:'#3a3a3a',capeLen:12},mercante:{},player:{cape:'#6a3a24',capeLen:10}},
 2:{agatha:{shirt:'#b88ab0',cape:'#e8d8f0',capeLen:6},clara:{cape:null,shirt:'#f4ecd8',dress:'#6a9a5a'},tobia:{shirt:'#8ab85a',hatCol:'#6a9a4a'},brom:{shirt:'#a88a6a'},lucius:{shirt:'#6a6a72'},player:{}},
 3:{ezekiel:{robe:'#3a3440',hat:'cap',hatCol:'#d8b860'},agatha:{cape:null,shirt:'#c8a0c0',hatCol:'#f4ecd8'},clara:{cape:null,shirt:'#f8f2e4',dress:'#d8a84a'},brom:{shirt:'#d8c8a8',rolled:1,hat:'cap',hatCol:'#d8b860'},tobia:{shirt:'#e8d06a',hatCol:'#d8b860'},lucius:{shirt:'#7a7a82'},ottavio:{shirt:'#6a8ac8'},irene:{shirt:'#e8e0d0',dress:'#c8a080'},player:{hat:'cap',hatCol:'#d8b860'}},
};
let LOOK_SEASON=-1;
function applySeasonLooks(){const st=G.st;if(!st)return;const s=isFree(st)?seasonOf(st):0,key=s+'|'+(st.g||'m');if(LOOK_SEASON===key)return;LOOK_SEASON=key;
 const ids=Object.keys(LOOKS).filter(k=>!k.startsWith('mp_')&&k!=='prey');
 for(const id of ids){if(id==='player')continue;if(!LOOK_BASE[id])LOOK_BASE[id]=Object.assign({},LOOKS[id]);const o=(SEASON_LOOK[s]||{})[id]||{};LOOKS[id]=Object.assign({},LOOK_BASE[id],o);LOOKS[id]._R=null;delete LOOKS[id]._R;delete SHEET[id]}
 LOOKS.player=Object.assign({},PLAYER_LOOKS[st.g==='f'?'f':'m'],(SEASON_LOOK[s]||{}).player||{});delete SHEET.player;
 for(const k in PORT)delete PORT[k]}

// ---------- la Valle di stagione: fiori, foglie, neve sui tetti ----------
const SNOWC=new Map();
function snowy(img){if(SNOWC.has(img))return SNOWC.get(img);const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.s=img.s;if(img.canopyH)c.canopyH=img.canopyH;if(img.lights)c.lights=img.lights;
 const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';const g=x.createLinearGradient(0,0,0,c.height*.45);g.addColorStop(0,'rgba(244,248,255,.92)');g.addColorStop(.5,'rgba(236,242,252,.55)');g.addColorStop(1,'rgba(236,242,252,0)');x.fillStyle=g;x.fillRect(0,0,c.width,c.height*.45);
 srand(c.width*7+c.height);x.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<c.width/3;i++)x.fillRect(ri(0,c.width),ri(0,Math.floor(c.height*.3)),2,1);x.globalCompositeOperation='source-over';SNOWC.set(img,c);return c}
function seasonDecor(m,st){if(m.id!=='main'||!isFree(st))return;const s=seasonOf(st);
 for(const o of m.objs.slice()){if(o.kind==='pumpkin'&&s!==0)mapRemove(m,o);else if(o.kind==='sunflower'&&(s===1||s===2))mapRemove(m,o);else if(s===1&&(o.kind==='bld'||o.kind==='pine'||o.kind==='bench'||o.kind==='well'||o.kind==='stall'))o.img=snowy(o.img)}
 if(s===2||s===3){srand(9000+s);const cols=s===2?['#f0a8c8','#f8f0a0','#c8b8f8','#ffffff']:['#f0d040','#e86a3a','#f8f8f0','#d84a8a'];
  for(let i=0;i<140;i++){const x=ri(4,59),y=ri(5,41),g=m.get(x,y);if(!(g===1||g===12)||m.hit[fkey(x,y)]||st.farm[fkey(x,y)])continue;m.add({kind:'flower',tx:x,ty:y,img:null,col:cols[i%cols.length],ox:ri(2,13),oy:ri(3,13),dx:x*16,dy:y*16,sy:y*16+8,solid:[],hits:[],deco:1})}}}
function drawFlowers(m,cx,cy){if(m.id!=='main'||!isFree())return;for(const o of m.objs){if(o.kind!=='flower')continue;const X=o.dx+o.ox,Y=o.dy+o.oy;if(X<cx-4||X>cx+W+4||Y<cy-4||Y>cy+H+4)continue;ctx.fillStyle='#3a6a2a';ctx.fillRect(X,Y+1,1,2);ctx.fillStyle=o.col;ctx.fillRect(X-1,Y,3,1);ctx.fillRect(X,Y-1,1,3);ctx.fillStyle='#f8e070';ctx.fillRect(X,Y,1,1)}}
// foglie che cadono in autunno, petali in primavera, niente d'estate e d'inverno
const leafSeason=()=>!isFree()||[0,2].includes(seasonOf());
const leafCol=()=>isFree()&&seasonOf()===2?['#f8c8d8','#fff0f4','#f0a8c8','#f8e8f0'][Math.random()*4|0]:['#d9822b','#e2b23b','#c96a2a','#a07e2e'][Math.random()*4|0];
// richieste di favori nel gioco libero (senza Festa né Conteggio)
const FAV_ASK_FREE={
 ezekiel:['Mi servirebbero {it}, {n}. Per la cena del Consiglio. Ti do {r} scudi.','Il Consiglio si riunisce stasera. Porteresti {it}? {r} scudi.'],
 agatha:['Tesoro, in bottega mi mancano {it}. Me le porti? Ti do {r} scudi.','Ho un cliente di fuori che vuole {it}! Pago {r} scudi.'],
 lucius:['Per la mensa dei poveri — sì, anche qui ce ne sono — servono {it}. {r} scudi, e la mia gratitudine.','Mi porteresti {it}? Le metto sull\'altare, come ringraziamento. {r} scudi.'],
 clara:['Mi aiuti? Voglio provare una ricetta nuova e mi servono {it}. Ti do {r} scudi!','Se hai {it}, me le porti? Ti ripago: {r} scudi. Promesso!'],
 brom:['Mh. {it}. Per la cena. {r} scudi.','Portami {it}. Ho fame e non ho tempo. {r} scudi.'],
};
