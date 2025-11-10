/**
 * Playwright test to check if the site works
 */

const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing https://domusgpt.github.io/ClearSeas-Enhanced/\n');

    const browser = await chromium.launch({
        headless: true,
        executablePath: '/usr/bin/google-chrome'
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Collect errors
    const errors = [];
    page.on('pageerror', err => {
        errors.push(err.toString());
    });

    try {
        // Navigate to site
        console.log('📡 Loading site...');
        await page.goto('https://domusgpt.github.io/ClearSeas-Enhanced/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Page loaded\n');

        // Wait for app initialization
        await page.waitForTimeout(3000);

        // Take screenshot of hero
        await page.screenshot({ path: '/mnt/c/Users/millz/Desktop/test-hero.png', fullPage: false });
        console.log('📸 Screenshot saved: test-hero.png\n');

        // Scroll down to see sections
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/mnt/c/Users/millz/Desktop/test-scrolled.png', fullPage: false });
        console.log('📸 Screenshot saved: test-scrolled.png\n');

        // Check for canvas elements
        const canvases = await page.$$('canvas');
        console.log(`🎨 Canvas elements found: ${canvases.length}`);

        // Check for quantum background
        const quantumBg = await page.$('#quantum-background');
        console.log(`🌌 Quantum background: ${quantumBg ? '✅ EXISTS' : '❌ MISSING'}`);

        // Check for element visualizers
        const elementViz = await page.$$('.element-visualizer-canvas');
        console.log(`🎯 Element visualizers: ${elementViz.length}`);

        // Check for character visualizers
        const charViz = await page.$$('.char-visualizer-canvas');
        console.log(`📝 Character visualizers: ${charViz.length}`);

        // Check for GSAP
        const gsapLoaded = await page.evaluate(() => !!window.gsap);
        console.log(`📦 GSAP loaded: ${gsapLoaded ? '✅ YES' : '❌ NO'}`);

        // Check for SplitType
        const splitTypeLoaded = await page.evaluate(() => !!window.SplitType);
        console.log(`📦 SplitType loaded: ${splitTypeLoaded ? '✅ YES' : '❌ NO'}`);

        // Check if app initialized
        const appInitialized = await page.evaluate(() => !!window.clearSeasApp);
        console.log(`🌊 App initialized: ${appInitialized ? '✅ YES' : '❌ NO'}`);

        console.log('\n📋 CONSOLE MESSAGES:');
        consoleMessages.slice(0, 30).forEach(msg => console.log(msg));

        if (errors.length > 0) {
            console.log('\n❌ ERRORS FOUND:');
            errors.forEach(err => console.log(err));
        } else {
            console.log('\n✅ NO ERRORS DETECTED');
        }

    } catch (error) {
        console.error('❌ TEST FAILED:', error);
    } finally {
        await browser.close();
    }
})();
