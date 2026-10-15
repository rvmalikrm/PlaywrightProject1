import {test, expect} from '@playwright/test';

test('Check invalid mail domain', async ({page}) => {
    await page.goto('https://vwo.com/free-trial/?utm_medium=website&utm_source=login-page&utm_campaign=mof_eg_loginpage');

    // The placeholder is shared by several hidden forms on the page, so target the step-1 email field by id
    const emailInput = page.locator('#free-trial-step1-email');
    await emailInput.pressSequentially('data@gmail.com');

    await expect(emailInput).toHaveClass(/invalid-input/);
    await expect(emailInput.locator('xpath=(//div[contains(@class,"invalid-reason")])[1]')).toHaveText("gmail.com doesn't look like a business domain. Please use your business email.");



    // await emailInput.blur();

    // // The error text is always in the DOM; it is shown only when the input gets the 'invalid-input' class
    // await expect(emailInput).toHaveClass(/invalid-input/);
    // await expect(emailInput.locator('xpath=following-sibling::div[contains(@class, "invalid-reason")]'))
    //     .toHaveText("gmail.com doesn't look like a business domain. Please use your business email.");
});
