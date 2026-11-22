'use strict';
// 14. La storia fino in fondo: i tre finali, dalla Festa del Raccolto al titolo, senza errori.
// Ogni finale riparte da una partita nuova portata al Capitolo IV (bandierine dei capitoli precedenti).
const { openGame, newGame, skipScenes } = require('./helpers');
const FINALI = [
  // la fuga riesce solo con Clara alleata e la sua lanterna (senza, il Varco non si apre: finale 2)
  [1, "addItem('lanterna'), escapeEnd()"],
  [2, "ending2(true, 'sidro')"],
  [3, 'breakPact()']
];
// le scene di mezzo: ognuna parte e finisce (le si risponde premendo i tasti)
const SCENE = [
  ['il costume di Tobia', 'tobiaCostumeScene()', {}],
  ['la verità di Ezekiel', "ezekielTruth(NPC('ezekiel'))", { woodDone: 1 }],
  ['Clara alleata', "claraAlly(NPC('clara'))", { woodDone: 1, ezTruth: 1 }],
  ['il Varco (Capitolo III)', 'varcoCh3()', { woodDone: 1, ezTruth: 1, claraAlly: 1, ch2end: 1 }],
  ["l'albero", 'treeScene()', { woodDone: 1, ezTruth: 1, claraAlly: 1, ch2end: 1 }],
  ['la Festa', 'festaStart(true)', { woodDone: 1, ezTruth: 1, claraAlly: 1, ch1end: 1, ch2end: 1, ch3end: 1 }]
];
module.exports = async function (t, { browser }) {
  for (const [nome, chiamata, flags] of SCENE) {
    const { page, errors } = await openGame(browser);
    await newGame(page, 'Ugo', 'm');
    await page.evaluate(f => {
      Object.assign(G.st.flags, f);
      goMap('main', 44, 30, 0, true);
    }, flags);
    await page.waitForTimeout(400);
    await skipScenes(page, { max: 30 });
    await page.evaluate(c => {
      window.__fine = 0;
      Promise.resolve(eval(c))
        .catch(e => console.error('scena: ' + (e.stack || e)))
        .finally(() => (window.__fine = 1));
    }, chiamata);
    const ok = await skipScenes(page, { max: 300, until: () => window.__fine === 1 && !G.cut && !UI.busy() });
    t.true(`scena «${nome}»: arriva in fondo`, ok);
    t.eq(`scena «${nome}»: nessun errore`, errors.join('\n'), '');
    await page.close();
  }
  for (const [n, chiamata] of FINALI) {
    const { page, errors } = await openGame(browser);
    await newGame(page, 'Ugo', 'm');
    await page.evaluate(() => {
      const st = G.st,
        F = st.flags;
      Object.assign(F, {
        woodDone: 1,
        tobiaScene: 1,
        ezTruth: 1,
        claraAlly: 1,
        ch1end: 1,
        ch2end: 1,
        ch3end: 1,
        ch2card: 1,
        ch3card: 1,
        ch4card: 1
      });
      st.chapter = 4;
      F.ch4day = st.day;
      st.time = 21 * 60;
      goMap('main', 44, 30, 0, true);
    });
    await page.waitForTimeout(500);
    await skipScenes(page, { max: 30 });
    await page.evaluate(c => {
      // la scena parte da sola; le si risponde premendo i tasti, come un giocatore
      window.__fine = 0;
      Promise.resolve(eval(c))
        .catch(e => console.error('finale: ' + (e.stack || e)))
        .finally(() => (window.__fine = 1));
    }, chiamata);
    const ok = await skipScenes(page, { max: 400, until: () => G.mode === 'title' || window.__fine === 1 });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      titolo: G.mode === 'title',
      finali: JSON.parse(LS.get('hm_endings') || '[]')
    }));
    t.true(`finale ${n}: si arriva fino in fondo`, ok && r.titolo);
    t.true(`finale ${n}: resta registrato`, r.finali.includes(n));
    t.eq(`finale ${n}: nessun errore`, errors.join('\n'), '');
    await page.close();
  }
};
