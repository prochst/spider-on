// Keyboard shortcuts for moving between screens (spec chapter 11). Steering
// and the throttle arrive in chapter 2.6.

export type KeyCommand = "confirm" | "cancel" | "debugCrash" | "debugClear";

const CONFIRM_KEYS = new Set(["Enter", " "]);
const CANCEL_KEYS = new Set(["Escape", "p", "P"]);
const DEBUG_KEYS: Record<string, KeyCommand> = { k: "debugCrash", K: "debugCrash", c: "debugClear", C: "debugClear" };

export function listenToKeyboard(onCommand: (command: KeyCommand) => void, debug: boolean): void {
  window.addEventListener("keydown", (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const command = commandFor(event, debug);
    if (!command) return;
    event.preventDefault();
    onCommand(command);
  });
}

function commandFor(event: KeyboardEvent, debug: boolean): KeyCommand | null {
  // Letters typed into a text field (the player name) are not shortcuts.
  if (event.target instanceof HTMLInputElement) return event.key === "Escape" ? "cancel" : null;
  if (CANCEL_KEYS.has(event.key)) return "cancel";
  // A focused menu button already reacts to Enter and space by itself;
  // handling the key here as well would fire the action twice.
  if (event.target instanceof HTMLButtonElement) return null;
  if (CONFIRM_KEYS.has(event.key)) return "confirm";
  return debug ? (DEBUG_KEYS[event.key] ?? null) : null;
}
