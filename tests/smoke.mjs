// Smoke test — page load and DOM structure
// Run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/smoke.mjs

import { freshPage, check, results, disconnect, page } from "./helpers.mjs";

await freshPage();
const p = page();

console.log("=== Page load and DOM structure ===");

// Listen for page errors
const pageErrors = [];
p.on("pageerror", err => pageErrors.push(err.message));

// Reload to catch any errors during load
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(300);

const title = await p.title();
check("page title", title, "Word Search");

const cellCount = await p.evaluate(() => document.querySelectorAll("#grid .cell").length);
check("grid has 64 cells", cellCount, 64);

const wordTagCount = await p.evaluate(() => document.querySelectorAll(".word-tag").length);
check("word list has 9 tags", wordTagCount, 9);

const levelText = await p.evaluate(() => document.getElementById("level-indicator").textContent);
check("header shows Puzzle 1", levelText, "Puzzle 1");

const themeText = await p.evaluate(() => document.getElementById("theme-indicator").textContent);
const hasTheme = typeof themeText === "string" && themeText.length > 0;
check("header shows a theme name", hasTheme, true);

const versionText = await p.evaluate(() => document.getElementById("version").textContent);
const versionMatch = /^v\d+$/.test(versionText);
check("version tag format", versionMatch, true);

const prevExists = await p.evaluate(() => !!document.getElementById("btn-prev"));
check("prev button exists", prevExists, true);

const nextExists = await p.evaluate(() => !!document.getElementById("btn-next"));
check("next button exists", nextExists, true);

const prevDisabled = await p.evaluate(() => document.getElementById("btn-prev").disabled);
check("prev button starts disabled", prevDisabled, true);

const nextText = await p.evaluate(() => document.getElementById("btn-next").textContent);
check("next button text", nextText, "Next Puzzle");

const nextDisabled = await p.evaluate(() => document.getElementById("btn-next").disabled);
check("next button starts enabled", nextDisabled, false);

const confirmRole = await p.evaluate(() => document.getElementById("confirm-dialog").getAttribute("role"));
check("confirm dialog role", confirmRole, "dialog");

const hintRole = await p.evaluate(() => document.getElementById("hint-dialog").getAttribute("role"));
check("hint dialog role", hintRole, "dialog");

const gridAriaLabel = await p.evaluate(() => document.getElementById("grid").getAttribute("aria-label"));
const hasGridLabel = typeof gridAriaLabel === "string" && gridAriaLabel.length > 0;
check("grid has aria-label", hasGridLabel, true);

const overlayVisible = await p.evaluate(() => document.getElementById("overlay").classList.contains("visible"));
check("overlay not visible on load", overlayVisible, false);

check("no console errors on load", pageErrors.length, 0);
if (pageErrors.length > 0) {
  console.log("  Page errors:", pageErrors);
}

await disconnect();
process.exit(results());
