/* ═══════════════════════════════════════════════════════════════════════════
   Read-aloud — plays a pre-generated MP3 narration in James's chosen voice
   (Kokoro TTS "am_michael", rendered at build time by scripts/gen-audio.mjs).
   A <button data-audio="/audio/<id>.mp3"> plays that clip with play / pause.
   It's just an <audio> element, so it works in every browser — Safari and iOS
   included. Buttons ship hidden and are revealed here. One clip plays at a time.
   window.ReadAloud.stopAll() stops playback (e.g. when a modal closes).
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  var buttons = [];
  var audio = null;
  var currentBtn = null;

  function getAudio() {
    if (!audio) {
      audio = new Audio();
      audio.preload = 'none';
      audio.addEventListener('ended', function () { if (currentBtn) setState(currentBtn, 'idle'); currentBtn = null; });
      audio.addEventListener('error', function () { if (currentBtn) setState(currentBtn, 'idle'); currentBtn = null; });
    }
    return audio;
  }

  function setState(btn, s) {
    btn.dataset.state = s;
    var l = btn.querySelector('.read-aloud__label');
    var i = btn.querySelector('.read-aloud__ico');
    if (l) l.textContent = s === 'playing' ? 'Pause' : (s === 'paused' ? 'Resume' : (s === 'loading' ? 'Loading…' : 'Listen'));
    if (i) i.textContent = s === 'playing' ? '⏸' : '▶';
    btn.setAttribute('aria-pressed', s === 'playing' ? 'true' : 'false');
  }

  function play(btn) {
    var a = getAudio();
    if (currentBtn && currentBtn !== btn) setState(currentBtn, 'idle');
    currentBtn = btn;
    a.src = btn.getAttribute('data-audio');   // (re)start from the beginning
    setState(btn, 'loading');
    a.play().then(function () { setState(btn, 'playing'); }, function () { setState(btn, 'idle'); });
  }

  function stopAll() {
    var a = getAudio();
    a.pause();
    if (currentBtn) { setState(currentBtn, 'idle'); currentBtn = null; }
  }

  function init() {
    document.querySelectorAll('[data-audio]').forEach(function (btn) {
      setState(btn, 'idle');
      btn.hidden = false;   // reveal only now that JS can drive it
      btn.addEventListener('click', function () {
        var s = btn.dataset.state;
        if (s === 'idle') play(btn);
        else if (s === 'playing') { getAudio().pause(); setState(btn, 'paused'); }
        else if (s === 'paused') { getAudio().play(); setState(btn, 'playing'); }
      });
      buttons.push(btn);
    });
  }

  window.ReadAloud = { stopAll: stopAll };
  window.addEventListener('beforeunload', function () { try { stopAll(); } catch (e) {} });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
