/* הכל מהכל – תפריט צד (המבורגר) */
(function () {
  function open() { document.getElementById('side-menu').classList.add('open'); document.getElementById('side-overlay').classList.add('show'); document.body.classList.add('side-open'); }
  function close() { const m = document.getElementById('side-menu'), o = document.getElementById('side-overlay'); if (m) m.classList.remove('open'); if (o) o.classList.remove('show'); document.body.classList.remove('side-open'); }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.hamburger')) { e.preventDefault(); open(); return; }
    if (e.target.closest('#side-close') || e.target.id === 'side-overlay') { close(); return; }
    const inMenu = e.target.closest('#side-menu');
    if (inMenu && !e.target.closest('summary') && e.target.closest('a, .cart-btn, .club-btn')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  // close the side menu automatically when switching to desktop view
  var mq = window.matchMedia('(min-width:1025px)');
  var onMQ = function (e) { if (e.matches) close(); };
  if (mq.addEventListener) mq.addEventListener('change', onMQ); else if (mq.addListener) mq.addListener(onMQ);
})();
