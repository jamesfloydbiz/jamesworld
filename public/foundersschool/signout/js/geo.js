// Place search + travel-time estimates. All free, no API keys:
//   Photon (OpenStreetMap data) for place search, routing.openstreetmap.de for walking/driving routes.
// If a service is down the estimate falls back to straight-line distance, and says so.
(function () {
  const C = window.FS_CONFIG;

  function haversineKm(a, b) {
    const R = 6371, rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  async function search(q) {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en&lat=${C.house.lat}&lon=${C.house.lng}`;
    const r = await fetch(url); if (!r.ok) throw new Error('search failed');
    const j = await r.json();
    return j.features.map((f) => {
      const p = f.properties, [lng, lat] = f.geometry.coordinates;
      const street = [p.housenumber, p.street].filter(Boolean).join(' ');
      const name = p.name || street || p.city || 'Dropped pin';
      const address = [street && street !== name ? street : '', p.district || p.locality, p.city || p.county, p.state].filter(Boolean).join(', ');
      return { name, address, lat, lng };
    });
  }

  async function route(profile, from, to) {
    const url = `https://routing.openstreetmap.de/routed-${profile}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) }); if (!r.ok) throw new Error('route failed');
    const j = await r.json(); if (!j.routes || !j.routes[0]) throw new Error('no route');
    return { min: j.routes[0].duration / 60, km: j.routes[0].distance / 1000 };
  }

  // The drawn road geometry for a leg, so a vehicle on the board follows streets instead of
  // cutting across the East River. Same free OSRM instance, just asking for the overview.
  async function routeLine(profile, from, to) {
    const url = `https://routing.openstreetmap.de/routed-${profile}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const r = await fetch(url, { signal: AbortSignal.timeout(7000) }); if (!r.ok) throw new Error('route failed');
    const j = await r.json(); if (!j.routes || !j.routes[0]) throw new Error('no route');
    return j.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }

  // A point a given fraction (0-1) along a polyline, measured by distance rather than by
  // vertex count -- OSRM packs vertices tightly around corners, so counting them would make
  // a vehicle crawl through junctions and leap down straight roads.
  function pointAt(line, frac) {
    if (!line || line.length < 2) return null;
    const seg = [];
    let total = 0;
    for (let i = 1; i < line.length; i++) {
      const d = haversineKm({ lat: line[i - 1][0], lng: line[i - 1][1] }, { lat: line[i][0], lng: line[i][1] });
      seg.push(d); total += d;
    }
    if (!total) return line[0];
    let want = Math.max(0, Math.min(1, frac)) * total;
    for (let i = 0; i < seg.length; i++) {
      if (want <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? want / seg[i] : 0, a = line[i], b = line[i + 1];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      }
      want -= seg[i];
    }
    return line[line.length - 1];
  }

  // One-way estimates in minutes for each mode. Transit + car are adjustments on the routed numbers
  // (no live transit/traffic data on free tier) — the UI labels them as estimates.
  async function estimate(to) {
    const from = C.house;
    const straight = haversineKm(from, to);
    let walk, car, source = 'route';
    try {
      [walk, car] = await Promise.all([route('foot', from, to), route('car', from, to)]);
    } catch (e) {
      source = 'straight-line';
      walk = { km: straight * 1.3, min: (straight * 1.3 / 4.8) * 60 };
      car = { km: straight * 1.3, min: (straight * 1.3 / 25) * 60 };
    }
    const transitMin = 8 + (car.km / 18) * 60 * 1;        // ~8 min wait + ~18 km/h door-to-door city average
    const carMin = car.min * 1.3 + 4;                     // traffic + pickup buffer
    const round = (n) => Math.max(3, Math.round(n));
    const tiles = { walk: round(walk.min), transit: round(Math.min(transitMin, walk.min > 12 ? transitMin : walk.min)), car: round(carMin) };
    const suggested = tiles.walk <= 20 ? 'walk' : 'transit';
    return { tiles, suggested, km: walk.km, straightKm: straight, source };
  }

  window.FS_GEO = { search, estimate, haversineKm, routeLine, pointAt };
})();
