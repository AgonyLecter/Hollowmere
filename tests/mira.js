'use strict';
// 10. La mira: con un gatto, una gallina o un sasso accanto a una persona si sceglie il più vicino a dove guardi,
// e il fumetto sopra la testa dice la stessa cosa che fa il tasto azione.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const out = {},
      p = G.player,
      n = G.npcs.find(n => n.id === 'brom');
    G.map = G.maps.main;
    // il giocatore guarda a destra (dir 1 = destra? si cerca la direzione con dx > 0)
    const dir = DIRV.findIndex(v => v[0] > 0 && v[1] === 0);
    const metti = () => {
      setPos(p, 30, 30, dir);
      p.dir = dir;
    };
    metti();
    const ax = p.x + 14,
      ay = p.y;
    n.map = 'main';
    n.hidden = false;
    let detto = null;
    const _tt = talkTo;
    talkTo = x => (detto = x.id);
    const gatto = { k: 'cat', x: 0, y: 0, st: 'sit', t: 1 };
    G.critters = G.critters || [];
    G.critters.push(gatto);
    // 1. persona proprio davanti, gatto lì accanto
    n.x = ax;
    n.y = ay;
    gatto.x = ax + 6;
    gatto.y = ay + 6;
    out.persona = aimScelta().k;
    out.fumetto = promptInfo() && promptInfo().t;
    doAction();
    out.parla = detto;
    // 2. gatto proprio davanti, persona un po' di lato
    detto = null;
    gatto.x = ax;
    gatto.y = ay;
    n.x = ax + 4;
    n.y = ay + 14;
    out.gatto = aimScelta().k;
    out.fumettoGatto = promptInfo() && promptInfo().t;
    // 3. un sasso sulla casella davanti, la persona accanto ma più lontana del sasso
    G.critters.splice(G.critters.indexOf(gatto), 1);
    const [fx, fy] = frontTile();
    G.map.add(
      OB('debris', fx, fy, FREEIMG.sasso, { act: 'debris', dt: 'sasso', solid: [], hits: [[fx, fy]] })
    );
    n.x = fx * 16 + 8;
    n.y = fy * 16 + 12 + 17;
    out.sasso = aimScelta().k;
    talkTo = _tt;
    return out;
  });
  t.eq('persona davanti e gatto accanto: si parla', r.persona, 'npc');
  t.true('il fumetto dice «Parla» o «Presentati»', /Parla|Presentati/.test(r.fumetto || ''));
  t.eq('e il tasto apre davvero il dialogo', r.parla, 'brom');
  t.eq('gatto davanti e persona di lato: si accarezza il gatto', r.gatto, 'critter');
  t.eq('e il fumetto lo dice', r.fumettoGatto, 'Accarezza');
  t.eq('sasso davanti e persona accanto: si prende il sasso', r.sasso, 'tile');
  t.eq('mira: nessun errore', errors.join('\n'), '');
  await page.close();
};
