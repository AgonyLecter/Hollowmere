'use strict';
// orrore della storia attivo (dal Capitolo II, mai nel gioco libero)
function H2(st) {
  st = st || G.st;
  return !!st && st.chapter >= 2 && !st.free;
}
// ================= CORE =================
let W = 480;
const H = 270,
  TS = 16,
  MAXW = 640;
const RS = 2;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
cv.width = W * RS;
cv.height = H * RS;
ctx.imageSmoothingEnabled = false;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp = (a, b, t) => a + (b - a) * t;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let _seed = 1;
function srand(s) {
  _seed = s >>> 0 || 1;
}
function rnd() {
  _seed ^= _seed << 13;
  _seed >>>= 0;
  _seed ^= _seed >>> 17;
  _seed ^= _seed << 5;
  _seed >>>= 0;
  return _seed / 4294967296;
}
function ri(a, b) {
  return a + Math.floor(rnd() * (b - a + 1));
}
function hsh(x, y) {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return h;
}
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
}
function fit() {
  const vw = innerWidth,
    vh = innerHeight;
  // larghezza logica adattiva: riempie schermi larghi (es. telefoni 20:9) invece di lasciare bande nere
  const nw = clamp(Math.round((H * vw) / vh / 2) * 2, 480, MAXW);
  if (nw !== W || cv.height !== H * RS) {
    W = nw;
    cv.width = W * RS;
    cv.height = H * RS;
    ctx.imageSmoothingEnabled = false;
  }
  const s = Math.min(vw / W, vh / H),
    r = document.documentElement.style;
  r.setProperty('--gw', W);
  r.setProperty('--s', s);
}
addEventListener('resize', fit);
if (window.visualViewport) visualViewport.addEventListener('resize', fit);
// su telefono: qualsiasi tocco nel menu iniziale attiva lo schermo intero (serve un gesto dell'utente)
const fsTap = () => {
  if (!matchMedia('(pointer:coarse)').matches) return;
  if (document.fullscreenElement || document.webkitFullscreenElement) return;
  const t = document.getElementById('title');
  if (t && !t.classList.contains('hide')) goFull(true);
};
addEventListener('touchend', fsTap, { passive: true });
addEventListener('click', fsTap);
addEventListener('orientationchange', () => setTimeout(fit, 250));
fit();
// ---------- punti di estensione ----------
// Un file che vuole aggiungere qualcosa a una funzione di un altro file NON la sovrascrive: si iscrive qui.
//   Ext.on('applyFree', (m, st) => { ... })        dopo la funzione, in ordine di caricamento
//   Ext.on('applyFree:prima', (m, st) => { ... })  prima della funzione, in ordine inverso di caricamento
//   Ext.on('freeAct', (fx, fy) => true)             intercetta: chi restituisce true ferma gli altri;
//                                                   l'ultimo file caricato ha la precedenza
// Ext.elenco() mostra chi è iscritto a cosa (utile in console).
const Ext = {
  _h: {},
  on(punto, fn) {
    const L = (this._h[punto] = this._h[punto] || []);
    L.push(fn);
    return fn;
  },
  // dopo: in ordine di iscrizione
  run(punto, ...a) {
    for (const f of this._h[punto] || []) f(...a);
  },
  // prima: dall'ultimo iscritto al primo (come quando ognuno avvolgeva il precedente)
  runPrima(punto, ...a) {
    const L = this._h[punto] || [];
    for (let i = L.length - 1; i >= 0; i--) L[i](...a);
  },
  // intercetta: dall'ultimo iscritto al primo, si ferma al primo che restituisce un valore vero
  intercetta(punto, ...a) {
    const L = this._h[punto] || [];
    for (let i = L.length - 1; i >= 0; i--) {
      const r = L[i](...a);
      if (r) return r;
    }
    return false;
  },
  // somma: ogni iscritto aggiunge un numero
  somma(punto, ...a) {
    let s = 0;
    for (const f of this._h[punto] || []) s += f(...a) || 0;
    return s;
  },
  elenco() {
    return Object.fromEntries(Object.entries(this._h).map(([k, L]) => [k, L.length]));
  }
};
const LS = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  }
};
const SC = n => `${n} ${Math.abs(n) === 1 ? 'scudo' : 'scudi'}`,
  CZ = n => `<span class="coin"></span>${n}`;
