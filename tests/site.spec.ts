import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import logos from "../src/data/logofolio.json" with { type: "json" };

const routes = [
  "",
  "work/logofolio/",
  "work/packaging/",
  "work/marketplace/",
  "work/layout/",
  "work/experiments/",
  "projects/riviera/",
  "projects/expresso/",
  "projects/fashion-lab/",
  "404.html",
];
for (const width of [390, 768, 1440]) {
  test(`all static routes and resources at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
      await page.locator("#contact").scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        // Explicitly load off-screen lazy images for this asset audit.
        for (const image of document.images) image.loading = "eager";
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => {})),
        );
      });
      expect(
        await page
          .locator("img")
          .evaluateAll((images) =>
            images
              .filter((i) => !(i as HTMLImageElement).naturalWidth)
              .map((i) => i.getAttribute("src")),
          ),
        route,
      ).toEqual([]);
      expect(
        await page
          .locator('a[href^="/"]')
          .evaluateAll((links) =>
            links
              .filter(
                (link) =>
                  !link.getAttribute("href")?.startsWith("/ksenia-portfolio/"),
              )
              .map((link) => link.getAttribute("href")),
          ),
      ).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("carousel navigation, client routing and history", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("");
  await expect(page.locator(".carousel-count")).toHaveText("01 / 07");
  await page.locator(".carousel-next").click();
  await expect(page.locator(".carousel-count")).toHaveText("02 / 07");
  await page.locator(".featured-viewport").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".carousel-count")).toHaveText("01 / 07");
  await page.locator(".carousel-prev").click();
  await expect(page.locator(".carousel-count")).toHaveText("07 / 07");
  await page.locator(".carousel-next").click();
  await page.evaluate(() => {
    (window as unknown as { navigationMarker: number }).navigationMarker = 1;
  });
  await page.locator('.project-slide[data-position="0"] a').click();
  await expect(page).toHaveURL(/projects\/fashion-lab\/$/);
  await expect(page.locator("h1")).toHaveText("FASHION LAB");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { navigationMarker: number }).navigationMarker,
    ),
  ).toBe(1);
  await page.goBack();
  await expect(page.locator(".carousel-count")).toHaveText("01 / 07");
  await page.locator('.site-nav a[href$="#about"]').click();
  await expect(page).toHaveURL(/#about$/);
  await expect
    .poll(() =>
      page
        .locator("#about")
        .evaluate((el) =>
          Math.abs(
            el.getBoundingClientRect().top -
              parseFloat(getComputedStyle(el).scrollMarginTop) -
              parseFloat(
                getComputedStyle(document.documentElement).scrollPaddingTop,
              ),
          ),
        ),
    )
    .toBeLessThan(5);
  expect(errors).toEqual([]);
});

test("marketplace gallery, keyboard, image cache and focus restoration", async ({
  page,
}) => {
  await page.goto("work/marketplace/");
  const open = page.locator(".product-open");
  await open.click();
  await expect(page.locator("dialog.viewer")).toBeVisible();
  await expect(page.locator(".viewer-main-image")).toHaveAttribute(
    "src",
    /asset-09.webp/,
  );
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".viewer-count")).toHaveText("02 / 03");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".viewer-count")).toHaveText("03 / 03");
  await expect(page.locator(".viewer-main-image")).toHaveAttribute(
    "src",
    /asset-11.webp/,
  );
  await expect(page.locator(".viewer-next")).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(open).toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/modal-open/);
  await open.click();
  await expect(page.locator(".viewer-main-image")).toHaveAttribute(
    "src",
    /asset-09.webp/,
  );
});

test("logo viewer preserves variants and changes projects", async ({
  page,
}) => {
  await page.goto("work/logofolio/");
  const open = page.locator(".logo-project").first();
  await open.click();
  await expect(page.locator(".logo-detail")).toBeVisible();
  await expect(page.locator("#logo-detail-title")).toContainText(
    "PERM POKER CLUB",
  );
  await expect(page.locator(".logo-detail-secondary img")).toHaveCount(3);
  await page.locator(".logo-next").click();
  await expect(page.locator("#logo-detail-title")).not.toContainText(
    "PERM POKER CLUB",
  );
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
});

test("reader opens, turns spreads and closes", async ({ page }) => {
  await page.goto("work/layout/");
  await page.locator(".magazine-open").click();
  await expect(page.locator(".publication-reader")).toBeVisible();
  await expect(page.locator(".reader-count")).toHaveText("01 / 08");
  await page.locator(".reader-next").click();
  await expect(page.locator(".reader-count")).toHaveText("02–03 / 08");
  await expect(page.locator(".reader-stage .paper-page")).toHaveCount(2);
  await page.locator(".reader-thumbs button").last().click();
  await expect(page.locator(".reader-count")).toHaveText("08 / 08");
  await expect(page.locator(".reader-next")).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.locator(".magazine-open")).toBeFocused();
});

test("original SVG hashes are unchanged", async () => {
  for (const project of logos)
    for (const asset of project.assets) {
      const bytes = await readFile(`public/assets/logofolio/${asset.file}`);
      expect(createHash("sha256").update(bytes).digest("hex"), asset.file).toBe(
        asset.sha256,
      );
    }
});

test("mobile gallery swipe and complete thumbnails", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("work/marketplace/");
  await page.locator(".product-open").click();
  await expect(page.locator(".viewer-main-image")).toBeVisible();
  await page.locator(".viewer-stage").evaluate((stage) => {
    for (const [type, x] of [
      ["touchstart", 300],
      ["touchend", 100],
    ] as const) {
      stage.dispatchEvent(
        new TouchEvent(type, {
          bubbles: true,
          changedTouches: [
            new Touch({
              identifier: 1,
              target: stage,
              clientX: x,
              clientY: 300,
            }),
          ],
        }),
      );
    }
  });
  await expect(page.locator(".viewer-count")).toHaveText("02 / 03");
  expect(
    await page
      .locator(".viewer-thumbs img")
      .evaluateAll((images) =>
        images.every(
          (image) => getComputedStyle(image).objectFit === "contain",
        ),
      ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/modal-open/);
});
