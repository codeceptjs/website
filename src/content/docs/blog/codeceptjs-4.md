---
title: CodeceptJS 4 is out
date: 2026-05-16
description: "CodeceptJS 4 is out: native ESM, an agentic-first redesign with an MCP server and skills, smarter actions, a helper-agnostic element API, and reworked plugins."
---

CodeceptJS 4 is out, and this is the big one. We sat on the 3.x line for a long time, and in that time the way tests get written changed under our feet. The short version: more and more test-automation code is written by agents now, not typed by hand, and we rebuilt CodeceptJS around that. An agent can write and fix tests by driving a live browser, not by guessing from a screenshot after the fact.

![CodeceptJS 4 at a glance: Native ESM, Agent-first, Smarter actions, Plugins reworked](/codeceptjs-4-highlights.svg)

There is more in the box: native ESM, smarter basic actions, a helper-agnostic element API, and a reworked plugin. Let's go through the big things first, then the long tail of breaking changes you should know about before you upgrade.

## ESM, not CommonJS

CodeceptJS 4 ships as native ESM. Your project needs `"type": "module"`, NodeJS 20 or Bun. If you use TypeScript `tsx` replaces `ts-node/esm`(the old loader still runs but warns).

This was a long-todo task that would take weeks of absolutely boring work to be done. Luckily migration started in August 2025 with agent that was already capable to do such complex task. Transforming everything to modern ESM syntax opened the door to more innovation.

Helpers, page objects, and config go from `require`/`module.exports` to `import`/`export`:

```js
// 3.x
const Helper = require('@codeceptjs/helper')
class MyHelper extends Helper {}
module.exports = MyHelper

// 4.x
import Helper from '@codeceptjs/helper'
class MyHelper extends Helper {}
export default MyHelper
```

The other change is globals. `noGlobals: true` is what `npx codeceptjs init` writes into new configs, and it is the direction we want everyone to move. The symbols that used to be global become imports:

```js
import { within, session, secret, locate, actor } from 'codeceptjs'
import { tryTo, retryTo, hopeThat } from 'codeceptjs/effects'
import Helper from '@codeceptjs/helper'
```

Existing 3.x test files keep working until you flip the flag, but every run without it prints a deprecation warning. This is table stakes for the rest of the release, so we kept the migration mechanical.

## Built for agents

We think the coding part of test automation now belongs to the agent, and our job is to hand that agent the most effective tool we can, so it writes a working test without stopping to ask you halfway through. Everything in this section exists to make that loop tight.

`npx codeceptjs-mcp` starts an in-process Model Context Protocol server. In-process matters: the agent, the test runner, and the browser share one container and one browser session, with no subprocess and no IPC. Through it an agent can `list_tests` and `list_actions`, `run_code` (arbitrary JS with the full `I.*` scope), `run_test` with a programmatic `pauseAt` breakpoint, `run_step_by_step`, `snapshot` the page at any moment, then `continue` or `cancel` a paused run without closing the browser.

The working loop starts from a stub the agent can stop inside:

```js
Scenario('checkout', async ({ I }) => {
  I.amOnPage('/cart')
  pause() // agent drives the live browser from here, then writes verified steps above
})
```

It opens the page, reads it, runs `I.*` commands live against the real DOM, verifies each one worked, and commits the verified sequence back into the test file in place of the stub. The agent is not predicting selectors. It is trying them on the page and keeping the ones that hit.

That loop stays cheap because of how data moves. CodeceptJS writes HTML, ARIA trees, console logs, and HTTP records to files on disk; the agent reads them with its own shell tools, `grep` through a large `page.html`, `jq` into `console.json`, open a screenshot as an image. Nothing gets streamed back through MCP as context on every step. Unlike accessibility-tree-only browser MCPs, the agent sees the full HTML, including icon-only buttons and elements with empty labels that an ARIA snapshot drops.

The `aiTrace` plugin is the data set behind debugging. For each step it writes a screenshot, a cleaned and beautified `page.html` (minified, trash classes and inline styles stripped), an `aria.txt`, a `console.json`, and a `trace.md` index that links them, all under `output/trace_*/`. An agent reading a failure does not need the browser at all for most fixes; the trace already holds what it needs.

We also ship a skills bundle so agents do not have to relearn CodeceptJS conventions every session. 

Install it with 

```bash
npx skills add codeceptjs/skills
```

(or the `/plugin` install for Claude Code). 

