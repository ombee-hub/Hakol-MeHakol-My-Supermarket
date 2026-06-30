/* הכל מהכל – וידג'ט נגישות (צד לקוח, localStorage) */
(function () {
  const ROOT = window.SITE_ROOT || '';
  const KEY = 'hmh_a11y_v1';
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  const save = () => localStorage.setItem(KEY, JSON.stringify(st));

  const TOGGLES = ['contrast', 'invert', 'grayscale', 'links', 'readable', 'cursor', 'stopanim', 'spacing'];

  function applyAll() {
    const h = document.documentElement, b = document.body;
    TOGGLES.forEach(c => h.classList.toggle('a11y-' + c, !!st[c]));
    b.style.zoom = st.font ? String(1 + 0.08 * st.font) : '';
    const f = [];
    if (st.contrast) f.push('contrast(1.4)');
    if (st.grayscale) f.push('grayscale(1)');
    if (st.invert) f.push('invert(1) hue-rotate(180deg)');
    b.style.filter = f.join(' ');
    // reflect active state on buttons
    document.querySelectorAll('#a11y-panel [data-k]').forEach(btn => {
      const k = btn.dataset.k;
      if (TOGGLES.includes(k)) btn.classList.toggle('on', !!st[k]);
    });
    const fl = document.getElementById('a11y-fontlabel');
    if (fl) fl.textContent = (st.font ? (st.font > 0 ? '+' : '') + st.font : '0');
  }

  const ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>';

  const BTNS = [
    { k: 'fontUp', label: 'הגדלת טקסט', ic: 'A+' },
    { k: 'fontDown', label: 'הקטנת טקסט', ic: 'A−' },
    { k: 'contrast', label: 'ניגודיות גבוהה', ic: '◑' },
    { k: 'invert', label: 'ניגודיות הפוכה', ic: '◐' },
    { k: 'grayscale', label: 'גווני אפור', ic: '▦' },
    { k: 'links', label: 'הדגשת קישורים', ic: '🔗' },
    { k: 'readable', label: 'גופן קריא', ic: 'Aa' },
    { k: 'cursor', label: 'סמן גדול', ic: '➤' },
    { k: 'stopanim', label: 'עצירת הנפשות', ic: '⏸' },
    { k: 'spacing', label: 'ריווח שורות', ic: '≣' },
  ];

  function build() {
    if (document.getElementById('a11y-fab')) return;
    const fab = document.createElement('button');
    fab.id = 'a11y-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'תפריט נגישות');
    fab.innerHTML = ICON;

    const overlay = document.createElement('div'); overlay.id = 'a11y-overlay';

    const panel = document.createElement('div');
    panel.id = 'a11y-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'תפריט נגישות');
    panel.innerHTML =
      '<div class="a11y-head">' + ICON + '<h3>תפריט נגישות</h3><button id="a11y-close" aria-label="סגירה">✕</button></div>' +
      '<div class="a11y-grid">' +
        BTNS.map(b => '<button class="a11y-btn" data-k="' + b.k + '"><span class="a11y-ic">' + b.ic + '</span>' + b.label +
          (b.k === 'fontUp' ? '' : '') + '</button>').join('') +
      '</div>' +
      '<div class="a11y-fontrow">גודל טקסט נוכחי: <b id="a11y-fontlabel">0</b></div>' +
      '<button id="a11y-reset" class="a11y-reset">איפוס הגדרות נגישות</button>';

    // append to <html> so page zoom/filter never affect the widget itself
    const root = document.documentElement;
    root.appendChild(overlay); root.appendChild(fab); root.appendChild(panel);

    fab.addEventListener('click', () => { panel.classList.toggle('open'); overlay.classList.toggle('show'); });
    overlay.addEventListener('click', close);
    panel.querySelector('#a11y-close').addEventListener('click', close);
    panel.querySelector('#a11y-reset').addEventListener('click', () => { st = {}; save(); applyAll(); });
    panel.querySelectorAll('.a11y-btn').forEach(btn => btn.addEventListener('click', () => {
      const k = btn.dataset.k;
      if (k === 'fontUp') st.font = Math.min(5, (st.font || 0) + 1);
      else if (k === 'fontDown') st.font = Math.max(-3, (st.font || 0) - 1);
      else st[k] = !st[k];
      save(); applyAll();
    }));
  }
  function close() { const p = document.getElementById('a11y-panel'), o = document.getElementById('a11y-overlay'); if (p) p.classList.remove('open'); if (o) o.classList.remove('show'); }

  function init() { build(); applyAll(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
