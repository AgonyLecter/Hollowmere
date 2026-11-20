'use strict';
// Strumenti comuni dei test: apre il gioco in Chromium headless, con il caso (Math.random) prevedibile
// e la raccolta di ogni errore della pagina.
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error("Serve Playwright: npm install (oppure usa l'ambiente con Playwright già installato).");
  process.exit(2);
}

// errori di rete attesi in locale (font Google, Firebase): non sono bug del gioco
const NOISE = [
  /Failed to load resource/,
  /ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|net::/i,
  /firebase/i,
  /gstatic/i
];

async function openGame(browser, opts = {}) {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (NOISE.some(r => r.test(t))) return;
    errors.push('console: ' + t);
  });
  await page.addInitScript(seed => {
    // caso prevedibile: stessa sequenza a ogni esecuzione
    let s = seed >>> 0;
    const rnd = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    Math.random = rnd;
    window.__seed = n => {
      s = n >>> 0;
    };
    // gli errori catturati dal gioco (console.error(e)) con la traccia completa
    const ce = console.error.bind(console);
    console.error = (...a) => ce(...a.map(x => (x && x.stack ? x.stack : x)));
    if (location.hash !== '#keep') {
      try {
        localStorage.clear();
      } catch (e) {}
    }
  }, opts.seed ?? 12345);
  await page.goto(URL);
  await page.waitForFunction(() => typeof G !== 'undefined' && G.mode === 'title' && ICON && ICON.hoe, null, {
    timeout: 20000
  });
  return { page, errors };
}
// fa scorrere dialoghi e scene finché il giocatore non ha di nuovo i comandi
async function skipScenes(page, { max = 200, until } = {}) {
  for (let i = 0; i < max; i++) {
    const s = await page.evaluate(() => ({ cut: G.cut, busy: UI.busy(), mode: G.mode }));
    if (until ? await page.evaluate(until) : !s.cut && !s.busy && s.mode === 'game') return true;
    await page.keyboard.press('Space');
    await page.waitForTimeout(120);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(40);
  }
  return false;
}
async function newGame(page, name = 'Prova', g = 'm') {
  await page.click('[data-a=new]');
  await page.waitForSelector('#mbox input');
  if (g === 'f') await page.click('text=Ragazza');
  await page.fill('#mbox input', name);
  await page.click('text=Inizia');
  return skipScenes(page);
}
module.exports = { ROOT, URL, chromium, openGame, skipScenes, newGame };