Skills will help you write tests from scratch, debug existing tests, refactor code, or migrate from other frameworks.

## Rethinking the basic actions

If you ever fought a custom dropdown, a CKEditor field, or a fancy upload widget, this one is for you. We changed the basic actions to do what you mean, not what the DOM literally is. Same calls, they just reach the elements that used to push you into raw browser code:

```js
// selectOption: no longer bound to a native <select>; comboboxes and listboxes work too!
I.selectOption('Choose Plan', 'Monthly')
I.selectOption('Which OS do you use?', ['Android', 'iOS']) // multi-select

// fillField: fills rich text editors (CKEditor, ProseMirror), not just input/textarea
I.fillField('Description', 'Rich content here')

// attachFile: works with a drag-and-drop dropzone, not only <input type=file>
I.attachFile('#dropzone', 'data/avatar.jpg')
```

A few smaller additions sit around them:

- **Strict mode.** Set `strict: true` and any locator that matches more than one element throws `MultipleElementsFound` instead of silently picking the first. The error carries `fetchDetails()` so you see every match.
- **Element index.** `step.opts({ elementIndex })` picks a specific match without writing a more specific locator. Takes a number, `-1`, or `'last'`.
- **`I.clickXY`** clicks at coordinates, page-relative or element-relative.
- **`I.grabAriaSnapshot`** captures an accessibility-tree snapshot for the page or a region.
- **Focus check.** `type()` and `pressKey()` throw `NonFocusedType` when nothing has focus, instead of typing into the void.
- **Context argument.** `appendField`, `clearField`, `attachFile`, and `moveCursorTo` now take an optional second context argument, matching `fillField` and `click`.

## One element API across helpers

`I.grabWebElement()` and `I.grabWebElements()` return helper-agnostic `WebElement` wrappers. The same API works whether the underlying helper is Playwright, WebDriver, or Puppeteer:

```js
const el = await I.grabWebElement('#button')
const text = await el.getText()
if (await el.isVisible()) await el.click()

const child = await el.$('.child-selector')
const items = await el.$$('.item')

el.getNativeElement() // escape hatch when you need the raw helper element
```

It is a stable abstraction for the cases where step-based actions are not enough, and it keeps helper-specific browser code out of your tests.

## Plugins reworked

The plugin list got shorter on purpose. Two things happened.

**Behaviors merged into fewer, smarter plugins.** You used to pick a different plugin for each moment you cared about. Now `screenshot`, `pause`, `aiTrace`, and `heal` share one `on=` parameter, and you just say when it should fire (`fail`, `test`, `step`, `file`, `url`):

- `screenshotOnFail` is `screenshot` with `on=fail`
- `pauseOnFail` is `pause` with `on=fail`
- `stepByStepReport` is `screenshot` with `on=step` and `slides`
- `enhancedRetryFailedStep` folded back into `retryFailedStep`

The old names still work as deprecated aliases that warn and forward, so nothing breaks the day you upgrade.

Code Refactoring changed old plugins:

- `tryTo`, `retryTo` are now imports from `codeceptjs/effects`
- `eachElement` is now `codeceptjs/els`
- `commentStep` is now `step.section()` from `codeceptjs/steps`
- `fakerTransform` is gone; import `@faker-js/faker` directly in tests
- `autoLogin` is replaced by the new `auth` plugin, same job with less config
- `standardActingHelpers` is gone; that list lives in core now, nothing to enable

A few more we dropped in favor of tools that already do the job better: `allure` and `htmlReporter` (use an external reporter), `wdio` and `selenoid` (configure those services directly on the helper). New in 4.x: `aiTrace`, `browser`, `analyze`, and `pageInfo`.

Plugins got the ability to receive options from the CLI.

A `-p` (short for `--plugin`) can enable a plugin and take colon-chained arguments. This way you can enable and configure a plugin for a single run without touching config. This is handy for CI matrices and one-off debugging:

```bash
npx codeceptjs run -p pause                          # interactive REPL on failure
npx codeceptjs run -p pause:on=url:pattern=/checkout/*
npx codeceptjs run -p browser:show
npx codeceptjs run -p screenshot:on=step
```

`-p all` is **removed** (it clashed with the colon syntax); list plugins explicitly.

## Breaking Changes

There are more removals worth knowing before you start:

