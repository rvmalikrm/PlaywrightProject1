import { test, expect } from '@playwright/test';

test('VWO login with incorrect username shows error message', async ({ page }) => {
  await page.goto('https://app.vwo.com/#/login');

  await page.getByRole('textbox', { name: 'Email address' }).fill('wronguser@invalid.com');
  await page.getByRole('textbox', { name: 'password' }).fill('Test@123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  const errorMessage = page.locator('#js-notification-box-msg');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText('Your email, password, IP address or location did not match');

  const errorText = await errorMessage.textContent();
  console.log('Error message displayed:', errorText?.trim());
});
