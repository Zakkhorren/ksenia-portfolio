import { expect, test } from '@playwright/test';
import logos from '../src/data/logofolio.json' with { type: 'json' };
import sharp from 'sharp';

for (const width of [390, 768, 1024, 1440]) {
  test(`Vorotila project at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(process.env.LOGOFOLIO_URL || 'work/logofolio/');
    const card = page.locator('.logo-project').first();
    await expect(card).toHaveAttribute('data-logo', 'vorotila-pro');
    await expect(page.locator('.logo-project')).toHaveCount(logos.length);
    for (const art of await page.locator('.logo-artwork .logo-art').all()) {
      const box = await art.boundingBox();
      expect(box!.width).toBeGreaterThan(40);
      expect(box!.height).toBeGreaterThan(15);
      const space = await art.evaluate(el => {
        const r = el.getBoundingClientRect(), p = el.parentElement!.getBoundingClientRect();
        return { left: r.left - p.left, right: p.right - r.right, top: r.top - p.top, bottom: p.bottom - r.bottom };
      });
      expect(Math.abs(space.left - space.right)).toBeLessThan(1);
      expect(space.left).toBeGreaterThanOrEqual(0);
      expect(space.top).toBeGreaterThanOrEqual(-1);
      expect(space.bottom).toBeGreaterThanOrEqual(-1);
    }
    await expect(card.locator('.logo-caption-title')).toHaveText('ВОРОТИЛА ПРО / 2026');
    await expect(card.locator('.logo-caption-context')).toHaveText('Продажа и монтаж секционных ворот под ключ');
    await expect(card.locator('.logo-cue')).toHaveText('СМОТРЕТЬ →');
    await page.mouse.move(0, 0);
    const colors = [];
    for (const id of ['vorotila-pro', 'perm']) {
      const art = page.locator(`[data-logo="${id}"] .logo-monochrome`);
      const style = await art.evaluate(el => {
        const s = getComputedStyle(el);
        return { filter: s.filter, opacity: s.opacity, mask: s.maskImage, fill: s.fill };
      });
      expect(style.filter).toContain('#logo-cream');
      expect(style.opacity).toBe('1');
      expect(style.mask).toBe('none');
      const { data, info } = await sharp(await art.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const histogram = new Map<string, number>();
      for (let i = 0; i < data.length; i += info.channels) {
        const rgb = [...data.subarray(i, i + 3)].join(',');
        if (data[i] > 100) histogram.set(rgb, (histogram.get(rgb) || 0) + 1);
      }
      const dominant = [...histogram.entries()].sort((a, b) => b[1] - a[1])[0][0];
      expect(dominant).toBe('236,232,223');
      colors.push(style);
    }
    expect(colors[0]).toEqual(colors[1]);
    await expect(page.locator('.logo-project')).toHaveCount(logos.length);
    expect(await page.locator('.logo-project').evaluateAll(items => items.map(el => el.getAttribute('data-logo')))).toEqual(logos.map(p => p.id));
    if (width > 600) {
      for (const row of await page.locator('.logo-row').all()) {
        await expect(row.locator('.logo-project')).toHaveCount(2);
        const geometry = await row.evaluate(el => {
          const cards = [...el.children].map(c => c.getBoundingClientRect());
          const r = el.getBoundingClientRect();
          return { left: cards[0].left - r.left, right: r.right - cards[1].right, firstTop: cards[0].top, secondTop: cards[1].top, widthDifference: cards[0].width - cards[1].width,
            tracks: ['.logo-artwork', '.logo-caption-title', '.logo-caption-context', '.logo-cue'].map(selector => [...el.querySelectorAll(selector)].map(child => { const b = child.getBoundingClientRect(); return selector === '.logo-artwork' ? b.bottom : b.top; })) };
        });
        expect(Math.abs(geometry.left)).toBeLessThan(1);
        expect(Math.abs(geometry.right)).toBeLessThan(1);
        expect(geometry.firstTop).toBe(geometry.secondTop);
        expect(Math.abs(geometry.widthDifference)).toBeLessThan(1);
        for (const track of geometry.tracks) expect(Math.abs(track[0] - track[1])).toBeLessThan(1);
      }
    }
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
    await page.locator('.logo-field').screenshot({ path: `test-results/logofolio-gallery-${width}.png` });
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
    for (const project of logos) {
      const trigger = page.locator(`[data-logo="${project.id}"]`);
      await trigger.click();
      await expect(page.locator('#logo-detail-title')).toHaveText(`${project.name} / ${project.year}`);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  });
}
