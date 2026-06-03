import { chromium } from "playwright";
import fs from "fs";

const OUT = "/tmp/mythos-anim";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

// Dismiss intro.
await page.waitForTimeout(10500);
await page.keyboard.press("Enter");
await page.waitForTimeout(1800);

// Find the pinned panel's absolute top + the scroll distance (end "+=300%").
const info = await page.evaluate(() => {
  const sec = document.querySelector("#how-different");
  // the pinned div is the first .h-screen.w-full inside the section
  const pin = sec.querySelector("div.h-screen.w-full");
  const r = pin.getBoundingClientRect();
  return { pinTop: r.top + window.scrollY, vh: window.innerHeight };
});

const progresses = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.88, 1.0];
for (const p of progresses) {
  const y = Math.round(info.pinTop + p * 3 * info.vh);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(1600); // scrub:2 needs settle time
  const name = `p${String(Math.round(p * 100)).padStart(3, "0")}`;
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot", name, "@", y);
}

await browser.close();
console.log("done");
