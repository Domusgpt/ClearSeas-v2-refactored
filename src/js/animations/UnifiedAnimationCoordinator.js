/**
 * Unified Animation Coordinator
 * Orchestrates smooth, cohesive animations across all sections
 *
 * Features:
 * - Intersection Observer for scroll-triggered reveals
 * - Coordinated timing for sequential animations
 * - Performance-optimized with requestAnimationFrame
 * - Respects prefers-reduced-motion
 * - Smooth transitions between sections
 *
 * © 2025 Clear Seas Solutions LLC
 */

export class UnifiedAnimationCoordinator {
    constructor() {
        this.sections = [];
        this.observer = null;
        this.isReducedMotion = false;
        this.animationQueue = [];
        this.isReady = false;

        console.log('🎬 UnifiedAnimationCoordinator initialized');
    }

    /**
     * Initialize the animation system
     */
    initialize() {
        console.log('🎬 Setting up unified animation system...');

        // Check for reduced motion preference
        this.checkReducedMotion();

        // Find all sections
        this.discoverSections();

        // Setup intersection observer
        this.setupIntersectionObserver();

        // Mark body as ready for animations
        document.body.classList.add('animations-ready');

        // IMPORTANT: Check for sections already in viewport and reveal them immediately
        this.revealSectionsInViewport();

        // Observe all sections
        this.observeSections();

        // Setup timeline dot index for staggered animations
        this.setupTimelineDots();

        this.isReady = true;
        console.log(`✅ Animation system ready - observing ${this.sections.length} sections`);

        return this;
    }

    /**
     * Check if user prefers reduced motion
     */
    checkReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.isReducedMotion = mediaQuery.matches;

