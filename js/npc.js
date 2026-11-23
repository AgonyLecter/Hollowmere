'use strict';
// ================= NPC: ORARI E ROUTINE =================
// Ogni abitante esce dalla porta di casa, cammina fino al suo posto, lì lavora o gironzola, e la sera torna a casa.
const HOMES = {
  ezekiel: 'elder',
  agatha: 'store',
  lucius: 'chapel',
  clara: 'cottage',
  brom: 'forge',
  tobia: 'varco'
};
function homeDoor(id) {
  const k = HOMES[id];
  // i nuovi abitanti della Valle rientrano nella loro casetta, non oltre il ponte
  if (k === 'ponte' && typeof resOf === 'function' && isFree()) {
    const r = resOf(id),
      d = r && resDoor(r);
    if (d) return d;
  }
  return k === 'varco' ? [30, 3] : k === 'ponte' ? [44, 46] : bdoor(k);
}
const at = (x, y, d = 0, act = '', wr = 0, o = {}) => Object.assign({ m: 'main', x, y, d, act, wr }, o);
const cyc = (t, t0, len, P) => P[((Math.floor((t - t0) / len) % P.length) + P.length) % P.length];
const SCHED = {
  ezekiel(st) {
    const t = st.time,
      F = st.flags;
    if (st.day < 1 || F.finaleChase) return null;
    if (F.ezWait && t < 20 * 60) return at(10, 12, 3, '', 0, { snap: 1 });
    if (t < 390) return null;
    if (t < 540) {
      const p = cyc(t, 390, 38, [
        [52, 33],
        [46, 30],
        [44, 22],
        [38, 20]
      ]);
      return at(p[0], p[1], 0, 'walk');
    }
    if (t < 720) return at(44, 21, 0, 'watch', 1);
    if (t < 780) return null;
    if (t < 1020) return at(42, 15, 0, 'watch', 1);
    if (t < 1060) return at(53, 8, 3, 'pray');
    if (t < 1200) {
      const p = cyc(t, 1060, 34, [
        [26, 20],
        [14, 20],
        [30, 12],
        [38, 27],
        [52, 33]
      ]);
      return at(p[0], p[1], 0, 'walk');
    }
    return null;
  },
  agatha(st) {
    const t = st.time;
    if (st.day < 1 || st.flags.finaleChase) return null;
    if ((t >= 450 && t < 750) || (t >= 810 && t < 1080)) return at(49, 20, 0, 'stall');
    if (t >= 1080 && t < 1140) return at(37, 30, 1, 'chat');
    if (t >= 1140 && t < 1200) return at(47, 20, 0, 'idle', 1);
    return null;
  },
  lucius(st) {
    const t = st.time;
    if (st.day < 1 || st.flags.finaleChase) return null;
    if (t >= 360 && t < 480) {
      if (t >= 362 && t < LAMPT.mEnd) {
        const r = lampSeg(LAMPT.mor, 'm', t);
        if (r) return r;
      }
      return at(52, 9, 0, 'tend', 2);
    }
    if (t >= 480 && t < 720) return at(43, 14, 0, 'sweep', 2);
    if (t >= 780 && t < 1010) return at(54, 9, 0, 'tend', 3);
    if (t >= 1010 && t < LAMPT.eEnd) {
      const r = lampSeg(LAMPT.eve, 'e', t);
      if (r) return r;
    }
    if (t >= 1010 && t < 1260) return at(43, 13, 0, 'watch', 1);
    return null;
  },
  clara(st) {
    const t = st.time;
    if (st.day < 1 || st.flags.finaleChase) return null;
    if (t >= 420 && t < 480) return at(48, 19, 0, 'deliver');
    if (t >= 480 && t < 660) return at(46, 19, 2, 'idle', 1);
    if (t >= 720 && t < 900) return at(26, 21, 0, 'flowers', 3);
    if (t >= 900 && t < 1020) return at(46, 17, 3, 'idle');
    if (t >= 1020 && t < 1170) return at(36, 30, 2, 'idle', 1);
    return null;
  },
  brom(st) {
    const t = st.time;
    if (st.day < 1 || st.flags.finaleChase) return null;
    if ((t >= 420 && t < 720) || (t >= 780 && t < 990)) return at(36, 14, 2, 'forge');
    if (t >= 720 && t < 780) return at(47, 22, 0, 'idle', 1);
    if (t >= 990 && t < 1020) return at(58, 31, 3, 'deliver');
    if (t >= 1020 && t < 1140) return at(36, 14, 2, 'forge');
    if (t >= 1140 && t < 1200) return at(46, 40, 0, 'idle', 1);
    return null;
  },
  tobia(st) {
    const t = st.time,
      F = st.flags;
    if (st.day < 1 || F.finaleChase) return null;
    if (st.day === 1 && t >= 1200 && t < 1410) return at(31, 5, 3);
    if (F.ch1end && !F.tobiaTalk && t >= 540 && t < 1020) return at(32, 7, 3, 'play', 2);
    if (t >= 840 && t < 960) return at(55, 35, 0, 'play', 3, { run: 1 });
    if (t >= 480 && t < 1200) {
      const p = cyc(t, st.day * 90, 70, [
        [23, 16],
        [29, 6],
        [54, 11],
        [40, 24],
        [23, 30],
        [16, 35]
      ]);
      return at(p[0], p[1], 0, 'play', 3, { run: 1 });
    }
    return null;
  },
  faceless() {
    return null;
  }
};
const BARKS = {
  ezekiel: ['Buona giornata, {n}.', 'Le Regole, {n}.', 'Tutto in ordine?'],
  agatha: ['Semi freschi!', 'Ciao, tesoro!', 'Prezzi onesti!'],
  lucius: ['Il giallo ti protegga.', 'Sette… otto…', 'Pace, {figliolo|figliola}.'],
  clara: ['Ciao {n}!', 'Che bella giornata!', '♪ ♪'],
  brom: ['Mh.', '…', 'Lavoro.'],
  tobia: ['Hihi!', 'Una, due, tante!', 'Ti ho vist{o|a}!']
};
const BARKS2 = {
  ezekiel: ['Ti stiamo guardando, {n}.', 'Zucche. Tante zucche.'],
  agatha: ['Pianta, tesoro. Pianta.'],
  lucius: ['Otto.', 'Non girarti.'],
  clara: ['Stai attent{o|a}…'],
  brom: ['Torna a casa presto.'],
  tobia: ['Hihi. Rosso!', 'Conta, conta!']
};
// fumetto sopra un personaggio. opt.w = bisbiglio (grigio, tratteggiato). Le frasi lunghe restano più a lungo.
function bubbleBase(n, t, life = 2.6, opt = {}) {
  const txt = fmt(t);
  life = Math.max(life, Math.min(7, 1.6 + txt.length / 16));
  G.bubbles = G.bubbles.filter(b => b.n !== n);
  G.bubbles.push({ n, t: txt, life, max: life, w: !!opt.w });
}

// catena: altri file la avvolgono con Ext.avvolgi('bubble', …)
function bubble(...a) {
  return Ext.catena('bubble', bubbleBase, this, a);
}

