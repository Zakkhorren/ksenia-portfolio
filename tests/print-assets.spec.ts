import { test, expect } from "@playwright/test";
import manifest from "../src/data/print-assets.json" with { type: "json" };
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";

test("exact asset inventory and all rendered pages are served", async ({
  request,
}) => {
  expect(Object.keys(manifest)).toHaveLength(26);
  for (const [name, entry] of Object.entries(manifest)) {
    if (existsSync(`source-assets/print/${name}`))
      expect(
        createHash("sha256")
          .update(await readFile(`source-assets/print/${name}`))
          .digest("hex"),
      ).toBe(entry.sha256);
    for (const p of entry.pages)
      for (const file of [p.file, p.preview]) {
        const response = await request.get(`assets/${file}`);
        expect(response.ok(), file).toBe(true);
        expect(response.headers()["content-type"]).toContain("image/webp");
      }
  }
});
test("next featured project follows the approved closed loop", async ({
  page,
}) => {
  for (const [from, to] of [
    ["expresso", "fashion-lab"],
    ["fashion-lab", "riviera"],
    ["riviera", "expresso"],
  ]) {
    await page.goto(`projects/${from}/`);
    const next = page.locator(".end-navigation .next-link");
    await expect(next).toHaveAttribute("href", new RegExp(`/projects/${to}/$`));
    await next.click();
    await expect(page).toHaveURL(new RegExp(`/projects/${to}/$`));
  }
});
test("print inventory, static images and lightbox lifecycle", async ({
  page,
}) => {
  await page.goto("work/layout/");
  for (const [section, count] of [
    ["business", 2],
    ["posters", 4],
    ["materials", 6],
    ["editorial", 7],
  ] as const)
    await expect(page.locator(`.print-${section} .print-item`)).toHaveCount(
      count,
    );
  await expect(page.locator(".print-intro,.print-placeholder")).toHaveCount(0);
  await expect(page.locator(".print-posters button")).toHaveCount(0);
  await expect(page.locator(".print-materials button")).toHaveCount(1);
  for (const [id, count] of [
    ["expresso-cards", 2],
    ["fashion-cards", 2],
    ["postcards", 6],
    ["newspaper-1", 1],
    ["newspaper-2", 1],
    ["spread-1", 2],
    ["spread-2", 1],
    ["spread-3", 1],
  ] as const) {
    const opener = page.locator(`[data-project="${id}"] button`);
    await opener.click();
    const dialog = page.locator(".print-lightbox");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".print-preview-pages img")).toHaveCount(count);
    await expect(dialog.locator(".print-publication")).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(
      "hidden",
    );
    if (id === "postcards") {
      await expect(dialog.locator("figcaption")).toHaveText([
        "Гора",
        "Лес",
        "Город",
      ]);
      await expect(dialog.locator(".print-preview-group")).toHaveCount(3);
    }
    await dialog.locator("img").evaluateAll(async (imgs) => {
      for (const img of imgs as HTMLImageElement[]) {
        img.loading = "eager";
        await img.decode();
      }
    });
    if (id === "expresso-cards") await page.keyboard.press("Escape");
    else if (id === "fashion-cards") await page.mouse.click(2, 2);
    else await page.getByRole("button", { name: "Закрыть просмотр" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  }
});
for (const width of [390, 1440])
  test(`publication sequences and reduced motion at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("work/layout/");
    for (const [id, count] of [
      ["mercedes", 8],
      ["aviaprom", 3],
    ] as const) {
      await page.locator(`[data-project=${id}] button`).click();
      const dialog = page.locator(".print-lightbox");
      const frames =
        width < 650
          ? Array.from({ length: count }, (_, i) => [i + 1])
          : id === "mercedes"
            ? [[1], [2, 3], [4, 5], [6, 7], [8]]
            : [[1], [2, 3]];
      for (let i = 0; i < frames.length; i++) {
        await expect
          .poll(() =>
            dialog
              .locator("[data-page]")
              .evaluateAll((ns) =>
                ns.map((n) => Number(n.getAttribute("data-page"))),
              ),
          )
          .toEqual(frames[i]);
        await expect(dialog.locator(".book-leaf")).toHaveCount(0);
        await dialog.locator("[data-page]").evaluateAll(async (ns) => {
          for (const img of ns as HTMLImageElement[]) await img.decode();
        });
        if (i < frames.length - 1)
          await page
            .getByRole("button", { name: "Следующая страница" })
            .click();
      }
      await expect(
        page.getByRole("button", { name: "Следующая страница" }),
      ).toBeDisabled();
      await page.getByRole("button", { name: "Предыдущая страница" }).click();
      await expect
        .poll(() =>
          dialog
            .locator("[data-page]")
            .evaluateAll((ns) =>
              ns.map((n) => Number(n.getAttribute("data-page"))),
            ),
        )
        .toEqual(frames.at(-2));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Escape");
    }
  });
test("page turn uses a physical double-sided leaf and retains blank edges", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("work/layout/");
  await page.locator("[data-project=mercedes] button").click();
  await expect(
    page.locator(".book-page").first().locator(".book-blank"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Следующая страница" }).click();
  await expect(page.locator(".book-leaf.forward")).toBeVisible();
  await expect(page.locator(".leaf-face")).toHaveCount(2);
  expect(
    await page
      .locator(".book-leaf")
      .evaluate((n) => getComputedStyle(n).animationName),
  ).toBe("print-turn-forward");
  await expect(page.locator(".book-leaf")).toHaveCount(0);
  await page.getByRole("button", { name: "Предыдущая страница" }).click();
  await expect(page.locator(".book-leaf.backward")).toBeVisible();
  await expect(page.locator(".book-leaf")).toHaveCount(0);
  await page.keyboard.press("Escape");
});
