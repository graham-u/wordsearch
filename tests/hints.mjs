// Hint system tests
// Run with: cd <dev-browser-skill-dir> && bun x tsx ~/mnt/ed1/projects/wordsearch/tests/hints.mjs

import { freshPage, check, results, disconnect, page } from "./helpers.mjs";

await freshPage();
const p = page();

console.log("=== Hint system ===");

// ── Test 1: Tap unfound word immediately flashes first cell ──
console.log("\n--- Tap unfound word flashes cell ---");

const firstWord = await p.evaluate(() => currentPuzzle.words[0]);

// Click the word tag
await p.evaluate((word) => {
  const tags = document.querySelectorAll(".word-tag");
  for (const tag of tags) {
    if (tag.dataset.word === word) { tag.click(); break; }
  }
}, firstWord);
await p.waitForTimeout(200);

const flashCount = await p.evaluate(() =>
  document.querySelectorAll(".hint-flash").length
);
check("one cell has hint-flash", flashCount, 1);

// Verify it's the first cell of the word
const flashCorrect = await p.evaluate((word) => {
  const pos = currentPuzzle.wordPositions[word];
  const firstCell = pos[0];
  const el = document.getElementById("grid").children[firstCell.row * gridSize + firstCell.col];
  return el.classList.contains("hint-flash");
}, firstWord);
check("hint-flash on correct cell", flashCorrect, true);

// ── Test 2: After 1.5s the flash class is removed ──
console.log("\n--- Flash removed after timeout ---");

await p.waitForTimeout(1500);

const flashAfter = await p.evaluate(() =>
  document.querySelectorAll(".hint-flash").length
);
check("hint-flash removed after 1.5s", flashAfter, 0);

// ── Test 3: Tap already-found word does NOT flash ──
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

const flashForFound = await p.evaluate(() =>
  document.querySelectorAll(".hint-flash").length
);
check("no hint flash for found word", flashForFound, 0);

await disconnect();
process.exit(results());
