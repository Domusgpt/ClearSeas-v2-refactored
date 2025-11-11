/**
 * PinnedCardChoreographer - Scroll-Pinned Card System
 * Cards lock in place, expand to full background, with visualizer morphing
 * Inspired by weare-simone.webflow.io fluid scroll experience
 * © 2025 Clear Seas Solutions LLC
 */

export class PinnedCardChoreographer {
    constructor(gsap, ScrollTrigger, visualizer) {
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this.visualizer = visualizer;
        this.sections = [];

        console.log('📍 PinnedCardChoreographer initialized');
    }

    /**
     * Setup pinned card scroll system
     */
    setupPinnedCards() {
        console.log('🎬 Setting up pinned card choreography...');

        // Get all pinned sections
        this.sections = Array.from(document.querySelectorAll('.pinned-section'));

        if (!this.sections.length) {
            console.warn('⚠️ No .pinned-section elements found');
            return;
        }

        console.log(`📇 Found ${this.sections.length} pinned sections`);

        // Setup each section
        this.sections.forEach((section, index) => {
            this.setupPinnedSection(section, index);
        });

        console.log('✅ Pinned card choreography ready');
    }

    /**
     * Setup individual pinned section
     * Each section pins, expands to fullscreen, then unpins
     */
    setupPinnedSection(section, index) {
        const card = section.querySelector('.pinned-card');
        const content = section.querySelector('.pinned-card__content');
        const visualBg = section.querySelector('.pinned-card__visual-bg');

        if (!card) return;

        // Get visualizer state from data attributes
        const vizState = {
            hue: parseInt(section.dataset.vizHue) || 180,
            geometry: parseInt(section.dataset.vizGeometry) || 2,
            intensity: parseFloat(section.dataset.vizIntensity) || 0.7,
            chaos: parseFloat(section.dataset.vizChaos) || 0.3,
            speed: parseFloat(section.dataset.vizSpeed) || 1.0,
            gridDensity: parseInt(section.dataset.vizGrid) || 30
        };

        // Create scroll timeline with pinning
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=200%',  // Pin for 2 screen heights
                pin: true,      // PIN THE SECTION
                scrub: 1,
                anticipatePin: 1,
                onEnter: () => {
                    console.log(`📍 Section ${index} pinned`);
                    this.morphVisualizer(vizState, 1.5);
                    section.classList.add('is-active');
                },
                onLeave: () => {
                    console.log(`📍 Section ${index} unpinned`);
                    section.classList.remove('is-active');
                },
                onEnterBack: () => {
                    this.morphVisualizer(vizState, 1.5);
                    section.classList.add('is-active');
                },
                onLeaveBack: () => {
                    section.classList.remove('is-active');
                }
            }
        });

        // Phase 1: Card enters and expands to fullscreen (0-30%)
        tl.fromTo(card,
            {
                scale: 0.85,
                borderRadius: '24px',
                width: '90vw',
                height: '80vh'
            },
            {
                scale: 1,
                borderRadius: '0px',
                width: '100vw',
                height: '100vh',
                duration: 0.3,
                ease: 'power2.out'
            },
            0
        );

        // Phase 2: Content fades in and moves (20-40%)
        if (content) {
            tl.fromTo(content,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.2,
                    ease: 'power3.out'
                },
                0.2
            );
        }

        // Phase 3: Visual background intensifies (30-50%)
        if (visualBg) {
            tl.to(visualBg, {
                opacity: 0.8,
                scale: 1.1,
                duration: 0.2,
                ease: 'power1.inOut'
            }, 0.3);
        }

        // Phase 4: Visualizer parameter progression (40-80%)
        // Smoothly increase intensity and chaos during pin
        tl.to({}, {
            duration: 0.4,
            onUpdate: () => {
                const progress = tl.scrollTrigger.progress;
                if (progress >= 0.4 && progress <= 0.8) {
                    const wave = Math.sin((progress - 0.4) / 0.4 * Math.PI);
                    const dynamicIntensity = vizState.intensity + (wave * 0.15);
                    const dynamicChaos = vizState.chaos + (wave * 0.1);

                    if (this.visualizer?.updateParameters) {
                        this.visualizer.updateParameters({
                            intensity: dynamicIntensity,
                            chaos: dynamicChaos
                        });
                    }
                }
            }
        }, 0.4);

        // Phase 5: Content and card start to fade/compress (80-100%)
        if (content) {
            tl.to(content, {
                opacity: 0.3,
                y: -40,
                duration: 0.2,
                ease: 'power2.in'
            }, 0.8);
        }

        tl.to(card, {
            scale: 0.95,
            duration: 0.2,
            ease: 'power2.in'
        }, 0.8);
    }

    /**
     * Morph visualizer to match section state
     */
    morphVisualizer(vizState, duration = 1.5) {
        if (!this.visualizer) return;

        console.log(`🎨 Morphing visualizer: hue=${vizState.hue}, geo=${vizState.geometry}, intensity=${vizState.intensity}`);

        // Create smooth morphing animation
        const currentState = {
            hue: this.visualizer.state?.hue || vizState.hue,
            intensity: this.visualizer.state?.intensity || vizState.intensity,
            chaos: this.visualizer.state?.chaos || vizState.chaos,
            speed: this.visualizer.state?.speed || vizState.speed,
            gridDensity: this.visualizer.state?.gridDensity || vizState.gridDensity
        };

        this.gsap.to(currentState, {
            hue: vizState.hue,
            intensity: vizState.intensity,
            chaos: vizState.chaos,
            speed: vizState.speed,
            gridDensity: vizState.gridDensity,
            duration: duration,
            ease: 'power2.inOut',
            onUpdate: () => {
                if (this.visualizer.updateParameters) {
                    this.visualizer.updateParameters(currentState);
                }
            },
            onComplete: () => {
                // Update stored state
                if (this.visualizer.state) {
                    Object.assign(this.visualizer.state, currentState);
                }
            }
        });

        // Morph geometry if available
        if (this.visualizer.setGeometry && vizState.geometry !== undefined) {
            this.visualizer.setGeometry(vizState.geometry);
        }
    }

    /**
     * Setup card-specific unique animations
     */
    setupCardSpecificAnimations() {
        console.log('🎨 Setting up card-specific animations...');

        this.sections.forEach((section, index) => {
            const uniqueElements = section.querySelectorAll('.unique-element');

            if (!uniqueElements.length) return;

            // Card-specific animation based on index
            switch(index) {
                case 0: // Hero - Floating data points
                    this.animateDataPoints(section, uniqueElements);
                    break;
                case 1: // Boutique - Rotating shapes
                    this.animateGeometricShapes(section, uniqueElements);
                    break;
                case 2: // Development - Code fragments
                    this.animateCodeFragments(section, uniqueElements);
                    break;
                case 3: // Contact - Connection lines
                    this.animateConnectionLines(section, uniqueElements);
                    break;
            }
        });

        console.log('✅ Card-specific animations ready');
    }

    /**
     * Card 1: Floating data points
     */
    animateDataPoints(section, points) {
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=200%',
                scrub: 1
            }
        });

        points.forEach((point, i) => {
            // Stagger fade in
            tl.to(point, {
                opacity: 1,
                scale: 1.5,
                duration: 0.1,
                ease: 'back.out'
            }, i * 0.05);

            // Floating animation
            tl.to(point, {
                y: '+=50',
                x: `+=${Math.random() * 40 - 20}`,
                duration: 0.4,
                ease: 'sine.inOut'
            }, `+=${i * 0.02}`);

            // Pulse
            tl.to(point, {
                scale: 2,
                opacity: 0.8,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            }, '-=0.2');

            // Fade out
            tl.to(point, {
                opacity: 0,
                scale: 0.5,
                duration: 0.1
            }, 0.9);
        });
    }

    /**
     * Card 2: Rotating geometric shapes
     */
    animateGeometricShapes(section, shapes) {
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=200%',
                scrub: 1
            }
        });

        shapes.forEach((shape, i) => {
            // Fade in with rotation
            tl.to(shape, {
                opacity: 1,
                rotation: `+=${180 + i * 90}`,
                scale: 1.2,
                duration: 0.3,
                ease: 'power2.out'
            }, i * 0.08);

            // Continue rotating
            tl.to(shape, {
                rotation: `+=${360}`,
                duration: 0.5,
                ease: 'none'
            }, `+=${i * 0.05}`);

            // Fade out
            tl.to(shape, {
                opacity: 0,
                scale: 0.8,
                duration: 0.2
            }, 0.85);
        });
    }

    /**
     * Card 3: Code fragments
     */
    animateCodeFragments(section, fragments) {
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=200%',
                scrub: 1
            }
        });

        fragments.forEach((fragment, i) => {
            // Type in effect
            tl.to(fragment, {
                opacity: 1,
                y: -20,
                duration: 0.15,
                ease: 'power3.out'
            }, i * 0.06);

            // Glitch effect
            tl.to(fragment, {
                x: `+=${Math.random() * 20 - 10}`,
                opacity: 0.5,
                duration: 0.05,
                yoyo: true,
                repeat: 3
            }, `+=${i * 0.03}`);

            // Matrix rain
            tl.to(fragment, {
                y: '+=100',
                opacity: 0.2,
                duration: 0.3,
                ease: 'power1.in'
            }, 0.5);

            // Fade out
            tl.to(fragment, {
                opacity: 0,
                duration: 0.1
            }, 0.9);
        });
    }

    /**
     * Card 4: Connection lines
     */
    animateConnectionLines(section, lines) {
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=200%',
                scrub: 1
            }
        });

        lines.forEach((line, i) => {
            // Draw in from left
            tl.fromTo(line, {
                scaleX: 0,
                transformOrigin: 'left center',
                opacity: 0
            }, {
                scaleX: 1,
                opacity: 1,
                duration: 0.2,
                ease: 'power2.out'
            }, i * 0.1);

            // Pulse
            tl.to(line, {
                opacity: 0.8,
                duration: 0.15,
                yoyo: true,
                repeat: 2
            }, `+=${i * 0.05}`);

            // Fade out
            tl.to(line, {
                opacity: 0,
                scaleX: 0,
                transformOrigin: 'right center',
                duration: 0.15
            }, 0.85);
        });
    }

    /**
     * Create parallax effect for section backgrounds
     */
    setupParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax-speed]');

        parallaxElements.forEach((element) => {
            const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;

            this.gsap.to(element, {
                scrollTrigger: {
                    trigger: element.closest('.pinned-section'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                y: () => window.innerHeight * speed,
                ease: 'none'
            });
        });
    }
}
