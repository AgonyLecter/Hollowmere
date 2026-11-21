'use strict';
// ================= LA GAZZETTA DELLA VALLE (multiplayer) =================
// Il «social» della Valle, alla maniera dell'Ottocento: niente telefoni. Ognuno ha un TRESPOLO vicino a casa con
// PENNINO, il piccione viaggiatore. Usando il trespolo si apre la Gazzetta: una bacheca di sughero con i biglietti e le
// fotografie (dagherrotipi color seppia, ridisegnati dal gioco) di tutti i giocatori. Si regalano PIUME (al posto dei «mi piace»), si
// commenta, e ogni settimana la fotografia con più piume vince un nastro e un premio.
// Quando mandi qualcosa, Pennino prende il biglietto e vola via; poi torna. Quando arriva posta degli altri,
// atterra con una lettera nel becco.
// Le fotografie NON sono immagini: sono scene del gioco (s, JSON) che chi legge ridisegna. Nessuna immagine esterna.
// Dati (Firebase, hollowmere/gazzetta): post/$id {pid,n,v,t,s,ts} · piume/$id/$pid: true · commenti/$id/$cid {pid,n,t,ts}
// Le regole sono in firebase/regole.json. Senza collegamento la Gazzetta dice che il piccione non trova la strada.

const GZ = {
  posts: {}, // id → post
  piume: {}, // id → { pid: true }
  commenti: {}, // id → { cid: commento }
  aperti: {}, // id dei post con i commenti aperti
  tab: 'bacheca',
  foto: null, // la fotografia appena scattata (dataURL)
  testo: '',
  racconta: false,
  off: null,
  pronto: false
};
const GZ_SETT0 = Date.UTC(2026, 0, 5); // un lunedì: le settimane della gara partono da qui
const gzSettimana = ts => Math.floor((ts - GZ_SETT0) / (7 * 864e5));
const gzMe = () => {
  const s = (typeof homeSt === 'function' && homeSt()) || G.home || G.st;
  return s || {};
};

// ---------- il collegamento (si può sostituire nei test) ----------
let GZ_DB = {
  ok: () => !!(typeof NET !== 'undefined' && NET.ok && NET.api && typeof MP !== 'undefined' && MP.ok()),
  async proprio() {
    const me = gzMe().pid;
    if (me && NET.own) await NET.own(me);
  },
  ascolta(cb) {
    const D = NET.api;
    return D.onValue(D.query(NET.r('gazzetta/post'), D.orderByKey(), D.limitToLast(40)), s =>
      cb(s.val() || {})
    );
  },
  async piume(id) {
    return (await NET.api.get(NET.r('gazzetta/piume/' + id))).val() || {};
  },
  async commenti(id) {
    const D = NET.api;
    return (await D.get(D.query(NET.r('gazzetta/commenti/' + id), D.limitToLast(30)))).val() || {};
  },
  async pubblica(p) {
    await this.proprio();
    return NET.api.push(NET.r('gazzetta/post'), p);
  },
  async togli(id) {
    await this.proprio();
    return NET.api.remove(NET.r('gazzetta/post/' + id));
  },
  async piuma(id, pid, on) {
    await this.proprio();
    return NET.api.set(NET.r(`gazzetta/piume/${id}/${pid}`), on ? true : null);
  },
  async commenta(id, c) {
    await this.proprio();
    return NET.api.push(NET.r('gazzetta/commenti/' + id), c);
  }
};

// ---------- ascolto: i biglietti arrivano da soli ----------
function gzAscolta() {
  const st = G.st;
  if (GZ.off || !st || !isFree(st) || !GZ_DB.ok()) return;
  try {
    GZ.off = GZ_DB.ascolta(all => {
      GZ.posts = all;
      GZ.pronto = true;
      gzPostaNuova();
      if (gzAperta()) gzDisegna();
    });
  } catch (e) {
    console.error(e);
    GZ.off = null;
  }
}
// c'è un biglietto di qualcun altro che non hai ancora letto?
function gzPostaNuova() {
  const st = gzMe(),
    F = (st.flags = st.flags || {}),
    visto = F.gzVisto || 0,
    me = st.pid;
  const nuovi = Object.values(GZ.posts).filter(p => p.pid !== me && p.ts > visto);
  if (!F.gzVisto) {
    // la prima volta non si annuncia tutto lo storico: da adesso in poi
    F.gzVisto = Math.max(Date.now() - 60000, ...nuovi.map(p => p.ts));
    return;
  }
  if (!nuovi.length) return;
  if (!PC.lettera) {
    PC.lettera = 1;
    if (PC.st === 'posato') PC.arriva = 1; // Pennino va a prenderla e torna con la lettera
  }
}

