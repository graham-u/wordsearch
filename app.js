const GRID_CONFIGS = {
  8: { wordsPerPuzzle: 9 },
  7: { wordsPerPuzzle: 6 },
  6: { wordsPerPuzzle: 6 },
};
let gridSize = 8;
const MAX_HISTORY = 5;
let quoteInterval = 3; // every Nth puzzle is a quote game (0 = all quotes)
const DIRECTIONS = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];
const HIGHLIGHT_COLORS = [
  "rgba(239, 68, 68, 0.35)",
  "rgba(59, 130, 246, 0.35)",
  "rgba(34, 197, 94, 0.35)",
  "rgba(168, 85, 247, 0.35)",
  "rgba(245, 158, 11, 0.35)",
  "rgba(236, 72, 153, 0.35)",
  "rgba(20, 184, 166, 0.35)",
  "rgba(249, 115, 22, 0.35)",
  "rgba(100, 116, 139, 0.35)"
];

// ── State ──
let puzzles = [];            // array of all active puzzles (up to MAX_PUZZLES)
let puzzleIdx = -1;          // index of current puzzle in the array
let currentPuzzle = null;    // shortcut to puzzles[puzzleIdx]
const MAX_PUZZLES = 6;       // max puzzles kept (current + 5 incomplete)
let puzzleNumber = 0;
let categoryOrder = [];
let categoryIndex = 0;
let quoteOrder = [];
let quoteIndex = 0;

// Selection state
let selecting = false;
let startCell = null;
let currentCells = [];
let capturedPointerId = null;

// ── DOM refs ──
const gridEl = document.getElementById("grid");
const wordListEl = document.getElementById("word-list");
const overlayEl = document.getElementById("overlay");
const levelEl = document.getElementById("level-indicator");
const themeEl = document.getElementById("theme-indicator");
const gridWrapper = document.getElementById("grid-wrapper");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const confirmDialog = document.getElementById("confirm-dialog");
const confirmMsg = document.getElementById("confirm-message");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");
const quoteDisplayEl = document.getElementById("quote-display");
const quoteAuthorEl = document.getElementById("quote-author");
const quoteTextEl = document.getElementById("quote-text");
const settingsDialog = document.getElementById("settings-dialog");
const btnSettings = document.getElementById("btn-settings");
const settingsOk = document.getElementById("settings-ok");
const settingsCancel = document.getElementById("settings-cancel");

// ── Category cycling ──

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextCategory() {
  if (categoryIndex >= categoryOrder.length) {
    categoryOrder = shuffleArray(Object.keys(WORD_LISTS));
    categoryIndex = 0;
  }
  return categoryOrder[categoryIndex++];
}

function initCategories() {
  categoryOrder = shuffleArray(Object.keys(WORD_LISTS));
  categoryIndex = 0;
}

function initQuotes() {
  quoteOrder = shuffleArray(Array.from({ length: QUOTES.length }, (_, i) => i));
  quoteIndex = 0;
}

function nextQuote() {
  if (quoteOrder.length === 0 || quoteIndex >= quoteOrder.length) {
    initQuotes();
  }
  return QUOTES[quoteOrder[quoteIndex++]];
}

// ── Puzzle Generation ──

function pickWords(theme) {
  const pool = WORD_LISTS[theme].filter(w => w.length <= gridSize);
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, GRID_CONFIGS[gridSize].wordsPerPuzzle);
}

function generatePuzzle() {
  // Try a quote puzzle at regular intervals
  if (shouldGenerateQuote()) {
    if (generateQuotePuzzle()) return true;
    // Fall through to regular puzzle if quote generation fails
  }

  for (let categoryAttempt = 0; categoryAttempt < 5; categoryAttempt++) {
    const theme = nextCategory();
    for (let attempt = 0; attempt < 20; attempt++) {
      const words = pickWords(theme);
      const result = tryPlaceWords(words);
      if (result) {
        fillBlanks(result.grid);
        puzzleNumber++;
        currentPuzzle = {
          grid: result.grid,
          words,
          theme,
          foundWords: new Set(),
          foundHighlights: [],
          wordPositions: result.positions,
          puzzleNumber
        };
        return true;
      }
    }
  }
  currentPuzzle = null;
  return false;
}

