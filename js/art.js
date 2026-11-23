'use strict';
// ================= ART (pixel art procedurale) =================
const PAL = {
  grass: '#7f9b3d',
  grass2: '#6b8833',
  grass3: '#98b24c',
  gD: '#34472a',
  gD2: '#2a3a22',
  gD3: '#3f5530',
  path: '#c9a66b',
  path2: '#b28c57',
  path3: '#dcbd86',
  dirt: '#7b4f2c',
  dirtW: '#4e311c',
  water: '#3a6a88',
  water2: '#6a9cba',
  water3: '#2c5571',
  wood: '#9c6a3c',
  wood2: '#7a4f2a',
  woodL: '#b9834f',
  cob: '#a69c86',
  cob2: '#7f7765',
  ink: '#2b1a10',
  yel: '#e8c23a',
  yelD: '#b38a24',
  red: '#c0221e',
  redD: '#7c1512'
};
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16,
    g = (n >> 8) & 255,
    b = n & 255;
  if (f < 0) {
    r *= 1 + f;
    g *= 1 + f;
    b *= 1 + f;
  } else {
    r += (255 - r) * f;
    g += (255 - g) * f;
    b += (255 - b) * f;
  }
  return '#' + ((1 << 24) | ((r | 0) << 16) | ((g | 0) << 8) | (b | 0)).toString(16).slice(1);
}
function h2r(h) {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
function outline(c, col = '#2b1a10') {
  const x = c.getContext('2d'),
    w = c.width,
    h = c.height,
    d = x.getImageData(0, 0, w, h),
    s = d.data,
    o = new Uint8ClampedArray(s),
    [R, Gg, B] = h2r(col);
  for (let y = 0; y < h; y++)
    for (let X = 0; X < w; X++) {
      const i = (y * w + X) * 4;
      if (s[i + 3] > 0) continue;
      if (
        (X > 0 && s[i - 1] > 100) ||
        (X < w - 1 && s[i + 7] > 100) ||
        (y > 0 && s[i - w * 4 + 3] > 100) ||
        (y < h - 1 && s[i + w * 4 + 3] > 100)
      ) {
        o[i] = R;
        o[i + 1] = Gg;
        o[i + 2] = B;
        o[i + 3] = 255;
      }
    }
  d.data.set(o);
  x.putImageData(d, 0, 0);
  return c;
}
function disc(x, cx, cy, r, col) {
  x.fillStyle = col;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.6));
    x.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}
function R_(x, c, X, Y, w = 1, h = 1) {
  x.fillStyle = c;
  x.fillRect(X, Y, w, h);
}

function mix(a, b, t) {
  const A = h2r(a),
    B = h2r(b);
  return (
    '#' +
    A.map((v, i) =>
      Math.round(v + (B[i] - v) * t)
        .toString(16)
        .padStart(2, '0')
    ).join('')
  );
}
// sceglie un colore da una rampa (scuro→chiaro) con un leggero dithering a scacchiera
function rampPick(ramp, v, X, Y) {
  const n = ramp.length,
    f = clamp(v, 0, 0.999) * n,
    i = Math.floor(f),
    fr = f - i;
  const th = (X + Y) & 1 ? 0.62 : 0.38;
  return ramp[Math.min(n - 1, fr > th ? i + 1 : i)];
}
// dipinge un insieme di "bolle" con luce da in alto a sinistra (chiome, cespugli)
function paintBlobs(x, blobs, ramp, o = {}) {
  const L = [-0.55, -0.83];
  let x0 = 1e9,
    y0 = 1e9,
    x1 = -1e9,
    y1 = -1e9;
  for (const [a, b, r] of blobs) {
    x0 = Math.min(x0, a - r);
    x1 = Math.max(x1, a + r);
    y0 = Math.min(y0, b - r);
    y1 = Math.max(y1, b + r);
  }
  for (let Y = Math.floor(y0); Y <= Math.ceil(y1); Y++)
    for (let X = Math.floor(x0); X <= Math.ceil(x1); X++) {
      let best = -1e9,
        bb = null;
      for (const bl of blobs) {
        const e = bl[2] - Math.hypot(X + 0.5 - bl[0], Y + 0.5 - bl[1]);
        if (e > best) {
          best = e;
          bb = bl;
        }
      }
      if (best < 0) continue;
      const nx = (X + 0.5 - bb[0]) / bb[2],
        ny = (Y + 0.5 - bb[1]) / bb[2];
      let v =
        0.5 +
        0.5 * (nx * L[0] + ny * L[1]) +
        (o.ao || 0) * (0.5 - (Y - y0) / (y1 - y0 || 1)) +
        (rnd() - 0.5) * (o.noise ?? 0.22);
      if (best < 1.3) v -= 0.28;
      R_(x, rampPick(ramp, v, X, Y), X, Y);
    }
}
const T = {},
  IMG = {};
const GR = ['#40572a', '#4f6d2f', '#5e8035', '#6f923c', '#86aa4a', '#a3c262'];
function genTiles() {
  const mkT = (seed, fn) => {
    srand(seed);
    const [c, x] = mk(16, 16);
    fn(x);
    return c;
  };
  const grass = (x, v) => {
    R_(x, GR[2], 0, 0, 16, 16);
    for (let i = 0; i < 10; i++) {
      const a = ri(0, 14),
        b = ri(0, 14);
      R_(x, GR[1], a, b, 2, 1 + ri(0, 1));
    }
    for (let i = 0; i < 9; i++) R_(x, GR[3], ri(0, 15), ri(0, 15));
    for (let i = 0; i < 4; i++) {
      const a = ri(1, 12),
        b = ri(4, 14);
      R_(x, GR[1], a, b + 1, 4, 1);
      R_(x, GR[3], a, b - 1, 1, 2);
      R_(x, GR[4], a + 1, b - 2, 1, 3);
      R_(x, GR[5], a + 1, b - 2, 1, 1);
      R_(x, GR[3], a + 2, b - 1, 1, 2);
      R_(x, GR[4], a + 3, b, 1, 1);
    }
    if (v === 4 || v === 5) {
      for (let i = 0; i < 3; i++) {
        const a = ri(1, 13),
          b = ri(1, 13),
          c = ['#d0742a', '#e2a83a', '#b8561e'][ri(0, 2)];
        R_(x, shade(c, -0.3), a, b + 1, 2, 1);
        R_(x, c, a, b, 2, 1);
      }
    }
    if (v === 3) {
      R_(x, '#6c6a60', ri(3, 11), ri(3, 11), 2, 1);
    }
  };
  T.grass = [0, 1, 2, 3, 4, 5].map(v => mkT(11 + v, x => grass(x, v)));
  T.flower = [0, 1, 2].map(v =>
    mkT(21 + v, x => {
      grass(x, 0);
      for (let i = 0; i < 3; i++) {
        const a = ri(2, 13),
          b = ri(3, 12),
          c = ['#f3e27a', '#f4f0e4', '#c9a0e0'][(v + i) % 3],
          cd = shade(c, -0.25);
        R_(x, GR[1], a, b + 2, 1, 2);
        R_(x, c, a, b - 1);
        R_(x, c, a - 1, b);
        R_(x, cd, a + 1, b);
        R_(x, cd, a, b + 1);
        R_(x, '#e8a33a', a, b);
      }
    })
  );
  T.dgrass = [0, 1, 2].map(v =>
    mkT(61 + v, x => {
      R_(x, '#22301e', 0, 0, 16, 16);
      for (let i = 0; i < 30; i++)
        R_(x, ['#1a2618', '#2a3a24', '#33452a'][ri(0, 2)], ri(0, 15), ri(0, 15), ri(1, 2), 1);
      for (let i = 0; i < 4; i++) R_(x, '#4a3a22', ri(0, 14), ri(0, 15), 2, 1);
    })
  );
  const PT = ['#7a5a34', '#97744a', '#ad8858', '#c29e6c', '#d8b886'];
  T.path = [0, 1, 2].map(v =>
    mkT(31 + v, x => {
      R_(x, PT[2], 0, 0, 16, 16);
      for (let i = 0; i < 26; i++) R_(x, PT[ri(1, 3)], ri(0, 15), ri(0, 15));
      for (let i = 0; i < 3; i++) {
        const a = ri(1, 12),
          b = ri(1, 13);
        R_(x, PT[0], a, b + 1, 3, 1);
        R_(x, PT[4], a, b, 2, 1);
        R_(x, PT[3], a + 2, b, 1, 1);
      }
      for (let i = 0; i < 2; i++) {
        const a = ri(0, 13),
          b = ri(0, 14);
        R_(x, PT[1], a, b, ri(2, 4), 1);
      }
    })
  );
  T.cob = [0, 1].map(v =>
    mkT(41 + v, x => {
      R_(x, '#5a554b', 0, 0, 16, 16);
      for (let j = 0; j < 4; j++)
        for (let i = -1; i < 3; i++) {
          const ox = (j % 2 ? 3 : 0) + i * 6,
            oy = j * 4;
          const base = ['#8f897a', '#9c9686', '#857f70', '#a8a290'][ri(0, 3)];
          R_(x, shade(base, -0.25), ox + 1, oy + 1, 5, 3);
          R_(x, base, ox + 1, oy + 1, 4, 2);
          R_(x, shade(base, 0.2), ox + 1, oy + 1, 3, 1);
          R_(x, shade(base, -0.4), ox + 1, oy + 3, 5, 1);
        }
      for (let i = 0; i < 3; i++) R_(x, '#4f6a2c', ri(0, 15), ri(0, 15), 1, 1);
    })
  );
  T.water = [0, 1, 2].map(f =>
    mkT(51, x => {
      R_(x, '#2c5a76', 0, 0, 16, 16);
    })
  );
  T.bridge = [
    mkT(71, x => {
      for (let y = 0; y < 16; y += 4) {
        const c = ['#8a5c32', '#7a5030', '#946638'][ri(0, 2)];
        R_(x, shade(c, -0.35), 0, y + 3, 16, 1);
        R_(x, c, 0, y, 16, 3);
        R_(x, shade(c, 0.2), 0, y, 16, 1);
        R_(x, '#3a2414', ri(3, 6), y + 1, 1, 1);
        R_(x, '#3a2414', ri(10, 13), y + 1, 1, 1);
      }
      R_(x, '#3a2414', 0, 0, 2, 16);
      R_(x, '#5a3a1e', 1, 0, 1, 16);
    })
  ];
  T.floor = [0, 1].map(v =>
    mkT(81 + v, x => {
      for (let y = 0; y < 16; y += 4) {
        const c = ['#a87545', '#9c6c40', '#b07c4a'][ri(0, 2)];
        R_(x, c, 0, y, 16, 4);
        R_(x, shade(c, 0.15), 0, y, 16, 1);
        R_(x, shade(c, -0.3), 0, y + 3, 16, 1);
        const s = ((y / 4) % 2) * 8 + v * 3;
        R_(x, shade(c, -0.35), s, y, 1, 3);
        if (rnd() < 0.4) R_(x, shade(c, -0.2), ri(2, 12), y + 1, 2, 1);
      }
    })
  );
  T.stone = [0, 1].map(v =>
    mkT(91 + v, x => {
      R_(x, '#4f4c48', 0, 0, 16, 16);
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) {
          const c = ['#7c7973', '#85827c', '#74716b'][ri(0, 2)];
          R_(x, c, i * 8 + 1, j * 8 + 1, 7, 7);
          R_(x, shade(c, 0.18), i * 8 + 1, j * 8 + 1, 7, 1);
          R_(x, shade(c, 0.1), i * 8 + 1, j * 8 + 1, 1, 6);
          R_(x, shade(c, -0.25), i * 8 + 1, j * 8 + 7, 7, 1);
          if (rnd() < 0.5) R_(x, shade(c, -0.2), i * 8 + ri(2, 5), j * 8 + ri(2, 5), 2, 1);
        }
    })
  );
  T.wallT = [
    mkT(101, x => {
      R_(x, '#6a4630', 0, 0, 16, 16);
      for (let i = 0; i < 16; i += 4) {
        R_(x, '#5a3a26', i, 0, 1, 16);
        R_(x, '#7a5438', i + 1, 0, 1, 16);
      }
      R_(x, '#8a6240', 0, 0, 16, 2);
      R_(x, '#4a2e1c', 0, 2, 16, 1);
      for (let i = 2; i < 16; i += 8) R_(x, '#c9a24a', i, 8, 2, 2);
    })
  ];
  T.wallB = [
    mkT(102, x => {
      R_(x, '#5d3b22', 0, 0, 16, 16);
      for (let i = 0; i < 16; i += 8) {
        R_(x, '#4c2f1a', i, 1, 1, 10);
        R_(x, '#6e4a2c', i + 1, 1, 6, 1);
        R_(x, '#4c2f1a', i + 1, 10, 6, 1);
      }
      R_(x, '#3a2414', 0, 12, 16, 4);
      R_(x, '#7a5232', 0, 11, 16, 1);
      R_(x, '#8a6242', 0, 0, 16, 1);
    })
  ];
  T.wallS = [
    mkT(103, x => {
      R_(x, '#6a6762', 0, 0, 16, 16);
      for (let j = 0; j < 4; j++) {
        const off = (j % 2) * 5;
        for (let i = -1; i < 2; i++) {
          const c = ['#86837c', '#7d7a74', '#8f8c85'][ri(0, 2)];
          R_(x, c, off + i * 10 + 1, j * 4 + 1, 9, 3);
          R_(x, shade(c, 0.15), off + i * 10 + 1, j * 4 + 1, 9, 1);
        }
      }
    })
  ];
  T.barn = [0, 1].map(v =>
    mkT(111 + v, x => {
      R_(x, '#5e4128', 0, 0, 16, 16);
      for (let i = 0; i < 22; i++)
        R_(x, ['#4e3420', '#6e4c30', '#7a5634'][ri(0, 2)], ri(0, 15), ri(0, 15), ri(1, 2), 1);
      for (let i = 0; i < 4; i++) {
        const a = ri(0, 12),
          b = ri(0, 15);
        R_(x, '#c9a24a', a, b, 4, 1);
        R_(x, '#e2c26a', a + 1, b, 2, 1);
      }
    })
  );
  T.tilled = [
    mkT(121, x => {
      R_(x, '#6e4526', 0, 0, 16, 16);
      for (let y = 1; y < 16; y += 4) {
        R_(x, '#4e2f18', 0, y + 2, 16, 1);
        R_(x, '#7f5530', 0, y, 16, 1);
        R_(x, '#8f6238', 0, y - 1, 16, 1);
      }
      for (let i = 0; i < 8; i++) R_(x, '#5a3820', ri(0, 15), ri(0, 15));
    })
  ];
  T.tilledW = [
    mkT(122, x => {
      R_(x, '#43291a', 0, 0, 16, 16);
      for (let y = 1; y < 16; y += 4) {
        R_(x, '#2c1a10', 0, y + 2, 16, 1);
        R_(x, '#553522', 0, y, 16, 1);
        R_(x, '#5d3c26', 0, y - 1, 16, 1);
      }
      for (let i = 0; i < 4; i++) R_(x, '#7a8ea0', ri(1, 14), ri(1, 14), 1, 1);
    })
  ];
  T.void = [mkT(1, x => R_(x, '#000', 0, 0, 16, 16))];
}
const GT = {
  0: 'void',
  1: 'grass',
  2: 'path',
  3: 'water',
  4: 'bridge',
  5: 'dgrass',
  6: 'floor',
  7: 'stone',
  8: 'wallT',
  9: 'wallB',
  10: 'barn',
  11: 'cob',
  12: 'flower',
  13: 'wallS'
};
// ---------- oggetti ----------
const TREEPAL = [
  ['#3e1a0c', '#6e2e14', '#a3481c', '#cf6c28', '#ec9a46', '#f8c46e'],
  ['#3f2a0c', '#715014', '#a67c1e', '#d2a52e', '#ecc94a', '#faea8a'],
  ['#2a220e', '#4c3e18', '#736026', '#9a843a', '#bfa958', '#dccb80'],
  ['#3a1a0e', '#64301a', '#93481f', '#bd6a2a', '#dc923c', '#f2bb64'],
  ['#16261a', '#253f22', '#3a5c2c', '#56803a', '#77a24a', '#a2c66a']
];
function genFence(kind, col) {
  const [c, x] = mk2(16, 22);
  const grey = !!col;
  srand(77 + (kind === 'h' ? 1 : 0));
  const m = col || PAL.yel,
    d = shade(m, -0.28),
    dd = shade(m, -0.5),
    l = shade(m, 0.35);
  const rail = y => {
    R_(x, dd, 0, y + 2, 16, 1);
    R_(x, m, 0, y, 16, 2);
    R_(x, l, 0, y, 16, 1);
  };
  const post = (px, y0, y1) => {
    R_(x, d, px, y0, 5, y1 - y0);
    R_(x, m, px, y0, 3, y1 - y0);
    R_(x, l, px + 1, y0 + 1, 1, y1 - y0 - 2);
    R_(x, l, px, y0, 5, 1);
    R_(x, dd, px, y1 - 1, 5, 1);
    R_(x, d, px + 1, y0 - 1, 3, 1);
  };
  if (kind === 'h') {
    rail(9);
    rail(14);
    post(6, 3, 21);
  } else {
    R_(x, d, 7, 0, 3, 22);
    R_(x, m, 7, 0, 2, 22);
    R_(x, l, 7, 0, 1, 22);
    post(5, 7, 21);
  }
  if (grey) {
    for (let i = 0; i < 10; i++) R_(x, '#5d5a52', ri(0, 15), ri(4, 20), ri(1, 2), 1);
    for (let i = 0; i < 4; i++) R_(x, '#b8b4a8', ri(0, 15), ri(4, 20), 1, 1);
  }
  return texturize(outline(c, '#3a2214'), 0.1, kind === 'h' ? 3 : 4);
}
function genBuilding(o) {
  const Wd = o.w * 16,
    Hd = o.h * 16 + (o.extra || 0);
  const [c, x] = mk2(Wd + 2, Hd);
  const rh = o.roofH + (o.extra || 0),
    bx = 1;
  srand(500 + Wd * 7 + rh);
  const wall = o.wall,
    wl = shade(wall, 0.16),
    wd = shade(wall, -0.16),
    wdd = shade(wall, -0.34);
  // muro
  if (o.stone) {
    R_(x, wdd, bx + 2, rh - 2, Wd - 4, Hd - rh + 2);
    for (let y = rh; y < Hd - 4; y += 5) {
      const off = ((y / 5) | 0) % 2 ? 4 : 0;
      for (let X = bx + 2 - off; X < bx + Wd - 2; X += 8) {
        const sc = [wd, wall, wall, wl][ri(0, 3)],
          X0 = Math.max(bx + 2, X + 1),
          w = Math.min(7, bx + Wd - 2 - X0);
        if (w <= 0) continue;
        R_(x, sc, X0, y + 1, w, 3);
        R_(x, shade(sc, 0.14), X0, y + 1, w, 1);
        R_(x, shade(sc, -0.12), X0, y + 3, w, 1);
      }
    }
  } else
    for (let y = rh - 2; y < Hd - 4; y++) {
      const row = (y - rh + 40) % 5;
      R_(x, row === 0 ? wl : row === 4 ? wdd : row === 3 ? wd : wall, bx + 2, y, Wd - 4, 1);
    }
  R_(x, wdd, bx + 2, rh, 2, Hd - rh - 4);
  R_(x, wdd, bx + Wd - 4, rh, 2, Hd - rh - 4);
  R_(x, wl, bx + 4, rh, 1, Hd - rh - 4);
  x.fillStyle = 'rgba(30,14,40,.16)';
  x.fillRect(bx + Wd - 16, rh, 12, Hd - rh - 4);
  x.fillStyle = 'rgba(30,14,40,.1)';
  x.fillRect(bx + Wd - 24, rh, 8, Hd - rh - 4);
  // zoccolo in pietra
  for (let X = bx + 1; X < bx + Wd - 1; X += 6) {
    const sh = ['#77756c', '#8a877d', '#6e6c64'][ri(0, 2)],
      w = Math.min(6, bx + Wd - 1 - X);
    R_(x, '#45433e', X, Hd - 5, w, 5);
    R_(x, sh, X + 1, Hd - 4, w - 2, 3);
    R_(x, shade(sh, 0.2), X + 1, Hd - 4, w - 2, 1);
  }
  // tetto a tegole
  const r0 = o.extra || 0,
    roofD = shade(o.roof, -0.38),
    roofL = shade(o.roof2, 0.28);
  for (let y = r0; y < rh; y++) {
    const k = y - r0,
      ins = Math.max(0, 6 - k),
      row = Math.floor(k / 4),
      inr = k % 4,
      grad = k / (rh - r0);
    for (let X = bx + ins; X < bx + Wd - ins; X++) {
      const sx = X + row * 3,
        tile = Math.floor(sx / 7);
      let col = hsh(tile, row) % 3 === 0 ? o.roof2 : o.roof;
      if (inr === 3) col = roofD;
      else if (inr === 0) col = shade(col, 0.14);
      if (sx % 7 === 0 && inr < 3) col = shade(col, -0.22);
      R_(x, shade(col, -grad * 0.2), X, y);
    }
  }
  for (let y = r0; y < rh; y++) {
    const ins = Math.max(0, 6 - (y - r0));
    R_(x, roofD, bx + ins, y, 1, 1);
    R_(x, roofD, bx + Wd - ins - 1, y, 1, 1);
  }
  R_(x, roofL, bx + 6, r0, Wd - 12, 1);
  R_(x, '#2b1a10', bx, rh, Wd, 2);
  R_(x, shade(o.roof, -0.5), bx, rh - 1, Wd, 1);
  for (let i = 0; i < 4; i++) {
    x.fillStyle = `rgba(10,5,0,${0.34 - i * 0.08})`;
    x.fillRect(bx + 2, rh + 2 + i, Wd - 4, 1);
  }
  if (o.chimney) {
    const chx = bx + Wd - 22;
    for (let y = r0 + 1; y < r0 + 12; y++)
      for (let X = chx; X < chx + 7; X++) {
        const br = (y + (Math.floor((X - chx) / 3) % 2)) % 3 === 0;
        R_(x, br ? '#4a2a20' : X < chx + 2 ? '#a0644a' : '#7a4a36', X, y);
      }
    R_(x, '#3a2a24', chx - 1, r0, 9, 2);
    R_(x, '#6a5a54', chx - 1, r0, 9, 1);
    c.chim = [chx + 3, r0];
  }
  // finestre
  c.lights = [];
  const trim = o.trim || '#e3cf9f',
    sht = o.shutter;
  (o.win || []).forEach(([wx, wy]) => {
    const X = bx + wx,
      Y = wy;
    if (sht) {
      for (const sx of [X - 5, X + 11]) {
        R_(x, shade(sht, -0.35), sx, Y - 1, 4, 12);
        R_(x, sht, sx + 1, Y, 2, 10);
        R_(x, shade(sht, 0.2), sx + 1, Y, 1, 10);
        R_(x, shade(sht, -0.35), sx, Y + 5, 4, 1);
      }
    }
    R_(x, shade(trim, -0.4), X - 2, Y - 2, 14, 14);
    R_(x, trim, X - 1, Y - 1, 12, 12);
    R_(x, shade(trim, 0.15), X - 1, Y - 1, 12, 1);
    R_(x, '#1c2840', X, Y, 10, 10);
    R_(x, '#2a3c5a', X, Y, 10, 4);
    R_(x, '#53709a', X + 1, Y + 1, 2, 1);
    R_(x, '#53709a', X + 1, Y + 2, 1, 1);
    R_(x, '#6c8ab0', X + 7, Y + 6, 1, 2);
    R_(x, '#3c5276', X + 6, Y + 7, 1, 1);
    R_(x, trim, X + 4, Y, 2, 10);
    R_(x, trim, X, Y + 4, 10, 2);
    R_(x, '#4a2e18', X - 2, Y + 11, 14, 3);
    R_(x, '#7a5230', X - 2, Y + 11, 14, 1);
    for (let i = 0; i < 6; i++) {
      const fc = ['#e8c23a', '#f4ecd8', '#b48ad0', '#eab04a'][hsh(i, wx + wy) % 4];
      R_(x, '#3f6a24', X - 1 + i * 2, Y + 9, 2, 2);
      R_(x, fc, X - 1 + i * 2, Y + 8, 1, 1);
    }
    c.lights.push([wx, wy, 10, 10]);
  });
  // porta
  if (o.door != null) {
    const dx = bx + o.door * 16 + 2,
      dy = Hd - 21,
      dc = o.doorCol || '#6a3a1c';
    R_(x, shade(trim, -0.45), dx - 2, dy - 2, 16, 18);
    R_(x, '#22140c', dx - 1, dy - 1, 14, 17);
    for (let i = 0; i < 12; i++)
      R_(x, i % 4 === 3 ? shade(dc, -0.32) : i % 4 === 0 ? shade(dc, 0.16) : dc, dx + i, dy, 1, 16);
    R_(x, '#2e2e34', dx, dy + 3, 7, 1);
    R_(x, '#2e2e34', dx, dy + 11, 7, 1);
    R_(x, '#55555e', dx, dy + 3, 1, 1);
    R_(x, '#55555e', dx, dy + 11, 1, 1);
    R_(x, PAL.yel, dx + 9, dy + 8, 2, 2);
    R_(x, '#fff0a0', dx + 9, dy + 8, 1, 1);
    R_(x, '#6e6c64', dx - 3, Hd - 4, 18, 4);
    R_(x, '#a4a196', dx - 3, Hd - 4, 18, 1);
  }
  // dettagli fini a mezzo pixel
  srand(700 + Wd + rh);
  if (!o.stone) {
    for (let y = rh; y < Hd - 5; y++) {
      if ((y - rh + 40) % 5 !== 2) continue;
      for (let X = bx + 5; X < bx + Wd - 6; X += 0.5)
        if (rnd() < 0.05) R_(x, wd, X, y + 0.5, 0.5 + rnd() * 2.5, 0.5);
    }
  } else
    for (let i = 0; i < Wd * 0.8; i++)
      R_(x, rnd() < 0.5 ? '#5a7a34' : '#4a6a2a', bx + 3 + rnd() * (Wd - 6), Hd - 6 - rnd() * 10, 0.5, 0.5);
  for (let y = r0; y < rh; y += 4) {
    const ins = Math.max(0, 6 - (y - r0));
    for (let X = bx + ins; X < bx + Wd - ins; X += 0.5) {
      if (rnd() < 0.3) R_(x, shade(o.roof2, 0.34), X, y + 0.5, 0.5, 0.5);
      if (rnd() < 0.025) R_(x, '#5a7a34', X, y + 2, 1, 0.5);
    }
  }
  (o.win || []).forEach(([wx, wy]) => {
    const X = bx + wx,
      Y = wy;
    R_(x, '#c9a070', X, Y + 0.5, 1.5, 9);
    R_(x, '#c9a070', X + 8.5, Y + 0.5, 1.5, 9);
    R_(x, '#e8c890', X, Y + 0.5, 0.5, 9);
    R_(x, '#9cc0e0', X + 2, Y + 1, 0.5, 1.5);
  });
  if (o.post) o.post(x, bx, Wd, Hd, rh);
  return texturize(outline(c, '#22140c'), 0.08, Wd + rh);
}
// ---------- risoluzione doppia: ogni sprite del mondo è disegnato a 2× ----------
function mk2(w, h) {
  const [c, x] = mk(w * 2, h * 2);
  x.scale(2, 2);
  c.s = 2;
  return [c, x];
}
const iw = img => img.width / (img.s || 1),
  ih = img => img.height / (img.s || 1);
