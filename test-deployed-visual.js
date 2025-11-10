/**
 * Visual Testing Script for Deployed ClearSeas-Enhanced
 * Tests actual deployed site and captures screenshots
 */

const { chromium } = require('playwright');

async function testDeployedSite() {
    console.log('🧪 Testing https://domusgpt.github.io/ClearSeas-Enhanced/\n');

    const browser = await chromium.launch({ headless: false });

    // Test desktop view
    const desktopContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const desktopPage = await desktopContext.newPage();

    // Test mobile portrait view
    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobilePage = await mobileContext.newPage();

    console.log('📱 Testing Mobile Portrait (390x844)...\n');

    // Setup console logging for mobile
    mobilePage.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log(`❌ [Mobile Console Error] ${text}`);
        } else if (text.includes('✅') || text.includes('❌') || text.includes('🎬') || text.includes('🌌')) {
            console.log(`📱 [Mobile] ${text}`);
        }
    });

    mobilePage.on('pageerror', error => {
        console.log(`❌ [Mobile Page Error] ${error.message}`);
    });

    try {
        await mobilePage.goto('https://domusgpt.github.io/ClearSeas-Enhanced/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Mobile page loaded\n');

        // Wait for app initialization
        await mobilePage.waitForTimeout(2000);

        // Check for quantum-background canvas
        const mobileCanvas = await mobilePage.$('#quantum-background');
        if (mobileCanvas) {
            const mobileCanvasBox = await mobileCanvas.boundingBox();
            console.log('📐 Mobile Canvas:', mobileCanvasBox);
        } else {
            console.log('❌ Mobile: quantum-background canvas not found');
        }

        // Check card positions
        const mobileCards = await mobilePage.$$('.signal-card, .capability-card, .card');
        console.log(`\n🃏 Found ${mobileCards.length} cards on mobile`);

        for (let i = 0; i < Math.min(mobileCards.length, 5); i++) {
            const card = mobileCards[i];
            const box = await card.boundingBox();
            const transform = await card.evaluate(el => window.getComputedStyle(el).transform);
            const opacity = await card.evaluate(el => window.getComputedStyle(el).opacity);
            const position = await card.evaluate(el => window.getComputedStyle(el).position);

            console.log(`\n  Card ${i}:`);
            console.log(`    Position: ${position}`);
            console.log(`    BoundingBox: ${JSON.stringify(box)}`);
            console.log(`    Transform: ${transform}`);
            console.log(`    Opacity: ${opacity}`);
        }

        // Check section positions
        const sections = await mobilePage.$$('section');
        console.log(`\n📄 Found ${sections.length} sections`);

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const id = await section.getAttribute('id');
            const transformStyle = await section.evaluate(el => window.getComputedStyle(el).transformStyle);
            const box = await section.boundingBox();

            console.log(`\n  Section #${id}:`);
            console.log(`    TransformStyle: ${transformStyle}`);
            console.log(`    Height: ${box?.height}px`);
        }

        // Take screenshot of mobile view
        await mobilePage.screenshot({ path: '/mnt/c/Users/millz/Desktop/clearseas-mobile-portrait.png', fullPage: true });
        console.log('\n📸 Screenshot saved: /mnt/c/Users/millz/Desktop/clearseas-mobile-portrait.png');

        // Scroll test on mobile
        console.log('\n🖱️ Testing mobile scroll...');
        await mobilePage.evaluate(() => window.scrollTo(0, 500));
        await mobilePage.waitForTimeout(1000);

        await mobilePage.screenshot({ path: '/mnt/c/Users/millz/Desktop/clearseas-mobile-scrolled.png' });
        console.log('📸 Scrolled screenshot saved: /mnt/c/Users/millz/Desktop/clearseas-mobile-scrolled.png');

    } catch (error) {
        console.error('❌ Mobile test failed:', error.message);
        console.error(error.stack);
    }

    console.log('\n\n🖥️ Testing Desktop (1920x1080)...\n');

    // Setup console logging for desktop
    desktopPage.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log(`❌ [Desktop Console Error] ${text}`);
        } else if (text.includes('✅') || text.includes('❌') || text.includes('🎬') || text.includes('🌌')) {
            console.log(`🖥️ [Desktop] ${text}`);
        }
    });

    desktopPage.on('pageerror', error => {
        console.log(`❌ [Desktop Page Error] ${error.message}`);
    });

    try {
        await desktopPage.goto('https://domusgpt.github.io/ClearSeas-Enhanced/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Desktop page loaded\n');

        await desktopPage.waitForTimeout(2000);

        // Check desktop canvas
        const desktopCanvas = await desktopPage.$('#quantum-background');
        if (desktopCanvas) {
            const desktopCanvasBox = await desktopCanvas.boundingBox();
            console.log('📐 Desktop Canvas:', desktopCanvasBox);
        }

        // Check card positions on desktop
        const desktopCards = await desktopPage.$$('.signal-card, .capability-card, .card');
        console.log(`\n🃏 Found ${desktopCards.length} cards on desktop`);

        for (let i = 0; i < Math.min(desktopCards.length, 3); i++) {
            const card = desktopCards[i];
            const box = await card.boundingBox();
            const transform = await card.evaluate(el => window.getComputedStyle(el).transform);

            console.log(`  Card ${i}: ${JSON.stringify(box)}`);
            console.log(`    Transform: ${transform}`);
        }

        // Take screenshot of desktop view
        await desktopPage.screenshot({ path: '/mnt/c/Users/millz/Desktop/clearseas-desktop.png', fullPage: true });
        console.log('\n📸 Screenshot saved: /mnt/c/Users/millz/Desktop/clearseas-desktop.png');

    } catch (error) {
        console.error('❌ Desktop test failed:', error.message);
    }

    console.log('\n✅ Visual testing complete. Check screenshots on Desktop.');
    console.log('\n🔍 Key Issues to Look For:');
    console.log('  - Cards stuck in center on mobile');
    console.log('  - Position: absolute causing overlap');
    console.log('  - TransformZ not working properly');
    console.log('  - Section height/layout issues');

    // Keep browser open for manual inspection
    console.log('\n⏸️ Browser will stay open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    await browser.close();
}

testDeployedSite().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
