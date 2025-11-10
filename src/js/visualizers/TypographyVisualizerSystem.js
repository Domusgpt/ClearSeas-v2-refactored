/**
 * TypographyVisualizerSystem.js
 *
 * Applies WebGL visualizers to EVERY text element (character-level)
 * Inspired by weare-simone's SplitType + our 4D geometry system
 *
 * Creates the effect of text "bleeding" and morphing with geometry
 *
 * © 2025 Clear Seas Solutions LLC - Paul Phillips
 */

// SplitType loaded from CDN in index.html
const SplitType = window.SplitType;

import { UnifiedQuantumVisualizer } from './UnifiedQuantumVisualizer.js';

export class TypographyVisualizerSystem {
    constructor(visualOrchestrator, options = {}) {
        this.orchestrator = visualOrchestrator;
        this.visualizers = new Map();
        this.options = {
            applyTo: options.applyTo || 'h1, h2, h3, .hero-lede, .eyebrow',
            bleedRadius: options.bleedRadius || 30,
            intensity: options.intensity || 0.4,
            ...options
        };

        this.splitInstances = [];
    }

    /**
     * Apply visualizers to all typography
     */
    initialize() {
        const elements = document.querySelectorAll(this.options.applyTo);
        console.log(`📝 TypographyVisualizerSystem: Found ${elements.length} text elements`);

        elements.forEach((element, index) => {
            this.applyToElement(element, index);
        });

        console.log(`✅ Typography visualizers applied to ${this.visualizers.size} characters`);
    }

    /**
     * Apply visualizer to a text element (character-level)
     */
    applyToElement(element, elementIndex) {
        // Skip if already processed
        if (element.dataset.typographyVisualized) return;

        // Split text into characters using SplitType
        const split = new SplitType(element, { types: 'chars' });
        this.splitInstances.push(split);

        // Get choreographer for state sync
        const choreographer = this.orchestrator?.getChoreographer();
        if (!choreographer) {
            console.warn('TypographyVisualizerSystem: No choreographer available');
            return;
        }

        // Apply visualizer to each character
        split.chars.forEach((char, charIndex) => {
            this.applyToCharacter(char, elementIndex, charIndex, choreographer);
        });

        element.dataset.typographyVisualized = 'true';
    }

    /**
     * Apply visualizer to individual character
     */
    applyToCharacter(charElement, elementIndex, charIndex, choreographer) {
        // Make character position relative
        charElement.style.position = 'relative';
        charElement.style.display = 'inline-block';
        charElement.style.zIndex = '1'; // Text above visualizer

        // Create canvas behind character
        const canvas = document.createElement('canvas');
        const canvasId = `char-viz-${elementIndex}-${charIndex}`;
        canvas.id = canvasId;
        canvas.classList.add('char-visualizer-canvas');

        // Position canvas behind character
        canvas.style.cssText = `
            position: absolute;
            top: -${this.options.bleedRadius}px;
            left: -${this.options.bleedRadius}px;
            width: calc(100% + ${this.options.bleedRadius * 2}px);
            height: calc(100% + ${this.options.bleedRadius * 2}px);
            pointer-events: none;
            z-index: 0;
            opacity: ${this.options.intensity};
            mix-blend-mode: screen;
        `;

        // Insert canvas
        charElement.appendChild(canvas);

        // Create WebGL context
        const gl = canvas.getContext('webgl', {
            alpha: true,
            antialias: true,
            premultipliedAlpha: false
        });

        if (!gl) {
            console.error('TypographyVisualizerSystem: WebGL not supported for character');
            return;
        }

        // Create visualizer
        const visualizer = new UnifiedQuantumVisualizer(canvasId, {
            role: 'accent',
            depth: 0.7 + (charIndex / 100) * 0.3, // Stagger depth
            reactivity: 1.5
        });

        visualizer.canvas = canvas;
        visualizer.gl = gl;
        visualizer.initializeShaders();

        // Select geometry based on character position
        visualizer.params.geometry = (elementIndex + charIndex) % 8;
        visualizer.params.hue = (charIndex / split.chars.length) * 360;
        visualizer.params.gridDensity = 40 + charIndex * 2;

        // Store visualizer
        this.visualizers.set(canvasId, {
            visualizer,
            element: charElement,
            canvas,
            index: charIndex
        });

        // Start render loop for this character
        this.startCharacterRenderLoop(canvasId, choreographer);

        // Resize canvas to character size
        this.resizeCharacterCanvas(canvasId);
    }

    /**
     * Start render loop for character visualizer
     */
    startCharacterRenderLoop(canvasId, choreographer) {
        const vizData = this.visualizers.get(canvasId);
        if (!vizData) return;

        const { visualizer, canvas } = vizData;
        let lastTime = performance.now();

        const render = (timestamp) => {
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            // Sync with choreographer
            const state = choreographer.currentState;
            visualizer.params.hue = (visualizer.params.hue + deltaTime * 0.01) % 360;
            visualizer.params.rot4dXW = state.rot4dXW + vizData.index * 0.05;
            visualizer.params.rot4dYW = state.rot4dYW + vizData.index * 0.03;
            visualizer.params.rot4dZW = state.rot4dZW + vizData.index * 0.02;
            visualizer.params.morphFactor = state.morphFactor;
            visualizer.params.chaos = state.chaos * 0.5; // Less chaos for text

            // Render
            visualizer.render(timestamp);

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    }

    /**
     * Resize character canvas to fit character bounds
     */
    resizeCharacterCanvas(canvasId) {
        const vizData = this.visualizers.get(canvasId);
        if (!vizData) return;

        const { element, canvas, visualizer } = vizData;
        const rect = element.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const width = (rect.width + this.options.bleedRadius * 2) * dpr;
        const height = (rect.height + this.options.bleedRadius * 2) * dpr;

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        if (visualizer.gl) {
            visualizer.gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    /**
     * Update all character visualizers (call on scroll/resize)
     */
    update() {
        this.visualizers.forEach((vizData, canvasId) => {
            this.resizeCharacterCanvas(canvasId);
        });
    }

    /**
     * Dispose all visualizers
     */
    dispose() {
        this.visualizers.forEach(({ visualizer, canvas }) => {
            visualizer.dispose();
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        });
        this.visualizers.clear();

        // Revert SplitType
        this.splitInstances.forEach(split => split.revert());
        this.splitInstances = [];
    }
}

/**
 * A Paul Phillips Manifestation
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Clear Seas Solutions LLC
 */
