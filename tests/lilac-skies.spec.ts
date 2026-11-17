import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import series from '../src/data/lilac-skies.json' with { type: 'json' };

for (const width of [1440, 768, 390]) test(`Lilac Skies series and preserved marketplace at ${width}px`, async ({ page }) => {
  await mkdir('.qa/lilac/checks', { recursive: true });
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1100 });
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  page.on('request', r => requests.push(r.url()));
  await page.goto('work/marketplace/'); await page.evaluate(() => document.fonts.ready);
  const grid = page.locator('.marketplace-catalog');
  expect(await grid.locator(':scope > *').evaluateAll(nodes => nodes.map(n => {
    if (n.classList.contains('product-listing')) return n.getAttribute('data-project') || 'magnesium';
    if (n.classList.contains('market-rich-placeholder')) return 'rich';
    return n.querySelector('img')!.src.split('/').pop()!.replace('.webp', '');
  }))).toEqual(['magnesium', 'lilac-skies', 'asset-01', 'asset-05', 'rich', 'asset-02', 'asset-06', 'asset-03', 'asset-07', 'asset-04', 'asset-08', 'asset-05', 'asset-01']);
  const card = page.locator('[data-project="lilac-skies"]');
  await expect(card.locator('.product-name')).toHaveText('Real Techniques — Lilac Skies');
  await expect(card.locator('.view-cards')).toHaveText('СМОТРЕТЬ КАРТОЧКИ →');
  await card.locator('img').evaluate((n: HTMLImageElement) => n.decode());
  expect(await card.locator('img').evaluate(n => getComputedStyle(n).objectFit)).toBe('contain');
  const geometry = await grid.locator('.product-listing').evaluateAll(nodes => nodes.map(n => n.querySelector('img')!.getBoundingClientRect().toJSON()));
  expect(Math.abs(geometry[0].height - geometry[1].height)).toBeLessThan(1);
  if (width > 390) { expect(geometry[0].y).toBe(geometry[1].y); expect(geometry[1].x).toBeGreaterThan(geometry[0].x); }
  const names = await grid.locator('.product-name').evaluateAll(nodes => nodes.map(n => { const c = getComputedStyle(n); return { font:c.fontFamily, size:c.fontSize, color:c.color }; }));
  expect(names[1]).toEqual(names[0]);
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `.qa/lilac/checks/grid-${width}.png` });
  expect(requests.filter(u => /lilac-skies\/0[1-5]\.webp/.test(u))).toEqual([]);
  const open = card.locator('.view-cards'); await open.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY); await open.click();
  const dialog = page.locator('dialog.viewer[open]'); await expect(dialog).toBeVisible();
  await expect(page.locator('.viewer-thumbs button')).toHaveCount(5);
  await expect(page.locator('#viewer-title')).toHaveText('Real Techniques — Lilac Skies');
  for (let i = 0; i < 5; i++) {
    await expect(page.locator('.viewer-count')).toHaveText(`${String(i + 1).padStart(2,'0')} / 05`);
    await expect(page.locator('.viewer-main-image')).toHaveAttribute('src', new RegExp(`lilac-skies/0${i+1}\\.webp$`));
    await page.locator('.viewer-main-image').evaluate((n: HTMLImageElement) => n.decode());
    expect(await page.locator('.viewer-main-image').evaluate((n: HTMLImageElement) => {
      const r=n.getBoundingClientRect(),s=getComputedStyle(n); return n.naturalWidth/n.naturalHeight===.75 && s.objectFit==='contain' && n.dataset.crop==='false' && r.width>0 && r.height>0;
    })).toBe(true);
    await page.screenshot({ path: `.qa/lilac/checks/view-${width}-${i+1}.png` });
    if(i<4) await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('.viewer-next')).toBeDisabled();
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('.viewer-count')).toHaveText('04 / 05');
  await page.locator('.viewer-previous').click(); await expect(page.locator('.viewer-count')).toHaveText('03 / 05');
  await page.locator('.viewer-thumbs button').first().click(); await expect(page.locator('.viewer-count')).toHaveText('01 / 05');
  await expect.poll(() => requests.some(u => /lilac-skies\/02\.webp$/.test(u))).toBe(true);
  await page.keyboard.press('Escape'); await expect(page.locator('dialog[open]')).toHaveCount(0); await expect(open).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(2);
  await card.locator('.product-open').click(); await expect(page.locator('.viewer-count')).toHaveText('01 / 05');
  await page.locator('.viewer-next').click(); await expect(page.locator('.viewer-count')).toHaveText('02 / 05');
  await page.getByRole('button',{name:'Закрыть просмотр',exact:true}).click(); await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.getByRole('button',{name:'Открыть: Магний цитрат + витамин B6',exact:true}).click();
  await expect(page.locator('.viewer-count')).toHaveText('01 / 03'); await expect(page.locator('.viewer-main-image')).toHaveAttribute('src',/asset-09.webp$/);
  await page.keyboard.press('ArrowRight'); await expect(page.locator('.viewer-count')).toHaveText('02 / 03');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

test('Lilac Skies originals and delivery copies preserve artwork quality', async () => {
  for(const image of series.images){
    const original=await readFile(`source-assets/marketplace/lilac-skies/${image.original}`);
    expect(createHash('sha256').update(original).digest('hex')).toBe(image.sha256);
    const expected=await sharp(original).resize({height:3200,withoutEnlargement:true}).removeAlpha().raw().toBuffer();
    const delivered=await sharp(`public${image.src}`).removeAlpha().raw().toBuffer();
    expect(delivered.length).toBe(expected.length);
    let absolute = 0, squares = 0;
    for (let i=0;i<delivered.length;i++) { const difference=delivered[i]-expected[i]; absolute+=Math.abs(difference); squares+=difference*difference; }
    expect(absolute/delivered.length).toBeLessThan(1.5);
    expect(Math.sqrt(squares/delivered.length)).toBeLessThan(2.5);
  }
});
