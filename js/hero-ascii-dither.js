/**
 * Hero ASCII & Dither Creation Engine
 * Replaces 3D knot with an animated, living ASCII & Bayer-dithered artwork
 * inspired by "The Creation of Adam" (retro pixel cursor hand meeting classical Michelangelo hand).
 *
 * Fully reactive to dark/light themes, 60fps canvas loop, organic breathing reach,
 * dynamic electric spark arcs, and interactive mouse parallax.
 */

export class HeroAsciiDither {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.container = this.canvas.parentElement;

    // Theme state
    this.isLight = this.checkIsLightTheme();

    // Textures & Images
    this.imgDark = new Image();
    this.imgDark.src = 'assets/creation-dither-dark.png';

    this.imgLight = new Image();
    this.imgLight.src = 'assets/creation-dither-light.png';

    this.imgBase = new Image();
    this.imgBase.src = 'assets/creation-dither.jpg';

    this.imagesLoaded = false;
    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        this.imagesLoaded = true;
      }
    };
    this.imgDark.onload = onLoad;
    this.imgLight.onload = onLoad;
    this.imgBase.onload = onLoad;

    // Offscreen Canvas for pixel sampling & processing
    this.offscreen = document.createElement('canvas');
    this.offscreenCtx = this.offscreen.getContext('2d', { willReadFrequently: true });

    // Interactive & Physics State
    this.time = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.isHovering = false;
    this.reachProgress = 0; // 0 to 1 cycle

    // Particle / Spark Systems
    this.sparks = [];
    this.asciiEmbers = [];
    this.initAsciiEmbers();

    // Bayer 4x4 matrix for ordered dithering
    this.bayer4 = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    // ASCII density palette
    this.asciiChars = [' ', '·', ':', '+', 'x', '*', '#', '%', '■'];

    // Bindings
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
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

  initAsciiEmbers() {
    this.asciiEmbers = [];
    const count = 38;
    const chars = ['+', '·', 'x', '*', ':', '0', '1', '✧', '✦', '#'];
    for (let i = 0; i < count; i++) {
      this.asciiEmbers.push({
        x: Math.random(),
        y: Math.random(),
        char: chars[Math.floor(Math.random() * chars.length)],
        speed: 0.0004 + Math.random() * 0.0008,
        drift: (Math.random() - 0.5) * 0.0005,
        size: 9 + Math.floor(Math.random() * 6),
        alpha: 0.15 + Math.random() * 0.55,
        twinkleSpeed: 1 + Math.random() * 3
      });
    }
  }

  initEvents() {
    window.addEventListener('resize', this.handleResize, { passive: true });

    if (this.container) {
      this.container.addEventListener('mousemove', this.handleMouseMove);
      this.container.addEventListener('mouseenter', this.handleMouseEnter);
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

  handleMouseEnter() {
    this.isHovering = true;
  }

  handleMouseLeave() {
    this.isHovering = false;
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

    // Ensure balanced dimensions
    const displayWidth = Math.round(rect.width || 480);
    const displayHeight = Math.round(rect.height || 480);

    this.width = displayWidth;
    this.height = displayHeight;

    this.canvas.width = Math.round(displayWidth * dpr);
    this.canvas.height = Math.round(displayHeight * dpr);
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  emitSparks(originX, originY, count = 3) {
    const glyphs = ['+', '*', '✦', '·', 'x', '1', '0', '⚡'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.2;
      this.sparks.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.035,
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
        size: 10 + Math.random() * 6,
        color: Math.random() > 0.3 ? (this.isLight ? '#0284c7' : '#38bdf8') : '#ffffff'
      });
    }
  }

  updateSparks() {
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.06; // slight gravity
      s.life -= s.decay;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  drawLightningArc(x1, y1, x2, y2, color, coreColor) {
    const ctx = this.ctx;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = 7;
    const points = [{ x: x1, y: y1 }];

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const normalX = -(y2 - y1) / dist;
      const normalY = (x2 - x1) / dist;
      const jitter = (Math.random() - 0.5) * (dist * 0.32);
      points.push({
        x: x1 + (x2 - x1) * t + normalX * jitter,
        y: y1 + (y2 - y1) * t + normalY * jitter
      });
    }
    points.push({ x: x2, y: y2 });

    // Outer glow line
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Inner bright core
    ctx.lineWidth = 1;
    ctx.strokeStyle = coreColor;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  animate() {
    this.time += 0.024;

    // Smooth mouse inertia
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (!w || !h) {
      this.rafId = requestAnimationFrame(this.animate);
      return;
    }

    // Determine Theme Colors
    const isLight = this.isLight;
    const bgVoid = isLight ? '#f8fafc' : '#09090b';
    const accentCyan = isLight ? '#0284c7' : '#38bdf8';
    const accentBlue = isLight ? '#1d4ed8' : '#2563eb';
    const textColor = isLight ? '#0f172a' : '#f8fafc';
    const sparkColor = isLight ? '#0284c7' : '#38bdf8';
    const gridDotColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    const emberColor = isLight ? 'rgba(29, 78, 216, ' : 'rgba(56, 189, 248, ';

    // 1. Clear Canvas with Theme Tone
    ctx.fillStyle = bgVoid;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Subtle Dither / ASCII Background Grid
    ctx.save();
    const gridSize = 22;
    ctx.fillStyle = gridDotColor;
    for (let gx = gridSize / 2; gx < w; gx += gridSize) {
      for (let gy = gridSize / 2; gy < h; gy += gridSize) {
        ctx.fillRect(gx, gy, 1.5, 1.5);
      }
    }
    ctx.restore();

    // 3. Draw Ambient Floating ASCII Embers
    ctx.save();
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const ember of this.asciiEmbers) {
      ember.y -= ember.speed;
      ember.x += ember.drift;
      if (ember.y < 0) ember.y = 1;
      if (ember.x < 0) ember.x = 1;
      if (ember.x > 1) ember.x = 0;

      const px = ember.x * w;
      const py = ember.y * h;
      const alpha = ember.alpha * (0.6 + 0.4 * Math.sin(this.time * ember.twinkleSpeed));

      ctx.fillStyle = `${emberColor}${alpha.toFixed(3)})`;
      ctx.font = `${ember.size}px "JetBrains Mono", monospace`;
      ctx.fillText(ember.char, px, py);
    }
    ctx.restore();

    // 4. Calculate Organic Breathing Motion & Parallax
    // Left Hand & Right Hand Reach Oscillation
    const reachWave = (Math.sin(this.time * 1.5) + 1) * 0.5; // 0 to 1
    const handSeparation = (1 - reachWave) * 12; // closer when reachWave=1

    const parallaxX = this.mouseX * 16;
    const parallaxY = this.mouseY * 16;

    // Scaled destination box centered in the viewport
    const contentSize = Math.min(w, h) * 0.88;
    const centerX = w / 2 + parallaxX;
    const centerY = h / 2 + parallaxY;
    const destX = centerX - contentSize / 2;
    const destY = centerY - contentSize / 2;

    // 5. Render Core Artwork (Base Texture + Dual Hands in Reach Loop)
    const activeImage = isLight ? (this.imgLight.complete ? this.imgLight : this.imgBase)
                               : (this.imgDark.complete ? this.imgDark : this.imgBase);

    if (activeImage && activeImage.complete && activeImage.naturalWidth > 0) {
      ctx.save();

      // Ambient Dither Glow behind central cloud
      const cloudGlow = ctx.createRadialGradient(centerX, centerY, contentSize * 0.15, centerX, centerY, contentSize * 0.5);
      cloudGlow.addColorStop(0, isLight ? 'rgba(37, 99, 235, 0.16)' : 'rgba(56, 189, 248, 0.18)');
      cloudGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cloudGlow;
      ctx.fillRect(destX, destY, contentSize, contentSize);

      // Base Artwork with breathing scale
      const breathScale = 1 + Math.sin(this.time * 1.2) * 0.015;
      ctx.translate(centerX, centerY);
      ctx.scale(breathScale, breathScale);
      ctx.translate(-centerX, -centerY);

      // Render base texture (Cloud & Background Dither)
      ctx.imageSmoothingEnabled = false; // preserve pixelated dither texture!
      ctx.drawImage(activeImage, destX, destY, contentSize, contentSize);

      // Organic Hand Movement:
      // Left Hand (pixel pointer): slice from left half (normalized source x: 0.18 to 0.44, y: 0.38 to 0.65)
      // We apply subtle reach offset towards center
      const leftReachX = (reachWave * 8) - (handSeparation * 0.5);
      const leftReachY = Math.cos(this.time * 1.3) * 2;

      // Draw subtle dynamic reach overlay for pixel hand
      const srcW = activeImage.naturalWidth;
      const srcH = activeImage.naturalHeight;

      // Left hand crop coordinates in original 736x736:
      const lhSx = 145, lhSy = 310, lhSw = 175, lhSh = 150;
      const lhDx = destX + (lhSx / srcW) * contentSize + leftReachX;
      const lhDy = destY + (lhSy / srcH) * contentSize + leftReachY;
      const lhDw = (lhSw / srcW) * contentSize;
      const lhDh = (lhSh / srcH) * contentSize;

      // Draw floating left hand
      ctx.drawImage(activeImage, lhSx, lhSy, lhSw, lhSh, lhDx, lhDy, lhDw, lhDh);

      // Right hand (classical Michelangelo):
      const rightReachX = -(reachWave * 8) + (handSeparation * 0.5);
      const rightReachY = Math.sin(this.time * 1.4) * 2;

      const rhSx = 310, rhSy = 230, rhSw = 330, rhSh = 220;
      const rhDx = destX + (rhSx / srcW) * contentSize + rightReachX;
      const rhDy = destY + (rhSy / srcH) * contentSize + rightReachY;
      const rhDw = (rhSw / srcW) * contentSize;
      const rhDh = (rhSh / srcH) * contentSize;

      // Draw floating right hand
      ctx.drawImage(activeImage, rhSx, rhSy, rhSw, rhSh, rhDx, rhDy, rhDw, rhDh);

      ctx.restore();

      // 6. The Creation Fingertip Quantum Spark & Electric Arc
      // Calculate exact screen coordinates of the two extended fingertips:
      // Left index tip is at approx (x: 302, y: 348) in 736x736 space
      const tip1X = destX + (302 / srcW) * contentSize + leftReachX;
      const tip1Y = destY + (348 / srcH) * contentSize + leftReachY;

      // Right index tip is at approx (x: 320, y: 334) in 736x736 space
      const tip2X = destX + (320 / srcW) * contentSize + rightReachX;
      const tip2Y = destY + (334 / srcH) * contentSize + rightReachY;

      const fingerDist = Math.hypot(tip2X - tip1X, tip2Y - tip1Y);
      const midX = (tip1X + tip2X) / 2;
      const midY = (tip1Y + tip2Y) / 2;

      // Spark Arc triggers dynamically
      if (fingerDist < 35 || Math.random() < 0.85) {
        this.drawLightningArc(tip1X, tip1Y, tip2X, tip2Y, accentCyan, '#ffffff');

        // Fingertip glowing quantum halo
        const sparkPulse = 0.5 + 0.5 * Math.sin(this.time * 12);
        const sparkGrad = ctx.createRadialGradient(midX, midY, 1, midX, midY, 18 + sparkPulse * 10);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.35, accentCyan);
        sparkGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(midX, midY, 24, 0, Math.PI * 2);
        ctx.fill();

        // Flashing ASCII Sparks at the contact point
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const glyphs = ['✦', '⚡', '*', '·', 'x'];
        const activeGlyph = glyphs[(Math.floor(this.time * 8)) % glyphs.length];
        ctx.fillText(activeGlyph, midX, midY);

        ctx.restore();

        // Emit particles
        if (Math.random() < 0.45) {
          this.emitSparks(midX, midY, 2);
        }
      }
    }

    // 7. Update & Render Spark Particles
    this.updateSparks();
    ctx.save();
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const sp of this.sparks) {
      ctx.globalAlpha = Math.max(0, sp.life);
      ctx.fillStyle = sp.color;
      ctx.font = `${sp.size}px "JetBrains Mono", monospace`;
      ctx.fillText(sp.char, sp.x, sp.y);
    }
    ctx.restore();

    // 8. Terminal Micro-HUD / Status Watermark in Bottom Corner
    ctx.save();
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(248, 250, 252, 0.45)';
    ctx.textAlign = 'left';
    ctx.fillText('SYS // 1-BIT_BAYER_DITHER', 14, h - 14);

    ctx.textAlign = 'right';
    const statusText = `FPS: 60 • PARALLAX: ${(this.mouseX).toFixed(2)}`;
    ctx.fillText(statusText, w - 14, h - 14);
    ctx.restore();

    // Loop
    this.rafId = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.handleMouseMove);
      this.container.removeEventListener('mouseenter', this.handleMouseEnter);
      this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }
}
