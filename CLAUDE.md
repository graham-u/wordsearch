# Word Search PWA

A word search game for an elderly UK user, installed as a PWA on a tablet.

## Key Files

- `DESIGN.md` — Full spec and architecture documentation
- `app.js` — Game logic, puzzle generation, touch handling, navigation
- `words.js` — Themed word lists (28 categories)
- `style.css` — Layout and styles
- `index.html` — App shell
- `sw.js` — Service worker (network-first caching)
- `tests/` — Automated test suite (see Running Automated Tests below)

## Version Bumping

**Every push that changes user-facing files requires a version bump.** User-facing files are: `app.js`, `words.js`, `style.css`, `index.html`, `sw.js`, `manifest.json`, `icon.svg`. Pushes that only change non-deployed files (`CLAUDE.md`, `DESIGN.md`, `TODO.md`, `tests/`, `.github/`) do not need a bump.

Bump in **two places** simultaneously (in the same commit as the user-facing changes):

1. `index.html` — the `<div id="version">v14</div>` element (user-visible)
2. `sw.js` — the `CACHE_NAME = "wordsearch-v14"` constant (triggers cache refresh)

Both must use the same version number. The version number tells the user which build they're running (visible bottom-right corner).

A **pre-push hook** (`.githooks/pre-push`) enforces this — it blocks pushes that change user-facing files without bumping both version locations. After a fresh clone, activate hooks with:

```bash
git config core.hooksPath .githooks
```

## Deployment

Both environments are hosted on **Cloudflare Pages**, connected to the single `graham-u/wordsearch` GitHub repo. Pushes to the relevant branch trigger automatic deployments.

| Environment | Branch | URL |
|-------------|--------|-----|
| Staging | `staging` | https://staging.wordsearch-ctr.pages.dev/ |
| Production | `production` | https://wordsearch-ctr.pages.dev/ |

**Workflow:** Work on `main` (or feature branches). Merge to `staging` to deploy to staging. Test on the tablet. Then merge to `production` to deploy to production.

```bash
# 1. Deploy to staging (requires approval)
git push origin staging

# 2. Check deployment status
export CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN .env | cut -d= -f2) && export CLOUDFLARE_ACCOUNT_ID=$(grep CLOUDFLARE_ACCOUNT_ID .env | cut -d= -f2) && npx wrangler pages deployment list --project-name wordsearch

# 3. Test on the staging URL, then deploy to production (requires approval)
git push origin production

# 4. Check deployment status again (same command as step 2)
```

Cloudflare API credentials are stored in `.env` (git-ignored). The `wrangler pages deployment list` command shows the status of all deployments.

**Never push directly to production without deploying to staging first.** The production URL is installed as a PWA on the end user's tablet.

## Testing Locally

```bash
python3 -m http.server 8085  # start local server (avoid ports 8080-8081, used by mitmproxy)
```

## Running Automated Tests

**The full test suite must pass before committing and pushing.** If a change is truly trivial (e.g. a comment-only edit), confirm with the user before skipping tests.

Tests use the **dev-browser** skill (Playwright-based browser automation). Two servers must be running:

1. **Local HTTP server** — serves the app files
2. **Dev-browser server** — manages the headless Chromium instance (start via the `dev-browser` skill's `server.sh --headless`)

```bash
# 1. Start local server (use run_in_background, note the task ID)
python3 -m http.server 8085

# 2. Ensure dev-browser server is running (port 9222)
#    Start it if needed — use the skill's server.sh script

# 3. Run full test suite from the dev-browser skill directory
cd <dev-browser-skill-dir> && bun x tsx ~/mnt/ed1/projects/wordsearch/tests/run-all.mjs

# 4. Stop the local server using TaskStop with the background task ID
```

The `<dev-browser-skill-dir>` is the `skills/dev-browser/` directory inside the dev-browser plugin. Use the Skill tool to invoke `dev-browser` — it will show you the base directory path.

Individual test files can also be run directly:

```bash
cd <dev-browser-skill-dir> && bun x tsx ~/mnt/ed1/projects/wordsearch/tests/<file>.mjs
```

Test files: `smoke.mjs`, `wordlists.mjs`, `puzzle.mjs`, `gameplay.mjs`, `hints.mjs`, `navigation.mjs`, `settings.mjs`

## Audience

The target user is an elderly person in the UK. All word lists use British English spellings and UK-centric references. UI should be clear, simple, with large touch targets.

## Device & Orientation

The app runs as a PWA on a tablet in **portrait mode**. Always test and evaluate layout in portrait orientation.
