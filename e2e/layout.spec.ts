// Layout on different screens (spec chapters 11, 12 and 15): the menus fit,
// grow on a large monitor, stay clear of a notch, and the corner holds pause
// or full screen.

import { expect, type Page, test } from "@playwright/test";
import type { View } from "../src/render/view";
import { expectScreen, menuButton, openGame } from "./helpers";

function readView(page: Page): Promise<View> {
  return page.evaluate(() => (window as unknown as { spiderOnView: View }).spiderOnView);
}

async function expectInsideViewport(page: Page, selector: string): Promise<void> {
  const box = await page.locator(selector).boundingBox();
  const size = page.viewportSize();
  if (!box || !size) throw new Error(`${selector} is not on screen`);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(size.width);
  expect(box.y + box.height).toBeLessThanOrEqual(size.height);
}

test("a full score table fits on the screen", async ({ page }) => {
  const scores = Array.from({ length: 10 }, (_, i) => ({
    name: "Dlouhé jméno 16z",
    score: 9000 - i * 500,
    difficulty: "medium",
    round: 20 + i,
    date: "2026-10-29",
  }));
  await page.addInitScript((table) => localStorage.setItem("spider-on.scores", JSON.stringify(table)), scores);
  await openGame(page);
  await expectInsideViewport(page, ".panel");
  await menuButton(page, "Výsledky").click();
  await expect(page.locator("table.scores tbody tr")).toHaveCount(10);
  await expectInsideViewport(page, ".panel");
  // The panel may scroll on a very low screen, but here everything is visible without it.
  const scrolls = await page.locator(".panel").evaluate((panel) => panel.scrollHeight > panel.clientHeight);
  expect(scrolls).toBe(false);
});

test("the corner shows full screen in menus and pause during the game", async ({ page }) => {
  await openGame(page);
  const fullscreen = page.getByRole("button", { name: "Celá obrazovka" });
  const pause = page.getByRole("button", { name: "Pauza" });
  await expect(fullscreen).toBeVisible();
  await expect(pause).toBeHidden();

  await menuButton(page, "Hrát").click();
  await expectScreen(page, "ready");
  await expect(pause).toBeVisible();
  await expect(fullscreen).toBeHidden();
});

test("the full screen button switches full screen on and off", async ({ page }) => {
  await openGame(page);
  await page.getByRole("button", { name: "Celá obrazovka" }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true);
  // Focus goes back to the menu, so Enter still starts the game.
  await expect(menuButton(page, "Hrát")).toBeFocused();

  await page.getByRole("button", { name: "Ukončit celou obrazovku" }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(false);
});

test("the game keeps clear of a notch and the home bar", async ({ page }) => {
  await openGame(page);
  // Screens in tests have no notch, so the test sets the safe area the way an iPhone held sideways reports it.
  await page.addStyleTag({ content: ":root { --safe-left: 47px; --safe-right: 47px; --safe-bottom: 21px; }" });
  const size = page.viewportSize()!;
  await page.setViewportSize({ width: size.width - 1, height: size.height });
  await page.setViewportSize(size);

  const view = await readView(page);
  expect(view.hud.left).toBe(47);
  expect(view.hud.right).toBeLessThanOrEqual(size.width - 47);
  expect(view.cy + view.unit).toBeLessThanOrEqual(size.height - 21);
  if (view.controls) {
    expect(view.controls.throttle.x - view.controls.throttle.r).toBeGreaterThanOrEqual(47);
    expect(view.controls.pad.x + view.controls.pad.half).toBeLessThanOrEqual(size.width - 47);
  }
  const corner = await page.locator(".corner-button:visible").boundingBox();
  expect(corner!.x + corner!.width).toBeLessThanOrEqual(size.width - 47);
});

test("menus grow on a large monitor", async ({ page, isMobile }) => {
  test.skip(isMobile, "only a desktop has a large monitor");
  await page.setViewportSize({ width: 1280, height: 800 });
  await openGame(page);
  const laptop = (await page.locator(".panel").boundingBox())!.width;
  await page.setViewportSize({ width: 2560, height: 1440 });
  const large = (await page.locator(".panel").boundingBox())!.width;
  expect(large / laptop).toBeGreaterThan(1.6);
});
