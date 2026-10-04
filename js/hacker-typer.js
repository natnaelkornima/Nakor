/**
 * HackerTyper — Retro Terminal Scramble & Typewriter Engine
 * Renders authentic retro hacker decipher animations:
 * - Cycles between "Hello World :)" and "Let's Connect :)"
 * - Matrix/binary glyph scrambling per character reveal
 * - Classic blinking terminal block cursor
 * - Interactive hover decipher effect
 */

export class HackerTyper {
  constructor(target, options = {}) {
    this.el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.el) return;

    this.phrases = options.phrases || ["Hello World :)", "Let's Connect :)"];
    this.typeSpeed = options.typeSpeed || 90;
    this.deleteSpeed = options.deleteSpeed || 45;
    this.holdTime = options.holdTime || 2400;
    this.scrambleChars = options.scrambleChars || '0123456789ABCDEF!@#$%&*<>_[]{}~+=-/\\';

    this.phraseIndex = 0;
    this.currentText = '';
    this.isDeleting = false;
    this.isScrambling = false;
    this.timeoutId = null;

    this.init();
  }

  randomChar() {
    return this.scrambleChars[Math.floor(Math.random() * this.scrambleChars.length)];
  }

  init() {
    // Interactive mouse hover decipher trigger
    this.onMouseEnter = () => {
      this.triggerMatrixScramble();
    };

    const container = this.el.closest('.hero-hacker-terminal') || this.el.parentElement;
    if (container) {
      container.addEventListener('mouseenter', this.onMouseEnter);
    }

    this.tick();
  }

  tick() {
    const targetPhrase = this.phrases[this.phraseIndex % this.phrases.length];

    if (!this.isDeleting) {
      // Typing phase
      if (this.currentText.length < targetPhrase.length) {
        const nextChar = targetPhrase[this.currentText.length];

        // Hacker glitch/scramble before resolving character
        if (nextChar !== ' ') {
          let scrambleCount = 0;
          const maxScrambles = 2;

          const scrambleStep = () => {
            if (scrambleCount < maxScrambles) {
              this.el.textContent = this.currentText + this.randomChar();
              scrambleCount++;
              this.timeoutId = setTimeout(scrambleStep, 32);
            } else {
              this.currentText += nextChar;
              this.el.textContent = this.currentText;
              // Randomized typing rhythm for human/terminal cadence
              const delay = this.typeSpeed + (Math.random() * 40 - 20);
              this.timeoutId = setTimeout(() => this.tick(), delay);
            }
          };

          scrambleStep();
          return;
        } else {
          this.currentText += nextChar;
          this.el.textContent = this.currentText;
          this.timeoutId = setTimeout(() => this.tick(), this.typeSpeed);
          return;
        }
      } else {
        // Full phrase rendered, pause for user to read
        this.timeoutId = setTimeout(() => {
          this.isDeleting = true;
          this.tick();
        }, this.holdTime);
        return;
      }
    } else {
      // Deleting phase
      if (this.currentText.length > 0) {
        this.currentText = this.currentText.slice(0, -1);
        this.el.textContent = this.currentText;
        this.timeoutId = setTimeout(() => this.tick(), this.deleteSpeed);
        return;
      } else {
        // Finished deleting, advance to next phrase
        this.isDeleting = false;
        this.phraseIndex++;
        this.timeoutId = setTimeout(() => this.tick(), 400);
        return;
      }
    }
  }

  triggerMatrixScramble() {
    if (this.isScrambling || this.isDeleting) return;
    this.isScrambling = true;

    const original = this.currentText;
    let iteration = 0;
    const maxIterations = original.length * 2.5;

    const interval = setInterval(() => {
      this.el.textContent = original
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration / 2.5) {
            return original[index];
          }
          return this.randomChar();
        })
        .join('');

      iteration++;
      if (iteration >= maxIterations) {
        clearInterval(interval);
        this.el.textContent = original;
        this.isScrambling = false;
      }
    }, 35);
  }

  destroy() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    const container = this.el.closest('.hero-hacker-terminal') || this.el.parentElement;
    if (container && this.onMouseEnter) {
      container.removeEventListener('mouseenter', this.onMouseEnter);
    }
  }
}
