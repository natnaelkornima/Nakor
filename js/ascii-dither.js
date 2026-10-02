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

    // ASCII grid resolution: fixed character cell size for sharp typography
    this.charSize = 11;
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

    // Smooth speed easing
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.08;
    this.time += 0.02 * this.currentSpeed;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawProjectSchematic(this.time);
  }

  /**
   * Render custom simulation depending on project domain
   */
  drawProjectSchematic(t) {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const primaryColor = isDark ? "rgba(56, 189, 248, 0.9)" : "rgba(2, 132, 199, 0.95)";
    const secondaryColor = isDark ? "rgba(161, 161, 170, 0.45)" : "rgba(75, 77, 88, 0.5)";
    const dimColor = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
    const accentHighlight = isDark ? "#38bdf8" : "#0284c7";

    this.ctx.font = `600 ${this.charSize - 2}px 'JetBrains Mono', monospace`;
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
     1. Nazazi: High-Throughput SMS Packet Stream & Queue Pipeline
     -------------------------------------------------------------------------- */
  renderNazaziSmsQueue(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        // Wave packet flow equation
        const wave = Math.sin(c * 0.18 - t * 2) * Math.cos(r * 0.3 + t);
        const queuePackets = (Math.sin((c + r) * 0.35 + t * 3) + 1) * 0.5;

        // Distance from mouse ripple
        const dx = (x - this.mouseX);
        const dy = (y - this.mouseY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseRipple = dist < 75 ? (1 - dist / 75) * 1.5 : 0;

        const val = (wave * 0.4 + queuePackets * 0.6) + mouseRipple;
        const bayerThreshold = this.bayer4[r % 4][c % 4] / 16;

        let char = " ";
        let color = dim;

        if (val > bayerThreshold + 0.45) {
          char = "█";
          color = mouseRipple > 0.5 ? accent : primary;
        } else if (val > bayerThreshold + 0.25) {
          char = "▓";
          color = primary;
        } else if (val > bayerThreshold + 0.1) {
          char = "▒";
          color = secondary;
        } else if (val > bayerThreshold) {
          char = "░";
          color = dim;
        } else if (r % 3 === 0 && c % 4 === 0) {
          char = "·";
          color = dim;
        }

        // Draw character
        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    // Overlay Header Telemetry Tag
    this.drawTelemetryTag("SMS_DISPATCH // BULK_QUEUE", 12, 10, accent);
  }

  /* --------------------------------------------------------------------------
     2. Enzira LMS Begena: Acoustic String Harmonic Resonance & Spectral Waveform
     -------------------------------------------------------------------------- */
  renderEnziraBegenaAcoustics(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const midY = rows / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        // 6 acoustic Begena string waveforms
        let sumAmplitude = 0;
        for (let s = 1; s <= 6; s++) {
          const freq = s * 0.22;
          const amp = Math.sin(c * freq + t * 2.5 * s) * (3.5 / s);
          if (Math.abs((r - midY) - amp) < 1.2) {
            sumAmplitude += 0.8;
          }
        }

        // FFT Spectrum bars at bottom
        const fftVal = Math.abs(Math.sin(c * 0.3 + t * 4)) * (rows * 0.6);
        const inFftBar = (rows - r) < fftVal;

        // Mouse disturbance
        const dx = (x - this.mouseX);
        const dy = (y - this.mouseY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseRipple = dist < 70 ? (1 - dist / 70) * 1.8 : 0;

        let char = " ";
        let color = dim;

        if (sumAmplitude > 0.6 || mouseRipple > 0.8) {
          char = mouseRipple > 0.8 ? "█" : "~";
          color = accent;
        } else if (inFftBar) {
          const bayer = this.bayer4[r % 4][c % 4] / 16;
          if (bayer > 0.5) {
            char = "▒";
            color = primary;
          } else {
            char = "░";
            color = secondary;
          }
        } else if ((r + c) % 6 === 0) {
          char = "+";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("BEGENA_ACOUSTIC // FFT_432HZ", 12, 10, accent);
  }

  /* --------------------------------------------------------------------------
     3. NutriGenius: 3D Neural Vector Manifold & Token Dither Cluster
     -------------------------------------------------------------------------- */
  renderNutriGeniusNeuralManifold(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const centerX = cols / 2;
    const centerY = rows / 2;
    const radius = Math.min(cols, rows) * 0.42;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        // 3D Sphere projection
        const nx = (c - centerX) / radius;
        const ny = (r - centerY) / radius;
        const distSq = nx * nx + ny * ny;

        let char = " ";
        let color = dim;

        if (distSq <= 1.05) {
          const nz = Math.sqrt(Math.max(0, 1 - distSq));
          
          // Rotating token manifold coordinate
          const rotX = nx * Math.cos(t) - nz * Math.sin(t);
          const rotZ = nx * Math.sin(t) + nz * Math.cos(t);

          // Dot product lighting + Bayer dither
          const light = Math.max(0, rotZ * 0.7 + rotX * 0.4 + ny * 0.2);
          const bayer = this.bayer4[r % 4][c % 4] / 16;
          const finalVal = light + (bayer * 0.35);

          // Mouse warp
          const dx = (x - this.mouseX);
          const dy = (y - this.mouseY);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseHit = dist < 65 ? (1 - dist / 65) : 0;

          if (finalVal > 0.85 || mouseHit > 0.5) {
            char = "@";
            color = accent;
          } else if (finalVal > 0.65) {
            char = "#";
            color = primary;
          } else if (finalVal > 0.45) {
            char = "=";
            color = secondary;
          } else if (finalVal > 0.25) {
            char = "-";
            color = dim;
          } else {
            char = "·";
            color = dim;
          }
        } else if (c % 5 === 0 && r % 3 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("NEURAL_EMBED // DIM=1536", 12, 10, accent);
  }

  /* --------------------------------------------------------------------------
     4. Gerima: Modular Hexagonal Architecture Lattice & Bus Routing
     -------------------------------------------------------------------------- */
  renderGerimaHexArchitecture(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        // Isometric hexagonal grid math
        const hexGrid = (c * 2 + (r % 2) * 3) % 8;
        const busPulse = Math.sin(c * 0.3 - t * 3) + Math.cos(r * 0.4 + t * 2);

        const dx = (x - this.mouseX);
        const dy = (y - this.mouseY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseRipple = dist < 70 ? (1 - dist / 70) * 1.5 : 0;

        let char = " ";
        let color = dim;

        if (hexGrid === 0 || hexGrid === 1) {
          if (busPulse > 1.2 || mouseRipple > 0.6) {
            char = "█";
            color = accent;
          } else {
            char = "▓";
            color = primary;
          }
        } else if (hexGrid === 2 || hexGrid === 7) {
          char = "░";
          color = secondary;
        } else if (r % 4 === 0 && busPulse > 0.8) {
          char = "→";
          color = accent;
        } else if ((r * c) % 11 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("HEX_DOMAIN // BUS_DISPATCH", 12, 10, accent);
  }

  /* --------------------------------------------------------------------------
     5. Enzira Fast Track: Low-Latency Track Stream & Packet Buffers
     -------------------------------------------------------------------------- */
  renderFastTrackOscilloscope(t, cols, rows, charW, charH, primary, secondary, dim, accent) {
    const midY = Math.floor(rows / 2);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * charW;
        const y = r * charH;

        // High frequency oscilloscope line
        const osc = Math.sin(c * 0.4 + t * 4) * Math.cos(c * 0.1 - t) * 4;
        const onLine = Math.abs((r - midY) - osc) < 1.0;

        // Moving data packets along track
        const packetPos = (c + Math.floor(t * 8)) % 16;
        const isPacket = (r === midY || r === midY - 1) && packetPos < 3;

        const dx = (x - this.mouseX);
        const dy = (y - this.mouseY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseHit = dist < 65 ? (1 - dist / 65) : 0;

        let char = " ";
        let color = dim;

        if (isPacket || mouseHit > 0.6) {
          char = "█";
          color = accent;
        } else if (onLine) {
          char = "=";
          color = primary;
        } else if (Math.abs(r - midY) < 3) {
          char = "-";
          color = secondary;
        } else if (c % 4 === 0 && r % 4 === 0) {
          char = "·";
          color = dim;
        }

        if (char !== " ") {
          this.ctx.fillStyle = color;
          this.ctx.fillText(char, x, y);
        }
      }
    }

    this.drawTelemetryTag("FAST_TRACK // AUDIO_STREAM", 12, 10, accent);
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
