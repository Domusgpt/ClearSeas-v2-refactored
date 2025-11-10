/**
 * GeometryMorpher.js
 *
 * Handles smooth morphing transitions between VIB3+ geometry types
 * Creates emergent interactions between visualizers
 *
 * Implements:
 * - Cross-fade transitions between geometries
 * - Emergent coupling between nearby visualizers
 * - Ripple effects propagating through visualizer network
 * - Synchronized state changes
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

export class GeometryMorpher {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.currentGeometry = visualizer.params.geometry;
        this.targetGeometry = visualizer.params.geometry;
        this.morphProgress = 1.0; // 0-1, 1 = complete
        this.morphSpeed = 0.02; // Per frame
        this.isMorphing = false;
    }

    /**
     * Morph to a new geometry over time
     */
    morphTo(targetGeometry, speed = 0.02) {
        this.targetGeometry = Math.max(0, Math.min(7, Math.floor(targetGeometry)));
        this.morphSpeed = speed;
        this.morphProgress = 0.0;
        this.isMorphing = true;
    }

    /**
     * Update morph state (call every frame)
     */
    update() {
        if (!this.isMorphing) return;

        this.morphProgress += this.morphSpeed;

        if (this.morphProgress >= 1.0) {
            this.morphProgress = 1.0;
            this.currentGeometry = this.targetGeometry;
            this.visualizer.params.geometry = this.targetGeometry;
            this.isMorphing = false;
        } else {
            // Smooth transition - snap at 50%
            if (this.morphProgress >= 0.5) {
                this.visualizer.params.geometry = this.targetGeometry;
            } else {
                this.visualizer.params.geometry = this.currentGeometry;
            }

            // Apply morph factor during transition for smooth visual
            this.visualizer.params.morphFactor = 1.0 + Math.sin(this.morphProgress * Math.PI) * 0.5;
        }
    }

    /**
     * Check if currently morphing
     */
    isMorphing() {
        return this.isMorphing;
    }

    /**
     * Get morph progress (0-1)
     */
    getProgress() {
        return this.morphProgress;
    }
}

/**
 * EmergentInteractionSystem
 *
 * Creates emergent behaviors between visualizers based on proximity,
 * state, and user interaction
 */
export class EmergentInteractionSystem {
    constructor(elementVisualizerManager, options = {}) {
        this.manager = elementVisualizerManager;
        this.options = {
            couplingStrength: options.couplingStrength || 0.3,
            propagationSpeed: options.propagationSpeed || 0.5,
            rippleDecay: options.rippleDecay || 0.95,
            synchronizationThreshold: options.synchronizationThreshold || 0.7,
            ...options
        };

        // Track active ripples
        this.ripples = [];

        // Track visualizer couplings
        this.couplings = new Map();

        this.initializeCouplings();
    }

    /**
     * Initialize coupling relationships between visualizers
     */
    initializeCouplings() {
        const visualizers = Array.from(this.manager.visualizers.values());

        visualizers.forEach((viz1, i) => {
            const element1 = viz1.element;
            const rect1 = element1.getBoundingClientRect();
            const center1 = {
                x: rect1.left + rect1.width / 2,
                y: rect1.top + rect1.height / 2
            };

            visualizers.slice(i + 1).forEach(viz2 => {
                const element2 = viz2.element;
                const rect2 = element2.getBoundingClientRect();
                const center2 = {
                    x: rect2.left + rect2.width / 2,
                    y: rect2.top + rect2.height / 2
                };

                // Calculate distance
                const distance = Math.sqrt(
                    Math.pow(center2.x - center1.x, 2) +
                    Math.pow(center2.y - center1.y, 2)
                );

                // Create coupling if close enough (within 300px)
                if (distance < 300) {
                    const strength = 1 - (distance / 300);
                    this.createCoupling(viz1, viz2, strength);
                }
            });
        });

        console.log(`🔗 Created ${this.couplings.size} emergent couplings`);
    }