        // Listen for changes
        mediaQuery.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            if (this.isReducedMotion) {
                console.log('⚠️ Reduced motion activated');
                this.revealAllSections();
            }
        });

        if (this.isReducedMotion) {
            console.log('⚠️ Reduced motion detected - instant reveals');
        }
    }

    /**
     * Find all sections that should be animated
     * EXCLUDES pinned sections which are handled by GSAP
     */
    discoverSections() {
        // Get all main sections EXCEPT pinned ones
        const mainSections = document.querySelectorAll('main .section:not([data-section-pin]), section.hero');

        this.sections = Array.from(mainSections).map((section, index) => {
            // Add section class if not present
            if (!section.classList.contains('section') && !section.classList.contains('hero')) {
                section.classList.add('section');
            }

            return {
                element: section,
                index: index,
                id: section.id || `section-${index}`,
                revealed: false,
                isPinned: false // These are all non-pinned by query
            };
        });

        console.log(`📋 Discovered ${this.sections.length} non-pinned sections for animation:`,
            this.sections.map(s => s.id).join(', '));

        // Log pinned sections separately
        const pinnedSections = document.querySelectorAll('section[data-section-pin]');
        if (pinnedSections.length > 0) {
            console.log(`📍 Found ${pinnedSections.length} pinned sections (handled by GSAP):`,
                Array.from(pinnedSections).map(s => s.id || 'unknown').join(', '));
        }
    }

    /**
     * Setup intersection observer for scroll-triggered reveals
     * Only observes non-pinned sections
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-5% 0px -5% 0px', // Trigger when section is 5% into viewport (earlier for smoother experience)
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] // Multiple thresholds for progressive reveal
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const section = this.sections.find(
                    s => s.element === entry.target
                );

                if (!section) return;

                // Double-check it's not a pinned section
                if (section.element.hasAttribute('data-section-pin')) {
                    console.warn(`⚠️ Pinned section ${section.id} should not be observed!`);
                    return;
                }

                // Reveal when entering viewport
                if (entry.isIntersecting && !section.revealed) {
                    this.revealSection(section, entry.intersectionRatio);
                }
            });
        }, options);

        console.log('👀 Intersection observer configured (non-pinned sections only)');
    }

    /**
     * Reveal sections already in viewport on page load
     */
    revealSectionsInViewport() {
        console.log('🔍 Checking for sections already in viewport...');

        this.sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;

            // Check if section is in viewport (even partially)
            const isInViewport = rect.top < windowHeight && rect.bottom > 0;

            if (isInViewport && !section.revealed) {
                console.log(`✨ Section ${section.id} already in viewport - revealing immediately`);
                this.revealSection(section, 1);
            }
        });
    }

    /**
     * Start observing all sections
     */
    observeSections() {
        this.sections.forEach(section => {
            this.observer.observe(section.element);
        });
    }

    /**
     * Reveal a section with coordinated animations
     */
    revealSection(section, intersectionRatio = 1) {
        if (section.revealed) return;

        console.log(`✨ Revealing section: ${section.id} (ratio: ${intersectionRatio.toFixed(2)})`);

        // Mark as revealed
        section.revealed = true;
        section.element.classList.add('is-revealed');

        // If reduced motion, reveal instantly
        if (this.isReducedMotion) {
            this.instantReveal(section);
            return;
        }

        // Trigger animations with slight delay for smooth entrance
        requestAnimationFrame(() => {
            this.animateSection(section);
        });

        // Emit custom event for other systems to react
        window.dispatchEvent(new CustomEvent('sectionRevealed', {
            detail: {
                section: section.element,
                id: section.id,
                index: section.index
            }
        }));
    }

    /**
     * Animate section with coordinated timing
     */
    animateSection(section) {
        const element = section.element;

        // Animate section title if present
        const title = element.querySelector('[data-section-title]');
        if (title) {
            this.animateElement(title, {
                delay: 0,
                duration: 600
            });
        }

        // Animate content container
        const content = element.querySelector('[data-section-content]');
        if (content) {
            this.animateElement(content, {
                delay: 200,
                duration: 600
            });
        }

        // Animate reveal elements
        const revealElements = element.querySelectorAll('[data-animate="reveal"]');
        revealElements.forEach((el, index) => {
            const customDelay = parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0;
            this.animateElement(el, {
                delay: (customDelay * 1000) || (index * 100),
                duration: 600
            });
        });

        // Special handling for specific sections
        this.handleSpecialSections(section);
    }

    /**
     * Handle special animations for specific section types
     */
    handleSpecialSections(section) {
        const element = section.element;
        const sectionId = section.id;

        // Hero section - animate text and panels sequentially
        if (sectionId === 'hero' || element.classList.contains('hero')) {
            const heroText = element.querySelector('.hero-text');
            const heroPanels = element.querySelector('.hero-panels');

            if (heroText) {
                this.animateElement(heroText, { delay: 0, duration: 900 });
            }
            if (heroPanels) {
                this.animateElement(heroPanels, { delay: 200, duration: 900 });
            }
        }

        // Products section - cascade carousel
        if (sectionId === 'products') {
            const carousel = element.querySelector('.product-carousel');
            if (carousel) {
                this.animateElement(carousel, { delay: 400, duration: 900 });
            }
        }

        // Research section - animate timeline
        if (sectionId === 'research') {
            this.animateTimeline(element);
        }

        // Engagement section - stagger steps
        if (sectionId === 'engagement') {
            this.animateEngagementSteps(element);
        }

        // Legacy section - split animation
        if (sectionId === 'legacy') {
            const legacyText = element.querySelector('.legacy-text');
            const legacySignal = element.querySelector('.legacy-signal');

            if (legacyText) {
                this.animateElement(legacyText, { delay: 200, duration: 600 });
            }
            if (legacySignal) {
                this.animateElement(legacySignal, { delay: 400, duration: 600 });
            }
        }

        // Contact section - immersive reveal
        if (sectionId === 'contact') {
            const contactImmersive = element.querySelector('.contact-immersive');
            const ctaGroup = element.querySelector('.contact-cta-group');

            if (contactImmersive) {
                this.animateElement(contactImmersive, { delay: 0, duration: 900 });
            }
            if (ctaGroup) {
                this.animateElement(ctaGroup, { delay: 400, duration: 600 });
            }
        }
    }

    /**
     * Animate timeline with progressive reveal
     */
    animateTimeline(element) {
        const timelineLine = element.querySelector('.timeline-line');
        const timelineDots = element.querySelectorAll('.timeline-dot');
        const timelineCards = element.querySelectorAll('.timeline-card');

        if (timelineLine) {
            this.animateElement(timelineLine, { delay: 0, duration: 1800 });
        }

        // Animate dots with stagger
        timelineDots.forEach((dot, index) => {
            this.animateElement(dot, {
                delay: 300 + (index * 150),
                duration: 300
            });
        });

        // Animate cards with stagger
        timelineCards.forEach((card, index) => {
            this.animateElement(card, {
                delay: 500 + (index * 150),
                duration: 600
            });
        });
    }

    /**
     * Animate engagement steps with directional entrance
     */
    animateEngagementSteps(element) {
        const steps = element.querySelectorAll('.step');

        steps.forEach((step, index) => {
            this.animateElement(step, {
                delay: index * 100,
                duration: 600
            });
        });
    }

    /**
     * Animate individual element with timing
     */
    animateElement(element, { delay = 0, duration = 600 } = {}) {
        setTimeout(() => {
            element.style.transition = `
                opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1),
                transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)
            `;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) translateX(0) scale(1)';
        }, delay);
    }

    /**
     * Instant reveal for reduced motion or immediate reveal needs
     */
    instantReveal(section) {
        const element = section.element;
        element.style.opacity = '1';
        element.style.transform = 'none';

        // Reveal all child elements instantly
        const animatedElements = element.querySelectorAll(
            '[data-animate], .signal-card, .capability-card, .carousel-card, .stat-card, .timeline-card, .step'
        );

        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    /**
     * Reveal all sections instantly (for reduced motion)
     */
    revealAllSections() {
        this.sections.forEach(section => {
            this.instantReveal(section);
            section.revealed = true;
            section.element.classList.add('is-revealed');
        });
    }

    /**
     * Setup timeline dots with index for CSS stagger
     */
    setupTimelineDots() {
        const dots = document.querySelectorAll('.timeline-dot');
        dots.forEach((dot, index) => {
            dot.style.setProperty('--dot-index', index);
        });
    }

    /**
     * Reset a section's animation (useful for testing)
     */
    resetSection(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) return;

        section.revealed = false;
        section.element.classList.remove('is-revealed');

        // Reset styles
        section.element.style.opacity = '';
        section.element.style.transform = '';

        console.log(`🔄 Reset section: ${sectionId}`);
    }

    /**
     * Reset all sections (useful for testing)
     */
    resetAll() {
        this.sections.forEach(section => {
            this.resetSection(section.id);
        });
        console.log('🔄 All sections reset');
    }

    /**
     * Destroy the coordinator and cleanup
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        document.body.classList.remove('animations-ready');

        console.log('🛑 Animation coordinator destroyed');
    }

    /**
     * Get animation statistics
     */
    getStats() {
        const pinnedSections = document.querySelectorAll('section[data-section-pin]').length;
        return {
            animatedSections: this.sections.length,
            revealedSections: this.sections.filter(s => s.revealed).length,
            pinnedSections: pinnedSections,
            totalSections: this.sections.length + pinnedSections,
            isReducedMotion: this.isReducedMotion,
            isReady: this.isReady
        };
    }
}

/**
 * A Paul Phillips Manifestation
 * © 2025 Clear Seas Solutions LLC - All Rights Reserved
 */
