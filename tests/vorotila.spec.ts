import { expect, test } from '@playwright/test';
import logos from '../src/data/logofolio.json' with { type: 'json' };

for (const width of [390, 768, 1440]) {
  test(`Vorotila project at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('work/logofolio/');
    const card = page.locator('.logo-project').first();
    await expect(card).toHaveAttribute('data-logo', 'vorotila-pro');
    await expect(page.locator('.logo-project')).toHaveCount(logos.length);
    await expect(card.locator('.logo-caption-title')).toHaveText('ВОРОТИЛА ПРО / 2026');
    await expect(card.locator('.logo-caption-context')).toHaveText('Продажа и монтаж секционных ворот под ключ');
    await expect(card.locator('.logo-cue')).toHaveText('СМОТРЕТЬ →');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const boxes = await page.locator('.logo-project').evaluateAll(items => items.map(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }));
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      expect(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1).toBe(true);
    }
    await page.screenshot({ path: `test-results/vorotila-grid-${width}.png`, fullPage: true });
    await card.click();
    const modal = page.locator('.logo-detail');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.logo-counter').first()).toHaveText(`01 / ${logos.length}`);
    await expect(modal.locator('.logo-primary img')).toHaveAttribute('src', /vorotila-pro\.svg$/);
    await expect(modal.locator('.logo-specimens img')).toHaveCount(1);
    await expect(modal.locator('.logo-specimens img')).toHaveAttribute('src', /vorotila-pro-icon\.svg$/);
    await modal.locator('img').evaluateAll(async images => { await Promise.all(images.map(i => (i as HTMLImageElement).decode())); });
    expect(await modal.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: `test-results/vorotila-modal-${width}.png` });
    await page.locator('.logo-next').click();
    await expect(page.locator('#logo-detail-title')).toContainText('PERM POKER CLUB');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#logo-detail-title')).toContainText('ВОРОТИЛА ПРО');
    await page.locator('.logo-prev').click();
    await expect(modal.locator('.logo-counter').first()).toHaveText(`${logos.length} / ${logos.length}`);
    await page.locator('.logo-next').click();
    await page.keyboard.press('Escape');
    await expect(card).toBeFocused();
    await card.click();
    await page.locator('.logo-detail-close').click();
    await expect(modal).toHaveCount(0);
  });
}
