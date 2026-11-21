'use strict';
// 4. Prove di fumo: si gioca davvero, a grandi passi, e non deve comparire nessun errore.
const { openGame, skipScenes, newGame } = require('./helpers');
module.exports = async function (t, { browser }) {
  // --- la storia ---
  {
    const { page, errors } = await openGame(browser);
    t.true('nuova partita: si arriva ai comandi dopo il prologo', await newGame(page, 'Ugo', 'm'));
    const s = await page.evaluate(() => ({ map: G.map.id, day: G.st.day, name: G.st.name }));
    // nel Capitolo I (chapter 0) le battute del Capitolo I devono essere disponibili
    t.true(
      "le battute del Capitolo I sono attive all'inizio della storia",
      await page.evaluate(
        () =>
          Dialoghi.quante('ezekiel', 'passaggio') > 0 &&
          Dialoghi.db.passaggio.ezekiel.some(e => e.cap && e.cap[0] === 1 && Dialoghi.ok(e, 'ezekiel'))
      )
    );
    t.eq('si comincia in casa, il primo giorno', s.map + '/' + s.day, 'house/1');
    await page.evaluate(() => goMap('main', 44, 20, 0, true));
    await page.waitForTimeout(1500);
    await skipScenes(page);
    t.eq('si esce in paese', await page.evaluate(() => G.map.id), 'main');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(700);
    await page.keyboard.up('ArrowRight');
    t.true('il giocatore cammina', await page.evaluate(() => G.player.x > 44 * 16 + 8));
    for (const wx of ['sereno', 'nuvoloso', 'pioggia', 'nebbia', 'neve']) {
      await page.evaluate(w => {
        G.st.weather = w;
      }, wx);
      await page.waitForTimeout(350);
    }
    for (const tm of [7 * 60, 12 * 60, 19 * 60, 21 * 60 + 30]) {
      await page.evaluate(x => {
        G.st.time = x;
      }, tm);
      await page.waitForTimeout(350);
    }
    await page.evaluate(() => {
      G.st.weather = 'sereno';
      G.st.time = 22 * 60 + 28;
    });
    await skipScenes(page, { max: 40, until: () => G.horse.on });
    t.true('di notte arriva il Cavaliere', await page.evaluate(() => G.horse.on));
    // salvataggio e ripresa
    const saved = await page.evaluate(() => {
      G.horse.on = false;
      G.chase = false;
      G.st.time = 10 * 60;
      NET.save(G.st);
      return LS.get('hm_save');
    });
    t.true('il salvataggio finisce nel dispositivo', !!saved && JSON.parse(saved).name === 'Ugo');
    await page.evaluate(() => sessionStorage.setItem('__keep', '1'));
    await page.reload();
    await page.waitForFunction(() => typeof G !== 'undefined' && G.mode === 'title', null, {
      timeout: 20000
    });
    await page.click('[data-a=cont]');
    await skipScenes(page);
    const back = await page.evaluate(() => ({ name: G.st.name, mode: G.mode, day: G.st.day }));
    t.eq('«Continua» riprende la partita salvata', back.name + '/' + back.mode, 'Ugo/game');
    t.eq('storia: nessun errore', errors.join('\n'), '');
    await page.close();
  }
  // --- la Valle (gioco libero) ---
  {
    const { page, errors } = await openGame(browser);
    await newGame(page, 'Ada', 'f');
    await page.evaluate(() => {
      freeStart(3);
    });
    await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
    t.true('si entra nella Valle', await page.evaluate(() => !!G.st.free));
    await page.evaluate(() => goMap('main', 14, 20, 0, true));
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const st = G.st,
        W = st.free;
      st.money = 99999;
      Object.assign(W.built, {
        '14,24': { id: 'ovile' },
        '20,24': { id: 'pollaio' },
        '26,25': { id: 'stalla' },
        '31,24': { id: 'mulino' },
        '8,22': { id: 'alb_fico', d: st.day - 20, fruit: 3 },
        '36,22': { id: 'banco' }
      });
      W.animals = [
        { kind: 'pecora', name: 'A', home: '14,24', love: 5, prod: true },
        { kind: 'anatra', name: 'B', home: '20,24', love: 5 },
        { kind: 'gallina', name: 'C', home: '20,24', love: 5 },
        { kind: 'capra', name: 'D', home: '26,25', love: 5, prod: true },
        { kind: 'mucca', name: 'E', home: '26,25', love: 5 }
      ];
      Object.keys(CROPS).forEach((c, i) => {
        st.farm[6 + (i % 16) + ',' + (15 + Math.floor(i / 16))] = { c: { t: c, a: (i % 4) * 2, dry: 0 } };
      });
      rebuildMaps();
      G.map = G.maps.main;
      spawnFarmAnimals();
    });
    await page.waitForTimeout(800);
    const menus = [
      'barnMenu("14,24")',
      'barnMenu("20,24")',
      'barnMenu("26,25")',
      'craftMenu()',
      'cookModal()',
      'recipeBook()',
      'museoMenu()'
    ];
    for (const m of menus) {
      const ok = await page.evaluate(code => {
        try {
          eval(code);
          return !!document.querySelector('#modal:not(.hide)');
        } catch (e) {
          console.error(e);
          return false;
        } finally {
          try {
            UI._mclose = null;
            UI.close();
          } catch (e) {}
        }
      }, m);
      t.true('si apre ' + m, ok);
      await page.waitForTimeout(150);
    }
    // un mese di mattine: animali, alberi, macchine, abitanti
    await page.evaluate(() => {
      for (let d = 0; d < 30; d++) {
        G.st.day++;
        animalsMorning(G.st);
        wildMorning(G.st);
        machinesMorning(G.st);
      }
    });
    for (let s = 0; s < 4; s++) {
      await page.evaluate(k => {
        G.st.day = G.st.free.start + k * SEASON_LEN + 1;
        rebuildMaps();
        G.map = G.maps.main;
      }, s);
      await page.waitForTimeout(500);
    }
    for (const tm of [6 * 60, 13 * 60, 20 * 60, 23 * 60]) {
      await page.evaluate(x => {
        G.st.time = x;
        G.horse.on = false;
      }, tm);
      await page.waitForTimeout(400);
    }
    const sc = await page.evaluate(() => [
      villageScore(G.st),
      scoreParts(G.st).reduce((a, p) => a + p[1], 0)
    ]);
    t.eq('il prestigio è la somma delle voci del registro', sc[0], sc[1]);
    t.eq('Valle: nessun errore', errors.join('\n'), '');
    await page.close();
  }
};
