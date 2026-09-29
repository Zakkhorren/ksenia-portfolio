import { test, expect } from "@playwright/test";
import manifest from "../src/data/print-assets.json" with { type: "json" };
import home from "../src/data/home-backgrounds.json" with { type: "json" };
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const covers = manifest["1. Обложка мерс.pdf"].pages,
  inside = manifest["1. Блок мерс.pdf"].pages;
for (const width of [390, 768, 1440])
  test(`complete Mercedes covers and internal order at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("work/layout/");
    await page.locator("[data-project=mercedes] button").click();
    const physical = [covers[0], ...inside, covers[1]];
    const states =
      width <= 650
        ? physical.map((p) => [p])
        : [
            [covers[0]],
            inside.slice(0, 2),
            inside.slice(2, 4),
            inside.slice(4, 6),
            inside.slice(6, 8),
            [covers[1]],
          ];
    const geometry = () =>
      page
        .locator(".publication-modal,.book-stage,.book-controls,.book-position")
        .evaluateAll((ns) =>
          ns.map((n) => {
            const r = n.getBoundingClientRect();
            return [r.x, r.y, r.width, r.height];
          }),
        );
    await expect
      .poll(
        async () => (await page.locator(".book-stage").boundingBox())!.width,
      )
      .toBeGreaterThan(100);
    const initial = await geometry();
    for (let i = 0; i < states.length; i++) {
      await expect
        .poll(() =>
          page
            .locator("[data-page]")
            .evaluateAll((ns) =>
              ns.map((n) => decodeURIComponent(n.getAttribute("src")!)),
            ),
        )
        .toEqual(states[i].map((p) => "/ksenia-portfolio/assets/" + p.file));
      await expect(page.locator(".book-position")).toHaveText(
        `${i + 1} / ${states.length}`,
      );
      await expect(page.locator(".book-leaf")).toHaveCount(0);
      expect(await geometry()).toEqual(initial);
      await page.locator("[data-page]").evaluateAll(async (ns) => {
        for (const n of ns as HTMLImageElement[]) await n.decode();
      });
      if (width > 650) {
        const slots = page.locator(".book-page");
        await expect(slots).toHaveCount(2);
        const [l, r] = await slots.evaluateAll((ns) =>
          ns.map((n) => {
            const b = n.getBoundingClientRect();
            return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right };
          }),
        );
        expect(l.h).toBe(r.h);
        expect(l.w).toBe(r.w);
        expect(l.right).toBe(r.x);
        if (i === 0) {
          await expect(slots.first().locator(".book-blank")).toHaveCount(1);
          await expect(slots.nth(1).locator("img")).toHaveAttribute(
            "alt",
            /лицевая обложка/,
          );
        } else if (i === 5) {
          await expect(slots.nth(1).locator(".book-blank")).toHaveCount(1);
          await expect(slots.first().locator("img")).toHaveAttribute(
            "alt",
            /задняя обложка/,
          );
        } else await expect(page.locator(".book-blank")).toHaveCount(0);
      } else await expect(page.locator(".book-page")).toHaveCount(1);
      if (i < states.length - 1)
        await page.getByRole("button", { name: "Следующая страница" }).click();
    }
    await expect(
      page.getByRole("button", { name: "Следующая страница" }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");
  });
test("new homepage Print image is exact and other covers retain their hashes", async ({
  page,
}) => {
  const expected = {
    logofolio:
      "6c14e937e3654f39d48dc6f5fc87edafe940c40d356633c58bd29fff9aef9e86",
    packaging:
      "8d076914da5854624cfaba716385e2cd75f00b948d6fec2af8b897d0da043ccb",
    marketplace:
      "426485fe530e7a9bd80aae12a731792c2995c1c8a3ea302699887f441fc5212c",
    experiments:
      "50e9db83006a976be3a3e8dead3eb7890de4f1e2ab8631f322cd3f19b2031815",
    layout: "482eceb6ba4623db2db08f2941f9776ad699a35333aa7d2beb1d962b5d9586ee",
  };
  for (const [key, hash] of Object.entries(expected)) {
    const entry = home[key as keyof typeof home];
    expect(
      createHash("sha256")
        .update(await readFile("public/assets/" + entry.file))
        .digest("hex"),
    ).toBe(hash);
  }
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("");
    const card = page.locator(".category-row.layout");
    await expect(card).toHaveAttribute("href", /\/work\/layout\/$/);
    const style = await card.evaluate((n) => ({
      image: getComputedStyle(n).backgroundImage,
      position: getComputedStyle(n).backgroundPosition,
      size: getComputedStyle(n).backgroundSize,
    }));
    expect(decodeURIComponent(style.image)).toContain(
      "на главную_Полиграфия.jpg",
    );
    expect(style.position).toBe("100% 50%");
    expect(style.size).toBe("cover");
  }
});
