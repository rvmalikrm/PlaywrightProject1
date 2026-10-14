import { test, expect } from '@playwright/test';

test('Google search', async ({ page }) => 
{
  await page.goto('https://app.vwo.com/#/login');
  await page.getByRole('textbox',{name: 'Email address'}).fill('test@test.com');
  await page.getByRole('textbox',{name: 'password'}).fill('Test@123');
  await page.getByRole('button',{name: 'Sign in',exact: true}).click();
  await expect(page.locator('#js-notification-box-msg')).toHaveText('Your email, password, IP address or location did not match');
  await page.waitForTimeout(1000)
});