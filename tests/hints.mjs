// Hint system tests
// Run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/hints.mjs

import { freshPage, check, results, disconnect, page } from "./helpers.mjs";

await freshPage();
const p = page();

console.log("=== Hint system ===");

// ── Test 1: Tap unfound word shows hint dialog ──
console.log("\n--- Tap unfound word ---");

const firstWord = await p.evaluate(() => currentPuzzle.words[0]);

// Click the word tag
await p.evaluate((word) => {
  const tags = document.querySelectorAll(".word-tag");
  for (const tag of tags) {
    if (tag.dataset.word === word) { tag.click(); break; }
  }
}, firstWord);
await p.waitForTimeout(200);

const dialogVisible = await p.evaluate(() =>
  document.getElementById("hint-dialog").classList.contains("visible")
);
check("hint dialog visible after tap", dialogVisible, true);

const hintText = await p.evaluate(() =>
  document.getElementById("hint-message").textContent
);
check("hint message contains word", hintText.includes(firstWord), true);

// ── Test 2: Click Cancel hides dialog, no hint shown ──
console.log("\n--- Cancel hint ---");

await p.evaluate(() => document.getElementById("hint-no").click());
await p.waitForTimeout(200);

const dialogHidden = await p.evaluate(() =>
  !document.getElementById("hint-dialog").classList.contains("visible")
);
check("dialog hidden after cancel", dialogHidden, true);

const anyFlash = await p.evaluate(() =>
  document.querySelectorAll(".hint-flash").length
);
check("no hint flash after cancel", anyFlash, 0);

// ── Test 3: Tap word + Show Hint flashes first cell ──
console.log("\n--- Show hint flashes cell ---");

// Tap the word again
await p.evaluate((word) => {
  const tags = document.querySelectorAll(".word-tag");
  for (const tag of tags) {
    if (tag.dataset.word === word) { tag.click(); break; }
  }
}, firstWord);
await p.waitForTimeout(200);

// Click "Show Hint"
await p.evaluate(() => document.getElementById("hint-yes").click());
await p.waitForTimeout(200);

const flashCount = await p.evaluate(() =>
  document.querySelectorAll(".hint-flash").length
);
check("one cell has hint-flash", flashCount, 1);

// Verify it's the first cell of the word
const flashCorrect = await p.evaluate((word) => {
  const pos = currentPuzzle.wordPositions[word];
  const firstCell = pos[0];
  const el = document.getElementById("grid").children[firstCell.row * 8 + firstCell.col];
  return el.classList.contains("hint-flash");
}, firstWord);
check("hint-flash on correct cell", flashCorrect, true);

// ── Test 4: After 1.5s the flash class is removed ──
console.log("\n--- Flash removed after timeout ---");

await p.waitForTimeout(1500);

const flashAfter = await p.evaluate(() =>
  document.querySelectorAll(".hint-flash").length
);
check("hint-flash removed after 1.5s", flashAfter, 0);

// ── Test 5: Tap already-found word does NOT show dialog ──
console.log("\n--- Tap found word ---");

// Mark the first word as found
await p.evaluate((word) => {
  currentPuzzle.foundWords.add(word);
  const tags = document.querySelectorAll(".word-tag");
  for (const tag of tags) {
    if (tag.dataset.word === word) tag.classList.add("found");
  }
}, firstWord);

// Tap it
await p.evaluate((word) => {
  const tags = document.querySelectorAll(".word-tag");
  for (const tag of tags) {
    if (tag.dataset.word === word) { tag.click(); break; }
  }
}, firstWord);
await p.waitForTimeout(200);

const dialogForFound = await p.evaluate(() =>
  document.getElementById("hint-dialog").classList.contains("visible")
);
check("no hint dialog for found word", dialogForFound, false);

await disconnect();
process.exit(results());
