'use strict';
// ================= ANIMAZIONI E PERSONALIZZAZIONE =================

// ---------- animazioni degli attrezzi ----------
// il colpo: l'attrezzo disegnato in mano al personaggio fa un arco davanti a lui
const SWING_T = 0.36,
  SWING_TOOLS = { hoe: 1, can: 1, accetta: 1, piccone: 1, pala: 1, falce: 1 };
function toolSwing() {
  const it = selItem();
  if (!it || !SWING_TOOLS[it.id] || G.cut || UI.busy()) return;
  G.toolA = { id: it.id, t0: G.t, dir: G.player.dir };
}
function swingK() {
  const a = G.toolA;
  if (!a) return -1;
  const k = (G.t - a.t0) / SWING_T;
  if (k >= 1) {
    G.toolA = null;
    return -1;
  }
  return k;
}
// tre tempi: la carica (le braccia salgono indietro, piano, il polso piegato), il colpo (scendono veloci e il
// polso si apre: arriva sul bersaglio a metà del gesto, l'istante dell'impatto, IMPATTO in gesti.js), il ritorno.
// a = angolo del braccio visto di lato (0 avanti, π/2 giù, −π/2 su), w = quanto il manico gira rispetto al braccio.
const RIPOSO = 1.15;
function moto(id, k) {
  const L = (x, y, t) => x + (y - x) * t;
  if (id === 'can') {
    const su = Math.min(1, k / 0.3),
      versa = clamp((k - 0.25) / 0.35, 0, 1) - clamp((k - 0.8) / 0.2, 0, 1);
    return { a: L(RIPOSO, 0.35, su) + (k > 0.8 ? (k - 0.8) * 4 : 0), w: L(-0.2, 1.1, versa) };
  }
  if (id === 'falce') {
    // spazzata bassa: la lama parte da dietro e passa davanti, veloce nel mezzo
    const t = k < 0.25 ? (k / 0.25) * 0.12 : k < 0.55 ? 0.12 + ((k - 0.25) / 0.3) * 0.88 : 1;
    return { a: L(2.5, 0.45, t) + Math.max(0, (k - 0.6) / 0.4) * 0.6, w: L(0.2, 1.3, t) };
  }
  if (k < 0.3) {
    const t = 1 - (1 - k / 0.3) * (1 - k / 0.3);
    return { a: L(RIPOSO, -1.85, t), w: L(0.2, -1.5, t) };
  }
  if (k < 0.5) {
    const t = (k - 0.3) / 0.2,
      e = t * t;
    return { a: L(-1.85, 0.7, e), w: L(-1.5, 0.35, e) };
  }
  const t = (k - 0.5) / 0.5;
  return { a: L(0.7, RIPOSO, t), w: L(0.35, 0.2, t) };
}
// il personaggio col colpo in corso: corpo e braccia in posa (framePresa) e l'attrezzo nelle mani
function disegnaPresa() {
  const k = swingK(),
    a = G.toolA,
    p = G.player,
    ic = ICON[a.id],
    L = LOOKS.player,
    dir = a.dir,
    lato = dir === 1 || dir === 2,
    { a: ang, w } = moto(a.id, k),
    aq = presaQ(ang),
    fr = framePresa(L, dir, aq),
    X = Math.round(p.x),
    Y = Math.round(p.y),
    q = posaPresa(dir, aq, 22, 7 + (L.wide ? 1 : 0)),
    s = dir === 1 ? -1 : 1,
    // la mano nel mondo (il fotogramma è 2× e centrato sui piedi)
    hx = X + s * (q.mano[0] / 2 - 9),
    hy = Y - 27 + q.mano[1] / 2;
  // il manico: di lato gira nel piano dello schermo; di fronte e di spalle si vede di scorcio
  // di fronte e di spalle il polso piega meno, così l'attrezzo alzato resta visibile sopra la testa
  const h = ang + (lato ? w : w * 0.35);
  let rot,
    lungo = 1;
  if (lato) rot = h;
  else {
    const vx = (dir === 0 ? 1 : -1) * (0.3 * Math.cos(h) + 0.25),
      vy = Math.sin(h);
    rot = Math.atan2(vy, vx);
    lungo = clamp(Math.hypot(vx, vy), 0.65, 1);
  }
  // il manico che punta indietro passa dietro al corpo (di spalle: quello che punta avanti)
  const dietro = dir === 3 ? Math.cos(h) > 0.2 : Math.cos(h) < -0.3;
  const attrezzo = (r, alpha) => {
    if (!ic) return;
    const sz = (a.id === 'falce' ? 15 : 13) * lungo;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(hx, hy);
    if (dir === 1) ctx.scale(-1, 1);
    if (a.id === 'can') {
      // l'annaffiatoio pende dal manico e si inclina in avanti per versare
      ctx.rotate(lato ? w * 0.9 : 0);
      ctx.drawImage(ic, -3, -1, 9, 9);
      ctx.restore();
      return;
    }
    // l'icona è disegnata in diagonale (impugnatura in basso a sinistra): +π/4 la allinea al manico
    ctx.rotate(r + Math.PI / 4);
    ctx.drawImage(ic, -2, -sz + 1, sz, sz);
    ctx.restore();
  };
  const colpo = a.id === 'falce' ? k > 0.28 && k < 0.6 : a.id !== 'can' && k > 0.32 && k < 0.52;
  const scia = () => {
    if (!colpo || !lato) return;
    for (const [dk, al] of [
      [0.06, 0.16],
      [0.03, 0.3]
    ]) {
      const m = moto(a.id, k - dk);
      attrezzo(m.a + m.w, al);
    }
  };
  if (dietro) attrezzo(rot, 1);
  ctx.drawImage(SHADOW, X - 7, Y - 3);
  ctx.save();
  ctx.translate(X, Y);
  if (dir === 1) ctx.scale(-1, 1);
  dImg(ctx, fr, -9, -27);
  ctx.restore();
  if (!dietro) {
    scia();
    attrezzo(rot, 1);
  }
  // la falce lascia nell'aria l'arco della lama
  if (a.id === 'falce' && k > 0.35 && k < 0.7) {
    const u = (k - 0.35) / 0.35,
      [dx, dy] = DIRV[dir];
    ctx.save();
    ctx.globalAlpha = 0.45 * (1 - u);
    ctx.strokeStyle = '#eef4f8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const cx = p.x + dx * 8,
      cy = p.y - 6 + dy * 6,
      base = Math.atan2(dy, dx);
    ctx.ellipse(cx, cy, 13, 7, 0, base - 1.4, base - 1.4 + 2.8 * Math.min(1, u * 2));
    ctx.stroke();
    ctx.restore();
  }
}
// il corpo segue il colpo: un piccolo slancio in avanti
function swingOffset() {
  const k = swingK();
  if (k < 0) return [0, 0];
  const [dx, dy] = DIRV[G.toolA.dir],
    s = Math.sin(Math.min(1, k / 0.6) * Math.PI) * 1.5;
  return [dx * s, dy * s];
}
// gli oggetti colpiti tremano, quelli appena messi giù rimbalzano
function hitShake(o) {
  if (!o || !o.hitT) return 0;
  const t = G.t - o.hitT;
  if (t > 0.28) return 0;
  return Math.sin(t * 70) * 2.2 * (1 - t / 0.28);
}
function markHit(o) {
  if (o) o.hitT = G.t;
}
function popScale(o) {
  if (!o || !o.popT) return 1;
  const t = G.t - o.popT;
  if (t > 0.35) return 1;
  return 1 + Math.sin((t / 0.35) * Math.PI) * 0.18;
}
function flyPop(id, x, y) {
  if (ICON[id]) (G.pops || (G.pops = [])).push({ img: ICON[id], x, y, t0: G.t });
}

