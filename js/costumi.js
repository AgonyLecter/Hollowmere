'use strict';
// ================= COSTUMI: gli abitanti di Hollowmere, fine Settecento =================
// Solo aspetto. Ogni abitante ha la testa disegnata a mano (mano: 1, vedi tools/pixel/) e un abito d'epoca
// coerente con il suo ruolo nella storia. I colori sono polverosi: lana, lino, cuoio, stoffe tinte a mano.
// Qui si sovrascrivono solo i capi: faccia, occhi e capelli restano quelli scelti negli altri file.

const COSTUMI = {
  // l'Anziano: nero da predicatore, colletto bianco, cilindro, barba bianca
  ezekiel: {
    mano: 1,
    volto: 'anziano',
    robe: '#1e1a22',
    shirt: '#2a2530',
    cravat: '#ece6da',
    boots: 1,
    shoe: '#141014'
  },
  // la merciaia: cuffia, scialle prugna, gonna scura
  agatha: {
    mano: 1,
    volto: 'anziana',
    cape: null,
    shawl: '#5e3444',
    dress: '#3e3440',
    shirt: '#d8c8b0',
    hatCol: '#e4dccb'
  },
  // il frate campanaro: saio di lana grezza con la corda
  lucius: { mano: 1, volto: 'frate', robe: '#3a3630', shirt: '#4a443a' },
  // la bambina: scialle giallo (il suo colore), vestito marrone
  clara: { mano: 1, volto: 'bambino', cape: null, shawl: '#c09a3a', dress: '#5e4230', shirt: '#e8dcc0' },
  // il fabbro: maniche arrotolate, grembiule di cuoio, stivali
  brom: {
    mano: 1,
    volto: 'robusto',
    cicatrice: 1,
    shirt: '#b8a080',
    apron: '#3a2a1e',
    pants: '#2e2418',
    boots: 1,
    shoe: '#1c140e'
  },
  // il ragazzino: tricorno troppo grande, giacchetta, calzoni al ginocchio
  tobia: {
    mano: 1,
    volto: 'bambino',
    lentiggini: 1,
    hat: 'tricorn',
    hatCol: '#3a3426',
    hatBand: '#8a7a5a',
    vest: '#5a5a3a',
    shirt: '#d8ccb0',
    pants: '#4a3e2c',
    calze: '#d8ccb0'
  },
  // il Senza Volto: nessuno sa chi fosse
  faceless: { mano: 1 },
  // il postino: giacca blu notte, tricorno, cravatta, stivali da viaggio
  ottavio: {
    mano: 1,
    coat: '#2e3a4e',
    hat: 'tricorn',
    hatCol: '#1e2430',
    hatBand: '#b89a5a',
    cravat: '#e8e0cc',
    shirt: '#d8d0c0',
    pants: '#2a2a32',
    boots: 1,
    shoe: '#1a140e'
  },
  // la viaggiatrice: scialle grigio, abito scuro
  irene: { mano: 1, volto: 'donna', shawl: '#3a3a44', dress: '#4e4438', shirt: '#cdbfa6' },
  // il mercante (e il cocchiere): giacca lunga nera, cilindro, cravatta, barba grigia
  mercante: {
    mano: 1,
    volto: 'sinistro',
    robe: null,
    coat: '#1e1a22',
    cravat: '#d8d0c0',
    shirt: '#3a3440',
    pants: '#1e1a22',
    boots: 1
  },
  // la bambina del pozzo: un azzurro che non si usa più
  nove: { mano: 1, volto: 'bambino' }
};
for (const k in COSTUMI) if (LOOKS[k]) LOOKS[k] = Object.assign({}, LOOKS[k], COSTUMI[k]);
LOOKS.cocchiere = LOOKS.mercante;

// i volti dei nuovi abitanti (gli altri: giovane o donna) e i loro segni personali
const VOLTO_RES = {
  bruno: 'robusto',
  teo: 'robusto',
  mirta: 'anziana',
  gaspare: 'anziano',
  silvio: 'giovane'
};
const SEGNI_RES = { nora: { lentiggini: 1 }, gaspare: { occhiali: 1 }, ada: { occhiali: 1 } };
// i nuovi abitanti della Valle: testa a mano; chi porta il vestito ha uno scialle, gli altri un gilet o una
// cravatta e gli stivali da lavoro
for (const r of RES_POOL) {
  const L = r.look;
  if (!L) continue;
  L.mano = 1;
  L.volto = L.volto || VOLTO_RES[r.id] || (L.dress || L.lip ? 'donna' : 'giovane');
  Object.assign(L, SEGNI_RES[r.id] || {});
  if (L.dress) L.shawl = L.shawl || mix(L.dress, '#2a1e1a', 0.45);
  else {
    L.boots = 1;
    if (!L.vest && !L.apron) L.cravat = L.cravat || '#e4dccb';
  }
  // espansione.js ha già copiato l'aspetto in LOOKS: si aggiorna anche quello
  if (LOOKS[r.id]) LOOKS[r.id] = Object.assign({}, LOOKS[r.id], L);
}
