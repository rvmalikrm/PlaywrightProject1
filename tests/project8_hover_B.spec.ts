import {test, expect} from '@playwright/test';

test('Right-click context menu', async( {page}) =>
{
    await page.goto('https://app.thetestingacademy.com/playwright/widgets/context-menu');
    await page.getByTestId('ctx-target').click({button:'right'});
    await page.getByRole('menu').getByText('Copy', {exact: true}).click();
    const output = page.getByTestId('ctx-output');
    await expect(output).not.toHaveText(/No menu interaction yet/);
    const text = await output.innerText();
    console.log(JSON.parse(text));
    expect(JSON.parse(text).action).toBe('copy');


})
