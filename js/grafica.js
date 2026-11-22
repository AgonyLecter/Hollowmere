'use strict';
// ================= GRAFICA: ritocco del comparto visivo =================
// Solo aspetto: personaggi ridisegnati in pixel art "a mano", edifici ridipinti, luce.
// Non cambia logica, dimensioni delle immagini, collisioni o salvataggi: sostituisce
// le immagini dopo che i generatori originali le hanno create.

// =====================================================================
// PERSONAGGI — fotogramma 36×54 (come prima), disegnato per parti:
// ogni parte è una maschera colorata a toni pieni (luce in alto a sinistra),
// con un filo d'ombra dove copre la parte che sta dietro.
// =====================================================================
const GX = (() => {
  const W = 36,
    H = 54;
  class MK {
    constructor() {
      this.a = new Uint8Array(W * H);
    }
    has(X, Y) {
      return X >= 0 && Y >= 0 && X < W && Y < H && this.a[Y * W + X] === 1;
    }
    add(X, Y) {
      X = Math.floor(X);
      Y = Math.floor(Y);
      if (X >= 0 && Y >= 0 && X < W && Y < H) this.a[Y * W + X] = 1;
      return this;
    }
    del(X, Y) {
      if (X >= 0 && Y >= 0 && X < W && Y < H) this.a[Y * W + X] = 0;
      return this;
    }
    fn(f, x0 = 0, y0 = 0, x1 = W - 1, y1 = H - 1) {
      for (let Y = Math.max(0, Math.floor(y0)); Y <= Math.min(H - 1, Math.ceil(y1)); Y++)
        for (let X = Math.max(0, Math.floor(x0)); X <= Math.min(W - 1, Math.ceil(x1)); X++)
          if (f(X + 0.5, Y + 0.5, X, Y)) this.a[Y * W + X] = 1;
      return this;
    }
    rect(x, y, w, h) {
      return this.fn(() => true, x, y, x + w - 1, y + h - 1);
    }
    ell(cx, cy, rx, ry, clip) {
      return this.fn(
        (x, y, X, Y) => {
          const a = (x - cx) / rx,
            b = (y - cy) / ry;
          return a * a + b * b <= 1 && (!clip || clip(X, Y));
        },
        cx - rx - 1,
        cy - ry - 1,
        cx + rx + 1,
        cy + ry + 1
      );
    }
    cap(ax, ay, bx, by, r, r2 = r, clip) {
      const dx = bx - ax,
        dy = by - ay,
        L2 = dx * dx + dy * dy || 1,
        m = Math.max(r, r2) + 1;
      return this.fn(
        (x, y, X, Y) => {
          const t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1),
            rr = r + (r2 - r) * t;
          return Math.hypot(x - ax - dx * t, y - ay - dy * t) <= rr && (!clip || clip(X, Y));
        },
        Math.min(ax, bx) - m,
        Math.min(ay, by) - m,
        Math.max(ax, bx) + m,
        Math.max(ay, by) + m
      );
    }
    // fascia verticale: metà larghezza hw(Y) intorno a cx(Y)
    band(y0, y1, cxF, hwF, clip) {
      return this.fn(
        (x, y, X, Y) => {
          const hw = hwF(Y);
          return hw > 0 && Math.abs(x - cxF(Y)) <= hw && (!clip || clip(X, Y));
        },
        0,
        y0,
        W - 1,
        y1
      );
    }
    each(f) {
      for (let i = 0; i < W * H; i++) if (this.a[i]) f(i % W, (i / W) | 0);
    }
  }
  const dk = (R, k) => R.map(c => c.map(v => v * k));
  // pittura a toni pieni: 3 = tono base, 4 = luce (bordo in alto/a sinistra), 2 = ombra (destra/basso), 1 = ombra profonda
  function paint(P, M, R, o = {}) {
    const b = o.base ?? 3,
      sw = o.sw ?? 2;
    M.each((X, Y) => {
      let t = b;
      const r1 = !M.has(X + 1, Y),
        r2 = sw > 1 && !M.has(X + 2, Y),
        bt = !M.has(X, Y + 1),
        l = !M.has(X - 1, Y),
        tp = !M.has(X, Y - 1);
      if (!o.flat) {
        if (r1 || bt) t = b - 1;
        else if (r2) t = b - (o.soft ? 0 : 1);
        else if ((l && !o.noL) || (tp && !o.noT)) t = b + 1;
      }
      if (o.mod) t = o.mod(X, Y, t);
      if (t == null) return;
      P.set(X, Y, R[clamp(t, 0, R.length - 1)]);
    });
    // filo d'ombra sulle parti dietro
    if (o.nc) return;
    const seen = new Set(),
      d = P.d,
      k = o.ck ?? 0.68;
    M.each((X, Y) => {
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ]) {
        const xx = X + dx,
          yy = Y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H || M.has(xx, yy)) continue;
        const i = (yy * W + xx) * 4;
        if (!d[i + 3] || seen.has(i)) continue;
        seen.add(i);
        d[i] *= k;
        d[i + 1] *= k;
        d[i + 2] *= k;
      }
    });
  }
  const RC = new WeakMap();
  function ramps(L) {
    let R = RC.get(L);
    if (R) return R;
    const r = (c, k) => (c ? ramp6(c, k) : null);
    R = {
      sk: r(L.skin, 'skin'),
      hr: r(L.hair, 'hair'),
      sh: r(L.shirt),
      pa: r(L.pants || '#4a3a2a'),
      shoe: r(L.shoe || '#2b1d14'),
      robe: r(L.robe),
      dress: r(L.dress),
      cape: r(L.cape),
      apron: r(L.apron),
      beard: r(L.beard, 'hair'),
      hat: r(L.hatCol || '#4a3a2a'),
      band: r(L.hatBand || '#8a6a3a'),
      belt: r(L.belt || '#3a2414'),
      gold: r('#d8a84a'),
      vest: r(L.vest)
    };
    RC.set(L, R);
    return R;
  }
  const FR = [0, 1, 2, 1, 0, 1, 2, 2, 1, 0, 1, 1],
    fr = X => FR[(((X | 0) % 12) + 12) % 12];

  function frame(L, dir, ph, br, blink) {
    const P = new PX(W, H),
      R = ramps(L);
    const walk = ph != null,
      s = walk ? Math.sin(ph) : 0,
      c = walk ? Math.cos(ph) : 0,
      k = L.kid ? 3 : 0,
      wide = L.wide ? 1 : 0;
    const bob = walk ? -Math.round(Math.abs(s) * 1.2) : -(br || 0);
    const side = dir === 2,
      back = dir === 3,
      front = dir === 0,
      cx = 18;
    const cy = 14 + k + bob,
      tTop = 22 + k + bob,
      legTop = 36 + k,
      hw = 7 + wide;
    const sway = walk ? Math.sin(ph - 1) * 1.2 : br ? 0.5 : 0;
    const top = L.robe ? R.robe : R.sh;
    const hasHat = L.hat === 'tall' || L.hat === 'bonnet' || L.hat === 'cap';
    const hairMod = (X, Y, t) => {
      const h = (X * 7 + 3) % 5;
      if (h === 0 && Y > cy - ry + 3) t--;
      else if (h === 2 && (Y + X) % 3 === 0) t--;
      return t;
    };
    // ---- gambe e scarpe
    const legs = () => {
      if (L.robe) {
        shoesOnly();
        return;
      }
      if (side) {
        for (const q of [-1, 1]) {
          const fx = cx + (q > 0 ? s : -s) * 4,
            lift = Math.max(0, q > 0 ? c : -c) * 2,
            RR = q > 0 ? R.pa : dk(R.pa, 0.8),
            RS = q > 0 ? R.shoe : dk(R.shoe, 0.8);
          paint(P, new MK().cap(cx + q * 0.4, legTop + 1, fx, 47 - lift, 2.6, 2.3), RR);
          paint(
            P,
            new MK().ell(fx + 1.3, 49.6 - lift, 3.6, 2, (X, Y) => Y <= 51 - lift),
            RS
          );
        }
      } else
        for (const q of [-1, 1]) {
          const lx = q < 0 ? 15.5 : 20.5,
            lift = walk ? Math.max(0, q * s) * 2.4 : 0;
          paint(P, new MK().rect(lx - 2.5, legTop, 5, 13 - Math.round(lift)), R.pa, {
            mod: (X, Y, t) => (Y === legTop ? t - 1 : t)
          });
          paint(P, new MK().rect(lx - 3 + (q > 0 ? 1 : 0), 48 - Math.round(lift), 6, 3), R.shoe, {
            mod: (X, Y, t) => (Y === 48 - Math.round(lift) && t < 4 ? 4 : t)
          });
        }
    };
    const shoesOnly = () => {
      if (side) {
        for (const q of [-1, 1]) {
          const fx = cx + (q > 0 ? s : -s) * 3;
          paint(P, new MK().ell(fx + 1.3, 50, 3.4, 1.8), q > 0 ? R.shoe : dk(R.shoe, 0.8));
        }
      } else
        for (const q of [-1, 1]) {
          const lx = q < 0 ? 15 : 21,
            lift = walk ? Math.max(0, q * s) * 1.5 : 0;
          paint(P, new MK().rect(lx - 3, 48 - Math.round(lift), 6, 3), R.shoe);
        }
    };
    // ---- busto
    const tw = Y => {
      const d = Y - tTop;
      let w = side ? hw - 2 : hw;
      if (d < 2) w -= (2 - d) * 0.9;
      else w -= (d - 2) * 0.07;
      return w;
    };
    const torso = () => {
      if (L.robe) return;
      const M = new MK().band(tTop, legTop, () => cx, tw);
      const collar = front && !L.dress;
      paint(P, M, R.sh, {
        mod: (X, Y, t) => {
          const d = Y - tTop;
          if (collar && d >= 0 && d < 4 && Math.abs(X + 0.5 - cx) < 3.2 - d * 0.8) return null;
          if (
            !side &&
            d > 3 &&
            Math.abs(X + 0.5 - cx) > tw(Y) - 3.2 &&
            Math.abs(X + 0.5 - cx) < tw(Y) - 2 &&
            d < 10
          )
            t--; // pieghe sotto le braccia
          return t;
        }
      });
      if (collar) {
        for (let d = 0; d < 4; d++)
          for (let X = Math.ceil(cx - 3.2 + d * 0.8); X < cx + 3.2 - d * 0.8; X++)
            P.set(X, tTop + d, R.sk[d < 1 ? 2 : 3]);
        // colletto
        for (const q of [-1, 1]) {
          P.set(cx + q * 3.2 - (q > 0 ? 1 : 0), tTop, R.sh[4]);
          P.set(cx + q * 2.4 - (q > 0 ? 1 : 0), tTop + 1, R.sh[4]);
          P.set(cx + q * 1.6 - (q > 0 ? 1 : 0), tTop + 2, R.sh[2]);
        }
      }
      if (front && !L.vest && !L.apron && !L.dress)
        for (const d of [5, 8, 11]) if (tTop + d < legTop - 1) P.set(cx - 1, tTop + d, R.sh[1]);
      // cintura
      if (!L.dress) {
        const by = legTop - 1,
          BM = new MK().band(
            by,
            by + 1,
            () => cx,
            Y => tw(Y) + 0.2
          );
        paint(P, BM, R.belt, { nc: 1, noT: 1 });
        if (front) {
          P.set(cx - 1, by, R.gold[4]);
          P.set(cx, by, R.gold[3]);
          P.set(cx - 1, by + 1, R.gold[2]);
          P.set(cx, by + 1, R.gold[2]);
        }
        if (side) {
          P.set(cx + 3, by, R.gold[3]);
          P.set(cx + 3, by + 1, R.gold[2]);
        }
      }
      if (L.vest && !back) {
        const VM = new MK().band(
          tTop + 1,
          legTop - 1,
          () => cx,
          Y => tw(Y) + 0.3,
          (X, Y) => (side ? X < cx + 2 : Math.abs(X + 0.5 - cx) > 1.6 + (Y - tTop) * 0.12)
        );
        paint(P, VM, R.vest, { ck: 0.8 });
        if (front) for (const d of [6, 9]) P.set(cx + 2, tTop + d, R.gold[3]);
      }
    };
    // ---- tonaca
    const robe = () => {
      if (!L.robe) return;
      const bot = 49,
        ww = Y => {
          const d = Y - tTop;
          let w = (side ? hw - 1.5 : hw) + d * 0.13;
          if (d < 2) w -= (2 - d) * 0.9;
          return w;
        };
      const M = new MK().band(
        tTop,
        bot + 1,
        Y => cx + (walk ? (sway * (Y - tTop)) / 26 : 0) * (side ? 1 : 0.4),
        ww,
        (X, Y) => Y <= bot + ((X + Math.floor((ph || 0) * 2)) % 3 === 0 ? 1 : 0)
      );
      paint(P, M, R.robe, {
        mod: (X, Y, t) => {
          const d = Y - tTop;
          if (d > 9) {
            const f = (X - cx + 40 + Math.round((ph || 0) * 0.8)) % 5;
            if (f === 0) t--;
          }
          if (front && L.robeOpen && Math.abs(X + 0.5 - cx) < 1.3 && Y < legTop + 3) return 2;
          return t;
        }
      });
      if (front && L.robeOpen)
        for (let Y = tTop; Y < legTop + 3; Y++) {
          P.set(cx - 1, Y, R.sh[2]);
          P.set(cx, Y, R.sh[3]);
        }
      if (L.rope) {
        const ry = legTop - 1;
        M.each((X, Y) => {
          if (Y === ry) P.set(X, Y, R.gold[X % 2 ? 3 : 2]);
        });
        if (front)
          paint(
            P,
            new MK()
              .rect(cx + 2, ry, 1, 6)
              .add(cx + 2, ry + 6)
              .add(cx + 3, ry + 6),
            R.gold,
            { flat: 1, nc: 1 }
          );
      }
    };
    // ---- gonna
    const dress = () => {
      if (!L.dress) return;
      const t0 = legTop - 2,
        bot = 45;
      // corpetto
      paint(
        P,
        new MK().band(
          tTop + 3,
          t0 + 1,
          () => cx,
          tw,
          (X, Y) => !(front && Y < tTop + 6 && Math.abs(X + 0.5 - cx) < 2.6)
        ),
        R.dress,
        { ck: 0.8 }
      );
      const M = new MK().band(
        t0,
        bot + 1,
        Y => cx + ((sway * (Y - t0)) / 12) * (side ? 1 : 0.5),
        Y => (side ? hw - 1 : hw) + (Y - t0) * 0.36,
        (X, Y) => Y <= bot + ((X + Math.floor((ph || 0) * 2)) % 4 === 0 ? 1 : 0)
      );
      paint(P, M, R.dress, {
        mod: (X, Y, t) => {
          if (Y === t0) return 2;
          if (Y > t0 + 2) {
            const f = (X - cx + 40 + Math.round(walk ? ph : 0)) % 5;
            if (f === 0) t--;
            else if (f === 1 && t === 3) t = 4;
          }
          return t;
        }
      });
      // orlo chiaro
      M.each((X, Y) => {
        if (!M.has(X, Y + 1) && Y > t0 + 3) P.set(X, Y - 1, R.dress[4]);
      });
    };
    const apron = () => {
      if (!L.apron || back) return;
      const M = side
        ? new MK().rect(cx + 2, tTop + 3, 3, legTop + 7 - tTop - 3)
        : new MK().band(
            tTop + 3,
            legTop + 7,
            () => cx,
            () => hw - 1.6
          );
      paint(P, M, R.apron, { mod: (X, Y, t) => (Y === tTop + 3 ? 4 : t) });
      if (front) {
        for (const q of [-1, 1])
          paint(P, new MK().rect(cx + q * 3.5 - (q > 0 ? 1 : 0), tTop, 1, 3), R.apron, { flat: 1, nc: 1 });
        P.set(cx - 1, tTop + 8, R.apron[1]);
        P.set(cx, tTop + 8, R.apron[1]);
      }
    };
    // ---- mantella
    const cape = behind => {
      if (!L.cape) return;
      const len = L.capeLen || 13;
      if (behind) {
        if (back || side) return;
        paint(
          P,
          new MK().band(
            tTop,
            tTop + len,
            () => cx,
            Y => hw + 1.5 + (Y - tTop) * 0.15,
            (X, Y) => Y <= tTop + len - (X % 3 ? 0 : 1)
          ),
          dk(R.cape, 0.85),
          { nc: 1 }
        );
        return;
      }
      if (back) {
        paint(
          P,
          new MK().band(
            tTop - 1,
            tTop + len,
            Y => cx + ((sway * (Y - tTop)) / len) * 0.6,
            Y => hw + 1.5 + (Y - tTop) * 0.13,
            (X, Y) => Y <= tTop + len - ((X + Math.floor((ph || 0) * 2)) % 3 === 0 ? 1 : 0)
          ),
          R.cape,
          { mod: (X, Y, t) => ((X + 40) % 4 === 0 && Y > tTop + 3 ? t - 1 : t) }
        );
        return;
      }
      if (side) {
        paint(
          P,
          new MK().band(
            tTop - 1,
            tTop + len,
            Y => cx - 2.6 + (sway * (Y - tTop)) / len,
            Y => 4.4 + (Y - tTop) * 0.1,
            (X, Y) => Y <= tTop + len - (X % 3 === 0 ? 1 : 0)
          ),
          R.cape
        );
        return;
      }
      for (const q of [-1, 1])
        paint(
          P,
          new MK().band(
            tTop - 1,
            tTop + len - 2,
            () => cx + q * (hw - 0.5) + sway * 0.3,
            () => 2.6,
            (X, Y) => Y <= tTop + len - 2 - (X % 3 ? 0 : 1)
          ),
          R.cape
        );
    };
    const mantle = () => {
      if (!L.cape || !front) return;
      paint(
        P,
        new MK().ell(cx, tTop + 0.5, hw + 0.5, 2.6, (X, Y) => Y >= tTop - 1 && Math.abs(X + 0.5 - cx) > 2.4),
        R.cape,
        { ck: 0.8 }
      );
    };
    // ---- braccia
    const arm = (q, far) => {
      const RA = far ? dk(top, 0.78) : top,
        RS = far ? dk(R.sk, 0.82) : R.sk;
      let sx, sy, hx, hy;
      if (side) {
        const sw = (far ? 1 : -1) * s * 3.4;
        sx = cx + (far ? -1 : 0);
        sy = tTop + 2.4;
        hx = cx + sw + (far ? -1 : 0.4);
        hy = tTop + 11;
      } else {
        sx = cx + q * (hw - 0.8);
        sy = tTop + 2.4;
        const sw = walk ? -q * s * 1.3 : 0;
        hx = cx + q * (hw + 0.4);
        hy = tTop + 11 + sw;
      }
      const mx = (sx + hx) / 2,
        my = (sy + hy) / 2;
      if (L.rolled) {
        paint(P, new MK().cap(sx, sy, mx, my, 2.4, 2.1), RA, { sw: 1 });
        paint(P, new MK().cap(mx, my, hx, hy, 1.9, 1.8), RS, { sw: 1 });
      } else {
        paint(P, new MK().cap(sx, sy, hx, hy, 2.4, 2.1), RA, {
          sw: 1,
          mod: (X, Y, t) => (Y >= Math.round(hy) ? t - 1 : t)
        });
      }
      paint(P, new MK().ell(hx, hy + 1.6, 1.9, 1.8), RS, { sw: 1 });
    };
    const neck = () =>
      paint(P, new MK().rect(cx - 2 + (side ? -1 : 0), cy + 6, 4, tTop - cy - 5), R.sk, { base: 2, nc: 1 });
    // ---- testa
    const rx = side ? 7.8 : 8.2,
      ry = 8.1,
      hcx = side ? cx + 0.4 : cx;
    const head = () => {
      const M = new MK().ell(hcx, cy, rx, ry);
      paint(P, M, R.sk, {
        sw: 2,
        mod: (X, Y, t) => {
          if (Y > cy + 5 && Math.abs(X + 0.5 - hcx) > rx - 3) t = Math.min(t, 2);
          if (t === 4 && (Y > cy + 2 || X > hcx)) t = 3;
          return t;
        }
      });
      if (side) P.set(Math.floor(hcx + rx), cy + 3, R.sk[3]);
    }; // naso
    const ears = () => {
      if (L.hideEars || (hasHat && L.hat === 'bonnet')) return;
      if (side)
        paint(P, new MK().ell(cx - 1.2, cy + 2, 1.4, 2), R.sk, {
          base: 3,
          nc: 1,
          mod: (X, Y, t) => (X === Math.floor(cx - 1.2) && Y === cy + 2 ? 1 : t)
        });
      else if (!back) {
        for (const q of [-1, 1])
          paint(P, new MK().ell(cx + q * (rx + 0.2), cy + 2, 1.3, 1.9), R.sk, { base: q < 0 ? 3 : 2, nc: 1 });
      } else
        for (const q of [-1, 1])
          paint(P, new MK().ell(cx + q * (rx + 0.1), cy + 2, 1.2, 1.8), R.sk, { base: 2, nc: 1 });
    };
    const face = () => {
      if (L.faceless || back) return;
      const ey = cy + 1,
        eye = C(L.eye || '#3a5a7a'),
        eyeD = C(mix(L.eye || '#3a5a7a', '#120a0a', 0.55)),
        lash = C('#1e100c'),
        hl = C('#ffffff'),
        brw = C(shade(L.hair, -0.45)),
        lip = C(L.lip || '#a8504a'),
        lipL = C(shade(L.lip || '#a8504a', 0.25)),
        bl = C('#ff8080');
      const E = (ex, mir) => {
        if (blink) {
          P.set(ex, ey + 2, lash);
          P.set(ex + 1, ey + 2, lash);
          return;
        }
        P.set(ex, ey, lash);
        P.set(ex + 1, ey, lash);
        P.set(ex, ey + 1, mir ? eyeD : hl);
        P.set(ex + 1, ey + 1, mir ? hl : eyeD);
        P.set(ex, ey + 2, mir ? eyeD : eye);
        P.set(ex + 1, ey + 2, mir ? eye : eyeD);
      };
      if (front) {
        E(cx - 5, 0);
        E(cx + 3, 0);
        for (const ex of [cx - 5, cx + 3]) {
          P.set(ex, ey - 2, brw);
          P.set(ex + 1, ey - 2, brw);
        }
        P.set(cx - 6, ey - 1, brw);
        P.set(cx + 5, ey - 1, brw);
        P.set(cx, cy + 4, R.sk[2]);
        if (L.smile === false) {
          P.set(cx - 1, cy + 6, lip);
          P.set(cx, cy + 6, lip);
        } else {
          P.set(cx - 1, cy + 6, lip);
          P.set(cx, cy + 6, lip);
          P.set(cx - 2, cy + 5, lipL);
          P.set(cx + 1, cy + 5, lipL);
        }
        P.set(cx - 6, cy + 4, bl, 120);
        P.set(cx - 5, cy + 4, bl, 70);
        P.set(cx + 4, cy + 4, bl, 70);
        P.set(cx + 5, cy + 4, bl, 120);
      } else {
        E(cx + 3, 0);
        P.set(cx + 3, ey - 2, brw);
        P.set(cx + 4, ey - 2, brw);
        P.set(cx + 5, ey - 2, brw);
        P.set(cx + 5, cy + 6, lip);
        P.set(cx + 4, cy + 6, lip);
        P.set(cx + 3, cy + 4, bl, 120);
        P.set(cx + 2, cy + 4, bl, 70);
      }
    };
    const beard = () => {
      if (!L.beard || back) return;
      const bx = side ? cx + 3 : cx;
      paint(
        P,
        new MK().ell(
          bx,
          cy + 6.5,
          side ? 4.6 : 6.4,
          4.6,
          (X, Y) => Y > cy + 3.6 && !(front && Y === cy + 6 && Math.abs(X + 0.5 - cx) < 1.5)
        ),
        R.beard,
        { mod: hairMod, ck: 0.8 }
      );
      if (front) {
        P.set(cx - 1, cy + 6, C(L.lip || '#a8504a'));
        P.set(cx, cy + 6, C(L.lip || '#a8504a'));
      }
      // baffi
      if (front) for (let X = cx - 3; X < cx + 3; X++) P.set(X, cy + 5, R.beard[X < cx ? 3 : 2]);
    };
    // ---- capelli
    const hairHL = (X, Y, t) => {
      t = hairMod(X, Y, t);
      const d = Y - (cy - ry + 2),
        dx = X + 0.5 - (cx - 2);
      if (d === 0 && Math.abs(dx) < 3.5 && t >= 3) t = 5;
      else if (d === 1 && Math.abs(dx) < 5 && t >= 3) t = 4;
      else if (d === 1 && Math.abs(dx) < 2) t = 5;
      return t;
    };
    const hairBack = () => {
      if (L.style !== 'long' || side) return;
      const t0 = cy - 1,
        b0 = cy + (back ? 19 : 17);
      paint(
        P,
        new MK().band(
          t0,
          b0,
          Y => cx + (sway * (Y - t0)) / (b0 - t0),
          Y => rx + 1.3 - (Y - t0) * 0.05,
          (X, Y) => Y <= b0 - 1 - (fr(X * 3) % 2)
        ),
        back ? R.hr : dk(R.hr, 0.82),
        { mod: hairMod, nc: !back }
      );
    };
    const hair = () => {
      const st = L.style,
        HR = R.hr;
      if (st === 'bald') {
        if (back)
          paint(
            P,
            new MK().ell(cx, cy + 1, rx + 0.4, ry, (X, Y) => Y > cy && Y < cy + 4),
            HR,
            { mod: hairMod }
          );
        else if (side)
          paint(
            P,
            new MK().ell(cx, cy, rx + 0.4, ry, (X, Y) => Y > cy - 1 && Y < cy + 3 && X < cx - 3),
            HR,
            { mod: hairMod }
          );
        else
          paint(
            P,
            new MK().ell(
              cx,
              cy,
              rx + 0.5,
              ry,
              (X, Y) => Y > cy - 1 && Y < cy + 3 && Math.abs(X + 0.5 - cx) > rx - 1.3
            ),
            HR,
            { mod: hairMod, nc: 1 }
          );
        return;
      }
      if (back) {
        paint(
          P,
          new MK().ell(
            cx,
            cy - 0.5,
            rx + 0.9,
            ry + 0.4,
            (X, Y) => Y < cy + 4.5 + (st === 'long' ? 20 : 0) - (st === 'long' ? 0 : fr(X) % 2)
          ),
          HR,
          { mod: hairHL }
        );
      } else if (side) {
        paint(
          P,
          new MK().ell(
            cx - 0.3,
            cy - 1,
            rx + 0.9,
            ry + 0.3,
            (X, Y) => Y < cy - 2.4 + (X > cx + 2 ? fr(X) : 9) && (X < cx + 5 || Y < cy - 1.5)
          ),
          HR,
          { mod: hairHL }
        );
        if (st === 'long')
          paint(
            P,
            new MK().band(
              cy - 1,
              cy + 15,
              Y => cx - 3.8 + ((sway * (Y - cy)) / 15) * 1.4,
              Y => 4.2 - (Y - cy) * 0.07,
              (X, Y) => Y <= cy + 14 - (fr(X * 5) % 2)
            ),
            HR,
            { mod: hairMod }
          );
      } else {
        paint(
          P,
          new MK().ell(
            cx,
            cy - 1.2,
            rx + 0.9,
            ry + 0.3,
            (X, Y) =>
              Y < cy - 2.6 + fr(X) ||
              (Math.abs(X + 0.5 - cx) > rx - 2.2 + Math.max(0, Y - cy + 2) * 0.45 && Y < cy + 3)
          ),
          HR,
          { mod: hairHL }
        );
        if (st === 'long')
          for (const q of [-1, 1])
            paint(
              P,
              new MK().cap(cx + q * (rx - 0.4), cy - 1, cx + q * (rx + 0.3) + sway * 0.7, cy + 14, 2.3, 1.6),
              HR,
              { mod: hairMod, sw: 1 }
            );
      }
      if (st === 'bun')
        paint(P, new MK().ell(cx + (side ? -2 : 0), cy - ry - 0.6, 3.8, 3.2), HR, { mod: hairHL });
      if (st === 'messy')
        for (const [a, b] of [
          [-6, -7],
          [-2, -9],
          [3, -9],
          [6, -6],
          [0, -10]
        ])
          paint(P, new MK().cap(cx + a, cy + b + 2, cx + a * 1.2, cy + b, 1.3), HR, { sw: 1, nc: 1 });
    };
    // ---- cappelli
    const hat = () => {
      if (!hasHat) return;
      const HC = R.hat;
      if (L.hat === 'tall') {
        paint(
          P,
          new MK().band(
            cy - 18,
            cy - 6,
            () => cx,
            () => 6.2
          ),
          HC,
          { mod: (X, Y, t) => (Y === cy - 18 ? 4 : t) }
        );
        for (let X = cx - 6; X < cx + 6; X++) {
          P.set(X, cy - 8, R.band[X < cx ? 4 : 3]);
          P.set(X, cy - 7, R.band[2]);
        }
        paint(P, new MK().ell(cx, cy - 5.5, side ? 9.5 : 10.5, 2.2), HC, {
          mod: (X, Y, t) => (Y < cy - 5 ? 4 : t)
        });
      }
      if (L.hat === 'bonnet') {
        paint(
          P,
          new MK().ell(
            cx,
            cy - 1.5,
            rx + 1.6,
            ry + 0.6,
            (X, Y) => Y < cy - 2.8 || ((side ? X < cx - 1 : Math.abs(X + 0.5 - cx) > rx - 1.6) && Y < cy + 5)
          ),
          HC,
          { mod: (X, Y, t) => ((X * 2 + Y) % 5 === 0 ? t - 1 : t) }
        );
        if (front) {
          for (let X = cx - rx; X <= cx + rx; X++) if (P.has(X, cy - 3)) P.set(X, cy - 3, HC[X % 2 ? 5 : 4]);
          for (let X = cx - 3; X <= cx + 2; X++) P.set(X, cy + 8, HC[2]);
        }
      }
      if (L.hat === 'cap') {
        paint(
          P,
          new MK().ell(cx, cy - 3, rx + 0.7, 6.2, (X, Y) => Y < cy - 2),
          HC,
          { mod: (X, Y, t) => ((X === cx - 1 || X === cx) && Y < cy - 6 ? t - 1 : t) }
        );
        if (side) paint(P, new MK().ell(cx + rx + 1, cy - 2.6, 4.2, 1.3), HC);
        else if (front)
          paint(
            P,
            new MK().ell(cx, cy - 2.2, rx - 1, 1.5, (X, Y) => Y > cy - 3),
            HC,
            { base: 2 }
          );
      }
    };
    // ---- ordine di disegno
    if (side) {
      arm(0, true);
      cape();
      legs();
      robe();
      torso();
      dress();
      apron();
      neck();
      arm(0, false);
      head();
      face();
      beard();
      hair();
      ears();
      hat();
    } else if (back) {
      legs();
      robe();
      torso();
      dress();
      arm(-1);
      arm(1);
      neck();
      head();
      ears();
      hairBack();
      hair();
      cape();
      hat();
    } else {
      hairBack();
      cape(true);
      legs();
      robe();
      torso();
      dress();
      apron();
      cape();
      arm(-1);
      arm(1);
      neck();
      mantle();
      head();
      face();
      beard();
      hair();
      if (L.style !== 'long') ears();
      hat();
    }
    P.outline();
    return P;
  }
  return { MK, paint, frame, dk };
})();
heroFrame = GX.frame;

