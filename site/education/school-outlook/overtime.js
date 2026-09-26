/* One map, two countries: students by region, counted and then carried forward.
 *
 * The United States and South Korea are drawn by the same code on purpose. The
 * whole claim of putting them side by side is that they are measured the same
 * way, so a difference on screen is a difference in the world rather than in
 * how two pages happened to get written. Everything that differs between them
 * -- the geography, the nouns, the sources, every sentence of prose -- comes
 * out of the data file, authored beside the numbers it describes.
 *
 * Both series have two halves, kept visibly apart. Up to the last counted year
 * every number is a published count. After it the series continues only as far
 * as its method honestly reaches: for Korea, while the children are already on
 * the resident register; for the U.S., as far as this site's own county model
 * runs. Projected years get a dashed outline, a "projected" chip and a sentence
 * saying so, and the slider stops where the method does.
 *
 * Each region is coloured by how much of its own best year it still has rather
 * than by change from a fixed base, because the regions did not all begin at
 * the same time -- Gwangju 1986, Ulsan 1997, Sejong 2012 -- and a share of a
 * peak is defined for all of them, on one scale, whenever they came into being.
 *
 *   WL_OVERTIME({ data: window.WL_KOREA, geo: window.WL_KOREA_GEO,
 *                 p: 'kr', key: 'iso_3166_2' })
 */
