/**
 * Test Scroll-Based Intro Sequence
 */

const { chromium } = require('playwright');

async function testScrollIntro() {
    console.log('🎬 Testing Scroll-Based Intro\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log(`[PAGE] ${msg.text()}`);
        }
    });

    try {
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

        console.log('\n=== Initial State Check ===');

        // Check overlay exists and is visible
        const overlayState = await page.evaluate(() => {
            const overlay = document.querySelector('.intro-overlay');
            const logo = document.querySelector('.intro-logo');
            const heroSection = document.querySelector('#hero');

            return {
                overlayExists: !!overlay,
                overlayVisible: overlay ? window.getComputedStyle(overlay).opacity : null,
                logoVisible: logo ? window.getComputedStyle(logo).opacity : null,
                heroOpacity: heroSection ? window.getComputedStyle(heroSection).opacity : null,
                scrollIndicator: !!overlay && window.getComputedStyle(overlay, '::after').content
            };
        });

        console.log('Overlay exists:', overlayState.overlayExists);
        console.log('Overlay opacity:', overlayState.overlayVisible);
        console.log('Logo opacity:', overlayState.logoVisible);
        console.log('Hero opacity:', overlayState.heroOpacity);

        // Simulate scroll to trigger animation
        console.log('\n=== Scrolling to Trigger Intro ===');

        // Scroll in steps to see animation progress
        const scrollSteps = [0, 200, 400, 600, 800, 1000, 1200];

        for (const scrollY of scrollSteps) {
            await page.evaluate((y) => window.scrollTo(0, y), scrollY);
            await page.waitForTimeout(500);

            const state = await page.evaluate(() => {
                const logo = document.querySelector('.intro-logo');
                const overlay = document.querySelector('.intro-overlay');
                const hero = document.querySelector('#hero');

                return {
                    scrollY: window.scrollY,
                    logoOpacity: logo ? window.getComputedStyle(logo).opacity : null,
                    overlayOpacity: overlay ? window.getComputedStyle(overlay).opacity : null,
                    heroOpacity: hero ? window.getComputedStyle(hero).opacity : null
                };
            });

            console.log(`Scroll ${state.scrollY}px: Logo=${state.logoOpacity} | Overlay=${state.overlayOpacity} | Hero=${state.heroOpacity}`);
        }

        console.log('\n=== Waiting for user to see animation ===');
        console.log('Browser will stay open for 30 seconds...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testScrollIntro();