function dImg(x2, img, X, Y) {
  x2.drawImage(img, X, Y, iw(img), ih(img));
}
// grana fine: piccole variazioni di luminosità pixel per pixel (dà corpo alle superfici)
function texturize(c, amt = 0.08, seed = 1) {
  srand(seed);
  const x = c.getContext('2d'),
    d = x.getImageData(0, 0, c.width, c.height),
    a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const f = 1 + (rnd() - 0.5) * amt;
    a[i] *= f;
    a[i + 1] *= f;
    a[i + 2] *= f;
  }
  x.putImageData(d, 0, 0);
  return c;
}
function up2(c16, amt, seed) {
  const [c, x] = mk(c16.width * 2, c16.height * 2);
  x.drawImage(c16, 0, 0, c.width, c.height);
  c.s = 2;
  return texturize(c, amt, seed);
}
// ---------- tile 32×32 ----------
function genTilesHD() {
  genTiles();
  const mkT = (seed, fn) => {
    srand(seed);
    const [c, x] = mk(32, 32);
    c.s = 2;
    fn(x);
    return c;
  };
  const P = (x, col, X, Y, w = 1, h = 1) => {
    x.fillStyle = col;
    x.fillRect(X, Y, w, h);
  };
  const grass = (x, v) => {
    P(x, GR[2], 0, 0, 32, 32);
    for (let i = 0; i < 70; i++) P(x, [GR[1], GR[1], GR[3]][ri(0, 2)], ri(0, 31), ri(0, 31), ri(1, 2), 1);
    for (let i = 0; i < 10; i++) {
      const a = ri(0, 29),
        b = ri(0, 29);
      P(x, shade(GR[2], -0.08), a, b, 3, 2);
    }
    for (let i = 0; i < 16; i++) {
      const a = ri(1, 30),
        b = ri(5, 31),
        h = ri(3, 6),
        lean = ri(-1, 1);
      P(x, GR[0], a - 1, b, 3, 1);
      for (let k = 0; k < h; k++)
        P(x, k > h - 2 ? GR[5] : k > h - 3 ? GR[4] : GR[3], a + (k > h / 2 ? lean : 0), b - k - 1, 1, 1);
    }
    if (v === 4 || v === 5)
      for (let i = 0; i < 4; i++) {
        const a = ri(2, 28),
          b = ri(2, 28),
          c = ['#d0742a', '#e2a83a', '#b8561e', '#c9902a'][ri(0, 3)];
        P(x, shade(c, -0.35), a, b + 1, 3, 1);
        P(x, c, a, b, 3, 1);
        P(x, shade(c, 0.25), a, b, 1, 1);
      }
    if (v === 3) {
      const a = ri(6, 22),
        b = ri(6, 22);
      P(x, '#4a4840', a, b + 2, 5, 1);
      P(x, '#77756c', a, b, 5, 2);
      P(x, '#9a978c', a + 1, b, 2, 1);
    }
    if (v === 2)
      for (let i = 0; i < 3; i++) {
        const a = ri(3, 27),
          b = ri(3, 27);
        P(x, '#4f8a2a', a, b, 2, 2);
        P(x, '#6aa83a', a, b, 1, 1);
      }
  };
  T.grass = [0, 1, 2, 3, 4, 5].map(v => mkT(11 + v, x => grass(x, v)));
  T.flower = [0, 1, 2].map(v =>
    mkT(21 + v, x => {
      grass(x, 0);
      for (let i = 0; i < 4; i++) {
        const a = ri(4, 27),
          b = ri(5, 24),
          c = ['#f3e27a', '#f4f0e4', '#c9a0e0', '#f2b84a'][(v + i) % 4],
          cd = shade(c, -0.3),
          cl = shade(c, 0.3);
        P(x, GR[1], a, b + 2, 1, 4);
        P(x, GR[3], a + 1, b + 4, 2, 1);
        P(x, c, a - 1, b - 1, 3, 1);
        P(x, c, a - 2, b, 5, 1);
        P(x, cd, a - 1, b + 1, 3, 1);
        P(x, cl, a - 1, b - 1, 1, 1);
        P(x, '#c8761a', a, b, 1, 1);
        P(x, '#f8d860', a, b - 1, 1, 1);
      }
    })
  );
  T.dgrass = [0, 1, 2].map(v =>
    mkT(61 + v, x => {
      P(x, '#1f2c1c', 0, 0, 32, 32);
      for (let i = 0; i < 90; i++)
        P(x, ['#182416', '#283a22', '#30442a', '#22301e'][ri(0, 3)], ri(0, 31), ri(0, 31), ri(1, 3), 1);
      for (let i = 0; i < 10; i++) {
        const a = ri(0, 29),
          b = ri(0, 30);
        P(x, '#5a4426', a, b, 1, 1);
        P(x, '#4a3820', a + 1, b + 1, 1, 1);
        P(x, '#5a4426', a + 2, b + 2, 1, 1);
      }
      for (let i = 0; i < 3; i++) P(x, '#3f5a2a', ri(0, 28), ri(0, 28), 3, 2);
    })
  );
  const PT = ['#6e5030', '#8a6a44', '#a07c50', '#b69060', '#ccaa7a', '#e0c494'];
  T.path = [0, 1, 2].map(v =>
    mkT(31 + v, x => {
      P(x, PT[2], 0, 0, 32, 32);
      for (let i = 0; i < 120; i++) P(x, PT[ri(1, 4)], ri(0, 31), ri(0, 31));
      for (let i = 0; i < 5; i++) {
        const a = ri(1, 28),
          b = ri(1, 28),
          w = ri(2, 3);
        P(x, PT[0], a, b + 2, w + 1, 1);
        P(x, PT[3], a, b, w, 2);
        P(x, PT[5], a, b, 1, 1);
      }
      for (let i = 0; i < 3; i++) {
        const a = ri(0, 26),
          b = ri(0, 30);
        P(x, PT[1], a, b, ri(3, 6), 1);
      }
      if (v === 1)
        for (let i = 0; i < 2; i++) {
          const a = ri(4, 24),
            b = ri(4, 24);
          P(x, PT[1], a, b, 4, 3);
          P(x, PT[0], a + 1, b + 1, 2, 1);
        }
    })
  );
  T.cob = [0, 1].map(v =>
    mkT(41 + v, x => {
      P(x, '#4a463e', 0, 0, 32, 32);
      for (let j = 0; j < 4; j++)
        for (let i = -1; i < 4; i++) {
          const ox = (j % 2 ? 5 : 0) + i * 10,
            oy = j * 8;
          const base = ['#8f897a', '#9c9686', '#857f70', '#a8a290', '#948e7e'][ri(0, 4)];
          P(x, shade(base, -0.3), ox + 1, oy + 1, 9, 7);
          P(x, base, ox + 1, oy + 1, 8, 6);
          P(x, shade(base, 0.12), ox + 2, oy + 1, 6, 2);
          P(x, shade(base, 0.26), ox + 2, oy + 1, 3, 1);
          P(x, shade(base, -0.18), ox + 8, oy + 2, 1, 5);
          P(x, shade(base, -0.42), ox + 1, oy + 7, 9, 1);
          if (rnd() < 0.3) P(x, shade(base, -0.12), ox + 3 + ri(0, 3), oy + 3 + ri(0, 2), 2, 1);
        }
      for (let i = 0; i < 6; i++) P(x, ['#4f6a2c', '#5f7a34'][ri(0, 1)], ri(0, 31), ri(0, 3) * 8, 1, 1);
    })
  );
  // gli altri tile: dal disegno a 16 px, raddoppiati e granulati
  for (const k of [
    'water',
    'bridge',
    'floor',
    'stone',
    'wallT',
    'wallB',
    'wallS',
    'barn',
    'tilled',
    'tilledW',
    'void'
  ])
    T[k] = T[k].map((c, i) => up2(c, k === 'void' || k === 'water' ? 0 : 0.1, i + 7));
}
// ---------- alberi, pini, cespugli a 2× ----------
// L'albero d'autunno gotico: stessa tela di sempre (88×116 a 2×, chioma alta 44) perché posizioni, ombre e
// ondeggiamento non cambino. Radici che affondano, corteccia scura solcata con muschio e cavità, rami contorti
// che si allargano sotto una chioma a ciuffi (luce da in alto a sinistra). La variante 2 è mezza spoglia.
function genTreeHD(v) {
  srand(200 + v);
  const W = 88,
    H = 116,
    [c, x] = mk(W, H);
  c.s = 2;
  const ramp = TREEPAL[v % 5],
    bark = ['#140c08', '#24160e', '#3a2416', '#54361f', '#70502e', '#8c6a40'],
    moss = ['#1e2a14', '#2e4018', '#44581e', '#5e7228'],
    spoglio = v === 2,
    cx = 44 + (v % 2 ? 1 : -1);
  // --- radici: il tronco si allarga e affonda, due o tre radici serpeggiano sul terreno
  const radice = (dir, len, y0) => {
    let X = cx + dir * 6,
      Y = y0,
      th = 4;
    for (let i = 0; i < len; i++) {
      X += dir;
      if (rnd() < 0.35) Y += rnd() < 0.6 ? 1 : 0;
      th = Math.max(1, 4 - (i / len) * 4);
      R_(x, bark[1], Math.round(X), Math.round(Y), 1, Math.ceil(th));
      R_(x, bark[3], Math.round(X), Math.round(Y), 1, 1);
    }
  };
  radice(-1, 14 + ri(0, 6), 106);
  radice(1, 12 + ri(0, 6), 107);
  if (rnd() < 0.6) radice(-1, 7, 110);
  // --- tronco: un po' storto, solchi verticali, luce a sinistra, muschio a destra in basso
  const storto = y => Math.round(Math.sin(y * 0.09 + v) * 1.6);
  for (let y = 58; y < 112; y++) {
    const base = y > 98 ? (y - 98) * 1.2 : 0,
      w = Math.round(12 + base + (y < 66 ? (66 - y) * 0.3 : 0)),
      x0 = cx - Math.floor(w / 2) + storto(y);
    for (let i = 0; i < w; i++) {
      const t = i / (w - 1);
      let k = t < 0.12 ? 4 : t < 0.32 ? 3 : t < 0.62 ? 2 : t < 0.86 ? 1 : 0;
      // solchi: righe scure che scendono, interrotte
      if ((i * 5 + Math.floor(y / 7)) % 4 === 0 && hsh(i, y >> 2) % 3) k = Math.max(0, k - 2);
      if (k >= 3 && hsh(i * 3, y) % 9 === 0) k = 5;
      R_(x, bark[k], x0 + i, y);
      // muschio sul lato in ombra, più fitto vicino a terra
      if (t > 0.62 && y > 84 && hsh(i * 7 + v, y * 3) % 10 < (y - 84) / 4)
        R_(x, moss[hsh(i, y) % 3], x0 + i, y);
    }
  }
  // una cavità nel tronco (non in tutti)
  if (v % 2 === 1) {
    const hy = 80 + ri(0, 6),
      hx = cx - 2 + storto(hy);
    R_(x, bark[0], hx, hy, 4, 6);
    R_(x, bark[0], hx + 1, hy - 1, 2, 1);
    R_(x, '#070403', hx + 1, hy + 1, 2, 4);
    R_(x, bark[4], hx - 1, hy, 1, 5);
  }
  // --- rami: storti, si dividono; le punte reggono i ciuffi di foglie
  const punte = [];
  const ramo = (X, Y, ang, len, th, liv) => {
    for (let i = 0; i < len; i++) {
      // storto, ma sempre verso l'alto (un ramo che scende sotto la chioma sembra un artiglio)
      ang = clamp(ang + (rnd() - 0.5) * 0.5, -Math.PI + 0.35, -0.35);
      X += Math.cos(ang);
      Y += Math.sin(ang);
      const t = Math.max(1, Math.round(th * (1 - (i / len) * 0.5)));
      R_(x, bark[1], Math.round(X) - (t >> 1), Math.round(Y) - (t >> 1), t, t);
      R_(x, bark[3], Math.round(X) - (t >> 1), Math.round(Y) - (t >> 1), 1, 1);
    }
    if (liv > 0) {
      const n = liv > 1 ? 2 : 2 + (rnd() < 0.4 ? 1 : 0);
      for (let k = 0; k < n; k++)
        ramo(
          X,
          Y,
          ang + (k - (n - 1) / 2) * (0.7 + rnd() * 0.3),
          len * (0.62 + rnd() * 0.15),
          th * 0.6,
          liv - 1
        );
    } else punte.push([X, Y]);
  };
  const top = 62,
    L = spoglio ? 1.3 : 1;
  ramo(cx, top, -Math.PI / 2 + (rnd() - 0.5) * 0.3, 17 * L, 5, 2);
  ramo(cx - 2, top + 2, -Math.PI / 2 - 0.8, 15 * L, 4, 2);
  ramo(cx + 2, top + 1, -Math.PI / 2 + 0.8, 15 * L, 4, 2);
  // --- foglie: un ciuffo per punta (la variante spoglia ne perde molti), più qualche ciuffo di riempimento
  // la chioma sta dentro un ovale alto (centro cx,30; raggi 33×21): sotto si vede la raggiera dei rami: i ciuffi alle punte dei rami, poi si riempie
  const dentro = (a, b) => ((a - cx) / 33) ** 2 + ((b - 30) / 21) ** 2 <= 1;
  const ciuffi = [],
    spoglie = [];
  for (const [px, py] of punte) {
    const a = clamp(px, 22, 66),
      b = clamp(py, 12, 46);
    if (spoglio && rnd() < 0.5) spoglie.push([px, py]);
    else ciuffi.push([a, b, spoglio ? 7 + ri(0, 2) : 9 + ri(0, 4)]);
  }
  if (!spoglio)
    for (let k = 0; k < 40; k++) {
      const a = cx + ri(-29, 29),
        b = 30 + ri(-18, 18);
      if (!dentro(a, b) || ciuffi.some(([p, q, r]) => Math.hypot(a - p, b - q) < r * 0.9)) continue;
      ciuffi.push([a, b, 9 + ri(0, 4)]);
    }
  // sulle punte spoglie: rametti sottili, storti, come dita
  for (const [px, py] of spoglie)
    for (let k = 0; k < 4; k++) {
      let X = px,
        Y = py,
        ang = -Math.PI / 2 + (k - 1) * 0.7 + (rnd() - 0.5) * 0.4;
      for (let i = 0; i < 5 + ri(0, 3); i++) {
        ang += (rnd() - 0.5) * 0.6;
        X += Math.cos(ang);
        Y += Math.sin(ang);
        R_(x, bark[i < 2 ? 2 : 1], Math.round(X), Math.round(Y));
      }
    }
  // attorno a ogni ciuffo, foglioline che rendono il bordo frastagliato
  const minuti = [];
  for (const [a, b, r] of ciuffi)
    for (let i = 0; i < 7; i++) {
      const ang = rnd() * Math.PI * 2;
      minuti.push([a + Math.cos(ang) * r * 0.95, b + Math.sin(ang) * r * 0.85, ri(2, 4)]);
    }
  // la chioma si dipinge su un livello suo: così ci si possono aprire dei varchi da cui si vedono i rami
  const [cf, xf] = mk(W, H);
  paintBlobs(xf, ciuffi.concat(minuti), ramp, { ao: 0.6, noise: 0.16 });
  const d = xf.getImageData(0, 0, W, H).data,
    pieno = (a, b) => a >= 0 && b >= 0 && a < W && b < H && d[(b * W + a) * 4 + 3] > 0;
  for (const [a, b, r] of ciuffi) {
    for (let i = 0; i < 9; i++) {
      const X = Math.round(a - r * 0.45 + ri(-3, 3)),
        Y = Math.round(b - r * 0.5 + ri(-2, 2));
      if (pieno(X, Y)) {
        R_(xf, ramp[5], X, Y, ri(1, 2), 1);
        if (rnd() < 0.5) R_(xf, ramp[4], X, Y + 1, 1, 1);
      }
    }
    for (let i = 0; i < 6; i++) {
      const X = Math.round(a + r * 0.35 + ri(-3, 3)),
        Y = Math.round(b + r * 0.45 + ri(-2, 2));
      if (pieno(X, Y)) R_(xf, ramp[0], X, Y, ri(1, 2), 1);
    }
  }
  x.drawImage(cf, 0, 0);
  c.canopyH = 44;
  return outline(c, shade(ramp[0], -0.6));
}
function genPineHD(v) {
  srand(300 + v);
  const [c, x] = mk(60, 104);
  c.s = 2;
  const ramp = ['#0a1310', '#101e17', '#172c20', '#20402a', '#2d5836', '#3f7244', '#5a8e58'];
  const bark = ['#1c120a', '#2f1e10', '#45301c'];
  for (let y = 76; y < 102; y++) {
    R_(x, bark[2], 26, y, 3, 1);
    R_(x, bark[1], 29, y, 2, 1);
    R_(x, bark[0], 31, y, 2, 1);
  }
  for (let i = 0; i < 5; i++) {
    const y0 = 2 + i * 16,
      h = 26,
      wm = 7 + i * 4.8;
    for (let y = 0; y < h; y++) {
      const ww = Math.floor(wm * ((y + 1) / h)) + 1;
      for (let X = 30 - ww; X < 30 + ww; X++) {
        const t = (X - (30 - ww)) / (2 * ww);
        let val = 0.92 - t * 0.8 - (y / h) * 0.18 + (rnd() - 0.5) * 0.22;
        if ((X * 3 + y * 5) % 7 === 0) val -= 0.22;
        if ((X + y * 2) % 9 === 0) val += 0.12;
        if (y >= h - 3 && rnd() < 0.6) val -= 0.3;
        R_(x, rampPick(ramp, val, X, y0 + y), X, y0 + y);
      }
    }
    for (let k = 0; k < 10; k++)
      R_(x, ramp[1], ri(Math.ceil(30 - wm), Math.floor(30 + wm) - 1), y0 + h, 1, ri(1, 2));
  }
  if (v === 2) for (let i = 0; i < 10; i++) R_(x, '#6a5a3a', ri(18, 40), ri(40, 76), 1, 1);
  c.canopyH = 40;
  return outline(c, '#04070a');
}
function genBushHD(berries) {
  srand(berries ? 411 : 410);
  const [c, x] = mk(40, 34);
  c.s = 2;
  const bl = [
    [12, 20, 10],
    [28, 20, 10],
    [20, 14, 12],
    [20, 22, 10]
  ];
  for (let i = 0; i < 20; i++) {
    const b = bl[ri(0, 3)],
      a = rnd() * 6.28;
    bl.push([b[0] + Math.cos(a) * b[2] * 0.85, b[1] + Math.sin(a) * b[2] * 0.85, ri(3, 5)]);
  }
  paintBlobs(x, bl, ['#1a2a10', '#2a4419', '#3c6024', '#557e30', '#76a044', '#98be5e'], {
    ao: 0.5,
    noise: 0.2
  });
  if (berries)
    for (let i = 0; i < 14; i++) {
      const a = ri(8, 30),
        b = ri(8, 25);
      R_(x, PAL.redD, a, b + 1, 3, 2);
      R_(x, PAL.red, a, b, 3, 2);
      R_(x, '#ff7a6a', a, b, 1, 1);
    }
  return outline(c, '#0f180a');
}
// ================= FLORA E FAUNA =================
function pxCanvas(P) {
  const [c, x] = mk(P.w, P.h);
  P.put(x, 0, 0);
  c.s = 2;
  return c;
}
function genDecoBase() {
  // panchina
  let P = new PX(40, 26),
    wd = ramp6('#8a5a32'),
    ir = ramp6('#3a3a40');
  for (const lx of [6, 32]) {
    P.capsule(lx, 14, lx, 24, 1.6, ir);
  }
  P.body(
    3,
    7,
    () => 20,
    () => 18,
    wd,
    { nyF: () => -0.2, mod: (X, Y, v) => (Y === 5 ? v - 0.25 : v) }
  );
  P.body(
    11,
    15,
    () => 20,
    () => 18.5,
    wd,
    { nyF: () => -0.8, mod: (X, Y, v) => (X % 9 === 0 ? v - 0.2 : v) }
  );
  P.outline();
  IMG.bench = pxCanvas(P);
  // erba alta (tre varianti)
  IMG.tuft = [0, 1, 2].map(v => {
    srand(700 + v);
    const [c, x] = mk(28, 30);
    c.s = 2;
    const cols = [GR[1], GR[2], GR[3], GR[4], GR[5], '#b8a050'];
    for (let i = 0; i < 16; i++) {
      const bx = ri(4, 23),
        h = ri(12, 26),
        lean = (rnd() - 0.5) * 8,
        dry = v === 2 && rnd() < 0.5;
      for (let k = 0; k < h; k++) {
        const t = k / h;
        x.fillStyle = dry ? (t > 0.7 ? '#e2c878' : '#b89a4a') : cols[Math.min(5, 1 + Math.floor(t * 4.5))];
        x.fillRect(Math.round(bx + lean * t * t), 29 - k, 1, 1);
      }
    }
    if (v === 1)
      for (let i = 0; i < 3; i++) {
        const a = ri(6, 20),
          b = ri(4, 12);
        x.fillStyle = '#f3e27a';
        x.fillRect(a, b, 2, 2);
        x.fillStyle = '#fff8c0';
        x.fillRect(a, b, 1, 1);
      }
    c.canopyH = 10;
    return outline(c, '#1e2a12');
  });
  // funghi
  IMG.mush = [0, 1].map(v => {
    P = new PX(22, 18);
    const cap = ramp6(v ? '#a07a5a' : '#d8c8a0'),
      st = ramp6('#efe6d2');
    for (const [mx, my, r] of v
      ? [
          [7, 9, 4.5],
          [15, 11, 3.5]
        ]
      : [
          [8, 10, 4],
          [14, 8, 5],
          [4, 13, 2.5]
        ]) {
      P.capsule(mx, my, mx, 17, 1.4, st);
      P.ellipse(mx, my, r, r * 0.62, cap, { spec: 0.5, clip: (X, Y) => Y < my + 1 });
      if (!v) P.set(mx - 1, my - 1, C('#fff8e8'));
    }
    P.outline();
    return pxCanvas(P);
  });
  // sassi
  IMG.rock = [0, 1, 2].map(v => {
    srand(720 + v);
    P = new PX(30, 22);
    const rr = ramp6(['#8a877d', '#7d7a70', '#94908a'][v]);
    P.ellipse(15, 13, 12 - v * 2, 7.5 - v, rr, { spec: 0.15, mod: (X, Y, vv) => vv + (rnd() - 0.5) * 0.15 });
    for (let i = 0; i < 8; i++) {
      const a = ri(6, 24 - v * 3),
        b = ri(6, 10);
      if (P.has(a, b)) P.set(a, b, C(['#5a7a34', '#4a6a2a', '#6a8a3a'][ri(0, 2)]));
    }
    P.outline();
    return pxCanvas(P);
  });
  // tronco caduto
  P = new PX(64, 26);
  const bk = ramp6('#6a4a2c'),
    inr = ramp6('#c9a070');
  P.capsule(8, 15, 56, 15, 7, bk, { mod: (X, Y, v) => ((X * 3 + Y * 7) % 11 === 0 ? v - 0.2 : v) });
  P.ellipse(57, 15, 4, 6.5, inr, {
    mod: (X, Y, v, n) => (Math.abs(Math.hypot(n[0], n[1]) - 0.5) < 0.1 ? v - 0.25 : v)
  });
  for (let i = 0; i < 6; i++) {
    const a = 10 + i * 7;
    P.set(a, 9, C('#5a8a34'));
    P.set(a + 1, 9, C('#4a7a2a'));
  }
  P.outline();
  IMG.log = pxCanvas(P);
  // canne di palude
  IMG.reed = [0, 1].map(v => {
    srand(740 + v);
    const [c, x] = mk(20, 34);
    c.s = 2;
    for (let i = 0; i < 6; i++) {
      const bx = ri(3, 16),
        h = ri(18, 32),
        lean = (rnd() - 0.5) * 5;
      for (let k = 0; k < h; k++) {
        x.fillStyle = k > h - 8 ? '#9aa858' : '#5a7a34';
        x.fillRect(Math.round(bx + (lean * k) / h), 33 - k, 1, 1);
      }
      if (rnd() < 0.6) {
        const tx = Math.round(bx + lean),
          ty = 33 - h;
        x.fillStyle = '#5a3a1e';
        x.fillRect(tx - 1, ty, 2, 6);
        x.fillStyle = '#7a5230';
        x.fillRect(tx - 1, ty, 1, 5);
      }
    }
    c.canopyH = 12;
    return outline(c, '#1a2410');
  });
  // girasole
  P = new PX(22, 48);
  const stm = ramp6('#4a7a2a'),
    pet = ramp6('#e8b830'),
    ctr = ramp6('#5a3a1e');
  P.capsule(11, 16, 11, 47, 1.4, stm);
  P.ellipse(6, 30, 4, 2, stm);
  P.ellipse(16, 36, 4, 2, stm);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 6.283;
    P.ellipse(11 + Math.cos(a) * 6, 11 + Math.sin(a) * 6, 2.6, 2.6, pet, { edge: false });
  }
  P.ellipse(11, 11, 4.2, 4.2, ctr, { mod: (X, Y, v) => ((X + Y) & 1 ? v - 0.1 : v) });
  P.outline();
  IMG.sunflower = pxCanvas(P);
  IMG.sunflower.canopyH = 14;
  // ninfea
  P = new PX(22, 12);
  const lp = ramp6('#3f7a3a');
  P.ellipse(11, 6, 9, 4.5, lp, { clip: (X, Y) => !(X > 11 && Math.abs(Y - 6) < 1.2) });
  P.ellipse(8, 5, 2, 1.6, ramp6('#f0e0f0'), { spec: 0.5 });
  P.outline();
  IMG.lily = pxCanvas(P);
  // ortensia
  P = new PX(30, 26);
  const lf = ramp6('#3a6028'),
    fl = ramp6('#8a8ad0'),
    fl2 = ramp6('#c8a0d8');
  P.ellipse(15, 16, 13, 9, lf);
  srand(760);
  for (let i = 0; i < 9; i++)
    P.ellipse(ri(6, 24), ri(7, 16), 3.4, 3, i % 2 ? fl : fl2, {
      mod: (X, Y, v) => ((X + Y) % 3 === 0 ? v - 0.12 : v)
    });
  P.outline();
  IMG.hydr = pxCanvas(P);
  genCritters();
}

