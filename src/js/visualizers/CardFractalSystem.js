/**
 * CARD FRACTAL SYSTEM
 * Cards decay fractally with color occlusions and reform through emergence
 */

export class CardFractalSystem {
    constructor() {
        this.cards = new Map();
        this.canvases = new Map();
        this.contexts = new Map();
        this.activeEffects = new Map();
        
        this.init();
    }
    
    init() {
        // Find all cards and prepare them
        document.querySelectorAll('.card, .signal-card').forEach(card => {
            this.prepareCard(card);
        });
        
        console.log('🔮 Card Fractal System initialized - decay & emergence ready');
    }
    
    prepareCard(card) {
        const cardId = card.dataset.cardId || `card-${Math.random().toString(36).substr(2, 9)}`;
        card.dataset.cardId = cardId;
        
        // Create canvas overlay for effects
        const overlay = document.createElement('div');
        overlay.className = 'card-fractal-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            border-radius: inherit;
            overflow: hidden;
        `;
        
        const canvas = document.createElement('canvas');
        canvas.width = card.offsetWidth * 2;
        canvas.height = card.offsetHeight * 2;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;
        
        overlay.appendChild(canvas);
        card.style.position = 'relative';
        card.insertBefore(overlay, card.firstChild);
        
        const ctx = canvas.getContext('2d');
        
        this.cards.set(cardId, card);
        this.canvases.set(cardId, canvas);
        this.contexts.set(cardId, ctx);
        
        // Listen for card events
        card.addEventListener('cardDecay', (e) => {
            this.triggerDecay(cardId, e.detail);
        });
        
        card.addEventListener('cardEmerge', (e) => {
            this.triggerEmergence(cardId, e.detail);
        });
        
        // Standard hover events as fallback
        card.addEventListener('mouseenter', () => {
            this.triggerEmergence(cardId, { intensity: 0.7 });
        });
        
        card.addEventListener('mouseleave', () => {
            this.triggerDecay(cardId, { fractalDepth: 4 });
        });
    }
    
    triggerDecay(cardId, detail = {}) {
        // Cancel any active emergence
        if (this.activeEffects.has(cardId)) {
            this.activeEffects.get(cardId).cancelled = true;
        }
        
        const canvas = this.canvases.get(cardId);
        const ctx = this.contexts.get(cardId);
        const card = this.cards.get(cardId);
        
        if (!canvas || !ctx || !card) return;
        
        const { fractalDepth = 4, color = { h: 180, s: 0.8, v: 0.9 } } = detail;
        
        const effect = {
            type: 'decay',
            progress: 0,
            duration: 1200,
            startTime: performance.now(),
            cancelled: false,
            particles: []
        };
        
        // Generate fractal particles
        this.generateFractalParticles(card, effect, fractalDepth, color);
        
        this.activeEffects.set(cardId, effect);
        this.animateEffect(cardId);
    }
    
    generateFractalParticles(card, effect, depth, color) {
        const rect = card.getBoundingClientRect();
        const particleCount = Math.pow(4, depth); // Exponential with depth
        
        // Create particles in fractal pattern
        for (let i = 0; i < Math.min(particleCount, 500); i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random();
            
            // Fractal distribution using recursive subdivision
            const fractalX = this.fractalPosition(i, particleCount, depth);
            const fractalY = this.fractalPosition(i + particleCount/2, particleCount, depth);
            
            effect.particles.push({
                x: fractalX * rect.width * 2,
                y: fractalY * rect.height * 2,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 4 + 1,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                hue: color.h + (Math.random() - 0.5) * 60,
                sat: color.s,
                val: color.v,
                depth: Math.random() * depth
            });
        }
    }
    
    fractalPosition(index, total, depth) {
        // Recursive fractal subdivision for particle placement
        let pos = 0.5;
        let scale = 0.25;
        
        for (let d = 0; d < depth; d++) {
            const bit = (index >> d) & 1;
            pos += (bit ? 1 : -1) * scale;
            scale *= 0.5;
        }
        
        return Math.max(0, Math.min(1, pos));
    }
    
    triggerEmergence(cardId, detail = {}) {
        // Cancel any active decay
        if (this.activeEffects.has(cardId)) {
            this.activeEffects.get(cardId).cancelled = true;
        }
        
        const canvas = this.canvases.get(cardId);
        const ctx = this.contexts.get(cardId);
        const card = this.cards.get(cardId);
        
        if (!canvas || !ctx || !card) return;
        
        const { intensity = 0.7, color = { h: 280, s: 0.7, v: 0.85 } } = detail;
        
        const effect = {
            type: 'emergence',
            progress: 0,
            duration: 1500,
            startTime: performance.now(),
            cancelled: false,
            agents: []
        };
        
        // Generate emergence agents
        this.generateEmergenceAgents(card, effect, intensity, color);
        
        this.activeEffects.set(cardId, effect);
        this.animateEffect(cardId);
    }
    
    generateEmergenceAgents(card, effect, intensity, color) {
        const rect = card.getBoundingClientRect();
        const agentCount = Math.floor(50 + intensity * 100);
        
        // Create agents that will form emergent patterns
        for (let i = 0; i < agentCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.max(rect.width, rect.height);
            
            effect.agents.push({
                x: rect.width + Math.cos(angle) * radius,
                y: rect.height + Math.sin(angle) * radius,
                targetX: (Math.random() * 0.6 + 0.2) * rect.width * 2,
                targetY: (Math.random() * 0.6 + 0.2) * rect.height * 2,
                vx: 0,
                vy: 0,
                size: Math.random() * 3 + 1,
                hue: color.h + (Math.random() - 0.5) * 40,
                sat: color.s,
                val: color.v,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03
            });
        }
    }
    
    animateEffect(cardId) {
        const effect = this.activeEffects.get(cardId);
        if (!effect || effect.cancelled) {
            this.clearCanvas(cardId);
            return;
        }
        
        const now = performance.now();
        effect.progress = Math.min(1, (now - effect.startTime) / effect.duration);
        
        if (effect.type === 'decay') {
            this.renderDecay(cardId, effect);
        } else if (effect.type === 'emergence') {
            this.renderEmergence(cardId, effect);
        }
        
        if (effect.progress < 1) {
            requestAnimationFrame(() => this.animateEffect(cardId));
        } else {
            this.activeEffects.delete(cardId);
            this.clearCanvas(cardId);
        }
    }
    
    renderDecay(cardId, effect) {
        const ctx = this.contexts.get(cardId);
        const canvas = this.canvases.get(cardId);
        
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render particles
        effect.particles.forEach(p => {
            // Update particle
            p.x += p.vx * (1 + effect.progress);
            p.y += p.vy * (1 + effect.progress);
            p.life -= p.decay;
            
            if (p.life > 0) {
                // Color occlusion effect
                const alpha = p.life * (1 - effect.progress * 0.7);
                
                // Multiple layers for fractal appearance
                for (let layer = 0; layer < 3; layer++) {
                    const layerOffset = layer * 2;
                    const layerAlpha = alpha * (1 - layer * 0.3);
                    const layerSize = p.size * (1 + layer * 0.5);
                    
                    ctx.fillStyle = this.hsva(
                        p.hue + layerOffset * 10,
                        p.sat,
                        p.val,
                        layerAlpha
                    );
                    
                    // Fractal shape
                    ctx.beginPath();
                    const sides = 4 + Math.floor(p.depth);
                    for (let i = 0; i < sides; i++) {
                        const angle = (i / sides) * Math.PI * 2 + effect.progress * 2;
                        const x = p.x + Math.cos(angle) * layerSize;
                        const y = p.y + Math.sin(angle) * layerSize;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            }
        });
        
        // Add fractal color occlusion overlay
        if (effect.progress > 0.3) {
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = this.hsva(180, 0.8, 0.3, (effect.progress - 0.3) * 0.2);
            
            // Fractal overlay pattern
            const gridSize = 8;
            for (let x = 0; x < canvas.width; x += gridSize) {
                for (let y = 0; y < canvas.height; y += gridSize) {
                    if (Math.random() > effect.progress) {
                        ctx.fillRect(x, y, gridSize * Math.random(), gridSize * Math.random());
                    }
                }
            }
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    renderEmergence(cardId, effect) {
        const ctx = this.contexts.get(cardId);
        const canvas = this.canvases.get(cardId);
        
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Easing for smooth emergence
        const easeProgress = this.easeInOutCubic(effect.progress);
        
        // Render agents
        effect.agents.forEach(agent => {
            // Move toward target with attraction
            const dx = agent.targetX - agent.x;
            const dy = agent.targetY - agent.y;
            
            agent.vx += dx * agent.speed;
            agent.vy += dy * agent.speed;
            agent.vx *= 0.9; // Damping
            agent.vy *= 0.9;
            
            agent.x += agent.vx;
            agent.y += agent.vy;
            
            // Oscillate for organic feel
            agent.phase += 0.1;
            const oscillation = Math.sin(agent.phase) * 2;
            
            const alpha = easeProgress * 0.8;
            
            // Draw agent with glow
            const gradient = ctx.createRadialGradient(
                agent.x + oscillation, agent.y + oscillation, 0,
                agent.x + oscillation, agent.y + oscillation, agent.size * 3
            );
            gradient.addColorStop(0, this.hsva(agent.hue, agent.sat, agent.val, alpha));
            gradient.addColorStop(0.5, this.hsva(agent.hue, agent.sat, agent.val, alpha * 0.5));
            gradient.addColorStop(1, this.hsva(agent.hue, agent.sat, agent.val, 0));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(agent.x + oscillation, agent.y + oscillation, agent.size * 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Add emergent pattern connections
        if (effect.progress > 0.4) {
            ctx.strokeStyle = this.hsva(280, 0.7, 0.8, (effect.progress - 0.4) * 0.3);
            ctx.lineWidth = 1;
            
            for (let i = 0; i < effect.agents.length; i++) {
                const a1 = effect.agents[i];
                for (let j = i + 1; j < effect.agents.length; j++) {
                    const a2 = effect.agents[j];
                    const dist = Math.hypot(a1.x - a2.x, a1.y - a2.y);
                    
                    if (dist < 100 * easeProgress) {
                        ctx.beginPath();
                        ctx.moveTo(a1.x, a1.y);
                        ctx.lineTo(a2.x, a2.y);
                        ctx.stroke();
                    }
                }
            }
        }
    }
    
    hsva(h, s, v, a) {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        
        let r, g, b;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${a})`;
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    clearCanvas(cardId) {
        const ctx = this.contexts.get(cardId);
        const canvas = this.canvases.get(cardId);
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    dispose() {
        this.cards.clear();
        this.canvases.clear();
        this.contexts.clear();
        this.activeEffects.clear();
    }
}
