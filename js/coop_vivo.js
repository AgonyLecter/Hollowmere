'use strict';
// ================= COOPERATIVO VERO =================
// 1) Con il permesso, nel villaggio di un amico si fa tutto quello che si fa a casa: il gioco usa le stesse azioni
//    sul villaggio visitato e manda al padrone le differenze (cpatch). Restano vietati: togliere le sue costruzioni,
//    dormire nel suo letto, vendere dalla sua cassetta, la sua bacheca.
// 2) In diretta: il padrone online manda a chi è da lui ogni cambiamento del villaggio (osync), ogni secondo.
// 3) Dare al volo: davanti a un altro giocatore, A → «Dai a …»: oggetti e scudi finiscono nel suo zaino.
// 4) Stesso orario: nel villaggio di un amico l'ora è la sua; quando dorme, scegli se restare nel nuovo giorno o tornare.

// ---------- fotografie del villaggio e differenze ----------
const W_OBJ = ['built', 'tiles', 'debris', 'gone'];
function snapW(st) {
  const F = st.free;
  return JSON.parse(
    JSON.stringify({
      built: F.built || {},
      tiles: F.tiles || {},
      debris: F.debris || {},
      gone: F.gone || {},
      farm: st.farm || {},
      animals: F.animals || []
    })
  );
}
function diffW(A, B) {
  const P = {};
  let n = 0;
  for (const k of [...W_OBJ, 'farm']) {
    const a = A[k] || {},
      b = B[k] || {},
      d = {};
    for (const x of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (JSON.stringify(a[x]) !== JSON.stringify(b[x])) {
        d[x] = b[x] === undefined ? null : b[x];
        n++;
      }
    }
    if (Object.keys(d).length) P[k] = d;
  }
  if (JSON.stringify(A.animals) !== JSON.stringify(B.animals)) {
    P.animals = B.animals;
    n++;
  }
  return n ? P : null;
}
function applyW(st, P, snap) {
  const F = st.free;
  for (const k of W_OBJ) {
    if (!P[k]) continue;
    F[k] = F[k] || {};
    for (const x in P[k]) {
      if (P[k][x] === null) delete F[k][x];
      else F[k][x] = P[k][x];
    }
  }
  if (P.farm)
    for (const x in P.farm) {
      if (P.farm[x] === null) delete st.farm[x];
      else st.farm[x] = P.farm[x];
    }
  if (P.animals) F.animals = P.animals;
  if (snap) {
    for (const k of [...W_OBJ, 'farm']) {
      if (!P[k]) continue;
      snap[k] = snap[k] || {};
      for (const x in P[k]) {
        if (P[k][x] === null) delete snap[k][x];
        else snap[k][x] = JSON.parse(JSON.stringify(P[k][x]));
      }
    }
    if (P.animals) snap.animals = JSON.parse(JSON.stringify(P.animals));
  }
}
const needRebuild = P => W_OBJ.some(k => P[k]) || P.animals;
function rebuildKeep() {
  const id = G.map && G.map.id;
  rebuildMaps();
  if (id && G.maps[id]) G.map = G.maps[id];
}

