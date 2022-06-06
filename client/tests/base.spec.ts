import { test, expect } from '@playwright/test';
test('test', async ({ page }) => {
  // Go to http://localhost:4500/
  await page.goto('http://localhost:4500/');
  // Click [placeholder="Room ID"]
  await page.locator('[placeholder="Room ID"]').click();
  // Fill [placeholder="Room ID"]
  await page.locator('[placeholder="Room ID"]').fill('test');
  // Click text=Create
  await page.locator('text=Create').click();
  await expect(page).toHaveURL('http://localhost:4500/test');
  // Click [placeholder="Name"]
  await page.locator('[placeholder="Name"]').click();
  // Fill [placeholder="Name"]
  await page.locator('[placeholder="Name"]').fill('test');
  // Click .css-1qfu80a-ValueContainer2
  await page.locator('.css-1qfu80a-ValueContainer2').click();
  // Click .css-1qfu80a-ValueContainer2
  await page.locator('.css-1qfu80a-ValueContainer2').click();
  // Click text=Join
  await page.locator('text=Join').click();
  // Click button >> nth=0
  await page.locator('button').first().click();
  // Click text=Close
  await page.locator('text=Close').click();
  // Click text=Leave
  await page.locator('text=Leave').click();
  await expect(page).toHaveURL('http://localhost:4500/test');
  // Click text=Back
  await page.locator('text=Back').click();
  await expect(page).toHaveURL('http://localhost:4500/');
});
