'use strict';
// ================= LA CASA TUTTA TUA (gioco libero) =================
// Nella storia la casa del nonno è com'è. Finita la storia, nella Valle, tutto si sposta: anche il letto, il camino,
// il ritratto, la cassa dei ricordi, lo scaffale dei libri, il tavolo e il tappeto. Diventano mobili come gli
// altri (st.free.inside, il passaggio lo fa casaLibera() in world.js): si spostano con la modalità costruzione, si
// tolgono con l'accetta, si rimettono dove vuoi. Fanno quello che facevano prima (il letto fa dormire, il camino
// cucina, la cassa custodisce i ricordi…). La mattina ti svegli accanto al letto, dovunque l'abbia messo
// (svegliaPos in world.js). Il letto si rifà con due matasse di lana colorata dello stesso colore: la coperta
// prende quel colore (st.free.lettoCol).

const NONNO = {
  letto_nonno: {
    n: 'Il letto del nonno',
    d: 'Coperte che sanno di lavanda. Si dorme qui; la mattina ti svegli accanto, dovunque lo metti.',
    fp: [1, 2]
  },
  camino_nonno: {
    n: 'Il camino',
    d: 'Si cucina qui. Va sulla parete, in alto: il fuoco viene con lui.',
    fp: [2, 1],
    wall: 1,
    lift: 4,
    anim: 'fire',
    luceCasa: [16, 8, 70],
    solido: 1
  },
  ritratto_nonno: { n: 'Il ritratto', d: 'Il nonno, da giovane. Gli occhi ti seguono un po’.', wall: 1 },
  cassa_nonno: { n: 'La cassa del nonno', d: 'Dentro ci sono i ricordi. Pesa più di quanto dovrebbe.' },
  scaffale_nonno: { n: 'Lo scaffale dei libri', d: 'Gli almanacchi, l’erbario, il ricettario.' },
  tavolo_nonno: { n: 'Il tavolo del nonno', d: 'Per una persona, con due sedie.', fp: [2, 1] },
  tappeto_nonno: { n: 'Il tappeto', d: 'Consumato dove il nonno camminava avanti e indietro.', flat: 1 }
};
for (const id in NONNO) ITEMS[id] = Object.assign({ t: 'arredo', v: 0, nonno: 1 }, NONNO[id]);

// i disegni: quelli di sempre (la coperta del letto col suo colore, la cassa aperta se l'hai aperta)
{
  const def = (id, get) =>
    Object.defineProperty(FREEIMG, id, { get, set() {}, configurable: true, enumerable: true });
  def('letto_nonno', () => {
    const c = G.st && G.st.free && G.st.free.lettoCol;
    return c && TINTE[c] ? tintaImg(IMG.bed, TINTE[c].c, filtroCoperta, 'coperta') : IMG.bed;
  });
  def('camino_nonno', () => IMG.fire && IMG.fire[0]);
  def('ritratto_nonno', () => IMG.portrait && IMG.portrait[G.st && H2(G.st) ? 1 : 0]);
  def('cassa_nonno', () => (G.st && G.st.flags && G.st.flags.openedChest ? IMG.chestO : IMG.chest));
  def('scaffale_nonno', () => IMG.shelf);
  def('tavolo_nonno', () => IMG.table);
  def('tappeto_nonno', () => IMG.rug);
}

