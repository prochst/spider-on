import { describe, expect, it } from "vitest";
import { CROSSING_TIME, FIXED_STEP, PLAYER_SPEED, THROTTLE_FACTOR, TURN_ZONE } from "./config";
import { normalizeAngle, ringRadius } from "./geometry";
import {
  createSpider,
  distanceToGate,
  requestTurn,
  type Spider,
  spiderPosition,
  stepSpider,
  turnForDirection,
} from "./spider";

const RINGS = 3;
const DEG = Math.PI / 180;

/** The player crawls counterclockwise, so the angle falls; 90° is the bottom gate. */
function player(ring = 2, angleDeg = 120): Spider {
  return createSpider(ring, angleDeg * DEG, -1, PLAYER_SPEED);
}

function run(spider: Spider, seconds: number, speedFactor = 1): void {
  const steps = Math.round(seconds / FIXED_STEP);
  for (let i = 0; i < steps; i++) stepSpider(spider, FIXED_STEP, RINGS, speedFactor);
}

/** Runs until the spider is on a ring again after climbing. */
function runUntilCrawling(spider: Spider): void {
  for (let i = 0; i < 1000 && (spider.pending || spider.crossing); i++) stepSpider(spider, FIXED_STEP, RINGS);
}

describe("crawling", () => {
  it("keeps a constant speed along the ring, so inner laps are quicker", () => {
    const outer = player(2, 0);
    const inner = player(0, 0);
    run(outer, 1);
    run(inner, 1);
    const turned = (s: Spider) => normalizeAngle(-s.angle);
    expect(turned(outer)).toBeCloseTo(PLAYER_SPEED / ringRadius(2, RINGS));
    expect(turned(inner)).toBeCloseTo(PLAYER_SPEED / ringRadius(0, RINGS));
  });

  it("moves counterclockwise for the player and clockwise for enemies", () => {
    const p = player(1, 45);
    const e = createSpider(1, 45 * DEG, 1, PLAYER_SPEED);
    run(p, 0.1);
    run(e, 0.1);
    expect(p.angle).toBeLessThan(45 * DEG);
    expect(e.angle).toBeGreaterThan(45 * DEG);
  });

  it("goes faster with the throttle", () => {
    const plain = player(2, 0);
    const fast = player(2, 0);
    run(plain, 0.5);
    run(fast, 0.5, THROTTLE_FACTOR);
    expect(normalizeAngle(-fast.angle)).toBeCloseTo(normalizeAngle(-plain.angle) * THROTTLE_FACTOR);
  });

  it("passes gates without a turn", () => {
    const p = player(2, 95);
    run(p, 0.5);
    expect(p.ring).toBe(2);
    expect(p.angle).toBeLessThan(90 * DEG);
  });
});

describe("distanceToGate", () => {
  it("measures ahead in the direction of travel", () => {
    expect(distanceToGate({ angle: 100 * DEG, direction: -1 })).toBeCloseTo(10 * DEG);
    expect(distanceToGate({ angle: 100 * DEG, direction: 1 })).toBeCloseTo(80 * DEG);
  });

  it("looks to the next gate when standing on one", () => {
    expect(distanceToGate({ angle: 90 * DEG, direction: -1 })).toBeCloseTo(90 * DEG);
    expect(distanceToGate({ angle: 0, direction: 1 })).toBeCloseTo(90 * DEG);
  });
});

