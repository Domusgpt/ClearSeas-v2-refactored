/**
 * PolytopalFieldVisualizer - Enhanced particle network with 4D-inspired connections
 * Combines the best of polytopal field visualization with modern canvas management
 *
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format" © 2025
 */

export class PolytopalFieldVisualizer {
    constructor(canvasManager, canvasId, options = {}) {
        this.canvasManager = canvasManager;
        this.canvasId = canvasId;

        this.settings = {
            baseCount: options.baseCount || 80,
            maxVelocity: options.maxVelocity || 0.35,
            connectionDistance: options.connectionDistance || 180,
            colorScheme: options.colorScheme || 'cyan-magenta',
            enablePointerInteraction: options.enablePointerInteraction !== false,
            enableDepthEffect: options.enableDepthEffect !== false,
            particleGlow: options.particleGlow !== false
        };

        this.nodes = [];
        this.pointer = { x: 0, y: 0, active: false };
        this.time = 0;
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;

        const canvasData = this.canvasManager.getCanvas(this.canvasId);
        if (!canvasData) {
            console.error('PolytopalFieldVisualizer: Canvas not found:', this.canvasId);
            return;
        }

        this.ctx = canvasData.ctx;
        this.setupNodes();
        this.setupEventListeners();

        // Register render callback
        this.canvasManager.registerRenderCallback(this.canvasId, this.render.bind(this));

        this.isInitialized = true;
        console.log('✨ PolytopalFieldVisualizer initialized');
    }

    setupNodes() {
        const canvasData = this.canvasManager.getCanvas(this.canvasId);
        const width = canvasData.canvas.width / (window.devicePixelRatio || 1);
        const height = canvasData.canvas.height / (window.devicePixelRatio || 1);

        const nodeCount = Math.round(this.settings.baseCount * (width / 1280 + 0.4));
        this.nodes = Array.from({ length: nodeCount }, () => this.createNode(width, height));
    }