// =====================================================================
// EDIFICI — kit di pittura in pixel art (coordinate in pixel reali, 2× le unità di gioco)
// =====================================================================
const BK = (() => {
  const hh = (a, b) => {
    let n = (a | 0) * 374761393 + (b | 0) * 668265263;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return (n ^ (n >>> 16)) >>> 0;
  };
  const RPc = {};
  const R6 = h => RPc[h] || (RPc[h] = ramp6(h));
  const S = (P, X, Y, c) => P.set(X, Y, c);
  const F = (P, x, y, w, h, c) => {
    for (let Y = y; Y < y + h; Y++) for (let X = x; X < x + w; X++) P.set(X, Y, c);
  };
  const tc = (R, t) => R[clamp(t, 0, R.length - 1)];
  const dark = (P, x, y, w, h, k) => {
    const d = P.d;
    for (let Y = Math.max(0, y); Y < Math.min(P.h, y + h); Y++)
      for (let X = Math.max(0, x); X < Math.min(P.w, x + w); X++) {
        const i = (Y * P.w + X) * 4;
        if (!d[i + 3]) continue;
        d[i] *= k;
        d[i + 1] *= k;
        d[i + 2] *= k;
      }
  };
  const tint = (P, x, y, w, h, col, a) => {
    for (let Y = y; Y < y + h; Y++) for (let X = x; X < x + w; X++) if (P.has(X, Y)) P.set(X, Y, col, a);
  };
  // tetto a tegole visto di fronte. hwF(Y) = metà larghezza (centrato su cx) oppure inset classico
  function shingles(P, x0, y0, w, h, R, o = {}) {
    const rowH = o.rowH || 6,
      sw = o.sw || 8,
      ins = o.ins ?? 12,
      clip = o.clip;
    for (let Y = y0; Y < y0 + h; Y++) {
      const k = Y - y0,
        inset = Math.max(0, ins - k),
        row = Math.floor(k / rowH),
        inr = k % rowH;
      for (let X = x0 + inset; X < x0 + w - inset; X++) {
        if (clip && !clip(X, Y)) continue;
        const sx = X - x0 + (row % 2) * (sw >> 1) + 400,
          tile = Math.floor(sx / sw),
          inx = sx % sw,
          v = hh(tile, row) % 11;
        let t = 3;
        if (o.thatch) {
          t = 3;
          const s = hh(X, Math.floor(k / 3)) % 8;
          if (s === 0) t = 2;
          else if (s === 1) t = 4;
          if (inr === rowH - 1 && hh(X >> 1, row) % 3) t = 1;
          else if (inr === rowH - 2 && hh(X >> 1, row) % 3 === 0) t = 2;
          if (inr === 0 && hh(X, row) % 2) t = 4;
        } else {
          if (v === 0) t = 2;
          if (inr === 0) t += 1;
          if (inr === rowH - 1) t = 1;
          else if (inr === rowH - 2 && (inx === 0 || inx === sw - 1)) t = 1;
          else if (inx === 0) t -= 1;
        }
        const f = k / h;
        if (f > 0.72 && inr !== 0) t -= 1;
        if (X > x0 + w * 0.82) t -= 1;
        else if (X < x0 + w * 0.14 && inr !== rowH - 1) t += 0;
        if (X === x0 + inset || X === x0 + w - inset - 1) t = 1;
        S(P, X, Y, tc(R, t));
      }
    }
    // colmo
    if (!o.noRidge)
      for (let X = x0 + ins; X < x0 + w - ins; X++) {
        S(P, X, y0, tc(R, 4));
        S(P, X, y0 + 1, tc(R, X % 6 === 0 ? 1 : 3));
        S(P, X, y0 + 2, tc(R, 1));
      }
    // muschio
    if (o.moss)
      for (let i = 0; i < (w * h) / 90; i++) {
        const X = x0 + ins + (hh(i, 3) % (w - ins * 2)),
          Y = y0 + 4 + (hh(i, 5) % (h - 6));
        if (P.has(X, Y)) {
          S(P, X, Y, C('#5a7a34'));
          if (hh(i, 9) % 2) S(P, X + 1, Y, C('#4a6a2a'));
        }
      }
  }
  // grondaia + ombra sotto
  function eave(P, x, y, w, R) {
    F(P, x, y, w, 1, tc(R, 4));
    F(P, x, y + 1, w, 2, tc(R, 1));
    F(P, x, y + 3, w, 1, C('#2b1a10'));
  }
  function ao(P, x, y, w, n = 8) {
    for (let i = 0; i < n; i++) dark(P, x, y + i, w, 1, 0.62 + i * (0.38 / n));
  }
  // assi orizzontali
  function planks(P, x0, y0, w, h, R, o = {}) {
    const rowH = o.rowH || 8;
    for (let Y = y0; Y < y0 + h; Y++) {
      const k = Y - y0,
        row = Math.floor(k / rowH),
        inr = k % rowH,
        off = hh(row, 7) % 37;
      for (let X = x0; X < x0 + w; X++) {
        if (o.clip && !o.clip(X, Y)) continue;
        const sx = (X - x0 + off) % (o.seam || 46);
        let t = 3;
        if (inr === 0) t = 4;
        else if (inr === rowH - 1) t = 1;
        else if (inr === rowH - 2) t = 2;
        if (sx === 0) t = 1;
        else if (sx === 1 && inr < rowH - 2) t = 4;
        else if (inr > 0 && inr < rowH - 2 && hh(X >> 2, Y) % 23 === 0) t = 2;
        if ((sx === 3 || sx === (o.seam || 46) - 3) && inr === 2) t = 0;
        S(P, X, Y, tc(R, t));
      }
    }
  }
  // assi verticali (fienili)
  function boards(P, x0, y0, w, h, R, o = {}) {
    const bw = o.bw || 7;
    for (let Y = y0; Y < y0 + h; Y++)
      for (let X = x0; X < x0 + w; X++) {
        if (o.clip && !o.clip(X, Y)) continue;
        const k = X - x0,
          b = Math.floor(k / bw),
          inx = k % bw;
        let t = 3;
        if (inx === 0) t = 1;
        else if (inx === 1) t = 4;
        else if (inx === bw - 1) t = 2;
        else if (hh(X, Y >> 2) % 19 === 0) t = 2;
        if (hh(b, 9) % 4 === 0 && t === 3) t = 2;
        S(P, X, Y, tc(R, t));
      }
  }
  // muro di pietre irregolari
  function stones(P, x0, y0, w, h, R, o = {}) {
    let Y = y0,
      row = 0;
    while (Y < y0 + h) {
      const rh = (o.rh || 8) + (hh(row, 3) % 3);
      let X = x0 - (hh(row, 11) % 10);
      while (X < x0 + w) {
        const bw = (o.bw || 12) + (hh(X, row) % 7),
          v = hh(X * 3, row * 7) % 4,
          base = [2, 3, 3, 4][v];
        for (let yy = 0; yy < rh; yy++)
          for (let xx = 0; xx < bw; xx++) {
            const PX_ = X + xx,
              PY = Y + yy;
            if (PX_ < x0 || PX_ >= x0 + w || PY >= y0 + h) continue;
            if (o.clip && !o.clip(PX_, PY)) continue;
            let t = base;
            const corner = (xx === 0 || xx === bw - 1) && (yy === 0 || yy === rh - 1);
            if (yy === rh - 1 || xx === bw - 1 || corner) t = o.mortar ?? 1;
            else if (yy === 0 || xx === 0) t = base + 1;
            else if (yy === rh - 2 || xx === bw - 2) t = base - 1;
            if (o.shadeX) t += o.shadeX(PX_);
            S(P, PX_, PY, tc(R, t));
          }
        X += bw;
      }
      Y += rh;
      row++;
    }
    if (o.moss)
      for (let i = 0; i < w / 3; i++) {
        const X = x0 + (hh(i, 21) % w),
          Y = y0 + h - 1 - (hh(i, 23) % Math.min(h, 10));
        if (P.has(X, Y)) S(P, X, Y, C(hh(i, 2) % 2 ? '#5a7a34' : '#4a6a2a'));
      }
  }
  // intonaco
  function plaster(P, x0, y0, w, h, R, o = {}) {
    for (let Y = y0; Y < y0 + h; Y++)
      for (let X = x0; X < x0 + w; X++) {
        if (o.clip && !o.clip(X, Y)) continue;
        const v = hh(X, Y) % 61;
        let t = 3;
        if (v === 0) t = 2;
        else if (v === 1) t = 4;
        if (o.shadeX) t += o.shadeX(X);
        S(P, X, Y, tc(R, t));
      }
    // crepe e mattoni a vista
    for (let i = 0; i < (o.cracks ?? 2); i++) {
      let X = x0 + 8 + (hh(i, 31) % (w - 16)),
        Y = y0 + 6 + (hh(i, 37) % (h - 14));
      for (let k = 0; k < 6; k++) {
        if (P.has(X, Y)) S(P, X, Y, tc(R, 1));
        X += (hh(i, k) % 3) - 1;
        Y++;
      }
    }
    for (let i = 0; i < (o.bricks ?? 2); i++) {
      const bx = x0 + 6 + (hh(i, 41) % (w - 20)),
        by = y0 + h - 14 - (hh(i, 43) % Math.max(1, h - 24));
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 2; c++) {
          const X = bx + c * 6 + (r % 2) * 3,
            Y = by + r * 4;
          F(P, X, Y, 5, 3, C('#9a5a3e'));
          F(P, X, Y, 5, 1, C('#b8735a'));
          F(P, X + 4, Y, 1, 3, C('#6a3a28'));
        }
    }
  }
  // travi a vista
  function timber(P, x0, y0, w, h, R) {
    const beam = (x, y, ww, hh_) => {
      F(P, x, y, ww, hh_, tc(R, 2));
      F(P, x, y, ww, 1, tc(R, 3));
      F(P, x, y + hh_ - 1, ww, 1, tc(R, 1));
    };
    beam(x0, y0, w, 4);
    beam(x0, y0 + Math.floor(h * 0.48), w, 3);
    for (const X of [x0, x0 + w - 4]) {
      F(P, X, y0, 4, h, tc(R, 2));
      F(P, X, y0, 1, h, tc(R, 3));
      F(P, X + 3, y0, 1, h, tc(R, 1));
    }
  }
  // pietre d'angolo
  function quoins(P, x, y, h, R, right) {
    for (let Y = y, i = 0; Y < y + h; Y += 6, i++) {
      const w = i % 2 ? 6 : 9,
        X = right ? x - w + 1 : x;
      F(P, X, Y, w, 5, tc(R, right ? 2 : 4));
      F(P, X, Y, w, 1, tc(R, 5));
      F(P, X, Y + 5, w, 1, tc(R, 0));
    }
  }
  // finestra (vetro 20×20 in X,Y)
  function windowPX(P, X, Y, o = {}) {
    const T = R6(o.trim || '#e3cf9f'),
      gw = o.w || 20,
      gh = o.h || 20;
    if (o.shutter) {
      const SH = R6(o.shutter);
      for (const sx of [X - 11, X + gw + 3]) {
        F(P, sx, Y - 2, 8, gh + 4, tc(SH, 1));
        for (let yy = 0; yy < gh + 2; yy++)
          F(P, sx + 1, Y - 1 + yy, 6, 1, tc(SH, yy % 3 === 0 ? 2 : yy % 3 === 1 ? 4 : 3));
        F(P, sx + 1, Y + (gh >> 1), 6, 1, tc(SH, 1));
        S(P, sx + 5, Y + (gh >> 1) + 2, C('#2e2e34'));
      }
    }
    // architrave
    F(P, X - 4, Y - 6, gw + 8, 4, tc(T, 2));
    F(P, X - 4, Y - 6, gw + 8, 1, tc(T, 4));
    F(P, X - 4, Y - 3, gw + 8, 1, tc(T, 0));
    // cornice
    F(P, X - 2, Y - 2, gw + 4, gh + 4, tc(T, 1));
    F(P, X - 1, Y - 1, gw + 2, gh + 2, tc(T, 3));
    F(P, X - 1, Y - 1, gw + 2, 1, tc(T, 4));
    F(P, X + gw, Y - 1, 1, gh + 2, tc(T, 2));
    // vetro
    const g0 = C(o.glass || '#1c2840'),
      g1 = C(mix(o.glass || '#1c2840', '#53709a', 0.35)),
      g2 = C('#6c8ab0'),
      g3 = C('#a8c4e0');
    for (let yy = 0; yy < gh; yy++)
      for (let xx = 0; xx < gw; xx++) {
        let c = yy < gh * 0.35 ? g1 : g0;
        const d = (xx + yy) % 14;
        if (d === 0 || d === 1) c = g1;
        if (xx + yy === 6 || xx + yy === 7) c = g2;
        S(P, X + xx, Y + yy, c);
      }
    S(P, X + 1, Y + 1, g3);
    S(P, X + 2, Y + 1, g3);
    S(P, X + 1, Y + 2, g3);
    if (o.curtain) {
      const CU = R6(o.curtain);
      for (let yy = 0; yy < gh - 2; yy++) {
        const w2 = Math.max(1, 4 - Math.floor(yy / 5));
        F(P, X, Y + yy, w2, 1, tc(CU, yy % 2 ? 3 : 4));
        F(P, X + gw - w2, Y + yy, w2, 1, tc(CU, yy % 2 ? 2 : 3));
      }
    }
    // traverse
    const mx = X + (gw >> 1) - 1,
      my = Y + (gh >> 1) - 1;
    F(P, mx, Y, 2, gh, tc(T, 3));
    S(P, mx, Y, tc(T, 4));
    F(P, mx + 1, Y, 1, gh, tc(T, 2));
    F(P, X, my, gw, 2, tc(T, 3));
    F(P, X, my, gw, 1, tc(T, 4));
    // davanzale
    F(P, X - 3, Y + gh + 2, gw + 6, 2, tc(T, 4));
    F(P, X - 3, Y + gh + 4, gw + 6, 1, tc(T, 1));
    if (o.flowers !== false) {
      const B = R6('#6a4224');
      F(P, X - 2, Y + gh + 5, gw + 4, 5, tc(B, 3));
      F(P, X - 2, Y + gh + 5, gw + 4, 1, tc(B, 4));
      F(P, X - 2, Y + gh + 9, gw + 4, 1, tc(B, 1));
      for (let i = 0; i < gw + 4; i += 6) F(P, X - 2 + i, Y + gh + 6, 1, 3, tc(B, 2));
      const fl = ['#e8c23a', '#f4ecd8', '#c070c0', '#e86a4a', '#eab04a'];
      for (let i = 0; i < gw + 4; i += 2) {
        const lh = 2 + (hh(i, X) % 3);
        F(P, X - 2 + i, Y + gh + 5 - lh, 2, lh, C(hh(i, Y) % 2 ? '#3f6a24' : '#5a8a30'));
      }
      for (let i = 0; i < 6; i++) {
        const fx = X - 1 + (hh(i, X + Y) % (gw + 2)),
          fy = Y + gh + 1 + (hh(i, Y) % 3),
          fc = C(fl[hh(i, X * 3 + Y) % fl.length]);
        S(P, fx, fy, fc);
        S(P, fx + 1, fy, fc);
        S(P, fx, fy + 1, fc);
        S(P, fx + 1, fy + 1, C('#f8e070'));
      }
    }
  }
  // porta (24×32 in X,Y)
  function doorPX(P, X, Y, o = {}) {
    const D = R6(o.col || '#6a3a1c'),
      T = R6(o.trim || '#e3cf9f'),
      w = o.w || 24,
      h = o.h || 32;
    F(P, X - 4, Y - 6, w + 8, h + 6, tc(T, 1));
    F(P, X - 3, Y - 5, w + 6, h + 5, tc(T, 3));
    F(P, X - 3, Y - 5, w + 6, 1, tc(T, 4));
    F(P, X + w + 2, Y - 5, 1, h + 5, tc(T, 2));
    F(P, X - 1, Y - 1, w + 2, h + 1, C('#22140c'));
    for (let yy = 0; yy < h; yy++)
      for (let xx = 0; xx < w; xx++) {
        const p = xx % 6;
        let t = 3;
        if (p === 0) t = 1;
        else if (p === 1) t = 4;
        else if (p === 5) t = 2;
        else if (hh(xx + X, yy >> 2) % 13 === 0) t = 2;
        if (yy < 2) t = Math.min(t, 1);
        S(P, X + xx, Y + yy, tc(D, t));
      }
    if (o.win !== false) {
      F(P, X + (w >> 1) - 5, Y + 4, 10, 7, tc(D, 0));
      F(P, X + (w >> 1) - 4, Y + 5, 8, 5, C('#2a3c5a'));
      S(P, X + (w >> 1) - 3, Y + 5, C('#6c8ab0'));
      F(P, X + (w >> 1), Y + 5, 1, 5, tc(D, 1));
    }
    for (const sy of [Y + (o.win !== false ? 14 : 6), Y + h - 8]) {
      F(P, X, sy, w - 6, 2, C('#2e2e34'));
      for (let xx = 1; xx < w - 6; xx += 4) S(P, X + xx, sy, C('#6a6a76'));
    }
    F(P, X + w - 5, Y + (h >> 1) + 1, 3, 3, C('#a8802a'));
    S(P, X + w - 5, Y + (h >> 1) + 1, C('#fff0a0'));
    // gradino
    if (o.step !== false) {
      const SR = R6('#8a877d');
      F(P, X - 8, Y + h, w + 16, 4, tc(SR, 3));
      F(P, X - 8, Y + h, w + 16, 1, tc(SR, 5));
      F(P, X - 8, Y + h + 3, w + 16, 1, tc(SR, 1));
      for (let i = X - 8; i < X + w + 8; i += 9) S(P, i, Y + h + 1, tc(SR, 1));
    }
  }
  // comignolo
  function chimney(P, X, Y, h) {
    const B = R6('#9a5a40');
    for (let yy = 0; yy < h; yy++)
      for (let xx = 0; xx < 14; xx++) {
        const r = Math.floor(yy / 3),
          off = (r % 2) * 3,
          mort = yy % 3 === 2 || (xx + off) % 6 === 5;
        let t = mort ? 1 : xx < 3 ? 4 : xx > 10 ? 2 : 3;
        S(P, X + xx, Y + yy, tc(B, t));
      }
    const SR = R6('#6a6a6a');
    F(P, X - 2, Y - 4, 18, 4, tc(SR, 3));
    F(P, X - 2, Y - 4, 18, 1, tc(SR, 5));
    F(P, X - 2, Y - 1, 18, 1, tc(SR, 1));
    F(P, X + 3, Y - 6, 8, 2, tc(SR, 1));
  }
  // zoccolo di pietra
  function plinth(P, x0, y0, w, h) {
    const SR = R6('#7f7c72');
    stones(P, x0, y0, w, h, SR, { rh: h - 1, bw: 11, mortar: 0 });
  }
  return {
    hh,
    R6,
    S,
    F,
    tc,
    dark,
    tint,
    shingles,
    eave,
    ao,
    planks,
    boards,
    stones,
    plaster,
    timber,
    quoins,
    windowPX,
    doorPX,
    chimney,
    plinth
  };
})();

