'use strict';
// ================= GRAFICA 3: strutture vive =================
// Finestre che si accendono quando qualcuno è in casa, comignoli che fumano (di più d'inverno e la sera),
// fucina e fornaci che pulsano, mulino che gira, api, campana che oscilla, pozzo che luccica.
// Solo aspetto: legge lo stato del gioco, non lo cambia.
window.MULINO_ANIM = true;

// ---------- chi è in casa ----------
const BEDTIME = {
  elder: 22 * 60,
  store: 22 * 60 + 30,
  cottage: 21 * 60 + 30,
  forge: 23 * 60,
  chapel: 22 * 60
};
function occupied() {
  const S = new Set();
  try {
    for (const n of G.npcs) {
      if (!n.hidden || n.clone) continue;
      const s = schedOf(n.id);
      const k = s && s.in ? s.in : !s ? HOMES[n.id] : null;
      if (k) S.add(k);
    }
  } catch (e) {}
  return S;
}
let OCC = new Set(),
  occT = 0;
{
  const _wl = winLit;
  winLit = function (k) {
    try {
      const t = G.st.time;
      if (k === 'house') return false;
      if (!OCC.has(k)) return false;
      if (t >= (BEDTIME[k] || 22 * 60) || t < 5 * 60 + 30) return false;
      return true;
    } catch (e) {
      return _wl(k);
    }
  };
}

// ---------- pale del mulino: 8 fotogrammi per un quarto di giro ----------
const PALE = Array.from({ length: 8 }, (_, i) => {
  const P = new PX(96, 124);
  mulinoPale(P, BK, Math.PI / 4 + (i * (Math.PI / 2)) / 8, 38);
  P.outline();
  return pxCanvas(P);
});

// ---------- stato animato ----------
const SV = { smokeT: 0, spark: 0, sil: new Map(), bees: 0 };
{
  const _up = updParts;
  updParts = function (dt) {
    const r = _up.apply(this, arguments);
    try {
      if (G.mode === 'game' || G.mode === 'title') svTick(dt);
    } catch (e) {
      console.error(e);
    }
    return r;
  };
}
function svTick(dt) {
  const m = G.map;
  if (!m || !G.st || m.interior || m.id !== 'main') return;
  occT -= dt;
  if (occT <= 0) {
    occT = 1;
    OCC = occupied();
  }
  const st = G.st,
    t = st.time,
    wx = st.weather,
    winter = typeof isWinter === 'function' && isWinter(),
    eve = t >= 17 * 60 || t < 9 * 60;
  // comignoli: fumo più fitto d'inverno, la sera e quando c'è qualcuno
  const dense = (winter ? 1 : 0) + (eve ? 0.6 : 0) + (wx === 'neve' ? 0.6 : 0);
  if (dense > 0) {
    SV.smokeT -= dt * dense;
    if (SV.smokeT <= 0) {
      SV.smokeT = 0.22;
      for (const s of m.smokes) {
        G.parts.push({
          k: 'smoke',
          x: s.x + (Math.random() * 3 - 1.5),
          y: s.y,
          vx: 4 + Math.random() * 4 + (wx === 'pioggia' || wx === 'neve' ? 8 : 0),
          vy: -8 - Math.random() * 5,
          t: 0,
          life: 3.6 + Math.random() * 1.5
        });
        if (G.night > 0.5 && winter && Math.random() < 0.25)
          G.parts.push({
            k: 'spark',
            x: s.x,
            y: s.y,
            vx: (Math.random() - 0.5) * 8,
            vy: -14 - Math.random() * 8,
            t: 0,
            life: 0.9,
            c: '#ffb050'
          });
      }
    }
  }
  // casette costruite: comignolo
  for (const o of m.objs) {
    if (o.kind !== 'built' || !o.img) continue;
    if (o.bid === 'casetta' && Math.random() < dt * (1.6 + dense * 2))
      G.parts.push({
        k: 'smoke',
        x: o.dx + 37 + Math.random() * 2,
        y: o.dy + 5,
        vx: 4 + Math.random() * 3,
        vy: -8 - Math.random() * 4,
        t: 0,
        life: 3.2
      });
    if (o.bid === 'fornace' && Math.random() < dt * 1.4)
      G.parts.push({
        k: 'smoke',
        x: o.dx + 8 + Math.random() * 2,
        y: o.dy + 1,
        vx: 3 + Math.random() * 3,
        vy: -9 - Math.random() * 4,
        t: 0,
        life: 2.6
      });
  }
  // fucina: scintille quando Brom lavora (di giorno)
  const forge = m.objs.find(o => o.kind === 'bld' && o.key === 'forge');
  if (forge && t >= 7 * 60 && t < 19 * 60) {
    SV.spark -= dt;
    if (SV.spark <= 0) {
      SV.spark = 0.8 + Math.random() * 1.6;
      const X = forge.dx + 66,
        Y = forge.dy + 42;
      for (let i = 0; i < 6; i++)
        G.parts.push({
          k: 'spark',
          x: X,
          y: Y,
          vx: (Math.random() - 0.5) * 40,
          vy: -20 - Math.random() * 30,
          t: 0,
          life: 0.5,
          c: Math.random() < 0.5 ? '#ffe080' : '#ff9030'
        });
      if (Math.hypot(G.player.x - X, G.player.y - Y) < 140) {
        try {
          AU.osc('square', 1400 + Math.random() * 300, AU.c.currentTime, 0.05, 0.03);
          AU.osc('sine', 2600, AU.c.currentTime, 0.12, 0.02);
        } catch (e) {}
      }
    }
  }
  // sagome dietro le finestre
  if (Math.random() < dt * 0.3) {
    const L = m.objs.filter(
      o => o.kind === 'bld' && o.img && o.img.lights && o.img.lights.length && winLit(o.key)
    );
    if (L.length) {
      const o = L[(Math.random() * L.length) | 0],
        w = o.img.lights[(Math.random() * o.img.lights.length) | 0];
      SV.sil.set(o.key + w[0], { o, w, t: 0, dir: Math.random() < 0.5 ? 1 : -1 });
    }
  }
  for (const [k, v] of SV.sil) {
    v.t += dt;
    if (v.t > 2.4) SV.sil.delete(k);
  }
}

