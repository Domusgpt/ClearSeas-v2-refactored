/**
 * ScrollIntroSequence - Scroll-Triggered Logo + Hero Animation
 * Creates scroll-based entrance with logo flourishes
 * © 2025 Clear Seas Solutions LLC
 */

export class ScrollIntroSequence {
    constructor(gsap, ScrollTrigger) {
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this.logoFlourishes = [
            'pulse', 'ripple', 'spiral', 'quantum', 'wave', 'crystal'
        ];
    }

    /**
     * Setup scroll-triggered intro animation
     */
    setupScrollIntro() {
        console.log('🎬 Setting up scroll-triggered intro...');

        const heroSection = document.querySelector('#hero');
        if (!heroSection) {
            console.warn('⚠️ Hero section not found');
            return;
        }

        // Create logo overlay that appears at top
        const logoOverlay = this.createLogoOverlay();

        // Get hero elements
        const heroTitle = heroSection.querySelector('h1');
        const heroText = heroSection.querySelector('.hero-intro__text');
        const heroCards = heroSection.querySelectorAll('.signal-card');
        const headerLogo = document.querySelector('.site-header img, .logo img');

        // Main scroll timeline
        const tl = this.gsap.timeline({
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '+=150%', // 1.5 screen heights of scroll
                scrub: 1, // Smooth scrubbing
                pin: false,
                markers: false,
                onUpdate: (self) => {
                    const progress = self.progress;

                    // Trigger logo flourish at 30% progress
                    if (progress > 0.3 && progress < 0.35 && !this.flourishPlayed) {
                        this.playLogoFlourish(logoOverlay.querySelector('.intro-logo-container'));
                        this.flourishPlayed = true;
                    }
                }
            }
        });

        // Phase 1: Logo entrance (0-20% scroll)
        tl.fromTo('.intro-logo',
            { scale: 0, rotation: -180, opacity: 0 },
            {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.3,
                ease: 'back.out(1.7)'
            },
            0
        );

        // Phase 2: Company name word-by-word (20-40% scroll)
        tl.fromTo('.company-word',
            { opacity: 0, y: 50, rotationX: -90 },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.2,
                stagger: 0.05,
                ease: 'power3.out'
            },
            0.2
        );

        // Phase 3: Tagline (30-45% scroll)
        tl.fromTo('.intro-tagline',
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.out'
            },
            0.3
        );

        // Phase 4: Logo moves to header and overlay fades (50-70% scroll)
        tl.to('.intro-logo-container', {
            scale: 0.3,
            x: () => {
                if (!headerLogo) return -window.innerWidth / 2 + 100;
                const headerRect = headerLogo.getBoundingClientRect();
                return headerRect.left - window.innerWidth / 2;
            },
            y: () => {
                if (!headerLogo) return -window.innerHeight / 2 + 60;
                const headerRect = headerLogo.getBoundingClientRect();
                return headerRect.top - window.innerHeight / 2;
            },
            duration: 0.2,
            ease: 'power3.inOut'
        }, 0.5);

        tl.to(['.company-word', '.intro-tagline'], {
            opacity: 0,
            y: -30,
            duration: 0.15,
            stagger: 0.02,
            ease: 'power2.in'
        }, 0.52);

        tl.to(logoOverlay, {
            opacity: 0,
            duration: 0.15,
            ease: 'power2.inOut'
        }, 0.65);

        // Phase 5: Hero section entrance (70-100% scroll)
        if (heroSection) {
            tl.fromTo(heroSection,
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.2,
                    ease: 'power4.out'
                },
                0.7
            );
        }

        if (heroTitle) {
            tl.fromTo(heroTitle,
                { opacity: 0, y: 100, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.15,
                    ease: 'back.out(1.2)'
                },
                0.75
            );
        }

        if (heroText) {
            tl.fromTo(heroText,
                { opacity: 0, x: -50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.12,
                    ease: 'power3.out'
                },
                0.8
            );
        }

        if (heroCards.length) {
            tl.fromTo(heroCards,
                { opacity: 0, y: 80, rotationX: 45 },
                {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.15,
                    stagger: 0.03,
                    ease: 'back.out(1.5)'
                },
                0.85
            );
        }

        console.log('✅ Scroll-triggered intro ready');
        this.timeline = tl;
    }

    /**
     * Create logo overlay (fixed position, scroll-animated)
     */
    createLogoOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'intro-overlay';
        overlay.innerHTML = `
            <div class="intro-content">
                <div class="intro-logo-container">
                    <img src="assets/images/css-logo.png" alt="Clear Seas Solutions" class="intro-logo">
                    <div class="logo-flourish"></div>
                </div>
                <h1 class="intro-company-name">
                    <span class="company-word">Clear</span>
                    <span class="company-word">Seas</span>
                    <span class="company-word">Solutions</span>
                </h1>
                <p class="intro-tagline">AI-Powered Maritime Intelligence</p>
            </div>
        `;

        // Set initial state
        overlay.style.opacity = '1';
        document.body.appendChild(overlay);

        // Initially hide hero
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
            heroSection.style.opacity = '0';
            heroSection.style.transform = 'scale(0.95)';
        }

        return overlay;
    }

    /**
     * Play random logo flourish animation
     */
    playLogoFlourish(container) {
        const flourish = container.querySelector('.logo-flourish');
        if (!flourish) return;

        const randomEffect = this.logoFlourishes[Math.floor(Math.random() * this.logoFlourishes.length)];

        flourish.className = `logo-flourish flourish-${randomEffect}`;
        flourish.style.animation = 'none';

        // Trigger reflow
        flourish.offsetHeight;

        setTimeout(() => {
            flourish.style.animation = '';
        }, 10);

        console.log(`✨ Logo flourish: ${randomEffect}`);
    }

    /**
     * Add click handler to logo for random flourish replay
     */
    setupLogoInteractions() {
        const headerLogo = document.querySelector('.site-header img, [data-logo-flourish], .logo img');
        if (!headerLogo) {
            console.warn('⚠️ Header logo not found for interactions');
            return;
        }

        // Create flourish container for header logo
        let flourishContainer = headerLogo.parentNode.querySelector('.header-logo-flourish-container');

        if (!flourishContainer) {
            flourishContainer = document.createElement('div');
            flourishContainer.className = 'header-logo-flourish-container';
            flourishContainer.innerHTML = `<div class="header-flourish"></div>`;

            if (headerLogo.parentNode) {
                headerLogo.parentNode.style.position = 'relative';
                headerLogo.parentNode.appendChild(flourishContainer);
            }
        }

        headerLogo.addEventListener('click', () => {
            const flourish = flourishContainer.querySelector('.header-flourish');
            if (!flourish) return;

            const randomEffect = this.logoFlourishes[Math.floor(Math.random() * this.logoFlourishes.length)];

            flourish.className = `header-flourish flourish-${randomEffect}`;
            flourish.style.animation = 'none';
            flourish.offsetHeight;
            setTimeout(() => {
                flourish.style.animation = '';
            }, 10);

            console.log(`🎨 Header logo flourish: ${randomEffect}`);
        });

        headerLogo.style.cursor = 'pointer';
        headerLogo.title = 'Click for a flourish!';

        console.log('✅ Logo click interactions ready');
    }
}