// catena: altri file la avvolgono con Ext.avvolgi('genDeco', …)
function genDeco(...a) {
  return Ext.catena('genDeco', genDecoBase, this, a);
}

// ---------- animali: fotogrammi rivolti a destra (la sinistra è specchiata) ----------
const CRIT = {};
function critFrames(w, h, n, fn) {
  return Array.from({ length: n }, (_, f) => {
    const P = new PX(w, h);
    fn(P, f);
    P.outline();
    return pxCanvas(P);
  });
}
function genCrittersBase() {
  const wh = ramp6('#f2ece0'),
    rd = ramp6('#c8402a'),
    yl = ramp6('#e8a83a'),
    bk = ramp6('#2a2630'),
    br = ramp6('#8a6a48'),
    gr = ramp6('#4a7a3a');
  // gallina: 0-1 cammina, 2 becca
  CRIT.chicken = critFrames(24, 22, 3, (P, f) => {
    const peck = f === 2,
      hx = peck ? 18 : 16,
      hy = peck ? 13 : 6;
    for (const k of [0, 1]) {
      const lx = 10 + k * 3 + (f === 1 ? (k ? -1 : 1) : 0);
      P.capsule(lx, 15, lx + (f === 1 ? (k ? 1 : -1) : 0), 20, 0.7, yl, { edge: false });
    }
    P.ellipse(8, 12, 3.5, 3, wh);
    P.ellipse(11, 12, 7, 5, wh, { spec: 0.2 });
    P.ellipse(9, 11, 4, 2.6, wh, { mod: (X, Y, v) => v - 0.12 });
    P.ellipse(hx, hy + 2, 3.2, 3.2, wh);
    P.set(hx + 1, hy + 1, C('#14100c'));
    P.set(hx + 3, hy + 2, yl[4]);
    P.set(hx + 4, hy + 2, yl[3]);
    P.set(hx + 3, hy + 3, yl[2]);
    P.ellipse(hx - 0.5, hy - 1.2, 1.6, 1.4, rd, { edge: false });
    P.set(hx + 1, hy + 4, rd[3]);
  });
  // gatto: 0-1 cammina, 2 seduto, 3 dorme
  CRIT.cat = critFrames(30, 22, 4, (P, f) => {
    const c = bk;
    if (f === 3) {
      P.ellipse(15, 16, 10, 5, c, { spec: 0.3 });
      P.ellipse(23, 15, 4, 3.5, c);
      P.set(25, 12, c[2]);
      P.set(22, 12, c[2]);
      P.capsule(6, 18, 14, 20, 1.3, c);
      return;
    }
    if (f === 2) {
      P.capsule(6, 20, 4, 12, 1.4, c, { r2: 1 });
      P.ellipse(13, 15, 5.5, 6, c, { spec: 0.3 });
      P.capsule(15, 17, 15, 21, 1.2, c);
      P.ellipse(16, 8, 4, 3.6, c);
      P.ellipse(13.5, 4.6, 1.2, 1.8, c);
      P.ellipse(18.5, 4.6, 1.2, 1.8, c);
      P.set(15, 8, C('#e8d040'));
      P.set(18, 8, C('#e8d040'));
      return;
    }
    const st = f ? 1.5 : -1.5;
    P.capsule(3, 10, 6, 14, 1.2, c, { r2: 1.4 });
    for (const k of [0, 1]) P.capsule(9 + k * 9, 16, 9 + k * 9 + (k ? st : -st), 21, 1.2, c);
    P.ellipse(14, 14, 9, 4.5, c, { spec: 0.3 });
    P.ellipse(24, 10, 4, 3.6, c);
    P.ellipse(22, 6.5, 1.2, 1.8, c);
    P.ellipse(26, 6.5, 1.2, 1.8, c);
    P.set(26, 10, C('#e8d040'));
    P.set(27, 11, C('#e89090'));
  });
  // corvo: 0 posato, 1-2 vola
  CRIT.crow = critFrames(18, 16, 3, (P, f) => {
    const c = bk;
    if (f === 0) {
      P.capsule(7, 13, 7, 15, 0.5, yl, { edge: false });
      P.capsule(10, 13, 10, 15, 0.5, yl, { edge: false });
      P.ellipse(8, 10, 4.5, 3.5, c, { spec: 0.4 });
      P.capsule(3, 10, 1, 12, 1.2, c);
      P.ellipse(12, 7, 2.6, 2.4, c);
      P.set(13, 6, C('#c0c0c0'));
      P.set(15, 7, C('#3a3a40'));
      P.set(16, 7, C('#3a3a40'));
      return;
    }
    P.ellipse(9, 9, 4.5, 2.4, c, { spec: 0.4 });
    P.ellipse(13.5, 8, 2.2, 2, c);
    P.set(16, 8, C('#3a3a40'));
    const wy = f === 1 ? -5 : 4;
    P.capsule(8, 8, 5, 8 + wy, 1.6, c, { r2: 0.8 });
    P.capsule(10, 8, 12, 8 + wy * 0.8, 1.4, c, { r2: 0.7 });
  });
  // anatra: 0-1 nuota
  CRIT.duck = critFrames(26, 18, 2, (P, f) => {
    const bob = f ? 1 : 0;
    P.ellipse(11, 12 + bob, 8, 4, br, { spec: 0.2, mod: (X, Y, v) => (Y > 13 + bob ? v - 0.15 : v) });
    P.ellipse(9, 10.5 + bob, 5, 2.4, br, { mod: (X, Y, v) => v + 0.08 });
    P.ellipse(18, 6 + bob, 3.2, 3, gr, { spec: 0.5 });
    P.set(19, 5 + bob, C('#14100c'));
    P.set(21, 7 + bob, yl[3]);
    P.set(22, 7 + bob, yl[4]);
    P.set(21, 8 + bob, yl[2]);
    for (let X = 13; X < 18; X++) P.set(X, 8 + bob, wh[3]);
    for (let X = 3; X < 21; X++) P.set(X, 16, C('#9cc8e0'), f ? 120 : 70);
  });
  // coniglio: 0 seduto, 1-2 salta
  CRIT.rabbit = critFrames(22, 20, 3, (P, f) => {
    const c = ramp6('#9a8068'),
      lift = f === 1 ? -3 : f === 2 ? -1 : 0,
      str = f === 1 ? 2 : 0;
    P.ellipse(9 - str * 0.5, 14 + lift, 6 + str, 4.5, c, { spec: 0.2 });
    P.ellipse(4, 13 + lift, 2, 2, wh);
    P.ellipse(15, 10 + lift, 3.6, 3.2, c);
    P.capsule(14, 7 + lift, 13, 1 + lift, 1, c);
    P.capsule(16, 7 + lift, 17, 2 + lift, 1, c);
    P.set(17, 9 + lift, C('#14100c'));
    P.set(18, 11 + lift, C('#e09090'));
    if (!f) {
      P.ellipse(12, 18, 2, 1, c);
    }
  });
  // rana
  CRIT.frog = critFrames(14, 10, 2, (P, f) => {
    const c = ramp6('#5a8a3a');
    P.ellipse(7, 7, 5, 2.8, c, { spec: 0.4 });
    P.ellipse(10, 5, 2, 1.6, c);
    P.set(10, 4, C('#e8e070'));
    P.set(11, 4, C('#14100c'));
    if (f) P.ellipse(10, 8, 1.6, 1.2, ramp6('#e8e0a0'));
  });
}

// catena: altri file la avvolgono con Ext.avvolgi('genCritters', …)
function genCritters(...a) {
  return Ext.catena('genCritters', genCrittersBase, this, a);
}

// ---------- posizionamento decorazioni ----------
function addDeco(m, st) {
  srand(5150);
  const free = (x, y) => {
    const g = m.get(x, y);
    return (g === 1 || g === 12) && !m.hit[x + ',' + y] && !inFarm(x, y);
  };
  // panchine
  [
    [41, 22], // panchine sul lato sud della piazza, ai lati dell'ingresso (44-45)
    [47, 22],
    [47, 40],
    [27, 21]
  ].forEach(([x, y]) => m.add(OB('bench', x, y, IMG.bench, { act: 'bench' })));
  // girasoli e ortensie vicino alle case
  [
    [6, 10],
    [15, 10], // non davanti alla cassetta (13,9): si vende da lì
    [32, 29],
    [38, 29],
    [56, 17],
    [51, 17]
  ].forEach(([x, y], i) => {
    if (free(x, y))
      m.add(
        OB(i < 4 ? 'sunflower' : 'hydr', x, y, i < 4 ? IMG.sunflower : IMG.hydr, {
          act: i < 4 ? 'sunflower' : 'hydr'
        })
      );
  });
  // sassi e tronchi
  for (let i = 0; i < 40; i++) {
    const x = ri(5, 58),
      y = ri(5, 40);
    if (free(x, y) && free(x + 1, y) && rnd() < 0.5)
      m.add(OB('rock', x, y, IMG.rock[ri(0, 2)], { act: 'rock' }));
  }
  [
    [24, 38],
    [34, 36],
    [17, 7]
  ].forEach(([x, y]) => {
    if (free(x, y) && free(x + 1, y) && free(x + 2, y) && free(x + 3, y))
      m.add(
        OB('log', x, y, IMG.log, {
          wt: 4,
          act: 'log',
          solid: [
            [x, y],
            [x + 1, y],
            [x + 2, y],
            [x + 3, y]
          ],
          hits: [
            [x, y],
            [x + 1, y],
            [x + 2, y],
            [x + 3, y]
          ]
        })
      );
  });
  // canne e ninfee sul fiume
  for (let x = 4; x < 60; x++) {
    if (x >= 42 && x <= 47) continue;
    if (rnd() < 0.45) {
      const o = OB('reed', x, 43, IMG.reed[ri(0, 1)], { solid: [], hits: [], lift: -9 });
      o.dx += ri(-4, 4);
      m.add(o);
    }
    if (rnd() < 0.12)
      m.add({
        kind: 'lily',
        tx: x,
        ty: 44,
        img: IMG.lily,
        dx: x * 16 + ri(-3, 3),
        dy: 44 * 16 + ri(0, 6),
        sy: -1,
        solid: [],
        hits: [],
        deco: 1
      });
  }
}
function addFlora(m) {
  srand(5151);
  const free = (x, y) => {
    const g = m.get(x, y);
    return (g === 1 || g === 12) && !m.hit[x + ',' + y] && !inFarm(x, y);
  };
  for (let i = 0; i < 260; i++) {
    const x = ri(4, 59),
      y = ri(4, 41);
    if (!free(x, y)) continue;
    const o = OB('tuft', x, y, IMG.tuft[ri(0, 2)], { solid: [], hits: [] });
    o.dx += ri(-5, 5);
    o.dy += ri(-4, 2);
    o.sy += ri(-4, 2);
    m.add(o);
  }
  for (const o of m.objs.slice()) {
    if (o.kind === 'tree' && rnd() < 0.35) {
      const x = o.tx + ri(-1, 1),
        y = o.ty + 1;
      if (free(x, y))
        m.add(
          Object.assign(OB('mush', x, y, IMG.mush[ri(0, 1)], { solid: [], hits: [], act: 'mush' }), {
            hits: [[x, y]]
          })
        );
    }
  }
}
// ---------- animali vivi ----------
const CR_ZONE = {
  chicken: [51, 32, 59, 38],
  cat: [30, 12, 56, 34],
  rabbit: [5, 36, 40, 41],
  duck: [4, 43, 60, 44],
  frog: [4, 42, 60, 42]
};
function spawnCritters() {
  const L = [];
  const add = (k, n) => {
    const z = CR_ZONE[k];
    for (let i = 0; i < n; i++)
      L.push({
        k,
        x: (z[0] + Math.random() * (z[2] - z[0])) * 16 + 8,
        y: (z[1] + Math.random() * (z[3] - z[1])) * 16 + 12,
        dir: Math.random() < 0.5 ? 1 : -1,
        st: 'idle',
        t: Math.random() * 3,
        f: 0,
        tx: null,
        ty: null,
        z
      });
  };
  add('chicken', 4);
  add('cat', 1);
  add('rabbit', 3);
  add('duck', 3);
  const perches = [
    [13, 22, -10],
    [7, 3, -12],
    [18, 3, -12],
    [25, 3, -12],
    [36, 3, -12],
    [57, 3, -12],
    [60, 14, -8],
    [3, 32, -8]
  ];
  for (let i = 0; i < (H2() ? 7 : 4); i++) {
    const p = perches[i % perches.length];
    L.push({
      k: 'crow',
      x: p[0] * 16 + 8,
      y: p[1] * 16 + 14,
      oy: p[2],
      dir: Math.random() < 0.5 ? 1 : -1,
      st: 'perch',
      t: 0,
      f: 0,
      home: p
    });
  }
  G.critters = L;
}
function updCritters(dt) {
  const m = G.map;
  if (!m || m.id !== 'main' || !G.critters) return;
  const p = G.player,
    night = G.night > 0.6,
    rain = G.st.weather === 'pioggia';
  const tb = NPC('tobia'),
    tbv = tb && !tb.hidden && tb.map === 'main' ? tb : null;
  if (tb && tb.chaseT > 0) tb.chaseT -= dt;
  for (const c of G.critters) {
    c.t -= dt;
    const dx = c.x - p.x,
      dy = c.y - p.y,
      d = Math.hypot(dx, dy);
    if (c.k === 'crow') {
      if (c.st === 'perch') {
        if (d < 44 && G.mode === 'game') {
          c.st = 'fly';
          c.vx = (dx < 0 ? -1 : 1) * (50 + Math.random() * 20);
          c.vy = -40;
          c.dir = Math.sign(c.vx);
          AU.play('caw');
        }
      } else {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.vy += 6 * dt;
        c.f += dt * 10;
        if (c.y < G.cam.y - 60 || c.x < G.cam.x - 80 || c.x > G.cam.x + VW + 80) {
          if (c.t < -12) {
            const h = c.home;
            c.x = h[0] * 16 + 8;
            c.y = h[1] * 16 + 14;
            c.st = 'perch';
          }
        } else c.t = 0;
      }
      continue;
    }
    if (c.k === 'duck') {
      if (c.t <= 0) {
        c.t = 2 + Math.random() * 4;
        c.vx = (Math.random() - 0.5) * 14;
        if (c.vx) c.dir = Math.sign(c.vx);
      }
      c.x = clamp(c.x + c.vx * dt, c.z[0] * 16, c.z[2] * 16);
      if (c.x >= 42 * 16 && c.x <= 47 * 16) c.vx = c.x < 44.5 * 16 ? -8 : 8;
      c.f += dt * 2;
      continue;
    }
    const td = c.k === 'chicken' && tbv ? Math.hypot(c.x - tbv.x, c.y - tbv.y) : 1e9,
      flee = (c.k === 'rabbit' && d < 60) || (c.k === 'chicken' && (d < 26 || td < 26));
    const sp = { chicken: 22, cat: 24, rabbit: 70 }[c.k] * (flee ? 1.6 : 1);
    if (flee) {
      const fT = td < d,
        ux = fT ? c.x - tbv.x : dx,
        uy = fT ? c.y - tbv.y : dy,
        ud = Math.hypot(ux, uy) || 1;
      c.tx = c.x + (ux / ud) * 40;
      c.ty = c.y + (uy / ud) * 30;
      c.st = 'move';
      if (fT && !(tb.chaseT > 0)) {
        tb.chaseT = 6;
        bubble(tb, 'Cip cip cip!', 1.6);
      }
    }
    if (c.st === 'idle' && c.t <= 0) {
      c.t = 1.5 + Math.random() * 4;
      const z = c.z;
      if (c.k === 'cat' && d < 120 && Math.random() < 0.4 && G.mode === 'game') {
        c.tx = p.x + (Math.random() - 0.5) * 30;
        c.ty = p.y + 10;
      } else {
        c.tx = (z[0] + Math.random() * (z[2] - z[0])) * 16 + 8;
        c.ty = (z[1] + Math.random() * (z[3] - z[1])) * 16 + 12;
      }
      c.st = c.k === 'cat' && Math.random() < 0.35 ? (Math.random() < 0.5 ? 'sit' : 'sleep') : 'move';
    }
    if ((c.st === 'sit' || c.st === 'sleep') && c.t <= 0) {
      c.st = 'idle';
      c.t = 4 + Math.random() * 6;
    }
    if (c.st === 'move') {
      const ex = c.tx - c.x,
        ey = c.ty - c.y,
        e = Math.hypot(ex, ey);
      if (e < 2) {
        c.st = 'idle';
        c.t = night || rain ? 4 : 1 + Math.random() * 3;
      } else {
        const nx = c.x + (ex / e) * sp * dt,
          ny = c.y + (ey / e) * sp * dt;
        const [ttx, tty] = [Math.floor(nx / 16), Math.floor((ny - 3) / 16)];
        if (m.solid(ttx, tty)) {
          c.st = 'idle';
          c.t = 0.5;
        } else {
          c.x = nx;
          c.y = ny;
          c.dir = ex < 0 ? -1 : 1;
          c.f += dt * (c.k === 'rabbit' ? 8 : 7);
        }
      }
    }
    if (c.k === 'chicken' && c.st === 'idle' && Math.random() < dt * 0.6) c.peck = 0.5;
    if (c.peck > 0) c.peck -= dt;
    if (c.k === 'chicken' && d < 140 && Math.random() < dt * 0.05) AU.play('cluck');
  }
  // rane di notte e pesci che saltano
  if (night && Math.random() < dt * 0.25 && p.y > 36 * 16) AU.play('croak');
  if (!night && Math.random() < dt * 0.08) {
    const x = G.cam.x + Math.random() * VW,
      y = 43 * 16 + 6 + Math.random() * 16;
    if (y > G.cam.y && y < G.cam.y + VH && m.get(Math.floor(x / 16), Math.floor(y / 16)) === 3) {
      for (let i = 0; i < 6; i++)
        G.parts.push({
          k: 'water',
          x,
          y,
          vx: (Math.random() - 0.5) * 30,
          vy: -30 - Math.random() * 20,
          t: 0,
          life: 0.5
        });
    }
  }
}
function critImg(c) {
  const F = CRIT[c.k];
  if (c.k === 'chicken') return F[c.peck > 0 ? 2 : c.st === 'move' ? Math.floor(c.f) % 2 : 0];
  if (c.k === 'cat')
    return F[c.st === 'sit' ? 2 : c.st === 'sleep' ? 3 : c.st === 'move' ? Math.floor(c.f) % 2 : 2];
  if (c.k === 'crow') return F[c.st === 'perch' ? 0 : 1 + (Math.floor(c.f) % 2)];
  if (c.k === 'duck') return F[Math.floor(c.f) % 2];
  if (c.k === 'rabbit') return F[c.st === 'move' ? 1 + (Math.floor(c.f) % 2) : 0];
  return F[0];
}
function drawCritter(c) {
  const img = critImg(c),
    w = iw(img),
    h = ih(img),
    X = Math.round(c.x),
    Y = Math.round(c.y + (c.oy || 0));
  if ((c.k !== 'crow' && c.k !== 'duck') || c.st === 'perch') {
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(X - w * 0.3, Math.round(c.y) - 2, w * 0.6, 2);
  }
  if (c.dir < 0) {
    ctx.save();
    ctx.translate(X, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, Y - h, w, h);
    ctx.restore();
  } else ctx.drawImage(img, X - w / 2, Y - h, w, h);
}
// ================= OGGETTI HD (volumi e luce, risoluzione doppia) =================
const SP = (w, h, fn) => {
  const P = new PX(w * 2, h * 2);
  fn(P);
  P.outline();
  return pxCanvas(P);
};
const RP = {};
const rp = h => RP[h] || (RP[h] = ramp6(h));
const woodMod = (X, Y, v) =>
  v + ((X * 7 + Y * 13) % 17 === 0 ? -0.18 : 0) + ((Y * 3 + X) % 23 === 0 ? 0.1 : 0);
