/* やること — interactions: theme toggle, scroll reveal, gentle parallax */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Theme toggle ---- */
  var toggle = document.getElementById('themeToggle');
  function syncSwitch() {
    if (toggle) toggle.setAttribute('aria-checked', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  }
  syncSwitch();
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncSwitch();
    });
  }

  /* ---- Scroll reveal ----
     CSS transitions freeze in non-painting/unfocused contexts, which can trap
     content invisible. So: animate only when the document is focused (i.e. surely
     painting); otherwise reveal instantly with an un-transitioned class. Content
     is therefore never stuck hidden. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function showEl(el) {
    if (el.classList.contains('in') || el.classList.contains('shown')) return;
    if (!reduce && document.hasFocus()) {
      el.classList.add('in');          // animated reveal
    } else {
      el.classList.add('shown');       // instant, un-animated
    }
  }

  function sweep() {
    var h = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < revealEls.length; i++) {
      var el = revealEls[i];
      if (el.classList.contains('in') || el.classList.contains('shown')) continue;
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) showEl(el);
    }
  }

  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add('shown'); });
  } else {
    sweep();
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep, { passive: true });
    window.addEventListener('load', sweep);
    window.addEventListener('focus', sweep);
    document.addEventListener('visibilitychange', sweep);
    // Timer-driven sweep: fires even when paint/scroll events are throttled,
    // so content entering the viewport is always revealed. Self-terminates so it
    // never runs indefinitely; the scroll/focus listeners cover any later reveals.
    var ticks = 0;
    var iv = setInterval(function () {
      sweep();
      ticks++;
      var done = revealEls.every(function (el) {
        return el.classList.contains('in') || el.classList.contains('shown');
      });
      if (done || ticks > 40) clearInterval(iv);
    }, 300);
  }

  /* ---- Gentle parallax ---- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!reduce && parallaxEls.length) {
    var ticking = false;
    var vh = window.innerHeight;
    window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });

    function update() {
      var mid = vh / 2;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var delta = (center - mid) / vh;          // -1 .. 1 ish
        var amt = parseFloat(el.getAttribute('data-parallax')) || 0;
        var y = -delta * amt * 90;                 // px
        var base = el.classList.contains('halo') ? 'translate(-50%, -50%) ' : '';
        el.style.transform = base + 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }
})();
