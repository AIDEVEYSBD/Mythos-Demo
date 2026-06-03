import { chromium } from "playwright";
import fs from "fs";

const OUT = "c:/Code/Friends/Chandresh/Mythos Demo/_shots";
fs.mkdirSync(OUT, { recursive: true });

const SECTIONS = [
  "introduction",
  "how-different",
  "acceleration",
  "asymmetry",
  "grc-impact",
  "risk-register",
  "program",
  "actions",
  "questions",
  "board-close",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// Wait for the intro to become dismissible (~10s) then press Enter.
await page.waitForTimeout(10500);
await page.keyboard.press("Enter");
await page.waitForTimeout(1500); // intro slide-up

for (const id of SECTIONS) {
  const el = await page.$(`#${id}`);
  if (!el) {
    console.log("MISSING", id);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400); // let reveal animations settle
  // Capture the current viewport (full element can be very tall).
  await page.screenshot({ path: `${OUT}/${id}.png` });
  console.log("shot", id);
}

await browser.close();
console.log("done");
