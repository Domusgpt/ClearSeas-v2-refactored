/**
 * OrthogonalZChoreographer.js
 *
 * Implements orthogonal Z-axis card progression with choreographed visualizer reveal/conceal.
 * Cards emerge from depth (Z-axis) toward viewer with smooth transitions.
 * Visualizer stays behind content, revealed tastefully during scroll progression.
 *
 * Key Concepts:
 * - Cards at rest exist at translateZ(-800px) to -1200px (far depths)
 * - On scroll approach, cards emerge to translateZ(0) (viewer plane)
 * - Concurrent opacity, scale, blur modulation for depth perception
 * - Visualizer changes state during card occlusion moments
 * - Animated intro/existence/exit for each product/title
 * - Perspective container for 3D transforms
 *
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format" © 2025
 */

import { Logger } from '../utils/Utils.js';

export class OrthogonalZChoreographer {
    constructor(visualizer, gsap) {
        this.logger = new Logger('OrthogonalZChoreographer', 'info');
        this.visualizer = visualizer;
        this.gsap = gsap || window.gsap;
        this.ScrollTrigger = window.ScrollTrigger;

        // Depth states for cards
        this.DEPTH_FAR = -1200;        // Starting depth (far from viewer)
        this.DEPTH_APPROACHING = -600;  // Mid-transition
        this.DEPTH_FOCUSED = 0;         // At viewer plane
        this.DEPTH_EXITING = 400;       // Past viewer (exiting)

        // Perspective settings
        this.PERSPECTIVE = 1400;        // Lower = more dramatic 3D

        // Timing
        this.CARD_TRANSITION_DURATION = 1.2;
        this.CARD_EASE = 'power2.inOut';

        this.logger.info('🎭 OrthogonalZChoreographer initialized');
    }

    initialize() {
        this.logger.info('🎬 Setting up orthogonal Z-axis choreography...');

        // Set up perspective containers
        this.setupPerspectiveContainers();

        // Choreograph each section
        this.choreographHero();
        this.choreographCapabilities();
        this.choreographProducts();
        this.choreographContact();

        this.logger.info('✅ Orthogonal choreography initialized');
    }

    setupPerspectiveContainers() {
        // Apply perspective to sections with cards
        const sections = document.querySelectorAll('#hero, #capabilities, #products');
        sections.forEach(section => {
            const container = section.querySelector('.container') || section;
            container.style.perspective = `${this.PERSPECTIVE}px`;
            container.style.perspectiveOrigin = '50% 50%';
            container.style.transformStyle = 'preserve-3d';
        });

        this.logger.info(`✅ Applied perspective (${this.PERSPECTIVE}px) to ${sections.length} sections`);
    }

    /**
     * Hero Section Choreography
     * - Cards emerge from depth one by one
     * - Visualizer starts as SPHERE (calm), morphs to HYPERCUBE (dynamic) as cards reveal
     * - Each card introduction is an "event" that changes visualizer state
     */
    choreographHero() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        const cards = hero.querySelectorAll('.signal-card');
        if (cards.length === 0) return;

        this.logger.info(`🎭 Choreographing ${cards.length} hero cards with Z-axis emergence...`);

