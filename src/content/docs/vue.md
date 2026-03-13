---
title: Testing Vue Apps
---

# vue-cli-plugin-e2e-codeceptjs

*Hey, how about some end-to-end testing for your Vue apps?*

*Let's do it together: Vue, [CodeceptJS](/quickstart), and [Puppeteer](https://pptr.dev).*

```js
I.amOnPage('/');
I.click('My Component Button');
I.see('My Component');
I.say('I am happy!');
```

## How to try it

**Requirements:**

* NodeJS >= 8.9
* NPM / Yarn
* Vue CLI installed globally

```sh
npm i vue-cli-plugin-codeceptjs-puppeteer --save-dev
```

This installs CodeceptJS, CodeceptUI and Puppeteer with Chrome.

To add CodeceptJS to your project:

```sh
vue invoke vue-cli-plugin-codeceptjs-puppeteer
```

## Running Tests

* `test:e2e` runs tests with browser opened.
  * Use `--headless` to run headlessly
  * Use `--serve` to start dev server before tests
* `test:e2e:parallel` runs tests in parallel workers.
  * Use an argument to set worker count
  * Use `--serve` to start dev server before tests
* `test:e2e:open` opens interactive web test runner

Examples:

```sh
npm run test:e2e
npm run test:e2e -- --headless
npm run test:e2e -- --serve

npm run test:e2e:parallel
npm run test:e2e:parallel -- 3
npm run test:e2e:parallel -- 3 --serve

npm run test:e2e:open
```

> `test:e2e` wraps `codecept run --steps`. See [run options](/commands#run).
> `test:e2e:parallel` wraps `codecept run-workers 2`. See [run-workers options](/commands#run-workers).

## Directory Structure

Generator creates files like:

```text
codecept.conf.js          - CodeceptJS config
jsconfig.json             - type definitions support
tests
|- e2e
|  |- app_test.js         - demo test
|  |- output              - screenshots/reports folder
|  |- support
|     |- steps_file.js    - common steps
|- steps.d.ts             - generated type definitions
```

## Locators

For Vue apps a special `vue` locator is available:

```js
{ vue: 'MyComponent' }
{ vue: 'Button', props: { title: 'Click Me' } }
```

With Playwright, use Vue locators in any method where locator is supported:

```js
I.click({ vue: 'Tab', props: { title: 'Click Me!' } });
I.seeElement({ vue: 't', props: { title: 'Clicked' } });
```

Vue locators work via [Playwright Vue Locator](https://playwright.dev/docs/other-locators#vue-locator).

## How to write tests

* Open `tests/e2e/app_test.js` and inspect demo test
* [Learn CodeceptJS basics](/basics)
* [Learn CodeceptJS with Puppeteer](/puppeteer)
* [See Puppeteer helper reference](/helpers/puppeteer)
* Ask questions in [Slack](https://bit.ly/chat-codeceptjs) and [Forum](https://codecept.discourse.group/)

## Enjoy testing

With love, [CodeceptJS Team](/)
