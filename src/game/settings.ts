// Player settings (spec chapters 6, 10, 12, 13 and 14): name, theme, sound
// and the difficulty setting.

import { DEFAULT_PLAYER_NAME, PLAYER_NAME_MAX_LENGTH, START_ROUND } from "./config";

/**
 * The difficulty setting chosen on the title screen. Not to be confused with
 * the difficulty level of a round (progression.ts): the setting only picks
 * the round a game starts with, the round then decides the level.
 */
export type Difficulty = keyof typeof START_ROUND;
export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value);
}

export type Settings = {
  name: string;
  /** Id of the chosen look-and-feel theme. */
  themeId: string;
  sound: boolean;
  difficulty: Difficulty;
};

export const DEFAULT_SETTINGS: Settings = { name: DEFAULT_PLAYER_NAME, themeId: "neon", sound: true, difficulty: "easy" };

/**
 * Turns what the player typed into a valid name, or null when nothing is
 * left; the settings then keep the previous name.
 */
export function cleanName(input: string): string | null {
  const name = input.trim();
  if (name.length === 0) return null;
  // Array.from counts letters, not UTF-16 halves, so an emoji is not cut in two.
  return Array.from(name).slice(0, PLAYER_NAME_MAX_LENGTH).join("").trim();
}

/** Reads settings saved earlier; every missing or broken value falls back to its default. */
export function parseSettings(data: unknown, themeIds: readonly string[]): Settings {
  const saved = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  const name = typeof saved.name === "string" ? cleanName(saved.name) : null;
  const themeId = typeof saved.themeId === "string" && themeIds.includes(saved.themeId) ? saved.themeId : null;
  return {
    name: name ?? DEFAULT_SETTINGS.name,
    themeId: themeId ?? DEFAULT_SETTINGS.themeId,
    sound: typeof saved.sound === "boolean" ? saved.sound : DEFAULT_SETTINGS.sound,
    difficulty: isDifficulty(saved.difficulty) ? saved.difficulty : DEFAULT_SETTINGS.difficulty,
  };
}
