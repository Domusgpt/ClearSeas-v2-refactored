/**
 * OrthogonalScrollChoreographer.js
 *
 * Revolutionary scroll choreography system with:
 * - Cards emerging from Z-axis depth (-820px → 0px → 420px)
 * - Timeline-based scroll mapping (every movement matters)
 * - Strategic visualizer revelation through content gaps
 * - Introduction → Existence → Exit phases for all elements
 * - Visualizer parameter orchestration with occlusion
 *
 * Inspired by:
 * - https://domusgpt.github.io/Clear-Seas-Draft/25-orthogonal-depth-progression.html
 * - https://weare-simone.webflow.io/
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

export class OrthogonalScrollChoreographer {
    constructor(quantumVisualizer, options = {}) {
        this.visualizer = quantumVisualizer;
        this.gsap = window.gsap;
        this.ScrollTrigger = window.ScrollTrigger;

        if (!this.gsap || !this.ScrollTrigger) {
            console.error('❌ GSAP/ScrollTrigger not loaded');
            return;
        }

        this.gsap.registerPlugin(this.ScrollTrigger);

        // Configuration - OPTIMIZED for smooth, fluid animations
        this.config = {
            // Z-depth stages for card progression
            depths: {
                far: -820,
                approaching: -420,
                focused: 0,
                exiting: 420
            },
            // Scale stages
            scales: {
                far: 0.28,
                approaching: 0.6,
                focused: 1.0,
                exiting: 1.45
            },
            // Opacity stages
            opacities: {
                far: 0.1,
                approaching: 0.5,    // Increased for smoother transition
                focused: 1.0,
                exiting: 0.25        // Adjusted for better exit fade
            },
            // Blur stages for depth perception
            blurs: {
                far: 5,              // Increased for more dramatic depth
                approaching: 2.5,    // Adjusted for smoother progression
                focused: 0,
                exiting: 4           // Increased for better exit effect
            },
            // Timing - OPTIMIZED for fluid motion
            cardTransitionDuration: 1.0,  // Slightly longer for smoothness
            cardTransitionEase: 'power3.out',  // Smoother easing curve
            sectionLockDuration: '300%', // How long each section is pinned
            visualizerRevealDuration: 0.8,  // Longer for smoother reveals
            ...options
        };

        // Section choreography definitions - maps scroll timeline to actions
        this.sections = [
            {
                id: 'hero',
                selector: '#hero',
                cards: '.signal-card',
                visualizerState: {
                    geometry: 2, // SPHERE - welcoming, organic
                    hue: 180,
                    intensity: 0.8, // ⬆️ DRAMATIC: Much brighter
                    chaos: 0.05, // Calm, welcoming
                    speed: 1.2, // ⬆️ DRAMATIC: Faster movement
                    gridDensity: 25 // ⬆️ DRAMATIC: Denser patterns
                },
                scrollTimeline: [
                    { progress: 0.0, action: 'revealVisualizer', intensity: 0.4 },
                    { progress: 0.15, action: 'cardIntroduction', cardIndex: 0 },
                    { progress: 0.35, action: 'cardIntroduction', cardIndex: 1 },
                    { progress: 0.55, action: 'cardIntroduction', cardIndex: 2 },
                    { progress: 0.75, action: 'occludeAndMorph', nextGeometry: 7 },
                    { progress: 0.9, action: 'sectionExit' }
                ]
            },
            {
                id: 'capabilities',
                selector: '#capabilities',
                cards: '.capability-card',
                visualizerState: {
                    geometry: 7, // CRYSTAL - structured complexity
                    hue: 280,
                    intensity: 0.9, // ⬆️ DRAMATIC: Very bright
                    chaos: 0.3, // ⬆️ DRAMATIC: More energy
                    speed: 1.5, // ⬆️ DRAMATIC: Fast movement
                    gridDensity: 45 // ⬆️ DRAMATIC: Very dense lattice
                },
                scrollTimeline: [
                    { progress: 0.0, action: 'revealVisualizer', intensity: 0.7 },
                    { progress: 0.1, action: 'cardIntroduction', cardIndex: 0 },
                    { progress: 0.25, action: 'cardIntroduction', cardIndex: 1 },
                    { progress: 0.4, action: 'cardIntroduction', cardIndex: 2 },
                    { progress: 0.55, action: 'cardIntroduction', cardIndex: 3 },
                    { progress: 0.7, action: 'occludeAndMorph', nextGeometry: 5 },
                    { progress: 0.85, action: 'sectionExit' }
                ]
            },
            {
                id: 'research',
                selector: '#research',
                cards: '.point', // ✅ FIXED: Use actual .point elements
                visualizerState: {
                    geometry: 5, // FRACTAL - research complexity
                    hue: 200,
                    intensity: 1.0, // ⬆️ DRAMATIC: Maximum brightness
                    chaos: 0.5, // ⬆️ DRAMATIC: Chaotic complexity
                    speed: 1.8, // ⬆️ DRAMATIC: Very fast
                    gridDensity: 60 // ⬆️ DRAMATIC: Extremely dense
                },
                scrollTimeline: [
                    { progress: 0.0, action: 'revealVisualizer', intensity: 0.9 },
                    { progress: 0.2, action: 'cardIntroduction', cardIndex: 0 },
                    { progress: 0.5, action: 'cardIntroduction', cardIndex: 1 },
                    { progress: 0.7, action: 'occludeAndMorph', nextGeometry: 3 },
                    { progress: 0.9, action: 'sectionExit' }
                ]
            },
            {
                id: 'contact',
                selector: '#contact',
                cards: '.contact-actions', // ✅ FIXED: Use actual .contact-actions element
                visualizerState: {
                    geometry: 0, // TETRAHEDRON - foundation/simplicity
                    hue: 240,
                    intensity: 0.6, // DRAMATIC: Moderate
                    chaos: 0.05, // ⬇️ DRAMATIC: Very calm
                    speed: 0.5, // ⬇️ DRAMATIC: Slow, peaceful
                    gridDensity: 10 // ⬇️ DRAMATIC: Sparse, simple
                },
                scrollTimeline: [
                    { progress: 0.0, action: 'revealVisualizer', intensity: 0.5 },
                    { progress: 0.3, action: 'finalFocus' },
                    { progress: 0.7, action: 'fadeToCalm' }
                ]
            }
        ];

        this.triggers = [];
        this.currentSection = 0;

        console.log('🎭 OrthogonalScrollChoreographer initialized with timeline-based choreography');
    }

    /**
     * Initialize all scroll choreography
     */
    initialize() {
        console.log('🎬 Creating orthogonal depth progression system...');

        // Setup 3D perspective on body
        this.setup3DPerspective();

        // Setup visualizer to be behind everything but visible through gaps
        this.setupVisualizerLayering();

        // Create choreography for each section
        this.sections.forEach((section, index) => {
            this.choreographSection(section, index);
        });

        // Setup wheel listener for micro-adjustments
        this.setupWheelResponsiveness();

        console.log('✅ Orthogonal scroll choreography active');
    }

    /**
     * Setup 3D perspective for card depth progression
     */
    setup3DPerspective() {
        // Add perspective to body
        document.body.style.perspective = '1200px';
        document.body.style.perspectiveOrigin = 'center center';

        // Ensure all sections can contain 3D transforms
        this.sections.forEach(section => {
            const element = document.querySelector(section.selector);
            if (element) {
                element.style.transformStyle = 'preserve-3d';
            }
        });

        console.log('🔮 3D perspective enabled (1200px)');
    }

    /**
     * Setup visualizer layering - behind content but visible through gaps
     */
    setupVisualizerLayering() {
        const canvas = document.getElementById('quantum-background');
        if (!canvas) {
            console.warn('⚠️ Quantum background canvas not found');
            return;
        }

        // Set visualizer behind everything
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1'; // Behind all content
        canvas.style.pointerEvents = 'none';

        // Initial smooth fade-in animation
        this.gsap.fromTo(canvas,
            { opacity: 0 },
            {
                opacity: 0.5,
                duration: 2.0,
                ease: 'power2.out',
                onComplete: () => console.log('🌌 Visualizer initial fade-in complete')
            }
        );

        console.log('🌌 Visualizer positioned behind all content');
    }

    /**
     * Choreograph a section with timeline-based scroll mapping
     */
    choreographSection(section, sectionIndex) {
        const element = document.querySelector(section.selector);
        if (!element) {
            console.warn(`Section ${section.id} not found`);
            return;
        }

        const cards = Array.from(element.querySelectorAll(section.cards));

        // Prepare cards for Z-depth animation
        this.prepareCardsForDepth(cards);

        // Create main section timeline
        const mainTimeline = this.gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: 'top top',
                end: `+=${this.config.sectionLockDuration}`,
                pin: true,
                scrub: 1,
                onUpdate: (self) => this.onSectionScroll(section, self.progress, cards),
                onEnter: () => this.onSectionEnter(section, sectionIndex),
                onLeave: () => this.onSectionLeave(section, sectionIndex),
                markers: false
            }
        });

        // Apply scroll timeline actions
        section.scrollTimeline.forEach(timelinePoint => {
            const position = timelinePoint.progress;

            switch (timelinePoint.action) {
                case 'revealVisualizer':
                    mainTimeline.to('#quantum-background', {
                        opacity: timelinePoint.intensity,
                        duration: this.config.visualizerRevealDuration,
                        ease: 'power3.out'
                    }, position);
                    break;

                case 'cardIntroduction':
                    if (cards[timelinePoint.cardIndex]) {
                        this.addCardIntroduction(mainTimeline, cards[timelinePoint.cardIndex], position);
                        // Dim visualizer slightly when card is in focus
                        mainTimeline.to('#quantum-background', {
                            opacity: `-=${0.15}`,  // Relative decrease
                            duration: 0.3,
                            ease: 'sine.inOut'
                        }, position + 0.05);
                        // Boost back after card settles
                        mainTimeline.to('#quantum-background', {
                            opacity: `+=${0.15}`,  // Relative increase
                            duration: 0.3,
                            ease: 'sine.inOut'
                        }, position + 0.15);
                    }
                    break;

                case 'occludeAndMorph':
                    this.addOcclusionAndMorph(mainTimeline, section, timelinePoint.nextGeometry, position);
                    break;

                case 'sectionExit':
                    this.addSectionExit(mainTimeline, cards, position);
                    break;

                case 'finalFocus':
                    this.addFinalFocus(mainTimeline, element, position);
                    break;

                case 'fadeToCalm':
                    this.addFadeToCalm(mainTimeline, position);
                    break;
            }
        });

        this.triggers.push(mainTimeline.scrollTrigger);
        console.log(`📜 Choreographed section: ${section.id} with ${cards.length} cards`);
    }

    /**
     * Prepare cards for 3D depth animation
     */
    prepareCardsForDepth(cards) {
        cards.forEach(card => {
            // Set initial state - VISIBLE and at focused position
            // Cards should be readable by default, animations happen during scroll
            card.style.transformStyle = 'preserve-3d';
            card.style.transform = `translateZ(0px) scale(1.0)`;
            card.style.opacity = '1';
            card.style.filter = `blur(0px)`;

            // GSAP will control animations, disable CSS transitions
            card.style.transition = 'none';
        });
    }

    /**
     * Add card introduction animation - emerge from Z-depth
     * OPTIMIZED for smooth, dramatic entrance
     */
    addCardIntroduction(timeline, card, position) {
        // Phase 1: Approaching (far → approaching)
        timeline.to(card, {
            transform: `translateZ(${this.config.depths.approaching}px) scale(${this.config.scales.approaching})`,
            opacity: this.config.opacities.approaching,
            filter: `blur(${this.config.blurs.approaching}px)`,
            duration: 0.4,  // Longer for smoother motion
            ease: 'power3.out'  // Smoother easing
        }, position);

        // Phase 2: Focused (approaching → focused)
        timeline.to(card, {
            transform: `translateZ(${this.config.depths.focused}px) scale(${this.config.scales.focused})`,
            opacity: this.config.opacities.focused,
            filter: `blur(${this.config.blurs.focused}px)`,
            duration: 0.5,  // Longer for smoother arrival
            ease: 'power3.inOut'  // Smoother easing
        }, position + 0.06);

        // Phase 3: Subtle settle - card gently settles into focus
        timeline.to(card, {
            transform: `translateZ(${this.config.depths.focused}px) scale(${this.config.scales.focused}) rotateY(2deg)`,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut'
        }, position + 0.12);
    }

    /**
     * Add occlusion and morph - visualizer changes during occlusion
     * OPTIMIZED for smooth, dramatic geometry transitions
     */
    addOcclusionAndMorph(timeline, section, nextGeometry, position) {
        if (!this.visualizer || !this.visualizer.params) return;

        const params = this.visualizer.params;

        // Dim visualizer smoothly (occluded by content)
        timeline.to('#quantum-background', {
            opacity: 0.15,  // Dimmer for more dramatic effect
            duration: 0.4,  // Longer fade
            ease: 'power3.in'  // Smoother easing
        }, position);

        // During occlusion, morph geometry with smooth parameters
        timeline.to(params, {
            geometry: nextGeometry,
            morphFactor: 1.0,
            chaos: Math.min(1, params.chaos + 0.15),  // Gentler chaos increase
            duration: 0.6,  // Longer morph duration
            ease: 'power3.inOut',  // Smoother easing
            onUpdate: () => {
                // Smoothly boost density during morph for dramatic effect
                const morphProgress = params.morphFactor || 0;
                params.gridDensity = section.visualizerState.gridDensity * (1 + morphProgress * 0.4);
            }
        }, position + 0.15);

        // Reveal morphed visualizer with smooth fade-in
        timeline.to('#quantum-background', {
            opacity: 0.75,  // Slightly brighter reveal
            duration: 0.5,  // Longer reveal
            ease: 'power3.out'  // Smoother easing
        }, position + 0.6);
    }

    /**
     * Add section exit - cards exit to Z-depth
     */
    addSectionExit(timeline, cards, position) {
        cards.forEach((card, i) => {
            timeline.to(card, {
                transform: `translateZ(${this.config.depths.exiting}px) scale(${this.config.scales.exiting})`,
                opacity: this.config.opacities.exiting,
                filter: `blur(${this.config.blurs.exiting}px)`,
                duration: 0.4,
                ease: 'power2.in'
            }, position + (i * 0.05));
        });
    }

    /**
     * Add final focus for contact section
     */
    addFinalFocus(timeline, element, position) {
        timeline.to(element, {
            scale: 1.05,
            duration: 0.5,
            ease: 'power2.out'
        }, position);
    }

    /**
     * Add fade to calm for ending
     */
    addFadeToCalm(timeline, position) {
        if (!this.visualizer || !this.visualizer.params) return;

        const params = this.visualizer.params;

        timeline.to(params, {
            intensity: 0.3,
            chaos: 0.05,
            speed: 0.4,
            duration: 0.8,
            ease: 'power2.inOut'
        }, position);

        timeline.to('#quantum-background', {
            opacity: 0.3,
            duration: 0.8,
            ease: 'power2.inOut'
        }, position);
    }

    /**
     * Called continuously during section scroll - every movement matters
     */
    onSectionScroll(section, progress, cards) {
        if (!this.visualizer || !this.visualizer.params) return;

        const params = this.visualizer.params;
        const canvas = document.getElementById('quantum-background');

        // Continuous 4D rotation based on scroll
        params.rot4dXW += progress * 0.001;
        params.rot4dYW += progress * 0.0007;
        params.rot4dZW += progress * 0.0005;

        // Use density for depth perception
        const depthFactor = Math.sin(progress * Math.PI);
        params.gridDensity = section.visualizerState.gridDensity * (1 + depthFactor * 0.3);

        // Chaos pulses with scroll
        params.chaos = section.visualizerState.chaos + (Math.sin(progress * Math.PI * 4) * 0.1);

        // DYNAMIC OPACITY: Morph visualizer visibility during scroll
        // When cards are entering/exiting (transitioning), BOOST visualizer
        // When cards are in focus (reading content), DIM visualizer
        if (canvas) {
            // Calculate card focus state
            const cardFocusWave = Math.sin(progress * Math.PI * cards.length); // Oscillates with each card

            // Base opacity from section intensity
            const baseOpacity = section.visualizerState.intensity || 0.5;

            // Modulate opacity: boost during transitions, dim during focus
            // Range: baseOpacity ± 0.25
            const dynamicOpacity = baseOpacity + (cardFocusWave * 0.25);

            // Clamp to reasonable range
            canvas.style.opacity = Math.max(0.2, Math.min(0.9, dynamicOpacity));
        }

        // Cards in focus get subtle parallax
        // Note: Parallax disabled to avoid conflicting with GSAP timeline animations
        // GSAP controls all transform values during scroll
    }

    /**
     * Calculate if card should be in focus based on scroll progress
     */
    getCardFocus(progress, cardIndex, totalCards) {
        const cardProgress = cardIndex / totalCards;
        const distance = Math.abs(progress - cardProgress);
        return Math.max(0, 1 - (distance * 5));
    }

    /**
     * Called when entering a section
     * OPTIMIZED for smooth visualizer state transitions
     * BROADCASTS section state for VIB3+ card hover integration
     */
    onSectionEnter(section, sectionIndex) {
        this.currentSection = sectionIndex;
        console.log(`📍 Entering section: ${section.id}`);

        // 🎯 BROADCAST section state for VIB3+ card interactions to listen
        window.dispatchEvent(new CustomEvent('vib3-section-change', {
            detail: {
                sectionId: section.id,
                sectionIndex: sectionIndex,
                visualizerState: section.visualizerState
            }
        }));

        // Smoothly apply visualizer state with GSAP for animated transition
        if (this.visualizer && this.visualizer.params) {
            const params = this.visualizer.params;

            // Animate each parameter smoothly
            this.gsap.to(params, {
                hue: section.visualizerState.hue,
                intensity: section.visualizerState.intensity,
                chaos: section.visualizerState.chaos,
                speed: section.visualizerState.speed,
                gridDensity: section.visualizerState.gridDensity,
                duration: 1.2,  // Smooth transition duration
                ease: 'power3.inOut'
            });

            // Geometry change happens instantly (handled by timeline)
            params.geometry = section.visualizerState.geometry;
        }

        // Smooth visualizer reveal
        this.gsap.to('#quantum-background', {
            opacity: section.visualizerState.intensity,
            duration: 0.8,
            ease: 'power3.out'
        });
    }

    /**
     * Called when leaving a section
     * OPTIMIZED for smooth transitions between sections
     */
    onSectionLeave(section, sectionIndex) {
        console.log(`👋 Leaving section: ${section.id}`);

        // Smooth dim during section transition
        this.gsap.to('#quantum-background', {
            opacity: 0.25,
            duration: 0.6,
            ease: 'power3.in'
        });
    }

    /**
     * Setup wheel listener for micro-adjustments - every movement matters
     */
    setupWheelResponsiveness() {
        let wheelTimeout;

        window.addEventListener('wheel', (e) => {
            if (!this.visualizer || !this.visualizer.params) return;

            const params = this.visualizer.params;
            const intensity = Math.abs(e.deltaY) / 1000;

            // Immediate response to wheel movement
            params.rot4dXW += e.deltaY * 0.00005;
            params.rot4dYW += e.deltaY * 0.00003;

            // Boost chaos momentarily
            const currentChaos = params.chaos;
            params.chaos = Math.min(1, params.chaos + intensity * 0.1);

            // Decay back to section's base chaos
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                const section = this.sections[this.currentSection];
                if (section) {
                    this.gsap.to(params, {
                        chaos: section.visualizerState.chaos,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            }, 150);
        }, { passive: true });

        console.log('🖱️ Wheel responsiveness enabled - every movement counts');
    }

    /**
     * Cleanup
     */
    dispose() {
        this.triggers.forEach(trigger => trigger.kill());
        this.triggers = [];
    }
}

/**
 * A Paul Phillips Manifestation
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Clear Seas Solutions LLC
 */
