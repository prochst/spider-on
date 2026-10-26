// The table of the best games (spec chapter 10). Plain data in, plain data
// out: the browser layer adds the date and keeps the table in localStorage.

import { PLAYER_NAME_MAX_LENGTH, SCORE_TABLE_SIZE } from "./config";

export type ScoreEntry = {
  name: string;
  score: number;
  round: number;
  /** Day the game ended, as YYYY-MM-DD in the player's time zone. */
  date: string;
};

export type ScoreResult = {
  table: ScoreEntry[];
  /** Place in the new table counted from 1, or null when the game did not make it. */
  rank: number | null;
};

/** Adds a finished game. On equal scores the older game stays above, so a new one has to beat it. */
export function addScore(table: readonly ScoreEntry[], entry: ScoreEntry): ScoreResult {
  if (entry.score <= 0) return { table: [...table], rank: null };
  const index = table.findIndex((other) => entry.score > other.score);
  const position = index === -1 ? table.length : index;
  if (position >= SCORE_TABLE_SIZE) return { table: [...table], rank: null };
  const next = [...table.slice(0, position), entry, ...table.slice(position)].slice(0, SCORE_TABLE_SIZE);
  return { table: next, rank: position + 1 };
}

export function bestScore(table: readonly ScoreEntry[]): number | null {
  return table[0]?.score ?? null;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== "object" || value === null) return false;
  const { name, score, round, date } = value as Record<string, unknown>;
  return (
    typeof name === "string" &&
    name.length > 0 &&
    Array.from(name).length <= PLAYER_NAME_MAX_LENGTH &&
    Number.isInteger(score) &&
    (score as number) > 0 &&
    Number.isInteger(round) &&
    (round as number) >= 1 &&
    typeof date === "string" &&
    DATE.test(date)
  );
}

/**
 * Reads a table saved earlier. Anything stored can be damaged or come from an
 * older version, so broken rows are dropped instead of breaking the game.
 */
export function parseScores(data: unknown): ScoreEntry[] {
  if (!Array.isArray(data)) return [];
  const entries = data.filter(isEntry).map(({ name, score, round, date }) => ({ name, score, round, date }));
  // Re-adding the rows one by one restores the order and the size limit.
  return entries.reduce<ScoreEntry[]>((table, entry) => addScore(table, entry).table, []);
}
