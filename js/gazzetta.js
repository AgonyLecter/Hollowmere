'use strict';
// ================= LA GAZZETTA DELLA VALLE (multiplayer) =================
// Il «social» della Valle, alla maniera dell'Ottocento: niente telefoni. Ognuno ha un TRESPOLO vicino a casa con
// PENNINO, il piccione viaggiatore. Usando il trespolo si apre la Gazzetta: una bacheca di sughero con i biglietti e le
// fotografie (dagherrotipi color seppia) di tutti i giocatori. Si regalano PIUME (al posto dei «mi piace»), si
// commenta, e ogni settimana la fotografia con più piume vince un nastro e un premio.
// Quando mandi qualcosa, Pennino prende il biglietto e vola via; poi torna. Quando arriva posta degli altri,
// atterra con una lettera nel becco.
// Dati (Firebase, hollowmere/gazzetta): post/$id {pid,n,v,t,f,ts} · piume/$id/$pid: true · commenti/$id/$cid {pid,n,t,ts}
// Le regole sono in firebase/regole.json. Senza collegamento la Gazzetta dice che il piccione non trova la strada.

const GZ = {
  posts: {}, // id → post
  piume: {}, // id → { pid: true }
  commenti: {}, // id → { cid: commento }
  aperti: {}, // id dei post con i commenti aperti
  tab: 'bacheca',
  foto: null, // la fotografia appena scattata (dataURL)
  testo: '',
  racconta: false,
  off: null,
  pronto: false
};
const GZ_SETT0 = Date.UTC(2026, 0, 5); // un lunedì: le settimane della gara partono da qui
const gzSettimana = ts => Math.floor((ts - GZ_SETT0) / (7 * 864e5));
const gzMe = () => {
  const s = (typeof homeSt === 'function' && homeSt()) || G.home || G.st;
  return s || {};
};

// ---------- il collegamento (si può sostituire nei test) ----------
let GZ_DB = {
  ok: () => !!(typeof NET !== 'undefined' && NET.ok && NET.api && typeof MP !== 'undefined' && MP.ok()),
  async proprio() {
    const me = gzMe().pid;
    if (me && NET.own) await NET.own(me);
  },
  ascolta(cb) {
    const D = NET.api;
    return D.onValue(D.query(NET.r('gazzetta/post'), D.orderByKey(), D.limitToLast(40)), s =>
      cb(s.val() || {})
    );
  },
  async piume(id) {
    return (await NET.api.get(NET.r('gazzetta/piume/' + id))).val() || {};
  },
  async commenti(id) {
    const D = NET.api;
    return (await D.get(D.query(NET.r('gazzetta/commenti/' + id), D.limitToLast(30)))).val() || {};
  },
  async pubblica(p) {
    await this.proprio();
    return NET.api.push(NET.r('gazzetta/post'), p);
  },
  async togli(id) {
    await this.proprio();
    return NET.api.remove(NET.r('gazzetta/post/' + id));
  },
  async piuma(id, pid, on) {
    await this.proprio();
    return NET.api.set(NET.r(`gazzetta/piume/${id}/${pid}`), on ? true : null);
  },
  async commenta(id, c) {
    await this.proprio();
    return NET.api.push(NET.r('gazzetta/commenti/' + id), c);
  }
};

// ---------- ascolto: i biglietti arrivano da soli ----------
function gzAscolta() {
  const st = G.st;
  if (GZ.off || !st || !isFree(st) || !GZ_DB.ok()) return;
  try {
    GZ.off = GZ_DB.ascolta(all => {
      GZ.posts = all;
      GZ.pronto = true;
      gzPostaNuova();
      if (gzAperta()) gzDisegna();
    });
  } catch (e) {
    console.error(e);
    GZ.off = null;
  }
}
// c'è un biglietto di qualcun altro che non hai ancora letto?
function gzPostaNuova() {
  const st = gzMe(),
    F = (st.flags = st.flags || {}),
    visto = F.gzVisto || 0,
    me = st.pid;
  const nuovi = Object.values(GZ.posts).filter(p => p.pid !== me && p.ts > visto);
  if (!F.gzVisto) {
    // la prima volta non si annuncia tutto lo storico: da adesso in poi
    F.gzVisto = Math.max(Date.now() - 60000, ...nuovi.map(p => p.ts));
    return;
  }
  if (!nuovi.length) return;
  if (!PC.lettera) {
    PC.lettera = 1;
    if (PC.st === 'posato') PC.arriva = 1; // Pennino va a prenderla e torna con la lettera
  }
}

