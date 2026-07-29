(function () {
  'use strict';

  function updateHeroHeight() {
    var vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', (vh * 0.01) + 'px');
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.style.minHeight = vh + 'px';
    }
  }
  updateHeroHeight();
  window.addEventListener('resize', updateHeroHeight);
  window.addEventListener('orientationchange', updateHeroHeight);

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  window.addEventListener('beforeunload', function () {
    window.scrollTo(0, 0);
  });

  window.addEventListener('load', function () {
    updateHeroHeight();
    window.scrollTo(0, 0);
    requestAnimationFrame(function () {
      document.body.classList.remove('is-loading');
    });
  });
  setTimeout(function () { document.body.classList.remove('is-loading'); }, 900);

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

  (function assignStaggerIndices() {
    var groups = new Map();
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.className && el.className.indexOf('hero__line-') !== -1) {
        return;
      }
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
            if (!entry.target.className || entry.target.className.indexOf('hero__line-') === -1) {
              var idx = entry.target.__staggerIndex || 0;
              var delay = Math.min(idx * 80, 320);
              entry.target.style.transitionDelay = delay + 'ms';
            }
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

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

  var counterEl = document.getElementById('subscriberCount');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 2200;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 5);
      var value = Math.floor(eased * target);
      el.textContent = value.toLocaleString('en-US') + '+';

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('en-US') + '+';
        el.classList.add('is-finished');
        setTimeout(function () {
          el.classList.remove('is-finished');
        }, 750);
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

  function wireJoinFlow(btnId, formId) {
    var btn = document.getElementById(btnId);
    var form = document.getElementById(formId);
    if (!btn || !form) return;

    btn.addEventListener('click', function () {
      btn.classList.add('is-hidden');
      form.hidden = false;
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

  var heroSectionEl = document.querySelector('.hero');
  var testimonialsEl = document.querySelector('.testimonials');

  if (nav && heroSectionEl && testimonialsEl) {
    var lastScrollY = window.scrollY;
    var navTicking = false;
    var NAV_BUFFER = 80;

    function updateNavVisibility() {
      var scrollY = window.scrollY;
      var heroBottom = heroSectionEl.offsetTop + heroSectionEl.offsetHeight;
      var testimonialsTop = testimonialsEl.offsetTop;
      var scrollingUp = scrollY < lastScrollY - 2;

      var inAlwaysVisibleZone = scrollY < heroBottom - NAV_BUFFER || scrollY >= testimonialsTop - NAV_BUFFER;

      if (inAlwaysVisibleZone) {
        nav.classList.remove('nav--hidden');
      } else if (scrollingUp) {
        nav.classList.remove('nav--hidden');
      } else if (scrollY > lastScrollY + 2) {
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

  (function initPageTransition() {
    var isTransitioning = false;

    function removeEnteringState() {
      sessionStorage.removeItem('nfw_transition_active');
      document.documentElement.classList.remove('is-entering-mode');
      document.body.classList.remove('is-entering', 'is-transitioning');
    }

    var navEntries = (window.performance && window.performance.getEntriesByType) ? window.performance.getEntriesByType('navigation') : [];
    var isReload = (navEntries.length > 0 && navEntries[0].type === 'reload') || (window.performance && window.performance.navigation && window.performance.navigation.type === 1);

    if (isReload) {
      removeEnteringState();
    } else if (sessionStorage.getItem('nfw_transition_active') || document.documentElement.classList.contains('is-entering-mode')) {
      document.body.classList.add('is-entering');

      var hasRevealed = false;
      function revealPage() {
        if (hasRevealed) return;
        hasRevealed = true;
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            removeEnteringState();
          });
        });
      }

      if (document.readyState === 'complete') {
        setTimeout(revealPage, 400);
      } else {
        window.addEventListener('load', function() {
          setTimeout(revealPage, 400);
        });
        setTimeout(revealPage, 2500);
      }
    } else {
      removeEnteringState();
    }

    document.addEventListener('click', function(e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var anchor = e.target.closest('a');
      if (!anchor) return;

      var href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || anchor.target === '_blank') {
        return;
      }

      var targetUrl = anchor.href;
      var currentUrl = window.location.href.split('#')[0];
      var cleanTarget = targetUrl.split('#')[0];

      if (cleanTarget === currentUrl) {
        return;
      }

      e.preventDefault();
      if (isTransitioning) return;
      isTransitioning = true;

      sessionStorage.setItem('nfw_transition_active', 'true');
      document.body.classList.add('is-transitioning');

      setTimeout(function() {
        window.location.href = targetUrl;
      }, 950);
    });
  })();
})();
