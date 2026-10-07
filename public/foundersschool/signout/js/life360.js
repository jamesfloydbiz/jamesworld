// A mock Life360, shaped like the real one.
//
// Why a mock and not the real API: Life360's circles API needs a real account, real
// members, and real teenagers' phones. This demo has twenty invented students. So the
// positions are simulated -- but the *shape* is Life360's, so the day this is pointed at
// a real circle, `members()` is the only function that changes.
//
//   circles()                  -> [{ id, name, memberCount }]
//   members(circleId, at?)     -> [{ id, firstName, lastName, isAdmin, features, issues,
//                                    location: { latitude, longitude, accuracy, speed,
//                                                battery, charge, wifiState, isDriving,
//                                                since, address1, address2, name } }]
//   history(memberId, n, at?)  -> [{ latitude, longitude, since }]
//
// Two deliberate departures from the real thing, both in the honest direction:
//
//  1. A member is a pure function of (student, clock). Nothing is stored. Ask twice at the
//     same instant and the bytes are identical; there is no state to drift, and no illusion
//     that a phone was ever polled.
//
//  2. A student who has not agreed to location sharing has NO coordinate fields at all --
//     not nulls, not zeroes, not a stale last-known point. Handbook section 9 puts sharing
//     at the house's own discretion ("location sharing on for the trip if Town Hall agreed
//     to it"), and section 8 only allows checking a location "if leadership approves" it.
//     An app that models consent as a flag on a record that still carries the coordinates
//     has not modelled consent. Their member object reports status and nothing else.
(function () {
  const C = window.FS_CONFIG, CAL = window.FS_CAL, GEO = window.FS_GEO;

  const CIRCLE = { id: 'fs-house-37wall', name: 'Founders School house' };

  /* ── Routed geometry, cached per place pair ──────────────────────────────
     The board already fetches a road polyline per trip so a dot follows streets instead of
     crossing the East River. Doing that per *student* does not scale: twenty students
     walking home from school is one journey, not twenty. Keyed on the pair, so it is one
     lookup however many people are on it.

     A failed lookup is retried, with a short backoff. Caching the failure forever -- which
     the board currently does -- means one dropped request leaves a leg drawn as a straight
     line for the rest of the session. */
  const legs = new Map();          // 'from>to|profile' -> { line } | { until } while cooling off
  const PROFILE = { walk: 'foot', car: 'car', transit: null };
  const RETRY_MS = 120000;   // the free OSRM instance answers 429 under load; back off properly

  /* `a` and `b` override the place lookup, for journeys whose endpoints are not places in
     the table -- a sign-out destination is a one-off, chosen by a student from a search. */
  function leg(fromKey, toKey, mode, a, b) {
    const prof = PROFILE[mode];
    // No timetable data exists on the free tier, so a subway trip has no honest geometry.
    // Drawing it down a car route would assert a path the app does not know.
    if (!prof) return null;
    const from = a || CAL.places[fromKey], to = b || CAL.places[toKey];
    if (!from || !to) return null;
    const key = `${fromKey}>${toKey}|${prof}`;
    const hit = legs.get(key);
    if (hit && hit.line) return hit.line;
    if (hit && hit.until > Date.now()) return null;              // cooling off after a failure
    legs.set(key, { until: Date.now() + RETRY_MS });
    GEO.routeLine(prof, from, to)
      .then((line) => { legs.set(key, { line }); bump(); })
      .catch(() => { legs.set(key, { until: Date.now() + RETRY_MS }); });
    return null;
  }
  // One callback so a view can redraw when a polyline lands, rather than polling the cache.
  let onLeg = null;
  const bump = () => { if (onLeg) try { onLeg(); } catch (e) {} };
  const legStats = () => ({ pairs: legs.size, loaded: [...legs.values()].filter((v) => v.line).length });

  /* ── A phone's battery ───────────────────────────────────────────────────
     Not decoration. An RA looking at a map wants to know whether a flat dot means a student
     who is still, or a phone that died twenty minutes ago -- those are very different
     situations, and the real API carries `battery` and `charge` for exactly that reason.
     Drains through the waking day, charges overnight, and is a function of the clock like
     everything else here. */
  function battery(name, now) {
    const h = now.getHours() + now.getMinutes() / 60;
    const start = 72 + (CAL.hash(name) % 28);                    // a different phone each
    if (h < 7) return { level: Math.min(100, Math.round(start + (7 - h) * 4)), charge: true };
    const drain = (h - 7) * (4.0 + (CAL.hash(name + 'd') % 20) / 10);
    return { level: Math.max(3, Math.round(start - drain)), charge: false };
  }

  const first = (n) => String(n).split(' ')[0];
  /* Two positions are "the same place" when they are at the same named place, or within
     120m of each other -- a student signed out to the bodega across from the house has not
     gone off-plan, and flagging them would train an RA to ignore the flag. */
  function samePlace(a, b) {
    if (!a || !b || !a.place || !b.place) return false;
    if (a.place.key && a.place.key === b.place.key) return true;
    return GEO.haversineKm(a.place, b.place) < 0.12;
  }
  const last = (n) => String(n).split(' ').slice(1).join(' ');

  /* ── The circle ──────────────────────────────────────────────────────────── */
  function circles() { return [{ id: CIRCLE.id, name: CIRCLE.name, memberCount: CAL.names.length }]; }

  function member(name, when) {
    const now = when ? new Date(when) : CAL.now();
    const pr = CAL.profile(name), at = CAL.locate(name, now);
    const bat = battery(name, now);
    const base = {
      id: 'm-' + CAL.hash(name).toString(36),
      firstName: first(name), lastName: last(name),
      isAdmin: '0', avatar: null,
      // Not part of Life360's payload. Carried alongside it because the rest of the app
      // needs to know what the student is *meant* to be doing to say whether the position
      // agrees with it, and that comparison is the whole point.
      schedule: { state: at.state, title: at.entry ? at.entry.title : null,
                  placeName: at.place.name, placeKey: at.place.key,
                  next: at.next ? { title: at.next.title, start: at.next.start, place: at.next.place } : null,
                  eta: at.eta || null, leaveAt: at.leaveAt || null, kind: at.entry ? at.entry.kind : null },
      features: { device: '1', smartphone: '1', nonSmartphone: '0', shareLocation: pr.share ? '1' : '0' },
      issues: { disconnected: '0', type: null, status: null,
                title: pr.share ? null : 'Location sharing off', dialog: null,
                action: null, troubleshooting: '0' },
    };
    if (!pr.share) {
      // No `location` key at all. See the note at the top of this file.
      base.issues.disconnected = '1';
      base.issues.type = 'sharing_off';
      base.issues.status = 'Not shared — Town Hall has not agreed for this student';
      return base;
    }

    let lat = at.place.lat, lng = at.place.lng, speed = 0, isDriving = '0', accuracy = 12;
    let addr1 = at.place.address || '', placeName = at.place.name;
    if (at.state === 'transit') {
      const line = leg(at.from.key, at.place.key, at.mode);
      const pt = line ? GEO.pointAt(line, at.frac) : null;
      if (pt) { lat = pt[0]; lng = pt[1]; }
      else {
        // No routed geometry yet (or a subway trip, which has none). Interpolate the straight
        // line, which reads as direction rather than as a claimed route.
        lat = at.from.lat + (at.place.lat - at.from.lat) * at.frac;
        lng = at.from.lng + (at.place.lng - at.from.lng) * at.frac;
      }
      speed = at.mode === 'walk' ? 1.3 : at.mode === 'car' ? 7.5 : 9.0;   // m/s
      isDriving = at.mode === 'walk' ? '0' : '1';
      accuracy = at.mode === 'walk' ? 14 : 28;
      addr1 = `On the way to ${at.place.name}`;
      placeName = null;                       // Life360 only names a place when you are at one
    }
    base.location = {
      latitude: String(lat), longitude: String(lng),
      accuracy: String(accuracy), startTimestamp: String(Math.floor(+at.since / 1000)),
      since: Math.floor(+at.since / 1000),
      timestamp: String(Math.floor(+now / 1000)),
      speed, isDriving, driveSDKStatus: null,
      battery: String(bat.level), charge: bat.charge ? '1' : '0',
      wifiState: at.state === 'transit' ? '0' : '1',
      address1: addr1, address2: at.state === 'transit' ? '' : (at.entry ? at.entry.title : ''),
      name: placeName, shortAddress: addr1,
      inTransit: at.state === 'transit' ? '1' : '0',
      // SIMULATED. Flagged inside the payload itself, so nothing downstream can forget it.
      source: 'simulated', sourceId: 'FS_L360_MOCK',
    };
    if (bat.level <= 15 && !bat.charge) { base.issues.type = 'low_battery'; base.issues.title = 'Battery low'; }
    return base;
  }

  function members(circleId, when) {
    const roster = window.FS_L360.roster || CAL.names;
    return roster.map((n) => member(n, when));
  }

  /* The last n positions, newest first, at five-minute spacing -- the real endpoint's
     breadcrumb trail. Derived the same way, so a trail can never disagree with the dot. */
  function history(memberId, n, when) {
    const roster = window.FS_L360.roster || CAL.names;
    const name = roster.find((x) => 'm-' + CAL.hash(x).toString(36) === memberId);
    if (!name || !CAL.profile(name).share) return [];
    const now = when ? new Date(when) : CAL.now();
    const out = [];
    for (let i = 0; i < (n || 12); i++) {
      const t = new Date(+now - i * 5 * 60000);
      const m = member(name, t);
      if (m.location) out.push({ latitude: m.location.latitude, longitude: m.location.longitude, since: m.location.since });
    }
    return out;
  }

  /* ── What the RA board actually asks ─────────────────────────────────────
     Life360 answers "where is this phone". An RA asks "is everyone where they should be",
     which is the roster grouped by place plus the one list that matters: who is not where
     their calendar says. Flagging that is the only new capability here; the rest is
     visibility onto a schedule the house already published. */
  /* `overrides` is how a real signal beats a predicted one. The schedule says where a
     student is *meant* to be; an open sign-out is a student telling the house where they
     actually went. Where both exist the sign-out wins, and the difference between them is
     the one genuinely new thing on the RA board: somebody off-schedule. */
  function headcount(when, overrides) {
    const now = when ? new Date(when) : CAL.now();
    const roster = window.FS_L360.roster || CAL.names;
    const groups = new Map(), transit = [], unshared = [];
    roster.forEach((name) => {
      const pr = CAL.profile(name);
      const planned = CAL.locate(name, now);
      const over = overrides && overrides.get ? overrides.get(name) : null;
      const at = over || planned;
      const row = { name, first: first(name), at, planned, offPlan: !!over && !samePlace(over, planned), shared: pr.share };
      if (!pr.share) { unshared.push(row); return; }
      if (at.state === 'transit') { transit.push(row); return; }
      const k = at.place.key;
      if (!groups.has(k)) groups.set(k, { place: at.place, rows: [] });
      groups.get(k).rows.push(row);
    });
    const n = (k) => (groups.get(k) ? groups.get(k).rows.length : 0);
    const offPlan = [...groups.values()].flatMap((g) => g.rows).concat(transit).filter((r) => r.offPlan);
    // Boarding is split across two flats, so "at home" is a total with a split behind it.
    const homes = CAL.homes.map((k) => ({ key: k, place: CAL.places[k], n: n(k) }));
    return {
      at: now, groups, transit, unshared,
      homes, house: homes.reduce((a, h) => a + h.n, 0), school: n('school'), offPlan,
      out: [...groups.entries()].filter(([k]) => !CAL.isHome(k) && k !== 'school')
        .reduce((a, [, g]) => a + g.rows.length, 0),
      moving: transit.length, unaccounted: unshared.length, roster: roster.length,
    };
  }

  window.FS_L360 = {
    circles, members, history, headcount, battery,
    leg, legStats, onLeg: (fn) => { onLeg = fn; },
    roster: null,                 // set by a page that has a live roster, else CAL.names
    circleId: CIRCLE.id, simulated: true,
  };
})();
