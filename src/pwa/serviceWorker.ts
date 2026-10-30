// The page's side of the service worker (src/worker/sw.ts): registers it and
// offers a new version when the browser has one ready (spec chapter 15).

/** Switches to the waiting version; the page reloads once it takes over. */
export type ApplyUpdate = () => void;

export function registerServiceWorker(onUpdateReady: (apply: ApplyUpdate) => void): void {
  // The dev server rebuilds on every save; a cache there would only serve stale files.
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  void register(onUpdateReady).catch(() => {
    // Without the worker the game still runs, just not offline.
  });
}

async function register(onUpdateReady: (apply: ApplyUpdate) => void): Promise<void> {
  const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  let updating = false;

  const offer = (worker: ServiceWorker) =>
    onUpdateReady(() => {
      updating = true;
      worker.postMessage("skipWaiting");
    });

  // A version that arrived during an earlier visit and still waits.
  if (registration.waiting && navigator.serviceWorker.controller) offer(registration.waiting);

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    worker?.addEventListener("statechange", () => {
      // Without a controller this is the very first install, not an update.
      if (worker.state === "installed" && navigator.serviceWorker.controller) offer(worker);
    });
  });

  // The first install also takes control; only a requested update reloads the page.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updating) window.location.reload();
  });

  // An installed game can stay open for days; look for a new version whenever it comes back to the front.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void registration.update().catch(() => undefined);
  });
}
