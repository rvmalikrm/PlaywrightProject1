import {test, expect} from '@playwright/test';

test('Web Table Employee Directory Automation', async ({page}) =>
{
    await page.goto('https://app.thetestingacademy.com/playwright/webtable');
     //clear the selection history
    await page.getByRole("button", { name: "Clear" }).click();
    await page.getByPlaceholder('Search username, role, city, project...').fill('Kabir');
    await page.waitForTimeout(1000)

    await expect(page.getByText('Kabir.Khan', { exact: true })).toBeVisible();
    await page.getByLabel('Select Kabir.Khan').check();

     await page.waitForTimeout(1000)
})