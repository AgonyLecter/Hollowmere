'use strict';
// ================= MATERIALI RARI, MERCATO TRA VILLAGGI, INVITI =================
// Ogni villaggio ha nelle sue rocce due soli materiali rari su quattro (scelti dal codice del villaggio):
// per avere gli altri bisogna commerciare con gli altri giocatori, al mercato del ponte.
const RARE = {
  rame: { n: 'Minerale di rame', v: 40, c: '#c8703a', w: 5 },
  nichel: { n: 'Minerale di nichel', v: 60, c: '#a8b0a8', w: 4 },
  oro: { n: 'Oro grezzo', v: 150, c: '#f0c83a', w: 2 },
  diamante: { n: 'Diamante', v: 400, c: '#a8e8f8', w: 1 }
};
for (const [id, r] of Object.entries(RARE))
  ITEMS[id] = {
    n: r.n,
    t: 'res',
    v: r.v,
    d:
      (id === 'diamante'
        ? 'Materiale raro.'
        : 'Minerale raro, ancora nella roccia: nella fornace diventa lingotto.') +
      ' Nelle rocce di ogni villaggio ce ne sono solo due su quattro; gli altri si trovano in miniera, si scambiano al mercato del ponte o si comprano da Brom, nella fucina.'
  };
Object.assign(PL, {
  rame: 'minerali di rame',
  nichel: 'minerali di nichel',
  oro: "pepite d'oro grezzo",
  diamante: 'diamanti'
});
Object.assign(SG, {
  rame: 'un minerale di rame',
  nichel: 'un minerale di nichel',
  oro: "una pepita d'oro",
  diamante: 'un diamante'
});
// dove si trovano i materiali che chiedono i miglioramenti: lo si dice accanto a quelli che mancano
const DOVE_MAT = {
  ferro: 'rocce della miniera; cassa dei minerali di Brom',
  lingotto: 'fornace (5 ferro e 1 legna); cassa dei minerali di Brom',
  quarzo: 'miniera, dal piano 10',
  rame: 'miniera dal piano 10; cassa di Brom; mercato del ponte',
  nichel: 'miniera dal piano 10; cassa di Brom; mercato del ponte',
  oro: 'miniera dal piano 10 (di più dal 20); cassa di Brom; mercato del ponte',
  lingotto_rame: 'fornace (4 minerali di rame e 1 legna)',
  lingotto_nichel: 'fornace (4 minerali di nichel e 1 legna)',
  lingotto_oro: "fornace (3 pepite d'oro grezzo e 1 legna)",
  ametista: 'miniera, dal piano 20',
  diamante: 'miniera dal piano 20; Nove, al cimitero di notte; mercato del ponte'
};
Object.assign(DOVE_MAT, {
  legna: 'alberi e rami a terra',
  pietra: 'sassi e rocce',
  fibra: 'erbacce ed erba alta',
  uovo: 'dalle galline; a volte nella dispensa in piazza',
  latte: 'dalle mucche',
  lana: 'dalle pecore',
  miele: 'dalle arnie'
});
const DOVE_STAG = ['autunno', 'inverno', 'primavera', 'estate'];
// dove si trova una cosa, in parole: minerali e materiali, erbe spontanee (in che stagione), colture
function doveTesto(id) {
  if (DOVE_MAT[id]) return DOVE_MAT[id];
  const sel = [0, 1, 2, 3].filter(s => (WILD[s] || []).includes(id));
  if (sel.length)
    return `spontanea in ${sel.map(s => DOVE_STAG[s]).join(' e ')}: nei prati e ai margini del bosco, sotto la stellina che luccica`;
  if (CROPS[id]) {
    const cs = CROPS[id].s;
    return `si coltiva${cs ? ' in ' + cs.map(s => DOVE_STAG[s]).join(' e ') : ''}: i semi da Agatha`;
  }
  return '';
}
// accanto a un materiale che manca (in HTML): dove trovarlo, se l'aiuto è acceso
function doveMat(id, n) {
  const t = AIUTO_DOVE.on && countItem(id) < n ? doveTesto(id) : '';
  return t ? ` <span class="small" style="opacity:.75">— ${t}</span>` : '';
}
// la stessa cosa in testo semplice (per gli avvisi e gli obiettivi)
function doveBreve(id) {
  return AIUTO_DOVE.on ? doveTesto(id) : '';
}
// le feste: cosa manca ancora e dove trovarlo (se l'aiuto è acceso)
Ext.on('festDove', (f, s) => {
  if (!AIUTO_DOVE.on) return;
  const L = Object.entries(f.need)
    .filter(([k, n]) => (s.c[k] || 0) + countItem(k) < n && doveTesto(k))
    .map(([k]) => `${ITEMS[k].n}: ${doveTesto(k)}`);
  if (L.length) UI.toast('Dove cercare. ' + L.join(' · '));
});
function veinOf(pid) {
  let h = 0;
  for (const c of String(pid || 'HM')) h = (h * 131 + c.charCodeAt(0)) >>> 0;
  const L = Object.keys(RARE),
    a = L[h % 4],
    // >>> e non >>: h arriva fino a 2^32, e lo spostamento con il segno lo renderebbe negativo (indice fuori)
    b = L[((h >>> 3) % 3) + (L.indexOf(a) <= (h >>> 3) % 3 ? 1 : 0)];
  return [a, b === a ? L[(L.indexOf(a) + 1) % 4] : b];
}
function rareDrop(o) {
  const st = G.st;
  if (!isFree(st) || G.visit) return;
  const V = veinOf(st.pid);
  if (Math.random() > 0.2) return;
  const tot = V.reduce((a, k) => a + RARE[k].w, 0);
  let r = Math.random() * tot,
    pick = V[0];
  for (const k of V) {
    r -= RARE[k].w;
    if (r <= 0) {
      pick = k;
      break;
    }
  }
  riponi(pick, 1);
  floatText('+ ' + RARE[pick].n + '!', o.tx * 16 + 8, o.ty * 16 - 22, RARE[pick].c, 2);
  AU.play('ok');
  addXP('racc', 6);
  if (!st.flags.rareTip) {
    st.flags.rareTip = 1;
    tip(
      'tutRare',
      `Hai trovato ${RARE[pick].n.toLowerCase()}! Le rocce del tuo villaggio danno ${V.map(k => RARE[k].n.toLowerCase()).join(' e ')}. Gli altri li trovi in miniera, al mercato del ponte o da Brom, nella fucina.`
    );
  }
}
// oggetti che chiedono i materiali rari
Object.assign(ITEMS, {
  statua: { n: "Statua d'oro", t: 'place', d: "Un forestiero d'oro, a braccia aperte. Brilla al tramonto." },
  fontana: { n: 'Fontana di rame', t: 'place', d: "L'acqua canta tutto il giorno." },
  banderuola: { n: 'Banderuola', t: 'place', d: 'Un gallo di rame che gira col vento.' },
  lampadario: {
    n: 'Lampadario di cristallo',
    t: 'arredo',
    d: 'Con un diamante al centro. Fa una luce che sembra ridere.'
  },
  specchio: {
    n: 'Specchio di nichel',
    t: 'arredo',
    d: 'Ti ci vedi bene. Meglio di quanto pensassi.',
    wall: 1
  },
  attrezzi_oro: {
    n: "Attrezzi d'oro",
    t: 'key',
    d: "Accetta e piccone con il filo d'oro: un colpo in meno per ogni albero e roccia."
  }
});
CRAFTS.push(
  { id: 'statua', q: 1, c: { lingotto_oro: 2, pietra: 20 }, cat: 'est' },
  { id: 'fontana', q: 1, c: { lingotto_rame: 2, pietra: 30 }, cat: 'est' },
  { id: 'banderuola', q: 1, c: { lingotto_rame: 1, legna: 5 }, cat: 'est' },
  { id: 'lampadario', q: 1, c: { diamante: 1, lingotto_rame: 1, lingotto_nichel: 1 }, cat: 'cas' },
  { id: 'specchio', q: 1, c: { lingotto_nichel: 1, legna: 10 }, cat: 'cas' },
  { id: 'attrezzi_oro', q: 1, c: { lingotto_oro: 1, lingotto: 2 }, cat: 'agr' }
);
Object.assign(PLACE_TOOL, { statua: 'piccone', fontana: 'piccone', banderuola: 'accetta' });
// la casa grande di Brom ora vuole anche il nichel: un motivo in più per commerciare
if (typeof HOUSE_UP !== 'undefined') HOUSE_UP[3].c.lingotto_nichel = 1; // il nichel si fonde come il ferro
const goldTools = () => isFree() && countItem('attrezzi_oro') > 0;

