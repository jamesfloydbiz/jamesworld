/* jamesfloyds.world — site.js
   Nav toggle + modal helpers. No dependencies. */

(function () {
  'use strict';

  /* ── Nav ──────────────────────────────────────────────────────────────── */
  function initNav() {
    var btn  = document.getElementById('menu-btn');
    var nav  = document.getElementById('site-nav');
    var close = document.getElementById('nav-close');
    if (!btn || !nav) return;

    function openNav()  { nav.classList.add('is-open');    btn.setAttribute('aria-expanded','true'); }
    function closeNav() { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); }

    btn.addEventListener('click', openNav);
    if (close) close.addEventListener('click', closeNav);

    /* Close on backdrop click (outside the nav list) */
    nav.addEventListener('click', function(e) {
      if (e.target === nav) closeNav();
    });

    /* Close on Escape */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeNav();
    });

    /* Mobile: tap nav item to expand sub-items */
    var items = nav.querySelectorAll('.site-nav__item[data-has-sub]');
    items.forEach(function(item) {
      var link = item.querySelector('.site-nav__link');
      if (!link) return;
      link.addEventListener('click', function(e) {
        /* Only intercept tap on mobile (coarse pointer); on desktop hover handles it */
        if (window.matchMedia('(hover: none)').matches) {
          e.preventDefault();
          item.classList.toggle('is-expanded');
        }
      });
    });
  }

  /* ── Modal helpers ────────────────────────────────────────────────────── */
  /* Usage:
       <button data-modal-open="my-dialog">Open</button>
       <dialog id="my-dialog">...</dialog>
       <button data-modal-close>Close</button>  (inside dialog)
  */
  function initModals() {
    document.addEventListener('click', function(e) {
      /* Open */
      var opener = e.target.closest('[data-modal-open]');
      if (opener) {
        var id = opener.getAttribute('data-modal-open');
        var dlg = document.getElementById(id);
        if (dlg) dlg.showModal();
        return;
      }
      /* Close */
      if (e.target.closest('[data-modal-close]')) {
        var dlg = e.target.closest('dialog');
        if (dlg) dlg.close();
        return;
      }
      /* Click on backdrop closes dialog */
      if (e.target.tagName === 'DIALOG') {
        e.target.close();
      }
    });
  }

  /* ── Init ─────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { initNav(); initModals(); });
  } else {
    initNav(); initModals();
  }
}());

/* ═══════════════════════════════════════════════════════════════════════════
   Read-aloud — the browser's built-in speech engine narrates page content.
   Any <button data-read-aloud="#selector"> reads that element's text, with
   play / pause / resume. Free, no backend, no keys. Buttons hide themselves
   where speech synthesis isn't available.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  if (!('speechSynthesis' in window)) {
    document.querySelectorAll('[data-read-aloud]').forEach(function (b) { b.hidden = true; });
    return;
  }
  var synth = window.speechSynthesis;
  var controls = [];
  var voice = null;

  function pickVoice() {
    var voices = synth.getVoices();
    if (!voices.length) return null;
    var prefs = [/Samantha/i, /Ava/i, /Allison/i, /Google US English/i, /Microsoft Aria/i, /Microsoft Jenny/i];
    for (var i = 0; i < prefs.length; i++) {
      var m = voices.find(function (v) { return prefs[i].test(v.name); });
      if (m) return m;
    }
    return voices.find(function (v) { return /en[-_]US/i.test(v.lang); })
        || voices.find(function (v) { return /^en/i.test(v.lang); })
        || voices[0];
  }
  voice = pickVoice();
  try { synth.addEventListener('voiceschanged', function () { voice = pickVoice(); }); } catch (e) {}

  function getText(el) {
    var t = (el.innerText || el.textContent || '');
    // Read "/portfolio" as "portfolio", collapse whitespace.
    return t.replace(/\s*\/(?=[a-z])/gi, ' ').replace(/\s+/g, ' ').trim();
  }
  // Sentence-sized chunks (<~180 chars) keep each utterance short — reliable
  // pause/resume and dodges Chrome's ~15s long-utterance cutoff.
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

  function makeControl(btn, target) {
    var chunks = [], idx = 0, state = 'idle';
    var labelEl = btn.querySelector('.read-aloud__label');
    var icoEl = btn.querySelector('.read-aloud__ico');

    function setState(s) {
      state = s;
      btn.dataset.state = s;
      if (labelEl) labelEl.textContent = s === 'playing' ? 'Pause' : (s === 'paused' ? 'Resume' : 'Listen');
      if (icoEl) icoEl.textContent = s === 'playing' ? '⏸' : '▶';
      btn.setAttribute('aria-pressed', s === 'playing' ? 'true' : 'false');
    }
    function speakNext() {
      if (state === 'idle') return;
      if (idx >= chunks.length) { setState('idle'); return; }
      var u = new SpeechSynthesisUtterance(chunks[idx]);
      if (voice) u.voice = voice;
      u.rate = 0.98; u.pitch = 1;
      u.onend = function () { if (state !== 'idle') { idx++; speakNext(); } };
      u.onerror = function () { if (state !== 'idle') { idx++; speakNext(); } };
      synth.speak(u);
    }
    function start() {
      synth.cancel();
      var txt = getText(target);
      if (!txt) return;
      chunks = chunkText(txt); idx = 0;
      setState('playing'); speakNext();
    }
    function stop() { synth.cancel(); idx = 0; setState('idle'); }

    btn.addEventListener('click', function () {
      if (state === 'idle') { stopOthers(ctrl); start(); }
      else if (state === 'playing') { synth.pause(); setState('paused'); }
      else { synth.resume(); setState('playing'); }
    });

    var ctrl = { stop: stop };
    setState('idle');
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

  // Pages with dynamic content (e.g. a post modal) can stop narration on close.
  window.ReadAloud = { stopAll: function () { controls.forEach(function (c) { c.stop(); }); } };
  window.addEventListener('beforeunload', function () { try { synth.cancel(); } catch (e) {} });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
