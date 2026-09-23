# Word Search PWA

A word search game for an elderly UK user, installed as a PWA on a tablet.

## Key Files

- `DESIGN.md` — Full spec and architecture documentation
- `app.js` — Game logic, puzzle generation, touch handling, navigation
- `words.js` — Themed word lists (28 categories)
- `quotes.js` — Quotes for the Quote Game puzzle type
- `style.css` — Layout and styles
- `index.html` — App shell
- `sw.js` — Service worker (network-first caching)
- `tests/` — Automated test suite (see Running Automated Tests below)

## Version Bumping

**Every push that changes user-facing files requires a version bump.** User-facing files are: `app.js`, `words.js`, `quotes.js`, `style.css`, `index.html`, `sw.js`, `manifest.json`, `icon.svg`, `icon-180.png`. Pushes that only change non-deployed files (`CLAUDE.md`, `DESIGN.md`, `TODO.md`, `tests/`, `.github/`) do not need a bump.

Bump in **two places** simultaneously (in the same commit as the user-facing changes):

1. `index.html` — the `<div id="version">vN</div>` element (user-visible)
2. `sw.js` — the `CACHE_NAME = "wordsearch-vN"` constant (triggers cache refresh)

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
# 1. Deploy to staging (requires user approval)
git push origin staging

# 2. Check deployment status
bash check-deploy.sh

# 3. Test on the staging URL, then deploy to production (requires user approval)
git push origin production

# 4. Check deployment status again (same command as step 2)
```

Cloudflare API credentials are stored in `.env` (git-ignored). `check-deploy.sh` (also git-ignored) wraps the wrangler deployment list command.

A `build.sh` script runs at deploy time on Cloudflare Pages. On the `staging` branch it applies visual branding (yellow background, orange "DEV" icon, "(Staging)" title). On `production` it's a no-op.

**Never push directly to production without deploying to staging first.** The production URL is installed as a PWA on the end user's tablet.

## Testing Locally

```bash
python3 -m http.server 8085  # start local server (avoid ports 8080-8081, used by mitmproxy)
```

## Running Automated Tests

**The full test suite must pass before committing and pushing.** If a change is truly trivial (e.g. a comment-only edit), confirm with the user before skipping tests.

Tests use the **dev-browser** skill (Playwright-based browser automation) and need two servers:

1. **Local HTTP server** — serves the app files on port 8085. Start it in the background before the run and stop it afterwards.
2. **Dev-browser server** — the `dev-browser.service` systemd user unit, already running on port 9222 (see `~/.claude/reference/dev-browser.md`).

```bash
python3 -m http.server 8085
cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/run-all.mjs
```

Individual test files can also be run directly:

```bash
cd ~/.claude/skills/dev-browser && npx tsx ~/projects/wordsearch/tests/<file>.mjs
```

Test files: `smoke.mjs`, `wordlists.mjs`, `puzzle.mjs`, `gameplay.mjs`, `hints.mjs`, `navigation.mjs`, `settings.mjs`

## Audience

The target user is an elderly person in the UK. All word lists use British English spellings and UK-centric references. UI should be clear, simple, with large touch targets.

## Device & Orientation

The app runs as a PWA on a tablet in **portrait mode**. Always test and evaluate layout in portrait orientation.