function npcGo(n, tx, ty) {
  const m = G.maps[n.map];
  const [sx, sy] = ptile(n);
  const p = bfs(m, sx, sy, tx, ty);
  if (p) n.path = p;
  else {
    setPos(n, tx, ty);
    n.path = [];
  }
}
const IMAP = { chapel: 'chapel', house: 'house', barn: 'barn' };
function npcExitTo(n) {
  const [bx, by] = bdoor(IMAP[n.map] || 'chapel');
  n.map = 'main';
  setPos(n, bx, by);
  n.path = [];
  n.goal = null;
}
function updateNPC(n, dt) {
  n.barkT = (n.barkT || 0) - dt;
  if (!n.script) {
    const s = schedOf(n.id),
      idle = !(n.path && n.path.length);
    n.act = s ? s.act : '';
    if (s && s.in) {
      n.lastIn = s.in; // dentro un edificio (messa): il giocatore li vede solo se entra
      if (G.map.id === s.in) {
        if (n.map !== s.in || n.hidden) {
          const [sx, sy, sd] = s.seat || [7, 6, 0];
          placeNPC(n, s.in, sx, sy, sd);
          n.goal = 'in';
        }
        n.path = [];
        n.moving = false;
        return;
      }
      if (n.map !== 'main') {
        n.map = 'main';
        n.hidden = true;
        n.goal = null;
        n.path = [];
      }
      if (!n.hidden) {
        const [dx, dy] = bdoor(s.in);
        if (n.goal !== 'enter') {
          n.goal = 'enter';
          n.speed = 36;
          n.fdir = null;
          npcGo(n, dx, dy);
        } else if (idle) {
          n.hidden = true;
          n.goal = null;
          n.path = [];
          if (G.map.id === 'main' && Math.hypot(n.x - G.player.x, n.y - G.player.y) < 160) AU.play('door');
        }
      }
    } else if (!n.hidden && n.map !== 'main') {
      const im = G.maps[n.map],
        d = im && im.doors[0];
      if (!d || G.map.id !== n.map) npcExitTo(n);
      else if (n.goal !== 'exit') {
        n.goal = 'exit';
        npcGo(n, d.tx, d.ty);
      } else if (idle) npcExitTo(n);
    } else if (!s) {
      if (!n.hidden) {
        if (n.goal !== 'home') {
          n.goal = 'home';
          const [hx, hy] = homeDoor(n.id);
          npcGo(n, hx, hy);
          n.fdir = null;
          n.speed = 34;
        } else if (idle) {
          n.hidden = true;
          n.goal = null;
          if (G.map.id === 'main' && Math.hypot(n.x - G.player.x, n.y - G.player.y) < 160) AU.play('door');
        }
      }
    } else {
      const [gx, gy] = freeNear(G.maps.main, s.x, s.y);
      if (n.hidden) {
        if (s.snap) placeNPC(n, 'main', gx, gy, s.d);
        else {
          const [hx, hy] = n.lastIn ? bdoor(n.lastIn) : homeDoor(n.id);
          n.lastIn = null;
          placeNPC(n, 'main', hx, hy, 0);
          if (G.map.id === 'main' && Math.hypot(n.x - G.player.x, n.y - G.player.y) < 160) AU.play('door');
        }
        n.path = [];
        n.goal = null;
      }
      const key = gx + ',' + gy;
      n.speed = s.sp || (s.run ? 52 : s.act === 'walk' ? 30 : 36);
      if (n.goal !== key) {
        n.goal = key;
        n.home = [gx, gy];
        n.fdir = s.d;
        n.idleT = 1 + Math.random() * 2;
        if (s.snap && Math.hypot(n.x - gx * 16 - 8, n.y - gy * 16 - 14) > 200) {
          setPos(n, gx, gy);
          n.path = [];
        } else npcGo(n, gx, gy);
      } else if (!(n.path && n.path.length)) npcIdle(n, s, dt);
    }
  }
  if (n.path && n.path.length) {
    const [px, py] = n.path[0],
      gx = px * 16 + 8,
      gy = py * 16 + 14,
      dx = gx - n.x,
      dy = gy - n.y,
      d = Math.hypot(dx, dy),
      sp = n.speed * dt;
    if (d <= sp) {
      n.x = gx;
      n.y = gy;
      n.path.shift();
      if (!n.path.length) {
        if (n.fdir != null) n.dir = n.fdir;
        if (n.res) {
          const r = n.res;
          n.res = null;
          r();
        }
      }
    } else {
      n.x += (dx / d) * sp;
      n.y += (dy / d) * sp;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
      n.stepAcc = (n.stepAcc || 0) + sp;
      if (n.stepAcc > 8 && n.map === G.map.id) {
        n.stepAcc = 0;
        addPrint(n);
      }
    }
    n.anim += dt * (n.speed > 45 ? 10 : 7);
    n.moving = true;
    if (n.id === 'tobia' && G.st.weather === 'pioggia' && n.map === G.map.id && Math.random() < dt * 6)
      burst('water', n.x, n.y - 1, 3);
  } else n.moving = false;
}
function npcIdle(n, s, dt) {
  n.idleT = (n.idleT || 0) - dt;
  const dist = G.map.id === 'main' ? Math.hypot(n.x - G.player.x, n.y - G.player.y) : 1e9;
  if (s.act === 'forge') {
    n.workT = (n.workT || 0) - dt;
    n.dir = 2;
    if (n.workT <= 0) {
      n.workT = 0.8;
      burst('spark', 37 * 16 + 7, 14 * 16 - 1, 6, '#ffcf6a');
      if (dist < 240 && AU.c) {
        const v = clamp(1 - dist / 240, 0, 1) * 0.06,
          t = AU.c.currentTime;
        AU.osc('square', 1400 + Math.random() * 300, t, 0.05, v);
        AU.osc('triangle', 2100, t, 0.16, v * 0.7);
      }
    }
    return;
  }
  if (s.act === 'call') {
    n.dir = 0;
    if (n.idleT <= 0) {
      n.idleT = 4 + Math.random() * 3;
      if (dist < 170 && !G.st.flags['mass' + G.st.day]) bubble(n, ACTL.lucius.call[(Math.random() * 3) | 0]);
    }
    return;
  }
  if (s.act === 'light') {
    n.dir = 3;
    if (n.litKey !== s.lk && G.st.time >= s.lt) {
      n.litKey = s.lk;
      burst('spark', s.lx * 16 + 8, s.ly * 16 - 18, 7, '#ffcf6a');
      if (dist < 140) AU.play('ok');
    }
    return;
  }
  if (s.act === 'build') {
    n.workT = (n.workT || 0) - dt;
    n.dir = 2;
    if (n.workT <= 0) {
      n.workT = 0.9;
      burst('dust', 44 * 16, 17 * 16 + 8, 3);
      if (dist < 240 && AU.c) {
        const v = clamp(1 - dist / 240, 0, 1) * 0.07,
          t = AU.c.currentTime;
        AU.noise(t, 0.05, 0.5 * v, 'lowpass', 420);
        AU.osc('triangle', 180, t, 0.07, v);
      }
    }
    return;
  }
  if (s.act === 'hang') {
    n.dir = 3;
    n.workT = (n.workT || 0) - dt;
    if (n.workT <= 0) {
      n.workT = 1.6;
      burst('spark', n.x, n.y - 26, 3, '#e8c23a');
      if (Math.random() < 0.3) bubble(n, 'Più a destra… no, a sinistra.', 2);
    }
    return;
  }
  if (s.act === 'sweep' && Math.random() < dt * 2.5)
    G.parts.push({
      k: 'puff',
      x: n.x + (n.dir === 1 ? -7 : n.dir === 2 ? 7 : 0),
      y: n.y - 1,
      vx: (Math.random() - 0.5) * 14,
      vy: -5,
      t: 0,
      life: 0.8
    });
  if (s.act === 'stall') {
    n.dir = 0;
    if (n.idleT <= 0) {
      n.idleT = 4 + Math.random() * 4;
      if (dist < 110 && Math.random() < 0.35) {
        const SL = ['Semi freschi!', 'Zucche, rape, patate!', 'Prezzi onesti!'];
        if (G.st.time >= 480 && G.st.bread > 0) SL.push('Pane di Clara, ancora caldo!');
        if (G.st.demand) SL.push('Oggi pago bene le ' + PL[G.st.demand] + '!');
        bubble(n, SL[(Math.random() * SL.length) | 0]);
      }
    }
    return;
  }
  if (n.idleT > 0) return;
  n.idleT = 2 + Math.random() * 4;
  const [hx, hy] = n.home || ptile(n);
  if (s.wr > 0 && Math.random() < 0.65) {
    const m = G.maps.main;
    for (let k = 0; k < 6; k++) {
      const tx = hx + Math.round((Math.random() * 2 - 1) * s.wr),
        ty = hy + Math.round((Math.random() * 2 - 1) * s.wr);
      if (!m.solid(tx, ty)) {
        npcGo(n, tx, ty);
        n.fdir = null;
        return;
      }
    }
  }
  n.dir = Math.random() < 0.5 ? (s.d ?? 0) : [0, 1, 2, 3][(Math.random() * 4) | 0];
  if (s.act === 'flowers' && Math.random() < 0.3) bubble(n, '♪');
  if (s.act === 'play' && Math.random() < 0.2) bubble(n, 'Hihi!', 1.6);
}
function npcBarksBase(dt) {
  if (G.cut || UI.busy() || G.map.id !== 'main') return;
  const p = G.player;
  for (const n of G.npcs) {
    if (n.hidden || n.script || n.map !== 'main' || n.barkT > 0) continue;
    const d = Math.hypot(n.x - p.x, n.y - p.y);
    if (d > 52) continue;
    n.barkT = 35 + Math.random() * 30;
    const L = (
      isFree() && n.act === 'visit'
        ? { [n.id]: [farmComment(n.id)] }
        : isFree()
          ? FREE_BARKS
          : H2() && Math.random() < 0.6
            ? BARKS2
            : BARKS
    )[n.id];
    // il primo incontro del giorno è un saluto; poi frasi al volo, vecchie e nuove mescolate
    let t = null;
    if (n._sal !== G.st.day) {
      t = Dialoghi.battuta(n, 'saluto');
      if (t) n._sal = G.st.day;
    }
    if (!t && (!L || Math.random() < 0.6)) t = Dialoghi.battuta(n, 'passaggio');
    if (!t && L) t = L[(Math.random() * L.length) | 0];
    if (t) bubble(n, t);
  }
  for (const b of G.bubbles) b.life -= dt;
  G.bubbles = G.bubbles.filter(b => b.life > 0);
}

