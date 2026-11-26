'use strict';
// ================= ALLEVAMENTO: coloranti, pecore tinte, lana colorata, latte di pecora =================
// · I COLORANTI si fanno al banco (categoria Tinture) con quello che dà l'orto: pomodoro → rosso, carota → arancio,
//   camomilla → giallo, spinaci → verde, mirtilli → blu, lavanda → viola, barbabietola → fucsia, noce → nero; il
//   bianco (cavolfiore) toglie la tinta. Ogni ricetta ha un'alternativa di un'altra stagione.
// · Con un colorante in mano, davanti a una PECORA al pascolo: «Tingi». Il vello prende il colore (si vede) e da lì
//   in poi la sua lana è di quel colore (lana_rosso, lana_blu…). Le altre bestie non si lasciano tingere.
// · La LANA COLORATA va al telaio: ogni colore diventa un colore «di lana» per vestiti, scarpe e accessori; con la
//   lana (anche bianca) si lavora lo scialle. Con due matasse dello stesso colore si rifà il letto (casa_libera.js).
// · Le pecore danno anche il LATTE DI PECORA (secondo prodotto, ANIMALS.pecora.prod2): ci si fa il pecorino.
// Disegni: le tinte si ottengono ricolorando i disegni esistenti (vello, matassa, coperta), con una cache.

const TINTE = {
  rosso: { n: 'Rosso', lana: 'rossa', c: '#c8302a', da: ['pomodoro', 'fragola'] },
  arancio: { n: 'Arancio', lana: 'arancio', c: '#e07a22', da: ['carota', 'zucca'] },
  giallo: { n: 'Giallo', lana: 'gialla', c: '#e8c030', da: ['camomilla', 'girasole'] },
  verde: { n: 'Verde', lana: 'verde', c: '#4a9a3a', da: ['spinaci', 'ortica'] },
  blu: { n: 'Blu', lana: 'blu', c: '#3456b8', da: ['mirtilli', 'more'] },
  viola: { n: 'Viola', lana: 'viola', c: '#7a3aa8', da: ['lavanda', 'viola'] },
  fucsia: { n: 'Fucsia', lana: 'fucsia', c: '#d8388a', da: ['barbabietola', 'lamponi'] },
  nero: { n: 'Nero', lana: 'nera', c: '#2a2630', da: ['noce', 'castagne'] },
  bianco: { n: 'Bianco', lana: 'bianca', c: '#f2eee4', da: ['cavolfiore', 'latte'] }
};
const TINTE_LANA = Object.keys(TINTE).filter(k => k !== 'bianco');

// ---------- oggetti, ricette, gusti ----------
Object.assign(ITEMS, {
  latte_pecora: {
    n: 'Latte di pecora',
    t: 'crop',
    v: 75,
    d: 'Denso e dolce. Con due secchi si fa il pecorino.'
  },
  pecorino: {
    n: 'Pecorino',
    t: 'food',
    e: 50,
    d: 'Stagionato sotto la cenere, sa di prato e di fumo. +50 energia.'
  }
});
Object.assign(PL, { latte_pecora: 'secchi di latte di pecora' });
Object.assign(SG, { latte_pecora: 'un secchio di latte di pecora' });
Object.assign(FAV_VAL, { latte_pecora: 75 });
if (ANIMALS.pecora) ANIMALS.pecora.prod2 = 'latte_pecora';
COOK.push({ id: 'pecorino', need: { latte_pecora: 2 }, min: 60, adv: 1, da: 'brom' });
Object.assign(LIKES.brom, { pecorino: 3 });
Object.assign(LIKES.ezekiel, { pecorino: 2 });
CRAFT_CAT.tin = 'Tinture';
for (const k in TINTE) {
  const T = TINTE[k];
  ITEMS['colorante_' + k] = {
    n: 'Colorante ' + T.n.toLowerCase(),
    t: 'res',
    v: 25,
    d:
      k === 'bianco'
        ? 'Un bagno di latte e cavolfiore: toglie la tinta a una pecora.'
        : `Con in mano il colorante, tocca una pecora al pascolo: il vello diventa ${T.n.toLowerCase()} e così la sua lana.`
  };
  for (const ing of T.da)
    if (ITEMS[ing]) CRAFTS.push({ id: 'colorante_' + k, q: 2, c: { [ing]: 2 }, cat: 'tin' });
  if (k === 'bianco') continue;
  ITEMS['lana_' + k] = {
    n: 'Lana ' + T.lana,
    t: 'crop',
    v: 120,
    d: `Lana di una pecora tinta di ${T.n.toLowerCase()}. Al telaio diventa un colore per i vestiti; due matasse rifanno il letto.`
  };
  PL['lana_' + k] = 'matasse di lana ' + T.lana;
  SG['lana_' + k] = 'una matassa di lana ' + T.lana;
  // un colore «di lana» per il guardaroba, e la riga del telaio che lo tesse
  COLORI['l_' + k] = ['Lana ' + T.lana, T.c];
  TELAIO.push(['l_' + k, 'lana_' + k, 2, 0]);
}
TELAIO.push(['acc:scialle', 'lana', 3, 0]);
Object.assign(LIKES.agatha, { lana_fucsia: 3, lana_rosso: 2 });
Object.assign(LIKES.clara, { lana_giallo: 3, lana_verde: 2 });
Object.assign(LIKES.lucius, { lana_viola: 3, lana_nero: 1 });
Object.assign(LIKES.tobia, { lana_rosso: 3 });

