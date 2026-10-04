/**
 * Hero ASCII & Dither Creation Engine
 * Renders the iconic "Creation of Code" artwork (retro pixel cursor hand touching Michelangelo's classical hand).
 *
 * Requirements:
 * - 100% transparent background (zero white/gray boxes or enclosing rectangles).
 * - The cursor hand and real hand physically reach and TOUCH index fingertips.
 * - When they touch: an ultra-bright, blooming spark with multi-tiered glow, anamorphic starburst spikes,
 *   expanding shockwaves, electric lightning arcs, and explosive ASCII particles.
 * - Flawless real-time adaptation for both Dark and Light themes.
 */

export class HeroAsciiDither {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.container = this.canvas.parentElement;

    // Theme state
    this.isLight = this.checkIsLightTheme();

    // Asset Loading
    this.assets = {
      cloudDark: new Image(),
      cloudLight: new Image(),
      cursorDark: new Image(),
      cursorLight: new Image(),
      realDark: new Image(),
      realLight: new Image()
    };

    this.assets.cloudDark.src = 'assets/cloud-clean-dark.png';
    this.assets.cloudLight.src = 'assets/cloud-clean-light.png';
    this.assets.cursorDark.src = 'assets/hand-cursor-dark.png';
    this.assets.cursorLight.src = 'assets/hand-cursor-light.png';
    this.assets.realDark.src = 'assets/hand-real-dark.png';
    this.assets.realLight.src = 'assets/hand-real-light.png';

    // Fallbacks if clean assets take a moment
    this.fallbackDark = new Image();
    this.fallbackDark.src = 'assets/creation-cutout-dark.png';
    this.fallbackLight = new Image();
    this.fallbackLight.src = 'assets/creation-cutout-light.png';

    // Physics & Time
    this.time = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    // Contact & Touch Shockwave State
    this.wasTouching = false;
    this.shockwaves = [];
    this.sparks = [];
    this.ambientEmbers = [];
    this.initAmbientEmbers();

    // Bindings
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.animate = this.animate.bind(this);

    // Setup
    this.initEvents();
    this.handleResize();
    this.setupThemeObserver();

