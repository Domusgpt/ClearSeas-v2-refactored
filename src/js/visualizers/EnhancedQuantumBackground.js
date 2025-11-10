/**
 * EnhancedQuantumBackground.js
 *
 * REFACTORED to extend UnifiedQuantumVisualizer with VIB3+ geometry system
 * Integrates with ScrollChoreographer for scroll-responsive visual states
 *
 * Maintains legacy features:
 * - RGB chromatic aberration
 * - Moiré pattern effects
 * - CanvasManager integration
 * - Visual Orchestrator compatibility
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

import { UnifiedQuantumVisualizer } from './UnifiedQuantumVisualizer.js';

export class EnhancedQuantumBackground extends UnifiedQuantumVisualizer {
    constructor(canvasManager, canvasId, options = {}) {
        // Initialize with 'background' role and specific options
        super(canvasId, {
            role: 'background',
            depth: 0.0,
            reactivity: 1.0,
            ...options
        });

        this.manager = canvasManager;

        // Legacy parameters for backward compatibility
        this.legacyParams = {
            rgbOffset: 0.0005,       // Chromatic aberration
            moireIntensity: 0.03,    // Moiré pattern strength
            moireFrequency: 8.0      // Moiré frequency
        };

        // Scroll choreographer integration
        this.choreographer = null;

        // Auto-update from orchestrator
        this.listenToOrchestrator();
    }

    /**
     * Initialize with CanvasManager
     */
    initialize() {
        const canvasData = this.manager.getCanvas(this.canvasId);
        if (!canvasData) {
            console.error('❌ EnhancedQuantumBackground: Canvas not found:', this.canvasId);
            return false;
        }

        // Set GL context from CanvasManager
        this.canvas = canvasData.canvas;
        this.gl = canvasData.gl;

        if (!this.gl) {
            console.error('❌ EnhancedQuantumBackground: No WebGL context!');
            return false;
        }

        console.log('✅ EnhancedQuantumBackground: Canvas and GL context ready');
        console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);

        // Initialize shaders from UnifiedQuantumVisualizer
        const shaderSuccess = this.initializeShaders();
        if (!shaderSuccess) {
            console.error('❌ EnhancedQuantumBackground: Shader initialization failed');
            return false;
        }

        console.log('✅ EnhancedQuantumBackground: Shaders initialized');

        // Register with CanvasManager for rendering
        this.manager.registerRenderer(this.canvasId, (context) => {
            this.renderFrame(context);
        }, 5);

        console.log('🌌 EnhancedQuantumBackground initialized with VIB3+ geometry system');
        console.log('Initial params:', this.params);
        return true;
    }

    /**
     * Set scroll choreographer for state updates
     */
    setChoreographer(choreographer) {
        this.choreographer = choreographer;
        console.log('📜 ScrollChoreographer connected to EnhancedQuantumBackground');
    }

    /**
     * Listen to Visual Orchestrator events (legacy compatibility)
     */
    listenToOrchestrator() {
        window.addEventListener('visualStateUpdate', (e) => {
            this.updateFromOrchestrator(e.detail);
        });
    }

    /**
     * Update from Visual Orchestrator (legacy compatibility)
     */
    updateFromOrchestrator(detail) {
        const { state } = detail;

        // Update legacy parameters if provided
        if (state.rgbOffset !== undefined) {
            this.legacyParams.rgbOffset = state.rgbOffset;
        }
        if (state.moireIntensity !== undefined) {
            this.legacyParams.moireIntensity = state.moireIntensity;
        }

        // Update base parameters
        if (state.gridDensity !== undefined) {
            this.params.gridDensity = state.gridDensity;
        }
        if (state.chaos !== undefined) {
            this.params.chaos = state.chaos;
        }
        if (state.speed !== undefined) {
            this.params.speed = state.speed;
        }
        if (state.hue !== undefined) {
            this.params.hue = state.hue;
        }
        if (state.intensity !== undefined) {
            this.params.intensity = state.intensity;
        }
    }

    /**
     * Render frame - integrates with CanvasManager's render context
     */
    renderFrame(context) {
        const { timestamp, deltaTime, mouse, scroll, canvas } = context;

        // Update from scroll choreographer if available
        if (this.choreographer) {
            this.choreographer.updateScrollPosition(scroll * document.body.scrollHeight);
            const choreographedState = this.choreographer.update();

            // Apply choreographed state to visualizer
            this.applyChoreographedState(choreographedState);
        }

        // Update mouse position
        this.updateMouse(mouse.x, mouse.y);

        // Update scroll progress
        this.updateScroll(scroll);

        // Auto-rotate 4D over time
        this.params.rot4dXW += deltaTime * 0.00005;
        this.params.rot4dYW += deltaTime * 0.000035;
        this.params.rot4dZW += deltaTime * 0.000025;

        // Render using UnifiedQuantumVisualizer's render method
        this.render(timestamp);
    }

    /**
     * Apply choreographed state from ScrollChoreographer
     */
    applyChoreographedState(state) {
        // Get depth-specific state for background layer
        const depthState = this.choreographer.getStateForDepth(this.depth);

        // Apply all parameters
        this.params.geometry = Math.floor(depthState.geometry);
        this.params.gridDensity = depthState.gridDensity;
        this.params.morphFactor = depthState.morphFactor;
        this.params.chaos = depthState.chaos;
        this.params.speed = depthState.speed;
        this.params.hue = depthState.hue;
        this.params.intensity = depthState.intensity * this.getRoleIntensity();
        this.params.saturation = depthState.saturation;

        // 6D rotations
        this.params.rot4dXY = depthState.rot4dXY || 0;
        this.params.rot4dXZ = depthState.rot4dXZ || 0;
        this.params.rot4dYZ = depthState.rot4dYZ || 0;
        this.params.rot4dXW = depthState.rot4dXW;
        this.params.rot4dYW = depthState.rot4dYW;
        this.params.rot4dZW = depthState.rot4dZW;
    }

    /**
     * Override render to add legacy effects (RGB offset, moiré)
     * This extends the parent's render method with additional post-processing
     */
    render(timestamp) {
        // First, render base visualization using parent's method
        super.render(timestamp);

        // Apply legacy effects as post-processing
        this.applyLegacyEffects();
    }

    /**
     * Apply RGB offset and moiré effects as post-processing
     */
    applyLegacyEffects() {
        const gl = this.gl;

        // Create additional shader program for post-processing if needed
        // For now, these effects are integrated into the shader
        // In the future, we could add a separate post-process pass

        // Update legacy uniforms
        if (this.uniforms.rgbOffset) {
            gl.uniform1f(this.uniforms.rgbOffset, this.legacyParams.rgbOffset);
        }
        if (this.uniforms.moireIntensity) {
            gl.uniform1f(this.uniforms.moireIntensity, this.legacyParams.moireIntensity);
        }
        if (this.uniforms.moireFrequency) {
            gl.uniform1f(this.uniforms.moireFrequency, this.legacyParams.moireFrequency);
        }
    }

    /**
     * Extended shader source with legacy effects
     * Override parent's fragment shader to include RGB offset and moiré
     */
    getFragmentShaderSource() {
        // Start with parent's shader, then add legacy effects
        const parentShader = super.getFragmentShaderSource();

        // Insert additional uniforms and effects
        const enhancedShader = parentShader.replace(
            'uniform float u_scrollProgress;',
            `uniform float u_scrollProgress;
            uniform float u_rgbOffset;
            uniform float u_moireIntensity;
            uniform float u_moireFrequency;`
        );

        // Add moiré pattern before color calculation
        const withMoire = enhancedShader.replace(
            'float density = geometryFunction(p4d);',
            `float density = geometryFunction(p4d);

            // MOIRÉ PATTERN
            float moirePattern = sin((uv.x * u_moireFrequency + u_time * 0.01) * 3.14159) *
                               sin((uv.y * u_moireFrequency - u_time * 0.007) * 3.14159);
            density += moirePattern * u_moireIntensity * 0.15;`
        );

        // Add chromatic aberration after color calculation
        const withChromatic = withMoire.replace(
            'vec3 color = hsv2rgb(vec3(hue, u_saturation, density * u_intensity * roleIntensity));',
            `vec3 color = hsv2rgb(vec3(hue, u_saturation, density * u_intensity * roleIntensity));

            // RGB CHROMATIC ABERRATION
            float redShift = density * (1.0 + u_rgbOffset * 50.0 * (uv.x + 1.0));
            float blueShift = density * (1.0 - u_rgbOffset * 50.0 * (uv.x - 1.0));
            color.r = mix(color.r, redShift * u_intensity * roleIntensity, u_rgbOffset * 5.0);
            color.b = mix(color.b, blueShift * u_intensity * roleIntensity, u_rgbOffset * 5.0);

            // Moiré color distortion
            color = mix(color, color * (1.0 + moirePattern * 0.5), u_moireIntensity * 0.2);`
        );

        return withChromatic;
    }

    /**
     * Override uniform initialization to include legacy uniforms
     */
    initializeUniforms() {
        super.initializeUniforms();

        const gl = this.gl;

        // Add legacy uniforms
        this.uniforms.rgbOffset = gl.getUniformLocation(this.program, 'u_rgbOffset');
        this.uniforms.moireIntensity = gl.getUniformLocation(this.program, 'u_moireIntensity');
        this.uniforms.moireFrequency = gl.getUniformLocation(this.program, 'u_moireFrequency');
    }

    /**
     * Get current geometry name (for debugging)
     */
    getCurrentGeometryName() {
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
        return names[Math.floor(this.params.geometry)] || 'UNKNOWN';
    }

    /**
     * Get current section name from choreographer (for debugging)
     */
    getCurrentSection() {
        return this.choreographer ? this.choreographer.getCurrentSectionName() : 'none';
    }

    /**
     * Public API for updating parameters
     */
    setParameter(name, value) {
        if (this.params[name] !== undefined) {
            this.params[name] = value;
        } else if (this.legacyParams[name] !== undefined) {
            this.legacyParams[name] = value;
        }
    }

    setGeometry(geometryIndex) {
        this.params.geometry = Math.max(0, Math.min(7, Math.floor(geometryIndex)));
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        super.dispose();
        this.choreographer = null;
        console.log('EnhancedQuantumBackground disposed');
    }
}
