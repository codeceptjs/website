---
title: Releases
slug: changelog
---

## 3.7.4

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџ›©пёЏ _Features_

- **Test Suite Shuffling**: Randomize test execution order to discover test dependencies and improve test isolation ([#5051](https://github.com/codeceptjs/CodeceptJS/issues/5051)) - by **[NivYarmus](https://github.com/NivYarmus)**

  ```bash
  # Shuffle tests to find order-dependent failures using lodash.shuffle algorithm
  npx codeceptjs run --shuffle

  # Combined with grep and other options
  npx codeceptjs run --shuffle --grep "@smoke" --steps
  ```

- **Enhanced Interactive Debugging**: Better logging for `I.grab*` methods in live interactive mode for clearer debugging output ([#4986](https://github.com/codeceptjs/CodeceptJS/issues/4986)) - by **[owenizedd](https://github.com/owenizedd)**

  ```js
  // Interactive pause() now shows detailed grab results with JSON formatting
  I.amOnPage('/checkout')
  pause()  // Interactive shell started
  > I.grabTextFrom('.price')
  Result $res= "Grabbed text: $29.99"  // Pretty-printed JSON output
  > I.grabValueFrom('input[name="email"]')
  {"value":"user@example.com"}  // Structured JSON response
  ```

  рџђ› _Bug Fixes_

- **Playwright Session Traces**: Fixed trace file naming convention and improved error handling for multi-session test scenarios ([#5073](https://github.com/codeceptjs/CodeceptJS/issues/5073)) - by **[julien-ft-64](https://github.com/julien-ft-64)** **[kobenguyent](https://github.com/kobenguyent)**

  ```js
  // Example outputs:
  // - a1b2c3d4-e5f6_checkout_login_test.failed.zip
  // - b2c3d4e5-f6g7_admin_dashboard_test.failed.zip
  ```

  _Trace files use UUID prefixes with `sessionName_testTitle.status.zip` format_

- **Worker Data Injection**: Resolved proxy object serialization preventing data sharing between parallel test workers ([#5072](https://github.com/codeceptjs/CodeceptJS/issues/5072)) - by **[kobenguyent](https://github.com/kobenguyent)**

  ```js
  // Fixed: Complex objects can now be properly shared and injected between workers
  // Bootstrap data sharing in codecept.conf.js:
  exports.config = {
    bootstrap() {
      share({
        userData: { id: 123, preferences: { theme: 'dark' } },
        apiConfig: { baseUrl: 'https://api.test.com', timeout: 5000 },
      })
    },
  }

  // In tests across different workers:
  const testData = inject()
  console.log(testData.userData.preferences.theme) // 'dark' - deep nesting works
  console.log(Object.keys(testData)) // ['userData', 'apiConfig'] - key enumeration works

  // Dynamic sharing during test execution:
  share({ newData: 'shared across workers' })
  ```

- **Hook Exit Codes**: Fixed improper exit codes when test hooks fail, ensuring CI/CD pipelines properly detect failures ([#5058](https://github.com/codeceptjs/CodeceptJS/issues/5058)) - by **[kobenguyent](https://github.com/kobenguyent)**

  ```bash
  # Before: Exit code 0 even when beforeEach/afterEach failed
  # After: Exit code 1 when any hook fails, properly failing CI builds
  ```

- **TypeScript Effects Support**: Added complete TypeScript definitions for effects functionality ([#5027](https://github.com/codeceptjs/CodeceptJS/issues/5027)) - by **[kobenguyent](https://github.com/kobenguyent)**

  ```typescript
  // Import effects with full TypeScript type definitions
  import { tryTo, retryTo, within } from 'codeceptjs/effects'

  // tryTo returns Promise<boolean> for conditional actions
  const success: boolean = await tryTo(async () => {
    await I.see('Cookie banner')
    await I.click('Accept')
  })

  // retryTo with typed parameters for reliability
  await retryTo(() => {
    I.click('Submit')
    I.see('Success')
  }, 3) // retry up to 3 times
  ```

  _Note: Replaces deprecated global plugins - import from 'codeceptjs/effects' module_

- **Mochawesome Screenshot Uniqueness**: Fixed screenshot naming to prevent test failures from being overwritten when multiple tests run at the same time ([#4959](https://github.com/codeceptjs/CodeceptJS/issues/4959)) - by **[Lando1n](https://github.com/Lando1n)**

  ```js
  // Problem: When tests run in parallel, screenshots had identical names
  // This caused later test screenshots to overwrite earlier ones

  // Before: All failed tests saved as "screenshot.png"
  // Result: Only the last failure screenshot was kept

  // After: Each screenshot gets a unique name with timestamp
  // Examples:
  // - "login_test_1645123456.failed.png"
  // - "checkout_test_1645123789.failed.png"
  // - "profile_test_1645124012.failed.png"

  // Configuration in codecept.conf.js:
  helpers: {
    Mochawesome: {
      uniqueScreenshotNames: true // Enable unique naming
    }
  }
  ```

  _Ensures every failed test keeps its own screenshot for easier debugging_

рџ“– _Documentation_

- Fixed Docker build issues and improved container deployment process ([#4980](https://github.com/codeceptjs/CodeceptJS/issues/4980)) - by **[thomashohn](https://github.com/thomashohn)**
- Updated dependency versions to maintain security and compatibility ([#4957](https://github.com/codeceptjs/CodeceptJS/issues/4957), [#4950](https://github.com/codeceptjs/CodeceptJS/issues/4950), [#4943](https://github.com/codeceptjs/CodeceptJS/issues/4943)) - by **[thomashohn](https://github.com/thomashohn)**
- Fixed automatic documentation generation system for custom plugins ([#4973](https://github.com/codeceptjs/CodeceptJS/issues/4973)) - by **[Lando1n](https://github.com/Lando1n)**

## 3.7.3

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџ›©пёЏ _Features_

- feat(cli): improve info command to return installed browsers ([#4890](https://github.com/codeceptjs/CodeceptJS/issues/4890)) - by **[kobenguyent](https://github.com/kobenguyent)**

```
вћњ  helloworld npx codeceptjs info
Environment information:

codeceptVersion:  "3.7.2"
nodeInfo:  18.19.0
osInfo:  macOS 14.4
cpuInfo:  (8) x64 Apple M1 Pro
osBrowsers:  "chrome: 133.0.6943.143, edge: 133.0.3065.92, firefox: not installed, safari: 17.4"
playwrightBrowsers:  "chromium: 133.0.6943.16, firefox: 134.0, webkit: 18.2"
helpers:  {
"Playwright": {
"url": "http://localhost",
...
```

рџђ› _Bug Fixes_

- fix: resolving path inconsistency in container.js and appium.js ([#4866](https://github.com/codeceptjs/CodeceptJS/issues/4866)) - by **[mjalav](https://github.com/mjalav)**
- fix: broken screenshot links in mochawesome reports ([#4889](https://github.com/codeceptjs/CodeceptJS/issues/4889)) - by **[kobenguyent](https://github.com/kobenguyent)**
- some internal fixes to make UTs more stable by **[thomashohn](https://github.com/thomashohn)**
- dependencies upgrades by **[thomashohn](https://github.com/thomashohn)**

## 3.7.2

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџ›©пёЏ _Features_

- feat(playwright): Clear cookie by name ([#4693](https://github.com/codeceptjs/CodeceptJS/issues/4693)) - by **[ngraf](https://github.com/ngraf)**

рџђ› _Bug Fixes_

- fix(stepByStepReport): no records html is generated when running with run-workers ([#4638](https://github.com/codeceptjs/CodeceptJS/issues/4638))
- fix(webdriver): bidi error in log with webdriver ([#4850](https://github.com/codeceptjs/CodeceptJS/issues/4850))
- fix(types): TS types of methods (Feature|Scenario)Config.config ([#4851](https://github.com/codeceptjs/CodeceptJS/issues/4851))
- fix: redundant popup log ([#4830](https://github.com/codeceptjs/CodeceptJS/issues/4830))
- fix(webdriver): grab browser logs using bidi protocol ([#4754](https://github.com/codeceptjs/CodeceptJS/issues/4754))
- fix(webdriver): screenshots for sessions ([#4748](https://github.com/codeceptjs/CodeceptJS/issues/4748))

рџ“– _Documentation_

- fix(docs): mask sensitive data ([#4636](https://github.com/codeceptjs/CodeceptJS/issues/4636)) - by **[gkushang](https://github.com/gkushang)**

## 3.7.1

- Fixed `reading charAt` error in `asyncWrapper.js`

## 3.7.0

This release introduces major new features and internal refactoring. It is an important step toward the 4.0 release planned soon, which will remove all deprecations introduced in 3.7.

рџ›©пёЏ _Features_

### рџ”Ґ **Native Element Functions**

A new [Els API](/els) for direct element interactions has been introduced. This API provides low-level element manipulation functions for more granular control over element interactions and assertions:

- `element()` - perform custom operations on first matching element
- `eachElement()` - iterate and perform operations on each matching element
- `expectElement()` - assert condition on first matching element
- `expectAnyElement()` - assert condition matches at least one element
- `expectAllElements()` - assert condition matches all elements

Example using all element functions:

```js
const { element, eachElement, expectElement, expectAnyElement, expectAllElements } = require('codeceptjs/els')

// ...

Scenario('element functions demo', async ({ I }) => {
  // Get attribute of first button
  const attr = await element('.button', async el => await el.getAttribute('data-test'))

  // Log text of each list item
  await eachElement('.list-item', async (el, idx) => {
    console.log(`Item ${idx}: ${await el.getText()}`)
  })

  // Assert first submit button is enabled
  await expectElement('.submit', async el => await el.isEnabled())

  // Assert at least one product is in stock
  await expectAnyElement('.product', async el => {
    return (await el.getAttribute('data-status')) === 'in-stock'
  })

  // Assert all required fields have required attribute
  await expectAllElements('.required', async el => {
    return (await el.getAttribute('required')) !== null
  })
})
```

[Els](/els) functions expose the native API of Playwright, WebDriver, and Puppeteer helpers. The actual `el` API will differ depending on which helper is used, which affects test code interoperability.

### рџ”® **Effects introduced**

[Effects](/effects) is a new concept that encompasses all functions that can modify scenario flow. These functions are now part of a single module. Previously, they were used via plugins like `tryTo` and `retryTo`. Now, it is recommended to import them directly:

```js
const { tryTo, retryTo } = require('codeceptjs/effects')

Scenario(..., ({ I }) => {
  I.amOnPage('/')
  // tryTo returns boolean if code in function fails
  // use it to execute actions that may fail but not affect the test flow
  // for instance, for accepting cookie banners
  const isItWorking = tryTo(() => I.see('It works'))

  // run multiple steps and retry on failure
  retryTo(() => {
    I.click('Start Working!');
    I.see('It works')
  }, 5);
})
```

Previously `tryTo` and `retryTo` were available globally via plugins. This behavior is deprecated as of 3.7 and will be removed in 4.0. Import these functions via effects instead. Similarly, `within` will be moved to `effects` in 4.0.

### вњ… `check` command added

```
npx codeceptjs check
```

This command can be executed locally or in CI environments to verify that tests can be executed correctly.

It checks:

- configuration
- tests
- helpers

And will attempt to open and close a browser if a corresponding helper is enabled. If something goes wrong, the command will fail with a message. Run `npx codeceptjs check` on CI before actual tests to ensure everything is set up correctly and all services and browsers are accessible.

For GitHub Actions, add this command:

```yaml
steps:
  # ...
  - name: check configuration and browser
    run: npx codeceptjs check

  - name: run codeceptjs tests
    run: npx codeceptjs run-workers 4
```

### рџ‘ЁвЂЌрџ”¬ **analyze plugin introduced**

This [AI plugin](/plugins#analyze) analyzes failures in test runs and provides brief summaries. For more than 5 failures, it performs cluster analysis and aggregates failures into groups, attempting to find common causes. It is recommended to use Deepseek R1 model or OpenAI o3 for better reasoning on clustering:

```js
вЂў SUMMARY The test failed because the expected text "Sign in" was not found on the page, indicating a possible issue with HTML elements or their visibility.
вЂў ERROR expected web application to include "Sign in"
вЂў CATEGORY HTML / page elements (not found, not visible, etc)
вЂў URL http://127.0.0.1:3000/users/sign_in
```

For fewer than 5 failures, they are analyzed individually. If a visual recognition model is connected, AI will also scan screenshots to suggest potential failure causes (missing button, missing text, etc).

This plugin should be paired with the newly added [`pageInfo` plugin](/plugins#pageinfo) which stores important information like URL, console logs, and error classes for further analysis.

### рџ‘ЁвЂЌрџ’ј **autoLogin plugin** renamed to **auth plugin**

[`auth`](/plugins#auth) is the new name for the autoLogin plugin and aims to solve common authorization issues. In 3.7 it can use Playwright's storage state to load authorization cookies in a browser on start. So if a user is already authorized, a browser session starts with cookies already loaded for this user. If you use Playwright, you can enable this behavior using the `loginAs` method inside a `BeforeSuite` hook:

```js
BeforeSuite(({ loginAs }) => loginAs('user'))
```

The previous behavior where `loginAs` was called from a `Before` hook also works. However, cookie loading and authorization checking is performed after the browser starts.

#### Metadata introduced

Meta information in key-value format can be attached to Scenarios to provide more context when reporting tests:

```js
// add Jira issue to scenario
Scenario('...', () => {
  // ...
}).meta('JIRA', 'TST-123')

// or pass meta info in the beginning of scenario:
Scenario('my test linked to Jira', meta: { issue: 'TST-123' }, () => {
  // ...
})
```

By default, Playwright helpers add browser and window size as meta information to tests.

### рџ‘ў Custom Steps API

Custom Steps or Sections API introduced to group steps into sections:

```js
const { Section } = require('codeceptjs/steps');

Scenario({ I } => {
  I.amOnPage('/projects');

  // start section "Create project"
  Section('Create a project');
  I.click('Create');
  I.fillField('title', 'Project 123')
  I.click('Save')
  I.see('Project created')
  // calling Section with empty param closes previous section
  Section()

  // previous section automatically closes
  // when new section starts
  Section('open project')
  // ...
});
```

To hide steps inside a section from output use `Section().hidden()` call:

```js
Section('Create a project').hidden()
// next steps are not printed:
I.click('Create')
I.fillField('title', 'Project 123')
Section()
```

Alternative syntax for closing section: `EndSection`:

```js
const { Section, EndSection } = require('codeceptjs/steps');

// ...
Scenario(..., ({ I }) =>  // ...

  Section('Create a project').hidden()
  // next steps are not printed:
  I.click('Create');
  I.fillField('title', 'Project 123')
  EndSection()
```

Also available BDD-style pre-defined sections:

```js
const { Given, When, Then } = require('codeceptjs/steps');

// ...
Scenario(..., ({ I }) =>  // ...

  Given('I have a project')
  // next steps are not printed:
  I.click('Create');
  I.fillField('title', 'Project 123')

  When('I open project');
  // ...

  Then('I should see analytics in a project')
  //....
```

### рџҐѕ Step Options

Better syntax to set general step options for specific tests.

Use it to set timeout or retries for specific steps:

```js
const step = require('codeceptjs/steps');

Scenario(..., ({ I }) =>  // ...
  I.click('Create', step.timeout(10).retry(2));
  //....
```

Alternative syntax:

```js
const { stepTimeout, stepRetry } = require('codeceptjs/steps');

Scenario(..., ({ I }) =>  // ...
  I.click('Create', stepTimeout(10));
  I.see('Created', stepRetry(2));
  //....
```

This change deprecates previous syntax:

- `I.limitTime().act(...)` => replaced with `I.act(..., stepTimeout())`
- `I.retry().act(...)` => replaced with `I.act(..., stepRetry())`

Step options should be passed as the very last argument to `I.action()` call.

Step options can be used to pass additional options to currently existing methods:

```js
const { stepOpts } = require('codeceptjs/steps')

I.see('SIGN IN', stepOpts({ ignoreCase: true }))
```

Currently this works only on `see` and only with `ignoreCase` param.
However, this syntax will be extended in next versions.

### Test object can be injected into Scenario

API for direct access to test object inside Scenario or hooks to add metadata or artifacts:

```js
BeforeSuite(({ suite }) => {
  // no test object here, test is not created yet
})

Before(({ test }) => {
  // add artifact to test
  test.artifacts.myScreenshot = 'screenshot'
})

Scenario('test store-test-and-suite test', ({ test }) => {
  // add custom meta data
  test.meta.browser = 'chrome'
})

After(({ test }) => {})
```

Object for `suite` is also injected for all Scenario and hooks.

### Notable changes

- Load official Gherkin translations into CodeceptJS. See [#4784](https://github.com/codeceptjs/CodeceptJS/issues/4784) by **[ebo-zig](https://github.com/ebo-zig)**
- рџ‡ірџ‡± `NL` translation introduced by **[ebo-zig](https://github.com/ebo-zig)** in [#4784](https://github.com/codeceptjs/CodeceptJS/issues/4784):
- **[Playwright]** Improved experience to highlight and print elements in debug mode
- `codeceptjs run` fails on CI if no tests were executed. This helps to avoid false positive checks. Use `DONT_FAIL_ON_EMPTY_RUN` env variable to disable this behavior
- Various console output improvements
- AI suggested fixes from `heal` plugin (which heals failing tests on the fly) shown in `run-workers` command
- `plugin/standatdActingHelpers` replaced with `Container.STANDARD_ACTING_HELPERS`

### рџђ› _Bug Fixes_

- Fixed timeouts for `BeforeSuite` and `AfterSuite`
- Fixed stucking process on session switch

### рџЋ‡ Internal Refactoring

This section is listed briefly. A new dedicated page for internal API concepts will be added to documentation

- File structure changed:
  - mocha classes moved to `lib/mocha`
  - step is split to multiple classes and moved to `lib/step`
- Extended and exposed to public API classes for Test, Suite, Hook
  - [Test](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/mocha/test.js)
  - [Suite](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/mocha/suite.js)
  - [Hook](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/mocha/hooks.js) (Before, After, BeforeSuite, AfterSuite)
- Container:
  - refactored to be prepared for async imports in ESM.
  - added proxy classes to resolve circular dependencies
- Step
  - added different step types [`HelperStep`](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/step/helper.js), [`MetaStep`](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/step/meta.js), [`FuncStep`](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/step/func.js), [`CommentStep`](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/step/comment.js)
  - added `step.addToRecorder()` to schedule test execution as part of global promise chain
- [Result object](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/result.js) added
  - `event.all.result` now sends Result object with all failures and stats included
- `run-workers` refactored to use `Result` to send results from workers to main process
- Timeouts refactored `listener/timeout` => [`globalTimeout`](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/listener/globalTimeout.js)
- Reduced usages of global variables, more attributes added to [`store`](https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/store.js) to share data on current state between different parts of system
- `events` API improved
  - Hook class is sent as param for `event.hook.passed`, `event.hook.finished`
  - `event.test.failed`, `event.test.finished` always sends Test. If test has failed in `Before` or `BeforeSuite` hook, event for all failed test in this suite will be sent
  - if a test has failed in a hook, a hook name is sent as 3rd arg to `event.test.failed`

---

## 3.6.10

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџђ› _Bug Fixes_
fix(cli): missing failure counts when there is failedHooks ([#4633](https://github.com/codeceptjs/CodeceptJS/issues/4633)) - by **[kobenguyent](https://github.com/kobenguyent)**

## 3.6.9

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџђ› _Hot Fixes_
fix: could not run tests due to missing `invisi-data` lib - by **[kobenguyent](https://github.com/kobenguyent)**

## 3.6.8

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџ›©пёЏ _Features_

- feat(cli): mask sensitive data in logs ([#4630](https://github.com/codeceptjs/CodeceptJS/issues/4630)) - by **[kobenguyent](https://github.com/kobenguyent)**

```
export const config: CodeceptJS.MainConfig = {
  tests:  '**/*.e2e.test.ts',
  retry: 4,
  output: './output',
  maskSensitiveData: true,
  emptyOutputFolder: true,
...

    I login {"username":"helloworld@test.com","password": "****"}
      I send post request "https://localhost:8000/login", {"username":"helloworld@test.com","password": "****"}
      вЂє **[Request]** {"baseURL":"https://localhost:8000/login","method":"POST","data":{"username":"helloworld@test.com","password": "****"},"headers":{}}
      вЂє **[Response]** {"access-token": "****"}
```

- feat(REST): DELETE request supports payload ([#4493](https://github.com/codeceptjs/CodeceptJS/issues/4493)) - by **[schaudhary111](https://github.com/schaudhary111)**

```js
I.sendDeleteRequestWithPayload('/api/users/1', { author: 'john' })
```

рџђ› _Bug Fixes_

- fix(playwright): Different behavior of see* and waitFor* when used in within ([#4557](https://github.com/codeceptjs/CodeceptJS/issues/4557)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix(cli): dry run returns no tests when using a regex grep ([#4608](https://github.com/codeceptjs/CodeceptJS/issues/4608)) - by **[kobenguyent](https://github.com/kobenguyent)**

```bash
> codeceptjs dry-run --steps --grep "(?=.*Checkout process)"
```

- fix: Replace deprecated faker.name with faker.person ([#4581](https://github.com/codeceptjs/CodeceptJS/issues/4581)) - by **[thomashohn](https://github.com/thomashohn)**
- fix(wdio): Remove dependency to devtools ([#4563](https://github.com/codeceptjs/CodeceptJS/issues/4563)) - by **[thomashohn](https://github.com/thomashohn)**
- fix(typings): wrong defineParameterType ([#4548](https://github.com/codeceptjs/CodeceptJS/issues/4548)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix(typing): `Locator.build` complains the empty locator ([#4543](https://github.com/codeceptjs/CodeceptJS/issues/4543)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix: add hint to `I.seeEmailAttachment` treats parameter as regular expression ([#4629](https://github.com/codeceptjs/CodeceptJS/issues/4629)) - by **[ngraf](https://github.com/ngraf)**

```
Add hint to "I.seeEmailAttachment" that under the hood parameter is treated as RegExp.
When you don't know it, it can cause a lot of pain, wondering why your test fails with I.seeEmailAttachment('Attachment(1).pdf') although it looks just fine, but actually I.seeEmailAttachment('Attachment\\(1\\).pdf is required to make the test green, in case the attachment is called "Attachment(1).pdf" with special character in it.
```

- fix(playwright): waitForText fails when text contains double quotes ([#4528](https://github.com/codeceptjs/CodeceptJS/issues/4528)) - by **[DavertMik](https://github.com/DavertMik)**
- fix(mock-server-helper): move to stand-alone package: https://www.npmjs.com/package/@codeceptjs/mock-server-helper ([#4536](https://github.com/codeceptjs/CodeceptJS/issues/4536)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix(appium): issue with async on runOnIos and runOnAndroid ([#4525](https://github.com/codeceptjs/CodeceptJS/issues/4525)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix: push ws messages to array ([#4513](https://github.com/codeceptjs/CodeceptJS/issues/4513)) - by **[kobenguyent](https://github.com/kobenguyent)**

рџ“– _Documentation_

- fix(docs): typo in ai.md ([#4501](https://github.com/codeceptjs/CodeceptJS/issues/4501)) - by **[tomaculum](https://github.com/tomaculum)**

## 3.6.6

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџ›©пёЏ _Features_

- feat(locator): add withAttrEndsWith, withAttrStartsWith, withAttrContains ([#4334](https://github.com/codeceptjs/CodeceptJS/issues/4334)) - by **[Maksym-Artemenko](https://github.com/Maksym-Artemenko)**
- feat: soft assert ([#4473](https://github.com/codeceptjs/CodeceptJS/issues/4473)) - by **[kobenguyent](https://github.com/kobenguyent)**
  - Soft assert

Zero-configuration when paired with other helpers like REST, Playwright:

```js
// inside codecept.conf.js
{
  helpers: {
    Playwright: {...},
    SoftExpectHelper: {},
  }
}
```

```js
// in scenario
I.softExpectEqual('a', 'b')
I.flushSoftAssertions() // Throws an error if any soft assertions have failed. The error message contains all the accumulated failures.
```

- feat(cli): print failed hooks ([#4476](https://github.com/codeceptjs/CodeceptJS/issues/4476)) - by **[kobenguyent](https://github.com/kobenguyent)**
  - run command
    ![Screenshot 2024-09-02 at 15 25 20](https://github.com/user-attachments/assets/625c6b54-03f6-41c6-9d0c-cd699582404a)

  - run workers command
    ![Screenshot 2024-09-02 at 15 24 53](https://github.com/user-attachments/assets/efff0312-1229-44b6-a94f-c9b9370b9a64)

рџђ› _Bug Fixes_

- fix(AI): minor AI improvements - by **[DavertMik](https://github.com/DavertMik)**
- fix(AI): add missing await in AI.js ([#4486](https://github.com/codeceptjs/CodeceptJS/issues/4486)) - by **[tomaculum](https://github.com/tomaculum)**
- fix(playwright): no async save video page ([#4472](https://github.com/codeceptjs/CodeceptJS/issues/4472)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix(rest): httpAgent condition ([#4484](https://github.com/codeceptjs/CodeceptJS/issues/4484)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix: DataCloneError error when `I.executeScript` command is used with `run-workers` ([#4483](https://github.com/codeceptjs/CodeceptJS/issues/4483)) - by **[code4muktesh](https://github.com/code4muktesh)**
- fix: no error thrown from rerun script ([#4494](https://github.com/codeceptjs/CodeceptJS/issues/4494)) - by **[lin-brian-l](https://github.com/lin-brian-l)**

```js
// fix the validation of httpAgent config. we could now pass ca, instead of key/cert.
{
  helpers: {
    REST: {
      endpoint: 'http://site.com/api',
      prettyPrintJson: true,
      httpAgent: {
         ca: fs.readFileSync(__dirname + '/path/to/ca.pem'),
         rejectUnauthorized: false,
         keepAlive: true
      }
    }
  }
}
```

рџ“– _Documentation_

- doc(AI): minor AI improvements - by **[DavertMik](https://github.com/DavertMik)**

## 3.6.5

вќ¤пёЏ Thanks all to those who contributed to make this release! вќ¤пёЏ

рџ›©пёЏ _Features_

- feat(helper): playwright > wait for disabled ([#4412](https://github.com/codeceptjs/CodeceptJS/issues/4412)) - by **[kobenguyent](https://github.com/kobenguyent)**

```
it('should wait for input text field to be disabled', () =>
      I.amOnPage('/form/wait_disabled').then(() => I.waitForDisabled('#text', 1)))

    it('should wait for input text field to be enabled by xpath', () =>
      I.amOnPage('/form/wait_disabled').then(() => I.waitForDisabled("//*[@name = 'test']", 1)))

    it('should wait for a button to be disabled', () =>
      I.amOnPage('/form/wait_disabled').then(() => I.waitForDisabled('#text', 1)))

Waits for element to become disabled (by default waits for 1sec).
Element can be located by CSS or XPath.
 **[param](https://github.com/param)** {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator. **[param](https://github.com/param)** {number} [sec=1] (optional) time in seconds to wait, 1 by default. **[returns](https://github.com/returns)** {void} automatically synchronized promise through #recorder
```

рџђ› _Bug Fixes_

- fix(AI): AI is not triggered ([#4422](https://github.com/codeceptjs/CodeceptJS/issues/4422)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix(plugin): stepByStep > report doesn't sync properly ([#4413](https://github.com/codeceptjs/CodeceptJS/issues/4413)) - by **[kobenguyent](https://github.com/kobenguyent)**
- fix: Locator > Unsupported pseudo selector 'has' ([#4448](https://github.com/codeceptjs/CodeceptJS/issues/4448)) - by **[anils92](https://github.com/anils92)**

рџ“– _Documentation_

- docs: setup azure open ai using bearer token ([#4434](https://github.com/codeceptjs/CodeceptJS/issues/4434)) - by **[kobenguyent](https://github.com/kobenguyent)**
