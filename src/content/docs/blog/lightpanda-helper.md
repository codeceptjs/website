---
title: "Lightpanda: a lighter browser for CodeceptJS tests"
date: 2026-10-14
description: "The experimental Lightpanda helper brings a Zig and V8 browser to CodeceptJS. We compare its speed, coverage, and tradeoffs with Playwright using a TodoMVC suite."
---

An E2E suite can grow until a full run takes hours. Every additional input combination or edge case adds execution time. Parallel workers help, but each full browser also consumes memory and CPU.

Maintaining a large Playwright suite is costly. Slow executions delay feedback, and adding CI workers increases infrastructure costs. As the suite grows, running it on every change becomes harder to sustain.

**What if we could run those tests three times faster?** A three-hour run would finish in one hour. That is the opportunity we want to explore with lightweight browsers: less time waiting for results and fewer resources spent executing tests.

In [CodeceptJS 4.2](/blog/codeceptjs-4-2), we introduced a different direction: alternative browsers controlled directly through CDP. Obscura was the first implementation. We promised more engines to run your browser tests on without requiring another test API.

**Lightpanda is another step in that direction.** It runs page JavaScript without the graphical rendering pipeline of a traditional browser. The new helper brings it to the same `I.amOnPage()`, `I.click()`, and `I.see()` vocabulary.

Faster feedback is the benefit. The practical question is which scenarios can move to a lightweight engine while others keep full-browser coverage. CodeceptJS lets us make that choice without maintaining two versions of every test.

## What Lightpanda does differently

