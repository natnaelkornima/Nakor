/**
 * Natnael Kornima — Portfolio Controller
 * Advanced interaction layer: cursor physics, spotlight cards, magnetic CTAs,
 * semantic skill relationships, timeline scroll-fill, and living architecture flows.
 */

import {
  profileData,
  aboutData,
  projectsData,
  skillsData,
  architectureData,
  experienceData,
  educationData,
  githubShowcaseData
} from './data.js?v=10.0';

import { TechKnot3D } from './tech-knot.js?v=10.0';
import { getTechLogo } from './tech-logos.js?v=10.0';
import { Project3DEngine } from './project-3d.js?v=10.0';

// Engines & Subsystems
const project3DEngine = new Project3DEngine();

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const projectListEl = document.getElementById('projects-container');
const filterBtns = document.querySelectorAll('.filter-btn');
const copyEmailBtn = document.getElementById('copy-email-btn');
const copyEmailText = document.getElementById('copy-email-text');
const copyEmailTag = document.getElementById('copy-email-tag');
const copyEmailFooterBtn = document.getElementById('copy-email-footer-btn');
const toastEl = document.getElementById('toast-notice');
const projectDrawerOverlay = document.getElementById('project-drawer');
const projectDrawerContent = document.getElementById('drawer-content');
const drawerCloseBtn = document.getElementById('drawer-close-btn');

// Architecture Tabs
const tabWebBtn = document.getElementById('tab-web-arch');
const tabAiBtn = document.getElementById('tab-ai-arch');
const archDiagramEl = document.getElementById('arch-diagram-flow');
const archTitleEl = document.getElementById('arch-title');
const archDescEl = document.getElementById('arch-description');

const timelineFillBar = document.getElementById('timeline-fill-bar');
const telemetryChip = document.getElementById('hero-telemetry-chip');

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (!prefersDark) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('portfolio-theme', newTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`);
    themeToggleBtn.innerHTML = currentTheme === 'dark' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }
}

/* ==========================================================================
   Header Scroll State & Timeline Scroll
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Experience timeline fill
    if (timelineFillBar) {
      const timelineEl = document.getElementById('experience-timeline');
      if (timelineEl) {
        const rect = timelineEl.getBoundingClientRect();
        const winH = window.innerHeight;
        if (rect.top < winH && rect.bottom > 0) {
          const filled = Math.min(Math.max((winH - rect.top) / rect.height, 0), 1);
          timelineFillBar.style.height = `${filled * 100}%`;
        }
      }
    }
  }, { passive: true });
}

function initScrollReveals() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

function initActiveNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   Hero Telemetry Micro-Tilt & Magnetic CTAs
   ========================================================================== */
function initHeroTelemetryTilt() {
  if (!telemetryChip || window.matchMedia('(hover: none)').matches) return;

  telemetryChip.addEventListener('mousemove', (e) => {
    const rect = telemetryChip.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = (y / (rect.height / 2)) * -4;
    const rotY = (x / (rect.width / 2)) * 4;
    telemetryChip.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
  });

  telemetryChip.addEventListener('mouseleave', () => {
    telemetryChip.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
}

function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  const magneticItems = document.querySelectorAll('.magnetic-item');
  magneticItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Small, restrained delta: max 4px
      item.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translate(0, 0)';
    });
  });
}

/* ==========================================================================
   Mobile Navigation
   ========================================================================== */
function initMobileNav() {
  if (!mobileNavToggle || !mobileMenu) return;

  mobileNavToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', !isOpen);
    mobileNavToggle.setAttribute('aria-expanded', !isOpen);
  });

  const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileNavToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   Projects Rendering & Card Spotlight Hover
   ========================================================================== */
function attachSpotlightListeners() {
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   Projects Rendering & Pinned Horizontal Scroll Sequence
   ========================================================================== */
let projectsScrollCleanup = null;

function renderProjects(filter = 'all') {
  if (!projectListEl) return;

  if (projectsScrollCleanup) {
    projectsScrollCleanup();
    projectsScrollCleanup = null;
  }

  const filtered = filter === 'all' 
    ? projectsData 
    : projectsData.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === filter.toLowerCase());

  projectListEl.style.opacity = '0';

  setTimeout(() => {
    projectListEl.innerHTML = '';

    filtered.forEach((project, idx) => {
      const card = document.createElement('article');
      card.className = 'horizontal-project-card bento-card spotlight-card';
      card.setAttribute('data-id', project.id);
      card.setAttribute('data-index', idx);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View system specifications and details for ${project.title}`);

      card.innerHTML = `
        <div class="bento-visual-header">
          <canvas class="bento-ascii-canvas" data-project-id="${project.id}" aria-hidden="true"></canvas>
          <div class="bento-visual-overlay"></div>
          <span class="bento-visual-badge">
            <span class="bento-pulse-dot"></span>
            ${project.category}
          </span>
          <span class="bento-metric-chip font-mono">${project.metrics || 'SYSTEM SPEC'}</span>
        </div>

        <div class="bento-body">
          <div class="bento-title-row">
            <h3 class="bento-title">${project.title}</h3>
            <span class="bento-expand-icon" aria-hidden="true">↗</span>
          </div>

          <p class="bento-desc">${project.tagline}</p>

          <div class="bento-stack project-stack-pills">
            ${project.techStack.map(t => `<span class="stack-pill">${getTechLogo(t)} <span>${t}</span></span>`).join('')}
          </div>

          <div class="bento-footer">
            <button class="bento-detail-btn view-deep-dive-btn" data-id="${project.id}" type="button">
              <span>System Spec & Details</span>
              <span class="btn-arrow" aria-hidden="true">→</span>
            </button>

            ${project.github ? `
              <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="bento-github-btn" aria-label="GitHub repository for ${project.title}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                <span>Code</span>
              </a>
            ` : ''}
          </div>
        </div>
        <div class="card-shadow-veil" aria-hidden="true"></div>
        <div class="card-peek-badge" aria-hidden="true">
          <span>Next System</span>
          <span aria-hidden="true">→</span>
        </div>
      `;

      // Entire card click: if active, opens modal drawer; if peeking, scrolls to card
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        if (card.classList.contains('is-peeking')) {
          e.stopPropagation();
          scrollShowcaseToIndex(idx);
        } else {
          openProjectDrawer(project.id);
        }
      });

      // Keyboard accessibility
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('a')) return;
          e.preventDefault();
          if (card.classList.contains('is-peeking')) {
            scrollShowcaseToIndex(idx);
          } else {
            openProjectDrawer(project.id);
          }
        }
      });

      projectListEl.appendChild(card);
    });

    // Mount 3D Canvas Simulations
    project3DEngine.mountAll();

    // Reattach spotlight and magnetic listeners
    attachSpotlightListeners();
    initMagneticButtons();

    // Initialize Horizontal Scroll Engine
    initProjectsHorizontalScroll();

    projectListEl.style.opacity = '1';
  }, 100);
}

