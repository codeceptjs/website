# CodeceptJS brand assets

Source logo files. `yellow` is the primary brand color (honey gold `#F2A900`);
`violet` (`#CD94FF`) is an alternate set.

| File | Use |
| --- | --- |
| `logo-light.svg` | Full logo, dark text — for **light** backgrounds |
| `logo-dark.svg` | Full logo, white text — for **dark** backgrounds |
| `logo-violet-light.svg` / `logo-violet-dark.svg` | Violet alternates |
| `icon.svg` | Icon mark only (yellow) |
| `icon-violet.svg` | Icon mark only (violet) |
| `favicon.ico` | Multi-resolution favicon (yellow) |
| `favicon-violet.ico` | Multi-resolution favicon (violet) |

Every logo and icon also ships as a `.png` next to its `.svg` — full logos at
1200px wide, icons at 512×512, transparent background. Regenerate them from the
SVGs with ImageMagick (`magick -background none -density 600 logo-light.svg
-resize 1200x logo-light.png`).

Where they are wired in:

- Header logo — `logo-light.svg` / `logo-dark.svg` are copied to `src/assets/`
  and set as the Starlight `logo` in `astro.config.mjs`.
- Favicon — `icon.svg` → `public/favicon.svg`, `favicon.ico` → `public/favicon.ico`.
- Touch / PWA icons — `public/apple-touch-icon.png`, `public/favicon-192.png`,
  `public/favicon-512.png` are generated from `icon.svg`.
- Social preview — `public/og-image.png` is composed from `logo-dark.svg`.
