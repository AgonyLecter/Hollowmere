'use strict';
// ================= LA WIKI DEL GIOCO =================
// La wiki si costruisce dal vivo con gli stessi dati del gioco (ITEMS, CROPS, COOK, CRAFTS, ANIMALS, RES_POOL,
// SECRETS, EGGS…): ogni oggetto, ricetta, coltura, animale o abitante aggiunto compare da solo, con la sua icona.
// È privata: si apre solo con la chiave nell'indirizzo (vedi in fondo); «Salva PDF» la stampa.
// Per arricchirla scrivendo solo i dati: «dove:» negli easter egg (EGGS, EGG_EXTRA) dice dove si trovano.
const Wiki = {
  // i dati del gioco, nella forma che usa la pagina
  dati() {
    if (typeof genCostrArt === 'function' && !AIMG.serra && PX.prototype.line) genCostrArt();
    if (typeof genEspArt === 'function' && !IMG.torre && PX.prototype.line) genEspArt();
    if (typeof genSempreArt === 'function' && !IMG.museo) genSempreArt();
    const url = c => {
      try {
        return c && c.toDataURL ? c.toDataURL() : null;
      } catch (e) {
        return null;
      }
    };
    const prima = v => (Array.isArray(v) ? v[0] : v);
    const D = {
      ITEMS,
      CROPS,
      COOK,
      CRAFTS,
      ANIMALS,
      MILL,
      MERC_STOCK,
      RES_POOL,
      WILD,
      FISH,
      FRUIT,
      BOTTEGA,
      DECOR_SHOP,
      TELAIO,
      FESTE,
      LIKES,
      DISLIKES,
      BDAY,
      RANKS,
      RANK_GIFTS,
      HOUSE_UP,
      FUNC,
      FUNC_UP,
      UPG,
      SK_PERK,
      SKILLS,
      SK_XP,
      EGGS,
      EGG_EXTRA,
      NAMES,
      BASE_RECIPES,
      SECRETS,
      FREE_SECRETS,
      VOCI,
      RICORDI,
      NOVE_SHOP,
      NOVE_L,
      ZONES,
      CRAFT_CAT,
      STAZIONI,
      SEASON_LEN,
      CHORES,
      JUICY,
      TRAG
    };
    D.icons = {};
    for (const k of Object.keys(ICON)) D.icons[k] = url(ICON[k]);
    D.portraits = {};
    for (const id of Object.keys(NAMES))
      if (LOOKS[id])
        try {
          D.portraits[id] = url(portrait(id, ''));
        } catch (e) {}
    D.big = {};
    for (const k of Object.keys(AIMG)) D.big[k] = url(prima(AIMG[k]));
    D.crit = {};
    for (const k of Object.keys(CRIT)) D.crit[k] = url(prima(CRIT[k]));
    D.animalImg = {};
    for (const k of Object.keys(ANIMALS))
      D.animalImg[k] = D.big[k] || (k === 'gallina' ? D.crit.chicken : null) || D.icons[ANIMALS[k].prod];
    D.COLL_L = Object.fromEntries(Object.entries(COLL).map(([k, v]) => [v.n || k, v.l()]));
    D.ore = [5, 15, 30, 45].map(f => oreTable(f));
    D.FAUNA = typeof FAUNA !== 'undefined' ? FAUNA : {};
    D.faunaIc = {};
    for (const k of Object.keys(D.FAUNA))
      D.faunaIc[k] = typeof FAUNA_IMG !== 'undefined' && FAUNA_IMG[k] ? url(FAUNA_IMG[k].icona) : null;
    D.SKILLS = SKILLS;
    // personaggi che non sono né del villaggio né abitanti nuovi: compaiono in «Altri personaggi»
    const noti = new Set([
      'ezekiel',
      'agatha',
      'lucius',
      'clara',
      'brom',
      'tobia',
      'ottavio',
      'irene',
      'nove',
      'faceless',
      'voce',
      'cocchiere',
      'coro',
      'nonnovoce',
      'elias',
      'padre',
      'mercante',
      ...RES_POOL.map(r => r.id)
    ]);
    D.altri = NPC_DEF.map(d => d[0]).filter((id, i, a) => a.indexOf(id) === i && !noti.has(id) && LOOKS[id]);
    return D;
  },
  // la pagina intera (HTML)
  pagina(o = {}) {
    const D = this.dati();
    const I = D.ITEMS;
    const N = D.NAMES;
    const S = ['Autunno', 'Inverno', 'Primavera', 'Estate'];
    const SICO = ['🍂', '❄', '🌱', '☀'];
    const esc = s =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // testi del gioco: {o|a} → o/a, {n} → il tuo nome
    const T = s =>
      esc(
        String(s ?? '')
          .replace(/\{n\}/g, 'forestiero')
          .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, '$1/$2')
      );
    const ic = (id, sz = 24) =>
      D.icons[id] ? `<img class="px" src="${D.icons[id]}" width="${sz}" height="${sz}" alt="">` : '';
    const nm = id => (I[id] ? I[id].n : id);
    const it = (id, q) => `<span class="it">${ic(id, 18)}${q ? q + '× ' : ''}${esc(nm(id))}</span>`;
    const list = obj =>
      Object.entries(obj)
        .map(([k, q]) => it(k, q))
        .join(' ');
    const seas = a => (a || []).map(i => `<span class="s s${i}">${SICO[i]} ${S[i]}</span>`).join(' ');
    const sc = v => (v == null ? '—' : v.toLocaleString('it-IT'));
    const who = id => esc(N[id] || id);
    const por = (id, sz = 64) =>
      D.portraits[id]
        ? `<img class="px por" src="${D.portraits[id]}" width="${sz}" height="${sz}" alt="">`
        : '';
    const big = (src, h = 56) => (src ? `<img class="px" src="${src}" height="${h}" alt="">` : '');

    const sezioni = [];
    const sez = (id, titolo, html, sotto = '') => sezioni.push({ id, titolo, html, sotto });

    // ---------------- dati derivati ----------------
    const COOK = D.COOK;
    const CROPS = D.CROPS;
    const seedP = id => (I['s_' + id] ? I['s_' + id].p : null);
    const RES = Object.fromEntries(D.RES_POOL.map(r => [r.id, r]));
    const RES_F = new Set(['nora', 'lia', 'mirta', 'ada', 'rina']);
    const teaches = id => COOK.filter(r => r.da === id);
    const fruitTree = Object.fromEntries(
      Object.entries(I)
        .filter(([, v]) => v.tree)
        .map(([k, v]) => [v.tree, k])
    );
    const wildSeason = id =>
      Object.entries(D.WILD)
        .filter(([, l]) => l.includes(id))
        .map(([s]) => +s);

    // dove si trova ogni oggetto (per la scheda oggetti)
    const fonti = {};
    const F = (k, t) => (fonti[k] = fonti[k] || new Set()).add(t);
    for (const [k, v] of Object.entries(I)) if (v.t === 'seed') F(k, 'Agatha (in stagione)');
    for (const k of D.MERC_STOCK) F(k, 'carro del cocchiere');
    for (const r of D.RES_POOL) for (const [x] of r.shop) F(x, 'bottega di ' + N[r.id].split(' ')[0]);
    for (const [x] of D.DECOR_SHOP) F(x, 'arredi di Agatha');
    for (const f of Object.values(D.FESTE)) for (const [x] of f.shop) F(x, f.n);
    for (const [x] of D.NOVE_SHOP) F(x, 'Nove');
    for (const k of Object.keys(CROPS)) F(k, 'orto');
    for (const [s, l] of Object.entries(D.WILD)) for (const x of l) F(x, 'raccolta selvatica');
    for (const [f, t] of Object.entries(fruitTree)) F(f, 'albero da frutto');
    for (const a of Object.values(D.ANIMALS)) F(a.prod, 'animali: ' + a.pl);
    for (const l of Object.values(D.FISH)) for (const x of l) F(x[0], 'pesca');
    for (const t of D.ore) for (const [x] of t) F(x, 'miniera');
    F('essenza', 'miniera (Ombre scacciate)');
    F('stella', 'stelle cadenti');
    for (const k of Object.keys(I)) {
      if (k.startsWith('cons_')) F(k, 'barattolo');
      if (k.startsWith('succo_')) F(k, 'botte');
    }
    F('lingotto', 'fornace (5 ferro)');
    F('farina', 'mulino');
    F('miele', 'apiario');
    for (const c of D.CRAFTS) F(c.id, D.STAZIONI.incudine.cats[c.cat] ? 'incudine' : 'banco da lavoro');
    for (const c of COOK) F(c.id, 'cucina');
    F('legna', 'alberi, rami');
    F('pietra', 'rocce, sassi');
    F('fibra', 'erbacce');
    F('uovo', 'galline');
    F('pane', 'Agatha');
    F('concime', 'Agatha');

    // ---------------- 1. Benvenuti ----------------
    sez(
      'intro',
      'Benvenuti a Hollowmere',
      `
    <p class="lead">Hollowmere — <i>La Valle Quieta</i> — è un gioco di fattoria in pixel art con un cuore horror. Erediti la fattoria del nonno Elias in una valle dove la gente è gentile, l'aria profuma di mele e le zucche crescono grandi come carrozze. E dove, alla campana delle nove, tutti tornano a casa e non aprono a nessuno.</p>
    <div class="cols2">
    <div class="box"><h4>La Storia</h4><p>Quattro capitoli, dall'arrivo in autunno alla Festa del Raccolto. Le tue scelte, le amicizie e gli oggetti che trovi decidono quale dei <b>tre finali</b> vedrai.</p></div>
    <div class="box"><h4>La Valle</h4><p>Dopo un finale si apre il gioco libero, senza fine: stagioni da ${D.SEASON_LEN} giorni, orto, animali, pesca, miniera senza fondo, costruzioni, nuovi abitanti, feste e segreti.</p></div>
    </div>
    <h3>Il gioco in numeri</h3>
    <div class="stats">
    ${[
      [Object.keys(CROPS).length, 'colture'],
      [Object.keys(D.FRUIT).length, 'alberi da frutto'],
      [
        Object.values(D.WILD)
          .flat()
          .filter((x, i, a) => a.indexOf(x) === i).length,
        'piante selvatiche'
      ],
      [Object.keys(D.ANIMALS).length, 'animali da fattoria'],
      [7, 'pesci'],
      [COOK.length, 'ricette'],
      [D.CRAFTS.length, 'cose da costruire'],
      [Object.keys(N).length - 6, 'personaggi'],
      [Object.keys(D.EGGS).length + Object.keys(D.EGG_EXTRA).length, 'cose nascoste'],
      [3, 'finali']
    ]
      .map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`)
      .join('')}
    </div>
    <h3>Come leggere questa wiki</h3>
    <p>Le sezioni <b>Lore</b>, <b>Storia e finali</b>, <b>Confidenze</b> e <b>Cose nascoste</b> contengono <span class="spoil">SPOILER</span>: sono segnate con una fascia rossa. Tutto il resto (orto, ricette, costruzioni, personaggi…) si può leggere senza rovinarsi niente.</p>
    <p class="small">I dati, i prezzi e le icone di questa wiki sono presi direttamente dal codice del gioco. Prezzi in scudi.</p>
    `
    );

    // ---------------- 2. Le basi ----------------
    sez(
      'basi',
      'Le basi',
      `
    <h3>Il tempo</h3>
    <p>Un anno ha quattro stagioni da ${D.SEASON_LEN} giorni, in quest'ordine: ${seas([0, 1, 2, 3])}. La storia comincia il <b>Giorno 1 d'autunno</b>. Ogni coltura cresce solo nelle sue stagioni: al cambio di stagione le piante fuori stagione seccano (tranne dentro la serra).</p>
    <h3>Le Regole della Valle</h3>
    <div class="rules"><p><b>I.</b> Il rosso è il colore cattivo: va seppellito.</p><p><b>II.</b> Non si oltrepassa il recinto giallo.</p><p><b>III.</b> Alla campana delle nove si torna a casa e non si apre a nessuno.</p></div>
    <h3>Energia</h3>
    <p>Zappare, abbattere, scavare e pescare consumano energia. I piatti la ridanno: più la ricetta è elaborata, più energia. Il pane di Clara dà +30, la torta di zucca +75.</p>
    <h3>Vendere</h3>
    <p>Nella <b>cassetta</b> della fattoria si spediscono raccolti, frutta, uova, latte, pesci e minerali: i soldi arrivano la mattina dopo. Se vendi molti pezzi dello stesso prodotto il prezzo scende (mai sotto il 40%), e la mattina dopo risale. Ogni mattina <b>tre prodotti</b> sono richiesti e valgono di più. <b>Ottavio</b> il postino paga subito il 20% in più; <b>Nora</b> compra il pesce al 30% in più.</p>
    <h3>Amicizia</h3>
    <p>Parlare ogni giorno e fare regali fa crescere i cuori (fino a 10). Ogni abitante ha regali che <b>ama</b>, che gli <b>piacciono</b>, che <b>gradisce</b> e che <b>detesta</b> (vedi <i>Personaggi</i>). Nel giorno del compleanno un regalo vale il doppio. Con 3 cuori gli abitanti ti insegnano le loro ricette; con più cuori ti raccontano i loro segreti.</p>
    <h3>Le abilità (Valle)</h3>
    <table><tr><th>Abilità</th><th>Livelli e premi</th></tr>
    ${Object.entries(D.SKILLS)
      .map(
        ([k, s]) =>
          `<tr><td><b>${s.ico} ${esc(s.n)}</b></td><td>${Object.entries(D.SK_PERK[k])
            .map(([l, t]) => `<b>Liv. ${l}</b>: ${esc(t)}`)
            .join('<br>')}</td></tr>`
      )
      .join('')}
    </table>
    <p class="small">Punti esperienza per livello: ${D.SK_XP.join(' · ')}.</p>
    <h3>Attrezzi</h3>
    <table><tr><th></th><th>Attrezzo</th><th>A cosa serve</th><th>Dove</th></tr>
    ${['hoe', 'can', 'accetta', 'piccone', 'pala', 'canna', 'attrezzi_oro']
      .map(
        k =>
          `<tr><td>${ic(k)}</td><td><b>${esc(nm(k))}</b></td><td>${esc(I[k].d || '')}</td><td class="small">${
            {
              hoe: "dall'inizio",
              can: "dall'inizio",
              accetta: 'nella Valle',
              piccone: 'nella Valle',
              pala: 'arredi di Agatha (150)',
              canna: 'bottega di Nora (250)',
              attrezzi_oro: 'banco: 2 oro + 2 lingotti'
            }[k]
          }</td></tr>`
      )
      .join('')}
    <tr><td></td><td><b>${esc(D.UPG.hoe.n)}</b></td><td>${esc(D.UPG.hoe.d)}</td><td class="small">${D.UPG.hoe.cost} scudi</td></tr>
    <tr><td></td><td><b>${esc(D.UPG.can.n)}</b></td><td>${esc(D.UPG.can.d)}</td><td class="small">${D.UPG.can.cost} scudi</td></tr>
    </table>
    `
    );

    // ---------------- 3. Lore ----------------
    sez(
      'lore',
      'Lore: la storia della Valle',
      `
    <p class="lead">Ciò che si scopre giocando, messo in ordine. Leggilo solo se hai finito la storia.</p>
    <h3>Il patto</h3>
    <p>Circa due secoli fa i <b>fondatori</b> fuggirono dal mondo di fuori, «da qualcosa di cui nessuno ha mai chiesto». Nel cuore del bosco trovarono un <b>Albero</b> e fecero un patto: la Valle sarebbe rimasta quieta e nascosta; in cambio, a ogni generazione, l'Albero prende un forestiero. Uno solo. «È il prezzo della pace.»</p>
    <p>Il <b>costume del Cavaliere</b> — mantello, trampoli con zoccoli veri, sciabola di latta — lo costruirono gli Anziani dopo, per spaventare chi voleva andarsene. «Un Cavaliere senza testa tiene tutti dentro meglio di qualsiasi recinto.» A volte Tobia lo indossa per gioco. Ma il Cavaliere vero non è un costume.</p>
    <h3>L'Albero dei Morti</h3>
    <p>Immenso, contorto, nero, con radici rosse come ferite aperte. Fra le radici ci sono le <b>teste dei Contati</b>, che sussurrano. Legato al tronco con le radici c'è un corpo seduto, in un mantello nero, senza testa: è il corpo di <b>Elias Marlowe</b>. Il Cavaliere è lui. Elias «non fu risparmiato: fu rimandato».</p>
    <p>Il rosso è l'unico colore che l'Albero teme: per questo la regola dice di seppellirlo, per questo il fienile di Ezekiel è rosso, e per questo un <b>nastro rosso</b> fa ritrarre le radici.</p>
    <h3>Il Registro dei Nuovi Arrivati</h3>
    <table class="reg"><tr><th>Anno</th><th>Nome</th><th>Esito</th></tr>
    <tr><td>1712</td><td>Josiah Wren</td><td>Contato.</td></tr>
    <tr><td>1748</td><td>Mercy Hale</td><td>Contata.</td></tr>
    <tr><td>1781</td><td>Thomas Ashby</td><td>Contato due volte.</td></tr>
    <tr><td>1799</td><td>Ezra Blackwood</td><td>Contato.</td></tr>
    <tr><td>1846</td><td><b>Elias Marlowe</b></td><td><b>RISPARMIATO.</b> Debito: uno del suo sangue.</td></tr>
    <tr><td>18··</td><td><s>un nome grattato via</s></td><td>Contato. Lascia una figlia.</td></tr>
    <tr><td>Quest'anno</td><td><b>Tu</b>, nipote di E. Marlowe</td><td>Arrivato. Contato. <b>Destinato al Raccolto.</b></td></tr>
    </table>
    <p class="small">Nel gioco online, sotto, compaiono a volte i nomi di altri giocatori «contati».</p>
    <h3>Elias Marlowe, il nonno</h3>
    <p>Arrivò nel 1846. Incise «E.M. + A.C. — 1849» sulla corteccia di un albero vicino al fiume con Agatha Crane, a cui chiese di andare via con lui. Fu l'unico forestiero a fermarsi a ringraziarla. Fu «risparmiato» in cambio di una promessa: <i>uno del tuo sangue, quando sarà il momento</i>. Andò fuori, ebbe una famiglia, e alla sua morte la lettera arrivò a te: «Vai a viverci. Coltiva. Sii felice. Rispetta le loro regole» — e in fondo, cancellato, <i>non venire</i>.</p>
    <h3>Il Senza Volto, l'ottavo</h3>
    <p>Al Vespro Lucius conta sette presenti, ma il conto arriva a otto: in fondo, sull'ultima panca, siede una figura senza volto. Certe notti si ferma davanti alla finestra di Clara e la chiama «piccola». È il <b>padre di Clara</b>, un forestiero contato quando lei aveva sei anni, il cui nome è stato grattato via dal Registro. Se il patto si spezza, nel fumo ritrova un volto.</p>
    <h3>Nove</h3>
    <p>Una bambina pallida, con i capelli bianchi e un vestito di un azzurro che non si usa più. Al Conteggio l'hanno sempre saltata: «otto, e poi basta». Dal pozzo della piazza, ogni notte, una voce conta fino a otto. Se ritrovi i suoi quattro ricordi, qualcuno arriva a contare fino a nove (vedi <i>Cose nascoste</i>).</p>
    <h3>Il mondo di fuori</h3>
    <p>Il ponte «non c'è mai stato», giura Agatha. Fuori dal bosco c'è una strada asfaltata, camion, luci che non si spengono mai: Hollowmere è una riserva privata, comprata dai fondatori, e nessuno sa che esiste. Nella Valle il tempo si è fermato all'Ottocento; fuori, no. «Che anno è davvero?»</p>
    <h3>Il numero otto (e il nove)</h3>
    <p>Otto sassi in cerchio che contati due volte fanno nove; una voce che conta fino a otto; otto costellazioni che diventano nove; «NON CONTARE I PIANI» con nove tacche; un 9 disegnato dalle lucciole. A Hollowmere contare è pericoloso, e qualcuno resta sempre fuori dal conto.</p>
    `,
      'spoiler'
    );

    // ---------------- 4. Storia e finali ----------------
    sez(
      'storia',
      'Storia: capitoli e finali',
      `
    <div class="chap"><h3>Capitolo I — Il Recinto Giallo</h3><p class="small">Giorno 1 · Autunno</p>
    <p>Arrivi alla fattoria del nonno. Clara e gli abitanti ti accolgono; Agatha vende semi, Brom lavora alla forgia, Lucius suona la campana. Impari le Regole. Clara ti chiede di portare una <b>focaccia di zucca</b> sul ceppo vicino al Varco, al tramonto (18:00–20:30). Con la <b>vernice gialla</b> ridipingi i pali grigi del recinto. Nella casa c'è la <b>cassa del nonno</b> (serve la chiave): dentro, le pagine di Elias. Tobia trova un <b>nastro rosso</b>: è proibito… ma non seppellirlo.</p></div>
    <div class="chap"><h3>Capitolo II — Quelli di cui non si parla</h3>
    <p>Una notte qualcosa gratta la porta: «AVEVI DIMENTICATO». Al <b>Vespro</b> si conta fino a otto. Tobia confessa che a volte «fa il Cavaliere» con i trampoli, ma l'altra notte dormiva. Con Clara e Tobia dalla tua parte, <b>Ezekiel</b> ti racconta il patto. Con la <b>chiave del fienile</b> leggi il <b>Registro</b>: il tuo nome è già scritto.</p></div>
    <div class="chap"><h3>Capitolo III — L'Albero dei Morti</h3>
    <p>Con la <b>lanterna di Clara</b> attraversi il Varco. Nel bosco: tieni la destra, dove ci sono le impronte; alle voci di' la verità; e se senti la voce del nonno <b>non girarti</b>. Alla radura trovi l'Albero e il corpo di Elias. Il mattino dopo, sulla soglia, qualcuno ti ha lasciato un <b>mantello giallo</b>. Le lanterne gialle non proteggono: segnano.</p></div>
    <div class="chap"><h3>Capitolo IV — La Festa del Raccolto</h3>
    <p>Le campane suonano da sole all'alba. Alla festa offrono un <b>sidro</b> troppo dolce: <b>non berlo</b>. A mezzanotte Lucius conta, il numero sale, dodici rintocchi, e dal Varco arriva il Cavaliere. Devi scegliere.</p></div>
    <h3>I tre finali</h3>
    <table><tr><th>Finale</th><th>Come si ottiene</th><th>Com'è</th></tr>
    <tr><td><b>1 · La Fuga</b></td><td>Alla Festa scegli di correre al Varco. Serve Clara alleata (almeno 3 cuori) e la sua lanterna: senza una guida e una luce il bosco non ti lascia passare.</td><td>All'alba il bosco finisce su una strada asfaltata. Fuori è il mondo di oggi. E da qualche parte, una nuova lettera parte per un nuovo erede.</td></tr>
    <tr><td><b>2 · L'Erede</b></td><td>Bevi il sidro, oppure indossi il mantello giallo, oppure nessuno nel cerchio ti vuole abbastanza bene da aiutarti (tutti sotto i 2 cuori), oppure il Cavaliere ti raggiunge mentre scappi.</td><td>Hollowmere ha di nuovo un Cavaliere. Sei tu. Nella Valle, di notte, senti zoccoli: sono i tuoi.</td></tr>
    <tr><td><b>3 · Spezzare il patto</b></td><td>Avere il <b>nastro rosso</b> (mai seppellito), Clara e Tobia ad almeno 3 cuori, Clara alleata, aver aperto la cassa del nonno, letto la seconda pagina di Elias e il Registro, e aver visto l'Albero. Alla Festa compare la scelta «Spezza il patto».</td><td>Leghi il nastro alla testa del nonno. Le teste tacciono, il Senza Volto ritrova il volto di un padre, e il recinto giallo diventa di un grigio qualsiasi. «Elias Marlowe — Tornato a casa.»</td></tr>
    </table>
    <h3>Chi ti aiuta alla Festa</h3>
    <p>Quando corri, Agatha, Brom, Lucius e Tobia ti aiutano se hanno almeno 3 cuori (il Cavaliere parte più lontano) e ti ostacolano se ne hanno 1 o meno. L'amicizia, nella storia, è letteralmente la tua via di fuga.</p>
    <h3>Dopo il finale: la Valle</h3>
    <p>Ogni finale apre il gioco libero, con un inizio diverso:</p>
    <ul><li><b>Dopo la Fuga</b>: sei tornato; Clara vive fuori e ti viene a trovare la domenica.</li>
    <li><b>Dopo l'Erede</b>: il mantello giallo è appeso dietro la porta. Di notte, a volte, gli zoccoli sono i tuoi.</li>
    <li><b>Dopo il patto spezzato</b>: il ponte è ricostruito con il legno dell'Albero bruciato, e da fuori comincia ad arrivare gente.</li></ul>
    `,
      'spoiler'
    );

    // ---------------- 5. Personaggi ----------------
    const bday = id => (D.BDAY[id] ? `${D.BDAY[id][1]} ${S[D.BDAY[id][0]].toLowerCase()}` : '—');
    const tier = { 3: 'Ama', 2: 'Le piace', 1: 'Gradisce' };
    const gusti = id => {
      const L = D.LIKES[id] || {};
      let h = '';
      for (const t of [3, 2, 1]) {
        const xs = Object.keys(L).filter(k => L[k] === t);
        if (xs.length) h += `<p><b>${tier[t]}:</b> ${xs.map(x => it(x)).join(' ')}</p>`;
      }
      if ((D.DISLIKES[id] || []).length)
        h += `<p><b>Detesta:</b> ${D.DISLIKES[id].map(x => it(x)).join(' ')}</p>`;
      return h;
    };
    const ricette = id => {
      const L = teaches(id);
      return L.length
        ? `<p><b>Insegna:</b> ${L.map(r => it(r.id)).join(' ')}${id === 'ottavio' ? ' <span class="small">(le vende a 300 scudi)</span>' : ''}</p>`
        : '';
    };
    const CAST = [
      [
        'ezekiel',
        "L'Anziano del villaggio. Custodisce il Registro da quando aveva diciannove anni e vive vicino al fienile rosso. Severo, stanco, e più buono di quanto voglia sembrare."
      ],
      [
        'agatha',
        'Tiene la bottega: semi, pane, arredi. Chiama tutti «tesoro». Ha sessantun anni, non è mai uscita dalla Valle e ha letto tutti i libri dei forestieri.'
      ],
      [
        'lucius',
        'Il fratello della cappella. Accende i lampioni uno per uno, suona la campana delle nove e guida il Vespro. Conta sempre, e sbaglia sempre di uno.'
      ],
      [
        'clara',
        'Fa il pane e ti accoglie per prima. Suo padre era un forestiero, sparito quando lei aveva sei anni. Coraggiosa, quando serve: è la tua alleata più preziosa.'
      ],
      [
        'brom',
        'Il fabbro. Parla a monosillabi («Mh.»), forgia ferri di cavallo per una valle senza cavalli. Tuo nonno gli ha insegnato a battere il ferro.'
      ],
      [
        'tobia',
        'Il bambino del villaggio. Ride («Hihi»), parla con le zucche e sa molte più cose di quanto dovrebbe. Ama il nastro rosso.'
      ],
      [
        'ottavio',
        'Il postino del mondo di fuori. Arriva nella Valle con la posta, compra i tuoi raccolti al 20% in più e vende due «ricette di città».'
      ],
      [
        'irene',
        'Una fotografa di valli abbandonate. Arriva nella Valle cercando la sorella sparita. Ha una fotografia che non avrebbe dovuto scattare.'
      ]
    ];
    sez(
      'personaggi',
      'Personaggi',
      `
    <p class="lead">Gli abitanti della storia, i visitatori e, nella Valle, chi si trasferisce nelle casette che costruisci.</p>
    <h3>Il villaggio</h3>
    ${CAST.map(
      ([id, d]) =>
        `<div class="pg">${por(id)}<div><h4>${who(id)}</h4><p class="small">Compleanno: <b>${bday(id)}</b></p><p>${esc(d)}</p>${gusti(id)}${ricette(id)}</div></div>`
    ).join('')}
    ${D.altri.length ? `<h3>Altri personaggi</h3>${D.altri.map(id => `<div class="pg">${por(id)}<div><h4>${who(id)}</h4>${D.BDAY[id] ? `<p class="small">Compleanno: <b>${bday(id)}</b></p>` : ''}${gusti(id)}${ricette(id)}</div></div>`).join('')}` : ''}
    <h3>I nuovi abitanti (Valle)</h3>
    <p>Dal rango <b>Borgo</b> puoi costruire casette: la mattina dopo arriva qualcuno. Ognuno ha un mestiere, una bottega, una richiesta al giorno (sempre di stagione) e ricette da insegnare. Con 5 cuori ti fa il prezzo d'amico (−15%).</p>
    ${D.RES_POOL.map(
      r => `<div class="pg">${por(r.id)}<div><h4>${who(r.id)}</h4><p class="q">«${esc(r.L[0])}»</p>
    <p><b>Bottega:</b> ${r.shop.map(([x, p]) => `${it(x)} <span class="small">${p}</span>`).join(' · ')}${r.buys === 'pesci' ? ' · <i>compra il pesce al 30% in più</i>' : ''}</p>
    <p><b>Chiede:</b> ${r.req.map(x => it(x)).join(' ')}</p>${ricette(r.id)}</div></div>`
    ).join('')}
    <div class="pg">${por('nove')}<div><h4>Nove</h4><p class="small">Si incontra solo dopo aver trovato i suoi quattro ricordi.</p><p class="q">«${esc(D.NOVE_L[0])}»</p><p><b>Vende:</b> ${D.NOVE_SHOP.map(([x, p]) => `${it(x)} <span class="small">${p}</span>`).join(' · ')}</p><p>Di notte sta al cimitero, la mattina presto vicino al pozzo.</p></div></div>
    `
    );

    // ---------------- 6. Confidenze ----------------
    const confid = (src, label) =>
      Object.entries(src)
        .map(
          ([id, L]) =>
            `<div class="conf"><h4>${por(id, 32)} ${who(id)}</h4>${L.map(([h, t]) => `<p><b>${h}♥</b> ${T(t)}</p>`).join('')}</div>`
        )
        .join('');
    sez(
      'confidenze',
      'Confidenze e segreti',
      `
    <p class="lead">Più cresce l'amicizia, più gli abitanti si confidano. Ogni segreto finisce nel diario, nella scheda Lore.</p>
    <h3>Durante la storia</h3>
    <div class="cols2 confs">${confid(D.SECRETS)}</div>
    <h3>Nella Valle</h3>
    <div class="cols2 confs">${confid(D.FREE_SECRETS)}</div>
    `,
      'spoiler'
    );

    // ---------------- 7. Flora ----------------
    const cropRows = Object.entries(CROPS)
      .sort((a, b) => a[1].s[0] - b[1].s[0] || a[1].n.localeCompare(b[1].n))
      .map(
        ([k, c]) =>
          `<tr><td>${ic(k)}</td><td><b>${esc(I[k].n)}</b></td><td>${seas(c.s)}</td><td>${c.days} notti</td><td>${c.re ? 'ogni ' + c.re + ' notti' : '—'}</td><td>${c.y[0] === c.y[1] ? c.y[0] : c.y[0] + '–' + c.y[1]}</td><td>${sc(seedP(k))}</td><td>${sc(I[k].v)}</td></tr>`
      )
      .join('');
    sez(
      'flora',
      'Flora: orto, frutteto, bosco',
      `
    <h3>Colture dell'orto</h3>
    <p>Zappa la terra, pianta i semi, annaffia ogni giorno: una pianta cresce di una tacca per ogni notte in cui è bagnata. Il <b>concime</b> rende la zolla più generosa. Le colture «che ricrescono» danno raccolto più volte. Agatha vende i semi della stagione; il cocchiere quelli di tutte le stagioni (più cari).</p>
    <table><tr><th></th><th>Coltura</th><th>Stagioni</th><th>Cresce in</th><th>Ricresce</th><th>Resa</th><th>Seme</th><th>Vale</th></tr>${cropRows}</table>
    <h3>Alberi da frutto</h3>
    <p>Si comprano come alberelli, si piantano sulle tue terre e maturano in 12 giorni. Poi danno frutta nella loro stagione.</p>
    <table><tr><th></th><th>Albero</th><th>Frutto</th><th>Stagioni</th><th>Prezzo</th><th>Dove</th><th>Il frutto vale</th></tr>
    ${Object.entries(fruitTree)
      .map(
        ([f, t]) =>
          `<tr><td>${ic(t)}</td><td><b>${esc(I[t].n)}</b></td><td>${it(f)}</td><td>${seas(D.FRUIT[f].s)}</td><td>${sc(I[t].p)}</td><td class="small">${[...(fonti[t] || [])].join(', ')}</td><td>${sc(I[f].v)}</td></tr>`
      )
      .join('')}</table>
    <h3>Raccolta selvatica</h3>
    <p>Crescono da sole nei prati e ai margini del bosco. Con l'abilità Raccolta al livello 8 a volte sono doppie.</p>
    <table><tr><th>Stagione</th><th>Cosa si trova</th></tr>
    ${Object.entries(D.WILD)
      .map(
        ([s, l]) =>
          `<tr><td>${seas([+s])}</td><td>${l.map(x => `${it(x)} <span class="small">(${I[x].v})</span>`).join(' ')}</td></tr>`
      )
      .join('')}</table>
    <h3>Piante speciali</h3>
    <ul><li><b>Girasole</b> — alto come una porta, le api lo adorano.</li><li><b>Grano</b> — al mulino diventa farina.</li><li><b>Ravanello</b> — il più svelto dell'orto: due notti.</li><li><b>Zucca</b> — alla Valle piacciono le zucche. Serve per la Festa delle Lanterne.</li><li><b>Agrifoglio</b> — l'unica cosa che cresce d'inverno nel bosco; serve per la Notte del Fuoco.</li></ul>
    `
    );

    // ---------------- 8. Fauna ----------------
    const fishInfo = {};
    for (const [w, L] of Object.entries(D.FISH))
      for (const [id, peso, ss, notte] of L)
        (fishInfo[id] = fishInfo[id] || []).push(
          `${w === 'lago' ? 'Lago' : 'fiume'}${ss ? ' (' + ss.map(i => S[i].toLowerCase()).join(', ') + ')' : ''}${notte ? ', solo di notte' : ''} · ${peso < 5 ? 'rarissimo' : peso < 15 ? 'raro' : peso < 30 ? 'comune' : 'frequente'}`
        );
    const animalImg = D.animalImg;
    sez(
      'fauna',
      'Fauna: animali e pesci',
      `
    <h3>Animali da fattoria</h3>
    <p>Si comprano per la loro casa (al banco da lavoro costruisci pollaio, stalla e ovile). Vanno accarezzati ogni giorno e nutriti: con più affetto, prodotti migliori. D'inverno mangiano il <b>fieno</b> (si fa con 3 fibre, o si compra da Elio).</p>
    <table><tr><th></th><th>Animale</th><th>Casa</th><th>Posti</th><th>Prezzo</th><th>Produce</th></tr>
    ${Object.entries(D.ANIMALS)
      .map(
        ([k, a]) =>
          `<tr><td>${big(animalImg[k], 32)}</td><td><b>${esc(a.n)}</b></td><td>${it(a.home)}</td><td>${a.cap}</td><td>${a.cost}</td><td>${it(a.prod)} <span class="small">${a.mode === 'milk' ? '(si munge)' : a.mode === 'shear' ? '(si tosa)' : '(raccogli a terra)'}</span></td></tr>`
      )
      .join('')}</table>
    <h3>Le api</h3>
    <p>L'<b>apiario</b> (banco, Artigianato liv. 4, oppure da Gaspare) dà miele ogni tre giorni. D'inverno le api dormono.</p>
    <h3>Pesci</h3>
    <p>Con la <b>canna</b> (da Nora), davanti all'acqua: lancia, aspetta il «!» e tira. Il Lago si apre al rango Paese; il fiume c'è sempre. Il <b>salmerino d'oro</b> è il pesce più raro della Valle: Nora vorrebbe appenderlo sopra la porta.</p>
    <table><tr><th></th><th>Pesce</th><th>Dove e quando</th><th>Vale</th></tr>
    ${['trota', 'carpa', 'luccio', 'persico', 'anguilla', 'tinca', 'salmerino']
      .map(
        k =>
          `<tr><td>${ic(k)}</td><td><b>${esc(nm(k))}</b></td><td>${(fishInfo[k] || []).join('<br>')}</td><td>${sc(I[k].v)}</td></tr>`
      )
      .join('')}</table>
    ${
      Object.keys(D.FAUNA).length
        ? `<h3>Animali selvatici</h3><p>Non si cacciano: si osservano. Avvicinandoti a uno nuovo finisce nel <b>Taccuino del naturalista</b> (menu di pausa), con premi a 4, 8, 12 animali e a taccuino completo.</p>
    <table><tr><th></th><th>Animale</th><th>Quando e dove</th><th>Com'è</th></tr>${Object.entries(D.FAUNA)
      .map(
        ([k, F]) =>
          `<tr><td>${big(D.faunaIc[k], 26)}</td><td><b>${esc(F.n)}</b>${F.raro ? ' <span class="small">(raro)</span>' : ''}</td><td class="small">${esc(F.dove2)}${F.meteo ? ' · con la ' + esc(F.meteo) : ''} · ${F.h.map(([a, b]) => `${Math.floor(a)}:${a % 1 ? '30' : '00'}–${Math.floor(b) % 24}:${b % 1 ? '30' : '00'}`).join(', ')}</td><td>${esc(F.d)}</td></tr>`
      )
      .join('')}</table>`
        : ''
    }
    <h3>Animali liberi</h3>
    <div class="crit">${[
      ['chicken', 'Galline del villaggio', 'razzolano vicino alla piazza'],
      ['cat', 'Il gatto nero', 'gira per il paese; di notte i suoi occhi…'],
      ['crow', 'I corvi', "sui campi, finché c'è lo spaventapasseri"],
      ['rabbit', 'Conigli', 'nei prati a sud'],
      ['duck', 'Anatre', 'lungo il fiume'],
      ['frog', 'Rane', 'sulle rive']
    ]
      .map(([k, n, d]) => `<div>${big(D.crit[k], 36)}<b>${n}</b><span class="small">${d}</span></div>`)
      .join('')}</div>
    <h3>Le Ombre (miniera)</h3>
    <p>Più scendi in miniera, più Ombre: ti tolgono energia e si scacciano con un colpo d'attrezzo. Quello che resta è l'<b>essenza d'ombra</b>: fredda, e pesa più di quanto dovrebbe.</p>
    `
    );

    // ---------------- 9. Ricette ----------------
    const recRow = r =>
      `<tr><td>${ic(r.id, 28)}</td><td><b>${esc(nm(r.id))}</b>${r.adv ? ' <span class="adv">♨ forno</span>' : ''}<br><span class="small">${esc((I[r.id].d || '').replace(/\s*\+\d+ energia\.?/, ''))}</span></td><td>${list(r.need)}</td><td>+${I[r.id].e}</td><td>${r.min}'</td><td class="small">${r.da ? who(r.da) + (r.da === 'ottavio' ? ' (300)' : '') : r.scopri ? 'da sé, quando hai avuto tutti gli ingredienti' : r.abil ? esc(D.SKILLS[r.abil[0]].n) + ' liv. ' + r.abil[1] : 'si sa già'}${r.b ? ' · <b>effetto</b>' : ''}</td></tr>`;
    sez(
      'ricette',
      'Ricette',
      `
    <p>Si cucina sul <b>camino</b> di casa. Le ricette segnate <span class="adv">♨ forno</span> vogliono la <b>cucina economica</b> (banco: 40 pietra + 20 legna, da mettere in casa). Le ricette nuove le insegnano gli abitanti amici (3 cuori) e Ottavio le vende. I piatti ridanno energia e piacciono agli abitanti più dei raccolti crudi. La <b>farina</b> si fa al mulino.</p>
    <h3>Le ricette di casa (${D.BASE_RECIPES.length + 1})</h3>
    <table class="rec"><tr><th></th><th>Piatto</th><th>Ingredienti</th><th>Energia</th><th>Tempo</th><th>Chi la insegna</th></tr>
    ${COOK.filter(r => !r.da)
      .map(recRow)
      .join('')}</table>
    <h3>Le ricette degli abitanti (${COOK.filter(r => r.da).length})</h3>
    <table class="rec"><tr><th></th><th>Piatto</th><th>Ingredienti</th><th>Energia</th><th>Tempo</th><th>Chi la insegna</th></tr>
    ${COOK.filter(r => r.da)
      .map(recRow)
      .join('')}</table>
    <h3>Il mulino</h3>
    <table><tr><th>Metti</th><th>Ottieni</th></tr>${Object.entries(D.MILL)
      .map(([k, [q, f]]) => `<tr><td>${it(k, q)}</td><td>${it('farina', f)}</td></tr>`)
      .join('')}</table>
    `
    );

    // ---------------- 10. Materiali e miniera ----------------
    const oreRow = (t, lab) =>
      `<tr><td><b>${lab}</b></td><td>${t.map(([x, p]) => `${it(x)} <span class="small">${p}%</span>`).join(' ')}</td></tr>`;
    sez(
      'materiali',
      'Materiali e miniera',
      `
    <h3>Materiali di base</h3>
    <table><tr><th></th><th>Materiale</th><th>Come si ottiene</th></tr>
    ${[
      ['legna', "Abbatti alberi e spacca rami con l'accetta. Silvio la vende a 5."],
      ['pietra', 'Rompi rocce e sassi col piccone, o in miniera. Teo la vende a 7.'],
      ['fibra', 'Strappa le erbacce. Con 5 fibre fai 2 concimi, con 3 fibre il fieno.'],
      ['fieno', "Banco (3 fibre) o Elio (15). Il cibo d'inverno degli animali; il silos lo conserva."],
      ['ferro', 'Miniera, a tutti i piani. Teo lo vende a 35.'],
      ['lingotto', 'Fornace: 5 ferro + 1 legna → 1 lingotto in un’ora e mezza. Teo lo vende a 85.'],
      ['farina', 'Mulino: grano, mais, patate o castagne.']
    ]
      .map(([k, d]) => `<tr><td>${ic(k)}</td><td><b>${esc(nm(k))}</b></td><td>${esc(d)}</td></tr>`)
      .join('')}</table>
    <h3>La miniera senza fondo</h3>
    <p>L'imbocco è sulla Collina (si apre al rango Borgo). Ogni piano è generato quando ci scendi: una sola roccia nasconde la <b>scala</b> per scendere. Ci sono forzieri e torce; ogni 5 piani un ascensore ricorda la strada. Non c'è un fondo.</p>
    <table><tr><th>Piani</th><th>Cosa si trova nelle rocce</th></tr>
    ${oreRow(D.ore[0], '1–9')}${oreRow(D.ore[1], '10–19')}${oreRow(D.ore[2], '20–39')}${oreRow(D.ore[3], '40 e oltre')}</table>
    <h3>Minerali e gemme</h3>
    <table><tr><th></th><th>Minerale</th><th>Vale</th><th>Note</th></tr>
    ${['ferro', 'quarzo', 'rame', 'nichel', 'oro', 'ametista', 'diamante', 'essenza', 'stella']
      .map(
        k =>
          `<tr><td>${ic(k)}</td><td><b>${esc(nm(k))}</b></td><td>${sc(I[k].v)}</td><td class="small">${esc(I[k].d || [...(fonti[k] || [])].join(', '))}</td></tr>`
      )
      .join('')}</table>
    `
    );

    // ---------------- 11. Crafting ----------------
    const lvTxt = c => (c.lv ? `<span class="small">Artig. ${c.lv}</span>` : '');
    sez(
      'crafting',
      'Costruire: banco, macchine, casa',
      `
    <p>Al <b>banco da lavoro</b> (20 legna + 5 pietra) si costruisce tutto; all'<b>incudine</b> si forgiano gli attrezzi. Alcune ricette si sbloccano con l'abilità <b>Artigianato</b>. Gli edifici grandi danno prestigio al villaggio.</p>
    ${Object.entries(D.STAZIONI)
      .flatMap(([sk, S]) =>
        Object.entries(S.cats).map(([cat, cn]) => [cat, sk === 'banco' ? cn : S.n + ': ' + cn])
      )
      .map(
        ([
          cat,
          cn
        ]) => `<h3>${esc(cn)}</h3><table class="craft"><tr><th></th><th>Oggetto</th><th>Materiali</th><th>Note</th></tr>
    ${D.CRAFTS.filter(c => c.cat === cat)
      .map(
        c =>
          `<tr><td>${ic(c.id)}</td><td><b>${esc(nm(c.id))}</b>${c.q > 1 ? ' ×' + c.q : ''}</td><td>${list(c.c)}</td><td class="small">${lvTxt(c)} ${esc(I[c.id].d || '')}</td></tr>`
      )
      .join('')}</table>`
      )
      .join('')}
    <h3>Le macchine</h3>
    <table><tr><th></th><th>Macchina</th><th>Cosa fa</th></tr>
    <tr><td>${ic('fornace')}</td><td><b>Fornace</b></td><td>5 ferro + 1 legna → 1 lingotto, in un'ora e mezza.</td></tr>
    <tr><td>${ic('barattolo')}</td><td><b>Barattolo</b></td><td>Qualsiasi raccolto, frutto o selvatico → <b>conserva</b> in tre ore. Vale di più del raccolto crudo.</td></tr>
    <tr><td>${ic('botte')}</td><td><b>Botte</b></td><td>Frutta e bacche → <b>succo</b> in otto ore: ${D.JUICY.map(x => it(x)).join(' ')}</td></tr>
    <tr><td>${ic('apiario')}</td><td><b>Apiario</b></td><td>Miele ogni tre giorni (non d'inverno).</td></tr>
    <tr><td>${ic('mulino')}</td><td><b>Mulino</b></td><td>Farina (vedi <i>Ricette</i>). Livelli: ${esc(D.FUNC.mulino.lv.join(' → '))}.</td></tr>
    <tr><td>${ic('serra')}</td><td><b>Serra</b></td><td>Le piante intorno non seccano al cambio di stagione. Raggio: ${esc(D.FUNC.serra.lv.join(' → '))}.</td></tr>
    <tr><td>${ic('silos')}</td><td><b>Silos</b></td><td>Conserva il fieno: ${esc(D.FUNC.silos.lv.join(' → '))}.</td></tr>
    <tr><td>${ic('pozzogrande')}</td><td><b>Pozzo grande</b></td><td>Annaffia da solo intorno: ${esc(D.FUNC.pozzogrande.lv.join(' → '))}.</td></tr>
    <tr><td>${ic('irrigatore')}</td><td><b>Irrigatori</b></td><td>Annaffiano le zolle vicine ogni mattina (il grande più lontano).</td></tr>
    </table>
    <p class="small">Migliorare un edificio funzionale: liv. 2 = 1.500 scudi + ${list(D.FUNC_UP[2].c)} · liv. 3 = 4.000 scudi + ${list(D.FUNC_UP[3].c)}.</p>
    <h3>La casa</h3>
    <table><tr><th>Livello</th><th>Lavoro</th><th>Costo</th></tr>
    ${Object.entries(D.HOUSE_UP)
      .map(
        ([l, h]) =>
          `<tr><td><b>${l}</b></td><td><b>${esc(h.n)}</b><br><span class="small">${esc(h.d)}</span></td><td>${sc(h.cost)} scudi<br>${list(h.c)}</td></tr>`
      )
      .join('')}</table>
    <h3>Il telaio</h3>
    <p>Al telaio si tingono i vestiti del tuo personaggio:</p>
    <table><tr><th>Colore</th><th>Serve</th></tr>${D.TELAIO.map(([c, x, q]) => `<tr><td><b>${esc(c)}</b></td><td>${it(x, q)}</td></tr>`).join('')}</table>
    `
    );

    // ---------------- 12. Oggetti (indice) ----------------
    const TIPI = {
      crop: 'Raccolti e prodotti',
      food: 'Piatti',
      res: 'Materiali',
      place: 'Da piazzare',
      arredo: 'Arredi',
      key: 'Oggetti speciali',
      seed: 'Semi',
      tool: 'Attrezzi',
      fert: 'Concime',
      bad: 'Proibiti',
      gift: 'Offerte'
    };
    const salta = k => k.startsWith('cons_') || k.startsWith('succo_');
    sez(
      'oggetti',
      'Indice degli oggetti',
      `
    <p>Tutti gli oggetti del gioco (${Object.keys(I).length}), divisi per tipo. Le ${Object.keys(I).filter(k => k.startsWith('cons_')).length} conserve e i ${Object.keys(I).filter(k => k.startsWith('succo_')).length} succhi sono raccolti a parte, in fondo.</p>
    ${Object.entries(TIPI)
      .map(([t, tn]) => {
        const ks = Object.keys(I).filter(k => I[k].t === t && !salta(k));
        if (!ks.length) return '';
        return `<h3>${tn} (${ks.length})</h3><div class="idx">${ks
          .map(
            k =>
              `<div>${ic(k, 22)}<span><b>${esc(I[k].n)}</b>${I[k].v ? ` <i class="small">${I[k].v}</i>` : I[k].p ? ` <i class="small">${I[k].p}</i>` : ''}<br><span class="small">${esc(I[k].d && !/^Crescono in|^Matura in/.test(I[k].d) ? I[k].d : [...(fonti[k] || [])].slice(0, 2).join(', '))}</span></span></div>`
          )
          .join('')}</div>`;
      })
      .join('')}
    <h3>Conserve e succhi</h3>
    <div class="idx small3">${Object.keys(I)
      .filter(salta)
      .map(k => `<div>${ic(k, 18)}<span>${esc(I[k].n)} <i class="small">${I[k].v}</i></span></div>`)
      .join('')}</div>
    `
    );

    // ---------------- 13. Negozi ----------------
    sez(
      'negozi',
      'Negozi e mercanti',
      `
    <table><tr><th>Chi</th><th>Cosa vende</th></tr>
    <tr><td><b>Agatha</b> (bottega)</td><td>I semi della stagione, concime, pane. Arredi: ${D.DECOR_SHOP.map(([x, p]) => `${it(x)} ${p}`).join(' · ')}</td></tr>
    <tr><td><b>Il cocchiere</b> (carro)</td><td>Semi di tutte le stagioni, fieno, concime, lastre e alberelli da frutto, al 35% in più: «Il viaggio, lo pagate voi.»</td></tr>
    <tr><td><b>Ottavio</b></td><td>Compra i raccolti al 20% in più e vende due ricette di città (300 l'una).</td></tr>
    <tr><td><b>La sartoria</b></td><td>Colori e capi per il tuo personaggio: ${D.BOTTEGA.map(([x, p]) => `${esc(x.split(':')[1])} ${p}`).join(' · ')}</td></tr>
    ${D.RES_POOL.map(r => `<tr><td><b>${who(r.id)}</b></td><td>${r.shop.map(([x, p]) => `${it(x)} ${p}`).join(' · ')}</td></tr>`).join('')}
    <tr><td><b>Nove</b></td><td>${D.NOVE_SHOP.map(([x, p]) => `${it(x)} ${p}`).join(' · ')}</td></tr>
    </table>
    <h3>Lavoretti in paese (Storia)</h3>
    <table><tr><th>Lavoretto</th><th>Paga</th></tr>${Object.values(D.CHORES)
      .map(c => `<tr><td>${esc(c.t)}</td><td>${c.pay}</td></tr>`)
      .join('')}</table>
    `
    );

    // ---------------- 14. Villaggio, ranghi, feste ----------------
    sez(
      'valle',
      'La Valle: ranghi, zone, feste, museo',
      `
    <h3>Il prestigio e i ranghi</h3>
    <p>Tutto quello che fai per il villaggio dà <b>prestigio</b>: edifici, abitanti nuovi, campi, animali, feste, il museo. Il registro di Ezekiel mostra le voci. Ogni rango sblocca qualcosa.</p>
    <table><tr><th>Rango</th><th>Prestigio</th><th>Sblocca</th></tr>
    ${D.RANKS.map(([n, s], i) => `<tr><td><b>${esc(n)}</b></td><td>${sc(s)}</td><td>${i ? esc(D.RANK_GIFTS[i]) : 'Si comincia qui.'}</td></tr>`).join('')}
    <tr><td><b>★ Stelle</b></td><td>+2.500</td><td>Una stella ogni 2.500 punti, senza fine. Ogni stella: un posto in più per un nuovo abitante (fino a 10).</td></tr></table>
    <h3>Le zone</h3>
    <table><tr><th>Zona</th><th>Si apre</th><th>Com'è</th></tr>
    ${Object.values(D.ZONES)
      .map(z => `<tr><td><b>${esc(z.n)}</b></td><td>${esc(D.RANKS[z.rank][0])}</td><td>${esc(z.d)}</td></tr>`)
      .join('')}</table>
    <h3>Le feste</h3>
    <p>Una per stagione. Nei giorni prima l'organizzatore ti chiede di aiutare a prepararla; alla festa c'è una gara e un banco con oggetti speciali.</p>
    ${Object.entries(D.FESTE)
      .map(
        ([
          s,
          f
        ]) => `<div class="box fest"><h4>${SICO[s]} ${esc(f.n)} <span class="small">— ${f.day} ${S[s].toLowerCase()}, organizza ${who(f.org)}</span></h4>
    <p class="q">«${T(f.intro)}»</p>
    <p><b>Per prepararla:</b> ${list(f.need)} · <b>Gara:</b> ${esc(f.gara.n)}</p>
    <p><b>Al banco:</b> ${f.shop.map(([x, p]) => `${it(x)} ${p}`).join(' · ')}</p></div>`
      )
      .join('')}
    <h3>I traguardi</h3>
    <table><tr><th>Traguardo</th><th>Come</th><th>Premio</th></tr>${(D.TRAG || []).map(t => `<tr><td><b>${esc(t[1])}</b></td><td>${esc(t[2])}</td><td>${sc(t[4])}</td></tr>`).join('')}</table>
    <h3>Il museo</h3>
    <p>Ogni cosa che doni al museo la mostra per sempre. Collezioni:</p>
    <table>${Object.entries(D.COLL_L || {})
      .map(
        ([c, l]) =>
          `<tr><td><b>${esc(c)}</b> (${l.length})</td><td>${l.map(x => ic(x, 18)).join('')}</td></tr>`
      )
      .join('')}</table>
    `
    );

    // ---------------- 15. Cose nascoste ----------------
    sez(
      'segreti',
      'Cose nascoste',
      `
    <p class="lead">Easter egg, ricordi e stranezze. Ogni scoperta finisce nel diario.</p>
    <h3>Le stranezze della Valle</h3>
    <table><tr><th>Scoperta</th><th>Dove / come</th><th>Cosa dice il diario</th></tr>
    ${Object.entries(D.EGGS)
      .map(
        ([k, e]) =>
          `<tr><td><b>${esc(e.t)}</b></td><td class="small">${
            e.dove ||
            {
              incisione: 'Un albero vicino al fiume, a sud-est della piazza.',
              sassi: 'Il cerchio di sassi a nord-ovest.',
              zucca: 'Nella zucca vicino a casa tua.',
              bottiglia: "Nell'erba, a sud.",
              pozzo: 'Il pozzo della piazza, dopo le 22:00.'
            }[k] ||
            ''
          }</td><td>${T(e.lore)}</td></tr>`
      )
      .join('')}
    ${Object.entries(D.EGG_EXTRA)
      .map(
        ([k, e]) =>
          `<tr><td><b>${esc(e.t)}</b></td><td class="small">${
            e.dove ||
            {
              moneta: 'Zappando un punto preciso dei campi del nonno, in basso a sinistra.',
              gatto: 'Accarezza il gatto nero dopo le 21:00.',
              tredici: 'Scendi al piano 13 della miniera.',
              stivale: 'Pescando (molto raro).',
              omonimo: 'Chiama il tuo personaggio «Elias».',
              spaventa: 'Guarda lo spaventapasseri dopo mezzanotte.',
              codice: 'Su, su, giù, giù, sinistra, destra, sinistra, destra.',
              stelle: 'Sali sulla torre della Collina dopo le 22:00.'
            }[k] ||
            ''
          }</td><td>${T(e.lore)}</td></tr>`
      )
      .join('')}</table>
    <h3>I quattro ricordi di Nove</h3>
    <p>Ogni stagione, in un posto e a un'ora precisa, succede qualcosa una volta sola. Quando sei nel posto giusto all'ora giusta, l'aria brilla di azzurro.</p>
    <table><tr><th>Stagione</th><th>Quando e dove</th><th>Ricordo</th></tr>
    ${D.VOCI.map(([s, t]) => {
      const R = D.RICORDI[s];
      return `<tr><td>${seas([R.s])}</td><td>${esc(t)}</td><td>${it(R.item)}<br><span class="small">${T(R.text[1])}</span></td></tr>`;
    }).join('')}</table>
    <p>Con tutti e quattro i ricordi, vai al <b>pozzo della piazza tra mezzanotte e l'una</b>: «…sette… otto… nove.» Nove resterà nella Valle.</p>
    <h3>Altro da sapere</h3>
    <ul>
    <li><b>Le stelle cadenti</b>: certe notti una stella cade sulla Valle, poi un'altra. La mattina, dove sono cadute, si raccoglie la <b>polvere di stella</b>.</li>
    <li><b>La voce dietro la porta</b>: dopo la campana delle nove, qualcuno bussa e dice di essere il nonno. Non aprire. Il nonno non ha mai bussato così.</li>
    <li><b>Il nastro rosso</b>: tutti ti diranno di seppellirlo. Tobia lo ama (+4 amicizia). È la chiave del finale migliore.</li>
    <li><b>Le bacche rosse</b>: regalarle a qualcuno è un'offesa (−3). Tobia ride e ti dice di nasconderle «prima che le veda il Vecchio».</li>
    <li><b>Il sidro della Festa</b>: è dolce, troppo. Sa di mela, di ferro e di terra smossa.</li>
    <li><b>La fotografia di Irene</b>: la prima volta che la incontri nella Valle. Sul retro, a matita, non con la sua calligrafia: «otto».</li>
    <li><b>La lettera nel finale della Fuga</b> è indirizzata a un altro erede: spesso il nome di un altro giocatore.</li>
    </ul>
    `,
      'spoiler'
    );

    // ---------------- composizione ----------------
    const indice = sezioni
      .map(
        (s, i) =>
          `<li><a href="#${s.id}"><span>${i + 1}</span>${esc(s.titolo)}${s.sotto === 'spoiler' ? ' <em>spoiler</em>' : ''}</a></li>`
      )
      .join('');
    const copertina = `<section class="cover">
    <div class="cv-in">
    <div class="cv-ico">${['zucca', 'lanterna', 'nastro', 'mela', 'trota', 'torta', 'diamante', 'stella'].map(k => ic(k, 40)).join('')}</div>
    <p class="cv-k">Wiki ufficiale · aggiornata al gioco</p>
    <h1>Hollowmere</h1>
    <p class="cv-s">La Valle Quieta</p>
    <div class="cv-por">${['clara', 'ezekiel', 'agatha', 'lucius', 'brom', 'tobia'].map(id => por(id, 72)).join('')}</div>
    <p class="cv-q">«Vai a viverci. Coltiva. Sii felice.<br>Ah, e una cosa sola: rispetta le loro regole. Tutte.»</p>
    <p class="cv-f">Lore · personaggi · flora e fauna · ricette · materiali · costruzioni · cose nascoste</p>
    </div></section>
    <section class="toc"><h2>Indice</h2><ol>${indice}</ol>
    <div class="legend"><p><b>Stagioni:</b> ${seas([0, 1, 2, 3])}</p><p><b>♨ forno</b> = serve la cucina economica · <b>♥</b> = cuori di amicizia · prezzi e valori in scudi</p></div></section>`;

    const body = sezioni
      .map(
        (s, i) =>
          `<section id="${s.id}" class="sec${s.sotto === 'spoiler' ? ' spoiler-sec' : ''}"><h2><span class="n">${i + 1}</span>${esc(s.titolo)}</h2>${s.sotto === 'spoiler' ? '<div class="warn">⚠ Questa sezione contiene spoiler sulla storia.<span class="hid"> È nascosta: premi «Mostra spoiler» in alto per leggerla.</span></div>' : ''}${s.html}</section>`
      )
      .join('');

    const css = `
    @page { size: A4; margin: 16mm 14mm 18mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Georgia', 'DejaVu Serif', serif; color: #2a1f17; font-size: 10pt; line-height: 1.42; margin: 0; background: #fbf6ea; }
    .px { image-rendering: pixelated; image-rendering: crisp-edges; vertical-align: middle; }
    h1, h2, h3, h4 { font-family: 'Georgia', serif; color: #4a1a10; margin: 0; }
    h2 { font-size: 21pt; border-bottom: 3px double #8a2a18; padding-bottom: 4px; margin-bottom: 10px; display: flex; align-items: baseline; gap: 10px; }
    h2 .n { font-size: 12pt; background: #8a2a18; color: #fbf6ea; border-radius: 3px; padding: 1px 8px; }
    h3 { font-size: 13pt; margin: 14px 0 6px; color: #6a2a14; border-left: 4px solid #d8a840; padding-left: 7px; break-after: avoid; }
    h4 { font-size: 11pt; }
    p { margin: 4px 0 6px; }
    .lead { font-size: 11pt; font-style: italic; color: #4a3a2a; }
    .small { font-size: 8.3pt; color: #5a4a3a; }
    .sec { break-before: page; }
    table { border-collapse: collapse; width: 100%; margin: 4px 0 8px; font-size: 9pt; }
    th { background: #4a1a10; color: #f6e8c8; text-align: left; padding: 4px 6px; font-weight: normal; }
    td { padding: 3px 6px; border-bottom: 1px solid #e2d4b4; vertical-align: middle; }
    tr:nth-child(even) td { background: #f4ecd8; }
    tr { break-inside: avoid; }
    .it { white-space: nowrap; display: inline-block; margin-right: 3px; }
    .it img { margin-right: 2px; }
    .s { white-space: nowrap; font-size: 8.3pt; border-radius: 3px; padding: 0 4px; margin-right: 2px; }
    .s0 { background: #f3d2a8; } .s1 { background: #d6e6f2; } .s2 { background: #d8eec8; } .s3 { background: #f6e8a0; }
    .adv { font-size: 8pt; background: #8a2a18; color: #fff; border-radius: 3px; padding: 0 4px; white-space: nowrap; }
    .box { border: 1px solid #d8c49c; background: #fffaf0; border-radius: 6px; padding: 8px 10px; margin: 6px 0; break-inside: avoid; }
    .cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 6px 0; }
    .stats div { background: #4a1a10; color: #f6e8c8; border-radius: 6px; text-align: center; padding: 6px 2px; }
    .stats b { display: block; font-size: 17pt; color: #f6d070; } .stats span { font-size: 8pt; }
    .rules { background: #2a1a14; color: #f6e8c8; padding: 8px 12px; border-radius: 6px; border-left: 5px solid #c8302a; }
    .rules b { color: #f6d070; }
    .pg { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed #d8c49c; break-inside: avoid; }
    .pg .por { flex: none; border: 2px solid #4a1a10; border-radius: 4px; background: #e8dcc0; }
    .pg h4 { font-size: 12pt; }
    .q { font-style: italic; color: #5a3a2a; }
    .conf { break-inside: avoid; border: 1px solid #e0cca8; background: #fffaf0; border-radius: 6px; padding: 6px 8px; font-size: 8.8pt; }
    .conf h4 { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
    .conf .por { border: 1px solid #4a1a10; border-radius: 3px; }
    .confs { margin-bottom: 8px; }
    .chap { border-left: 3px solid #8a2a18; padding: 2px 0 2px 10px; margin: 8px 0; break-inside: avoid; }
    .warn { background: #8a2a18; color: #fff; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 9pt; }
    .spoil { background: #8a2a18; color: #fff; padding: 0 5px; border-radius: 3px; font-size: 8.5pt; }
    .crit { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .crit div { display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid #e0cca8; border-radius: 6px; padding: 6px; background: #fffaf0; }
    .idx { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px 8px; font-size: 8.6pt; }
    .idx div { display: flex; gap: 4px; align-items: flex-start; break-inside: avoid; }
    .idx img { flex: none; margin-top: 1px; }
    .small3 { grid-template-columns: repeat(4, 1fr); }
    .fest h4 { margin-bottom: 3px; }
    .reg td:first-child { font-family: 'Courier New', monospace; }
    .reg { font-family: 'Georgia', serif; }
    .cover { height: 263mm; background: radial-gradient(ellipse at 50% 30%, #3a2418 0%, #160c08 75%); color: #f6e8c8; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 4px; }
    .cv-in { padding: 20mm; }
    .cv-ico { display: flex; gap: 10px; justify-content: center; margin-bottom: 14mm; opacity: .95; }
    .cv-k { letter-spacing: 6px; text-transform: uppercase; font-size: 10pt; color: #d8a840; }
    .cover h1 { font-size: 58pt; color: #f6d070; letter-spacing: 2px; text-shadow: 0 0 18px #c8302a88; margin: 4mm 0 2mm; }
    .cv-s { font-size: 18pt; font-style: italic; color: #e8d0a8; }
    .cv-por { display: flex; gap: 8px; justify-content: center; margin: 14mm 0 10mm; }
    .cv-por img { border: 2px solid #d8a840; border-radius: 4px; background: #2a1a14; }
    .cv-q { font-style: italic; font-size: 12pt; color: #e8d8b8; line-height: 1.6; }
    .cv-f { margin-top: 14mm; font-size: 9pt; color: #b89870; letter-spacing: 1px; }
    .toc { break-before: page; }
    .toc ol { list-style: none; padding: 0; columns: 1; font-size: 13pt; }
    .toc li { border-bottom: 1px dotted #b8a07a; padding: 5px 0; }
    .toc a { color: #2a1f17; text-decoration: none; display: flex; gap: 10px; align-items: baseline; }
    .toc a span { background: #8a2a18; color: #fbf6ea; border-radius: 3px; padding: 0 7px; font-size: 10pt; min-width: 26px; text-align: center; }
    .toc em { font-size: 8.5pt; color: #fff; background: #c8302a; font-style: normal; border-radius: 3px; padding: 0 5px; }
    .legend { margin-top: 10mm; }
    ul { margin: 4px 0 8px 18px; padding: 0; } li { margin: 2px 0; }

    @media screen { .cover { height: auto; min-height: 90vh; border-radius: 0; } body { padding: 0 14px 40px; } .sec { margin-top: 28px; } }
    @media screen and (max-width: 640px) { .cols2, .stats, .crit, .idx, .small3 { grid-template-columns: 1fr 1fr; } table { display: block; overflow-x: auto; } h2 { font-size: 17pt; } .cover h1 { font-size: 40pt; } .cv-por img { width: 44px; height: 44px; } }
    body:not(.nospoil) .hid { display: none; }
    body.nospoil .spoiler-sec > *:not(h2):not(.warn) { display: none; }
    `;
    const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hollowmere — Wiki</title><style>${css}</style></head><body class="${o.spoiler ? '' : 'nospoil'}">${copertina}${body}</body></html>`;

    return html;
  },
  apri() {
    if (document.getElementById('wiki')) return;
    AU.play && AU.play('ui');
    let html;
    try {
      html = this.pagina({ spoiler: false });
    } catch (e) {
      console.error(e);
      return UI.toast && UI.toast('La wiki non si è aperta.');
    }
    const prima = UI.modalOpen;
    UI.modalOpen = true;
    const w = document.createElement('div');
    w.id = 'wiki';
    w.innerHTML = `<div class="wbar"><b>📖 Wiki della Valle</b><span><button class="btn" data-w="spoil">Mostra spoiler</button><button class="btn" data-w="pdf">Salva PDF</button><button class="btn" data-w="tab">Apri a pagina intera</button><button class="btn" data-w="x">✕</button></span></div><iframe title="Wiki della Valle"></iframe>`;
    document.body.appendChild(w);
    const f = w.querySelector('iframe');
    f.srcdoc = html;
    let spoiler = false;
    const chiudi = () => {
      removeEventListener('keydown', tasti, true);
      w.remove();
      UI.modalOpen = prima;
    };
    const tasti = e => {
      if (e.code === 'Escape') chiudi();
      e.stopPropagation();
    };
    addEventListener('keydown', tasti, true);
    w.querySelector('[data-w=x]').onclick = chiudi;
    w.querySelector('[data-w=spoil]').onclick = e => {
      spoiler = !spoiler;
      const b = f.contentDocument && f.contentDocument.body;
      if (b) b.classList.toggle('nospoil', !spoiler);
      e.target.textContent = spoiler ? 'Nascondi spoiler' : 'Mostra spoiler';
    };
    w.querySelector('[data-w=pdf]').onclick = () => {
      try {
        f.contentWindow.focus();
        f.contentWindow.print();
      } catch (e) {
        console.error(e);
      }
    };
    w.querySelector('[data-w=tab]').onclick = () => {
      const u = URL.createObjectURL(new Blob([this.pagina({ spoiler })], { type: 'text/html' }));
      window.open(u, '_blank');
      setTimeout(() => URL.revokeObjectURL(u), 60000);
    };
  }
};
// La wiki è privata: non c'è nessun pulsante. Si apre solo con la chiave nell'indirizzo, per esempio
// https://…/index.html#wiki=LA-CHIAVE (nel codice c'è solo l'impronta SHA-256 della chiave, non la chiave).
const WIKI_CHIAVE = 'edeee7d4d7fdcbbcd031d147e80496057c73c66d42ff1ff9e9f7914db57a7f7f';
// SHA-256 piccolo (funziona anche dove il browser non offre crypto.subtle)
function wikiSha256(str) {
  const b = [...new TextEncoder().encode(str)],
    K = [],
    H = [];
  const pr = n => {
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  for (let n = 2, k = 0; k < 64; n++)
    if (pr(n)) {
      if (k < 8) H[k] = (Math.pow(n, 1 / 2) * 2 ** 32) | 0;
      K[k++] = (Math.pow(n, 1 / 3) * 2 ** 32) | 0;
    }
  const L = b.length * 8;
  b.push(0x80);
  while (b.length % 64 !== 56) b.push(0);
  for (let i = 7; i >= 0; i--) b.push(i > 3 ? 0 : (L >>> (i * 8)) & 255);
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < b.length; o += 64) {
    const w = [];
    for (let i = 0; i < 16; i++)
      w[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3),
        s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, bb, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0,
        t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      [h, g, f, e, d, c, bb, a] = [g, f, e, (d + t1) | 0, c, bb, a, (t1 + t2) | 0];
    }
    [a, bb, c, d, e, f, g, h].forEach((v, i) => (H[i] = (H[i] + v) | 0));
  }
  return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}
async function wikiDaIndirizzo() {
  const m = /^#wiki=(.+)$/.exec(location.hash);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  if (wikiSha256(decodeURIComponent(m[1])) !== WIKI_CHIAVE) return;
  for (
    let i = 0;
    i < 100 && !(typeof ICON !== 'undefined' && ICON.hoe && typeof G !== 'undefined' && G.mode);
    i++
  )
    await new Promise(r => setTimeout(r, 100));
  Wiki.apri();
}
addEventListener('hashchange', wikiDaIndirizzo);
wikiDaIndirizzo();
