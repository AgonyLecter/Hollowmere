'use strict';
// ================= GESTI: i colpi che pesano =================
// Ogni colpo d'attrezzo ha tre tempi: la carica (l'attrezzo sale), l'impatto (a metà del colpo, quando la lama
// arriva sul bersaglio) e le conseguenze. Suono, scossa e schegge partono all'impatto (allImpatto), non quando
// premi il tasto: è questo che dà peso al colpo.
// Materiali: legno (schegge chiare, colpo sordo), pietra (scintille, schegge grigie, colpo secco), terra (zolle),
// erba (fili che volano), acqua (gocce e cerchi). L'albero abbattuto scricchiola e cade dalla parte opposta a chi
// lo taglia, con il tonfo e la polvere; la roccia si spacca in pezzi che rimbalzano.
// I pezzi vivono in uno spazio finto 3D: (x, y) per terra e z in altezza, con gravità, rimbalzo e ombra.

const GESTI = { coda: [], pezzi: [], cadute: [], resti: [] };
const IMPATTO = SWING_T * 0.5;
// fa succedere qualcosa quando l'attrezzo arriva sul bersaglio
function allImpatto(fn, ritardo = IMPATTO) {
  GESTI.coda.push({ t: G.t + ritardo, fn });
}
// la direzione del colpo (le schegge volano via da chi colpisce)
function gestoDir() {
  const p = G.player;
  return p ? DIRV[p.dir] : [0, 1];
}
const caso = (a, b) => a + Math.random() * (b - a);
function pezzo(o) {
  GESTI.pezzi.push(
    Object.assign({ z: 2, vz: 0, g: 260, t: 0, life: 0.9, w: 1, h: 1, rimbalzi: 1, ruota: 0 }, o)
  );
}
// una manciata di pezzi che schizzano via dal punto colpito, lontano da chi colpisce
function schizza(x, y, n, base) {
  const [dx, dy] = gestoDir();
  for (let i = 0; i < n; i++) {
    const a = Math.atan2(dy, dx) + caso(-1.1, 1.1),
      v = caso(25, 60) * (base.forza || 1);
    pezzo(
      Object.assign({}, base, {
        x: x + caso(-3, 3),
        y: y + caso(-2, 2),
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v * 0.5,
        vz: caso(45, 90) * (base.forza || 1),
        col: Array.isArray(base.col) ? base.col[i % base.col.length] : base.col,
        life: caso(0.6, 1) * (base.life || 1),
        ruota: caso(-8, 8)
      })
    );
  }
}
function polvere(x, y, n = 3, col = 'rgba(210,190,150,.5)', r = 5) {
  for (let i = 0; i < n; i++)
    pezzo({
      k: 'polvere',
      x: x + caso(-4, 4),
      y: y + caso(-2, 2),
      z: 1,
      g: 0,
      vx: caso(-12, 12),
      vy: caso(-4, 4),
      vz: caso(4, 10),
      col,
      r,
      life: 0.7
    });
}

