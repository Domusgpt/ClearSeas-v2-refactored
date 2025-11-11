/**
 * AvantGardeScrollChoreographer - Elongated Parallax Card Experience
 * Mobile-first portrait cards that split, morph, and blend with visualizers
 * © 2025 Clear Seas Solutions LLC
 */

export class AvantGardeScrollChoreographer {
    constructor(gsap, ScrollTrigger, visualizer) {
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this.visualizer = visualizer;
        this.cards = [];
        this.activeCardIndex = -1;

        console.log('🎨 AvantGardeScrollChoreographer initialized');
    }

    /**
     * Setup elongated scroll experience with card choreography
     */
    setupElongatedScroll() {
        console.log('🎭 Setting up elongated scroll choreography...');

        // Get all cards
        this.cards = Array.from(document.querySelectorAll('.avant-card'));

        if (!this.cards.length) {
            console.warn('⚠️ No .avant-card elements found');
            return;
        }

        console.log(`📇 Found ${this.cards.length} avant-garde cards`);

        // Setup each card with its own elongated section
        this.cards.forEach((card, index) => {
            this.setupCardChoreography(card, index);
        });

        // Setup visualizer morphing between cards
        this.setupVisualizerMorphing();

        console.log('✅ Elongated scroll choreography ready');
    }