// ---------- case del villaggio (stesse misure, finestre e porte di prima) ----------
const VB = {
  house: {
    w: 6,
    h: 5,
    roofH: 44,
    wall: 'planks',
    wc: '#c79a62',
    roof: '#7f58a0',
    win: [
      [12, 52],
      [70, 52]
    ],
    door: 2,
    chimney: 1,
    shutter: '#4a6a3a',
    curtain: '#e8dcc0'
  },
  store: {
    w: 6,
    h: 5,
    roofH: 42,
    wall: 'planks',
    wc: '#d9c49a',
    roof: '#4c7c8c',
    win: [
      [10, 52],
      [70, 52]
    ],
    door: 3,
    shutter: '#2f5a6a',
    sign: 1,
    awning: '#b8402a'
  },
  elder: {
    w: 6,
    h: 5,
    roofH: 42,
    wall: 'stone',
    wc: '#6e6a64',
    roof: '#3a3944',
    win: [
      [10, 52],
      [70, 52]
    ],
    door: 3,
    chimney: 1,
    doorCol: '#2b2420',
    trim: '#9a968c',
    moss: 1
  },
  barn: {
    w: 4,
    h: 6,
    roofH: 46,
    wall: 'boards',
    wc: '#8a3026',
    roof: '#4a3a32',
    win: [],
    door: 2,
    doorCol: '#4a1a14',
    barn: 1
  },
  cottage: {
    w: 5,
    h: 4,
    roofH: 30,
    wall: 'plaster',
    wc: '#e6d3a6',
    roof: '#d9a23a',
    thatch: 1,
    win: [
      [8, 38],
      [58, 38]
    ],
    door: 2,
    shutter: '#7a8a4a',
    timber: '#5a3a22',
    curtain: '#d88a8a'
  },
  forge: {
    w: 5,
    h: 4,
    roofH: 30,
    wall: 'stone',
    wc: '#8a7a6a',
    roof: '#5a483c',
    win: [[8, 38]],
    door: 2,
    chimney: 1,
    forge: 1
  },
  // la casetta dei nuovi abitanti: una casa piccola come il cottage e la fucina (stesse misure)
  casetta: {
    w: 5,
    h: 4,
    roofH: 30,
    wall: 'plaster',
    wc: '#e8d8b8',
    roof: '#8a5a3a',
    win: [
      [8, 38],
      [58, 38]
    ],
    door: 2,
    chimney: 1,
    shutter: '#5a7a8a',
    curtain: '#e8dcc0'
  },
  chapel: {
    w: 7,
    h: 7,
    roofH: 50,
    extra: 22,
    wall: 'plaster',
    wc: '#e8e0cc',
    roof: '#585868',
    win: [
      [12, 96],
      [90, 96]
    ],
    door: 3,
    trim: '#f2ead6',
    chapel: 1,
    glass: '#3a2a5a'
  }
};
function genVillage(key) {
  const o = VB[key],
    B = BK,
    Wd = o.w * 16,
    Hd = o.h * 16 + (o.extra || 0),
    r0 = (o.extra || 0) * 2,
    rh = (o.roofH + (o.extra || 0)) * 2,
    PW = (Wd + 2) * 2,
    PH = Hd * 2,
    bx = 2;
  const P = new PX(PW, PH);
  srand(900 + Wd + rh);
  const WR = B.R6(o.wc),
    RR = B.R6(o.roof),
    wx0 = bx + 4,
    wx1 = bx + Wd * 2 - 4,
    ww = wx1 - wx0,
    wy0 = rh - 4,
    wy1 = PH - 10;
  const shadeX = X => (X > wx1 - 26 ? -1 : 0);
  // muro
  if (o.wall === 'planks') B.planks(P, wx0, wy0, ww, wy1 - wy0, WR, { rowH: 9 });
  else if (o.wall === 'boards') B.boards(P, wx0, wy0, ww, wy1 - wy0, WR, { bw: 8 });
  else if (o.wall === 'stone')
    B.stones(P, wx0, wy0, ww, wy1 - wy0, WR, { rh: 9, bw: 13, moss: o.moss, shadeX });
  else
    B.plaster(P, wx0, wy0, ww, wy1 - wy0, WR, { shadeX, cracks: o.chapel ? 3 : 2, bricks: o.chapel ? 1 : 2 });
  if (o.timber) B.timber(P, wx0, wy0 + 4, ww, wy1 - wy0 - 4, B.R6(o.timber));
  // pilastri d'angolo
  if (o.wall === 'planks' || o.wall === 'boards') {
    const PR = B.R6(shade(o.wc, -0.35));
    for (const X of [wx0, wx1 - 5]) {
      B.F(P, X, wy0, 5, wy1 - wy0, B.tc(PR, 3));
      B.F(P, X, wy0, 1, wy1 - wy0, B.tc(PR, 4));
      B.F(P, X + 4, wy0, 1, wy1 - wy0, B.tc(PR, 1));
    }
  } else if (o.wall === 'plaster' && !o.timber) {
    const QR = B.R6('#a8a296');
    B.quoins(P, wx0, wy0 + 6, wy1 - wy0 - 6, QR, false);
    B.quoins(P, wx1 - 1, wy0 + 6, wy1 - wy0 - 6, QR, true);
  }
  // lato in ombra
  for (let i = 0; i < 24; i++) B.dark(P, wx1 - 24 + i, wy0, 1, wy1 - wy0, 1 - i * 0.012);
  B.plinth(P, bx + 2, PH - 10, Wd * 2 - 4, 10);
  // finestre e porta
  const lights = [];
  for (const [wx, wy] of o.win) {
    B.windowPX(P, (1 + wx) * 2, wy * 2, {
      trim: o.trim,
      shutter: o.shutter,
      curtain: o.curtain,
      glass: o.glass,
      flowers: !o.chapel
    });
    lights.push([wx, wy, 10, 10]);
  }
  if (o.barn) {
    // portone a X
    const D = B.R6(o.doorCol),
      T = B.R6('#e8dcc0'),
      X = bx + 20 * 2,
      Y = rh + 16;
    B.F(P, X, Y, 48, PH - 10 - Y, B.tc(D, 2));
    B.boards(P, X + 2, Y + 2, 44, PH - 14 - Y, D, { bw: 6 });
    for (const [x, y, w, h] of [
      [X, Y, 48, 3],
      [X, Y, 3, PH - 10 - Y],
      [X + 45, Y, 3, PH - 10 - Y],
      [X, Y + ((PH - 10 - Y) >> 1), 48, 3]
    ]) {
      B.F(P, x, y, w, h, B.tc(T, 3));
      B.F(P, x, y, w, 1, B.tc(T, 5));
    }
    const ph = (PH - 10 - Y) >> 1;
    for (const y1 of [Y + 3, Y + ph + 3])
      for (let i = 0; i < ph - 3; i++) {
        const k = i / (ph - 3);
        for (const xa of [X + 3 + k * 39, X + 42 - k * 39])
          B.F(P, Math.round(xa), y1 + i, 3, 1, B.tc(T, i % 2 ? 3 : 4));
      }
  }
  if (o.door != null && !o.barn)
    B.doorPX(P, (bx / 2 + o.door * 16 + 2) * 2, (Hd - 21) * 2, { col: o.doorCol, trim: o.trim });
  if (o.awning) {
    const AR = B.R6(o.awning),
      WH = B.R6('#efe6d2');
    for (const [wx, wy] of o.win) {
      const X = (1 + wx) * 2 - 6,
        Y = wy * 2 - 14;
      for (let yy = 0; yy < 8; yy++)
        for (let xx = 0; xx < 32; xx++) {
          const st = Math.floor(xx / 4) % 2;
          let c = B.tc(st ? WH : AR, yy === 0 ? 4 : yy > 5 ? 2 : 3);
          B.S(P, X + xx, Y + yy, c);
        }
      for (let xx = 0; xx < 32; xx += 4) {
        B.S(P, X + xx + 1, Y + 8, B.tc(Math.floor(xx / 4) % 2 ? WH : AR, 2));
        B.S(P, X + xx + 2, Y + 8, B.tc(Math.floor(xx / 4) % 2 ? WH : AR, 2));
      }
    }
  }
  if (o.sign) {
    const W2 = B.R6('#6a4224'),
      G = B.R6('#e8c23a'),
      X = (bx / 2 + 30) * 2,
      Y = rh + 4;
    B.F(P, X, Y, 72, 18, B.tc(W2, 1));
    B.F(P, X + 2, Y + 2, 68, 14, B.tc(W2, 3));
    B.F(P, X + 2, Y + 2, 68, 1, B.tc(W2, 4));
    // un sacco e una bilancia stilizzati
    for (let i = 0; i < 6; i++) {
      const sx = X + 10 + i * 9;
      B.F(P, sx, Y + 6, 6, 6, B.tc(G, 3));
      B.F(P, sx, Y + 6, 6, 1, B.tc(G, 5));
      B.F(P, sx + 5, Y + 6, 1, 6, B.tc(G, 1));
    }
  }
  if (o.forge) {
    const X = (bx / 2 + 60) * 2,
      Y = 78;
    B.F(P, X - 3, Y - 3, 22, 18, C('#2a2420'));
    for (let yy = 0; yy < 12; yy++)
      for (let xx = 0; xx < 16; xx++) {
        const d = Math.hypot(xx - 8, yy - 9);
        B.S(P, X + xx, Y + yy, C(d < 3 ? '#fff0a0' : d < 6 ? '#ffb84a' : '#d8601e'));
      }
    // incudine come insegna
    const I = B.R6('#4a4a54');
    B.F(P, X - 2, Y - 16, 20, 4, B.tc(I, 3));
    B.F(P, X - 2, Y - 16, 20, 1, B.tc(I, 5));
    B.F(P, X + 4, Y - 12, 8, 4, B.tc(I, 2));
  }
  // grondaia e ombra
  B.ao(P, wx0, rh + 4, ww, 9);
  // tetto
  B.shingles(P, bx, r0, Wd * 2, rh - r0, RR, {
    rowH: o.thatch ? 7 : 6,
    sw: o.thatch ? 10 : 8,
    thatch: o.thatch,
    moss: o.moss || o.roof === '#4a3a32'
  });
  B.eave(P, bx, rh, Wd * 2, RR);
  if (o.barn) {
    const T = B.R6('#e8dcc0'),
      hx = bx + 26 * 2,
      hy = rh - 40;
    B.F(P, hx - 3, hy - 3, 30, 26, B.tc(T, 1));
    B.F(P, hx - 2, hy - 2, 28, 24, B.tc(T, 3));
    B.F(P, hx - 2, hy - 2, 28, 1, B.tc(T, 5));
    B.F(P, hx, hy, 24, 20, C('#1e120c'));
    for (let i = 0; i < 24; i++) {
      const h2 = 5 + (B.hh(i, 5) % 7);
      B.F(P, hx + i, hy + 20 - h2, 1, h2, C(B.hh(i, 7) % 3 ? '#d8b048' : '#b8902a'));
      if (B.hh(i, 9) % 3 === 0) B.S(P, hx + i, hy + 19 - h2, C('#f0d070'));
    }
    B.F(P, hx + 11, hy - 10, 2, 8, C('#3e3e46'));
    B.F(P, hx + 8, hy - 11, 8, 2, C('#5a5a64'));
  }
  let chim = null;
  if (o.chimney) {
    const chx = (bx / 2 + Wd - 22) * 2;
    B.chimney(P, chx, r0 + 6, 22);
    chim = [bx / 2 + Wd - 22 + 3, o.extra || 0];
  }
  if (o.chapel) {
    const cx = bx + Wd,
      TW = B.R6('#e8e0cc'),
      SR = B.R6('#4a4a58'),
      G = B.R6('#e8c23a');
    // torre
    B.plaster(P, cx - 22, 16, 44, 96, TW, { cracks: 1, bricks: 0, shadeX: X => (X > cx + 14 ? -1 : 0) });
    B.quoins(P, cx - 22, 20, 90, B.R6('#b8b2a4'), false);
    B.quoins(P, cx + 21, 20, 90, B.R6('#b8b2a4'), true);
    // cella campanaria
    B.F(P, cx - 13, 30, 26, 30, C('#14141c'));
    B.F(P, cx - 13, 30, 26, 2, B.tc(TW, 1));
    for (let yy = 0; yy < 14; yy++) {
      const w2 = Math.round(Math.sqrt(Math.max(0, 49 - (yy - 6) * (yy - 6) * 0.6)) * 1.1);
      B.F(P, cx - w2, 38 + yy, w2 * 2, 1, B.tc(G, yy < 3 ? 5 : yy < 9 ? 3 : 2));
    }
    B.F(P, cx - 1, 52, 2, 4, B.tc(G, 1));
    for (let yy = 30; yy < 60; yy += 5) B.F(P, cx - 13, yy, 26, 1, C('#2a2a34'));
    // guglia
    for (let yy = 0; yy < 18; yy++) {
      const hw = 4 + yy * 1.5;
      for (let X = Math.round(cx - hw); X < Math.round(cx + hw); X++) {
        const k = yy % 4;
        let t = k === 3 ? 1 : X < cx ? 4 : 2;
        if (k === 0) t++;
        B.S(P, X, yy + 2, B.tc(SR, t));
      }
    }
    B.F(P, cx - 30, 19, 60, 2, B.tc(SR, 1));
    B.F(P, cx - 1, 0, 2, 4, B.tc(G, 4));
    // rosone
    const ry = 136;
    for (let yy = -16; yy <= 16; yy++)
      for (let xx = -16; xx <= 16; xx++) {
        const d = Math.hypot(xx, yy);
        if (d > 16) continue;
        const a = Math.atan2(yy, xx);
        let c;
        if (d > 14) c = B.tc(B.R6('#5a3b22'), 2);
        else if (d < 4) c = C('#e8c23a');
        else {
          const seg = Math.floor((a + Math.PI) / (Math.PI / 4));
          c = C(['#c0303a', '#2a5aa8', '#e8c23a', '#3a8a4a'][seg % 4]);
          if (Math.abs(((a + Math.PI) % (Math.PI / 4)) - Math.PI / 8) > Math.PI / 9 || d % 5 < 1)
            c = C('#2a1a10');
        }
        B.S(P, cx + xx, ry + yy, c);
      }
  }
  P.outline();
  const c = pxCanvas(P);
  c.lights = lights;
  if (chim) c.chim = chim;
  return c;
}
{
  const _go = genObjects;
  genObjects = function () {
    _go();
    try {
      for (const k in VB) IMG[k] = genVillage(k);
    } catch (e) {
      console.error(e);
    }
  };
}

