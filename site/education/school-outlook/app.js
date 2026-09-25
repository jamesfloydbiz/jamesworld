/* School Outlook Map (enrollment) - canvas choropleth + detail panel + ranking table. Data arrive as window.SOM_* globals.
   The Stanford/SEDA test-score companion is a separate artifact: web_scores/app.js, built from build_scores/. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const M = window.SOM_META;
  const tab = (T) => { const ix = {}; T.cols.forEach((c, i) => { ix[c] = i; }); return { ix, rows: T.rows }; };
  const CT = tab(window.SOM_COUNTIES), DT = tab(window.SOM_DISTRICTS), DD = tab(window.SOM_DISTRICTS_DETAIL);
  const YEARS = M.years; const NH = YEARS.length; const TESTED = 2;   // horizons past index 2 (2040) are beyond the 15-year backtests
  const SCEN = ['continues at the 2021–25 pace', 'stays at the 2025 level', 'drops to near zero'];
  const REASON = { births: 'Births & aging', moving: 'Families moving', immig: 'Immigration', grow: 'Growing', obs: 'Already under way (2024–25)', fert: 'Birth rates keep falling' };
  const LOCALE = { 1: 'City', 2: 'Suburb', 3: 'Town', 4: 'Rural' };
  const TYPE = { 1: 'Regular district', 2: 'District in a supervisory union', 3: 'Supervisory union', 7: 'Charter-only district' };

  const CC = tab(window.SOM_CALC); const DW = window.SOM_CALC.dist_w || {};
  const cIdx = new Map(), dIdx = new Map(), stName = {};
  CT.rows.forEach((r, i) => { cIdx.set(r[CT.ix.id], i); stName[r[CT.ix.id].slice(0, 2)] = r[CT.ix.st]; });
  DT.rows.forEach((r, i) => dIdx.set(r[DT.ix.id], i));

  const S = { geo: 'c', h: 2, s: 1, f: 1, mo: 'pct', st: '', sel: null, hover: null,
    minn: 500, dtype: 'reg', shown: 50, sort: null, dir: 1, scope: 'place' };

  // ------------------------------------------------------------------ values
  const T = (g) => (g === 'c' ? CT : DT);
  const fam = (g) => (g === 'c' ? 'c' : 'd');
  const val = (g, i, k) => T(g).rows[i][T(g).ix[k]];
  function chgPct(g, i, s = S.s, h = S.h, f = S.f) { const a = val(g, i, f ? 'chgf' : 'chg'); const v = a ? a[s * NH + h] : null; return v == null ? null : v / 10; }
  const enr = (g, i) => val(g, i, 'enr');
  function students(g, i, s = S.s, h = S.h) { const p = chgPct(g, i, s, h), e = enr(g, i); return p == null || !e ? null : e * p / 100; }
  function drivers(g, i, s = S.s, h = S.h) {
    const fert = S.f ? (chgPct(g, i, s, h, 1) - chgPct(g, i, s, h, 0)) : null;   // extra change from falling birth rates
    if (fam(g) === 'c') { const d = val('c', i, 'drv'); return { obs: d[0] / 10, births: d[1 + h] / 10, moving: d[1 + NH + h] / 10, immig: d[1 + 2 * NH + s * NH + h] / 10, fert }; }
    const d = DD.rows[i][DD.ix.drv]; return { births: d[h] / 10, moving: d[NH + h] / 10, immig: d[2 * NH + s * NH + h] / 10, fert };
  }
  function mainReason(g, i) {
    const p = chgPct(g, i); if (p == null) return null; if (p >= 0) return 'grow';
    const d = drivers(g, i); const c = [['births', d.births + (d.fert || 0)], ['moving', d.moving], ['immig', d.immig]].sort((a, b) => a[1] - b[1]);
    return c[0][1] < 0 ? c[0][0] : 'grow';
  }
  function placeName(g, i) {
    if (fam(g) === 'c') { const id = val('c', i, 'id'); return `${val('c', i, 'name')}, ${M.states[id.slice(0, 2)] || ''}`; }
    return `${val('d', i, 'name')}, ${val('d', i, 'st')}`;
  }

  // ------------------------------------------------------------------ formatting
  const nf = new Intl.NumberFormat('en-US');
  const sign = (v) => (v > 0 ? '+' : v < 0 ? '−' : '');
  const fmtN = (v) => (v == null ? '—' : nf.format(Math.round(v)));
  const fmtPct = (v) => (v == null ? '—' : sign(v) + Math.abs(v).toFixed(1) + '%');
  const fmtStu = (v) => (v == null ? '—' : sign(Math.round(v)) + nf.format(Math.abs(Math.round(v))));
  const fmtPts = (v) => (v == null ? '—' : sign(v) + Math.abs(v).toFixed(1));
  const cls = (v) => (v == null ? '' : v < 0 ? 'neg' : v > 0 ? 'pos' : '');

  // ------------------------------------------------------------------ colors
  let COL = {};
  function readColors() {
    const cs = getComputedStyle(document.documentElement); const g = (n) => cs.getPropertyValue(n).trim();
    COL = { div: ['--neg3', '--neg2', '--neg1', '--mid', '--pos1', '--pos2', '--pos3'].map(g), nodata: g('--nodata'),
      edge: g('--map-edge'), state: g('--map-state'), ink: g('--ink'), surface: g('--surface'),
      drv: { moving: g('--drv-move'), births: g('--drv-birth'), immig: g('--drv-imm'), obs: g('--drv-obs'), grow: g('--mid') } };
  }
  const BINS = { pct: [-25, -15, -5, 5, 15, 25], n: [-10000, -1000, -100, 100, 1000, 10000] };
  function binOf(v, b) { if (v == null || Number.isNaN(v)) return -1; let k = 0; while (k < b.length && v > b[k]) k++; return k; }
  const metric = () => S.mo;
  function valueFor(g, i) {
    if (i == null) return null; const m = metric();
    return m === 'pct' ? chgPct(g, i) : m === 'n' ? students(g, i) : null;
  }
  function colorFor(g, i) {
    if (i == null) return COL.nodata; const m = metric();
    if (m === 'drv') { const r = mainReason(g, i); return r == null ? COL.nodata : COL.drv[r]; }
    const k = binOf(valueFor(g, i), BINS[m]); return k < 0 ? COL.nodata : COL.div[k];
  }

  // ------------------------------------------------------------------ geometry
  const GEO = { c: window.SOM_GEO_COUNTIES, d: window.SOM_GEO_DISTRICTS, s: window.SOM_GEO_SECONDARY, st: window.SOM_GEO_STATES };
  const layers = {};
  function getLayer(g) {
    if (layers[g]) return layers[g];
    const topo = GEO[g]; const obj = topo.objects[Object.keys(topo.objects)[0]];
    const fc = topojson.feature(topo, obj); const feats = []; const bb = [Infinity, Infinity, -Infinity, -Infinity];
    for (const f of fc.features) {
      if (!f.geometry) continue;
      const p = new Path2D(); const b = [Infinity, Infinity, -Infinity, -Infinity];
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) for (const ring of poly) {
        for (let k = 0; k < ring.length; k++) {
          const x = ring[k][0], y = ring[k][1]; if (k) p.lineTo(x, y); else p.moveTo(x, y);
          if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y;
        }
        p.closePath();
      }
      const id = f.properties.GEOID; const i = g === 'c' ? cIdx.get(id) : dIdx.get(id);
      feats.push({ id, st: id.slice(0, 2), p, b, i: i === undefined ? null : i, name: f.properties.NAME });
      for (let q = 0; q < 2; q++) { if (b[q] < bb[q]) bb[q] = b[q]; if (b[q + 2] > bb[q + 2]) bb[q + 2] = b[q + 2]; }
    }
    const GX = 90, GY = 56, cw = (bb[2] - bb[0]) / GX, ch = (bb[3] - bb[1]) / GY;
    const grid = Array.from({ length: GX * GY }, () => []);
    feats.forEach((f, n) => {
      const x0 = Math.max(0, Math.floor((f.b[0] - bb[0]) / cw)), x1 = Math.min(GX - 1, Math.floor((f.b[2] - bb[0]) / cw));
      const y0 = Math.max(0, Math.floor((f.b[1] - bb[1]) / ch)), y1 = Math.min(GY - 1, Math.floor((f.b[3] - bb[1]) / ch));
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) grid[y * GX + x].push(n);
    });
    const byI = new Map(); feats.forEach((f) => { if (f.i != null) byI.set(f.i, f); });
    return (layers[g] = { feats, bb, grid, GX, GY, cw, ch, byI });
  }
  let stateMesh = null, nationMesh = null; const stateBox = {};
  function buildStates() {
    const topo = GEO.st; const obj = topo.objects[Object.keys(topo.objects)[0]];
    const toPath = (geom) => { const p = new Path2D(); const ls = geom.type === 'MultiLineString' ? geom.coordinates : [geom.coordinates];
      for (const l of ls) l.forEach(([x, y], k) => (k ? p.lineTo(x, y) : p.moveTo(x, y))); return p; };
    stateMesh = toPath(topojson.mesh(topo, obj, (a, b) => a !== b));
    nationMesh = toPath(topojson.mesh(topo, obj, (a, b) => a === b));
    for (const f of getLayer('c').feats) {
      const b = stateBox[f.st] || (stateBox[f.st] = [Infinity, Infinity, -Infinity, -Infinity]);
      b[0] = Math.min(b[0], f.b[0]); b[1] = Math.min(b[1], f.b[1]); b[2] = Math.max(b[2], f.b[2]); b[3] = Math.max(b[3], f.b[3]);
    }
  }

  // ------------------------------------------------------------------ view + drawing
  const canvas = $('#map'), ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1, view = null, home = null;
  function fitTo(b, pad) { const bw = b[2] - b[0], bh = b[3] - b[1]; const k = Math.min(W * (1 - 2 * pad) / bw, H * (1 - 2 * pad) / bh);
    return { k, x0: (W - bw * k) / 2 - b[0] * k, y0: (H - bh * k) / 2 + b[3] * k }; }
  /* 100vw counts the scrollbar and would push the page sideways, so the bleed
     is driven off clientWidth, which does not. */
  function setBleed() {
    document.documentElement.style.setProperty('--vw', document.documentElement.clientWidth + 'px');
  }
  function resize() {
    setBleed();
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    home = fitTo(getLayer('c').bb, 0.02); view = S.st && stateBox[S.st] ? fitTo(stateBox[S.st], 0.06) : home; draw();
  }
  const applyView = () => ctx.setTransform(view.k * DPR, 0, 0, -view.k * DPR, view.x0 * DPR, view.y0 * DPR);
  let raf = 0; const requestDraw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
  function selFeature() { if (!S.sel || S.sel.g !== fam(S.geo)) return null; return getLayer(S.geo).byI.get(S.sel.i) || null; }
  function draw() {
    if (!W || !view) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); applyView();
    const k = view.k, g = S.geo, L = getLayer(g);
    if (g !== 'c') { ctx.fillStyle = COL.nodata; for (const f of getLayer('c').feats) ctx.fill(f.p); }
    const groups = new Map();
    for (const f of L.feats) { const key = colorFor(g, f.i) + '|' + (S.st && f.st !== S.st ? 1 : 0);
      let a = groups.get(key); if (!a) groups.set(key, (a = [])); a.push(f); }
    for (const [key, fs] of groups) { const [c, dim] = key.split('|'); ctx.globalAlpha = dim === '1' ? 0.25 : 1; ctx.fillStyle = c; for (const f of fs) ctx.fill(f.p); }
    ctx.globalAlpha = 1; ctx.lineJoin = 'round';
    ctx.strokeStyle = COL.edge; ctx.lineWidth = (g === 'c' ? 0.55 : 0.4) / k; for (const f of L.feats) ctx.stroke(f.p);
    ctx.strokeStyle = COL.state; ctx.lineWidth = 0.9 / k; ctx.stroke(stateMesh); ctx.stroke(nationMesh);
    const hv = S.hover != null ? L.feats[S.hover] : null;
    if (hv) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5 / k; ctx.stroke(hv.p); }
    const sf = selFeature();
    if (sf) { ctx.strokeStyle = COL.surface; ctx.lineWidth = 4.5 / k; ctx.stroke(sf.p); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2 / k; ctx.stroke(sf.p); }
  }
  function hitTest(sx, sy) {
    const L = getLayer(S.geo); const X = (sx - view.x0) / view.k, Y = (view.y0 - sy) / view.k;
    const gx = Math.floor((X - L.bb[0]) / L.cw), gy = Math.floor((Y - L.bb[1]) / L.ch);
    if (gx < 0 || gy < 0 || gx >= L.GX || gy >= L.GY) return null;
    applyView();
    for (const n of L.grid[gy * L.GX + gx]) { const f = L.feats[n];
      if (X < f.b[0] || X > f.b[2] || Y < f.b[1] || Y > f.b[3]) continue;
      if (ctx.isPointInPath(f.p, sx * DPR, sy * DPR)) return n; }
    return null;
  }
  function zoomAt(sx, sy, f) {
    const k2 = Math.max(home.k * 0.9, Math.min(home.k * 80, view.k * f)); const X = (sx - view.x0) / view.k, Y = (view.y0 - sy) / view.k;
    view = { k: k2, x0: sx - X * k2, y0: sy + Y * k2 }; requestDraw();
  }
  function zoomToBox(b, pad) { const v = fitTo(b, pad); if (v.k > home.k * 40) { const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2; v.k = home.k * 40; v.x0 = W / 2 - cx * v.k; v.y0 = H / 2 + cy * v.k; } view = v; requestDraw(); }

  // ------------------------------------------------------------------ tooltip + pointer
  const tip = $('#tip');
  function tipLine(g, i) {
    const m = metric(), y = YEARS[S.h];
    if (m === 'pct') return `${fmtPct(chgPct(g, i))} students by ${y}`;
    if (m === 'n') return `${fmtStu(students(g, i))} students by ${y}`;
    const r = mainReason(g, i); return r === 'grow' ? `Growing: ${fmtPct(chgPct(g, i))} by ${y}` : `Biggest reason: ${REASON[r]} (${fmtPct(chgPct(g, i))})`;
  }
  function showTip(n, sx, sy) {
    const f = getLayer(S.geo).feats[n], g = S.geo;
    tip.innerHTML = f.i == null ? `<b>${esc(f.name || f.id)}</b>No forecast for this area`
      : `<b>${esc(placeName(g, f.i))}</b><span class="v">${tipLine(g, f.i)}</span><br>${fmtN(enr(g, f.i))} students (2024–25)`;
    tip.hidden = false; const wr = canvas.parentElement.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
    let x = cr.left - wr.left + sx + 14, y = cr.top - wr.top + sy + 14;
    if (x + tip.offsetWidth > wr.width - 8) x = cr.left - wr.left + sx - tip.offsetWidth - 14;
    if (y + tip.offsetHeight > wr.height - 8) y = cr.top - wr.top + sy - tip.offsetHeight - 14;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  const hideTip = () => { tip.hidden = true; };
  let drag = null;
  const pt = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { drag = { x: e.clientX, y: e.clientY, x0: view.x0, y0: view.y0, moved: false }; canvas.setPointerCapture(e.pointerId); } });
  canvas.addEventListener('pointermove', (e) => {
    const [sx, sy] = pt(e);
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (drag.moved) { view = { k: view.k, x0: drag.x0 + dx, y0: drag.y0 + dy }; hideTip(); requestDraw(); return; } }
    if (e.pointerType !== 'mouse') return;
    const n = hitTest(sx, sy); if (n !== S.hover) { S.hover = n; requestDraw(); }
    if (n == null) hideTip(); else showTip(n, sx, sy);
  });
  canvas.addEventListener('pointerup', (e) => {
    const was = drag; drag = null; if (was && was.moved) return;
    const [sx, sy] = pt(e); const n = hitTest(sx, sy); if (n == null) return;
    const f = getLayer(S.geo).feats[n]; if (f.i != null) select(fam(S.geo), f.i);
    if (e.pointerType !== 'mouse') { S.hover = n; showTip(n, sx, sy); }
  });
  canvas.addEventListener('pointerleave', () => { if (!drag) { S.hover = null; hideTip(); requestDraw(); } });
  /* The wheel scrolls the page, including over the map.
     Taking the plain wheel for zooming made the map a trap: it fills the
     window, so scrolling down the page put the pointer over it and the page
     stopped moving. Zoom has its own controls -- the buttons, double-click,
     pinch -- so the wheel does not need to be one of them. Holding Ctrl or the
     command key still zooms, which is what a browser means by that gesture
     anyway. */
  canvas.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;            // let the page scroll
    e.preventDefault();
    const [sx, sy] = pt(e); zoomAt(sx, sy, Math.exp(-e.deltaY * 0.004));
  }, { passive: false });
  canvas.addEventListener('dblclick', (e) => { const [sx, sy] = pt(e); zoomAt(sx, sy, 2.2); });
  const zoomCentre = (f) => { const r = canvas.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, f); };
  $('#zin').addEventListener('click', () => zoomCentre(1.6));
  $('#zout').addEventListener('click', () => zoomCentre(1 / 1.6));
  $('#zrs').addEventListener('click', () => { view = S.st && stateBox[S.st] ? fitTo(stateBox[S.st], 0.06) : home; requestDraw(); });

  /* Pinch. Two pointers down, and the distance between them sets the scale
     about the point halfway between the fingers. */
  const pts2 = new Map(); let pinch = null;
  canvas.addEventListener('pointerdown', (e) => { pts2.set(e.pointerId, pt(e)); if (pts2.size === 2) pinch = null; });
  canvas.addEventListener('pointermove', (e) => {
    if (!pts2.has(e.pointerId)) return;
    pts2.set(e.pointerId, pt(e));
    if (pts2.size !== 2) return;
    const [a, b] = [...pts2.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (pinch) zoomAt(mid[0], mid[1], d / pinch);
    pinch = d;
  });
  const drop2 = (e) => { pts2.delete(e.pointerId); if (pts2.size < 2) pinch = null; };
  canvas.addEventListener('pointerup', drop2);
  canvas.addEventListener('pointercancel', drop2);

  // ------------------------------------------------------------------ legend, headline
  function legend() {
    const m = metric(), y = YEARS[S.h]; let html = '';
    if (m === 'drv') {
      html = `<span class="ttl">Biggest reason for decline by ${y}</span>` + ['births', 'moving', 'immig', 'grow'].map((r) =>
        `<span class="cat"><i style="background:${COL.drv[r]}"></i>${REASON[r]}</span>`).join('') +
        `<span class="cat"><i style="background:${COL.nodata}"></i>No forecast</span>`;
    } else {
      const lab = { pct: ['≤ −25%', '−25 to −15', '−15 to −5', '−5 to +5', '+5 to +15', '+15 to +25', '≥ +25%'],
        n: ['≤ −10k', '−10k to −1k', '−1k to −100', '±100', '+100 to +1k', '+1k to +10k', '≥ +10k'] }[m];
      const far = S.h > TESTED ? ' (beyond tested range)' : '';
      const ttl = { pct: `Change in students, fall 2024 → fall ${y}${far}`, n: `Students gained or lost by ${y}${far}` }[m];
      html = `<span class="ttl">${ttl}</span><span class="swatches">` + COL.div.map((c, k) =>
        `<span class="sw"><i style="background:${c}"></i><span>${lab[k]}</span></span>`).join('') +
        `<span class="sw"><i style="background:${COL.nodata}"></i><span>No forecast</span></span></span>`;
    }
    $('#legend').innerHTML = html;
    $('#mapnote').textContent = 'Census population estimates (Vintage 2025) and NCES enrollment, fall 2024. Zoom with the + and \u2212 buttons, a double-click, a pinch, or Ctrl/\u2318-scroll; drag to pan.';
  }
  /* The same figure the headline states, kept in the corner of the map so it
     is still there once you have scrolled the sentence off or panned away. */
  function cornerBox() {
    const el = $('#hbox'); if (!el) return;
    const y = YEARS[S.h];
    if (S.sel) {
      const { g, i } = S.sel, p = chgPct(g, i);
      el.innerHTML = `<span class="k">${esc(placeName(g, i))}</span><span class="v ${cls(p)}">${fmtPct(p)}</span>` +
        `<span class="s">students, fall 2024 \u2192 fall ${y}</span>`;
      return;
    }
    const us = (S.f ? M.us_chg_f['S' + S.s + 'f'] : M.us_chg['S' + S.s])[S.h];
    el.innerHTML = `<span class="k">United States</span><span class="v ${cls(us)}">${fmtPct(us)}</span>` +
      `<span class="s">public K\u201312 students by ${y}</span>`;
  }

  /* What the data shows, computed here rather than written down, so it cannot
     drift away from the numbers underneath it when a setting changes. */
  function findings() {
    const el = $('#found'); if (!el) return;
    const y = YEARS[S.h];
    let dec = 0, grow = 0, n = 0, lost = 0, gained = 0;
    CT.rows.forEach((r, i) => {
      const p = chgPct('c', i); if (p == null) return;
      n++; if (p < 0) dec++; else if (p > 0) grow++;
      const st2 = students('c', i); if (st2 == null) return;
      if (st2 < 0) lost += st2; else gained += st2;
    });
    const sts = ST_ROWS.map((o) => ({ o, p: stPct(o) })).filter((x) => x.p != null && x.o.enr >= 50000);
    sts.sort((a, b) => a.p - b.p);
    const worst = sts[0], best = sts[sts.length - 1];
    const us = (S.f ? M.us_chg_f['S' + S.s + 'f'] : M.us_chg['S' + S.s])[S.h];
    const big = CT.rows.map((r, i) => [students('c', i), i]).filter((x) => x[0] != null).sort((a, b) => a[0] - b[0])[0];
    const items = [
      `<b>${fmtPct(us)}</b> fewer public K\u201312 students nationally by ${y}, about <b>${fmtStu(M.us_enr_2024 * us / 100)}</b>.`,
      `<b>${Math.round(100 * dec / n)}%</b> of counties shrink (${nf.format(dec)} of ${nf.format(n)}); <b>${nf.format(grow)}</b> grow.`,
      worst ? `Hardest hit state: <b>${esc(stName[worst.o.st] || worst.o.st)}</b> at <b>${fmtPct(worst.p)}</b>. Least: <b>${esc(stName[best.o.st] || best.o.st)}</b> at <b>${fmtPct(best.p)}</b>.` : '',
      big ? `Biggest single loss: <b>${esc(placeName('c', big[1]))}</b>, <b>${fmtStu(big[0])}</b> students.` : '',
      `Growth does not offset decline: <b>${fmtStu(gained)}</b> gained against <b>${fmtStu(lost)}</b> lost.`,
    ].filter(Boolean);
    el.innerHTML = `<h2>What the data shows</h2><ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul>` +
      `<p class="note">Computed from the counties on the map at the settings above \u2014 immigration ${SCEN[S.s]}, births ${S.f ? 'falling 1.4% a year' : 'at the 2025 rate'}. States are summed from their counties; only those with 50,000+ students are ranked.</p>`;
  }

  function headline() {
    cornerBox();
    findings();
    const el = $('#headline');
    let dec = 0, n = 0; CT.rows.forEach((r, i) => { const p = chgPct('c', i); if (p != null) { n++; if (p < 0) dec++; } });
    const us = (S.f ? M.us_chg_f['S' + S.s + 'f'] : M.us_chg['S' + S.s])[S.h];
    el.innerHTML = `U.S. public K–12 students, fall 2024 → fall ${YEARS[S.h]}: <b>${fmtPct(us)}</b> if immigration ${SCEN[S.s]} and births ${S.f ? 'keep falling' : 'stay at the 2025 rate'}. <b>${nf.format(dec)}</b> of ${nf.format(n)} counties shrink.`;
  }

  // ------------------------------------------------------------------ panel
  function yScale(lo, hi, top, bot) { return (v) => bot - (v - lo) / (hi - lo || 1) * (bot - top); }
  function niceTicks(lo, hi, n) { const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0))); const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => span / x <= n) || mag * 10;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(v); return out; }
  function enrollChart(g, i) {
    const hist = fam(g) === 'c' ? val('c', i, 'hist') : DD.rows[i][DD.ix.hist];
    const pts = hist.map((v, k) => [2014 + k, v]).filter((p) => p[1] != null);
    const base = pts.length && pts[pts.length - 1][0] === 2024 ? pts[pts.length - 1][1] : enr(g, i); if (!base) return '';
    return lineChart(pts, base, [0, 1, 2].map((s) => YEARS.map((_, h) => base * (1 + (chgPct(g, i, s, h) || 0) / 100))));
  }
  function lineChart(pts, base, proj) {
    const all = pts.map((p) => p[1]).concat(proj.flat(), base);
    let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.12 || hi * 0.05; lo = Math.max(0, lo - pad); hi += pad;
    const Wd = 340, Ht = 168, L = 46, R = 12, Tp = 18, B = 22, X1 = YEARS[NH - 1]; const x = (yr) => L + (yr - 2014) / (X1 - 2014) * (Wd - L - R); const y = yScale(lo, hi, Tp, Ht - B);
    const ticks = niceTicks(lo, hi, 3);
    const band = [[2024, base, base]].concat(YEARS.map((yr, h) => [yr, Math.min(proj[0][h], proj[1][h], proj[2][h]), Math.max(proj[0][h], proj[1][h], proj[2][h])]));
    const bandPath = 'M' + band.map((b) => `${x(b[0])},${y(b[2])}`).join('L') + 'L' + band.slice().reverse().map((b) => `${x(b[0])},${y(b[1])}`).join('L') + 'Z';
    const sel = [[2024, base]].concat(YEARS.map((yr, h) => [yr, proj[S.s][h]]));
    const endV = proj[S.s][S.h]; const c = proj[S.s][NH - 1] < base ? 'var(--neg3)' : 'var(--pos3)'; const xt = x(YEARS[TESTED]);
    const fmtT = (t) => (t >= 1e6 ? (t / 1e6).toFixed(t % 1e6 ? 1 : 0) + 'M' : t >= 1e3 ? nf.format(t / 1e3) + 'k' : nf.format(t));
    return `<svg class="chart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Students, actual and projected to ${X1}">
      <rect x="${xt}" y="${Tp}" width="${Wd - R - xt}" height="${Ht - B - Tp}" fill="var(--line)" fill-opacity=".45"/><text x="${(xt + Wd - R) / 2}" y="${Tp - 5}" text-anchor="middle">beyond tested range</text>
      ${ticks.map((t) => `<line x1="${L}" x2="${Wd - R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${fmtT(t)}</text>`).join('')}
      <line x1="${x(2024.5)}" x2="${x(2024.5)}" y1="${Tp}" y2="${Ht - B}" stroke="var(--line-2)" stroke-dasharray="2 3"/>
      <path d="${bandPath}" fill="${c}" fill-opacity=".14" stroke="none"/>
      ${pts.length ? `<polyline points="${pts.map((p) => `${x(p[0])},${y(p[1])}`).join(' ')}" fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-linejoin="round"/>` : ''}
      <polyline points="${sel.map((p) => `${x(p[0])},${y(p[1])}`).join(' ')}" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>
      <circle cx="${x(YEARS[S.h])}" cy="${y(endV)}" r="4" fill="${c}" stroke="var(--surface)" stroke-width="2"/>
      ${[2014, 2024, 2040, X1].map((yr) => `<text x="${x(yr)}" y="${Ht - 6}" text-anchor="middle">${yr}</text>`).join('')}
    </svg>`;
  }
  function driverBars(g, i) { return barsHTML(drivers(g, i), (fam(g) === 'c' ? ['obs'] : []).concat(['births', 'moving', 'immig'], S.f ? ['fert'] : [])); }
  function barsHTML(d, keys) {
    const mx = Math.max(1, ...keys.map((k) => Math.abs(d[k] || 0)));
    const col = { obs: 'var(--drv-obs)', births: 'var(--drv-birth)', moving: 'var(--drv-move)', immig: 'var(--drv-imm)', fert: 'color-mix(in srgb, var(--drv-birth) 55%, transparent)' };
    return `<div class="bars">` + keys.map((k) => { const v = d[k] || 0, w = Math.abs(v) / mx * 50;
      return `<span class="lb">${REASON[k]}</span><span class="track"><span class="bar" style="background:${col[k]};width:${w}%;${v < 0 ? `right:50%` : `left:50%`}"></span></span><span class="val ${cls(v)}">${fmtPts(v)}</span>`; }).join('') + `</div>`;
  }
  function birthsChart(ci) { return birthsChartArr(val('c', ci, 'births')); }
  function birthsChartArr(b) {
    if (!b || b.every((v) => v == null)) return '';
    const Wd = 340, Ht = 92, L = 6, R = 6, Tp = 16, B = 18; const n = b.length, bw = (Wd - L - R) / n; const mx = Math.max(...b.filter((v) => v != null));
    const y = yScale(0, mx, Tp, Ht - B);
    return `<svg class="chart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Births per year, 2011 to 2025">` + b.map((v, k) => v == null ? '' :
      `<rect x="${L + k * bw + 1}" y="${y(v)}" width="${bw - 2}" height="${Ht - B - y(v)}" rx="2" fill="var(--axis)" fill-opacity="${k >= 13 ? 0.45 : 0.85}"><title>${2011 + k}: ${nf.format(v)} births${k >= 13 ? ' (state trend applied to county)' : ''}</title></rect>`).join('') +
      `<text x="${L}" y="${Ht - 4}">2011</text><text x="${Wd - R}" y="${Ht - 4}" text-anchor="end">2025</text>` +
      (b[0] != null ? `<text x="${L}" y="${Tp - 4}">${nf.format(b[0])}</text>` : '') + `<text x="${Wd - R}" y="${Tp - 4}" text-anchor="end">${nf.format(b[n - 1])}</text></svg>`;
  }
  const SRC = { age25: 'Census county population by single year of age, Vintage 2025 (cc-est2025-syasex)',
    pep25: 'Census county births and migration, Vintage 2025 (co-est2025-alldata)', pep20: 'Census county births 2011–2020, Vintage 2020',
    acsus: 'Census ACS 2020–24, movers from abroad by age (U.S. total)', enr2024: 'NCES Common Core of Data 2024–25, enrollment by grade (via Urban Institute)',
    schdir: 'NCES school directory 2024–25: where each district\'s schools are (via Urban Institute)', bt00: 'Census intercensal ages 2000–2010 (accuracy test)', bt10: 'Census intercensal ages 2010–2020 (accuracy test)' };
  const srcOf = (id) => { const m = M.sources.find((x) => x.id === id); return m ? `<span class="src">Source: <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(SRC[id] || id)}</a></span>` : ''; };
  const fx = (v, d = 3) => (v == null ? '—' : Number(v).toFixed(d));
  function mathCounty(i) {
    const c = CC.rows[i], ix = CC.ix, y = YEARS[S.h]; const p24 = val('c', i, 'p24'), e = enr('c', i);
    const projH = c[ix.abs][S.s * NH + S.h], projF = c[ix.absf][S.s * NH + S.h], proj = S.f ? projF : projH, pc = chgPct('c', i); const g20 = c[ix.grp20], g25 = c[ix.grp25], raw = c[ix.ccr_raw], used = c[ix.ccr][S.s];
    const rho = [1, M.rho.S1, M.rho.S2][S.s]; const b = val('c', i, 'births'); const da = c[ix.drv_abs], h = S.h;
    const d = { obs: da[0], births: da[1 + h], moving: da[1 + NH + h], immig: da[1 + 2 * NH + S.s * NH + h], fert: projF - projH }; const kids = (v) => fmtStu(v); const ratio = proj / p24;
    const rows = [['0–4', '5–9', 0], ['5–9', '10–14', 1], ['10–14', '15–19', 2]].map(([a, bb, g]) =>
      `<tr><td>${a} → ${bb}</td><td>${fmtN(g20[g])}</td><td>${fmtN(g25[g + 1])}</td><td>${fx(raw[g])}</td><td>${fx(used[g])}</td></tr>`).join('');
    return `<details class="math"><summary>Show the math and sources</summary><ol>
      <li><b>Children aged 5–17 now.</b> July 2024: ${fmtN(p24)}. July 2025: ${fmtN(c[ix.nc])}.<br>${srcOf('age25')}</li>
      <li><b>Move each age group forward 5 years.</b> Each group changes the way the same group changed in this county from 2020 to 2025. That ratio captures families moving and immigration.
        <table><thead><tr><th>Age group</th><th>2020</th><th>2025</th><th>Ratio</th><th>Used</th></tr></thead><tbody>${rows}</tbody></table>
        "Used" = <span class="eq">1 + ½ × (ratio − 1)</span>: moving trends count at half strength, which tested most accurate. Immigration is scaled to ${fx(rho * 100, 0)}% of this county's 2021–25 inflow (${fmtN(c[ix.nim])} net arrivals from abroad). Blended ${fx(c[ix.w] * 100, 1)}% county, ${fx((1 - c[ix.w]) * 100, 1)}% state.<br>${srcOf('pep25')} ${srcOf('acsus')}</li>
      <li><b>Future kindergartners come from births.</b> Children 0–4 per woman aged 15–44 in 2025: <span class="eq">${fx(c[ix.cwr])}</span>, applied to the projected number of women. ${S.f ? `With births falling 1.4% a year, children born in the 5 years before ${YEARS[S.h]} are multiplied by <span class="eq">0.9856^${(5 * (S.h + 1) - 2.5).toFixed(1)} = ${fx(Math.pow(1 + M.fert_r, 5 * (S.h + 1) - 2.5))}</span>, and earlier 5-year groups by smaller factors.` : 'The birth rate per woman is held at its 2025 level.'} Births here: ${fmtN(b[0])} in 2011 → ${fmtN(b[14])} in 2025.<br>${srcOf('pep20')} ${srcOf('pep25')}</li>
      <li><b>Result.</b> Projected children aged 5–17 in July ${y}: ${fmtN(proj)}. <span class="eq">${fmtN(proj)} ÷ ${fmtN(p24)} − 1 = ${fmtPct(pc)}</span>.
        Change in children: already under way 2024–25 ${kids(d.obs)}; births &amp; aging ${kids(d.births)}; families moving ${kids(d.moving)}; immigration ${kids(d.immig)}${S.f ? `; birth rates keep falling ${kids(d.fert)}` : ''}. Total ${kids(d.obs + d.births + d.moving + d.immig + (S.f ? d.fert : 0))} = ${fmtN(proj)} − ${fmtN(p24)}.</li>
      <li><b>Students.</b> Public K–12 students, fall 2024: ${fmtN(e)}. <span class="eq">${fmtN(e)} × ${fx(ratio, 4)} = ${fmtN(e * ratio)}</span> (${fmtStu(e * ratio - e)} students). Assumes public schools keep today's share of children.<br>${srcOf('enr2024')} ${srcOf('schdir')}</li>
      </ol></details>`;
  }
  function mathDistrict(i) {
    const y = YEARS[S.h], e = enr('d', i), pc = chgPct('d', i), id = val('d', i, 'id');
    const w = DW[id] || [[val('d', i, 'county'), 1]];
    const where = w.map(([f, x]) => { const ci = cIdx.get(f); return `${ci != null ? esc(val('c', ci, 'name')) : f} (${fx(x * 100, 0)}%${ci != null ? `, ${fmtPct(chgPct('c', ci))} children` : ''})`; }).join('; ');
    return `<details class="math"><summary>Show the math and sources</summary><ol>
      <li><b>Students now.</b> Public K–12 students, fall 2024: ${fmtN(e)}, counted by grade.<br>${srcOf('enr2024')}</li>
      <li><b>Where its students live.</b> By where its schools are: ${where}.<br>${srcOf('schdir')}</li>
      <li><b>Grade by grade.</b> Each grade's 2024 count is multiplied by the projected change in children of that grade's age in those counties, from each county's Census-based forecast (open a county to see its math). Students already enrolled move up with their class.<br>${srcOf('age25')}</li>
      <li><b>Result.</b> Projected students, fall ${y}: <span class="eq">${fmtN(e)} × (1 ${pc < 0 ? '−' : '+'} ${fx(Math.abs(pc) / 100, 3)}) = ${fmtN(e * (1 + pc / 100))}</span>, which is ${fmtPct(pc)}. In past tests, district forecasts ran high because students kept moving to charter, private and home schooling.</li>
      </ol></details>`;
  }
  function renderUS(P) {
    const UC = S.f ? M.us_chg_f : M.us_chg, h = S.h, y = YEARS[h], u = M.us, pc = UC['S' + S.s + (S.f ? 'f' : '')][h];
    const projH = u.abs[S.s * NH + h], projF = u.absf[S.s * NH + h], proj = S.f ? projF : projH, ratio = proj / u.p24;
    const da = u.drv_abs, d = { obs: da[0], births: da[1 + h], moving: da[1 + NH + h], immig: da[1 + 2 * NH + S.s * NH + h], fert: projF - projH };
    const pctOf = (v) => (v / u.p24) * 100; const dp = { obs: pctOf(d.obs), births: pctOf(d.births), moving: pctOf(d.moving), immig: pctOf(d.immig), fert: pctOf(d.fert) };
    const uc = (k, hh) => UC['S' + k + (S.f ? 'f' : '')][hh];
    const scen = [0, 1, 2].map((k) => `<span>${['Recent pace', '2025 level', 'Near zero'][k]}: <b class="${cls(uc(k, h))}">${fmtPct(uc(k, h))}</b></span>`).join('');
    const chart = lineChart([], u.enr, [0, 1, 2].map((k) => YEARS.map((_, hh) => u.enr * (1 + uc(k, hh) / 100))));
    const r = Object.entries(dp).filter(([k]) => k !== 'obs').sort((a, b) => a[1] - b[1])[0];
    P.innerHTML = `
      <div><div class="kind">Nation · ${nf.format(CT.rows.length)} counties</div><h2>United States</h2>
        <div class="sub">${fmtN(u.enr)} public K–12 students, fall 2024. Click any county or district for its own numbers.</div></div>
      <div class="blk"><h3>Enrollment outlook, fall ${y}</h3>
        <div class="big"><span class="n ${cls(pc)}">${fmtPct(pc)}</span><span class="u">${fmtStu(u.enr * pc / 100)} students if immigration ${SCEN[S.s]}</span></div>
        <div class="scen">${scen}</div>
        ${h > TESTED ? `<p class="note">${y} is beyond the 15-year range tested against real outcomes. Treat it as today's trends carried forward.</p>` : ''}
        ${chart}
        <p class="note">Dashed: projection. The shaded band spans the three immigration settings; the gray area is beyond the tested range.</p>
      </div>
      <div class="blk"><h3>What drives the change (percentage points)</h3>${barsHTML(dp, ['obs', 'births', 'moving', 'immig'].concat(S.f ? ['fert'] : []))}
        <p class="note">${r && r[1] < 0 ? `Biggest reason: <b>${REASON[r[0]]}</b>. ` : ''}Families moving is the net of people moving into and out of counties, as captured in each county's 2020–25 age ratios.</p></div>
      <div class="blk"><h3>U.S. births</h3>${birthsChartArr(u.births)}<p class="note">Census state totals. Lighter bars (2024–25) are provisional.</p></div>
      <details class="math"><summary>Show the math and sources</summary><ol>
        <li><b>Children aged 5–17 now.</b> Sum of all counties, July 2024: ${fmtN(u.p24)}. July 2025: ${fmtN(u.nc)}.<br>${srcOf('age25')}</li>
        <li><b>Each county is projected on its own and the counties are added up.</b> Each age group moves forward 5 years using that county's 2020→2025 change, with moving at half strength. Future kindergartners come from each county's ratio of young children to women aged 15–44. Open any county to see its numbers.<br>${srcOf('pep25')} ${srcOf('acsus')}</li>
        <li><b>Births.</b> U.S. births fell from ${fmtN(u.births[0])} in 2011 to ${fmtN(u.births[14])} in 2025. ${S.f ? 'Births per woman keep falling 1.4% a year, the 2007–2025 average.' : 'Births per woman are held at the 2025 level.'} <span class="src">Source: <a href="https://www.cdc.gov/nchs/data/vsrr/vsrr043.pdf" target="_blank" rel="noopener">NCHS, Births: Provisional Data for 2025</a> (fertility rate 53.1, down 23% since 2007)</span><br>${srcOf('pep20')} ${srcOf('pep25')}</li>
        <li><b>Result.</b> Projected children aged 5–17 in July ${y}: ${fmtN(proj)}. <span class="eq">${fmtN(proj)} ÷ ${fmtN(u.p24)} − 1 = ${fmtPct((ratio - 1) * 100)}</span>.
          Change in children: already under way 2024–25 ${fmtStu(d.obs)}; births &amp; aging ${fmtStu(d.births)}; families moving ${fmtStu(d.moving)}; immigration ${fmtStu(d.immig)}${S.f ? `; birth rates keep falling ${fmtStu(d.fert)}` : ''}.</li>
        <li><b>Students.</b> Each county's % change is applied to its own public K–12 students (fall 2024), and the results are added up: <span class="eq">${fmtN(u.enr)} → ${fmtN(u.enr * (1 + pc / 100))}</span> (${fmtPct(pc)}).<br>${srcOf('enr2024')}</li>
        ${h > TESTED ? `<li><b>Why project this far?</b> Nearly all parents of ${y}'s school-age children are already born; U.S. mothers' average age at first birth was 27.5 in 2023. Their numbers come from today's population. How many children they have is the uncertain part: ${S.f ? 'this setting continues the 2007–2025 decline of about 1.4% a year.' : "this setting holds each county's 2025 birth rate per woman steady."} <span class="src">Source: <a href="https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-09.pdf" target="_blank" rel="noopener">NCHS, Trends in Mean Age of Mothers, 2016–2023</a></span></li>` : ''}
      </ol></details>`;
  }
  function renderPanel() {
    cornerBox();                 // the corner follows the selection too
    const P = $('#panel');
    if (!S.sel) { renderUS(P); return; }
    const { g, i } = S.sel; const isC = g === 'c'; const y = YEARS[S.h];
    const p = chgPct(g, i), st = students(g, i), err = isC ? val('c', i, 'err') : DD.rows[i][DD.ix.err];
    const kind = isC ? `County · FIPS ${val('c', i, 'id')}` : `${TYPE[val('d', i, 'type')] || 'District'}${LOCALE[String(val('d', i, 'locale'))[0]] ? ' · ' + LOCALE[String(val('d', i, 'locale'))[0]] : ''} · NCES ${val('d', i, 'id')}`;
    const members = !isC && val('d', i, 'members') > 1 ? ` (${val('d', i, 'members')} districts combined)` : '';
    const r = mainReason(g, i);
    const scen = [0, 1, 2].map((s) => `<span>${['Recent pace', '2025 level', 'Near zero'][s]}: <b class="${cls(chgPct(g, i, s))}">${fmtPct(chgPct(g, i, s))}</b></span>`).join('');
    const cty = isC ? i : cIdx.get(val('d', i, 'county'));
    const rnim = cty != null ? val('c', cty, 'rnim') : null, rdom = cty != null ? val('c', cty, 'rdom') : null;
    const avg = (a) => (a && a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
    P.innerHTML = `
      <div><button class="ghost" data-us="1">← U.S. overview</button><div class="kind" style="margin-top:8px">${esc(kind)}</div><h2>${esc(placeName(g, i))}</h2>
        <div class="sub">${fmtN(enr(g, i))} public K–12 students, fall 2024${members}</div></div>
      <div class="blk"><h3>Enrollment outlook, fall ${y}</h3>
        <div class="big"><span class="n ${cls(p)}">${fmtPct(p)}</span><span class="u">${fmtStu(st)} students if immigration ${SCEN[S.s]}</span></div>
        <div class="scen">${scen}</div>
        ${S.h > TESTED ? `<p class="note">${YEARS[S.h]} is beyond the 15-year range tested against real outcomes, so no error estimate exists. Treat it as today's trends carried forward.</p>` : err && err[S.h] != null ? `<p class="note">Typical error for places this size in past tests: about ±${err[S.h].toFixed(0)}%.</p>` : ''}
        ${enrollChart(g, i)}
        <p class="note">Solid: actual students, all grades. Dashed: projection; the shaded band spans the three immigration settings.</p>
      </div>
      ${isC ? mathCounty(i) : mathDistrict(i)}
      <div class="blk"><h3>What drives the change (percentage points)</h3>${driverBars(g, i)}
        <p class="note">${r && r !== 'grow' ? `Biggest reason: <b>${REASON[r]}</b>.` : p != null ? 'This place is projected to grow.' : ''} Bars add up to the total change.</p></div>
      ${cty != null ? `<div class="blk"><h3>Births in ${esc(val('c', cty, 'name'))}</h3>${birthsChart(cty)}
        <div class="kv"><span>Families moving in or out, 2021–25 (per 1,000 residents/yr)</span><span class="${cls(avg(rdom))}">${fmtPts(avg(rdom))}</span>
        <span>Net immigration, 2024 → 2025 (per 1,000)</span><span>${rnim ? fmtPts(rnim[3]) + ' → ' + fmtPts(rnim[4]) : '—'}</span></div>
        <p class="note">Lighter bars (2024–25): Census applies the state's birth trend to each county.</p></div>` : ''}`;
  }

  $('#panel').addEventListener('click', (e) => { if (e.target.closest('[data-us]')) { S.sel = null; renderPanel(); renderTable(); requestDraw(); } });

  // ------------------------------------------------------------------ table
  const COLS = [
    { k: 'name', t: 'Place', get: (g, i) => placeName(g, i), fmt: (v) => esc(v), txt: true },
    { k: 'enr', t: 'Students 2024–25', get: (g, i) => enr(g, i), fmt: fmtN },
    { k: 'pct', t: 'Change by YEAR', get: (g, i) => chgPct(g, i), fmt: (v) => `<span class="${cls(v)}">${fmtPct(v)}</span>` },
    { k: 'n', t: 'Students ±', get: (g, i) => students(g, i), fmt: fmtStu },
    { k: 'drv', t: 'Biggest reason', get: (g, i) => mainReason(g, i), fmt: (v) => (v ? `<span class="chip"><i style="background:${COL.drv[v]}"></i>${REASON[v]}</span>` : '—'), txt: true },
  ];
  function tableRows() {
    const g = fam(S.geo), t = T(g), out = [];
    for (let i = 0; i < t.rows.length; i++) {
      const r = t.rows[i]; if (S.st && r[t.ix.id].slice(0, 2) !== S.st) continue; if ((r[t.ix.enr] || 0) < S.minn) continue;
      if (g === 'd') { const ty = String(r[t.ix.type]), lay = r[t.ix.layer];
        if (S.dtype === 'reg' && ty === '7') continue; if (S.dtype === 'charter' && ty !== '7') continue;
        if (S.geo === 's' ? lay !== 's' : lay === 's') continue; }
      out.push(i);
    }
    const key = S.sort || (S.mo === 'n' ? 'n' : 'pct'); const col = COLS.find((c) => c.k === key);
    const dir = S.sort ? S.dir : 1;
    out.sort((a, b) => { const va = col.get(g, a), vb = col.get(g, b); if (va == null) return 1; if (vb == null) return -1;
      return (col.txt ? String(va).localeCompare(String(vb)) : va - vb) * dir; });
    return out;
  }
  /* States, summed from their counties. The map has always let you filter to
     one state; this answers the question that filter cannot -- which states are
     hit hardest -- without a second data file, because a state is only ever the
     sum of its counties. */
  const ST_ROWS = (() => {
    const by = new Map();
    CT.rows.forEach((r, i) => {
      const st = (r[CT.ix.id] || '').slice(0, 2);
      if (!st) return;
      const o = by.get(st) || { st, idx: [], enr: 0 };
      o.idx.push(i); o.enr += r[CT.ix.enr] || 0; by.set(st, o);
    });
    return [...by.values()].sort((a, b) => a.st.localeCompare(b.st));
  })();
  const stPct = (o, s = S.s, h = S.h) => {
    let base = 0, end = 0;
    for (const i of o.idx) {
      const e = CT.rows[i][CT.ix.enr] || 0, p = chgPct('c', i, s, h);
      if (!e) continue;
      base += e; end += e * (1 + (p == null ? 0 : p) / 100);
    }
    return base ? (end / base - 1) * 100 : null;
  };
  const stShrink = (o) => o.idx.filter((i) => (chgPct('c', i) || 0) < 0).length;

  const SCOLS = [
    { k: 'name', t: 'State', get: (o) => stName[o.st] || o.st, fmt: (v) => esc(v), txt: true },
    { k: 'enr', t: 'Students 2024-25', get: (o) => o.enr, fmt: fmtN },
    { k: 'pct', t: 'Change by YEAR', get: (o) => stPct(o), fmt: (v) => `<span class="${cls(v)}">${fmtPct(v)}</span>` },
    { k: 'n', t: 'Students ±', get: (o) => { const p = stPct(o); return p == null ? null : o.enr * p / 100; }, fmt: fmtStu },
    { k: 'drv', t: 'Counties shrinking', get: (o) => stShrink(o), fmt: (v, o) => `${v} of ${o.idx.length}`, txt: true },
  ];

  function renderStates() {
    const y = YEARS[S.h];
    const key = S.sort || 'pct';
    const col = SCOLS.find((c) => c.k === key) || SCOLS[2];
    const dir = S.sort ? S.dir : 1;
    const rows = ST_ROWS.slice().sort((a, b) => {
      const x = col.get(a), z = col.get(b);
      if (col.txt) return dir * String(x).localeCompare(String(z));
      return dir * ((x == null ? 1e18 : x) - (z == null ? 1e18 : z));
    });
    $('#rank-title').textContent = `States, hardest hit by ${y}`;
    $('#rank-note').textContent = `All ${rows.length} states and territories with counties in the forecast, summed from their counties. Immigration ${SCEN[S.s]}. Click a column to sort.`;
    $('#typewrap').hidden = true;
    $('#minnwrap').hidden = true;
    $('#tbl thead').innerHTML = '<tr>' + SCOLS.map((c) => `<th data-k="${c.k}"${c.k === key ? ` aria-sort="${dir > 0 ? 'ascending' : 'descending'}"` : ''}>${c.t.replace('YEAR', y)}</th>`).join('') + '</tr>';
    $('#tbl tbody').innerHTML = rows.map((o) => '<tr>' + SCOLS.map((c) => `<td>${c.fmt(c.get(o), o)}</td>`).join('') + '</tr>').join('');
    $('#more').hidden = true;
  }

  function renderTable() {
    if (S.scope === 'st') return renderStates();
    const g = fam(S.geo), rows = tableRows(), y = YEARS[S.h];
    const key = S.sort || (S.mo === 'n' ? 'n' : 'pct');
    $('#rank-title').textContent = `Most affected by ${y}`;
    $('#rank-note').textContent = `${nf.format(rows.length)} ${g === 'c' ? 'counties' : 'districts'}${S.st ? ' in ' + stName[S.st] : ''}. Immigration ${SCEN[S.s]}. Click a column to sort; click a row to see it on the map.`;
    $('#typewrap').hidden = g === 'c';
    $('#minnwrap').hidden = false;
    $('#tbl thead').innerHTML = '<tr>' + COLS.map((c) => `<th data-k="${c.k}"${c.k === key ? ` aria-sort="${(S.sort ? S.dir : 1) > 0 ? 'ascending' : 'descending'}"` : ''}>${c.t.replace('YEAR', y)}</th>`).join('') + '</tr>';
    $('#tbl tbody').innerHTML = rows.slice(0, S.shown).map((i) => `<tr data-i="${i}"${S.sel && S.sel.g === g && S.sel.i === i ? ' aria-selected="true"' : ''}>` +
      COLS.map((c) => `<td>${c.fmt(c.get(g, i))}</td>`).join('') + '</tr>').join('');
    $('#more').hidden = rows.length <= S.shown;
  }
  $('#tbl thead').addEventListener('click', (e) => { const th = e.target.closest('th'); if (!th) return; const k = th.dataset.k;
    if (S.sort === k) S.dir = -S.dir; else { S.sort = k; S.dir = k === 'name' ? 1 : 1; } renderTable(); });
  $('#tbl tbody').addEventListener('click', (e) => { const tr = e.target.closest('tr'); if (!tr) return; select(fam(S.geo), +tr.dataset.i, { zoom: true }); });
  $('#more').addEventListener('click', () => { S.shown += 50; renderTable(); });
  $('#scope').addEventListener('click', (e) => {
    const b = e.target.closest('[data-scope]'); if (!b) return;
    S.scope = b.dataset.scope; S.sort = null;
    $('#scope').querySelectorAll('[data-scope]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.scope === S.scope ? 'true' : 'false'));
    renderTable();
  });
  $('#copy').addEventListener('click', async () => {
    const g = fam(S.geo), rows = tableRows(), y = YEARS[S.h];
    const head = ['id', 'place', 'students_2024', `pct_change_${y}`, `students_change_${y}`, 'biggest_reason'];
    const q = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
    const csv = [head.join(',')].concat(rows.map((i) => [val(g, i, 'id'), placeName(g, i), enr(g, i), chgPct(g, i), students(g, i) == null ? '' : Math.round(students(g, i)),
      REASON[mainReason(g, i)] || ''].map(q).join(','))).join('\n');
    const btn = $('#copy');
    try { await navigator.clipboard.writeText(csv); btn.textContent = `Copied ${nf.format(rows.length)} rows`; }
    catch (err) { const ta = document.createElement('textarea'); ta.value = csv; ta.style.cssText = 'width:100%;height:120px'; btn.after(ta); ta.select(); btn.textContent = 'Select all and copy'; }
    setTimeout(() => { btn.textContent = 'Copy table as CSV'; }, 2600);
  });

  // ------------------------------------------------------------------ method section
  function renderMethod() {
    const bt = M.backtest, cb = bt.county, db = bt.district, b = M.bench, rho = M.rho;
    const row = (lab, s, extra = '') => `<tr><td>${lab}</td><td>${s.medAPE.toFixed(1)}%</td><td>${s.beat0 != null && lab !== 'Assume no change' ? s.beat0.toFixed(0) + '%' : '—'}</td><td>${fmtPct(s.nat)}</td>${extra}</tr>`;
    const cty = ['15y', '10y', '5y'].map((w) => `<tr><th colspan="4" style="text-align:left">${{ '15y': '15 years (2005 → 2020)', '10y': '10 years (2010 → 2020)', '5y': '5 years (2015 → 2020)*' }[w]}</th></tr>` +
      row('This map\'s method', cb[w].primary) + row('Average with no change', cb[w]['avg-50/50']) + row('Assume no change', cb[w]['no-change'])).join('');
    const dis = ['2009->2019', '2009->2024'].map((w) => `<tr><th colspan="4" style="text-align:left">${w === '2009->2019' ? '10 years (fall 2009 → 2019)' : '15 years (fall 2009 → 2024)'}</th></tr>` +
      row('This map\'s method', db[w].pure) + row('Average with no change', db[w].averaged) + row('Assume no change', db[w]['no-change'])).join('');
    const src = { age25: 'Census county population by single year of age, Vintage 2025', pep25: 'Census county births and migration, Vintage 2025',
      pep20: 'Census county births, Vintage 2020', bt00: 'Census intercensal county ages, 2000–2010 (backtest)', bt10: 'Census intercensal county ages, 2010–2020 (backtest)',
      enr2009: 'NCES Common Core of Data via Urban Institute: district enrollment by grade, 2009–10', enr2019: '… 2019–20', enr2024: '… 2024–25',
      leadir: 'NCES district directory via Urban Institute', schdir: 'NCES school directory via Urban Institute', nces2425: 'NCES district membership 2024–25 (cross-check)',
      acsus: 'Census ACS 2020–24: movers from abroad by age (U.S.)',
      geo_county: 'Census 2025 county boundaries', geo_unsd: 'Census 2025 unified school district boundaries', geo_elsd: 'Census 2025 elementary district boundaries',
      geo_scsd: 'Census 2025 secondary district boundaries', wiche: 'WICHE Knocking at the College Door, 11th ed. (benchmark)' };
    $('#method').innerHTML = `
      <article class="card"><h2>How the outlook is built</h2><p>Open any county or district and choose <b>Show the math and sources</b> to see its own numbers at each step, with links to the source files.</p><ol>
        <li>Start with Census counts of children and adults by age in every county for July 2020 and July 2025.</li>
        <li>Move each age group forward five years at a time using how that county's age groups changed from 2020 to 2025. This picks up deaths, families moving and immigration. Small counties are blended with their state. Moving trends are assumed to continue at half strength, which tested best.</li>
        <li>Future kindergartners come from each county's ratio of young children to women aged 15–44 in 2025, so fewer young adults means fewer births.</li>
        <li>Immigration: the 2020–25 figures include the 2022–24 surge. The three settings scale that inflow to its 2021–25 pace (100%), the 2025 level (${(rho.S1 * 100).toFixed(0)}%) or Census's near-zero 2026 figure (${(rho.S2 * 100).toFixed(0)}%). Places that drew more newcomers feel the change most.</li>
        <li>Districts: each grade in each district follows the projected change in children of that age in the counties where its schools sit. Its current grade sizes carry forward, so a district with small early grades shrinks sooner.</li>
        <li>Public schools keep today's share of children. Shifts to charter, private or home schooling are not modeled.</li>
        <li>Births: by default, births per woman keep falling about 1.4% a year, continuing the national decline: the U.S. fertility rate fell 23% from 2007 to 2025 (<a href="https://www.cdc.gov/nchs/data/vsrr/vsrr043.pdf" target="_blank" rel="noopener">NCHS</a>). This extends the trend; nobody knows how long the decline will last. The "stay at the 2025 rate" setting holds each county's 2025 births per woman instead; that is the version tested against real outcomes.</li>
        <li>2045–2055: nearly all of the future parents are already born (U.S. mothers' average age at first birth was 27.5 in 2023, <a href="https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-09.pdf" target="_blank" rel="noopener">NCHS</a>). The uncertain part is how many children each will have, which is held at 2025 rates. Accuracy tests only reach 15 years (2040), so later years are marked "beyond tested range."</li></ol>
        <p class="note">Enrollment is graded K–12 from NCES, fall 2024. Virtual schools are left out of county totals. Covers the 50 states and D.C.; Puerto Rico and the territories are not in the Census county series used here.</p></article>
      <article class="card"><h2>How accurate is it?</h2>
        <p>Each method was run on old data and scored against what actually happened. Figures are median error for each place; "beats" is the share of places where the method did better than assuming no change.</p>
        <h3>Counties, children aged 5–14</h3><div class="acc"><table><thead><tr><th>Method</th><th>Median error</th><th>Beats no change</th><th>U.S. total error</th></tr></thead><tbody>${cty}</tbody></table></div>
        <p class="note">*The 5-year test is not clean: its 2015 starting figures were revised using the 2020 Census.</p>
        <h3>School districts, K–12 enrollment</h3><div class="acc"><table><thead><tr><th>Method</th><th>Median error</th><th>Beats no change</th><th>U.S. total error</th></tr></thead><tbody>${dis}</tbody></table></div>
        <div class="warnbox"><p><b>Where it falls short.</b> District forecasts are rough: typical error is about 15% at 15 years, and past forecasts ran high nationally because families kept shifting to charter, private and home schooling. Treat a district's number as demographic pressure, not a promise. Against WICHE's state projections this map agrees on direction (r = ${b['grades 2-12 to 2030'].r.toFixed(2)} to 2030) but shows larger declines in fast-growing states (median state 12th grade by 2040: ${fmtPct(b['grade 12 to 2040'].ours_median)} here vs ${fmtPct(b['grade 12 to 2040'].wiche_median)} WICHE).</p></div>
        <p class="note">Method change: the plan first chose "average with no change." Checks showed it halves declines that are nearly certain because the children are already born, so it was replaced by the method above, which tested best on the clean 10- and 15-year windows.</p></article>
      <article class="card"><h2>Sources and related work</h2>
        <div class="srcs">${M.sources.map((s) => `<span>${esc(src[s.id] || s.id)} · <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url.replace(/^https?:\/\//, '').split('/')[0])}</a> · fetched ${s.fetched}</span>`).join('')}</div>
        <ul>
          <li><a href="https://gettingdowntofacts.com/reports/ineffective-responses-shrinking-enrollment-pressures-demographic-change-californias-schools" target="_blank" rel="noopener">Getting Down to Facts III: responses to shrinking enrollment in California (2026)</a></li>
          <li><a href="https://bellwether.org/publications/systems-under-strain/" target="_blank" rel="noopener">Bellwether, Systems Under Strain (2025)</a></li>
          <li><a href="https://purl.stanford.edu/sb152xr1685" target="_blank" rel="noopener">Big Local News and Thomas Dee: where the missing students went</a></li>
          <li><a href="https://experience.arcgis.com/experience/7fb99fb05b4c4fb6a19e70d7b827d9d2/" target="_blank" rel="noopener">California Department of Finance district projections</a></li></ul></article>`;
    const CONTACT = [['LinkedIn', 'https://www.linkedin.com/in/jamesfloydl/'], ['X', 'https://x.com/jamesfloydswrld']];
    $('#foot').innerHTML = `Built ${M.built}. Not affiliated with the Census Bureau or NCES. Spot an error? Message James Floyd on ${CONTACT.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' or ')}.`;
  }

  // ------------------------------------------------------------------ controls + selection
  function select(g, i, opt = {}) {
    S.sel = { g, i }; renderPanel(); renderTable(); requestDraw();
    if (opt.zoom) { if (fam(S.geo) !== g) setGeo(g === 'c' ? 'c' : (val('d', i, 'layer') === 's' ? 's' : 'd'));
      const f = getLayer(S.geo).byI.get(i); if (f) zoomToBox(f.b, 0.3); }
  }
  function setGeo(g) { S.geo = g; $('#geo').value = g; S.hover = null; S.shown = 50; getLayer(g); refresh(); }
  function refresh() { readColors(); legend(); headline(); renderTable(); renderPanel(); requestDraw(); }
  $('#geo').addEventListener('change', (e) => setGeo(e.target.value));
  $('#horizon').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; S.h = +b.dataset.h;
    $('#horizon').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); refresh(); });
  $('#scen').addEventListener('change', (e) => { S.s = +e.target.value; refresh(); });
  $('#fert').addEventListener('change', (e) => { S.f = +e.target.value; refresh(); });
  $('#metric-o').addEventListener('change', (e) => { S.mo = e.target.value; S.sort = null; refresh(); });
  $('#minn').addEventListener('change', (e) => { S.minn = +e.target.value; S.shown = 50; renderTable(); });
  $('#dtype').addEventListener('change', (e) => { S.dtype = e.target.value; S.shown = 50; renderTable(); });
  const stSel = $('#state');
  Object.keys(stName).sort((a, b) => stName[a].localeCompare(stName[b])).forEach((f) => { const o = document.createElement('option'); o.value = f; o.textContent = stName[f]; stSel.append(o); });
  stSel.addEventListener('change', (e) => { S.st = e.target.value; S.shown = 50; if (S.st) zoomToBox(stateBox[S.st], 0.06); else { view = home; } refresh(); });
  $('#reset').addEventListener('click', () => { S.st = ''; stSel.value = ''; view = home; refresh(); });

  // search
  let SEARCH = null; const q = $('#q'), qres = $('#qres'); let qhits = [], qsel = -1;
  function buildSearch() { SEARCH = []; CT.rows.forEach((r, i) => SEARCH.push({ g: 'c', i, t: placeName('c', i), l: placeName('c', i).toLowerCase(), e: r[CT.ix.enr] || 0 }));
    DT.rows.forEach((r, i) => SEARCH.push({ g: 'd', i, t: placeName('d', i), l: placeName('d', i).toLowerCase(), e: r[DT.ix.enr] || 0 })); }
  function runSearch() {
    const s = q.value.trim().toLowerCase(); if (!SEARCH) buildSearch();
    if (s.length < 2) { qres.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    const pre = [], mid = []; for (const x of SEARCH) { const k = x.l.indexOf(s); if (k === 0) pre.push(x); else if (k > 0) mid.push(x); }
    const by = (a, b) => b.e - a.e; qhits = pre.sort(by).concat(mid.sort(by)).slice(0, 8); qsel = qhits.length ? 0 : -1;
    qres.innerHTML = qhits.map((x, n) => `<li role="option" data-n="${n}" aria-selected="${n === qsel}">${esc(x.t)} <small>${x.g === 'c' ? 'county' : 'district'} · ${fmtN(x.e)} students</small></li>`).join('') || '<li>No matches</li>';
    qres.hidden = false; q.setAttribute('aria-expanded', 'true');
  }
  function pick(n) { const x = qhits[n]; if (!x) return; q.value = x.t; qres.hidden = true; q.setAttribute('aria-expanded', 'false'); select(x.g, x.i, { zoom: true }); }
  q.addEventListener('input', runSearch);
  q.addEventListener('keydown', (e) => { if (qres.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); qsel = Math.max(0, Math.min(qhits.length - 1, qsel + (e.key === 'ArrowDown' ? 1 : -1)));
      qres.querySelectorAll('li').forEach((li, n) => li.setAttribute('aria-selected', String(n === qsel))); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(qsel); } else if (e.key === 'Escape') { qres.hidden = true; } });
  qres.addEventListener('mousedown', (e) => { const li = e.target.closest('li[data-n]'); if (li) { e.preventDefault(); pick(+li.dataset.n); } });
  q.addEventListener('blur', () => setTimeout(() => { qres.hidden = true; }, 150));

  // theme changes repaint the canvas
  const repaint = () => { readColors(); legend(); renderTable(); requestDraw(); };
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('resize', () => { setBleed(); clearTimeout(window.__rz); window.__rz = setTimeout(resize, 120); });
  setBleed();

  // ------------------------------------------------------------------ boot
  readColors(); buildStates(); renderMethod();
  S.sel = null;   // default panel = national overview
  refresh(); resize();
  window.SOM_APP = { S, M, colorFor, valueFor, chgPct, students, drivers, mainReason, select, setGeo, placeName, getLayer,
    setHorizon: (h) => $('#horizon').querySelectorAll('button')[h].click(), cIdx, dIdx,
    view: () => view };   // for verify/browser_check.js: the zoom level
})();
