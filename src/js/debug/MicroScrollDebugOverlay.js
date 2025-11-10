/**
 * MicroScrollDebugOverlay.js
 *
 * Real-time visualization of MicroScrollChoreographer state
 * Shows per-tick responsiveness and velocity tiers
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

export class MicroScrollDebugOverlay {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.microChoreographer = choreographer.getMicroChoreographer();
        this.overlay = null;
        this.isVisible = false;

        this.createOverlay();
        this.startUpdating();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'micro-scroll-debug';
        this.overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: #00ff88;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            padding: 15px;
            border: 2px solid #00ff88;
            border-radius: 8px;
            z-index: 10000;
            min-width: 320px;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
            backdrop-filter: blur(10px);
            display: none;
            line-height: 1.6;
        `;

        this.overlay.innerHTML = `
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px; color: #00ffff; text-align: center;">
                🎯 MICRO-SCROLL CHOREOGRAPHER
            </div>
            <div id="micro-scroll-stats"></div>
        `;

        document.body.appendChild(this.overlay);

        // Toggle visibility with 'D' key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.toggle();
            }
        });

        console.log('🎯 MicroScrollDebugOverlay created - Press "D" to toggle');
    }

    startUpdating() {
        const update = () => {
            if (this.isVisible) {
                this.updateDisplay();
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    updateDisplay() {
        const stats = this.microChoreographer.getStats();
        const velocityTier = stats.velocityTier;
        const microState = this.choreographer.getMicroState();
        const currentState = this.choreographer.currentState;

        // Color-code velocity tier
        const tierColors = {
            slow: '#00ff88',
            medium: '#ffaa00',
            fast: '#ff0055'
        };
        const tierColor = tierColors[velocityTier] || '#ffffff';

        const html = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #00ffff;">VELOCITY:</strong>
                <div style="margin-left: 10px;">
                    Instant: <span style="color: ${tierColor}; font-weight: bold;">${stats.instantVelocity.toFixed(1)} px/s</span><br/>
                    Smoothed: <span style="color: ${tierColor}; font-weight: bold;">${stats.smoothedVelocity.toFixed(1)} px/s</span><br/>
                    Tier: <span style="color: ${tierColor}; font-weight: bold; text-transform: uppercase;">${velocityTier}</span>
                </div>
            </div>

            <div style="margin-bottom: 8px;">
                <strong style="color: #00ffff;">PERFORMANCE:</strong>
                <div style="margin-left: 10px;">
                    Wheel Events: <span style="color: #ffff00;">${stats.wheelEvents}</span><br/>
                    RAF Updates: <span style="color: #ffff00;">${stats.rafUpdates}</span><br/>
                    Buffer: <span style="color: #ffff00;">${stats.bufferSize}/10</span>
                </div>
            </div>

            <div style="margin-bottom: 8px;">
                <strong style="color: #00ffff;">4D ROTATIONS:</strong>
                <div style="margin-left: 10px; font-size: 10px;">
                    XW: <span style="color: #ff88ff;">${stats.rotationAccumulator.xw.toFixed(3)}</span>
                    YW: <span style="color: #ff88ff;">${stats.rotationAccumulator.yw.toFixed(3)}</span>
                    ZW: <span style="color: #ff88ff;">${stats.rotationAccumulator.zw.toFixed(3)}</span><br/>
                    XY: <span style="color: #88ffff;">${stats.rotationAccumulator.xy.toFixed(3)}</span>
                    XZ: <span style="color: #88ffff;">${stats.rotationAccumulator.xz.toFixed(3)}</span>
                    YZ: <span style="color: #88ffff;">${stats.rotationAccumulator.yz.toFixed(3)}</span>
                </div>
            </div>

            <div style="margin-bottom: 8px;">
                <strong style="color: #00ffff;">ACCUMULATORS:</strong>
                <div style="margin-left: 10px;">
                    Chaos: <span style="color: #ff8888;">${stats.chaosAccumulator.toFixed(3)}</span><br/>
                    Morph: <span style="color: #88ff88;">${stats.morphAccumulator.toFixed(3)}</span>
                </div>
            </div>

            <div style="margin-bottom: 8px;">
                <strong style="color: #00ffff;">CURRENT STATE:</strong>
                <div style="margin-left: 10px; font-size: 10px;">
                    Geometry: <span style="color: #ffaa88;">${this.getGeometryName(currentState.geometry)}</span><br/>
                    Grid Density: <span style="color: #aaffff;">${currentState.gridDensity.toFixed(1)}</span><br/>
                    Morph Factor: <span style="color: #aaffff;">${currentState.morphFactor.toFixed(2)}</span><br/>
                    Chaos: <span style="color: #aaffff;">${currentState.chaos.toFixed(2)}</span><br/>
                    Hue: <span style="color: #aaffff;">${currentState.hue.toFixed(0)}°</span>
                    Intensity: <span style="color: #aaffff;">${currentState.intensity.toFixed(2)}</span>
                </div>
            </div>

            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #00ff88; text-align: center; font-size: 9px; color: #888;">
                Press 'D' to hide • Every wheel tick captured
            </div>
        `;

        const statsContainer = this.overlay.querySelector('#micro-scroll-stats');
        if (statsContainer) {
            statsContainer.innerHTML = html;
        }
    }

    getGeometryName(index) {
        const names = [
            'TETRAHEDRON',
            'HYPERCUBE',
            'SPHERE',
            'TORUS',
            'KLEIN BOTTLE',
            'FRACTAL',
            'WAVE',
            'CRYSTAL'
        ];
        return names[Math.floor(index)] || 'UNKNOWN';
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.overlay.style.display = this.isVisible ? 'block' : 'none';
        console.log(`🎯 MicroScrollDebugOverlay: ${this.isVisible ? 'VISIBLE' : 'HIDDEN'}`);
    }

    show() {
        this.isVisible = true;
        this.overlay.style.display = 'block';
    }

    hide() {
        this.isVisible = false;
        this.overlay.style.display = 'none';
    }

    dispose() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}

/**
 * A Paul Phillips Manifestation
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Clear Seas Solutions LLC
 */