// ---------- costruzioni della Valle (stesse misure di prima) ----------
const GB = (w, h, fn) => {
  const P = new PX(w * 2, h * 2);
  srand(w * 31 + h);
  fn(P, BK);
  P.outline();
  return pxCanvas(P);
};
// riempie una forma con colonne (cx,hw(Y)) restituendo una clip
const clipBand = (cx, hwF) => (X, Y) => Math.abs(X + 0.5 - cx) <= hwF(Y);
const ART2 = {
  pollaio: () =>
    GB(48, 34, (P, B) => {
      const W = B.R6('#a0703e'),
        RF = B.R6('#8a3a2a'),
        D = B.R6('#5a3a1e');
      // zampe
      for (const X of [12, 28, 64, 80]) {
        B.F(P, X, 52, 5, 14, B.tc(D, 2));
        B.F(P, X, 52, 1, 14, B.tc(D, 4));
      }
      // corpo ad assi
      B.boards(P, 8, 24, 80, 32, W, { bw: 7 });
      B.F(P, 8, 54, 80, 3, B.tc(D, 1));
      for (const X of [8, 83]) {
        B.F(P, X, 24, 5, 32, B.tc(D, 3));
        B.F(P, X, 24, 1, 32, B.tc(D, 4));
        B.F(P, X + 4, 24, 1, 32, B.tc(D, 1));
      }
      B.ao(P, 8, 24, 80, 6);
      // finestrelle
      for (const X of [16, 66]) {
        B.F(P, X - 2, 31, 16, 14, B.tc(D, 1));
        B.F(P, X, 33, 12, 10, C('#1e1410'));
        B.F(P, X + 5, 33, 2, 10, B.tc(D, 3));
        B.F(P, X, 37, 12, 2, B.tc(D, 3));
        B.S(P, X + 1, 34, C('#6a5a4a'));
      }
      // porticina ad arco col fieno
      for (let yy = 0; yy < 18; yy++) {
        const hw = yy < 5 ? Math.round(Math.sqrt(25 - (5 - yy) * (5 - yy)) * 1.6) : 8;
        B.F(P, 48 - hw - 2, 36 + yy, hw * 2 + 4, 1, B.tc(D, 1));
        B.F(P, 48 - hw, 36 + yy, hw * 2, 1, C(yy > 12 ? '#c8a040' : '#1a100a'));
      }
      for (let i = 0; i < 16; i++) {
        const h2 = 2 + (B.hh(i, 3) % 4);
        B.F(P, 40 + i, 54 - h2, 1, h2, C(B.hh(i, 5) % 2 ? '#d8b048' : '#b8902a'));
      }
      // rampa
      for (let i = 0; i < 20; i++) {
        const X = 56 + i,
          Y = 54 + Math.round(i * 0.55);
        B.F(P, X, Y, 1, 4, B.tc(D, i % 5 === 0 ? 1 : 3));
        B.S(P, X, Y, B.tc(D, 4));
      }
      // tetto a capanna
      B.shingles(P, 0, 2, 96, 24, RF, {
        rowH: 5,
        sw: 7,
        ins: 0,
        clip: clipBand(48, Y => 14 + (Y - 2) * 1.45),
        noRidge: 1
      });
      for (let Y = 2; Y < 26; Y++) {
        const hw = Math.round(14 + (Y - 2) * 1.45);
        B.S(P, 48 - hw, Y, B.tc(RF, 1));
        B.S(P, 47 + hw, Y, B.tc(RF, 1));
      }
      B.F(P, 34, 1, 28, 3, B.tc(RF, 4));
      B.eave(P, 2, 24, 92, RF);
      // banderuola a gallo
      B.F(P, 47, -2, 2, 4, C('#3e3e46'));
    }),
  stalla: () =>
    GB(64, 48, (P, B) => {
      const W = B.R6('#9a3a28'),
        RF = B.R6('#4e3e36'),
        T = B.R6('#e8dcc0'),
        D = B.R6('#4a1a14');
      B.boards(P, 6, 34, 116, 52, W, { bw: 8 });
      for (const X of [6, 117]) {
        B.F(P, X, 34, 5, 52, B.tc(T, 3));
        B.F(P, X, 34, 1, 52, B.tc(T, 5));
        B.F(P, X + 4, 34, 1, 52, B.tc(T, 1));
      }
      for (let i = 0; i < 20; i++) B.dark(P, 102 + i, 34, 1, 52, 1 - i * 0.012);
      B.plinth(P, 4, 86, 120, 10);
      // portone a X
      const X = 42,
        Y = 48,
        w = 44,
        h = 38;
      B.F(P, X, Y, w, h, B.tc(D, 2));
      B.boards(P, X + 2, Y + 2, w - 4, h - 2, D, { bw: 6 });
      for (const [x, y, ww, hh] of [
        [X, Y, w, 3],
        [X, Y, 3, h],
        [X + w - 3, Y, 3, h],
        [X + (w >> 1) - 1, Y, 2, h]
      ]) {
        B.F(P, x, y, ww, hh, B.tc(T, 3));
        B.F(P, x, y, ww, 1, B.tc(T, 5));
      }
      for (const [x0, x1] of [
        [X + 3, X + (w >> 1) - 1],
        [X + (w >> 1) + 1, X + w - 3]
      ])
        for (let i = 0; i < h - 3; i++) {
          const k = i / (h - 3);
          for (const xa of [x0 + k * (x1 - x0 - 3), x1 - 3 - k * (x1 - x0 - 3)])
            B.F(P, Math.round(xa), Y + 3 + i, 3, 1, B.tc(T, i % 2 ? 3 : 4));
        }
      // finestre
      for (const wx of [16, 96]) B.windowPX(P, wx, 52, { trim: '#e8dcc0', flowers: false, w: 16, h: 14 });
      B.ao(P, 6, 36, 116, 8);
      // tetto a mansarda
      const hw = Y => (Y < 18 ? 30 + (Y - 2) * 2 : Math.min(64, 62 + (Y - 18) * 0.2));
      B.shingles(P, 0, 2, 128, 34, RF, {
        rowH: 6,
        sw: 8,
        ins: 0,
        clip: clipBand(64, hw),
        noRidge: 1,
        moss: 1
      });
      for (let Y = 2; Y < 36; Y++) {
        const h2 = Math.round(hw(Y));
        B.S(P, 64 - h2, Y, B.tc(RF, 1));
        B.S(P, 63 + h2, Y, B.tc(RF, 1));
        if (Y === 18) B.F(P, 64 - h2, Y, h2 * 2, 1, B.tc(RF, 1));
      }
      B.F(P, 34, 2, 60, 2, B.tc(RF, 4));
      B.eave(P, 2, 34, 124, RF);
      // botola del fieno
      const hx = 52,
        hy = 10;
      B.F(P, hx - 3, hy - 3, 30, 24, B.tc(T, 3));
      B.F(P, hx - 3, hy - 3, 30, 1, B.tc(T, 5));
      B.F(P, hx, hy, 24, 18, C('#1e120c'));
      for (let i = 0; i < 24; i++) {
        const h2 = 5 + (B.hh(i, 5) % 7);
        B.F(P, hx + i, hy + 18 - h2, 1, h2, C(B.hh(i, 7) % 3 ? '#d8b048' : '#b8902a'));
      }
    }),
  serra: () =>
    GB(64, 44, (P, B) => {
      const FR = B.R6('#eef2ea'),
        BR = B.R6('#9a5a3e'),
        G0 = C('#9fd0d8'),
        G1 = C('#c4e8ec'),
        G2 = C('#e8f8f8'),
        GD = C('#78aab8');
      // base di mattoni
      for (let Y = 76; Y < 88; Y++)
        for (let X = 4; X < 124; X++) {
          const r = Math.floor((Y - 76) / 4),
            mort = (Y - 76) % 4 === 3 || (X + (r % 2) * 4) % 8 === 7;
          B.S(P, X, Y, B.tc(BR, mort ? 1 : Y % 4 === 0 ? 4 : 3));
        }
      // vetrate con piante dentro
      for (let Y = 40; Y < 76; Y++)
        for (let X = 6; X < 122; X++) {
          let c = (X + Y) % 22 < 3 ? G1 : G0;
          if ((X - Y + 200) % 40 < 2) c = G2;
          if (Y > 66) c = GD;
          B.S(P, X, Y, c);
        }
      for (let i = 0; i < 14; i++) {
        const cx = 12 + i * 8 + (B.hh(i, 1) % 4),
          cy = 64 + (B.hh(i, 2) % 6),
          r = 4 + (B.hh(i, 3) % 3);
        for (let yy = -r; yy <= r; yy++)
          for (let xx = -r; xx <= r; xx++) {
            if (xx * xx + yy * yy > r * r) continue;
            const t = xx + yy < -2 ? '#7ac04a' : xx + yy > 2 ? '#3a7a2a' : '#5a9a3a';
            B.S(P, cx + xx, cy + yy, C(t));
          }
        if (B.hh(i, 4) % 2) {
          B.S(P, cx + 1, cy - 1, C('#e0402a'));
          B.S(P, cx - 2, cy + 1, C('#e0402a'));
        }
      }
      // telaio
      for (let X = 6; X <= 120; X += 16) {
        B.F(P, X, 40, 2, 36, B.tc(FR, 3));
        B.S(P, X, 40, B.tc(FR, 5));
      }
      B.F(P, 6, 40, 116, 2, B.tc(FR, 4));
      B.F(P, 6, 56, 116, 2, B.tc(FR, 3));
      B.F(P, 6, 74, 116, 2, B.tc(FR, 2));
      // porta
      B.F(P, 54, 50, 20, 26, B.tc(FR, 3));
      for (let Y = 52; Y < 74; Y++) for (let X = 56; X < 72; X++) B.S(P, X, Y, (X + Y) % 12 < 2 ? G2 : G1);
      B.F(P, 63, 52, 2, 22, B.tc(FR, 3));
      B.S(P, 69, 63, C('#c8a03a'));
      // tetto di vetro
      const hw = Y => 14 + (Y - 4) * 1.3;
      for (let Y = 4; Y < 40; Y++) {
        const h2 = hw(Y);
        for (let X = Math.round(64 - h2); X < Math.round(64 + h2); X++) {
          let c = (X * 2 + Y) % 26 < 4 ? G2 : Y < 20 ? G1 : G0;
          if (X > 64 + h2 - 8) c = GD;
          B.S(P, X, Y, c);
        }
      }
      for (let X = 8; X <= 120; X += 12)
        for (let Y = 4; Y < 40; Y++) {
          if (Math.abs(X - 64) < hw(Y) - 1) B.S(P, X, Y, B.tc(FR, X > 100 ? 2 : 3));
        }
      for (const Y of [16, 28])
        for (let X = Math.round(64 - hw(Y)); X < 64 + hw(Y); X++) B.S(P, X, Y, B.tc(FR, 3));
      B.F(P, 46, 3, 36, 2, B.tc(FR, 5));
      B.F(P, 2, 38, 124, 3, B.tc(FR, 3));
      B.F(P, 2, 38, 124, 1, B.tc(FR, 5));
    }),
  // il mulino a vento: una torre di pietra alta come il fienile del paese (64×96), tetto conico, porta ad arco.
  // Le pale girano: le disegna PALE a ogni fotogramma, alla stessa scala (MULINO_PALE dice dove stanno)
  mulino: () =>
    GB(64, 96, (P, B) => {
      const ST = B.R6('#9a968a'),
        RF = B.R6('#6a3a2a'),
        WD = B.R6('#8a5a32'),
        CX = 64,
        hwT = Y => 22 + (Y - 70) * 0.12;
      B.stones(P, CX - 38, 70, 76, 116, ST, {
        rh: 8,
        bw: 12,
        clip: clipBand(CX, hwT),
        shadeX: X => {
          const n = (X + 0.5 - CX) / 30;
          return n < -0.6 ? 1 : n > 0.75 ? -2 : n > 0.35 ? -1 : 0;
        },
        moss: 1
      });
      B.F(P, CX - 38, 184, 76, 4, B.tc(ST, 1));
      // due finestrelle una sopra l'altra
      for (const y of [96, 126]) {
        B.F(P, CX - 5, y, 10, 14, B.tc(WD, 1));
        B.F(P, CX - 4, y + 1, 8, 12, C('#1e1410'));
        B.F(P, CX - 1, y + 1, 2, 12, B.tc(WD, 3));
      }
      // porta ad arco, alta come quelle delle case del paese
      for (let yy = 0; yy < 36; yy++) {
        const hw = yy < 6 ? Math.round(Math.sqrt(36 - (6 - yy) * (6 - yy)) * 1.4) : 9;
        B.F(P, CX - hw - 1, 150 + yy, hw * 2 + 2, 1, B.tc(ST, 1));
        if (yy > 0)
          for (let xx = -hw + 1; xx < hw - 1; xx++)
            B.S(P, CX + xx, 150 + yy, B.tc(WD, (xx + 40) % 5 === 0 ? 1 : xx < 0 ? 3 : 2));
      }
      // tetto conico
      for (let Y = 30; Y < 74; Y++) {
        const h2 = 5 + (Y - 30) * 0.8;
        for (let X = Math.round(CX - h2); X < Math.round(CX + h2); X++) {
          const n = (X + 0.5 - CX) / h2;
          let t = (Y - 30) % 5 === 4 ? 1 : 3;
          if (n < -0.4) t++;
          if (n > 0.4) t--;
          if (n > 0.8) t--;
          B.S(P, X, Y, B.tc(RF, t));
        }
      }
      B.F(P, CX - 40, 72, 80, 4, B.tc(RF, 1));
    }),
  _x: () => null
};
const MULINO_PALE = { cx: 64, hy: 62, L: 58 };
function mulinoPale(P, B, off, { cx, hy, L } = MULINO_PALE) {
  const WD = B.R6('#8a5a32'),
    CL = B.R6('#e8e0d0'),
    tela0 = L * 0.28,
    tela1 = L * 0.94,
    larga = L * 0.25;
  for (const a of [0, 1, 2, 3]) {
    const t = (a * Math.PI) / 2 + off,
      ca = Math.cos(t),
      sa = Math.sin(t);
    for (let Y = Math.max(0, Math.floor(hy - L)); Y < Math.min(P.h, hy + L); Y++)
      for (let X = Math.max(0, Math.floor(cx - L)); X < Math.min(P.w, cx + L); X++) {
        const dx = X + 0.5 - cx,
          dy = Y + 0.5 - hy,
          r = dx * ca + dy * sa,
          q = -dx * sa + dy * ca;
        if (r >= 0 && r < L && Math.abs(q) < 1.3) {
          B.S(P, X, Y, B.tc(WD, q < 0 ? 4 : 2));
          continue;
        }
        if (r < tela0 || r >= tela1 || q < 1.3 || q >= larga) continue;
        const lat = Math.floor(r) % 5 === 0 || q >= larga - 1;
        B.S(P, X, Y, lat ? B.tc(WD, 2) : B.tc(CL, q < larga * 0.45 ? 4 : 3));
      }
  }
  const hr = Math.round(L * 0.11);
  for (let yy = -hr; yy <= hr; yy++)
    for (let xx = -hr; xx <= hr; xx++)
      if (xx * xx + yy * yy <= hr * hr) B.S(P, cx + xx, hy + yy, B.tc(WD, xx + yy < 0 ? 4 : 2));
  B.S(P, cx, hy, C('#2e2e34'));
}
Object.assign(ART2, {
  silos: () =>
    GB(32, 56, (P, B) => {
      const M = B.R6('#b8483a'),
        G = B.R6('#a8acb4'),
        I = B.R6('#4a4a54');
      for (let Y = 16; Y < 108; Y++)
        for (let X = 8; X < 56; X++) {
          const n = (X + 0.5 - 32) / 24;
          let t = 3;
          if (n < -0.75) t = 4;
          else if (n < -0.4) t = 4;
          if (n > 0.45) t = 2;
          if (n > 0.8) t = 1;
          const r = (Y - 16) % 6;
          if (r === 0) t++;
          else if (r === 5) t--;
          if ((Y - 16) % 30 < 2) t = 1;
          B.S(P, X, Y, B.tc(M, t));
        }
      // fascia bianca
      for (let Y = 40; Y < 46; Y++)
        for (let X = 8; X < 56; X++) {
          const n = (X + 0.5 - 32) / 24;
          B.S(P, X, Y, C(n > 0.5 ? '#c8c0b0' : '#efe6d2'));
        }
      // cupola
      for (let Y = 0; Y < 18; Y++) {
        const h2 = Math.min(24, 6 + Math.sqrt(Y / 18) * 18);
        for (let X = Math.round(32 - h2); X < Math.round(32 + h2); X++) {
          const n = (X + 0.5 - 32) / h2;
          let t = 3;
          if (n < -0.3) t = 5;
          else if (n < 0) t = 4;
          if (n > 0.5) t = 2;
          if ((X - 32 + 40) % 8 === 0 && Y > 3) t--;
          B.S(P, X, Y, B.tc(G, t));
        }
      }
      B.F(P, 6, 16, 52, 3, B.tc(G, 1));
      B.F(P, 28, 0, 8, 3, B.tc(G, 2));
      B.F(P, 26, -1, 12, 2, B.tc(G, 4));
      // scala
      for (let Y = 20; Y < 104; Y++) {
        B.S(P, 46, Y, B.tc(I, 3));
        B.S(P, 51, Y, B.tc(I, 2));
        if (Y % 5 === 0) B.F(P, 46, Y, 6, 1, B.tc(I, 4));
      }
      // portello
      B.F(P, 24, 78, 16, 30, B.tc(I, 1));
      B.F(P, 26, 80, 12, 28, B.tc(B.R6('#5a3a1e'), 3));
      for (let Y = 80; Y < 108; Y += 4) B.F(P, 26, Y, 12, 1, B.tc(B.R6('#5a3a1e'), 2));
      B.S(P, 35, 94, C('#c8a03a'));
      B.F(P, 6, 106, 52, 4, B.tc(B.R6('#7f7c72'), 3));
      B.F(P, 6, 106, 52, 1, B.tc(B.R6('#7f7c72'), 5));
    }),
  pozzogrande: () =>
    GB(32, 36, (P, B) => {
      const ST = B.R6('#8a877d'),
        WD = B.R6('#7a5030'),
        RF = B.R6('#6a3a2a');
      B.stones(P, 4, 40, 56, 30, ST, {
        rh: 7,
        bw: 10,
        clip: (X, Y) => Math.abs(X + 0.5 - 32) <= 28,
        shadeX: X => (X > 50 ? -1 : X < 12 ? 1 : 0),
        moss: 1
      });
      // bordo e acqua
      for (let yy = -8; yy <= 8; yy++)
        for (let xx = -29; xx <= 29; xx++) {
          const a = xx / 29,
            b = yy / 8,
            d = a * a + b * b;
          if (d > 1) continue;
          const a2 = xx / 22,
            b2 = yy / 5.5,
            d2 = a2 * a2 + b2 * b2;
          let c;
          if (d2 < 1) {
            c = C(d2 < 0.3 ? '#5a90c0' : '#3a6a9a');
            if ((xx * 2 + yy * 5 + 60) % 17 === 0) c = C('#a8d0f0');
          } else c = B.tc(ST, yy < 0 ? 4 : 2);
          B.S(P, 32 + xx, 40 + yy, c);
        }
      // pali e tettoia
      for (const X of [6, 54]) {
        B.F(P, X, 6, 5, 36, B.tc(WD, 3));
        B.F(P, X, 6, 1, 36, B.tc(WD, 4));
        B.F(P, X + 4, 6, 1, 36, B.tc(WD, 1));
      }
      B.F(P, 6, 9, 52, 3, B.tc(WD, 3));
      B.F(P, 6, 9, 52, 1, B.tc(WD, 4));
      B.F(P, 31, 12, 1, 12, C('#c9a060'));
      B.F(P, 27, 24, 10, 8, B.tc(WD, 2));
      B.F(P, 27, 24, 10, 1, B.tc(WD, 4));
      B.F(P, 27, 27, 10, 1, C('#3e3e46'));
      B.shingles(P, 0, 0, 64, 10, RF, {
        rowH: 4,
        sw: 6,
        ins: 0,
        clip: clipBand(32, Y => 10 + Y * 2.2),
        noRidge: 1
      });
    }),
  // la casetta è una casa del paese: si disegna una volta sola, con le altre (IMG), e si riusa
  casetta: () => IMG.casetta || (IMG.casetta = genVillage('casetta')),
  // il museo: un tempietto neoclassico più grande delle case (112×84), sei colonne, frontone con lo stemma
  museo: () =>
    GB(112, 84, (P, B) => {
      const ST = B.R6('#a8a294'),
        MB = B.R6('#ece4d4'),
        RF = B.R6('#3a4a6a'),
        G = B.R6('#d8b04a'),
        LG = B.R6('#4a2a14'),
        CX = 112;
      // corpo in pietra con le ali un po' più basse
      B.stones(P, 10, 92, 46, 64, ST, { rh: 8, bw: 16 });
      B.stones(P, 168, 92, 46, 64, ST, { rh: 8, bw: 16, shadeX: () => -1 });
      B.stones(P, 40, 70, 144, 86, ST, { rh: 8, bw: 18, shadeX: X => (X > 170 ? -1 : 0) });
      // cornicione delle ali
      for (const x of [6, 164]) {
        B.F(P, x, 86, 54, 6, B.tc(MB, 3));
        B.F(P, x, 86, 54, 1, B.tc(MB, 5));
        B.F(P, x, 91, 54, 1, B.tc(MB, 1));
        B.F(P, x, 80, 54, 6, B.tc(RF, x < 100 ? 3 : 2));
        B.F(P, x, 80, 54, 1, B.tc(RF, 4));
      }
      // finestre ad arco nelle ali (luce calda dentro)
      const finestra = (x, y, w, h) => {
        B.F(P, x - 2, y - 2, w + 4, h + 4, B.tc(MB, 2));
        for (let Y = 0; Y < h; Y++)
          for (let X = 0; X < w; X++) {
            const dx = X + 0.5 - w / 2,
              arco = Y < w / 2 && dx * dx + (Y - w / 2) * (Y - w / 2) > (w / 2) * (w / 2);
            if (arco) continue;
            B.S(P, x + X, y + Y, C(Y < h * 0.3 ? '#fff4c0' : Y < h * 0.7 ? '#ffe08a' : '#f0c060'));
          }
        B.F(P, x + w / 2 - 1, y + 2, 2, h - 2, B.tc(MB, 3));
        B.F(P, x, y + Math.round(h * 0.55), w, 1, B.tc(MB, 3));
        B.F(P, x - 4, y + h + 2, w + 8, 3, B.tc(MB, 4));
      };
      finestra(24, 104, 18, 30);
      finestra(182, 104, 18, 30);
      // trabeazione con la scritta
      B.F(P, 30, 56, 164, 14, B.tc(MB, 3));
      B.F(P, 30, 56, 164, 1, B.tc(MB, 5));
      B.F(P, 30, 69, 164, 1, B.tc(MB, 1));
      for (let X = 34; X < 190; X += 8) B.F(P, X, 66, 4, 2, B.tc(MB, 2));
      // MVSEO in lettere d'oro (pixel)
      const L = {
        M: ['10001', '11011', '10101', '10001', '10001'],
        V: ['10001', '10001', '10001', '01010', '00100'],
        S: ['01111', '10000', '01110', '00001', '11110'],
        E: ['11111', '10000', '11110', '10000', '11111'],
        O: ['01110', '10001', '10001', '10001', '01110']
      };
      'MVSEO'.split('').forEach((ch, i) =>
        L[ch].forEach((r, y) =>
          [...r].forEach((v, x) => {
            if (v === '1') B.S(P, CX - 17 + i * 7 + x, 58 + y, B.tc(G, y < 2 ? 5 : 3));
          })
        )
      );
      // frontone
      for (let Y = 14; Y < 56; Y++) {
        const h2 = Math.round(10 + (Y - 14) * 2.2);
        for (let X = CX - h2; X < CX + h2; X++) {
          const edge = Math.abs(X + 0.5 - CX) > h2 - 6;
          B.S(
            P,
            X,
            Y,
            edge ? B.tc(RF, (Y + X) % 4 === 0 ? 1 : X < CX ? 4 : 2) : B.tc(MB, X > CX + h2 * 0.5 ? 2 : 3)
          );
        }
      }
      B.F(P, 18, 54, 188, 3, B.tc(RF, 1));
      // stemma nel timpano: scudo d'oro con un libro
      for (let yy = -9; yy <= 9; yy++)
        for (let xx = -8; xx <= 8; xx++) {
          const inside = yy < 2 ? Math.abs(xx) <= 8 : Math.abs(xx) <= 8 - (yy - 2) * 1.1;
          if (!inside) continue;
          const bordo = Math.abs(xx) >= 7 || yy <= -8 || (yy > 2 && Math.abs(xx) >= 7 - (yy - 2) * 1.1);
          B.S(P, CX + xx, 38 + yy, B.tc(G, bordo ? 1 : xx + yy < 0 ? 5 : 3));
        }
      B.F(P, CX - 5, 35, 10, 6, B.tc(MB, 4));
      B.F(P, CX, 35, 1, 6, B.tc(LG, 2));
      B.F(P, CX - 2, 10, 4, 5, B.tc(G, 4));
      for (const x of [22, 202]) B.F(P, x - 3, 48, 6, 6, B.tc(G, 3));
      // portone
      B.F(P, CX - 16, 96, 32, 58, B.tc(MB, 1));
      for (let Y = 0; Y < 54; Y++)
        for (let X = 0; X < 26; X++) {
          const dx = X + 0.5 - 13;
          if (Y < 13 && dx * dx + (Y - 13) * (Y - 13) > 169) continue;
          B.S(P, CX - 13 + X, 100 + Y, B.tc(LG, X % 6 === 0 ? 1 : X < 13 ? 2 : 3));
        }
      B.F(P, CX - 1, 112, 2, 42, B.tc(LG, 1));
      B.S(P, CX - 4, 132, B.tc(G, 5));
      B.S(P, CX + 3, 132, B.tc(G, 5));
      // colonne scanalate
      for (const x of [48, 70, 92, 132, 154, 176]) {
        for (let Y = 74; Y < 150; Y++)
          for (let X = x - 5; X < x + 5; X++) {
            const k = X - (x - 5);
            let t = k < 2 ? 4 : k > 7 ? 2 : 3;
            if (k === 3 || k === 6) t--;
            B.S(P, X, Y, B.tc(MB, t));
          }
        B.F(P, x - 7, 70, 14, 4, B.tc(MB, 4));
        B.F(P, x - 7, 73, 14, 1, B.tc(MB, 2));
        B.F(P, x - 7, 148, 14, 4, B.tc(MB, 3));
        B.F(P, x - 7, 151, 14, 1, B.tc(MB, 1));
        // ombra della colonna sul muro
        B.F(P, x + 5, 76, 3, 72, B.tc(ST, 0));
      }
      // stendardi rossi tra le colonne
      for (const x of [81, 143]) {
        B.F(P, x - 5, 80, 10, 26, C('#8a2a2a'));
        B.F(P, x - 5, 80, 10, 2, B.tc(G, 4));
        B.F(P, x - 1, 86, 2, 12, B.tc(G, 3));
        B.S(P, x - 5, 106, C('#8a2a2a'));
        B.S(P, x + 4, 106, C('#8a2a2a'));
        B.F(P, x - 3, 106, 6, 2, C('#6a1a1a'));
      }
      // scalinata larga
      for (let i = 0; i < 4; i++) {
        const y = 152 + i * 4,
          x0 = 34 - i * 6;
        B.F(P, x0, y, 224 - x0 * 2, 4, B.tc(MB, i % 2 ? 3 : 4));
        B.F(P, x0, y, 224 - x0 * 2, 1, B.tc(MB, 5));
        B.F(P, x0, y + 3, 224 - x0 * 2, 1, B.tc(MB, 1));
      }
      // vasi con l'alloro ai lati della scala
      for (const x of [20, 204]) {
        B.F(P, x - 6, 146, 12, 10, B.tc(ST, 2));
        B.F(P, x - 7, 146, 14, 2, B.tc(ST, 4));
        for (let yy = 0; yy < 12; yy++)
          for (let xx = -7; xx <= 7; xx++)
            if (xx * xx + (yy - 6) * (yy - 6) * 1.4 < 50)
              B.S(P, x + xx, 132 + yy, C((xx + yy) % 3 ? '#3f7a2a' : '#5a9a3a'));
      }
    })
});
{
  const W = (name, keys, tgt) => {
    const f = window[name];
    if (typeof f !== 'function') return;
    window[name] = function () {
      const r = f.apply(this, arguments);
      for (const k of keys) {
        try {
          tgt()[k] = ART2[k]();
        } catch (e) {
          console.error(e);
        }
      }
      return r;
    };
  };
  W('genAnimalArt', ['pollaio', 'stalla'], () => AIMG);
  W('genCostrArt', ['serra', 'mulino', 'silos', 'pozzogrande'], () => AIMG);
  W('genEspArt', ['casetta'], () => AIMG);
  W('genSempreArt', ['museo'], () => IMG);
}

// ---------- oggetti costruibili piccoli ----------
const ART3 = {
  cassa: () =>
    GB(16, 15, (P, B) => {
      const W = B.R6('#9a6436'),
        I = B.R6('#4a4a54'),
        G = B.R6('#d8a84a');
      B.planks(P, 3, 13, 26, 15, W, { rowH: 5, seam: 13 });
      for (let Y = 6; Y < 13; Y++) {
        const ins = Y < 8 ? 2 - (Y - 6) : 0;
        for (let X = 3 + ins; X < 29 - ins; X++)
          B.S(P, X, Y, B.tc(W, Y === 6 ? 4 : Y === 12 ? 1 : X > 24 ? 2 : 3));
      }
      for (const X of [6, 24]) {
        B.F(P, X, 6, 2, 22, B.tc(I, 3));
        B.S(P, X, 6, B.tc(I, 5));
      }
      B.F(P, 3, 12, 26, 2, B.tc(I, 2));
      B.F(P, 13, 10, 6, 7, B.tc(G, 3));
      B.F(P, 13, 10, 6, 1, B.tc(G, 5));
      B.F(P, 15, 13, 2, 2, C('#2a1a10'));
    }),
  banco: () =>
    GB(18, 18, (P, B) => {
      const W = B.R6('#9a6436'),
        D = B.R6('#5a3a1e'),
        I = B.R6('#6a6a72');
      for (const X of [4, 28]) {
        B.F(P, X, 16, 4, 18, B.tc(D, 3));
        B.F(P, X, 16, 1, 18, B.tc(D, 4));
        B.F(P, X + 3, 16, 1, 18, B.tc(D, 1));
      }
      B.F(P, 6, 27, 24, 2, B.tc(D, 2));
      B.planks(P, 2, 10, 32, 5, W, { rowH: 5, seam: 12 });
      B.F(P, 2, 15, 32, 2, B.tc(W, 1));
      B.F(P, 5, 4, 10, 6, B.tc(I, 3));
      B.F(P, 5, 4, 10, 1, B.tc(I, 5));
      B.F(P, 8, 2, 4, 2, B.tc(I, 2));
      for (let i = 0; i < 10; i++) {
        B.S(P, 19 + i, 8, B.tc(I, 4));
        if (i % 2) B.S(P, 19 + i, 9, B.tc(I, 2));
      }
      B.F(P, 28, 6, 4, 4, B.tc(D, 3));
      B.F(P, 21, 5, 2, 3, B.tc(D, 4));
    }),
  apiario: () =>
    GB(14, 18, (P, B) => {
      const D = B.R6('#5a3a1e');
      for (const X of [5, 21]) {
        B.F(P, X, 30, 3, 6, B.tc(D, 3));
      }
      B.F(P, 2, 28, 24, 3, B.tc(D, 3));
      B.F(P, 2, 28, 24, 1, B.tc(D, 4));
      ['#e8c23a', '#d8a83a', '#e0b440'].forEach((c, i) => {
        const R = B.R6(c),
          y = 6 + i * 7;
        B.F(P, 4, y, 20, 7, B.tc(R, 3));
        B.F(P, 4, y, 20, 1, B.tc(R, 4));
        B.F(P, 4, y + 6, 20, 1, B.tc(R, 1));
        B.F(P, 21, y + 1, 3, 5, B.tc(R, 2));
        B.F(P, 10, y + 2, 8, 2, B.tc(R, 1));
      });
      const RF = B.R6('#8a5a32');
      B.F(P, 2, 2, 24, 4, B.tc(RF, 3));
      B.F(P, 2, 2, 24, 1, B.tc(RF, 4));
      B.F(P, 3, 1, 22, 1, B.tc(RF, 2));
      B.F(P, 9, 25, 10, 2, C('#1a1008'));
      for (const [x, y] of [
        [6, 22],
        [22, 14],
        [25, 24],
        [1, 12]
      ]) {
        B.S(P, x, y, C('#2a1a10'));
        B.S(P, x + 1, y, C('#f0c83a'));
      }
    }),
  fornace: () =>
    GB(16, 22, (P, B) => {
      const ST = B.R6('#8a7a6a');
      B.stones(P, 4, 10, 24, 34, ST, {
        rh: 5,
        bw: 7,
        clip: (X, Y) => Math.abs(X + 0.5 - 16) <= 8 + (Y - 10) * 0.13,
        shadeX: X => (X > 23 ? -1 : X < 9 ? 1 : 0)
      });
      for (let yy = 0; yy < 12; yy++)
        for (let xx = -6; xx < 6; xx++) {
          if (yy < 4 && Math.abs(xx + 0.5) > Math.sqrt(16 - (4 - yy) * (4 - yy)) * 1.5) continue;
          const d = Math.hypot(xx + 0.5, yy - 8);
          B.S(P, 16 + xx, 30 + yy, C(d < 2.5 ? '#fff0a0' : d < 5 ? '#ffb84a' : '#d8601e'));
        }
      B.F(P, 10, 42, 12, 2, B.tc(ST, 1));
      B.F(P, 11, 0, 10, 10, B.tc(B.R6('#5a4a3a'), 3));
      B.F(P, 11, 0, 2, 10, B.tc(B.R6('#5a4a3a'), 4));
      B.F(P, 10, 0, 12, 2, B.tc(B.R6('#5a4a3a'), 2));
    }),
  botte: () =>
    GB(14, 18, (P, B) => {
      const W = B.R6('#9a6436'),
        I = B.R6('#4a4a54');
      for (let Y = 2; Y < 34; Y++) {
        const hw = 10 + Math.sin(((Y - 2) / 32) * Math.PI) * 3;
        for (let X = Math.round(14 - hw); X < Math.round(14 + hw); X++) {
          const n = (X + 0.5 - 14) / hw,
            st = Math.floor((n + 1) * 4);
          let t = 3;
          if (n < -0.5) t = 4;
          if (n > 0.4) t = 2;
          if (n > 0.8) t = 1;
          if (Math.abs(((n + 1) * 4) % 1) < 0.18) t--;
          B.S(P, X, Y, B.tc(W, t));
        }
      }
      for (const y of [5, 16, 28]) {
        const hw = 10 + Math.sin(((y - 2) / 32) * Math.PI) * 3;
        for (let X = Math.round(14 - hw); X < Math.round(14 + hw); X++) {
          const n = (X + 0.5 - 14) / hw;
          B.S(P, X, y, B.tc(I, n < -0.3 ? 4 : n > 0.5 ? 2 : 3));
          B.S(P, X, y + 1, B.tc(I, 1));
        }
      }
      B.F(P, 7, 2, 14, 1, B.tc(W, 5));
    }),
  statua: () =>
    GB(14, 28, (P, B) => {
      const G = B.R6('#e8c040'),
        ST = B.R6('#9a968a');
      B.stones(P, 3, 42, 22, 14, ST, { rh: 5, bw: 8, mortar: 1 });
      B.F(P, 1, 40, 26, 3, B.tc(ST, 4));
      B.F(P, 1, 42, 26, 1, B.tc(ST, 2));
      B.F(P, 1, 54, 26, 2, B.tc(ST, 2));
      const g = (X, Y, n) => B.S(P, X, Y, B.tc(G, n < -0.4 ? 5 : n < 0 ? 4 : n > 0.55 ? 2 : 3));
      for (let Y = 14; Y < 40; Y++) {
        const hw = Y < 22 ? 4 : 4 + (Y - 22) * 0.22;
        for (let X = Math.round(14 - hw); X < Math.round(14 + hw); X++) g(X, Y, (X + 0.5 - 14) / hw);
      }
      for (let yy = -4; yy <= 4; yy++)
        for (let xx = -4; xx <= 4; xx++) if (xx * xx + yy * yy <= 17) g(14 + xx, 8 + yy, (xx - yy * 0.5) / 4);
      for (const q of [-1, 1])
        for (let i = 0; i < 10; i++) {
          const X = Math.round(14 + q * (4 + i * 0.6)),
            Y = Math.round(17 - i);
          g(X, Y, q * 0.5 - 0.2);
          g(X + q, Y, q * 0.6);
        }
      for (let i = 0; i < 4; i++) B.S(P, 12 + i, 14, B.tc(G, 1));
    })
};
{
  const Wk = (name, keys) => {
    const f = window[name];
    if (typeof f !== 'function') return;
    window[name] = function () {
      const r = f.apply(this, arguments);
      for (const k of keys) {
        try {
          FREEIMG[k] = ART3[k]();
        } catch (e) {
          console.error(e);
        }
      }
      return r;
    };
  };
  Wk('genFreeArt', ['cassa', 'banco']);
  Wk('genFarm2Art', ['apiario', 'fornace', 'botte']);
  Wk('genTradeArt', ['statua']);
}

