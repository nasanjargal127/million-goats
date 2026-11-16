// Generates favicon, app icons, PWA icons, OG/Twitter images and web-sized
// logos from the original Million Goats logo files in /brand.
// Run with: npm run brand
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const brand = (f) => path.join(root, "brand", f);
const app = (f) => path.join(root, "src", "app", f);
const pub = (f) => path.join(root, "public", f);

const BLUE = "#0068FF";
const NAVY = "#010D26";
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// The stacked logos have the symbol on top and the wordmark below.
// Rows 0–2175 of the 7337×4165 originals hold the symbol.
async function symbol(file) {
  const top = await sharp(brand(file))
    .extract({ left: 0, top: 0, width: 7337, height: 2200 })
    .png()
    .toBuffer();
  return cropToContent(top);
}

// sharp's trim() does not handle these transparent PNGs, so crop to the
// bounding box of visible (alpha > 16) pixels ourselves.
async function cropToContent(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return sharp(input)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer();
}

// Square icon: symbol centred with `pad` (fraction of size) on each side.
async function squareIcon(sym, size, pad, background = CLEAR) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(sym)
    .resize(inner, inner, { fit: "contain", background: CLEAR })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: "center" }])
    .png()
    .toBuffer();
}

// Minimal ICO writer with PNG-encoded entries (supported by all modern browsers).
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function socialImage(out) {
  const W = 1200;
  const H = 630;
  const logo = await sharp(brand("stacked-blue-white.png"))
    .resize(620, 380, { fit: "contain", background: CLEAR })
    .toBuffer();
  await sharp({ create: { width: W, height: H, channels: 4, background: NAVY } })
    .composite([{ input: logo, gravity: "center" }])
    .flatten({ background: NAVY })
    .png({ compressionLevel: 9 })
    .toFile(out);
}

async function main() {
  await mkdir(pub("brand"), { recursive: true });

  const blueSym = await symbol("stacked-blue.png");
  const whiteSym = await symbol("stacked-white.png");

  // Browser tab: blue symbol on transparent.
  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(
    icoSizes.map(async (size) => ({ size, data: await squareIcon(blueSym, size, 0.02) })),
  );
  await writeFile(app("favicon.ico"), ico(icoPngs));
  await writeFile(app("icon.png"), await squareIcon(blueSym, 512, 0.06));

  // iOS home screen: opaque, white symbol on brand blue.
  await writeFile(app("apple-icon.png"), await squareIcon(whiteSym, 180, 0.18, BLUE));

  // PWA manifest icons (maskable-safe padding).
  await writeFile(pub("icon-192.png"), await squareIcon(whiteSym, 192, 0.2, BLUE));
  await writeFile(pub("icon-512.png"), await squareIcon(whiteSym, 512, 0.2, BLUE));

  // Social share cards.
  await socialImage(app("opengraph-image.png"));
  await socialImage(app("twitter-image.png"));

  // Web-sized logos for use in the UI and structured data.
  const logos = {
    "stacked-blue-navy": 1200,
    "stacked-blue": 1200,
    "stacked-white": 1200,
    "stacked-blue-white": 1200,
    "horizontal-blue-navy": 1200,
    "horizontal-blue": 1200,
    "horizontal-white": 1200,
    "horizontal-blue-white": 1200,
  };
  for (const [name, width] of Object.entries(logos)) {
    const cropped = await cropToContent(
      await sharp(brand(`${name}.png`))
        .png()
        .toBuffer(),
    );
    await sharp(cropped)
      .resize({ width })
      .png({ compressionLevel: 9, palette: true })
      .toFile(pub(`brand/${name}.png`));
  }
  await writeFile(
    pub("brand/symbol-blue.png"),
    await sharp(blueSym).resize({ width: 512 }).png().toBuffer(),
  );
  await writeFile(
    pub("brand/symbol-white.png"),
    await sharp(whiteSym).resize({ width: 512 }).png().toBuffer(),
  );

  console.log("Brand assets generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