// ---------- PENNINO, il piccione ----------
// st: posato · parte · via · torna. Ha la lettera nel becco quando porta posta.
const PC = { st: 'posato', t: 0, lettera: 0, arriva: 0, carico: 0 };
function pcTrespolo() {
  if (G.fotoRender) return null; // mentre si ridisegna una fotografia il piccione resta posato
  const m = G.map;
  if (!m || m.id !== 'main' || G.visit) return null;
  return m.objs.find(o => o.kind === 'built' && o.bid === 'trespolo') || null;
}
// dove sta il piccione posato sul trespolo
const pcPosto = o => [o.dx + 7, o.dy + 3]; // sul tetto della colombaia
function pcVola(carico) {
  if (PC.st !== 'posato') return false;
  PC.st = 'parte';
  PC.t = 0;
  PC.carico = carico ? 1 : 0;
  PC.dir = Math.random() < 0.5 ? 1 : -1;
  AU.play('pick');
  return true;
}
Ext.on('mpTick', dt => {
  try {
    gzAscolta();
    const o = pcTrespolo();
    if (!o) return;
    PC.t += dt;
    if (PC.st === 'posato' && PC.arriva) {
      PC.arriva = 0;
      PC.st = 'via';
      PC.t = 2.5;
      PC.carico = 0;
      PC.dir = Math.random() < 0.5 ? 1 : -1;
    }
    if (PC.st === 'parte' && PC.t > 1.6) {
      PC.st = 'via';
      PC.t = 0;
    }
    if (PC.st === 'via' && PC.t > 4) {
      PC.st = 'torna';
      PC.t = 0;
      PC.carico = PC.lettera ? 1 : 0;
    }
    if (PC.st === 'torna' && PC.t > 1.8) {
      PC.st = 'posato';
      PC.t = 0;
      PC.carico = 0;
      if (PC.lettera) {
        AU.play('blip');
        UI.toast('🕊 Pennino è tornato con una lettera: c’è posta nuova nella Gazzetta.');
      }
    }
  } catch (e) {
    console.error(e);
  }
});
// posizione in volo: parte verso l'alto e di lato, torna dal lato opposto
function pcVolo(o) {
  const [x0, y0] = pcPosto(o),
    d = PC.dir || 1;
  if (PC.st === 'parte') {
    const k = Math.min(1, PC.t / 1.6);
    return [x0 + d * 260 * k * k, y0 - 30 * k - 150 * k * k + Math.sin(k * 8) * 2];
  }
  if (PC.st === 'torna') {
    const k = 1 - Math.min(1, PC.t / 1.8),
      e = k * k;
    return [x0 - d * 260 * e, y0 - 150 * e - 30 * k];
  }
  return null;
}

// ---------- disegno: trespolo, piccione posato, piccione in volo ----------
const PC_IMG = {};
function pcFotogramma() {
  // posato: guarda in giro, becca, si liscia le piume, tuba gonfiando il petto
  const seq = [0, 0, 1, 0, 0, 0, 3, 3, 0, 0, 2, 2, 0, 1, 0, 0];
  return PC_IMG.posato[seq[Math.floor(G.t / 0.45) % seq.length]];
}
function pcDisegna(img, x, y, dir, lettera) {
  const w = iw(img),
    h = ih(img);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h, w, h);
  if (lettera) {
    ctx.fillStyle = '#f4ecd8';
    ctx.fillRect(w / 2 - 3, -h + 3, 4, 3);
    ctx.fillStyle = '#a8301a';
    ctx.fillRect(w / 2 - 2, -h + 4, 1, 1);
  }
  ctx.restore();
}
function trespoloDisegna(e) {
  dImg(ctx, e.img, Math.round(e.dx), Math.round(e.dy));
  const mio = pcTrespolo() === e;
  if (mio && PC.st !== 'posato') return;
  const [x, y] = pcPosto(e);
  pcDisegna(pcFotogramma(), x, y + 1, Math.floor(G.t / 7) % 2 ? -1 : 1, mio && PC.lettera);
  // posta da leggere: un foglietto che dondola sopra il trespolo
  if (mio && PC.lettera) {
    const b = Math.round(Math.sin(G.t * 4) * 1.5);
    ctx.fillStyle = '#2a1406';
    ctx.fillRect(x - 5, y - 24 + b, 10, 8);
    ctx.fillStyle = '#f6ecd0';
    ctx.fillRect(x - 4, y - 23 + b, 8, 6);
    ctx.fillStyle = '#a8301a';
    ctx.fillRect(x - 1, y - 21 + b, 2, 2);
  }
}
Ext.on('listaMondo', (list, m) => {
  for (const e of list)
    if (e.kind === 'built' && e.bid === 'trespolo' && !e.disegna) e.disegna = trespoloDisegna;
  const o = pcTrespolo();
  if (!o || PC.st === 'posato' || PC.st === 'via' || !PC_IMG.volo) return;
  const p = pcVolo(o);
  if (!p) return;
  const dir = PC.st === 'parte' ? PC.dir : -PC.dir;
  list.push({
    sy: 9e9,
    draw: () => pcDisegna(PC_IMG.volo[Math.floor(G.t * 12) % PC_IMG.volo.length], p[0], p[1], dir, PC.carico)
  });
});
// usare il trespolo apre la Gazzetta (con l'accetta, invece, si toglie)
Ext.on('freeAct:intercetta', (fx, fy) => {
  const o = G.map && G.map.objAt(fx, fy),
    it = selItem();
  if (!o || o.kind !== 'built' || o.bid !== 'trespolo' || (it && it.id === 'accetta')) return false;
  Gazzetta.apri();
  return true;
});

// ---------- il trespolo: arriva da solo, e si può costruire ----------
ITEMS.trespolo = {
  n: 'Trespolo del piccione',
  t: 'place',
  d: 'Ci vive Pennino, il piccione viaggiatore. Usalo per aprire la Gazzetta della Valle.'
};
CRAFTS.push({ id: 'trespolo', q: 1, c: { legna: 12, fibra: 4 }, cat: 'est' });
PLACE_TOOL.trespolo = 'accetta';
Ext.on('freeMorning', st => {
  try {
    if (!st.free || st.flags.trespolo) return;
    st.flags.trespolo = 1;
    if (st.inv.some(s => !s) && addItem('trespolo', 1))
      setTimeout(
        () => UI.toast('🕊 Un piccione viaggiatore ti ha portato un trespolo. Mettilo vicino a casa.'),
        2500
      );
    else st.flags.trespolo = 0;
  } catch (e) {
    console.error(e);
  }
});