// ---------- foglie, petali e pollini nell'aria (solo all'aperto, di giorno) ----------
{
  Ext.on('drawAmbTop', function (m) {
    try {
      if (
        m.id !== 'main' ||
        !G.st ||
        G.night > 0.5 ||
        G.horror > 0.6 ||
        G.st.weather === 'pioggia' ||
        G.st.weather === 'neve'
      )
        return;
      const s = typeof seasonOf === 'function' ? seasonOf(G.st) : 0;
      if (s !== 3) return;
      const T = G.t,
        cx = G.cam.x,
        cy = G.cam.y,
        a = 1 - G.night * 1.6;
      if (a <= 0) return;
      const pal =
        s === 0
          ? ['#d8742a', '#e8a83a', '#b8481e', '#c89030']
          : s === 2
            ? ['#f4c8d8', '#fbeef2', '#e8a8c0']
            : ['#fff0b0', '#f8e080'];
      const n = s === 3 ? 22 : 16;
      ctx.globalAlpha = a;
      for (let i = 0; i < n; i++) {
        const sp = s === 3 ? 3 : 9 + (i % 4) * 2,
          x =
            cx +
            ((((i * 131.7 + T * (4 + (i % 3)) + Math.sin(T * 1.1 + i) * 14) % (W + 40)) + W + 40) %
              (W + 40)) -
            20,
          y = cy + ((i * 71.3 + T * sp) % (H + 30)) - 15,
          c = pal[i % pal.length];
        if (s === 3) {
          const on = (Math.sin(T * 2 + i * 1.7) + 1) / 2;
          if (on < 0.4) continue;
          ctx.fillStyle = c;
          ctx.globalAlpha = a * on * 0.8;
          ctx.fillRect(Math.round(x * 2) / 2, Math.round((y + Math.sin(T + i) * 6) * 2) / 2, 0.5, 0.5);
          ctx.globalAlpha = a;
          continue;
        }
        const r = Math.sin(T * 3 + i * 2.1);
        ctx.fillStyle = 'rgba(40,20,10,.35)';
        ctx.fillRect(Math.round(x) + 0.5, Math.round(y) + 1, r > 0 ? 1.5 : 0.5, 0.5);
        ctx.fillStyle = c;
        if (r > 0.3) ctx.fillRect(Math.round(x), Math.round(y), 2, 1.5);
        else if (r > -0.3) ctx.fillRect(Math.round(x), Math.round(y), 1.5, 1.5);
        else ctx.fillRect(Math.round(x), Math.round(y), 1, 2);
      }
      ctx.globalAlpha = 1;
    } catch (e) {
      ctx.globalAlpha = 1;
    }
  });
}

// ---------- ritratti: stesse espressioni, ombre a toni pieni come gli sprite ----------
{
  const _gp = genPortrait,
    _lit = lit,
    _pick = pickI;
  const celLit = (n, o) => {
    const v = _lit(n, o);
    return v < 0.4 ? 0.18 : v < 0.72 ? 0.5 : v < 0.95 ? 0.68 : 0.86;
  };
  const celPick = (n, v) => Math.min(n - 1, Math.floor(clamp(v, 0, 0.999) * n));
  genPortrait = function (L, mood) {
    lit = celLit;
    pickI = celPick;
    try {
      return _gp(L, mood);
    } finally {
      lit = _lit;
      pickI = _pick;
    }
  };
}

// ======================================================================
// (già grafica2.js, unito qui senza cambiare l'ordine di caricamento)
// ================= GRAFICA 2: attrezzi, animali, piante, cibi, atmosfera =================
// Solo aspetto. Sostituisce immagini e disegni dopo i generatori originali; non tocca logica né dati.

// ---------- stile a toni pieni per tutte le immagini "a volume" (icone, cibi, colture, oggetti) ----------
const CEL = (() => {
  const _lit = lit,
    _pick = pickI;
  const cl = (n, o) => {
    const v = _lit(n, o);
    return v < 0.3 ? 0.17 : v < 0.56 ? 0.45 : v < 0.8 ? 0.62 : v < 1.02 ? 0.8 : 0.96;
  };
  const cp = (n, v) => Math.min(n - 1, Math.floor(clamp(v, 0, 0.999) * n));
  const run = f =>
    function () {
      const a = lit,
        b = pickI;
      lit = cl;
      pickI = cp;
      try {
        return f.apply(this, arguments);
      } finally {
        lit = a;
        pickI = b;
      }
    };
  for (const name of [
    'genIconsHD',
    'genCropsHD',
    'genCritters',
    'genAnimalArt',
    'genGardenArt',
    'genDishArt',
    'genFarm2Art',
    'genTradeArt',
    'genFreeArt',
    'genMissionArt',
    'genFestArt',
    'genBuildArt',
    'genEspArt',
    'genCostrArt',
    'genSempreArt',
    'genAspettoArt',
    'genMineArt',
    'genValleArt',
    'genPietraArt',
    'genPropsHD',
    'genWoodArt',
    'genDeco'
  ])
    if (typeof window[name] === 'function') window[name] = run(window[name]);
  return { run };
})();

// ---------- kit generico: maschere di qualunque misura ----------
class MK2 {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.a = new Uint8Array(w * h);
  }
  has(X, Y) {
    return X >= 0 && Y >= 0 && X < this.w && Y < this.h && this.a[Y * this.w + X] === 1;
  }
  fn(f, x0 = 0, y0 = 0, x1 = this.w - 1, y1 = this.h - 1) {
    for (let Y = Math.max(0, Math.floor(y0)); Y <= Math.min(this.h - 1, Math.ceil(y1)); Y++)
      for (let X = Math.max(0, Math.floor(x0)); X <= Math.min(this.w - 1, Math.ceil(x1)); X++)
        if (f(X + 0.5, Y + 0.5, X, Y)) this.a[Y * this.w + X] = 1;
    return this;
  }
  rect(x, y, w, h) {
    return this.fn(() => true, x, y, x + w - 1, y + h - 1);
  }
  ell(cx, cy, rx, ry, clip) {
    return this.fn(
      (x, y, X, Y) => {
        const a = (x - cx) / rx,
          b = (y - cy) / ry;
        return a * a + b * b <= 1 && (!clip || clip(X, Y));
      },
      cx - rx - 1,
      cy - ry - 1,
      cx + rx + 1,
      cy + ry + 1
    );
  }
  rot(cx, cy, rx, ry, ang, clip) {
    const c = Math.cos(ang),
      s = Math.sin(ang),
      m = Math.max(rx, ry) + 1;
    return this.fn(
      (x, y, X, Y) => {
        const dx = x - cx,
          dy = y - cy,
          u = (dx * c + dy * s) / rx,
          v = (-dx * s + dy * c) / ry;
        return u * u + v * v <= 1 && (!clip || clip(X, Y));
      },
      cx - m,
      cy - m,
      cx + m,
      cy + m
    );
  }
  cap(ax, ay, bx, by, r, r2 = r) {
    const dx = bx - ax,
      dy = by - ay,
      L2 = dx * dx + dy * dy || 1,
      m = Math.max(r, r2) + 1;
    return this.fn(
      (x, y) => {
        const t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1),
          rr = r + (r2 - r) * t;
        return Math.hypot(x - ax - dx * t, y - ay - dy * t) <= rr;
      },
      Math.min(ax, bx) - m,
      Math.min(ay, by) - m,
      Math.max(ax, bx) + m,
      Math.max(ay, by) + m
    );
  }
  poly(pts) {
    let x0 = 1e9,
      y0 = 1e9,
      x1 = -1e9,
      y1 = -1e9;
    for (const [a, b] of pts) {
      x0 = Math.min(x0, a);
      y0 = Math.min(y0, b);
      x1 = Math.max(x1, a);
      y1 = Math.max(y1, b);
    }
    return this.fn(
      (x, y) => {
        let ins = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i],
            [xj, yj] = pts[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
        }
        return ins;
      },
      x0,
      y0,
      x1,
      y1
    );
  }
  sub(o) {
    for (let i = 0; i < this.a.length; i++) if (o.a[i]) this.a[i] = 0;
    return this;
  }
  each(f) {
    for (let i = 0; i < this.a.length; i++) if (this.a[i]) f(i % this.w, (i / this.w) | 0);
  }
}
function paint2(P, M, R, o = {}) {
  const b = o.base ?? 3;
  M.each((X, Y) => {
    let t = b;
    const r1 = !M.has(X + 1, Y),
      bt = !M.has(X, Y + 1),
      l = !M.has(X - 1, Y),
      tp = !M.has(X, Y - 1),
      r2 = !M.has(X + 2, Y) || !M.has(X, Y + 2);
    if (!o.flat) {
      if (r1 || bt) t = b - 1;
      else if (r2 && !o.thin) t = b - 1;
      else if (l || tp) t = b + 1;
    }
    if (o.mod) t = o.mod(X, Y, t);
    if (t == null) return;
    P.set(X, Y, R[clamp(t, 0, R.length - 1)]);
  });
  if (o.nc) return;
  const d = P.d,
    k = o.ck ?? 0.7,
    seen = new Set();
  M.each((X, Y) => {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      const xx = X + dx,
        yy = Y + dy;
      if (xx < 0 || yy < 0 || xx >= P.w || yy >= P.h || M.has(xx, yy)) continue;
      const i = (yy * P.w + xx) * 4;
      if (!d[i + 3] || seen.has(i)) continue;
      seen.add(i);
      d[i] *= k;
      d[i + 1] *= k;
      d[i + 2] *= k;
    }
  });
}
const R6b = h => ramp6(h);
const mkM = P => new MK2(P.w, P.h);
// manico in diagonale (dal basso a sinistra all'alto a destra), largo 2-3 px
function handle(P, x0, y0, len, R, o = {}) {
  for (let i = 0; i < len; i++) {
    const x = x0 + i,
      y = y0 - i;
    const wrap = o.wrap && i >= o.wrap[0] && i < o.wrap[1];
    const RR = wrap ? o.wrapR : R;
    P.set(x, y, RR[3]);
    P.set(x - 1, y, RR[4]);
    P.set(x, y + 1, RR[2]);
    if (o.thick) P.set(x + 1, y + 1, RR[1]);
    if (wrap && i % 2) P.set(x, y, RR[2]);
  }
}
const icon32 = fn => {
  const P = new PX(32, 32);
  fn(P);
  P.outline();
  return pxCanvas(P);
};

// ---------- attrezzi: sagome ben distinte ----------
const TOOLS = {
  // zappa: manico lungo, lama piatta che scende ad angolo retto
  hoe: () =>
    icon32(P => {
      const W = R6b('#a87a48'),
        I = R6b('#c8743a'),
        S = R6b('#a8b0b8');
      handle(P, 3, 29, 22, W);
      paint2(
        P,
        mkM(P).poly([
          [18, 6],
          [22, 3],
          [30, 11],
          [29, 15],
          [25, 12]
        ]),
        I,
        { thin: 1 }
      );
      paint2(
        P,
        mkM(P).poly([
          [25, 12],
          [29, 15],
          [27, 17],
          [23, 14]
        ]),
        S,
        { thin: 1, mod: (X, Y, t) => t + 1 }
      );
      paint2(P, mkM(P).rect(19, 5, 4, 4), R6b('#5a5a64'), { thin: 1 });
    }),
  // pala: impugnatura a D in basso, lama larga e arrotondata in alto
  pala: () =>
    icon32(P => {
      const W = R6b('#b8884e'),
        S = R6b('#7a8a9a');
      handle(P, 5, 26, 14, W);
      paint2(
        P,
        mkM(P)
          .ell(4, 28, 3.2, 3.2)
          .sub(mkM(P).ell(4, 28, 1.4, 1.4)),
        R6b('#5a3a1e'),
        { thin: 1 }
      );
      paint2(P, mkM(P).rect(17, 11, 4, 4), R6b('#4a4a54'), { thin: 1 });
      paint2(P, mkM(P).rot(24.5, 7.5, 8, 5.6, -Math.PI / 4), S, {
        mod: (X, Y, t) => {
          const d = X - Y - (24.5 - 7.5);
          if (Math.abs(d) < 1) t--;
          if (X + Y < 26) return null;
          return t;
        }
      });
      P.set(29, 3, R6b('#c8d0d8')[5]);
      P.set(28, 3, R6b('#c8d0d8')[4]);
    }),
  // accetta: manico rosso corto, testa con lama a mezzaluna lucida
  accetta: () =>
    icon32(P => {
      const W = R6b('#8a3a2a'),
        S = R6b('#9aa2aa');
      handle(P, 6, 29, 16, R6b('#a8743e'), { wrap: [0, 6], wrapR: W });
      paint2(
        P,
        mkM(P).poly([
          [16, 9],
          [20, 5],
          [23, 8],
          [19, 12]
        ]),
        R6b('#5a5a64'),
        { thin: 1 }
      );
      paint2(
        P,
        mkM(P).poly([
          [21, 7],
          [26, 2],
          [31, 7],
          [30, 13],
          [27, 16],
          [23, 11]
        ]),
        S,
        { mod: (X, Y, t) => (X - 2 + (Y - 2) >= 33 ? 5 : t) }
      );
    }),
  // piccone: arco di ferro a due punte
  piccone: () =>
    icon32(P => {
      const W = R6b('#a87a48'),
        I = R6b('#8a909c');
      handle(P, 4, 29, 20, W);
      const M = mkM(P);
      for (let i = -11; i <= 11; i++) {
        const t = i / 11,
          bx = 20 + i * 0.72 + (1 - t * t) * 2.4,
          by = 10 + i * 0.72 - (1 - t * t) * 2.4,
          r = 2.5 * (1 - Math.abs(t) * 0.65) + 0.4;
        M.ell(bx, by, r, r);
      }
      paint2(P, M, I);
      P.set(12, 3, I[5]);
      P.set(29, 19, I[5]);
      paint2(P, mkM(P).rect(18, 8, 4, 4), R6b('#8a5a32'), { thin: 1 });
    }),
  // annaffiatoio verde rame, con cipolla forata
  can: () =>
    icon32(P => {
      const G = R6b('#4a8a6a'),
        B = R6b('#b8863a');
      paint2(P, mkM(P).cap(20, 18, 29, 9, 1.6, 1.4), G);
      paint2(P, mkM(P).rot(29, 8, 3, 2, -0.8), B);
      paint2(
        P,
        mkM(P)
          .rect(5, 13, 16, 15)
          .fn((x, y) => Math.hypot(x - 13, y - 13) < 9 && y < 14),
        G,
        { mod: (X, Y, t) => (Y === 19 || Y === 24 ? t - 1 : t) }
      );
      const hM = mkM(P).fn((x, y) => {
        const d = Math.hypot(x - 12, y - 11);
        return d < 7.5 && d > 5.5 && y < 11;
      });
      paint2(P, hM, B, { thin: 1 });
      P.set(28, 6, C('#e8e8f0'));
      P.set(30, 7, C('#e8e8f0'));
    }),
  // canna: bambù, mulinello, lenza e galleggiante
  canna: () =>
    icon32(P => {
      const W = R6b('#c8a050');
      handle(P, 3, 30, 26, W);
      for (const i of [6, 12, 18]) P.set(3 + i, 30 - i, W[1]);
      paint2(P, mkM(P).ell(9, 22, 2.8, 2.8), R6b('#6a6e78'), { thin: 1 });
      P.set(9, 22, C('#2e2e34'));
      for (let y = 5; y < 22; y++) P.set(29, y, C('#e8e8e0'), 180);
      paint2(P, mkM(P).ell(29, 23, 2.2, 2.6), R6b('#d8402a'), { thin: 1 });
      for (let x = 27; x <= 31; x++) P.set(x, 23, C('#f4f0e4'));
    })
};

