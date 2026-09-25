---
title: Self-Driving Tests with Explorbot
description: Explorbot explores your web app on its own, runs test scenarios in a real browser, and saves every passing flow as a CodeceptJS test you can commit.
---

<a href="https://testomat.ai/explorbot/">
  <img src="/explorbot/explorbot-for-light-theme.svg" alt="Explorbot" width="328" height="80" class="dark:sl-hidden" />
  <img src="/explorbot/explorbot-for-dark-theme.svg" alt="Explorbot" width="328" height="80" class="light:sl-hidden" />
</a>

Writing end-to-end tests takes time, and most apps have more pages than anyone has time to cover. [Explorbot](https://testomat.ai/explorbot/) is an AI agent that does that work for you. Point it at a URL, and it explores the app, plans scenarios, runs them in a browser, and writes the passing flows down as **CodeceptJS tests**.

You don't write a script or supervise the run. That's what we mean by a *self-driving* test.

Explorbot is built by the CodeceptJS team at [Testomat.io](https://testomat.io) and runs on CodeceptJS under the hood.

## How a session works

Give Explorbot a URL, and a crew of agents takes it from there:

1. **Research.** Map the page into sections and index every element. No source code or docs needed.
2. **Plan.** Draft test scenarios: happy paths, curious detours, and edge cases.
3. **Execute.** Drive the browser step by step, adapting as the app changes.
4. **Verify.** Confirm each outcome, group findings by root cause, and capture evidence.
5. **Keep.** Save passing flows as tests, with reports and screencasts. What it learned is reused on the next run.

The workflow itself (research, plan, test) is fixed and predictable. AI makes the small decisions: which button to click, how to close a modal, how to recover from an error. Most of the clicking and reading runs on fast, cheap models, so a continuous run costs about $1 per hour.

## Try it

You need Node.js 24+ (or Bun) and an API key from an AI provider such as OpenRouter, Groq, or OpenAI.

```bash
npm i explorbot --save
npx playwright install
npx explorbot init
```

Add your provider key to `.env`, set your app URL in `explorbot.config.js`, and start on a focused section of the app, such as an admin panel or a settings page:

```bash
npx explorbot start /admin/users
```

Type `/explore`, and Explorbot runs its loop on its own.

## What you get: CodeceptJS tests

Every plan Explorbot runs ends up as a regular CodeceptJS test file in `output/tests/`. CodeceptJS is the default output:

```js
import step, { Section } from 'codeceptjs/steps';

Feature('Runs Archive Feature Testing')

Before(({ I }) => {
  I.amOnPage('/projects/zyntra/runs/archive');
  I.wait(1);
});

Scenario('Apply filters specific to archived runs and verify results', ({ I }) => {
  Section('Open the filter panel');
  I.click({ css: 'button.btn-only-icon.btn-lg:has(svg.md-icon-filter)' });

  Section('Pick the Passed status');
  I.click('Select status');
  I.click('Passed');
  I.click('Apply');

  I.see('1 run found');
});
```

The locators are the ones Explorbot actually used during the session, and each `Section` is labeled with what that group of steps does. The file reads top to bottom like the plan it came from.

The file always runs, even when some scenarios failed:

- Passed scenarios become `Scenario(...)`.
- Failed scenarios become `Scenario.skip(...)` with a `// FAILED:` comment, so you can see what broke.
- Scenarios Explorbot didn't reach become `Scenario.todo(...)`, with the planned steps kept as comments.

Commit it as-is, or refactor it into [page objects](/pageobjects/) like any other test. To replay it with self-healing of broken steps, run:

```bash
npx explorbot rerun output/tests/runs_archive_feature_testing.js
```

## Next to your existing suite

Explorbot doesn't replace your regression tests. It covers what they don't reach. Your CodeceptJS suite replays the same steps every build. Explorbot explores the same pages in new ways each run, clicking UI and paths your scripts never touch. Point it at a new feature with no tests, and it works out the basic test cases and runs them right away.

If your CI runs Playwright, it can run Explorbot. A nightly job with a test budget re-explores the app while nobody watches, and the results can be sent to [Testomat.io](https://testomat.io) with screencasts of every test.

## Learn more

- [Explorbot website](https://testomat.ai/explorbot/): features, demos, and the agent crew
- [Explorbot documentation](https://testomat.ai/docs/explorbot/): setup, knowledge files, CI, and configuration
- [Explorbot on GitHub](https://github.com/testomatio/explorbot): source code, free to use under the Elastic License 2.0
- [Agentic Testing](/agents/): let your coding agent write CodeceptJS tests through MCP and skills
