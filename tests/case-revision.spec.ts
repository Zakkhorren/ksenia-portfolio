import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import assets from "../src/data/case-assets.json" with { type: "json" };

test("seven mapped covers, four inert placeholders", async ({ page }) => {
  await page.goto("");
  const cards = page.locator(".project-slide");
  await expect(cards).toHaveCount(7);
  expect(
    await cards
      .locator("img")
      .evaluateAll((images) =>
        images.map((image) => image.getAttribute("src")),
      ),
  ).toEqual(
    assets.covers
      .slice(0, 3)
      .map((image) => `/ksenia-portfolio/assets/${image.file}`),
  );
  expect(
    await cards
      .locator("a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(
    ["fashion-lab", "riviera", "expresso"].map(
      (slug) => `/ksenia-portfolio/projects/${slug}/`,
    ),
  );
  await expect(page.locator(".project-placeholder")).toHaveCount(4);
  await expect(page.locator(".project-placeholder a")).toHaveCount(0);
  for (let i = 0; i < 3; i++) await page.locator(".carousel-next").click();
  await page.locator('.project-slide[data-position="0"]').click();
  await expect(page).toHaveURL(/ksenia-portfolio\/$/);
});

for (const width of [320, 390, 600, 768, 1024, 1440, 1920]) {
  test(`complete case images and fluid titles at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    for (const slug of ["fashion-lab", "riviera", "expresso"] as const) {
      await page.goto(`projects/${slug}/`);
      const images = page.locator(".case-presentation > img");
      await expect(images).toHaveCount(assets.projects[slug].length);
      expect(
        await images.evaluateAll((nodes) =>
          nodes.map((image) => image.getAttribute("src")),
        ),
      ).toEqual(
        assets.projects[slug].map(
          (image) => `/ksenia-portfolio/assets/${image.file}`,
        ),
      );
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      expect(
        await page
          .locator("h1")
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
      const geometry = await images.evaluateAll((nodes) =>
        nodes.map((node) => {
          const img = node as HTMLImageElement,
            box = img.getBoundingClientRect();
          return {
            top: box.top,
            bottom: box.bottom,
            ratio: box.width / box.height,
            intrinsicRatio:
              Number(img.getAttribute("width")) /
              Number(img.getAttribute("height")),
            fit: getComputedStyle(img).objectFit,
          };
        }),
      );
      geometry.forEach((box, i) => {
        expect(Math.abs(box.ratio - box.intrinsicRatio)).toBeLessThan(0.02);
        expect(box.fit).toBe("contain");
        if (i)
          expect(Math.abs(box.top - geometry[i - 1].bottom)).toBeLessThan(1);
      });
      await expect(
        page.locator(
          ".sample-note, .case-cover, .case-overview, .case-gallery",
        ),
      ).toHaveCount(0);
    }
    for (const slug of ["logofolio", "marketplace"]) {
      await page.goto(`work/${slug}/`);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page
          .locator("h1")
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
      expect(await page.locator(".page-note").innerText()).not.toMatch(/\.$/);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
  });
}

test("GIF originals, frame timing and infinite loops are preserved", async () => {
  for (const image of assets.projects.expresso.filter((image) =>
    image.file.endsWith(".gif"),
  )) {
    const original = await readFile(`source-assets/${image.file}`);
    const served = await readFile(`public/assets/${image.file}`);
    expect(createHash("sha256").update(served).digest("hex")).toBe(
      image.sourceSha256,
    );
    expect(served.equals(original)).toBe(true);
    const metadata = await sharp(served, { animated: true }).metadata();
    expect(metadata.pages).toBeGreaterThan(1);
    expect(metadata.loop).toBe(0);
    expect(metadata.delay?.length).toBe(metadata.pages);
  }
});

test("homepage wording and section navigation follow click, scroll and history", async ({
  page,
}) => {
  await page.goto("");
  await expect(page.locator("#about-title")).toHaveText(
    "Привет, меня зовут Ксения.",
  );
  await expect(page.locator(".about-copy .lead")).toContainText(
    "Я графический дизайнер.",
  );
  expect(
    (await page.locator(".outline-word, .outline-i").allTextContents())
      .map((text) => text.trim())
      .join(" "),
  ).toBe("HOW I WORK");
  const about = page.locator('.site-nav a[href$="#about"]');
  await expect(page.locator(".site-nav a")).toHaveCount(2);
  await about.click();
  await expect(about).toHaveClass("active");
  await expect
    .poll(() =>
      page.locator("#about").evaluate((el) => el.getBoundingClientRect().top),
    )
    .toBeLessThan(140);
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.waitForFunction(
    () =>
      Math.ceil(scrollY + innerHeight) >=
      document.documentElement.scrollHeight - 2,
  );
  await expect(about).toHaveClass("active");
  await page.evaluate(() =>
    document.getElementById("about")!.scrollIntoView({ behavior: "instant" }),
  );
  await expect(about).toHaveClass("active");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator('.site-nav a[href$="#work"]')).toHaveClass(
    "active",
  );
  await page.goto("work/logofolio/");
  await page.locator('.site-nav a[href$="#about"]').click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('.site-nav a[href$="#about"]')).toHaveClass(
    "active",
  );
});
