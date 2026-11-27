'use strict';
// ================= ENGLISH — 5: the farm (farm.js): tools, seeds, crops, the fields, things to examine, the story's chores =================
Object.assign(TRAD.en, {
  // ---------- oggetti della storia ----------
  Zappa: 'Hoe',
  'Dissoda la terra. Seppellisce ciò che va seppellito.': 'Tills the soil. Buries what must be buried.',
  Annaffiatoio: 'Watering can',
  'Acqua per le piantine. Non finisce mai. Strano.': 'Water for the seedlings. It never runs out. Strange.',
  'Semi di rapa': 'Turnip seeds',
  'Crescono in 2 giorni.': 'Grow in 2 days.',
  'Semi di patata': 'Potato seeds',
  'Crescono in 3 giorni.': 'Grow in 3 days.',
  'Semi di zucca': 'Pumpkin seeds',
  'Crescono in 3 giorni. Alla Valle piacciono le zucche.': 'Grow in 3 days. The Valley likes pumpkins.',
  'Alla Valle piacciono le zucche.': 'The Valley likes pumpkins.',
  'Semi di fagiolo': 'Bean seeds',
  'Rampicanti: dopo il primo raccolto ricrescono ogni due notti.':
    'Climbers: after the first harvest they grow back every two nights.',
  'Si raccolgono più volte.': 'Can be harvested several times.',
  'Semi di cavolo nero': 'Black kale seeds',
  'Lento, ma prezioso.': 'Slow, but precious.',
  Concime: 'Fertiliser',
  'Spargilo sulla terra dissodata: il raccolto di quella zolla sarà più abbondante.':
    'Spread it on tilled soil: the harvest from that plot will be more plentiful.',
  Rapa: 'Turnip',
  Patata: 'Potato',
  Zucca: 'Pumpkin',
  Fagioli: 'Beans',
  'Cavolo nero': 'Black kale',
  'Bacche rosse': 'Red berries',
  'Il colore cattivo. Andrebbero seppellite.': 'The bad colour. They ought to be buried.',
  'Nastro rosso': 'Red ribbon',
  'Morbido. Bellissimo. Proibito.': 'Soft. Beautiful. Forbidden.',
  'Focaccia di zucca': 'Pumpkin flatbread',
  'Per il ceppo, al tramonto. Non mangiarla.': "For the log, at sunset. Don't eat it.",
  'Vernice gialla': 'Yellow paint',
  'Per i pali grigi del recinto. Avvicinati a un palo e usalo.': 'For the grey fence posts. Go up to a post and use it.',
  'Chiave della cassa': 'Chest key',
  'La chiave della cassa del nonno, in casa.': "The key to grandpa's chest, in the house.",
  'Chiave del fienile': 'Barn key',
  "Fredda. Apre il fienile rosso dell'Anziano.": "Cold. It opens the Elder's red barn.",
  'Lanterna di Clara': "Clara's lantern",
  "Una luce gialla, piccola. Nel bosco è l'unica che conta.": 'A small yellow light. In the woods it is the only one that counts.',
  'La lanterna è pronta. Si accenderà da sola, quando passerai il Varco.':
    'The lantern is ready. It will light by itself when you go through the Gap.',
  'Mantello giallo': 'Yellow cloak',
  'Un dono del villaggio. Il giallo non protegge: segna.': "A gift from the village. Yellow doesn't protect: it marks.",
  'Lo pieghi tra le mani. Il giallo non protegge: segna. Non lo indossi. Non ancora.':
    "You fold it in your hands. Yellow doesn't protect: it marks. You don't put it on. Not yet.",
  'Pane di Clara': "Clara's bread",
  'Ancora tiepido. +30 energia.': 'Still warm. +30 energy.',
  'Zuppa di rape': 'Turnip soup',
  'Calda e semplice. +38 energia.': 'Hot and simple. +38 energy.',
  'Patate arrosto': 'Roast potatoes',
  'Croccanti fuori, morbide dentro. +50 energia.': 'Crisp outside, soft inside. +50 energy.',
  'Torta di zucca': 'Pumpkin pie',
  'La Valle ne va pazza. +75 energia.': 'The Valley is crazy about it. +75 energy.',
  // le parole che entrano nelle frasi (plurali e singolari)
  rape: 'turnips',
  patate: 'potatoes',
  zucche: 'pumpkins',
  'manciate di fagioli': 'handfuls of beans',
  'cavoli neri': 'black kale',
  'pani di Clara': "loaves of Clara's bread",
  'zuppe di rape': 'bowls of turnip soup',
  'porzioni di patate arrosto': 'portions of roast potatoes',
  'torte di zucca': 'pumpkin pies',
  'una rapa': 'a turnip',
  'una patata': 'a potato',
  'una zucca': 'a pumpkin',
  'una manciata di fagioli': 'a handful of beans',
  'un cavolo nero': 'a black kale',
  'un pane di Clara': "a loaf of Clara's bread",
  'una zuppa di rape': 'a bowl of turnip soup',
  'una porzione di patate arrosto': 'a portion of roast potatoes',
  'una torta di zucca': 'a pumpkin pie',

  // ---------- raccogliere, seminare, annaffiare ----------
  'Lo zaino è pieno!': 'Your backpack is full!',
  'Lo zaino è pieno: {0} ti aspetta nella cassetta delle spedizioni.':
    'Your backpack is full: {0} is waiting for you in the shipping box.',
  'Ottenuto:': 'Got:',
  'Ottenuto: {0}': 'Got: {0}',
  'Sei esaust{o|a}. Vai a dormire.': "You're exhausted. Go to sleep.",
  'Raccolto abbondante!': 'Bumper harvest!',
  'Raccolto! Tienilo in mano e usalo sulla cassetta accanto a casa per venderlo.':
    'Harvested! Hold it and use it on the box next to the house to sell it.',
  ': la pianta resta. Bagnala e ricrescerà.': ': the plant stays. Water it and it will grow back.',
  '{0}: la pianta resta. Bagnala e ricrescerà.': '{0}: the plant stays. Water it and it will grow back.',
  "La zucca ha una faccia. Non l'hai intagliata tu.": "The pumpkin has a face. You didn't carve it.",
  'Hai seppellito {0} bacche rosse.': 'You buried {0} red berries.',
  'Hai seppellito il nastro. Ti senti più legger{o|a}. O più sol{o|a}.':
    'You buried the ribbon. You feel lighter. Or lonelier.',
  'Non qui.': 'Not here.',
  'Hai tolto la pianta appassita. Puoi seminare di nuovo.': 'You removed the wilted plant. You can sow again.',
  'Il concime va sulla terra dissodata.': 'Fertiliser goes on tilled soil.',
  'Questa zolla è già concimata.': 'This plot is already fertilised.',
  Concimata: 'Fertilised',
  'Concimata: il raccolto di questa zolla sarà più abbondante.':
    'Fertilised: the harvest from this plot will be more plentiful.',
  'C’è una pianta: la zappa serve solo per toglierla se secca.':
    "There's a plant here: the hoe is only for removing it if it dies.",
  'L’aiuola è già dissodata: semina pure.': 'The bed is already tilled: go ahead and sow.',
  "Questa terra non è tua. Le terre le vende l'Anziano Ezekiel.": "This land isn't yours. Elder Ezekiel sells the land.",
  "La terra qui è troppo dura. Coltiva nei campi del nonno.": "The ground here is too hard. Farm in grandpa's fields.",
  'È già dissodato.': "It's already tilled.",
  'Terra dissodata. Ora scegli i semi nella barra (slot 3) e usali qui.':
    'Soil tilled. Now choose the seeds in the bar (slot 3) and use them here.',
  "L'annaffiatoio è già pieno.": 'The watering can is already full.',
  'Niente da annaffiare.': 'Nothing to water.',
  'Annaffiata! Cresce di notte, se la bagni ogni giorno: {0} matura in {1} notti.':
    'Watered! It grows at night if you water it every day: {0} ripens in {1} nights.',
  'Prima dissoda la terra con la zappa.': 'First till the soil with the hoe.',
  'Non è stagione: {0} cresce in {1}.': "It's not the season: {0} grows in {1}.",
  "C'è già qualcosa qui.": "There's already something here.",
  'Seminato:': 'Sown:',
  'Seminato: {0}': 'Sown: {0}',
  "Seminato! Ora prendi l'annaffiatoio (slot 2) e bagna la terra.":
    'Sown! Now take the watering can (slot 2) and water the soil.',
  '{0}: è seccata. Ripulisci la zolla con la zappa.': '{0}: it has died. Clear the plot with the hoe.',
  '{0}: appena seminata, matura tra {1} notti bagnate.{2}': '{0}: just sown, ripens after {1} watered nights.{2}',
  '{0}: matura tra {1} notti bagnate.{2}': '{0}: ripens after {1} watered nights.{2}',
  '{0}: appena seminata, matura domani bagnate.{1}': '{0}: just sown, ripens tomorrow if watered.{1}',
  '{0}: matura domani bagnate.{1}': '{0}: ripens tomorrow if watered.{1}',
  'appena seminata,': 'just sown,',
  'matura domani': 'ripens tomorrow',
  'matura tra': 'ripens in',
  'Annaffiata oggi.': 'Watered today.',
  'È appassita: annaffiala per farla riprendere, o toglila con la zappa e ripianta.':
    'It has wilted: water it to revive it, or remove it with the hoe and replant.',
  'Va annaffiata.': 'Needs watering.',
  'Terra concimata.': 'Fertilised soil.',

  // ---------- animali e cose da guardare ----------
  'Fa le fusa. Ha un occhio giallo e uno… anche giallo.': "It purrs. It has one yellow eye and one… also yellow.",
  'Il gatto nero ti si struscia sulle gambe.': 'The black cat rubs against your legs.',
  'Miao. Sembra che ti conosca da sempre.': 'Meow. It seems to have known you forever.',
  'Coccodè! La gallina ti guarda storto.': 'Cluck! The hen gives you a dirty look.',
  'Il girasole non segue il sole. Segue te.': "The sunflower doesn't follow the sun. It follows you.",
  'Un girasole. Gira la testa verso la luce. Quasi sempre.': 'A sunflower. It turns its head towards the light. Almost always.',
  "Ortensie. Agatha dice che cambiano colore con la terra. Sotto, cosa c'è?":
    "Hydrangeas. Agatha says they change colour with the soil. What's underneath?",
  'Un sasso coperto di muschio. Sotto, formiche al lavoro.': 'A moss-covered stone. Underneath, ants at work.',
  'Un tronco caduto. Dentro è cavo. Qualcosa ci ha fatto la tana.':
    "A fallen log. It's hollow inside. Something has made its den there.",
  'Funghi. Meglio non mangiarli. Meglio non toccarli.': "Mushrooms. Better not eat them. Better not touch them.",
  'Il giallo protegge. Il giallo protegge. Il giallo…': 'Yellow protects. Yellow protects. Yellow…',
  'Il recinto giallo. Oltre, il bosco.': 'The yellow fence. Beyond it, the woods.',
  'Pini neri, fitti come denti.': 'Black pines, packed tight as teeth.',
  "Un albero d'autunno. Le foglie cadono senza vento.": 'An autumn tree. The leaves fall without wind.',
  'Corteccia ruvida. Qualcuno ci ha inciso delle tacche.': 'Rough bark. Someone has carved notches into it.',
  'Un albero. Sembra ascoltare.': 'A tree. It seems to be listening.',
  'Un cespuglio. Solo un cespuglio.': 'A bush. Just a bush.',
  "Un lampione acceso. Nessuno l'ha acceso: si è acceso da solo.": 'A lit street lamp. Nobody lit it: it lit itself.',
  'Un lampione acceso. Fratello Lucius li accende ogni sera, uno per uno.':
    'A lit street lamp. Brother Lucius lights them every evening, one by one.',
  "Un lampione. L'olio puzza di sego.": 'A street lamp. The oil reeks of tallow.',
  'Otto piatti apparecchiati. Uno ha già il tuo nome sotto il bicchiere.':
    'Eight places laid. One already has your name under the glass.',
  'La tavolata della Festa. Otto posti per lato, zucche e candele gialle.':
    'The Festival table. Eight places on each side, pumpkins and yellow candles.',
  "Balle di fieno. Ce n'è più di quanto serva a un villaggio senza cavalli.":
    'Bales of hay. More than a village without horses needs.',
  'Botti di sidro. Chiuse con la cera gialla.': 'Barrels of cider. Sealed with yellow wax.',
  'La zucca ti sorride. Qualcuno le ha dato una bocca.': 'The pumpkin smiles at you. Someone gave it a mouth.',
  'Una zucca gigante! Hollowmere ne va fiera.': 'A giant pumpkin! Hollowmere is proud of it.',

  // ---------- il Varco, il ponte, il recinto ----------
  'Il Varco è aperto. «{0}» è da qualche parte nel bosco.': 'The Gap is open. «{0}» is somewhere in the woods.',
  'Il Varco. Il bosco è più quieto, adesso. Senza una ragione, non ci entri.':
    "The Gap. The woods are quieter now. Without a reason, you don't go in.",
  'Il Varco. Un sentiero che entra nel bosco e non ne esce.': 'The Gap. A path that goes into the woods and does not come out.',
  'Senti qualcosa respirare tra gli alberi. Le gambe non ti obbediscono.':
    "You hear something breathing among the trees. Your legs won't obey you.",
  'Le tue gambe si rifiutano di andare avanti. Regola numero due.': 'Your legs refuse to go on. Rule number two.',
  'Il cocchiere è sparito. Non hai motivo di tornare indietro. Non ancora.':
    'The coachman has vanished. You have no reason to go back. Not yet.',
  "Il ponte… non c'è più.": 'The bridge… is gone.',
  "Solo acqua nera e due pali spezzati. Come se non ci fosse mai stato.":
    'Only black water and two broken posts. As if it had never been there.',
  'Acqua nera. Nessun ponte.': 'Black water. No bridge.',
  'Un palo giallo. Protetto.': 'A yellow post. Protected.',
  'Un palo grigio, scrostato. Stona col resto del recinto.': "A grey, peeling post. It clashes with the rest of the fence.",
  'Palo dipinto di giallo ({0}/5)': 'Post painted yellow ({0}/5)',
  'Il recinto è di nuovo tutto giallo. La vernice è finita.': 'The fence is all yellow again. The paint has run out.',
  'Bacche seppellite ({0}/3)': 'Berries buried ({0}/3)',
  'Un cespuglio carico di bacche rosse. Rosse come… il colore cattivo.':
    'A bush laden with red berries. Red like… the bad colour.',
  Raccoglile: 'Pick them',
  'Lasciale lì': 'Leave them',
  'Sono calde. Come se avessero un battito.\n(Puoi seppellirle con la zappa, o selezionarle e usarle sul terreno.)':
    'They are warm. As if they had a heartbeat.\n(You can bury them with the hoe, or select them and use them on the ground.)',
  'Con la zappa in mano potresti seppellire il cespuglio.': 'With the hoe in hand you could bury the bush.',
  "La focaccia è sparita. Al suo posto, l'impronta di uno zoccolo, bruciata nel legno.":
    'The flatbread is gone. In its place, a hoofprint, burnt into the wood.',
  'La focaccia è lì. Qualcosa, nel bosco, la sta guardando.': 'The flatbread is there. Something in the woods is watching it.',
  'Un vecchio ceppo vicino al Varco. Sopra, tacche incise. Sembrano conteggi.':
    'An old log near the Gap. Notches carved on top. They look like tallies.',
  'Clara ha detto: al tramonto. Dalle 18:00.': 'Clara said: at sunset. From 18:00.',
  'Troppo tardi. Il sole è sparito da un pezzo. Senti che non la vogliono più.':
    "Too late. The sun went down a while ago. You feel they don't want it any more.",
  'Appoggi la focaccia sul ceppo.': 'You set the flatbread on the log.',
  'Dal bosco, un suono. Come qualcuno che deglutisce.': 'From the woods, a sound. Like someone swallowing.',

  // ---------- la cassetta delle spedizioni ----------
  'Spedite {0} × {1} (+{2} domattina)': 'Shipped {0} × {1} (+{2} tomorrow morning)',
  'La cassetta delle spedizioni. Tieni in mano quello che vuoi vendere (raccolti, minerali, lingotti…) per metterlo dentro.\nDomattina verrà pagato. Nessuno ha mai visto chi lo ritira.{0}{1}':
    "The shipping box. Hold what you want to sell (crops, ores, ingots…) to put it in.\nIt will be paid for tomorrow morning. Nobody has ever seen who collects it.{0}{1}",
  'Oggi si paga di più: {0} (+40%).': 'Paying more today: {0} (+40%).',
  '(Oggi: {0})': '(Today: {0})',

  // ---------- lo spaventapasseri, il pozzo, il banco ----------
  'Raccogli il cappello di paglia da terra e lo rimetti sulla testa dello spaventapasseri.':
    "You pick the straw hat up off the ground and put it back on the scarecrow's head.",
  '…Il cappello era già sulla sua testa. Eppure ne stai tenendo uno in mano.':
    '…The hat was already on its head. And yet you are holding one in your hand.',
  'Lo spaventapasseri adesso guarda verso casa tua. Lo hai sempre visto guardare la strada.':
    'The scarecrow is now looking towards your house. You have always seen it looking at the road.',
  'Uno spaventapasseri col sorriso cucito. Il nonno lo chiamava "Signor Paglia".':
    'A scarecrow with a stitched-on smile. Grandpa called it "Mr Straw".',
  "Riempi il secchio. L'acqua è fredda e sa di ferro.\n(Portala alla tomba di Elias, nel cimitero.)":
    "You fill the bucket. The water is cold and tastes of iron.\n(Take it to Elias's grave, in the cemetery.)",
  'Guardi giù nel pozzo. Il tuo riflesso guarda su. Poi si gira.':
    'You look down the well. Your reflection looks up. Then it turns away.',
  'Il pozzo del villaggio. Una monetina brilla sul fondo.': 'The village well. A coin glints at the bottom.',
  "Con la pioggia Agatha ha ritirato il banco. Vende dal portico dell'emporio.":
    'Because of the rain Agatha has packed up the stall. She is selling from the store porch.',
  "Agatha non c'è. Un cartello: «Servitevi pure. Gli scudi nel barattolo.»":
    "Agatha isn't here. A sign: «Help yourselves. Crowns in the jar.»",
  'Il banco di Agatha. Chiuso.': "Agatha's stall. Closed.",
  "L'incudine di Brom. È ancora tiepida.": "Brom's anvil. It's still warm.",

  // ---------- il cimitero ----------
  'THOMAS ASHBY — Contato due volte.': 'THOMAS ASHBY — Counted twice.',
  "ABIGAIL MOSS — Arrivata d'autunno.": 'ABIGAIL MOSS — Arrived in autumn.',
  'Il nome è stato raschiato via.': 'The name has been scraped away.',
  'SAMUEL CROWE — Il giallo non bastò.': 'SAMUEL CROWE — Yellow was not enough.',
  'HANNAH PRICE — Riposa. Non tornare.': 'HANNAH PRICE — Rest. Do not come back.',
  'Una lapide nuova. Nessun nome. Ancora.': 'A new gravestone. No name. Yet.',
  'EZRA BLACKWOOD — Un forestiero.': 'EZRA BLACKWOOD — A stranger.',
  'PRUDENCE GALE — Contata.': 'PRUDENCE GALE — Counted.',
  "Versi l'acqua sulla terra della tomba. La terra la beve tutta, avida.":
    'You pour the water on the earth of the grave. The earth drinks it all, greedily.',
  "ELIAS MARLOWE — Tornerà per il raccolto.\n\nLa terra della tomba è smossa. Dall'interno.":
    'ELIAS MARLOWE — He will return for the harvest.\n\nThe earth on the grave has been disturbed. From the inside.',
  'ELIAS MARLOWE — Tornerà per il raccolto.\n\nLa tomba del nonno. Fiori gialli, freschi.':
    "ELIAS MARLOWE — He will return for the harvest.\n\nGrandpa's grave. Yellow flowers, fresh.",

  // ---------- le porte del paese ----------
  'La porta della cappella è sbarrata. Da dentro.': 'The chapel door is barred. From the inside.',
  'Emporio Crane. Un biglietto sulla porta: «Sono al banco in piazza. Prezzi onesti. — A.»':
    "Crane's General Store. A note on the door: «I'm at the stall in the square. Honest prices. — A.»",
  'La casetta di Clara. Profuma di pane e di cera gialla.': "Clara's cottage. It smells of bread and yellow wax.",
  'La fucina di Brom. Fa caldo anche da fuori. Dentro, tanti ferri di cavallo appesi.':
    "Brom's forge. It's hot even from outside. Inside, lots of horseshoes hanging.",
  "Sopra la porta dell'Anziano è inchiodato un ferro di cavallo, come portafortuna.":
    "A horseshoe is nailed above the Elder's door, for luck.",
  "Ci passi le dita dietro. C'è una chiave di ferro, fredda.\n(Hai ottenuto: Chiave del fienile)":
    "You run your fingers behind it. There's an iron key, cold.\n(You got: Barn key)",
  'Le luci sono spente. Ma qualcuno ti osserva dalla finestra.': 'The lights are off. But someone is watching you from the window.',
  'Bussi. Nessuno risponde. La tenda però si è mossa.': 'You knock. Nobody answers. But the curtain moved.',
  "Il fienile dell'Anziano. È rosso.\nL'unica cosa rossa in tutta Hollowmere. È chiuso a chiave.":
    "The Elder's barn. It is red.\nThe only red thing in all of Hollowmere. It is locked.",
  'Il fienile è vuoto adesso. Hanno portato via tutto.': 'The barn is empty now. They have taken everything away.',
  "Senti qualcuno muoversi dentro. Una voce: l'Anziano. Meglio tornare dopo la campana delle nove.":
    "You hear someone moving inside. A voice: the Elder's. Better come back after the nine o'clock bell.",
  'Stasera c\'è la Festa. Non puoi mancare: ti aspettano tutti. Tutti.':
    "The Festival is tonight. You can't miss it: everyone is expecting you. Everyone.",
  "Stasera c'è la Festa. Non puoi mancare: ti aspettano tutti. Tutti.":
    "The Festival is tonight. You can't miss it: everyone is expecting you. Everyone.",

  // ---------- il letto e la panchina ----------
  'Dormi fino a domani': 'Sleep until tomorrow',
  "Riposa un'ora": 'Rest for an hour',
  'Riposa fino a mezzogiorno': 'Rest until noon',
  'Riposa fino alle 18:00': 'Rest until 18:00',
  'Sei sfinit{o|a} dal viaggio. Il letto del nonno sa di lavanda. Dormi fino a domani?':
    "You're worn out from the journey. Grandpa's bed smells of lavender. Sleep until tomorrow?",
  "Il letto del nonno. Coperte gialle, che sanno di lavanda. Puoi riposare un po', o dormire fino a domattina.":
    "Grandpa's bed. Yellow blankets that smell of lavender. You can rest a while, or sleep until morning.",
  'Il letto del nonno. Coperte gialle, che sanno di lavanda. Dormire?':
    "Grandpa's bed. Yellow blankets that smell of lavender. Sleep?",
  "È tardi. Non è un'ora per stare seduti all'aperto.": "It's late. This is no hour to be sitting outdoors.",
  "Aspetta un'ora": 'Wait an hour',
  'Aspetta fino a mezzogiorno': 'Wait until noon',
  'Aspetta fino alle 18:00': 'Wait until 18:00',
  Alzati: 'Get up',
  'Una panchina di legno, consumata da generazioni di attese. Ti siedi?':
    'A wooden bench, worn by generations of waiting. Sit down?',

  // ---------- la casa del nonno ----------
  'La cassa del nonno. Vuota, a parte un odore di tabacco e di terra.':
    "Grandpa's chest. Empty, apart from a smell of tobacco and earth.",
  'La cassa del nonno. È chiusa a chiave. Qualcuno al villaggio forse ha la chiave.':
    "Grandpa's chest. It's locked. Perhaps someone in the village has the key.",
  'La chiave gira. Dentro: una pipa, un fazzoletto giallo, e una pagina strappata.':
    'The key turns. Inside: a pipe, a yellow handkerchief, and a torn page.',
  'Libri del nonno. Su ogni dorso, qualcuno ha scritto a matita un numero. Tutti "8".':
    'Grandpa\'s books. On every spine, someone has pencilled a number. All "8".',
  'Libri del nonno: almanacchi, un erbario, "Il buon contadino". Polvere.':
    'Grandpa\'s books: almanacs, a herbarium, "The Good Farmer". Dust.',
  'Un tavolo per una persona. Ci sono due sedie.': 'A table for one. There are two chairs.',
  'Il fuoco scoppietta e ti scalda le mani.': 'The fire crackles and warms your hands.',
  'Fuori è buio pesto. Qualcosa di più buio si muove al limite del campo.':
    'Outside it is pitch dark. Something darker moves at the edge of the field.',
  'Dalla finestra vedi i campi e il recinto giallo.': 'From the window you see the fields and the yellow fence.',
  'Il ritratto del nonno. Qualcuno ha grattato via la testa.': "Grandpa's portrait. Someone has scratched off the head.",
  'Il nonno Elias, da giovane. Sorride. Ha i tuoi occhi.': 'Grandpa Elias, as a young man. He is smiling. He has your eyes.',

  // ---------- la cappella ----------
  "L'altare. Un drappo giallo, due candele. Nessuna croce: solo un cerchio intagliato con otto tacche.":
    'The altar. A yellow cloth, two candles. No cross: only a carved circle with eight notches.',
  'Candele di sego. Fumano nero.': 'Tallow candles. They smoke black.',
  "Hai già ascoltato la messa, oggi. Lucius ti sorride dall'altare. Un sorriso un po' troppo largo.":
    'You have already heard mass today. Lucius smiles at you from the altar. A smile a little too wide.',
  'Fratello Lucius sta per cominciare la messa. Ti siedi in una panca?':
    'Brother Lucius is about to begin mass. Will you sit in a pew?',
  'Non ora': 'Not now',
  'Panche di legno consumato. Sullo schienale qualcuno ha inciso: "NON GIRARTI".':
    'Pews of worn wood. Someone has carved into a backrest: "DON\'T TURN AROUND".',
  'DONG. La campana suona sopra di te. In tutta la valle, la gente si ferma e guarda la cappella.':
    'DONG. The bell rings above you. All over the valley, people stop and look at the chapel.',
  'La faccenda dice: a mezzogiorno. Tra le 12:00 e le 13:00.': 'The chore says: at noon. Between 12:00 and 13:00.',
  'La corda della campana. Solo Fratello Lucius può suonarla. E tu, se te lo chiedono.':
    'The bell rope. Only Brother Lucius may ring it. And you, if they ask you to.',

  // ---------- il fienile rosso ----------
  "Appeso a un'impalcatura di vimini: un mantello nero, enorme. Il colletto è imbottito per sembrare un collo mozzato.":
    'Hanging on a wicker frame: a huge black cloak. The collar is padded to look like a severed neck.',
  'Accanto, una sciabola di latta. Un costume.': 'Next to it, a tin sabre. A costume.',
  'Il Cavaliere senza testa… è un costume. Lo hanno costruito loro.': 'The headless Rider… is a costume. They built it.',
  'Il costume del Cavaliere. Vuoto.': "The Rider's costume. Empty.",
  'Trampoli. In fondo, inchiodati, zoccoli di cavallo veri. Ecco le impronte.':
    "Stilts. At the bottom, nailed on, real horse's hooves. So that's the hoofprints.",
  'La lanterna è spenta. Lo stoppino è ancora caldo.': 'The lantern is out. The wick is still warm.',
  'Una lanterna. Il vetro è dipinto di rosso.': 'A lantern. The glass is painted red.',

  // ---------- le faccende della storia ----------
  'Faccenda completata: +{0}': 'Chore done: +{0}',
  'Suona la campana della cappella tra le 12:00 e le 13:00': 'Ring the chapel bell between 12:00 and 13:00',
  'Spazza le 4 cataste di foglie davanti alla cappella': 'Sweep the 4 piles of leaves in front of the chapel',
  'Prendi acqua dal pozzo e versala sulla tomba di Elias': "Fetch water from the well and pour it on Elias's grave",
  'Rimetti il cappello allo spaventapasseri della tua fattoria': "Put the hat back on your farm's scarecrow",
  'Foglie spazzate ({0}/4)': 'Leaves swept ({0}/4)',
  "Sotto l'ultima catasta, un dente. Umano.": 'Under the last pile, a tooth. Human.',

  // ---------- le pagine del nonno ----------
  'Pagina strappata': 'Torn page',
  'Dal diario di Elias Marlowe': 'From the diary of Elias Marlowe',
  'Il primo giorno mi hanno sorriso tutti. Il secondo mi hanno dato la vernice. Il terzo mi hanno':
    'On the first day they all smiled at me. On the second they gave me the paint. On the third they',
  contato: 'counted',
  "Dicono che il rosso è il colore cattivo. Ma il fienile dell'Anziano è rosso. È l'unico. Nessuno ci fa caso, o tutti fanno finta.":
    "They say red is the bad colour. But the Elder's barn is red. It's the only one. Nobody notices, or they all pretend not to.",
  'Il giallo dei loro mantelli puzza di sego e di paura.': 'The yellow of their cloaks reeks of tallow and fear.',
  'Se stai leggendo, sei arrivat{o|a}.': "If you're reading this, you have arrived.",
  'Mi dispiace.': "I'm sorry.",
  'Coltiva. Sorridi. Rispetta le regole.': 'Grow things. Smile. Respect the rules.',
  'E non farti contare due volte.': "And don't let them count you twice.",
  'Una pagina sotto la porta': 'A page under the door',
  "La calligrafia del nonno. L'inchiostro è fresco.": "Grandpa's handwriting. The ink is fresh.",
  "Quell'autunno mi risparmiarono. Ezekiel disse che la Valle accetta i debiti:":
    'That autumn they spared me. Ezekiel said the Valley accepts debts:',
  '«Uno del tuo sangue, quando sarà il momento.»': '«One of your blood, when the time comes.»',
  'Firmai. Ero giovane. Avevo paura. Volevo vivere.': 'I signed. I was young. I was afraid. I wanted to live.',
  "Ho vissuto cinquant'anni nella Valle Quieta. Ti ho scritto ogni Natale e non ho mai spedito niente. Fino a quest'anno.":
    'I lived fifty years in the Quiet Valley. I wrote to you every Christmas and never sent anything. Until this year.',
  'Le lanterne gialle non proteggono.': "The yellow lanterns don't protect.",
  Segnano: 'They mark',
  'Segnano.': 'They mark.',
  'Il fienile. Di notte. Leggi il registro.': 'The barn. At night. Read the register.',
  'La lanterna si spegne di colpo.': 'The lantern suddenly goes out.',
  'Fuori. Zoccoli. Pesanti, lenti, sempre più vicini.': 'Outside. Hooves. Heavy, slow, closer and closer.',
  'Ma il costume è ancora qui, appeso. Vuoto.': 'But the costume is still here, hanging. Empty.',
  'Allora chi sta cavalcando?': 'Then who is riding?'
});
