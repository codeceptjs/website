---
title: "Moli: fast browser tests, with screenshots when you need them"
date: 2026-10-15
description: "Run CodeceptJS tests with Moli's fast default mode or enable layout for screenshots and real element geometry. Compare performance and choose the mode for your suite."
---

An E2E suite spends resources on more than application logic. A full browser also maintains layout and rendering state. That is essential for visual checks, but expensive for repeated form submissions and input validation.

CodeceptJS provides a shared `I.*` API for browser automation. Tests can run through Playwright for full-browser coverage or through a lightweight engine such as Moli for DOM-oriented workflows.

**Moli gives you two ways to run those tests: prioritize speed, or enable layout when you need screenshots.** Both use the familiar `I.amOnPage()`, `I.fillField()`, and `I.see()` vocabulary. You choose the mode in your CodeceptJS configuration.

Use the default mode for repeated form submissions, validation rules, and content-entry checks. Enable layout for runs where seeing the page helps you diagnose failures. You do not need separate test implementations for each mode.

## What Moli is

[Moli](https://github.com/lexmount/moli) is an open-source headless browser written in Rust. It targets automation and AI agents. It is a standalone browser kernel rather than a Chromium wrapper.

It runs JavaScript in V8 and computes CSS with Servo's Stylo. Unlike a full browser, it can skip layout and painting when your tests do not need them.

## Choose speed or rendered output

### Default mode: fast functional checks

The default mode runs your application's JavaScript and interacts with the DOM without rendering the page. It is the lighter option for checking saved values, validation messages, filters, and other application behavior.

Use it for data-driven tests with many input combinations. You get HTML and ARIA snapshots for debugging, but no screenshots. `I.saveScreenshot()` skips image capture in this mode.

### Layout mode: screenshots and real geometry

Set `layout: true` to enable rendering and real element geometry. `I.saveScreenshot()` produces a PNG, and `aiTrace` can include screenshots alongside HTML and ARIA snapshots.

Choose this mode when you want to see the page around a failed step, inspect a rendered state, or use element dimensions. It takes more time than default mode, but keeps Moli's small memory footprint.

Layout mode still uses synthetic clicks for ordinary `I.click()` actions. Screenshots help you investigate a failure; they do not prove that a real user's pointer can reach every control.

## Faster feedback for functional tests

We ran a 21-test suite against [Angular TodoMVC](https://todomvc.com/examples/angular/dist/browser/) in both Moli modes, with Lightpanda and Playwright with Chromium for comparison. The scenarios create, edit, filter, complete, and delete todos. They also exercise long text, umlauts, and HTML-like input.

<!-- Recorded measurements from BROWSER-COMPARISON.md; three runs per engine, not rerun while drafting. -->

| Median result across three runs | Playwright / Chromium | Lightpanda | Moli default | Moli layout |
| --- | ---: | ---: | ---: | ---: |
| Total execution time | 64.2 s | 10.2 s | 10.8 s | 29.2 s |
| Speed relative to Playwright | 1× | 6.3× | 5.9× | 2.2× |
| Peak browser memory | 3,081 MiB | 73 MiB | 92 MiB | 113 MiB |
| Peak memory including the test runner | 3,402 MiB | 322 MiB | 337 MiB | 360 MiB |
| Screenshots | Yes | No | No | Yes |

These timings compare our configured jobs: Playwright included video, tracing, and longer navigation waits, so the speedup will vary with your setup.

**Default mode is the better choice for high-volume functional checks.** It finished this suite about 2.7× faster than layout mode. Use it when the assertion result tells you what you need to know.

**Layout mode trades some speed for easier diagnosis.** It captured screenshots while keeping browser memory close to default mode. The complete run remained faster than our Playwright job, although individual actions were not consistently faster.

A practical split is to run input variations in default mode and screenshot-equipped smoke scenarios in layout mode. You can also rerun a failing default-mode scenario with layout enabled to inspect the page.

## What you can test with Moli

In default mode, `I.fillField()` works with rich-text editors including TinyMCE inline and Trix. You can automate content entry in a CMS or support tool using the standard CodeceptJS API. Keep TinyMCE inline tests in default mode; it has a known content-reading limitation in layout mode.

Both modes support computed CSS checks such as colors and font weight. Layout mode adds real element geometry and rendered screenshots.

## When to keep Playwright

Keep Playwright for Chrome, Firefox, and WebKit compatibility, realistic pointer interactions, and visual comparisons against the browsers your users run. Moli's layout mode gives you screenshots, not a guarantee of Chrome-identical rendering.

Both Moli modes still have limits:

* **Frames and popups:** unsupported by this integration.
* **File uploads:** files are sent as `application/octet-stream`, so MIME-sensitive upload checks belong in a full-browser job.
* **Debugging artifacts:** no video or Playwright trace files; the compared Moli runs did not capture browser-console artifacts.

Ordinary clicks remain synthetic in both modes. Keep tests for overlays, stacking order, and whether controls can actually be reached in Playwright.

## Getting started with Moli

Install the latest CodeceptJS in your test project:

```sh
npm install -D codeceptjs@latest
```

Download the latest binary for your operating system from [Moli releases](https://github.com/lexmount/moli/releases). Put `moli` on `PATH`, or set `MOLI_PATH` to its location. Set `APP_URL` to your application's test environment.

In an ESM test project, this configuration selects the fast default mode:

```js
// codecept.conf.js
export const config = {
  tests: './**/*_test.js',
  output: './output/moli',
  helpers: {
    Moli: {
      url: process.env.APP_URL,
    },
  },
}
```

Keep your existing test paths, page objects, and plugins when adapting this example. Run the tests with:

```sh
npx codeceptjs run
```

The helper starts the browser for you. Your scenarios use the same `I.*` actions as other CodeceptJS browser helpers.

### Enable layout and screenshots

Add `layout: true` to the `Moli` helper:

```js
Moli: {
  url: process.env.APP_URL,
  layout: true,
}
```

Run with `npx codeceptjs run` as before. Existing `I.saveScreenshot()` steps now create images. Omit `layout`, or set it to `false`, to return to default mode.

To keep both choices ready, save a second configuration that imports the default one:

```js
// codecept.moli-layout.conf.js
import { config as base } from './codecept.conf.js'

export const config = {
  ...base,
  output: './output/moli-layout',
  helpers: {
    ...base.helpers,
    Moli: {
      ...base.helpers.Moli,
      layout: true,
    },
  },
}
```

Select the mode with the configuration file:

```sh
# Fast functional run
npx codeceptjs run -c codecept.conf.js

# Rendered run with screenshots
npx codeceptjs run -c codecept.moli-layout.conf.js
```

Separate output directories keep the artifacts from each mode apart.

### Adding Moli alongside Playwright

If your project already uses Playwright, keep that configuration for full-browser checks. A companion configuration can import it and replace only the browser helper:

```js
// codecept.moli.conf.js
import { config as base } from './codecept.conf.js'

const { Playwright, ...otherHelpers } = base.helpers

export const config = {
  ...base,
  grep: '@light',
  output: './output/moli',
  helpers: {
    ...otherHelpers,
    Moli: {
      url: Playwright.url,
    },
  },
}
```

Run the compatible group with:

```sh
npx codeceptjs run -c codecept.moli.conf.js
```

The `grep: '@light'` setting selects scenarios tagged with `@light` in their titles. Assign that tag after comparing a scenario's results in Moli and Playwright. Add `layout: true` to this helper configuration if those scenarios need screenshots. Untagged tests remain outside this filtered Moli job.

Without an explicit endpoint, a resolved Moli binary launches on a free port. CodeceptJS manages its shutdown and enables the requested mode. If you use `endpoint` to attach to a server you manage, start that server with `--layout` when using `layout: true`.

Keep shared scenarios and page objects on the common `I.*` API. Review custom helpers that access Playwright objects directly before sending their scenarios to Moli.

## Conclusions

**Start with default mode for fast functional feedback.** Forms, validation rules, and repeated input variations benefit most when you do not need rendered output.

**Choose layout mode when screenshots help you understand the result.** It gives you rendered-page evidence without the memory footprint of a full Chromium job.

**Keep Playwright for browser fidelity.** Real pointer targeting, frames, and cross-browser checks still need a full-browser job.

CodeceptJS makes these choices available through a shared test API. Start with a small compatible group. Compare outcomes before expanding it. Keep periodic full-browser execution of the same scenarios.

Install Moli and try a small group of scenarios in both modes. Choose speed where assertions are enough and layout where screenshots are useful. Read [Alternative Browser Engines](/alternative-browsers) for the shared capabilities and limitations.

### Further reading

* [Moli architecture, runtime modes, and installation](https://github.com/lexmount/moli#architecture)
* [Moli release downloads](https://github.com/lexmount/moli/releases)
* [CodeceptJS Moli integration and recorded coverage](https://github.com/codeceptjs/CodeceptJS/pull/5753)