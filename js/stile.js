'use strict';
// ================= STILE: tutto come l'Albero dei Morti =================
// Un filtro unico porta ogni immagine dell'ambiente allo stesso linguaggio dell'albero disegnato a mano:
// grana grossa (1 pixel per unità di gioco), una sola tavolozza cupa, la luce di luna fredda sui bordi in alto,
// il contorno scuro attorno alla sagoma. Si applica alla fine del caricamento (punto 'arte'), a IMG, AIMG e
// FREEIMG; restano fuori l'interfaccia (ICON), il terreno (T), i personaggi e ciò che è già disegnato a mano.
// prova del filtro «stile albero»: grana a 1 pixel per unità, tavolozza unica cupa, contorno scuro, luce di luna
const STILE_PAL = [
  // neri e viola (contorni, ombre profonde)
  '#07050a',
  '#140e14',
  '#1c1418',
  '#2a1e24',
  '#3a2a30',
  // legno e terra (anche i marroni spenti delle assi vecchie)
  '#2e2016',
  '#4a3222',
  '#6a4a30',
  '#8a6a44',
  '#a88a5e',
  '#3e3028',
  '#5a4636',
  '#7a6650',
  '#9a8468',
  // tetti: prugna e ruggine scure
  '#2e2430',
  '#44303a',
  '#4a3434',
  '#5e3a30',
  // pietra e ardesia
  '#24242c',
  '#3a3a44',
  '#55545a',
  '#74726e',
  '#9a968a',
  '#c0baa8',
  // luce di luna fredda
  '#3a4048',
  '#5a6a74',
  '#8aa0a8',
  // muschio e foglie scure
  '#1e2a18',
  '#2e3a22',
  '#44522c',
  '#606a36',
  '#7e8240',
  // autunno: ruggine, ocra, oro spento
  '#5a1e10',
  '#8a3418',
  '#b05a22',
  '#c8862e',
  '#d8aa48',
  // sangue e brace
  '#4a0a0c',
  '#7c1512',
  '#b0261e',
  '#e05a40',
  // luci calde (finestre, lanterne)
  '#d8963a',
  '#ffd070',
  '#fff0c0',
  // pelle e stoffe chiare spente
  '#b88a6a',
  '#d8b490',
  '#e8dcc0',
  // azzurro spento, verde acqua
  '#2a3a52',
  '#3e5a6e',
  '#4a6a5a'
].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
function stileAlbero(src, opz = {}) {
  const s = src.s || 1,
    W = Math.round(src.width / s),
    H = Math.round(src.height / s),
    tmp = document.createElement('canvas');
  tmp.width = src.width;
  tmp.height = src.height;
  const tx = tmp.getContext('2d');
  tx.drawImage(src, 0, 0);
  const D = tx.getImageData(0, 0, src.width, src.height).data,
    c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d'),
    out = x.createImageData(W, H),
    o = out.data,
    cache = new Map(),
    vicino = (r, g, b) => {
      const k = (r << 16) | (g << 8) | b;
      let v = cache.get(k);
      if (v) return v;
      let best = 1e9;
      for (const p of STILE_PAL) {
        // distanza percettiva semplice (il verde pesa di più)
        const d = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11;
        if (d < best) ((best = d), (v = p));
      }
      cache.set(k, v);
      return v;
    };
  // 1. grana: per ogni blocco s×s il colore più presente (non la media: i contorni restano netti)
  for (let Y = 0; Y < H; Y++)
    for (let X = 0; X < W; X++) {
      const cont = new Map();
      let pieno = 0;
      for (let dy = 0; dy < s; dy++)
        for (let dx = 0; dx < s; dx++) {
          const i = ((Y * s + dy) * src.width + X * s + dx) * 4;
          if (D[i + 3] < 128) continue;
          pieno++;
          const k = (D[i] << 16) | (D[i + 1] << 8) | D[i + 2];
          cont.set(k, (cont.get(k) || 0) + 1);
        }
      if (pieno * 2 < s * s) continue;
      let kb = 0,
        nb = -1;
      for (const [k, n] of cont) if (n > nb) ((nb = n), (kb = k));
      const p = vicino(kb >> 16, (kb >> 8) & 255, kb & 255),
        j = (Y * W + X) * 4;
      // 2. tavolozza unica, un filo più scura
      o[j] = p[0];
      o[j + 1] = p[1];
      o[j + 2] = p[2];
      o[j + 3] = 255;
    }
  // 3. luce di luna: il pixel pieno con il vuoto sopra prende un tono freddo
  const pieno = (X, Y) => X >= 0 && Y >= 0 && X < W && Y < H && o[(Y * W + X) * 4 + 3];
  const luna = [138, 160, 168];
  for (let Y = H - 1; Y >= 0; Y--)
    for (let X = 0; X < W; X++) {
      if (!pieno(X, Y) || pieno(X, Y - 1)) continue;
      const j = (Y * W + X) * 4,
        lum = o[j] * 0.3 + o[j + 1] * 0.59 + o[j + 2] * 0.11;
      if (lum > 150) continue; // le cose già chiare restano
      const k = opz.luna ?? 0.45;
      o[j] += (luna[0] - o[j]) * k;
      o[j + 1] += (luna[1] - o[j + 1]) * k;
      o[j + 2] += (luna[2] - o[j + 2]) * k;
    }
  // 4. contorno scuro attorno alla sagoma
  const fuori = [];
  for (let Y = 0; Y < H; Y++)
    for (let X = 0; X < W; X++)
      if (!pieno(X, Y) && (pieno(X - 1, Y) || pieno(X + 1, Y) || pieno(X, Y - 1) || pieno(X, Y + 1)))
        fuori.push([X, Y]);
  x.putImageData(out, 0, 0);
  x.fillStyle = '#07050a';
  for (const [X, Y] of fuori) x.fillRect(X, Y, 1, 1);
  for (const k of ['canopyH', 'lights', 'chim']) if (src[k] != null) c[k] = src[k];
  return c;
}
// le immagini da non toccare: sovrapposizioni dello schermo e disegni già fatti a mano
const STILE_ESCLUSI = new Set(['vignette', 'grain', 'spavento', 'horse', 'albero']);
// stile del mondo (grana grossa) per ciò che è a 2×; ogni immagine si tratta una volta sola
const STILE_FATTO = new WeakMap();
function stileMondo(im) {
  if (!im || !im.getContext || (im.s || 1) !== 2) return im;
  if (!STILE_FATTO.has(im)) STILE_FATTO.set(im, stileAlbero(im));
  return STILE_FATTO.get(im);
}
// stile dell'interfaccia (icone dello zaino): stessa tavolozza e contorno, grana fine per restare leggibili
function stileIcona(im) {
  if (!im || !im.getContext || im._stile) return im;
  stilePersonaggio(im);
  // un alone chiaro e tenue attorno alla sagoma: sul fondo scuro delle caselle l'icona si stacca
  {
    const x = im.getContext('2d'),
      W = im.width,
      H = im.height,
      img = x.getImageData(0, 0, W, H),
      d = img.data,
      pieno = (X, Y) => X >= 0 && Y >= 0 && X < W && Y < H && d[(Y * W + X) * 4 + 3] > 127,
      alone = [];
    for (let Y = 0; Y < H; Y++)
      for (let X = 0; X < W; X++)
        if (!pieno(X, Y) && (pieno(X - 1, Y) || pieno(X + 1, Y) || pieno(X, Y - 1) || pieno(X, Y + 1)))
          alone.push((Y * W + X) * 4);
    for (const i of alone) {
      d[i] = 200;
      d[i + 1] = 184;
      d[i + 2] = 150;
      d[i + 3] = 70;
    }
    x.putImageData(img, 0, 0);
  }
  im._stile = 1;
  return im;
}
// passa un contenitore di immagini (oggetti e liste annidati) e sostituisce ogni immagine con quella in stile
function stilePassa(obj, f) {
  for (const k of Object.keys(obj)) {
    if (STILE_ESCLUSI.has(k)) continue;
    const v = obj[k];
    if (!v) continue;
    if (v.getContext) obj[k] = f(v);
    else if (typeof v === 'object') stilePassa(v, f);
  }
}
function stileTutto() {
  for (const C of [IMG, AIMG, FREEIMG, CROPIMG, CRIT, PC_IMG, FAUNA_IMG]) stilePassa(C, stileMondo);
  stilePassa(ICON, stileIcona);
}
// i fotogrammi fatti più tardi (il cane e il gatto del compagno, i bestiolini nuovi)
Ext.on('fotogrammiFatti', L => {
  try {
    for (let i = 0; i < L.length; i++) L[i] = stileMondo(L[i]);
  } catch (e) {
    segnala(e, 'stile');
  }
});
Ext.on('arte', () => {
  try {
    stileTutto();
  } catch (e) {
    segnala(e, 'stile');
  }
});

