'use strict';
// ================= L'ASPETTO DEL PERSONAGGIO =================
// ☰ → Aspetto: taglio e colore dei capelli, barba, maglia, gilet/vestito/mantello/grembiule, pantaloni, scarpe,
// cappello, con l'anteprima. I colori sono una tavolozza: alcuni ci sono già, altri si comprano da Agatha
// («Abiti e cappelli»), quelli speciali si tessono al telaio con fibra e un colorante naturale (o raro).
// Gli altri giocatori online ti vedono così (presenza: lk).

const COLORI = {
  crema: ['Crema', '#e9dcc0'],
  blu: ['Blu', '#4f6fa8'],
  marrone: ['Marrone', '#5a4632'],
  cuoio: ['Cuoio', '#3a2616'],
  bosco: ['Verde bosco', '#3e6a3a'],
  vino: ['Rosso vino', '#8a3a3a'],
  grigio: ['Grigio', '#6a6a72'],
  sabbia: ['Sabbia', '#c8b48a'],
  // da Agatha
  cielo: ['Azzurro cielo', '#7ab0e0'],
  menta: ['Menta', '#8ad0a8'],
  lavanda: ['Lavanda', '#b8a0d8'],
  senape: ['Senape', '#c8a03a'],
  corallo: ['Corallo', '#e8806a'],
  bianco: ['Bianco', '#f4f0e8'],
  carbone: ['Carbone', '#2a2a30'],
  petrolio: ['Petrolio', '#2a5a6a'],
  // al telaio
  rosso: ['Rosso pomodoro', '#d03a2a'],
  notte: ['Blu notte', '#2a3a7a'],
  viola: ['Viola barbabietola', '#7a2a6a'],
  sole: ['Giallo sole', '#f0c83a'],
  prato: ['Verde prato', '#5aa83a'],
  arancio: ['Arancio', '#e8802a'],
  rosa: ['Rosa fragola', '#f08aa8'],
  ombra: ["Nero d'ombra", '#141018'],
  oro: ['Oro', '#e8b830'],
  argento: ['Argento', '#c8ccd4']
};
const CAPELLI = {
  castano: '#6b3e1f',
  rame: '#8a3f1c',
  biondo: '#d8b04a',
  nero: '#1a1416',
  grigio: '#a8a29a',
  bianco: '#ecebef',
  blu: '#3a5a9a',
  verde: '#3a7a4a',
  rosa: '#d878a0',
  viola: '#7a4aa8'
};
const CAPELLI_BASE = ['castano', 'rame', 'biondo', 'nero', 'grigio', 'bianco'];
const STILI = { short: 'Corti', long: 'Lunghi', bun: 'Raccolti', messy: 'Spettinati', bald: 'Rasati' };
const SOPRA = { none: 'Solo maglia', vest: 'Gilet', dress: 'Vestito', cape: 'Mantello', apron: 'Grembiule' };
const CAPPELLI = { none: 'Nessuno', cap: 'Berretto', bonnet: 'Cuffia', tall: 'Cilindro' };
const BOTTEGA = [
  ['col:cielo', 150],
  ['col:menta', 150],
  ['col:lavanda', 180],
  ['col:senape', 150],
  ['col:corallo', 200],
  ['col:bianco', 200],
  ['col:carbone', 220],
  ['col:petrolio', 220],
  ['top:cape', 600],
  ['top:apron', 250],
  ['hat:cap', 200],
  ['hat:bonnet', 300],
  ['hat:tall', 500],
  ['hair:blu', 350],
  ['hair:verde', 350],
  ['hair:rosa', 350],
  ['hair:viola', 350]
];
const TELAIO = [
  ['rosso', 'pomodoro', 3],
  ['notte', 'more', 3],
  ['viola', 'barbabietola', 3],
  ['sole', 'camomilla', 3],
  ['prato', 'spinaci', 3],
  ['arancio', 'carota', 3],
  ['rosa', 'fragola', 3],
  ['ombra', 'essenza', 1],
  ['oro', 'oro', 1],
  ['argento', 'nichel', 1]
];
const avSt = () => (G.visit ? G.home : G.st);
function avOwn(st) {
  st = st || avSt();
  const a = (st.avatarOwn = st.avatarOwn || {});
  a.col = a.col || {};
  a.top = a.top || {};
  a.hat = a.hat || {};
  a.hair = a.hair || {};
  for (const k of ['crema', 'blu', 'marrone', 'cuoio', 'bosco', 'vino', 'grigio', 'sabbia']) a.col[k] = 1;
  a.top.none = a.top.vest = a.top.dress = 1;
  a.hat.none = 1;
  for (const k of CAPELLI_BASE) a.hair[k] = 1;
  return a;
}
function avDefault(st) {
  const f = st.g === 'f';
  return {
    style: f ? 'long' : 'short',
    hair: f ? 'rame' : 'castano',
    beard: false,
    shirt: 'crema',
    top: f ? 'dress' : 'vest',
    topCol: 'blu',
    pants: f ? 'sabbia' : 'marrone',
    shoe: 'cuoio',
    hat: 'none',
    hatCol: 'marrone'
  };
}
const avOf = st => Object.assign(avDefault(st), st.avatar || {});
// dall'aspetto scelto ai colori del disegno
function avLook(g, a) {
  const L = Object.assign({}, PLAYER_LOOKS[g === 'f' ? 'f' : 'm']);
  delete L.vest;
  delete L.dress;
  delete L.cape;
  delete L.apron;
  L.style = a.style;
  L.hair = CAPELLI[a.hair] || L.hair;
  L.shirt = (COLORI[a.shirt] || [])[1] || L.shirt;
  L.pants = (COLORI[a.pants] || [])[1] || L.pants;
  L.shoe = (COLORI[a.shoe] || [])[1] || L.shoe;
  const tc = (COLORI[a.topCol] || [])[1] || '#4f6fa8';
  if (a.top === 'vest') L.vest = tc;
  if (a.top === 'dress') L.dress = tc;
  if (a.top === 'cape') {
    L.cape = tc;
    L.capeLen = 12;
  }
  if (a.top === 'apron') L.apron = tc;
  if (a.beard) L.beard = L.hair;
  if (a.hat && a.hat !== 'none') {
    L.hat = a.hat;
    L.hatCol = (COLORI[a.hatCol] || [])[1] || '#5a4632';
    L.hatBand = '#c8a03a';
  }
  return L;
}
// il proprio personaggio (solo nella Valle: la storia resta com'era)
let AV_LAST = '';
{
  const _as = applySeasonLooks;
  applySeasonLooks = function () {
    const was = LOOK_SEASON;
    _as();
    const st = avSt();
    if (!st || !isFree(st) || !st.avatar) {
      AV_LAST = '';
      return;
    }
    const s = seasonOf(st),
      key = s + '|' + JSON.stringify(avOf(st));
    if (was === LOOK_SEASON && key === AV_LAST) return;
    AV_LAST = key;
    const extra = (SEASON_LOOK[s] || {}).player || {};
    LOOKS.player = Object.assign(
      {},
      avLook(st.g, avOf(st)),
      extra.cape && avOf(st).top !== 'cape' ? { cape: extra.cape, capeLen: extra.capeLen } : {}
    );
    delete SHEET.player;
    for (const k in PORT) if (k.startsWith('player|')) delete PORT[k];
  };
}
function avApply() {
  LOOK_SEASON = -1;
  AV_LAST = '';
  applySeasonLooks();
}
// ---------- ☰ → Aspetto ----------
function aspettoHTML(st) {
  const a = avOf(st),
    O = avOwn(st);
  const sw = (cat, key, col, on, lab) =>
    `<button class="btn sw${on ? ' on' : ''}" data-av="${cat}" data-v="${key}" title="${esc(lab)}" style="background:${col}"></button>`;
  const pal = cat =>
    Object.keys(O.col)
      .filter(k => COLORI[k])
      .map(k => sw(cat, k, COLORI[k][1], a[cat] === k, COLORI[k][0]))
      .join('');
  const opts = (cat, M, own) =>
    Object.entries(M)
      .filter(([k]) => !own || own[k])
      .map(
        ([k, n]) =>
          `<button class="btn${a[cat] === k ? ' on' : ''}" data-av="${cat}" data-v="${k}">${n}</button>`
      )
      .join(' ');
  return `<div class="avbox"><div class="avprev"><canvas id="avP" width="36" height="54"></canvas><canvas id="avF" width="64" height="64"></canvas><p class="small">${esc(st.name)}</p></div><div class="avopts">
  <h3>Capelli</h3><p>${opts('style', STILI)}</p><p>${Object.keys(O.hair)
    .filter(k => CAPELLI[k])
    .map(k => sw('hair', k, CAPELLI[k], a.hair === k, k))
    .join(
      ''
    )}</p><p><button class="btn${a.beard ? ' on' : ''}" data-av="beard" data-v="${a.beard ? '' : '1'}">Barba</button></p>
  <h3>Maglia</h3><p>${pal('shirt')}</p>
  <h3>Sopra</h3><p>${opts('top', SOPRA, O.top)}</p>${a.top !== 'none' ? `<p>${pal('topCol')}</p>` : ''}
  <h3>Pantaloni</h3><p>${pal('pants')}</p><h3>Scarpe</h3><p>${pal('shoe')}</p>
  <h3>Cappello</h3><p>${opts('hat', CAPPELLI, O.hat)}</p>${a.hat !== 'none' ? `<p>${pal('hatCol')}</p>` : ''}
  <p class="small">Colori e cappelli nuovi: da Agatha («Abiti e cappelli»). Colori speciali: al telaio, che si costruisce al banco da lavoro.</p></div></div>`;
}
function aspettoWire(st, again) {
  const box = $('#mbox');
  const pv = () => {
    const L = avLook(st.g, avOf(st)),
      c = $('#avP');
    if (c) {
      const x = c.getContext('2d');
      x.clearRect(0, 0, 36, 54);
      heroFrame(L, 0, null, 0, false).put(x, 0, 0);
    }
    const f = $('#avF');
    if (f) {
      const k = '__av';
      LOOKS[k] = L;
      delete PORT[k + '|'];
      const x = f.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, 64, 64);
      x.drawImage(portrait(k, ''), 0, 0);
    }
  };
  pv();
  box.querySelectorAll('[data-av]').forEach(
    b =>
      (b.onclick = () => {
        const a = avOf(st),
          k = b.dataset.av,
          v = b.dataset.v;
        a[k] = k === 'beard' ? !!v : v;
        st.avatar = a;
        AU.play('ui');
        avApply();
        NET.save(st);
        again();
      })
  );
}
{
  const _p = UI.pause.bind(UI);
  UI.pause = function (tab) {
    _p(tab === 'aspetto' ? 'diario' : tab);
    const st = avSt();
    if (!st || !isFree(st) || !UI.modalOpen) return;
    const tb = $('#mbox .tabs');
    if (!tb) return;
    const b = document.createElement('button');
    b.className = 'btn' + (tab === 'aspetto' ? ' on' : '');
    b.textContent = 'Aspetto';
    b.onclick = () => {
      AU.play('ui');
      UI._mclose = null;
      UI.pause('aspetto');
    };
    tb.insertBefore(b, tb.children[1] || null);
    if (tab === 'aspetto') {
      tb.querySelectorAll('.btn').forEach(x => x.classList.toggle('on', x === b));
      while (tb.nextSibling) tb.nextSibling.remove();
      const d = document.createElement('div');
      d.innerHTML = aspettoHTML(st);
      tb.after(d);
      aspettoWire(st, () => {
        UI._mclose = null;
        UI.pause('aspetto');
      });
    }
  };
}

