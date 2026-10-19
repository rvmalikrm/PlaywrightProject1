import{test, expect} from '@playwright/test';
test ('login page for Herokuapp', async ({page}) => 

{
await page.goto('https://the-internet.herokuapp.com/login');
await page.getByLabel('Username').fill('tomsmith');
await page.getByLabel('Password').fill('SuperSecretPassword!');
await page.getByRole('button', { name: 'Login' }).click();
await page.waitForTimeout(1000);

});

