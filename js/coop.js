'use strict';
// ================= COSTRUIRE INSIEME =================
// Il padrone di un villaggio può dare a un amico il permesso di costruire («🔨 Può costruire»). Quando quell'amico
// lo visita può piazzare, spostare e togliere (solo quello che ha messo lui), zappare e seminare, con i suoi oggetti.
// Ogni modifica parte come messaggio (visite/<padrone>): il padrone la applica subito se è online, altrimenti alla
// prossima volta che entra. I permessi stanno in villaggi/<padrone>/trust, l'identità di chi scrive in uid.

// ---------- i permessi ----------
const myHome = () => (G.visit ? G.home : G.st);
{
  const _pub = MP.publish.bind(MP);
  MP.publish = async function (st) {
    await _pub(st);
    if (!NET.ok || !st || !st.pid || !isFree(st)) return;
    try {
      await NET.api.set(NET.r('villaggi/' + st.pid + '/uid'), NET.uid || '');
      const T = {},
        U = {};
      for (const f of st.mpFriends || [])
        if (f.coop) {
          T[f.pid] = true;
          if (f.uid) U[f.uid] = true;
        }
      await NET.api.set(NET.r('villaggi/' + st.pid + '/trust'), T);
      await NET.api.set(NET.r('villaggi/' + st.pid + '/trustU'), U);
    } catch (e) {}
  };
}
// ogni messaggio porta chi lo manda davvero (le regole possono verificarlo: uid === auth.uid)
{
  const _act = MP.act.bind(MP);
  MP.act = function (owner, a) {
    return _act(owner, Object.assign({ uid: NET.uid || '' }, a));
  };
}
async function coopToggle(pid) {
  const st = myHome(),
    f = (st.mpFriends || []).find(x => x.pid === pid);
  if (!f) return;
  f.coop = !f.coop;
  if (f.coop) {
    try {
      const s = await NET.api.get(NET.r('villaggi/' + pid + '/uid'));
      f.uid = s.val() || '';
    } catch (e) {}
  }
  AU.play('ok');
  UI.toast(
    f.coop
      ? `${f.name} adesso può costruire nel tuo villaggio quando ti visita.`
      : `${f.name} non può più costruire nel tuo villaggio.`
  );
  NET.save(st);
}
// nel ponte, accanto a ogni amico: il permesso
{
  const _tm = travelMenu;
  travelMenu = async function () {
    const r = await _tm();
    const box = $('#mbox');
    if (!r || !UI.modalOpen || !box) return r;
    const st = myHome(),
      fr = st.mpFriends || [];
    box.querySelectorAll('[data-v]').forEach(b => {
      const f = fr.find(x => x.pid === b.dataset.v);
      if (!f) return;
      const t = document.createElement('button');
      t.className = 'btn' + (f.coop ? ' on' : '');
      t.textContent = f.coop ? '🔨 Può costruire ✓' : '🔨 Può costruire';
      t.title = 'Permetti a questo amico di costruire nel tuo villaggio';
      t.onclick = async () => {
        await coopToggle(f.pid);
        UI._mclose = null;
        travelMenu();
      };
      b.after(t);
    });
    const h = [...box.querySelectorAll('h3')].find(h => /Amici/.test(h.textContent));
    if (h) {
      const p = document.createElement('p');
      p.className = 'small';
      p.textContent =
        "«🔨 Può costruire»: quando ti visita, quell'amico può costruire, spostare, zappare e seminare nel tuo villaggio, con le sue cose. Puoi toglierlo quando vuoi.";
      h.after(p);
    }
    return r;
  };
}

