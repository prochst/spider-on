// Shared steps for the end-to-end tests. With ?debug the game puts its state
// on window.spiderOn (see main.ts), so a test can check what the logic thinks
// instead of guessing from pixels.

import { expect, type Page } from "@playwright/test";
import type { Game } from "../src/game/game";
import type { ScreenName } from "../src/game/screens";

declare global {
  interface Window {
    spiderOn?: Game;
  }
}

/** Opens the game in debug mode with a fixed seed, so every run plays the same field. */
export async function openGame(page: Page, seed = 1): Promise<void> {
  await page.goto(`./?debug&seed=${seed}`);
  await expect(menuButton(page, "Hrát")).toBeVisible();
}

export function menuButton(page: Page, label: string) {
  return page.locator(".panel").getByRole("button", { name: label, exact: true });
}

export function panelTitle(page: Page) {
  return page.locator(".panel h1");
}

/** Reads one value from the live game state. */
export function readGame<T>(page: Page, pick: (game: Game) => T): Promise<T> {
  return page.evaluate(`(${pick.toString()})(window.spiderOn)`) as Promise<T>;
}

export function screenName(page: Page): Promise<ScreenName> {
  return readGame(page, (game) => game.screen.name);
}

export async function expectScreen(page: Page, name: ScreenName): Promise<void> {
  await expect.poll(() => screenName(page)).toBe(name);
}
