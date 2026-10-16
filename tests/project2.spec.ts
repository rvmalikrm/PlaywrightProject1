import {test, expect} from '@playwright/test';


test('Make appointment with Cura Healthcare', async ({page}) =>
{
    await page.goto('https://katalon-demo-cura.herokuapp.com/');
    await page.getByRole('link',{name:'Make Appointment'}).click();
    await page.getByPlaceholder('Username').nth(1).fill('John Doe');
    await page.getByLabel('Password').fill('ThisIsNotAPassword');
    await page.getByRole('button',{name:'Login'}).click();

    await expect(page).toHaveURL('https://katalon-demo-cura.herokuapp.com/#appointment');

});
