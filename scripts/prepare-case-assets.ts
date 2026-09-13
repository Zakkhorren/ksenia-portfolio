import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

// Originals retain the ZIP names and bytes. Derivatives never split long cases.
const root = resolve(import.meta.dir, "..");
const source = join(root, "source-assets/cases");
const output = join(root, "public/assets/cases");
const covers = [
  "01-fashion-lab-cover.jpg",
  "02-riviera-cover.jpg",
  "03-expresso-cover.jpg",
  "04-placeholder-cover.jpg",
  "05-placeholder-cover.jpg",
  "06-placeholder-cover.jpg",
  "07-placeholder-cover.jpg",
].map((name) => `covers/${name}`);
const caseFiles = {
  "fashion-lab": ["FASHION_LAB/fashion-lab-case.jpg"],
  riviera: ["RIVIERA/riviera-case.jpg"],
  expresso: Array.from({ length: 14 }, (_, index) => {
    const n = index + 1;
    return `EXPRESSO/case/${String(n).padStart(2, "0")}-expresso.${[3, 6].includes(n) ? "gif" : "jpg"}`;
  }),
};
sharp.cache(false);
sharp.concurrency(1);
const records: Record<
  string,
  {
    file: string;
    width: number;
    height: number;
    sourceSha256: string;
    sha256: string;
    bytes: number;
    sourceBytes: number;
    pages: number;
  }
> = {};
for (const file of [...covers, ...Object.values(caseFiles).flat()]) {
  const input = join(source, file),
    target = join(output, file);
  await mkdir(dirname(target), { recursive: true });
  const original = await readFile(input);
  const metadata = await sharp(original, {
    animated: file.endsWith(".gif"),
  }).metadata();
  if (file.endsWith(".gif")) await copyFile(input, target);
  else
    await sharp(original)
      .resize({
        width: file.startsWith("covers/") ? 2560 : 3200,
        withoutEnlargement: true,
      })
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toFile(target);
  const derivative = await readFile(target);
  const size = await sharp(derivative).metadata();
  records[file] = {
    file: `cases/${file}`,
    width: size.width!,
    height: size.height!,
    sourceSha256: createHash("sha256").update(original).digest("hex"),
    sha256: createHash("sha256").update(derivative).digest("hex"),
    bytes: derivative.length,
    sourceBytes: original.length,
    pages: metadata.pages || 1,
  };
  console.log(
    `${file}: ${size.width} x ${size.height}, ${derivative.length} bytes${metadata.pages ? `, ${metadata.pages} frames` : ""}`,
  );
}
await writeFile(
  join(root, "src/data/case-assets.json"),
  JSON.stringify(
    {
      covers: covers.map((file) => records[file]),
      projects: Object.fromEntries(
        Object.entries(caseFiles).map(([slug, files]) => [
          slug,
          files.map((file) => records[file]),
        ]),
      ),
    },
    null,
    2,
  ) + "\n",
);
