// Gameplay test — word finding via pointer simulation
// Run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/gameplay.mjs

import { freshPage, check, results, disconnect, page } from "./helpers.mjs";

await freshPage();
const p = page();

console.log("=== Gameplay: pointer-based word finding ===");

// Get grid geometry for coordinate calculation
async function getGridInfo() {
  return p.evaluate(() => {
    const gridEl = document.getElementById("grid");
    const rect = gridEl.getBoundingClientRect();
    const cellSize = rect.width / 8;
    return {
      left: rect.left,
      top: rect.top,
      cellSize,
      words: currentPuzzle.words,
      wordPositions: currentPuzzle.wordPositions,
      foundWords: [...currentPuzzle.foundWords],
      foundHighlights: currentPuzzle.foundHighlights.length,
    };
  });
}

// Simulate a drag from one cell to another
async function drag(startRow, startCol, endRow, endCol, gridInfo) {
  const { left, top, cellSize } = gridInfo;
  const sx = left + startCol * cellSize + cellSize / 2;
  const sy = top + startRow * cellSize + cellSize / 2;
  const ex = left + endCol * cellSize + cellSize / 2;
  const ey = top + endRow * cellSize + cellSize / 2;

  await p.mouse.move(sx, sy);
  await p.mouse.down();
  // Move in a few steps for pointermove to register
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const x = sx + (ex - sx) * (i / steps);
    const y = sy + (ey - sy) * (i / steps);
    await p.mouse.move(x, y);
  }
  await p.mouse.up();
  await p.waitForTimeout(200);
}

// ── Test 1: Find a word by dragging across its cells ──
console.log("\n--- Find word via drag ---");

let info = await getGridInfo();
const firstWord = info.words[0];
const firstPos = info.wordPositions[firstWord];
const startCell = firstPos[0];
const endCell = firstPos[firstPos.length - 1];

await drag(startCell.row, startCell.col, endCell.row, endCell.col, info);

info = await getGridInfo();
check("word added to foundWords", info.foundWords.includes(firstWord), true);
check("highlight line added", info.foundHighlights, 1);

// Check DOM classes
const wordTagFound = await p.evaluate((word) => {
  const tags = document.querySelectorAll(".word-tag");
  for (const tag of tags) {
    if (tag.dataset.word === word) return tag.classList.contains("found");
  }
  return false;
}, firstWord);
check("word tag has .found class", wordTagFound, true);

const cellsFound = await p.evaluate((word) => {
  const positions = currentPuzzle.wordPositions[word];
  return positions.every(({ row, col }) => {
    const el = document.getElementById("grid").children[row * 8 + col];
    return el.classList.contains("found-cell");
  });
}, firstWord);
check("cells have .found-cell class", cellsFound, true);

// ── Test 2: Find a reversed word ──
console.log("\n--- Find reversed word ---");

// Find an unfound word and drag in reverse direction
info = await getGridInfo();
const reverseWord = info.words.find(w => !info.foundWords.includes(w));
const reversePos = info.wordPositions[reverseWord];
const revStart = reversePos[reversePos.length - 1]; // drag backwards
const revEnd = reversePos[0];

await drag(revStart.row, revStart.col, revEnd.row, revEnd.col, info);

info = await getGridInfo();
check("reversed word found", info.foundWords.includes(reverseWord), true);
check("highlight count increased", info.foundHighlights, 2);

// ── Test 3: Drag across non-word cells ──
console.log("\n--- Drag across non-word cells ---");

const foundBefore = info.foundWords.length;

// Drag across an unlikely word path (first row, left to right — probably not a word)
// We'll just drag across two cells that don't form a valid word combo
await drag(0, 0, 0, 1, info);

info = await getGridInfo();
check("no new word from random drag", info.foundWords.length, foundBefore);

// ── Test 4: Drag across already-found word ──
console.log("\n--- Drag across already-found word ---");

// Re-drag the first word
await drag(startCell.row, startCell.col, endCell.row, endCell.col, info);

info = await getGridInfo();
check("no duplicate entry", info.foundWords.filter(w => w === firstWord).length, 1);

// ── Test 5: Find all remaining words triggers completion ──
console.log("\n--- Find all words triggers completion ---");

// Get remaining unfound words
const remaining = info.words.filter(w => !info.foundWords.includes(w));

for (const word of remaining) {
  info = await getGridInfo();
  const pos = info.wordPositions[word];
  const s = pos[0];
  const e = pos[pos.length - 1];
  await drag(s.row, s.col, e.row, e.col, info);
}

// Check completion overlay becomes visible
await p.waitForTimeout(400);
const overlayVisible = await p.evaluate(() => document.getElementById("overlay").classList.contains("visible"));
check("completion overlay visible", overlayVisible, true);

await disconnect();
process.exit(results());
