/* How U.S. Learners Compare - world canvas map, U.S.-at-every-age overview, country panel, rankings. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const D = window.WL_DATA, TXT = window.WL_TEXT || {}, TOPO = window.WL_GEO;
  // Rank = 1 + number of systems with a higher published average, so equal averages share a rank.
  const T = {}; D.tests.forEach((t) => { T[t.key] = t; t.byIso = {}; t.n = t.rows.length; t.rows.forEach((r) => {
    r.rank = 1 + t.rows.filter((x) => x.mean > r.mean).length; r.tied = t.rows.some((x) => x !== r && x.mean === r.mean);
    if (r.iso && !t.byIso[r.iso]) t.byIso[r.iso] = r; }); });
  const SHORT = { Mathematics: 'Math', Reading: 'Reading', Science: 'Science', 'Computational problem solving': 'Computational problem solving',
    'Computer & information literacy': 'Computer literacy', Literacy: 'Literacy', Numeracy: 'Numeracy', 'Adaptive problem solving': 'Problem solving' };
  const S = { g: 2, t: 'a15_math', sel: '840', hover: null };
  const nf = new Intl.NumberFormat('en-US');
  const sgn = (v) => (v > 0 ? '+' : v < 0 ? '−' : '±');
  const fmtD = (v) => (v == null ? '—' : sgn(v) + Math.abs(v).toFixed(0));
  const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const rankTxt = (r, t) => `${r.tied ? 'tied for ' : ''}${ord(r.rank)} of ${t.n}`;   // prose
  const rankNum = (r) => (r.tied ? 'T-' : '') + r.rank;                                // tables
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const AUDIT2 = { n: 26, supported: 18, minor: 8, wrong: 0 };   // research/profiles_audit_results.json
  const nQuotes = () => Object.values(TXT).filter((e) => e && e.v2).reduce((a, e) => a + Object.values(e.v2.rows).concat(e.v2.borrow || [], e.v2.tradeoffs || []).reduce((b, it) => b + ((it && it.cites) || []).length, 0), 0);
  const AUDIT = { checked: 865, corrected: 123, deleted: 44, n: 20, supported: 12, broad: 6, uncited: 1, wrong: 1, flagged: 166, narrowed: 29, qdeleted: 1 };   // from research/ audit files
  const SIG = { 1: ['Higher than U.S.', 'hi', '▲'], 0: ['No measurable difference', '', '●'], '-1': ['Lower than U.S.', 'lo', '▼'] };
  // Data-quality flags the test organizers put on the U.S. sample (sources in the method notes)
  const UF = { pisa: 'The OECD flags U.S. PISA 2025 results: response rates fell below target, so they could be biased.',
    t8: 'The U.S. grade 8 sample did not satisfy TIMSS participation guidelines.', t4: 'The U.S. met TIMSS participation guidelines only after replacement schools were added.',
    cil: 'The U.S. did not meet the ICILS 85% participation guideline.' };
  const UFLAG = { a15_math: UF.pisa, a15_read: UF.pisa, a15_sci: UF.pisa, a15_cps: UF.pisa, g8_math: UF.t8, g8_sci: UF.t8, g4_math: UF.t4, g4_sci: UF.t4, g8_cil: UF.cil };
  // Official change since the previous round (only where the organizers publish a significance test)
  const trendOf = (r, t) => (t.trend && r && r.chg != null ? { chg: r.chg, sig: r.chgSig, from: t.trend.from } : null);
  const trendTxt = (x) => (!x ? '' : x.sig ? `${x.sig > 0 ? 'up' : 'down'} ${Math.abs(Math.round(x.chg))} points since ${x.from}` : `no measurable change since ${x.from}`);
  const trendCell = (x) => (!x ? '<span class="kind">—</span>' : `<span class="${x.sig > 0 ? 'hi' : x.sig < 0 ? 'lo' : 'kind'}" title="${x.sig ? 'Significant change' : 'No measurable change'} since ${x.from}">${fmtD(x.chg)}${x.sig > 0 ? ' ▲' : x.sig < 0 ? ' ▼' : ''}</span>`);
  const sigHTML = (s) => `<span class="${SIG[s][1]}">${SIG[s][2]}</span> ${SIG[s][0]}`;

  // ------------------------------------------------------------------ names
  const NAME = {};
  D.tests.forEach((t) => t.rows.forEach((r) => { if (r.iso && !NAME[r.iso]) NAME[r.iso] = r.name; }));
  Object.entries(TXT).forEach(([iso, e]) => { if (e && e.name) NAME[iso] = e.name; });
  NAME['840'] = 'United States';
  const nameOf = (iso) => NAME[iso] || iso;

  // ------------------------------------------------------------------ colors
  let COL = {}, HATCH = null;
  function readColors() {
    const cs = getComputedStyle(document.documentElement); const g = (n) => cs.getPropertyValue(n).trim();
    const ramp = g('--ramp').split(/\s+/); HATCH = null;
    COL = { ramp, rampRGB: ramp.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))), untested: g('--untested'),
      edge: g('--edge'), us: g('--us'), ink: g('--ink'), surface: g('--surface') };
  }
  // Rank color: light green (1st) to dark brown (last), linear between the --ramp stops.
  function rampAt(p) {
    const s = COL.rampRGB, x = Math.max(0, Math.min(1, p)) * (s.length - 1), i = Math.min(s.length - 2, Math.floor(x)), f = x - i;
    return `rgb(${s[i].map((v, j) => Math.round(v + (s[i + 1][j] - v) * f)).join(',')})`;
  }
  const rankColor = (r, t) => rampAt(t.n > 1 ? (r.rank - 1) / (t.n - 1) : 0);
  function colorFor(iso, key = S.t) { const t = T[key], r = t.byIso[iso]; return r ? rankColor(r, t) : COL.untested; }

  // ------------------------------------------------------------------ geometry
  const obj = TOPO.objects.countries; const fc = topojson.feature(TOPO, obj);
  // A ring that crosses the date line (Russia, Fiji...) jumps between the map's two edges. Start it just after a jump, so each
  // piece is closed along the map edge rather than by a straight line through the country (which cut a wedge out of Siberia).
  function ringParts(ring) {
    const n0 = ring.length, same = n0 > 1 && ring[0][0] === ring[n0 - 1][0] && ring[0][1] === ring[n0 - 1][1], pts = same ? ring.slice(0, -1) : ring, n = pts.length;
    const jumps = []; for (let i = 0; i < n; i++) if (Math.abs(pts[i][0] - pts[(i + n - 1) % n][0]) > 1e7) jumps.push(i);
    if (!jumps.length) return [pts];
    return jumps.map((s, j) => { const e = jumps[(j + 1) % jumps.length], part = []; for (let i = s; part.length < n && (i !== e || !part.length); i = (i + 1) % n) part.push(pts[i]); return part; });
  }
  const shoelace = (q) => { let a = 0; for (let i = 0, j = q.length - 1; i < q.length; j = i++) a += (q[j][0] + q[i][0]) * (q[j][1] - q[i][1]); return Math.abs(a) / 2; };
  const feats = []; const BB = [Infinity, Infinity, -Infinity, -Infinity];
  for (const f of fc.features) {
    if (!f.geometry) continue; const iso = f.id || (f.properties.name === 'Kosovo' ? 'XKX' : null);
    // shapes sharing a country code (Australia + Ashmore and Cartier Is.) become one entry: one color, one outline, one dot rule
    const prev = iso ? feats.find((x) => x.iso === iso) : null;
    const p = prev ? prev.p : new Path2D(), b = prev ? prev.b : [Infinity, Infinity, -Infinity, -Infinity]; let big = prev ? prev.big : null, bigA = prev ? prev.bigA : -1, area = prev ? prev.area : 0;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) poly.forEach((ring, h) => { for (const part of ringParts(ring)) {
      const pb = [Infinity, Infinity, -Infinity, -Infinity];
      part.forEach(([x, y], k) => { if (k) p.lineTo(x, y); else p.moveTo(x, y);
        if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y;
        if (x < pb[0]) pb[0] = x; if (y < pb[1]) pb[1] = y; if (x > pb[2]) pb[2] = x; if (y > pb[3]) pb[3] = y; }); p.closePath();
      area += (h ? -1 : 1) * shoelace(part);   // holes (lakes cut out of a country) subtract
      const a = (pb[2] - pb[0]) * (pb[3] - pb[1]); if (!h && a > bigA) { bigA = a; big = pb; } } });
    const e = { iso, name: prev ? prev.name : f.properties.name, p, b, big, bigA, area, c: [(big[0] + big[2]) / 2, (big[1] + big[3]) / 2], size: Math.max(big[2] - big[0], big[3] - big[1]) };
    if (prev) Object.assign(prev, e); else feats.push(e);
    for (let q = 0; q < 2; q++) { if (b[q] < BB[q]) BB[q] = b[q]; if (b[q + 2] > BB[q + 2]) BB[q + 2] = b[q + 2]; }
  }
  const featBy = {}; feats.forEach((f) => { if (f.iso) featBy[f.iso] = f; });
  feats.forEach((f) => { if (f.iso && !NAME[f.iso]) NAME[f.iso] = f.name; });   // e.g. Greenland, which takes none of these tests

  // ------------------------------------------------------------------ map view + draw
  const canvas = $('#map'), ctx = canvas.getContext('2d'); let W = 0, H = 0, DPR = 1, view = null, home = null;
  const fitTo = (b, pad) => { const bw = b[2] - b[0], bh = b[3] - b[1]; const k = Math.min(W * (1 - 2 * pad) / bw, H * (1 - 2 * pad) / bh);
    return { k, x0: (W - bw * k) / 2 - b[0] * k, y0: (H - bh * k) / 2 + b[3] * k }; };
  function resize() { const r = canvas.getBoundingClientRect(); if (!r.width) return; DPR = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR); home = fitTo([BB[0], BB[1] + (BB[3] - BB[1]) * 0.03, BB[2], BB[3]], 0.01); view = view && view.custom ? view : home; draw(); }
  const applyView = () => ctx.setTransform(view.k * DPR, 0, 0, -view.k * DPR, view.x0 * DPR, view.y0 * DPR);
  const toScreen = (x, y) => [view.x0 + x * view.k, view.y0 - y * view.k];
  const isDot = (f) => f.size * view.k < 7;
  function hatch() {   // diagonal stripe tile, drawn at device resolution
    if (HATCH) return HATCH; const n = Math.round(7 * DPR), c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
    const line = (w, col) => { g.strokeStyle = col; g.lineWidth = w * DPR; g.beginPath(); for (const o of [-n, 0, n]) { g.moveTo(o, n); g.lineTo(o + n, 0); } g.stroke(); };
    g.globalAlpha = 0.85; line(2.6, COL.surface); g.globalAlpha = 0.6; line(0.9, COL.ink);
    HATCH = ctx.createPattern(c, 'repeat'); HATCH.setTransform(new DOMMatrix().scale(1 / DPR)); return HATCH;
  }
  let raf = 0; const requestDraw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
  function draw() {
    if (!view) return; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); applyView();
    const k = view.k; ctx.lineJoin = 'round';
    for (const f of feats) { ctx.fillStyle = colorFor(f.iso); ctx.fill(f.p); }
    ctx.strokeStyle = COL.edge; ctx.lineWidth = 0.6 / k; for (const f of feats) ctx.stroke(f.p);
    // stripes where only part of a country took the test (China = 4 provinces, England for the UK...), so its color isn't read as the whole country's
    for (const f of feats) { const r = f.iso && T[S.t].byIso[f.iso]; if (!r || !r.partial || isDot(f)) continue;
      ctx.save(); ctx.clip(f.p); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); const [x0, y1] = toScreen(f.b[0], f.b[1]), [x1, y0] = toScreen(f.b[2], f.b[3]);
      ctx.fillStyle = hatch(); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore(); }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    for (const f of feats) { if (!isDot(f) || !f.iso || (!T[S.t].byIso[f.iso] && f.iso !== '840')) continue;
      const [sx, sy] = toScreen(f.c[0], f.c[1]); ctx.beginPath(); ctx.arc(sx, sy, 4.2, 0, 7); ctx.fillStyle = colorFor(f.iso); ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = COL.ink; ctx.stroke(); }
    applyView();
    const hv = S.hover && featBy[S.hover]; if (hv && !isDot(hv)) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6 / k; ctx.stroke(hv.p); }
    const sf = featBy[S.sel]; if (sf) { if (isDot(sf)) { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); const [sx, sy] = toScreen(sf.c[0], sf.c[1]);
        ctx.beginPath(); ctx.arc(sx, sy, 8, 0, 7); ctx.lineWidth = 2.2; ctx.strokeStyle = COL.ink; ctx.stroke(); }
      else { ctx.strokeStyle = COL.surface; ctx.lineWidth = 4.5 / k; ctx.stroke(sf.p); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2 / k; ctx.stroke(sf.p); } }
    // the U.S. keeps its rank color and gets a gold outline, drawn last so it stays on top
    const us = featBy['840']; if (us) { applyView(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.6 / k; ctx.stroke(us.p); ctx.strokeStyle = COL.us; ctx.lineWidth = 1.4 / k; ctx.stroke(us.p); }
  }
  function hit(sx, sy) {
    for (const f of feats) { if (!isDot(f) || !f.iso) continue; const [x, y] = toScreen(f.c[0], f.c[1]); if ((x - sx) ** 2 + (y - sy) ** 2 < 64) return f; }
    const X = (sx - view.x0) / view.k, Y = (view.y0 - sy) / view.k; applyView();
    for (const f of feats) { if (X < f.b[0] || X > f.b[2] || Y < f.b[1] || Y > f.b[3]) continue; if (ctx.isPointInPath(f.p, sx * DPR, sy * DPR)) return f; }
    return null;
  }
  const tip = $('#tip');
  function tipHTML(f) {
    const iso = f.iso, t = T[S.t];
    const r = t.byIso[iso]; if (!r) return `<b>${esc(nameOf(iso) || f.name)}</b>Did not take this test`;
    const line = `${cap(rankTxt(r, t))} · ${esc(SHORT[t.subject] || t.subject)} average ${r.mean.toFixed(0)}`;
    if (iso === '840') return `<b>United States</b>${line}`;
    return `<b>${esc(r.name)}</b>${line} (U.S. ${t.us.mean.toFixed(0)})<br>${SIG[r.sig][0]}${r.partial ? `<br><i>Only part of the country took this test: ${esc(r.name)}.</i>` : ''}`;
  }
  const pt = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { drag = { x: e.clientX, y: e.clientY, v: { ...view }, moved: false }; canvas.setPointerCapture(e.pointerId); } });
  canvas.addEventListener('pointermove', (e) => {
    const [sx, sy] = pt(e);
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (drag.moved) { view = { k: drag.v.k, x0: drag.v.x0 + dx, y0: drag.v.y0 + dy, custom: true }; tip.hidden = true; requestDraw(); return; } }
    if (e.pointerType !== 'mouse') return;
    const f = hit(sx, sy); const iso = f ? f.iso : null; if (iso !== S.hover) { S.hover = iso; requestDraw(); }
    if (!f) { tip.hidden = true; return; } tip.innerHTML = tipHTML(f); tip.hidden = false;
    const wr = canvas.parentElement.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
    let x = cr.left - wr.left + sx + 14, y = cr.top - wr.top + sy + 14; if (x + tip.offsetWidth > wr.width - 6) x -= tip.offsetWidth + 28;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  });
  canvas.addEventListener('pointerup', (e) => { const was = drag; drag = null; if (was && was.moved) return; const f = hit(...pt(e)); if (f && f.iso) select(f.iso); });
  canvas.addEventListener('pointerleave', () => { if (!drag) { S.hover = null; tip.hidden = true; requestDraw(); } });
  canvas.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); const [sx, sy] = pt(e); zoomAt(sx, sy, Math.exp(-e.deltaY * 0.004)); }, { passive: false });
  canvas.addEventListener('dblclick', (e) => { const [sx, sy] = pt(e); zoomAt(sx, sy, 2.2); });
  function zoomAt(sx, sy, f) { const k2 = Math.max(home.k * 0.9, Math.min(home.k * 30, view.k * f)); const X = (sx - view.x0) / view.k, Y = (view.y0 - sy) / view.k;
    view = { k: k2, x0: sx - X * k2, y0: sy + Y * k2, custom: true }; requestDraw(); }
  $('#reset').addEventListener('click', () => { view = home; requestDraw(); });

  // ------------------------------------------------------------------ controls
  function renderControls() {
    $('#ages').innerHTML = D.groups.map((g, i) => `<button class="age" data-g="${i}" aria-pressed="${i === S.g}">${esc(g.label)}<small>${esc(g.sub)}</small></button>`).join('');
    const g = D.groups[S.g];
    $('#subjects').innerHTML = g.tests.map((k) => `<button class="subj" data-t="${k}" aria-pressed="${k === S.t}">${esc(SHORT[T[k].subject] || T[k].subject)}<span class="kind"> · ${esc(T[k].program)}</span></button>`).join('');
  }
  $('#ages').addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (!b) return; S.g = +b.dataset.g; S.t = D.groups[S.g].tests[0]; refresh(); });
  $('#subjects').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; S.t = b.dataset.t; refresh(); });
  function counts(t) { const c = { 1: 0, 0: 0, '-1': 0 }; t.rows.forEach((r) => { if (r.sig != null && r.iso !== '840') c[r.sig]++; }); return c; }
  function stand() {
    const t = T[S.t], c = counts(t), n = c[1] + c[0] + c[-1], u = t.byIso['840'];
    const ut = trendOf(u, t);
    $('#stand').innerHTML = `U.S. ranks <b>${rankTxt(u, t)}</b> (average ${t.us.mean.toFixed(0)}${ut ? `, ${trendTxt(ut)}` : ''}). Of the other ${n}: <b class="hi">${c[1]}</b> higher, <b>${c[0]}</b> similar, <b class="lo">${c[-1]}</b> lower.`;
    const at = t.n > 1 ? (u.rank - 1) / (t.n - 1) : 0;
    $('#legend').innerHTML = `<span class="ttl">${esc(t.label.replace(/^[^:]+: /, t.program + ': '))}</span>` +
      `<span class="scale"><span>1st</span><span class="ramp" style="background:linear-gradient(to right,${COL.ramp.join(',')})">` +
      `<i class="usm" style="left:${(at * 100).toFixed(1)}%" title="United States: ${rankTxt(u, t)}"></i></span><span>${ord(t.n)}</span></span>` +
      `<span class="key"><i class="usk"></i>U.S. (${ord(u.rank)}), outlined</span><span class="key"><i class="dotk" style="background:${COL.ramp[4]}"></i>Small country, enlarged (zoom in for its real shape)</span>` +
      (t.rows.some((r) => r.partial && r.iso) ? `<span class="key"><i style="background:repeating-linear-gradient(135deg, ${COL.ramp[2]} 0 3px, ${COL.surface} 3px 5px)"></i>Striped: only part of the country tested</span>` : '') +
      `<span class="key"><i style="background:${COL.untested}"></i>Not tested</span>`;
    $('#mapnote').textContent = `${t.program}, ${t.age}. Ranked by average score; countries a few places apart are often within the margin of error.${UFLAG[S.t] ? ' ' + UFLAG[S.t] : ''} Equal-area map (Equal Earth projection): country sizes are true to scale, except small countries drawn as dots. Ctrl/⌘-scroll or double-click to zoom.`;
  }

  // ------------------------------------------------------------------ overview chart
  function overview() {
    const blocks = [{ title: 'Students', keys: ['g4_math', 'g4_read', 'g4_sci', 'g8_math', 'g8_sci', 'g8_cil', 'a15_math', 'a15_read', 'a15_sci', 'a15_cps'] },
      { title: `Adults (PIAAC: ${T.ad_lit.n} mostly high-income countries)`, keys: ['ya_num', 'ya_lit', 'ya_aps', 'ad_num', 'ad_lit', 'ad_aps'] }];
    const Wd = 900, L = 230, R = 190, RH = 26, x = (p) => L + p * (Wd - L - R);
    let html = '';
    for (const b of blocks) {
      const Ht = 30 + b.keys.length * RH + 24;
      let s = `<svg class="chart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="${esc(b.title)}: U.S. rank on each test"><text x="0" y="14" class="lbl">${esc(b.title)}</text>`;
      [[0, '1st'], [0.5, 'Middle'], [1, 'Last']].forEach(([p, lab]) => { s += `<line x1="${x(p)}" x2="${x(p)}" y1="24" y2="${Ht - 20}" stroke="var(--line)"/><text x="${x(p)}" y="${Ht - 6}" text-anchor="middle">${lab}</text>`; });
      b.keys.forEach((key, j) => {
        const t = T[key], y = 30 + j * RH + RH / 2, u = t.byIso['840'], grp = D.groups.find((g) => g.tests.includes(key));
        const px = (r) => x(t.n > 1 ? (r.rank - 1) / (t.n - 1) : 0);
        s += `<g class="row" data-t="${key}"><rect class="hit" x="0" y="${y - RH / 2}" width="${Wd}" height="${RH}" fill="transparent"/>` +
          `<text x="0" y="${y + 4}" class="lbl">${esc(grp.label)} · ${esc(SHORT[t.subject] || t.subject)}</text>` +
          t.rows.filter((r) => r.iso !== '840').map((r) => `<circle cx="${px(r).toFixed(1)}" cy="${y}" r="3.4" fill="${rankColor(r, t)}" stroke="${r.sig === 0 ? 'var(--ink-2)' : 'var(--edge)'}" stroke-width="${r.sig === 0 ? 1.2 : 0.6}"><title>${esc(r.name)}: ${rankTxt(r, t)}</title></circle>`).join('') +
          `<rect x="${(px(u) - 3).toFixed(1)}" y="${y - 9}" width="6" height="18" rx="2" fill="var(--us)" stroke="var(--ink)"><title>United States: ${rankTxt(u, t)}</title></rect>` +
          `<text x="${Wd - R + 12}" y="${y + 4}" class="lbl us-rank">U.S. ${ord(u.rank)} of ${t.n}${u.tied ? ' (tie)' : ''}</text>` +
          (trendOf(u, t) ? `<text x="${Wd}" y="${y + 4}" text-anchor="end" class="us-trend" fill="${trendOf(u, t).sig > 0 ? 'var(--good)' : trendOf(u, t).sig < 0 ? 'var(--bad)' : 'var(--muted)'}">${trendOf(u, t).sig ? (trendOf(u, t).sig > 0 ? '▲' : '▼') + Math.abs(Math.round(trendOf(u, t).chg)) : '●'}<title>U.S. ${trendTxt(trendOf(u, t))}</title></text>` : '') + '</g>';
        if (key === S.t) s += `<rect x="0" y="${y - RH / 2}" width="4" height="${RH}" fill="var(--ink)"/>`;
      });
      html += s + '</svg>';
    }
    $('#overview').innerHTML = html;
  }
  $('#overview').addEventListener('click', (e) => { const g = e.target.closest('[data-t]'); if (!g) return; S.t = g.dataset.t; S.g = D.groups.findIndex((x) => x.tests.includes(S.t)); refresh(); $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' }); });

  // ------------------------------------------------------------------ panel
  function everyTest(iso) {
    const isUS = iso === '840', rows = []; D.groups.forEach((g) => g.tests.forEach((k) => { const t = T[k], r = t.byIso[iso]; if (r) rows.push({ g, t, r }); }));
    if (!rows.length) return '<p class="note">This country did not take part in these tests.</p>';
    return `<div class="tablewrap"><table class="mini"><thead><tr><th>Test</th><th>Rank</th><th>Score</th><th title="Change since the previous round">Change</th><th>${isUS ? 'Countries higher' : 'vs U.S.'}</th></tr></thead><tbody>` +
      rows.map(({ g, t, r }) => { const c = counts(t);
        return `<tr><td>${esc(g.label)} · ${esc(SHORT[t.subject] || t.subject)} <span class="kind">${esc(t.program)}</span></td>` +
          `<td class="rk"><i class="sw" style="background:${rankColor(r, t)}"></i>${rankNum(r)}<span class="kind">/${t.n}</span></td><td>${r.mean.toFixed(0)}</td><td>${trendCell(trendOf(r, t))}</td>` +
          (isUS ? `<td>${c[1]} of ${c[1] + c[0] + c[-1]}</td>` : `<td class="${SIG[r.sig][1]}">${fmtD(r.diff)} ${SIG[r.sig][2]}</td>`) + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function renderPanel() {
    const iso = S.sel, t = T[S.t], e = TXT[iso], r = t.byIso[iso], isUS = iso === '840';
    const partial = (D.tests.map((x) => x.byIso[iso]).find((x) => x && x.partial) || {}).name;
    let head = `<div>${isUS ? '<div class="kind">The comparison point</div>' : ''}<h2>${esc(nameOf(iso))}</h2>` +
      (e && e.coverage ? `<p class="note">${esc(e.coverage)}</p>` : partial ? `<p class="note">Some results cover part of the country: ${esc(partial)}.</p>` : '') + '</div>';
    let now;
    if (r) { const c = counts(t);
      now = `<div class="big"><i class="sw lg" style="background:${rankColor(r, t)}"></i><span class="n">${ord(r.rank)}</span><span class="u">of ${t.n}${r.tied ? ', tied' : ''} · average ${r.mean.toFixed(0)}` +
        (isUS ? ` · ${c[1]} countries higher, ${c[-1]} lower</span></div>` : ` vs U.S. ${t.us.mean.toFixed(0)} (${fmtD(r.diff)} points)</span></div><span class="chip">${sigHTML(r.sig)}</span>`) +
        (trendOf(r, t) ? `<p class="note">${cap(trendTxt(trendOf(r, t)))}.</p>` : ''); }
    else now = `<p class="note">Did not take ${esc(t.program)} ${esc(SHORT[t.subject] || t.subject)}.</p>`;
    let text = '';
    if (e && e.v2) text = (isUS ? '' : `<div class="sec"><p class="note">One of ${V2.length} systems far ahead of the U.S. on the student tests: ${chips(iso)}</p></div>`) + v2HTML(iso, e);
    else if (e) {
      text = `<div class="sec"><h3>${isUS ? 'How the U.S. system works' : 'Compared with the U.S. system'}</h3>` +
        (isUS ? '' : `<p class="note">Drafted with AI from the linked sources and checked claim by claim. Measured accuracy: see "About the country notes" below. Check the source before quoting.</p>`) +
        `${e.summary ? `<p>${esc(e.summary)}</p>` : ''}` +
        (e.different && e.different.length ? `${isUS ? '' : '<h3>Different</h3>'}<ul>${e.different.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '') +
        (e.common && e.common.length ? `${isUS ? '' : '<h3>In common</h3>'}<ul>${e.common.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '') + '</div>';
      const f = e.facts || {}; const fl = [['School starts at', f.start_age], ['Students split into tracks', f.tracking_age], ['Curriculum', f.curriculum], ['School-leaving exam', f.exit_exam]].filter((x) => x[1]);
      if (fl.length) text += `<div class="sec"><h3>Quick facts</h3><dl class="facts">${fl.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`;
      if (e.sources && e.sources.length) text += `<div class="sec"><h3>Sources</h3><div class="srcs">${e.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title || s.url)} ↗</a>`).join('')}</div></div>`;
      if (V2.length) text += `<div class="sec"><p class="note">This is an older note. Rewritten, fully quoted profiles so far: ${chips(iso)}</p></div>`;
    } else text = '<div class="sec"><p class="note">No system write-up yet for this country.</p></div>';
    $('#panel').innerHTML = head + `<div class="sec"><h3>${esc(t.program)} · ${esc(SHORT[t.subject] || t.subject)} · ${esc(t.age)}</h3>${now}</div>` +
      (isUS ? `<div class="sec"><p class="note"><button class="ghost" data-view="us">U.S. results at every age, and every round since 1995 \u2192</button></p></div>`
            : `<div class="sec"><h3>Every test, against the U.S.</h3>${everyTest(iso)}</div>`) + text;
  }

  // ------------------------------------------------------------------ v2 profiles: quote-checked notes (research/profiles)
  const ROWL = { curriculum: 'What is taught', sorting: 'Sorting students', exams: 'Big exams', teachers: 'Teachers', tutoring: 'Tutoring outside school' };
  const SHORTN = { 156: 'China (4 provinces)', 158: 'Taiwan', 344: 'Hong Kong', 446: 'Macao', 410: 'Korea' };
  const shortName = (iso) => SHORTN[iso] || nameOf(iso);
  function lead(iso) {   // computed from the scores, not written: average gap vs the U.S. on the student tests
    const ds = D.tests.filter((t) => !/^(ya|ad)_/.test(t.key)).map((t) => t.byIso[iso]).filter((r) => r && r.diff != null);
    return ds.length ? { n: ds.length, avg: ds.reduce((a, r) => a + r.diff, 0) / ds.length, hi: ds.filter((r) => r.sig > 0).length } : null;
  }
  const V2 = Object.keys(TXT).filter((k) => k !== '840' && TXT[k] && TXT[k].v2).sort((a, b) => ((lead(b) || {}).avg || 0) - ((lead(a) || {}).avg || 0));
  const chips = (cur) => V2.map((k) => `<button class="ghost goto" data-goto="${k}"${k === cur ? ' aria-pressed="true"' : ''}>${esc(shortName(k))}</button>`).join(' ');
  $('#panel').addEventListener('click', (ev) => { const b = ev.target.closest('[data-goto]'); if (b) select(b.dataset.goto); });
  function v2HTML(iso, e) {
    const v = e.v2, U = (TXT['840'] || {}).v2, isUS = iso === '840', srcs = [];
    const title = (u) => (v.sources || {})[u] || (U && U.sources[u]) || u;
    const num = (u) => { let i = srcs.indexOf(u); if (i < 0) { srcs.push(u); i = srcs.length - 1; } return i + 1; };
    const link = (u, tip) => `<a class="cite" href="${esc(u)}" target="_blank" rel="noopener" title="${esc(tip)}">${num(u)}</a>`;
    const cell = (it) => {   // one number per source, its hover text holding every quote used from that source
      if (!(it && it.text)) return '<span class="note">Not found in the sources checked.</span>';
      const by = new Map(); (it.cites || []).forEach((c) => by.set(c.url, (by.get(c.url) || []).concat(c.quote)));
      return esc(it.text) + [...by].map(([u, qs]) => link(u, qs.map((q) => `"${q}"`).join(' … ') + ` (${title(u)})`)).join('');
    };
    let h = '';
    if (isUS) h += `<div class="sec"><h3>How the U.S. system works</h3>${Object.keys(ROWL).map((k) => `<div class="cmp"><h4>${ROWL[k]}</h4><p>${cell(v.rows[k])}</p></div>`).join('')}</div>`;
    else {
      const L = lead(iso);
      h += `<div class="sec"><h3>How it differs from the U.S.</h3>` + (L ? `<p class="note">${esc(shortName(iso))} averages ${Math.abs(Math.round(L.avg))} points ${L.avg >= 0 ? 'ahead of' : 'behind'} the U.S. across the ${L.n} student tests it took, and is measurably ahead on ${L.hi} of them.</p>` : '') +
        Object.keys(ROWL).map((k) => `<div class="cmp"><h4>${ROWL[k]}</h4><p><b>${esc(shortName(iso))}</b> ${cell(v.rows[k])}</p>${U ? `<p class="us"><b>U.S.</b> ${cell(U.rows[k])}</p>` : ''}</div>`).join('') + '</div>';
      const C = D.culture;
      if (C && C.measures) {
        const ms = C.measures.filter((m) => m.values[iso] != null && m.values['840'] != null);
        const val = (m, k) => `${m.values[k].toFixed(m.dp || 0)}${m.unit || ''}${(m.flags || {})[k] || ''}${(m.notes || {})[k] ? ` (${m.notes[k]})` : ''}`;
        const flagged = ms.some((m) => (m.flags || {})[iso] || (m.flags || {})['840']);
        if (ms.length) h += `<div class="sec"><h3>School culture, measured</h3><p class="note">What students and teachers told the OECD's surveys, next to the U.S.</p><div class="tablewrap"><table class="mini cult"><thead><tr><th>Survey finding</th><th>${esc(shortName(iso))}</th><th>U.S.</th></tr></thead><tbody>` +
          ms.map((m) => `<tr><td>${esc(m.label)} <span class="kind">${esc(m.year)}</span>${link(m.source.url, m.source.title)}</td><td>${esc(val(m, iso))}</td><td>${esc(val(m, '840'))}</td></tr>`).join('') + '</tbody></table></div>' +
          (flagged ? `<p class="note">${esc(C.flag_note)}</p>` : '') + '</div>';
      }
      h += `<div class="sec"><h3>Ideas the U.S. could borrow</h3><ul>${(v.borrow || []).map((b) => `<li>${cell(b)}</li>`).join('')}</ul></div>`;
      h += `<div class="sec"><h3>Trade-offs</h3><ul>${(v.tradeoffs || []).map((b) => `<li>${cell(b)}</li>`).join('')}</ul></div>`;
    }
    h += `<div class="sec"><h3>Sources</h3><p class="note">Drafted with AI from these sources. Each statement is backed by a quote that a script checked word for word against its source. Hover a number to see the quote; click it to open the source.</p>` +
      `<ol class="srcs">${srcs.map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(title(u))} ↗</a></li>`).join('')}</ol></div>`;
    return h;
  }

  // The U.S. profile, on the page rather than only behind a click on the map.
  function renderUSSys() {
    const e = TXT['840'];
    if (!(e && e.v2)) { $('#ussys').hidden = true; return; }
    $('#ussys-body').innerHTML = v2HTML('840', e).replace(/<div class="sec"><h3>How the U\.S\. system works<\/h3>/, '<div class="sec">');
  }

  // ------------------------------------------------------------------ views
  /* Two ways in: the world on one test, or the U.S. across every round. They
     are the same data and never both on screen, so the map keeps its height
     and the trends are not something you have to scroll past the map to find. */
  function showView(v) {
    S.view = v;
    $('#view-map').hidden = v !== 'map';
    $('#view-us').hidden = v !== 'us';
    $('#views').querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'));
    if (v === 'map') resize();        // the canvas was display:none and has no size
    else renderUsResults();
  }
  $('#views').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) showView(b.dataset.view); });
  document.addEventListener('click', (e) => { const b = e.target.closest('button[data-view]'); if (b && !b.closest('#views')) showView(b.dataset.view); });

  // The same table the panel used to carry, on its own page with room for it.
  function renderUsResults() {
    const n = D.tests.length;
    $('#usr-note').textContent = `Every international test the U.S. sits, newest round of each. Rank is out of the countries that took that test, so ranks are not comparable between rows. "Change" is the move since the previous round, where the organisers publish one.`;
    $('#usr').innerHTML = everyTest('840');
    $('#usr-title').textContent = `U.S. results at every age \u2014 ${n} tests`;
  }

  // ------------------------------------------------------------------ the U.S. over time
  /* One small chart per test, every point from an official trend table. The
     line is drawn to the range of that test's own series, so the shape is the
     movement in the scores and never a comparison between tests. */
  function renderUsTrend() {
    const U = D.usTrend;
    if (!U) { $('#ut').closest('section').hidden = true; return; }
    if (!$('#view-us')) return;
    const keys = Object.keys(U);
    const rounds = keys.reduce((a, k) => a + U[k].points.length, 0);
    $('#ut-note').textContent = `${keys.length} tests, ${rounds} rounds of testing, earliest 1995. Each line is the U.S. average on that test, and the figure below it is the published change since the first round shown \u2014 greyed out where the test's own publisher will not call it a change.`;

    const W = 200, H = 78, PAD = 8;
    $('#ut').innerHTML = keys.map((k) => {
      const s = U[k], pts = s.points;
      const ys = pts.map((p) => p.score), lo = Math.min(...ys), hi = Math.max(...ys), span = Math.max(hi - lo, 1);
      const x = (i) => PAD + (i * (W - 2 * PAD)) / Math.max(pts.length - 1, 1);
      const y = (v) => PAD + (hi - v) * (H - 2 * PAD) / span;
      const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.score).toFixed(1)}`).join(' ');
      const area = `${line} L${x(pts.length - 1).toFixed(1)} ${H - PAD} L${x(0).toFixed(1)} ${H - PAD} Z`;
      const first = pts[0], last = pts[pts.length - 1];
      // The published change where the table carries one, and its own
      // significance flag: a move the publisher will not call a change is
      // printed in the muted colour and said so in words.
      const net = first.chg != null ? first.chg : last.score - first.score;
      const cls = first.sig ? (net > 0 ? 'up' : net < 0 ? 'dn' : 'flat') : 'flat';
      const word = `since ${first.year}` + (first.sig === false ? ' \u00b7 not a measurable change'
        : first.sig == null ? ' \u00b7 no significance test published' : '');
      const dots = pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.score).toFixed(1)}" r="${i === pts.length - 1 ? 3 : 1.8}" fill="${i === pts.length - 1 ? 'var(--us)' : 'var(--axis)'}"><title>${p.year}: ${p.score.toFixed(0)}</title></circle>`).join('');
      return `<figure>
        <figcaption><span class="ttl">${esc(s.label)}</span><span class="prog">${esc(s.test)}</span></figcaption>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.label)}, U.S. average by year: ${pts.map((p) => `${p.year} ${p.score.toFixed(0)}`).join(', ')}">
          <path d="${area}" fill="var(--accent)" opacity=".07"></path>
          <path d="${line}" fill="none" stroke="var(--ink-2)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"></path>
          ${dots}
        </svg>
        <div class="ends"><span>${first.year} · ${first.score.toFixed(0)}</span><span>${last.year} · ${last.score.toFixed(0)}</span></div>
        <p class="net"><b class="${cls}">${fmtD(net)}</b> <span class="flat">${esc(word)}</span></p>
      </figure>`;
    }).join('');

    const srcs = [...new Set(keys.map((k) => U[k].source))];
    $('#ut-src').textContent = 'Every point is a published average: ' + srcs.join('; ') + '. Changes marked "no measurable change" use the publisher\u2019s own significance test; PIRLS publishes none, so no change there is called significant. ICILS and PIAAC are not shown: the U.S. has sat each of them fewer than three times.';
  }

  // ------------------------------------------------------------------ what the data shows (computed) + what the leaders share (research/common.json)
  function findings() {
    const u = (k) => T[k].byIso['840'], rk = (k) => rankTxt(u(k), T[k]), pct = (k) => (u(k).rank - 1) / (T[k].n - 1);
    const adult = ['ya_num', 'ya_lit', 'ya_aps', 'ad_num', 'ad_lit', 'ad_aps'].map((k) => u(k).rank);
    const LBL = { g4_math: 'math at age 10', g8_math: 'math at 14', a15_math: 'math at 15', a15_read: 'reading at 15', g4_sci: 'science at age 10', g8_sci: 'science at 14', a15_sci: 'science at 15', g8_cil: 'computer literacy at 14' };
    const falls = [], rises = []; Object.keys(LBL).forEach((k) => { const x = trendOf(u(k), T[k]); if (x && x.sig) (x.sig < 0 ? falls : rises).push(`${LBL[k]} (${Math.abs(Math.round(x.chg))} points since ${x.from})`); });
    const list = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]);
    const avg = (ks) => ks.reduce((a, k) => a + pct(k), 0) / ks.length, mathWorse = avg(['g4_math', 'g8_math', 'a15_math']) > avg(['g4_read', 'a15_read', 'g4_sci', 'a15_sci']);
    const items = [
      `<b>${mathWorse ? 'Math is the weak spot.' : 'Math.'}</b> The U.S. ranks ${rk('g4_math')} at age 10, ${rk('g8_math')} at 14 and ${rk('a15_math')} at 15.`,
      `<b>${mathWorse ? 'Reading and science are stronger.' : 'Reading and science.'}</b> It ranks ${rk('g4_read')} in reading at age 10, and ${rk('a15_read')} in reading and ${rk('a15_sci')} in science at 15.`,
      `<b>Adults rank lower.</b> Against ${T.ad_lit.n} mostly high-income countries, U.S. adults rank between ${ord(Math.min(...adult))} and ${ord(Math.max(...adult))} on the six adult measures.`,
      falls.length ? `<b>Recent scores fell</b> in ${list(falls)}${rises.length ? `, and rose in ${list(rises)}` : ''}. Other changes since the last round weren't measurable.` : ''];
    $('#found').innerHTML = `<h2>What the data shows</h2><ul>${items.filter(Boolean).map((x) => `<li>${x}</li>`).join('')}</ul>` +
      `<p class="note">Each test covers a different set of countries, so ranks aren't comparable across tests, and some U.S. samples are flagged for low participation (see "How to read it"). <a href="#common-title">What the ${V2.length} leaders have in common</a>.</p>`;
  }
  function renderCommon() {
    const C = D.common; if (!C) return;
    $('#common-note').textContent = `Patterns across the ${V2.length} rewritten profiles. Every count links to the sourced statements behind it. ${C.caveat}`;
    $('#common').innerHTML = C.themes.map((th) => { const isos = [...new Set(th.claims.flatMap((c) => c.refs).concat(th.also || []).map((r) => r.split(':')[0]))];
      return `<div class="theme"><h3>${esc(th.title)}</h3><p>${esc(th.text)}</p><p class="note">See: ${isos.map((k) => `<button class="ghost goto" data-goto="${k}">${esc(shortName(k))}</button>`).join(' ')}</p></div>`; }).join('');
  }
  $('#common').addEventListener('click', (ev) => { const b = ev.target.closest('[data-goto]'); if (b) { select(b.dataset.goto); $('#panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); } });

  // ------------------------------------------------------------------ rankings
  const RANK_SUBJ = [['a15_math', 'Math'], ['a15_read', 'Literacy'], ['a15_sci', 'Science']].filter(([k]) => T[k]);
  S.rt = (RANK_SUBJ[0] || [])[0];
  $('#rank-subj').innerHTML = RANK_SUBJ.map(([k, lab]) => `<button class="subj" data-rt="${k}"${k === S.rt ? ' aria-pressed="true"' : ''}>${esc(lab)}</button>`).join('');
  $('#rank-subj').addEventListener('click', (e) => { const b = e.target.closest('[data-rt]'); if (!b) return; S.rt = b.dataset.rt; renderRank(); });

  function renderRank() {
    const t = T[S.rt] || T[S.t];
    $('#rank-subj').querySelectorAll('[data-rt]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.rt === S.rt ? 'true' : 'false'));
    $('#rank-note').textContent = `${t.n} education systems, ${t.age}. Ranked by average score; "T-" marks a tie. Reference: ${t.ref ? `${t.ref.name} ${t.ref.mean.toFixed(0)}` : '—'}.`;
    $('#rank thead').innerHTML = `<tr><th>#</th><th style="text-align:left">Education system</th><th>Average</th><th>± margin</th><th>${t.trend ? `Since ${t.trend.from}` : 'Change'}</th><th>vs U.S.</th><th>Result</th></tr>`;
    $('#rank tbody').innerHTML = t.rows.map((r) => { const us = r.iso === '840'; return `<tr data-iso="${esc(r.iso || '')}" class="${us ? 'us' : ''}"${r.iso && r.iso === S.sel ? ' aria-selected="true"' : ''}>` +
      `<td class="rk"><i class="sw" style="background:${rankColor(r, t)}"></i>${rankNum(r)}</td><td style="text-align:left">${esc(r.name)}${r.partial ? ' <span class="kind">part of country</span>' : ''}${r.iso ? '' : ' <span class="kind">not on map</span>'}</td>` +
      `<td>${r.mean.toFixed(0)}</td><td>${(1.96 * r.se).toFixed(1)}</td><td>${trendCell(trendOf(r, t))}</td><td>${us ? '—' : fmtD(r.diff)}</td>` +
      `<td>${us ? '<span class="chip usc">United States</span>' : sigHTML(r.sig)}</td></tr>`; }).join('');
  }
  $('#rank tbody').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-iso]'); if (tr && tr.dataset.iso) select(tr.dataset.iso); });

  // ------------------------------------------------------------------ method
  function renderMethod() {
    const list = D.groups.map((g) => g.tests.map((k) => { const t = T[k]; return `<li><b>${esc(g.label)}</b>: ${esc(t.program)} ${esc(SHORT[t.subject] || t.subject)}. ${t.rows.length} systems, U.S. ${t.us.mean.toFixed(0)}. <a href="${esc(t.source)}" target="_blank" rel="noopener">Official table ↗</a></li>`; }).join('')).join('');
    $('#method').innerHTML = `
      <details class="fold"><summary><span>What's compared</span></summary><div class="body"><ul>${list}</ul>
        <p class="note">No early-childhood comparison is possible: the only international study of five-year-olds (IELS 2025) did not include the U.S. The 2018 round covered just England, Estonia and the U.S.</p></div></details>
      <details class="fold"><summary><span>How to read it</span></summary><div class="body">
        <p>Each test reports a country's average score and its standard error. A country counts as higher or lower than the U.S. only when the gap is larger than the combined 95% margin of error. Otherwise it is marked "no measurable difference." For ICILS, this rule matches the U.S. National Center for Education Statistics' own comparisons for all 31 countries.</p>
        <p>Scales differ by test. PISA, TIMSS, PIRLS and ICILS are centered near 500 with a spread of about 100 points; PIAAC's adult scale has about half that spread. So the map shows rank instead of score: on every test, light green is 1st and dark brown is last.</p>
        <p>Ranks follow the average scores in the official tables, and countries with the same published average share a rank. Countries a few places apart often aren't measurably different, so the panel and table also say whether each country is measurably higher or lower than the U.S.</p>
        <ul>
          <li>Sub-national "benchmarking" participants, such as U.S. states and Canadian provinces, are left out. The official national entry is kept even when it covers part of a country: England for the UK in TIMSS, PIRLS and PIAAC; Belgium's Flemish Community; China's Beijing, Shanghai, Jiangsu and Zhejiang in PISA; parts of Ukraine; Dushanbe; Iraq's Kurdistan Region. These are labeled "part of country."</li>
          <li>The U.S. took PIRLS 2021 one year late, testing fifth graders in fall 2021. It appears in the official exhibit that includes delayed cohorts.</li>
          <li>Norway, South Africa and Türkiye take TIMSS in grades 5 and 9 instead of 4 and 8.</li>
          <li><b>Change since the last round</b> comes from the organizers' own trend tables: PISA 2025 vs 2022 (OECD Tables I.B1.2a.36–38; counted as a real change when it is larger than 1.96 standard errors), TIMSS 2023 vs 2019 (IEA trend tables, which mark significant changes) and ICILS 2023 vs 2018 (NCES). PIRLS isn't shown because its trend table has no significance test, and the adult survey's trend tables couldn't be downloaded.</li>
          <li><b>Flags on the U.S. results.</b> PISA 2025: the OECD marks U.S. results with an asterisk because student response rates fell below the minimum target, so they "could be affected by greater uncertainty, or even be biased" (<a href="https://www.oecd.org/en/publications/pisa-2025-results-volume-i-country-notes_2d4ff9ea-en/united-states_0c8cbc7c-en.html" target="_blank" rel="noopener">OECD</a>); Albania, Canada, the Netherlands, New Zealand and Norway are also flagged. TIMSS 2023: at grade 8 the U.S. "did not satisfy guidelines for sample participation rates"; at grade 4 it met them only after replacement schools were included (<a href="https://nces.ed.gov/timss/results23/doc/TIMSS2023_compiled.pdf" target="_blank" rel="noopener">NCES</a>). ICILS 2023: the U.S. did not meet the 85% sample-participation guideline (<a href="https://nces.ed.gov/surveys/icils/icils2023/tables/ICILS_2023_Web_Tables.xlsx" target="_blank" rel="noopener">NCES</a>).</li>
          <li>Each test covers a different set of countries, so rankings aren't comparable across tests.</li></ul></div></details>
      <details class="fold"><summary><span>About the country notes</span></summary><div class="body">
        <p><b>Scores</b> come straight from the official tables and were checked against them.</p>
        <p><b>Rewritten profiles</b> (the ${V2.length} systems far ahead of the U.S., plus the U.S. column) were drafted with AI, but only from word-for-word quotes in official and research sources: ministries, the TIMSS and PIRLS encyclopedias, the OECD, the World Bank, NCEE and national statistics offices. A script confirms that each of the ${nQuotes()} quotes appears in its source, and rules block overstatement: words like "all" or "only" must appear in the quote, numbers must match it, and claims of cause and effect must say who makes them. A second AI review then read every statement against its quotes, and a separate AI check of ${AUDIT2.n} randomly chosen statements, reading each source in context, found ${AUDIT2.supported} fully supported, ${AUDIT2.minor} with a small wording issue and ${AUDIT2.wrong} wrong; all were fixed. Ideas about why a system does well are the named sources' views, not proven causes. Culture figures are read directly from the OECD's PISA 2022 and 2025 student surveys and its TALIS 2024 teacher survey.</p>
        <p><b>Older notes</b> for the other countries were drafted with AI from the TIMSS 2023 and PIRLS 2021 encyclopedias, Eurydice, the OECD and education ministries, then checked claim by claim against the linked sources. That check covered ${AUDIT.checked} claims: ${AUDIT.corrected} were corrected and ${AUDIT.deleted} deleted, and over-broad wording was narrowed to match each source.</p>
        <p>An independent audit of ${AUDIT.n} randomly chosen claims, made after that check, found ${AUDIT.supported} fully supported, ${AUDIT.broad} right but stated too broadly, ${AUDIT.uncited} right but missing from its cited source, and ${AUDIT.wrong} wrong. All ${AUDIT.n - AUDIT.supported} were fixed. Because most problems were over-broad words, ${AUDIT.flagged} claims containing words like "all", "only" or "every" were then re-checked: ${AUDIT.narrowed} were narrowed and ${AUDIT.qdeleted} deleted. That last pass hasn't been re-audited. Notes describe how systems work, not why scores differ. Check the linked source before quoting a note.</p></div></details>`;
    $('#method').insertAdjacentHTML('beforeend', `
      <details class="fold"><summary><span>Sources and permissions</span></summary><div class="body">
        <p><b>OECD</b> (PISA, PIAAC, TALIS and the OECD reports quoted in the profiles): used under the <a href="https://www.oecd.org/en/about/terms-conditions.html" target="_blank" rel="noopener">OECD's terms</a>, which allow reuse with citation; each source is cited where it's used. This is an adaptation of original works by the OECD. The opinions expressed and arguments employed in this adaptation should not be reported as representing the official views of the OECD or of its Member countries.</p>
        <p><b>IEA</b> (TIMSS, PIRLS, ICILS): used for non-commercial, educational purposes under the <a href="https://timss2023.org/data/" target="_blank" rel="noopener">IEA's terms</a>. SOURCE: IEA's Trends in International Mathematics and Science Study – TIMSS 2023. Copyright © 2025 International Association for the Evaluation of Educational Achievement (IEA). SOURCE: IEA's Progress in International Reading Literacy Study – PIRLS 2021 and International Computer and Information Literacy Study – ICILS 2023. Copyright © International Association for the Evaluation of Educational Achievement (IEA).</p>
        <p><b>Other sources</b>: U.S. National Center for Education Statistics tables (U.S. government, public domain); short quotes from ministries, NCEE, the World Bank and research papers, each linked to its source; country shapes from Natural Earth (public domain).</p></div></details>`);
    $('#foot').textContent = `Built ${D.built}. Scores from the IEA (TIMSS, PIRLS, ICILS via NCES) and the OECD (PISA 2025, PIAAC 2023). Not affiliated with either.`;
  }

  // ------------------------------------------------------------------ select + refresh
  function select(iso) { S.sel = iso; renderPanel(); renderRank(); requestDraw(); }
  function refresh() { readColors(); renderControls(); stand(); overview(); renderPanel(); renderRank(); requestDraw(); }
  const repaint = () => { readColors(); stand(); requestDraw(); };
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(resize, 120); });
  const CONTACT = [['LinkedIn', 'https://www.linkedin.com/in/jamesfloydl/'], ['X', 'https://x.com/jamesfloydswrld']];   // corrections (from jamesfloyds.world)
  $('#updated').innerHTML = `Last updated ${new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(D.built + 'T12:00:00'))}.` +
    (CONTACT.length ? ` Spot an error? Message James Floyd on ${CONTACT.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' or ')}.` : '');
  readColors(); renderMethod(); findings(); renderCommon(); renderUSSys(); renderUsTrend(); refresh(); resize();
  showView('map');
  const screenOf = (iso) => (featBy[iso] ? toScreen(featBy[iso].c[0], featBy[iso].c[1]) : null);   // for verify/browser_check.js
  const dots = () => feats.filter((f) => f.iso && isDot(f) && (T[S.t].byIso[f.iso] || f.iso === '840')).map((f) => f.iso);   // for verify/browser_check.js
  const areaKm2 = (iso) => (featBy[iso] ? featBy[iso].area / 1e6 : null);   // map units are meters on the Equal Earth (equal-area) projection
  window.WL_APP = { S, T, colorFor, select, refresh, nameOf, screenOf, dots, areaKm2 };
})();
