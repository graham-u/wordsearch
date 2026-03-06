const GRID_SIZE = 8;
const WORDS_PER_PUZZLE = 8;
const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [0, -1],  // left
  [-1, 0],  // up
  [1, 1],   // down-right
  [1, -1],  // down-left
  [-1, 1],  // up-right
  [-1, -1]  // up-left
];

let grid = [];
let placedWords = [];
let foundWords = new Set();
let level = 1;

// ── Selection state ──
let selecting = false;
let startCell = null;
let currentCells = [];

// ── DOM refs ──
const gridEl = document.getElementById("grid");
const wordListEl = document.getElementById("word-list");
const overlayEl = document.getElementById("overlay");
const levelEl = document.getElementById("level-indicator");
const gridWrapper = document.getElementById("grid-wrapper");

// ── Puzzle Generation ──

function pickWords() {
  // Shuffle and pick words that fit in the grid
  const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5);
  const picked = [];
  const seen = new Set();
  for (const word of shuffled) {
    if (word.length <= GRID_SIZE && !seen.has(word)) {
      picked.push(word);
      seen.add(word);
      if (picked.length === WORDS_PER_PUZZLE) break;
    }
  }
  return picked;
}

function generatePuzzle() {
  // Try to place all words; retry if placement fails
  for (let attempt = 0; attempt < 50; attempt++) {
    const words = pickWords();
    const result = tryPlaceWords(words);
    if (result) {
      grid = result;
      placedWords = words;
      fillBlanks(grid);
      return;
    }
  }
  // Fallback: fewer words
  for (let fewer = WORDS_PER_PUZZLE - 1; fewer >= 3; fewer--) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const words = pickWords().slice(0, fewer);
      const result = tryPlaceWords(words);
      if (result) {
        grid = result;
        placedWords = words;
        fillBlanks(grid);
        return;
      }
    }
  }
}

function tryPlaceWords(words) {
  const g = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  // Sort longer words first — they're harder to place
  const sorted = [...words].sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    if (!placeWord(g, word)) return null;
  }
  return g;
}

function placeWord(g, word) {
  // Try random directions and positions
  const dirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);
  for (const [dr, dc] of dirs) {
    const positions = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlace(g, word, r, c, dr, dc)) {
          positions.push([r, c]);
        }
      }
    }
    if (positions.length > 0) {
      const [r, c] = positions[Math.floor(Math.random() * positions.length)];
      for (let i = 0; i < word.length; i++) {
        g[r + dr * i][c + dc * i] = word[i];
      }
      return true;
    }
  }
  return false;
}

function canPlace(g, word, r, c, dr, dc) {
  for (let i = 0; i < word.length; i++) {
    const nr = r + dr * i;
    const nc = c + dc * i;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false;
    if (g[nr][nc] !== "" && g[nr][nc] !== word[i]) return false;
  }
  return true;
}

function fillBlanks(g) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (g[r][c] === "") {
        g[r][c] = letters[Math.floor(Math.random() * 26)];
      }
    }
  }
}

// ── Rendering ──

function renderGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridEl.appendChild(cell);
    }
  }
  renderHighlightSVG();
}

function renderWordList() {
  wordListEl.innerHTML = "";
  for (const word of placedWords) {
    const tag = document.createElement("span");
    tag.className = "word-tag";
    tag.textContent = word;
    tag.id = "tag-" + word;
    wordListEl.appendChild(tag);
  }
}

function renderLevel() {
  levelEl.textContent = "Puzzle " + level;
}

// ── SVG highlight lines for found words ──

let foundHighlights = []; // {startRow, startCol, endRow, endCol, color}

const HIGHLIGHT_COLORS = [
  "rgba(239, 68, 68, 0.35)",   // red
  "rgba(59, 130, 246, 0.35)",  // blue
  "rgba(34, 197, 94, 0.35)",   // green
  "rgba(168, 85, 247, 0.35)",  // purple
  "rgba(245, 158, 11, 0.35)",  // amber
  "rgba(236, 72, 153, 0.35)",  // pink
  "rgba(20, 184, 166, 0.35)",  // teal
  "rgba(249, 115, 22, 0.35)"   // orange
];

