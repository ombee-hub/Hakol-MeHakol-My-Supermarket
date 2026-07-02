/* הכל מהכל – חיפוש חכם (autocomplete) — פועל בכל תיבות החיפוש (header + תפריט צד) */
(function () {
  const ROOT = window.SITE_ROOT || '';
  const data = window.HMH_PRODUCTS || [];
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const imgp = f => ROOT + 'images/' + encodeURIComponent(f);

  function row(p) {
    const eff = (p.s && parseFloat(p.sp) > 0) ? p.sp : p.p;
    const link = ROOT + 'search.html?q=' + encodeURIComponent(p.n);
    return '<div class="hs-row">' +
      '<a class="hs-link" href="' + link + '">' +
        '<img loading="lazy" src="' + imgp(p.img) + '" alt="">' +
        '<span class="hs-name">' + esc(p.n) + '</span>' +
        '<span class="hs-price">' + esc(eff) + ' ₪</span>' +
      '</a>' +
      '<div class="add-ctl hs-add" data-id="' + esc(p.i) + '" data-name="' + esc(p.n) + '" data-price="' + esc(eff) + '" data-img="' + esc(p.img) + '" data-unit="' + esc(p.u) + '"><button class="add-btn" title="הוספה לעגלה">+</button></div>' +
    '</div>';
  }

  function initBox(box) {
    const input = box.querySelector('input[name="q"]');
    if (!input) return;
    box.style.position = 'relative';
    let dd = null;
    const ensure = () => { if (!dd) { dd = document.createElement('div'); dd.className = 'hs-dd'; box.appendChild(dd); } return dd; };
    const hide = () => { if (dd) dd.classList.remove('open'); };
    function run() {
      const t = input.value.trim();
      if (!t) { hide(); return; }
      const terms = t.toLowerCase().split(/\s+/);
      const list = data.filter(p => { const hay = (p.n + ' ' + p.d + ' ' + p.c + ' ' + p.b).toLowerCase(); return terms.every(w => hay.includes(w)); });
      const d = ensure();
      if (!list.length) d.innerHTML = '<div class="hs-empty">לא נמצאו מוצרים תואמים</div>';
      else d.innerHTML = list.slice(0, 8).map(row).join('') +
        '<a class="hs-all" href="' + ROOT + 'search.html?q=' + encodeURIComponent(t) + '">צפייה בכל ' + list.length + ' התוצאות</a>';
      d.classList.add('open');
      if (window.HMHCart && window.HMHCart.refresh) window.HMHCart.refresh();
    }
    input.addEventListener('input', run);
    input.addEventListener('focus', () => { if (input.value.trim()) run(); });
    input.addEventListener('keydown', e => { if (e.key === 'Escape') { hide(); input.blur(); } });
    document.addEventListener('click', e => { if (!box.contains(e.target)) hide(); });
  }

  document.querySelectorAll('.head-search').forEach(initBox);
})();
