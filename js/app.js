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
} from './data.js?v=9.5';

import { TechKnot3D } from './tech-knot.js?v=9.5';
import { getTechLogo } from './tech-logos.js?v=9.5';
import { Project3DEngine } from './project-3d.js?v=9.5';

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
   Header Scroll State
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });
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

function renderProjects(filter = 'all') {
  if (!projectListEl) return;

  const filtered = filter === 'all' 
    ? projectsData 
    : projectsData.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === filter.toLowerCase());

  projectListEl.style.opacity = '0';

  setTimeout(() => {
    projectListEl.innerHTML = '';

    const bentoGrid = document.createElement('div');
    bentoGrid.className = 'projects-bento-grid';

    filtered.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'bento-card spotlight-card';
      card.setAttribute('data-id', project.id);
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
      `;

      // Entire card click opens modal drawer, except when clicking the GitHub link
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        openProjectDrawer(project.id);
      });

      // Keyboard accessibility (Enter or Space opens drawer)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('a')) return;
          e.preventDefault();
          openProjectDrawer(project.id);
        }
      });

      bentoGrid.appendChild(card);
    });

    projectListEl.appendChild(bentoGrid);

    // Mount Real-Time Procedural 3D Canvas Simulations
    project3DEngine.mountAll();

    // Reattach spotlight and magnetic listeners
    attachSpotlightListeners();
    initMagneticButtons();

    projectListEl.style.opacity = '1';
  }, 120);
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

  container.innerHTML = `
    <div style="background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-xl); padding: clamp(1.5rem, 4vw, 2.5rem); box-shadow: var(--shadow-sm);">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
        <div>
          <span class="font-mono text-xs text-muted">PROFILE: github.com/${githubShowcaseData.username}</span>
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-top: 0.25rem;">${githubShowcaseData.publicRepos} Public Repositories</h3>
        </div>
        <a href="${githubShowcaseData.profileUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary magnetic-item" style="padding: 0.5rem 1.1rem;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          <span>View GitHub</span>
          <span class="btn-arrow">↗</span>
        </a>
      </div>

      <!-- Languages Progress Distribution Bar -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <span>PRIMARY CODEBASE DISTRIBUTION</span>
        </div>
        <div style="height: 8px; width: 100%; border-radius: var(--radius-full); overflow: hidden; display: flex; background: var(--bg-subtle);">
          ${githubShowcaseData.languages.map(lang => `
            <div style="width: ${lang.percentage}%; background-color: ${lang.color}; height: 100%;" title="${lang.name}: ${lang.percentage}%"></div>
          `).join('')}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: 0.75rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">
          ${githubShowcaseData.languages.map(lang => `
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="width: 8px; height: 8px; border-radius: var(--radius-full); background-color: ${lang.color};"></span>
              <span>${lang.name} (${lang.percentage}%)</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Highlighted Public Repositories Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
        ${githubShowcaseData.pinnedRepos.map(repo => `
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="spotlight-card" style="padding: 1.25rem; border-radius: var(--radius-md); text-decoration: none; display: flex; flex-direction: column; justify-content: space-between; background: var(--bg-surface-elevated);">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; color: var(--accent);">${repo.name}</span>
                <span class="btn-arrow" style="font-size: 0.8rem; color: var(--text-muted);">↗</span>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">${repo.description}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted);">
              <span style="width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--accent);"></span>
              <span>${repo.language}</span>
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
