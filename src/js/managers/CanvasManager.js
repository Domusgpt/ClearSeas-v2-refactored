/**
 * Advanced Canvas Manager
 * Handles WebGL context creation, pooling, lifecycle, and performance monitoring
 */

export class CanvasManager {
    constructor() {
        this.contexts = new Map();
        this.canvases = new Map();
        this.performanceMetrics = new Map();
        this.contextPool = [];
        this.maxPoolSize = 10;
        this.renderCallbacks = new Map();
        this.globalTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.adaptiveQuality = true;
        this.qualityLevel = 1.0; // 0.5 to 1.0
        
        // Performance thresholds
        this.targetFPS = 60;
        this.minFPS = 30;
        this.performanceCheckInterval = 1000; // ms
        this.lastPerformanceCheck = performance.now();
        
        // Global interaction state
        this.mousePosition = { x: 0.5, y: 0.5 };
        this.mouseVelocity = { x: 0, y: 0 };
        this.scrollProgress = 0;
        this.viewportSize = { width: window.innerWidth, height: window.innerHeight };
        
        this.setupGlobalListeners();
    }
    
    /**
     * Create and register a canvas with WebGL context
     */
    createCanvas(id, options = {}) {
        const {
            container = document.body,
            width = 800,
            height = 600,
            alpha = true,
            antialias = true,
            premultipliedAlpha = true,
            preserveDrawingBuffer = false,
            powerPreference = 'high-performance',
            dpr = Math.min(window.devicePixelRatio || 1, 2),
            webgl2 = true
        } = options;
        
        // Check if already exists
        if (this.canvases.has(id)) {
            console.warn(`Canvas with id ${id} already exists`);
            return this.canvases.get(id);
        }
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.id = `canvas-${id}`;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // Try to get WebGL context
        const contextOptions = {
            alpha,
            antialias,
            premultipliedAlpha,
            preserveDrawingBuffer,
            powerPreference
        };
        
        let gl = null;
        
        if (webgl2) {
            gl = canvas.getContext('webgl2', contextOptions);
        }
        
        if (!gl) {
            gl = canvas.getContext('webgl', contextOptions) || 
                 canvas.getContext('experimental-webgl', contextOptions);
        }
        
        if (!gl) {
            console.error('WebGL not supported for canvas:', id);
            return null;
        }
        
        // Store canvas data
        const canvasData = {
            id,
            canvas,
            gl,
            dpr,
            width,
            height,
            container,
            options,
            isActive: true,
            lastRenderTime: 0,
            renderCount: 0
        };
        
        this.canvases.set(id, canvasData);
        this.contexts.set(id, gl);
        
        // Initialize performance metrics
        this.performanceMetrics.set(id, {
            fps: 60,
            frameTime: 16.67,
            drawCalls: 0,
            triangles: 0,
            lastUpdate: performance.now()
        });
        
        // Append to container if specified
        if (container) {
            container.appendChild(canvas);
        }
        
        console.log(`✅ Canvas ${id} created (WebGL${gl instanceof WebGL2RenderingContext ? '2' : '1'})`);
        
        return canvasData;
    }
    
    /**
     * Register a render callback for a canvas
     */
    registerRenderer(canvasId, callback, priority = 0) {
        if (!this.canvases.has(canvasId)) {
            console.error(`Canvas ${canvasId} not found`);
            return false;
        }
        
        if (!this.renderCallbacks.has(canvasId)) {
            this.renderCallbacks.set(canvasId, []);
        }
        
        this.renderCallbacks.get(canvasId).push({
            callback,
            priority,
            enabled: true
        });
        
        // Sort by priority (higher first)
        this.renderCallbacks.get(canvasId).sort((a, b) => b.priority - a.priority);
        
        return true;
    }
    
    /**
     * Resize a canvas
     */
    resizeCanvas(canvasId, width, height) {
        const canvasData = this.canvases.get(canvasId);
        if (!canvasData) return false;
        
        const { canvas, dpr } = canvasData;
        
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        canvasData.width = width;
        canvasData.height = height;
        
        // Update viewport
        const gl = canvasData.gl;
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        return true;
    }
    