    /**
     * Create coupling between two visualizers
     */
    createCoupling(viz1, viz2, strength) {
        const id1 = viz1.element.dataset.vizId;
        const id2 = viz2.element.dataset.vizId;

        if (!this.couplings.has(id1)) {
            this.couplings.set(id1, []);
        }
        if (!this.couplings.has(id2)) {
            this.couplings.set(id2, []);
        }

        this.couplings.get(id1).push({ viz: viz2, strength });
        this.couplings.get(id2).push({ viz: viz1, strength });
    }

    /**
     * Trigger ripple from a point
     */
    triggerRipple(sourceElement, intensity = 1.0) {
        const rect = sourceElement.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        this.ripples.push({
            center,
            radius: 0,
            intensity,
            maxRadius: 500,
            speed: this.options.propagationSpeed * 100
        });

        console.log('🌊 Ripple triggered');
    }

    /**
     * Update system (call every frame)
     */
    update() {
        this.updateRipples();
        this.applyCouplings();
        this.checkSynchronization();
    }

    /**
     * Update active ripples
     */
    updateRipples() {
        this.ripples = this.ripples.filter(ripple => {
            ripple.radius += ripple.speed;
            ripple.intensity *= this.options.rippleDecay;

            // Apply ripple effect to visualizers
            this.manager.visualizers.forEach(viz => {
                const rect = viz.element.getBoundingClientRect();
                const vizCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };

                const distance = Math.sqrt(
                    Math.pow(vizCenter.x - ripple.center.x, 2) +
                    Math.pow(vizCenter.y - ripple.center.y, 2)
                );

                // Check if ripple is hitting this visualizer
                if (Math.abs(distance - ripple.radius) < 50) {
                    const effect = ripple.intensity * 0.3;

                    // Pulse effect
                    viz.visualizer.params.intensity += effect;
                    viz.visualizer.params.chaos += effect * 0.5;
                    viz.visualizer.params.speed += effect * 0.5;

                    // Clamp values
                    viz.visualizer.params.intensity = Math.min(1.0, viz.visualizer.params.intensity);
                    viz.visualizer.params.chaos = Math.min(1.0, viz.visualizer.params.chaos);
                    viz.visualizer.params.speed = Math.min(3.0, viz.visualizer.params.speed);
                }
            });

            // Remove ripple if too large or too weak
            return ripple.radius < ripple.maxRadius && ripple.intensity > 0.01;
        });
    }

    /**
     * Apply coupling forces between visualizers
     */
    applyCouplings() {
        this.manager.visualizers.forEach((viz, id) => {
            const couplings = this.couplings.get(id);
            if (!couplings) return;

            couplings.forEach(({ viz: coupledViz, strength }) => {
                const coupling = strength * this.options.couplingStrength;

                // Couple parameters
                const params1 = viz.visualizer.params;
                const params2 = coupledViz.visualizer.params;

                // Hue coupling (circular average)
                const hue1 = params1.hue;
                const hue2 = params2.hue;
                const hueDiff = ((hue2 - hue1 + 180) % 360) - 180;
                params1.hue += hueDiff * coupling * 0.1;

                // Intensity coupling
                params1.intensity += (params2.intensity - params1.intensity) * coupling * 0.05;

                // Chaos coupling
                params1.chaos += (params2.chaos - params1.chaos) * coupling * 0.05;

                // Speed coupling
                params1.speed += (params2.speed - params1.speed) * coupling * 0.05;

                // 4D rotation coupling
                params1.rot4dXW += (params2.rot4dXW - params1.rot4dXW) * coupling * 0.02;
                params1.rot4dYW += (params2.rot4dYW - params1.rot4dYW) * coupling * 0.02;
                params1.rot4dZW += (params2.rot4dZW - params1.rot4dZW) * coupling * 0.02;
            });
        });
    }

    /**
     * Check for synchronization and trigger emergent behaviors
     */
    checkSynchronization() {
        const visualizers = Array.from(this.manager.visualizers.values());

        if (visualizers.length < 2) return;

        // Calculate average parameters
        let avgHue = 0;
        let avgIntensity = 0;
        let avgChaos = 0;

        visualizers.forEach(viz => {
            avgHue += viz.visualizer.params.hue;
            avgIntensity += viz.visualizer.params.intensity;
            avgChaos += viz.visualizer.params.chaos;
        });

        avgHue /= visualizers.length;
        avgIntensity /= visualizers.length;
        avgChaos /= visualizers.length;

        // Check if visualizers are synchronized
        let synchronized = true;
        const threshold = this.options.synchronizationThreshold;

        visualizers.forEach(viz => {
            const params = viz.visualizer.params;
            const hueVariance = Math.abs(params.hue - avgHue) / 360;
            const intensityVariance = Math.abs(params.intensity - avgIntensity);
            const chaosVariance = Math.abs(params.chaos - avgChaos);

            if (hueVariance > (1 - threshold) ||
                intensityVariance > (1 - threshold) ||
                chaosVariance > (1 - threshold)) {
                synchronized = false;
            }
        });

        // Trigger emergent behavior when synchronized
        if (synchronized && Math.random() < 0.01) { // 1% chance per frame
            this.triggerEmergentBehavior();
        }
    }

    /**
     * Trigger emergent behavior across all visualizers
     */
    triggerEmergentBehavior() {
        console.log('✨ Emergent behavior triggered!');

        // Random emergent effect
        const effects = [
            this.cascadeGeometryChange.bind(this),
            this.synchronizedPulse.bind(this),
            this.waveEffect.bind(this)
        ];

        const effect = effects[Math.floor(Math.random() * effects.length)];
        effect();
    }

    /**
     * Cascade geometry changes across visualizers
     */
    cascadeGeometryChange() {
        const visualizers = Array.from(this.manager.visualizers.values());
        const targetGeometry = Math.floor(Math.random() * 8);

        visualizers.forEach((viz, index) => {
            setTimeout(() => {
                if (!viz.morpher) {
                    viz.morpher = new GeometryMorpher(viz.visualizer);
                }
                viz.morpher.morphTo(targetGeometry, 0.03);
            }, index * 100); // Stagger timing
        });

        console.log(`🌊 Cascading to geometry ${targetGeometry}`);
    }

    /**
     * Synchronized pulse across all visualizers
     */
    synchronizedPulse() {
        const visualizers = Array.from(this.manager.visualizers.values());

        visualizers.forEach(viz => {
            const original = {
                intensity: viz.visualizer.params.intensity,
                chaos: viz.visualizer.params.chaos,
                speed: viz.visualizer.params.speed
            };

            // Spike
            viz.visualizer.params.intensity = Math.min(1.0, original.intensity * 1.8);
            viz.visualizer.params.chaos = Math.min(1.0, original.chaos * 1.8);
            viz.visualizer.params.speed = Math.min(3.0, original.speed * 1.5);

            // Decay back
            setTimeout(() => {
                viz.visualizer.params.intensity = original.intensity;
                viz.visualizer.params.chaos = original.chaos;
                viz.visualizer.params.speed = original.speed;
            }, 500);
        });

        console.log('💫 Synchronized pulse');
    }

    /**
     * Wave effect propagating through visualizers
     */
    waveEffect() {
        const visualizers = Array.from(this.manager.visualizers.values());

        // Sort by position (left to right, top to bottom)
        visualizers.sort((a, b) => {
            const rectA = a.element.getBoundingClientRect();
            const rectB = b.element.getBoundingClientRect();

            if (Math.abs(rectA.top - rectB.top) < 50) {
                return rectA.left - rectB.left;
            }
            return rectA.top - rectB.top;
        });

        // Apply wave
        visualizers.forEach((viz, index) => {
            setTimeout(() => {
                viz.pulse();
            }, index * 80);
        });

        console.log('🌊 Wave effect');
    }

    /**
     * Add morpher to all visualizers
     */
    enableMorphing() {
        this.manager.visualizers.forEach(viz => {
            if (!viz.morpher) {
                viz.morpher = new GeometryMorpher(viz.visualizer);
            }
        });
    }

    /**
     * Update all morphers
     */
    updateMorphers() {
        this.manager.visualizers.forEach(viz => {
            if (viz.morpher) {
                viz.morpher.update();
            }
        });
    }
}
