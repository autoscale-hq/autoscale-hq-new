/* ============================================
   AUTOSCALE HQ — Animations Engine
   Scroll reveals · Counters · Typing · FAQ
   ============================================ */

(function () {
  'use strict';

  // ========== SCROLL REVEAL ==========
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealElements.length) return;

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // ========== AUTO-STAGGER CHILDREN ==========
  function initAutoStagger() {
    document.querySelectorAll('[data-stagger]').forEach((parent) => {
      const children = parent.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.1}s`;
      });
    });
  }

  // ========== COUNTER ANIMATION ==========
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    // Easing function (ease-out cubic)
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * target);

      element.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    // Start from 0
    element.textContent = prefix + '0' + suffix;
    requestAnimationFrame(update);
  }

  // ========== FAQ ACCORDION ==========
  function initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all others (optional — remove for multi-open)
        item.closest('.faq-grid, .faq-list')?.querySelectorAll('.faq-item.open').forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove('open');
          }
        });

        item.classList.toggle('open');
      });
    });
  }

  // ========== TYPING ANIMATION ==========
  function initTypingAnimation() {
    document.querySelectorAll('[data-typing]').forEach((el) => {
      const text = el.getAttribute('data-typing');
      const speed = parseInt(el.getAttribute('data-typing-speed') || '50', 10);
      el.textContent = '';
      el.style.visibility = 'visible';

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              typeText(el, text, speed);
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(el);
    });
  }

  function typeText(element, text, speed) {
    let i = 0;
    element.classList.add('typing-cursor');

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed + Math.random() * 30);
      } else {
        // Remove cursor after a pause
        setTimeout(() => element.classList.remove('typing-cursor'), 2000);
      }
    }

    type();
  }

  // ========== PARALLAX SCROLL EFFECT ==========
  function initParallax() {
    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      elements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax') || '0.1');
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + scrollY) - scrollY;
        el.style.transform = `translateY(${offset * speed}px)`;
      });
    }, { passive: true });
  }

  // ========== NUMBER TICKER (for stat items) ==========
  function initStatNumbers() {
    document.querySelectorAll('.stat-number[data-count]').forEach((el) => {
      // Already handled by initCounters
    });
  }

  // ========== TAB SWITCHER ==========
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach((tabContainer) => {
      const buttons = tabContainer.querySelectorAll('[data-tab-btn]');
      const panels = tabContainer.querySelectorAll('[data-tab-panel]');

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-tab-btn');

          buttons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          panels.forEach((p) => {
            p.style.display = p.getAttribute('data-tab-panel') === target ? 'block' : 'none';
          });
        });
      });
    });
  }

  // ========== INIT ALL ==========
  function init() {
    initScrollReveal();
    initAutoStagger();
    initCounters();
    initFaqAccordion();
    initTypingAnimation();
    initParallax();
    initTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
