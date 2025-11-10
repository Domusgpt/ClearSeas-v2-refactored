/**
 * VIB3+ Card Holographic Float & Tilt System
 * Interactive card bending with dynamic VIB3+ engine visualization
 * ✅ INTEGRATED WITH SCROLL CHOREOGRAPHY - Uses section-based parameters
 * © 2025 Clear Seas Solutions
 */

(function() {
  'use strict';

  // VIB3+ Engine Container (created once, reused for all cards)
  let vib3Container = null;
  let vib3Frame = null;
  let activeCard = null;
  let rafId = null;

  // 🎯 SCROLL CHOREOGRAPHY INTEGRATION
  let currentSectionState = null;

  // Configuration
  const CONFIG = {
    tiltStrength: 15,        // Max tilt degrees
    floatDistance: 25,       // Max float distance in px
    glowIntensity: 40,       // Glow blur in px
    vib3Opacity: 0.25,       // VIB3+ engine opacity
    transitionSpeed: 200,    // Transition duration in ms
    vib3Scale: 0.4,          // Scale of VIB3+ iframe
  };

  /**
   * 🎯 LISTEN FOR SECTION CHANGES from OrthogonalScrollChoreographer
   */
  window.addEventListener('vib3-section-change', (e) => {
    currentSectionState = e.detail.visualizerState;
    console.log(`🎨 VIB3+ Cards: Section changed to ${e.detail.sectionId}, using harmonious parameters`);

    // 🧹 CLEANUP: Remove iframe when section changes to prevent accumulation
    if (vib3Frame && vib3Frame.parentNode) {
      vib3Frame.remove();
      vib3Frame = null;
    }
    if (vib3Container && vib3Container.parentNode) {
      vib3Container.remove();
      vib3Container = null;
    }
    activeCard = null;
  });

  /**
   * 🎯 GET COMPLEMENTARY GEOMETRY based on background visualizer
   * Creates visual harmony between background and card hover
   */
  function getComplementaryGeometry(backgroundGeometry) {
    const pairs = {
      0: 'tesseract',    // Tetrahedron → Tesseract (4D cube)
      1: '24-cell',      // Hypercube → 24-cell (dual)
      2: '120-cell',     // Sphere → 120-cell (organic)
      3: '600-cell',     // Torus → 600-cell (complex)
      4: '16-cell',      // Klein → 16-cell (orthogonal)
      5: '5-cell',       // Fractal → 5-cell (simplest 4D)
      6: 'tesseract',    // Wave → Tesseract (structured)
      7: '24-cell'       // Crystal → 24-cell (lattice)
    };
    return pairs[backgroundGeometry] || 'tesseract';
  }

  /**
   * 🎯 GET HARMONIOUS HUE based on section hue
   * Uses color theory for pleasing combinations
   */
  function getHarmoniousHue(baseHue) {
    // Complementary color (opposite on color wheel) - offset by 60° for triadic harmony
    return (baseHue + 60) % 360;
  }

  /**
   * Initialize VIB3+ container (hidden by default)
   */
  function initVib3Container() {
    if (vib3Container) return;

    vib3Container = document.createElement('div');
    vib3Container.className = 'vib3-dynamic-viz';
    vib3Container.style.cssText = `
      position: fixed;
      pointer-events: none;
      width: 400px;
      height: 400px;
      opacity: 0;
      transition: opacity 0.4s ease-out;
      z-index: 5;
      filter: blur(1px);
      mix-blend-mode: screen;
    `;

    // 🎯 Use section-based parameters if available, otherwise random fallback
    let geometry, hue;
    if (currentSectionState) {
      geometry = getComplementaryGeometry(currentSectionState.geometry);
      hue = getHarmoniousHue(currentSectionState.hue);
    } else {
      // Fallback to random if section state not yet loaded
      geometry = ['tesseract', '24-cell', '600-cell', '120-cell'][Math.floor(Math.random() * 4)];
      hue = Math.floor(Math.random() * 360);
    }

    vib3Frame = document.createElement('iframe');
    vib3Frame.src = `https://domusgpt.github.io/vib3-plus-engine/?geo=${geometry}&hue=${hue}&auto=1&debug=false&quiet=true`;
    vib3Frame.style.cssText = `
      width: 1000px;
      height: 1000px;
      transform: scale(${CONFIG.vib3Scale}) translate(-50%, -50%);
      transform-origin: top left;
      border: none;
      background: transparent;
    `;

    vib3Container.appendChild(vib3Frame);
    document.body.appendChild(vib3Container);
  }

  /**
   * Calculate card tilt based on mouse position
   */
  function calculateTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = x - centerX;
    const deltaY = y - centerY;

    const tiltX = -(deltaY / centerY) * CONFIG.tiltStrength;
    const tiltY = (deltaX / centerX) * CONFIG.tiltStrength;

    return { tiltX, tiltY, deltaX, deltaY, centerX, centerY };
  }

  /**
   * Apply holographic float and tilt to card
   */
  function applyCardTransform(card, tilt) {
    const { tiltX, tiltY } = tilt;
    const scale = 1.05;
    const translateZ = CONFIG.floatDistance;

    card.style.transform = `
      perspective(1000px)
      translateY(-${translateZ}px)
      translateZ(${translateZ}px)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      scale(${scale})
    `;

    // Add glow based on tilt intensity
    const glowStrength = Math.abs(tiltX) + Math.abs(tiltY);
    const glowColor = card.classList.contains('signal-card') || card.classList.contains('platform-card')
      ? '0, 212, 255'
      : '192, 132, 252';

    card.style.boxShadow = `
      0 ${CONFIG.floatDistance * 1.5}px ${CONFIG.glowIntensity + glowStrength}px rgba(0, 0, 0, 0.4),
      0 0 ${CONFIG.glowIntensity}px rgba(${glowColor}, ${0.3 + (glowStrength / 100)})
    `;
  }

  /**
   * Position VIB3+ visualization behind card
   */
  function positionVib3Visual(card, tilt) {
    if (!vib3Container) return;

    const rect = card.getBoundingClientRect();
    const { tiltX, tiltY } = tilt;

    // Position behind card center
    const left = rect.left + (rect.width / 2) - 200;
    const top = rect.top + (rect.height / 2) - 200;

    vib3Container.style.left = `${left}px`;
    vib3Container.style.top = `${top}px`;

    // Make VIB3+ visual respond to card tilt
    vib3Frame.style.transform = `
      scale(${CONFIG.vib3Scale})
      translate(-50%, -50%)
      rotateX(${-tiltX * 0.5}deg)
      rotateY(${-tiltY * 0.5}deg)
    `;

    vib3Container.style.opacity = CONFIG.vib3Opacity;
  }

  /**
   * Handle card mouse enter
   * 🎯 USES SECTION-BASED PARAMETERS for visual harmony
   */
  function handleCardEnter(card) {
    initVib3Container();

    activeCard = card;
    card.style.transition = `transform ${CONFIG.transitionSpeed}ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow ${CONFIG.transitionSpeed}ms ease`;
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';

    // 🎯 Use section-based parameters for visual coherence
    let geometry, hue, intensity;
    if (currentSectionState) {
      // Use complementary geometry and harmonious color
      geometry = getComplementaryGeometry(currentSectionState.geometry);
      hue = getHarmoniousHue(currentSectionState.hue);
      intensity = currentSectionState.intensity;
    } else {
      // Fallback to random if section state not yet loaded
      geometry = ['tesseract', '24-cell', '600-cell', '120-cell', '16-cell', '5-cell'][Math.floor(Math.random() * 6)];
      hue = Math.floor(Math.random() * 360);
      intensity = 0.6 + (Math.random() * 0.4);
    }

    vib3Frame.src = `https://domusgpt.github.io/vib3-plus-engine/?geo=${geometry}&hue=${hue}&intensity=${intensity}&auto=1&shimmer=1&debug=false&quiet=true`;
  }

  /**
   * Handle card mouse move
   */
  function handleCardMove(card, e) {
    if (activeCard !== card) return;

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      const tilt = calculateTilt(card, e);
      applyCardTransform(card, tilt);
      positionVib3Visual(card, tilt);
    });
  }

  /**
   * Handle card mouse leave
   */
  function handleCardLeave(card) {
    if (activeCard !== card) return;

    activeCard = null;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    card.style.transform = '';
    card.style.boxShadow = '';
    card.style.willChange = 'auto';

    if (vib3Container) {
      vib3Container.style.opacity = '0';
    }
  }

  /**
   * Attach listeners to all interactive cards
   */
  function attachCardListeners() {
    const selectors = [
      '.signal-card.vcodex-neoskeu-card',
      '.capability-card.vcodex-neoskeu-card',
      '.platform-card.vcodex-neoskeu-card',
      '.research-lab.vcodex-neoskeu-card',
      '.step.vcodex-neoskeu-card',
      '.legacy-signal.vcodex-neoskeu-card'
    ];

    selectors.forEach(selector => {
      const cards = document.querySelectorAll(selector);

      cards.forEach(card => {
        card.addEventListener('mouseenter', () => handleCardEnter(card));

        card.addEventListener('mousemove', (e) => handleCardMove(card, e));

        card.addEventListener('mouseleave', () => handleCardLeave(card));
      });
    });
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachCardListeners);
    } else {
      attachCardListeners();
    }
  }

  /**
   * Respect reduced motion preference
   */
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!reduceMotionQuery.matches) {
    init();
  }

  // Listen for changes in motion preference
  reduceMotionQuery.addEventListener('change', (e) => {
    if (e.matches && vib3Container) {
      vib3Container.remove();
      vib3Container = null;
      vib3Frame = null;
    } else if (!e.matches) {
      init();
    }
  });

})();

/**
 * © 2025 Clear Seas Solutions LLC
 * "The Revolution Will Not be in a Structured Format"
 */