// ---------- in visita: sei un costruttore fidato? ----------
{
  const _sv = startVisit;
  startVisit = async function (pid) {
    await _sv(pid);
    if (!G.visit || !NET.ok) return;
    const me = G.home.pid;
    try {
      const s = await NET.api.get(NET.r('villaggi/' + pid + '/trust/' + me));
      if (s.val() === true) {
        G.visit.coop = true;
        G.visit.snap = coopSnap();
        UI.toast(
          `${G.visit.name} ti ha dato il permesso: qui puoi costruire. Tocca 🔨 in alto (o premi B), zappa e semina con le tue cose.`
        );
      }
    } catch (e) {}
    UI.hud();
  };
}
const coopSnap = () => ({
  b: JSON.parse(JSON.stringify(G.st.free.built || {})),
  t: JSON.parse(JSON.stringify(G.st.free.tiles || {}))
});
// confronta il villaggio prima e dopo un'azione e manda al padrone quello che è cambiato
function coopSync() {}
// la modalità costruzione si apre anche in visita, se hai il permesso (solo all'aperto)
{
  const _bo = bmOpen;
  bmOpen = function () {
    if (G.visit && G.visit.coop && G.map.id === 'main') {
      const v = G.visit;
      G.visit = null;
      try {
        _bo();
      } finally {
        G.visit = v;
      }
      if (G.bm) {
        v.snap = coopSnap();
        UI.toast(`Costruisci nel villaggio di ${v.name}. Puoi togliere solo quello che hai messo tu.`);
      }
      return;
    }
    return _bo();
  };
}
{
  const _ba = bmAction;
  bmAction = function () {
    const v = G.visit;
    if (!(v && v.coop)) return _ba();
    const b = G.bm,
      o = bmTarget(b.x, b.y),
      me = G.home.pid;
    if (!b.carry && b.mode === 'togli' && o && G.st.free.built[o.bk] && G.st.free.built[o.bk].by !== me) {
      UI.toast(`Questo l'ha messo ${v.name}: puoi spostarlo, non toglierlo.`);
      return;
    }
    // chi piazza resta scritto sulla costruzione
    const keys = new Set(Object.keys(G.st.free.built)),
      wasCarry = !!b.carry;
    _ba();
    if (!wasCarry && !b.carry)
      for (const k in G.st.free.built) if (!keys.has(k) && !G.st.free.built[k].by) G.st.free.built[k].by = me;
    coopSync();
  };
}
{
  const _bc = bmClose;
  bmClose = function () {
    _bc();
    if (G.visit && G.visit.coop) coopSync();
  };
}
// le regole di bmHome guardano G.visit: in visita con permesso, la modalità resta aperta
{
  const _up = updatePlayer;
  updatePlayer = function (dt) {
    const v = G.visit;
    if (G.bm && v && v.coop) {
      G.visit = null;
      try {
        _up(dt);
      } finally {
        G.visit = v;
      }
      return;
    }
    return _up(dt);
  };
}
// zappare e seminare da ospite fidato
{
  const _va = visitAct;
  visitAct = function (fx, fy) {
    const v = G.visit;
    if (!(v && v.coop)) return _va(fx, fy);
    const st = G.st,
      m = G.map,
      it = selItem(),
      id = it && it.id,
      k = fkey(fx, fy),
      f = st.farm[k],
      o = m.objAt(fx, fy),
      g = m.get(fx, fy);
    const send = a => MP.act(v.pid, Object.assign({ from: G.home.pid, name: G.home.name }, a));
    if (id === 'hoe' && !f && !o && (g === 1 || g === 12) && ownedAt(fx, fy)) {
      if (!useEnergy(2)) return true;
      st.farm[k] = { w: false, c: null };
      AU.play('hoe');
      burst('dust', fx * 16 + 8, fy * 16 + 10, 8);
      send({ t: 'ctill', k });
      return true;
    }
    if (id && ITEMS[id] && ITEMS[id].t === 'seed' && f && !f.c) {
      if (!cropInSeason(ITEMS[id].crop, seasonOf()) && !inSerra(fx, fy)) {
        UI.toast('Non è stagione per questi semi.');
        return true;
      }
      f.c = { t: ITEMS[id].crop, a: 0, dry: 0 };
      removeItem(id, 1);
      AU.play('plant');
      send({ t: 'cplant', k, c: ITEMS[id].crop });
      return true;
    }
    if (f && f.c && cropStage(f.c) === 3) {
      UI.toast(`Il raccolto è di ${v.name}: lascialo a lui.`);
      return true;
    }
    return _va(fx, fy);
  };
}

