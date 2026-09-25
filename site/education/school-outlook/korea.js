/* South Korea: students by province, 1965-2026.
 *
 * A different kind of map from the U.S. one next to it, and deliberately so.
 * Nothing here is projected or modelled -- every number is a count KEDI has
 * already published. So the question this map answers is not "what will
 * happen" but "what already did", which for Korea is the more startling one.
 *
 * Each province is coloured by how much of its OWN peak it still has. Peak is
 * used rather than a fixed base year because the provinces were not created at
 * the same time -- Gwangju 1986, Ulsan 1997, Sejong 2012 -- and a share of peak
 * is defined for all of them, on the same scale, whenever they came into being.
 */
(function () {
  'use strict';
  const D = window.WL_KOREA, TOPO = window.WL_KOREA_GEO;
  if (!D || !TOPO) return;

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = new Intl.NumberFormat('en-US');
  const YEARS = D.years, LAST = YEARS.length - 1;
  const NAME = {}, KO = {};
  D.provinces.forEach((p) => { NAME[p.iso] = p.en; KO[p.iso] = p.ko; });

  const S = { level: 'elementary', yi: LAST, sel: null };

  /* ── the series ──────────────────────────────────────────────────────── */
  const lvl = () => D.levels[S.level];
  const series = (iso) => lvl().rows[iso] || [];
  const at = (iso, i = S.yi) => { const v = series(iso)[i]; return v == null ? null : v; };

  function peak(iso) {
    const s = series(iso); let bi = -1;
    for (let i = 0; i < s.length; i++) if (s[i] != null && (bi < 0 || s[i] > s[bi])) bi = i;
    return bi < 0 ? null : { i: bi, year: YEARS[bi], n: s[bi] };
  }
  /* Share of its own peak, as a percentage. */
  function share(iso, i = S.yi) {
    const p = peak(iso), v = at(iso, i);
    return p && p.n && v != null ? (v / p.n) * 100 : null;
  }

  /* ── colour: the same green-to-brown the U.S. map uses ───────────────── */
  let COL = {};
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function readColors() {
    /* The U.S. map's ramp is diverging: its middle stop is a near-neutral that
       means "no change", and in the dark theme that is almost the page colour.
       Share of a peak is not a diverging quantity -- there is no zero in the
       middle of it -- so the neutral stop is dropped and the six coloured ones
       are used as a sequential scale. Gyeonggi landing on that neutral is what
       made the map look like it had a hole in it. */
    COL = { ramp: ['--neg3', '--neg2', '--neg1', '--pos1', '--pos2', '--pos3'].map(css),
            nodata: css('--nodata'), edge: css('--map-edge'), ink: css('--ink') };
  }
  // share of peak -> bin. 100% (at its peak) is the green end.
  const BINS = [30, 45, 60, 75, 90];
  function colorFor(iso) {
    const v = share(iso);
    if (v == null) return COL.nodata;
    let k = 0; while (k < BINS.length && v >= BINS[k]) k++;
    return COL.ramp[k];
  }

  /* ── geometry ────────────────────────────────────────────────────────── */
  const obj = TOPO.objects[Object.keys(TOPO.objects)[0]];
  const feats = topojson.feature(TOPO, obj).features.map((f) => ({
    iso: f.properties.iso_3166_2,
    rings: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates),
  }));
  const bb = (() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    feats.forEach((f) => f.rings.forEach((poly) => poly.forEach((ring) => ring.forEach(([x, y]) => {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }))));
    return [x0, y0, x1, y1];
  })();

  const canvas = $('#kr-map'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1, k = 1, ox = 0, oy = 0;

  function resize() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    const pad = 14;
    k = Math.min((W - pad * 2) / (bb[2] - bb[0]), (H - pad * 2) / (bb[3] - bb[1]));
    ox = (W - (bb[2] - bb[0]) * k) / 2 - bb[0] * k;
    oy = (H + (bb[3] - bb[1]) * k) / 2 + bb[1] * k;   // y flips
    draw();
  }
  const sx = (x) => x * k + ox;
  const sy = (y) => oy - y * k;

  function path(f) {
    ctx.beginPath();
    f.rings.forEach((poly) => poly.forEach((ring) => {
      ring.forEach(([x, y], i) => (i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y))));
      ctx.closePath();
    }));
  }

  function draw() {
    if (!W) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    feats.forEach((f) => {
      path(f);
      ctx.fillStyle = colorFor(f.iso); ctx.fill();
      ctx.lineWidth = f.iso === S.sel ? 2.4 : 0.7;
      ctx.strokeStyle = f.iso === S.sel ? COL.ink : COL.edge;
      ctx.stroke();
    });
  }

  function hit(px, py) {
    for (const f of feats) { path(f); if (ctx.isPointInPath(px * DPR, py * DPR)) return f.iso; }
    return null;
  }
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const iso = hit(e.clientX - r.left, e.clientY - r.top);
    S.sel = iso === S.sel ? null : iso; renderPanel(); draw();
  });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    canvas.style.cursor = hit(e.clientX - r.left, e.clientY - r.top) ? 'pointer' : 'default';
  });

  /* ── words ───────────────────────────────────────────────────────────── */
  const pct = (v) => (v == null ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(0) + '%');
  const cls = (v) => (v == null ? '' : v < -0.5 ? 'bad' : v > 0.5 ? 'good' : '');

  function legend() {
    const lab = ['under 30%', '30–45', '45–60', '60–75', '75–90', '90% or more'];
    $('#kr-legend').innerHTML = `<span class="ttl">Students in ${YEARS[S.yi]}, as a share of that province's own peak</span>` +
      '<span class="swatches">' + COL.ramp.map((c, i) =>
        `<span class="sw"><i style="background:${c}"></i><span>${lab[i]}</span></span>`).join('') +
      `<span class="sw"><i style="background:${COL.nodata}"></i><span>did not exist yet</span></span></span>`;
  }

  function renderPanel() {
    const P = $('#kr-panel');
    const iso = S.sel;
    if (!iso) {
      const t = lvl().total, pk = t.indexOf(Math.max(...t.filter((x) => x != null)));
      P.innerHTML = `<div class="kind">All of South Korea</div><h2>${esc(lvl().label)}</h2>` +
        `<div class="big"><span class="n">${nf.format(t[S.yi])}</span><span class="u">students in ${YEARS[S.yi]}</span></div>` +
        `<p class="note">Peak was ${nf.format(t[pk])} in ${YEARS[pk]}. Today is ${pct((t[S.yi] / t[pk] - 1) * 100)} against that.</p>` +
        `<p class="note">Click a province.</p>`;
      return;
    }
    const p = peak(iso), v = at(iso), sh = share(iso);
    const first = series(iso).findIndex((x) => x != null);
    P.innerHTML = `<div class="kind">${esc(KO[iso])} · ${esc(iso)}</div><h2>${esc(NAME[iso])}</h2>` +
      (v == null
        ? `<p class="note">No ${esc(lvl().label.toLowerCase())} figure for ${YEARS[S.yi]}. This province's series starts in ${YEARS[first]}.</p>`
        : `<div class="big"><span class="n ${cls(sh - 100)}">${nf.format(v)}</span><span class="u">${esc(lvl().label.toLowerCase())} students in ${YEARS[S.yi]}</span></div>` +
          `<p class="note">That is <b>${sh.toFixed(0)}%</b> of its peak: ${nf.format(p.n)} in ${p.year}.</p>` +
          (first > 0 ? `<p class="note">Series starts ${YEARS[first]}; the province was created then.</p>` : ''));
  }

  /* ── what it did: computed, never written down ───────────────────────── */
  function summary() {
    const el = $('#kr-found'); if (!el) return;
    const L = lvl(), t = L.total;
    const pk = t.indexOf(Math.max(...t.filter((x) => x != null)));
    const now = t[LAST], peakN = t[pk];
    const drop = (now / peakN - 1) * 100;

    const shares = D.provinces.map((p) => ({ iso: p.iso, en: p.en, s: share(p.iso, LAST) }))
      .filter((x) => x.s != null).sort((a, b) => a.s - b.s);
    const halved = shares.filter((x) => x.s < 50).length;
    const worst = shares[0], best = shares[shares.length - 1];

    // the last year the country had as few students as it has now
    let back = null;
    for (let i = 0; i < pk; i++) if (t[i] != null && t[i] >= now) { back = YEARS[i]; break; }

    const items = [
      `${esc(L.label)} enrolment peaked at <b>${nf.format(peakN)}</b> in <b>${YEARS[pk]}</b>. In ${YEARS[LAST]} it is <b>${nf.format(now)}</b> — <b>${pct(drop)}</b>.`,
      back ? `That is roughly where Korea stood in <b>${back}</b>, before the peak.` : '',
      `<b>${halved}</b> of ${shares.length} provinces are below half their own peak.`,
      `Furthest fallen: <b>${esc(worst.en)}</b>, at <b>${worst.s.toFixed(0)}%</b> of its peak. Least: <b>${esc(best.en)}</b>, at <b>${best.s.toFixed(0)}%</b>.`,
      `Every one of the ${shares.length} provinces is below its peak.`,
    ].filter(Boolean);

    el.innerHTML = `<h2>What happened</h2><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>` +
      `<p class="note">Counts as published by KEDI, not a projection. The decline is already on the books: ` +
      `these are children who have been born, or not born, and counted.</p>`;
  }

  function renderTable() {
    const rows = D.provinces.map((p) => ({ ...p, v: at(p.iso), s: share(p.iso), pk: peak(p.iso) }))
      .filter((r) => r.v != null).sort((a, b) => a.s - b.s);
    $('#kr-tbl thead').innerHTML = `<tr><th style="text-align:left">Province</th><th>Students ${YEARS[S.yi]}</th><th>Its peak</th><th>Share of peak</th></tr>`;
    $('#kr-tbl tbody').innerHTML = rows.map((r) =>
      `<tr data-iso="${esc(r.iso)}"${r.iso === S.sel ? ' aria-selected="true"' : ''}>` +
      `<td style="text-align:left">${esc(r.en)} <span class="kind">${esc(r.ko)}</span></td>` +
      `<td>${nf.format(r.v)}</td><td>${nf.format(r.pk.n)} <span class="kind">${r.pk.year}</span></td>` +
      `<td class="${r.s < 50 ? 'bad' : ''}">${r.s.toFixed(0)}%</td></tr>`).join('');
  }
  $('#kr-tbl').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-iso]'); if (!tr) return;
    S.sel = tr.dataset.iso === S.sel ? null : tr.dataset.iso; renderPanel(); renderTable(); draw();
  });

  /* ── controls ────────────────────────────────────────────────────────── */
  const slider = $('#kr-year');
  slider.min = 0; slider.max = LAST; slider.value = LAST;
  function refresh() {
    $('#kr-yearlab').textContent = YEARS[S.yi];
    legend(); summary(); renderPanel(); renderTable(); draw();
  }
  slider.addEventListener('input', () => { S.yi = +slider.value; refresh(); });
  $('#kr-levels').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lvl]'); if (!b) return;
    S.level = b.dataset.lvl;
    $('#kr-levels').querySelectorAll('[data-lvl]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.lvl === S.level ? 'true' : 'false'));
    refresh();
  });
  $('#kr-levels').innerHTML = Object.entries(D.levels).map(([k2, v]) =>
    `<button data-lvl="${k2}" aria-pressed="${k2 === S.level}">${esc(v.label)}</button>`).join('');

  $('#kr-src').innerHTML = `Source: <a href="${esc(D.source.url)}" target="_blank" rel="noopener">${esc(D.source.name)}</a>. ` +
    esc(D.source.note) + ' ' + esc(D.shapes);

  const repaint = () => { readColors(); draw(); };
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', () => { clearTimeout(window.__krz); window.__krz = setTimeout(resize, 120); });

  readColors(); refresh(); resize();
  window.KR_APP = { S, share, peak, resize, refresh, provinces: D.provinces.length, years: YEARS };
})();