// ---------- i personaggi: lo stesso linguaggio, alla loro grana (i volti disegnati a mano restano leggibili) ----------
// tavolozza dell'albero più i toni di pelle, capelli e occhi; contorno scuro; luce di luna in alto
const STILE_PAL_PG = STILE_PAL.concat(
  [
    '#f2cca6',
    '#e2b48c',
    '#c8946e',
    '#a87458',
    '#845642',
    '#5e3a30', // pelle
    '#d8b050',
    '#a8783a',
    '#d8d4cc',
    '#8a8680',
    '#1a1416',
    '#8a3a1c',
    '#5a3a22', // capelli
    '#3a5a8a',
    '#3a6a3a',
    '#6a2a34',
    '#ece6da',
    '#c8c0b0' // occhi, labbra, camicie e colletti
  ].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)])
);
function stilePersonaggio(c) {
  const x = c.getContext('2d'),
    W = c.width,
    H = c.height,
    img = x.getImageData(0, 0, W, H),
    d = img.data,
    cache = new Map(),
    vicino = k => {
      let v = cache.get(k);
      if (v) return v;
      const r = k >> 16,
        g = (k >> 8) & 255,
        b = k & 255;
      let best = 1e9;
      for (const p of STILE_PAL_PG) {
        const e = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11;
        if (e < best) ((best = e), (v = p));
      }
      cache.set(k, v);
      return v;
    },
    pieno = (X, Y) => X >= 0 && Y >= 0 && X < W && Y < H && d[(Y * W + X) * 4 + 3] > 127;
  const o = new Uint8ClampedArray(d);
  for (let Y = 0; Y < H; Y++)
    for (let X = 0; X < W; X++) {
      const i = (Y * W + X) * 4;
      if (d[i + 3] < 128) continue;
      // il contorno (un pixel pieno con il vuoto accanto, già molto scuro) diventa il nero dell'albero
      const lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11,
        bordo = !pieno(X - 1, Y) || !pieno(X + 1, Y) || !pieno(X, Y - 1) || !pieno(X, Y + 1);
      let p = bordo && lum < 70 ? [7, 5, 10] : vicino((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      // la luce di luna: il primo pixel colorato sotto il contorno in alto
      if (!bordo && !pieno(X, Y - 2) && lum < 170) p = p.map((v, k) => v + ([138, 160, 168][k] - v) * 0.35);
      o[i] = p[0];
      o[i + 1] = p[1];
      o[i + 2] = p[2];
    }
  d.set(o);
  x.putImageData(img, 0, 0);
  return c;
}
Ext.on('foglioPersonaggio', c => {
  try {
    stilePersonaggio(c);
  } catch (e) {
    segnala(e, 'stile');
  }
});
Ext.avvolgi('genPortrait', (prossimo, L, mood) => stilePersonaggio(prossimo(L, mood)));

// ---------- il terreno: stessa grana dell'albero (ogni blocco 2×2 un solo pixel) e stessa tavolozza ----------
// La tela del terreno resta a 2× (il gioco la legge così): si uniforma solo il contenuto, blocco per blocco.
function stileTerreno(c) {
  const x = c.getContext('2d'),
    W = c.width,
    H = c.height,
    img = x.getImageData(0, 0, W, H),
    d = img.data,
    cache = new Map(),
    vicino = k => {
      let v = cache.get(k);
      if (v) return v;
      const r = k >> 16,
        g = (k >> 8) & 255,
        b = k & 255;
      let best = 1e9;
      for (const p of STILE_PAL) {
        const e = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11;
        if (e < best) ((best = e), (v = p));
      }
      cache.set(k, v);
      return v;
    };
  for (let Y = 0; Y + 1 < H; Y += 2)
    for (let X = 0; X + 1 < W; X += 2) {
      // il colore del blocco: la media dei quattro (sul prato le differenze sono piccole), poi la tavolozza
      let r = 0,
        g = 0,
        b = 0,
        n = 0;
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1]
      ]) {
        const i = ((Y + dy) * W + X + dx) * 4;
        if (d[i + 3] < 128) continue;
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
        n++;
      }
      if (!n) continue;
      const p = vicino(((r / n) << 16) | ((g / n) << 8) | (b / n));
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1]
      ]) {
        const i = ((Y + dy) * W + X + dx) * 4;
        if (d[i + 3] < 128) continue;
        d[i] = p[0];
        d[i + 1] = p[1];
        d[i + 2] = p[2];
      }
    }
  x.putImageData(img, 0, 0);
}
Ext.on('terreno', m => {
  try {
    if (!m.interior && m.ground) stileTerreno(m.ground);
  } catch (e) {
    segnala(e, 'stile');
  }
});
