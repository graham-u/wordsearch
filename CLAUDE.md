# Word Search PWA

A word search game for an elderly UK user, installed as a PWA on a tablet.

## Key Files

- `DESIGN.md` — Full spec and architecture documentation
- `app.js` — Game logic, puzzle generation, touch handling, navigation
- `words.js` — Themed word lists (28 categories)
- `style.css` — Layout and styles
- `index.html` — App shell
- `sw.js` — Service worker (network-first caching)
- `tests/navigation.mjs` — Automated navigation test

## Version Bumping

When deploying changes, bump the version in **two places** simultaneously:

1. `index.html` — the `<div id="version">v4</div>` element (user-visible)
2. `sw.js` — the `CACHE_NAME = "wordsearch-v4"` constant (triggers cache refresh)

Both must use the same version number. Bump only at deploy time, not during development. The version number tells the user which build they're running (visible bottom-right corner).

## Deployment

Push to `main` triggers GitHub Pages deployment via `.github/workflows/pages.yml`. Takes ~15-20 seconds. Monitor with:

```bash
run_id=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId') && gh run watch "$run_id" --exit-status
```

Live at: https://graham-u.github.io/wordsearch/

## Testing Locally

```bash
python3 -m http.server 8085  # start local server (avoid ports 8080-8081, used by mitmproxy)
```

## Running Automated Tests

Requires dev-browser server and local HTTP server:

```bash
cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/navigation.mjs
```

## Audience

The target user is an elderly person in the UK. All word lists use British English spellings and UK-centric references. UI should be clear, simple, with large touch targets.
