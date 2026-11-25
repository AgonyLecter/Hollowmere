'use strict';
// ================= FLUSSO DI GIOCO =================
const SEC_PER_MIN = 0.42;
const TITLE = {
  async new() {
    const r = await UI.askName();
    if (!r) return;
    const name = r.name;
    UI.hideTitle();
    const st = newState(name, r.g);
    setPlayerLook(r.g);
    st.pid = newPid();
    G.st = st;
    NET.register(name);
    LS.del('hm_save');
    await UI.fade(1, 500);
    G.mode = 'game';
    G.map = null;
    await UI.letter(name);
    await prologue();
  },
  async cont() {
    let st = null;
    try {
      st = JSON.parse(LS.get('hm_save'));
    } catch (e) {
      segnala(e, 'main');
    }
    if (NET.ok && st && st.pid) {
      const r = await NET.load(st.pid);
      if (r && (r.ts || 0) > (st.ts || 0)) st = r;
    }
    if (!st) {
      UI.toast('Nessun salvataggio trovato.');
      return;
    }
    startFrom(st);
  },
  async code() {
    const r = await UI.askCode();
    if (!r) return;
    const c = r.c;
    if (!NET.ok) {
      UI.toast('Serve la connessione alla Valle (online).', 'bad');
      return;
    }
    UI.toast('Cerco nella Valle…');
    const st = await NET.load(c);
    if (!st) {
      UI.toast('Nessuna anima con questo codice.', 'bad');
      return;
    }
    if (r.k) LS.set('hm_key_' + c, r.k);
    NET._own[c] = false;
    if (!(await NET.own(c)) && NET.uid) {
      LS.del('hm_key_' + c);
      st.pid = newPid();
      UI.toast(
        r.k
          ? "Chiave sbagliata: continui con un codice nuovo. Il salvataggio originale resta com'era."
          : "Senza chiave di recupero continui con un codice nuovo. Il salvataggio originale resta com'era."
      );
    }
    LS.set(st.free ? 'hm_free' : 'hm_save', JSON.stringify(st));
    startFrom(st);
  },
  opts() {
    UI.open(
      `<button class="btn mclose" data-close>✕</button><h2>Opzioni</h2><p>Musica <input type="range" id="vm" min="0" max="1" step=".05" value="${AU.vol.m}"></p><p>Effetti <input type="range" id="vs" min="0" max="1" step=".05" value="${AU.vol.s}"></p><p class="small">Su telefono: gira in orizzontale e usa "Schermo intero". Muoviti trascinando il pollice a sinistra, A per agire.</p><p class="small">Su PC: WASD/frecce, E o Spazio per agire, 1–0 per gli oggetti, Esc per il menu.</p>`
    );
    const vm = $('#vm'),
      vs = $('#vs');
    vm.oninput = () => {
      AU.vol.m = +vm.value;
      AU.applyVol();
      LS.set('hm_vol', JSON.stringify(AU.vol));
    };
    vs.oninput = () => {
      AU.vol.s = +vs.value;
      AU.applyVol();
      AU.play('blip');
      LS.set('hm_vol', JSON.stringify(AU.vol));
    };
  },
  full() {
    goFull();
  },
  // la Valle: il gioco libero, con il suo salvataggio separato (e il suo codice di villaggio)
  async valle() {
    if (!JSON.parse(LS.get('hm_endings') || '[]').length && !LS.get('hm_free') && legacyDone()) {
      legacyEnding();
      return;
    }
    if (!JSON.parse(LS.get('hm_endings') || '[]').length && !LS.get('hm_free')) {
      UI.open(
        `<button class="btn mclose" data-close>✕</button><h2>La Valle</h2><p>Dopo la storia, Hollowmere diventa un mondo da vivere insieme agli altri giocatori: stagioni, feste, il tuo villaggio, le visite, il mercato dei materiali rari.</p><p><b>🔒 Si apre quando finisci la storia</b>, con uno qualsiasi dei tre finali.</p>`
      );
      return;
    }
    let st = null;
    try {
      st = JSON.parse(LS.get('hm_free'));
    } catch (e) {
      segnala(e, 'main');
    }
    if (NET.ok && st && st.pid) {
      const r = await NET.load(st.pid);
      if (r && r.free && (r.ts || 0) > (st.ts || 0)) st = r;
    }
    if (st && st.free) {
      startFrom(st);
      return;
    }
    let base = null;
    try {
      base = JSON.parse(LS.get('hm_freebase') || LS.get('hm_save'));
    } catch (e) {
      segnala(e, 'main');
    }
    if (!base) {
      UI.toast('Finisci la storia per aprire la Valle.');
      return;
    }
    const E = JSON.parse(LS.get('hm_endings') || '[]'),
      ending = base.endingN || E[E.length - 1] || 3;
    UI.hideTitle();
    await UI.fade(1, 400);
    G.coach = null;
    G.amb = null;
    G.st = migrate(base);
    delete G.st.endingN;
    G.st.pid = newPid();
    setPlayerLook(G.st.g);
    G.mode = 'game';
    G.map = null;
    await freeStart(ending);
  },
  // altri finali: si riparte dal primo bivio (Capitolo II) o dalla Festa
  finali() {
    const E = JSON.parse(LS.get('hm_endings') || '[]'),
      C = [
        [
          'hm_cp2',
          'Dal primo bivio — Capitolo II',
          'Il nastro rosso, le pagine del nonno, il fienile: da qui le scelte cambiano il finale.'
        ],
        [
          'hm_cp3',
          'Dal Capitolo III',
          'Clara, Tobia, il bosco. Le amicizie decidono chi ti aiuta alla Festa.'
        ],
        [
          'hm_prefesta',
          'Dalla Festa del Raccolto',
          'Il giorno della Festa: il sidro, il Conteggio, la fuga o il patto.'
        ]
      ].filter(c => LS.get(c[0]));
    const H = {
      1: 'La Fuga: arriva alla Festa con Clara alleata e scappa al Varco.',
      2: "L'Erede: lasciati contare, o fatti prendere.",
      3: 'Spezzare il patto: tieni il nastro rosso, leggi tutto, fatti amici Clara e Tobia.'
    };
    UI.open(
      `<button class="btn mclose" data-close>✕</button><h2>Altri finali</h2><p class="small">Finali scoperti: ${E.length}/3.</p>` +
        [1, 2, 3]
          .map(
            n =>
              `<p class="small">${E.includes(n) ? '✔' : '✦'} ${E.includes(n) ? H[n].split(':')[0] : 'Ancora da scoprire — ' + H[n].split(': ')[1]}</p>`
          )
          .join('') +
        (C.length
          ? C.map(
              ([k, t, d]) =>
                `<div class="mrow"><span><b>${t}</b><br><span class="small">${d}</span></span><button class="btn" data-cp="${k}">Riparti</button></div>`
            ).join('')
          : '<p>Nessun punto di ripartenza salvato su questo dispositivo.</p>') +
        '<p class="small">La partita della Valle non viene toccata: ha un salvataggio a parte.</p>'
    );
    $('#mbox')
      .querySelectorAll('[data-cp]')
      .forEach(
        b =>
          (b.onclick = () => {
            let st = null;
            try {
              st = JSON.parse(LS.get(b.dataset.cp));
            } catch (e) {
              segnala(e, 'main');
            }
            if (!st) return;
            UI._mclose = null;
            UI.close();
            LS.set('hm_save', JSON.stringify(st));
            startFrom(st);
          })
      );
  }
};
function migrate(st) {
  const d = newState(st.name || '?', st.g || 'm');
  for (const k in d) if (st[k] === undefined) st[k] = d[k];
  for (const k in d.flags) if (st.flags[k] === undefined) st.flags[k] = d.flags[k];
  riparaContenitori(st);
  const has = id => st.inv.some(s => s && s.id === id),
    put = id => {
      const i = st.inv.findIndex(s => !s);
      if (i >= 0) st.inv[i] = { id, n: 1 };
    };
  if (st.flags.ch3end && !st.flags.ch4card) {
    st.flags.ch4card = 1;
    st.flags.ch4day = st.day;
    st.chapter = 4;
  } // salvataggi dopo il Capitolo III: la Festa è oggi
  if (st.flags.ch2end) st.flags.finaleChase = 0; // salvataggi dopo il Capitolo II: gli abitanti tornano a uscire di casa
  if (st.free) {
    st.free.land = st.free.land || ['casa'];
    st.free.tiles = st.free.tiles || {};
    st.free.inside = st.free.inside || {};
    st.free.recipes = st.free.recipes || {};
    while (st.inv.length < 20) st.inv.push(null);
    if (!has('pala')) put('pala');
  }
  if (!st.free) {
    if (st.flags.gotPaint && st.flags.posts.filter(Boolean).length < 5 && !has('vernice')) put('vernice');
    if (st.flags.gotChestKey && !st.flags.openedChest && !has('key')) put('key');
    if (st.flags.barnKey && !has('keyI')) put('keyI');
  }
  return st;
} // nella Valle gli oggetti della storia non ritornano da soli
async function startFrom(st) {
  G.coach = null;
  G.amb = null;
  UI.hideTitle();
  await UI.fade(1, 400);
  G.st = migrate(st);
  applyUpgrades();
  G.festaDark = false;
  G.erede = false;
  G.prey = null;
  G.festaChase = false;
  G.redTint = 0;
  G.npcs = G.npcs.filter(n => !n.clone);
  if (!st.pid) st.pid = newPid();
  setPlayerLook(st.g);
  G.parts = [];
  G.cutMusic = null;
  G.chase = false;
  G.horse.on = false;
  rebuildMaps();
  G.map = G.maps[st.map || 'house'] || G.maps.house;
  setPos(G.player, st.px ?? 2, st.py ?? 3, st.dir ?? 0);
  if (G.map.id === 'house' && st.px == null) setPos(G.player, 2, 3, 0);
  safeSpot(st);
  snapNPCs();
  spawnCritters();
  G.mode = 'game';
  UI.showHud(true);
  UI.hotbar();
  UI.hud();
  UI.quest();
  updateCam(0);
  await UI.fade(0, 600);
  if (isFree(G.st)) {
    const S = G.st;
    NET.save(S)
      .catch(() => {})
      .then(() => {
        if (G.st === S) {
          presenceJoin(S.pid);
          inboxStart();
        }
      });
  }
  UI.toast(`Bentornat{o|a}, ${st.name}. Giorno ${st.day}.`);
}
function toTitle() {
  G.coach = null;
  presenceLeave();
  G.visit = null;
  G.home = null;
  G.erede = false;
  G.prey = null;
  G.festaChase = false;
  G.festaDark = false;
  G.redTint = 0;
  G.scare = 0;
  G.shadows = [];
  G.player.speed = 66;
  G.npcs = G.npcs.filter(n => !n.clone);
  G.mode = 'title';
  G.cut = 0;
  G.chase = false;
  G.horse.on = false;
  G.cutMusic = null;
  const st = newState('');
  st.flags.arrived = 1;
  st.time = 19 * 60 + 10;
  G.st = st;
  rebuildMaps();
  spawnCritters();
  G.map = G.maps.main;
  G.horror = 0;
  document.body.classList.remove('corrupt', 'corrupt2');
  UI.showTitle();
}
// chi ha finito la storia con una versione vecchia del gioco non ha il segno dei finali: lo si riconosce dal salvataggio (era già alla Festa)
function legacySave() {
  for (const k of ['hm_save', 'hm_prefesta']) {
    try {
      const v = JSON.parse(LS.get(k));
      if (
        v &&
        v.chapter >= 4 &&
        v.flags &&
        (v.flags.festaOn || v.flags.conteggio || v.flags.drank || v.flags.danced || v.flags.gara)
      )
        return v;
    } catch (e) {
      segnala(e, 'main');
    }
  }
  return null;
}
function legacyDone() {
  return !!legacySave();
}
function legacyEnding() {
  const H = {
    1: 'La Fuga — sei scappat{o|a} dal Varco',
    2: "L'Erede — sei diventat{o|a} il Cavaliere",
    3: 'Spezzare il patto — il debito è chiuso'
  };
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Hai già finito la storia</h2><p>Hai giocato il finale con una versione precedente di Hollowmere, che non lo segnava. Con quale finale l'hai chiusa? La Valle comincia da lì.</p>` +
      [1, 2, 3]
        .map(
          n =>
            `<p><button class="btn" data-le="${n}" style="width:100%;text-align:left">${fmt(H[n].replace(/\{o\|a\}/g, '{o|a}'))}</button></p>`
        )
        .join('') +
      `<p class="small">Se non te lo ricordi, scegli «Spezzare il patto».</p>`
  );
  $('#mbox')
    .querySelectorAll('[data-le]')
    .forEach(
      b =>
        (b.onclick = () => {
          const n = +b.dataset.le,
            base = legacySave();
          LS.set('hm_endings', JSON.stringify([n]));
          if (base) {
            base.endingN = n;
            LS.set('hm_freebase', JSON.stringify(base));
          }
          UI._mclose = null;
          UI.close();
          UI.showTitle();
          TITLE.valle();
        })
    );
}
// un salvataggio può avere la mappa giusta e le coordinate di un'altra (es. la casa): il personaggio finirebbe
// dentro un muro o nel bosco, invisibile e bloccato. Lo riportiamo in un posto sicuro.
function safeSpot(st) {
  const m = G.map,
    p = G.player,
    [x, y] = ptile(p),
    F = st.flags;
  const bad =
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y) ||
    !m.inb(x, y) ||
    m.solid(x, y) ||
    (m.id === 'main' && (x < 4 || y < 4 || y > 41 || x > (m.w > 64 ? 96 : 59)));
  if (!bad) return;
  if (m.id === 'main' && st.chapter >= 4 && F.ch4day === st.day && !F.festaDone && st.time >= 18 * 60) {
    setPos(p, 43, 20, 3);
    return;
  }
  if (m.id === 'main') {
    const [a, b] = bdoor('house');
    setPos(p, a, b + 1, 0);
    return;
  }
  const [a, b] = freeNear(m, Math.max(1, Math.min(m.w - 2, x || 2)), Math.max(2, Math.min(m.h - 2, y || 3)));
  setPos(p, a, b, 0);
}
// ---------- prologo ----------
async function prologue() {
  G.cut++;
  const st = G.st;
  st.day = 0;
  st.time = 18 * 60 + 25;
  rebuildMaps();
  G.map = G.maps.main;
  setPos(G.player, 43, 46, 3);
  G.coach = { x: 45 * 16 + 4, y: 47 * 16 + 30, moving: false };
  await arrivalCinematic();
  const ez = NPC('ezekiel'),
    cl = NPC('clara');
  ez.script = cl.script = true;
  placeNPC(ez, 'main', 44, 39, 0);
  placeNPC(cl, 'main', 46, 39, 0);
  updateCam(0);
  G.cutMusic = 'title';
  await UI.card('Prologo', 'Hollowmere', 'La Valle Quieta', false, false, 2200);
  await UI.fade(0, 1500);
  await narr(
    'Scendi con la valigia. Il cocchiere ha già girato i cavalli, prima ancora che tu toccassi terra.'
  );
  await say('cocchiere', '«Più in là non vado, {signore|signora}. Nessuno ci va.»');
  const cl0 = await ask('cocchiere', '«Se fossi in voi, risalirei. Riparto adesso. Non torno.»', [
    'Resto',
    'Perché nessuno ci va?'
  ]);
  if (cl0 === 1)
    await say(
      'cocchiere',
      '«Perché quelli che ci vanno, poi, non scrivono più. Tranne uno. E guardate dove ha mandato voi.»'
    );
  await say('cocchiere', '«Che Dio… no. Che vi vada bene, ecco.»');
  await coachLeave();
  await narr('Il rumore delle ruote si allontana. Poi più niente. Nemmeno gli uccelli.');
  await walkPlayer(44, 41);
  await say('ezekiel', "Benvenut{o|a} a Hollowmere, {n}. Io sono Ezekiel Thorne, l'Anziano. Ti aspettavamo.");
  await say('clara', 'Ciao! Benvenut{o|a}! Hai fatto buon viaggio? Sei stanc{o|a}? Hai fame?');
  await say('ezekiel', 'Clara. Lascial{o|a} respirare.', 'stern');
  await say('ezekiel', 'Prima di entrare nella Valle devi conoscere le Regole. Sono tre. Sono semplici.');
  await UI.paper(
    `<h2>Le Regole di Hollowmere</h2><div class="paper"><p><b>I.</b> Il rosso è il colore cattivo. Non raccoglierlo, non indossarlo. <b>Seppelliscilo.</b></p><p><b>II.</b> Non oltrepassare mai il recinto giallo.</p><p><b>III.</b> Quando suona la campana della sera, rientra in casa. <b>E non aprire a nessuno.</b></p></div>`,
    'Ho capito'
  );
  const c = await ask('ezekiel', 'Rispettale, e Hollowmere sarà casa tua. Per sempre.', [
    'Perché il rosso?',
    "Cosa c'è nel bosco?",
    'Va bene.'
  ]);
  await say(
    'ezekiel',
    [
      'Perché è il colore cattivo. Non serve altro.',
      'Niente. E quel niente non va disturbato.',
      '{Bravo ragazzo|Brava ragazza}. Proprio come tuo nonno.'
    ][c],
    c < 2 ? 'stern' : ''
  );
  await say(
    'clara',
    "Ti accompagniamo alla fattoria! È bellissima, vedrai. Un po' polverosa. Il nonno non… insomma. Andiamo!"
  );
  await UI.fade(1, 1000);
  st.flags.arrived = 1;
  ez.script = cl.script = false;
  G.cutMusic = null;
  st.day = 1;
  st.time = 6 * 60;
  morningSetup();
  rebuildMaps();
  snapNPCs();
  spawnCritters();
  G.parts = [];
  G.map = G.maps.house;
  setPos(G.player, 2, 3, 0);
  NET.save(st);
  await UI.card('Capitolo I', 'Il Recinto Giallo', 'Giorno 1 · Autunno', false, true, 1400);
  UI.showHud(true);
  UI.hotbar();
  UI.hud();
  UI.quest();
  updateCam(0);
  await UI.fade(0, 900);
  G.cut--;
  await sleep(300);
  G.cut++;
  await narr('La casa del nonno. Odora di legno, lavanda e di qualcosa di chiuso da tanto tempo.');
  await narr(
    'Fuori ti aspettano i campi. E il villaggio. Esci dalla porta in basso.\n(Muoviti con WASD o il pollice sinistro. E / Spazio / A per agire.)'
  );
  G.cut--;
}
// ---------- giornata ----------
function morningSetup() {
  const st = G.st,
    F = st.flags;
  G.amb = null;
  if (F.ch2end) {
    F.finaleChase = 0;
    if (st.chapter < 3) st.chapter = 3;
  }
  if (F.ch3end && st.chapter < 4) st.chapter = 4;
  if (st.day >= 2) F.bridgeGone = 1;
  if (st.day >= 2 && !F.gotPaint) F.ezWait = 1;
  choreScegli(st);
  st.leaves = [0, 0, 0, 0];
  F.bucket = 0;
  F.barnDark = 0;
  const wr = Math.random();
  st.weather =
    st.day <= 1
      ? 'sereno'
      : wr < 0.45
        ? 'sereno'
        : wr < 0.65
          ? 'nuvoloso'
          : wr < (H2(st) ? 0.85 : 0.8)
            ? 'nebbia'
            : 'pioggia';
  if (isFree(st)) {
    const s = seasonOf(st);
    if (s === 1 && st.weather === 'pioggia') st.weather = 'neve';
    if (s === 2 && st.weather === 'nebbia') st.weather = 'pioggia';
    F.bridgeGone = 0;
  }
  if (st.weather === 'pioggia') for (const k in st.farm) if (!chiaveSerra(k)) st.farm[k].w = true;
  if (H2(st) && F.ch2day && st.day >= F.ch2day + 1) F.page2avail = 1;
  st.bread = 4 + (hearts('clara') >= 3 ? 2 : 0) + (hearts('clara') >= 6 ? 2 : 0);
  st.demand = ['rapa', 'patata', 'zucca'][Math.floor(Math.random() * 3)];
  if (st.day >= 5 && Math.random() < 0.5) st.demand = 'zucca';
  genFavors();
  applyUpgrades();
  freeMorning(st);
  st.map = 'house';
  st.px = 2;
  st.py = 3;
  st.dir = 0;
}
async function morningEvents() {
  const st = G.st,
    F = st.flags;
  G.cut++;
  try {
    if (F.missedOffer && !F.missedShown) {
      F.missedShown = 1;
      F.missedDay = st.day;
      AU.play('scratch');
      await sleep(600);
      await narr('Stanotte qualcosa ha grattato la porta per ore.');
      await narr("Sul legno, all'esterno, lettere incise a unghiate:\nAVEVI DIMENTICATO.", { dark: 1 });
      addQuiete(-15);
    }
    if (H2(st) && !F.ch2card) {
      F.ch2card = 1;
      F.ch2day = st.day;
      await UI.fade(1, 300);
      await UI.card('Capitolo II', 'Quelli di cui non si parla', `Giorno ${st.day}`, false, true, 1400);
      await UI.fade(0, 600);
      await narr('Ti svegli. La casa è silenziosa. Qualcosa è cambiato, ma non sai dire cosa.');
      LS.set('hm_cp2', JSON.stringify(st));
    }
    if (st.chapter >= 3 && !F.ch3card) {
      F.ch3card = 1;
      await UI.fade(1, 300);
      await UI.card('Capitolo III', "L'Albero dei Morti", `Giorno ${st.day}`, false, true, 1400);
      await UI.fade(0, 600);
      await narr('Nessuno parla della notte. Dalla finestra, il villaggio è sereno. Più sereno del solito.');
      await narr(
        "Sulla soglia, piegato con cura, c'è un mantello giallo. Nessun biglietto. Non serve: sai già chi l'ha lasciato. Tutti."
      );
      giveItem('mantello');
      await narr('Le lanterne gialle, ha scritto il nonno, non proteggono: segnano.', { dark: 1 });
      addQuiete(-5);
      LS.set('hm_cp3', JSON.stringify(st));
    }
    if (st.chapter >= 4 && !F.ch4card) {
      F.ch4card = 1;
      F.ch4day = st.day;
      await UI.fade(1, 300);
      await UI.card('Capitolo IV', 'La Festa del Raccolto', `Giorno ${st.day}`, false, true, 1400);
      await UI.fade(0, 600);
      await narr(
        "Le campane suonano da sole, all'alba. In piazza qualcuno canta. Nessuno, nella Valle, ha dormito."
      );
      await narr(
        "Sul vetro della finestra, dall'esterno, c'è l'impronta di una mano. Non è piccola. Non è tua.",
        { dark: 1 }
      );
      await narr('Oggi è il giorno della Festa. Alle sette, in piazza. Ti aspettano tutti.', { dark: 1 });
      addQuiete(-5);
    }
    {
      const N = G.farmNews || {};
      G.farmNews = null;
      const pl = (n, a, b) => (n === 1 ? a : n + ' ' + b);
      if (N.wilt) {
        UI.toast(
          `${pl(N.wilt, 'Una pianta è appassita', 'piante sono appassite')}: troppe notti senz'acqua.`,
          'bad'
        );
        tip(
          'tutWilt',
          "Le piante bagnate crescono di una tacca ogni notte. Due notti all'asciutto e appassiscono: annaffiale per salvarle, o toglile con la zappa e ripianta."
        );
      }
      if (N.ripe)
        UI.toast(
          `Stanotte ${pl(N.ripe, 'una pianta è maturata', 'piante sono maturate')}! Mettiti davanti e premi A/E per raccogliere.`
        );
      else if (Object.values(st.farm).some(f => f.c && cropStage(f.c) === 3))
        UI.toast('Qualcosa è maturo nei campi! Mettiti davanti alla pianta e premi A/E per raccoglierla.');
      else if (N.grow) UI.toast(`Stanotte ${pl(N.grow, 'una pianta è cresciuta', 'piante sono cresciute')}.`);
    }
    if (G.seasonNews) {
      const N = G.seasonNews;
      G.seasonNews = null;
      UI.toast(
        [
          "È arrivato l'autunno.",
          "È arrivato l'inverno. Cresce solo il porro.",
          'È arrivata la primavera!',
          "È arrivata l'estate!"
        ][N.s]
      );
      if (N.n)
        UI.toast(
          `${N.n === 1 ? 'Una coltura non ha retto' : N.n + ' colture non hanno retto'} al cambio di stagione.`,
          'bad'
        );
    }
    if (isFree(st)) {
      shadowNews();
      bdayMorning(st);
      festMorning(st);
    }
    if (st.weather === 'neve') UI.toast('Nevica. La Valle è bianca e silenziosa.');
    if (st.weather === 'pioggia') UI.toast('Piove. I campi si annaffiano da soli.');
    else if (st.weather === 'nebbia') UI.toast('Nebbia fitta sulla Valle.');
    if (isSunday(st)) UI.toast("È domenica: alle 9:00 c'è la messa, in cappella.");
    if (FEST_MORNING[st.day]) setTimeout(() => UI.toast(FEST_MORNING[st.day]), 1400);
    if ((st.favors || []).length && !F.favTip) {
      F.favTip = 1;
      setTimeout(
        () =>
          UI.toast(
            'Alcuni abitanti cercano qualcosa: guarda il "!" sopra le loro teste, o la bacheca in piazza.'
          ),
        2400
      );
    }
    if (F.page2avail && !F.page2 && !F.page2seen) {
      F.page2seen = 1;
      await narr(
        "Sul pavimento, vicino alla porta, c'è un foglio. Qualcuno l'ha fatto scivolare sotto l'uscio, stanotte."
      );
    }
  } finally {
    G.cut--;
  }
  UI.quest();
}
async function endDay(passed, faded) {
  if (G.visit) await endVisit(true);
  const st = G.st;
  G.cut++;
  try {
    if (!faded) {
      AU.play('sleep');
      await UI.fade(1, 900);
    }
    G.horse.on = false;
    G.chase = false;
    G.cutMusic = null;
    G.scare = 0;
    const news = { grow: 0, ripe: 0, wilt: 0, dead: 0 };
    for (const k in st.farm) {
      const f = st.farm[k],
        c = f.c;
      if (c && !c.dead && cropStage(c) < 3) {
        if (f.w) {
          c.a++;
          if (isFree(st) && skLv('agri', st) >= 10 && Math.random() < 0.2 && c.a < CROPS[c.t].days) c.a++;
          c.dry = 0;
          news.grow++;
          if (cropStage(c) === 3) news.ripe++;
        } else if (c.a > 0) {
          c.dry = (c.dry || 0) + 1;
          c.bad = 1;
          if (c.dry === 2) news.wilt++;
        }
      }
      f.w = false;
      if (!c && !f.f && Math.random() < 0.08) delete st.farm[k];
    }
    G.farmNews = news;
    const pay = st.shipped.reduce((a, [id, n, v]) => a + (v ?? sellPrice(id) * n), 0);
    st.money += pay;
    st.shipped = [];
    const prevS = seasonOf(st);
    st.day++;
    freeNight(st, prevS);
    st.time = 6 * 60;
    st.energy = passed ? 60 : 100;
    if (!passed) addQuiete(H2(st) ? 6 : 10);
    st.talked = {};
    st.gifted = {};
    // la scheda del nuovo giorno compare subito: il lavoro sotto (mappe, salvataggio) si fa mentre la si legge
    const dayCard = UI.card(
      '',
      isFree(st) ? `${seasonName()} · giorno ${seasonDay()}` : `Giorno ${st.day}`,
      `${isFree(st) ? DAYN[(st.day + 3) % 7] + (yearOf() > 1 ? ' · anno ' + yearOf() : '') : DAYN[(st.day + 3) % 7] + ' · Autunno'}${pay ? ` · Spedizione: +${SC(pay)}` : ''}`,
      false,
      false,
      1300
    );
    await sleep(30);
    morningSetup();
    rebuildMaps();
    snapNPCs();
    spawnCritters();
    st.flags.pettedToday = 0;
    G.parts = [];
    G.map = G.maps.house;
    setPos(G.player, 2, 3, 0);
    NET.save(st);
    UI.hud();
    UI.quest();
    UI.hotbar();
    await dayCard;
    updateCam(0);
    await UI.fade(0, 800);
  } finally {
    G.cut--;
  }
  await morningEvents();
}
async function rest(min, outside) {
  const st = G.st;
  const target = Math.min(st.time + min, 20 * 60 + 30);
  if (target <= st.time) return;
  G.cut++;
  try {
    await UI.fade(1, 500);
    const h = (target - st.time) / 60;
    while (st.time < target) {
      st.time++;
      onMinute();
    }
    st.energy = Math.min(100, st.energy + Math.round(h * (outside ? 6 : 12)));
    snapNPCs();
    G.parts = [];
    UI.hud();
    UI.quest();
    await sleep(250);
    await UI.fade(0, 600);
    UI.toast(
      `${outside ? 'Hai aspettato' : 'Hai riposato'}. Sono le ${Math.floor(st.time / 60)}:${String(st.time % 60).padStart(2, '0')}.`
    );
  } finally {
    G.cut--;
  }
}
async function passOut() {
  if (G.cut) return;
  G.cut++;
  await narr('Sono le due di notte. Crolli dal sonno dove ti trovi.');
  G.cut--;
  await endDay(true);
}
async function caught() {
  const F = G.st.flags;
  F.caughtDay = G.st.day;
  if (G.festaChase) {
    G.festaChase = false;
    G.chase = false;
    festaGo(() => ending2(true, 'chase'));
    return;
  }
  G.cut++;
  G.chase = false;
  AU.play('scream');
  G.scare = 1.6;
  G.shake = 8;
  await sleep(1400);
  if (F.finaleChase && !F.ch2end) {
    G.cut--;
    return gameOver();
  }
  await UI.fade(1, 600);
  G.scare = 0;
  await UI.card(
    '',
    '…',
    'Ti risvegli nel tuo letto. Non ricordi come ci sei arrivat{o|a}.<br>Hai le unghie piene di terra.',
    true,
    true,
    1200
  );
  G.st.money = Math.floor(G.st.money * 0.8);
  addQuiete(-25);
  G.cut--;
  await endDay(true, true);
}
async function gameOver() {
  G.cut++;
  await UI.fade(1, 500);
  G.scare = 0;
  await UI.card(
    'Fine',
    'Hollowmere ti ha contat{o|a}.',
    'Il Cavaliere non perdona chi corre piano.<br>Riprova dalla porta del fienile.',
    true,
    true,
    1500
  );
  G.st = JSON.parse(G.checkpoint);
  G.st.flags.finaleChase = 1;
  G.st.flags.barnEvent = 1;
  G.st.flags.barnDark = 1;
  rebuildMaps();
  snapNPCs();
  G.map = G.maps.main;
  setPos(G.player, 58, 31, 0);
  updateCam(0);
  UI.hud();
  UI.quest();
  UI.hotbar();
  await UI.fade(0, 500);
  spawnHorse(44, 40, 60);
  G.cut--;
}
// punto di estensione: i file caricati prima di main.js cambiano mappa con Ext.intercetta('vaiMappa', id, x, y, dir)
Ext.on('vaiMappa', (id, tx, ty, dir, quick) => goMap(id, tx, ty, dir, quick));
async function goMap(id, tx, ty, dir = 0, quick) {
  G.cut++;
  try {
    AU.play('door');
    await UI.fade(1, quick ? 150 : 260);
    if (id !== 'main') {
      G.horse.on = false;
      if (!G.st.flags.finaleChase || G.st.flags.ch2end) G.chase = false;
    }
    G.map = G.maps[id];
    G.st.map = id;
    G.parts = [];
    setPos(G.player, tx, ty, dir);
    updateCam(0);
    await UI.fade(0, quick ? 150 : 260);
  } finally {
    G.cut--;
  }
  await onEnter(id);
}
async function onEnter(id) {
  const st = G.st,
    F = st.flags;
  if (id === 'house' && F.finaleChase && !F.ch2end) return finale();
  if (id === 'house' && F.vespro && !F.ch1end) return ch1End();
  if (id === 'main' && F.ezWait && st.time < 20 * 60 && Math.hypot(G.player.x - 168, G.player.y - 174) < 40) {
    G.cut++;
    try {
      const ez = NPC('ezekiel');
      await sleep(400);
      ez.dir = 3;
      await ezekielPaint(ez);
    } finally {
      G.cut--;
    }
  }
  if (
    id === 'chapel' &&
    st.day >= 3 &&
    st.chapter <= 1 &&
    !F.vespro &&
    st.time >= 18 * 60 &&
    st.time <= 19 * 60 + 30
  )
    return vespro();
  if (id === 'barn' && st.chapter >= 3 && !F.tobiaScene) {
    G.cut++;
    try {
      await tobiaCostumeScene();
    } finally {
      G.cut--;
    }
  }
  if (id === 'barn' && !F.barnIn) {
    F.barnIn = 1;
    G.cut++;
    await narr('Dentro puzza di cera, di fieno… e di stalla.');
    await narr('Ma a Hollowmere non ci sono cavalli.');
    G.cut--;
  }
}
// ---------- Vespro ----------
async function vespro() {
  const st = G.st,
    F = st.flags;
  G.cut++;
  F.vespro = 1;
  G.cutMusic = 'silent';
  const seats = {
    ezekiel: [2, 4, 3],
    agatha: [3, 4, 3],
    brom: [10, 4, 3],
    clara: [11, 4, 3],
    tobia: [10, 6, 3],
    lucius: [7, 3, 0]
  };
  for (const k in seats) {
    const n = NPC(k);
    n.script = true;
    placeNPC(n, 'chapel', ...seats[k]);
  }
  await walkPlayer(6, 7);
  G.player.dir = 3;
  await say('lucius', "Benvenut{o|a} al Vespro, {n}. Siediti dove vuoi. Qui c'è sempre posto.");
  await say('lucius', 'Come ogni sera di raccolto, ci contiamo. Così sappiamo di esserci tutti.');
  const order = ['ezekiel', 'agatha', 'brom', 'clara', 'tobia'];
  for (let i = 0; i < order.length; i++) {
    const n = NPC(order[i]);
    AU.play('count');
    floatText(String(i + 1), n.x, n.y - 30, '#fff4c0', 2.2);
    await sleep(700);
  }
  AU.play('count');
  floatText('6', G.player.x, G.player.y - 30, '#fff4c0', 2.2);
  await say('lucius', 'E tu fai sei.');
  const lu = NPC('lucius');
  AU.play('count');
  floatText('7', lu.x, lu.y - 30, '#fff4c0', 2);
  await say('lucius', 'E io, sette.');
  await sleep(900);
  const fl = NPC('faceless');
  fl.script = true;
  placeNPC(fl, 'chapel', 11, 8, 3);
  AU.play('wrongcount');
  floatText('8', fl.x, fl.y - 30, '#ff6a5a', 3);
  G.glitch = 10;
  await sleep(1300);
  NPC('tobia').dir = 0;
  AU.play('laugh');
  await say('tobia', 'Hihi. Otto.', 'dark');
  await say('lucius', '…Otto.', 'dark');
  G.player.dir = 2;
  await sleep(500);
  await narr('Ti giri verso il fondo della cappella.');
  await narr(
    "Sull'ultima panca siede qualcuno. Non ha la faccia. Non ha niente, dove dovrebbe esserci una faccia.",
    { dark: 1 }
  );
  AU.play('sting');
  G.flash = { a: 1, c: '#000' };
  fl.hidden = true;
  fl.script = true;
  fl.map = 'none';
  await sleep(900);
  await say('ezekiel', 'Lucius ha sbagliato i conti. Succede, quando si invecchia.', 'stern');
  await say('lucius', 'Otto. Come ogni anno, a questo punto.', 'dark');
  await say('ezekiel', 'Andate a casa. Tutti. La campana suonerà presto.', 'stern');
  addQuiete(-20);
  for (const k in seats) NPC(k).script = false;
  setPos(G.player, 7, 8, 0);
  G.cutMusic = null;
  G.cut--;
  UI.quest();
}
// ---------- fine Capitolo I ----------
async function ch1End() {
  const st = G.st,
    F = st.flags;
  G.cut++;
  G.cutMusic = 'silent';
  await sleep(900);
  AU.play('hooves');
  await narr('Fuori, zoccoli. Girano attorno alla casa.');
  await sleep(500);
  AU.play('hooves');
  await narr('Una volta. Due volte. Tre.');
  await sleep(400);
  AU.play('knock');
  G.shake = 3;
  await sleep(1200);
  const c = await ask('voce', '{n}… sono io. Il nonno. Fa tanto freddo, qui fuori. Aprimi.', [
    'Apri la porta',
    'Non aprire'
  ]);
  if (c === 0) {
    await sleep(300);
    AU.play('scream');
    G.scare = 1.5;
    G.shake = 7;
    await sleep(1700);
    await narr("Non c'è nessuno.");
    await narr('Sulla soglia, quattro impronte di zoccoli bruciate nel legno. Ancora fumano.', { dark: 1 });
    addQuiete(-25);
  } else {
    await sleep(800);
    AU.play('laugh');
    await narr('Silenzio. Poi una risata bassa, che non è quella del nonno.');
    await narr('Il nonno non ha mai bussato così.');
    addQuiete(-10);
  }
  AU.play('page');
  await narr('Da sotto la porta scivola un pezzo di carta. Una sola riga:\n«Uno di troppo.»', { dark: 1 });
  await UI.fade(1, 800);
  await UI.card(
    'Fine del Capitolo I',
    'Il Recinto Giallo',
    'Hai rispettato le regole.<br>Le regole non rispetteranno te.',
    false,
    true,
    1800
  );
  F.ch1end = 1;
  st.chapter = 2;
  G.cutMusic = null;
  G.cut--;
  await endDay(false, true);
}
// ---------- finale Capitolo II ----------
async function finale() {
  const st = G.st,
    F = st.flags;
  G.cut++;
  G.chase = false;
  G.horse.on = false;
  G.cutMusic = 'silent';
  F.ch2end = 1;
  F.finaleChase = 0;
  AU.play('slam');
  G.shake = 5;
  await narr('Sbatti la porta e ci appoggi la schiena. Il cuore ti batte in gola.');
  await sleep(800);
  AU.play('hooves');
  await sleep(1800);
  await narr('Gli zoccoli si fermano. Proprio davanti alla porta.');
  await sleep(1200);
  AU.play('knock');
  await sleep(1000);
  await say('voce', 'Hai letto il mio nome, vero, {n}? Elias Marlowe. Risparmiato.');
  await say('voce', 'Non avere paura. Non è colpa tua. Non è nemmeno colpa mia.');
  G.glitch = 10;
  AU.play('whisper');
  await say('voce', 'Alla Festa del Raccolto saremo di nuovo insieme. Uno del mio sangue.', null, {
    dark: 1
  });
  AU.play('sting');
  G.scare = 0.9;
  await sleep(1200);
  await UI.fade(1, 900);
  await UI.card(
    'Fine del Capitolo II',
    'Quelli di cui non si parla',
    'Il costume era vuoto.<br>Il Cavaliere no.',
    true,
    true,
    2000
  );
  G.cutMusic = null;
  G.cut--;
  await endDay(false, true);
}
// ---------- tempo ----------
function clock(dt) {
  // con la schermata di una macchina aperta il tempo scorre (si vede la freccia che si riempie)
  if (G.cut || (UI.busy() && !(G.macGui && UI.modalOpen && !UI.dlgOpen))) return;
  G.clockAcc += dt / (festaLive() ? 2.2 : 1);
  while (G.clockAcc >= SEC_PER_MIN) {
    G.clockAcc -= SEC_PER_MIN;
    G.st.time++;
    onMinute();
  }
}
function onMinute() {
  const st = G.st,
    t = st.time,
    F = st.flags;
  if (st.day < 1) return;
  if (t % 10 === 0) UI.hud();
  if (t === 12 * 60 && !(st.chore === 'campana' && st.choreOk)) {
    AU.play('bell');
    if (G.map.id === 'main') UI.toast('🔔 Mezzogiorno. Fratello Lucius suona la campana.');
  }
  if (t === 21 * 60) {
    AU.play('bell');
    AU.play('bell', 1.7);
    AU.play('bell', 3.4);
    if (isFree(st)) UI.toast('🔔 La campana delle nove. Ormai suona per abitudine.');
    else if (!festaPending()) UI.toast('🔔 La campana della sera. Rientra a casa.', 'bad');
  }
  if (t === 18 * 60 && F.gotBread && !F.offered) UI.toast("Il sole cala. È l'ora del ceppo.");
  if (t === 20 * 60 + 31 && F.gotBread && !F.offered && !F.missedOffer) {
    F.missedOffer = 1;
    UI.quest();
  }
  const out = G.map.id === 'main';
  if (isSunday(st) && t === 8 * 60 + 45) {
    AU.play('bell');
    AU.play('bell', 1.7);
    if (out) UI.toast('🔔 La campana chiama alla messa.');
  }
  for (let i = 5; i < LAMPS.length; i++)
    if (
      t === LAMPT.on[i] &&
      out &&
      Math.hypot(G.player.x - LAMPS[i][0] * 16, G.player.y - LAMPS[i][1] * 16) < 220
    ) {
      burst('spark', LAMPS[i][0] * 16 + 8, LAMPS[i][1] * 16 - 18, 7, '#ffcf6a');
      tip('tipLamp', "Il lampione si è acceso da solo. Nessuno l'ha toccato.");
    }
  if (out && t > 21 * 60 + 30 && t % 10 === 0 && !F.finaleChase && !isFree(st)) addQuiete(-1);
  if (out && t === 22 * 60 && !G.horse.on && !F.finaleChase && !festaPending() && !isFree(st)) {
    AU.play('hooves');
    UI.toast('Zoccoli. Lontani. Poi meno lontani.', 'bad');
  }
  if (out && t >= 22 * 60 + 30 && !G.horse.on && !G.cut && !F.finaleChase && !festaPending() && !isFree(st)) {
    const p = G.player;
    const far = Math.hypot(p.x - 31 * 16, p.y - 5 * 16) > 120;
    spawnHorse(far ? 31 : 52, far ? 5 : 36, 54);
    UI.toast('CORRI A CASA.', 'bad');
  }
  if (t >= 26 * 60) passOut();
}
// il brano giusto per il momento (i brani sono in musica.js). «|casa» e «|nebbia» cambiano solo il colore del suono
const MUS_STAGIONE = ['autunno', 'inverno', 'primavera', 'estate'];
function chooseMusic() {
  if (G.mode === 'title') return 'titolo';
  if (G.cutMusic) return { title: 'titolo', tense: 'inseguimento' }[G.cutMusic] || G.cutMusic;
  if (G.chase) return 'inseguimento';
  const m = G.map,
    st = G.st;
  if (!m || !st) return 'none';
  if (m.id === 'barn') return 'fienile';
  if (m.id === 'wood') return 'bosco';
  if (m.id === 'miniera') return 'miniera';
  if (m.id === 'chapel') return 'cappella';
  const t = st.time,
    F = st.flags || {};
  // la Festa del Raccolto, nella storia
  if (
    !isFree(st) &&
    st.chapter >= 4 &&
    F.ch4day === st.day &&
    !F.festaDone &&
    t >= 18 * 60 + 30 &&
    !m.interior
  )
    return 'raccolto';
  if (m.id === 'main' && typeof festLive === 'function' && festLive(st)) return 'festa';
  const notte = t >= 20 * 60 || t < 5 * 60 + 30 || G.horror > 0.7;
  const stag = MUS_STAGIONE[seasonOf(st)] || 'autunno';
  if (m.interior) return (notte ? 'notte' : st.weather === 'pioggia' ? 'pioggia' : stag) + '|casa';
  if (notte) return 'notte';
  if (t >= 18 * 60) return 'vespro';
  if (st.weather === 'pioggia') return 'pioggia';
  return st.weather === 'nebbia' ? stag + '|nebbia' : stag;
}
function updHorror(dt) {
  const st = G.st;
  if (!st) return;
  let h = ((100 - st.quiete) / 100) * 0.75;
  if (H2(st)) h += 0.12;
  if (G.map && G.map.id === 'main') h += G.night * 0.1;
  if (G.chase) h += 0.2;
  if (G.map && G.map.id === 'wood') h += 0.25;
  if (G.mode === 'title') h = 0.05;
  G.horror = lerp(G.horror, clamp(h, 0, 1), Math.min(1, dt * 0.8));
}
// ---------- loop ----------
let _last = performance.now(),
  _hudT = 0;