// ---------- il padrone applica quello che fanno gli amici ----------
function coopRekey(st, from, to) {
  for (const a of st.free.animals || []) if (a.home === from) a.home = to;
  for (const r of st.free.residents || []) if (r.house === from) r.house = to;
}
{
  const _ia = inboxApply;
  inboxApply = function (a) {
    if (!a || !/^c(build|del|move|tile|till|plant)$/.test(a.t)) return _ia(a);
    const st = myHome();
    if (!st || !isFree(st)) return;
    const f = (st.mpFriends || []).find(x => x.pid === a.from);
    if (!f || !f.coop || (f.uid && a.uid && f.uid !== a.uid)) return; // solo gli amici col permesso
    const W2 = st.free,
      nm = a.name || f.name,
      back = d => {
        if (d && ITEMS[d.id]) MP.act(a.from, { t: 'gift', item: d.id, n: 1, from: st.name });
      };
    let msg = '';
    if (a.t === 'cbuild') {
      const d = a.d;
      if (!d || !ITEMS[d.id] || W2.built[a.k]) {
        back(d);
        return;
      }
      W2.built[a.k] = d;
      msg = `${nm} ha costruito ${ITEMS[d.id].n.toLowerCase()} nel tuo villaggio.`;
    }
    if (a.t === 'cdel') {
      const d = W2.built[a.k];
      if (!d || d.by !== a.from) return;
      delete W2.built[a.k];
      msg = `${nm} ha ripreso ${ITEMS[d.id].n.toLowerCase()}.`;
    }
    if (a.t === 'cmove') {
      const d = W2.built[a.k];
      if (!d || W2.built[a.to]) return;
      delete W2.built[a.k];
      W2.built[a.to] = d;
      coopRekey(st, a.k, a.to);
      msg = `${nm} ha spostato ${ITEMS[d.id].n.toLowerCase()}.`;
    }
    if (a.t === 'ctile') {
      W2.tiles = W2.tiles || {};
      if (a.v) W2.tiles[a.k] = a.v;
      else delete W2.tiles[a.k];
      msg = '';
    }
    if (a.t === 'ctill') {
      if (!st.farm[a.k]) st.farm[a.k] = { w: false, c: null };
      msg = `${nm} ha zappato nei tuoi campi.`;
    }
    if (a.t === 'cplant') {
      const fm = st.farm[a.k];
      if (fm && !fm.c && CROPS[a.c]) fm.c = { t: a.c, a: 0, dry: 0 };
      msg = `${nm} ha seminato nei tuoi campi.`;
    }
    if (!G.visit && G.st === st && G.mode === 'game') {
      rebuildMaps();
      if (G.map) G.map = G.maps[G.map.id];
    }
    if (msg) {
      clearTimeout(G.coopT);
      G.coopN = (G.coopN || []).concat(msg).slice(-5);
      G.coopT = setTimeout(() => {
        for (const t of G.coopN) UI.toast('🔨 ' + t);
        G.coopN = [];
      }, 700);
    }
    NET.save(st);
  };
}
GUIDES.push({
  id: 'coop',
  v: 9,
  n: 'Costruire insieme',
  steps: [
    {
      t: "Adesso puoi costruire insieme ai tuoi amici. Al ponte, accanto a ogni amico, c'è «🔨 Può costruire»: se lo accendi, quando ti visita può costruire nel tuo villaggio.",
      at: () => ({ x: 44 * 16 + 16, y: 41 * 16 + 4, l: 'Il ponte' })
    },
    {
      t: 'Chi ha il permesso, in visita, preme B come a casa sua: piazza e sposta con le sue cose, zappa e semina. Può togliere solo quello che ha messo lui, e il raccolto resta tuo.'
    },
    {
      t: 'Se sei online vedi le modifiche subito; se no le trovi al prossimo ingresso, con un avviso di chi ha fatto cosa. Il permesso lo togli quando vuoi, dallo stesso bottone.'
    }
  ]
});

// ---------- in visita: si vede se puoi costruire, e il permesso si aggiorna da solo ----------
async function coopCheck() {
  const v = G.visit;
  if (!v || !NET.ok) return;
  const me = G.home.pid;
  try {
    const s = await NET.api.get(NET.r('villaggi/' + v.pid + '/trust/' + me));
    const ok = s.val() === true;
    if (!G.visit || G.visit !== v) return;
    if (ok && !v.coop) {
      v.coop = true;
      v.snap = coopSnap();
      UI.toast(`${v.name} ti ha dato il permesso: adesso puoi costruire qui. Tocca 🔨 in alto.`);
    } else if (!ok && v.coop) {
      if (G.bm) bmClose();
      v.coop = false;
      UI.toast(`${v.name} ha tolto il permesso di costruire.`);
    }
    UI.hud();
  } catch (e) {}
}
let COOP_T = 20;
{
  Ext.on('mpTick', function (dt) {
    if (!G.visit) return;
    COOP_T -= dt;
    if (COOP_T <= 0) {
      COOP_T = 20;
      coopCheck();
    }
  });
}
function visitChip() {
  let el = $('#vchip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'vchip';
    el.className = 'dark hide';
    ($('#hud') || document.body).appendChild(el);
  }
  const v = G.visit;
  el.classList.toggle('hide', !v || G.mode !== 'game');
  if (!v) return;
  el.innerHTML = v.coop
    ? `In visita da <b>${esc(v.name)}</b> · <span style="color:#a8f08a">🔨 puoi costruire</span>`
    : `In visita da <b>${esc(v.name)}</b> · ospite: annaffia e lascia regali`;
}
// il martello si vede anche in visita, se hai il permesso (sul telefono non c'è il tasto B)
{
  const _h = UI.hud.bind(UI);
  UI.hud = function () {
    _h();
    const b = $('#bBuild');
    if (b && G.visit) b.classList.toggle('hide', !(G.visit.coop && G.map && G.map.id === 'main'));
    visitChip();
  };
}