// catena: altri file la avvolgono con Ext.avvolgi('npcBarks', …)
function npcBarks(...a) {
  return Ext.catena('npcBarks', npcBarksBase, this, a);
}

function snapNPCs() {
  for (const n of G.npcs) {
    if (n.script) continue;
    n.goal = null;
    n.lastIn = null;
    const s = schedOf(n.id);
    if (s && s.in) {
      n.lastIn = s.in;
      n.hidden = true;
      n.map = 'main';
      n.path = [];
    } else if (s) {
      const [gx, gy] = freeNear(G.maps.main, s.x, s.y);
      placeNPC(n, 'main', gx, gy, s.d);
      n.goal = gx + ',' + gy;
      n.home = [gx, gy];
      n.path = [];
    } else {
      n.hidden = true;
      n.path = [];
    }
  }
  G.bubbles = [];
}
// ================= DIALOGHI =================
// ================= DIALOGHI CONTESTUALI =================
const LINES = {
  ezekiel: {
    mat: [
      'Mattiniero, {n}. Bene. Chi si alza presto ha meno tempo per pensare.',
      'La rugiada è sacra, a Hollowmere. Non calpestarla per niente.'
    ],
    pom: [
      "Il sole è alto. Le ombre sono corte. È l'ora più sicura del giorno.",
      'Hai mangiato, {n}? Un corpo debole fa pensieri deboli.'
    ],
    sera: [
      'Il sole cala. Ricorda la campana.',
      'Al tramonto le lanterne gialle si accendono da sole. Quasi da sole.'
    ],
    pioggia: [
      'La pioggia lava via tutto. Quasi tutto.',
      'Acqua dal cielo: la Valle beve. Brutto segno, se non beve.'
    ],
    nebbia: ['Nella nebbia non allontanarti dai sentieri. I sentieri sanno dove portano.'],
    farm: [
      'Ho visto i tuoi campi. Ordinati. Tuo nonno sarebbe… sollevato.',
      'Il raccolto è il patto, {n}. Ricordalo.'
    ],
    amico: [
      'Sei una presenza gradita, {n}. Più di quanto immagini.',
      'Ti chiamerò per nome alla Festa. È un onore.'
    ],
    ch2: [
      'Contiamo le zucche, contiamo le teste. Ogni cosa ha il suo numero.',
      'Il vento soffia dal bosco, oggi. Non è mai un buon vento.',
      'Non ascoltare Tobia. Non ascoltare nessuno. Ascolta me.'
    ]
  },
  agatha: {
    mat: [
      'Ho appena aperto, tesoro! I semi migliori vanno via presto.',
      'Clara mi ha portato il pane caldo. Che angelo, quella ragazza.'
    ],
    pom: [
      "Mezzogiorno passato e ancora nessuno ha comprato zucche. Si vede che le coltivano tutti, quest'anno."
    ],
    sera: ['Chiudo il banco tra poco. Le chiacchiere però restano aperte!'],
    pioggia: [
      'Con questa pioggia i semi si piantano da soli, tesoro.',
      'Mi si sono bagnati i nastri della cuffia. Gialli, per fortuna. Il giallo non stinge.'
    ],
    nebbia: ['Nebbia! Mia nonna diceva che nella nebbia passeggiano quelli di prima.'],
    farm: ["Hai venduto bene, ieri? Si sente l'odore dei soldi. E della terra."],
    amico: [
      'Sai che ti voglio bene, tesoro? Un pochino. Il giusto.',
      'Per te ho sempre un seme in più. Non dirlo agli altri.'
    ],
    ch2: [
      'Pianta, tesoro. Pianta tanto. La Festa ha fame.',
      "Hai l'aria stanca. Dormi bene? Io no. Mai, in questa stagione.",
      'Elias comprava sempre zucche. Ora capisco perché.'
    ]
  },
  lucius: {
    mat: [
      'Ho già spazzato due volte. Le foglie cadono soltanto qui, sai?',
      'Le prime ore sono dei morti. Li saluto uno per uno.'
    ],
    pom: ['A mezzogiorno suono la campana. È la voce della cappella.'],
    sera: ['Stasera conterò, come ogni sera. Conto bene. Quasi sempre.'],
    pioggia: ['La pioggia sulle tombe. Musica che solo io sento.'],
    nebbia: ['Nella nebbia, {figliolo|figliola}, le lapidi sembrano persone in fila.'],
    farm: ['Benedico il tuo raccolto. Che serva a ciò a cui è destinato.'],
    amico: ['Pregherò per te per primo, stasera. Prima degli altri.'],
    ch2: [
      'Sette. Otto. Nove? No. Otto.',
      'Hai sentito qualcuno camminare dietro di te, venendo qui? No? Bene. Bene.',
      'Il registro del fienile… no. Niente. Non ho detto niente.'
    ]
  },
  clara: {
    mat: [
      'Buongiorno! Ho fatto il pane, vuoi annusarlo? Solo annusarlo!',
      'Ho contato i fiori stamattina. Sono sempre di più. Non capisco.'
    ],
    pom: [
      'Raccolgo fiori gialli per la cappella. Solo gialli. Gli altri… li lascio.',
      "Mi siedo un po'. Mi piace guardare la gente passare. Passano sempre gli stessi."
    ],
    sera: [
      'Agatha viene a trovarmi, la sera. Parla tanto. Mi fa compagnia.',
      'Tra poco suona la campana. Ti accompagno a casa? Scherzo. Non si può.'
    ],
    pioggia: ['Mi piace la pioggia. Copre i rumori. Anche quelli del bosco.'],
    nebbia: ["La nebbia mi fa paura. Ma solo un po'. Tu mi fai meno paura."],
    farm: ['Le tue rape sono le più belle della Valle! Non dirlo ad Agatha.'],
    amico: [
      'Sei la prima persona nuova da… da tanto. Sono contenta che sei qui.',
      'Un giorno mi porterai a vedere le città con le luci? Promettilo.'
    ],
    ch2: [
      'Non dormo più bene. Sento zoccoli. Anche di giorno.',
      'Ti prego, non fare come gli altri. Non sparire.',
      "Ho trovato un nastro rosso vicino al pozzo. L'ho seppellito subito. Subito!"
    ]
  },
  brom: {
    mat: ['Il ferro si batte caldo. Le parole, fredde.', 'Mh. Buongiorno.'],
    pom: ['Pausa. Mangio. Poi ferro.'],
    sera: ['Consegno al fienile. Poi a casa.', 'Quattro ferri. Sempre quattro.'],
    pioggia: ['Pioggia. Il fuoco della fucina non si spegne. Mai.'],
    nebbia: ["Nebbia. Non vedo l'incudine. Ma la sento."],
    farm: ['Zappa buona? Se si rompe, portala qui.'],
    amico: ['…Sei a posto, tu.', 'Se ti serve qualcosa di ferro, chiedi. Per te, niente soldi.'],
    ch2: [
      'Non chiedermi dei ferri.',
      "Il cavallo non c'è. Ma i ferri si consumano. Spiegamelo tu.",
      'Vai a casa presto. Te lo dico una volta sola.'
    ]
  },
  tobia: {
    mat: ['Hihi! Ho rincorso le galline! Sono più veloci di te!', 'Il gatto nero mi segue. O io seguo lui?'],
    pom: ['Uno, due, tre corvi! Quattro corvi! Hihi!', 'Gioco a nascondino. Con chi? Con quelli. Hihi.'],
    sera: ['Quando suona la campana io vado al Varco. Lì nessuno mi trova.'],
    pioggia: ['Pioggia! Le pozzanghere hanno le facce! Hihi!'],
    nebbia: ["Nella nebbia c'è più gente. Tanta gente. Hihi."],
    farm: ['Hai le mani sporche di terra! Come il nonno! Hihi!'],
    amico: ['Sei mio amico. Gli amici non si contano. Hihi.'],
    ch2: [
      'Rosso, rosso, rosso! Hihi!',
      'Il nonno ha bussato anche da me. Io non ho aperto. Brav{o|a} me.',
      'Lui conta. Tu no. Non ancora. Hihi.'
    ]
  }
};
function pickLine(id, base) {
  const st = G.st,
    L = LINES[id] || {},
    t = st.time,
    pool = [...(base || [])];
  const nn = NPC(id);
  if (nn && nn.act && ACTL[id] && ACTL[id][nn.act]) pool.push(...ACTL[id][nn.act], ...ACTL[id][nn.act]);
  if (id === 'agatha' && st.demand)
    pool.push(
      'Oggi pago bene le ' +
        PL[st.demand] +
        ', tesoro. Per la Festa servono tante zucche, ma anche le altre fanno comodo.'
    );
  const tod = t < 11 * 60 ? 'mat' : t < 17 * 60 ? 'pom' : 'sera';
  pool.push(...(L[tod] || []));
  if (st.weather === 'pioggia' || st.weather === 'nebbia')
    pool.push(...(L[st.weather] || []), ...(L[st.weather] || []));
  if (st.flags.harvested || st.shipped.length) pool.push(...(L.farm || []));
  if (hearts(id) >= 2) pool.push(...(L.amico || []));
  if (H2(st) && !(id === 'ezekiel' && st.flags.ezTruth)) pool.push(...(L.ch2 || []), ...(L.ch2 || []));
  if (st.chapter >= 3) pool.push(...(CH3L[id] || []), ...(CH3L[id] || []));
  if (st.flags.ezTruth) pool.push(...(CH3T[id] || []), ...(CH3T[id] || []));
  if (st.flags.woodDone) pool.push(...(CH3W[id] || []), ...(CH3W[id] || []), ...(CH3W[id] || []));
  if (st.flags.caughtDay === st.day - 1 && CAUGHTL[id]) pool.push(CAUGHTL[id], CAUGHTL[id], CAUGHTL[id]);
  if (st.flags.missedDay === st.day && MISSL[id]) pool.push(MISSL[id], MISSL[id], MISSL[id]);
  st.talkN = st.talkN || {};
  const k = (st.talkN[id] = (st.talkN[id] || 0) + 1);
  return pool[(st.day * 7 + k * 5 + (t >> 6)) % pool.length];
}
// ---------- chiacchierate tra abitanti (fumetti) ----------
const CHATS = [
  [
    'agatha',
    'clara',
    [
      ['agatha', 'Il pane di oggi?'],
      ['clara', "Un po' bruciato. Scusa!"],
      ['agatha', 'Bruciato è buono. Copre il sapore.'],
      ['clara', 'Il sapore di cosa?']
    ]
  ],
  [
    'agatha',
    'clara',
    [
      ['clara', 'Hai venduto molte zucche?'],
      ['agatha', 'Mai abbastanza, cara.'],
      ['clara', 'Per la Festa?'],
      ['agatha', 'Per la Festa.']
    ]
  ],
  [
    'ezekiel',
    'lucius',
    [
      ['ezekiel', 'Quanti, ieri sera?'],
      ['lucius', 'Il numero giusto.'],
      ['ezekiel', 'Bene.']
    ]
  ],
  [
    'ezekiel',
    'agatha',
    [
      ['agatha', 'Il forestiero compra semi.'],
      ['ezekiel', 'Lascialo piantare.'],
      ['agatha', 'Come il vecchio.'],
      ['ezekiel', 'Come il vecchio.']
    ]
  ],
  [
    'brom',
    'agatha',
    [
      ['agatha', 'Brom! Ancora ferri?'],
      ['brom', 'Mh.'],
      ['agatha', 'Per quale cavallo, eh?'],
      ['brom', '…']
    ]
  ],
  [
    'clara',
    'tobia',
    [
      ['tobia', 'Clara! Gioca con me!'],
      ['clara', 'Non vicino al Varco, Tobia.'],
      ['tobia', 'Hihi. Allora sì.']
    ]
  ],
  [
    'lucius',
    'clara',
    [
      ['lucius', "Fiori gialli per l'altare?"],
      ['clara', 'I più belli!'],
      ['lucius', 'Brava. Il giallo ci tiene insieme.']
    ]
  ],
  [
    'ezekiel',
    'brom',
    [
      ['ezekiel', 'I ferri saranno pronti?'],
      ['brom', 'Sempre.'],
      ['ezekiel', 'Quattro.'],
      ['brom', 'Quattro.']
    ]
  ],
  [
    'tobia',
    'lucius',
    [
      ['tobia', 'Contami! Contami!'],
      ['lucius', 'Uno. Vai via.'],
      ['tobia', 'Hihi! Uno!']
    ]
  ]
];
const CHATS2 = [
  [
    'agatha',
    'clara',
    [
      ['clara', 'Hai sentito, stanotte?'],
      ['agatha', 'Io dormo, tesoro. Dormo sempre.'],
      ['clara', '…Anche io. Certo.']
    ]
  ],
  [
    'ezekiel',
    'lucius',
    [
      ['lucius', 'Otto, ieri.'],
      ['ezekiel', 'Sette.'],
      ['lucius', '…Sette.']
    ]
  ],
  [
    'brom',
    'ezekiel',
    [
      ['brom', 'Non voglio più farli.'],
      ['ezekiel', 'Li farai.'],
      ['brom', '…Li farò.']
    ]
  ]
];
function updChats(dt) {
  if (G.map.id !== 'main') return;
  const p = G.player;
  if (G.chat) {
    const c = G.chat;
    c.t -= dt;
    if (c.t <= 0) {
      if (c.i >= c.lines.length) {
        c.a.chatT = c.b.chatT = 60 + Math.random() * 60;
        G.chat = null;
        return;
      }
      const [who, txt] = c.lines[c.i++];
      const n = NPC(who);
      if (n && !n.hidden) {
        bubble(n, txt, 2.5);
        n.barkT = Math.max(n.barkT, 6);
      }
      c.t = 2.6;
    }
    return;
  }
  const vis = G.npcs.filter(
    n =>
      !n.hidden &&
      !n.script &&
      n.map === 'main' &&
      !n.moving &&
      (n.chatT || 0) <= 0 &&
      Math.hypot(n.x - p.x, n.y - p.y) < 220
  );
  for (const n of G.npcs) n.chatT = (n.chatT || 0) - dt;
  for (let i = 0; i < vis.length; i++)
    for (let j = i + 1; j < vis.length; j++) {
      const a = vis[i],
        b = vis[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) > 44) continue;
      const L = chatPool().filter(c => (c[0] === a.id && c[1] === b.id) || (c[0] === b.id && c[1] === a.id));
      if (!L.length) {
        a.chatT = b.chatT = 30;
        continue;
      }
      const c = L[Math.floor(Math.random() * L.length)];
      G.chat = { a, b, lines: c[2], i: 0, t: 0.3 };
      a.dir = a.x < b.x ? 2 : 1;
      b.dir = b.x < a.x ? 2 : 1;
      if (Math.abs(a.x - b.x) < Math.abs(a.y - b.y)) {
        a.dir = a.y < b.y ? 0 : 3;
        b.dir = b.y < a.y ? 0 : 3;
      }
      a.idleT = 12;
      b.idleT = 12;
      return;
    }
}

