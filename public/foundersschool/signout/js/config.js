// Founders School sign-out — settings.
// Leave supabaseUrl empty to run in DEMO mode (data lives in this browser only).
window.FS_CONFIG = {
  supabaseUrl: '',   // e.g. https://xxxx.supabase.co
  supabaseKey: '',   // the publishable / anon key (safe to ship; tables are locked by RLS)

  /* The residences. Boarding is split across two apartments, so a student's own flat is
     where their day starts and ends and the origin for their travel estimates -- these are
     the coordinates worth getting right. Handbook section 11 puts a second RA in at about
     15 to 20 boarders, which is the same threshold that makes a second flat sensible.
     `house` stays as the first one: the sign-out flow and the QR poster use it. */
  houses: [
    { key: 'exchange', name: 'Exchange Place flat', short: 'Exchange Pl', address: '20 Exchange Place, Manhattan', lat: 40.705850, lng: -74.009050 },
    { key: 'tribeca', name: 'Tribeca flat',     short: 'Tribeca', address: '101 Warren Street, Manhattan', lat: 40.715730, lng: -74.011700 },
  ],
  get house() { return this.houses[0]; },
  // The school day happens here. It is drawn on the board for orientation -- going to school
  // is not a sign-out -- so it needs no travel times.
  school: { name: 'Founders School', address: '180 Maiden Lane, Manhattan', lat: 40.705260, lng: -74.005463 },

  // Favourite nearby spots shown as one-tap buttons. Edit freely.
  quickSpots: [
    { name: 'Fulton Center', address: 'Broadway & Fulton St, Manhattan', lat: 40.7103, lng: -74.0091 },
    { name: 'Oculus / World Trade Center', address: '185 Greenwich St, Manhattan', lat: 40.7115, lng: -74.0116 },
    { name: 'Brookfield Place', address: '230 Vesey St, Manhattan', lat: 40.7129, lng: -74.0150 },
    { name: 'Stone Street', address: 'Financial District, Manhattan', lat: 40.7040, lng: -74.0106 },
    { name: 'Battery Park', address: 'Battery Pl, Manhattan', lat: 40.7033, lng: -74.0170 },
  ],

  // Recurring practices. These are the things a student goes to every week, so they are
  // one tap rather than a search, and the RA board can group them. Venues here are the ones
  // already named in the House Week plan. `ride` is the usual way of getting there, which
  // only pre-selects — the student can change it.
  practices: [
    { name: 'Open gym — Life Time One Wall Street', address: '1 Wall Street, Manhattan', lat: 40.7075, lng: -74.0113, day: 'Mon', time: '19:00', stay: 120, ride: 'walkOver' },
    { name: 'Soccer — Pier 40',                   address: '353 West St, Manhattan',  lat: 40.7300, lng: -74.0110, day: 'Tue', time: '18:00', stay: 90,  ride: 'rideshare' },
    { name: 'Basketball — Boys & Girls Republic', address: '888 E 6th St, Manhattan', lat: 40.7236, lng: -73.9780, day: 'Wed', time: '19:30', stay: 90,  ride: 'shuttle' },
    { name: 'Group run — Fleet Feet Columbus Circle', address: '103 W 59th St, Manhattan', lat: 40.7681, lng: -73.9819, day: 'Thu', time: '18:30', stay: 75, ride: 'transitPass' },
    { name: 'Swim — Asphalt Green Battery Park',  address: '212 North End Ave, Manhattan', lat: 40.7161, lng: -74.0163, day: 'Sat', time: '10:00', stay: 90, ride: 'walkOver' },
  ],

  // How a student is actually getting there. The JD lists "coordinating shuttle rhythms",
  // so the house shuttle is first; rideshare is one option among several, not the system.
  rideKinds: [
    { key: 'shuttle',     label: 'House shuttle' },
    { key: 'rideshare',   label: 'Rideshare' },
    { key: 'transitPass', label: 'Subway / bus' },
    { key: 'parent',      label: 'Parent pickup' },
    { key: 'walkOver',    label: 'Walking' },
  ],

  purposes: [
    { key: 'Food',        stay: 30 },
    { key: 'Errand',      stay: 20 },
    { key: 'Gym',         stay: 60 },
    { key: 'Meeting',     stay: 45 },
    { key: 'Appointment', stay: 60 },
    { key: 'Practice',    stay: 90 },
    { key: 'Other',       stay: 30 },
  ],
  stayStep: 5, stayMin: 10, stayMax: 240,

  // Pin the schedule clock so the board is always mid-evening rather than whatever time
  // someone happens to visit. 'Mon 18:55' is that weekday of the current week; an absolute
  // ISO date works too. Override per-visit with ?t= — ?t=now uses the real clock.
  demoClock: 'Mon 18:55',

  requestTtlMin: 10,   // buddy has this long to accept
  soonMin: 10,         // dashboard flags "due soon" under this many minutes
  graceMin: 5,         // minutes after due time before "overdue"
  pollMs: 4000,
  demoRaPin: 'demo',
};
