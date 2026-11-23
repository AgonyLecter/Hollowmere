'use strict';
// ================= IL RANGO, CHIARO =================
// Il prestigio è la somma di voci precise (scoreParts). Sotto l'orologio: rango e barra; toccandola si apre il
// registro con il dettaglio, cosa dà ogni azione, cosa sblocca il prossimo rango e tre consigli pratici.
// Quando il prestigio sale, «+N prestigio» sopra il personaggio.

function scoreParts(st) {
  st = st || homeSt();
  if (!st || !isFree(st)) return [];
  const W2 = st.free,
    P = [];
  let small = 0,
    big = 0,
    lv = 0;
  for (const k in W2.built) {
    const b = W2.built[k],
      v = BIG_BUILT[b.id] || 1;
    if (v > 1) big += v;
    else small += 1;
    if (typeof FUNC !== 'undefined' && FUNC[b.id]) lv += ((b.lv || 1) - 1) * 15;
  }
  const hearts = Object.keys(st.friends || {}).reduce(
    (a, id) => a + Math.max(0, Math.floor((st.friends[id] || 0) / 2)),
    0
  );
  const mus = Object.keys(W2.museo || {}).length,
    tr = Object.keys(W2.trag || {}).length;
  P.push(['Piccole costruzioni', small, '+1 ciascuna (lampioni, recinti, aiuole, alberi…)']);
  P.push(['Edifici grandi', big, 'pollaio 30, stalla 40, casetta 45, serra 40, mulino 35…']);
  P.push(['Edifici migliorati', lv, '+15 per ogni livello in più di serra, mulino, silos, pozzo']);
  P.push(['Casa', (houseLv(st) - 1) * 80, '+80 per ogni ampliamento da Brom']);
  P.push([
    'Terre',
    Math.max(0, (W2.land || ['casa']).length - 1) * 60,
    '+60 per ogni terra comprata da Ezekiel'
  ]);
  P.push(['Animali', (W2.animals || []).length * 8, '+8 per ogni bestia']);
  P.push(['Arredo', Object.keys(W2.inside || {}).length * 2, '+2 per ogni mobile in casa']);
  P.push(['Ricette', Object.keys(W2.recipes || {}).length * 4, '+4 per ogni ricetta imparata']);
  P.push([
    'Abilità',
    Object.keys(SKILLS).reduce((a, k) => a + skLv(k, st), 0) * 6,
    '+6 per ogni livello di abilità'
  ]);
  P.push(['Amicizie', hearts * 3, '+3 per ogni cuore con gli abitanti']);
  P.push(['Abitanti nuovi', residents(st).length * 50, '+50 per ogni abitante arrivato in una casetta']);
  if (W2.mine)
    P.push(['Miniera', Math.min(400, (W2.mine.deep || 0) * 3), '+3 per ogni piano raggiunto (fino a 400)']);
  P.push(['Museo', mus * 3, '+3 per ogni pezzo donato']);
  P.push(['Traguardi', tr * 5, '+5 per ogni traguardo']);
  if (st.flags.nove) P.push(['Nove', 50, 'chi non è stato contato']);
  const don = (W2.dispensa && W2.dispensa.donato) || 0;
  if (don >= 100)
    P.push([
      'Dispensa',
      Math.min(300, Math.floor(don / 100)),
      '+1 ogni 100 scudi donati alla dispensa (fino a 300)'
    ]);
  return P;
}
// da qui in poi il prestigio è esattamente la somma delle voci (quello che si vede è quello che conta)

const rankStart = r =>
  r < RANKS.length ? RANKS[r][1] : RANKS[RANKS.length - 1][1] + (r - RANKS.length + 1) * 2500;
function nextUnlock(r) {
  return r + 1 <= 4 ? RANK_GIFTS[r + 1] : "Un'altra stella per il villaggio.";
}
// tre consigli: le cose più vicine da fare
function rankTips(st) {
  const T = [],
    W2 = st.free,
    own = new Set(W2.land || ['casa']);
  const plot = Object.entries(PLOTS).find(
    ([k, P]) => k !== 'casa' && !own.has(k) && !(P.zone && !zoneOpen(P.zone, st))
  );
  if (plot) T.push(`Compra «${plot[1].n}» da Ezekiel: +60 (costa ${SC(plot[1].p)})`);
  if (HOUSE_UP[houseLv(st) + 1] && !W2.houseJob) T.push(`Fai ampliare la casa da Brom: +80`);
  if (!Object.values(W2.built).some(b => b.id === 'pollaio'))
    T.push('Costruisci un pollaio al banco (Edifici): +30, e +8 per ogni gallina');
  else if (!Object.values(W2.built).some(b => b.id === 'stalla'))
    T.push('Costruisci una stalla al banco (Edifici): +40');
  if (myRank(st) >= 1 && residents(st).length < resCap(myRank(st)))
    T.push('Costruisci una casetta: arriva un abitante, +45 e +50');
  T.push('Dona al museo una cosa nuova: +3 ciascuna');
  T.push('Parla e fai regali agli abitanti: +3 per ogni cuore');
  return T.slice(0, 3);
}

