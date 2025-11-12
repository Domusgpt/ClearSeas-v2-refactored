/**
 * SmoothScrollAnimator - GSAP-Powered Smooth Section Animations
 * Inspired by minoots-web center-lock choreography
 *
 * Approach:
 * - All animations driven by GSAP ScrollTrigger (not CSS transitions)
 * - Smooth entrance → focus → exit lifecycle for each section
 * - Hardware-accelerated transforms
 * - Elastic easing for organic feel
 * - Works seamlessly with pinned sections
 *
 * © 2025 Clear Seas Solutions LLC
 */

export class SmoothScrollAnimator {
    constructor(gsap, ScrollTrigger, quantumVisualizer = null) {
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this.quantumVisualizer = quantumVisualizer;
        this.animations = [];
        this.sections = [];

        // Elastic easing from minoots
        this.easing = {
            entrance: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            smooth: "power3.out",
            exit: "power2.in"
        };

        console.log('🎬 SmoothScrollAnimator initialized');
    }

    /**
     * Initialize smooth animations for all sections
     */
    initialize() {
        console.log('🚀 Setting up smooth scroll animations...');

        // Register GSAP plugins
        this.gsap.registerPlugin(this.ScrollTrigger);

        // Set GSAP defaults for smooth, hardware-accelerated animations
        this.gsap.defaults({
            ease: this.easing.entrance,
            duration: 0.8
        });

        // Disable CSS-based animations in favor of GSAP
        document.body.classList.add('gsap-animations-active');

        // Discover all sections
        this.discoverSections();

        // Animate hero section (always visible, no scroll trigger)
        this.animateHeroSection();

        // Animate non-pinned sections with smooth scroll reveals
        this.animateScrollSections();

        // Enhance pinned sections (they already have GSAP animations)
        this.enhancePinnedSections();

        console.log(`✅ Smooth animations active on ${this.sections.length} sections`);
    }

    /**
     * Discover all sections
     */
    discoverSections() {
        // Hero section
        const hero = document.querySelector('section.hero, #hero');
        if (hero) {
            this.sections.push({
                element: hero,
                type: 'hero',
                id: 'hero'
            });
        }

        // Non-pinned scrollable sections
        const scrollSections = document.querySelectorAll('section:not([data-section-pin]):not(.hero)');
        scrollSections.forEach(section => {
            this.sections.push({
                element: section,
                type: 'scroll',
                id: section.id || 'section-' + this.sections.length
            });
        });

        // Pinned sections (already have GSAP animations from SectionPinChoreographer)
        const pinnedSections = document.querySelectorAll('section[data-section-pin]');
        pinnedSections.forEach(section => {
            this.sections.push({
                element: section,
                type: 'pinned',
                id: section.id || 'pinned-' + this.sections.length
            });
        });

        console.log(`📋 Discovered ${this.sections.length} sections:`, {
            hero: this.sections.filter(s => s.type === 'hero').length,
            scroll: this.sections.filter(s => s.type === 'scroll').length,
            pinned: this.sections.filter(s => s.type === 'pinned').length
        });
    }

    /**
     * Animate hero section - appears immediately, no scroll needed
     */
    animateHeroSection() {
        const heroSection = this.sections.find(s => s.type === 'hero');
        if (!heroSection) return;

        const hero = heroSection.element;
        console.log('🎭 Animating hero section...');

        // Make sure hero is visible
        this.gsap.set(hero, { opacity: 1 });

        // Animate hero text
        const heroText = hero.querySelector('.hero-text');
        if (heroText) {
            this.gsap.from(heroText, {
                opacity: 0,
                y: 60,
                duration: 1.2,
                ease: this.easing.entrance,
                delay: 0.2
            });
        }

        // Animate hero panels/cards
        const heroCards = hero.querySelectorAll('.signal-card');
        if (heroCards.length > 0) {
            this.gsap.from(heroCards, {
                opacity: 0,
                y: 80,
                scale: 0.95,
                duration: 1.0,
                ease: this.easing.entrance,
                stagger: 0.15,
                delay: 0.5
            });
        }

        console.log('✅ Hero animated');
    }

