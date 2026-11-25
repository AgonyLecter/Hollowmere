'use strict';
// ================= IL COMPAGNO (cane o gatto) =================
// Nella Valle, dal terzo giorno, davanti a casa compaiono due randagi: un cucciolo e un gattino. Ne scegli uno,
// gli dai un nome e l'aspetto. Vive con te: lo coccoli, gli dai le crocchette (in mano o nella ciotola di casa),
// ci giochi. Due comandi:
//   Segui  → ti accompagna ovunque (anche in casa e dagli amici), ti porta i rami, i sassi e le erbe che trova
//            e, se sei sfinito, una volta al giorno ti tira su;
//   Resta  → fa la sua vita (compVita): di giorno gira attorno a casa, caccia, gioca, annusa, si sdraia al sole;
//            all'alba e a mezzogiorno entra a mangiare alla ciotola e fa un pisolino; la notte dorme nella cuccia.
//            Quando passi ti corre incontro e ti fa le feste, poi torna alle sue cose: non ti segue mai.
// I dati stanno nella tua partita (free.pet), anche quando sei in visita (G.home); la posizione è solo qui (G.comp).

Object.assign(ITEMS, {
  crocchette: {
    n: 'Crocchette',
    t: 'res',
    d: 'Cibo per il tuo compagno: dagliele in mano o mettile nella ciotola di casa.'
  },
  ciotola: {
    n: 'Ciotola',
    t: 'arredo',
    d: 'Mettila in casa e riempila di crocchette: mangia da solo la mattina.'
  },
  cuccia: {
    n: 'Cuccia',
    t: 'arredo',
    d: 'Una cesta di vimini col cuscino a quadri: ci dorme raggomitolato, e lo vedi.',
    flat: 1
  },
  pallina: { n: 'Pallina', t: 'arredo', d: 'Rossa, rimbalza. I cani la adorano.' },
  osso: { n: 'Osso di gomma', t: 'arredo', d: 'Da mordere per ore.' },
  topolino: { n: 'Topolino di stoffa', t: 'arredo', d: 'Pieno di erba gatta.' },
  gomitolo: { n: 'Gomitolo', t: 'arredo', d: 'Lana avanzata, srotolata in un attimo.' }
});
const COMP_KIND = {
  cane: {
    n: 'Cane',
    nomi: ['Briciola', 'Ardito', 'Pepe', 'Tobi', 'Nebbia'],
    giochi: ['pallina', 'osso'],
    verso: 'abbaia',
    skin: [
      { n: 'Fulvo', b: '#c8823a', m: '#f2e2c4' },
      { n: 'Nero focato', b: '#2e2a2c', m: '#c8884a' },
      { n: 'Pezzato', b: '#f2ece0', m: '#6a4428', macchie: 1 },
      { n: 'Grigio', b: '#8a8a94', m: '#e8e8ee' }
    ]
  },
  gatto: {
    n: 'Gatto',
    nomi: ['Fumo', 'Mirtillo', 'Lince', 'Cenere', 'Zenzero'],
    giochi: ['topolino', 'gomitolo'],
    verso: 'meow',
    skin: [
      { n: 'Rosso tigrato', b: '#d8823a', m: '#f4d8b0', righe: 1 },
      { n: 'Nero', b: '#2a2630', m: '#3a3640' },
      { n: 'Grigio', b: '#9a9aa6', m: '#e8e8ee', righe: 1 },
      { n: 'Tricolore', b: '#f2ece0', m: '#d8823a', macchie: 1 }
    ]
  }
};
// la bottega del compagno (dalla sua schermata)
const COMP_SHOP = [
  ['crocchette', 20],
  ['ciotola', 120],
  ['cuccia', 450],
  ['pallina', 90],
  ['osso', 70],
  ['topolino', 80],
  ['gomitolo', 60]
];
const COMP_FAME = 60; // da qui in su ha fame

