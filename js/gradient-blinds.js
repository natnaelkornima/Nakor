/**
 * GradientBlinds Engine
 * WebGL / OGL shader component featuring:
 * - Multi-stop gradient color interpolation
 * - Interactive spotlight tracking with mouse dampening
 * - Venetian blind stripe calculation with anti-aliased edge blending
 * - Dual-theme pigment math (Light mode vs Dark mode)
 * - Noise grain & live animation loop
 */

import { Renderer, Program, Mesh, Triangle } from './ogl.js';

const MAX_COLORS = 8;

const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const prepStops = stops => {
  const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);
  if (base.length === 1) base.push(base[0]);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[i]));
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));
  return { arr, count };
};

export class GradientBlinds {
  constructor(target, options = {}) {
    this.container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.container) return;

    // Config with defaults
    this.options = {
      gradientColors: options.gradientColors || ['#FF9FFC', '#5227FF'],
      angle: options.angle ?? 0,
      noise: options.noise ?? 0.3,
      blindCount: options.blindCount ?? 12,
      blindMinWidth: options.blindMinWidth ?? 50,
      mouseDampening: options.mouseDampening ?? 0.15,
      mirrorGradient: options.mirrorGradient ?? false,
      spotlightRadius: options.spotlightRadius ?? 0.5,
      spotlightSoftness: options.spotlightSoftness ?? 1,
      spotlightOpacity: options.spotlightOpacity ?? 1,
      distortAmount: options.distortAmount ?? 0,
      shineDirection: options.shineDirection || 'left',
      mixBlendMode: options.mixBlendMode || 'lighten',
      dpr: options.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
      paused: options.paused ?? false,
      ...options
    };

    this.mouseTarget = [0, 0];
    this.lastTime = 0;
    this.firstResize = true;
    this.rafId = null;

    this.init();
  }

  checkIsLightTheme() {
    return document.body.classList.contains('light-theme') ||
           document.documentElement.getAttribute('data-theme') === 'light';
  }

  init() {
    const container = this.container;
    container.classList.add('gradient-blinds-container');

    const isLight = this.checkIsLightTheme();
    if (!isLight && this.options.mixBlendMode) {
      container.style.mixBlendMode = this.options.mixBlendMode;
    }

    // 1. OGL Renderer
    this.renderer = new Renderer({
      dpr: Math.min(this.options.dpr, 2),
      alpha: true,
      premultipliedAlpha: true,
      antialias: true
    });

    const gl = this.renderer.gl;
    this.canvas = gl.canvas;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    // 2. Vertex & Fragment Shaders
    const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

    const fragment = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;
uniform float uLightMode;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv0 = fragCoord.xy / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float a = uvMod.y * 6.0;
      float b = uvMod.x * 6.0;
      float w = 0.01 * uDistort;
      uvMod.x += sin(a) * w;
      uvMod.y += cos(b) * w;
    }

    // Smoothly flows from left to right along the diagonal
    float t = mix(uv0.x, uvMod.x, 0.35);
    if (uMirror > 0.5) {
      t = 1.0 - abs(1.0 - 2.0 * fract(t));
    }
    vec3 base = getGradientColor(t);

    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
    float d = length(uv0 - offset);
    float r = max(uSpotlightRadius, 1e-4);
    float dn = d / r;
    float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;

    // Ambient glow so diagonal blinds are beautifully present across the width,
    // and smoothly transition from left to right with no black box
    float ambient = 0.22 * (0.8 + 0.4 * uv0.x);
    vec3 cir = vec3(max(spot, ambient - 0.45));

    float blindCount = max(uBlindCount, 1.0);
    float stripePhase = uvMod.x * blindCount;
    float stripe = fract(stripePhase);
    float stripeAA = clamp(blindCount * 1.25 / min(iResolution.x, iResolution.y), 0.001, 0.12);
    float edgeDistance = min(stripe, 1.0 - stripe);
    float edgeBlend = 1.0 - smoothstep(0.0, stripeAA, edgeDistance);
    stripe = mix(stripe, 0.5, edgeBlend);
    if (uShineFlip > 0.5) stripe = 1.0 - stripe;
    vec3 ran = vec3(stripe);
    vec3 revealSignal = cir + base - ran;

    vec3 col;
    float alpha = 0.0;
    if (uLightMode > 0.5) {
        float peak = max(base.r, max(base.g, base.b));
        vec3 pigment = base / max(peak, 0.0001);
        float neutral = min(pigment.r, min(pigment.g, pigment.b));
        pigment = max(pigment - vec3(neutral * 0.72), vec3(0.0));
        pigment /= max(max(pigment.r, max(pigment.g, pigment.b)), 0.0001);
        pigment = mix(pigment, pigment * pigment, 0.12) * 0.85;
        vec3 revealed = clamp(revealSignal, 0.0, 1.0);
        float coverage = max(revealed.r, max(revealed.g, revealed.b));
        col = pigment;
        float grain = max(rand(gl_FragCoord.xy + iTime) - 0.5, 0.0);
        float grainAmount = grain * uNoise * mix(0.08, 0.15, coverage);
        col = clamp(col - vec3(grainAmount), 0.0, 1.0);
        // Alpha transparency so light theme background shines through
        alpha = smoothstep(0.03, 0.85, coverage);
    } else {
        vec3 lit = max(revealSignal, vec3(0.0));
        col = lit;
        float intensity = clamp(max(lit.r, max(lit.g, lit.b)), 0.0, 1.0);
        col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise * intensity;
        col = max(col, vec3(0.0));
        // Zero black background: unlit areas are 100% transparent.
        // Portfolio website background & dot pattern show through with genuine alpha.
        alpha = smoothstep(0.02, 0.85, intensity);
    }

    fragColor = vec4(col * alpha, alpha);
}

