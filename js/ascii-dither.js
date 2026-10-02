/**
 * Procedural ASCII & Dither Canvas Engine
 * Generates project-specific retro-futuristic ASCII schematics and Bayer dither patterns.
 * - Hardware-accelerated 2D canvas
 * - Responsive DPI scaling
 * - Mouse ripple / distortion physics
 * - IntersectionObserver to sleep offscreen
 */

export class AsciiDitherEngine {
  constructor() {
    this.instances = new Map();
    this.observer = null;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.initObserver();
  }

  initObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('data-project-id');
        const instance = this.instances.get(id);
        if (instance) {
          instance.isVisible = entry.isIntersecting;
          if (instance.isVisible && !instance.isRunning) {
            instance.start();
          }
        }
      });
    }, { threshold: 0.1 });
  }

  mountAll() {
    // Destroy previous instances
    this.destroy();

    const canvases = document.querySelectorAll('.bento-ascii-canvas');
    canvases.forEach(canvas => {
      const projectId = canvas.getAttribute('data-project-id');
      const card = canvas.closest('.bento-card');
      if (!projectId || !card) return;

      const instance = new ProjectAsciiCanvas(canvas, card, projectId, this.isReducedMotion);
      this.instances.set(projectId, instance);
      this.observer.observe(canvas);
    });
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances.clear();
  }
}

/**
 * Single Canvas ASCII & Dither Simulation
 */
class ProjectAsciiCanvas {
  constructor(canvas, card, projectId, isReducedMotion) {
    this.canvas = canvas;
    this.card = card;
    this.projectId = projectId;
    this.isReducedMotion = isReducedMotion;
    this.ctx = canvas.getContext('2d');
    this.isVisible = true;
    this.isRunning = false;
    this.animationFrameId = null;

    // Time & Interactive State
    this.time = Math.random() * 100;
    this.mouseX = -999;
    this.mouseY = -999;
    this.isHovered = false;
    this.targetSpeed = 1;
    this.currentSpeed = 1;

    // Character sets for density mapping
    this.asciiRamp = [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"];
    this.blockRamp = [" ", "░", "▒", "▓", "█"];
    
    // Bayer 4x4 matrix for ordered dithering simulation
    this.bayer4 = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    this.initListeners();
    this.resize();
    this.start();
  }

  initListeners() {
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });

