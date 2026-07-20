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
