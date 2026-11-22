'use strict';
// 12. Il cooperativo: casse e macchine dell'amico, con le mosse dei due giocatori che si incrociano.
// La stessa pagina fa sia il padrone sia l'ospite (si scambiano gli stati); i messaggi si raccolgono invece di
// passare da Firebase. Niente deve sparire e niente deve raddoppiare.
const { openGame, newGame, skipScenes } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Ada', 'f');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const R = {},
      cl = x => JSON.parse(JSON.stringify(x)),
      conta = (A, id) => (A || []).filter(s => s && s.id === id).reduce((a, s) => a + s.n, 0),
      posta = [];
    MP.act = (to, a) => posta.push(cl(Object.assign({ to }, a)));
    // il padrone (O) con una cassa e una fornace; l'ospite (Gi) con le sue cose
    const O = cl(G.st);
    O.pid = 'PADRONE';
    O.free.built['10,10'] = { id: 'cassa', inv: Array(20).fill(null) };
    O.free.built['10,10'].inv[0] = { id: 'legna', n: 10 };
    O.free.built['12,10'] = { id: 'fornace', d: O.day };
    O.mpFriends = [{ pid: 'OSPITE', name: 'Bea', coop: true }];
    const H = cl(G.st);
    H.pid = 'OSPITE';
    H.name = 'Bea';
    H.inv = Array(30).fill(null);
    H.inv[0] = { id: 'pietra', n: 5 };
    H.inv[1] = { id: 'ferro', n: 5 };
    H.inv[2] = { id: 'piccone', n: 1 };
    // l'ospite entra (come fa startVisit): il villaggio del padrone, con il suo zaino
    const ospite = () => {
      const V = cl(O);
      V.inv = H.inv;
      G.home = H;
      G.st = V;
      G.visit = { pid: 'PADRONE', name: 'Ada', coop: true, wsnap: snapW(V) };
      return V;
    };
    const padrone = () => {
      G.visit = null;
      G.home = null;
      G.st = O;
    };
    const V = ospite();
    // 1) deposita la pietra e il piccone, poi prende 3 legna (come farebbe con lo zaino)
    const C = V.free.built['10,10'];
    chestMenu('10,10');
    zTocca('z', 0, false);
    zTocca('c', 5, false);
    zTocca('z', 2, false);
    zTocca('c', 6, false);
    zTocca('c', 0, true); // metà della legna in mano (5)
    zTocca('z', 3, false);
    UI.close();
    R.opsMandate = posta.filter(m => m.t === 'cop').length;
    R.ospiteZaino = [conta(H.inv, 'pietra'), conta(H.inv, 'piccone'), conta(H.inv, 'legna')].join('/');
    // 2) e mette 5 ferro nella fornace
    machineAct('12,10', V.free.built['12,10'], { tx: 12, ty: 10 });
    const iF = H.inv.findIndex(s => s && s.id === 'ferro');
    macMetti(iF);
    UI.close();
    const cop = posta.filter(m => m.t === 'cop');
    // 3) al padrone arrivano le operazioni, la prima due volte
    padrone();
    for (const m of [cop[0], ...cop, cop[cop.length - 1]]) inboxApply(m);
    const OC = O.free.built['10,10'].inv;
    R.padroneCassa = [conta(OC, 'legna'), conta(OC, 'pietra'), conta(OC, 'piccone')].join('/');
    R.padroneFornace = (O.free.built['12,10'].m || {}).in;
    R.ack = (O.free.coopAck || {}).OSPITE;
    // 4) una fotografia VECCHIA del padrone (con solo la prima operazione confermata) arriva all'ospite:
    //    l'ospite deve continuare a vedere tutte le sue mosse, non tornare indietro
    const V2 = ospite();
    contDaPadrone(
      { '10,10': { inv: [{ id: 'legna', n: 10 }].concat(Array(19).fill(null)), m: null } },
      { OSPITE: 0 }
    );
    const VC = V2.free.built['10,10'].inv;
    R.ospiteVedeCassa = [conta(VC, 'legna'), conta(VC, 'pietra'), conta(VC, 'piccone')].join('/');
    // ...e quando arriva quella giusta, con la conferma, le operazioni in sospeso si chiudono
    contDaPadrone({ '10,10': { inv: cl(OC), m: null } }, cl(O.free.coopAck));
    R.inSospeso = (H.free.coopPend || {}).PADRONE ? H.free.coopPend.PADRONE.length : 0;
    R.ospiteVedeCassa2 = [
      conta(V2.free.built['10,10'].inv, 'legna'),
      conta(V2.free.built['10,10'].inv, 'pietra')
    ].join('/');
    // 5) il padrone sposta la cassa piena: il contenuto la segue
    padrone();
    applyW(O, { built: { '10,10': null, '20,20': { id: 'cassa' } } });
    R.spostata = conta((O.free.built['20,20'] || {}).inv, 'pietra');
    // 6) durante una visita si salva la propria partita, non il villaggio dell'amico
    ospite();
    NET.save(G.st);
    let salvato = null;
    try {
      salvato = JSON.parse(LS.get('hm_free')).pid;
    } catch (e) {}
    R.salvataggio = salvato;
    padrone();
    return R;
  });
  t.true('l’ospite manda operazioni, non fotografie', r.opsMandate >= 1);
  t.eq('lo zaino dell’ospite: pietra e piccone depositati, 5 legna prese', r.ospiteZaino, '0/0/5');
  t.eq(
    'la cassa del padrone: 5 legna, 5 pietre, 1 piccone (niente doppio, niente perso)',
    r.padroneCassa,
    '5/5/1'
  );
  t.eq('la fornace del padrone ha il ferro', r.padroneFornace, 5);
  t.true('il padrone conferma le operazioni', r.ack >= 2);
  t.eq('una fotografia vecchia non cancella le mosse dell’ospite', r.ospiteVedeCassa, '5/5/1');
  t.eq('confermato tutto, non resta niente in sospeso', r.inSospeso, 0);
  t.eq('e l’ospite vede la cassa giusta', r.ospiteVedeCassa2, '5/5');
  t.eq('spostando una cassa piena il contenuto la segue', r.spostata, 5);
  t.eq('in visita si salva la propria partita', r.salvataggio, 'OSPITE');
  // la missione comune: il padrone la apre quando arriva qualcuno, contano tutti, il premio va a ognuno
  const ins = await page.evaluate(() => {
    const R = {},
      posta = [];
    MP.act = (to, a) => posta.push(JSON.parse(JSON.stringify(Object.assign({ to }, a))));
    G.visit = null;
    G.home = null;
    const st = G.st;
    st.pid = 'PADRONE';
    st.mpFriends = [{ pid: 'OSPITE', name: 'Bea', coop: true }];
    PRES_V = 'PADRONE';
    G.others = { OSPITE: { name: 'Bea', g: 'f', x: 0, y: 0, seen: performance.now() } };
    insApri();
    const m = st.free.insieme;
    R.aperta = !!m && m.day === st.day;
    R.inQuest = activeQuests().some(q => /insieme|Missione comune/.test(q.t(st)));
    insManda();
    R.mandata = posta.some(p => p.t === 'ins' && p.to === 'OSPITE');
    // il padrone fa metà, l'ospite il resto
    const soldi0 = st.money;
    Ext.run('fatto', m.tipo, Math.floor(m.obj / 2));
    inboxApply({ t: 'insc', tipo: m.tipo, n: m.obj, day: st.day, from: 'OSPITE', name: 'Bea' });
    R.compiuta = m.premiato === 1 && m.fatto === m.obj;
    R.premioPadrone = st.money - soldi0;
    R.premioOspite = posta.filter(p => p.t === 'insp' && p.to === 'OSPITE').length;
    R.contributi = Object.values(m.chi)
      .map(c => c.n)
      .join('+');
    // il pannello: chi c'è, il suo ruolo, il permesso
    insiemeMenu();
    R.pannello = /Bea/.test($('#mbox').textContent) && !!$('#mbox [data-perm]');
    UI.close();
    // l'ospite riceve il premio
    const prima = st.money;
    inboxApply({ t: 'insp', n: 300, from: 'PADRONE', name: 'Ada' });
    R.premioRicevuto = st.money - prima;
    PRES_V = null;
    G.others = {};
    return R;
  });
  t.true('missione comune: il padrone la apre quando arriva un amico', ins.aperta);
  t.true('e compare negli obiettivi', ins.inQuest);
  t.true('e parte per chi c’è', ins.mandata);
  t.true('contano le azioni di tutti e due, fino in fondo', ins.compiuta);
  t.true('il padrone ha il suo premio', ins.premioPadrone > 0);
  t.eq('e il premio parte anche per l’amico', ins.premioOspite, 1);
  t.true('nel pannello 👥 c’è chi è presente, con il permesso', ins.pannello);
  t.eq('l’ospite riceve il premio', ins.premioRicevuto, 300);
  t.eq('cooperativo: nessun errore', errors.join('\n'), '');
  await page.close();
};
