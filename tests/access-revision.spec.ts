import { test, expect } from "@playwright/test";
for (const width of [390, 768, 1440])
  test(`case navigation, subtitles and years at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("");
    await expect(page.locator(".project-year")).toHaveText([
      "2025",
      "2025",
      "2026",
    ]);
    for (const slug of ["expresso", "fashion-lab", "riviera"]) {
      await page.goto(`projects/${slug}/`);
      await expect(page.locator(".case-nav a")).toHaveText([
        "EXPRESSO",
        "FASHION LAB",
        "RIVIERA",
      ]);
      await expect(
        page.locator('.case-nav [aria-current="page"]'),
      ).toHaveAttribute("href", `/ksenia-portfolio/projects/${slug}/`);
      await page.evaluate(() => document.fonts.ready);
      if (width >= 768)
        expect(
          await page
            .locator(".page-description")
            .evaluate(
              (n) =>
                n.getBoundingClientRect().height /
                parseFloat(getComputedStyle(n).lineHeight),
            ),
        ).toBeLessThan(1.1);
      await page.locator(".case-nav a").first().click();
      await expect(page).toHaveURL(/projects\/expresso\/$/);
    }
  });
test("every UI link to unavailable collections opens notice without navigation", async ({
  page,
  context,
}) => {
  for (const route of [
    "",
    "work/logofolio/",
    "work/marketplace/",
    "work/packaging/",
    "work/layout/",
    "work/experiments/",
    "projects/expresso/",
    "projects/fashion-lab/",
    "projects/riviera/",
  ]) {
    await page.goto(route);
    await page.locator("h1").waitFor();
    const initial = page.url();
    const links = page.locator(
      'a[href*="/work/packaging/"],a[href*="/work/layout/"],a[href*="/work/experiments/"]',
    );
    for (let i = 0; i < (await links.count()); i++) {
      const link = links.nth(i);
      await link.click();
      await expect(page.locator(".unavailable-notice")).toBeVisible();
      await expect(page.locator("#unavailable-message")).toHaveText(
        "Временно не работает :(",
      );
      expect(page.url()).toBe(initial);
      await page.keyboard.press("Escape");
      await expect(page.locator(".unavailable-notice")).not.toBeVisible();
      await expect(link).toBeFocused();
    }
  }
  await page.goto("work/logofolio/");
  const blocked = page.locator('.collection-nav a[href$="/packaging/"]');
  for (const options of [
    { modifiers: ["Control"] as "Control"[] },
    { button: "middle" as const },
    { button: "right" as const },
  ]) {
    await blocked.click(options);
    await expect(page.locator(".unavailable-notice")).toBeVisible();
    await page.getByRole("button", { name: "Закрыть", exact: true }).click();
    expect(context.pages()).toHaveLength(1);
  }
  await blocked.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".unavailable-notice")).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(page.locator(".unavailable-notice")).not.toBeVisible();
  await page.locator('.collection-nav a[href$="/marketplace/"]').click();
  await expect(page).toHaveURL(/work\/marketplace\/$/);
  await page.locator('.collection-nav a[href$="/logofolio/"]').click();
  await expect(page).toHaveURL(/work\/logofolio\/$/);
});
