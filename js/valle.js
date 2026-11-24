'use strict';
// ================= LA VALLE CONDIVISA: bacheca comune, albo dei villaggi, guida =================
// - Bacheca comune in piazza (solo gioco libero): le novità scritte dalla regia (fusco.html → novita/),
//   l'albo di tutti i villaggi della Valle e la guida.
// - Albo dei villaggi: chiunque può trovare e aggiungere un altro giocatore senza conoscerne il codice.
// - Guida: la prima volta nel multiplayer, e ogni volta che arriva una funzione nuova, un percorso
//   passo passo con la freccia. Una sola volta, poi non torna più (si può rivedere dalla bacheca).

const homeSt = () => (G.visit ? G.home : G.st);
const ALBO_T = [
  [45, 16],
  [43, 17],
  [41, 19],
  [44, 21],
  [38, 18]
]; // dove sta la bacheca comune (il primo libero)

// ---------- rete ----------
MP.list = async function (n) {
  if (!NET.ok) return [];
  try {
    const D = NET.api,
      s = await D.get(D.query(NET.r('villaggi'), D.orderByChild('ts'), D.limitToLast(n || 25)));
    const v = s.val() || {};
    return Object.entries(v)
      .map(([pid, o]) => Object.assign({ pid }, o))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch (e) {
    return [];
  }
};
// chi è collegato adesso: presenza/<villaggio>/<giocatore>
MP.online = async function () {
  const on = {};
  if (!NET.ok) return on;
  try {
    const s = await NET.api.get(NET.r('presenza'));
    const v = s.val() || {},
      now = Date.now();
    for (const vil in v)
      for (const pid in v[vil] || {}) {
        const o = v[vil][pid] || {};
        if (!o.ts || now - o.ts < 120000) on[pid] = vil;
      }
  } catch (e) {
    rete(e, 'valle');
  }
  return on;
};
// la scheda pubblica del villaggio porta anche il cartello scritto dal giocatore
{
  const _pub = MP.publish.bind(MP);
  MP.publish = async function (st) {
    await _pub(st);
    if (!NET.ok || !st || !st.pid || !isFree(st) || !st.free.motto) return;
    try {
      await NET.api.set(NET.r('villaggi/' + st.pid + '/motto'), String(st.free.motto).slice(0, 60));
    } catch (e) {
      rete(e, 'valle');
    }
  };
}
G.news = [];
function newsListen() {
  if (!NET.ok || newsListen.on) return;
  newsListen.on = 1;
  const D = NET.api;
  D.onValue(
    D.query(NET.r('novita'), D.limitToLast(30)),
    s => {
      const v = s.val() || {};
      G.news = Object.entries(v)
        .map(([id, o]) => ({
          id,
          t: String((o && o.t) || '').slice(0, 80),
          b: String((o && o.b) || '').slice(0, 600),
          tag: String((o && o.tag) || 'novita'),
          ts: +(o && o.ts) || 0
        }))
        .filter(n => n.t)
        .sort((a, b) => b.ts - a.ts);
    },
    () => {}
  );
}
{
  const _l = NET.listen.bind(NET);
  NET.listen = function () {
    _l();
    newsListen();
  };
}
const newsUnread = st => {
  st = st || homeSt();
  if (!st || !isFree(st)) return [];
  const seen = st.free.newsSeen || 0;
  return G.news.filter(n => n.ts > seen);
};

// ---------- la bacheca comune in piazza ----------
function alboTile(m) {
  for (const [x, y] of ALBO_T)
    if (!m.objAt(x, y) && !m.objAt(x + 1, y) && !m.solid(x, y) && !m.solid(x + 1, y)) return [x, y];
  return null;
}
function addAlbo(m) {
  if (!IMG.albo) genValleArt();
  const t = alboTile(m);
  if (!t) return;
  const [x, y] = t;
  m.add(
    OB('albo', x, y, IMG.albo, {
      wt: 2,
      act: 'albo',
      solid: [
        [x, y],
        [x + 1, y]
      ],
      hits: [
        [x, y],
        [x + 1, y]
      ]
    })
  );
  m.lights.push({ x: x * 16 + 28, y: y * 16 - 14, r: 30 });
}
{
  Ext.on('applyFree', function (m, st) {
    if (m.id === 'main' && isFree(st)) addAlbo(m);
  });
}
PROMPT.albo = 'Bacheca comune';
ACT.albo = () => {
  alboMenu('news');
};
{
  Ext.on('freeAct:intercetta', function (fx, fy) {
    const o = G.map.objAt(fx, fy);
    if (o && o.act === 'albo' && !G.visit) {
      alboMenu('news');
      return true;
    }
  });
}
{
  Ext.avvolgi('visitAct', function (prossimo, fx, fy) {
    const o = G.map.objAt(fx, fy);
    if (o && o.act === 'albo') {
      alboMenu('news');
      return true;
    }
    return prossimo(fx, fy);
  });
}
const albo = () => G.map && G.map.id === 'main' && G.map.objs.find(o => o.act === 'albo');

const NTAG = {
  novita: ['Novità', '#5a8a3a'],
  aggiornamento: ['Aggiornamento', '#3a6a9a'],
  evento: ['Evento', '#a8641a'],
  avviso: ['Avviso', '#a8301a']
};
const dataIt = ts => {
  const d = new Date(ts);
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
};
const fa = ts => {
  const s = (Date.now() - ts) / 1000;
  if (s < 90) return 'adesso';
  if (s < 3600) return Math.round(s / 60) + ' min fa';
  if (s < 86400) return Math.round(s / 3600) + ' ore fa';
  const g = Math.round(s / 86400);
  return g === 1 ? 'ieri' : g + ' giorni fa';
};
let ALBO = { q: '', on: false, page: 0, list: null, online: {}, t: 0 };

async function alboMenu(tab) {
  const st = homeSt();
  if (!isFree(st)) return;
  tab = tab || 'news';
  G.tourHit = G.tourHit || {};
  G.tourHit.albo = 1;
  const tabs = `<div class="tabs">${[
    ['news', 'Novità' + (newsUnread(st).length ? ` (${newsUnread(st).length})` : '')],
    ['albo', 'Albo dei villaggi'],
    ['guida', 'Guida']
  ]
    .map(([k, n]) => `<button class="btn ${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`)
    .join('')}</div>`;
  const head = `<button class="btn mclose" data-close>✕</button><h2>La bacheca della Valle</h2>`;
  const wire = () => {
    $('#mbox')
      .querySelectorAll('[data-tab]')
      .forEach(
        b =>
          (b.onclick = () => {
            UI._mclose = null;
            alboMenu(b.dataset.tab);
          })
      );
  };
  if (tab === 'news') {
    const un = new Set(newsUnread(st).map(n => n.id)),
      ev = G.event && G.event.annuncio;
    UI.open(
      head +
        tabs +
        (ev ? `<div class="mrow"><span><b>Avviso del giorno</b><br>${esc(ev)}</span></div>` : '') +
        (G.news.length
          ? G.news
              .map(n => {
                const g = NTAG[n.tag] || NTAG.novita;
                return `<div class="mrow" style="display:block"><p style="margin:0"><span class="small" style="background:${g[1]};color:#fff6e0;padding:0 calc(3*var(--u))">${g[0]}</span> ${un.has(n.id) ? '<b style="color:#c8601a">NUOVO</b> ' : ''}<span class="small">${dataIt(n.ts)}</span></p><p style="margin:calc(2*var(--u)) 0 0"><b>${esc(n.t)}</b></p>${n.b ? `<p style="margin:calc(1*var(--u)) 0 0;white-space:pre-line">${esc(n.b)}</p>` : ''}</div>`;
              })
              .join('')
          : `<p class="small">${NET.ok ? 'Ancora niente di nuovo. Quando la regia aggiunge qualcosa alla Valle, lo trovi scritto qui.' : 'Senza connessione la bacheca resta vuota: le novità arrivano dalla Valle online.'}</p>`)
    );
    if (G.news.length) st.free.newsSeen = Math.max(st.free.newsSeen || 0, G.news[0].ts);
    wire();
    return;
  }
  if (tab === 'guida') {
    UI.open(
      head +
        tabs +
        `<p>La guida della Valle ti accompagna la prima volta e quando arriva qualcosa di nuovo. Se vuoi, puoi rifarla da capo.</p><p><button class="btn" id="tgAgain">Rifai la guida della Valle</button></p>` +
        `<h3>In breve</h3><p class="small">• <b>Albo dei villaggi</b>: tutti i giocatori della Valle. «Visita» per entrare, «+ Amico» per tenerlo tra gli amici (e lui riceve il tuo invito).<br>• <b>Il ponte</b> a sud: viaggi, amici, inviti e il mercato dei materiali rari.<br>• <b>In visita</b> puoi annaffiare i campi degli altri e lasciare regali nella loro cassetta.<br>• <b>Chat</b>: quando siete nello stesso villaggio vi vedete muovere. Tasto T o il fumetto.<br>• Il tuo codice: <b>${esc(st.pid || '—')}</b></p>`
    );
    wire();
    $('#tgAgain').onclick = () => {
      UI._mclose = null;
      UI.close();
      tourStart('valle', true);
    };
    return;
  }
  // albo
  UI.open(
    head +
      tabs +
      `<p class="small">Il tuo villaggio nell'albo: <b>${esc(st.name)}</b> · ${esc(st.pid || '')}</p><p class="small">Cerco i villaggi della Valle…</p>`
  );
  wire();
  if (!MP.ok()) {
    UI.open(head + tabs + "<p>Per vedere l'albo serve la connessione alla Valle (online).</p>");
    wire();
    return;
  }
  if (!ALBO.list || Date.now() - ALBO.t > 30000) {
    const [l, on] = await Promise.all([MP.list(200), MP.online()]);
    ALBO.list = l.filter(v => v.pid !== st.pid && v.name);
    ALBO.online = on;
    ALBO.t = Date.now();
  }
  if (!UI.modalOpen) return;
  alboDraw(st);
}
function alboDraw(st) {
  const fr = (st.mpFriends = st.mpFriends || []),
    known = new Set(fr.map(f => f.pid)),
    on = ALBO.online,
    q = ALBO.q.toLowerCase(),
    PER = 10;
  let L = ALBO.list.filter(
    v =>
      (!q || String(v.name).toLowerCase().includes(q) || v.pid.toLowerCase().includes(q)) &&
      (!ALBO.on || on[v.pid])
  );
  L.sort((a, b) => !!on[b.pid] - !!on[a.pid] || (b.ts || 0) - (a.ts || 0));
  const pages = Math.max(1, Math.ceil(L.length / PER));
  ALBO.page = Math.min(ALBO.page, pages - 1);
  const nOn = ALBO.list.filter(v => on[v.pid]).length;
  const row = v =>
    `<div class="mrow"><span style="flex:1;min-width:0"><b>${esc(v.name)}</b> ${v.rank != null && typeof rankName === 'function' ? `<span class="small">· ${esc(rankName(+v.rank || 0))}</span> ` : ''}${on[v.pid] ? '<span class="small" style="color:#3a7a2a">● online ora</span>' : `<span class="small">visto ${fa(v.ts || 0)}</span>`}<br>` +
    (v.motto ? `<i>«${esc(String(v.motto).slice(0, 60))}»</i><br>` : '') +
    `<span class="small">${v.season != null ? `${SEASONS[v.season]} ${v.sday || ''}${v.year > 1 ? ' · anno ' + v.year : ''} · ` : ''}${v.anim ? v.anim + ' bestie · ' : ''}${v.built ? v.built + ' costruzioni' : ''}</span></span>` +
    `<span style="flex:none;display:flex;flex-direction:column;gap:calc(2*var(--u));min-width:calc(70*var(--u))"><button class="btn" data-av="${esc(v.pid)}">Visita</button>${known.has(v.pid) ? '<span class="small" style="text-align:center">amico ✓</span>' : `<button class="btn" data-af="${esc(v.pid)}">+ Amico</button>`}</span></div>`;
  const tabs = `<div class="tabs">${[
    ['news', 'Novità' + (newsUnread(st).length ? ` (${newsUnread(st).length})` : '')],
    ['albo', 'Albo dei villaggi'],
    ['guida', 'Guida']
  ]
    .map(([k, n]) => `<button class="btn ${k === 'albo' ? 'on' : ''}" data-tab="${k}">${n}</button>`)
    .join('')}</div>`;
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>La bacheca della Valle</h2>` +
      tabs +
      `<p class="small">${ALBO.list.length} villaggi nella Valle · <b style="color:#3a7a2a">${nOn} online ora</b>. Non serve conoscere il codice: scegli qualcuno e vai a trovarlo.</p>` +
      `<p><input class="tx" id="abQ" maxlength="20" placeholder="Cerca un nome…" value="${esc(ALBO.q)}" style="width:52%" autocomplete="off"> <button class="btn ${ALBO.on ? 'on' : ''}" id="abOn">Solo online</button></p>` +
      (L.length
        ? L.slice(ALBO.page * PER, ALBO.page * PER + PER)
            .map(row)
            .join('')
        : `<p class="small">${ALBO.q || ALBO.on ? 'Nessun villaggio così, per ora.' : 'Nessun altro villaggio, per ora. Arriveranno.'}</p>`) +
      (pages > 1
        ? `<p style="text-align:center"><button class="btn" id="abPrev" ${ALBO.page ? '' : 'disabled'}>‹</button> <span class="small">pagina ${ALBO.page + 1} di ${pages}</span> <button class="btn" id="abNext" ${ALBO.page < pages - 1 ? '' : 'disabled'}>›</button></p>`
        : '') +
      `<h3>Il cartello del tuo villaggio</h3><p class="small">Una riga che gli altri leggono nell'albo: chi sei, cosa coltivi, cosa cerchi.</p><p><input class="tx" id="abMotto" maxlength="60" placeholder="Es. Zucche giganti e miele. Cerco rame!" value="${esc(st.free.motto || '')}" style="width:68%" autocomplete="off"> <button class="btn" id="abMot">Appendi</button></p>`
  );
  const box = $('#mbox');
  box.querySelectorAll('[data-tab]').forEach(
    b =>
      (b.onclick = () => {
        UI._mclose = null;
        alboMenu(b.dataset.tab);
      })
  );
  box.querySelectorAll('[data-av]').forEach(
    b =>
      (b.onclick = () => {
        UI._mclose = null;
        UI.close();
        startVisit(b.dataset.av);
      })
  );
  box.querySelectorAll('[data-af]').forEach(
    b =>
      (b.onclick = () => {
        const v = ALBO.list.find(x => x.pid === b.dataset.af);
        if (!v) return;
        if (!fr.some(f => f.pid === v.pid)) fr.push({ pid: v.pid, name: v.name });
        MP.act(v.pid, { t: 'invite', from: st.pid, name: st.name });
        AU.play('ok');
        UI.toast(`${v.name} è tra i tuoi amici. Riceverà il tuo invito e potrà venire a trovarti.`);
        G.tourHit = G.tourHit || {};
        G.tourHit.friend = 1;
        NET.save(st);
        alboDraw(st);
      })
  );
  const qi = $('#abQ');
  let qt = 0;
  qi.oninput = () => {
    clearTimeout(qt);
    qt = setTimeout(() => {
      ALBO.q = qi.value.trim().slice(0, 20);
      ALBO.page = 0;
      const p = qi.selectionStart;
      alboDraw(st);
      const n = $('#abQ');
      if (n) {
        n.focus();
        n.setSelectionRange(p, p);
      }
    }, 250);
  };
  $('#abOn').onclick = () => {
    ALBO.on = !ALBO.on;
    ALBO.page = 0;
    alboDraw(st);
  };
  {
    const a = $('#abPrev'),
      b = $('#abNext');
    if (a)
      a.onclick = () => {
        ALBO.page--;
        alboDraw(st);
      };
    if (b)
      b.onclick = () => {
        ALBO.page++;
        alboDraw(st);
      };
  }
  $('#abMot').onclick = () => {
    const v = $('#abMotto').value.replace(/[<>]/g, '').trim().slice(0, 60);
    st.free.motto = v;
    AU.play('ok');
    UI.toast(v ? "Cartello appeso: lo leggono tutti nell'albo." : 'Cartello tolto.');
    NET.save(st);
    if (!v && NET.ok) NET.api.remove(NET.r('villaggi/' + st.pid + '/motto')).catch(() => {});
  };
}

