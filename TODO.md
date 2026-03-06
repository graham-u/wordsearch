# Word Search — Upcoming Features

## Hints
- Tapping a word in the word list offers to reveal the first letter's position in the grid
- Highlight flashes briefly (1-2 seconds) then fades
- Only available for words not yet found

## Navigation (Previous / Next Puzzle)
- Buttons at the bottom of the screen: Previous Puzzle | Next Puzzle
- "Next Puzzle" generates a new puzzle (same as current auto-advance)
- "Previous Puzzle" navigates back through incomplete puzzles
- Store up to 5 most recent incomplete puzzles (completed ones are discarded)
- Both buttons require a confirmation prompt before switching ("Leave this puzzle?")

## Themed Word Lists
- Replace single flat word list with categorised lists stored locally in the PWA
- 25-30 categories, each with 30-40 common words (4-7 letters, max 8)
- Each puzzle picks 8 words at random from one category
- Theme name shown in UI (e.g. "Puzzle 12 — Animals")
- Cycle through categories in shuffled order (no repeats until all used), then reshuffle
- UK-centric references and British spellings throughout
- Words should be commonly known to an elderly UK audience — no obscure or technical terms

### Categories (target ~28)
Animals, Birds, Sea Life, Insects, Fruit, Vegetables, Cooking, Drinks,
Colours, Weather, Flowers, Trees, Clothing, Kitchen, Furniture, Tools,
Countries, Cities, Sports, Music, Body Parts, Family, Jobs, Transport,
Gems/Stones, Fabrics, Garden, Sweets/Treats

### Implementation notes
- Store all lists in words.js as an object keyed by category name
- On first load (or when cycle exhausts), shuffle category order and store index
- Advance through shuffled order so every category appears before any repeats
- Duplicate words across categories is fine (e.g. ORANGE in Fruit and Colours) but not within one puzzle
