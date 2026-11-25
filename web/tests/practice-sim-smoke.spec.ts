import { expect, test } from "@playwright/test";

/**
 * Browser smoke: each SharePoint-derived interactive problem still mounts
 * and exposes a check action under a fixed variant seed.
 */
const SEED = "002c2020-fefe-4fed-98ab-12345678abcd";

const SIMULATIONS = [
  { slug: "cantilever-beam-point-load-at-the-free-end", name: "Cantilever free end" },
  { slug: "cantilever-beam-point-load-at-any-point", name: "Cantilever any point" },
  { slug: "cantilever-beam-uniform-load", name: "Cantilever uniform" },
  { slug: "simply-supported-beam-point-load", name: "Simply supported point" },
  { slug: "simply-supported-beam-two-equal-point-loads", name: "Simply supported two loads" },
  { slug: "simply-supported-beam-uniform-load", name: "Simply supported uniform" },
  { slug: "ball-on-an-incline", name: "Ball on incline" },
  { slug: "weight-hanging-from-cables", name: "Weight hanging" },
  { slug: "weight-on-a-pulley", name: "Weight on pulley" },
] as const;

for (const sim of SIMULATIONS) {
  test(`simulation smoke: ${sim.name}`, async ({ page }) => {
    await page.goto(`/practice/${sim.slug}?variant=${SEED}`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Native sims render a Check control; beam workspace keeps #btnCheck.
    const check = page
      .locator("#btnCheck, button:has-text('Check answers'), button:has-text('Check')")
      .first();
    await expect(check).toBeVisible({ timeout: 20_000 });
    await check.click();
    // After a check, the page should still be interactive (no crash) and keep the control.
    await expect(check).toBeVisible();
  });
}
