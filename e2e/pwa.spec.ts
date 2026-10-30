// The game as an installable app (spec chapter 15): manifest and icons,
// the version on the title screen and offline play. The offer of a new
// version needs two different builds; scripts/check-update.mjs tries that.

import { expect, type Page, test } from "@playwright/test";
import { expectScreen, menuButton, openGame, panelTitle } from "./helpers";

/** Waits until the service worker has installed every file and serves the page. */
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 15_000 });
}

test("links a manifest whose icons all load", async ({ page, request }) => {
  await openGame(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  const manifestUrl = new URL(href ?? "", page.url());
  const manifest = (await (await request.get(manifestUrl.href)).json()) as {
    name: string;
    display: string;
    orientation: string;
    icons: { src: string; sizes: string }[];
  };
  expect(manifest.name).toBe("Spider On");
  expect(manifest.display).toBe("fullscreen");
  expect(manifest.orientation).toBe("landscape");
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  for (const icon of manifest.icons) {
    expect((await request.get(new URL(icon.src, manifestUrl).href)).ok(), icon.src).toBe(true);
  }
});

test("shows the version on the title screen", async ({ page }) => {
  await openGame(page);
  await expect(page.locator(".panel .footer")).toHaveText(/^verze \d+\.\d+\.\d+ · \S+$/);
});

test("starts and plays without internet after the first visit", async ({ page, context }) => {
  await openGame(page);
  await waitForServiceWorker(page);

  await context.setOffline(true);
  await page.reload();
  await expect(panelTitle(page)).toHaveText("SPIDER ON");
  await menuButton(page, "Hrát").click();
  await page.keyboard.press("Enter");
  await expectScreen(page, "playing");
});
