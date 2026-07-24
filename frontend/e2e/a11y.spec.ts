// import { test, expect } from "@playwright/test";
// import AxeBuilder from "@axe-core/playwright";

// const pagesToScan = [
//   "/dashboard",
// ];

// for (const path of pagesToScan) {
//   test(`Accessibility scan ${path}`, async ({ page }) => {
//     await page.goto(path);

//     // Wait until Next.js finishes rendering the client page
//     await page.waitForLoadState("networkidle");

//     // Confirm dashboard content is visible before scanning
//     await expect(
//       page.getByRole("heading", { name: "Dashboard" })
//     ).toBeVisible();

//     const results = await new AxeBuilder({ page }).analyze();

//     expect(results.violations).toEqual([]);
//   });
// }

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pagesToScan = [
  "/dashboard"
];

// TODO: Enable after adding an authenticated Playwright test user
test.describe.skip("Accessibility scans (requires authentication)", () => {
  for (const path of pagesToScan) {
    test(`Accessibility scan ${path}`, async ({ page }) => {
      await page.goto(path);

      const results = await new AxeBuilder({ page }).analyze();

      expect(results.violations).toEqual([]);
    });
  }
});