// il ponte porta all'albo; la lista "Villaggi vicini" diventa la scorciatoia ai primi online
{
  Ext.avvolgi('travelMenu', async function (prossimo) {
    const r = await prossimo();
    const box = $('#mbox');
    if (!r || !UI.modalOpen || !box || !box.querySelector('#frAdd')) return r;
    const h = [...box.querySelectorAll('h3')].find(h => /Villaggi vicini/.test(h.textContent));
    if (h) {
      const p = document.createElement('p');
      p.innerHTML =
        '<button class="btn" id="tvAlbo">Albo dei villaggi: tutti i giocatori della Valle</button>';
      h.after(p);
      p.querySelector('button').onclick = () => {
        UI._mclose = null;
        alboMenu('albo');
      };
    }
    return r;
  });
}

// ---------- la guida ----------
// Ogni guida ha un id e si vede una volta sola. Per una funzione nuova basta aggiungerne una qui,
// con v più alto: chi ha già fatto la guida della Valle vedrà solo quella nuova.
const ALBO_P = () => {
  const o = G.maps.main && G.maps.main.objs.find(o => o.act === 'albo');
  if (!o) return null;
  const near = Math.hypot(o.tx * 16 + 16 - G.player.x, o.ty * 16 + 8 - G.player.y) < 56;
  return { x: o.tx * 16 + 16, y: o.ty * 16 + 2, l: near ? '' : 'Bacheca comune' };
};
const GUIDES = [
  {
    id: 'valle',
    v: 1,
    n: 'La Valle condivisa',
    steps: [
      {
        t: 'Benvenut{o|a} nella Valle condivisa. Da qui non sei più sol{o|a}: ogni giocatore che ha finito la storia ha il suo villaggio, e puoi andarlo a trovare.'
      },
      {
        t: "Al centro della piazza c'è la <b>bacheca comune</b>. Raggiungila e aprila.",
        at: ALBO_P,
        done: () => G.tourHit && G.tourHit.albo
      },
      {
        t: "Nella bacheca ci sono le <b>novità</b> della Valle e l'<b>Albo dei villaggi</b>: tutti i giocatori, anche quelli che non conosci. Chi è <b>online ora</b> è in cima."
      },
      {
        t: "Nell'albo premi <b>Visita</b> per entrare nel villaggio di qualcuno, <b>+ Amico</b> per tenerlo tra gli amici: riceve il tuo invito e vede il tuo villaggio."
      },
      {
        t: 'Il <b>ponte</b> a sud è la strada di fuori: amici, inviti e il mercato dei materiali rari (oro, diamanti, nichel, rame).',
        at: () => ({ x: 44 * 16 + 16, y: 41 * 16 + 4, l: 'Il ponte' })
      },
      {
        t: 'Quando siete nello stesso villaggio vi vedete muovere. Per scrivere: tasto <b>T</b> o il fumetto 💬. In visita puoi annaffiare i campi e lasciare regali nella cassetta.'
      },
      {
        t: 'Il tuo codice è <b>%PID%</b>: se lo dai a un amico, ti trova subito. Buona Valle! Questa guida non torna più, ma puoi rifarla dalla bacheca comune.'
      }
    ]
  }
];
const guidesSeen = st => (st.free.guides = st.free.guides || {});
// quanto manca al prossimo controllo del giro di Ottavio (lo usano valle.js e postino.js)
const GIRO = { attesa: 4 };
function tourStep() {
  return G.tour && G.tour.g.steps[G.tour.i];
}
function tourStart(id, again) {
  const g = typeof id === 'object' ? id : GUIDES.find(x => x.id === id);
  if (!g) return;
  G.tour = { g, i: 0, again };
  G.tourHit = {};
  tourShow();
}
function tourEnd() {
  const st = homeSt();
  if (G.tour && st && isFree(st)) {
    const S = guidesSeen(st);
    S[G.tour.g.id] = 1;
    if (G.tour.g.id === 'valle') for (const g of GUIDES) if (g.v <= 1) S[g.id] = 1;
    if (G.tour.g.news) st.free.newsPing = G.tour.g.news;
    NET.save(st);
  }
  G.tour = null;
  const el = $('#tour');
  if (el) el.classList.add('hide');
  G.objC = null;
}
function tourNext() {
  if (!G.tour) return;
  AU.play('ui');
  G.tour.i++;
  G.objC = null;
  if (G.tour.i >= G.tour.g.steps.length) {
    tourEnd();
    return;
  }
  tourShow();
}
function tourShow() {
  let el = $('#tour');
  if (!el) {
    el = document.createElement('div');
    el.id = 'tour';
    el.className = 'dark hide';
    ($('#hud') || document.body).appendChild(el);
    el.addEventListener('pointerdown', e => e.stopPropagation());
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-t]');
      if (!a) return;
      e.stopPropagation();
      if (a.dataset.t === 'next') tourNext();
      else {
        AU.play('ui');
        tourEnd();
      }
    });
  }
  const T = G.tour,
    s = tourStep(),
    st = homeSt();
  if (!s) {
    el.classList.add('hide');
    return;
  }
  const n = T.g.steps.length,
    last = T.i === n - 1;
  el.innerHTML = `<b>${esc(T.g.n)} <span>${T.i + 1}/${n}</span></b><p>${fmt(s.t).replace('%PID%', esc((st && st.pid) || ''))}</p><p class="tb">${last ? '' : '<button class="btn" data-t="skip">Salta la guida</button> '}<button class="btn" data-t="next">${last ? 'Fine' : s.done ? 'Avanti ›' : 'Avanti ›'}</button></p>`;
  el.classList.remove('hide');
}
// quale guida tocca adesso (una sola volta ciascuna)
function tourPick(st) {
  const S = guidesSeen(st);
  for (const g of GUIDES) if (!S[g.id]) return g;
  const un = newsUnread(st),
    top = un[0];
  if (top && top.ts > (st.free.newsPing || 0))
    return {
      id: 'news_' + top.ts,
      news: top.ts,
      n: 'Novità nella Valle',
      steps: [
        {
          t: `La regia ha scritto ${un.length > 1 ? un.length + ' novità' : 'una novità'} nella bacheca comune: «${esc(top.t)}». Vai a leggere.`,
          at: ALBO_P,
          done: () => !newsUnread(st).length
        }
      ]
    };
  return null;
}
function tourTickBase(dt) {
  const st = homeSt(),
    el = $('#tour');
  if (G.mode !== 'game' || !st || !isFree(st)) {
    if (G.tour) {
      G.tour = null;
    }
    if (el) el.classList.add('hide');
    return;
  }
  if (el && G.tour) el.classList.toggle('hide', !!G.cut || UI.modalOpen || !!G.bm);
  if (G.tour) {
    const s = tourStep();
    if (s && s.done && s.done() && !G.cut && !UI.busy()) tourNext();
    return;
  }
  if (G.cut || UI.busy() || G.visit) {
    GIRO.attesa = Math.max(GIRO.attesa, 1.5);
    return;
  }
  GIRO.attesa -= dt;
  if (GIRO.attesa > 0) return;
  GIRO.attesa = 3;
  const g = tourPick(st);
  if (g) tourStart(g);
}

