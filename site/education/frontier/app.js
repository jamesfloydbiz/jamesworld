/* Education Frontier Map — canvas world map with logo pins.
   Data: window.FM (data.js). Shapes: window.WL_GEO (Equal Earth, metres), shared with US vs World. */
(function () {
  'use strict';
  const FM = window.FM, TOPO = window.WL_GEO;
  const $ = (s) => document.querySelector(s);
  const cv = $('#map'), ctx = cv.getContext('2d');

  // ── projection: Equal Earth, same metres the shapes were written in ─────────
  const R = 6371008.7714, A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
  function proj(lon, lat) {
    const l = lon * Math.PI / 180, th = Math.asin(M * Math.sin(lat * Math.PI / 180)), t2 = th * th, t6 = t2 * t2 * t2;
    return [R * 2 * Math.sqrt(3) * l * Math.cos(th) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1)),
            R * th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))];
  }

  // ── shapes ──────────────────────────────────────────────────────────────────
  const fc = topojson.feature(TOPO, TOPO.objects.countries);
  // Each outer ring is its own path: one shared path let a date-line ring cancel Mexico's fill. A ring that crosses the
  // date line is split at the jumps and each piece closed along the map edge (same fix as US vs World).
  function ringParts(ring) {
    const n0 = ring.length, same = n0 > 1 && ring[0][0] === ring[n0 - 1][0] && ring[0][1] === ring[n0 - 1][1], pts = same ? ring.slice(0, -1) : ring, n = pts.length;
    const jumps = []; for (let i = 0; i < n; i++) if (Math.abs(pts[i][0] - pts[(i + n - 1) % n][0]) > 1e7) jumps.push(i);
    if (!jumps.length) return [pts];
    return jumps.map((st, j) => { const e = jumps[(j + 1) % jumps.length], part = []; for (let i = st; part.length < n && (i !== e || !part.length); i = (i + 1) % n) part.push(pts[i]); return part; });
  }
  const shapes = [];
  const BB = [Infinity, Infinity, -Infinity, -Infinity];
  for (const f of fc.features) {
    const g = f.geometry; if (!g || f.id === '010') continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) for (const part of ringParts(poly[0])) {
      const p = new Path2D(); part.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); shapes.push(p);
    }
  }
  // frame the inhabited world, not the polar seas
  { BB[0] = proj(-180, 0)[0]; BB[2] = proj(180, 0)[0]; BB[1] = proj(0, -56)[1]; BB[3] = proj(0, 80)[1]; }
  const ITEMS = FM.items.filter((d) => d.lat != null && d.lon != null);
  for (const d of ITEMS) {
    const p = proj(d.lon, d.lat); d.mx = p[0]; d.my = p[1];
    if (d.logo) { d.img = new Image(); d.img.onload = () => draw(); d.img.src = d.logo; }
  }
  const LAYERS = FM.layers; // [{key,label,color}]
  const layerOf = Object.fromEntries(LAYERS.map((l) => [l.key, l]));

  // ── state ───────────────────────────────────────────────────────────────────
  const S = { layers: new Set(LAYERS.map((l) => l.key)), cat: 'all', age: 'all', sel: null, hover: null, q: '' };
  let W = 0, H = 0, dpr = 1, k = 1, tx = 0, ty = 0, k0 = 1;
  const visible = () => ITEMS.filter((d) => S.layers.has(d.layer) && (S.cat === 'all' || d.category === S.cat) &&
    (S.age === 'all' || d.layer === 'study' || d.layer === 'voice' || (S.age === 'inc') === !!d.inc) &&
    (!S.q || (d.name + ' ' + (d.city || '') + ' ' + d.category).toLowerCase().includes(S.q)));

  function fit() {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const bw = BB[2] - BB[0], bh = BB[3] - BB[1];
    k0 = Math.min(W / bw, H / bh) * 0.98;
  }
  function home() {
    k = k0; tx = W / 2 - k * (BB[0] + BB[2]) / 2; ty = H / 2 + k * (BB[1] + BB[3]) / 2;
    if (W / H < 1.4) { // tall phone frame: fill the height, centre on the Atlantic, let the Pacific crop
      k = H / (BB[3] - BB[1]) * 0.98; const c = proj(-35, 0); tx = W / 2 - k * c[0]; ty = H / 2 + k * (BB[1] + BB[3]) / 2; }
  }
  const sx = (x) => tx + k * x, sy = (y) => ty - k * y;

  // ── pin layout: anchor at HQ, push apart where pins overlap, leader line home ─
  function radius(d) { if (d.cluster) return Math.min(30, 13 + Math.sqrt(d.members.length) * 2.6); const z = Math.min(1.6, 0.85 + 0.25 * Math.log2(k / k0 + 1)); return (d.layer === 'study' || d.layer === 'voice' ? 7 : 14) * z * (W < 600 ? 0.85 : 1); }
  function layout(list) {
    for (const d of list) { d.ax = sx(d.mx); d.ay = sy(d.my); if (d.px == null || d._k !== k) { d.px = d.ax; d.py = d.ay; } d.r = radius(d); d._k = k; }
    // jitter identical anchors so they can separate
    const seen = {};
    for (const d of list) { const key = Math.round(d.ax) + ',' + Math.round(d.ay); const n = seen[key] = (seen[key] || 0) + 1; if (n > 1) { const a = n * 2.4; d.px += Math.cos(a) * 2; d.py += Math.sin(a) * 2; } }
    for (let it = 0; it < 90; it++) {
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j], dx = b.px - a.px, dy = b.py - a.py, min = a.r + b.r + 2, d2 = dx * dx + dy * dy;
          if (d2 < min * min) { const dist = Math.sqrt(d2) || 0.01, push = (min - dist) / 2, ux = dx / dist, uy = dy / dist; a.px -= ux * push; a.py -= uy * push; b.px += ux * push; b.py += uy * push; }
        }
      }
      for (const d of list) { d.px += (d.ax - d.px) * 0.04; d.py += (d.ay - d.py) * 0.04; }
    }
  }

  // ── clusters: at low zoom, 4+ pins inside one small circle collapse into a count ─
  const CL = new Map();
  function nodes(list) {
    if (k > k0 * 14 || list.length < 8) return list;
    const CR = W < 600 ? 30 : 36;
    for (const d of list) { d.ax = sx(d.mx); d.ay = sy(d.my); }
    const near = (a, b) => Math.hypot(a.ax - b.ax, a.ay - b.ay) < CR;
    const dens = new Map(list.map((d) => [d, list.filter((o) => near(d, o)).length]));
    const order = list.slice().sort((a, b) => dens.get(b) - dens.get(a)), used = new Set(S.sel ? [S.sel] : []), out = [];
    for (const seed of order) {
      if (used.has(seed)) continue;
      const g = list.filter((o) => !used.has(o) && near(seed, o));
      if (g.length >= 4) {
        g.forEach((o) => used.add(o));
        const key = g.map((o) => o.id).sort().join('|');
        let c = CL.get(key);
        if (!c) { c = { cluster: true, id: 'cl:' + key, members: g, layer: 'cluster', name: g.length + ' here' }; CL.set(key, c); }
        c.mx = g.reduce((t, o) => t + o.mx, 0) / g.length; c.my = g.reduce((t, o) => t + o.my, 0) / g.length;
        out.push(c);
      }
    }
    for (const d of list) if (!used.has(d) || d === S.sel) out.push(d);
    return out;
  }

  // ── draw ────────────────────────────────────────────────────────────────────
  let shown = [];
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(tx, ty); ctx.scale(k, -k);
    ctx.fillStyle = 'hsl(0 0% 14%)'; ctx.lineWidth = 0.6 / k; ctx.strokeStyle = 'hsl(0 0% 24%)';
    for (const p of shapes) { ctx.fill(p); ctx.stroke(p); }
    ctx.restore();

    shown = nodes(visible()); layout(shown);
    // leader lines + anchor dots
    for (const d of shown) {
      const moved = Math.hypot(d.px - d.ax, d.py - d.ay) > d.r * 0.6;
      ctx.fillStyle = 'hsl(0 0% 100% / 0.55)';
      if (moved) {
        ctx.strokeStyle = 'hsl(0 0% 100% / 0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(d.ax, d.ay); ctx.lineTo(d.px, d.py); ctx.stroke();
        ctx.beginPath(); ctx.arc(d.ax, d.ay, 1.6, 0, 7); ctx.fill();
      }
    }
    // pins, selected/hovered last so they sit on top
    const order = shown.slice().sort((a, b) => (a === S.sel || a === S.hover) - (b === S.sel || b === S.hover));
    for (const d of order) pin(d);
  }
  function pin(d) {
    const L = layerOf[d.layer], hot = d === S.sel || d === S.hover, r = d.r * (hot ? 1.25 : 1);
    ctx.save();
    if (d.cluster) {
      ctx.beginPath(); ctx.arc(d.px, d.py, r, 0, 7); ctx.fillStyle = 'hsl(0 0% 8%)'; ctx.fill();
      const cnt = {}; d.members.forEach((m) => cnt[m.layer] = (cnt[m.layer] || 0) + 1);
      let a0 = -Math.PI / 2; ctx.lineWidth = hot ? 4 : 3;
      for (const L2 of LAYERS) { const n = cnt[L2.key]; if (!n) continue; const a1 = a0 + 2 * Math.PI * n / d.members.length;
        ctx.beginPath(); ctx.arc(d.px, d.py, r - 1.5, a0, a1); ctx.strokeStyle = L2.color; ctx.stroke(); a0 = a1; }
      ctx.fillStyle = '#fff'; ctx.font = `400 ${Math.round(r * 0.62)}px "DM Mono", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(d.members.length, d.px, d.py + 1); ctx.restore(); return;
    }
    if (d.layer === 'study') {
      ctx.translate(d.px, d.py); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = L.color; ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
      if (hot) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6); }
      ctx.restore(); return;
    }
    if (d.layer === 'voice') {
      ctx.beginPath(); ctx.arc(d.px, d.py, r, 0, 7); ctx.fillStyle = L.color; ctx.fill();
      if (hot) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.restore(); return;
    }
    ctx.beginPath(); ctx.arc(d.px, d.py, r, 0, 7);
    ctx.fillStyle = d.dark ? '#111' : '#f4f1ea'; ctx.fill();
    ctx.lineWidth = hot ? 3 : 2; ctx.strokeStyle = hot ? '#fff' : L.color; ctx.stroke();
    if (d.status === 'closed' || d.status === 'struggling') { ctx.setLineDash([3, 3]); ctx.strokeStyle = 'hsl(0 60% 60%)'; ctx.stroke(); ctx.setLineDash([]); }
    ctx.beginPath(); ctx.arc(d.px, d.py, r - 2, 0, 7); ctx.clip();
    if (d.img && d.img.complete && d.img.naturalWidth) {
      const s = (r - 2) * 2 * 0.78, iw = d.img.naturalWidth, ih = d.img.naturalHeight, f = s / Math.max(iw, ih);
      ctx.drawImage(d.img, d.px - iw * f / 2, d.py - ih * f / 2, iw * f, ih * f);
    } else {
      ctx.fillStyle = '#222'; ctx.font = `600 ${Math.round(r * 0.8)}px "DM Mono", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(d.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2), d.px, d.py + 1);
    }
    ctx.restore();
  }

  // ── interaction ─────────────────────────────────────────────────────────────
  function hit(x, y) { let best = null, bd = Infinity; for (const d of shown) { const dd = Math.hypot(d.px - x, d.py - y); if (dd <= d.r + 3 && dd < bd) { bd = dd; best = d; } } return best; }
  const tip = $('#tip');
  function showTip(d, x, y) {
    if (!d) { tip.hidden = true; return; }
    tip.innerHTML = d.cluster ? `<b>${d.members.length} pins</b><span>${esc(d.members.slice(0, 7).map((m) => m.name).join(', '))}${d.members.length > 7 ? '…' : ''}<br>Click to zoom in</span>`
      : `<b>${esc(d.name)}</b><span>${esc(d.category)} · ${esc(d.city || '')}</span>`;
    tip.hidden = false;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    tip.style.left = Math.min(W - tw - 8, Math.max(8, x + 14)) + 'px'; tip.style.top = Math.max(8, y - th - 10) + 'px';
  }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let drag = null, moved = false;
  cv.addEventListener('pointerdown', (e) => { cv.dataset.zoomed = '1'; drag = { x: e.clientX, y: e.clientY, tx, ty }; moved = false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (moved) { tx = drag.tx + dx; ty = drag.ty + dy; for (const d of shown) { d.px += 0; } draw(); showTip(null); return; }
    }
    const d = hit(x, y); if (d !== S.hover) { S.hover = d; draw(); }
    cv.style.cursor = d ? 'pointer' : 'grab'; showTip(d, x, y);
  });
  cv.addEventListener('pointerup', (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (!moved) {
      const d = hit(x, y); select(d);
      if (d && !d.cluster && !panel.hidden) { // a pin the panel just covered slides into view
        const p = panel.getBoundingClientRect(), m = cv.getBoundingClientRect(), X = m.left + d.px, Y = m.top + d.py;
        if (X > p.left - 12 && X < p.right + 12 && Y > p.top - 12 && Y < p.bottom + 12) focus(d);
      }
    }
    drag = null;
  });
  cv.addEventListener('pointerleave', () => { delete cv.dataset.zoomed; S.hover = null; showTip(null); draw(); });
  function zoomAt(x, y, f) {
    const nk = Math.max(k0 * 0.9, Math.min(k0 * 60, k * f)); f = nk / k;
    tx = x - (x - tx) * f; ty = y - (y - ty) * f; k = nk; draw();
  }
  cv.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey) && !cv.dataset.zoomed) { $('#zoomhint').classList.add('show'); clearTimeout(zoomAt.t); zoomAt.t = setTimeout(() => $('#zoomhint').classList.remove('show'), 1200); return; }
    e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0022));
  }, { passive: false });
  cv.addEventListener('dblclick', (e) => { const r = cv.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 2.2); });
  // pinch
  const touches = new Map(); let pinch = null;
  cv.addEventListener('touchstart', (e) => { if (e.touches.length === 2) { const [a, b] = e.touches; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) }; } }, { passive: true });
  cv.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinch) { e.preventDefault(); const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), r = cv.getBoundingClientRect();
      zoomAt((a.clientX + b.clientX) / 2 - r.left, (a.clientY + b.clientY) / 2 - r.top, d / pinch.d); pinch.d = d; }
  }, { passive: false });
  cv.addEventListener('touchend', () => { pinch = null; });

  $('#zin').onclick = () => zoomAt(W / 2, H / 2, 1.8);
  $('#zout').onclick = () => zoomAt(W / 2, H / 2, 1 / 1.8);
  $('#zhome').onclick = () => { home(); draw(); };

  // regions: quick jumps
  const REGIONS = { world: null, us: [-125, 24, -66, 50], bay: [-122.7, 37.2, -121.7, 38.0], europe: [-11, 35, 30, 60], asia: [65, -10, 145, 45], africa: [-20, -35, 52, 37] };
  document.querySelectorAll('[data-region]').forEach((b) => b.addEventListener('click', () => {
    const r = REGIONS[b.dataset.region]; if (!r) { home(); draw(); return; }
    const [x0, y0] = proj(r[0], r[1]), [x1, y1] = proj(r[2], r[3]);
    const xs = [x0, x1, proj(r[0], r[3])[0], proj(r[2], r[1])[0]], ys = [y0, y1];
    const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    k = Math.min(W / (maxx - minx), H / (maxy - miny)) * 0.9; tx = W / 2 - k * (minx + maxx) / 2; ty = H / 2 + k * (miny + maxy) / 2; draw();
  }));

  // ── filters ─────────────────────────────────────────────────────────────────
  // ── tabs: Companies (schools + tools) · Studies · Voices · Notes (private build only) ─
  const TABS = { companies: ['school', 'tech'], studies: ['study'], voices: ['voice'], notes: [] };
  const tabOf = (layer) => Object.keys(TABS).find((t) => TABS[t].includes(layer)) || 'companies';
  S.tab = 'companies';
  const lf = $('#layers');
  function renderChips() {   // the layer chips only matter where a tab holds more than one layer
    const ls = LAYERS.filter((l) => TABS[S.tab].includes(l.key));
    lf.innerHTML = ls.length > 1 ? ls.map((l) => `<button class="chip${S.layers.has(l.key) ? ' on' : ''}" data-layer="${l.key}" style="--c:${l.color}"><i></i>${esc(l.label)} <em>${ITEMS.filter((d) => d.layer === l.key).length}</em></button>`).join('') : '';
    lf.hidden = ls.length < 2;
  }
  lf.addEventListener('click', (e) => { const b = e.target.closest('[data-layer]'); if (!b) return; const key = b.dataset.layer;
    if (S.layers.has(key) && S.layers.size > 1) S.layers.delete(key); else S.layers.add(key); renderChips(); renderCats(); draw(); });
  function setTab(t, keepView) {
    if (!TABS[t]) return;
    S.tab = t; S.layers = new Set(TABS[t]); S.cat = 'all';
    document.querySelectorAll('.tab').forEach((b) => { const on = b.dataset.tab === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    document.querySelectorAll('section[data-tab]').forEach((sec) => sec.classList.toggle('on', sec.dataset.tab === t));
    const mapTab = t !== 'notes';
    $('#controls').hidden = !mapTab; $('#mapblock').hidden = !mapTab;
    $('#age').hidden = t !== 'companies';
    if (S.sel && tabOf(S.sel.layer) !== t) select(null);
    renderChips(); renderCats();
    if (mapTab) { if (!W) onResize(); if (!keepView) { home(); } draw(); }
  }
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    setTab(b.dataset.tab); if (history.replaceState) history.replaceState(null, '', '#' + b.dataset.tab);
  }));
  const cf = $('#cats');
  function renderCats() {
    const groups = LAYERS.filter((l) => S.layers.has(l.key)).map((l) => [l, [...new Set(ITEMS.filter((d) => d.layer === l.key).map((d) => d.category))].sort()]);
    const all = groups.flatMap(([, c]) => c);
    if (S.cat !== 'all' && !all.includes(S.cat)) S.cat = 'all';
    cf.innerHTML = `<option value="all">Every category</option>` + groups.map(([l, cats]) =>
      `<optgroup label="${esc(l.label)}">${cats.map((c) => `<option value="${esc(c)}"${S.cat === c ? ' selected' : ''}>${esc(c)} (${ITEMS.filter((d) => d.layer === l.key && d.category === c).length})</option>`).join('')}</optgroup>`).join('');
    cf.value = S.cat;
  }
  cf.addEventListener('change', () => { S.cat = cf.value; draw(); });
  $('#age').addEventListener('change', (e) => { S.age = e.target.value; draw(); });
  $('#q').addEventListener('input', (e) => { S.q = e.target.value.trim().toLowerCase(); draw(); });

  // put a pin in the part of the map the panel leaves open (left of it on wide screens, above it on phones)
  function focus(d) {
    const m = cv.getBoundingClientRect(), p = panel.hidden ? null : panel.getBoundingClientRect();
    let cx = W / 2, cy = H / 2;
    if (p && p.left - m.left > W * 0.35) cx = Math.max(40, (p.left - m.left) / 2);        // panel on the right
    else if (p && p.top - m.top > H * 0.2) cy = Math.max(30, (p.top - m.top) / 2);        // panel along the bottom
    tx = cx - k * d.mx; ty = cy + k * d.my; draw();
  }

  // ── panel ───────────────────────────────────────────────────────────────────
  const panel = $('#panel');
  function select(d) {
    if (d && d.cluster) {
      const xs = d.members.map((m) => m.mx), ys = d.members.map((m) => m.my);
      const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
      const span = Math.max(maxx - minx, (maxy - miny) * W / H, 1);
      k = Math.min(k0 * 40, Math.max(k * 2.2, W * 0.55 / span)); tx = W / 2 - k * (minx + maxx) / 2; ty = H / 2 + k * (miny + maxy) / 2;
      S.hover = null; showTip(null); draw(); return;
    }
    S.sel = d; draw();
    if (!d) { panel.hidden = true; return; }
    const card = document.getElementById('c-' + d.id);
    panel.innerHTML = `<button class="x" aria-label="Close">×</button>` + `<div class="card">${card ? card.innerHTML : `<h3>${esc(d.name)}</h3>`}</div>`;
    panel.hidden = false; panel.scrollTop = 0;
    panel.querySelector('.x').onclick = () => select(null);
    if (history.replaceState) history.replaceState(null, '', '#' + d.id);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') select(null); });
  // card list → map
  document.querySelectorAll('[data-show]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); const d = ITEMS.find((x) => x.id === a.dataset.show); if (!d) return;
    if (tabOf(d.layer) !== S.tab) setTab(tabOf(d.layer), true);
    $('#mapwrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    k = Math.max(k, k0 * 4); select(d); focus(d);
  }));

  // collapse / expand every category in one section
  document.querySelectorAll('[data-fold]').forEach((b) => b.addEventListener('click', () => {
    b.closest('section').querySelectorAll('details.group').forEach((g) => { g.open = b.dataset.fold === 'open'; });
  }));
  // a card opened from the map lives inside a category: make sure that category is open when we jump to it
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#c-"]'); if (!a) return; const el = document.getElementById(a.getAttribute('href').slice(1)); const g = el && el.closest('details'); if (g) g.open = true; });

  // ── boot ────────────────────────────────────────────────────────────────────
  function boot() { fit(); home();
    const id = location.hash.slice(1), d = id && ITEMS.find((x) => x.id === id);
    setTab(d ? tabOf(d.layer) : (TABS[id] ? id : (document.getElementById(id) && document.getElementById(id).closest('[data-tab]') ? document.getElementById(id).closest('[data-tab]').dataset.tab : 'companies')));
    if (d) { k = k0 * 4; select(d); focus(d); } }
  // Watch the canvas itself, not the window: the page can load while its pane is hidden (0×0), and a zoom
  // computed then is 0. When the map first gets a real size, start from the home view.
  function onResize() {
    const ok = W > 0 && H > 0 && isFinite(k) && k > 0 && isFinite(k0) && k0 > 0;
    const c = ok ? { x: (W / 2 - tx) / k, y: (ty - H / 2) / k } : null, rel = ok ? k / k0 : 1;
    fit(); if (!(W > 0 && H > 0)) return;
    if (!c) { home(); if (S.sel) focus(S.sel); } else { k = k0 * rel; tx = W / 2 - k * c.x; ty = H / 2 + k * c.y; }
    draw();
  }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(cv); else window.addEventListener('resize', onResize);
  boot(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1);
    if (TABS[id]) { setTab(id); return; }
    const d = ITEMS.find((x) => x.id === id); if (!d || d === S.sel) return;
    if (tabOf(d.layer) !== S.tab) setTab(tabOf(d.layer), true);
    $('#mapwrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); k = Math.max(k, k0 * 4); select(d); focus(d); });
  window.__FM = { proj, ITEMS };
})();