    // Start loop
    this.rafId = requestAnimationFrame(this.animate);
  }

  checkIsLightTheme() {
    return document.body.classList.contains('light-theme') ||
           document.documentElement.getAttribute('data-theme') === 'light';
  }

  setupThemeObserver() {
    const observer = new MutationObserver(() => {
      this.isLight = this.checkIsLightTheme();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  }

  initAmbientEmbers() {
    this.ambientEmbers = [];
    const glyphs = ['+', '·', 'x', '*', ':', '0', '1', '✧', '✦'];
    for (let i = 0; i < 30; i++) {
      this.ambientEmbers.push({
        x: Math.random(),
        y: Math.random(),
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
        speed: 0.0003 + Math.random() * 0.0007,
        drift: (Math.random() - 0.5) * 0.0004,
        size: 9 + Math.floor(Math.random() * 6),
        alpha: 0.12 + Math.random() * 0.45,
        twinkle: 1 + Math.random() * 3
      });
    }
  }

  initEvents() {
    window.addEventListener('resize', this.handleResize, { passive: true });

    if (this.container) {
      this.container.addEventListener('mousemove', this.handleMouseMove);
      this.container.addEventListener('mouseleave', this.handleMouseLeave);
      this.container.addEventListener('touchmove', (e) => {
        if (e.touches[0]) {
          const rect = this.canvas.getBoundingClientRect();
          this.targetMouseX = (e.touches[0].clientX - rect.left - rect.width / 2) / (rect.width / 2);
          this.targetMouseY = (e.touches[0].clientY - rect.top - rect.height / 2) / (rect.height / 2);
        }
      }, { passive: true });
    }
  }

  handleMouseLeave() {
    this.targetMouseX = 0;
    this.targetMouseY = 0;
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    this.targetMouseX = Math.max(-1, Math.min(1, x));
    this.targetMouseY = Math.max(-1, Math.min(1, y));
  }

  handleResize() {
    if (!this.container || !this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.container.getBoundingClientRect();

    const displayWidth = Math.round(rect.width || 500);
    const displayHeight = Math.round(rect.height || 500);

    this.width = displayWidth;
    this.height = displayHeight;

    this.canvas.width = Math.round(displayWidth * dpr);
    this.canvas.height = Math.round(displayHeight * dpr);
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  emitBurst(originX, originY, count = 12) {
    const glyphs = ['✦', '★', '⚡', '*', '+', '1', '0', '·'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.2 + Math.random() * 5.0;
      this.sparks.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.035,
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
        size: 11 + Math.random() * 7,
        color: Math.random() > 0.25 ? (this.isLight ? '#0284c7' : '#38bdf8') : '#ffffff'
      });
    }
  }

  triggerTouchShockwave(x, y) {
    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius: 65,
      alpha: 0.95
    });
  }

  drawLightningArc(x1, y1, x2, y2, color, coreColor, intensity = 1) {
    const ctx = this.ctx;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = 6;
    const points = [{ x: x1, y: y1 }];

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const normalX = -(y2 - y1) / (dist || 1);
      const normalY = (x2 - x1) / (dist || 1);
      const jitter = (Math.random() - 0.5) * (Math.max(6, dist * 0.35));
      points.push({
        x: x1 + (x2 - x1) * t + normalX * jitter,
        y: y1 + (y2 - y1) * t + normalY * jitter
      });
    }
    points.push({ x: x2, y: y2 });

    ctx.save();
    // Radiant halo
    ctx.lineWidth = 3.5 * intensity;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 * intensity;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Hot white core
    ctx.lineWidth = 1.2 * intensity;
    ctx.strokeStyle = coreColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawLensStar(x, y, radius, color, beamCount = 4) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;

    // Horizontal & Vertical major light beams
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x, y + radius);
    ctx.stroke();

    // Diagonal minor spikes
    if (beamCount === 8) {
      const diag = radius * 0.55;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - diag, y - diag);
      ctx.lineTo(x + diag, y + diag);
      ctx.moveTo(x - diag, y + diag);
      ctx.lineTo(x + diag, y - diag);
      ctx.stroke();
    }

    // White core diamond
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.time += 0.024;

    // Mouse inertia
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (!w || !h) {
      this.rafId = requestAnimationFrame(this.animate);
      return;
    }

    const isLight = this.isLight;
    const accentCyan = isLight ? '#0284c7' : '#38bdf8';
    const accentBlue = isLight ? '#1d4ed8' : '#2563eb';
    const emberColor = isLight ? 'rgba(29, 78, 216, ' : 'rgba(56, 189, 248, ';

    // 1. COMPLETELY TRANSPARENT: Zero background rectangle!
    ctx.clearRect(0, 0, w, h);

    // 2. Ambient Floating ASCII Matrix Embers
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const ember of this.ambientEmbers) {
      ember.y -= ember.speed;
      ember.x += ember.drift;
      if (ember.y < 0) ember.y = 1;
      if (ember.x < 0) ember.x = 1;
      if (ember.x > 1) ember.x = 0;

      const px = ember.x * w;
      const py = ember.y * h;
      const alpha = ember.alpha * (0.6 + 0.4 * Math.sin(this.time * ember.twinkle));

      ctx.fillStyle = `${emberColor}${alpha.toFixed(3)})`;
      ctx.font = `${ember.size}px "JetBrains Mono", monospace`;
      ctx.fillText(ember.char, px, py);
    }
    ctx.restore();

    // 3. Reach & Touch Cycle Calculation
    // Non-linear organic approach: hands gently approach, TOUCH firmly, dwell at contact, and ease back
    const reachRaw = (Math.sin(this.time * 1.5) + 1) / 2; // 0 to 1
    const reachProgress = Math.pow(reachRaw, 1.4); // smooth progression with weight at the peak
    const isTouching = reachProgress > 0.88; // Physical contact threshold
    const touchStrength = Math.max(0, (reachProgress - 0.80) / 0.20); // 0 to 1 surge at touch

    // Shockwave trigger on first frame of touch
    if (isTouching && !this.wasTouching) {
      // Fingertip meeting point
      const midTouchX = w / 2 + this.mouseX * 12 + 6;
      const midTouchY = h / 2 + this.mouseY * 12;
      this.triggerTouchShockwave(midTouchX, midTouchY);
      this.emitBurst(midTouchX, midTouchY, 18);
    }
    this.wasTouching = isTouching;

    // 4. Artwork Coordinates & Scaling
    const contentSize = Math.min(w, h) * 0.92;
    const parallaxX = this.mouseX * 18;
    const parallaxY = this.mouseY * 18;
    const centerX = w / 2 + parallaxX;
    const centerY = h / 2 + parallaxY;
    const destX = centerX - contentSize / 2;
    const destY = centerY - contentSize / 2;

    const baseCloud = isLight ? (this.assets.cloudLight.complete ? this.assets.cloudLight : this.fallbackLight)
                              : (this.assets.cloudDark.complete ? this.assets.cloudDark : this.fallbackDark);

    const cursorHand = isLight ? (this.assets.cursorLight.complete ? this.assets.cursorLight : null)
                               : (this.assets.cursorDark.complete ? this.assets.cursorDark : null);

    const realHand = isLight ? (this.assets.realLight.complete ? this.assets.realLight : null)
                             : (this.assets.realDark.complete ? this.assets.realDark : null);

    ctx.save();
    // Ambient breathing scale
    const breath = 1 + Math.sin(this.time * 1.1) * 0.012;
    ctx.translate(centerX, centerY);
    ctx.scale(breath, breath);
    ctx.translate(-centerX, -centerY);

    // 5. Draw Digital Nebula / Blue Cloud (Seamless, Transparent Background)
    if (baseCloud && baseCloud.complete && baseCloud.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false; // preserve crisp dither style
      ctx.drawImage(baseCloud, destX, destY, contentSize, contentSize);
    }

    // 6. Draw Hands with Physical Reach & Contact Offset
    // Coordinate mapping based on 736x736 original image:
    // Pixel cursor hand: crop (150, 310, 165, 150) -> index fingertip is at source (302, 348)
    // Classical real hand: crop (310, 220, 335, 220) -> index fingertip is at source (320, 334)
    // Distance in base texture is 18px horizontal gap.
    // To TOUCH:
    // Left hand moves right by reachProgress * 15px
    // Right hand moves left by reachProgress * 14px
    // Total closure = 29px -> fingertips touch and slightly interlock with electric connection!
    const leftShiftX = reachProgress * 16;
    const leftShiftY = Math.cos(this.time * 1.2) * 2;

    const rightShiftX = -reachProgress * 15;
    const rightShiftY = Math.sin(this.time * 1.3) * 2;

    const srcW = 736;
    const srcH = 736;

    // Draw Left Pixel Cursor Hand
    const lhDx = destX + (150 / srcW) * contentSize + leftShiftX;
    const lhDy = destY + (310 / srcH) * contentSize + leftShiftY;
    const lhDw = (165 / srcW) * contentSize;
    const lhDh = (150 / srcH) * contentSize;

    if (cursorHand && cursorHand.complete) {
      ctx.drawImage(cursorHand, lhDx, lhDy, lhDw, lhDh);
    }

    // Draw Right Classical Hand
    const rhDx = destX + (310 / srcW) * contentSize + rightShiftX;
    const rhDy = destY + (220 / srcH) * contentSize + rightShiftY;
    const rhDw = (335 / srcW) * contentSize;
    const rhDh = (220 / srcH) * contentSize;

    if (realHand && realHand.complete) {
      ctx.drawImage(realHand, rhDx, rhDy, rhDw, rhDh);
    }

    // 7. Calculate Touching Fingertip Positions
    const tip1X = destX + (302 / srcW) * contentSize + leftShiftX;
    const tip1Y = destY + (348 / srcH) * contentSize + leftShiftY;

    const tip2X = destX + (320 / srcW) * contentSize + rightShiftX;
    const tip2Y = destY + (334 / srcH) * contentSize + rightShiftY;

    const midX = (tip1X + tip2X) / 2;
    const midY = (tip1Y + tip2Y) / 2;
    const gap = Math.hypot(tip2X - tip1X, tip2Y - tip1Y);

    ctx.restore(); // restore transform

    // 8. ULTRA-BRIGHT SPARK & RADIANT GLOW (Especially intense upon touch)
    ctx.save();

    if (isTouching) {
      // 🌟 TOUCHING STATE: Blinding, blooming radiance!
      const surge = touchStrength; // 0 to 1
      const pulseFlicker = 0.85 + Math.random() * 0.3;

      // Layer A: Huge Soft Ambient Bloom (up to 90px radius)
      const bloomRadius = (45 + surge * 45) * pulseFlicker;
      const bloomGrad = ctx.createRadialGradient(midX, midY, 2, midX, midY, bloomRadius);
      bloomGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      bloomGrad.addColorStop(0.25, isLight ? 'rgba(2, 132, 199, 0.85)' : 'rgba(56, 189, 248, 0.85)');
      bloomGrad.addColorStop(0.55, isLight ? 'rgba(29, 78, 216, 0.45)' : 'rgba(37, 99, 235, 0.45)');
      bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = bloomGrad;
      ctx.beginPath();
      ctx.arc(midX, midY, bloomRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer B: Intense Inner Core Disc
      const coreRadius = 14 + surge * 12;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = accentCyan;
      ctx.shadowBlur = 24 * surge;
      ctx.beginPath();
      ctx.arc(midX, midY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer C: Anamorphic Lens Flare Starburst Spikes (Blinding rays!)
      const beamLength = (50 + surge * 48) * pulseFlicker;
      this.drawLensStar(midX, midY, beamLength, accentCyan, 8);

      // Layer D: Multiple High-Voltage Lightning Micro-Arcs
      for (let arc = 0; arc < 3; arc++) {
        const jitterY = (Math.random() - 0.5) * 6;
        this.drawLightningArc(tip1X, tip1Y + jitterY, tip2X, tip2Y + jitterY, accentCyan, '#ffffff', 1.6);
      }

      // Layer E: Flashing ASCII Glyphs at the contact nexus
      const contactChars = ['★', '✦', '⚡', '*', '■', '1', '0'];
      const activeChar = contactChars[Math.floor(this.time * 12) % contactChars.length];
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = accentCyan;
      ctx.shadowBlur = 12;
      ctx.fillText(activeChar, midX, midY);

      // Continuous particle shower during touch
      if (Math.random() < 0.7) {
        this.emitBurst(midX, midY, 3);
      }
    } else {
      // ⚡ PRE-TOUCH / APPROACH STATE: Crackling anticipation arcs
      const reachApproach = reachProgress; // 0 to 0.88
      if (gap < 40 || Math.random() < 0.65) {
        this.drawLightningArc(tip1X, tip1Y, tip2X, tip2Y, accentCyan, '#ffffff', 0.9 + reachApproach * 0.4);

        // Pre-touch subtle glow
        const glowRadius = 12 + reachApproach * 14;
        const preGrad = ctx.createRadialGradient(midX, midY, 1, midX, midY, glowRadius);
        preGrad.addColorStop(0, '#ffffff');
        preGrad.addColorStop(0.5, accentCyan);
        preGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = preGrad;
        ctx.beginPath();
        ctx.arc(midX, midY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦', midX, midY);
      }
    }

    ctx.restore();

    // 9. Shockwave Rings Update & Render
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 2.8;
      sw.alpha -= 0.038;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = isLight ? `rgba(2, 132, 199, ${sw.alpha.toFixed(2)})` : `rgba(56, 189, 248, ${sw.alpha.toFixed(2)})`;
      ctx.shadowColor = accentCyan;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 10. Update & Render Flying Spark Particles
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.08;
      s.life -= s.decay;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      ctx.font = `bold ${s.size}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.char, s.x, s.y);
      ctx.restore();
    }

    // Loop
    this.rafId = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.handleMouseMove);
      this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }
}