let scrollShowcaseToIndex = (idx) => {};

function initProjectsHorizontalScroll() {
  const section = document.getElementById('projects');
  const viewport = document.getElementById('projects-viewport');
  const track = document.getElementById('projects-container');
  const hudActiveNum = document.getElementById('project-active-num');
  const hudTotalNum = document.getElementById('project-total-num');
  const hudFill = document.getElementById('projects-hud-fill');
  const prevBtn = document.getElementById('project-prev-btn');
  const nextBtn = document.getElementById('project-next-btn');

  if (!section || !viewport || !track) return;

  const cards = Array.from(track.querySelectorAll('.horizontal-project-card'));
  const totalCards = cards.length;

  if (hudTotalNum) {
    hudTotalNum.textContent = String(totalCards).padStart(2, '0');
  }

  // Single card mode: no horizontal scroll required
  if (totalCards <= 1) {
    section.style.setProperty('--projects-scroll-height', 'auto');
    if (cards[0]) {
      cards[0].style.transform = 'none';
      cards[0].style.opacity = '1';
      cards[0].style.filter = 'none';
      cards[0].classList.add('is-active');
      cards[0].classList.remove('is-peeking');
      const veil = cards[0].querySelector('.card-shadow-veil');
      if (veil) veil.style.opacity = '0';
    }
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (hudFill) hudFill.style.width = '100%';
    if (hudActiveNum) hudActiveNum.textContent = '01';
    scrollShowcaseToIndex = () => {};
    return;
  }

  // Calculate section scroll height: (totalCards - 1) * 90vh + 100vh
  const scrollDistancePerCard = window.innerHeight * 0.9;
  const totalScrollDistance = (totalCards - 1) * scrollDistancePerCard;
  const sectionHeight = totalScrollDistance + window.innerHeight;
  section.style.setProperty('--projects-scroll-height', `${sectionHeight}px`);

  // Align Card 0 with the site's container
  const headerWrap = section.querySelector('.projects-pinned-header-wrap');
  let padLeft = 24;
  if (headerWrap) {
    const rect = headerWrap.getBoundingClientRect();
    padLeft = Math.max(rect.left, 24);
  }
  track.style.setProperty('--projects-track-pad', `${padLeft}px`);

  let currentVirtualIndex = 0;
  let targetVirtualIndex = 0;
  let isTicking = false;
  let rafId = null;

  function calculateCardStep() {
    if (cards.length < 2) return cards[0]?.offsetWidth || 600;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    return step > 0 ? step : (cards[0].offsetWidth + 36);
  }

  let cardStep = calculateCardStep();

  function updateVisuals(virtualIdx) {
    const currentActive = Math.round(virtualIdx);

    // Update HUD indicator
    if (hudActiveNum) {
      const displayNum = Math.min(Math.max(currentActive + 1, 1), totalCards);
      hudActiveNum.textContent = String(displayNum).padStart(2, '0');
    }

    if (hudFill) {
      const pct = (virtualIdx / (totalCards - 1)) * 100;
      hudFill.style.width = `${Math.min(Math.max(pct, 12), 100)}%`;
    }

    if (prevBtn) prevBtn.disabled = virtualIdx <= 0.05;
    if (nextBtn) nextBtn.disabled = virtualIdx >= (totalCards - 1) - 0.05;

    // Translate the track horizontally
    const trackX = -virtualIdx * cardStep;
    track.style.transform = `translate3d(${trackX}px, 0, 0)`;

    // Update each card's scale, opacity, filter, and shadow veil
    cards.forEach((card, idx) => {
      const diff = idx - virtualIdx;
      const absDiff = Math.abs(diff);
      const veil = card.querySelector('.card-shadow-veil');

      if (absDiff < 0.08) {
        // Active Center Card: 100% visible, sharp, interactive
        card.style.transform = 'scale(1) translateZ(0)';
        card.style.opacity = '1';
        card.style.filter = 'none';
        card.style.zIndex = '10';
        card.classList.add('is-active');
        card.classList.remove('is-peeking');
        if (veil) veil.style.opacity = '0';
      } else if (diff > 0) {
        // Card to the right (Next card coming up / peeking in shadow)
        card.classList.remove('is-active');
        card.classList.add('is-peeking');

        const factor = Math.min(diff, 1);
        const scale = 1.0 - (0.08 * factor);
        const opacity = 1.0 - (0.62 * factor); // 0.38 at diff=1
        const blur = factor * 1.5;
        const brightness = 1.0 - (0.35 * factor); // 0.65 at diff=1

        // If card is further than 1 step away, fade out gracefully
        let finalOpacity = opacity;
        if (diff > 1) {
          finalOpacity = Math.max(0, 0.38 - (diff - 1) * 0.4);
        }

        card.style.transform = `scale(${scale.toFixed(3)}) translateZ(0)`;
        card.style.opacity = finalOpacity.toFixed(3);
        card.style.filter = `brightness(${brightness.toFixed(2)}) blur(${blur.toFixed(1)}px)`;
        card.style.zIndex = String(10 - idx);
        if (veil) veil.style.opacity = (factor * 0.72).toFixed(2);
      } else {
        // Card to the left (Previous card exiting to the left in shadow)
        card.classList.remove('is-active');
        card.classList.remove('is-peeking');

        const factor = Math.min(absDiff, 1);
        const scale = 1.0 - (0.08 * factor);
        const opacity = Math.max(0, 1.0 - (0.75 * factor)); // 0.25 at diff=-1
        const blur = factor * 2;
        const brightness = 1.0 - (0.45 * factor); // 0.55 at diff=-1

        card.style.transform = `scale(${scale.toFixed(3)}) translateZ(0)`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = `brightness(${brightness.toFixed(2)}) blur(${blur.toFixed(1)}px)`;
        card.style.zIndex = String(5 - Math.round(absDiff));
        if (veil) veil.style.opacity = (factor * 0.8).toFixed(2);
      }
    });
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrollTravel = section.offsetHeight - window.innerHeight;

    if (scrollTravel <= 0) {
      updateVisuals(0);
      return;
    }

    const scrolled = -rect.top;
    const progress = Math.min(Math.max(scrolled / scrollTravel, 0), 1);
    targetVirtualIndex = progress * (totalCards - 1);

    if (!isTicking) {
      isTicking = true;
      rafLoop();
    }
  }

  function rafLoop() {
    const delta = targetVirtualIndex - currentVirtualIndex;
    if (Math.abs(delta) < 0.001) {
      currentVirtualIndex = targetVirtualIndex;
      updateVisuals(currentVirtualIndex);
      isTicking = false;
      return;
    }

    currentVirtualIndex += delta * 0.2;
    updateVisuals(currentVirtualIndex);
    rafId = requestAnimationFrame(rafLoop);
  }

  // Smooth scroll helper to navigate directly to any card index
  scrollShowcaseToIndex = (targetIdx) => {
    targetIdx = Math.min(Math.max(targetIdx, 0), totalCards - 1);
    const scrollTravel = section.offsetHeight - window.innerHeight;
    const targetProgress = targetIdx / (totalCards - 1);
    const targetScrollY = section.offsetTop + (targetProgress * scrollTravel);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  const onPrevClick = () => {
    const current = Math.round(targetVirtualIndex);
    scrollShowcaseToIndex(current - 1);
  };

  const onNextClick = () => {
    const current = Math.round(targetVirtualIndex);
    scrollShowcaseToIndex(current + 1);
  };

  prevBtn?.addEventListener('click', onPrevClick);
  nextBtn?.addEventListener('click', onNextClick);

  // Keyboard navigation when section is in viewport
  function onKeyDown(e) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= window.innerHeight * 0.4) {
      if (e.key === 'ArrowRight') {
        const current = Math.round(targetVirtualIndex);
        if (current < totalCards - 1) {
          e.preventDefault();
          scrollShowcaseToIndex(current + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        const current = Math.round(targetVirtualIndex);
        if (current > 0) {
          e.preventDefault();
          scrollShowcaseToIndex(current - 1);
        }
      }
    }
  }

  // Touch Swipe on mobile
  let touchStartX = 0;
  let touchStartY = 0;

  function onTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only trigger if horizontal swipe is more pronounced than vertical scroll
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      const current = Math.round(targetVirtualIndex);
      if (diffX > 0 && current < totalCards - 1) {
        scrollShowcaseToIndex(current + 1);
      } else if (diffX < 0 && current > 0) {
        scrollShowcaseToIndex(current - 1);
      }
    }
  }

  viewport.addEventListener('touchstart', onTouchStart, { passive: true });
  viewport.addEventListener('touchend', onTouchEnd, { passive: true });

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });

  function onResize() {
    cardStep = calculateCardStep();
    if (headerWrap) {
      const rect = headerWrap.getBoundingClientRect();
      padLeft = Math.max(rect.left, 24);
      track.style.setProperty('--projects-track-pad', `${padLeft}px`);
    }
    const currentDistance = (totalCards - 1) * (window.innerHeight * 0.9);
    section.style.setProperty('--projects-scroll-height', `${currentDistance + window.innerHeight}px`);
    onScroll();
  }

  window.addEventListener('resize', onResize, { passive: true });

  // Cleanup handler for filter switches
  projectsScrollCleanup = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchend', onTouchEnd);
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
    if (rafId) cancelAnimationFrame(rafId);
  };

  // Initial calculation and visual render
  cardStep = calculateCardStep();
  onScroll();
}

