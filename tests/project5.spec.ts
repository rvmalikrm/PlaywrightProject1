import {test, expect} from '@playwright/test';

test('Complete the QA profile on the QA Automation website', async ({page}) =>
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
    await page.waitForTimeout(1000)



});