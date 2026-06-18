import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('desktop/build/appicon.svg');
const base = sharp(svg, { density: 300 });

await base.resize(1024, 1024).png().toFile('desktop/build/appicon.png');
console.log('generated desktop/build/appicon.png');

const png256 = await base.resize(256, 256).png().toBuffer();
writeFileSync('desktop/build/windows/icon.ico', await pngToIco(png256));
console.log('generated desktop/build/windows/icon.ico');

await base.resize(512, 512).png().toFile('desktop/build/darwin/icon.png');
console.log('generated desktop/build/darwin/icon.png');