const GIFTABLE = id => {
  const t = ITEMS[id] && ITEMS[id].t;
  return t === 'crop' || t === 'bad' || t === 'food';
};
async function talkTo(n) {
  const st = G.st;
  n.dir = [3, 2, 1, 0][G.player.dir];
  G.cut++;
  try {
    if (festaLive() && (await festaTalk(n))) return;
    if (massNow() && n.map === 'chapel' && n.id !== 'lucius')
      return say(
        n.id,
        ['Sssh. Dopo.', 'Shh… sta per cominciare.', 'Non qui, {n}. Dopo.'][(Math.random() * 3) | 0]
      );
    if (await favorDeliver(n)) return;
    if (!isFree(st)) await redReact(n);
    const it = selItem();
    if (it && GIFTABLE(it.id) && !st.gifted[n.id] && st.flags.met[n.id]) {
      const c = await ask(null, `Vuoi regalare ${ITEMS[it.id].n} a ${n.name}?`, ['Regala', 'Parla e basta']);
      if (c === 0) {
        if (isFree(st)) await freeGift(n, it.id);
        else await gift(n, it.id);
        return;
      }
    }
    if (isFree(st)) {
      if (await festTalk(n)) return;
      if (!(await missionTalk(n)) && !(await freeSecret(n)) && !(await teachRecipe(n))) {
        if (OUT_L[n.id]) await outsiderTalk(n);
        else if (n.act === 'visit') await say(n.id, farmComment(n.id));
        else if (FREE_ASK[n.id]) await FREE_ASK[n.id](n);
        else await say(n.id, freeTalkLine(n.id));
      }
    } else await TALK[n.id](n);
    await favorTell(n);
    if (!isFree(st)) await secretTell(n);
    if (!st.talked[n.id]) {
      st.talked[n.id] = 1;
      addFriend(n.id, 1);
    }
    UI.quest();
  } catch (e) {
    console.error(e);
  } finally {
    G.cut--;
  }
}
async function gift(n, id) {
  const st = G.st;
  removeItem(id, 1);
  Dialoghi.evento('regalo', { chi: n.id, item: id });
  st.gifted[n.id] = 1;
  if (id === 'bacche') {
    addFriend(n.id, -3);
    addQuiete(-6);
    AU.play('sting');
    return say(
      n.id,
      n.id === 'tobia'
        ? 'Hihi! Rosse! …Nascondile. Nascondile prima che le veda il Vecchio.'
        : 'Toglimele di davanti. Subito. E lavati le mani, {n}. Con la cenere.',
      'dark'
    );
  }
  if (id === 'nastro') {
    if (n.id === 'tobia') {
      addFriend('tobia', 4);
      return say(
        'tobia',
        'Me lo ridai? Sei buon{o|a}. Sei buon{o|a} come era buono il nonno. Hihi. Peccato.'
      );
    }
    addFriend(n.id, -3);
    addQuiete(-6);
    return say(
      n.id,
      "Dove l'hai preso? Chi te l'ha dato? …Non importa. Non l'ho visto. Non l'ho visto.",
      'fear'
    );
  }
  const lv = (LIKES[n.id] || {})[id] || 0;
  addFriend(n.id, 1 + lv);
  AU.play('ok');
  floatText(lv >= 2 ? '♥♥' : '♥', n.x, n.y - 30, '#ff7a6a');
  const L = {
    ezekiel: ['Un dono. Il villaggio ricorda chi dona.', 'Ottimo raccolto. Tuo nonno sarebbe fiero.'],
    agatha: [
      'Oh, {caro|cara}! Per me? Lo metto in vetrina!',
      'Che zucca magnifica! Alla festa ne servono tante, sai.'
    ],
    lucius: [
      'Grazie, {figliolo|figliola}. Pregherò per te. Pregherò molto.',
      'La terra ti è amica. Per ora.'
    ],
    clara: [
      'Davvero? Grazie… nessuno mi regala mai niente.',
      'È bellissima! La metto sul davanzale, così la vedi passando.'
    ],
    brom: ['Mh. Grazie.', '…Buona. Davvero buona. Grazie, {ragazzo|ragazza}.'],
    tobia: ['Hihi! Mangio! Mangio tutto!', 'Per me? PER ME? Hihi!']
  }[n.id];
  return say(n.id, L[lv >= 2 ? 1 : 0], '');
}
function metCount() {
  const m = G.st.flags.met;
  return ['ezekiel', 'agatha', 'lucius', 'clara', 'brom'].filter(k => m[k]).length;
}
const TALK = {
  async ezekiel(n) {
    const st = G.st,
      F = st.flags;
    if (st.chapter >= 3 && F.claraAlly && F.tobiaScene && !F.ezTruth) return ezekielTruth(n);
    if (F.ezWait) return ezekielPaint(n);
    if (!F.gotPaint && st.day >= 2) return ezekielPaint(n);
    if (!F.met.ezekiel) {
      F.met.ezekiel = 1;
      await say('ezekiel', 'Ah, {n}. Dormito bene? Le case di Hollowmere hanno muri spessi e porte robuste.');
      await say(
        'ezekiel',
        'Conosci già le Regole. Rispettale, e qui avrai pace. La pace è tutto ciò che abbiamo.'
      );
      return;
    }
    if (countItem('nastro') || countItem('bacche')) {
      addQuiete(-5);
      return say('ezekiel', 'Senti anche tu questo odore, {n}? Io sì. Odore di rosso.', 'stern');
    }
    if (st.chapter >= 3) return ezekielCh3(n);
    if (F.finaleChase || F.ch2end)
      return say(
        'ezekiel',
        'La Festa si avvicina. Riposa, {ragazzo|ragazza}. Ti vogliamo… in forze.',
        'stern'
      );
    if (H2(st)) {
      if (!F.ezFest) {
        F.ezFest = 1;
        return say(
          'ezekiel',
          "La Festa del Raccolto è tra pochi giorni. Quest'anno sarà speciale. Coltiva zucche, {n}. Tante zucche."
        );
      }
      return say(
        'ezekiel',
        pickLine('ezekiel', [
          'Hai visto Tobia? Quel ragazzo parla troppo. Le parole, a Hollowmere, sono come semi.',
          'Dormi bene, la notte? Bene. Molto bene.',
          'Tuo nonno firmava sempre con la mano sinistra. Anche tu sei mancin{o|a}, vero?'
        ]),
        'stern'
      );
    }
    if (st.day >= 3 && !F.vespro)
      return say(
        'ezekiel',
        "Stasera c'è il Vespro, alle sei. Ci saremo tutti. È importante che ci siano tutti."
      );
    if (F.gotPaint && F.posts.filter(Boolean).length < 5)
      return say('ezekiel', 'I pali, {n}. Il giallo protegge. Il grigio… lascia passare.');
    return say(
      'ezekiel',
      pickLine('ezekiel', [
        "Il raccolto cresce bene, quest'anno. La Valle è contenta.",
        "Non c'è niente oltre il bosco, {n}. Niente che valga la pena.",
        'Ricorda: alla campana, a casa.'
      ])
    );
  },
  async agatha(n) {
    const st = G.st,
      F = st.flags;
    if (!F.met.agatha) {
      F.met.agatha = 1;
      await say(
        'agatha',
        'Un volto nuovo! Oh, hai gli occhi di Elias. Sei {il|la} nipote, vero? Che tesoro!'
      );
      await say(
        'agatha',
        "Io sono Agatha Crane. Tengo l'emporio: semi, attrezzi, chiacchiere. Le chiacchiere sono gratis!"
      );
    }
    if (F.sawNoBridge && !F.agBridge) {
      F.agBridge = 1;
      await say('agatha', "Il ponte? Tesoro, a Hollowmere non c'è mai stato un ponte.");
      await say(
        'agatha',
        '…Come sei arrivat{o|a}, allora? Eh. Bella domanda. Bella domanda davvero.',
        'dark'
      );
      addQuiete(-5);
    }
    if (st.day >= 3 && !F.gotChestKey) {
      const ok = F.posts.filter(Boolean).length >= 5 && F.buried >= 3;
      if (ok) {
        F.gotChestKey = 1;
        giveItem('key');
        await say(
          'agatha',
          'Hai dipinto i pali e seppellito il rosso. Brav{o|a}, brav{o|a}. Elias mi lasciò questa, per te.'
        );
        await say(
          'agatha',
          'La chiave della sua cassa. Disse: «Solo se rispetta le regole.» E tu le rispetti.\n(Hai ottenuto: Chiave della cassa)'
        );
      } else
        await say(
          'agatha',
          'Ho una cosa di Elias per te. Ma prima finisci le faccende: i pali gialli, le bacche rosse. Elias è stato chiaro.'
        );
    }
    const c = await ask(
      'agatha',
      H2(st)
        ? 'Cosa ti serve, tesoro? Semi? Abbiamo tanti semi. Ne pianti tanti, vero?'
        : 'Cosa ti serve, tesoro?',
      ['Compra semi', 'Chiacchiera', 'Niente']
    );
    if (c === 0) return UI.shop();
    if (c === 1)
      return say(
        'agatha',
        pickLine(
          'agatha',
          H2(st)
            ? [
                "Brom forgia ferri di cavallo tutto l'anno. Per abitudine, dice.",
                'Clara è una brava ragazza. Troppo curiosa. La curiosità è un colore, sai?',
                'Tuo nonno comprava sempre semi di zucca. Sempre. Anche quando non piantava.'
              ]
            : [
                'Il rosso è il colore cattivo, tesoro. Non chiedermi perché: è così e basta.',
                'Lucius conta. Ezekiel decide. Io vendo. Ognuno ha il suo posto.',
                "Il pane di Clara è il migliore della Valle. Non dirle che l'ho detto."
              ]
        )
      );
  },
  async lucius(n) {
    const st = G.st,
      F = st.flags;
    if (isSunday(st) && n.act === 'call' && !F['mass' + st.day]) {
      F.met.lucius = 1;
      const c = await ask(
        'lucius',
        'La messa sta per cominciare, {figliolo|figliola}. Ti aspettiamo dentro. Vieni?',
        ['Vengo', 'Più tardi']
      );
      if (c === 0) {
        await say('lucius', 'Bene. Entra pure: ti seguo.');
        await goMap('chapel', 7, 8, 3);
        await attendMass();
        return;
      }
      return say('lucius', 'Come vuoi. La porta resta aperta fino alle dieci e mezza.');
    }
    if (
      isSunday(st) &&
      st.time >= 10 * 60 + 30 &&
      F.met.lucius &&
      !F['mass' + st.day] &&
      !F['massMiss' + st.day]
    ) {
      F['massMiss' + st.day] = 1;
      addFriend('lucius', -1);
      return say(
        'lucius',
        'Non ti ho visto alla messa, {figliolo|figliola}. I banchi vuoti si notano. Vengono contati.',
        'dark'
      );
    }
    if (!F.met.lucius) {
      F.met.lucius = 1;
      await say('lucius', 'Sono Fratello Lucius. Suono la campana alle nove di sera.');
      await say(
        'lucius',
        'Quando la senti, chiuditi in casa. Non è una minaccia, {figliolo|figliola}. È una ninna nanna.'
      );
      return;
    }
    if (st.day >= 3 && !F.vespro)
      return say(
        'lucius',
        'Stasera, Vespro. Dalle sei alle sette e mezza, in cappella. Non mancare: ci contiamo, la sera di raccolto.'
      );
    if (st.chapter >= 3)
      return say(
        'lucius',
        pickLine('lucius', [
          'Le tombe vanno curate. I morti di Hollowmere sono molto presenti.',
          "Alla Festa conterò per l'ultima volta. Non so se ne sarò felice."
        ]),
        F.woodDone ? 'dark' : ''
      );
    if (H2(st))
      return say(
        'lucius',
        pickLine('lucius', [
          'Conto le teste ogni sera. A volte i numeri non tornano. Il Signore perdona chi sbaglia i conti.',
          'Otto. Sette. Otto. …Scusa. Pensavo ad alta voce.',
          'Tuo nonno sedeva sempre in fondo. Diceva che da lì si vedono tutti.'
        ]),
        st.quiete < 50 ? 'dark' : ''
      );
    return say(
      'lucius',
      pickLine('lucius', [
        'Le tombe vanno curate. I morti di Hollowmere sono molto… presenti.',
        'Il sego delle candele lo facciamo noi. Non chiedere con cosa.',
        'Dormi con la finestra chiusa.'
      ])
    );
  },
  async clara(n) {
    const st = G.st,
      F = st.flags;
    if (st.chapter >= 3 && F.met.clara && !F.claraAlly) return claraAlly(n);
    if (!F.met.clara) {
      F.met.clara = 1;
      await say(
        'clara',
        'Ciao! Tu devi essere {il nuovo|la nuova}… cioè, {il|la} nipote di Elias! Io sono Clara.'
      );
      await say(
        'clara',
        'Tuo nonno mi raccontava storie. Di città con luci che non si spengono mai. Sono vere?'
      );
      const c = await ask('clara', '', ['Sì, sono vere', 'Sono solo storie']);
      await say(
        'clara',
        c === 0 ? 'Lo sapevo! Un giorno le vedrò. Un giorno…' : 'Oh. Già. Anche lui alla fine diceva così.',
        'sad'
      );
      return;
    }
    if (st.day >= 2 && !F.gotBread && !F.offered) {
      if (addItem('focaccia', 1)) {
        F.gotBread = 1;
        await say(
          'clara',
          'Tieni: una focaccia di zucca. È per il ceppo vicino al Varco. Va lasciata al tramonto, dalle sei alle otto e mezza.'
        );
        await say('clara', 'Non mangiarla! È per loro.');
        const c = await ask('clara', '', ['"Loro" chi?', 'Va bene']);
        if (c === 0) await say('clara', '…Quelli di cui non si parla. Appunto.', 'fear');
      }
      return;
    }
    if (F.ch1end && !F.claraBarn) {
      F.claraBarn = 1;
      await say('clara', '{n}… posso dirti una cosa? Ma non ridere.', 'fear');
      await say(
        'clara',
        "L'altra notte non dormivo. Ho visto una luce nel fienile dell'Anziano. Una luce rossa. E ho sentito… zoccoli. Lì dentro.",
        'fear'
      );
      await say(
        'clara',
        'Tobia va dappertutto, di notte. Lui sa qualcosa. Lo trovi vicino al Varco, di giorno.'
      );
      addQuiete(-4);
      return;
    }
    if (F.claraBarn && !F.ch2end)
      return say(
        'clara',
        "Stai attent{o|a}, ti prego. Se vai al fienile… vai dopo la campana, quando l'Anziano dorme. E torna a casa in fretta.",
        'fear'
      );
    if (st.chapter >= 3 && F.claraAlly) return claraAllyTalk(n);
    return say(
      'clara',
      pickLine('clara', [
        'Il giallo mi sta bene, vero? Me lo ha cucito mia madre. Prima che…',
        'Ti piace Hollowmere? A me sì. Quasi sempre.',
        'Hai sentito il vento, stanotte? Sembrava che chiamasse un nome.'
      ])
    );
  },
  async brom(n) {
    const st = G.st,
      F = st.flags;
    if (!F.met.brom) {
      F.met.brom = 1;
      await say('brom', 'Brom. Fabbro.');
      await say('brom', 'Ti serve qualcosa di ferro? No? Allora non mi serve parlare.');
      return;
    }
    if (F.ch1end && !F.bromShoes) {
      F.bromShoes = 1;
      await say('brom', 'Ferri di cavallo. Quattro, ogni anno, per la Festa.');
      const c = await ask('brom', '', ['Per quale cavallo?', 'Bel lavoro']);
      if (c === 0) {
        await say('brom', '…');
        await say(
          'brom',
          'Non ci sono cavalli a Hollowmere, {ragazzo|ragazza}. Non ci sono mai stati.',
          'dark'
        );
        addQuiete(-10);
        AU.play('hooves');
      } else await say('brom', 'Mh. Nessuno me lo dice mai.');
      return;
    }
    {
      const fo = st.forge && st.day >= st.forge.ready,
        c = await ask('brom', fo ? 'Mh. È pronto.' : 'Mh. Dimmi.', [
          'Chiacchiera',
          fo ? "Ritira l'ordine" : 'Attrezzi',
          'Niente'
        ]);
      if (c === 1) return forgeMenu();
      if (c === 2) return;
    }
    return say(
      'brom',
      pickLine('brom', [
        'Clang. Clang. È un buon suono. Copre gli altri.',
        'Tuo nonno mi ha insegnato a battere il ferro. Era bravo con le mani. Troppo bravo.',
        'Torna a casa presto stasera.'
      ])
    );
  },
  async tobia(n) {
    const st = G.st,
      F = st.flags;
    if (st.day === 1 && st.time >= 1200) {
      AU.play('laugh');
      await say('tobia', 'Hihi. Lui conta. Conta le teste.');
      await say('tobia', 'Tu ne hai una!', 'dark');
      addQuiete(-6);
      return;
    }
    if (F.claraBarn && !F.tobiaTalk) {
      await say('tobia', 'Hihi! {Il|La} nipote! {Il|La} nipote del Vecchio Elias!');
      await say('tobia', 'Ti regalo una cosa. È bella. Il rosso è bello. Non dirlo a nessuno.');
      const c = await ask('tobia', '(Ti porge un nastro rosso.)', ['Prendilo', 'Rifiuta']);
      if (c === 0) {
        riponi('nastro', 1);
        addQuiete(-6);
        F.tookRibbon = 1;
        await say('tobia', 'Hihi! Adesso siamo amici. Amici rossi.');
      } else {
        addFriend('tobia', -1);
        await say('tobia', 'Uffa. Come il Vecchio. Lui diceva sempre di no.', 'sad');
      }
      await say(
        'tobia',
        "Vuoi entrare nel fienile? La chiave dorme. Dorme sotto il ferro di cavallo. Sulla porta dell'Anziano."
      );
      await say('tobia', 'Shhh. Vai dopo la campana. Il cavallo dorme, prima. Hihi.', 'dark');
      F.tobiaTalk = 1;
      AU.play('laugh');
      return;
    }
    if (!F.met.tobia) {
      F.met.tobia = 1;
      return say('tobia', 'Hihi! Ciao! Io sono Tobia. Conto le foglie. Una, due, tante.');
    }
    return say(
      'tobia',
      pickLine('tobia', [
        'Hihi. Le zucche ascoltano. Lo sapevi?',
        'Il Vecchio Elias mi dava le caramelle. Adesso non può. Non ha le mani. Hihi.',
        'Uno, due, tre… otto! Hihi!'
      ]),
      H2(st) && st.day % 3 === 1 ? 'dark' : ''
    );
  },
  async faceless() {}
};
async function ezekielPaint(n) {
  const st = G.st,
    F = st.flags;
  F.ezWait = 0;
  F.gotPaint = 1;
  F.met.ezekiel = 1;
  await say('ezekiel', 'Buongiorno, {n}. Ti aspettavo.');
  await say(
    'ezekiel',
    "Alcuni pali del recinto hanno perso il colore. Cinque, per l'esattezza. Il giallo è il colore che protegge."
  );
  await say(
    'ezekiel',
    'Ecco della vernice. Dipingili, ti prego. Prima del tramonto.\n(Hai ottenuto: Vernice gialla)'
  );
  if (st.day >= 2) {
    await say(
      'ezekiel',
      'E stamattina, nei tuoi campi… sono spuntate bacche rosse. Seppelliscile. Tutte.',
      'stern'
    );
  }
  giveItem('vernice');
  UI.quest();
}
// ================= OBIETTIVI =================
const QUESTS = [
  {
    s: st => st.day === 1 && st.flags.tired,
    t: () => 'Sei stanc{o|a} dal viaggio: torna a casa e dormi nel letto',
    d: () => false
  },
  {
    s: st => st.day >= 1 && st.chapter <= 1,
    t: st => `Presentati agli abitanti (${metCount()}/5)`,
    d: st => metCount() >= 5
  },
  {
    s: st => st.day >= 1 && st.chapter <= 1,
    t: st => `Zappa la terra nei campi e semina (${Math.min(st.flags.planted, 3)}/3 semi)`,
    d: st => st.flags.planted >= 3
  },
  {
    s: st => st.day >= 1 && st.chapter <= 1 && st.flags.planted > 0,
    t: st => `Annaffia i semi con l'annaffiatoio (${Math.min(st.flags.watered || 0, 3)}/3)`,
    d: st => (st.flags.watered || 0) >= 3
  },
  {
    s: st => st.day === 1,
    t: () => 'Visita la tomba del nonno, nel cimitero a nord-est',
    d: st => st.flags.visitedGrave
  },
  {
    s: st => st.day === 1 && st.flags.planted >= 3,
    t: () => 'Leggi la bacheca in piazza e accetta la faccenda del giorno',
    d: st => st.choreOk
  },
  {
    s: st => st.day === 1 && st.flags.planted >= 3,
    t: () => 'Compra altri semi al banco di Agatha, in piazza',
    d: st => st.flags.boughtSeeds
  },
  {
    s: st => st.day >= 2 && st.flags.gotPaint,
    t: st => `Dipingi di giallo i pali grigi del recinto (${st.flags.posts.filter(Boolean).length}/5)`,
    d: st => st.flags.posts.filter(Boolean).length >= 5
  },
  {
    s: st => st.day >= 2 && st.flags.gotPaint,
    t: st => `Seppellisci le bacche rosse nei tuoi campi (${Math.min(st.flags.buried, 3)}/3)`,
    d: st => st.flags.buried >= 3
  },
  {
    s: st => st.day >= 2 && st.chapter <= 1 && !st.flags.gotBread && !st.flags.offered,
    t: () => 'Parla con Clara',
    d: st => st.flags.gotBread
  },
  {
    s: st => st.flags.gotBread,
    t: () => 'Al tramonto (18:00–20:30) lascia la focaccia sul ceppo del Varco',
    d: st => st.flags.offered || st.flags.missedOffer
  },
  {
    s: st => st.day >= 3,
    t: () => 'Chiedi ad Agatha la chiave della cassa del nonno',
    d: st => st.flags.gotChestKey
  },
  { s: st => st.flags.gotChestKey, t: () => 'Apri la cassa del nonno', d: st => st.flags.openedChest },
  {
    s: st => st.day >= 3 && st.chapter <= 1,
    t: () => 'Vai al Vespro in cappella (18:00–19:30)',
    d: st => st.flags.vespro
  },
  {
    s: st => st.flags.vespro && !st.flags.ch1end,
    t: () => 'Torna a casa. Non aprire a nessuno.',
    d: st => st.flags.ch1end
  },
  {
    s: st => H2(st),
    t: () => 'Chiedi a Brom per chi forgia i ferri di cavallo',
    d: st => st.flags.bromShoes
  },
  { s: st => H2(st), t: () => 'Parla con Clara: sembra spaventata', d: st => st.flags.claraBarn },
  {
    s: st => st.flags.claraBarn,
    t: () => 'Trova Tobia vicino al Varco (di giorno)',
    d: st => st.flags.tobiaTalk
  },
  {
    s: st => st.flags.tobiaTalk,
    t: () => "Cerca la chiave sulla porta dell'Anziano",
    d: st => st.flags.barnKey
  },
  {
    s: st => st.flags.barnKey,
    t: () => 'Entra nel fienile rosso dopo le 21:00',
    d: st => st.flags.sawCostume || st.flags.readLedger
  },
  {
    s: st => st.flags.sawCostume || st.flags.readLedger,
    t: () => 'Esamina il fienile: il costume e il registro',
    d: st => st.flags.barnEvent
  },
  {
    s: st => st.flags.finaleChase && !st.flags.ch2end,
    t: () => 'SCAPPA A CASA!',
    d: st => st.flags.ch2end,
    alarm: 1
  },
  {
    s: st => st.chapter >= 3 && !st.flags.ezTruth,
    t: () => 'Parla con Clara: ha qualcosa da dirti',
    d: st => st.flags.claraAlly
  },
  {
    s: st => st.chapter >= 3 && !st.flags.ezTruth,
    t: () => 'Cerca Tobia, di giorno, nel fienile',
    d: st => st.flags.tobiaScene
  },
  {
    s: st => st.flags.claraAlly && st.flags.tobiaScene && !st.flags.ezTruth,
    t: () => "Metti alle strette l'Anziano Ezekiel",
    d: st => st.flags.ezTruth
  },
  {
    s: st => st.flags.ezTruth,
    t: () => "Varca il Varco con la lanterna e cerca l'Albero",
    d: st => st.flags.woodDone
  },
  {
    s: st => st.chapter >= 4 && !st.flags.festaOn && !st.flags.festaDone,
    t: () => 'Alla Festa: stasera, dalle 19:00, in piazza',
    d: () => false
  },
  {
    s: st => st.flags.festaOn && !st.flags.conteggio,
    t: () => 'Alla Festa: parla con tutti. Non bere il sidro.',
    d: () => false
  },
  { s: () => G.festaChase, t: () => 'SCAPPA AL VARCO!', d: () => false, alarm: 1 },
  { s: () => G.erede, t: () => 'Insegui il forestiero', d: () => false, alarm: 1 },
  {
    s: st => st.choreOk && !st.choreDone,
    t: st => 'Faccenda: ' + choreText(st),
    d: st => st.choreDone,
    free: 1
  }
];
function hintText() {
  const st = G.st,
    t = st.time,
    crops = Object.values(st.farm).filter(f => f.c);
  const fv = (st.favors || []).find(f => !f.done && countItem(f.item) >= f.n);
  if (fv) return `Hai ciò che chiede ${NAMES[fv.id]}: portaglielo (${fmtItems(fv.item, fv.n)}).`;
  if (crops.some(f => cropStage(f.c) === 3))
    return 'Raccogli ciò che è maturo: mettiti davanti alla pianta e premi A/E.';
  if (st.inv.some(s => s && ITEMS[s.id].t === 'crop'))
    return 'Vendi il raccolto nella cassetta accanto a casa, oppure cucinalo al camino: i piatti ridanno energia.';
  if (crops.some(f => cropGone(f)))
    return 'Una pianta è appassita: annaffiala, o toglila con la zappa e ripianta.';
  const dry = crops.filter(f => !f.w && !f.c.dead && cropStage(f.c) < 3).length;
  if (dry && t < 20 * 60 + 30) return `Annaffia le piantine (${dry} da bagnare).`;
  if (t >= 19 * 60) return 'Torna a casa e dormi nel letto: le piante crescono di notte.';
  if (!st.choreOk) return "Leggi la bacheca in piazza: c'è una faccenda pagata.";
  if (st.inv.some(s => s && ITEMS[s.id].t === 'seed') && Object.keys(st.farm).length < 30)
    return 'Hai ancora semi: zappa altra terra e semina.';
  return 'Parla con gli abitanti, esplora la valle, o riposa su una panchina fino a sera.';
}
function activeQuests() {
  const st = G.st,
    q = QUESTS.filter(q => q.s(st) && (!isFree(st) || q.free));
  for (const f of st.favors || []) {
    if (!f.told || f.done) continue;
    q.push({
      s: () => 1,
      t: () =>
        `Favore per ${NAMES[f.id]}: ${fmtItems(f.item, f.n)} (${SC(f.reward)}, entro ${DAYN[(f.until + 3) % 7]})`,
      d: () => false
    });
  }
  return q;
}
