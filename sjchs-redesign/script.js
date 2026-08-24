/* St. Joseph's/Candler — "The Line of Care"
   A single EKG pulse line is drawn down the full page as you scroll,
   with a glowing node riding it and a live BPM/percent readout. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };

  /* year */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- build the full-height pulse path ---------------- */
  var svg   = document.getElementById('pulseSvg');
  var track = document.getElementById('pulseTrack');
  var draw  = document.getElementById('pulseDraw');
  var node  = document.getElementById('pulseNode');
  var core  = document.getElementById('pulseNodeCore');
  var rail  = document.querySelector('.rail');

  var W = 110;          // svg logical width (rail px width)
  var mid = W * 0.5;    // baseline x
  var amp = W * 0.34;   // heartbeat spike width
  var docH = 0, pathLen = 0;

  // Build a vertical line with a heartbeat "blip" every `gap` px.
  function buildPath() {
    // Measure the document from CONTENT ONLY (footer bottom) so the
    // absolutely-positioned rail/SVG can't feed its own height back in.
    var foot = document.querySelector('.foot');
    docH = Math.round(foot.getBoundingClientRect().bottom + window.scrollY);
    rail.style.height = docH + 'px';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + docH);
    svg.style.height = docH + 'px';

    var d = 'M' + mid + ' 0';
    var gap = 260;                       // distance between heartbeats
    var y = 160;
    while (y < docH - 120) {
      // approach, then the classic P-QRS-T spike, drawn vertically
      d += ' L' + mid + ' ' + (y - 26);
      d += ' L' + (mid - amp * 0.28) + ' ' + (y - 14); // small P dip
      d += ' L' + mid + ' ' + (y - 4);
      d += ' L' + (mid + amp) + ' ' + (y + 6);         // R spike (right)
      d += ' L' + (mid - amp * 0.9) + ' ' + (y + 16);  // S dip (left)
      d += ' L' + mid + ' ' + (y + 30);
      d += ' L' + (mid + amp * 0.4) + ' ' + (y + 46);  // T wave
      d += ' L' + mid + ' ' + (y + 60);
      y += gap;
    }
    d += ' L' + mid + ' ' + docH;

    track.setAttribute('d', d);
    draw.setAttribute('d', d);
    pathLen = draw.getTotalLength();
    draw.style.strokeDasharray = pathLen;
    draw.style.strokeDashoffset = pathLen;
  }

  /* ---------------- readouts ---------------- */
  var pct   = document.getElementById('pct');
  var bpmEl = document.getElementById('bpm');
  var vitals = document.querySelector('.vitals');
  var nav = document.getElementById('nav');
  var scrollCue = document.getElementById('scrollCue');
  var bpmShown = -1;

  function render() {
    var scrollable = docH - window.innerHeight;
    var p = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;

    // draw the pulse up to current progress
    if (pathLen) {
      draw.style.strokeDashoffset = pathLen * (1 - p);
      var pt = draw.getPointAtLength(pathLen * p);
      node.setAttribute('cx', pt.x); node.setAttribute('cy', pt.y);
      core.setAttribute('cx', pt.x); core.setAttribute('cy', pt.y);
      if (rail && !rail.classList.contains('armed') && p > 0.002) rail.classList.add('armed');
    }

    // readouts
    if (pct) pct.textContent = ('0' + Math.round(p * 100)).slice(-2) + '%';
    // bpm drifts a touch faster as you go deeper — feels alive
    var bpm = Math.round(lerp(68, 84, p) + Math.sin(window.scrollY / 40) * 1.4);
    if (bpm !== bpmShown && bpmEl) { bpmEl.textContent = bpm; bpmShown = bpm; }

    // nav solidify + reveal vitals + fade cue
    if (window.scrollY > 40) nav.classList.add('nav--solid'); else nav.classList.remove('nav--solid');
    if (vitals) vitals.classList.toggle('show', window.scrollY > 260);
    if (scrollCue) scrollCue.style.opacity = window.scrollY > 80 ? '0' : '1';
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) { requestAnimationFrame(function () { render(); ticking = false; }); ticking = true; }
  }

  buildPath();
  render();
  window.addEventListener('scroll', onScroll, { passive: true });

  // rebuild on resize / after fonts + images settle (doc height changes)
  var rt;
  function relayout() { clearTimeout(rt); rt = setTimeout(function () { buildPath(); render(); }, 120); }
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  /* ---------------- count-up stats ---------------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('.stat__num'));
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var comma  = el.getAttribute('data-comma') === '1';
    var dur = 1500, start = null;
    function fmt(n) { return comma ? n.toLocaleString('en-US') : String(n); }
    function step(ts) {
      if (start === null) start = ts;
      var t = clamp((ts - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------- reveal + trigger counts ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        var num = en.target.querySelector ? en.target.querySelector('.stat__num') : null;
        if (en.target.classList.contains('stat')) num = en.target.querySelector('.stat__num');
        if (num && !num.dataset.done) { num.dataset.done = '1'; runCount(num); }
        io.unobserve(en.target);
      });
    }, { threshold: 0.16 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    counters.forEach(function (el) {
      var s = el.getAttribute('data-suffix') || '';
      var c = el.getAttribute('data-comma') === '1';
      var v = parseInt(el.getAttribute('data-count'), 10);
      el.textContent = (c ? v.toLocaleString('en-US') : v) + s;
    });
  }

  /* ---------------- smooth in-page anchor scroll ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------------- mobile menu ---------------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () { setMenu(!navMenu.classList.contains('open')); });
    navMenu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) setMenu(false);
    });
  }
})();