function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}
const DIRV = [
  [0, 1],
  [-1, 0],
  [1, 0],
  [0, -1]
]; // down,left,right,up

// global game object
const G = {
  st: null,
  maps: {},
  map: null,
  player: null,
  npcs: [],
  horse: null,
  mode: 'boot',
  cut: 0,
  paused: false,
  t: 0,
  cam: { x: 0, y: 0 },
  parts: [],
  floats: [],
  shake: 0,
  flash: { a: 0, c: '#fff' },
  horror: 0,
  night: 0,
  clockAcc: 0,
  scare: 0,
  bubbles: [],
  prints: []
};

// ================= INPUT =================
const IN = {
  keys: {},
  jx: 0,
  jy: 0,
  actQ: false,
  touch: false,
  mx() {
    let x = 0;
    if (this.keys.ArrowLeft || this.keys.KeyA) x--;
    if (this.keys.ArrowRight || this.keys.KeyD) x++;
    return x || this.jx;
  },
  my() {
    let y = 0;
    if (this.keys.ArrowUp || this.keys.KeyW) y--;
    if (this.keys.ArrowDown || this.keys.KeyS) y++;
    return y || this.jy;
  },
  takeAct() {
    const a = this.actQ;
    this.actQ = false;
    return a;
  }
};
function onActKey() {
  AU.resume();
  if (UI.dlgOpen) {
    UI.advance();
    return;
  }
  if (UI.modalOpen || G.cut || G.mode !== 'game') return;
  IN.actQ = true;
}
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') {
    if (e.code === 'Enter' && UI.onEnter) UI.onEnter();
    return;
  }
  IN.keys[e.code] = true;
  AU.resume();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') onActKey();
  if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'Tab') {
    e.preventDefault();
    UI.pauseKey();
  }
  if (e.code === 'KeyR' && G.mode === 'game') UI.swapRow();
  if (/^Digit[0-9]$/.test(e.code)) {
    let n = +e.code[5];
    n = n === 0 ? 9 : n - 1;
    UI.selectSlot(n);
  }
  if (e.code === 'KeyF') goFull();
});
addEventListener('keyup', e => {
  IN.keys[e.code] = false;
});
addEventListener('blur', () => {
  IN.keys = {};
});
addEventListener(
  'wheel',
  e => {
    if (G.mode === 'game' && G.st && !UI.modalOpen) {
      UI.selectSlot((G.st.sel + (e.deltaY > 0 ? 1 : 9)) % 10);
    }
  },
  { passive: true }
);
addEventListener(
  'touchstart',
  () => {
    if (!IN.touch) {
      IN.touch = true;
      document.body.classList.add('touch');
    }
  },
  { passive: true }
);
if (matchMedia('(pointer:coarse)').matches) {
  IN.touch = true;
  document.body.classList.add('touch');
}
(function () {
  const jz = $('#joyzone'),
    joy = $('#joy'),
    knob = $('#knob');
  let jid = null,
    ox = 0,
    oy = 0;
  jz.addEventListener('pointerdown', e => {
    if (UI.dlgOpen) {
      onActKey();
      return;
    }
    jid = e.pointerId;
    try {
      jz.setPointerCapture(jid);
    } catch (_) {}
    const r = jz.getBoundingClientRect();
    ox = e.clientX;
    oy = e.clientY;
    joy.style.left = e.clientX - r.left + 'px';
    joy.style.top = e.clientY - r.top + 'px';
    joy.classList.add('on');
    AU.resume();
  });
  jz.addEventListener('pointermove', e => {
    if (e.pointerId !== jid) return;
    const s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 2;
    const R = s * 20;
    let dx = e.clientX - ox,
      dy = e.clientY - oy;
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx *= R / d;
      dy *= R / d;
    }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    IN.jx = Math.abs(dx) > R * 0.25 ? dx / R : 0;
    IN.jy = Math.abs(dy) > R * 0.25 ? dy / R : 0;
  });
  const end = e => {
    if (e.pointerId !== jid) return;
    jid = null;
    IN.jx = IN.jy = 0;
    knob.style.transform = '';
    joy.classList.remove('on');
  };
  jz.addEventListener('pointerup', end);
  jz.addEventListener('pointercancel', end);
  $('#bA').addEventListener('pointerdown', e => {
    e.preventDefault();
    onActKey();
  });
  cv.addEventListener('pointerdown', e => {
    AU.resume();
    if (UI.dlgOpen) {
      onActKey();
      return;
    }
    if (e.pointerType !== 'mouse' || G.mode !== 'game' || G.cut || UI.modalOpen) return;
    const r = cv.getBoundingClientRect();
    const wx = ((e.clientX - r.left) / r.width) * W + G.cam.x,
      wy = ((e.clientY - r.top) / r.height) * H + G.cam.y;
    const p = G.player;
    const dx = wx - p.x,
      dy = wy - (p.y - 8);
    if (Math.abs(dx) > Math.abs(dy)) p.dir = dx < 0 ? 1 : 2;
    else p.dir = dy < 0 ? 3 : 0;
    IN.actQ = true;
  });
  $('#dlg').addEventListener('pointerdown', e => {
    if (e.target.tagName !== 'BUTTON') onActKey();
  });
})();
let fsAutoT = 0;
async function goFull(auto) {
  AU.resume();
  const el = document.documentElement;
  if (!auto && Date.now() - fsAutoT < 1200) return; // il tocco che ha già attivato lo schermo intero automatico
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (auto) fsAutoT = Date.now();
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      try {
        await screen.orientation.lock('landscape');
      } catch (_) {}
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  } catch (e) {
    if (!auto) UI.toast('Schermo intero non disponibile qui');
  }
  setTimeout(fit, 300);
}
// ================= AUDIO (tutto sintetizzato) =================
// Gli effetti sono qui; la musica (i brani, gli strumenti, l'ombra) è in musica.js.
const AU = {
  c: null,
  vol: { m: 0.6, s: 0.8 },
  mode: 'none',
  step: 0,
  next: 0,
  init() {
    if (this.c) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    let c;
    try {
      c = this.c = new AC();
    } catch (e) {
      return;
    }
    this.out = c.createDynamicsCompressor();
    this.out.connect(c.destination);
    this.master = c.createGain();
    this.master.connect(this.out);
    this.mus = c.createGain();
    this.mus.connect(this.master);
    this.sfx = c.createGain();
    this.sfx.connect(this.master);
    const N = c.sampleRate * 2,
      b = c.createBuffer(1, N, c.sampleRate),
      d = b.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    this.nb = b;
    const L = (c.sampleRate * 3) | 0,
      ir = c.createBuffer(2, L, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const q = ir.getChannelData(ch);
      for (let i = 0; i < L; i++) q[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.6);
    }
    this.rev = c.createConvolver();
    this.rev.buffer = ir;
    this.revG = c.createGain();
    this.revG.gain.value = 0.45;
    this.rev.connect(this.revG);
    this.revG.connect(this.master);
    const ns = c.createBufferSource();
    ns.buffer = b;
    ns.loop = true;
    this.windF = c.createBiquadFilter();
    this.windF.type = 'bandpass';
    this.windF.frequency.value = 500;
    this.windF.Q.value = 0.6;
    this.windG = c.createGain();
    this.windG.gain.value = 0;
    ns.connect(this.windF);
    this.windF.connect(this.windG);
    this.windG.connect(this.master);
    ns.start();
    const rs = c.createBufferSource();
    rs.buffer = b;
    rs.loop = true;
    const rf = c.createBiquadFilter();
    rf.type = 'highpass';
    rf.frequency.value = 1800;
    this.rainG = c.createGain();
    this.rainG.gain.value = 0;
    rs.connect(rf);
    rf.connect(this.rainG);
    this.rainG.connect(this.master);
    rs.start(0, 0.7);
    this.next = c.currentTime + 0.1;
    this.applyVol();
  },
  applyVol() {
    if (!this.c) return;
    this.mus.gain.value = this.vol.m * 0.55;
    this.sfx.gain.value = this.vol.s;
  },
  resume() {
    this.init();
    if (this.c && this.c.state === 'suspended') this.c.resume();
  },
  env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  },
  osc(type, f, t, dur, peak, dest, a = 0.005, slide) {
    const c = this.c,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    this.env(g, t, a, peak, dur);
    o.connect(g);
    g.connect(dest || this.sfx);
    o.start(t);
    o.stop(t + a + dur + 0.05);
    return g;
  },
  noise(t, dur, peak, ft, freq, q = 1, dest, a = 0.005, fs) {
    const c = this.c,
      s = c.createBufferSource();
    s.buffer = this.nb;
    const f = c.createBiquadFilter();
    f.type = ft;
    f.frequency.setValueAtTime(freq, t);
    if (fs) f.frequency.exponentialRampToValueAtTime(fs, t + dur);
    f.Q.value = q;
    const g = c.createGain();
    this.env(g, t, a, peak, dur);
    s.connect(f);
    f.connect(g);
    g.connect(dest || this.sfx);
    s.start(t, Math.random());
    s.stop(t + a + dur + 0.05);
    return g;
  },
  mtof(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  },
  play(n, delay = 0) {
    if (!this.c || !SFX[n]) return;
    try {
      SFX[n](this, this.c.currentTime + delay);
    } catch (e) {}
  },
  setMode(m) {
    if (this.mode !== m) {
      this.mode = m;
      this.step = 0;
    }
  },
  tick() {
    if (!this.c) return;
    const c = this.c,
      now = c.currentTime,
      Hh = G.horror || 0;
    const wind =
      (this.mode === 'titolo' ? 0.035 : 0.02) +
      G.night * 0.05 +
      Hh * 0.05 +
      (this.mode === 'inseguimento' ? 0.05 : 0);
    this.windG.gain.setTargetAtTime(wind, now, 0.6);
    const rain =
      G.st && G.st.weather === 'pioggia' && G.mode === 'game' ? (G.map && !G.map.interior ? 0.09 : 0.03) : 0;
    this.rainG.gain.setTargetAtTime(rain, now, 0.8);
    this.windF.frequency.setTargetAtTime(380 + Math.sin(now * 0.27) * 220 + Hh * 300, now, 0.6);
    // la colonna sonora e i suoni del mondo
    if (typeof Musica !== 'undefined') Musica.tick(now, Hh);
  },
  chirp(t) {
    for (let i = 0; i < 3; i++) this.osc('sine', 4200 + Math.random() * 300, t + i * 0.06, 0.03, 0.015);
  },
  bird(t) {
    const f = 1800 + Math.random() * 1200;
    this.osc('sine', f, t, 0.08, 0.03, null, 0.005, f * 1.4);
    this.osc('sine', f * 1.2, t + 0.12, 0.08, 0.025, null, 0.005, f * 0.9);
  }
};
const SFX = {
  step: (a, t) => a.noise(t, 0.035, 0.05, 'highpass', 1600 + Math.random() * 900),
  ui: (a, t) => a.osc('square', 880, t, 0.04, 0.04),
  blip: (a, t) => a.osc('square', 520 + Math.random() * 80, t, 0.025, 0.025),
  ok: (a, t) => {
    a.osc('triangle', 660, t, 0.08, 0.15);
    a.osc('triangle', 990, t + 0.07, 0.14, 0.15);
  },
  err: (a, t) => a.osc('square', 140, t, 0.15, 0.07),
  hoe: (a, t) => {
    a.noise(t, 0.12, 0.4, 'lowpass', 500);
    a.osc('sine', 95, t, 0.1, 0.3, null, 0.002, 50);
  },
  water: (a, t) => a.noise(t, 0.35, 0.18, 'bandpass', 1100, 2, null, 0.05, 3200),
  plant: (a, t) => a.osc('sine', 300, t, 0.08, 0.2, null, 0.002, 620),
  pick: (a, t) => {
    a.osc('triangle', 523, t, 0.06, 0.2);
    a.osc('triangle', 784, t + 0.06, 0.1, 0.2);
  },
  coin: (a, t) => {
    a.osc('square', 1318, t, 0.05, 0.06);
    a.osc('square', 1760, t + 0.05, 0.12, 0.06);
  },
  door: (a, t) => {
    a.noise(t, 0.2, 0.25, 'lowpass', 300);
    a.osc('sine', 70, t, 0.15, 0.25);
  },
  bell: (a, t) => {
    const b = 196;
    [
      [1, 0.45, 4.5],
      [2.01, 0.28, 3.5],
      [2.42, 0.22, 3],
      [3.02, 0.18, 2.2],
      [4.2, 0.1, 1.6],
      [5.43, 0.07, 1.1]
    ].forEach(([r, v, d]) => {
      const g = a.osc('sine', b * r, t, d, v, a.sfx, 0.003);
      g.connect(a.rev);
    });
  },
  knock: (a, t) => {
    [0, 0.24, 0.48].forEach(d => {
      a.noise(t + d, 0.08, 0.7, 'lowpass', 260);
      a.osc('sine', 80, t + d, 0.09, 0.55);
    });
  },
  hooves: (a, t) => {
    for (let i = 0; i < 10; i++) {
      const d = Math.floor(i / 3) * 0.42 + (i % 3) * 0.1;
      a.noise(t + d, 0.06, 0.45, 'lowpass', 230);
      a.osc('sine', 58, t + d, 0.07, 0.4);
    }
  },
  hoof1: (a, t) => {
    a.noise(t, 0.05, 0.3, 'lowpass', 240);
    a.osc('sine', 60, t, 0.06, 0.3);
  },
  sting: (a, t) => {
    [98, 104, 147, 156, 311, 330].forEach(f => {
      const g = a.osc('sawtooth', f, t, 2, 0.05, a.sfx, 0.02);
      g.connect(a.rev);
    });
    a.noise(t, 1.6, 0.35, 'bandpass', 700, 0.5, null, 0.03, 4200);
  },
  scratch: (a, t) => {
    for (let i = 0; i < 12; i++)
      a.noise(t + i * 0.07 + Math.random() * 0.03, 0.06, 0.22, 'bandpass', 2400 + Math.random() * 1600, 3);
  },
  heart: (a, t) => {
    a.osc('sine', 55, t, 0.12, 0.6);
    a.osc('sine', 50, t + 0.18, 0.15, 0.45);
  },
  whisper: (a, t) => {
    for (let i = 0; i < 7; i++) a.noise(t + i * 0.14, 0.18, 0.07, 'bandpass', 1500 + Math.random() * 2500, 6);
  },
  laugh: (a, t) => {
    [0, 1, 2, 3, 4].forEach(i => a.osc('triangle', 760 - i * 55, t + i * 0.11, 0.07, 0.07));
  },
  bury: (a, t) => {
    a.noise(t, 0.18, 0.3, 'lowpass', 420);
    a.noise(t + 0.24, 0.18, 0.3, 'lowpass', 360);
  },
  paint: (a, t) => a.noise(t, 0.3, 0.12, 'bandpass', 900, 1, null, 0.05, 600),
  page: (a, t) => a.noise(t, 0.25, 0.1, 'highpass', 3000, 1, null, 0.02),
  sleep: (a, t) => {
    [72, 67, 64, 60].forEach((m, i) => {
      const g = a.osc('sine', a.mtof(m), t + i * 0.28, 0.7, 0.14);
      g.connect(a.rev);
    });
  },
  thunder: (a, t) => {
    a.noise(t, 2.8, 0.7, 'lowpass', 260, 1, null, 0.01, 50);
  },
  scream: (a, t) => {
    const g = a.osc('sawtooth', 900, t, 1.1, 0.13, a.sfx, 0.01, 260);
    g.connect(a.rev);
    a.noise(t, 1.1, 0.45, 'bandpass', 2200, 1);
  },
  count: (a, t) => {
    const g = a.osc('sine', 1046, t, 0.5, 0.1);
    g.connect(a.rev);
  },
  wrongcount: (a, t) => {
    const g = a.osc('sine', 988, t, 1.2, 0.14);
    g.connect(a.rev);
    const g2 = a.osc('sine', 1046, t, 1.2, 0.1);
    g2.connect(a.rev);
  },
  eat: (a, t) => {
    a.noise(t, 0.06, 0.2, 'bandpass', 1200, 2);
    a.noise(t + 0.12, 0.06, 0.2, 'bandpass', 1000, 2);
  },
  caw: (a, t) => {
    [0, 0.18].forEach(d => {
      a.noise(t + d, 0.12, 0.08, 'bandpass', 1100, 4);
      a.osc('sawtooth', 520, t + d, 0.1, 0.025, null, 0.005, 340);
    });
  },
  cluck: (a, t) => {
    [0, 0.09].forEach(d => a.osc('square', 720, t + d, 0.04, 0.015, null, 0.002, 480));
  },
  croak: (a, t) => {
    [0, 0.13].forEach(d => a.osc('sawtooth', 105, t + d, 0.09, 0.03));
  },
  meow: (a, t) => a.osc('triangle', 700, t, 0.35, 0.05, null, 0.04, 520),
  slam: (a, t) => {
    a.noise(t, 0.4, 0.9, 'lowpass', 200);
    a.osc('sine', 45, t, 0.4, 0.8);
  }
};