window.WL_OVERTIME = function (cfg) {

  'use strict';
  const D = cfg.data, TOPO = cfg.geo, TXT = D.copy;
  if (!D || !TOPO) return null;

  /* Selectors are written against the Korean tab's ids and rewritten to this
     instance's prefix, so the two maps cannot drift apart by one of them
     quietly losing an element. */
  const $ = (s) => document.querySelector(s.replace(/#kr-/g, '#' + cfg.p + '-'));
  /* Fill {tokens} in a sentence from the data file. The sentence itself is
     ours and may carry markup; the values going into it are escaped. An
     unknown token is an authoring mistake, so it is left visible rather than
     silently blanked. */
  const fill = (s, v) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (k in v ? esc(v[k]) : m));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = new Intl.NumberFormat('en-US');
  const YEARS = D.years;
  /* CI is the last counted year; everything after it is carried forward. */
  const CI = YEARS.indexOf(D.counted);
  const LAST = CI;                       // "now" for anything that means today
  const NAME = {}, KO = {};
  D.provinces.forEach((p) => { NAME[p.iso] = p.en; KO[p.iso] = p.ko; });

  const S = { level: cfg.level || Object.keys(D.levels)[0], yi: LAST, sel: null };
  const hz = () => YEARS.indexOf(lvl().horizon);      // last mapped year for this level
  const isProj = (i = S.yi) => i > CI;

  /* ── the series ──────────────────────────────────────────────────────── */
  const lvl = () => D.levels[S.level];
  const series = (iso) => lvl().rows[iso] || [];
  const at = (iso, i = S.yi) => { const v = series(iso)[i]; return v == null ? null : v; };

  /* A province's peak is always a year KEDI counted -- a projected figure is
     never allowed to become the yardstick the colours are measured against. */
  function peak(iso) {
    const s = series(iso); let bi = -1;
    for (let i = 0; i <= CI; i++) if (s[i] != null && (bi < 0 || s[i] > s[bi])) bi = i;
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
  /* Share of peak -> bin; the top of the range is the green end. The breaks
     come from the data file because the two countries occupy different parts
     of the scale entirely: Korea's provinces run from 6% of peak to 90%, U.S.
     states from 75% to 100%. One shared ladder painted every U.S. state the
     same green and, at Korea's 2032, twelve of seventeen provinces the same
     brown -- a legend failing to say anything rather than a map with nothing
     to say. */
  const BINS = D.bins;
  function colorFor(iso) {
    const v = share(iso);
    if (v == null) return COL.nodata;
    let k = 0; while (k < BINS.length && v >= BINS[k]) k++;
    return COL.ramp[k];
  }

  /* ── geometry ────────────────────────────────────────────────────────── */
  const obj = TOPO.objects[Object.keys(TOPO.objects)[0]];
  const feats = topojson.feature(TOPO, obj).features.map((f) => ({
    iso: f.properties[cfg.key],
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
    const proj = isProj();
    feats.forEach((f) => {
      path(f);
      ctx.fillStyle = colorFor(f.iso); ctx.fill();
      ctx.lineWidth = f.iso === S.sel ? 2.4 : 0.7;
      ctx.strokeStyle = f.iso === S.sel ? COL.ink : COL.edge;
      /* The one visual difference between a count and a carried-forward
         figure: the border stops being solid. */
      ctx.setLineDash(proj ? [4, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);
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
    /* Generated from the breaks, so the words and the colours cannot disagree. */
    const lab = [`under ${BINS[0]}%`]
      .concat(BINS.slice(0, -1).map((v, i) => `${v}–${BINS[i + 1]}`))
      .concat([`${BINS[BINS.length - 1]}% or more`]);
    $('#kr-legend').innerHTML = `<span class="ttl">Students in ${YEARS[S.yi]}${isProj() ? ' (projected)' : ''}, as a share of ${esc(TXT.peakOf)}</span>` +
      '<span class="swatches">' + COL.ramp.map((c, i) =>
        `<span class="sw"><i style="background:${c}"></i><span>${lab[i]}</span></span>`).join('') +
      `<span class="sw"><i style="background:${COL.nodata}"></i><span>${esc(TXT.nodata)}</span></span></span>`;
  }

  function renderPanel() {
    const P = $('#kr-panel');
    const iso = S.sel;
    if (!iso) {
      const t = lvl().total, pk = t.indexOf(Math.max(...t.filter((x) => x != null)));
      P.innerHTML = `<div class="kind">${esc(TXT.whole)}</div><h2>${esc(lvl().label)}</h2>` +
        `<div class="big"><span class="n">${nf.format(t[S.yi])}</span><span class="u">students in ${YEARS[S.yi]}</span></div>` +
        `<p class="note">${esc(TXT.peakWord[0].toUpperCase() + TXT.peakWord.slice(1))} was ${nf.format(t[pk])} in ${YEARS[pk]}. ${isProj() ? 'That year would be' : 'Today is'} ${pct((t[S.yi] / t[pk] - 1) * 100)} against that.</p>` +
        (isProj() ? `<p class="note">${projLine()}</p>` : '') +
        `<p class="note">Click a ${esc(TXT.unit)}.</p>`;
      return;
    }
    const p = peak(iso), v = at(iso), sh = share(iso);
    const first = series(iso).findIndex((x) => x != null);
    P.innerHTML = `<div class="kind">${esc(KO[iso])} · ${esc(iso)}</div><h2>${esc(NAME[iso])}</h2>` +
      (v == null
        ? `<p class="note">No ${esc(lvl().label.toLowerCase())} figure for ${YEARS[S.yi]}. This ${esc(TXT.unit)}'s series starts in ${YEARS[first]}.</p>`
        : `<div class="big"><span class="n ${cls(sh - 100)}">${nf.format(v)}</span><span class="u">${esc(lvl().label.toLowerCase())} students in ${YEARS[S.yi]}</span></div>` +
          `<p class="note">That is <b>${sh.toFixed(0)}%</b> of its ${esc(TXT.peakWord)}: ${nf.format(p.n)} in ${p.year}.</p>` +
          (isProj() ? `<p class="note">${projLine()}</p>` : '') +
          (first > 0 && TXT.created ? `<p class="note">${fill(TXT.created, { first: YEARS[first] })}</p>` : ''));
  }

  /* The one sentence every projected view has to carry. Ages come from the
     data file, so it cannot drift away from what was actually computed. */
  function projLine() {
    const a = lvl().ages || [];
    return fill(TXT.projected, { a0: a[0], a1: a[1], year: YEARS[S.yi],
                                 base: D.projection.base_year, counted: D.counted });
  }

  /* ── what it did, and what it is set to do: computed, never written down ── */
  function summary() {
    const el = $('#kr-found'); if (!el) return;
    const L = lvl(), t = L.total;
    const pk = t.indexOf(Math.max(...t.filter((x) => x != null)));
    const now = t[LAST], peakN = t[pk];

    const at_ = (i) => D.provinces.map((q) => ({ en: q.en, s: share(q.iso, i) }))
      .filter((x) => x.s != null).sort((a, b) => a.s - b.s);
    const shares = at_(LAST);
    const halved = shares.filter((x) => x.s < 50).length;
    const worst = shares[0], best = shares[shares.length - 1];
    const under = shares.filter((x) => x.s < 100).length;

    // the last year the country had as few students as it has now
    let back = null;
    for (let i = 0; i < pk; i++) if (t[i] != null && t[i] >= now) { back = YEARS[i]; break; }

    const items = [
      `${esc(L.label)} enrolment peaked at <b>${nf.format(peakN)}</b> in <b>${YEARS[pk]}</b>. In ${YEARS[LAST]} it is <b>${nf.format(now)}</b> — <b>${pct((now / peakN - 1) * 100)}</b>.`,
      back && back !== YEARS[LAST] ? fill(TXT.standAt, { country: TXT.country, year: back }) : '',
      halved ? `<b>${halved}</b> of ${shares.length} ${esc(TXT.units)} are below half their ${esc(TXT.peakWord)}.` : '',
      `Furthest fallen: <b>${esc(worst.en)}</b>, at <b>${worst.s.toFixed(0)}%</b>. Least: <b>${esc(best.en)}</b>, at <b>${best.s.toFixed(0)}%</b>.`,
      `<b>${under}</b> of the ${shares.length} ${esc(TXT.units)} are below their ${esc(TXT.peakWord)}.`,
    ].filter(Boolean);

    /* Second block: what the forward half says. Shown whatever the slider is
       doing, because it is the finding rather than a view option. */
    const H = L.horizon, hi = YEARS.indexOf(H);
    let ahead = '';
    if (H > D.counted && hi >= 0 && t[hi] != null) {
      const fut = t[hi];
      const fall = D.provinces.map((q) => {
        const a = at(q.iso, LAST), b = at(q.iso, hi);
        return a && b ? { en: q.en, c: (b / a - 1) * 100 } : null;
      }).filter(Boolean).sort((a, b) => a.c - b.c);
      const down = fall.filter((x) => x.c < 0).length;
      let was = null;
      for (let i = 0; i < pk; i++) if (t[i] != null && t[i] >= fut) { was = YEARS[i]; break; }
      const bt = D.projection && D.projection.backtest;
      const more = [
        `By <b>${H}</b> it is <b>${nf.format(fut)}</b> — <b>${pct((fut / now - 1) * 100)}</b> on ${YEARS[LAST]}, and <b>${pct((fut / peakN - 1) * 100)}</b> on the ${esc(TXT.peakWord)}.`,
        was ? fill(TXT.backTo, { country: TXT.country[0].toUpperCase() + TXT.country.slice(1),
                                 level: L.label, levelLower: L.label.toLowerCase(), year: was }) : '',
        `<b>${down}</b> of ${fall.length} ${esc(TXT.units)} end lower than today; steepest is <b>${esc(fall[0].en)}</b> at <b>${pct(fall[0].c)}</b>, shallowest <b>${esc(fall[fall.length - 1].en)}</b> at <b>${pct(fall[fall.length - 1].c)}</b>.`,
        TXT.decidedLast ? fill(TXT.decidedLast, { base: D.projection.base_year, horizon: H,
                                                  // the first mapped year that contains a child
                                                  // who was not yet born at the base
                                                  first_unborn: YEARS.find((y) => y > D.counted &&
                                                    y - ((L.ages || [0])[0]) > D.projection.base_year) }) : '',
      ].filter(Boolean);
      const method = fill(TXT.methodNote, { counted: D.counted, horizon: H, next: H + 1,
                                            a0: (L.ages || [])[0], a1: (L.ages || [])[1] });
      const btLine = bt && TXT.backtestNote
        ? ' ' + fill(TXT.backtestNote, { medAPE: bt.medAPE.toFixed(1), beat0: bt.beat0.toFixed(0),
                                         nat: pct(bt.nat), n: nf.format(bt.n) })
        : '';
      ahead = `<h2>${esc(TXT.decided)}</h2><ul>${more.map((x) => `<li>${x}</li>`).join('')}</ul>` +
        `<p class="note">${method}${btLine}</p>`;
    } else if (TXT.notProjected) {
      ahead = `<p class="note">${fill(TXT.notProjected, { level: L.label })}</p>`;
    }

    el.innerHTML = `<h2>${esc(TXT.happened)}</h2><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>` +
      `<p class="note">${fill(TXT.countedNote, { counted: D.counted, first: YEARS[0] })}</p>` + ahead;
  }

  function renderTable() {
    const rows = D.provinces.map((p) => ({ ...p, v: at(p.iso), s: share(p.iso), pk: peak(p.iso) }))
      .filter((r) => r.v != null).sort((a, b) => a.s - b.s);
    $('#kr-tbl thead').innerHTML = `<tr><th style="text-align:left">${esc(TXT.Unit)}</th><th>Students ${YEARS[S.yi]}${isProj() ? ' (proj.)' : ''}</th><th>${esc(TXT.peakCol)}</th><th>${esc(TXT.shareCol)}</th></tr>`;
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
  slider.min = 0;
  function refresh() {
    /* Each level runs out at its own year, so the slider's end moves with it:
       high school is already settled to 2041, primary only to 2032. */
    const top = hz();
    slider.max = top;
    if (S.yi > top) S.yi = top;
    slider.value = S.yi;
    slider.setAttribute('aria-valuetext', YEARS[S.yi] + (isProj() ? ', projected' : ', counted'));
    $('#kr-yearlab').textContent = YEARS[S.yi];
    $('#kr-projchip').hidden = !isProj();
    legend(); summary(); renderPanel(); renderTable(); draw();
  }
  S.yi = LAST;
  slider.addEventListener('input', () => { S.yi = +slider.value; refresh(); });
  $('#kr-levels').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lvl]'); if (!b) return;
    S.level = b.dataset.lvl;
    $('#kr-levels').querySelectorAll('[data-lvl]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.lvl === S.level ? 'true' : 'false'));
    refresh();
  });
  /* One level is not a choice, so the control and its label go away rather
     than sit there as a single button that does nothing. */
  const levelKeys = Object.keys(D.levels);
  if (levelKeys.length > 1) {
    $('#kr-levels').innerHTML = levelKeys.map((k2) =>
      `<button data-lvl="${k2}" aria-pressed="${k2 === S.level}">${esc(D.levels[k2].label)}</button>`).join('');
  } else {
    const box = $('#kr-levels').closest('.ctl') || $('#kr-levels');
    box.hidden = true;
  }

  $('#kr-src').innerHTML = `Counts: <a href="${esc(D.source.url)}" target="_blank" rel="noopener">${esc(D.source.name)}</a>. ` +
    esc(D.source.note) +
    (D.source_pop ? ` Projection base: <a href="${esc(D.source_pop.url)}" target="_blank" rel="noopener">${esc(D.source_pop.name)}</a>. ` +
      esc(D.source_pop.note) : '') + ' ' + esc(D.shapes);

  const repaint = () => { readColors(); draw(); };
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', () => { clearTimeout(window.__krz); window.__krz = setTimeout(resize, 120); });

  readColors(); refresh(); resize();
  return { S, share, peak, resize, refresh, provinces: D.provinces.length,
           years: YEARS, counted: D.counted, ci: CI, hz, isProj, levels: D.levels,
           bins: BINS, colorFor };
};
