import { test, expect } from '@playwright/test';
import { mkdir, readFile, readdir } from 'node:fs/promises';

for (const width of [1440, 768, 390]) {
  test(`wedding demo: layout, local questionnaire and network isolation at ${width}`, async ({ page, context }) => {
    test.setTimeout(90_000);
    await mkdir('.qa/wedding/checks', { recursive: true });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1200 });
    const errors: string[] = [], forbidden: string[] = [], requests: string[] = [];
    const base = new URL(test.info().project.use.baseURL as string);
    const demoPath = `${base.pathname}demo/wedding/`;
    await page.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin !== base.origin || !url.pathname.startsWith(demoPath) || request.method() !== 'GET') {
        forbidden.push(`${request.method()} ${url.origin}${url.pathname}`);
        await route.abort();
      } else { requests.push(url.pathname); await route.continue(); }
    });
    await page.addInitScript(() => {
      const audit = { writes: [] as string[], connections: [] as string[], violations: [] as string[] };
      (window as any).__demoAudit = audit;
      for (const method of ['setItem', 'removeItem', 'clear'] as const) {
        Storage.prototype[method] = function () { audit.writes.push(method); throw new Error('Unexpected persistent storage write'); };
      }
      Object.defineProperty(document, 'cookie', { configurable: true, get: () => '', set: () => { audit.writes.push('cookie'); } });
      window.fetch = (() => { audit.connections.push('fetch'); throw new Error('Unexpected fetch'); }) as unknown as typeof fetch;
      XMLHttpRequest.prototype.open = function () { audit.connections.push('xhr'); throw new Error('Unexpected XHR'); };
      navigator.sendBeacon = () => { audit.connections.push('beacon'); return false; };
      for (const name of ['WebSocket', 'EventSource', 'Worker'] as const) (window as any)[name] = class { constructor() { audit.connections.push(name); throw new Error('Unexpected connection'); } };
      document.addEventListener('securitypolicyviolation', e => audit.violations.push(e.violatedDirective));
    });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto('demo/wedding/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#hero-couple-photo').evaluate((n: HTMLImageElement) => n.decode());
    await expect(page.locator('.demo-banner')).toContainText('Демоверсия проекта · Все данные вымышлены');
    await expect(page.locator('#hero-date-script')).toHaveText(/Анна.*Михаил.*15.02.2030/);
    await expect(page.locator('#date-callout')).toHaveText('15 февраля 2030 года');
    await expect(page.locator('#date-meta')).toHaveText('пятница, 16:00');
    await expect(page.locator('.cal-day.chosen')).toHaveText('15');
    await expect(page.locator('#venue-address')).toHaveText('Адрес площадки появится здесь');
    await expect(page.locator('.demo-contact-note')).toHaveText('Контакты скрыты в демоверсии');
    expect(await page.locator('.snow').count()).toBe(2);
    expect(await page.locator('.ticker-track').evaluate(n => getComputedStyle(n).animationName)).toBe('marquee');
    expect(await page.locator('#hero-couple-photo').evaluate((n: HTMLImageElement) => {
      const r = n.getBoundingClientRect(), s = getComputedStyle(n);
      return n.naturalWidth === n.naturalHeight && Math.abs(r.width - r.height) < 1 && s.objectFit === 'contain' && s.backgroundColor === 'rgba(0, 0, 0, 0)' && r.x >= 0 && r.right <= innerWidth;
    })).toBe(true);
    const image = await page.locator('#hero-couple-photo').boundingBox(), title = await page.locator('.hero-title').boundingBox();
    expect(image!.y).toBeGreaterThan(title!.y + title!.height);
    await page.waitForTimeout(1050);
    await page.screenshot({ path: `.qa/wedding/checks/hero-${width}.png` });
    for (const selector of ['.intro-section', '.timeline-section', '.venue-section', '.dress-section', '.wishes-section']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1050);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `.qa/wedding/checks/${selector.slice(1)}-${width}.png` });
    }
    await page.locator('.envelope').evaluate((n: HTMLImageElement) => n.decode());
    expect(await page.locator('.envelope').evaluate((n: HTMLImageElement) => n.naturalWidth)).toBeGreaterThan(0);
    expect(await page.locator('#timeline-ink').evaluate((n: SVGPathElement) => n.getTotalLength())).toBeGreaterThan(100);
    await page.locator('#rsvp-form').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1100);
    const form = page.locator('#rsvp-form'), submit = page.getByRole('button', { name: 'Проверить анкету', exact: true });
    await submit.click(); await expect(page.locator('#form-error')).toBeVisible();
    await page.locator('[name="name"]').fill('Тестовый гость');
    await page.locator('[name="consent"]').check();
    await submit.click(); await expect(page.locator('#form-error')).toBeVisible();
    await page.locator('[name="attending"]').first().check();
    await expect(page.locator('#parking-fields')).toBeVisible();
    await expect(page.locator('[name="drinks"]').first()).toBeVisible();
    await page.locator('#guest-plus').click();
    await expect(page.locator('#guest-count')).toHaveValue('2');
    await expect(page.locator('#additional-guests-field')).toBeVisible();
    await submit.click(); await expect(page.locator('#form-error')).toBeVisible();
    await page.locator('[name="additionalGuests"]').fill('Второй гость');
    for (const invalid of ['', '0', '1.5']) {
      await page.locator('#guest-count').fill(invalid); await submit.click(); await expect(page.locator('#form-error')).toBeVisible();
    }
    await page.locator('#guest-count').fill('2');
    await page.locator('[name="additionalGuests"]').fill('Второй гость');
    await page.locator('[name="drinks"]').first().check();
    await page.locator('[name="otherDrink"]').fill('Вода');
    await page.locator('[name="message"]').fill('Демонстрационный ответ');
    await page.locator('[name="parking"][value="yes"]').check();
    await expect(page.locator('#parking-count')).toBeVisible();
    for (const invalid of ['', '0', '1.5']) {
      await page.locator('[name="carCount"]').fill(invalid); await submit.click(); await expect(page.locator('#form-error')).toBeVisible();
    }
    await page.locator('[name="carCount"]').fill('1');
    const before = requests.length, entryUrl = page.url();
    await submit.click(); await expect(page.locator('#rsvp-success')).toBeVisible();
    await expect(page.locator('#success-message')).toHaveText('В реальном приглашении здесь отправляется ответ. Это демоверсия — данные не отправлены.');
    await page.waitForTimeout(300);
    expect(requests.length).toBe(before); expect(page.url()).toBe(entryUrl);
    await page.screenshot({ path: `.qa/wedding/checks/success-${width}.png` });
    for (const answer of [1, 2]) {
      await page.getByRole('button', { name: 'Изменить ответ' }).click();
      await page.locator('[name="attending"]').nth(answer).check();
      await expect(page.locator('#attending-fields')).toBeHidden();
      await submit.click(); await expect(page.locator('#rsvp-success')).toBeVisible();
    }
    for (const parking of ['no', 'unknown']) {
      await page.getByRole('button', { name: 'Изменить ответ' }).click();
      await page.locator('[name="attending"]').first().check();
      await page.locator(`[name="parking"][value="${parking}"]`).check();
      await expect(page.locator('#parking-count')).toBeHidden();
      await submit.click(); await expect(page.locator('#rsvp-success')).toBeVisible();
    }
    expect(await page.evaluate(() => (window as any).__demoAudit)).toEqual({ writes: [], connections: [], violations: [] });
    expect(await context.cookies()).toEqual([]);
    await page.reload();
    await expect(page.locator('[name="name"]')).toHaveValue('');
    await expect(page.locator('[name="message"]')).toHaveValue('');
    await expect(page.locator('[name="attending"]:checked')).toHaveCount(0);
    await expect(page.locator('[name="consent"]')).not.toBeChecked();
    await expect(page.locator('#guest-count')).toHaveValue('1');
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    await page.goto('demo/wedding/?demo=false&rsvp_preview=1&endpoint=https%3A%2F%2Fexample.invalid%2Fcollect&rsvp_id=demo-test&edit_key=demo-test#rsvp_id=demo-test');
    await page.locator('[name="name"]').fill('Тестовый гость');
    await page.locator('[name="attending"]').nth(1).check();
    await page.locator('[name="consent"]').check();
    await submit.click(); await expect(page.locator('#rsvp-success')).toBeVisible();
    expect(await page.evaluate(() => (window as any).__demoAudit)).toEqual({ writes: [], connections: [], violations: [] });
    expect(forbidden).toEqual([]); expect(errors).toEqual([]);
  });

  test(`wedding project: existing window, popup and return at ${width}`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1100 });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('work/experiments/');
    await page.getByRole('button', { name: 'Закрыть окно', exact: true }).click();
    await page.locator('.desk-objects').getByRole('button', { name: 'Сайты и приложения', exact: true }).click();
    const card = page.locator('.desk-project-card');
    await expect(card).toHaveCount(1); await expect(card).toContainText('Свадебное приглашение');
    await card.locator('img').evaluate((n: HTMLImageElement) => n.decode());
    await page.locator(".desk-window").evaluate(n => window.scrollBy(0, n.getBoundingClientRect().top - 90));
    await page.screenshot({ path: `.qa/wedding/checks/card-${width}.png` });
    await card.click();
    await expect(page.locator('.desk-project-detail h2')).toHaveText('Свадебное приглашение');
    await expect(page.locator('.desk-project-note')).toHaveText('Демонстрация с вымышленными данными');
    await page.locator('.desk-project-preview').evaluate((n: HTMLImageElement) => n.decode());
    await page.getByRole('button', { name: 'Свернуть окно', exact: true }).click();
    await page.locator('.desk-task').click(); await expect(page.locator('.desk-project-detail')).toBeVisible();
    await page.locator(".desk-window").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.qa/wedding/checks/project-${width}.png` });
    const popupPromise = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Открыть демоверсию' }).click();
    const demo = await popupPromise;
    await demo.waitForLoadState('load'); await expect(demo).toHaveURL(/\/demo\/wedding\/$/);
    await expect(demo.locator('.demo-banner')).toBeVisible();
    expect(await demo.evaluate(() => window.opener === null)).toBe(true);
    await demo.locator('.demo-banner a').click(); await expect(demo).toHaveURL(/\/work\/experiments\/$/);
    await expect(demo.locator('.experiment-desktop')).toBeVisible(); await demo.close();
    await page.getByRole('button', { name: 'Вернуться к проектам', exact: true }).click();
    await expect(card).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('demo ships only local assets and no integration capabilities', async () => {
  const root = 'dist/demo/wedding/';
  const html = await readFile(root + 'index.html', 'utf8'), js = await readFile(root + 'script.js', 'utf8');
  expect(html).toContain("connect-src 'none'"); expect(html).toContain("form-action 'none'");
  expect(html).not.toMatch(/<iframe|<form[^>]+action=|https:\/\/fonts\./i);
  expect(js).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|document\.cookie|URLSearchParams|location\.(search|hash)|import\s*\(/);
  expect(html + js).not.toMatch(/workers\.dev|api\.telegram|turnstile|rsvpEndpoint|venueMapUrl|rsvp_id|edit_key|couple\.png|venue\.jpg/);
  const assets = await readdir(root + 'assets');
  expect(assets.sort()).toEqual(['blue-envelope.png', 'childhood-composition.webp', 'fonts', 'heart.svg'].sort());
});
