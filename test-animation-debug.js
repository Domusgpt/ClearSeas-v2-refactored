/**
 * Animation Debug Test - Capture screenshots at different scroll positions
 * to diagnose animation issues
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAnimations() {
    console.log('🎬 Starting animation debug test...');

    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox'
        ]
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Listen for page crash
    page.on('crash', () => {
        console.error('❌ Page crashed!');
    });

    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        if (type === 'error') {
            console.error('Browser console error:', msg.text());
        }
    });

    // Create screenshots directory
    const screenshotDir = path.join(__dirname, 'animation-debug-screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    try {
        // Navigate to the site
        console.log('📍 Navigating to site...');
        await page.goto('http://localhost:8080', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for app to initialize
        console.log('⏳ Waiting for app initialization...');
        await page.waitForTimeout(3000);

        // Check if animation coordinator loaded
        const animationSystemReady = await page.evaluate(() => {
            return window.clearSeasApp && window.clearSeasApp.animationCoordinator;
        });

        console.log(`Animation System Ready: ${animationSystemReady}`);

        // Get page height
        const pageHeight = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
        });
        const viewportHeight = 1080;

        console.log(`Page height: ${pageHeight}px, Viewport: ${viewportHeight}px`);

        // Take screenshot at initial position
        console.log('\n📸 Capturing initial state (0%)...');
        await page.screenshot({
            path: path.join(screenshotDir, '00-initial-0pct.png'),
            fullPage: false
        });

        // Get animation stats
        const initialStats = await page.evaluate(() => {
            if (window.clearSeasApp?.animationCoordinator) {
                return window.clearSeasApp.animationCoordinator.getStats();
            }
            return null;
        });
        console.log('Initial animation stats:', initialStats);

        // Scroll and capture at 20% increments
        const scrollPositions = [20, 40, 60, 80, 100];

        for (const pct of scrollPositions) {
            const scrollY = Math.floor((pageHeight - viewportHeight) * (pct / 100));

            console.log(`\n📸 Scrolling to ${pct}% (${scrollY}px)...`);

            // Scroll smoothly
            await page.evaluate((y) => {
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, scrollY);

            // Wait for scroll to settle and animations to trigger
            await page.waitForTimeout(1000);

            // Capture screenshot
            await page.screenshot({
                path: path.join(screenshotDir, `${String(pct).padStart(2, '0')}-scroll-${pct}pct.png`),
                fullPage: false
            });

            // Check what sections are revealed
            const revealedSections = await page.evaluate(() => {
                const sections = Array.from(document.querySelectorAll('section.section, section.hero'));
                return sections.map(s => ({
                    id: s.id || 'unknown',
                    isRevealed: s.classList.contains('is-revealed'),
                    visible: s.getBoundingClientRect().top < window.innerHeight
                }));
            });

            console.log(`Sections at ${pct}%:`, revealedSections);
        }

        // Now capture close-together positions to see transitions
        console.log('\n📸 Capturing transition frames...');

        // Scroll back to top
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(500);

        // Capture hero section transition
        console.log('Capturing hero → capabilities transition...');
        const heroBottom = await page.evaluate(() => {
            const hero = document.getElementById('hero');
            return hero ? hero.offsetTop + hero.offsetHeight : 800;
        });

        for (let i = 0; i < 5; i++) {
            const scrollY = heroBottom - 400 + (i * 100);
            await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
            await page.waitForTimeout(200);
            await page.screenshot({
                path: path.join(screenshotDir, `transition-hero-cap-${i}.png`),
                fullPage: false
            });
        }

        // Capture capabilities → products transition
        console.log('Capturing capabilities → products transition...');
        const capabilitiesBottom = await page.evaluate(() => {
            const capabilities = document.getElementById('capabilities');
            return capabilities ? capabilities.offsetTop + capabilities.offsetHeight : 1600;
        });

        for (let i = 0; i < 5; i++) {
            const scrollY = capabilitiesBottom - 400 + (i * 100);
            await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
            await page.waitForTimeout(200);
            await page.screenshot({
                path: path.join(screenshotDir, `transition-cap-prod-${i}.png`),
                fullPage: false
            });
        }

        // Check for console errors
        console.log('\n🔍 Checking for JavaScript errors...');
        const errors = await page.evaluate(() => {
            return window.__jsErrors || [];
        });

        if (errors.length > 0) {
            console.log('❌ JavaScript errors found:', errors);
        } else {
            console.log('✅ No JavaScript errors detected');
        }

        // Get final animation stats
        const finalStats = await page.evaluate(() => {
            if (window.clearSeasApp?.animationCoordinator) {
                return window.clearSeasApp.animationCoordinator.getStats();
            }
            return null;
        });
        console.log('\nFinal animation stats:', finalStats);

        // Check CSS loaded
        const cssLoaded = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.map(link => ({
                href: link.href.split('/').pop(),
                loaded: link.sheet !== null
            }));
        });
        console.log('\nCSS files:', cssLoaded);

        // Check if unified-animations.css rules are present
        const animationRules = await page.evaluate(() => {
            const styleSheets = Array.from(document.styleSheets);
            let foundRules = [];

            for (const sheet of styleSheets) {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    const animRules = rules.filter(rule =>
                        rule.cssText.includes('is-revealed') ||
                        rule.cssText.includes('sectionReveal') ||
                        rule.cssText.includes('--anim-')
                    );
                    foundRules.push(...animRules.map(r => r.cssText.substring(0, 100)));
                } catch (e) {
                    // CORS or other error
                }
            }

            return foundRules;
        });

        console.log('\n🎨 Animation CSS rules found:', animationRules.length);
        if (animationRules.length > 0) {
            console.log('Sample rules:', animationRules.slice(0, 3));
        }

        console.log(`\n✅ Screenshots saved to: ${screenshotDir}`);
        console.log('📊 Analysis complete!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Capture console errors
async function setupErrorCapture(page) {
    await page.evaluateOnNewDocument(() => {
        window.__jsErrors = [];
        window.addEventListener('error', (e) => {
            window.__jsErrors.push({
                message: e.message,
                filename: e.filename,
                lineno: e.lineno
            });
        });
    });
}

testAnimations().catch(console.error);
