/**
 * MultiLayerQuantumVisualizer - 5-Layer Quantum Canvas System
 * Inspired by minoots-web with dynamic GSAP-driven parameter changes
 *
 * Features:
 * - 5 canvas layers (background, shadow, content, highlight, accent)
 * - Mix-blend-modes for holographic effects
 * - Dynamic parameter changes based on scroll progress
 * - Theme-based color transitions
 * - Smooth state transitions (intro, condensing, scrolling, ejecting)
 *
 * © 2025 Clear Seas Solutions LLC
 */

export class MultiLayerQuantumVisualizer {
    constructor() {
        this.layers = {
            background: null,
            shadow: null,
            content: null,
            highlight: null,
            accent: null
        };

        this.canvases = {};
        this.contexts = {};
        this.state = 'intro'; // intro, condensing, scrolling, ejecting
        this.animationFrame = null;

        // Current visualization parameters
        this.params = {
            hue: 180,           // 0-360
            intensity: 0.7,     // 0-1
            chaos: 0.3,         // 0-1
            speed: 1.0,         // 0-2
            gridDensity: 30,    // 10-50
            rotation: 0,        // 0-360
            scale: 1.0          // 0.5-2
        };

        // Target parameters for smooth transitions
        this.targetParams = { ...this.params };

        console.log('🌌 MultiLayerQuantumVisualizer initialized');
    }

    /**
     * Initialize all 5 canvas layers
     */
    initialize() {
        console.log('🎨 Creating 5-layer quantum canvas system...');

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'quantum-layers';
        wrapper.id = 'quantum-visualizer';
        document.body.insertBefore(wrapper, document.body.firstChild);

        // Create 5 canvas layers
        const layerNames = ['background', 'shadow', 'content', 'highlight', 'accent'];
        const opacities = [0.3, 0.2, 0.6, 0.4, 0.25];
        const blendModes = ['screen', 'multiply', 'screen', 'screen', 'screen'];

        layerNames.forEach((name, index) => {
            const canvas = document.createElement('canvas');
            canvas.id = `quantum-${name}`;
            canvas.className = 'quantum-canvas';
            canvas.style.opacity = opacities[index];
            canvas.style.zIndex = index + 1;
            canvas.style.mixBlendMode = blendModes[index];

            wrapper.appendChild(canvas);

            this.canvases[name] = canvas;
            this.contexts[name] = canvas.getContext('2d');
            this.layers[name] = {
                canvas,
                ctx: canvas.getContext('2d'),
                opacity: opacities[index],
                blendMode: blendModes[index],
                offset: index * 0.1
            };
        });

        // Set canvas sizes
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start animation loop
        this.startAnimation();

        console.log('✅ 5-layer quantum system ready');
    }

    /**
     * Resize all canvases
     */
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        Object.values(this.canvases).forEach(canvas => {
            canvas.width = width;
            canvas.height = height;
        });
    }

    /**
     * Update visualization parameters (smooth transition)
     */
    updateParameters(newParams, duration = 1.0) {
        // Set target parameters for smooth interpolation
        Object.keys(newParams).forEach(key => {
            if (this.targetParams.hasOwnProperty(key)) {
                this.targetParams[key] = newParams[key];
            }
        });

        console.log('🎨 Updating quantum parameters:', newParams);
    }

    /**
     * Set theme colors
     */
    setTheme(theme) {
        const themes = {
            cyan: { hue: 180, secondary: 200 },
            magenta: { hue: 300, secondary: 320 },
            green: { hue: 120, secondary: 140 },
            purple: { hue: 270, secondary: 290 },
            orange: { hue: 30, secondary: 40 },
            blue: { hue: 210, secondary: 230 }
        };

        if (themes[theme]) {
            this.updateParameters({
                hue: themes[theme].hue
            });
        }
    }

    /**
     * Set visualizer state with animation
     */
    setState(newState) {
        const wrapper = document.getElementById('quantum-visualizer');
        if (!wrapper) return;

        // Remove old state classes
        wrapper.classList.remove('intro', 'condensing', 'ejecting', 'scrolling');

        // Add new state class
        wrapper.classList.add(newState);
        this.state = newState;

        console.log(`🌊 Visualizer state: ${newState}`);
    }

    /**
     * Smoothly interpolate current params toward target params
     */
    interpolateParams(delta = 0.05) {
        Object.keys(this.params).forEach(key => {
            const current = this.params[key];
            const target = this.targetParams[key];
            const diff = target - current;

            if (Math.abs(diff) > 0.01) {
                this.params[key] += diff * delta;
            }
        });
    }

    /**
     * Render all 5 layers
     */
    render() {
        // Interpolate parameters smoothly
        this.interpolateParams();

        // Render each layer with offset for depth effect
        Object.entries(this.layers).forEach(([name, layer]) => {
            this.renderLayer(layer, layer.offset);
        });
    }

    /**
     * Render individual layer with quantum field effect
     */
    renderLayer(layer, offset) {
        const { ctx, canvas } = layer;
        const { width, height } = canvas;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context
        ctx.save();

        // Apply global transformations
        ctx.translate(width / 2, height / 2);
        ctx.rotate((this.params.rotation + offset * 20) * Math.PI / 180);
        ctx.scale(this.params.scale, this.params.scale);
        ctx.translate(-width / 2, -height / 2);

        // Render quantum field grid
        this.renderQuantumField(ctx, width, height, offset);

        // Render flowing particles
        this.renderParticles(ctx, width, height, offset);

        // Restore context
        ctx.restore();
    }

    /**
     * Render quantum field grid
     */
    renderQuantumField(ctx, width, height, offset) {
        const time = Date.now() * 0.001 * this.params.speed;
        const gridSize = this.params.gridDensity;
        const step = Math.max(width, height) / gridSize;

        ctx.strokeStyle = `hsla(${this.params.hue + offset * 20}, 100%, 50%, ${this.params.intensity})`;
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += step) {
            for (let y = 0; y < height; y += step) {
                const wave = Math.sin(x * 0.01 + time + offset) * Math.cos(y * 0.01 + time + offset);
                const distortion = wave * this.params.chaos * 50;

                ctx.beginPath();
                ctx.arc(
                    x + distortion,
                    y + distortion,
                    2 + wave * 3,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
        }
    }

    /**
     * Render flowing particles
     */
    renderParticles(ctx, width, height, offset) {
        const time = Date.now() * 0.001 * this.params.speed;
        const particleCount = Math.floor(50 * this.params.intensity);

        ctx.fillStyle = `hsla(${this.params.hue + offset * 30}, 100%, 60%, ${this.params.intensity * 0.5})`;

        for (let i = 0; i < particleCount; i++) {
            const t = (time + i + offset) * 0.5;
            const x = ((i * 137.5 + t * 100) % width);
            const y = ((i * 73.3 + t * 80) % height);
            const size = 1 + Math.sin(t + i) * 2;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Start animation loop
     */
    startAnimation() {
        const animate = () => {
            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Stop animation
     */
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Get current parameters
     */
    getParameters() {
        return { ...this.params };
    }
}

/**
 * A Paul Phillips Manifestation
 * © 2025 Clear Seas Solutions LLC - All Rights Reserved
 */
