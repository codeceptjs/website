---
title: "CodeceptJS 4.2"
date: 2026-09-23
description: "CodeceptJS 4.2 introduces an experimental raw CDP browser stack, starting with Obscura, and lays the foundation for running the same readable tests across a new generation of browser engines."
---

**CodeceptJS 4.2 is out.** This release takes another step toward a test automation layer: one readable CodeceptJS scenario that can run across different engines.

We expect a new generation of lightweight browsers to emerge—optimized for speed, AI agents, cloud scale, and constrained environments. When Puppeteer appeared it was running faster than regular browser via WebDriver protocol. However, it is still controlls a full scoped browser. And we see there is a big room for coming optimizations, new generation of headless browsers wich can be spawned by thousands, resource efficient, and programmatically controlled. Just the thing you need to run dozen of end2end tests!

## A Browser Stack Built on CDP

The **first browser on this new CDP-based stack is [Obscura](https://github.com/h4ckf0r0day/obscura)**. It is a fully **headless, open-source browser written in Rust**, with real JavaScript execution in V8 and its own rendering engine for layout and screenshots.

Obscura support in CodeceptJS 4.2 is experimental. However, Obscura is already an interesting browser to try with a small smoke suite—and an early example of how CodeceptJS can carry the same tests into the browser engines that come next. What makes Obscura interesting to us is not only that it is lightweight. It shows that browser automation is opening up again. New engines can optimize for different jobs while CodeceptJS keeps the test itself stable.

CDP (Chrome DevTools Protocol) seem to be a new control level for this kind of browsers. That's why in CodeceptJS 4.2 we shipped an **abstract CDP Helper** that controls browser by CDP. Which browser? Depends on actual implementation.

This new helper:

- has no Playwright, Puppeteer, or WebDriver runtime dependency;
- creates a clean browser target for each test;
- performs actions and evaluations directly through CDP;
- settles actions from browser lifecycle events instead of relying on a fixed delay by default;
- supports CSS, XPath, fuzzy, strict, and ARIA role locators;
- detects browser capabilities such as layout, screenshots, XPath, and visible text at runtime;
- provides the foundation for more CDP-compatible browsers in future CodeceptJS releases.

This new browser family was introduced [by @DavertMik](https://github.com/DavertMik) in [#5681](https://github.com/codeceptjs/CodeceptJS/pull/5681).

Obscura is the first implementation on this stack. [Kitesurf from Cloudflare](https://developers.cloudflare.com/browser-run/kitesurf/) is going to be next once it will be opensourced. More CDP-based engines can follow without requiring a new test API.

## Meet Obscura Browser

CodeceptJS 4.2 is tested with Obscura 0.2.2. Download the binary for your platform from the [Obscura releases](https://github.com/h4ckf0r0day/obscura/releases/tag/v0.2.2), put it on `PATH`, and switch the helper:

```js
// codecept.conf.js
export const config = {
  helpers: {
    Obscura: {
      url: 'http://localhost:3000',
    },
  },
}
```

Run the suite normally:

```sh
npx codeceptjs run
```

CodeceptJS starts and stops the Obscura process automatically. Existing tests using standard CodeceptJS actions need no new browser-specific syntax.

Start with a small smoke suite and compare its startup time, resource use, execution speed, and compatibility with your Playwright run. Playwright remains the default and recommended helper for production-grade regression and cross-browser testing.

Obscura integration is experimental. Its rendering engine is still evolving, and advanced browser workflows are not all supported. For installation options, supported actions, connection modes, compatibility notes, and current limitations, see [Alternative Browser Engines](/alternative-browsers) and the [Obscura helper reference](/helpers/Obscura).

And now back to other notable features

### Visible locators in Playwright

**Playwright 1.63 introduced `visible()` locator type which can be automaticlaly enabled** for all CodeceptJS calls.

Playwright users can enable `visibleLocator: true` to match only visible elements. This helps strict mode ignore hidden duplicates and turns hidden-only matches into an immediate “element not found” result instead of an actionability timeout. It requires Playwright 1.63 or newer and can be disabled for a single step with `stepOpts({ visibleLocator: false })`.

Visible-locator support was added [by @DavertMik](https://github.com/DavertMik) in [#5707](https://github.com/codeceptjs/CodeceptJS/pull/5707).

### Clipboard testing across browser helpers

`I.seeInClipboard()`, `I.seeClipboardEquals()`, and `I.clearClipboard()` now join `I.grabFromClipboard()` across all browser helpers, providing readable clipboard assertions. Clipboard reads require HTTPS or localhost. Contributed [by @DavertMik](https://github.com/DavertMik) in [#5718](https://github.com/codeceptjs/CodeceptJS/pull/5718).


### Better accessible controls

- `I.selectOption()` supports custom `role="radiogroup"` widgets — [by @DavertMik](https://github.com/DavertMik) in [#5702](https://github.com/codeceptjs/CodeceptJS/pull/5702).
- `I.checkOption()` finds checkbox and radio controls through their ARIA roles — [by @DavertMik](https://github.com/DavertMik) in [#5704](https://github.com/codeceptjs/CodeceptJS/pull/5704).
- Shared locator logic keeps checkable behavior consistent across helpers — [by @DavertMik](https://github.com/DavertMik) in [#5708](https://github.com/codeceptjs/CodeceptJS/pull/5708).
- `I.moveCursorTo()` scrolls the target element into view first — [by @DavertMik](https://github.com/DavertMik) in [#5715](https://github.com/codeceptjs/CodeceptJS/pull/5715).


### Safer data-driven output

- Secret values in data-driven scenario titles are masked — [by @DenysKuchma](https://github.com/DenysKuchma) in [#5693](https://github.com/codeceptjs/CodeceptJS/pull/5693).
- Object values in generated titles are serialized as JSON for stable, readable output — [by @DenysKuchma](https://github.com/DenysKuchma) in [#5709](https://github.com/codeceptjs/CodeceptJS/pull/5709).
- Parameters are correctly injected into one-line, non-async arrow scenarios — [by @mirao](https://github.com/mirao) in [#5680](https://github.com/codeceptjs/CodeceptJS/pull/5680).

### Stronger parallel runs and reports

- `workerInitializationDelay` is configurable instead of hardcoded. It defaults to 200 ms and can be set to `0` when staggering is not needed — [by @kobenguyent](https://github.com/kobenguyent) in [#5676](https://github.com/codeceptjs/CodeceptJS/pull/5676).
- Artifacts are preserved when a test is retried — [by @gololdf1sh](https://github.com/gololdf1sh) in [#5690](https://github.com/codeceptjs/CodeceptJS/pull/5690).
- `retryFailedStep` works in debug and verbose modes — [by @mirao](https://github.com/mirao) in [#5128](https://github.com/codeceptjs/CodeceptJS/pull/5128).
- Retry configuration no longer accumulates — [by @smalia2001](https://github.com/smalia2001) in [#5606](https://github.com/codeceptjs/CodeceptJS/pull/5606).
- JUnit output preserves suite identity for worker hook failures — [by @kapil971390](https://github.com/kapil971390) in [#5664](https://github.com/codeceptjs/CodeceptJS/pull/5664).
- JUnit suites now carry their real start time — [by @luantaraschi](https://github.com/luantaraschi) in [#5683](https://github.com/codeceptjs/CodeceptJS/pull/5683).
- A failing helper suite hook now emits `hook.failed` consistently — [by @luantaraschi](https://github.com/luantaraschi) in [#5684](https://github.com/codeceptjs/CodeceptJS/pull/5684).

### Runtime and helper fixes

- Bun support was polished across environment reporting, TypeScript execution, and Playwright version detection — [by @mirao](https://github.com/mirao) in [#5700](https://github.com/codeceptjs/CodeceptJS/pull/5700), [#5699](https://github.com/codeceptjs/CodeceptJS/pull/5699), and [#5714](https://github.com/codeceptjs/CodeceptJS/pull/5714).
- `waitInUrl()` once again uses substring matching — [by @nlespiaucq](https://github.com/nlespiaucq) in [#5682](https://github.com/codeceptjs/CodeceptJS/pull/5682).
- `CDPBrowser` reports the expected substring correctly when `waitInUrl()` fails — [by @DavertMik](https://github.com/DavertMik) in [#5711](https://github.com/codeceptjs/CodeceptJS/pull/5711).
- Included TypeScript files are mapped correctly in generated step output — [by @luantaraschi](https://github.com/luantaraschi) in [#5685](https://github.com/codeceptjs/CodeceptJS/pull/5685).
- Playwright `switchTo()` resolves nested iframes relative to the current frame — [by @DavertMik](https://github.com/DavertMik) in [#5717](https://github.com/codeceptjs/CodeceptJS/pull/5717).
- Playwright skips visible-only filtering for scrolling and `grab*` actions that must be able to reach hidden elements — [by @DavertMik](https://github.com/DavertMik) in [#5712](https://github.com/codeceptjs/CodeceptJS/pull/5712).
- Appium avoids data-connectivity commands on devices without telephony support — [by @mirao](https://github.com/mirao) in [#5678](https://github.com/codeceptjs/CodeceptJS/pull/5678).
- Simplified HTML keeps element text, improving diagnostics and AI-facing page context — [by @DavertMik](https://github.com/DavertMik) in [#5691](https://github.com/codeceptjs/CodeceptJS/pull/5691).


## Update

Install CodeceptJS 4.2:

```sh
npm install --save-dev codeceptjs@4.2
```

Then read the [Alternative Browser Engines](/alternative-browsers) guide and download the tested [Obscura 0.2.2 release](https://github.com/h4ckf0r0day/obscura/releases/tag/v0.2.2).

For the complete list of changes, see the [CodeceptJS 4.2.0 release notes](https://github.com/codeceptjs/CodeceptJS/releases/tag/4.2.0).