// ---------- particelle e atmosfera ----------
{
  const _dp = drawParts;
  drawParts = function () {
    const rest = [];
    for (const p of G.parts) {
      const X = p.x,
        Y = p.y,
        f = 1 - p.t / p.life;
      if (p.k === 'leaf') {
        const r = Math.sin(p.t * 3 + p.ph),
          a = Math.min(1, f * 4);
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(30,16,8,.25)';
        ctx.fillRect(Math.round(X) + 1, Math.round(Y) + 2, 2, 0.5);
        ctx.fillStyle = p.c;
        if (r > 0.4) {
          ctx.fillRect(Math.round(X), Math.round(Y), 2.5, 1);
          ctx.fillRect(Math.round(X) + 0.5, Math.round(Y) + 1, 1.5, 0.5);
        } else if (r > -0.4) {
          ctx.fillRect(Math.round(X), Math.round(Y), 1.5, 1.5);
          ctx.fillStyle = 'rgba(0,0,0,.25)';
          ctx.fillRect(Math.round(X) + 1, Math.round(Y) + 1, 0.5, 0.5);
        } else ctx.fillRect(Math.round(X) + 0.5, Math.round(Y), 1, 2.5);
        ctx.globalAlpha = 1;
      } else if (p.k === 'rain') {
        ctx.fillStyle = 'rgba(170,195,235,.35)';
        ctx.fillRect(Math.round(X * 2) / 2, Math.round(Y), 0.5, 8);
        ctx.fillStyle = 'rgba(225,238,255,.8)';
        ctx.fillRect(Math.round(X * 2) / 2 - 0.5, Math.round(Y) + 6, 0.5, 3);
      } else if (p.k === 'splash') {
        const k = p.t / p.life,
          r = 1 + k * 4;
        ctx.strokeStyle = `rgba(210,228,250,${(0.6 * (1 - k)).toFixed(2)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(X, Y + 0.5, r, r * 0.4, 0, 0, 7);
        ctx.stroke();
        if (k < 0.5) {
          ctx.fillStyle = 'rgba(230,240,255,.8)';
          ctx.fillRect(X - 1.5, Y - 2 + k * 3, 0.5, 0.5);
          ctx.fillRect(X + 1, Y - 2.5 + k * 3, 0.5, 0.5);
        }
      } else if (p.k === 'smoke') {
        const r = 1.5 + p.t * 1.4,
          a = 0.32 * f,
          n = G.night > 0.5;
        ctx.fillStyle = n ? `rgba(80,80,95,${a.toFixed(2)})` : `rgba(200,196,192,${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(X, Y, r, 0, 7);
        ctx.fill();
        ctx.fillStyle = n
          ? `rgba(110,110,125,${(a * 0.7).toFixed(2)})`
          : `rgba(240,238,234,${(a * 0.8).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(X - r * 0.35, Y - r * 0.35, r * 0.55, 0, 7);
        ctx.fill();
      } else if (p.k === 'fly') {
        const a = 0.5 + Math.sin(p.t * 6 + p.ph) * 0.5,
          g = ctx.createRadialGradient(X, Y, 0, X, Y, 5);
        g.addColorStop(0, `rgba(230,255,140,${(a * 0.5).toFixed(2)})`);
        g.addColorStop(1, 'rgba(230,255,140,0)');
        ctx.fillStyle = g;
        ctx.fillRect(X - 5, Y - 5, 10, 10);
        ctx.fillStyle = `rgba(250,255,200,${a.toFixed(2)})`;
        ctx.fillRect(Math.round(X), Math.round(Y), 1, 1);
      } else if (p.k === 'dust') {
        const a = Math.min(1, f * 2);
        ctx.fillStyle = `rgba(150,110,70,${(a * 0.8).toFixed(2)})`;
        ctx.fillRect(X - 1, Y - 1, 2, 2);
        ctx.fillStyle = `rgba(200,165,120,${(a * 0.7).toFixed(2)})`;
        ctx.fillRect(X - 1, Y - 1, 1, 1);
      } else if (p.k === 'water') {
        ctx.fillStyle = 'rgba(150,205,245,.9)';
        ctx.fillRect(X, Y, 1, 1.5);
        ctx.fillStyle = 'rgba(235,248,255,.9)';
        ctx.fillRect(X, Y, 0.5, 0.5);
      } else if (p.k === 'spark') {
        const g = ctx.createRadialGradient(X, Y, 0, X, Y, 3);
        g.addColorStop(0, 'rgba(255,220,120,.6)');
        g.addColorStop(1, 'rgba(255,200,80,0)');
        ctx.fillStyle = g;
        ctx.fillRect(X - 3, Y - 3, 6, 6);
        ctx.fillStyle = p.c || '#fff2a0';
        ctx.fillRect(X, Y, 1, 1);
      } else if (p.k === 'bird') {
        const x = Math.round(X),
          y = Math.round(Y),
          ph = Math.floor(p.t * 8 + p.ph) % 3;
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.fillRect(x - 2, y + 40, 4, 1);
        ctx.fillStyle = '#2a2420';
        ctx.fillRect(x - 1, y, 2, 1);
        ctx.fillStyle = '#4a4038';
        ctx.fillRect(x + (p.vx > 0 ? 1 : -2), y, 1, 1);
        ctx.fillStyle = '#2a2420';
        if (ph === 0) {
          ctx.fillRect(x - 3, y - 1, 2, 1);
          ctx.fillRect(x + 1, y - 1, 2, 1);
          ctx.fillRect(x - 4, y - 2, 1, 1);
          ctx.fillRect(x + 3, y - 2, 1, 1);
        } else if (ph === 1) {
          ctx.fillRect(x - 3, y, 2, 1);
          ctx.fillRect(x + 1, y, 2, 1);
        } else {
          ctx.fillRect(x - 3, y + 1, 2, 1);
          ctx.fillRect(x + 1, y + 1, 2, 1);
        }
      } else rest.push(p);
    }
    const all = G.parts;
    G.parts = rest;
    try {
      _dp();
    } finally {
      G.parts = all;
    }
  };
}
// pioggia: velo obliquo e cerchi nelle pozzanghere; neve: fiocchi grandi in primo piano
{
  const _at = atmosphere;
  atmosphere = function (m) {
    _at(m);
    try {
      if (m.interior || !G.st) return;
      const wx = G.st.weather,
        T = G.t;
      if (wx === 'pioggia') {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = '#c8d8f0';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i < 60; i++) {
          const x = ((((i * 53.7 + T * -70) % (W + 80)) + W + 80) % (W + 80)) - 40,
            y = ((i * 97.1 + T * 520) % (H + 60)) - 30;
          ctx.moveTo(x, y);
          ctx.lineTo(x - 2.4, y + 18);
        }
        ctx.stroke();
        ctx.restore();
        const cx = G.cam.x,
          cy = G.cam.y;
        ctx.save();
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 26; i++) {
          const per = 1.1 + (i % 5) * 0.13,
            k = ((T + i * 0.37) % per) / per,
            x = (i * 137.3) % W,
            y = (i * 71.9 + Math.floor((T + i * 0.37) / per) * 31) % H;
          ctx.strokeStyle = `rgba(200,220,245,${(0.35 * (1 - k)).toFixed(2)})`;
          ctx.beginPath();
          ctx.ellipse(x, y, 1 + k * 5, (1 + k * 5) * 0.38, 0, 0, 7);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (wx === 'neve') {
        ctx.save();
        for (let i = 0; i < 34; i++) {
          const sp = 10 + (i % 6) * 3,
            x =
              ((((i * 113.3 + T * (6 + (i % 4)) + Math.sin(T * 0.8 + i) * 18) % (W + 20)) + W + 20) %
                (W + 20)) -
              10,
            y = ((i * 61.7 + T * sp) % (H + 20)) - 10,
            s = i % 5 === 0 ? 2.5 : 1.5;
          ctx.fillStyle = 'rgba(255,255,255,.35)';
          ctx.fillRect(x - 0.5, y - 0.5, s + 1, s + 1);
          ctx.fillStyle = 'rgba(255,255,255,.95)';
          ctx.fillRect(x, y, s, s);
        }
        ctx.restore();
      }
      if (wx === 'nebbia') {
        ctx.save();
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, 'rgba(220,225,235,.0)');
        g.addColorStop(1, 'rgba(220,225,235,.22)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    } catch (e) {}
  };
}

{
  const setTools = () => {
    for (const k in TOOLS) {
      try {
        ICON[k] = TOOLS[k]();
      } catch (e) {
        console.error(e);
      }
    }
  };
  for (const name of ['genIconsHD', 'genFreeArt', 'genEspArt']) {
    const f = window[name];
    if (typeof f !== 'function') continue;
    window[name] = function () {
      const r = f.apply(this, arguments);
      setTools();
      return r;
    };
  }
}

// ---------- cibi e ricette: ogni piatto riconoscibile ----------
const DISH = (() => {
  const steam = P => {
    for (const [x0, ph] of [
      [11, 0],
      [16, 2],
      [21, 1]
    ])
      for (let y = 2; y < 9; y++)
        P.set(x0 + Math.round(Math.sin(y * 0.9 + ph)), y, C('#ffffff'), y < 4 ? 70 : 130);
  };
  const plate = (P, col = '#f2ece0') => {
    const R = R6b(col);
    paint2(P, mkM(P).ell(16, 21, 14.5, 7), R, { thin: 1 });
    paint2(P, mkM(P).ell(16, 20.5, 11, 5), R, { flat: 1, nc: 1, base: 4 });
    for (let a = 0; a < 12; a++) {
      const t = (a / 12) * Math.PI * 2;
      P.set(Math.round(16 + Math.cos(t) * 13), Math.round(21 + Math.sin(t) * 6), C('#5a7ab0'));
    }
  };
  const bowl = (P, soup, col = '#c87a4a') => {
    const B = R6b(col),
      S = R6b(soup);
    paint2(
      P,
      mkM(P).ell(16, 17, 12.5, 10.5, (X, Y) => Y >= 17),
      B
    );
    for (let X = 5; X < 28; X++) if (P.has(X, 22)) P.set(X, 22, B[4]);
    paint2(P, mkM(P).ell(16, 17, 12.5, 3.8), B, { base: 4, thin: 1 });
    paint2(P, mkM(P).ell(16, 17, 10.5, 2.8), S, { thin: 1, nc: 1, mod: (X, Y, t) => (Y < 17 ? t + 1 : t) });
  };
  const pie = (P, fill, lat = true) => {
    const Cr = R6b('#d8984a'),
      F = R6b(fill);
    paint2(P, mkM(P).ell(16, 20, 14, 8), Cr);
    paint2(P, mkM(P).ell(16, 18.5, 11, 5.5), F, { nc: 1 });
    if (lat)
      for (let k = -8; k <= 8; k += 4) {
        for (let i = -5; i <= 5; i++) {
          const X = 16 + k + i,
            Y = 18 + i;
          if (Math.hypot((X - 16) / 11, (Y - 18.5) / 5.5) < 1) {
            P.set(X, Y, Cr[4]);
            P.set(X + 1, Y, Cr[2]);
          }
          const X2 = 16 + k - i;
          if (Math.hypot((X2 - 16) / 11, (Y - 18.5) / 5.5) < 1) P.set(X2, Y, Cr[4]);
        }
      }
    for (let a = 0; a < 16; a++) {
      const t = (a / 16) * Math.PI * 2;
      P.set(Math.round(16 + Math.cos(t) * 13), Math.round(20 + Math.sin(t) * 7), Cr[a % 2 ? 2 : 5]);
    }
  };
  const dots = (P, pts, col, r = 1.2) => {
    for (const [x, y] of pts) paint2(P, mkM(P).ell(x, y, r, r), R6b(col), { thin: 1, nc: 1 });
  };
  const D = {
    frittata: P => {
      plate(P);
      paint2(P, mkM(P).ell(16, 19, 9, 4.5), R6b('#f0c43a'), {
        mod: (X, Y, t) => ((X * 5 + Y * 3) % 9 === 0 ? t - 1 : t)
      });
      dots(
        P,
        [
          [12, 18],
          [19, 20],
          [16, 17]
        ],
        '#e8a028',
        1
      );
    },
    frittataasparagi: P => {
      plate(P);
      paint2(P, mkM(P).ell(16, 19, 9, 4.5), R6b('#f0c43a'));
      for (const x of [11, 15, 19]) paint2(P, mkM(P).cap(x, 21, x + 3, 15, 0.9), R6b('#6aa83a'), { thin: 1 });
    },
    polenta: P => {
      plate(P, '#8a6a48');
      paint2(P, mkM(P).ell(16, 18, 10, 5.5), R6b('#f0b830'), {
        mod: (X, Y, t) => ((X + Y * 2) % 7 === 0 ? t - 1 : t)
      });
      paint2(P, mkM(P).rect(14, 12, 8, 2), R6b('#a8743e'), { thin: 1 });
    },
    umido: P => {
      bowl(P, '#8a3a1e');
      dots(
        P,
        [
          [11, 16],
          [14, 17],
          [18, 16],
          [21, 17],
          [16, 15]
        ],
        '#e8dcc0',
        1
      );
      steam(P);
    },
    zuppa: P => {
      bowl(P, '#e8902a');
      dots(
        P,
        [
          [12, 16],
          [19, 17]
        ],
        '#f0e8f0',
        1.3
      );
      steam(P);
    },
    zuppaporri: P => {
      bowl(P, '#d8d8a0');
      dots(
        P,
        [
          [11, 16],
          [15, 17],
          [20, 16]
        ],
        '#6aa83a',
        1
      );
      steam(P);
    },
    zuppacipolle: P => {
      bowl(P, '#b8782a');
      paint2(P, mkM(P).rect(12, 14, 9, 4), R6b('#d89848'));
      steam(P);
    },
    zuppabietole: P => {
      bowl(P, '#a8203a');
      paint2(P, mkM(P).ell(17, 16.5, 3, 1.2), R6b('#f4f0e4'), { thin: 1, nc: 1 });
      steam(P);
    },
    minestrone: P => {
      bowl(P, '#c8702a');
      dots(
        P,
        [
          [11, 16],
          [14, 17],
          [18, 16],
          [21, 17]
        ],
        '#5a9a2a',
        1
      );
      dots(
        P,
        [
          [16, 16],
          [13, 15]
        ],
        '#e8a028',
        0.9
      );
      steam(P);
    },
    risottofunghi: P => {
      plate(P);
      paint2(P, mkM(P).ell(16, 19, 9.5, 4.8), R6b('#f0e0b0'), {
        mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t)
      });
      for (const [x, y] of [
        [12, 17],
        [18, 18],
        [15, 20]
      ]) {
        paint2(P, mkM(P).ell(x, y, 2.2, 1.3), R6b('#8a5a32'), { thin: 1, nc: 1 });
        P.set(x, y + 1, C('#e8d8b8'));
      }
    },
    peperonata: P => {
      plate(P);
      for (const [x, y, c] of [
        [11, 18, '#d8302a'],
        [16, 17, '#f0c030'],
        [20, 19, '#d8302a'],
        [14, 20, '#f0c030'],
        [19, 16, '#3a8a2a']
      ])
        paint2(P, mkM(P).rot(x, y, 3, 1.2, 0.6), R6b(c), { thin: 1 });
    },
    parmigiana: P => {
      const Dm = R6b('#e8e0d0');
      paint2(P, mkM(P).rect(4, 13, 24, 13), Dm);
      paint2(P, mkM(P).rect(6, 14, 20, 9), R6b('#c83a2a'), { nc: 1 });
      for (let y = 15; y < 22; y += 3)
        for (let x = 7; x < 25; x += 4)
          paint2(P, mkM(P).ell(x + ((y / 3) % 2) * 2, y, 1.8, 1), R6b('#f0e0a0'), { thin: 1, nc: 1 });
      dots(
        P,
        [
          [10, 16],
          [20, 19]
        ],
        '#4a8a2a',
        0.8
      );
    },
    insalata: P => {
      bowl(P, '#4a9a2a', '#d8e0e8');
      dots(
        P,
        [
          [12, 15],
          [19, 16]
        ],
        '#e0402a',
        1.6
      );
      dots(P, [[16, 14]], '#7ac04a', 1.8);
    },
    insalatamista: P => {
      bowl(P, '#4a9a2a', '#d8e0e8');
      dots(
        P,
        [
          [11, 15],
          [20, 16]
        ],
        '#e0402a',
        1.5
      );
      dots(
        P,
        [
          [15, 14],
          [18, 14]
        ],
        '#f08a2a',
        1.2
      );
      dots(P, [[13, 16]], '#e8e0a0', 1.1);
    },
    pastaaglio: P => {
      plate(P);
      const Y = R6b('#f0d080');
      for (let i = 0; i < 5; i++)
        paint2(
          P,
          mkM(P).fn((x, y) => {
            const d = Math.hypot((x - 16) / (9 - i * 1.5), (y - 19) / (4.5 - i * 0.8));
            return d < 1 && d > 0.72;
          }),
          Y,
          { thin: 1, nc: 1 }
        );
      dots(
        P,
        [
          [12, 18],
          [19, 19],
          [16, 21]
        ],
        '#3a7a2a',
        1
      );
    },
    gnocchi: P => {
      plate(P);
      for (const [x, y] of [
        [11, 18],
        [15, 17],
        [19, 18],
        [13, 20],
        [17, 20],
        [21, 20],
        [16, 22]
      ])
        paint2(P, mkM(P).ell(x, y, 2, 1.4), R6b('#f0dca0'), { thin: 1 });
      dots(
        P,
        [
          [14, 19],
          [18, 19]
        ],
        '#c83a2a',
        0.8
      );
    },
    pizza: P => {
      paint2(P, mkM(P).ell(16, 18, 14, 9), R6b('#d89848'));
      paint2(P, mkM(P).ell(16, 17.5, 11.5, 7), R6b('#c83a2a'), { nc: 1 });
      for (const [x, y] of [
        [11, 15],
        [19, 14],
        [15, 19],
        [21, 19],
        [10, 19]
      ])
        paint2(P, mkM(P).ell(x, y, 2.2, 1.6), R6b('#f4ecd0'), { thin: 1, nc: 1 });
      dots(
        P,
        [
          [14, 15],
          [18, 18]
        ],
        '#3a8a2a',
        0.8
      );
    },
    arrosto: P => {
      plate(P);
      for (const [x, y] of [
        [11, 18],
        [17, 17],
        [21, 20],
        [14, 21],
        [18, 21]
      ]) {
        paint2(P, mkM(P).rot(x, y, 3, 2.2, 0.4), R6b('#d8963a'));
        P.set(x - 1, y - 1, C('#f8d890'));
      }
      dots(P, [[15, 18]], '#4a8a2a', 0.8);
    },
    pane: P => {
      paint2(P, mkM(P).ell(16, 18, 13, 7.5), R6b('#c8843a'));
      for (const x of [9, 14, 19, 24]) for (let i = 0; i < 5; i++) P.set(x - 2 + i, 14 + i, C('#f0c070'));
    },
    panecasa: P => {
      paint2(P, mkM(P).ell(16, 18, 11, 9), R6b('#b8743a'));
      for (let i = -4; i <= 4; i++) {
        P.set(16 + i, 16 + i, C('#f0c070'));
        P.set(16 + i, 16 - i, C('#f0c070'));
      }
      P.set(12, 13, C('#f8e0a0'));
    },
    focaccia: P => {
      paint2(P, mkM(P).rect(4, 12, 24, 14), R6b('#e0a848'), {
        mod: (X, Y, t) => (X % 5 === 2 && Y % 4 === 1 ? t - 2 : t)
      });
      dots(
        P,
        [
          [9, 15],
          [20, 20]
        ],
        '#5a8a2a',
        0.8
      );
    },
    crostata: P => pie(P, '#d82a3a'),
    torta: P => pie(P, '#e87a1e', false),
    tortamele: P => {
      pie(P, '#e8c070');
      for (const [x, y] of [
        [12, 18],
        [16, 17],
        [20, 18],
        [14, 20],
        [18, 20]
      ])
        paint2(P, mkM(P).rot(x, y, 2.4, 1, 0.3), R6b('#f0d898'), { thin: 1, nc: 1 });
    },
    tortamore: P => {
      pie(P, '#4a1a5a');
      dots(
        P,
        [
          [12, 17],
          [17, 18],
          [20, 17],
          [15, 20]
        ],
        '#2a0a3a',
        1
      );
    },
    castagnaccio: P => {
      paint2(P, mkM(P).ell(16, 19, 14, 8), R6b('#6a3a1e'));
      for (const [x, y] of [
        [11, 17],
        [17, 16],
        [21, 19],
        [14, 21]
      ])
        paint2(P, mkM(P).ell(x, y, 1.2, 0.8), R6b('#e8d8a0'), { thin: 1, nc: 1 });
      dots(
        P,
        [
          [19, 17],
          [13, 19]
        ],
        '#3a6a2a',
        0.7
      );
    },
    anguriafresca: P => {
      plate(P);
      for (const x of [9, 16, 23]) {
        paint2(
          P,
          mkM(P).poly([
            [x - 5, 22],
            [x + 5, 22],
            [x, 12]
          ]),
          R6b('#e83a4a')
        );
        for (let X = x - 5; X < x + 5; X++) {
          P.set(X, 22, C('#3a8a2a'));
          P.set(X, 21, C('#d8f0c0'));
        }
        P.set(x - 1, 17, C('#1a1010'));
        P.set(x + 1, 19, C('#1a1010'));
      }
    },
    marmellata: P => {
      paint2(P, mkM(P).rect(9, 9, 14, 19), R6b('#c8202a'), { mod: (X, Y, t) => (X < 11 ? t + 1 : t) });
      paint2(P, mkM(P).rect(8, 5, 16, 5), R6b('#d8c8a8'), {
        mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t)
      });
      paint2(P, mkM(P).rect(11, 15, 10, 7), R6b('#f4ecd8'), { thin: 1, nc: 1 });
      dots(P, [[16, 18]], '#c8202a', 1.4);
      P.set(11, 11, C('#ff8080'));
    },
    tisana: P => {
      const Cu = R6b('#e8e0d0');
      paint2(
        P,
        mkM(P)
          .rect(8, 12, 15, 14)
          .fn((x, y) => false),
        Cu
      );
      paint2(P, mkM(P).ell(15.5, 24, 7.5, 3), Cu);
      paint2(
        P,
        mkM(P)
          .ell(26, 18, 3, 3.5)
          .sub(mkM(P).ell(26, 18, 1.4, 1.8)),
        Cu,
        { thin: 1 }
      );
      paint2(P, mkM(P).ell(15.5, 12, 7.5, 2.4), R6b('#e8c860'), { thin: 1, nc: 1 });
      steam(P);
    }
  };
  return D;
})();
{
  const setDishes = () => {
    for (const k in DISH) {
      if (!ICON[k]) continue;
      try {
        ICON[k] = icon32(DISH[k]);
      } catch (e) {
        console.error(e);
      }
    }
  };
  for (const name of [
    'genIconsHD',
    'genAnimalArt',
    'genDishArt',
    'genGardenArt',
    'genCostrArt',
    'genFarm2Art'
  ]) {
    const f = window[name];
    if (typeof f !== 'function') continue;
    window[name] = function () {
      const r = f.apply(this, arguments);
      setDishes();
      return r;
    };
  }
}

// ---------- animali: ridisegnati a mano, stessi fotogrammi e misure ----------
const spr2 = (w, h, fn) => {
  const P = new PX(w, h);
  fn(P);
  P.outline();
  return pxCanvas(P);
};
const ANI = {
  chicken: () =>
    [0, 1, 2].map(f =>
      spr2(24, 22, P => {
        const W = R6b('#f4eee2'),
          Y = R6b('#e8a23a'),
          Rd = R6b('#d8302a'),
          peck = f === 2,
          hx = peck ? 18 : 16,
          hy = peck ? 13 : 6;
        for (const k of [0, 1]) {
          const lx = 10 + k * 3,
            sw = f === 1 ? (k ? 1 : -1) : 0;
          paint2(P, mkM(P).rect(lx + sw, 15, 1, 5), Y, { flat: 1, nc: 1 });
          P.set(lx + sw + 1, 20, Y[2]);
          P.set(lx + sw - 1, 20, Y[2]);
          P.set(lx + sw, 20, Y[3]);
        }
        paint2(
          P,
          mkM(P).poly([
            [2, 4],
            [6, 3],
            [9, 10],
            [5, 13],
            [2, 9]
          ]),
          W,
          { mod: (X, Y_, t) => (X === 4 && Y_ > 5 ? t - 1 : t) }
        );
        paint2(P, mkM(P).ell(11, 12, 7, 5), W);
        paint2(P, mkM(P).ell(10, 12, 4.2, 2.6), W, {
          base: 2,
          mod: (X, Y_, t) => (Y_ === 13 && X % 2 ? 1 : t)
        });
        paint2(P, mkM(P).cap(14, 10, hx, hy + 2, 2.2, 2.6), W);
        paint2(P, mkM(P).ell(hx, hy + 1.5, 3, 3), W);
        for (const dx of [-2, -1, 0]) P.set(hx + dx, hy - 2 + (dx === -1 ? -1 : 0), Rd[3]);
        P.set(hx - 1, hy - 1, Rd[2]);
        P.set(hx + 1, hy + 4, Rd[3]);
        P.set(hx + 1, hy + 5, Rd[2]);
        P.set(hx + 3, hy + 1, Y[4]);
        P.set(hx + 4, hy + 1, Y[3]);
        P.set(hx + 3, hy + 2, Y[2]);
        P.set(hx + 1, hy, C('#14100c'));
        P.set(hx + 1, hy - 1, C('#ffffff'));
      })
    ),
  cat: () =>
    [0, 1, 2, 3].map(f =>
      spr2(30, 22, P => {
        const K = R6b('#3a3446'),
          E = C('#c8e040');
        const ears = (cx, cy) => {
          paint2(
            P,
            mkM(P).poly([
              [cx - 4, cy - 1],
              [cx - 3, cy - 5],
              [cx - 1, cy - 2]
            ]),
            K,
            { thin: 1 }
          );
          paint2(
            P,
            mkM(P).poly([
              [cx + 1, cy - 2],
              [cx + 3, cy - 5],
              [cx + 4, cy - 1]
            ]),
            K,
            { thin: 1 }
          );
          P.set(cx - 3, cy - 3, C('#c88090'));
          P.set(cx + 3, cy - 3, C('#c88090'));
        };
        if (f === 3) {
          paint2(P, mkM(P).ell(15, 16, 10, 5), K);
          paint2(P, mkM(P).cap(6, 19, 16, 20, 1.4), K, { thin: 1 });
          paint2(P, mkM(P).ell(23, 15, 4.2, 3.6), K);
          ears(23, 13);
          P.set(22, 15, K[0]);
          P.set(24, 15, K[0]);
          P.set(23, 16, K[0]);
          return;
        }
        if (f === 2) {
          paint2(P, mkM(P).cap(8, 20, 4, 11, 1.4, 1), K, { thin: 1 });
          paint2(P, mkM(P).ell(14, 15, 5.5, 6), K);
          paint2(P, mkM(P).rect(12, 17, 2, 4), K, { thin: 1 });
          paint2(P, mkM(P).rect(16, 17, 2, 4), K, { thin: 1 });
          paint2(P, mkM(P).ell(16, 8, 4.2, 3.8), K);
          ears(16, 7);
          P.set(14, 8, E);
          P.set(18, 8, E);
          P.set(16, 10, C('#c88090'));
          return;
        }
        const st = f ? 1.5 : -1.5;
        paint2(P, mkM(P).cap(5, 13, 2, 6, 1.3, 1), K, { thin: 1 });
        for (const [x, k] of [
          [9, 1],
          [11, -1],
          [18, 1],
          [20, -1]
        ])
          paint2(P, mkM(P).cap(x, 15, x + st * k, 21, 1.2), k > 0 ? K : K.map(c => c.map(v => v * 0.75)), {
            thin: 1
          });
        paint2(P, mkM(P).ell(14, 14, 8.5, 4.4), K, { mod: (X, Y, t) => (Y < 11 && t < 4 ? 4 : t) });
        paint2(P, mkM(P).ell(24, 10, 4.2, 3.8), K);
        ears(24, 9);
        P.set(26, 10, E);
        P.set(27, 10, C('#14100c'));
        P.set(27, 12, C('#c88090'));
      })
    ),
  crow: () =>
    [0, 1, 2].map(f =>
      spr2(18, 16, P => {
        const K = R6b('#2c2834'),
          Bk = C('#4a4650');
        if (f === 0) {
          P.set(7, 14, C('#c8a040'));
          P.set(10, 14, C('#c8a040'));
          P.set(7, 13, C('#a88030'));
          P.set(10, 13, C('#a88030'));
          paint2(
            P,
            mkM(P).poly([
              [1, 13],
              [4, 9],
              [6, 11],
              [3, 14]
            ]),
            K,
            { thin: 1 }
          );
          paint2(P, mkM(P).ell(8, 10, 4.6, 3.4), K);
          paint2(P, mkM(P).ell(12, 6.5, 2.8, 2.5), K);
          P.set(15, 7, Bk);
          P.set(16, 7, Bk);
          P.set(15, 8, K[1]);
          P.set(13, 6, C('#e8e8e8'));
          return;
        }
        paint2(P, mkM(P).ell(9, 9, 4.6, 2.4), K);
        paint2(P, mkM(P).ell(13.5, 8, 2.2, 2), K);
        P.set(16, 8, Bk);
        P.set(14, 7, C('#e8e8e8'));
        paint2(
          P,
          mkM(P).poly([
            [2, 8],
            [5, 7],
            [5, 10]
          ]),
          K,
          { thin: 1 }
        );
        const wy = f === 1 ? -6 : 5;
        paint2(
          P,
          mkM(P).poly([
            [7, 8],
            [11, 8],
            [6, 8 + wy],
            [4, 8 + wy * 0.8]
          ]),
          K,
          { thin: 1 }
        );
      })
    ),
  duck: () =>
    [0, 1].map(f =>
      spr2(26, 18, P => {
        const b = f ? 1 : 0,
          Br = R6b('#8a6a48'),
          G = R6b('#2a7a4a'),
          Gy = R6b('#a8a8a0'),
          Y = R6b('#e8b030');
        for (let X = 2; X < 23; X++) P.set(X, 16, C('#9cc8e0'), f ? 140 : 90);
        for (let X = 4; X < 20; X += 3) P.set(X + f, 17, C('#d8f0ff'), 120);
        paint2(P, mkM(P).ell(11, 12 + b, 8, 4), Gy, { mod: (X, Y_, t) => (X > 14 ? t : t) });
        paint2(P, mkM(P).ell(15, 12 + b, 4, 3.4), Br);
        paint2(
          P,
          mkM(P).poly([
            [2, 9 + b],
            [6, 10 + b],
            [5, 12 + b]
          ]),
          R6b('#3a3a40'),
          { thin: 1 }
        );
        paint2(P, mkM(P).ell(9, 10.5 + b, 5, 2.2), Gy, { base: 4, thin: 1 });
        paint2(P, mkM(P).cap(16, 10 + b, 18, 6 + b, 1.8), G);
        paint2(P, mkM(P).ell(18.5, 5.5 + b, 3, 2.8), G);
        for (let X = 15; X < 19; X++) P.set(X, 9 + b, C('#f4f4ec'));
        P.set(19, 5 + b, C('#14100c'));
        P.set(21, 6 + b, Y[4]);
        P.set(22, 6 + b, Y[3]);
        P.set(21, 7 + b, Y[2]);
        P.set(22, 7 + b, Y[2]);
      })
    ),
  rabbit: () =>
    [0, 1, 2].map(f =>
      spr2(22, 20, P => {
        const B = R6b('#a8886c'),
          Wh = R6b('#f4eee2'),
          l = f === 1 ? -3 : f === 2 ? -1 : 0,
          s = f === 1 ? 2 : 0;
        if (f !== 1) {
          paint2(P, mkM(P).ell(13, 18.5, 2.2, 1), B, { thin: 1 });
        } else paint2(P, mkM(P).cap(3, 15 + l, 1, 17 + l, 1), B, { thin: 1 });
        paint2(P, mkM(P).ell(9 - s * 0.5, 14 + l, 6 + s, 4.5), B, {
          mod: (X, Y, t) => (Y > 15 + l && X < 10 ? t : t)
        });
        paint2(P, mkM(P).ell(3.5, 13 + l, 2, 2), Wh, { thin: 1 });
        paint2(P, mkM(P).cap(14, 8 + l, 12.5, 1 + l, 1.2), B, { thin: 1 });
        paint2(P, mkM(P).cap(16, 8 + l, 17.5, 2 + l, 1.2), B, { thin: 1 });
        P.set(17, 4 + l, C('#e8b0b0'));
        P.set(13, 4 + l, C('#e8b0b0'));
        paint2(P, mkM(P).ell(15.5, 10 + l, 3.8, 3.2), B);
        P.set(17, 9 + l, C('#14100c'));
        P.set(17, 8 + l, C('#ffffff'));
        P.set(19, 11 + l, C('#e08888'));
      })
    ),
  frog: () =>
    [0, 1].map(f =>
      spr2(14, 10, P => {
        const G = R6b('#5a9a3a');
        paint2(P, mkM(P).ell(7, 7, 5, 2.8), G, { thin: 1 });
        paint2(P, mkM(P).ell(10, 5, 2.2, 1.8), G, { thin: 1 });
        P.set(10, 3, C('#e8e070'));
        P.set(11, 4, C('#14100c'));
        P.set(4, 6, G[1]);
        P.set(7, 6, G[1]);
        if (f) paint2(P, mkM(P).ell(10, 8, 1.8, 1.3), R6b('#e8e0a0'), { thin: 1, nc: 1 });
      })
    ),
  mucca: () =>
    [0, 1].map(f =>
      spr2(28, 22, P => {
        const Wh = R6b('#f2ece0'),
          Bk = R6b('#2a2630'),
          Pk = R6b('#e8a8a0'),
          H = R6b('#d8c8a0');
        for (const [lx, o] of [
          [7, 0],
          [10, 1],
          [18, 0],
          [21, 1]
        ]) {
          const sw = f && o ? 1 : (f ? -1 : 0) * (o ? 0 : 1);
          paint2(P, mkM(P).rect(lx + sw, 14, 2, 7), o ? Wh.map(c => c.map(v => v * 0.8)) : Wh, { thin: 1 });
          P.set(lx + sw, 20, Bk[2]);
          P.set(lx + sw + 1, 20, Bk[2]);
        }
        paint2(P, mkM(P).cap(4, 10, 2, 16, 0.8), Wh, { thin: 1 });
        P.set(2, 17, Bk[2]);
        paint2(P, mkM(P).ell(14, 11, 10, 5.4), Wh, {
          mod: (X, Y, t) => {
            const s =
              Math.hypot(X - 9, Y - 9) < 3.2 ||
              Math.hypot(X - 17, Y - 12) < 3.4 ||
              Math.hypot(X - 13, Y - 7) < 2;
            return s ? Math.max(1, t - 2) + (t > 3 ? 0 : 0) : t;
          }
        });
        for (let X = 0; X < 28; X++)
          for (let Y = 0; Y < 22; Y++) {
            if (!P.has(X, Y)) continue;
            if (Math.hypot(X - 9, Y - 9) < 3.2 || Math.hypot(X - 17, Y - 12) < 3.4)
              P.set(X, Y, Bk[Y < 9 ? 3 : 2]);
          }
        paint2(P, mkM(P).ell(13, 16, 2.4, 1.4), Pk, { thin: 1, nc: 1 });
        paint2(P, mkM(P).ell(23.5, 8, 4, 3.6), Wh);
        paint2(P, mkM(P).ell(25.5, 10.5, 2.6, 1.8), Pk, { thin: 1 });
        P.set(25, 10, Pk[1]);
        P.set(27, 10, Pk[1]);
        P.set(21, 4, H[3]);
        P.set(21, 3, H[4]);
        P.set(26, 4, H[3]);
        P.set(27, 3, H[4]);
        P.set(20, 6, Wh[2]);
        P.set(24, 7, C('#14100c'));
        P.set(24, 6, C('#ffffff'));
      })
    )
};
// cervo e riccio: disegnati a mano (prima erano rettangoli)
const DEER = (() => {
  const B = R6b('#9a6438'),
    Bl = R6b('#c08a58'),
    Wh = R6b('#f2e6d0'),
    An = R6b('#7a5a3a');
  const fr = (head, run, ph) =>
    spr2(36, 48, P => {
      const k = run ? Math.sin(ph) * 3 : 0;
      for (const [lx, o, far] of [
        [9, 1, 1],
        [12, -1, 0],
        [23, -1, 1],
        [26, 1, 0]
      ]) {
        const d = run ? o * k : 0;
        paint2(P, mkM(P).cap(lx, 30, lx + d, 45, 1.4, 1.1), far ? B.map(c => c.map(v => v * 0.75)) : B, {
          thin: 1
        });
        P.set(Math.round(lx + d), 46, C('#2a1a10'));
      }
      paint2(P, mkM(P).ell(18, 26, 12, 6.5), B, { mod: (X, Y, t) => (Y < 23 && t < 4 ? t + 1 : t) });
      paint2(P, mkM(P).ell(18, 29, 8, 2.4), Bl, { nc: 1, thin: 1 });
      for (const [x, y] of [
        [12, 22],
        [16, 21],
        [20, 22],
        [14, 25],
        [19, 24]
      ])
        P.set(x, y, Wh[4]);
      paint2(P, mkM(P).ell(5.5, 22, 2.4, 2.2), Wh, { thin: 1 });
      if (head === 'graze') {
        paint2(P, mkM(P).cap(27, 25, 31, 38, 2.8, 2), B);
        paint2(P, mkM(P).ell(31, 40, 3.2, 2.6), B);
        P.set(32, 39, C('#14100c'));
        paint2(P, mkM(P).ell(28, 36, 1.6, 1), B, { thin: 1 });
      } else {
        paint2(P, mkM(P).cap(27, 24, 29, 12, 3, 2.4), B);
        paint2(P, mkM(P).ell(31, 10, 4.4, 3.4), B);
        P.set(35, 11, C('#14100c'));
        P.set(32, 9, C('#14100c'));
        P.set(32, 8, C('#ffffff'));
        paint2(P, mkM(P).ell(27, 7, 1.6, 2.4), B, { thin: 1 });
        P.set(27, 7, C('#e8b0a0'));
        const A = mkM(P);
        A.cap(29, 6, 28, 0, 0.8);
        A.cap(28, 3, 25, 1, 0.7);
        A.cap(32, 6, 33, 0, 0.8);
        A.cap(33, 3, 35, 1, 0.7);
        paint2(P, A, An, { thin: 1, flat: 1 });
      }
    });
  return {
    stand: fr('up', false, 0),
    graze: fr('graze', false, 0),
    run: [0, 1, 2, 3].map(i => fr('up', true, (i / 4) * Math.PI * 2))
  };
})();
const HOG = (() => {
  const Q = R6b('#5a4a3a'),
    F = R6b('#c8a888');
  const walk = f =>
    spr2(22, 14, P => {
      paint2(P, mkM(P).ell(10, 8, 8, 4.6), Q, {
        mod: (X, Y, t) => ((X + Y * 2) % 3 === 0 && Y < 9 ? t + 1 : (X * 2 + Y) % 4 === 0 ? t - 1 : t)
      });
      for (let X = 4; X < 17; X += 2) P.set(X, 3 + ((X / 2) % 2), Q[4]);
      paint2(P, mkM(P).ell(17.5, 9.5, 3, 2.4), F);
      P.set(21, 10, C('#14100c'));
      P.set(18, 8, C('#14100c'));
      for (const [x, o] of [
        [6, 0],
        [13, 1]
      ])
        P.set(x + (f === o ? 1 : 0), 13, C('#2a1a10'));
    });
  const ball = spr2(16, 14, P => {
    paint2(P, mkM(P).ell(8, 8, 6, 5), Q, { mod: (X, Y, t) => ((X + Y) % 2 === 0 ? t + 1 : t - 1) });
    for (let a = 0; a < 10; a++) {
      const t = (a / 10) * Math.PI * 2;
      P.set(Math.round(8 + Math.cos(t) * 6.5), Math.round(8 + Math.sin(t) * 5.5), Q[5]);
    }
    P.set(9, 3, C('#c02a1a'));
    P.set(10, 3, C('#c02a1a'));
  });
  return { walk: [walk(0), walk(1)], ball };
})();
{
  const setAni = () => {
    try {
      for (const k of ['chicken', 'cat', 'crow', 'duck', 'rabbit', 'frog']) if (CRIT[k]) CRIT[k] = ANI[k]();
      if (AIMG.mucca) AIMG.mucca = ANI.mucca();
    } catch (e) {
      console.error(e);
    }
  };
  for (const name of ['genDeco', 'genCritters', 'genAnimalArt']) {
    const f = window[name];
    if (typeof f !== 'function') continue;
    window[name] = function () {
      const r = f.apply(this, arguments);
      setAni();
      return r;
    };
  }
}

// ---------- il Cavaliere senza testa ----------
const HORSEMAN = (() => {
  const HB = R6b('#1e1826'),
    HBd = HB.map(c => c.map(v => v * 0.72)),
    MN = R6b('#2a1420'),
    AR = R6b('#2a2a34'),
    CO = R6b('#141018'),
    RD = R6b('#8a0e14'),
    RD2 = R6b('#c41a1a'),
    ST = R6b('#b8c0c8'),
    HF = R6b('#4a4a54');
  const frame = f =>
    spr2(88, 80, P => {
      const legs = f
        ? [
            [56, 50, 62, 58, 58, 67, 1],
            [52, 50, 54, 64, 58, 76, 0],
            [24, 50, 28, 62, 34, 72, 1],
            [28, 50, 22, 64, 18, 76, 0]
          ]
        : [
            [56, 50, 66, 62, 72, 72, 1],
            [52, 50, 56, 62, 53, 76, 0],
            [24, 50, 14, 61, 7, 71, 1],
            [28, 50, 30, 64, 28, 76, 0]
          ];
      // coda
      for (let i = 0; i < 7; i++)
        paint2(
          P,
          mkM(P).cap(19, 37 + i, 4 - (f ? 3 : 0) + i * 0.6, 50 + i * 2.2 + (f ? -2 : 0), 1.4, 0.6),
          i % 3 === 1 ? RD : MN,
          { thin: 1 }
        );
      // mantello: fodera rosso sangue sotto, nero sopra, sfilacciato
      const capeM = mkM(P).poly([
        [33, 9],
        [40, 10],
        [34, 30],
        [22, 42],
        [14, 46 - (f ? 4 : 0)],
        [6, 40 - (f ? 5 : 0)],
        [12, 30],
        [22, 18]
      ]);
      for (let X = 0; X < 88; X++) {
        const cut = 40 - (f ? 4 : 0) + ((X * 7) % 5) + (X % 3 ? 2 : 0);
        for (let Y = cut; Y < 80; Y++) capeM.a[Y * 88 + X] = 0;
      }
      paint2(P, capeM, RD2, { mod: (X, Y, t) => ((X + Y * 2 + f * 3) % 7 === 0 ? t - 1 : t) });
      paint2(
        P,
        mkM(P).poly([
          [33, 9],
          [40, 10],
          [36, 20],
          [24, 30],
          [12, 34 - (f ? 3 : 0)],
          [8, 30 - (f ? 4 : 0)],
          [18, 20],
          [26, 13]
        ]),
        CO,
        { mod: (X, Y, t) => ((X + Y * 3) % 9 === 0 ? t + 1 : t) }
      );
      // zampe lontane
      for (const [a, b, c, d, e, g, far] of legs)
        if (far) {
          paint2(P, mkM(P).cap(a, b, c, d, 3.4, 2.4).cap(c, d, e, g, 2.4, 2), HBd, { thin: 1 });
          paint2(P, mkM(P).rect(e - 2, g, 5, 3), HF, { thin: 1 });
        }
      // corpo
      paint2(P, mkM(P).ell(40, 44, 22, 10), HB, {
        mod: (X, Y, t) => {
          if (Y < 38 && t < 4) t++;
          if ((X * 5 + Y * 3) % 23 === 0) t--;
          return t;
        }
      });
      for (let X = 22; X < 58; X += 5) P.set(X, 46 + ((X / 5) % 2), HB[1]);
      // gualdrappa
      paint2(
        P,
        mkM(P).poly([
          [30, 34],
          [48, 34],
          [50, 46],
          [46, 50],
          [42, 47],
          [38, 51],
          [34, 47],
          [30, 49]
        ]),
        RD,
        { mod: (X, Y, t) => (Y === 35 ? t + 1 : t) }
      );
      for (let X = 30; X < 50; X += 2) P.set(X, 36, R6b('#d8a84a')[3]);
      // collo e testa
      paint2(P, mkM(P).cap(54, 40, 66, 18, 8, 5), HB, { mod: (X, Y, t) => Math.min(t, 3) });
      paint2(P, mkM(P).rot(75, 18, 11, 5.2, 0.55), HB);
      paint2(P, mkM(P).rot(81, 23, 4, 3, 0.5), HB, { base: 2 });
      paint2(
        P,
        mkM(P).poly([
          [64, 12],
          [66, 4],
          [69, 11]
        ]),
        HB,
        { thin: 1 }
      );
      paint2(
        P,
        mkM(P).poly([
          [67, 12],
          [71, 5],
          [72, 13]
        ]),
        HB,
        { thin: 1 }
      );
      P.set(83, 24, C('#ff3020'));
      P.set(84, 25, C('#8a0e14'));
      for (let X = 76; X < 84; X++) P.set(X, 26 + Math.floor((X - 76) / 3), C('#0a0608'));
      P.set(79, 27, C('#e8e0d0'));
      P.set(81, 27, C('#e8e0d0'));
      P.set(72, 14, C('#ff2a1a'));
      P.set(73, 14, C('#ffb060'));
      P.set(72, 15, C('#a01010'));
      P.set(71, 13, HB[1]);
      P.set(73, 13, HB[1]);
      // criniera selvaggia
      for (let i = 0; i < 11; i++) {
        const x0 = 57 + i * 1.0,
          y0 = 34 - i * 2.2,
          len = 4 + (i % 3) * 1.6 + (f ? 1 : 0);
        paint2(
          P,
          mkM(P).cap(x0, y0, x0 - len, y0 - len * 0.35 - (i % 2) + f, 1.7, 0.5),
          i % 4 === 2 ? RD : MN,
          { thin: 1 }
        );
      }
      // zampe vicine
      for (const [a, b, c, d, e, g, far] of legs)
        if (!far) {
          paint2(P, mkM(P).cap(a, b, c, d, 3.6, 2.6).cap(c, d, e, g, 2.6, 2), HB, { thin: 1 });
          paint2(P, mkM(P).rect(e - 2, g, 5, 3), HF, { thin: 1, mod: (X, Y, t) => (Y === g ? t + 1 : t) });
        }
      // cavaliere: gamba e stivale
      paint2(P, mkM(P).cap(40, 32, 46, 44, 3.2, 2.6).cap(46, 44, 44, 50, 2.6, 2.4), AR);
      paint2(P, mkM(P).rect(42, 49, 6, 3), CO, { thin: 1 });
      // busto corazzato
      paint2(
        P,
        mkM(P).poly([
          [32, 12],
          [46, 11],
          [47, 22],
          [44, 33],
          [34, 33],
          [32, 22]
        ]),
        AR,
        {
          mod: (X, Y, t) => {
            if (Y === 20 || Y === 27) t--;
            if (X === 39 && Y > 13) t--;
            return t;
          }
        }
      );
      paint2(P, mkM(P).ell(45, 13, 4, 3.4), AR, { mod: (X, Y, t) => (Y === 13 ? t - 1 : t) });
      paint2(P, mkM(P).ell(33, 13, 3.4, 3), AR, { base: 2 });
      for (let X = 33; X < 46; X++) P.set(X, 32, R6b('#5a1a1a')[3]);
      P.set(39, 32, R6b('#d8a84a')[4]);
      // braccio e spada
      paint2(P, mkM(P).cap(45, 14, 53, 21, 2.6, 2.2), AR);
      paint2(P, mkM(P).ell(54, 21, 2.4, 2.2), CO, { thin: 1 });
      for (let i = 0; i < 28; i++) {
        const x = 55 + i,
          y = 19 - Math.round(i * 0.53);
        P.set(x, y, ST[4]);
        P.set(x, y + 1, ST[2]);
        if (i > 24) P.set(x, y, ST[5]);
      }
      paint2(P, mkM(P).cap(52, 16, 56, 23, 1), R6b('#6a5a3a'), { thin: 1, flat: 1 });
      // nessuna testa: colletto e moncone
      paint2(P, mkM(P).ell(39, 10, 5, 2.6), CO, { thin: 1 });
      paint2(P, mkM(P).ell(39, 9, 3.4, 1.6), RD, { thin: 1, nc: 1 });
      P.set(38, 9, RD2[5]);
      P.set(39, 9, RD2[4]);
      P.set(40, 8, C('#3a0408'));
      for (let i = 0; i < 3; i++) P.set(36 + i * 2, 11 + (i % 2), RD2[3]);
    });
  return [frame(0), frame(1)];
})();
{
  const _pp = genPropsHD;
  genPropsHD = function () {
    const r = _pp.apply(this, arguments);
    IMG.horse = HORSEMAN;
    return r;
  };
}
// bagliori sopra al buio: occhio rosso del cavallo, braci dal collo mozzato, alito
{
  Ext.on('drawAmbTop', function (m) {
    try {
      const h = G.horse;
      if (!h || !h.on || m.id !== 'main') return;
      const fl = h.dir === 1 ? -1 : 1,
        T = G.t,
        bx = h.x,
        by = h.y;
      const ex = bx + fl * 14,
        ey = by - 31,
        g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 6);
      g.addColorStop(0, 'rgba(255,60,30,.9)');
      g.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ex - 6, ey - 6, 12, 12);
      const nx = bx + fl * -2.5,
        ny = by - 34;
      for (let i = 0; i < 9; i++) {
        const k = (T * 1.6 + i / 9) % 1,
          x = nx + Math.sin(T * 3 + i * 2.3) * 2 * k - fl * k * 9,
          y = ny - k * 14,
          a = 1 - k;
        ctx.fillStyle = `rgba(${255},${(90 + 80 * (1 - k)) | 0},${30},${(a * 0.85).toFixed(2)})`;
        ctx.fillRect(Math.round(x * 2) / 2, Math.round(y * 2) / 2, k < 0.3 ? 1 : 0.5, k < 0.3 ? 1 : 0.5);
      }
      const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 9);
      ng.addColorStop(0, 'rgba(220,30,20,.45)');
      ng.addColorStop(1, 'rgba(120,0,0,0)');
      ctx.fillStyle = ng;
      ctx.fillRect(nx - 9, ny - 9, 18, 18);
      if (Math.floor(T * 2) % 3 === 0) {
        const k = (T * 2) % 1,
          sx = bx + fl * (20 + k * 6),
          sy = by - 26 + k * 2;
        ctx.fillStyle = `rgba(200,200,210,${(0.3 * (1 - k)).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + k * 3, 0, 7);
        ctx.fill();
      }
    } catch (e) {}
  });
}
// suono tutto suo: drone, coro dissonante, nitrito demoniaco distorto, zoccoli, lama
{
  const curve = (() => {
    const n = 1024,
      c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / n) * 2 - 1;
      c[i] = Math.tanh(x * 6);
    }
    return c;
  })();
  const neigh = (a, t, pitch = 1, vol = 0.22) => {
    const c = a.c,
      o = c.createOscillator(),
      o2 = c.createOscillator(),
      lfo = c.createOscillator(),
      lg = c.createGain(),
      ws = c.createWaveShaper(),
      bp = c.createBiquadFilter(),
      bp2 = c.createBiquadFilter(),
      g = c.createGain();
    o.type = 'sawtooth';
    o2.type = 'square';
    lfo.frequency.value = 17;
    lg.gain.value = 55 * pitch;
    lfo.connect(lg);
    lg.connect(o.frequency);
    lg.connect(o2.frequency);
    const fp = (o_, k) => {
      o_.frequency.setValueAtTime(260 * pitch * k, t);
      o_.frequency.exponentialRampToValueAtTime(980 * pitch * k, t + 0.22);
      o_.frequency.exponentialRampToValueAtTime(620 * pitch * k, t + 0.6);
      o_.frequency.exponentialRampToValueAtTime(170 * pitch * k, t + 1.5);
    };
    fp(o, 1);
    fp(o2, 0.5);
    ws.curve = curve;
    bp.type = 'bandpass';
    bp.frequency.value = 1300;
    bp.Q.value = 2.5;
    bp2.type = 'bandpass';
    bp2.frequency.value = 480;
    bp2.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.06);
    g.gain.setValueAtTime(vol, t + 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(ws);
    o2.connect(ws);
    ws.connect(bp);
    ws.connect(bp2);
    bp.connect(g);
    bp2.connect(g);
    g.connect(a.sfx);
    g.connect(a.rev);
    for (const n of [o, o2, lfo]) {
      n.start(t);
      n.stop(t + 1.7);
    }
  };
  SFX.cavaliere = (a, t) => {
    a.osc('sine', 41, t, 3.6, 0.5, a.sfx, 0.6);
    a.osc('sine', 43.6, t, 3.6, 0.4, a.sfx, 0.6);
    [110, 116.5, 155.6, 164.8, 233].forEach((f, i) => {
      const g = a.osc('sawtooth', f, t + 0.1 + i * 0.05, 3, 0.035, a.sfx, 0.9);
      g.connect(a.rev);
    });
    a.noise(t, 1.2, 0.12, 'bandpass', 300, 2, null, 1, 2400);
    neigh(a, t + 0.45, 1, 0.2);
    neigh(a, t + 0.47, 0.5, 0.16);
    for (let i = 0; i < 9; i++) {
      const d = 1.9 + Math.floor(i / 3) * 0.38 + (i % 3) * 0.09;
      a.noise(t + d, 0.07, 0.6, 'lowpass', 190);
      a.osc('sine', 48, t + d, 0.09, 0.55);
    }
    a.noise(t + 0.3, 0.5, 0.06, 'bandpass', 3200, 8, null, 0.01, 6800);
    for (let i = 0; i < 5; i++)
      a.noise(t + 2.6 + i * 0.16, 0.2, 0.05, 'bandpass', 900 + Math.random() * 1800, 5);
  };
  SFX.nitrito = (a, t) => {
    neigh(a, t, 0.9 + Math.random() * 0.2, 0.16);
    neigh(a, t + 0.02, 0.47, 0.12);
    a.osc('sine', 46, t, 1.4, 0.3, a.sfx, 0.2);
  };
  const _sp = spawnHorse;
  spawnHorse = function () {
    const r = _sp.apply(this, arguments);
    try {
      AU.play('cavaliere');
    } catch (e) {}
    return r;
  };
  let nt = 6;
  const _uh = updateHorse;
  updateHorse = function (dt) {
    const r = _uh.apply(this, arguments);
    try {
      if (G.horse && G.horse.on) {
        nt -= dt;
        if (nt <= 0) {
          nt = 6 + Math.random() * 5;
          AU.play('nitrito');
        }
      }
    } catch (e) {}
    return r;
  };
}

