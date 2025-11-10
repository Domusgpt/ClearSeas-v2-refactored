/**
 * DetailedScrollChoreographer.js
 *
 * Card-by-card, element-by-element scroll choreography
 * Every scroll position has visible animations
 * Background morphs and bleeds into elements
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

export class DetailedScrollChoreographer {
    constructor(backgroundWrapper, elementManager) {
        this.visualizer = backgroundWrapper ? backgroundWrapper.visualizer : null;
        this.elementManager = elementManager;
        this.gsap = window.gsap;
        this.ScrollTrigger = window.ScrollTrigger;

        if (!this.gsap || !this.ScrollTrigger) {
            console.error('❌ GSAP/ScrollTrigger not loaded');
            return;
        }

        this.gsap.registerPlugin(this.ScrollTrigger);
        this.triggers = [];

        console.log('🎬 DetailedScrollChoreographer ready');
    }

    initialize() {
        console.log('🎬 Creating detailed scroll choreography...');

        // Hero section - initial state
        this.choreographHero();

        // Animate each capability card
        this.choreographCapabilities();

        // Research section
        this.choreographResearch();

        // Contact section
        this.choreographContact();

        // Background continuous animation
        this.animateBackgroundContinuously();

        console.log('✅ Scroll choreography active');
    }

    choreographHero() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        // Pin hero section
        this.gsap.to(hero, {
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '+=100%',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    // Background starts SPHERE, morphs to more chaotic
                    if (this.visualizer && this.visualizer.params) {
                        const viz = this.visualizer.params;
                        viz.chaos = 0.1 + self.progress * 0.3;
                        viz.intensity = 0.5 + self.progress * 0.3;
                        viz.rot4dXW += 0.001;
                        viz.rot4dYW += 0.0007;
                    }
                }
            }
        });

        // Animate hero cards one by one
        const cards = hero.querySelectorAll('.signal-card');
        cards.forEach((card, i) => {
            this.gsap.fromTo(card,
                {
                    opacity: 0,
                    y: 100,
                    scale: 0.8
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: '+=50%',
                        scrub: 1
                    },
                    delay: i * 0.2
                }
            );

            // Card visualizer bleeds in
            this.animateCardVisualizer(card, i);
        });
    }

    choreographCapabilities() {
        const section = document.getElementById('capabilities');
        if (!section) return;

        // Pin capabilities section
        this.gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=200%',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    // Morph to CRYSTAL geometry
                    if (this.visualizer && this.visualizer.params) {
                        const viz = this.visualizer.params;
                        viz.geometry = 2 + (self.progress * 5); // Morph from SPHERE(2) to CRYSTAL(7)
                        viz.morphFactor = self.progress;
                        viz.hue = 180 + self.progress * 100; // Shift hue
                        viz.gridDensity = 20 + self.progress * 20;
                        viz.rot4dZW += 0.002;
                    }
                }
            }
        });

        // Animate each capability card
        const cards = section.querySelectorAll('.capability-card');
        cards.forEach((card, i) => {
            const progress = i / cards.length;

            // Stagger card entrance
            this.gsap.fromTo(card,
                {
                    opacity: 0,
                    x: -100,
                    rotationY: -15,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    x: 0,
                    rotationY: 0,
                    scale: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: `top+=${progress * 50}% top`,
                        end: `top+=${progress * 50 + 30}% top`,
                        scrub: 1
                    }
                }
            );

            // Focus effect when card is in center
            this.gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                    onEnter: () => this.focusCard(card),
                    onLeave: () => this.unfocusCard(card),
                    onEnterBack: () => this.focusCard(card),
                    onLeaveBack: () => this.unfocusCard(card)
                }
            });

            // Bleed visualizer into card
            this.animateCardVisualizer(card, i);
        });
    }

    choreographResearch() {
        const section = document.getElementById('research');
        if (!section) return;

        this.gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=150%',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    // Morph to FRACTAL
                    if (this.visualizer && this.visualizer.params) {
                        const viz = this.visualizer.params;
                        viz.geometry = 5; // FRACTAL
                        viz.chaos = 0.3 + self.progress * 0.4;
                        viz.hue = 200 + self.progress * 60;
                        viz.intensity = 0.7 + self.progress * 0.2;
                        viz.rot4dXW += 0.003;
                    }
                }
            }
        });

        // Animate research content
        const cards = section.querySelectorAll('.card, .signal-card');
        cards.forEach((card, i) => {
            this.gsap.fromTo(card,
                {
                    opacity: 0,
                    scale: 0.8,
                    rotationX: 20
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotationX: 0,
                    scrollTrigger: {
                        trigger: section,
                        start: `top+=${i * 20}% top`,
                        end: `top+=${i * 20 + 40}% top`,
                        scrub: 1
                    }
                }
            );

            this.animateCardVisualizer(card, i);
        });
    }

    choreographContact() {
        const section = document.getElementById('contact');
        if (!section) return;

        this.gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=100%',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    // Final calm state - TETRAHEDRON
                    if (this.visualizer && this.visualizer.params) {
                        const viz = this.visualizer.params;
                        viz.geometry = 0; // TETRAHEDRON
                        viz.chaos = 0.4 - self.progress * 0.3; // Calm down
                        viz.hue = 240;
                        viz.intensity = 0.8 - self.progress * 0.3;
                        viz.rot4dYW += 0.001;
                    }
                }
            }
        });
    }

    focusCard(card) {
        // Scale up, boost visualizer
        this.gsap.to(card, {
            scale: 1.05,
            z: 50,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Boost card visualizer
        const vizId = card.dataset.vizId;
        if (vizId && this.elementManager && this.elementManager.visualizers) {
            const vizData = this.elementManager.visualizers.get(vizId);
            if (vizData) {
                vizData.visualizer.params.intensity = 0.8;
                vizData.canvas.style.opacity = '0.7';
            }
        }
    }

    unfocusCard(card) {
        this.gsap.to(card, {
            scale: 1,
            z: 0,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Dim card visualizer
        const vizId = card.dataset.vizId;
        if (vizId && this.elementManager && this.elementManager.visualizers) {
            const vizData = this.elementManager.visualizers.get(vizId);
            if (vizData) {
                vizData.visualizer.params.intensity = 0.4;
                vizData.canvas.style.opacity = '0.3';
            }
        }
    }

    animateCardVisualizer(card, index) {
        const vizId = card.dataset.vizId;
        if (!vizId || !this.elementManager || !this.elementManager.visualizers) return;

        const vizData = this.elementManager.visualizers.get(vizId);
        if (!vizData) return;

        // Animate visualizer bleeding from background
        this.gsap.to(vizData.canvas, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                onUpdate: (self) => {
                    // Sync with background
                    if (this.visualizer && this.visualizer.params) {
                        const bgViz = this.visualizer.params;
                        vizData.visualizer.params.hue = bgViz.hue;
                        vizData.visualizer.params.geometry = bgViz.geometry;

                        // Pulsing with scroll
                        const pulse = Math.sin(self.progress * Math.PI * 2);
                        vizData.visualizer.params.intensity = 0.4 + pulse * 0.2;
                        vizData.canvas.style.transform = `scale(${1 + pulse * 0.05})`;
                    }
                }
            }
        });
    }

    animateBackgroundContinuously() {
        if (!this.visualizer || !this.visualizer.params) return;

        const viz = this.visualizer.params;

        // Continuous rotation
        this.gsap.to(viz, {
            rot4dXW: `+=${Math.PI * 4}`,
            rot4dYW: `+=${Math.PI * 3}`,
            rot4dZW: `+=${Math.PI * 2}`,
            duration: 60,
            repeat: -1,
            ease: 'none'
        });

        // Breathing intensity
        this.gsap.to(viz, {
            intensity: '+=0.2',
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    dispose() {
        this.ScrollTrigger.getAll().forEach(st => st.kill());
    }
}

/**
 * A Paul Phillips Manifestation
 * © 2025 Clear Seas Solutions LLC
 */