// ---------- la macchina fotografica ----------
// Il mirino: la Valle diventa color seppia, puoi ancora muoverti per inquadrare; Spazio o «Scatta».
const Foto = {
  on: false,
  apri() {
    if (this.on) return;
    this.on = true;
    const c = $('#game');
    if (c) c.style.filter = 'sepia(.85) contrast(1.05) brightness(1.02)';
    const d = document.createElement('div');
    d.id = 'mirino';
    d.innerHTML = `<div class="mr-c tl"></div><div class="mr-c tr"></div><div class="mr-c bl"></div><div class="mr-c br"></div><div class="mr-bar"><span>📷 Inquadra la Valle (puoi camminare). Spazio per scattare.</span><button class="btn" data-f="scatta">Scatta</button><button class="btn" data-f="no">Annulla</button></div>`;
    document.body.appendChild(d);
    d.querySelector('[data-f=scatta]').onclick = () => this.scatta();
    d.querySelector('[data-f=no]').onclick = () => this.chiudi(true);
    this._k = e => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        this.scatta();
      }
      if (e.code === 'Escape') {
        e.stopPropagation();
        this.chiudi(true);
      }
    };
    addEventListener('keydown', this._k, true);
  },
  chiudi(annulla) {
    this.on = false;
    const c = $('#game');
    if (c) c.style.filter = '';
    const d = $('#mirino');
    if (d) d.remove();
    removeEventListener('keydown', this._k, true);
    if (annulla) Gazzetta.apri('scrivi');
  },
  // la fotografia NON è un'immagine: è la descrizione della scena (vedi fotoScena). Si ridisegna con il gioco.
  scatta() {
    if (!this.on) return;
    let sc = null;
    try {
      sc = fotoScena();
    } catch (e) {
      console.error(e);
    }
    if (!sc) {
      UI.toast('Le fotografie si scattano all’aperto, nella Valle.');
      this.chiudi(true);
      return;
    }
    AU.play('door');
    G.flash = { a: 0.9, c: '#fffbe8' };
    this.chiudi();
    GZ.foto = sc;
    GZ.fotoN = (GZ.fotoN || 0) + 1;
    setTimeout(() => Gazzetta.apri('scrivi'), 350);
  }
};

// ---------- la fotografia: una scena del gioco, non un'immagine ----------
// Nel database finisce solo questo (testo JSON, piccolo): dove guardava la macchina, ora, stagione, tempo, e cosa
// c'era nell'inquadratura (costruzioni, campi, piante, persone col loro aspetto, abitanti). Chi guarda la Gazzetta
// la vede ridisegnata dal gioco: non si può pubblicare nessuna immagine che non sia la Valle.
const FOTO_W = 480,
  FOTO_H = 270;
