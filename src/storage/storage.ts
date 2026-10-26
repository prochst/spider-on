// Keeps the settings and the score table in localStorage (spec chapter 10).
// Storage can be missing or full (private windows, blocked site data), so
// every read and write may fail; the game then simply carries on without it.

import { parseScores, type ScoreEntry } from "../game/scores";
import { parseSettings, type Settings } from "../game/settings";

const SETTINGS_KEY = "spider-on.settings";
const SCORES_KEY = "spider-on.scores";

function read(key: string): unknown {
  try {
    const text = window.localStorage.getItem(key);
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing to do: the values stay in memory until the page closes.
  }
}

export function loadSettings(themeIds: readonly string[]): Settings {
  return parseSettings(read(SETTINGS_KEY), themeIds);
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings);
}

export function loadScores(): ScoreEntry[] {
  return parseScores(read(SCORES_KEY));
}

export function saveScores(table: readonly ScoreEntry[]): void {
  write(SCORES_KEY, table);
}

/** Today's date as YYYY-MM-DD in the player's time zone, for the score table. */
export function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