function genPropsHDBase() {
  PX.prototype.rect = function (x0, y0, w, h, ramp, o = {}) {
    const n = o.n || [0, -0.15, 1];
    this.shape(
      x0,
      y0,
      x0 + w - 1,
      y0 + h - 1,
      (X, Y) => (X >= x0 && X < x0 + w && Y >= y0 && Y < y0 + h && (!o.clip || o.clip(X, Y)) ? n : null),
      ramp,
      o
    );
  };
  PX.prototype.line = function (x0, y0, x1, y1, c, a = 255) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c, a);
  };

  const wood = rp('#8a5a32'),
    woodD = rp('#5a3a1e'),
    iron = rp('#3e3e46'),
    stone = rp('#8a877d'),
    gold = rp('#d8a84a'),
    straw = rp('#d0aa4a'),
    cream = rp('#efe2c2');
  // pozzo
  IMG.well = SP(18, 26, P => {
    P.capsule(6, 8, 6, 30, 2.2, woodD);
    P.capsule(30, 8, 30, 30, 2.2, woodD);
    P.capsule(6, 10, 30, 10, 1.2, wood);
    P.line(18, 10, 18, 24, C('#c9a060'));
    P.ellipse(18, 26, 3.4, 2.6, rp('#6a6a72'), { spec: 0.5 });
    P.body(
      28,
      50,
      () => 18,
      () => 14,
      stone,
      {
        nyF: () => 0.1,
        mod: (X, Y, v) => {
          const row = Math.floor((Y - 28) / 5),
            off = row % 2 ? 4 : 0;
          if ((Y - 28) % 5 === 0 || (X + off) % 9 === 0) return v - 0.3;
          return v + (((X * 5 + Y * 3) % 7) - 3) * 0.02;
        }
      }
    );
    P.ellipse(18, 28, 14, 4.5, stone, { n: 0, clip: (X, Y) => true });
    P.ellipse(18, 28, 11, 3, rp('#1a2a36'), { amb: 0.1 });
    P.body(
      0,
      9,
      () => 18,
      Y => 8 + Y * 1.2,
      rp('#5a3c6e'),
      { nyF: () => -0.6, mod: (X, Y, v) => (Y % 3 === 0 ? v - 0.25 : v) }
    );
  });
  // bacheca
  IMG.board = SP(18, 26, P => {
    P.capsule(7, 26, 7, 50, 1.8, woodD);
    P.capsule(29, 26, 29, 50, 1.8, woodD);
    P.rect(2, 4, 32, 26, wood, { mod: woodMod });
    P.rect(2, 2, 32, 3, woodD);
    [
      [6, 9, 12, 14],
      [20, 10, 10, 11],
      [8, 24, 9, 4]
    ].forEach(([x, y, w, h]) => {
      P.rect(x, y, w, h, cream, { n: [-0.1, -0.2, 1] });
      for (let k = 2; k < h - 1; k += 2) P.line(x + 2, y + k, x + w - 3, y + k, C('#8a8070'));
    });
    P.ellipse(12, 9, 1.6, 1.6, rp('#e8c23a'), { spec: 1 });
    P.ellipse(25, 10, 1.4, 1.4, rp('#e8c23a'), { spec: 1 });
  });
  // ceppo
  const stumpP = P => {
    P.body(
      10,
      26,
      () => 16,
      () => 12,
      rp('#6a4428'),
      { nyF: () => 0.1, mod: (X, Y, v) => (X % 4 === 0 ? v - 0.2 : v) }
    );
    P.ellipse(16, 10, 12, 5, rp('#c49a68'), {
      n: 0,
      mod: (X, Y, v, n) => {
        const r = Math.hypot(n[0], n[1] * 1);
        return Math.floor(r * 5) % 2 ? v - 0.12 : v;
      }
    });
    for (const [a, b] of [
      [3, 25],
      [29, 25]
    ])
      P.ellipse(a, b, 3, 2, rp('#6a4428'));
  };
  IMG.stump = SP(16, 14, stumpP);
  IMG.stumpB = SP(16, 14, P => {
    stumpP(P);
    P.ellipse(16, 8, 6.5, 3.5, rp('#e0a64a'), {
      spec: 0.4,
      mod: (X, Y, v) => ((X + Y) % 5 === 0 ? v - 0.2 : v)
    });
  });
  IMG.stumpH = SP(16, 14, P => {
    stumpP(P);
    P.ellipse(16, 10, 6, 3, rp('#1a0e08'), { amb: 0.05 });
    P.set(16, 9, C('#ff6a1a'));
    P.set(17, 10, C('#ffb04a'));
    P.set(14, 10, C('#c03a10'));
  });
  // lampione
  IMG.lamp = SP(12, 36, P => {
    P.capsule(12, 22, 12, 68, 1.6, iron, { spec: 0.6 });
    P.ellipse(12, 68, 5, 2.2, iron);
    P.rect(5, 4, 14, 16, iron, { spec: 0.5 });
    P.rect(7, 6, 10, 12, rp('#ffe08a'), {
      amb: 0.9,
      edge: false,
      mod: (X, Y, v) => (X === 11 || X === 12 ? v - 0.3 : v)
    });
    P.body(
      0,
      5,
      () => 12,
      Y => 3 + Y * 1.6,
      iron,
      { nyF: () => -0.7, spec: 0.6 }
    );
    P.capsule(12, 20, 12, 23, 2.4, iron);
  });
  // cassetta spedizioni
  IMG.bin = SP(18, 16, P => {
    P.rect(2, 8, 32, 22, wood, { mod: (X, Y, v) => ((Y - 8) % 7 === 0 ? v - 0.3 : woodMod(X, Y, v)) });
    P.rect(1, 4, 34, 6, woodD, { n: [0, -0.8, 0.6] });
    P.rect(14, 14, 8, 5, gold, { spec: 0.6 });
    P.rect(3, 9, 2, 20, woodD);
    P.rect(31, 9, 2, 20, woodD);
  });
  // spaventapasseri
  IMG.scare = [0, 1].map(v =>
    SP(20, 34, P => {
      P.capsule(20, 22, 20, 66, 1.8, woodD);
      P.capsule(3, 28, 37, 28, 1.6, woodD);
      P.body(
        26,
        46,
        () => 20,
        Y => 9 - (Y - 26) * 0.1,
        rp('#7a8a4a'),
        { nyF: () => 0.1, mod: (X, Y, vv) => ((X + Y) % 9 === 0 ? vv - 0.25 : vv) }
      );
      P.rect(16, 32, 3, 3, rp('#a05a3a'));
      P.rect(23, 38, 3, 3, rp('#5a6a8a'));
      for (const s of [-1, 1])
        for (let k = 0; k < 4; k++)
          P.line(20 + s * 15, 29, 20 + s * (18 + (k % 2)), 31 + k * 2, C(k % 2 ? '#e2c060' : '#c09a40'));
      for (let k = 0; k < 5; k++) P.line(17 + k * 1.5, 46, 16 + k * 2, 52, C('#d0aa4a'));
      P.ellipse(20, 16, 8, 8, rp('#d9c08a'), { mod: (X, Y, vv) => ((X + Y * 2) % 5 === 0 ? vv - 0.12 : vv) });
      P.body(
        2,
        8,
        () => 20,
        Y => 4 + Y * 0.9,
        straw,
        { nyF: () => -0.6 }
      );
      P.ellipse(20, 9, 13, 2.8, straw);
      if (!v) {
        P.set(16, 15, C('#2b1a10'));
        P.set(23, 15, C('#2b1a10'));
        for (let k = 0; k < 8; k++) P.set(16 + k, 20 + (k % 2), C('#5a3a1e'));
      } else {
        P.ellipse(16, 15, 1.8, 2.2, rp('#050203'), { edge: false });
        P.ellipse(24, 15, 1.8, 2.2, rp('#050203'), { edge: false });
        P.set(16, 15, C('#ff2a1a'));
        P.set(24, 15, C('#ff2a1a'));
        for (let k = 0; k < 12; k++) {
          P.set(14 + k, 20 + Math.round(Math.sin(k * 1.4)), C('#050203'));
          if (k % 2) P.set(14 + k, 21, C('#050203'));
        }
      }
    })
  );
  // lapidi
  IMG.grave = [0, 1, 2].map(v =>
    SP(14, 16, P => {
      const s = rp(['#8d8a84', '#7a7770', '#9a968f'][v]);
      P.body(
        7,
        30,
        () => 14,
        () => 10,
        s,
        { nyF: () => 0.05, mod: (X, Y, vv) => vv + (((X * 3 + Y * 5) % 11) - 5) * 0.015 }
      );
      P.ellipse(14, 8, 10, 6, s, { clip: (X, Y) => Y < 8.5 });
      P.line(9, 13, 19, 13, C(shade(['#8d8a84', '#7a7770', '#9a968f'][v], -0.4)));
      P.line(9, 17, 18, 17, C(shade(['#8d8a84', '#7a7770', '#9a968f'][v], -0.4)));
      P.line(10, 21, 17, 21, C(shade(['#8d8a84', '#7a7770', '#9a968f'][v], -0.4)));
      for (let i = 0; i < 6; i++) P.set(5 + i * 3.5, 29 - (i % 2), C('#5a7a3a'));
      P.rect(2, 28, 24, 4, rp('#4a6a2a'), { n: [0, -0.8, 0.6] });
    })
  );
  IMG.cross = SP(14, 18, P => {
    const s = rp('#7a7670');
    P.capsule(14, 3, 14, 30, 2.2, s);
    P.capsule(6, 11, 22, 11, 2, s);
    P.rect(4, 30, 20, 4, rp('#4a6a2a'), { n: [0, -0.8, 0.6] });
    P.ellipse(10, 30, 3, 1.5, rp('#e8c23a'), { edge: false });
    P.ellipse(18, 31, 2.5, 1.4, rp('#f4ecd8'), { edge: false });
  });
  IMG.nameless = SP(16, 18, P => {
    const s = rp('#2e2e34');
    P.body(
      10,
      34,
      () => 16,
      () => 11,
      s,
      { spec: 0.8, sp: 20 }
    );
    P.ellipse(16, 10, 11, 7, s, { clip: (X, Y) => Y < 10.5, spec: 0.8, sp: 20 });
    for (let k = 0; k < 3; k++) P.line(10, 16 + k * 4, 22 - k * 2, 16 + k * 4, C('#121216'));
  });
  // foglie ammucchiate
  IMG.leaves = SP(16, 10, P => {
    srand(55);
    const r = [rp('#c96a2a'), rp('#e2b23b'), rp('#a85d1a')];
    for (let i = 0; i < 14; i++)
      P.ellipse(4 + rnd() * 24, 6 + rnd() * 10, 3 + rnd() * 3, 2 + rnd() * 1.5, r[i % 3], { spec: 0.2 });
  });
  // zucche
  const pump = (P, ox = 0, oy = 0, sc = 1, face) => {
    const pr = rp('#d86a18');
    for (const [a, r] of [
      [-6, 6],
      [6, 6],
      [0, 8]
    ])
      P.ellipse(16 * sc + ox + a * sc, 19 * sc + oy, r * sc, 9 * sc, pr, {
        spec: 0.35,
        mod: (X, Y, v, n) => (Math.abs(n[0]) > 0.85 ? v - 0.25 : v)
      });
    P.capsule(16 * sc + ox, 10 * sc + oy, 17 * sc + ox, 4 * sc + oy, 1.6 * sc, rp('#4a6a2a'));
    P.ellipse(20 * sc + ox, 7 * sc + oy, 3 * sc, 1.6 * sc, rp('#5a8a34'));
    if (face) {
      const fc = face === 'lit' ? C('#ffd84a') : C('#2b1205'),
        fc2 = face === 'lit' ? C('#fff4b0') : C('#1a0a02');
      for (const ex of [11, 19]) {
        for (let k = 0; k < 3; k++) {
          P.set(ex * sc + ox + k, 16 * sc + oy + k * 0, fc);
          P.set(ex * sc + ox + 1, 15 * sc + oy, fc2);
        }
        P.set(ex * sc + ox, 17 * sc + oy, fc);
        P.set(ex * sc + ox + 1, 17 * sc + oy, fc);
      }
      for (let k = 0; k < 11; k++) P.set(10 * sc + ox + k, 23 * sc + oy + (k % 3 === 1 ? 1 : 0), fc);
      for (const k of [1, 4, 7, 10]) P.set(10 * sc + ox + k, 24 * sc + oy, fc);
    }
  };
  IMG.pumpkin = SP(16, 16, P => pump(P));
  IMG.jack = SP(16, 16, P => pump(P, 0, 0, 1, 'dark'));
  IMG.jackL = SP(16, 16, P => pump(P, 0, 0, 1, 'lit'));
  // balla di fieno
  IMG.hay = SP(18, 14, P => {
    srand(612);
    P.body(
      6,
      26,
      () => 18,
      () => 16,
      straw,
      { nyF: () => 0.05, mod: (X, Y, v) => v + (rnd() - 0.5) * 0.3 + ((X * 3 + Y) % 5 === 0 ? -0.15 : 0) }
    );
    P.rect(2, 4, 32, 4, straw, { n: [0, -0.9, 0.4], mod: (X, Y, v) => v + (rnd() - 0.5) * 0.3 });
    for (const y of [12, 20]) P.line(2, y, 34, y, C('#7a5a1a'));
    for (let i = 0; i < 8; i++) P.line(4 + i * 4, 3, 5 + i * 4, 1, C('#e8cc70'));
  });
  // incudine
  IMG.anvil = SP(18, 14, P => {
    const a = rp('#4a4a54');
    P.rect(12, 16, 12, 8, a, { spec: 0.5 });
    P.rect(8, 24, 20, 4, a);
    P.body(
      7,
      16,
      () => 18,
      Y => (Y < 9 ? 14 : 11),
      a,
      { nyF: Y => (Y < 9 ? -0.8 : 0.1), spec: 0.9, sp: 22 }
    );
    P.ellipse(4, 10, 4, 2.6, a, { spec: 0.8 });
  });
  // banco del mercato
  // il banco di Agatha: la merce cambia con la stagione (0 autunno, 1 inverno, 2 primavera, 3 estate)
  const stallS = season =>
    SP(50, 32, P => {
      const st = rp('#e8c23a');
      P.capsule(6, 8, 6, 62, 1.8, woodD);
      P.capsule(94, 8, 94, 62, 1.8, woodD);
      P.rect(4, 30, 92, 30, wood, { mod: (X, Y, v) => ((Y - 30) % 8 === 0 ? v - 0.3 : woodMod(X, Y, v)) });
      P.rect(2, 27, 96, 4, woodD, { n: [0, -0.8, 0.6] });
      P.shape(
        2,
        2,
        98,
        24,
        (X, Y) => {
          const sc = Y > 18 + ((X - 2) % 8 < 4 ? (X - 2) % 8 : 8 - ((X - 2) % 8)) * 0.6;
          if (sc) return null;
          return [0, -0.3 + (Y - 2) / 40, 1];
        },
        st,
        { mod: (X, Y, v) => (Math.floor((X - 2) / 8) % 2 ? v + 0.5 : v) }
      );
      const E = (x, y, rx, ry, c, o) =>
        P.ellipse(x, y, rx, ry, rp(c), Object.assign({ spec: 0.35 }, o || {}));
      if (season === 0) {
        pump(P, 2, 12, 0.85);
        pump(P, 22, 14, 0.7);
        E(56, 26, 5, 4, '#e9e1f0');
        E(64, 27, 5, 4, '#e9e1f0');
        P.ellipse(60, 24, 5, 3, rp('#8a5aa8'), { edge: false, clip: (X, Y) => Y < 24 });
        E(80, 26, 6, 5, '#a07a4a', { spec: 0.2 });
        E(88, 27, 5, 4, '#b08a5a', { spec: 0.2 });
      } else if (season === 1) {
        for (const [x, r] of [
          [12, 8],
          [28, 7]
        ]) {
          E(x, 24, r, 6, '#2f5a4a', { mod: (X, Y, v) => ((X * 3 + Y * 5) % 7 === 0 ? v - 0.22 : v) });
          E(x, 22, r * 0.6, 3, '#3e7060', { edge: false });
        }
        for (let i = 0; i < 4; i++) {
          P.capsule(52 + i * 4, 28, 52 + i * 4, 16, 1.6, rp('#f2f0e0'));
          P.capsule(52 + i * 4, 17, 50 + i * 4, 10, 1, rp('#5a8a4a'));
        }
        for (const x of [78, 88]) {
          P.rect(x - 4, 18, 8, 10, rp('#c8202a'), { spec: 0.6 });
          P.rect(x - 4, 16, 8, 3, rp('#e8dcc0'));
        }
      } else if (season === 2) {
        for (let i = 0; i < 9; i++)
          E(6 + (i % 5) * 7, 22 + Math.floor(i / 5) * 5, 3, 3.4, '#d8302a', { spec: 0.7 });
        for (const x of [56, 66]) E(x, 24, 6, 5, '#8ac83a');
        for (let i = 0; i < 4; i++) {
          P.capsule(78 + i * 4, 28, 80 + i * 4, 18, 1.6, rp('#e8781a'), { r2: 0.8 });
          P.capsule(80 + i * 4, 18, 80 + i * 4, 13, 0.8, rp('#5a9a2a'));
        }
      } else {
        for (let i = 0; i < 6; i++)
          E(8 + (i % 3) * 9, 24 - Math.floor(i / 3) * 5, 4, 4, '#e0402a', { spec: 0.7 });
        E(60, 24, 11, 7, '#3a7a2a', { mod: (X, Y, v) => ((X + 2) % 6 < 2 ? v - 0.25 : v) });
        for (let i = 0; i < 3; i++)
          P.capsule(78 + i * 6, 28, 80 + i * 6, 14, 2.4, rp('#f0c83a'), { r2: 1.6, spec: 0.4 });
      }
      P.body(
        32,
        46,
        () => 45,
        () => 5,
        rp('#c9b080'),
        { nyF: () => 0.1 }
      );
    });
  IMG.stallS = [0, 1, 2, 3].map(stallS);
  IMG.stall = IMG.stallS[0];
  // botte
  IMG.barrel = SP(14, 16, P => {
    P.body(
      5,
      30,
      () => 14,
      Y => 9 + Math.sin(((Y - 5) / 25) * Math.PI) * 1.5,
      wood,
      { nyF: () => 0.05, spec: 0.2, mod: (X, Y, v) => ((X + 1) % 4 === 0 ? v - 0.2 : v) }
    );
    P.ellipse(14, 5, 9, 2.6, rp('#6a4428'));
    for (const y of [10, 24]) {
      for (let X = 4; X < 25; X++)
        if (P.has(X, y)) {
          P.set(X, y, C(X < 10 ? '#7a7a84' : '#3a3a40'));
          P.set(X, y + 1, C('#2a2a30'));
        }
    }
    P.ellipse(14, 5, 4, 1.2, gold, { edge: false });
  });
  // ---------- interni ----------
  IMG.bed = SP(18, 34, P => {
    P.rect(2, 2, 32, 64, woodD, { mod: woodMod });
    P.ellipse(18, 13, 13, 6, cream, { spec: 0.2 });
    const q = rp('#e8c23a');
    P.rect(4, 22, 28, 42, q, {
      n: [0, -0.1, 1],
      mod: (X, Y, v) =>
        (X - 4) % 7 === 0 || (Y - 22) % 7 === 0 ? v - 0.25 : (X + Y) % 14 === 0 ? v + 0.2 : v
    });
    P.rect(4, 22, 28, 3, cream);
  });
  const chestP = (P, open) => {
    P.rect(2, 10, 32, 20, wood, { mod: woodMod });
    P.rect(2, open ? 2 : 4, 32, open ? 6 : 10, woodD, { n: [0, -0.6, 0.8], mod: woodMod });
    for (const x of [6, 28]) P.rect(x, 4, 2, 26, iron, { spec: 0.5 });
    P.rect(15, 14, 6, 6, gold, { spec: 0.7 });
    if (open) P.rect(4, 8, 28, 4, rp('#1a0e08'), { amb: 0 });
  };
  IMG.chest = SP(18, 16, P => chestP(P, 0));
  IMG.chestO = SP(18, 16, P => chestP(P, 1));
  IMG.fire = [0, 1].map(f =>
    SP(34, 32, P => {
      P.rect(2, 8, 64, 56, stone, {
        mod: (X, Y, v) => {
          const row = Math.floor((Y - 8) / 6),
            off = row % 2 ? 6 : 0;
          return (Y - 8) % 6 === 0 || (X + off) % 12 === 0 ? v - 0.3 : v + (((X * 5 + Y * 3) % 7) - 3) * 0.02;
        }
      });
      P.rect(0, 4, 68, 6, stone, { n: [0, -0.8, 0.6] });
      P.rect(14, 24, 40, 38, rp('#1a0e08'), { amb: 0, edge: false });
      srand(900 + f);
      P.capsule(20, 58, 48, 56, 2.4, rp('#5a3a1e'));
      for (let i = 0; i < 9; i++) {
        const x = 22 + rnd() * 24,
          h = 8 + rnd() * 14;
        P.ellipse(x, 56 - h / 2, 2.4 + rnd() * 2, h / 2, rp(['#ff8a2a', '#ffd24a', '#e0521a'][i % 3]), {
          amb: 0.8,
          edge: false
        });
      }
    })
  );
  IMG.table = SP(34, 22, P => {
    P.rect(2, 4, 64, 14, rp('#9a6a3c'), { n: [0, -0.7, 0.7], mod: woodMod });
    P.rect(2, 18, 64, 4, woodD);
    for (const x of [6, 58]) P.rect(x, 20, 5, 22, woodD);
    P.ellipse(24, 10, 6, 3, cream, { spec: 0.3 });
    P.ellipse(46, 9, 2.2, 3.4, gold, { spec: 0.8 });
  });
  IMG.feast = SP(48, 24, P => {
    const cloth = rp('#e8c23a'),
      orange = rp('#d86a18');
    for (const x of [6, 84]) P.rect(x, 30, 5, 16, woodD);
    P.rect(2, 14, 92, 18, rp('#9a6a3c'), { n: [0, -0.7, 0.7], mod: woodMod });
    P.rect(4, 12, 88, 14, cloth, {
      n: [0, -0.5, 0.8],
      mod: (X, Y, v) => (((X >> 2) + (Y >> 2)) % 2 ? v - 0.06 : v)
    });
    P.rect(4, 26, 88, 5, cloth, { n: [0, 0.3, 0.9], mod: (X, Y, v) => (X % 6 < 3 ? v - 0.12 : v) });
    for (const x of [22, 72]) P.ellipse(x, 10, 7, 6, orange, { spec: 0.35 });
    P.ellipse(48, 11, 5, 4.4, orange, { spec: 0.35 });
    for (const x of [34, 60]) {
      P.capsule(x, 3, x, 10, 1.5, cream);
      P.set(x, 1, C('#ffd84a'));
      P.set(x, 2, C('#fff4b0'));
    }
    for (const x of [12, 34, 58, 80]) P.ellipse(x, 21, 4, 1.8, cream, { spec: 0.4 });
  });
  IMG.portrait = [0, 1].map(v =>
    SP(16, 16, P => {
      P.rect(2, 2, 28, 28, gold, {
        spec: 0.6,
        mod: (X, Y, vv) => (X > 4 && X < 27 && Y > 4 && Y < 27 ? null : vv)
      });
      P.rect(5, 5, 22, 22, rp('#3a3a46'), { amb: 0.4 });
      if (!v) {
        P.ellipse(16, 14, 5, 6, rp('#f2c79b'));
        P.ellipse(16, 10, 5.5, 3, rp('#6b3e1f'), { clip: (X, Y) => Y < 11 });
        P.body(
          21,
          27,
          () => 16,
          () => 8,
          rp('#4f7fbf')
        );
        P.set(14, 14, C('#2b1a10'));
        P.set(18, 14, C('#2b1a10'));
      } else {
        P.body(
          21,
          27,
          () => 16,
          () => 8,
          rp('#4f7fbf')
        );
        srand(9);
        for (let i = 0; i < 30; i++)
          P.set(10 + rnd() * 12, 7 + rnd() * 14, C(['#b8a8a0', '#8a7a70', '#d8c8c0'][i % 3]));
      }
    })
  );
  IMG.window = SP(16, 16, P => {
    P.rect(3, 3, 26, 26, woodD, { mod: woodMod });
    P.rect(6, 6, 20, 20, rp('#9ec6e0'), {
      amb: 0.6,
      n: [0, 0, 1],
      mod: (X, Y, v) => ((X + Y) % 13 < 2 ? v + 0.3 : v)
    });
    P.rect(15, 6, 2, 20, woodD);
    P.rect(6, 15, 20, 2, woodD);
  });
  IMG.windowN = SP(16, 16, P => {
    P.rect(3, 3, 26, 26, woodD);
    P.rect(6, 6, 20, 20, rp('#141a2a'), { amb: 0.3 });
    P.set(10, 9, C('#e8e8f0'));
    P.rect(15, 6, 2, 20, woodD);
    P.rect(6, 15, 20, 2, woodD);
  });
  IMG.rug = SP(48, 32, P => {
    P.rect(0, 0, 96, 64, rp('#7a3a6a'), {
      n: [0, 0, 1],
      edge: false,
      mod: (X, Y, v) => {
        const b = Math.min(X, Y, 95 - X, 63 - Y);
        if (b < 2) return v - 0.2;
        if (b >= 4 && b < 7) return null;
        if (b >= 10 && ((X + Y) % 8 < 2 || (X - Y + 64) % 8 < 2)) return v + 0.25;
        return v;
      }
    });
    P.rect(4, 4, 88, 3, rp('#e8c23a'), { edge: false });
    P.rect(4, 57, 88, 3, rp('#e8c23a'), { edge: false });
    P.rect(4, 4, 3, 56, rp('#e8c23a'), { edge: false });
    P.rect(89, 4, 3, 56, rp('#e8c23a'), { edge: false });
  });
  IMG.shelf = SP(18, 26, P => {
    P.rect(2, 2, 32, 48, woodD, { mod: woodMod });
    for (let j = 0; j < 3; j++) {
      P.rect(4, 5 + j * 16, 28, 13, rp('#2a180c'), { amb: 0, edge: false });
      for (let i = 0; i < 7; i++) {
        const h = 9 + ((i * 7 + j) % 4);
        P.rect(
          5 + i * 4,
          18 + j * 16 - h,
          3,
          h,
          rp(['#6f4a8a', '#3f6a7a', '#b38a24', '#5a7a3a', '#8a4a2a'][(i + j) % 5]),
          { n: [-0.3, 0, 1] }
        );
      }
    }
  });
  IMG.pew = SP(66, 16, P => {
    P.rect(2, 2, 128, 6, rp('#7a4a2a'), { n: [0, -0.3, 1], mod: woodMod });
    P.rect(2, 10, 128, 8, rp('#9a6a3c'), { n: [0, -0.8, 0.6], mod: woodMod });
    for (const x of [6, 62, 120]) P.rect(x, 18, 6, 14, woodD);
  });
  IMG.altar = SP(34, 26, P => {
    P.rect(2, 12, 64, 38, cream, { mod: (X, Y, v) => (X % 8 === 0 ? v - 0.1 : v) });
    P.rect(2, 12, 64, 8, rp('#e8c23a'), { n: [0, -0.5, 0.8] });
    P.ellipse(34, 32, 6, 6, gold, {
      spec: 0.7,
      mod: (X, Y, v, n) => (Math.abs(Math.hypot(n[0], n[1]) - 0.7) < 0.15 ? v + 0.3 : v)
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * 6.283;
      P.set(34 + Math.cos(a) * 8, 32 + Math.sin(a) * 8, C('#8a6a1a'));
    }
    for (const cx of [9, 57]) {
      P.rect(cx - 2, 0, 4, 12, cream);
      P.ellipse(cx, -1, 1.6, 2.4, rp('#ffd24a'), { amb: 1, edge: false });
    }
  });
  IMG.rope = SP(8, 40, P => {
    for (let y = 0; y < 68; y++) P.set(8 + ((y >> 1) % 2), y, C(y % 4 < 2 ? '#c9a24a' : '#9a7a2a'));
    P.ellipse(8, 72, 3.5, 5, rp('#c9a24a'), { mod: (X, Y, v) => (Y % 3 === 0 ? v - 0.2 : v) });
  });
  IMG.candle = SP(8, 20, P => {
    P.capsule(8, 14, 8, 38, 1.4, iron, { spec: 0.6 });
    P.ellipse(8, 38, 5, 2, iron);
    P.rect(5, 6, 6, 10, cream);
    P.ellipse(8, 3, 1.6, 3, rp('#ffd24a'), { amb: 1, edge: false });
    P.set(8, 4, C('#fff4c0'));
  });
  IMG.costume = SP(20, 38, P => {
    P.capsule(20, 6, 20, 72, 1.4, rp('#8a6a3a'));
    P.capsule(4, 20, 36, 20, 1.4, rp('#8a6a3a'));
    P.body(
      20,
      62,
      () => 20,
      Y => 6 + (Y - 20) * 0.3,
      rp('#18121c'),
      { nyF: () => 0.1, mod: (X, Y, v) => (Math.sin(X * 0.9) > 0.7 ? v - 0.2 : v) }
    );
    P.ellipse(20, 20, 7, 4, rp('#2a1a2e'));
    P.ellipse(20, 14, 4, 3, rp('#3a0d0d'), { amb: 0.2 });
    for (let y = 14; y < 44; y++) P.set(33, y, C('#c9d1d9'));
  });
  IMG.stilts = SP(18, 26, P => {
    for (const x of [7, 27]) {
      P.capsule(x, 4, x, 42, 1.6, rp('#6a4428'));
      P.rect(x - 4, 42, 9, 8, rp('#2a2a2e'), { spec: 0.4 });
    }
  });
  IMG.ledger = SP(18, 18, P => {
    P.rect(2, 12, 32, 22, woodD, { mod: woodMod });
    P.rect(6, 4, 24, 12, rp('#3a1a10'), { n: [0, -0.6, 0.8] });
    P.rect(8, 5, 20, 10, cream, { n: [0, -0.6, 0.8] });
    P.rect(17, 5, 2, 10, rp('#6a0d0d'), { edge: false });
    for (let k = 0; k < 3; k++) {
      P.line(9, 7 + k * 3, 15, 7 + k * 3, C('#6a5a4a'));
      P.line(20, 7 + k * 3, 26, 7 + k * 3, C('#6a5a4a'));
    }
  });
  IMG.paper = SP(12, 12, P => {
    P.rect(4, 6, 16, 14, cream, { n: [0.1, -0.3, 1] });
    for (let k = 0; k < 3; k++) P.line(6, 9 + k * 3, 17 - k * 2, 9 + k * 3, C('#6a5a4a'));
  });
  IMG.lantern = SP(10, 14, P => {
    P.rect(4, 4, 12, 18, iron, { spec: 0.5 });
    P.rect(6, 6, 8, 14, rp('#c03a2a'), { amb: 0.7, edge: false });
    P.rect(4, 0, 12, 4, iron);
    P.rect(6, 22, 8, 4, iron);
  });
  // Cavaliere senza testa
  IMG.horse = [0, 1].map(f =>
    SP(44, 40, P => {
      const B = rp('#1a141e'),
        M = rp('#2a1a2e'),
        Ck = rp('#1c1622');
      const L = f
        ? [
            [22, 52, -7],
            [30, 52, 6],
            [52, 52, 8],
            [60, 52, -4]
          ]
        : [
            [22, 52, 6],
            [30, 52, -6],
            [52, 52, -4],
            [60, 52, 8]
          ];
      for (const [lx, ly, o] of L) {
        P.capsule(lx, ly - 8, lx + o * 0.5, ly + 6, 2.6, B);
        P.capsule(lx + o * 0.5, ly + 6, lx + o, ly + 18, 2, B);
        P.rect(lx + o - 3, ly + 17, 6, 3, rp('#4a4a50'), { spec: 0.6 });
      }
      P.ellipse(40, 40, 24, 11, B, { spec: 0.3 });
      P.capsule(60, 36, 70, 18, 6, B, { r2: 5 });
      P.ellipse(76, 16, 9, 5, B, { spec: 0.3 });
      P.capsule(64, 10, 66, 4, 1.6, B);
      P.set(78, 14, C('#ff2a1a'));
      P.set(79, 14, C('#ff8a6a'));
      for (let i = 0; i < 10; i++) P.capsule(62 - i, 30 - i * 2.4, 58 - i * 1.4, 28 - i * 2.4, 1.6, M);
      for (let i = 0; i < 7; i++) P.capsule(16, 34 + i * 2, 6 - (f ? 2 : 0) - i, 36 + i * 3.2 + f, 1.8, M);
      P.body(
        4,
        34,
        Y => 36 - (f ? 1 : 0) + (Y - 4) * 0.05,
        Y => 4 + (Y - 4) * 0.25,
        Ck,
        { nyF: () => 0.1, mod: (X, Y, v) => (Math.sin(X * 1.2) > 0.7 ? v - 0.15 : v) }
      );
      for (let i = 0; i < 10; i++)
        P.capsule(30 - i * 0.5, 10 + i * 2.6, 22 - i * 2.2 - (f ? 3 : 0), 12 + i * 3, 1.6, Ck);
      P.ellipse(36, 6, 4, 2.4, rp('#3a0d0d'), { amb: 0.3 });
      P.ellipse(36, 3, 1.4, 2.6, rp('#ff7a2a'), { amb: 1, edge: false });
      P.set(37, 0, C('#ffd24a'));
      P.line(42, 18, 70, 4, C('#c9d1d9'));
      P.line(42, 19, 70, 5, C('#8a929a'));
    })
  );
  IMG.fenceH = fenceHD('h');
  IMG.fenceV = fenceHD('v');
  IMG.fenceHg = fenceHD('h', 1);
  IMG.fenceVg = fenceHD('v', 1);
}

