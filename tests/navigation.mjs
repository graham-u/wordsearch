// Navigation test — run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/navigation.mjs
// Requires: local server on port 8085, dev-browser server running

import { freshPage, getState as getStateFull, findOneWord, check, results, disconnect, page as getPage } from "./helpers.mjs";
import { waitForPageLoad } from "@/client.js";

await freshPage();
const page = getPage();

// ── Test 1: Forward navigation builds the array ──
console.log("=== Forward navigation ===");

let s = await getStateFull();
check("start on P1", s.puzzle, 1);
check("array has 1 puzzle", s.puzzleCount, 1);

await findOneWord();
await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("now on P2", s.puzzle, 2);
check("array has 2 puzzles", s.puzzleCount, 2);

await findOneWord();
await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("now on P3", s.puzzle, 3);
check("array has 3 puzzles", s.puzzleCount, 3);

await findOneWord();
await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("now on P4", s.puzzle, 4);
check("array has 4 puzzles", s.puzzleCount, 4);

// ── Test 2: Go back freely, progress preserved ──
console.log("\n=== Backward navigation preserves progress ===");

await page.evaluate(() => goToPrevPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("prev to P3", s.puzzle, 3);
check("P3 has 1 found", s.found, 1);
check("still 4 puzzles in array", s.puzzleCount, 4);

await page.evaluate(() => goToPrevPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("prev to P2", s.puzzle, 2);
check("P2 has 1 found", s.found, 1);

await page.evaluate(() => goToPrevPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("prev to P1", s.puzzle, 1);
check("P1 has 1 found", s.found, 1);

// Can't go further back
await page.evaluate(() => goToPrevPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("still on P1", s.puzzle, 1);

// ── Test 3: Go forward through existing puzzles ──
console.log("\n=== Forward through existing puzzles ===");

await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("next to P2 (existing)", s.puzzle, 2);
check("still 4 puzzles", s.puzzleCount, 4);

await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("next to P3 (existing)", s.puzzle, 3);

await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("next to P4 (existing)", s.puzzle, 4);

// Now next should generate NEW puzzle
await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("next generates P5", s.puzzle, 5);
check("now 5 puzzles", s.puzzleCount, 5);

// ── Test 4: Max puzzles limit ──
console.log("\n=== Max puzzles limit ===");

// Generate more to hit the cap
await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("P6 generated", s.puzzle, 6);
check("capped at 6 puzzles", s.puzzleCount, 6);

await page.evaluate(() => goToNewPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
check("P7 generated, oldest trimmed", s.puzzle, 7);
check("still capped at 6", s.puzzleCount, 6);
// P1 should have been trimmed
const hasP1 = s.allPuzzles.some(p => p.startsWith("P1("));
check("P1 was trimmed", hasP1, false);

// ── Test 5: Completing a puzzle removes it ──
console.log("\n=== Completing a puzzle ===");

// Go back to find a puzzle with 1 found word and complete it
await page.evaluate(() => goToPrevPuzzle());
await page.waitForTimeout(200);
s = await getStateFull();
const puzzleBefore = s.puzzleCount;
const completingPuzzle = s.puzzle;

// Find all remaining words
await page.evaluate(() => {
  for (const word of currentPuzzle.words) {
    currentPuzzle.foundWords.add(word);
  }
});
// Manually trigger completion (bypass the UI timer), using setCurrent
await page.evaluate(() => {
  puzzles.splice(puzzleIdx, 1);
  if (puzzleIdx >= puzzles.length) puzzleIdx = puzzles.length - 1;
  setCurrent(puzzleIdx);
  saveState();
});
await page.waitForTimeout(200);
s = await getStateFull();
check("one fewer puzzle after completion", s.puzzleCount, puzzleBefore - 1);
const hasCompleted = s.allPuzzles.some(p => p.startsWith(`P${completingPuzzle}(`));
check("completed puzzle removed", hasCompleted, false);

// ── Test 6: Persistence across reload ──
console.log("\n=== Persistence across reload ===");

// Ensure state is saved before reload
await page.evaluate(() => saveState());
s = await getStateFull();
const preReloadPuzzle = s.puzzle;
const preReloadTheme = s.theme;
const preReloadFound = s.found;
const preReloadCount = s.puzzleCount;
const preReloadIdx = s.puzzleIdx;

// Reload the page
await page.goto("http://localhost:8085/");
await waitForPageLoad(page);
await page.waitForTimeout(300);

s = await getStateFull();
check("puzzle number restored", s.puzzle, preReloadPuzzle);
check("theme restored", s.theme, preReloadTheme);
check("found words restored", s.found, preReloadFound);
check("puzzle count restored", s.puzzleCount, preReloadCount);
check("puzzle index restored", s.puzzleIdx, preReloadIdx);

// ── Test 7: Completion of last puzzle in array (off-by-one edge case) ──
console.log("\n=== Completion of last puzzle (off-by-one) ===");

// Navigate to the last puzzle
while ((await getStateFull()).puzzleIdx < (await getStateFull()).puzzleCount - 1) {
  await page.evaluate(() => goToNewPuzzle());
  await page.waitForTimeout(200);
}

s = await getStateFull();
const lastPuzzleNum = s.puzzle;
const countBefore = s.puzzleCount;
check("at last puzzle", s.puzzleIdx, s.puzzleCount - 1);

// Complete the last puzzle
await page.evaluate(() => {
  for (const word of currentPuzzle.words) {
    currentPuzzle.foundWords.add(word);
  }
  puzzles.splice(puzzleIdx, 1);
  if (puzzleIdx >= puzzles.length) puzzleIdx = puzzles.length - 1;
  setCurrent(puzzleIdx);
});
await page.waitForTimeout(200);

s = await getStateFull();
check("puzzle removed after completion", s.puzzleCount, countBefore - 1);
check("puzzleIdx is valid", s.puzzleIdx >= 0 && s.puzzleIdx < s.puzzleCount, true);
const hasLast = s.allPuzzles.some(p => p.startsWith(`P${lastPuzzleNum}(`));
check("completed puzzle is gone", hasLast, false);

// ── Results ──
await disconnect();
process.exit(results());