// ---------- il permesso, a prova di codice cambiato ----------
// vale per codice (trust/<pid>) o per identità (trustU/<uid>); se non c'è, si spiega perché
async function coopHas(owner) {
  const me = G.home.pid;
  let a = null,
    b = null;
  try {
    a = (await NET.api.get(NET.r('villaggi/' + owner + '/trust/' + me))).val();
  } catch (e) {}
  try {
    if (NET.uid) b = (await NET.api.get(NET.r('villaggi/' + owner + '/trustU/' + NET.uid))).val();
  } catch (e) {}
  return a === true || b === true;
}
async function coopWhy(owner, name) {
  try {
    const T = (await NET.api.get(NET.r('villaggi/' + owner + '/trust'))).val() || {},
      k = Object.keys(T);
    const me = G.home.pid;
    if (!k.length)
      return `${name} non ti ha ancora dato il permesso (al ponte, «🔨 Può costruire» accanto al tuo nome).`;
    return `${name} ha dato il permesso a: ${k.join(', ')}. Il tuo codice è ${me}: se è diverso, chiedile di toglierti e riaggiungerti dall'albo.`;
  } catch (e) {
    return '';
  }
}
startVisit = (_ =>
  async function (pid) {
    await _(pid);
    if (!G.visit || !NET.ok) return;
    const v = G.visit;
    if (!v.coop && (await coopHas(pid))) {
      v.coop = true;
      v.snap = coopSnap();
      UI.toast(`${v.name} ti ha dato il permesso: qui puoi costruire. Tocca 🔨 in alto.`);
    }
    if (!v.coop) v.why = await coopWhy(pid, v.name);
    UI.hud();
  })(startVisit);
coopCheck = async function () {
  const v = G.visit;
  if (!v || !NET.ok) return;
  const ok = await coopHas(v.pid);
  if (!G.visit || G.visit !== v) return;
  if (ok && !v.coop) {
    v.coop = true;
    v.why = '';
    v.snap = coopSnap();
    UI.toast(`${v.name} ti ha dato il permesso: adesso puoi costruire qui. Tocca 🔨 in alto.`);
  } else if (!ok && v.coop) {
    if (G.bm) bmClose();
    v.coop = false;
    UI.toast(`${v.name} ha tolto il permesso di costruire.`);
  }
  if (!ok) v.why = await coopWhy(v.pid, v.name);
  UI.hud();
};
{
  const _vc = visitChip;
  visitChip = function () {
    _vc();
    const el = $('#vchip'),
      v = G.visit;
    if (el && v && !v.coop && v.why) el.innerHTML += `<br><span class="small">${esc(v.why)}</span>`;
  };
}
// gli amici che hanno cambiato codice: al ponte si ritrovano per nome e la lista si aggiorna da sola
async function friendsRepair(st) {
  if (!NET.ok || (friendsRepair.t && Date.now() - friendsRepair.t < 60000)) return;
  friendsRepair.t = Date.now();
  let list = null;
  for (const f of st.mpFriends || []) {
    let ok = false;
    try {
      ok = !!(await NET.api.get(NET.r('villaggi/' + f.pid + '/name'))).val();
    } catch (e) {
      continue;
    }
    if (ok) {
      if (!f.uid)
        try {
          f.uid = (await NET.api.get(NET.r('villaggi/' + f.pid + '/uid'))).val() || '';
        } catch (e) {}
      continue;
    }
    list = list || (await MP.list(200));
    const same = list.filter(v => v.name === f.name && v.pid !== st.pid);
    if (same.length !== 1) continue;
    const old = f.pid;
    f.pid = same[0].pid;
    try {
      f.uid = (await NET.api.get(NET.r('villaggi/' + f.pid + '/uid'))).val() || '';
    } catch (e) {}
    UI.toast(`${f.name} ha un codice nuovo (${f.pid} al posto di ${old}): aggiornato tra i tuoi amici.`);
  }
  NET.save(st);
}
{
  const _tm = travelMenu;
  travelMenu = async function () {
    const r = await _tm();
    const st = myHome();
    if (st && isFree(st)) friendsRepair(st);
    return r;
  };
}
// quando si dà il permesso: l'identità dell'amico si legge subito, e si avvisa se il suo codice non esiste più
coopToggle = async function (pid) {
  const st = myHome(),
    f = (st.mpFriends || []).find(x => x.pid === pid);
  if (!f) return;
  f.coop = !f.coop;
  if (f.coop) {
    let nm = null;
    try {
      nm = (await NET.api.get(NET.r('villaggi/' + pid + '/name'))).val();
      f.uid = (await NET.api.get(NET.r('villaggi/' + pid + '/uid'))).val() || f.uid || '';
    } catch (e) {}
    if (!nm)
      UI.toast(
        `Attenzione: il codice ${pid} di ${f.name} non risulta più nella Valle. Cercalo nell'albo e riaggiungilo.`,
        'bad'
      );
  }
  AU.play('ok');
  UI.toast(
    f.coop
      ? `${f.name} adesso può costruire nel tuo villaggio quando ti visita.`
      : `${f.name} non può più costruire nel tuo villaggio.`
  );
  NET.save(st);
};
