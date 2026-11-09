import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("catalogue sorting, pagination and resetting filters", async ({ page }) => {
  await page.goto("/integrations");
  await expect(page.getByRole("navigation", { name: "Results pagination" })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Exa", exact: true })).toBeVisible();
  await page.getByLabel("Sort connectors").selectOption("name-asc");
  await expect(page.getByRole("heading", { name: "Custom MCP", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Search connectors" }).fill("no matching vendor");
  await expect(page.getByRole("heading", { name: "No connectors found" })).toBeVisible();
  await page.getByRole("button", { name: "Reset search" }).click();
  await expect(page.getByRole("heading", { name: "GitHub", exact: true })).toBeVisible();
});
test("searchable documentation links to readable sections", async ({ page }) => {
  await page.goto("/docs");
  await page.getByRole("textbox", { name: "Search documentation" }).fill("permission");
  await page.getByRole("heading", { name: "Permission first, by design" }).click();
  await expect(page.getByRole("heading", { name: "Default deny", exact: true })).toBeVisible();
  await page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", { name: "Sensitive actions need exact approval" })
    .click();
  await expect(page).toHaveURL(/#section-2$/);
});
test("roadmap can show pending tasks without implying completion", async ({ page }) => {
  await page.goto("/roadmap");
  await page.getByRole("button", { name: "Show pending only" }).click();
  await expect(page.getByText("Sign-up, sign-in and sign-out UI", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("Apply schema and search fix through Lovable", { exact: true }),
  ).toBeVisible();
});
test("recovery without a valid link stays blocked", async ({ page }) => {
  await page.goto("/account/recovery");
  await expect(page.getByRole("button", { name: "Update password" })).toBeDisabled();
  await page.getByRole("link", { name: "Request another link" }).click();
  await expect(page.getByRole("heading", { name: "Let’s get you back in." })).toBeVisible();
});
for (const width of [360, 768, 1440]) {
  test(`new pages fit viewport ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/integrations",
      "/docs",
      "/docs/security",
      "/product",
      "/roadmap",
      "/account/forgot-password",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: /Use (dark|light) theme/ })).toBeEnabled();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        path,
      ).toBe(true);
    }
  });
}
for (const colorScheme of ["light", "dark"] as const) {
  test(`automated accessibility on new surfaces (${colorScheme})`, async ({ page }) => {
    test.setTimeout(120000);
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    for (const path of [
      "/",
      "/integrations",
      "/docs",
      "/docs/security",
      "/product",
      "/roadmap",
      "/account/forgot-password",
      "/account/recovery",
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole("button", {
          name: colorScheme === "dark" ? "Use light theme" : "Use dark theme",
        }),
      ).toBeEnabled();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        path,
      ).toEqual([]);
    }
  });
}
