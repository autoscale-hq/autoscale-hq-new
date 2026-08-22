/* ============================================
   AUTOSCALE HQ — Shared Components
   Nav & Footer injection · Mobile menu · Scroll
   ============================================ */

(function () {
  'use strict';

  // ========== CONFIGURATION ==========
  const SITE_NAME = 'AutoScale HQ';
  const SITE_TAGLINE = 'Boosting Growth';

  const NAV_LINKS = [
    { label: 'Home', href: 'index.html' },
    { label: 'Services', href: 'services.html' },
    { label: 'Portfolio', href: 'portfolio.html' },
    { label: 'About', href: 'about.html' },
    { label: 'Blog', href: 'blog.html' },
    { label: 'Contact', href: 'contact.html' },
  ];

  const FOOTER_COLUMNS = [
    {
      title: 'Services',
      links: [
        { label: 'GoHighLevel Setup', href: 'service-ghl.html' },
        { label: 'Workflow Automation', href: 'service-automation.html' },
        { label: 'API Integrations', href: 'services.html#integrations' },
        { label: 'Reporting Dashboards', href: 'services.html#reporting' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: 'about.html' },
        { label: 'Portfolio', href: 'portfolio.html' },
        { label: 'Testimonials', href: 'testimonials.html' },
        { label: 'Blog', href: 'blog.html' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', href: 'faq.html' },
        { label: 'Contact', href: 'contact.html' },
        { label: 'Privacy Policy', href: 'privacy.html' },
        { label: 'Terms & Conditions', href: 'terms.html' },
      ],
    },
  ];

  // ========== HELPERS ==========
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
  }

  function isActive(href) {
    return getCurrentPage() === href;
  }

  // ========== NAVIGATION ==========
  function renderNav() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.id = 'site-header';

    const currentPage = getCurrentPage();

    header.innerHTML = `
      <div class="header-container">
        <a href="index.html" class="nav-logo-link" aria-label="${SITE_NAME} Home">
          <img src="assets/logo.png" alt="${SITE_NAME}" class="nav-logo-img"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <span class="nav-logo-text" style="display:none;">
            Auto<span class="accent">Scale</span> HQ
          </span>
        </a>

        <nav class="nav-links" aria-label="Main navigation">
          ${NAV_LINKS.map(
            (link) =>
              `<a href="${link.href}" class="nav-item ${isActive(link.href) ? 'active' : ''}">${link.label}</a>`
          ).join('')}
        </nav>

        <div class="header-cta">
          <a href="https://calendly.com/autoscalehqnow-info/30min" target="_blank" rel="noopener" class="btn btn-primary btn-magnetic">
            Book a Call <span class="arrow">→</span>
          </a>
        </div>

        <button class="mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div class="mobile-overlay" id="mobile-overlay"></div>

      <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
        ${NAV_LINKS.map(
          (link) =>
            `<a href="${link.href}" class="nav-item ${isActive(link.href) ? 'active' : ''}">${link.label}</a>`
        ).join('')}
        <a href="https://calendly.com/autoscalehqnow-info/30min" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top: auto;">
          Book a Call <span class="arrow">→</span>
        </a>
      </nav>
    `;

    // Insert at top of body
    document.body.prepend(header);

    // Scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.id = 'scroll-progress';
    document.body.prepend(progressBar);

    // ---- Mobile Menu ----
    const toggle = header.querySelector('.mobile-toggle');
    const mobileNav = header.querySelector('#mobile-nav');
    const overlay = header.querySelector('#mobile-overlay');

    function toggleMobile() {
      const isOpen = mobileNav.classList.contains('open');
      mobileNav.classList.toggle('open');
      overlay.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    }

    toggle.addEventListener('click', toggleMobile);
    overlay.addEventListener('click', toggleMobile);

    // Close mobile nav on link click
    mobileNav.querySelectorAll('.nav-item').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileNav.classList.contains('open')) toggleMobile();
      });
    });

    // ---- Scroll behavior ----
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Header background on scroll
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(scrollY / docHeight, 1);
        progressBar.style.transform = `scaleX(${progress})`;
      }

      lastScroll = scrollY;
    }, { passive: true });
  }

  // ========== FOOTER ==========
  function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'site-footer';

    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="assets/logo.png" alt="${SITE_NAME}" class="footer-brand-logo"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none;">
              <span class="nav-logo-text" style="display:inline; margin-bottom:16px;">
                Auto<span class="accent">Scale</span> HQ
              </span>
            </div>
            <p>We help service businesses automate their lead management, follow-ups, and booking systems so they can scale without hiring more staff.</p>
            <p style="margin-top:12px; font-size: 0.875rem; color: var(--color-text-muted);">
              <a href="mailto:admin@autoscalehqnow.com" style="color: var(--color-teal);">admin@autoscalehqnow.com</a><br>
              <a href="tel:+919354281554" style="color: var(--color-text-muted);">+91 93542 81554</a>
            </p>
            <div class="footer-socials">
              <a href="#" class="footer-social-link" aria-label="LinkedIn">in</a>
              <a href="#" class="footer-social-link" aria-label="Twitter">𝕏</a>
              <a href="#" class="footer-social-link" aria-label="Facebook">f</a>
              <a href="#" class="footer-social-link" aria-label="Instagram">◻</a>
            </div>
          </div>

          ${FOOTER_COLUMNS.map(
            (col) => `
            <div class="footer-col">
              <h4 class="footer-col-title">${col.title}</h4>
              <div class="footer-links">
                ${col.links.map((l) => `<a href="${l.href}" class="footer-link">${l.label}</a>`).join('')}
              </div>
            </div>
          `
          ).join('')}
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
          <div class="footer-legal-links">
            <a href="privacy.html" class="footer-link">Privacy Policy</a>
            <a href="terms.html" class="footer-link">Terms & Conditions</a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(footer);
  }

  // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ========== MAGNETIC BUTTON EFFECT ==========
  function initMagneticButtons() {
    document.querySelectorAll('.btn-magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, 0)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.1s ease-out';
      });
    });
  }

  // ========== CARD MOUSE TRACKING (spotlight effect) ==========
  function initCardTracking() {
    document.querySelectorAll('.card-glass').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }

  // ========== INIT ==========
  function init() {
    renderNav();
    renderFooter();
    initSmoothScroll();

    // Delay interactive effects slightly
    requestAnimationFrame(() => {
      initMagneticButtons();
      initCardTracking();
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
