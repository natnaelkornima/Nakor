/**
 * Procedural 3D Tech Knot & Ecosystem Orbit
 * Zero-dependency, pure mathematical 3D rendering on HTML5 Canvas.
 * Real-time 3D projection, depth sorting, mouse inertia, and theme-adaptive coloring.
 */

export class TechKnot3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Configurable Knot Parameters: (p=2, q=3) Trefoil knot
    this.p = 2;
    this.q = 3;
    this.segments = 140;
    this.knotRadius = 110;
    this.tubeScale = 38;

    // Rotation and Physics State
    this.rotX = 0.4;
    this.rotY = 0.6;
    this.rotZ = 0.1;
    this.targetRotX = 0.4;
    this.targetRotY = 0.6;
    this.velX = 0.0035;
    this.velY = 0.006;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Orbiting Technology Satellites (AI, Languages, Systems)
    this.satellites = [
      { name: "TypeScript", icon: "TS", angle: 0, speed: 0.008, dist: 175, yOffset: -20, color: "#38bdf8" },
      { name: "Python", icon: "PY", angle: 1.05, speed: 0.007, dist: 185, yOffset: 30, color: "#38bdf8" },
      { name: "PyTorch · AI", icon: "AI", angle: 2.1, speed: 0.009, dist: 165, yOffset: -40, color: "#10b981" },
      { name: "PostgreSQL", icon: "DB", angle: 3.15, speed: 0.006, dist: 195, yOffset: 15, color: "#38bdf8" },
      { name: "FastAPI", icon: "API", angle: 4.2, speed: 0.008, dist: 170, yOffset: -10, color: "#10b981" },
      { name: "Next.js", icon: "NEXT", angle: 5.25, speed: 0.0075, dist: 180, yOffset: 25, color: "#38bdf8" }
    ];

    // Responsive Canvas Resizing
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Interactive Mouse & Touch Dragging
    this.initInteraction();

    // Visibility Observer to halt rendering when offscreen
    this.isVisible = true;
    this.initObserver();

    // Start 60fps Render Loop
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const size = Math.min(rect.width || 460, 480);
    this.width = size;
    this.height = size;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(dpr, dpr);

    // Adjust knot scale for mobile viewports
    this.knotRadius = size < 380 ? 80 : 105;
    this.tubeScale = size < 380 ? 28 : 36;
  }

  initInteraction() {
    const el = this.canvas;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        this.targetRotY += deltaX * 0.008;
        this.targetRotX += deltaY * 0.008;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        // Subtle ambient parallax tilt on mouse move
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = (e.clientX - centerX) / window.innerWidth;
        const offsetY = (e.clientY - centerY) / window.innerHeight;
        this.targetRotY += offsetX * 0.001;
        this.targetRotX += offsetY * 0.001;
      }
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch Support
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        const deltaY = e.touches[0].clientY - this.lastMouseY;
        this.targetRotY += deltaX * 0.01;
        this.targetRotX += deltaY * 0.01;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    el.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(this.canvas);
  }

  // 3D Matrix Transformations
  rotateX(x, y, z, angle) {
    const rad = angle;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [x, y * cos - z * sin, y * sin + z * cos];
  }

  rotateY(x, y, z, angle) {
    const rad = angle;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [x * cos + z * sin, y, -x * sin + z * cos];
  }

  rotateZ(x, y, z, angle) {
    const rad = angle;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [x * cos - y * sin, x * sin + y * cos, z];
  }

  project(x, y, z) {
    const fov = 420;
    const distance = 480;
    const zOffset = z + distance;
    const scale = fov / Math.max(zOffset, 1);
    return {
      x: x * scale + this.width / 2,
      y: y * scale + this.height / 2,
      z: z,
      scale: scale
    };
  }

  // Generate 3D Torus Knot Geometry
  getKnotPoint(phi) {
    const r = Math.cos(this.q * phi) * this.tubeScale + this.knotRadius;
    const x = r * Math.cos(this.p * phi);
    const y = r * Math.sin(this.p * phi);
    const z = -Math.sin(this.q * phi) * this.tubeScale * 1.8;
    return [x, y, z];
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isVisible) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.rotX += (this.targetRotX - this.rotX) * 0.08 + this.velX;
      this.rotY += (this.targetRotY - this.rotY) * 0.08 + this.velY;
      this.rotZ += 0.001;
    }

    this.render();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const primaryStroke = isLight ? '#0284c7' : '#38bdf8';
    const accentNode = isLight ? '#0f172a' : '#fafafa';
    const ringStroke = isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.12)';

    // Step 1: Compute Knot Vertices
    const projectedPoints = [];
    const step = (Math.PI * 2) / this.segments;

    for (let i = 0; i <= this.segments; i++) {
      const phi = i * step;
      let [x, y, z] = this.getKnotPoint(phi);

      // Rotate in 3D
      [x, y, z] = this.rotateX(x, y, z, this.rotX);
      [x, y, z] = this.rotateY(x, y, z, this.rotY);
      [x, y, z] = this.rotateZ(x, y, z, this.rotZ);

      projectedPoints.push(this.project(x, y, z));
    }

    // Step 2: Draw Ambient Orbit Rings
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, this.knotRadius * 1.45, 0, Math.PI * 2);
    ctx.strokeStyle = ringStroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, this.knotRadius * 1.7, 0, Math.PI * 2);
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = ringStroke;
    ctx.stroke();
    ctx.restore();

    // Step 3: Draw Knot Segments with 3D Depth Sorting & Shading
    for (let i = 0; i < projectedPoints.length - 1; i++) {
      const p1 = projectedPoints[i];
      const p2 = projectedPoints[i + 1];

      // Depth alpha modulation: closer segments are more luminous
      const avgZ = (p1.z + p2.z) / 2;
      const alpha = Math.min(Math.max((avgZ + 120) / 240, 0.15), 0.95);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = isLight 
        ? `rgba(2, 132, 199, ${alpha})`
        : `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = Math.max(p1.scale * 1.7, 1);
      ctx.stroke();

      // Vertex Highlight Nodes every few steps
      if (i % 6 === 0) {
        ctx.beginPath();
        const nodeRadius = Math.max(p1.scale * 2.5, 1.5);
        ctx.arc(p1.x, p1.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#0369a1' : '#7dd3fc';
        ctx.shadowColor = primaryStroke;
        ctx.shadowBlur = isLight ? 0 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Step 4: Draw Orbiting Tech Satellites (AI, TypeScript, Python, etc.)
    this.satellites.forEach(sat => {
      sat.angle += sat.speed;
      const orbitX = Math.cos(sat.angle) * sat.dist;
      const orbitZ = Math.sin(sat.angle) * sat.dist;
      const orbitY = Math.sin(sat.angle * 2) * 20 + sat.yOffset;

      let [sx, sy, sz] = this.rotateX(orbitX, orbitY, orbitZ, this.rotX * 0.4);
      [sx, sy, sz] = this.rotateY(sx, sy, sz, this.rotY * 0.6);
      const proj = this.project(sx, sy, sz);

      // Connect Satellite with subtle tether line to center
      const centerProj = this.project(0, 0, 0);
      ctx.beginPath();
      ctx.moveTo(centerProj.x, centerProj.y);
      ctx.lineTo(proj.x, proj.y);
      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw Satellite Node Pill
      const pillAlpha = Math.min(Math.max((proj.z + 180) / 360, 0.3), 1);
      ctx.save();
      ctx.globalAlpha = pillAlpha;

      // Outer glow / border
      const pillW = 68;
      const pillH = 22;
      const px = proj.x - pillW / 2;
      const py = proj.y - pillH / 2;

      ctx.fillStyle = isLight ? '#ffffff' : '#18181b';
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;

      // Rounded rectangle
      ctx.beginPath();
      ctx.roundRect(px, py, pillW, pillH, 11);
      ctx.fill();
      ctx.stroke();

      // Satellite Label
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.fillStyle = isLight ? '#09090b' : '#fafafa';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sat.name, proj.x, proj.y);

      ctx.restore();
    });
  }
}
