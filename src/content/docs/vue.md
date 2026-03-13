---
title: Testing Vue Apps
---

Vue applications can be tested with CodeceptJS web helpers and semantic locators.

Use this page for Vue-specific locator patterns.
For general setup and test workflow, start with [Quickstart](/quickstart), [Web Basics](/basics), and helper docs for [Playwright](/playwright), [WebDriver](/webdriver), or [Puppeteer](/puppeteer).

## Recommended Setup

For new projects on 4.x, use Playwright by default:

```sh
npx create-codeceptjs .
```

Or initialize in an existing project:

```sh
npx codeceptjs init
```

Then run tests:

```sh
npx codeceptjs run
```

## Vue Locators

CodeceptJS supports a strict `vue` locator object:

```js
{ vue: 'MyComponent' }
{ vue: 'Button', props: { title: 'Click Me' } }
```

Examples:

```js
I.click({ vue: 'Tab', props: { title: 'Profile' } });
I.seeElement({ vue: 'UserCard', props: { state: 'active' } });
```

## Vue + ARIA/Semantic Locators

Prefer accessible locators first (`aria`, labels, text), then use `vue` locator when needed:

```js
I.click({ aria: 'Save profile' });
I.fillField({ aria: 'Email' }, 'user@example.com');
I.click({ vue: 'SubmitButton', props: { variant: 'primary' } });
```

## Notes

- With Playwright, Vue locators work through [Playwright Vue Locator](https://playwright.dev/docs/other-locators#vue-locator).
- Keep component names meaningful and avoid excessive minification in test builds when you rely on component-based locators.

## Related

- [Locators](/locators)
- [Web API (Unified)](/web-api)
- [Retry Mechanisms](/retry)