    /**
     * Setup individual card choreography
     * Each card gets 200vh of scroll space (2 full screens)
     */
    setupCardChoreography(card, index) {
        const cardData = this.getCardData(card);

        // Create scroll timeline for this card (200vh total)
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',      // Start when card enters bottom of viewport
                end: 'bottom top',        // End when card leaves top of viewport
                scrub: 1,                 // Smooth scrubbing
                pin: false,
                markers: false,
                onEnter: () => this.onCardEnter(card, index, cardData),
                onLeave: () => this.onCardLeave(card, index),
                onEnterBack: () => this.onCardEnter(card, index, cardData),
                onLeaveBack: () => this.onCardLeave(card, index),
                onUpdate: (self) => this.onCardUpdate(card, index, self.progress, cardData)
            }
        });

        // Phase 1: Card Enter & Expand (0-30% of scroll)
        tl.fromTo(card,
            {
                scale: 0.8,
                opacity: 0,
                rotationX: 15,
                y: 100
            },
            {
                scale: 1,
                opacity: 1,
                rotationX: 0,
                y: 0,
                duration: 0.3,
                ease: 'power3.out'
            },
            0
        );

        // Phase 2: Card Split & Parallax (30-70% of scroll)
        const cardContent = card.querySelector('.avant-card__content');
        const cardVisual = card.querySelector('.avant-card__visual');
        const cardTitle = card.querySelector('.avant-card__title');
        const cardText = card.querySelector('.avant-card__text');

        if (cardContent && cardVisual) {
            // Split: Content moves left, Visual moves right
            tl.to(cardContent, {
                x: () => window.innerWidth < 768 ? -20 : -50,
                duration: 0.4,
                ease: 'power2.inOut'
            }, 0.3);

            tl.to(cardVisual, {
                x: () => window.innerWidth < 768 ? 20 : 50,
                scale: 1.1,
                duration: 0.4,
                ease: 'power2.inOut'
            }, 0.3);
        }

        // Phase 3: Text Morphing (40-60% of scroll)
        if (cardTitle) {
            tl.to(cardTitle, {
                letterSpacing: '0.2em',
                scale: 1.05,
                duration: 0.2,
                ease: 'power1.inOut',
                yoyo: true,
                repeat: 1
            }, 0.4);
        }

        if (cardText) {
            tl.to(cardText, {
                opacity: 0.7,
                y: -10,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            }, 0.4);
        }

        // Phase 4: Card Exit & Compress (70-100% of scroll)
        tl.to(card, {
            scale: 0.9,
            opacity: 0.5,
            rotationX: -10,
            y: -50,
            duration: 0.3,
            ease: 'power3.in'
        }, 0.7);

        // Store timeline
        card._scrollTimeline = tl;
    }

    /**
     * Get card-specific data for visualizer morphing
     */
    getCardData(card) {
        return {
            hue: parseInt(card.dataset.cardHue) || 180,
            geometry: parseInt(card.dataset.cardGeometry) || 2,
            intensity: parseFloat(card.dataset.cardIntensity) || 0.7,
            chaos: parseFloat(card.dataset.cardChaos) || 0.3,
            speed: parseFloat(card.dataset.cardSpeed) || 1.0,
            gridDensity: parseInt(card.dataset.cardGrid) || 30,
            morphStyle: card.dataset.cardMorphStyle || 'blend' // blend, snap, wave
        };
    }

    /**
     * When card enters viewport
     */
    onCardEnter(card, index, cardData) {
        console.log(`📇 Card ${index} entering: ${card.dataset.cardTitle || 'Untitled'}`);
        this.activeCardIndex = index;

        // Trigger visualizer morph
        this.morphVisualizerToCard(cardData, 'enter');

        // Add active class
        card.classList.add('avant-card--active');
    }

    /**
     * When card leaves viewport
     */
    onCardLeave(card, index) {
        console.log(`📇 Card ${index} leaving`);
        card.classList.remove('avant-card--active');
    }

    /**
     * Update during card scroll
     */
    onCardUpdate(card, index, progress, cardData) {
        // Continuous visualizer morphing based on scroll progress
        if (this.activeCardIndex === index) {
            this.updateVisualizerProgress(cardData, progress);
        }
    }

    /**
     * Morph visualizer to match card
     */
    morphVisualizerToCard(cardData, transitionType = 'blend') {
        if (!this.visualizer || !this.visualizer.updateParameters) {
            return;
        }

        const duration = transitionType === 'snap' ? 0.3 : 1.5;

        // Morph visualizer parameters
        this.gsap.to(this.visualizer.state || {}, {
            hue: cardData.hue,
            intensity: cardData.intensity,
            chaos: cardData.chaos,
            speed: cardData.speed,
            gridDensity: cardData.gridDensity,
            duration: duration,
            ease: transitionType === 'wave' ? 'sine.inOut' : 'power2.inOut',
            onUpdate: () => {
                if (this.visualizer.updateParameters) {
                    this.visualizer.updateParameters(this.visualizer.state);
                }
            }
        });

        // Morph geometry if supported
        if (this.visualizer.setGeometry && cardData.geometry !== undefined) {
            this.visualizer.setGeometry(cardData.geometry);
        }

        console.log(`🎨 Visualizer morphing to card style: hue=${cardData.hue}, geometry=${cardData.geometry}`);
    }

    /**
     * Update visualizer based on scroll progress through card
     */
    updateVisualizerProgress(cardData, progress) {
        if (!this.visualizer || !this.visualizer.updateParameters) {
            return;
        }

        // Create wave effect in middle of card scroll
        const wave = Math.sin(progress * Math.PI);

        // Pulsing intensity during scroll
        const dynamicIntensity = cardData.intensity + (wave * 0.2);

        // Varying chaos
        const dynamicChaos = cardData.chaos + (wave * 0.15);

        if (this.visualizer.state) {
            this.visualizer.state.intensity = dynamicIntensity;
            this.visualizer.state.chaos = dynamicChaos;

            if (this.visualizer.updateParameters) {
                this.visualizer.updateParameters(this.visualizer.state);
            }
        }
    }

    /**
     * Setup global visualizer morphing system
     */
    setupVisualizerMorphing() {
        console.log('🌊 Setting up visualizer morphing system...');

        // Create global morph timeline based on overall scroll
        const sections = document.querySelectorAll('section[data-visualizer-state]');

        sections.forEach((section, index) => {
            this.ScrollTrigger.create({
                trigger: section,
                start: 'top 50%',
                end: 'bottom 50%',
                onEnter: () => {
                    const state = this.getSectionVisualizerState(section);
                    this.morphVisualizerToCard(state, 'blend');
                },
                onEnterBack: () => {
                    const state = this.getSectionVisualizerState(section);
                    this.morphVisualizerToCard(state, 'blend');
                }
            });
        });

        console.log('✅ Visualizer morphing system ready');
    }

    /**
     * Get visualizer state from section data attributes
     */
    getSectionVisualizerState(section) {
        return {
            hue: parseInt(section.dataset.vizHue) || 180,
            geometry: parseInt(section.dataset.vizGeometry) || 2,
            intensity: parseFloat(section.dataset.vizIntensity) || 0.7,
            chaos: parseFloat(section.dataset.vizChaos) || 0.3,
            speed: parseFloat(section.dataset.vizSpeed) || 1.0,
            gridDensity: parseInt(section.dataset.vizGrid) || 30
        };
    }

    /**
     * Add parallax depth to card layers
     */
    addParallaxDepth(card) {
        const layers = card.querySelectorAll('[data-parallax-depth]');

        layers.forEach((layer) => {
            const depth = parseFloat(layer.dataset.parallaxDepth) || 1;

            this.gsap.to(layer, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                },
                y: () => -100 * depth,
                ease: 'none'
            });
        });
    }
}