function tryPlaceWords(words) {
  const g = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
  const positions = {};
  const sorted = [...words].sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    const pos = placeWord(g, word);
    if (!pos) return null;
    positions[word] = pos;
  }
  return { grid: g, positions };
}

function placeWord(g, word) {
  const dirs = shuffleArray(DIRECTIONS);
  for (const [dr, dc] of dirs) {
    const positions = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (canPlace(g, word, r, c, dr, dc)) {
          positions.push([r, c]);
        }
      }
    }
    if (positions.length > 0) {
      const [r, c] = positions[Math.floor(Math.random() * positions.length)];
      const cells = [];
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        g[nr][nc] = word[i];
        cells.push({ row: nr, col: nc });
      }
      return cells;
    }
  }
  return null;
}

function canPlace(g, word, r, c, dr, dc) {
  for (let i = 0; i < word.length; i++) {
    const nr = r + dr * i;
    const nc = c + dc * i;
    if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) return false;
    if (g[nr][nc] !== "" && g[nr][nc] !== word[i]) return false;
  }
  return true;
}

function fillBlanks(g) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (g[r][c] === "") {
        g[r][c] = letters[Math.floor(Math.random() * 26)];
      }
    }
  }
}

// ── Quote Puzzle Generation ──

function shouldGenerateQuote() {
  if (typeof QUOTES === "undefined" || QUOTES.length === 0) return false;
  if (quoteInterval === 0) return true;
  return puzzleNumber > 0 && puzzleNumber % (quoteInterval + 1) === 0;
}

function generateQuotePuzzle() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const quote = nextQuote();
    // Filter words that fit in the current grid
    const validWords = quote.words.filter(w => w.length <= gridSize && w.length >= 3);
    if (validWords.length !== quote.words.length) continue;

    // Deduplicate words for grid placement (each unique word placed once)
    const uniqueWords = [...new Set(quote.words)];
    const result = tryPlaceWords(uniqueWords);
    if (!result) continue;

    fillBlanks(result.grid);
    puzzleNumber++;

    // Build wordPositions mapping for ALL words (including duplicates by index)
    // Each blank gets its own position reference
    const wordPositions = {};
    for (let i = 0; i < quote.words.length; i++) {
      const key = quote.words[i] + ":" + i;
      wordPositions[key] = result.positions[quote.words[i]];
    }

    currentPuzzle = {
      type: "quote",
      grid: result.grid,
      words: quote.words,
      theme: quote.author,
      quote: { author: quote.author, text: quote.text },
      foundWords: new Set(),
      foundHighlights: [],
      wordPositions,
      puzzleNumber
    };
    return true;
  }
  return false;
}

// ── Rendering ──

function renderAll() {
  const isQuote = currentPuzzle.type === "quote";
  renderGrid();
  if (isQuote) {
    renderQuoteDisplay();
    wordListEl.style.display = "none";
    quoteDisplayEl.style.display = "";
  } else {
    renderWordList();
    wordListEl.style.display = "";
    quoteDisplayEl.style.display = "none";
  }
  renderLevel();
  renderFoundCells();
  renderHighlightSVG();
  updateNavButtons();
}

function renderGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = currentPuzzle.grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridEl.appendChild(cell);
    }
  }
}

function renderWordList() {
  wordListEl.innerHTML = "";
  for (const word of currentPuzzle.words) {
    const tag = document.createElement("span");
    tag.className = "word-tag";
    if (currentPuzzle.foundWords.has(word)) tag.classList.add("found");
    tag.textContent = word;
    tag.dataset.word = word;
    tag.addEventListener("click", () => onWordTap(word));
    wordListEl.appendChild(tag);
  }
}

