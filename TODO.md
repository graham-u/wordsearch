# Word Search — TODO / Future Features

All features listed below from the original plan have been implemented.
This file now tracks future enhancements only.

- Check which copy the tablet runs, by the version number in the app's
  bottom-right corner. Production (`production` branch, Cloudflare) and the
  GitHub Pages copy (`main`) carry different numbers while `main` is ahead of
  `production`; compare with `git show origin/<branch>:index.html`. If it is
  Cloudflare production, remove `.github/workflows/pages.yml` and turn off
  GitHub Pages for the repo; if it is `graham-u.github.io/wordsearch`, move the
  tablet to Cloudflare first.