        // Pin hero section for choreography
        this.ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: '+=200%',
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                // Visualizer choreography during hero scroll
                if (this.visualizer && this.visualizer.params) {
                    const viz = this.visualizer.params;

                    // Phase 1 (0-0.3): SPHERE, calm introduction
                    if (progress < 0.3) {
                        viz.geometry = 2; // SPHERE
                        viz.chaos = 0.05 + progress * 0.2;
                        viz.intensity = 0.4 + progress * 0.3;
                        viz.morphFactor = 0.8;
                        viz.rot4dXW += 0.0005;
                        viz.rot4dYW += 0.0003;
                    }
                    // Phase 2 (0.3-0.6): Transition to HYPERCUBE, more dynamic
                    else if (progress < 0.6) {
                        viz.geometry = 1; // HYPERCUBE
                        viz.chaos = 0.25 + (progress - 0.3) * 0.3;
                        viz.intensity = 0.7 + (progress - 0.3) * 0.2;
                        viz.morphFactor = 0.6 - (progress - 0.3) * 0.2;
                        viz.rot4dXW += 0.001;
                        viz.rot4dYW += 0.0007;
                        viz.rot4dZW += 0.0003;
                    }
                    // Phase 3 (0.6-1.0): TORUS, chaotic flourish
                    else {
                        viz.geometry = 3; // TORUS
                        viz.chaos = 0.55 + (progress - 0.6) * 0.4;
                        viz.intensity = 0.9;
                        viz.morphFactor = 0.4;
                        viz.gridDensity = 0.4 + (progress - 0.6) * 0.3;
                        viz.rot4dXW += 0.0015;
                        viz.rot4dYW += 0.001;
                        viz.rot4dZW += 0.0005;
                    }
                }
            }
        });

        // Choreograph each card's Z-axis emergence
        cards.forEach((card, i) => {
            // Set initial state: far depth, invisible
            this.gsap.set(card, {
                z: this.DEPTH_FAR,
                opacity: 0,
                scale: 0.4,
                filter: 'blur(8px)',
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center'
            });

            // Card emergence timeline
            const cardDelay = i * 0.25; // Stagger delay
            const startProgress = 0.1 + cardDelay;
            const endProgress = 0.4 + cardDelay;

            this.gsap.to(card, {
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '+=200%',
                    scrub: 1
                },
                z: this.DEPTH_FOCUSED,
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                duration: this.CARD_TRANSITION_DURATION,
                ease: this.CARD_EASE,
                delay: cardDelay
            });

            // Add subtle 3D tilt on hover
            card.addEventListener('mouseenter', (e) => {
                this.gsap.to(card, {
                    rotateY: 5,
                    rotateX: -3,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', (e) => {
                this.gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
        });

        this.logger.info('✅ Hero Z-axis choreography complete');
    }

    /**
     * Capabilities Section Choreography
     * - Cards emerge from depth in a wave pattern
     * - Visualizer transitions to CRYSTAL geometry
     * - Use card occlusion moments to shift visualizer parameters
     */
    choreographCapabilities() {
        const capabilities = document.getElementById('capabilities');
        if (!capabilities) return;

        const cards = capabilities.querySelectorAll('.capability-card');
        if (cards.length === 0) return;

        this.logger.info(`🎭 Choreographing ${cards.length} capability cards...`);

        // Pin section
        this.ScrollTrigger.create({
            trigger: capabilities,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                if (this.visualizer && this.visualizer.params) {
                    const viz = this.visualizer.params;

                    // CRYSTAL geometry with evolving parameters
                    viz.geometry = 7; // CRYSTAL
                    viz.chaos = 0.2 + progress * 0.5;
                    viz.intensity = 0.6 + progress * 0.3;
                    viz.morphFactor = 0.9 - progress * 0.3;
                    viz.gridDensity = 0.3 + progress * 0.4;
                    viz.rot4dXW += 0.0008;
                    viz.rot4dZW += 0.0006;

                    // Color shift based on progress
                    viz.hue = (180 + progress * 120) % 360; // Cyan to magenta
                }
            }
        });

        // Staggered card emergence
        cards.forEach((card, i) => {
            this.gsap.set(card, {
                z: this.DEPTH_FAR,
                opacity: 0,
                scale: 0.5,
                filter: 'blur(6px)',
                transformStyle: 'preserve-3d'
            });

            const delay = i * 0.3;

            this.gsap.to(card, {
                scrollTrigger: {
                    trigger: capabilities,
                    start: 'top top',
                    end: '+=150%',
                    scrub: 1
                },
                z: this.DEPTH_FOCUSED,
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                duration: this.CARD_TRANSITION_DURATION,
                ease: this.CARD_EASE,
                delay: delay
            });
        });

        this.logger.info('✅ Capabilities Z-axis choreography complete');
    }

    /**
     * Products Section Choreography
     * - Product cards emerge with MORE DRAMATIC depth transitions
     * - Visualizer transitions to KLEIN_BOTTLE (exotic geometry)
     * - Cards have intro -> existence -> exit lifecycle
     */
    choreographProducts() {
        const products = document.getElementById('products');
        if (!products) return;

        const cards = products.querySelectorAll('.platform-card');
        if (cards.length === 0) return;

        this.logger.info(`🎭 Choreographing ${cards.length} product cards...`);

        // Pin section
        this.ScrollTrigger.create({
            trigger: products,
            start: 'top top',
            end: '+=180%',
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                if (this.visualizer && this.visualizer.params) {
                    const viz = this.visualizer.params;

                    // KLEIN_BOTTLE geometry (exotic)
                    viz.geometry = 4; // KLEIN_BOTTLE
                    viz.chaos = 0.4 + progress * 0.5;
                    viz.intensity = 0.8 + progress * 0.2;
                    viz.morphFactor = 0.7 - progress * 0.4;
                    viz.gridDensity = 0.5 + progress * 0.3;
                    viz.rot4dYW += 0.0012;
                    viz.rot4dZW += 0.0008;

                    // Saturation boost for products
                    viz.saturation = 0.7 + progress * 0.3;
                    viz.hue = (280 + progress * 80) % 360; // Purple to blue
                }
            }
        });

        // Product cards with MORE DRAMATIC depth
        cards.forEach((card, i) => {
            this.gsap.set(card, {
                z: this.DEPTH_FAR * 1.5, // EXTRA far
                opacity: 0,
                scale: 0.3,
                filter: 'blur(12px)',
                transformStyle: 'preserve-3d',
                rotateX: -15 // Initial tilt
            });

            const delay = i * 0.25;

            // Emergence animation
            const tl = this.gsap.timeline({
                scrollTrigger: {
                    trigger: products,
                    start: 'top top',
                    end: '+=180%',
                    scrub: 1
                }
            });

            // Intro: Far -> Focused
            tl.to(card, {
                z: this.DEPTH_FOCUSED,
                opacity: 1,
                scale: 1.05, // Slight overshoot
                filter: 'blur(0px)',
                rotateX: 0,
                duration: this.CARD_TRANSITION_DURATION,
                ease: this.CARD_EASE,
                delay: delay
            });

            // Existence: Hold at focused state
            tl.to(card, {
                scale: 1,
                duration: 0.3,
                ease: 'power1.inOut'
            });

            // Exit: Continue past viewer (if last cards)
            if (i > cards.length - 3) {
                tl.to(card, {
                    z: this.DEPTH_EXITING,
                    opacity: 0.3,
                    scale: 0.8,
                    filter: 'blur(4px)',
                    duration: 0.6,
                    ease: 'power2.in'
                });
            }
        });

        this.logger.info('✅ Products Z-axis choreography complete');
    }

    /**
     * Contact Section Choreography
     * - Final visualizer state: FRACTAL (complex, beautiful)
     * - Allow natural scroll to continue (unpin)
     */
    choreographContact() {
        const contact = document.getElementById('contact');
        if (!contact) return;

        this.logger.info('🎭 Choreographing contact section...');

        this.ScrollTrigger.create({
            trigger: contact,
            start: 'top center',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                if (this.visualizer && this.visualizer.params) {
                    const viz = this.visualizer.params;

                    // FRACTAL finale
                    viz.geometry = 5; // FRACTAL
                    viz.chaos = 0.6 + progress * 0.3;
                    viz.intensity = 1.0;
                    viz.morphFactor = 0.5;
                    viz.gridDensity = 0.7 + progress * 0.2;
                    viz.saturation = 0.9;
                    viz.hue = (320 + progress * 40) % 360; // Magenta
                    viz.rot4dXW += 0.002;
                    viz.rot4dYW += 0.0015;
                    viz.rot4dZW += 0.001;
                }
            }
        });

        this.logger.info('✅ Contact choreography complete');
    }

    /**
     * Destroy choreography and clean up
     */
    destroy() {
        if (this.ScrollTrigger) {
            this.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        }
        this.logger.info('🗑️ OrthogonalZChoreographer destroyed');
    }
}