// ---------- disegni ----------
// fotogrammi: 0-1 cammina, 2 seduto, 3 dorme. Disegnati a mano, un manto per volta, con il suo collare
// (tools/pixel/compagni_abbozzo.py → js/compagni_mano.js); le tele si fanno la prima volta che servono.
const COMP_IMG = {};
function compImg(kind, skin) {
  const k = kind + skin;
  if (!COMP_IMG[k]) {
    const M = COMPAGNI_MANO[kind],
      D = M[skin] || M[0];
    COMP_IMG[k] = [0, 1, 2, 3].map(f => daGriglia(D, 'f' + f));
  }
  return COMP_IMG[k];
}
Ext.on('arte', () => {
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  const legno = rp('#8a5a30'),
    rosso = rp('#c8402a');
  I('crocchette', P => {
    P.body(
      10,
      28,
      () => 16,
      Y => 9 - (Y - 10) * 0.05,
      rp('#c89a5a'),
      { spec: 0.3 }
    );
    P.rect(8, 8, 16, 4, rp('#a8402a'));
    for (const [x, y] of [
      [12, 18],
      [17, 21],
      [20, 16],
      [14, 24]
    ])
      P.ellipse(x, y, 1.6, 1.3, rp('#6a3a1a'), { edge: false });
  });
  I('ciotola', P => {
    P.ellipse(16, 20, 12, 6, rp('#4a7ab0'), { spec: 0.6 });
    P.ellipse(16, 18, 9, 3.4, rp('#2a3a5a'), { edge: false });
  });
  I('cuccia', P => {
    P.rect(6, 14, 20, 14, legno, { mod: woodMod });
    P.body(
      5,
      15,
      () => 16,
      Y => 2 + (Y - 5) * 1.15,
      rosso,
      { nyF: () => -0.4 }
    );
    P.ellipse(16, 23, 4, 5, rp('#2a1a10'), { edge: false });
  });
  I('pallina', P => P.ellipse(16, 18, 8, 8, rosso, { spec: 0.8 }));
  I('osso', P => {
    P.capsule(9, 20, 23, 12, 2.4, rp('#e8dcc0'));
    for (const [x, y] of [
      [8, 18],
      [10, 22],
      [22, 10],
      [24, 14]
    ])
      P.ellipse(x, y, 2.6, 2.6, rp('#e8dcc0'));
  });
  I('topolino', P => {
    P.ellipse(16, 19, 8, 5, rp('#8a8a94'), { spec: 0.3 });
    P.ellipse(12, 14, 2.4, 2.4, rp('#d8a0a0'));
    P.capsule(24, 20, 29, 15, 0.6, rp('#d8a0a0'));
  });
  I('gomitolo', P => {
    P.ellipse(16, 18, 9, 9, rp('#8a4ab0'), {
      spec: 0.4,
      mod: (X, Y, v) => ((X + Y * 2) % 5 === 0 ? v - 0.2 : v)
    });
    P.capsule(22, 24, 28, 28, 0.5, rp('#8a4ab0'));
  });
  // in casa
  FREEIMG.ciotola = SP(12, 7, P => {
    P.ellipse(12, 9, 10, 4.5, rp('#4a7ab0'), { spec: 0.6 });
    P.ellipse(12, 7, 7.5, 2.4, rp('#2a3a5a'), { edge: false });
  });
  FREEIMG.cuccia = SP(18, 18, P => {
    P.rect(4, 14, 28, 20, legno, { mod: woodMod });
    P.body(
      2,
      16,
      () => 18,
      Y => 2 + (Y - 2) * 1.2,
      rosso,
      { nyF: () => -0.4 }
    );
    P.ellipse(18, 27, 6, 7, rp('#2a1a10'), { edge: false });
  });
  FREEIMG.pallina = SP(8, 8, P => P.ellipse(8, 9, 5, 5, rosso, { spec: 0.8 }));
  FREEIMG.osso = SP(12, 6, P => P.capsule(4, 6, 20, 6, 2, rp('#e8dcc0')));
  FREEIMG.topolino = SP(10, 7, P => {
    P.ellipse(9, 8, 6, 4, rp('#8a8a94'), { spec: 0.3 });
    P.capsule(15, 9, 19, 6, 0.6, rp('#d8a0a0'));
  });
  FREEIMG.gomitolo = SP(8, 8, P => P.ellipse(8, 9, 5.5, 5.5, rp('#8a4ab0'), { spec: 0.4 }));
});
Object.assign(SFX, {
  abbaia: (a, t) => {
    for (const d of [0, 0.16]) {
      a.osc('sawtooth', 300, t + d, 0.08, 0.12, null, 0.005, 180);
      a.noise(t + d, 0.06, 0.12, 'bandpass', 900, 2);
    }
  }
});

// ---------- dove sta, cosa fa ----------
const compCasa = () => G.home || G.st;
const compPet = () => {
  const c = compCasa();
  return c && c.free && c.free.pet;
};
const compNotte = () => G.st.time >= 21 * 60 || G.st.time < 6 * 60;
const compCuori = p => Math.min(5, Math.floor(p.love / 4));
// i posti davanti a casa dove gira quando resta
const COMP_GIRO = [
  [10, 11],
  [12, 12],
  [8, 12],
  [14, 13],
  [11, 14],
  [6, 11]
];
// la cuccia (o un angolo libero) in casa
function compCuccia(m) {
  const o = m.objs.find(o => o.kind === 'furn' && o.fid === 'cuccia');
  // sopra il cuscino della cesta (che sta a terra, sotto di lui: lo vedi dormire)
  if (o) return o.img ? [o.dx + iw(o.img) / 2, o.dy + ih(o.img) / 2 + 4] : [o.tx * 16 + 8, o.ty * 16 + 12];
  for (let r = 0; r < 6; r++)
    for (let y = (m.h >> 1) - r; y <= (m.h >> 1) + r; y++)
      for (let x = (m.w >> 1) - r; x <= (m.w >> 1) + r; x++)
        if (!m.solid(x, y) && !m.objAt(x, y)) return [x * 16 + 8, y * 16 + 12];
  return [m.w * 8, m.h * 8];
}
// quando resta, la sua giornata: in casa la notte (cuccia), all'alba e a mezzogiorno (ciotola e pisolino);
// il resto del giorno fuori, attorno a casa
const compInCasa = () => {
  const t = G.st.time;
  return compNotte() || t < 7 * 60 || (t >= 12 * 60 && t < 13 * 60 + 30);
};
// la mappa dove deve stare adesso (null: non è qui, è a casa mentre sei in visita)
function compMappa(p) {
  if (p.modo === 'segui') return G.map.id;
  if (G.visit) return null;
  return compInCasa() ? 'house' : 'main';
}
// la porta di casa: fuori (dove si entra) e dentro (dove si esce)
function compPorta(mapId) {
  if (mapId === 'house') {
    const d = (G.maps.house.doors || []).find(d => d.to === 'main');
    return d ? [d.tx * 16 + 8, d.ty * 16 + 8] : [6 * 16 + 8, 8 * 16];
  }
  const d = (G.maps.house.doors || []).find(d => d.to === 'main');
  return d ? [d.x * 16 + 8, d.y * 16 + 6] : [10 * 16 + 8, 10 * 16 + 6];
}
// la ciotola in casa (o la cuccia, se non c'è)
function compCiotola(m) {
  const o = m.objs.find(o => o.kind === 'furn' && o.fid === 'ciotola');
  return o ? [o.tx * 16 + 8, o.ty * 16 + 14] : compCuccia(m);
}
// fuori, la sua zona: attorno a casa, mai lontano
const COMP_CASA = [11, 12],
  COMP_RAGGIO = 9;
