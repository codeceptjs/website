---
title: Best Practices
---


## Focus on Readability

In CodeceptJS we encourage users to follow semantic elements on page while writing tests.
Instead of CSS/XPath locators try to stick to visible keywords on page.

Take a look into the next example:

```js
// it's fine but...
I.click({css: 'nav.user .user-login'});
// can be better
I.click('Login', 'nav.user');
// or by ARIA label
I.click({ aria: 'Login' });
```

If we replace raw CSS selector with a button title we can improve readability of such test.
Even if the text on the button changes, it's much easier to update it.

> If your code goes beyond using `I` object or page objects, you are probably doing something wrong.

When it's hard to match text to element we recommend using [locator builder](/locators#locator-builder). It allows to build complex locators via fluent API.
So if you want to click an element which is not a button or a link and use its text you can use `locate()` to build a readable locator:

```js
// clicks element <span class="button">Click me</span>
I.click(locate('.button').withText('Click me'));
```

## Short Cuts

To write simpler and effective tests we encourage to use short cuts.
Make test be focused on one feature and try to simplify everything that is not related directly to test.

* If data is required for a test, try to create that data via API. See how to do it in [Data Management](/data) chapter.
* If user login is required, use [auth plugin](/plugins#auth) instead of putting login steps inside a test.
* Break a long test into few. Long test can be fragile and complicated to follow and update.
* Use [custom steps and page objects](/pageobjects) to hide steps which are not relevant to current test.

Make test as simple as:

```js
Scenario('editing a metric', async ({ I, loginAs, metricPage }) => {
  // login via auth plugin
  loginAs('admin');
  // create data with ApiDataFactory
  const metric = await I.have('metric', { type: 'memory', duration: 'day' })
  // use page object to open a page
  metricPage.open(metric.id);
  I.click('Edit');
  I.see('Editing Metric');
  // using a custom step
  I.selectFromDropdown('duration', 'week');
  I.click('Save');
  I.see('Duration: Week', '.summary');
});
```
## Locators

Keep this section as a checklist and use [Locators](/locators) as a full reference:

* Prefer readable semantic locators first (text, labels, ARIA).
* Use strict locators (`{ css: '...' }`, `{ xpath: '...' }`) when you need precision and speed.
* For accessibility-aware UIs, prefer ARIA locators, e.g. `{ aria: 'Submit' }`.
* If your app uses stable test attributes (`data-test`, `data-qa`), configure [customLocator plugin](/plugins#customlocator).
* Keep locator strategy consistent across the project.

## Page Objects

When a project grows, move reusable actions out of scenarios.
This page keeps only the rules of thumb. Full patterns and examples are in [Page Objects](/pageobjects).

Recommended split:

* Move site-wide actions into Actor (`custom_steps.*`), e.g. login or common widgets.
* Move page-level actions and selectors into page objects.
* Move reusable widgets (modals, nav, dropdowns) into page fragments/components.
* Keep low-level driver/service operations in custom helpers.

Practical rules:

* Use page objects to store common actions only.
* Do not create page objects for every page by default.
* Prefer classes for page objects/fragments when inheritance is needed.
* Avoid overengineering: if a flow is used once, keep it in the test.

## Configuration

* create multiple config files for different setups/environments:
  * `codecept.conf.js` - default one
  * `codecept.ci.conf.js` - for CI
  * `codecept.windows.conf.js` - for Windows, etc
* use `.env` files and dotenv package to load sensitive data

```js
require('dotenv').config({ path: '.env' });
```

* move similar parts in those configs by moving them to modules and putting them to `config` dir
* when you need to load lots of page objects/components, you can get components/pageobjects file declaring them:

```js
// inside config/components.js
module.exports = {
    DatePicker: "./components/datePicker",
    Dropdown: "./components/dropdown",
}
```

include them like this:

```js
  include: {
      I: './steps_file',
      ...require('./config/pages'), // require POs and DOs for module
      ...require('./config/components'), // require all components
  },
```

* move long helpers configuration into `config/plugins.js` and export them
* inside config files import the exact helpers or plugins needed for this setup & environment
* to pass in data from config to a test use a container:

```js
// inside codecept conf file
bootstrap: () => {
  codeceptjs.container.append({
    testUser: {
      email: 'test@test.com',
      password: '123456'
    }
  });
}
// now `testUser` can be injected into a test
```
* (alternatively) if you have more test data to pass into tests, create a separate file for them and import them similarly to page object:

```js
include: {
  // ...
  testData: './config/testData'

}
```
* .env / different configs / different test data allows you to get configs for multiple environments

## Data Access Objects

* Concept is similar to page objects but Data access objects can act like factories or data providers for tests
* Data Objects require REST or GraphQL helpers to be enabled for data interaction
* When you need to customize access to API and go beyond what ApiDataFactory provides, implement DAO:

```js
const { faker } = require('@faker-js/faker');
const { I } = inject();
const { output } = require('codeceptjs');

class InterfaceData {

  async getLanguages() {
      const { data } = await I.sendGetRequest('/api/languages');
      const { records } = data;
      output.debug(`Languages ${records.map(r => r.language)}`);
      return records;
  }

  async getUsername() {
    return faker.user.name();
  }
}

module.exports = new InterfaceData;
```
