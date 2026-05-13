---
name: codecept-diagram
description: Compose embeddable perspective-style SVG+PNG diagrams for codecept.site docs. Uses the site's honey-gold palette, Bricolage/Inter/JetBrains fonts, and the rehype-inject-figure plugin so diagrams land in upstream-synced markdown without editing the .md file.
---

# /codecept-diagram

Build a diagram for a docs page on codecept.site and wire it into the page via the rehype injection plugin. The style is locked to **perspective** (white card + side parallelograms + ambient drop shadow) in the site's honey-gold palette. No icons — typography only. Up to 5 elements per diagram.

## When to use

- Any docs page that needs a hero-style explanation graphic (one per major section, sometimes two)
- The user names a section / `## Heading` to land the diagram under
- The doc is upstream-synced from the CodeceptJS repo and **must not be edited** — use the rehype plugin

If the user already gave you the concept + heading, **don't ask back**. Read the doc, design, render, embed.

## Non-negotiables

### 1 · Read the doc first

The diagram **explains what the doc says**, not what you think the topic is.

- Open the target `.md` under `src/content/docs/`
- If the doc has a table (preference order, lifecycle order, …), the diagram **must follow that order exactly**
- Use the doc's terminology verbatim — `BeforeSuite`, `Scenario`, `inject()`, `helpers`, `I.click()` — not invented buckets like "Hooks block" or "Tags block"
- If you need to verify runtime behavior, read the CodeceptJS source at `/home/davert/.bun/install/cache/codeceptjs@*/lib/` — `container.js`, `actor.js`, `globals.js`, `mocha/inject.js` are the load-bearing files

### 2 · Read existing diagrams for the visual grammar

Before composing, open one or two of these and use them as the geometric template:

- `/public/test-structure.svg` — container-with-inner-blocks, serpentine arrows
- `/public/pageobjects-di.svg` — 3-card row with code blocks and arrows between
- `/public/helpers-delegation.svg` — hub-and-spoke (1 hub + 4 satellites, fan-out arrows)
- `/public/locators.svg` — 4-card preference row, no kickers, plain examples
- `/public/agents-loop.svg` — cycle / loop
- `/public/skills-bundle.svg` — bundle / set
- `/public/retry-levels.svg` — nested-levels stack

Don't reinvent geometry the existing diagrams already solve. Copy the structure and re-skin it for the new concept.

### 3 · Verify by eye (per memory)

`magick` dimension/transparency checks do **not** catch cut text, clipped content, or arrows pointing at nothing. After rendering the PNG you **must** `Read` it and trace each element by sight. If anything is clipped, increase the viewBox and re-render.

## Style tokens

### Fonts (always loaded via `@import` in `<style>`)

```
Bricolage Grotesque  — titles, hero headings  (700, ss01+ss02, tight tracking)
Inter                — body text              (500, slightly tight)
JetBrains Mono       — kicker, code, hero monospace
```

`@import` line — paste verbatim at the top of `<style>`:

```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400..700&display=swap');
```

(In SVG, `&` must be written as `&amp;` inside the `<style>` text node.)

### Typography classes (use these names — the rehype plugin scopes them per-figure so they don't clash)

```css
.kicker   { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; }
.title-xl { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 32px; letter-spacing: -0.025em; font-feature-settings: 'ss01','ss02'; }
.title    { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 24px; letter-spacing: -0.02em; font-feature-settings: 'ss01','ss02'; }
.body     { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px; letter-spacing: -0.005em; }
.hero     { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 28px; letter-spacing: -0.01em; }
.mono-lg  { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 14px; }
.mono     { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 13px; }
.mono-sm  { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 12px; }
.backend  { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 12px; }
```

Title size is the only thing that wobbles between diagrams — 23–26 px is normal, 32 for a hero. Pick once per diagram, don't change mid-svg.

### Palette

