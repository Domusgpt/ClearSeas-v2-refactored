const { chromium } = require('playwright');

async function testCardsVisible() {
    console.log('Testing card visibility on deployed site...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => console.log('[CONSOLE]', msg.text()));

    await page.goto('https://domusgpt.github.io/ClearSeas-v2-refactored/', {
        waitUntil: 'networkidle',
        timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Check cards
    const cardInfo = await page.evaluate(() => {
        const cards = document.querySelectorAll('.signal-card, .capability-card, .card');
        return Array.from(cards).slice(0, 6).map((card, i) => {
            const styles = window.getComputedStyle(card);
            return {
                index: i,
                transform: card.style.transform,
                opacity: styles.opacity,
                visibility: styles.visibility,
                display: styles.display,
                zIndex: styles.zIndex,
                textContent: card.textContent.substring(0, 50)
            };
        });
    });

    console.log('\n=== Card Visibility Check ===');
    cardInfo.forEach(info => {
        console.log(`\nCard ${info.index}:`);
        console.log(`  Transform: ${info.transform}`);
        console.log(`  Opacity: ${info.opacity}`);
        console.log(`  Visibility: ${info.visibility}`);
        console.log(`  Display: ${info.display}`);
        console.log(`  Text: ${info.textContent}...`);
    });

    console.log('\n\nBrowser will stay open for 30 seconds to inspect...');
    await page.waitForTimeout(30000);

    await browser.close();
}

testCardsVisible().catch(console.error);
