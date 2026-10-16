/* /education ticker: scroll the baked news list with requestAnimationFrame instead of a CSS animation.
   Safari can jump a paused CSS animation (animation-play-state on hover) to a different spot; moving the track
   ourselves means hover just eases the speed to zero and back, from wherever it is. Without JS, the CSS
   animation in index.html still runs. */
(function () {
  'use strict';
  var box = document.querySelector('.ed-ticker'), track = box && box.querySelector('.ed-ticker__track');
  if (!track) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // CSS leaves it still
  track.style.animation = 'none';
  var SPEED = 45;                 // px per second at full speed
  var x = 0, v = SPEED, target = SPEED, last = 0, half = 0, onScreen = true;
  function measure() { half = track.scrollWidth / 2; }   // the list is written twice; loop at the halfway point
  function frame(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    v += (target - v) * Math.min(1, dt * 6);              // ease toward the target speed
    if (onScreen && half) { x -= v * dt; if (-x >= half) x += half; track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)'; }
    requestAnimationFrame(frame);
  }
  var stop = function () { target = 0; }, go = function () { target = SPEED; };
  box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', go);
  box.addEventListener('focusin', stop); box.addEventListener('focusout', go);
  box.addEventListener('touchstart', stop, { passive: true }); box.addEventListener('touchend', function () { setTimeout(go, 1500); });
  if (window.ResizeObserver) new ResizeObserver(measure).observe(track); else window.addEventListener('resize', measure);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; }).observe(box);
  measure(); requestAnimationFrame(frame);
})();
