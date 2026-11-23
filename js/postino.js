'use strict';
// ================= OTTAVIO PORTA LE NOVITÀ =================
// Ogni novità del gioco (una voce in GUIDES) e ogni avviso della regia che il giocatore non ha ancora visto
// arrivano con Ottavio il postino: ti raggiunge a piedi, ti spiega cosa c'è di nuovo e cosa fare, e se vuoi
// ti accompagna con la freccia. Il gioco ricorda per ogni giocatore cosa ha già visto (free.guides).
// Per un aggiornamento futuro basta aggiungere una voce a GUIDES: ci pensa lui.

const plain = t => fmt(String(t).replace(/<[^>]+>/g, '')).replace('%PID%', (homeSt() || {}).pid || '');
function guideSeen(st, g) {
  const S = guidesSeen(st);
  S[g.id] = 1;
  if (g.id === 'valle') for (const x of GUIDES) if (x.v <= 1) S[x.id] = 1;
  if (g.news) st.free.newsPing = g.news;
}
function postinoPending(st) {
  const S = guidesSeen(st),
    L = GUIDES.filter(g => !S[g.id]).sort((a, b) => (a.v || 0) - (b.v || 0));
  const n = tourPick(st);
  if (n && n.news) L.push(n);
  return L;
}
let POSTINO_NEXT = 0;
let POSTINO = false;
async function postino() {
  const st = homeSt();
  if (POSTINO || !st || performance.now() < POSTINO_NEXT) return;
  let L = postinoPending(st);
  if (!L.length) return;
  L = L[0].id === 'valle' ? [L[0]] : L.slice(0, 2);
  POSTINO = true;
  const n = NPC('ottavio'),
    p = G.player,
    m = G.maps.main,
    [px, py] = ptile(p);
  G.cut++;
  try {
    // arriva da qualche passo più in là, a piedi
    let s = null;
    for (const [dx, dy] of [
      [6, 0],
      [-6, 0],
      [0, 5],
      [0, -5],
      [4, 4],
      [-4, 4]
    ]) {
      const q = freeNear(m, clamp(px + dx, 4, m.w - 5), clamp(py + dy, 4, m.h - 5));
      if (!m.solid(q[0], q[1]) && bfs(m, q[0], q[1], px, py)) {
        s = q;
        break;
      }
    }
    s = s || freeNear(m, px + 2, py);
    const near = freeNear(m, px + (s[0] > px ? 1 : -1), py);
    placeNPC(n, 'main', s[0], s[1], 0);
    n.script = true;
    AU.play('bell', 1.6);
    UI.toast('📯 Ottavio il postino ti cerca: ha delle novità.');
    await Promise.race([walkNPC(n, near[0], near[1], near[0] > px ? 1 : 2), sleep(7000)]);
    if (Math.hypot(n.x - (near[0] * 16 + 8), n.y - (near[1] * 16 + 14)) > 20)
      placeNPC(n, 'main', near[0], near[1], near[0] > px ? 1 : 2);
    n.dir = near[0] > px ? 1 : 2;
    p.dir = near[0] > px ? 2 : 1;
    st.flags.met.ottavio = 1;
    // le novità, una dopo l'altra
    let first = true,
      showMe = null;
    for (const g of L) {
      if (g.news) {
        await say(
          'ottavio',
          `${first ? 'Posta per te, {n}! ' : 'E poi… '}${plain(g.steps[0].t)} È nella bacheca comune, in piazza.`
        );
        guideSeen(st, g);
        first = false;
        continue;
      }
      const big = g.id === 'valle';
      await say(
        'ottavio',
        first
          ? big
            ? "Ehi, {n}! Sono Ottavio, il postino. Adesso che la Valle è aperta, porto io le notizie: ogni volta che c'è qualcosa di nuovo, vengo a dirtelo."
            : `Posta per te, {n}! Novità nella Valle: «${g.n}».`
          : `E non è finita. C'è anche questa: «${g.n}».`
      );
      for (const step of g.steps) {
        let t = plain(step.t).replace(/^Novità( nella Valle)?:\s*/i, '');
        t = t.charAt(0).toUpperCase() + t.slice(1);
        await say('ottavio', t);
      }
      if (!showMe && g.steps.some(x => x.at)) showMe = g;
      else guideSeen(st, g);
      first = false;
    }
    if (showMe) {
      const c = await ask('ottavio', 'Vuoi che ti accompagni a vedere i posti di cui ti ho parlato?', [
        'Sì, fammi vedere',
        'No, ho capito'
      ]);
      if (c === 0) {
        G.cut--;
        n.script = false;
        tourStart(showMe);
        G.cut++;
      } else guideSeen(st, showMe);
    }
    await say('ottavio', 'Bene. Io torno al mio giro. Se arriva altro, ti trovo io.');
    NET.save(st);
  } catch (e) {
    console.error(e);
  } finally {
    G.cut--;
    n.script = false;
    POSTINO = false;
    POSTINO_NEXT = performance.now() + 150000;
  }
  // se ne va per la sua strada
  const away = freeNear(m, clamp(px + (n.x / 16 > px ? 7 : -7), 4, m.w - 5), py);
  walkNPC(n, away[0], away[1]).then(() => {
    n.script = false;
  });
  setTimeout(() => {
    n.script = false;
  }, 6000);
}
// al posto del riquadro che partiva da solo: arriva Ottavio, solo all'aperto e nel tuo villaggio
{
  Ext.avvolgi('tourTick', function (prossimo, dt) {
    const st = homeSt();
    if (
      !G.tour &&
      st &&
      isFree(st) &&
      G.mode === 'game' &&
      !G.cut &&
      !UI.busy() &&
      !G.visit &&
      !G.bm &&
      G.map &&
      G.map.id === 'main' &&
      !POSTINO
    ) {
      TOUR_WAIT -= dt;
      if (TOUR_WAIT > 0) return;
      TOUR_WAIT = 3;
      if (postinoPending(st).length) postino();
      return;
    }
    if (!G.tour) {
      const el = $('#tour');
      if (el) el.classList.add('hide');
      TOUR_WAIT = Math.max(TOUR_WAIT, 2);
      return;
    }
    return prossimo(dt);
  });
}