// ---------- PENNINO, il piccione ----------
// st: posato · parte · via · torna. Ha la lettera nel becco quando porta posta.
const PC = { st: 'posato', t: 0, lettera: 0, arriva: 0, carico: 0 };
function pcTrespolo() {
  const m = G.map;
  if (!m || m.id !== 'main' || G.visit) return null;
  return m.objs.find(o => o.kind === 'built' && o.bid === 'trespolo') || null;
}
// dove sta il piccione posato sul trespolo
const pcPosto = o => [o.dx + 7, o.dy + 3]; // sul tetto della colombaia
function pcVola(carico) {
  if (PC.st !== 'posato') return false;
  PC.st = 'parte';
  PC.t = 0;
  PC.carico = carico ? 1 : 0;
  PC.dir = Math.random() < 0.5 ? 1 : -1;
  AU.play('pick');
  return true;
}
Ext.on('mpTick', dt => {
  try {
    gzAscolta();
    const o = pcTrespolo();
    if (!o) return;
    PC.t += dt;
    if (PC.st === 'posato' && PC.arriva) {
      PC.arriva = 0;
      PC.st = 'via';
      PC.t = 2.5;
      PC.carico = 0;
      PC.dir = Math.random() < 0.5 ? 1 : -1;
    }
    if (PC.st === 'parte' && PC.t > 1.6) {
      PC.st = 'via';
      PC.t = 0;
    }
    if (PC.st === 'via' && PC.t > 4) {
      PC.st = 'torna';
      PC.t = 0;
      PC.carico = PC.lettera ? 1 : 0;
    }
    if (PC.st === 'torna' && PC.t > 1.8) {
      PC.st = 'posato';
      PC.t = 0;
      PC.carico = 0;
      if (PC.lettera) {
        AU.play('blip');
        UI.toast('🕊 Pennino è tornato con una lettera: c’è posta nuova nella Gazzetta.');
      }
    }
  } catch (e) {
    console.error(e);
  }
});
// posizione in volo: parte verso l'alto e di lato, torna dal lato opposto
function pcVolo(o) {
  const [x0, y0] = pcPosto(o),
    d = PC.dir || 1;
  if (PC.st === 'parte') {
    const k = Math.min(1, PC.t / 1.6);
    return [x0 + d * 260 * k * k, y0 - 30 * k - 150 * k * k + Math.sin(k * 8) * 2];
  }
  if (PC.st === 'torna') {
    const k = 1 - Math.min(1, PC.t / 1.8),
      e = k * k;
    return [x0 - d * 260 * e, y0 - 150 * e - 30 * k];
  }
  return null;
}

