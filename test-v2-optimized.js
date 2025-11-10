/**
 * Test V2 Optimized Deployment
 * Checks for dynamic opacity system and smooth animations
 */

const { chromium } = require('playwright');

async function testV2Optimized() {
    console.log('🧪 Testing V2 Optimized Deployment\n');
    console.log('Loading https://domusgpt.github.io/ClearSeas-Enhanced/\n');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        console.log(`[CONSOLE ${msg.type()}]`, text);
    });

    // Capture errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('[ERROR]', error.message);
    });

    await page.goto('https://domusgpt.github.io/ClearSeas-Enhanced/', {
        waitUntil: 'networkidle',
        timeout: 30000
    });

    // Wait for app to initialize
    await page.waitForTimeout(3000);

    // Check for V2 optimization markers
    console.log('\n=== Checking for V2 Optimizations ===');

    // Check canvas exists
    const canvasInfo = await page.evaluate(() => {
        const canvas = document.getElementById('quantum-background');
        if (!canvas) return { exists: false };

        return {
            exists: true,
            opacity: canvas.style.opacity,
            computedOpacity: window.getComputedStyle(canvas).opacity,
            position: canvas.style.position,
            zIndex: canvas.style.zIndex
        };
    });

    console.log('Canvas info:', JSON.stringify(canvasInfo, null, 2));

    // Check for OrthogonalScrollChoreographer
    const choreographerCheck = consoleMessages.some(msg =>
        msg.includes('OrthogonalScrollChoreographer') ||
        msg.includes('Orthogonal') ||
        msg.includes('orthogonal')
    );
    console.log('\n✅ OrthogonalScrollChoreographer:', choreographerCheck ? 'FOUND' : 'NOT FOUND');

    // Check for initial fade-in message
    const fadeInCheck = consoleMessages.some(msg =>
        msg.includes('fade-in complete') ||
        msg.includes('Visualizer initial')
    );
    console.log('✅ Initial fade-in animation:', fadeInCheck ? 'FOUND' : 'NOT FOUND');

    // Simulate scroll and check opacity changes
    console.log('\n=== Testing Dynamic Opacity During Scroll ===');

    const opacities = [];

    // Capture opacity at different scroll positions
    for (let i = 0; i < 5; i++) {
        await page.evaluate((scrollPos) => {
            window.scrollTo(0, scrollPos);
        }, i * 500);

        await page.waitForTimeout(200);

        const opacity = await page.evaluate(() => {
            const canvas = document.getElementById('quantum-background');
            return canvas ? parseFloat(window.getComputedStyle(canvas).opacity) : null;
        });

        opacities.push(opacity);
        console.log(`Scroll ${i * 500}px: opacity = ${opacity}`);
    }

    // Check if opacity changed during scroll
    const uniqueOpacities = [...new Set(opacities)].filter(o => o !== null);
    const dynamicOpacity = uniqueOpacities.length > 1;

    console.log('\n✅ Dynamic opacity working:', dynamicOpacity ? 'YES' : 'NO');
    console.log('   Unique opacity values:', uniqueOpacities);

    // Check app status
    const appStatus = await page.evaluate(() => {
        return {
            clearSeasApp: typeof window.clearSeasApp,
            visualizer: window.clearSeasApp?.quantumVisualizer ? 'exists' : 'missing',
            choreographer: window.clearSeasApp?.orthogonalScrollChoreographer ? 'exists' : 'missing',
            gl: window.clearSeasApp?.quantumVisualizer?.gl ? 'exists' : 'missing'
        };
    });

    console.log('\n=== App Status ===');
    console.log(JSON.stringify(appStatus, null, 2));

    console.log('\n=== Console Messages (filtered) ===');
    const relevantMessages = consoleMessages.filter(msg =>
        msg.includes('Clear Seas') ||
        msg.includes('Orthogonal') ||
        msg.includes('visualizer') ||
        msg.includes('fade-in') ||
        msg.includes('choreography')
    );
    relevantMessages.forEach(msg => console.log('  -', msg));

    console.log('\n=== Errors ===');
    console.log(errors.length > 0 ? errors : 'No errors');

    console.log('\n=== V2 Optimization Check Results ===');
    console.log(`✅ Canvas exists: ${canvasInfo.exists}`);
    console.log(`✅ OrthogonalScrollChoreographer: ${choreographerCheck}`);
    console.log(`✅ Initial fade-in: ${fadeInCheck}`);
    console.log(`✅ Dynamic opacity: ${dynamicOpacity}`);
    console.log(`✅ WebGL context: ${appStatus.gl === 'exists'}`);

    await browser.close();
}

testV2Optimized().catch(console.error);
