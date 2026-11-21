'use strict';
// ================= TACCUINO DELLE RICHIESTE =================
// Le richieste degli abitanti stanno in st.favors (lo stesso posto dei vecchi favori, così le partite salvate
// restano valide). Ogni richiesta:
//   { id, item, n, reward, until, ora, tipo, evento, creato, told, done, esito, storia, catena }
//   tipo:  'giorno' (entro stasera) · 'scadenza' (qualche giorno) · 'festa' (per una festa della Valle)
//          'urgente' (il tempo cambia: serve subito) · 'catena' (tre passi, premio speciale alla fine)
//   esito: 'ok' consegnata · 'scaduta' · 'rinuncia'
// Regole: una richiesta aperta per abitante, un tetto che cresce con il rango, una pausa dopo ogni esito,
// scadenze sfalsate. Conseguenze leggere nella Valle; nella storia mancare una promessa costa amicizia
// (che decide chi ti aiuterà alla Festa) e quiete.
const ORA_SERA = 20 * 60;
const CATENE = {
  agatha: {
    n: 'Il quaderno delle ricette',
    items: ['uovo', 'latte', 'farina', 'miele'],
    righe: [
      'Tesoro, sto rifacendo il quaderno delle ricette di mia madre. Mi dai una mano?',
      'Ci siamo quasi. Le pagine profumano già.',
      'Ultimo ingrediente, tesoro, e il quaderno è finito.'
    ],
    fine: 'Ecco. La prima copia è tua, tesoro.'
  },
  brom: {
    n: 'Il ferro buono',
    items: ['legna', 'pietra', 'ferro', 'lingotto'],
    righe: ['Mh. Rifaccio gli attrezzi del villaggio. Servono materiali.', 'Mh. Ancora.', "Mh. L'ultimo."],
    fine: 'Mh. Per te. Il migliore che ho fatto.'
  },
  lucius: {
    n: 'Le candele nuove',
    items: ['miele', 'lavanda', 'girasole', 'camomilla'],
    righe: [
      'Voglio candele nuove per la cappella. Non gialle: di tutti i colori.',
      'La cera viene dalle api, le api dai fiori. Mi aiuti ancora?',
      'Ultima cosa. Poi la cappella sarà luminosa.'
    ],
    fine: 'Accendi tu la prima. Per tuo nonno.'
  },
  clara: {
    n: 'La mappa nuova',
    items: ['girasole', 'more', 'spinaci', 'carota', 'barbabietola'],
    righe: [
      'Faccio una mappa nuova della Valle. Senza lapidi! Mi porti le cose per fare i colori?',
      'Mi manca un colore. Sai quale? Te lo dico io!',
      'Ultimo colore e la appendo in piazza!'
    ],
    fine: "Guarda! C'è anche la tua casa. Più grande delle altre. Perché sei tu."
  },
  ezekiel: {
    n: 'Il registro nuovo',
    items: ['fibra', 'more', 'legna', 'lana'],
    righe: [
      'Voglio un registro nuovo. Non per contare: per ricordare chi è arrivato, e cosa ha portato.',
      "La carta si fa con la fibra, l'inchiostro con le more. Lo sapevi?",
      "L'ultima cosa. Poi scrivo il primo nome. Il tuo."
    ],
    fine: 'Prima pagina: il tuo nome. Accanto, una parola sola: «benvenut{o|a}».'
  },
  tobia: {
    n: 'Il tesoro di Tobia',
    items: ['quarzo', 'rame', 'ferro', 'nocciole', 'pietra'],
    righe: [
      'Hihi. Faccio un tesoro da nascondere. Mi porti cose che luccicano?',
      'Hihi. Ancora! Il tesoro è piccolo.',
      "Hihi. L'ultima e lo nascondo. Tu non guardare."
    ],
    fine: 'Hihi. Il tesoro è nascosto. È per te. Cercalo. No, ecco, te lo do io. Hihi.'
  }
};
const RIC_DELUSE = {
  ezekiel: 'Ho aspettato, {n}. Non importa. Ho aspettato anche di peggio.',
  agatha: 'Tesoro, alla fine me le sono procurate da sola. Tranquill{o|a}, eh. Tranquill{o|a}.',
  lucius: 'Non fa niente, {figliolo|figliola}. Ho pregato lo stesso. Per te e per quello che mi serviva.',
  clara: 'Non sei venut{o|a}… Va bene. Va bene! Sarà per la prossima.',
  brom: 'Mh. Fatto da solo.',
  tobia: 'Hihi. Te ne sei dimenticat{o|a}. Io no. Hihi.',
  ottavio: 'La prossima volta mi segno tutto io, eh!',
  irene: 'Fa niente. Ho fotografato la mia attesa. È venuta bene.'
};
const Richieste = {
  // ---------- stato ----------
  st() {
    return G.st;
  },
  fid(id) {
    const st = G.st;
    st.fiducia = st.fiducia || {};
    return st.fiducia[id] ?? 20;
  },
  addFid(id, d) {
    const st = G.st;
    st.fiducia = st.fiducia || {};
    st.fiducia[id] = clamp(this.fid(id) + d, 0, 100);
  },
  aperte(st = G.st) {
    return (st.favors || []).filter(f => !f.done && !f.esito);
  },
  tetto(st) {
    if (!isFree(st)) return st.day >= 5 ? 3 : 2;
    return Math.min(7, 3 + (typeof myRank === 'function' ? myRank(st) : 0));
  },
  inPausa(st, id) {
    return ((st.favPausa || {})[id] || 0) > st.day;
  },
  pausa(st, id, giorni) {
    (st.favPausa = st.favPausa || {})[id] = st.day + giorni;
  },
  // ---------- scelta degli oggetti ----------
  pool(st, id) {
    let pool = ['rapa'];
    if (isFree(st)) {
      const s = seasonOf(st);
      pool = [
        ...Object.keys(CROPS).filter(c => cropInSeason(c, s)),
        ...(WILD[s] || []),
        ...COOK.filter(r => knows(st, r.id))
          .map(r => r.id)
          .slice(0, 8)
      ];
      if ((st.free.animals || []).length) for (const a of st.free.animals) pool.push(ANIMALS[a.kind].prod);
    } else {
      if (st.day >= 4) pool.push('patata', 'zucca');
      if (st.day >= 5) pool.push('cavolo', 'fagioli');
      if (st.flags.cooked) pool.push('zuppa', 'arrosto', 'torta');
      if (id !== 'clara') pool.push('pane');
    }
    return pool.filter(k => ITEMS[k]);
  },
  pesa(st, id, pool) {
    const lk = LIKES[id] || {},
      w = [];
    pool.forEach(k => {
      for (let j = 0; j < (lk[k] >= 2 ? 3 : 1); j++) w.push(k);
    });
    if (st.day >= 6 && !isFree(st)) w.push('zucca', 'zucca', 'zucca');
    return w[Math.floor(Math.random() * w.length)];
  },
  premio(item, q, mult, id) {
    const v = FAV_VAL[item] || ITEMS[item].v || ITEMS[item].e || 50;
    return Math.max(10, Math.round((v * q * mult * (1 + this.fid(id) / 200)) / 5) * 5);
  },
  // ---------- ogni mattina ----------
  mattina() {
    const st = G.st,
      F = st.flags;
    st.favors = st.favors || [];
    // i vecchi favori senza tipo diventano richieste "con scadenza"
    for (const f of st.favors) {
      if (!f.tipo) {
        f.tipo = 'scadenza';
        f.ora = f.ora ?? ORA_SERA;
        f.storia = !isFree(st);
        f.creato = f.creato ?? st.day;
      }
    }
    this.controlla(true);
    // lo storico resta una settimana nel taccuino
    st.favors = st.favors.filter(f => !(f.done || f.esito) || (f.chiusa ?? st.day) >= st.day - 7);
    if (st.day < 3) return;
    const cand = () =>
      FAV_NPC.concat(isFree(st) ? ['tobia'] : []).filter(
        id =>
          (F.met[id] || id === 'tobia') && !this.aperte(st).some(f => f.id === id) && !this.inPausa(st, id)
      );
    // una richiesta per la festa della Valle, una settimana prima
    if (isFree(st) && typeof festOf === 'function') {
      const fe = festOf(st),
        d = fe.day - seasonDay(st),
        key = 'festa-' + festKey(st);
      if (
        d > 0 &&
        d <= 7 &&
        !st.favors.some(f => f.evento === key) &&
        this.aperte(st).length < this.tetto(st)
      ) {
        const org = cand().includes(fe.org) ? fe.org : cand()[0];
        if (org) {
          const pool = this.pool(st, org).filter(k => ITEMS[k].t === 'crop'),
            item = this.pesa(st, org, pool) || 'zucca',
            q = 4 + Math.floor(Math.random() * 3);
          this.nuova(st, {
            id: org,
            item,
            n: q,
            tipo: 'festa',
            evento: key,
            nomeEvento: fe.n,
            until: st.day + d,
            ora: 17 * 60,
            mult: 2
          });
        }
      }
    }
    for (let tries = 0; tries < 6 && this.aperte(st).length < this.tetto(st); tries++) {
      const C = cand();
      if (!C.length) break;
      const id = C[Math.floor(Math.random() * C.length)];
      // catena: con abbastanza fiducia, una volta per abitante
      const cat = CATENE[id];
      if (isFree(st) && cat && this.fid(id) >= 40 && !((st.catene || {})[id] || 0) && Math.random() < 0.5) {
        this.passoCatena(st, id, 0);
        continue;
      }
      const item = this.pesa(st, id, this.pool(st, id));
      if (!item) continue;
      const crop = ITEMS[item].t === 'crop';
      if (!isFree(st)) {
        const q = crop ? 1 + (st.day >= 5 ? 1 : 0) + (Math.random() < 0.4 ? 1 : 0) : 1;
        this.nuova(st, { id, item, n: q, tipo: 'scadenza', until: st.day + 2, mult: 1.2, storia: true });
        continue;
      }
      // nella Valle: urgente col brutto tempo, del giorno, oppure con qualche giorno di tempo (sfalsato)
      const wx = st.weather;
      if (
        (wx === 'pioggia' || wx === 'neve') &&
        Math.random() < 0.3 &&
        !this.aperte(st).some(f => f.tipo === 'urgente')
      ) {
        const it = wx === 'neve' ? 'legna' : ['legna', 'fieno', 'pietra'][Math.floor(Math.random() * 3)];
        if (ITEMS[it]) {
          this.nuova(st, {
            id,
            item: it,
            n: 5 + Math.floor(Math.random() * 6),
            tipo: 'urgente',
            until: st.day,
            mult: 2
          });
          continue;
        }
      }
      if (Math.random() < 0.35) {
        const q = crop ? 1 + Math.floor(Math.random() * 2) : 1;
        this.nuova(st, { id, item, n: q, tipo: 'giorno', until: st.day, mult: 1.3 });
      } else {
        const usati = new Set(this.aperte(st).map(f => f.until)),
          giorni = [2, 3, 4, 5].find(g => !usati.has(st.day + g)) || 3,
          q = crop ? 2 + Math.floor(Math.random() * 3) : 1;
        this.nuova(st, {
          id,
          item,
          n: q,
          tipo: 'scadenza',
          until: st.day + giorni,
          mult: 1.25 + giorni * 0.05
        });
      }
    }
  },
  nuova(st, o) {
    const f = {
      id: o.id,
      item: o.item,
      n: o.n,
      reward: this.premio(o.item, o.n, o.mult || 1.2, o.id),
      until: o.until,
      ora: o.ora ?? ORA_SERA,
      tipo: o.tipo,
      creato: st.day,
      told: 0,
      done: 0,
      storia: !!o.storia
    };
    if (o.evento) Object.assign(f, { evento: o.evento, nomeEvento: o.nomeEvento });
    if (o.catena) f.catena = o.catena;
    st.favors.push(f);
    return f;
  },
  passoCatena(st, id, passo) {
    const cat = CATENE[id],
      items = cat.items.filter(k => ITEMS[k]),
      item = items[(passo + st.day) % items.length] || 'legna',
      q = ITEMS[item].t === 'res' ? 6 + passo * 3 : 2 + passo;
    return this.nuova(st, {
      id,
      item,
      n: q,
      tipo: 'catena',
      until: st.day + 4,
      mult: 1.4 + passo * 0.2,
      catena: { passo }
    });
  },
  // ---------- scadenze (ogni minuto di gioco) ----------
  controlla(mattino) {
    const st = G.st;
    if (!st) return;
    for (const f of this.aperte(st)) {
      const tardi = st.day > f.until || (st.day === f.until && st.time >= (f.ora ?? ORA_SERA));
      if (!tardi) continue;
      f.esito = 'scaduta';
      f.chiusa = st.day;
      const nome = NAMES[f.id] || f.id;
      if (f.storia) {
        // nella storia una promessa mancata pesa: chi ti aiuterà alla Festa se ne ricorda
        addFriend(f.id, -1);
        addQuiete(-2);
        UI.toast(`Hai mancato la promessa a ${nome}. Se ne ricorderà.`, 'bad');
      } else {
        this.addFid(f.id, -5);
        this.pausa(st, f.id, 2);
        if (f.catena) (st.catene = st.catene || {})[f.id] = 0;
        UI.toast(`La richiesta di ${nome} è scaduta.`);
      }
      (st.favRinfaccia = st.favRinfaccia || {})[f.id] = 1;
    }
    if (!mattino) UI.quest && UI.quest();
  },
  rinuncia(f) {
    const st = G.st;
    f.esito = 'rinuncia';
    f.chiusa = st.day;
    this.pausa(st, f.id, 1);
    if (f.catena) (st.catene = st.catene || {})[f.id] = 0;
    UI.toast(`Hai detto a ${NAMES[f.id] || f.id} che stavolta non ce la fai. Capisce.`);
  },
  // chiamata da favorDeliver dopo una consegna riuscita
  consegnata(f, n) {
    const st = G.st;
    f.esito = 'ok';
    f.chiusa = st.day;
    const presto = st.day < f.until;
    this.addFid(f.id, presto ? 8 : 5);
    if (!f.storia) this.pausa(st, f.id, 1);
    if (presto && !f.storia) {
      const extra = Math.round(f.reward * 0.1);
      st.money += extra;
      UI.toast(`In anticipo! +${SC(extra)}`);
    }
    if (f.catena && CATENE[f.id]) {
      const passo = f.catena.passo + 1;
      if (passo < 3) {
        const nf = this.passoCatena(st, f.id, passo);
        nf.told = 0;
        delete st.favPausa[f.id];
      } else {
        (st.catene = st.catene || {})[f.id] = 1;
        const r = COOK.find(r => r.da === f.id && !knows(st, r.id));
        if (r) learnRecipe(r.id, NAMES[f.id]);
        else {
          st.money += 400;
          UI.toast(`${CATENE[f.id].n}: completata! +${SC(400)}`);
        }
        this.addFid(f.id, 15);
        this.dopo = CATENE[f.id].fine;
      }
    }
  },
  // ---------- ogni fotogramma ----------
  _min: -1,
  tick() {
    const st = G.st;
    if (!st || G.mode !== 'game') return;
    if (st.time !== this._min) {
      this._min = st.time;
      if (!G.cut) this.controlla(false);
    }
    // chi è rimasto delus{o|a} te lo dice la prossima volta che passi
    const R = st.favRinfaccia;
    if (R && !G.cut && !UI.busy() && G.map && G.map.id === 'main')
      for (const id in R) {
        const n = NPC(id);
        if (!n || n.hidden || n.map !== 'main' || Math.hypot(n.x - G.player.x, n.y - G.player.y) > 50)
          continue;
        if (RIC_DELUSE[id]) bubble(n, RIC_DELUSE[id], 4);
        delete R[id];
        n.barkT = 30;
      }
    this.badge();
  },
  // ---------- il pulsante con il contatore ----------
  badge() {
    let b = document.getElementById('bRich');
    const tb = document.getElementById('topbtns');
    if (!b && tb) {
      b = document.createElement('button');
      b.id = 'bRich';
      b.className = 'btn ib';
      b.title = 'Taccuino delle richieste';
      b.onclick = () => {
        AU.play('ui');
        UI.pause('rich');
      };
      tb.insertBefore(b, tb.firstChild);
    }
    if (!b) return;
    const st = G.st,
      L = this.aperte(st),
      pronte = L.filter(f => countItem(f.item) >= f.n).length,
      txt = '📜' + (L.length ? L.length : '');
    if (b.textContent !== txt) b.textContent = txt;
    b.classList.toggle('pronta', pronte > 0);
  },
  // ---------- la pagina ----------
  quando(f) {
    const st = G.st,
      hh = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    if (f.tipo === 'festa') return `per la ${f.nomeEvento || 'festa'}, entro le ${hh(f.ora)}`;
    const d = f.until - st.day;
    if (d <= 0) return `oggi entro le ${hh(f.ora)}`;
    if (d === 1) return `domani entro le ${hh(f.ora)}`;
    return `entro ${d} giorni (${DAYN[(f.until + 3) % 7].toLowerCase()})`;
  },
  html(st) {
    const L = this.aperte(st).sort((a, b) => a.until * 1440 + a.ora - (b.until * 1440 + b.ora)),
      TIPO = {
        giorno: 'Del giorno',
        scadenza: 'Con scadenza',
        festa: 'Per la festa',
        urgente: 'Urgente',
        catena: 'A catena'
      };
    const card = f => {
      const has = countItem(f.item),
        ok = has >= f.n,
        cat = f.catena && CATENE[f.id];
      return `<div class="mrow ric${ok ? ' ok' : ''}${f.tipo === 'urgente' ? ' urg' : ''}"><canvas data-p="${f.id}" width="32" height="32"></canvas><span><b>${esc(NAMES[f.id] || f.id)}</b> <span class="tag">${TIPO[f.tipo] || ''}${cat ? ' · ' + esc(cat.n) + ' ' + (f.catena.passo + 1) + '/3' : ''}</span><br>Vuole <canvas data-i="${f.item}" width="32" height="32" class="mini"></canvas>${f.n} × ${esc(ITEMS[f.item].n)} <b style="color:${ok ? '#3a7a2a' : '#a8301a'}">(hai ${has})</b><br><span class="small">⏳ ${this.quando(f)} · Ricompensa: ${CZ(f.reward)}${f.storia ? ' · <b>promessa importante</b>' : ''}${ok ? ' · <b>pronta: vai a parlarci</b>' : ''}</span></span>${f.storia ? '' : `<button class="btn" data-rin="${st.favors.indexOf(f)}">Rinuncia</button>`}</div>`;
    };
    let h = `<p class="small">Le richieste degli abitanti. Consegnale parlandoci. ${isFree(st) ? "Se scadono, chi le ha fatte resta un po' delus{o|a} e per qualche giorno non chiede altro: rinunciare in tempo non costa niente." : 'Nella storia una promessa mancata costa amicizia: e alla Festa conterà.'} Consegnare presto fa crescere la fiducia, e con lei le ricompense.</p>`;
    h += L.length
      ? L.map(card).join('')
      : '<p>Nessuna richiesta aperta. Fai un giro in paese: qualcuno avrà bisogno di te.</p>';
    if (isFree(st) && typeof residents === 'function' && typeof resReq === 'function') {
      const R = residents(st);
      if (R.length) {
        h += '<h3>Richieste del giorno dei nuovi abitanti</h3>';
        h += R.map(r => {
          const q = resReq(r.id, st),
            done = (st.free.reqDone || {})[r.id] === st.day,
            has = countItem(q.item);
          return `<div class="mrow ric${done ? ' fatta' : has >= q.n ? ' ok' : ''}"><canvas data-p="${r.id}" width="32" height="32"></canvas><span><b>${esc(NAMES[r.id])}</b><br>${done ? '✓ Fatta, per oggi.' : `Vuole ${q.n} × ${esc(ITEMS[q.item].n)} <b>(hai ${has})</b>`}<br><span class="small">⏳ oggi · ${CZ(q.pay)}</span></span></div>`;
        }).join('');
      }
    }
    if (typeof Mercato !== 'undefined' && isFree(st)) h += Mercato.html(st);
    const chiuse = (st.favors || [])
      .filter(f => f.esito)
      .slice(-6)
      .reverse();
    if (chiuse.length)
      h +=
        '<h3>Ultime richieste</h3>' +
        chiuse
          .map(
            f =>
              `<p class="small">${{ ok: '✓', scaduta: '✗', rinuncia: '–' }[f.esito]} ${esc(NAMES[f.id] || f.id)}: ${f.n} × ${esc(ITEMS[f.item].n)} — ${{ ok: 'consegnata', scaduta: 'scaduta', rinuncia: 'rinunciata' }[f.esito]}</p>`
          )
          .join('');
    const fidL = Object.entries(st.fiducia || {}).filter(([id]) => NAMES[id]);
    if (fidL.length)
      h +=
        '<h3>Fiducia</h3><p class="small">' +
        fidL
          .map(
            ([id, v]) =>
              `${esc(NAMES[id])}: ${'■'.repeat(Math.round(v / 20))}${'□'.repeat(5 - Math.round(v / 20))}`
          )
          .join(' · ') +
        '</p><p class="small">Con fiducia alta arrivano le richieste a catena: tre passi e un premio speciale.</p>';
    return fmt(h);
  },
  // dopo aver disegnato la scheda: ritratti, icone, pulsanti
  monta(box) {
    box.querySelectorAll('canvas[data-p]').forEach(c => {
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, 32, 32);
      try {
        x.drawImage(portrait(c.dataset.p, ''), 0, 0, 32, 32);
      } catch (e) {}
    });
    box.querySelectorAll('canvas[data-i]').forEach(c => {
      const x = c.getContext('2d');
      if (ICON[c.dataset.i]) x.drawImage(ICON[c.dataset.i], 0, 0);
    });
    box.querySelectorAll('[data-rin]').forEach(
      b =>
        (b.onclick = () => {
          const f = G.st.favors[+b.dataset.rin];
          if (!f) return;
          this.rinuncia(f);
          UI._mclose = null;
          UI.pause('rich');
        })
    );
  }
};
Ext.on('mpTick', () => {
  try {
    Richieste.tick();
  } catch (e) {
    console.error(e);
  }
});
