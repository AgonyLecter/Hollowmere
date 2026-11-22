'use strict';
// ================= NATURA (3): LA CUCINA =================
// Più di sessanta ricette nuove. Si imparano in tre modi:
//  - da: un abitante te la insegna quando siete amici (3 cuori), come prima;
//  - scopri: da soli — quando hai avuto fra le mani tutti gli ingredienti almeno una volta, ti viene l'idea;
//  - abil: con l'esperienza — arrivando a un livello di un'abilità ([abilità, livello]).
// Alcuni piatti danno anche un effetto (b): passo svelto, meno fatica, raccolta abbondante.

// ic: forma dell'icona e colori (vedi NAT_DISH più sotto) · b: effetto · adv: serve la cucina economica
const NAT_RICETTE = [
  // --- erbe, orto, legumi ---
  {
    id: 'pesto',
    n: 'Pesto',
    need: { basilico: 2, aglio: 1, pinoli: 1, olio: 1 },
    e: 30,
    min: 15,
    scopri: 1,
    d: 'Verde come un prato a giugno.',
    ic: ['vasetto', '#3f8a2a']
  },
  {
    id: 'pastapesto',
    n: 'Pasta al pesto',
    need: { pesto: 1, farina: 1 },
    e: 85,
    min: 30,
    scopri: 1,
    d: 'Il profumo arriva fino in piazza.',
    ic: ['pasta', '#e8d890', '#3f8a2a']
  },
  {
    id: 'bruschetta',
    n: 'Bruschetta',
    need: { pane: 1, pomodoro: 1, olio: 1 },
    e: 45,
    min: 10,
    scopri: 1,
    d: 'Pane, pomodoro, olio. Basta così.',
    ic: ['pane', '#d89a4a', '#d8302a']
  },
  {
    id: 'caponata',
    n: 'Caponata',
    need: { melanzana: 1, sedano: 1, pomodoro: 1, olio: 1 },
    e: 75,
    min: 50,
    da: 'irene',
    d: 'Agrodolce, come i ricordi di Irene.',
    ic: ['piatto', '#7a3a4a', '#d8402a']
  },
  {
    id: 'minestrafave',
    n: 'Minestra di fave',
    need: { fave: 2, cipolla: 1 },
    e: 55,
    min: 40,
    da: 'lucius',
    d: 'La minestra dei giorni di digiuno.',
    ic: ['zuppa', '#a8c060', '#7ab84a']
  },
  {
    id: 'pastaceci',
    n: 'Pasta e ceci',
    need: { ceci: 2, farina: 1, rosmarino: 1 },
    e: 80,
    min: 50,
    da: 'elio',
    d: 'Il pranzo dei pastori.',
    ic: ['pasta', '#e8c890', '#d8b070']
  },
  {
    id: 'zuppalenticchie',
    n: 'Zuppa di lenticchie',
    need: { lenticchie: 2, carota: 1, sedano: 1 },
    e: 75,
    min: 50,
    da: 'ezekiel',
    b: 'fatica',
    d: 'Scalda fino alle ossa. Meno fatica per mezza giornata.',
    ic: ['zuppa', '#8a5a3a', '#e8781a']
  },
  {
    id: 'orzotto',
    n: 'Orzotto ai funghi',
    need: { orzo: 2, funghi: 1 },
    e: 80,
    min: 50,
    adv: 1,
    scopri: 1,
    d: "Come un risotto, ma d'orzo.",
    ic: ['zuppa', '#e8d8b0', '#8a5a3a']
  },
  {
    id: 'zuppaorzo',
    n: "Zuppa d'orzo",
    need: { orzo: 1, fagioli: 1, cavolo: 1 },
    e: 70,
    min: 50,
    da: 'brom',
    b: 'fatica',
    d: 'Mh. Riempie. Meno fatica per mezza giornata.',
    ic: ['zuppa', '#c8b080', '#2f5a4a']
  },
  {
    id: 'insalatacetrioli',
    n: 'Insalata di cetrioli',
    need: { cetriolo: 1, cipolla: 1 },
    e: 30,
    min: 10,
    scopri: 1,
    d: 'Fresca come il fiume.',
    ic: ['piatto', '#8ac060', '#f0f0e0']
  },
  {
    id: 'finocchigratin',
    n: 'Finocchi gratinati',
    need: { finocchio: 2, burro: 1 },
    e: 65,
    min: 50,
    adv: 1,
    da: 'clara',
    d: 'La crosticina è la parte migliore.',
    ic: ['teglia', '#e8d8a0', '#c8a050']
  },
  {
    id: 'carciofimenta',
    n: 'Carciofi alla menta',
    need: { carciofo: 2, menta: 1, olio: 1 },
    e: 75,
    min: 40,
    da: 'irene',
    d: 'Teneri, profumati di menta selvatica.',
    ic: ['piatto', '#6a8a5a', '#5ac87a']
  },
  {
    id: 'involtiniverza',
    n: 'Involtini di verza',
    need: { cavolocap: 1, lenticchie: 1, cipolla: 1 },
    e: 70,
    min: 50,
    adv: 1,
    da: 'agatha',
    d: 'Fagottini verdi, come regali.',
    ic: ['piatto', '#9ac86a', '#8a5a3a']
  },
  {
    id: 'broccoliaglio',
    n: 'Broccoli aglio e olio',
    need: { broccolo: 1, aglio: 1, olio: 1 },
    e: 50,
    min: 20,
    scopri: 1,
    d: "Il verde dell'inverno.",
    ic: ['piatto', '#2f6a3a', '#f2ecdc']
  },
  {
    id: 'erbazzone',
    n: 'Torta di bietole',
    need: { bietola: 2, uovo: 1, farina: 1 },
    e: 85,
    min: 60,
    adv: 1,
    da: 'rina',
    d: 'La torta salata delle contadine.',
    ic: ['torta', '#4a8a3a', '#d8b060']
  },
  {
    id: 'insalatarucola',
    n: 'Rucola, pere e noci',
    need: { rucola: 1, pera: 1, noce: 1 },
    e: 40,
    min: 10,
    scopri: 1,
    d: 'Amaro, dolce, croccante.',
    ic: ['piatto', '#5aa83a', '#c8c83a']
  },
  {
    id: 'brodo',
    n: 'Brodo vegetale',
    need: { sedano: 1, carota: 1, cipolla: 1 },
    e: 40,
    min: 40,
    scopri: 1,
    d: 'La base di tutto.',
    ic: ['zuppa', '#e8c870', '#e8781a']
  },
  {
    id: 'panezafferano',
    n: 'Pane allo zafferano',
    need: { farina: 2, zafferano: 1 },
    e: 75,
    min: 60,
    adv: 1,
    da: 'ada',
    d: 'Giallo come un quadro al tramonto.',
    ic: ['pane', '#f0c030', '#e8402a']
  },
  {
    id: 'topinamburarrosto',
    n: 'Topinambur al rosmarino',
    need: { topinambur: 2, rosmarino: 1 },
    e: 60,
    min: 40,
    adv: 1,
    scopri: 1,
    d: "Croccanti fuori. D'inverno.",
    ic: ['piatto', '#c8945a', '#3a6a4a']
  },
  {
    id: 'cicoriaripassata',
    n: 'Cicoria ripassata',
    need: { cicoria: 1, aglio: 1, olio: 1 },
    e: 40,
    min: 20,
    da: 'teo',
    d: 'Amara e buona. Come la miniera.',
    ic: ['piatto', '#3a6a2a', '#f2ecdc']
  },
  {
    id: 'frittataerbe',
    n: 'Frittata alle erbe',
    need: { uovo: 2, prezzemolo: 1, ortica: 1 },
    e: 55,
    min: 20,
    da: 'mirta',
    d: 'Ogni erba al suo posto.',
    ic: ['frittata', '#f0c43a', '#3f8a2a']
  },
  {
    id: 'zuppaortiche',
    n: 'Zuppa di ortiche',
    need: { ortica: 2, patata: 1 },
    e: 55,
    min: 40,
    da: 'mirta',
    d: 'Pungono crude, curano cotte.',
    ic: ['zuppa', '#4a7a2a', '#e8d8a0']
  },
  {
    id: 'gnocchizucca',
    n: 'Gnocchi di zucca, burro e salvia',
    need: { zucca: 1, farina: 1, burro: 1, salvia: 1 },
    e: 95,
    min: 60,
    adv: 1,
    da: 'clara',
    d: "L'autunno in un piatto.",
    ic: ['pasta', '#f0a040', '#8aa88a']
  },
  {
    id: 'tortacarote',
    n: 'Torta di carote',
    need: { carota: 2, farina: 1, uovo: 1 },
    e: 80,
    min: 60,
    adv: 1,
    scopri: 1,
    d: 'Arancione dentro. Morbida.',
    ic: ['torta', '#e8781a', '#f0e0c0']
  },
  {
    id: 'pastaburrosalvia',
    n: 'Pasta burro e salvia',
    need: { farina: 1, burro: 1, salvia: 1 },
    e: 75,
    min: 25,
    scopri: 1,
    d: 'Tre ingredienti, nessun segreto.',
    ic: ['pasta', '#f0e0a0', '#8aa88a']
  },
  {
    id: 'ratatouille',
    n: 'Verdure della Valle',
    need: { zucchina: 1, melanzana: 1, peperone: 1, pomodoro: 1 },
    e: 90,
    min: 60,
    abil: ['agri', 6],
    d: "Tutto l'orto d'estate in una pentola.",
    ic: ['teglia', '#c8402a', '#3a7a2a']
  },
  {
    id: 'zupparaccolto',
    n: 'Zuppa del raccolto',
    need: { zucca: 1, carota: 1, cipolla: 1, patata: 1 },
    e: 95,
    min: 60,
    abil: ['agri', 4],
    b: 'fatica',
    d: 'Quella delle feste. Meno fatica per mezza giornata.',
    ic: ['zuppa', '#e8902a', '#e8781a']
  },
  {
    id: 'panecereali',
    n: 'Pane ai cereali',
    need: { farina: 1, orzo: 1, girasole: 1 },
    e: 75,
    min: 60,
    adv: 1,
    abil: ['arti', 5],
    d: 'Scuro, pieno di semi.',
    ic: ['pane', '#a87a4a', '#4a3a2a']
  },
  {
    id: 'minestrabosco',
    n: 'Minestra del bosco',
    need: { finferli: 1, castagne: 1, funghi: 1 },
    e: 85,
    min: 50,
    abil: ['racc', 4],
    b: 'raccolta',
    d: 'Il bosco ti riconosce: selvatici abbondanti per mezza giornata.',
    ic: ['zuppa', '#8a5a2a', '#f0b030']
  },
  {
    id: 'insalataselvatica',
    n: 'Insalata selvatica',
    need: { tarassaco: 1, crescione: 1, violette: 1 },
    e: 35,
    min: 10,
    abil: ['racc', 2],
    b: 'passo',
    d: 'Leggera. Passo svelto per mezza giornata.',
    ic: ['piatto', '#6aa83a', '#8a5ad8']
  },
  {
    id: 'finferlipadella',
    n: 'Finferli in padella',
    need: { finferli: 2, prezzemolo: 1, aglio: 1 },
    e: 65,
    min: 25,
    da: 'nora',
    d: 'Nora li cucina sulla riva, col pescato.',
    ic: ['piatto', '#f0b030', '#2f8a2a']
  },
  {
    id: 'spugnoleburro',
    n: 'Spugnole al burro',
    need: { spugnole: 2, burro: 1 },
    e: 80,
    min: 30,
    adv: 1,
    scopri: 1,
    d: 'Il fungo più raro della primavera.',
    ic: ['piatto', '#a8805a', '#f6e08a']
  },
  {
    id: 'tartufopane',
    n: 'Pane e tartufo',
    need: { tartufo: 1, pane: 1, olio: 1 },
    e: 130,
    min: 10,
    da: 'nove',
    b: 'raccolta',
    d: 'Un lusso da re. Nove dice che il bosco ricambia.',
    ic: ['pane', '#d89a4a', '#3a2e28']
  },
  {
    id: 'zuppacrescione',
    n: 'Zuppa di crescione',
    need: { crescione: 2, patata: 1 },
    e: 50,
    min: 40,
    scopri: 1,
    d: 'Verde scuro, sa di fiume.',
    ic: ['zuppa', '#3a8a3a', '#e8d8a0']
  },
  {
    id: 'pestoorsino',
    n: "Pesto d'aglio orsino",
    need: { aglio_orsino: 2, olio: 1, pinoli: 1 },
    e: 30,
    min: 15,
    scopri: 1,
    d: 'Il pesto del bosco di primavera.',
    ic: ['vasetto', '#4aa84a']
  },
  {
    id: 'verzaginepro',
    n: 'Verza al ginepro',
    need: { cavolocap: 1, ginepro: 1 },
    e: 55,
    min: 40,
    da: 'brom',
    d: 'Mh. Sa di bosco.',
    ic: ['piatto', '#9ac86a', '#3a4a7a']
  },
  {
    id: 'favecicoria',
    n: 'Fave e cicoria',
    need: { fave: 1, cicoria: 1, olio: 1 },
    e: 65,
    min: 40,
    da: 'irene',
    d: 'Un piatto povero. Il più buono.',
    ic: ['piatto', '#d8d0a0', '#3a6a2a']
  },
  {
    id: 'panzanella',
    n: 'Panzanella',
    need: { pane: 1, pomodoro: 1, cetriolo: 1, basilico: 1 },
    e: 60,
    min: 15,
    da: 'rina',
    d: 'Il pane di ieri, più buono di oggi.',
    ic: ['piatto', '#d89a4a', '#d8302a']
  },
  {
    id: 'insalatafinocchi',
    n: 'Finocchi e melograno',
    need: { finocchio: 1, melograno: 1 },
    e: 40,
    min: 10,
    scopri: 1,
    d: 'Bianco e rubino.',
    ic: ['piatto', '#eef2d8', '#b8303a']
  },
  {
    id: 'polentafunghi',
    n: 'Polenta e finferli',
    need: { mais: 1, latte: 1, finferli: 1 },
    e: 85,
    min: 60,
    da: 'elio',
    d: 'La polenta degli alpeggi.',
    ic: ['piatto', '#f0c83a', '#f0b030']
  },
  {
    id: 'formaggioerbe',
    n: 'Formaggio alle erbe',
    need: { formaggio: 1, origano: 1 },
    e: 60,
    min: 5,
    da: 'silvio',
    d: 'Silvio lo mangia sul banco, fra i trucioli.',
    ic: ['formaggio', '#f0e8c0', '#5a7a3a']
  },
  // --- forno, dolci, frutta ---
  {
    id: 'focaccia',
    n: 'Focaccia al rosmarino',
    need: { farina: 2, olio: 1, rosmarino: 1 },
    e: 85,
    min: 60,
    adv: 1,
    da: 'bruno',
    d: 'Unta e salata, con i buchi delle dita.',
    ic: ['pane', '#e8c070', '#3a6a4a']
  },
  {
    id: 'tortanonna',
    n: 'Torta della nonna',
    need: { farina: 1, uovo: 2, burro: 1, pinoli: 1 },
    e: 115,
    min: 70,
    adv: 1,
    da: 'agatha',
    b: 'fatica',
    d: 'Crema e pinoli. Meno fatica per mezza giornata.',
    ic: ['torta', '#f0e0a0', '#e8d8b0']
  },
  {
    id: 'strudel',
    n: 'Strudel di mele',
    need: { mela: 2, farina: 1, burro: 1, secco_uva: 1 },
    e: 115,
    min: 70,
    adv: 1,
    da: 'silvio',
    d: 'Come lo fanno sulle montagne di Silvio.',
    ic: ['pane', '#e8c080', '#c8302a']
  },
  {
    id: 'crespelle',
    n: 'Crespelle',
    need: { farina: 1, uovo: 1, latte: 1 },
    e: 55,
    min: 20,
    scopri: 1,
    d: 'Sottili come carta.',
    ic: ['frittata', '#f0dca0', '#e8c070']
  },
  {
    id: 'crespellelamponi',
    n: 'Crespelle ai lamponi',
    need: { lamponi: 2, farina: 1, uovo: 1, latte: 1 },
    e: 90,
    min: 30,
    da: 'lia',
    d: 'Rosa e bianche, come un mazzo di fiori.',
    ic: ['frittata', '#f0dca0', '#e8304a']
  },
  {
    id: 'sorbettolamponi',
    n: 'Sorbetto ai lamponi',
    need: { lamponi: 2, miele: 1 },
    e: 45,
    min: 20,
    scopri: 1,
    b: 'passo',
    d: 'Freddo e svelto. Passo leggero per mezza giornata.',
    ic: ['coppa', '#e8304a']
  },
  {
    id: 'biscottimandorle',
    n: 'Biscotti alle mandorle',
    need: { mandorle: 2, farina: 1, miele: 1 },
    e: 65,
    min: 40,
    adv: 1,
    da: 'gaspare',
    d: 'Croccanti, al profumo di miele.',
    ic: ['biscotti', '#e8c080', '#c8a070']
  },
  {
    id: 'torrone',
    n: 'Torrone',
    need: { mandorle: 2, miele: 2 },
    e: 75,
    min: 50,
    da: 'gaspare',
    d: 'Duro e dolce. Il dolce delle feste.',
    ic: ['torrone', '#f4ecd8', '#c8a070']
  },
  {
    id: 'marmellatagelsi',
    n: 'Marmellata di gelsi',
    need: { gelsi: 2 },
    e: 40,
    min: 40,
    scopri: 1,
    d: 'Viola scuro, quasi nera.',
    ic: ['vasetto', '#4a1a3a']
  },
  {
    id: 'macedonia',
    n: 'Macedonia',
    need: { melograno: 1, mela: 1, menta: 1 },
    e: 45,
    min: 10,
    scopri: 1,
    d: 'Frutta e menta fresca.',
    ic: ['coppa', '#e8a040', '#b8303a']
  },
  {
    id: 'marmellatanespole',
    n: 'Marmellata di nespole',
    need: { nespole: 2 },
    e: 40,
    min: 40,
    scopri: 1,
    d: 'La prima marmellata della primavera.',
    ic: ['vasetto', '#e8a040']
  },
  {
    id: 'cachicucchiaio',
    n: 'Cachi al cucchiaio',
    need: { cachi: 1 },
    e: 35,
    min: 5,
    scopri: 1,
    d: 'Morbidi come una crema.',
    ic: ['coppa', '#f07a1a']
  },
  {
    id: 'caldarrostecasa',
    n: 'Castagne al camino',
    need: { castagne: 3 },
    e: 40,
    min: 20,
    scopri: 1,
    d: 'Nella padella coi buchi.',
    ic: ['piatto', '#7a4a2a', '#f0d8a0']
  },
  {
    id: 'oliveorigano',
    n: "Olive all'origano",
    need: { olive: 2, origano: 1 },
    e: 25,
    min: 5,
    scopri: 1,
    d: "Da mangiare una dopo l'altra.",
    ic: ['coppa', '#4a5a2a', '#5a7a3a']
  },
  {
    id: 'tisanamenta',
    n: 'Tisana alla menta',
    need: { menta: 1 },
    e: 15,
    min: 10,
    scopri: 1,
    b: 'passo',
    d: 'Sveglia le gambe. Passo svelto per mezza giornata.',
    ic: ['tazza', '#8ad8a0']
  },
  {
    id: 'tisanasambuco',
    n: 'Tisana al sambuco',
    need: { sambuco: 1, miele: 1 },
    e: 30,
    min: 10,
    da: 'lucius',
    d: 'Per le notti senza sonno.',
    ic: ['tazza', '#f0e8b0']
  },
  {
    id: 'sciropposambuco',
    n: 'Sciroppo di sambuco',
    need: { sambuco: 2, miele: 1 },
    e: 35,
    min: 30,
    scopri: 1,
    b: 'passo',
    d: 'Dolce e profumato. Passo svelto per mezza giornata.',
    ic: ['bottiglia', '#f0e090']
  },
  {
    id: 'caramelleviola',
    n: 'Caramelle di violetta',
    need: { violette: 1, miele: 1 },
    e: 25,
    min: 20,
    da: 'lia',
    d: 'Viola, piccole, profumate.',
    ic: ['caramelle', '#8a5ad8']
  },
  {
    id: 'teroscanina',
    n: 'Tè di rosa canina',
    need: { cinorrodi: 2 },
    e: 20,
    min: 10,
    scopri: 1,
    b: 'fatica',
    d: 'Aspro. Meno fatica per mezza giornata.',
    ic: ['tazza', '#d8502a']
  },
  {
    id: 'frittelle',
    n: 'Frittelle di sambuco',
    need: { sambuco: 1, farina: 1, uovo: 1 },
    e: 50,
    min: 20,
    da: 'lia',
    d: 'Fiori fritti. Lia le chiama «nuvole».',
    ic: ['biscotti', '#f0d890', '#f4f0d8']
  },
  {
    id: 'confetturacorbezzoli',
    n: 'Confettura di corbezzoli',
    need: { corbezzoli: 2 },
    e: 40,
    min: 40,
    scopri: 1,
    d: 'Rossa e granulosa.',
    ic: ['vasetto', '#e8402a']
  },
  {
    id: 'mielenoci',
    n: 'Miele e noci',
    need: { noce: 1, miele: 1 },
    e: 40,
    min: 5,
    scopri: 1,
    d: 'Lo spuntino dei viandanti.',
    ic: ['coppa', '#e8a830', '#9a7a4a']
  },
  {
    id: 'calendulainsalata',
    n: 'Insalata di fiori',
    need: { lattuga: 1, calendula: 1, viola: 1 },
    e: 40,
    min: 10,
    abil: ['agri', 3],
    d: 'Bella da guardare. Buona da mangiare.',
    ic: ['piatto', '#8ac83a', '#f0902a']
  },
  {
    id: 'focacciauva',
    n: "Schiacciata con l'uva",
    need: { farina: 2, uva: 2, olio: 1 },
    e: 90,
    min: 60,
    adv: 1,
    abil: ['agri', 8],
    d: 'La festa della vendemmia.',
    ic: ['pane', '#e8c070', '#5a3a8a']
  },
  {
    id: 'tortacastagne',
    n: 'Torta di castagne e pinoli',
    need: { castagne: 2, pinoli: 1, miele: 1, farina: 1 },
    e: 100,
    min: 70,
    adv: 1,
    abil: ['racc', 6],
    d: "Il bosco d'autunno, cotto.",
    ic: ['torta', '#7a4a2a', '#e8d8b0']
  },
  // --- la Valle d'inverno e di primavera (aggiunte) ---
  {
    id: 'cotognata',
    n: 'Cotognata',
    need: { cotogne: 2, miele: 1 },
    e: 45,
    min: 60,
    da: 'agatha',
    d: "La merenda d'inverno: si taglia a quadretti e dura fino a primavera.",
    ic: ['torrone', '#e8b040', '#c88a20']
  },
  {
    id: 'ribollita',
    n: 'Ribollita',
    need: { cavolonero: 1, fagioli: 1, pane: 1, cipolla: 1 },
    e: 90,
    min: 60,
    da: 'bruno',
    b: 'fatica',
    d: 'Il pane di ieri, il cavolo di oggi. Meno fatica per mezza giornata.',
    ic: ['zuppa', '#6a5a3a', '#2f4a3a']
  },
  {
    id: 'spaghettiaop',
    n: 'Aglio, olio e peperoncino',
    need: { farina: 1, aglio: 1, olio: 1, peperoncino: 1 },
    e: 70,
    min: 20,
    da: 'teo',
    b: 'passo',
    d: 'La pasta di mezzanotte dei minatori. Passo svelto per mezza giornata.',
    ic: ['pasta', '#e8d890', '#d8201a']
  },
  {
    id: 'tortarabarbaro',
    n: 'Torta di rabarbaro',
    need: { rabarbaro: 2, farina: 1, uovo: 1, miele: 1 },
    e: 95,
    min: 70,
    adv: 1,
    da: 'silvio',
    d: 'Aspra e dolce insieme, come la primavera in montagna.',
    ic: ['torta', '#e8c890', '#c84a5a']
  },
  {
    id: 'patateerba',
    n: "Patate all'erba cipollina",
    need: { patata: 2, erbacipollina: 1, burro: 1 },
    e: 60,
    min: 40,
    da: 'mirta',
    d: 'Mirta ci mette le erbe che le avanzano dal banco.',
    ic: ['teglia', '#e8c870', '#4a9a3a']
  },
  {
    id: 'sciroppoprugnole',
    n: 'Sciroppo di prugnole',
    need: { prugnole: 3, miele: 1 },
    e: 30,
    min: 40,
    da: 'gaspare',
    d: 'Viola scuro, dolce e aspro. Gaspare dice che fa bene alla voce.',
    ic: ['bottiglia', '#3a3a6a']
  },
  {
    id: 'polentachiodini',
    n: 'Polenta e chiodini',
    need: { mais: 1, latte: 1, chiodini: 2 },
    e: 85,
    min: 50,
    da: 'elio',
    b: 'raccolta',
    d: 'La cena dei pastori in autunno. Selvatici abbondanti per mezza giornata.',
    ic: ['piatto', '#f0c840', '#c89a4a']
  },
  {
    id: 'tisanaiperico',
    n: "Tisana d'iperico",
    need: { iperico: 2, miele: 1 },
    e: 25,
    min: 15,
    da: 'lucius',
    d: 'La notte di San Giovanni la si beve per non sognare il bosco.',
    ic: ['tazza', '#e8b030']
  },
  {
    id: 'insalataprimule',
    n: 'Insalata di primule',
    need: { primule: 1, lattuga: 1, uovo: 1 },
    e: 40,
    min: 10,
    da: 'lia',
    d: 'Lia dice che i fiori si mangiano solo quando nessuno li ha visti.',
    ic: ['piatto', '#7ab84a', '#f0e070']
  },
  {
    id: 'trotaerbe',
    n: "Trota all'erba cipollina",
    need: { trota: 1, erbacipollina: 1, burro: 1 },
    e: 80,
    min: 30,
    da: 'nora',
    d: 'Nora la cuoce sulla pietra calda, in riva al fiume.',
    ic: ['piatto', '#c8a080', '#4a9a3a']
  },
  {
    id: 'orzottoradicchio',
    n: 'Orzotto al radicchio',
    need: { orzo: 2, radicchio: 1, formaggio: 1 },
    e: 90,
    min: 50,
    adv: 1,
    da: 'clara',
    d: 'Clara lo faceva in città, col riso. Qui il riso non c’è.',
    ic: ['zuppa', '#e8d8b0', '#8a2a3a']
  },
  {
    id: 'frittatabruscandoli',
    n: 'Frittata di bruscandoli',
    need: { bruscandoli: 2, uovo: 2 },
    e: 60,
    min: 20,
    scopri: 1,
    d: 'Amarognola, verde, di primavera.',
    ic: ['frittata', '#f0d060', '#6aa84a']
  },
  {
    id: 'pastinacheforno',
    n: 'Pastinache al forno',
    need: { pastinaca: 2, rosmarino: 1, olio: 1 },
    e: 65,
    min: 50,
    adv: 1,
    scopri: 1,
    d: "Dolci e croccanti fuori. Il profumo del rosmarino d'inverno.",
    ic: ['teglia', '#efe6c4', '#3a6a4a']
  },
  {
    id: 'fagioliniaglio',
    n: "Fagiolini all'aglio",
    need: { fagiolini: 2, aglio: 1, olio: 1 },
    e: 45,
    min: 20,
    scopri: 1,
    d: 'Verdi, lucidi, svelti.',
    ic: ['piatto', '#5aa83a', '#f0f0e0']
  },
  {
    id: 'radicchiobrace',
    n: 'Radicchio alla brace',
    need: { radicchio: 2, olio: 1 },
    e: 40,
    min: 15,
    scopri: 1,
    d: 'Amaro e dolce, con le righe nere della griglia.',
    ic: ['piatto', '#8a2a3a', '#3a2a2a']
  },
  {
    id: 'gelatinasorbe',
    n: 'Gelatina di sorbe',
    need: { sorbe: 3, miele: 1 },
    e: 35,
    min: 40,
    scopri: 1,
    d: 'Aspra. Dicono che tenga lontani i brutti sogni.',
    ic: ['vasetto', '#d8702a']
  },
  {
    id: 'vellutatapastinaca',
    n: 'Vellutata di pastinaca',
    need: { pastinaca: 2, latte: 1, burro: 1 },
    e: 75,
    min: 40,
    abil: ['agri', 7],
    d: 'Liscia come la neve fresca.',
    ic: ['zuppa', '#f0e8c8', '#e8d8a0']
  }
];
for (const r of NAT_RICETTE) {
  ITEMS[r.id] = { n: r.n, t: 'food', e: r.e, d: `${r.d} +${r.e} energia.` };
  const c = { id: r.id, need: r.need, min: r.min };
  for (const k of ['adv', 'da', 'scopri', 'abil', 'b']) if (r[k]) c[k] = r[k];
  COOK.push(c);
}
// i gusti degli abitanti per i piatti nuovi
{
  const ama = (id, L) => Object.assign((LIKES[id] = LIKES[id] || {}), L);
  ama('ezekiel', { zuppalenticchie: 3, brodo: 2, finocchio: 1 });
  ama('agatha', { tortanonna: 3, involtiniverza: 3, torrone: 2, cachi: 2 });
  ama('lucius', { minestrafave: 3, tisanasambuco: 3, pane: 1, sambuco: 2 });
  ama('clara', { gnocchizucca: 3, finocchigratin: 3, crespellelamponi: 2, calendula: 2 });
  ama('brom', { zuppaorzo: 3, verzaginepro: 3, focaccia: 2, caldarroste: 2 });
  ama('tobia', { caramelleviola: 3, sorbettolamponi: 3, cachicucchiaio: 2, lamponi: 2 });
  ama('ottavio', { bruschetta: 3, pastapesto: 3, olio: 1 });
  ama('irene', { caponata: 3, carciofimenta: 3, favecicoria: 2, violette: 2 });
  // la Valle d'inverno e di primavera
  ama('agatha', { cotognata: 3, vischio: 2 });
  ama('lucius', { tisanaiperico: 3, iperico: 2 });
  ama('clara', { orzottoradicchio: 3, primule: 2 });
  ama('brom', { ribollita: 2, pastinacheforno: 2 });
  ama('tobia', { sciroppoprugnole: 3, tortarabarbaro: 2 });
  ama('ezekiel', { vischio: 3, sorbe: 2, gelatinasorbe: 2 });
  ama('ottavio', { spaghettiaop: 3 });
  ama('irene', { radicchiobrace: 2, cotogne: 1 });
}