// ---------- l'ospite col permesso: le azioni normali, sul villaggio dell'amico ----------
const VIETATI = {
  bed: 'Il letto è suo. Per dormire, torna a casa tua.',
  bin: 'Dalla sua cassetta non si vende: le tue cose si spediscono da casa tua.',
  board: 'La bacheca degli incarichi è sua.',
  museo: 'Il museo è suo: puoi guardare, non donare.'
};
{
  const _da = doAction;
  doAction = function () {
    const v = G.visit,
      p = G.player;
    // davanti a un altro giocatore: dai qualcosa (ovunque, anche a casa tua)
    const o = altroDavanti();
    if (o && !G.bm && !G.cut && !UI.busy()) {
      daiMenu(o.pid, o.name);
      return;
    }
    if (!(v && v.coop) || G.bm || G.map.id !== 'main') return _da();
    const [fx, fy] = frontTile(),
      ob = G.map.objAt(fx, fy),
      it = selItem(),
      me = G.home.pid;
    if (ob && VIETATI[ob.act]) {
      UI.toast(VIETATI[ob.act]);
      return;
    }
    if (ob && ob.kind === 'built') {
      const b = G.st.free.built[ob.bk];
      if (b && it && it.id === PLACE_TOOL[b.id] && b.by !== me) {
        UI.toast(`«${ITEMS[b.id].n}» è di ${v.name}: puoi usarlo, non toglierlo.`);
        return;
      }
    }
    G.visit = null;
    G.coopAct = true;
    try {
      _da();
    } finally {
      G.visit = v;
      G.coopAct = false;
    }
  };
}
// durante le azioni da ospite niente salvataggi: il villaggio non è tuo (lo salva il padrone)
{
  const _sv = NET.save.bind(NET);
  NET.save = function (st) {
    if (G.coopAct) return Promise.resolve();
    return _sv(st);
  };
}
// il vecchio invio «a pezzi» lascia il posto alle differenze

{
  const _sv2 = startVisit;
  startVisit = async function (pid) {
    await _sv2(pid);
    if (G.visit) {
      G.visit.wsnap = snapW(G.st);
      G.visit.t0 = G.st.day;
    }
  };
}
let CP_T = 0;
function coopSend(dt) {
  const v = G.visit;
  if (!v || !v.coop || !v.wsnap) return;
  CP_T -= dt;
  if (CP_T > 0) return;
  CP_T = 0.7;
  const B = snapW(G.st),
    me = G.home.pid;
  for (const k in B.built)
    if (!v.wsnap.built[k] && !B.built[k].by) {
      B.built[k].by = me;
      G.st.free.built[k].by = me;
    } // chi mette una cosa ne resta il padrone
  const P = diffW(v.wsnap, B);
  v.wsnap = B;
  if (!P) return;
  MP.act(v.pid, { t: 'cpatch', p: P, from: me, name: G.home.name });
}

// ---------- il padrone: applica quello che fanno gli amici e lo rimanda a tutti ----------
let OWN_LAST = null,
  OWN_T = 0,
  OWN_SAVE = 0,
  COOP_NOTE = 0;
{
  const _ia = inboxApply;
  inboxApply = function (a) {
    if (!a) return;
    if (a.t === 'osync') {
      const v = G.visit;
      if (v && v.pid === a.from && a.p) {
        applyW(G.st, a.p, v.wsnap);
        if (needRebuild(a.p)) rebuildKeep();
      }
      return;
    }
    if (a.t === 'cpatch') {
      const st = myHome();
      if (!st || !isFree(st) || !a.p) return;
      const f = (st.mpFriends || []).find(x => x.pid === a.from);
      if (!f || !f.coop || (f.uid && a.uid && f.uid !== a.uid)) return;
      const P = a.p,
        B = st.free.built || {};
      if (P.built)
        for (const k in P.built) {
          if (P.built[k] === null && B[k] && B[k].by !== a.from) delete P.built[k];
        } // le tue costruzioni non le toglie nessuno
      applyW(st, P);
      if (!G.visit && G.st === st && G.mode === 'game' && needRebuild(P)) rebuildKeep();
      if (performance.now() > COOP_NOTE) {
        COOP_NOTE = performance.now() + 60000;
        UI.toast(`🔨 ${f.name} sta lavorando nel tuo villaggio.`);
      }
      if (performance.now() > OWN_SAVE) {
        OWN_SAVE = performance.now() + 5000;
        setTimeout(() => NET.save(st), 300);
      }
      return;
    }
    if ((a.t === 'dono' || a.t === 'scudi') && a.diretto && G.others && G.others[a.from]) {
      const st = myHome();
      if (!st) return;
      const nm = a.name || G.others[a.from].name || 'Qualcuno';
      if (a.t === 'scudi') {
        const n = Math.max(1, Math.min(1000000, a.n | 0));
        (G.visit ? G.st : st).money += n;
        UI.hud();
        AU.play('coin');
        UI.toast(`💰 ${nm} ti ha dato ${SC(n)}.`);
      } else if (ITEMS[a.item]) {
        const n = Math.max(1, Math.min(999, a.n | 0));
        if (addItem(a.item, n)) {
          AU.play('ok');
          UI.toast(`🤝 ${nm} ti ha dato ${n} × ${ITEMS[a.item].n}.`);
          UI.hotbar();
        } else {
          st.mailbox = st.mailbox || [];
          st.mailbox.push({ item: a.item, n, from: nm });
          UI.toast(`🤝 ${nm} ti ha dato ${n} × ${ITEMS[a.item].n}: lo zaino era pieno, è nella cassetta.`);
        }
      }
      NET.save(st);
      return;
    }
    return _ia(a);
  };
}
// ogni secondo, se ci sono ospiti online nel tuo villaggio, il villaggio cambiato parte verso di loro
function ownerBroadcast(dt) {
  const st = G.st;
  if (G.visit || !isFree(st) || typeof PRES_V === 'undefined' || PRES_V !== st.pid) {
    OWN_LAST = null;
    return;
  }
  const ids = Object.keys(G.others || {});
  if (!ids.length) {
    OWN_LAST = null;
    return;
  }
  OWN_T -= dt;
  if (OWN_T > 0) return;
  OWN_T = 1;
  const B = snapW(st);
  if (!OWN_LAST) {
    OWN_LAST = B;
    return;
  }
  const P = diffW(OWN_LAST, B);
  OWN_LAST = B;
  if (!P) return;
  for (const pid of ids) MP.act(pid, { t: 'osync', p: P, from: st.pid });
}

