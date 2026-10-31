import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

/**
 * Files from public/ are copied as they are and never pass through the
 * bundle, so the service worker learns about them from this list.
 * share.png is left out on purpose: only link previews fetch it, never the game.
 */
const PUBLIC_FILES = [
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];
const SERVICE_WORKER = "sw.js";

/** A short, stable hash (FNV-1a), enough to tell one set of files from another. */
function shortHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Gives the service worker (src/worker/sw.ts) the list of files of this build.
 * Their names carry content hashes, so any change in the game changes the
 * list, the cache name and the worker itself, and the browser installs it
 * as a new version.
 */
function pwaPlugin(): Plugin {
  return {
    name: "spider-on-pwa",
    apply: "build",
    // After Vite's own plugins, so the list includes index.html, which Vite adds late.
    enforce: "post",
    generateBundle(_options, bundle) {
      const worker = bundle[SERVICE_WORKER];
      if (worker?.type !== "chunk") throw new Error(`The build has no ${SERVICE_WORKER}`);
      const files = [...Object.keys(bundle).filter((file) => file !== SERVICE_WORKER), ...PUBLIC_FILES].sort();
      const precache = { version: shortHash(files.join("\n")), files };
      worker.code = `const PRECACHE = ${JSON.stringify(precache)};\n${worker.code}`;
    },
  };
}

export default defineConfig(({ mode }) => {
  // GitHub Actions sets GITHUB_SHA; a local build has no commit to show.
  const commit = loadEnv(mode, ".", "").GITHUB_SHA?.slice(0, 7) ?? "local";
  return {
    // GitHub Pages serves the game from https://<user>.github.io/spider-on/
    base: "/spider-on/",
    define: {
      // Shown on the title screen, so a tester can tell which build is running (spec chapter 15).
      __APP_VERSION__: JSON.stringify(`${pkg.version} · ${commit}`),
    },
    plugins: [pwaPlugin()],
    build: {
      rollupOptions: {
        input: { main: "index.html", sw: "src/worker/sw.ts" },
        output: {
          // The worker needs a fixed name and a place at the root: its scope is the folder it lives in.
          entryFileNames: (chunk) => (chunk.name === "sw" ? SERVICE_WORKER : "assets/[name]-[hash].js"),
        },
      },
    },
    test: {
      include: ["src/**/*.test.ts"],
    },
  };
});
