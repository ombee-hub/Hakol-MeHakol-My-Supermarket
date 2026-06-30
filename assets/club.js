/* הכל מהכל – מועדון חברים (צד לקוח, localStorage) */
(function () {
  const ROOT = window.SITE_ROOT || '';
  const K_MEMBERS = 'hmh_members_v1';   // registry of all members on this device
  const K_CURRENT = 'hmh_member_phone'; // phone of the logged-in member

  const BENEFITS = [
    '🎁 5% הנחה קבועה על כל הקנייה',
    '🔔 מבצעים והטבות בלעדיים לחברי מועדון',
    '⭐ צבירת נקודות על כל הזמנה',
    '🚚 משלוח חינם בהזמנה הראשונה',
  ];

  const norm = p => (p || '').replace(/[^0-9]/g, '');
  function members() { try { return JSON.parse(localStorage.getItem(K_MEMBERS) || '[]'); } catch (e) { return []; } }
  function saveMembers(list) { localStorage.setItem(K_MEMBERS, JSON.stringify(list)); }
  function current() { const ph = localStorage.getItem(K_CURRENT); if (!ph) return null; return members().find(m => m.phone === ph) || null; }
  function login(phone) { localStorage.setItem(K_CURRENT, norm(phone)); render(); }
  function logout() { localStorage.removeItem(K_CURRENT); render(); renderBody(); }

  /* ---------- header button ---------- */
  function render() {
    const m = current();
    document.querySelectorAll('.club-btn').forEach(b => {
      if (m) { b.classList.add('logged'); b.innerHTML = '<span class="club-ic">👋</span><span class="club-lbl">' + esc(m.name.split(' ')[0]) + '</span>'; }
      else { b.classList.remove('logged'); b.innerHTML = '<span class="club-ic">👤</span><span class="club-lbl">מועדון חברים</span>'; }
    });
  }
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ---------- modal ---------- */
  function injectModal() {
    if (document.getElementById('club-modal')) return;
    const w = document.createElement('div');
    w.innerHTML =
      '<div id="club-overlay"></div>' +
      '<div id="club-modal" role="dialog" aria-label="מועדון חברים">' +
        '<button id="club-close" aria-label="סגירה">✕</button>' +
        '<div class="club-head"><img src="' + ROOT + 'assets/logo.svg" alt=""><h3>מועדון החברים של הכל מהכל</h3></div>' +
        '<div id="club-body"></div>' +
      '</div>';
    document.body.appendChild(w);
    document.getElementById('club-close').addEventListener('click', closeModal);
    document.getElementById('club-overlay').addEventListener('click', closeModal);
  }
  function openModal() { injectModal(); renderBody(); document.getElementById('club-modal').classList.add('open'); document.getElementById('club-overlay').classList.add('show'); }
  function closeModal() { const m = document.getElementById('club-modal'), o = document.getElementById('club-overlay'); if (m) m.classList.remove('open'); if (o) o.classList.remove('show'); }

  const benefitsHtml = '<ul class="club-benefits">' + BENEFITS.map(b => '<li>' + b + '</li>').join('') + '</ul>';

  function renderBody() {
    const body = document.getElementById('club-body'); if (!body) return;
    const m = current();
    if (m) {
      body.innerHTML =
        '<div class="club-card">' +
        '<div class="club-avatar">👋</div>' +
        '<h4>שלום, ' + esc(m.name) + '!</h4>' +
        '<p class="club-since">חבר/ת מועדון מאז ' + esc(m.joined) + '</p>' +
        '<div class="club-meta">📞 ' + esc(m.phone) + (m.email ? ' · ✉ ' + esc(m.email) : '') + '</div>' +
        '<h5>ההטבות שלך</h5>' + benefitsHtml +
        '<button class="btn" id="club-logout">התנתקות</button>' +
        '</div>';
      body.querySelector('#club-logout').addEventListener('click', logout);
      return;
    }
    body.innerHTML =
      '<div class="club-tabs"><button class="active" data-tab="login">התחברות</button><button data-tab="join">הצטרפות</button></div>' +
      '<form id="club-login" class="club-form">' +
        '<p class="club-lead">חברי מועדון מתחברים עם מספר הטלפון</p>' +
        '<input name="phone" type="tel" placeholder="מספר טלפון" required>' +
        '<button class="btn btn-gold" type="submit">התחברות</button>' +
        '<p class="club-msg"></p>' +
      '</form>' +
      '<form id="club-join" class="club-form" hidden>' +
        '<p class="club-lead">הצטרפו חינם ותיהנו מההטבות:</p>' + benefitsHtml +
        '<input name="name" placeholder="שם מלא" required>' +
        '<input name="phone" type="tel" placeholder="מספר טלפון" required>' +
        '<input name="email" type="email" placeholder="אימייל (אופציונלי)">' +
        '<button class="btn btn-gold" type="submit">הצטרפות למועדון</button>' +
        '<p class="club-msg"></p>' +
      '</form>';
    // tab switching
    body.querySelectorAll('.club-tabs button').forEach(t => t.addEventListener('click', () => {
      body.querySelectorAll('.club-tabs button').forEach(x => x.classList.toggle('active', x === t));
      const tab = t.dataset.tab;
      body.querySelector('#club-login').hidden = tab !== 'login';
      body.querySelector('#club-join').hidden = tab !== 'join';
    }));
    // login
    body.querySelector('#club-login').addEventListener('submit', e => {
      e.preventDefault();
      const phone = norm(new FormData(e.target).get('phone'));
      const msg = e.target.querySelector('.club-msg');
      if (phone.length < 9) { msg.textContent = 'נא להזין מספר טלפון תקין.'; msg.className = 'club-msg err'; return; }
      const m = members().find(x => x.phone === phone);
      if (m) { login(phone); renderBody(); }
      else { msg.innerHTML = 'המספר לא נמצא במועדון. עברו ל<b>הצטרפות</b> כדי להירשם.'; msg.className = 'club-msg err'; }
    });
    // join
    body.querySelector('#club-join').addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      const phone = norm(d.phone);
      const msg = e.target.querySelector('.club-msg');
      if (!d.name || !d.name.trim()) { msg.textContent = 'נא להזין שם מלא.'; msg.className = 'club-msg err'; return; }
      if (phone.length < 9) { msg.textContent = 'נא להזין מספר טלפון תקין.'; msg.className = 'club-msg err'; return; }
      const list = members();
      let m = list.find(x => x.phone === phone);
      if (m) { msg.innerHTML = 'מספר זה כבר רשום — מחברים אתכם…'; msg.className = 'club-msg ok'; }
      else {
        m = { name: d.name.trim(), phone: phone, email: (d.email || '').trim(), joined: new Date().toLocaleDateString('he-IL') };
        list.push(m); saveMembers(list);
      }
      login(phone); renderBody();
    });
  }

  /* ---------- open trigger ---------- */
  document.addEventListener('click', function (ev) {
    const b = ev.target.closest('.club-btn');
    if (b) { ev.preventDefault(); openModal(); }
  });

  function init() { render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