// catena: altri file la avvolgono con Ext.avvolgi('tourTick', …)
function tourTick(...a) {
  return Ext.catena('tourTick', tourTickBase, this, a);
}

{
  Ext.on('mpTick', function (dt) {
    tourTick(dt);
  });
}
// freccia: la guida indica la tappa (anche se la freccia degli obiettivi è spenta); dalle case indica l'uscita
{
  Ext.avvolgi('guideTarget', function (prossimo) {
    const s = tourStep();
    if (s && s.at) {
      const m = G.map;
      if (m.id !== 'main') {
        const d = m.doors && m.doors[0];
        return d ? { x: d.tx * 16 + 8, y: d.ty * 16 + 4, l: 'Uscita' } : null;
      }
      return s.at();
    }
    return prossimo();
  });
}
{
  Ext.avvolgi('drawGuide', function (prossimo) {
    const s = tourStep(),
      on = G.guideOn;
    if (s && s.at) G.guideOn = true;
    try {
      prossimo();
    } finally {
      G.guideOn = on;
    }
    // un punto esclamativo sulla bacheca quando c'è una novità da leggere
    const o = albo();
    if (!o || G.cut || UI.busy() || !newsUnread().length) return;
    const X = Math.round(o.tx * 16 + 16 - G.cam.x),
      Y = Math.round(o.ty * 16 - 38 - G.cam.y + Math.sin(G.t * 5) * 2);
    ctx.save();
    ctx.fillStyle = '#2b1a10';
    ctx.fillRect(X - 5, Y - 9, 10, 13);
    ctx.fillStyle = '#f6d98a';
    ctx.fillRect(X - 4, Y - 8, 8, 11);
    ctx.fillStyle = '#a8301a';
    ctx.fillRect(X - 1, Y - 7, 2, 6);
    ctx.fillRect(X - 1, Y, 2, 2);
    ctx.restore();
  });
}