// ---------- disegno: trespolo, piccione posato, piccione in volo ----------
const PC_IMG = {};
function pcFotogramma() {
  // posato: guarda in giro, becca, si liscia le piume, tuba gonfiando il petto
  const seq = [0, 0, 1, 0, 0, 0, 3, 3, 0, 0, 2, 2, 0, 1, 0, 0];
  return PC_IMG.posato[seq[Math.floor(G.t / 0.45) % seq.length]];
}
function pcDisegna(img, x, y, dir, lettera) {
  const w = iw(img),
    h = ih(img);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h, w, h);
  if (lettera) {
    ctx.fillStyle = '#f4ecd8';
    ctx.fillRect(w / 2 - 3, -h + 3, 4, 3);
    ctx.fillStyle = '#a8301a';
    ctx.fillRect(w / 2 - 2, -h + 4, 1, 1);
  }
  ctx.restore();
}
function trespoloDisegna(e) {
  dImg(ctx, e.img, Math.round(e.dx), Math.round(e.dy));
  const mio = pcTrespolo() === e;
  if (mio && PC.st !== 'posato') return;
  const [x, y] = pcPosto(e);
  pcDisegna(pcFotogramma(), x, y + 1, Math.floor(G.t / 7) % 2 ? -1 : 1, mio && PC.lettera);
  // posta da leggere: un foglietto che dondola sopra il trespolo
  if (mio && PC.lettera) {
    const b = Math.round(Math.sin(G.t * 4) * 1.5);
    ctx.fillStyle = '#2a1406';
    ctx.fillRect(x - 5, y - 24 + b, 10, 8);
    ctx.fillStyle = '#f6ecd0';
    ctx.fillRect(x - 4, y - 23 + b, 8, 6);
    ctx.fillStyle = '#a8301a';
    ctx.fillRect(x - 1, y - 21 + b, 2, 2);
  }
}
Ext.on('listaMondo', (list, m) => {
  for (const e of list)
    if (e.kind === 'built' && e.bid === 'trespolo' && !e.disegna) e.disegna = trespoloDisegna;
  const o = pcTrespolo();
  if (!o || PC.st === 'posato' || PC.st === 'via' || !PC_IMG.volo) return;
  const p = pcVolo(o);
  if (!p) return;
  const dir = PC.st === 'parte' ? PC.dir : -PC.dir;
  list.push({
    sy: 9e9,
    draw: () => pcDisegna(PC_IMG.volo[Math.floor(G.t * 12) % PC_IMG.volo.length], p[0], p[1], dir, PC.carico)
  });
});
// usare il trespolo apre la Gazzetta (con l'accetta, invece, si toglie)
Ext.on('freeAct:intercetta', (fx, fy) => {
  const o = G.map && G.map.objAt(fx, fy),
    it = selItem();
  if (!o || o.kind !== 'built' || o.bid !== 'trespolo' || (it && it.id === 'accetta')) return false;
  Gazzetta.apri();
  return true;
});

// ---------- il trespolo: arriva da solo, e si può costruire ----------
ITEMS.trespolo = {
  n: 'Trespolo del piccione',
  t: 'place',
  d: 'Ci vive Pennino, il piccione viaggiatore. Usalo per aprire la Gazzetta della Valle.'
};
CRAFTS.push({ id: 'trespolo', q: 1, c: { legna: 12, fibra: 4 }, cat: 'est' });
PLACE_TOOL.trespolo = 'accetta';
Ext.on('freeMorning', st => {
  try {
    if (!st.free || st.flags.trespolo) return;
    st.flags.trespolo = 1;
    if (st.inv.some(s => !s) && addItem('trespolo', 1))
      setTimeout(
        () => UI.toast('🕊 Un piccione viaggiatore ti ha portato un trespolo. Mettilo vicino a casa.'),
        2500
      );
    else st.flags.trespolo = 0;
  } catch (e) {
    console.error(e);
  }
});

