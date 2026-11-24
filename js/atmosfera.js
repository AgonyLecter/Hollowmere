'use strict';
// ================= ATMOSFERA: l'autunno gotico della Valle =================
// Solo aspetto, niente regole di gioco. Tre strati, tutti agganciati con Ext (vedi world.js):
//  - 'terreno'      : il prato si ridipinge d'autunno (ocra secca, oliva, muschio scuro ai bordi del bosco)
//                     e si copre di foglie cadute, più fitte sotto gli alberi. Si calcola una volta sola.
//  - 'sopraTerreno' : la nebbia bassa che striscia a terra, sotto alberi e persone (dà profondità).
//  - 'gradazione'   : la «pellicola»: luce calda e ombre fredde, foschia in lontananza (in alto),
//                     buio in primo piano (in basso), notte verde-blu.
// Tutto deterministico (stesso posto, stesso aspetto).

const Atmo = (() => {
  const autunno = m => !m.interior && pratoStagione() === 0;

  // ---------- 1. il terreno d'autunno ----------
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  // rampe dal più scuro al più chiaro
  const SECCO = ['#3a2612', '#5e3e1a', '#86602a', '#a87c36', '#c89a46', '#e2bc62'].map(hex),
    OLIVA = ['#2a2c16', '#424420', '#5e5e2a', '#7a7834', '#989440', '#b8b058'].map(hex),
    MUSCHIO = ['#14221c', '#1e3226', '#2a442e', '#3a5834', '#4e6e3e', '#68884a'].map(hex);
  const rampa = (R, l) => {
    const f = clamp(l, 0, 0.999) * (R.length - 1),
      i = Math.floor(f),
      k = f - i,
      a = R[i],
      b = R[i + 1];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  };
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  // colore d'autunno per un verde, dato quanto è «asciutto» il punto (0 muschio … 1 secco)
  function autunnale(r, g, b, secco) {
    const l = (0.3 * r + 0.59 * g + 0.11 * b) / 255,
      L = Math.pow(l, 0.85) * 1.3;
    let c;
    if (secco > 0.5) c = mix(rampa(OLIVA, L), rampa(SECCO, L), (secco - 0.5) * 2);
    else c = mix(rampa(MUSCHIO, L), rampa(OLIVA, L), secco * 2);
    return c;
  }
  // c è la tela che si sta dipingendo: tutta la mappa, o un pezzo che comincia alla piastrella (Z.x0, Z.y0)
  function ridipingi(m, c, Z = { x0: 0, y0: 0 }) {
    const W2 = c.width,
      H2_ = c.height,
      S = c.s || 1,
      x = c.getContext('2d'),
      img = x.getImageData(0, 0, W2, H2_),
      d = img.data,
      // colori già calcolati: 5 bit per canale × 7 gradi di secchezza (packed rgb + 1; 0 = da fare)
      cache = new Int32Array(32768 * 7),
      // quanto è asciutto il prato: rumore ampio, calcolato per piastrella e interpolato
      N = new Float32Array((m.w + 1) * (m.h + 1));
    for (let ty = 0; ty <= m.h; ty++)
      for (let tx = 0; tx <= m.w; tx++) {
        let n = pratoRumore(tx * 16, ty * 16, 110, 21) * 0.7 + pratoRumore(tx * 16, ty * 16, 34, 22) * 0.3;
        // fuori dal recinto (il bordo del bosco) e accanto a un pino: muschio e umido
        const g = m.get(tx, ty);
        if (g === 5) n -= 0.55;
        N[ty * (m.w + 1) + tx] = n;
      }
    const T = 16 * S;
    for (let py = 0; py < H2_; py++) {
      const ty = Math.floor(py / T) + Z.y0,
        v = (py - (ty - Z.y0) * T) / T;
      for (let px = 0; px < W2; px++) {
        const i = (py * W2 + px) * 4,
          r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        if (d[i + 3] === 0) continue;
        const verde = g - (r > b ? r : b);
        if (verde <= 2) continue;
        const tx = Math.floor(px / T) + Z.x0,
          u = (px - (tx - Z.x0) * T) / T,
          k0 = ty * (m.w + 1) + tx,
          n =
            (N[k0] * (1 - u) + N[k0 + 1] * u) * (1 - v) +
            (N[k0 + m.w + 1] * (1 - u) + N[k0 + m.w + 2] * u) * v,
          // a gradini: i colori restano pochi e puliti, come in una tavolozza
          q = clamp(Math.round((n - 0.3) * 2.4 * 6) / 6, 0, 1),
          key = (((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)) * 7 + Math.round(q * 6);
        let c = cache[key];
        if (!c) {
          const a = autunnale(r, g, b, q),
            k = clamp(verde / 26, 0, 1),
            o = mix([r, g, b], a, k);
          c = cache[key] = ((Math.round(o[0]) << 16) | (Math.round(o[1]) << 8) | Math.round(o[2])) + 1;
        }
        c--;
        d[i] = c >> 16;
        d[i + 1] = (c >> 8) & 255;
        d[i + 2] = c & 255;
      }
    }
    x.putImageData(img, 0, 0);
  }
  // foglie cadute: più fitte sotto le chiome e dove il vento le ammucchia (contro recinti e muri)
  const FOGLIE = ['#8e3416', '#a8481c', '#c46824', '#d8923a', '#b07a2c', '#6e2a14', '#5a3a1c', '#9a2a18'];
  function foglie(m, x) {
    const pr = (a, b, k) => (hsh(a * 53 + k * 911, b * 29 + k * 271) % 10000) / 10000,
      B = new Map(),
      R = (col, X, Y, w, h) => {
        let p = B.get(col);
        if (!p) B.set(col, (p = new Path2D()));
        p.rect(X, Y, w, h);
      },
      prato = (X, Y) => {
        const g = m.get(Math.floor(X / 16), Math.floor(Y / 16));
        return g === 1 || g === 12 || g === 5 || g === 2;
      },
      foglia = (X, Y, s) => {
        if (!prato(X, Y)) return;
        X = Math.round(X * 2) / 2;
        Y = Math.round(Y * 2) / 2;
        const c = FOGLIE[Math.floor(pr(X * 2, Y * 2, s) * FOGLIE.length)],
          f = pr(X, Y, s + 3);
        R('#2a1a0c', X + 0.5, Y + 1, 1.5, 0.5); // ombra
        if (f < 0.4) {
          R(c, X, Y, 1.5, 1);
          R(shade(c, 0.3), X, Y, 0.5, 0.5);
        } else if (f < 0.75) {
          R(c, X, Y, 1, 1.5);
          R(shade(c, -0.25), X + 0.5, Y + 1, 0.5, 0.5);
        } else {
          R(c, X, Y + 0.5, 2, 0.5);
          R(c, X + 0.5, Y, 1, 1);
          R(shade(c, 0.3), X + 0.5, Y, 0.5, 0.5);
        }
      };
    // sotto gli alberi: un tappeto ovale, più fitto vicino al tronco. Ogni foglia ha il seme del suo posto
    // (l'albero o la piastrella, e il suo numero lì): cambiare una piastrella non sposta le foglie delle altre.
    const seme = (tx, ty, i) => (tx * 7919 + ty * 104729 + i * 31) % 1000003;
    for (const o of m.objs) {
      if (o.kind !== 'tree' || !o.img) continue;
      const cx = o.dx + iw(o.img) / 2,
        cy = o.sy - 2,
        nf = 45 + Math.floor(pr(o.tx, o.ty, 1) * 35);
      for (let i = 0; i < nf; i++) {
        const a = pr(o.tx, o.ty, i * 3 + 7) * Math.PI * 2,
          r = Math.pow(pr(o.tx, o.ty, i * 3 + 8), 0.7) * 26;
        foglia(cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r * 0.62 + 3, seme(o.tx, o.ty, i + 1));
      }
    }
    // sparse per il prato, a mucchi seguendo il rumore
    for (let ty = 0; ty < m.h; ty++)
      for (let tx = 0; tx < m.w; tx++) {
        const g = m.get(tx, ty);
        if (g !== 1 && g !== 12 && g !== 5) continue;
        const n = pratoRumore(tx * 16, ty * 16, 48, 31),
          // contro recinti e muri il vento le ammucchia
          contro = m.sol && m.sol[ty * m.w + tx] ? 0.25 : 0,
          nf = Math.floor(clamp((n - 0.5) * 16 + contro * 14, 0, 6));
        for (let i = 0; i < nf; i++)
          foglia(tx * 16 + pr(tx, ty, i) * 16, ty * 16 + pr(tx, ty, i + 40) * 16, seme(tx, ty, i + 500));
      }
    for (const [col, p] of B) {
      x.fillStyle = col;
      x.fill(p);
    }
  }
  // l'erba alta e i cespugli bassi seccano anche loro (una copia per immagine, fatta una volta)
  const secchi = new WeakMap();
  function seccato(im, q) {
    let c = secchi.get(im);
    if (c) return c;
    const [cc, x] = mk(im.width, im.height);
    x.drawImage(im, 0, 0);
    const img = x.getImageData(0, 0, im.width, im.height),
      d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const verde = d[i + 1] - Math.max(d[i], d[i + 2]);
      if (!d[i + 3] || verde <= 2) continue;
      const a = autunnale(d[i], d[i + 1], d[i + 2], q),
        k = clamp(verde / 22, 0, 1);
      d[i] = a[0] * k + d[i] * (1 - k);
      d[i + 1] = a[1] * k + d[i + 1] * (1 - k);
      d[i + 2] = a[2] * k + d[i + 2] * (1 - k);
    }
    x.putImageData(img, 0, 0);
    cc.s = im.s;
    secchi.set(im, cc);
    return cc;
  }
  Ext.on('listaMondo', (list, m) => {
    if (!autunno(m)) return;
    for (const e of list) {
      if (e.kind !== 'tuft' || !e.img || e._secco) continue;
      const orig = e.disegna;
      e._secco = 1;
      e.disegna = function (o) {
        const im = o.img;
        try {
          o.img = seccato(im, 0.75);
        } catch (err) {}
        orig ? orig(o) : dImg(ctx, o.img, Math.round(o.dx), Math.round(o.dy));
        o.img = im;
      };
    }
  });
  Ext.on('terreno', (m, x, Z) => {
    try {
      if (!autunno(m)) return;
      ridipingi(m, x.canvas, Z);
      foglie(m, x);
    } catch (e) {
      console.warn('atmosfera/terreno', e);
    }
  });

  // ---------- 2. la nebbia ----------
  // una trama di nebbia a bande (come in un dipinto a pixel): rumore a più ottave, ridotto a pochi livelli
  let TRAMA = null;
  function trama() {
    if (TRAMA) return TRAMA;
    const N = 192,
      [c, x] = mk(N, N),
      img = x.createImageData(N, N),
      d = img.data,
      // rumore che si ripete ai bordi (la trama si affianca senza cuciture)
      val = (X, Y, P, seme) => {
        const x0 = Math.floor(X),
          y0 = Math.floor(Y),
          fx = X - x0,
          fy = Y - y0,
          u = fx * fx * (3 - 2 * fx),
          v = fy * fy * (3 - 2 * fy),
          r = (a, b) => (hsh(((a % P) + P) % P, (((b % P) + P) % P) + seme * 977) % 1000) / 1000,
          a0 = r(x0, y0) + (r(x0 + 1, y0) - r(x0, y0)) * u,
          a1 = r(x0, y0 + 1) + (r(x0 + 1, y0 + 1) - r(x0, y0 + 1)) * u;
        return a0 + (a1 - a0) * v;
      };
    for (let y = 0; y < N; y++)
      for (let X = 0; X < N; X++) {
        let n = 0,
          w = 0.55,
          f = 4;
        for (let o = 0; o < 4; o++) {
          n += val((X / N) * f, (y / N) * f, f, o + 1) * w;
          w *= 0.5;
          f *= 2;
        }
        // tre bande di densità, con un po' di retino tra una e l'altra
        const b = n > 0.68 ? 0.8 : n > 0.6 ? 0.55 : n > 0.52 ? 0.32 : n > 0.45 ? 0.14 : 0,
          i = (y * N + X) * 4;
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = Math.round(b * 255);
      }
    x.putImageData(img, 0, 0);
    TRAMA = c;
    return c;
  }
  // quanta nebbia c'è, e di che colore: fitta all'alba e di notte, quasi niente a mezzogiorno
  function nebbia(m) {
    const st = G.st,
      t = st.time,
      wx = st.weather || 'sereno';
    let k;
    if (t < 6 * 60) k = 0.55;
    else if (t < 9 * 60 + 30) k = lerp(0.6, 0.1, clamp((t - 6.5 * 60) / 180, 0, 1));
    else if (t < 17 * 60) k = 0.08;
    else if (t < 20 * 60 + 30) k = lerp(0.08, 0.45, (t - 17 * 60) / 210);
    else k = 0.5;
    if (wx === 'nebbia') k += 0.4;
    if (wx === 'pioggia') k += 0.12;
    k += (G.horror || 0) * 0.25;
    if (pratoStagione() !== 0) k *= 0.6;
    let col;
    if (t >= 5 * 60 && t < 9 * 60 + 30) col = '#ece0c8';
    else if (t < 17 * 60 + 30 && t >= 9 * 60 + 30) col = '#e0d8c8';
    else if (t >= 17 * 60 + 30 && t < 20 * 60) col = '#e8b090';
    else col = H2() ? '#b8c8a8' : '#8cc8c0';
    return [clamp(k, 0, 0.9), col];
  }
  // la trama colorata (si rifà solo se cambia colore)
  const tinte = new Map();
  function tinta(col) {
    let c = tinte.get(col);
    if (c) return c;
    const t = trama(),
      [cc, x] = mk(t.width, t.height);
    x.drawImage(t, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = col;
    x.fillRect(0, 0, t.width, t.height);
    tinte.set(col, (c = cc));
    if (tinte.size > 8) tinte.delete(tinte.keys().next().value);
    return c;
  }
  // disegna la nebbia affiancata, scalata e spostata; in coordinate correnti, sull'area x0,y0,w,h
  function strato(col, a, sc, ox, oy, x0, y0, w, h) {
    if (a <= 0.01) return;
    const im = tinta(col),
      S = im.width * sc,
      sx = Math.floor((x0 - ox) / S) * S + ox,
      sy = Math.floor((y0 - oy) / S) * S + oy;
    // la nebbia è morbida: qui (e solo qui) si lascia sfumare l'ingrandimento
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = a;
    for (let Y = sy; Y < y0 + h; Y += S) for (let X = sx; X < x0 + w; X += S) ctx.drawImage(im, X, Y, S, S);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
  }
  const fuori = m => !m.interior && G.mode !== 'boot' && G.st;
  Ext.on('sopraTerreno', (m, cx, cy) => {
    try {
      if (!fuori(m)) return;
      const [k, col] = nebbia(m);
      // nebbia bassa: lenta, legata al terreno
      strato(col, k * 0.6, 3, G.t * 3, G.t * 0.8, cx, cy, VW, VH);
    } catch (e) {
      console.warn('atmosfera/nebbia', e);
    }
  });

  // ---------- 3. la gradazione ----------
  const blend = (op, col, a) => {
    if (a <= 0.005) return;
    ctx.globalCompositeOperation = op;
    ctx.globalAlpha = a;
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, VW, VH);
  };
  const fasce = (top, topA, bot, botA) => {
    // in alto la foschia della lontananza, in basso il primo piano in ombra
    let g = ctx.createLinearGradient(0, 0, 0, VH * 0.5);
    g.addColorStop(0, top.replace(')', `,${topA})`).replace('rgb', 'rgba'));
    g.addColorStop(1, top.replace(')', ',0)').replace('rgb', 'rgba'));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VW, VH * 0.5);
    g = ctx.createLinearGradient(0, VH * 0.6, 0, VH);
    g.addColorStop(0, bot.replace(')', ',0)').replace('rgb', 'rgba'));
    g.addColorStop(1, bot.replace(')', `,${botA})`).replace('rgb', 'rgba'));
    ctx.fillStyle = g;
    ctx.fillRect(0, VH * 0.6, VW, VH * 0.4);
  };
  Ext.on('gradazione', (m, cx, cy) => {
    try {
      if (!G.st || G.mode === 'boot') return;
      ctx.save();
      if (m.interior) {
        // dentro: luce di candela, angoli scuri
        blend('soft-light', '#e8a058', 0.18);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        fasce('rgb(20,12,8)', 0.18, 'rgb(14,8,6)', 0.3);
        ctx.restore();
        return;
      }
      const t = G.st.time,
        notte = G.night || 0,
        tram = t >= 16 * 60 && t < 21 * 60 ? Math.sin(clamp((t - 16 * 60) / 300, 0, 1) * Math.PI) : 0,
        alba = t < 9 * 60 ? clamp((9 * 60 - t) / 150, 0, 1) : 0,
        giorno = 1 - Math.max(notte, tram, alba);
      // il verde troppo acceso si spegne un po': l'autunno di Hollowmere è stanco
      blend('saturation', '#808080', tram * 0.08);
      // di giorno: luce d'ambra; al tramonto: arancio caldo con ombre fredde; all'alba: oro pallido
      blend('soft-light', '#e8a050', 0.16 * giorno);
      blend('soft-light', '#ff8a3a', 0.22 * tram);
      blend('multiply', '#a8bcc4', 0.22 * tram);
      blend('soft-light', '#f0c890', 0.15 * alba);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      // profondità: foschia lontana in alto, primo piano scuro in basso
      const haze =
        notte > 0.5
          ? 'rgb(60,120,120)'
          : tram > 0.3
            ? 'rgb(230,150,100)'
            : alba > 0.3
              ? 'rgb(235,220,195)'
              : 'rgb(220,200,160)';
      fasce(haze, 0.05 + notte * 0.08 + alba * 0.1 + tram * 0.06, 'rgb(12,8,6)', 0.2 + notte * 0.15);
      // nebbia alta: va più veloce e si sposta con la camera meno del terreno (sembra più vicina all'occhio)
      const [k, col] = nebbia(m);
      ctx.translate(-cx * 0.15, -cy * 0.15);
      strato(col, k * 0.4, 5, G.t * 7, G.t * 1.5, cx * 0.15, cy * 0.15, VW, VH);
      ctx.restore();
    } catch (e) {
      ctx.restore();
      console.warn('atmosfera/gradazione', e);
    }
  });
  return { nebbia, trama };
})();
