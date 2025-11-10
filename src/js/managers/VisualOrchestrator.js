/**
 * VISUAL ORCHESTRATOR
 * The brain of the entire visual system - choreographs all effects based on context
 * REFACTORED to integrate with ScrollChoreographer for VIB3+ geometry transitions
 * NO MANUAL CONTROLS - pure emergent behavior
 */

import { ScrollChoreographer } from '../choreography/ScrollChoreographer.js';

export class VisualOrchestrator {
    constructor(canvasManager) {
        this.manager = canvasManager;

        // Initialize scroll choreographer
        this.choreographer = new ScrollChoreographer({
            lerpSpeed: 0.08,
            velocityInfluence: 0.5,
            transitionZone: 0.3
        });
        
        // State tracking
        this.state = {
            scroll: 0,
            scrollVelocity: 0,
            mousePos: { x: 0.5, y: 0.5 },
            mouseVelocity: { x: 0, y: 0 },
            mouseActivity: 0, // 0-1, decays over time
            currentSection: 'hero',
            sectionDepth: 0,
            hoveredCards: new Set(),
            timeOfDay: this.getTimeOfDay(),
            userEnergy: 0.5, // How active the user is
            sessionTime: 0,
            dominantColor: { h: 180, s: 0.8, v: 0.9 }
        };
        
        // OPTIMIZED: Visual targets with reduced default GPU-intensive effects
        this.visualTarget = {
            preset: 'quantum',
            intensity: 0.5,
            chaos: 0.2,
            speed: 0.6,
            hue: 180,
            rgbOffset: 0.0003,         // Reduced default
            moireIntensity: 0.02,      // Reduced default
            fractalDecay: 0.0
        };
        
        // Current visual state (smooth interpolation)
        this.visualState = { ...this.visualTarget };
        
        // OPTIMIZED: Section-based visual profiles with reduced GPU-intensive effects
        this.sectionProfiles = {
            hero: {
                preset: 'quantum',
                form: 'lattice',           // Quantum 4D lattice structure
                intensity: 0.6,
                chaos: 0.15,
                speed: 0.5,
                hue: 180,
                rgbOffset: 0.0005,         // Reduced from 0.002
                moireIntensity: 0.03,      // Reduced from 0.1
                formMix: 1.0
            },
            signals: {
                preset: 'neural',
                form: 'wave',              // Flowing wave patterns
                intensity: 0.75,
                chaos: 0.4,
                speed: 0.8,
                hue: 280,
                rgbOffset: 0.001,          // Reduced from 0.005
                moireIntensity: 0.08,      // Reduced from 0.3
                formMix: 1.0
            },
            capabilities: {
                preset: 'crystal',
                form: 'crystal',           // Sharp crystalline structures
                intensity: 0.65,
                chaos: 0.1,
                speed: 0.4,
                hue: 200,
                rgbOffset: 0.0003,         // Reduced from 0.001
                moireIntensity: 0.02,      // Reduced from 0.05
                formMix: 1.0
            },
            research: {
                preset: 'cosmic',
                form: 'nebula',            // Organic nebula clouds
                intensity: 0.7,
                chaos: 0.3,
                speed: 0.6,
                hue: 240,
                rgbOffset: 0.0008,         // Reduced from 0.003
                moireIntensity: 0.06,      // Reduced from 0.2
                formMix: 1.0
            },
            platforms: {
                preset: 'cyber',
                form: 'vortex',            // Swirling vortex/spiral
                intensity: 0.8,
                chaos: 0.25,
                speed: 0.7,
                hue: 160,
                rgbOffset: 0.001,          // Reduced from 0.004
                moireIntensity: 0.07,      // Reduced from 0.25
                formMix: 1.0
            },
            contact: {
                preset: 'aurora',
                form: 'fractal',           // Fractal branching patterns
                intensity: 0.55,
                chaos: 0.2,
                speed: 0.5,
                hue: 200,
                rgbOffset: 0.0005,         // Reduced from 0.002
                moireIntensity: 0.04,      // Reduced from 0.15
                formMix: 1.0
            }
        };
        
        // Interaction multipliers
        this.multipliers = {
            mouseActivity: 1.0,
            scrollVelocity: 1.0,
            cardHover: 1.0,
            timeOfDay: 1.0,
            userEnergy: 1.0
        };
        
        this.lastUpdateTime = performance.now();
        this.lastScrollY = window.pageYOffset;
        this.lastMousePos = { x: 0.5, y: 0.5 };
        
        this.init();
    }
    
    init() {
        this.setupListeners();
        this.startOrchestration();
        console.log('🎭 Visual Orchestrator initialized with ScrollChoreographer - pure choreography mode');
    }

    /**
     * Get choreographer instance for external systems
     */
    getChoreographer() {
        return this.choreographer;
    }
    
