'use strict';
// 24. Lo svago: unirsi agli abitanti (il tè con Agatha, la pesca con Brom), il falò del venerdì sera, la corsa
// coi sacchi del 9 della stagione, la panchina e i sassi piatti. Tutto nel gioco libero.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  // chi risponde ai dialoghi: la scelta che contiene uno dei testi voluti, se no la prima
  await page.evaluate(() => {
    const st = G.st,
      S = guidesSeen(st);
    for (const g of GUIDES) S[g.id] = 1;
    window.__vuoi = [];
    window.__auto = setInterval(() => {
      if (!UI.dlgOpen) return;
      if (UI._typ) return UI.finishType();
      const B = [...document.querySelectorAll('#dchoices button')];
      if (B.length) {
        const b = B.find(x => window.__vuoi.some(v => x.textContent.includes(v))) || B[0];
        b.click();
      } else UI.advance();
    }, 60);
  });
  const prepara = (giorno, ora, meteo) =>
    page.evaluate(
      ([giorno, ora, meteo]) => {
        const st = G.st;
        st.day = giorno;
        st.time = ora;
        st.weather = meteo || 'sole';
        st.energy = 100;
        rebuildMaps();
        G.map = G.maps.main;
        goMap('main', 40, 25, 0, true);
        snapNPCs();
        for (const n of G.npcs) n.script = false;
      },
      [giorno, ora, meteo]
    );
  // un giorno con il giorno della settimana voluto (WD: 0 lunedì … 6 domenica) e il giorno di stagione voluto
  const giornoCon = (wd, sd) =>
    page.evaluate(
      ([wd, sd]) => {
        const st = G.st;
        for (let d = st.day + 1; d < st.day + 400; d++) {
          const s = { day: d, free: st.free };
          if ((d + 3) % 7 !== wd && wd != null) continue;
          if (sd != null && ((d - st.free.start) % SEASON_LEN) + 1 !== sd) continue;
          if (
            typeof festToday === 'function' &&
            ((d - st.free.start) % SEASON_LEN) + 1 === festOf(Object.assign({}, st, s)).day
          )
            continue;
          return d;
        }
        return st.day + 1;
      },
      [wd, sd]
    );
  const fine = () =>
    page.waitForFunction(() => !SVAGO.busy && !SVAGO.gioco && !UI.busy(), null, { timeout: 30000 });

  // ---------- il tè con Agatha (18:00-19:00 nei giorni feriali) ----------
  await prepara(await giornoCon(1), 18 * 60 + 10);
  await page.waitForTimeout(300);
  const te = await page.evaluate(async () => {
    const n = NPC('agatha');
    // aspetta che arrivi al tavolino
    for (let i = 0; i < 60 && (n.moving || (n.path && n.path.length)); i++) await sleep(100);
    const C = [];
    setPos(G.player, ptile(n)[0] + 1, ptile(n)[1], 1);
    Ext.run('mira', C, G.player.x - 14, G.player.y, G.map);
    const sc = C.find(c => c.k === 'ext');
    const prima = G.st.friends.agatha || 0,
      e0 = G.st.energy;
    window.__vuoi = ['Prendi il tè', 'Dalla collina', 'Finalmente', 'La tua torta', 'Sono io'];
    G.st.energy = 50;
    await svTe(n);
    return {
      act: n.act,
      fum: sc && sc.fumetto().t,
      amicizia: (G.st.friends.agatha || 0) - prima,
      energia: G.st.energy > 50,
      libera: !n.script && !G.cut
    };
  });
  t.true('Agatha prende il tè e il fumetto dice di unirsi', te.act === 'tea' && te.fum === 'Prendi il tè');
  t.true('il tè scalda (energia) e fa crescere l’amicizia', te.energia && te.amicizia >= 1);
  t.true('dopo la scena Agatha torna libera e il gioco riparte', te.libera);

  // ---------- la pesca con Brom (domenica pomeriggio) ----------
  await prepara(await giornoCon(6), 15 * 60);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const n = NPC('brom');
    setPos(n, 38, 41, 0);
    n.path = [];
    n.moving = false;
    window.__vuoi = ['Pesca insieme'];
    window.__pesca = svPesca(n);
  });
  // il gioco: si preme quando il galleggiante abbocca
  await page.waitForFunction(() => SVAGO.gioco, null, { timeout: 10000 });
  const pesca = await page.evaluate(async () => {
    const pesci = ['trota', 'carpa', 'luccio', 'persico', 'anguilla', 'tinca', 'salmerino'],
      conta = () => pesci.reduce((a, id) => a + countItem(id), 0),
      prima = conta();
    let presto = false;
    for (let i = 0; i < 400 && SVAGO.gioco; i++) {
      const g = SVAGO.gioco;
      if (g.fase === 'attesa' && !presto && g.i === 0 && g.tt > 0.2) {
        presto = true; // il primo lancio: tira troppo presto, apposta
        IN.actQ = true;
      }
      if (g.fase === 'abbocca') IN.actQ = true;
      await sleep(50);
    }
    await window.__pesca;
    return { presi: conta() - prima, finito: !SVAGO.gioco && !SVAGO.busy };
  });
  t.true('a pesca con Brom: si tira quando abbocca e il pesce finisce nello zaino', pesca.presi >= 1);
  t.true('tirare troppo presto fa perdere il lancio, non blocca il gioco', pesca.finito && pesca.presi <= 2);

  // ---------- il falò del venerdì sera ----------
  await prepara(await giornoCon(4), 20 * 60 + 40);
  await page.waitForTimeout(800);
  const falo = await page.evaluate(async () => {
    Ext.run('mpTick', 1);
    const o = G.maps.main.objs.find(q => q.kind === 'svfalo');
    snapNPCs();
    await sleep(300);
    const gente = G.npcs.filter(n => !n.hidden && n.act === 'falo').map(n => n.id);
    const prima = Object.fromEntries(gente.map(id => [id, G.st.friends[id] || 0]));
    // prima una storia (o due), poi via
    window.__vuoi = ['Ascolta una storia'];
    const p1 = svFalo();
    await sleep(1500);
    window.__vuoi = ['Vai via'];
    await p1;
    const dopo = gente.filter(id => (G.st.friends[id] || 0) > prima[id]);
    return {
      fuoco: !!o,
      luce: G.maps.main.lights.some(l => l.falo),
      gente,
      cresciuti: dopo.length
    };
  });
  t.true('il venerdì sera in piazza si accende il falò (con la sua luce)', falo.fuoco && falo.luce);
  t.true('gli abitanti si siedono intorno al fuoco', falo.gente.length >= 2);
  t.true('sedersi al falò fa crescere l’amicizia con chi c’è', falo.cresciuti >= 2);
  const spento = await page.evaluate(() => {
    G.st.time = 23 * 60 + 45;
    Ext.run('mpTick', 1);
    return !G.maps.main.objs.some(q => q.kind === 'svfalo');
  });
  t.true('a fine serata il falò si spegne', spento);

  // ---------- la corsa coi sacchi (il 9 della stagione, alle 18) ----------
  await prepara(await giornoCon(null, 9), 18 * 60 + 5);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    snapNPCs();
  });
  await page.waitForTimeout(300);
  const iscr = await page.evaluate(() => {
    const a = NPC('agatha');
    setPos(a, SV_CORSA.x0, 16, 0);
    a.path = [];
    a.moving = false;
    window.__soldi = G.st.money;
    window.__vuoi = ['Mi iscrivo'];
    window.__corsa = svCorsaIscrivi(a);
    return { org: a.act, corridori: ['clara', 'brom', 'tobia'].filter(id => NPC(id).act === 'corsa').length };
  });
  t.true(
    'il giorno della corsa Agatha la organizza e i corridori aspettano alla partenza',
    iscr.org === 'corsa_org' && iscr.corridori >= 2
  );
  await page.waitForFunction(() => SVAGO.gioco && SVAGO.gioco.C, null, { timeout: 15000 });
  const corsa = await page.evaluate(async () => {
    // salti a ritmo: si preme appena a terra (e una volta apposta troppo presto, per inciampare)
    let inciampo = false,
      caduto = false;
    for (let i = 0; i < 1200 && SVAGO.gioco; i++) {
      const g = SVAGO.gioco,
        io = g.C[0];
      if (g.tt >= 0 && !io.arrivo && io.giu <= 0) {
        if (!inciampo && io.hop >= 0.1 && io.hop < 0.4) {
          inciampo = true;
          IN.actQ = true;
        } else if (io.hop < 0 || io.hop > 0.75) IN.actQ = true;
      }
      if (io.giu > 0) caduto = true;
      await sleep(30);
    }
    await window.__corsa;
    const S = G.st.free.svago;
    return {
      esito: S.corse[G.st.day],
      soldi: G.st.money - window.__soldi,
      caduto,
      liberi: ['clara', 'brom', 'tobia'].every(id => !NPC(id).script)
    };
  });
  t.true('chi salta troppo presto inciampa', corsa.caduto);
  t.true(
    'la corsa finisce con un piazzamento e un premio',
    !!corsa.esito && corsa.esito.pos >= 1 && corsa.soldi > 0
  );
  t.true('dopo la corsa i corridori tornano alle loro giornate', corsa.liberi);
  const dopoCorsa = await page.evaluate(() => {
    snapNPCs();
    return NPC('agatha').act !== 'corsa_org';
  });
  t.true('una corsa al giorno: dopo, Agatha torna al suo banco', dopoCorsa);

  // ---------- da soli: i sassi piatti e la panchina ----------
  const sassi = await page.evaluate(async () => {
    G.st.inv[G.st.sel] = null;
    UI.hotbar();
    goMap('main', 40, 45, 3, true);
    await sleep(200);
    setPos(G.player, 40, 45, 3);
    G.player.dir = 3;
    const [fx, fy] = frontTile();
    const acqua = G.map.get(fx, fy) === 3;
    const ok = freeAct(fx, fy);
    await sleep(2500);
    return { acqua, ok: !!ok, tiri: G.st.free.svago.rec.tiri };
  });
  t.true(
    'a mani vuote davanti al fiume si lancia un sasso piatto',
    sassi.acqua && sassi.ok && sassi.tiri === 1
  );
  const panchina = await page.evaluate(async () => {
    G.st.time = 10 * 60;
    G.st.energy = 40;
    const b = G.maps.main.objs.find(o => o.kind === 'bench');
    window.__vuoi = ['Siediti a pensare'];
    const t0 = G.st.time;
    await ACT.bench(b);
    return { tempo: G.st.time - t0, energia: G.st.energy > 40 };
  });
  t.true(
    'sulla panchina ci si siede a pensare: passa mezz’ora e si riprende fiato',
    panchina.tempo >= 30 && panchina.energia
  );

  await page.evaluate(() => clearInterval(window.__auto));
  t.eq('svago: nessun errore', errors.join('\n'), '');
  await page.close();
};