    this.onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.isHovered = true;
      this.targetSpeed = 2.2;
    };

    this.onMouseLeave = () => {
      this.isHovered = false;
      this.targetSpeed = 1;
      this.mouseX = -999;
      this.mouseY = -999;
    };

    this.card.addEventListener('mousemove', this.onMouseMove, { passive: true });
    this.card.addEventListener('mouseleave', this.onMouseLeave, { passive: true });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || this.canvas.parentElement?.clientWidth || this.card.clientWidth || 360;
    const h = rect.height || this.canvas.parentElement?.clientHeight || 200;
    if (w === 0 || h === 0) return;
    
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    // ASCII grid resolution: larger cell size for clean, minimalist technical aesthetics
    this.charSize = 14;
    this.cols = Math.ceil(this.width / this.charSize);
    this.rows = Math.ceil(this.height / this.charSize);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isVisible) {
        this.isRunning = false;
        return;
      }
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.card.removeEventListener('mousemove', this.onMouseMove);
    this.card.removeEventListener('mouseleave', this.onMouseLeave);
  }

  render() {
    if (!this.width || !this.height) {
      this.resize();
      if (!this.width || !this.height) return;
    }

    if (this.isReducedMotion) {
      this.drawProjectSchematic(0);
      return;
    }

    // Slow, calming speed easing (gentle ambient pulse)
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.05;
    this.time += 0.006 * this.currentSpeed;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawProjectSchematic(this.time);
  }

  /**
   * Render custom simulation depending on project domain
   * Calibrated for minimal visual distraction and subtle ambient glow
   */
  drawProjectSchematic(t) {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const primaryColor = isDark ? "rgba(56, 189, 248, 0.36)" : "rgba(2, 132, 199, 0.40)";
    const secondaryColor = isDark ? "rgba(161, 161, 170, 0.16)" : "rgba(75, 77, 88, 0.20)";
    const dimColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)";
    const accentHighlight = isDark ? "rgba(56, 189, 248, 0.60)" : "rgba(2, 132, 199, 0.60)";

    this.ctx.font = `500 ${this.charSize - 3}px 'JetBrains Mono', monospace`;
    this.ctx.textBaseline = 'top';

    const cols = this.cols;
    const rows = this.rows;
    const charW = this.charSize;
    const charH = this.charSize;

    // Dispatch domain-specific simulation logic
    switch (this.projectId) {
      case 'nazazi':
        this.renderNazaziSmsQueue(t, cols, rows, charW, charH, primaryColor, secondaryColor, dimColor, accentHighlight);
        break;

      case 'enzira-lms':
        this.renderEnziraBegenaAcoustics(t, cols, rows, charW, charH, primaryColor, secondaryColor, dimColor, accentHighlight);
        break;

      case 'nutrigenius':
        this.renderNutriGeniusNeuralManifold(t, cols, rows, charW, charH, primaryColor, secondaryColor, dimColor, accentHighlight);
        break;

      case 'gerima':
        this.renderGerimaHexArchitecture(t, cols, rows, charW, charH, primaryColor, secondaryColor, dimColor, accentHighlight);
        break;

      case 'enzira-fast-track':
      default:
        this.renderFastTrackOscilloscope(t, cols, rows, charW, charH, primaryColor, secondaryColor, dimColor, accentHighlight);
        break;
    }

    // Draw dithered technical border corner crosshairs
    this.drawCornerCrosshairs(accentHighlight, dimColor);
  }

  /* --------------------------------------------------------------------------
     1. Nazazi: Clean Horizontal Conduit Channels with Soft Data Packets
     -------------------------------------------------------------------------- */
  renderNazaziSmsQueue(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const laneY1 = Math.floor(rows * 0.35);
    const laneY2 = Math.floor(rows * 0.55);
    const laneY3 = Math.floor(rows * 0.75);
    const lanes = [laneY1, laneY2, laneY3];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        let char = " ";
        let color = dim;

        const isLane = lanes.includes(r);
        if (isLane) {
          const speedFactor = r === laneY1 ? 1.0 : r === laneY2 ? 0.7 : 0.85;
          const packetPhase = (c * 0.15 - t * speedFactor);
          const packetPulse = Math.sin(packetPhase);

          if (packetPulse > 0.88) {
            char = "━";
            color = accent;
          } else if (packetPulse > 0.55) {
            char = "─";
            color = primary;
          } else if (c % 3 === 0) {
            char = "·";
            color = secondary;
          } else {
            char = " ";
          }
        } else if (r % 4 === 0 && c % 6 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("SMS_DISPATCH // BULK_QUEUE", 14, 12, accent);
  }

  /* --------------------------------------------------------------------------
     2. Enzira LMS Begena: Acoustic String Harmonic Resonance & Spectral Waveform
     -------------------------------------------------------------------------- */
  renderEnziraBegenaAcoustics(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const midY = rows * 0.55;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        const wave1 = Math.sin(c * 0.12 + t * 1.2) * (rows * 0.22);
        const wave2 = Math.cos(c * 0.18 - t * 0.9) * (rows * 0.15);

        const onWave1 = Math.abs((r - midY) - wave1) < 0.75;
        const onWave2 = Math.abs((r - midY) - wave2) < 0.75;

        let char = " ";
        let color = dim;

        if (onWave1 && onWave2) {
          char = "+";
          color = accent;
        } else if (onWave1) {
          char = "─";
          color = primary;
        } else if (onWave2) {
          char = "~";
          color = secondary;
        } else if (r % 4 === 0 && c % 5 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("BEGENA_ACOUSTIC // 432HZ", 14, 12, accent);
  }

  /* --------------------------------------------------------------------------
     3. NutriGenius: 3D Neural Vector Manifold & Token Dither Cluster
     -------------------------------------------------------------------------- */
  renderNutriGeniusNeuralManifold(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const centerX = cols / 2;
    const centerY = rows / 2 + 1;
    const radius = Math.min(cols, rows) * 0.38;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        const nx = (c - centerX) / radius;
        const ny = (r - centerY) / radius;
        const dist = Math.sqrt(nx * nx + ny * ny);

        const onRing = Math.abs(dist - 0.9) < 0.12;
        const onInnerRing = Math.abs(dist - 0.5) < 0.1;

        let char = " ";
        let color = dim;

        if (onRing) {
          const angle = Math.atan2(ny, nx);
          const pulse = Math.sin(angle * 3 + t * 1.5);
          if (pulse > 0.8) {
            char = "●";
            color = accent;
          } else {
            char = "·";
            color = primary;
          }
        } else if (onInnerRing) {
          char = "·";
          color = secondary;
        } else if (c % 5 === 0 && r % 4 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("NEURAL_EMBED // DIM=1536", 14, 12, accent);
  }

  /* --------------------------------------------------------------------------
     4. Gerima: Clean Modular Hexagonal Domain Matrix
     -------------------------------------------------------------------------- */
  renderGerimaHexArchitecture(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const midR = Math.floor(rows / 2);
    const node1C = Math.floor(cols * 0.25);
    const node2C = Math.floor(cols * 0.50);
    const node3C = Math.floor(cols * 0.75);
    const nodeCols = [node1C, node2C, node3C];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        let char = " ";
        let color = dim;

        const isBusLine = (r === midR);
        const isNode = nodeCols.some(nc => Math.abs(c - nc) <= 2 && Math.abs(r - midR) <= 2);

        if (isNode) {
          const isCenter = nodeCols.some(nc => c === nc && r === midR);
          if (isCenter) {
            char = "◆";
            color = accent;
          } else {
            char = "□";
            color = primary;
          }
        } else if (isBusLine) {
          const pulse = Math.sin(c * 0.25 - t * 2);
          if (pulse > 0.8) {
            char = "─";
            color = accent;
          } else {
            char = "·";
            color = secondary;
          }
        } else if (c % 6 === 0 && r % 4 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("HEX_DOMAIN // BUS_DISPATCH", 14, 12, accent);
  }

  /* --------------------------------------------------------------------------
     5. Enzira Fast-Track: Minimalist Audio Frequency Line & Sweep
     -------------------------------------------------------------------------- */
  renderFastTrackOscilloscope(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const midY = rows * 0.55;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        const wave = Math.sin(c * 0.2 + t * 1.5) * Math.cos(c * 0.08) * (rows * 0.25);
        const onWave = Math.abs((r - midY) - wave) < 0.8;

        let char = " ";
        let color = dim;

        if (onWave) {
          const packetGlance = Math.sin(c * 0.15 - t * 2.5);
          if (packetGlance > 0.85) {
            char = "■";
            color = accent;
          } else {
            char = "─";
            color = primary;
          }
        } else if (r === Math.floor(rows * 0.85) && c % 3 === 0) {
          char = "·";
          color = secondary;
        } else if (r % 5 === 0 && c % 6 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("FAST_TRACK // AUDIO_STREAM", 14, 12, accent);
  }

  /* --------------------------------------------------------------------------
     Visual Utilities: Telemetry Header Tag & Corner Crosshairs
     -------------------------------------------------------------------------- */
  drawTelemetryTag(text, x, y, accentColor) {
    this.ctx.save();
    this.ctx.font = `600 9px 'JetBrains Mono', monospace`;
    
    // Background chip
    const metrics = this.ctx.measureText(text);
    const bgW = metrics.width + 12;
    const bgH = 16;
    
    this.ctx.fillStyle = "rgba(10, 10, 14, 0.75)";
    this.ctx.fillRect(x - 2, y - 2, bgW, bgH);
    
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.strokeRect(x - 2, y - 2, bgW, bgH);

    // Accent indicator dot
    this.ctx.fillStyle = accentColor;
    this.ctx.beginPath();
    this.ctx.arc(x + 3, y + bgH / 2 - 2, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Text
    this.ctx.fillStyle = accentColor;
    this.ctx.fillText(text, x + 10, y + 2);
    this.ctx.restore();
  }

  drawCornerCrosshairs(accentColor, dimColor) {
    const pad = 8;
    const size = 5;
    this.ctx.strokeStyle = dimColor;
    this.ctx.lineWidth = 1;

    // Top-Left
    this.ctx.beginPath();
    this.ctx.moveTo(pad, pad + size);
    this.ctx.lineTo(pad, pad);
    this.ctx.lineTo(pad + size, pad);
    this.ctx.stroke();

    // Top-Right
    this.ctx.beginPath();
    this.ctx.moveTo(this.width - pad - size, pad);
    this.ctx.lineTo(this.width - pad, pad);
    this.ctx.lineTo(this.width - pad, pad + size);
    this.ctx.stroke();
  }
}
