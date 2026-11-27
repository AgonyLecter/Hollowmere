'use strict';
// 37. Online in due: due partite vere, con un finto Firebase condiviso (tests/finto_firebase: il database sta qui
// in Node, le pagine ne tengono una copia), si vedono quando una va in visita dall'altra. E quando non si vedono,
// il gioco dice perché: l'amico è in casa, vi siete visitati nello stesso momento, oppure non sta giocando.
// Le regole della presenza sono quelle vere: scrive solo chi possiede il codice (proprietari/<codice>/uid).
const path = require('path'),
  fs = require('fs');
const { ROOT, URL, newGame, skipScenes } = require('./helpers');
const FB = path.join(__dirname, 'finto_firebase');
const TIPI = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.png': 'image/png',
  '.json': 'application/json'
};

module.exports = async function (t, { browser }) {
  const DB = {},
    pages = [],
    rifiutati = [];
  const parti = p =>
    String(p || '')
      .split('/')
      .filter(Boolean);
  const leggi = p => {
    let o = DB;
    for (const k of parti(p)) {
      if (o == null || typeof o !== 'object') return null;
      o = o[k];
    }
    return o === undefined ? null : o;
  };
  const scrivi = (p, v) => {
    const ks = parti(p);
    let o = DB;
    for (let i = 0; i < ks.length - 1; i++) {
      if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {};
      o = o[ks[i]];
    }
    if (v == null) delete o[ks[ks.length - 1]];
    else o[ks[ks.length - 1]] = v;
  };
  // le regole che contano qui (come in firebase/regole.json)
  const ammesso = (uid, p) => {
    const k = parti(p),
      mio = pid => leggi(`hollowmere/proprietari/${pid}/uid`) === uid;
    if (k[1] === 'presenza' && k.length >= 4) return mio(k[3]);
    if ((k[1] === 'players' || k[1] === 'villaggi') && k.length >= 3) return mio(k[2]);
    return true;
  };
  const op = async (uid, tipo, p, v) => {
    if (!ammesso(uid, p)) {
      rifiutati.push(p);
      return { err: 'PERMISSION_DENIED' };
    }
    if (tipo === 'set') scrivi(p, v);
    else for (const [k, x] of Object.entries(v || {})) scrivi(p + '/' + k, x);
    await Promise.all(
      pages.map(pg => pg.evaluate(db => window.__fbSync && window.__fbSync(db), DB).catch(() => {}))
    );
    return {};
  };
  const apri = async (uid, seme) => {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } }),
      errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message)));
    await page.route('http://hollowmere.test/**', route => {
      const rel =
          decodeURIComponent(new globalThis.URL(route.request().url()).pathname).replace(/^\/+/, '') ||
          'index.html',
        f = path.join(ROOT, rel);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory())
        return route.fulfill({ status: 404, body: '' });
      route.fulfill({
        status: 200,
        body: fs.readFileSync(f),
        headers: { 'content-type': TIPI[path.extname(f)] || 'application/octet-stream' }
      });
    });
    await page.route('https://www.gstatic.com/**', route => {
      const u = route.request().url(),
        n = /app\.js$/.test(u)
          ? 'app.js'
          : /database\.js$/.test(u)
            ? 'db.js'
            : /auth\.js$/.test(u)
              ? 'auth.js'
              : 'analytics.js';
      route.fulfill({
        status: 200,
        body: fs.readFileSync(path.join(FB, n)),
        headers: { 'content-type': 'text/javascript', 'access-control-allow-origin': '*' }
      });
    });
    await page.exposeBinding('__fbOp', (src, tipo, p, v) => op(uid, tipo, p, v));
    await page.addInitScript(
      ([uid, seme]) => {
        window.__fbUid = uid;
        let s = seme >>> 0;
        Math.random = () => {
          s = (s + 0x6d2b79f5) >>> 0;
          let x = s;
          x = Math.imul(x ^ (x >>> 15), x | 1);
          x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
          return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };
        try {
          if (!sessionStorage.getItem('__k')) {
            localStorage.clear();
            sessionStorage.setItem('__k', '1');
          }
        } catch (e) {}
      },
      [uid, seme]
    );
    pages.push(page);
    await page.goto(URL);
    await page.waitForFunction(
      () => typeof G !== 'undefined' && G.mode === 'title' && ICON && ICON.hoe && NET.ok,
      null,
      {
        timeout: 30000
      }
    );
    return { page, errors };
  };
  const A = await apri('uidA', 111),
    B = await apri('uidB', 222);
  for (const [P, n] of [
    [A, 'Ada'],
    [B, 'Bruno']
  ]) {
    await newGame(P.page, n, 'f');
    await P.page.evaluate(() => {
      freeStart(3);
    });
    await skipScenes(P.page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  }
  await A.page.waitForTimeout(2500);
  const pidA = await A.page.evaluate(() => G.st.pid),
    pidB = await B.page.evaluate(() => G.st.pid);
  const chip = P =>
    P.page.evaluate(() => {
      const e = document.querySelector('#pchip');
      return e && !e.classList.contains('hide') ? e.textContent : '';
    });
  const vede = (P, pid) => P.page.evaluate(id => !!G.others[id], pid);
  const visita = async (P, pid) => {
    await P.page.evaluate(id => {
      startVisit(id);
    }, pid);
    await skipScenes(P.page, { until: () => !!(G.visit && !G.cut && !UI.busy()) });
  };

  // Bruno va da Ada, che è in casa: si sanno lì tutti e due, e il gioco dice dove
  await visita(B, pidA);
  await B.page.waitForTimeout(2500);
  t.true('in visita, Bruno sa che Ada è nel suo villaggio', await vede(B, pidA));
  t.true('e Ada sa che è arrivato Bruno', await vede(A, pidB));
  t.true('Bruno legge che Ada è in casa', /Ada è in casa/.test(await chip(B)));
  t.true('Ada legge che Bruno è fuori', /Bruno è qui, fuori/.test(await chip(A)));
  // Ada esce: sono nello stesso posto, si vedono e l'avviso sparisce
  await A.page.evaluate(() => {
    goMap('main', 46, 41, 3, true);
  });
  await B.page.waitForTimeout(2500);
  const insieme = await B.page.evaluate(id => {
    const o = G.others[id];
    return !!o && o.map === G.map.id && Math.hypot(o.x - G.player.x, o.y - G.player.y) < 80;
  }, pidA);
  t.true('fuori tutti e due, Bruno vede Ada accanto a sé', insieme);
  t.eq('e nessun avviso', (await chip(B)) + (await chip(A)), '');
  // visite incrociate: Ada va da Bruno mentre Bruno è da lei
  await visita(A, pidB);
  await A.page.waitForTimeout(8000);
  t.true('visitati nello stesso momento: il gioco lo dice', /nello stesso momento/.test(await chip(A)));
  // Bruno torna a casa, poi chiude il gioco: Ada, da lui, legge che non sta giocando
  await B.page.evaluate(() => {
    endVisit(true);
  });
  await A.page.waitForTimeout(2500);
  t.true('Bruno torna a casa e Ada (in visita da lui) lo trova', await vede(A, pidB));
  await B.page.evaluate(() => {
    toTitle();
  });
  await op('uidB', 'set', `hollowmere/villaggi/${pidB}/dove`, null); // quello che fa Firebase quando si chiude
  await A.page.evaluate(() => {
    AMICO_DOVE.chiesto = 0;
  });
  await A.page.waitForTimeout(8000);
  t.true('chiuso il gioco, Ada legge che Bruno non sta giocando', /non sta giocando/.test(await chip(A)));
  t.eq('nessuna presenza rifiutata', rifiutati.join(', '), '');
  t.eq('online: nessun errore', A.errors.concat(B.errors).join('\n'), '');
  await A.page.close();
  await B.page.close();
};
