// The week, as data.
//
// The sign-out app answers "who is out right now". This answers "where is everyone
// *meant* to be", which is what makes the difference between a log and a tracking app:
// without a schedule there is nothing for a position to agree or disagree with.
//
// Two kinds of fact live here, and they are tagged so a reader can tell them apart:
//   src:'doc'      — from the Student Life Handbook or the House Week sample. The times,
//                    venues and rituals are quoted, and the section is named in a comment.
//   src:'invented' — plausible filler so the demo has twenty different weeks. Every
//                    student, family and activity below is made up. No real child is here.
//
// Nothing is stored per day. A day is computed from a weekly template plus the student's
// own recurring activities, so there is no state to drift out of sync with the clock.
(function () {
  const C = window.FS_CONFIG, GEO = window.FS_GEO;

  /* ── The clock ───────────────────────────────────────────────────────────
     Everything here is derived from "now", which makes the app honest but also makes it
     impossible to show someone the 6pm rush at 11 in the morning, or to check a whole day
     without waiting one. `?t=2026-10-19T18:40` sets the starting point; the clock then runs
     forward normally from there, so journeys still move. Without it this is Date.now().
     It shifts the SCHEDULE only -- sign-outs keep real timestamps, because those are real
     records with real due times, and quietly reinterpreting them would be a lie. */
  let skew = 0;
  function resolveClock(spec) {
    if (!spec || spec === 'now') return 0;
    // 'Mon 18:55' -- that weekday of the current week. Stays fresh; an absolute date would
    // have the board stuck in October forever.
    const rel = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(\d{1,2}):(\d{2})$/.exec(spec);
    if (rel) {
      const want = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(rel[1]);
      // The matching weekday of the week we are in, not the next one -- otherwise visiting
      // on a Tuesday jumps the board six days forward.
      const d = new Date(); d.setDate(d.getDate() + ((want + 6) % 7) - ((d.getDay() + 6) % 7));
      d.setHours(+rel[2], +rel[3], 0, 0);
      return +d - Date.now();
    }
    const d = new Date(spec);
    return isNaN(+d) ? 0 : +d - Date.now();
  }
  try {
    const q = typeof location !== 'undefined' && new URLSearchParams(location.search).get('t');
    skew = resolveClock(q || C.demoClock);
  } catch (e) {}
  const now = () => new Date(Date.now() + skew);
  const shifted = () => skew !== 0;

  /* ── Dates ───────────────────────────────────────────────────────────────
     The app has no date library and no week arithmetic, so the handful of
     primitives this file needs live here rather than pulling in a dependency
     for six functions. Everything is local time: the house, the school and
     every venue are in one timezone, so there is nothing to convert. */
  const DAY = 86400000;
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  /* Calendar arithmetic, not millisecond arithmetic. Adding n * 86400000 is wrong twice a
     year: clocks going back on 1 November 2026 made "two weeks after Monday 19 October"
     land at 23:00 the previous Sunday, which then resolved to the wrong week entirely.
     setDate keeps local midnight across the shift. */
  const addDays = (d, n) => { const x = startOfDay(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
  const dow = (d) => new Date(d).getDay();                       // 0 Sun … 6 Sat
  // The Monday of the week containing d. Sunday belongs to the week it *ends*, because
  // Town Hall on Sunday evening is where the house preps the week that just closed.
  const mondayOf = (d) => addDays(d, -((dow(d) + 6) % 7));
  const at = (d, hhmm) => {
    const [h, m] = String(hhmm).split(':').map(Number);
    const x = startOfDay(d); x.setHours(h, m, 0, 0); return x;
  };
  const isoDay = (d) => { const x = startOfDay(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const minutesBetween = (a, b) => (new Date(b) - new Date(a)) / 60000;
  const DAY_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Week number since a fixed epoch. Used to seed the anecdotes, so a family reading
  // the same week twice sees the same week rather than a fresh invention each reload.
  // round, not floor: an hour of DST slippage must not tip a week over its boundary.
  const weekIndex = (d) => Math.round((mondayOf(d) - new Date(2026, 0, 5)) / (7 * DAY));

  // FNV-1a. Used for entry ids and for seeding anything that must look varied but stay
  // identical on reload -- a family re-reading last week should see last week.
  function hash(str) { let h = 2166136261; for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ── Places ──────────────────────────────────────────────────────────────
     Every venue the house actually uses, from the House Week sample, plus the ones
     invented for individual students. Keeping them in one table matters for more than
     tidiness: travel is routed per *place pair*, so twenty students walking home from
     school share one route lookup instead of twenty. */
  const P = {
    // One entry per residence. `HOMES` is the set of keys, so anything asking "is this
    // home?" asks once rather than comparing against a literal in nine places.
    ...Object.fromEntries(C.houses.map((h) => [h.key,
      { name: h.name, short: h.short, address: h.address, lat: h.lat, lng: h.lng, src: 'doc', home: true }])),
    school:    { name: C.school.name,  address: C.school.address, lat: C.school.lat, lng: C.school.lng, src: 'doc', ride: 'walk' },
    // Monday's movement night. The House Week sample used Henry Street Settlement, which is
    // a 25-minute shuttle run each way; Life Time at One Wall Street is a walk from both
    // flats, which is the difference between an evening out and an evening in transit.
    lifetime:  { name: 'Life Time One Wall Street',    address: '1 Wall Street, Manhattan',       lat: 40.7075, lng: -74.0113, src: 'invented', ride: 'walk' },
    // Still here: the House Week names it, and it is one of the sign-out quick picks.
    henry:     { name: 'Henry Street Settlement',      address: '301 Henry St, Manhattan',        lat: 40.7138, lng: -73.9830, src: 'doc', ride: 'car' },
    republic:  { name: 'Boys & Girls Republic',        address: '888 E 6th St, Manhattan',        lat: 40.7236, lng: -73.9780, src: 'doc', ride: 'car' },
    // House Week, Thursday — the free Fleet Feet group run
    fleetfeet: { name: 'Fleet Feet Columbus Circle',   address: '103 W 59th St, Manhattan',       lat: 40.7681, lng: -73.9819, src: 'doc', ride: 'transit' },
    // House Week, Friday — Whitney Free Friday Night
    whitney:   { name: 'Whitney Museum',               address: '99 Gansevoort St, Manhattan',    lat: 40.7396, lng: -74.0089, src: 'doc', ride: 'transit' },
    // House Week, Sunday morning — kitchen shift
    godslove:  { name: "God's Love We Deliver",        address: '166 Ave of the Americas, Manhattan', lat: 40.7246, lng: -74.0030, src: 'doc', ride: 'transit' },
    // House Week, Saturday — Five Boroughs, One Day
    bbpark:    { name: 'Brooklyn Bridge Park, Pier 1', address: 'Old Fulton St, Brooklyn',        lat: 40.7003, lng: -73.9967, src: 'doc', ride: 'walk' },
    whitehall: { name: 'Whitehall Terminal',           address: '4 South St, Manhattan',          lat: 40.7013, lng: -74.0134, src: 'doc', ride: 'walk' },
    arthurave: { name: 'Arthur Avenue Market',         address: '2344 Arthur Ave, The Bronx',     lat: 40.8547, lng: -73.8870, src: 'doc', ride: 'transit' },
    nightmkt:  { name: 'Queens Night Market',          address: 'Flushing Meadows Corona Park, Queens', lat: 40.7459, lng: -73.8463, src: 'doc', ride: 'transit' },
    // Named in the handbook/House Week but not scheduled this week
    nuyorican: { name: 'Nuyorican Poets Cafe',         address: '236 E 3rd St, Manhattan',        lat: 40.7222, lng: -73.9823, src: 'doc', ride: 'transit' },
    boulders:  { name: 'Brooklyn Boulders Queensbridge', address: '23-10 41st Ave, Queens',       lat: 40.7503, lng: -73.9440, src: 'doc', ride: 'transit' },
    // Already in config.js as recurring practices
    pier40:    { name: 'Pier 40',                      address: '353 West St, Manhattan',         lat: 40.7300, lng: -74.0110, src: 'doc', ride: 'car' },
    asphalt:   { name: 'Asphalt Green Battery Park',   address: '212 North End Ave, Manhattan',   lat: 40.7161, lng: -74.0163, src: 'doc', ride: 'walk' },
    // Invented venues for individual students' own activities
    strasberg: { name: 'Lee Strasberg Institute',      address: '115 E 15th St, Manhattan',       lat: 40.7355, lng: -73.9890, src: 'invented', ride: 'transit' },
    churchst:  { name: 'Church Street Boxing',         address: '25 Park Pl, Manhattan',          lat: 40.7129, lng: -74.0075, src: 'invented', ride: 'walk' },
    gibney:    { name: 'Gibney Dance',                 address: '280 Broadway, Manhattan',        lat: 40.7146, lng: -74.0053, src: 'invented', ride: 'walk' },
    pottery:   { name: 'Greenwich House Pottery',      address: '16 Jones St, Manhattan',         lat: 40.7318, lng: -74.0024, src: 'invented', ride: 'transit' },
    trinity:   { name: 'Trinity Church Wall Street',   address: '75 Broadway, Manhattan',         lat: 40.7081, lng: -74.0122, src: 'invented', ride: 'walk' },
    inwood:    { name: 'Inwood Hill Park',             address: 'Dyckman St, Manhattan',          lat: 40.8716, lng: -73.9262, src: 'doc', ride: 'transit' },
    battery:   { name: 'Battery Park',                 address: 'Battery Pl, Manhattan',          lat: 40.7033, lng: -74.0170, src: 'doc', ride: 'walk' },
  };
  Object.keys(P).forEach((k) => { P[k].key = k; });
  const HOMES = C.houses.map((h) => h.key);
  const isHome = (k) => P[k] && P[k].home === true;

  /* Travel time, straight from distance. Deliberately not a routing call: the schedule has
     to be a pure function of the clock, and awaiting a network round trip per leg would make
     it neither pure nor fast. The routed polyline is used for *drawing* the journey; these
     numbers are what the schedule is built on, and the UI labels them as estimates.

     HOW the house gets somewhere is a property of the place, not of the distance. The job
     description asks the RA to coordinate "shuttle rhythms", and config.js already assigns
     each recurring practice a ride: the house shuttle to Henry Street, a rideshare to Pier
     40, the subway to Columbus Circle, walking to Asphalt Green. Inferring it from distance
     instead got this wrong in both directions -- it put the whole house on the subway to an
     open gym the shuttle runs to, and it meant no leg had a drawable route. */
  const SPEED = { walk: 4.8, transit: 17, car: 23 };   // km/h door to door, city averages
  const travelCache = new Map();
  function travel(fromKey, toKey) {
    const key = fromKey + '>' + toKey;
    if (travelCache.has(key)) return travelCache.get(key);
    const a = P[fromKey], b = P[toKey];
    const km = GEO.haversineKm(a, b) * 1.3;            // streets are not straight lines
    const walkMin = Math.max(3, Math.round((km / SPEED.walk) * 60));
    // The destination decides; coming home is the same way you went.
    const pref = (isHome(toKey) ? a.ride : b.ride) || 'walk';
    const mode = pref === 'walk' && walkMin > 25 ? 'car' : pref;
    const out = mode === 'walk'
      ? { mode, min: walkMin, km }
      : { mode, min: Math.max(6, Math.round((km / SPEED[mode]) * 60) + (mode === 'transit' ? 8 : 4)), km };
    travelCache.set(key, out);
    return out;
  }

  /* ── The house week ──────────────────────────────────────────────────────
     Handbook section 5, "Daily and weekly rhythm", gives the school-night clock, and
     section 10 gives the slot for each evening. Both are quoted exactly. School runs
     08:45 to 17:00 at 180 Maiden Lane, a few minutes' walk from either flat, which is
     the handbook's own "5:00 to 5:15pm: arrive home and eat a healthy snack". */
  const SCHOOL = { days: [1, 2, 3, 4, 5], start: '08:45', end: '17:00' };
  const EVENING_SLOT = {                                        // handbook section 10
    0: 'Town Hall + week prep', 1: 'Move: team', 2: 'Cook', 3: 'Rest, or pitch roast',
    4: 'Move: solo skill', 5: 'Out', 6: 'Statement piece',
  };

  /* An entry's id is derived from what the entry *is*, not from a counter. A counter made
     two calls at the same instant return different ids, which broke the one property the
     whole design rests on: ask the same question at the same clock, get the same answer. */
  const mk = (o) => {
    const e = Object.assign({ kind: 'house', src: 'doc', who: 'house' }, o);
    e.id = 'c' + hash(`${e.start ? +e.start : 0}|${e.title}|${e.place}`).toString(36);
    return e;
  };

  /* The parts of the day that are the same for everyone. A student's own activities are
     merged over the top of this, replacing whatever block they collide with. */
  function houseDay(date, home) {
    const d = dow(date), E = [], add = (o) => E.push(mk(Object.assign({ date, place: home }, o)));

    if (SCHOOL.days.includes(d)) {
      add({ kind: 'school', title: 'School day', place: 'school',
            start: at(date, SCHOOL.start), end: at(date, SCHOOL.end), note: 'Founders School, 180 Maiden Lane' });
    }

    if (d >= 1 && d <= 3) {           // Monday to Wednesday: the full school-night clock
      add({ title: 'Snack and a word with the RA', start: at(date, '17:10'), end: at(date, '17:25') });
      // "5:15 to 6:15 Practice block. Everyone practices at once, in the common room or
      // the park." Shifted eight minutes later than the handbook's clock because school
      // now ends at 5pm and 180 Maiden Lane is a few minutes' walk from either flat.
      add({ kind: 'practice', title: 'Practice block', start: at(date, '17:25'), end: at(date, '18:15'),
            note: 'Something you enjoy getting better at, unrelated to your business' });
      add({ title: 'Log the session', start: at(date, '18:15'), end: at(date, '18:30') });
      // Open gym is now a walk rather than a ride across town, so Monday eats at the normal
      // time and still gets there for seven.
      const dinS = '18:30', dinE = d === 1 ? '18:45' : '19:30';
      add({ kind: 'meal', title: d === 1 ? 'Family dinner — short, open gym is at 7' : 'Family dinner',
            start: at(date, dinS), end: at(date, dinE), note: 'Phones in a basket' });
      add({ kind: 'evening', title: EVENING_SLOT[d], start: at(date, '19:30'), end: at(date, '21:00') });
      add({ title: 'Chores and free time', start: at(date, '21:00'), end: at(date, '21:30') });
      add({ title: 'Wind down \u00b7 lights out 10pm', start: at(date, '21:30'), end: at(date, '22:00') });
    }

    if (d === 4) {
      // House Week, Thursday: "Free group run, Fleet Feet Columbus Circle, 6:30pm, in place
      // of the practice block", then "green curry salmon with coconut rice, after the run".
      // Columbus Circle is a 25-minute ride each way, which is why Thursday has no practice
      // block and no evening block -- the run is the evening.
      add({ title: 'Snack and a word with the RA', start: at(date, '17:10'), end: at(date, '17:40') });
      add({ kind: 'activity', title: 'Group run \u2014 Fleet Feet Columbus Circle', place: 'fleetfeet',
            start: at(date, '18:30'), end: at(date, '19:45'), move: true, note: 'Free, all paces welcome' });
      add({ kind: 'meal', title: 'Family dinner \u2014 after the run', start: at(date, '20:30'), end: at(date, '21:30') });
      add({ title: 'Wind down \u00b7 lights out 10pm', start: at(date, '21:35'), end: at(date, '22:00') });
    }

    if (d === 5) {
      // House Week, Friday: "No practice block; Whitney Museum Free Friday Night.
      // Sheet-pan bibimbap at 6pm, then out." Free Friday Nights run 5 to 10pm.
      add({ title: 'Snack', start: at(date, '17:10'), end: at(date, '17:30') });
      add({ kind: 'meal', title: 'Family dinner — early, the house goes out', start: at(date, '17:30'), end: at(date, '18:15') });
      add({ kind: 'community', title: 'Whitney Free Friday Night', place: 'whitney',
            start: at(date, '19:00'), end: at(date, '21:30'), consent: 'Timed tickets are required and limited',
            note: 'Free for everyone, 5 to 10pm' });
      add({ title: 'Later curfew, set at Town Hall', start: at(date, '22:30'), end: at(date, '23:00') });
    }

    if (d === 6) {
      /* The statement piece. Handbook section 10, rule 6: "One statement piece a month. A
         big shared challenge students will remember, rotating between moving, performing,
         hosting, serving and teaching." Four of its own examples, rotating by week, so next
         Saturday is not this Saturday with the date changed. Five Boroughs, One Day is
         anchored to 19 October 2026, which is the week the House Week sample documents. */
      const PIECE = (weekIndex(date) - weekIndex(new Date(2026, 9, 19)) + 4000) % 4;
      if (PIECE === 0) {
        // Five Boroughs, One Day -- the sample week, times and costs from the document.
        add({ kind: 'community', title: 'Brooklyn Bridge parkrun \u2014 free 5K', place: 'bbpark',
              start: at(date, '09:00'), end: at(date, '10:00'), move: true, note: 'No sign-up needed to run' });
        add({ kind: 'community', title: 'Walk the Brooklyn Bridge into Manhattan', place: 'whitehall',
              start: at(date, '10:00'), end: at(date, '11:00'), move: true });
        add({ kind: 'community', title: 'Staten Island Ferry', place: 'whitehall',
              start: at(date, '11:00'), end: at(date, '12:30'), note: 'About 25 minutes each way, free' });
        add({ kind: 'community', title: 'Lunch on Arthur Avenue', place: 'arthurave',
              start: at(date, '13:00'), end: at(date, '14:30'), consent: 'Lunch money' });
        add({ kind: 'community', title: 'Queens Night Market', place: 'nightmkt',
              start: at(date, '16:30'), end: at(date, '19:30'), consent: 'Cash \u2014 dishes are capped at $5 to $6' });
        add({ title: 'Home, headcount, free time', start: at(date, '21:00'), end: at(date, '23:00') });
      } else if (PIECE === 1) {
        // Performing. The House Week has the Tuesday open mic doubling as rehearsal for
        // this. The cafe publishes no fixed time for the student slot, so none is invented.
        add({ kind: 'community', title: 'Open mic \u2014 Nuyorican Poets Cafe', place: 'nuyorican',
              start: at(date, '19:00'), end: at(date, '21:30'), consent: 'Tickets, about $10 each',
              note: 'Time set at Town Hall \u2014 the cafe publishes no fixed slot' });
        add({ kind: 'activity', title: 'Rehearsal in the common room',
              start: at(date, '15:00'), end: at(date, '16:30') });
        add({ title: 'Home, headcount, free time', start: at(date, '22:30'), end: at(date, '23:30') });
      } else if (PIECE === 2) {
        // Moving. Battery to Inwood is about 21 km up the length of Manhattan.
        add({ kind: 'community', title: 'Walk the length of Manhattan \u2014 Battery to Inwood', place: 'battery',
              start: at(date, '08:00'), end: at(date, '09:00'), move: true });
        add({ kind: 'community', title: 'Walk the length of Manhattan \u2014 arrive Inwood Hill Park', place: 'inwood',
              start: at(date, '09:00'), end: at(date, '17:00'), move: true, consent: 'Lunch on the way' });
        add({ title: 'Home, headcount, free time', start: at(date, '19:00'), end: at(date, '23:00') });
      } else {
        // Hosting. Cheapest of the four and the one students run themselves.
        add({ kind: 'activity', title: 'Cook and set up for community night',
              start: at(date, '14:00'), end: at(date, '17:30') });
        add({ kind: 'community', title: 'Community night at the flat',
              start: at(date, '18:00'), end: at(date, '21:30'),
              note: 'Day students and neighbours invited. Guest hours are set at Town Hall.' });
        add({ title: 'Clear up together', start: at(date, '21:30'), end: at(date, '22:30') });
      }
    }

    if (d === 0) {
      // House Week, Sunday: a God's Love We Deliver kitchen shift in the morning, then
      // laundry and rest, Town Hall at 6pm, then dinner. Students 13 to 15 need a parent
      // or guardian present, so younger students cook Sunday dinner for the house instead.
      add({ kind: 'community', title: "Kitchen shift — God's Love We Deliver", place: 'godslove',
            start: at(date, '10:00'), end: at(date, '13:00'), consent: 'Under-16s cook at the house instead' });
      add({ title: 'Laundry and rest', start: at(date, '13:30'), end: at(date, '17:00') });
      add({ kind: 'townhall', title: 'House Town Hall', start: at(date, '18:00'), end: at(date, '18:30'),
            note: 'Students run it. Everything that passes goes in the house log.' });
      add({ kind: 'meal', title: 'Family dinner', start: at(date, '18:45'), end: at(date, '19:45') });
      add({ title: 'Week prep · lights out 10pm', start: at(date, '21:30'), end: at(date, '22:00') });
    }
    return E;
  }

  /* ── The twenty students ─────────────────────────────────────────────────
     INVENTED, all of it. Each student gets a practice-block skill and two to four
     recurring activities, four of which are movement, because the brief is four workouts
     a week: two on school-day evenings and two on weekend mornings. They are spread
     across venues on purpose — if the whole house went to one gym the map would be a
     single dot and would prove nothing.

     `share` is the handbook's own rule, not a product decision: section 9 says location
     sharing is on "for the trip if Town Hall agreed to it", and section 8 says to check
     with whoever has a student's location only "if leadership approves location sharing".
     Two students here have not agreed, and the app reports their status with no
     coordinates at all. */
  const A = {
    // day, start, end, title, place, move?
    volleyTue: { d: 2, s: '19:30', e: '21:00', t: 'Volleyball — Asphalt Green', p: 'asphalt', move: true },
    volleyThu: { d: 4, s: '18:30', e: '20:00', t: 'Volleyball — Asphalt Green', p: 'asphalt', move: true },
    volleySat: { d: 6, s: '08:00', e: '09:30', t: 'Volleyball match — Asphalt Green', p: 'asphalt', move: true },
    gymLife:   { d: 1, s: '19:00', e: '21:00', t: 'Open gym — Life Time One Wall Street', p: 'lifetime', move: true },
    ballRep:   { d: 3, s: '19:30', e: '21:00', t: 'Basketball — Boys & Girls Republic', p: 'republic', move: true },
    soccer:    { d: 2, s: '19:30', e: '21:00', t: 'Soccer — Pier 40', p: 'pier40', move: true },
    swimSat:   { d: 6, s: '07:30', e: '09:00', t: 'Swim — Asphalt Green', p: 'asphalt', move: true },
    swimSun:   { d: 0, s: '08:00', e: '09:30', t: 'Swim — Asphalt Green', p: 'asphalt', move: true },
    runSun:    { d: 0, s: '08:00', e: '09:15', t: 'Morning run — Battery Park', p: 'battery', move: true },
    runSunEarly: { d: 0, s: '07:00', e: '08:15', t: 'Morning run — Battery Park', p: 'battery', move: true },
    runSat:    { d: 6, s: '07:30', e: '08:45', t: 'Morning run — Battery Park', p: 'battery', move: true },
    boxTue:    { d: 2, s: '19:30', e: '21:00', t: 'Boxing — Church Street', p: 'churchst', move: true },
    boxSat:    { d: 6, s: '08:00', e: '09:30', t: 'Boxing — Church Street', p: 'churchst', move: true },
    climbMon:  { d: 1, s: '19:00', e: '21:00', t: 'Climbing — Brooklyn Boulders', p: 'boulders', move: true },
    climbSun:  { d: 0, s: '08:30', e: '10:00', t: 'Climbing — Brooklyn Boulders', p: 'boulders', move: true },
    danceWed:  { d: 3, s: '19:30', e: '21:00', t: 'Dance — Gibney', p: 'gibney', move: true },
    danceSat:  { d: 6, s: '08:00', e: '09:30', t: 'Dance — Gibney', p: 'gibney', move: true },
    actSat:    { d: 6, s: '09:00', e: '15:00', t: 'Acting intensive — Lee Strasberg Institute', p: 'strasberg' },
    choirSun:  { d: 0, s: '09:00', e: '10:30', t: 'Youth chorus — Trinity Church Wall Street', p: 'trinity' },
    potteryWed:{ d: 3, s: '19:30', e: '21:00', t: 'Ceramics — Greenwich House Pottery', p: 'pottery' },
    debateTue: { d: 2, s: '17:30', e: '18:15', t: 'Debate club', p: 'school' },
    openMic:   { d: 2, s: '20:15', e: '21:15', t: 'House open mic', p: 'house',
                 note: 'Rehearsal for the Nuyorican open mic on the 30th' },
  };
  const a = (spec, extra) => Object.assign({}, spec, extra || {});
  /* Who lives where. Ten and ten, mixed rather than sorted by activity, so neither flat is
     "the volleyball flat" -- the handbook pairs roommates on shared interests and different
     backgrounds, and a split that put all one sport in one place would undo that. */
  const TRIBECA = new Set(['Jordan Reyes', 'Theo Bennett', 'Noah Kim', 'Zara Hussain', 'Nia Thompson',
                           'Priya Nair', 'Hana Watanabe', 'Omar Haddad', 'Kofi Boateng', 'Tomas Silva']);

  const STUDENT = {
    'Maya Chen':          { skill: 'Guitar',            share: true,  acts: [A.gymLife, A.ballRep, A.runSat, A.runSun] },
    'Jordan Reyes':       { skill: 'Chess',             share: true,  acts: [A.soccer, A.gymLife, A.swimSat, A.runSun] },
    'Amara Okafor':       { skill: 'Drawing',           share: true,  acts: [A.danceWed, A.gymLife, A.danceSat, A.runSun] },
    'Theo Bennett':       { skill: 'Monologues',        share: true,  acts: [A.actSat, A.gymLife, A.boxTue, A.runSat, A.runSun] },
    'Sofia Alvarez':      { skill: 'Piano',             share: true,  acts: [A.volleyTue, A.volleyThu, A.volleySat, A.swimSun] },
    'Noah Kim':           { skill: 'Korean',            share: true,  acts: [A.ballRep, A.gymLife, A.swimSat, A.climbSun] },
    'Liam Patel':         { skill: 'Beatmaking',        share: false, acts: [A.soccer, A.gymLife, A.runSat, A.runSun] },
    'Zara Hussain':       { skill: 'Poetry',            share: true,  acts: [A.volleyTue, A.volleyThu, A.volleySat, A.runSun] },
    'Eli Goldberg':       { skill: 'Cello',             share: true,  acts: [A.climbMon, A.ballRep, A.climbSun, A.runSat] },
    'Nia Thompson':       { skill: 'Photography',       share: true,  acts: [A.volleyTue, A.volleyThu, A.volleySat, A.runSun] },
    'Mateo Rossi':        { skill: 'Cooking',           share: true,  acts: [A.soccer, A.gymLife, A.runSat, A.swimSun] },
    'Priya Nair':         { skill: 'Bharatanatyam',     share: true,  acts: [A.volleyTue, A.volleyThu, A.volleySat, A.swimSun] },
    'Dante Oyelaran':     { skill: 'Saxophone',         share: true,  acts: [A.boxTue, A.gymLife, A.boxSat, A.runSun] },
    'Hana Watanabe':      { skill: 'Ceramics',          share: true,  acts: [A.potteryWed, A.gymLife, A.swimSat, A.runSun] },
    'Ruby Castellanos':   { skill: 'Spanish guitar',    share: true,  acts: [A.danceWed, A.gymLife, A.danceSat, A.runSun] },
    'Omar Haddad':        { skill: 'Calligraphy',       share: false, acts: [A.climbMon, A.boxTue, A.climbSun, A.runSat] },
    'Sloane Marchetti':   { skill: 'Film editing',      share: true,  acts: [A.debateTue, A.gymLife, A.ballRep, A.runSat, A.runSun] },
    'Kofi Boateng':       { skill: 'Drums',             share: true,  acts: [A.soccer, A.ballRep, A.boxSat, A.runSun] },
    'Ingrid Lindqvist':   { skill: 'Swedish folk fiddle', share: true, acts: [A.choirSun, A.gymLife, A.swimSat, A.boxTue, A.runSunEarly] },
    'Tomas Silva':        { skill: 'Capoeira',          share: true,  acts: [A.danceWed, A.gymLife, A.runSat, A.swimSun] },
  };
  /* Tuesday is Cook night, and the House Week sample puts the open mic in the common room
     after dinner. Whoever is still in the house gets it -- derived rather than hand-listed,
     because a hand-written list put two students at boxing and the open mic at once. */
  Object.keys(STUDENT).forEach((n) => {
    const busy = STUDENT[n].acts.some((x) => x.d === 2 && x.s < A.openMic.e && A.openMic.s < x.e);
    if (!busy) STUDENT[n].acts = STUDENT[n].acts.concat([A.openMic]);
  });

  /* A student the RA added on the Roster tab has no entry above. Rather than show them an
     empty week, derive one from their name so they still appear on the board and on the
     map. Deterministic, so it does not change between polls. */
  const FALLBACK = [
    [A.gymLife, A.ballRep, A.runSat, A.runSun], [A.soccer, A.boxTue, A.swimSat, A.runSun],
    [A.climbMon, A.danceWed, A.climbSun, A.runSat], [A.volleyTue, A.volleyThu, A.volleySat, A.swimSun],
  ];
  const SKILLS = ['Guitar', 'Sketching', 'Mandarin', 'Bread', 'Chess', 'Songwriting'];
  function profile(name) {
    const base = STUDENT[name] || (() => {
      const h = hash(name || '?');
      return { skill: SKILLS[h % SKILLS.length], share: true, acts: FALLBACK[h % FALLBACK.length], derived: true };
    })();
    // Named students split ten and ten; anyone the RA adds later is placed by name, so the
    // two flats stay roughly even without anybody having to pick.
    if (!base.home) base.home = TRIBECA.has(name) ? 'tribeca'
      : STUDENT[name] ? HOMES[0] : HOMES[hash(name || '?') % HOMES.length];
    return base;
  }
  const homeOf = (name) => profile(name).home;

  /* ── A student's day ─────────────────────────────────────────────────────
     House template, then the student's own activities laid over it: anything the student
     is personally doing wins, and the house block it collides with is dropped. */
  function dayFor(name, date) {
    const pr = profile(name), d = dow(date), home = pr.home;
    const own = (pr.acts || []).filter((x) => x.d === d).map((x) => mk({
      kind: x.p === 'house' ? 'evening' : 'activity', title: x.t, place: x.p === 'house' ? home : x.p, date,
      start: at(date, x.s), end: at(date, x.e), move: !!x.move, note: x.note || null,
      src: 'invented', who: 'student',
    }));

    let base = houseDay(date, home);
    // The practice block is where a personal skill goes, so name it rather than leaving
    // it generic -- that is the whole point of the block per handbook section 5.
    base.forEach((e) => { if (e.kind === 'practice') { e.title = `Practice block — ${pr.skill}`; e.src = pr.derived ? 'invented' : 'doc'; } });

    // Drop any house block a personal activity sits on top of, and anything the student
    // cannot be at because they are somewhere else.
    base = base.filter((h) => !own.some((o) => o.start < h.end && h.start < o.end));

    // Sunday family call. NOT in the handbook -- the handbook has weekly one-on-ones and
    // family updates, and bans taking family calls away as a penalty, but never schedules
    // them. This is an addition, slotted into Sunday's "laundry and rest" window before
    // Town Hall so it displaces nothing the documents do specify.
    const call = d === 0 ? familyCall(name, date) : null;
    if (call) base = base.filter((h) => !(call.start < h.end && h.start < call.end));

    return withReturns(base.concat(own, call ? [call] : []).sort((x, y) => x.start - y.start), date, home);
  }

  /* People go home between things. Without this a student whose dance class ends at 09:30
     and whose next scheduled entry is 7pm stayed at the dance studio for nine hours, which
     made Saturday lunchtime read as nobody at the house and nobody moving -- a frozen map
     and a headcount that was simply wrong. A gap only counts if there is time to get home,
     be there a while, and still get to the next thing. */
  function withReturns(entries, date, home) {
    const out = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i], nx = entries[i + 1];
      out.push(e);
      if (e.place === home) continue;
      const nextStart = nx ? nx.start : at(date, '21:30');
      const nextPlace = nx ? nx.place : home;
      if (nextPlace === e.place) continue;
      const back = travel(e.place, home).min, onward = travel(home, nextPlace).min;
      if (minutesBetween(e.end, nextStart) < back + onward + 45) continue;
      const start = new Date(+e.end + back * 60000);
      const end = new Date(+nextStart - onward * 60000);
      if (end <= start) continue;
      out.push(mk({ title: `Back at the ${P[home].short}`, place: home, date, start, end }));
    }
    return out;
  }

  /* Twenty minutes each, two at a time (different rooms), Sunday 13:00 to 16:40. */
  const CALL_PROMPTS = ['How are you feeling — physically, mentally, emotionally?',
    'What are you most excited about right now?', 'What was the best and the worst part of your week?',
    'Anything you want us to know or do?'];
  function slotIndex(name) {
    const i = Object.keys(STUDENT).indexOf(name);
    return i >= 0 ? i : 20 + (hash(name || '?') % 8);
  }
  function familyCall(name, date) {
    const i = slotIndex(name), start = at(date, '13:00');
    const s = new Date(start.getTime() + Math.floor(i / 2) * 20 * 60000);
    return mk({ kind: 'call', title: 'Family call', place: homeOf(name), date,
      start: s, end: new Date(s.getTime() + 20 * 60000), src: 'invented', who: 'student',
      note: CALL_PROMPTS.join(' · ') });
  }

  /* ── Where a student is, at a given moment ───────────────────────────────
     A pure function of (student, clock). Nothing is stored, so nothing can drift: ask the
     same question at the same instant and you get the same answer. Between two entries at
     different places the student is in transit, and the fraction of the way along is what
     the map draws the dot at.

     This is the same idea as leg() on the RA board, generalised from one trip to a day. */
  function locate(name, when) {
    const n = when ? new Date(when) : now();
    const today = dayFor(name, n);
    // The place a student is at when the schedule says nothing: their own flat.
    const home = homeOf(name);
    let cur = null, next = null, prevEnd = startOfDay(n), prevPlace = home;

    for (const e of today) {
      if (n >= e.start && n < e.end) { cur = e; break; }
      if (n < e.start) { next = e; break; }
      prevEnd = e.end; prevPlace = e.place;
    }
    if (cur) {
      return { state: 'at', place: P[cur.place], entry: cur, since: cur.start,
               next: today.find((e) => e.start >= cur.end) || null };
    }
    const toPlace = next ? next.place : home;
    if (toPlace !== prevPlace) {
      const t = travel(prevPlace, toPlace);
      // Leave up to twelve minutes early, by student. Deterministic, so the stagger is
      // stable between polls, and early rather than late so nobody misses the start.
      const early = next ? hash(name + '>' + toPlace) % 13 : 0;
      const leaveBy = next ? new Date(next.start.getTime() - (t.min + early) * 60000) : prevEnd;
      const depart = new Date(Math.max(prevEnd.getTime(), leaveBy.getTime()));
      const arrive = new Date(depart.getTime() + t.min * 60000);
      if (n >= depart && n < arrive) {
        return { state: 'transit', from: P[prevPlace], place: P[toPlace], entry: next,
                 frac: Math.min(1, Math.max(0, minutesBetween(depart, n) / t.min)),
                 mode: t.mode, travelMin: t.min, since: depart, eta: arrive, next };
      }
      if (n < depart) return { state: 'at', place: P[prevPlace], entry: null, since: prevEnd, next, leaveAt: depart };
      return { state: 'at', place: P[toPlace], entry: next, since: arrive, next };
    }
    return { state: 'at', place: P[prevPlace], entry: null, since: prevEnd, next };
  }

  /* ── The week, for an itinerary ──────────────────────────────────────────── */
  function weekFor(name, from) {
    const mon = mondayOf(from || now());
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(mon, i);
      return { date, iso: isoDay(date), day: DAY_NAME[dow(date)], short: SHORT[dow(date)],
               slot: EVENING_SLOT[dow(date)], entries: dayFor(name, date) };
    });
  }
  // Everything the whole house is doing, for the RA's own view of the week.
  function houseWeek(from, home) {
    const mon = mondayOf(from || now());
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(mon, i);
      return { date, iso: isoDay(date), day: DAY_NAME[dow(date)], short: SHORT[dow(date)],
               slot: EVENING_SLOT[dow(date)],
               entries: houseDay(date, home || HOMES[0]).filter((e) => e.kind === 'community' || e.kind === 'townhall' || e.kind === 'activity') };
    });
  }

  /* ── The weekend update to families ─────────────────────────────────────
     Handbook section 8, "Talking to families": a weekly summary of "what happened, what's
     coming, and the Town Hall log", sent after Town Hall, which is Sunday evening. This
     builds it from the week the student actually had rather than from a template a human
     fills in, which is the difference between a report and a form.

     Three parts, as asked: what happened, what is coming, and anecdotes. The anecdotes are
     seeded on (student, week), so a family re-reading Tuesday's note on Thursday sees the
     same note. An update that reinvented itself on every reload would be worthless as a
     record, and families do go back and re-read these. */

  const TOWN_HALL_LOG = [
    'Quiet hours moved to 9:45pm on school nights, passed 14 to 6.',
    'Kitchen rota: whoever cooks does not wash up. Passed unanimously.',
    'Phones stay in the basket until the table is cleared, not just until dessert.',
    'Two students proposed a Sunday reading hour. Carried, trial for three weeks.',
    'Common-room speaker volume capped after 9pm. Passed 17 to 3.',
    'Chore trades now have to be logged with the scribe the day before, not after.',
    'Activity budget: the house voted to put the month’s spare toward climbing passes.',
    'The open-mic slot was extended from three minutes to five. Passed 12 to 8.',
    'A proposal to drop Wednesday’s quiet night failed, 7 to 13.',
  ];

  /* Anecdote templates. Each one is a function of the student's own week, so what comes out
     is specific -- "ran the cooking crew and doubled the recipe" rather than "had a good
     week". A family can tell the difference immediately, and so can an interviewer. */
  const ANECDOTE = [
    (f, p) => `${f} has not missed a practice-block session in three weeks. ${p.skill} is the thing they talk about at dinner now.`,
    (f, p) => `${f} logged a personal best on ${p.skill.toLowerCase()} and made sure everyone in the common room knew about it.`,
    (f) => `${f} stayed back after dinner on Tuesday to help clear up when it was not their rota. Nobody asked.`,
    (f) => `${f} talked a homesick younger student through a rough Sunday evening. That is not a small thing.`,
    (f) => `${f} brought a proposal to Town Hall this week and defended it well, even though it did not pass.`,
    (f) => `${f} read at the house open mic. A poem of their own, not a borrowed one.`,
    (f) => `${f} was first down to breakfast every day this week, which is new.`,
    (f) => `${f} took the lead on the shopping list when the kitchen lead was ill, and got it right.`,
    (f, p, v) => `${f} has started going to ${v} early to warm up properly. Their coach noticed before I did.`,
    (f, p, v) => `${f} talked two housemates into coming along to ${v}. There were five of them by Thursday.`,
    (f) => `${f} asked a very good question at the Friday museum night and then would not let it go. I liked that.`,
    (f) => `${f} cooked for the house on Tuesday and plated it like it mattered.`,
    (f) => `${f} walked the whole Brooklyn Bridge in front of the group, setting the pace, and never once looked at their phone.`,
    (f) => `${f} had a hard Wednesday — quiet, off their food. We talked it through on a walk and they were back to themselves by Friday.`,
    (f) => `${f} fixed the common-room lamp nobody else had got round to. With actual tools.`,
    (f) => `${f} has got into the habit of saying good night to everyone on the way up. Small thing, changes a house.`,
  ];

  function pick(pool, seed, n) {
    // Deterministic sample without replacement. Same seed, same three, same order.
    const idx = pool.map((_, i) => i), out = [];
    let h = seed;
    while (out.length < Math.min(n, pool.length)) {
      h = (Math.imul(h, 1103515245) + 12345) >>> 0;
      out.push(pool[idx.splice(h % idx.length, 1)[0]]);
    }
    return out;
  }

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const fmtDate = (d) => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' });

  function weeklyUpdate(name, when) {
    const ref = when ? new Date(when) : now();
    /* Which week's note a family is looking at. The note goes out after Town Hall on Sunday
       evening, so on a Tuesday the current note is still the one about *last* week. Getting
       this backwards would show a family a summary of days that have not happened. */
    const thisSunday = addDays(mondayOf(ref), 6);
    const sentAt = at(thisSunday, '19:45');
    const covered = ref >= sentAt ? mondayOf(ref) : addDays(mondayOf(ref), -7);
    const sent = at(addDays(covered, 6), '19:45');

    const pr = profile(name), first = String(name).split(' ')[0];
    const week = weekFor(name, covered);
    const ahead = weekFor(name, addDays(covered, 7));

    // What happened, read off the week rather than asserted.
    const moves = week.flatMap((d) => d.entries.filter((e) => e.move));
    const venues = [...new Set(moves.map((e) => places[e.place] && places[e.place].name).filter(Boolean))];
    const community = week.flatMap((d) => d.entries.filter((e) => e.kind === 'community'))
      .map((e) => ({ day: d2(e.start), title: e.title }));
    const highlights = [];
    if (moves.length) highlights.push(`${moves.length} sessions of movement: ${venues.slice(0, 3).join(', ')}${venues.length > 3 ? ' and more' : ''}.`);
    highlights.push(`Practice block every school night. ${first} is working on ${pr.skill.toLowerCase()}, and the log is posted in the house.`);
    community.slice(0, 4).forEach((c) => highlights.push(`${c.day}: ${c.title}.`));
    if (week.some((d) => d.entries.some((e) => e.title.includes('open mic'))))
      highlights.push('Tuesday was cook night, and the house ran its own open mic afterwards.');

    const seed = hash(name + ':' + weekIndex(covered));
    const anecdotes = pick(ANECDOTE, seed, 3).map((f) => f(first, pr, venues[0] || 'training'));
    const townHall = pick(TOWN_HALL_LOG, hash('th' + weekIndex(covered)), 3);

    // What is coming, with the two things that need a parent to do something flagged.
    const next = ahead.map((d) => ({
      day: d.day, short: d.short, date: fmtDate(d.date),
      items: d.entries.filter((e) => ['community', 'activity', 'townhall', 'call'].includes(e.kind))
        .map((e) => ({ title: e.title, time: fmtTime(e.start), place: places[e.place] ? places[e.place].name : '',
                       consent: e.consent || null, kind: e.kind })),
    })).filter((d) => d.items.length);
    const needs = ahead.flatMap((d) => d.entries.filter((e) => e.consent)
      .map((e) => ({ day: d.short, title: e.title, consent: e.consent })));

    const callEntry = ahead[6].entries.find((e) => e.kind === 'call');
    return {
      student: name, first, sentAt: sent,
      from: covered, to: addDays(covered, 6),
      label: `${fmtDate(covered)} – ${fmtDate(addDays(covered, 6))}`,
      highlights, anecdotes, townHall, next, needs,
      call: callEntry ? { day: 'Sunday', date: fmtDate(callEntry.start), time: fmtTime(callEntry.start),
                          end: fmtTime(callEntry.end), prompts: CALL_PROMPTS } : null,
    };
  }
  const d2 = (d) => DAY_NAME[dow(d)];
  const places = P;

  window.FS_CAL = {
    places: P, travel, profile, names: Object.keys(STUDENT), now, shifted,
    homes: HOMES, isHome, homeOf,
    dayFor, weekFor, houseWeek, locate, familyCall, callPrompts: CALL_PROMPTS,
    weeklyUpdate, fmtTime, fmtDate,
    eveningSlot: EVENING_SLOT, school: SCHOOL,
    startOfDay, addDays, dow, mondayOf, at, isoDay, minutesBetween, weekIndex, hash,
    dayName: DAY_NAME, shortDay: SHORT,
  };
})();