function compPuntoLibero(m) {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2,
      r = 2 + Math.random() * (COMP_RAGGIO - 2),
      x = Math.round(COMP_CASA[0] + Math.cos(a) * r),
      y = Math.round(COMP_CASA[1] + Math.sin(a) * r * 0.7);
    // il punto vero (casella arrotondata, ai piedi) deve restare dentro la zona: vicino al bordo l'arrotondamento
    // lo spingeva appena fuori, e il compagno ci andava
    if (
      x > 0 &&
      y > 0 &&
      x < m.w &&
      y < m.h &&
      !m.solid(x, y) &&
      !m.objAt(x, y) &&
      compNellaZona(x * 16 + 8, y * 16 + 12)
    )
      return [x * 16 + 8, y * 16 + 12];
  }
  const [x, y] = COMP_GIRO[Math.floor(Math.random() * COMP_GIRO.length)];
  return [x * 16 + 8, y * 16 + 12];
}
const compNellaZona = (x, y) =>
  Math.hypot(x / 16 - COMP_CASA[0], (y / 16 - COMP_CASA[1]) / 0.7) <= COMP_RAGGIO + 1.5;
function compPiazza(c, p) {
  const m = G.maps[c.map];
  if (p.modo === 'segui') {
    const [dx, dy] = DIRV[G.player.dir];
    c.x = G.player.x - dx * 14;
    c.y = G.player.y - dy * 10 + 2;
  } else if (G.map && G.map.id === c.map) {
    // arriva dove sei tu: entra dalla porta
    [c.x, c.y] = compPorta(c.map);
  } else if (c.map === 'house') [c.x, c.y] = compCompito() || compCuccia(m);
  else [c.x, c.y] = compPuntoLibero(m);
  c.st = 'idle';
  c.att = null;
  c.t = 1;
}
// dove sta in casa quando non lo vedi: la notte nella cuccia, di giorno accanto alla ciotola
function compCompito() {
  return compNotte() ? null : compCiotola(G.maps.house);
}
function compTick(dt) {
  const p = compPet();
  if (!p || G.mode !== 'game' || !G.map || G.cut) return;
  const c = (G.comp = G.comp || {
      map: null,
      x: 0,
      y: 0,
      dir: 1,
      f: 0,
      st: 'idle',
      t: 0,
      cuore: 8,
      chiama: 0,
      aiuto: 20
    }),
    dove = compMappa(p);
  if (!dove) {
    c.map = null;
    return;
  }
  if (c.map !== dove) {
    // se lo stai guardando, prima va alla porta a piedi; poi passa dall'altra parte
    if (p.modo !== 'segui' && c.map && c.map === G.map.id && (dove === 'house' || dove === 'main')) {
      const [px, py] = compPorta(c.map);
      if (Math.hypot(px - c.x, py - c.y) > 4) {
        compVai(c, px, py, 50, dt);
        return;
      }
    }
    c.map = dove;
    compPiazza(c, p);
  }
  if (c.map !== G.map.id) return;
  const pl = G.player,
    dP = Math.hypot(pl.x - c.x, pl.y - c.y);
  c.t -= dt;
  c.posa = null;
  c.cuore -= dt;
  c.chiama -= dt;
  let tx = null,
    ty = null,
    vel = 46;
  // si gioca: tutto il resto aspetta
  if (c.gioco) {
    const v = compGiocoTick(c, p, dt, dP);
    if (v && compVai(c, v[0], v[1], v[2], dt)) return;
    c.st = c.posa || 'sit';
    return;
  }
  if (p.modo === 'segui') {
    if (dP > 220) compPiazza(c, p);
    // ti porta quello che trova per terra
    c.aiuto -= dt;
    if (!c.preda && c.aiuto <= 0) {
      c.aiuto = 18 + Math.random() * 12;
      c.preda = compCercaPreda();
    }
    if (c.preda) {
      const o = c.preda;
      if (!G.map.objs.includes(o)) c.preda = null;
      else {
        tx = o.tx * 16 + 8;
        ty = o.ty * 16 + 12;
        vel = 70;
        if (Math.hypot(tx - c.x, ty - c.y) < 6) {
          compRaccogli(p, o);
          c.preda = null;
        }
      }
    }
    // ti viene dietro senza scatti: parte quando sei un po' lontano, si ferma quando ti è accanto (non a ogni passo),
    // e rallenta avvicinandosi
    if (tx == null) {
      if (dP > 36) c.insegue = true;
      else if (dP < 20) c.insegue = false;
      if (c.insegue) {
        [tx, ty] = compAccanto(c, pl);
        vel = Math.min(dP > 80 ? 105 : 82, 26 + dP * 1.3);
      }
    }
    // sei sfinito: una volta al giorno ti si accoccola vicino e ti rimette in piedi
    const st = G.st;
    if (st.energy < 15 && p.tirasu !== st.day && dP < 40) {
      p.tirasu = st.day;
      st.energy = Math.min(100, st.energy + 20);
      AU.play(COMP_KIND[p.kind].verso);
      floatText('♥', c.x, c.y - 18, '#ff7a6a');
      UI.toast(`${p.name} ti si accoccola vicino. Ti senti meglio (+20 energia).`);
      UI.hud();
    }
  } else {
    const v = compVita(c, p, dP, dt);
    if (v) [tx, ty, vel] = v;
  }
  // ha fame: ti chiama quando sei vicino
  if (p.fame >= COMP_FAME && dP < 90 && c.chiama <= 0) {
    c.chiama = 40;
    AU.play(COMP_KIND[p.kind].verso);
    UI.toast(`${p.name} ha fame e ti chiama.`);
  }
  if (tx != null && compVai(c, tx, ty, vel, dt)) return;
  if (c.st !== 'sleep' || p.modo === 'segui') c.st = c.posa || 'sit';
}
// il posto al tuo fianco, dalla parte dove già si trova (così non ti gira intorno e non ti sta addosso)
function compAccanto(c, pl) {
  const lato = c.x < pl.x ? -1 : 1;
  return [pl.x + lato * 13, pl.y + 3];
}
// un passo verso (tx, ty): vero se si è mosso
function compVai(c, tx, ty, vel, dt) {
  const dx = tx - c.x,
    dy = ty - c.y,
    d = Math.hypot(dx, dy);
  if (d <= 2) return false;
  c.x += (dx / d) * Math.min(d, vel * dt);
  c.y += (dy / d) * Math.min(d, vel * dt);
  if (Math.abs(dx) > 1) c.dir = dx < 0 ? -1 : 1;
  c.f += dt * (vel > 70 ? 10 : 6);
  c.st = 'move';
  return true;
}
// ---------- quando resta: la sua vita ----------
// Ogni attività dura un po' e poi ne sceglie un'altra. Se passi ti corre incontro, ti fa le coccole e torna alle
// sue cose: non ti segue mai fuori dalla sua zona attorno a casa. Restituisce [x, y, velocità] dove andare, o null.
function compVita(c, p, dP, dt) {
  const pl = G.player,
    m = G.map,
    K = COMP_KIND[p.kind];
  c.saluto = (c.saluto || 0) - dt;
  c.posa = null;
  // il saluto: ti vede (se dorme, solo se gli arrivi vicino), corre da te e si fa coccolare
  const vede = c.st === 'sleep' ? dP < 22 : dP < 70;
  if (c.att !== 'saluta' && c.saluto <= 0 && vede && compNellaZona(pl.x, pl.y)) {
    c.att = 'saluta';
    c.t = 6;
    c.coccole = 0;
    c.vicino = false;
    AU.play(K.verso);
  }
  if (c.att === 'saluta') {
    if (c.t <= 0 || dP > 110 || !compNellaZona(pl.x, pl.y)) {
      c.att = null;
      c.saluto = 60;
    } else {
      // ti corre incontro e si ferma al tuo fianco; se ti sposti un po' resta lì, se ti allontani ti viene dietro
      if (dP < 20) c.vicino = true;
      else if (dP > 32) c.vicino = false;
      if (!c.vicino) {
        const [ax, ay] = compAccanto(c, pl);
        return [ax, ay, Math.min(88, 24 + dP * 1.4)];
      }
      c.dir = pl.x < c.x ? -1 : 1;
      c.posa = 'sit';
      c.coccole -= dt;
      if (c.coccole <= 0) {
        c.coccole = 1.1;
        c.salto = G.t; // un saltello di gioia a ogni cuore
        floatText('♥', c.x + (Math.random() - 0.5) * 8, c.y - 16, '#ff8a8a', 0.8);
      }
      return null;
    }
  }
  // in casa: all'alba e a mezzogiorno mangia e beve alla ciotola, poi un pisolino; la notte la cuccia
  if (m.id === 'house') {
    const [bx, by] = compNotte() ? compCuccia(m) : c.att === 'pisolino' ? compCuccia(m) : compCiotola(m);
    if (Math.hypot(bx - c.x, by - c.y) > 3) return [bx, by, 34];
    // un gioco lasciato in casa: ci va e lo prende a zampate (o lo morde), poi il pisolino
    if (!compNotte() && c.att === 'giocattolo' && c.gObj && m.objs.includes(c.gObj)) {
      const o = c.gObj,
        gx = o.dx + iw(o.img) / 2 + (c.x < o.dx ? -7 : 7),
        gy = o.dy + ih(o.img);
      if (Math.hypot(gx - c.x, gy - c.y) > 3) return [gx, gy, 46];
      c.dir = o.dx + iw(o.img) / 2 < c.x ? -1 : 1;
      const fase = Math.floor(G.t * 2.2) % 3;
      c.posa = fase === 0 ? 'sleep' : fase === 1 ? 'move' : 'sit';
      if (fase === 1) o._gt = G.t + 0.25; // la zampata: il gioco sobbalza
      if (c.t <= 0) ((c.att = 'pisolino'), (c.t = 999));
      return null;
    }
    if (compNotte() || c.att === 'pisolino') c.st = 'sleep';
    else {
      // mangia (muove la testa), e dopo un po' gioca (se in casa c'è un suo gioco) o va a sonnecchiare
      if (!c.att) ((c.att = 'mangia'), (c.t = 8));
      c.posa = Math.floor(G.t * 3) % 2 ? 'sit' : 'move';
      if (c.t <= 0) {
        const g = m.objs.find(o => o.kind === 'furn' && K.giochi.includes(o.fid) && o.img);
        if (g && c.att === 'mangia') ((c.att = 'giocattolo'), (c.gObj = g), (c.t = 7 + Math.random() * 4));
        else ((c.att = 'pisolino'), (c.t = 999));
      }
    }
    return null;
  }
  // fuori: un'attività alla volta
  if (c.t <= 0 || !c.att) {
    // un'attività diversa dalle ultime due (le giornate sono varie); il sole solo nel primo pomeriggio
    const ora = G.st.time,
      sole = ora >= 14 * 60 && ora < 17 * 60,
      ultime = (c.ultime = c.ultime || []),
      pesi = { giro: 3, caccia: 3, gioca: 2, annusa: 1.5, sole: sole ? 3 : 0 },
      scelte = Object.keys(pesi).filter(a => pesi[a] && !ultime.includes(a)),
      tot = scelte.reduce((t, a) => t + pesi[a], 0);
    let r = Math.random() * tot;
    c.att = scelte.find(a => (r -= pesi[a]) < 0) || scelte[0];
    ultime.push(c.att);
    if (ultime.length > 2) ultime.shift();
    c.t = { sole: 14, giro: 7, caccia: 6, gioca: 4, annusa: 4 }[c.att] + Math.random() * 4;
    c.dest = compPuntoLibero(m);
    c.fase = 0;
    c.t2 = 1.2 + Math.random();
  }
  const [dx, dy] = c.dest;
  switch (c.att) {
    case 'giro':
      return [dx, dy, 34];
    case 'annusa':
      // a testa bassa, a piccoli passi
      if (Math.hypot(dx - c.x, dy - c.y) > 3) return [dx, dy, 18];
      c.posa = Math.floor(G.t * 2) % 2 ? 'sit' : 'move';
      return null;
    case 'sole':
      // si sdraia al sole
      if (Math.hypot(dx - c.x, dy - c.y) > 3) return [dx, dy, 30];
      c.st = 'sleep';
      return null;
    case 'caccia':
      // si acquatta, poi scatta e salta sulla preda
      if (c.fase === 0) {
        c.posa = 'sleep';
        c.t2 -= dt;
        if (c.t2 <= 0) ((c.fase = 1), (c.t2 = 0));
        c.dir = dx < c.x ? -1 : 1;
        return null;
      }
      if (Math.hypot(dx - c.x, dy - c.y) > 3) return [dx, dy, 120];
      if (c.fase === 1) {
        c.fase = 2;
        if (Math.random() < 0.35) floatText('!', c.x, c.y - 18, '#f4d040', 0.8);
      }
      return null;
    case 'gioca': {
      // le corse matte: corre nel suo punto, poi un cerchio stretto velocissimo (spostato verso casa: resta nella zona)
      if (c.fase === 0) {
        if (Math.hypot(dx - c.x, dy - c.y) > 3) return [dx, dy, 60];
        c.fase = 1;
      }
      const a = G.t * 7,
        cx = dx + (COMP_CASA[0] * 16 + 8 - dx) * 0.2,
        cy = dy + (COMP_CASA[1] * 16 + 12 - dy) * 0.2;
      return [cx + Math.cos(a) * 14, cy + Math.sin(a) * 7, 110];
    }
  }
  return null;
}
// rami, sassi, erbacce ed erbe spontanee vicino a te: il compagno li va a prendere
function compCercaPreda() {
  if (G.map.id !== 'main' || G.visit) return null;
  const pl = G.player;
  let best = null,
    bd = 6 * 16;
  for (const o of G.map.objs) {
    if (o.kind !== 'debris' || !o.dt) continue;
    if (!(o.dt === 'ramo' || o.dt === 'sasso' || o.dt === 'erbaccia' || o.dt.startsWith('w_'))) continue;
    const d = Math.hypot(o.tx * 16 + 8 - pl.x, o.ty * 16 + 12 - pl.y);
    if (d < bd) {
      bd = d;
      best = o;
    }
  }
  return best;
}
function compRaccogli(p, o) {
  const st = G.st,
    t = o.dt,
    got = t.startsWith('w_')
      ? [t.slice(2), 1]
      : { ramo: ['legna', 1], sasso: ['pietra', 1], erbaccia: ['fibra', 1] }[t];
  if (!got || !ITEMS[got[0]]) return;
  delete st.free.debris[fkey(o.tx, o.ty)];
  mapRemove(G.map, o);
  riponi(got[0], got[1]);
  AU.play('pick');
  floatText(`+${got[1]} ${ITEMS[got[0]].n}`, o.tx * 16 + 8, o.ty * 16 - 4);
  if (!p.portati) UI.toast(`${p.name} ti ha portato ${ITEMS[got[0]].n.toLowerCase()}. Che bravo!`);
  p.portati = (p.portati || 0) + 1;
}
// ---------- giocare davvero ----------
// Lanci il gioco (resta tuo: non si consuma). Il cane gli corre dietro, lo prende in bocca e te lo riporta ai piedi;
// il gatto si acquatta, ci salta sopra e lo prende a zampate tre volte, poi si siede soddisfatto.
function compLancia(id) {
  const p = compPet(),
    c = G.comp,
    pl = G.player;
  if (!p || !c || c.map !== G.map.id || Math.hypot(c.x - pl.x, c.y - pl.y) > 170) {
    UI.toast(`${p ? p.name : 'Il compagno'} non è qui: giocate quando è vicino.`);
    return false;
  }
  const m = G.map,
    [dx, dy] = DIRV[pl.dir];
  let dist = 64,
    ax,
    ay;
  // atterra davanti a te, sul primo posto libero
  for (; dist >= 16; dist -= 8) {
    ax = pl.x + dx * dist;
    ay = pl.y - 4 + dy * dist;
    // libero, e non dietro un albero o un oggetto alto (che lo coprirebbe)
    const tx = Math.floor(ax / 16),
      ty = Math.floor(ay / 16);
    let coperto = false;
    for (let k = 0; k <= 3 && !coperto; k++)
      for (let j = -1; j <= 1; j++) {
        const o = m.objAt(tx + j, ty + k);
        if (o && o.img && ih(o.img) > 20 + k * 16) coperto = true;
      }
    if (!m.solid(tx, ty) && !coperto) break;
  }
  c.gioco = {
    id,
    fase: 'volo',
    x0: pl.x,
    y0: pl.y - 10,
    x: pl.x,
    y: pl.y - 10,
    ax,
    ay,
    t: 0,
    dur: 0.45,
    giri: 0,
    max: 15
  };
  c.att = null;
  AU.play('blip');
  return true;
}
function compGiocoTick(c, p, dt, dP) {
  const g = c.gioco,
    pl = G.player,
    cane = p.kind === 'cane';
  g.t += dt;
  g.max -= dt;
  if (g.max <= 0) return compGiocoFine(c, p);
  if (g.fase === 'volo') {
    const k = Math.min(1, g.t / g.dur);
    g.x = g.x0 + (g.ax - g.x0) * k;
    g.y = g.y0 + (g.ay - g.y0) * k - Math.sin(k * Math.PI) * 14;
    if (k >= 1) ((g.fase = 'terra'), (g.t = 0), AU.play('pick'));
    c.dir = g.x < c.x ? -1 : 1;
    return [g.ax, g.ay + 2, 118]; // parte già mentre vola
  }
  if (g.fase === 'terra') {
    const d = Math.hypot(g.x - c.x, g.y + 2 - c.y);
    if (d > 6) return [g.x + (c.x < g.x ? -4 : 4), g.y + 2, cane ? 125 : 110];
    if (cane) {
      g.fase = 'riporta';
      AU.play(COMP_KIND[p.kind].verso);
    } else ((g.fase = 'agguato'), (g.t = 0));
    return null;
  }
  if (g.fase === 'riporta') {
    // in bocca, fino ai tuoi piedi
    g.x = c.x + c.dir * 7;
    g.y = c.y - 6;
    if (dP > 18) {
      const [ax, ay] = compAccanto(c, pl);
      return [ax, ay, Math.min(100, 30 + dP * 1.3)];
    }
    g.x = c.x + c.dir * 8;
    g.y = c.y;
    return compGiocoFine(c, p);
  }
  if (g.fase === 'agguato') {
    // il gatto si acquatta, muove il sedere… e salta
    c.posa = 'sleep';
    c.dir = g.x < c.x ? -1 : 1;
    if (g.t > 0.7) {
      g.fase = 'salto';
      g.t = 0;
      g.sx = c.x;
      g.sy = c.y;
      // la zampata: il gioco scappa un po' più in là
      const a = Math.random() * Math.PI * 2,
        nx = g.x + Math.cos(a) * 18,
        ny = g.y + Math.sin(a) * 10,
        m = G.map;
      g.gx = g.x;
      g.gy = g.y;
      g.nx = m.solid(Math.floor(nx / 16), Math.floor(ny / 16)) ? g.x : nx;
      g.ny = m.solid(Math.floor(nx / 16), Math.floor(ny / 16)) ? g.y : ny;
    }
    return null;
  }
  if (g.fase === 'salto') {
    const k = Math.min(1, g.t / 0.35);
    c.x = g.sx + (g.gx - g.sx) * k;
    c.y = g.sy + (g.gy + 2 - g.sy) * k;
    c.salto = G.t - k * 0.32 + 0.16; // in aria
    c.posa = 'move';
    if (k >= 1) {
      g.fase = 'rotola';
      g.t = 0;
      AU.play('pick');
    }
    return null;
  }
  if (g.fase === 'rotola') {
    const k = Math.min(1, g.t / 0.4);
    g.x = g.gx + (g.nx - g.gx) * k;
    g.y = g.gy + (g.ny - g.gy) * k - Math.sin(k * Math.PI) * 4;
    if (k >= 1) {
      g.giri++;
      if (g.giri >= 3) return compGiocoFine(c, p);
      g.fase = 'terra';
    }
    return null;
  }
  return null;
}
function compGiocoFine(c, p) {
  c.gioco = null;
  c.salto = G.t;
  c.posa = 'sit';
  c.saluto = 30;
  AU.play(COMP_KIND[p.kind].verso);
  floatText('♥', c.x, c.y - 18, '#ff8a8a', 1);
  if (!p.gioco) {
    p.gioco = true;
    p.love = Math.min(20, p.love + 1);
    UI.toast(`${p.name} è felice: oggi avete giocato.`);
  }
  return null;
}
// il gioco che vola, rotola o sta in bocca, e i giochi di casa che sobbalzano sotto le zampate
Ext.on('listaMondo', (list, m) => {
  const c = G.comp,
    g = c && c.gioco;
  if (g && c.map === m.id && FREEIMG[g.id]) {
    const im = FREEIMG[g.id];
    list.push({
      sy: g.fase === 'riporta' ? c.y + 1 : g.y + 4,
      draw: () => {
        if (g.fase === 'volo' || g.fase === 'rotola') {
          ctx.fillStyle = 'rgba(0,0,0,.2)';
          ctx.fillRect(Math.round(g.x - 3), Math.round((g.fase === 'volo' ? g.ay : g.ny) + 3), 6, 1);
        }
        ctx.drawImage(im, Math.round(g.x - iw(im) / 2), Math.round(g.y - ih(im) + 3));
      }
    });
  }
  if (m.id !== 'house') return;
  for (const o of m.objs) {
    if (o.kind !== 'furn' || !o._gt) continue;
    o._bx = o._bx ?? o.dx;
    o._by = o._by ?? o.dy;
    const k = o._gt - G.t;
    o.dx = o._bx + (k > 0 ? Math.round(Math.sin(G.t * 40) * 1.5) : 0);
    o.dy = o._by - (k > 0 ? Math.round(k * 8) : 0);
  }
});
Ext.on('mpTick', compTick);