// ---------- ricolorare un disegno (con la cache) ----------
// filtro(r,g,b) dice quali pixel cambiano; quelli scelti prendono il colore voluto, con la loro luce (più chiaro
// dove erano più chiari), così pieghe e ombre restano.
const TINTA_CACHE = new Map();
function tintaImg(img, hex, filtro, chiave) {
  const k = chiave + '|' + hex;
  let c = TINTA_CACHE.get(img);
  if (!c) TINTA_CACHE.set(img, (c = {}));
  if (c[k]) return c[k];
  const w = iw(img),
    h = ih(img),
    [cv, x] = mk(w, h, { willReadFrequently: true }); // sul processore: lo stesso risultato su ogni macchina
  x.drawImage(img, 0, 0, w, h);
  const D = x.getImageData(0, 0, w, h),
    d = D.data,
    tr = parseInt(hex.slice(1, 3), 16),
    tg = parseInt(hex.slice(3, 5), 16),
    tb = parseInt(hex.slice(5, 7), 16);
  const lum = (r, g, b) => 0.3 * r + 0.59 * g + 0.11 * b;
  let somma = 0,
    n = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i + 3] && filtro(d[i], d[i + 1], d[i + 2])) {
      somma += lum(d[i], d[i + 1], d[i + 2]);
      n++;
    }
  if (!n) return (c[k] = img);
  const media = somma / n;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3] || !filtro(d[i], d[i + 1], d[i + 2])) continue;
    const f = Math.min(1.6, lum(d[i], d[i + 1], d[i + 2]) / media);
    d[i] = Math.min(255, tr * f + (f > 1 ? (f - 1) * 60 : 0));
    d[i + 1] = Math.min(255, tg * f + (f > 1 ? (f - 1) * 60 : 0));
    d[i + 2] = Math.min(255, tb * f + (f > 1 ? (f - 1) * 60 : 0));
  }
  x.putImageData(D, 0, 0);
  return (c[k] = cv);
}
// il vello: i pixel chiari e poco colorati
const filtroVello = (r, g, b) => r + g + b > 420 && Math.max(r, g, b) - Math.min(r, g, b) < 60;
// la coperta gialla del letto del nonno
const filtroCoperta = (r, g, b) => r > 120 && g > 80 && b < 120 && r - b > 70 && g > b + 30;

// la pecora tinta si vede (e anche la sua lana in casa)
Ext.on('pelo', (a, img) => {
  if (a.kind !== 'pecora' || !a.colore || !TINTE[a.colore] || a.colore === 'bianco') return null;
  return tintaImg(img, TINTE[a.colore].c, filtroVello, 'vello');
});
Ext.on('prodotto', a =>
  a.kind === 'pecora' && a.colore && ITEMS['lana_' + a.colore] ? 'lana_' + a.colore : null
);