// ---------- i materiali ----------
const GESTO = {
  legno(x, y) {
    AU.play('legno');
    schizza(x, y - 8, 7, { k: 'scheggia', col: ['#e8c890', '#c89a5a', '#a8743e'], w: 2, h: 1 });
    polvere(x, y, 2, 'rgba(200,170,120,.45)');
    G.shake = Math.max(G.shake, 0.8);
  },
  pietra(x, y) {
    AU.play('pietra');
    schizza(x, y - 4, 5, { k: 'scheggia', col: ['#c8c4b8', '#8a877d', '#a8a59a'], w: 1.5, h: 1.5 });
    for (let i = 0; i < 4; i++)
      pezzo({
        k: 'scintilla',
        x: x + caso(-3, 3),
        y: y - 4,
        z: 6,
        g: 120,
        vx: caso(-50, 50),
        vy: caso(-20, 10),
        vz: caso(30, 70),
        col: i % 2 ? '#fff2a0' : '#ffd060',
        life: 0.3
      });
    polvere(x, y, 2, 'rgba(190,185,175,.45)');
    G.shake = Math.max(G.shake, 0.9);
  },
  // la roccia si spacca: pezzi grossi che rimbalzano, polvere, il crollo
  roccia(x, y) {
    AU.play('crollo');
    for (let i = 0; i < 10; i++)
      pezzo({
        k: 'scheggia',
        x: x + caso(-5, 5),
        y: y + caso(-3, 3),
        z: caso(2, 8),
        vx: caso(-55, 55),
        vy: caso(-25, 25),
        vz: caso(60, 120),
        col: ['#c8c4b8', '#8a877d', '#6a675e', '#a8a59a'][i % 4],
        w: caso(2, 3.5),
        h: caso(1.5, 3),
        life: caso(0.9, 1.4),
        rimbalzi: 2,
        ruota: caso(-10, 10)
      });
    polvere(x, y, 5, 'rgba(180,175,165,.55)', 7);
    G.shake = Math.max(G.shake, 2.2);
  },
  terra(x, y) {
    AU.play('zolla');
    schizza(x, y, 6, { k: 'scheggia', col: ['#6a4428', '#8a5a32', '#4a2e1a'], w: 2, h: 2, forza: 0.8 });
    polvere(x, y, 2, 'rgba(150,110,70,.4)');
    G.shake = Math.max(G.shake, 0.5);
  },
  erba(x, y, n = 10) {
    AU.play('falce');
    schizza(x, y - 3, n, {
      k: 'filo',
      col: ['#5e8035', '#86aa4a', '#a3c262', '#3f6a26'],
      w: 1,
      h: 3,
      forza: 0.9,
      life: 1.2
    });
  },
  acqua(x, y) {
    for (let i = 0; i < 8; i++)
      pezzo({
        k: 'goccia',
        x: x + caso(-4, 4),
        y: y + caso(-2, 2),
        z: caso(6, 12),
        vx: caso(-20, 20),
        vy: caso(-8, 8),
        vz: caso(10, 40),
        col: i % 2 ? '#a8d8f8' : '#6ab0e0',
        life: 0.6,
        rimbalzi: 0
      });
    pezzo({ k: 'anello', x, y: y + 2, z: 0, g: 0, col: 'rgba(190,225,250,.7)', life: 0.5 });
  },
  semi(x, y) {
    for (let i = 0; i < 5; i++)
      pezzo({
        k: 'goccia',
        x: x + caso(-2, 2),
        y,
        z: 8,
        vx: caso(-10, 10),
        vy: caso(-4, 4),
        vz: caso(0, 20),
        col: '#e8d0a0',
        life: 0.5,
        rimbalzi: 0
      });
  }
};

// ---------- quello che è stato tolto resta lì (e trema) fino all'impatto ----------
// la logica toglie l'oggetto subito; il suo disegno resta finché l'attrezzo non lo raggiunge
function restaFinoAllImpatto(o) {
  if (o && o.img) GESTI.resti.push({ img: o.img, dx: o.dx, dy: o.dy, sy: o.sy, fino: G.t + IMPATTO });
}

// ---------- l'albero che cade ----------
// img: il disegno dell'albero; (x, y): la base del tronco. Cade dalla parte opposta a chi lo taglia.
function alberoCade(img, x, y) {
  const lato = G.player && G.player.x > x ? -1 : 1,
    t0 = G.t + IMPATTO;
  GESTI.cadute.push({ img, x, y, lato, t0, tonfo: false });
  allImpatto(() => AU.play('scricchiolio'));
}
const CADUTA = 0.85, // secondi per arrivare a terra
  SVANISCE = 0.5;
