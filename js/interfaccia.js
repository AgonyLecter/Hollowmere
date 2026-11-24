'use strict';
// ================= INTERFACCIA VIVA =================
// Sul telefono il :active del CSS arriva tardi o non arriva: qui ogni pulsante premuto prende .giu (si abbassa),
// rilasciato .su (torna su con una molla) e dal punto toccato parte un'onda di luce; il pulsante A e ❄ sprizzano
// anche scintille (di brina, per ❄). L'aspetto è tutto in style.css, sezione «interfaccia viva».
{
  const PREMIBILI = 'button, .slot',
    TONDI = new Set(['bA', 'bSnow']),
    calma = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onda = (el, x, y) => {
    const r = el.getBoundingClientRect(),
      o = document.createElement('span');
    o.className = 'onda';
    o.style.left = x - r.left + 'px';
    o.style.top = y - r.top + 'px';
    el.appendChild(o);
    setTimeout(() => o.remove(), 500);
  };
  const scintille = el => {
    const r = el.getBoundingClientRect(),
      u = r.width / 40;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span'),
        a = (i / 8) * Math.PI * 2 + Math.random() * 0.4,
        d = (16 + Math.random() * 10) * u;
      s.className = 'scintilla';
      s.style.left = r.width / 2 + 'px';
      s.style.top = r.height / 2 + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      el.appendChild(s);
      setTimeout(() => s.remove(), 600);
    }
  };
  let premuto = null;
  const lascia = () => {
    const el = premuto;
    premuto = null;
    if (!el) return;
    el.classList.remove('giu');
    el.classList.remove('su');
    void el.offsetWidth; // la molla riparte anche se si preme di nuovo subito
    el.classList.add('su');
    setTimeout(() => el.classList.remove('su'), 400);
  };
  // in cattura: arriva anche ai pulsanti che fermano l'evento (il pulsante A, ❄)
  document.addEventListener(
    'pointerdown',
    e => {
      const el = e.target.closest && e.target.closest(PREMIBILI);
      if (!el || el.disabled) return;
      premuto = el;
      el.classList.add('giu');
      if (calma()) return;
      onda(el, e.clientX, e.clientY);
      if (TONDI.has(el.id)) scintille(el);
    },
    true
  );
  for (const ev of ['pointerup', 'pointercancel']) document.addEventListener(ev, lascia, true);
  document.addEventListener('pointerout', e => e.target === premuto && lascia(), true);
}