function renderHighlightSVG() {
  let svg = gridWrapper.querySelector("#highlight-svg");
  if (svg) svg.remove();

  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "highlight-svg";
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "2";

  const cellSize = gridWrapper.offsetWidth / GRID_SIZE;

  for (const h of foundHighlights) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", h.startCol * cellSize + cellSize / 2);
    line.setAttribute("y1", h.startRow * cellSize + cellSize / 2);
    line.setAttribute("x2", h.endCol * cellSize + cellSize / 2);
    line.setAttribute("y2", h.endRow * cellSize + cellSize / 2);
    line.setAttribute("stroke", h.color);
    line.setAttribute("stroke-width", cellSize * 0.7);
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
  }

  // Current selection line
  if (selecting && currentCells.length > 1) {
    const first = currentCells[0];
    const last = currentCells[currentCells.length - 1];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", first.col * cellSize + cellSize / 2);
    line.setAttribute("y1", first.row * cellSize + cellSize / 2);
    line.setAttribute("x2", last.col * cellSize + cellSize / 2);
    line.setAttribute("y2", last.row * cellSize + cellSize / 2);
    line.setAttribute("stroke", "rgba(37, 99, 235, 0.3)");
    line.setAttribute("stroke-width", cellSize * 0.7);
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
  }

  gridWrapper.appendChild(svg);
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

  // Must be in a straight line (horizontal, vertical, or 45-degree diagonal)
  if (rowDist !== colDist && rowDist !== 0 && colDist !== 0) return null;

  const steps = Math.max(rowDist, colDist);
  const cells = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ row: r1 + dr * i, col: c1 + dc * i });
  }
  return cells;
}

function clearSelectionHighlight() {
  document.querySelectorAll(".cell.selecting").forEach((c) => c.classList.remove("selecting"));
}

function highlightCells(cells) {
  clearSelectionHighlight();
  for (const { row, col } of cells) {
    const el = gridEl.children[row * GRID_SIZE + col];
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
  highlightCells(currentCells);
  renderHighlightSVG();
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
    renderHighlightSVG();
  }
}

function onPointerUp(e) {
  if (!selecting) return;
  e.preventDefault();
  selecting = false;
  checkSelection();
  clearSelectionHighlight();
  currentCells = [];
  renderHighlightSVG();
}

function checkSelection() {
  if (currentCells.length < 2) return;
  const selected = currentCells.map(({ row, col }) => grid[row][col]).join("");
  const reversed = [...selected].reverse().join("");

  for (const word of placedWords) {
    if (foundWords.has(word)) continue;
    if (selected === word || reversed === word) {
      foundWords.add(word);
      markFound(word);
      // Add highlight line
      foundHighlights.push({
        startRow: currentCells[0].row,
        startCol: currentCells[0].col,
        endRow: currentCells[currentCells.length - 1].row,
        endCol: currentCells[currentCells.length - 1].col,
        color: HIGHLIGHT_COLORS[foundHighlights.length % HIGHLIGHT_COLORS.length]
      });
      renderHighlightSVG();
      if (foundWords.size === placedWords.length) {
        setTimeout(showComplete, 300);
      }
      return;
    }
  }
}

function markFound(word) {
  const tag = document.getElementById("tag-" + word);
  if (tag) tag.classList.add("found");
  // Also mark grid cells
  // (the SVG line handles the visual; we also tint the cells)
  for (const { row, col } of currentCells) {
    const el = gridEl.children[row * GRID_SIZE + col];
    if (el) el.classList.add("found-cell");
  }
}

function showComplete() {
  overlayEl.classList.add("visible");
  setTimeout(() => {
    overlayEl.classList.remove("visible");
    level++;
    startPuzzle();
  }, 2000);
}

// ── Initialise ──

function startPuzzle() {
  foundWords.clear();
  foundHighlights = [];
  generatePuzzle();
  renderGrid();
  renderWordList();
  renderLevel();
}

// Pointer events on grid
gridEl.addEventListener("pointerdown", onPointerDown);
gridEl.addEventListener("pointermove", onPointerMove);
gridEl.addEventListener("pointerup", onPointerUp);
gridEl.addEventListener("pointercancel", onPointerUp);
// Prevent scrolling while dragging on the grid
gridEl.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

// Re-render SVG on resize (so highlight lines stay aligned)
window.addEventListener("resize", () => renderHighlightSVG());

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// Start
startPuzzle();
