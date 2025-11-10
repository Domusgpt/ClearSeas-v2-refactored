/**
 * ScrollChoreographer.js
 *
 * Maps scroll position to visual states with smooth interpolation
 * Inspired by VIB3+ Engine and weare-simone.webflow.io parallax system
 *
 * Creates choreographed transitions between section-specific visualizer states
 * with velocity-based dynamics and emergent morphing
 *
 * REFACTORED: Now integrates with MicroScrollChoreographer for per-tick responsiveness
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

import { MicroScrollChoreographer } from './MicroScrollChoreographer.js';

export class ScrollChoreographer {
    constructor(options = {}) {
        this.sections = options.sections || this.getDefaultSections();
        this.currentState = this.createEmptyState();
        this.targetState = this.createEmptyState();
        this.scrollPosition = 0;
        this.scrollVelocity = 0;
        this.lastScrollPosition = 0;
        this.lastUpdateTime = performance.now();

        // Interpolation settings
        this.lerpSpeed = options.lerpSpeed || 0.08;
        this.velocityInfluence = options.velocityInfluence || 0.5;
        this.maxVelocity = options.maxVelocity || 50;

        // Section transition zones (percentage of section height for blending)
        this.transitionZone = options.transitionZone || 0.3;

        // Scroll state tracking
        this.currentSectionIndex = 0;
        this.sectionProgress = 0; // 0-1 within current section
        this.transitionProgress = 0; // 0-1 for inter-section blending

        // MicroScrollChoreographer integration
        this.microChoreographer = new MicroScrollChoreographer({
            bufferSize: 10,
            rotationSensitivity: options.microRotationSensitivity || 0.001,
            chaosSensitivity: options.microChaosSensitivity || 0.01,
            morphSensitivity: options.microMorphSensitivity || 0.0001
        });

        this.initialize();
    }

    initialize() {
        // Calculate section boundaries from DOM
        this.updateSectionBoundaries();

        // Set initial state
        this.updateScrollPosition(window.scrollY);

        // Listen for resize to recalculate boundaries
        window.addEventListener('resize', () => {
            this.updateSectionBoundaries();
        }, { passive: true });
    }

    /**
     * Define default visual states for each page section
     * Each section has specific geometry, rotations, morphing, and colors
     */
    getDefaultSections() {
        return [
            {
                name: 'hero',
                selector: '.hero-section, #hero',
                states: {
                    enter: {
                        geometry: 2,        // SPHERE - welcoming, harmonious
                        gridDensity: 25,
                        morphFactor: 1.0,
                        chaos: 0.1,
                        speed: 0.8,
                        hue: 200,          // Blue - trust, clarity
                        intensity: 0.6,
                        saturation: 0.7,
                        rot4dXY: 0.0,
                        rot4dXZ: 0.0,
                        rot4dYZ: 0.0,
                        rot4dXW: 0.3,
                        rot4dYW: 0.2,
                        rot4dZW: 0.1
                    },
                    progress: {
                        geometry: 2,        // Stay SPHERE
                        gridDensity: 35,    // Increase detail
                        morphFactor: 1.3,   // More morphing
                        chaos: 0.2,
                        speed: 1.0,
                        hue: 210,          // Shift to deeper blue
                        intensity: 0.7,
                        saturation: 0.8,
                        rot4dXW: 0.5,      // Increase 4D rotation
                        rot4dYW: 0.4,
                        rot4dZW: 0.3
                    },
                    exit: {
                        geometry: 3,        // Transition to TORUS
                        gridDensity: 40,
                        morphFactor: 1.5,
                        chaos: 0.3,
                        speed: 1.2,
                        hue: 220,
                        intensity: 0.8,
                        saturation: 0.85,
                        rot4dXW: 0.7,
                        rot4dYW: 0.6,
                        rot4dZW: 0.5
                    }
                }
            },
            {
                name: 'signals',
                selector: '#signals-section, .signals',
                states: {
                    enter: {
                        geometry: 3,        // TORUS - flow, connectivity
                        gridDensity: 40,
                        morphFactor: 1.5,
                        chaos: 0.3,
                        speed: 1.3,
                        hue: 260,          // Purple - innovation
                        intensity: 0.7,
                        saturation: 0.85,
                        rot4dXY: 0.2,
                        rot4dXZ: 0.1,
                        rot4dYZ: 0.15,
                        rot4dXW: 0.7,
                        rot4dYW: 0.6,
                        rot4dZW: 0.5
                    },
                    progress: {
                        geometry: 6,        // WAVE - signal propagation
                        gridDensity: 50,
                        morphFactor: 1.7,
                        chaos: 0.4,
                        speed: 1.6,
                        hue: 270,
                        intensity: 0.8,
                        saturation: 0.9,
                        rot4dXY: 0.3,
                        rot4dXZ: 0.2,
                        rot4dYZ: 0.25,
                        rot4dXW: 1.0,
                        rot4dYW: 0.9,
                        rot4dZW: 0.8
                    },
                    exit: {
                        geometry: 5,        // FRACTAL - complexity
                        gridDensity: 60,
                        morphFactor: 1.9,
                        chaos: 0.5,
                        speed: 1.8,
                        hue: 280,
                        intensity: 0.85,
                        saturation: 0.95,
                        rot4dXW: 1.2,
                        rot4dYW: 1.1,
                        rot4dZW: 1.0
                    }
                }
            },
            {
                name: 'capabilities',
                selector: '#capabilities-section, .capabilities',
                states: {
                    enter: {
                        geometry: 7,        // CRYSTAL - structure, precision
                        gridDensity: 60,
                        morphFactor: 1.2,
                        chaos: 0.2,
                        speed: 1.0,
                        hue: 180,          // Cyan - technology
                        intensity: 0.8,
                        saturation: 0.9,
                        rot4dXY: 0.4,
                        rot4dXZ: 0.3,
                        rot4dYZ: 0.35,
                        rot4dXW: 0.8,
                        rot4dYW: 0.7,
                        rot4dZW: 0.6
                    },
                    progress: {
                        geometry: 1,        // HYPERCUBE - multi-dimensional capability
                        gridDensity: 70,
                        morphFactor: 1.4,
                        chaos: 0.3,
                        speed: 1.2,
                        hue: 190,
                        intensity: 0.85,
                        saturation: 0.92,
                        rot4dXY: 0.5,
                        rot4dXZ: 0.4,
                        rot4dYZ: 0.45,
                        rot4dXW: 1.1,
                        rot4dYW: 1.0,
                        rot4dZW: 0.9
                    },
                    exit: {
                        geometry: 0,        // TETRAHEDRON - foundation
                        gridDensity: 80,
                        morphFactor: 1.6,
                        chaos: 0.4,
                        speed: 1.4,
                        hue: 200,
                        intensity: 0.9,
                        saturation: 0.95,
                        rot4dXW: 1.3,
                        rot4dYW: 1.2,
                        rot4dZW: 1.1
                    }
                }
            },
            {
                name: 'research',
                selector: '#research-section, .research',
                states: {
                    enter: {
                        geometry: 5,        // FRACTAL - recursive discovery
                        gridDensity: 70,
                        morphFactor: 1.8,
                        chaos: 0.6,
                        speed: 1.5,
                        hue: 140,          // Green - growth, insight
                        intensity: 0.75,
                        saturation: 0.85,
                        rot4dXY: 0.6,
                        rot4dXZ: 0.5,
                        rot4dYZ: 0.55,
                        rot4dXW: 1.0,
                        rot4dYW: 0.9,
                        rot4dZW: 0.8
                    },
                    progress: {
                        geometry: 4,        // KLEIN BOTTLE - non-orientable complexity
                        gridDensity: 85,
                        morphFactor: 2.0,
                        chaos: 0.7,
                        speed: 1.7,
                        hue: 150,
                        intensity: 0.85,
                        saturation: 0.9,
                        rot4dXY: 0.7,
                        rot4dXZ: 0.6,
                        rot4dYZ: 0.65,
                        rot4dXW: 1.4,
                        rot4dYW: 1.3,
                        rot4dZW: 1.2
                    },
                    exit: {
                        geometry: 6,        // WAVE - knowledge propagation
                        gridDensity: 90,
                        morphFactor: 1.8,
                        chaos: 0.6,
                        speed: 1.9,
                        hue: 160,
                        intensity: 0.9,
                        saturation: 0.95,
                        rot4dXW: 1.5,
                        rot4dYW: 1.4,
                        rot4dZW: 1.3
                    }
                }
            },
            {
                name: 'platforms',
                selector: '#platforms-section, .platforms',
                states: {
                    enter: {
                        geometry: 1,        // HYPERCUBE - interconnected systems
                        gridDensity: 80,
                        morphFactor: 1.5,
                        chaos: 0.4,
                        speed: 1.3,
                        hue: 40,           // Orange - energy, connectivity
                        intensity: 0.8,
                        saturation: 0.9,
                        rot4dXY: 0.8,
                        rot4dXZ: 0.7,
                        rot4dYZ: 0.75,
                        rot4dXW: 1.2,
                        rot4dYW: 1.1,
                        rot4dZW: 1.0
                    },
                    progress: {
                        geometry: 3,        // TORUS - platform flow
                        gridDensity: 90,
                        morphFactor: 1.7,
                        chaos: 0.5,
                        speed: 1.5,
                        hue: 50,
                        intensity: 0.85,
                        saturation: 0.93,
                        rot4dXY: 0.9,
                        rot4dXZ: 0.8,
                        rot4dYZ: 0.85,
                        rot4dXW: 1.5,
                        rot4dYW: 1.4,
                        rot4dZW: 1.3
                    },
                    exit: {
                        geometry: 7,        // CRYSTAL - structured platform
                        gridDensity: 95,
                        morphFactor: 1.4,
                        chaos: 0.3,
                        speed: 1.2,
                        hue: 60,
                        intensity: 0.9,
                        saturation: 0.95,
                        rot4dXW: 1.6,
                        rot4dYW: 1.5,
                        rot4dZW: 1.4
                    }
                }
            },
            {
                name: 'contact',
                selector: '#contact-section, .contact, footer',
                states: {
                    enter: {
                        geometry: 2,        // SPHERE - return to harmony
                        gridDensity: 50,
                        morphFactor: 1.0,
                        chaos: 0.2,
                        speed: 0.8,
                        hue: 320,          // Magenta - connection
                        intensity: 0.7,
                        saturation: 0.85,
                        rot4dXY: 0.3,
                        rot4dXZ: 0.2,
                        rot4dYZ: 0.25,
                        rot4dXW: 0.5,
                        rot4dYW: 0.4,
                        rot4dZW: 0.3
                    },
                    progress: {
                        geometry: 0,        // TETRAHEDRON - simplicity
                        gridDensity: 40,
                        morphFactor: 0.8,
                        chaos: 0.15,
                        speed: 0.6,
                        hue: 330,
                        intensity: 0.6,
                        saturation: 0.8,
                        rot4dXY: 0.2,
                        rot4dXZ: 0.1,
                        rot4dYZ: 0.15,
                        rot4dXW: 0.3,
                        rot4dYW: 0.2,
                        rot4dZW: 0.1
                    },
                    exit: {
                        geometry: 2,        // Back to SPHERE
                        gridDensity: 30,
                        morphFactor: 0.6,
                        chaos: 0.1,
                        speed: 0.5,
                        hue: 340,
                        intensity: 0.5,
                        saturation: 0.75,
                        rot4dXW: 0.2,
                        rot4dYW: 0.1,
                        rot4dZW: 0.05
                    }
                }
            }
        ];
    }

    /**
     * Calculate section boundaries from DOM elements
     */
    updateSectionBoundaries() {
        this.sections.forEach(section => {
            const element = document.querySelector(section.selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                const scrollTop = window.scrollY;
                section.top = rect.top + scrollTop;
                section.bottom = rect.bottom + scrollTop;
                section.height = rect.height;
            } else {
                console.warn(`ScrollChoreographer: Section "${section.name}" element not found: ${section.selector}`);
            }
        });
    }

    /**
     * Update scroll position and calculate velocity
     */
    updateScrollPosition(scrollY) {
        const now = performance.now();
        const dt = Math.max(1, now - this.lastUpdateTime) / 1000; // seconds

        this.scrollPosition = scrollY;
        this.scrollVelocity = (scrollY - this.lastScrollPosition) / dt;

        // Clamp velocity
        this.scrollVelocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.scrollVelocity));

        this.lastScrollPosition = scrollY;
        this.lastUpdateTime = now;

        // Find current section
        this.findCurrentSection();

        // Update target state based on scroll position
        this.updateTargetState();
    }

    /**
     * Find which section we're currently in
     */
    findCurrentSection() {
        const viewportCenter = this.scrollPosition + (window.innerHeight / 2);

        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];
            if (section.top !== undefined && section.bottom !== undefined) {
                if (viewportCenter >= section.top && viewportCenter < section.bottom) {
                    this.currentSectionIndex = i;
                    this.sectionProgress = (viewportCenter - section.top) / section.height;
                    return;
                }
            }
        }

        // Default to last section if past everything
        if (this.sections.length > 0) {
            this.currentSectionIndex = this.sections.length - 1;
            this.sectionProgress = 1.0;
        }
    }

    /**
     * Update target state based on current scroll position
     */
    updateTargetState() {
        const currentSection = this.sections[this.currentSectionIndex];
        if (!currentSection || !currentSection.states) {
            return;
        }

        const { enter, progress, exit } = currentSection.states;

        // Determine which sub-state we're in (enter, progress, or exit)
        let state1, state2, blend;

        if (this.sectionProgress < 0.3) {
            // Entering section: blend from enter to progress
            state1 = enter;
            state2 = progress;
            blend = this.sectionProgress / 0.3;
        } else if (this.sectionProgress < 0.7) {
            // Middle of section: stay in progress state
            state1 = progress;
            state2 = progress;
            blend = 0;
        } else {
            // Exiting section: blend from progress to exit
            state1 = progress;
            state2 = exit;
            blend = (this.sectionProgress - 0.7) / 0.3;
        }

        // Check if we should blend with next section
        const nextSection = this.sections[this.currentSectionIndex + 1];
        if (nextSection && this.sectionProgress > (1 - this.transitionZone)) {
            // Blend current exit with next enter
            const transitionBlend = (this.sectionProgress - (1 - this.transitionZone)) / this.transitionZone;
            state2 = nextSection.states.enter;
            blend = transitionBlend;
        }

        // Interpolate between states
        this.targetState = this.interpolateStates(state1, state2, blend);

        // Apply velocity influence (dramatic changes during fast scrolling)
        this.applyVelocityInfluence();
    }

    /**
     * Interpolate between two visual states
     */
    interpolateStates(state1, state2, t) {
        const result = {};

        // Smooth interpolation function (ease-in-out)
        const smoothT = t * t * (3 - 2 * t);

        for (const key in state1) {
            if (typeof state1[key] === 'number' && typeof state2[key] === 'number') {
                // Special handling for geometry (snap at 50%)
                if (key === 'geometry') {
                    result[key] = smoothT < 0.5 ? state1[key] : state2[key];
                } else {
                    // Linear interpolation for other parameters
                    result[key] = state1[key] + (state2[key] - state1[key]) * smoothT;
                }
            }
        }

        return result;
    }

    /**
     * Apply velocity-based effects to target state
     */
    applyVelocityInfluence() {
        const velocityFactor = Math.abs(this.scrollVelocity) / this.maxVelocity;
        const influence = velocityFactor * this.velocityInfluence;

        // Fast scrolling increases chaos and rotation speed
        this.targetState.chaos = Math.min(1.0, this.targetState.chaos + influence * 0.3);
        this.targetState.speed = Math.min(3.0, this.targetState.speed + influence * 0.5);

        // Dramatic 4D rotation during fast scroll
        this.targetState.rot4dXW += Math.sin(performance.now() * 0.001) * influence * 0.5;
        this.targetState.rot4dYW += Math.cos(performance.now() * 0.001) * influence * 0.5;
        this.targetState.rot4dZW += Math.sin(performance.now() * 0.0015) * influence * 0.5;

        // Intensity pulses with velocity
        this.targetState.intensity = Math.min(1.0, this.targetState.intensity + influence * 0.2);
    }

    /**
     * Update current state with smooth interpolation towards target
     * Call this every frame
     *
     * REFACTORED: Now merges micro-state for per-tick responsiveness
     */
    update() {
        // Get micro-state from MicroScrollChoreographer
        const microState = this.microChoreographer.getMicroState();
        const velocityEffects = this.microChoreographer.getVelocityEffects();

        // Smooth lerp towards target state
        for (const key in this.targetState) {
            if (typeof this.currentState[key] === 'number' && typeof this.targetState[key] === 'number') {
                // Geometry snaps instantly
                if (key === 'geometry') {
                    this.currentState[key] = this.targetState[key];
                } else {
                    // Base interpolation
                    let targetValue = this.targetState[key];

                    // Apply velocity effects if available
                    if (velocityEffects[key] !== undefined) {
                        targetValue = velocityEffects[key];
                    }

                    // Apply micro-state ADDITIVE adjustments for rotation
                    if (key.startsWith('rot4d') && microState[key] !== undefined) {
                        targetValue += microState[key];
                    }
                    // Apply micro-state ADDITIVE adjustments for other parameters
                    else if (key === 'chaos' || key === 'morphFactor') {
                        targetValue += microState[key];
                    }
                    // Apply micro-state OVERRIDES for grid density and hue
                    else if (key === 'gridDensity' && Math.abs(microState.gridDensity) > 0.1) {
                        targetValue += microState.gridDensity;
                    }
                    else if (key === 'hue' && Math.abs(microState.hue) > 0.1) {
                        targetValue = (targetValue + microState.hue) % 360;
                    }

                    // Smooth interpolation
                    this.currentState[key] += (targetValue - this.currentState[key]) * this.lerpSpeed;
                }
            }
        }

        return this.currentState;
    }

    /**
     * Get state for a specific parallax depth layer
     * Different depths get different rotation and morphing offsets
     */
    getStateForDepth(depth = 0.5) {
        const state = { ...this.currentState };

        // Parallax effect: deeper layers rotate and morph differently
        const depthOffset = (depth - 0.5) * 2; // -1 to 1

        state.rot4dXW += depthOffset * 0.3;
        state.rot4dYW += depthOffset * 0.2;
        state.rot4dZW += depthOffset * 0.1;

        state.morphFactor *= (1 + depthOffset * 0.2);
        state.intensity *= (1 - Math.abs(depthOffset) * 0.2);

        return state;
    }

    /**
     * Create empty state object with default values
     */
    createEmptyState() {
        return {
            geometry: 0,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 200,
            intensity: 0.5,
            saturation: 0.8,
            rot4dXY: 0.0,
            rot4dXZ: 0.0,
            rot4dYZ: 0.0,
            rot4dXW: 0.0,
            rot4dYW: 0.0,
            rot4dZW: 0.0
        };
    }

    /**
     * Get current section name
     */
    getCurrentSectionName() {
        return this.sections[this.currentSectionIndex]?.name || 'unknown';
    }

    /**
     * Get scroll progress within current section (0-1)
     */
    getSectionProgress() {
        return this.sectionProgress;
    }

    /**
     * Get scroll velocity
     */
    getScrollVelocity() {
        return this.scrollVelocity;
    }

    /**
     * Get micro-choreographer (for external access)
     */
    getMicroChoreographer() {
        return this.microChoreographer;
    }

    /**
     * Get micro-state directly (for debugging)
     */
    getMicroState() {
        return this.microChoreographer.getMicroState();
    }

    /**
     * Get velocity tier (slow/medium/fast)
     */
    getVelocityTier() {
        return this.microChoreographer.getVelocityTier();
    }

    /**
     * Get performance stats (for debugging)
     */
    getPerformanceStats() {
        return this.microChoreographer.getStats();
    }

    /**
     * Reset micro-state accumulators (useful when changing sections)
     */
    resetMicroState() {
        this.microChoreographer.resetAccumulators();
    }

    /**
     * Force update to specific section
     */
    jumpToSection(sectionName) {
        const index = this.sections.findIndex(s => s.name === sectionName);
        if (index !== -1) {
            this.currentSectionIndex = index;
            this.sectionProgress = 0.5;
            this.updateTargetState();
        }
    }

    /**
     * Get all section names
     */
    getSectionNames() {
        return this.sections.map(s => s.name);
    }
}
