import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const BG = "#111318";
const ACCENT = "#FFD400";

// bolt path authored on a 32x32 grid, centered
function boltSvg({ size, padding, bg, stroke, strokeWidth, transparent = false }) {
  const inner = size - padding * 2;
  const scale = inner / 32;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${transparent ? "" : `<rect width="${size}" height="${size}" fill="${bg}"/>`}
  <g transform="translate(${padding}, ${padding}) scale(${scale})">
    <path d="M18.5 2L7 18H14.5L13 30L25 13H17.5L18.5 2Z"
      stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
  </g>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 28, bg: BG, stroke: ACCENT, strokeWidth: 2.4 },
  { name: "icon-512.png", size: 512, padding: 76, bg: BG, stroke: ACCENT, strokeWidth: 2.4 },
  // maskable: extra safe-zone padding so the bolt survives OS masking crops
  { name: "icon-maskable-192.png", size: 192, padding: 44, bg: BG, stroke: ACCENT, strokeWidth: 2.6 },
  { name: "icon-maskable-512.png", size: 512, padding: 118, bg: BG, stroke: ACCENT, strokeWidth: 2.6 },
  { name: "apple-touch-icon.png", size: 180, padding: 26, bg: BG, stroke: ACCENT, strokeWidth: 2.4 },
];

for (const t of targets) {
  const svg = boltSvg(t);
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, t.name));
  console.log("wrote", t.name);
}

// Next.js App Router file-based icon conventions (auto-served, no manifest entry needed)
const iconSvg = boltSvg({ size: 64, padding: 9, bg: BG, stroke: ACCENT, strokeWidth: 3 });
await sharp(Buffer.from(iconSvg))
  .resize(32, 32)
  .png()
  .toFile(path.join(__dirname, "..", "src", "app", "icon.png"));
console.log("wrote src/app/icon.png");

const appleIconSvg = boltSvg({ size: 180, padding: 26, bg: BG, stroke: ACCENT, strokeWidth: 2.4 });
await sharp(Buffer.from(appleIconSvg))
  .png()
  .toFile(path.join(__dirname, "..", "src", "app", "apple-icon.png"));
console.log("wrote src/app/apple-icon.png");

console.log("done");