// il rango sotto l'orologio
function rankBadge() {
  let el = $('#rbadge');
  const st = homeSt();
  if (!el) {
    el = document.createElement('div');
    el.id = 'rbadge';
    el.className = 'dark';
    el.innerHTML = '<span id="rbn"></span><div id="rbbar"><div></div></div>';
    ($('#hud') || document.body).appendChild(el);
    el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (G.mode === 'game' && !G.cut && !UI.busy()) {
        AU.play('ui');
        registroMenu();
      }
    });
  }
  const show = st && isFree(st) && G.mode === 'game';
  el.classList.toggle('hide', !show);
  if (!show) return;
  const sc = villageScore(st),
    r = rankOf(sc),
    a = rankStart(r),
    b = rankNext(r);
  $('#rbn').textContent = `🏘 Rango: ${rankName(r)} · ${sc}/${b} ›`;
  $('#rbbar').firstChild.style.width = Math.max(0, Math.min(100, ((sc - a) / (b - a)) * 100)) + '%';
}
{
  const _h = UI.hud.bind(UI);
  UI.hud = function () {
    _h();
    try {
      rankBadge();
    } catch (e) {
      segnala(e, 'rango');
    }
  };
}
// «+N prestigio» quando sale
let PRE_LAST = null,
  PRE_T = 0;
function prestigeTick(dt) {
  const st = homeSt();
  if (!st || !isFree(st) || G.visit || G.mode !== 'game') {
    PRE_LAST = null;
    return;
  }
  PRE_T -= dt;
  if (PRE_T > 0) return;
  PRE_T = 1;
  const sc = villageScore(st);
  if (PRE_LAST != null && sc > PRE_LAST && !G.cut) {
    floatText(`+${sc - PRE_LAST} prestigio`, G.player.x, G.player.y - 34, '#f6d98a', 1.2);
    const el = $('#rbadge');
    if (el) {
      el.classList.remove('up');
      void el.offsetWidth;
      el.classList.add('up');
    }
    rankBadge();
  }
  PRE_LAST = sc;
}
{
  Ext.on('mpTick', function (dt) {
    prestigeTick(dt);
  });
}
GUIDES.push({
  id: 'rango',
  v: 8,
  n: 'Il rango del villaggio, spiegato',
  steps: [
    {
      t: "Sotto l'orologio adesso c'è il tuo rango, con la barra verso il prossimo. Toccala quando vuoi: si apre il registro del villaggio."
    },
    {
      t: 'Il registro dice da dove viene il prestigio, voce per voce, quanto manca al prossimo rango e cosa sblocca. E ti dà tre consigli su cosa fare adesso.'
    },
    {
      t: 'Ogni volta che il prestigio sale, sopra di te compare «+ prestigio»: così vedi subito cosa conta. Costruire, comprare terre, ampliare la casa, gli abitanti, il museo: tutto aiuta.'
    }
  ]
});

// ---------- la pietra del villaggio, in piazza ----------
// una lapide di pietra con la targa d'ottone: dice il rango del villaggio e apre il registro
const PIETRA_AT = [38, 17];
function genPietraArtBase() {
  IMG.pietra = SP(14, 24, P => {
    P.body(
      10,
      46,
      () => 14,
      Y => (Y < 14 ? (Y - 10) * 1.6 + 6 : 12 + (Y - 14) * 0.08),
      rp('#8a877d'),
      { nyF: Y => (Y < 16 ? -0.4 : 0.1), mod: (X, Y, v) => ((X * 3 + Y * 7) % 13 === 0 ? v - 0.25 : v) }
    );
    P.rect(6, 20, 16, 10, rp('#c8a03a'), { spec: 0.9 });
    P.line(9, 24, 19, 24, C('#5a3a1e'));
    P.line(9, 27, 17, 27, C('#5a3a1e'));
    P.rect(3, 44, 22, 4, rp('#6a6760'));
  });
}

// catena: altri file la avvolgono con Ext.avvolgi('genPietraArt', …)
function genPietraArt(...a) {
  return Ext.catena('genPietraArt', genPietraArtBase, this, a);
}

{
  Ext.on('applyFree', function (m, st) {
    if (m.id !== 'main' || !isFree(st)) return;
    if (!IMG.pietra && PX.prototype.line) genPietraArt();
    const [x, y] = PIETRA_AT;
    const o = m.objAt(x, y);
    if (o && o.kind !== 'built') mapRemove(m, o);
    if (!m.objAt(x, y)) m.add(OB('pietra', x, y, IMG.pietra, { act: 'pietra' }));
  });
}
PROMPT.pietra = 'Il villaggio';
ACT.pietra = () => {
  if (G.visit) {
    const st = G.st,
      sc = villageScore(st),
      r = rankOf(sc);
    UI.open(
      `<button class="btn mclose" data-close>✕</button><h2>Il villaggio di ${esc(st.name)}</h2><p style="font-size:1.2em">${rankName(r)}</p><p class="small">Prestigio <b>${sc}</b>. Il registro del tuo villaggio lo trovi sulla pietra della tua piazza, o toccando il rango sotto l'orologio.</p>`
    );
    return;
  }
  registroMenu();
};
GUIDES.push({
  id: 'pietra',
  v: 14,
  n: 'La pietra del villaggio',
  steps: [
    {
      t: "In piazza, accanto alla bacheca, c'è la pietra del villaggio. Toccala: ti dice il rango, quanto manca al prossimo e cosa fare per salire.",
      at: () => ({ x: PIETRA_AT[0] * 16 + 8, y: PIETRA_AT[1] * 16, l: 'La pietra' })
    },
    {
      t: "Il rango lo vedi sempre anche sullo schermo, in alto a destra, sotto l'ora e i soldi: «Rango». Toccalo e si apre lo stesso registro."
    }
  ]
});
