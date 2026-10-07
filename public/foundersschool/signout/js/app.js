(function () {
  const C = window.FS_CONFIG, API = window.FS_API, { esc, time, minsLeft, phase, modeLabel } = window.FS, GEO = window.FS_GEO;
  const $ = (s) => document.querySelector(s);
  const app = $('#app'), dock = $('#dock'), dockInner = $('#dockInner'), who = $('#who');

  const S = {
    me: null, roster: [], busy: [], mine: { open: null, last: null }, lastJson: '',
    notes: [], noteOpen: false, noteKind: null, noteText: '',
    flow: false, step: 0, err: '', sending: false, dismissed: new Set(JSON.parse(localStorage.getItem('fs_dismissed') || '[]')),
    d: blank(),
  };
  function blank() { return { buddy: null, dest: null, purpose: null, stay: 30, mode: null, ride: null, practice: null, est: null, estLoading: false, q: '', results: [], searching: false }; }

  // Demo mode keeps identity per-tab so two tabs can play student + buddy; real mode remembers the phone.
  const ID = API.demo ? sessionStorage : localStorage;
  try { const m = JSON.parse(ID.getItem('fs_me')); if (m) S.me = m; } catch (e) {}
  if (API.demo) $('#demoflag').classList.remove('hidden');

  /* ---------- polling / data ---------- */
  async function refresh() {
    try {
      const r = await API.roster(); S.roster = r.students; S.busy = r.busy;
      if (S.me && !S.roster.find((x) => x.id === S.me.id)) { S.me = null; ID.removeItem('fs_me'); }
      if (S.me) { S.mine = await API.mine(S.me.id); S.notes = (await API.myNotes(S.me.id)).notes; }
    } catch (e) { /* offline blip — keep the last screen */ return; }
    const j = JSON.stringify([S.mine, S.busy, S.roster.length, S.me && S.me.id, S.notes]);
    if (j !== S.lastJson) { S.lastJson = j; render(); }
    else tick();
  }
  setInterval(refresh, C.pollMs);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });

  /* ---------- router ---------- */
  function render() {
    const o = S.mine.open;
    who.classList.toggle('hidden', !S.me);
    if (S.me) who.innerHTML = `${esc(S.me.name)}<button id="notme">Not you?</button>`;
    dock.classList.add('hidden');
    if (!S.me) return viewIdentity();
    if (S.noteOpen) return viewNote();
    if (o && (o.student.id === S.me.id || o.status === 'active')) return viewStatus();
    if (S.flow) return viewFlow();
    return viewHome();
  }
  document.addEventListener('click', (e) => { if (e.target.id === 'notme') { ID.removeItem('fs_me'); S.me = null; S.flow = false; S.lastJson = ''; render(); } });

  /* ---------- views ---------- */
  function viewIdentity() {
    app.innerHTML = `
      <div class="kicker">Step 1</div><h1>Who are you?</h1>
      <p class="sub">Tap your name. We'll remember this phone.</p>
      <input class="field" id="find" placeholder="Search names" autocomplete="off">
      <div class="grid" style="margin-top:10px" id="people"></div>`;
    const draw = (q = '') => {
      const list = S.roster.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
      $('#people').innerHTML = list.map((p) => `<button class="tile" data-id="${p.id}">${esc(p.name)}<small>${esc(p.grade || '')}</small></button>`).join('') || '<div class="empty" style="grid-column:1/-1">No match. Ask your RA to add you.</div>';
    };
    draw();
    $('#find').oninput = (e) => draw(e.target.value);
    $('#people').onclick = (e) => {
      const t = e.target.closest('.tile'); if (!t) return;
      S.me = S.roster.find((p) => p.id === t.dataset.id); ID.setItem('fs_me', JSON.stringify(S.me));
      S.lastJson = ''; refresh();
    };
  }

  function incomingBanner() {
    const o = S.mine.open;
    if (!(o && o.status === 'pending' && o.buddy.id === S.me.id)) return '';
    return `<div class="banner"><div class="kicker">Buddy request</div>
      <h3>${esc(o.student.name)} wants you as their buddy</h3>
      <p>${esc(o.purpose)} at <b>${esc(o.dest.name)}</b> · about ${o.travel_min * 2 + o.stay_min} min round trip. Accepting means you go together and stay together.</p>
      <div class="two"><button class="btn small ghost" data-act="decline">Decline</button><button class="btn small" data-act="accept">Accept</button></div></div>`;
  }
  app.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const o = S.mine.open, act = a.dataset.act;
    try {
      if (act === 'accept' || act === 'decline') { await API.respond(o.id, S.me.id, act === 'accept'); }
      if (act === 'back') { await API.back(o.id, S.me.id); S.flow = false; }
      if (act === 'cancel') { await API.cancel(o.id, S.me.id); }
      if (act === 'dismiss') { S.dismissed.add(S.mine.last.id); localStorage.setItem('fs_dismissed', JSON.stringify([...S.dismissed])); }
      if (act === 'retry') { S.dismissed.add(S.mine.last.id); localStorage.setItem('fs_dismissed', JSON.stringify([...S.dismissed])); startFlow(); return; }
    } catch (er) { S.err = er.message; }
    S.lastJson = ''; refresh();
  });

  function viewHome() {
    const l = S.mine.last, showLast = l && !S.dismissed.has(l.id) && (l.status === 'declined' || l.status === 'expired');
    app.innerHTML = `${incomingBanner()}
      ${showLast ? `<div class="err">${l.status === 'declined' ? `${esc(l.buddy.name)} declined your request.` : `${esc(l.buddy.name)} didn't respond in time.`}
        <div style="margin-top:8px"><button class="btn small" data-act="retry">Try again</button> <button class="link" data-act="dismiss">Dismiss</button></div></div>` : ''}
      <div class="kicker">Hey ${esc(S.me.name.split(' ')[0])}</div>
      <h1>Heading out?</h1>
      <p class="sub">Sign out with a buddy so your RA knows where you are and when you'll be back.</p>
      <button class="btn" id="go">Sign out</button>
      <div class="label">Anything else?</div>
      <button class="btn ghost" id="note">Request or feedback</button>
      <p class="note">Goes straight to your RA. Bigger things go to Sunday's Town Hall.</p>
      ${S.notes && S.notes.length ? `<div class="label">What you have sent</div>
        <div class="list">${S.notes.slice(0, 5).map((n) => `<div class="row" style="cursor:default"><b>${esc(kindLabel(n.kind))}</b>
          <span>${esc(n.text)}</span><span class="note" style="margin-top:4px">${n.done_at ? 'Handled' : 'Waiting on your RA'}</span></div>`).join('')}</div>` : ''}`;
    $('#go').onclick = startFlow;
    $('#note').onclick = () => { S.noteOpen = true; S.err = ''; render(); };
  }

  const kindLabel = (k) => ((C.noteKinds || window.FS.noteKinds || []).find((x) => x.key === k) || {}).label || k;

  /* Requests and feedback. Deliberately not a sign-out: no buddy, no map, no timer -- it is a
     message, and making it look like a trip would bury it. */
  function viewNote() {
    const kinds = window.FS.noteKinds;
    app.innerHTML = `${backBtn()}<div class="kicker">Your RA</div><h1>Request or feedback</h1>
      <p class="sub">Anything you want changed, fixed, or tried. Signed with your name.</p>
      ${S.err ? `<div class="err">${esc(S.err)}</div>` : ''}
      <div class="chips">${kinds.map((k) => `<button class="chip ${S.noteKind === k.key ? 'sel' : ''}" data-k="${k.key}">${esc(k.label)}</button>`).join('')}</div>
      <div class="label">What is it?</div>
      <textarea class="field" id="ntext" rows="4" placeholder="e.g. Can we add a Thursday climbing session?">${esc(S.noteText || '')}</textarea>`;
    wireBack();
    dock.classList.remove('hidden');
    dockInner.innerHTML = `<button class="btn" id="nsend" ${S.sending ? 'disabled' : ''}>${S.sending ? 'Sending…' : 'Send to my RA'}</button>`;
    app.onclick = (e) => { const c = e.target.closest('[data-k]'); if (c) { S.noteKind = c.dataset.k; render(); } };
    $('#ntext').oninput = (e) => { S.noteText = e.target.value; };
    $('#nsend').onclick = async () => {
      if (!S.noteKind) { S.err = 'Pick what kind of note this is.'; return render(); }
      if (!(S.noteText || '').trim()) { S.err = 'Write something first.'; return render(); }
      S.sending = true; render();
      try {
        await API.sendNote(S.me.id, S.noteKind, S.noteText);
        S.noteOpen = false; S.noteText = ''; S.noteKind = null; S.err = '';
      } catch (e) { S.err = e.message || 'Could not send that.'; }
      S.sending = false; await refresh(); render();
    };
  }

  function startFlow() { S.flow = true; S.step = 0; S.err = ''; S.d = blank(); render(); }

  const STEPS = ['Buddy', 'Where', 'Why', 'Review'];
  function progress() { return `<div class="progress">${STEPS.map((_, i) => `<span class="${i <= S.step ? 'on' : ''}"></span>`).join('')}</div>`; }
  function backBtn() { return `<button class="back" id="stepback">← ${S.step === 0 ? 'Cancel' : 'Back'}</button>`; }
  function wireBack() { $('#stepback').onclick = () => { if (S.noteOpen) { S.noteOpen = false; S.err = ''; } else if (S.step === 0) { S.flow = false; } else S.step--; render(); }; }

  function viewFlow() {
    const d = S.d;
    if (S.step === 0) {
      app.innerHTML = `${incomingBanner()}${backBtn()}${progress()}<div class="kicker">Step 2</div><h1>Who's your buddy?</h1>
        <p class="sub">They'll get a request and need to accept before you go.</p>
        <div class="grid">${S.roster.filter((p) => p.id !== S.me.id).map((p) => {
          const busy = S.busy.includes(p.id);
          return `<button class="tile ${d.buddy && d.buddy.id === p.id ? 'sel' : ''}" data-id="${p.id}" ${busy ? 'disabled' : ''}>${esc(p.name)}<small>${busy ? 'Already out / pending' : esc(p.grade || '')}</small></button>`;
        }).join('')}</div>`;
      wireBack();
      app.querySelector('.grid').onclick = (e) => { const t = e.target.closest('.tile'); if (!t || t.disabled) return; d.buddy = S.roster.find((p) => p.id === t.dataset.id); S.step = 1; render(); };
    } else if (S.step === 1) {
      app.innerHTML = `${incomingBanner()}${backBtn()}${progress()}<div class="kicker">Step 3</div><h1>Where are you going?</h1>
        <p class="sub">Search a place or tap a favourite.</p>
        <input class="field" id="q" placeholder="e.g. Joe's Pizza, Bryant Park" value="${esc(d.q)}" autocomplete="off">
        <div class="list" id="results"></div>
        ${(C.practices || []).length ? `<div class="label">Practices</div>
        <div class="list">${C.practices.map((p, i) => `<button class="row" data-prac="${i}"><b>${esc(p.name)}</b><span>${esc(p.day)} ${esc(p.time)} · ${esc(p.address)}</span></button>`).join('')}</div>` : ''}
        <div class="label">Nearby favourites</div>
        <div class="list">${C.quickSpots.map((p, i) => `<button class="row" data-spot="${i}"><b>${esc(p.name)}</b><span>${esc(p.address)}</span></button>`).join('')}</div>`;
      wireBack();
      const drawResults = () => { $('#results').innerHTML = d.searching ? '<div class="skeleton"></div>' : d.results.map((p, i) => `<button class="row" data-res="${i}"><b>${esc(p.name)}</b><span>${esc(p.address)}</span></button>`).join(''); };
      drawResults();
      let timer; const q = $('#q');
      q.oninput = () => {
        d.q = q.value; clearTimeout(timer);
        if (d.q.trim().length < 3) { d.results = []; d.searching = false; drawResults(); return; }
        d.searching = true; drawResults();
        timer = setTimeout(async () => {
          try { d.results = await GEO.search(d.q.trim()); } catch (e) { d.results = []; }
          d.searching = false; drawResults();
        }, 450);
      };
      app.onclick = (e) => {
        const r = e.target.closest('[data-res]'), s = e.target.closest('[data-spot]'), pr = e.target.closest('[data-prac]');
        if (pr) {
          // A practice already knows what it is and how long it runs, so step 4 is skipped.
          const p = C.practices[+pr.dataset.prac];
          d.dest = { name: p.name, address: p.address, lat: p.lat, lng: p.lng };
          d.practice = p.name; d.purpose = 'Practice'; d.stay = p.stay || 90; d.ride = p.ride || null;
          d.est = null; S.step = 3; render(); return;
        }
        const pick = r ? d.results[+r.dataset.res] : s ? C.quickSpots[+s.dataset.spot] : null;
        if (pick) { d.dest = pick; d.est = null; S.step = 2; render(); }
      };
    } else if (S.step === 2) {
      app.innerHTML = `${incomingBanner()}${backBtn()}${progress()}<div class="kicker">Step 4</div><h1>What for?</h1>
        <p class="sub">Going to <b>${esc(d.dest.name)}</b>.</p>
        <div class="chips">${C.purposes.map((p) => `<button class="chip ${d.purpose === p.key ? 'sel' : ''}" data-p="${p.key}">${p.key}</button>`).join('')}</div>`;
      wireBack();
      app.onclick = (e) => { const c = e.target.closest('[data-p]'); if (!c) return; d.purpose = c.dataset.p; d.stay = C.purposes.find((p) => p.key === c.dataset.p).stay; S.step = 3; render(); };
    } else {
      viewReview();
    }
  }

  async function ensureEstimate() {
    const d = S.d; if (d.est || d.estLoading) return;
    d.estLoading = true;
    try { d.est = await GEO.estimate(d.dest); d.mode = d.mode || d.est.suggested; } catch (e) { d.est = null; }
    d.estLoading = false; if (S.flow && S.step === 3) viewReview();
  }

  let miniMap;
  function viewReview() {
    const d = S.d; ensureEstimate();
    const tm = d.est && d.mode ? d.est.tiles[d.mode] : null;
    const total = tm != null ? tm * 2 + d.stay : null;
    const due = total != null ? new Date(FS.now() + total * 60000) : null;
    app.innerHTML = `${incomingBanner()}${backBtn()}${progress()}<div class="kicker">Last step</div><h1>Review &amp; send</h1>
      ${S.err ? `<div class="err">${esc(S.err)}</div>` : ''}
      <div class="card">
        <dl class="meta" style="margin-top:0">
          <dt>Buddy</dt><dd>${esc(d.buddy.name)}</dd>
          <dt>Going to</dt><dd>${esc(d.dest.name)}<div class="note" style="margin:0">${esc(d.dest.address || '')}</div></dd>
          <dt>For</dt><dd>${esc(d.purpose)}${d.practice ? ' · recurring' : ''}</dd>
        </dl>
        <div class="minimap" id="mini"></div>
      </div>
      <div class="label">How are you getting there? <span style="text-transform:none;letter-spacing:0;font-weight:500">(one way)</span></div>
      ${d.est ? `<div class="est">${['walk', 'transit', 'car'].map((m) => `<button class="tile ${d.mode === m ? 'sel' : ''}" data-m="${m}"><b>${d.est.tiles[m]}</b><small>min · ${m === 'walk' ? 'Walk' : m === 'transit' ? 'Subway/bus' : 'Car'}</small></button>`).join('')}</div>
        <div class="note">Estimates${d.est.source === 'straight-line' ? ' (map service unreachable — rough straight-line guess)' : ' from map routing; subway and car times are approximate'}.</div>`
        : d.estLoading || !d.est ? '<div class="skeleton"></div>' : ''}
      <div class="label">Time there</div>
      <div class="stepper"><button data-stay="-">−</button><b>${d.stay} min</b><button data-stay="+">+</button></div>
      ${due ? `<div class="hero" style="margin-top:22px"><p>Expected back by</p><div class="big">${due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div><p>${tm} min there + ${d.stay} there + ${tm} min back</p></div>` : ''}`;
    wireBack();
    dock.classList.remove('hidden');
    dockInner.innerHTML = `<button class="btn" id="send" ${!due || S.sending ? 'disabled' : ''}>${S.sending ? 'Sending…' : `Send request to ${esc(d.buddy.name.split(' ')[0])}`}</button>`;
    $('#send').onclick = send;
    app.onclick = (e) => {
      const m = e.target.closest('[data-m]'), s = e.target.closest('[data-stay]');
      if (m) { d.mode = m.dataset.m; viewReview(); }
      if (s) { d.stay = Math.min(C.stayMax, Math.max(C.stayMin, d.stay + (s.dataset.stay === '+' ? C.stayStep : -C.stayStep))); viewReview(); }
    };
    if (miniMap) { miniMap.remove(); miniMap = null; }
    miniMap = L.map('mini', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
    const a = [C.house.lat, C.house.lng], b = [d.dest.lat, d.dest.lng];
    L.circleMarker(a, { radius: 7, color: '#fff', weight: 2, fillColor: '#0000EF', fillOpacity: 1 }).addTo(miniMap);
    L.circleMarker(b, { radius: 7, color: '#fff', weight: 2, fillColor: '#DC2626', fillOpacity: 1 }).addTo(miniMap);
    L.polyline([a, b], { color: '#0000EF', weight: 3, dashArray: '6 6' }).addTo(miniMap);
    miniMap.fitBounds([a, b], { padding: [28, 28], maxZoom: 16 });
  }

  async function send() {
    const d = S.d; if (S.sending) return; S.sending = true; S.err = ''; viewReview();
    try {
      /* A practice suggests how people usually get there, but the student has just said how
         THEY are getting there. Without the old picker the two could disagree — someone taking
         the subway to soccer would still have been filed under the shuttle — so the chosen mode
         wins, and the practice's ride only survives when the mode agrees it is a vehicle. */
      const VEHICLES = ['shuttle', 'rideshare', 'parent'];
      const ride = d.mode === 'walk' ? 'walkOver'
                 : d.mode === 'transit' ? 'transitPass'
                 : VEHICLES.includes(d.ride) ? d.ride : 'rideshare';
      await API.create({ studentId: S.me.id, buddyId: d.buddy.id, dest: d.dest, purpose: d.purpose, mode: d.mode,
                         ride, practice: d.practice, travelMin: d.est.tiles[d.mode], stayMin: d.stay });
      S.flow = false;
    } catch (e) { S.err = e.message; }
    S.sending = false; S.lastJson = ''; await refresh(); if (S.flow) viewReview();
  }

  function viewStatus() {
    const o = S.mine.open, iAmBuddy = o.buddy.id === S.me.id, other = iAmBuddy ? o.student : o.buddy;
    if (miniMap) { miniMap.remove(); miniMap = null; }
    if (o.status === 'pending') {
      app.innerHTML = `<div class="hero"><p><span class="pulse"></span>Waiting for ${esc(o.buddy.name.split(' ')[0])}</p>
          <div class="big">Request sent</div><p>Ask ${esc(o.buddy.name.split(' ')[0])} to open this page on their phone and accept. It expires in ${C.requestTtlMin} minutes.</p></div>
        <dl class="meta"><dt>To</dt><dd>${esc(o.dest.name)}</dd><dt>For</dt><dd>${esc(o.purpose)}</dd></dl>
        <div style="margin-top:22px"><button class="btn ghost" data-act="cancel">Cancel request</button></div>`;
      return;
    }
    app.innerHTML = `<div class="hero" id="hero"><p id="heroTop"></p><div class="big" id="heroBig"></div><p id="heroSub"></p></div>
      <dl class="meta"><dt>With</dt><dd>${esc(other.name)}</dd><dt>At</dt><dd>${esc(o.dest.name)}<div class="note" style="margin:0">${esc(o.dest.address || '')}</div></dd>
        <dt>For</dt><dd>${esc(o.purpose)}</dd><dt>Getting there</dt><dd>${modeLabel[o.mode]} · ${o.travel_min} min each way</dd></dl>
      <div style="margin-top:22px"><button class="btn green" data-act="back">We're back</button>
      <p class="note" style="text-align:center">Tap when you're both back at the house. Stay with your buddy the whole time.</p></div>`;
    tick();
  }

  function tick() {
    const o = S.mine.open; if (!o || o.status !== 'active' || !$('#hero')) return;
    const left = minsLeft(o.due_at), ph = phase(o);
    $('#hero').className = 'hero ' + (ph === 'overdue' ? 'bad' : ph === 'soon' ? 'warn' : 'ok');
    $('#heroTop').textContent = ph === 'overdue' ? 'Overdue — head back now' : "You're signed out";
    $('#heroBig').textContent = left >= 0 ? `${left} min left` : `${-left} min late`;
    $('#heroSub').textContent = `Be back by ${time(o.due_at)}`;
  }
  setInterval(tick, 15000);

  refresh().then(() => { if (!S.lastJson) render(); });
  render();
})();