- The `Nightmare`, `Protractor`, `TestCafe`, and `AI` helpers are gone
- **CodeceptUI is removed**
- `SoftExpectHelper` is gone; use the `hopeThat` effect
- JSON-schema validation moves from Joi to bundled Zod
- The AI config switches to the Vercel AI SDK
- `restart: 'browser'` and `I.retry()` are out
- `npx create-codeceptjs` is gone
- A pile of smaller things changed names or imports

CodeceptUI is not a part of CodeceptJS 4. Actually, CodeceptUI can be easily rebuild from scratch with agents if you need to. However, the agentic testing is less dependent on UI so we are not investing in this sub-project.

Listing all of breaking changes here would just be a worse copy of the guide, so the full before-and-after checklist lives on the [Migrating from 3.x to 4.x](/migration-4) page. That page is the source of truth; this post is the tour.

You do not have to walk it by hand. Point an agent at the project and let it do the migration:

```bash
claude "/migrate-codeceptjs-4"
```

It reads your config and tests, applies the mechanical changes, runs the suite, and fixes what breaks. This whole release is mechanical enough that this actually works, which is the point.

## CodeceptJS in Agentic Era

The way we work with code has dramatically changed during this year. We foresee a **complete QA transformation**, and CodeceptJS aims to lead it. We believe the agents are already smart enough to navigate pages, pick correct locators, and refactor tests. Agent needs a mentor, not hands to write tests. So CodeceptJS will expand its ai native features, skills. 

What makes CodeceptJS different compared to Playwright (which pioneered MCP) is the code of the test.
CodeceptJS code when written by our guides is self-explaining. Agent is not guessing what it does, it understands intentions! Agent consumes much less tokens reading codeceptjs code. By applying that with official skills agents can effectively solve tasks needing less user inputs.

Java was the leader in test automation on the QA market. Even though JS has a richer ecosystem, there are still many projects working on the legacy Selenium-Java stack. But why keep things as they are if today we can easily swap languages and technologies? 

We bundled skills for migration to CodeceptJS. During the POC run agent rewrote [Selenium Java project](https://github.com/testomatio/examples/tree/master/java-reporter-testng-selenide) into CodeceptJS 4 keeping its structure. Asking no input questions agent rewrote tests and page objects into JS code, executing them one by one, and fixing failing tests, until all 44 tests passed.

So test automation is not about writing code anymore. It is about maintaining it. 
Keeping code simple and concise means that you won't be left with AI slop. 
Small code is more readable. And CodeceptJS keeps things small and easy to understand. This is why we believe you should choose CodeceptJS for your next test automation project. As we stayed longer than Playwright, Cypress or Puppeteer, this proves that CodeceptJS is your stable choice.

## Behind Monitor

Most of CodeceptJS 4 changes were done by Michael Bodnarchuk, who started CodeceptJS back in 2015. This project started while I was in hospital with my grandmother after her stroke. I had a lot of free time and no distraction (and also bad internet) so I could focus on buiding first feature. 

While CodeceptJS faced competition from companies like Microsoft, Google, and Cypress.io, I found it almost impossible to keep pace with them. Building features and writing docs would take all my time, still making product behind. But things changed.

Today Claude Code with Opus model helped me to build a framework I wanted to. Now almost anyone can code. The price of code has dropped. However, the good framework and stable foundation reduces the maintenance cost. 

**CodeceptJS 4 is to become a stable foundation for agentic testing**:

- avoid sloppy code by keeping tests short
- prefer readable semantic locators
- enforce best practices (like page objects) via skills
- reduce flakiness with healers and other declarative approaches
- keep framework, mcp, and skills as one bundle

I'm ok if you won't write CodeceptJS code, even though I like I.* syntax. But I'm sure you will read it. You will read it a lot inspecting reports. You still can read this and understand. The power for I.


## Update

```bash
npm install codeceptjs@4
```

Not ready to move? 3.x still works, and nothing breaks until you flip the flags, so take your time. But this is where CodeceptJS is going. Thanks to everyone who reported issues and helped shape this release; it is much better for it.


## Contribution Notices

With the power that coding agents unleash comes responsibility.

CodeceptJS stays opensource but we will limit the AI-driven contributions we accept in code.
Before sending us a pull request think: is this a feature or bug. If it is a feature needed for you, can this be a plugin or extended class?

We are still eager to get your pull requests for features that can be useful for everyone. However, make them compact, aim-focused, well-tested, put away from core. We can close the Pull Request even if it looks and works good, just because it doesn't align with our current code principles.