[Lightpanda](https://github.com/lightpanda-io/browser) is an open-source headless browser written in Zig. It was built from scratch for automation, scraping, and AI agents. Its JavaScript engine is V8. Its DOM and browser APIs come from Lightpanda's own implementation.

A headless Chromium still has a browser rendering pipeline. Hiding the window does not remove that work. Lightpanda takes a different approach: execute scripts, maintain the DOM, make network requests, and expose automation controls without painting a normal webpage.

That makes it more capable than an HTML parser. JavaScript can update the page after loading. Forms and event handlers can participate in application workflows. But sharing V8 with Chrome does not give Lightpanda Chrome's entire Web Platform implementation.


## Comparing the same tests across three engines

To see what a lightweight browser could save in an actual test run, we compared the same CodeceptJS suite across three engines. We looked at execution time and memory use. We also checked whether the engines produced the same test outcomes.

We used a 21-test suite against the public [TodoMVC application](https://todomvc.com/examples/angular/dist/browser/). It exercises familiar E2E flows: creating todos, editing text, checking items off, filtering lists, and deleting entries. Input cases include long text, umlauts, and HTML-like content.

Playwright with Chromium was the full-browser baseline. Lightpanda let us evaluate execution without graphical rendering. We included Obscura as another lightweight engine, this time with rendering and screenshots.

After resolving the compatibility issues described below, we ran the final shared suite three times per helper on the same machine. All three configurations used the same tests, page object, and supporting helpers. The measurements below come from those runs.

The browser versions were Lightpanda **1.0.0**, Playwright **1.64.0** with Chrome for Testing **156.0.8078.4**, and Obscura **0.2.4**. The machine ran Ubuntu on an AMD Ryzen 7 PRO 8840HS with 57 GiB RAM.

<!-- Measurement source: supplied BROWSER-COMPARISON.md from the codeceptJS examples, dated 2026-10-14. These are recorded measurements, not a fresh benchmark executed while drafting this article. -->

| Recorded result | Playwright / Chromium | Lightpanda | Obscura |
| --- | ---: | ---: | ---: |
| Passed / failed | 19 / 2 | 19 / 2 | 19 / 2 |
| Median wall time | 64.2 s | 10.2 s | 34.8 s |
| Speed relative to Playwright | 1× | 6.3× | 1.8× |
| Median peak browser RSS | 3,081 MiB | 73 MiB | 86 MiB |
| Median peak whole-run RSS | 3,402 MiB | 322 MiB | 336 MiB |

Wall time includes command startup, browser launch, and shutdown. Memory was sampled across each run's process tree every 250 ms. Whole-run memory includes the Node-side runner, which remains a substantial cost even with a lightweight browser.

The recorded outcomes match, including the failures. One intentionally broken test calls missing custom steps. The other expects todos to survive a refresh, although this application keeps them in memory. Matching those outcomes demonstrates useful compatibility for this suite. It does not establish browser equivalence.

**This is a comparison of complete configurations, not an isolated engine benchmark.** Playwright had video and tracing enabled. It also used `waitForNavigation: 'networkidle'`; the CDP helpers used their default navigation waits. The application was remote, so network latency contributed to the timings.

A fairer engine-only experiment would align waiting and disable unequal artifact collection. We did not measure that experiment. We cannot say how much of the gap would remain.

## What the helper tests cover

The [Lightpanda helper suite](https://github.com/codeceptjs/CodeceptJS/blob/master/test/helper/CDPBrowser_lightpanda_test.js) does more than open a page. It registers the shared [browser API tests](https://github.com/codeceptjs/CodeceptJS/blob/master/test/helper/webapi.js) used across helpers.

Those test definitions exercise navigation and URL assertions, page text, element lookup, field entry, checkboxes, selection controls, cookies, JavaScript evaluation, and waits. They also include role locators, shadow DOM, scoped actions, strict matching, and element-index options.

Lightpanda-specific cases cover automatic server startup on a free port, link navigation through synthetic clicks, visibility checks, and screenshot calls that produce no file. Separate lifecycle cases check explicit attachment, invalid binaries, telemetry settings, and process cleanup.

These are **coverage definitions from source inspection**, not a fresh passing-suite report. Unsupported capabilities are explicitly skipped. The shared suite excludes Lightpanda coordinate clicks, scrolling, clipboard checks, several CSS assertions, and some rich-text editors. Frame switching is excluded by the underlying CDP helper.

This distinction is useful when trying a new engine. A shared test API gives us a compatibility target. It does not erase the capability differences.

## Synthetic clicks change the contract

Lightpanda's helper defaults to synthetic input. Instead of asking a graphical browser to hit-test a screen position, it acts on the selected DOM element.

The TodoMVC migration exposed a concrete difference. Double-clicking a todo's `<li>` reached its child `<label>` in Playwright through coordinate targeting. A synthetic double-click on the parent did not reach the child's event listener. Events bubble toward ancestors, not toward descendants.

The fix was to target the label itself. The filter controls needed a similar correction: target the link rather than its surrounding list item.

These adjustments made the final suite portable. They also show why “change the helper and everything works” would be too strong. Custom helpers tied to Playwright objects need review too.

The testing consequence is larger than locator syntax. A synthetic action can exercise application logic without proving that a person can reach the control. An overlapping panel or broken positioning may still block the real interaction.

## Where Playwright stays ahead

| Requirement | Lightpanda helper today | Playwright helper |
| --- | --- | --- |
| DOM-oriented application flows | A candidate for fast functional checks | Full-browser execution |
| Visibility assertions | Limited computed styles and element boxes | Browser layout and visibility behavior |
| Coordinate input and scrolling | Unsupported in the documented integration | Available with full browser behavior |
| Screenshots and video | No normal page screenshots or screencast | Available |
| Frames and popups | Unsupported in the documented integration | Available |
| Cross-browser coverage | Lightpanda only | Chromium, Firefox, and WebKit |

The helper sets `capabilities.layout: 'real'` internally. That name needs context: Lightpanda supplies enough styles and boxes for visibility-related checks. It does not promise Chrome-equivalent layout or arbitrary computed CSS.

Screenshot behavior deserves particular attention. In the compared CodeceptJS version, `I.saveScreenshot()` logs a debug message and returns without creating a PNG. Keeping the run alive is convenient. A successful screenshot step is not evidence that an image exists.

The Lightpanda runs retained HTML, ARIA snapshots, and the `aiTrace` step index. They did not capture browser-console artifacts. Playwright supplied screenshots, console artifacts, videos, and its own trace files as well. Faster execution comes with a smaller debugging evidence set.

Lightpanda's upstream CLI now advertises text-only PNG and PDF dumps. Those are different from rendered-page screenshots, and this CodeceptJS helper disables screenshot capture.

There are deployment considerations too. Upstream distributes Linux and macOS binaries; Windows users need WSL rather than a native binary. Lightpanda uses AGPL-3.0 licensing. Review its [licensing terms](https://github.com/lightpanda-io/browser/blob/main/LICENSE) for your intended deployment.

## Two configs, one test suite

The Lightpanda helper is available starting with CodeceptJS **4.2.1**. Use `^4.2.1` to include compatible updates throughout the 4.x release line. In an existing ESM test project:

```sh
npm install -D 'codeceptjs@^4.2.1'
```

Keep Playwright and its browser installed for the full-browser job. Install a pinned Lightpanda binary from the [official releases](https://github.com/lightpanda-io/browser/releases). Put it on `PATH`, or set `LIGHTPANDA_PATH`. Set `APP_URL` to your application's test environment.

Keep the Playwright configuration as the base, with `grep: '@smoke'` selecting the smoke scenarios. This minimal example uses the documented `*_test.js` naming pattern; retain your project's existing test paths, page objects, and plugins.

```js
// codecept.conf.js
export const config = {
  tests: './**/*_test.js',
  grep: '@smoke',
  output: './output/playwright',
  helpers: {
    Playwright: {
      url: process.env.APP_URL,
      browser: 'chromium',
      show: false,
    },
  },
}
```

The second config imports the first. It replaces the browser helper, keeps any other helpers, and overrides `grep` to select `@light` scenarios:

```js
// codecept.lightpanda.conf.js
import { config as base } from './codecept.conf.js'

const { Playwright, ...otherHelpers } = base.helpers

export const config = {
  ...base,
  grep: '@light',
  output: './output/lightpanda',
  helpers: {
    ...otherHelpers,
    Lightpanda: {
      url: Playwright.url,
    },
  },
}
```

Tag the key smoke scenarios with `@smoke` for Playwright. Tag compatible lightweight checks and input edge cases with `@light` for Lightpanda. For example, rename `Reject an empty todo` to `Reject an empty todo @light`. Its steps stay unchanged.

A scenario with both tags runs in both engines. Untagged scenarios run in neither of these two jobs, so keep them in your full regression run.

Good Lightpanda candidates include simple CRUD checks, validation rules, and input edge cases whose assertions depend on application state. Keep scenarios that need layout, real pointer targeting, frames, or visual evidence in Playwright. Compare each candidate on both engines before assigning `@light`.

Run the two groups as separate CI jobs:

```sh
# Only @light scenarios, using Lightpanda
npx codeceptjs run -c codecept.lightpanda.conf.js

# @smoke scenarios, using Playwright
npx codeceptjs run -c codecept.conf.js
```

Both jobs use the same test files. Each config declares its own tag filter, so the commands only select a configuration. Separate output directories keep their artifacts apart.

For a full Playwright regression run, remove `grep` from the Playwright config. To cross-check the lightweight group in Playwright, change that config's filter to `grep: '@light'`. The scenarios themselves do not change.

Without an explicit endpoint, a resolved Lightpanda binary is launched on a free port. CodeceptJS manages its shutdown and disables telemetry for the process it starts. To attach to an externally managed server instead, set `endpoint` in the Lightpanda helper configuration. You then manage that server's lifecycle and telemetry settings.

The configurations select an engine; they do not translate browser-specific custom code. Keep shared scenarios and page objects on the common `I.*` API. Review any helper that accesses Playwright objects directly before routing its scenarios to Lightpanda.

## Conclusions

**We recommend combining Lightpanda and Playwright.** When an E2E suite takes hours, move compatible lightweight checks and data-driven edge cases to Lightpanda or another alternative engine. Keep rendering-sensitive flows, complex browser interactions, and cross-browser checks in Playwright.

Start with a small group whose results you have compared on both engines. Expand that group as compatibility is established. Keep a periodic full-browser run of those scenarios to catch differences. Lightpanda support in CodeceptJS remains experimental.

**CodeceptJS makes this a configuration choice instead of a second test suite.** Write the scenario once with the shared `I.*` API. Run it with Lightpanda for fast feedback, then switch the configuration to run the same scenario with Playwright. The tests stay readable and reusable as more browser engines become available.

Read [Alternative Browser Engines](/alternative-browsers), inspect the [Lightpanda helper source](https://github.com/codeceptjs/CodeceptJS/blob/master/lib/helper/Lightpanda.js), and choose the first group of scenarios to move.

### Further reading

- [Lightpanda architecture and documentation](https://lightpanda.io/docs/core-concepts/architecture-overview)
- [Lightpanda source, installation, and published benchmarks](https://github.com/lightpanda-io/browser)
- [Playwright browser support](https://playwright.dev/docs/browsers)
- [Playwright's CDP connection and fidelity caveats](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp)