// ---------- ogni mattina ----------
Ext.on('freeMorning', st => {
  if (!isFree(st)) return;
  const F = st.free,
    p = F.pet;
  if (!p) {
    // i randagi: dal terzo giorno nella Valle, finché non ne adotti uno
    if (!F.randagi && st.day - F.start >= 2) {
      F.randagi = st.day;
      UI.toast('Davanti a casa ci sono due randagi infreddoliti: un cucciolo e un gattino.');
    }
    return;
  }
  // mangia dalla ciotola, se c'è qualcosa; senza coccole e senza cibo l'affetto cala
  if (p.ciotola > 0) {
    p.ciotola--;
    p.fame = 0;
  } else p.fame = Math.min(100, (p.fame || 0) + 40);
  p.love = clamp(p.love + (p.coccole ? 0 : -1) + (p.fame >= COMP_FAME ? -1 : 0), 0, 20);
  p.coccole = p.gioco = p.pappa = false;
  if (G.comp) G.comp.map = null;
});

// ---------- disegno ----------
function compDisegna(kind, skin, x, y, dir, fr, extra) {
  const im = compImg(kind, skin)[fr],
    w = iw(im),
    h = ih(im),
    X = Math.round(x),
    Y = Math.round(y);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(X, Y, w * 0.32, 1.4, 0, 0, 7);
  ctx.fill();
  if (dir < 0) {
    ctx.save();
    ctx.translate(X, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, Y - h, w, h);
    ctx.restore();
  } else ctx.drawImage(im, X - w / 2, Y - h, w, h);
  if (extra) extra(X, Y - h);
}
// i due randagi davanti alla porta di casa
const RANDAGI = [
  ['cane', 0, 8.6, 10.7, 1],
  ['gatto', 3, 10.6, 10.7, -1]
];
const randagiQui = () => {
  const st = G.st;
  return isFree(st) && !G.visit && G.map && G.map.id === 'main' && st.free.randagi && !st.free.pet;
};
Ext.on('listaMondo', (list, m) => {
  if (randagiQui())
    for (const [kind, skin, x, y, dir] of RANDAGI)
      list.push({
        sy: y * 16,
        draw: () =>
          compDisegna(kind, skin, x * 16, y * 16, dir, Math.floor(G.t * 1.2) % 3 === 0 ? 3 : 2, (X, Y) => {
            if (Math.floor(G.t * 2) % 2) {
              ctx.fillStyle = '#f6d98a';
              ctx.fillRect(X - 1, Y - 6, 2, 4);
            }
          })
      });
  const p = compPet(),
    c = G.comp;
  if (!p || !c || c.map !== m.id) return;
  list.push({
    sy: c.y,
    draw: () => {
      const fr = c.st === 'move' ? Math.floor(c.f) % 2 : c.st === 'sleep' ? 3 : 2,
        hop = c.salto && G.t - c.salto < 0.32 ? Math.sin(((G.t - c.salto) / 0.32) * Math.PI) * 3 : 0;
      compDisegna(p.kind, p.skin, c.x, c.y - hop, c.dir, fr, (X, Y) => {
        if (c.st === 'sleep' && Math.floor(G.t * 1.5) % 3 === 0) {
          ctx.fillStyle = '#fff';
          ctx.font = '8px "Pixelify Sans",monospace';
          ctx.fillText('z', X + 4, Y - 2);
        } else if (p.fame >= COMP_FAME) {
          ctx.fillStyle = '#2b1a10';
          ctx.fillRect(X - 2, Y - 9, 5, 8);
          ctx.fillStyle = '#ffb040';
          ctx.fillRect(X - 1, Y - 8, 3, 4);
          ctx.fillRect(X - 1, Y - 3, 3, 1);
        }
      });
    }
  });
});
// toccare: il compagno (o i randagi) entrano nella scelta di chi hai davanti
Ext.on('mira', (C, ax, ay, m) => {
  if (randagiQui())
    for (const [kind, , x, y] of RANDAGI) {
      const d = Math.hypot(x * 16 - ax, y * 16 - ay);
      if (d < 18)
        C.push({
          k: 'ext',
          d: d - 2,
          act: () => compAdotta(kind),
          fumetto: () => ({ x: x * 16, y: y * 16 - 18, t: kind === 'cane' ? 'Il cucciolo' : 'Il gattino' })
        });
    }
  const p = compPet(),
    c = G.comp;
  if (!p || !c || c.map !== m.id) return;
  const d = Math.hypot(c.x - ax, c.y - ay);
  if (d < 18)
    C.push({
      k: 'ext',
      d: d - 2,
      act: compMenu,
      fumetto: () => ({ x: c.x, y: c.y - 18, t: p.coccole ? p.name + ' ♥' : 'Coccola ' + p.name })
    });
});