// catena: altri file la avvolgono con Ext.avvolgi('genPropsHD', …)
function genPropsHD(...a) {
  return Ext.catena('genPropsHD', genPropsHDBase, this, a);
}

function fenceHD(kind, grey) {
  return SP(16, 22, P => {
    const r = grey ? rp('#8d8a80') : rp('#e8c23a');
    srand(kind === 'h' ? 3 : 4);
    const pm = (X, Y, v) => {
      let w = v + ((X * 7 + Y * 3) % 13 === 0 ? -0.15 : 0);
      if (grey && rnd() < 0.12) w -= 0.35;
      return w;
    };
    if (kind === 'h') {
      for (const y of [18, 28]) P.rect(0, y, 32, 4, r, { n: [0, -0.4, 0.9], mod: pm, edge: false });
      P.body(
        6,
        42,
        () => 16,
        () => 4.5,
        r,
        { nyF: () => 0.05, mod: pm }
      );
      P.ellipse(16, 6, 4.5, 2, r, { mod: pm });
    } else {
      P.body(
        0,
        44,
        () => 16,
        () => 2.5,
        r,
        { nyF: () => 0.05, mod: pm, edge: false }
      );
      P.body(
        14,
        42,
        () => 16,
        () => 4.5,
        r,
        { nyF: () => 0.05, mod: pm }
      );
      P.ellipse(16, 14, 4.5, 2, r, { mod: pm });
    }
  });
}
// ---------- icone 32×32 ----------
function genIconsHDBase() {
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    const c = pxCanvas(P);
    ICON[id] = c;
  };
  const iron = rp('#9a9aa2'),
    wood = rp('#8a5a30');
  I('hoe', P => {
    P.capsule(6, 28, 24, 8, 1.6, wood);
    P.rect(18, 3, 11, 6, iron, { spec: 0.8 });
    P.rect(25, 8, 4, 8, iron, { spec: 0.6 });
  });
  I('can', P => {
    P.body(
      12,
      27,
      () => 14,
      () => 9,
      rp('#8a9aa8'),
      { spec: 0.8 }
    );
    P.capsule(22, 18, 29, 10, 1.6, rp('#8a9aa8'));
    P.ellipse(29, 9, 2.4, 1.6, rp('#6a7a88'));
    P.capsule(8, 10, 20, 10, 1.2, rp('#6a7a88'), { clip: (X, Y) => Y < 11 });
  });
  I('rapa', P => {
    P.ellipse(16, 21, 8, 7, rp('#efe6f2'), { spec: 0.4, mod: (X, Y, v) => (Y < 19 ? v - 0.35 : v) });
    P.capsule(16, 27, 17, 31, 1, rp('#efe6f2'));
    for (const [a, b] of [
      [12, 4],
      [17, 2],
      [22, 5]
    ])
      P.capsule(16, 14, a, b, 1.8, rp('#5a9a2a'), { r2: 2.6 });
  });
  I('patata', P => {
    P.ellipse(16, 17, 11, 8, rp('#b08a5a'), { spec: 0.2 });
    for (const [a, b] of [
      [11, 14],
      [19, 19],
      [16, 12],
      [22, 15]
    ])
      P.set(a, b, C('#6a4a2a'));
  });
  I('zucca', P => {
    const pr = rp('#d86a18');
    for (const [a, r] of [
      [-6, 7],
      [6, 7],
      [0, 9]
    ])
      P.ellipse(16 + a, 19, r, 9, pr, {
        spec: 0.35,
        mod: (X, Y, v, n) => (Math.abs(n[0]) > 0.85 ? v - 0.25 : v)
      });
    P.capsule(16, 10, 17, 4, 1.8, rp('#4a6a2a'));
  });
  I('bacche', P => {
    P.capsule(16, 2, 16, 10, 1, rp('#4a6a2a'));
    for (const [a, b] of [
      [11, 15],
      [19, 13],
      [15, 21],
      [23, 21],
      [9, 24]
    ])
      P.ellipse(a, b, 3.6, 3.6, rp(PAL.red), { spec: 0.9 });
  });
  I('nastro', P => {
    const r = rp(PAL.red);
    P.ellipse(9, 12, 7, 5, r, { spec: 0.3 });
    P.ellipse(23, 12, 7, 5, r, { spec: 0.3 });
    P.ellipse(16, 13, 3, 3.4, r);
    P.capsule(14, 15, 10, 28, 2, r);
    P.capsule(18, 15, 22, 28, 2, r);
  });
  I('focaccia', P => {
    P.ellipse(16, 18, 13, 9, rp('#e0a048'), {
      spec: 0.4,
      mod: (X, Y, v) => ((X * 3 + Y * 5) % 11 === 0 ? v - 0.3 : v)
    });
  });
  I('vernice', P => {
    P.body(
      10,
      29,
      () => 16,
      () => 10,
      rp('#8a8a92'),
      { spec: 0.8 }
    );
    P.ellipse(16, 10, 10, 3.4, rp('#e8c23a'), { spec: 0.6 });
    P.capsule(7, 10, 16, 1, 1, rp('#5a5a62'));
    P.capsule(16, 1, 25, 10, 1, rp('#5a5a62'));
    P.rect(9, 17, 14, 7, rp('#e8c23a'), { n: [0, 0, 1] });
  });
  const key = (id, col) =>
    I(id, P => {
      const g = rp(col);
      P.ellipse(9, 11, 6.5, 6.5, g, { spec: 0.9 });
      P.ellipse(9, 11, 2.4, 2.4, rp('#2a1a10'), { edge: false });
      P.capsule(14, 12, 29, 12, 2, g, { spec: 0.9 });
      P.rect(22, 14, 3, 6, g);
      P.rect(27, 14, 3, 4, g);
    });
  key('key', '#e8c23a');
  key('keyI', '#8a8a92');
  I('lanterna', P => {
    P.capsule(16, 3, 16, 8, 1.2, rp('#3a3a40'));
    P.rect(8, 8, 16, 18, rp('#3a3a40'), { spec: 0.5 });
    P.rect(10, 10, 12, 14, rp('#ffe08a'), { amb: 0.95, edge: false });
    P.rect(7, 26, 18, 3, rp('#3a3a40'));
    P.line(16, 12, 16, 22, C('#b9741a'));
  });
  I('mantello', P => {
    P.body(
      4,
      29,
      Y => 16,
      Y => 4 + (Y - 4) * 0.5,
      rp('#e8c23a'),
      { nyF: () => 0.1, spec: 0.2 }
    );
    P.ellipse(16, 7, 4.6, 3.6, rp('#d98a1e'));
    P.rect(15, 9, 2, 18, rp('#b38a24'), { edge: false });
  });
  I('pane', P => {
    P.ellipse(16, 19, 13, 8, rp('#c98a3e'), {
      spec: 0.35,
      mod: (X, Y, v) => ((X * 5 + Y * 3) % 13 === 0 ? v - 0.2 : v)
    });
    for (const x of [10, 16, 22]) P.line(x - 2, 13, x + 1, 19, C('#8a5420'));
  });
  I('zuppa', P => {
    P.body(
      15,
      27,
      () => 16,
      Y => 12 - (Y - 15) * 0.35,
      rp('#a8785a'),
      { nyF: () => 0.1, spec: 0.4 }
    );
    P.ellipse(16, 15, 12, 3.6, rp('#e8742a'), { spec: 0.6, amb: 0.6 });
    P.capsule(10, 11, 12, 5, 1, rp('#efe6f2'), { amb: 0.9, edge: false });
    P.capsule(20, 10, 18, 4, 1, rp('#efe6f2'), { amb: 0.9, edge: false });
  });
  I('arrosto', P => {
    P.ellipse(16, 22, 14, 6, rp('#d9d2c2'), { spec: 0.5 });
    for (const [a, b] of [
      [11, 17],
      [18, 15],
      [22, 20],
      [15, 20]
    ])
      P.ellipse(a, b, 5, 3.6, rp('#c9893c'), { spec: 0.3 });
    P.set(11, 16, C('#6a4420'));
    P.set(19, 14, C('#6a4420'));
  });
  I('torta', P => {
    P.ellipse(16, 20, 14, 8, rp('#c98a3e'), { spec: 0.3 });
    P.ellipse(16, 18, 11, 5.4, rp('#e07a1e'), { spec: 0.5, amb: 0.6 });
    for (const k of [-6, -2, 2, 6]) P.line(16 + k - 4, 14, 16 + k + 4, 22, C('#c98a3e'));
  });
  I('page', P => {
    P.rect(6, 4, 20, 25, rp('#efe2c2'), { n: [0.1, -0.2, 1] });
    for (let k = 0; k < 5; k++) P.line(9, 9 + k * 3.5, 22 - (k % 2) * 3, 9 + k * 3.5, C('#6a5a4a'));
    P.line(9, 25, 15, 25, C('#8a0d0d'));
  });
  I('ledger', P => {
    P.rect(6, 4, 21, 25, rp('#4a1a10'), { spec: 0.3 });
    P.rect(8, 5, 2, 23, rp('#8a0d0d'));
    P.ellipse(19, 15, 3.4, 3.4, rp('#e8c23a'), { spec: 0.8 });
  });
  I('fagioli', P => {
    const pod = rp('#8acd4a');
    P.capsule(6, 8, 12, 27, 2.4, pod, { spec: 0.5 });
    P.capsule(14, 5, 18, 27, 2.4, rp('#7abd3a'), { spec: 0.5 });
    P.capsule(22, 7, 26, 26, 2.4, pod, { spec: 0.5 });
    P.capsule(10, 3, 22, 4, 1, rp('#4a7a24'));
  });
  I('cavolo', P => {
    const k = rp('#2f5a4a'),
      k2 = rp('#3e7060'),
      bm = (X, Y, v) => ((X * 3 + Y * 5) % 7 === 0 ? v - 0.22 : v);
    P.capsule(16, 30, 16, 22, 1.6, rp('#8a9a7a'));
    [
      [5, 8],
      [27, 8],
      [11, 3],
      [21, 3],
      [16, 2]
    ].forEach(([a, b], i) => P.capsule(16, 26, a, b, 1.2, i % 2 ? k : k2, { r2: 4, mod: bm, spec: 0.2 }));
  });
  I('concime', P => {
    P.body(
      8,
      30,
      () => 16,
      Y => 9 + (Y - 8) * 0.18,
      rp('#8a6a44'),
      { nyF: () => 0.1, mod: (X, Y, v) => ((X + Y) % 6 === 0 ? v - 0.15 : v) }
    );
    P.rect(10, 5, 12, 4, rp('#6a4a2a'), { n: [0, -0.6, 0.8] });
    P.capsule(16, 25, 16, 17, 0.8, rp('#5a9a2a'));
    P.ellipse(12, 16, 3.4, 2, rp('#7aba3a'), { spec: 0.3 });
    P.ellipse(20, 15, 3.4, 2, rp('#7aba3a'), { spec: 0.3 });
  });
  // bustine di semi: carta, linguetta, e il disegno della pianta che diventeranno
  const packet = (id, crop, col) => {
    const P = new PX(32, 32);
    P.rect(6, 4, 20, 26, rp('#e8d6a8'), {
      n: [0.1, -0.2, 1],
      mod: (X, Y, v) => ((X * 5 + Y * 3) % 17 === 0 ? v - 0.12 : v)
    });
    P.rect(6, 3, 20, 4, rp('#b89a68'), { n: [0, -0.6, 0.8] });
    P.rect(6, 24, 20, 5, rp(col), { n: [0, -0.2, 1] });
    P.outline();
    const c = pxCanvas(P),
      x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(ICON[crop], 8, 6, 16, 16);
    ICON[id] = c;
  };
  packet('s_rapa', 'rapa', '#8a5aa8');
  packet('s_patata', 'patata', '#8a6a3a');
  packet('s_zucca', 'zucca', '#d86a18');
  packet('s_fagioli', 'fagioli', '#5a9a2a');
  packet('s_cavolo', 'cavolo', '#2f5a4a');
}

// catena: altri file la avvolgono con Ext.avvolgi('genIconsHD', …)
function genIconsHD(...a) {
  return Ext.catena('genIconsHD', genIconsHDBase, this, a);
}

// ---------- colture ----------
function genSoilHD() {
  const mkS = (wet, seed) => {
    srand(seed);
    const [c, x] = mk(32, 32);
    c.s = 2;
    const P = (col, X, Y, w = 1, h = 1) => {
      x.fillStyle = col;
      x.fillRect(X, Y, w, h);
    };
    const base = wet
      ? ['#2e1c12', '#3a2416', '#4a2e1c', '#5a3a24', '#6a4830']
      : ['#4e3018', '#5e3a1e', '#6e4626', '#82562e', '#9a6a3a'];
    P(base[2], 0, 0, 32, 32);
    for (let i = 0; i < 160; i++) P(base[ri(1, 3)], ri(0, 31), ri(0, 31));
    for (let y = 2; y < 32; y += 8) {
      P(base[0], 0, y + 5, 32, 1);
      P(base[1], 0, y + 4, 32, 1);
      P(base[3], 0, y, 32, 2);
      P(base[4], 0, y, 32, 1);
      for (let X = 0; X < 32; X += ri(3, 6)) {
        P(base[4], X, y - 1, 2, 1);
        P(base[1], X, y + 2, 1, 1);
      }
    }
    for (let i = 0; i < 7; i++) {
      const a = ri(1, 28),
        b = ri(1, 28);
      P(base[0], a, b + 2, 3, 1);
      P(base[3], a, b, 3, 2);
      P(base[4], a, b, 1, 1);
    }
    if (wet) {
      for (let i = 0; i < 10; i++) {
        const a = ri(1, 29),
          b = ri(1, 29);
        P('rgba(150,190,220,.35)', a, b, ri(2, 4), 1);
      }
      P('rgba(20,30,50,.12)', 0, 0, 32, 32);
    }
    c.s = 2;
    return c;
  };
  T.tilled = [0, 1, 2].map(i => mkS(false, 121 + i));
  T.tilledW = [0, 1, 2].map(i => mkS(true, 131 + i));
  // ogni zolla ha i bordi secondo le vicine (bit: 1 su, 2 destra, 4 giù, 8 sinistra = c'è terra
  // lavorata anche lì): gli angoli liberi sono arrotondati, la terra sta un po' più in basso del prato
  // (ombra sul bordo in alto e ai lati, labbro chiaro in basso)
  T.zolla = [T.tilled, T.tilledW].map(arr => arr.map(c => Array.from({ length: 16 }, (_, k) => zolla(c, k))));
}
function zolla(src, k) {
  const N = 32,
    R = 6,
    [c, x] = mk(N, N);
  c.s = 2;
  x.drawImage(src, 0, 0);
  const id = x.getImageData(0, 0, N, N),
    d = id.data,
    su = !(k & 1),
    de = !(k & 2),
    giu = !(k & 4),
    si = !(k & 8);
  for (let y = 0; y < N; y++)
    for (let X = 0; X < N; X++) {
      const i = (y * N + X) * 4;
      // angolo arrotondato dove i due lati vicini sono liberi
      const cx = X < R && si ? R : X >= N - R && de ? N - R - 1 : -1,
        cy = y < R && su ? R : y >= N - R && giu ? N - R - 1 : -1;
      let f = 1;
      if (cx >= 0 && cy >= 0) {
        const r = Math.hypot(X - cx, y - cy);
        if (r > R) {
          d[i + 3] = 0;
          continue;
        }
        if (r > R - 1.5) f *= 0.62;
      }
      if (su && y < 2) f *= 0.58;
      else if (su && y < 4) f *= 0.8;
      if (si && X < 2) f *= 0.72;
      if (de && X >= N - 2) f *= 0.78;
      if (giu && y === N - 1) f *= 0.62;
      else if (giu && y >= N - 3) f *= 1.18;
      if (f !== 1) for (let j = 0; j < 3; j++) d[i + j] = Math.min(255, d[i + j] * f);
    }
  x.putImageData(id, 0, 0);
  return c;
}
function genCropsHDBase() {
  const S = fn => {
    const P = new PX(32, 48);
    fn(P);
    P.outline();
    const c = pxCanvas(P);
    c.top = imgTop(c);
    return c;
  };
  const lf = rp('#5a9a2a'),
    lf2 = rp('#3f7424'),
    stem = rp('#4a7a24'),
    soil = rp('#6a4428'),
    wood = rp('#8a5a30');
  const mound = (P, col) => {
    P.ellipse(16, 42, 7, 2.8, soil, { spec: 0.1 });
    for (const [a, b] of [
      [13, 41],
      [18, 41],
      [16, 43]
    ])
      P.ellipse(a, b, 1.3, 1, rp(col), { edge: false, spec: 0.6 });
  };
  const sprout = (P, col, round) => {
    P.ellipse(16, 43, 5, 1.6, soil, { edge: false });
    P.capsule(16, 43, 16, 35, 0.8, stem);
    const l = rp(col || '#7aba3a');
    if (round) {
      P.ellipse(12, 34, 3.6, 2.6, l, { spec: 0.3 });
      P.ellipse(20, 33, 3.6, 2.6, l, { spec: 0.3 });
    } else {
      P.capsule(16, 36, 10, 32, 0.7, l, { r2: 2.2 });
      P.capsule(16, 35, 22, 31, 0.7, l, { r2: 2.2 });
    }
  };
  const bumpy = (X, Y, v) => ((X * 3 + Y * 5) % 7 === 0 ? v - 0.22 : v);
  // rapa: rosetta di foglie, poi la radice viola e bianca che spunta dalla terra
  CROPIMG.rapa = [
    S(P => mound(P, '#9a6ab8')),
    S(P => sprout(P)),
    S(P => {
      P.ellipse(16, 42, 6, 2, soil, { edge: false });
      P.ellipse(16, 41, 4, 2.6, rp('#9a5ab8'), { spec: 0.4, clip: (X, Y) => Y < 42 });
      [
        [8, 28],
        [13, 23],
        [19, 23],
        [24, 28],
        [16, 30]
      ].forEach(([a, b], i) => P.capsule(16, 40, a, b, 1, i % 2 ? lf2 : lf, { r2: 3 }));
    }),
    S(P => {
      [
        [6, 22],
        [11, 15],
        [17, 13],
        [22, 16],
        [27, 23]
      ].forEach(([a, b], i) => P.capsule(16, 34, a, b, 1.2, i % 2 ? lf2 : lf, { r2: 3.6 }));
      P.capsule(16, 44, 16, 46, 0.6, rp('#efe6f2'));
      P.ellipse(16, 38, 7.5, 6.5, rp('#f2ecf4'), { spec: 0.4 });
      P.ellipse(16, 36, 7, 4.5, rp('#9a4ab8'), { spec: 0.5, edge: false, clip: (X, Y) => Y < 36.5 });
    })
  ];
  // patata: cespuglio con fiori bianchi, i tuberi affiorano
  CROPIMG.patata = [
    S(P => mound(P, '#b08a5a')),
    S(P => sprout(P, '#6aa83a')),
    S(P => {
      P.capsule(16, 42, 16, 32, 1, stem);
      for (let i = 0; i < 6; i++)
        P.ellipse(7 + i * 3.6, 32 + (i % 2) * 4, 4.4, 3.6, i % 2 ? lf : lf2, { spec: 0.2 });
    }),
    S(P => {
      P.capsule(16, 42, 16, 26, 1.2, stem);
      for (let i = 0; i < 7; i++)
        P.ellipse(5 + i * 3.6, 30 + (i % 2) * 5, 4.6, 4, i % 2 ? lf : lf2, { spec: 0.2 });
      for (let i = 0; i < 5; i++)
        P.ellipse(8 + i * 4, 23 + (i % 2) * 3, 4, 3.4, i % 2 ? lf2 : lf, { spec: 0.2 });
      for (const [a, b] of [
        [9, 21],
        [17, 19],
        [24, 23]
      ]) {
        P.ellipse(a, b, 1.8, 1.8, rp('#f6f2dc'), { edge: false, spec: 0.5 });
        P.set(a, b, C('#e8c23a'));
      }
      P.ellipse(9, 42, 4.2, 3, rp('#c09a62'), { spec: 0.25 });
      P.ellipse(22, 43, 3.6, 2.6, rp('#b08a5a'), { spec: 0.25 });
    })
  ];
  // zucca: tralci, fiore giallo, poi la zucca a coste
  const pumpkin = (P, face) => {
    P.capsule(2, 41, 30, 41, 1.1, lf2);
    P.ellipse(6, 35, 5, 4, lf, { spec: 0.2 });
    P.ellipse(27, 34, 5, 4, lf2, { spec: 0.2 });
    const pr = rp('#d86a18');
    for (const [a, r] of [
      [-6, 6],
      [6, 6],
      [0, 8]
    ])
      P.ellipse(16 + a, 34, r, 8.5, pr, {
        spec: 0.35,
        mod: (X, Y, v, n) => (Math.abs(n[0]) > 0.85 ? v - 0.25 : v)
      });
    P.capsule(16, 26, 18, 21, 1.6, rp('#5a4a1a'));
    P.capsule(18, 22, 22, 20, 0.6, lf2);
    if (face) {
      const d = C('#2b1205');
      for (const ex of [10, 19])
        for (let k = 0; k < 3; k++) {
          P.set(ex + k, 31, d);
          P.set(ex + 1, 30, d);
        }
      for (let k = 0; k < 11; k++) P.set(10 + k, 37 + (k % 3 === 1 ? 1 : 0), d);
    }
  };
  CROPIMG.zucca = [
    S(P => mound(P, '#f2e2b0')),
    S(P => sprout(P, '#6aa83a', true)),
    S(P => {
      P.capsule(3, 41, 29, 41, 1, stem);
      P.ellipse(9, 35, 6, 5, lf, { spec: 0.2 });
      P.ellipse(23, 34, 6, 5, lf2, { spec: 0.2 });
      P.ellipse(16, 31, 5, 4.5, lf, { spec: 0.2 });
      P.ellipse(16, 39, 3.2, 2.6, rp('#f0c83a'), { spec: 0.5 });
      P.set(16, 39, C('#e07a1a'));
      P.ellipse(26, 40, 2.6, 2.2, rp('#c9a03a'), { spec: 0.3 });
    }),
    S(P => pumpkin(P))
  ];
  CROPIMG.zuccaFace = S(P => pumpkin(P, 1));
  // fagioli: rampicanti su un paletto, baccelli appesi
  const pole = (P, y0) => {
    P.rect(15, y0, 2, 43 - y0, wood, { n: [0.3, 0, 1] });
    P.ellipse(16, 43, 4, 1.4, soil, { edge: false });
  };
  const vine = (P, n) => {
    for (let i = 0; i < n; i++) {
      const y = 40 - i * 4.6,
        sd = i % 2 ? 1 : -1;
      P.capsule(16, y + 2, 16 + sd * 3, y, 0.6, stem);
      P.ellipse(16 + sd * 5, y, 3.8, 2.6, i % 2 ? lf : lf2, { spec: 0.25 });
    }
  };
  CROPIMG.fagioli = [
    S(P => mound(P, '#c08070')),
    S(P => {
      pole(P, 22);
      sprout(P);
    }),
    S(P => {
      pole(P, 14);
      vine(P, 5);
    }),
    S(P => {
      pole(P, 6);
      vine(P, 8);
      const pod = rp('#8acd4a');
      for (const [a, b, c, d] of [
        [10, 14, 9, 21],
        [22, 20, 23, 27],
        [10, 28, 9, 35],
        [22, 32, 23, 38],
        [11, 6, 10, 12]
      ])
        P.capsule(a, b, c, d, 1.1, pod, { spec: 0.4 });
      for (const [a, b] of [
        [19, 11],
        [13, 24]
      ])
        P.ellipse(a, b, 1.4, 1.4, rp('#e0a0d0'), { edge: false, spec: 0.5 });
    })
  ];
  // cavolo nero: foglie lunghe, scure, bollose
  const kale = rp('#2f5a4a'),
    kale2 = rp('#3e7060');
  CROPIMG.cavolo = [
    S(P => mound(P, '#4a3a3a')),
    S(P => sprout(P, '#5a8a7a')),
    S(P => {
      [
        [9, 28],
        [13, 24],
        [19, 24],
        [23, 28]
      ].forEach(([a, b], i) => P.capsule(16, 41, a, b, 1, i % 2 ? kale : kale2, { r2: 2.8, mod: bumpy }));
    }),
    S(P => {
      P.capsule(16, 43, 16, 28, 1.5, rp('#8a9a7a'));
      [
        [5, 24],
        [26, 24],
        [8, 15],
        [24, 15],
        [12, 9],
        [20, 9],
        [16, 7]
      ].forEach(([a, b], i) =>
        P.capsule(16, i < 2 ? 38 : 32, a, b, 1.1, i % 2 ? kale : kale2, { r2: 3.4, mod: bumpy, spec: 0.2 })
      );
    })
  ];
  CROPIMG.dead = S(P => {
    const d = rp('#7a5a32');
    P.ellipse(16, 42, 6, 2, soil, { edge: false });
    P.capsule(16, 42, 12, 30, 0.7, d);
    P.capsule(16, 42, 21, 32, 0.7, d);
    P.ellipse(10, 31, 3, 1.4, d);
    P.ellipse(23, 34, 3, 1.4, rp('#6a4a2a'));
    P.capsule(16, 42, 16, 34, 0.7, d);
  });
  // versioni appassite: ingiallite e piegate verso terra
  for (const t in CROPS)
    if (CROPIMG[t])
      CROPW[t] = CROPIMG[t].map(src => {
        const [c, x] = mk(src.width, src.height);
        x.drawImage(src, 0, 4);
        const d = x.getImageData(0, 0, c.width, c.height),
          a = d.data;
        for (let i = 0; i < a.length; i += 4) {
          if (!a[i + 3]) continue;
          const L = (a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11) / 255;
          a[i] = a[i] * 0.35 + 175 * L * 1.15 * 0.65;
          a[i + 1] = a[i + 1] * 0.35 + 130 * L * 1.15 * 0.65;
          a[i + 2] = a[i + 2] * 0.35 + 60 * L * 0.65;
        }
        x.putImageData(d, 0, 0);
        c.s = src.s;
        c.top = Math.min(c.height / c.s, (src.top || 0) + 2);
        return c;
      });
}