    createNode(width, height) {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 100, // Depth dimension for 4D effect
            vx: (Math.random() - 0.5) * this.settings.maxVelocity,
            vy: (Math.random() - 0.5) * this.settings.maxVelocity,
            vz: (Math.random() - 0.5) * 0.1, // Slow z-axis movement
            radius: Math.random() * 1.4 + 0.8,
            phase: Math.random() * Math.PI * 2 // For orbital effects
        };
    }

    setupEventListeners() {
        if (!this.settings.enablePointerInteraction) return;

        const handleMouseMove = (event) => {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
            this.pointer.active = true;
        };

        const handleMouseLeave = () => {
            this.pointer.active = false;
        };

        const handleTouchMove = (event) => {
            if (event.touches && event.touches.length > 0) {
                this.pointer.x = event.touches[0].clientX;
                this.pointer.y = event.touches[0].clientY;
                this.pointer.active = true;
            }
        };

        const handleTouchEnd = () => {
            this.pointer.active = false;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);

        // Store for cleanup
        this._listeners = [
            { type: 'mousemove', handler: handleMouseMove },
            { type: 'mouseleave', handler: handleMouseLeave },
            { type: 'touchmove', handler: handleTouchMove },
            { type: 'touchend', handler: handleTouchEnd }
        ];
    }

    updateNodes(deltaTime) {
        const canvasData = this.canvasManager.getCanvas(this.canvasId);
        const width = canvasData.canvas.width / (window.devicePixelRatio || 1);
        const height = canvasData.canvas.height / (window.devicePixelRatio || 1);

        this.nodes.forEach((node) => {
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            node.z += node.vz;

            // Update phase for orbital effects
            node.phase += 0.01;

            // Wrap around edges
            if (node.x < -50) node.x = width + 50;
            if (node.x > width + 50) node.x = -50;
            if (node.y < -50) node.y = height + 50;
            if (node.y > height + 50) node.y = -50;
            if (node.z < 0) node.z = 100;
            if (node.z > 100) node.z = 0;

            // Pointer interaction
            if (this.pointer.active && this.settings.enablePointerInteraction) {
                const dx = this.pointer.x - node.x;
                const dy = this.pointer.y - node.y;
                const distSq = dx * dx + dy * dy + 0.001;
                const influence = Math.min(0.45, 1200 / distSq);
                node.vx += dx * influence * 0.00035;
                node.vy += dy * influence * 0.00035;
            }

            // Clamp velocities
            node.vx = this.clamp(node.vx, -this.settings.maxVelocity, this.settings.maxVelocity);
            node.vy = this.clamp(node.vy, -this.settings.maxVelocity, this.settings.maxVelocity);
        });
    }

    drawConnections() {
        const canvasData = this.canvasManager.getCanvas(this.canvasId);
        const width = canvasData.canvas.width / (window.devicePixelRatio || 1);
        const maxDistance = this.settings.connectionDistance * (width < 768 ? 0.75 : 1);

        const { primary, secondary } = this.getColors();

        for (let i = 0; i < this.nodes.length; i++) {
            const nodeA = this.nodes[i];

            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeB = this.nodes[j];
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const dz = (nodeA.z - nodeB.z) * 0.3; // Depth factor
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                    const alpha = (1 - distance / maxDistance) * 0.45;
                    const depthFactor = this.settings.enableDepthEffect ?
                        (1 - Math.abs(nodeA.z - 50) / 50) * 0.5 + 0.5 : 1;

                    this.ctx.strokeStyle = `rgba(${primary}, ${alpha * depthFactor})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeA.x, nodeA.y);
                    this.ctx.lineTo(nodeB.x, nodeB.y);
                    this.ctx.stroke();
                }
            }

            // Pointer connections
            if (this.pointer.active && this.settings.enablePointerInteraction) {
                const dxPointer = nodeA.x - this.pointer.x;
                const dyPointer = nodeA.y - this.pointer.y;
                const pointerDistance = Math.hypot(dxPointer, dyPointer);
                const pointerThreshold = maxDistance * 1.1;

                if (pointerDistance < pointerThreshold) {
                    const alpha = (1 - pointerDistance / pointerThreshold) * 0.6;
                    this.ctx.strokeStyle = `rgba(${secondary}, ${alpha})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeA.x, nodeA.y);
                    this.ctx.lineTo(this.pointer.x, this.pointer.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawNodes() {
        const { primary, secondary } = this.getColors();

        this.nodes.forEach((node) => {
            const scale = this.settings.enableDepthEffect ?
                0.5 + (node.z / 100) * 0.5 : 1;
            const radius = node.radius * scale;

            if (this.settings.particleGlow) {
                const gradient = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, radius * 8
                );
                gradient.addColorStop(0, `rgba(${primary}, 0.55)`);
                gradient.addColorStop(1, `rgba(${primary}, 0)`);
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = `rgba(${primary}, 0.8)`;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Pointer glow effect
        if (this.pointer.active && this.settings.enablePointerInteraction) {
            const pointerGradient = this.ctx.createRadialGradient(
                this.pointer.x, this.pointer.y, 0,
                this.pointer.x, this.pointer.y, 120
            );
            pointerGradient.addColorStop(0, `rgba(${secondary}, 0.25)`);
            pointerGradient.addColorStop(1, `rgba(${secondary}, 0)`);
            this.ctx.fillStyle = pointerGradient;
            this.ctx.beginPath();
            this.ctx.arc(this.pointer.x, this.pointer.y, 120, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    render(deltaTime) {
        if (!this.isInitialized) return;

        const canvasData = this.canvasManager.getCanvas(this.canvasId);
        const width = canvasData.canvas.width / (window.devicePixelRatio || 1);
        const height = canvasData.canvas.height / (window.devicePixelRatio || 1);

        this.time += deltaTime;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw backdrop gradient
        const { primary, secondary } = this.getColors();
        const backdropGradient = this.ctx.createLinearGradient(0, 0, width, height);
        backdropGradient.addColorStop(0, `rgba(${primary}, 0.07)`);
        backdropGradient.addColorStop(1, `rgba(${secondary}, 0.05)`);
        this.ctx.fillStyle = backdropGradient;
        this.ctx.fillRect(0, 0, width, height);

        // Update and draw
        this.updateNodes(deltaTime);
        this.drawConnections();
        this.drawNodes();
    }

    getColors() {
        const schemes = {
            'cyan-magenta': {
                primary: '0, 212, 255',     // Cyan
                secondary: '255, 0, 110'     // Magenta
            },
            'purple': {
                primary: '138, 43, 226',     // Blue Violet
                secondary: '255, 20, 147'    // Deep Pink
            },
            'green': {
                primary: '0, 255, 127',      // Spring Green
                secondary: '50, 205, 50'     // Lime Green
            },
            'gold': {
                primary: '255, 215, 0',      // Gold
                secondary: '255, 140, 0'     // Dark Orange
            }
        };

        return schemes[this.settings.colorScheme] || schemes['cyan-magenta'];
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    dispose() {
        // Remove event listeners
        if (this._listeners) {
            this._listeners.forEach(({ type, handler }) => {
                window.removeEventListener(type, handler);
            });
        }

        // Clear canvas
        if (this.ctx) {
            const canvasData = this.canvasManager.getCanvas(this.canvasId);
            const width = canvasData.canvas.width / (window.devicePixelRatio || 1);
            const height = canvasData.canvas.height / (window.devicePixelRatio || 1);
            this.ctx.clearRect(0, 0, width, height);
        }

        this.isInitialized = false;
        console.log('PolytopalFieldVisualizer disposed');
    }
}

export default PolytopalFieldVisualizer;
