#!/bin/bash
# Check Cloudflare Pages deployment status for wordsearch
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
export CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN "$DIR/.env" | cut -d= -f2)
export CLOUDFLARE_ACCOUNT_ID=$(grep CLOUDFLARE_ACCOUNT_ID "$DIR/.env" | cut -d= -f2)
npx wrangler pages deployment list --project-name wordsearch 2>&1 | grep -v "^$"
