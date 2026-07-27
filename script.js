/* ============================================================
   NOFLUFFWISDOM — interaction layer (Round 3 pass)
   1. Loading fade-in
   2. Mobile nav toggle
   3. Scroll progress indicator
   4. Stagger reveal-on-scroll
   5. Mouse-reactive glass ([data-glass] cards)
   6. Hero parallax (glow + orbs drift with scroll)
   7. Animated subscriber counter
   8. Join button -> email form reveal
   9. Dark / light theme toggle
   10. Nav auto-hide: visible on hero + last two sections, hidden
       in between, reveals on any upward scroll
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Loading fade-in ---------- */
  window.addEventListener('load', function () {
    requestAnimationFrame(function () {
      document.body.classList.remove('is-loading');
    });
  });
  // Fallback in case 'load' already fired or fonts stall
  setTimeout(function () { document.body.classList.remove('is-loading'); }, 900);

  /* ---------- 2. Mobile nav toggle & backdrop blur ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navBackdrop = document.getElementById('navBackdrop');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    if (navBackdrop) {
      navBackdrop.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    }
    nav.querySelectorAll('.nav__links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 3. Scroll progress indicator ---------- */
  var progressBar = document.getElementById('progressBar');
  var ticking = false;

  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateProgress();

  /* ---------- 4. Stagger reveal-on-scroll ---------- */
  // Assign a stagger index per sibling group (elements sharing a parent)
  (function assignStaggerIndices() {
    var groups = new Map();
    document.querySelectorAll('.reveal').forEach(function (el) {
      var parent = el.parentElement;
      var count = groups.get(parent) || 0;
      el.__staggerIndex = count;
      groups.set(parent, count + 1);
    });
  })();

  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = entry.target.__staggerIndex || 0;
            var delay = Math.min(idx * 90, 360); // ms, capped
            entry.target.style.transitionDelay = delay + 'ms';
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 5. Mouse-reactive glass ---------- */
  var glassEls = document.querySelectorAll('[data-glass]');
  glassEls.forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', x + '%');
      el.style.setProperty('--my', y + '%');
    });
    el.addEventListener('mouseleave', function () {
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    });
  });

  /* ---------- 6. Hero parallax ---------- */
  // Fixed background stays pinned at top 0 without translateY displacement

  /* ---------- 7. Animated subscriber counter ---------- */
  var counterEl = document.getElementById('subscriberCount');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1500;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value.toLocaleString('en-US');
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('en-US') + '+';
      }
    }
    window.requestAnimationFrame(step);
  }

  if (counterEl && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counterObserver.observe(counterEl);
  } else if (counterEl) {
    counterEl.textContent = (counterEl.getAttribute('data-target') || '0') + '+';
  }

  /* ---------- Success Modal Popup Handler ---------- */
  var successModal = document.getElementById('successModal');
  var modalClose = document.getElementById('modalClose');
  var modalOverlay = document.getElementById('modalOverlay');
  var modalConfirmBtn = document.getElementById('modalConfirmBtn');

  function openSuccessModal() {
    if (!successModal) return;
    successModal.classList.add('is-open');
    successModal.setAttribute('aria-hidden', 'false');
  }

  function closeSuccessModal() {
    if (!successModal) return;
    successModal.classList.remove('is-open');
    successModal.setAttribute('aria-hidden', 'true');
  }

  if (modalClose) modalClose.addEventListener('click', closeSuccessModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeSuccessModal);
  if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', closeSuccessModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && successModal && successModal.classList.contains('is-open')) {
      closeSuccessModal();
    }
  });

  /* ---------- 8. Join button -> email form reveal & fancy modal ---------- */
  function wireJoinFlow(btnId, formId) {
    var btn = document.getElementById(btnId);
    var form = document.getElementById(formId);
    if (!btn || !form) return;

    btn.addEventListener('click', function () {
      btn.classList.add('is-hidden');
      form.hidden = false;
      // next frame so the transition actually runs
      requestAnimationFrame(function () {
        form.classList.add('is-shown');
        var input = form.querySelector('input[type="email"]');
        if (input) input.focus();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input || !input.value) return;

      input.value = '';
      form.classList.remove('is-shown');
      setTimeout(function () {
        form.hidden = true;
        btn.classList.remove('is-hidden');
      }, 450);

      openSuccessModal();
    });
  }

  wireJoinFlow('heroJoinBtn', 'heroForm');
  wireJoinFlow('finalJoinBtn', 'finalForm');

  /* ---------- 9. (Theme toggle removed — light only) ---------- */
  var htmlEl = document.documentElement;

  /* ---------- 10. Nav auto-hide between hero and the final stretch ---------- */
  var heroSectionEl = document.querySelector('.hero');
  var testimonialsEl = document.querySelector('.testimonials');

  if (nav && heroSectionEl && testimonialsEl) {
    var lastScrollY = window.scrollY;
    var navTicking = false;
    var NAV_BUFFER = 80; // px, keeps the toggle from flickering right at the boundary

    function updateNavVisibility() {
      var scrollY = window.scrollY;
      var heroBottom = heroSectionEl.offsetTop + heroSectionEl.offsetHeight;
      var testimonialsTop = testimonialsEl.offsetTop;
      var scrollingUp = scrollY < lastScrollY - 2; // small tolerance to ignore jitter

      var inAlwaysVisibleZone = scrollY < heroBottom - NAV_BUFFER || scrollY >= testimonialsTop - NAV_BUFFER;

      if (inAlwaysVisibleZone) {
        nav.classList.remove('nav--hidden');
      } else if (scrollingUp) {
        nav.classList.remove('nav--hidden');
      } else if (scrollY > lastScrollY + 2) {
        // scrolling down inside the mid-page zone
        nav.classList.add('nav--hidden');
      }

      lastScrollY = scrollY;
      navTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!navTicking) {
        requestAnimationFrame(updateNavVisibility);
        navTicking = true;
      }
    }, { passive: true });

    updateNavVisibility();
  }

  /* ---------- 11. Dynamic navbar contrast on light/dark sections ---------- */
  var lightSections = document.querySelectorAll('.proof, .solution, .content, .testimonials');
  if ('IntersectionObserver' in window && lightSections.length && nav) {
    var navColorObserver = new IntersectionObserver(function(entries) {
      var overLight = entries.some(function(entry) {
        return entry.isIntersecting && entry.boundingClientRect.top <= 60 && entry.boundingClientRect.bottom >= 20;
      });
      if (overLight) {
        nav.style.color = 'var(--ink)';
      } else {
        nav.style.color = 'var(--on-dark)';
      }
    }, { threshold: [0, 0.2, 0.5, 0.8, 1] });

    lightSections.forEach(function(sec) { navColorObserver.observe(sec); });
  }

  /* ---------- 12. Hero Background Video Crossfade Loop Engine ---------- */
  (function initHeroVideoCrossfade() {
    var vidA = document.getElementById('heroVidA');
    var vidB = document.getElementById('heroVidB');
    if (!vidA || !vidB) return;

    var CROSSFADE_SEC = 1.5;
    var isCrossfading = false;
    var activeVid = vidA;
    var standbyVid = vidB;

    function playActive() {
      activeVid.classList.add('is-active');
      var p = activeVid.play();
      if (p && p.catch) p.catch(function() {});
    }

    playActive();

    function checkCrossfade() {
      if (!activeVid.duration || isNaN(activeVid.duration)) return;
      var remaining = activeVid.duration - activeVid.currentTime;

      if (remaining <= CROSSFADE_SEC && !isCrossfading) {
        isCrossfading = true;

        standbyVid.currentTime = 0;
        var p = standbyVid.play();
        var onPlay = function() {
          standbyVid.classList.add('is-active');
          activeVid.classList.remove('is-active');

          setTimeout(function() {
            activeVid.pause();
            activeVid.currentTime = 0;

            var temp = activeVid;
            activeVid = standbyVid;
            standbyVid = temp;
            isCrossfading = false;
          }, CROSSFADE_SEC * 1000);
        };

        if (p && p.then) {
          p.then(onPlay).catch(function() { isCrossfading = false; });
        } else {
          onPlay();
        }
      }
    }

    vidA.addEventListener('timeupdate', checkCrossfade);
    vidB.addEventListener('timeupdate', checkCrossfade);
  })();
})();