function renderQuoteDisplay() {
  quoteAuthorEl.textContent = currentPuzzle.quote.author.toUpperCase();
  quoteTextEl.innerHTML = "";
  const text = currentPuzzle.quote.text;
  // Split text on placeholders {0}, {1}, etc.
  const parts = text.split(/\{(\d+)\}/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Plain text
      if (parts[i]) quoteTextEl.appendChild(document.createTextNode(parts[i]));
    } else {
      // Placeholder index
      const idx = parseInt(parts[i]);
      const word = currentPuzzle.words[idx];
      const key = word + ":" + idx;
      const span = document.createElement("span");
      span.className = "quote-blank";
      span.dataset.wordIndex = idx;
      if (currentPuzzle.foundWords.has(key)) {
        span.textContent = word;
        span.classList.add("found");
      } else {
        span.textContent = "\u00A0".repeat(Math.max(word.length, 3));
        span.addEventListener("click", () => onQuoteBlankTap(idx));
      }
      quoteTextEl.appendChild(span);
    }
  }
}

function renderLevel() {
  levelEl.textContent = "Puzzle " + currentPuzzle.puzzleNumber;
  themeEl.textContent = currentPuzzle.type === "quote" ? "Quote Game" : currentPuzzle.theme;
}

function renderFoundCells() {
  for (const key of currentPuzzle.foundWords) {
    const cells = currentPuzzle.wordPositions[key];
    if (cells) {
      for (const { row, col } of cells) {
        const el = gridEl.children[row * gridSize + col];
        if (el) el.classList.add("found-cell");
      }
    }
  }
}

function updateNavButtons() {
  btnPrev.disabled = puzzleIdx <= 0;
  btnNext.textContent = puzzleIdx < puzzles.length - 1 ? "Next" : "Next Puzzle";
}

// ── SVG highlight lines ──

// Persistent SVG element and drag line — created once, updated as needed
let highlightSVG = null;
let dragLine = null;

function ensureHighlightSVG() {
  if (!highlightSVG) {
    highlightSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    highlightSVG.id = "highlight-svg";
    gridWrapper.appendChild(highlightSVG);
  }
  if (!dragLine) {
    dragLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    dragLine.setAttribute("stroke", "rgba(37, 99, 235, 0.3)");
    dragLine.style.display = "none";
    highlightSVG.appendChild(dragLine);
  }
}

function renderFoundHighlights(cellSize) {
  ensureHighlightSVG();
  // Remove all lines except the drag line
  const lines = highlightSVG.querySelectorAll("line:not(:last-child)");
  lines.forEach(l => l.remove());

  if (!cellSize) cellSize = gridWrapper.offsetWidth / gridSize;

  // Re-insert found highlights before the drag line
  for (const h of currentPuzzle.foundHighlights) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", h.startCol * cellSize + cellSize / 2);
    line.setAttribute("y1", h.startRow * cellSize + cellSize / 2);
    line.setAttribute("x2", h.endCol * cellSize + cellSize / 2);
    line.setAttribute("y2", h.endRow * cellSize + cellSize / 2);
    line.setAttribute("stroke", h.color);
    line.setAttribute("stroke-width", cellSize * 0.7);
    highlightSVG.insertBefore(line, dragLine);
  }

  // Update drag line stroke width
  dragLine.setAttribute("stroke-width", cellSize * 0.7);
}

function updateDragLine(cellSize) {
  ensureHighlightSVG();
  if (!cellSize) cellSize = gridWrapper.offsetWidth / gridSize;

  if (selecting && currentCells.length > 1) {
    const first = currentCells[0];
    const last = currentCells[currentCells.length - 1];
    dragLine.setAttribute("x1", first.col * cellSize + cellSize / 2);
    dragLine.setAttribute("y1", first.row * cellSize + cellSize / 2);
    dragLine.setAttribute("x2", last.col * cellSize + cellSize / 2);
    dragLine.setAttribute("y2", last.row * cellSize + cellSize / 2);
    dragLine.setAttribute("stroke-width", cellSize * 0.7);
    dragLine.style.display = "";
  } else {
    dragLine.style.display = "none";
  }
}

