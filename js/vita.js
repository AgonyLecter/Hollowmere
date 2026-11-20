'use strict';
// ================= LA VALLE VIVA =================
// Nel gioco libero gli abitanti hanno giornate vere: cambiano col giorno della settimana, la stagione e il meteo.
// Fanno cose che si vedono (pescano, leggono, zappano l'orto, fanno il picnic, ballano, guardano le stelle, spaccano
// legna, prendono il tè), chiacchierano tra loro di cose nuove, ti salutano per nome e per ora del giorno, ogni tanto
// vengono da te (un regalo, una dritta, un invito), commentano quello che fai, salutano gli altri giocatori online
// e raccontano cosa succede negli altri villaggi della Valle.

const WDAY = st => WD(st); // 0 lunedì … 6 domenica
const rainyV = st => st.weather === 'pioggia' || st.weather === 'neve';
const VA = (x, y, d, act, wr, o) => at(x, y, d, act, wr || 0, o || {});
const LEISURE = new Set([
  'fish',
  'read',
  'picnic',
  'stargaze',
  'garden',
  'dance',
  'tea',
  'bench',
  'chopwood'
]);
// ---------- giornate ----------
const VITA = {
  ezekiel(st) {
    const t = st.time,
      d = WDAY(st),
      s = seasonOf(st);
    if (t < 390) return null;
    if (t < 480) {
      const p = cyc(t, 390, 30, [
        [52, 33],
        [46, 30],
        [44, 22],
        [38, 20],
        [30, 22]
      ]);
      return VA(p[0], p[1], 0, 'walk');
    }
    if (t < 660) return d % 2 === 0 ? VA(27, 22, 3, 'read') : VA(44, 21, 0, 'watch', 1);
    if (t < 720) return VA(48, 21, 1, 'chat');
    if (t < 810) return null;
    if (t < 960) return s >= 2 ? VA(50, 32, 0, 'garden', 1) : VA(52, 31, 0, 'read');
    if (t < 1020) return VA(53, 9, 3, 'pray');
    if (t < 1110) return VA(53, 8, 3, 'pray');
    if (t < 1200) return VA(42, 23, 2, 'bench');
    return null;
  },
  agatha(st) {
    const t = st.time,
      d = WDAY(st),
      s = seasonOf(st);
    if (t < 450) return null;
    if (d === 6 && t >= 660 && t < 900)
      return zoneOpen('lago', st) ? VA(64, 27, 2, 'picnic') : VA(20, 40, 0, 'picnic');
    if ((d === 1 || d === 3) && t >= 600 && t < 660) {
      const p = cyc(t, 600, 15, [
        [36, 15],
        [52, 31],
        [35, 29],
        [46, 22]
      ]);
      return VA(p[0], p[1], 0, 'deliver');
    }
    if (t < 750) return VA(49, 20, 0, 'stall');
    if (t < 810) return null;
    if (t < 1080) return VA(49, 20, 0, 'stall');
    if (t < 1140) return VA(36, 30, 1, 'tea');
    if (t < 1230) return VA(46, 17, 0, 'bench', 1);
    return null;
  },
  lucius(st) {
    const t = st.time,
      d = WDAY(st);
    if (t < 480) return undefined; // le lanterne del mattino e della sera restano le sue
    if (t < 660) return VA(43, 14, 0, 'sweep', 2);
    if (t < 720) return VA(41, 13, 0, 'garden', 1);
    if (t < 840) return null;
    if (t < 960 && d !== 6) return VA(27, 22, 3, 'read');
    if (t < 1010) return VA(54, 9, 0, 'tend', 3);
    if (t < 1260) return undefined;
    if (t >= 1260 && t < 1350)
      return zoneOpen('collina', st) ? VA(87, 8, 3, 'stargaze') : VA(54, 7, 3, 'stargaze');
    return null;
  },
  clara(st) {
    const t = st.time,
      d = WDAY(st),
      s = seasonOf(st);
    if (t < 420) return null;
    if (t < 480) return VA(48, 19, 0, 'deliver');
    if (t < 660) return VA(35, 29, 3, 'bake', 1);
    if (t < 780) return s === 2 || s === 3 ? VA(26, 21, 0, 'flowers', 3) : VA(46, 19, 2, 'idle', 1);
    if (t < 840) return null;
    if (t < 930) return VA(23, 30, 2, 'play', 2);
    if (t < 1080) return VA(46, 17, 3, 'idle', 1);
    if (t < 1140) return VA(35, 30, 2, 'tea');
    if (d === 5 && t >= 1140 && t < 1290) return VA(44, 20, 0, 'dance', 1);
    if (t < 1200) return VA(36, 30, 2, 'idle', 1);
    return null;
  },
  brom(st) {
    const t = st.time,
      d = WDAY(st);
    if (t < 420) return null;
    if (d === 6) {
      if (t >= 840 && t < 1080) return zoneOpen('lago', st) ? VA(67, 31, 2, 'fish') : VA(38, 41, 0, 'fish');
      return undefined;
    }
    if (t < 720) return VA(36, 14, 2, 'forge');
    if (t < 780) return VA(47, 22, 0, 'idle', 1);
    if (t < 990) return VA(36, 14, 2, 'forge');
    if (t < 1080) return VA(31, 33, 3, 'chopwood');
    if (d === 4 && t < 1200) return VA(38, 41, 0, 'fish');
    if (t < 1200) return VA(47, 41, 0, 'bench');
    return null;
  }
};
for (const id in VITA) {
  const orig = SCHED[id];
  SCHED[id] = function (st) {
    if (isFree(st) && !G.visit) {
      let r = VITA[id](st);
      if (r !== undefined) {
        if (r && rainyV(st) && LEISURE.has(r.act)) r = null;
        return r;
      }
    }
    return orig(st);
  };
}

