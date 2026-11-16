import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Keep the supplied PNG intact; only this transparent delivery copy is generated.
await mkdir('public/demo/wedding/assets', { recursive: true });
await sharp('source-assets/wedding-demo/Детский король и девочка в очках.png')
  .resize({ width: 1000, withoutEnlargement: true })
  .webp({ quality: 94, alphaQuality: 100, effort: 6 })
  .toFile('public/demo/wedding/assets/childhood-composition.webp');