// ---------- le icone: boccette e matasse ----------
const mixHex = (a, b, k) =>
  '#' +
  [1, 3, 5]
    .map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - k) + parseInt(b.slice(i, i + 2), 16) * k))
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
Ext.on('arte', () => {
  for (const k in TINTE) {
    const T = TINTE[k],
      [c, x] = mk(32, 32);
    // una boccetta di vetro col tappo di sughero, piena di colore
    x.fillStyle = '#2a1a10';
    x.fillRect(10, 9, 12, 19);
    x.fillRect(12, 6, 8, 4);
    x.fillStyle = '#d8e4e8';
    x.fillRect(11, 10, 10, 17);
    x.fillStyle = T.c;
    x.fillRect(11, 15, 10, 12);
    x.fillStyle = mixHex(T.c, '#ffffff', 0.35); // colori pieni: niente trasparenze (danno pixel diversi da macchina a macchina)
    x.fillRect(12, 16, 2, 9);
    x.fillStyle = mixHex(T.c, '#000000', 0.25);
    x.fillRect(19, 15, 2, 12);
    x.fillStyle = '#a8784a';
    x.fillRect(13, 6, 6, 4);
    x.fillStyle = '#c89a62';
    x.fillRect(13, 6, 6, 1);
    ICON['colorante_' + k] = c;
    if (k !== 'bianco' && ICON.lana)
      ICON['lana_' + k] = tintaImg(ICON.lana, T.c, (r, g, b) => r + g + b > 330, 'matassa');
  }
  if (ICON.latte && !ICON.latte_pecora) {
    const [c, x] = mk(32, 32);
    x.drawImage(ICON.latte, 0, 0);
    x.fillStyle = '#f4ead8';
    x.fillRect(19, 18, 8, 6);
    x.fillStyle = '#2a1a10';
    x.fillRect(20, 19, 2, 2);
    x.fillRect(24, 19, 2, 2);
    x.fillRect(22, 22, 2, 1);
    ICON.latte_pecora = c;
  }
  if (!ICON.pecorino) {
    const [c, x] = mk(32, 32);
    x.fillStyle = '#2a1a10';
    x.fillRect(5, 13, 22, 13);
    x.fillStyle = '#e8d8a8';
    x.fillRect(6, 14, 20, 11);
    x.fillStyle = '#8a6a3a';
    x.fillRect(6, 14, 20, 2);
    x.fillStyle = '#d0b880';
    for (const [a, b] of [
      [9, 18],
      [15, 20],
      [21, 17]
    ])
      x.fillRect(a, b, 2, 2);
    ICON.pecorino = c;
  }
});

// ---------- tingere le pecore al pascolo ----------
function tingiBestia(e, k) {
  const a = e.a,
    T = TINTE[k];
  if (a.kind !== 'pecora') {
    UI.toast(`${a.name} ti guarda la boccetta e fa un passo indietro. Si tingono solo le pecore.`);
    return;
  }
  if ((a.colore || 'bianco') === k) {
    UI.toast(`${a.name} è già ${k === 'bianco' ? 'bianca' : T.n.toLowerCase()}.`);
    return;
  }
  removeItem('colorante_' + k, 1);
  a.colore = k === 'bianco' ? null : k;
  Dialoghi.evento('tinta', { item: 'colorante_' + k });
  AU.play('spruzzo');
  burst('spark', e.x, e.y - 10, 10, T.c);
  floatText('✦', e.x, e.y - 24, T.c);
  UI.toast(
    k === 'bianco'
      ? `${a.name} esce dal bagno di latte bianca come una nuvola. La sua lana torna naturale.`
      : `${a.name} adesso è ${T.n.toLowerCase()}! Bela, si guarda, sembra contenta. La sua lana sarà ${T.lana}.`
  );
  if (typeof NET !== 'undefined') NET.save(G.st);
}
Ext.on('mira', (C, ax, ay, m) => {
  const it = selItem();
  if (!it || !/^colorante_/.test(it.id) || m.id !== 'main' || !G.fanimals || G.visit) return;
  const k = it.id.slice(10);
  for (const e of G.fanimals) {
    if (e.dentro) continue;
    const d = Math.hypot(e.x - ax, e.y - ay);
    if (d >= 18) continue;
    C.push({
      k: 'ext',
      d: d - 3,
      act: () => tingiBestia(e, k),
      fumetto: () => ({
        x: e.x,
        y: e.y - 28,
        t:
          e.a.kind === 'pecora'
            ? k === 'bianco'
              ? 'Lava'
              : 'Tingi di ' + TINTE[k].n.toLowerCase()
            : e.a.name
      })
    });
  }
});
