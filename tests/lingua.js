'use strict';
// 38. Le lingue: dal menu iniziale si sceglie l'inglese e il gioco si ricarica tradotto (titolo, menu, nuova partita,
// la lettera del nonno, il menu di gioco, lo zaino). Le frasi ancora da tradurre restano in italiano e si contano:
// quante sono lo dice tools/testi.js, qui si controlla che le schermate già tradotte lo siano tutte.
const { openGame, skipScenes } = require('./helpers');
const { tutte, dizionario } = require('../tools/testi');
module.exports = async function (t, { browser }) {
  // il dizionario: ogni chiave è una frase italiana del gioco (o un pezzo che il gioco compone), nessuna vuota
  const D = dizionario(),
    vuote = Object.entries(D)
      .filter(([, v]) => typeof v !== 'string' || !v.trim())
      .map(([k]) => k);
  t.eq('nessuna traduzione vuota', vuote.join(' | '), '');
  // le forme {maschile|femminile} della chiave: nella traduzione, se ci sono, devono restare ben chiuse
  const rotte = Object.entries(D)
    .filter(([, v]) => (v.match(/\{/g) || []).length !== (v.match(/\}/g) || []).length)
    .map(([k]) => k);
  t.eq('le parentesi {…} delle traduzioni sono chiuse', rotte.join(' | '), '');
  const per = tutte(),
    tot = Object.values(per).reduce((a, s) => a + s.size, 0),
    fatte = Object.values(per).reduce((a, s) => a + [...s].filter(k => D[k] != null).length, 0);
  t.ok(`inglese: ${fatte}/${tot} frasi tradotte (${((100 * fatte) / tot).toFixed(1)}%)`);

  const { page, errors } = await openGame(browser);
  // in italiano il gioco non tocca niente
  t.eq(
    'in italiano tr() restituisce la frase com’è',
    await page.evaluate(() => tr('Nuova partita')),
    'Nuova partita'
  );
  // si sceglie l'inglese dal menu iniziale: il gioco si ricarica
  await page.evaluate(() => sessionStorage.setItem('__keep', '1'));
  await page.click('[data-a=lingua]');
  await page.waitForSelector('#mbox [data-lingua=en]');
  await Promise.all([page.waitForNavigation(), page.click('#mbox [data-lingua=en]')]);
  await page.waitForFunction(() => typeof G !== 'undefined' && G.mode === 'title' && ICON && ICON.hoe, null, {
    timeout: 20000
  });
  await page.waitForTimeout(300);
  const mancantiIn = sel =>
    page.evaluate(sel => {
      const el = document.querySelector(sel);
      if (!el) return 'manca ' + sel;
      const out = [];
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode()); ) {
        const s = n.nodeValue.trim();
        if (s && TR.mancanti.has(s)) out.push(s);
      }
      return out.join(' | ');
    }, sel);
  const titolo = await page.evaluate(() => document.querySelector('#tmenu').innerText);
  t.true(
    'il menu iniziale è in inglese',
    /New game/.test(titolo) && /Options/.test(titolo) && !/Nuova partita/.test(titolo)
  );
  t.eq('nel titolo nessuna frase italiana', await mancantiIn('#title'), '');
  t.eq('il titolo della pagina', await page.evaluate(() => document.title), 'Hollowmere — The Quiet Valley');
  t.eq('la lingua della pagina', await page.evaluate(() => document.documentElement.lang), 'en');
  // nuova partita: chi sei, la lettera del nonno (scritta lettera per lettera, già tradotta)
  await page.click('[data-a=new]');
  await page.waitForSelector('#mbox input');
  t.eq('«Chi sei?» in inglese', await mancantiIn('#mbox'), '');
  await page.click('text=Girl');
  await page.fill('#mbox input', 'Ada');
  await page.click('text=Begin');
  await page.waitForSelector('#lt');
  await page.waitForTimeout(400);
  t.true(
    'la lettera del nonno comincia in inglese',
    /^Dear Ada,/.test(await page.evaluate(() => $('#lt').textContent))
  );
  await skipScenes(page);
  // il menu di gioco e lo zaino
  await page.evaluate(() => UI.pauseKey());
  await page.waitForTimeout(300);
  const menu = await page.evaluate(() => document.querySelector('#mbox').innerText);
  t.true(
    'il menu di gioco è in inglese',
    /Journal/.test(menu) && /Save/.test(menu) && /CONTROLS/i.test(menu)
  );
  await page.evaluate(() => UI.close());
  t.true(
    'la data in alto è in inglese',
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d+ · (Autumn|Winter|Spring|Summer)/.test(
      await page.evaluate(() => $('#cdayt').textContent)
    )
  );
  // e si torna all'italiano dalle Opzioni
  await page.evaluate(() => {
    toTitle();
  });
  await page.waitForSelector('#tmenu', { state: 'visible' });
  await page.click('[data-a=opts]');
  await page.waitForSelector('#mbox [data-lingua=it]');
  await Promise.all([page.waitForNavigation(), page.click('#mbox [data-lingua=it]')]);
  await page.waitForFunction(() => typeof G !== 'undefined' && G.mode === 'title' && ICON && ICON.hoe);
  t.true(
    'dalle Opzioni si torna all’italiano',
    /Nuova partita/.test(await page.evaluate(() => $('#tmenu').innerText))
  );
  t.eq('lingua: nessun errore', errors.join('\n'), '');
  await page.close();
};
