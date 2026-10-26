// Keyboard controls from spec chapter 11. Keys are matched by their physical
// position (event.code), so W and S sit in the same place on Czech and
// English layouts. Touch controls are in touch.ts.

export type KeyCommand = "confirm" | "cancel" | "up" | "down" | "left" | "right" | "debugCrash" | "debugClear";

export type KeyboardHandlers = {
  command(command: KeyCommand): void;
  /** Called whenever the throttle changes between held and released. */
  throttle(held: boolean): void;
};

const COMMAND_KEYS: Record<string, KeyCommand> = {
  Enter: "confirm",
  NumpadEnter: "confirm",
  Space: "confirm",
  Escape: "cancel",
  KeyP: "cancel",
  // Arrows are directions on screen; the game reads them along the gate spoke ahead.
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};
const DEBUG_KEYS: Record<string, KeyCommand> = { KeyK: "debugCrash", KeyC: "debugClear" };
const THROTTLE_KEYS = new Set(["Space", "ShiftLeft", "ShiftRight"]);

export function listenToKeyboard(handlers: KeyboardHandlers, debug: boolean): void {
  // Both Space and Shift work as the throttle; it is held while any of them is down.
  const heldThrottleKeys = new Set<string>();
  const setThrottleKey = (code: string, down: boolean) => {
    const before = heldThrottleKeys.size > 0;
    if (down) heldThrottleKeys.add(code);
    else heldThrottleKeys.delete(code);
    const after = heldThrottleKeys.size > 0;
    if (after !== before) handlers.throttle(after);
  };

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (THROTTLE_KEYS.has(event.code) && !(event.target instanceof HTMLInputElement)) setThrottleKey(event.code, true);
    if (event.repeat) return;
    const command = commandFor(event, debug);
    if (!command) return;
    event.preventDefault();
    handlers.command(command);
  });
  window.addEventListener("keyup", (event) => {
    if (THROTTLE_KEYS.has(event.code)) setThrottleKey(event.code, false);
  });
  // A key released while the window is in the background never sends keyup.
  window.addEventListener("blur", () => {
    for (const code of [...heldThrottleKeys]) setThrottleKey(code, false);
  });
}

function commandFor(event: KeyboardEvent, debug: boolean): KeyCommand | null {
  // Letters typed into a text field (the player name) are not shortcuts.
  if (event.target instanceof HTMLInputElement) return event.code === "Escape" ? "cancel" : null;
  const command = COMMAND_KEYS[event.code] ?? (debug ? DEBUG_KEYS[event.code] : undefined) ?? null;
  // A focused menu button already reacts to Enter and space by itself;
  // handling the key here as well would fire the action twice.
  if (command === "confirm" && event.target instanceof HTMLButtonElement) return null;
  return command;
}
