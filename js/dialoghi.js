'use strict';
// ================= SISTEMA DEI DIALOGHI =================
// Tutte le battute "di vita" stanno in js/dialoghi_testi.js, come dati. Questo file le sceglie e le mostra.
//
// TIPI
//   saluto     quando ti avvicini a un abitante (una volta ogni tanto)
//   passaggio  frase al volo mentre passi vicino
//   sfuggito   un segreto che si lascia scappare: una volta sola per partita, serve amicizia
//   chiacchiera  due abitanti parlano fra loro (si sente da lontano)
//   bisbiglio    due abitanti parlano sottovoce (bugie, voci, paure); se ti avvicini troppo, smettono
//
// CONDIZIONI (tutte facoltative)
//   ora: [6, 12]        dalle 6 alle 12 (si può andare oltre 24: [21, 26] = dalle 21 alle 2)
//   fase: 'storia' | 'valle'        cap: [1, 3]  capitolo della storia (nella Valle conta come 5)
//   finale: [1, 3]      con quale finale si è aperta la Valle (1 fuga, 2 erede, 3 patto spezzato)
//   stagione: [0, 2]    0 autunno, 1 inverno, 2 primavera, 3 estate (nella storia è sempre autunno)
//   meteo: ['pioggia']  cuori: [3, 10]  amicizia con chi parla   h2: true/false  (segno del Capitolo II)
//   flag: 'treeSeen' oppure '!treeSeen'   peso: 2 (più probabile)   se: st => vero/falso (caso speciale)
//
// SCRITTURA: '{n}' è il nome del giocatore; '{o|a}' sceglie per genere; 'chi: testo' nelle conversazioni.
const Dialoghi = {
  db: { saluto: {}, passaggio: {}, sfuggito: {}, chiacchiera: [], bisbiglio: [] },
  recenti: {},
  // ---------- registrazione (usata da dialoghi_testi.js) ----------
  aggiungi(tipo, perChi) {
    for (const chi in perChi) {
      const L = (this.db[tipo][chi] = this.db[tipo][chi] || []);
      for (const v of perChi[chi]) L.push(Array.isArray(v) ? { t: v[0], ...(v[1] || {}) } : { t: v });
    }
  },
  conversazioni(tipo, lista) {
    for (const c of lista) {
      const tra = c.tra.split(' ');
      const righe = c.righe.map(r => {
        const i = r.indexOf(':');
        return [r.slice(0, i).trim(), r.slice(i + 1).trim()];
      });
      this.db[tipo].push({ ...c, tra, righe });
    }
  },
  // ---------- condizioni ----------
  ok(e, chi) {
    const st = G.st;
    if (!st) return false;
    const valle = isFree(st),
      cap = valle ? 5 : st.chapter || 0,
      F = st.flags || {};
    if (e.fase && (e.fase === 'valle') !== valle) return false;
    if (e.cap && (cap < e.cap[0] || cap > (e.cap[1] ?? 99))) return false;
    if (e.finale && !(valle && st.free && e.finale.includes(+st.free.ending))) return false;
    if (e.stagione && !e.stagione.includes(valle ? seasonOf(st) : 0)) return false;
    if (e.meteo && !e.meteo.includes(st.weather || 'sereno')) return false;
    if (e.ora) {
      const t = st.time,
        a = e.ora[0] * 60,
        b = e.ora[1] * 60;
      if (!((t >= a && t < b) || (t + 1440 >= a && t + 1440 < b))) return false;
    }
    if (e.cuori && chi && chi !== '*') {
      const h = hearts(chi);
      if (h < e.cuori[0] || h > (e.cuori[1] ?? 99)) return false;
    }
    if (e.h2 !== undefined && !!H2(st) !== e.h2) return false;
    if (e.flag) {
      const neg = e.flag[0] === '!',
        k = neg ? e.flag.slice(1) : e.flag;
      if (!!F[k] === neg) return false;
    }
    if (e.una && this.visto(e)) return false;
    if (e.se) {
      try {
        if (!e.se(st)) return false;
      } catch (x) {
        return false;
      }
    }
    return true;
  },
  chiave(e) {
    return e.id || (e.t || e.righe.map(r => r[1]).join('|')).slice(0, 60);
  },
  visto(e) {
    const st = G.st;
    return !!(st.dlgVisti && st.dlgVisti[this.chiave(e)]);
  },
  segna(e) {
    const st = G.st;
    (st.dlgVisti = st.dlgVisti || {})[this.chiave(e)] = st.day || 1;
  },
  // sceglie a caso tra le voci valide, pesando, ed evitando le ultime dette
  pesca(lista, memo) {
    if (!lista.length) return null;
    const R = (this.recenti[memo] = this.recenti[memo] || []);
    let L = lista.filter(e => !R.includes(e));
    if (!L.length) L = lista;
    let tot = 0;
    for (const e of L) tot += e.peso || 1;
    let r = Math.random() * tot;
    let pick = L[L.length - 1];
    for (const e of L) {
      r -= e.peso || 1;
      if (r <= 0) {
        pick = e;
        break;
      }
    }
    R.push(pick);
    if (R.length > Math.min(8, Math.ceil(lista.length * 0.7))) R.shift();
    return pick;
  },
  // ---------- API usate dal gioco ----------
  // battuta singola di un abitante (saluto, passaggio, sfuggito); null se non c'è niente di adatto
  battuta(n, tipo) {
    const id = n.id || n,
      L = [...(this.db[tipo][id] || []), ...(this.db[tipo]['*'] || [])].filter(e => this.ok(e, id));
    const e = this.pesca(L, tipo + ':' + id);
    if (!e) return null;
    if (e.una) this.segna(e);
    return e.t;
  },
  quante(id, tipo) {
    return [...(this.db[tipo][id] || []), ...(this.db[tipo]['*'] || [])].filter(e => this.ok(e, id)).length;
  },
  // conversazioni valide, nel formato di chatPool(): [a, b, righe]
  chiacchiere() {
    return this.db.chiacchiera.filter(c => this.ok(c, c.tra[0])).map(c => [c.tra[0], c.tra[1], c.righe]);
  },
  // ---------- bisbigli e segreti sfuggiti, ogni fotogramma ----------
  T: 0,
  sfT: 20,
  bis: null,
  tick(dt) {
    if (!G.st || G.mode !== 'game' || G.cut || UI.busy() || !G.map || G.map.id !== 'main' || G.visit) return;
    const p = G.player;
    // un bisbiglio in corso
    if (this.bis) {
      const b = this.bis;
      b.t -= dt;
      const dA = Math.hypot(b.a.x - p.x, b.a.y - p.y),
        dB = Math.hypot(b.b.x - p.x, b.b.y - p.y);
      if (!b.colti && Math.min(dA, dB) < 24 && b.i > 0) {
        // ti hanno visto: smettono e fingono
        b.colti = true;
        const [chi, txt] = b.c.copertura
          ? b.c.copertura.split(/:(.*)/s)
          : [b.c.tra[0], 'Oh! Ciao, {n}. Niente, niente.'];
        const n = NPC(chi.trim());
        if (n) bubble(n, txt.trim(), 2.6);
        b.a.barkT = b.b.barkT = 20;
        this.bis = null;
        return;
      }
      if (b.t <= 0) {
        if (b.i >= b.c.righe.length || Math.min(dA, dB) > 150) {
          b.a.chatT = b.b.chatT = 90 + Math.random() * 60;
          this.bis = null;
          return;
        }
        const [chi, txt] = b.c.righe[b.i++],
          n = NPC(chi);
        if (n && !n.hidden) {
          bubble(n, txt, 2.4, { w: true });
          n.barkT = Math.max(n.barkT || 0, 8);
        }
        b.t = Math.min(5, 1.6 + txt.length / 18);
      }
      return;
    }
    if (G.chat) return;
    // ne comincia uno: due abitanti vicini, fermi, e tu abbastanza vicino da sentirli
    this.T -= dt;
    if (this.T <= 0) {
      this.T = 4;
      const vis = G.npcs.filter(
        n =>
          !n.hidden &&
          !n.script &&
          n.map === 'main' &&
          !n.moving &&
          (n.chatT || 0) <= 0 &&
          Math.hypot(n.x - p.x, n.y - p.y) < 110
      );
      for (let i = 0; i < vis.length && !this.bis; i++)
        for (let j = i + 1; j < vis.length; j++) {
          const a = vis[i],
            b = vis[j];
          if (Math.hypot(a.x - b.x, a.y - b.y) > 44) continue;
          const L = this.db.bisbiglio.filter(
            c => c.tra.includes(a.id) && c.tra.includes(b.id) && this.ok(c, c.tra[0])
          );
          const c = this.pesca(L, 'bis:' + [a.id, b.id].sort().join('+'));
          if (!c) continue;
          if (c.una) this.segna(c);
          this.bis = { a, b, c, i: 0, t: 0.4 };
          a.dir = a.x < b.x ? 2 : 1;
          b.dir = b.x < a.x ? 2 : 1;
          a.idleT = b.idleT = 14;
          break;
        }
    }
    // un segreto che sfugge: abitante da solo, vicino, amico
    this.sfT -= dt;
    if (this.sfT <= 0) {
      this.sfT = 25 + Math.random() * 20;
      for (const n of G.npcs) {
        if (n.hidden || n.script || n.map !== 'main' || Math.hypot(n.x - p.x, n.y - p.y) > 46) continue;
        const t = this.battuta(n, 'sfuggito');
        if (t) {
          bubble(n, t, 4, { w: true });
          n.barkT = 30;
          break;
        }
      }
    }
  }
};
Ext.on('mpTick', dt => {
  try {
    Dialoghi.tick(dt);
  } catch (e) {
    console.error(e);
  }
});