function update(dt) {
  const frozen = UI.modalOpen;
  if (!frozen) {
    updatePlayer(dt);
    if (!UI.dlgOpen) {
      for (const n of G.npcs) updateNPC(n, dt);
      npcBarks(dt);
      updChats(dt);
    }
    updCritters(dt);
    ambTick(dt);
    animalsTick(dt);
    mpTick(dt);
    shadowTick(dt);
    merchantCoach();
    woodTick(dt);
    festaTick(dt);
    if (G.st.weather === 'pioggia' && !G.map.interior && !G.cut && Math.random() < dt * 0.01) {
      G.flash = { a: 0.5, c: '#dfe8ff' };
      AU.play('thunder', 0.5);
    }
    if (!G.cut && !UI.dlgOpen) updateHorse(dt);
    clock(dt);
  } else if (G.macGui) clock(dt);
  updParts(dt);
  updPrints(dt);
  if (G.map) updateCam(dt);
  updHorror(dt);
  G.flash.a = Math.max(0, G.flash.a - dt * 1.5);
  G.scare = Math.max(0, G.scare - dt * 0.7);
  _hudT -= dt;
  if (_hudT <= 0) {
    _hudT = 0.5;
    UI.hud();
    UI.quest();
  }
}
function updateTitle(dt) {
  if (G.critters) updCritters(dt);
  const t = G.t;
  G.cam.x = 300 + Math.sin(t * 0.05) * 260;
  G.cam.y = 150 + Math.sin(t * 0.031) * 90;
  G.st.time = 19 * 60 + 10;
  updParts(dt);
}
function loop(now) {
  const dt = Math.min(0.05, (now - _last) / 1000);
  _last = now;
  G.t += dt;
  try {
    if (G.mode === 'game' && G.map) update(dt);
    else if (G.mode === 'title') updateTitle(dt);
    render();
  } catch (e) {
    console.error(e);
  }
  try {
    AU.setMode(chooseMusic());
    AU.tick();
  } catch (e) {
    segnala(e, 'main');
  }
  requestAnimationFrame(loop);
}
// il caricamento: le candele sotto il titolo si accendono man mano, la frase dice cosa si sta svegliando
function caricamento(frac, frase) {
  const C = document.querySelectorAll('#candele i'),
    n = Math.round(frac * C.length);
  C.forEach((c, i) => c.classList.toggle('on', i < n));
  if (frase) $('#lfrase').textContent = frase + '…';
}
// un fotogramma allo schermo: senza, la pagina resterebbe ferma finché non è pronta tutta la grafica
const respira = () =>
  new Promise(r => {
    let fatto = false;
    const fine = () => fatto || ((fatto = true), r());
    requestAnimationFrame(() => setTimeout(fine, 0));
    setTimeout(fine, 80);
  });
