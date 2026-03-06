// Word list data validation
// Run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/wordlists.mjs

import { freshPage, check, results, disconnect, page } from "./helpers.mjs";

await freshPage();
const p = page();

console.log("=== Word list validation ===");

const data = await p.evaluate(() => {
  const categories = Object.keys(WORD_LISTS);
  const details = {};
  for (const cat of categories) {
    const words = WORD_LISTS[cat];
    details[cat] = {
      count: words.length,
      words,
    };
  }
  return { categories, details };
});

const catCount = data.categories.length;
check("at least 20 categories", catCount >= 20, true);
console.log(`  (found ${catCount} categories)`);

let totalWords = 0;
let allCategoriesOk = true;

for (const cat of data.categories) {
  const info = data.details[cat];
  totalWords += info.count;

  // Category name is non-empty
  if (typeof cat !== "string" || cat.length === 0) {
    console.log(`  FAIL category "${cat}" has invalid name`);
    allCategoriesOk = false;
    continue;
  }

  // At least 30 words (enough for pickWords to find 8)
  if (info.count < 30) {
    console.log(`  FAIL "${cat}" has ${info.count} words (need >= 30)`);
    allCategoriesOk = false;
  }

  // Check each word
  const seen = new Set();
  for (const word of info.words) {
    // Uppercase A-Z only
    if (!/^[A-Z]+$/.test(word)) {
      console.log(`  FAIL "${cat}" word "${word}" contains invalid characters`);
      allCategoriesOk = false;
    }

    // 3-8 characters
    if (word.length < 3 || word.length > 8) {
      console.log(`  FAIL "${cat}" word "${word}" length ${word.length} (need 3-8)`);
      allCategoriesOk = false;
    }

    // No duplicates within category
    if (seen.has(word)) {
      console.log(`  FAIL "${cat}" duplicate word "${word}"`);
      allCategoriesOk = false;
    }
    seen.add(word);
  }
}

check("all categories valid", allCategoriesOk, true);
console.log(`  (total ${totalWords} words across ${catCount} categories)`);

await disconnect();
process.exit(results());
