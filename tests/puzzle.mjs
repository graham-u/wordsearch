// Puzzle generation validation
// Run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/puzzle.mjs

import { freshPage, check, results, disconnect, page } from "./helpers.mjs";

await freshPage();
const p = page();

console.log("=== Puzzle generation ===");

// Generate 10 puzzles and validate each
for (let i = 0; i < 10; i++) {
  const state = await p.evaluate((iter) => {
    if (iter > 0) {
      generatePuzzle();
      puzzles.push(currentPuzzle);
      setCurrent(puzzles.length - 1);
    }
    const cp = currentPuzzle;
    return {
      puzzleNumber: cp.puzzleNumber,
      type: cp.type || "normal",
      theme: cp.theme,
      words: cp.words,
      grid: cp.grid,
      wordPositions: cp.wordPositions,
      foundWords: cp.foundWords.size,
      foundHighlights: cp.foundHighlights.length,
      allThemes: Object.keys(WORD_LISTS),
      themeWords: cp.type === "quote" ? null : WORD_LISTS[cp.theme],
      gridSize,
      expectedWords: GRID_CONFIGS[gridSize].wordsPerPuzzle,
    };
  }, i);

  const label = `puzzle ${i + 1}`;
  const gs = state.gridSize;
  const isQuote = state.type === "quote";

  // Puzzle not null
  check(`${label} generated`, state.puzzleNumber > 0, true);

  if (isQuote) {
    // Quote puzzles have variable word count; just check at least 1
    check(`${label} is quote puzzle`, true, true);
    check(`${label} has words`, state.words.length > 0, true);
  } else {
    // Correct word count
    check(`${label} has ${state.expectedWords} words`, state.words.length, state.expectedWords);
  }

  // Grid dimensions match gridSize
  check(`${label} grid has ${gs} rows`, state.grid.length, gs);

  let gridOk = true;
  for (let r = 0; r < gs; r++) {
    if (state.grid[r].length !== gs) {
      gridOk = false;
      break;
    }
    for (let c = 0; c < gs; c++) {
      const cell = state.grid[r][c];
      if (typeof cell !== "string" || cell.length !== 1 || !/^[A-Z]$/.test(cell)) {
        gridOk = false;
        break;
      }
    }
    if (!gridOk) break;
  }
  check(`${label} grid cells valid`, gridOk, true);

  // Each word's positions spell out the word
  // Quote puzzles use "WORD:index" keys in wordPositions
  let positionsOk = true;
  if (isQuote) {
    for (let wi = 0; wi < state.words.length; wi++) {
      const word = state.words[wi];
      const key = word + ":" + wi;
      const cells = state.wordPositions[key];
      if (!cells || cells.length !== word.length) {
        console.log(`  FAIL ${label} word "${word}" has wrong position count`);
        positionsOk = false;
        continue;
      }
      const spelled = cells.map(({ row, col }) => state.grid[row][col]).join("");
      if (spelled !== word) {
        console.log(`  FAIL ${label} word "${word}" positions spell "${spelled}"`);
        positionsOk = false;
      }
    }
  } else {
    for (const word of state.words) {
      const cells = state.wordPositions[word];
      if (!cells || cells.length !== word.length) {
        console.log(`  FAIL ${label} word "${word}" has wrong position count`);
        positionsOk = false;
        continue;
      }
      const spelled = cells.map(({ row, col }) => state.grid[row][col]).join("");
      if (spelled !== word) {
        console.log(`  FAIL ${label} word "${word}" positions spell "${spelled}"`);
        positionsOk = false;
      }
    }
  }
  check(`${label} word positions correct`, positionsOk, true);

  if (isQuote) {
    // Quote theme is the author name, not a WORD_LISTS key
    check(`${label} has theme (author)`, state.theme.length > 0, true);
  } else {
    // Valid theme
    check(`${label} theme exists`, state.allThemes.includes(state.theme), true);

    // All words belong to the theme
    let wordsInTheme = true;
    for (const word of state.words) {
      if (!state.themeWords.includes(word)) {
        console.log(`  FAIL ${label} word "${word}" not in theme "${state.theme}"`);
        wordsInTheme = false;
      }
    }
    check(`${label} words belong to theme`, wordsInTheme, true);
  }

  // foundWords starts empty
  check(`${label} foundWords empty`, state.foundWords, 0);

  // foundHighlights starts empty
  check(`${label} foundHighlights empty`, state.foundHighlights, 0);
}

// Check puzzleNumber increments
const numbers = await p.evaluate(() => puzzles.map(p => p.puzzleNumber));
let incrementsOk = true;
for (let i = 1; i < numbers.length; i++) {
  if (numbers[i] <= numbers[i - 1]) {
    console.log(`  FAIL puzzleNumber not incrementing: ${numbers[i - 1]} -> ${numbers[i]}`);
    incrementsOk = false;
  }
}
check("puzzleNumbers increment", incrementsOk, true);

await disconnect();
process.exit(results());