void main() {
    vec4 color;
    mainImage(color, vUv * iResolution.xy);
    gl_FragColor = color;
}
`;

    // 3. Prep Colors & Uniforms
    const { arr: colorArr, count: colorCount } = prepStops(this.options.gradientColors);
    this.uniforms = {
      iResolution: {
        value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
      },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uAngle: { value: (this.options.angle * Math.PI) / 180 },
      uNoise: { value: this.options.noise },
      uBlindCount: { value: Math.max(1, this.options.blindCount) },
      uSpotlightRadius: { value: this.options.spotlightRadius },
      uSpotlightSoftness: { value: this.options.spotlightSoftness },
      uSpotlightOpacity: { value: this.options.spotlightOpacity },
      uMirror: { value: this.options.mirrorGradient ? 1 : 0 },
      uDistort: { value: this.options.distortAmount },
      uShineFlip: { value: this.options.shineDirection === 'right' ? 1 : 0 },
      uColor0: { value: colorArr[0] },
      uColor1: { value: colorArr[1] },
      uColor2: { value: colorArr[2] },
      uColor3: { value: colorArr[3] },
      uColor4: { value: colorArr[4] },
      uColor5: { value: colorArr[5] },
      uColor6: { value: colorArr[6] },
      uColor7: { value: colorArr[7] },
      uColorCount: { value: colorCount },
      uLightMode: { value: isLight ? 1 : 0 }
    };

    // 4. Program & Mesh with transparency
    this.program = new Program(gl, {
      vertex,
      fragment,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    this.geometry = new Triangle(gl);
    this.mesh = new Mesh(gl, { geometry: this.geometry, program: this.program });

    // 5. Resize Logic
    this.resize = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width || 480;
      const h = rect.height || 540;
      this.renderer.setSize(w, h);
      this.uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];

      if (this.options.blindMinWidth && this.options.blindMinWidth > 0) {
        const maxByMinWidth = Math.max(1, Math.floor(w / this.options.blindMinWidth));
        const effective = this.options.blindCount ? Math.min(this.options.blindCount, maxByMinWidth) : maxByMinWidth;
        this.uniforms.uBlindCount.value = Math.max(1, effective);
      } else {
        this.uniforms.uBlindCount.value = Math.max(1, this.options.blindCount);
      }

      if (this.firstResize) {
        this.firstResize = false;
        const cx = gl.drawingBufferWidth / 2;
        const cy = gl.drawingBufferHeight / 2;
        this.uniforms.iMouse.value = [cx, cy];
        this.mouseTarget = [cx, cy];
      }
    };

    this.resize();
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(container);

    // 6. Pointer Movement
    this.onPointerMove = e => {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.renderer.dpr || 1;
      const x = (e.clientX - rect.left) * scale;
      const y = (rect.height - (e.clientY - rect.top)) * scale;
      this.mouseTarget = [x, y];
      if (this.options.mouseDampening <= 0) {
        this.uniforms.iMouse.value = [x, y];
      }
    };
    this.canvas.addEventListener('pointermove', this.onPointerMove);

    // 7. Theme Observer
    this.themeObserver = new MutationObserver(() => {
      const isLightNow = this.checkIsLightTheme();
      this.uniforms.uLightMode.value = isLightNow ? 1 : 0;
      if (isLightNow) {
        container.style.mixBlendMode = 'normal';
      } else if (this.options.mixBlendMode) {
        container.style.mixBlendMode = this.options.mixBlendMode;
      }
    });
    this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    // 8. Animation Loop
    this.loop = t => {
      this.rafId = requestAnimationFrame(this.loop);
      this.uniforms.iTime.value = t * 0.001;

      if (this.options.mouseDampening > 0) {
        if (!this.lastTime) this.lastTime = t;
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;
        const tau = Math.max(1e-4, this.options.mouseDampening);
        let factor = 1 - Math.exp(-dt / tau);
        if (factor > 1) factor = 1;
        const target = this.mouseTarget;
        const cur = this.uniforms.iMouse.value;
        cur[0] += (target[0] - cur[0]) * factor;
        cur[1] += (target[1] - cur[1]) * factor;
      } else {
        this.lastTime = t;
      }

      if (!this.options.paused && this.program && this.mesh) {
        try {
          this.renderer.render({ scene: this.mesh });
        } catch (err) {
          console.error(err);
        }
      }
    };

    this.rafId = requestAnimationFrame(this.loop);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.canvas) this.canvas.removeEventListener('pointermove', this.onPointerMove);
    if (this.ro) this.ro.disconnect();
    if (this.themeObserver) this.themeObserver.disconnect();
    if (this.canvas && this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }
    const callIfFn = (obj, key) => {
      if (obj && typeof obj[key] === 'function') obj[key].call(obj);
    };
    callIfFn(this.program, 'remove');
    callIfFn(this.geometry, 'remove');
    callIfFn(this.mesh, 'remove');
    callIfFn(this.renderer, 'destroy');
  }
}
