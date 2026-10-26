// Real touch events for the phone tests. Playwright's page.touchscreen only
// taps; the game needs fingers that stay down and slide, and two of them at
// once. Chrome's DevTools protocol (Input.dispatchTouchEvent) can do that, so
// the events go through the same path as a finger on a phone. Each event
// lists every finger that is down at that moment.

import type { CDPSession, Page } from "@playwright/test";

type Point = { x: number; y: number };

export class TouchScreen {
  private readonly fingers = new Map<number, Point>();
  private nextId = 1;

  private constructor(private readonly session: CDPSession) {}

  static async open(page: Page): Promise<TouchScreen> {
    return new TouchScreen(await page.context().newCDPSession(page));
  }

  /** Puts a finger down and returns its id for move() and up(). */
  async down(at: Point): Promise<number> {
    const id = this.nextId++;
    this.fingers.set(id, at);
    await this.send("touchStart");
    return id;
  }

  /** Slides a finger in small steps, as a thumb would, rather than jumping. */
  async move(id: number, to: Point, steps = 8): Promise<void> {
    const from = this.fingers.get(id);
    if (!from) throw new Error(`Finger ${id} is not down`);
    for (let i = 1; i <= steps; i++) {
      this.fingers.set(id, { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps });
      await this.send("touchMove");
    }
  }

  async up(id: number): Promise<void> {
    const at = this.fingers.get(id);
    if (!at) throw new Error(`Finger ${id} is not down`);
    this.fingers.delete(id);
    // Chrome compares each event with the previous one and releases the
    // fingers that went missing. touchEnd must list no fingers and so lifts
    // all of them; with another finger still down, a move does the job.
    await this.send(this.fingers.size > 0 ? "touchMove" : "touchEnd");
  }

  async tap(at: Point): Promise<void> {
    await this.up(await this.down(at));
  }

  async swipe(from: Point, to: Point): Promise<void> {
    const id = await this.down(from);
    await this.move(id, to);
    await this.up(id);
  }

  private async send(type: "touchStart" | "touchMove" | "touchEnd"): Promise<void> {
    const touchPoints = [...this.fingers].map(([id, { x, y }]) => ({ id, x, y }));
    await this.session.send("Input.dispatchTouchEvent", { type, touchPoints });
  }
}