function renderHighlightSVG() {
  const cellSize = gridWrapper.offsetWidth / gridSize;
  renderFoundHighlights(cellSize);
  updateDragLine(cellSize);
}

// ── Touch / Pointer handling ──

function getCellFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  if (el && el.classList.contains("cell")) {
    return { row: parseInt(el.dataset.row), col: parseInt(el.dataset.col), el };
  }
  return null;
}

function getCellsInLine(r1, c1, r2, c2) {
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  const rowDist = Math.abs(r2 - r1);
  const colDist = Math.abs(c2 - c1);
  if (rowDist !== colDist && rowDist !== 0 && colDist !== 0) return null;
  const steps = Math.max(rowDist, colDist);
  const cells = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ row: r1 + dr * i, col: c1 + dc * i });
  }
  return cells;
}

function clearSelectionHighlight() {
  document.querySelectorAll(".cell.selecting").forEach(c => c.classList.remove("selecting"));
}

function highlightCells(cells) {
  clearSelectionHighlight();
  for (const { row, col } of cells) {
    const el = gridEl.children[row * gridSize + col];
    if (el) el.classList.add("selecting");
  }
}

function onPointerDown(e) {
  e.preventDefault();
  const cell = getCellFromPoint(e.clientX, e.clientY);
  if (!cell) return;
  selecting = true;
  startCell = cell;
  currentCells = [{ row: cell.row, col: cell.col }];
  capturedPointerId = e.pointerId;
  gridEl.setPointerCapture(e.pointerId);
  highlightCells(currentCells);
  updateDragLine();
}

function onPointerMove(e) {
  if (!selecting) return;
  e.preventDefault();
  const cell = getCellFromPoint(e.clientX, e.clientY);
  if (!cell) return;
  const cells = getCellsInLine(startCell.row, startCell.col, cell.row, cell.col);
  if (cells) {
    currentCells = cells;
    highlightCells(cells);
    updateDragLine();
  }
}

function onPointerUp(e) {
  if (!selecting) return;
  e.preventDefault();
  if (gridEl.hasPointerCapture(e.pointerId)) {
    gridEl.releasePointerCapture(e.pointerId);
  }
  capturedPointerId = null;
  selecting = false;
  checkSelection();
  clearSelectionHighlight();
  currentCells = [];
  updateDragLine();
}

function checkSelection() {
  if (currentCells.length < 2) return;
  const selected = currentCells.map(({ row, col }) => currentPuzzle.grid[row][col]).join("");
  const reversed = [...selected].reverse().join("");

  if (currentPuzzle.type === "quote") {
    // For quote puzzles, match against word:index keys
    for (let i = 0; i < currentPuzzle.words.length; i++) {
      const word = currentPuzzle.words[i];
      const key = word + ":" + i;
      if (currentPuzzle.foundWords.has(key)) continue;
      if (selected === word || reversed === word) {
        currentPuzzle.foundWords.add(key);
        markFoundQuote(key);
        currentPuzzle.foundHighlights.push({
          startRow: currentCells[0].row,
          startCol: currentCells[0].col,
          endRow: currentCells[currentCells.length - 1].row,
          endCol: currentCells[currentCells.length - 1].col,
          color: HIGHLIGHT_COLORS[currentPuzzle.foundHighlights.length % HIGHLIGHT_COLORS.length]
        });
        renderHighlightSVG();
        saveState();
        if (currentPuzzle.foundWords.size === currentPuzzle.words.length) {
          setTimeout(showComplete, 300);
        }
        return;
      }
    }
  } else {
    for (const word of currentPuzzle.words) {
      if (currentPuzzle.foundWords.has(word)) continue;
      if (selected === word || reversed === word) {
        currentPuzzle.foundWords.add(word);
        markFound(word);
        currentPuzzle.foundHighlights.push({
          startRow: currentCells[0].row,
          startCol: currentCells[0].col,
          endRow: currentCells[currentCells.length - 1].row,
          endCol: currentCells[currentCells.length - 1].col,
          color: HIGHLIGHT_COLORS[currentPuzzle.foundHighlights.length % HIGHLIGHT_COLORS.length]
        });
        renderHighlightSVG();
        saveState();
        if (currentPuzzle.foundWords.size === currentPuzzle.words.length) {
          setTimeout(showComplete, 300);
        }
        return;
      }
    }
  }
}

