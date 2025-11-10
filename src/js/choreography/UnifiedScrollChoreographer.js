/**
 * UnifiedScrollChoreographer.js
 *
 * GSAP ScrollTrigger-based system that choreographs:
 * - Section locking/pinning
 * - Background geometry morphing
 * - Visualizer parameter animation
 * - Element expansion/bleeding
 *
 * Based on weare-simone.webflow.io scroll choreography
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

export class UnifiedScrollChoreographer {
    constructor(quantumBackground, elementVisualizerManager, options = {}) {
        this.quantumBackground = quantumBackground;
        this.elementManager = elementVisualizerManager;

        this.options = {
            pinDuration: options.pinDuration || '200%', // How long to pin each section
            scrub: options.scrub !== undefined ? options.scrub : 1, // Smooth scrubbing
            ...options
        };

        // Section configurations - maps section to geometry and visual state
        this.sectionConfigs = [
            {
                id: 'hero',
                geometry: 2, // SPHERE - welcoming
                hue: 180,
                intensity: 0.6,
                chaos: 0.1,
                speed: 0.8,
                gridDensity: 20
            },
            {
                id: 'capabilities',
                geometry: 7, // CRYSTAL - structured
                hue: 280,
                intensity: 0.7,
                chaos: 0.2,
                speed: 1.0,
                gridDensity: 30
            },
            {
                id: 'research',
                geometry: 5, // FRACTAL - complexity
                hue: 200,
                intensity: 0.8,
                chaos: 0.4,
                speed: 1.2,
                gridDensity: 40
            },
            {
                id: 'engagement',
                geometry: 3, // TORUS - connectivity
                hue: 320,
                intensity: 0.6,
                chaos: 0.2,
                speed: 0.9,
                gridDensity: 25
            },
            {
                id: 'contact',
                geometry: 0, // TETRAHEDRON - foundation
                hue: 240,
                intensity: 0.5,
                chaos: 0.1,
                speed: 0.7,
                gridDensity: 15
            }
        ];

        this.scrollTriggers = [];
        this.currentSection = 0;

        console.log('🎭 UnifiedScrollChoreographer initialized');
    }

    /**
     * Initialize all scroll triggers
     */
    initialize() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.error('❌ GSAP or ScrollTrigger not loaded!');
            return;
        }

        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;

        console.log('✅ Initializing scroll choreography with GSAP');

        this.sectionConfigs.forEach((config, index) => {
            const element = document.getElementById(config.id);
            if (!element) {
                console.warn(`Section ${config.id} not found`);
                return;
            }

            // Create timeline for this section
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: 'top top',
                    end: `+=${this.options.pinDuration}`,
                    pin: true,
                    scrub: this.options.scrub,
                    onUpdate: (self) => this.onSectionUpdate(index, self.progress),
                    onEnter: () => this.onSectionEnter(index),
                    onLeave: () => this.onSectionLeave(index),
                    markers: false // Set to true for debugging
                }
            });

            // Animate visualizer parameters through the section
            if (this.quantumBackground && this.quantumBackground.visualizer) {
                const viz = this.quantumBackground.visualizer;
                const params = viz.params;

                // Get next section config for smooth transition
                const nextConfig = this.sectionConfigs[index + 1] || config;

                // Animate parameters
                tl.to(params, {
                    geometry: nextConfig.geometry,
                    hue: nextConfig.hue,
                    intensity: nextConfig.intensity,
                    chaos: nextConfig.chaos,
                    speed: nextConfig.speed,
                    gridDensity: nextConfig.gridDensity,
                    duration: 1,
                    ease: 'power2.inOut'
                }, 0);

                // Animate 4D rotations
                tl.to(params, {
                    rot4dXW: `+=${Math.PI * 2}`,
                    rot4dYW: `+=${Math.PI * 1.5}`,
                    rot4dZW: `+=${Math.PI}`,
                    duration: 1,
                    ease: 'none'
                }, 0);
            }

            this.scrollTriggers.push(tl.scrollTrigger);

            console.log(`📜 ScrollTrigger created for ${config.id}`);
        });

        // Listen for scroll wheel for micro-adjustments
        this.setupWheelListener();

        console.log('✅ Scroll choreography initialized');
    }

    /**
     * Setup wheel listener for micro-adjustments
     */
    setupWheelListener() {
        let wheelTimeout;

        window.addEventListener('wheel', (e) => {
            if (!this.quantumBackground || !this.quantumBackground.visualizer) return;

            const viz = this.quantumBackground.visualizer;
            const params = viz.params;

            // Add subtle rotation based on wheel delta
            const intensity = Math.abs(e.deltaY) / 100;
            params.rot4dXW += e.deltaY * 0.0001;
            params.rot4dYW += e.deltaY * 0.00007;
            params.chaos = Math.min(1, params.chaos + intensity * 0.01);

            // Decay chaos back to base
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                const config = this.sectionConfigs[this.currentSection];
                if (config) {
                    const targetChaos = config.chaos;
                    const diff = targetChaos - params.chaos;
                    params.chaos += diff * 0.1;
                }
            }, 100);
        }, { passive: true });
    }

    /**
     * Called when section updates (during scroll)
     */
    onSectionUpdate(sectionIndex, progress) {
        const config = this.sectionConfigs[sectionIndex];
        const nextConfig = this.sectionConfigs[sectionIndex + 1];

        if (!config || !this.quantumBackground || !this.quantumBackground.visualizer) return;

        const viz = this.quantumBackground.visualizer;

        // Morph factor based on progress (0 = current geometry, 1 = next geometry)
        viz.params.morphFactor = progress;

        // Animate element visualizers to expand/contract
        this.animateElementVisualizers(progress, config, nextConfig);
    }

    /**
     * Animate element visualizers to expand/bleed with scroll
     */
    animateElementVisualizers(progress, currentConfig, nextConfig) {
        if (!this.elementManager || !this.elementManager.visualizers) return;

        this.elementManager.visualizers.forEach((vizData, id) => {
            const { visualizer, canvas } = vizData;

            // Pulse effect based on scroll progress
            const pulse = Math.sin(progress * Math.PI);

            // Match background hue
            if (nextConfig) {
                visualizer.params.hue = currentConfig.hue + (nextConfig.hue - currentConfig.hue) * progress;
            }

            // Pulsing intensity
            visualizer.params.intensity = currentConfig.intensity + pulse * 0.2;

            // Scale canvas for "bleeding" effect
            const scale = 1 + pulse * 0.1;
            canvas.style.transform = `scale(${scale})`;
        });
    }

    /**
     * Called when entering a section
     */
    onSectionEnter(sectionIndex) {
        this.currentSection = sectionIndex;
        const config = this.sectionConfigs[sectionIndex];

        console.log(`📍 Entering section: ${config.id} (geometry: ${config.geometry})`);

        // Trigger element visualizer activation
        if (this.elementManager) {
            this.elementManager.visualizers.forEach((vizData) => {
                vizData.canvas.style.opacity = '0.6';
                vizData.canvas.style.transition = 'opacity 0.5s ease';
            });
        }
    }

    /**
     * Called when leaving a section
     */
    onSectionLeave(sectionIndex) {
        const config = this.sectionConfigs[sectionIndex];
        console.log(`👋 Leaving section: ${config.id}`);
    }

    /**
     * Cleanup
     */
    dispose() {
        this.scrollTriggers.forEach(st => st.kill());
        this.scrollTriggers = [];
    }
}

/**
 * A Paul Phillips Manifestation
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Clear Seas Solutions LLC
 */
