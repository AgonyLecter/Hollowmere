'use strict';
// ================= ENGLISH — 12: the growing village (espansione.js): ranks, the Hill, the Lake, land, fishing, new villagers =================
// Ranghi: Casale = Homestead · Borgo = Hamlet · Paese = Village · Cittadina = Township · Città = Town.
Object.assign(TRAD.en, {
  // ---------- i ranghi ----------
  Casale: 'Homestead',
  Cittadina: 'Township',
  'La Collina a est si apre: legna, pietre e terre nuove. E puoi costruire una casetta per un nuovo abitante.':
    'The Hill to the east opens up: wood, stone and new land. And you can build a cottage for a new villager.',
  'Il Lago si apre: si pesca, e le sue rive si possono comprare. E un posto in più per un nuovo abitante.':
    'The Lake opens up: you can fish, and its shores can be bought. And one more place for a new villager.',
  'Un posto in più per un nuovo abitante.': 'One more place for a new villager.',
  'Sei una Città. Da qui ogni 2500 punti di prestigio guadagni una stella.':
    'You are a Town. From here on, every 2500 prestige points earns you a star.',

  // ---------- le zone e le terre ----------
  'La Collina': 'The Hill',
  'Alberi vecchi, pietre grosse, il vento. Da lassù si vede tutta la Valle.':
    'Old trees, big stones, the wind. From up there you can see the whole Valley.',
  'Il Lago': 'The Lake',
  'Acqua ferma e nera, canne, pesci che nessuno pesca da anni.': 'Still black water, reeds, fish nobody has caught in years.',
  'Il pendio della Collina': 'The Hill slope',
  'Prato in salita, sole tutto il giorno. Buono per frutteti.': 'An uphill meadow, sun all day. Good for orchards.',
  'La cima della Collina': 'The Hilltop',
  'In alto, dove arriva il vento. Tanto spazio per costruire.': 'High up, where the wind reaches. Plenty of room to build.',
  'La riva ovest del Lago': 'The west shore of the Lake',
  "Terra umida e grassa, vicino all'acqua.": 'Moist, rich soil, close to the water.',
  'La riva est del Lago': 'The east shore of the Lake',
  'Lontana da tutto. Il posto più quieto della Valle.': 'Far from everything. The quietest place in the Valley.',
  Cancello: 'Gate',
  'La torre': 'The tower',
  '{0}. Il cancello è chiuso con una catena nuova. Un cartello del Consiglio: «Si apre quando il villaggio sarà {1}.»\nIl tuo villaggio adesso è: {2} ({3} punti). Costruisci, coltiva, fatti degli amici: il prestigio cresce.':
    "{0}. The gate is locked with a new chain. A Council sign: «Opens when the village is a {1}.»\nYour village is now: {2} ({3} points). Build, farm, make friends: prestige grows.",
  'Una vecchia torre di guardia. Da quassù si vedono il campanile, il fiume e i tetti di tutta la Valle. Qualcuno ha inciso nella pietra: «Da qui le contavano».':
    'An old watchtower. From up here you can see the bell tower, the river and the roofs of the whole Valley. Someone has carved into the stone: «From here they counted them».',
  'Le terre della Valle': 'The lands of the Valley',
  '«Il Consiglio vende quello che nessuno lavora più.» — Il tuo villaggio:':
    '«The Council sells what nobody works any more.» — Your village:',
  '· Hai': '· You have',
  '🔒 serve {0}': '🔒 needs {0}',
  'Dove la terra è tua, la casella davanti a te si illumina quando tieni in mano zappa, pala o qualcosa da costruire.':
    'Where the land is yours, the tile in front of you lights up when you hold a hoe, a shovel or something to build.',
  'Hai comprato: {0}.': 'You bought: {0}.',

  // ---------- il registro del villaggio ----------
  'Il tuo villaggio': 'Your village',
  Prestigio: 'Prestige',
  '· prossimo rango ({0}) a': '· next rank ({0}) at',
  ': mancano': ': still needed',
  'Al prossimo rango: {0}': 'To the next rank: {0}',
  'Cosa fare adesso': 'What to do now',
  'Da dove viene il prestigio': 'Where prestige comes from',
  'I ranghi': 'The ranks',
  'Dopo Città: una stella ogni 2500 punti, senza fine.': 'After Town: a star every 2500 points, without end.',
  'una stella': 'a star',
  'Le terre in vendita': 'Land for sale',
  'Il registro del villaggio': 'The village register',
  'Il villaggio cresce': 'The village grows',
  "Un'altra stella per il tuo villaggio.": 'Another star for your village.',

  // ---------- la pesca ----------
  'Canna da pesca': 'Fishing rod',
  "Davanti all'acqua (Lago o fiume): lancia, aspetta il «!» e tira.": 'Facing the water (Lake or river): cast, wait for the «!» and pull.',
  Trota: 'Trout',
  'Del fiume. Fredda e svelta.': 'From the river. Cold and quick.',
  Carpa: 'Carp',
  'Pesce di lago, grosso e pigro.': 'A lake fish, big and lazy.',
  Luccio: 'Pike',
  "Denti come aghi. D'autunno e d'inverno.": 'Teeth like needles. In autumn and winter.',
  Persico: 'Perch',
  "A strisce. D'estate sotto le canne.": 'Striped. In summer, under the reeds.',
  Anguilla: 'Eel',
  'Esce di notte, nel fiume.': 'Comes out at night, in the river.',
  Tinca: 'Tench',
  'Verde come il fango.': 'Green as mud.',
  "Salmerino d'oro": 'Golden char',
  'Raro. Brilla come una moneta. Dicono porti fortuna.': 'Rare. It shines like a coin. They say it brings luck.',
  "Serve l'acqua davanti: il Lago o il fiume.": 'You need water in front of you: the Lake or the river.',
  'Troppo presto: il pesce non aveva abboccato.': "Too soon: the fish hadn't bitten.",
  'Non hai spazio nello zaino.': 'There is no room in your backpack.',
  "Il Salmerino d'oro! Nella Valle ne parleranno per giorni.": 'The Golden char! The Valley will talk about it for days.',
  'È scappato. Tira appena vedi il «!».': 'It got away. Pull as soon as you see the «!».',

  // ---------- i nuovi abitanti ----------
  Casetta: 'Cottage',
  'Una casa per un nuovo abitante, piccola come quelle del paese. Dal rango Borgo. Va messa su una tua terra libera, 5×4.':
    "A house for a new villager, small like the village ones. From the Hamlet rank. It goes on free land of yours, 5×4.",
  'Nora la pescatrice': 'Nora the fisherwoman',
  'Il Lago è pieno di pesci che non hanno mai visto una canna. Che spreco.':
    'The Lake is full of fish that have never seen a rod. What a waste.',
  "Se peschi un Salmerino d'oro portamelo: lo appendo sopra la porta.": "If you catch a Golden char bring it to me: I'll hang it over the door.",
  "L'acqua ferma racconta tutto. Basta stare zitti.": 'Still water tells everything. You only have to keep quiet.',
  'Bruno il mugnaio': 'Bruno the miller',
  'Farina, pane, polenta. La gente mangia, io macino.': 'Flour, bread, polenta. People eat, I grind.',
  "Prima qui c'era solo mais. Adesso c'è il grano, e il pane sa di pane.":
    'There used to be only maize here. Now there is wheat, and bread tastes of bread.',
  'Le mani bianche non si lavano mai del tutto.': 'White hands never quite wash clean.',
  'Lia la fioraia': 'Lia the florist',
  'Un villaggio senza fiori è un cimitero con le finestre.': 'A village without flowers is a cemetery with windows.',
  "Le aiuole davanti alle case: la gente sorride di più. L'ho misurato.":
    "Flowerbeds in front of the houses: people smile more. I've measured it.",
  'I fiori qui crescono storti, come se cercassero qualcosa.': 'The flowers here grow crooked, as if they were looking for something.',
  'Teo il minatore': 'Teo the miner',
  "Sotto la Collina c'è una miniera vecchia. Nessuno ci scendeva da anni. Io sì.":
    "Under the Hill there's an old mine. Nobody had been down it in years. I have.",
  'Le pietre di ogni villaggio sono diverse. Le tue hanno un odore strano.':
    "Every village's stones are different. Yours have a strange smell.",
  'Porta il piccone sempre affilato. E una lanterna.': 'Always keep your pickaxe sharp. And carry a lantern.',
  "Mirta l'erborista": 'Mirta the herbalist',
  "Per ogni male c'è un'erba. Per la Valle ce ne vogliono parecchie.":
    'For every ill there is a herb. The Valley needs quite a few.',
  "Raccogli all'alba: le erbe hanno ancora la rugiada e la memoria.": 'Gather at dawn: the herbs still have the dew and their memory.',
  'La radice che cresce vicino al bosco… non mangiarla. Portala a me.':
    "The root that grows near the woods… don't eat it. Bring it to me.",
  'Silvio il falegname': 'Silvio the carpenter',
  "Il legno buono si sente con l'orecchio, non con l'occhio.": 'Good wood is judged with the ear, not the eye.',
  'Fammi vedere le tue costruzioni. Mh. Si può fare di meglio. Sempre.':
    'Show me your buildings. Mh. It can be done better. Always.',
  "Ogni casa nuova è un villaggio un po' più grande.": 'Every new house is a slightly bigger village.',
  'Ada la pittrice': 'Ada the painter',
  'Dipingo la Valle ogni giorno. Ogni giorno il quadro viene diverso.':
    'I paint the Valley every day. Every day the picture comes out different.',
  'Le facce, qui, non vengono mai bene. Si muovono anche nel ritratto.':
    'Faces, here, never come out right. They move even in the portrait.',
  'Colora il tuo tetto. La Valle ha bisogno di colore.': 'Paint your roof. The Valley needs colour.',
  "Gaspare l'apicoltore": 'Gaspare the beekeeper',
  'Le api sanno chi sei. Non mentire mai vicino a un alveare.': 'The bees know who you are. Never lie near a hive.',
  'Il miele della Valle è scuro. Dolce, ma scuro.': "The Valley's honey is dark. Sweet, but dark.",
  'Più fiori pianti, più le api ti vogliono bene.': 'The more flowers you plant, the more the bees love you.',
  'Elio il pastore': 'Elio the shepherd',
  "Le pecore non sono stupide. Sono prudenti. C'è differenza.": "Sheep aren't stupid. They're cautious. There's a difference.",
  "D'estate le porto in alto. D'inverno le tengo vicine. Come la gente.":
    'In summer I take them up high. In winter I keep them close. Like people.',
  'Il latte di capra fa venire la forza. E un po\' di carattere.': "Goat's milk makes you strong. And gives you a bit of character.",
  "Il latte di capra fa venire la forza. E un po' di carattere.": "Goat's milk makes you strong. And gives you a bit of character.",
  'Rina la contadina': 'Rina the farmer',
  'La terra della Valle è nera e grassa. Le manca solo qualcuno che la ascolti.':
    "The Valley's soil is black and rich. All it lacks is someone to listen to it.",
  'Il ravanello è impaziente come un bambino. Il cavolfiore come un vecchio.':
    'The radish is as impatient as a child. The cauliflower, as an old man.',
  'Pianta girasoli ai bordi dei campi: le api ti ringrazieranno.': 'Plant sunflowers along the edges of the fields: the bees will thank you.',
  'La richiesta di oggi ✔': "Today's request ✔",
  'La richiesta: {0} × {1}': 'The request: {0} × {1}',
  'La bottega': 'The shop',
  'Sono contento di essere venuto qui. Davvero. Grazie per la casa.': "I'm glad I came here. Really. Thank you for the house.",
  'Sono contenta di essere venuta qui. Davvero. Grazie per la casa.': "I'm glad I came here. Really. Thank you for the house.",
  'Sono {0} di essere {1} qui. Davvero. Grazie per la casa.': "I'm glad I came here. Really. Thank you for the house.",
  'Mi sto abituando. La gente è strana, ma tu no.': "I'm getting used to it. The people are strange, but you're not.",
  'Sono ancora nuovo. Dammi tempo.': "I'm still new. Give me time.",
  'Sono ancora nuova. Dammi tempo.': "I'm still new. Give me time.",
  'Sono ancora {0}. Dammi tempo.': "I'm still new. Give me time.",
  'Per oggi a posto così. Torna domani.': "That's all for today. Come back tomorrow.",
  'Mi servirebbero {0} × {1}. Ti pago {2} scudi.': "I could use {0} × {1}. I'll pay you {2} crowns.",
  'Proprio quello che serviva. Ecco {0} scudi.': "Just what I needed. Here's {0} crowns.",
  'La bottega di {0}': "{0}'s shop",
  '{0}— Hai': '{0}— You have',
  '— Hai': '— You have',
  "Prezzo d'amico (−15%).": "Friend's price (−15%).",
  'Nora compra il pesce': 'Nora buys fish',
  'Non hai pesce. Il 30% in più della cassetta.': "You have no fish. 30% more than the shipping box.",
  'Le casette per i nuovi abitanti si costruiscono dal rango Borgo. Guarda il registro da Ezekiel.':
    "Cottages for new villagers can be built from the Hamlet rank. Check the register at Ezekiel's.",
  'Per ora il Consiglio permette {0} casetta. Al prossimo rango, una in più.':
    'For now the Council allows {0} cottage. At the next rank, one more.',
  'Per ora il Consiglio permette {0} casette. Al prossimo rango, una in più.':
    'For now the Council allows {0} cottages. At the next rank, one more.',
  'Per ora il Consiglio permette {0} {1}. Al prossimo rango, una in più.':
    'For now the Council allows {0} {1}. At the next rank, one more.',
  casetta: 'cottage',
  casette: 'cottages',
  'Un nuovo abitante': 'A new villager',
  'Stamattina un carro si è fermato davanti alla casetta nuova. {0} scarica le sue cose e ti saluta con la mano. Ha una bottega, e ogni giorno una richiesta.':
    'This morning a cart stopped in front of the new cottage. {0} unloads their things and waves to you. They have a shop, and a request every day.',

  // ---------- l'annuncio ----------
  'Il villaggio che cresce': 'The growing village',
  'Novità nella Valle: il tuo villaggio ha un': 'New in the Valley: your village has a',
  '. Casale, Borgo, Paese, Cittadina, Città… e poi stelle, senza fine. Cresce con tutto: costruzioni, terre, casa, animali, amicizie.':
    '. Homestead, Hamlet, Village, Township, Town… and then stars, without end. It grows with everything: buildings, land, house, animals, friendships.',
  'registro del villaggio': 'village register',
  "lo tiene l'Anziano Ezekiel: chiediglielo per vedere il prestigio e cosa sblocca il prossimo rango.":
    'kept by Elder Ezekiel: ask him to see your prestige and what the next rank unlocks.',
  'A est, nel recinto, ci sono due cancelli: la': 'To the east, in the fence, there are two gates: the',
  Collina: 'Hill',
  'si apre dal Borgo, il': 'opens from Hamlet, the',
  Lago: 'Lake',
  'dal Paese. Dentro, legna, pietre, terre nuove da comprare.': 'from Village. Inside, wood, stones, new land to buy.',
  'I cancelli a est': 'The east gates',
  'Al Lago e sul fiume': 'At the Lake and on the river',
  'si pesca': 'you can fish',
  ": lancia davanti all'acqua, aspetta il «!» e tira subito. La canna la vende Agatha quando il Lago è aperto.":
    ': cast facing the water, wait for the «!» and pull at once. Agatha sells the rod once the Lake is open.',
  'Dal Borgo, al banco da lavoro (Edifici), puoi costruire una': 'From Hamlet, at the workbench (Buildings), you can build a',
  ': il giorno dopo arriva un nuovo abitante, con la sua bottega e una richiesta al giorno.':
    ': the next day a new villager arrives, with their shop and a request every day.'
});
