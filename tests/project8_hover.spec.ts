import {test,expect} from '@playwright/test';
test('Hover on the element', async ({page}) => 
    {
        await page.goto('https://app.thetestingacademy.com/playwright/widgets/hover-menu');
        await page.getByTestId('nav-add-ons').hover();
        await page.getByTestId('test-id-Wifi').click();
        await page.getByTestId('hover-output').innerText();
        const text = await page.getByTestId('hover-output').innerText();
        console.log(JSON.parse(text));
        await page.waitForTimeout(2000);
    });