// ---------- stesso orario, e quando il padrone dorme ----------
{
  const _pr = MP.presence.bind(MP);
  MP.presence = function (village, me, cb) {
    const h = _pr(village, me, all => {
      cb(all);
      for (const pid in all) {
        const o = G.others[pid];
        if (o) {
          o.hostT = all[pid].ht;
          o.hostD = all[pid].hd;
        }
      }
    });
    if (!h) return h;
    const send = h.send;
    h.send = v => {
      const st = G.st;
      if (!G.visit && isFree(st) && village === st.pid) Object.assign(v, { ht: st.time, hd: st.day });
      return send(v);
    };
    return h;
  };
}
function hostClock() {
  const v = G.visit;
  if (!v) return;
  const h = G.others && G.others[v.pid];
  if (!h || h.hostT == null) return;
  const st = G.st;
  if (Math.abs(h.hostT - st.time) > 3) st.time = h.hostT;
  if (h.hostD > st.day && !v.dayAsk) {
    v.dayAsk = 1;
    (async () => {
      G.cut++;
      let c = 1;
      try {
        c = await ask(
          null,
          `${v.name} è andat${'a'} a dormire: da lei è cominciato un nuovo giorno. Resti nel suo villaggio o torni a casa?`,
          ['Resto da lei', 'Torno a casa']
        );
      } finally {
        G.cut--;
      }
      if (c === 0) {
        const pid = v.pid;
        await endVisit(true);
        await startVisit(pid);
      } else endVisit();
    })();
  }
}
{
  Ext.on('mpTick', function (dt) {
    try {
      coopSend(dt);
      ownerBroadcast(dt);
      hostClock();
    } catch (e) {
      console.error(e);
    }
  });
}

