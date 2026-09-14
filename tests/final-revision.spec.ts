import { test, expect } from "@playwright/test";
const copy = [
  [
    "logofolio",
    "Логотипы и знаки, собранные в одну систему.",
    "Смысл — в простоте",
  ],
  [
    "packaging",
    "Упаковка, которую хочется рассматривать.",
    "Каждой вещи — своя оболочка",
  ],
  [
    "marketplace",
    "Карточки товаров, инфографика и визуальный контент для маркетплейсов.",
    "Иногда всё начинается с обложки",
  ],
  [
    "layout",
    "Журналы, многостраничные издания и печатная графика.",
    "Всё держится на сетке",
  ],
  [
    "experiments",
    "Место для идей, проб и визуальных экспериментов.",
    "Иногда хочется просто поиграться",
  ],
];
for (const width of [320, 390, 600, 768, 1024, 1440, 1920])
  test(`final headers and logo text rows at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    for (const [slug, description, note] of copy) {
      await page.goto(`work/${slug}/`);
      await expect(page.locator(".page-description")).toHaveText(description);
      await expect(page.locator(".page-note")).toHaveText(note);
      await expect(page.locator(".site-nav a")).toHaveText([
        "РАБОТЫ",
        "ОБО МНЕ",
      ]);
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
      if (width >= 1440)
        expect(
          await page
            .locator(".page-description")
            .evaluate(
              (el) =>
                el.getBoundingClientRect().height /
                parseFloat(getComputedStyle(el).lineHeight),
            ),
        ).toBeLessThan(1.1);
      if (slug === "logofolio" && width > 600) {
        const rows = await page
          .locator(".year-2023 .logo-project")
          .evaluateAll((nodes) =>
            nodes.map((el) =>
              [
                ...el.querySelectorAll(
                  ".logo-caption-title,.logo-caption-context,.logo-cue",
                ),
              ].map((n) => n.getBoundingClientRect().top),
            ),
          );
        for (let r = 0; r < 3; r++)
          expect(
            Math.max(...rows.map((x) => x[r])) -
              Math.min(...rows.map((x) => x[r])),
          ).toBeLessThan(1);
        const sizes = await page
          .locator(".year-2023 .logo-project")
          .evaluateAll((nodes) =>
            nodes.map((n) => ({
              shark: n.classList.contains("logo-shark"),
              width: n.querySelector(".logo-art")!.getBoundingClientRect()
                .width,
            })),
          );
        expect(sizes.find((s) => s.shark)!.width).toBeLessThan(
          Math.min(...sizes.filter((s) => !s.shark).map((s) => s.width)),
        );
      }
    }
  });
test("case copy, shared overlay and exact placeholder mapping", async ({
  page,
}) => {
  await page.goto("");
  await expect(page.locator("a.featured-card .project-description")).toHaveText(
    [
      "Айдентика / Бренд одежды",
      "Айдентика / Круизы и путешествия",
      "Айдентика / Кофейня",
    ],
  );
  const placeholders = page.locator(".project-placeholder");
  await expect(placeholders).toHaveCount(4);
  const styles = await placeholders.evaluateAll((nodes) =>
    nodes.map((n) => ({
      bg: getComputedStyle(n).backgroundImage,
      size: getComputedStyle(n).backgroundSize,
      overlay: getComputedStyle(n, "::after").content,
      heading: getComputedStyle(n.querySelector("h2")!).color,
      color: getComputedStyle(n.querySelector(".project-description")!).color,
      line: getComputedStyle(n.querySelector(".project-number span")!)
        .backgroundColor,
    })),
  );
  for (const [i, n] of styles.entries()) {
    expect(n.bg).toContain(
      ["04", "05", "07", "06"][i] + "-placeholder-cover.jpg",
    );
    expect(n.size).toBe("cover");
    expect(n.overlay).not.toBe("none");
    expect(n.color).toBe(n.line);
    expect(n.heading).toBe(n.color);
    if (i % 2) expect(n.color).toBe("rgb(0, 0, 0)");
  }
  expect(
    await page
      .locator("a.featured-card")
      .first()
      .evaluate((n) => getComputedStyle(n, "::after").backgroundImage),
  ).toContain("0.7");
  for (const [slug, description] of [
    ["fashion-lab", "Айдентика / Бренд одежды"],
    ["riviera", "Айдентика / Круизы и путешествия"],
    ["expresso", "Айдентика / Кофейня"],
  ]) {
    await page.goto(`projects/${slug}/`);
    await expect(page.locator(".page-description")).toHaveText(description);
  }
});

test("five named home backgrounds load with shared cover and stay within viewport", async ({
  page,
}) => {
  const names = [
    "Логофолио",
    "Упаковка",
    "Маркетплейсы",
    "Вёрстка",
    "Эксперименты",
  ];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("");
    const rows = page.locator(".supplied-background");
    await expect(rows).toHaveCount(5);
    const backgrounds = await rows.evaluateAll((ns) =>
      ns.map((n) => ({
        url: getComputedStyle(n).backgroundImage.slice(5, -2),
        size: getComputedStyle(n).backgroundSize,
        width: n.getBoundingClientRect().width,
      })),
    );
    for (const [i, bg] of backgrounds.entries()) {
      expect(decodeURIComponent(bg.url)).toContain(
        "на главную_" + names[i] + ".jpg",
      );
      expect(bg.size).toBe("cover");
      expect(bg.width).toBeLessThanOrEqual(width + 1);
      expect((await page.request.get(bg.url)).status()).toBe(200);
    }
  }
});