// ---------- grafica: la bacheca comune (due caselle, tettoia, lanterna) ----------
function genValleArtBase() {
  const wood = rp('#8a5a32'),
    woodD = rp('#5a3a1e'),
    cream = rp('#efe2c2'),
    roof = rp('#6a3a2a'),
    brass = rp('#d9a646');
  IMG.albo = SP(32, 34, P => {
    P.capsule(7, 22, 7, 66, 2.2, woodD);
    P.capsule(57, 22, 57, 66, 2.2, woodD);
    P.rect(3, 20, 58, 30, wood, { mod: woodMod });
    P.rect(3, 48, 58, 3, woodD);
    P.rect(3, 19, 58, 2, woodD);
    [
      [7, 24, 14, 17],
      [24, 27, 12, 13],
      [39, 24, 17, 11],
      [40, 37, 9, 10],
      [9, 43, 10, 5]
    ].forEach(([x, y, w, h], i) => {
      P.rect(x, y, w, h, i === 2 ? rp('#e8d4a8') : cream, { n: [-0.1, -0.2, 1] });
      for (let k = 3; k < h - 1; k += 2) P.line(x + 2, y + k, x + w - 3, y + k, C('#8a8070'));
    });
    for (const [x, y] of [
      [14, 24],
      [30, 27],
      [47, 24],
      [44, 37]
    ])
      P.ellipse(x, y, 1.5, 1.5, rp('#c8301a'), { spec: 1 });
    P.rect(22, 13, 20, 6, brass, { spec: 0.9 });
    P.line(25, 16, 39, 16, C('#7a5a1a'));
    P.body(
      0,
      14,
      () => 32,
      Y => 12 + Y * 1.55,
      roof,
      { nyF: () => -0.6, mod: (X, Y, v) => (Y % 3 === 0 || (X + (Y >> 2) * 3) % 7 === 0 ? v - 0.25 : v) }
    );
    P.line(61, 24, 61, 30, C('#3a2a1a'));
    P.rect(58, 30, 7, 9, rp('#3a3a3a'));
    P.rect(59, 32, 5, 5, rp('#ffd86a'), { spec: 1 });
  });
}

// catena: altri file la avvolgono con Ext.avvolgi('genValleArt', …)
function genValleArt(...a) {
  return Ext.catena('genValleArt', genValleArtBase, this, a);
}
