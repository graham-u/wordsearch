// Settings dialog test — grid size selection and persistence
// Run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/settings.mjs

import { freshPage, check, results, disconnect, page } from "./helpers.mjs";

await freshPage();
const p = page();

console.log("=== Settings dialog ===");

// ── Test 1: Settings button and dialog exist ──
console.log("\n--- Settings button and dialog ---");

const btnExists = await p.evaluate(() => !!document.getElementById("btn-settings"));
check("settings button exists", btnExists, true);

const dialogExists = await p.evaluate(() => !!document.getElementById("settings-dialog"));
check("settings dialog exists", dialogExists, true);

const dialogHidden = await p.evaluate(() =>
  !document.getElementById("settings-dialog").classList.contains("visible")
);
check("dialog hidden on load", dialogHidden, true);

// ── Test 2: Opens with current size selected ──
console.log("\n--- Dialog opens with current size ---");

await p.click("#btn-settings");
await p.waitForTimeout(200);

const dialogVisible = await p.evaluate(() =>
  document.getElementById("settings-dialog").classList.contains("visible")
);
check("dialog opens on click", dialogVisible, true);

const selectedSize = await p.evaluate(() => {
  const sel = document.querySelector("#size-options .size-btn.selected");
  return sel ? Number(sel.dataset.size) : null;
});
check("8x8 selected by default", selectedSize, 8);

// ── Test 3: Cancel discards change ──
console.log("\n--- Cancel discards change ---");

// Click 6x6, then cancel
await p.click('.size-btn[data-size="6"]');
await p.click("#settings-cancel");
await p.waitForTimeout(200);

const afterCancel = await p.evaluate(() => ({
  dialogVisible: document.getElementById("settings-dialog").classList.contains("visible"),
  gridSize,
  cellCount: document.querySelectorAll("#grid .cell").length,
}));
check("dialog closed after cancel", afterCancel.dialogVisible, false);
check("grid size unchanged after cancel", afterCancel.gridSize, 8);
check("cell count unchanged after cancel", afterCancel.cellCount, 64);

// ── Test 4: Change to 7x7 ──
console.log("\n--- Change to 7x7 ---");

await p.click("#btn-settings");
await p.waitForTimeout(200);
await p.click('.size-btn[data-size="7"]');
await p.click("#settings-ok");
await p.waitForTimeout(300);

const after7 = await p.evaluate(() => ({
  gridSize,
  cellCount: document.querySelectorAll("#grid .cell").length,
  wordCount: document.querySelectorAll(".word-tag").length,
  bodyAttr: document.body.dataset.gridSize,
  cssVar: getComputedStyle(document.getElementById("grid")).getPropertyValue("--grid-size").trim(),
}));
check("gridSize is 7", after7.gridSize, 7);
check("49 cells for 7x7", after7.cellCount, 49);
check("6 words for 7x7", after7.wordCount, 6);
check("body data-grid-size is 7", after7.bodyAttr, "7");
check("CSS --grid-size is 7", after7.cssVar, "7");

// ── Test 5: Change to 6x6 ──
console.log("\n--- Change to 6x6 ---");

await p.click("#btn-settings");
await p.waitForTimeout(200);
await p.click('.size-btn[data-size="6"]');
await p.click("#settings-ok");
await p.waitForTimeout(300);

const after6 = await p.evaluate(() => ({
  gridSize,
  cellCount: document.querySelectorAll("#grid .cell").length,
  wordCount: document.querySelectorAll(".word-tag").length,
  maxWordLen: Math.max(...currentPuzzle.words.map(w => w.length)),
}));
check("gridSize is 6", after6.gridSize, 6);
check("36 cells for 6x6", after6.cellCount, 36);
check("6 words for 6x6", after6.wordCount, 6);
check("no word longer than 6", after6.maxWordLen <= 6, true);

// ── Test 6: Setting persists across reload ──
console.log("\n--- Persistence across reload ---");

await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(500);

const afterReload = await p.evaluate(() => ({
  gridSize,
  cellCount: document.querySelectorAll("#grid .cell").length,
}));
check("gridSize persists as 6", afterReload.gridSize, 6);
check("36 cells after reload", afterReload.cellCount, 36);

// ── Test 7: Dialog shows persisted size ──
console.log("\n--- Dialog shows persisted size ---");

await p.click("#btn-settings");
await p.waitForTimeout(200);

const persistedSelected = await p.evaluate(() => {
  const sel = document.querySelector("#size-options .size-btn.selected");
  return sel ? Number(sel.dataset.size) : null;
});
check("6x6 selected in dialog after reload", persistedSelected, 6);

await p.click("#settings-cancel");

// ── Test 8: Change back to 8x8 ──
console.log("\n--- Change back to 8x8 ---");

await p.click("#btn-settings");
await p.waitForTimeout(200);
await p.click('.size-btn[data-size="8"]');
await p.click("#settings-ok");
await p.waitForTimeout(300);

const after8 = await p.evaluate(() => ({
  gridSize,
  cellCount: document.querySelectorAll("#grid .cell").length,
  wordCount: document.querySelectorAll(".word-tag").length,
}));
check("gridSize back to 8", after8.gridSize, 8);
check("64 cells for 8x8", after8.cellCount, 64);
check("9 words for 8x8", after8.wordCount, 9);

await disconnect();
process.exit(results());
