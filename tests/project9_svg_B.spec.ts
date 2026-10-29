import {test, expect } from '@playwright/test';

test('SVG automation', async({page}) =>
{
    await page.goto('https://simplemaps.com/svg/country/in#admin1');

    // <path> elements are only shapes (no text); state names live in <text class="sm_label ...">
    const labels = page.locator('svg text.sm_label');
    await expect(labels.first()).toBeAttached();   // wait for the interactive map to be drawn

    const states = await labels.allTextContents();

    for (const state of states)
        {
        console.log(state);
        }



});
