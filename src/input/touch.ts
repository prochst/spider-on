// Touch controls from spec chapter 11: the right half of the screen is the
// touchpad, the left half the throttle button. Pointer events give every
// finger its own id, so both thumbs work at the same time.

import { beginGesture, endGesture, type Gesture, moveGesture, type Swipe } from "./gesture";

export type TouchHandlers = {
  /** A swipe on the touchpad, as a direction on screen (x right, y down). */
  swipe(swipe: Swipe): void;
  /** A tap on the touchpad. */
  tap(): void;
  /** Called whenever the throttle changes between held and released. */
  throttle(held: boolean): void;
  /** The first touch; the game shows the touch controls from then on. */
  firstTouch(): void;
};

/** What the touch controls show; the renderer reads it, only this module writes it. */
export type TouchState = {
  throttleHeld: boolean;
  padHeld: boolean;
  /** The last swipe and when it came (seconds, the clock of performance.now), for a short arrow on the pad. */
  lastSwipe: { swipe: Swipe; time: number } | null;
};

type Finger = { role: "throttle" } | { role: "pad"; gesture: Gesture };

const seconds = (event: PointerEvent) => event.timeStamp / 1000;

export function listenToTouch(surface: HTMLElement, handlers: TouchHandlers): TouchState {
  const state: TouchState = { throttleHeld: false, padHeld: false, lastSwipe: null };
  const fingers = new Map<number, Finger>();
  let touched = false;

  const refresh = () => {
    const roles = [...fingers.values()].map((finger) => finger.role);
    const throttleHeld = roles.includes("throttle");
    if (throttleHeld !== state.throttleHeld) handlers.throttle(throttleHeld);
    state.throttleHeld = throttleHeld;
    state.padHeld = roles.includes("pad");
  };

  surface.addEventListener("pointerdown", (event) => {
    // The mouse keeps working as before: clicks on the canvas do nothing.
    if (event.pointerType === "mouse") return;
    if (!touched) {
      touched = true;
      handlers.firstTouch();
    }
    event.preventDefault();
    surface.setPointerCapture(event.pointerId);
    const at = { x: event.clientX, y: event.clientY };
    const onLeft = event.clientX < surface.clientWidth / 2;
    fingers.set(event.pointerId, onLeft ? { role: "throttle" } : { role: "pad", gesture: beginGesture(at, seconds(event)) });
    refresh();
  });

  surface.addEventListener("pointermove", (event) => {
    const finger = fingers.get(event.pointerId);
    if (finger?.role !== "pad") return;
    const swipe = moveGesture(finger.gesture, { x: event.clientX, y: event.clientY });
    if (!swipe) return;
    state.lastSwipe = { swipe, time: performance.now() / 1000 };
    handlers.swipe(swipe);
  });

  const lift = (event: PointerEvent, cancelled: boolean) => {
    const finger = fingers.get(event.pointerId);
    if (!finger) return;
    fingers.delete(event.pointerId);
    if (!cancelled && finger.role === "pad" && endGesture(finger.gesture, seconds(event))) handlers.tap();
    refresh();
  };
  surface.addEventListener("pointerup", (event) => lift(event, false));
  surface.addEventListener("pointercancel", (event) => lift(event, true));
  // A finger still down when the app goes to the background never sends pointerup.
  window.addEventListener("blur", () => {
    fingers.clear();
    refresh();
  });

  return state;
}
