// Menus are HTML on top of the canvas rather than drawn into it: buttons get
// focus, keyboard activation, screen reader support and touch handling from
// the browser for free. The canvas is left for the game itself and the HUD.

import { PLAYER_NAME_MAX_LENGTH } from "../game/config";
import type { Command, Game } from "../game/game";
import { webGrowsAfter } from "../game/progression";
import { bestScore, type ScoreEntry } from "../game/scores";
import type { ScreenName } from "../game/screens";
import { cleanName, DIFFICULTIES, type Difficulty, type Settings } from "../game/settings";
import type { Theme } from "../themes/theme";
import { createFullscreenButton, fullscreenSupported } from "./fullscreen";

/** What the menus show besides the game itself; main.ts owns it. */
export type MenuData = {
  settings: Settings;
  scores: readonly ScoreEntry[];
  /** Place of the game that just ended in the score table, null when it did not make it. */
  lastRank: number | null;
  themes: readonly { id: string; name: string }[];
  /** Switches to a new version that is ready; null while there is none (spec chapter 15). */
  update: (() => void) | null;
};

export type OverlayHandlers = {
  command(command: Command): void;
  /** The player changed a setting; it applies and is saved right away (spec chapter 12). */
  settings(change: Partial<Settings>): void;
};

type Button = { label: string; command: Command };
/** A line marked for keys or touch shows only with that kind of controls (class "touch" on the root). */
type Line = string | { text: string; only: "keys" | "touch" };
type Panel = {
  title: string;
  lines?: Line[];
  /** A form or a table between the lines and the buttons. */
  body?: HTMLElement;
  buttons: Button[];
  /** A small line under the buttons. */
  footer?: string;
  /** Offers a new version under the footer. */
  update?: () => void;
};

