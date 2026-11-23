'use strict';
// ================= IL COMPAGNO (cane o gatto) =================
// Nella Valle, dal terzo giorno, davanti a casa compaiono due randagi: un cucciolo e un gattino. Ne scegli uno,
// gli dai un nome e l'aspetto. Vive con te: lo coccoli, gli dai le crocchette (in mano o nella ciotola di casa),
// ci giochi. Due comandi:
//   Segui  → ti accompagna ovunque (anche in casa e dagli amici), ti porta i rami, i sassi e le erbe che trova
//            e, se sei sfinito, una volta al giorno ti tira su;
//   Resta  → di giorno gira attorno a casa, la notte dorme nella cuccia; quando sei vicino ti fa le feste e,
//            se ha fame, ti chiama.
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
  cuccia: { n: 'Cuccia', t: 'arredo', d: 'Un posto tutto suo dove dormire, in casa.' },
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
// fotogrammi: 0-1 cammina, 2 seduto, 3 dorme (raggomitolato). Fatti la prima volta che servono.
const COMP_IMG = {};
function compImg(kind, skin) {
  const k = kind + skin;
  if (COMP_IMG[k]) return COMP_IMG[k];
  const S = COMP_KIND[kind].skin[skin] || COMP_KIND[kind].skin[0],
    c = rp(S.b),
    m = rp(S.m),
    sc = rp(shade(S.b, -0.35));
  const macchie = (P, L) => {
    if (S.macchie) for (const [x, y, r] of L) P.ellipse(x, y, r, r * 0.8, m, { edge: false });
  };
  const righe = (P, L) => {
    if (S.righe) for (const [x, y] of L) P.capsule(x, y, x + 1, y + 3, 0.5, sc, { edge: false });
  };
  if (kind === 'cane')
    COMP_IMG[k] = critFrames(32, 26, 4, (P, f) => {
      if (f === 3) {
        P.ellipse(15, 19, 11, 5.5, c, { spec: 0.3 });
        P.capsule(5, 20, 12, 23, 1.6, c);
        P.ellipse(24, 18, 5, 4, c);
        P.ellipse(28, 19.5, 2.4, 1.8, m, { edge: false });
        P.ellipse(22, 15.5, 2, 3, sc, { edge: false });
        P.set(25, 17, C('#14100c'));
        P.set(26, 17, C('#14100c'));
        macchie(P, [
          [12, 17, 3],
          [18, 21, 2]
        ]);
        return;
      }
      if (f === 2) {
        P.capsule(7, 22, 3, 17, 1.4, c, { r2: 1 });
        P.ellipse(14, 17, 6.5, 7, c, { spec: 0.3 });
        P.capsule(17, 18, 17, 24, 1.5, c);
        P.capsule(13, 20, 12, 24, 1.5, c);
        P.ellipse(18, 9, 5.2, 4.8, c, { spec: 0.2 });
        P.ellipse(22, 11, 2.6, 2.1, m, { edge: false });
        P.ellipse(15, 7, 2, 3.6, sc, { edge: false });
        P.set(19, 8, C('#14100c'));
        P.set(24, 10, C('#14100c'));
        macchie(P, [
          [12, 15, 2.6],
          [16, 21, 1.8]
        ]);
        return;
      }
      const st = f ? 1.6 : -1.6;
      P.capsule(6, 12, 3, 7 + (f ? 1 : 0), 1.3, c, { r2: 1 });
      for (const q of [0, 1]) P.capsule(10 + q * 10, 18, 10 + q * 10 + (q ? st : -st), 24, 1.5, c);
      P.ellipse(15, 15, 9.5, 5, c, { spec: 0.3 });
      P.ellipse(16, 18, 6, 2, m, { edge: false });
      P.ellipse(25, 10, 5, 4.4, c, { spec: 0.2 });
      P.ellipse(29, 12, 2.6, 2, m, { edge: false });
      P.ellipse(22.5, 8, 2, 3.6, sc, { edge: false });
      P.set(26, 9, C('#14100c'));
      P.set(31, 11, C('#14100c'));
      macchie(P, [
        [11, 13, 3],
        [18, 14, 2.2]
      ]);
    });
  else
    COMP_IMG[k] = critFrames(30, 22, 4, (P, f) => {
      if (f === 3) {
        P.ellipse(15, 16, 10, 5, c, { spec: 0.3 });
        P.ellipse(23, 15, 4, 3.5, c);
        P.set(25, 12, c[2]);
        P.set(22, 12, c[2]);
        P.capsule(6, 18, 14, 20, 1.3, c);
        righe(P, [
          [11, 12],
          [15, 12],
          [19, 13]
        ]);
        macchie(P, [[13, 15, 2.6]]);
        return;
      }
      if (f === 2) {
        P.capsule(6, 20, 4, 12, 1.4, c, { r2: 1 });
        P.ellipse(13, 15, 5.5, 6, c, { spec: 0.3 });
        P.ellipse(14, 17, 3, 3, m, { edge: false });
        P.capsule(15, 17, 15, 21, 1.2, c);
        P.ellipse(16, 8, 4, 3.6, c);
        P.ellipse(13.5, 4.6, 1.2, 1.8, c);
        P.ellipse(18.5, 4.6, 1.2, 1.8, c);
        P.set(15, 8, C('#7ac040'));
        P.set(18, 8, C('#7ac040'));
        righe(P, [
          [10, 12],
          [14, 11]
        ]);
        macchie(P, [[11, 15, 2.2]]);
        return;
      }
      const st = f ? 1.5 : -1.5;
      P.capsule(3, 10, 6, 14, 1.2, c, { r2: 1.4 });
      for (const q of [0, 1]) P.capsule(9 + q * 9, 16, 9 + q * 9 + (q ? st : -st), 21, 1.2, c);
      P.ellipse(14, 14, 9, 4.5, c, { spec: 0.3 });
      P.ellipse(15, 16.5, 5, 1.6, m, { edge: false });
      P.ellipse(24, 10, 4, 3.6, c);
      P.ellipse(22, 6.5, 1.2, 1.8, c);
      P.ellipse(26, 6.5, 1.2, 1.8, c);
      P.set(26, 10, C('#7ac040'));
      P.set(27, 11, C('#e89090'));
      righe(P, [
        [10, 10],
        [14, 10],
        [18, 10]
      ]);
      macchie(P, [
        [11, 13, 2.6],
        [18, 14, 2]
      ]);
    });
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
  if (o) return [o.tx * 16 + 8, o.ty * 16 + 14];
  for (let r = 0; r < 6; r++)
    for (let y = (m.h >> 1) - r; y <= (m.h >> 1) + r; y++)
      for (let x = (m.w >> 1) - r; x <= (m.w >> 1) + r; x++)
        if (!m.solid(x, y) && !m.objAt(x, y)) return [x * 16 + 8, y * 16 + 12];
  return [m.w * 8, m.h * 8];
}
// la mappa dove deve stare adesso (null: non è qui, è a casa mentre sei in visita)
function compMappa(p) {
  if (p.modo === 'segui') return G.map.id;
  if (G.visit) return null;
  return compNotte() ? 'house' : 'main';
}
function compPiazza(c, p) {
  const m = G.maps[c.map];
  if (p.modo === 'segui') {
    const [dx, dy] = DIRV[G.player.dir];
    c.x = G.player.x - dx * 14;
    c.y = G.player.y - dy * 10 + 2;
  } else if (c.map === 'house') [c.x, c.y] = compCuccia(m);
  else {
    const [x, y] = COMP_GIRO[0];
    c.x = x * 16 + 8;
    c.y = y * 16 + 12;
  }
  c.st = 'idle';
  c.t = 1;
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
    c.map = dove;
    compPiazza(c, p);
  }
  if (c.map !== G.map.id) return;
  const pl = G.player,
    dP = Math.hypot(pl.x - c.x, pl.y - c.y);
  c.t -= dt;
  c.cuore -= dt;
  c.chiama -= dt;
  let tx = null,
    ty = null,
    vel = 46;
  if (p.modo === 'segui') {
    if (dP > 220) compPiazza(c, p);
    // ti porta quello che trova per terra
    c.aiuto -= dt;
    if (!c.preda && c.aiuto <= 0) {
      c.aiuto = 18 + Math.random() * 12;
      c.preda = compCercaPreda(c);
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
    if (tx == null && dP > 26) {
      tx = pl.x;
      ty = pl.y;
      vel = dP > 60 ? 90 : 62;
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
  } else if (c.map === 'house') {
    // la notte dorme nella cuccia
    const [x, y] = compCuccia(G.map);
    if (Math.hypot(x - c.x, y - c.y) > 3) {
      tx = x;
      ty = y;
      vel = 30;
    } else c.st = 'sleep';
  } else {
    // resta: gira davanti a casa; se arrivi ti viene incontro
    if (dP < 56) {
      if (dP > 18) {
        tx = pl.x;
        ty = pl.y;
        vel = 60;
      }
      if (c.cuore <= 0) {
        c.cuore = 14 + Math.random() * 10;
        floatText('♥', c.x, c.y - 18, '#ff8a8a', 0.8);
      }
    } else if (c.st === 'move' && c.dest) [tx, ty] = c.dest;
    else if (c.t <= 0) {
      const [x, y] = COMP_GIRO[Math.floor(Math.random() * COMP_GIRO.length)];
      c.dest = [x * 16 + 8, y * 16 + 12];
      c.t = 4 + Math.random() * 6;
      [tx, ty] = c.dest;
    }
  }
  // ha fame: ti chiama quando sei vicino
  if (p.fame >= COMP_FAME && dP < 90 && c.chiama <= 0) {
    c.chiama = 40;
    AU.play(COMP_KIND[p.kind].verso);
    UI.toast(`${p.name} ha fame e ti chiama.`);
  }
  if (tx != null) {
    const dx = tx - c.x,
      dy = ty - c.y,
      d = Math.hypot(dx, dy);
    if (d > 2) {
      c.x += (dx / d) * Math.min(d, vel * dt);
      c.y += (dy / d) * Math.min(d, vel * dt);
      if (Math.abs(dx) > 1) c.dir = dx < 0 ? -1 : 1;
      c.f += dt * 6;
      c.st = 'move';
      return;
    }
    c.dest = null;
  }
  if (c.st !== 'sleep' || c.map !== 'house' || p.modo === 'segui') c.st = 'sit';
}
// rami, sassi, erbacce ed erbe spontanee vicino: il compagno li va a prendere
function compCercaPreda(c) {
  if (G.map.id !== 'main' || G.visit) return null;
  let best = null,
    bd = 6 * 16;
  for (const o of G.map.objs) {
    if (o.kind !== 'debris' || !o.dt) continue;
    if (!(o.dt === 'ramo' || o.dt === 'sasso' || o.dt === 'erbaccia' || o.dt.startsWith('w_'))) continue;
    const d = Math.hypot(o.tx * 16 + 8 - c.x, o.ty * 16 + 12 - c.y);
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
      const fr = c.st === 'move' ? Math.floor(c.f) % 2 : c.st === 'sleep' ? 3 : 2;
      compDisegna(p.kind, p.skin, c.x, c.y, c.dir, fr, (X, Y) => {
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
      `<p class="small">${p.modo === 'segui' ? 'Ti segue ovunque e ti porta quello che trova per terra. Se sei sfinito, una volta al giorno ti tira su.' : 'Resta a casa: di giorno gira qui davanti, la notte dorme nella cuccia. Quando passi ti fa le feste.'}</p>` +
      `<p><button class="btn" data-a="coccole" ${p.coccole ? 'disabled' : ''}>Coccole</button> <button class="btn" data-a="pappa" ${cr ? '' : 'disabled'}>Dai crocchette (${cr})</button> <button class="btn" data-a="gioco" ${gioco && !p.gioco ? '' : 'disabled'}>Gioca${gioco ? ' con ' + esc(ITEMS[gioco].n.toLowerCase()) : ''}</button></p>` +
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
        if (a === 'gioco' && gioco && !p.gioco) {
          p.gioco = true;
          p.love = Math.min(20, p.love + 1);
          AU.play(K.verso);
          cuore();
          UI.toast(
            `${p.name} corre dietro ${ITEMS[gioco].n.toLowerCase().startsWith('osso') ? "all'osso" : 'al gioco'} come un matto.`
          );
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
