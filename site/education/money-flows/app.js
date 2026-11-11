/* Follow the Money: animated Sankey flowchart, no libraries.
   Data: window.EMF_STATES (Census FY2024, generated), window.EMF_CHOICE (choice programs by state),
   window.EMF_FLOWS (labels, controllers, national-only flows, story steps, stocks).
   Layout runs in abstract coordinates: "a" runs along the flow (columns), "c" runs across it.
   Wide screens draw columns left to right; narrow screens draw them top to bottom. */
(function () {
  'use strict';
  const F = window.EMF_FLOWS, ST = window.EMF_STATES, CH = window.EMF_CHOICE || { states: {} };
  const $ = (s) => document.querySelector(s);
  const SVGNS = 'http://www.w3.org/2000/svg';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const COLHEAD_DEFAULT = ['Who pays', 'Who moves it', 'Who receives it', 'What it buys'];
  let SEC = null; // the sector on screen (F.sectors[key])
  const STATE_NAMES = {
    US: 'United States', AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida',
    GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
    KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
    MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
    NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
    ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
    SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
  };
  const CONF = { high: 'Measured', medium: 'Reported', low: 'Estimate' };

  /* ---------- numbers ---------- */
  function fmt(v) {
    if (v == null || isNaN(v)) return '—';
    if (v >= 100) return '$' + Math.round(v) + 'B';
    if (v >= 10) return '$' + v.toFixed(1).replace(/\.0$/, '') + 'B';
    if (v >= 1) return '$' + v.toFixed(1) + 'B';
    if (v >= 0.001) return '$' + Math.round(v * 1000) + 'M';
    return '<$1M';
  }
  const fmtRange = (l) => (l.low != null ? fmt(l.low) + ' to ' + fmt(l.high) : '');
  const pct = (x) => Math.round(x * 100) + '%';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- model ---------- */
  const CENSUS_SRC = ST.source;
  function censusLinks(code) {
    const r = ST.states[code]; if (!r) return [];
    const B = (x) => (x || 0) / 1e6; // thousands of dollars -> billions
    const yr = ST.year, out = [];
    const add = (s, t, v, step, ctrl, why) => {
      if (v > 0.0005) out.push({ s, t, v, step, ctrl, why, year: yr, conf: 'high', src: CENSUS_SRC, pub: true });
    };
    const fedOther = B(r.fed) - B(r.fedTitle1) - B(r.fedSpecEd) - B(r.fedMeals);
    add('fedTax', 'title1', B(r.fedTitle1), 1, 'congress', 'Congress funds Title I; states pass it to districts by formulas that count children in poverty.');
    add('fedTax', 'idea', B(r.fedSpecEd), 1, 'congress', 'Federal special education grants, passed through the state education agency.');
    add('fedTax', 'meals', B(r.fedMeals), 1, 'congress', 'USDA reimburses schools for each meal served.');
    add('fedTax', 'fedOther', fedOther, 1, 'congress', 'Other federal programs, including the end of pandemic relief (ESSER), Impact Aid and direct grants.');
    const stOther = B(r.state) - B(r.stFormula) - B(r.stOnBehalf);
    add('stateTax', 'formula', B(r.stFormula), 1, 'legislature', 'State general fund money set aside for the school funding formula.');
    add('stateTax', 'onBehalf', B(r.stOnBehalf), 1, 'legislature', 'Payments the state makes for schools, mostly into teacher pension funds.');
    add('stateTax', 'stateOther', stOther, 1, 'legislature', 'Targeted state programs: special education, transportation, compensatory and others.');
    const feesOther = B(r.local) - B(r.locProperty) - B(r.locOtherTax) - B(r.locParentGov);
    add('propTax', 'localTaxes', B(r.locProperty), 1, 'localBoard', 'Property tax levied by or for the school district.');
    add('localOther', 'localTaxes', B(r.locOtherTax), 1, 'localBoard', 'Local sales, income and other taxes earmarked for schools.');
    add('localOther', 'cityCounty', B(r.locParentGov), 1, 'localBoard', 'Where schools are part of a city or county, that government funds them from its own budget.');
    add('localOther', 'feesOther', feesOther, 1, 'localBoard', 'Meal payments, fees and tuition charges, interest, rents, private gifts and money from other local governments.');
    add('formula', 'districts', B(r.stFormula), 2, 'legislature', 'A base amount per enrolled or attending student, extra weight for higher-need students, minus the expected local share. Districts get more by enrolling more students, not by applying.');
    add('onBehalf', 'districts', B(r.stOnBehalf), 2, 'legislature', 'Counted as school revenue because it pays school costs, even though the district never handles it.');
    add('stateOther', 'districts', stOther, 2, 'legislature', 'Paid for specific services or students, sometimes through grants districts apply for.');
    add('localTaxes', 'districts', B(r.locProperty) + B(r.locOtherTax), 2, 'localBoard', 'The district keeps what it levies. Richer property areas raise more per student; state formulas try to even this out.');
    add('cityCounty', 'districts', B(r.locParentGov), 2, 'localBoard', 'Transferred from the city or county budget.');
    add('feesOther', 'districts', feesOther, 2, 'localBoard', 'Collected locally by the district.');
    add('title1', 'districts', B(r.fedTitle1), 3, 'congress', 'Aimed at schools with many children from low-income families. The amount follows poverty counts.');
    add('idea', 'districts', B(r.fedSpecEd), 3, 'congress', 'Pays part of the extra cost of educating students with disabilities.');
    add('meals', 'districts', B(r.fedMeals), 3, 'congress', 'Pays for free and reduced-price meals, per meal served.');
    add('fedOther', 'districts', fedOther, 3, 'congress', 'Other federal grants to districts, some formula-based and some won by application.');
    const bought = B(r.current) - B(r.salaries) - B(r.benefits) - B(r.toCharter) - B(r.toPrivate);
    add('districts', 'salaries', B(r.salaries), 4, 'district', 'Pay for teachers and other staff, set by salary schedules and staffing decisions.');
    add('districts', 'benefits', B(r.benefits), 4, 'district', 'Health insurance, pensions and other benefits, much of it fixed by state law and labor contracts.');
    add('districts', 'bought', bought, 4, 'district', 'Everything day-to-day that is not staff pay: curriculum, software, testing, transport and food contracts, utilities, contracted services and supplies.');
    add('districts', 'toCharter', B(r.toCharter), 4, 'legislature', 'Tuition the home district must pay a charter for each resident student, at an amount set in state law. It continues in the Charter tab.');
    add('districts', 'toPrivate', B(r.toPrivate), 4, 'district', 'Mostly special education placements decided by each student\'s IEP team. It continues in the Private tab.');
    add('districts', 'capital', B(r.capital), 4, 'district', 'Construction, land and equipment, often paid with bonds that voters approve.');
    add('districts', 'debt', B(r.interest) + B(r.toOtherGov), 4, 'district', 'Interest on borrowed money and payments to other governments.');
    const gap = B(r.rev) - B(r.exp);
    if (gap > 0) add('districts', 'reserves', gap, 4, 'district', 'Revenue that came in this year but was not spent this year.');
    else if (gap < 0) add('drawdown', 'districts', -gap, 4, 'district', 'Spending above this year\'s revenue, covered by reserves and borrowing.');
    return out;
  }
  function buildModel(code, sec) {
    sec = sec || SEC;
    let links = sec.census ? censusLinks(code) : [];
    if (code === 'US' || !sec.census) links = links.concat(sec.links.map((l) => Object.assign({}, l)));
    if (code !== 'US' && sec.stateChoice) {
      const c = CH.states && CH.states[code];
      if (c && c.choiceUSD) {
        const v = c.choiceUSD / 1e9, src = (CH.source || {}).choice || '';
        links.push({ s: 'stateTax', t: 'choice', v, step: 6, ctrl: 'legislature', conf: 'medium', year: c.year || '', src,
          why: 'The legislature sets the amount per child and the program size.' });
        links.push({ s: 'choice', t: 'privateSch', v, step: 6, ctrl: 'parents', conf: 'medium', year: c.year || '', src,
          why: 'Parents choose the private school or approved provider the money goes to.' });
      }
    }
    const seen = {};
    links.forEach((l) => { l.id = l.s + '>' + l.t + (l.label ? ':' + l.label : ''); if (seen[l.id]) l.id += '#' + (seen[l.id]++); else seen[l.id] = 1; });
    return { code, links };
  }
  const NODES = Object.assign({ drawdown: { col: 1, group: 'pub', label: 'Reserves and borrowing', desc: 'Money drawn from savings or borrowed to cover spending above this year\'s revenue.' } }, F.nodes);
  const NODE_ORDER = Object.keys(NODES);
  const CTRL = F.controllers;

  /* ---------- state ---------- */
  const S = { step: 0, sector: null, area: 'US', hidePub: false, lens: 'pay', ctrlSel: null, model: null, layout: null, orient: 'h', W: 800, H: 600, colors: {}, visible: [] };
  let lastStep = 0;

  function visibleLinks() {
    const st = SEC.steps[S.step] || {};
    const explore = S.step === lastStep;
    const zoom = st.zoom || (explore && S.hidePub);
    return S.model.links.filter((l) => {
      if (zoom && l.pub) return false;
      if (st.zoom || st.lens || explore) return true;
      return l.step <= S.step + 1;
    });
  }
  // what to highlight as new in this step
  function newSet(links) {
    const st = SEC.steps[S.step] || {};
    if (S.ctrlSel) return new Set(links.filter((l) => l.ctrl === S.ctrlSel).map((l) => l.id));
    if (S.step === lastStep || st.zoom) return new Set();
    if (st.focus && st.lens) return new Set(links.filter((l) => st.focus.includes(l.s) || st.focus.includes(l.t)).map((l) => l.id));
    if (st.lens) return new Set();
    const fresh = links.filter((l) => l.step === S.step + 1);
    if (fresh.length) return new Set(fresh.map((l) => l.id));
    if (st.focus) return new Set(links.filter((l) => st.focus.includes(l.s) || st.focus.includes(l.t)).map((l) => l.id));
    return new Set();
  }

  /* ---------- layout ---------- */
  function layout(links) {
    const vert = S.orient === 'v';
    const W = S.W, H = S.H;
    const nodeT = vert ? 12 : 14;
    const gap = vert ? 8 : 12;
    const headRoom = vert ? 0 : 24;
    const N = {};
    links.forEach((l) => {
      (N[l.s] = N[l.s] || { id: l.s, in: 0, out: 0, ins: [], outs: [] }).out += l.v; N[l.s].outs.push(l);
      (N[l.t] = N[l.t] || { id: l.t, in: 0, out: 0, ins: [], outs: [] }).in += l.v; N[l.t].ins.push(l);
    });
    const ids = Object.keys(N).sort((a, b) => NODE_ORDER.indexOf(a) - NODE_ORDER.indexOf(b));
    ids.forEach((id) => { N[id].v = Math.max(N[id].in, N[id].out); N[id].col = NODES[id].col; });
    const cols = [...new Set(ids.map((id) => N[id].col))].sort();
    const alongLen = vert ? H - 40 : W;
    const acrossLen = vert ? W : H - headRoom - 6;
    const rightPad = vert ? 0 : Math.min(240, Math.max(160, W * 0.15));
    const colA = {};
    cols.forEach((c, i) => {
      // columns keep the same place in every step, so new bands grow into empty space instead of moving everything
      const t = c / 3;
      colA[c] = vert ? 20 + t * (alongLen - nodeT - 20) : t * (alongLen - nodeT - rightPad);
    });
    let k = Infinity;
    cols.forEach((c) => {
      const inCol = ids.filter((id) => N[id].col === c);
      const sum = inCol.reduce((s, id) => s + N[id].v, 0);
      k = Math.min(k, (acrossLen - gap * (inCol.length - 1)) / sum);
    });
    cols.forEach((c) => {
      const inCol = ids.filter((id) => N[id].col === c);
      const used = inCol.reduce((s, id) => s + N[id].v * k, 0) + gap * (inCol.length - 1);
      let cpos = (vert ? 0 : headRoom) + (acrossLen - used) / 2;
      inCol.forEach((id) => { N[id].a = colA[c]; N[id].c = cpos; N[id].len = N[id].v * k; cpos += N[id].len + gap; });
    });
    ids.forEach((id) => {
      const n = N[id];
      n.outs.sort((x, y) => N[x.t].c - N[y.t].c || NODE_ORDER.indexOf(x.t) - NODE_ORDER.indexOf(y.t));
      n.ins.sort((x, y) => N[x.s].c - N[y.s].c);
      let o = n.c + (n.len - n.out * k) / 2; n.outs.forEach((l) => { l._c0 = o + l.v * k / 2; o += l.v * k; });
      let p = n.c + (n.len - n.in * k) / 2; n.ins.forEach((l) => { l._c1 = p + l.v * k / 2; p += l.v * k; });
    });
    // labels: two lines each, pushed apart within a column so none overlap (leader line when moved).
    // If a column is too crowded for two lines, its labels drop to one line.
    let o;
    if (!vert) {
      const top = headRoom + 2, bottom = H - 2;
      cols.forEach((c) => {
        const inCol = ids.filter((id) => N[id].col === c).map((id) => ({ id, want: N[id].c + N[id].len / 2 }));
        inCol.sort((a, b) => a.want - b.want);
        const one = inCol.length * 31 > bottom - top;
        const LH = one ? 17 : 31;
        const lo = top + LH / 2, hi = bottom - LH / 2;
        inCol.forEach((o, i) => { o.y = Math.max(o.want, lo, i ? inCol[i - 1].y + LH : lo); });
        for (let i = inCol.length - 1; i >= 0; i--) { o = inCol[i]; o.y = Math.min(o.y, i === inCol.length - 1 ? hi : inCol[i + 1].y - LH); }
        for (let i = 0; i < inCol.length; i++) { o = inCol[i]; o.y = Math.max(o.y, i ? inCol[i - 1].y + LH : lo); }
        inCol.forEach((o) => { N[o.id].ly = o.y; N[o.id].one = one; });
      });
    }
    const L = {};
    links.forEach((l) => { L[l.id] = { a0: N[l.s].a + nodeT, c0: l._c0, a1: N[l.t].a, c1: l._c1, w: Math.max(l.v * k, 0.8) }; });
    return { N, L, k, nodeT, cols, colA };
  }

  /* ---------- drawing ---------- */
  const svg = $('#sankey'), canvas = $('#particles'), ctx = canvas.getContext('2d');
  const gHead = document.createElementNS(SVGNS, 'g'), gGlow = document.createElementNS(SVGNS, 'g'), gLinks = document.createElementNS(SVGNS, 'g'),
        gNodes = document.createElementNS(SVGNS, 'g'), gHits = document.createElementNS(SVGNS, 'g');
  svg.append(gHead, gGlow, gLinks, gNodes, gHits);
  const els = { links: {}, glows: {}, hits: {}, nodes: {} };
  let geom = { L: {}, N: {} };
  let tween = null;

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    ['fed', 'state', 'local', 'family', 'gift', 'pub', 'priv'].forEach((g) => { S.colors[g] = cs.getPropertyValue('--c-' + g).trim(); });
    Object.keys(CTRL).forEach((k) => { S.colors['k-' + k] = cs.getPropertyValue('--k-' + k).trim(); });
  }
  const nodeColor = (id) => S.colors[NODES[id].group];
  function payerOf(l) {
    let id = l.s, guard = 0;
    while (NODES[id] && NODES[id].col > 0 && guard++ < 4) { const up = S.model.links.find((x) => x.t === id); if (!up) break; id = up.s; }
    return NODES[id].group;
  }
  function linkColor(l) {
    if (S.lens === 'ctrl' && l.ctrl) return S.colors['k-' + l.ctrl];
    return S.colors[payerOf(l)] || S.colors.pub;
  }
  function pathD(g) {
    const am = (g.a0 + g.a1) / 2;
    if (S.orient === 'v') return `M${g.c0},${g.a0}C${g.c0},${am} ${g.c1},${am} ${g.c1},${g.a1}`;
    return `M${g.a0},${g.c0}C${am},${g.c0} ${am},${g.c1} ${g.a1},${g.c1}`;
  }
  function size() {
    const plot = $('#plot'); const w = plot.clientWidth || 800;
    S.orient = w < 700 ? 'v' : 'h';
    S.W = w; S.H = S.orient === 'v' ? Math.max(700, plot.clientHeight || 820) : Math.max(460, plot.clientHeight || 600);
    svg.setAttribute('viewBox', `0 0 ${S.W} ${S.H}`);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(S.W * dpr); canvas.height = Math.round(S.H * dpr);
    canvas.style.width = S.W + 'px'; canvas.style.height = S.H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function clearDrawing() {
    geom = { L: {}, N: {} }; [gGlow, gLinks, gHits, gNodes].forEach((g) => { g.textContent = ''; });
    els.links = {}; els.glows = {}; els.hits = {}; els.nodes = {};
  }

  function render(animate) {
    const links = visibleLinks();
    const lay = layout(links); S.layout = lay; S.visible = links;
    const fresh = newSet(links); S.fresh = fresh;
    const st = SEC.steps[S.step] || {};
    const focus = new Set(st.focus || []);
    const freshNodes = new Set(); links.forEach((l) => { if (fresh.has(l.id)) { freshNodes.add(l.s); freshNodes.add(l.t); } });
    svg.classList.toggle('stepping', fresh.size > 0);
    gHead.textContent = '';
    if (S.orient === 'h') {
      lay.cols.forEach((c) => {
        const t = document.createElementNS(SVGNS, 'text'); t.setAttribute('class', 'colhead');
        t.setAttribute('x', lay.colA[c]); t.setAttribute('y', 11); t.textContent = (SEC.colhead || COLHEAD_DEFAULT)[c]; gHead.append(t);
      });
    }
    const next = { L: {}, N: {} };
    const ids = new Set(links.map((l) => l.id));
    links.forEach((l) => {
      next.L[l.id] = lay.L[l.id];
      if (!els.links[l.id]) {
        const gl = document.createElementNS(SVGNS, 'path'); gl.setAttribute('class', 'glow');
        const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('class', 'link');
        const h = document.createElementNS(SVGNS, 'path'); h.setAttribute('fill', 'none'); h.setAttribute('stroke', 'transparent');
        h.style.pointerEvents = 'stroke'; h.style.cursor = 'pointer';
        h.addEventListener('pointerenter', (e) => hoverLink(l.id, e)); h.addEventListener('pointermove', moveTip);
        h.addEventListener('pointerleave', unhover); h.addEventListener('click', () => select({ link: l.id }));
        gGlow.append(gl); gLinks.append(p); gHits.append(h); els.glows[l.id] = gl; els.links[l.id] = p; els.hits[l.id] = h;
        if (!geom.L[l.id]) geom.L[l.id] = Object.assign({}, lay.L[l.id], { w: 0 });
      }
      const p = els.links[l.id];
      p.setAttribute('stroke', linkColor(l));
      p.classList.toggle('est', l.conf === 'low');
      p.classList.toggle('new', fresh.has(l.id));
      els.glows[l.id].classList.toggle('new', fresh.has(l.id));
      p.removeAttribute('stroke-dasharray');
    });
    Object.keys(els.links).forEach((id) => { if (!ids.has(id)) next.L[id] = Object.assign({}, geom.L[id], { w: 0, gone: true }); });
    Object.keys(lay.N).forEach((id) => {
      const n = lay.N[id];
      next.N[id] = { a: n.a, c: n.c, len: n.len, ly: n.ly, one: n.one };
      if (!els.nodes[id]) {
        const g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'node');
        const ln = document.createElementNS(SVGNS, 'path'); ln.setAttribute('class', 'leader');
        const r = document.createElementNS(SVGNS, 'rect'); const t = document.createElementNS(SVGNS, 'text');
        g.append(ln, r, t); gNodes.append(g); els.nodes[id] = g;
        g.addEventListener('pointerenter', (e) => hoverNode(id, e)); g.addEventListener('pointermove', moveTip);
        g.addEventListener('pointerleave', unhover); g.addEventListener('click', () => select({ node: id }));
        if (!geom.N[id]) geom.N[id] = { a: n.a, c: n.c + n.len / 2, len: 0, ly: n.ly };
      }
      const g = els.nodes[id];
      g.querySelector('rect').setAttribute('fill', nodeColor(id));
      g.classList.toggle('focus', focus.has(id) && !fresh.size);
      g.classList.toggle('new', freshNodes.has(id));
      g.classList.toggle('old', fresh.size > 0 && !freshNodes.has(id));
      g.dataset.v = n.v;
    });
    Object.keys(els.nodes).forEach((id) => { if (!lay.N[id]) next.N[id] = Object.assign({}, geom.N[id], { len: 0, gone: true }); });

    tween = { from: JSON.parse(JSON.stringify(geom)), to: next, t0: performance.now(), dur: animate && !reduceMotion.matches ? 800 : 0 };
    stepTween(performance.now());
    updateTotal(links); renderLegend(); renderChips(links); renderTable(); syncCtrlSel();
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  function stepTween(now) {
    if (!tween) return;
    const { from, to, t0, dur } = tween;
    let t = dur ? Math.min(1, (now - t0) / dur) : 1; t = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const cur = { L: {}, N: {} };
    Object.keys(to.L).forEach((id) => {
      const a = from.L[id] || to.L[id], b = to.L[id];
      const g = { a0: lerp(a.a0, b.a0, t), c0: lerp(a.c0, b.c0, t), a1: lerp(a.a1, b.a1, t), c1: lerp(a.c1, b.c1, t), w: lerp(a.w, b.w, t) };
      cur.L[id] = g;
      const d = pathD(g);
      els.links[id].setAttribute('d', d); els.links[id].setAttribute('stroke-width', Math.max(g.w, 0));
      els.glows[id].setAttribute('d', d); els.glows[id].setAttribute('stroke-width', g.w > 0.5 ? g.w + 2.5 : 0);
      els.hits[id].setAttribute('d', d); els.hits[id].setAttribute('stroke-width', Math.max(g.w, 10));
      els.hits[id].style.display = b.gone ? 'none' : '';
    });
    Object.keys(to.N).forEach((id) => {
      const a = from.N[id] || to.N[id], b = to.N[id];
      const n = { a: lerp(a.a, b.a, t), c: lerp(a.c, b.c, t), len: lerp(a.len, b.len, t), ly: b.ly == null ? null : lerp(a.ly == null ? b.ly : a.ly, b.ly, t), one: b.one };
      cur.N[id] = n; placeNode(id, n, b.gone);
    });
    geom = cur;
    if (t >= 1) {
      Object.keys(to.L).forEach((id) => { if (to.L[id].gone) { els.links[id].remove(); els.glows[id].remove(); els.hits[id].remove(); delete els.links[id]; delete els.glows[id]; delete els.hits[id]; delete geom.L[id]; } });
      Object.keys(to.N).forEach((id) => { if (to.N[id].gone) { els.nodes[id].remove(); delete els.nodes[id]; delete geom.N[id]; } });
      tween = null;
    }
  }

  function placeNode(id, n, gone) {
    const g = els.nodes[id]; const ln = g.children[0], r = g.children[1], t = g.children[2]; const T = S.layout.nodeT;
    const vert = S.orient === 'v';
    if (vert) { r.setAttribute('x', n.c); r.setAttribute('y', n.a); r.setAttribute('width', Math.max(n.len, 0.5)); r.setAttribute('height', T); }
    else { r.setAttribute('x', n.a); r.setAttribute('y', n.c); r.setAttribute('width', T); r.setAttribute('height', Math.max(n.len, 0.5)); }
    const meta = NODES[id], v = +g.dataset.v;
    t.textContent = ''; ln.setAttribute('d', '');
    if (gone) return;
    const name = document.createElementNS(SVGNS, 'tspan'); name.textContent = meta.label;
    const amt = document.createElementNS(SVGNS, 'tspan'); amt.setAttribute('class', 'amt'); amt.textContent = fmt(v);
    if (vert) {
      if (n.len < 54) return; // too narrow to label; tap for details
      const lastCol = Math.max(...S.layout.cols);
      const below = meta.col !== lastCol;
      t.setAttribute('x', n.c + 2); t.setAttribute('y', below ? n.a + T + 13 : n.a - 18);
      t.style.fontSize = '11px';
      const max = Math.floor(n.len / 6.4);
      name.textContent = meta.label.length > max ? meta.label.slice(0, Math.max(4, max - 1)) + '…' : meta.label;
      t.append(name);
      if (n.len >= 80) { amt.setAttribute('x', n.c + 2); amt.setAttribute('dy', '1.15em'); t.append(amt); }
      return;
    }
    const x = n.a + T + 7, mid = n.c + n.len / 2, y = n.ly == null ? mid : n.ly;
    t.setAttribute('x', x + (Math.abs(y - mid) > 3 ? 12 : 0));
    if (n.one) { t.setAttribute('y', y + 4); amt.textContent = ' ' + fmt(v); }
    else { t.setAttribute('y', y - 3); amt.setAttribute('x', t.getAttribute('x')); amt.setAttribute('dy', '1.2em'); }
    t.append(name, amt);
    if (Math.abs(y - mid) > 3) ln.setAttribute('d', `M${n.a + T + 1},${mid}L${x + 2},${mid}L${x + 9},${y}`);
  }

  /* ---------- particles ---------- */
  const seeds = {};
  function seedFor(id) {
    if (!seeds[id]) { const a = []; for (let i = 0; i < 40; i++) a.push([Math.random(), Math.random() - .5, .8 + Math.random() * .4]); seeds[id] = a; }
    return seeds[id];
  }
  function bez(g, t) {
    const am = (g.a0 + g.a1) / 2, u = 1 - t;
    return [u * u * u * g.a0 + 3 * u * u * t * am + 3 * u * t * t * am + t * t * t * g.a1,
            u * u * u * g.c0 + 3 * u * u * t * g.c0 + 3 * u * t * t * g.c1 + t * t * t * g.c1];
  }
  function drawParticles(now) {
    ctx.clearRect(0, 0, S.W, S.H);
    if (reduceMotion.matches || !S.visible) return;
    const vert = S.orient === 'v';
    let budget = 1000;
    const dimmed = svg.classList.contains('dim'), stepping = svg.classList.contains('stepping');
    S.visible.forEach((l) => {
      const g = geom.L[l.id]; if (!g || g.w < 0.6) return;
      const hi = els.links[l.id] && els.links[l.id].classList.contains('hi');
      const isNew = S.fresh && S.fresh.has(l.id);
      const quiet = (dimmed && !hi) || (stepping && !isNew);
      const n = Math.min(40, Math.max(1, Math.round(Math.sqrt(g.w) * (isNew ? 3 : 2))));
      const seed = seedFor(l.id);
      ctx.fillStyle = quiet ? '#ffffff' : linkColor(l);
      ctx.globalAlpha = quiet ? 0.06 : (isNew ? 1 : 0.85);
      for (let i = 0; i < n && budget > 0; i++, budget--) {
        const [p0, off, sp] = seed[i];
        const t = ((now / 4200) * sp + p0) % 1;
        const [a, c0] = bez(g, t); const c = c0 + off * g.w * 0.85;
        ctx.beginPath(); ctx.arc(vert ? c : a, vert ? a : c, g.w > 6 ? 1.8 : 1.3, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    if (tween) stepTween(now);
    if (!document.hidden && !$('#view-flow').hidden) drawParticles(now);
    requestAnimationFrame(frame);
  }

  /* ---------- hover, tooltip, detail ---------- */
  const tip = $('#tip');
  const whoHTML = (k, btn) => (k && CTRL[k] ? (btn
      ? `<button type="button" class="who whobtn" data-ctrl="${k}"><i style="background:${S.colors['k-' + k]}"></i>Decided by ${esc(CTRL[k].label)} · show all</button>`
      : `<span class="who"><i style="background:${S.colors['k-' + k]}"></i>Decided by ${esc(CTRL[k].label)}</span>`) : '');
  function linkHTML(l, big) {
    const a = NODES[l.s].label, b = NODES[l.t].label;
    return `<b>${esc(a)} → ${esc(b)}${l.label ? ' (' + esc(l.label) + ')' : ''}</b>
      <div class="amt">${fmt(l.v)} a year</div>
      ${l.low != null ? `<div class="meta">Range ${fmtRange(l)}</div>` : ''}
      ${whoHTML(l.ctrl, big)}
      <p>${esc(l.why)}</p>
      ${big && l.ctrl ? `<div class="decides"><h4>Who decides</h4><p>${esc(CTRL[l.ctrl].desc)}</p>${NODES[l.t].decides ? `<p>${esc(NODES[l.t].decides)}</p>` : ''}</div>` : ''}
      <div class="meta">${esc(l.year)} · ${CONF[l.conf] || ''}${big && l.src ? ` · <a href="${esc(l.src)}" target="_blank" rel="noopener">source</a>` : ''}</div>`;
  }
  function nodeHTML(id, big) {
    const n = S.layout.N[id], m = NODES[id];
    return `<b>${esc(m.label)}</b><div class="amt">${fmt(n.v)} a year</div><p>${esc(m.desc)}</p>
      ${n.in && n.out ? `<div class="meta">In ${fmt(n.in)} · out ${fmt(n.out)}</div>` : ''}
      ${m.decides ? (big ? `<div class="decides"><h4>Who decides</h4><p>${esc(m.decides)}</p></div>` : `<p><i>${esc(m.decides)}</i></p>`) : ''}`;
  }
  function hoverLink(id, e) {
    const l = S.visible.find((x) => x.id === id); if (!l) return;
    svg.classList.add('dim'); els.links[id] && els.links[id].classList.add('hi');
    tip.innerHTML = linkHTML(l, false); tip.hidden = false; moveTip(e);
  }
  function hoverNode(id, e) {
    if (!S.layout.N[id]) return;
    svg.classList.add('dim');
    S.visible.forEach((l) => { if ((l.s === id || l.t === id) && els.links[l.id]) els.links[l.id].classList.add('hi'); });
    tip.innerHTML = nodeHTML(id, false); tip.hidden = false; moveTip(e);
  }
  function unhover() { svg.classList.remove('dim'); Object.values(els.links).forEach((p) => p.classList.remove('hi')); tip.hidden = true; }
  function moveTip(e) {
    if (e.pointerType === 'touch') { tip.hidden = true; return; }
    const r = $('#plot').getBoundingClientRect();
    let x = e.clientX - r.left + 16, y = e.clientY - r.top + 16;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > r.width) x = Math.max(0, e.clientX - r.left - tw - 16);
    if (y + th > r.height) y = Math.max(0, e.clientY - r.top - th - 16);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function select(what) {
    const d = $('#detail');
    let html = '';
    if (what.link) { const l = S.model.links.find((x) => x.id === what.link); if (!l) return; html = linkHTML(l, true); }
    else if (what.node) { if (!S.layout.N[what.node]) return; html = nodeHTML(what.node, true); }
    d.innerHTML = `<button type="button" class="close" aria-label="Close">×</button>` + html;
    d.querySelector('.close').addEventListener('click', () => { d.hidden = true; });
    d.querySelectorAll('.whobtn').forEach((b) => b.addEventListener('click', () => selectCtrl(b.dataset.ctrl)));
    d.hidden = false; tip.hidden = true;
    if (S.orient === 'v') d.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  /* ---------- one decider at a time ---------- */
  function ctrlHTML(k) {
    const own = S.visible.filter((l) => l.ctrl === k);
    const total = own.filter((l) => !own.some((x) => x.t === l.s)).reduce((s, l) => s + l.v, 0);
    return `<b><span class="who" style="font-size:.95rem"><i style="background:${S.colors['k-' + k]}"></i>${esc(CTRL[k].label)}</span></b>
      <div class="amt">${fmt(total)} a year</div><p>${esc(CTRL[k].desc)}</p>
      <div class="meta">${own.length} band${own.length === 1 ? '' : 's'} on screen. Click a band for details, or the decider again to clear.</div>`;
  }
  function syncCtrlSel() {
    const sel = $('#ctrlsel'); if (!sel || !S.model) return;
    const present = Object.keys(CTRL).filter((k) => S.model.links.some((l) => l.ctrl === k));
    const opts = '<option value="">Everyone</option>' + present.map((k) => `<option value="${k}">${esc(CTRL[k].label)}</option>`).join('');
    if (sel.dataset.opts !== opts) { sel.innerHTML = opts; sel.dataset.opts = opts; }
    sel.value = S.ctrlSel || ''; sel.classList.toggle('on', !!S.ctrlSel);
  }
  function selectCtrl(k, force) {
    const want = !CTRL[k] || (S.ctrlSel === k && !force) ? null : k;
    if (want && S.step !== lastStep) { S.step = lastStep; updateStep(false); } // show every band, then highlight
    S.ctrlSel = want;
    S.lens = 'ctrl'; syncLens(); render(true);
    const d = $('#detail');
    if (!S.ctrlSel) { d.hidden = true; return; }
    d.innerHTML = `<button type="button" class="close" aria-label="Close">×</button>` + ctrlHTML(S.ctrlSel);
    d.querySelector('.close').addEventListener('click', () => selectCtrl(null));
    d.hidden = false; tip.hidden = true;
  }

  /* ---------- story ---------- */
  function updateStep(animate) {
    const st = SEC.steps[S.step];
    S.ctrlSel = null;
    if (S.step !== lastStep) S.lens = st.lens || 'pay';
    $('#stepcount').textContent = `Step ${S.step + 1} of ${SEC.steps.length}`;
    $('#steptitle').textContent = st.title;
    $('#steptext').textContent = st.text;
    $('#prev').disabled = S.step === 0; $('#next').disabled = S.step === lastStep;
    $('#skip').hidden = S.step === lastStep;
    $('#hidepubwrap').hidden = true;
    [...$('#dots').children].forEach((b, i) => { if (i === S.step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    syncLens();
    $('#detail').hidden = true;
    render(animate);
  }
  function go(i) {
    S.step = Math.max(0, Math.min(lastStep, i)); updateStep(true);
    // keep the whole chart card in view while stepping
    const card = document.querySelector('.stagecard'), r = card.getBoundingClientRect();
    if (S.orient === 'h' && (r.top < -4 || r.bottom > window.innerHeight + 4)) card.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }
  function syncLens() { document.querySelectorAll('#lens button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lens === S.lens ? 'true' : 'false')); }

  function renderChips(links) {
    const box = $('#chips');
    const fresh = links.filter((l) => S.fresh.has(l.id) && NODES[l.s].col <= NODES[l.t].col).sort((a, b) => b.v - a.v);
    if (!fresh.length) { box.innerHTML = ''; return; }
    const shown = fresh.slice(0, 3);
    const lbl = S.ctrlSel ? 'Decided by ' + CTRL[S.ctrlSel].label : (SEC.steps[S.step].lens ? 'Highlighted' : 'New this step');
    box.innerHTML = `<span class="chips__lbl">${esc(lbl)}</span>` + shown.map((l) =>
      `<button type="button" class="chip" data-id="${esc(l.id)}"><i style="background:${linkColor(l)}"></i>${esc(NODES[l.s].label)} → ${esc(l.label || NODES[l.t].label)} ${fmt(l.v)}</button>`).join('') +
      (fresh.length > shown.length ? `<span class="chip" style="cursor:default">+${fresh.length - shown.length} more</span>` : '') +
      (S.ctrlSel ? `<button type="button" class="chip clear" id="clearctrl">Clear ×</button>` : '');
    if (S.ctrlSel) $('#clearctrl').addEventListener('click', () => selectCtrl(null));
    box.querySelectorAll('button.chip[data-id]').forEach((b) => b.addEventListener('click', () => select({ link: b.dataset.id })));
  }
  function updateTotal(links) {
    const hasIn = new Set(links.map((l) => l.t));
    const total = links.filter((l) => !hasIn.has(l.s)).reduce((s, l) => s + l.v, 0);
    $('#total').innerHTML = `${esc(STATE_NAMES[S.area])} · <b>${fmt(total)}</b> a year on screen`;
  }
  function renderLegend() {
    let items;
    const present = new Set(S.model.links.map((l) => l.ctrl)), groupsHere = new Set(S.model.links.map((l) => payerOf(l)));
    if (S.lens === 'ctrl') items = Object.entries(CTRL).filter(([k]) => present.has(k)).map(([k, m]) => `<button type="button" class="lg" data-ctrl="${k}" aria-pressed="${S.ctrlSel === k}" title="Show only what ${esc(m.label)} decide"><i style="background:var(--k-${k})"></i>${esc(m.label)}</button>`).join('');
    else items = Object.entries(F.groups).filter(([g]) => groupsHere.has(g)).map(([g, m]) => `<span><i style="background:var(--c-${g})"></i>${esc(m.label)}</span>`).join('');
    $('#legend').innerHTML = items + `<span><i class="est"></i>Estimate</span>`;
    $('#legend').querySelectorAll('button.lg').forEach((b) => b.addEventListener('click', () => selectCtrl(b.dataset.ctrl)));
  }
  function renderStateBar() {
    const bar = $('#statebar');
    if (S.area === 'US') { bar.hidden = true; return; }
    const c = CH.states && CH.states[S.area], b = ST.states[S.area].buyers;
    bar.hidden = false;
    bar.innerHTML = `<span>Showing <b>${esc(STATE_NAMES[S.area])}</b>: public school money (Census ${ST.year})${c && c.choiceUSD ? ' and school choice programs' : ''}${b ? `, spent by <b>${b.systems.toLocaleString('en-US')}</b> school system${b.systems === 1 ? '' : 's'}` : ''}. ${esc(SEC.stateNote || '')}</span>
      <button type="button" class="btn" id="backus">Whole country</button>`;
    $('#backus').addEventListener('click', () => showArea('US'));
  }
  function showArea(code, opts) {
    S.area = ST.states[code] ? code : 'US';
    S.model = buildModel(S.area);
    $('#statesel').value = S.area;
    renderStateBar();
    if (S.area !== 'US') S.step = lastStep;
    if (history.replaceState) history.replaceState(null, '', S.area !== 'US' ? '#' + S.area : (S.sector !== Object.keys(F.sectors)[0] ? '#' + S.sector : location.pathname));
    updateStep(!(opts && opts.instant));
  }

  /* ---------- sectors ---------- */
  function sectorTotal(k) {
    const m = buildModel('US', F.sectors[k]); const hasIn = new Set(m.links.map((l) => l.t));
    return m.links.filter((l) => !hasIn.has(l.s)).reduce((s, l) => s + l.v, 0);
  }
  function renderSectorTabs() {
    const keys = Object.keys(F.sectors), tot = {}; keys.forEach((k) => { tot[k] = sectorTotal(k); });
    const max = Math.max(...keys.map((k) => tot[k]));
    $('#sectors').innerHTML = keys.map((k) => `<button type="button" role="tab" data-sector="${k}" aria-selected="${k === S.sector}">
      <span class="sec-name">${esc(F.sectors[k].label)}</span><span class="sec-amt">${F.sectors[k].approx ? '~' : ''}${fmt(tot[k])}</span>
      <i class="sec-bar" style="width:${Math.max(2, tot[k] / max * 100)}%"></i></button>`).join('');
    $('#sectors').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setSector(b.dataset.sector)));
  }
  function setSector(k, opts) {
    S.sector = F.sectors[k] ? k : Object.keys(F.sectors)[0]; SEC = F.sectors[S.sector];
    lastStep = SEC.steps.length - 1; S.step = 0; S.ctrlSel = null; S.hidePub = false; $('#hidepub').checked = false;
    $('#sectors').querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.sector === S.sector ? 'true' : 'false'));
    $('#dots').innerHTML = SEC.steps.map((st, i) => `<button type="button" title="${esc(st.title)}" aria-label="Step ${i + 1}: ${esc(st.title)}">${i + 1}</button>`).join('');
    [...$('#dots').children].forEach((b, i) => b.addEventListener('click', () => go(i)));
    $('#statesel').disabled = !SEC.census; if (!SEC.census) $('#statesel').value = 'US';

    $('#sectorlede').textContent = SEC.blurb || '';
    clearDrawing(); renderStocks(); renderBuyers(); wireBuyerTable();
    showArea(SEC.census ? S.area : 'US', opts);
  }

  /* ---------- tables ---------- */
  function renderTable() {
    const rows = S.model.links.map((l) => `<tr><td>${esc(NODES[l.s].label)}</td><td>${esc(NODES[l.t].label)}${l.label ? ' (' + esc(l.label) + ')' : ''}</td>
      <td class="num">${fmt(l.v)}</td><td class="num">${l.low != null ? fmtRange(l) : ''}</td><td>${l.ctrl ? esc(CTRL[l.ctrl].label) : ''}</td><td>${esc(l.year)}</td>
      <td>${CONF[l.conf] || ''}</td><td>${esc(l.why)}</td>
      <td>${l.src ? `<a href="${esc(l.src)}" target="_blank" rel="noopener">link</a>` : '—'}</td></tr>`).join('');
    $('#flowtable').innerHTML = `<thead><tr><th>From</th><th>To</th><th>Per year</th><th>Range</th><th>Who decides</th><th>Year</th><th>Type</th><th>Why it moves</th><th>Source</th></tr></thead><tbody>${rows}</tbody>`;
  }
  function renderBuyers() {
    if (!SEC.census) return renderBuyersGeneric();
    const m = buildModel('US'), r = ST.states.US, b = r.buyers, B = (x) => (x || 0) / 1e6;
    const sum = (k) => m.links.filter((l) => l.ctrl === k && (NODES[l.s].col === 0 || (k === 'parents' && l.s === 'choice'))).reduce((s, l) => s + l.v, 0);
    const rows = [
      ['congress', sum('congress'), 'One Congress; the Education Department, USDA and HHS run the programs',
        'Sets program totals in yearly appropriations. Formulas in law then split the money by child poverty, disability counts and meals served, so a district rarely asks for formula money. Some grants are competitive and won by application.'],
      ['legislature', sum('legislature'), '50 states and DC',
        'Writes the school funding formula and sets pre-K and school choice budgets, usually every one or two years. A district gets more by enrolling more students or students with higher weights. Lobbying and lawsuits change the formula itself.'],
      ['localBoard', B(r.local), `${b.systems.toLocaleString('en-US')} school systems plus the cities and counties that fund some of them`,
        'Boards or councils set property tax rates within state caps. Voters approve bonds and tax increases at the ballot box.'],
      ['district', B(r.exp), `${b.systems.toLocaleString('en-US')} school systems; ${b.small.toLocaleString('en-US')} have fewer than 1,000 students`,
        `The board approves the budget; the superintendent and central office hire and buy. ${fmt(B(r.salaries) + B(r.benefits))} goes to staff pay and benefits under salary schedules and contracts. ${fmt(B(r.current) - B(r.salaries) - B(r.benefits))} buys goods and services and ${fmt(B(r.capital))} buys buildings and equipment, through bids, cooperative contracts and small purchases by principals. The largest 100 systems hold ${pct(b.top100)} of day-to-day spending, the largest 1,000 hold ${pct(b.top1000)}; New York City alone spends ${fmt(b.top[0].cur / 1e6)}.`],
    ].concat((SEC.buyers || []).map((x) => [x.ctrl, sum(x.ctrl), x.count, x.how]));
    $('#buyertable').innerHTML = `<thead><tr><th>Who decides</th><th>Controls each year</th><th>How many</th><th>How they decide or buy</th></tr></thead><tbody>` +
      rows.map(([k, v, n, how]) => `<tr><td><button type="button" class="who whobtn" data-ctrl="${k}" title="Show on the chart"><i style="background:var(--k-${k})"></i><b>${esc(CTRL[k].label)}</b></button></td><td class="num">${fmt(v)}</td><td>${esc(n)}</td><td>${esc(how)}</td></tr>`).join('') + '</tbody>';
  }
  function renderBuyersGeneric() {
    const m = buildModel('US'), rows = [];
    (SEC.buyers || []).forEach((x) => {
      const v = m.links.filter((l) => l.ctrl === x.ctrl && !m.links.some((y) => y.t === l.s && y.ctrl === x.ctrl)).reduce((s, l) => s + l.v, 0);
      rows.push(`<tr><td><button type="button" class="who whobtn" data-ctrl="${x.ctrl}" title="Show on the chart"><i style="background:var(--k-${x.ctrl})"></i><b>${esc(CTRL[x.ctrl].label)}</b></button></td><td class="num">${fmt(v)}</td><td>${esc(x.count)}</td><td>${esc(x.how)}</td></tr>`);
    });
    $('#buyertable').innerHTML = `<thead><tr><th>Who decides</th><th>Controls each year</th><th>How many</th><th>How they decide or buy</th></tr></thead><tbody>${rows.join('')}</tbody>`;
  }
  function wireBuyerTable() {
    document.querySelectorAll('#buyertable .whobtn').forEach((b) => b.addEventListener('click', () => {
      if (S.step !== lastStep) { S.step = lastStep; updateStep(false); }
      selectCtrl(b.dataset.ctrl, true);
      document.querySelector('.stagecard').scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }));
  }
  function renderStocks() {
    $('#fold-stocks').hidden = !(SEC.stocks && SEC.stocks.length);
    $('#stocks').innerHTML = (SEC.stocks || []).map((s, i) => `<div class="card stock"><div class="tank${s.kind === 'debt' ? ' debt' : ''}" aria-hidden="true"><i></i></div>
      <div><div class="v">${fmt(s.v)}</div><b>${esc(s.label)}</b> <span class="note">${esc(s.date)}</span><p>${esc(s.note)} <a href="${esc(s.src)}" target="_blank" rel="noopener">Source</a></p></div></div>`).join('');
  }

  /* ---------- boot ---------- */
  function init() {
    readColors(); size(); SEC = F.sectors[Object.keys(F.sectors)[0]];
    $('#prev').addEventListener('click', () => go(S.step - 1));
    $('#next').addEventListener('click', () => go(S.step + 1));
    $('#skip').addEventListener('click', () => go(lastStep));
    $('#hidepub').addEventListener('change', (e) => { S.hidePub = e.target.checked; render(true); });
    document.querySelectorAll('#lens button').forEach((b) => b.addEventListener('click', () => { S.lens = b.dataset.lens; if (S.lens !== 'ctrl') S.ctrlSel = null; syncLens(); render(false); }));
    const sel = $('#statesel');
    sel.innerHTML = Object.keys(ST.states).map((c) => `<option value="${c}">${esc(STATE_NAMES[c] || c)}</option>`).join('');
    sel.addEventListener('change', () => { showView('flow'); if (!SEC.census) setSector(Object.keys(F.sectors)[0]); showArea(sel.value); });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,select,textarea') || $('#view-flow').hidden) return;
      if (e.key === 'ArrowRight') go(S.step + 1); else if (e.key === 'ArrowLeft') go(S.step - 1);
      else if (e.key === 'Escape') { if (S.ctrlSel) selectCtrl(null); else $('#detail').hidden = true; }
    });
    // the caption's height changes from step to step, so watch the plot itself rather than the window
    let rt, lastBox = '';
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => {
      const p = $('#plot'), box = p.clientWidth + 'x' + p.clientHeight; if (box === lastBox || $('#view-flow').hidden) return; lastBox = box;
      const o = S.orient; size(); if (o !== S.orient) clearDrawing(); render(false); }, 60); };
    if (window.ResizeObserver) new ResizeObserver(onResize).observe($('#plot')); else window.addEventListener('resize', onResize);
    document.querySelectorAll('#views button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
    $('#ctrlsel').addEventListener('change', (e) => { if ($('#view-flow').hidden) showView('flow'); selectCtrl(e.target.value || null, true); });
    renderSectorTabs();
    const m = /^#([A-Z]{2})$/.exec(location.hash), ms = /^#([a-z]+)$/.exec(location.hash);
    if (m) S.area = m[1];
    setSector(ms && F.sectors[ms[1]] ? ms[1] : Object.keys(F.sectors)[0], { instant: true });
    requestAnimationFrame(frame);
    $('#updated').textContent = `Public school figures: Census ${ST.year}. Page data last checked ${CH.asOf || 'November 2026'}.`;
  }
  function showView(v) {
    document.querySelectorAll('#views button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'));
    $('#view-flow').hidden = v !== 'flow'; $('#view-map').hidden = v !== 'map';
    $('#lens').hidden = v !== 'flow';
    if (v === 'flow') { size(); render(false); } else if (window.EMF_MAP) window.EMF_MAP.show();
  }

  window.EMF_APP = { showArea: (c) => { showView('flow'); if (!SEC.census) setSector(Object.keys(F.sectors)[0]); showArea(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }, fmt, STATE_NAMES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
