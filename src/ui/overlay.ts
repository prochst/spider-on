// Menus are HTML on top of the canvas rather than drawn into it: buttons get
// focus, keyboard activation, screen reader support and touch handling from
// the browser for free. The canvas is left for the game itself and the HUD.

import type { Command, Game } from "../game/game";
import { webGrowsAfter } from "../game/progression";
import type { ScreenName } from "../game/screens";
import type { Theme } from "../themes/theme";

type Button = { label: string; command: Command };
/** A line marked for keys or touch shows only with that kind of controls (class "touch" on the root). */
type Line = string | { text: string; only: "keys" | "touch" };
type Panel = { title: string; lines?: Line[]; buttons: Button[] };

function panelFor(game: Game): Panel | null {
  const { session } = game;
  switch (game.screen.name) {
    case "title":
      return {
        title: "SPIDER ON",
        buttons: [
          { label: "Hrát", command: { type: "play" } },
          { label: "Výsledky", command: { type: "openScores" } },
          { label: "Nastavení", command: { type: "openSettings" } },
        ],
      };
    case "scores":
      return {
        title: "Výsledky",
        lines: ["Tabulka výsledků přijde v kapitole 2.7."],
        buttons: [{ label: "Zpět", command: { type: "back" } }],
      };
    case "settings":
      return {
        title: "Nastavení",
        lines: ["Jméno, vzhled a zvuk přijdou v kapitolách 2.5 a 2.7."],
        buttons: [{ label: "Zpět", command: { type: "back" } }],
      };
    case "ready":
      return {
        title: `Kolo ${session.round}`,
        lines: [
          { text: "Enter nebo mezerník spustí kolo", only: "keys" },
          { text: "Klepnutí na pravou polovinu spustí kolo", only: "touch" },
        ],
        buttons: [{ label: "Spustit kolo", command: { type: "start" } }],
      };
    case "paused":
      return {
        title: "Pauza",
        buttons: [
          { label: "Pokračovat", command: { type: "resume" } },
          { label: "Nastavení", command: { type: "openSettings" } },
          { label: "Zpět do menu", command: { type: "quit" } },
        ],
      };
    case "roundComplete":
      return {
        title: `Kolo ${session.round} dokončeno`,
        lines: [
          `Body za mouchy ${session.roundPoints}`,
          `Bonus za kolo ${session.roundBonus}`,
          `Celkové skóre ${session.score}`,
          ...(webGrowsAfter(session.round) ? ["Pavučina se rozrůstá o další kruh!"] : []),
        ],
        buttons: [{ label: "Další kolo", command: { type: "nextRound" } }],
      };
    case "gameOver":
      return {
        title: "Konec hry",
        lines: [`Skóre ${session.score}`, `Dosažené kolo ${session.round}`],
        buttons: [
          { label: "Hrát znovu", command: { type: "play" } },
          { label: "Zpět do menu", command: { type: "quit" } },
        ],
      };
    case "playing":
    case "crash":
      return null;
  }
}

const PAUSABLE: ReadonlySet<ScreenName> = new Set(["ready", "playing", "crash"]);

export type Overlay = {
  /** Rebuilds the menu when the screen has changed since the last call. */
  sync(game: Game): void;
};

export function createOverlay(root: HTMLElement, onCommand: (command: Command) => void): Overlay {
  const panel = document.createElement("div");
  panel.className = "panel";
  const pauseButton = document.createElement("button");
  pauseButton.className = "pause-button";
  pauseButton.type = "button";
  pauseButton.textContent = "II";
  pauseButton.setAttribute("aria-label", "Pauza");
  pauseButton.addEventListener("click", () => {
    pauseButton.blur();
    onCommand({ type: "pause" });
  });
  // Shown by overlay.css only on a touch device held upright.
  const rotateHint = document.createElement("div");
  rotateHint.className = "rotate-hint";
  rotateHint.setAttribute("role", "alert");
  rotateHint.innerHTML = '<span class="rotate-icon" aria-hidden="true"></span><p>Otoč zařízení na šířku</p>';
  root.append(panel, pauseButton, rotateHint);

  let shown: ScreenName | null = null;

  return {
    sync(game) {
      if (game.screen.name === shown) return;
      shown = game.screen.name;
      pauseButton.hidden = !PAUSABLE.has(shown);
      renderPanel(panel, panelFor(game), onCommand);
    },
  };
}

function renderPanel(panel: HTMLElement, content: Panel | null, onCommand: (command: Command) => void): void {
  panel.replaceChildren();
  panel.hidden = content === null;
  if (!content) return;

  const title = document.createElement("h1");
  title.textContent = content.title;
  panel.append(title);
  for (const line of content.lines ?? []) {
    const p = document.createElement("p");
    if (typeof line === "string") {
      p.textContent = line;
    } else {
      p.textContent = line.text;
      p.className = `only-${line.only}`;
    }
    panel.append(p);
  }
  for (const { label, command } of content.buttons) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => onCommand(command));
    panel.append(button);
  }
  // Focus the first button so the keyboard works without reaching for the mouse.
  panel.querySelector("button")?.focus({ preventScroll: true });
}

/** Hands the theme's font and menu colours to the stylesheet as CSS variables. */
export function applyMenuTheme(root: HTMLElement, theme: Theme): void {
  root.style.setProperty("--menu-font", theme.fontFamily);
  for (const [name, value] of Object.entries(theme.menu)) root.style.setProperty(`--menu-${name}`, value);
}
