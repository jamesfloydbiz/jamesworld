/* ═══════════════════════════════════════════════════════════════════════════
   Read-aloud — narrates page content in a natural neural voice (Kokoro TTS,
   voice "am_michael"), running 100% in the browser. The model (~80MB) loads
   lazily on the first Listen click and is cached after. Falls back to the
   browser's built-in speech engine if Kokoro can't load (old browser, etc.).
   Any <button data-read-aloud="#selector"> reads that element's text.
   Exposes window.ReadAloud.stopAll() so pages can stop narration (e.g. on
   closing a modal).
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  var VOICE = 'am_michael';
  var MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
  var CDN = 'https://esm.sh/kokoro-js@1.2.1';
  var HAS_SPEECH = ('speechSynthesis' in window);
  var synth = HAS_SPEECH ? window.speechSynthesis : null;

  var controls = [];
  var K = { tts: null, promise: null, failed: false };  // shared Kokoro engine

  function loadKokoro() {
    if (K.tts) return Promise.resolve(K.tts);
    if (K.failed) return Promise.reject(new Error('kokoro-unavailable'));
    if (K.promise) return K.promise;
    K.promise = (async function () {
      var mod = await import(CDN);
      var device = ('gpu' in navigator) ? 'webgpu' : 'wasm';
      return await mod.KokoroTTS.from_pretrained(MODEL, {
        dtype: device === 'webgpu' ? 'fp32' : 'q8',
        device: device
      });
    })();
    K.promise.then(function (tts) { K.tts = tts; }, function () { K.failed = true; });
    return K.promise;
  }

  var audioEl = null;
  function audio() {
    if (!audioEl) { audioEl = document.createElement('audio'); audioEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(audioEl); }
    return audioEl;
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
    var chunks = [], idx = 0, state = 'idle', fallback = false, prefetch = null, token = 0;
    var labelEl = btn.querySelector('.read-aloud__label');
    var icoEl = btn.querySelector('.read-aloud__ico');

    function set(s) {
      state = s; btn.dataset.state = s;
      var t = s === 'loading' ? 'Loading…' : s === 'playing' ? 'Pause' : s === 'paused' ? 'Resume' : 'Listen';
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

    // ── Kokoro path ──────────────────────────────────────────────────────
    async function genChunk(i) {
      if (i >= chunks.length) return null;
      var out = await K.tts.generate(chunks[i], { voice: VOICE });
      return URL.createObjectURL(out.toBlob());
    }
    async function kokoroPlay(i) {
      var mine = token;
      if (state === 'idle' || mine !== token) return;
      if (i >= chunks.length) { stop(); return; }
      idx = i;
      var url;
      try { url = prefetch || await genChunk(i); }
      catch (e) { stop(); return; }
      prefetch = null;
      if (state === 'idle' || mine !== token) { if (url) URL.revokeObjectURL(url); return; }
      var a = audio();
      a.src = url;
      a.onended = function () { URL.revokeObjectURL(url); if (state !== 'idle' && mine === token) kokoroPlay(i + 1); };
      try { await a.play(); } catch (e) {}
      set('playing');
      // Prefetch the next chunk while this one plays (smoother transitions).
      genChunk(i + 1).then(function (u) { if (mine === token) prefetch = u; else if (u) URL.revokeObjectURL(u); }, function () {});
    }

    async function start() {
      var txt = getText(target); if (!txt) return;
      chunks = chunkText(txt); idx = 0; token++;
      set('loading');
      try {
        await loadKokoro();
        if (state !== 'loading') return;   // cancelled during load
        state = 'playing';
        kokoroPlay(0);
      } catch (e) {
        if (HAS_SPEECH) { fallback = true; state = 'playing'; set('playing'); speechNext(); }
        else { set('idle'); }
      }
    }
    function pause() {
      if (fallback) { try { synth.pause(); } catch (e) {} }
      else { audio().pause(); }
      set('paused');
    }
    function resume() {
      if (fallback) { try { synth.resume(); } catch (e) {} }
      else { audio().play().catch(function () {}); }
      set('playing');
    }
    function stop() {
      token++;
      if (fallback) { try { synth.cancel(); } catch (e) {} fallback = false; }
      else if (audioEl) { audioEl.pause(); audioEl.onended = null; try { audioEl.removeAttribute('src'); audioEl.load(); } catch (e) {} }
      if (prefetch) { URL.revokeObjectURL(prefetch); prefetch = null; }
      idx = 0; set('idle');
    }

    btn.addEventListener('click', function () {
      if (state === 'idle') { stopOthers(ctrl); start(); }
      else if (state === 'loading') { stop(); }        // cancel while loading
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
    });
  }

  window.ReadAloud = { stopAll: function () { controls.forEach(function (c) { c.stop(); }); } };
  window.addEventListener('beforeunload', function () { try { window.ReadAloud.stopAll(); } catch (e) {} });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
