import { describe, expect, it } from "vitest";
import { cleanName, DEFAULT_SETTINGS, parseSettings } from "./settings";

describe("cleanName", () => {
  it("trims spaces and keeps at most 16 letters", () => {
    expect(cleanName("  Standa  ")).toBe("Standa");
    expect(cleanName("Příliš žluťoučký kůň")).toBe("Příliš žluťoučký");
  });

  it("counts an emoji as one letter", () => {
    expect(cleanName("🕷".repeat(20))).toBe("🕷".repeat(16));
  });

  it("returns null when nothing is left", () => {
    expect(cleanName("   ")).toBeNull();
  });
});

describe("parseSettings", () => {
  const themes = ["neon"];

  it("reads back saved settings", () => {
    const saved = { name: "Standa", themeId: "neon", sound: false };
    expect(parseSettings(saved, themes)).toEqual(saved);
  });

  it("falls back to the defaults for missing or broken values", () => {
    expect(parseSettings(null, themes)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings({ name: " ", themeId: "unknown", sound: "yes" }, themes)).toEqual(DEFAULT_SETTINGS);
  });
});
