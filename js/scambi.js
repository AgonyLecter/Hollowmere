'use strict';
// ================= SCAMBI TRA AMICI =================
// Dal ponte, accanto a ogni amico: «✉ Manda». Oggetti (quanti vuoi), scudi, e una dritta scritta (una lettera).
// Si possono mandare anche se l'altro è offline: arrivano nella sua posta (visite/<pid>). Si accettano solo
// dagli amici, e se si conosce la loro identità (uid) deve coincidere.

const amico = (st, pid) => (st.mpFriends || []).find(f => f.pid === pid);
async function friendUids(st) {
  if (!NET.ok) return;
  for (const f of st.mpFriends || []) {
    if (f.uid) continue;
    try {
      const s = await NET.api.get(NET.r('villaggi/' + f.pid + '/uid'));
      if (s.val()) f.uid = s.val();
    } catch (e) {
      rete(e, 'scambi');
    }
  }
}
function scambioMenu(pid, tab) {
  const st = myHome(),
    f = amico(st, pid);
  if (!f) return;
  tab = tab || 'oggetti';
  const tabs = `<div class="tabs">${[
    ['oggetti', 'Oggetti'],
    ['scudi', 'Scudi'],
    ['dritta', 'Una dritta']
  ]
    .map(([k, n]) => `<button class="btn ${k === tab ? 'on' : ''}" data-st="${k}">${n}</button>`)
    .join('')}</div>`;
  const head = `<button class="btn mclose" data-close>✕</button><h2>Manda a ${esc(f.name)}</h2><p class="small">Arriva anche se ${esc(f.name)} adesso non c'è: lo trova nella sua posta.</p>`;
  if (tab === 'oggetti') {
    const L = st.inv.map((s, i) => [s, i]).filter(([s]) => s && !['key', 'tool'].includes(ITEMS[s.id].t));
    UI.open(
      head +
        tabs +
        (L.length
          ? L.map(
              ([s, i]) =>
                `<div class="mrow"><canvas data-i="${s.id}" width="32" height="32"></canvas><span style="flex:1">${ITEMS[s.id].n} <span class="small">(${s.n})</span></span>${[
                  1, 5
                ]
                  .filter(q => q < s.n)
                  .map(q => `<button class="btn" data-g="${i}" data-q="${q}">×${q}</button>`)
                  .join(' ')} <button class="btn" data-g="${i}" data-q="${s.n}">Tutti (${s.n})</button></div>`
            ).join('')
          : '<p>Nello zaino non hai niente da mandare.</p>')
    );
  }
  if (tab === 'scudi')
    UI.open(
      head +
        tabs +
        `<p>Hai <b>${CZ(st.money)}</b>.</p><p>${[50, 100, 500, 1000].map(v => `<button class="btn" data-m="${v}" ${st.money >= v ? '' : 'disabled'}>${CZ(v)}</button>`).join(' ')}</p><p><input class="tx" id="scQ" type="number" min="1" max="${st.money}" placeholder="Quanti scudi" style="width:50%"> <button class="btn" id="scGo">Manda</button></p>`
    );
  if (tab === 'dritta')
    UI.open(
      head +
        tabs +
        `<p class="small">Un consiglio, un segreto, un saluto. Resta nella sua posta da rileggere.</p><textarea class="tx" id="drT" maxlength="160" rows="4" style="width:100%" placeholder="Es. Al piano 20 della miniera c'è un sacco d'oro. Porta pane."></textarea><p style="text-align:right"><button class="btn" id="drGo">Manda la lettera</button></p>`
    );
  const box = $('#mbox'),
    again = t => {
      UI._mclose = null;
      scambioMenu(pid, t);
    };
  box.querySelectorAll('[data-st]').forEach(b => (b.onclick = () => again(b.dataset.st)));
  box.querySelectorAll('canvas[data-i]').forEach(c => {
    const ic = ICON[c.dataset.i];
    if (ic) c.getContext('2d').drawImage(ic, 0, 0);
  });
  const send = a => MP.act(pid, Object.assign({ from: st.pid, name: st.name }, a));
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
        UI.toast(`Mandato a ${f.name}: ${q} × ${ITEMS[id].n}.`);
        UI.hotbar();
        NET.save(st);
        again('oggetti');
      })
  );
  const money = v => {
    v = Math.floor(+v || 0);
    if (v < 1 || v > st.money) {
      UI.toast('Non hai abbastanza scudi.', 'bad');
      return;
    }
    st.money -= v;
    send({ t: 'scudi', n: v });
    AU.play('coin');
    UI.hud();
    UI.toast(`Mandati ${SC(v)} a ${f.name}.`);
    NET.save(st);
    again('scudi');
  };
  box.querySelectorAll('[data-m]').forEach(b => (b.onclick = () => money(b.dataset.m)));
  {
    const g = $('#scGo');
    if (g) g.onclick = () => money($('#scQ').value);
  }
  {
    const g = $('#drGo');
    if (g)
      g.onclick = () => {
        const t = $('#drT').value.replace(/[<>]/g, '').trim().slice(0, 160);
        if (!t) {
          UI.toast('Scrivi qualcosa.');
          return;
        }
        send({ t: 'lettera', txt: t });
        AU.play('ok');
        UI.toast(`Lettera mandata a ${f.name}.`);
        UI._mclose = null;
        UI.close();
      };
  }
}
// la posta ricevuta: lettere da rileggere
function postaMenu() {
  const st = myHome(),
    L = (st.free.lettere || []).slice().reverse();
  st.free.letNew = 0;
  UI.open(
    `<button class="btn mclose" data-close>✕</button><h2>La tua posta</h2>` +
      (L.length
        ? L.map(
            l =>
              `<div class="mrow" style="display:block"><p style="margin:0"><b>${esc(l.name)}</b> <span class="small">· giorno ${l.day}</span></p><p style="margin:calc(1*var(--u)) 0 0;white-space:pre-line">${esc(l.txt)}</p></div>`
          ).join('')
        : '<p class="small">Nessuna lettera, per ora. Gli amici te le mandano dal ponte.</p>')
  );
}
// nel ponte: «✉ Manda» accanto a ogni amico, e la posta
{
  const _tm = travelMenu;
  travelMenu = async function () {
    const r = await _tm();
    const box = $('#mbox');
    if (!r || !UI.modalOpen || !box) return r;
    const st = myHome(),
      fr = st.mpFriends || [];
    friendUids(st);
    box.querySelectorAll('[data-v]').forEach(b => {
      const f = fr.find(x => x.pid === b.dataset.v);
      if (!f) return;
      const t = document.createElement('button');
      t.className = 'btn';
      t.textContent = '✉ Manda';
      t.title = 'Manda oggetti, scudi o una dritta';
      t.onclick = () => {
        UI._mclose = null;
        scambioMenu(f.pid);
      };
      b.after(t);
    });
    const n = (st.free.lettere || []).length,
      nw = st.free.letNew || 0;
    const p = document.createElement('p');
    p.innerHTML = `<button class="btn" id="tvPosta">📬 La tua posta${nw ? ` (${nw} nuove)` : n ? ` (${n})` : ''}</button>`;
    const first = box.querySelector('p');
    if (first) first.after(p);
    p.querySelector('button').onclick = () => {
      UI._mclose = null;
      postaMenu();
    };
    return r;
  };
}
// arriva qualcosa
{
  const _ia = inboxApply;
  inboxApply = function (a) {
    if (!a || !['dono', 'scudi', 'lettera'].includes(a.t)) return _ia(a);
    const st = myHome();
    if (!st || !isFree(st)) return;
    const f = amico(st, a.from);
    if (!f || (f.uid && a.uid && f.uid !== a.uid)) return;
    const nm = f.name || a.name || 'Un amico';
    if (a.t === 'dono' && ITEMS[a.item]) {
      const n = Math.max(1, Math.min(999, a.n | 0));
      st.mailbox = st.mailbox || [];
      st.mailbox.push({ item: a.item, n, from: nm });
      UI.toast(`📦 ${nm} ti ha mandato ${n} × ${ITEMS[a.item].n}: è nella cassetta delle spedizioni.`);
    }
    if (a.t === 'scudi') {
      const n = Math.max(1, Math.min(1000000, a.n | 0));
      st.money += n;
      UI.hud();
      AU.play('coin');
      UI.toast(`💰 ${nm} ti ha mandato ${SC(n)}.`);
    }
    if (a.t === 'lettera' && a.txt) {
      st.free.lettere = (st.free.lettere || [])
        .concat({ name: nm, txt: String(a.txt).slice(0, 160), day: st.day })
        .slice(-30);
      st.free.letNew = (st.free.letNew || 0) + 1;
      AU.play('blip');
      UI.toast(
        `✉ Lettera da ${nm}: «${String(a.txt).slice(0, 60)}${a.txt.length > 60 ? '…' : ''}» — al ponte, nella tua posta.`
      );
    }
    NET.save(st);
  };
}
GUIDES.push({
  id: 'scambi',
  v: 10,
  n: 'Scambi tra amici',
  steps: [
    {
      t: "Agli amici adesso puoi mandare quello che vuoi, anche se non sono online: al ponte, accanto a ogni amico, c'è «✉ Manda».",
      at: () => ({ x: 44 * 16 + 16, y: 41 * 16 + 4, l: 'Il ponte' })
    },
    {
      t: 'Oggetti (quanti ne vuoi), scudi, oppure una dritta: una lettera con un consiglio o un segreto. Gli oggetti arrivano nella sua cassetta delle spedizioni, gli scudi subito.'
    },
    {
      t: 'Le lettere che ricevi restano nella tua posta, al ponte: «📬 La tua posta». Si accettano solo dagli amici.'
    }
  ]
});
