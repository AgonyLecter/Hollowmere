'use strict';
// 7. Suono e vita del paese: la colonna sonora (ogni brano suona, il brano giusto al momento giusto),
// le scintille della fucina solo quando Brom lavora, bussare alle porte, la cassetta che dice chi ha mandato cosa.
const { openGame, newGame, skipScenes } = require('./helpers');
// risponde ai dialoghi: sceglie la prima opzione (o quella col testo dato) finché il giocatore non è libero
// (a tempo, non a giri: su una macchina lenta le scene durano di più)
async function rispondi(page, scegli) {
  const fine = Date.now() + 30000;
  while (Date.now() < fine) {
    const s = await page.evaluate(() => ({
      cut: G.cut,
      busy: UI.busy(),
      opts: [...document.querySelectorAll('#dchoices button')].map(b => b.textContent)
    }));
    if (!s.cut && !s.busy) return true;
    if (!s.opts.length && (await page.evaluate(() => UI.modalOpen && !UI.dlgOpen))) {
      await page.evaluate(() => UI.close());
      continue;
    }
    if (s.opts.length) {
      const k = scegli
        ? Math.max(
            0,
            s.opts.findIndex(t => t.includes(scegli))
          )
        : 0;
      await page.evaluate(k => {
        const b = document.querySelectorAll('#dchoices button')[k];
        if (b) b.click();
      }, k);
    } else await page.keyboard.press('Space');
    await page.waitForTimeout(90);
  }
  return false;
}
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  // le scelte dei dialoghi si sbloccano dopo un attimo (contro i tocchi per sbaglio): si aspetta lo sblocco vero
  await page.evaluate(() => {
    window.sceltaPronta = async () => {
      while (performance.now() < UI._lock + 20) await new Promise(r => setTimeout(r, 30));
    };
  });
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  await page.evaluate(() => {
    goMap('main', 40, 20, 0, true);
    AU.resume();
    // Ottavio non deve arrivare con le novità a metà delle prove
    for (const g of GUIDES) guideSeen(G.st, g);
  });
  await page.waitForTimeout(1200);
  await skipScenes(page);

  // --- la colonna sonora ---
  const brani = await page.evaluate(() => Object.keys(BRANI));
  for (const id of brani) {
    const n = await page.evaluate(async id => {
      G.cutMusic = id;
      const n0 = Musica.note;
      await new Promise(r => setTimeout(r, 1400));
      return Musica.id === id ? Musica.note - n0 : -1;
    }, id);
    t.true(`il brano «${id}» suona`, n > 0);
  }
  const scelte = await page.evaluate(() => {
    G.cutMusic = null;
    const st = G.st,
      R = {},
      prova = (k, f) => {
        f();
        R[k] = chooseMusic();
      };
    G.map = G.maps.main;
    st.weather = 'sereno';
    prova('mattina d’autunno', () => {
      st.day = st.free.start + 3;
      st.time = 10 * 60;
    });
    prova('mattina d’estate', () => {
      st.day = st.free.start + 3 * SEASON_LEN + 3;
    });
    prova('tramonto', () => {
      st.time = 18 * 60 + 30;
    });
    prova('notte', () => {
      st.time = 23 * 60;
    });
    prova('pioggia', () => {
      st.time = 11 * 60;
      st.weather = 'pioggia';
    });
    prova('in casa', () => {
      st.day = st.free.start + 3;
      st.weather = 'sereno';
      G.map = G.maps.house;
    });
    prova('festa', () => {
      G.map = G.maps.main;
      st.day = st.free.start + 3;
      st.day = st.free.start + festOf(st).day - 1;
      st.time = 19 * 60;
    });
    G.map = G.maps.main;
    st.day = st.free.start + 3;
    st.time = 10 * 60;
    return R;
  });
  t.eq('d’autunno, di giorno: «autunno»', scelte['mattina d’autunno'], 'autunno');
  t.eq('d’estate: «estate»', scelte['mattina d’estate'], 'estate');
  t.eq('al tramonto: «vespro»', scelte.tramonto, 'vespro');
  t.eq('di notte: «notte»', scelte.notte, 'notte');
  t.eq('con la pioggia: «pioggia»', scelte.pioggia, 'pioggia');
  t.eq('in casa lo stesso brano, attutito', scelte['in casa'], 'autunno|casa');
  t.eq('alla festa della stagione: «festa»', scelte.festa, 'festa');
  const continua = await page.evaluate(async () => {
    AU.setMode('autunno');
    await new Promise(r => setTimeout(r, 300));
    const B = Musica.B;
    AU.setMode('autunno|casa');
    await new Promise(r => setTimeout(r, 300));
    return Musica.B === B;
  });
  t.true('entrando in casa il brano continua (cambia solo il colore)', continua);
  // la pioggia: all'aperto si sente, in casa attutita, in miniera per niente
  const pioggia = await page.evaluate(() => {
    const st = G.st,
      R = {},
      prima = [G.map, st.weather];
    st.weather = 'pioggia';
    for (const [k, mp] of [
      ['fuori', G.maps.main],
      ['casa', G.maps.house],
      ['miniera', { id: 'miniera', interior: 1 }]
    ]) {
      G.map = mp;
      AU.rainG.gain._v = undefined;
      AU.ambiente(AU.c.currentTime, 0);
      R[k] = AU.rainG.gain._v;
    }
    [G.map, st.weather] = prima;
    return R;
  });
  t.true('la pioggia si sente all’aperto', pioggia.fuori > 0);
  t.true('in casa arriva attutita', pioggia.casa > 0 && pioggia.casa < pioggia.fuori / 2);
  t.eq('in miniera non si sente', pioggia.miniera, 0);

  // --- le scintille della fucina ---
  const fucina = await page.evaluate(() => {
    const b = NPC('brom'),
      R = {};
    b.hidden = true;
    R.nascosto = bromAlLavoro();
    placeNPC(b, 'main', 36, 14, 2);
    b.act = 'forge';
    b.moving = false;
    R.lavora = bromAlLavoro();
    b.act = 'bench';
    R.panchina = bromAlLavoro();
    return R;
  });
  t.true('niente scintille se Brom è in casa', !fucina.nascosto);
  t.true('scintille quando Brom batte il ferro', fucina.lavora);
  t.true('niente scintille se Brom fa altro', !fucina.panchina);

  // --- bussare ---
  // Brom in casa (sabato sera, il suo orario dice «niente»), amicizia piena: apre, parla e rientra
  await page.evaluate(() => {
    const st = G.st;
    st.time = 21 * 60;
    st.friends.brom = 20;
    const b = NPC('brom');
    b.hidden = true;
    b.script = false;
  });
  const casa = await page.evaluate(() => {
    const b = NPC('brom');
    return { inCasa: Porte.inCasa(b), dove: Porte.dove('brom') };
  });
  t.true('Brom risulta in casa', casa.inCasa);
  t.eq('il taccuino dice dove si trova', casa.dove, 'in casa');
  // prima di bussare la scena dev'essere libera: i dialoghi ora si mettono in fila, e la domanda
  // «Bussi?» aspetterebbe il suo turno dietro un dialogo rimasto aperto (lo si scrive, se c'era)
  const aperto = await page.evaluate(() => (UI.dlgOpen ? document.querySelector('#dtext').textContent : ''));
  if (aperto) console.log('    (prima di bussare era aperto: «' + aperto.slice(0, 80) + '»)');
  await rispondi(page);
  await page.evaluate(() => {
    const _r = Math.random;
    window.__r = _r;
    Math.random = () => 0.05; // apre
    const o = G.maps.main.objs.find(o => o.kind === 'door' && o.key === 'forge');
    runAct(o);
  });
  await page.waitForSelector('#dchoices button', { timeout: 5000 });
  await page.evaluate(() => sceltaPronta());
  await page.evaluate(() => document.querySelectorAll('#dchoices button')[0].click()); // «Bussa»
  // si segue la scena: dialoghi avanti, nei menu l'ultima voce (di solito «niente, ciao»)
  const scena = await page.evaluate(async () => {
    // si segue la scena fino in fondo (al massimo un minuto: su una macchina lenta Brom cammina piano)
    let uscito = false,
      k = 0;
    const fine = performance.now() + 60000;
    for (; performance.now() < fine && (G.cut || UI.busy()); k++) {
      if (!NPC('brom').hidden) uscito = true;
      if (k === 15) Math.random = window.__r;
      const b = [...document.querySelectorAll('#dchoices button')];
      if (b.length) {
        await sceltaPronta();
        b[b.length - 1].click();
      } else if (UI.modalOpen && !UI.dlgOpen)
        UI.close(); // una finestra che non c'entra (una novità…)
      else UI.advance();
      await new Promise(r => setTimeout(r, 100));
    }
    Math.random = window.__r;
    return {
      uscito,
      finita: !G.cut && !UI.busy(),
      dove: `cut=${G.cut} dlg=${UI.dlgOpen} modal=${UI.modalOpen} k=${k} ${document.querySelector('#dtext').textContent} ${document.querySelector('#mbox').textContent.slice(0, 80)}`
    };
  });
  t.true('bussando, Brom esce sulla soglia', scena.uscito);
  t.true('la chiacchiera alla porta finisce' + (scena.finita ? '' : ' (' + scena.dove + ')'), scena.finita);
  await page.waitForTimeout(1500);
  t.true('poi Brom rientra in casa', await page.evaluate(() => NPC('brom').hidden && !NPC('brom').script));
  // bussando di nuovo e di nuovo: risponde male, e non esce
  await rispondi(page);
  await page.waitForFunction(() => NPC('brom').hidden && !G.cut && !UI.busy(), null, { timeout: 15000 });
  const seccato = await page.evaluate(async () => {
    G.st.friends.brom = 0;
    const o = G.maps.main.objs.find(o => o.kind === 'door' && o.key === 'forge');
    const testi = [],
      _say = UI.say;
    // si registra quello che dice Brom
    UI.say = function (who, text, ...a) {
      if (who === 'brom' && text) testi.push(text);
      return _say.call(this, who, text, ...a);
    };
    for (let i = 0; i < 3; i++) {
      runAct(o);
      const fine = performance.now() + 30000;
      while (performance.now() < fine && (G.cut || UI.busy())) {
        const b = document.querySelector('#dchoices button');
        if (b) {
          await sceltaPronta();
          b.click();
        } else UI.advance();
        await new Promise(r => setTimeout(r, 120));
      }
    }
    UI.say = _say;
    return { fuori: !NPC('brom').hidden, testi };
  });
  await rispondi(page);
  t.true('chi non ha voglia non esce', !seccato.fuori);
  t.true('e lo dice con parole sue', seccato.testi.length > 0);
  // nessuno in casa: un biglietto dice dove si trova
  const vuota = await page.evaluate(async () => {
    const b = NPC('brom');
    placeNPC(b, 'main', 47, 41, 0);
    b.act = 'bench';
    const o = G.maps.main.objs.find(o => o.kind === 'door' && o.key === 'forge');
    runAct(o);
    let txt = '';
    const fine = performance.now() + 30000;
    while (performance.now() < fine && (G.cut || UI.busy())) {
      const c = document.querySelector('#dchoices button');
      if (c) {
        await sceltaPronta();
        c.click();
      }
      const d = document.querySelector('#dtext');
      if (d && /Brom|biglietto|traccia/.test(d.textContent)) txt = d.textContent;
      await new Promise(r => setTimeout(r, 120));
      if (txt) break;
    }
    return txt;
  });
  await rispondi(page);
  t.true('a casa vuota si scopre dove è andato', /Brom/.test(vuota));
  // i nuovi abitanti rientrano nella loro casetta, non oltre il ponte
  const res = await page.evaluate(() => {
    const st = G.st,
      R = RES_POOL[0];
    st.free.built['60,30'] = { id: 'casetta' };
    st.free.residents = [{ id: R.id, house: '60,30', day: st.day - 3 }];
    return { porta: homeDoor(R.id).join(','), attesa: resDoor(resOf(R.id)).join(',') };
  });
  t.eq('la porta di casa di un nuovo abitante è la sua casetta', res.porta, res.attesa);

  // --- la cassetta ---
  const cassetta = await page.evaluate(() => {
    const st = G.st;
    st.mailbox = [{ item: 'pane', n: 1, from: NAMES.clara }];
    mailboxTake();
    const testo = document.querySelector('#mbox').textContent;
    UI._mclose = null;
    UI.close();
    return { testo, doni: (st.doni || []).length, taccuino: friendsHTML() };
  });
  t.true(
    'la cassetta dice cosa è arrivato e da chi',
    /Pane/.test(cassetta.testo) && /Clara/.test(cassetta.testo)
  );
  t.eq('il dono resta nel registro', cassetta.doni, 1);
  t.true(
    'e nel taccuino degli abitanti',
    /Doni ricevuti/.test(cassetta.taccuino) && /Clara/.test(cassetta.taccuino)
  );

  t.eq('suono e porte: nessun errore', errors.join('\n'), '');
  await page.close();
};
