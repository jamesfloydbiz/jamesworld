/* ═══════════════════════════════════════════════════════════════════════════
   Read-aloud — narrates page content in a natural neural voice (Kokoro TTS,
   voice "am_michael"), running 100% in the browser. The model (~86MB, q8)
   loads lazily on the first Listen click and is cached after. Falls back to the
   browser's built-in speech engine if Kokoro can't load.

   Playback goes through the Web Audio API, and the AudioContext is resumed
   INSIDE the click handler (a user gesture) — otherwise browsers (iOS Safari
   especially) block audio that starts after the async model load + generation.

   Any <button data-read-aloud="#selector"> reads that element's text. Buttons
   ship hidden and are revealed here. window.ReadAloud.stopAll() stops narration.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  var VOICE = 'am_michael';
  var MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
  var CDN = 'https://esm.sh/kokoro-js@1.2.1';
  var HAS_SPEECH = ('speechSynthesis' in window);
  var synth = HAS_SPEECH ? window.speechSynthesis : null;

  var controls = [];
  var K = { tts: null, promise: null, failed: false };
  var progressCb = null;   // set by whichever control is currently loading

  function loadKokoro() {
    if (K.tts) return Promise.resolve(K.tts);
    if (K.failed) return Promise.reject(new Error('kokoro-unavailable'));
    if (K.promise) return K.promise;
    K.promise = (async function () {
      var mod = await import(CDN);
      function make(device) {
        return mod.KokoroTTS.from_pretrained(MODEL, {
          dtype: 'q8',
          device: device,
          progress_callback: function (p) {
            if (progressCb && p && p.status === 'progress' && p.total && /\.onnx/i.test(p.file || '')) {
              progressCb(Math.round((p.loaded / p.total) * 100));
            }
          }
        });
      }
      if ('gpu' in navigator) {
        try { return await make('webgpu'); } catch (e) { /* fall back to wasm */ }
      }
      return await make('wasm');
    })();
    K.promise.then(function (tts) { K.tts = tts; }, function () { K.failed = true; });
    return K.promise;
  }

  // Web Audio context — created + resumed inside a click so playback is allowed.
  var actx = null;
  function ctx() {
    if (!actx) { var C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); }
    return actx;
  }
  function unlock() { var c = ctx(); if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} } }

  // Reject after `ms` — used so a device that can't generate (no WebGPU / too
  // slow / a hang) doesn't leave the button stuck; it falls back to the voice.
  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
      promise.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }

  function getText(el) {
    var t = (el.innerText || el.textContent || '');
    return t.replace(/\s*\/(?=[a-z])/gi, ' ').replace(/\s+/g, ' ').trim();
  }
  function chunkText(text) {
    var parts = text.match(/[^.!?]+[.!?]*/g) || [text];
    var chunks = [], buf = '';
    parts.forEach(function (s) {
      s = s.trim(); if (!s) return;
      if ((buf + ' ' + s).length > 180) { if (buf) chunks.push(buf); buf = s; }
      else { buf = buf ? buf + ' ' + s : s; }
    });
    if (buf) chunks.push(buf);
    return chunks;
  }
  function pickSpeechVoice() {
    if (!synth) return null;
    var vs = synth.getVoices();
    var prefs = [/Google US English/i, /Samantha/i, /Aaron/i, /Microsoft/i];
    for (var i = 0; i < prefs.length; i++) { var m = vs.find(function (v) { return prefs[i].test(v.name); }); if (m) return m; }
    return vs.find(function (v) { return /en[-_]US/i.test(v.lang); }) || vs[0] || null;
  }

  function makeControl(btn, target) {
    var chunks = [], idx = 0, state = 'idle', fallback = false, prefetch = null, token = 0, srcNode = null;
    var labelEl = btn.querySelector('.read-aloud__label');
    var icoEl = btn.querySelector('.read-aloud__ico');

    function set(s, text) {
      state = s; btn.dataset.state = s;
      var t = text || (s === 'loading' ? 'Loading…' : s === 'playing' ? 'Pause' : s === 'paused' ? 'Resume' : 'Listen');
      if (labelEl) labelEl.textContent = t;
      if (icoEl) icoEl.textContent = s === 'playing' ? '⏸' : s === 'loading' ? '…' : '▶';
      btn.setAttribute('aria-pressed', s === 'playing' ? 'true' : 'false');
    }

    // ── Browser-speech fallback ──────────────────────────────────────────
    function speechNext() {
      if (state === 'idle') return;
      if (idx >= chunks.length) { set('idle'); return; }
      var u = new SpeechSynthesisUtterance(chunks[idx]);
      var v = pickSpeechVoice(); if (v) u.voice = v;
      u.rate = 0.98;
      u.onend = function () { if (state !== 'idle') { idx++; speechNext(); } };
      u.onerror = function () { if (state !== 'idle') { idx++; speechNext(); } };
      synth.speak(u);
    }

    // ── Kokoro path (Web Audio) ──────────────────────────────────────────
    async function genRaw(i) {
      if (i >= chunks.length) return null;
      var out = await K.tts.generate(chunks[i], { voice: VOICE });
      return { data: out.audio, rate: out.sampling_rate };
    }
    function playBuffer(raw, onEnd) {
      var c = ctx();
      if (!c || !raw || !raw.data) { onEnd(); return; }
      var buf = c.createBuffer(1, raw.data.length, raw.rate);
      buf.getChannelData(0).set(raw.data);
      srcNode = c.createBufferSource();
      srcNode.buffer = buf;
      srcNode.connect(c.destination);
      srcNode.onended = onEnd;
      srcNode.start();
    }
    async function kokoroPlay(i) {
      var mine = token;
      if (state === 'idle' || mine !== token) return;
      if (i >= chunks.length) { stop(); return; }
      idx = i;
      var raw;
      try { raw = prefetch || await genRaw(i); }
      catch (e) { stop(); return; }
      prefetch = null;
      if (state === 'idle' || mine !== token) return;
      playBuffer(raw, function () { if (state !== 'idle' && mine === token) kokoroPlay(i + 1); });
      set('playing');
      // Prefetch the next chunk while this one plays (smoother transitions).
      genRaw(i + 1).then(function (r) { if (mine === token) prefetch = r; }, function () {});
    }

    async function start() {
      var txt = getText(target); if (!txt) return;
      chunks = chunkText(txt); idx = 0; token++;
      var mine = token;
      set('loading');
      progressCb = function (pct) { if (state === 'loading') set('loading', 'Loading ' + pct + '%'); };
      try {
        await loadKokoro();
        progressCb = null;
        if (mine !== token || state !== 'loading') return;   // cancelled during load
        set('loading', 'Generating…');
        // Generate the first chunk with a timeout. If the device can't do it in
        // time (no WebGPU, too slow, or a hang), fall back to the browser voice
        // rather than leaving the button stuck.
        var first = await withTimeout(genRaw(0), 25000);
        if (mine !== token || state !== 'loading') return;
        prefetch = first;
        state = 'playing';
        kokoroPlay(0);
      } catch (e) {
        progressCb = null;
        if (mine !== token) return;
        if (HAS_SPEECH) { fallback = true; set('playing'); speechNext(); }
        else { set('idle', 'Unavailable'); }
      }
    }
    function pause() {
      if (fallback) { try { synth.pause(); } catch (e) {} }
      else if (actx) { try { actx.suspend(); } catch (e) {} }
      set('paused');
    }
    function resume() {
      if (fallback) { try { synth.resume(); } catch (e) {} }
      else if (actx) { try { actx.resume(); } catch (e) {} }
      set('playing');
    }
    function stop() {
      token++;
      if (fallback) { try { synth.cancel(); } catch (e) {} fallback = false; }
      else {
        if (srcNode) { try { srcNode.onended = null; srcNode.stop(); } catch (e) {} srcNode = null; }
        if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }
      }
      prefetch = null; idx = 0; set('idle');
    }

    btn.addEventListener('click', function () {
      if (state === 'idle') { unlock(); stopOthers(ctrl); start(); }   // unlock audio in the gesture
      else if (state === 'loading') { stop(); }                        // cancel while loading
      else if (state === 'playing') { pause(); }
      else if (state === 'paused') { resume(); }
    });

    var ctrl = { stop: stop };
    set('idle');
    return ctrl;
  }
  function stopOthers(except) { controls.forEach(function (c) { if (c !== except) c.stop(); }); }

  function init() {
    document.querySelectorAll('[data-read-aloud]').forEach(function (btn) {
      var target = document.querySelector(btn.getAttribute('data-read-aloud'));
      if (!target) { btn.hidden = true; return; }
      controls.push(makeControl(btn, target));
      btn.hidden = false;   // reveal only now that JS can drive it
    });
  }

  window.ReadAloud = { stopAll: function () { controls.forEach(function (c) { c.stop(); }); } };
  window.addEventListener('beforeunload', function () { try { window.ReadAloud.stopAll(); } catch (e) {} });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
