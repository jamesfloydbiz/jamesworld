/* /education hub theme: fold the secondary sections of the dashboards.
 *
 * Loaded (deferred) by the pages scripts/sync-education-map.mjs themes -- see
 * scripts/education-hub-theme.mjs. It runs after each dashboard's own scripts
 * have rendered, and only MOVES existing elements into <details>: nothing is
 * removed, rewritten or fetched, so every word stays in the HTML (the #summary
 * findings are there for crawlers) and with JavaScript off the page reads as
 * before, fully open. The dashboards' scripts keep writing into the same
 * elements by id; only containers are wrapped, never anything they re-render.
 * Folds start closed on every visit -- nothing is remembered. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('hub-theme')) return;

  // [selector, one-line label]. A selector that matches nothing is skipped.
  var FOLDS = {
    'us-vs-world': [
      ['#mapnote', 'About this map'],
      ['#ussys', 'US education system'],
      ['section[aria-labelledby="common-title"]', 'What the leaders have in common'],
      ['#summary', 'What this map shows'],
    ],
    'school-outlook': [
      ['#found', 'What the data shows'],
      ['#method', 'How this works · accuracy · sources'],
      ['#kr-found', 'What happened'],
      ['#summary', 'What these maps show'],
    ],
    'frontier': [
      ['#mapblock > p.mapnote', 'How to read the map'],
    ],
  };
  var slug = (root.className.match(/\bhub-(us-vs-world|school-outlook|frontier)\b/) || [])[1];
  var list = FOLDS[slug] || [];

  list.forEach(function (f) {
    var el = document.querySelector(f[0]);
    if (!el || el.closest('.hub-fold')) return;
    var d = document.createElement('details');
    d.className = 'hub-fold';
    var s = document.createElement('summary');
    s.className = 'hub-fold__sum';
    var label = document.createElement('span');
    label.className = 'hub-fold__label';
    label.textContent = f[1];
    s.appendChild(label);
    d.appendChild(s);
    el.parentNode.insertBefore(d, el);
    d.appendChild(el);
    el.setAttribute('data-hub-folded', '');
    // a section the dashboard hides (e.g. #ussys with no profile) hides its fold too
    var sync = function () { d.hidden = el.hidden; };
    sync();
    new MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ['hidden'] });
  });

  // a link into a folded section opens it
  function reveal() {
    var id = decodeURIComponent(location.hash.slice(1));
    var t = id && document.getElementById(id);
    for (var p = t && t.parentElement; p; p = p.parentElement) if (p.matches('details.hub-fold')) p.open = true;
  }
  reveal();
  window.addEventListener('hashchange', reveal);
})();