// ---------- l'adozione ----------
function compAdotta(kind) {
  const st = G.st,
    S = { kind, skin: 0, name: COMP_KIND[kind].nomi[0] };
  const anteprima = (k, s) => {
    const [c, x] = mk(36, 30);
    x.imageSmoothingEnabled = false;
    const im = compImg(k, s)[2];
    x.drawImage(im, (36 - im.width) / 2, 30 - im.height);
    return c.toDataURL();
  };
  const disegna = () => {
    const K = COMP_KIND[S.kind];
    UI.open(
      `<button class="btn mclose" data-close>✕</button><h2>Due randagi</h2>` +
        `<p>Davanti alla porta, al riparo dal vento, un cucciolo e un gattino. Ti guardano tutti e due. Uno può restare con te.</p>` +
        `<div class="tabs">${['cane', 'gatto'].map(k => `<button class="btn${S.kind === k ? ' on' : ''}" data-k="${k}">${COMP_KIND[k].n}</button>`).join('')}</div>` +
        `<h3>Com'è</h3><div class="tabs">${K.skin
          .map(
            (s, i) =>
              `<button class="btn${S.skin === i ? ' on' : ''}" data-s="${i}" title="${esc(s.n)}"><img src="${anteprima(S.kind, i)}" style="width:calc(36*var(--u));height:calc(30*var(--u));image-rendering:pixelated;display:block"><span class="small">${esc(s.n)}</span></button>`
          )
          .join('')}</div>` +
        `<h3>Come si chiama</h3><p><input id="compNome" maxlength="14" value="${esc(S.name)}" style="font:inherit;width:60%"></p>` +
        `<p><button class="btn" data-ok="1">Portalo a casa</button></p>`
    );
    const box = $('#mbox');
    box.querySelectorAll('[data-k]').forEach(
      b =>
        (b.onclick = () => {
          if (S.kind !== b.dataset.k) {
            S.kind = b.dataset.k;
            S.skin = 0;
            S.name = COMP_KIND[S.kind].nomi[0];
          }
          UI._mclose = null;
          disegna();
        })
    );
    box.querySelectorAll('[data-s]').forEach(
      b =>
        (b.onclick = () => {
          S.skin = +b.dataset.s;
          S.name = $('#compNome').value || S.name;
          UI._mclose = null;
          disegna();
        })
    );
    box.querySelector('[data-ok]').onclick = () => {
      const nome = ($('#compNome').value || '').trim().slice(0, 14) || COMP_KIND[S.kind].nomi[0];
      st.free.pet = {
        kind: S.kind,
        skin: S.skin,
        name: nome,
        love: 6,
        fame: 0,
        modo: 'segui',
        ciotola: 0,
        d: st.day,
        coccole: true
      };
      UI.close();
      AU.play(COMP_KIND[S.kind].verso);
      UI.toast(
        `${nome} è tuo. ${S.kind === 'cane' ? 'Il gattino' : 'Il cucciolo'} lo prende Agatha: dice che starà benissimo.`
      );
      // un po' di crocchette per cominciare
      riponi('crocchette', 3);
      G.comp = null;
      NET.save(st);
    };
  };
  disegna();
}

