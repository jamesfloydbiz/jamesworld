// Founders School sign-out — settings.
// Leave supabaseUrl empty to run in DEMO mode (data lives in this browser only).
window.FS_CONFIG = {
  supabaseUrl: '',   // e.g. https://xxxx.supabase.co
  supabaseKey: '',   // the publishable / anon key (safe to ship; tables are locked by RLS)

  // Approximate: 9 Maiden Lane, Financial District, Manhattan. Nudge lat/lng if the pin is off.
  campus: { name: '9 Maiden Lane', lat: 40.7093, lng: -74.0088 },

  // Favourite nearby spots shown as one-tap buttons. Edit freely.
  quickSpots: [
    { name: 'Fulton Center', address: 'Broadway & Fulton St, Manhattan', lat: 40.7103, lng: -74.0091 },
    { name: 'Oculus / World Trade Center', address: '185 Greenwich St, Manhattan', lat: 40.7115, lng: -74.0116 },
    { name: 'Brookfield Place', address: '230 Vesey St, Manhattan', lat: 40.7129, lng: -74.0150 },
    { name: 'Stone Street', address: 'Financial District, Manhattan', lat: 40.7040, lng: -74.0106 },
    { name: 'Battery Park', address: 'Battery Pl, Manhattan', lat: 40.7033, lng: -74.0170 },
  ],

  purposes: [
    { key: 'Food',        stay: 30 },
    { key: 'Errand',      stay: 20 },
    { key: 'Gym',         stay: 60 },
    { key: 'Meeting',     stay: 45 },
    { key: 'Appointment', stay: 60 },
    { key: 'Other',       stay: 30 },
  ],
  stayStep: 5, stayMin: 10, stayMax: 240,

  requestTtlMin: 10,   // buddy has this long to accept
  soonMin: 10,         // dashboard flags "due soon" under this many minutes
  graceMin: 5,         // minutes after due time before "overdue"
  pollMs: 4000,
  demoRaPin: 'demo',
};
