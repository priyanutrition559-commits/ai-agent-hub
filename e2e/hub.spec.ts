import { test, expect } from "@playwright/test";

test("directory searches, filters and links to honest connector details", async ({ page }) => {
  await page.goto("/integrations");
  await page.getByRole("textbox", { name: "Search connectors" }).fill("github");
  await expect(page.getByRole("heading", { name: "GitHub", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Notion", exact: true })).toHaveCount(0);
  await page.getByRole("heading", { name: "GitHub", exact: true }).click();
  await expect(page.getByText("Never — not connected")).toBeVisible();
  await expect(page.getByRole("button", { name: /Configure permissions/ })).toBeDisabled();
});
test("custom server blocks loopback before making a server request", async ({ page }) => {
  await page.goto("/integrations/new");
  await page.getByLabel("Server name").fill("Unsafe server");
  await page.getByLabel("Endpoint URL").fill("https://127.0.0.1/mcp");
  await page.getByRole("button", { name: "Validate configuration" }).click();
  await expect(page.getByRole("status")).toContainText("public DNS hostname");
});
test("agent builder has mandatory approval and cannot run unconfigured tools", async ({ page }) => {
  await page.goto("/agents");
  await expect(page.getByRole("checkbox")).toBeChecked();
  await expect(page.getByRole("button", { name: /Test run/ })).toBeDisabled();
  await expect(page.getByText(/None discovered/)).toBeVisible();
});
test("approval queue exposes no fabricated records", async ({ page }) => {
  await page.goto("/admin/integrations");
  await expect(page.getByRole("heading", { name: "Approval queue" })).toBeVisible();
  await expect(page.getByText(/No records are fabricated/).first()).toBeVisible();
});
test("mobile navigation and reduced motion remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Integrations", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Connect your universe." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
