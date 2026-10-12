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
