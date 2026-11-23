'use strict';
// ================= CHIACCHIERARE CON UN ABITANTE (gioco libero) =================
// «Chiacchiera» nei menu degli abitanti apre una piccola conversazione a scelta:
//   Come va?          → umore del giorno (battute 'passaggio' del sistema dialoghi, stagione, meteo)
//   Novità in paese?  → pettegolezzi presi dalle conversazioni fra abitanti, il mercato, le richieste, la festa
//   Parlami di te     → ricordi e confidenze già sbloccate con i cuori
// La prima chiacchierata del giorno con ognuno dà un po' di amicizia.
const Chiacchiera = {
  // un elemento a caso, senza ripetere l'ultimo detto per quella chiave
  _ult: {},
  _a(L, k) {
    if (!L.length) return null;
    let i = Math.floor(Math.random() * L.length);
    if (L.length > 1 && this._ult[k] === L[i]) i = (i + 1) % L.length;
    return (this._ult[k] = L[i]);
  },
  nome(id) {
    return (typeof NAMES !== 'undefined' && NAMES[id]) || (NPC(id) && NPC(id).name) || id;
  },
  // ---------- come va ----------
  umore(id) {
    const st = G.st,
      L = [];
    for (let i = 0; i < 3; i++) {
      const t = Dialoghi.battuta(id, 'passaggio');
      if (t && !L.includes(t)) L.push(t);
    }
    try {
      const f = freeTalkLine(id);
      if (f && f !== '…') L.push(f);
    } catch (e) {
      segnala(e, 'chiacchiera');
    }
    const h = hearts(id);
    if (!L.length)
      L.push(
        h >= 6 ? 'Bene, adesso che sei passat{o|a}.' : h >= 3 ? 'Non mi lamento. Tu?' : 'Si tira avanti.'
      );
    if (st.weather === 'rain') L.push('Con questa pioggia mi fanno male le ossa. Ma i campi ringraziano.');
    if (st.weather === 'snow') L.push('La neve mette tutti di buon umore. Anche me, quasi.');
    return this._a(L, 'umore:' + id);
  },
  // ---------- novità in paese ----------
  novita(id) {
    const st = G.st,
      L = [];
    // pettegolezzi: le conversazioni fra abitanti, raccontate da chi le ha sentite o fatte
    const conv = Dialoghi.chiacchiere().filter(c => c[2] && c[2].length >= 2);
    const mie = conv.filter(c => c[0] === id || c[1] === id),
      altre = conv.filter(c => c[0] !== id && c[1] !== id);
    const riga = r => {
      if (Array.isArray(r)) return r; // il sistema dialoghi salva le righe come [chi, testo]
      const m = String(r).match(/^\s*([a-z]+)\s*:\s*(.*)$/s);
      return m ? [m[1], m[2]] : [null, String(r)];
    };
    const lunga = ([chi, txt]) => chi && txt && txt.length >= 28 && !/\{/.test(txt);
    const c1 = this._a(
      mie.filter(c => c[2].map(riga).some(r => r[0] !== id && lunga(r))),
      'mie:' + id
    );
    if (c1) {
      const sua = c1[2].map(riga).find(r => r[0] !== id && lunga(r));
      const coda = this._a(
        ['Ci penso ancora.', 'Mi ha fatto sorridere.', 'Chissà se lo pensava davvero.', 'Tu che ne dici?'],
        'coda1'
      );
      L.push(`L'altro giorno ${this.nome(sua[0])} mi ha detto: «${sua[1]}» ${coda}`);
    }
    const c2 = this._a(
      altre.filter(c => c[2].map(riga).some(lunga)),
      'altre:' + id
    );
    if (c2) {
      const R = c2[2].map(riga).filter(lunga),
        [chi, txt] = R[Math.floor(Math.random() * R.length)];
      const coda = this._a(
        [
          'Non so cosa volesse dire.',
          "Non dirgli che te l'ho detto.",
          "In paese non si parla d'altro.",
          'Io stavo solo passando, eh.'
        ],
        'coda2'
      );
      L.push(`Ho sentito ${this.nome(chi)} che diceva: «${txt}» ${coda}`);
    }
    // il mercato del giorno
    try {
      const d = Object.keys((typeof Mercato !== 'undefined' && Mercato.m(st).domanda) || {}).filter(
        k => ITEMS[k]
      );
      if (d.length) {
        const k = d[Math.floor(Math.random() * d.length)];
        L.push(
          this._a(
            [
              `Oggi al mercato cercano ${ITEMS[k].n.toLowerCase()}. Se ne hai, vendi adesso: la pagano di più.`,
              `Ho sentito che oggi ${ITEMS[k].n.toLowerCase()} va a ruba. Domani chissà.`
            ],
            'merc'
          )
        );
      }
    } catch (e) {
      segnala(e, 'chiacchiera');
    }
    // chi ha bisogno di qualcosa
    const aperte = (st.favors || []).filter(f => !f.done && !f.esito && f.id !== id && ITEMS[f.item]);
    if (aperte.length) {
      const f = aperte[Math.floor(Math.random() * aperte.length)];
      L.push(`${this.nome(f.id)} cerca ${f.n} × ${ITEMS[f.item].n.toLowerCase()}. Gli faresti un favore.`);
    }
    // la festa
    try {
      const g = festSoon(st);
      if (g > 0) {
        const f = festOf(st);
        L.push(
          g === 1
            ? `Domani c'è ${f.n}! Non mancare.`
            : `Fra ${g} giorni c'è ${f.n}. ${this.nome(f.org)} sta preparando tutto.`
        );
      }
    } catch (e) {
      segnala(e, 'chiacchiera');
    }
    if (!L.length) L.push('Niente di nuovo. Qui le novità arrivano piano, come la primavera.');
    return this._a(L, 'novita:' + id);
  },
  // ---------- parlami di te ----------
  dime(id) {
    const st = G.st,
      F = st.flags || {},
      h = hearts(id),
      L = [];
    const sec = (typeof FREE_SECRETS !== 'undefined' && FREE_SECRETS[id]) || [];
    for (const [hh, t] of sec)
      if (F['fsec_' + id + hh]) L.push('Ti ricordi cosa ti ho raccontato? ' + t.replace(/^[«"]|[»"]$/g, ''));
    for (let i = 0; i < 2; i++) {
      const t = Dialoghi.battuta(id, 'saluto');
      if (t && h >= 3) L.push(t);
    }
    const prossimo = sec.find(([hh]) => !F['fsec_' + id + hh]);
    if (prossimo && h < prossimo[0])
      L.push(
        h >= 3
          ? 'Ci sono cose che ancora non ti ho detto. Un giorno, forse.'
          : 'Di me? Ci conosciamo ancora poco. Torna a trovarmi, magari con un regalo.'
      );
    // pensieri suoi (solo le battute personali, non quelle di tutti)
    const mie = ((Dialoghi.db.passaggio || {})[id] || []).filter(e => Dialoghi.ok(e, id)).map(e => e.t);
    for (let i = 0; i < 3 && mie.length; i++) L.push(mie[Math.floor(Math.random() * mie.length)]);
    if (!L.length) L.push(this.umore(id));
    return this._a(L, 'dime:' + id);
  },
  // ---------- la conversazione ----------
  async parla(n) {
    const st = G.st,
      id = n.id || n;
    const prima = !(st.chiacchiere = st.chiacchiere || {})[id] || st.chiacchiere[id] !== st.day;
    if (prima) {
      st.chiacchiere[id] = st.day;
      addFriend(id, 1);
    }
    const temi = [
      ['Come va?', () => this.umore(id)],
      ['Novità in paese?', () => this.novita(id)],
      ['Parlami di te', () => this.dime(id)]
    ];
    let txt = prima
      ? this._a(
          ['Volentieri. Di cosa parliamo?', 'Ho un minuto. Dimmi.', 'Siediti un attimo. Che si dice?'],
          'ap'
        )
      : this._a(['Ancora tu! Mi fa piacere.', 'Di nuovo qui? Dimmi pure.'], 'ap2');
    for (let giri = 0; giri < 4; giri++) {
      const c = await ask(id, txt, [...temi.map(t => t[0]), 'A presto']);
      if (c == null || c < 0 || c >= temi.length) {
        await say(id, this._a(['A presto, {n}.', 'Buona giornata.', 'Torna quando vuoi.'], 'ciao'));
        return true;
      }
      await say(id, temi[c][1]());
      txt = this._a(['Altro?', 'Che altro mi racconti?', 'E poi?'], 'altro');
    }
    await say(id, 'Adesso devo tornare al lavoro. Mi ha fatto piacere.');
    return true;
  }
};
