'use strict';
// 2. Integrità dei dati di gioco: ogni riferimento punta a qualcosa che esiste.
const { openGame } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  const r = await page.evaluate(() => {
    const P = [];
    const bad = (name, list) => P.push([name, list]);
    // le funzioni disegnate solo quando servono
    for (const f of ['genCostrArt', 'genEspArt', 'genSempreArt'])
      try {
        window[f]();
      } catch (e) {
        P.push([f + ' lancia un errore', [String(e)]]);
      }
    bad(
      'oggetti senza nome',
      Object.keys(ITEMS).filter(k => !ITEMS[k].n)
    );
    bad(
      'oggetti senza icona',
      Object.keys(ITEMS).filter(k => !ICON[k] && !['lastre'].includes(k))
    );
    bad(
      'semi di colture inesistenti',
      Object.keys(ITEMS).filter(k => ITEMS[k].t === 'seed' && !CROPS[ITEMS[k].crop])
    );
    bad(
      'colture senza oggetto raccolto',
      Object.keys(CROPS).filter(k => !ITEMS[k])
    );
    bad(
      'colture senza 4 stadi disegnati',
      Object.keys(CROPS).filter(
        k => !(CROPIMG[k] && CROPIMG[k].length === 4 && CROPIMG[k].every(c => c && c.width))
      )
    );
    bad(
      'colture senza stagioni',
      Object.keys(CROPS).filter(k => !Array.isArray(CROPS[k].s) || !CROPS[k].s.length)
    );
    bad(
      'colture senza plurale',
      Object.keys(CROPS).filter(k => !PL[k])
    );
    bad(
      'ricette con ingredienti inesistenti',
      COOK.filter(r => Object.keys(r.need).some(k => !ITEMS[k])).map(r => r.id)
    );
    bad(
      'ricette senza piatto',
      COOK.filter(r => !ITEMS[r.id] || ITEMS[r.id].t !== 'food').map(r => r.id)
    );
    bad(
      'ricette insegnate da abitanti inesistenti',
      COOK.filter(r => r.da && !NAMES[r.da]).map(r => r.id + '→' + r.da)
    );
    bad(
      'ricette doppie',
      COOK.map(r => r.id).filter((id, i, a) => a.indexOf(id) !== i)
    );
    bad(
      'costruzioni con materiali inesistenti',
      CRAFTS.filter(c => !ITEMS[c.id] || Object.keys(c.c).some(k => !ITEMS[k])).map(c => c.id)
    );
    bad(
      'alberi da frutto senza frutto',
      Object.keys(ITEMS).filter(k => ITEMS[k].tree && (!FRUIT[ITEMS[k].tree] || !ITEMS[ITEMS[k].tree]))
    );
    bad(
      'animali con casa inesistente',
      Object.keys(ANIMALS).filter(
        k => !ITEMS[ANIMALS[k].home] || !ITEMS[ANIMALS[k].home].size || !AIMG[ANIMALS[k].home]
      )
    );
    bad(
      'animali con prodotto inesistente',
      Object.keys(ANIMALS).filter(k => !ITEMS[ANIMALS[k].prod])
    );
    bad(
      'edifici grandi senza disegno',
      Object.keys(ITEMS).filter(k => ITEMS[k].size && !AIMG[k])
    );
    bad(
      'abitanti senza aspetto',
      NPC_DEF.map(d => d[0]).filter(id => !LOOKS[id])
    );
    bad(
      'abitanti senza nome',
      NPC_DEF.map(d => d[0]).filter(id => !NAMES[id])
    );
    bad(
      'nuovi abitanti incompleti',
      RES_POOL.filter(
        r => !r.job || !RES_WORK[r.job] || !r.req.length || !r.L.length || !SCHED[r.id] || !FREE_ASK[r.id]
      ).map(r => r.id)
    );
    bad(
      'richieste dei nuovi abitanti con oggetti inesistenti',
      RES_POOL.flatMap(r => r.req.filter(x => !ITEMS[x]).map(x => r.id + ':' + x))
    );
    bad(
      'botteghe con merce inesistente',
      RES_POOL.flatMap(r => r.shop.filter(([x]) => !ITEMS[x]).map(([x]) => r.id + ':' + x))
    );
    bad(
      'gusti per oggetti inesistenti',
      Object.entries(LIKES).flatMap(([id, o]) =>
        Object.keys(o)
          .filter(k => !ITEMS[k])
          .map(k => id + ':' + k)
      )
    );
    bad(
      'merce del cocchiere inesistente',
      MERC_STOCK.filter(k => !ITEMS[k])
    );
    bad(
      'mulino: ingredienti inesistenti',
      Object.keys(MILL).filter(k => !ITEMS[k])
    );
    bad(
      'collezioni del museo con oggetti inesistenti',
      Object.entries(COLL).flatMap(([c, v]) =>
        v
          .l()
          .filter(k => !ITEMS[k])
          .map(k => c + ':' + k)
      )
    );
    // economia: niente si compra in bottega per rivenderlo con guadagno (cassetta +25% e Ottavio +20%)
    bad(
      'botteghe che vendono sotto il prezzo di rivendita',
      RES_POOL.flatMap(r =>
        r.shop
          .filter(([x, p]) => ITEMS[x] && ITEMS[x].t === 'crop' && ITEMS[x].v * 1.25 * 1.2 >= p * 0.85)
          .map(([x]) => r.id + ':' + x)
      )
    );
    bad(
      'abitanti che chiedono ciò che vendono',
      RES_POOL.flatMap(r => r.req.filter(x => r.shop.some(([y]) => y === x)).map(x => r.id + ':' + x))
    );
    bad(
      'ricette che usano un ingrediente detestato da chi le insegna',
      COOK.filter(r => r.da && (DISLIKES[r.da] || []).some(x => r.need[x])).map(r => r.da + ':' + r.id)
    );
    // natura: macchine animate, animali disegnati, ricette che si possono imparare
    bad(
      'macchine nuove senza animazione',
      Object.keys(NAT_MACH).filter(k => !NAT_MF[k] || NAT_MF[k].work.length < 2 || !MACH[k])
    );
    bad(
      'animali selvatici senza disegni',
      Object.keys(FAUNA).filter(k => !FAUNA_IMG[k] || !FAUNA_IMG[k].icona)
    );
    bad(
      'ricette che non si imparano in nessun modo',
      COOK.filter(r => !BASE_RECIPES.includes(r.id) && !r.da && !r.scopri && !r.abil).map(r => r.id)
    );
    bad(
      'selvatici senza disegno nel prato',
      Object.values(WILD)
        .flat()
        .filter(k => !FREEIMG['w_' + k])
    );
    bad(
      'novità del postino con id doppio o senza testo',
      GUIDES.filter(
        (g, i, a) => a.findIndex(x => x.id === g.id) !== i || !g.steps || !g.steps.length || !g.n
      ).map(g => g.id)
    );
    bad(
      'la wiki annunciata dal postino (deve restare segreta)',
      GUIDES.filter(g => /wiki/i.test(JSON.stringify(g.steps.map(s => s.t)) + g.n)).map(g => g.id)
    );
    // la wiki (js/wiki.js) si costruisce dai dati: ogni oggetto, ricetta e abitante deve comparirci
    try {
      const w = Wiki.pagina({ spoiler: true }).replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      bad(
        'oggetti che mancano nella wiki',
        Object.keys(ITEMS).filter(k => !w.includes(ITEMS[k].n.replace(/&/g, '&')))
      );
      bad(
        'personaggi che mancano nella wiki',
        NPC_DEF.map(d => d[0]).filter(
          id => LOOKS[id] && !w.includes(NAMES[id]) && !['faceless', 'mercante'].includes(id)
        )
      );
    } catch (e) {
      P.push(['la wiki non si costruisce', [String(e.stack || e)]]);
    }
    // dialoghi: chi parla esiste, condizioni scritte bene, nessuno svela la storia prima del tempo
    const KEYS = new Set([
      't',
      'ora',
      'fase',
      'cap',
      'finale',
      'stagione',
      'meteo',
      'cuori',
      'h2',
      'flag',
      'peso',
      'se',
      'una',
      'id',
      'tra',
      'righe',
      'copertura'
    ]);
    const tutte = [];
    for (const tipo of Object.keys(Dialoghi.db).filter(k => !Array.isArray(Dialoghi.db[k])))
      for (const [chi, L] of Object.entries(Dialoghi.db[tipo]))
        for (const e of L) tutte.push({ tipo, chi, e, testi: [e.t] });
    for (const tipo of ['chiacchiera', 'bisbiglio'])
      for (const e of Dialoghi.db[tipo])
        tutte.push({ tipo, chi: e.tra.join('+'), e, testi: e.righe.map(r => r[1]) });
    bad(
      'dialoghi di personaggi inesistenti',
      tutte.filter(x => x.chi.split('+').some(c => c !== '*' && !NAMES[c])).map(x => x.tipo + ':' + x.chi)
    );
    bad(
      'conversazioni con chi non partecipa',
      tutte.filter(x => x.e.righe && x.e.righe.some(r => !x.e.tra.includes(r[0]))).map(x => x.chi)
    );
    bad(
      'coperture di chi non partecipa',
      tutte
        .filter(x => x.e.copertura && !x.e.tra.includes(x.e.copertura.split(':')[0].trim()))
        .map(x => x.chi)
    );
    bad(
      'dialoghi con condizioni sconosciute',
      tutte
        .filter(x => Object.keys(x.e).some(k => !KEYS.has(k)))
        .map(x => x.chi + ':' + Object.keys(x.e).filter(k => !KEYS.has(k)))
    );
    bad(
      'dialoghi vuoti',
      tutte.filter(x => x.testi.some(t => !t || t.length < 1)).map(x => x.chi)
    );
    // l'Albero lo nomina Ezekiel nel Capitolo II; teste, radici rosse e catene si vedono solo alla radura (Capitolo III)
    const prima = (x, c) =>
      x.e.fase !== 'valle' &&
      !x.e.finale &&
      !(x.e.cap && x.e.cap[0] >= c) &&
      !RES_POOL.some(r => x.chi.split('+').includes(r.id));
    bad(
      "dialoghi che nominano l'Albero prima del Capitolo II",
      tutte
        .filter(x => prima(x, 2) && x.testi.some(t => /\bAlbero\b/.test(t)))
        .map(x => x.chi + ': ' + x.testi[0].slice(0, 40))
    );
    bad(
      'dialoghi che svelano la radura prima del Capitolo III',
      tutte
        .filter(x => prima(x, 3) && x.testi.some(t => /radici rosse|\bteste\b|catene/i.test(t)))
        .map(x => x.chi + ': ' + x.testi[0].slice(0, 40))
    );
    // si può ottenere tutto: partendo dalle fonti (botteghe, orto, raccolta, animali, pesca, miniera) e da ciò
    // che si trasforma (macchine, mulino, cucina, banco), ogni oggetto e ogni ingrediente deve essere raggiungibile
    {
      const ok = new Set(['legna', 'pietra', 'fibra', 'uovo', 'ferro', 'essenza', 'concime', 'pane']),
        add = k => !ok.has(k) && (ok.add(k), true);
      for (const [k, v] of Object.entries(ITEMS)) if (v.t === 'seed') ok.add(k);
      for (const k of MERC_STOCK) ok.add(k);
      for (const r of RES_POOL) for (const [x] of r.shop) ok.add(x);
      for (const [x] of DECOR_SHOP) ok.add(x);
      for (const [x] of COMP_SHOP) ok.add(x);
      for (const f of Object.values(FESTE)) for (const [x] of f.shop || []) ok.add(x);
      for (const [x] of NOVE_SHOP) ok.add(x);
      for (const [x] of BOTTEGA) ok.add(x);
      for (const l of Object.values(WILD)) for (const x of l) ok.add(x);
      for (const l of Object.values(FISH)) for (const x of l) ok.add(x[0]);
      for (const f of [5, 15, 30, 45, 80]) for (const [x] of oreTable(f)) ok.add(x);
      const impara = r => BASE_RECIPES.includes(r.id) || r.da || r.scopri || r.abil;
      const coppie = Object.entries(MACH).flatMap(([, M]) =>
        Object.keys(ITEMS)
          .filter(k => {
            try {
              return M.ok(k);
            } catch (e) {
              return false;
            }
          })
          .map(k => [k, M.out(k)])
      );
      for (let giro = true; giro; ) {
        giro = false;
        for (const [c] of Object.entries(CROPS))
          if (Object.keys(ITEMS).some(x => ITEMS[x].t === 'seed' && ITEMS[x].crop === c && ok.has(x)))
            giro = add(c) || giro;
        for (const [k, v] of Object.entries(ITEMS)) if (v.tree && ok.has(k)) giro = add(v.tree) || giro;
        for (const [a, b] of coppie) if (ok.has(a)) giro = add(b) || giro;
        if (Object.keys(MILL).some(k => ok.has(k))) giro = add('farina') || giro;
        for (const r of COOK)
          if (impara(r) && Object.keys(r.need).every(k => ok.has(k))) giro = add(r.id) || giro;
        for (const c of CRAFTS) if (Object.keys(c.c).every(k => ok.has(k))) giro = add(c.id) || giro;
        for (const a of Object.values(ANIMALS)) if (ok.has(a.home)) giro = add(a.prod) || giro;
      }
      bad(
        'oggetti che non si possono ottenere in nessun modo',
        Object.keys(ITEMS).filter(k => !ok.has(k) && !['tool', 'key', 'bad'].includes(ITEMS[k].t))
      );
      bad(
        'ricette con ingredienti che non si possono ottenere',
        COOK.filter(r => Object.keys(r.need).some(k => !ok.has(k))).map(r => r.id)
      );
      bad(
        'colture senza un seme che si possa comprare',
        Object.keys(CROPS).filter(
          c => !Object.keys(ITEMS).some(x => ITEMS[x].t === 'seed' && ITEMS[x].crop === c)
        )
      );
    }
    // proporzioni coerenti fra gli edifici (misure in pixel di gioco; un personaggio è alto 32, una casella 16)
    {
      const dim = c => (c ? [iw(c), ih(c)] : [0, 0]),
        V = k => dim(IMG[k]),
        piccole = { cottage: V('cottage'), forge: V('forge'), casetta: dim(AIMG.casetta) },
        grandi = { house: V('house'), store: V('store'), elder: V('elder') },
        torri = { mulino: dim(AIMG.mulino), torre: dim(IMG.torre), fienile: V('barn') },
        annessi = {
          pollaio: dim(AIMG.pollaio),
          ovile: dim(AIMG.ovile),
          stalla: dim(AIMG.stalla),
          serra: dim(AIMG.serra),
          silos: dim(AIMG.silos),
          pozzo: dim(AIMG.pozzogrande)
        },
        maxW = o => Math.max(...Object.values(o).map(d => d[0])),
        maxH = o => Math.max(...Object.values(o).map(d => d[1])),
        minH = o => Math.min(...Object.values(o).map(d => d[1])),
        fuori = (o, f) =>
          Object.entries(o)
            .filter(([, d]) => !f(d))
            .map(([k, d]) => k + ' ' + d.join('×'));
      const P0 = piccole.cottage;
      bad(
        'case piccole di misure diverse (cottage, fucina, casetta)',
        fuori(piccole, d => Math.abs(d[0] - P0[0]) <= 2 && Math.abs(d[1] - P0[1]) <= 2)
      );
      bad(
        'case grandi non più grandi delle piccole',
        fuori(grandi, d => d[0] > maxW(piccole) && d[1] > maxH(piccole))
      );
      bad(
        'museo più piccolo delle case grandi',
        fuori({ museo: dim(IMG.museo) }, d => d[0] >= maxW(grandi) && d[1] >= maxH(grandi))
      );
      bad(
        'la chiesa non è l’edificio più alto',
        fuori({ chiesa: V('chapel') }, d => d[1] > Math.max(maxH(torri), maxH(grandi), dim(IMG.museo)[1]))
      );
      bad(
        'torri e mulino più bassi delle case grandi',
        fuori(torri, d => d[1] >= minH(grandi))
      );
      bad(
        'annessi agricoli alti come una casa',
        fuori(annessi, d => d[1] < minH(piccole))
      );
      // un edificio del giocatore non deve debordare dalla sua impronta più di mezza casella per lato
      bad(
        'costruzioni più larghe della loro impronta',
        Object.keys(ITEMS)
          .filter(k => ITEMS[k].size && AIMG[k] && iw(AIMG[k]) > ITEMS[k].size[0] * 16 + 16)
          .map(k => k + ' ' + iw(AIMG[k]) + ' su ' + ITEMS[k].size[0] * 16)
      );
    }
    // ogni aspetto produce i suoi fotogrammi senza errori
    const sheetErr = [];
    for (const k of Object.keys(LOOKS)) {
      try {
        const s = sheetOf(k);
        if (!s.width) sheetErr.push(k);
      } catch (e) {
        sheetErr.push(k + ': ' + e.message);
      }
    }
    bad('personaggi che non si disegnano', sheetErr);
    return P;
  });
  for (const [name, list] of r) t.eq(name, list.join(', '), '');
  t.eq('nessun errore durante i controlli sui dati', errors.join('\n'), '');
  await page.close();
};
