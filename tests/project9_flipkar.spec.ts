import {test, expect} from '@playwright/test';

test('Find the cheapest Mac mini on Flipkart', async ({page}, testInfo) =>
{
    // Step 1: Open the Flipkart search page
    await page.goto('https://www.flipkart.com/search');

    // Step 2: Search for macmini and click the SVG search icon
    await page.locator('input[name="q"]').fill('macmini');
    await page.locator('button[type="submit"]:has(svg)').click();
    await expect(page).toHaveURL(/q=macmini/);
    // Wait until the results have loaded before sorting, otherwise the click is lost
    await expect(page.getByText(/Showing 1 – \d+ of [\d,]+ results/)).toBeVisible();

    // Every product card on the result page has a data-id attribute
    const cards = page.locator('div[data-id]');
    const firstIdBeforeSort = await cards.first().getAttribute('data-id');

    // Step 3: Sort by Price -- Low to High
    await page.getByText('Price -- Low to High', {exact: true}).click();
    await expect(page).toHaveURL(/sort=price_asc/);
    // Wait until the sorted results replace the old ones
    await expect(cards.first()).not.toHaveAttribute('data-id', firstIdBeforeSort!);

    // Collect name + selling price of all results on the first page
    const products: {name: string, price: number}[] = [];
    const count = await cards.count();
    for (let i = 0; i < count; i++)
    {
        const card = cards.nth(i);
        const name = await card.locator('a[title]').first().getAttribute('title');
        // The first "₹..." text in a card is the selling price (the struck-out MRP comes after it)
        const priceText = await card.getByText(/^₹[\d,]+$/).first().innerText();
        const price = Number(priceText.replace(/[₹,]/g, ''));
        if (name) products.push({name, price});
    }
    console.log(`Total results on first page: ${products.length}`);
    console.table(products);

    // Keep only real Mac mini products (search also returns other mini PCs)
    const macMinis = products.filter(p => /mac\s*mini/i.test(p.name));
    expect(macMinis.length).toBeGreaterThan(0);

    const cheapest = macMinis.reduce((min, p) => p.price < min.price ? p : min);
    console.log(`Cheapest Mac mini: ${cheapest.name} -> ₹${cheapest.price.toLocaleString('en-IN')}`);

    // Highlight the cheapest product and attach a screenshot to the report
    const cheapestCard = cards.filter({has: page.locator(`a[title="${cheapest.name}"]`)}).first();
    await cheapestCard.scrollIntoViewIfNeeded();
    await cheapestCard.evaluate(el => el.style.outline = '4px solid red');
    await testInfo.attach('cheapest-mac-mini', {
        body: await page.screenshot({fullPage: false}),
        contentType: 'image/png',
    });
    await page.screenshot({path: 'screenshots/cheapest-mac-mini.png'});
});
