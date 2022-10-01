import { test, expect } from "@playwright/test";
test("test", async ({ page }) => {
  // Go to http://localhost:4500/
  await page.goto("http://localhost:4500/");
  // Click [placeholder="Room ID"]
  await page.locator('[placeholder="Room ID"]').click();
  // Fill [placeholder="Room ID"]
  await page.locator('[placeholder="Room ID"]').fill("test");
  // Click text=Create
  await page.locator("text=Create").click();
  await expect(page).toHaveURL("http://localhost:4500/test");
  // Click and fill name.
  await page.locator('[placeholder="Name"]').click();
  await page.locator('[placeholder="Name"]').fill("test");
  // Wait for and click the password toggle.
  await page.locator(".password-toggle");
  await page.locator(".password-toggle").click();
  // Click and fill password.
  await page.locator('[placeholder="Password"]').click();
  await page.locator('[placeholder="Password"]').fill("test");
  // Selector device selector dropdown and device.
  await page.locator(".css-1qfu80a-ValueContainer2").click();
  await page.locator(".css-1qfu80a-ValueContainer2").click();
  // Click text=Join
  await page.locator("text=Join").click();
  // Click button >> nth=0
  await page.locator("button").first().click();
  // Click text=Close
  await page.locator("text=Close").click();
  // Click text=Leave
  await page.locator("text=Leave").click();
  await expect(page).toHaveURL("http://localhost:4500/test");
  // Click text=Back
  await page.locator("text=Back").click();
  await expect(page).toHaveURL("http://localhost:4500/");
});
