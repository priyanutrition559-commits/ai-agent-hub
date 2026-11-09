import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("supplied brand, favicon and control-panel destination are real", async ({
  page,
  request,
}) => {
  await page.goto("/product");
  await expect(page).toHaveTitle(/Stack Atlas by Guidesoft/);
  await expect(
    page
      .getByRole("navigation", { name: "Marketing navigation" })
      .getByRole("link", { name: "Stack Atlas by Guidesoft", exact: true }),
  ).toBeVisible();
  const logo = page.locator('header img[src="/brand/guidesoft-mark.png"]');
  await expect(logo).toBeVisible();
  expect(
    await logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
  ).toBe(true);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.ico");
  const icon = await request.get("/favicon.ico");
  expect(icon.ok()).toBe(true);
  expect([...(await icon.body()).subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  await page.getByRole("link", { name: "Open Ecosystem Control Panel", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Ecosystem Control Panel", { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Integrations", exact: true }),
  ).toBeVisible();
});
test("desktop hero tilts and resets without a WebGL renderer", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/product");
  const scene = page.getByTestId("ecosystem-scene");
  await expect(scene).toHaveAttribute("data-renderer", "svg");
  await expect(scene).toHaveAttribute("data-interactive", "true");
  const box = await scene.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.85, box!.y + box!.height * 0.3);
  await expect
    .poll(() => scene.locator("div.relative").evaluate((el) => getComputedStyle(el).transform))
    .not.toBe("none");
  await expect(page.locator("canvas")).toHaveCount(0);
});
test("mobile and reduced-motion retain the static SVG", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/product");
  await expect(page.getByTestId("ecosystem-scene")).toHaveAttribute("data-interactive", "false");
  await expect(page.getByRole("img", { name: /A connected technology ecosystem/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 2560, height: 1440 });
  await expect(page.getByTestId("ecosystem-scene")).toHaveAttribute("data-interactive", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("mobile drawer traps focus, closes and restores its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/product");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Explore Stack Atlas" });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("link", { name: "Open control panel", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
test("architecture tabs remain keyboard accessible", async ({ page }) => {
  await page.goto("/product");
  const first = page.getByRole("tab", { name: "Discover", exact: true });
  await first.click();
  await first.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Design", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Give your agent a purpose. Then boundaries." }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Protect", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A deliberate boundary around execution." }),
  ).toBeVisible();
});
for (const colorScheme of ["light", "dark"] as const) {
  test(`marketing accessibility (${colorScheme})`, async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/product");
    await expect(
      page.getByRole("button", {
        name: colorScheme === "dark" ? "Use light theme" : "Use dark theme",
      }),
    ).toBeEnabled();
    for (const label of ["Discover", "Design", "Protect"]) {
      await page.getByRole("tab", { name: label, exact: true }).click();
      await expect(page.getByRole("tabpanel")).toHaveCount(1);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    }
  });
}

test("low-resource desktop and no-JavaScript rendering keep the complete SVG", async ({
  browser,
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
  });
  await page.goto("/product");
  await expect(page.getByRole("button", { name: /Use (dark|light) theme/ })).toBeEnabled();
  await expect(page.getByTestId("ecosystem-scene")).toHaveAttribute("data-interactive", "false");
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("http://127.0.0.1:5173/product");
    await expect(
      staticPage.getByRole("img", { name: /A connected technology ecosystem/ }),
    ).toBeVisible();
    await expect(
      staticPage.getByRole("link", { name: "Open Ecosystem Control Panel", exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