describe("requestTurn", () => {
  const ZONE_DEG = TURN_ZONE / DEG;

  it("ignores a turn asked for before the zone", () => {
    const p = player(2, 90 + ZONE_DEG + 1);
    expect(requestTurn(p, "in", RINGS, false)).toBe(false);
    expect(p.pending).toBeNull();
  });

  it("remembers a turn inside the zone and climbs on reaching the gate", () => {
    const p = player(2, 90 + ZONE_DEG - 1);
    expect(requestTurn(p, "in", RINGS, false)).toBe(true);
    runUntilCrawling(p);
    expect(p.ring).toBe(1);
  });

  it("starts the climb exactly on the gate spoke", () => {
    const p = player(2, 90 + 5);
    requestTurn(p, "in", RINGS, false);
    for (let i = 0; i < 1000 && !p.crossing; i++) stepSpider(p, FIXED_STEP, RINGS);
    expect(p.angle).toBe(Math.PI / 2);
  });

  it("lets an opposite turn in the same zone replace the first", () => {
    const p = player(1, 90 + 10);
    requestTurn(p, "in", RINGS, false);
    requestTurn(p, "out", RINGS, false);
    runUntilCrawling(p);
    expect(p.ring).toBe(2);
  });

  it("ignores turns off the web", () => {
    expect(requestTurn(player(2, 95), "out", RINGS, false)).toBe(false);
    expect(requestTurn(player(0, 95), "in", RINGS, false)).toBe(false);
  });

  it("takes one crossing time per ring and stays on the spoke meanwhile", () => {
    const p = player(2, 91);
    requestTurn(p, "in", RINGS, false);
    for (let i = 0; i < 1000 && !p.crossing; i++) stepSpider(p, FIXED_STEP, RINGS);
    run(p, CROSSING_TIME - FIXED_STEP);
    expect(p.crossing).not.toBeNull();
    expect(p.angle).toBe(Math.PI / 2);
    run(p, FIXED_STEP);
    expect(p.crossing).toBeNull();
    expect(p.ring).toBe(1);
  });

  it("climbs two rings when the turn is repeated during the climb", () => {
    const p = player(2, 91);
    requestTurn(p, "in", RINGS, false);
    for (let i = 0; i < 1000 && !p.crossing; i++) stepSpider(p, FIXED_STEP, RINGS);
    expect(requestTurn(p, "in", RINGS, false)).toBe(true);
    runUntilCrawling(p);
    expect(p.ring).toBe(0);
  });

  it("climbs at most two rings at one gate", () => {
    const p = createSpider(0, 91 * DEG, -1, PLAYER_SPEED);
    requestTurn(p, "out", 5, false);
    for (let i = 0; i < 1000 && !p.crossing; i++) stepSpider(p, FIXED_STEP, 5);
    expect(requestTurn(p, "out", 5, false)).toBe(true);
    expect(requestTurn(p, "out", 5, false)).toBe(false);
    for (let i = 0; i < 1000 && p.crossing; i++) stepSpider(p, FIXED_STEP, 5);
    expect(p.ring).toBe(2);
    // Standing on the spoke right after the climb, the next gate is a quarter away.
    expect(requestTurn(p, "out", 5, false)).toBe(false);
  });

  it("climbs only one ring with the throttle held", () => {
    const p = player(2, 91);
    requestTurn(p, "in", RINGS, true);
    for (let i = 0; i < 1000 && !p.crossing; i++) stepSpider(p, FIXED_STEP, RINGS, THROTTLE_FACTOR);
    expect(requestTurn(p, "in", RINGS, true)).toBe(false);
    runUntilCrawling(p);
    expect(p.ring).toBe(1);
  });

  it("does not turn back during a climb", () => {
    const p = player(1, 91);
    requestTurn(p, "in", RINGS, false);
    for (let i = 0; i < 1000 && !p.crossing; i++) stepSpider(p, FIXED_STEP, RINGS);
    expect(requestTurn(p, "out", RINGS, false)).toBe(false);
  });

  it("works on every gate in both directions", () => {
    for (const gateDeg of [0, 90, 180, 270]) {
      for (const direction of [1, -1] as const) {
        const s = createSpider(1, (gateDeg - direction * 5) * DEG, direction, PLAYER_SPEED);
        expect(requestTurn(s, "out", RINGS, false)).toBe(true);
        for (let i = 0; i < 1000 && (s.pending || s.crossing); i++) stepSpider(s, FIXED_STEP, RINGS);
        expect(s.ring).toBe(2);
        expect(s.angle).toBe(normalizeAngle(gateDeg * DEG));
        // No floating point sliver may leave the spider just short of the gate it climbed on.
        expect(distanceToGate(s)).toBe(Math.PI / 2);
      }
    }
  });
});

describe("spiderPosition", () => {
  it("lies on the ring while crawling", () => {
    const p = player(1, 90);
    const pos = spiderPosition(p, RINGS);
    expect(Math.hypot(pos.x, pos.y)).toBeCloseTo(ringRadius(1, RINGS));
  });

  it("moves along the spoke during a climb", () => {
    const p = player(2, 91);
    requestTurn(p, "in", RINGS, false);
    for (let i = 0; i < 1000 && !p.crossing; i++) stepSpider(p, FIXED_STEP, RINGS);
    run(p, CROSSING_TIME / 2);
    const pos = spiderPosition(p, RINGS);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.y).toBeCloseTo((ringRadius(2, RINGS) + ringRadius(1, RINGS)) / 2);
  });
});

describe("turnForDirection", () => {
  const towardGate = (gateDeg: number) => createSpider(1, (gateDeg + 10) * DEG, -1, PLAYER_SPEED);

  it("reads a screen direction along the spoke the spider heads for", () => {
    // Right gate: right is out, left is in.
    expect(turnForDirection(towardGate(0), 1, 0)).toBe("out");
    expect(turnForDirection(towardGate(0), -1, 0)).toBe("in");
    // Left gate: the other way round.
    expect(turnForDirection(towardGate(180), -1, 0)).toBe("out");
    expect(turnForDirection(towardGate(180), 1, 0)).toBe("in");
    // Top gate (270°): up is out.
    expect(turnForDirection(towardGate(270), 0, -1)).toBe("out");
    expect(turnForDirection(towardGate(270), 0, 1)).toBe("in");
    // Bottom gate (90°): down is out, up is in.
    expect(turnForDirection(towardGate(90), 0, 1)).toBe("out");
    expect(turnForDirection(towardGate(90), 0, -1)).toBe("in");
  });

  it("ignores directions across the spoke", () => {
    expect(turnForDirection(towardGate(0), 0, 1)).toBeNull();
    expect(turnForDirection(towardGate(90), 1, 0.2)).toBeNull();
    expect(turnForDirection(towardGate(0), 0, 0)).toBeNull();
  });

  it("uses the spoke being climbed during a crossing", () => {
    const s = createSpider(2, 1 * DEG, -1, PLAYER_SPEED);
    requestTurn(s, "in", RINGS, false);
    while (!s.crossing) stepSpider(s, FIXED_STEP, RINGS);
    expect(turnForDirection(s, -1, 0)).toBe("in");
  });
});
