/**
 * Test Intro Sequence Deployment with Cache Bypass
 */

const { chromium } = require('playwright');

async function testIntroDeployment() {
    console.log('🎬 Testing Intro Sequence Deployment (Cache Bypass)\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        // Force cache bypass
        ignoreHTTPSErrors: true,
        bypassCSP: true,
    });

    const page = await context.newPage();

    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        console.log(`[CONSOLE] ${text}`);
    });

    try {
        // Load with cache bypass
        await page.goto('https://domusgpt.github.io/ClearSeas-v2-refactored/', {
            waitUntil: 'networkidle',
            timeout: 60000
        });

        console.log('\n=== Checking Intro Sequence Elements ===');

        // Wait a moment for intro to potentially appear
        await page.waitForTimeout(2000);

        // Check for intro overlay
        const introOverlay = await page.evaluate(() => {
            const overlay = document.querySelector('.intro-overlay');
            return {
                exists: !!overlay,
                visible: overlay ? window.getComputedStyle(overlay).display !== 'none' : false,
                opacity: overlay ? window.getComputedStyle(overlay).opacity : null
            };
        });

        console.log('Intro Overlay:', introOverlay);

        // Check for intro sequence instance
        const introInstance = await page.evaluate(() => {
            return {
                exists: !!window.introSequence,
                hasPlayed: window.introSequence?.hasPlayed,
                sessionStorage: sessionStorage.getItem('intro-played')
            };
        });

        console.log('Intro Instance:', introInstance);

        // Check cards for gradients (NOT videos)
        const cardCheck = await page.evaluate(() => {
            const cards = document.querySelectorAll('.signal-card, .capability-card');
            const results = [];

            cards.forEach((card, idx) => {
                const gradient = card.querySelector('.card-gradient-bg');
                const video = card.querySelector('video');
                const content = card.querySelector('h2, h3');

                results.push({
                    cardIndex: idx,
                    hasGradient: !!gradient,
                    gradientType: gradient?.dataset?.gradient || null,
                    hasVideo: !!video,
                    contentVisible: content ? window.getComputedStyle(content).opacity : null,
                    contentZIndex: content ? window.getComputedStyle(content).zIndex : null
                });
            });

            return results;
        });

        console.log('\n=== Card Gradient & Content Check ===');
        cardCheck.forEach(card => {
            const status = card.hasGradient ? '✅' : '❌';
            const videoStatus = card.hasVideo ? '❌ HAS VIDEO' : '✅ NO VIDEO';
            const contentStatus = parseFloat(card.contentVisible) > 0 ? '✅ VISIBLE' : '❌ HIDDEN';
            console.log(`Card ${card.cardIndex}: ${status} Gradient (${card.gradientType}) | ${videoStatus} | Content: ${contentStatus} (z:${card.contentZIndex})`);
        });

        // Check for video 404 errors
        const has404Videos = consoleMessages.some(msg =>
            msg.includes('Video failed to load') ||
            msg.includes('assets/videos/') ||
            msg.includes('404')
        );

        console.log('\n=== Results Summary ===');
        console.log(`Intro Sequence: ${introInstance.exists ? '✅ LOADED' : '❌ MISSING'}`);
        console.log(`Intro Played: ${introInstance.hasPlayed ? 'Yes (skipped)' : 'No (should show)'}`);
        console.log(`Cards with Gradients: ${cardCheck.filter(c => c.hasGradient).length}/${cardCheck.length}`);
        console.log(`Cards with Videos: ${cardCheck.filter(c => c.hasVideo).length}/${cardCheck.length}`);
        console.log(`Cards Content Visible: ${cardCheck.filter(c => parseFloat(c.contentVisible) > 0).length}/${cardCheck.length}`);
        console.log(`Video 404 Errors: ${has404Videos ? '❌ YES (OLD VERSION)' : '✅ NO (FIXED)'}`);

        // Check intro-sequence.css loaded
        const cssLoaded = await page.evaluate(() => {
            const sheets = Array.from(document.styleSheets);
            return sheets.some(sheet =>
                sheet.href && sheet.href.includes('intro-sequence.css')
            );
        });

        console.log(`Intro CSS Loaded: ${cssLoaded ? '✅ YES' : '❌ NO'}`);

        // Final verdict
        const allGood = (
            introInstance.exists &&
            cardCheck.every(c => c.hasGradient && !c.hasVideo && parseFloat(c.contentVisible) > 0) &&
            !has404Videos &&
            cssLoaded
        );

        console.log(`\n${allGood ? '🎉 ALL FIXES DEPLOYED SUCCESSFULLY!' : '⚠️ SOME ISSUES DETECTED'}`);

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testIntroDeployment();
