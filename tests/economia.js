'use strict';
// 6. Economia: taccuino delle richieste, mercato vivo e dispensa (regole di gioco che devono restare vere).
const { openGame, skipScenes, newGame } = require('./helpers');
module.exports = async function (t, { browser }) {
  const { page, errors } = await openGame(browser);
  await newGame(page, 'Eco', 'm');
  await page.evaluate(() => {
    freeStart(3);
  });
  await skipScenes(page, { until: () => !!(G.st.free && !G.cut && !UI.busy()) });
  const r = await page.evaluate(() => {
    const st = G.st,
      out = {};
    for (const id of FAV_NPC) st.flags.met[id] = 1;
    // un mese di mattine
    let maxAperte = 0,
      doppie = 0;
    for (let d = 0; d < 30; d++) {
      st.day++;
      st.time = 6 * 60;
      genFavors();
      const A = Richieste.aperte(st);
      maxAperte = Math.max(maxAperte, A.length);
      const ids = A.map(f => f.id);
      if (new Set(ids).size !== ids.length) doppie++;
      // a metà giornata scade quello che deve scadere
      st.time = 21 * 60;
      Richieste.controlla(false);
    }
    out.maxAperte = maxAperte;
    out.tetto = Richieste.tetto(st);
    out.doppie = doppie;
    out.tipi = [...new Set(st.favors.map(f => f.tipo))].sort().join(',');
    out.scadute = st.favors.filter(f => f.esito === 'scaduta').length;
    // una richiesta scaduta: fiducia giù e pausa
    const f0 = Richieste.nuova(st, {
      id: 'brom',
      item: 'legna',
      n: 3,
      tipo: 'giorno',
      until: st.day,
      mult: 1
    });
    st.fiducia.brom = 50;
    const fid0 = Richieste.fid('brom');
    st.time = 20 * 60 + 1;
    Richieste.controlla(false);
    out.scadeAllOra = f0.esito === 'scaduta';
    out.fiduciaGiu = Richieste.fid('brom') < fid0;
    out.pausa = Richieste.inPausa(st, 'brom');
    out.amiciziaIntatta = (st.friends.brom || 0) >= 0;
    // consegna in anticipo: fiducia su e premio extra
    const f1 = Richieste.nuova(st, {
      id: 'agatha',
      item: 'uovo',
      n: 1,
      tipo: 'scadenza',
      until: st.day + 3,
      mult: 1
    });
    const fid1 = Richieste.fid('agatha'),
      soldi = st.money;
    Richieste.consegnata(f1);
    out.consegnataOk = f1.esito === 'ok' && Richieste.fid('agatha') > fid1 && st.money > soldi;
    // la festa: una richiesta nella settimana prima
    const fe = festOf(st);
    st.day = st.free.start + seasonOf(st) * SEASON_LEN + fe.day - 5;
    for (const id of FAV_NPC) delete (st.favPausa || {})[id];
    st.favors = st.favors.filter(f => f.esito);
    genFavors();
    out.festa = st.favors.some(f => f.tipo === 'festa' && !f.esito);
    // mercato: la saturazione abbassa il prezzo, la mattina lo fa risalire
    Mercato.mattina(st);
    const p = sellPrice('rapa'),
      tot = Mercato.vendi('rapa', 40);
    out.saturazione = tot < p * 40 && tot > p * 40 * 0.4;
    const u = Mercato.m(st).sat.rapa;
    st.day++;
    Mercato.mattina(st);
    out.risale = Mercato.m(st).sat.rapa < u;
    out.domanda = Object.keys(Mercato.m(st).domanda).length;
    // dispensa
    Dispensa.d(st).items = { legna: 5 };
    Dispensa.apri();
    out.dispensa = !!document.querySelector('#modal:not(.hide) [data-take]');
    UI._mclose = null;
    UI.close();
    UI.pause('rich');
    out.taccuino =
      !!document.querySelector('#modal:not(.hide) .tabs .on') &&
      /Richieste/.test(document.querySelector('#mbox .tabs .on').textContent);
    UI._mclose = null;
    UI.close();
    return out;
  });
  t.true(`le richieste aperte non superano il tetto (${r.maxAperte}/${r.tetto})`, r.maxAperte <= r.tetto);
  t.eq('mai due richieste aperte dello stesso abitante', r.doppie, 0);
  t.true(`compaiono più tipi di richiesta (${r.tipi})`, r.tipi.split(',').length >= 2);
  t.true('una richiesta del giorno scade alle 20:00', r.scadeAllOra);
  t.true('nella Valle una richiesta scaduta abbassa la fiducia…', r.fiduciaGiu);
  t.true("…mette in pausa chi l'ha fatta…", r.pausa);
  t.true('…ma non toglie amicizia (conseguenze leggere)', r.amiciziaIntatta);
  t.true('consegnare in anticipo dà fiducia e un premio extra', r.consegnataOk);
  t.true('la settimana prima della festa arriva una richiesta per la festa', r.festa);
  t.true('vendere tanto dello stesso prodotto abbassa il prezzo (ma non sotto il 40%)', r.saturazione);
  t.true('la mattina dopo il prezzo risale', r.risale);
  t.eq('ogni mattina tre prodotti sono richiesti', r.domanda, 3);
  t.true('la dispensa si apre e si può prendere', r.dispensa);
  t.true('il taccuino delle richieste si apre dal menu', r.taccuino);
  // nella storia la promessa mancata costa amicizia
  const s = await page.evaluate(() => {
    const st = G.st;
    const free = st.free;
    delete st.free;
    const f = Richieste.nuova(st, {
      id: 'clara',
      item: 'rapa',
      n: 1,
      tipo: 'scadenza',
      until: st.day,
      mult: 1,
      storia: true
    });
    const a = st.friends.clara || 0;
    st.time = 20 * 60 + 5;
    Richieste.controlla(false);
    const r = { scaduta: f.esito === 'scaduta', meno: (st.friends.clara || 0) < a };
    st.free = free;
    return r;
  });
  t.true('nella storia una promessa mancata costa amicizia', s.scaduta && s.meno);
  // «Chiacchiera»: una conversazione vera con ogni abitante, mai vuota
  const ch = await page.evaluate(async () => {
    const ids = G.npcs.filter(n => !n.script).map(n => n.id);
    const male = [];
    for (const id of ids)
      for (const f of ['umore', 'novita', 'dime'])
        for (let i = 0; i < 4; i++) {
          const t = Chiacchiera[f](id);
          if (!t || typeof t !== 'string' || /undefined|null|NaN|\[object/.test(t))
            male.push(id + '.' + f + ': ' + t);
        }
    // la conversazione completa: tre argomenti e poi «A presto»
    const _ask = UI.say;
    const scelte = [0, 1, 2, 3],
      dette = [];
    UI.say = async (id, t, mood, opts) => {
      dette.push(t);
      return opts ? scelte.shift() : undefined;
    };
    const a = G.st.friends.brom || 0;
    let fine;
    try {
      fine = await Chiacchiera.parla(NPC('brom'));
    } finally {
      UI.say = _ask;
    }
    return { ids: ids.length, male, fine, dette: dette.length, amico: (G.st.friends.brom || 0) > a };
  });
  t.eq('«Chiacchiera» ha sempre qualcosa da dire, per tutti', ch.male.slice(0, 3).join(' | '), '');
  t.true(
    '«Chiacchiera» apre una conversazione con argomenti e fa amicizia',
    ch.fine === true && ch.dette >= 7 && ch.amico
  );
  // disposizione: niente davanti alla cassetta, piazza in ordine e raggiungibile
  const pz = await page.evaluate(() => {
    const m = G.maps.main,
      bin = m.objs.find(o => o.act === 'bin');
    const vicini = ([x, y]) =>
      [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
      ].some(([a, b]) => !m.solid(x + a, y + b));
    const piazza = m.objs.filter(
      o => o.tx >= 38 && o.tx <= 51 && o.ty >= 15 && o.ty <= 23 && o.act && o.act !== 'lamp'
    );
    return {
      bin: !!bin && !m.solid(bin.tx, bin.ty + 1),
      chiusi: piazza.filter(o => !(o.hits || o.solid || [[o.tx, o.ty]]).some(vicini)).map(o => o.act),
      centro: [
        [43, 18],
        [44, 18],
        [45, 18],
        [43, 19],
        [44, 19],
        [45, 19],
        [43, 20],
        [44, 20],
        [45, 20]
      ].every(([x, y]) => !m.solid(x, y)),
      ingressi: [
        [43, 15],
        [44, 23],
        [45, 23],
        [38, 19],
        [51, 18]
      ].every(([x, y]) => !m.solid(x, y))
    };
  });
  t.true("davanti alla cassetta di vendita non c'è niente", pz.bin);
  t.eq('in piazza ogni oggetto si raggiunge', pz.chiusi.join(','), '');
  t.true('il centro della piazza resta libero (feste, falò)', pz.centro);
  t.true('gli ingressi della piazza sono liberi', pz.ingressi);
  t.eq('economia: nessun errore', errors.join('\n'), '');
  await page.close();
};