function fotoScena() {
  const st = G.st,
    m = G.map;
  if (!st || !isFree(st) || !m || m.id !== 'main') return null;
  const cx = Math.round(G.cam.x + W / 2),
    cy = Math.round(G.cam.y + H / 2),
    x0 = Math.floor((cx - FOTO_W / 2) / 16) - 4,
    x1 = Math.ceil((cx + FOTO_W / 2) / 16) + 4,
    y0 = Math.floor((cy - FOTO_H / 2) / 16) - 2,
    y1 = Math.ceil((cy + FOTO_H / 2) / 16) + 6;
  const dentro = k => {
    const [x, y] = k.split(',').map(Number);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  };
  const scegli = (o, f) => {
    const r = {};
    for (const k in o || {}) if (dentro(k)) r[k] = f ? f(o[k]) : o[k];
    return r;
  };
  const F = st.free,
    pdentro = (x, y) => Math.abs(x - cx) < FOTO_W / 2 + 20 && Math.abs(y - cy) < FOTO_H / 2 + 40;
  const gente = [];
  if (G.mode === 'game' && pdentro(G.player.x, G.player.y)) {
    const me = (G.visit ? G.home : st) || st;
    gente.push({
      n: me.name,
      g: me.g,
      lk: typeof avCode === 'function' ? avCode() : '',
      x: Math.round(G.player.x),
      y: Math.round(G.player.y),
      dir: G.player.dir | 0
    });
  }
  for (const o of Object.values(G.others || {}))
    if (o.map === 'main' && pdentro(o.x, o.y))
      gente.push({
        n: o.name,
        g: o.g,
        lk: o.lk || '',
        x: Math.round(o.x),
        y: Math.round(o.y),
        dir: o.dir | 0
      });
  const sc = {
    v: 1,
    x: cx,
    y: cy,
    d: st.day,
    t: Math.round(st.time),
    m: st.weather || '',
    r: myRank(st),
    hl: F.house || 1,
    lk: F.look || {},
    ld: F.land || [],
    b: scegli(F.built, b => {
      const r = { id: b.id };
      if (b.d != null) r.d = b.d;
      if (b.fruit) r.fruit = b.fruit;
      return r;
    }),
    f: scegli(st.farm, f => {
      const r = {};
      if (f.w) r.w = 1;
      if (f.c) r.c = { t: f.c.t, a: f.c.a | 0, ...(f.c.dead ? { dead: 1 } : {}) };
      return r;
    }),
    dz: scegli(F.debris),
    tl: scegli(F.tiles),
    gn: scegli(F.gone),
    p: gente.slice(0, 8),
    c: (G.npcs || [])
      .filter(n => !n.hidden && n.map === 'main' && pdentro(n.x, n.y) && LOOKS[n.id])
      .slice(0, 12)
      .map(n => ({ id: n.id, x: Math.round(n.x), y: Math.round(n.y), dir: n.dir | 0 }))
  };
  // se l'inquadratura è troppo piena, via prima i campi lontani dal centro
  let j = JSON.stringify(sc);
  while (j.length > 19000 && Object.keys(sc.f).length) {
    const k = Object.keys(sc.f).sort((a, b) => {
      const d = q => {
        const [x, y] = q.split(',').map(Number);
        return Math.hypot(x * 16 - cx, y * 16 - cy);
      };
      return d(b) - d(a);
    })[0];
    delete sc.f[k];
    j = JSON.stringify(sc);
  }
  return j.length <= 19500 ? sc : null;
}
// controllo di quello che arriva dal database: passa solo ciò che il gioco sa disegnare
function fotoPulisci(raw) {
  let s = raw;
  try {
    if (typeof s === 'string') s = JSON.parse(s);
  } catch (e) {
    return null;
  }
  if (!s || typeof s !== 'object' || s.v !== 1) return null;
  const num = (v, a, b, d) => (typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : d),
    chiave = k => /^\d{1,3},\d{1,3}$/.test(k),
    nome = v => (typeof v === 'string' ? v.slice(0, 20) : '?'),
    tipo = v => typeof v === 'string' && /^[a-z_0-9]{1,24}$/.test(v);
  const ogg = (o, f) => {
    const r = {};
    if (o && typeof o === 'object')
      for (const k of Object.keys(o).slice(0, 600))
        if (chiave(k)) {
          const v = f(o[k]);
          if (v != null) r[k] = v;
        }
    return r;
  };
  const lk = {};
  if (s.lk && typeof s.lk === 'object' && typeof LOOKOPT !== 'undefined')
    for (const k in LOOKOPT) if (tipo(s.lk[k]) && LOOKOPT[k].o[s.lk[k]]) lk[k] = s.lk[k];
  return {
    x: num(s.x, 0, 1600, 400),
    y: num(s.y, 0, 800, 300),
    d: num(s.d, 0, 1e6, 1),
    t: num(s.t, 0, 1560, 720),
    m: ['', 'sole', 'pioggia', 'neve', 'nebbia', 'vento'].includes(s.m) ? s.m : '',
    r: num(s.r, 0, 20, 0) | 0,
    hl: num(s.hl, 1, 5, 1) | 0,
    lk,
    ld: Array.isArray(s.ld) ? s.ld.filter(k => typeof PLOTS !== 'undefined' && PLOTS[k]).slice(0, 20) : [],
    b: ogg(s.b, b =>
      b && tipo(b.id) && ITEMS[b.id] && ['place', 'arredo'].includes(ITEMS[b.id].t)
        ? { id: b.id, d: num(b.d, 0, 1e6, 0), fruit: num(b.fruit, 0, 3, 0) | 0 }
        : null
    ),
    f: ogg(s.f, f => {
      if (!f || typeof f !== 'object') return null;
      const r = { w: !!f.w, c: null };
      if (f.c && tipo(f.c.t) && CROPS[f.c.t])
        r.c = { t: f.c.t, a: num(f.c.a, 0, 30, 0) | 0, dry: 0, ...(f.c.dead ? { dead: 1 } : {}) };
      return r;
    }),
    dz: ogg(s.dz, t => (tipo(t) && FREEIMG[t] ? t : null)),
    tl: ogg(s.tl, t => (tipo(t) || (typeof t === 'number' && isFinite(t)) ? t : null)),
    gn: ogg(s.gn, () => 1),
    p: (Array.isArray(s.p) ? s.p : []).slice(0, 8).map(o => ({
      name: nome(o && o.n),
      g: o && o.g === 'f' ? 'f' : 'm',
      lk: o && typeof o.lk === 'string' && o.lk.length < 600 ? o.lk : '',
      x: num(o && o.x, 0, 1600, 0),
      y: num(o && o.y, 0, 800, 0),
      dir: num(o && o.dir, 0, 3, 0) | 0
    })),
    c: (Array.isArray(s.c) ? s.c : [])
      .slice(0, 12)
      .filter(n => n && tipo(n.id) && LOOKS[n.id] && NAMES[n.id])
      .map(n => ({ id: n.id, x: num(n.x, 0, 1600, 0), y: num(n.y, 0, 800, 0), dir: num(n.dir, 0, 3, 0) | 0 }))
  };
}
// ridisegnare la scena: per un istante il gioco «guarda» il villaggio della foto, poi torna com'era
const FOTO_CACHE = new Map();
function fotoDisegna(raw, chiaveCache) {
  if (chiaveCache && FOTO_CACHE.has(chiaveCache)) return FOTO_CACHE.get(chiaveCache);
  const sc = fotoPulisci(raw);
  if (!sc || !G.st || !G.st.free) return null;
  const S = {
    st: G.st,
    map: G.map,
    maps: G.maps,
    cam: G.cam,
    npcs: G.npcs,
    others: G.others,
    crit: G.critters,
    fauna: G.fauna,
    fan: G.fanimals,
    amb: G.amb,
    sh: G.shadows,
    floats: G.floats,
    mode: G.mode,
    horse: G.horse && G.horse.on,
    prey: G.prey,
    coach: G.coach,
    shake: G.shake,
    tree: IMG.tree,
    chatB: G.chatB,
    flash: G.flash,
    hits: G.hits
  };
  let url = null;
  try {
    const fs = Object.assign({}, S.st, {
      day: sc.d,
      time: sc.t,
      weather: sc.m,
      farm: sc.f,
      free: Object.assign(JSON.parse(JSON.stringify(S.st.free)), {
        built: sc.b,
        debris: sc.dz,
        tiles: sc.tl,
        gone: sc.gn,
        look: sc.lk,
        house: sc.hl,
        land: sc.ld,
        fotoRango: sc.r
      })
    });
    G.st = fs;
    G.mode = 'foto';
    G.fotoRender = 1;
    if (typeof FREEIMG !== 'undefined' && FREEIMG.trees) IMG.tree = FREEIMG.trees[seasonOf(fs)] || IMG.tree;
    const m = buildMain(fs);
    applyFree(m, fs);
    seasonDecor(m, fs);
    buildGround(m);
    seasonGround(m);
    applyLook(m, fs);
    G.maps = Object.assign({}, S.maps, { main: m });
    G.map = m;
    G.cam = { x: sc.x - W / 2, y: sc.y - H / 2 };
    G.npcs = sc.c.map(n =>
      Object.assign({ map: 'main', hidden: false, anim: 0, act: 'idle', name: NAMES[n.id] }, n)
    );
    G.others = {};
    sc.p.forEach(
      (o, i) => (G.others['foto' + i] = Object.assign({ map: 'main', anim: 0, moving: false }, o))
    );
    Object.assign(G, {
      critters: null,
      fauna: [],
      fanimals: [],
      amb: null,
      shadows: [],
      floats: [],
      prey: null,
      coach: null,
      shake: 0,
      chatB: null,
      flash: { a: 0, c: '#fff' }
    });
    if (G.horse) G.horse.on = false;
    render();
    // ritaglio 16:9 al centro, color seppia, vignettatura e grana
    const cw = Math.min(W, FOTO_W),
      [c, x] = mk(384, 216);
    x.filter = 'sepia(.85) contrast(1.06) brightness(1.03)';
    x.drawImage(cv, ((W - cw) / 2) * RS, 0, cw * RS, H * RS, 0, 0, 384, 216);
    x.filter = 'none';
    const g = x.createRadialGradient(192, 108, 70, 192, 108, 230);
    g.addColorStop(0, 'rgba(40,20,5,0)');
    g.addColorStop(1, 'rgba(40,20,5,.55)');
    x.fillStyle = g;
    x.fillRect(0, 0, 384, 216);
    let seme = (sc.x * 7 + sc.y * 13 + sc.d) >>> 0;
    const rnd = () => (seme = (seme * 1103515245 + 12345) >>> 0) / 4294967296;
    for (let i = 0; i < 420; i++) {
      x.fillStyle = `rgba(${rnd() < 0.5 ? '255,240,210' : '40,25,10'},${(rnd() * 0.12).toFixed(2)})`;
      x.fillRect(rnd() * 384, rnd() * 216, 1, 1);
    }
    url = c.toDataURL('image/jpeg', 0.85);
  } catch (e) {
    console.error(e);
  } finally {
    G.st = S.st;
    G.map = S.map;
    G.maps = S.maps;
    G.cam = S.cam;
    G.npcs = S.npcs;
    G.others = S.others;
    Object.assign(G, {
      critters: S.crit,
      fauna: S.fauna,
      fanimals: S.fan,
      amb: S.amb,
      shadows: S.sh,
      floats: S.floats,
      mode: S.mode,
      prey: S.prey,
      coach: S.coach,
      shake: S.shake,
      chatB: S.chatB,
      flash: S.flash,
      hits: S.hits
    });
    if (G.horse) G.horse.on = S.horse;
    IMG.tree = S.tree;
    G.fotoRender = 0;
  }
  if (url && chiaveCache) FOTO_CACHE.set(chiaveCache, url);
  return url;
}

