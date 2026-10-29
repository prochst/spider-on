// Full screen (spec chapter 12): hides the browser's address bar and tabs, so
// a phone gets the whole display for the game. Browsers without the Fullscreen
// API for pages (Safari on the iPhone) never show the button.

const ENTER_LABEL = "Celá obrazovka";
const EXIT_LABEL = "Ukončit celou obrazovku";

// Four corners pointing out; in full screen they point in.
const ENTER_ICON = "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5";
const EXIT_ICON = "M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5";

export function fullscreenSupported(): boolean {
  return document.fullscreenEnabled;
}

export function createFullscreenButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "corner-button fullscreen-button";
  const update = () => {
    const full = document.fullscreenElement !== null;
    const label = full ? EXIT_LABEL : ENTER_LABEL;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${full ? EXIT_ICON : ENTER_ICON}"/></svg>`;
  };
  button.addEventListener("click", () => {
    void toggleFullscreen();
  });
  document.addEventListener("fullscreenchange", update);
  update();
  return button;
}

async function toggleFullscreen(): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  await document.documentElement.requestFullscreen({ navigationUI: "hide" });
  // A phone in full screen can keep landscape even when held upright. Only
  // some browsers allow the lock (Chrome on Android), so a refusal is fine.
  if (window.matchMedia("(pointer: coarse)").matches) {
    await lockLandscape().catch(() => undefined);
  }
}

/** screen.orientation.lock is missing from TypeScript's DOM types, since few browsers have it. */
function lockLandscape(): Promise<void> {
  const orientation = screen.orientation as ScreenOrientation & { lock?: (type: string) => Promise<void> };
  return orientation.lock ? orientation.lock("landscape") : Promise.resolve();
}
