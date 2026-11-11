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

  function makeFold(label, extraClass) {
    var d = document.createElement('details');
    d.className = 'hub-fold' + (extraClass ? ' ' + extraClass : '');
    var s = document.createElement('summary');
    s.className = 'hub-fold__sum';
    var l = document.createElement('span');
    l.className = 'hub-fold__label';
    l.textContent = label;
    s.appendChild(l);
    d.appendChild(s);
    return d;
  }

  /* One line of intro under the title. The intro's first sentence stays; the
     rest of it, and the "last updated / spot an error" line, move -- the same
     nodes, text untouched -- into a closed "About this dashboard" fold. */
  var header = document.querySelector('.app > header');
  if (header && !header.querySelector('.hub-about')) {
    var moved = [];
    var thesis = header.querySelector('.thesis');
    if (thesis && thesis.firstChild && thesis.firstChild.nodeType === 3) {
      var m = thesis.firstChild.nodeValue.match(/^[\s\S]*?[.!?](\s+)(?=\S)/);
      if (m) {
        var tail = thesis.firstChild.splitText(m[0].length);
        var rest = document.createElement('p');
        rest.className = thesis.className;
        while (tail) { var next = tail.nextSibling; rest.appendChild(tail); tail = next; }
        moved.push(rest);
      }
    }
    Array.prototype.forEach.call(header.querySelectorAll('.note'), function (n) { moved.push(n); });
    if (moved.length) {
      var about = makeFold('About this dashboard', 'hub-about');
      var body = document.createElement('div');
      body.setAttribute('data-hub-folded', '');
      moved.forEach(function (n) { body.appendChild(n); });
      about.appendChild(body);
      header.appendChild(about);
    }
  }

  /* Frontier's region jumps are loose buttons in a row; group them so they can
     wear the segmented style. The buttons themselves (and their listeners) move as-is. */
  var regions = document.querySelectorAll('.controls .ctl[data-region]');
  if (regions.length && !document.querySelector('.hub-seg')) {
    var seg = document.createElement('div');
    seg.className = 'hub-seg';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Jump to a region');
    regions[0].parentNode.insertBefore(seg, regions[0]);
    Array.prototype.forEach.call(regions, function (b) { seg.appendChild(b); });
  }

  list.forEach(function (f) {
    var el = document.querySelector(f[0]);
    if (!el || el.closest('.hub-fold')) return;
    var d = makeFold(f[1]);
    el.parentNode.insertBefore(d, el);
    d.appendChild(el);
    el.setAttribute('data-hub-folded', '');
    // a section the dashboard hides (e.g. #ussys with no profile) hides its fold too
    var sync = function () { d.hidden = el.hidden; };
    sync();
    new MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ['hidden'] });
  });

  /* The theme sizes the maps to the window, and the folding above can move
     things after the dashboards have measured their canvases. US vs World and
     School Outlook re-measure only on a window resize, so when a map's box
     changes size, fire one -- their own handler does the rest. (Frontier
     watches its canvas itself.) */
  if (window.ResizeObserver) {
    var seen = new WeakMap(), timer = 0;
    var ro = new ResizeObserver(function (entries) {
      var changed = false;
      entries.forEach(function (e) {
        var r = e.contentRect, key = Math.round(r.width) + 'x' + Math.round(r.height), was = seen.get(e.target);
        seen.set(e.target, key);
        if (was !== undefined && was !== key) changed = true;
      });
      if (changed) { clearTimeout(timer); timer = setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 60); }
    });
    if (slug !== 'frontier') Array.prototype.forEach.call(document.querySelectorAll('canvas#map, canvas#kr-map'), function (c) { ro.observe(c); });
  }
  // a late web font can change a legend's height, and with it the map's: measure once more when fonts settle
  if (document.fonts && document.fonts.ready && slug !== 'frontier') document.fonts.ready.then(function () { window.dispatchEvent(new Event('resize')); });

  // a link into a folded section opens it
  function reveal() {
    var id = decodeURIComponent(location.hash.slice(1));
    var t = id && document.getElementById(id);
    for (var p = t && t.parentElement; p; p = p.parentElement) if (p.matches('details.hub-fold')) p.open = true;
  }
  reveal();
  window.addEventListener('hashchange', reveal);
})();
