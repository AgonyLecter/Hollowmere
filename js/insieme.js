'use strict';
// ================= INSIEME: chi c'è nel villaggio, cosa può fare, la missione comune =================
// 1) Quando qualcuno arriva nel villaggio in cui sei (o se ne va) compare un avviso; il pulsante 👥 in alto
//    mostra chi c'è, con il suo ruolo (padrone, ospite con il permesso di costruire, ospite) e cosa può fare.
//    Il padrone, da lì, dà o toglie il permesso di costruire agli amici.
// 2) La missione comune: quando nel villaggio ci sono più giocatori, il padrone apre una missione del giorno
//    (annaffiare, raccogliere, abbattere alberi, falciare). Contano le azioni di tutti (Ext 'fatto'); il
//    padrone tiene il conto (free.insieme) e lo manda a chi c'è; a missione compiuta ognuno ha il suo premio.
// Messaggi: «ins» (padrone → ospiti: la missione), «insc» (ospite → padrone: un contributo),
// «insp» (padrone → ospite: il premio). Arrivano dalla posta (Ext 'posta', in mp.js).

const INS_TIPI = {
  annaffia: { n: 'Annaffiate insieme {o} piante', obj: 30, premio: 300 },
  raccogli: { n: 'Raccogliete insieme {o} raccolti', obj: 15, premio: 350 },
  albero: { n: 'Abbattete insieme {o} alberi', obj: 6, premio: 300 },
  falcia: { n: "Falciate insieme {o} ciuffi d'erba alta", obj: 20, premio: 250 }
};
const INS = { visti: null, villaggio: null, da: 0, mandata: '', missione: null, salvaT: 0 };
const insPadrone = () => !G.home; // nel tuo villaggio (in visita c'è sempre la tua partita di casa: G.home)
const insPresenti = () => Object.keys(G.others || {});
// la missione che vedi: la tua (se sei il padrone) o quella che ti ha mandato il padrone
function insMissione() {
  const st = G.st;
  if (!st || !isFree(st)) return null;
  const m = insPadrone() ? st.free.insieme : INS.missione;
  return m && m.day === st.day ? m : null;
}
function insTesto(m) {
  return INS_TIPI[m.tipo].n.replace('{o}', m.obj);
}

// ---------- chi arriva e chi se ne va ----------
function insArrivi() {
  if (typeof PRES_V === 'undefined' || !PRES_V) {
    INS.visti = null;
    return;
  }
  const ora = performance.now(),
    ids = insPresenti();
  // appena entrati in un villaggio: per un paio di secondi si guarda chi c'è già, senza avvisi uno per uno
  if (INS.villaggio !== PRES_V) {
    INS.villaggio = PRES_V;
    INS.visti = null;
    INS.da = ora;
  }
  if (!INS.visti) {
    if (ora - INS.da < 2500) return;
    INS.visti = new Map(ids.map(p => [p, { name: G.others[p].name || 'Qualcuno', g: G.others[p].g }]));
    if (ids.length) UI.toast(`👥 Qui ci sono: ${[...INS.visti.values()].map(x => x.name).join(', ')}.`);
    return;
  }
  for (const p of ids)
    if (!INS.visti.has(p)) {
      const nm = G.others[p].name || 'Qualcuno';
      INS.visti.set(p, { name: nm, g: G.others[p].g });
      AU.play('ok');
      UI.toast(
        insPadrone()
          ? `👋 ${nm} è arrivat${G.others[p].g === 'f' ? 'a' : 'o'} nel tuo villaggio.`
          : `👋 Qui c'è anche ${nm}.`
      );
    }
  for (const [p, x] of INS.visti)
    if (!G.others[p]) {
      INS.visti.delete(p);
      UI.toast(`${x.name} se n'è andat${x.g === 'f' ? 'a' : 'o'}.`);
    }
}

