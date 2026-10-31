// Renders the picture that chat apps and social networks show next to a
// shared link (public/share.png, 1200 × 630, the size they all accept).
// It is a real frame of the game with the name beside the web, so it stays
// true to how the game looks. Run it after a visible change of the game:
//   node scripts/share-image.mjs
// It builds the game into dist/ first. The PNG is committed.

import { chromium } from "@playwright/test";
import { build, preview } from "vite";

const PORT = 4181;
// A seed whose first seconds put both spiders on screen away from the name.
const SEED = 7;

await build({ logLevel: "warn" });
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: "warn" });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(`http://localhost:${PORT}/spider-on/?debug&seed=${SEED}`);
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Hrát" }).click();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2500);
  // Freeze the frame: the pause screen would show a menu, so stop the loop instead.
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  await page.addStyleTag({
    content: `
      .corner-button { display: none !important; }
      .share-title {
        position: fixed; top: 50%; transform: translateY(-50%);
        font: 700 64px/1 var(--menu-font); letter-spacing: 0.08em; text-align: center;
        color: var(--menu-text); text-shadow: 0 0 18px var(--menu-glow);
      }
      .share-title small { display: block; margin-top: 16px; font-size: 22px; font-weight: 500; letter-spacing: 0.04em; }
    `,
  });
  await page.evaluate(() => {
    const left = document.createElement("div");
    left.className = "share-title";
    left.style.left = "40px";
    left.innerHTML = "SPIDER<br>ON";
    const right = document.createElement("div");
    right.className = "share-title";
    right.style.right = "40px";
    right.innerHTML = "<small>Neonová arkáda<br>v prohlížeči</small>";
    document.querySelector("#ui")?.append(left, right);
  });
  // The subtitle uses a weight that no menu has asked for yet.
  await page.evaluate(() => document.fonts.load('500 22px "Chakra Petch"', "Neonová arkáda v prohlížeči"));
  await page.screenshot({ path: new URL("../public/share.png", import.meta.url).pathname });
  console.log("public/share.png");
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
