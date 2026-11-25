'use strict';
// ================= LA FUCINA DI BROM, DENTRO =================
// Di giorno la porta della fucina si apre: dentro la forgia di pietra con le braci che respirano, il mantice,
// l'incudine sul ceppo, la vasca della tempra, la rastrelliera degli attrezzi, il tavolo da disegno con le piante
// della casa, il carbone e la mola. I servizi di Brom stanno dove si fanno: all'incudine si migliorano gli
// attrezzi (forgeMenu), al tavolo da disegno si amplia la casa (houseUpMenu), se lui c'è.
// Nella Valle la mattina Brom lavora qui dentro (scintille e colpi di martello); il pomeriggio torna
// all'incudine fuori, così il paese continua a vedere le scintille. Nella storia resta fuori, come sempre.
// Di notte la porta è chiusa: si bussa (porte.js).

const FUC_W = 12,
  FUC_H = 9,
  FUC_APRE = 7 * 60,
  FUC_CHIUDE = 19 * 60,
  FUC_INCUDINE = [5, 5],
  FUC_BROM = [5, 4]; // Brom, dietro l'incudine, che guarda verso di te
const fucAperta = st => st.time >= FUC_APRE && st.time < FUC_CHIUDE && !(st.flags && st.flags.finaleChase);
IMAP.forge = 'forge';
const FUC = { mantice: -9, vampa: -9, colpo: 0 }; // quello che si vede (non si salva)

Ext.on('arte', () => {
  const D = FUCINA_MANO;
  for (const k of Object.keys(D.sprite)) FREEIMG['fuc_' + k] = daGriglia(D, k);
});

// ---------- la stanza ----------
function buildFucina(st) {
  const m = new GMap('forge', FUC_W, FUC_H, { interior: 1, name: 'Fucina' });
  m.fill(0, 0, FUC_W - 1, 0, 13);
  m.fill(0, 1, FUC_W - 1, 1, 13);
  m.fill(0, 2, FUC_W - 1, FUC_H - 1, 7);
  const I = FREEIMG,
    metti = (kind, x, y, img, o = {}) =>
      img &&
      m.add(
        Object.assign(OB(kind, x, y, img, o), {
          solid: o.solid || [[x, y]],
          hits: o.hits || o.solid || [[x, y]]
        })
      );
  metti('fuc_forgia', 1, 2, I.fuc_forgia, {
    wt: 3,
    act: 'fucForgia',
    solid: [
      [1, 2],
      [2, 2],
      [3, 2]
    ],
    lift: 2
  });
  metti('fuc_mantice', 4, 2, I.fuc_mantice0, { act: 'fucMantice', wt: 2, solid: [[4, 2]], lift: -1 });
  metti('fuc_rastrelliera', 7, 1, I.fuc_rastrelliera, {
    wt: 2,
    solid: [],
    hits: [
      [7, 2],
      [8, 2]
    ],
    act: 'fucRastrelliera',
    lift: 6
  });
  metti('fuc_incudine', FUC_INCUDINE[0], FUC_INCUDINE[1], I.fuc_incudine, {
    act: 'fucIncudine',
    wt: 2,
    solid: [FUC_INCUDINE]
  });
  metti('fuc_vasca', 2, 5, I.fuc_vasca, {
    act: 'fucVasca',
    wt: 2,
    solid: [
      [2, 5],
      [3, 5]
    ]
  });
  metti('fuc_tavolo', 9, 3, I.fuc_tavolo, {
    act: 'fucTavolo',
    wt: 2,
    solid: [
      [9, 3],
      [10, 3]
    ]
  });
  metti('fuc_carbone', 1, 7, I.fuc_carbone, { act: 'fucCarbone', wt: 1 });
  metti('fuc_mola', 10, 6, I.fuc_mola, { act: 'fucMola' });
  // la luce della forgia, calda e bassa
  m.lights.push({ x: 2 * 16 + 8, y: 2 * 16, r: 80, fire: 1 }, { x: 10 * 16, y: 3 * 16, r: 36, fire: 1 });
  const [dx, dy] = bdoor('forge');
  m.add({
    kind: 'mat',
    tx: 6,
    ty: FUC_H - 1,
    img: IMG.mat,
    dx: 6 * 16,
    dy: (FUC_H - 1) * 16 + 4,
    sy: -1,
    solid: [],
    hits: [],
    deco: 1
  });
  m.doors.push({ tx: 6, ty: FUC_H - 1, to: 'main', x: dx, y: dy + 1, dir: 0 });
  addExits(m);
  buildGround(m);
  return m;
}
Ext.avvolgi('rebuildMaps', function (prossimo, ...a) {
  const r = prossimo(...a);
  if (G.st) {
    G.maps.forge = buildFucina(G.st);
    if (G.map && G.map.id === 'forge') G.map = G.maps.forge;
  }
  return r;
});

// ---------- la porta ----------
Ext.on('porta:intercetta', o => {
  if (o.key !== 'forge' || !fucAperta(G.st)) return null;
  return Ext.intercetta('vaiMappa', 'forge', 6, FUC_H - 2, 3);
});
// nella Valle: la mattina Brom lavora dentro, il pomeriggio fuori all'incudine
{
  const giornata = SCHED.brom;
  SCHED.brom = function (st) {
    const r = giornata(st);
    if (r && r.act === 'forge' && isFree(st) && !G.visit && st.time < 12 * 60)
      return Object.assign({}, r, { in: 'forge', seat: [FUC_BROM[0], FUC_BROM[1], 0] });
    return r;
  };
}
const bromQui = () => {
  const b = NPC('brom');
  return !!(b && !b.hidden && b.map === 'forge');
};

