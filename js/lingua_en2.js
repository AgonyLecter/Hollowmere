'use strict';
// ================= ENGLISH — 2: date, backpack, opening scene, the shared Valley, common interface =================
Object.assign(TRAD.en, {
  // ---------- la data in alto (giorno della settimana, giorno, stagione) ----------
  'Lun {0} · {1}': 'Mon {0} · {1}',
  'Mar {0} · {1}': 'Tue {0} · {1}',
  'Mer {0} · {1}': 'Wed {0} · {1}',
  'Gio {0} · {1}': 'Thu {0} · {1}',
  'Ven {0} · {1}': 'Fri {0} · {1}',
  'Sab {0} · {1}': 'Sat {0} · {1}',
  'Dom {0} · {1}': 'Sun {0} · {1}',
  '{0} · anno {1}': '{0} · year {1}',
  Oggi: 'Today',
  Ieri: 'Yesterday',
  '{0} giorni fa': '{0} days ago',

  // ---------- la barra e i pulsanti ----------
  'Costruisci (B)': 'Build (B)',
  'Zaino (I)': 'Backpack (I)',
  'Tocca: palla di neve · Tieni premuto: pupazzo (Q / G)': 'Tap: snowball · Hold: snowman (Q / G)',
  'Taccuino delle richieste': 'Requests notebook',
  'Leggi la bacheca in piazza e accetta la faccenda del giorno':
    "Read the board in the square and accept today's chore",
  "Leggi la bacheca in piazza: c'è una faccenda pagata.":
    "Read the board in the square: there's a paid chore.",
  Uscita: 'Exit',
  'Salta ›': 'Skip ›',
  'Avanti ›': 'Next ›',
  'Salta la guida': 'Skip the guide',

  // ---------- la scena d'apertura ----------
  "Tre giorni di viaggio. L'ultimo paese con un nome è rimasto indietro all'alba.":
    'Three days on the road. The last town with a name was left behind at dawn.',
  'Poi il bosco. Il cocchiere ha smesso di fischiettare. I cavalli non vogliono più correre, e corrono lo stesso.':
    'Then the woods. The coachman has stopped whistling. The horses no longer want to run, and they run anyway.',
  'Hollowmere. Da lassù sembra un presepe dentro un recinto giallo. Le lanterne si accendono tutte insieme, come occhi.':
    'Hollowmere. From up there it looks like a nativity scene inside a yellow fence. The lanterns light up all at once, like eyes.',
  'La diligenza si ferma prima del ponte. Il cocchiere non scende nemmeno.':
    "The stagecoach stops before the bridge. The coachman doesn't even get down.",

  // ---------- lo zaino e le casse ----------
  'Lì c’è già altro: scegli un posto vuoto o la pila intera.':
    "There's something else there: choose an empty slot or the whole stack.",
  'Non c’è posto.': 'No room.',
  'Non c’è posto dall’altra parte.': 'No room on the other side.',
  'Prima scegli cosa buttare.': 'First choose what to throw away.',
  'Buttare {0}? Non torna più.': "Throw away {0}? It won't come back.",
  'Hai buttato: {0}{1}.': 'You threw away: {0}{1}.',
  'Lo zaino è pieno.': 'Your backpack is full.',
  'La cassa è piena.': 'The chest is full.',
  '· vale {0}': '· worth {0}',
  Cassa: 'Chest',
  Zaino: 'Backpack',
  Ordina: 'Sort',
  '⇩ Metti tutto': '⇩ Store all',
  '⇩ Uguali': '⇩ Matching',
  '⇧ Prendi tutto': '⇧ Take all',
  Tutta: 'All',
  'Tocca per scegliere, tocca un posto per spostare ·': 'Tap to choose, tap a slot to move ·',
  'doppio tocco': 'double tap',
  ': sposta veloce ·': ': quick move ·',
  'tieni premuto': 'hold',
  '(o tasto destro): metà pila, o posane una · con una pila scelta,':
    '(or right click): half a stack, or drop one · with a stack chosen,',
  'trascina sulle caselle': 'drag across the slots',
  ': la dividi in parti uguali': ': split it evenly',
  'Lo zaino': 'The backpack',
  'Il bottone 🎒 accanto alla barra (o il tasto I) apre lo zaino: tre file da dieci, quella evidenziata è la barra che usi. Toccando una cassa, la cassa sta sopra e lo zaino sotto, tutto in una schermata.':
    'The 🎒 button next to the bar (or the I key) opens the backpack: three rows of ten, and the highlighted one is the bar you use. When you open a chest, the chest is on top and the backpack below, all on one screen.',
  Tocca: 'Tap',
  'una pila per sceglierla (resta al suo posto), poi tocca dove vuoi metterla: le uguali si uniscono, le diverse si scambiano.':
    'a stack to choose it (it stays where it is), then tap where you want it: matching stacks merge, different ones swap.',
  'Doppio tocco': 'Double tap',
  ': la sposti al volo tra zaino e cassa (o tra barra e zaino).':
    ': move it straight between backpack and chest (or between bar and backpack).',
  'Tieni premuto': 'Hold',
  ': ne scegli metà; con una pila scelta, tieni premuto su un altro posto per posarne una. Puoi anche trascinare.':
    ': choose half of it; with a stack chosen, hold on another slot to drop one. You can drag too.',
  '«Ordina» unisce le pile e mette in ordine. Nella cassa: «⇩ Metti tutto» (tranne gli attrezzi), «⇩ Uguali» (solo le cose che in cassa ci sono già) e «⇧ Prendi tutto». Il cestino butta quello che hai scelto.':
    '«Sort» merges stacks and tidies up. In a chest: «⇩ Store all» (except tools), «⇩ Matching» (only things already in the chest) and «⇧ Take all». The bin throws away what you chose.',

  // ---------- la Valle condivisa: bacheca, albo, guida ----------
  'Bacheca comune': 'Shared board',
  Novità: "What's new",
  Aggiornamento: 'Update',
  Evento: 'Event',
  Avviso: 'Notice',
  'min fa': 'min ago',
  'ore fa': 'hours ago',
  'giorni fa': 'days ago',
  'Albo dei villaggi': 'Village register',
  Guida: 'Guide',
  'La bacheca della Valle': 'The Valley board',
  'Avviso del giorno': "Today's notice",
  'Ancora niente di nuovo. Quando la regia aggiunge qualcosa alla Valle, lo trovi scritto qui.':
    'Nothing new yet. When the game masters add something to the Valley, you will find it written here.',
  'Senza connessione la bacheca resta vuota: le novità arrivano dalla Valle online.':
    'Without a connection the board stays empty: news comes from the online Valley.',
  'La guida della Valle ti accompagna la prima volta e quando arriva qualcosa di nuovo. Se vuoi, puoi rifarla da capo.':
    'The Valley guide walks you through the first time and whenever something new arrives. If you like, you can take it again from the start.',
  'Rifai la guida della Valle': 'Take the Valley guide again',
  'In breve': 'In short',
  ': tutti i giocatori della Valle. «Visita» per entrare, «+ Amico» per tenerlo tra gli amici (e lui riceve il tuo invito).':
    ': every player in the Valley. «Visit» to go in, «+ Friend» to keep them among your friends (and they get your invitation).',
  'Il ponte': 'The bridge',
  'a sud: viaggi, amici, inviti e il mercato dei materiali rari.':
    'to the south: travel, friends, invitations and the market for rare materials.',
  'In visita': 'Visiting',
  'puoi annaffiare i campi degli altri e lasciare regali nella loro cassetta.':
    "you can water other people's fields and leave gifts in their shipping box.",
  ': quando siete nello stesso villaggio vi vedete muovere. Tasto T o il fumetto.':
    ': when you are in the same village you see each other move. T key or the speech bubble.',
  '• Il tuo codice:': '• Your code:',
  "Il tuo villaggio nell'albo:": 'Your village in the register:',
  'Cerco i villaggi della Valle…': 'Looking for the villages of the Valley…',
  "Per vedere l'albo serve la connessione alla Valle (online).":
    'You need to be connected to the Valley (online) to see the register.',
  '● online ora': '● online now',
  'bestie ·': 'animals ·',
  Visita: 'Visit',
  'amico ✓': 'friend ✓',
  '+ Amico': '+ Friend',
  '{0} villaggi nella Valle ·': '{0} villages in the Valley ·',
  '{0} online ora': '{0} online now',
  '. Non serve conoscere il codice: scegli qualcuno e vai a trovarlo.':
    ". You don't need to know the code: pick someone and go and see them.",
  'Solo online': 'Online only',
  'Nessun villaggio così, per ora.': 'No village like that, for now.',
  'Nessun altro villaggio, per ora. Arriveranno.': 'No other villages, for now. They will come.',
  'pagina {0} di {1}': 'page {0} of {1}',
  'Il cartello del tuo villaggio': "Your village's sign",
  "Una riga che gli altri leggono nell'albo: chi sei, cosa coltivi, cosa cerchi.":
    'One line the others read in the register: who you are, what you grow, what you are looking for.',
  Appendi: 'Hang it',
  '{0} è tra i tuoi amici. Riceverà il tuo invito e potrà venire a trovarti.':
    '{0} is now among your friends. They will get your invitation and can come and visit you.',
  "Cartello appeso: lo leggono tutti nell'albo.": 'Sign hung: everyone reads it in the register.',
  'Cartello tolto.': 'Sign taken down.',
  'Albo dei villaggi: tutti i giocatori della Valle': 'Village register: every player in the Valley',
  'La Valle condivisa': 'The shared Valley',
  'Benvenut{o|a} nella Valle condivisa. Da qui non sei più sol{o|a}: ogni giocatore che ha finito la storia ha il suo villaggio, e puoi andarlo a trovare.':
    'Welcome to the shared Valley. From here on you are not alone: every player who has finished the story has a village, and you can go and visit it.',
  "Al centro della piazza c'è la": 'In the middle of the square is the',
  'bacheca comune': 'shared board',
  '. Raggiungila e aprila.': '. Walk over and open it.',
  'Nella bacheca ci sono le': 'On the board you will find the',
  "della Valle e l'": 'of the Valley and the',
  ': tutti i giocatori, anche quelli che non conosci. Chi è':
    ": every player, even the ones you don't know. Whoever is",
  'online ora': 'online now',
  'è in cima.': 'is at the top.',
  "Nell'albo premi": 'In the register press',
  'per entrare nel villaggio di qualcuno,': "to go into someone's village,",
  'per tenerlo tra gli amici: riceve il tuo invito e vede il tuo villaggio.':
    'to keep them among your friends: they get your invitation and see your village.',
  Il: 'The',
  'a sud è la strada di fuori: amici, inviti e il mercato dei materiali rari (oro, diamanti, nichel, rame).':
    'to the south is the road out: friends, invitations and the market for rare materials (gold, diamonds, nickel, copper).',
  'Quando siete nello stesso villaggio vi vedete muovere. Per scrivere: tasto':
    'When you are in the same village you see each other move. To write: the key',
  'o il fumetto 💬. In visita puoi annaffiare i campi e lasciare regali nella cassetta.':
    'or the 💬 bubble. When visiting you can water the fields and leave gifts in the shipping box.',
  'Il tuo codice è': 'Your code is',
  ': se lo dai a un amico, ti trova subito. Buona Valle! Questa guida non torna più, ma puoi rifarla dalla bacheca comune.':
    ": give it to a friend and they'll find you straight away. Enjoy the Valley! This guide won't come back, but you can take it again from the shared board.",
  'Novità nella Valle': 'News in the Valley',
  'La regia ha scritto {0} nella bacheca comune: «{1}». Vai a leggere.':
    'The game masters wrote {0} on the shared board: «{1}». Go and read it.',
  'una novità': 'something new'
});
