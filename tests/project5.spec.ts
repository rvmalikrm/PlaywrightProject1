import {test, expect} from '@playwright/test';

test('Complete the QA profile on the QA Automation website', {
    tag: ['@P1', '@smoke'],
    annotation: { type: 'author', description: 'TTA-QA' },
}, async ({page}) =>
{
    await page.goto('https://app.thetestingacademy.com/playwright/tables/practice#page');
    await page.getByTestId('first-name').fill('Ravi');
    await page.getByLabel('Last name').fill('Malik');
      await page.waitForTimeout(1000)

   
    await page.getByTestId('gender-male').check();
    await page.waitForTimeout(1000)

    await page.getByTestId('years-experience').selectOption('7');
    await expect(page.getByTestId('years-experience')).toHaveValue('7');

    await page.getByTestId('profile-date').fill('2026-10-19');

    await page.getByTestId('profession-automation').check();

    await page.getByTestId('tool-uft').check();
    await page.getByTestId('tool-selenium').check();

    await page.getByTestId('continent-asia').check();
    await page.getByTestId('continent-africa').check();
    await page.getByTestId('continent-south-america').check();
    await page.getByTestId('continent-antarctica').check();
    await page.waitForTimeout(1000)
    await page.getByTestId('tab-switch').click();
    await page.waitForTimeout(1000)
    await page.getByTestId('upload-image').setInputFiles('testdata/qa.png');
    await page.waitForTimeout(1000)
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-file').click();
    const download = await downloadPromise;

    const filePath = 'downloads/' + download.suggestedFilename();
    await download.saveAs(filePath);
    console.log('File saved to: ' + filePath);

    await page.getByTestId('profile-submit').click();
    const output = page.locator('#submission-output');
    await expect(output).toContainText('firstName');

    const profileJson = JSON.parse(await output.innerText());
    console.log('Submitted profile JSON:');
    console.log(JSON.stringify(profileJson, null, 2));
    await page.getByTestId('profile-submit').click();
    



});