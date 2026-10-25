import { describe, expect, it } from "vitest";
import { CRASH_DURATION } from "./config";
import {
  cancelEvent,
  confirmEvent,
  type Screen,
  type ScreenEvent,
  TITLE,
  tickScreen,
  transition,
} from "./screens";

function run(screen: Screen, ...events: ScreenEvent[]): Screen {
  return events.reduce(transition, screen);
}

const ALL_EVENTS: ScreenEvent[] = [
  { type: "play" },
  { type: "openScores" },
  { type: "openSettings" },
  { type: "back" },
  { type: "start" },
  { type: "pause" },
  { type: "resume" },
  { type: "quit" },
  { type: "crash", lastLife: false },
  { type: "roundCleared" },
  { type: "nextRound" },
];

describe("transition", () => {
  it("goes from the title through a round and back to the title", () => {
    const screen = run(
      TITLE,
      { type: "play" },
      { type: "start" },
      { type: "roundCleared" },
      { type: "nextRound" },
      { type: "start" },
      { type: "pause" },
      { type: "quit" },
    );
    expect(screen).toEqual(TITLE);
  });

  it("waits for the player before each round", () => {
    expect(run(TITLE, { type: "play" }).name).toBe("ready");
    expect(run(TITLE, { type: "play" }, { type: "start" }, { type: "roundCleared" }, { type: "nextRound" }).name).toBe(
      "ready",
    );
  });

  it("opens scores and settings from the title and returns there", () => {
    expect(run(TITLE, { type: "openScores" }, { type: "back" })).toEqual(TITLE);
    expect(run(TITLE, { type: "openSettings" }, { type: "back" })).toEqual(TITLE);
  });

  it("returns from settings opened in the pause menu to the pause menu", () => {
    const paused = run(TITLE, { type: "play" }, { type: "start" }, { type: "pause" });
    const back = run(paused, { type: "openSettings" }, { type: "back" });
    expect(back).toBe(paused);
    expect(transition(back, { type: "resume" }).name).toBe("playing");
  });

  it("resumes the screen that was paused", () => {
    const ready = run(TITLE, { type: "play" });
    expect(run(ready, { type: "pause" }, { type: "resume" })).toBe(ready);

    const crashing = run(ready, { type: "start" }, { type: "crash", lastLife: false });
    expect(run(crashing, { type: "pause" }, { type: "resume" })).toBe(crashing);
  });

  it("does not pause menus or finished rounds", () => {
    for (const screen of [TITLE, run(TITLE, { type: "openScores" }), { name: "roundComplete" } as Screen]) {
      expect(transition(screen, { type: "pause" })).toBe(screen);
    }
  });

  it("ignores events that do not belong to the screen by returning the same object", () => {
    const playing = run(TITLE, { type: "play" }, { type: "start" });
    const ignored = ALL_EVENTS.filter((e) => !["pause", "crash", "roundCleared"].includes(e.type));
    for (const event of ignored) expect(transition(playing, event)).toBe(playing);
  });

  it("offers a new game or the menu after game over", () => {
    const over: Screen = { name: "gameOver" };
    expect(transition(over, { type: "play" }).name).toBe("ready");
    expect(transition(over, { type: "quit" })).toEqual(TITLE);
  });
});

describe("tickScreen", () => {
  const crashing = (lastLife: boolean): Screen => ({ name: "crash", timeLeft: CRASH_DURATION, lastLife });

  it("plays the crash animation for its full length", () => {
    const screen = tickScreen(crashing(false), CRASH_DURATION - 0.01);
    expect(screen.name).toBe("crash");
  });

  it("waits for the player again after a crash with lives left", () => {
    expect(tickScreen(crashing(false), CRASH_DURATION).name).toBe("ready");
  });

  it("ends the game after a crash on the last life", () => {
    expect(tickScreen(crashing(true), CRASH_DURATION).name).toBe("gameOver");
  });

  it("leaves other screens alone", () => {
    expect(tickScreen(TITLE, 1)).toBe(TITLE);
  });
});

describe("keyboard shortcuts", () => {
  it("never maps confirm or cancel to an event the screen would ignore", () => {
    const screens: Screen[] = [
      TITLE,
      { name: "scores" },
      { name: "settings", back: TITLE },
      { name: "ready" },
      { name: "playing" },
      { name: "crash", timeLeft: 1, lastLife: false },
      { name: "roundComplete" },
      { name: "paused", resume: { name: "playing" } },
      { name: "gameOver" },
    ];
    for (const screen of screens) {
      for (const event of [confirmEvent(screen), cancelEvent(screen)]) {
        if (event) expect(transition(screen, event)).not.toBe(screen);
      }
    }
  });

  it("toggles pause with the same key", () => {
    const playing: Screen = { name: "playing" };
    const pause = cancelEvent(playing);
    expect(pause).not.toBeNull();
    const paused = transition(playing, pause!);
    expect(transition(paused, cancelEvent(paused)!)).toBe(playing);
  });
});