// ---------- personalizzazione: tetto, pareti, pavimento, recinti ----------
const LOOKOPT = {
  roof: {
    n: 'Tetto della casa',
    p: 300,
    o: {
      viola: ['Viola (originale)', null],
      rosso: ['Rosso mattone', '#a8402a'],
      verde: ['Verde bosco', '#3e7a3a'],
      blu: ['Blu ardesia', '#3a5a8a'],
      grigio: ['Grigio pietra', '#6a6a72'],
      oro: ['Ocra', '#c8983a']
    }
  },
  wall: {
    n: 'Pareti di casa',
    p: 350,
    o: {
      crema: ['Crema (originale)', null],
      salvia: ['Verde salvia', '#8ab08a'],
      vino: ['Rosso vino', '#9a4a4a'],
      notte: ['Blu notte', '#4a5a8a'],
      fiori: ['Carta a fiori', '#d8a8b8']
    }
  },
  floor: {
    n: 'Pavimento',
    p: 400,
    o: {
      legno: ['Legno (originale)', null],
      scuro: ['Legno scuro', '#5a3a24'],
      pietra: ['Pietra', '#9a978d'],
      cotto: ['Cotto', '#c8704a'],
      bianco: ['Piastrelle chiare', '#e8e0d0']
    }
  },
  fence: {
    n: 'Colore dei recinti',
    p: 150,
    o: {
      giallo: ['Giallo (originale)', null],
      bianco: ['Bianco', '#f0ece0'],
      legno: ['Legno naturale', '#9a6a3a'],
      verde: ['Verde', '#5a8a4a'],
      rosso: ['Rosso', '#b8402a']
    }
  }
};
const myLook = st => ((st || G.st).free && (st || G.st).free.look) || {};
const TINTC = new Map();
function tintTop(img, col, frac, mode) {
  const key =
    img.width + '|' + img.height + '|' + col + frac + mode + (img.__id || (img.__id = Math.random()));
  if (TINTC.has(key)) return TINTC.get(key);
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  c.s = img.s;
  if (img.lights) c.lights = img.lights;
  if (img.canopyH) c.canopyH = img.canopyH;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = mode || 'color';
  x.fillStyle = col;
  x.fillRect(0, 0, c.width, c.height * frac);
  x.globalCompositeOperation = 'destination-in';
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = 'source-over';
  TINTC.set(key, c);
  return c;
}
function applyLook(m, st) {
  if (!isFree(st)) return;
  const L = myLook(st);
  if (m.id === 'main') {
    const rc = L.roof && LOOKOPT.roof.o[L.roof] && LOOKOPT.roof.o[L.roof][1],
      fc = L.fence && LOOKOPT.fence.o[L.fence] && LOOKOPT.fence.o[L.fence][1];
    for (const o of m.objs) {
      if (rc && o.kind === 'bld' && o.key === 'house') o.img = tintTop(o.img, rc, 0.58, 'color');
      if (fc && o.kind === 'built' && o.bid === 'recinto') o.img = tintTop(o.img, fc, 1, 'color');
    }
  }
  if (m.id === 'house' && m.ground) {
    const x = m.ground.getContext('2d'),
      W2 = m.w * 32,
      wc = L.wall && LOOKOPT.wall.o[L.wall] && LOOKOPT.wall.o[L.wall][1],
      fl = L.floor && LOOKOPT.floor.o[L.floor] && LOOKOPT.floor.o[L.floor][1];
    if (wc) {
      x.globalCompositeOperation = 'color';
      x.fillStyle = wc;
      x.fillRect(0, 0, W2, 64);
      if (L.wall === 'fiori') {
        x.globalCompositeOperation = 'source-over';
        for (let i = 0; i < W2; i += 12)
          for (let j = 6; j < 60; j += 14) {
            x.fillStyle = 'rgba(255,240,220,.55)';
            x.fillRect(i + (j % 28 ? 6 : 0), j, 3, 3);
          }
      }
    }
    if (fl) {
      x.globalCompositeOperation = L.floor === 'bianco' || L.floor === 'pietra' ? 'source-over' : 'color';
      x.fillStyle = L.floor === 'bianco' || L.floor === 'pietra' ? fl + 'cc' : fl;
      x.fillRect(0, 64, W2, m.h * 32 - 64);
      if (L.floor === 'pietra' || L.floor === 'bianco' || L.floor === 'cotto') {
        x.globalCompositeOperation = 'source-over';
        x.fillStyle = 'rgba(40,30,20,.25)';
        for (let i = 0; i < W2; i += 24) x.fillRect(i, 64, 1, m.h * 32);
        for (let j = 64; j < m.h * 32; j += 24) x.fillRect(0, j, W2, 1);
      }
    }
    x.globalCompositeOperation = 'source-over';
  }
}
function lookMenu() {
  const st = G.st,
    L = (st.free.look = st.free.look || {});
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Personalizza</h2><p class="small">Agatha conosce un pittore, un falegname e un muratore. Paghi, e il giorno stesso è fatto. — Hai <b>${CZ(st.money)}</b></p>` +
      Object.entries(LOOKOPT)
        .map(
          ([k, g]) =>
            `<h3>${g.n} <span class="small">· ${SC(g.p)}</span></h3><p>${Object.entries(g.o)
              .map(
                ([ok, [nm, col]]) =>
                  `<button class="btn ${(L[k] || Object.keys(g.o)[0]) === ok ? 'on' : ''}" data-lk="${k}" data-lv="${ok}" style="${col ? `box-shadow:inset 0 calc(-3*var(--u)) 0 ${col},0 0 0 var(--u) #140a06` : ''}">${nm}</button>`
              )
              .join(' ')}</p>`
        )
        .join('')
  );
  $('#mbox')
    .querySelectorAll('[data-lk]')
    .forEach(
      b =>
        (b.onclick = () => {
          const k = b.dataset.lk,
            v = b.dataset.lv,
            g = LOOKOPT[k];
          if ((L[k] || Object.keys(g.o)[0]) === v) return;
          if (st.money < g.p) {
            UI.toast('Non hai abbastanza scudi.', 'bad');
            return;
          }
          st.money -= g.p;
          L[k] = v;
          AU.play('coin');
          UI.hud();
          rebuildMaps();
          if (G.map) G.map = G.maps[G.map.id];
          UI.toast(`${g.n}: ${g.o[v][0].toLowerCase()}.`);
          NET.save(st);
          UI._mclose = null;
          lookMenu();
        })
    );
}