// ---------- la Gazzetta ----------
const gzAperta = () => !!$('#gazzetta');
const gzQuando = ts => {
  const s = (Date.now() - ts) / 1000;
  if (s < 90) return 'adesso';
  if (s < 3600) return Math.round(s / 60) + ' minuti fa';
  if (s < 86400) return Math.round(s / 3600) + (Math.round(s / 3600) === 1 ? ' ora fa' : ' ore fa');
  if (s < 172800) return 'ieri';
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
};
const gzN = id => Object.keys(GZ.piume[id] || {}).length;
const gzRot = id => ((id.charCodeAt(id.length - 1) + id.charCodeAt(id.length - 2)) % 7) - 3;
function gzElenco() {
  return Object.entries(GZ.posts)
    .map(([id, p]) => Object.assign({ id }, p))
    .sort((a, b) => b.ts - a.ts);
}
async function gzCaricaPiume() {
  const L = gzElenco();
  await Promise.all(
    L.map(async p => {
      try {
        GZ.piume[p.id] = await GZ_DB.piume(p.id);
      } catch (e) {}
    })
  );
}
function gzBiglietto(p) {
  const me = gzMe().pid,
    mia = !!(GZ.piume[p.id] || {})[me],
    n = gzN(p.id),
    com = GZ.commenti[p.id],
    aperto = GZ.aperti[p.id];
  return `<div class="gz-post" style="transform:rotate(${gzRot(p.id) * 0.5}deg)"><i class="gz-pin"></i>
  <p class="gz-chi"><b>${esc(p.n || '?')}</b>${p.v ? ` · <span>${esc(p.v)}</span>` : ''} <span class="gz-q">${gzQuando(p.ts)}</span></p>
  ${p.s ? gzFotoTag(p.id, p.s, 'Fotografia di ' + (p.n || '')) : ''}
  ${p.t ? `<p class="gz-t">${esc(p.t).replace(/\n/g, '<br>')}</p>` : ''}
  <p class="gz-azioni"><button class="btn gz-piuma${mia ? ' on' : ''}" data-piuma="${p.id}" ${p.pid === me ? 'disabled title="Le tue piume vanno agli altri"' : ''}>🪶 ${n}</button>
  <button class="btn" data-com="${p.id}">💬 ${aperto ? 'Chiudi' : 'Commenti'}${com ? ' (' + Object.keys(com).length + ')' : ''}</button>
  ${p.pid === me ? `<button class="btn" data-togli="${p.id}">Togli</button>` : ''}</p>
  ${
    aperto
      ? `<div class="gz-com">${
          com
            ? Object.values(com)
                .sort((a, b) => a.ts - b.ts)
                .map(c => `<p><b>${esc(c.n || '?')}:</b> ${esc(c.t)}</p>`)
                .join('') || '<p class="small">Ancora nessun commento.</p>'
            : '<p class="small">Pennino va a prendere i commenti…</p>'
        }<p class="gz-scrivi"><input maxlength="140" placeholder="Scrivi un commento…" data-cin="${p.id}"><button class="btn" data-cman="${p.id}">Manda</button></p></div>`
      : ''
  }</div>`;
}
function gzBacheca() {
  const L = gzElenco();
  if (!GZ.pronto) return '<p class="gz-vuoto">Pennino sta portando la Gazzetta…</p>';
  if (!L.length)
    return '<p class="gz-vuoto">La bacheca è vuota. Scrivi il primo biglietto della Valle: Pennino non vede l’ora di volare.</p>';
  return `<div class="gz-muro">${L.map(gzBiglietto).join('')}</div>`;
}
function gzGara() {
  const ora = gzSettimana(Date.now()),
    foto = gzElenco().filter(p => p.s),
    questa = foto.filter(p => gzSettimana(p.ts) === ora).sort((a, b) => gzN(b.id) - gzN(a.id) || a.ts - b.ts),
    scorsa = foto
      .filter(p => gzSettimana(p.ts) === ora - 1)
      .sort((a, b) => gzN(b.id) - gzN(a.id) || a.ts - b.ts),
    vinc = scorsa.length && gzN(scorsa[0].id) > 0 ? scorsa[0] : null,
    st = gzMe(),
    F = (st.flags = st.flags || {}),
    premi = (F.gzPremi = F.gzPremi || {}),
    mio = vinc && vinc.pid === st.pid && !premi[ora - 1];
  const fine = new Date(GZ_SETT0 + (ora + 1) * 7 * 864e5);
  const medaglie = ['🥇', '🥈', '🥉'];
  return `<p class="gz-intro">Ogni settimana, la fotografia con più piume vince il <b>Nastro della Gazzetta</b> e 1500 scudi. Questa gara finisce ${fine.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
  ${vinc ? `<div class="gz-post gz-vinta"><i class="gz-pin"></i><p class="gz-chi">🎀 La più bella della settimana scorsa: <b>${esc(vinc.n)}</b> (🪶 ${gzN(vinc.id)})</p>${gzFotoTag(vinc.id, vinc.s, 'La fotografia vincitrice')}${mio ? '<p class="gz-azioni"><button class="btn" data-premio="1">Ritira il premio</button></p>' : ''}</div>` : ''}
  <h3 class="gz-h">Questa settimana</h3>
  ${
    questa.length
      ? `<div class="gz-muro">${questa
          .map((p, i) =>
            gzBiglietto(p).replace(
              '<i class="gz-pin"></i>',
              `<i class="gz-pin"></i><span class="gz-med">${medaglie[i] || ''}</span>`
            )
          )
          .join('')}</div>`
      : '<p class="gz-vuoto">Nessuna fotografia, per ora. Scattane una: potrebbe vincere.</p>'
  }`;
}
function gzScrivi() {
  const st = gzMe(),
    vola = PC.st !== 'posato' && pcTrespolo();
  return `<div class="gz-post gz-nuovo"><i class="gz-pin"></i>
  <p class="gz-chi">Un biglietto di <b>${esc(st.name || '')}</b></p>
  ${GZ.foto ? `${gzFotoTag('nuova_' + GZ.fotoN, GZ.foto, 'La tua fotografia')}<p class="gz-azioni"><button class="btn" data-f="rifai">📷 Rifalla</button><button class="btn" data-f="via">Togli la foto</button></p>` : `<p class="gz-azioni"><button class="btn" data-f="scatta">📷 Scatta una fotografia</button></p>`}
  <textarea maxlength="240" rows="4" placeholder="Racconta qualcosa del tuo villaggio…" data-testo>${esc(GZ.testo)}</textarea>
  <p class="small"><label><input type="checkbox" data-racconta ${GZ.racconta ? 'checked' : ''}> Aggiungi due righe sul mio villaggio (rango, abitanti, animali)</label></p>
  <p class="gz-azioni"><button class="btn" data-manda ${vola ? 'disabled' : ''}>🕊 ${vola ? 'Pennino è in volo…' : 'Manda col piccione'}</button></p></div>`;
}
function gzRiassunto() {
  const st = gzMe();
  if (!st.free) return '';
  const r = typeof myRank === 'function' ? rankName(myRank(st)) : '',
    ab = typeof residents === 'function' ? residents(st).length : 0,
    an = (st.free.animals || []).length;
  return `🏡 ${r}${ab ? ` · ${ab} abitant${ab === 1 ? 'e' : 'i'} nuov${ab === 1 ? 'o' : 'i'}` : ''}${an ? ` · ${an} animal${an === 1 ? 'e' : 'i'}` : ''}`;
}
function gzDisegna() {
  const d = $('#gazzetta');
  if (!d) return;
  const corpo = $('#gz-corpo'),
    y = corpo ? corpo.scrollTop : 0;
  const tabs = [
    ['bacheca', 'La bacheca'],
    ['gara', 'La più bella'],
    ['scrivi', 'Scrivi un biglietto']
  ];
  d.innerHTML = `<div class="gz-testa"><div><h2>La Gazzetta della Valle</h2><p>Portata da Pennino, il piccione viaggiatore</p></div><button class="btn" data-x>✕</button></div>
  <div class="gz-tabs">${tabs.map(([k, n]) => `<button class="btn ${GZ.tab === k ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
  <div id="gz-corpo">${!GZ_DB.ok() ? '<p class="gz-vuoto">Pennino non trova la strada. La Gazzetta arriva solo quando sei collegat' + fmt('{o|a}') + ' alla Valle (multiplayer).</p>' : GZ.tab === 'gara' ? gzGara() : GZ.tab === 'scrivi' ? gzScrivi() : gzBacheca()}</div>`;
  const c2 = $('#gz-corpo');
  if (c2) c2.scrollTop = y;
  gzCollega(d);
  gzFotoRiempi();
}
// le fotografie si ridisegnano una alla volta (ognuna è una piccola scena del gioco), poi restano in memoria
const GZ_FRAW = {};
function gzFotoTag(k, raw, alt) {
  GZ_FRAW[k] = raw;
  const u = FOTO_CACHE.get(k);
  return `<div class="gz-foto"><img data-fk="${esc(k)}" ${u ? `src="${u}"` : ''} alt="${esc(alt)}"></div>`;
}
let GZ_CODA = false;
function gzFotoRiempi() {
  if (GZ_CODA) return;
  const img = [...document.querySelectorAll('#gazzetta img[data-fk]')].find(i => !i.getAttribute('src'));
  if (!img) return;
  GZ_CODA = true;
  setTimeout(() => {
    GZ_CODA = false;
    const k = img.dataset.fk,
      u = fotoDisegna(GZ_FRAW[k], k) || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    document.querySelectorAll(`#gazzetta img[data-fk="${CSS.escape(k)}"]`).forEach(i => (i.src = u));
    gzFotoRiempi();
  }, 40);
}
function gzCollega(d) {
  const q = s => d.querySelectorAll(s),
    me = gzMe();
  d.querySelector('[data-x]').onclick = () => Gazzetta.chiudi();
  q('[data-tab]').forEach(b => (b.onclick = () => ((GZ.tab = b.dataset.tab), AU.play('ui'), gzDisegna())));
  q('[data-piuma]').forEach(
    b =>
      (b.onclick = async () => {
        const id = b.dataset.piuma,
          P = (GZ.piume[id] = GZ.piume[id] || {}),
          on = !P[me.pid];
        if (on) P[me.pid] = true;
        else delete P[me.pid];
        AU.play(on ? 'ok' : 'ui');
        gzDisegna();
        try {
          await GZ_DB.piuma(id, me.pid, on);
          if (on) pcVola(true);
        } catch (e) {
          UI.toast('Pennino non è riuscito a portare la piuma.', 'bad');
        }
      })
  );
  q('[data-com]').forEach(
    b =>
      (b.onclick = async () => {
        const id = b.dataset.com;
        GZ.aperti[id] = !GZ.aperti[id];
        gzDisegna();
        if (GZ.aperti[id])
          try {
            GZ.commenti[id] = await GZ_DB.commenti(id);
            gzDisegna();
          } catch (e) {}
      })
  );
  q('[data-cman]').forEach(
    b =>
      (b.onclick = async () => {
        const id = b.dataset.cman,
          inp = d.querySelector(`[data-cin="${id}"]`),
          t = (inp.value || '').trim().slice(0, 140);
        if (!t) return;
        if (PC.st !== 'posato' && pcTrespolo()) return UI.toast('Pennino è già in volo. Aspetta che torni.');
        const c = { pid: me.pid, n: String(me.name || '?').slice(0, 20), t, ts: Date.now() };
        try {
          await GZ_DB.commenta(id, c);
          (GZ.commenti[id] = GZ.commenti[id] || {})['_' + c.ts] = c;
          pcVola(true);
          AU.play('ok');
          gzDisegna();
        } catch (e) {
          UI.toast('Pennino non è riuscito a portare il commento.', 'bad');
        }
      })
  );
  q('[data-togli]').forEach(
    b =>
      (b.onclick = async () => {
        if (!b.dataset.sicuro) {
          b.dataset.sicuro = 1;
          b.textContent = 'Sicur' + fmt('{o|a}') + '? Togli';
          return;
        }
        try {
          await GZ_DB.togli(b.dataset.togli);
          delete GZ.posts[b.dataset.togli];
          gzDisegna();
        } catch (e) {}
      })
  );
  const ta = d.querySelector('[data-testo]');
  if (ta) ta.oninput = () => (GZ.testo = ta.value);
  const rc = d.querySelector('[data-racconta]');
  if (rc) rc.onchange = () => (GZ.racconta = rc.checked);
  q('[data-f]').forEach(
    b =>
      (b.onclick = () => {
        if (b.dataset.f === 'via') {
          GZ.foto = null;
          return gzDisegna();
        }
        Gazzetta.chiudi();
        Foto.apri();
      })
  );
  const mb = d.querySelector('[data-manda]');
  if (mb) mb.onclick = () => gzManda();
  const pr = d.querySelector('[data-premio]');
  if (pr)
    pr.onclick = () => {
      const st = gzMe(),
        F = (st.flags.gzPremi = st.flags.gzPremi || {});
      F[gzSettimana(Date.now()) - 1] = 1;
      st.money += 1500;
      UI.hud();
      AU.play('coin');
      UI.toast('🎀 Il Nastro della Gazzetta è tuo! +' + SC(1500));
      NET.save(st);
      gzDisegna();
    };
  q('.gz-foto img').forEach(img => (img.onclick = () => img.parentElement.classList.toggle('grande')));
}
async function gzManda() {
  const st = gzMe();
  let t = (GZ.testo || '').trim();
  if (GZ.racconta) t = (t ? t + '\n' : '') + gzRiassunto();
  t = t.slice(0, 240);
  if (!t && !GZ.foto) return UI.toast('Scrivi qualcosa o scatta una fotografia.');
  if (PC.st !== 'posato' && pcTrespolo()) return UI.toast('Pennino è già in volo. Aspetta che torni.');
  const p = {
    pid: st.pid,
    n: String(st.name || '?').slice(0, 20),
    v: st.free && typeof myRank === 'function' ? rankName(myRank(st)) : '',
    ts: Date.now()
  };
  if (t) p.t = t;
  if (GZ.foto) p.s = JSON.stringify(GZ.foto);
  try {
    await GZ_DB.pubblica(p);
  } catch (e) {
    console.error(e);
    return UI.toast('Pennino non è riuscito a partire. Riprova tra poco.', 'bad');
  }
  GZ.testo = '';
  GZ.foto = null;
  GZ.racconta = false;
  GZ.tab = 'bacheca';
  Gazzetta.chiudi();
  if (pcVola(true)) UI.toast('🕊 Pennino è partito con il tuo biglietto: lo porta a tutta la Valle.');
  else UI.toast('📜 Il tuo biglietto è nella Gazzetta.');
}
const Gazzetta = {
  apri(tab) {
    if (gzAperta()) return;
    if (tab) GZ.tab = tab;
    const st = gzMe();
    st.flags = st.flags || {};
    // leggere la Gazzetta toglie la lettera
    PC.lettera = 0;
    const ult = Math.max(0, ...Object.values(GZ.posts).map(p => p.ts || 0));
    if (ult > (st.flags.gzVisto || 0)) st.flags.gzVisto = ult;
    const d = document.createElement('div');
    d.id = 'gazzetta';
    document.body.appendChild(d);
    this._prima = UI.modalOpen;
    UI.modalOpen = true;
    this._k = e => {
      if (e.code === 'Escape') Gazzetta.chiudi();
      if (!/^(INPUT|TEXTAREA)$/.test((e.target || {}).tagName || '')) e.stopPropagation();
    };
    addEventListener('keydown', this._k, true);
    AU.play('ui');
    gzDisegna();
    if (GZ_DB.ok())
      gzCaricaPiume().then(() => {
        if (gzAperta()) gzDisegna();
      });
  },
  chiudi() {
    const d = $('#gazzetta');
    if (!d) return;
    d.remove();
    removeEventListener('keydown', this._k, true);
    UI.modalOpen = this._prima || false;
  }
};