function cadutaDisegna(c) {
  const u = Math.max(0, (G.t - c.t0) / CADUTA),
    w = iw(c.img),
    h = ih(c.img);
  // prima dell'impatto è ancora in piedi (trema); poi cade sempre più veloce, e a terra rimbalza appena
  const giu = Math.min(1, u),
    ang =
      c.lato *
      (Math.PI / 2) *
      Math.pow(giu, 2.4) *
      (u > 1 ? 1 - Math.sin(Math.min(1, (u - 1) * 6) * Math.PI) * 0.04 : 1),
    trema = u === 0 ? Math.sin(G.t * 70) * 1.2 : 0,
    alpha = u > 1 ? Math.max(0, 1 - (u - 1) * (CADUTA / SVANISCE)) : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(c.x + trema), Math.round(c.y));
  ctx.rotate(ang);
  dImg(ctx, c.img, -w / 2, -h);
  ctx.restore();
}
function cadutaAterra(c) {
  c.tonfo = true;
  const h = ih(c.img);
  AU.play('tonfo');
  G.shake = Math.max(G.shake, 3);
  // polvere lungo il tronco disteso, foglie dalla chioma
  for (let i = 1; i <= 6; i++) polvere(c.x + c.lato * h * (i / 7), c.y, 1, 'rgba(200,180,140,.55)', 7);
  const sc = typeof seasonOf === 'function' && isFree() ? seasonOf() : 0,
    col = [
      ['#d86a28', '#e8a040', '#c9902a'],
      ['#eef3fa', '#d8e0ea'],
      ['#6a9a3a', '#f8c8d8', '#86c048'],
      ['#5a9a2a', '#3f7a2a', '#86c048']
    ][sc];
  for (let i = 0; i < 14; i++)
    pezzo({
      k: 'filo',
      x: c.x + c.lato * h * caso(0.5, 1),
      y: c.y + caso(-6, 6),
      z: caso(2, 10),
      vx: caso(-40, 40),
      vy: caso(-15, 15),
      vz: caso(30, 70),
      g: 90,
      col: col[i % col.length],
      w: 2,
      h: 1,
      life: caso(1, 1.6),
      rimbalzi: 0,
      ruota: caso(-6, 6)
    });
}

// ---------- vita dei pezzi ----------
Ext.on('mpTick', dt => {
  try {
    const C = GESTI.coda;
    for (let i = C.length - 1; i >= 0; i--)
      if (G.t >= C[i].t) {
        const f = C[i].fn;
        C.splice(i, 1);
        f();
      }
    const P = GESTI.pezzi;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.t += dt;
      if (p.t >= p.life) {
        P.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vz -= p.g * dt;
      p.z += p.vz * dt;
      if (p.z <= 0 && p.g > 0) {
        p.z = 0;
        if (p.rimbalzi > 0 && p.vz < -20) {
          p.rimbalzi--;
          p.vz = -p.vz * 0.35;
          p.vx *= 0.5;
          p.vy *= 0.5;
        } else {
          p.vz = 0;
          p.vx *= 0.8;
          p.vy *= 0.8;
          p.ruota = 0;
        }
      }
    }
    if (P.length > 400) P.splice(0, P.length - 400);
    const D = GESTI.cadute;
    for (let i = D.length - 1; i >= 0; i--) {
      const c = D[i],
        u = (G.t - c.t0) / CADUTA;
      if (u >= 1 && !c.tonfo) cadutaAterra(c);
      if (u > 1 + SVANISCE / CADUTA) D.splice(i, 1);
    }
  } catch (e) {
    console.error(e);
  }
});
// gli alberi che cadono stanno in profondità come gli altri oggetti; i pezzi si disegnano sopra il mondo
Ext.on('listaMondo', list => {
  for (const c of GESTI.cadute) list.push({ sy: c.y, draw: () => cadutaDisegna(c) });
  GESTI.resti = GESTI.resti.filter(r => G.t < r.fino);
  for (const r of GESTI.resti)
    list.push({
      sy: r.sy,
      draw: () => dImg(ctx, r.img, Math.round(r.dx + Math.sin(G.t * 70) * 0.8), Math.round(r.dy))
    });
});
Ext.on('drawWorldExtras', () => {
  for (const p of GESTI.pezzi) {
    const a = 1 - Math.max(0, (p.t - p.life * 0.6) / (p.life * 0.4));
    if (p.k === 'polvere') {
      const r = p.r * (0.5 + p.t / p.life);
      ctx.fillStyle = p.col;
      ctx.globalAlpha = a * 0.8;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - p.z, r, r * 0.6, 0, 0, 7);
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }
    if (p.k === 'anello') {
      const r = 2 + (p.t / p.life) * 8;
      ctx.strokeStyle = p.col;
      ctx.globalAlpha = a;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, r, r * 0.45, 0, 0, 7);
      ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }
    // ombra a terra (si stringe quando il pezzo è in alto)
    if (p.z > 1 && p.k !== 'scintilla') {
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.fillRect(Math.round(p.x) - 0.5, Math.round(p.y), 1, 0.5);
    }
    ctx.globalAlpha = a;
    ctx.fillStyle = p.col;
    if (p.ruota) {
      ctx.save();
      ctx.translate(p.x, p.y - p.z);
      ctx.rotate(p.t * p.ruota);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    } else ctx.fillRect(p.x - p.w / 2, p.y - p.z - p.h / 2, p.w, p.h);
    ctx.globalAlpha = 1;
  }
});

