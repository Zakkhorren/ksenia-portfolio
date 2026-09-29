import { test, expect } from "@playwright/test";
for (const width of [390, 768, 1440])
  test(`Print correction: equal previews, visible works and editorial composition at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("work/layout/");
    await page.evaluate(() => document.fonts.ready);
    for (const section of ["business", "posters"]) {
      const images = page.locator(`.print-${section} .print-item-images`);
      const rects = await images.evaluateAll((ns) =>
        ns.map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom };
        }),
      );
      for (const rect of rects) {
        expect(Math.abs(rect.w - rects[0].w)).toBeLessThan(1);
        expect(Math.abs(rect.h - rects[0].h)).toBeLessThan(1);
      }
      if (width > 900) {
        for (const r of rects) {
          expect(r.y).toBe(rects[0].y);
          expect(Math.abs(r.bottom - rects[0].bottom)).toBeLessThan(0.5);
        }
        const captions = await page
          .locator(`.print-${section} figcaption`)
          .evaluateAll((ns) => ns.map((n) => n.getBoundingClientRect().top));
        expect(Math.max(...captions) - Math.min(...captions)).toBeLessThan(0.5);
      }
      expect(
        await images
          .locator("img")
          .evaluateAll((ns) =>
            ns.every((n) => getComputedStyle(n).objectFit === "contain"),
          ),
      ).toBe(true);
    }
    await expect(page.locator(".print-materials .print-item")).toHaveCount(1);
    await expect(page.locator(".print-materials figcaption")).toContainText(
      "Береги природу / Открытки",
    );
    for (const label of [
      "Лифлет / 01",
      "Лифлет / 02",
      "Сертификат",
      "Грамоты",
      "Листовка",
    ])
      await expect(
        page.locator(".print-materials").getByText(label, { exact: true }),
      ).toHaveCount(0);
    await page.locator("[data-project=postcards] button").click();
    await expect(page.locator(".print-lightbox img")).toHaveCount(6);
    await expect(page.locator(".print-lightbox figcaption")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator(".print-secondary figcaption")).toHaveText([
      "Роснефть / Газетная полосаСМОТРЕТЬ ↗",
      "Газетная полосаСМОТРЕТЬ ↗",
      "Разворот / 01СМОТРЕТЬ ↗",
      "Разворот / 02СМОТРЕТЬ ↗",
      "Разворот / 03СМОТРЕТЬ ↗",
    ]);
    await expect(page.locator("[data-project=spread-1]")).toHaveAttribute(
      "data-source",
      "7. Рандомный блок разворотом.pdf",
    );
    await expect(page.locator("[data-project=spread-2]")).toHaveAttribute(
      "data-source",
      "5. Рандомный блок разворотом.pdf",
    );
    await expect(page.locator("[data-project=spread-3]")).toHaveAttribute(
      "data-source",
      "6. Рандомный блок разворотом.pdf",
    );
    const boxes = await page
      .locator(".print-secondary .print-item-images")
      .evaluateAll((ns) =>
        ns.map((n) => {
          const r = n.getBoundingClientRect();
          return {
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
            right: r.right,
            bottom: r.bottom,
          };
        }),
      );
    if (width > 650) {
      expect(boxes[0].y).toBe(boxes[1].y);
      expect(boxes[1].y).toBe(boxes[2].y);
      expect(Math.abs(boxes[0].h - boxes[1].h)).toBeLessThan(1);
      expect(Math.abs(boxes[0].h - boxes[2].h)).toBeLessThan(1);
      expect(boxes[1].x - boxes[0].right).toBeLessThanOrEqual(28);
      expect(boxes[2].x - boxes[1].right).toBeLessThanOrEqual(28);
      expect(boxes[2].w).toBeGreaterThan(boxes[0].w * 2);
      expect(boxes[3].y).toBe(boxes[4].y);
      expect(boxes[3].y).toBeGreaterThan(boxes[2].bottom);
      expect(Math.abs(boxes[3].w - boxes[4].w)).toBeLessThan(1);
    } else
      for (let i = 1; i < boxes.length; i++)
        expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].bottom);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
