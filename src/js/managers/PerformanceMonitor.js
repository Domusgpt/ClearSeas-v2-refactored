/**
 * ADDITION #2: Performance Monitor UI
 * Real-time performance metrics overlay with graphs and controls
 */

export class PerformanceMonitor {
    constructor(canvasManager, options = {}) {
        this.manager = canvasManager;
        
        this.options = {
            position: options.position || 'top-right', // top-left, top-right, bottom-left, bottom-right
            width: options.width || 320,
            theme: options.theme || 'dark',
            updateInterval: options.updateInterval || 500,
            historyLength: options.historyLength || 60,
            startVisible: options.startVisible !== undefined ? options.startVisible : true,
            ...options
        };
        
        this.isVisible = this.options.startVisible;
        this.container = null;
        this.fpsHistory = [];
        this.frameTimeHistory = [];
        this.qualityHistory = [];
        this.lastUpdate = 0;
        
        this.initialize();
    }
    
    initialize() {
        this.createUI();
        this.setupEventListeners();
        this.startMonitoring();
        console.log('📊 Performance Monitor initialized');
    }
    
    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'performance-monitor';
        this.container.className = `perf-monitor perf-monitor-${this.options.position} ${this.isVisible ? '' : 'hidden'}`;
        
        this.container.innerHTML = `
            <div class="perf-header">
                <span class="perf-title">⚡ Performance</span>
                <div class="perf-controls">
                    <button class="perf-btn perf-btn-minimize" title="Minimize">−</button>
                    <button class="perf-btn perf-btn-close" title="Close">×</button>
                </div>
            </div>
            
            <div class="perf-body">
                <!-- FPS Display -->
                <div class="perf-metric">
                    <div class="perf-metric-header">
                        <span class="perf-metric-label">FPS</span>
                        <span class="perf-metric-value" id="perf-fps">--</span>
                    </div>
                    <canvas class="perf-graph" id="perf-fps-graph" width="280" height="60"></canvas>
                </div>
                
                <!-- Frame Time -->
                <div class="perf-metric">
                    <div class="perf-metric-header">
                        <span class="perf-metric-label">Frame Time</span>
                        <span class="perf-metric-value" id="perf-frame-time">--</span>
                    </div>
                    <canvas class="perf-graph" id="perf-frame-time-graph" width="280" height="60"></canvas>
                </div>
                
                <!-- Quality Level -->
                <div class="perf-metric">
                    <div class="perf-metric-header">
                        <span class="perf-metric-label">Quality</span>
                        <span class="perf-metric-value" id="perf-quality">--</span>
                    </div>
                    <div class="perf-quality-bar">
                        <div class="perf-quality-fill" id="perf-quality-fill"></div>
                    </div>
                </div>
                
                <!-- Canvas Count -->
                <div class="perf-stat">
                    <span class="perf-stat-label">Active Canvases</span>
                    <span class="perf-stat-value" id="perf-canvas-count">--</span>
                </div>
                
                <!-- Frame Count -->
                <div class="perf-stat">
                    <span class="perf-stat-label">Total Frames</span>
                    <span class="perf-stat-value" id="perf-frame-count">--</span>
                </div>
                
                <!-- Adaptive Quality Toggle -->
                <div class="perf-control">
                    <label class="perf-toggle">
                        <input type="checkbox" id="perf-adaptive-quality" checked>
                        <span class="perf-toggle-slider"></span>
                        <span class="perf-toggle-label">Adaptive Quality</span>
                    </label>
                </div>
                
                <!-- Manual Quality Slider -->
                <div class="perf-control" id="perf-manual-quality-control" style="display: none;">
                    <label class="perf-slider-label">Manual Quality</label>
                    <input type="range" class="perf-slider" id="perf-quality-slider" 
                           min="0.5" max="1.0" step="0.05" value="1.0">
                </div>
            </div>
            
            <!-- Keyboard Shortcut Hint -->
            <div class="perf-hint">Press 'P' to toggle</div>
        `;
        
        document.body.appendChild(this.container);
        