    /**
     * Animate scrollable sections with smooth entrance/exit
     */
    animateScrollSections() {
        const scrollSections = this.sections.filter(s => s.type === 'scroll');

        console.log(`🎨 Setting up scroll animations for ${scrollSections.length} sections...`);

        scrollSections.forEach(({ element, id }, index) => {
            // Ensure section is visible (override CSS hiding)
            this.gsap.set(element, { opacity: 1, clearProps: 'transform' });

            // Get section theme for visualizer
            const theme = element.dataset.theme || 'cyan';
            const themeColors = {
                cyan: { hue: 180, intensity: 0.7, chaos: 0.3 },
                magenta: { hue: 300, intensity: 0.8, chaos: 0.4 },
                green: { hue: 120, intensity: 0.6, chaos: 0.25 },
                purple: { hue: 270, intensity: 0.75, chaos: 0.35 },
                orange: { hue: 30, intensity: 0.85, chaos: 0.45 },
                blue: { hue: 210, intensity: 0.7, chaos: 0.3 }
            };

            // Create timeline for this section
            const tl = this.gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: 'top 90%',      // Start animation when section is 90% down viewport
                    end: 'top 20%',        // Finish when section is 20% from top
                    scrub: 0.5,            // Smooth scrubbing
                    toggleActions: 'play none none reverse',
                    onEnter: () => {
                        console.log(`✨ ${id} entering`);
                        // Change visualizer parameters on section enter
                        if (this.quantumVisualizer) {
                            this.quantumVisualizer.updateParameters(themeColors[theme]);
                            this.quantumVisualizer.setTheme(theme);
                        }
                    },
                    onUpdate: (self) => {
                        // Dynamically update visualizer during scroll
                        if (this.quantumVisualizer && self.progress > 0 && self.progress < 1) {
                            const progress = self.progress;
                            this.quantumVisualizer.updateParameters({
                                rotation: progress * 360,
                                scale: 1 + progress * 0.2,
                                intensity: themeColors[theme].intensity + progress * 0.2,
                                chaos: themeColors[theme].chaos + Math.sin(progress * Math.PI) * 0.2
                            });
                        }
                    },
                    markers: false         // Set to true for debugging
                }
            });

            // Animate section entrance
            tl.from(element, {
                opacity: 0,
                y: 100,
                duration: 1,
                ease: this.easing.smooth
            }, 0);

            // Animate child elements with data-animate="reveal"
            const revealElements = element.querySelectorAll('[data-animate="reveal"]');
            if (revealElements.length > 0) {
                tl.from(revealElements, {
                    opacity: 0,
                    y: 60,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: this.easing.smooth
                }, 0.2);
            }

            // Animate cards with stagger
            const cards = element.querySelectorAll('.signal-card, .capability-card, .step');
            if (cards.length > 0) {
                tl.from(cards, {
                    opacity: 0,
                    y: 80,
                    scale: 0.95,
                    duration: 1,
                    stagger: {
                        amount: 0.4,
                        from: 'start'
                    },
                    ease: this.easing.entrance
                }, 0.3);
            }

            this.animations.push(tl);
        });

        console.log(`✅ ${scrollSections.length} scroll sections animated`);
    }

    /**
     * Enhance pinned sections that already have GSAP animations
     */
    enhancePinnedSections() {
        const pinnedSections = this.sections.filter(s => s.type === 'pinned');

        console.log(`📍 Enhancing ${pinnedSections.length} pinned sections...`);

        pinnedSections.forEach(({ element, id }) => {
            // Ensure pinned sections are always visible
            this.gsap.set(element, { opacity: 1 });

            // Ensure all content inside pinned sections is visible
            const content = element.querySelectorAll('[data-section-content] > *');
            this.gsap.set(content, { opacity: 1, clearProps: 'transform' });

            console.log(`✅ ${id} enhanced`);
        });
    }

    /**
     * Add smooth hover effects to all cards
     */
    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.signal-card, .capability-card, .carousel-card, .stat-card, .timeline-card, .step, .featured-product');

        cards.forEach(card => {
            // Hover in
            card.addEventListener('mouseenter', () => {
                this.gsap.to(card, {
                    y: -8,
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out',
                    boxShadow: '0 20px 60px rgba(0, 212, 255, 0.3)'
                });
            });

            // Hover out
            card.addEventListener('mouseleave', () => {
                this.gsap.to(card, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                });
            });
        });

        console.log(`✅ Hover effects on ${cards.length} cards`);
    }

    /**
     * Refresh ScrollTrigger (call after DOM changes)
     */
    refresh() {
        this.ScrollTrigger.refresh();
        console.log('🔄 ScrollTrigger refreshed');
    }

    /**
     * Kill all animations
     */
    destroy() {
        this.animations.forEach(anim => anim.kill());
        this.ScrollTrigger.getAll().forEach(st => st.kill());
        this.animations = [];
        console.log('🛑 All animations destroyed');
    }

    /**
     * Get animation stats
     */
    getStats() {
        return {
            totalSections: this.sections.length,
            heroSections: this.sections.filter(s => s.type === 'hero').length,
            scrollSections: this.sections.filter(s => s.type === 'scroll').length,
            pinnedSections: this.sections.filter(s => s.type === 'pinned').length,
            activeAnimations: this.animations.length,
            scrollTriggers: this.ScrollTrigger.getAll().length
        };
    }
}

/**
 * A Paul Phillips Manifestation
 * © 2025 Clear Seas Solutions LLC - All Rights Reserved
 */