// ---------- disegno sopra gli oggetti ----------
{
  const _we = drawWorldExtras;
  drawWorldExtras = function (m) {
    _we(m);
    try {
      if (m.interior || m.id !== 'main' || !G.st) return;
      const T = G.t,
        st = G.st,
        t = st.time,
        cx = G.cam.x,
        cy = G.cam.y,
        vis = o =>
          o.dx < cx + W + 10 &&
          o.dx + iw(o.img) > cx - 10 &&
          o.dy < cy + H + 10 &&
          o.dy + ih(o.img) > cy - 10;
      for (const o of m.objs) {
        if (!o.img || !vis(o)) continue;
        // finestre accese: tremolio della fiamma e qualcuno che passa
        if (o.kind === 'bld' && o.img.lights && G.night > 0.25 && winLit(o.key)) {
          const k = clamp((G.night - 0.25) * 3, 0, 1);
          for (const w of o.img.lights) {
            const X = Math.round(o.dx) + 1 + w[0],
              Y = Math.round(o.dy) + w[1],
              f = 0.15 + 0.15 * Math.sin(T * 7 + w[0]) + 0.08 * Math.sin(T * 13.7 + w[1]);
            ctx.fillStyle = `rgba(255,${(170 + f * 200) | 0},90,${(f * k).toFixed(2)})`;
            ctx.fillRect(X, Y, 10, 10);
            const s = SV.sil.get(o.key + w[0]);
            if (s) {
              const p = s.t / 2.4,
                sx = X + (s.dir > 0 ? -3 + p * 16 : 13 - p * 16);
              ctx.save();
              ctx.beginPath();
              ctx.rect(X, Y, 10, 10);
              ctx.clip();
              ctx.fillStyle = `rgba(40,20,10,${(0.75 * k).toFixed(2)})`;
              ctx.fillRect(sx, Y + 3, 3, 7);
              ctx.fillRect(sx + 0.5, Y + 1, 2, 2);
              ctx.restore();
            }
          }
        }
        // campana che oscilla dopo i rintocchi
        if (o.kind === 'bld' && o.key === 'chapel') {
          const ring =
            [12 * 60, 21 * 60].some(r => t >= r && t < r + 3) ||
            (typeof isSunday === 'function' && isSunday(st) && t >= 8 * 60 + 45 && t < 8 * 60 + 48);
          if (ring) {
            const bx = Math.round(o.dx) + 57,
              by = Math.round(o.dy) + 19,
              a = Math.sin(T * 5) * 0.6;
            ctx.fillStyle = '#14141c';
            ctx.fillRect(bx - 6, by - 1, 12, 10);
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(a);
            ctx.fillStyle = '#b88a24';
            ctx.fillRect(-3.5, 1, 7, 6);
            ctx.fillRect(-2.5, 0, 5, 1);
            ctx.fillStyle = '#f0c840';
            ctx.fillRect(-3, 1, 2, 5);
            ctx.fillStyle = '#8a6a1a';
            ctx.fillRect(-4, 6, 8, 1);
            ctx.fillStyle = '#4a3a1a';
            ctx.fillRect(-0.5, 7, 1, 1.5);
            ctx.restore();
          }
        }
        if (o.kind !== 'built') continue;
        const b = isFree() && st.free && st.free.built ? st.free.built[o.bk] : null,
          job = b && b.job && !(st.day >= b.job.ready);
        // mulino: le pale girano (più svelte se macina o se c'è vento)
        if (o.bid === 'mulino') {
          const sp = (job ? 1.6 : 0.6) * (st.weather === 'pioggia' || st.weather === 'neve' ? 1.6 : 1),
            fr = Math.floor(T * sp * 8) % 8;
          ctx.drawImage(PALE[fr], Math.round(o.dx), Math.round(o.dy) - 6, iw(o.img), ih(o.img) + 6);
        }
        // fornace: la bocca pulsa
        if (o.bid === 'fornace') {
          const f = 0.5 + 0.3 * Math.sin(T * 8) + 0.2 * Math.sin(T * 17),
            X = o.dx + 8,
            Y = o.dy + 18;
          ctx.fillStyle = `rgba(255,${(150 + f * 80) | 0},60,${(0.35 + f * 0.3).toFixed(2)})`;
          ctx.fillRect(X - 3, Y - 2, 6, 4);
          ctx.fillStyle = `rgba(255,240,170,${(f * 0.6).toFixed(2)})`;
          ctx.fillRect(X - 1, Y - 1, 2, 2);
        }
        // api attorno all'alveare
        if (
          o.bid === 'apiario' &&
          G.night < 0.4 &&
          st.weather !== 'pioggia' &&
          !(typeof isWinter === 'function' && isWinter())
        ) {
          for (let i = 0; i < 5; i++) {
            const a = T * (2 + i * 0.4) + i * 1.3,
              X = o.dx + 7 + Math.cos(a) * (6 + i) + Math.sin(a * 2.3) * 2,
              Y = o.dy + 8 + Math.sin(a * 1.4) * 5;
            ctx.fillStyle = '#2a1a10';
            ctx.fillRect(X, Y, 1, 1);
            ctx.fillStyle = '#f0c83a';
            ctx.fillRect(X + (Math.floor(T * 20 + i) % 2 ? -0.5 : 0.5), Y, 0.5, 0.5);
          }
        }
        // barattolo e botte al lavoro: bollicine
        if ((o.bid === 'barattolo' || o.bid === 'botte') && job) {
          for (let i = 0; i < 3; i++) {
            const k = (T * 0.8 + i / 3) % 1,
              X = o.dx + iw(o.img) / 2 - 2 + i * 2,
              Y = o.dy + 4 - k * 8;
            ctx.fillStyle = `rgba(255,255,255,${(0.7 * (1 - k)).toFixed(2)})`;
            ctx.fillRect(X, Y, 1, 1);
          }
        }
        // pozzo grande: l'acqua luccica
        if (o.bid === 'pozzogrande') {
          for (let i = 0; i < 4; i++) {
            const k = (T * 0.6 + i * 0.25) % 1,
              X = o.dx + 16 + Math.cos(i * 1.7 + T * 0.3) * 7 * k,
              Y = o.dy + 20 + Math.sin(i * 2.1) * 1.5;
            ctx.fillStyle = `rgba(200,235,255,${(0.6 * (1 - k)).toFixed(2)})`;
            ctx.fillRect(X, Y, 1.5, 0.5);
          }
        }
        // serra di notte: luce calda tra le piante
        if (o.bid === 'serra' && G.night > 0.4) {
          ctx.fillStyle = `rgba(255,220,140,${(0.12 + 0.04 * Math.sin(T * 2)).toFixed(2)})`;
          ctx.fillRect(o.dx + 3, o.dy + 20, 58, 18);
        }
      }
    } catch (e) {}
  };
}