// ---------- mercato del ponte (Firebase: mercato/) ----------
const MARKET = { list: [], off: null };
function marketListen() {
  if (!NET.ok || MARKET.off) return;
  const D = NET.api;
  MARKET.off = D.onValue(
    D.query(NET.r('mercato'), D.limitToLast(60)),
    s => {
      const v = s.val() || {};
      MARKET.list = Object.entries(v)
        .map(([id, o]) => Object.assign({ id }, o))
        .filter(o => o && o.item && !o.buyer)
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
      if (UI.modalOpen && G.marketOpen) marketMenu();
    },
    () => {}
  );
}
async function marketPost(item, n, price) {
  const st = G.st,
    me = G.visit ? G.home : st;
  if (!NET.ok) {
    UI.toast('Il mercato è online: serve la connessione.', 'bad');
    return;
  }
  if (countItem(item) < n) return;
  removeItem(item, n);
  try {
    await NET.own(me.pid);
    await NET.api.push(NET.r('mercato'), { seller: me.pid, sname: me.name, item, n, price, ts: Date.now() });
    AU.play('coin');
    UI.toast(`In vendita: ${n} × ${ITEMS[item].n} per ${SC(price)}.`);
    NET.save(me);
  } catch (e) {
    riponi(item, n);
    UI.toast('Il mercato non risponde. Riprova più tardi.', 'bad');
  }
}
async function marketBuy(o) {
  const st = G.visit ? G.home : G.st;
  if (st.money < o.price) {
    UI.toast('Non hai abbastanza scudi.', 'bad');
    return;
  }
  if (o.seller === st.pid) {
    UI.toast('Questa è la tua offerta.');
    return;
  }
  const D = NET.api,
    ref = NET.r('mercato/' + o.id);
  let won = false;
  try {
    await D.runTransaction(ref, cur => {
      if (!cur || cur.buyer) return;
      cur.buyer = st.pid;
      cur.buid = NET.uid || '';
      return cur;
    }).then(r => {
      won = r.committed && r.snapshot.val() && r.snapshot.val().buyer === st.pid;
    });
  } catch (e) {
    rete(e, 'trade');
  }
  if (!won) {
    UI.toast("Qualcuno è stato più veloce: l'offerta non c'è più.", 'bad');
    return;
  }
  st.money -= o.price;
  riponi(o.item, o.n);
  UI.hud();
  AU.play('coin');
  UI.toast(`Comprato: ${o.n} × ${ITEMS[o.item].n} da ${o.sname}.`);
  MP.act(o.seller, { t: 'sale', item: o.item, n: o.n, price: o.price, from: st.name });
  D.remove(ref).catch(() => {});
  NET.save(st);
}
async function marketCancel(o) {
  const st = G.visit ? G.home : G.st;
  try {
    await NET.api.remove(NET.r('mercato/' + o.id));
    riponi(o.item, o.n);
    UI.toast('Offerta ritirata.');
    NET.save(st);
  } catch (e) {
    UI.toast('Non riesco a ritirarla adesso.', 'bad');
  }
}
function marketMenu() {
  const st = G.visit ? G.home : G.st;
  G.marketOpen = 1;
  marketListen();
  const V = veinOf(st.pid),
    tradable = st.inv.filter(s => s && (RARE[s.id] || ITEMS[s.id].t === 'crop' || ITEMS[s.id].t === 'res'));
  const mine = MARKET.list.filter(o => o.seller === st.pid),
    others = MARKET.list.filter(o => o.seller !== st.pid);
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>Il mercato del ponte</h2><p class="small">Le tue rocce danno <b>${V.map(k => RARE[k].n.toLowerCase()).join(' e ')}</b>. Gli altri materiali si comprano qui da altri giocatori, e qui vendi i tuoi. — Hai <b>${CZ(st.money)}</b></p>` +
      `<h3>In vendita dagli altri</h3>${
        others.length
          ? others
              .slice(0, 14)
              .map(
                o =>
                  `<div class="mrow"><canvas data-i="${o.item}" width="32" height="32"></canvas><span>${o.n} × ${esc(ITEMS[o.item] ? ITEMS[o.item].n : o.item)}<br><span class="small">da ${esc(o.sname)}</span></span><b class="price">${CZ(o.price)}</b><button class="btn" data-buy="${esc(o.id)}" ${st.money >= o.price ? '' : 'disabled'}>Compra</button></div>`
              )
              .join('')
          : '<p class="small">Nessuna offerta, per ora.</p>'
      }` +
      `<h3>Le tue offerte</h3>${mine.length ? mine.map(o => `<div class="mrow"><canvas data-i="${o.item}" width="32" height="32"></canvas><span>${o.n} × ${esc(ITEMS[o.item].n)}</span><b class="price">${CZ(o.price)}</b><button class="btn" data-cancel="${esc(o.id)}">Ritira</button></div>`).join('') : '<p class="small">Nessuna.</p>'}` +
      `<h3>Metti in vendita</h3>${tradable.length ? `<p><select id="mkI" class="tx" style="width:45%">${tradable.map(s => `<option value="${s.id}">${esc(ITEMS[s.id].n)} (${s.n})</option>`).join('')}</select> <input id="mkN" class="tx" type="number" min="1" value="1" style="width:16%"> <input id="mkP" class="tx" type="number" min="1" value="100" style="width:20%"> scudi <button class="btn" id="mkGo">Vendi</button></p><p class="small">Gli oggetti restano al mercato finché qualcuno li compra; i soldi ti arrivano anche se sei offline. Puoi ritirarli quando vuoi.</p>` : '<p class="small">Non hai niente da vendere: materiali, risorse e raccolti.</p>'}`
  );
  $('#mbox')
    .querySelectorAll('canvas[data-i]')
    .forEach(c => {
      const i = ICON[c.dataset.i];
      if (i) c.getContext('2d').drawImage(i, 0, 0);
    });
  $('#mbox')
    .querySelectorAll('[data-buy]')
    .forEach(
      b =>
        (b.onclick = () => {
          const o = MARKET.list.find(x => x.id === b.dataset.buy);
          if (o) marketBuy(o);
        })
    );
  $('#mbox')
    .querySelectorAll('[data-cancel]')
    .forEach(
      b =>
        (b.onclick = () => {
          const o = MARKET.list.find(x => x.id === b.dataset.cancel);
          if (o) marketCancel(o);
        })
    );
  const go = $('#mkGo');
  if (go)
    go.onclick = () => {
      const it = $('#mkI').value,
        n = Math.max(1, Math.min(countItem(it), +$('#mkN').value || 1)),
        p = Math.max(1, Math.min(99999, +$('#mkP').value || 1));
      UI._mclose = null;
      UI.close();
      marketPost(it, n, p);
    };
  UI._mclose = () => {
    G.marketOpen = 0;
  };
}

// ---------- inviti ----------
async function inviteFriend(code) {
  const st = G.visit ? G.home : G.st;
  if (!/^HM-[A-Z0-9]{6}$/.test(code)) {
    UI.toast('Il codice è fatto così: HM-XXXXXX.');
    return;
  }
  if (code === st.pid) {
    UI.toast('Quello è il tuo codice.');
    return;
  }
  const s = await MP.load(code);
  if (!s) {
    UI.toast('Nessun villaggio con questo codice.', 'bad');
    return;
  }
  st.mpFriends = st.mpFriends || [];
  if (!st.mpFriends.some(f => f.pid === code)) st.mpFriends.push({ pid: code, name: s.name });
  MP.act(code, { t: 'invite', from: st.pid, name: st.name });
  AU.play('ok');
  UI.toast(`Invito mandato a ${s.name}. Vedrà il tuo villaggio tra gli amici, e tu il suo.`);
  NET.save(st);
}
function inviteReceived(a, st) {
  st.mpFriends = st.mpFriends || [];
  st.free.invites = st.free.invites || [];
  if (!st.mpFriends.some(f => f.pid === a.from))
    st.mpFriends.push({ pid: a.from, name: a.from_name || a.name || '?' });
  if (!st.free.invites.some(i => i.pid === a.from))
    st.free.invites.push({ pid: a.from, name: a.name || '?', ts: a.ts || Date.now() });
  UI.toast(`✉ ${a.name || 'Qualcuno'} ti invita a visitare il suo villaggio. Al ponte, tra gli amici.`);
}

// ---------- grafica ----------
function genTradeArtBase() {
  const I = (id, fn) => {
    const P = new PX(32, 32);
    fn(P);
    P.outline();
    ICON[id] = pxCanvas(P);
  };
  for (const [id, r] of Object.entries(RARE))
    if (MINERALI[id])
      ICON[id] = iconaMinerale(id); // la roccia con le sue vene (macchine.js)
    else
      I(id, P => {
        if (id === 'diamante') {
          P.body(
            8,
            26,
            () => 16,
            Y => (Y < 14 ? (Y - 8) * 1.3 + 3 : 11 - (Y - 14) * 0.9),
            rp(r.c),
            { nyF: Y => (Y < 14 ? -0.6 : 0.4), spec: 1 }
          );
        } else {
          P.ellipse(16, 18, 10, 8, rp('#7a776d'), { spec: 0.2 });
          for (const [a, b, s] of [
            [12, 16, 3],
            [20, 19, 2.6],
            [16, 13, 2.2]
          ])
            P.ellipse(a, b, s, s * 0.8, rp(r.c), { spec: 0.9, edge: false });
        }
      });
  I('statua', P => {
    P.rect(9, 25, 14, 5, rp('#8a877d'));
    P.body(
      6,
      25,
      () => 16,
      Y => (Y < 10 ? 3 : 4 + (Y - 10) * 0.15),
      rp('#f0c83a'),
      { spec: 0.9 }
    );
    P.capsule(9, 13, 4, 9, 1.2, rp('#f0c83a'), { spec: 0.9 });
    P.capsule(23, 13, 28, 9, 1.2, rp('#f0c83a'), { spec: 0.9 });
  });
  I('fontana', P => {
    P.ellipse(16, 24, 13, 5, rp('#8a877d'), { spec: 0.3 });
    P.ellipse(16, 23, 10, 3, rp('#5a9ad8'), { spec: 0.8, edge: false });
    P.capsule(16, 22, 16, 10, 1.6, rp('#c8703a'), { spec: 0.8 });
    P.ellipse(16, 9, 5, 2.4, rp('#c8703a'), { spec: 0.8 });
  });
  I('banderuola', P => {
    P.rect(15, 12, 2, 18, rp('#5a3a1e'));
    P.ellipse(16, 9, 7, 4, rp('#c8703a'), { spec: 0.9 });
    P.capsule(21, 8, 25, 4, 1, rp('#c8703a'));
  });
  I('lampadario', P => {
    P.rect(15, 2, 2, 6, rp('#c8703a'));
    P.ellipse(16, 13, 11, 4, rp('#c8703a'), { spec: 0.9 });
    for (const x of [7, 12, 20, 25]) P.capsule(x, 14, x, 20, 0.8, rp('#d8f0f8'), { spec: 1 });
    P.body(
      15,
      24,
      () => 16,
      Y => 4 - (Y - 15) * 0.4,
      rp('#a8e8f8'),
      { spec: 1 }
    );
  });
  I('specchio', P => {
    P.ellipse(16, 16, 10, 13, rp('#a8b0a8'), { spec: 0.9 });
    P.ellipse(16, 16, 8, 11, rp('#d8e8f0'), { spec: 1, amb: 0.8 });
  });
  I('attrezzi_oro', P => {
    P.capsule(6, 28, 20, 8, 1.4, rp('#8a5a30'));
    P.ellipse(21, 8, 5, 4, rp('#f0c83a'), { spec: 0.9 });
    P.capsule(14, 28, 26, 10, 1.4, rp('#8a5a30'));
    P.capsule(20, 10, 30, 6, 1.6, rp('#f0c83a'), { spec: 0.9 });
  });
  const S = (w, h, fn) => SP(w, h, fn);
  FREEIMG.statua = S(14, 28, P => {
    P.rect(4, 44, 20, 10, rp('#8a877d'), { spec: 0.3 });
    P.body(
      6,
      44,
      () => 14,
      Y => (Y < 14 ? 4.5 : 5 + (Y - 14) * 0.12),
      rp('#f0c83a'),
      { spec: 0.9 }
    );
    P.ellipse(14, 6, 4, 4.4, rp('#f0c83a'), { spec: 0.9 });
    P.capsule(9, 18, 2, 10, 1.6, rp('#f0c83a'), { spec: 0.9 });
    P.capsule(19, 18, 26, 10, 1.6, rp('#f0c83a'), { spec: 0.9 });
  });
  FREEIMG.fontana = [0, 1].map(f =>
    S(24, 20, P => {
      P.ellipse(24, 32, 22, 7, rp('#8a877d'), { spec: 0.3 });
      P.ellipse(24, 30, 18, 5, rp('#5a9ad8'), { spec: 0.8, edge: false });
      P.capsule(24, 30, 24, 12, 2.4, rp('#c8703a'), { spec: 0.8 });
      P.ellipse(24, 11, 8, 3.4, rp('#c8703a'), { spec: 0.8 });
      for (let i = 0; i < 6; i++)
        P.ellipse(16 + i * 3.2, 8 - ((i + f) % 3) * 2, 1, 1.4, rp('#a8d8f8'), { edge: false, spec: 1 });
    })
  );
  FREEIMG.banderuola = [0, 1, 2].map(f =>
    S(14, 26, P => {
      P.rect(13, 14, 2, 36, rp('#5a3a1e'));
      P.ellipse(14, 10, f === 1 ? 3 : 8, 4, rp('#c8703a'), { spec: 0.9 });
      P.capsule(
        14 + (f === 0 ? 6 : f === 2 ? -6 : 0),
        9,
        14 + (f === 0 ? 10 : f === 2 ? -10 : 0),
        5,
        1,
        rp('#c8703a')
      );
    })
  );
  FREEIMG.lampadario = S(16, 14, P => {
    P.rect(15, 0, 2, 6, rp('#c8703a'));
    P.ellipse(16, 10, 13, 4, rp('#c8703a'), { spec: 0.9 });
    for (const x of [5, 11, 21, 27]) P.capsule(x, 12, x, 20, 0.8, rp('#d8f0f8'), { spec: 1 });
    P.body(
      12,
      24,
      () => 16,
      Y => 4 - (Y - 12) * 0.33,
      rp('#a8e8f8'),
      { spec: 1 }
    );
  });
  FREEIMG.specchio = S(12, 14, P => {
    P.ellipse(12, 14, 10, 13, rp('#a8b0a8'), { spec: 0.9 });
    P.ellipse(12, 14, 8, 11, rp('#d8e8f0'), { spec: 1, amb: 0.8 });
  });
}

// catena: altri file la avvolgono con Ext.avvolgi('genTradeArt', …)
function genTradeArt(...a) {
  return Ext.catena('genTradeArt', genTradeArtBase, this, a);
}
