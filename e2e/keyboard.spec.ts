// A whole game from the keyboard (spec chapters 11 and 12): menus, the
// throttle, pause, a cleared round and game over.

import { expect, test } from "@playwright/test";
import { expectScreen, menuButton, openGame, panelTitle, readGame } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openGame(page);
});

test("Enter starts a game and the round", async ({ page }) => {
  await page.keyboard.press("Enter");
  await expect(panelTitle(page)).toHaveText("Kolo 1");
  await expectScreen(page, "ready");

  await page.keyboard.press("Enter");
  await expectScreen(page, "playing");
  await expect(page.locator(".panel")).toBeHidden();
});

test("the throttle holds while Space or Shift is down", async ({ page }) => {
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expectScreen(page, "playing");

  for (const key of ["Space", "Shift"]) {
    await page.keyboard.down(key);
    expect(await readGame(page, (game) => game.throttle)).toBe(true);
    await page.keyboard.up(key);
    expect(await readGame(page, (game) => game.throttle)).toBe(false);
  }
});

test("the spider moves along its ring", async ({ page }) => {
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  const before = await readGame(page, (game) => game.field.player.angle);
  await expect.poll(() => readGame(page, (game) => game.field.player.angle)).not.toBeCloseTo(before, 2);
});

test("Escape pauses and the pause menu resumes", async ({ page }) => {
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expectScreen(page, "playing");

  await page.keyboard.press("Escape");
  await expectScreen(page, "paused");
  await expect(panelTitle(page)).toHaveText("Pauza");
  await expect(menuButton(page, "Pokračovat")).toBeFocused();

  await page.keyboard.press("Enter");
  await expectScreen(page, "playing");
});

test("the game pauses when the window loses focus", async ({ page }) => {
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expectScreen(page, "playing");

  // Headless browsers never lose focus by themselves, so the test sends the event the browser would.
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expectScreen(page, "paused");
});

test("a cleared round leads to the next one", async ({ page }) => {
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  // Debug shortcut C eats every fly.
  await page.keyboard.press("KeyC");
  await expect(panelTitle(page)).toHaveText("Kolo 1 dokončeno");
  await expect(page.locator(".panel")).toContainText("Bonus za kolo 100");

  await page.keyboard.press("Enter");
  await expect(panelTitle(page)).toHaveText("Kolo 2");
});
