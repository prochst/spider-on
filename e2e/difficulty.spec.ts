// The difficulty setting on the title screen (spec chapters 6, 10 and 12).

import { expect, type Page, test } from "@playwright/test";
import { expectScreen, menuButton, openGame, panelTitle, readGame } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openGame(page);
});

const difficulty = (page: Page) => page.getByLabel("Úroveň obtížnosti");

test("starts on easy, round 1", async ({ page }) => {
  await expect(difficulty(page)).toHaveValue("easy");
  await menuButton(page, "Hrát").click();
  await expect(panelTitle(page)).toHaveText("Kolo 1");
});

test("medium starts on round 7 with 4 rings and hard on round 14 with 5", async ({ page }) => {
  await difficulty(page).selectOption({ label: "Střední" });
  await menuButton(page, "Hrát").click();
  await expect(panelTitle(page)).toHaveText("Kolo 7");
  expect(await readGame(page, (game) => game.field.ringCount)).toBe(4);

  await page.keyboard.press("Escape");
  await menuButton(page, "Zpět do menu").click();
  await difficulty(page).selectOption({ label: "Těžká" });
  await menuButton(page, "Hrát").click();
  await expect(panelTitle(page)).toHaveText("Kolo 14");
  expect(await readGame(page, (game) => game.field.ringCount)).toBe(5);
});

test("the keyboard picks a level without steering or starting the game", async ({ page }) => {
  await difficulty(page).focus();
  // With the styled list the first arrow opens it, the next one moves in it.
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Střední" })).toBeVisible();
  await page.keyboard.press("ArrowDown");
  // Enter picks the option; it must not also start the game from the title.
  await page.keyboard.press("Enter");
  await expect(difficulty(page)).toHaveValue("medium");
  await expectScreen(page, "title");
});

test("the open list has the theme's colours", async ({ page }) => {
  await difficulty(page).click();
  const option = page.getByRole("option", { name: "Těžká" });
  await expect(option).toBeVisible();
  // The theme's opaque backdrop, not the browser's white list.
  expect(await option.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(7, 6, 15)");
  await option.click();
  await expect(difficulty(page)).toHaveValue("hard");
});

test("the choice is kept after a reload and shown in the score table", async ({ page }) => {
  await difficulty(page).selectOption({ label: "Střední" });
  await page.reload();
  await expect(difficulty(page)).toHaveValue("medium");

  await menuButton(page, "Hrát").click();
  await page.keyboard.press("Enter");
  await page.keyboard.press("KeyC");
  await expectScreen(page, "roundComplete");
  await page.keyboard.press("Enter");
  const lives = await readGame(page, (game) => game.session.lives);
  for (let life = 0; life < lives; life++) {
    await expectScreen(page, "ready");
    await page.keyboard.press("Enter");
    await expectScreen(page, "playing");
    await page.keyboard.press("KeyK");
  }
  await expect(panelTitle(page)).toHaveText("Konec hry");
  await menuButton(page, "Zpět do menu").click();
  await menuButton(page, "Výsledky").click();
  await expect(page.locator("table.scores tbody tr").first()).toContainText("Střední");
});
