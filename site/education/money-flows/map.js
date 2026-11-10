/* Follow the Money: state map (canvas). Reuses the state shapes from /education/school-outlook/.
   The shapes are already projected (Albers), so drawing is a straight scale and a y flip. */
(function () {
  'use strict';
  const ST = window.EMF_STATES, CH = window.EMF_CHOICE || { states: {} };
  const APP = window.EMF_APP, fmt = APP.fmt, NAMES = APP.STATE_NAMES;
  const $ = (s) => document.querySelector(s);
  const FIPS = { '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC',
    '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA',
    '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV',
    '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA',
    '44': 'RI', '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV',
    '55': 'WI', '56': 'WY' };
  const pct = (x) => (x == null || isNaN(x)) ? '—' : Math.round(x * 100) + '%';
  const dollars = (x) => x == null ? '—' : '$' + Math.round(x).toLocaleString('en-US');
  const rec = (c) => ST.states[c];
  const share = (c, k) => { const r = rec(c); return r && r.rev ? (r[k] || 0) / r.rev : null; };
  const choiceShare = (c) => { const r = rec(c), x = CH.states[c]; return r && x && x.choiceUSD ? x.choiceUSD / (r.rev * 1000) : (x ? 0 : null); };

  const LAYERS = [
    { id: 'ppcs', label: 'Spending per student', color: 'fed', val: (c) => (rec(c) || {}).ppcs, show: dollars,
      note: 'Day-to-day spending per public school student, FY2024 (Census).' },
    { id: 'fed', label: 'Federal share', color: 'fed', val: (c) => share(c, 'fed'), show: pct,
      note: 'Share of public school revenue from the federal government, FY2024.' },
    { id: 'state', label: 'State share', color: 'state', val: (c) => share(c, 'state'), show: pct,
      note: 'Share of public school revenue from the state, FY2024.' },
    { id: 'local', label: 'Local share', color: 'local', val: (c) => share(c, 'local'), show: pct,
      note: 'Share of public school revenue from local sources, mostly property tax, FY2024.' },
    { id: 'choice', label: 'School choice money', color: 'state', val: choiceShare, show: (x) => x == null ? 'no data' : (x * 100).toFixed(1) + '%',
      note: 'School choice program dollars as a share of public school revenue. Years differ: choice programs are the latest EdChoice count, public revenue is FY2024.' },
    { id: 'optin', label: 'Federal tax credit', cat: true,
      note: 'Whether the state has opted in to the federal tax-credit scholarship that starts January 1, 2027.' }
  ];
  const OPT = { in: ['Opted in', 'fed'], declined: ['Declined', 'state'], vetoed: ['Vetoed', 'state'], undecided: ['Undecided', null] };

  const canvas = $('#map'), ctx = canvas.getContext('2d'), tip = $('#maptip');
  let shapes = null, layer = LAYERS[0], hover = null, picked = null, W = 0, H = 0, colors = {};

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    ['fed', 'state', 'local', 'pub'].forEach((g) => { colors[g] = cs.getPropertyValue('--c-' + g).trim(); });
    colors.lo = cs.getPropertyValue('--map-lo').trim(); colors.line = '#000000';
    colors.ink = '#ffffff'; colors.none = '#2a2724';
  }
  function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
  function mix(a, b, t) { const A = hex(a), B = hex(b); return 'rgb(' + A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(',') + ')'; }

  function build() {
    const topo = window.SOM_GEO_STATES; const obj = topo.objects[Object.keys(topo.objects)[0]];
    const fc = topojson.feature(topo, obj); const bb = [Infinity, Infinity, -Infinity, -Infinity];
    shapes = fc.features.map((f) => {
      const code = FIPS[f.properties.STATEFP]; const rings = [];
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      polys.forEach((p) => p.forEach((ring) => { rings.push(ring); ring.forEach(([x, y]) => { bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.max(bb[2], x); bb[3] = Math.max(bb[3], y); }); }));
      return { code, rings };
    }).filter((s) => s.code);
    shapes.bb = bb;
  }
  function fit() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return false;
    W = r.width; H = r.height; const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const [x0, y0, x1, y1] = shapes.bb, pad = 8;
    const k = Math.min((W - pad * 2) / (x1 - x0), (H - pad * 2) / (y1 - y0));
    const ox = (W - (x1 - x0) * k) / 2, oy = (H - (y1 - y0) * k) / 2;
    shapes.forEach((s) => {
      const p = new Path2D();
      s.rings.forEach((ring) => ring.forEach(([x, y], i) => { const X = ox + (x - x0) * k, Y = oy + (y1 - y) * k; i ? p.lineTo(X, Y) : p.moveTo(X, Y); }));
      s.path = p;
    });
    return true;
  }
  function range() {
    const vals = shapes.map((s) => layer.val(s.code)).filter((v) => v != null && !isNaN(v));
    return [Math.min(...vals), Math.max(...vals)];
  }
  function fillFor(code, rg) {
    if (layer.cat) {
      const o = (CH.states[code] || {}).optin; const m = OPT[o];
      if (!m) return colors.none;
      if (!m[1]) return mix(colors.lo, colors.pub, 0.25);
      return o === 'vetoed' ? mix(colors.lo, colors[m[1]], 0.55) : colors[m[1]];
    }
    const v = layer.val(code); if (v == null || isNaN(v)) return colors.none;
    const t = rg[1] > rg[0] ? (v - rg[0]) / (rg[1] - rg[0]) : 0;
    return mix(colors.lo, colors[layer.color], 0.12 + 0.88 * t);
  }
  function draw() {
    if (!shapes || !W) return;
    ctx.clearRect(0, 0, W, H);
    const rg = layer.cat ? null : range();
    shapes.forEach((s) => { ctx.fillStyle = fillFor(s.code, rg); ctx.fill(s.path, 'evenodd'); });
    ctx.lineWidth = 0.8; ctx.strokeStyle = colors.line; shapes.forEach((s) => ctx.stroke(s.path));
    [hover, picked].forEach((c, i) => { const s = c && shapes.find((x) => x.code === c); if (s) { ctx.lineWidth = i ? 2.4 : 1.6; ctx.strokeStyle = colors.ink; ctx.stroke(s.path); } });
    legend(rg);
  }
  function legend(rg) {
    const L = $('#maplegend');
    if (layer.cat) {
      L.innerHTML = Object.entries(OPT).map(([k, m]) => `<span><i style="background:${fillFor(Object.keys(CH.states).find((c) => CH.states[c].optin === k) || 'XX', null)}"></i>${m[0]}</span>`).join('') +
        `<span class="note">${layer.note}${CH.asOf ? ' As of ' + CH.asOf + '.' : ''}</span>`;
      return;
    }
    const stops = [0, .25, .5, .75, 1].map((t) => rg[0] + (rg[1] - rg[0]) * t);
    L.innerHTML = stops.map((v) => `<span><i style="background:${mix(colors.lo, colors[layer.color], 0.12 + 0.88 * ((v - rg[0]) / ((rg[1] - rg[0]) || 1)))}"></i>${layer.show(v)}</span>`).join('') +
      `<span class="note">${layer.note}</span>`;
  }
  function at(e) {
    // isPointInPath tests in canvas pixels, which are CSS pixels times the device pixel ratio
    const r = canvas.getBoundingClientRect(), dpr = canvas.width / r.width;
    const x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr;
    const s = shapes.find((s) => ctx.isPointInPath(s.path, x, y, 'evenodd')); return s ? s.code : null;
  }
  function info(code) {
    const r = rec(code), c = CH.states[code] || {}, B = (x) => fmt((x || 0) / 1e6);
    const o = OPT[c.optin];
    $('#stateinfo').innerHTML = `<h2>${NAMES[code]}</h2>
      <p class="note">Public school money, Census ${ST.year}</p>
      <dl>
        <dt>Total revenue</dt><dd>${B(r.rev)}</dd>
        <dt>Federal</dt><dd>${B(r.fed)} · ${pct(share(code, 'fed'))}</dd>
        <dt>State</dt><dd>${B(r.state)} · ${pct(share(code, 'state'))}</dd>
        <dt>Local</dt><dd>${B(r.local)} · ${pct(share(code, 'local'))}</dd>
        <dt>Property tax</dt><dd>${B(r.locProperty)}</dd>
        <dt>Students</dt><dd>${(r.enroll || 0).toLocaleString('en-US')}</dd>
        <dt>Spent per student</dt><dd>${dollars(r.ppcs)}</dd>
        <dt>Paid to staff</dt><dd>${B((r.salaries || 0) + (r.benefits || 0))}</dd>
        <dt>Bought from outside</dt><dd>${B((r.current || 0) - (r.salaries || 0) - (r.benefits || 0))}</dd>
        <dt>School systems</dt><dd>${r.buyers ? r.buyers.systems.toLocaleString('en-US') : '—'}</dd>
        <dt>Largest system's share</dt><dd>${r.buyers && r.buyers.top[0] ? pct(r.buyers.top[0].share) : '—'}</dd>
        <dt>School choice money</dt><dd>${c.choiceUSD ? fmt(c.choiceUSD / 1e9) + (c.year ? ' (' + c.year + ')' : '') : 'none counted'}</dd>
        <dt>Federal tax credit</dt><dd>${o ? o[0] : '—'}</dd>
      </dl>
      ${r.buyers && r.buyers.top[0] ? `<p class="note">Largest: ${r.buyers.top[0].name}</p>` : ''}
      <button type="button" class="btn primary" id="openflow" style="margin-top:12px">See ${NAMES[code]} as a flowchart →</button>`;
    $('#openflow').addEventListener('click', () => APP.showArea(code));
  }
  function showTip(e, code) {
    if (!code || e.pointerType === 'touch') { tip.hidden = true; return; }
    const v = layer.cat ? ((OPT[(CH.states[code] || {}).optin] || ['No data'])[0]) : layer.show(layer.val(code));
    tip.innerHTML = `<b>${NAMES[code]}</b><div class="amt">${v}</div><div class="meta">${layer.label}</div>`;
    tip.hidden = false;
    const host = canvas.parentElement.getBoundingClientRect();
    let x = e.clientX - host.left + 14, y = e.clientY - host.top + 14;
    if (x + tip.offsetWidth > host.width) x = e.clientX - host.left - tip.offsetWidth - 14;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }

  function init() {
    readColors(); build();
    canvas.parentElement.style.position = 'relative';
    const box = $('#layers');
    box.innerHTML = LAYERS.map((l, i) => `<button type="button" data-id="${l.id}" aria-pressed="${i === 0}">${l.label}</button>`).join('');
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      layer = LAYERS.find((l) => l.id === b.dataset.id);
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      draw();
    }));
    canvas.addEventListener('pointermove', (e) => { const c = at(e); if (c !== hover) { hover = c; draw(); } showTip(e, c); });
    canvas.addEventListener('pointerleave', () => { hover = null; tip.hidden = true; draw(); });
    canvas.addEventListener('click', (e) => { const c = at(e); if (c) { picked = c; info(c); draw(); } });
    window.addEventListener('resize', () => { if (!$('#view-map').hidden && fit()) draw(); });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(() => { readColors(); draw(); });
  }
  window.EMF_MAP = { show() { if (!shapes) init(); if (fit()) draw(); } };
})();
