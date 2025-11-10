/**
 * ScrollLockSystem.js
 *
 * Implements weare-simone.webflow.io style scroll choreography:
 * - Scroll-locked sections with visual morphing
 * - GSAP ScrollTrigger integration
 * - Smooth section-to-section transitions
 * - Coordinates with visualizer system
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

// GSAP loaded from CDN in index.html
// Access via window.gsap and window.ScrollTrigger
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
}

export class ScrollLockSystem {
    constructor(visualOrchestrator, options = {}) {
        this.orchestrator = visualOrchestrator;
        this.sections = [];
        this.currentSection = null;
        this.options = {
            pinDuration: options.pinDuration || 1, // How long to pin (in scroll distance)
            ease: options.ease || 'power2.out',
            visualMorphDuration: options.visualMorphDuration || 0.8,
            ...options
        };

        this.initialized = false;
    }

    /**
     * Initialize scroll-locked sections
     */
    initialize() {
        if (this.initialized) return;

        // Find all sections with scroll-lock behavior
        const sectionElements = document.querySelectorAll('[data-scroll-lock]');

        sectionElements.forEach((element, index) => {
            this.createScrollTrigger(element, index);
        });

        this.initialized = true;
        console.log(`🔒 ScrollLockSystem initialized with ${sectionElements.length} locked sections`);
    }

    /**
     * Create GSAP ScrollTrigger for a section
     */
    createScrollTrigger(element, index) {
        const sectionData = {
            element,
            index,
            geometry: parseInt(element.dataset.geometry) || index % 8, // Which 4D geometry
            colorMode: element.dataset.colorMode || 'auto', // light/dark/auto
            trigger: null,
            timeline: null
        };

        // Create timeline for this section's visual evolution
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: 'top 2%', // Match weare-simone
                end: 'bottom 2%',
                pin: false, // We'll handle pinning with CSS
                scrub: 1, // Smooth scrubbing
                onEnter: () => this.onSectionEnter(sectionData),
                onLeave: () => this.onSectionLeave(sectionData),
                onEnterBack: () => this.onSectionEnter(sectionData),
                onLeaveBack: () => this.onSectionLeave(sectionData),
                onUpdate: (self) => this.onSectionUpdate(sectionData, self.progress)
            }
        });

        // Animate visualizer parameters based on scroll progress
        timeline
            .to({}, {
                duration: 1,
                onUpdate: () => {
                    // Drive visualizer morphing through scroll
                    const progress = timeline.progress();
                    this.updateVisualizerForSection(sectionData, progress);
                }
            });

        sectionData.timeline = timeline;
        sectionData.trigger = timeline.scrollTrigger;

        this.sections.push(sectionData);
    }

    /**
     * Section enter callback
     */
    onSectionEnter(sectionData) {
        console.log(`🎯 Entering section ${sectionData.index}: geometry ${sectionData.geometry}`);
        this.currentSection = sectionData;

        // Tell choreographer to target this section's geometry
        const choreographer = this.orchestrator.getChoreographer();
        if (choreographer) {
            choreographer.jumpToSection(this.getSectionName(sectionData.index));
        }

        // Trigger section mode change
        this.updateSectionMode(sectionData);
    }

    /**
     * Section leave callback
     */
    onSectionLeave(sectionData) {
        console.log(`👋 Leaving section ${sectionData.index}`);
    }

    /**
     * Section scroll progress update
     */
    onSectionUpdate(sectionData, progress) {
        // Update visualizer parameters smoothly based on scroll position
        this.updateVisualizerForSection(sectionData, progress);
    }

    /**
     * Update visualizer for section based on scroll progress
     */
    updateVisualizerForSection(sectionData, progress) {
        const choreographer = this.orchestrator.getChoreographer();
        if (!choreographer) return;

        // Get current state from choreographer
        const state = choreographer.currentState;

        // Modify based on section progress
        // Early in section (0-0.3): Entering geometry
        // Mid section (0.3-0.7): Stable, showcase geometry
        // Late section (0.7-1.0): Transitioning to next

        if (progress < 0.3) {
            // Entering: Increase intensity and morphing
            const enterProgress = progress / 0.3;
            state.intensity = 0.5 + enterProgress * 0.3;
            state.morphFactor = 1.0 + enterProgress * 0.5;
            state.chaos = 0.1 + enterProgress * 0.2;
        } else if (progress < 0.7) {
            // Mid-section: Stable showcase
            state.intensity = 0.8;
            state.morphFactor = 1.5;
            state.chaos = 0.3;
        } else {
            // Exiting: Transition to next geometry
            const exitProgress = (progress - 0.7) / 0.3;
            state.intensity = 0.8 - exitProgress * 0.3;
            state.morphFactor = 1.5 + exitProgress * 0.5;
            state.chaos = 0.3 + exitProgress * 0.3;

            // Start morphing to next geometry
            const nextGeometry = (sectionData.geometry + 1) % 8;
            state.geometry = sectionData.geometry + (exitProgress * 0.5); // Smooth interpolation
        }

        // Apply dramatic 4D rotations based on progress
        state.rot4dXW = progress * Math.PI * 2;
        state.rot4dYW = progress * Math.PI * 1.5;
        state.rot4dZW = progress * Math.PI;
    }

    /**
     * Update section color mode (light/dark propagation)
     */
    updateSectionMode(sectionData) {
        const element = sectionData.element;
        const mode = sectionData.colorMode;

        // Add section-mode attribute for CSS cascading
        element.setAttribute('section-mode', mode === 'dark' ? '2' : '1');

        // Propagate to choreographer for hue shifts
        const choreographer = this.orchestrator.getChoreographer();
        if (!choreographer) return;

        const state = choreographer.currentState;
        if (mode === 'dark') {
            state.hue = (state.hue + 180) % 360; // Shift hue for dark mode
            state.saturation = 0.6; // Desaturate slightly
        } else {
            state.saturation = 0.9; // Full saturation for light mode
        }
    }

    /**
     * Get section name by index
     */
    getSectionName(index) {
        const sectionNames = ['hero', 'signals', 'capabilities', 'research', 'platforms', 'contact'];
        return sectionNames[index] || 'hero';
    }

    /**
     * Refresh all ScrollTriggers (call after DOM changes)
     */
    refresh() {
        ScrollTrigger.refresh();
    }

    /**
     * Kill all ScrollTriggers
     */
    dispose() {
        this.sections.forEach(section => {
            if (section.trigger) {
                section.trigger.kill();
            }
        });
        this.sections = [];
        this.initialized = false;
    }
}

/**
 * A Paul Phillips Manifestation
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Clear Seas Solutions LLC
 */