// ---------- la macchina fotografica ----------
// Il mirino: la Valle diventa color seppia, puoi ancora muoverti per inquadrare; Spazio o «Scatta».
const Foto = {
  on: false,
  apri() {
    if (this.on) return;
    this.on = true;
    const c = $('#game');
    if (c) c.style.filter = 'sepia(.85) contrast(1.05) brightness(1.02)';
    const d = document.createElement('div');
    d.id = 'mirino';
    d.innerHTML = `<div class="mr-c tl"></div><div class="mr-c tr"></div><div class="mr-c bl"></div><div class="mr-c br"></div><div class="mr-bar"><span>📷 Inquadra la Valle (puoi camminare). Spazio per scattare.</span><button class="btn" data-f="scatta">Scatta</button><button class="btn" data-f="no">Annulla</button></div>`;
    document.body.appendChild(d);
    d.querySelector('[data-f=scatta]').onclick = () => this.scatta();
    d.querySelector('[data-f=no]').onclick = () => this.chiudi(true);
    this._k = e => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        this.scatta();
      }
      if (e.code === 'Escape') {
        e.stopPropagation();
        this.chiudi(true);
      }
    };
    addEventListener('keydown', this._k, true);
  },
  chiudi(annulla) {
    this.on = false;
    const c = $('#game');
    if (c) c.style.filter = '';
    const d = $('#mirino');
    if (d) d.remove();
    removeEventListener('keydown', this._k, true);
    if (annulla) Gazzetta.apri('scrivi');
  },
  // la fotografia: 256×144, color seppia, con la vignettatura; JPEG piccolo (sta nel database)
  cattura() {
    const src = $('#game');
    const [c, x] = mk(256, 144);
    x.filter = 'sepia(.9) contrast(1.08) brightness(1.02)';
    x.drawImage(src, 0, 0, src.width, src.height, 0, 0, 256, 144);
    x.filter = 'none';
    const g = x.createRadialGradient(128, 72, 50, 128, 72, 150);
    g.addColorStop(0, 'rgba(40,20,5,0)');
    g.addColorStop(1, 'rgba(40,20,5,.55)');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 144);
    for (let i = 0; i < 260; i++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,210' : '40,25,10'},${(Math.random() * 0.12).toFixed(2)})`;
      x.fillRect(Math.random() * 256, Math.random() * 144, 1, 1);
    }
    let q = 0.72,
      u = c.toDataURL('image/jpeg', q);
    while (u.length > 58000 && q > 0.3) u = c.toDataURL('image/jpeg', (q -= 0.1));
    return u;
  },
  scatta() {
    if (!this.on) return;
    let u = null;
    try {
      u = this.cattura();
    } catch (e) {
      console.error(e);
    }
    AU.play('door');
    G.flash = { a: 0.9, c: '#fffbe8' };
    this.chiudi();
    GZ.foto = u;
    setTimeout(() => Gazzetta.apri('scrivi'), 350);
  }
};