// ---------- la sua schermata: stato, comandi, cure, bottega ----------
function compHaGioco(p) {
  const st = compCasa(),
    g = COMP_KIND[p.kind].giochi;
  return (
    g.find(id => countItem(id) > 0) ||
    g.find(id => Object.values(st.free.inside || {}).some(f => f && f.id === id)) ||
    null
  );
}
function compMenu() {
  const p = compPet();
  if (!p) return;
  const st = G.st,
    K = COMP_KIND[p.kind],
    c = G.comp,
    cr = countItem('crocchette'),
    gioco = compHaGioco(p),
    fame = p.fame >= COMP_FAME ? '<b>Ha fame!</b>' : p.fame >= 30 ? 'Ha un po’ di fame.' : 'È sazio.';
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>${esc(p.name)}</h2>` +
      `<div class="mrow"><canvas data-c="1" width="36" height="30" style="width:calc(36*var(--u));height:calc(30*var(--u))"></canvas><span><b>${K.n}</b> · ${esc(K.skin[p.skin].n)} <span class="hearts">${'♥'.repeat(compCuori(p))}${'♡'.repeat(5 - compCuori(p))}</span><br><span class="small">${fame} Nella ciotola: ${p.ciotola || 0} · ${p.coccole ? 'Coccolato oggi.' : 'Oggi non l’hai ancora coccolato.'}${p.portati ? ` · Ti ha portato ${p.portati} cose.` : ''}</span></span></div>` +
      `<div class="tabs"><button class="btn${p.modo === 'segui' ? ' on' : ''}" data-m="segui">Segui</button><button class="btn${p.modo === 'resta' ? ' on' : ''}" data-m="resta">Resta</button></div>` +
      `<p class="small">${p.modo === 'segui' ? 'Ti segue ovunque e ti porta quello che trova per terra. Se sei sfinito, una volta al giorno ti tira su.' : 'Fa la sua vita: di giorno gira attorno a casa, caccia, gioca e si sdraia al sole; all’alba e a mezzogiorno mangia e beve in casa, la notte dorme nella cuccia. Quando passi ti corre incontro e ti fa le feste, poi torna alle sue cose.'}</p>` +
      `<p><button class="btn" data-a="coccole" ${p.coccole ? 'disabled' : ''}>Coccole</button> <button class="btn" data-a="pappa" ${cr ? '' : 'disabled'}>Dai crocchette (${cr})</button> <button class="btn" data-a="gioco" ${gioco ? '' : 'disabled'}>${gioco ? (p.kind === 'cane' ? 'Lancia ' : 'Fai giocare con ') + esc(ITEMS[gioco].n.toLowerCase()) : 'Gioca (serve un gioco)'}</button></p>` +
      `<h3>La bottega</h3>` +
      COMP_SHOP.filter(
        ([id]) => !['pallina', 'osso', 'topolino', 'gomitolo'].includes(id) || K.giochi.includes(id)
      )
        .map(
          ([id, pr]) =>
            `<div class="mrow"><canvas data-i="${id}" width="32" height="32"></canvas><span><b>${esc(ITEMS[id].n)}</b><br><span class="small">${esc(ITEMS[id].d)}</span></span><button class="btn" data-b="${id}" ${st.money >= pr ? '' : 'disabled'}>${CZ(pr)}</button></div>`
        )
        .join('') +
      `<p class="small">Ciotola, cuccia e giochi si mettono in casa, come gli altri mobili.</p>`
  );
  const box = $('#mbox');
  {
    const x = box.querySelector('canvas[data-c]').getContext('2d'),
      im = compImg(p.kind, p.skin)[2];
    x.imageSmoothingEnabled = false;
    x.drawImage(im, (36 - im.width) / 2, 30 - im.height);
  }
  box.querySelectorAll('canvas[data-i]').forEach(cv => {
    if (ICON[cv.dataset.i]) cv.getContext('2d').drawImage(ICON[cv.dataset.i], 0, 0);
  });
  const ancora = () => {
    UI._mclose = null;
    const y = box.scrollTop;
    compMenu();
    box.scrollTop = y;
  };
  const cuore = () => c && floatText('♥', c.x, c.y - 18, '#ff7a6a');
  box.querySelectorAll('[data-m]').forEach(
    b =>
      (b.onclick = () => {
        p.modo = b.dataset.m;
        if (G.comp) G.comp.preda = null;
        AU.play(K.verso);
        UI.toast(p.modo === 'segui' ? `${p.name} ti segue.` : `${p.name} resta a casa.`);
        ancora();
      })
  );
  box.querySelectorAll('[data-a]').forEach(
    b =>
      (b.onclick = () => {
        const a = b.dataset.a;
        if (a === 'coccole' && !p.coccole) {
          p.coccole = true;
          p.love = Math.min(20, p.love + 1);
          AU.play(K.verso);
          cuore();
        }
        if (a === 'pappa' && removeItemOk('crocchette')) {
          p.fame = 0;
          if (!p.pappa) p.love = Math.min(20, p.love + 1);
          p.pappa = true;
          AU.play('pick');
          cuore();
        }
        if (a === 'gioco' && gioco) {
          UI.close();
          compLancia(gioco);
          return;
        }
        ancora();
      })
  );
  box.querySelectorAll('[data-b]').forEach(
    b =>
      (b.onclick = () => {
        const id = b.dataset.b,
          pr = COMP_SHOP.find(x => x[0] === id)[1];
        if (st.money < pr) return;
        st.money -= pr;
        riponi(id, 1);
        AU.play('coin');
        UI.hud();
        ancora();
      })
  );
}
const removeItemOk = id => {
  if (countItem(id) < 1) return false;
  removeItem(id, 1);
  return true;
};
// la ciotola in casa: ci metti le crocchette che hai (fino a 7)
Ext.on('arredo', o => {
  const p = compPet();
  if (o.fid === 'ciotola') {
    if (!p) {
      UI.toast('Una ciotola vuota. Aspetta qualcuno.');
      return true;
    }
    const n = Math.min(countItem('crocchette'), 7 - (p.ciotola || 0));
    if (n > 0) {
      removeItem('crocchette', n);
      p.ciotola = (p.ciotola || 0) + n;
      AU.play('pick');
      UI.toast(`Ciotola di ${p.name}: ${p.ciotola} porzioni. Mangia da solo ogni mattina.`);
    } else
      UI.toast(
        `Ciotola di ${p.name}: ${p.ciotola || 0} porzioni${p.ciotola >= 7 ? ' (è piena)' : '. Ti servono crocchette'}.`
      );
    return true;
  }
  if (o.fid === 'cuccia') {
    UI.toast(p ? `La cuccia di ${p.name}.` : 'Una cuccia vuota.');
    return true;
  }
  return false;
});