// catena: altri file la avvolgono con Ext.avvolgi('genCropsHD', …)
function genCropsHD(...a) {
  return Ext.catena('genCropsHD', genCropsHDBase, this, a);
}

function imgTop(c) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y / (c.s || 1);
  return 0;
}
// ================= DETTAGLI: porte d'uscita, impronte, anteprima casella, suggerimenti d'azione =================
function genExitArt() {
  // zerbino
  let P = new PX(32, 20);
  const m1 = ramp6('#8a5a30'),
    m2 = ramp6('#c9944a');
  P.rect(1, 2, 30, 15, m1, { n: [0, -0.2, 1], mod: (X, Y, v) => ((X + Y) % 4 < 2 ? v + 0.12 : v - 0.05) });
  P.rect(3, 4, 26, 11, m2, {
    n: [0, -0.2, 1],
    edge: false,
    mod: (X, Y, v) => ((X * 2 + Y) % 5 < 2 ? v - 0.15 : v)
  });
  P.outline();
  IMG.mat = pxCanvas(P);
  // soglia aperta: stipiti in legno e luce del giorno che entra
  const [c, x] = mk(32, 44);
  c.s = 2;
  const g = x.createLinearGradient(0, 44, 0, 4);
  g.addColorStop(0, 'rgba(255,236,170,.95)');
  g.addColorStop(0.45, 'rgba(255,220,140,.45)');
  g.addColorStop(1, 'rgba(255,210,120,0)');
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(4, 44);
  x.lineTo(28, 44);
  x.lineTo(26, 8);
  x.lineTo(6, 8);
  x.fill();
  x.fillStyle = '#2a1810';
  x.fillRect(0, 26, 4, 18);
  x.fillRect(28, 26, 4, 18);
  x.fillStyle = '#6a4428';
  x.fillRect(1, 26, 2, 18);
  x.fillRect(29, 26, 2, 18);
  x.fillStyle = '#8a5a34';
  x.fillRect(1, 26, 1, 18);
  x.fillRect(29, 26, 1, 18);
  x.fillStyle = '#e8d8a8';
  x.fillRect(4, 40, 24, 4);
  x.fillStyle = '#fff4d0';
  x.fillRect(4, 40, 24, 1);
  IMG.exit = c;
}
function addExits(m) {
  for (const d of m.doors) {
    m.add({
      kind: 'exit',
      tx: d.tx,
      ty: d.ty,
      img: IMG.exit,
      dx: d.tx * 16,
      dy: d.ty * 16 - 6,
      sy: -2,
      solid: [],
      hits: [],
      deco: 1
    });
  }
}
// ---------- impronte ----------
function printOK(m, x, y) {
  const tx = Math.floor(x / 16),
    ty = Math.floor((y - 3) / 16),
    g = m.get(tx, ty);
  if (m.id === 'main' && G.st.farm[tx + ',' + ty]) return 1;
  if (g === 2 || g === 10) return 1;
  if ((g === 1 || g === 12) && G.st.weather === 'pioggia') return 0.7;
  return 0;
}
function addPrint(e, big) {
  const m = G.map;
  if (!m) return;
  const k = printOK(m, e.x, e.y);
  if (!k) return;
  e._side = -(e._side || 1);
  G.prints.push({
    m: m.id,
    x: e.x + (e.dir === 0 || e.dir === 3 ? e._side * 2.2 : 0),
    y: e.y - 1 + (e.dir === 1 || e.dir === 2 ? e._side * 1.2 : 0),
    dir: e.dir,
    t: 0,
    life: G.st.weather === 'pioggia' ? 22 : 11,
    a: k,
    big
  });
  if (G.prints.length > 160) G.prints.shift();
}
function drawPrintsBase(m, dt) {
  for (const p of G.prints) {
    if (p.m !== m.id) continue;
    const a = Math.min(1, (1 - p.t / p.life) * 1.4) * 0.6 * p.a;
    if (a <= 0) continue;
    ctx.fillStyle = p.big ? `rgba(30,10,6,${(a * 1.4).toFixed(2)})` : `rgba(46,24,10,${a.toFixed(2)})`;
    if (p.big) {
      ctx.fillRect(p.x - 2, p.y - 1.5, 4, 3);
      ctx.fillStyle = `rgba(255,90,30,${(a * 0.6 * (1 - p.t / 3)).toFixed(2)})`;
      if (p.t < 3) ctx.fillRect(p.x - 1, p.y - 0.5, 2, 1);
      continue;
    }
    if (p.dir === 0 || p.dir === 3) {
      const s = p.dir === 0 ? 1 : -1;
      ctx.fillRect(p.x - 1, p.y - 1.5 * s - 1, 2, 2.5);
      ctx.fillRect(p.x - 0.75, p.y + 1.5 * s - 0.5, 1.5, 1.5);
    } else {
      const s = p.dir === 2 ? 1 : -1;
      ctx.fillRect(p.x + 1.2 * s - 1.25, p.y - 1, 2.5, 2);
      ctx.fillRect(p.x - 1.6 * s - 0.75, p.y - 0.75, 1.5, 1.5);
    }
  }
}

// catena: altri file la avvolgono con Ext.avvolgi('drawPrints', …)
function drawPrints(...a) {
  return Ext.catena('drawPrints', drawPrintsBase, this, a);
}

function updPrints(dt) {
  for (const p of G.prints) p.t += dt;
  G.prints = G.prints.filter(p => p.t < p.life);
}
// ---------- anteprima della casella bersaglio ----------
function aimInfo() {
  const st = G.st,
    m = G.map;
  if (G.mode !== 'game' || G.cut || UI.busy() || m.id !== 'main') return null;
  const it = selItem();
  if (!it) return null;
  const def = ITEMS[it.id];
  {
    const [ax, ay] = frontTile(),
      fa = freeAimOk(it, ax, ay);
    if (fa !== null) return { tx: ax, ty: ay, ok: fa, id: it.id };
  }
  const tool = it.id === 'hoe' || it.id === 'can' || def.t === 'seed' || def.t === 'bad' || def.t === 'fert';
  if (!tool) return null;
  const [tx, ty] = frontTile(),
    k = tx + ',' + ty,
    f = st.farm[k],
    g = m.get(tx, ty),
    free = !m.objAt(tx, ty) && (g === 1 || g === 12);
  let ok = false;
  if (f && f.c && cropStage(f.c) === 3) ok = true;
  else if (it.id === 'hoe')
    ok = ((isFree() ? !!ownedAt(tx, ty) : inFarm(tx, ty)) && free && !f) || cropGone(f);
  else if (def.t === 'fert') ok = !!(f && !f.f);
  else if (it.id === 'can') ok = !!(f && !f.w);
  else if (def.t === 'seed') ok = !!(f && !f.c);
  else if (def.t === 'bad') ok = free || !!f;
  return { tx, ty, ok, id: it.id };
}
function drawAim() {
  const a = aimInfo();
  if (!a) return;
  const X = a.tx * 16,
    Y = a.ty * 16,
    p = 0.5 + 0.5 * Math.sin(G.t * 6),
    c = a.ok ? `rgba(246,217,138,${(0.7 + p * 0.3).toFixed(2)})` : 'rgba(230,80,60,.75)';
  ctx.fillStyle = a.ok ? `rgba(246,217,138,${(0.1 + p * 0.08).toFixed(2)})` : 'rgba(230,80,60,.1)';
  ctx.fillRect(X, Y, 16, 16);
  ctx.fillStyle = 'rgba(20,10,5,.55)';
  ctx.fillStyle = c;
  for (const [x0, y0, sx, sy] of [
    [X, Y, 1, 1],
    [X + 15, Y, -1, 1],
    [X, Y + 15, 1, -1],
    [X + 15, Y + 15, -1, -1]
  ]) {
    ctx.fillRect(sx > 0 ? x0 : x0 - 3, y0, 4, 1);
    ctx.fillRect(x0, sy > 0 ? y0 : y0 - 3, 1, 4);
  }
  if (a.ok && ICON[a.id] && a.id !== 'hoe' && a.id !== 'can' && ITEMS[a.id].t !== 'fert') {
    ctx.globalAlpha = 0.55;
    ctx.drawImage(ICON[a.id], X + 3, Y + 2, 10, 10);
    ctx.globalAlpha = 1;
  }
}
// ---------- suggerimento d'azione sopra il bersaglio ----------
const PROMPT = {
  door: 'Entra',
  bed: 'Dormi / Riposa',
  bench: 'Siediti',
  chest: 'Apri',
  board: 'Bacheca',
  bin: 'Vendi',
  stall: 'Compra',
  well: 'Pozzo',
  stump: 'Ceppo',
  elias: 'Tomba',
  nameless: 'Leggi',
  leaves: 'Spazza',
  rope: 'Campana',
  ledger: 'Leggi',
  page2: 'Raccogli',
  costume: 'Esamina',
  bushR: 'Bacche',
  scare: 'Esamina',
  varco: 'Il Varco',
  bridge: 'Ponte',
  portrait: 'Guarda',
  window: 'Guarda',
  fire: 'Scaldati',
  altar: 'Altare',
  stilts: 'Esamina',
  lanternI: 'Lanterna',
  shelf: 'Libri',
  table: 'Tavolo',
  anvil: 'Incudine'
};
function promptInfoBase() {
  const st = G.st,
    m = G.map;
  if (G.mode !== 'game' || G.cut || UI.busy()) return null;
  const [fx, fy] = frontTile();
  // la stessa scelta del tasto azione (farm.js): il fumetto dice sempre quello che succede premendo
  const sc = typeof aimScelta === 'function' ? aimScelta() : null;
  if (sc && sc.k === 'npc') {
    const n = sc.r;
    return { x: n.x, y: n.y - 31, t: st.flags.met[n.id] ? 'Parla' : 'Presentati' };
  }
  if (sc && sc.k === 'ext') return sc.fumetto();
  if (sc && sc.k === 'animal') {
    const e = sc.r,
      a = e.a;
    return {
      x: e.x,
      y: e.y - (a.kind === 'mucca' ? 30 : 18),
      t: a.pet ? a.name + ' ♥' : 'Accarezza ' + a.name
    };
  }
  if (sc && sc.k === 'critter') {
    const c = sc.r;
    return { x: c.x, y: c.y - 14, t: c.k === 'cat' ? 'Accarezza' : 'Gallina' };
  }
  if (m.id === 'main') {
    const f = st.farm[fx + ',' + fy];
    if (f && f.c && cropStage(f.c) === 3) return { x: fx * 16 + 8, y: fy * 16 - 8, t: 'Raccogli' };
  }
  const o = m.objAt(fx, fy);
  if (o && o.act) {
    let t = PROMPT[o.act];
    if (o.act === 'post') t = st.flags.gotPaint && !st.flags.posts[o.pi] ? 'Dipingi' : null;
    if (o.act === 'bin' && !(selItem() && ITEMS[selItem().id].t === 'crop')) t = 'Cassetta';
    if (t) return { x: o.tx * 16 + 8 + ((o.wt || 1) - 1) * 8, y: Math.min(o.dy, o.ty * 16) - 4, t };
  }
  return null;
}

// catena: altri file la avvolgono con Ext.avvolgi('promptInfo', …)
function promptInfo(...a) {
  return Ext.catena('promptInfo', promptInfoBase, this, a);
}