// ---------- luce sopra al buio: aloni delle finestre, riflesso a terra, braci ----------
{
  const _amb = drawAmbTop;
  drawAmbTop = function (m) {
    _amb(m);
    try {
      if (m.id !== 'main' || !G.st || G.night <= 0.25) return;
      const T = G.t,
        k = clamp((G.night - 0.25) * 2.2, 0, 1),
        cx = G.cam.x,
        cy = G.cam.y;
      ctx.globalCompositeOperation = 'lighter';
      const glow = (X, Y, r, a, col) => {
        const g = ctx.createRadialGradient(X, Y, 0, X, Y, r);
        g.addColorStop(0, `rgba(${col},${a.toFixed(2)})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(X - r, Y - r, r * 2, r * 2);
      };
      for (const o of m.objs) {
        if (
          !o.img ||
          o.dx > cx + W + 40 ||
          o.dx + iw(o.img) < cx - 40 ||
          o.dy > cy + H + 40 ||
          o.dy + ih(o.img) < cy - 40
        )
          continue;
        if (o.kind === 'bld' && o.img.lights && winLit(o.key)) {
          for (const w of o.img.lights) {
            const X = o.dx + 1 + w[0] + 5,
              Y = o.dy + w[1] + 5,
              f = 1 + 0.06 * Math.sin(T * 7 + w[0]);
            glow(X, Y, 16 * f, 0.3 * k, '255,180,90');
            // riflesso sul terreno davanti alla casa
            const gy = o.sy + 2,
              g = ctx.createLinearGradient(0, Y + 6, 0, gy + 10);
            g.addColorStop(0, `rgba(255,170,80,${(0.14 * k).toFixed(2)})`);
            g.addColorStop(1, 'rgba(255,170,80,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(X - 5, Y + 6);
            ctx.lineTo(X + 5, Y + 6);
            ctx.lineTo(X + 9, gy + 10);
            ctx.lineTo(X - 9, gy + 10);
            ctx.closePath();
            ctx.fill();
          }
        }
        if (o.kind === 'bld' && o.key === 'forge') {
          const f = 0.7 + 0.3 * Math.sin(T * 9) * Math.sin(T * 3.1);
          glow(o.dx + 65, o.dy + 42, 22 * f, 0.35 * k, '255,120,40');
        }
        if (o.kind === 'built') {
          if (o.bid === 'fornace')
            glow(o.dx + 8, o.dy + 18, 18 * (0.85 + 0.15 * Math.sin(T * 8)), 0.35 * k, '255,120,40');
          if (o.bid === 'casetta')
            for (const [wx, wy] of [
              [10, 32],
              [38, 32]
            ])
              glow(o.dx + wx, o.dy + wy, 14 * (1 + 0.05 * Math.sin(T * 6 + wx)), 0.3 * k, '255,190,100');
          if (o.bid === 'serra') glow(o.dx + 32, o.dy + 30, 30, 0.18 * k, '255,210,130');
          if (o.bid === 'museo' || o.kind === 'museo')
            for (const wx of [13, 51]) glow(o.dx + wx, o.dy + 32, 12, 0.25 * k, '255,220,120');
        }
        if (o.kind === 'museo')
          for (const wx of [13, 51]) glow(o.dx + wx, o.dy + 32, 12, 0.25 * k, '255,220,120');
      }
      ctx.globalCompositeOperation = 'source-over';
    } catch (e) {
      ctx.globalCompositeOperation = 'source-over';
    }
  };
}
