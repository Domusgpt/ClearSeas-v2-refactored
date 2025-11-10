/**
 * Clear Seas Solutions - Main Application
 * FULLY ORCHESTRATED - No manual controls, pure emergent behavior
 */

import { CanvasManager } from './managers/CanvasManager.js';
import { VisualOrchestrator } from './managers/VisualOrchestrator.js';
import { EnhancedQuantumBackground } from './visualizers/EnhancedQuantumBackground.js';
import { ParticleNetworkSystem } from './visualizers/ParticleNetwork.js';
import { CardFractalSystem } from './visualizers/CardFractalSystem.js';
import { Utils, Logger } from './utils/Utils.js';

class ClearSeasApplication {
    constructor() {
        this.logger = new Logger('ClearSeas', 'info');
        this.canvasManager = null;
        this.orchestrator = null;  // The brain!
        this.quantumBackground = null;
        this.particleNetworks = new Map();
        this.cardFractalSystem = null;
        this.isInitialized = false;
        
        this.logger.info('🌊 Clear Seas Solutions - Pure Orchestration Mode');
    }
    
    async initialize() {
        if (this.isInitialized) {
            this.logger.warn('Already initialized');
            return;
        }
        
        if (!Utils.isWebGLSupported()) {
            this.showFallback('WebGL is not supported on your device');
            return;
        }
        
        try {
            // Initialize Canvas Manager
            this.logger.info('Initializing Canvas Manager...');
            this.canvasManager = new CanvasManager();
            
            // Disable manual controls - everything is automatic!
            this.canvasManager.setAdaptiveQuality(true);
            
            // Create main background canvas
            const bgCanvas = this.canvasManager.createCanvas('quantum-background', {
                container: document.getElementById('quantum-background'),
                width: window.innerWidth,
                height: window.innerHeight,
                alpha: false,
                antialias: false,
                webgl2: true,
                powerPreference: 'high-performance',
                dpr: Utils.getDevicePixelRatio(2)
            });
            
            if (!bgCanvas) {
                throw new Error('Failed to create background canvas');
            }
            
            bgCanvas.options.autoResize = true;
            
            // Initialize ORCHESTRATOR - The Brain!
            this.logger.info('🎭 Initializing Visual Orchestrator...');
            this.orchestrator = new VisualOrchestrator(this.canvasManager);
            
            // Initialize Enhanced Quantum Background with RGB offset & moiré
            this.logger.info('🌌 Initializing Enhanced Quantum Background...');
            this.quantumBackground = new EnhancedQuantumBackground(
                this.canvasManager,
                'quantum-background'
            );
            this.quantumBackground.initialize();
            
            // Initialize Card Fractal System
            this.logger.info('🔮 Initializing Card Fractal System...');
            this.cardFractalSystem = new CardFractalSystem();
            
            // Initialize Particle Networks
            this.initializeParticleNetworks();
            
            // Setup UI interactions (no manual visual controls!)
            this.setupInteractions();
            
            // Start rendering
            this.canvasManager.start();
            
            this.isInitialized = true;
            
            this.logger.info('✅ Clear Seas Solutions initialized - FULLY ORCHESTRATED');
            
            window.dispatchEvent(new CustomEvent('clearSeasReady', {
                detail: { app: this }
            }));
            
        } catch (error) {
            this.logger.error('Initialization failed:', error);
            this.showFallback('Failed to initialize visualization system');
        }
    }
    
    initializeParticleNetworks() {
        // Create particle networks for hero and select sections
        const sections = [
            { id: 'hero', colorScheme: 'cyan', particleCount: 100 },
            { id: 'capabilities', colorScheme: 'purple', particleCount: 80 },
            { id: 'platforms', colorScheme: 'green', particleCount: 80 }
        ];
        
        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (!element) return;
            
            // Create container for particle canvas
            const container = document.createElement('div');
            container.id = `particle-${section.id}`;
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '1';
            
            element.style.position = 'relative';
            element.insertBefore(container, element.firstChild);
            
            // Create canvas
            const canvas = this.canvasManager.createCanvas(`particle-${section.id}`, {
                container: container,
                width: element.offsetWidth,
                height: element.offsetHeight,
                alpha: true,
                antialias: true
            });
            
            if (canvas) {
                // Initialize particle network
                const network = new ParticleNetworkSystem(
                    this.canvasManager,
                    `particle-${section.id}`,
                    {
                        particleCount: section.particleCount,
                        colorScheme: section.colorScheme,
                        connectionDistance: 0.15,
                        speed: 0.2
                    }
                );
                
                network.initialize();
                this.particleNetworks.set(section.id, network);
                
                // Setup intersection observer for performance
                this.observeSection(section.id, canvas);
            }
        });
        
        this.logger.info(`Created ${this.particleNetworks.size} particle networks`);
    }
    
    observeSection(sectionId, canvasData) {
        const element = document.getElementById(sectionId);
        if (!element) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1;
                this.canvasManager.setCanvasActive(`particle-${sectionId}`, isVisible);
            });
        }, {
            threshold: [0, 0.1, 0.5, 1.0]
        });
        
        observer.observe(element);
    }
    
    setupInteractions() {
        // Header scroll behavior
        const header = document.querySelector('.site-header');
        if (header) {
            let lastScroll = 0;
            const scrollThrottle = Utils.throttle(() => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                // Hide header on scroll down, show on scroll up
                if (currentScroll > lastScroll && currentScroll > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
            }, 100);
            
            window.addEventListener('scroll', scrollThrottle, { passive: true });
        }
        
        // Mobile menu
        const menuToggle = document.querySelector('.menu-toggle');
        const primaryNav = document.querySelector('.primary-nav');
        
        if (menuToggle && primaryNav) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                primaryNav.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
            
            // Close menu on link click
            primaryNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menuToggle.classList.remove('active');
                    primaryNav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && primaryNav.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    primaryNav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Card hover effects
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
        
        // Section observer for animations
        this.setupSectionObserver();
        
        // Year in footer
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    setupSectionObserver() {
        const sections = document.querySelectorAll('[data-section]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    
                    // Animate cards within section
                    const cards = entry.target.querySelectorAll('.card, .signal-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, {
            threshold: 0.15
        });
        
        sections.forEach(section => {
            observer.observe(section);
            
            // Pre-setup cards for animation
            const cards = section.querySelectorAll('.card, .signal-card');
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            });
        });
    }
    
    showFallback(message) {
        this.logger.error(message);
        
        const container = document.getElementById('quantum-background');
        if (container) {
            container.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    color: white;
                    text-align: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
                ">
                    <div>
                        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">
                            Visualization Unavailable
                        </h2>
                        <p style="color: #999;">${message}</p>
                        <p style="color: #666; margin-top: 1rem; font-size: 0.9rem;">
                            The site will continue to function with reduced visual effects.
                        </p>
                    </div>
                </div>
            `;
        }
    }
    
    dispose() {
        this.logger.info('Disposing application...');
        
        if (this.cardFractalSystem) {
            this.cardFractalSystem.dispose();
        }
        
        if (this.quantumBackground) {
            this.quantumBackground.dispose();
        }
        
        this.particleNetworks.forEach(network => network.dispose());
        this.particleNetworks.clear();
        
        if (this.canvasManager) {
            this.canvasManager.dispose();
        }
        
        this.isInitialized = false;
        this.logger.info('Application disposed');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.clearSeasApp = new ClearSeasApplication();
        window.clearSeasApp.initialize();
    });
} else {
    window.clearSeasApp = new ClearSeasApplication();
    window.clearSeasApp.initialize();
}

export default ClearSeasApplication;