function drawExits() {
  const m = G.map,
    p = G.player;
  if (!m.interior || G.mode !== 'game') return;
  for (const d of m.doors) {
    const X = d.tx * 16 + 8,
      near = Math.hypot(p.x - X, p.y - (d.ty * 16 + 14)) < 44,
      ay = Math.round(d.ty * 16 - 10 + Math.abs(Math.sin(G.t * 3.5)) * 4);
    ctx.fillStyle = '#2a1406';
    ctx.fillRect(X - 5, ay - 1, 11, 3);
    ctx.fillRect(X - 4, ay + 2, 9, 1);
    ctx.fillRect(X - 3, ay + 3, 7, 1);
    ctx.fillRect(X - 2, ay + 4, 5, 1);
    ctx.fillRect(X - 1, ay + 5, 3, 1);
    ctx.fillStyle = '#f6d98a';
    ctx.fillRect(X - 4, ay, 9, 1);
    ctx.fillRect(X - 3, ay + 1, 7, 1);
    ctx.fillRect(X - 2, ay + 2, 5, 1);
    ctx.fillRect(X - 1, ay + 3, 3, 1);
    ctx.fillRect(X, ay + 4, 1, 1);
    if (near && !G.cut && !UI.busy()) {
      ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(18,11,16,.88)';
      ctx.fillRect(X - 12, ay - 14, 24, 11);
      ctx.fillStyle = '#f6e6c0';
      ctx.fillText('Esci', X, ay - 5.5);
    }
  }
}
function drawPrompt() {
  drawExits();
  const q = promptInfo();
  if (!q) return;
  const key = IN.touch ? 'A' : 'E';
  ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
  const tw = Math.ceil(ctx.measureText(q.t).width),
    w = tw + 15,
    X = Math.round(q.x - w / 2),
    Y = Math.round(q.y - 12 + Math.sin(G.t * 3) * 1);
  ctx.fillStyle = 'rgba(18,11,16,.88)';
  ctx.fillRect(X, Y, w, 11);
  ctx.fillStyle = '#7a5428';
  ctx.fillRect(X, Y - 1, w, 1);
  ctx.fillRect(X, Y + 11, w, 1);
  ctx.fillRect(X - 1, Y, 1, 11);
  ctx.fillRect(X + w, Y, 1, 11);
  ctx.fillStyle = '#d9a646';
  ctx.beginPath();
  ctx.arc(X + 6, Y + 5.5, 4, 0, 7);
  ctx.fill();
  ctx.fillStyle = '#2a1606';
  ctx.textAlign = 'center';
  ctx.fillText(key, X + 6, Y + 8.5);
  ctx.fillStyle = '#f6e6c0';
  ctx.textAlign = 'left';
  ctx.fillText(q.t, X + 12, Y + 8.5);
  if (q.arrow) {
    const ay = Math.round(q.y + 4 + Math.abs(Math.sin(G.t * 4)) * 3);
    ctx.fillStyle = '#f6d98a';
    ctx.fillRect(q.x - 3, ay, 7, 1);
    ctx.fillRect(q.x - 2, ay + 1, 5, 1);
    ctx.fillRect(q.x - 1, ay + 2, 3, 1);
    ctx.fillRect(q.x, ay + 3, 1, 1);
  }
}
function genObjectsBase() {
  IMG.tree = [0, 1, 2, 3, 4].map(genTreeHD);
  IMG.pine = [0, 1, 2].map(genPineHD);
  IMG.bush = genBushHD(false);
  IMG.bushR = genBushHD(true);
  IMG.fenceH = genFence('h');
  IMG.fenceV = genFence('v');
  IMG.fenceHg = genFence('h', '#8d8a80');
  IMG.fenceVg = genFence('v', '#8d8a80');
  IMG.house = genBuilding({
    shutter: '#4a6a3a',
    w: 6,
    h: 5,
    roofH: 44,
    wall: '#c79a62',
    wall2: '#a87d4a',
    roof: '#6f4a8a',
    roof2: '#7f58a0',
    win: [
      [12, 52],
      [70, 52]
    ],
    door: 2,
    chimney: 1
  });
  IMG.store = genBuilding({
    shutter: '#2f5a6a',
    w: 6,
    h: 5,
    roofH: 42,
    wall: '#d9c49a',
    wall2: '#bba37a',
    roof: '#3f6a7a',
    roof2: '#4c7c8c',
    win: [
      [10, 52],
      [70, 52]
    ],
    door: 3,
    post: (x, bx, Wd, Hd, rh) => {
      R_(x, '#5a3a1e', bx + 30, rh + 3, 36, 9);
      R_(x, PAL.yel, bx + 31, rh + 4, 34, 7);
      for (let i = 0; i < 6; i++) R_(x, '#5a3a1e', bx + 34 + i * 5, rh + 6, 3, 3);
    }
  });
  IMG.elder = genBuilding({
    stone: 1,
    w: 6,
    h: 5,
    roofH: 42,
    wall: '#5e5a55',
    wall2: '#4d4945',
    roof: '#2b2a33',
    roof2: '#363542',
    win: [
      [10, 52],
      [70, 52]
    ],
    door: 3,
    chimney: 1,
    doorCol: '#2b2420',
    trim: '#9a968c'
  });
  IMG.barn = genBuilding({
    w: 4,
    h: 6,
    roofH: 46,
    wall: '#7a2a22',
    wall2: '#5e1f19',
    roof: '#3a2a24',
    roof2: '#46332b',
    win: [],
    door: 2,
    doorCol: '#4a1a14',
    post: (x, bx, Wd, Hd, rh) => {
      R_(x, '#e8dcc0', bx + 20, rh + 8, 24, 2);
      R_(x, '#e8dcc0', bx + 20, rh + 8, 2, 20);
      R_(x, '#e8dcc0', bx + 42, rh + 8, 2, 20);
      R_(x, '#2b1a10', bx + 26, rh + 14, 12, 10);
    }
  });
  IMG.cottage = genBuilding({
    shutter: '#7a8a4a',
    w: 5,
    h: 4,
    roofH: 30,
    wall: '#e6d3a6',
    wall2: '#cdb98b',
    roof: '#c9902a',
    roof2: '#d9a23a',
    win: [
      [8, 38],
      [58, 38]
    ],
    door: 2
  });
  IMG.forge = genBuilding({
    stone: 1,
    w: 5,
    h: 4,
    roofH: 30,
    wall: '#8a7a6a',
    wall2: '#6e6052',
    roof: '#4a3a30',
    roof2: '#5a483c',
    win: [[8, 38]],
    door: 2,
    chimney: 1,
    post: (x, bx) => {
      R_(x, '#ff9a3a', bx + 60, 40, 8, 6);
      R_(x, '#ffd27a', bx + 62, 42, 4, 3);
    }
  });
  IMG.chapel = genBuilding({
    w: 7,
    h: 7,
    roofH: 50,
    extra: 22,
    wall: '#e8e0cc',
    wall2: '#cfc6b0',
    roof: '#4a4a58',
    roof2: '#585868',
    win: [
      [12, 96],
      [90, 96]
    ],
    door: 3,
    trim: '#f2ead6',
    post: (x, bx, Wd, Hd, rh) => {
      const cx = bx + Wd / 2;
      R_(x, '#e8e0cc', cx - 11, 8, 22, 48);
      R_(x, '#cfc6b0', cx - 11, 8, 2, 48);
      R_(x, '#3a3a46', cx - 14, 2, 28, 8);
      for (let i = 0; i < 10; i++) R_(x, '#3a3a46', cx - i, -8 + i + 8, i * 2, 1);
      R_(x, '#1a1a22', cx - 6, 16, 12, 14);
      disc(x, cx, 22, 4, PAL.yel);
      R_(x, '#8a6a1a', cx - 1, 26, 2, 3);
      disc(x, cx, 68, 8, '#3b2412');
      disc(x, cx, 68, 7, PAL.yel);
      R_(x, '#b38a24', cx - 7, 68, 14, 1);
      R_(x, '#b38a24', cx, 61, 1, 14);
    }
  });
  IMG.lights = {
    house: [
      [12, 52],
      [70, 52]
    ],
    store: [
      [10, 52],
      [70, 52]
    ],
    elder: [
      [10, 52],
      [70, 52]
    ],
    cottage: [
      [8, 38],
      [58, 38]
    ],
    forge: [[8, 38]],
    chapel: [
      [12, 96],
      [90, 96]
    ]
  };
  // piccoli oggetti
  let c, x;
  [c, x] = mk2(18, 26);
  R_(x, '#5a574f', 2, 11, 14, 13);
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 3; i++) {
      const sc = ['#8a877d', '#7d7a72', '#96938a'][(i + j) % 3],
        X = 3 + i * 5 - (j % 2) * 2;
      R_(x, sc, Math.max(2, X), 12 + j * 4, 4, 3);
      R_(x, shade(sc, 0.18), Math.max(2, X), 12 + j * 4, 4, 1);
    }
  R_(x, '#a4a196', 2, 10, 14, 2);
  R_(x, '#14202c', 4, 10, 10, 2);
  R_(x, '#4a3020', 2, 1, 2, 10);
  R_(x, '#4a3020', 14, 1, 2, 10);
  R_(x, '#6a4a2e', 2, 1, 1, 10);
  R_(x, '#5a3c6e', 0, 0, 18, 2);
  R_(x, '#7a5a90', 1, 0, 16, 1);
  R_(x, '#7a5a3a', 8, 2, 1, 8);
  R_(x, '#5a5a5e', 6, 7, 6, 3);
  R_(x, '#7a7a7e', 6, 7, 6, 1);
  IMG.well = outline(c);
  [c, x] = mk2(18, 26);
  R_(x, '#5a3a1e', 3, 14, 2, 12);
  R_(x, '#5a3a1e', 13, 14, 2, 12);
  R_(x, '#9c6a3c', 1, 2, 16, 14);
  R_(x, '#b9834f', 1, 2, 16, 2);
  R_(x, '#efe2c2', 3, 5, 6, 7);
  R_(x, '#efe2c2', 10, 6, 5, 5);
  R_(x, '#8a8070', 4, 7, 4, 1);
  R_(x, '#8a8070', 4, 9, 3, 1);
  R_(x, '#8a8070', 11, 8, 3, 1);
  R_(x, PAL.yel, 5, 4, 2, 2);
  IMG.board = outline(c);
  [c, x] = mk2(16, 14);
  R_(x, '#6a4428', 2, 4, 12, 9);
  disc(x, 8, 4, 6, '#9c6a3c');
  disc(x, 8, 4, 4, '#b98652');
  disc(x, 8, 4, 2, '#9c6a3c');
  R_(x, '#5a3a1e', 5, 6, 1, 4);
  R_(x, '#5a3a1e', 7, 6, 1, 4);
  R_(x, '#5a3a1e', 9, 6, 1, 4);
  R_(x, '#5a3a1e', 11, 6, 1, 4);
  IMG.stump = outline(c);
  [c, x] = mk2(16, 14);
  x.drawImage(IMG.stump, 0, 0, 16, 14);
  disc(x, 8, 3, 3, '#e0a64a');
  R_(x, '#f2c46a', 6, 2, 3, 1);
  IMG.stumpB = outline(c);
  [c, x] = mk2(16, 14);
  x.drawImage(IMG.stump, 0, 0, 16, 14);
  disc(x, 8, 4, 4, '#1a0e08');
  R_(x, '#3a1a0a', 6, 4, 4, 1);
  R_(x, '#ff6a1a', 8, 3, 1, 1);
  IMG.stumpH = c;
  [c, x] = mk2(12, 36);
  R_(x, '#1e1d22', 5, 10, 2, 25);
  R_(x, '#3a3940', 5, 10, 1, 25);
  R_(x, '#1e1d22', 3, 33, 6, 3);
  R_(x, '#3a3940', 3, 33, 6, 1);
  R_(x, '#1e1d22', 2, 2, 8, 9);
  R_(x, '#ffe6a0', 3, 3, 6, 6);
  R_(x, '#fff6d0', 4, 4, 2, 2);
  R_(x, '#e8b850', 3, 8, 6, 1);
  R_(x, '#1e1d22', 5, 3, 1, 6);
  R_(x, '#2b2a30', 1, 1, 10, 2);
  R_(x, '#4a4950', 2, 1, 8, 1);
  R_(x, '#1e1d22', 4, 0, 4, 1);
  IMG.lamp = outline(c);
  [c, x] = mk2(18, 16);
  R_(x, '#7a4f2a', 1, 4, 16, 11);
  R_(x, '#9c6a3c', 1, 4, 16, 3);
  R_(x, '#5a3a1e', 1, 9, 16, 1);
  R_(x, '#5a3a1e', 8, 4, 1, 11);
  R_(x, PAL.yel, 7, 6, 3, 2);
  IMG.bin = outline(c);
  IMG.scare = [0, 1].map(v => {
    const [c, x] = mk2(20, 34);
    R_(x, '#6a4428', 9, 10, 2, 24);
    R_(x, '#6a4428', 1, 13, 18, 2);
    R_(x, '#8a9a5a', 5, 13, 10, 9);
    R_(x, '#d9b45a', 0, 14, 2, 4);
    R_(x, '#d9b45a', 18, 14, 2, 4);
    R_(x, '#d9b45a', 7, 22, 2, 4);
    R_(x, '#d9b45a', 11, 22, 2, 4);
    disc(x, 10, 8, 5, '#d9c08a');
    R_(x, '#c9a24a', 3, 2, 14, 2);
    R_(x, '#c9a24a', 6, 0, 8, 3);
    if (!v) {
      R_(x, '#2b1a10', 8, 7);
      R_(x, '#2b1a10', 12, 7);
      R_(x, '#2b1a10', 8, 10, 5, 1);
      R_(x, '#2b1a10', 9, 11, 3, 1);
    } else {
      R_(x, '#000', 7, 6, 2, 3);
      R_(x, '#000', 11, 6, 2, 3);
      R_(x, '#000', 6, 10, 8, 1);
      for (let i = 6; i < 14; i += 2) R_(x, '#000', i, 11);
      R_(x, PAL.red, 8, 7);
      R_(x, PAL.red, 12, 7);
    }
    return outline(c);
  });
  IMG.grave = [0, 1, 2].map(v => {
    const [c, x] = mk2(14, 16);
    const col = ['#8d8a84', '#7a7770', '#9a968f'][v];
    R_(x, col, 2, 3, 10, 12);
    disc(x, 7, 4, 4, col);
    R_(x, shade(col, 0.2), 3, 3, 2, 10);
    R_(x, shade(col, -0.3), 5, 6, 5, 1);
    R_(x, shade(col, -0.3), 5, 8, 4, 1);
    R_(x, '#4a6a2a', 1, 14, 12, 2);
    return outline(c);
  });
  [c, x] = mk2(14, 18);
  R_(x, '#6a6660', 6, 1, 2, 15);
  R_(x, '#6a6660', 2, 5, 10, 2);
  R_(x, '#4a6a2a', 1, 15, 12, 2);
  R_(x, '#5a3a1e', 4, 15, 6, 1);
  IMG.cross = outline(c);
  [c, x] = mk2(16, 18);
  R_(x, '#3a3a3e', 2, 2, 12, 14);
  disc(x, 8, 3, 6, '#3a3a3e');
  R_(x, '#55555a', 3, 3, 2, 10);
  R_(x, '#1a1a1e', 5, 7, 6, 1);
  R_(x, '#1a1a1e', 5, 9, 6, 1);
  R_(x, '#1a1a1e', 5, 11, 4, 1);
  IMG.nameless = outline(c, '#000');
  [c, x] = mk2(16, 10);
  disc(x, 8, 6, 6, '#c96a2a');
  disc(x, 6, 5, 3, '#e2b23b');
  disc(x, 11, 5, 3, '#a85d1a');
  R_(x, '#f2a64c', 5, 3, 2, 1);
  IMG.leaves = outline(c, '#5a2a10');
  [c, x] = mk2(16, 16);
  srand(613);
  paintBlobs(
    x,
    [
      [5, 10, 4],
      [11, 10, 4],
      [8, 9, 5]
    ],
    ['#5a2406', '#9a4210', '#d06a18', '#ea8c2a', '#f6b04a'],
    { ao: 0.4, noise: 0.1 }
  );
  R_(x, '#8a3a0e', 6, 6, 1, 9);
  R_(x, '#8a3a0e', 10, 6, 1, 9);
  R_(x, '#3f6a24', 7, 1, 2, 5);
  R_(x, '#5a8a34', 7, 1, 1, 4);
  R_(x, '#3f6a24', 9, 2, 3, 1);
  IMG.pumpkin = outline(c, '#4a1a04');
  [c, x] = mk2(16, 16);
  x.drawImage(IMG.pumpkin, 0, 0, 16, 16);
  R_(x, '#2b1205', 5, 7, 2, 2);
  R_(x, '#2b1205', 10, 7, 2, 2);
  R_(x, '#2b1205', 5, 11, 7, 1);
  R_(x, '#2b1205', 6, 12, 1, 1);
  R_(x, '#2b1205', 9, 12, 1, 1);
  IMG.jack = c;
  [c, x] = mk2(16, 16);
  x.drawImage(IMG.pumpkin, 0, 0, 16, 16);
  R_(x, '#ffd84a', 5, 7, 2, 2);
  R_(x, '#ffd84a', 10, 7, 2, 2);
  R_(x, '#ffd84a', 5, 11, 7, 1);
  R_(x, '#ffd84a', 6, 12, 1, 1);
  R_(x, '#ffd84a', 9, 12, 1, 1);
  IMG.jackL = c;
  [c, x] = mk2(18, 14);
  srand(612);
  for (let y = 3; y < 13; y++)
    for (let X = 1; X < 17; X++) {
      const v = 0.8 - (y - 3) / 12 - (X > 12 ? 0.18 : 0) + (rnd() - 0.5) * 0.35;
      R_(x, rampPick(['#6a4a14', '#9a7624', '#c49c44', '#ddbc62', '#f0d888'], v, X, y), X, y);
    }
  R_(x, '#6a4a14', 1, 7, 16, 1);
  R_(x, '#6a4a14', 1, 10, 16, 1);
  IMG.hay = outline(c, '#4a3410');
  [c, x] = mk2(18, 14);
  R_(x, '#3a3a40', 3, 4, 12, 4);
  R_(x, '#3a3a40', 1, 2, 6, 3);
  R_(x, '#3a3a40', 6, 8, 6, 5);
  R_(x, '#55555e', 3, 4, 12, 1);
  R_(x, '#2a2a30', 4, 13, 10, 1);
  IMG.anvil = outline(c, '#111');
  [c, x] = mk2(50, 32);
  R_(x, '#7a4f2a', 2, 14, 46, 16);
  R_(x, '#9c6a3c', 2, 14, 46, 3);
  for (let i = 0; i < 46; i += 8) {
    R_(x, PAL.yel, 2 + i, 2, 4, 10);
    R_(x, '#f4ecd8', 6 + i, 2, 4, 10);
  }
  R_(x, '#5a3a1e', 2, 0, 46, 2);
  R_(x, '#5a3a1e', 2, 2, 2, 28);
  R_(x, '#5a3a1e', 46, 2, 2, 28);
  x.drawImage(IMG.pumpkin, 6, 8, 16, 16);
  disc(x, 30, 16, 3, '#e9e1f0');
  disc(x, 35, 16, 3, '#e9e1f0');
  R_(x, '#8a5aa8', 28, 13, 9, 1);
  disc(x, 42, 17, 3, '#a07a4a');
  IMG.stall = outline(c);
  [c, x] = mk2(14, 16);
  for (let X = 2; X < 12; X++) {
    const t = (X - 2) / 9;
    R_(x, t < 0.2 ? '#a8744a' : t < 0.6 ? '#8a5a32' : t < 0.85 ? '#6e4426' : '#52321c', X, 3, 1, 12);
  }
  R_(x, '#3a3a40', 2, 5, 10, 1);
  R_(x, '#3a3a40', 2, 11, 10, 1);
  R_(x, '#6a6a72', 2, 5, 3, 1);
  R_(x, '#6a6a72', 2, 11, 3, 1);
  R_(x, '#5a3a1e', 3, 2, 8, 2);
  R_(x, '#e8c23a', 5, 2, 4, 1);
  IMG.barrel = outline(c);
  // interni
  [c, x] = mk2(18, 34);
  R_(x, '#6a4428', 1, 1, 16, 32);
  R_(x, '#efe6d2', 2, 3, 14, 7);
  R_(x, PAL.yel, 2, 11, 14, 20);
  R_(x, PAL.yelD, 2, 11, 14, 2);
  for (let i = 4; i < 16; i += 4) R_(x, PAL.yelD, i, 14, 1, 16);
  IMG.bed = outline(c);
  [c, x] = mk2(18, 16);
  R_(x, '#7a4a24', 1, 4, 16, 11);
  R_(x, '#9c6a3c', 1, 2, 16, 5);
  R_(x, '#5a3a1e', 1, 7, 16, 1);
  R_(x, '#c9a24a', 7, 6, 4, 4);
  R_(x, '#3a2414', 8, 8, 2, 1);
  IMG.chest = outline(c);
  [c, x] = mk2(18, 16);
  x.drawImage(IMG.chest, 0, 0, 18, 16);
  R_(x, '#2b1a10', 2, 2, 14, 3);
  IMG.chestO = c;
  IMG.fire = [0, 1].map(f => {
    const [c, x] = mk2(34, 32);
    R_(x, '#7d7a74', 1, 4, 32, 28);
    R_(x, '#94918b', 1, 4, 32, 3);
    R_(x, '#1a0e08', 7, 12, 20, 18);
    srand(900 + f);
    for (let i = 0; i < 10; i++) {
      R_(x, ['#ff8a2a', '#ffd24a', '#e0521a'][ri(0, 2)], ri(9, 23), ri(16 + f, 26), 2, ri(2, 5));
    }
    R_(x, '#5a3a1e', 9, 27, 16, 2);
    return outline(c);
  });
  [c, x] = mk2(34, 22);
  R_(x, '#8a5a30', 1, 2, 32, 8);
  R_(x, '#a87545', 1, 2, 32, 2);
  R_(x, '#6a4428', 3, 10, 3, 11);
  R_(x, '#6a4428', 28, 10, 3, 11);
  R_(x, '#efe6d2', 10, 4, 8, 4);
  R_(x, PAL.yel, 22, 3, 3, 4);
  IMG.table = outline(c);
  IMG.portrait = [0, 1].map(v => {
    const [c, x] = mk2(16, 16);
    R_(x, '#9a7a2a', 1, 1, 14, 14);
    R_(x, '#3a3a46', 3, 3, 10, 10);
    if (!v) {
      disc(x, 8, 7, 3, '#f2c79b');
      R_(x, '#6b3e1f', 5, 4, 6, 2);
      R_(x, '#2b1a10', 7, 7);
      R_(x, '#2b1a10', 9, 7);
      R_(x, '#4f7fbf', 4, 11, 8, 2);
    } else {
      R_(x, '#4f7fbf', 4, 11, 8, 2);
      for (let i = 0; i < 9; i++) R_(x, '#b8a8a0', 4 + ri(0, 7), 3 + ri(0, 7), 1, ri(1, 3));
    }
    return outline(c);
  });
  [c, x] = mk2(16, 16);
  R_(x, '#3b2412', 2, 2, 12, 12);
  R_(x, '#9ec6e0', 3, 3, 10, 10);
  R_(x, '#cfe6f2', 3, 3, 4, 4);
  R_(x, '#3b2412', 7, 3, 1, 10);
  R_(x, '#3b2412', 3, 7, 10, 1);
  IMG.window = c;
  [c, x] = mk2(16, 16);
  R_(x, '#3b2412', 2, 2, 12, 12);
  R_(x, '#141a2a', 3, 3, 10, 10);
  R_(x, '#3b2412', 7, 3, 1, 10);
  R_(x, '#3b2412', 3, 7, 10, 1);
  IMG.windowN = c;
  [c, x] = mk2(48, 32);
  R_(x, '#7a3a6a', 0, 0, 48, 32);
  R_(x, PAL.yel, 2, 2, 44, 28);
  R_(x, '#7a3a6a', 4, 4, 40, 24);
  for (let i = 8; i < 40; i += 8) R_(x, '#9a5a8a', i, 8, 4, 16);
  IMG.rug = c;
  [c, x] = mk2(18, 26);
  R_(x, '#6a4428', 1, 1, 16, 24);
  for (let j = 0; j < 3; j++) {
    R_(x, '#3b2412', 2, 3 + j * 8, 14, 6);
    for (let i = 0; i < 5; i++)
      R_(x, ['#6f4a8a', '#3f6a7a', PAL.yelD, '#5a7a3a'][(i + j) % 4], 3 + i * 3, 4 + j * 8, 2, 5);
  }
  IMG.shelf = outline(c);
  [c, x] = mk2(66, 16);
  R_(x, '#6a4428', 1, 2, 64, 9);
  R_(x, '#8a5a30', 1, 2, 64, 3);
  R_(x, '#4a2e17', 3, 11, 3, 5);
  R_(x, '#4a2e17', 60, 11, 3, 5);
  R_(x, '#4a2e17', 31, 11, 3, 5);
  IMG.pew = outline(c);
  [c, x] = mk2(34, 26);
  R_(x, '#efe6d2', 1, 6, 32, 18);
  R_(x, PAL.yel, 1, 6, 32, 4);
  R_(x, '#d9cfb8', 1, 10, 32, 1);
  R_(x, '#e8c23a', 15, 12, 4, 9);
  R_(x, '#e8c23a', 13, 14, 8, 2);
  [4, 28].forEach(cx => {
    R_(x, '#f2ead6', cx, 0, 2, 6);
    R_(x, '#ffd24a', cx, -1, 2, 2);
  });
  IMG.altar = outline(c);
  [c, x] = mk2(8, 40);
  R_(x, '#c9a24a', 3, 0, 2, 34);
  R_(x, '#9a7a2a', 3, 0, 1, 34);
  R_(x, '#9a7a2a', 2, 33, 4, 6);
  IMG.rope = outline(c);
  [c, x] = mk2(8, 20);
  R_(x, '#3a3a40', 3, 6, 2, 14);
  R_(x, '#3a3a40', 1, 18, 6, 2);
  R_(x, '#f2ead6', 2, 2, 4, 5);
  R_(x, '#ffd24a', 3, 0, 2, 2);
  IMG.candle = outline(c, '#111');
  [c, x] = mk2(20, 38);
  R_(x, '#8a6a3a', 9, 4, 2, 32);
  R_(x, '#8a6a3a', 2, 10, 16, 2);
  R_(x, '#8a6a3a', 4, 34, 12, 2);
  for (let y = 10; y < 30; y++) {
    const w = 6 + Math.floor((y - 10) / 3);
    R_(x, '#141018', 10 - w, y, w * 2, 1);
  }
  R_(x, '#2a1a2e', 6, 10, 8, 3);
  R_(x, '#3a0d0d', 8, 6, 4, 3);
  R_(x, '#c9d1d9', 16, 8, 1, 14);
  IMG.costume = outline(c, '#000');
  [c, x] = mk2(18, 26);
  R_(x, '#6a4428', 3, 2, 2, 20);
  R_(x, '#6a4428', 12, 2, 2, 20);
  R_(x, '#2a2a2e', 1, 20, 6, 5);
  R_(x, '#2a2a2e', 10, 20, 6, 5);
  R_(x, '#4a4a4e', 2, 24, 4, 1);
  R_(x, '#4a4a4e', 11, 24, 4, 1);
  IMG.stilts = outline(c, '#111');
  [c, x] = mk2(18, 18);
  R_(x, '#5a3a1e', 1, 6, 16, 11);
  R_(x, '#7a4f2a', 1, 6, 16, 2);
  R_(x, '#3a1a10', 4, 2, 10, 6);
  R_(x, '#efe2c2', 5, 3, 8, 4);
  R_(x, '#6a0d0d', 9, 3, 1, 4);
  IMG.ledger = outline(c);
  [c, x] = mk2(12, 12);
  R_(x, '#efe2c2', 2, 3, 8, 7);
  R_(x, '#c9b890', 2, 9, 8, 1);
  R_(x, '#6a5a4a', 3, 5, 6, 1);
  R_(x, '#6a5a4a', 3, 7, 5, 1);
  IMG.paper = outline(c);
  [c, x] = mk2(10, 14);
  R_(x, '#3a3a40', 2, 0, 6, 2);
  R_(x, '#3a3a40', 1, 2, 8, 10);
  R_(x, '#ffe6a0', 2, 4, 6, 6);
  R_(x, '#3a3a40', 2, 12, 6, 2);
  IMG.lantern = outline(c, '#111');
  // spaventosi
  IMG.horse = [0, 1].map(f => {
    const [c, x] = mk2(44, 40);
    const B = '#120e16',
      M = '#2a1a2e';
    R_(x, B, 8, 16, 24, 10);
    R_(x, B, 6, 18, 4, 6);
    R_(x, B, 28, 8, 7, 12);
    R_(x, B, 31, 5, 10, 6);
    R_(x, B, 39, 8, 3, 3);
    R_(x, B, 31, 2, 2, 4);
    R_(x, M, 26, 7, 4, 10);
    R_(x, '#e01818', 36, 6, 2, 1);
    R_(x, '#ff6a4a', 36, 6, 1, 1);
    for (let i = 0; i < 6; i++) R_(x, M, 3 - (i % 2), 16 + i * 2 + f, 4, 2);
    const L = f
      ? [
          [10, 26, -3],
          [14, 26, 3],
          [26, 26, 4],
          [30, 26, -2]
        ]
      : [
          [10, 26, 3],
          [14, 26, -3],
          [26, 26, -2],
          [30, 26, 4]
        ];
    L.forEach(([lx, ly, o]) => {
      for (let k = 0; k < 9; k++) R_(x, B, lx + Math.round((o * k) / 9), ly + k, 2, 1);
      R_(x, '#4a4a50', lx + o, ly + 9, 3, 2);
    });
    // cavaliere
    R_(x, '#1c1622', 14, 4, 9, 14);
    R_(x, '#1c1622', 12, 10, 13, 8);
    R_(x, '#241c2c', 15, 4, 7, 2);
    R_(x, '#3a0d0d', 16, 2, 5, 3);
    R_(x, '#ff7a2a', 17, 1, 1, 1);
    R_(x, '#ff9a3a', 19, 0, 1, 2);
    for (let i = 0; i < 8; i++) R_(x, '#1c1622', 13 - i - (f ? 1 : 0), 5 + i, 3, 3);
    for (let i = 0; i < 14; i++) R_(x, '#c9d1d9', 22 + i, 8 - Math.floor(i / 2), 1, 1);
    R_(x, '#5a4a3a', 21, 8, 2, 2);
    return outline(c, '#000');
  });
  IMG.vignette = (() => {
    const [c, x] = mk(MAXW, H);
    const g = x.createRadialGradient(MAXW / 2, H / 2, H * 0.25, MAXW / 2, H / 2, 480 * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    x.fillStyle = g;
    x.fillRect(0, 0, MAXW, H);
    return c;
  })();
  IMG.grain = [0, 1, 2, 3].map(() => {
    const [c, x] = mk(MAXW / 2, H / 2);
    const d = x.createImageData(MAXW / 2, H / 2);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = Math.random() < 0.5 ? 40 : 0;
    }
    x.putImageData(d, 0, 0);
    return c;
  });
}

// catena: altri file la avvolgono con Ext.avvolgi('genObjects', …)
function genObjects(...a) {
  return Ext.catena('genObjects', genObjectsBase, this, a);
}

const PLAYER_LOOKS = {
  // il nipote di Elias: giovane contadino di fine Settecento (testa disegnata a mano, tools/pixel/teste.pxs)
  m: {
    mano: 1,
    skin: '#eab48a',
    hair: '#6b3e1f',
    style: 'short',
    eye: '#4a6a3a',
    shirt: '#e9dcc0',
    rolled: 1,
    cravat: '#8a3a3a',
    vest: '#5a4632',
    pants: '#4a5a3e',
    calze: '#e9dcc0',
    boots: 1,
    shoe: '#3a2616',
    belt: '#3a2414'
  },
  // la nipote di Elias: camicia con le maniche arrotolate, fazzoletto al collo, gonna da lavoro e stivali
  f: {
    mano: 1,
    volto: 'donna',
    skin: '#f0c39a',
    hair: '#8a3f1c',
    style: 'long',
    eye: '#3a5a8a',
    shirt: '#efe2c6',
    rolled: 1,
    cravat: '#8a3a3a',
    dress: '#6a4a36',
    pants: '#e0b890',
    boots: 1,
    shoe: '#3a2616',
    lip: '#b85450'
  }
};
const LOOKS = {
  player: PLAYER_LOOKS.m,
  ezekiel: {
    skin: '#e6bd98',
    hair: '#dcd8d0',
    style: 'bald',
    beard: '#e2ded6',
    eye: '#5a6a7a',
    shirt: '#3a3440',
    robe: '#2a2530',
    robeOpen: 1,
    shoe: '#141014',
    hat: 'tall',
    hatCol: '#1f1b24',
    hatBand: '#e8c23a',
    smile: false
  },
  agatha: {
    skin: '#f0c4a0',
    hair: '#a8a29a',
    style: 'bun',
    eye: '#6a5a8a',
    shirt: '#8a6a9a',
    dress: '#6f527f',
    pants: '#e0c0a0',
    shoe: '#2b1d14',
    hat: 'bonnet',
    hatCol: '#efe6d2',
    cape: '#c9b8d8',
    capeLen: 9,
    lip: '#b8605a'
  },
  lucius: {
    skin: '#e3c6a6',
    hair: '#6a6a6a',
    style: 'bald',
    eye: '#4a4a4a',
    shirt: '#5a5a62',
    robe: '#4f4f58',
    rope: 1,
    shoe: '#1c1c1c',
    smile: false
  },
  clara: {
    skin: '#f6d0ab',
    hair: '#7a4a24',
    style: 'long',
    eye: '#4a7a4a',
    shirt: '#f2e6cf',
    dress: '#8a6a3a',
    pants: '#e8c8a0',
    shoe: '#3a2414',
    cape: '#e8c23a',
    capeLen: 14,
    kid: 1,
    lip: '#c0605a'
  },
  brom: {
    skin: '#d9a57a',
    hair: '#4a2a14',
    style: 'short',
    beard: '#4a2a14',
    eye: '#3a2a1a',
    shirt: '#9a7a5a',
    rolled: 1,
    pants: '#3a2a1a',
    shoe: '#1c140e',
    apron: '#4a3424',
    wide: 1,
    smile: false
  },
  tobia: {
    skin: '#f2c79b',
    hair: '#d8b04a',
    style: 'messy',
    eye: '#6a8aaa',
    shirt: '#7a9a4a',
    pants: '#6a5a3a',
    shoe: '#3a2a1a',
    hat: 'cap',
    hatCol: '#5a6a3a',
    kid: 1
  },
  faceless: {
    skin: '#c9c2b8',
    hair: '#2a2a2a',
    style: 'bald',
    shirt: '#2a2a2e',
    robe: '#2a2a2e',
    shoe: '#111',
    faceless: true,
    hideEars: 1
  }
};
function setPlayerLook(g) {
  // i vestiti di stagione vanno rifatti (relations.js, caricato dopo: qui si chiama solo a gioco avviato)
  if (typeof rifaiVestiti === 'function') rifaiVestiti();
  LOOKS.player = PLAYER_LOOKS[g === 'f' ? 'f' : 'm'];
  delete SHEET.player;
  for (const k in PORT) if (k.startsWith('player|')) delete PORT[k];
}
// ================= PERSONAGGI HI-BIT (volumi, luce, capelli e vestiti animati) =================
const CW = 36,
  CHH = 54,
  CCOLS = 12; // fotogramma 36×54 px (= 18×27 unità di gioco)
const LV = (() => {
  const v = [-0.52, -0.6, 0.6],
    l = Math.hypot(...v);
  return v.map(a => a / l);
})();
function ramp6(base, kind) {
  const cool = kind === 'skin' ? '#7a2f45' : kind === 'hair' ? '#1e1430' : '#22173d',
    warm = kind === 'skin' ? '#fff0dc' : '#fff1c8';
  return [
    mix(shade(base, -0.66), cool, 0.42),
    mix(shade(base, -0.44), cool, 0.26),
    mix(shade(base, -0.22), cool, 0.12),
    base,
    mix(shade(base, 0.16), warm, 0.16),
    mix(shade(base, 0.36), warm, 0.34)
  ].map(h2r);
}
class PX {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  set(X, Y, c, a = 255) {
    X = Math.floor(X);
    Y = Math.floor(Y);
    if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) return;
    const i = (Y * this.w + X) * 4,
      d = this.d;
    if (a < 255 && d[i + 3]) {
      const k = a / 255;
      d[i] = d[i] + (c[0] - d[i]) * k;
      d[i + 1] = d[i + 1] + (c[1] - d[i + 1]) * k;
      d[i + 2] = d[i + 2] + (c[2] - d[i + 2]) * k;
      return;
    }
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = a;
  }
  has(X, Y) {
    if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) return false;
    return this.d[(Y * this.w + X) * 4 + 3] > 0;
  }
  // forma generica: f(X,Y) → normale [nx,ny,nz] o null. Bordo scuro automatico (sel-out).
  shape(x0, y0, x1, y1, f, ramp, o = {}) {
    x0 = Math.max(0, Math.floor(x0));
    y0 = Math.max(0, Math.floor(y0));
    x1 = Math.min(this.w - 1, Math.ceil(x1));
    y1 = Math.min(this.h - 1, Math.ceil(y1));
    const bw = x1 - x0 + 1,
      bh = y1 - y0 + 1;
    if (bw <= 0 || bh <= 0) return;
    const N = new Array(bw * bh);
    for (let Y = y0; Y <= y1; Y++)
      for (let X = x0; X <= x1; X++) N[(Y - y0) * bw + X - x0] = f(X + 0.5, Y + 0.5);
    const edge = o.edge !== false;
    for (let Y = y0; Y <= y1; Y++)
      for (let X = x0; X <= x1; X++) {
        const n = N[(Y - y0) * bw + X - x0];
        if (!n) continue;
        let v = lit(n, o);
        if (o.mod) {
          v = o.mod(X, Y, v, n);
          if (v == null) continue;
        }
        let idx = pickI(ramp.length, v, X, Y, o.nod);
        if (edge) {
          const q = (xx, yy) => xx < x0 || yy < y0 || xx > x1 || yy > y1 || !N[(yy - y0) * bw + xx - x0];
          if (q(X - 1, Y) || q(X + 1, Y) || q(X, Y - 1) || q(X, Y + 1))
            idx = Math.max(0, Math.min(idx - 2, o.edgeMax ?? 1));
        }
        this.set(X, Y, ramp[idx]);
      }
  }
  ellipse(cx, cy, rx, ry, ramp, o = {}) {
    this.shape(
      cx - rx,
      cy - ry,
      cx + rx,
      cy + ry,
      (X, Y) => {
        const nx = (X - cx) / rx,
          ny = (Y - cy) / ry,
          q = 1 - nx * nx - ny * ny;
        if (q < 0 || (o.clip && !o.clip(X, Y))) return null;
        return [nx, ny, Math.sqrt(q)];
      },
      ramp,
      o
    );
  }
  capsule(ax, ay, bx, by, r, ramp, o = {}) {
    const dx = bx - ax,
      dy = by - ay,
      L2 = dx * dx + dy * dy || 1,
      r2 = o.r2 ?? r;
    this.shape(
      Math.min(ax, bx) - Math.max(r, r2),
      Math.min(ay, by) - Math.max(r, r2),
      Math.max(ax, bx) + Math.max(r, r2),
      Math.max(ay, by) + Math.max(r, r2),
      (X, Y) => {
        let t = clamp(((X - ax) * dx + (Y - ay) * dy) / L2, 0, 1);
        const rr = r + (r2 - r) * t,
          ex = X - (ax + dx * t),
          ey = Y - (ay + dy * t),
          d = Math.hypot(ex, ey);
        if (d > rr || (o.clip && !o.clip(X, Y))) return null;
        const k = d / rr;
        return [ex / rr, (ey / rr) * 0.5 - 0.15, Math.sqrt(Math.max(0, 1 - k * k))];
      },
      ramp,
      o
    );
  }
  // tronco/veste: halfwidth(Y) e centro cx(Y)
  body(y0, y1, cxF, hwF, ramp, o = {}) {
    this.shape(
      0,
      y0,
      this.w - 1,
      y1,
      (X, Y) => {
        const c = cxF(Y),
          hw = hwF(Y);
        if (hw <= 0) return null;
        const nx = (X - c) / hw;
        if (Math.abs(nx) > 1 || (o.clip && !o.clip(X, Y))) return null;
        const ny = o.nyF ? o.nyF(Y) : 0.1;
        return [nx, ny, Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny * 0.5))];
      },
      ramp,
      o
    );
  }
  put(x, X, Y) {
    x.putImageData(new ImageData(this.d, this.w, this.h), X, Y);
  }
  outline() {
    const w = this.w,
      h = this.h,
      d = this.d,
      o = new Uint8ClampedArray(d);
    for (let Y = 0; Y < h; Y++)
      for (let X = 0; X < w; X++) {
        const i = (Y * w + X) * 4;
        if (d[i + 3]) continue;
        let best = -1;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]) {
          const xx = X + dx,
            yy = Y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = (yy * w + xx) * 4;
          if (d[j + 3] > 200) {
            best = j;
            break;
          }
        }
        if (best < 0) continue;
        o[i] = d[best] * 0.32 + 8;
        o[i + 1] = d[best + 1] * 0.28 + 5;
        o[i + 2] = d[best + 2] * 0.34 + 14;
        o[i + 3] = 255;
      }
    this.d = o;
  }
}
function lit(n, o) {
  const dd = n[0] * LV[0] + n[1] * LV[1] + n[2] * LV[2],
    d = Math.max(0, dd);
  let v = (o.amb ?? 0.2) + d * (o.dif ?? 0.82);
  if (o.spec) {
    const rz = 2 * dd * n[2] - LV[2];
    v += Math.pow(Math.max(0, rz), o.sp || 14) * o.spec;
  }
  if (o.rim !== 0 && n[0] > 0.55 && n[2] < 0.6) v += o.rim ?? 0.12;
  return v;
}
function pickI(n, v, X, Y, nod) {
  const f = clamp(v, 0, 0.999) * n,
    i = Math.floor(f),
    fr = f - i;
  return Math.min(n - 1, i + (fr > (nod ? 0.5 : (X + Y) & 1 ? 0.74 : 0.6) ? 1 : 0));
}
// disegna con altre regole d'ombra (per esempio i toni pieni di grafica.js), poi rimette quelle di sempre.
// Le regole si cambiano solo qui dentro: chi sta fuori passa le sue e la funzione che disegna.
function conOmbre(nuovoLit, nuovoPick, disegna) {
  const a = lit,
    b = pickI;
  lit = nuovoLit;
  pickI = nuovoPick;
  try {
    return disegna();
  } finally {
    lit = a;
    pickI = b;
  }
}
const C = h => h2r(h);
function genSheet(L) {
  const [c, x] = mk(CW * CCOLS, CHH * 4);
  c.s = 2;
  const rows = [
    [0, 0],
    [2, 2],
    [3, 3]
  ];
  for (const [row, dir] of rows) {
    for (let f = 0; f < 12; f++) {
      const walk = f < 8,
        ph = walk ? (f / 8) * Math.PI * 2 : null,
        br = walk ? 0 : f % 2,
        bl = f >= 10;
      heroFrame(L, dir, ph, br, bl).put(x, f * CW, row * CHH);
    }
  }
  // sinistra = destra specchiata
  x.save();
  x.translate(CW * CCOLS, 0);
  x.scale(-1, 1);
  for (let f = 0; f < 12; f++) {
    x.drawImage(c, f * CW, 2 * CHH, CW, CHH, (CCOLS - 1 - f) * CW, CHH, CW, CHH);
  }
  x.restore();
  return c;
}
// riga del foglio per direzione di gioco (0 giù,1 sinistra,2 destra,3 su)
function sprFrame(e) {
  if (e.moving) return Math.floor(e.anim * 2) % 8;
  const t = G.t + (e.x || 0) * 0.37;
  return 8 + (Math.floor(t * 1.6) % 2) + (t % 4.3 < 0.16 ? 2 : 0);
}
const SHEET = {},
  PORT = {};
