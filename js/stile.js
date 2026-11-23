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
function stileTutto() {
  const fatto = new WeakMap(),
    tratta = im => {
      if (!im || !im.getContext || (im.s || 1) !== 2) return im;
      if (!fatto.has(im)) fatto.set(im, stileAlbero(im));
      return fatto.get(im);
    },
    passa = obj => {
      for (const k of Object.keys(obj)) {
        if (STILE_ESCLUSI.has(k)) continue;
        const v = obj[k];
        if (Array.isArray(v))
          for (let i = 0; i < v.length; i++) v[i] = Array.isArray(v[i]) ? v[i] : tratta(v[i]);
        else if (v && v.getContext) obj[k] = tratta(v);
        else if (v && typeof v === 'object' && !v.getContext && Object.values(v).some(x => x && x.getContext))
          passa(v); // per esempio FREEIMG.trees = { stagione: [alberi] }
      }
    };
  passa(IMG);
  passa(AIMG);
  if (typeof FREEIMG !== 'undefined') passa(FREEIMG);
}
Ext.on('arte', () => {
  try {
    stileTutto();
  } catch (e) {
    segnala(e, 'stile');
  }
});
