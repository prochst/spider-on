// Player settings (spec chapters 10, 12, 13 and 14): name, theme and sound.

import { DEFAULT_PLAYER_NAME, PLAYER_NAME_MAX_LENGTH } from "./config";

export type Settings = {
  name: string;
  /** Id of the chosen look-and-feel theme. */
  themeId: string;
  sound: boolean;
};

export const DEFAULT_SETTINGS: Settings = { name: DEFAULT_PLAYER_NAME, themeId: "neon", sound: true };

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
  };
}