// ---------- la Gazzetta ----------
const gzAperta = () => !!$('#gazzetta');
const gzQuando = ts => {
  const s = (Date.now() - ts) / 1000;
  if (s < 90) return 'adesso';
  if (s < 3600) return Math.round(s / 60) + ' minuti fa';
  if (s < 86400) return Math.round(s / 3600) + (Math.round(s / 3600) === 1 ? ' ora fa' : ' ore fa');
  if (s < 172800) return 'ieri';
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
};
const gzN = id => Object.keys(GZ.piume[id] || {}).length;
const gzRot = id => ((id.charCodeAt(id.length - 1) + id.charCodeAt(id.length - 2)) % 7) - 3;
function gzElenco() {
  return Object.entries(GZ.posts)
    .map(([id, p]) => Object.assign({ id }, p))
    .sort((a, b) => b.ts - a.ts);
}
async function gzCaricaPiume() {
  const L = gzElenco();
  await Promise.all(
    L.map(async p => {
      try {
        GZ.piume[p.id] = await GZ_DB.piume(p.id);
      } catch (e) {}
    })
  );
}
function gzBiglietto(p) {
  const me = gzMe().pid,
    mia = !!(GZ.piume[p.id] || {})[me],
    n = gzN(p.id),
    com = GZ.commenti[p.id],
    aperto = GZ.aperti[p.id];
  return `<div class="gz-post" style="transform:rotate(${gzRot(p.id) * 0.5}deg)"><i class="gz-pin"></i>
  <p class="gz-chi"><b>${esc(p.n || '?')}</b>${p.v ? ` · <span>${esc(p.v)}</span>` : ''} <span class="gz-q">${gzQuando(p.ts)}</span></p>
  ${p.f ? `<div class="gz-foto"><img src="${esc(p.f)}" alt="Fotografia di ${esc(p.n || '')}"></div>` : ''}
  ${p.t ? `<p class="gz-t">${esc(p.t).replace(/\n/g, '<br>')}</p>` : ''}
  <p class="gz-azioni"><button class="btn gz-piuma${mia ? ' on' : ''}" data-piuma="${p.id}" ${p.pid === me ? 'disabled title="Le tue piume vanno agli altri"' : ''}>🪶 ${n}</button>
  <button class="btn" data-com="${p.id}">💬 ${aperto ? 'Chiudi' : 'Commenti'}${com ? ' (' + Object.keys(com).length + ')' : ''}</button>
  ${p.pid === me ? `<button class="btn" data-togli="${p.id}">Togli</button>` : ''}</p>
  ${
    aperto
      ? `<div class="gz-com">${
          com
            ? Object.values(com)
                .sort((a, b) => a.ts - b.ts)
                .map(c => `<p><b>${esc(c.n || '?')}:</b> ${esc(c.t)}</p>`)
                .join('') || '<p class="small">Ancora nessun commento.</p>'
            : '<p class="small">Pennino va a prendere i commenti…</p>'
        }<p class="gz-scrivi"><input maxlength="140" placeholder="Scrivi un commento…" data-cin="${p.id}"><button class="btn" data-cman="${p.id}">Manda</button></p></div>`
      : ''
  }</div>`;
}
function gzBacheca() {
  const L = gzElenco();
  if (!GZ.pronto) return '<p class="gz-vuoto">Pennino sta portando la Gazzetta…</p>';
  if (!L.length)
    return '<p class="gz-vuoto">La bacheca è vuota. Scrivi il primo biglietto della Valle: Pennino non vede l’ora di volare.</p>';
  return `<div class="gz-muro">${L.map(gzBiglietto).join('')}</div>`;
}
function gzGara() {
  const ora = gzSettimana(Date.now()),
    foto = gzElenco().filter(p => p.f),
    questa = foto.filter(p => gzSettimana(p.ts) === ora).sort((a, b) => gzN(b.id) - gzN(a.id) || a.ts - b.ts),
    scorsa = foto
      .filter(p => gzSettimana(p.ts) === ora - 1)
      .sort((a, b) => gzN(b.id) - gzN(a.id) || a.ts - b.ts),
    vinc = scorsa.length && gzN(scorsa[0].id) > 0 ? scorsa[0] : null,
    st = gzMe(),
    F = (st.flags = st.flags || {}),
    premi = (F.gzPremi = F.gzPremi || {}),
    mio = vinc && vinc.pid === st.pid && !premi[ora - 1];
  const fine = new Date(GZ_SETT0 + (ora + 1) * 7 * 864e5);
  const medaglie = ['🥇', '🥈', '🥉'];
  return `<p class="gz-intro">Ogni settimana, la fotografia con più piume vince il <b>Nastro della Gazzetta</b> e 1500 scudi. Questa gara finisce ${fine.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
  ${vinc ? `<div class="gz-post gz-vinta"><i class="gz-pin"></i><p class="gz-chi">🎀 La più bella della settimana scorsa: <b>${esc(vinc.n)}</b> (🪶 ${gzN(vinc.id)})</p><div class="gz-foto"><img src="${esc(vinc.f)}" alt=""></div>${mio ? '<p class="gz-azioni"><button class="btn" data-premio="1">Ritira il premio</button></p>' : ''}</div>` : ''}
  <h3 class="gz-h">Questa settimana</h3>
  ${
    questa.length
      ? `<div class="gz-muro">${questa
          .map((p, i) =>
            gzBiglietto(p).replace(
              '<i class="gz-pin"></i>',
              `<i class="gz-pin"></i><span class="gz-med">${medaglie[i] || ''}</span>`
            )
          )
          .join('')}</div>`
      : '<p class="gz-vuoto">Nessuna fotografia, per ora. Scattane una: potrebbe vincere.</p>'
  }`;
}
function gzScrivi() {
  const st = gzMe(),
    vola = PC.st !== 'posato' && pcTrespolo();
  return `<div class="gz-post gz-nuovo"><i class="gz-pin"></i>
  <p class="gz-chi">Un biglietto di <b>${esc(st.name || '')}</b></p>
  ${GZ.foto ? `<div class="gz-foto"><img src="${GZ.foto}" alt="La tua fotografia"></div><p class="gz-azioni"><button class="btn" data-f="rifai">📷 Rifalla</button><button class="btn" data-f="via">Togli la foto</button></p>` : `<p class="gz-azioni"><button class="btn" data-f="scatta">📷 Scatta una fotografia</button></p>`}
  <textarea maxlength="240" rows="4" placeholder="Racconta qualcosa del tuo villaggio…" data-testo>${esc(GZ.testo)}</textarea>
  <p class="small"><label><input type="checkbox" data-racconta ${GZ.racconta ? 'checked' : ''}> Aggiungi due righe sul mio villaggio (rango, abitanti, animali)</label></p>
  <p class="gz-azioni"><button class="btn" data-manda ${vola ? 'disabled' : ''}>🕊 ${vola ? 'Pennino è in volo…' : 'Manda col piccione'}</button></p></div>`;
}
function gzRiassunto() {
  const st = gzMe();
  if (!st.free) return '';
  const r = typeof myRank === 'function' ? rankName(myRank(st)) : '',
    ab = typeof residents === 'function' ? residents(st).length : 0,
    an = (st.free.animals || []).length;
  return `🏡 ${r}${ab ? ` · ${ab} abitant${ab === 1 ? 'e' : 'i'} nuov${ab === 1 ? 'o' : 'i'}` : ''}${an ? ` · ${an} animal${an === 1 ? 'e' : 'i'}` : ''}`;
}
function gzDisegna() {
  const d = $('#gazzetta');
  if (!d) return;
  const corpo = $('#gz-corpo'),
    y = corpo ? corpo.scrollTop : 0;
  const tabs = [
    ['bacheca', 'La bacheca'],
    ['gara', 'La più bella'],
    ['scrivi', 'Scrivi un biglietto']
  ];
  d.innerHTML = `<div class="gz-testa"><div><h2>La Gazzetta della Valle</h2><p>Portata da Pennino, il piccione viaggiatore</p></div><button class="btn" data-x>✕</button></div>
  <div class="gz-tabs">${tabs.map(([k, n]) => `<button class="btn ${GZ.tab === k ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
  <div id="gz-corpo">${!GZ_DB.ok() ? '<p class="gz-vuoto">Pennino non trova la strada. La Gazzetta arriva solo quando sei collegat' + fmt('{o|a}') + ' alla Valle (multiplayer).</p>' : GZ.tab === 'gara' ? gzGara() : GZ.tab === 'scrivi' ? gzScrivi() : gzBacheca()}</div>`;
  const c2 = $('#gz-corpo');
  if (c2) c2.scrollTop = y;
  gzCollega(d);
}
function gzCollega(d) {
  const q = s => d.querySelectorAll(s),
    me = gzMe();
  d.querySelector('[data-x]').onclick = () => Gazzetta.chiudi();
  q('[data-tab]').forEach(b => (b.onclick = () => ((GZ.tab = b.dataset.tab), AU.play('ui'), gzDisegna())));
  q('[data-piuma]').forEach(
    b =>
      (b.onclick = async () => {
        const id = b.dataset.piuma,
          P = (GZ.piume[id] = GZ.piume[id] || {}),
          on = !P[me.pid];
        if (on) P[me.pid] = true;
        else delete P[me.pid];
        AU.play(on ? 'ok' : 'ui');
        gzDisegna();
        try {
          await GZ_DB.piuma(id, me.pid, on);
          if (on) pcVola(true);
        } catch (e) {
          UI.toast('Pennino non è riuscito a portare la piuma.', 'bad');
        }
      })
  );
  q('[data-com]').forEach(
    b =>
      (b.onclick = async () => {
        const id = b.dataset.com;
        GZ.aperti[id] = !GZ.aperti[id];
        gzDisegna();
        if (GZ.aperti[id])
          try {
            GZ.commenti[id] = await GZ_DB.commenti(id);
            gzDisegna();
          } catch (e) {}
      })
  );
  q('[data-cman]').forEach(
    b =>
      (b.onclick = async () => {
        const id = b.dataset.cman,
          inp = d.querySelector(`[data-cin="${id}"]`),
          t = (inp.value || '').trim().slice(0, 140);
        if (!t) return;
        if (PC.st !== 'posato' && pcTrespolo()) return UI.toast('Pennino è già in volo. Aspetta che torni.');
        const c = { pid: me.pid, n: String(me.name || '?').slice(0, 20), t, ts: Date.now() };
        try {
          await GZ_DB.commenta(id, c);
          (GZ.commenti[id] = GZ.commenti[id] || {})['_' + c.ts] = c;
          pcVola(true);
          AU.play('ok');
          gzDisegna();
        } catch (e) {
          UI.toast('Pennino non è riuscito a portare il commento.', 'bad');
        }
      })
  );
  q('[data-togli]').forEach(
    b =>
      (b.onclick = async () => {
        if (!b.dataset.sicuro) {
          b.dataset.sicuro = 1;
          b.textContent = 'Sicur' + fmt('{o|a}') + '? Togli';
          return;
        }
        try {
          await GZ_DB.togli(b.dataset.togli);
          delete GZ.posts[b.dataset.togli];
          gzDisegna();
        } catch (e) {}
      })
  );
  const ta = d.querySelector('[data-testo]');
  if (ta) ta.oninput = () => (GZ.testo = ta.value);
  const rc = d.querySelector('[data-racconta]');
  if (rc) rc.onchange = () => (GZ.racconta = rc.checked);
  q('[data-f]').forEach(
    b =>
      (b.onclick = () => {
        if (b.dataset.f === 'via') {
          GZ.foto = null;
          return gzDisegna();
        }
        Gazzetta.chiudi();
        Foto.apri();
      })
  );
  const mb = d.querySelector('[data-manda]');
  if (mb) mb.onclick = () => gzManda();
  const pr = d.querySelector('[data-premio]');
  if (pr)
    pr.onclick = () => {
      const st = gzMe(),
        F = (st.flags.gzPremi = st.flags.gzPremi || {});
      F[gzSettimana(Date.now()) - 1] = 1;
      st.money += 1500;
      UI.hud();
      AU.play('coin');
      UI.toast('🎀 Il Nastro della Gazzetta è tuo! +' + SC(1500));
      NET.save(st);
      gzDisegna();
    };
  q('.gz-foto img').forEach(img => (img.onclick = () => img.parentElement.classList.toggle('grande')));
}
async function gzManda() {
  const st = gzMe();
  let t = (GZ.testo || '').trim();
  if (GZ.racconta) t = (t ? t + '\n' : '') + gzRiassunto();
  t = t.slice(0, 240);
  if (!t && !GZ.foto) return UI.toast('Scrivi qualcosa o scatta una fotografia.');
  if (PC.st !== 'posato' && pcTrespolo()) return UI.toast('Pennino è già in volo. Aspetta che torni.');
  const p = {
    pid: st.pid,
    n: String(st.name || '?').slice(0, 20),
    v: st.free && typeof myRank === 'function' ? rankName(myRank(st)) : '',
    ts: Date.now()
  };
  if (t) p.t = t;
  if (GZ.foto) p.f = GZ.foto;
  try {
    await GZ_DB.pubblica(p);
  } catch (e) {
    console.error(e);
    return UI.toast('Pennino non è riuscito a partire. Riprova tra poco.', 'bad');
  }
  GZ.testo = '';
  GZ.foto = null;
  GZ.racconta = false;
  GZ.tab = 'bacheca';
  Gazzetta.chiudi();
  if (pcVola(true)) UI.toast('🕊 Pennino è partito con il tuo biglietto: lo porta a tutta la Valle.');
  else UI.toast('📜 Il tuo biglietto è nella Gazzetta.');
}
const Gazzetta = {
  apri(tab) {
    if (gzAperta()) return;
    if (tab) GZ.tab = tab;
    const st = gzMe();
    st.flags = st.flags || {};
    // leggere la Gazzetta toglie la lettera
    PC.lettera = 0;
    const ult = Math.max(0, ...Object.values(GZ.posts).map(p => p.ts || 0));
    if (ult > (st.flags.gzVisto || 0)) st.flags.gzVisto = ult;
    const d = document.createElement('div');
    d.id = 'gazzetta';
    document.body.appendChild(d);
    this._prima = UI.modalOpen;
    UI.modalOpen = true;
    this._k = e => {
      if (e.code === 'Escape') Gazzetta.chiudi();
      if (!/^(INPUT|TEXTAREA)$/.test((e.target || {}).tagName || '')) e.stopPropagation();
    };
    addEventListener('keydown', this._k, true);
    AU.play('ui');
    gzDisegna();
    if (GZ_DB.ok())
      gzCaricaPiume().then(() => {
        if (gzAperta()) gzDisegna();
      });
  },
  chiudi() {
    const d = $('#gazzetta');
    if (!d) return;
    d.remove();
    removeEventListener('keydown', this._k, true);
    UI.modalOpen = this._prima || false;
  }
};

// ---------- grafica: il trespolo e Pennino ----------
Ext.on('arte', () => {
  try {
    const R = h => R6b(h);
    // trespolo: palo, colombaia col tettino, posatoio, cestino delle lettere
    FREEIMG.trespolo = SP(14, 30, P => {
      const M = () => new MK2(P.w, P.h);
      paint2(P, M().rect(13, 22, 3, 36), R('#7a4a2a'), { thin: 1 });
      paint2(P, M().rect(5, 56, 18, 3), R('#5a3a1e'), { thin: 1 });
      paint2(P, M().rect(5, 10, 18, 12), R('#c8a070'), { mod: (X, Y, t) => (X % 4 === 0 ? t - 1 : t) });
      paint2(P, M().ell(14, 16, 2.6, 3.2), R('#2a1810'), { flat: 1 });
      paint2(
        P,
        M().poly([
          [2, 11],
          [14, 2],
          [26, 11]
        ]),
        R('#a8402a'),
        { mod: (X, Y, t) => ((X + Y) % 5 === 0 ? t - 1 : t) }
      );
      paint2(P, M().rect(3, 23, 22, 2), R('#5a3a1e'), { thin: 1 });
      paint2(
        P,
        M().ell(20, 42, 5, 3.6, (X, Y) => Y >= 41),
        R('#b8945a'),
        { mod: (X, Y, t) => ((X + Y) % 3 === 0 ? t - 1 : t) }
      );
      paint2(P, M().rect(17, 38, 6, 3), R('#f4ecd8'), { thin: 1, nc: 1 });
    });
    ICON.trespolo = icon32(() => {});
    {
      const x = ICON.trespolo.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(FREEIMG.trespolo, 9, 1, 14, 30);
    }
    // Pennino: grigio azzurro, collo cangiante verde e viola, zampe rosa
    const corpo = (P, M, testa, petto, ala) => {
      paint2(P, M().ell(11, 13, 7, 4.6 + petto), R('#8a96a8'), { mod: (X, Y, t) => (Y > 15 ? t - 1 : t) });
      paint2(P, M().ell(10, 12, 4.6, 2.6), R('#7a8698'), { thin: 1, nc: 1 });
      for (const x of [8, 11]) P.set(x, 13, C('#3a3a48'));
      paint2(P, M().cap(4, 13, 0, 15, 1.4), R('#5a6474'), { thin: 1 });
      if (ala !== undefined)
        paint2(P, M().rot(10, 9 + ala * 5, 7, 2.4, -0.4 + ala * 0.5), R('#9aa6b8'), { thin: 1 });
      paint2(P, M().ell(testa[0] - 1.5, testa[1] + 2.5, 2.6, 2.2 + petto * 0.5), R('#6a9a7a'), {
        thin: 1,
        mod: (X, Y, t) => ((X + Y) % 2 ? (P.set(X, Y, C('#8a6aa8')), null) : t)
      });
      paint2(P, M().ell(testa[0], testa[1], 2.8, 2.4), R('#8a96a8'));
      P.set(testa[0] + 1, testa[1] - 1, C('#d8602a'));
      P.set(testa[0] + 3, testa[1] + 0, C('#3a3030'));
      P.set(testa[0] + 4, testa[1] + 0, C('#3a3030'));
      if (ala === undefined) {
        P.set(9, 18 + petto, C('#d87a8a'));
        P.set(12, 18 + petto, C('#d87a8a'));
      }
    };
    const S = fn => SP(12, 11, P => fn(P, () => new MK2(P.w, P.h)));
    PC_IMG.posato = [
      S((P, M) => corpo(P, M, [16, 7], 0)), // guarda
      S((P, M) => corpo(P, M, [18, 10], 0)), // becca, testa avanti
      S((P, M) => corpo(P, M, [10, 8], 0)), // si liscia le piume
      S((P, M) => corpo(P, M, [16, 6], 1.4)) // tuba, petto gonfio
    ];
    PC_IMG.volo = [-1, 0, 1, 0].map(a => S((P, M) => corpo(P, M, [17, 9], 0, a)));
  } catch (e) {
    console.error(e);
  }
});