    /**
     * Auto-resize canvas to match container or viewport
     */
    autoResize(canvasId) {
        const canvasData = this.canvases.get(canvasId);
        if (!canvasData) return false;
        
        const { container, canvas } = canvasData;
        
        let width, height;
        
        if (container === document.body || !container.parentElement) {
            width = window.innerWidth;
            height = window.innerHeight;
        } else {
            const rect = container.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
        }
        
        return this.resizeCanvas(canvasId, width, height);
    }
    
    /**
     * Get canvas data
     */
    getCanvas(canvasId) {
        return this.canvases.get(canvasId);
    }
    
    /**
     * Get WebGL context
     */
    getContext(canvasId) {
        return this.contexts.get(canvasId);
    }
    
    /**
     * Destroy canvas and clean up resources
     */
    destroyCanvas(canvasId) {
        const canvasData = this.canvases.get(canvasId);
        if (!canvasData) return false;
        
        const { canvas, gl } = canvasData;
        
        // Lose context
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
            loseContext.loseContext();
        }
        
        // Remove from DOM
        if (canvas.parentElement) {
            canvas.parentElement.removeChild(canvas);
        }
        
        // Clean up
        this.canvases.delete(canvasId);
        this.contexts.delete(canvasId);
        this.renderCallbacks.delete(canvasId);
        this.performanceMetrics.delete(canvasId);
        
        console.log(`🗑️ Canvas ${canvasId} destroyed`);
        
