/**
 * Procedural 3D Visual Engine for Projects
 * Zero-dependency, pure mathematical 3D rendering on HTML5 Canvas.
 * Unique, project-tailored 3D models with real-time perspective projection,
 * depth sorting, mouse inertia, and theme-adaptive coloring.
 */

export class Project3DEngine {
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
    }, { threshold: 0.05 });
  }

  mountAll() {
    this.destroy();

    const canvases = document.querySelectorAll('.bento-ascii-canvas, .bento-project-canvas');
    canvases.forEach(canvas => {
      const projectId = canvas.getAttribute('data-project-id');
      const card = canvas.closest('.bento-card');
      if (!projectId || !card) return;

      let instance;
      switch (projectId) {
        case 'nazazi':
          instance = new NazaziBroadcast3D(canvas, card, this.isReducedMotion);
          break;
        case 'enzira-lms':
          instance = new EnziraBegena3D(canvas, card, this.isReducedMotion);
          break;
        case 'nutrigenius':
          instance = new NutriGeniusNeural3D(canvas, card, this.isReducedMotion);
          break;
        case 'gerima':
          instance = new GerimaHexagon3D(canvas, card, this.isReducedMotion);
          break;
        case 'enzira-fast-track':
          instance = new FastTrackGyroscope3D(canvas, card, this.isReducedMotion);
          break;
        default:
          instance = new GenericCore3D(canvas, card, this.isReducedMotion);
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
 * Base 3D Canvas with mathematical projection and mouse physics
 */
class Base3DCanvas {
  constructor(canvas, card, isReducedMotion) {
    this.canvas = canvas;
    this.card = card;
    this.ctx = canvas.getContext('2d');
    this.isReducedMotion = isReducedMotion;

    this.width = 300;
    this.height = 200;
    this.dpr = 1;
    this.time = Math.random() * 100;
    this.isRunning = false;
    this.isVisible = false;
    this.rafId = null;

    // 3D rotation angles & inertia
    this.rotX = 0.25;
    this.rotY = 0.4;
    this.rotZ = 0;
    this.targetRotX = 0.25;
    this.targetRotY = 0.4;
    this.baseSpeedX = 0.002;
    this.baseSpeedY = 0.005;

    // Mouse / Pointer Interaction
    this.isHovered = false;
    this.mouseX = 0;
    this.mouseY = 0;

    this.resize();
    this.boundResize = () => this.resize();
    window.addEventListener('resize', this.boundResize, { passive: true });

    this.initInteraction();
    this.start();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(rect.width || 320, 240);
    this.height = Math.max(rect.height || 220, 180);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  initInteraction() {
    this.boundMouseEnter = () => { this.isHovered = true; };
    this.boundMouseLeave = () => {
      this.isHovered = false;
      this.targetRotX = 0.25;
      this.targetRotY = 0.4;
    };

    this.boundMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      this.targetRotY = 0.4 + nx * 0.45;
      this.targetRotX = 0.25 - ny * 0.35;
    };

    this.card.addEventListener('mouseenter', this.boundMouseEnter);
    this.card.addEventListener('mouseleave', this.boundMouseLeave);
    this.card.addEventListener('mousemove', this.boundMouseMove, { passive: true });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      if (this.isVisible) {
        this.update();
        this.render();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  destroy() {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.boundResize);
    if (this.card) {
      this.card.removeEventListener('mouseenter', this.boundMouseEnter);
      this.card.removeEventListener('mouseleave', this.boundMouseLeave);
      this.card.removeEventListener('mousemove', this.boundMouseMove);
    }
  }

  update() {
    const delta = this.isReducedMotion ? 0.002 : 0.016;
    this.time += delta;

    // Smooth inertia interpolation
    this.rotX += (this.targetRotX - this.rotX) * 0.06;
    this.rotY += (this.targetRotY - this.rotY) * 0.06;

    if (!this.isReducedMotion) {
      this.targetRotY += this.baseSpeedY;
      this.targetRotX += this.baseSpeedX * Math.sin(this.time * 0.5);
    }
  }

  // 3D Matrix Utilities
  rotateX(x, y, z, a) {
    const cos = Math.cos(a), sin = Math.sin(a);
    return [x, y * cos - z * sin, y * sin + z * cos];
  }

  rotateY(x, y, z, a) {
    const cos = Math.cos(a), sin = Math.sin(a);
    return [x * cos + z * sin, y, -x * sin + z * cos];
  }

  rotateZ(x, y, z, a) {
    const cos = Math.cos(a), sin = Math.sin(a);
    return [x * cos - y * sin, x * sin + y * cos, z];
  }

  project(x, y, z, fov = 380, dist = 420) {
    // Apply compound Euler rotation
    let [rx, ry, rz] = this.rotateX(x, y, z, this.rotX);
    [rx, ry, rz] = this.rotateY(rx, ry, rz, this.rotY);
    [rx, ry, rz] = this.rotateZ(rx, ry, rz, this.rotZ);

    const zOffset = rz + dist;
    const scale = fov / Math.max(zOffset, 1);
    return {
      x: rx * scale + this.width / 2,
      y: ry * scale + this.height / 2,
      z: rz,
      scale: scale,
      visible: zOffset > 10
    };
  get isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  drawGridBackground(accentRgb = '56, 189, 248') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const isLight = this.isLight;
    // Deep architectural background with subtle radial gradient
    const grad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 10,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
    );
    if (isLight) {
      grad.addColorStop(0, 'rgba(248, 250, 254, 0.98)');
      grad.addColorStop(1, 'rgba(235, 239, 246, 1)');
    } else {
      grad.addColorStop(0, 'rgba(12, 16, 24, 0.95)');
      grad.addColorStop(1, 'rgba(6, 6, 8, 1)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle technical grid
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.04)' : `rgba(${accentRgb}, 0.035)`;
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
  }
}

/**
 * 01. NAZAZI: 3D Broadcast Network & Telecommunication Array
 * Central geodesic antenna, expanding 3D transmission pulse rings, and orbiting telemetry packets.
 */
class NazaziBroadcast3D extends Base3DCanvas {
  render() {
    this.drawGridBackground('56, 189, 248');
    const ctx = this.ctx;

    // 1. Expanding 3D Broadcast Wave Rings
    const ringCount = 3;
    const maxRadius = 140;
    for (let i = 0; i < ringCount; i++) {
      const phase = (this.time * 0.8 + (i / ringCount)) % 1;
      const r = phase * maxRadius;
      const alpha = (1 - phase) * 0.45;

      ctx.beginPath();
      const points = 36;
      for (let j = 0; j <= points; j++) {
        const theta = (j / points) * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        const y = Math.sin(this.time * 2 + theta * 3) * 6;
        const p = this.project(x, y, z);
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 2. Geodesic Sphere Core (Broadcast Node Hub)
    const sphereRadius = 48;
    const bands = 4;
    const segments = 12;
    const nodes = [];

    for (let b = -bands; b <= bands; b++) {
      const phi = (b / bands) * (Math.PI / 2);
      const r = sphereRadius * Math.cos(phi);
      const y = sphereRadius * Math.sin(phi);

      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2 + (b * 0.2);
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        nodes.push({ x, y, z });
      }
    }

    // Project and Depth Sort Nodes
    const projected = nodes.map(n => ({
      ...this.project(n.x, n.y, n.z),
      orig: n
    })).sort((a, b) => b.z - a.z);

    // Draw Wireframe Connectors
    ctx.lineWidth = 0.85;
    for (let i = 0; i < projected.length; i++) {
      const p1 = projected[i];
      for (let j = i + 1; j < Math.min(i + 5, projected.length); j++) {
        const p2 = projected[j];
        const dist = Math.hypot(p1.orig.x - p2.orig.x, p1.orig.y - p2.orig.y, p1.orig.z - p2.orig.z);
        if (dist < 32) {
          const depthAlpha = Math.max(0.08, (p1.z + 60) / 120 * 0.35);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${depthAlpha})`;
          ctx.stroke();
        }
      }
    }

    // Draw Hub Vertices
    projected.forEach(p => {
      const alpha = Math.max(0.15, (p.z + 60) / 120 * 0.9);
      const size = Math.max(1, p.scale * 2.2);
      ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Orbiting Telemetry Satellites (SMS Queue Dispatchers)
    const satellites = [
      { radius: 95, speed: 1.2, tilt: 0.3, color: '#38bdf8' },
      { radius: 115, speed: -0.9, tilt: -0.4, color: '#34d399' }
    ];

    satellites.forEach(sat => {
      const angle = this.time * sat.speed;
      const x = Math.cos(angle) * sat.radius;
      const z = Math.sin(angle) * sat.radius;
      const y = Math.sin(angle * 2) * (sat.radius * sat.tilt);
      const p = this.project(x, y, z);

      // Trailing beam to center
      const center = this.project(0, 0, 0);
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite glow node
      ctx.fillStyle = sat.color;
      ctx.shadowColor = sat.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, p.scale * 3.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
}

/**
 * 02. ENZIRA LMS: 3D Begena Acoustic Strings & Resonant Harmonic Wave Ribbon
 * 10 suspended vibrating strings of the traditional harp with real-time sinusoidal audio waves.
 */
class EnziraBegena3D extends Base3DCanvas {
  render() {
    this.drawGridBackground('245, 158, 11');
    const ctx = this.ctx;

    // Begena Frame Dimensions
    const frameW = 110;
    const frameH = 130;
    const stringCount = 10;

    // Begena Top Crossbeam & Base Pillar Vertices
    const framePoints = [
      { x: -frameW / 2, y: -frameH / 2, z: 0 },
      { x: frameW / 2, y: -frameH / 2, z: 0 },
      { x: frameW * 0.4, y: frameH / 2, z: 0 },
      { x: -frameW * 0.4, y: frameH / 2, z: 0 }
    ];

    const projFrame = framePoints.map(pt => this.project(pt.x, pt.y, pt.z));

    // Draw Begena Wooden Acoustic Frame in 3D
    ctx.beginPath();
    ctx.moveTo(projFrame[0].x, projFrame[0].y);
    ctx.lineTo(projFrame[1].x, projFrame[1].y);
    ctx.lineTo(projFrame[2].x, projFrame[2].y);
    ctx.lineTo(projFrame[3].x, projFrame[3].y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Soundboard Box Depth (3D box resonator behind strings)
    const boxDepth = 35;
    const backFrame = framePoints.map(pt => this.project(pt.x * 0.85, pt.y * 0.85, -boxDepth));
    ctx.beginPath();
    ctx.moveTo(backFrame[0].x, backFrame[0].y);
    ctx.lineTo(backFrame[1].x, backFrame[1].y);
    ctx.lineTo(backFrame[2].x, backFrame[2].y);
    ctx.lineTo(backFrame[3].x, backFrame[3].y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Connect Front to Back Frame
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(projFrame[i].x, projFrame[i].y);
      ctx.lineTo(backFrame[i].x, backFrame[i].y);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.stroke();
    }

    // 10 Acoustic Strings with Harmonic Waveforms
    for (let s = 0; s < stringCount; s++) {
      const frac = s / (stringCount - 1);
      const topX = -frameW / 2 + frac * frameW;
      const topY = -frameH / 2;
      const botX = -frameW * 0.4 + frac * (frameW * 0.8);
      const botY = frameH / 2;

      // Vibrational resonance frequency specific to each string
      const freq = 1.5 + s * 0.35;
      const amp = this.isHovered ? 14 : 7;
      const harmonicSegments = 24;

      ctx.beginPath();
      for (let k = 0; k <= harmonicSegments; k++) {
        const tSeg = k / harmonicSegments;
        const baseX = topX + (botX - topX) * tSeg;
        const baseY = topY + (botY - topY) * tSeg;
        
        // Standing sinusoidal wave pattern pinned at ends
        const envelope = Math.sin(tSeg * Math.PI);
        const waveZ = Math.sin(this.time * 4 * freq + tSeg * Math.PI * 3) * (amp * envelope);
        const waveX = Math.cos(this.time * 3 * freq + tSeg * Math.PI * 2) * (amp * 0.4 * envelope);

        const p = this.project(baseX + waveX, baseY, waveZ);
        if (k === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);

        // Highlight harmonic node points
        if (k === Math.floor(harmonicSegments / 2) && Math.sin(this.time * 3 + s) > 0.3) {
          ctx.save();
          ctx.fillStyle = s % 2 === 0 ? '#fbbf24' : '#38bdf8';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.strokeStyle = s % 2 === 0 ? 'rgba(251, 191, 36, 0.65)' : 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = s === 4 || s === 5 ? 1.6 : 1.1;
      ctx.stroke();
    }
  }
}

/**
 * 03. NUTRIGENIUS: 3D Neural Synapse Lattice & Hyperdimensional Vector Cluster
 * 4D-to-3D projected vector tesseract with pulsating synaptic signals between macro clusters.
 */
class NutriGeniusNeural3D extends Base3DCanvas {
  constructor(canvas, card, isReducedMotion) {
    super(canvas, card, isReducedMotion);
    this.clusters = [
      { name: 'Protein', x: -50, y: -40, z: -35, color: '#34d399', size: 6 },
      { name: 'Lipids', x: 55, y: -30, z: 40, color: '#38bdf8', size: 5.5 },
      { name: 'Carbs', x: 35, y: 50, z: -45, color: '#fbbf24', size: 6 },
      { name: 'Micro', x: -45, y: 45, z: 35, color: '#c084fc', size: 5 },
      { name: 'Core', x: 0, y: 0, z: 0, color: '#ffffff', size: 7 }
    ];

    // Neural Latent Layer Vertices
    this.latentNodes = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 65 + (i % 3) * 14;
      this.latentNodes.push({
        x: Math.cos(theta) * Math.sin(phi) * radius,
        y: Math.sin(theta) * Math.sin(phi) * radius,
        z: Math.cos(phi) * radius,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render() {
    this.drawGridBackground('16, 185, 129');
    const ctx = this.ctx;

    // 1. Outer Dimensional Bounding Wireframe (Hypercube)
    const cubeSize = 85;
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ].map(([cx, cy, cz]) => this.project(cx * cubeSize, cy * cubeSize, cz * cubeSize));

    const edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;
    edges.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(corners[i].x, corners[i].y);
      ctx.lineTo(corners[j].x, corners[j].y);
      ctx.stroke();
    });

    // 2. Synaptic Edges Connecting Latent Nodes to Clusters
    const projNodes = this.latentNodes.map(n => ({
      ...this.project(n.x, n.y, n.z),
      orig: n
    }));

    const projClusters = this.clusters.map(c => ({
      ...this.project(c.x, c.y, c.z),
      orig: c
    }));

    // Draw Synaptic Network Lines
    ctx.lineWidth = 0.75;
    projNodes.forEach(node => {
      projClusters.forEach(cluster => {
        const dist = Math.hypot(node.orig.x - cluster.orig.x, node.orig.y - cluster.orig.y, node.orig.z - cluster.orig.z);
        if (dist < 90) {
          const alpha = (1 - dist / 90) * 0.25;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(cluster.x, cluster.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.stroke();
        }
      });
    });

    // 3. Synaptic Signal Pulses Traveling Along Edges
    const pulseCount = 6;
    for (let p = 0; p < pulseCount; p++) {
      const progress = (this.time * 1.4 + (p / pulseCount)) % 1;
      const nIdx = p % projNodes.length;
      const cIdx = (p + 1) % projClusters.length;
      const n1 = projNodes[nIdx];
      const c1 = projClusters[cIdx];

      const px = n1.x + (c1.x - n1.x) * progress;
      const py = n1.y + (c1.y - n1.y) * progress;

      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 4. Render Latent Embedding Nodes
    projNodes.forEach(n => {
      const alpha = Math.max(0.15, (n.z + 70) / 140 * 0.7);
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, Math.max(1, n.scale * 1.8), 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Render Primary Nutrition Centroid Clusters
    projClusters.forEach(c => {
      ctx.save();
      const nodeColor = (c.orig.color === '#ffffff' && this.isLight) ? '#0f172a' : c.orig.color;
      ctx.fillStyle = nodeColor;
      ctx.shadowColor = nodeColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(c.x, c.y, Math.max(3, c.scale * c.orig.size), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Cluster Label Pill
      ctx.font = '500 9px monospace';
      ctx.fillStyle = this.isLight ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(c.orig.name, c.x + 8, c.y + 3);
    });
  }
}

/**
 * 04. GERIMA: 3D Concentric Hexagonal Prism Core & Layered Architectural Shield
 * Triple nested hexagonal prisms demonstrating Hexagonal / Ports & Adapters architecture.
 */
class GerimaHexagon3D extends Base3DCanvas {
  render() {
    this.drawGridBackground('56, 189, 248');
    const ctx = this.ctx;

    // Three Architectural Layers: Infrastructure, Application, Domain Entity Core
    const layers = [
      { radius: 105, height: 80, rotSpeed: 0.6, color: 'rgba(56, 189, 248, 0.45)', name: 'Infrastructure' },
      { radius: 72, height: 60, rotSpeed: -0.9, color: 'rgba(52, 211, 153, 0.65)', name: 'Application' },
      { radius: 40, height: 40, rotSpeed: 1.3, color: 'rgba(251, 191, 36, 0.9)', name: 'Domain Core' }
    ];

    layers.forEach((layer) => {
      const sides = 6;
      const angleOffset = this.time * layer.rotSpeed;
      const topPts = [];
      const botPts = [];

      for (let s = 0; s < sides; s++) {
        const theta = (s / sides) * Math.PI * 2 + angleOffset;
        const x = Math.cos(theta) * layer.radius;
        const z = Math.sin(theta) * layer.radius;
        topPts.push(this.project(x, -layer.height / 2, z));
        botPts.push(this.project(x, layer.height / 2, z));
      }

      // Draw Top & Bottom Hexagons
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      for (let s = 0; s < sides; s++) {
        if (s === 0) ctx.moveTo(topPts[s].x, topPts[s].y);
        else ctx.lineTo(topPts[s].x, topPts[s].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      for (let s = 0; s < sides; s++) {
        if (s === 0) ctx.moveTo(botPts[s].x, botPts[s].y);
        else ctx.lineTo(botPts[s].x, botPts[s].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Vertical Columns
      for (let s = 0; s < sides; s++) {
        ctx.beginPath();
        ctx.moveTo(topPts[s].x, topPts[s].y);
        ctx.lineTo(botPts[s].x, botPts[s].y);
        ctx.strokeStyle = layer.color.replace('0.9', '0.4').replace('0.65', '0.25').replace('0.45', '0.15');
        ctx.stroke();

        // Corner Vertices
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.arc(topPts[s].x, topPts[s].y, 2, 0, Math.PI * 2);
        ctx.arc(botPts[s].x, botPts[s].y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Central Cryptographic Security Core
    const center = this.project(0, 0, 0);
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Data Flow Particle Rays from Core to Outer Infrastructure
    const rayCount = 4;
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI * 2 + this.time * 2;
      const dist = 30 + Math.sin(this.time * 3 + r) * 60;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const p = this.project(x, 0, z);

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * 05. ENZIRA FAST TRACK: 3D High-Velocity Dual-Ring Gyroscope & Kinetic Stream
 * Interlocking dual gimbal rings spinning on perpendicular axes illustrating sub-45KB velocity.
 */
class FastTrackGyroscope3D extends Base3DCanvas {
  render() {
    this.drawGridBackground('14, 165, 233');
    const ctx = this.ctx;

    const ringRadius1 = 90;
    const ringRadius2 = 72;
    const points = 48;

    // Ring 1: Primary Equatorial Velocity Ring
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const theta = (i / points) * Math.PI * 2;
      const x = Math.cos(theta) * ringRadius1;
      const y = Math.sin(theta) * ringRadius1;
      const z = 0;
      const p = this.project(x, y, z);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Ring 2: Perpendicular Polar Gimbal Ring
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const theta = (i / points) * Math.PI * 2;
      const x = 0;
      const y = Math.cos(theta) * ringRadius2;
      const z = Math.sin(theta) * ringRadius2;
      const p = this.project(x, y, z);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // High-Velocity Kinetic Particles racing along Ring 1
    const particleCount = 8;
    for (let p = 0; p < particleCount; p++) {
      const angle = this.time * 4.5 + (p / particleCount) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius1;
      const y = Math.sin(angle) * ringRadius1;
      const pos = this.project(x, y, 0);

      // Particle streak trail
      const trailAngle = angle - 0.25;
      const tx = Math.cos(trailAngle) * ringRadius1;
      const ty = Math.sin(trailAngle) * ringRadius1;
      const tPos = this.project(tx, ty, 0);

      ctx.beginPath();
      ctx.moveTo(tPos.x, tPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = this.isLight ? '#0284c7' : '#ffffff';
      ctx.shadowColor = this.isLight ? 'rgba(2, 132, 199, 0.4)' : '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Secondary Kinetic Particles racing along Ring 2
    for (let p = 0; p < 6; p++) {
      const angle = -this.time * 3.8 + (p / 6) * Math.PI * 2;
      const y = Math.cos(angle) * ringRadius2;
      const z = Math.sin(angle) * ringRadius2;
      const pos = this.project(0, y, z);

      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Core Quantum Kernel (Ultra-lean 45KB payload core)
    const core = this.project(0, 0, 0);
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(core.x, core.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Generic Fallback 3D Torus Node
 */
class GenericCore3D extends Base3DCanvas {
  render() {
    this.drawGridBackground('56, 189, 248');
    const ctx = this.ctx;
    const count = 32;
    const r1 = 65, r2 = 25;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.2;

    for (let i = 0; i < count; i++) {
      const u = (i / count) * Math.PI * 2 + this.time;
      ctx.beginPath();
      for (let j = 0; j <= 16; j++) {
        const v = (j / 16) * Math.PI * 2;
        const x = (r1 + r2 * Math.cos(v)) * Math.cos(u);
        const y = (r1 + r2 * Math.cos(v)) * Math.sin(u);
        const z = r2 * Math.sin(v);
        const p = this.project(x, y, z);
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }
}