// ---------- da Agatha: abiti e cappelli ----------
const bottegaNome = ([k]) => {
  const [c, v] = k.split(':');
  return c === 'col'
    ? 'Tinta ' + COLORI[v][0].toLowerCase()
    : c === 'top'
      ? SOPRA[v]
      : c === 'hat'
        ? CAPPELLI[v]
        : 'Tintura capelli ' + v;
};
const bottegaHa = (O, k) => {
  const [c, v] = k.split(':');
  return !!O[c][v];
};
function abitiMenu() {
  const st = avSt(),
    O = avOwn(st);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Abiti e cappelli</h2><p class="small">«Ogni tanto qualcosa di nuovo, tesoro. Chi è vestito bene, vende meglio.» — Hai <b>${CZ(st.money)}</b></p>` +
      BOTTEGA.map(it => {
        const [k, p] = it,
          [c, v] = k.split(':'),
          has = bottegaHa(O, k),
          col = c === 'col' ? COLORI[v][1] : c === 'hair' ? CAPELLI[v] : null;
        return `<div class="mrow"><span style="flex:1">${col ? `<i class="swi" style="background:${col}"></i> ` : ''}${esc(bottegaNome(it))}</span>${has ? '<span class="small">tuo</span>' : `<b class="price">${CZ(p)}</b><button class="btn" data-ab="${k}" ${st.money >= p ? '' : 'disabled'}>Compra</button>`}</div>`;
      }).join('') +
      '<p class="small">Si indossa da ☰ → Aspetto.</p>'
  );
  $('#mbox')
    .querySelectorAll('[data-ab]')
    .forEach(
      b =>
        (b.onclick = () => {
          const it = BOTTEGA.find(x => x[0] === b.dataset.ab);
          if (!it || st.money < it[1]) return;
          const [c, v] = it[0].split(':');
          st.money -= it[1];
          O[c][v] = 1;
          AU.play('coin');
          UI.hud();
          UI.toast(`${bottegaNome(it)}: nel guardaroba. Indossala da ☰ → Aspetto.`);
          NET.save(st);
          UI._mclose = null;
          abitiMenu();
        })
    );
}
{
  const _ag = FREE_ASK.agatha;
  FREE_ASK.agatha = async n => {
    const c = await ask('agatha', freeTalkLine('agatha'), [
      'Semi e provviste',
      'Abiti e cappelli',
      'Chiacchiera',
      'Arredo e attrezzi',
      'Personalizza casa e recinti',
      'Niente'
    ]);
    if (c === 0) {
      await UI.shop();
      return true;
    }
    if (c === 1) {
      abitiMenu();
      return true;
    }
    if (c === 3) decorShop();
    if (c === 4) lookMenu();
    return c === 2;
  };
}

// ---------- il telaio ----------
Object.assign(ITEMS, {
  telaio: {
    n: 'Telaio',
    t: 'place',
    d: 'Con fibra e un colorante naturale tessi colori nuovi per i tuoi vestiti. Il pomodoro fa il rosso, le more il blu notte…'
  }
});
Object.assign(PLACE_TOOL, { telaio: 'accetta' });
CRAFTS.push({ id: 'telaio', q: 1, c: { legna: 30, fibra: 20 }, cat: 'cas' });
function telaioMenu() {
  const st = avSt(),
    O = avOwn(st);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Il telaio</h2><p class="small">Fibra e un colorante: il colore nuovo va nel guardaroba, per tutti i vestiti. — Fibra: <b>${countItem('fibra')}</b></p>` +
      TELAIO.map(([k, ing, n]) => {
        const has = !!O.col[k],
          can = !has && countItem('fibra') >= 5 && countItem(ing) >= n;
        return `<div class="mrow"><span style="flex:1"><i class="swi" style="background:${COLORI[k][1]}"></i> <b>${COLORI[k][0]}</b><br><span class="small">5 fibra + ${n} × ${ITEMS[ing] ? ITEMS[ing].n : ing} (${countItem(ing)})</span></span>${has ? '<span class="small">tuo</span>' : `<button class="btn" data-tl="${k}" ${can ? '' : 'disabled'}>Tessi</button>`}</div>`;
      }).join('')
  );
  $('#mbox')
    .querySelectorAll('[data-tl]')
    .forEach(
      b =>
        (b.onclick = () => {
          const [k, ing, n] = TELAIO.find(x => x[0] === b.dataset.tl);
          if (countItem('fibra') < 5 || countItem(ing) < n) return;
          removeItem('fibra', 5);
          removeItem(ing, n);
          O.col[k] = 1;
          AU.play('ok');
          addXP('arti', 6);
          UI.toast(`Hai tessuto: ${COLORI[k][0]}. Indossalo da ☰ → Aspetto.`);
          NET.save(st);
          UI._mclose = null;
          telaioMenu();
        })
    );
}
{
  Ext.on('freeAct:intercetta', function (fx, fy) {
    const st = G.st;
    if (isFree(st) && !G.visit && G.map.id === 'main') {
      const o = G.map.objAt(fx, fy),
        it = selItem();
      if (o && o.kind === 'built' && o.bid === 'telaio' && !(it && it.id === 'accetta')) {
        telaioMenu();
        return true;
      }
    }
  });
}
function genAspettoArt() {
  const wood = rp('#8a5a32'),
    dk = rp('#5a3a1e');
  FREEIMG.telaio = SP(16, 22, P => {
    P.capsule(6, 10, 6, 42, 1.8, dk);
    P.capsule(26, 10, 26, 42, 1.8, dk);
    P.capsule(4, 12, 28, 12, 1.6, wood);
    P.capsule(4, 36, 28, 36, 1.6, wood);
    for (let x = 8; x < 25; x += 2)
      P.line(x, 13, x, 35, C(['#d03a2a', '#2a3a7a', '#f0c83a', '#5aa83a'][(x / 2) % 4 | 0]));
    P.rect(7, 22, 18, 5, rp('#e8dcc0'));
  });
  const P = new PX(32, 32);
  P.capsule(8, 6, 8, 28, 1.4, dk);
  P.capsule(24, 6, 24, 28, 1.4, dk);
  for (let x = 10; x < 23; x += 2) P.line(x, 8, x, 24, C(['#d03a2a', '#2a3a7a', '#f0c83a'][(x / 2) % 3 | 0]));
  P.outline();
  ICON.telaio = pxCanvas(P);
}
{
  Ext.on('applyFree:prima', function (m, st) {
    if (!FREEIMG.telaio && PX.prototype.line) genAspettoArt();
  });
}