// ---------- effetti dei piatti ----------
const NAT_BUFF = {
  passo: { n: 'Passo svelto', d: 'cammini più svelto' },
  fatica: { n: 'Meno fatica', d: 'zappare, abbattere e scavare costano metà energia' },
  raccolta: { n: 'Raccolta abbondante', d: 'i selvatici a volte sono doppi' }
};
const NAT_BUFF_MIN = 6 * 60; // mezza giornata
function buffOn(k) {
  const st = G.st,
    b = st && st.free && st.free.buff;
  return !!(b && b.k === k && st.day * 1440 + st.time < b.fino);
}
Ext.on('mangia', id => {
  try {
    const r = COOK.find(x => x.id === id),
      st = G.st;
    if (!r || !r.b || !st.free) return;
    st.free.buff = { k: r.b, fino: st.day * 1440 + st.time + NAT_BUFF_MIN };
    UI.toast(`✦ ${NAT_BUFF[r.b].n}: ${NAT_BUFF[r.b].d}, per mezza giornata.`);
  } catch (e) {
    console.error(e);
  }
});

// ---------- imparare da soli ----------
// «visti»: tutto quello che hai avuto fra le mani almeno una volta nella Valle
function natVisti(st) {
  st = st || G.st;
  return (st.free.visti = st.free.visti || {});
}
function natImpara(st) {
  const V = natVisti(st);
  for (const r of COOK) {
    if (knows(st, r.id)) continue;
    if (r.scopri && Object.keys(r.need).every(k => V[k])) {
      learnRecipe(r.id);
      UI.toast(`💡 Ti è venuta un'idea: ${ITEMS[r.id].n}!`);
    } else if (r.abil && skLv(r.abil[0], st) >= r.abil[1]) learnRecipe(r.id, "con l'esperienza");
  }
}
Ext.on('ottieni', id => {
  try {
    const st = G.st;
    if (!st || !isFree(st) || !st.free) return;
    const V = natVisti(st);
    if (V[id]) return;
    V[id] = st.day;
    natImpara(st);
  } catch (e) {
    console.error(e);
  }
});
Ext.on('freeMorning', st => {
  try {
    if (!st.free) return;
    const V = natVisti(st);
    for (const s of st.inv) if (s && !V[s.id]) V[s.id] = st.day;
    natImpara(st);
  } catch (e) {
    console.error(e);
  }
});
// come si impara una ricetta che non conosci ancora (per il ricettario)
function natComeSiImpara(r) {
  if (r.da)
    return `la insegna ${NAMES[r.da] || r.da}${r.da === 'ottavio' ? ' (la vende)' : ', quando sarete amici'}`;
  if (r.scopri) {
    const V = (G.st && G.st.free && G.st.free.visti) || {},
      n = Object.keys(r.need).filter(k => V[k]).length;
    return `la scoprirai da sol${fmt('{o|a}')}, raccogliendo e coltivando (ingredienti trovati: ${n}/${Object.keys(r.need).length})`;
  }
  if (r.abil) return `si impara con ${SKILLS[r.abil[0]].n} al livello ${r.abil[1]}`;
  return '';
}

