import { test, expect } from '@playwright/test';

for (const width of [1440, 768, 390]) {
  test(`Ulyana business card preserves artwork and viewer state at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('work/layout/#business-cards');

    expect(await page.locator('.print-business .print-item').evaluateAll(ns => ns.map(n => n.getAttribute('data-project'))))
      .toEqual(['ulyana-cards', 'expresso-cards', 'fashion-cards']);
    const trigger = page.locator('[data-project="ulyana-cards"] button');
    await trigger.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => scrollY);
    for (const id of ['ulyana-cards', 'expresso-cards', 'fashion-cards', 'ulyana-cards']) {
      await page.locator(`[data-project="${id}"] button`).click();
      const dialog = page.locator('.print-lightbox');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('img')).toHaveCount(2);
      await dialog.locator('img').evaluateAll((ns: HTMLImageElement[]) => Promise.all(ns.map(n => n.decode())));
      if (id === 'ulyana-cards') {
        expect(await dialog.locator('img').evaluateAll((ns: HTMLImageElement[]) => ns.map(n => ({src: decodeURI(n.src), width:n.naturalWidth, height:n.naturalHeight}))))
          .toEqual([1,2].map(i => ({src: expect.stringContaining(`визитка для портфолио.pdf/0${i}.webp`), width:2700, height:1500})));
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
    await trigger.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await trigger.click();
    await page.getByRole('button', {name:'Закрыть просмотр'}).click();
    await expect(trigger).toBeFocused();
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(errors).toEqual([]);
    expect(scroll).toBeGreaterThanOrEqual(0);
  });
}


