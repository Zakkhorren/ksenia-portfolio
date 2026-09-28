import { test, expect } from "@playwright/test";
for (const width of [320, 390, 768, 1440])
  test(`print access and composition at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("");
    await expect(page.locator("a.featured-card h2")).toHaveText([
      "EXPRESSO",
      "FASHION LAB",
      "RIVIERA",
    ]);
    const note = page.locator(".other-note");
    await note.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    if (width <= 600) {
      const gap = await note.evaluate(
        (n) =>
          n.getBoundingClientRect().top -
          document.getElementById("other-title")!.getBoundingClientRect()
            .bottom,
      );
      expect(gap).toBeGreaterThan(-10);
      expect(gap).toBeLessThan(35);
    }
    expect(
      await page
        .locator(".placeholder-light")
        .first()
        .evaluate((n) => getComputedStyle(n, "::after").backgroundImage),
    ).toContain("0.08");
    await page.locator(".category-row.layout").click();
    await expect(page).toHaveURL(/work\/layout\/$/);
    await expect(page.locator("h1")).toHaveText("ПОЛИГРАФИЯ");
    await expect(page.locator(".unavailable-notice")).not.toBeVisible();
    await expect(page.locator(".print-section")).toHaveCount(4);
    await expect(page.locator(".print-section h2")).toHaveText([
      "ВИЗИТКИ",
      "АФИШИ И НАРУЖНАЯ РЕКЛАМА",
      "ПЕЧАТНЫЕ МАТЕРИАЛЫ",
      "МНОГОСТРАНИЧКА",
    ]);
    await expect(page.locator(".print-placeholder")).toHaveCount(13);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    for (const section of await page.locator(".print-section").all()) {
      const boxes = await section.locator(".print-slot").evaluateAll((ns) =>
        ns.map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
        }),
      );
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i],
            b = boxes[j];
          expect(
            a.right <= b.x + 1 ||
              b.right <= a.x + 1 ||
              a.bottom <= b.y + 1 ||
              b.bottom <= a.y + 1,
          ).toBe(true);
        }
    }
    for (const route of ["work/logofolio/", "work/marketplace/"]) {
      await page.goto(route);
      await page.locator('.collection-nav a[href$="/layout/"]').click();
      await expect(page.locator(".print-page")).toBeVisible();
    }
  });