function sheetOf(k) {
  return SHEET[k] || (SHEET[k] = genSheet(LOOKS[k]));
}
function drawSpr(x2, k, e, X, Y) {
  const fr = sprFrame(e);
  x2.drawImage(sheetOf(k), fr * CW, e.dir * CHH, CW, CHH, X - 9, Y - 27, 18, 27);
}
// ---------- ritratti 64×64 ----------
function genPortraitBase(L, mood) {
  const P = new PX(64, 64),
    dark = mood === 'dark',
    R = {
      sk: ramp6(L.skin, 'skin'),
      hr: ramp6(L.hair, 'hair'),
      cl: ramp6(L.robe || L.coat || L.cape || L.dress || L.shirt),
      sh: ramp6(L.shirt),
      beard: L.beard && ramp6(L.beard, 'hair'),
      hat: L.hatCol && ramp6(L.hatCol),
      band: L.hatBand && ramp6(L.hatBand),
      apron: L.apron && ramp6(L.apron)
    };
  const cx = 32,
    cy = 30 + (L.kid ? 3 : 0),
    rx = 15.5,
    ry = 17.5,
    fr = X => [0, 2, 3, 2, 1, 0, 2, 3, 3, 1][(((X | 0) % 10) + 10) % 10];
  const hm = (X, Y, v, n) => {
    if ((X + (Y >> 3)) % 4 === 0) v -= 0.12;
    if (Math.abs(n[1] + 0.45) < 0.09 && ((X + Y) & 1) === 0) v += 0.3;
    return v;
  };
  // capelli lunghi dietro
  if (L.style === 'long')
    P.body(
      cy - 6,
      63,
      () => cx,
      Y => rx + 3 - (Y - cy) * 0.05,
      R.hr,
      { nyF: () => -0.1, mod: hm }
    );
  // spalle
  P.body(
    cy + 16,
    64,
    () => cx,
    Y => Math.min(27, 15 + (Y - cy - 16) * 2.2),
    R.cl,
    { nyF: Y => (Y < cy + 20 ? -0.7 : 0.1) }
  );
  if ((L.robe && L.robeOpen) || (!L.robe && !L.cape)) {
    // sotto la finanziera: il panciotto (se c'è) e la camicia
    if (L.coat && L.vest)
      P.body(
        cy + 16,
        64,
        () => cx,
        Y => Math.max(0, 9 - (Y - cy - 16) * 0.1),
        ramp6(L.vest),
        { nyF: () => 0.1 }
      );
    P.body(
      cy + 16,
      64,
      () => cx,
      Y => Math.max(0, (L.coat ? 4 : 6) - (Y - cy - 16) * 0.2),
      R.sh,
      { nyF: () => 0.1 }
    );
  }
  if (L.shawl) {
    // lo scialle: sulle spalle, aperto a V davanti
    P.body(
      cy + 15,
      64,
      () => cx,
      Y => Math.min(29, 17 + (Y - cy - 15) * 2.4),
      ramp6(L.shawl),
      {
        nyF: Y => (Y < cy + 19 ? -0.7 : 0.1),
        clip: (X, Y) => Math.abs(X + 0.5 - cx) > 5 + (Y - cy - 15) * 0.9,
        mod: (X, Y, v) => ((X + Y) % 5 === 0 ? v - 0.1 : v)
      }
    );
  }
  if (L.apron)
    P.body(
      cy + 22,
      64,
      () => cx,
      () => 10,
      R.apron,
      { nyF: () => 0.1 }
    );
  P.body(
    cy + 11,
    cy + 20,
    () => cx,
    () => 6.5,
    R.sk,
    { amb: 0.12, dif: 0.55 }
  );
  // orecchie e testa

  P.ellipse(cx, cy, rx, ry, R.sk, {
    amb: 0.25,
    rim: 0.1,
    mod: (X, Y, v) => (Y > cy + 10 && Math.abs(X - cx) > 9 ? v - 0.12 : v)
  });
  if (!L.faceless) {
    const ey = cy + 3,
      eye = C(L.eye || '#3a5a7a'),
      eyeD = C(shade(L.eye || '#3a5a7a', -0.5)),
      lash = C('#24140e'),
      wht = C('#f4efe6'),
      br = C(shade(L.hair, -0.4)),
      lip = C(L.lip || '#a8504a'),
      lipD = C(shade(L.lip || '#a8504a', -0.3));
    const E = ex => {
      if (dark) {
        for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) P.set(ex + x, ey + y - 1, C('#050203'));
        P.set(ex + 2, ey + 1, C('#ff2a1a'));
        P.set(ex + 3, ey + 1, C('#a01010'));
        return;
      }
      const irL = C(shade(L.eye || '#3a5a7a', 0.35)),
        pu = C('#140c0a');
      for (let x = 0; x < 6; x++) P.set(ex + x, ey - 1, lash);
      [lash, eyeD, eyeD, eyeD, eyeD, wht].forEach((q, x) => P.set(ex + x, ey, q));
      [wht, eye, pu, pu, eye, wht].forEach((q, x) => P.set(ex + x, ey + 1, q));
      [R.sk[2], eye, eye, eye, irL, R.sk[2]].forEach((q, x) => P.set(ex + x, ey + 2, q));
      P.set(ex + 2, ey, C('#ffffff'));
      P.set(ex + 5, ey - 2, lash);
    };
    E(cx - 11);
    E(cx + 5);
    const bro = mood === 'stern' ? 1 : mood === 'sad' || mood === 'fear' ? -1 : 0;
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      P.set(
        cx - 12 + i,
        ey -
          4 +
          Math.round((bro > 0 ? t : bro < 0 ? 1 - t : Math.abs(t - 0.5)) * 2) -
          (mood === 'fear' ? 1 : 0),
        br
      );
      P.set(
        cx + 5 + i,
        ey -
          4 +
          Math.round((bro > 0 ? 1 - t : bro < 0 ? t : Math.abs(t - 0.5)) * 2) -
          (mood === 'fear' ? 1 : 0),
        br
      );
    }
    P.set(cx, cy + 8, R.sk[2]);
    P.set(cx + 1, cy + 8, R.sk[2]);
    P.set(cx - 1, cy + 7, R.sk[4]);
    P.set(cx, cy + 6, R.sk[4]);
    const my = cy + 12;
    if (dark) {
      for (let x = -3; x <= 3; x++) for (let y = 0; y < 4; y++) P.set(cx + x, my + y - 1, C('#050203'));
    } else if (mood === 'fear') {
      for (let x = -2; x <= 2; x++) {
        P.set(cx + x, my - 1, lipD);
        P.set(cx + x, my + 2, lip);
      }
      for (let x = -1; x <= 1; x++) {
        P.set(cx + x, my, C('#3a1010'));
        P.set(cx + x, my + 1, C('#3a1010'));
      }
    } else if (mood === 'sad' || mood === 'stern') {
      for (let x = -3; x <= 3; x++) P.set(cx + x, my + (mood === 'sad' && Math.abs(x) === 3 ? 1 : 0), lipD);
      for (let x = -2; x <= 2; x++) P.set(cx + x, my + 1, lip);
    } else {
      for (let x = -4; x <= 4; x++) P.set(cx + x, my - (Math.abs(x) >= 3 ? 1 : 0), lipD);
      for (let x = -2; x <= 2; x++) P.set(cx + x, my + 1, lip);
    }
    const bl = C('#ff8a8a');
    for (let x = 0; x < 4; x++) {
      P.set(cx - 13 + x, cy + 8, bl, 70);
      P.set(cx + 9 + x, cy + 8, bl, 70);
    }
  }
  if (L.beard)
    P.ellipse(cx, cy + 13, 13, 9, R.beard, {
      clip: (X, Y) => Y > cy + 7 && !(Y > cy + 10 && Y < cy + 14 && Math.abs(X + 0.5 - cx) < 4),
      mod: (X, Y, v) => ((X + Y * 2) % 4 === 0 ? v - 0.15 : v)
    });
  // capelli
  const st = L.style;
  if (st === 'bald')
    P.ellipse(cx, cy, rx + 1, ry, R.hr, {
      mod: hm,
      nod: 1,
      clip: (X, Y) => Math.abs(X - cx) > rx - 2 && Y > cy - 3 && Y < cy + 4
    });
  else {
    P.ellipse(cx, cy - 3, rx + 2, ry + 0.5, R.hr, {
      mod: hm,
      nod: 1,
      clip: (X, Y) =>
        Y < cy - 6 + fr(X) * 1.4 ||
        (Math.abs(X - cx) > rx - 3.5 + Math.max(0, Y - cy + 5) * 0.5 && Y < cy + 4)
    });
    if (st === 'long')
      for (const k of [-1, 1])
        P.capsule(cx + k * (rx - 0.5), cy - 2, cx + k * (rx + 1.5), cy + 26, 4.5, R.hr, { r2: 3.5, mod: hm });
    if (st === 'bun') P.ellipse(cx, cy - ry - 3, 7, 6, R.hr, { mod: hm });
    if (st === 'messy')
      for (const [a, b] of [
        [-12, -14],
        [-5, -19],
        [3, -19],
        [11, -14],
        [0, -21]
      ])
        P.capsule(cx + a, cy + b + 5, cx + a * 1.25, cy + b, 2.6, R.hr);
  }
  if (!L.hideEars && st !== 'long') {
    P.ellipse(cx - rx + 0.2, cy + 4, 2.6, 4.4, R.sk, { amb: 0.3 });
    P.ellipse(cx + rx - 0.2, cy + 4, 2.6, 4.4, R.sk, { amb: 0.2 });
  }
  if (L.hat === 'tall') {
    P.ellipse(cx, cy - 12, 24, 4.5, R.hat, { spec: 0.4 });
    P.body(
      0,
      cy - 11,
      () => cx,
      () => 14,
      R.hat,
      { nyF: () => 0.05, spec: 0.3 }
    );
    for (let X = cx - 14; X < cx + 14; X++) {
      P.set(X, cy - 16, R.band[3]);
      P.set(X, cy - 15, R.band[2]);
      P.set(X, cy - 17, R.band[4]);
    }
  }
  if (L.hat === 'bonnet')
    P.ellipse(cx, cy - 3, rx + 4, ry + 3, R.hat, {
      clip: (X, Y) => Y < cy - 6 || (Math.abs(X - cx) > rx - 2 && Y < cy + 14),
      mod: (X, Y, v) => ((X * 2 + Y) % 7 === 0 ? v - 0.1 : v)
    });
  if (L.cravat) {
    // la cravatta a fiocco sotto il mento
    const CR = ramp6(L.cravat);
    P.body(
      cy + 17,
      cy + 24,
      () => cx,
      Y => (Y < cy + 20 ? 5 - (Y - cy - 17) : 2 + (Y - cy - 20) * 0.5),
      CR,
      { nyF: () => -0.2 }
    );
  }
  if (L.hat === 'tricorn') {
    // il tricorno: cupola bassa, tesa larga rialzata ai lati, bordo chiaro
    P.ellipse(cx, cy - 9, rx + 1, 8, R.hat, { clip: (X, Y) => Y < cy - 7, spec: 0.2 });
    const BR = rx + 10,
      orlo = R.band || R.hat;
    for (let X = Math.floor(cx - BR); X <= Math.ceil(cx + BR); X++) {
      const u = Math.abs(X + 0.5 - cx) / BR;
      if (u > 1) continue;
      const y0 = Math.round(cy - 9 - u * u * 8),
        y1 = Math.round(cy - 5 - u * u * 6);
      for (let Y = y0; Y <= y1; Y++) P.set(X, Y, R.hat[Y === y0 ? 4 : Y === y1 ? 1 : X < cx ? 3 : 2]);
      P.set(X, y0, orlo[X < cx ? 4 : 3]);
    }
  }
  if (L.hat === 'cap') {
    P.ellipse(cx, cy - 7, rx + 1.5, 12, R.hat, { clip: (X, Y) => Y < cy - 6, spec: 0.2 });
    P.ellipse(cx, cy - 6, rx, 3, R.hat, { clip: (X, Y) => Y > cy - 6.5 });
  }
  if (L.cape) {
    const cr = ramp6(L.cape);
    P.body(
      cy + 15,
      64,
      () => cx,
      Y => Math.min(29, 17 + (Y - cy - 15) * 2.4),
      cr,
      {
        nyF: Y => (Y < cy + 19 ? -0.7 : 0.1),
        clip: (X, Y) => Math.abs(X + 0.5 - cx) > 7 + (Y - cy - 15) * 0.3
      }
    );
  }
  P.outline();
  const [c, x] = mk(64, 64);
  P.put(x, 0, 0);
  return c;
}

// catena: altri file la avvolgono con Ext.avvolgi('genPortrait', …)
function genPortrait(...a) {
  return Ext.catena('genPortrait', genPortraitBase, this, a);
}

function portrait(id, mood) {
  const k = id + '|' + (mood || '');
  if (!PORT[k]) PORT[k] = genPortrait(LOOKS[id], mood);
  return PORT[k];
}
// ---------- icone ----------
const ICON = {};
// days: notti bagnate per maturare · y: raccolto [min,max] · re: notti per ricrescere dopo il raccolto
const CROPS = {
  rapa: { days: 2, n: 'Rapa', y: [1, 1] },
  patata: { days: 3, n: 'Patata', y: [1, 2] },
  zucca: { days: 3, n: 'Zucca', y: [1, 1] },
  fagioli: { days: 3, n: 'Fagioli', y: [2, 3], re: 1 },
  cavolo: { days: 4, n: 'Cavolo nero', y: [1, 1] }
};
const CROPIMG = {},
  CROPW = {};
function genAll() {
  genWoodArt();
  genTilesHD();
  genSoilHD();
  genObjects();
  genDeco();
  genPropsHD();
  genExitArt();
  genIconsHD();
  genCropsHD();
  makeParch();
  makeCornici();
}
// ---------- cornici dell'interfaccia (immagini a 9 fette per border-image, 1 px = 1 unità di gioco) ----------
// --cornice: legno con venature, spigolo chiaro in alto a sinistra e scuro in basso a destra, borchie d'ottone;
// --pozzo/--pozzoSel: la casella incavata (ombra dentro in alto, bordo chiaro in basso);
// --tasto/--tastoSu/--tastoGiu: il bottone in rilievo, acceso e premuto.
function makeCornici() {
  const set = (k, c) => document.documentElement.style.setProperty(k, 'url(' + c.toDataURL() + ')');
  const P = (x, col, X, Y, w = 1, h = 1) => {
    x.fillStyle = col;
    x.fillRect(X, Y, w, h);
  };
  // cornice 32×32, fetta 11: legno (8 px) con venature, filo d'ottone, angolari di ferro con borchia
  {
    const N = 32,
      F = 11,
      [c, x] = mk(N, N);
    srand(77);
    P(x, '#140a06', 0, 0, N, N);
    P(x, '#6e4626', 1, 1, N - 2, N - 2);
    // venature lungo il legno: orizzontali sopra e sotto, verticali ai lati
    for (let i = 0; i < 140; i++) {
      const v = ri(1, N - 2),
        t = ri(2, 7),
        col = ['#5a381c', '#80542e', '#63401f', '#8a5e34'][ri(0, 3)];
      if (rnd() < 0.5) P(x, col, v, rnd() < 0.5 ? t : N - 1 - t, ri(2, 5), 1);
      else P(x, col, rnd() < 0.5 ? t : N - 1 - t, v, 1, ri(2, 5));
    }
    // rilievo: luce in alto a sinistra, ombra in basso a destra
    P(x, '#b8844a', 1, 1, N - 2, 1);
    P(x, '#b8844a', 1, 1, 1, N - 2);
    P(x, '#94663a', 2, 2, N - 4, 1);
    P(x, '#94663a', 2, 2, 1, N - 4);
    P(x, '#2e1a0a', 1, N - 2, N - 2, 1);
    P(x, '#2e1a0a', N - 2, 1, 1, N - 2);
    P(x, '#46290f', 2, N - 3, N - 4, 1);
    P(x, '#46290f', N - 3, 2, 1, N - 4);
    // il bordo interno: solco scuro, filo d'ottone, poi la pergamena
    const ring = (o, col) => {
      P(x, col, o, o, N - 2 * o, 1);
      P(x, col, o, N - 1 - o, N - 2 * o, 1);
      P(x, col, o, o, 1, N - 2 * o);
      P(x, col, N - 1 - o, o, 1, N - 2 * o);
    };
    ring(8, '#1e1006');
    ring(9, '#d9a646');
    P(x, '#f6d98a', 9, 9, N - 18, 1);
    P(x, '#f6d98a', 9, 9, 1, N - 18);
    ring(10, '#5a3a1a');
    P(x, '#ead8ae', F, F, N - 2 * F, N - 2 * F);
    // angolari di ferro con la borchia
    for (const [sx, sy] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ]) {
      const X = sx ? N - 9 : 1,
        Y = sy ? N - 9 : 1,
        Q = (a, b, w, h, col) => P(x, col, sx ? X + 8 - a - w : X + a, sy ? Y + 8 - b - h : Y + b, w, h);
      Q(0, 0, 8, 3, '#1a1414');
      Q(0, 0, 3, 8, '#1a1414');
      Q(0, 0, 7, 2, '#4a4650');
      Q(0, 0, 2, 7, '#4a4650');
      Q(0, 0, 7, 1, '#7a7680');
      Q(0, 0, 1, 7, '#7a7680');
      Q(2, 2, 3, 3, '#1a1414');
      Q(2, 2, 2, 2, '#d9a646');
      Q(2, 2, 1, 1, '#fff0b8');
    }
    set('--cornice', c);
  }
  // casella incavata 8×8, fetta 2 (bordo sottile: l'icona dentro resta grande)
  const pozzo = (fondo, fondo2, lume) => {
    const [c, x] = mk(8, 8);
    P(x, '#07040a', 0, 0, 8, 8);
    const g = x.createLinearGradient(0, 1, 0, 7);
    g.addColorStop(0, fondo2);
    g.addColorStop(1, fondo);
    x.fillStyle = g;
    x.fillRect(1, 1, 6, 6);
    P(x, 'rgba(0,0,0,.5)', 1, 1, 6, 1);
    P(x, 'rgba(0,0,0,.3)', 1, 2, 1, 5);
    P(x, lume, 1, 6, 6, 1);
    P(x, lume, 6, 2, 1, 4);
    return c;
  };
  set('--pozzo', pozzo('#3a2618', '#24160e', 'rgba(255,220,160,.16)'));
  set('--pozzoSel', pozzo('#7a5430', '#4a2e18', 'rgba(255,236,170,.55)'));
  // bottone 12×12, fetta 4: la tavoletta ha uno spessore sotto (2 px) che sparisce quando la premi
  const tasto = (alto, basso, luce, bordo, premuto) => {
    const [c, x] = mk(12, 12);
    P(x, bordo, 0, premuto ? 2 : 0, 12, premuto ? 10 : 12);
    const g = x.createLinearGradient(0, 1, 0, 9);
    g.addColorStop(0, alto);
    g.addColorStop(1, basso);
    x.fillStyle = g;
    x.fillRect(1, premuto ? 3 : 1, 10, premuto ? 8 : 8);
    P(x, luce, 1, premuto ? 3 : 1, 10, 1);
    P(x, 'rgba(255,255,255,.08)', 1, premuto ? 3 : 1, 1, 6);
    if (!premuto) {
      P(x, '#2a1608', 1, 9, 10, 2);
      P(x, 'rgba(0,0,0,.35)', 1, 9, 10, 1);
    }
    return c;
  };
  set('--tasto', tasto('#6e4628', '#4a2e1a', '#a8743e', '#140a06'));
  set('--tastoSu', tasto('#8a5a32', '#5a381e', '#e8c07a', '#d9a646'));
  set('--tastoGiu', tasto('#4a2e1a', '#3a2414', '#6a4424', '#140a06', true));
}
function makeParch() {
  const [c, x] = mk(64, 64);
  srand(31);
  x.fillStyle = '#ead8ae';
  x.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 900; i++) {
    x.fillStyle = ['#e2cea0', '#efdfb8', '#dcc694', '#f2e4c0'][ri(0, 3)];
    x.fillRect(ri(0, 63), ri(0, 63), 1, 1);
  }
  for (let i = 0; i < 14; i++) {
    x.fillStyle = 'rgba(150,110,60,.18)';
    const a = ri(0, 60),
      b = ri(0, 63);
    x.fillRect(a, b, ri(3, 9), 1);
  }
  for (let i = 0; i < 4; i++) {
    const g = x.createRadialGradient(ri(0, 64), ri(0, 64), 0, 32, 32, ri(6, 14));
    g.addColorStop(0, 'rgba(160,110,50,.1)');
    g.addColorStop(1, 'rgba(160,110,50,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
  }
  document.documentElement.style.setProperty('--parch', 'url(' + c.toDataURL() + ')');
}
function drawWxIcon(c, wx) {
  const x = c.getContext('2d');
  x.clearRect(0, 0, 20, 20);
  const P = (col, X, Y, w = 1, h = 1) => {
    x.fillStyle = col;
    x.fillRect(X, Y, w, h);
  };
  if (wx === 'neve') {
    for (const [a, b] of [
      [4, 4],
      [12, 3],
      [8, 9],
      [15, 10],
      [4, 14],
      [11, 15]
    ]) {
      P('#eef6ff', a, b, 3, 1);
      P('#eef6ff', a + 1, b - 1, 1, 3);
    }
    return;
  }
  const cloud = (col, dk, y = 6) => {
    disc(x, 7, y + 4, 4, dk);
    disc(x, 12, y + 3, 5, dk);
    disc(x, 7, y + 3, 3, col);
    disc(x, 12, y + 2, 4, col);
    P(dk, 3, y + 7, 14, 2);
  };
  if (wx === 'sereno') {
    disc(x, 10, 10, 5, '#f0a030');
    disc(x, 10, 10, 4, '#ffd860');
    P('#fff6c0', 8, 8, 2, 2);
    for (const [a, b] of [
      [10, 1],
      [10, 17],
      [1, 10],
      [17, 10],
      [4, 4],
      [15, 4],
      [4, 15],
      [15, 15]
    ])
      P('#ffd860', a, b, 2, 2);
  } else if (wx === 'nuvoloso') {
    disc(x, 6, 7, 3, '#ffd860');
    cloud('#e8e4e0', '#9a96a0');
  } else if (wx === 'nebbia') {
    for (let i = 0; i < 4; i++) P(i % 2 ? '#c8ccd8' : '#e8ecf0', 2 + (i % 2) * 2, 4 + i * 4, 15, 2);
  } else {
    cloud('#b8bcc8', '#6a6e80', 3);
    for (const [a, b] of [
      [5, 14],
      [9, 16],
      [13, 14],
      [7, 18]
    ])
      P('#7ab0e8', a, b, 1, 2);
  }
}