// ---------- toccare le cose ----------
ACT.fucIncudine = async () => {
  if (bromQui()) {
    if (!isFree(G.st)) return talkTo(NPC('brom'));
    AU.play('martello');
    return forgeMenu();
  }
  UI.toast('L’incudine è ancora tiepida. Brom è fuori: gli attrezzi li migliora solo lui.');
};
ACT.fucTavolo = async () => {
  if (bromQui() && isFree(G.st)) return houseUpMenu();
  UI.toast(
    'Sul tavolo, le piante di una casa: la tua, con le stanze nuove segnate a matita. «Chiedere a Brom».'
  );
};
ACT.fucMantice = () => {
  FUC.mantice = G.t;
  FUC.vampa = G.t + 0.15;
  AU.play('mantice');
  if (!G.st.flags.fucMantice) {
    G.st.flags.fucMantice = 1;
    UI.toast('Il fuoco divampa. Da qualche parte, Brom sorride.');
  }
};
ACT.fucForgia = () => {
  FUC.vampa = G.t;
  UI.toast(
    G.st.time < 12 * 60
      ? 'Le braci sono bianche al centro. Il calore ti asciuga gli occhi.'
      : 'Le braci covano sotto la cenere. Basta un colpo di mantice.'
  );
};
ACT.fucVasca = () => {
  AU.play('tempra');
  UI.toast('L’acqua della tempra è nera e tiepida. Sa di ferro.');
};
ACT.fucRastrelliera = () =>
  UI.toast(
    'Tenaglie, martelli, una lima, due ferri di cavallo. Uno è piccolo, da puledro. Nessuno l’ha mai ritirato.'
  );
ACT.fucCarbone = () => UI.toast('Carbone di castagno, dal bosco. Brom dice che brucia più onesto.');
ACT.fucMola = () => {
  AU.play('pietra');
  UI.toast('Giri la manovella. La mola canta, e una scintilla ti salta sulla manica.');
};
Object.assign(PROMPT, {
  fucIncudine: 'Incudine',
  fucTavolo: 'Tavolo',
  fucMantice: 'Soffia',
  fucForgia: 'Guarda',
  fucVasca: 'Guarda',
  fucRastrelliera: 'Guarda',
  fucCarbone: 'Guarda',
  fucMola: 'Gira'
});

// ---------- quello che si vede ----------
// il mantice si schiaccia, le braci respirano e divampano, Brom batte il ferro: scintille e colpi
Ext.on('listaMondo', (list, m) => {
  if (m.id !== 'forge') return;
  const o = m.objs.find(q => q.act === 'fucMantice');
  if (o) o.img = G.t - FUC.mantice < 0.35 ? FREEIMG.fuc_mantice1 : FREEIMG.fuc_mantice0;
});
Ext.on('drawWorldExtras', m => {
  if (m.id !== 'forge') return;
  const fo = m.objs.find(q => q.act === 'fucForgia');
  if (fo) {
    // le braci: un bagliore che respira, più forte dopo il mantice; qualche favilla che sale nella cappa
    const vampa = Math.max(0, 1 - (G.t - FUC.vampa) / 1.2),
      resp = 0.5 + 0.5 * Math.sin(G.t * 2.3) + vampa * 1.5,
      X = fo.dx + 24,
      Y = fo.dy + 40;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(0.32, 0.12 + 0.08 * resp);
    ctx.fillStyle = '#ff8a30';
    ctx.beginPath();
    ctx.ellipse(X, Y - 1, 10 + 2 * resp, 4 + resp, 0, 0, 7);
    ctx.fill();
    ctx.restore();
    if (Math.random() < 0.08 + vampa * 0.5)
      G.parts.push({
        k: 'spark',
        x: X - 8 + Math.random() * 16,
        y: Y - 4,
        vx: (Math.random() - 0.5) * 6,
        vy: -18 - vampa * 20,
        t: 0,
        life: 0.9,
        c: Math.random() < 0.5 ? '#ffd070' : '#ff8a30'
      });
  }
  // Brom all'incudine: un colpo ogni tanto, a coppie, con le scintille
  if (bromQui() && G.mode === 'game') {
    const [ax, ay] = FUC_INCUDINE,
      ritmo = G.t % 1.6,
      colpo = ritmo < 0.05 || (ritmo > 0.3 && ritmo < 0.35);
    if (colpo && G.t - FUC.colpo > 0.2) {
      FUC.colpo = G.t;
      AU.play('martello');
      for (let i = 0; i < 6; i++)
        G.parts.push({
          k: 'spark',
          x: ax * 16 + 12 + (Math.random() - 0.5) * 6,
          y: ay * 16 + 2,
          vx: (Math.random() - 0.5) * 60,
          vy: -20 - Math.random() * 30,
          t: 0,
          life: 0.4,
          c: Math.random() < 0.5 ? '#fff0c0' : '#ffd070'
        });
    }
  }
});

// ---------- i suoni ----------
Object.assign(SFX, {
  // il martello sul ferro caldo: un colpo secco e il canto dell'incudine
  martello: (a, t) => {
    a.noise(t, 0.03, 0.12, 'highpass', 2600);
    a.osc('sine', 1180 + Math.random() * 60, t, 0.35, 0.05);
    a.osc('sine', 2350, t, 0.2, 0.025);
  },
  // il mantice: un soffio lungo
  mantice: (a, t) => a.noise(t, 0.45, 0.14, 'lowpass', 700, 1, null, 0.08, 1400),
  // il ferro nella tempra
  tempra: (a, t) => a.noise(t, 0.7, 0.09, 'highpass', 3600, 1, null, 0.02)
});
