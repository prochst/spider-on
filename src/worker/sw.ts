// The service worker (spec chapter 15): keeps every file of one version of
// the game in the browser's cache, so the game starts without internet and
// a new version waits until the player chooses to update.
//
// It runs apart from the page, in its own worker, so it has its own
// tsconfig with the WebWorker types instead of the DOM ones.

/// <reference lib="webworker" />

// An empty export makes this a module, so `self` can be given the service
// worker's type; the build output has no export left in it.
export {};
declare let self: ServiceWorkerGlobalScope;

/**
 * Filled in by the build (pwaPlugin in vite.config.ts): the files of this
 * version, relative to the worker, and a short hash that changes with them.
 */
declare const PRECACHE: { version: string; files: string[] };

const CACHE_PREFIX = "spider-on-";
const CACHE = CACHE_PREFIX + PRECACHE.version;

self.addEventListener("install", (event) => {
  // No skipWaiting here: a new version waits until the page asks for it,
  // so a game in progress never switches files under the player's hands.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.files)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE).map((name) => caches.delete(name)));
      // The very first visit is served by this worker right away, not only after a reload.
      await self.clients.claim();
    })(),
  );
});

// The page sends this when the player presses Aktualizovat.
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") void self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fromCache(request));
});

async function fromCache(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  // Every page address (with ?debug or without) gets the cached game page.
  const key = request.mode === "navigate" ? new URL("index.html", self.registration.scope).href : request;
  // ignoreVary: module scripts are requested with an Origin header the cached
  // copies were stored without, and "Vary: Origin" would make them miss.
  const cached = await cache.match(key, { ignoreSearch: request.mode === "navigate", ignoreVary: true });
  return cached ?? fetch(request);
}
