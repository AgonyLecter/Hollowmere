'use strict';
// 26. I segreti: l'invito di Tobia e le tre notti all'Albero delle teste (offerta, conto, nome), le curiosità
// nuove (il pozzo a mezzanotte), le abitudini della settimana e i gesti degli abitanti.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(1);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    const S = guidesSeen(G.st);
    for (const g of GUIDES) S[g.id] = 1;
    window.__vuoi = [];
    window.__auto = setInterval(() => {
      if (!UI.dlgOpen) return;
      if (UI._typ) return UI.finishType();
      const B = [...document.querySelectorAll('#dchoices button')];
      if (B.length) (B.find(x => window.__vuoi.some(v => x.textContent.includes(v))) || B[0]).click();
      else UI.advance();
    }, 60);
  });
  const notte = (k, vuoi, rosso) =>
    page.evaluate(
      async ([k, vuoi, rosso]) => {
        const st = G.st;
        st.day = st.free.start + 10 + k * 4;
        st.time = 18 * 60;
        st.weather = 'sereno';
        rebuildMaps();
        G.map = G.maps.main;
        goMap('main', 40, 25, 0, true);
        snapNPCs();
        await sleep(200);
        const n = NPC('tobia');
        setPos(n, 42, 25, 1);
        n.hidden = false;
        n.map = 'main';
        n.path = [];
        await segInvita(n);
        const invitato = st.free.segreti.albero.invito === st.day;
        if (rosso) giveItem(rosso, 1);
        // prima delle 23 il Varco non si apre
        st.time = 22 * 60;
        window.__vuoi = [];
        await ACT.varco({});
        const presto = G.map.id;
        st.time = 23 * 60 + 20;
        window.__vuoi = vuoi;
        await ACT.varco({});
        await sleep(200);
        const bosco = G.map.id;
        setPos(G.player, 15, 9, 3);
        for (let i = 0; i < 300 && !(G.map.id !== 'wood' && !G.cut); i++) await sleep(100);
        await sleep(300);
        const A = st.free.segreti.albero;
        return { invitato, presto, bosco, passo: A.passo, map: G.map.id, soldi: st.money };
      },
      [k, vuoi, rosso]
    );
  const n0 = await notte(0, ['Entra nel bosco', 'Pomodoro'], 'pomodoro');
  t.true('verso sera Tobia ti invita all’Albero', n0.invitato);
  t.true(
    'prima delle 23 il Varco non si apre; dopo sì, e si entra nel bosco',
    n0.presto === 'main' && n0.bosco === 'wood'
  );
  t.true(
    'la prima notte: con qualcosa di rosso, l’offerta (e si torna a casa)',
    n0.passo === 1 && n0.map === 'main'
  );
  const n1 = await notte(1, ['Entra nel bosco', 'Sette'], null);
  t.true(
    'la seconda notte, contando male: ti risvegli a casa e si riprova un’altra notte',
    n1.passo === 1 && n1.map === 'house'
  );
  const n1b = await notte(2, ['Entra nel bosco', 'Otto', 'Nove'], null);
  t.true(
    'contando bene (otto, e nove con te): il conto, e le monete vecchie sotto la radice',
    n1b.passo === 2 && n1b.soldi >= 333
  );
  const n2 = await notte(3, ['Entra nel bosco', 'Non girarti'], null);
  const fine = await page.evaluate(() => {
    const st = G.st,
      F = st.flags;
    return {
      cappello: !!avOwn(st).hat.tricorn,
      uova: ['albero_offerta', 'albero_conto', 'albero_nome'].every(k => F['egg_' + k])
    };
  });
  t.true('la terza notte, senza girarsi: il tricorno del Cavaliere', n2.passo === 3 && fine.cappello);
  t.true('le tre notti finiscono nel diario delle curiosità', fine.uova);

  // ---------- il pozzo a mezzanotte ----------
  const pozzo = await page.evaluate(async () => {
    const st = G.st;
    st.time = 20;
    window.__vuoi = [];
    await ACT.well({});
    return !!st.flags.egg_pozzo_notte;
  });
  t.true('a mezzanotte il pozzo ripete il tuo nome al contrario', pozzo);

  // ---------- abitudini e gesti ----------
  const vita = await page.evaluate(async () => {
    const st = G.st;
    for (let d = st.day + 1; d < st.day + 8; d++)
      if ((d + 3) % 7 === 3) {
        st.day = d;
        break;
      }
    st.time = 9 * 60 + 20;
    st.weather = 'sereno';
    rebuildMaps();
    G.map = G.maps.main;
    goMap('main', 45, 23, 3, true);
    snapNPCs();
    await sleep(300);
    const ez = NPC('ezekiel');
    // i gesti: si fa scattare il turno e si guarda se qualcuno vicino ha fatto qualcosa
    setPos(ez, 45, 20, 0);
    await sleep(300);
    setPos(ez, 45, 20, 0);
    ez.path = [];
    ez.moving = false;
    ez.barkT = 0;
    // un abitante che viene a darti una dritta tiene ferma la scena: per questa prova la si chiude
    for (let i = 0; i < 30 && (G.cut || UI.busy()); i++) await sleep(100);
    G.cut = 0;
    ez.barkT = 0;
    const prima = G.bubbles.length;
    let chi = null;
    for (let i = 0; i < 8 && !chi; i++) {
      G.cut = 0;
      chi = segGesto();
    }
    return {
      act: ez.act || schedOf('ezekiel').act,
      gesto: !!chi && G.bubbles.some(b => b.n === chi)
    };
  });
  t.true('il giovedì mattina Ezekiel dà il pane ai piccioni in piazza', vita.act === 'feed');
  t.true('chi è fermo vicino a te ogni tanto fa un gesto suo', vita.gesto);

  await page.evaluate(() => clearInterval(window.__auto));
  t.eq('segreti: nessun errore', errors.join('\n'), '');
  await page.close();
};