function markFound(word) {
  const tags = wordListEl.querySelectorAll(".word-tag");
  for (const tag of tags) {
    if (tag.dataset.word === word) tag.classList.add("found");
  }
  const cells = currentPuzzle.wordPositions[word];
  if (cells) {
    for (const { row, col } of cells) {
      const el = gridEl.children[row * gridSize + col];
      if (el) el.classList.add("found-cell");
    }
  }
}

function markFoundQuote(key) {
  // Highlight grid cells
  const cells = currentPuzzle.wordPositions[key];
  if (cells) {
    for (const { row, col } of cells) {
      const el = gridEl.children[row * gridSize + col];
      if (el) el.classList.add("found-cell");
    }
  }
  // Re-render the quote to fill in the blank
  renderQuoteDisplay();
}

// ── Hints ──

function onWordTap(word) {
  if (currentPuzzle.foundWords.has(word)) return;
  const cells = currentPuzzle.wordPositions[word];
  if (!cells || cells.length === 0) return;
  const firstCell = cells[0];
  const el = gridEl.children[firstCell.row * gridSize + firstCell.col];
  if (!el) return;
  el.classList.add("hint-flash");
  setTimeout(() => el.classList.remove("hint-flash"), 1500);
}

function onQuoteBlankTap(idx) {
  const word = currentPuzzle.words[idx];
  const key = word + ":" + idx;
  if (currentPuzzle.foundWords.has(key)) return;
  const cells = currentPuzzle.wordPositions[key];
  if (!cells || cells.length === 0) return;
  const firstCell = cells[0];
  const el = gridEl.children[firstCell.row * gridSize + firstCell.col];
  if (!el) return;
  el.classList.add("hint-flash");
  setTimeout(() => el.classList.remove("hint-flash"), 1500);
}

// ── Completion ──

function showComplete() {
  overlayEl.classList.add("visible");
  setTimeout(() => {
    overlayEl.classList.remove("visible");
    // Remove completed puzzle now that overlay is done
    puzzles.splice(puzzleIdx, 1);
    if (puzzleIdx >= puzzles.length) puzzleIdx = Math.max(puzzles.length - 1, 0);
    goToNewPuzzle();
  }, 2000);
}

// ── Navigation ──

function setCurrent(idx) {
  puzzleIdx = idx;
  currentPuzzle = puzzles[puzzleIdx];
}

function switchTo(idx) {
  setCurrent(idx);
  renderAll();
  saveState();
}

function goToNewPuzzle() {
  // If there are puzzles ahead of current position, go to next one
  if (puzzleIdx < puzzles.length - 1) {
    switchTo(puzzleIdx + 1);
    return;
  }
  // Generate a brand new puzzle
  if (!generatePuzzle() || !currentPuzzle) {
    overlayEl.querySelector("h2").textContent = "Oops!";
    overlayEl.querySelector("p").textContent = "Could not generate a puzzle. Please tap Update.";
    overlayEl.classList.add("visible");
    return;
  }
  // Trim from the front if we're over the limit
  if (puzzles.length >= MAX_PUZZLES) {
    puzzles.shift();
  }
  puzzles.push(currentPuzzle);
  setCurrent(puzzles.length - 1);
  renderAll();
  saveState();
}

function goToPrevPuzzle() {
  if (puzzleIdx <= 0) return;
  switchTo(puzzleIdx - 1);
}

// Confirm dialog helpers
let confirmCallback = null;

