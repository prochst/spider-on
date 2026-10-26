import { describe, expect, it } from "vitest";
import { SCORE_TABLE_SIZE } from "./config";
import { addScore, bestScore, parseScores, type ScoreEntry } from "./scores";

const game = (score: number, name = "Hráč"): ScoreEntry => ({ name, score, round: 2, date: "2026-10-26" });

/** A full table with scores 1000, 900, …, 100. */
const fullTable = () => Array.from({ length: SCORE_TABLE_SIZE }, (_, i) => game(1000 - i * 100));

describe("addScore", () => {
  it("puts the first game first", () => {
    expect(addScore([], game(120))).toEqual({ table: [game(120)], rank: 1 });
  });

  it("sorts by score and reports the place", () => {
    const { table, rank } = addScore([game(500), game(100)], game(300));
    expect(table.map((e) => e.score)).toEqual([500, 300, 100]);
    expect(rank).toBe(2);
  });

  it("keeps the older game above a new one with the same score", () => {
    const { table, rank } = addScore([game(300, "Starší")], game(300, "Novější"));
    expect(table.map((e) => e.name)).toEqual(["Starší", "Novější"]);
    expect(rank).toBe(2);
  });

  it("keeps only the best ten and drops the last one", () => {
    const { table, rank } = addScore(fullTable(), game(550));
    expect(table).toHaveLength(SCORE_TABLE_SIZE);
    expect(rank).toBe(6);
    expect(table.at(-1)?.score).toBe(200);
  });

  it("leaves a full table alone when the game is not good enough", () => {
    const before = fullTable();
    expect(addScore(before, game(100))).toEqual({ table: before, rank: null });
  });

  it("does not record a game without points", () => {
    expect(addScore([], game(0))).toEqual({ table: [], rank: null });
  });
});

describe("bestScore", () => {
  it("is the top score, or null for an empty table", () => {
    expect(bestScore([])).toBeNull();
    expect(bestScore(fullTable())).toBe(1000);
  });
});

describe("parseScores", () => {
  it("reads back a saved table", () => {
    expect(parseScores(JSON.parse(JSON.stringify(fullTable())))).toEqual(fullTable());
  });

  it("drops broken rows and sorts what is left", () => {
    const data = [game(100), { name: "", score: 50, round: 1, date: "2026-10-26" }, "nonsense", game(400)];
    expect(parseScores(data).map((e) => e.score)).toEqual([400, 100]);
  });

  it("returns an empty table for anything that is not a list", () => {
    expect(parseScores(null)).toEqual([]);
    expect(parseScores({ score: 10 })).toEqual([]);
  });
});