async function boot() {
  caricamento(0, 'si accendono le candele');
  try {
    await Promise.race([document.fonts.ready, sleep(2500)]);
  } catch (e) {
    atteso(e);
  }
  // la grafica si fa a passi (prima quella del gioco, poi quella dei file aggiunti, punto 'arte'): tra un passo
  // e l'altro le candele si accendono e lo schermo respira
  const arte = (Ext._h.arte || []).slice(),
    // [frase, lavoro, peso]: il peso è quanto dura più o meno quel passo, così le candele avanzano regolari
    passi = [
      ['si accendono le case', genAll, 430],
      ['la Valle si stende tra i colli', genFreeArt, 250],
      ['le bestie aprono gli occhi', genAnimalArt, 25],
      ['la bacheca si riempie', genMissionArt, 2],
      ['i muri si raddrizzano', genBuildArt, 5],
      ["l'orto apre le foglie", genGardenArt, 90],
      ['il forno si scalda', genDishArt, 20],
      ['si appendono le ghirlande', genFestArt, 6],
      ['le macchine sbuffano', genFarm2Art, 40],
      ['il mercante conta le monete', genTradeArt, 6],
      ...arte.map((f, i) =>
        i === arte.length - 1 ? ['scende la nebbia', f, 200] : ['si dipingono le ombre', f, 25]
      )
    ],
    tot = passi.reduce((a, p) => a + p[2], 0);
  let fatto = 0;
  caricamento(0, passi[0][0]);
  await respira();
  let ultimo = performance.now();
  for (let i = 0; i < passi.length; i++) {
    passi[i][1]();
    fatto += passi[i][2];
    if (performance.now() - ultimo > 30 || i === passi.length - 1) {
      caricamento(fatto / tot, passi[Math.min(i + 1, passi.length - 1)][0]);
      await respira();
      ultimo = performance.now();
    }
  }
  initEntities();
  UI.init();
  NET.init();
  toTitle();
  $('#loading').classList.add('hide');
  requestAnimationFrame(loop);
}
boot();
