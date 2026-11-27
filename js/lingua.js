'use strict';
// ================= LE LINGUE =================
// Il gioco è scritto in italiano, e l'italiano resta la lingua del codice. Le altre lingue sono un dizionario
// (TRAD.en, nei file js/lingua_en*.js): la chiave è la frase italiana com'è scritta nel codice, con {0}, {1}…
// al posto dei pezzi variabili dei template (`Spedite ${n} × ${nome}` → «Spedite {0} × {1}»).
// Non si tocca nessuna chiamata: la traduzione avviene dove il testo arriva sullo schermo:
//  - fmt() (ui.js), da cui passano dialoghi, narrazioni e avvisi;
//  - tutto quello che entra nella pagina (finestre, menu, barra, titoli): un osservatore traduce i pezzi di testo;
//  - le scritte disegnate sul canvas (fillText / measureText).
// Le frasi che non hanno traduzione restano in italiano (e il test «lingua» le conta).
// Lo strumento tools/testi.js estrae dal codice tutte le frasi e dice quali mancano.
const LINGUE = { it: 'Italiano', en: 'English' };
const LINGUA = (() => {
  try {
    const l = localStorage.getItem('hm_lingua');
    return LINGUE[l] ? l : 'it';
  } catch (e) {
    return 'it';
  }
})();
const TRAD = { en: {} };
const TR = {
  cache: new Map(),
  schemi: null, // i template con pezzi variabili: { re, en, n }, indicizzati per le prime lettere
  mancanti: new Set(),
  conta: true
};
document.documentElement.lang = LINGUA;
// prepara le espressioni dei template (una volta, alla prima traduzione)
function trSchemi() {
  const D = TRAD[LINGUA] || {},
    idx = new Map(),
    liberi = [];
  // le richieste scritte con {it} e {r} (riempite dal codice prima di arrivare qui) valgono anche con {0} e {1}
  // (e così ogni segnaposto con un nome, come {dove} e {chi}: numerati nell'ordine in cui compaiono; {n} resta)
  const nome = /\{(?!n\})([a-z]+)\}/g;
  for (const k of Object.keys(D))
    if (/\{(?!n\})[a-z]+\}/.test(k)) {
      const num = {};
      let i = 0;
      const a = k.replace(nome, (_, x) => '{' + (num[x] ??= i++) + '}');
      if (D[a] == null) D[a] = D[k].replace(nome, (m, x) => (num[x] != null ? '{' + num[x] + '}' : m));
    }
  for (const k of Object.keys(D)) {
    if (!/\{\d+\}/.test(k)) continue;
    const parti = k.split(/\{(\d+)\}/),
      ordine = [];
    let re = '^';
    for (let i = 0; i < parti.length; i++) {
      if (i % 2) {
        ordine.push(+parti[i]);
        re += '([\\s\\S]*?)';
      } else re += parti[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    const s = { re: new RegExp(re + '$'), en: D[k], ordine, lit: k.replace(/\{\d+\}/g, '').length };
    const pre = parti[0];
    if (pre.length >= 2) {
      const c = pre.slice(0, 2);
      if (!idx.has(c)) idx.set(c, []);
      idx.get(c).push(s);
    } else liberi.push(s);
  }
  // prima i più lunghi (i più precisi)
  for (const L of idx.values()) L.sort((a, b) => b.lit - a.lit);
  liberi.sort((a, b) => b.lit - a.lit);
  TR.schemi = { idx, liberi };
}
// una parola o un nome dentro una frase («rapa», «Rapa»): si cerca anche con la maiuscola
function trParola(s, D) {
  if (D[s] != null) return D[s];
  const M = s.charAt(0).toUpperCase() + s.slice(1);
  if (M !== s && D[M] != null) return D[M].charAt(0).toLowerCase() + D[M].slice(1);
  return null;
}
// traduce un testo intero (senza gli spazi attorno); restituisce null se non lo conosce
function trCerca(s, prof = 0) {
  const D = TRAD[LINGUA];
  const p = trParola(s, D);
  if (p != null) return p;
  if (!TR.schemi) trSchemi();
  const cand = (TR.schemi.idx.get(s.slice(0, 2)) || []).concat(TR.schemi.liberi);
  for (const sc of cand) {
    const m = sc.re.exec(s);
    if (!m) continue;
    const v = [];
    sc.ordine.forEach((n, i) => {
      const x = m[i + 1],
        t = prof < 2 && /[a-zàèéìòù]/i.test(x) ? trCerca(x.trim(), prof + 1) : null;
      v[n] = t != null ? x.replace(x.trim(), t) : x;
    });
    return sc.en.replace(/\{(\d+)\}/g, (_, n) => (v[n] != null ? v[n] : ''));
  }
  // «si accendono le candele…», «Ora:»: la frase senza la punteggiatura in fondo
  const m = /^([\s\S]*?[^\s…:.!?])([…:.!?]+)$/.exec(s);
  if (m && prof < 3) {
    const t = trCerca(m[1], prof + 1);
    if (t != null) return t + m[2];
  }
  // «3 zucche», «2 × Rapa»: il numero resta, il resto si traduce
  const q = /^([+−-]?\d[\d.,]*\s*(?:×\s*)?)(\S[\s\S]*)$/.exec(s);
  if (q && prof < 3) {
    const t = trCerca(q[2], prof + 1);
    if (t != null) return q[1] + t;
  }
  // elenchi messi insieme dal codice («2 rapa + 1 patata», «zucche, rape»): ogni pezzo, se li conosce tutti
  if (prof < 3) {
    const parti = s.split(/(\s+[+·]\s+|,\s+|\s+e\s+)/);
    if (parti.length > 1) {
      let out = '';
      for (let i = 0; i < parti.length; i++) {
        if (i % 2) {
          out += /^\s+e\s+$/.test(parti[i]) ? ' ' + (trParola('e', D) || 'e') + ' ' : parti[i];
          continue;
        }
        const t = trCerca(parti[i], prof + 1);
        if (t == null) {
          out = null;
          break;
        }
        out += t;
      }
      if (out != null) return out;
    }
  }
  // frasi messe in fila dal codice («Annaffiata oggi. Terra concimata.»): ognuna per conto suo, se le conosce tutte
  if (prof < 3) {
    const parti = s.split(/(?<=[.!?…»])(\s+)(?=[A-ZÀ-Ù«("])/);
    if (parti.length > 1) {
      let out = '';
      for (let i = 0; i < parti.length; i++) {
        if (i % 2) {
          out += parti[i];
          continue;
        }
        const t = trCerca(parti[i], prof + 1);
        if (t == null) return null;
        out += t;
      }
      return out;
    }
  }
  return null;
}
// la funzione che usa tutto il gioco: il testo nella lingua scelta (o com'era, se non c'è la traduzione)
function tr(s) {
  if (LINGUA === 'it' || s == null) return s;
  s = String(s);
  if (!/[a-zàèéìòù]/i.test(s)) return s;
  const c = TR.cache.get(s);
  if (c !== undefined) return c;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s),
    t = trCerca(m[2]);
  const out = t != null ? m[1] + t + m[3] : s;
  if (t == null && TR.conta && /[a-zàèéìòù]{3}/.test(m[2]) && !/<[a-z/][^>]*>/i.test(m[2]))
    TR.mancanti.add(m[2]);
  if (TR.cache.size > 20000) TR.cache.clear();
  TR.cache.set(s, out);
  if (t != null) TR.cache.set(out, out); // la frase tradotta non si ritraduce
  return out;
}
// ---------- la pagina: ogni pezzo di testo che entra si traduce ----------
// (non il testo del dialogo che si scrive lettera per lettera: quello passa già tradotto da fmt)
const TR_SALTA = '#dtext,#lt,.ccap,[data-no-tr],textarea,input,script,style,.chat-log,.chatlog';
function trNodo(n) {
  if (n.nodeType === 3) {
    const p = n.parentElement;
    if (!p || p.closest(TR_SALTA)) return;
    const v = n.nodeValue,
      t = tr(v);
    if (t !== v) n.nodeValue = t;
  } else if (n.nodeType === 1) {
    if (n.matches(TR_SALTA)) return;
    for (const a of ['title', 'placeholder', 'aria-label'])
      if (n.hasAttribute(a)) {
        const v = n.getAttribute(a),
          t = tr(v);
        if (t !== v) n.setAttribute(a, t);
      }
    for (const c of n.childNodes) trNodo(c);
  }
}
if (LINGUA !== 'it') {
  const avvia = () => {
    trNodo(document.body);
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'childList') m.addedNodes.forEach(trNodo);
        else if (m.type === 'characterData') trNodo(m.target);
        else trNodo(m.target);
      }
    }).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title', 'placeholder', 'aria-label']
    });
  };
  // quando tutti i file sono letti (anche i dizionari, che vengono dopo questo file)
  document.addEventListener('DOMContentLoaded', () => {
    TR.cache.clear();
    TR.schemi = null;
    TR.mancanti.clear();
    document.title = tr(document.title);
    avvia();
  });
  // le scritte disegnate (nomi sopra le teste, cartelli, numeri che volano…)
  const P = CanvasRenderingContext2D.prototype;
  for (const f of ['fillText', 'strokeText', 'measureText']) {
    const orig = P[f];
    P[f] = function (t, ...a) {
      return orig.call(this, typeof t === 'string' ? tr(t) : t, ...a);
    };
  }
}
// ---------- scegliere la lingua (dal menu iniziale e dalle opzioni) ----------
function linguaScegli(l) {
  if (!LINGUE[l] || l === LINGUA) return;
  try {
    localStorage.setItem('hm_lingua', l);
  } catch (e) {}
  location.reload();
}
