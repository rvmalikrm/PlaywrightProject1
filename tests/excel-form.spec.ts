import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

test('fills username and emailId from excel file', async ({ page }) => {
  const filePath = path.resolve(__dirname, '../data/users.xlsx');
  const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  expect(rows.length).toBeGreaterThan(0);

  const firstUser = rows[0] as { username?: string; emailId?: string };

  await page.goto('http://localhost:3100');
  await page.locator('#username').fill(String(firstUser.username || ''));
  await page.locator('#emailId').fill(String(firstUser.emailId || ''));

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('#result')).toContainText(`Username: ${firstUser.username}`);
  await expect(page.locator('#result')).toContainText(`Email ID: ${firstUser.emailId}`);
});
