/**
 * ADDITION #3: Shader Preset System
 * Dynamic visual preset switching with smooth transitions
 */

export class ShaderPresetSystem {
    constructor(canvasManager) {
        this.manager = canvasManager;
        
        this.presets = {
            quantum: {
                name: 'Quantum Field',
                gridDensity: 12,
                chaos: 0.2,
                morphFactor: 1.0,
                hue: 180,
                intensity: 0.5,
                saturation: 0.9,
                speed: 0.6,
                description: 'Classic 4D quantum lattice'
            },
            neural: {
                name: 'Neural Network',
                gridDensity: 18,
                chaos: 0.45,
                morphFactor: 1.6,
                hue: 280,
                intensity: 0.7,
                saturation: 0.85,
                speed: 0.8,
                description: 'Dense interconnected nodes'
            },
            cosmic: {
                name: 'Cosmic Waves',
                gridDensity: 8,
                chaos: 0.35,
                morphFactor: 1.1,
                hue: 220,
                intensity: 0.6,
                saturation: 0.95,
                speed: 0.4,
                description: 'Flowing cosmic energy'
            },
            crystal: {
                name: 'Crystal Matrix',
                gridDensity: 16,
                chaos: 0.1,
                morphFactor: 0.6,
                hue: 300,
                intensity: 0.65,
                saturation: 0.8,
                speed: 0.3,
                description: 'Precise geometric structures'
            },
            plasma: {
                name: 'Plasma Storm',
                gridDensity: 10,
                chaos: 0.6,
                morphFactor: 2.0,
                hue: 30,
                intensity: 0.8,
                saturation: 1.0,
                speed: 1.2,
                description: 'Chaotic energy patterns'
            },
            zen: {
                name: 'Zen Garden',
                gridDensity: 6,
                chaos: 0.05,
                morphFactor: 0.4,
                hue: 120,
                intensity: 0.4,
                saturation: 0.6,
                speed: 0.2,
                description: 'Calm, meditative flow'
            },
            cyber: {
                name: 'Cybernetic Grid',
                gridDensity: 20,
                chaos: 0.15,
                morphFactor: 0.8,
                hue: 180,
                intensity: 0.75,
                saturation: 1.0,
                speed: 0.7,
                description: 'Sharp digital network'
            },
            aurora: {
                name: 'Aurora Borealis',
                gridDensity: 9,
                chaos: 0.3,
                morphFactor: 1.3,
                hue: 160,
                intensity: 0.6,
                saturation: 0.7,
                speed: 0.5,
                description: 'Flowing northern lights'
            }
        };
        
        this.currentPreset = 'quantum';
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 2000; // ms

        // NO UI - Pure orchestration mode
        // Presets are controlled entirely by VisualOrchestrator based on scroll/interaction
        console.log('🎭 ShaderPresetSystem initialized in pure orchestration mode (no manual controls)');
    }
    
    // UI removed - Pure orchestration mode
    // Visual presets are controlled entirely by scroll position and user interaction
    // via the VisualOrchestrator system
    
    // Styles removed - No UI in pure orchestration mode
    
    // Event listeners removed - Pure orchestration mode
    // All preset changes are triggered programmatically by VisualOrchestrator
    
    applyPreset(presetKey, options = {}) {
        if (!this.presets[presetKey]) {
            console.warn('Preset not found:', presetKey);
            return false;
        }
        
        const {
            duration = this.transitionDuration,
            easing = 'easeInOutCubic'
        } = options;
        
        if (this.isTransitioning) {
            console.log('Transition already in progress');
            return false;
        }
        
        console.log(`🎨 Orchestrator applying preset: ${this.presets[presetKey].name}`);

        // NO UI updates - Pure orchestration mode
        // Get target preset values
        const targetPreset = this.presets[presetKey];
        
        // Find all quantum background engines and transition them
        this.transitionBackgroundEngines(targetPreset, duration, easing);
        
        this.currentPreset = presetKey;
        
        return true;
    }
    
    transitionBackgroundEngines(targetPreset, duration, easing) {
        // This method should be called with access to your background engines
        // For now, we'll dispatch a custom event that engines can listen to
        
        const event = new CustomEvent('presetChange', {
            detail: {
                preset: targetPreset,
                duration,
                easing
            }
        });
        
        window.dispatchEvent(event);
    }
    
    getCurrentPreset() {
        return this.currentPreset;
    }
    
    getPresetData(presetKey) {
        return this.presets[presetKey] || null;
    }
    
    getAllPresets() {
        return { ...this.presets };
    }
    
    addCustomPreset(key, preset) {
        if (this.presets[key]) {
            console.warn('Preset already exists:', key);
            return false;
        }

        this.presets[key] = {
            name: preset.name || 'Custom Preset',
            gridDensity: preset.gridDensity || 12,
            chaos: preset.chaos || 0.2,
            morphFactor: preset.morphFactor || 1.0,
            hue: preset.hue || 180,
            intensity: preset.intensity || 0.5,
            saturation: preset.saturation || 0.9,
            speed: preset.speed || 0.6,
            description: preset.description || 'Custom visual preset'
        };

        // No UI updates in pure orchestration mode
        console.log('✅ Custom preset added (orchestrator-only):', key);

        return true;
    }
    
    // Easing functions
    static easings = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInOutElastic: t => {
            const c5 = (2 * Math.PI) / 4.5;
            return t === 0 ? 0 : t === 1 ? 1 :
                t < 0.5
                    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        }
    };
    
    /**
     * Animate parameters from current to target values
     */
    static animateParams(current, target, duration, easingName = 'easeInOutCubic', onUpdate) {
        const start = Date.now();
        const initial = { ...current };
        const easing = ShaderPresetSystem.easings[easingName] || ShaderPresetSystem.easings.easeInOutCubic;
        
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easing(progress);
            
            Object.keys(target).forEach(key => {
                if (typeof target[key] === 'number' && typeof initial[key] === 'number') {
                    current[key] = initial[key] + (target[key] - initial[key]) * eased;
                }
            });
            
            if (onUpdate) {
                onUpdate(current, progress);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    dispose() {
        // No UI to dispose in pure orchestration mode
        console.log('🗑️ ShaderPresetSystem disposed');
    }
}
