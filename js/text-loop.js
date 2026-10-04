/**
 * TextLoop Component (Vanilla JS + CSS with GSAP)
 * Ported faithfully from React Bits: https://reactbits.dev
 *
 * Smooth continuous text scrolling along arbitrary SVG curves or straight paths.
 */

const VIEW_W = 1200;
const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const EDGE_PAD = 6;

export const buildPath = (shape = 'wave', curviness = 90, ribbonWidth = 86) => {
  const c = Math.max(0, curviness);
  const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case 'circle': {
      const r = Math.min(90 + c * 0.95, room);
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case 'infinity': {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        'Z'
      ].join(' ');
    }
    case 'arch': {
      const rise = Math.min(120 + c * 1.1, room * 2);
      return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`;
    }
    case 'line':
      return `M -320 ${CY} L ${VIEW_W + 320} ${CY}`;
    case 'wave':
    default: {
      const a = Math.min(c * 2.2, room * 2);
      return `M -320 ${CY} Q -160 ${CY - a} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${VIEW_W + 320} ${CY}`;
    }
  }
};

/**
 * Initializes a TextLoop instance inside a DOM element.
 *
 * @param {HTMLElement} container
 * @param {Object} options
 * @returns {{ destroy: Function, pause: Function, resume: Function }}
 */
export function initTextLoop(container, options = {}) {
  if (!container) return null;

  const {
    text = 'React ✦ Bits',
    shape = 'wave',
    path,
    speed = 90,
    direction = 'forward',
    separator = '✦',
    curviness = 90,
    fontSize = 46,
    fontWeight = 800,
    letterSpacing = 2,
    uppercase = true,
    color = '#ffffff',
    ribbon = true,
    ribbonColor = '#5227FF',
    ribbonWidth = 86,
    pauseOnHover = true,
    className = '',
    style = {}
  } = options;

  const pathId = `text-loop-${Math.random().toString(36).substring(2, 9)}`;
  const d = path || buildPath(shape, curviness, ribbonWidth);

  const baseText = uppercase ? String(text).toUpperCase() : String(text);
  const gap = separator ? `\u00A0${separator}\u00A0` : '\u00A0\u00A0\u00A0';
  const unit = `${baseText}${gap}`;

  container.className = `text-loop ${className}`.trim();
  Object.assign(container.style, style);

  container.innerHTML = `
    <svg
      class="text-loop-svg"
      viewBox="0 0 ${VIEW_W} ${VIEW_H}"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="${text}"
    >
      <path
        id="${pathId}"
        class="text-loop-path"
        d="${d}"
        fill="none"
        stroke="${ribbon ? ribbonColor : 'none'}"
        stroke-width="${ribbon ? ribbonWidth : 0}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <text
        class="text-loop-measure"
        style="font-size: ${fontSize}px; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}px;"
        aria-hidden="true"
      >${unit}</text>

      <text
        class="text-loop-text text-loop-head"
        style="font-size: ${fontSize}px; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}px;"
        fill="${color}"
        dominant-baseline="central"
        aria-hidden="true"
      >
        <textPath href="#${pathId}" startOffset="0"></textPath>
      </text>

      <text
        class="text-loop-text text-loop-tail"
        style="font-size: ${fontSize}px; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}px;"
        fill="${color}"
        dominant-baseline="central"
        aria-hidden="true"
      >
        <textPath href="#${pathId}" startOffset="0"></textPath>
      </text>
    </svg>
  `;

  const pathEl = container.querySelector('.text-loop-path');
  const measureEl = container.querySelector('.text-loop-measure');
  const headTextPath = container.querySelector('.text-loop-head textPath');
  const tailTextPath = container.querySelector('.text-loop-tail textPath');

  let tween = null;
  let isDestroyed = false;

  const measureAndStart = () => {
    if (isDestroyed || !pathEl || !measureEl) return;

    let length = 0;
    let unitWidth = 0;
    try {
      length = pathEl.getTotalLength();
      unitWidth = measureEl.getComputedTextLength();
    } catch {
      return;
    }

    if (!length) return;

    const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
    const loopText = unit.repeat(reps);

    headTextPath.textContent = loopText;
    tailTextPath.textContent = loopText;

    const apply = (offset) => {
      const partner = offset >= 0 ? offset - length : offset + length;
      headTextPath.setAttribute('startOffset', String(offset));
      tailTextPath.setAttribute('startOffset', String(partner));
    };

    apply(0);

    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || speed <= 0) return;

    const gsapLib = window.gsap;
    if (!gsapLib) {
      console.warn('GSAP is required for TextLoop animation.');
      return;
    }

    const state = { offset: 0 };
    if (tween) tween.kill();

    tween = gsapLib.to(state, {
      offset: direction === 'reverse' ? -length : length,
      duration: length / speed,
      ease: 'none',
      repeat: -1,
      onUpdate: () => apply(state.offset)
    });
  };

  const pause = () => tween?.pause();
  const resume = () => tween?.resume();

  if (pauseOnHover) {
    container.addEventListener('pointerenter', pause);
    container.addEventListener('pointerleave', resume);
  }

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(measureAndStart).catch(() => measureAndStart());
  } else {
    setTimeout(measureAndStart, 50);
  }

  return {
    destroy: () => {
      isDestroyed = true;
      tween?.kill();
      if (pauseOnHover) {
        container.removeEventListener('pointerenter', pause);
        container.removeEventListener('pointerleave', resume);
      }
    },
    pause,
    resume
  };
}

export default initTextLoop;
