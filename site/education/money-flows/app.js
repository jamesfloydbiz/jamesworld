/* Follow the Money: animated Sankey flowchart, no libraries.
   Data: window.EMF_STATES (Census FY2024, generated), window.EMF_CHOICE (choice programs by state),
   window.EMF_FLOWS (labels, national-only flows, story steps, stocks).
   Layout runs in abstract coordinates: "a" runs along the flow (columns), "c" runs across it.
   Wide screens draw columns left to right; narrow screens draw them top to bottom. */
(function () {
  'use strict';
  const F = window.EMF_FLOWS, ST = window.EMF_STATES, CH = window.EMF_CHOICE || { states: {} };
  const $ = (s) => document.querySelector(s);
  const SVGNS = 'http://www.w3.org/2000/svg';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const COLHEAD = ['Who pays', 'Who moves it', 'Who receives it', 'What it buys'];
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

  /* ---------- numbers ---------- */
  function fmt(v) {
    if (v == null || isNaN(v)) return '—';
    if (v >= 100) return '$' + Math.round(v) + 'B';
    if (v >= 10) return '$' + v.toFixed(1).replace(/\.0$/, '') + 'B';
    if (v >= 1) return '$' + v.toFixed(1) + 'B';
    if (v >= 0.001) return '$' + Math.round(v * 1000) + 'M';
    return '<$1M';
  }
  function fmtRange(l) { return l.low != null ? fmt(l.low) + ' to ' + fmt(l.high) : ''; }

  /* ---------- model ---------- */
  const CENSUS_SRC = ST.source;
  function censusLinks(code) {
    const r = ST.states[code]; if (!r) return [];
    const B = (x) => (x || 0) / 1e6; // thousands of dollars -> billions
    const yr = ST.year, out = [];
    const add = (s, t, v, step, why, extra) => {
      if (v > 0.0005) out.push(Object.assign({ s, t, v, step, why, year: yr, conf: 'high', src: CENSUS_SRC, pub: true }, extra || {}));
    };
    const fedOther = B(r.fed) - B(r.fedTitle1) - B(r.fedSpecEd) - B(r.fedMeals);
    add('fedTax', 'title1', B(r.fedTitle1), 1, 'Congress funds Title I; states pass it to districts by formulas that count children in poverty.');
    add('fedTax', 'idea', B(r.fedSpecEd), 1, 'Federal special education grants, passed through the state education agency.');
    add('fedTax', 'meals', B(r.fedMeals), 1, 'USDA reimburses schools for each meal served.');
    add('fedTax', 'fedOther', fedOther, 1, 'Other federal programs, including the end of pandemic relief (ESSER), Impact Aid and direct grants.');
    const stOther = B(r.state) - B(r.stFormula) - B(r.stOnBehalf);
    add('stateTax', 'formula', B(r.stFormula), 1, 'State general fund money set aside for the school funding formula.');
    add('stateTax', 'onBehalf', B(r.stOnBehalf), 1, 'Payments the state makes for schools, mostly into teacher pension funds.');
    add('stateTax', 'stateOther', stOther, 1, 'Targeted state programs: special education, transportation, compensatory and others.');
    const feesOther = B(r.local) - B(r.locProperty) - B(r.locOtherTax) - B(r.locParentGov);
    add('propTax', 'localTaxes', B(r.locProperty), 1, 'Property tax levied by or for the school district.');
    add('localOther', 'localTaxes', B(r.locOtherTax), 1, 'Local sales, income and other taxes earmarked for schools.');
    add('localOther', 'cityCounty', B(r.locParentGov), 1, 'Where schools are part of a city or county, that government funds them from its own budget.');
    add('localOther', 'feesOther', feesOther, 1, 'Meal payments, fees and tuition charges, interest, rents, private gifts and money from other local governments.');
    add('formula', 'districts', B(r.stFormula), 2, 'A base amount per enrolled or attending student, extra weight for higher-need students, minus the expected local share.');
    add('onBehalf', 'districts', B(r.stOnBehalf), 2, 'Counted as school revenue because it pays school costs, even though the district never handles it.');
    add('stateOther', 'districts', stOther, 2, 'Paid for specific services or students.');
    add('localTaxes', 'districts', B(r.locProperty) + B(r.locOtherTax), 2, 'The district keeps what it levies. Richer property areas raise more per student; state formulas try to even this out.');
    add('cityCounty', 'districts', B(r.locParentGov), 2, 'Transferred from the city or county budget.');
    add('feesOther', 'districts', feesOther, 2, 'Collected locally by the district.');
    add('title1', 'districts', B(r.fedTitle1), 3, 'Aimed at schools with many children from low-income families.');
    add('idea', 'districts', B(r.fedSpecEd), 3, 'Pays part of the extra cost of educating students with disabilities.');
    add('meals', 'districts', B(r.fedMeals), 3, 'Pays for free and reduced-price meals.');
    add('fedOther', 'districts', fedOther, 3, 'Other federal grants to districts.');
    add('districts', 'instruction', B(r.instruction), 4, 'Teachers, aides and classroom costs.');
    add('districts', 'support', B(r.support), 4, 'Buildings, buses, counselors, principals and district offices.');
    add('districts', 'otherCur', B(r.otherCurrent), 4, 'Food service and other day-to-day costs.');
    add('districts', 'capital', B(r.capital), 4, 'Construction, land and equipment, often paid with bonds.');
    add('districts', 'debt', B(r.interest) + B(r.toOtherGov), 4, 'Interest on borrowed money and payments to other governments.');
    const gap = B(r.rev) - B(r.exp);
    if (gap > 0) add('districts', 'reserves', gap, 4, 'Revenue that came in this year but was not spent this year.');
    else if (gap < 0) add('drawdown', 'districts', -gap, 4, 'Spending above this year\'s revenue, covered by reserves and borrowing.');
    return out;
  }
  function buildModel(code) {
    let links = censusLinks(code);
    if (code === 'US') {
      links = links.concat(F.national.map((l) => Object.assign({}, l)));
    } else {
      const c = CH.states && CH.states[code];
      if (c && c.choiceUSD) {
        const v = c.choiceUSD / 1e9, why = 'State money that follows a child to a private school or approved provider the parent chooses.';
        links.push({ s: 'stateTax', t: 'choice', v, step: 6, conf: 'medium', year: c.year || '', why, src: (CH.source || {}).choice || '' });
        links.push({ s: 'choice', t: 'privateSch', v, step: 6, conf: 'medium', year: c.year || '', why, src: (CH.source || {}).choice || '' });
      }
    }
    links.forEach((l, i) => { l.id = l.s + '>' + l.t + (l.label ? ':' + l.label : '') ; });
    // merge duplicates of the same id (none expected) by suffixing
    const seen = {}; links.forEach((l) => { if (seen[l.id]) l.id += '#' + (seen[l.id]++); else seen[l.id] = 1; });
    return { code, links };
  }
  const NODES = Object.assign({ drawdown: { col: 1, group: 'pub', label: 'Reserves and borrowing', desc: 'Money drawn from savings or borrowed to cover spending above this year\'s revenue.' } }, F.nodes);
  const NODE_ORDER = Object.keys(NODES);

  /* ---------- state ---------- */
  const S = {
    step: 0, area: 'US', hidePub: false, model: null, layout: null,
    orient: 'h', W: 800, H: 600, colors: {}, sel: null
  };
  const lastStep = F.steps.length - 1;

  function visibleLinks() {
    const st = F.steps[S.step] || {};
    const explore = S.step === lastStep;
    const zoom = st.zoom || (explore && S.hidePub);
    return S.model.links.filter((l) => {
      if (zoom && l.pub) return false;
      if (st.zoom || explore) return true;
      return l.step <= S.step + 1;
    });
  }

  /* ---------- layout ---------- */
  function layout(links) {
    const vert = S.orient === 'v';
    const W = S.W, H = S.H;
    const nodeT = vert ? 12 : 14;            // node thickness along the flow
    const gap = vert ? 8 : 10;               // space between nodes in a column
    const headRoom = vert ? 0 : 22;
    const N = {};
    links.forEach((l) => {
      (N[l.s] = N[l.s] || { id: l.s, in: 0, out: 0, ins: [], outs: [] }).out += l.v; N[l.s].outs.push(l);
      (N[l.t] = N[l.t] || { id: l.t, in: 0, out: 0, ins: [], outs: [] }).in += l.v; N[l.t].ins.push(l);
    });
    const ids = Object.keys(N).sort((a, b) => NODE_ORDER.indexOf(a) - NODE_ORDER.indexOf(b));
    ids.forEach((id) => { N[id].v = Math.max(N[id].in, N[id].out); N[id].col = NODES[id].col; });
    const cols = [...new Set(ids.map((id) => N[id].col))].sort();
    const alongLen = vert ? H - 40 : W;
    const acrossLen = vert ? W : H - headRoom;
    const rightPad = vert ? 0 : Math.min(225, Math.max(150, W * 0.16)); // room for last-column labels
    // column positions along the flow
    const colA = {};
    cols.forEach((c, i) => {
      const t = cols.length === 1 ? 0 : i / (cols.length - 1);
      colA[c] = vert ? 20 + t * (alongLen - nodeT - 20) : t * (alongLen - nodeT - rightPad);
    });
    // scale: the fullest column fits the space
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
    // band offsets inside each node: order by the other end's position to reduce crossings
    ids.forEach((id) => {
      const n = N[id];
      n.outs.sort((x, y) => N[x.t].c - N[y.t].c || NODE_ORDER.indexOf(x.t) - NODE_ORDER.indexOf(y.t));
      n.ins.sort((x, y) => N[x.s].c - N[y.s].c);
      let o = n.c + (n.len - n.out * k) / 2; n.outs.forEach((l) => { l._c0 = o + l.v * k / 2; o += l.v * k; });
      let p = n.c + (n.len - n.in * k) / 2; n.ins.forEach((l) => { l._c1 = p + l.v * k / 2; p += l.v * k; });
    });
    const L = {};
    links.forEach((l) => { L[l.id] = { a0: N[l.s].a + nodeT, c0: l._c0, a1: N[l.t].a, c1: l._c1, w: Math.max(l.v * k, 0.8) }; });
    return { N, L, k, nodeT, cols, colA };
  }

  /* ---------- drawing ---------- */
  const svg = $('#sankey'), canvas = $('#particles'), ctx = canvas.getContext('2d');
  const gLinks = document.createElementNS(SVGNS, 'g'), gHits = document.createElementNS(SVGNS, 'g'),
        gNodes = document.createElementNS(SVGNS, 'g'), gHead = document.createElementNS(SVGNS, 'g');
  svg.append(gHead, gLinks, gNodes, gHits);
  const els = { links: {}, hits: {}, nodes: {} };
  let geom = { L: {}, N: {} };           // what is on screen now
  let tween = null;

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    ['fed', 'state', 'local', 'family', 'gift', 'pub', 'priv'].forEach((g) => { S.colors[g] = cs.getPropertyValue('--c-' + g).trim(); });
  }
  const nodeColor = (id) => S.colors[NODES[id].group];
  function linkColor(l) {
    // a band takes the color of who first paid
    let id = l.s, guard = 0;
    while (NODES[id] && NODES[id].col > 0 && guard++ < 4) {
      const up = S.model.links.find((x) => x.t === id); if (!up) break; id = up.s;
    }
    return S.colors[NODES[id].group] || S.colors.pub;
  }
  function pathD(g) {
    const am = (g.a0 + g.a1) / 2;
    if (S.orient === 'v') return `M${g.c0},${g.a0}C${g.c0},${am} ${g.c1},${am} ${g.c1},${g.a1}`;
    return `M${g.a0},${g.c0}C${am},${g.c0} ${am},${g.c1} ${g.a1},${g.c1}`;
  }
  function size() {
    const plot = $('#plot'); const w = plot.clientWidth || 800;
    S.orient = w < 700 ? 'v' : 'h';
    S.W = w; S.H = S.orient === 'v' ? 760 : Math.max(500, Math.min(760, Math.round(w * 0.62)));
    svg.setAttribute('viewBox', `0 0 ${S.W} ${S.H}`); svg.setAttribute('height', S.H);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(S.W * dpr); canvas.height = Math.round(S.H * dpr);
    canvas.style.width = S.W + 'px'; canvas.style.height = S.H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render(animate) {
    const links = visibleLinks();
    const lay = layout(links); S.layout = lay; S.visible = links;
    const st = F.steps[S.step] || {};
    const focus = new Set(st.focus || []);
    // column heads
    gHead.textContent = '';
    if (S.orient === 'h') {
      lay.cols.forEach((c) => {
        const t = document.createElementNS(SVGNS, 'text'); t.setAttribute('class', 'colhead');
        const a = lay.colA[c];
        t.setAttribute('x', a); t.setAttribute('y', 12);
        t.setAttribute('text-anchor', 'start'); t.textContent = COLHEAD[c]; gHead.append(t);
      });
    }
    // links
    const next = { L: {}, N: {} };
    const ids = new Set(links.map((l) => l.id));
    links.forEach((l) => {
      next.L[l.id] = lay.L[l.id];
      if (!els.links[l.id]) {
        const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('class', 'link');
        const h = document.createElementNS(SVGNS, 'path'); h.setAttribute('fill', 'none'); h.setAttribute('stroke', 'transparent');
        h.style.pointerEvents = 'stroke'; h.style.cursor = 'pointer';
        h.addEventListener('pointerenter', (e) => hoverLink(l.id, e)); h.addEventListener('pointermove', (e) => moveTip(e));
        h.addEventListener('pointerleave', unhover); h.addEventListener('click', () => select({ link: l.id }));
        gLinks.append(p); gHits.append(h); els.links[l.id] = p; els.hits[l.id] = h;
        const prev = geom.L[l.id];
        if (!prev) geom.L[l.id] = Object.assign({}, lay.L[l.id], { w: 0 });
      }
      const p = els.links[l.id];
      p.setAttribute('stroke', linkColor(l));
      p.classList.toggle('est', l.conf === 'low');
      p.setAttribute('stroke-dasharray', l.conf === 'low' ? '2 2' : '');
    });
    Object.keys(els.links).forEach((id) => { if (!ids.has(id)) next.L[id] = Object.assign({}, geom.L[id], { w: 0, gone: true }); });
    // nodes
    Object.keys(lay.N).forEach((id) => {
      const n = lay.N[id];
      next.N[id] = { a: n.a, c: n.c, len: n.len };
      if (!els.nodes[id]) {
        const g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'node');
        const r = document.createElementNS(SVGNS, 'rect'); const t = document.createElementNS(SVGNS, 'text');
        g.append(r, t); gNodes.append(g); els.nodes[id] = g;
        g.addEventListener('pointerenter', (e) => hoverNode(id, e)); g.addEventListener('pointermove', (e) => moveTip(e));
        g.addEventListener('pointerleave', unhover); g.addEventListener('click', () => select({ node: id }));
        if (!geom.N[id]) geom.N[id] = { a: n.a, c: n.c + n.len / 2, len: 0 };
      }
      const g = els.nodes[id];
      g.querySelector('rect').setAttribute('fill', nodeColor(id));
      g.classList.toggle('focus', focus.has(id));
      g.dataset.v = n.v;
    });
    Object.keys(els.nodes).forEach((id) => { if (!lay.N[id]) next.N[id] = Object.assign({}, geom.N[id], { len: 0, gone: true }); });

    const from = geom, to = next, t0 = performance.now(), dur = animate && !reduceMotion.matches ? 750 : 0;
    tween = { from: JSON.parse(JSON.stringify(from)), to, t0, dur };
    stepTween(performance.now());
    updateTotal(links);
    renderTable();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
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
      els.hits[id].setAttribute('d', d); els.hits[id].setAttribute('stroke-width', Math.max(g.w, 10));
      els.hits[id].style.display = b.gone ? 'none' : '';
    });
    Object.keys(to.N).forEach((id) => {
      const a = from.N[id] || to.N[id], b = to.N[id];
      const n = { a: lerp(a.a, b.a, t), c: lerp(a.c, b.c, t), len: lerp(a.len, b.len, t) };
      cur.N[id] = n; placeNode(id, n, b.gone);
    });
    geom = cur;
    if (t >= 1) {
      Object.keys(to.L).forEach((id) => { if (to.L[id].gone) { els.links[id].remove(); els.hits[id].remove(); delete els.links[id]; delete els.hits[id]; delete geom.L[id]; } });
      Object.keys(to.N).forEach((id) => { if (to.N[id].gone) { els.nodes[id].remove(); delete els.nodes[id]; delete geom.N[id]; } });
      tween = null;
    }
  }

  function placeNode(id, n, gone) {
    const g = els.nodes[id]; const r = g.firstChild, t = g.lastChild; const T = S.layout.nodeT;
    const vert = S.orient === 'v';
    if (vert) { r.setAttribute('x', n.c); r.setAttribute('y', n.a); r.setAttribute('width', Math.max(n.len, 0.5)); r.setAttribute('height', T); }
    else { r.setAttribute('x', n.a); r.setAttribute('y', n.c); r.setAttribute('width', T); r.setAttribute('height', Math.max(n.len, 0.5)); }
    const meta = NODES[id], v = +g.dataset.v;
    t.textContent = '';
    if (gone) return;
    const lastCol = Math.max(...S.layout.cols);
    const name = document.createElementNS(SVGNS, 'tspan'); name.textContent = meta.label;
    const amt = document.createElementNS(SVGNS, 'tspan'); amt.setAttribute('class', 'amt'); amt.textContent = ' ' + fmt(v);
    if (vert) {
      if (n.len < 54) { t.textContent = ''; return; }    // too narrow to label; tap for details
      const below = meta.col !== lastCol;
      t.setAttribute('x', n.c + 2); t.setAttribute('y', below ? n.a + T + 13 : n.a - 5);
      t.setAttribute('text-anchor', 'start'); t.style.fontSize = '11px';
      name.textContent = meta.label.length > Math.floor(n.len / 6.2) ? meta.label.slice(0, Math.max(4, Math.floor(n.len / 6.2) - 1)) + '…' : meta.label;
      t.append(name);
      if (n.len >= 90) { amt.setAttribute('x', n.c + 2); amt.setAttribute('dy', '1.15em'); amt.textContent = fmt(v); t.append(amt); }
      return;
    }
    const x = n.a + T + 6;
    t.setAttribute('x', x); t.setAttribute('text-anchor', 'start');
    if (n.len < 13) { t.setAttribute('y', n.c + n.len / 2 + 4); t.append(name, amt); return; }
    t.setAttribute('y', n.c + n.len / 2 - 2);
    amt.setAttribute('x', x); amt.setAttribute('dy', '1.2em'); amt.textContent = fmt(v);
    t.append(name, amt);
  }

  /* ---------- particles ---------- */
  const seeds = {};
  function seedFor(id) {
    if (!seeds[id]) { const a = []; for (let i = 0; i < 40; i++) a.push([Math.random(), Math.random() - .5, .8 + Math.random() * .4]); seeds[id] = a; }
    return seeds[id];
  }
  function bez(g, t) {
    const am = (g.a0 + g.a1) / 2, u = 1 - t;
    const a = u * u * u * g.a0 + 3 * u * u * t * am + 3 * u * t * t * am + t * t * t * g.a1;
    const c = u * u * u * g.c0 + 3 * u * u * t * g.c0 + 3 * u * t * t * g.c1 + t * t * t * g.c1;
    return [a, c];
  }
  function drawParticles(now) {
    ctx.clearRect(0, 0, S.W, S.H);
    if (reduceMotion.matches || !S.visible) return;
    const vert = S.orient === 'v';
    let budget = 900;
    const dimmed = svg.classList.contains('dim');
    S.visible.forEach((l) => {
      const g = geom.L[l.id]; if (!g || g.w < 0.6) return;
      const n = Math.min(40, Math.max(1, Math.round(Math.sqrt(g.w) * 2.2)));
      const seed = seedFor(l.id);
      const hi = els.links[l.id] && els.links[l.id].classList.contains('hi');
      ctx.fillStyle = linkColor(l);
      ctx.globalAlpha = dimmed && !hi ? 0.15 : (l.conf === 'low' ? 0.6 : 0.9);
      for (let i = 0; i < n && budget > 0; i++, budget--) {
        const [p0, off, sp] = seed[i];
        const t = ((now / 4200) * sp + p0) % 1;
        const [a, c0] = bez(g, t); const c = c0 + off * g.w * 0.85;
        const x = vert ? c : a, y = vert ? a : c;
        ctx.beginPath(); ctx.arc(x, y, g.w > 6 ? 1.7 : 1.2, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    if (tween) stepTween(now);
    if (!document.hidden) drawParticles(now);
    requestAnimationFrame(frame);
  }

  /* ---------- hover, tooltip, detail ---------- */
  const tip = $('#tip');
  function linkHTML(l, big) {
    const a = NODES[l.s].label, b = NODES[l.t].label;
    const conf = { high: 'Measured', medium: 'Reported', low: 'Estimate' }[l.conf] || '';
    return `<b>${a} → ${b}${l.label ? ' (' + l.label + ')' : ''}</b>
      <div class="amt">${fmt(l.v)} a year</div>
      ${l.low != null ? `<div class="meta">Range ${fmtRange(l)}</div>` : ''}
      <p>${l.why || ''}</p>
      <div class="meta">${l.year} · ${conf}${big && l.src ? ` · <a href="${l.src}" target="_blank" rel="noopener">source</a>` : ''}</div>`;
  }
  function nodeHTML(id) {
    const n = S.layout.N[id], m = NODES[id];
    return `<b>${m.label}</b><div class="amt">${fmt(n.v)} a year</div><p>${m.desc || ''}</p>
      ${n.in && n.out ? `<div class="meta">In ${fmt(n.in)} · out ${fmt(n.out)}</div>` : ''}`;
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
    tip.innerHTML = nodeHTML(id); tip.hidden = false; moveTip(e);
  }
  function unhover() {
    svg.classList.remove('dim'); Object.values(els.links).forEach((p) => p.classList.remove('hi')); tip.hidden = true;
  }
  function moveTip(e) {
    if (e.pointerType === 'touch') { tip.hidden = true; return; }
    const r = $('#plot').getBoundingClientRect();
    let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > r.width) x = Math.max(0, e.clientX - r.left - tw - 14);
    if (y + th > r.height) y = Math.max(0, e.clientY - r.top - th - 14);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function select(what) {
    const d = $('#detail');
    if (what.link) { const l = S.visible.find((x) => x.id === what.link); if (!l) return; d.innerHTML = linkHTML(l, true); }
    else if (what.node) d.innerHTML = nodeHTML(what.node);
    d.hidden = false;
    if (S.orient === 'v' || window.innerWidth < 900) d.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  /* ---------- story controls ---------- */
  function updateStep(animate) {
    const st = F.steps[S.step];
    $('#stepcount').textContent = `Step ${S.step + 1} of ${F.steps.length}`;
    $('#steptitle').textContent = st.title;
    $('#steptext').textContent = st.text;
    $('#prev').disabled = S.step === 0; $('#next').disabled = S.step === lastStep;
    $('#skip').hidden = S.step === lastStep;
    $('#opts').hidden = S.step !== lastStep;
    [...$('#dots').children].forEach((b, i) => { if (i === S.step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    $('#detail').hidden = true;
    render(animate);
  }
  function go(i) { S.step = Math.max(0, Math.min(lastStep, i)); updateStep(true); }

  function updateTotal(links) {
    const hasIn = new Set(links.map((l) => l.t));
    const total = links.filter((l) => !hasIn.has(l.s)).reduce((s, l) => s + l.v, 0);
    const name = STATE_NAMES[S.area];
    $('#total').innerHTML = `${S.area === 'US' ? 'United States' : name}: <b>${fmt(total)}</b> a year on screen`;
  }
  function renderLegend() {
    $('#legend').innerHTML = Object.entries(F.groups).map(([g, m]) => `<span><i style="background:var(--c-${g})"></i>${m.label}</span>`).join('') +
      `<span><i style="background:var(--c-pub)"></i>Where it lands</span><span><i class="est"></i>Estimate</span>`;
  }
  function renderStateBar() {
    const bar = $('#statebar');
    if (S.area === 'US') { bar.hidden = true; return; }
    const c = CH.states && CH.states[S.area];
    bar.hidden = false;
    bar.innerHTML = `<span>Showing <b>${STATE_NAMES[S.area]}</b>: public school money (Census ${ST.year})${c && c.choiceUSD ? ' and school choice programs' : ''}. Family spending, 529s and donations are measured only for the whole country.</span>
      <button type="button" class="btn" id="backus">Back to whole country</button>`;
    $('#backus').addEventListener('click', () => showArea('US'));
  }
  function showArea(code, opts) {
    S.area = ST.states[code] ? code : 'US';
    S.model = buildModel(S.area);
    $('#statesel').value = S.area;
    renderStateBar();
    if (S.area !== 'US') S.step = lastStep;
    if (history.replaceState) history.replaceState(null, '', S.area === 'US' ? location.pathname : '#' + S.area);
    updateStep(!(opts && opts.instant));
  }

  /* ---------- table and stocks ---------- */
  function renderTable() {
    const rows = S.model.links.map((l) => `<tr><td>${NODES[l.s].label}</td><td>${NODES[l.t].label}${l.label ? ' (' + l.label + ')' : ''}</td>
      <td class="num">${fmt(l.v)}</td><td class="num">${l.low != null ? fmtRange(l) : ''}</td><td>${l.year}</td>
      <td>${{ high: 'Measured', medium: 'Reported', low: 'Estimate' }[l.conf] || ''}</td><td>${l.why || ''}</td>
      <td>${l.src ? `<a href="${l.src}" target="_blank" rel="noopener">link</a>` : '—'}</td></tr>`).join('');
    $('#flowtable').innerHTML = `<thead><tr><th>From</th><th>To</th><th>Per year</th><th>Range</th><th>Year</th><th>Type</th><th>Why it moves</th><th>Source</th></tr></thead><tbody>${rows}</tbody>`;
  }
  function renderStocks() {
    $('#stocks').innerHTML = F.stocks.map((s, i) => `<div class="card stock"><div class="tank${i ? ' debt' : ''}" aria-hidden="true"><i></i></div>
      <div><div class="v">${fmt(s.v)}</div><b>${s.label}</b> <span class="note">(${s.date})</span><p>${s.note} <a href="${s.src}" target="_blank" rel="noopener">Source</a></p></div></div>`).join('');
  }

  /* ---------- boot ---------- */
  function init() {
    readColors(); size(); renderLegend(); renderStocks();
    $('#dots').innerHTML = F.steps.map((s, i) => `<button type="button" title="${s.title}" aria-label="Step ${i + 1}: ${s.title}">${i + 1}</button>`).join('');
    [...$('#dots').children].forEach((b, i) => b.addEventListener('click', () => go(i)));
    $('#prev').addEventListener('click', () => go(S.step - 1));
    $('#next').addEventListener('click', () => go(S.step + 1));
    $('#skip').addEventListener('click', () => go(lastStep));
    $('#hidepub').addEventListener('change', (e) => { S.hidePub = e.target.checked; render(true); });
    const sel = $('#statesel');
    sel.innerHTML = Object.keys(ST.states).map((c) => `<option value="${c}">${STATE_NAMES[c] || c}</option>`).join('');
    sel.addEventListener('change', () => showArea(sel.value));
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,select,textarea')) return;
      if ($('#view-flow').hidden) return;
      if (e.key === 'ArrowRight') go(S.step + 1); else if (e.key === 'ArrowLeft') go(S.step - 1);
    });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const o = S.orient; size(); if (o !== S.orient) { geom = { L: {}, N: {} }; gLinks.textContent = gHits.textContent = gNodes.textContent = ''; els.links = {}; els.hits = {}; els.nodes = {}; } render(false); }, 150); });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(() => { readColors(); render(false); });
    // views
    document.querySelectorAll('#views button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
    const m = /^#([A-Z]{2})$/.exec(location.hash);
    showArea(m ? m[1] : 'US', { instant: true });
    requestAnimationFrame(frame);
    $('#updated').textContent = `Public school figures: Census ${ST.year}. Page data last checked ${(CH.asOf || 'November 2026')}.`;
  }
  function showView(v) {
    document.querySelectorAll('#views button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'));
    $('#view-flow').hidden = v !== 'flow'; $('#view-map').hidden = v !== 'map';
    if (v === 'flow') { size(); render(false); } else if (window.EMF_MAP) window.EMF_MAP.show();
  }

  window.EMF_APP = { showArea: (c) => { showView('flow'); showArea(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }, fmt, STATE_NAMES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
