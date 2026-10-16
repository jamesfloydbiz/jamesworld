/* /education hero: a dot-matrix Earth rising from the bottom of the page, spinning slowly, with every pin from the
   frontier map on it. Data: /education/frontier/globe.js (window.GLOBE = {dots: [lat, lon, …], pins: [[lat, lon, kind]]}),
   written by the frontier map's build. Drag to turn it. Click opens the map. No libraries. */
(function () {
  'use strict';
  var cv = document.getElementById('globe');
  if (!cv || !window.GLOBE) return;
  var ctx = cv.getContext('2d'), G = window.GLOBE, D = Math.PI / 180;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, R = 0, cx = 0, cy = 0;
  var lon0 = 95, tilt = -22 * D, spin = reduce ? 0 : 0.045, drag = null, moved = false, visible = true;

  // precompute unit vectors once
  var land = new Float32Array(G.dots.length / 2 * 3);
  for (var i = 0, j = 0; i < G.dots.length; i += 2, j += 3) {
    var la = G.dots[i] * D, lo = G.dots[i + 1] * D;
    land[j] = Math.cos(la) * Math.sin(lo); land[j + 1] = Math.sin(la); land[j + 2] = Math.cos(la) * Math.cos(lo);
  }
  var pins = G.pins.map(function (p) { var la = p[0] * D, lo = p[1] * D; return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo), p[2], Math.random() * 6.28]; });
  // kind: 0 school, 1 tool, 2 study, 3 voice
  var PIN = ['hsl(152 70% 62%)', 'hsl(30 70% 60%)', 'hsl(200 50% 72%)', 'hsl(330 35% 72%)'];

  function size() {
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    R = Math.max(260, Math.min(W * (W < 640 ? 0.78 : 0.5), 760));
    cx = W / 2; cy = H + R * (W < 640 ? 0.18 : 0.30);       // the top of the sphere rises out of the page bottom
  }

  function frame(t) {
    if (!visible) { requestAnimationFrame(frame); return; }   // off screen: skip the drawing
    if (!W) size();
    if (visible && !drag) lon0 -= spin;   // land drifts left to right
    var c = Math.cos(-lon0 * D), s = Math.sin(-lon0 * D), ct = Math.cos(tilt), st = Math.sin(tilt);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);

    // atmosphere and body
    var g = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.22);
    g.addColorStop(0, 'hsl(152 70% 40% / 0.55)'); g.addColorStop(0.35, 'hsl(152 70% 30% / 0.18)'); g.addColorStop(1, 'hsl(152 70% 20% / 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, 7); ctx.fill();
    var b = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.45, R * 0.1, cx, cy, R);
    b.addColorStop(0, 'hsl(152 45% 12%)'); b.addColorStop(1, 'hsl(160 60% 3%)');
    ctx.fillStyle = b; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'hsl(152 70% 55% / 0.55)'; ctx.lineWidth = 1.5; ctx.stroke();

    // land dots: rotate about the poles (lon), then tilt toward the viewer
    var ds = Math.max(1.2, R / 260);
    for (var k = 0; k < land.length; k += 3) {
      var x = land[k] * c + land[k + 2] * s, z0 = -land[k] * s + land[k + 2] * c, y = land[k + 1];
      var y2 = y * ct - z0 * st, z = y * st + z0 * ct;
      if (z <= 0.02) continue;
      var px = cx + R * x, py = cy - R * y2;
      if (py > H + 4 || py < -4) continue;
      ctx.fillStyle = 'hsl(152 ' + (45 + 25 * z | 0) + '% ' + (26 + 34 * z | 0) + '% / ' + (0.35 + 0.65 * z).toFixed(2) + ')';
      ctx.fillRect(px - ds / 2, py - ds / 2, ds, ds);
    }
    // pins, pulsing
    for (var q = 0; q < pins.length; q++) {
      var p = pins[q], X = p[0] * c + p[2] * s, Z0 = -p[0] * s + p[2] * c, Y = p[1], Y2 = Y * ct - Z0 * st, Z = Y * st + Z0 * ct;
      if (Z <= 0.05) continue;
      var PX = cx + R * X, PY = cy - R * Y2; if (PY > H + 6) continue;
      var pulse = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t / 600 + p[4]);
      ctx.fillStyle = PIN[p[3]]; ctx.globalAlpha = 0.25 * Z * pulse; ctx.beginPath(); ctx.arc(PX, PY, ds * 3.2, 0, 7); ctx.fill();
      ctx.globalAlpha = 0.55 + 0.45 * Z; ctx.beginPath(); ctx.arc(PX, PY, ds * 1.15, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }

  cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, lon: lon0 }; moved = false; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
  cv.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 3) moved = true; lon0 = drag.lon - dx * 0.25; });
  cv.addEventListener('pointerup', function () { cv.style.cursor = 'grab'; if (!moved) location.href = '/education/frontier/'; drag = null; });
  cv.addEventListener('pointercancel', function () { drag = null; });
  if (window.ResizeObserver) new ResizeObserver(size).observe(cv); else window.addEventListener('resize', size);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
  requestAnimationFrame(frame);
})();