// ---------- la missione comune (il padrone) ----------
function insApri() {
  const st = G.st;
  if (!insPadrone() || !isFree(st) || G.mode !== 'game' || !insPresenti().length) return;
  if (st.free.insieme && st.free.insieme.day === st.day) return;
  const tipi = Object.keys(INS_TIPI),
    tipo = tipi[hsh(st.day, st.pid.length * 31 + st.pid.charCodeAt(3)) % tipi.length];
  st.free.insieme = { day: st.day, tipo, obj: INS_TIPI[tipo].obj, fatto: 0, chi: {}, premiato: 0 };
  UI.toast(
    `🤝 Missione comune di oggi: ${insTesto(st.free.insieme)}. Premio per ognuno: ${SC(INS_TIPI[tipo].premio)}.`
  );
  UI.quest();
}
function insConta(st, pid, nome, n) {
  const m = st.free.insieme;
  if (!m || m.day !== st.day || m.premiato) return;
  n = Math.max(0, Math.min(n | 0, m.obj - m.fatto));
  if (!n) return;
  m.fatto += n;
  const c = (m.chi[pid] = m.chi[pid] || { name: nome, n: 0 });
  c.n += n;
  if (m.fatto >= m.obj) insCompiuta(st);
  UI.quest();
  if (performance.now() > INS.salvaT) {
    INS.salvaT = performance.now() + 5000;
    setTimeout(() => NET.save(st), 300);
  }
}
function insCompiuta(st) {
  const m = st.free.insieme,
    premio = INS_TIPI[m.tipo].premio;
  m.premiato = 1;
  st.money += premio;
  UI.hud();
  AU.play('coin');
  UI.toast(`🤝 Missione comune compiuta! +${SC(premio)} a ognuno.`);
  for (const pid in m.chi)
    if (pid !== st.pid) MP.act(pid, { t: 'insp', n: premio, tipo: m.tipo, from: st.pid, name: st.name });
  NET.save(st);
}
// il padrone manda la missione a chi c'è: quando cambia, o quando arriva qualcuno
function insManda() {
  const st = G.st;
  if (!insPadrone() || !isFree(st) || typeof PRES_V === 'undefined' || PRES_V !== st.pid) return;
  const ids = insPresenti(),
    m = st.free.insieme && st.free.insieme.day === st.day ? st.free.insieme : null,
    firma = JSON.stringify([m, ids]);
  if (!ids.length || firma === INS.mandata) return;
  INS.mandata = firma;
  for (const pid of ids) MP.act(pid, { t: 'ins', m, from: st.pid });
}

// ---------- le azioni che contano (Ext 'fatto': farm.js, free.js, mp.js) ----------
Ext.on('fatto', (tipo, n = 1) => {
  try {
    const st = G.st,
      m = insMissione();
    if (!m || m.tipo !== tipo || m.premiato) return;
    if (insPadrone()) return insConta(st, st.pid, st.name, n);
    // ospite: il contributo parte per il padrone; intanto lo si vede subito
    const h = G.home,
      v = G.visit || INS.visita;
    if (!h || !v) return;
    MP.act(v.pid, { t: 'insc', tipo, n, day: m.day, from: h.pid, name: h.name });
    m.fatto = Math.min(m.obj, m.fatto + n);
    UI.quest();
  } catch (e) {
    console.error(e);
  }
});
// (durante le azioni da ospite col permesso G.visit è azzerato per un attimo: si ricorda la visita)
Ext.on('mpTick', () => {
  try {
    if (G.visit) INS.visita = G.visit;
    else if (!G.home) INS.visita = null;
    insArrivi();
    insApri();
    insManda();
  } catch (e) {
    console.error(e);
  }
});

// ---------- la posta ----------
Ext.on('posta', a => {
  if (a.t === 'ins') {
    const v = G.visit;
    if (!v || v.pid !== a.from) return true;
    const prima = INS.missione;
    INS.missione = a.m || null;
    if (a.m && (!prima || prima.day !== a.m.day || prima.tipo !== a.m.tipo))
      UI.toast(
        `🤝 Missione comune di ${v.name}: ${insTesto(a.m)}. Premio per ognuno: ${SC(INS_TIPI[a.m.tipo].premio)}.`
      );
    UI.quest();
    return true;
  }
  if (a.t === 'insc') {
    const st = myHome();
    if (G.home || !st || !isFree(st) || !G.others || !G.others[a.from] || !INS_TIPI[a.tipo]) return true;
    const m = st.free.insieme;
    if (m && m.tipo === a.tipo && m.day === a.day) insConta(st, a.from, a.name || G.others[a.from].name, a.n);
    return true;
  }
  if (a.t === 'insp') {
    const st = myHome(),
      n = Math.max(0, Math.min(1000, a.n | 0));
    if (!st || !n) return true;
    (G.visit ? G.st : st).money += n;
    UI.hud();
    AU.play('coin');
    UI.toast(`🤝 Missione comune compiuta con ${a.name || 'gli amici'}! +${SC(n)}.`);
    NET.save(st);
    return true;
  }
  return false;
});

// ---------- nel pannello degli obiettivi ----------
QUESTS.push({
  free: 1,
  s: () => !!insMissione(),
  t: () => {
    const m = insMissione();
    return m.premiato
      ? `🤝 Missione comune compiuta: ${insTesto(m)}.`
      : `🤝 ${insTesto(m)} (${m.fatto}/${m.obj})`;
  },
  d: () => false
});

