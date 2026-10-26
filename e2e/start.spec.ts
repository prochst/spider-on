// The game loads, draws and works offline: the smoke test both screen sizes run.

import { expect, test } from "@playwright/test";
import { menuButton, openGame, panelTitle } from "./helpers";

test("loads without errors and shows the title menu", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openGame(page);

  await expect(page).toHaveTitle("Spider On");
  await expect(panelTitle(page)).toHaveText("SPIDER ON");
  for (const label of ["Hrát", "Výsledky", "Nastavení"]) await expect(menuButton(page, label)).toBeVisible();
  // The first button has focus, so Enter works without the mouse (spec chapter 12).
  await expect(menuButton(page, "Hrát")).toBeFocused();
  expect(errors).toEqual([]);
});

test("draws the web on the canvas", async ({ page }) => {
  await openGame(page);
  // A blank canvas has a single colour; the neon web adds many. Counting a
  // coarse grid of pixels is enough to tell the two apart.
  const colours = await page.locator("#game").evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context) return 0;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const seen = new Set<string>();
    for (let i = 0; i < data.length; i += 4 * 97) seen.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
    return seen.size;
  });
  expect(colours).toBeGreaterThan(20);
});

test("loads nothing from the internet", async ({ page, baseURL }) => {
  // The game must work offline (CLAUDE.md, spec chapter 14), so every request stays on our own server.
  const origin = new URL(baseURL ?? "").origin;
  const foreign: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith(origin)) foreign.push(request.url());
  });
  await openGame(page);
  // Fonts are requested lazily, so give them a moment to be asked for.
  await page.evaluate(() => document.fonts.ready);
  expect(foreign).toEqual([]);
});
