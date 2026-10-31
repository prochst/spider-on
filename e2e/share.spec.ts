// The preview of a shared link (spec chapter 15). Chat apps read these tags
// from the published page, so the addresses are absolute and point to the
// live site; the test checks that the picture exists in this build.

import { expect, test } from "@playwright/test";
import { openGame } from "./helpers";

const SITE = "https://prochst.github.io/spider-on/";

test("describes the game for search engines and link previews", async ({ page, request }) => {
  await openGame(page);
  const meta = (selector: string) => page.locator(`meta[${selector}]`).getAttribute("content");

  expect((await meta('name="description"'))?.length).toBeGreaterThan(50);
  expect(await meta('property="og:title"')).toBe("Spider On");
  expect(await meta('property="og:url"')).toBe(SITE);
  expect(await meta('name="twitter:card"')).toBe("summary_large_image");

  const image = await meta('property="og:image"');
  expect(image).toMatch(new RegExp(`^${SITE}`));
  const response = await request.get(new URL(new URL(image ?? "").pathname, page.url()).href);
  expect(response.ok(), image ?? "").toBe(true);
  expect(response.headers()["content-type"]).toBe("image/png");
  const size = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  }, new URL(image ?? "").pathname);
  expect(size).toEqual([1200, 630]);
});

test("puts the menus in the main landmark", async ({ page }) => {
  await openGame(page);
  await expect(page.getByRole("main").getByRole("button", { name: "Hrát" })).toBeVisible();
});
