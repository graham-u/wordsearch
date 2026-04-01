#!/bin/bash
# Build script for Cloudflare Pages
# Production: no-op (files served as-is)
# Staging: applies visual branding to distinguish from production

if [ "$CF_PAGES_BRANCH" = "staging" ]; then
  echo "Applying staging branding..."

  # Background colour — append override (no string matching needed)
  cat >> style.css <<'CSS'

/* Staging environment branding */
body { background: #fef3c7; }
CSS

  # Icon — orange background, "DEV" label
  cat > icon.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#f97316"/>
  <text x="256" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="160" font-weight="bold" fill="white">DEV</text>
  <g fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4">
    <line x1="100" y1="280" x2="412" y2="280"/>
    <line x1="100" y1="330" x2="412" y2="330"/>
    <line x1="100" y1="380" x2="412" y2="380"/>
    <line x1="100" y1="430" x2="300" y2="430"/>
  </g>
  <line x1="130" y1="280" x2="310" y2="280" stroke="rgba(52,211,153,0.8)" stroke-width="24" stroke-linecap="round"/>
  <line x1="200" y1="330" x2="370" y2="330" stroke="rgba(251,191,36,0.8)" stroke-width="24" stroke-linecap="round"/>
</svg>
SVG

  # App title and manifest name
  sed -i 's/"Word Search"/"Word Search (Staging)"/g' manifest.json
  sed -i 's/<title>Word Search<\/title>/<title>Word Search (Staging)<\/title>/' index.html

  echo "Staging branding applied."
fi