// =====================================================================
// MONDO VIVO: foglie dagli alberi, neve che si posa, pupazzi e palle di neve,
// abitanti che reagiscono a stagione, ora e tempo. Tutto in memoria (non tocca i salvataggi).
// =====================================================================
const VIVO = { tl: [], gl: [], balls: [], snowmen: [], lv: null, emo: new Map(), fight: 4, pick: 0 };
const isWinter = () => {
  try {
    return isFree(G.st) && seasonOf(G.st) === 1;
  } catch (e) {
    return false;
  }
};
const isAutumn = () => {
  try {
    return !isFree(G.st) || seasonOf(G.st) === 0;
  } catch (e) {
    return true;
  }
};
const snowTarget = () => (G.st && G.st.weather === 'neve' ? 1 : isWinter() ? 0.6 : 0);
const SNOWTEX = (() => {
  const [c, x] = mk(64, 64);
  x.fillStyle = '#eef3fa';
  x.fillRect(0, 0, 64, 64);
  srand(77);
  for (let i = 0; i < 260; i++) {
    x.fillStyle = ['#dfe7f3', '#ffffff', '#cfdbec', '#f6f9ff'][ri(0, 3)];
    x.fillRect(ri(0, 63), ri(0, 63), ri(1, 3), 1);
  }
  for (let i = 0; i < 10; i++) {
    x.fillStyle = 'rgba(170,190,220,.35)';
    x.fillRect(ri(0, 60), ri(0, 62), ri(3, 7), 1);
  }
  return c;
})();
let SNOWPAT = null;
const capCache = new WeakMap();
function snowCap(img, big) {
  let c = capCache.get(img);
  if (c !== undefined) return c;
  try {
    const w = img.width,
      h = img.height,
      d = img.getContext('2d').getImageData(0, 0, w, h).data,
      o = document.createElement('canvas');
    o.width = w;
    o.height = h;
    o.s = img.s;
    const x = o.getContext('2d');
    let any = false;
    for (let X = 0; X < w; X++) {
      for (let Y = 0; Y < h; Y++) {
        const a = d[(Y * w + X) * 4 + 3],
          up = Y ? d[((Y - 1) * w + X) * 4 + 3] : 0;
        if (a > 200 && up < 40) {
          const th =
            (big ? 16 + ((X * 5) % 4) + Math.round(Math.sin(X * 0.33) * 3) : 3 + ((X * 7) % 3)) +
            (Math.sin(X * 0.7) > 0.6 ? 2 : 0);
          for (let k = 0; k < th; k++) {
            if (d[((Y + k) * w + X) * 4 + 3] < 200) break;
            x.fillStyle = k === 0 ? '#ffffff' : k < th - 1 ? '#eef3fa' : '#c8d4e6';
            x.fillRect(X, Y + k, 1, 1);
          }
          any = true;
          if (Y > h * 0.6) break;
        }
      }
    }
    c = any ? o : null;
  } catch (e) {
    c = null;
  }
  capCache.set(img, c);
  return c;
}
const SNOWMAN = [0, 1, 2].map(st =>
  spr2(32, 48, P => {
    const S = R6b('#e8eef8');
    paint2(P, mkM(P).ell(16, 40, 10, 7.5), S);
    if (st >= 1) paint2(P, mkM(P).ell(16, 28, 7.5, 6), S);
    if (st >= 2) {
      paint2(P, mkM(P).ell(16, 18, 5.5, 5), S);
      paint2(P, mkM(P).rect(10, 20, 12, 3), R6b('#c83030'), { thin: 1 });
      paint2(P, mkM(P).rect(18, 22, 3, 6), R6b('#c83030'), { thin: 1 });
      P.set(14, 17, C('#1a1418'));
      P.set(18, 17, C('#1a1418'));
      paint2(
        P,
        mkM(P).poly([
          [16, 18],
          [22, 19],
          [16, 20]
        ]),
        R6b('#e8782a'),
        { thin: 1, nc: 1 }
      );
      for (const y of [27, 31, 35]) P.set(16, y, C('#1a1418'));
      paint2(P, mkM(P).rect(11, 9, 10, 6), R6b('#2a2630'), { thin: 1 });
      paint2(P, mkM(P).rect(9, 14, 14, 2), R6b('#2a2630'), { thin: 1 });
      for (let i = 0; i < 8; i++) {
        P.set(8 - i, 27 - Math.round(i * 0.6), C('#6a4a2a'));
        P.set(24 + i, 27 - Math.round(i * 0.7), C('#6a4a2a'));
      }
      P.set(2, 22, C('#6a4a2a'));
      P.set(30, 21, C('#6a4a2a'));
    }
  })
);
// glifi delle emozioni
const EMO = {
  snow: ['..#..', '#.#.#', '.###.', '#.#.#', '..#..'],
  drop: ['..#..', '.###.', '#####', '#####', '.###.'],
  note: ['..##', '..#.', '..#.', '###.', '##..'],
  z: ['####', '..#.', '.#..', '####', '....'],
  leaf: ['..##', '.###', '###.', '##..', '#...'],
  sun: ['#.#.#', '.###.', '##.##', '.###.', '#.#.#']
};
const EMOC = {
  snow: '#a8d0ff',
  drop: '#5aa8e8',
  note: '#3a2a1a',
  z: '#4a4a8a',
  leaf: '#d86a1e',
  sun: '#e8a020'
};
function drawEmo(k, X, Y) {
  const g = EMO[k];
  ctx.fillStyle = 'rgba(255,250,240,.92)';
  ctx.fillRect(X - 4, Y - 4, 8, 8);
  ctx.fillRect(X - 3, Y - 5, 6, 10);
  ctx.fillRect(X - 5, Y - 3, 10, 6);
  ctx.fillRect(X - 1, Y + 4, 2, 2);
  ctx.fillStyle = EMOC[k];
  for (let r = 0; r < g.length; r++)
    for (let c = 0; c < g[r].length; c++) if (g[r][c] === '#') ctx.fillRect(X - 2.5 + c, Y - 2.5 + r, 1, 1);
}
function npcEmoKind() {
  const st = G.st,
    t = st.time,
    wx = st.weather,
    s = isFree(st) ? seasonOf(st) : 0;
  if (t >= 22 * 60 || t < 6 * 60) return 'z';
  if (wx === 'neve' || s === 1) return 'snow';
  if (wx === 'pioggia') return 'drop';
  if (s === 3 && t >= 12 * 60 && t < 17 * 60) return 'sun';
  if (s === 2 && t < 12 * 60) return 'note';
  if (s === 0) return Math.random() < 0.5 ? 'leaf' : 'note';
  return 'note';
}