// ---------- disegni dei piatti ----------
const NAT_DISH = (() => {
  const I = () => new MK2(32, 32);
  const R = h => R6b(h);
  const dots = (P, c, n = 6, cx = 16, cy = 18, rx = 7, ry = 3) => {
    for (let i = 0; i < n; i++) {
      const a = i * 2.39;
      paint2(
        P,
        I().ell(
          cx + Math.cos(a) * rx * ((i % 3) / 3 + 0.3),
          cy + Math.sin(a) * ry * ((i % 3) / 3 + 0.3),
          1.3,
          1.1
        ),
        R(c),
        { thin: 1, nc: 1 }
      );
    }
  };
  const plate = P => {
    paint2(P, I().ell(16, 21, 14.5, 7), R('#f2ece0'), { thin: 1 });
    paint2(P, I().ell(16, 20.5, 11, 5), R('#f2ece0'), { flat: 1, nc: 1, base: 4 });
  };
  const bowl = (P, c) => {
    paint2(
      P,
      I().ell(16, 17, 12.5, 10.5, (X, Y) => Y >= 17),
      R('#c87a4a')
    );
    paint2(P, I().ell(16, 17, 12.5, 3.8), R('#c87a4a'), { base: 4, thin: 1 });
    paint2(P, I().ell(16, 17, 10.5, 2.8), R(c), { thin: 1, nc: 1 });
  };
  const steam = P => {
    for (const [x0, ph] of [
      [11, 0],
      [16, 2],
      [21, 1]
    ])
      for (let y = 2; y < 9; y++)
        P.set(x0 + Math.round(Math.sin(y * 0.9 + ph)), y, C('#ffffff'), y < 4 ? 70 : 130);
  };
  return {
    zuppa: (c, d) => P => {
      bowl(P, c);
      dots(P, d, 5, 16, 17, 6, 1.6);
      steam(P);
    },
    pasta: (c, d) => P => {
      bowl(P, c);
      for (let i = 0; i < 6; i++)
        paint2(P, I().rot(10 + i * 2.4, 16 + (i % 2), 3, 0.8, i % 2 ? 0.6 : -0.6), R(c), { thin: 1 });
      dots(P, d, 5, 16, 16, 6, 1.4);
      steam(P);
    },
    piatto: (c, d) => P => {
      plate(P);
      paint2(P, I().ell(16, 19, 8, 4), R(c), { mod: (X, Y, t) => ((X * 3 + Y) % 5 === 0 ? t - 1 : t) });
      dots(P, d, 5, 16, 18, 6, 2.5);
    },
    frittata: (c, d) => P => {
      plate(P);
      paint2(P, I().ell(16, 19, 9, 4.5), R(c));
      dots(P, d, 5, 16, 19, 6, 2.6);
    },
    teglia: (c, d) => P => {
      paint2(P, I().rect(4, 13, 24, 13), R('#e8e0d0'));
      paint2(P, I().rect(6, 14, 20, 9), R(c), {
        nc: 1,
        mod: (X, Y, t) => ((X * 7 + Y * 3) % 6 === 0 ? t - 1 : t)
      });
      dots(P, d, 6, 16, 18, 8, 3);
    },
    torta: (c, d) => P => {
      paint2(P, I().ell(16, 20, 14, 8), R('#d8984a'));
      paint2(P, I().ell(16, 18.5, 11, 5.5), R(c), { nc: 1 });
      dots(P, d, 6, 16, 18, 7, 3);
    },
    pane: (c, d) => P => {
      paint2(P, I().ell(16, 19, 13, 7.5), R(c), { mod: (X, Y, t) => (Y < 15 ? t + 1 : t) });
      for (const x of [10, 16, 22])
        paint2(P, I().rot(x, 16, 2.6, 0.7, 0.5), R(shade(c, -0.3)), { thin: 1, nc: 1 });
      dots(P, d, 4, 16, 17, 8, 3);
    },
    vasetto: c => P => {
      paint2(P, I().rect(9, 9, 14, 19), R(c), { mod: (X, Y, t) => (X < 11 ? t + 1 : t) });
      paint2(P, I().rect(8, 5, 16, 5), R('#d8c8a8'), { mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t) });
      paint2(P, I().rect(11, 15, 10, 7), R('#f4ecd8'), { thin: 1, nc: 1 });
    },
    coppa: (c, d) => P => {
      paint2(P, I().rect(14, 22, 4, 6), R('#d8ecf4'), { thin: 1 });
      paint2(P, I().rect(10, 27, 12, 2), R('#d8ecf4'), { thin: 1 });
      paint2(
        P,
        I().ell(16, 15, 11, 8, (X, Y) => Y >= 13),
        R('#d8ecf4')
      );
      paint2(P, I().ell(16, 13, 9, 5), R(c), { mod: (X, Y, t) => ((X + Y) % 4 === 0 ? t + 1 : t) });
      if (d) dots(P, d, 4, 16, 12, 6, 2);
    },
    tazza: c => P => {
      paint2(P, I().rect(8, 12, 15, 14), R('#f2ece0'), { mod: (X, Y, t) => (X < 10 ? t + 1 : t) });
      paint2(P, I().ell(26, 18, 4, 4), R('#f2ece0'), { thin: 1 });
      paint2(P, I().ell(26, 18, 2, 2), R('#7a9a5a'), { flat: 1, nc: 1 });
      paint2(P, I().ell(15.5, 12, 7, 2), R(c), { thin: 1, nc: 1 });
      steam(P);
    },
    bottiglia: c => P => {
      paint2(P, I().rect(10, 12, 12, 17), R(c), { mod: (X, Y, t) => (X < 13 ? t + 2 : t) });
      paint2(P, I().rect(13, 4, 6, 8), R('#e8f0f4'), { thin: 1 });
      paint2(P, I().rect(13, 2, 6, 3), R('#8a5a32'), { thin: 1 });
      paint2(P, I().rect(11, 17, 10, 6), R('#f4ecd8'), { thin: 1, nc: 1 });
    },
    biscotti: (c, d) => P => {
      plate(P);
      for (const [x, y] of [
        [10, 17],
        [16, 19],
        [22, 17],
        [13, 14],
        [19, 14]
      ]) {
        paint2(P, I().ell(x, y, 4, 2.6), R(c));
        P.set(x, y, C(d));
      }
    },
    torrone: (c, d) => P => {
      for (const [x, y] of [
        [9, 12],
        [15, 17],
        [21, 22]
      ]) {
        paint2(P, I().rect(x - 5, y - 3, 12, 7), R(c), { mod: (X, Y, t) => (Y < y - 1 ? t + 1 : t) });
        for (let i = 0; i < 3; i++) P.set(x - 2 + i * 3, y, C(d));
      }
    },
    caramelle: c => P => {
      for (const [x, y] of [
        [10, 12],
        [20, 14],
        [14, 21],
        [23, 23]
      ]) {
        paint2(P, I().ell(x, y, 3.4, 3), R(c));
        paint2(
          P,
          I().poly([
            [x - 7, y - 2],
            [x - 3, y],
            [x - 7, y + 2]
          ]),
          R('#f4ecd8'),
          { thin: 1 }
        );
        paint2(
          P,
          I().poly([
            [x + 7, y - 2],
            [x + 3, y],
            [x + 7, y + 2]
          ]),
          R('#f4ecd8'),
          { thin: 1 }
        );
      }
    },
    formaggio: (c, d) => P => {
      plate(P);
      paint2(
        P,
        I().poly([
          [7, 20],
          [24, 12],
          [25, 20]
        ]),
        R(c),
        { mod: (X, Y, t) => (Y < 15 ? t + 1 : t) }
      );
      dots(P, d, 4, 18, 13, 5, 1.6);
    }
  };
})();
Ext.on('arte', () => {
  try {
    for (const r of NAT_RICETTE) {
      const [k, a, b] = r.ic;
      ICON[r.id] = icon32(NAT_DISH[k](a, b));
    }
  } catch (e) {
    console.error(e);
  }
});
// il pane fatto in casa si impara da sé, la prima volta che si ha la farina (anche dal mulino, in costruire.js)
{
  const pc = COOK.find(r => r.id === 'panecasa');
  if (pc) pc.scopri = 1;
}