// ---------- dare al volo ----------
function altroDavanti() {
  if (!G.others || G.mode !== 'game') return null;
  const p = G.player,
    ax = p.x + DIRV[p.dir][0] * 14,
    ay = p.y + DIRV[p.dir][1] * 14;
  for (const pid in G.others) {
    const o = G.others[pid];
    if (o.map && o.map !== G.map.id) continue;
    if (Math.hypot(o.x - ax, o.y - ay) < 16) return Object.assign({ pid }, o);
  }
  return null;
}
function daiMenu(pid, name) {
  const st = G.st,
    send = a => MP.act(pid, Object.assign({ from: myHome().pid, name: myHome().name, diretto: 1 }, a));
  const L = st.inv.map((s, i) => [s, i]).filter(([s]) => s && !['key', 'tool'].includes(ITEMS[s.id].t));
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Dai a ${esc(name)}</h2><p class="small">Gli arriva subito nello zaino.</p>` +
      (L.length
        ? L.map(
            ([s, i]) =>
              `<div class="mrow"><canvas data-i="${s.id}" width="32" height="32"></canvas><span style="flex:1">${ITEMS[s.id].n} <span class="small">(${s.n})</span></span>${[
                1, 5
              ]
                .filter(q => q < s.n)
                .map(q => `<button class="btn" data-g="${i}" data-q="${q}">×${q}</button>`)
                .join(' ')} <button class="btn" data-g="${i}" data-q="${s.n}">Tutti</button></div>`
          ).join('')
        : '<p class="small">Nello zaino non hai niente da dare.</p>') +
      `<h3>Scudi</h3><p>${[20, 100, 500].map(v => `<button class="btn" data-m="${v}" ${st.money >= v ? '' : 'disabled'}>${CZ(v)}</button>`).join(' ')}</p>`
  );
  const box = $('#mbox');
  box.querySelectorAll('canvas[data-i]').forEach(c => {
    const ic = ICON[c.dataset.i];
    if (ic) c.getContext('2d').drawImage(ic, 0, 0);
  });
  box.querySelectorAll('[data-g]').forEach(
    b =>
      (b.onclick = () => {
        const s = st.inv[+b.dataset.g];
        if (!s) return;
        const q = Math.min(+b.dataset.q, s.n),
          id = s.id;
        removeItem(id, q);
        send({ t: 'dono', item: id, n: q });
        AU.play('ok');
        UI.toast(`Hai dato a ${name}: ${q} × ${ITEMS[id].n}.`);
        UI.hotbar();
        UI._mclose = null;
        daiMenu(pid, name);
      })
  );
  box.querySelectorAll('[data-m]').forEach(
    b =>
      (b.onclick = () => {
        const v = +b.dataset.m;
        if (st.money < v) return;
        st.money -= v;
        send({ t: 'scudi', n: v });
        AU.play('coin');
        UI.hud();
        UI.toast(`Hai dato ${SC(v)} a ${name}.`);
        UI._mclose = null;
        daiMenu(pid, name);
      })
  );
}
// «A · Dai» sopra il giocatore che hai davanti
{
  const _dg = drawGuide;
  drawGuide = function () {
    _dg();
    const o = altroDavanti();
    if (!o || G.cut || UI.busy() || G.bm) return;
    const X = Math.round(o.x - G.cam.x),
      Y = Math.round(o.y - G.cam.y - 48);
    ctx.save();
    ctx.font = '8px "Silkscreen","Pixelify Sans",monospace';
    ctx.textAlign = 'center';
    const t = 'A · Dai',
      w = ctx.measureText(t).width + 8;
    ctx.fillStyle = 'rgba(18,11,16,.85)';
    ctx.fillRect(X - w / 2, Y - 8, w, 11);
    ctx.fillStyle = '#f6d98a';
    ctx.fillText(t, X, Y);
    ctx.restore();
  };
}
GUIDES.push({
  id: 'coop2',
  v: 15,
  n: 'Insieme, davvero',
  steps: [
    {
      t: 'Da un amico che ti ha dato il permesso adesso puoi fare tutto quello che fai a casa: tagliare, spaccare, zappare, seminare, raccogliere, usare la pala, le casse e le macchine. Non puoi solo togliere le sue cose, dormire nel suo letto o vendere dalla sua cassetta.'
    },
    {
      t: "Quando siete online insieme vi vedete in diretta: se l'amico mette una cassa, la vedi comparire subito. Le casse sono condivise: mettete e prendete tutti e due."
    },
    {
      t: "Per passarvi le cose al volo, mettiti davanti all'altro giocatore e premi A: «Dai a…», oggetti e scudi arrivano subito nel suo zaino."
    },
    {
      t: "Da un amico l'ora è la sua. Quando va a dormire, scegli se restare nel suo nuovo giorno o tornare a casa."
    }
  ]
});