// ---- aggiornamento (solo stato visivo) ----
{
  const _up = updParts;
  updParts = function (dt) {
    const r = _up.apply(this, arguments);
    try {
      if (G.mode === 'game' && !UI.modalOpen) vivoTick(dt);
    } catch (e) {
      console.error(e);
    }
    return r;
  };
}
function vivoTick(dt) {
  const m = G.map;
  if (!m || !G.st) return;
  const out = !m.interior && m.id === 'main';
  // livello di neve
  const tg = snowTarget();
  if (VIVO.lv == null) VIVO.lv = tg * 0.85;
  VIVO.lv += clamp(tg - VIVO.lv, -dt * 0.008, dt * 0.02);
  // foglie che si staccano dalle chiome
  if (
    out &&
    isAutumn() &&
    G.night < 0.6 &&
    G.horror < 0.6 &&
    VIVO.tl.length < 40 &&
    Math.random() < dt * 2.2
  ) {
    const trees = m.objs.filter(
      o =>
        o.img &&
        o.img.canopyH &&
        o.dx > G.cam.x - 20 &&
        o.dx < G.cam.x + W &&
        o.dy > G.cam.y - 60 &&
        o.dy < G.cam.y + H
    );
    if (trees.length) {
      const o = trees[(Math.random() * trees.length) | 0],
        w = iw(o.img),
        ch = o.img.canopyH;
      VIVO.tl.push({
        x: o.dx + w * 0.2 + Math.random() * w * 0.6,
        y: o.dy + ch * 0.25 + Math.random() * ch * 0.5,
        gy: o.sy + 2 + Math.random() * 16,
        vx: -4 - Math.random() * 6,
        t: 0,
        ph: Math.random() * 6,
        c: leafCol()
      });
    }
  }
  for (const l of VIVO.tl) {
    l.t += dt;
    l.x += (l.vx + Math.sin(l.t * 2.2 + l.ph) * 12) * dt;
    l.y += (9 + Math.sin(l.t * 3 + l.ph) * 4) * dt;
    if (l.y >= l.gy) {
      l.done = 1;
      VIVO.gl.push({ x: l.x, y: l.gy, c: l.c, t: 0, r: (Math.random() * 3) | 0 });
    }
  }
  VIVO.tl = VIVO.tl.filter(l => !l.done);
  for (const g of VIVO.gl) g.t += dt;
  VIVO.gl = VIVO.gl.filter(g => g.t < 40);
  if (VIVO.gl.length > 160) VIVO.gl.splice(0, VIVO.gl.length - 160);
  // palle di neve
  for (const b of VIVO.balls) {
    b.t += dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z += b.vz * dt;
    b.vz -= 160 * dt;
    const tgts = [];
    if (b.from !== 'player' && G.mode === 'game') tgts.push(['player', G.player]);
    for (const n of G.npcs) if (!n.hidden && n.map === m.id && n.id !== b.from) tgts.push([n.id, n]);
    for (const [id, e] of tgts) {
      if (Math.hypot(e.x - b.x, e.y - b.y) < 7 && b.z < 24) {
        b.hit = id;
        b.done = 1;
        snowSplash(b.x, b.y - b.z);
        if (id === 'player') {
          G.shake = Math.max(G.shake, 1.5);
          floatText('Preso!', e.x, e.y - 30, '#e8f4ff', 1);
        } else {
          VIVO.emo.set(id, { k: 'snow', t: 2.2 });
          if (b.from === 'player' && Math.random() < 0.85)
            setTimeout(
              () => {
                try {
                  if (G.map === m) throwBall(e, G.player, id);
                } catch (_) {}
              },
              500 + Math.random() * 500
            );
          if (Math.random() < 0.5)
            bubble(
              e,
              ['Ehi!', 'Ah! Fredda!', 'Te la restituisco!', 'Ahah!', 'Così non vale!'][
                (Math.random() * 5) | 0
              ],
              1.6
            );
        }
        break;
      }
    }
    if (b.z <= 0 && !b.done) {
      b.done = 1;
      snowSplash(b.x, b.y);
    }
  }
  VIVO.balls = VIVO.balls.filter(b => !b.done && b.t < 3);
  // pupazzi che si sciolgono
  if (VIVO.lv < 0.15 && VIVO.snowmen.length) {
    for (const s of VIVO.snowmen) {
      try {
        mapRemove(s.m, s.o);
      } catch (e) {}
    }
    VIVO.snowmen = [];
  }
  // abitanti: battaglie di neve fra loro, emozioni, fiato nel freddo
  if (out && VIVO.lv > 0.3 && G.night < 0.5 && !G.cut) {
    VIVO.fight -= dt;
    if (VIVO.fight <= 0) {
      VIVO.fight = 4 + Math.random() * 6;
      const N = G.npcs.filter(
        n =>
          !n.hidden &&
          n.map === 'main' &&
          !n.script &&
          Math.abs(n.x - G.cam.x - W / 2) < W / 2 + 20 &&
          Math.abs(n.y - G.cam.y - H / 2) < H / 2 + 20
      );
      for (const a of N) {
        const b = N.find(
          q => q !== a && Math.hypot(q.x - a.x, q.y - a.y) < 90 && Math.hypot(q.x - a.x, q.y - a.y) > 16
        );
        if (b) {
          throwBall(a, b, a.id);
          break;
        }
      }
    }
  }
  for (const [k, v] of VIVO.emo) {
    v.t -= dt;
    if (v.t <= 0) VIVO.emo.delete(k);
  }
  if (out && !G.cut && Math.random() < dt * 0.35) {
    const N = G.npcs.filter(
      n =>
        !n.hidden &&
        n.map === 'main' &&
        !VIVO.emo.has(n.id) &&
        Math.abs(n.x - G.cam.x - W / 2) < W / 2 &&
        Math.abs(n.y - G.cam.y - H / 2) < H / 2
    );
    if (N.length) {
      const n = N[(Math.random() * N.length) | 0];
      VIVO.emo.set(n.id, { k: npcEmoKind(), t: 2.4 });
    }
  }
  const cold = out && (isWinter() || G.st.weather === 'neve' || (G.st.time < 8 * 60 && isAutumn()));
  if (cold && Math.random() < dt * 2.5) {
    const L = [G.player, ...G.npcs.filter(n => !n.hidden && n.map === 'main')].filter(
      e => Math.abs(e.x - G.cam.x - W / 2) < W / 2 && Math.abs(e.y - G.cam.y - H / 2) < H / 2
    );
    if (L.length) {
      const e = L[(Math.random() * L.length) | 0],
        dx = e.dir === 2 ? 1 : e.dir === 1 ? -1 : 0,
        dy = e.dir === 0 ? 1 : e.dir === 3 ? -1 : 0;
      G.parts.push({
        k: 'breath',
        x: e.x + dx * 5,
        y: e.y - 17 + dy * 2,
        vx: dx * 6 + (Math.random() - 0.5) * 3,
        vy: -3,
        t: 0,
        life: 1.1
      });
    }
  }
}
function snowSplash(x, y) {
  for (let i = 0; i < 7; i++)
    G.parts.push({
      k: 'snowbit',
      x,
      y,
      vx: (Math.random() - 0.5) * 40,
      vy: -15 - Math.random() * 25,
      t: 0,
      life: 0.5
    });
  try {
    AU.play('step');
  } catch (e) {}
}
function throwBall(from, to, fid) {
  const dx = to.x - from.x,
    dy = to.y - from.y,
    d = Math.hypot(dx, dy) || 1,
    sp = 120,
    T = d / sp;
  VIVO.balls.push({
    x: from.x,
    y: from.y - 2,
    vx: (dx / d) * sp,
    vy: (dy / d) * sp,
    z: 14,
    vz: Math.max(30, 80 * T - 14 / T),
    t: 0,
    from: fid
  });
}
function canSnowPlay() {
  return (
    G.mode === 'game' &&
    !G.cut &&
    !UI.busy() &&
    G.map &&
    G.map.id === 'main' &&
    !G.map.interior &&
    VIVO.lv > 0.25 &&
    !G.visit
  );
}
function playerThrow() {
  if (!canSnowPlay()) return;
  const p = G.player,
    [dx, dy] = DIRV[p.dir];
  const tg = { x: p.x + dx * 90, y: p.y + dy * 90 };
  const N = G.npcs
    .filter(n => !n.hidden && n.map === 'main' && Math.hypot(n.x - p.x, n.y - p.y) < 110)
    .sort((a, b) => Math.hypot(a.x - tg.x, a.y - tg.y) - Math.hypot(b.x - tg.x, b.y - tg.y))[0];
  const aim = N && Math.hypot(N.x - tg.x, N.y - tg.y) < 60 ? N : tg;
  throwBall(p, aim, 'player');
  AU.play('rustle');
}
function playerSnowman() {
  if (!canSnowPlay()) return;
  const m = G.map,
    [tx, ty] = frontTile(),
    k = tx + ',' + ty;
  const ex = VIVO.snowmen.find(s => s.tx === tx && s.ty === ty);
  if (ex) {
    if (ex.st < 2) {
      ex.st++;
      mapRemove(m, ex.o);
      ex.o = m.add(OB('snowman', tx, ty, SNOWMAN[ex.st], { solid: [[tx, ty]], hits: [] }));
      AU.play(ex.st === 2 ? 'ok' : 'rustle');
      if (ex.st === 2) {
        burst('spark', tx * 16 + 8, ty * 16 - 10, 8, '#ffffff');
        UI.toast('Un pupazzo di neve! Gli manca solo il nome.');
        Dialoghi.evento('pupazzo', {});
      }
    }
    return;
  }
  if (m.solid(tx, ty) || m.hit[k] || VIVO.snowmen.length >= 6) {
    UI.toast("Qui non c'è posto per un pupazzo.");
    return;
  }
  const o = m.add(OB('snowman', tx, ty, SNOWMAN[0], { solid: [[tx, ty]], hits: [] }));
  VIVO.snowmen.push({ m, o, tx, ty, st: 0 });
  AU.play('rustle');
  UI.toast('Rotoli una palla di neve. Premi ancora per finire il pupazzo.');
}
addEventListener('keydown', e => {
  if (e.repeat || (e.target && e.target.tagName === 'INPUT')) return;
  if (e.code === 'KeyQ') playerThrow();
  if (e.code === 'KeyG') playerSnowman();
});
// pulsante ❄ sul telefono: tocco = palla di neve, tieni premuto = pupazzo
{
  const b = document.createElement('button');
  b.id = 'bSnow';
  b.textContent = '❄';
  b.title = 'Tocca: palla di neve · Tieni premuto: pupazzo (Q / G)';
  Object.assign(b.style, {
    position: 'absolute',
    right: 'calc(70*var(--u))',
    bottom: 'calc(70*var(--u))',
    width: 'calc(28*var(--u))',
    height: 'calc(28*var(--u))',
    borderRadius: '50%',
    border: '0',
    background: 'radial-gradient(circle at 35% 30%,#ffffff,#b8d4f0 50%,#5a7aa8 90%)',
    color: '#2a4a7a',
    fontSize: 'calc(14*var(--u))',
    display: 'none',
    pointerEvents: 'auto'
  });
  let ht = null,
    long = false;
  b.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    long = false;
    ht = setTimeout(() => {
      long = true;
      playerSnowman();
    }, 450);
  });
  b.addEventListener('pointerup', e => {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(ht);
    if (!long) playerThrow();
  });
  addEventListener('load', () => {
    const t = document.getElementById('touch');
    if (t) t.appendChild(b);
  });
  if (document.getElementById('touch')) document.getElementById('touch').appendChild(b);
  setInterval(() => {
    const on = IN.touch && canSnowPlay();
    b.style.display = on ? 'block' : 'none';
  }, 500);
}

// ---- disegno: a terra (prima degli oggetti) ----
{
  const _pr = drawPrints;
  drawPrints = function (m, dt) {
    try {
      if (!m.interior && m.id === 'main') {
        const cx = G.cam.x,
          cy = G.cam.y;
        // tappeto di foglie sotto gli alberi d'autunno
        if (isAutumn()) {
          for (const o of m.objs) {
            if (
              !o.img ||
              !o.img.canopyH ||
              o.dx > cx + W + 20 ||
              o.dx + 40 < cx - 20 ||
              o.sy < cy - 10 ||
              o.sy > cy + H + 30
            )
              continue;
            const bx = o.dx + iw(o.img) / 2,
              by = o.sy;
            for (let i = 0; i < 14; i++) {
              const h = hsh(o.tx * 31 + i, o.ty * 17 + i),
                x = bx + ((h % 40) - 20),
                y = by - 3 + ((h >> 6) % 12);
              ctx.fillStyle = ['#c8642a', '#e09a3a', '#a8401e', '#d8b048'][(h >> 3) % 4];
              ctx.fillRect(x, y, (h >> 9) % 2 ? 1.5 : 1, 1);
            }
          }
        }
        for (const g of VIVO.gl) {
          const a = Math.min(1, (40 - g.t) / 6);
          ctx.globalAlpha = a;
          ctx.fillStyle = g.c;
          ctx.fillRect(g.x, g.y, g.r === 0 ? 2 : 1.5, g.r === 2 ? 1.5 : 1);
          ctx.fillStyle = 'rgba(0,0,0,.2)';
          ctx.fillRect(g.x + 0.5, g.y + 1, 1, 0.5);
          ctx.globalAlpha = 1;
        }
        // manto di neve
        if (VIVO.lv > 0.02) {
          if (!SNOWPAT) SNOWPAT = ctx.createPattern(SNOWTEX, 'repeat');
          ctx.save();
          ctx.globalAlpha = clamp(VIVO.lv * 0.9, 0, 0.88);
          ctx.fillStyle = SNOWPAT;
          ctx.fillRect(cx, cy, W, H);
          ctx.restore();
        }
      }
    } catch (e) {
      ctx.globalAlpha = 1;
    }
    return _pr.apply(this, arguments);
  };
}
// ---- disegno: sopra gli oggetti ----
{
  Ext.on('drawWorldExtras', function (m) {
    try {
      if (m.interior || m.id !== 'main') return;
      const cx = G.cam.x,
        cy = G.cam.y;
      // neve sui tetti e sulle costruzioni
      if (VIVO.lv > 0.2) {
        ctx.globalAlpha = clamp((VIVO.lv - 0.2) * 1.6, 0, 1);
        for (const o of m.objs) {
          if (
            !o.img ||
            (o.kind !== 'bld' &&
              o.kind !== 'built' &&
              o.kind !== 'museo' &&
              o.kind !== 'fence' &&
              o.kind !== 'post')
          )
            continue;
          if (o.dx > cx + W || o.dx + iw(o.img) < cx || o.dy > cy + H || o.dy + ih(o.img) < cy) continue;
          const c = snowCap(o.img, o.kind !== 'fence' && o.kind !== 'post');
          if (c) ctx.drawImage(c, Math.round(o.dx), Math.round(o.dy), iw(o.img), ih(o.img));
        }
        ctx.globalAlpha = 1;
      }
      // foglie in caduta
      for (const l of VIVO.tl) {
        const r = Math.sin(l.t * 3 + l.ph);
        ctx.fillStyle = l.c;
        if (r > 0.3) ctx.fillRect(l.x, l.y, 2, 1.5);
        else if (r > -0.3) ctx.fillRect(l.x, l.y, 1.5, 1.5);
        else ctx.fillRect(l.x + 0.5, l.y, 1, 2);
      }
      // palle di neve in volo
      for (const b of VIVO.balls) {
        ctx.fillStyle = 'rgba(0,0,0,.2)';
        ctx.fillRect(b.x - 1.5, b.y, 3, 1);
        ctx.fillStyle = '#c8d4e6';
        ctx.fillRect(b.x - 1.5, b.y - b.z - 1.5, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x - 1.5, b.y - b.z - 1.5, 2, 2);
      }
      // abitanti: emozioni e lanterne di notte
      for (const n of G.npcs) {
        if (n.hidden || n.map !== 'main') continue;
        if (n.x < cx - 20 || n.x > cx + W + 20 || n.y < cy - 10 || n.y > cy + H + 40) continue;
        const e = VIVO.emo.get(n.id);
        if (e && !G.bubbles.some(b => b.n === n)) {
          const bob = Math.sin(G.t * 6) * 0.8;
          drawEmo(e.k, Math.round(n.x + 6), Math.round(n.y - 36 + bob));
        }
        if (G.night > 0.55 && G.horror < 0.7) {
          const s = n.dir === 1 ? -1 : 1,
            X = Math.round(n.x + s * 7),
            Y = Math.round(n.y - 12 + Math.sin(G.t * 5 + n.x) * 0.5);
          ctx.fillStyle = '#2a2630';
          ctx.fillRect(X - 1, Y - 2, 3, 5);
          ctx.fillRect(X, Y - 4, 1, 2);
          ctx.fillStyle = '#ffd070';
          ctx.fillRect(X, Y - 1, 1, 3);
        }
      }
    } catch (e) {
      ctx.globalAlpha = 1;
    }
  });
}
// ---- bagliore delle lanterne sopra il buio ----
{
  Ext.on('drawAmbTop', function (m) {
    try {
      if (m.id !== 'main' || G.night <= 0.55 || G.horror >= 0.7) return;
      ctx.globalCompositeOperation = 'lighter';
      for (const n of G.npcs) {
        if (n.hidden || n.map !== 'main') continue;
        const s = n.dir === 1 ? -1 : 1,
          X = n.x + s * 7,
          Y = n.y - 12;
        if (X < G.cam.x - 30 || X > G.cam.x + W + 30 || Y < G.cam.y - 30 || Y > G.cam.y + H + 30) continue;
        const r = 22 + Math.sin(G.t * 9 + n.x) * 1.2,
          g = ctx.createRadialGradient(X, Y, 0, X, Y, r);
        g.addColorStop(0, 'rgba(255,190,90,.45)');
        g.addColorStop(0.4, 'rgba(255,150,60,.15)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(X - r, Y - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    } catch (e) {
      ctx.globalCompositeOperation = 'source-over';
    }
  });
}
// ---- particelle nuove: fiato e schegge di neve ----
{
  const _dp2 = drawParts;
  drawParts = function () {
    const rest = [];
    for (const p of G.parts) {
      if (p.k === 'breath') {
        const k = p.t / p.life,
          r = 1 + k * 3;
        ctx.fillStyle = `rgba(235,240,250,${(0.5 * (1 - k)).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 7);
        ctx.fill();
      } else if (p.k === 'snowbit') {
        ctx.fillStyle = '#f4f8ff';
        ctx.fillRect(p.x, p.y, 1, 1);
      } else rest.push(p);
    }
    const all = G.parts;
    G.parts = rest;
    try {
      _dp2();
    } finally {
      G.parts = all;
    }
  };
}

// ======================================================================
// (già grafica3.js, unito qui senza cambiare l'ordine di caricamento)
// ================= GRAFICA 3: strutture vive =================
// Finestre che si accendono quando qualcuno è in casa, comignoli che fumano (di più d'inverno e la sera),
// fucina e fornaci che pulsano, mulino che gira, api, campana che oscilla, pozzo che luccica.
// Solo aspetto: legge lo stato del gioco, non lo cambia.
// Brom batte il ferro solo se è lì, fermo davanti alla fucina, e il suo orario dice «forge»
function bromAlLavoro() {
  const n = G.npcs && G.npcs.find(x => x.id === 'brom');
  return (
    !!n &&
    !n.hidden &&
    n.map === 'main' &&
    G.map &&
    G.map.id === 'main' &&
    !n.moving &&
    n.act === 'forge' &&
    Math.hypot(n.x - (36 * 16 + 8), n.y - (14 * 16 + 14)) < 20
  );
}
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
  const P = new PX(128, 192);
  mulinoPale(P, BK, Math.PI / 4 + (i * (Math.PI / 2)) / 8);
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
    if (o.bid === 'casetta' && o.img.chim && Math.random() < dt * (1.6 + dense * 2))
      G.parts.push({
        k: 'smoke',
        x: o.dx + o.img.chim[0] + Math.random() * 2,
        y: o.dy + o.img.chim[1],
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
  // fucina: scintille solo quando Brom è davvero all'incudine (non a orario: in visita o a pranzo niente scintille)
  const forge = m.objs.find(o => o.kind === 'bld' && o.key === 'forge');
  if (forge && bromAlLavoro()) {
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
  Ext.on('drawWorldExtras', function (m) {
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
          job = !!(b && typeof macLav === 'function' && macLav(b));
        // mulino: le pale girano (più svelte se macina o se c'è vento)
        if (o.bid === 'mulino') {
          const sp = (job ? 1.6 : 0.6) * (st.weather === 'pioggia' || st.weather === 'neve' ? 1.6 : 1),
            fr = Math.floor(T * sp * 8) % 8;
          dImg(ctx, PALE[fr], Math.round(o.dx), Math.round(o.dy));
        }
        // fornace: la bocca pulsa
        if (o.bid === 'fornace') {
          // accesa quando lavora, solo un filo di brace quando è ferma
          const f = job
              ? 0.5 + 0.3 * Math.sin(T * 8) + 0.2 * Math.sin(T * 17)
              : 0.12 + 0.04 * Math.sin(T * 1.5),
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
  });
}

// ---------- luce sopra al buio: aloni delle finestre, riflesso a terra, braci ----------
{
  Ext.on('drawAmbTop', function (m) {
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
        if (o.img.lights && ((o.kind === 'bld' && winLit(o.key)) || o.bid === 'casetta')) {
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
          // il fuoco ravvivato quando Brom lavora; altrimenti solo la brace
          const vivo = bromAlLavoro(),
            f = vivo ? 0.7 + 0.3 * Math.sin(T * 9) * Math.sin(T * 3.1) : 0.55 + 0.05 * Math.sin(T * 1.3);
          glow(o.dx + 65, o.dy + 42, 22 * f, (vivo ? 0.35 : 0.16) * k, '255,120,40');
        }
        if (o.kind === 'built') {
          if (o.bid === 'fornace')
            glow(o.dx + 8, o.dy + 18, 18 * (0.85 + 0.15 * Math.sin(T * 8)), 0.35 * k, '255,120,40');
          if (o.bid === 'serra') glow(o.dx + 32, o.dy + 30, 30, 0.18 * k, '255,210,130');
        }
        // le due finestre ad arco del museo
        if (o.kind === 'museo')
          for (const wx of [16, 96]) glow(o.dx + wx, o.dy + 60, 13, 0.25 * k, '255,220,120');
      }
      ctx.globalCompositeOperation = 'source-over';
    } catch (e) {
      ctx.globalCompositeOperation = 'source-over';
    }
  });
}