// ---------- grafica: il trespolo e Pennino ----------
Ext.on('arte', () => {
  try {
    const R = h => R6b(h);
    // trespolo: palo, colombaia col tettino, posatoio, cestino delle lettere
    FREEIMG.trespolo = SP(14, 30, P => {
      const M = () => new MK2(P.w, P.h);
      paint2(P, M().rect(13, 22, 3, 36), R('#7a4a2a'), { thin: 1 });
      paint2(P, M().rect(5, 56, 18, 3), R('#5a3a1e'), { thin: 1 });
      paint2(P, M().rect(5, 10, 18, 12), R('#c8a070'), { mod: (X, Y, t) => (X % 4 === 0 ? t - 1 : t) });
      paint2(P, M().ell(14, 16, 2.6, 3.2), R('#2a1810'), { flat: 1 });
      paint2(
        P,
        M().poly([
          [2, 11],
          [14, 2],
          [26, 11]
        ]),
        R('#a8402a'),
        { mod: (X, Y, t) => ((X + Y) % 5 === 0 ? t - 1 : t) }
      );
      paint2(P, M().rect(3, 23, 22, 2), R('#5a3a1e'), { thin: 1 });
      paint2(
        P,
        M().ell(20, 42, 5, 3.6, (X, Y) => Y >= 41),
        R('#b8945a'),
        { mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t) }
      );
      paint2(P, M().rect(17, 38, 6, 3), R('#f4ecd8'), { thin: 1, nc: 1 });
    });
    ICON.trespolo = icon32(() => {});
    {
      const x = ICON.trespolo.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(FREEIMG.trespolo, 9, 1, 14, 30);
    }
    // Pennino: grigio azzurro, collo cangiante verde e viola, zampe rosa
    const corpo = (P, M, testa, petto, ala) => {
      paint2(P, M().ell(11, 13, 7, 4.6 + petto), R('#8a96a8'), { mod: (X, Y, t) => (Y > 15 ? t - 1 : t) });
      paint2(P, M().ell(10, 12, 4.6, 2.6), R('#7a8698'), { thin: 1, nc: 1 });
      for (const x of [8, 11]) P.set(x, 13, C('#3a3a48'));
      paint2(P, M().cap(4, 13, 0, 15, 1.4), R('#5a6474'), { thin: 1 });
      if (ala !== undefined)
        paint2(P, M().rot(10, 9 + ala * 5, 7, 2.4, -0.4 + ala * 0.5), R('#9aa6b8'), { thin: 1 });
      paint2(P, M().ell(testa[0] - 1.5, testa[1] + 2.5, 2.6, 2.2 + petto * 0.5), R('#6a9a7a'), {
        thin: 1,
        mod: (X, Y, t) => ((X + Y) % 2 ? (P.set(X, Y, C('#8a6aa8')), null) : t)
      });
      paint2(P, M().ell(testa[0], testa[1], 2.8, 2.4), R('#8a96a8'));
      P.set(testa[0] + 1, testa[1] - 1, C('#d8602a'));
      P.set(testa[0] + 3, testa[1] + 0, C('#3a3030'));
      P.set(testa[0] + 4, testa[1] + 0, C('#3a3030'));
      if (ala === undefined) {
        P.set(9, 18 + petto, C('#d87a8a'));
        P.set(12, 18 + petto, C('#d87a8a'));
      }
    };
    const S = fn => SP(12, 11, P => fn(P, () => new MK2(P.w, P.h)));
    PC_IMG.posato = [
      S((P, M) => corpo(P, M, [16, 7], 0)), // guarda
      S((P, M) => corpo(P, M, [18, 10], 0)), // becca, testa avanti
      S((P, M) => corpo(P, M, [10, 8], 0)), // si liscia le piume
      S((P, M) => corpo(P, M, [16, 6], 1.4)) // tuba, petto gonfio
    ];
    PC_IMG.volo = [-1, 0, 1, 0].map(a => S((P, M) => corpo(P, M, [17, 9], 0, a)));
  } catch (e) {
    console.error(e);
  }
});
