import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync('desktop/build/appicon.svg');
const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
for (const size of sizes) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(`desktop/build/linux/icons/hicolor/${size}x${size}/apps/lgcode-desktop.png`);
  console.log(`generated ${size}x${size}`);
}
