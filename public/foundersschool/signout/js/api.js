// Data layer. Same interface in demo mode (localStorage) and Supabase mode (RPC functions).
(function () {
  const C = window.FS_CONFIG;
  const demo = !C.supabaseUrl;
  const OPEN = ['pending', 'active'];

  /* ---------------- Supabase mode ---------------- */
  function sbApi() {
    async function rpc(fn, args) {
      const r = await fetch(`${C.supabaseUrl}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey, Authorization: `Bearer ${C.supabaseKey}` },
        body: JSON.stringify(args || {}),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.message || 'Something went wrong. Try again.');
      return body;
    }
    return {
      roster: () => rpc('fs_roster'),
      create: (d) => rpc('fs_create', {
        p_student: d.studentId, p_buddy: d.buddyId, p_dest_name: d.dest.name, p_dest_address: d.dest.address || '',
        p_lat: d.dest.lat, p_lng: d.dest.lng, p_purpose: d.purpose, p_mode: d.mode, p_travel: d.travelMin, p_stay: d.stayMin,
      }),
      mine: (sid) => rpc('fs_mine', { p_student: sid, p_ttl: C.requestTtlMin }),
      respond: (id, sid, accept) => rpc('fs_respond', { p_id: id, p_student: sid, p_accept: accept }),
      back: (id, sid) => rpc('fs_back', { p_id: id, p_student: sid }),
      cancel: (id, sid) => rpc('fs_cancel', { p_id: id, p_student: sid }),
      dash: (pin) => rpc('fs_dash', { p_pin: pin, p_ttl: C.requestTtlMin }),
      raBack: (pin, id) => rpc('fs_ra_back', { p_pin: pin, p_id: id }),
      sendNote: (studentId, kind, text) => rpc('fs_note_add', { p_student: studentId, p_kind: kind, p_text: text }),
      myNotes: (studentId) => rpc('fs_notes_mine', { p_student: studentId }),
      resolveNote: (pin, id) => rpc('fs_note_done', { p_pin: pin, p_id: id }),
      addStudent: (pin, name, grade) => rpc('fs_ra_add', { p_pin: pin, p_name: name, p_grade: grade || '' }),
      removeStudent: (pin, id) => rpc('fs_ra_remove', { p_pin: pin, p_id: id }),
    };
  }

  /* ---------------- Demo mode ---------------- */
  function demoApi() {
    const KEY = 'fs_demo_v2';   // bump when the seeded roster or demo data changes, so
                                // returning visitors are not pinned to the old store
    const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id' + Math.random().toString(36).slice(2) + Date.now());
    const names = ['Maya Chen', 'Jordan Reyes', 'Amara Okafor', 'Theo Bennett', 'Sofia Alvarez', 'Noah Kim', 'Liam Patel',
      'Zara Hussain', 'Eli Goldberg', 'Nia Thompson', 'Mateo Rossi', 'Priya Nair', 'Dante Oyelaran', 'Hana Watanabe',
      'Ruby Castellanos', 'Omar Haddad', 'Sloane Marchetti', 'Kofi Boateng', 'Ingrid Lindqvist', 'Tomas Silva'];
    function load() {
      let s; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (!s) s = { students: names.map((n) => ({ id: uid(), name: n, grade: '9th', active: true })), signouts: [], notes: [] };
      if (!s.notes) s.notes = [];
      return s;
    }
    const save = (s) => localStorage.setItem(KEY, JSON.stringify(s));
    const nm = (s, id) => { const x = s.students.find((t) => t.id === id); return { id, name: x ? x.name : '?' }; };
    const shape = (s, r) => ({
      id: r.id, status: r.status, student: nm(s, r.student_id), buddy: nm(s, r.buddy_id),
      dest: { name: r.dest_name, address: r.dest_address, lat: r.lat, lng: r.lng },
      purpose: r.purpose, mode: r.mode, ride: r.ride || null, practice: r.practice || null, travel_min: r.travel, stay_min: r.stay,
      created_at: r.created_at, accepted_at: r.accepted_at, due_at: r.due_at, returned_at: r.returned_at,
    });
    const involves = (r, id) => r.student_id === id || r.buddy_id === id;
    function expire(s, ttl) {
      const cut = Date.now() - ttl * 60000;
      s.signouts.forEach((r) => { if (r.status === 'pending' && new Date(r.created_at).getTime() < cut) r.status = 'expired'; });
      // Demo data has to stop rotting. A seeded trip from two days ago stayed "active"
      // forever, so the board reported a rising overdue count and flagged half the house
      // as off-schedule. Anything three hours past due is closed out.
      const stale = Date.now() - 3 * 3600000;
      s.signouts.forEach((r) => {
        if (r.status === 'active' && r.due_at && new Date(r.due_at).getTime() < stale) {
          r.status = 'returned'; r.returned_at = r.due_at;
        }
      });
    }
    const wrap = async (f) => { const s = load(); const out = f(s); save(s); return out; };
    return {

      // Demo-only helpers: fill the board with realistic activity, or wipe it.
      demoSeed: () => wrap((s) => {
        const id = (first) => s.students.find((t) => t.name.startsWith(first)).id, min = (m) => new Date(Date.now() + m * 60000).toISOString();
        const mk = (a, b, dest, addr, lat, lng, purpose, mode, travel, stay, status, createdAgo, dueIn, retAgo, ride, practice) => ({
          id: uid(), student_id: id(a), buddy_id: id(b), dest_name: dest, dest_address: addr, lat, lng, purpose, mode, travel, stay, status,
          ride: ride || null, practice: practice || null,
          created_at: min(-createdAgo), accepted_at: status === 'pending' ? null : min(-createdAgo + 1),
          due_at: status === 'pending' ? null : min(dueIn), returned_at: retAgo != null ? min(-retAgo) : null });
        s.signouts = [
          mk('Maya', 'Jordan', 'Fulton Center', 'Broadway & Fulton St, Manhattan', 40.7103, -74.0091, 'Food', 'walk', 5, 25, 'active', 12, 28),
          mk('Amara', 'Theo', 'Brookfield Place', '230 Vesey St, Manhattan', 40.7129, -74.0150, 'Errand', 'walk', 9, 15, 'active', 34, 6),
          mk('Sofia', 'Noah', 'Swim — Asphalt Green Battery Park', '212 North End Ave, Manhattan', 40.7161, -74.0163, 'Practice', 'walk', 12, 90, 'active', 71, -9, null, 'walkOver', 'Swim — Asphalt Green Battery Park'),
          mk('Mateo', 'Priya', 'Soccer — Pier 40', '353 West St, Manhattan', 40.7300, -74.0110, 'Practice', 'car', 14, 90, 'active', 109, 9, null, 'rideshare', 'Soccer — Pier 40'),
          mk('Nia', 'Eli', 'Basketball — Boys & Girls Republic', '888 E 6th St, Manhattan', 40.7236, -73.9780, 'Practice', 'car', 16, 90, 'active', 6, 117, null, 'shuttle', 'Basketball — Boys & Girls Republic'),
          mk('Liam', 'Zara', 'Stone Street', 'Financial District, Manhattan', 40.7040, -74.0106, 'Food', 'walk', 6, 30, 'pending', 2, null),
          mk('Eli', 'Nia', 'Oculus / World Trade Center', '185 Greenwich St, Manhattan', 40.7115, -74.0116, 'Meeting', 'walk', 8, 30, 'returned', 95, -40, 38),
        ];
        return { ok: true };
      }),
      demoReset: () => wrap((s) => {
        s.signouts = []; s.notes = [];
        s.students = names.map((n) => ({ id: uid(), name: n, grade: '9th', active: true }));
        return { ok: true };
      }),
      roster: () => wrap((s) => {
        expire(s, C.requestTtlMin);
        const busy = []; s.signouts.filter((r) => OPEN.includes(r.status)).forEach((r) => busy.push(r.student_id, r.buddy_id));
        return { students: s.students.filter((t) => t.active).map(({ id, name, grade }) => ({ id, name, grade })), busy };
      }),
      create: (d) => wrap((s) => {
        expire(s, C.requestTtlMin);
        if (d.studentId === d.buddyId) throw new Error('Pick a different buddy.');
        for (const id of [d.studentId, d.buddyId]) {
          if (s.signouts.some((r) => OPEN.includes(r.status) && involves(r, id)))
            throw new Error(id === d.studentId ? 'You already have an open sign-out.' : `${nm(s, id).name} is already signed out or has a pending request.`);
        }
        const r = { id: uid(), student_id: d.studentId, buddy_id: d.buddyId, dest_name: d.dest.name, dest_address: d.dest.address || '',
          lat: d.dest.lat, lng: d.dest.lng, purpose: d.purpose, mode: d.mode, ride: d.ride || null, practice: d.practice || null,
          travel: d.travelMin, stay: d.stayMin,
          status: 'pending', created_at: new Date().toISOString(), accepted_at: null, due_at: null, returned_at: null };
        s.signouts.push(r); return shape(s, r);
      }),
      mine: (sid) => wrap((s) => {
        expire(s, C.requestTtlMin);
        const mineAll = s.signouts.filter((r) => involves(r, sid));
        const open = mineAll.find((r) => OPEN.includes(r.status));
        const last = [...mineAll].reverse().find((r) => !OPEN.includes(r.status) && r.student_id === sid && r.status !== 'cancelled');
        return { open: open ? shape(s, open) : null, last: last ? shape(s, last) : null };
      }),
      respond: (id, sid, accept) => wrap((s) => {
        expire(s, C.requestTtlMin);
        const r = s.signouts.find((x) => x.id === id);
        if (!r || r.buddy_id !== sid || r.status !== 'pending') throw new Error('This request is no longer open.');
        if (accept) { r.status = 'active'; r.accepted_at = new Date().toISOString(); r.due_at = new Date(Date.now() + (2 * r.travel + r.stay) * 60000).toISOString(); }
        else r.status = 'declined';
        return shape(s, r);
      }),
      back: (id, sid) => wrap((s) => {
        const r = s.signouts.find((x) => x.id === id);
        if (!r || !involves(r, sid) || r.status !== 'active') throw new Error('Nothing to return.');
        r.status = 'returned'; r.returned_at = new Date().toISOString(); return shape(s, r);
      }),
      cancel: (id, sid) => wrap((s) => {
        const r = s.signouts.find((x) => x.id === id);
        if (r && r.student_id === sid && r.status === 'pending') r.status = 'cancelled';
        return { ok: true };
      }),
      dash: (pin) => wrap((s) => {
        if (pin !== C.demoRaPin) throw new Error('Wrong passcode.');
        expire(s, C.requestTtlMin);
        const cut = Date.now() - 24 * 3600000;
        const rows = s.signouts.filter((r) => OPEN.includes(r.status) || new Date(r.created_at).getTime() > cut).map((r) => shape(s, r)).reverse();
        return { signouts: rows, students: s.students.filter((t) => t.active).map(({ id, name, grade }) => ({ id, name, grade })),
                 notes: [...s.notes].reverse().map((n) => ({ ...n, from: nm(s, n.student_id).name })) };
      }),
      raBack: (pin, id) => wrap((s) => {
        if (pin !== C.demoRaPin) throw new Error('Wrong passcode.');
        const r = s.signouts.find((x) => x.id === id);
        if (r && r.status === 'active') { r.status = 'returned'; r.returned_at = new Date().toISOString(); }
        return { ok: true };
      }),
      /* Requests and feedback from students. The handbook has them writing the house norms at
         a weekly Town Hall, so this is the between-meetings version of the same thing: anything
         that should not wait for Sunday, in front of the RA the moment it is written. */
      sendNote: (studentId, kind, text) => wrap((s) => {
        const body = String(text || '').trim();
        if (!body) throw new Error('Write something first.');
        s.notes.push({ id: uid(), student_id: studentId, kind, text: body.slice(0, 600),
          created_at: new Date().toISOString(), done_at: null });
        return { ok: true };
      }),
      myNotes: (studentId) => wrap((s) => ({
        notes: s.notes.filter((n) => n.student_id === studentId).reverse() })),
      resolveNote: (pin, id) => wrap((s) => {
        if (pin !== C.demoRaPin) throw new Error('Wrong passcode.');
        const n = s.notes.find((x) => x.id === id);
        if (n && !n.done_at) n.done_at = new Date().toISOString();
        return { ok: true };
      }),
      addStudent: (pin, name, grade) => wrap((s) => {
        if (pin !== C.demoRaPin) throw new Error('Wrong passcode.');
        s.students.push({ id: uid(), name, grade: grade || '', active: true }); return { ok: true };
      }),
      removeStudent: (pin, id) => wrap((s) => {
        if (pin !== C.demoRaPin) throw new Error('Wrong passcode.');
        const t = s.students.find((x) => x.id === id); if (t) t.active = false; return { ok: true };
      }),
    };
  }

  window.FS_API = Object.assign(demo ? demoApi() : sbApi(), { demo });

  /* ---------------- shared helpers ---------------- */
  window.FS = {
    esc: (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    time: (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    minsLeft: (iso) => Math.round((new Date(iso).getTime() - Date.now()) / 60000),
    // status the dashboard/student UI shows: pending | active | soon | overdue | closed
    phase(r) {
      if (r.status === 'pending') return 'pending';
      if (r.status !== 'active') return 'closed';
      const left = FS.minsLeft(r.due_at);
      if (left < -C.graceMin) return 'overdue';
      if (left <= C.soonMin) return 'soon';
      return 'active';
    },
    noteKinds: [
      { key: 'request', label: 'Request' },
      { key: 'idea',    label: 'Idea for the house' },
      { key: 'issue',   label: 'Something is wrong' },
      { key: 'feedback', label: 'Feedback' },
    ],
    modeLabel: { walk: 'Walking', transit: 'Subway / bus', car: 'Car / rideshare' },
    rideLabel: { shuttle: 'House shuttle', rideshare: 'Rideshare', transitPass: 'Subway / bus', parent: 'Parent pickup', walkOver: 'Walking' },
  };
})();
