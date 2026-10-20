/* Plateforme LAOVA — comportements légers (menu, apparitions, formulaires) */
document.documentElement.classList.add('js');
var EN = document.documentElement.lang === 'en';
var T = EN
  ? { menu: 'Menu', close: 'Close', sending: 'Sending…', ok: 'Thank you. Your message has been sent to the LAOVA team.', err: 'Your message could not be sent. Please try again in a moment.' }
  : { menu: 'Menu', close: 'Fermer', sending: 'Envoi en cours…', ok: 'Merci. Votre message a bien été transmis à l’équipe LAOVA.', err: 'L’envoi n’a pas abouti. Merci de réessayer dans quelques instants.' };

(function menu() {
  var btn = document.querySelector('.nav-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.querySelector('span').textContent = open ? T.close : T.menu;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) btn.click();
  });
})();

/* Sous-menus : ouverture au clic et au clavier, fermeture par Échap ou clic extérieur */
(function submenus() {
  var parents = document.querySelectorAll('.nav-parent');
  function closeAll(except) {
    parents.forEach(function (b) { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  }
  parents.forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav-group')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
})();

(function reveal() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

/* Formulaires : envoi via Web3Forms (JSON). Les cases multiples sont regroupées. */
(function forms() {
  document.querySelectorAll('form[data-web3]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.botcheck && form.elements.botcheck.checked) return;
      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (k === 'botcheck') return;
        data[k] = data[k] ? data[k] + ', ' + v : v;
      });
      if (data.email) data.replyto = data.email;
      btn.disabled = true;
      status.textContent = T.sending;
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.success) throw new Error(res.message);
          form.reset();
          status.textContent = form.dataset.ok || T.ok;
        })
        .catch(function () {
          status.textContent = T.err;
        })
        .then(function () { btn.disabled = false; });
    });
  });
})();

/* Carte Google Maps : chargée seulement au clic */
(function maps() {
  document.querySelectorAll('.map-embed').forEach(function (box) {
    var btn = box.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.dataset.src;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.title = 'Google Maps — Maroantsetra';
      box.innerHTML = '';
      box.appendChild(f);
      box.classList.add('is-loaded');
    });
  });
})();

/* Page Projets : filtre par statut */
(function filters() {
  var chips = document.querySelectorAll('.filters .chip');
  if (!chips.length) return;
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter;
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      document.querySelectorAll('.project[data-status]').forEach(function (p) { p.hidden = !(f === 'all' || p.dataset.status === f); });
      var label = document.querySelector('.past-label');
      if (label) label.hidden = !(f === 'all' || f === 'acheve');
    });
  });
})();
