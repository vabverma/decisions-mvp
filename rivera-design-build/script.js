/* Rivera Design + Build — construction background that assembles as you scroll */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var nav = document.getElementById('nav');
  var layers = Array.prototype.slice.call(document.querySelectorAll('.bg__layer'));
  var bands = Array.prototype.slice.call(document.querySelectorAll('.band'));
  var scrollCue = document.getElementById('scrollCue');
  var stageNum = document.getElementById('stageNum');
  var stageName = document.getElementById('stageName');

  var STAGE_NAMES = ['Foundation', 'Framing', 'Dried In', 'Finished'];
  var lastStage = -1;

  // Cache band centers (document coords). Each band declares its target stage.
  var pts = []; // {center, stage}
  function measure() {
    pts = bands.map(function (b) {
      var r = b.getBoundingClientRect();
      var top = r.top + window.scrollY;
      return { center: top + b.offsetHeight / 2, stage: parseInt(b.getAttribute('data-stage'), 10) };
    }).sort(function (a, b) { return a.center - b.center; });
  }

  function render() {
    var vc = window.scrollY + window.innerHeight / 2;

    // fractional stage index by interpolating between band centers
    var idx;
    if (!pts.length) idx = 0;
    else if (vc <= pts[0].center) idx = pts[0].stage;
    else if (vc >= pts[pts.length - 1].center) idx = pts[pts.length - 1].stage;
    else {
      idx = pts[pts.length - 1].stage;
      for (var i = 0; i < pts.length - 1; i++) {
        if (vc >= pts[i].center && vc < pts[i + 1].center) {
          var t = (vc - pts[i].center) / (pts[i + 1].center - pts[i].center);
          idx = pts[i].stage + t * (pts[i + 1].stage - pts[i].stage);
          break;
        }
      }
    }

    // stacked layers (foundation base) cross-fade upward
    for (var l = 0; l < layers.length; l++) {
      var op = l === 0 ? 1 : clamp(idx - (l - 1), 0, 1);
      layers[l].style.opacity = op;
    }

    // stage chip label reflects nearest whole stage
    var s = Math.round(idx);
    if (s !== lastStage && stageNum) {
      stageNum.textContent = ('0' + (s + 1)).slice(-2);
      stageName.textContent = STAGE_NAMES[s];
      lastStage = s;
    }

    // nav + scroll cue
    if (window.scrollY > 40) nav.classList.add('nav--solid'); else nav.classList.remove('nav--solid');
    if (scrollCue) scrollCue.style.opacity = window.scrollY > 60 ? '0' : '1';
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) { window.requestAnimationFrame(function () { render(); ticking = false; }); ticking = true; }
  }

  measure();
  render();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); render(); });
  window.addEventListener('load', function () { measure(); render(); });

  /* mobile menu */
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
    navToggle.addEventListener('click', function () {
      setMenu(!navMenu.classList.contains('open'));
    });
    navMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) setMenu(false);
    });
  }

  /* reveal content on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
})();
