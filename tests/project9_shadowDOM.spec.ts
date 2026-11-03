import {test, expect} from '@playwright/test';

test('Shadow DOM Automation', async ({page}) =>
{

    await page.goto('https://selectorshub.com/xpath-practice-page/');
    const email = page.getByRole('textbox', { name: 'Email', exact: true });
    // The field is readonly until it gets focus (its onfocus handler removes readonly)
    await email.click();
    await expect(email).toBeEditable();
    await email.fill('ravi.malik@test.com');
    await expect(email).toHaveValue('ravi.malik@test.com');

    const password = page.getByPlaceholder('Enter Password');
    await password.fill('Test@123');
    await expect(password).toHaveValue('Test@123');

    // 4 inputs share this placeholder; only the one inside .element-companyId is visible
    const company = page.locator('.element-companyId').getByPlaceholder('Enter your company');
    await company.fill('The Testing Academy');
    await expect(company).toHaveValue('The Testing Academy');

    // Same as company: 4 copies exist, only the one inside .element-companyId is visible
    const mobile = page.locator('.element-companyId').getByPlaceholder('Enter your mobile number');
    await mobile.fill('1234567890');
    await expect(mobile).toHaveValue('1234567890');

    // <input> is wrapped inside <label>, so getByLabel works; exact avoids other labels containing "Country"
    const country = page.getByLabel('Country', { exact: true });
    await country.fill('India');
    await expect(country).toHaveValue('India');

  
    await page.getByRole('button', {name:'Submit'}).click();

    await page.waitForTimeout(2000);




});