/**
 * ElementVisualizer.js
 *
 * Applies UnifiedQuantumVisualizer to arbitrary DOM elements
 * Creates "bleeding" effect where visualizers morph between elements
 *
 * Inspired by weare-simone.webflow.io's emergent visual transitions
 * and VIB3+ Engine's multi-layer system
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

import { UnifiedQuantumVisualizer } from './UnifiedQuantumVisualizer.js';

export class ElementVisualizer {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            role: options.role || 'content',
            depth: options.depth || 0.5,
            reactivity: options.reactivity || 1.0,
            bleedIntensity: options.bleedIntensity || 0.3,
            autoGeometry: options.autoGeometry !== false, // Auto-select geometry
            hoverBoost: options.hoverBoost !== false,
            ...options
        };

        this.canvas = null;
        this.visualizer = null;
        this.isHovered = false;
        this.isVisible = false;
        this.bleedRadius = options.bleedRadius || 50; // px

        this.initialize();
    }

    /**
     * Initialize canvas and visualizer for this element
     */
    initialize() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('element-visualizer-canvas');

        // Apply CSS for positioning and blending
        this.canvas.style.cssText = `
            position: absolute;
            top: -${this.bleedRadius}px;
            left: -${this.bleedRadius}px;
            width: calc(100% + ${this.bleedRadius * 2}px);
            height: calc(100% + ${this.bleedRadius * 2}px);
            pointer-events: none;
            z-index: 0;
            opacity: ${this.options.bleedIntensity};
            mix-blend-mode: ${this.getMixBlendMode()};
            transition: opacity 0.5s ease;
        `;

        // Ensure parent has position context
        const computedStyle = window.getComputedStyle(this.element);
        if (computedStyle.position === 'static') {
            this.element.style.position = 'relative';
        }

        // Add overflow visible to allow bleeding
        this.element.style.overflow = 'visible';

        // Append canvas to element
        this.element.appendChild(this.canvas);

        // Create WebGL context
        const gl = this.canvas.getContext('webgl', {
            alpha: true,
            antialias: true,
            premultipliedAlpha: false
        });

        if (!gl) {
            console.error('ElementVisualizer: WebGL not supported');
            return;
        }

        // Create visualizer
        const canvasId = `element-viz-${Math.random().toString(36).substr(2, 9)}`;
        this.canvas.id = canvasId;

        this.visualizer = new UnifiedQuantumVisualizer(canvasId, {
            role: this.options.role,
            depth: this.options.depth,
            reactivity: this.options.reactivity
        });

        this.visualizer.canvas = this.canvas;
        this.visualizer.gl = gl;
        const shaderSuccess = this.visualizer.initializeShaders();

        if (!shaderSuccess) {
            console.error('❌ ElementVisualizer: Shader init failed for', this.element);
            return;
        }

        console.log('✅ ElementVisualizer created for', this.element.className, 'geometry:', this.visualizer.params.geometry);

        // Auto-select geometry based on element type
        if (this.options.autoGeometry) {
            this.selectGeometryByElement();
        }

        // Setup intersection observer for visibility
        this.observeVisibility();

        // Setup hover listeners
        this.setupInteractions();

        // Start render loop
        this.startRendering();

        // Handle resize
        this.setupResize();

        console.log(`🎨 ElementVisualizer initialized for element with geometry ${this.visualizer.params.geometry}`);
    }

    /**
     * Auto-select geometry based on element type
     */
    selectGeometryByElement() {
        const tag = this.element.tagName.toLowerCase();
        const classes = this.element.className;

        // Map element types to geometries
        if (classes.includes('card') || classes.includes('signal-card')) {
            this.visualizer.params.geometry = 7; // CRYSTAL - structured, precise
        } else if (classes.includes('button') || classes.includes('cta')) {
            this.visualizer.params.geometry = 1; // HYPERCUBE - dimensional action
        } else if (classes.includes('hero') || classes.includes('header')) {
            this.visualizer.params.geometry = 2; // SPHERE - welcoming
        } else if (tag === 'footer' || classes.includes('contact')) {
            this.visualizer.params.geometry = 0; // TETRAHEDRON - foundation
        } else if (classes.includes('research') || classes.includes('data')) {
            this.visualizer.params.geometry = 5; // FRACTAL - complexity
        } else if (classes.includes('signal') || classes.includes('flow')) {
            this.visualizer.params.geometry = 6; // WAVE - propagation
        } else if (classes.includes('platform') || classes.includes('network')) {
            this.visualizer.params.geometry = 3; // TORUS - connectivity
        } else {
            this.visualizer.params.geometry = 2; // SPHERE - default
        }
    }

    /**
     * Get appropriate blend mode based on role
     */
    getMixBlendMode() {
        const modes = {
            background: 'multiply',
            shadow: 'darken',
            content: 'normal',
            highlight: 'screen',
            accent: 'overlay'
        };
        return modes[this.options.role] || 'normal';
    }

    /**
     * Observe element visibility
     */
    observeVisibility() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (this.isVisible) {
                    this.canvas.style.opacity = this.options.bleedIntensity;
                } else {
                    this.canvas.style.opacity = '0';
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this.element);
    }

    /**
     * Setup hover and interaction effects
     */
    setupInteractions() {
        if (!this.options.hoverBoost) return;

        this.element.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.canvas.style.opacity = Math.min(1.0, this.options.bleedIntensity * 2);
            this.visualizer.params.intensity *= 1.5;
            this.visualizer.params.chaos = Math.min(1.0, this.visualizer.params.chaos + 0.2);
            this.visualizer.params.speed *= 1.3;
        });

        this.element.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.canvas.style.opacity = this.options.bleedIntensity;
            this.visualizer.params.intensity /= 1.5;
            this.visualizer.params.chaos = Math.max(0, this.visualizer.params.chaos - 0.2);
            this.visualizer.params.speed /= 1.3;
        });

        // Click effect
        this.element.addEventListener('click', () => {
            this.pulse();
        });
    }

    /**
     * Pulse effect on interaction
     */
    pulse() {
        const originalIntensity = this.visualizer.params.intensity;
        const originalChaos = this.visualizer.params.chaos;

        // Spike intensity and chaos
        this.visualizer.params.intensity = Math.min(1.0, originalIntensity * 2);
        this.visualizer.params.chaos = Math.min(1.0, originalChaos * 2);

        // Decay back to normal
        setTimeout(() => {
            this.visualizer.params.intensity = originalIntensity;
            this.visualizer.params.chaos = originalChaos;
        }, 300);
    }

    /**
     * Setup resize handler
     */
    setupResize() {
        const resizeObserver = new ResizeObserver(() => {
            this.resize();
        });
        resizeObserver.observe(this.element);
    }

    /**
     * Resize canvas to match element (with bleed)
     */
    resize() {
        const rect = this.element.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const width = (rect.width + this.bleedRadius * 2) * dpr;
        const height = (rect.height + this.bleedRadius * 2) * dpr;

        this.canvas.width = width;
        this.canvas.height = height;

        if (this.visualizer && this.visualizer.gl) {
            this.visualizer.gl.viewport(0, 0, width, height);
        }
    }

    /**
     * Start render loop
     */
    startRendering() {
        let lastTime = performance.now();

        const render = (timestamp) => {
            if (!this.isVisible) {
                requestAnimationFrame(render);
                return;
            }

            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            // Auto-rotate 4D
            this.visualizer.params.rot4dXW += deltaTime * 0.00003;
            this.visualizer.params.rot4dYW += deltaTime * 0.00002;
            this.visualizer.params.rot4dZW += deltaTime * 0.00001;

            // Render visualizer
            this.visualizer.render(timestamp);

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    }

    /**
     * Update parameters from choreographer or external source
     */
    applyState(state) {
        Object.assign(this.visualizer.params, state);
    }

    /**
     * Set specific parameter
     */
    setParameter(name, value) {
        if (this.visualizer.params[name] !== undefined) {
            this.visualizer.params[name] = value;
        }
    }

    /**
     * Set geometry
     */
    setGeometry(geometryIndex) {
        this.visualizer.params.geometry = Math.max(0, Math.min(7, Math.floor(geometryIndex)));
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        if (this.visualizer) {
            this.visualizer.dispose();
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        console.log('ElementVisualizer disposed');
    }
}

/**
 * ElementVisualizerManager
 *
 * Manages multiple ElementVisualizers and coordinates their transitions
 * Creates "bleeding" effects between adjacent elements
 */
export class ElementVisualizerManager {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.visualizers = new Map();
        this.bleedLinks = new Map(); // Track which elements bleed into each other
    }

    /**
     * Add visualizer to an element
     */
    addToElement(element, options = {}) {
        const id = element.dataset.vizId || `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        element.dataset.vizId = id;

        const visualizer = new ElementVisualizer(element, options);
        this.visualizers.set(id, visualizer);

        return visualizer;
    }

    /**
     * Add visualizers to all elements matching a selector
     */
    addToSelector(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        const visualizers = [];

        elements.forEach(element => {
            const viz = this.addToElement(element, options);
            visualizers.push(viz);
        });

        return visualizers;
    }

    /**
     * Link two elements for bleeding effect
     */
    linkElements(element1, element2, bleedFactor = 0.5) {
        const id1 = element1.dataset.vizId;
        const id2 = element2.dataset.vizId;

        if (!id1 || !id2) {
            console.warn('Elements must have visualizers before linking');
            return;
        }

        if (!this.bleedLinks.has(id1)) {
            this.bleedLinks.set(id1, []);
        }
        this.bleedLinks.get(id1).push({ id: id2, factor: bleedFactor });

        console.log(`🔗 Linked visualizers: ${id1} → ${id2}`);
    }

    /**
     * Auto-detect adjacent elements and link them
     */
    autoLinkAdjacent(selector, maxDistance = 100) {
        const elements = Array.from(document.querySelectorAll(selector));

        elements.forEach((el1, i) => {
            elements.slice(i + 1).forEach(el2 => {
                const rect1 = el1.getBoundingClientRect();
                const rect2 = el2.getBoundingClientRect();

                // Calculate distance between element centers
                const center1 = {
                    x: rect1.left + rect1.width / 2,
                    y: rect1.top + rect1.height / 2
                };
                const center2 = {
                    x: rect2.left + rect2.width / 2,
                    y: rect2.top + rect2.height / 2
                };

                const distance = Math.sqrt(
                    Math.pow(center2.x - center1.x, 2) +
                    Math.pow(center2.y - center1.y, 2)
                );

                if (distance < maxDistance) {
                    const bleedFactor = 1 - (distance / maxDistance);
                    this.linkElements(el1, el2, bleedFactor);
                }
            });
        });
    }

    /**
     * Update all visualizers with choreographed state
     */
    updateFromChoreographer() {
        if (!this.orchestrator) return;

        const choreographer = this.orchestrator.getChoreographer();
        if (!choreographer) return;

        const state = choreographer.currentState;

        this.visualizers.forEach((visualizer, id) => {
            // Apply depth-specific state
            const depthState = choreographer.getStateForDepth(visualizer.options.depth);
            visualizer.applyState(depthState);
        });
    }

    /**
     * Start coordinated update loop
     */
    startCoordination() {
        const update = () => {
            this.updateFromChoreographer();
            this.applyBleedingEffects();
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    /**
     * Apply bleeding effects between linked elements
     */
    applyBleedingEffects() {
        this.bleedLinks.forEach((links, sourceId) => {
            const sourceViz = this.visualizers.get(sourceId);
            if (!sourceViz) return;

            links.forEach(({ id: targetId, factor }) => {
                const targetViz = this.visualizers.get(targetId);
                if (!targetViz) return;

                // Blend parameters between source and target
                const sourceParams = sourceViz.visualizer.params;
                const targetParams = targetViz.visualizer.params;

                // Interpolate geometry (snap at 50%)
                if (factor > 0.5) {
                    targetParams.geometry = sourceParams.geometry;
                }

                // Interpolate other parameters
                targetParams.hue += (sourceParams.hue - targetParams.hue) * factor * 0.1;
                targetParams.intensity += (sourceParams.intensity - targetParams.intensity) * factor * 0.1;
                targetParams.chaos += (sourceParams.chaos - targetParams.chaos) * factor * 0.1;
            });
        });
    }

    /**
     * Remove visualizer from element
     */
    removeFromElement(element) {
        const id = element.dataset.vizId;
        if (!id) return;

        const visualizer = this.visualizers.get(id);
        if (visualizer) {
            visualizer.dispose();
            this.visualizers.delete(id);
        }

        delete element.dataset.vizId;
    }

    /**
     * Dispose all visualizers
     */
    disposeAll() {
        this.visualizers.forEach(viz => viz.dispose());
        this.visualizers.clear();
        this.bleedLinks.clear();
    }
}