function showConfirm(message, callback) {
  confirmMsg.textContent = message;
  confirmCallback = callback;
  confirmDialog.classList.add("visible");
}

confirmYes.addEventListener("click", () => {
  confirmDialog.classList.remove("visible");
  if (confirmCallback) confirmCallback();
  confirmCallback = null;
});

confirmNo.addEventListener("click", () => {
  confirmDialog.classList.remove("visible");
  confirmCallback = null;
});

function needsConfirm() {
  return currentPuzzle.foundWords.size > 0 && currentPuzzle.foundWords.size < currentPuzzle.words.length;
}

btnNext.addEventListener("click", () => {
  if (needsConfirm()) {
    showConfirm("Leave this puzzle?", goToNewPuzzle);
  } else {
    goToNewPuzzle();
  }
});

btnPrev.addEventListener("click", () => {
  if (puzzleIdx <= 0) return;
  if (needsConfirm()) {
    showConfirm("Leave this puzzle?", goToPrevPuzzle);
  } else {
    goToPrevPuzzle();
  }
});

// ── Pointer events on grid ──
gridEl.addEventListener("pointerdown", onPointerDown);
gridEl.addEventListener("pointermove", onPointerMove);
gridEl.addEventListener("pointerup", onPointerUp);
gridEl.addEventListener("pointercancel", onPointerUp);
gridEl.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

document.addEventListener("pointerup", () => {
  if (selecting) {
    if (capturedPointerId != null) {
      try { gridEl.releasePointerCapture(capturedPointerId); } catch (e) { /* already released */ }
      capturedPointerId = null;
    }
    selecting = false;
    checkSelection();
    clearSelectionHighlight();
    currentCells = [];
    updateDragLine();
  }
});

window.addEventListener("resize", () => renderFoundHighlights());

// ── Service Worker ──
if ("serviceWorker" in navigator) {
  let hasController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js");
  // When a new service worker takes over (not on first install), reload to pick up new assets
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hasController) location.reload();
    hasController = true;
  });
}

// ── Update button ──
document.getElementById("btn-update").addEventListener("click", async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
  }
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  location.reload();
});

// ── State Persistence ──

function saveState() {
  try {
    const data = {
      puzzles: puzzles.map(p => ({
        type: p.type || "wordsearch",
        grid: p.grid,
        words: p.words,
        theme: p.theme,
        quote: p.quote || null,
        foundWords: [...p.foundWords],
        foundHighlights: p.foundHighlights,
        wordPositions: p.wordPositions,
        puzzleNumber: p.puzzleNumber
      })),
      puzzleIdx,
      puzzleNumber,
      categoryOrder,
      categoryIndex,
      quoteOrder,
      quoteIndex
    };
    localStorage.setItem("wordsearch-state", JSON.stringify(data));
  } catch (e) {
    // localStorage full or unavailable — silently ignore
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem("wordsearch-state");
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.puzzles) || data.puzzles.length === 0) return false;

    // Validate puzzleIdx bounds
    if (typeof data.puzzleIdx !== "number" || data.puzzleIdx < 0 || data.puzzleIdx >= data.puzzles.length) return false;

    // Validate each puzzle has required fields
    const requiredFields = ["grid", "words", "theme", "foundWords", "wordPositions"];
    for (const p of data.puzzles) {
      for (const f of requiredFields) {
        if (p[f] == null) return false;
      }
    }

    // Discard saved state if grid dimensions don't match current gridSize
    if (data.puzzles[0].grid.length !== gridSize) return false;

    puzzles = data.puzzles.map(p => ({
      type: p.type || "wordsearch",
      grid: p.grid,
      words: p.words,
      theme: p.theme,
      quote: p.quote || null,
      foundWords: new Set(p.foundWords),
      foundHighlights: p.foundHighlights || [],
      wordPositions: p.wordPositions,
      puzzleNumber: p.puzzleNumber
    }));
    puzzleNumber = data.puzzleNumber || 0;

    // Filter categoryOrder to only include keys that still exist in WORD_LISTS
    const validCategories = new Set(Object.keys(WORD_LISTS));
    categoryOrder = Array.isArray(data.categoryOrder)
      ? data.categoryOrder.filter(c => validCategories.has(c))
      : [];
    if (categoryOrder.length === 0) {
      categoryOrder = shuffleArray(validCategories);
    }
    categoryIndex = typeof data.categoryIndex === "number" ? Math.min(data.categoryIndex, categoryOrder.length) : 0;

    // Restore quote cycling state
    if (Array.isArray(data.quoteOrder) && typeof QUOTES !== "undefined") {
      quoteOrder = data.quoteOrder.filter(i => i >= 0 && i < QUOTES.length);
      quoteIndex = typeof data.quoteIndex === "number" ? Math.min(data.quoteIndex, quoteOrder.length) : 0;
    }

    setCurrent(data.puzzleIdx);
    return true;
  } catch (e) {
    return false;
  }
}

