/**
 * SectionPinChoreographer - Scroll-Pinned Section Titles with Splash Animations
 * Each section locks into view, displays big title animation, then reveals content
 * Inspired by weare-simone.webflow.io pinned section experience
 * © 2025 Clear Seas Solutions LLC
 */

export class SectionPinChoreographer {
    constructor(gsap, ScrollTrigger, visualizer) {
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this.visualizer = visualizer;
        this.sections = [];

        console.log('📍 SectionPinChoreographer initialized');
    }

    /**
     * Setup pinned section system with title splash animations
     */
    setupPinnedSections() {
        console.log('🎬 Setting up pinned section choreography...');

        // Get all sections with data-section-pin attribute
        this.sections = Array.from(document.querySelectorAll('[data-section-pin]'));

        if (!this.sections.length) {
            console.warn('⚠️ No [data-section-pin] sections found');
            return;
        }

        console.log(`📇 Found ${this.sections.length} pinned sections`);

        // Setup each section
        this.sections.forEach((section, index) => {
            this.setupSection(section, index);
        });

        console.log('✅ Pinned section choreography ready');
    }

    /**
     * Setup individual pinned section
     * Phase 1: Section pins, title splashes in
     * Phase 2: Title stays locked while content reveals
     * Phase 3: Everything fades as next section approaches
     */
    setupSection(section, index) {
        const titleElement = section.querySelector('[data-section-title]');
        const contentElement = section.querySelector('[data-section-content]');

        if (!titleElement || !contentElement) {
            console.warn(`⚠️ Section ${index} missing title or content element`);
            return;
        }

        // Get visualizer state from data attributes
        const vizState = {
            hue: parseInt(section.dataset.vizHue) || 180,
            geometry: parseInt(section.dataset.vizGeometry) || 2,
            intensity: parseFloat(section.dataset.vizIntensity) || 0.7,
            chaos: parseFloat(section.dataset.vizChaos) || 0.3,
            speed: parseFloat(section.dataset.vizSpeed) || 1.0,
            gridDensity: parseInt(section.dataset.vizGrid) || 30
        };

        // Get section title for logging
        const sectionName = section.dataset.sectionPin || `Section ${index}`;

        // Create scroll timeline with pinning
        // scrub: 1 ensures animations progress smoothly with scroll even while pinned
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=300%',  // Pin for 3 screen heights - animations continue throughout
                pin: true,
                scrub: 1,  // Animations tied to scroll position - never stop
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onEnter: () => {
                    console.log(`📍 ${sectionName} pinned - morphing visualizer`);
                    this.morphVisualizer(vizState, 1.5);
                    section.classList.add('is-pinned');
                },
                onLeave: () => {
                    console.log(`📍 ${sectionName} unpinned`);
                    section.classList.remove('is-pinned');
                },
                onEnterBack: () => {
                    this.morphVisualizer(vizState, 1.5);
                    section.classList.add('is-pinned');
                },
                onLeaveBack: () => {
                    section.classList.remove('is-pinned');
                },
                onUpdate: (self) => {
                    // Log progress for debugging
                    if (self.progress > 0 && self.progress < 1) {
                        section.style.setProperty('--scroll-progress', self.progress);
                    }
                }
            }
        });

        // PHASE 1: Title Splash Animation (0-25%)
        // Title scales in with smooth elastic bounce
        tl.fromTo(titleElement,
            {
                scale: 0.3,
                opacity: 0,
                y: 120,
                rotationX: 15
            },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.25,
                ease: 'elastic.out(1, 0.6)'  // Smooth elastic bounce
            },
            0
        );

        // PHASE 2: Title Lock & Content Reveal (25-70%)
        // Content fades and slides in with smooth transform
        tl.fromTo(contentElement,
            {
                opacity: 0,
                y: 100,
                scale: 0.95
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.35,
                ease: 'power2.out'  // Smooth deceleration
            },
            0.25
        );

        // PHASE 3: Visualizer Intensity Wave (40-80%)
        // Create dynamic visualizer parameter changes during pin
        tl.to({}, {
            duration: 0.4,
            onUpdate: () => {
                const progress = tl.scrollTrigger.progress;
                if (progress >= 0.4 && progress <= 0.8) {
                    const wave = Math.sin((progress - 0.4) / 0.4 * Math.PI);
                    const dynamicIntensity = vizState.intensity + (wave * 0.2);
                    const dynamicChaos = vizState.chaos + (wave * 0.15);

                    if (this.visualizer?.updateParameters) {
                        this.visualizer.updateParameters({
                            intensity: dynamicIntensity,
                            chaos: dynamicChaos
                        });
                    }
                }
            }
        }, 0.4);

        // PHASE 4: Exit Fade (75-100%)
        // Smooth exit with scale and blur effect
        tl.to(titleElement, {
            opacity: 0,
            y: -80,
            scale: 0.8,
            filter: 'blur(10px)',
            duration: 0.25,
            ease: 'power3.in'
        }, 0.75);

        tl.to(contentElement, {
            opacity: 0,
            y: -60,
            scale: 0.9,
            filter: 'blur(8px)',
            duration: 0.25,
            ease: 'power3.in'
        }, 0.75);
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
     * Setup hover-triggered visualizer morphing for product cards
     */
    setupProductCardMorphing() {
        console.log('🎨 Setting up product card hover morphing...');

        const productCards = document.querySelectorAll('[data-viz-hue]');

        productCards.forEach((card) => {
            const hue = parseInt(card.dataset.vizHue) || 180;
            const geometry = parseInt(card.dataset.vizGeometry);
            const intensity = parseFloat(card.dataset.vizIntensity) || 0.8;
            const chaos = parseFloat(card.dataset.vizChaos) || 0.4;

            // Store original state for reset
            let originalState = null;

            card.addEventListener('mouseenter', () => {
                // Store current state if not already stored
                if (!originalState && this.visualizer?.state) {
                    originalState = { ...this.visualizer.state };
                }

                // Morph to card-specific state
                this.morphVisualizer({
                    hue,
                    geometry,
                    intensity,
                    chaos,
                    speed: 1.2,
                    gridDensity: 35
                }, 0.8);
            });

            card.addEventListener('mouseleave', () => {
                // Reset to original state
                if (originalState) {
                    this.morphVisualizer(originalState, 0.8);
                }
            });
        });

        console.log(`✅ ${productCards.length} product cards wired for hover morphing`);
    }

    /**
     * Setup scroll-triggered card expansion for timeline items
     */
    setupTimelineCardExpansion() {
        console.log('📜 Setting up timeline card expansion...');

        const timelineCards = document.querySelectorAll('.timeline-card');

        timelineCards.forEach((card, index) => {
            this.gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top center+=100',
                    end: 'center center',
                    scrub: 1,
                    onEnter: () => {
                        card.classList.add('in-view');
                    },
                    onLeave: () => {
                        card.classList.remove('in-view');
                    },
                    onEnterBack: () => {
                        card.classList.add('in-view');
                    },
                    onLeaveBack: () => {
                        card.classList.remove('in-view');
                    }
                }
            });
        });

        console.log(`✅ ${timelineCards.length} timeline cards wired for expansion`);
    }

    /**
     * Setup contact section particle burst on button click
     */
    setupContactParticleBurst() {
        console.log('💥 Setting up contact particle burst...');

        const contactBtn = document.querySelector('.contact-primary-btn');

        if (!contactBtn) {
            console.warn('⚠️ Contact primary button not found');
            return;
        }

        contactBtn.addEventListener('click', (e) => {
            // Don't prevent default - let email link work
            // Just trigger visual effect

            // Create particle burst effect
            this.createParticleBurst(e.clientX, e.clientY);

            // Temporarily boost visualizer intensity
            if (this.visualizer?.updateParameters) {
                const currentIntensity = this.visualizer.state?.intensity || 0.7;
                this.visualizer.updateParameters({
                    intensity: Math.min(currentIntensity + 0.3, 1.0),
                    chaos: 0.8
                });

                // Reset after 1 second
                setTimeout(() => {
                    this.visualizer.updateParameters({
                        intensity: currentIntensity,
                        chaos: 0.3
                    });
                }, 1000);
            }
        });

        console.log('✅ Contact particle burst ready');
    }

    /**
     * Create particle burst effect at x, y coordinates
     */
    createParticleBurst(x, y) {
        const particleCount = 20;
        const container = document.body;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.borderRadius = '50%';
            particle.style.background = `rgba(${Math.random() > 0.5 ? '0, 212, 255' : '192, 132, 252'}, 0.8)`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            container.appendChild(particle);

            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            this.gsap.to(particle, {
                x: tx,
                y: ty,
                opacity: 0,
                scale: 0,
                duration: 0.8 + Math.random() * 0.4,
                ease: 'power2.out',
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    /**
     * Initialize all choreography systems
     */
    initialize() {
        this.setupPinnedSections();
        this.setupProductCardMorphing();
        this.setupTimelineCardExpansion();
        this.setupContactParticleBurst();
    }
}

/**
 * A Paul Phillips Manifestation
 * © 2025 Clear Seas Solutions LLC - All Rights Reserved
 */
