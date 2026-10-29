// Touch controls on a phone held sideways (spec chapter 11): the right half
// is the touchpad, the left half the throttle, and both thumbs work at once.

import { expect, test } from "@playwright/test";
import { expectScreen, menuButton, openGame, readGame } from "./helpers";
import { TouchScreen } from "./touch";

const WIDTH = 844;
const HEIGHT = 390;
const PAD = { x: WIDTH * 0.85, y: HEIGHT / 2 };
const THROTTLE = { x: WIDTH * 0.15, y: HEIGHT / 2 };

test.beforeEach(async ({ page }) => {
  await openGame(page);
});

test("shows the touch controls on a touch screen", async ({ page }) => {
  await expect(page.locator("#ui")).toHaveClass(/\btouch\b/);
  await expect(page.locator(".rotate-hint")).toBeHidden();
});

test("a tap on the touchpad starts the round", async ({ page }) => {
  const touch = await TouchScreen.open(page);
  await menuButton(page, "Hrát").tap();
  await expectScreen(page, "ready");

  await touch.tap(PAD);
  await expectScreen(page, "playing");
});

test("a tap on the throttle side does not start the round", async ({ page }) => {
  const touch = await TouchScreen.open(page);
  await menuButton(page, "Hrát").tap();
  await expectScreen(page, "ready");

  await touch.tap(THROTTLE);
  await page.waitForTimeout(200);
  await expectScreen(page, "ready");
});

test("the throttle and a swipe work at the same time", async ({ page }) => {
  const touch = await TouchScreen.open(page);
  await menuButton(page, "Hrát").tap();
  await touch.tap(PAD);
  await expectScreen(page, "playing");

  // The spider starts at the bottom on the outer ring and crawls towards the
  // right gate spoke. A turn is remembered only in the last 30° before the
  // gate, so wait for it, then swipe left: towards the centre along that spoke.
  // expect.poll waits longer and longer between looks (up to a second) and
  // can miss the zone, so the page checks on every frame instead.
  await page.waitForFunction(
    () => {
      const angle = window.spiderOn?.field.player.angle ?? Math.PI;
      return angle > 0.1 && angle < 0.45;
    },
    undefined,
    { polling: "raf", timeout: 15_000 },
  );
  const thumb = await touch.down(THROTTLE);
  expect(await readGame(page, (game) => game.throttle)).toBe(true);
  await touch.swipe(PAD, { x: PAD.x - 60, y: PAD.y });
  await expect
    .poll(() => readGame(page, ({ field: { player } }) => player.pending !== null || player.crossing !== null))
    .toBe(true);
  expect(await readGame(page, (game) => game.throttle)).toBe(true);

  await touch.up(thumb);
  expect(await readGame(page, (game) => game.throttle)).toBe(false);
});

test("held upright, it asks to turn the phone and pauses", async ({ page }) => {
  const touch = await TouchScreen.open(page);
  await menuButton(page, "Hrát").tap();
  await touch.tap(PAD);
  await expectScreen(page, "playing");

  await page.setViewportSize({ width: HEIGHT, height: WIDTH });
  await expect(page.locator(".rotate-hint")).toBeVisible();
  await expect(page.locator(".rotate-hint")).toContainText("Otoč zařízení na šířku");
  await expectScreen(page, "paused");

  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await expect(page.locator(".rotate-hint")).toBeHidden();
});
