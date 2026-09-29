import { test, expect } from "@playwright/test";
for (const width of [390, 768, 1440])
  test(`fixed publication geometry, source scale and navigation at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("work/layout/");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await expect(page.locator("[data-project=mercedes] img")).toHaveCount(1);
    await expect(
      page.locator("[data-project=mercedes] figcaption"),
    ).toContainText("Каталог Mercedes-Benz");
    for (const id of ["mercedes", "aviaprom"]) {
      await page.locator(`[data-project=${id}] button`).click();
      const dialog = page.locator(".publication-modal"),
        stage = page.locator(".book-stage");
      await expect
        .poll(async () => (await stage.boundingBox())!.width)
        .toBeGreaterThan(100);
      const geometry = () =>
        page
          .locator(
            ".publication-modal,.book-stage,.book-controls,.book-position",
          )
          .evaluateAll((ns) =>
            ns.map((n) => {
              const r = n.getBoundingClientRect();
              return [r.x, r.y, r.width, r.height];
            }),
          );
      const baseline = await geometry();
      const states =
        id === "aviaprom"
          ? [[1], [2], [3]]
          : width <= 650
            ? [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]
            : [[1], [2, 3], [4, 5], [6, 7], [8, 9], [10]];
      for (let i = 0; i < states.length; i++) {
        await expect
          .poll(() =>
            page
              .locator("[data-page]")
              .evaluateAll((ns) =>
                ns.map((n) => Number(n.getAttribute("data-page"))),
              ),
          )
          .toEqual(states[i]);
        await expect(page.locator(".book-leaf")).toHaveCount(0);
        await page.locator("[data-page]").evaluateAll(async (ns) => {
          for (const img of ns as HTMLImageElement[]) await img.decode();
        });
        expect(await geometry()).toEqual(baseline);
        if (width > 650) {
          await expect(page.locator(".book-page")).toHaveCount(2);
          if (i === 0)
            await expect(
              page.locator(".book-page").nth(1).locator('[data-page="1"]'),
            ).toHaveCount(1);
          if (i === states.length - 1)
            await expect(
              page
                .locator(".book-page")
                .first()
                .locator(`[data-page="${id === "aviaprom" ? 3 : 10}"]`),
            ).toHaveCount(1);
          if (id === "aviaprom" && i === 1) {
            const spread = await page
              .locator(".book-whole-spread img")
              .boundingBox();
            expect(spread!.width).toBe(baseline[1][2]);
            await expect(page.locator('[data-page="3"]')).toHaveCount(0);
          }
        } else {
          await expect(page.locator(".book-page")).toHaveCount(1);
          await expect(page.locator(".book-leaf")).toHaveCount(0);
          if (id === "aviaprom" && i === 1) {
            await page.getByRole("button", { name: "Увеличить" }).click();
            await expect(page.locator(".book-window")).toHaveClass(/is-zoomed/);
            expect(
              await page
                .locator(".book-window")
                .evaluate((n) => n.scrollWidth > n.clientWidth),
            ).toBe(true);
            expect(await dialog.boundingBox()).toEqual({
              x: baseline[0][0],
              y: baseline[0][1],
              width: baseline[0][2],
              height: baseline[0][3],
            });
            await page.getByRole("button", { name: "Уменьшить" }).click();
          }
        }
        expect(
          await dialog.evaluate((n) => n.scrollWidth <= n.clientWidth),
        ).toBe(true);
        if (i < states.length - 1) {
          await page
            .getByRole("button", { name: "Следующая страница" })
            .click();
          if (width > 650) {
            await expect(page.locator(".book-leaf")).toBeVisible();
            expect(await geometry()).toEqual(baseline);
          } else await expect(page.locator(".book-leaf")).toHaveCount(0);
        }
      }
      await expect(
        page.getByRole("button", { name: "Следующая страница" }),
      ).toBeDisabled();
      for (let i = states.length - 2; i >= 0; i--) {
        await page.getByRole("button", { name: "Предыдущая страница" }).click();
        await expect(page.locator(".book-leaf")).toHaveCount(0);
        await expect
          .poll(() =>
            page
              .locator("[data-page]")
              .evaluateAll((ns) =>
                ns.map((n) => Number(n.getAttribute("data-page"))),
              ),
          )
          .toEqual(states[i]);
        expect(await geometry()).toEqual(baseline);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });

test("equal preview scale within tiers and complete static section 04 modals", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("work/layout/");
  for (const ids of [
    ["mercedes", "aviaprom"],
    ["newspaper-1", "newspaper-2"],
    ["spread-2", "spread-3"],
  ]) {
    const boxes = [];
    for (const id of ids)
      boxes.push(
        await page
          .locator(`[data-project=${id}] .print-item-images`)
          .boundingBox(),
      );
    for (const box of boxes) {
      expect(Math.abs(box!.width - boxes[0]!.width)).toBeLessThan(1);
      expect(Math.abs(box!.height - boxes[0]!.height)).toBeLessThan(1);
    }
  }
  for (const [i, id] of [
    "newspaper-1",
    "newspaper-2",
    "spread-1",
    "spread-2",
    "spread-3",
  ].entries()) {
    const open = page.locator(`[data-project=${id}] button`);
    await open.click();
    await expect(page.locator(".editorial-modal")).toBeVisible();
    await expect(page.locator(".print-publication")).toHaveCount(0);
    for (const img of await page.locator(".editorial-modal img").all()) {
      expect(await img.evaluate((n) => getComputedStyle(n).objectFit)).toBe(
        "contain",
      );
      await img.evaluate((n: HTMLImageElement) => {
        n.loading = "eager";
        return n.decode();
      });
    }
    if (i % 3 === 0) await page.keyboard.press("Escape");
    else if (i % 3 === 1) await page.mouse.click(1, 1);
    else await page.getByRole("button", { name: "Закрыть просмотр" }).click();
    await expect(page.locator(".editorial-modal")).toHaveCount(0);
    await expect(open).toBeFocused();
  }
});
