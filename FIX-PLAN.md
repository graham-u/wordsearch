# Fix Plan — Code Review Findings

Prioritised fixes from the Opus code review (2026-03-06). Work through these in order.

---

## Fix 1 — CRITICAL: `generatePuzzle()` silent failure

**Problem:** If all 20 placement attempts fail, `generatePuzzle()` returns without setting `currentPuzzle`. Callers push `null` into `puzzles[]` and `renderAll()` crashes on `currentPuzzle.grid`. No category fallback exists despite DESIGN.md claiming one.

**File:** `app.js:83-103`

**Plan:**
- Add a category-fallback loop: if placement fails for the current category, try `nextCategory()` again (up to e.g. 5 different categories).
- If all categories fail (should be essentially impossible), show a user-visible error rather than crashing.
- Guard `goToNewPuzzle()` and the startup code so they never push `null` into `puzzles[]`.
- Update DESIGN.md to match the actual retry/fallback behaviour.

---

## Fix 2 — HIGH: Crash on reload during completion overlay

**Problem:** `showComplete()` splices the completed puzzle out of the array and calls `saveState()` with a potentially invalid `puzzleIdx` of -1 (when only one puzzle existed). If the user closes the app during the 2-second overlay, `loadState()` restores `puzzleIdx = -1`, setting `currentPuzzle = undefined`, and the app crashes.

**File:** `app.js:413-424`

**Plan:**
- Don't splice + save until the overlay dismisses. Move the splice and `saveState()` into the `setTimeout` callback, just before `goToNewPuzzle()`.
- Alternatively: after splicing, immediately generate the next puzzle and push it so the saved state is always valid before `saveState()` runs.
- The simpler approach is the first one — delay the destructive state change until we're ready to move on.

---

## Fix 3 — HIGH: User can interact during completion overlay

**Problem:** During the 2-second "Well Done!" overlay, nav buttons are still clickable (they sit outside the overlay). `currentPuzzle` references a puzzle already removed from the array.

**File:** `app.js:413-424`

**Plan:**
- This is largely resolved by Fix 2 (not splicing until the overlay dismisses).
- Additionally, disable pointer events on the nav buttons while the overlay is visible. Either:
  - Add a guard flag (`let completing = false;`) checked by button handlers, or
  - Use CSS: when `#overlay.visible` is active, set `#nav-bar { pointer-events: none; }`.
- The CSS approach is simpler and more robust.

---

## Fix 4 — HIGH: Pointer capture not released in document-level pointerup

**Problem:** The fallback `document.addEventListener("pointerup")` handler (for drags ending outside the grid) resets selection state but never calls `releasePointerCapture()` because it has no `pointerId`. Could leave the grid stuck on some touch devices.

**File:** `app.js:510-518`

**Plan:**
- Store the captured `pointerId` in a module-level variable when `setPointerCapture` is called in `onPointerDown`.
- In the document-level `pointerup` handler, release capture using the stored ID (with a try/catch since the capture may have already been released).
- Clear the stored ID after release.

---

## Fix 5 — MEDIUM: `loadState()` doesn't validate data shape

**Problem:** No bounds check on `puzzleIdx`, no validation that puzzle objects have required fields, no check that `categoryOrder` entries still exist in `WORD_LISTS`. Corrupted localStorage or stale categories from a code update crash the app.

**File:** `app.js:569-592`

**Plan:**
- Add bounds check: `if (data.puzzleIdx < 0 || data.puzzleIdx >= data.puzzles.length) return false;`
- Validate each puzzle has the required fields (`grid`, `words`, `theme`, `foundWords`, `wordPositions`). If any is missing, `return false` (discard saved state, start fresh).
- Filter `categoryOrder` to only include keys that exist in `WORD_LISTS`. If it becomes empty, reinitialise it.
- Wrap the whole reconstruction in try/catch so any unexpected shape falls through to a fresh start.

---

## Fix 6 — MEDIUM: DESIGN.md out of sync

**Problem:** DESIGN.md says "100 attempts" and "a different category is tried"; code does 20 attempts with no fallback.

**File:** `DESIGN.md:33`

**Plan:**
- Update DESIGN.md to match whatever the code does after Fix 1 is applied.

---

## Fix 7 — LOW: iOS ignores SVG apple-touch-icon

**Problem:** iOS requires PNG for `apple-touch-icon`. The target device is a tablet (likely iPad), so the home screen icon will be a page screenshot instead of the app icon.

**File:** `index.html:10`

**Plan:**
- Generate a 180x180 PNG version of `icon.svg`.
- Update the `apple-touch-icon` link to point to the PNG.
- Keep the SVG `<link rel="icon">` for browsers that support it.

---

## Fix 8 — LOW: Only 8 highlight colours for 9 words

**Problem:** `HIGHLIGHT_COLORS` has 8 entries but there are 9 words per puzzle. The 9th found word reuses the 1st colour.

**File:** `app.js:8-17`

**Plan:**
- Add a 9th colour to `HIGHLIGHT_COLORS`. Pick something distinct from the existing 8 (e.g. a brown/chocolate or a slate/steel blue).

---

## Fix 9 — LOW: SVG rebuilt on every pointermove

**Problem:** `renderHighlightSVG()` removes and recreates the entire SVG (including all found-word lines) on every pointer move event. Wasteful but not a real performance issue at this scale.

**File:** `app.js:226-264`

**Plan:**
- Keep the SVG element persistent (create once, never remove).
- Separate the "found word" lines from the "current drag" line. Only update the drag line element on pointermove. Rebuild found-word lines only when a word is found.
- This is a nice-to-have optimisation. Skip if the other fixes are enough work.

---

## Execution Notes

- Fixes 1-5 are the important ones. Fixes 6-9 are polish.
- Fix 2 and Fix 3 overlap — implement them together.
- After all fixes, run the full test suite before committing.
- Version bump required (both `index.html` and `sw.js`) since these are user-facing file changes.
