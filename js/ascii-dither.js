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

    const canvases = document.querySelectorAll('.bento-ascii-canvas, .bento-project-canvas');
    canvases.forEach(canvas => {
      const projectId = canvas.getAttribute('data-project-id');
      const card = canvas.closest('.bento-card');
      if (!projectId || !card) return;

      let instance;
      if (projectId === 'nazazi') {
        instance = new NazaziAsciiShaderCanvas(canvas, card, this.isReducedMotion);
      } else {
        instance = new ProjectAsciiCanvas(canvas, card, projectId, this.isReducedMotion);
      }
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

/**
 * Dedicated WebGL AsciiEffect Canvas for First Card (Nazazi)
 * Powered by Efecto's ASCII post-processing shader with real-time procedural scene.
 * Ultra-high-performance: 0 garbage collection, pauses off-screen, 60-120fps.
 */
class NazaziAsciiShaderCanvas {
  constructor(canvas, card, isReducedMotion) {
    this.canvas = canvas;
    this.card = card;
    this.isReducedMotion = isReducedMotion;
    this.isVisible = true;
    this.isRunning = false;
    this.animationFrameId = null;
    this.time = Math.random() * 10;
    this.mouseX = 0;
    this.mouseY = 0;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
               canvas.getContext('experimental-webgl', { antialias: false, alpha: false, depth: false });

    if (!gl) {
      console.warn("WebGL not supported for NazaziAsciiShader, falling back to 2D canvas");
      this.fallback = new ProjectAsciiCanvas(canvas, card, 'nazazi', isReducedMotion);
      return;
    }
    this.gl = gl;

    this.initShaders();
    this.initBuffers();
    this.initListeners();
    this.resize();
    this.start();
  }

  initShaders() {
    const gl = this.gl;
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vUv;

      uniform float cellSize;
      uniform bool invert;
      uniform bool colorMode;
      uniform int asciiStyle;
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 mousePos;

      uniform float scanlineIntensity;
      uniform float scanlineCount;
      uniform float jitterIntensity;
      uniform float jitterSpeed;
      uniform bool mouseGlowEnabled;
      uniform float mouseGlowRadius;
      uniform float mouseGlowIntensity;
      uniform float vignetteIntensity;
      uniform float vignetteRadius;
      uniform int colorPalette;
      uniform float curvature;
      uniform float waveAmplitude;
      uniform float waveFrequency;
      uniform float waveSpeed;
      uniform float glitchIntensity;
      uniform float glitchFrequency;
      uniform float brightnessAdjust;
      uniform float contrastAdjust;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float getChar(float brightness, vec2 p, int style) {
        vec2 grid = floor(p * 4.0);
        float val = 0.0;
        if (style == 0) { // Standard style from Efecto
          if (brightness < 0.2) val = (grid.x == 1.0 && grid.y == 1.0) ? 0.3 : 0.0;
          else if (brightness < 0.35) val = (grid.x == 1.0 || grid.x == 2.0) && (grid.y == 1.0 || grid.y == 2.0) ? 1.0 : 0.0;
          else if (brightness < 0.5) val = (grid.y == 1.0 || grid.y == 2.0) ? 1.0 : 0.0;
          else if (brightness < 0.65) val = (grid.y == 0.0 || grid.y == 3.0) ? 1.0 : (grid.y == 1.0 || grid.y == 2.0) ? 0.5 : 0.0;
          else if (brightness < 0.8) val = (grid.x == 0.0 || grid.x == 2.0 || grid.y == 0.0 || grid.y == 2.0) ? 1.0 : 0.3;
          else val = 1.0;
        }
        return val;
      }

      vec3 applyColorPalette(vec3 color, int palette) {
        if (palette == 1) { // Green
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          return vec3(0.1, lum * 0.9, 0.1);
        } else if (palette == 2) { // Amber
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          return vec3(lum * 1.0, lum * 0.6, lum * 0.2);
        } else if (palette == 3) { // Cyan
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          return vec3(0.0, lum * 0.8, lum);
        } else if (palette == 4) { // Blue
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          return vec3(0.1, 0.2, lum);
        }
        return color;
      }

      // Procedural Telecom Transmission Scene for Nazazi SMS System
      vec4 getSceneColor(vec2 uv) {
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        float t = time * 0.7;
        float d = length(p);
        float angle = atan(p.y, p.x);
        
        // Expanding telecom carrier waves
        float waves = sin(d * 14.0 - t * 3.5) * 0.5 + 0.5;
        float beams = sin(angle * 6.0 + t * 2.0) * 0.5 + 0.5;
        
        // Central transmission orb
        float orb = smoothstep(0.42, 0.05, d);
        float pulse = sin(t * 5.0) * 0.2 + 0.8;
        
        // Message packet streams (horizontal conduit lanes)
        float packetLane1 = smoothstep(0.06, 0.0, abs(p.y - 0.35 + sin(p.x * 4.0 - t * 4.0) * 0.04));
        float packetLane2 = smoothstep(0.06, 0.0, abs(p.y + 0.35 + sin(p.x * 4.0 - t * 3.0) * 0.04));
        
        float intensity = (waves * 0.45 + beams * 0.3) * smoothstep(1.3, 0.1, d) + (orb * pulse * 0.85) + (packetLane1 * 0.4) + (packetLane2 * 0.4);
        
        // Vibrant neon cyan / emerald / deep navy palette
        vec3 col = mix(vec3(0.02, 0.06, 0.12), vec3(0.22, 0.74, 0.98), intensity);
        col = mix(col, vec3(0.06, 0.78, 0.55), waves * beams * 0.7);
        
        return vec4(col, 1.0);
      }

      void main() {
        vec2 workUV = vUv;

        // Screen curvature
        if (curvature > 0.0) {
          vec2 centered = workUV * 2.0 - 1.0;
          centered *= 1.0 + curvature * dot(centered, centered);
          workUV = centered * 0.5 + 0.5;
          if (workUV.x < 0.0 || workUV.x > 1.0 || workUV.y < 0.0 || workUV.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }
        }

        // Wave distortion
        if (waveAmplitude > 0.0) {
          workUV.x += sin(workUV.y * waveFrequency + time * waveSpeed) * waveAmplitude;
          workUV.y += cos(workUV.x * waveFrequency + time * waveSpeed) * waveAmplitude;
        }

        // Core ASCII calculations
        vec2 cellCount = resolution / cellSize;
        vec2 cellCoord = floor(workUV * cellCount);

        if (jitterIntensity > 0.0) {
          float jitterTime = time * jitterSpeed;
          float jitterX = (random(vec2(cellCoord.y, floor(jitterTime))) - 0.5) * jitterIntensity * 2.0;
          float jitterY = (random(vec2(cellCoord.x, floor(jitterTime + 1000.0))) - 0.5) * jitterIntensity * 2.0;
          cellCoord += vec2(jitterX, jitterY);
        }

        if (glitchIntensity > 0.0 && glitchFrequency > 0.0) {
          float glitchTime = floor(time * glitchFrequency);
          float glitchRand = random(vec2(glitchTime, cellCoord.y));
          if (glitchRand < glitchIntensity) {
            float shift = (random(vec2(glitchTime + 1.0, cellCoord.y)) - 0.5) * 20.0;
            cellCoord.x += shift;
          }
        }

        vec2 cellUV = (cellCoord + 0.5) / cellCount;
        vec4 cellColor = getSceneColor(cellUV);
        cellColor.rgb = (cellColor.rgb - 0.5) * contrastAdjust + 0.5 + brightnessAdjust;

        float brightness = dot(cellColor.rgb, vec3(0.299, 0.587, 0.114));
        if (invert) brightness = 1.0 - brightness;

        vec2 localUV = fract(workUV * cellCount);
        float charValue = getChar(brightness, localUV, asciiStyle);

        vec3 finalColor = colorMode ? (cellColor.rgb * charValue) : vec3(brightness * charValue);
        finalColor = applyColorPalette(finalColor, colorPalette);

        // Mouse glow
        if (mouseGlowEnabled) {
          vec2 pixelPos = workUV * resolution;
          float dist = length(pixelPos - mousePos);
          float glow = exp(-dist / mouseGlowRadius) * mouseGlowIntensity;
          finalColor += glow;
        }

        // Scanlines
        if (scanlineIntensity > 0.0) {
          float scanline = sin(workUV.y * scanlineCount * 3.14159) * 0.5 + 0.5;
          finalColor *= 1.0 - (scanline * scanlineIntensity);
        }

        // Vignette
        if (vignetteIntensity > 0.0) {
          vec2 centered = workUV * 2.0 - 1.0;
          float vignette = 1.0 - dot(centered, centered) / vignetteRadius;
          finalColor *= mix(1.0, vignette, vignetteIntensity);
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    // Uniform locations
    this.uniforms = {
      cellSize: gl.getUniformLocation(this.program, "cellSize"),
      invert: gl.getUniformLocation(this.program, "invert"),
      colorMode: gl.getUniformLocation(this.program, "colorMode"),
      asciiStyle: gl.getUniformLocation(this.program, "asciiStyle"),
      time: gl.getUniformLocation(this.program, "time"),
      resolution: gl.getUniformLocation(this.program, "resolution"),
      mousePos: gl.getUniformLocation(this.program, "mousePos"),
      scanlineIntensity: gl.getUniformLocation(this.program, "scanlineIntensity"),
      scanlineCount: gl.getUniformLocation(this.program, "scanlineCount"),
      jitterIntensity: gl.getUniformLocation(this.program, "jitterIntensity"),
      jitterSpeed: gl.getUniformLocation(this.program, "jitterSpeed"),
      mouseGlowEnabled: gl.getUniformLocation(this.program, "mouseGlowEnabled"),
      mouseGlowRadius: gl.getUniformLocation(this.program, "mouseGlowRadius"),
      mouseGlowIntensity: gl.getUniformLocation(this.program, "mouseGlowIntensity"),
      vignetteIntensity: gl.getUniformLocation(this.program, "vignetteIntensity"),
      vignetteRadius: gl.getUniformLocation(this.program, "vignetteRadius"),
      colorPalette: gl.getUniformLocation(this.program, "colorPalette"),
      curvature: gl.getUniformLocation(this.program, "curvature"),
      waveAmplitude: gl.getUniformLocation(this.program, "waveAmplitude"),
      waveFrequency: gl.getUniformLocation(this.program, "waveFrequency"),
      waveSpeed: gl.getUniformLocation(this.program, "waveSpeed"),
      glitchIntensity: gl.getUniformLocation(this.program, "glitchIntensity"),
      glitchFrequency: gl.getUniformLocation(this.program, "glitchFrequency"),
      brightnessAdjust: gl.getUniformLocation(this.program, "brightnessAdjust"),
      contrastAdjust: gl.getUniformLocation(this.program, "contrastAdjust")
    };
  }

  initBuffers() {
    const gl = this.gl;
    if (!gl || !this.program) return;

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  }

  initListeners() {
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });

    this.onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (this.dpr || 1);
      this.mouseY = (rect.height - (e.clientY - rect.top)) * (this.dpr || 1);
    };

    this.card.addEventListener('mousemove', this.onMouseMove, { passive: true });
  }

  resize() {
    if (this.fallback) {
      this.fallback.resize();
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || this.canvas.parentElement?.clientWidth || 360;
    const h = rect.height || this.canvas.parentElement?.clientHeight || 260;
    if (w === 0 || h === 0) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.floor(w * this.dpr);
    this.height = Math.floor(h * this.dpr);
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    if (this.gl) {
      this.gl.viewport(0, 0, this.width, this.height);
    }
  }

  start() {
    if (this.fallback) {
      this.fallback.start();
      return;
    }
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
    if (this.fallback) {
      this.fallback.stop();
      return;
    }
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    if (this.fallback) {
      this.fallback.destroy();
      return;
    }
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.card.removeEventListener('mousemove', this.onMouseMove);
  }

  render() {
    const gl = this.gl;
    if (!gl || !this.program) return;

    if (!this.isReducedMotion) {
      this.time += 0.016;
    }

    gl.useProgram(this.program);

    gl.uniform1f(this.uniforms.cellSize, 9.0);
    gl.uniform1i(this.uniforms.invert, 0);
    gl.uniform1i(this.uniforms.colorMode, 1);
    gl.uniform1i(this.uniforms.asciiStyle, 0); // Standard
    gl.uniform1f(this.uniforms.time, this.time);
    gl.uniform2f(this.uniforms.resolution, this.width, this.height);
    gl.uniform2f(this.uniforms.mousePos, this.mouseX, this.mouseY);

    gl.uniform1f(this.uniforms.scanlineIntensity, 0.12);
    gl.uniform1f(this.uniforms.scanlineCount, 180.0);
    gl.uniform1f(this.uniforms.jitterIntensity, 0.0);
    gl.uniform1f(this.uniforms.jitterSpeed, 1.0);
    gl.uniform1i(this.uniforms.mouseGlowEnabled, 0);
    gl.uniform1f(this.uniforms.mouseGlowRadius, 200.0);
    gl.uniform1f(this.uniforms.mouseGlowIntensity, 1.5);
    gl.uniform1f(this.uniforms.vignetteIntensity, 0.25);
    gl.uniform1f(this.uniforms.vignetteRadius, 0.85);
    gl.uniform1i(this.uniforms.colorPalette, 0); // Original
    gl.uniform1f(this.uniforms.curvature, 0.0);
    gl.uniform1f(this.uniforms.waveAmplitude, 0.0);
    gl.uniform1f(this.uniforms.waveFrequency, 10.0);
    gl.uniform1f(this.uniforms.waveSpeed, 1.0);
    gl.uniform1f(this.uniforms.glitchIntensity, 0.0);
    gl.uniform1f(this.uniforms.glitchFrequency, 0.0);
    gl.uniform1f(this.uniforms.brightnessAdjust, 0.0);
    gl.uniform1f(this.uniforms.contrastAdjust, 1.0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