// ---------- i passi: ogni terreno ha il suo ----------
// (il tipo di casella: vedi GT in art.js)
function suonoPasso(m, g) {
  if (g === 4 || g === 6 || g === 10) return 'passoLegno';
  if (g === 7 || g === 8 || g === 9 || g === 13) return 'passoPietra';
  if (g === 2 || g === 11) return 'passoGhiaia';
  if ((g === 1 || g === 12 || g === 5) && !m.interior && isFree() && seasonOf() === 1) return 'passoNeve';
  if (g === 1 || g === 12 || g === 5) return 'passoErba';
  return 'step';
}

// ---------- i suoni dei materiali ----------
Object.assign(SFX, {
  // legno: colpo sordo e una punta di schiocco
  legno: (a, t) => {
    a.noise(t, 0.08, 0.45, 'bandpass', 600 + Math.random() * 160, 4);
    a.osc('triangle', 210 + Math.random() * 20, t, 0.07, 0.25, null, 0.002, 130);
    a.noise(t, 0.015, 0.2, 'bandpass', 2600, 3);
  },
  // pietra: colpo secco con il tintinnio del ferro
  pietra: (a, t) => {
    a.noise(t, 0.05, 0.35, 'highpass', 2400);
    a.osc('square', 1700 + Math.random() * 300, t, 0.05, 0.05);
    a.osc('sine', 2500 + Math.random() * 300, t, 0.14, 0.06);
    a.osc('sine', 120, t, 0.06, 0.25, null, 0.002, 80);
  },
  // la roccia che si spacca: tanti piccoli crolli
  crollo: (a, t) => {
    a.osc('sine', 90, t, 0.25, 0.5, null, 0.003, 45);
    for (let i = 0; i < 6; i++) a.noise(t + i * 0.045, 0.08, 0.35 - i * 0.04, 'lowpass', 1100 - i * 120, 1);
  },
  // l'albero che cede: il legno che si piega
  scricchiolio: (a, t) => {
    a.noise(t, 0.55, 0.18, 'bandpass', 420, 9, null, 0.05, 260);
    a.osc('sawtooth', 95, t, 0.5, 0.03, null, 0.08, 60);
  },
  // l'albero a terra: il tonfo e le fronde
  tonfo: (a, t) => {
    a.osc('sine', 65, t, 0.45, 0.8, null, 0.004, 32);
    a.noise(t, 0.5, 0.55, 'lowpass', 320, 1);
    a.noise(t + 0.04, 0.7, 0.12, 'highpass', 3200, 1, null, 0.05);
  },
  // la terra: zolla che si stacca
  zolla: (a, t) => {
    a.noise(t, 0.12, 0.35, 'lowpass', 520, 1);
    a.osc('sine', 95, t, 0.1, 0.25, null, 0.002, 55);
  },
  // i passi
  passoErba: (a, t) => a.noise(t, 0.05, 0.035, 'bandpass', 2600 + Math.random() * 900, 1.2, null, 0.008),
  passoGhiaia: (a, t) => {
    a.noise(t, 0.05, 0.05, 'highpass', 2200 + Math.random() * 1200, 1);
    a.noise(t + 0.02, 0.03, 0.03, 'bandpass', 4200, 2);
  },
  passoLegno: (a, t) => {
    a.noise(t, 0.04, 0.06, 'bandpass', 420 + Math.random() * 80, 3);
    a.osc('triangle', 150 + Math.random() * 20, t, 0.04, 0.05, null, 0.002, 110);
  },
  passoPietra: (a, t) => a.noise(t, 0.035, 0.05, 'bandpass', 1500 + Math.random() * 500, 2.5),
  passoNeve: (a, t) => {
    a.noise(t, 0.07, 0.05, 'lowpass', 1400 + Math.random() * 400, 1, null, 0.01);
    a.noise(t + 0.03, 0.05, 0.03, 'bandpass', 3200, 3);
  },
  // la falce: due fruscii (la lama che passa e l'erba che cade)
  falce: (a, t) => {
    a.noise(t, 0.16, 0.16, 'bandpass', 2400, 1.5, null, 0.01, 5600);
    a.noise(t + 0.08, 0.2, 0.07, 'highpass', 4200, 1, null, 0.02);
  }
});