        this.injectStyles();
    }
    
    injectStyles() {
        if (document.getElementById('perf-monitor-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'perf-monitor-styles';
        style.textContent = `
            .perf-monitor {
                position: fixed;
                z-index: 999999;
                width: ${this.options.width}px;
                background: ${this.options.theme === 'dark' ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                border: 1px solid ${this.options.theme === 'dark' ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
                border-radius: 12px;
                backdrop-filter: blur(20px);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 13px;
                color: ${this.options.theme === 'dark' ? '#fff' : '#000'};
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
            }
            
            .perf-monitor.hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateY(-20px);
            }
            
            .perf-monitor.minimized .perf-body {
                display: none;
            }
            
            .perf-monitor-top-left {
                top: 20px;
                left: 20px;
            }
            
            .perf-monitor-top-right {
                top: 20px;
                right: 20px;
            }
            
            .perf-monitor-bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .perf-monitor-bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .perf-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid ${this.options.theme === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
            }
            
            .perf-title {
                font-weight: 600;
                font-size: 14px;
                background: linear-gradient(135deg, #00d4ff, #a855f7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .perf-controls {
                display: flex;
                gap: 8px;
            }
            
            .perf-btn {
                background: transparent;
                border: none;
                color: ${this.options.theme === 'dark' ? '#fff' : '#000'};
                font-size: 18px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            
            .perf-btn:hover {
                background: ${this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            }
            
            .perf-body {
                padding: 16px;
            }
            
            .perf-metric {
                margin-bottom: 16px;
            }
            
            .perf-metric-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .perf-metric-label {
                font-weight: 500;
                opacity: 0.7;
            }
            
            .perf-metric-value {
                font-weight: 600;
                font-size: 16px;
                font-family: 'Monaco', 'Courier New', monospace;
                color: #00d4ff;
            }
            
            .perf-graph {
                width: 100%;
                height: 60px;
                background: ${this.options.theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'};
                border-radius: 6px;
            }
            
            .perf-quality-bar {
                width: 100%;
                height: 8px;
                background: ${this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                border-radius: 4px;
                overflow: hidden;
            }
            
            .perf-quality-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff006e, #00d4ff);
                border-radius: 4px;
                transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .perf-stat {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid ${this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            }
            
            .perf-stat-label {
                opacity: 0.7;
            }
            
            .perf-stat-value {
                font-weight: 600;
                font-family: 'Monaco', 'Courier New', monospace;
            }
            
            .perf-control {
                margin: 16px 0;
            }
            
            .perf-toggle {
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
            }
            
            .perf-toggle input {
                display: none;
            }
            
            .perf-toggle-slider {
                width: 40px;
                height: 20px;
                background: ${this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
                border-radius: 10px;
                position: relative;
                transition: background 0.3s;
                margin-right: 10px;
            }
            
            .perf-toggle-slider::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                top: 2px;
                left: 2px;
                transition: transform 0.3s;
            }
            
            .perf-toggle input:checked + .perf-toggle-slider {
                background: linear-gradient(135deg, #00d4ff, #a855f7);
            }
            
            .perf-toggle input:checked + .perf-toggle-slider::after {
                transform: translateX(20px);
            }
            
            .perf-toggle-label {
                font-weight: 500;
            }
            
            .perf-slider-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                opacity: 0.8;
            }
            
            .perf-slider {
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: ${this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                outline: none;
                -webkit-appearance: none;
            }
            
            .perf-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: linear-gradient(135deg, #00d4ff, #a855f7);
                cursor: pointer;
            }
            
            .perf-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: linear-gradient(135deg, #00d4ff, #a855f7);
                cursor: pointer;
                border: none;
            }
            
            .perf-hint {
                padding: 8px 16px;
                text-align: center;
                font-size: 11px;
                opacity: 0.5;
                border-top: 1px solid ${this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            }
            
            @media (max-width: 768px) {
                .perf-monitor {
                    width: 280px;
                    font-size: 12px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Close button
        const closeBtn = this.container.querySelector('.perf-btn-close');
        closeBtn.addEventListener('click', () => this.hide());
        
        // Minimize button
        const minimizeBtn = this.container.querySelector('.perf-btn-minimize');
        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        
        // Adaptive quality toggle
        const adaptiveToggle = document.getElementById('perf-adaptive-quality');
        adaptiveToggle.addEventListener('change', (e) => {
            this.manager.setAdaptiveQuality(e.target.checked);
            document.getElementById('perf-manual-quality-control').style.display = 
                e.target.checked ? 'none' : 'block';
        });
        
        // Manual quality slider
        const qualitySlider = document.getElementById('perf-quality-slider');
        qualitySlider.addEventListener('input', (e) => {
            this.manager.setQuality(parseFloat(e.target.value));
        });
        
        // Keyboard shortcut (P key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    this.toggle();
                }
            }
        });
    }
    
    startMonitoring() {
        const update = () => {
            if (!this.isVisible) {
                requestAnimationFrame(update);
                return;
            }
            
            const now = performance.now();
            if (now - this.lastUpdate >= this.options.updateInterval) {
                this.updateMetrics();
                this.lastUpdate = now;
            }
            
            requestAnimationFrame(update);
        };
        
        update();
    }
    
    updateMetrics() {
        const metrics = this.manager.getMetrics();
        
        // Update FPS
        document.getElementById('perf-fps').textContent = Math.round(metrics.fps);
        this.fpsHistory.push(metrics.fps);
        if (this.fpsHistory.length > this.options.historyLength) {
            this.fpsHistory.shift();
        }
        this.drawGraph('perf-fps-graph', this.fpsHistory, 0, 120, '#00d4ff');
        
        // Update Frame Time
        const frameTime = 1000 / metrics.fps;
        document.getElementById('perf-frame-time').textContent = `${frameTime.toFixed(1)}ms`;
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.options.historyLength) {
            this.frameTimeHistory.shift();
        }
        this.drawGraph('perf-frame-time-graph', this.frameTimeHistory, 0, 50, '#a855f7');
        
        // Update Quality
        const quality = (metrics.quality * 100).toFixed(0);
        document.getElementById('perf-quality').textContent = `${quality}%`;
        document.getElementById('perf-quality-fill').style.width = `${quality}%`;
        
        // Update Canvas Count
        document.getElementById('perf-canvas-count').textContent = 
            `${metrics.activeCanvases} / ${metrics.totalCanvases}`;
        
        // Update Frame Count
        document.getElementById('perf-frame-count').textContent = 
            metrics.frameCount.toLocaleString();
    }
    
    drawGraph(canvasId, data, minValue, maxValue, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear
        ctx.clearRect(0, 0, width, height);
        
        if (data.length < 2) return;
        
        // Draw grid
        ctx.strokeStyle = this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();
        
        // Draw graph
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const stepX = width / (data.length - 1);
        
        data.forEach((value, index) => {
            const x = index * stepX;
            const normalizedValue = (value - minValue) / (maxValue - minValue);
            const y = height - (normalizedValue * height);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Fill area
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    show() {
        this.isVisible = true;
        this.container.classList.remove('hidden');
    }
    
    hide() {
        this.isVisible = false;
        this.container.classList.add('hidden');
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    toggleMinimize() {
        this.container.classList.toggle('minimized');
    }
    
    dispose() {
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
