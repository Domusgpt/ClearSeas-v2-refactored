/**
 * IntroSequence - Logo + Company Name Entrance Animation
 * Creates dramatic intro with logo flourishes and hero section reveal
 * © 2025 Clear Seas Solutions LLC
 */

export class IntroSequence {
    constructor(gsap) {
        this.gsap = gsap;
        this.logoFlourishes = [
            'pulse', 'ripple', 'spiral', 'quantum', 'wave', 'crystal'
        ];
        this.hasPlayed = sessionStorage.getItem('intro-played') === 'true';
    }

    /**
     * Create intro overlay with logo and company name
     */
    createIntroOverlay() {
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
        document.body.appendChild(overlay);
        return overlay;
    }

    /**
     * Play random logo flourish animation
     */
    playLogoFlourish(container) {
        const flourish = container.querySelector('.logo-flourish');
        const randomEffect = this.logoFlourishes[Math.floor(Math.random() * this.logoFlourishes.length)];

        flourish.className = `logo-flourish flourish-${randomEffect}`;
        flourish.style.animation = 'none';
        setTimeout(() => {
            flourish.style.animation = '';
        }, 10);
    }

    /**
     * Main intro sequence
     */
    async play(skipIntro = false) {
        // Skip if already played this session (unless forced)
        if (this.hasPlayed && !skipIntro) {
            console.log('🎬 Intro: Skipping (already played this session)');
            return;
        }

        console.log('🎬 Intro: Starting sequence...');

        const overlay = this.createIntroOverlay();
        const logo = overlay.querySelector('.intro-logo');
        const logoContainer = overlay.querySelector('.intro-logo-container');
        const words = overlay.querySelectorAll('.company-word');
        const tagline = overlay.querySelector('.intro-tagline');

        // Hide hero section initially
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
            heroSection.style.opacity = '0';
            heroSection.style.transform = 'scale(0.95)';
        }

        // Create timeline
        const tl = this.gsap.timeline({
            onComplete: () => {
                sessionStorage.setItem('intro-played', 'true');
                this.hasPlayed = true;
            }
        });

        // 1. Logo entrance with flourish
        tl.fromTo(logo,
            { scale: 0, rotation: -180, opacity: 0 },
            {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 1.2,
                ease: 'back.out(1.7)',
                onComplete: () => this.playLogoFlourish(logoContainer)
            }
        );

        // 2. Company name - words appear one by one
        tl.fromTo(words,
            { opacity: 0, y: 50, rotationX: -90 },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: 'power3.out'
            },
            '-=0.4'
        );

        // 3. Tagline fade in
        tl.fromTo(tagline,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out'
            },
            '-=0.2'
        );

        // 4. Hold for impact
        tl.to({}, { duration: 1.5 });

        // 5. Logo shrinks and moves to header
        tl.to(logoContainer, {
            scale: 0.3,
            x: -window.innerWidth / 2 + 100,
            y: -window.innerHeight / 2 + 60,
            duration: 1,
            ease: 'power3.inOut'
        });

        // 6. Fade out company name and tagline
        tl.to([words, tagline], {
            opacity: 0,
            y: -30,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.in'
        }, '-=0.8');

        // 7. Fade out entire overlay
        tl.to(overlay, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => overlay.remove()
        });

        // 8. Hero section AMAZING entrance
        if (heroSection) {
            tl.to(heroSection, {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: 'power4.out'
            }, '-=0.4');

            // Animate hero content elements
            const heroTitle = heroSection.querySelector('h1');
            const heroText = heroSection.querySelector('.hero-intro__text');
            const heroCards = heroSection.querySelectorAll('.signal-card');

            if (heroTitle) {
                tl.fromTo(heroTitle,
                    { opacity: 0, y: 100, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: 'back.out(1.2)'
                    },
                    '-=0.8'
                );
            }

            if (heroText) {
                tl.fromTo(heroText,
                    { opacity: 0, x: -50 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power3.out'
                    },
                    '-=0.6'
                );
            }

            if (heroCards.length) {
                tl.fromTo(heroCards,
                    { opacity: 0, y: 80, rotationX: 45 },
                    {
                        opacity: 1,
                        y: 0,
                        rotationX: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: 'back.out(1.5)'
                    },
                    '-=0.4'
                );
            }
        }

        return tl;
    }

    /**
     * Add click handler to logo for random flourish replay
     */
    setupLogoInteractions() {
        const headerLogo = document.querySelector('.site-header img, [data-logo-flourish]');
        if (!headerLogo) return;

        const flourishContainer = document.createElement('div');
        flourishContainer.className = 'header-logo-flourish-container';
        flourishContainer.innerHTML = `<div class="header-flourish"></div>`;
        headerLogo.parentNode.style.position = 'relative';
        headerLogo.parentNode.appendChild(flourishContainer);

        headerLogo.addEventListener('click', () => {
            const flourish = flourishContainer.querySelector('.header-flourish');
            const randomEffect = this.logoFlourishes[Math.floor(Math.random() * this.logoFlourishes.length)];

            flourish.className = `header-flourish flourish-${randomEffect}`;
            flourish.style.animation = 'none';
            setTimeout(() => {
                flourish.style.animation = '';
            }, 10);

            console.log(`🎨 Logo flourish: ${randomEffect}`);
        });

        headerLogo.style.cursor = 'pointer';
        headerLogo.title = 'Click for a flourish!';
    }
}