function panelFor(game: Game, data: MenuData, handlers: OverlayHandlers): Panel | null {
  const { session } = game;
  switch (game.screen.name) {
    case "title": {
      const best = bestScore(data.scores);
      return {
        title: "SPIDER ON",
        lines: best === null ? [] : [`Nejlepší skóre ${best}`],
        body: difficultyChoice(data, handlers),
        footer: `verze ${__APP_VERSION__}`,
        update: data.update ?? undefined,
        buttons: [
          { label: "Hrát", command: { type: "play" } },
          { label: "Výsledky", command: { type: "openScores" } },
          { label: "Nastavení", command: { type: "openSettings" } },
        ],
      };
    }
    case "scores":
      return {
        title: "Výsledky",
        lines: data.scores.length === 0 ? ["Zatím žádné výsledky. Zahraj si!"] : [],
        body: data.scores.length === 0 ? undefined : scoreTable(data.scores),
        buttons: [{ label: "Zpět", command: { type: "back" } }],
      };
    case "settings":
      return {
        title: "Nastavení",
        body: settingsForm(data, handlers),
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
        lines: [
          `Skóre ${session.score}`,
          `Dosažené kolo ${session.round}`,
          data.lastRank === null
            ? "Do tabulky výsledků to tentokrát nestačilo."
            : `${data.lastRank}. místo v tabulce výsledků`,
        ],
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
  /** Rebuilds the menu of the current screen, after the menu data changed. */
  refresh(game: Game): void;
};

export function createOverlay(root: HTMLElement, menuData: () => MenuData, handlers: OverlayHandlers): Overlay {
  const panel = document.createElement("div");
  panel.className = "panel";
  const pauseButton = document.createElement("button");
  pauseButton.className = "corner-button";
  pauseButton.type = "button";
  pauseButton.textContent = "II";
  pauseButton.setAttribute("aria-label", "Pauza");
  pauseButton.addEventListener("click", () => {
    pauseButton.blur();
    handlers.command({ type: "pause" });
  });
  // Shown by overlay.css only on a touch device held upright.
  const rotateHint = document.createElement("div");
  rotateHint.className = "rotate-hint";
  rotateHint.setAttribute("role", "alert");
  rotateHint.innerHTML = '<span class="rotate-icon" aria-hidden="true"></span><p>Otoč zařízení na šířku</p>';
  // In the same corner as pause, for the screens where the game does not run.
  const fullscreenButton = createFullscreenButton();
  fullscreenButton.addEventListener("click", () => {
    // Enter would otherwise press this button again instead of the menu's main choice.
    fullscreenButton.blur();
    panel.querySelector("button")?.focus({ preventScroll: true });
  });
  root.append(panel, pauseButton, fullscreenButton, rotateHint);

  let shown: ScreenName | null = null;

  const show = (game: Game) => {
    shown = game.screen.name;
    pauseButton.hidden = !PAUSABLE.has(shown);
    fullscreenButton.hidden = !pauseButton.hidden || !fullscreenSupported();
    renderPanel(panel, panelFor(game, menuData(), handlers), handlers.command);
  };

  return {
    sync(game) {
      if (game.screen.name !== shown) show(game);
    },
    refresh: show,
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
  if (content.body) panel.append(content.body);
  for (const { label, command } of content.buttons) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => onCommand(command));
    panel.append(button);
  }
  if (content.footer) {
    const footer = document.createElement("p");
    footer.className = "footer";
    footer.textContent = content.footer;
    panel.append(footer);
  }
  if (content.update) panel.append(updateOffer(content.update));
  // Focus the first button so the keyboard works without reaching for the mouse.
  panel.querySelector("button")?.focus({ preventScroll: true });
}

/** Spec chapter 15: only on the title screen, so it never interrupts a game. */
function updateOffer(apply: () => void): HTMLElement {
  const offer = document.createElement("div");
  offer.className = "update";
  offer.setAttribute("role", "status");
  const text = document.createElement("span");
  text.textContent = "Je dostupná nová verze.";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Aktualizovat";
  button.addEventListener("click", () => {
    button.disabled = true;
    apply();
  });
  offer.append(text, button);
  return offer;
}

function scoreTable(scores: readonly ScoreEntry[]): HTMLElement {
  const table = document.createElement("table");
  table.className = "scores";
  const head = table.createTHead().insertRow();
  for (const label of ["#", "Jméno", "Skóre", "Úroveň", "Kolo", "Datum"]) {
    const th = document.createElement("th");
    th.textContent = label;
    head.append(th);
  }
  const body = table.createTBody();
  scores.forEach((entry, i) => {
    const row = body.insertRow();
    const cells = [
      `${i + 1}.`,
      entry.name,
      String(entry.score),
      DIFFICULTY_LABELS[entry.difficulty],
      String(entry.round),
      czechDate(entry.date),
    ];
    for (const text of cells) {
      row.insertCell().textContent = text;
    }
  });
  return table;
}

/** 2026-10-26 → 26. 10. 2026, the way dates are written in Czech. */
function czechDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${day}. ${month}. ${year}`;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: "Lehká", medium: "Střední", hard: "Těžká" };

/** The difficulty setting on the title screen (spec chapters 6 and 12); it is saved like the other settings. */
function difficultyChoice(data: MenuData, handlers: OverlayHandlers): HTMLElement {
  const select = document.createElement("select");
  for (const id of DIFFICULTIES) {
    select.add(new Option(DIFFICULTY_LABELS[id], id, false, id === data.settings.difficulty));
  }
  select.addEventListener("change", () => {
    const difficulty = DIFFICULTIES.find((id) => id === select.value);
    if (difficulty) handlers.settings({ difficulty });
  });
  const wrapper = field("Úroveň obtížnosti", select);
  wrapper.classList.add("difficulty");
  return wrapper;
}

function settingsForm(data: MenuData, handlers: OverlayHandlers): HTMLElement {
  const { settings } = data;
  const form = document.createElement("form");
  form.className = "settings";

  const name = document.createElement("input");
  name.type = "text";
  name.value = settings.name;
  name.maxLength = PLAYER_NAME_MAX_LENGTH;
  name.autocomplete = "off";
  name.spellcheck = false;
  let saved = settings.name;
  // "change" fires when the field loses focus or Enter is pressed: the name is final then, not at every letter.
  name.addEventListener("change", () => {
    const cleaned = cleanName(name.value);
    name.value = cleaned ?? saved;
    if (cleaned === null) return;
    saved = cleaned;
    handlers.settings({ name: cleaned });
  });
  // Enter in the field would submit the form and reload the page.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    name.blur();
  });

  const theme = document.createElement("select");
  for (const { id, name: label } of data.themes) theme.add(new Option(label, id, false, id === settings.themeId));
  theme.addEventListener("change", () => handlers.settings({ themeId: theme.value }));

  const sound = document.createElement("input");
  sound.type = "checkbox";
  sound.checked = settings.sound;
  sound.addEventListener("change", () => handlers.settings({ sound: sound.checked }));

  form.append(field("Jméno", name), field("Vzhled", theme), field("Zvuk", sound));
  return form;
}

function field(label: string, control: HTMLElement): HTMLElement {
  const wrapper = document.createElement("label");
  wrapper.className = "field";
  const text = document.createElement("span");
  text.textContent = label;
  wrapper.append(text, control);
  return wrapper;
}

/** Hands the theme's font and menu colours to the stylesheet as CSS variables. */
export function applyMenuTheme(root: HTMLElement, theme: Theme): void {
  root.style.setProperty("--menu-font", theme.fontFamily);
  for (const [name, value] of Object.entries(theme.menu)) root.style.setProperty(`--menu-${name}`, value);
}
