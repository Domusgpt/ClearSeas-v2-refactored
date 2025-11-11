/**
 * Clear Seas Solutions - Enhanced Application
 * SIMPLIFIED: Uses working visualizers from vib34d-xr-quantum-sdk
 *
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format" © 2025
 */

import { WorkingQuantumVisualizer } from './visualizers/WorkingQuantumVisualizer.js';
import { OrthogonalScrollChoreographer } from './choreography/OrthogonalScrollChoreographer.js';
import { SectionPinChoreographer } from './choreography/SectionPinChoreographer.js';
import { SmoothScrollAnimator } from './animations/SmoothScrollAnimator.js';
import { Utils, Logger } from './utils/Utils.js';

export class ClearSeasEnhancedApplication {
    constructor() {
        this.logger = new Logger('ClearSeasEnhanced', 'info');
        this.quantumVisualizer = null;
        this.orthogonalScrollChoreographer = null;
        this.sectionPinChoreographer = null;
        this.smoothScrollAnimator = null;
        this.isInitialized = false;

        this.logger.info('🌊 Clear Seas Solutions - Smooth Scroll System');
    }

    async initialize() {
        if (this.isInitialized) {
            this.logger.warn('Already initialized');
            return;
        }

        try {
            this.logger.info('🌌 Creating WorkingQuantumVisualizer...');

            // Create working visualizer on quantum-background canvas
            this.quantumVisualizer = new WorkingQuantumVisualizer('quantum-background', {
                role: 'background',
                reactivity: 1.0,
                variant: 0
            });

            if (!this.quantumVisualizer.gl) {
                throw new Error('Failed to create WebGL context');
            }

            this.logger.info('✅ WorkingQuantumVisualizer created with WebGL context');

            // Start render loop
            this.startRenderLoop();
            this.logger.info('✅ Render loop started');

            // Create orthogonal scroll choreographer
            this.logger.info('🎬 Creating OrthogonalScrollChoreographer...');
            this.orthogonalScrollChoreographer = new OrthogonalScrollChoreographer(
                this.quantumVisualizer
            );
            this.orthogonalScrollChoreographer.initialize();
            this.logger.info('✅ Orthogonal depth progression choreography initialized');

            // Wait for GSAP to load
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                this.logger.warn('⏳ Waiting for GSAP and ScrollTrigger to load...');
                await this.waitForGSAP();
            }

            // Create section pin choreographer
            this.logger.info('📍 Creating SectionPinChoreographer...');
            this.sectionPinChoreographer = new SectionPinChoreographer(
                gsap,
                ScrollTrigger,
                this.quantumVisualizer
            );
            this.sectionPinChoreographer.initialize();
            this.logger.info('✅ Section pin choreography initialized');

            // Create smooth scroll animator
            this.logger.info('🎬 Creating SmoothScrollAnimator...');
            this.smoothScrollAnimator = new SmoothScrollAnimator(gsap, ScrollTrigger);
            this.smoothScrollAnimator.initialize();
            this.smoothScrollAnimator.setupCardHoverEffects();
            this.logger.info('✅ Smooth scroll animations initialized');

            this.isInitialized = true;
            this.logger.info('🎉 Application initialized successfully');
            this.logAnimationStats();

            window.dispatchEvent(new CustomEvent('clearSeasEnhancedReady', {
                detail: { app: this }
            }));

        } catch (error) {
            this.logger.error('Initialization failed:', error);
            console.error(error);
        }
    }

    startRenderLoop() {
        const render = () => {
            if (this.quantumVisualizer) {
                this.quantumVisualizer.render();
            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    /**
     * Wait for GSAP and ScrollTrigger to load
     */
    async waitForGSAP(maxAttempts = 50, interval = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                this.logger.info('✅ GSAP and ScrollTrigger loaded');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error('GSAP or ScrollTrigger failed to load');
    }

    /**
     * Log animation statistics
     */
    logAnimationStats() {
        if (this.smoothScrollAnimator) {
            const stats = this.smoothScrollAnimator.getStats();
            this.logger.info('📊 Animation Stats:', stats);
        }
    }
}

/**
 * A Paul Phillips Manifestation
 * © 2025 Clear Seas Solutions LLC
 */