        return true;
    }
    
    /**
     * Main render loop
     */
    render(timestamp) {
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        this.globalTime = timestamp;
        this.frameCount++;
        
        // Update FPS
        this.fps = 1000 / deltaTime;
        
        // Adaptive quality check
        if (this.adaptiveQuality && timestamp - this.lastPerformanceCheck > this.performanceCheckInterval) {
            this.adjustQuality();
            this.lastPerformanceCheck = timestamp;
        }
        
        // Render all active canvases
        this.canvases.forEach((canvasData, canvasId) => {
            if (!canvasData.isActive) return;
            
            const callbacks = this.renderCallbacks.get(canvasId);
            if (!callbacks || callbacks.length === 0) return;
            
            const renderStart = performance.now();
            
            // Execute all enabled callbacks
            callbacks.forEach(({ callback, enabled }) => {
                if (enabled) {
                    try {
                        callback({
                            timestamp,
                            deltaTime,
                            globalTime: this.globalTime,
                            canvas: canvasData.canvas,
                            gl: canvasData.gl,
                            mouse: this.mousePosition,
                            mouseVelocity: this.mouseVelocity,
                            scroll: this.scrollProgress,
                            viewport: this.viewportSize,
                            quality: this.qualityLevel
                        });
                    } catch (error) {
                        console.error(`Render error in canvas ${canvasId}:`, error);
                    }
                }
            });
            
            // Update metrics
            const renderTime = performance.now() - renderStart;
            canvasData.lastRenderTime = renderTime;
            canvasData.renderCount++;
            
            const metrics = this.performanceMetrics.get(canvasId);
            if (metrics) {
                metrics.frameTime = renderTime;
                metrics.fps = 1000 / renderTime;
                metrics.lastUpdate = timestamp;
            }
        });
        
        requestAnimationFrame((t) => this.render(t));
    }
    
    /**
     * Start the render loop
     */
    start() {
        console.log('🎬 Canvas Manager: Starting render loop');
        requestAnimationFrame((t) => this.render(t));
    }
    
    /**
     * Adjust quality based on performance
     */
    adjustQuality() {
        if (this.fps < this.minFPS) {
            // Decrease quality
            this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.1);
            console.log(`⚡ Quality decreased to ${this.qualityLevel.toFixed(2)}`);
        } else if (this.fps > this.targetFPS * 0.95 && this.qualityLevel < 1.0) {
            // Increase quality
            this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
            console.log(`⬆️ Quality increased to ${this.qualityLevel.toFixed(2)}`);
        }
    }
    
    /**
     * Get performance metrics
     */
    getMetrics(canvasId = null) {
        if (canvasId) {
            return this.performanceMetrics.get(canvasId);
        }
        
        // Return global metrics
        return {
            fps: this.fps,
            quality: this.qualityLevel,
            activeCanvases: Array.from(this.canvases.values()).filter(c => c.isActive).length,
            totalCanvases: this.canvases.size,
            frameCount: this.frameCount
        };
    }
    
    /**
     * Setup global interaction listeners
     */
    setupGlobalListeners() {
        let lastMouseX = 0;
        let lastMouseY = 0;
        let pendingMouseUpdate = false;
        let pendingScrollUpdate = false;
        let tempMouseX = 0;
        let tempMouseY = 0;
        let tempScrollTop = 0;

        // OPTIMIZED: RAF-throttled mouse movement for 60fps max
        const updateMousePosition = () => {
            if (!pendingMouseUpdate) return;

            const x = tempMouseX / window.innerWidth;
            const y = 1.0 - (tempMouseY / window.innerHeight);

            this.mouseVelocity.x = x - lastMouseX;
            this.mouseVelocity.y = y - lastMouseY;

            this.mousePosition.x = x;
            this.mousePosition.y = y;

            lastMouseX = x;
            lastMouseY = y;

            pendingMouseUpdate = false;
        };

        // Mouse movement - capture but defer update to RAF
        document.addEventListener('mousemove', (e) => {
            tempMouseX = e.clientX;
            tempMouseY = e.clientY;
            pendingMouseUpdate = true;
        }, { passive: true });

        // OPTIMIZED: RAF-throttled scroll tracking
        const updateScrollPosition = () => {
            if (!pendingScrollUpdate) return;

            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollProgress = docHeight > 0 ? tempScrollTop / docHeight : 0;

            pendingScrollUpdate = false;
        };

        // Scroll tracking - capture but defer update to RAF
        window.addEventListener('scroll', () => {
            tempScrollTop = window.pageYOffset;
            pendingScrollUpdate = true;
        }, { passive: true });

        // Apply updates in render loop
        const originalRender = this.render.bind(this);
        this.render = function(timestamp) {
            updateMousePosition();
            updateScrollPosition();
            originalRender(timestamp);
        };
        
        // Viewport resize
        window.addEventListener('resize', () => {
            this.viewportSize.width = window.innerWidth;
            this.viewportSize.height = window.innerHeight;
            
            // Auto-resize all canvases that need it
            this.canvases.forEach((canvasData, canvasId) => {
                if (canvasData.options.autoResize) {
                    this.autoResize(canvasId);
                }
            });
        });
        
        // Visibility change - pause rendering when tab is hidden
        document.addEventListener('visibilitychange', () => {
            const isVisible = !document.hidden;
            this.canvases.forEach((canvasData) => {
                canvasData.isActive = isVisible;
            });
            
            if (isVisible) {
                console.log('👁️ Tab visible: Resuming rendering');
            } else {
                console.log('🔇 Tab hidden: Pausing rendering');
            }
        });
    }
    
    /**
     * Enable/disable canvas rendering
     */
    setCanvasActive(canvasId, active) {
        const canvasData = this.canvases.get(canvasId);
        if (canvasData) {
            canvasData.isActive = active;
            return true;
        }
        return false;
    }
    
    /**
     * Set adaptive quality mode
     */
    setAdaptiveQuality(enabled) {
        this.adaptiveQuality = enabled;
        console.log(`📊 Adaptive quality: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Manually set quality level
     */
    setQuality(level) {
        this.qualityLevel = Math.max(0.5, Math.min(1.0, level));
        console.log(`🎨 Quality set to: ${this.qualityLevel.toFixed(2)}`);
    }
    
    /**
     * Get all canvas IDs
     */
    getAllCanvasIds() {
        return Array.from(this.canvases.keys());
    }
    
    /**
     * Clear and dispose of all canvases
     */
    dispose() {
        console.log('🧹 Disposing all canvases...');
        this.getAllCanvasIds().forEach(id => this.destroyCanvas(id));
        this.contexts.clear();
        this.performanceMetrics.clear();
        this.renderCallbacks.clear();
    }
}
