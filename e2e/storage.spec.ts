// Settings and the score table survive a reload (spec chapters 10 and 12).

import { expect, test } from "@playwright/test";
import { expectScreen, menuButton, openGame, panelTitle, readGame } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openGame(page);
});

test("settings are saved right away and kept after a reload", async ({ page }) => {
  await menuButton(page, "Nastavení").click();
  await page.getByLabel("Jméno").fill("Tester");
  await page.getByLabel("Jméno").press("Enter");
  await page.getByLabel("Zvuk").uncheck();
  await menuButton(page, "Zpět").click();

  await page.reload();
  await menuButton(page, "Nastavení").click();
  await expect(page.getByLabel("Jméno")).toHaveValue("Tester");
  await expect(page.getByLabel("Zvuk")).not.toBeChecked();
});

test("a finished game lands in the score table", async ({ page }) => {
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  // A game with zero points does not enter the table, so clear one round first.
  await page.keyboard.press("KeyC");
  await expectScreen(page, "roundComplete");
  await page.keyboard.press("Enter");

  // Debug shortcut K crashes the spider; three crashes end the game.
  const lives = await readGame(page, (game) => game.session.lives);
  for (let life = 0; life < lives; life++) {
    await expectScreen(page, "ready");
    await page.keyboard.press("Enter");
    await expectScreen(page, "playing");
    await page.keyboard.press("KeyK");
  }
  await expect(panelTitle(page)).toHaveText("Konec hry");
  await expect(page.locator(".panel")).toContainText("1. místo v tabulce výsledků");

  await page.reload();
  await expect(page.locator(".panel")).toContainText("Nejlepší skóre");
  await menuButton(page, "Výsledky").click();
  await expect(page.locator("table.scores tbody tr")).toHaveCount(1);
});