// ---------- il pannello 👥: chi c'è e cosa può fare ----------
const INS_PUO = [
  [
    'Ogni ospite',
    'annaffia i campi, lascia regali nella cassetta, scrive (✉), dà oggetti al volo (A davanti a qualcuno) e aiuta nella missione comune.'
  ],
  [
    'Con «🔨 Può costruire»',
    'anche costruire e spostare (B), zappare e seminare, usare casse e macchine, abbattere alberi e falciare.'
  ],
  [
    'Nessun ospite',
    'toglie le costruzioni del padrone, dorme nel suo letto, vende dalla sua cassetta, usa la sua bacheca o il museo. Il raccolto resta del padrone.'
  ]
];
function insiemeMenu() {
  const casa = myHome(),
    padrone = insPadrone(),
    fr = casa.mpFriends || [],
    ids = insPresenti(),
    nomeVillaggio = padrone ? 'Il tuo villaggio' : `Il villaggio di ${esc((G.visit && G.visit.name) || '')}`;
  const ruolo = pid => {
    if (!padrone) return G.visit && pid === G.visit.pid ? 'padrone' : 'ospite';
    const f = fr.find(x => x.pid === pid);
    return f && f.coop ? 'ospite · 🔨 può costruire' : 'ospite';
  };
  const io = padrone ? 'padrone' : G.visit && G.visit.coop ? 'ospite · 🔨 puoi costruire' : 'ospite';
  const righe =
    `<div class="mrow"><span><b>${esc(casa.name)}</b> <span class="small">(tu) · ${io}</span></span></div>` +
    ids
      .map(pid => {
        const o = G.others[pid],
          f = fr.find(x => x.pid === pid);
        const btn = !padrone
          ? ''
          : f
            ? `<button class="btn${f.coop ? ' on' : ''}" data-perm="${esc(pid)}">${f.coop ? '🔨 Può costruire ✓' : '🔨 Può costruire'}</button>`
            : `<button class="btn" data-amico="${esc(pid)}">Aggiungi agli amici</button>`;
        return `<div class="mrow"><span style="flex:1"><b>${esc(o.name || '?')}</b> <span class="small">· ${ruolo(pid)}</span></span>${btn}</div>`;
      })
      .join('');
  const m = insMissione();
  const missione = m
    ? `<h3>Missione comune di oggi</h3><p><b>${insTesto(m)}</b> — ${m.premiato ? 'compiuta!' : `${m.fatto}/${m.obj}`}</p><div class="ins-barra"><b style="width:${Math.round((100 * m.fatto) / m.obj)}%"></b></div>` +
      `<p class="small">Premio per ognuno: ${SC(INS_TIPI[m.tipo].premio)}.${
        m.chi && Object.keys(m.chi).length
          ? ' Finora: ' +
            Object.values(m.chi)
              .map(c => `${esc(c.name)} ${c.n}`)
              .join(', ') +
            '.'
          : ''
      }</p>`
    : `<h3>Missione comune</h3><p class="small">Quando nel villaggio ci sono più giocatori, il padrone apre una missione del giorno da fare insieme: un premio per ognuno.</p>`;
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>👥 ${nomeVillaggio}</h2>${righe || ''}${ids.length ? '' : '<p class="small">Per ora ci sei solo tu.</p>'}` +
      missione +
      `<h3>Cosa si può fare insieme</h3>${INS_PUO.map(([a, b]) => `<p class="small"><b>${a}</b>: ${b}</p>`).join('')}`
  );
  const box = $('#mbox');
  box.querySelectorAll('[data-perm]').forEach(
    b =>
      (b.onclick = async () => {
        await coopToggle(b.dataset.perm);
        UI._mclose = null;
        insiemeMenu();
      })
  );
  box.querySelectorAll('[data-amico]').forEach(
    b =>
      (b.onclick = () => {
        const pid = b.dataset.amico,
          o = G.others[pid];
        if (o && !fr.some(f => f.pid === pid)) (casa.mpFriends = fr).push({ pid, name: o.name || '?' });
        AU.play('ok');
        UI.toast(`${(o && o.name) || 'Amico'} aggiunto agli amici.`);
        NET.save(casa);
        UI._mclose = null;
        insiemeMenu();
      })
  );
}
{
  const b = $('#bIns');
  if (b)
    b.onclick = () => {
      if (G.mode !== 'game' || G.cut || UI.busy()) return;
      AU.play('ui');
      insiemeMenu();
    };
}
addEventListener('keydown', e => {
  if (e.code !== 'KeyU' || e.repeat || (e.target && e.target.tagName === 'INPUT')) return;
  if (G.mode !== 'game' || G.cut || UI.busy() || typeof PRES_V === 'undefined' || !PRES_V) return;
  e.preventDefault();
  insiemeMenu();
});