// ── Settings ──

function loadSettings() {
  try {
    const raw = localStorage.getItem("wordsearch-settings");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (GRID_CONFIGS[data.gridSize]) {
      gridSize = data.gridSize;
    }
    if (data.quoteInterval != null && data.quoteInterval >= 0 && data.quoteInterval <= 3) {
      quoteInterval = data.quoteInterval;
    }
  } catch (e) {
    // ignore
  }
}

function saveSettings() {
  try {
    localStorage.setItem("wordsearch-settings", JSON.stringify({ gridSize, quoteInterval }));
  } catch (e) {
    // ignore
  }
}

function applyGridSize() {
  document.body.dataset.gridSize = gridSize;
  gridEl.style.setProperty("--grid-size", gridSize);
}

btnSettings.addEventListener("click", () => {
  // Highlight the current size
  const btns = settingsDialog.querySelectorAll(".size-btn");
  btns.forEach(b => b.classList.toggle("selected", Number(b.dataset.size) === gridSize));
  // Highlight the current quote interval
  const qbtns = settingsDialog.querySelectorAll(".quote-btn");
  qbtns.forEach(b => b.classList.toggle("selected", Number(b.dataset.interval) === quoteInterval));
  settingsDialog.classList.add("visible");
});

settingsDialog.addEventListener("click", (e) => {
  if (e.target.classList.contains("size-btn")) {
    settingsDialog.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
    e.target.classList.add("selected");
  }
  if (e.target.classList.contains("quote-btn")) {
    settingsDialog.querySelectorAll(".quote-btn").forEach(b => b.classList.remove("selected"));
    e.target.classList.add("selected");
  }
});

settingsCancel.addEventListener("click", () => {
  settingsDialog.classList.remove("visible");
});

settingsOk.addEventListener("click", () => {
  settingsDialog.classList.remove("visible");
  const selected = settingsDialog.querySelector(".size-btn.selected");
  const newSize = Number(selected.dataset.size);
  const selectedQuote = settingsDialog.querySelector(".quote-btn.selected");
  const newInterval = Number(selectedQuote.dataset.interval);
  if (newSize === gridSize && newInterval === quoteInterval) return;
  gridSize = newSize;
  quoteInterval = newInterval;
  saveSettings();
  applyGridSize();
  // Clear puzzle history and start fresh
  puzzles = [];
  puzzleIdx = -1;
  puzzleNumber = 0;
  initCategories();
  initQuotes();
  if (!generatePuzzle() || !currentPuzzle) return;
  puzzles.push(currentPuzzle);
  setCurrent(0);
  renderAll();
  saveState();
});

// ── Start ──
loadSettings();
applyGridSize();

if (!loadState()) {
  initCategories();
  initQuotes();
  if (!generatePuzzle() || !currentPuzzle) {
    document.body.textContent = "Could not generate a puzzle. Please reload.";
  } else {
    puzzles.push(currentPuzzle);
    setCurrent(0);
  }
}
if (currentPuzzle) renderAll();