// ---------- gli altri ti vedono così ----------
const avCode = () => {
  const st = avSt();
  return st && st.avatar ? JSON.stringify(avOf(st)) : '';
};
{
  const _pr = MP.presence.bind(MP);
  MP.presence = function (village, me, cb) {
    const h = _pr(village, me, all => {
      cb(all);
      for (const pid in all) {
        const o = G.others[pid];
        if (o) o.lk = all[pid].lk || '';
      }
    });
    if (!h) return h;
    const send = h.send;
    h.send = v => send(Object.assign(v, { lk: avCode() }));
    return h;
  };
}

GUIDES.push({
  id: 'aspetto',
  v: 13,
  n: 'Il tuo aspetto',
  steps: [
    {
      t: "Adesso puoi cambiare aspetto: in ☰ → Aspetto scegli capelli, barba, maglia, gilet o vestito, pantaloni, scarpe e cappello, con l'anteprima."
    },
    {
      t: "Agatha vende colori nuovi, mantelli, cappelli e tinture per i capelli («Abiti e cappelli»). Al banco puoi costruire un telaio: con fibra e un colorante, tessi colori che nessuno vende. Il pomodoro fa il rosso, le more il blu notte, e l'oro… l'oro."
    },
    { t: 'Gli amici ti vedono vestit{o|a} così quando siete nello stesso villaggio.' }
  ]
});
