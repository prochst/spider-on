// Checks the "new version" flow of the service worker (spec chapter 15) the
// way a player meets it: open the game, publish a new build, see the offer,
// press Aktualizovat and get the new version. The E2E tests cannot do this,
// because it takes two different builds on the same address.
//   node scripts/check-update.mjs
// It overwrites dist/ twice; run npm run build afterwards if you need a clean one.

import { chromium } from "@playwright/test";
import { build, preview } from "vite";

const PORT = 4180;

async function buildAs(commit) {
  process.env.GITHUB_SHA = commit;
  await build({ logLevel: "warn" });
}

await buildAs("aaaaaaa0000");
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: "warn" });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/spider-on/`);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const footer = page.locator(".panel .footer");
  console.log("running:", await footer.textContent());

  await buildAs("bbbbbbb1111");
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
  const offer = page.locator(".panel .update");
  await offer.waitFor({ timeout: 15_000 });
  console.log("offered:", await offer.textContent());

  await offer.getByRole("button", { name: "Aktualizovat" }).click();
  await page.waitForFunction(() => document.querySelector(".panel .footer")?.textContent?.includes("bbbbbbb"));
  console.log("updated:", await footer.textContent());
  console.log("OK: the new version was offered and applied.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
