// Test runner — runs all test files sequentially
// Run with: cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/run-all.mjs

import { execFileSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const tests = [
  "smoke.mjs",
  "wordlists.mjs",
  "puzzle.mjs",
  "gameplay.mjs",
  "hints.mjs",
  "navigation.mjs",
];

const results = [];

for (const test of tests) {
  const testPath = join(__dirname, test);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running: ${test}`);
  console.log("=".repeat(60));

  try {
    execFileSync("npx", ["tsx", testPath], {
      stdio: "inherit",
      timeout: 60000,
    });
    results.push({ test, passed: true });
  } catch (err) {
    results.push({ test, passed: false });
  }
}

// Summary
console.log(`\n${"=".repeat(60)}`);
console.log("SUMMARY");
console.log("=".repeat(60));

for (const { test, passed } of results) {
  console.log(`  ${passed ? "PASS" : "FAIL"}  ${test}`);
}

const failed = results.filter(r => !r.passed).length;
if (failed === 0) {
  console.log(`\nAll ${results.length} test files passed.`);
} else {
  console.log(`\n${failed} of ${results.length} test file(s) failed.`);
}

process.exit(failed > 0 ? 1 : 0);
