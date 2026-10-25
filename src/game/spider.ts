// Movement of one spider along the web (spec chapters 5 and 7): steady
// crawling along a ring and climbing to a neighbouring ring on a gate spoke.
// The player and the enemies share this code; they differ only in direction,
// speed and who decides about turns.

import { CROSSING_TIME, GATE_SPOKES, TURN_ZONE } from "./config";
import { normalizeAngle, type Point, ringPoint, ringRadius, SPOKE_STEP } from "./geometry";

/** +1 is clockwise on screen (the angle grows), -1 counterclockwise. */
export type Direction = 1 | -1;
export type Turn = "in" | "out";

export type Crossing = {
  from: number;
  to: number;
  elapsed: number;
  /** The player repeated the turn during this crossing and will climb one more ring. */
  continues: boolean;
};

export type Spider = {
  /** The current ring; during a crossing, the ring being left. */
  ring: number;
  /** Angle in [0, 2π); during a crossing, the angle of the gate spoke. */
  angle: number;
  direction: Direction;
  /** Base speed along the ring in R per second. */
  speed: number;
  /** A turn remembered in the zone before the next gate. */
  pending: Turn | null;
  crossing: Crossing | null;
};

const GATE_STEP = (GATE_SPOKES[1] - GATE_SPOKES[0]) * SPOKE_STEP;
const TIME_EPSILON = 1e-9;

export function createSpider(ring: number, angle: number, direction: Direction, speed: number): Spider {
  return { ring, angle: normalizeAngle(angle), direction, speed, pending: null, crossing: null };
}

function targetRing(ring: number, turn: Turn): number {
  return turn === "in" ? ring - 1 : ring + 1;
}

function isRing(ring: number, ringCount: number): boolean {
  return ring >= 0 && ring < ringCount;
}

/**
 * Angle still to crawl before the next gate spoke ahead, in (0, 90°]. A
 * spider standing exactly on a gate has just left it, so the next gate is a
 * full quarter away; otherwise a turn asked for right after a crossing would
 * start another climb on the same spoke.
 */
export function distanceToGate(spider: Pick<Spider, "angle" | "direction">): number {
  const travelled = spider.direction === 1 ? spider.angle : normalizeAngle(-spider.angle);
  return GATE_STEP - (travelled % GATE_STEP);
}

/**
 * Asks the spider to change ring. Returns whether the request was taken.
 * Outside a crossing the turn is remembered only in the zone before a gate
 * and replaces an earlier one. During a crossing, repeating the same turn
 * climbs one ring further, but not with the throttle held.
 */
export function requestTurn(spider: Spider, turn: Turn, ringCount: number, throttle: boolean): boolean {
  const { crossing } = spider;
  if (crossing) {
    const sameWay = targetRing(crossing.from, turn) === crossing.to;
    const next = targetRing(crossing.to, turn);
    if (throttle || crossing.continues || !sameWay || !isRing(next, ringCount)) return false;
    crossing.continues = true;
    return true;
  }
  if (!isRing(targetRing(spider.ring, turn), ringCount)) return false;
  if (distanceToGate(spider) > TURN_ZONE) return false;
  spider.pending = turn;
  return true;
}

/**
 * Angle the spider crawls in dt seconds. Angular speed from the ring radius
 * keeps the speed along the ring constant. The ring sags a little between
 * spokes, so the true path is about 1 % shorter than the circle; too little
 * to notice in play.
 */
function angularTravel(spider: Spider, dt: number, ringCount: number, speedFactor: number): number {
  return (spider.speed * speedFactor * dt) / ringRadius(spider.ring, ringCount);
}

/** Whether the spider, crawling along its ring, gets to the next gate spoke within dt. */
export function reachesGate(spider: Spider, dt: number, ringCount: number, speedFactor = 1): boolean {
  return !spider.crossing && angularTravel(spider, dt, ringCount, speedFactor) >= distanceToGate(spider);
}

/** Moves the spider by dt seconds; speedFactor is the throttle or a slowdown. */
export function stepSpider(spider: Spider, dt: number, ringCount: number, speedFactor = 1): void {
  if (spider.crossing) {
    stepCrossing(spider, spider.crossing, dt);
    return;
  }
  const travel = angularTravel(spider, dt, ringCount, speedFactor);
  const gateDistance = distanceToGate(spider);
  if (spider.pending && travel >= gateDistance) {
    // The rest of this step (under 1/120 s) is dropped so the climb starts exactly on the spoke.
    spider.angle = normalizeAngle(spider.angle + spider.direction * gateDistance);
    spider.crossing = { from: spider.ring, to: targetRing(spider.ring, spider.pending), elapsed: 0, continues: false };
    spider.pending = null;
    return;
  }
  spider.angle = normalizeAngle(spider.angle + spider.direction * travel);
}

function stepCrossing(spider: Spider, crossing: Crossing, dt: number): void {
  crossing.elapsed += dt;
  // Same floating point tolerance as the crash timer: 0.3 s is not a whole number of steps.
  if (crossing.elapsed < CROSSING_TIME - TIME_EPSILON) return;
  spider.ring = crossing.to;
  if (crossing.continues) {
    const turn: Turn = crossing.to > crossing.from ? "out" : "in";
    spider.crossing = { from: crossing.to, to: targetRing(crossing.to, turn), elapsed: 0, continues: false };
  } else {
    spider.crossing = null;
  }
}

/** Position of the spider's centre in units of R. */
export function spiderPosition(spider: Spider, ringCount: number): Point {
  const { crossing } = spider;
  if (!crossing) return ringPoint(spider.ring, ringCount, spider.angle);
  const t = Math.min(crossing.elapsed / CROSSING_TIME, 1);
  const r = ringRadius(crossing.from, ringCount) * (1 - t) + ringRadius(crossing.to, ringCount) * t;
  return { x: Math.cos(spider.angle) * r, y: Math.sin(spider.angle) * r };
}

/** Angle of the gate spoke the spider is heading for, or climbing on. */
export function headingGateAngle(spider: Spider): number {
  if (spider.crossing) return spider.angle;
  return normalizeAngle(spider.angle + spider.direction * distanceToGate(spider));
}

// A swipe within 45° of the spoke counts; one closer to perpendicular is ignored.
const SWIPE_COS_LIMIT = Math.SQRT1_2;

/**
 * Translates a direction on screen (x right, y down) into a turn on the gate
 * spoke the spider is heading for: along the spoke away from the centre is
 * "out", toward the centre "in", across the spoke nothing (spec chapter 11).
 * The touchpad uses it for swipes, the keyboard for the left and right arrows.
 */
export function turnForDirection(spider: Spider, dx: number, dy: number): Turn | null {
  const length = Math.hypot(dx, dy);
  if (length === 0) return null;
  const gate = headingGateAngle(spider);
  const along = (dx * Math.cos(gate) + dy * Math.sin(gate)) / length;
  if (along >= SWIPE_COS_LIMIT) return "out";
  if (along <= -SWIPE_COS_LIMIT) return "in";
  return null;
}