// ---------- quello che fanno si vede ----------
function drawVita(m) {
  if (m.id !== 'main' || !isFree(G.st)) return;
  const t = G.t,
    st = G.st;
  for (const n of G.npcs) {
    if (n.hidden || n.map !== 'main' || n.moving) continue;
    const X = Math.round(n.x),
      Y = Math.round(n.y),
      a = n.act;
    if (a === 'fish') {
      const dx = n.dir === 2 ? 1 : n.dir === 1 ? -1 : 0,
        dy = n.dir === 0 ? 1 : 0,
        ex = X + dx * 26 + (dy ? 6 : 0),
        ey = Y + dy * 20 - 2 + Math.sin(t * 3) * 1.5;
      ctx.strokeStyle = 'rgba(60,40,24,.9)';
      ctx.beginPath();
      ctx.moveTo(X + dx * 6, Y - 16);
      ctx.lineTo(X + dx * 16, Y - 24);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(240,240,220,.5)';
      ctx.beginPath();
      ctx.moveTo(X + dx * 16, Y - 24);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.fillStyle = '#c8301a';
      ctx.fillRect(ex - 1, ey - 1, 3, 2);
    }
    if (a === 'read') {
      ctx.fillStyle = '#7a3a1a';
      ctx.fillRect(X - 4, Y - 14, 8, 6);
      ctx.fillStyle = '#efe2c2';
      ctx.fillRect(X - 3, Y - 13, 3, 4);
      ctx.fillRect(X + 1, Y - 13, 2, 4);
    }
    if (a === 'picnic') {
      ctx.fillStyle = 'rgba(200,60,50,.85)';
      ctx.fillRect(X - 14, Y - 2, 28, 8);
      ctx.fillStyle = 'rgba(255,240,220,.85)';
      for (let i = 0; i < 7; i++)
        for (let j = 0; j < 2; j++) if ((i + j) % 2) ctx.fillRect(X - 14 + i * 4, Y - 2 + j * 4, 4, 4);
      ctx.fillStyle = '#b8803a';
      ctx.fillRect(X + 6, Y - 6, 6, 4);
    }
    if (a === 'tea') {
      ctx.fillStyle = '#efe2c2';
      ctx.fillRect(X + 5, Y - 12, 4, 3);
      if (Math.random() < 0.04)
        G.parts.push({ k: 'puff', x: X + 7, y: Y - 14, vx: 0, vy: -6, t: 0, life: 1 });
    }
    if (a === 'garden' && Math.random() < 0.05) burst('dust', X + (n.dir === 1 ? -8 : 8), Y, 3, '#6a4a2a');
    if (a === 'chopwood') {
      const k = (t * 1.4) % 1;
      if (k < 0.08 && !n._chop) {
        n._chop = 1;
        burst('dust', X + 8, Y - 4, 5, '#b08a5a');
        if (Math.hypot(X - G.player.x, Y - G.player.y) < 200) AU.play('chop', 0.4);
      }
      if (k > 0.5) n._chop = 0;
    }
    if (a === 'stargaze' && Math.random() < 0.02)
      burst('spark', X + (Math.random() - 0.5) * 40, Y - 60 - Math.random() * 20, 1, '#fff6c0');
    if ((a === 'dance' || a === 'flowers' || a === 'bake') && Math.random() < 0.015) {
      const tx = a === 'bake' ? '♨' : '♪';
      floatText(tx, X + (Math.random() - 0.5) * 10, Y - 30, a === 'bake' ? '#ffd8a0' : '#f6d98a', 0.8);
    }
    if (a === 'dance') n.anim += 0.12;
  }
  // l'ombrello, quando piove
  if (st.weather === 'pioggia')
    for (const n of G.npcs) {
      if (n.hidden || n.map !== 'main') continue;
      const X = Math.round(n.x),
        Y = Math.round(n.y) - 34;
      ctx.fillStyle = '#3a2a4a';
      ctx.beginPath();
      ctx.arc(X, Y, 9, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#5a4a7a';
      ctx.beginPath();
      ctx.arc(X, Y, 7, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(X, Y, 1, 12);
    }
}
{
  const _we = drawWorldExtras;
  drawWorldExtras = function (m) {
    _we(m);
    try {
      drawVita(m);
    } catch (e) {}
  };
}
// le attività hanno anche un'etichetta nel menu degli abitanti
Object.assign(ACTD, {
  fish: 'pesca',
  read: 'legge',
  picnic: 'picnic',
  tea: 'prende il tè',
  garden: "cura l'orto",
  stargaze: 'guarda le stelle',
  dance: 'balla',
  chopwood: 'spacca legna',
  bench: 'sulla panchina',
  bake: 'inforna'
});

// ---------- chiacchiere nuove tra abitanti ----------
const VCHAT = [
  [
    'agatha',
    'clara',
    [
      ['agatha', 'Il pane di oggi profuma di finocchio.'],
      ['clara', 'È il segreto della nonna!'],
      ['agatha', 'I segreti buoni si mangiano.']
    ]
  ],
  [
    'agatha',
    'clara',
    [
      ['clara', 'Hai visto quanti forestieri, ultimamente?'],
      ['agatha', 'Clienti, tesoro. Si chiamano clienti.']
    ]
  ],
  [
    'ezekiel',
    'lucius',
    [
      ['ezekiel', 'Le campane suonano diverse, da quando non contiamo più.'],
      ['lucius', 'Suonano e basta. Finalmente.']
    ]
  ],
  [
    'brom',
    'agatha',
    [
      ['agatha', 'Brom, mi serve un chiodo.'],
      ['brom', 'Uno?'],
      ['agatha', 'Cento.'],
      ['brom', '…Mh. Domani.']
    ]
  ],
  [
    'clara',
    'tobia',
    [
      ['tobia', 'Clara, mi insegni a fare il pane?'],
      ['clara', 'Prima ti lavi le mani.'],
      ['tobia', 'Uffa.']
    ]
  ],
  [
    'lucius',
    'tobia',
    [
      ['tobia', 'Fratello Lucius, le stelle si contano?'],
      ['lucius', 'Si guardano, Tobia. Solo si guardano.']
    ]
  ],
  [
    'ezekiel',
    'brom',
    [
      ['ezekiel', 'La Valle cresce.'],
      ['brom', 'Servono chiodi.'],
      ['ezekiel', 'Ti servono braccia.'],
      ['brom', 'Ho le mie.']
    ]
  ],
  [
    'ezekiel',
    'agatha',
    [
      ['agatha', 'Il nipote di Elias ha la mano buona.'],
      ['ezekiel', 'Ha la testa dura. Come lui.']
    ]
  ],
  [
    'clara',
    'lucius',
    [
      ['clara', 'Fiori per la cappella!'],
      ['lucius', 'Di che colore, questa volta?'],
      ['clara', 'Tutti i colori!']
    ]
  ],
  [
    'brom',
    'tobia',
    [
      ['tobia', 'Brom! Mi fai una spada?'],
      ['brom', 'No.'],
      ['tobia', 'Un coltellino?'],
      ['brom', 'Una zappa.'],
      ['tobia', '…Va bene.']
    ]
  ]
];
const VCHAT_SEASON = [
  [
    0,
    'agatha',
    'ezekiel',
    [
      ['agatha', "Castagne a quintali, quest'anno."],
      ['ezekiel', 'Un buon autunno, finalmente.']
    ]
  ],
  [
    1,
    'clara',
    'tobia',
    [
      ['tobia', 'Neve! Neve!'],
      ['clara', 'Sciarpa, Tobia. SCIARPA.']
    ]
  ],
  [
    2,
    'clara',
    'agatha',
    [
      ['clara', 'Le primule sono uscite!'],
      ['agatha', 'Allora si seminano le fragole.']
    ]
  ],
  [
    3,
    'brom',
    'lucius',
    [
      ['lucius', 'Fa caldo anche per te, alla forgia?'],
      ['brom', 'Sempre.']
    ]
  ]
];
{
  const _cp = chatPool;
  chatPool = function () {
    const st = G.st;
    if (!isFree(st)) return _cp();
    const s = seasonOf(st);
    const R = residents(st).map(r => r.id),
      pairs = [];
    for (const id of R)
      for (const o of ['agatha', 'clara', 'brom', 'ezekiel', 'lucius', 'tobia'])
        pairs.push([
          id,
          o,
          [
            [o, `Come ti trovi nella Valle, ${NAMES[id].split(' ')[0]}?`],
            [id, RES[id].L[(st.day + o.length) % RES[id].L.length]]
          ]
        ]);
    return VCHAT.concat(
      VCHAT_SEASON.filter(c => c[0] === s).map(c => c.slice(1)),
      pairs
    );
  };
}

// ---------- ti salutano davvero ----------
function saluto(n) {
  const st = G.st,
    t = st.time,
    h = hearts(n.id),
    nm = '{n}',
    s = seasonOf(st);
  const L = [];
  L.push(t < 720 ? `Buongiorno, ${nm}!` : t < 1080 ? `Buon pomeriggio, ${nm}.` : `Buonasera, ${nm}.`);
  if (h >= 6) L.push(`Eccoti! Mi mancavi, ${nm}.`, 'Sei il mio vicino preferito. Non dirlo agli altri.');
  else if (h >= 3) L.push(`Tutto bene, ${nm}?`);
  if (st.weather === 'pioggia') L.push('Che acquazzone! Le tue piante saranno contente.');
  if (st.weather === 'neve') L.push('Copriti, fa un freddo!');
  if (n.act === 'fish') L.push('Shh… abboccano.');
  if (n.act === 'read') L.push('Un attimo, finisco la pagina.');
  if (n.act === 'picnic') L.push("Vuoi una fetta di torta? Ah, l'hai già mangiata tutta Tobia.");
  if (n.act === 'stargaze') L.push('Guarda lassù. Non è bellissimo?');
  if (n.act === 'dance') L.push('Vieni a ballare!');
  if (n.act === 'chopwood') L.push("Mh. Legna per l'inverno.");
  if (festSoon && festSoon(st)) L.push('Ci vediamo alla festa!');
  const others = Object.values(G.others || {})
    .map(o => o.name)
    .filter(Boolean);
  if (others.length) L.push(`Hai visto? C'è ${others[0]} in giro per la Valle!`);
  const nb = Object.keys(st.free.built).length;
  if (nb >= 30) L.push('Il tuo villaggio sta diventando una città!');
  const g = gossip();
  if (g && Math.random() < 0.35) L.push(g);
  return L[Math.floor(Math.random() * L.length)];
}
{
  const _nb = npcBarks;
  npcBarks = function (dt) {
    if (!isFree(G.st) || G.visit) return _nb(dt);
    if (G.cut || UI.busy() || G.map.id !== 'main') {
      for (const b of G.bubbles) b.life -= dt;
      G.bubbles = G.bubbles.filter(b => b.life > 0);
      return;
    }
    const p = G.player;
    for (const n of G.npcs) {
      if (n.hidden || n.script || n.map !== 'main' || n.barkT > 0) continue;
      const d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < 56) {
        n.barkT = 30 + Math.random() * 30;
        bubble(n, n.act === 'visit' ? farmComment(n.id) : saluto(n));
        continue;
      }
      // salutano anche gli altri giocatori che passano
      for (const o of Object.values(G.others || {})) {
        if (o.map !== 'main' || Math.hypot(n.x - o.x, n.y - o.y) > 50) continue;
        n.barkT = 40 + Math.random() * 30;
        bubble(n, `Ciao, ${o.name}!`);
        break;
      }
    }
    for (const b of G.bubbles) b.life -= dt;
    G.bubbles = G.bubbles.filter(b => b.life > 0);
  };
}

// ---------- notizie dagli altri villaggi ----------
let GOSSIP = [],
  GOSSIP_T = 0;
async function gossipLoad() {
  if (!NET.ok || Date.now() - GOSSIP_T < 600000) return;
  GOSSIP_T = Date.now();
  const me = (G.visit ? G.home : G.st).pid;
  try {
    const L = (await MP.list(40)).filter(v => v.pid !== me && v.name);
    GOSSIP = [];
    for (const v of L) {
      if (v.rank >= 1)
        GOSSIP.push(`Dicono che il villaggio di ${v.name} sia diventato ${rankName(+v.rank)}.`);
      if (v.anim >= 3) GOSSIP.push(`${v.name} ha già ${v.anim} bestie, sai?`);
      if (v.built >= 40) GOSSIP.push(`Il villaggio di ${v.name} è pieno di costruzioni. Più del tuo!`);
      if (v.motto) GOSSIP.push(`Ho letto il cartello di ${v.name}: «${String(v.motto).slice(0, 40)}».`);
    }
  } catch (e) {}
}
function gossip() {
  return GOSSIP.length ? GOSSIP[Math.floor(Math.random() * GOSSIP.length)] : null;
}

// ---------- vengono da te ----------
// una volta ogni tanto, un abitante amico (almeno 3 cuori) ti raggiunge: un regalo, una dritta o un invito
const VDRITTE = [
  "Le castagne d'autunno cadono lungo il recinto ovest. Guarda la mattina presto.",
  "Al Lago si pesca meglio all'alba. E di notte, nel fiume, escono le anguille.",
  "La serra fa crescere anche le fragole d'inverno. Me l'ha detto un forestiero.",
  'Nella miniera, dove ci sono le torce, le Ombre vanno piano.',
  'Al museo regalano cose belle, ogni dieci doni.',
  'Se il tuo villaggio cresce, al cancello est si apre qualcosa.',
  'Le bestie felici fanno più uova. Accarezzale ogni giorno.'
];
const VINVITO = {
  clara: ['Sabato sera ballo in piazza, dopo le sette. Vieni?', 'dance'],
  brom: ["Domenica pomeriggio vado a pescare. Se vuoi, c'è posto.", 'fish'],
  agatha: ["Domenica a mezzogiorno faccio il picnic. Porta l'appetito!", 'picnic'],
  lucius: ['Stanotte, dopo le nove, guardo le stelle. È più bello in due.', 'stargaze'],
  ezekiel: ['Domattina leggo sulla panchina. Vieni a fare due chiacchiere.', 'read']
};
let VISIT_T = 60;
async function npcViene(dt) {
  const st = G.st;
  if (
    !isFree(st) ||
    G.visit ||
    G.mode !== 'game' ||
    G.cut ||
    UI.busy() ||
    G.bm ||
    G.map.id !== 'main' ||
    POSTINO
  )
    return;
  VISIT_T -= dt;
  if (VISIT_T > 0) return;
  VISIT_T = 90 + Math.random() * 120;
  const F = st.free;
  F.vvis = F.vvis || {};
  if (F.vvis.day === st.day && F.vvis.n >= 2) return;
  const cand = G.npcs.filter(
    n =>
      !n.hidden &&
      !n.script &&
      n.map === 'main' &&
      ['agatha', 'clara', 'brom', 'lucius', 'ezekiel', 'tobia'].includes(n.id) &&
      hearts(n.id) >= 3 &&
      F.vvis['_' + n.id] !== st.day &&
      Math.hypot(n.x - G.player.x, n.y - G.player.y) < 320
  );
  if (!cand.length || Math.random() < 0.4) return;
  const n = cand[Math.floor(Math.random() * cand.length)];
  F.vvis.day === st.day ? F.vvis.n++ : (F.vvis = { day: st.day, n: 1 });
  F.vvis['_' + n.id] = st.day;
  const p = G.player,
    [px, py] = ptile(p),
    m = G.maps.main,
    near = freeNear(m, px + (n.x / 16 > px ? 1 : -1), py);
  G.cut++;
  n.script = true;
  try {
    await Promise.race([walkNPC(n, near[0], near[1], near[0] > px ? 1 : 2), sleep(8000)]);
    n.dir = near[0] > px ? 1 : 2;
    p.dir = near[0] > px ? 2 : 1;
    const r = Math.random(),
      like = Object.keys(LIKES[n.id] || {}).filter(k => ITEMS[k]);
    if (r < 0.4 && like.length) {
      const it = like[Math.floor(Math.random() * like.length)];
      await say(
        n.id,
        `{n}! Passavo di qui e ho pensato a te. Tieni, ${ITEMS[it].n.toLowerCase()}. Mi è avanzato.`
      );
      giveItem(it, 1);
      addFriend(n.id, 1);
    } else if (r < 0.75) {
      await say(n.id, 'Ti do una dritta, {n}: ' + VDRITTE[Math.floor(Math.random() * VDRITTE.length)]);
    } else if (VINVITO[n.id]) {
      const [txt, act] = VINVITO[n.id];
      await say(n.id, txt);
      F.invito = { id: n.id, act, day: st.day };
      UI.toast(`Invito di ${NAMES[n.id]}: lo trovi quando ${ACTD[act] || act}. Andarci fa piacere.`);
    } else await say(n.id, saluto(n));
  } catch (e) {
    console.error(e);
  } finally {
    G.cut--;
    n.script = false;
  }
}
// andare all'invito: se sei vicino mentre lo fa, l'amicizia cresce (una volta)
function invitoTick() {
  const st = G.st,
    I = st.free && st.free.invito;
  if (!I || I.done) return;
  const n = NPC(I.id);
  if (!n || n.hidden || n.act !== I.act) return;
  if (Math.hypot(n.x - G.player.x, n.y - G.player.y) > 40) return;
  I.done = 1;
  addFriend(I.id, 3);
  AU.play('ok');
  bubble(n, 'Sei venut{o|a}! Che bello.', 3);
  UI.toast(`Sei andat${G.st.g === 'f' ? 'a' : 'o'} all'invito di ${NAMES[I.id]}. L'amicizia cresce.`);
}
// commentano quello che fai vicino a loro
let COMM_T = 0;
{
  const _ts = toolSwing;
  toolSwing = function () {
    _ts();
    const st = G.st;
    if (!isFree(st) || G.visit || G.t < COMM_T) return;
    const it = selItem();
    if (!it) return;
    const n = G.npcs.find(
      n => !n.hidden && n.map === G.map.id && !n.script && Math.hypot(n.x - G.player.x, n.y - G.player.y) < 70
    );
    if (!n || Math.random() > 0.25) return;
    COMM_T = G.t + 25;
    const C = {
      accetta: ['Bel colpo!', 'Attento ai piedi.', 'Mh. Buona legna.'],
      piccone: ['Che forza!', 'Le pietre di qui sono dure.'],
      hoe: ['Terra buona, quella.', 'Brav{o|a}, così si fa.'],
      can: ['Acqua, acqua, sempre acqua!', 'Le piante ringraziano.'],
      pala: ['Un vialetto nuovo?']
    }[it.id];
    if (C) bubble(n, C[Math.floor(Math.random() * C.length)], 2.4);
  };
}
{
  const _mt = mpTick;
  mpTick = function (dt) {
    _mt(dt);
    if (isFree(G.st)) {
      gossipLoad();
      npcViene(dt).catch(() => {});
      invitoTick();
    }
  };
}
GUIDES.push({
  id: 'vita',
  v: 11,
  n: 'La Valle viva',
  steps: [
    {
      t: 'Gli abitanti adesso hanno giornate vere: cambiano coi giorni della settimana, le stagioni e il tempo. Brom la domenica va a pescare, Agatha fa il picnic, Clara il sabato sera balla in piazza, Lucius di notte guarda le stelle.'
    },
    {
      t: 'Ti salutano per nome e ti raccontano le novità, anche degli altri villaggi della Valle. Commentano quello che fai, e salutano gli altri giocatori che passano.'
    },
    {
      t: "Quando siete amici, ogni tanto vengono da te: un regalo, una dritta, un invito. Se vai all'invito, l'amicizia cresce. Nel menu ☰ → Abitanti vedi cosa sta facendo ognuno."
    }
  ]
});