    setupListeners() {
        // OPTIMIZED: Use CanvasManager's already-throttled mouse/scroll data instead of duplicate listeners
        // This eliminates redundant event handlers and improves performance
        
        // Card hover detection
        document.querySelectorAll('.card, .signal-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.state.hoveredCards.add(card);
                this.onCardHover(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.state.hoveredCards.delete(card);
                this.onCardHover(card, false);
            });
        });
        
        // Section observation
        this.observeSections();
        
        // Time of day updates
        setInterval(() => {
            this.state.timeOfDay = this.getTimeOfDay();
        }, 60000); // Every minute
    }
    
    observeSections() {
        const sections = document.querySelectorAll('[data-section]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const sectionId = entry.target.dataset.section;
                    if (this.state.currentSection !== sectionId) {
                        this.transitionToSection(sectionId);
                    }
                }
            });
        }, { threshold: [0, 0.25, 0.5, 0.75, 1.0] });
        
        sections.forEach(section => observer.observe(section));
    }
    
    transitionToSection(sectionId) {
        console.log(`🎬 Transitioning to section: ${sectionId}`);
        this.state.currentSection = sectionId;
        
        const profile = this.sectionProfiles[sectionId] || this.sectionProfiles.hero;
        
        // Set new visual target
        Object.assign(this.visualTarget, profile);
        
        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('sectionTransition', {
            detail: { section: sectionId, profile }
        }));
    }
    
    onCardHover(card, isEntering) {
        if (isEntering) {
            // Card is being hovered - increase effects
            this.visualTarget.chaos = Math.min(1.0, this.visualTarget.chaos + 0.15);
            this.visualTarget.rgbOffset = Math.min(0.01, this.visualTarget.rgbOffset + 0.003);
            this.visualTarget.moireIntensity = Math.min(1.0, this.visualTarget.moireIntensity + 0.2);
            
            // Trigger card emergence effect
            this.triggerCardEmergence(card);
        } else {
            // Card hover ended - trigger decay
            this.triggerCardDecay(card);
        }
    }
    
    triggerCardEmergence(card) {
        // Dispatch event for card-specific effects
        card.dispatchEvent(new CustomEvent('cardEmerge', {
            detail: {
                intensity: this.state.userEnergy,
                color: this.state.dominantColor
            }
        }));
    }
    
    triggerCardDecay(card) {
        // Dispatch event for card decay effect
        card.dispatchEvent(new CustomEvent('cardDecay', {
            detail: {
                fractalDepth: 3 + Math.floor(this.state.userEnergy * 3),
                color: this.state.dominantColor
            }
        }));
    }
    
    startOrchestration() {
        const update = (timestamp) => {
            const deltaTime = timestamp - this.lastUpdateTime;
            this.lastUpdateTime = timestamp;

            // OPTIMIZED: Pull mouse/scroll data from CanvasManager (already throttled)
            this.state.mousePos.x = this.manager.mousePosition.x;
            this.state.mousePos.y = this.manager.mousePosition.y;
            this.state.mouseVelocity.x = Math.abs(this.manager.mouseVelocity.x);
            this.state.mouseVelocity.y = Math.abs(this.manager.mouseVelocity.y);
            this.state.scroll = this.manager.scrollProgress;

            // Calculate scroll velocity
            const currentScrollY = window.pageYOffset;
            this.state.scrollVelocity = Math.abs(currentScrollY - this.lastScrollY) / 100;
            this.lastScrollY = currentScrollY;

            // Update scroll choreographer with absolute scroll position
            this.choreographer.updateScrollPosition(currentScrollY);
            const choreographedState = this.choreographer.update();

            // Update mouse activity (decay over time)
            const mouseMoved = Math.abs(this.manager.mouseVelocity.x) + Math.abs(this.manager.mouseVelocity.y);
            if (mouseMoved > 0.001) {
                this.state.mouseActivity = Math.min(1.0, this.state.mouseActivity + 0.1);
                this.state.userEnergy = Math.min(1.0, this.state.userEnergy + 0.05);
            } else {
                this.state.mouseActivity *= 0.99;
            }

            // Decay scroll velocity
            this.state.scrollVelocity *= 0.95;

            // Update session time
            this.state.sessionTime += deltaTime / 1000;

            // Calculate multipliers based on current state
            this.calculateMultipliers();

            // Apply multipliers to target
            this.applyMultipliers();

            // Smooth interpolation toward target
            this.interpolateVisualState(deltaTime);
            
            // Decay user energy over time
            this.state.userEnergy *= 0.998;
            this.state.mouseActivity *= 0.995;
            
            // Broadcast current visual state
            this.broadcastState();
            
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    }
    
    calculateMultipliers() {
        // Mouse activity multiplier (0.8 - 1.5)
        this.multipliers.mouseActivity = 0.8 + (this.state.mouseActivity * 0.7);
        
        // Scroll velocity multiplier (0.9 - 1.3)
        this.multipliers.scrollVelocity = 0.9 + (Math.min(this.state.scrollVelocity, 1.0) * 0.4);
        
        // Card hover multiplier (1.0 - 1.8)
        this.multipliers.cardHover = 1.0 + (this.state.hoveredCards.size * 0.4);
        
        // Time of day multiplier (0.7 - 1.2)
        // Morning: calm, Evening: energetic, Night: mysterious
        const tod = this.state.timeOfDay;
        if (tod === 'morning') {
            this.multipliers.timeOfDay = 0.8;
        } else if (tod === 'afternoon') {
            this.multipliers.timeOfDay = 1.0;
        } else if (tod === 'evening') {
            this.multipliers.timeOfDay = 1.2;
        } else {
            this.multipliers.timeOfDay = 0.9;
        }
        
        // User energy multiplier (0.5 - 1.5)
        this.multipliers.userEnergy = 0.5 + (this.state.userEnergy * 1.0);
    }
    
    applyMultipliers() {
        const profile = this.sectionProfiles[this.state.currentSection];
        if (!profile) return;
        
        // Apply multipliers to create dynamic target
        const avgMultiplier = (
            this.multipliers.mouseActivity +
            this.multipliers.scrollVelocity +
            this.multipliers.cardHover +
            this.multipliers.timeOfDay +
            this.multipliers.userEnergy
        ) / 5;
        
        // Modulate intensity
        this.visualTarget.intensity = profile.intensity * avgMultiplier;
        
        // Modulate chaos based on activity
        this.visualTarget.chaos = profile.chaos * this.multipliers.userEnergy;
        
        // Modulate speed
        this.visualTarget.speed = profile.speed * this.multipliers.mouseActivity;
        
        // RGB offset increases with mouse velocity
        const mouseVelMag = Math.sqrt(
            this.state.mouseVelocity.x ** 2 + 
            this.state.mouseVelocity.y ** 2
        );
        this.visualTarget.rgbOffset = profile.rgbOffset + (mouseVelMag * 0.005);
        
        // Moiré increases with scroll velocity
        this.visualTarget.moireIntensity = profile.moireIntensity + (this.state.scrollVelocity * 0.3);
        
        // Hue shifts slightly based on mouse position
        const hueShift = (this.state.mousePos.x - 0.5) * 40;
        this.visualTarget.hue = (profile.hue + hueShift + 360) % 360;
        
        // Clamp all values
        this.visualTarget.intensity = Math.min(1.0, this.visualTarget.intensity);
        this.visualTarget.chaos = Math.min(1.0, this.visualTarget.chaos);
        this.visualTarget.speed = Math.min(2.0, this.visualTarget.speed);
        this.visualTarget.rgbOffset = Math.min(0.02, this.visualTarget.rgbOffset);
        this.visualTarget.moireIntensity = Math.min(1.0, this.visualTarget.moireIntensity);
    }
    
    interpolateVisualState(deltaTime) {
        // Smooth interpolation speed (slower = smoother)
        const lerpSpeed = 0.001 * deltaTime;
        
        Object.keys(this.visualTarget).forEach(key => {
            if (typeof this.visualTarget[key] === 'number') {
                const current = this.visualState[key];
                const target = this.visualTarget[key];
                this.visualState[key] = current + (target - current) * lerpSpeed;
            }
        });
    }
    
    broadcastState() {
        // Get choreographed state
        const choreographedState = this.choreographer.currentState;
        const sectionName = this.choreographer.getCurrentSectionName();

        // Merge choreographed state with orchestrator's visual state and multipliers
        const mergedState = {
            ...this.visualState,
            // Override with choreographed parameters
            geometry: choreographedState.geometry,
            gridDensity: choreographedState.gridDensity * this.multipliers.userEnergy,
            morphFactor: choreographedState.morphFactor,
            chaos: choreographedState.chaos * this.multipliers.mouseActivity,
            speed: choreographedState.speed * this.multipliers.scrollVelocity,
            hue: choreographedState.hue,
            intensity: choreographedState.intensity * this.multipliers.userEnergy,
            saturation: choreographedState.saturation,
            // 6D rotations from choreographer
            rot4dXY: choreographedState.rot4dXY,
            rot4dXZ: choreographedState.rot4dXZ,
            rot4dYZ: choreographedState.rot4dYZ,
            rot4dXW: choreographedState.rot4dXW,
            rot4dYW: choreographedState.rot4dYW,
            rot4dZW: choreographedState.rot4dZW
        };

        // Dispatch event with merged state
        window.dispatchEvent(new CustomEvent('visualStateUpdate', {
            detail: {
                state: mergedState,
                multipliers: { ...this.multipliers },
                choreographer: {
                    section: sectionName,
                    sectionProgress: this.choreographer.getSectionProgress(),
                    scrollVelocity: this.choreographer.getScrollVelocity()
                },
                context: {
                    section: this.state.currentSection,
                    scroll: this.state.scroll,
                    userEnergy: this.state.userEnergy,
                    mouseActivity: this.state.mouseActivity
                }
            }
        }));
    }
    
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }
    
    // Public API for manual influence (rare cases)
    pulse(intensity = 0.3) {
        this.state.userEnergy = Math.min(1.0, this.state.userEnergy + intensity);
    }
    
    getState() {
        return {
            visual: { ...this.visualState },
            user: { ...this.state },
            multipliers: { ...this.multipliers }
        };
    }
}
