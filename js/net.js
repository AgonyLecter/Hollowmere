'use strict';
// ================= RETE (Firebase Realtime Database, nodo "hollowmere") =================
const FBCFG = {
  apiKey: 'AIzaSyBiKEfo1c7c12kAYxlRuZNjh-Spz4W1Tbw',
  authDomain: 'wandertutto.firebaseapp.com',
  databaseURL: 'https://wandertutto-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'wandertutto',
  storageBucket: 'wandertutto.firebasestorage.app',
  messagingSenderId: '933606082300',
  appId: '1:933606082300:web:3ef3d5e1a233f86f7f3979',
  measurementId: 'G-0Z5BRG4X4Z'
};
const NET = {
  ok: false,
  api: null,
  db: null,
  regNames: [],
  heirs: [],
  msgs: [],
  count: 0,
  ROOT: 'hollowmere',
  async init() {
    try {
      const v = '10.12.5',
        B = `https://www.gstatic.com/firebasejs/${v}/`;
      this.B = B;
      const tmo = ms => new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms));
      // tutti i moduli insieme; l'accesso anonimo PRIMA di aprire il database, così la connessione nasce già con l'identità
      const [A, D, AU2] = await Promise.race([
        Promise.all([
          import(B + 'firebase-app.js'),
          import(B + 'firebase-database.js'),
          import(B + 'firebase-auth.js')
        ]),
        tmo(15000)
      ]);
      const app =
        (A.getApps && A.getApps().find(x => x.name === 'hollowmere')) || A.initializeApp(FBCFG, 'hollowmere');
      this.api = D;
      this.AU = AU2;
      this.auth = AU2.getAuth(app);
      await this.signIn();
      this.db = this.db || D.getDatabase(app);
      // collegati davvero: si aspetta .info/connected (un get() su .info va al server, che lo rifiuta: «Invalid token in path»)
      await Promise.race([
        new Promise(res => {
          let off = null;
          off = D.onValue(D.ref(this.db, '.info/connected'), sn => {
            if (sn.val() === true) {
              if (off) off();
              res();
            }
          });
        }),
        tmo(15000)
      ]);
      this.ok = true;
      import(B + 'firebase-analytics.js')
        .then(an => {
          try {
            an.getAnalytics(app);
          } catch (e) {
            atteso(e); // le statistiche le può bloccare il browser
          }
        })
        .catch(() => {});
      if (!this._listening) {
        this._listening = 1;
        this.listen();
      }
      this.netErr = null;
    } catch (e) {
      this.ok = false;
      this.netErr = (e && (e.code || e.message)) || 'errore';
      console.warn('Hollowmere offline:', e && e.message);
    }
    if (!this.ok) {
      try {
        this.msgs = JSON.parse(LS.get('hm_lap') || '[]');
      } catch (e) {
        segnala(e, 'net');
      }
      // niente connessione: si riprova da soli, sempre più di rado; appena riesce si riattiva tutto
      this._tries = (this._tries || 0) + 1;
      clearTimeout(this._rt);
      this._rt = setTimeout(() => this.init(), Math.min(120000, 15000 * this._tries));
    } else if (this._tries) {
      this._tries = 0;
      this.reconnected();
    }
    this.status();
  },
  // tornati online durante la partita: salva, presenza, posta, novità
  reconnected() {
    try {
      const st = G.visit ? G.home : G.st;
      if (G.mode === 'game' && st && st.pid) {
        this.save(st);
        if (isFree(st)) {
          presenceJoin(G.visit ? G.visit.pid : st.pid);
          inboxStart();
        }
        UI.toast('Collegato alla Valle: ora sei online.');
      }
    } catch (e) {
      console.warn(e);
    }
  },
  r(p) {
    return this.api.ref(this.db, this.ROOT + '/' + p);
  },
  // identità anonima: nessuna schermata, serve alle regole per sapere di chi è un salvataggio. Se non riesce, si riprova al salvataggio.
  async signIn() {
    if (!this.AU || !this.auth || this.noAuth) return false;
    if (this.auth.currentUser) {
      this.uid = this.auth.currentUser.uid;
      this.authErr = null;
      return true;
    }
    try {
      const cr = await Promise.race([
        this.AU.signInAnonymously(this.auth),
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 15000))
      ]);
      this.uid = cr.user.uid;
      this.authErr = null;
      return true;
    } catch (e) {
      this.authErr = (e && (e.code || e.message)) || 'errore';
      console.warn('Hollowmere: accesso anonimo non riuscito', e && e.message);
      return false;
    }
  },
  listen() {
    const D = this.api;
    D.onValue(
      D.query(this.r('registro'), D.limitToLast(40)),
      s => {
        const v = s.val() || {};
        this.regNames = Object.values(v).map(o => String((o && o.name) || '').slice(0, 20));
        this.status();
      },
      () => {}
    );
    D.onValue(
      D.query(this.r('lapidi'), D.limitToLast(20)),
      s => {
        const v = s.val() || {};
        this.msgs = Object.values(v)
          .filter(Boolean)
          .sort((a, b) => (a.ts || 0) - (b.ts || 0))
          .map(o => ({ t: String(o.t || '').slice(0, 80), n: String(o.n || '').slice(0, 20) }));
        UI.refreshNameless && UI.refreshNameless();
      },
      () => {}
    );
    D.onValue(
      D.query(this.r('eredi'), D.limitToLast(5)),
      s => {
        const v = s.val() || {};
        this.heirs = Object.values(v)
          .map(o => String((o && o.name) || '').slice(0, 20))
          .filter(Boolean);
      },
      () => {}
    );
    D.onValue(
      this.r('stats/arrivi'),
      s => {
        this.count = s.val() || 0;
        this.status();
      },
      () => {}
    );
    missionListen();
  },
  status() {
    $('#tnet').textContent = this.ok
      ? '● La Valle è in ascolto (online)'
      : '○ Modalità offline · salvataggi su questo dispositivo';
    $('#tcount').textContent = this.ok ? `Nuovi arrivati a Hollowmere: ${this.count}` : '';
  },
  _own: {},
  key(pid) {
    return LS.get('hm_key_' + pid);
  },
  // un salvataggio online appartiene a chi l'ha creato; da un altro dispositivo serve la chiave di recupero
  own(pid) {
    if (this._own[pid]) return Promise.resolve(true);
    this._ownP = this._ownP || {};
    if (this._ownP[pid]) return this._ownP[pid];
    const pr = this._own1(pid).finally(() => {
      delete this._ownP[pid];
    });
    this._ownP[pid] = pr;
    return pr;
  },
  async _own1(pid) {
    if (this._own[pid]) return true;
    if (!this.ok || !pid) return false;
    if (!this.uid && !(await this.signIn())) {
      this.ownErr = 'nessuna identità (' + (this.authErr || '?') + ')';
      return false;
    }
    const D = this.api;
    let k = this.key(pid);
    try {
      if (!k) {
        k = rkey();
        await D.set(this.r('segreti/' + pid), k);
      }
      await D.set(this.r('proprietari/' + pid), { uid: this.uid || '', k });
      LS.set('hm_key_' + pid, k);
      this._own[pid] = true;
      return true;
    } catch (e) {
      this.ownErr = (e && (e.code || e.message)) || 'errore';
      console.warn('Hollowmere: proprietà del salvataggio non registrata', pid, e && e.message);
      return false;
    }
  },
  async save(st) {
    // in visita si salva la propria partita (con zaino, scudi ed energia di adesso), mai il villaggio dell'amico:
    // così chi chiude il gioco durante una visita non perde quello che ha fatto
    // (G.home esiste per tutta la visita, anche nei momenti in cui G.visit è azzerato per usare le azioni di casa)
    if (G.home) {
      const h = G.home;
      if (G.st !== h)
        Object.assign(h, { inv: G.st.inv, sel: G.st.sel, money: G.st.money, energy: G.st.energy });
      st = h;
    }
    st.ts = Date.now();
    LS.set(isFree(st) ? 'hm_free' : 'hm_save', JSON.stringify(st));
    if (st.pid) LS.set('hm_pid', st.pid);
    if (!this.ok || !st.pid) return;
    let mine = await this.own(st.pid);
    // un villaggio della Valle registrato a un'altra identità (chiave di recupero persa): ne apriamo uno nuovo, così il giocatore torna visibile a tutti
    if (
      !mine &&
      this.uid &&
      isFree(st) &&
      !this.key(st.pid) &&
      /PERMISSION|permission/.test(this.ownErr || '') &&
      !this._forked
    ) {
      this._forked = 1;
      const old = st.pid;
      st.pid = newPid();
      LS.set('hm_free', JSON.stringify(st));
      LS.set('hm_pid', st.pid);
      mine = await this.own(st.pid);
      if (mine)
        UI.toast(`Il codice ${old} era registrato a un altro dispositivo: il tuo villaggio ora è ${st.pid}.`);
    }
    MP.publish(st); // sono le regole del database a decidere: se il salvataggio non è tuo, la scrittura viene rifiutata
    try {
      await this.api.set(this.r('players/' + st.pid), {
        name: st.name,
        day: st.day,
        ch: st.chapter,
        ts: st.ts,
        save: packSave(st)
      });
      this.saveOk = Date.now();
      this.saveErr = null;
      this.scheda(st);
    } catch (e) {
      this.saveErr = (e && (e.code || e.message)) || 'errore';
      console.warn(e);
      if (!this._warned) {
        this._warned = 1;
        UI.toast('Il salvataggio online non è riuscito: resta su questo dispositivo.', 'bad');
      }
    }
  },
  // la scheda leggera per la regia (fusco.html): nome, giorno, capitolo, ora. Così la regia non scarica i
  // salvataggi completi di tutti. Se le regole non hanno ancora il ramo «schede», pazienza: il salvataggio è fatto.
  async scheda(st) {
    try {
      await this.api.set(this.r('schede/' + st.pid), {
        name: String(st.name || '').slice(0, 20),
        day: +st.day || 0,
        ch: +st.chapter || 0,
        ts: st.ts
      });
    } catch (e) {
      atteso(e);
    }
  },
  async load(pid) {
    if (!this.ok) return null;
    try {
      const s = await this.api.get(this.r('players/' + pid));
      const v = s.val();
      return v && v.save ? unpackSave(v.save) : null;
    } catch (e) {
      return null;
    }
  },
  async register(name) {
    if (!this.ok) return;
    try {
      await this.api.push(this.r('registro'), { name: name.slice(0, 20), ts: Date.now() });
      await this.api.runTransaction(this.r('stats/arrivi'), c => (c || 0) + 1);
    } catch (e) {
      console.warn(e);
    }
  },
  async heir(name) {
    if (!this.ok) return;
    try {
      await this.api.push(this.r('eredi'), { name: String(name).slice(0, 20), ts: Date.now() });
    } catch (e) {
      segnala(e, 'net');
    }
  },
  async carve(t, n) {
    const m = { t: t.slice(0, 80), n: (n || '').slice(0, 20), ts: Date.now() };
    if (!this.ok) {
      this.msgs.push(m);
      this.msgs = this.msgs.slice(-20);
      LS.set('hm_lap', JSON.stringify(this.msgs));
      return;
    }
    try {
      await this.api.push(this.r('lapidi'), m);
    } catch (e) {
      UI.toast('La pietra non si lascia incidere.', 'bad');
    }
  }
};
function newPid() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'HM-';
  for (let i = 0; i < 6; i++) s += A[(Math.random() * A.length) | 0];
  return s;
}
function rkey() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += A[(Math.random() * A.length) | 0];
    if (i === 3) s += '-';
  }
  return s;
}
// diagnosi della connessione, mostrata nel menu Salvataggio
function netDiag() {
  const N = NET,
    ok = v => `<span style="color:#3a7a1a">✔ ${v}</span>`,
    ko = v => `<span style="color:#a8301a">✘ ${v}</span>`;
  if (!N.ok)
    return ko(
      'Non collegato alla Valle' +
        (N.netErr ? ' (' + esc(N.netErr) + ')' : '') +
        '. Il gioco riprova da solo; «Salva adesso» riprova subito. Su Brave: disattiva gli Scudi per questo sito. Nei browser dentro le app (Instagram, WhatsApp, Telegram) apri il gioco in Chrome.'
    );
  const L = [
    N.uid ? ok('Identità anonima') : ko('Identità anonima: ' + esc(N.authErr || 'non ancora pronta')),
    N.saveOk
      ? ok(
          'Ultimo salvataggio online alle ' +
            new Date(N.saveOk).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        )
      : N.saveErr
        ? ko(
            'Salvataggio online rifiutato: ' + N.saveErr + (N.ownErr ? ' (proprietà: ' + N.ownErr + ')' : '')
          )
        : '… nessun salvataggio online ancora in questa sessione',
    // gli ultimi errori (da copiare quando si segnala un problema)
    ...ERRORI.slice(-5).map(x => ko(esc(x.dove + ': ' + x.msg + (x.n > 1 ? ' (×' + x.n + ')' : ''))))
  ];
  Ext.run('netDiag', L, ok, ko); // gli altri file aggiungono le loro righe (la presenza: mp.js)
  return L.join('<br>');
}
// ---------- compressione dei salvataggi (LZ, alfabeto base64: sicuro per Firebase) ----------
const LZ = (() => {
  const K = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const R = {};
  for (let i = 0; i < K.length; i++) R[K[i]] = i;
  function comp(u, bits, gc) {
    if (u == null) return '';
    let i,
      D = {},
      C = {},
      w = '',
      wc,
      c,
      en = 2,
      ds = 3,
      nb = 2,
      out = [],
      val = 0,
      pos = 0;
    const put = (x, n) => {
      for (let k = 0; k < n; k++) {
        val = (val << 1) | (x & 1);
        if (pos === bits - 1) {
          pos = 0;
          out.push(gc(val));
          val = 0;
        } else pos++;
        x >>= 1;
      }
    };
    const emit = () => {
      if (Object.prototype.hasOwnProperty.call(C, w)) {
        const cc = w.charCodeAt(0);
        if (cc < 256) {
          put(0, nb);
          put(cc, 8);
        } else {
          put(1, nb);
          put(cc, 16);
        }
        en--;
        if (en === 0) {
          en = Math.pow(2, nb);
          nb++;
        }
        delete C[w];
      } else put(D[w], nb);
      en--;
      if (en === 0) {
        en = Math.pow(2, nb);
        nb++;
      }
    };
    for (i = 0; i < u.length; i++) {
      c = u.charAt(i);
      if (!Object.prototype.hasOwnProperty.call(D, c)) {
        D[c] = ds++;
        C[c] = true;
      }
      wc = w + c;
      if (Object.prototype.hasOwnProperty.call(D, wc)) w = wc;
      else {
        emit();
        D[wc] = ds++;
        w = String(c);
      }
    }
    if (w !== '') emit();
    put(2, nb);
    while (true) {
      val = val << 1;
      if (pos === bits - 1) {
        out.push(gc(val));
        break;
      } else pos++;
    }
    return out.join('');
  }
  function dec(len, reset, gn) {
    const D = [],
      res = [];
    let en = 4,
      ds = 4,
      nb = 3,
      entry = '',
      w,
      c,
      bits,
      mp,
      pw,
      i,
      data = { val: gn(0), pos: reset, index: 1 };
    const rd = n => {
      let b = 0;
      mp = Math.pow(2, n);
      pw = 1;
      while (pw !== mp) {
        const r = data.val & data.pos;
        data.pos >>= 1;
        if (data.pos === 0) {
          data.pos = reset;
          data.val = gn(data.index++);
        }
        b |= (r > 0 ? 1 : 0) * pw;
        pw <<= 1;
      }
      return b;
    };
    for (i = 0; i < 3; i++) D[i] = i;
    bits = rd(2);
    switch (bits) {
      case 0:
        c = String.fromCharCode(rd(8));
        break;
      case 1:
        c = String.fromCharCode(rd(16));
        break;
      case 2:
        return '';
    }
    D[3] = c;
    w = c;
    res.push(c);
    while (true) {
      if (data.index > len) return '';
      bits = rd(nb);
      switch ((c = bits)) {
        case 0:
          D[ds++] = String.fromCharCode(rd(8));
          c = ds - 1;
          en--;
          break;
        case 1:
          D[ds++] = String.fromCharCode(rd(16));
          c = ds - 1;
          en--;
          break;
        case 2:
          return res.join('');
      }
      if (en === 0) {
        en = Math.pow(2, nb);
        nb++;
      }
      if (D[c]) entry = D[c];
      else if (c === ds) entry = w + w.charAt(0);
      else return null;
      res.push(entry);
      D[ds++] = w + entry.charAt(0);
      en--;
      w = entry;
      if (en === 0) {
        en = Math.pow(2, nb);
        nb++;
      }
    }
  }
  return {
    pack: s => {
      const r = comp(s, 6, a => K.charAt(a));
      switch (r.length % 4) {
        case 1:
          return r + '===';
        case 2:
          return r + '==';
        case 3:
          return r + '=';
      }
      return r;
    },
    unpack: s => {
      if (!s) return '';
      return dec(s.length, 32, i => R[s.charAt(i)]);
    }
  };
})();
// "z:" = salvataggio compresso; senza prefisso = vecchio JSON in chiaro (si legge ancora)
const packSave = st => 'z:' + LZ.pack(JSON.stringify(st));
const unpackSave = s => {
  if (!s) return null;
  if (s.startsWith('z:')) {
    const t = LZ.unpack(s.slice(2));
    return t ? JSON.parse(t) : null;
  }
  return JSON.parse(s);
};
