/**
 * MicroScrollChoreographer.js
 *
 * Captures EVERY SINGLE TICK of the scroll wheel for ultra-responsive visualizations
 * Provides micro-state updates between RAF frames for absolute fluidity
 *
 * This is Phase 1 of the Complete Visualizer System Refactor
 * Enables per-tick parameter modulation for avant-garde flourish
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

export class MicroScrollChoreographer {
    constructor(options = {}) {
        // Wheel event buffer (stores last N wheel events)
        this.wheelBuffer = [];
        this.bufferSize = options.bufferSize || 10;

        // Micro-state: parameter adjustments applied between RAF frames
        this.microState = this.createEmptyMicroState();

        // RAF state: smoothed state for rendering
        this.rafState = this.createEmptyMicroState();

        // Velocity tracking
        this.instantVelocity = 0;
        this.smoothedVelocity = 0;
        this.velocitySmoothing = options.velocitySmoothing || 0.15;

        // Accumulation tracking (for micro-adjustments)
        this.rotationAccumulator = { xw: 0, yw: 0, zw: 0, xy: 0, xz: 0, yz: 0 };
        this.chaosAccumulator = 0;
        this.morphAccumulator = 0;

        // Sensitivity settings
        this.sensitivity = {
            rotation: options.rotationSensitivity || 0.001,
            chaos: options.chaosSensitivity || 0.01,
            morph: options.morphSensitivity || 0.0001,
            gridDensity: options.gridDensitySensitivity || 0.05,
            hue: options.hueSensitivity || 0.1,
            intensity: options.intensitySensitivity || 0.002
        };

        // Velocity thresholds for dramatic effects
        this.velocityThresholds = {
            slow: 100,    // px/s
            medium: 500,
            fast: 1000
        };

        // Performance tracking
        this.lastWheelTime = performance.now();
        this.wheelEventCount = 0;
        this.rafCount = 0;

        this.initialize();
    }

    initialize() {
        // Capture EVERY wheel event (passive for performance)
        window.addEventListener('wheel', (e) => {
            this.onWheel(e.deltaY, e.deltaX);
        }, { passive: true });

        console.log('🎯 MicroScrollChoreographer initialized - capturing every wheel tick');
    }

    /**
     * Handle EVERY wheel event (unthrottled)
     * This is called for every single scroll tick
     */
    onWheel(deltaY, deltaX = 0) {
        const now = performance.now();
        const timeSinceLastWheel = now - this.lastWheelTime;

        // Add to buffer
        this.wheelBuffer.push({
            deltaY,
            deltaX,
            timestamp: now,
            timeDelta: timeSinceLastWheel
        });

        // Trim buffer to size
        if (this.wheelBuffer.length > this.bufferSize) {
            this.wheelBuffer.shift();
        }

        // Calculate instant velocity (px/s)
        this.calculateVelocity();

        // Apply micro-adjustments to state
        this.applyMicroAdjustments(deltaY, deltaX);

        this.lastWheelTime = now;
        this.wheelEventCount++;
    }

    /**
     * Calculate velocity from wheel buffer
     */
    calculateVelocity() {
        if (this.wheelBuffer.length < 2) {
            this.instantVelocity = 0;
            return;
        }

        // Sum deltas over time window
        let totalDelta = 0;
        let totalTime = 0;

        for (let i = 1; i < this.wheelBuffer.length; i++) {
            totalDelta += Math.abs(this.wheelBuffer[i].deltaY);
            totalTime += this.wheelBuffer[i].timeDelta;
        }

        // Calculate velocity in px/s
        if (totalTime > 0) {
            this.instantVelocity = (totalDelta / totalTime) * 1000;
        }

        // Smooth velocity
        this.smoothedVelocity += (this.instantVelocity - this.smoothedVelocity) * this.velocitySmoothing;
    }

    /**
     * Apply micro-adjustments to state based on wheel delta
     * These are immediate responses that happen BETWEEN RAF frames
     */
    applyMicroAdjustments(deltaY, deltaX) {
        const direction = Math.sign(deltaY);
        const magnitude = Math.abs(deltaY);

        // === ROTATION MICRO-ADJUSTMENTS ===
        // Each wheel tick rotates the 4D space
        this.rotationAccumulator.xw += deltaY * this.sensitivity.rotation;
        this.rotationAccumulator.yw += deltaY * this.sensitivity.rotation * 0.7;
        this.rotationAccumulator.zw += deltaY * this.sensitivity.rotation * 0.5;

        // Horizontal scroll affects XY/XZ/YZ rotations
        if (Math.abs(deltaX) > 0) {
            this.rotationAccumulator.xy += deltaX * this.sensitivity.rotation * 0.8;
            this.rotationAccumulator.xz += deltaX * this.sensitivity.rotation * 0.6;
            this.rotationAccumulator.yz += deltaX * this.sensitivity.rotation * 0.4;
        }

        // === CHAOS MICRO-ADJUSTMENTS ===
        // Faster scrolling = more chaos
        const velocityFactor = Math.min(1.0, this.smoothedVelocity / this.velocityThresholds.fast);
        this.chaosAccumulator += Math.abs(velocityFactor) * this.sensitivity.chaos;
        this.chaosAccumulator = Math.min(1.0, this.chaosAccumulator); // Clamp

        // === MORPH MICRO-ADJUSTMENTS ===
        // Each wheel tick adds subtle morphing
        this.morphAccumulator += magnitude * this.sensitivity.morph;

        // === GRID DENSITY MICRO-ADJUSTMENTS ===
        // Scrolling changes density dynamically
        this.microState.gridDensity += direction * this.sensitivity.gridDensity;

        // === HUE MICRO-ADJUSTMENTS ===
        // Scrolling shifts hue continuously
        this.microState.hue += deltaY * this.sensitivity.hue;
        this.microState.hue = (this.microState.hue + 360) % 360; // Wrap 0-360

        // === INTENSITY MICRO-ADJUSTMENTS ===
        // Velocity affects intensity
        this.microState.intensity += velocityFactor * this.sensitivity.intensity;

        // Update micro-state
        this.microState.rot4dXW = this.rotationAccumulator.xw;
        this.microState.rot4dYW = this.rotationAccumulator.yw;
        this.microState.rot4dZW = this.rotationAccumulator.zw;
        this.microState.rot4dXY = this.rotationAccumulator.xy;
        this.microState.rot4dXZ = this.rotationAccumulator.xz;
        this.microState.rot4dYZ = this.rotationAccumulator.yz;
        this.microState.chaos = this.chaosAccumulator;
        this.microState.morphFactor = 1.0 + this.morphAccumulator;
    }

    /**
     * Get current micro-state (called every RAF to render)
     * Smoothly interpolates micro-state towards RAF state
     */
    getMicroState() {
        // Smooth micro-state towards RAF state
        for (const key in this.microState) {
            this.rafState[key] += (this.microState[key] - this.rafState[key]) * 0.2;
        }

        this.rafCount++;
        return this.rafState;
    }

    /**
     * Get velocity-based dramatic effects
     * Returns parameter overrides based on scroll speed
     */
    getVelocityEffects() {
        const vel = this.smoothedVelocity;
        const effects = {};

        // SLOW SCROLL (< 100 px/s): Contemplative, detailed
        if (vel < this.velocityThresholds.slow) {
            effects.gridDensity = 60 + vel * 0.2;
            effects.morphFactor = 1.0 + vel * 0.001;
            effects.chaos = 0.1 + vel * 0.001;
            effects.intensity = 0.8 - vel * 0.001;
            effects.speed = 0.8;
            effects.saturation = 0.9;
        }
        // MEDIUM SCROLL (100-500 px/s): Dynamic, flowing
        else if (vel < this.velocityThresholds.medium) {
            const factor = (vel - this.velocityThresholds.slow) /
                          (this.velocityThresholds.medium - this.velocityThresholds.slow);

            effects.gridDensity = 40 + Math.sin(Date.now() * 0.01) * 20;
            effects.morphFactor = 1.2 + vel * 0.001;
            effects.chaos = 0.3 + vel * 0.0005;
            effects.intensity = 0.7 + Math.abs(Math.sin(Date.now() * 0.005)) * 0.2;
            effects.speed = 1.0 + factor * 0.5;
            effects.saturation = 0.95;
        }
        // FAST SCROLL (> 500 px/s): EXPLOSIVE, CINEMATIC
        else {
            const fastFactor = Math.min(1.0, (vel - this.velocityThresholds.medium) / 1000);

            effects.gridDensity = 10 + vel * 0.05;
            effects.morphFactor = 2.0 + vel * 0.002;
            effects.chaos = 0.6 + vel * 0.0008;
            effects.intensity = 0.5 + vel * 0.0005;
            effects.speed = 3.0;
            effects.saturation = 1.0;

            // EXTREME 4D rotations during fast scroll
            effects.rot4dXW = this.rotationAccumulator.xw + Math.PI * fastFactor;
            effects.rot4dYW = this.rotationAccumulator.yw + Math.PI * 0.7 * fastFactor;
            effects.rot4dZW = this.rotationAccumulator.zw + Math.PI * 0.5 * fastFactor;
            effects.rot4dXY = vel * 0.01 * fastFactor;
            effects.rot4dXZ = vel * 0.008 * fastFactor;
            effects.rot4dYZ = vel * 0.012 * fastFactor;
        }

        return effects;
    }

    /**
     * Get current velocity tier (for external systems)
     */
    getVelocityTier() {
        if (this.smoothedVelocity < this.velocityThresholds.slow) return 'slow';
        if (this.smoothedVelocity < this.velocityThresholds.medium) return 'medium';
        return 'fast';
    }

    /**
     * Reset accumulators (useful when changing sections)
     */
    resetAccumulators() {
        this.rotationAccumulator = { xw: 0, yw: 0, zw: 0, xy: 0, xz: 0, yz: 0 };
        this.chaosAccumulator = 0;
        this.morphAccumulator = 0;
        this.microState = this.createEmptyMicroState();
    }

    /**
     * Create empty micro-state
     */
    createEmptyMicroState() {
        return {
            rot4dXW: 0.0,
            rot4dYW: 0.0,
            rot4dZW: 0.0,
            rot4dXY: 0.0,
            rot4dXZ: 0.0,
            rot4dYZ: 0.0,
            chaos: 0.0,
            morphFactor: 1.0,
            gridDensity: 0.0,
            hue: 0.0,
            intensity: 0.0,
            speed: 1.0,
            saturation: 0.8
        };
    }

    /**
     * Get performance stats (for debugging)
     */
    getStats() {
        return {
            wheelEvents: this.wheelEventCount,
            rafUpdates: this.rafCount,
            bufferSize: this.wheelBuffer.length,
            instantVelocity: this.instantVelocity,
            smoothedVelocity: this.smoothedVelocity,
            velocityTier: this.getVelocityTier(),
            rotationAccumulator: { ...this.rotationAccumulator },
            chaosAccumulator: this.chaosAccumulator,
            morphAccumulator: this.morphAccumulator
        };
    }

    /**
     * Get instant velocity (unsmoothed)
     */
    getInstantVelocity() {
        return this.instantVelocity;
    }

    /**
     * Get smoothed velocity
     */
    getSmoothedVelocity() {
        return this.smoothedVelocity;
    }

    /**
     * Clear wheel buffer
     */
    clearBuffer() {
        this.wheelBuffer = [];
    }
}

/**
 * A Paul Phillips Manifestation
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Clear Seas Solutions LLC
 */
