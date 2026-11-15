// The how-to-play screen (spec chapter 12): the goal of the game and the
// controls of the device the player is on, keys on a computer and gestures
// on a touch screen.

import { expect, type Page, test } from "@playwright/test";
import { expectScreen, menuButton, openGame, panelTitle } from "./helpers";
import { TouchScreen } from "./touch";

const keyControls = (page: Page) => page.locator(".help section.only-keys");
const touchControls = (page: Page) => page.locator(".help section.only-touch");

async function openHelp(page: Page): Promise<void> {
  await openGame(page);
  await menuButton(page, "Jak hrát").click();
  await expectScreen(page, "help");
  await expect(panelTitle(page)).toHaveText("Jak hrát");
}

/** The whole panel, its Zpět button included, is on screen without scrolling. */
async function expectPanelFits(page: Page): Promise<void> {
  const panel = page.locator(".panel");
  const { scroll, client } = await panel.evaluate((el) => ({ scroll: el.scrollHeight, client: el.clientHeight }));
  expect(scroll).toBeLessThanOrEqual(client);
  await expect(menuButton(page, "Zpět")).toBeInViewport({ ratio: 1 });
}

test("explains the goal and the controls of this device", async ({ page, isMobile }) => {
  await openHelp(page);
  await expect(page.getByRole("heading", { name: "Cíl hry" })).toBeVisible();
  await expect(page.locator(".help li")).toHaveCount(4);
  if (isMobile) {
    await expect(touchControls(page)).toBeVisible();
    await expect(touchControls(page)).toContainText("Pravý touchpad");
    await expect(keyControls(page)).toBeHidden();
  } else {
    await expect(keyControls(page)).toBeVisible();
    await expect(keyControls(page)).toContainText("Šipky nebo W A S D");
    await expect(touchControls(page)).toBeHidden();
  }
  await expectPanelFits(page);
});

test("Zpět returns to the title screen", async ({ page }) => {
  await openHelp(page);
  await menuButton(page, "Zpět").click();
  await expectScreen(page, "title");
});

test("Esc returns to the title screen", async ({ page, isMobile }) => {
  test.skip(isMobile, "a phone has no keyboard");
  await openHelp(page);
  await page.keyboard.press("Escape");
  await expectScreen(page, "title");
});

test("switches to the touch controls at the first touch on a computer", async ({ page, isMobile }) => {
  test.skip(isMobile, "a phone shows the touch controls from the start");
  await openHelp(page);
  await expect(keyControls(page)).toBeVisible();
  // The bottom left corner is canvas, outside the help panel.
  const touch = await TouchScreen.open(page);
  await touch.tap({ x: 40, y: 760 });
  await expect(touchControls(page)).toBeVisible();
  await expect(keyControls(page)).toBeHidden();
});

test("fits the smallest supported screen", async ({ page, isMobile }) => {
  test.skip(!isMobile, "a screen this small is a phone, so it shows the touch controls");
  await page.setViewportSize({ width: 640, height: 360 });
  await openHelp(page);
  await expectPanelFits(page);
});
