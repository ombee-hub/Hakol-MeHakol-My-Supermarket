/* הכל מהכל – מנוע עגלת קניות (צד לקוח, localStorage) */
(function () {
  const ROOT = window.SITE_ROOT || '';
  const KEY = 'hmh_cart_v1';
  const FREE_OVER = 300, FEE = 25;
  const PHONE_INTL = '97286503535'; // 08-6503535

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(cart)) cart = []; } catch (e) { cart = []; }

  const save = () => { localStorage.setItem(KEY, JSON.stringify(cart)); renderAll(); };
  const find = id => cart.find(x => x.id === id);
  const count = () => cart.reduce((s, x) => s + x.qty, 0);
  const subtotal = () => cart.reduce((s, x) => s + x.qty * parseFloat(x.price || 0), 0);
  const fee = () => (cart.length === 0 ? 0 : (subtotal() >= FREE_OVER ? 0 : FEE));
  const total = () => subtotal() + fee();
  const money = n => (Math.round(n * 100) / 100).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₪';
  const imgPath = f => ROOT + 'images/' + encodeURIComponent(f);

  function add(it) { const e = find(it.id); if (e) e.qty++; else cart.push({ id: it.id, name: it.name, price: it.price, img: it.img, unit: it.unit || '', qty: 1 }); save(); toast(it.name + ' נוסף לעגלה'); }
  function setQty(id, q) { const e = find(id); if (!e) return; e.qty = q; if (e.qty <= 0) cart = cart.filter(x => x.id !== id); save(); }
  function remove(id) { cart = cart.filter(x => x.id !== id); save(); }
  function clear() { cart = []; save(); }

  // expose for other pages (checkout/search)
  window.HMHCart = { add, setQty, remove, clear, get: () => cart, count, subtotal, fee, total, money, open: openDrawer, refresh: () => renderAll() };

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    let t = document.getElementById('hmh-toast');
    if (!t) { t = document.createElement('div'); t.id = 'hmh-toast'; document.body.appendChild(t); }
    t.textContent = '✓ ' + msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ---------- drawer ---------- */
  function injectDrawer() {
    if (document.getElementById('hmh-drawer')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<div id="hmh-overlay"></div>' +
      '<aside id="hmh-drawer" aria-label="עגלת קניות">' +
        '<div class="cart-head"><h3>🛒 עגלת הקניות</h3><button id="hmh-close" aria-label="סגירה">✕</button></div>' +
        '<div id="hmh-items" class="cart-items"></div>' +
        '<div id="hmh-empty" class="cart-empty">העגלה ריקה.<br><small>הוסיפו מוצרים כדי להתחיל</small></div>' +
        '<div class="cart-foot">' +
          '<div class="cart-row"><span>סכום ביניים</span><b id="hmh-sub">0 ₪</b></div>' +
          '<div class="cart-row"><span>דמי משלוח</span><b id="hmh-fee">0 ₪</b></div>' +
          '<div id="hmh-freebar" class="freebar"></div>' +
          '<div class="cart-row cart-total"><span>סה"כ</span><b id="hmh-total">0 ₪</b></div>' +
          '<a id="hmh-checkout" class="btn btn-gold cart-cta" href="' + ROOT + 'checkout.html">למעבר לתשלום</a>' +
        '</div>' +
      '</aside>';
    document.body.appendChild(wrap);
    document.getElementById('hmh-close').addEventListener('click', closeDrawer);
    document.getElementById('hmh-overlay').addEventListener('click', closeDrawer);
  }
  function openDrawer() { injectDrawer(); document.getElementById('hmh-drawer').classList.add('open'); document.getElementById('hmh-overlay').classList.add('show'); renderDrawer(); }
  function closeDrawer() { const d = document.getElementById('hmh-drawer'), o = document.getElementById('hmh-overlay'); if (d) d.classList.remove('open'); if (o) o.classList.remove('show'); }

  function itemRow(x) {
    return '<div class="ci" data-id="' + x.id + '">' +
      '<img src="' + imgPath(x.img) + '" alt="">' +
      '<div class="ci-mid"><div class="ci-name">' + x.name + '</div>' +
      '<div class="ci-price">' + money(parseFloat(x.price)) + (x.unit === 'k' ? ' /ק"ג' : '') + '</div></div>' +
      '<div class="ci-qty"><button class="q-minus" data-id="' + x.id + '">−</button>' +
      '<span>' + x.qty + '</span>' +
      '<button class="q-plus" data-id="' + x.id + '">+</button></div>' +
      '<div class="ci-sum">' + money(x.qty * parseFloat(x.price)) + '</div>' +
      '<button class="ci-del" data-id="' + x.id + '" title="הסרה">🗑</button>' +
      '</div>';
  }
  function renderDrawer() {
    const box = document.getElementById('hmh-items'); if (!box) return;
    box.innerHTML = cart.map(itemRow).join('');
    document.getElementById('hmh-empty').style.display = cart.length ? 'none' : 'block';
    document.getElementById('hmh-checkout').style.display = cart.length ? 'block' : 'none';
    document.getElementById('hmh-sub').textContent = money(subtotal());
    document.getElementById('hmh-fee').textContent = fee() === 0 && cart.length ? 'חינם' : money(fee());
    document.getElementById('hmh-total').textContent = money(total());
    const fb = document.getElementById('hmh-freebar');
    if (cart.length && subtotal() < FREE_OVER) fb.innerHTML = 'עוד <b>' + money(FREE_OVER - subtotal()) + '</b> למשלוח חינם!';
    else if (cart.length) fb.innerHTML = '🎉 יש לכם משלוח חינם!';
    else fb.innerHTML = '';
  }

  /* ---------- badge + add buttons ---------- */
  function renderBadge() {
    document.querySelectorAll('.cart-btn .cart-count').forEach(b => { const c = count(); b.textContent = c; b.style.display = c ? 'flex' : 'none'; });
  }
  function renderCardControls() {
    document.querySelectorAll('.add-ctl').forEach(w => {
      const id = w.dataset.id, e = find(id);
      if (e) {
        w.innerHTML = '<div class="card-stepper"><button class="q-plus" data-id="' + id + '" aria-label="הוספת יחידה">+</button><span class="cs-q">' + e.qty + '</span><button class="q-minus" data-id="' + id + '" aria-label="הפחתת יחידה">−</button></div>';
      } else {
        w.innerHTML = '<button class="add-btn">+ הוספה לעגלה</button>';
      }
    });
  }
  function renderCheckout() {
    const root = document.getElementById('checkout-root'); if (!root) return;
    if (root.dataset.done === '1') return;
    if (!cart.length) {
      root.querySelector('#co-summary').innerHTML = '<p class="cart-empty">העגלה ריקה. <a href="' + ROOT + 'index.html">למעבר לקטלוג</a></p>';
      const f = root.querySelector('#co-form'); if (f) f.style.display = 'none';
      return;
    }
    root.querySelector('#co-summary').innerHTML =
      '<table class="co-table"><thead><tr><th>מוצר</th><th>כמות</th><th>מחיר</th><th>סה"כ</th></tr></thead><tbody>' +
      cart.map(x => '<tr><td>' + x.name + '</td><td>' + x.qty + '</td><td>' + money(parseFloat(x.price)) + '</td><td>' + money(x.qty * parseFloat(x.price)) + '</td></tr>').join('') +
      '</tbody><tfoot>' +
      '<tr><td colspan="3">סכום ביניים</td><td>' + money(subtotal()) + '</td></tr>' +
      '<tr><td colspan="3">דמי משלוח</td><td>' + (fee() === 0 ? 'חינם' : money(fee())) + '</td></tr>' +
      '<tr class="co-total"><td colspan="3">סה"כ לתשלום</td><td>' + money(total()) + '</td></tr>' +
      '</tfoot></table>';
  }

  function renderAll() { renderBadge(); renderCardControls(); renderDrawer(); renderCheckout(); }

  /* ---------- global click delegation ---------- */
  document.addEventListener('click', function (ev) {
    const add$ = ev.target.closest('.add-btn');
    if (add$) { const w = add$.closest('.add-ctl'); if (w) { ev.preventDefault(); add({ id: w.dataset.id, name: w.dataset.name, price: w.dataset.price, img: w.dataset.img, unit: w.dataset.unit }); } return; }
    const open$ = ev.target.closest('.cart-btn');
    if (open$) { ev.preventDefault(); openDrawer(); return; }
    const plus = ev.target.closest('.q-plus'); if (plus) { const e = find(plus.dataset.id); if (e) setQty(e.id, e.qty + 1); return; }
    const minus = ev.target.closest('.q-minus'); if (minus) { const e = find(minus.dataset.id); if (e) setQty(e.id, e.qty - 1); return; }
    const del = ev.target.closest('.ci-del'); if (del) { remove(del.dataset.id); return; }
  });

  /* ---------- checkout form submit ---------- */
  document.addEventListener('submit', function (ev) {
    const form = ev.target.closest('#co-form'); if (!form) return;
    ev.preventDefault();
    if (!cart.length) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const orderNo = 'HMH-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    const lines = cart.map(x => '• ' + x.name + ' × ' + x.qty + ' = ' + money(x.qty * parseFloat(x.price)));
    const text =
      'הזמנה חדשה מהאתר — הכל מהכל הסופר שלי%0A' +
      'מס׳ הזמנה: ' + orderNo + '%0A%0A' +
      lines.join('%0A') + '%0A%0A' +
      'סכום ביניים: ' + money(subtotal()) + '%0A' +
      'דמי משלוח: ' + (fee() === 0 ? 'חינם' : money(fee())) + '%0A' +
      'סה"כ: ' + money(total()) + '%0A%0A' +
      'שם: ' + (data.name || '') + '%0A' +
      'טלפון: ' + (data.phone || '') + '%0A' +
      'כתובת: ' + (data.address || '') + ', ' + (data.city || '') + '%0A' +
      'הערות: ' + (data.notes || '-');
    const wa = 'https://wa.me/' + PHONE_INTL + '?text=' + text;
    const root = document.getElementById('checkout-root');
    root.dataset.done = '1';
    root.innerHTML =
      '<div class="co-done">' +
      '<div class="co-check">✓</div>' +
      '<h1>ההזמנה התקבלה!</h1>' +
      '<p>תודה ' + (data.name || '') + '! מספר ההזמנה שלך: <b>' + orderNo + '</b></p>' +
      '<p class="co-sum-amt">סה"כ לתשלום: <b>' + money(total()) + '</b> · משלוח ל' + (data.city || '') + '</p>' +
      '<p>לשליחת ההזמנה לסופר ולתיאום המשלוח:</p>' +
      '<a class="btn btn-gold" target="_blank" href="' + wa + '">📲 שליחת ההזמנה בוואטסאפ</a> ' +
      '<a class="btn" href="' + ROOT + 'index.html">להמשך קנייה</a>' +
      '<p class="co-note">ניתן גם להתקשר ישירות: <a href="tel:086503535">08-6503535</a></p>' +
      '</div>';
    clear();
  });

  /* ---------- init ---------- */
  function init() { injectDrawer(); renderAll(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