Honey gold (accents, arrows, kickers-on-emphasis, code keywords):
- `#F2A900` — light honey (rarely used; prefer #C88800)
- `#C88800` — primary honey, all arrows and primary accents

Neutral type:
- `#111827` — main card title
- `#1F2937` — code default
- `#334155` — muted heading (e.g. optional-block title)
- `#4B5563` — body text
- `#6B7280` — italic subtitle next to title
- `#64748B` — mono muted (backend / right-aligned annotation)
- `#94A3B8` — kicker muted (optional blocks)
- `#9CA3AF` — code comments, very subtle annotations

Panel / surface:
- `#FFFFFF` — card front (default)
- `#F1F5F9` — perspective top face
- `#E2E8F0` — perspective right face
- `#FAFAF7` — code block fill
- `#F0EDE5` — code block 1px border

Honey container (only the outermost wrap-block when a diagram has nested children, like `test-structure`):
- `#FFFBF0` — container front
- `#FFF1D6` — container top face
- `#F5E5B0` — container right face

### Shadow filters

Define both in `<defs>` and pick per card:

```xml
<filter id="ambient" x="-12%" y="-12%" width="124%" height="124%">
  <feDropShadow dx="0" dy="4" stdDeviation="9" flood-color="#1a1d28" flood-opacity="0.12"/>
</filter>
<filter id="ambientSoft" x="-12%" y="-12%" width="124%" height="124%">
  <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#1a1d28" flood-opacity="0.08"/>
</filter>
```

`ambient` for hero / primary cards. `ambientSoft` for inner / secondary cards (e.g. the `Before` / `BeforeSuite` strips inside the Feature container).

### Arrow marker

```xml
<marker id="arrowGold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
  <path d="M0,1 L9,5 L0,9 z" fill="#C88800"/>
</marker>
```

Arrows are `<line>` or `<path>` with `stroke="#C88800" stroke-width="2.2-2.4" stroke-linecap="round" marker-end="url(#arrowGold)"`. **Never** use the literal `→` character for diagram arrows.

## The perspective card

A card of logical width `W` and height `H` placed at origin `(0,0)` of a `<g transform="translate(x, y)">`:

```xml
<g transform="translate(x, y)">
  <!-- top face: 14px push-up, 14px right -->
  <path d="M0,0 L{W},0 L{W+14},-8 L14,-8 Z" fill="#F1F5F9"/>
  <!-- right face: 14px right, mirrors the top depth -->
  <path d="M{W},0 L{W+14},-8 L{W+14},{H-8} L{W},{H} Z" fill="#E2E8F0"/>
  <!-- front: white rect with ambient shadow -->
  <rect width="{W}" height="{H}" fill="#FFFFFF" filter="url(#ambient)"/>

  <!-- content -->
  <text x="24" y="..." class="title" fill="#111827">...</text>
</g>
```

The 14 px / 8 px offsets are fixed — they define the "perspective" feel. Don't tune them per card.

For a honey container, swap fills to `#FFF1D6 / #F5E5B0 / #FFFBF0`.

### Inner code block

When a card shows code, wrap it in a soft rounded panel:

```xml
<rect x="24" y="76" width="{W-48}" height="..." rx="8" fill="#FAFAF7" stroke="#F0EDE5" stroke-width="1"/>
<text x="40" y="..." class="mono" fill="#9CA3AF">// comment</text>
<text x="40" y="..." class="mono"><tspan fill="#C88800">keyword</tspan><tspan fill="#1F2937">: value</tspan></text>
```

Use `<tspan>` for inline colored tokens. Comments are `#9CA3AF`, keywords `#C88800`, default text `#1F2937`.

## Layout patterns

Pick one based on the relationship:

| Doc concept                                    | Shape                                | See                          |
|------------------------------------------------|--------------------------------------|------------------------------|
| Lifecycle / required container + inner phases  | Honey container wrapping inner cards | `test-structure.svg`         |
| Preference order / strategy list (2–4 items)   | Horizontal card row, no arrows       | `locators.svg`               |
| 3-step pipeline                                | 3-card row with arrows between       | `pageobjects-di.svg`         |
| One thing delegates to N things                | 1 hub + N satellites, fan-out arrows | `helpers-delegation.svg`     |
| Cycle / loop                                   | Circular ring of stages              | `agents-loop.svg`            |
| Nested levels (inner → outer scope)            | Concentric stack                     | `retry-levels.svg`           |

If the doc shape doesn't match any of these, copy the closest one and adapt.

## Workflow

1. **Read the target .md** under `src/content/docs/<page>.md`. Note the exact heading you'll inject under and the doc's terminology.
2. **Pick a shape** by matching the doc concept to the table above. Open the reference SVG and read its geometry.
3. **Compose the SVG** at `/public/<slug>.svg`.
   - `viewBox` sized to your geometry, with ~30 px top / 50 px bottom / 50–96 px L+R padding so nothing kisses the edge.
   - No full-page `<rect>` background (kills transparency on the page).
   - `width` and `height` attributes match the viewBox numerically (the rehype plugin strips them so the figure scales).
4. **Render the PNG at 2× DPI**:
   ```bash
   google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
     --window-size=<W>,<H> \
     --force-device-scale-factor=2 \
     --default-background-color=00000000 \
     --screenshot=/home/davert/sites/codecept.site/public/<slug>.png \
     file:///home/davert/sites/codecept.site/public/<slug>.svg
   ```
   `<W>` and `<H>` are the logical viewBox dimensions. The PNG comes out 2W × 2H.
5. **Verify by eye** — `Read` the PNG. Check: every arrow has both ends visible and points the right way, no text is clipped (especially the bottom row of the last card), no serif fallback (fonts loaded), palette matches.
6. **Embed via the plugin** — add an entry to the `figureInjections` array in `astro.config.mjs`:
   ```js
   {
     slug: 'basics',                // .md filename without extension
     afterHeading: 'How It Works',  // case-insensitive heading text match
     src: '/helpers-delegation.svg',
     alt: 'one-paragraph description of what the diagram shows',
     width: 1120,
     height: 620,
   }
   ```
   Optional fields:
   - `before: true` — insert *before* the heading instead of after
   - `replace: 'p'` — replace the first matching sibling within the section
   - `caption: '…'` or `captionHtml: '…'` — figcaption
7. **Confirm the dev server picked it up** — should hot-reload via the `handleHotUpdate` hook in `astro.config.mjs`. Hit `/<page>` and visually confirm.
8. **Wait for user approval before committing.** The pattern in this project: user reviews each diagram, may iterate, then says "commit & push".

## Hard-won lessons (read every time)

- **Don't invent terminology.** The doc uses `BeforeSuite` / `Before` / `Scenario` / `inject()` — use those exact words. No "Hooks" block, no "Tags" block, no generic categories the doc doesn't use.
- **Match preference tables exactly.** If the doc lists locator strategies in the order Semantic → ARIA → CSS → XPath, the diagram cards go in that order. Period.
- **No filler kickers.** Don't add labels like "DEFAULT" or "ACCESSIBLE" above cards just to fill space. If the kicker isn't carrying information the user can't already see, drop it.
- **No bullshit captions.** Don't add italic notes restating what the title already says. If the body line is "obviously true given the title", cut it.
- **Code samples must be runnable.** Use plain string locators (`I.click('Sign In')`) where the docs do — don't wrap them in `{ css: '…' }` notation unless the doc explicitly does. Inconsistency across cards is worse than imperfection on one.
- **Consistency across cards beats variety.** If card 1 uses `I.click(...)`, cards 2/3/4 also use `I.click(...)` not `I.fillField` / `I.see` / etc. unless the variety carries meaning.
- **Don't reinvent existing styles.** The page already styles default elements (`<a>`, `<code>`, etc.). Don't add per-section CSS for primitives — let site styling cover them. (This applies to the surrounding markdown, not the SVG itself.)
- **Verify diagrams by eye.** Dimension/transparency checks via `magick` don't catch cut text or clipped content. Open the PNG with `Read` and trace each element.
- **One container, not many top-level cards.** When the concept is "a Feature wraps Scenarios and hooks", use a honey container with inner cards — don't render six unrelated cards in a row and label them.
- **Serpentine flow > straight line of arrows.** For a lifecycle diagram (`test-structure`), arrows should follow the actual execution order even if it means turning corners (BeforeSuite → Before → ↓ Scenario → ↓ After → AfterSuite). The shape of the arrows is information.

## The integration plumbing (already wired)

You don't need to set these up — they exist. Just be aware of how they work:

- `src/lib/rehype-inject-figure.mjs` — the rehype plugin. Reads each entry's `src`, inlines the SVG (so fonts load), prefixes every CSS selector with a per-figure class (so `.title` / `.body` don't collide across diagrams on the same page), wraps in `starlight-image-zoom-zoomable` for the lightbox, and forces `visibility:visible` on `<marker>` so arrowheads survive the lightbox clone.
- `astro.config.mjs` — calls `rehypeInjectFigure({ injections: [...] })` from `markdown.rehypePlugins`. Also registers a Vite `handleHotUpdate` hook that triggers a reload when any `.svg` under `/public/` changes — so editing an SVG hot-reloads in dev.
- Dependencies — `unist-util-visit` and `hast-util-from-html` are explicit deps in `package.json`. Don't remove them; Vercel's pnpm build can't hoist them implicitly.

## Quick checklist

Before reporting done:

- [ ] Read the target `.md` and matched its exact heading + terminology
- [ ] viewBox padded so no card touches the edge
- [ ] No emoji, no literal `→` chars, no full-page background rect
- [ ] All `<text>` have a class (font-family applied)
- [ ] Shadow `ambient` on primary cards, `ambientSoft` on secondaries
- [ ] Arrow marker is `arrowGold` and arrows point in the direction of flow
- [ ] PNG rendered at 2× via `--force-device-scale-factor=2`
- [ ] PNG `Read` by eye — no clipping, no serif fallback, arrows land on cards
- [ ] `astro.config.mjs` entry added with correct `slug` + `afterHeading`
- [ ] Dev server shows it under the right heading
