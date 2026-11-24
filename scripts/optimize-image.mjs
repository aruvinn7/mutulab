/**
 * Optimizer foto lanskap MutuLab — mengutamakan kualitas visual.
 * Pakai: node scripts/optimize-image.mjs [path/gambar-sumber.jpg]
 * Output: public/img/landscape-{640,1280,1920,2048}.webp + landscape-blur.webp
 */
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const source = process.argv[2] ?? 'D:/Download/Installer/ductinh91-nature-7944405.jpg';
const outDir = path.resolve('public/img');
await mkdir(outDir, { recursive: true });

const input = await stat(source);
console.log(`Sumber: ${source} (${(input.size / 1024 / 1024).toFixed(2)} MB)`);

// q90 mempertahankan detail rumput & gradasi langit; tetap jauh lebih ringan dari JPEG asli.
const widths = [640, 1280, 1920, 2048];
const results = [];

for (const width of widths) {
  const name = `landscape-${width}.webp`;
  const info = await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true, kernel: 'lanczos3' })
    .webp({ quality: 90, effort: 6, smartSubsample: false })
    .toFile(path.join(outDir, name));
  results.push({ name, kb: +(info.size / 1024).toFixed(1), w: info.width, h: info.height });
}

const blur = await sharp(source)
  .rotate()
  .resize({ width: 32, withoutEnlargement: true })
  .webp({ quality: 48, effort: 6 })
  .toFile(path.join(outDir, 'landscape-blur.webp'));
results.push({ name: 'landscape-blur.webp', kb: +(blur.size / 1024).toFixed(1), w: blur.width, h: blur.height });

console.table(results);
const total = results.reduce((s, r) => s + r.kb, 0);
console.log(`Total keluaran: ${total.toFixed(1)} KB (sumber ${(input.size / 1024).toFixed(1)} KB)`);