function initProjectFilters() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      renderProjects(filter);
    });
  });
}

/* ==========================================================================
   Project Detail Drawer / Modal
   ========================================================================== */
function openProjectDrawer(projectId) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project || !projectDrawerContent || !projectDrawerOverlay) return;

  projectDrawerContent.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
      <span class="project-category-badge">${project.category}</span>
      <span class="font-mono text-xs text-muted">${project.metrics || 'SYSTEM SPEC'}</span>
    </div>

    <h2 style="font-size: 2rem; margin-bottom: 0.5rem; letter-spacing: -0.02em;">${project.title}</h2>
    <p style="font-size: 1.05rem; color: var(--text-secondary); margin-bottom: 1.75rem; line-height: 1.6;">${project.tagline}</p>

    <!-- Schematic Architecture Pipeline Flow -->
    ${project.schematicFlow ? `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 0.82rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.75rem;">System Architecture Pipeline</h3>
        <div class="project-schematic-strip" aria-label="Pipeline schematic flow" style="margin-bottom: 0;">
          <span style="font-weight: 600; color: var(--text-primary); margin-right: 0.25rem;">FLOW:</span>
          ${project.schematicFlow.map((step, idx) => `
            <span class="schematic-pill">${step}</span>
            ${idx < project.schematicFlow.length - 1 ? '<span class="schematic-arrow">→</span>' : ''}
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="margin-bottom: 2rem;">
      <h3 style="font-size: 0.82rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.75rem;">Problem & Context</h3>
      <p style="font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">${project.problem}</p>
    </div>

    <div style="margin-bottom: 2rem;">
      <h3 style="font-size: 0.82rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.75rem;">Engineering Solution</h3>
      <p style="font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">${project.solution}</p>
    </div>

    ${project.keyDecisions && project.keyDecisions.length ? `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 0.82rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.75rem;">Key Architecture Decisions</h3>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; padding: 0;">
          ${project.keyDecisions.map(d => `
            <li style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); padding-left: 1.25rem; position: relative;">
              <span style="position: absolute; left: 0; color: var(--accent);">▸</span>
              ${d}
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    <div style="margin-bottom: 2.5rem;">
      <h3 style="font-size: 0.82rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.75rem;">Technology Stack</h3>
      <div class="project-stack-pills">
        ${project.techStack.map(t => `<span class="stack-pill" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">${getTechLogo(t)} <span>${t}</span></span>`).join('')}
      </div>
    </div>

    <div style="display: flex; gap: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem; flex-wrap: wrap;">
      ${project.github ? `
        <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary magnetic-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          <span>View on GitHub</span>
          <span class="btn-arrow">↗</span>
        </a>
      ` : ''}
      ${project.liveDemo ? `
        <a href="${project.liveDemo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary magnetic-item">
          <span>Live Demo</span>
          <span class="btn-arrow">↗</span>
        </a>
      ` : ''}
    </div>
  `;

  projectDrawerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  initMagneticButtons();
}

function closeProjectDrawer() {
  if (!projectDrawerOverlay) return;
  projectDrawerOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function initDrawerEvents() {
  drawerCloseBtn?.addEventListener('click', closeProjectDrawer);
  projectDrawerOverlay?.addEventListener('click', (e) => {
    if (e.target === projectDrawerOverlay) {
      closeProjectDrawer();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectDrawerOverlay?.classList.contains('open')) {
      closeProjectDrawer();
    }
  });
}

/* ==========================================================================
   Architecture Visualizer Tabs (Interactive Node Exploration)
   ========================================================================== */
function renderArchitectureFlow(type = 'web') {
  if (!archDiagramEl || !archTitleEl || !archDescEl) return;

  const data = type === 'web' ? architectureData.webApplication : architectureData.aiPipeline;
  archTitleEl.textContent = data.title;
  archDescEl.textContent = data.description;

  const parseTechBadges = (techStr) => {
    return techStr
      .split(/[\/\+]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  };

  const flowTrackLabels = type === 'web' 
    ? ['01 CLIENT', '02 GATEWAY', '03 COMPUTE', '04 STATE']
    : ['01 INGRESS', '02 RETRIEVAL', '03 INFERENCE', '04 VALIDATE'];

  const flowTrackHtml = `
    <div class="arch-flow-track font-mono" aria-hidden="true">
      ${flowTrackLabels.map((lbl, i) => `
        <span class="arch-flow-point"><span class="flow-dot"></span>${lbl}</span>
        ${i < 3 ? '<span class="arch-flow-arrow">──────→</span>' : ''}
      `).join('')}
    </div>
  `;

  archDiagramEl.innerHTML = flowTrackHtml + `
    <div class="arch-nodes-grid">
      ${data.layers.map((layer, idx) => {
        const techs = parseTechBadges(layer.tech);
        return `
          <div class="arch-node spotlight-card" data-idx="${idx}" tabindex="0" role="region" aria-label="${layer.layer || layer.step}">
            <div class="arch-node-top">
              <span class="arch-node-step font-mono">${layer.step || `Layer 0${idx + 1}`}</span>
              <span class="arch-node-num font-mono">#0${idx + 1}</span>
            </div>
            <h4 class="arch-node-title">${layer.layer || layer.step.replace(/^[0-9.]+\s*/, '')}</h4>
            <div class="arch-tech-badges">
              ${techs.map(t => `<span class="arch-tech-pill">${getTechLogo(t)} <span>${t}</span></span>`).join('')}
            </div>
            <p class="arch-node-detail">${layer.detail}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;

  attachSpotlightListeners();
}

function initArchitectureTabs() {
  if (!tabWebBtn || !tabAiBtn) return;

  tabWebBtn.addEventListener('click', () => {
    tabWebBtn.classList.add('active');
    tabAiBtn.classList.remove('active');
    renderArchitectureFlow('web');
  });

  tabAiBtn.addEventListener('click', () => {
    tabAiBtn.classList.add('active');
    tabWebBtn.classList.remove('active');
    renderArchitectureFlow('ai');
  });

  renderArchitectureFlow('web');
}

/* ==========================================================================
   Skills Matrix (With Semantic Relationship Highlighting & Prominent Logos)
   ========================================================================== */
function renderSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  const categoryKickoffs = [
    '01 // CLIENT ARCHITECTURE',
    '02 // DISTRIBUTED SERVICES',
    '03 // MACHINE INTELLIGENCE',
    '04 // DEVOPS & INFRASTRUCTURE'
  ];

  container.innerHTML = skillsData.categories.map((cat, cIdx) => `
    <div class="skill-category-card">
      <div class="skill-category-header">
        <div class="skill-category-meta">
          <span class="skill-category-kicker font-mono">${categoryKickoffs[cIdx] || `DOMAIN 0${cIdx + 1}`}</span>
          <span class="skill-category-count font-mono">${cat.skills.length} TECHS</span>
        </div>
        <h3 class="skill-category-name">${cat.name}</h3>
        <p class="skill-category-desc">${cat.description}</p>
      </div>

      <div class="skills-card-grid">
        ${cat.skills.map(s => {
          const levelLower = s.level.toLowerCase();
          return `
            <div class="skill-card spotlight-card" data-rel="${s.rel || 'general'}" tabindex="0" role="region" aria-label="${s.name} - ${s.level}">
              <div class="skill-icon-tile" aria-hidden="true">
                ${getTechLogo(s.name)}
              </div>
              <div class="skill-card-content">
                <div class="skill-card-header">
                  <h4 class="skill-card-title">${s.name}</h4>
                  <span class="skill-level-chip skill-level-${levelLower} font-mono">${s.level}</span>
                </div>
                <p class="skill-card-note">${s.note}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  attachSpotlightListeners();
}

/* ==========================================================================
   GitHub Activity Showcase Renderer
   ========================================================================== */
function renderGitHubShowcase() {
  const container = document.getElementById('github-showcase-container');
  if (!container) return;

  const getRepoLangHtml = (langStr) => {
    if (!langStr) return '';
    const items = langStr.split(' / ');
    return items.map(name => {
      const logo = getTechLogo(name.trim());
      return `<span class="github-repo-lang-item">${logo ? logo : ''}<span>${name.trim()}</span></span>`;
    }).join('<span style="color: var(--text-muted); opacity: 0.4; margin: 0 0.2rem;">/</span>');
  };

  container.innerHTML = `
    <div class="github-panel">
      <!-- Top Profile Meta Bar -->
      <div class="github-header-bar">
        <div class="github-profile-meta">
          <div class="github-avatar-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </div>
          <div class="github-profile-text">
            <div class="github-profile-handle-row">
              <span class="github-profile-handle">@${githubShowcaseData.username}</span>
              <span class="github-badge-repo-count">
                <span class="repo-dot"></span>
                <span>${githubShowcaseData.publicRepos} Repositories</span>
              </span>
            </div>
            <span class="github-profile-sub font-mono">github.com/${githubShowcaseData.username}</span>
          </div>
        </div>
        <a href="${githubShowcaseData.profileUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary magnetic-item" style="padding: 0.55rem 1.15rem; font-size: 0.85rem;" aria-label="Open GitHub Profile of Natnael Kornima">
          <span>View GitHub</span>
          <span class="btn-arrow">↗</span>
        </a>
      </div>

      <!-- Languages Progress Distribution Bar -->
      <div class="github-distribution-section">
        <div class="github-distribution-header">
          <span class="github-distribution-title">Primary Codebase Distribution</span>
        </div>
        <div class="github-distribution-bar" role="progressbar" aria-label="Codebase Language Breakdown">
          ${githubShowcaseData.languages.map(lang => `
            <div class="github-distribution-segment" style="width: ${lang.percentage}%; background-color: ${lang.color};" title="${lang.name}: ${lang.percentage}%"></div>
          `).join('')}
        </div>
        <div class="github-languages-list">
          ${githubShowcaseData.languages.map(lang => `
            <div class="github-lang-pill">
              <span class="github-lang-dot" style="background-color: ${lang.color};"></span>
              <span>${lang.name}</span>
              <span class="github-lang-pct font-mono">(${lang.percentage}%)</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Highlighted Public Repositories Grid (2x2) -->
      <div class="github-repos-grid">
        ${githubShowcaseData.pinnedRepos.map(repo => `
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="github-repo-card spotlight-card" aria-label="Repository ${repo.name} on GitHub">
            <div>
              <div class="github-repo-top">
                <div class="github-repo-name-group">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="github-repo-icon" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span class="github-repo-name">${repo.name}</span>
                </div>
                <div class="github-repo-right-meta">
                  <span class="github-repo-badge">Public</span>
                  <span class="github-repo-arrow" aria-hidden="true">↗</span>
                </div>
              </div>
              <p class="github-repo-desc">${repo.description}</p>
            </div>
            <div class="github-repo-footer">
              <div class="github-repo-lang-group">
                ${getRepoLangHtml(repo.language)}
              </div>
              <span class="github-repo-branch font-mono">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                <span>main</span>
              </span>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  attachSpotlightListeners();
}

/* ==========================================================================
   Experience & Education Rendering
   ========================================================================== */
function renderExperience() {
  const container = document.getElementById('experience-timeline');
  if (!container) return;

  const timelineHtml = experienceData.map(item => `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-period">${item.period}</div>
      <h3 class="timeline-role">${item.role}</h3>
      <div class="timeline-company">${item.company} · ${item.location}</div>
      <ul class="timeline-highlights">
        ${item.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
      <div class="project-stack-pills" style="margin-top: 1rem;">
        ${item.technologies.map(t => `<span class="stack-pill">${getTechLogo(t)} <span>${t}</span></span>`).join('')}
      </div>
    </div>
  `).join('');

  // Keep fill bar element intact
  const fillBar = container.querySelector('.timeline-fill-bar');
  container.innerHTML = (fillBar ? fillBar.outerHTML : '<div id="timeline-fill-bar" class="timeline-fill-bar"></div>') + timelineHtml;
}

function renderEducation() {
  const container = document.getElementById('education-container');
  if (!container) return;

  container.innerHTML = educationData.map(item => `
    <div class="principle-card" style="margin-bottom: 1rem;">
      <span class="font-mono text-xs text-muted">${item.period}</span>
      <h4 class="principle-title" style="margin-top: 0.25rem;">${item.program}</h4>
      <p class="principle-desc">${item.institution}</p>
      <ul style="list-style: none; margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem;">
        ${item.highlights.map(h => `
          <li style="font-size: 0.85rem; color: var(--text-secondary); padding-left: 1rem; position: relative;">
            <span style="position: absolute; left: 0; color: var(--accent);">—</span>
            ${h}
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

/* ==========================================================================
   Copy Email Feedback (Toast & In-Place Morph)
   ========================================================================== */
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2600);
}

function initCopyEmail() {
  const handler = () => {
    navigator.clipboard.writeText(profileData.email).then(() => {
      showToast(`Copied ${profileData.email} to clipboard`);
      if (copyEmailBtn && copyEmailTag) {
        copyEmailBtn.classList.add('copied');
        copyEmailTag.textContent = '[✓ Copied!]';
        setTimeout(() => {
          copyEmailBtn.classList.remove('copied');
          copyEmailTag.textContent = '[Copy]';
        }, 2500);
      }
    }).catch(() => {
      showToast(profileData.email);
    });
  };

  copyEmailBtn?.addEventListener('click', handler);
  copyEmailFooterBtn?.addEventListener('click', handler);
}

/* ==========================================================================
   Initialization
   ========================================================================== */
function initApp() {
  initTheme();
  themeToggleBtn?.addEventListener('click', toggleTheme);
  
  initHeaderScroll();
  initScrollReveals();
  initActiveNavObserver();
  initMobileNav();
  initHeroTelemetryTilt();
  
  renderProjects('all');
  initProjectFilters();
  initDrawerEvents();
  
  initArchitectureTabs();
  renderSkills();
  renderGitHubShowcase();
  renderExperience();
  renderEducation();
  initCopyEmail();

  // Initialize 3D Procedural Tech Knot
  new TechKnot3D('hero-tech-knot-canvas');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
