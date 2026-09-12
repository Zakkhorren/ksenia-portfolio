import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import data from "../src/data/content.json";

// Real files for direct navigation/reload on a static host without rewrite rules.
const output = resolve(import.meta.dir, "../dist");
const html = await readFile(join(output, "index.html"), "utf8");
const routes = [
  ...data.categories.map((c) => ({
    path: `work/${c.slug}`,
    title: c.page_title,
    description: c.description,
  })),
  ...data.projects.map((p) => ({
    path: `projects/${p.slug}`,
    title: p.title,
    description: p.description,
  })),
];
const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
for (const route of routes) {
  const dir = join(output, route.path);
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "index.html"),
    html
      .replace(
        /<title>.*?<\/title>/,
        `<title>${escape(route.title)} — KSENIA</title>`,
      )
      .replace(
        /(<meta name="description" content=")[^"]*/,
        `$1${escape(route.description)}`,
      ),
  );
}
await writeFile(
  join(output, "404.html"),
  html.replace(
    /<title>.*?<\/title>/,
    "<title>Страница не найдена — KSENIA</title>",
  ),
);
await writeFile(join(output, ".nojekyll"), "");
console.log(
  `Created ${routes.length + 2} static entry pages. No server runtime required.`,
);