// le icone (zaino, modalità costruzione): il disegno del mobile, rimpicciolito nei 32×32
Ext.on('arte', () => {
  for (const id in NONNO) {
    const im = FREEIMG[id];
    if (!im) continue;
    const [c, x] = mk(32, 32, { willReadFrequently: true }),
      w = iw(im),
      h = ih(im),
      k = Math.min(1, 30 / Math.max(w, h)),
      W = Math.max(1, Math.round(w * k)),
      H = Math.max(1, Math.round(h * k));
    x.drawImage(im, Math.round((32 - W) / 2), Math.round((32 - H) / 2), W, H);
    ICON[id] = c;
  }
});
// ---------- toccarli: fanno quello che facevano ----------
const LETTI = new Set(['letto_nonno', 'letto']);
Ext.on('arredo', o => {
  const id = o.fid;
  if (LETTI.has(id)) {
    lettoMenu(o);
    return true;
  }
  const act = {
    camino_nonno: 'fire',
    ritratto_nonno: 'portrait',
    cassa_nonno: 'chest',
    scaffale_nonno: 'shelf',
    tavolo_nonno: 'table'
  }[id];
  if (act) {
    runAct(Object.assign({}, o, { act }));
    return true;
  }
  if (id === 'tappeto_nonno') {
    UI.toast('Il tappeto del nonno. Consumato in una linea dritta, dalla finestra al camino e ritorno.');
    return true;
  }
  return false;
});
// le matasse di lana colorata che hai (almeno 2 dello stesso colore)
const lanaPerLetto = () => TINTE_LANA.filter(k => countItem('lana_' + k) >= 2);
async function lettoMenu(o) {
  const st = G.st,
    L = lanaPerLetto(),
    opz = ['Riposa o dormi'];
  if (L.length) opz.push('Rifai il letto con la lana');
  if (st.free.lettoCol && o.fid === 'letto_nonno') opz.push('Rimetti le coperte gialle');
  opz.push('Niente');
  if (opz.length === 2) return runAct({ act: 'bed' });
  let dormi = false;
  G.cut++;
  try {
    const c = await ask(null, o.fid === 'letto_nonno' ? 'Il letto del nonno.' : 'Il letto grande.', opz),
      scelta = opz[c];
    if (scelta === 'Riposa o dormi') dormi = true;
    else if (scelta === 'Rifai il letto con la lana') {
      const k2 = await ask(null, 'Di che colore? (servono due matasse)', [
        ...L.map(k => `Lana ${TINTE[k].lana} (${countItem('lana_' + k)})`),
        'Lascia stare'
      ]);
      const k = L[k2];
      if (k) {
        removeItem('lana_' + k, 2);
        st.free.lettoCol = k;
        AU.play('rustle');
        houseRebuild();
        burst('spark', G.player.x, G.player.y - 14, 8, TINTE[k].c);
        UI.toast(
          `Il letto è rifatto: coperta ${TINTE[k].lana}, ancora calda di pecora. Stanotte si dorme meglio.`
        );
        if (typeof NET !== 'undefined') NET.save(st);
      }
    } else if (scelta === 'Rimetti le coperte gialle') {
      st.free.lettoCol = null;
      houseRebuild();
      UI.toast('Le coperte gialle del nonno. Sanno ancora di lavanda.');
    }
  } finally {
    G.cut--;
  }
  if (dormi) runAct({ act: 'bed' });
}
// il letto grande dei mobili nuovi adesso fa dormire anche lui
// (prima diceva: «per dormire, il letto del nonno è quello che conosci»)

// togliere il letto: un avviso, perché senza letto si dorme per terra
{
  const avvisa = id => {
    if (LETTI.has(id) && !Object.values(G.st.free.inside || {}).some(f => LETTI.has(f.id)))
      setTimeout(
        () => UI.toast('Senza un letto in casa ti svegli sul pavimento, vicino al camino. Rimettilo presto.'),
        600
      );
  };
  Ext.on('ottieni', id => {
    if (G.map && G.map.id === 'house' && ITEMS[id] && ITEMS[id].nonno) avvisa(id);
  });
}

// i mobili del nonno che non trovavano posto (c'era già un tuo mobile lì): nello zaino, o nella cassetta
Ext.on('mpTick', () => {
  const st = G.st;
  if (!st || !isFree(st) || G.visit || !st.free || !st.free.daRiporre || !st.free.daRiporre.length) return;
  if (G.mode !== 'game' || G.cut || UI.busy()) return;
  const L = st.free.daRiporre.splice(0);
  for (const id of L) riponi(id, 1);
  UI.toast('Alcuni mobili del nonno non trovavano posto in casa: li hai tu. Mettili dove vuoi.');
});
