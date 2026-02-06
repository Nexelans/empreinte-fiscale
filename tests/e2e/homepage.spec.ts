import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display the homepage correctly", async ({ page }) => {
    await page.goto("/");

    // Check title
    await expect(page.locator("h1")).toContainText("Empreinte Fiscale");

    // Check description
    await expect(page.locator("text=Découvrez votre relation financière")).toBeVisible();

    // Check CTA buttons
    await expect(page.locator('a[href="/auth/register"]')).toBeVisible();
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible();

    // Check feature cards
    await expect(page.locator("text=Transparent")).toBeVisible();
    await expect(page.locator("text=Non-partisan")).toBeVisible();
    await expect(page.locator("text=Précis")).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should navigate to registration", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/auth/register"]');
    await expect(page).toHaveURL(/.*auth\/register/);
  });

  test("should have accessible navigation", async ({ page }) => {
    await page.goto("/");

    // Check for keyboard navigation
    await page.keyboard.press("Tab");
    const firstFocusable = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocusable).toBeTruthy();
  });
});

test.describe("Authentication Flow", () => {
  test("should display registration form", async ({ page }) => {
    await page.goto("/auth/register");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should display login form", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
