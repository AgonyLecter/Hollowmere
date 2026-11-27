'use strict';
// ================= ENGLISH — 1: title, menus, interface, prologue, chapters =================
// Chiave: la frase italiana com'è nel codice ({0}, {1}… sono i pezzi variabili, nello stesso ordine o spostati).
// Le forme {maschile|femminile} e {n} (il nome) restano: le risolve fmt() dopo la traduzione.
// Glossario: Hollowmere · la Valle = the Valley · scudi = crowns · il Cavaliere = the Rider ·
// il Conteggio = the Counting · il Varco = the Gap · la Festa del Raccolto = the Harvest Festival ·
// i Contati = the Counted · il recinto giallo = the yellow fence · la campana della sera = the evening bell.
Object.assign(TRAD.en, {
  // ---------- monete e parole che entrano nelle frasi ----------
  '{0} scudi': '{0} crowns',
  '{0} scudo': '{0} crown',
  forestiero: 'stranger',
  forestiera: 'stranger',

  // ---------- la pagina, il titolo ----------
  'Hollowmere — La Valle Quieta': 'Hollowmere — The Quiet Valley',
  Obiettivo: 'Goal',
  'La Valle Quieta': 'The Quiet Valley',
  'La Valle Affamata': 'The Hungry Valley',
  'Nuova partita': 'New game',
  Continua: 'Continue',
  '🔒 La Valle · multiplayer': '🔒 The Valley · multiplayer',
  'La Valle · multiplayer': 'The Valley · multiplayer',
  'Altri finali': 'Other endings',
  'Carica da codice': 'Load from code',
  Opzioni: 'Options',
  'Schermo intero': 'Fullscreen',
  'Connessione alla Valle…': 'Reaching the Valley…',
  'la valle si sveglia…': 'the valley is waking…',
  'Ruota il telefono in orizzontale': 'Turn your phone sideways',
  'La Valle ti aspetta.': 'The Valley is waiting for you.',
  "Chi c'è (U)": "Who's here (U)",
  'Scrivi (T)': 'Write (T)',
  'Menu (Esc)': 'Menu (Esc)',
  'Schermo intero non disponibile qui': 'Fullscreen is not available here',
  '● La Valle è in ascolto (online)': '● The Valley is listening (online)',
  '○ Modalità offline · salvataggi su questo dispositivo': '○ Offline mode · saves stay on this device',
  'Nuovi arrivati a Hollowmere: {0}': 'New arrivals in Hollowmere: {0}',
  'The English translation is in progress: some texts are still in Italian.':
    'The English translation is in progress: some texts are still in Italian.',
  // il caricamento
  'si accendono le candele': 'the candles are lit',
  'si accendono le case': 'the houses light up',
  'la Valle si stende tra i colli': 'the Valley stretches between the hills',
  'le bestie aprono gli occhi': 'the animals open their eyes',
  'la bacheca si riempie': 'the notice board fills up',
  'i muri si raddrizzano': 'the walls straighten',
  "l'orto apre le foglie": 'the garden opens its leaves',
  'il forno si scalda': 'the oven warms up',
  'si appendono le ghirlande': 'the garlands go up',
  'le macchine sbuffano': 'the machines start puffing',
  'il mercante conta le monete': 'the merchant counts his coins',
  'scende la nebbia': 'the fog comes down',
  'si dipingono le ombre': 'the shadows are painted',

  // ---------- calendario ----------
  Lun: 'Mon',
  Mar: 'Tue',
  Mer: 'Wed',
  Gio: 'Thu',
  Ven: 'Fri',
  Sab: 'Sat',
  Dom: 'Sun',
  Autunno: 'Autumn',
  Inverno: 'Winter',
  Primavera: 'Spring',
  Estate: 'Summer',
  '· anno': '· year',
  '· Autunno': '· Autumn',
  '{0} · giorno {1}': '{0} · day {1}',
  '{0} · Giorno {1}': '{0} · Day {1}',
  'Giorno {0}': 'Day {0}',
  'Giorno 1 · Autunno': 'Day 1 · Autumn',

  // ---------- cosa fa il tasto A (davanti a te) ----------
  'Cip cip cip!': 'Cheep cheep cheep!',
  Entra: 'Enter',
  'Dormi / Riposa': 'Sleep / Rest',
  Siediti: 'Sit',
  Apri: 'Open',
  Bacheca: 'Notice board',
  Vendi: 'Sell',
  Compra: 'Buy',
  Pozzo: 'Well',
  Ceppo: 'Stump',
  Tomba: 'Grave',
  Leggi: 'Read',
  Spazza: 'Sweep',
  Campana: 'Bell',
  Raccogli: 'Harvest',
  Esamina: 'Examine',
  Bacche: 'Berries',
  'Il Varco': 'The Gap',
  Ponte: 'Bridge',
  Guarda: 'Look',
  Scaldati: 'Warm up',
  Altare: 'Altar',
  Lanterna: 'Lantern',
  Libri: 'Books',
  Tavolo: 'Table',
  Incudine: 'Anvil',
  Parla: 'Talk',
  Presentati: 'Introduce yourself',
  Accarezza: 'Pet',
  Gallina: 'Hen',
  Dipingi: 'Paint',
  Cassetta: 'Shipping box',
  Esci: 'Exit',
  Usa: 'Use',
  Casa: 'Home',
  Cappella: 'Chapel',
  Fienile: 'Barn',
  'matura!': 'ripe!',

  // ---------- abitanti ----------
  'Anziano Ezekiel': 'Elder Ezekiel',
  'Fratello Lucius': 'Brother Lucius',
  'Voce dietro la porta': 'Voice behind the door',
  Cocchiere: 'Coachman',

  // ---------- aggiornamenti e chat ----------
  'Nuova versione della Valle: aggiorno il gioco…': 'A new version of the Valley: updating the game…',
  'Gioco aggiornato. Sei dove eri.': "Game updated. You're right where you were.",
  '👋 Ciao!': '👋 Hi!',
  'Vieni a vedere!': 'Come and see!',
  'Grazie!': 'Thanks!',
  'Bel villaggio!': 'Lovely village!',
  'Ci vediamo!': 'See you!',
  "La chat c'è quando sei online nella Valle.": 'Chat works when you are online in the Valley.',
  Chat: 'Chat',
  Invia: 'Send',
  '· qui con te: {0}': '· here with you: {0}',
  'Nessun messaggio. Saluta chi passa!': 'No messages. Say hi to whoever passes by!',
  'Chat (T)': 'Chat (T)',

  // ---------- menu iniziale ----------
  'Nessun salvataggio trovato.': 'No save found.',
  'Serve la connessione alla Valle (online).': 'You need to be connected to the Valley (online).',
  'Cerco nella Valle…': 'Searching the Valley…',
  'Nessuna anima con questo codice.': 'No soul goes by that code.',
  "Chiave sbagliata: continui con un codice nuovo. Il salvataggio originale resta com'era.":
    'Wrong key: you continue with a new code. The original save stays as it was.',
  "Senza chiave di recupero continui con un codice nuovo. Il salvataggio originale resta com'era.":
    'Without the recovery key you continue with a new code. The original save stays as it was.',
  Musica: 'Music',
  Effetti: 'Sound effects',
  'Su telefono: gira in orizzontale e usa "Schermo intero". Muoviti trascinando il pollice a sinistra, A per agire.':
    'On a phone: turn it sideways and use "Fullscreen". Move by dragging your left thumb, A to act.',
  'Su PC: WASD/frecce, E o Spazio per agire, 1–0 per gli oggetti, Esc per il menu.':
    'On PC: WASD/arrows, E or Space to act, 1–0 for items, Esc for the menu.',
  'La Valle': 'The Valley',
  'Dopo la storia, Hollowmere diventa un mondo da vivere insieme agli altri giocatori: stagioni, feste, il tuo villaggio, le visite, il mercato dei materiali rari.':
    'After the story, Hollowmere becomes a world to live in with other players: seasons, festivals, your own village, visits, the market for rare materials.',
  '🔒 Si apre quando finisci la storia': '🔒 Opens once you finish the story',
  ', con uno qualsiasi dei tre finali.': ', with any of the three endings.',
  'Finisci la storia per aprire la Valle.': 'Finish the story to open the Valley.',
  'Dal primo bivio — Capitolo II': 'From the first crossroads — Chapter II',
  'Il nastro rosso, le pagine del nonno, il fienile: da qui le scelte cambiano il finale.':
    "The red ribbon, Grandpa's pages, the barn: from here on, your choices change the ending.",
  'Dal Capitolo III': 'From Chapter III',
  'Clara, Tobia, il bosco. Le amicizie decidono chi ti aiuta alla Festa.':
    'Clara, Tobia, the woods. Your friendships decide who helps you at the Festival.',
  'Dalla Festa del Raccolto': 'From the Harvest Festival',
  'Il giorno della Festa: il sidro, il Conteggio, la fuga o il patto.':
    'The day of the Festival: the cider, the Counting, the escape or the pact.',
  'La Fuga: arriva alla Festa con Clara alleata e scappa al Varco.':
    'The Escape: reach the Festival with Clara on your side and run for the Gap.',
  "L'Erede: lasciati contare, o fatti prendere.": 'The Heir: let them count you, or let yourself be taken.',
  'Spezzare il patto: tieni il nastro rosso, leggi tutto, fatti amici Clara e Tobia.':
    'Breaking the pact: keep the red ribbon, read everything, befriend Clara and Tobia.',
  'Finali scoperti: {0}/3.': 'Endings found: {0}/3.',
  'Ancora da scoprire —': 'Still to discover —',
  Riparti: 'Start from here',
  'Nessun punto di ripartenza salvato su questo dispositivo.': 'No restart point saved on this device.',
  'La partita della Valle non viene toccata: ha un salvataggio a parte.':
    'Your Valley game is not touched: it has its own save.',
  'Bentornat{o|a}, {0}. Giorno {1}.': 'Welcome back, {0}. Day {1}.',
  'La Fuga — sei scappat{o|a} dal Varco': 'The Escape — you ran through the Gap',
  "L'Erede — sei diventat{o|a} il Cavaliere": 'The Heir — you became the Rider',
  'Spezzare il patto — il debito è chiuso': 'Breaking the pact — the debt is paid',
  'Hai già finito la storia': 'You already finished the story',
  "Hai giocato il finale con una versione precedente di Hollowmere, che non lo segnava. Con quale finale l'hai chiusa? La Valle comincia da lì.":
    "You played the ending on an older version of Hollowmere, which didn't record it. Which ending did you reach? The Valley starts from there.",
  'Se non te lo ricordi, scegli «Spezzare il patto».': "If you don't remember, choose «Breaking the pact».",
  'Chi sei?': 'Who are you?',
  'Il notaio ha scritto il tuo nome sulla lettera del nonno. Con la stessa calligrafia, qualcuno lo scriverà anche altrove.':
    "The notary wrote your name on Grandpa's letter. In the same handwriting, someone will write it somewhere else too.",
  Ragazzo: 'Boy',
  Ragazza: 'Girl',
  Indietro: 'Back',
  Inizia: 'Begin',
  'Inserisci il codice che trovi nel menu di gioco (Salvataggio).':
    'Enter the code from the in-game menu (Save).',
  'Chiave di recupero (nel menu Salvataggio del vecchio dispositivo):':
    'Recovery key (in the Save menu on your old device):',
  Carica: 'Load',
  "{Caro|Cara} {0},\n\nse leggi queste righe, il tuo vecchio nonno Elias se n'è andato.\n\nTi lascio la fattoria di Hollowmere, nella Valle Quieta. È un posto tranquillo: la gente è gentile, l'aria profuma di mele e le zucche crescono grandi come carrozze.\n\nVai a viverci. Coltiva. Sii felice.\n\nAh, e una cosa sola: rispetta le loro regole. Tutte.\n\nCon affetto,\nNonno Elias":
    'Dear {0},\n\nif you are reading these lines, your old grandpa Elias is gone.\n\nI leave you the farm at Hollowmere, in the Quiet Valley. It is a peaceful place: the people are kind, the air smells of apples and the pumpkins grow as big as carriages.\n\nGo and live there. Grow things. Be happy.\n\nOh, and just one thing: respect their rules. All of them.\n\nWith love,\nGrandpa Elias',
  'Parti per Hollowmere': 'Leave for Hollowmere',
  'non venire': "don't come",
  '— tocca per continuare —': '— tap to continue —',

  // ---------- prologo ----------
  Prologo: 'Prologue',
  'Scendi con la valigia. Il cocchiere ha già girato i cavalli, prima ancora che tu toccassi terra.':
    'You step down with your suitcase. The coachman has already turned the horses before your feet touch the ground.',
  '«Più in là non vado, {signore|signora}. Nessuno ci va.»':
    "«I won't go any further, {sir|ma'am}. Nobody does.»",
  '«Se fossi in voi, risalirei. Riparto adesso. Non torno.»':
    "«If I were you, I'd climb back in. I'm leaving now. I'm not coming back.»",
  Resto: "I'm staying",
  'Perché nessuno ci va?': "Why doesn't anybody go?",
  '«Perché quelli che ci vanno, poi, non scrivono più. Tranne uno. E guardate dove ha mandato voi.»':
    '«Because the ones who go never write again. All but one. And look where he sent you.»',
  '«Che Dio… no. Che vi vada bene, ecco.»': "«God be… no. Good luck to you, that's all.»",
  'Il rumore delle ruote si allontana. Poi più niente. Nemmeno gli uccelli.':
    'The sound of the wheels fades. Then nothing at all. Not even the birds.',
  "Benvenut{o|a} a Hollowmere, {n}. Io sono Ezekiel Thorne, l'Anziano. Ti aspettavamo.":
    'Welcome to Hollowmere, {n}. I am Ezekiel Thorne, the Elder. We have been expecting you.',
  'Ciao! Benvenut{o|a}! Hai fatto buon viaggio? Sei stanc{o|a}? Hai fame?':
    'Hi! Welcome! Did you have a good trip? Are you tired? Are you hungry?',
  'Clara. Lascial{o|a} respirare.': '{Clara. Let him breathe.|Clara. Let her breathe.}',
  'Prima di entrare nella Valle devi conoscere le Regole. Sono tre. Sono semplici.':
    'Before you enter the Valley you must know the Rules. There are three. They are simple.',
  'Le Regole di Hollowmere': 'The Rules of Hollowmere',
  'Il rosso è il colore cattivo. Non raccoglierlo, non indossarlo.':
    'Red is the bad colour. Do not pick it up, do not wear it.',
  'Seppelliscilo.': 'Bury it.',
  'Non oltrepassare mai il recinto giallo.': 'Never cross the yellow fence.',
  'Quando suona la campana della sera, rientra in casa.': 'When the evening bell rings, go back inside.',
  'E non aprire a nessuno.': 'And open the door to no one.',
  'Ho capito': 'I understand',
  'Rispettale, e Hollowmere sarà casa tua. Per sempre.':
    'Respect them, and Hollowmere will be your home. Forever.',
  'Perché il rosso?': 'Why red?',
  "Cosa c'è nel bosco?": "What's in the woods?",
  'Va bene.': 'All right.',
  'Perché è il colore cattivo. Non serve altro.': 'Because it is the bad colour. Nothing more is needed.',
  'Niente. E quel niente non va disturbato.': 'Nothing. And that nothing must not be disturbed.',
  '{Bravo ragazzo|Brava ragazza}. Proprio come tuo nonno.':
    '{Good boy|Good girl}. Just like your grandfather.',
  "Ti accompagniamo alla fattoria! È bellissima, vedrai. Un po' polverosa. Il nonno non… insomma. Andiamo!":
    "We'll walk you to the farm! It's beautiful, you'll see. A little dusty. Your grandpa didn't… well. Let's go!",

  // ---------- capitoli ----------
  'Capitolo I': 'Chapter I',
  'Il Recinto Giallo': 'The Yellow Fence',
  'La casa del nonno. Odora di legno, lavanda e di qualcosa di chiuso da tanto tempo.':
    "Grandpa's house. It smells of wood, lavender and something shut away for a long time.",
  'Fuori ti aspettano i campi. E il villaggio. Esci dalla porta in basso. (Muoviti con WASD o il pollice sinistro. E / Spazio / A per agire.)':
    'Outside, the fields are waiting. And the village. Leave by the door at the bottom. (Move with WASD or your left thumb. E / Space / A to act.)',
  'Stanotte qualcosa ha grattato la porta per ore.': 'Last night something scratched at the door for hours.',
  "Sul legno, all'esterno, lettere incise a unghiate: AVEVI DIMENTICATO.":
    'On the outside of the wood, letters carved by claws: YOU HAD FORGOTTEN.',
  'Capitolo II': 'Chapter II',
  'Quelli di cui non si parla': 'The Ones We Do Not Speak Of',
  'Ti svegli. La casa è silenziosa. Qualcosa è cambiato, ma non sai dire cosa.':
    "You wake up. The house is silent. Something has changed, but you can't say what.",
  'Capitolo III': 'Chapter III',
  "L'Albero dei Morti": 'The Tree of the Dead',
  'Nessuno parla della notte. Dalla finestra, il villaggio è sereno. Più sereno del solito.':
    'Nobody talks about the night. From the window, the village looks peaceful. More peaceful than usual.',
  "Sulla soglia, piegato con cura, c'è un mantello giallo. Nessun biglietto. Non serve: sai già chi l'ha lasciato. Tutti.":
    'On the doorstep, carefully folded, lies a yellow cloak. No note. None is needed: you already know who left it. Everyone.',
  'Le lanterne gialle, ha scritto il nonno, non proteggono: segnano.':
    'The yellow lanterns, Grandpa wrote, do not protect: they mark.',
  'Capitolo IV': 'Chapter IV',
  'La Festa del Raccolto': 'The Harvest Festival',
  "Le campane suonano da sole, all'alba. In piazza qualcuno canta. Nessuno, nella Valle, ha dormito.":
    'The bells ring by themselves at dawn. Someone is singing in the square. Nobody in the Valley has slept.',
  "Sul vetro della finestra, dall'esterno, c'è l'impronta di una mano. Non è piccola. Non è tua.":
    'On the window pane, from the outside, there is a handprint. It is not small. It is not yours.',
  'Oggi è il giorno della Festa. Alle sette, in piazza. Ti aspettano tutti.':
    "Today is the day of the Festival. Seven o'clock, in the square. Everyone is waiting for you.",
  'Fine del Capitolo I': 'End of Chapter I',
  'Fine del Capitolo II': 'End of Chapter II',
  'Hai rispettato le regole.': 'You followed the rules.',
  'Le regole non rispetteranno te.': 'The rules will not return the favour.',
  Fine: 'The End',
  'Hollowmere ti ha contat{o|a}.': 'Hollowmere has counted you.',
  'Il Cavaliere non perdona chi corre piano.': 'The Rider does not forgive those who run slowly.',
  'Riprova dalla porta del fienile.': 'Try again from the barn door.',

  // ---------- mattine, notti, stagioni ----------
  "{0}: troppe notti senz'acqua.": '{0}: too many nights without water.',
  'Una pianta è appassita': 'A plant has withered',
  'piante sono appassite': 'plants have withered',
  "Le piante bagnate crescono di una tacca ogni notte. Due notti all'asciutto e appassiscono: annaffiale per salvarle, o toglile con la zappa e ripianta.":
    'Watered plants grow one notch every night. Two nights dry and they wither: water them to save them, or clear them with the hoe and replant.',
  'Stanotte {0}! Mettiti davanti e premi A/E per raccogliere.':
    'Last night {0}! Stand in front and press A/E to harvest.',
  'una pianta è maturata': 'a plant ripened',
  'piante sono maturate': 'plants ripened',
  'Qualcosa è maturo nei campi! Mettiti davanti alla pianta e premi A/E per raccoglierla.':
    'Something is ripe in the fields! Stand in front of the plant and press A/E to harvest it.',
  'Stanotte {0}.': 'Last night {0}.',
  'una pianta è cresciuta': 'a plant grew',
  'piante sono cresciute': 'plants grew',
  "È arrivato l'autunno.": 'Autumn has come.',
  "È arrivato l'inverno. Cresce solo il porro.": 'Winter has come. Only leeks will grow.',
  'È arrivata la primavera!': 'Spring has come!',
  "È arrivata l'estate!": 'Summer has come!',
  '{0} al cambio di stagione.': '{0} when the season changed.',
  'Una coltura non ha retto': "A crop didn't survive",
  'colture non hanno retto': "crops didn't survive",
  'Nevica. La Valle è bianca e silenziosa.': 'It is snowing. The Valley is white and silent.',
  'Piove. I campi si annaffiano da soli.': 'It is raining. The fields water themselves.',
  'Nebbia fitta sulla Valle.': 'Thick fog over the Valley.',
  "È domenica: alle 9:00 c'è la messa, in cappella.": "It's Sunday: mass is at 9:00, in the chapel.",
  'Alcuni abitanti cercano qualcosa: guarda il "!" sopra le loro teste, o la bacheca in piazza.':
    'Some villagers are looking for something: watch for the "!" above their heads, or check the board in the square.',
  "Sul pavimento, vicino alla porta, c'è un foglio. Qualcuno l'ha fatto scivolare sotto l'uscio, stanotte.":
    'On the floor, near the door, there is a sheet of paper. Someone slipped it under the door last night.',
  '· Spedizione: +{0}': '· Shipping: +{0}',
  '{0}. Sono le {1}:{2}.': "{0}. It's {1}:{2}.",
  'Hai aspettato': 'You waited',
  'Hai riposato': 'You rested',
  'Sono le due di notte. Crolli dal sonno dove ti trovi.':
    "It's two in the morning. You collapse from exhaustion where you stand.",
  'Ti risvegli nel tuo letto. Non ricordi come ci sei arrivat{o|a}.':
    "You wake up in your bed. You don't remember how you got there.",
  'Hai le unghie piene di terra.': 'Your fingernails are full of dirt.',
  'Dentro puzza di cera, di fieno… e di stalla.': 'Inside it smells of wax, of hay… and of stable.',
  'Ma a Hollowmere non ci sono cavalli.': 'But there are no horses in Hollowmere.',

  // ---------- il Vespro e la prima notte ----------
  "Benvenut{o|a} al Vespro, {n}. Siediti dove vuoi. Qui c'è sempre posto.":
    'Welcome to Vespers, {n}. Sit wherever you like. There is always room here.',
  'Come ogni sera di raccolto, ci contiamo. Così sappiamo di esserci tutti.':
    'As on every harvest evening, we count ourselves. That way we know we are all here.',
  'E tu fai sei.': 'And you make six.',
  'E io, sette.': 'And I, seven.',
  'Hihi. Otto.': 'Hehe. Eight.',
  '…Otto.': '…Eight.',
  'Ti giri verso il fondo della cappella.': 'You turn towards the back of the chapel.',
  "Sull'ultima panca siede qualcuno. Non ha la faccia. Non ha niente, dove dovrebbe esserci una faccia.":
    'Someone is sitting on the last pew. It has no face. There is nothing where a face should be.',
  'Lucius ha sbagliato i conti. Succede, quando si invecchia.':
    'Lucius miscounted. It happens, as one gets older.',
  'Otto. Come ogni anno, a questo punto.': 'Eight. As every year, at this point.',
  'Andate a casa. Tutti. La campana suonerà presto.': 'Go home. All of you. The bell will ring soon.',
  'Fuori, zoccoli. Girano attorno alla casa.': 'Outside, hooves. Circling the house.',
  'Una volta. Due volte. Tre.': 'Once. Twice. Three times.',
  '{n}… sono io. Il nonno. Fa tanto freddo, qui fuori. Aprimi.':
    "{n}… it's me. Grandpa. It's so cold out here. Let me in.",
  'Apri la porta': 'Open the door',
  'Non aprire': "Don't open",
  "Non c'è nessuno.": 'There is no one there.',
  'Sulla soglia, quattro impronte di zoccoli bruciate nel legno. Ancora fumano.':
    'On the threshold, four hoofprints burned into the wood. Still smoking.',
  'Silenzio. Poi una risata bassa, che non è quella del nonno.':
    "Silence. Then a low laugh that is not Grandpa's.",
  'Il nonno non ha mai bussato così.': 'Grandpa never knocked like that.',
  'Da sotto la porta scivola un pezzo di carta. Una sola riga: «Uno di troppo.»':
    'A scrap of paper slides under the door. A single line: «One too many.»',
  'Sbatti la porta e ci appoggi la schiena. Il cuore ti batte in gola.':
    'You slam the door and lean your back against it. Your heart is in your throat.',
  'Gli zoccoli si fermano. Proprio davanti alla porta.': 'The hooves stop. Right outside the door.',
  'Hai letto il mio nome, vero, {n}? Elias Marlowe. Risparmiato.':
    "You read my name, didn't you, {n}? Elias Marlowe. Spared.",
  'Non avere paura. Non è colpa tua. Non è nemmeno colpa mia.':
    "Don't be afraid. It isn't your fault. It isn't even mine.",
  'Alla Festa del Raccolto saremo di nuovo insieme. Uno del mio sangue.':
    'At the Harvest Festival we will be together again. One of my blood.',
  'Il costume era vuoto.': 'The costume was empty.',
  'Il Cavaliere no.': 'The Rider was not.',

  // ---------- campane ----------
  '🔔 Mezzogiorno. Fratello Lucius suona la campana.': '🔔 Noon. Brother Lucius rings the bell.',
  '🔔 La campana delle nove. Ormai suona per abitudine.':
    "🔔 The nine o'clock bell. These days it rings out of habit.",
  '🔔 La campana della sera. Rientra a casa.': '🔔 The evening bell. Go back home.',
  "Il sole cala. È l'ora del ceppo.": 'The sun is setting. Time for the stump.',
  '🔔 La campana chiama alla messa.': '🔔 The bell calls to mass.',
  "Il lampione si è acceso da solo. Nessuno l'ha toccato.": 'The street lamp lit itself. Nobody touched it.',
  'Zoccoli. Lontani. Poi meno lontani.': 'Hooves. Far away. Then not so far.',

  // ---------- la bottega, la bacheca ----------
  'Il viaggio ti pesa addosso. Torna a casa e dormi: domani è un nuovo giorno.':
    'The journey weighs on you. Go home and sleep: tomorrow is a new day.',
  'Prima di dormire, annaffia i semi: crescono di notte.':
    'Before you sleep, water the seeds: they grow at night.',
  Chiudi: 'Close',
  'Lo porta Clara, dopo le 8:00.': 'Clara brings it, after 8:00.',
  'Sfornato da Clara stamattina. Ne restano {0}.': 'Baked by Clara this morning. {0} left.',
  'Finito per oggi.': 'Sold out for today.',
  'Matura in {0} notti{1} · vale {2}{3}{4}': 'Ripens in {0} nights{1} · worth {2}{3}{4}',
  ', poi ricresce': ', then regrows',
  'ogni {0} notti': 'every {0} nights',
  'ogni notte': 'every night',
  ', poi ricresce ogni {0} notti': ', then regrows every {0} nights',
  ', poi ricresce ogni notte': ', then regrows every night',
  'a manciata': 'per handful',
  '(a volte di più)': '(sometimes more)',
  'Emporio Crane': 'Crane General Store',
  '«Semi buoni, terra buona, gente buona.» — Hai': '«Good seeds, good soil, good people.» — You have',
  '· sconto amicizia −10%': '· friendship discount −10%',
  'Per vendere i raccolti usa la cassetta accanto a casa tua.{0} Gli scudi di Hollowmere, fuori dalla Valle, non li accetta nessuno.':
    "To sell your crops, use the shipping box next to your house.{0} Outside the Valley, nobody accepts Hollowmere's crowns.",
  'Oggi si pagano di più: {0}.': 'Today these pay more: {0}.',
  'In piazza si ammucchiano le zucche della Festa.': 'The Festival pumpkins are piling up in the square.',
  'Brom monta le tavolate. Clara appende i festoni.':
    'Brom is setting up the long tables. Clara hangs the garlands.',
  'Le tavolate sono pronte. Otto posti per lato.': 'The tables are ready. Eight places on each side.',
  'Domani: il Conteggio. Non mancate.': 'Tomorrow: the Counting. Do not miss it.',
  'Bacheca delle Faccende': 'Chores Board',
  'Faccenda del giorno:': "Today's chore:",
  'Ricompensa: {0}': 'Reward: {0}',
  Avvisi: 'Notices',
  '• Chi trova oggetti ROSSI li seppellisca. Subito.': '• Whoever finds RED objects must bury them. At once.',
  '{0}• Al suono della campana: a casa.': '{0}• When the bell rings: go home.',
  'Nessuna.': 'None.',
  '✓ Completata. Grazie, vicino.': '✓ Done. Thank you, neighbour.',
  "Un'altra faccenda ({0}/{1})": 'Another chore ({0}/{1})',
  'Accettata. Il villaggio conta su di te.': 'Accepted. The village is counting on you.',
  'Accetta la faccenda': 'Accept the chore',
  'Richieste del villaggio': 'Village requests',
  '• {0} cerca {1} — {2}, entro {3}': '• {0} is looking for {1} — {2}, by {3}',
  "• {0}, giorno {1} di {2}. Semi di stagione all'Emporio.":
    '• {0}, day {1} of {2}. Seasonal seeds at the General Store.',
  '• Festa del Raccolto: {0}. Portate zucche.': '• Harvest Festival: {0}. Bring pumpkins.',
  'tra {0} giorni': 'in {0} days',
  stasera: 'tonight',
  domani: 'tomorrow',
  presto: 'soon',
  '• Quotazione del giorno: {0} +40% nella cassetta.': "• Today's price: {0} +40% in the shipping box.",
  'Benvenut{o|a}': 'Welcome',
  'Ti abbiamo contat{o|a}.': 'We have counted you.',
  '• Si cerca un aiuto per la fucina. Chiedere a Brom.': '• Help wanted at the forge. Ask Brom.',
  'Faccenda accettata!': 'Chore accepted!',

  // ---------- la lapide e il registro ----------
  'Lapide senza nome': 'Nameless gravestone',
  'Una pietra nera, liscia. Chi è passato di qui ci ha inciso qualcosa. {0}':
    'A smooth black stone. Those who passed this way carved something into it. {0}',
  'Incidi qualcosa': 'Carve something',
  Incidi: 'Carve',
  '(Le incisioni sono lasciate da altri giocatori.)': '(The carvings are left by other players.)',
  'La pietra è ancora liscia.': 'The stone is still smooth.',
  'Hai inciso la pietra.': 'You carved the stone.',
  'Contato.': 'Counted.',
  'Contata.': 'Counted.',
  'Contato due volte.': 'Counted twice.',
  'Debito: uno del suo sangue.': 'Debt: one of his blood.',
  'un nome grattato via': 'a name scratched away',
  'Contato. Lascia una figlia.': 'Counted. Leaves a daughter.',
  'Registro dei Nuovi Arrivati': 'Register of New Arrivals',
  "Quest'anno ·": 'This year ·',
  ', nipote di E. Marlowe — {0}': ', grandchild of E. Marlowe — {0}',
  'Destinat{0} al Raccolto.': 'Destined for the Harvest.',
  "L'inchiostro dell'ultima riga è ancora umido.": 'The ink on the last line is still wet.',
  'Poi, una calligrafia più recente:': 'Then, in more recent handwriting:',
  'Arrivat{o|a}. Contat{o|a}.': 'Arrived. Counted.',
  'E sotto, una calligrafia nuova:': 'And below, in new handwriting:',
  "Il Cavaliere di quest'anno.": "This year's Rider.",
  'Alcuni di quei nomi… ti sembrano di persone vere. Arrivate da poco.':
    'Some of those names… seem to belong to real people. Recent arrivals.',

  // ---------- il menu di gioco ----------
  Diario: 'Journal',
  Richieste: 'Requests',
  Abitanti: 'Villagers',
  Abilità: 'Skills',
  Taccuino: 'Notebook',
  Lore: 'Lore',
  Salvataggio: 'Save',
  'Vernice gialla': 'Yellow paint',
  'Chiave della cassa': 'Chest key',
  'Chiave del fienile': 'Barn key',
  'Pagina di Elias (1)': "Elias's page (1)",
  'Pagina di Elias (2)': "Elias's page (2)",
  Obiettivi: 'Goals',
  'Oggetti chiave': 'Key items',
  'Le Regole': 'The Rules',
  'I. Il rosso è il colore cattivo. II. Non oltrepassare il recinto giallo. III. Alla campana della sera, a casa. Non aprire a nessuno.':
    'I. Red is the bad colour. II. Do not cross the yellow fence. III. At the evening bell, go home. Open the door to no one.',
  Comandi: 'Controls',
  'WASD/frecce: muoviti · E/Spazio/clic: usa e parla · 1–0/rotella: oggetto · Esc: menu · F: schermo intero':
    'WASD/arrows: move · E/Space/click: use and talk · 1–0/wheel: item · Esc: menu · F: fullscreen',
  'Nessuno.': 'No one.',
  'Non ancora conosciuto': 'Not met yet',
  'Ora:': 'Now:',
  'in cappella': 'in the chapel',
  'nel fienile': 'in the barn',
  'Chissà dove': 'Who knows where',
  'In casa · puoi bussare alla sua porta': 'At home · you can knock on the door',
  'Cerca: {0}': 'Looking for: {0}',
  Inquadratura: 'Camera',
  '(lontano ↔ vicino · tasti + e −, o due dita)': '(far ↔ near · + and − keys, or two fingers)',
  "Indicatore dell'obiettivo (freccia)": 'Goal marker (arrow)',
  'Aiuto: dove trovare i materiali che mancano (miglioramenti e feste)':
    'Hint: where to find missing materials (upgrades and festivals)',
  'Il gioco si salva da solo ogni mattina. {0}': 'The game saves itself every morning. {0}',
  'Il tuo codice:': 'Your code:',
  'Da un altro dispositivo usa "Carica da codice" con codice e chiave. Non dare la chiave a nessuno: chi ce l\'ha può usare il tuo salvataggio.':
    'On another device use "Load from code" with your code and key. Never give the key to anyone: whoever has it can use your save.',
  'Salva ed esci al menu': 'Save and quit to menu',
  'Salva adesso': 'Save now',
  'I salvataggi sono custoditi nella Valle (online).': 'Your saves are kept in the Valley (online).',
  'Sei offline: il salvataggio resta su questo dispositivo.':
    "You're offline: the save stays on this device.",
  'Chiave di recupero:': 'Recovery key:',
  'Mi collego alla Valle…': 'Connecting to the Valley…',
  'Sei in visita: si salva quando torni a casa.': "You're visiting: the game saves when you get home.",
  'Salvataggio online rifiutato:': 'Online save rejected:',
  'Salvato, anche online.': 'Saved, online too.',
  'Salvato su questo dispositivo.': 'Saved on this device.'
});
