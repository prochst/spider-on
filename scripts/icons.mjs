// Renders the app icon (public/icons/icon.svg) into the PNG sizes that
// install prompts and home screens ask for. Run it after changing the SVG:
//   node scripts/icons.mjs
// The PNGs are committed, so the build itself needs no browser.

import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const SVG = new URL("../public/icons/icon.svg", import.meta.url);
const SIZES = [
  // Android and desktop install prompts.
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  // iPhone and iPad home screen; iOS rounds the corners itself.
  { file: "apple-touch-icon.png", size: 180 },
];

const svg = await readFile(SVG, "utf8");
const browser = await chromium.launch();
for (const { file, size } of SIZES) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await page.screenshot({ path: new URL(`../public/icons/${file}`, import.meta.url).pathname });
  await page.close();
}
await browser.close();
